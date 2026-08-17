# Design: SMAE Diet Agent Core (`smae-diet-agent`)

## Technical Approach
Implement the personal diet assistant on Vercel Eve, routing natural language via Groq (`llama-3.3-70b-versatile`) to deterministic TypeScript tools backed by Neon Serverless Postgres and Drizzle ORM. Nutritional calculations, portion solving, and intake rollups are isolated in pure TypeScript modules covered by Vitest.

## Architecture Decisions

| Decision | Option Chosen | Tradeoff / Rejected Alternative | Rationale |
|---|---|---|---|
| **Composite Solving** | Canonical Priority (15g CHO, 7g Prot, 5g Lip) | Single defining macro vs LLM heuristic | Clinical precision, 100% deterministic, zero hallucination. |
| **Search Engine** | PostgreSQL `pg_trgm` | Vector DB (Pinecone / Qdrant) | $0 infrastructure, zero external services, native fuzzy Spanish matching. |
| **Tool Caching** | In-Memory LRU (`Map<string, FoodItem>`) | Redis / Upstash KV store | Sub-millisecond lookup latency for repeat queries at $0 cost. |
| **Intake Unit** | Strict Grams (`grams: number`) | Kitchen units (tazas, piezas) | Eliminates conversion ambiguity and ensures clean mathematical aggregation. |
| **Day Scheduling** | `weekly_schedule` entity | Explicit manual prompt parameter | Auto-resolves active daily plan profile without redundant conversational prompting. |

## Data Flow

```text
User (Spanish Prompt)
       │
       ▼
Eve Agent Runtime (Groq llama-3.3-70b-versatile)
       │
       ├─► Tool Call: getGramsForPortion(food) ──► LRU Cache (0ms) ──► [Miss] Neon pg_trgm (<5ms)
       ├─► Tool Call: logNutritionFacts(macros) ──► Composite Solver ──► Upsert foods + Invalidate Cache
       ├─► Tool Call: logFood(date, meal, grams) ──► Insert daily_logs ──► Computed Equivalents
       └─► Tool Call: getDailySummary(date) ──► Rollup daily_logs ──► Diff vs plans / weekly_schedule
```

## File Changes

| File | Action | Description |
|---|---|---|
| `agent/db/schema.ts` | Create | Drizzle Postgres schema (`equivalent_groups`, `foods`, `plans`, `weekly_schedule`, `daily_logs`, `pg_trgm` index). |
| `agent/db/client.ts` | Create | Neon Serverless connection pool client. |
| `agent/db/import-excel.ts` | Create | Ingestion script parsing `data/smae.xlsx` via `xlsx` to seed groups and catalog foods. |
| `agent/tools/cache.ts` | Create | In-memory LRU food search cache with invalidation hooks. |
| `agent/tools/getPlanPortions.ts` | Create | Tool resolving active plan equivalents by meal and day. |
| `agent/tools/getGramsForPortion.ts` | Create | Tool returning net grams for portion with fuzzy search and LRU caching. |
| `agent/tools/logNutritionFacts.ts` | Create | Tool decomposing custom nutrition tables (15g CHO / 7g Prot / 5g Lip) and upserting user foods. |
| `agent/tools/coverageForAmount.ts` | Create | Tool computing covered equivalents and macronutrients from grams. |
| `agent/tools/logFood.ts` | Create | Tool logging per-meal intake in grams and computing consumed equivalents. |
| `agent/tools/getDailySummary.ts` | Create | Tool aggregating daily intake vs planned targets. |
| `agent/agent.ts` | Create | Eve agent entrypoint configured with `@ai-sdk/groq`. |
| `agent/instructions.md` | Create | Agent role, bilingual Mexican Spanish guidelines, and tool routing policies. |
| `package.json` | Create | Scripts, dependencies (`drizzle-orm`, `@neondatabase/serverless`, `@ai-sdk/groq`, `xlsx`, `zod`, `vitest`). |
| `drizzle.config.ts` | Create | Drizzle Kit configuration for Neon migrations. |

## Interfaces & Type Contracts

```typescript
export interface FoodItem {
  id: string;
  name: string;
  groupId: string;
  gramsPerEquivalent: number;
  kcal100g: number;
  protein100g: number;
  fat100g: number;
  cho100g: number;
  source: 'excel' | 'user';
}

export interface NutritionFactsInput {
  foodName: string;
  protein100g: number;
  fat100g: number;
  carbs100g: number;
  kcal100g?: number;
}

export interface CompositeDecomposition {
  cerealEquivalents: number; // 15g CHO
  aoaEquivalents: number;    // 7g Prot
  fatEquivalents: number;    // 5g Lip
  totalGrams: number;
}

export interface DailyLogEntry {
  id: string;
  logDate: string; // YYYY-MM-DD
  mealType: 'desayuno' | 'almuerzo' | 'comida' | 'colacion_1' | 'colacion_2' | 'cena';
  foodId: string;
  grams: number;
  computedEquivalents: Record<string, number>;
  computedMacros: { kcal: number; protein: number; fat: number; cho: number };
}
```

## Testing Strategy

| Layer | Target | Approach |
|---|---|---|
| **Unit** | `logNutritionFacts` & `coverageForAmount` | Vitest testing of composite solving (15g CHO / 7g Prot / 5g Lip) and precision bounds. |
| **Unit** | `cache.ts` | Vitest testing of LRU cache hits, misses, evictions, and cache invalidation on food upsert. |
| **Integration** | `import-excel.ts` | Verify parsing across all 49 sheets in `data/smae.xlsx` with mock DB and row validation. |
| **Integration** | `getDailySummary.ts` | Test plan aggregation, intraday meal filtering, and diff calculations against `weekly_schedule`. |
| **E2E** | Local Agent Runtime | Interactive verification via `npx eve dev`. |

## Threat Matrix
`N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary.`

## Migration / Rollout
Run `npm run db:push` to apply initial schema and `npm run db:seed` to ingest `data/smae.xlsx`.

## Open Questions
- None. All architectural decisions settled in ADR-0001 and ADR-0002.
