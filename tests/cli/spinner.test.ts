import { describe, it, expect } from "vitest";
import { createCliSpinner } from "../../agent/cli.js";

describe("CLI Live Status Spinner (createCliSpinner)", () => {
  it("should start, update text, and cleanly stop without throwing", async () => {
    const writes: string[] = [];
    const mockStream = {
      write: (data: string) => {
        writes.push(data);
        return true;
      },
    };

    const spinner = createCliSpinner(mockStream as any);
    spinner.start("Pensando...");
    expect(writes.length).toBeGreaterThan(0);
    expect(writes[writes.length - 1]).toContain("Pensando...");

    spinner.update("Ejecutando saveMealPlan...");
    expect(writes[writes.length - 1]).toContain("saveMealPlan");

    spinner.stop();
    // Stop should erase the line with \r\x1b[K
    expect(writes[writes.length - 1]).toContain("\r\x1b[K");
  });
});
