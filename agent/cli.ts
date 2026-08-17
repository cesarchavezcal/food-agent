import * as readline from "readline/promises";
import { stdin as input, stdout as output } from "process";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { generateText, tool } from "ai";
import { groq } from "@ai-sdk/groq";

import { getGramsForPortion, getGramsForPortionSchema } from "./tools/getGramsForPortion.js";
import { coverageForAmount, coverageForAmountSchema } from "./tools/coverageForAmount.js";
import { logNutritionFacts, logNutritionFactsSchema } from "./tools/logNutritionFacts.js";
import { getPlanPortions, getPlanPortionsSchema } from "./tools/getPlanPortions.js";
import { logFood, logFoodSchema } from "./tools/logFood.js";
import { getDailySummary, getDailySummarySchema } from "./tools/getDailySummary.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const instructionsPath = path.join(process.cwd(), "agent/instructions.md");
const instructions = fs.existsSync(instructionsPath)
  ? fs.readFileSync(instructionsPath, "utf-8")
  : "Eres un nutriólogo clínico experto en el Sistema Mexicano de Alimentos Equivalentes (SMAE).";

const tools = {
  getGramsForPortion: tool({
    description: "Calcula los gramos netos sugeridos para N equivalentes de un alimento específico en el SMAE.",
    parameters: getGramsForPortionSchema,
    execute: async (args) => {
      console.log(`\x1b[36m[Tool: getGramsForPortion]\x1b[0m ${args.nEquivalentes ?? 1} eq de "${args.foodName}"`);
      return await getGramsForPortion(args);
    },
  }),

  coverageForAmount: tool({
    description: "Calcula cuántos equivalentes y macronutrientes cubren X gramos consumidos de un alimento.",
    parameters: coverageForAmountSchema,
    execute: async (args) => {
      console.log(`\x1b[36m[Tool: coverageForAmount]\x1b[0m ${args.grams}g de "${args.foodName}"`);
      return await coverageForAmount(args);
    },
  }),

  logNutritionFacts: tool({
    description: "Descompone una tabla nutrimental en equivalentes SMAE canónicos (15g CHO -> Cereal, 7g Prot -> AOA, 5g Lip -> Grasa) y lo guarda en el catálogo.",
    parameters: logNutritionFactsSchema,
    execute: async (args) => {
      console.log(`\x1b[36m[Tool: logNutritionFacts]\x1b[0m Guardando alimento "${args.foodName}"`);
      return await logNutritionFacts(args);
    },
  }),

  getPlanPortions: tool({
    description: "Obtiene las porciones planificadas por grupo para un plan o para el día actual.",
    parameters: getPlanPortionsSchema,
    execute: async (args) => {
      console.log(`\x1b[36m[Tool: getPlanPortions]\x1b[0m Consultando plan/horario`);
      return await getPlanPortions(args);
    },
  }),

  logFood: tool({
    description: "Registra el consumo real de un alimento en una comida en gramos exactos.",
    parameters: logFoodSchema,
    execute: async (args) => {
      console.log(`\x1b[36m[Tool: logFood]\x1b[0m Registrando ${args.grams}g de "${args.foodName}" en ${args.meal}`);
      return await logFood(args);
    },
  }),

  getDailySummary: tool({
    description: "Genera el resumen diario comparando lo consumido contra el plan objetivo del día.",
    parameters: getDailySummarySchema,
    execute: async (args) => {
      console.log(`\x1b[36m[Tool: getDailySummary]\x1b[0m Resumen del día ${args.date ?? "hoy"}`);
      return await getDailySummary(args);
    },
  }),
};

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY no está configurada en .env.local");
    process.exit(1);
  }

  const modelName = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

  console.log("\n========================================================");
  console.log("🥗 Eve SMAE Diet Agent — Terminal Runner");
  console.log(`Modelo: Groq ${modelName} ($0 Cost)`);
  console.log("Escribe 'salir' o presiona Ctrl+C para terminar.");
  console.log("========================================================\n");

  const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: instructions },
  ];

  const rl = readline.createInterface({ input, output });

  while (true) {
    try {
      const userInput = await rl.question("\n\x1b[32m🧑 Tú:\x1b[0m ");
      const trimmed = userInput.trim();

      if (!trimmed) continue;
      if (trimmed.toLowerCase() === "salir" || trimmed.toLowerCase() === "exit") {
        console.log("👋 ¡Hasta luego!");
        break;
      }

      messages.push({ role: "user", content: trimmed });

      const result = await generateText({
        model: groq(modelName),
        messages,
        tools,
        maxSteps: 5,
      });

      console.log(`\n\x1b[35m🤖 Nutriólogo SMAE:\x1b[0m\n${result.text}`);
      messages.push({ role: "assistant", content: result.text });
    } catch (err: any) {
      if (err?.code === "ERR_USE_AFTER_CLOSE" || err?.message?.includes("closed")) {
        break;
      }
      console.error("\x1b[31mError al procesar mensaje:\x1b[0m", err?.message || err);
    }
  }

  rl.close();
}

main().catch(console.error);
