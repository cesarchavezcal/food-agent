# Implementation Plan: Fix `pg_trgm` PostgreSQL Extension Setup

Fix the `operator class "gin_trgm_ops" does not exist for access method "gin"` error when running `npm run db:push` by automating `CREATE EXTENSION IF NOT EXISTS pg_trgm;` and providing a streamlined database setup command.

## User Review Required

> [!IMPORTANT]
> **Root Cause**:
> PostgreSQL requires the `pg_trgm` extension to be enabled in your Neon database before it can create GIN trigram indexes (`foods_name_trgm_idx`). Neon supports `pg_trgm` out of the box on all free-tier projects, but it must be activated with `CREATE EXTENSION IF NOT EXISTS pg_trgm;`.

---

## Proposed Changes

### Component 1: Database Initialization Script (`scripts/init-db.ts`)

#### [NEW] `scripts/init-db.ts`
A lightweight script that connects to your Neon database via `@neondatabase/serverless` and executes:
```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```
Ensures that running `npm run db:setup` or `npm run db:push` will never fail on missing extension operators.

---

### Component 2: Package Scripts & Seed Pipeline (`package.json`, `agent/db/import-excel.ts`)

#### [MODIFY] `package.json`
Update scripts to chain extension initialization automatically:
```json
"scripts": {
  "db:init": "tsx scripts/init-db.ts",
  "db:push": "tsx scripts/init-db.ts && drizzle-kit push",
  "db:seed": "tsx agent/db/import-excel.ts",
  "db:setup": "npm run db:init && npm run db:push && npm run db:seed"
}
```

#### [MODIFY] `agent/db/import-excel.ts`
Add `await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm;`` at the beginning of `seedDatabase()` as an extra guard.

---

## Verification Plan

### Automated Verification
1. Run `npm run db:init` $\rightarrow$ verifies connection and activates `pg_trgm`.
2. Run `npm run db:push` $\rightarrow$ verifies Drizzle schema push with GIN trigram index succeeds with 0 errors.
3. Run `npm run test` $\rightarrow$ verifies all 18 Vitest tests pass.
