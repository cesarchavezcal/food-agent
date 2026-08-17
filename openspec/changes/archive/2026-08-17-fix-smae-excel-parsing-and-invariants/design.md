# Design: SMAE Excel Header Resolver & Invariant Validation

## Architecture
1. **Dynamic Header Finder**: Iterates rows 0..9 and identifies the row where cell text contains `"peso neto"` or `"cantidad sugerida"`.
2. **Strict Validation**: Validates that all required column indices (`colName`, `colQty`, `colUnit`, `colNetGrams`, `colKcal`, `colProt`, `colFat`, `colCho`) are non-negative.
3. **Database Idempotent Upsert**:
   - `equivalent_groups`: `onConflictDoUpdate`
   - `foods`: `onConflictDoUpdate` on `foods.id` updating `grams_per_equivalent`, `suggested_quantity`, `suggested_unit`, `kcal_100g`, `protein_100g`, `fat_100g`, `cho_100g`.
4. **Golden Invariants Test Suite**: `tests/db/smae-invariants.test.ts` as a permanent regression guard.
