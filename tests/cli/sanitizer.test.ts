import { describe, it, expect } from "vitest";
import { sanitizeTerminalTableInput } from "../../agent/cli.js";

describe("Terminal Table Sanitizer (sanitizeTerminalTableInput)", () => {
  it("should re-assemble table lines fragmented by terminal width wrapping", () => {
    const rawFragmented = `Guarda este plan: DÍA DE PIERNAS (3,000 kcal)
    | Grupo          | Pre-Workout | Almuerzo | Post-
  Workout | Cena | Total |
    | -------------- | ----------- | -------- | ------------
| ---- | ----- |
    | Verduras       | ·           | 2        | ·
|
  2    | 4     |
    | Frutas         | 2           | 1        | 2
|
  ·    | 5     |
    | Cereal s/grasa | 3           | 4        | 4
|
  3    | 14    |
    | AOA            | 2           | 4        | 4
|
  3    | 13    |
    | Leche          | ·           | 1        | 1
|
  1    | 3     |
    | Grasa s/prot   | ·           | 2        | ·
|
  2    | 4     |
    | Grasa c/prot   | 1           | 1        | 1
|
  1    | 4     |`;

    const cleaned = sanitizeTerminalTableInput(rawFragmented);

    expect(cleaned).toContain("| Grupo | Pre-Workout | Almuerzo | Post- Workout | Cena | Total |");
    expect(cleaned).toContain("| Verduras | · | 2 | · | 2 | 4 |");
    expect(cleaned).toContain("| Frutas | 2 | 1 | 2 | · | 5 |");
    expect(cleaned).toContain("| Cereal s/grasa | 3 | 4 | 4 | 3 | 14 |");
    expect(cleaned).toContain("| AOA | 2 | 4 | 4 | 3 | 13 |");
    expect(cleaned).toContain("| Leche | · | 1 | 1 | 1 | 3 |");
    expect(cleaned).toContain("| Grasa s/prot | · | 2 | · | 2 | 4 |");
    expect(cleaned).toContain("| Grasa c/prot | 1 | 1 | 1 | 1 | 4 |");
  });

  it("should preserve normal text messages without modifying them", () => {
    const normalText = "Hola, cuántos gramos son 2 equivalentes de pechuga de pollo?";
    expect(sanitizeTerminalTableInput(normalText)).toBe(normalText);
  });
});
