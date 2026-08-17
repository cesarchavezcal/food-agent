import { z } from "zod";
import { db } from "../db/client.js";
import { foods } from "../db/schema.js";
import { foodCache, type CachedFood } from "./cache.js";

export const logNutritionFactsSchema = z.object({
  foodName: z.string().min(1).describe("Nombre del alimento o producto comercial"),
  protein100g: z.number().min(0).describe("Gramos de proteína por cada 100g"),
  fat100g: z.number().min(0).describe("Gramos de lípidos/grasas por cada 100g"),
  carbs100g: z.number().min(0).describe("Gramos de hidratos de carbono (carbohidratos) por cada 100g"),
  kcal100g: z.number().min(0).optional().describe("Energía total en kcal por cada 100g (opcional)"),
});

export type LogNutritionFactsInput = z.infer<typeof logNutritionFactsSchema>;

export interface CompositeEquivalentBreakdown {
  cerealEquivalentsPer100g: number; // 15g CHO = 1 eq
  aoaEquivalentsPer100g: number;    // 7g Prot = 1 eq
  fatEquivalentsPer100g: number;    // 5g Lip = 1 eq
}

export interface LogNutritionFactsResult {
  foodName: string;
  foodId: string;
  macrosPer100g: {
    kcal: number;
    proteinG: number;
    fatG: number;
    choG: number;
  };
  compositeEquivalentsPer100g: CompositeEquivalentBreakdown;
  primaryGroupId: string;
  gramsPerPrimaryEquivalent: number;
}

export function solveCompositeEquivalents(protein100g: number, fat100g: number, carbs100g: number): CompositeEquivalentBreakdown {
  return {
    cerealEquivalentsPer100g: Number((carbs100g / 15).toFixed(2)),
    aoaEquivalentsPer100g: Number((protein100g / 7).toFixed(2)),
    fatEquivalentsPer100g: Number((fat100g / 5).toFixed(2)),
  };
}

export async function logNutritionFacts(
  input: LogNutritionFactsInput,
  mockStore?: CachedFood[]
): Promise<LogNutritionFactsResult> {
  const parsed = logNutritionFactsSchema.parse(input);
  const { foodName, protein100g, fat100g, carbs100g } = parsed;
  const calculatedKcal = parsed.kcal100g ?? Number((protein100g * 4 + carbs100g * 4 + fat100g * 9).toFixed(1));

  const composite = solveCompositeEquivalents(protein100g, fat100g, carbs100g);

  // Determine primary group by dominant macro
  let primaryGroupId = "cereales_sin_grasa";
  let gramsPerPrimaryEquivalent = 100;

  if (protein100g >= carbs100g && protein100g >= fat100g && protein100g > 0) {
    primaryGroupId = fat100g > 5 ? "aoa_moderado_grasa" : "aoa_muy_bajo_grasa";
    gramsPerPrimaryEquivalent = Number((700 / protein100g).toFixed(1)); // 7g Prot
  } else if (carbs100g >= protein100g && carbs100g >= fat100g && carbs100g > 0) {
    primaryGroupId = fat100g > 4 ? "cereales_con_grasa" : "cereales_sin_grasa";
    gramsPerPrimaryEquivalent = Number((1500 / carbs100g).toFixed(1)); // 15g CHO
  } else if (fat100g > 0) {
    primaryGroupId = "aceites_y_grasas";
    gramsPerPrimaryEquivalent = Number((500 / fat100g).toFixed(1)); // 5g Lip
  }

  const foodId = `user_${foodName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

  const cachedFood: CachedFood = {
    id: foodId,
    name: foodName,
    groupId: primaryGroupId,
    gramsPerEquivalent: gramsPerPrimaryEquivalent,
    kcal100g: calculatedKcal,
    protein100g,
    fat100g,
    cho100g: carbs100g,
  };

  // Update in-memory cache & invalidate prior query
  foodCache.set(foodName, cachedFood);

  if (mockStore) {
    mockStore.push(cachedFood);
  }

  // Insert or update in database if available
  if (db) {
    await db.insert(foods).values({
      id: foodId,
      name: foodName,
      groupId: primaryGroupId,
      gramsPerEquivalent: gramsPerPrimaryEquivalent,
      kcal100g: calculatedKcal,
      protein100g,
      fat100g,
      cho100g: carbs100g,
      source: "user",
    }).onConflictDoUpdate({
      target: foods.id,
      set: {
        name: foodName,
        gramsPerEquivalent: gramsPerPrimaryEquivalent,
        kcal100g: calculatedKcal,
        protein100g,
        fat100g,
        cho100g: carbs100g,
      },
    });
  }

  return {
    foodName,
    foodId,
    macrosPer100g: {
      kcal: calculatedKcal,
      proteinG: protein100g,
      fatG: fat100g,
      choG: carbs100g,
    },
    compositeEquivalentsPer100g: composite,
    primaryGroupId,
    gramsPerPrimaryEquivalent,
  };
}
