# Food Agent

A personal diet-tracking AI agent based on the Mexican SMAE (*Sistema Mexicano de Alimentos Equivalentes*), designed for deterministic nutritional planning, composite equivalent calculations, and intake logging on a strictly $0 infrastructure stack.

---

## 🌟 Key Features

- **SMAE Clinical Alignment**: Standardized equivalent calculations covering all Mexican SMAE groups and subgroups.
- **Strict $0 Infrastructure**: Powered by Vercel Eve / Vercel AI SDK, Groq Llama 3.3 70B (free tier), Neon Serverless Postgres (`pg_trgm` fuzzy search), and Vercel Hobby hosting.
- **Deterministic Math**: Pure TypeScript calculation tools for 100% reproducible and auditable nutritional arithmetic (no LLM hallucination).
- **Composite Macro Solver**: Automatically maps custom nutrition facts tables to canonical equivalent groups (15g CHO / 7g Prot / 5g Lip).
- **Per-Meal & Daily Tracking**: Real-time intake logging in grams with instant meal and daily plan diffing.
- **Excel Seed Pipeline**: Automated ingestion from reference `data/smae.xlsx` dataset.

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Agent Runtime** | Vercel Eve / Vercel AI SDK | Agent orchestration and tool calling |
| **LLM Engine** | Groq (`llama-3.3-70b-versatile`) | Fast, free-tier conversational understanding |
| **Database** | Neon Serverless Postgres | Relational storage & `pg_trgm` fuzzy search |
| **ORM & Migrations** | Drizzle ORM (`drizzle-kit`) | Type-safe schema and migration management |
| **Testing** | Vitest | Deterministic test-driven development (TDD) |
| **Hosting** | Vercel (Hobby Tier) | Serverless edge execution and web interface |

---

## 🚀 Quickstart

### 1. Prerequisites
- Node.js 20+ & npm
- Neon PostgreSQL database (`DATABASE_URL`)
- Groq API Key (`GROQ_API_KEY`)

### 2. Setup & Environment
```bash
cp .env.example .env.local
# Add DATABASE_URL and GROQ_API_KEY
npm install
```

### 3. Database Migration & Seed
```bash
npm run db:push
npm run db:seed
```

### 4. Run Development Agent
```bash
npm run dev
```

---

## 🔄 Unified SDD & 7-Step Architecture Pipeline

Every feature or bug follows the unified pipeline matrix:

```text
┌───────────────────────────────┬───────────────────────────────┬───────────────────────────────────────────┐
│ SDD Canonical Phase           │ Specialized Skill Triggers    │ Artifact Target Paths                     │
├───────────────────────────────┼───────────────────────────────┼───────────────────────────────────────────┤
│ 1. /sdd-explore, /sdd-propose │ /product-function, /grill     │ docs/product-design/product_function.md   │
│                               │                               │ openspec/changes/<change>/proposal.md     │
│ 2. /sdd-spec                  │ /to-spec                      │ openspec/specs/<feature>/spec.md          │
│ 3. /sdd-design                │ /ia, /ooux, /codebase-design  │ docs/product-design/ia.md, ooux.md        │
│                               │                               │ openspec/changes/<change>/design.md       │
│ 4. /sdd-tasks                 │ /to-tickets                   │ openspec/changes/<change>/tasks.md        │
│ 5. /sdd-apply                 │ /implement, /harness, /team   │ Working source code + unit/integration    │
│ 6. /sdd-verify                │ /code-review, .gga review     │ Review receipts + pre-commit audit        │
│ 7. /sdd-archive               │ PR merge + /sdd-archive       │ openspec/changes/archive/<date>-<change>/ │
└───────────────────────────────┴───────────────────────────────┴───────────────────────────────────────────┘
```

---

## ⚡ Slash Commands Quick Reference

| Command | Purpose |
|---|---|
| `/harness-creator` | Audit and validate harness reliability across 5 subsystems (100/100 score) |
| `/sdd-init` | Initialize or reload OpenSpec persistence and `.atl/skill-registry.md` |
| `/sdd-explore` | Deep codebase investigation and architectural mapping without modifying code |
| `/product-function` | Scope feature as $y = f(x)$ with 10x Scope-Stripping |
| `/grill-with-docs` | Stress-test feature scope and technical bounds against documentation |
| `/to-spec` / `/sdd-spec` | Generate formal acceptance criteria and domain contracts in `openspec/specs/` |
| `/ia` & `/ooux` | Generate Sitemap, User Flows, Object Cards, and ERD in `docs/product-design/` |
| `/to-tickets` / `/sdd-tasks` | Decompose design into atomic test-first tickets in `tasks.md` |
| `/sdd-apply` / `/implement` | Execute tasks autonomously via `/harness` (single) or `/team-cheap` (swarm) |
| `/sdd-verify` / `/code-review` | Two-axis audit (Spec + Standards compliance) and GGA pre-commit verification |
| `/sdd-archive` | Archive completed change into `openspec/changes/archive/` and sync living specs |
| `/plan` | Generate implementation plan artifact with mandatory turn boundary pause |
