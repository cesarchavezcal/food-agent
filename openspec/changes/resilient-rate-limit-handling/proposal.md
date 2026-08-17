# Change Proposal: Resilient Rate Limit Handling & Context Window Pruning

## Problem
On Groq's Free Tier, `openai/gpt-oss-120b` has an 8,000 TPM quota limit. Consecutive requests or multi-step tool calls can trigger transient 429 errors (`Rate limit reached ... Please try again in 6.4s`). Currently, the CLI runner fails instead of waiting and auto-recovering.

## Solution
1. Add `extractRetryDelay` and automatic backoff sleep in `agent/cli.ts` so when a 429 occurs, it automatically pauses for the exact requested duration (e.g. 6.5s) and retries cleanly.
2. Maintain a sliding window of the last 4 messages in `agent/cli.ts` to prevent token bloat from eating into TPM quota.
