import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Agent Chat Table Ingestion Contract", () => {
  const instructionsPath = path.resolve("agent/instructions.md");
  const instructionsContent = fs.readFileSync(instructionsPath, "utf-8");

  it("should explicitly instruct the agent to treat '·' or '-' as 0 equivalents", () => {
    expect(instructionsContent).toContain("·");
    expect(instructionsContent.toLowerCase()).toContain("0");
  });

  it("should contain explicit directive to immediately execute saveMealPlan when receiving a table", () => {
    expect(instructionsContent).toContain("saveMealPlan");
    expect(instructionsContent.toLowerCase()).toContain("descanso");
    expect(instructionsContent.toLowerCase()).toContain("alta demanda");
  });
});
