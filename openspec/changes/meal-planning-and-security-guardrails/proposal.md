# Change Proposal: Meal Plan Ingestion & Security Guardrails

## Summary
1. **Meal Plan Storage & Schedule Tools**:
   - Provide `saveMealPlan` and `setWeeklySchedule` tools allowing the agent to parse multi-meal clinical tables (e.g. Alta Demanda, Media, Descanso) and store them with per-meal granular portions and target macros in Neon Postgres.
   - Update `getPlanPortions` to return granular per-meal targets alongside daily totals.
2. **Security & Domain Guardrails**:
   - Update `agent/instructions.md` with explicit out-of-scope policies (rejecting non-nutrition requests such as general math "$100 - $50", coding, finance, politics) and re-anchoring to diet management.
   - Sandboxing tools to ensure no general execution or calculation tool leaks outside nutrition.
