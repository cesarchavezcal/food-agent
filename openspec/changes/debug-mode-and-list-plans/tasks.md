# Tasks: CLI Debug Mode & `listPlans` Tool

## Phase 1: Test-First Invariants (TDD)

- [x] 1.1 [RED] Write `tests/tools/listPlans.test.ts` testing `listPlans` tool schema and execution.
- [x] 1.2 [RED] Write `tests/cli/table-stitcher.test.ts` testing wrapped terminal table line reassembly.

---

## Phase 2: Implementation (TDD)

- [x] 2.1 [GREEN] Create `agent/tools/listPlans.ts` and register in `agent/agent.ts` & `agent/cli.ts`.
- [x] 2.2 [GREEN] Enhance `sanitizeTerminalTableInput` to stitch multi-line wrapped rows.
- [x] 2.3 [GREEN] Add `--debug` / `DEBUG=1` real-time trace logger in `agent/cli.ts`.
- [x] 2.4 [GREEN] Add empty text guard & failover in `agent/cli.ts`.
- [x] 2.5 [GREEN] Verify all tests pass (`npm run typecheck` & `npm run test`).

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run test` (100% passing across 17 test suites).
- [x] 3.2 Verify `listPlans` lists registered plans from DB.
