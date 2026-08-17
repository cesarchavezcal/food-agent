# Tasks: Meal Planning Tools & Security Guardrails

## Phase 1: Test-First Invariants (TDD)

- [x] 1.1 [RED] Write `tests/tools/planning.test.ts` testing `saveMealPlan`, `setWeeklySchedule`, and granular `getPlanPortions`.
- [x] 1.2 [RED] Write `tests/agent/guardrails.test.ts` asserting strict domain security constraints.

---

## Phase 2: Implementation (TDD)

- [x] 2.1 [GREEN] Implement `agent/tools/saveMealPlan.ts`.
- [x] 2.2 [GREEN] Implement `agent/tools/setWeeklySchedule.ts`.
- [x] 2.3 [GREEN] Update `agent/tools/getPlanPortions.ts` with granular per-meal breakdowns.
- [x] 2.4 [GREEN] Update `agent/instructions.md` with explicit out-of-scope security policies.
- [x] 2.5 [GREEN] Register new planning tools in `agent/agent.ts` and `agent/cli.ts`.

---

## Phase 3: Verification & SDD Closeout

- [x] 3.1 Run `npm run typecheck` and `npm run test` (100% passing).
- [x] 3.2 Verify interactive dev REPL with off-topic and meal planning queries.
