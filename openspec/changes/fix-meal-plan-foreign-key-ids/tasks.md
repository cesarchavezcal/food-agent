# Tasks: Fix Meal Plan Foreign Key Group IDs

## Phase 1: Test-First Invariants (TDD)

- [x] 1.1 [RED] Update `tests/utils/tableParser.test.ts` & `tests/cli/table-stitcher.test.ts` to assert canonical DB group IDs.

---

## Phase 2: Implementation (TDD)

- [x] 2.1 [GREEN] Update `agent/utils/tableParser.ts` group mappings to match Postgres schema.
- [x] 2.2 [GREEN] Add `normalizeSmaeGroupId` inside `agent/tools/saveMealPlan.ts`.
- [x] 2.3 [GREEN] Update `agent/cli.ts` to guard `if (!saved.success)` and surface errors cleanly.
- [x] 2.4 [GREEN] Verify all tests pass (`npm run typecheck` & `npm run test`).

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run test` (100% passing across 17 test suites).
- [x] 3.2 Verify live database insertion with full user table.
