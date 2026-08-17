# Change Proposal: Robust Chat Meal Plan Table Ingestion

## Summary
Harden the agent's table parsing intelligence so that whenever a user pastes a raw Markdown table or plain text portion matrix directly into the chat:
1. Translates `·`, `-`, and whitespace to `0` portions.
2. Auto-infers the plan name from total target calories (`2025 kcal` -> `DESCANSO`, `2375 kcal` -> `MEDIA`, `2550 kcal` -> `ALTA DEMANDA`) if not specified in text.
3. Immediately calls `saveMealPlan` and prints a confirmation table instead of asking the user to re-fill an empty template.
