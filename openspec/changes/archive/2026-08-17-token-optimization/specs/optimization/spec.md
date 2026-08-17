# Specification: Token Optimization & Deterministic Table Parser

## Domain
Token Economics / Tool Payloads / Prompt Caching

## Requirements

### Requirement: Deterministic Markdown Meal Plan Table Parser
The parser MUST extract meal plan matrices from user text without an LLM round-trip, correctly mapping SMAE group names, meal headers, and calorie numbers.

#### Scenario: Extract 7-Column Table
- **Given** user input containing `| ALTA DEMANDA — 2,550 kcal ... |` and markdown rows
- **When** `parseMarkdownMealPlanTable(input)` runs
- **Then** `isTable` is `true`
- **And** `planName` is `"ALTA DEMANDA"`
- **And** `targetKcal` is `2550`
- **And** `byMeal` contains sparse non-zero portions for `almuerzo`, `colacion_1`, `comida`, `colacion_2`, `cena`.

### Requirement: Sparse Tool Return Serialization
The `getPlanPortions` and `saveMealPlan` tools MUST omit SMAE keys with `0` values from their return JSON objects.

### Requirement: Compact Clinical Instructions
`agent/instructions.md` MUST stay under 600 tokens while preserving all SMAE clinical invariants and domain boundaries.
