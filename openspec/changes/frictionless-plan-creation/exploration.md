# Exploration: Why the Agent Asked to Re-Enter the Table & How to Fix It

## Root Cause Analysis of the Observed Behavior

When the user pasted the markdown table:
```text
| Grupo          | Almuerzo | Colación 1 | Comida | Colación 2 | Cena | Total |
| -------------- | -------- | ---------- | ------ | ---------- | ---- | ----- |
| Verduras       | 2        | ·          | 1      | ·          | ·    | 3     |
| Frutas         | 2        | ·          | ·      | 1          | ·    | 3     |
...
| Meta kcal      | 710      | 150        | 550    | 130        | 540  | 2,025 |
```

The agent failed to trigger `saveMealPlan` for 3 distinct reasons:
1. **Missing Plan Name in the Prompt**: The table had no title row (e.g., `DESCANSO`). The LLM became indecisive and hallucinatory about what to name the plan.
2. **Symbol `·` Ambiguity**: The LLM did not have an explicit rule stating that `·` (middle dot) represents `0` equivalentes.
3. **Missing Tool Execution Trigger**: The system instructions lacked a concrete Few-Shot example demonstrating that raw markdown tables must immediately trigger `saveMealPlan`.

---

## 2-Part Solution

### Part 1: Prompt Hardening & Symbol Translation in `agent/instructions.md`
- Explicit rule: Translate `·`, `-`, `ND`, or empty cells to `0`.
- Explicit rule: If the user doesn't name the plan, infer from calories (e.g. 2,025 kcal $\rightarrow$ `"DESCANSO"`, 2,550 kcal $\rightarrow$ `"ALTA DEMANDA"`, or default to `"Plan Personalizado"`).
- **Hard instruction**: Do NOT ask the user to re-fill an empty table; immediately extract the numbers and execute `saveMealPlan`.

### Part 2: Declarative `data/plans.yaml` + `npm run plans:sync` (Zero Prompt Hassle)
Provide a version-controlled YAML file `data/plans.yaml` containing the 3 official plans (`ALTA DEMANDA`, `MEDIA`, `DESCANSO`) and schedule.
- Run `npm run plans:sync` (or runs automatically in `npm run db:setup`).
- Zero typing or table formatting in chat required.

---

## Recommendation

Implement both:
1. Create `data/plans.yaml` with the 3 plans and schedule, plus `scripts/sync-plans.ts` and `npm run plans:sync`.
2. Update `agent/instructions.md` with explicit table parsing rules (`·` = 0) and immediate `saveMealPlan` execution.
