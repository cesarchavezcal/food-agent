# Implementation Plan: Model Fallback Cascade & High-Throughput Configuration

Implement an automatic **Model Fallback Cascade** (`openai/gpt-oss-20b` $\rightarrow$ `qwen/qwen3.6-27b` $\rightarrow$ `openai/gpt-oss-120b`) so that if a default model is ever deprecated, sunsetted, or hits unexpected availability issues, the agent automatically fails over to the next healthy candidate without crashing.

---

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions**:
> 1. **Primary Model**: `openai/gpt-oss-20b` (fast, lightweight, generous TPM headroom).
> 2. **Fallback Chain**: `[process.env.GROQ_MODEL, "openai/gpt-oss-20b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"]`.
> 3. **Automatic Failover**: If a model returns `404`, `model_decommissioned`, or `model_not_found`, it automatically advances to the next model and continues the turn.

---

## Proposed Changes

### Component 1: Model Cascade Engine (`agent/cli.ts` & `agent/agent.ts`)

#### [MODIFY] `agent/cli.ts`
- Implement `MODEL_CANDIDATES` array.
- Update `generateTextWithRetry` to support model fallback:
  - If error indicates model expiration (`model_not_found`, `decommissioned`, `404`), logs a friendly notification and switches to the next candidate model.

#### [MODIFY] `agent/agent.ts`
- Update default model in Eve agent runtime to `openai/gpt-oss-20b`.

---

## Verification Plan

### Automated Tests
```bash
npm run test
npm run typecheck
```
- `tests/cli/model-cascade.test.ts`: Verify model fallback chain transitions to the next available candidate on 404/decommission errors.

### Manual Verification
- Run `npm run dev` and verify active model banner.
- Test with an invalid `GROQ_MODEL=non-existent-model npm run dev` to verify automatic failover to `openai/gpt-oss-20b`.
