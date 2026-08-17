# Plan: $0 SMAE Diet Agent on Eve

> **Handoff note:** This plan will be executed by a separate agent (Gemini), not the author.
> Before starting, the executing agent should:
> 1. Ask César for the **path to the SMAE Excel** (needed for step 5).
> 2. Ensure prerequisites exist: Node.js + npm, a free **Neon** account (`DATABASE_URL`),
>    a free **Groq** API key (`GROQ_API_KEY`), and a **Vercel** account for deploy.
> 3. Treat the "Build steps" section as the execution checklist and the "Verification"
>    section as the acceptance test.

## Context

César wants a personal diet-tracking AI agent built on **Eve** (Vercel's agent framework),
running on a **strictly $0 stack**. The agent is based on the Mexican **SMAE** (Sistema
Mexicano de Alimentos Equivalentes) and must:

1. Store meal **plannings** (e.g. "leg day – almuerzo") as portions/*equivalentes* per food group.
2. On request, return the portions for a given plan + meal.
3. Given a food, return the **grams** that cover 1 (or N) *equivalentes* per SMAE.
4. Accept a **nutrition-facts table** for a food and compute how many grams cover an
   *equivalente* (and, inversely, how many *equivalentes* a given amount covers).
5. Produce a **daily summary** of what was eaten vs. the plan.

Constraints from clarification: **Groq free tier** for the LLM, **personal/hobby** use
(so Vercel Hobby is allowed), memory is **structured** (relational) — no vector store needed.

César already has an **Excel** with the SMAE data (food list + grams/equivalente,
per-equivalente group macros, and full nutrition per food). This is imported to seed the DB,
and the agent can also add new foods when logging nutrition tables ("seed + agent can add").

## The $0 stack

| Layer | Choice | Why it's $0 |
|---|---|---|
| Agent framework | **Eve** (`vercel/eve`) | Open source |
| LLM | **Groq** via `@ai-sdk/groq` (e.g. `llama-3.3-70b`) | Free tier, fast, works with Vercel AI SDK |
| Hosting | **Vercel Hobby** | Free for non-commercial/personal |
| Database | **Neon** serverless Postgres (`@neondatabase/serverless`) | Free tier (~0.5 GB) — plenty for personal logs |
| ORM | **Drizzle ORM** | Open source; clean serverless fit |
| Food-name search | Postgres `pg_trgm` fuzzy text search | Built into Postgres, free (no vector DB) |

No KV, blob, or vector service required. Session/conversation durability is handled by
Eve + Vercel Workflows out of the box; **long-term diet memory lives in Neon Postgres**.

> Note: Groq/Vercel/Neon free tiers are rate/size limited but comfortably cover single-user
> personal usage. If Groq quality is insufficient for the SMAE math, the calculations are done
> in **TypeScript tools** (deterministic), not the model — so model choice mainly affects the chat.

## Data model (Drizzle schema in Neon Postgres)

- `equivalent_groups` — **reference/seed data**. One row per SMAE group/subgroup with the
  standard per-*equivalente* macros: `group`, `subgroup`, `kcal`, `protein_g`, `fat_g`, `cho_g`.
  (e.g. Verduras ≈ 25 kcal / 4 CHO / 2 prot; Fruta ≈ 60 kcal / 15 CHO; Cereal s/grasa ≈ 70 kcal /
  15 CHO / 2 prot; Leguminosas; AOA muy bajo→alto en grasa; Leche desc→entera; Aceites y grasas;
  Azúcares.) These definitions are the *system* and are safe to encode.
- `foods` — food catalog seeded from the Excel: `name`, `group_id`, `grams_per_equivalent`,
  and full nutrition (`kcal`, `protein_g`, `fat_g`, `cho_g` per 100g or per portion — matched to
  the sheet). `source` flag (`excel` | `user`) so agent-added foods are distinguishable.
  Fuzzy-searchable by name via `pg_trgm`.
- `plans` — meal plans: `plan_name` (e.g. "leg day"), `meal` (desayuno/almuerzo/…),
  `group_id`, `equivalentes` (count).
- `daily_logs` — intake: `log_date`, `food_id`, `grams`, and computed
  `equivalentes` / macros covered.

**Seeding from the Excel:** both `equivalent_groups` (per-equivalente group macros) and `foods`
(list + grams/equivalente + full nutrition) come directly from César's sheet — no copyright
workaround needed. The `foods` table then keeps growing as the agent logs new nutrition tables
(use case 4, `source = user`).

## Eve project layout & tools

```
agent/
  instructions.md        # role: bilingual (ES) SMAE diet assistant; when to call which tool
  tools/
    getPlanPortions.ts    # (planName, meal) -> equivalentes per group for that meal
    getGramsForPortion.ts # (foodName, nEquivalentes=1) -> grams covering the portion (SMAE)
    logNutritionFacts.ts  # (foodName, group, nutritionPer100g) -> compute grams/equivalente, upsert food
    coverageForAmount.ts  # (foodName, grams) -> how many equivalentes + macros that amount covers
    logFood.ts            # (date, foodName, grams) -> store intake, compute covered equivalentes/macros
    getDailySummary.ts    # (date) -> aggregate logged intake, compare vs plan, macro totals
  db/
    schema.ts             # Drizzle tables above
    client.ts             # Neon serverless client
    import-excel.ts       # parse SMAE Excel (xlsx) -> seed equivalent_groups + foods
```

Excel parsing uses the `xlsx` (SheetJS) library. The importer maps the sheet's columns to
`equivalent_groups` (group/subgroup + per-equivalente macros) and `foods` (name, group,
grams/equivalente, full nutrition), tagging every imported row `source = 'excel'`. Idempotent
upsert by `name`+`group` so re-running on an updated sheet is safe.

Core calculations live in the tools (deterministic TS), not the model:
- **grams per equivalente** from a nutrition table: solve grams so the group's defining macro
  (usually CHO, or protein for AOA) matches the per-*equivalente* target.
- **coverage**: given grams, divide by `grams_per_equivalent` (or recompute from macros).
- **daily summary**: sum `daily_logs` for the date, roll up by group and macro, diff against `plans`.

The LLM's job is intent routing + Spanish conversation; all numbers come from tools.

## Build steps

0. **Locate & inspect the SMAE Excel** — confirm sheet/column layout so `import-excel.ts`
   maps correctly (path TBD from César).
1. `npx create-eve` (or clone `vercel/eve` starter); pick the Next.js/web channel.
2. Configure the model provider: install `@ai-sdk/groq`, set `GROQ_API_KEY` in Vercel env.
3. Add Neon: create free project, add `DATABASE_URL`, install `drizzle-orm` +
   `@neondatabase/serverless` + `drizzle-kit`.
4. Write `db/schema.ts`, enable `pg_trgm`, run `drizzle-kit push`.
5. Write `import-excel.ts` (uses `xlsx`) and run it to seed `equivalent_groups` + `foods`.
6. Implement the six tools above with input validation (zod).
7. Write `instructions.md` in Spanish describing the SMAE role and tool-selection rules.
8. Deploy to Vercel Hobby.

## Verification (end-to-end)

First confirm the import: after running `import-excel.ts`, spot-check row counts and a few known
foods in Neon against the Excel. Then run `eve dev` locally and exercise each use case through chat:

1. **Plan storage/read** — seed a "leg day" plan, ask *"dame las porciones para leg day – almuerzo"*;
   confirm it returns the stored *equivalentes* per group.
2. **Grams for a portion** — ask *"¿cuántos gramos de arroz cubren una porción?"* after adding
   arroz; verify against the SMAE cereal target.
3. **Log a nutrition table** — paste a product's nutrition facts; confirm `logNutritionFacts`
   computes grams/equivalente and upserts the food; re-query it.
4. **Coverage** — *"si como 80 g de X, ¿cuántos equivalentes cubro?"*; check the math by hand.
5. **Daily summary** — log 2–3 foods for a date, ask *"resumen del día"*; confirm totals by group
   and macros, and comparison against the plan.
6. Deploy and repeat #1 and #5 on the Vercel URL to confirm the free-tier stack works in prod.

## $0 guardrails

- Keep model calls short; do all arithmetic in tools (protects Groq rate limits).
- Single-user data volume is tiny — stays well inside Neon's free tier.
- Vercel Hobby only (personal use); do not attach paid add-ons.
