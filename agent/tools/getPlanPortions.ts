import { z } from "zod";
import { db } from "../db/client.js";
import { plans, weeklySchedule } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const getPlanPortionsSchema = z.object({
  planName: z.string().optional().describe("Nombre del plan (ej. 'ALTA DEMANDA', 'MEDIA', 'DESCANSO'). Si se omite, se infiere del calendario"),
  meal: z.string().optional().describe("Tiempo de comida específico (ej. almuerzo, colacion_1, comida, cena)"),
  date: z.string().optional().describe("Fecha en formato YYYY-MM-DD para inferir el día de la semana"),
});

export type GetPlanPortionsInput = z.infer<typeof getPlanPortionsSchema>;

export interface GetPlanPortionsResult {
  planName: string;
  meal?: string;
  dayOfWeek?: string;
  portions: Record<string, number>;
  dailyTotal: Record<string, number>;
  byMeal: Record<string, Record<string, number>>;
}

const DEFAULT_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export async function getPlanPortions(
  input: GetPlanPortionsInput,
  mockPlans?: typeof plans.$inferSelect[],
  mockSchedule?: typeof weeklySchedule.$inferSelect[]
): Promise<GetPlanPortionsResult> {
  const { meal, date } = getPlanPortionsSchema.parse(input);
  let resolvedPlanName = input.planName;

  // 1. If planName is omitted, auto-resolve from date / today's day of week
  let dayOfWeekName: string | undefined;
  if (!resolvedPlanName) {
    let targetDate: Date;
    if (date && date.includes("-")) {
      const [y, m, d] = date.split("-").map(Number);
      targetDate = new Date(y, m - 1, d);
    } else {
      targetDate = new Date();
    }
    dayOfWeekName = DEFAULT_DAYS[targetDate.getDay()];

    if (mockSchedule) {
      const match = mockSchedule.find((s) => s.dayOfWeek.toLowerCase() === dayOfWeekName);
      resolvedPlanName = match?.planName || "ALTA DEMANDA";
    } else if (db) {
      const schedResults = await db
        .select()
        .from(weeklySchedule)
        .where(eq(weeklySchedule.dayOfWeek, dayOfWeekName))
        .limit(1);
      resolvedPlanName = schedResults[0]?.planName || "ALTA DEMANDA";
    } else {
      resolvedPlanName = "ALTA DEMANDA";
    }
  }

  // 2. Query plan portions
  const portions: Record<string, number> = {};
  const dailyTotal: Record<string, number> = {};
  const byMeal: Record<string, Record<string, number>> = {};

  if (mockPlans) {
    const matches = mockPlans.filter((p) => p.planName.toLowerCase() === resolvedPlanName?.toLowerCase());

    for (const p of matches) {
      dailyTotal[p.groupId] = (dailyTotal[p.groupId] || 0) + p.equivalentes;

      if (!byMeal[p.meal]) byMeal[p.meal] = {};
      byMeal[p.meal][p.groupId] = (byMeal[p.meal][p.groupId] || 0) + p.equivalentes;

      if (!meal || p.meal.toLowerCase() === meal.toLowerCase() || p.meal === "daily") {
        portions[p.groupId] = (portions[p.groupId] || 0) + p.equivalentes;
      }
    }
  } else if (db) {
    const allRows = await db
      .select()
      .from(plans)
      .where(eq(plans.planName, resolvedPlanName!));

    for (const row of allRows) {
      dailyTotal[row.groupId] = (dailyTotal[row.groupId] || 0) + row.equivalentes;

      if (!byMeal[row.meal]) byMeal[row.meal] = {};
      byMeal[row.meal][row.groupId] = (byMeal[row.meal][row.groupId] || 0) + row.equivalentes;

      if (!meal || row.meal.toLowerCase() === meal.toLowerCase() || row.meal === "daily") {
        portions[row.groupId] = (portions[row.groupId] || 0) + row.equivalentes;
      }
    }
  }

  function cleanSparse(obj: Record<string, number>): Record<string, number> {
    const res: Record<string, number> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (v > 0) res[k] = v;
    }
    return res;
  }

  const sparseByMeal: Record<string, Record<string, number>> = {};
  for (const [m, groupMap] of Object.entries(byMeal)) {
    const cleaned = cleanSparse(groupMap);
    if (Object.keys(cleaned).length > 0) {
      sparseByMeal[m] = cleaned;
    }
  }

  return {
    planName: resolvedPlanName || "ALTA DEMANDA",
    meal,
    dayOfWeek: dayOfWeekName,
    portions: cleanSparse(portions),
    dailyTotal: cleanSparse(dailyTotal),
    byMeal: sparseByMeal,
  };
}
