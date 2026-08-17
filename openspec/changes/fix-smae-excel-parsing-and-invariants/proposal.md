# Change Proposal: Fix SMAE Excel Header Detection and Golden Invariants

## Problem
In `agent/db/import-excel.ts`, header detection matched Row 0 (Title Banner) instead of Row 2 (Column Headers). Consequently, all 2,357 food items fell back to silent default of 100g and generic group macronutrients instead of their true clinical portions (e.g. 30g for chicken breast).

## Proposed Solution
1. Detect column header row dynamically by matching `peso neto` and `cantidad sugerida`.
2. Eliminate silent fallbacks by enforcing strict header validation.
3. Add a dedicated Golden Invariants test suite (`tests/db/smae-invariants.test.ts`) asserting exact portions for canonical Mexican foods.
4. Idempotently update the database catalog with `onConflictDoUpdate` upon `npm run db:seed`.
