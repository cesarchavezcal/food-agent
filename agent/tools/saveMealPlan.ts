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
            for (const [groupId, equivalentes] of Object.entries(groupMap)) {
              if (equivalentes <= 0) continue;
              rowsToInsert.push({
                id: `${planSlug}_${mealName}_${groupId}`,
                planName: normalizedPlanName,
                meal: mealName.toLowerCase().trim(),
                groupId: groupId.trim(),
                equivalentes,
              });
            }
          }
        } else {
          // If no per-meal breakdown, insert daily total as meal='daily'
          for (const [groupId, equivalentes] of Object.entries(dailyTotal)) {
            if (equivalentes <= 0) continue;
            rowsToInsert.push({
              id: `${planSlug}_daily_${groupId}`,
              planName: normalizedPlanName,
              meal: "daily",
              groupId: groupId.trim(),
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
