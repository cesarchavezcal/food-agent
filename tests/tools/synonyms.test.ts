import { describe, it, expect } from "vitest";
import { normalizeFoodQuery } from "../../agent/utils/synonyms.js";

describe("Food Synonyms & Alias Normalization", () => {
  it("should normalize common Mexican colloquial food names", () => {
    expect(normalizeFoodQuery("jitomate rojo")).toBe("jitomate");
    expect(normalizeFoodQuery("jitomate saladet")).toBe("jitomate guaje o saladet");
    expect(normalizeFoodQuery("pechuga")).toBe("pechuga de pollo");
    expect(normalizeFoodQuery("huevo")).toBe("huevo fresco");
    expect(normalizeFoodQuery("arroz")).toBe("arroz cocido");
  });

  it("should preserve standard names intact", () => {
    expect(normalizeFoodQuery("manzana")).toBe("manzana");
    expect(normalizeFoodQuery("pechuga de pollo cocida desmenuzada")).toBe("pechuga de pollo cocida desmenuzada");
  });
});
