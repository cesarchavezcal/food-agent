import { z } from "zod";
import { db } from "../db/client.js";
import { dailyLogs } from "../db/schema.js";
import { getGramsForPortion } from "./getGramsForPortion.js";
import { type CachedFood } from "./cache.js";

export const logFoodSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe("Fecha en formato YYYY-MM-DD"),
  meal: z.string().describe("Tiempo de comida (ej. desayuno, almuerzo, comida, cena, colacion_1, colacion_2)"),
  foodName: z.string().min(1).describe("Nombre del alimento consumido"),
  grams: z.number().positive().describe("Gramos consumidos estrictamente en gramos"),
});

export type LogFoodInput = z.infer<typeof logFoodSchema>;

export interface LogFoodResult {
  logId: string;
  date: string;
  meal: string;
  foodName: string;
  grams: number;
  groupId: string;
  equivalentesCovered: number;
  macros: {
    kcal: number;
    proteinG: number;
    fatG: number;
    choG: number;
  };
}

export async function logFood(
  input: LogFoodInput,
  mockCatalog?: CachedFood[],
  mockLogStore?: typeof dailyLogs.$inferInsert[]
): Promise<LogFoodResult | null> {
  const { date, meal, foodName, grams } = logFoodSchema.parse(input);

  const baseFood = await getGramsForPortion({ foodName, nEquivalentes: 1 }, mockCatalog);
  if (!baseFood) {
    return null;
  }

  const equivalentesCovered = Number((grams / baseFood.gramsPerEquivalent).toFixed(2));
  const computedMacros = {
    kcal: Number((baseFood.macros.kcal * (grams / baseFood.totalGrams)).toFixed(1)),
    proteinG: Number((baseFood.macros.proteinG * (grams / baseFood.totalGrams)).toFixed(1)),
    fatG: Number((baseFood.macros.fatG * (grams / baseFood.totalGrams)).toFixed(1)),
    choG: Number((baseFood.macros.choG * (grams / baseFood.totalGrams)).toFixed(1)),
  };

  const computedEquivalents: Record<string, number> = {
    [baseFood.groupId]: equivalentesCovered,
  };

  const logId = `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const logRecord = {
    id: logId,
    logDate: date,
    mealType: meal.toLowerCase(),
    foodId: baseFood.groupId,
    foodName: baseFood.matchedName,
    grams,
    computedEquivalents,
    computedMacros,
  };

  if (mockLogStore) {
    mockLogStore.push(logRecord);
  } else if (db) {
    await db.insert(dailyLogs).values({
      ...logRecord,
      foodId: null, // User quick logs might not reference foreign key
    });
  }

  return {
    logId,
    date,
    meal: meal.toLowerCase(),
    foodName: baseFood.matchedName,
    grams,
    groupId: baseFood.groupId,
    equivalentesCovered,
    macros: computedMacros,
  };
}
