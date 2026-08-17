# Tasks: SMAE Diet Agent Core (`smae-diet-agent`)

## Review Workload Forecast

| Field | Value |
|---|---|
| Estimated changed lines | ~320–380 lines |
| 400-line budget risk | Medium |
| Chained PRs recommended | No |
| Suggested split | Single PR (atomic vertical feature) |
| Delivery strategy | single-pr |
| Chain strategy | stacked-to-main |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: stacked-to-main
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|---|---|---|---|---|---|
| 1 | DB Schema, Neon Client & Excel Seed | PR 1 | `npx vitest run tests/db/import-excel.test.ts` | `npm run db:seed` | `agent/db/` |
| 2 | Pure TypeScript Tools & LRU Cache | PR 1 | `npx vitest run tests/tools/` | `npx tsx scripts/test-tools.ts` | `agent/tools/` |
| 3 | Eve Agent Runtime & Instructions | PR 1 | `npx vitest run` | `npx eve dev` | `agent/agent.ts`, `agent/instructions.md` |

---

## Phase 1: Foundation, DB Schema & Excel Seeding

- [x] 1.1 Configure `package.json`, `tsconfig.json`, and `drizzle.config.ts` with dependencies (`drizzle-orm`, `@neondatabase/serverless`, `@ai-sdk/groq`, `xlsx`, `zod`, `vitest`).
- [x] 1.2 Implement `agent/db/schema.ts` with Drizzle tables (`equivalent_groups`, `foods`, `plans`, `weekly_schedule`, `daily_logs`) and `pg_trgm` index.
- [x] 1.3 Implement `agent/db/client.ts` for Neon serverless connection.
- [x] 1.4 Implement `agent/db/import-excel.ts` to parse `data/smae.xlsx` and seed groups/foods idempotently.
- [x] 1.5 Write integration test `tests/db/import-excel.test.ts` verifying sheet parsing and catalog row counts.

---

## Phase 2: Deterministic Tools & In-Memory LRU Cache (TDD)

- [x] 2.1 [RED] Write unit tests in `tests/tools/cache.test.ts` for in-memory LRU cache hits, misses, and invalidation.
- [x] 2.2 [GREEN] Implement `agent/tools/cache.ts` with sub-millisecond food lookup caching.
- [x] 2.3 [RED] Write unit tests in `tests/tools/calculator.test.ts` for `getGramsForPortion`, `coverageForAmount`, and composite macro solving (15g CHO / 7g Prot / 5g Lip).
- [x] 2.4 [GREEN] Implement `agent/tools/getGramsForPortion.ts`, `agent/tools/coverageForAmount.ts`, and `agent/tools/logNutritionFacts.ts`.
- [x] 2.5 [RED] Write unit tests in `tests/tools/tracking.test.ts` for `getPlanPortions`, `logFood`, and `getDailySummary`.
- [x] 2.6 [GREEN] Implement `agent/tools/getPlanPortions.ts`, `agent/tools/logFood.ts`, and `agent/tools/getDailySummary.ts`.

---

## Phase 3: Eve Agent Runtime & Instructions

- [x] 3.1 Implement `agent/instructions.md` with Mexican Spanish clinical persona, SMAE rules, and strict tool delegation policies.
- [x] 3.2 Implement `agent/agent.ts` configuring Vercel Eve runtime with `@ai-sdk/groq` (`llama-3.3-70b-versatile`) and tool registry.
- [x] 3.3 Create `.env.example` documenting `DATABASE_URL` and `GROQ_API_KEY`.

---

## Phase 4: Verification & E2E Validation

- [x] 4.1 Run full automated test suite `npm run test` ensuring 100% pass across all mathematical tools and DB seeders.
- [x] 4.2 Validate interactive local agent execution with `npx eve dev`.
