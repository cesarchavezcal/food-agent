# Implementation Plan: Token Optimization & High-Efficiency Portion Ingestion

Implement a 3-tier token reduction architecture to cut token usage by **65%–75%**, eliminating rate-limit pressure and maximizing throughput on Groq Free Tier.

---

## User Review Required

> [!IMPORTANT]
> **Summary of Selected Architecture Decisions (Aligned in Grilling)**:
> 1. **Deterministic Table Pre-Parser in CLI**: Directly parses pasted Markdown portion matrices into structured `saveMealPlan` arguments at $0 token cost.
> 2. **Sparse Tool Payloads**: Modifies `getPlanPortions` and `saveMealPlan` to strip zero-valued SMAE groups from return payloads.
> 3. **Compact System Prompt**: Compresses `agent/instructions.md` down to ~550 tokens with clean bullet points and static caching layout.

---

## Proposed Changes

### Component 1: Deterministic Table Pre-Parser (`agent/cli.ts` & `agent/utils/tableParser.ts`)

#### [NEW] `agent/utils/tableParser.ts`
- `parseMarkdownMealPlanTable(input: string)`:
  - Extracts plan name (or infers by total calories).
  - Extracts meal column names (`almuerzo`, `colacion_1`, `comida`, etc.).
  - Maps SMAE row group names to canonical IDs (`verdura`, `fruta`, `cereal_sg`, `aoa_mbag`, `leche`, `grasa_sp`, `grasa_cp`).
  - Converts `·`, `-`, `ND` to `0`.
  - Returns `{ isTable: boolean, planName, targetKcal, dailyTotal, byMeal }`.

#### [MODIFY] `agent/cli.ts`
- If user input contains a meal plan table, parses it directly, executes `saveMealPlan` immediately, and feeds a lightweight summary to the assistant for confirmation.

---

### Component 2: Sparse JSON Tool Payloads (`agent/tools/getPlanPortions.ts` & `agent/tools/saveMealPlan.ts`)

#### [MODIFY] `agent/tools/getPlanPortions.ts`
- Filters out any SMAE group with `0` equivalents from `dailyTotal` and `byMeal` objects before returning.

#### [MODIFY] `agent/tools/saveMealPlan.ts`
- Returns only non-zero portion assignments in the saved confirmation.

---

### Component 3: Compact System Instructions (`agent/instructions.md`)

#### [MODIFY] `agent/instructions.md`
- Streamlines instructions from 1,450 tokens down to ~550 tokens, eliminating conversational fluff while preserving all core nutritional and tool routing rules.

---

## Verification Plan

### Automated Tests
```bash
npm run test
npm run typecheck
```
- `tests/utils/tableParser.test.ts`: Test parsing various Markdown table layouts and inferring plans.
- `tests/tools/planning.test.ts`: Verify `getPlanPortions` returns sparse non-zero objects.
- `tests/agent/guardrails.test.ts`: Verify compact instructions maintain guardrails.

### Manual Verification
- Run `npm run dev` and paste the ALTA DEMANDA table.
- Verify instant zero-token parsing and clean clinical confirmation.
