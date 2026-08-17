import { describe, it, expect } from "vitest";
import { EventEmitter } from "node:events";
import { readMultilineInput } from "../../agent/cli.js";

describe("CLI Multiline Input Reader (readMultilineInput)", () => {
  it("should buffer rapid-fire multiline pastes into a single unified string", async () => {
    const mockEmitter = new EventEmitter();
    const promptWritten: string[] = [];

    const promise = readMultilineInput(mockEmitter as any, (prompt) => {
      promptWritten.push(prompt);
    });

    // Simulate rapid clipboard paste of 3 lines in 5ms intervals
    mockEmitter.emit("line", "Guarda este plan: DÍA DE PIERNAS (3,000 kcal)");
    await new Promise((r) => setTimeout(r, 10));
    mockEmitter.emit("line", "| Grupo | Pre-Workout | Almuerzo | Total |");
    await new Promise((r) => setTimeout(r, 10));
    mockEmitter.emit("line", "| Verduras | · | 2 | 2 |");

    const result = await promise;

    expect(result).toBe(
      "Guarda este plan: DÍA DE PIERNAS (3,000 kcal)\n| Grupo | Pre-Workout | Almuerzo | Total |\n| Verduras | · | 2 | 2 |"
    );
  });
});
