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
import { saveMealPlan } from "./tools/saveMealPlan.js";
import { setWeeklySchedule } from "./tools/setWeeklySchedule.js";
import { parseMarkdownMealPlanTable } from "./utils/tableParser.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const instructionsPath = path.join(process.cwd(), "agent/instructions.md");
const instructions = fs.existsSync(instructionsPath)
  ? fs.readFileSync(instructionsPath, "utf-8")
  : "Eres un nutriólogo clínico experto en el Sistema Mexicano de Alimentos Equivalentes (SMAE).";

const tools = {
  saveMealPlan,
  setWeeklySchedule,

  getPlanPortions: tool({
    description: "Obtiene las porciones planificadas por grupo para un plan o para el día actual.",
    parameters: getPlanPortionsSchema,
    execute: async (args) => {
      console.log(`\x1b[36m[Tool: getPlanPortions]\x1b[0m Consultando plan/horario`);
      return await getPlanPortions(args);
    },
  }),

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

export function sanitizeTerminalTableInput(input: string): string {
  const lines = input.split("\n");
  const result: string[] = [];
  let headerPipeCount = 0;
  let buffer = "";

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("|") || buffer.startsWith("|")) {
      buffer = buffer ? `${buffer} ${trimmed}`.replace(/\s+/g, " ") : trimmed;
      const currentPipes = (buffer.match(/\|/g) || []).length;

      // Determine header pipe count
      if (headerPipeCount === 0 && buffer.toLowerCase().includes("grupo") && buffer.endsWith("|")) {
        headerPipeCount = currentPipes;
        result.push(buffer);
        buffer = "";
        continue;
      }

      if (headerPipeCount > 0 && currentPipes >= headerPipeCount) {
        result.push(buffer);
        buffer = "";
      }
    } else {
      if (buffer) {
        result.push(buffer);
        buffer = "";
      }
      result.push(lines[i]);
    }
  }
  if (buffer) result.push(buffer);
  return result.join("\n");
}

export function readMultilineInput(
  rl: { on: (event: string, cb: (line: string) => void) => void; off?: (event: string, cb: (line: string) => void) => void; removeListener?: (event: string, cb: (line: string) => void) => void },
  writePrompt?: (prompt: string) => void,
  debounceMs: number = 80
): Promise<string> {
  return new Promise((resolve) => {
    let buffer = "";
    let timer: NodeJS.Timeout | null = null;

    if (writePrompt) {
      writePrompt("\n\x1b[32m🧑 Tú:\x1b[0m ");
    }

    const onLine = (line: string) => {
      buffer = buffer ? `${buffer}\n${line}` : line;

      if (timer) clearTimeout(timer);

      timer = setTimeout(() => {
        if (rl.off) {
          rl.off("line", onLine);
        } else if (rl.removeListener) {
          rl.removeListener("line", onLine);
        }
        resolve(buffer.trim());
      }, debounceMs);
    };

    rl.on("line", onLine);
  });
}

export function extractRetryDelay(errorMsg: string): number {
  const match = errorMsg.match(/try again in ([0-9.]+)s/i);
  if (match && match[1]) {
    const seconds = parseFloat(match[1]);
    return Math.ceil(seconds * 1000) + 500;
  }
  return 5000;
}

export function pruneMessagesWindow(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  maxTurns: number = 4
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  if (messages.length <= maxTurns + 1) return messages;
  const systemMsg = messages[0];
  const recent = messages.slice(-maxTurns);
  return [systemMsg, ...recent];
}

