# Tasks: Strict Tool Calling & SMAE Synonym Search

## Phase 1: Test-First Invariants (TDD)

- [x] 1.1 [RED] Write `tests/tools/synonyms.test.ts` testing alias mapping and fuzzy normalization.

---

## Phase 2: Implementation (TDD)

- [x] 2.1 [GREEN] Create `agent/utils/synonyms.ts`.
- [x] 2.2 [GREEN] Wire `normalizeFoodQuery` into `getGramsForPortion.ts` and `coverageForAmount.ts`.
- [x] 2.3 [GREEN] Set `qwen/qwen3.6-27b` as primary model in `agent/cli.ts` & `agent/agent.ts`.
- [x] 2.4 [GREEN] Update `agent/instructions.md` with strict portion tool mandate.
- [x] 2.5 [GREEN] Verify all tests pass (`npm run typecheck` & `npm run test`).

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run test` (100% passing across 15 test suites).
- [x] 3.2 Verify `getGramsForPortion` for "jitomate rojo" returns 113g and "manzana" returns 106g.
