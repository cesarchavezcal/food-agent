# Design: High-Efficiency Token Architecture

## Architecture

### 1. `agent/utils/tableParser.ts`
- Regex-based table detection:
  - Scans for rows starting and ending with `|`.
  - Normalizes header names (`Almuerzo` -> `almuerzo`, `Colación 1` -> `colacion_1`, `Pre-Workout` -> `pre_workout`).
  - Maps group names:
    - `verdura` -> `verdura`
    - `fruta` -> `fruta`
    - `cereal s/grasa` | `cereal` -> `cereal_sg`
    - `cereal c/grasa` -> `cereal_cg`
    - `aoa` -> `aoa_mbag`
    - `leche` -> `leche_descremada`
    - `grasa s/prot` -> `aceites_sin_proteina`
    - `grasa c/prot` -> `aceites_con_proteina`
  - Returns structured `ParsedMealPlan`.

### 2. Sparse Serialization in `agent/tools/getPlanPortions.ts` & `saveMealPlan.ts`
- Replaces `{ [key]: 0 }` with sparse objects.

### 3. Compact `agent/instructions.md`
- Concise clinical invariants (~550 tokens) enabling 100% prefix caching.
