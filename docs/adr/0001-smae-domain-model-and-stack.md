# ADR-0001: SMAE Diet Agent Domain Model & $0 Stack Architecture

- **Status**: Accepted
- **Date**: 2026-08-17
- **Deciders**: César Chávez, Antigravity Agent

## Context & Problem Statement

César requires a personal diet-tracking AI agent based on the Mexican SMAE (*Sistema Mexicano de Alimentos Equivalentes*) system, operating on a strictly **$0 infrastructure stack** (free tiers only). The system needs deterministic nutritional calculations, fuzzy food matching, meal planning vs. actual intake diffing, and support for custom nutrition tables.

## Decision Drivers

1. **Zero-Cost Constraint**: Must operate exclusively on perpetual free tiers (Groq for LLM, Neon for Postgres, Vercel Hobby for hosting).
2. **Clinical Determinism**: Arithmetic must be calculated in pure TypeScript tools, never hallucinated by the LLM.
3. **SMAE Clinical Alignment**: Mexico's SMAE system divides food into standardized equivalent groups (e.g., 1 eq Cereal = 15g CHO, 1 eq AOA = 7g Prot, 1 eq Grasa = 5g Lip).
4. **Composite Nutrition Facts**: Custom food items with nutrition facts must decompose across standard equivalent groups.
5. **Simplicity & Strict Measurement**: Grams are the sole canonical unit of measurement.

## Considered Options & Decisions

### 1. Equivalent Decomposition
- **Decision**: **Canonical Macro-to-Group Priority**.
- **Rule**: When logging custom nutrition facts, the solver maps:
  - Total Carbohydrates $\rightarrow$ Cereales (15g CHO / eq)
  - Total Protein $\rightarrow$ AOA (7g Prot / eq)
  - Total Lipids $\rightarrow$ Aceites y Grasas (5g Lip / eq)

### 2. Intake Tracking Granularity
- **Decision**: **Per-Meal Tracking** (`daily_logs` stores `meal_type` e.g., `desayuno`, `almuerzo`, `comida`, `cena`, `snack`).
- **Consequence**: Allows real-time intraday diffing against meal plans as well as aggregated end-of-day summaries.

### 3. Plan Resolution & Scheduling
- **Decision**: **Day-of-Week Schedule**.
- **Structure**: A `weekly_schedule` entity maps days (Monday–Sunday) to active `plan_name` profiles, with manual day overrides supported.

### 4. Food Search & Measurement Unit
- **Decision**: **PostgreSQL `pg_trgm` extension** for fuzzy food matching in Spanish without paid vector databases.
- **Decision**: **Strict Grams** for all database storage and user interaction inputs.

### 5. Technology Stack
- **Agent Orchestration**: Vercel Eve / Vercel AI SDK
- **LLM Engine**: Groq (`@ai-sdk/groq` using `llama-3.3-70b-versatile`)
- **Database & Search**: Neon Serverless Postgres (`@neondatabase/serverless` + `pg_trgm`)
- **ORM & Migrations**: Drizzle ORM (`drizzle-kit`)
- **Testing**: Vitest for deterministic TDD unit and integration tests

## Consequences

- Calculations remain 100% deterministic and reproducible.
- Rate limits on free-tier LLM are protected because token usage is limited strictly to intent routing and natural language formatting.
- Re-seeding from `data/smae.xlsx` is idempotent.
