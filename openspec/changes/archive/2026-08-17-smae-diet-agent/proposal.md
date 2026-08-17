# Proposal: SMAE Diet Agent Core

## Context & Motivation
César requires an automated, clinical-grade personal diet assistant aligned with Mexico's SMAE (*Sistema Mexicano de Alimentos Equivalentes*), running on a perpetual $0 infrastructure stack (Vercel Eve, Groq Llama 3.3 70B, Neon Serverless Postgres with `pg_trgm`, and Drizzle ORM).

## Capabilities

### New Capabilities
- `catalog`: Ingestion and fuzzy search across 49 SMAE reference sheets from `data/smae.xlsx` alongside user-added custom foods.
- `calculator`: Deterministic TypeScript calculations for portion grams, coverage, composite multi-group equivalent decomposition (15g CHO / 7g Prot / 5g Lip), and in-memory LRU caching.
- `tracking`: Meal planning, day-of-week schedule mapping (`weekly_schedule`), intake logging strictly in grams by `meal_type`, and real-time daily summary diffing.
- `agent`: Vercel Eve runtime orchestration, Groq free-tier tool calling, and bilingual Spanish conversational interface.

## Impact & Boundaries
- Zero reliance on paid vector stores, Redis KV caches, or paid LLM APIs.
- Arithmetic is 100% isolated in deterministic TypeScript tools.
