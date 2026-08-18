import { describe, it, expect } from "vitest";
import { listPlans } from "../../agent/tools/listPlans.js";

describe("listPlans Tool", () => {
  it("should return a list of registered plans with meals and portions", async () => {
    const res = await (listPlans as any).execute({});
    expect(res).toBeDefined();
    expect(Array.isArray(res.plans)).toBe(true);
  });
});
