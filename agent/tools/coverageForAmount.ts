import { z } from "zod";
import { getGramsForPortion } from "./getGramsForPortion.js";
import { type CachedFood } from "./cache.js";

export const coverageForAmountSchema = z.object({
  foodName: z.string().min(1).describe("Nombre del alimento (ej. pechuga de pollo, avena, manzana)"),
  grams: z.number().positive().describe("Gramos consumidos o a calcular"),
});

export type CoverageForAmountInput = z.infer<typeof coverageForAmountSchema>;

export interface CoverageForAmountResult {
  foodName: string;
  matchedName: string;
  groupId: string;
  grams: number;
  equivalentesCovered: number;
  macrosCovered: {
    kcal: number;
    proteinG: number;
    fatG: number;
    choG: number;
  };
}

export async function coverageForAmount(
  input: CoverageForAmountInput,
  mockCatalog?: CachedFood[]
): Promise<CoverageForAmountResult | null> {
  const { foodName, grams } = coverageForAmountSchema.parse(input);

  // Lookup food portion (using cache or db)
  const baseResult = await getGramsForPortion({ foodName, nEquivalentes: 1 }, mockCatalog);
  if (!baseResult) {
    return null;
  }

  const equivalentesCovered = Number((grams / baseResult.gramsPerEquivalent).toFixed(2));
  // Calculate macros based on 100g density
  const macrosCovered = {
    kcal: Number((baseResult.macros.kcal * (grams / baseResult.totalGrams)).toFixed(1)),
    proteinG: Number((baseResult.macros.proteinG * (grams / baseResult.totalGrams)).toFixed(1)),
    fatG: Number((baseResult.macros.fatG * (grams / baseResult.totalGrams)).toFixed(1)),
    choG: Number((baseResult.macros.choG * (grams / baseResult.totalGrams)).toFixed(1)),
  };

  return {
    foodName,
    matchedName: baseResult.matchedName,
    groupId: baseResult.groupId,
    grams,
    equivalentesCovered,
    macrosCovered,
  };
}
