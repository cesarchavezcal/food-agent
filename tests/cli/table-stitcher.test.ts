import { describe, it, expect } from "vitest";
import { sanitizeTerminalTableInput } from "../../agent/cli.js";
import { parseMarkdownMealPlanTable } from "../../agent/utils/tableParser.js";

describe("Terminal Table Stitcher (Multi-Line Row Wrap Recovery)", () => {
  it("should reassemble fragmented wrapped rows from narrow terminals", () => {
    const wrappedInput = `| ALTA DEMANDA — 2,550 kcal · 159 P · 73 L · 315 HC |          |
|        |            |      |       |
    | ------------------------------------------------- | -------- | ----------
| ------ | ---------- | ---- | ----- |
    | Grupo                                             | Almuerzo |
  Colación 1 | Comida | Colación 2 | Cena | Total |
    | Verduras                                          | 2        | ·
|
  1      | ·          | ·    | 3     |
    | Frutas                                            | 2        | 1
|
  ·      | 1          | ·    | 4     |
    | Cereal s/grasa                                    | 5        | 2
|
  4      | ·          | 3    | 14    |
    | AOA                                               | 5        | 2
|
  4      | ·          | 3    | 14    |
    | Leche                                             | 1        | ·
|
  ·      | ·          | 1    | 2     |
    | Grasa s/prot                                      | 2        | 1
|
  2      | 1          | 2    | 8     |
    | Grasa c/prot                                      | 1        | ·
|
  ·      | 1          | 1    | 3     |
    | Meta kcal                                         | 975      | 325
|
  555    | 175        | 585  | 2,550 |`;

    const sanitized = sanitizeTerminalTableInput(wrappedInput);
    const parsed = parseMarkdownMealPlanTable(sanitized);

    expect(parsed.isTable).toBe(true);
    expect(parsed.planName).toBe("ALTA DEMANDA");
    expect(parsed.dailyTotal.verdura).toBe(3);
    expect(parsed.dailyTotal.fruta).toBe(4);
    expect(parsed.dailyTotal.cereal_sg).toBe(14);
    expect(parsed.targetKcal).toBe(2550);
  });
});
