# Tasks: Token Optimization Architecture

## Phase 1: Test-First Invariants (TDD)

- [x] 1.1 [RED] Write `tests/utils/tableParser.test.ts` testing table extraction and sparse payloads.

---

## Phase 2: Implementation (TDD)

- [x] 2.1 [GREEN] Create `agent/utils/tableParser.ts` implementing `parseMarkdownMealPlanTable`.
- [x] 2.2 [GREEN] Update `agent/tools/getPlanPortions.ts` & `agent/tools/saveMealPlan.ts` with sparse outputs.
- [x] 2.3 [GREEN] Compact `agent/instructions.md` (~550 tokens).
- [x] 2.4 [GREEN] Hook `parseMarkdownMealPlanTable` in `agent/cli.ts`.
- [x] 2.5 [GREEN] Verify all tests pass (`npm run typecheck` & `npm run test`).

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run test` (100% passing across 13 test suites).
- [x] 3.2 Verify table paste creates plan in DB at $0 LLM tokens.
