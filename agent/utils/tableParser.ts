export interface ParsedMealPlan {
  isTable: boolean;
  planName?: string;
  targetKcal?: number;
  targetProteinG?: number;
  targetLipidsG?: number;
  targetCarbsG?: number;
  dailyTotal: Record<string, number>;
  byMeal?: Record<string, Record<string, number>>;
}

const GROUP_MAPPING: Record<string, string> = {
  verdura: "verduras",
  verduras: "verduras",
  fruta: "frutas",
  frutas: "frutas",
  "cereal s/grasa": "cereales_sin_grasa",
  "cereales s/grasa": "cereales_sin_grasa",
  "cereal sin grasa": "cereales_sin_grasa",
  cereal_sg: "cereales_sin_grasa",
  cereal_sin_grasa: "cereales_sin_grasa",
  cereal: "cereales_sin_grasa",
  cereales: "cereales_sin_grasa",
  "cereal c/grasa": "cereales_con_grasa",
  "cereales c/grasa": "cereales_con_grasa",
  cereal_cg: "cereales_con_grasa",
  cereal_con_grasa: "cereales_con_grasa",
  aoa: "aoa_muy_bajo_grasa",
  "aoa mbag": "aoa_muy_bajo_grasa",
  aoa_mbag: "aoa_muy_bajo_grasa",
  aoa_muy_bajo_grasa: "aoa_muy_bajo_grasa",
  "aoa bag": "aoa_bajo_grasa",
  aoa_bag: "aoa_bajo_grasa",
  aoa_bajo_grasa: "aoa_bajo_grasa",
  "aoa mag": "aoa_moderado_grasa",
  aoa_mag: "aoa_moderado_grasa",
  aoa_moderado_grasa: "aoa_moderado_grasa",
  "aoa aag": "aoa_alto_grasa",
  aoa_aag: "aoa_alto_grasa",
  aoa_alto_grasa: "aoa_alto_grasa",
  leche: "leche_descremada",
  "leche descremada": "leche_descremada",
  leche_descremada: "leche_descremada",
  leguminosas: "leguminosas",
  leguminosa: "leguminosas",
  "grasa s/prot": "aceites_y_grasas",
  "grasas s/prot": "aceites_y_grasas",
  "aceite s/prot": "aceites_y_grasas",
  "aceites s/prot": "aceites_y_grasas",
  aceites_sin_proteina: "aceites_y_grasas",
  aceites_y_grasas: "aceites_y_grasas",
  "grasa c/prot": "aceites_y_grasas_con_proteina",
  "grasas c/prot": "aceites_y_grasas_con_proteina",
  "aceite c/prot": "aceites_y_grasas_con_proteina",
  "aceites c/prot": "aceites_y_grasas_con_proteina",
  aceites_con_proteina: "aceites_y_grasas_con_proteina",
  aceites_y_grasas_con_proteina: "aceites_y_grasas_con_proteina",
  azucares: "azucares_sin_grasa",
  azucar: "azucares_sin_grasa",
  azucares_sin_grasa: "azucares_sin_grasa",
  azucares_con_grasa: "azucares_con_grasa",
};

