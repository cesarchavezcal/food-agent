import { describe, it, expect } from "vitest";
import { extractRetryDelay, pruneMessagesWindow } from "../../agent/cli.js";

describe("Rate Limit Resilience (extractRetryDelay & pruneMessagesWindow)", () => {
  it("should extract delay seconds from Groq error message", () => {
    const errorMsg = "Rate limit reached on TPM: Limit 8000, Used 5648. Please try again in 6.4275s. Need more tokens?";
    const delayMs = extractRetryDelay(errorMsg);
    // 6.4275 * 1000 + 500 buffer = 6928ms (approx 7000ms)
    expect(delayMs).toBeGreaterThanOrEqual(6000);
    expect(delayMs).toBeLessThanOrEqual(8000);
  });

  it("should default to 5000ms if no explicit timestamp is found", () => {
    const genericError = "Rate limit reached. Please wait.";
    expect(extractRetryDelay(genericError)).toBe(5000);
  });

  it("should prune conversation messages to sliding window keeping system prompt", () => {
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: "system instructions" },
      { role: "user", content: "m1" },
      { role: "assistant", content: "r1" },
      { role: "user", content: "m2" },
      { role: "assistant", content: "r2" },
      { role: "user", content: "m3" },
      { role: "assistant", content: "r3" },
      { role: "user", content: "m4" },
      { role: "assistant", content: "r4" },
      { role: "user", content: "m5" },
    ];

    const pruned = pruneMessagesWindow(messages, 4);
    expect(pruned[0].role).toBe("system");
    expect(pruned.length).toBe(5); // 1 system + 4 recent
    expect(pruned[1].content).toBe("r3");
    expect(pruned[4].content).toBe("m5");
  });
});
