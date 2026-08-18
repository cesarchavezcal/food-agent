import { tool } from "ai";
import { z } from "zod";
import { db } from "../db/client.js";
import { plans } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const saveMealPlanSchema = z.object({
  planName: z.string().min(1).describe("The name of the meal plan, e.g. 'ALTA DEMANDA', 'MEDIA', 'DESCANSO'"),
  targetKcal: z.number().optional().describe("Total daily target calories, e.g. 2550"),
  targetProteinG: z.number().optional().describe("Total daily target protein in grams, e.g. 159"),
  targetLipidsG: z.number().optional().describe("Total daily target lipids in grams, e.g. 73"),
  targetCarbsG: z.number().optional().describe("Total daily target carbs in grams, e.g. 315"),
  dailyTotal: z
    .record(z.string(), z.number())
    .describe("Total equivalent portions per SMAE group for the day (e.g. { verdura: 3, fruta: 4, cereal_sin_grasa: 14 })"),
  byMeal: z
    .record(z.string(), z.record(z.string(), z.number()))
    .optional()
    .describe("Breakdown of equivalent portions partitioned by meal (e.g. { almuerzo: { verdura: 2, fruta: 2 }, comida: { ... } })"),
});

const CANONICAL_GROUP_IDS: Record<string, string> = {
  verdura: "verduras",
  verduras: "verduras",
  fruta: "frutas",
  frutas: "frutas",
  cereal: "cereales_sin_grasa",
  cereales: "cereales_sin_grasa",
  cereal_sg: "cereales_sin_grasa",
  cereal_sin_grasa: "cereales_sin_grasa",
  "cereal s/grasa": "cereales_sin_grasa",
  "cereales s/grasa": "cereales_sin_grasa",
  "cereal sin grasa": "cereales_sin_grasa",
  cereales_sin_grasa: "cereales_sin_grasa",
  cereal_cg: "cereales_con_grasa",
  cereal_con_grasa: "cereales_con_grasa",
  "cereal c/grasa": "cereales_con_grasa",
  "cereales c/grasa": "cereales_con_grasa",
  cereales_con_grasa: "cereales_con_grasa",
  leguminosa: "leguminosas",
  leguminosas: "leguminosas",
  aoa: "aoa_muy_bajo_grasa",
  aoa_mbag: "aoa_muy_bajo_grasa",
  aoa_muy_bajo_grasa: "aoa_muy_bajo_grasa",
  "aoa mbag": "aoa_muy_bajo_grasa",
  aoa_bag: "aoa_bajo_grasa",
  aoa_bajo_grasa: "aoa_bajo_grasa",
  aoa_mag: "aoa_moderado_grasa",
  aoa_moderado_grasa: "aoa_moderado_grasa",
  aoa_aag: "aoa_alto_grasa",
  aoa_alto_grasa: "aoa_alto_grasa",
  leche: "leche_descremada",
  leche_descremada: "leche_descremada",
  "leche descremada": "leche_descremada",
  leche_semidescremada: "leche_semidescremada",
  leche_entera: "leche_entera",
  leche_con_azucar: "leche_con_azucar",
  grasa: "aceites_y_grasas",
  grasas: "aceites_y_grasas",
  "grasa s/prot": "aceites_y_grasas",
  "grasas s/prot": "aceites_y_grasas",
  "aceite s/prot": "aceites_y_grasas",
  aceites_sin_proteina: "aceites_y_grasas",
  aceites_y_grasas: "aceites_y_grasas",
  "grasa c/prot": "aceites_y_grasas_con_proteina",
  "grasas c/prot": "aceites_y_grasas_con_proteina",
  "aceite c/prot": "aceites_y_grasas_con_proteina",
  aceites_con_proteina: "aceites_y_grasas_con_proteina",
  aceites_y_grasas_con_proteina: "aceites_y_grasas_con_proteina",
  azucar: "azucares_sin_grasa",
  azucares: "azucares_sin_grasa",
  azucares_sin_grasa: "azucares_sin_grasa",
  azucares_con_grasa: "azucares_con_grasa",
};

export function normalizeSmaeGroupId(groupId: string): string {
  const clean = groupId.trim().toLowerCase();
  return CANONICAL_GROUP_IDS[clean] || clean;
}

export const saveMealPlan = tool({
  description:
    "Saves or updates a multi-meal clinical nutrition plan with daily targets and per-meal portion breakdowns in the database.",
  parameters: saveMealPlanSchema,
  execute: async ({ planName, targetKcal, targetProteinG, targetLipidsG, targetCarbsG, dailyTotal, byMeal }) => {
    try {
      const normalizedPlanName = planName.trim();
      const planSlug = normalizedPlanName.toLowerCase().replace(/[^a-z0-9]+/g, "_");

      if (db) {
        // Remove existing rows for this plan to prevent duplicates
        await db.delete(plans).where(eq(plans.planName, normalizedPlanName));

        const rowsToInsert: Array<typeof plans.$inferInsert> = [];

        // Insert per-meal entries if provided
        if (byMeal && Object.keys(byMeal).length > 0) {
          for (const [mealName, groupMap] of Object.entries(byMeal)) {
            for (const [rawGroupId, equivalentes] of Object.entries(groupMap)) {
              if (equivalentes <= 0) continue;
              const groupId = normalizeSmaeGroupId(rawGroupId);
              rowsToInsert.push({
                id: `${planSlug}_${mealName}_${groupId}`,
                planName: normalizedPlanName,
                meal: mealName.toLowerCase().trim(),
                groupId,
                equivalentes,
              });
            }
          }
        } else {
          // If no per-meal breakdown, insert daily total as meal='daily'
          for (const [rawGroupId, equivalentes] of Object.entries(dailyTotal)) {
            if (equivalentes <= 0) continue;
            const groupId = normalizeSmaeGroupId(rawGroupId);
            rowsToInsert.push({
              id: `${planSlug}_daily_${groupId}`,
              planName: normalizedPlanName,
              meal: "daily",
              groupId,
              equivalentes,
            });
          }
        }

        if (rowsToInsert.length > 0) {
          await db.insert(plans).values(rowsToInsert);
        }
      }

      return {
        success: true,
        planName: normalizedPlanName,
        targetKcal: targetKcal || 0,
        targetMacros: {
          proteinG: targetProteinG || 0,
          lipidsG: targetLipidsG || 0,
          carbsG: targetCarbsG || 0,
        },
        dailyTotal,
        byMeal: byMeal || {},
        message: `Plan "${normalizedPlanName}" successfully saved and updated in the database.`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
});
