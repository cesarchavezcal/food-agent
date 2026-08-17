import { describe, it, expect, beforeEach } from "vitest";
import { getPlanPortions } from "../../agent/tools/getPlanPortions.js";
import { logFood } from "../../agent/tools/logFood.js";
import { getDailySummary } from "../../agent/tools/getDailySummary.js";
import { foodCache, type CachedFood } from "../../agent/tools/cache.js";

describe("Tracking and Meal Planning Tools", () => {
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

  const mockPlans = [
    { id: "1", planName: "leg day", meal: "desayuno", groupId: "cereales_sin_grasa", equivalentes: 2 },
    { id: "2", planName: "leg day", meal: "desayuno", groupId: "aoa_muy_bajo_grasa", equivalentes: 3 },
    { id: "3", planName: "leg day", meal: "almuerzo", groupId: "cereales_sin_grasa", equivalentes: 3 },
    { id: "4", planName: "leg day", meal: "almuerzo", groupId: "aoa_muy_bajo_grasa", equivalentes: 4 },
  ];

  const mockSchedule = [
    { id: "s1", dayOfWeek: "monday", planName: "leg day" },
  ];

  beforeEach(() => {
    foodCache.invalidate();
  });

  describe("getPlanPortions", () => {
    it("should return meal portions for an explicitly named plan", async () => {
      const result = await getPlanPortions({ planName: "leg day", meal: "desayuno" }, mockPlans, mockSchedule);
      expect(result.planName).toBe("leg day");
      expect(result.portions["cereales_sin_grasa"]).toBe(2);
      expect(result.portions["aoa_muy_bajo_grasa"]).toBe(3);
    });

    it("should auto-resolve plan from day of week when planName is omitted", async () => {
      // 2026-08-17 is a Monday
      const result = await getPlanPortions({ date: "2026-08-17", meal: "almuerzo" }, mockPlans, mockSchedule);
      expect(result.planName).toBe("leg day");
      expect(result.portions["cereales_sin_grasa"]).toBe(3);
      expect(result.portions["aoa_muy_bajo_grasa"]).toBe(4);
    });
  });

  describe("logFood", () => {
    it("should log food intake and compute covered equivalents in strict grams", async () => {
      const mockLogStore: any[] = [];
      const result = await logFood(
        {
          date: "2026-08-17",
          meal: "desayuno",
          foodName: "pollo",
          grams: 90,
        },
        mockCatalog,
        mockLogStore
      );

      expect(result).not.toBeNull();
      expect(result?.grams).toBe(90);
      expect(result?.equivalentesCovered).toBe(3); // 90 / 30 = 3
      expect(mockLogStore.length).toBe(1);
    });
  });

  describe("getDailySummary", () => {
    it("should calculate consumed totals and diff against target plan", async () => {
      const mockLogs = [
        {
          id: "1",
          logDate: "2026-08-17",
          mealType: "desayuno",
          foodId: "pollo",
          foodName: "Pechuga de pollo",
          grams: 60,
          computedEquivalents: { aoa_muy_bajo_grasa: 2 },
          computedMacros: { kcal: 99, proteinG: 18.6, fatG: 2.1, choG: 0 },
          createdAt: new Date(),
        },
        {
          id: "2",
          logDate: "2026-08-17",
          mealType: "desayuno",
          foodId: "arroz",
          foodName: "Arroz blanco",
          grams: 47,
          computedEquivalents: { cereales_sin_grasa: 1 },
          computedMacros: { kcal: 61, proteinG: 1.2, fatG: 0.1, choG: 13.1 },
          createdAt: new Date(),
        },
      ];

      const summary = await getDailySummary(
        { date: "2026-08-17", meal: "desayuno", planName: "leg day" },
        mockLogs as any,
        mockPlans,
        mockSchedule
      );

      expect(summary.totalEquivalentsConsumed["aoa_muy_bajo_grasa"]).toBe(2);
      expect(summary.plannedEquivalents["aoa_muy_bajo_grasa"]).toBe(3);

      const aoaDiff = summary.diff.find((d) => d.groupId === "aoa_muy_bajo_grasa");
      expect(aoaDiff?.remaining).toBe(1); // 3 planned - 2 consumed = 1 remaining

      const cerealDiff = summary.diff.find((d) => d.groupId === "cereales_sin_grasa");
      expect(cerealDiff?.remaining).toBe(1); // 2 planned - 1 consumed = 1 remaining
    });
  });
});
