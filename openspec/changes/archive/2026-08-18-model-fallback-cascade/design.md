# Design: Model Fallback Cascade

## Architecture

### `getModelCascade(envModel?: string): string[]` in `agent/cli.ts`
- Returns deduplicated array: `[envModel, "openai/gpt-oss-20b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"].filter(Boolean)`.

### `generateTextWithFallback(options, models: string[])` in `agent/cli.ts`
- Tries model at `models[idx]`.
- Catches:
  - 429 Rate Limits $\rightarrow$ waits and retries on current model.
  - 404 / `model_not_found` / `decommissioned` / `400` $\rightarrow$ advances `idx++`, logs failover notice, and retries.
