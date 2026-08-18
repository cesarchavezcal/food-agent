# Tasks: Model Fallback Cascade & High-Throughput Default

## Phase 1: Test-First Invariants (TDD)

- [x] 1.1 [RED] Write `tests/cli/model-cascade.test.ts` testing `getModelCascade` and error classification.

---

## Phase 2: Implementation (TDD)

- [x] 2.1 [GREEN] Implement `getModelCascade` and `generateTextWithFallback` in `agent/cli.ts`.
- [x] 2.2 [GREEN] Update default model in `agent/agent.ts` to `openai/gpt-oss-20b`.
- [x] 2.3 [GREEN] Verify all tests pass (`npm run typecheck` & `npm run test`).

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run test` (100% passing across 14 test suites).
- [x] 3.2 Verify CLI launches with `openai/gpt-oss-20b`.
