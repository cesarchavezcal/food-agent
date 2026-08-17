# Implementation Plan: Fix `db:setup` DDL and `dev` Runner

Address both runtime errors:
1. Replace `drizzle-kit push` with deterministic native SQL DDL in `scripts/init-db.ts` to permanently resolve `error: column "id" is in a primary key`.
2. Install `eve` locally (`npm i -D eve`) and build an interactive terminal REPL `agent/cli.ts` with real-time streaming, tool execution traces, and conversational history for `npm run dev`.

## User Review Required

> [!IMPORTANT]
> **Root Cause & Fix Summary**:
> 1. **Database Schema Issue**: `drizzle-kit push` fails when primary key constraints already exist on PostgreSQL tables. We replace it with `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS` in `scripts/init-db.ts`.
> 2. **Dev Runner Issue**: `npx eve dev` failed because `eve` was not installed as a local package dependency. We install `eve@latest` as a dev dependency and provide a built-in terminal runner `agent/cli.ts` powered by Vercel AI SDK and Groq.

---

## Proposed Changes

### Component 1: Deterministic Database DDL (`scripts/init-db.ts`)

#### [MODIFY] `scripts/init-db.ts`
Add complete schema creation DDL:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS equivalent_groups (...);
CREATE TABLE IF NOT EXISTS foods (...);
CREATE TABLE IF NOT EXISTS plans (...);
CREATE TABLE IF NOT EXISTS weekly_schedule (...);
CREATE TABLE IF NOT EXISTS daily_logs (...);

CREATE INDEX IF NOT EXISTS foods_name_trgm_idx ON foods USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS foods_group_idx ON foods (group_id);
CREATE INDEX IF NOT EXISTS daily_logs_date_idx ON daily_logs (log_date);
CREATE INDEX IF NOT EXISTS weekly_schedule_day_idx ON weekly_schedule (user_id, day_of_week);
```

---

### Component 2: Interactive Agent Terminal REPL (`agent/cli.ts`)

#### [NEW] `agent/cli.ts`
A rich, interactive CLI using Node.js `readline/promises` and `ai` (`generateText` with Groq tool calling):
- Supports interactive multi-turn clinical chat in Spanish.
- Prints tool execution logs (e.g. `[Tool: getGramsForPortion => 120g]`).
- Instant startup (< 500ms) with `tsx agent/cli.ts`.

---

### Component 3: Package Configuration (`package.json`)

#### [MODIFY] `package.json`
- Add `eve` to `devDependencies`.
- Update `scripts`:
```json
"scripts": {
  "dev": "tsx agent/cli.ts",
  "dev:eve": "eve dev",
  "test": "vitest run",
  "test:watch": "vitest",
  "db:init": "tsx scripts/init-db.ts",
  "db:push": "tsx scripts/init-db.ts",
  "db:seed": "tsx agent/db/import-excel.ts",
  "db:setup": "npm run db:init && npm run db:seed",
  "typecheck": "tsc --noEmit"
}
```

---

## Verification Plan

### Automated Verification
```bash
npm run db:setup
npm run typecheck
npm run test
```
1. `npm run db:setup` executes DDL + seed without errors.
2. `npm run test` executes all 18 unit tests (100% pass).
3. `npm run typecheck` exits with code 0.

### Interactive Agent Verification
```bash
echo "¿Cuántos gramos son 2 equivalentes de pechuga de pollo?" | tsx agent/cli.ts --non-interactive
```
- Verifies agent responds clinically with exact tool calculation (240g).
