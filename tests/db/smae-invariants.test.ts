import { describe, it, expect } from "vitest";
import { parseSmaeWorkbook } from "../../agent/db/import-excel.js";

describe("SMAE Clinical Golden Invariants", () => {
  const { foods, groups } = parseSmaeWorkbook("data/smae.xlsx");

  it("should parse all 19 standard equivalent groups", () => {
    expect(groups.length).toBe(19);
  });

  it("should accurately parse 30g for chicken breast (Pechuga de pollo)", () => {
    const pechugaCruda = foods.find((f) =>
      f.name.toLowerCase().includes("pechuga de pollo deshuesada sin piel cruda")
    );
    expect(pechugaCruda).toBeDefined();
    expect(pechugaCruda?.gramsPerEquivalent).toBe(30);
    expect(pechugaCruda?.suggestedQuantity).toBe(30);
    expect(pechugaCruda?.suggestedUnit).toBe("g");

    const pechugaPlancha = foods.find((f) =>
      f.name.toLowerCase().includes("pechuga de pollo sin piel a la plancha")
    );
    expect(pechugaPlancha).toBeDefined();
    expect(pechugaPlancha?.gramsPerEquivalent).toBe(30);
  });

  it("should accurately parse 106g for apple (Manzana)", () => {
    const manzana = foods.find((f) => f.name.toLowerCase() === "manzana" || f.name.toLowerCase().startsWith("manzana "));
    expect(manzana).toBeDefined();
    expect(manzana?.gramsPerEquivalent).toBe(106);
  });

  it("should accurately parse 30g for corn tortilla (Tortilla de maíz)", () => {
    const tortilla = foods.find((f) => f.name.toLowerCase().trim() === "tortilla de maíz");
    expect(tortilla).toBeDefined();
    expect(tortilla?.gramsPerEquivalent).toBe(30);
  });

  it("should accurately parse 5g for olive oil (Aceite de oliva)", () => {
    const aceite = foods.find((f) => f.name.toLowerCase().includes("aceite de oliva"));
    expect(aceite).toBeDefined();
    expect(aceite?.gramsPerEquivalent).toBe(5);
  });

  it("should accurately parse 47g for cooked white rice (Arroz blanco cocido)", () => {
    const arroz = foods.find((f) => f.name.toLowerCase().includes("arroz blanco cocido") || f.name.toLowerCase().includes("arroz cocido"));
    expect(arroz).toBeDefined();
    expect(arroz?.gramsPerEquivalent).toBe(47);
  });
});
