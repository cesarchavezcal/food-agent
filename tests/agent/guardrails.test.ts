import { describe, it, expect } from "vitest";
import * as fs from "node:fs";
import * as path from "node:path";

describe("Agent Domain Security & Guardrails", () => {
  const instructionsPath = path.resolve("agent/instructions.md");
  const instructionsContent = fs.readFileSync(instructionsPath, "utf-8");

  it("should explicitly document domain boundary and off-topic rejection rules", () => {
    expect(instructionsContent.toLowerCase()).toContain("scope & domain boundary constraints");
    expect(instructionsContent.toLowerCase()).toContain("never answer off-topic questions");
  });

  it("should contain standard clinical refusal template", () => {
    expect(instructionsContent.toLowerCase()).toContain("clinical nutrition");
    expect(instructionsContent.toLowerCase()).toContain("diet");
  });
});
