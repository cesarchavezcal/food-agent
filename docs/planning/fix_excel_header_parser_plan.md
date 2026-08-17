# Implementation Plan: Fix SMAE Excel Column Header Detection

Fix the SMAE Excel parser in `agent/db/import-excel.ts` to properly detect the column header row (Row 2) instead of matching the title banner (Row 0), ensuring accurate net weight portions (e.g. 30g for chicken breast, 106g for apple, etc.) and individual macronutrient values.

## User Review Required

> [!IMPORTANT]
> **Root Cause Confirmation**:
> You were **100% correct**. The SMAE Excel spreadsheet has a title banner in Row 0 (e.g. `"ALIMENTOS DE ORIGEN ANIMAL MUY BAJO APORTE DE GRASA"`), and the actual column headers (`Cantidad sugerida`, `Unidad`, `Peso neto (g)`, `Energia (Kcal)`, `Proteina (g)`) are in **Row 2**.
> 
> Because the parser checked `includes("alimentos")`, it mistakenly selected Row 0 as the header row. Consequently, column indexes for `Peso neto`, `Proteina`, `Energia` were evaluated as `-1`, falling back to the 100g / group generic macro defaults.

---

## Proposed Changes

### Component 1: Robust Header Row Resolver (`agent/db/import-excel.ts`)

#### [MODIFY] `agent/db/import-excel.ts`
Update header detection to search for the row containing `peso neto` or `cantidad sugerida`:
```ts
// Find actual table header row (contains "peso neto" or "cantidad sugerida")
let headerRowIdx = -1;
for (let r = 0; r < Math.min(10, rows.length); r++) {
  const row = rows[r];
  if (Array.isArray(row) && row.some(cell => String(cell).toLowerCase().includes("peso neto") || String(cell).toLowerCase().includes("cantidad sugerida"))) {
    headerRowIdx = r;
    break;
  }
}
```
Also update `seedDatabase()` to use `onConflictDoUpdate` on the `foods` table so re-seeding updates all existing foods with their exact clinical weights and macronutrients.

---

## Verification Plan

### Automated Verification
```bash
npm run db:seed
npm run test
npm run typecheck
```
- Verify `pechuga de pollo` is parsed and stored as **30g** in the database.
- Verify `tests/db/import-excel.test.ts` asserts chicken breast has `gramsPerEquivalent === 30`.
- Verify end-to-end query returns 30g.
