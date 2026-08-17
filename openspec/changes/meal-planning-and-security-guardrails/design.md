# Design: Meal Planning Tools & Security Boundary

## Architecture

### 1. `saveMealPlan` Tool (`agent/tools/saveMealPlan.ts`)
- Schema:
  - `planName`: string
  - `targetKcal`: number (optional)
  - `targetProteinG`: number (optional)
  - `targetLipidsG`: number (optional)
  - `targetCarbsG`: number (optional)
  - `dailyTotal`: Record<string, number>
  - `byMeal`: Record<string, Record<string, number>> (optional)
- Persistence: Upserts into `plans` table (`onConflictDoUpdate`).

### 2. `setWeeklySchedule` Tool (`agent/tools/setWeeklySchedule.ts`)
- Schema:
  - `schedule`: Record<string, string> (e.g. `{ monday: "ALTA DEMANDA", tuesday: "ALTA DEMANDA", ... }` or array of `{ dayOfWeek: number, planName: string }`).
- Persistence: Resolves `plan_id` and upserts into `weekly_schedule` for days 0..6.

### 3. Updated `getPlanPortions` Tool (`agent/tools/getPlanPortions.ts`)
- Returns `planName`, `targetKcal`, `targetMacros`, `dailyTotal`, and `byMeal` for the requested day / active plan.

### 4. Security Guardrails (`agent/instructions.md`)
- Enforces strict domain limits.
- Defines standard clinical rejection response:
  `"I specialize exclusively in clinical nutrition, meal planning, and SMAE diet tracking. I cannot assist with general math or non-nutrition topics. How can I help you with your diet today?"`