export function parseMarkdownMealPlanTable(input: string): ParsedMealPlan {
  const lines = input.split("\n").map((l) => l.trim()).filter(Boolean);
  const tableLines = lines.filter((l) => l.startsWith("|") && l.endsWith("|"));

  if (tableLines.length < 3) {
    return { isTable: false, dailyTotal: {} };
  }

  let planName: string | undefined;
  let targetKcal: number | undefined;
  let targetProteinG: number | undefined;
  let targetLipidsG: number | undefined;
  let targetCarbsG: number | undefined;

  // Check for header title row (e.g. | ALTA DEMANDA — 2,550 kcal · 159 P · 73 L · 315 HC | ... |)
  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.includes("alta demanda")) planName = "ALTA DEMANDA";
    else if (lower.includes("descanso")) planName = "DESCANSO";
    else if (lower.includes("media")) planName = "MEDIA";
    else if (line.startsWith("Guarda este plan:") || line.startsWith("Plan:")) {
      const match = line.match(/(?:Guarda este plan:|Plan:)\s*([^(\n|]+)/i);
      if (match && match[1]) planName = match[1].trim();
    }

    const kcalMatch = line.match(/([0-9,.]+)\s*kcal/i);
    if (kcalMatch && kcalMatch[1]) {
      targetKcal = parseFloat(kcalMatch[1].replace(/,/g, ""));
    }

    const pMatch = line.match(/([0-9.]+)\s*P/i);
    if (pMatch && pMatch[1]) targetProteinG = parseFloat(pMatch[1]);

    const lMatch = line.match(/([0-9.]+)\s*L/i);
    if (lMatch && lMatch[1]) targetLipidsG = parseFloat(lMatch[1]);

    const hcMatch = line.match(/([0-9.]+)\s*HC/i);
    if (hcMatch && hcMatch[1]) targetCarbsG = parseFloat(hcMatch[1]);
  }

  // Find column headers row (the row containing "Grupo")
  const headerIdx = tableLines.findIndex((l) => l.toLowerCase().includes("grupo"));
  if (headerIdx === -1) {
    return { isTable: false, dailyTotal: {} };
  }

  const rawHeaders = tableLines[headerIdx]
    .split("|")
    .map((c) => c.trim())
    .filter(Boolean);

  // Map columns (skip index 0 which is "Grupo" and last index if "Total")
  const mealColumns: Array<{ colIndex: number; mealKey: string }> = [];
  let totalColIndex = -1;

  for (let i = 1; i < rawHeaders.length; i++) {
    const h = rawHeaders[i].replace(/\*/g, "").trim().toLowerCase();
    if (h === "total") {
      totalColIndex = i;
    } else {
      const mealKey = h
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
      mealColumns.push({ colIndex: i, mealKey });
    }
  }

  const dailyTotal: Record<string, number> = {};
  const byMeal: Record<string, Record<string, number>> = {};

  for (const { mealKey } of mealColumns) {
    byMeal[mealKey] = {};
  }

  for (let r = headerIdx + 1; r < tableLines.length; r++) {
    const row = tableLines[r];
    const cleanRow = row.replace(/\*/g, "");
    if (cleanRow.includes("---") || cleanRow.toLowerCase().includes("meta kcal")) {
      if (cleanRow.toLowerCase().includes("meta kcal") && !targetKcal) {
        const cells = cleanRow.split("|").map((c) => c.trim()).filter(Boolean);
        const lastCell = cells[cells.length - 1]?.replace(/,/g, "");
        if (lastCell && !isNaN(parseFloat(lastCell))) {
          targetKcal = parseFloat(lastCell);
        }
      }
      continue;
    }

    const cells = row.split("|").map((c) => c.replace(/\*/g, "").trim()).filter(Boolean);
    if (cells.length < 2) continue;

    const rawGroupName = cells[0].toLowerCase();
    let canonicalGroupId: string | undefined;

    for (const [pattern, id] of Object.entries(GROUP_MAPPING)) {
      if (rawGroupName.includes(pattern)) {
        canonicalGroupId = id;
        break;
      }
    }

    if (!canonicalGroupId) continue;

    const parsePortion = (val: string): number => {
      const cleaned = val.replace(/[·\-]/g, "").trim();
      if (!cleaned || cleaned.toLowerCase() === "nd") return 0;
      const num = parseFloat(cleaned);
      return isNaN(num) ? 0 : num;
    };

    let rowTotal = 0;

    for (const { colIndex, mealKey } of mealColumns) {
      if (colIndex < cells.length) {
        const portions = parsePortion(cells[colIndex]);
        if (portions > 0) {
          byMeal[mealKey][canonicalGroupId] = (byMeal[mealKey][canonicalGroupId] || 0) + portions;
          rowTotal += portions;
        }
      }
    }

    if (totalColIndex !== -1 && totalColIndex < cells.length) {
      const explicitTotal = parsePortion(cells[totalColIndex]);
      if (explicitTotal > 0) {
        dailyTotal[canonicalGroupId] = explicitTotal;
      } else if (rowTotal > 0) {
        dailyTotal[canonicalGroupId] = rowTotal;
      }
    } else if (rowTotal > 0) {
      dailyTotal[canonicalGroupId] = rowTotal;
    }
  }

  // Infer plan name from calories if still undefined
  if (!planName && targetKcal) {
    if (Math.abs(targetKcal - 2025) <= 50) planName = "DESCANSO";
    else if (Math.abs(targetKcal - 2375) <= 50) planName = "MEDIA";
    else if (Math.abs(targetKcal - 2550) <= 50) planName = "ALTA DEMANDA";
    else planName = `Plan ${targetKcal} kcal`;
  }

  return {
    isTable: true,
    planName: planName || "Plan Personalizado",
    targetKcal,
    targetProteinG,
    targetLipidsG,
    targetCarbsG,
    dailyTotal,
    byMeal,
  };
}
