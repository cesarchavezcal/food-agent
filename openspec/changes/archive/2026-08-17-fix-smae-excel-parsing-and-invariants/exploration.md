# Exploration: SMAE Excel Header Parsing & Golden Invariants Verification

## Current State

In `agent/db/import-excel.ts`, the workbook parsing function scans the first 5 rows of each sheet for the string `"alimentos"`.
Because row 0 contains the sheet title banner (e.g. `['ALIMENTOS DE ORIGEN ANIMAL MUY BAJO APORTE DE GRASA']`), the parser erroneously marks row 0 as the header row instead of row 2 (which contains the true column headers: `'Cantidad sugerida'`, `'Unidad'`, `'Peso bruto'`, `'Peso neto'`, `'Energia'`, `'Proteina'`, `'Lípidos'`, `'Hidratos de carbono'`).

As a result:
- Column indexes for `colNetGrams`, `colKcal`, `colProt`, `colFat`, `colCho` resolve to `-1`.
- The parser falls back to silent defaults (`100g` net weight, group generic macros) for all 2,357 food items.
- Chicken breast (`pechuga de pollo`) is stored as `100g` instead of the canonical `30g`.

---

## Affected Areas

- [`agent/db/import-excel.ts`](file:///Users/cesaradalbertochavezcalderon/Personal/food-agent/agent/db/import-excel.ts) — Fix header row detection, eliminate silent fallbacks (throw explicit errors if required columns are missing), and add `onConflictDoUpdate` for idempotent re-seeding.
- [`tests/db/import-excel.test.ts`](file:///Users/cesaradalbertochavezcalderon/Personal/food-agent/tests/db/import-excel.test.ts) — Update tests to verify exact column parsing.
- [`tests/db/smae-invariants.test.ts`](file:///Users/cesaradalbertochavezcalderon/Personal/food-agent/tests/db/smae-invariants.test.ts) — New dedicated test suite verifying canonical golden records across all SMAE groups (chicken breast = 30g, apple = 106g, corn tortilla = 30g, olive oil = 5g, cooked rice = 47g).

---

## Approaches

### 1. Robust Cell Matcher + Strict Golden Invariants (Recommended)
- Search for the row containing both `peso neto` and `cantidad sugerida` (or matching standard column sets).
- Throw a hard error if any sheet in `STANDARD_GROUPS` lacks the mandatory clinical columns.
- Update `seedDatabase()` to use `onConflictDoUpdate` so re-seeding refreshes all 2,357 database rows with accurate grams.
- Add `smae-invariants.test.ts` to CI/Vitest suite.
  - **Pros**: 100% data integrity, prevents silent degradation, guarantees clinical accuracy in all future changes.
  - **Cons**: Requires re-seeding the database (takes ~2 seconds).
  - **Effort**: Low.

### 2. Hardcoded Row 2 Offset
- Assume row 2 is always the header for all sheets.
  - **Pros**: Minimal code changes.
  - **Cons**: Fragile if the Excel layout is modified or non-standard sheets are added.
  - **Effort**: Low.

---

## Recommendation

Implement **Approach 1** (Robust Cell Matcher + Strict Validation + Golden Invariants Suite). It adheres to Clean Architecture, eliminates silent failures, and locks clinical data accuracy with automated test assertions.

---

## Risks

- **Data Migration / Reseed**: Running `npm run db:seed` will update all 2,357 rows in Neon Postgres. With `onConflictDoUpdate({ target: foods.id, set: food })`, this operation is completely safe and idempotent.

---

## Ready for Proposal

**Yes**. Ready to proceed to `/sdd-propose` or `/sdd-spec` to generate formal specifications and tasks.
