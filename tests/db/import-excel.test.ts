import { describe, it, expect } from "vitest";
import { parseSmaeWorkbook, STANDARD_GROUPS } from "../../agent/db/import-excel.js";
import * as path from "path";

describe("SMAE Excel Importer (parseSmaeWorkbook)", () => {
  const excelPath = path.resolve("data/smae.xlsx");

  it("should successfully parse the standard SMAE sheets from data/smae.xlsx", () => {
    const result = parseSmaeWorkbook(excelPath);

    expect(result).toBeDefined();
    expect(result.groups.length).toBe(STANDARD_GROUPS.length);
    expect(result.foods.length).toBeGreaterThan(100);
  });

  it("should contain standard groups with proper baseline macros", () => {
    const { groups } = parseSmaeWorkbook(excelPath);

    const verduras = groups.find((g) => g.id === "verduras");
    expect(verduras).toBeDefined();
    expect(verduras?.kcal).toBe(25);
    expect(verduras?.choG).toBe(4);
    expect(verduras?.proteinG).toBe(2);

    const cereales = groups.find((g) => g.id === "cereales_sin_grasa");
    expect(cereales).toBeDefined();
    expect(cereales?.kcal).toBe(70);
    expect(cereales?.choG).toBe(15);

    const aoa = groups.find((g) => g.id === "aoa_muy_bajo_grasa");
    expect(aoa).toBeDefined();
    expect(aoa?.proteinG).toBe(7);
  });

  it("should parse foods with valid gramsPerEquivalent and per-100g scaled macros", () => {
    const { foods } = parseSmaeWorkbook(excelPath);

    const firstFood = foods[0];
    expect(firstFood.id).toBeDefined();
    expect(firstFood.name.length).toBeGreaterThan(0);
    expect(firstFood.gramsPerEquivalent).toBeGreaterThan(0);
    expect(firstFood.kcal100g).toBeGreaterThanOrEqual(0);
    expect(firstFood.source).toBe("excel");
  });
});
