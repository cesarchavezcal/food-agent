# Exploration: Robust Chat-Based Table Ingestion (`robust-chat-plan-ingestion`)

## Objective

Ensure that whenever the user pastes a meal plan table directly into the chat (in any format, with `·` as zero, with or without a plan title), the agent **immediately and reliably calls `saveMealPlan`** without asking the user to re-enter or re-format anything.

---

## What Needs to Be Fixed in the Agent's Brain

### 1. Concrete Few-Shot Training in `agent/instructions.md`
Add a dedicated Few-Shot section in `agent/instructions.md` containing the exact table format:

```markdown
### CRITICAL: Handling Table Pastes
When the user sends a Markdown table like:
| Grupo          | Almuerzo | Colación 1 | Comida | Colación 2 | Cena | Total |
| -------------- | -------- | ---------- | ------ | ---------- | ---- | ----- |
| Verduras       | 2        | ·          | 1      | ·          | ·    | 3     |
| Frutas         | 2        | ·          | ·      | 1          | ·    | 3     |
| Cereal s/grasa | 2.5      | ·          | 3      | ·          | 3    | 8.5   |
| AOA            | 5        | 2          | 5      | ·          | 3    | 15    |
| Leche          | 1        | ·          | ·      | ·          | 1    | 2     |
| Grasa s/prot   | ·        | ·          | 1      | ·          | 1    | 2     |
| Grasa c/prot   | 1        | 1          | 1      | 1          | 1    | 5     |
| Meta kcal      | 710      | 150        | 550    | 130        | 540  | 2,025 |

You MUST:
1. Treat `·`, `-`, `ND`, and whitespace as `0`.
2. Infer the plan name:
   - If 2,025 kcal -> "DESCANSO"
   - If 2,375 kcal -> "MEDIA"
   - If 2,550 kcal -> "ALTA DEMANDA"
   - Otherwise -> use the title in the message or "Plan Nutricional"
3. IMMEDIATELY call the `saveMealPlan` tool with the extracted `dailyTotal` and `byMeal` objects.
4. NEVER respond with an empty table asking the user to re-enter values.
```

### 2. SMAE Group Normalization Dictionary
Map abbreviations directly to the 19 standard database group IDs:
- `Verduras` $\rightarrow$ `verdura`
- `Frutas` $\rightarrow$ `fruta`
- `Cereal s/grasa` $\rightarrow$ `cereal_sin_grasa`
- `Cereal c/grasa` $\rightarrow$ `cereal_con_grasa`
- `AOA` $\rightarrow$ `aoa_muy_bajo_grasa`
- `Leche` $\rightarrow$ `leche_descremada`
- `Grasa s/prot` $\rightarrow$ `aceites_sin_proteina`
- `Grasa c/prot` $\rightarrow$ `aceites_con_proteina`

---

## Verification Strategy

1. **Automated Prompt Test (`tests/agent/table-ingestion.test.ts`)**:
   - Verify instructions explicitly contain the few-shot table parser rule and `·` $\rightarrow$ `0` translation.
2. **Interactive Live Test in `npm run dev`**:
   - Paste the exact table provided by the user.
   - Verify the agent logs `[Tool: saveMealPlan]` and saves the plan to Neon Postgres with 0 prompts or errors.
