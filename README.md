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

## 🔄 SDD & Development Pipeline

This project follows Spec-Driven Development (SDD) using the 7-step architecture pipeline:

```text
/product-function ──> /grill-with-docs ──> /to-spec ──> /ia & /ooux ──> /to-tickets ──> /implement ──> /code-review
```
