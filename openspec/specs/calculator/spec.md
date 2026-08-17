# Calculator & Deterministic Tools Specification

## Purpose
Provides pure TypeScript calculation tools for portion grams, intake coverage, composite equivalent decomposition, and sub-millisecond in-memory caching.

## Requirements

### Requirement: Grams for Equivalent Calculation
The system MUST calculate the exact net weight in grams required to satisfy $N$ equivalents of a given food.

#### Scenario: Single Equivalent Portion
- GIVEN "Arroz blanco cocido" requires 47g per 1 equivalent (Cereales sin grasa)
- WHEN `getGramsForPortion({ foodName: "arroz blanco", nEquivalentes: 1 })` is called
- THEN the system returns `{ grams: 47, group: "Cereales sin grasa", equivalentes: 1 }`.

#### Scenario: Multiple Equivalent Portions
- GIVEN "Pechuga de pollo" requires 30g per 1 equivalent
- WHEN `getGramsForPortion({ foodName: "pechuga de pollo", nEquivalentes: 2.5 })` is called
- THEN the system returns `{ grams: 75, group: "A.O.A Muy bajo en grasa", equivalentes: 2.5 }`.

### Requirement: Intake Coverage Calculation
The system MUST compute the exact fraction of equivalents and macronutrients provided by an explicit gram quantity of food.

#### Scenario: Coverage for Specified Grams
- GIVEN "Avena en hojuelas" has 1 eq = 20g (15g CHO, 3g Prot, 1g Lip)
- WHEN `coverageForAmount({ foodName: "avena", grams: 40 })` is called
- THEN the system returns `{ equivalentes: 2, macros: { cho: 30, protein: 6, fat: 2, kcal: 162 } }`.

### Requirement: Composite Equivalent Decomposition
The system MUST decompose custom nutrition tables across standard SMAE equivalent groups using canonical macro priority (15g CHO = 1 eq Cereal, 7g Prot = 1 eq AOA, 5g Lip = 1 eq Grasa).

#### Scenario: Multi-Macro Food Decomposition
- GIVEN a custom bar with declared nutrition per 100g: 21g Protein, 30g Carbs, 10g Lipids
- WHEN `logNutritionFacts({ foodName: "Protein Bar", protein100g: 21, carbs100g: 30, fat100g: 10 })` is called
- THEN the system calculates `{ cerealEquivalents: 2.0, aoaEquivalents: 3.0, fatEquivalents: 2.0 }` per 100g
- AND upserts the item into `foods` with `source = 'user'`.

### Requirement: In-Memory Tool Caching
The system MUST cache food lookup results in an in-memory LRU cache and invalidate on food upserts.

#### Scenario: Cache Hit
- GIVEN "Manzana" was queried within the active session
- WHEN `getGramsForPortion("manzana")` is called again
- THEN the result is served directly from in-memory cache in 0ms without database roundtrips.

#### Scenario: Cache Invalidation on Insert
- GIVEN a populated cache
- WHEN a new food is registered via `logNutritionFacts`
- THEN the cache is updated/invalidated to ensure immediate query consistency.
