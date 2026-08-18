import { describe, it, expect } from "vitest";
import { getModelCascade, isModelNotFoundError } from "../../agent/cli.js";

describe("Model Fallback Cascade (getModelCascade & isModelNotFoundError)", () => {
  it("should return fallback chain with default model first when no env model is set", () => {
    const cascade = getModelCascade();
    expect(cascade[0]).toBe("qwen/qwen3.6-27b");
    expect(cascade).toContain("openai/gpt-oss-120b");
    expect(cascade).toContain("openai/gpt-oss-20b");
  });

  it("should place explicit env model at the head of the cascade without duplicates", () => {
    const cascade = getModelCascade("custom/my-model");
    expect(cascade[0]).toBe("custom/my-model");
    expect(cascade[1]).toBe("qwen/qwen3.6-27b");
  });

  it("should identify 404 and model deprecation errors", () => {
    expect(isModelNotFoundError(new Error("Model `deprecated-model` not found or decommissioned"))).toBe(true);
    expect(isModelNotFoundError({ status: 404, message: "Not found" })).toBe(true);
    expect(isModelNotFoundError(new Error("Rate limit reached"))).toBe(false);
  });
});
