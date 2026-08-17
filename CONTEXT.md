# Food Agent (`CONTEXT.md`)

Personal diet-tracking AI agent based on the Mexican SMAE (*Sistema Mexicano de Alimentos Equivalentes*), designed for deterministic nutritional planning, composite equivalent calculations, and intake logging on a $0 stack.

---

## 1. Domain Language & Glossary

### Core Entities

**Equivalent Group (`Grupo Equivalente`)**:
A standardized clinical category defined by SMAE where foods share approximately equivalent macronutrient profiles per portion (e.g., *Verduras*, *Frutas*, *Cereales sin grasa*, *AOA*, *Aceites y grasas*).
_Avoid_: Food category, macro bucket.

**Equivalent (`Equivalente` / `Porción`)**:
A standardized unit of food that provides an established amount of energy and macronutrients within its assigned group (e.g., 1 eq Cereal = 15g CHO, 1 eq AOA = 7g Prot, 1 eq Grasa = 5g Lip).
_Avoid_: Serving, unit, measure.

**Food Item (`Alimento`)**:
A cataloged or user-added food with a specific net weight (in grams) required to fulfill one equivalent, alongside full macronutrient values per portion or 100g.
_Avoid_: Ingredient, product, item.

**Nutrition Facts Table (`Tabla Nutrimental`)**:
The declared per-100g or per-serving macronutrient breakdown (protein, lipids, carbohydrates) used to decompose a custom food across equivalent groups.
_Avoid_: Label, info table.

### Planning & Tracking

**Meal Plan (`Plan de Alimentación`)**:
A structured target breakdown specifying the number of equivalents allocated to each food group for a designated meal.
_Avoid_: Diet, menu, recipe.

**Meal Type (`Tiempo de Comida`)**:
A designated eating period within the day (`desayuno`, `almuerzo`, `comida`, `colacion_1`, `colacion_2`, `cena`).
_Avoid_: Meal event, eating slot.

**Intake Log (`Registro de Ingesta`)**:
A record of actual consumed food for a specific date and meal, tracked strictly in grams and mapped to covered equivalents and macronutrients.
_Avoid_: Food diary entry, calorie log.

**Daily Summary (`Resumen Diario`)**:
An aggregated comparison between planned equivalents/macros and actual consumed food for a given calendar date.
_Avoid_: Day report, balance.

---

## 2. Technology Stack ($0 Infrastructure)

| Layer | Technology | Purpose |
|---|---|---|
| **Agent Runtime** | Vercel Eve / Vercel AI SDK | Agent orchestration and tool routing |
| **LLM Provider** | Groq (`llama-3.3-70b-versatile`) | Fast, free-tier natural language understanding |
| **Database** | Neon Serverless Postgres (`pg_trgm`) | Relational persistence & fuzzy text search |
| **ORM & Migrations** | Drizzle ORM (`drizzle-kit`) | Type-safe database client and migrations |
| **Testing Framework** | Vitest | Deterministic TDD for mathematical tools |
| **Hosting & Deployment** | Vercel (Hobby Tier) | Serverless execution and web interface |

---

## 3. Architecture & File Layout

```text
.
├── agent/
│   ├── instructions.md        # Bilingual (ES) SMAE agent system prompt
│   ├── tools/                 # Deterministic TypeScript tools
│   │   ├── getPlanPortions.ts
│   │   ├── getGramsForPortion.ts
│   │   ├── logNutritionFacts.ts
│   │   ├── coverageForAmount.ts
│   │   ├── logFood.ts
│   │   └── getDailySummary.ts
│   └── db/
│       ├── schema.ts          # Drizzle Postgres schema
│       ├── client.ts          # Neon serverless client
│       └── import-excel.ts    # Seed parser for data/smae.xlsx
├── data/
│   └── smae.xlsx              # SMAE reference dataset (49 sheets)
├── docs/
│   ├── adr/                   # Architectural Decision Records
│   └── planning/              # Implementation plans & specs
└── openspec/                  # SDD specification files
```
