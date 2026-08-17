# Tasks: Robust Chat Table Ingestion

## Phase 1: Test-First Invariants (TDD)

- [x] 1.1 [RED] Write `tests/agent/table-ingestion.test.ts` testing instructions contract for dot symbol `·` resolution and auto-inference rules.

---

## Phase 2: Implementation (TDD)

- [x] 2.1 [GREEN] Update `agent/instructions.md` with explicit Few-Shot table recognition and immediate `saveMealPlan` execution directive.
- [x] 2.2 [GREEN] Verify all tests pass (`npm run typecheck` & `npm run test`).

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run test` (100% passing across 8 suites).
- [x] 3.2 Verify table paste in REPL executes `saveMealPlan` directly.
