# Exploration: Conversational Meal Plan Ingestion & Schedule Tooling

## Decision

The user will add their 3 meal plans (`ALTA DEMANDA`, `MEDIA`, `DESCANSO`) and weekly schedule **directly through the conversational agent** to test its real-world interaction, parsing resilience, and database persistence.

---

## Technical Architecture Required

### 1. `saveMealPlan` Tool ([`agent/tools/saveMealPlan.ts`](file:///Users/cesaradalbertochavezcalderon/Personal/food-agent/agent/tools/saveMealPlan.ts))
Receives structured meal plan data extracted by the LLM from the user's paste:
- `planName`: e.g. `"ALTA DEMANDA"`
- `targetKcal`: e.g. `2550`
- `targetProteinG`: `159`
- `targetLipidsG`: `73`
- `targetCarbsG`: `315`
- `dailyTotal`: `{ verdura: 3, fruta: 4, cereal_sin_grasa: 14, aoa_muy_bajo_grasa: 14, leche_descremada: 2, aceites_sin_proteina: 8, aceites_con_proteina: 3 }`
- `byMeal`:
  - `almuerzo`: `{ verdura: 2, fruta: 2, cereal_sin_grasa: 5, aoa: 5, leche: 1, aceites_sin_proteina: 2, aceites_con_proteina: 1 }`
  - `colacion_1`: `{ fruta: 1, cereal_sin_grasa: 2, aoa: 2, aceites_sin_proteina: 1 }`
  - `comida`: `{ verdura: 1, cereal_sin_grasa: 4, aoa: 4, aceites_sin_proteina: 2 }`
  - `colacion_2`: `{ fruta: 1, aceites_sin_proteina: 1, aceites_con_proteina: 1 }`
  - `cena`: `{ cereal_sin_grasa: 3, aoa: 3, leche: 1, aceites_sin_proteina: 2, aceites_con_proteina: 1 }`
- **Action**: Upserts into `plans` table with idempotent `onConflictDoUpdate`.

### 2. `setWeeklySchedule` Tool ([`agent/tools/setWeeklySchedule.ts`](file:///Users/cesaradalbertochavezcalderon/Personal/food-agent/agent/tools/setWeeklySchedule.ts))
Allows the user to bind day names to plan names:
- `schedule`: `{ monday: "ALTA DEMANDA", tuesday: "ALTA DEMANDA", wednesday: "ALTA DEMANDA", thursday: "ALTA DEMANDA", friday: "ALTA DEMANDA", saturday: "MEDIA", sunday: "DESCANSO" }`
- **Action**: Resolves `plan_id` from `plans` table and upserts 7 rows into `weekly_schedule`.

### 3. Agent Instruction Refinement ([`agent/instructions.md`](file:///Users/cesaradalbertochavezcalderon/Personal/food-agent/agent/instructions.md))
Instructs the agent on how to recognize tabular meal plan pastes, normalize group names (`Cereal s/grasa` $\rightarrow$ `cereal_sin_grasa`, `AOA` $\rightarrow$ `aoa_muy_bajo_grasa`, `Grasa s/prot` $\rightarrow$ `aceites_sin_proteina`), call `saveMealPlan`, and reply with a clean confirmation table.

---

## Verification Strategy

1. **Unit Tests (`tests/tools/planning.test.ts`)**:
   - Test `saveMealPlan` parses and stores complex per-meal tables accurately.
   - Test `setWeeklySchedule` correctly binds days to plan IDs.
   - Test `getPlanPortions` retrieves both daily totals and granular per-meal portions.
2. **Interactive Live Test in Terminal**:
   - Run `npm run dev` and paste the 3 plans.
   - Confirm agent successfully parses, saves, and confirms each plan.
   - Ask for today's plan schedule.