export function getModelCascade(envModel?: string): string[] {
  const defaults = ["qwen/qwen3.6-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
  if (envModel && !defaults.includes(envModel)) {
    return [envModel, ...defaults];
  }
  if (envModel && defaults.includes(envModel)) {
    return [envModel, ...defaults.filter((m) => m !== envModel)];
  }
  return defaults;
}

export function isModelNotFoundError(err: any): boolean {
  const msg = (err?.message || String(err)).toLowerCase();
  return (
    err?.status === 404 ||
    msg.includes("not found") ||
    msg.includes("decommissioned") ||
    msg.includes("does not exist") ||
    msg.includes("model_not_found")
  );
}

export async function generateTextWithRetry(
  params: Parameters<typeof generateText>[0],
  maxRetries: number = 3
): Promise<ReturnType<typeof generateText>> {
  let attempt = 0;
  while (true) {
    try {
      return await generateText(params);
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      const isRateLimit =
        err?.status === 429 ||
        errMsg.toLowerCase().includes("rate limit") ||
        errMsg.toLowerCase().includes("tpm");

      if (isRateLimit && attempt < maxRetries) {
        attempt++;
        const delayMs = extractRetryDelay(errMsg);
        const seconds = (delayMs / 1000).toFixed(1);
        console.log(
          `\n\x1b[33m⏳ Límite de tokens de Groq alcanzado. Esperando ${seconds}s para continuar automáticamente (intento ${attempt}/${maxRetries})...\x1b[0m`
        );
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }
      throw err;
    }
  }
}

export async function generateTextWithFallback(
  getParams: (modelName: string) => Parameters<typeof generateText>[0],
  candidateModels: string[],
  maxRetries: number = 3
): Promise<ReturnType<typeof generateText>> {
  let modelIdx = 0;

  while (modelIdx < candidateModels.length) {
    const currentModel = candidateModels[modelIdx];
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        return await generateText(getParams(currentModel));
      } catch (err: any) {
        const errMsg = err?.message || String(err);
        const isRateLimit =
          err?.status === 429 ||
          errMsg.toLowerCase().includes("rate limit") ||
          errMsg.toLowerCase().includes("tpm");

        if (isRateLimit && attempt < maxRetries) {
          attempt++;
          const delayMs = extractRetryDelay(errMsg);
          const seconds = (delayMs / 1000).toFixed(1);
          console.log(
            `\n\x1b[33m⏳ Límite de tokens de Groq alcanzado en ${currentModel}. Esperando ${seconds}s para continuar automáticamente (intento ${attempt}/${maxRetries})...\x1b[0m`
          );
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        if (isModelNotFoundError(err) && modelIdx < candidateModels.length - 1) {
          const nextModel = candidateModels[modelIdx + 1];
          console.log(
            `\n\x1b[33m⚠️ Modelo '${currentModel}' no disponible o deprecado. Cambiando automáticamente a '${nextModel}'...\x1b[0m`
          );
          modelIdx++;
          break;
        }

        throw err;
      }
    }
  }

  throw new Error("Todos los modelos candidatos fallaron.");
}

export interface CliSpinner {
  start: (text: string) => void;
  update: (text: string) => void;
  stop: () => void;
}

export function createCliSpinner(stream = process.stdout): CliSpinner {
  const frames = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
  let frameIdx = 0;
  let currentText = "";
  let timer: NodeJS.Timeout | null = null;

  const render = () => {
    const frame = frames[frameIdx];
    frameIdx = (frameIdx + 1) % frames.length;
    stream.write(`\r\x1b[K\x1b[36m${frame}\x1b[0m ${currentText}`);
  };

  return {
    start: (text: string) => {
      currentText = text;
      frameIdx = 0;
      render();
      if (timer) clearInterval(timer);
      timer = setInterval(render, 80);
    },
    update: (text: string) => {
      currentText = text;
      render();
    },
    stop: () => {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      stream.write("\r\x1b[K");
    },
  };
}

