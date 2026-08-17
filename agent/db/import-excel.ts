import * as xlsx from "xlsx";
import * as path from "path";
import * as fs from "fs";
import { db } from "./client.js";
import { equivalentGroups, foods } from "./schema.js";

export interface StandardGroupDefinition {
  id: string;
  name: string;
  subgroup?: string;
  sheetName: string;
  kcal: number;
  proteinG: number;
  fatG: number;
  choG: number;
}

export const STANDARD_GROUPS: StandardGroupDefinition[] = [
  { id: "verduras", name: "Verduras", sheetName: "VERDURAS", kcal: 25, proteinG: 2, fatG: 0, choG: 4 },
  { id: "frutas", name: "Frutas", sheetName: "FRUTAS", kcal: 60, proteinG: 0, fatG: 0, choG: 15 },
  { id: "cereales_sin_grasa", name: "Cereales y tubérculos", subgroup: "Sin grasa", sheetName: "CEREALES SIN GRASA", kcal: 70, proteinG: 2, fatG: 0, choG: 15 },
  { id: "cereales_con_grasa", name: "Cereales y tubérculos", subgroup: "Con grasa", sheetName: "CEREALES CON GRASA", kcal: 115, proteinG: 2, fatG: 5, choG: 15 },
  { id: "leguminosas", name: "Leguminosas", sheetName: "LEGUMINOSAS", kcal: 120, proteinG: 8, fatG: 1, choG: 20 },
  { id: "aoa_muy_bajo_grasa", name: "Alimentos de origen animal", subgroup: "Muy bajo aporte de grasa", sheetName: "A.O.A MUY BAJOS EN GRASA", kcal: 40, proteinG: 7, fatG: 1, choG: 0 },
  { id: "aoa_bajo_grasa", name: "Alimentos de origen animal", subgroup: "Bajo aporte de grasa", sheetName: "A.O.A.BAJO EN GRASA", kcal: 55, proteinG: 7, fatG: 3, choG: 0 },
  { id: "aoa_moderado_grasa", name: "Alimentos de origen animal", subgroup: "Moderado aporte de grasa", sheetName: "A.O.A.MODERADOS EN GRASA", kcal: 75, proteinG: 7, fatG: 5, choG: 0 },
  { id: "aoa_alto_grasa", name: "Alimentos de origen animal", subgroup: "Alto aporte de grasa", sheetName: "A.O.A.ALTO EN GRASA", kcal: 100, proteinG: 7, fatG: 8, choG: 0 },
  { id: "leche_descremada", name: "Leche", subgroup: "Descremada", sheetName: "LECHE DESCREMADA", kcal: 95, proteinG: 9, fatG: 2, choG: 12 },
  { id: "leche_semidescremada", name: "Leche", subgroup: "Semidescremada", sheetName: "LECHE SEMIDESCREMADA", kcal: 110, proteinG: 9, fatG: 4, choG: 12 },
  { id: "leche_entera", name: "Leche", subgroup: "Entera", sheetName: "LECHE ENTERA", kcal: 150, proteinG: 9, fatG: 8, choG: 12 },
  { id: "leche_con_azucar", name: "Leche", subgroup: "Con azúcar", sheetName: "LECHE CON AZUCAR", kcal: 200, proteinG: 8, fatG: 5, choG: 30 },
  { id: "aceites_y_grasas", name: "Aceites y grasas", subgroup: "Sin proteína", sheetName: "ACEITES Y GRASAS", kcal: 45, proteinG: 0, fatG: 5, choG: 0 },
  { id: "aceites_y_grasas_con_proteina", name: "Aceites y grasas", subgroup: "Con proteína", sheetName: "ACEITES Y GRASAS CON PROTEINAS", kcal: 70, proteinG: 3, fatG: 5, choG: 3 },
  { id: "azucares_sin_grasa", name: "Azúcares", subgroup: "Sin grasa", sheetName: "AZUCARES SIN GRASA", kcal: 40, proteinG: 0, fatG: 0, choG: 10 },
  { id: "azucares_con_grasa", name: "Azúcares", subgroup: "Con grasa", sheetName: "AZUCARES CON GRASA", kcal: 85, proteinG: 0, fatG: 5, choG: 10 },
  { id: "libres_energia", name: "Alimentos libres de energía", sheetName: "ALIMENTOS LIBRES EN ENERGIA", kcal: 0, proteinG: 0, fatG: 0, choG: 0 },
  { id: "bebidas_alcoholicas", name: "Bebidas alcohólicas", sheetName: "BEBIDAS ALCOHOLICAS", kcal: 140, proteinG: 0, fatG: 0, choG: 20 },
];

export interface ParsedFoodItem {
  id: string;
  name: string;
  groupId: string;
  gramsPerEquivalent: number;
  suggestedQuantity?: number;
  suggestedUnit?: string;
  kcal100g: number;
  protein100g: number;
  fat100g: number;
  cho100g: number;
  source: "excel";
}

