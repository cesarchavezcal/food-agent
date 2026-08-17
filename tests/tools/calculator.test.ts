import { describe, it, expect, beforeEach } from "vitest";
import { getGramsForPortion } from "../../agent/tools/getGramsForPortion.js";
import { coverageForAmount } from "../../agent/tools/coverageForAmount.js";
import { logNutritionFacts, solveCompositeEquivalents } from "../../agent/tools/logNutritionFacts.js";
import { foodCache, type CachedFood } from "../../agent/tools/cache.js";

describe("Deterministic Calculator Tools", () => {
  const mockCatalog: CachedFood[] = [
    {
      id: "arroz",
      name: "Arroz blanco cocido",
      groupId: "cereales_sin_grasa",
      gramsPerEquivalent: 47,
      kcal100g: 130,
      protein100g: 2.7,
      fat100g: 0.3,
      cho100g: 28,
    },
    {
      id: "pollo",
      name: "Pechuga de pollo cocida",
      groupId: "aoa_muy_bajo_grasa",
      gramsPerEquivalent: 30,
      kcal100g: 165,
      protein100g: 31,
      fat100g: 3.6,
      cho100g: 0,
    },
  ];

  beforeEach(() => {
    foodCache.invalidate();
  });

  describe("getGramsForPortion", () => {
    it("should calculate exact grams for 1 equivalent", async () => {
      const result = await getGramsForPortion({ foodName: "arroz", nEquivalentes: 1 }, mockCatalog);
      expect(result).not.toBeNull();
      expect(result?.totalGrams).toBe(47);
      expect(result?.groupId).toBe("cereales_sin_grasa");
    });

    it("should scale grams proportionally for N equivalents", async () => {
      const result = await getGramsForPortion({ foodName: "pollo", nEquivalentes: 2.5 }, mockCatalog);
      expect(result).not.toBeNull();
      expect(result?.totalGrams).toBe(75); // 30 * 2.5
    });

    it("should return null for unknown foods", async () => {
      const result = await getGramsForPortion({ foodName: "nonexistent_food_xyz" }, mockCatalog);
      expect(result).toBeNull();
    });
  });

  describe("coverageForAmount", () => {
    it("should calculate equivalents covered by specified grams", async () => {
      const result = await coverageForAmount({ foodName: "arroz", grams: 94 }, mockCatalog);
      expect(result).not.toBeNull();
      expect(result?.equivalentesCovered).toBe(2); // 94 / 47 = 2
      expect(result?.macrosCovered.kcal).toBeGreaterThan(0);
    });

    it("should handle fractional equivalents accurately", async () => {
      const result = await coverageForAmount({ foodName: "pollo", grams: 45 }, mockCatalog);
      expect(result).not.toBeNull();
      expect(result?.equivalentesCovered).toBe(1.5); // 45 / 30 = 1.5
    });
  });

  describe("logNutritionFacts & solveCompositeEquivalents", () => {
    it("should solve composite equivalents using canonical SMAE macro rules", () => {
      // 30g CHO = 2 eq Cereal, 21g Prot = 3 eq AOA, 10g Lip = 2 eq Grasa
      const composite = solveCompositeEquivalents(21, 10, 30);
      expect(composite.cerealEquivalentsPer100g).toBe(2.0);
      expect(composite.aoaEquivalentsPer100g).toBe(3.0);
      expect(composite.fatEquivalentsPer100g).toBe(2.0);
    });

    it("should decompose custom nutrition facts and cache newly added food", async () => {
      const mockStore: CachedFood[] = [];
      const result = await logNutritionFacts(
        {
          foodName: "Barra de Proteina Kirkland",
          protein100g: 35,
          carbs100g: 22,
          fat100g: 10,
        },
        mockStore
      );

      expect(result.foodName).toBe("Barra de Proteina Kirkland");
      expect(result.primaryGroupId).toContain("aoa");
      expect(result.compositeEquivalentsPer100g.aoaEquivalentsPer100g).toBe(5.0); // 35 / 7 = 5

      // Check that cache was populated and can be queried
      const cachedLookup = await getGramsForPortion({ foodName: "Barra de Proteina Kirkland", nEquivalentes: 1 });
      expect(cachedLookup).not.toBeNull();
      expect(cachedLookup?.fromCache).toBe(true);
    });
  });
});
