# Tasks: Fix SMAE Excel Header Parsing and Invariants

## Phase 1: Test-First Invariants Suite (TDD)

- [x] 1.1 [RED] Write `tests/db/smae-invariants.test.ts` asserting exact clinical portions for canonical foods (`pechuga` = 30g, `manzana` = 106g, `tortilla` = 30g, `aceite` = 5g, `arroz` = 47g).

---

## Phase 2: Implementation & Parser Hardening

- [x] 2.1 [GREEN] Update `agent/db/import-excel.ts` with dynamic header row discovery (matching `peso neto` / `cantidad sugerida`) and strict column index validation.
- [x] 2.2 [GREEN] Update `seedDatabase()` in `agent/db/import-excel.ts` to use `onConflictDoUpdate` for the `foods` table.
- [x] 2.3 [GREEN] Run `npm run db:seed` to refresh all 2,357 foods in Neon Postgres with exact clinical data.

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run test` and `npm run typecheck` to verify all 24 tests pass 100%.
- [x] 3.2 Verify live agent query returns 30g for chicken breast.