export function parseSmaeWorkbook(filePath: string): {
  groups: typeof equivalentGroups.$inferInsert[];
  foods: ParsedFoodItem[];
} {
  const resolvedPath = path.resolve(filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw new Error(`SMAE workbook file not found at: ${resolvedPath}`);
  }

  const wb = xlsx.readFile(resolvedPath);
  const parsedGroups = STANDARD_GROUPS.map((g) => ({
    id: g.id,
    name: g.name,
    subgroup: g.subgroup || null,
    kcal: g.kcal,
    proteinG: g.proteinG,
    fatG: g.fatG,
    choG: g.choG,
  }));

  const parsedFoods: ParsedFoodItem[] = [];

  for (const group of STANDARD_GROUPS) {
    const sheet = wb.Sheets[group.sheetName];
    if (!sheet) continue;

    const rows: unknown[][] = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    if (rows.length < 3) continue;

    // Find header row (usually row 1 containing "ALIMENTOS")
    let headerRowIdx = 1;
    for (let r = 0; r < Math.min(5, rows.length); r++) {
      const rowStr = JSON.stringify(rows[r] || "");
      if (rowStr.toLowerCase().includes("alimentos")) {
        headerRowIdx = r;
        break;
      }
    }

    const header = rows[headerRowIdx] as string[];
    const colName = header.findIndex((h) => String(h).toLowerCase().includes("alimento"));
    const colQty = header.findIndex((h) => String(h).toLowerCase().includes("cantidad"));
    const colUnit = header.findIndex((h) => String(h).toLowerCase().includes("unidad"));
    const colNetGrams = header.findIndex((h) => String(h).toLowerCase().includes("peso neto"));
    const colKcal = header.findIndex((h) => String(h).toLowerCase().includes("energia") || String(h).toLowerCase().includes("kcal"));
    const colProt = header.findIndex((h) => String(h).toLowerCase().includes("proteina"));
    const colFat = header.findIndex((h) => String(h).toLowerCase().includes("lípido") || String(h).toLowerCase().includes("lipido"));
    const colCho = header.findIndex((h) => String(h).toLowerCase().includes("hidrato") || String(h).toLowerCase().includes("carbono"));

    for (let i = headerRowIdx + 1; i < rows.length; i++) {
      const row = rows[i] as (string | number | undefined)[];
      if (!row || !row[colName]) continue;

      const rawName = String(row[colName]).trim();
      if (!rawName || rawName.toLowerCase() === "alimentos") continue;

      const netGrams = Number(row[colNetGrams]) || (Number(row[colQty]) > 0 ? Number(row[colQty]) : 100);
      const qty = Number(row[colQty]) || 1;
      const unit = String(row[colUnit] || "g").trim();
      const kcal = Number(row[colKcal]) || group.kcal;
      const protein = Number(row[colProt]) || group.proteinG;
      const fat = Number(row[colFat]) || group.fatG;
      const cho = Number(row[colCho]) || group.choG;

      // Scale per-portion values to per-100g
      const scaleTo100 = netGrams > 0 ? 100 / netGrams : 1;
      const foodId = `${group.id}_${rawName.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;

      parsedFoods.push({
        id: foodId,
        name: rawName,
        groupId: group.id,
        gramsPerEquivalent: netGrams,
        suggestedQuantity: qty,
        suggestedUnit: unit,
        kcal100g: Number((kcal * scaleTo100).toFixed(2)),
        protein100g: Number((protein * scaleTo100).toFixed(2)),
        fat100g: Number((fat * scaleTo100).toFixed(2)),
        cho100g: Number((cho * scaleTo100).toFixed(2)),
        source: "excel",
      });
    }
  }

  return { groups: parsedGroups, foods: parsedFoods };
}

export async function seedDatabase(excelPath = "data/smae.xlsx") {
  console.log(`Starting SMAE Excel seed from: ${excelPath}`);
  const { groups, foods: parsedFoods } = parseSmaeWorkbook(excelPath);
  console.log(`Parsed ${groups.length} groups and ${parsedFoods.length} foods.`);

  if (!db) {
    console.log("No DATABASE_URL set; skipping DB write (dry-run mode).");
    return { groupsCount: groups.length, foodsCount: parsedFoods.length };
  }

  // Insert groups idempotently
  for (const group of groups) {
    await db.insert(equivalentGroups).values(group).onConflictDoUpdate({
      target: equivalentGroups.id,
      set: group,
    });
  }

  // Batch insert foods in chunks of 500
  const CHUNK_SIZE = 500;
  for (let i = 0; i < parsedFoods.length; i += CHUNK_SIZE) {
    const chunk = parsedFoods.slice(i, i + CHUNK_SIZE);
    await db.insert(foods).values(chunk).onConflictDoNothing();
  }

  console.log("✅ Seed completed successfully.");
  return { groupsCount: groups.length, foodsCount: parsedFoods.length };
}

// If executed directly
if (process.argv[1]?.endsWith("import-excel.ts") || process.argv[1]?.endsWith("import-excel.js")) {
  seedDatabase().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
