import { createGroq } from "@ai-sdk/groq";
import { tool } from "ai";
import * as dotenv from "dotenv";
import { getPlanPortions, getPlanPortionsSchema } from "./tools/getPlanPortions.js";
import { getGramsForPortion, getGramsForPortionSchema } from "./tools/getGramsForPortion.js";
import { coverageForAmount, coverageForAmountSchema } from "./tools/coverageForAmount.js";
import { logNutritionFacts, logNutritionFactsSchema } from "./tools/logNutritionFacts.js";
import { logFood, logFoodSchema } from "./tools/logFood.js";
import { getDailySummary, getDailySummarySchema } from "./tools/getDailySummary.js";
import { saveMealPlan } from "./tools/saveMealPlan.js";
import { setWeeklySchedule } from "./tools/setWeeklySchedule.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
});

const modelName = process.env.GROQ_MODEL || "openai/gpt-oss-20b";

export const model = groq(modelName);

// Export all tools for Eve agent runtime
export const tools = {
  getPlanPortions: tool({
    description: "Obtiene las porciones planificadas (equivalentes por grupo SMAE) para una comida y plan específico, o las infiere del día de hoy.",
    parameters: getPlanPortionsSchema,
    execute: async (args) => await getPlanPortions(args),
  }),
  saveMealPlan,
  setWeeklySchedule,

  getGramsForPortion: tool({
    description: "Dado un alimento, calcula los gramos netos exactos que cubren 1 o N equivalentes según el SMAE mexicano.",
    parameters: getGramsForPortionSchema,
    execute: async (args) => await getGramsForPortion(args),
  }),

  coverageForAmount: tool({
    description: "Calcula cuántos equivalentes y macronutrientes cubren X gramos de un alimento específico.",
    parameters: coverageForAmountSchema,
    execute: async (args) => await coverageForAmount(args),
  }),

  logNutritionFacts: tool({
    description: "Registra una tabla nutrimental (proteína, grasa, carbohidratos por 100g) y descompone el alimento en equivalentes SMAE compuestos (15g CHO / 7g Prot / 5g Lip).",
    parameters: logNutritionFactsSchema,
    execute: async (args) => await logNutritionFacts(args),
  }),

  logFood: tool({
    description: "Registra el consumo de un alimento en una comida y fecha específica, guardando los gramos exactos y calculando equivalentes consumidos.",
    parameters: logFoodSchema,
    execute: async (args) => await logFood(args),
  }),

  getDailySummary: tool({
    description: "Genera el resumen diario comparando lo consumido contra el plan objetivo del día o comida.",
    parameters: getDailySummarySchema,
    execute: async (args) => await getDailySummary(args),
  }),
};

export default {
  model,
  tools,
};