async function main() {
  if (!process.env.GROQ_API_KEY) {
    console.error("❌ GROQ_API_KEY no está configurada en .env.local");
    process.exit(1);
  }

  const modelCandidates = getModelCascade(process.env.GROQ_MODEL);
  const primaryModel = modelCandidates[0];

  console.log("\n========================================================");
  console.log("🥗 Eve SMAE Diet Agent — Terminal Runner");
  console.log(`Modelo Primario: Groq ${primaryModel} ($0 Cost)`);
  if (modelCandidates.length > 1) {
    console.log(`Cascada Fallback: ${modelCandidates.slice(1).join(" -> ")}`);
  }
  console.log("Escribe 'salir' o presiona Ctrl+C para terminar.");
  console.log("========================================================\n");

  let messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: instructions },
  ];

  const rl = readline.createInterface({ input, output });
  const spinner = createCliSpinner();

  while (true) {
    try {
      const rawInput = await readMultilineInput(rl, (p) => output.write(p));
      const trimmed = rawInput.trim();

      if (!trimmed) continue;
      if (trimmed.toLowerCase() === "salir" || trimmed.toLowerCase() === "exit") {
        console.log("👋 ¡Hasta luego!");
        break;
      }

      const sanitizedInput = sanitizeTerminalTableInput(trimmed);
      messages.push({ role: "user", content: sanitizedInput });
      messages = pruneMessagesWindow(messages, 4);

      // Deterministic Zero-Cost Table Pre-Parser
      const parsedTable = parseMarkdownMealPlanTable(sanitizedInput);
      if (parsedTable.isTable && parsedTable.planName && Object.keys(parsedTable.dailyTotal).length > 0) {
        spinner.start(`Guardando plan "${parsedTable.planName}" en base de datos...`);
        try {
          const saved = await (saveMealPlan as any).execute({
            planName: parsedTable.planName,
            targetKcal: parsedTable.targetKcal,
            targetProteinG: parsedTable.targetProteinG,
            targetLipidsG: parsedTable.targetLipidsG,
            targetCarbsG: parsedTable.targetCarbsG,
            dailyTotal: parsedTable.dailyTotal,
            byMeal: parsedTable.byMeal,
          });
          spinner.stop();

          const responseText =
            `✅ ¡Plan **${saved.planName}** guardado con éxito en Neon Postgres!\n\n` +
            `🎯 **Metas**: ${saved.targetKcal ? `${saved.targetKcal} kcal` : "Calculado"} ` +
            `${saved.targetProteinG ? `· ${saved.targetProteinG}g P` : ""} ` +
            `${saved.targetLipidsG ? `· ${saved.targetLipidsG}g L` : ""} ` +
            `${saved.targetCarbsG ? `· ${saved.targetCarbsG}g HC` : ""}\n\n` +
            `📋 **Distribución Diaria Registrada**:\n` +
            Object.entries(saved.dailyTotal)
              .map(([g, eq]) => `- **${g}**: ${eq} eq`)
              .join("\n") +
            `\n\n*Procesado de forma determinista ($0 tokens consumidos).*`;

          console.log(`\n\x1b[35m🤖 Nutriólogo SMAE:\x1b[0m\n${responseText}`);
          messages.push({ role: "assistant", content: responseText });
          messages = pruneMessagesWindow(messages, 4);
          continue;
        } catch (tableErr: any) {
          spinner.stop();
          console.error("Error al registrar plan automáticamente:", tableErr?.message || tableErr);
        }
      }

      spinner.start("Pensando y analizando solicitud...");

      let result;
      try {
        result = await generateTextWithFallback(
          (mName) => ({
            model: groq(mName),
            messages,
            tools,
            maxSteps: 5,
          }),
          modelCandidates
        );
      } finally {
        spinner.stop();
      }

      console.log(`\n\x1b[35m🤖 Nutriólogo SMAE:\x1b[0m\n${result.text}`);
      messages.push({ role: "assistant", content: result.text });
      messages = pruneMessagesWindow(messages, 4);
    } catch (err: any) {
      spinner.stop();
      if (err?.code === "ERR_USE_AFTER_CLOSE" || err?.message?.includes("closed")) {
        break;
      }
      console.error("\x1b[31mError al procesar mensaje:\x1b[0m", err?.message || err);
    }
  }

  rl.close();
}

main().catch(console.error);
