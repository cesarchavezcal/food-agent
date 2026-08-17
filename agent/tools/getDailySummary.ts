import { z } from "zod";
import { db } from "../db/client.js";
import { dailyLogs } from "../db/schema.js";
import { getPlanPortions } from "./getPlanPortions.js";
import { eq, and } from "drizzle-orm";

export const getDailySummarySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Fecha a consultar en formato YYYY-MM-DD"),
  meal: z.string().optional().describe("Tiempo de comida específico a resumir (opcional, si se omite resume todo el día)"),
  planName: z.string().optional().describe("Nombre del plan a comparar (si se omite, se infiere del calendario semanal)"),
});

export type GetDailySummaryInput = z.infer<typeof getDailySummarySchema>;

export interface EquivalentDiff {
  groupId: string;
  planned: number;
  consumed: number;
  remaining: number;
}

export interface DailySummaryResult {
  date: string;
  meal?: string;
  planName: string;
  totalMacrosConsumed: {
    kcal: number;
    proteinG: number;
    fatG: number;
    choG: number;
  };
  totalEquivalentsConsumed: Record<string, number>;
  plannedEquivalents: Record<string, number>;
  diff: EquivalentDiff[];
  itemsLoggedCount: number;
}

export async function getDailySummary(
  input: GetDailySummaryInput,
  mockLogs?: typeof dailyLogs.$inferSelect[],
  mockPlans?: any[],
  mockSchedule?: any[]
): Promise<DailySummaryResult> {
  const { date, meal, planName } = getDailySummarySchema.parse(input);

  // 1. Get planned targets
  const planInfo = await getPlanPortions({ planName, meal, date }, mockPlans, mockSchedule);

  // 2. Query consumed logs
  let logsForDay: { computedEquivalents: Record<string, number>; computedMacros: { kcal: number; proteinG: number; fatG: number; choG: number } }[] = [];

  if (mockLogs) {
    logsForDay = mockLogs
      .filter((l) => l.logDate === date && (meal ? l.mealType.toLowerCase() === meal.toLowerCase() : true))
      .map((l) => ({
        computedEquivalents: (l.computedEquivalents as Record<string, number>) || {},
        computedMacros: (l.computedMacros as { kcal: number; proteinG: number; fatG: number; choG: number }) || { kcal: 0, proteinG: 0, fatG: 0, choG: 0 },
      }));
  } else if (db) {
    const conditions = [eq(dailyLogs.logDate, date)];
    if (meal) {
      conditions.push(eq(dailyLogs.mealType, meal.toLowerCase()));
    }

    const rows = await db
      .select()
      .from(dailyLogs)
      .where(and(...conditions));

    logsForDay = rows.map((r) => ({
      computedEquivalents: (r.computedEquivalents as Record<string, number>) || {},
      computedMacros: (r.computedMacros as { kcal: number; proteinG: number; fatG: number; choG: number }) || { kcal: 0, proteinG: 0, fatG: 0, choG: 0 },
    }));
  }

  // 3. Aggregate totals
  const totalMacrosConsumed = { kcal: 0, proteinG: 0, fatG: 0, choG: 0 };
  const totalEquivalentsConsumed: Record<string, number> = {};

  for (const item of logsForDay) {
    totalMacrosConsumed.kcal += item.computedMacros.kcal || 0;
    totalMacrosConsumed.proteinG += item.computedMacros.proteinG || 0;
    totalMacrosConsumed.fatG += item.computedMacros.fatG || 0;
    totalMacrosConsumed.choG += item.computedMacros.choG || 0;

    for (const [grp, eqVal] of Object.entries(item.computedEquivalents)) {
      totalEquivalentsConsumed[grp] = Number(((totalEquivalentsConsumed[grp] || 0) + eqVal).toFixed(2));
    }
  }

  // Round macro sums
  totalMacrosConsumed.kcal = Number(totalMacrosConsumed.kcal.toFixed(1));
  totalMacrosConsumed.proteinG = Number(totalMacrosConsumed.proteinG.toFixed(1));
  totalMacrosConsumed.fatG = Number(totalMacrosConsumed.fatG.toFixed(1));
  totalMacrosConsumed.choG = Number(totalMacrosConsumed.choG.toFixed(1));

  // 4. Calculate diff
  const allGroupKeys = new Set([...Object.keys(planInfo.portions), ...Object.keys(totalEquivalentsConsumed)]);
  const diff: EquivalentDiff[] = [];

  for (const grp of allGroupKeys) {
    const planned = planInfo.portions[grp] || 0;
    const consumed = totalEquivalentsConsumed[grp] || 0;
    const remaining = Number((planned - consumed).toFixed(2));

    diff.push({
      groupId: grp,
      planned,
      consumed,
      remaining,
    });
  }

  return {
    date,
    meal,
    planName: planInfo.planName,
    totalMacrosConsumed,
    totalEquivalentsConsumed,
    plannedEquivalents: planInfo.portions,
    diff,
    itemsLoggedCount: logsForDay.length,
  };
}
