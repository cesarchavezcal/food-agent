import { describe, it, expect, vi } from "vitest";
import { saveMealPlan } from "../../agent/tools/saveMealPlan.js";
import { setWeeklySchedule } from "../../agent/tools/setWeeklySchedule.js";
import { getPlanPortions } from "../../agent/tools/getPlanPortions.js";

// Mock db calls for deterministic unit tests
vi.mock("../../agent/db/client.js", () => {
  const planRows: any[] = [];
  const schedRows: any[] = [];

  return {
    db: {
      delete: () => ({
        where: async () => {},
      }),
      insert: () => ({
        values: (items: any) => {
          if (Array.isArray(items)) {
            planRows.push(...items);
          }
          return {
            onConflictDoUpdate: async () => {
              schedRows.push(items);
            },
          };
        },
      }),
      select: () => ({
        from: () => ({
          where: async () => planRows,
          limit: async () => schedRows,
        }),
      }),
    },
  };
});

describe("Meal Planning Tools", () => {
  it("should successfully execute saveMealPlan", async () => {
    const result = await saveMealPlan.execute!(
      {
        planName: "ALTA DEMANDA",
        targetKcal: 2550,
        targetProteinG: 159,
        targetLipidsG: 73,
        targetCarbsG: 315,
        dailyTotal: {
          verdura: 3,
          fruta: 4,
          cereal_sin_grasa: 14,
          aoa_muy_bajo_grasa: 14,
          leche_descremada: 2,
          aceites_sin_proteina: 8,
          aceites_con_proteina: 3,
        },
        byMeal: {
          almuerzo: { verdura: 2, fruta: 2, cereal_sin_grasa: 5, aoa_muy_bajo_grasa: 5, leche_descremada: 1, aceites_sin_proteina: 2, aceites_con_proteina: 1 },
          colacion_1: { fruta: 1, cereal_sin_grasa: 2, aoa_muy_bajo_grasa: 2, aceites_sin_proteina: 1 },
          comida: { verdura: 1, cereal_sin_grasa: 4, aoa_muy_bajo_grasa: 4, aceites_sin_proteina: 2 },
          colacion_2: { fruta: 1, aceites_sin_proteina: 1, aceites_con_proteina: 1 },
          cena: { cereal_sin_grasa: 3, aoa_muy_bajo_grasa: 3, leche_descremada: 1, aceites_sin_proteina: 2, aceites_con_proteina: 1 },
        },
      },
      { toolCallId: "test-call-1", messages: [] }
    );

    expect(result.success).toBe(true);
    expect(result.planName).toBe("ALTA DEMANDA");
    expect(result.targetKcal).toBe(2550);
  });

  it("should successfully execute setWeeklySchedule", async () => {
    const result = await setWeeklySchedule.execute!(
      {
        schedule: {
          monday: "ALTA DEMANDA",
          tuesday: "ALTA DEMANDA",
          wednesday: "ALTA DEMANDA",
          thursday: "ALTA DEMANDA",
          friday: "ALTA DEMANDA",
          saturday: "MEDIA",
          sunday: "DESCANSO",
        },
      },
      { toolCallId: "test-call-2", messages: [] }
    );

    expect(result.success).toBe(true);
    expect(result.assignedDays).toBe(7);
  });

  it("should retrieve mock plan portions with per-meal breakdown", async () => {
    const mockPlans = [
      { id: "1", planName: "ALTA DEMANDA", meal: "almuerzo", groupId: "verdura", equivalentes: 2 },
      { id: "2", planName: "ALTA DEMANDA", meal: "almuerzo", groupId: "fruta", equivalentes: 2 },
      { id: "3", planName: "ALTA DEMANDA", meal: "comida", groupId: "verdura", equivalentes: 1 },
    ];

    const result = await getPlanPortions({ planName: "ALTA DEMANDA", meal: "almuerzo" }, mockPlans);
    expect(result.planName).toBe("ALTA DEMANDA");
    expect(result.portions.verdura).toBe(2);
    expect(result.dailyTotal.verdura).toBe(3);
    expect(result.byMeal.almuerzo?.verdura).toBe(2);
  });
});
