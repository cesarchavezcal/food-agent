# Food Catalog & Ingestion Specification

## Purpose
Manages SMAE reference foods, equivalent group definitions, and user-added custom foods with high-performance fuzzy text retrieval.

## Requirements

### Requirement: Excel Dataset Ingestion
The system MUST parse `data/smae.xlsx` and idempotently seed `equivalent_groups` and `foods` into PostgreSQL.

#### Scenario: Initial Seed Ingestion
- GIVEN `data/smae.xlsx` exists with 49 standard SMAE sheets
- WHEN the seed script `import-excel.ts` executes
- THEN all standard equivalent groups are inserted with baseline macronutrient definitions
- AND all food items are inserted with `source = 'excel'`, net grams per equivalent, and per-100g nutritional facts.

#### Scenario: Idempotent Re-Run
- GIVEN the database already contains seeded foods
- WHEN `import-excel.ts` is re-executed
- THEN existing records are updated or preserved without duplicate row creation.

### Requirement: Fuzzy Food Search
The system MUST perform case-insensitive fuzzy matching on food names using PostgreSQL `pg_trgm`.

#### Scenario: Exact and Approximate Food Match
- GIVEN a catalog containing "Pechuga de pollo cocida"
- WHEN `getGramsForPortion` searches for "pollo cocido" or "pechuga de pollo"
- THEN the system returns the highest-scoring matching food record.

#### Scenario: Food Not Found
- GIVEN a search query for a non-existent food "xyz999"
- WHEN the fuzzy search runs
- THEN the system MUST return a structured empty match result prompting the user to log a nutrition facts table.
