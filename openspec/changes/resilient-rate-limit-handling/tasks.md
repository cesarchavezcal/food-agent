# Tasks: Resilient Rate Limit Handling & Context Window Pruning

## Phase 1: Test-First Invariants (TDD)

- [x] 1.1 [RED] Write `tests/cli/retry.test.ts` testing `extractRetryDelay` parsing and sliding window behavior.

---

## Phase 2: Implementation (TDD)

- [x] 2.1 [GREEN] Implement `extractRetryDelay` and `generateTextWithRetry` with sleep spinner in `agent/cli.ts`.
- [x] 2.2 [GREEN] Add conversation sliding window in `agent/cli.ts`.
- [x] 2.3 [GREEN] Verify all tests pass (`npm run typecheck` & `npm run test`).

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run test` (100% passing across 11 test suites).
- [x] 3.2 Verify REPL resilience under rapid requests.
