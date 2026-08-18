import { z } from "zod";
import { db } from "../db/client.js";
import { foods } from "../db/schema.js";
import { foodCache, type CachedFood } from "./cache.js";
import { ilike } from "drizzle-orm";
import { normalizeFoodQuery } from "../utils/synonyms.js";

export const getGramsForPortionSchema = z.object({
  foodName: z.string().min(1).describe("Nombre del alimento en español (ej. pechuga de pollo, arroz cocido, manzana)"),
  nEquivalentes: z.number().positive().default(1).optional().describe("Número de equivalentes/porciones deseadas (default 1)"),
});

export type GetGramsForPortionInput = z.input<typeof getGramsForPortionSchema>;

export interface GramsForPortionResult {
  foodName: string;
  matchedName: string;
  groupId: string;
  nEquivalentes: number;
  totalGrams: number;
  gramsPerEquivalent: number;
  macros: {
    kcal: number;
    proteinG: number;
    fatG: number;
    choG: number;
  };
  fromCache: boolean;
}

export async function getGramsForPortion(
  input: GetGramsForPortionInput,
  mockCatalog?: CachedFood[]
): Promise<GramsForPortionResult | null> {
  const parsed = getGramsForPortionSchema.parse(input);
  const normalizedName = normalizeFoodQuery(parsed.foodName);
  const foodName = normalizedName;
  const nEquivalentes = parsed.nEquivalentes ?? 1;

  // 1. Check in-memory LRU Cache (0ms)
  const cached = foodCache.get(foodName);
  if (cached) {
    const totalGrams = Number((cached.gramsPerEquivalent * nEquivalentes).toFixed(1));
    const scale = totalGrams / 100;
    return {
      foodName,
      matchedName: cached.name,
      groupId: cached.groupId,
      nEquivalentes,
      totalGrams,
      gramsPerEquivalent: cached.gramsPerEquivalent,
      macros: {
        kcal: Number((cached.kcal100g * scale).toFixed(1)),
        proteinG: Number((cached.protein100g * scale).toFixed(1)),
        fatG: Number((cached.fat100g * scale).toFixed(1)),
        choG: Number((cached.cho100g * scale).toFixed(1)),
      },
      fromCache: true,
    };
  }

  // 2. Mock catalog fallback for unit tests without DB
  if (mockCatalog) {
    const normQuery = foodName.toLowerCase();
    const match = mockCatalog.find(
      (f) =>
        f.name.toLowerCase().includes(normQuery) ||
        normQuery.split(" ").every((w) => f.name.toLowerCase().includes(w)) ||
        (f.id && normQuery.includes(f.id))
    );
    if (match) {
      foodCache.set(foodName, match);
      const totalGrams = Number((match.gramsPerEquivalent * nEquivalentes).toFixed(1));
      const scale = totalGrams / 100;
      return {
        foodName,
        matchedName: match.name,
        groupId: match.groupId,
        nEquivalentes,
        totalGrams,
        gramsPerEquivalent: match.gramsPerEquivalent,
        macros: {
          kcal: Number((match.kcal100g * scale).toFixed(1)),
          proteinG: Number((match.protein100g * scale).toFixed(1)),
          fatG: Number((match.fat100g * scale).toFixed(1)),
          choG: Number((match.cho100g * scale).toFixed(1)),
        },
        fromCache: false,
      };
    }
    return null;
  }

  // 3. Database query with fuzzy search
  if (!db) {
    return null;
  }

  const results = await db
    .select()
    .from(foods)
    .where(ilike(foods.name, `%${foodName}%`))
    .limit(1);

  if (results.length === 0) {
    return null;
  }

  const item = results[0];
  const cachedItem: CachedFood = {
    id: item.id,
    name: item.name,
    groupId: item.groupId || "general",
    gramsPerEquivalent: item.gramsPerEquivalent,
    kcal100g: item.kcal100g || 0,
    protein100g: item.protein100g || 0,
    fat100g: item.fat100g || 0,
    cho100g: item.cho100g || 0,
  };

  foodCache.set(foodName, cachedItem);
  const totalGrams = Number((item.gramsPerEquivalent * nEquivalentes).toFixed(1));
  const scale = totalGrams / 100;

  return {
    foodName,
    matchedName: item.name,
    groupId: item.groupId || "general",
    nEquivalentes,
    totalGrams,
    gramsPerEquivalent: item.gramsPerEquivalent,
    macros: {
      kcal: Number(((item.kcal100g || 0) * scale).toFixed(1)),
      proteinG: Number(((item.protein100g || 0) * scale).toFixed(1)),
      fatG: Number(((item.fat100g || 0) * scale).toFixed(1)),
      choG: Number(((item.cho100g || 0) * scale).toFixed(1)),
    },
    fromCache: false,
  };
}
