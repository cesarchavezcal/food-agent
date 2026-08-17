# Tasks: Live Status Spinner in CLI

## Phase 1: Test-First Invariants (TDD)

- [x] 1.1 [RED] Write `tests/cli/spinner.test.ts` testing spinner lifecycle (`start`, `update`, `stop`).

---

## Phase 2: Implementation (TDD)

- [x] 2.1 [GREEN] Implement `createCliSpinner` in `agent/cli.ts`.
- [x] 2.2 [GREEN] Hook spinner into `tools` and `main` loop in `agent/cli.ts`.
- [x] 2.3 [GREEN] Verify all tests pass (`npm run typecheck` & `npm run test`).

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run test` (100% passing across 12 test suites).
- [x] 3.2 Verify interactive spinner visual feedback.
