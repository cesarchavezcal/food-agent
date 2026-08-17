# Agent Durable Memory (`MEMORY.md`)

This file records durable learnings, architectural decision records (ADRs), user preferences, and persistent project state across turns and agent sessions.

---

## 1. Architectural Decision Records (ADRs)

| Date | ADR Title | Decision & Rationale | Status |
|---|---|---|---|
| 2026-08-17 | [ADR-0001: SMAE Domain Model & $0 Stack](docs/adr/0001-smae-domain-model-and-stack.md) | Vercel Eve/AI SDK + Groq + Neon Postgres (`pg_trgm`) + Drizzle ORM on strict free-tier stack; deterministic TS tools for math; composite macro solver (15g CHO/7g Prot/5g Lip); per-meal tracking in strict grams. | Accepted |

---

## 2. User Preferences & Standing Rules

- **Communication Style**: ADHD-optimised output style (`/i-have-adhd`). Lead with next action, number multi-step tasks, suppress tangents, and make progress visible.
- **Pipeline Governance**: Always run `/product-function` -> `/grill-with-docs` -> `/to-spec` -> `/ia` -> `/ooux` -> `/to-tickets` -> `/implement`.
- **Git Commit Standard**: Verify local git configuration matches `cesarchavezcal` before committing.
- **Data & Measurement**: Strict grams for all nutritional inputs and persistence.

---

## 3. Persistent Knowledge Log

- **SMAE Reference Dataset**: Located at `data/smae.xlsx` with 49 sheets covering standard groups, subgroups, and prepared dishes with columns for foods, suggested portions, and net grams.
