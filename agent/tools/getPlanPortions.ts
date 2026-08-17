import { z } from "zod";
import { db } from "../db/client.js";
import { plans, weeklySchedule } from "../db/schema.js";
import { eq, and } from "drizzle-orm";

export const getPlanPortionsSchema = z.object({
  planName: z.string().optional().describe("Nombre del plan (ej. leg day, cardio, rest day). Si se omite, se infiere del calendario"),
  meal: z.string().optional().describe("Tiempo de comida (ej. desayuno, comida, cena, colacion_1)"),
  date: z.string().optional().describe("Fecha en formato YYYY-MM-DD para inferir el día de la semana"),
});

export type GetPlanPortionsInput = z.infer<typeof getPlanPortionsSchema>;

export interface PlanPortionEntry {
  groupId: string;
  equivalentes: number;
}

export interface GetPlanPortionsResult {
  planName: string;
  meal?: string;
  dayOfWeek?: string;
  portions: Record<string, number>; // { [groupId]: number of equivalents }
}

const DEFAULT_DAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export async function getPlanPortions(
  input: GetPlanPortionsInput,
  mockPlans?: typeof plans.$inferSelect[],
  mockSchedule?: typeof weeklySchedule.$inferSelect[]
): Promise<GetPlanPortionsResult> {
  const { meal, date } = getPlanPortionsSchema.parse(input);
  let planName = input.planName;

  // 1. If planName is omitted, auto-resolve from date / today's day of week
  let dayOfWeekName: string | undefined;
  if (!planName) {
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
      planName = match?.planName || "default";
    } else if (db) {
      const schedResults = await db
        .select()
        .from(weeklySchedule)
        .where(eq(weeklySchedule.dayOfWeek, dayOfWeekName))
        .limit(1);
      planName = schedResults[0]?.planName || "default";
    } else {
      planName = "default";
    }
  }

  // 2. Query plan portions
  const portions: Record<string, number> = {};

  if (mockPlans) {
    const matches = mockPlans.filter((p) => {
      const matchPlan = p.planName.toLowerCase() === planName?.toLowerCase();
      const matchMeal = meal ? p.meal.toLowerCase() === meal.toLowerCase() : true;
      return matchPlan && matchMeal;
    });

    for (const p of matches) {
      portions[p.groupId] = (portions[p.groupId] || 0) + p.equivalentes;
    }
  } else if (db) {
    const queryConditions = [eq(plans.planName, planName)];
    if (meal) {
      queryConditions.push(eq(plans.meal, meal));
    }

    const planRows = await db
      .select()
      .from(plans)
      .where(and(...queryConditions));

    for (const row of planRows) {
      portions[row.groupId] = (portions[row.groupId] || 0) + row.equivalentes;
    }
  }

  return {
    planName,
    meal,
    dayOfWeek: dayOfWeekName,
    portions,
  };
}
