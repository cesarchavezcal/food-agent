import { describe, it, expect } from "vitest";
import { parseMarkdownMealPlanTable } from "../../agent/utils/tableParser.js";

describe("Deterministic Markdown Meal Plan Table Parser", () => {
  it("should extract plan name, target calories, meals, and portions accurately", () => {
    const rawTable = `| ALTA DEMANDA — 2,550 kcal · 159 P · 73 L · 315 HC |          |            |        |            |      |       |
| ------------------------------------------------- | -------- | ---------- | ------ | ---------- | ---- | ----- |
| Grupo                                             | Almuerzo | Colación 1 | Comida | Colación 2 | Cena | Total |
| Verduras                                          | 2        | ·          | 1      | ·          | ·    | 3     |
| Frutas                                            | 2        | 1          | ·      | 1          | ·    | 4     |
| Cereal s/grasa                                    | 5        | 2          | 4      | ·          | 3    | 14    |
| AOA                                               | 5        | 2          | 4      | ·          | 3    | 14    |
| Leche                                             | 1        | ·          | ·      | ·          | 1    | 2     |
| Grasa s/prot                                      | 2        | 1          | 2      | 1          | 2    | 8     |
| Grasa c/prot                                      | 1        | ·          | ·      | 1          | 1    | 3     |
| Meta kcal                                         | 975      | 325        | 555    | 175        | 585  | 2,550 |`;

    const parsed = parseMarkdownMealPlanTable(rawTable);

    expect(parsed.isTable).toBe(true);
    expect(parsed.planName).toBe("ALTA DEMANDA");
    expect(parsed.targetKcal).toBe(2550);
    expect(parsed.targetProteinG).toBe(159);
    expect(parsed.targetLipidsG).toBe(73);
    expect(parsed.targetCarbsG).toBe(315);

    expect(parsed.dailyTotal.verdura).toBe(3);
    expect(parsed.dailyTotal.fruta).toBe(4);
    expect(parsed.dailyTotal.cereal_sg).toBe(14);
    expect(parsed.dailyTotal.aoa_mbag).toBe(14);
    expect(parsed.dailyTotal.leche_descremada).toBe(2);
    expect(parsed.dailyTotal.aceites_sin_proteina).toBe(8);
    expect(parsed.dailyTotal.aceites_con_proteina).toBe(3);

    expect(parsed.byMeal?.almuerzo?.verdura).toBe(2);
    expect(parsed.byMeal?.almuerzo?.cereal_sg).toBe(5);
    expect(parsed.byMeal?.cena?.cereal_sg).toBe(3);
  });

  it("should infer plan name from total calories if title is missing", () => {
    const rawTable = `| Grupo | Almuerzo | Colación 1 | Comida | Colación 2 | Cena | Total |
| Verduras | 2 | · | 1 | · | · | 3 |
| Frutas | 2 | · | · | 1 | · | 3 |
| Cereal s/grasa | 2.5 | · | 3 | · | 3 | 8.5 |
| AOA | 5 | 2 | 5 | · | 3 | 15 |
| Leche | 1 | · | · | · | 1 | 2 |
| Grasa s/prot | · | · | 1 | · | 1 | 2 |
| Grasa c/prot | 1 | 1 | 1 | 1 | 1 | 5 |
| Meta kcal | 710 | 150 | 550 | 130 | 540 | 2,025 |`;

    const parsed = parseMarkdownMealPlanTable(rawTable);

    expect(parsed.isTable).toBe(true);
    expect(parsed.planName).toBe("DESCANSO");
    expect(parsed.targetKcal).toBe(2025);
  });

  it("should return isTable: false for non-table chat messages", () => {
    const chatMsg = "Hola, cuántos gramos son 2 equivalentes de pechuga de pollo?";
    const parsed = parseMarkdownMealPlanTable(chatMsg);
    expect(parsed.isTable).toBe(false);
  });
});
