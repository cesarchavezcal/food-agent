/**
 * Common Mexican food synonyms and colloquial aliases mapped to standard SMAE catalog names.
 */
const SYNONYMS_MAP: Record<string, string> = {
  "jitomate rojo": "jitomate",
  "jitomate saladet": "jitomate guaje o saladet",
  "jitomate bola": "jitomate bola",
  "tomate rojo": "jitomate",
  "tomate": "jitomate",
  "pechuga": "pechuga de pollo",
  "pechuga asada": "pechuga de pollo asada",
  "huevo": "huevo fresco",
  "claras": "clara de huevo",
  "arroz": "arroz cocido",
  "frijoles": "frijol cocido",
  "lentejas": "lenteja cocida",
  "avena": "avena en hojuelas",
  "platano": "plátano",
  "aceite de oliva": "aceite de oliva",
  "aguacate": "aguacate",
};

/**
 * Normalizes input search query using synonym dictionary.
 */
export function normalizeFoodQuery(query: string): string {
  const trimmed = query.trim().toLowerCase();
  if (SYNONYMS_MAP[trimmed]) {
    return SYNONYMS_MAP[trimmed];
  }
  return trimmed;
}
