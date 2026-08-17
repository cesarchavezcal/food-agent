# ADR-0002: In-Memory Tool-Level Caching for Food Lookups

- **Status**: Accepted
- **Date**: 2026-08-17
- **Deciders**: César Chávez, Antigravity Agent

## Context & Problem Statement

Users frequently ask for the portion or gram equivalent of the same foods repeatedly (e.g., *"¿cuánto es la porción de manzana?"*). We need to eliminate redundant database queries and latency without adding paid cache infrastructure (like Redis/Upstash) or bloating the LLM's system prompt context.

## Decision Drivers

1. **$0 Infrastructure**: No external cache services (Redis, Memcached, KV stores).
2. **Sub-millisecond Latency**: Repeated queries must return instantly.
3. **Token Conservation**: Keep the agent system prompt minimal to stay within Groq free-tier rate limits.
4. **Cache Coherency**: Custom foods added via `logNutritionFacts` must immediately be discoverable.

## Decision

We will implement an **In-Memory LRU Cache** directly inside the TypeScript tool layer (`agent/tools/cache.ts`):

1. **Lookup Flow**:
   - `getGramsForPortion(foodName)` normalizes the query string to lowercase.
   - Checks the in-memory LRU cache (`Map<string, FoodItem>`).
   - On **Cache Hit**: Returns the food portion immediately (0ms, 0 DB queries).
   - On **Cache Miss**: Executes Postgres `pg_trgm` fuzzy search on indexed `foods`, populates the LRU cache, and returns (<5ms).
2. **Cache Invalidation**:
   - The cache is updated/invalidated in-place whenever `logNutritionFacts` adds a new custom food item (`source = 'user'`).
3. **Tool-Level Isolation**:
   - System prompts remain completely stateless and token-efficient.

## Consequences

- Zero added infrastructure cost.
- Instant response times for repeat queries.
- Cache remains 100% consistent throughout runtime execution.
