# Implementation Plan: Fix Groq Model Configuration & Fallbacks

Fix `The model llama-3.3-70b-versatile does not exist or you do not have access to it` by updating default model to `openai/gpt-oss-120b` (or `qwen/qwen3.6-27b`) and supporting `GROQ_MODEL` environment override.

## User Review Required

> [!IMPORTANT]
> **Root Cause**:
> Groq updated its available model IDs. The endpoint now provides `openai/gpt-oss-120b`, `openai/gpt-oss-20b`, and `qwen/qwen3.6-27b`. Hardcoding `llama-3.3-70b-versatile` caused Groq API 404 access errors.

---

## Proposed Changes

### Component 1: Agent Runtime & CLI Model Updates

#### [MODIFY] `agent/agent.ts`
Update model resolution to use `process.env.GROQ_MODEL || "openai/gpt-oss-120b"`.

#### [MODIFY] `agent/cli.ts`
Update model resolution and display string to use `process.env.GROQ_MODEL || "openai/gpt-oss-120b"`.

#### [MODIFY] `.env.example`
Add `GROQ_MODEL=openai/gpt-oss-120b` configuration documentation.

---

## Verification Plan

### Automated Verification
```bash
npm run typecheck
npm run test
```

### End-to-End Query Verification
```bash
printf "porcion de manzana\nsalir\n" | npm run dev
```
- Verify the agent receives the prompt, executes `getGramsForPortion`, and responds with the clinical SMAE portion in Spanish.
