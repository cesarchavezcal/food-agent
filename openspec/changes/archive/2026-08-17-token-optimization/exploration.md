# Exploration: Token Optimization Architecture (`token-optimization`)

## Current State

Currently, every interaction consumes **~3,200 tokens** per turn on Groq:
- `instructions.md`: ~1,450 tokens.
- Tool schemas: ~1,100 tokens.
- Tool response payloads (dense, all 15 SMAE groups included with 0s): ~400 tokens.
- User input + table: ~250 tokens.

When pasting large Markdown tables, the entire ASCII matrix is parsed via LLM reasoning tokens, causing rate-limit pressure on Groq's 8,000 TPM limit.

---

## Affected Areas

- `agent/utils/tableParser.ts` [NEW] — Deterministic zero-token Markdown meal plan table extractor.
- `agent/cli.ts` [MOD] — Integrates pre-parser to save plans directly at $0 token cost.
- `agent/tools/getPlanPortions.ts` [MOD] — Filters out 0-value portion groups from payload.
- `agent/tools/saveMealPlan.ts` [MOD] — Returns sparse portion records in confirmation.
- `agent/instructions.md` [MOD] — Compacts system prompt from 1,450 to ~550 tokens.
- `tests/utils/tableParser.test.ts` [NEW] — Tests for parsing tables and inferring calories.

---

## Technical Approaches

### 1. Deterministic Table Pre-Parser (`tableParser.ts`)
- Detects Markdown table syntax (`| Grupo | ... |`).
- Extracts column headers (meals) and rows (SMAE groups).
- Auto-infers plan name if not explicit from title or calorie sum (2025 -> `DESCANSO`, 2375 -> `MEDIA`, 2550 -> `ALTA DEMANDA`).
- Converts `·`, `-`, `ND` to `0`.
- Executes `saveMealPlan` directly, bypassing the 3,000 token LLM parsing step.

### 2. Sparse JSON Tool Serialization
- Filters out all keys where `equivalentes === 0`.
- Turns a 15-key dense JSON dictionary into a 3-to-4 key sparse dictionary.
- Saves ~300 tokens on every tool invocation.

### 3. Compact Clinical System Prompt
- Rewrites `instructions.md` into crisp clinical invariants and tool routing rules.
- Drops conversational examples while retaining few-shot edge cases.
- Enables 100% prefix caching on Groq Free Tier.

---

## Recommendation

Implement all 3 approaches together. They are complementary and reduce per-turn token consumption by **65%–75%** (from 3,200 to ~900–1,100 tokens), increasing throughput from 2 queries/min to **7–8 queries/min**.

---

## Ready for Implementation
Yes — ready to proceed directly with `/sdd-apply`.
