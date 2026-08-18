# Change Proposal: Fix Meal Plan Foreign Key Group IDs & Safe Error Handling

## Problem
`tableParser.ts` produced non-existent group keys (`cereal_sg`, `aoa_mbag`, `aceites_sin_proteina`, `verdura`, `fruta`) that violated the Foreign Key constraint `plans.groupId -> equivalent_groups.id` in Neon Postgres, causing `saveMealPlan` to fail and the CLI to crash with `Cannot convert undefined or null to object`.

## Solution
1. Update `tableParser.ts` to output exact canonical DB Foreign Key IDs (`verduras`, `frutas`, `cereales_sin_grasa`, `aoa_muy_bajo_grasa`, `leche_descremada`, `aceites_y_grasas`, `aceites_y_grasas_con_proteina`).
2. Add automated group ID normalization inside `saveMealPlan.ts` to convert any group aliases (`cereal_sg`, `aoa`, `grasa`, `verdura`) to the valid database foreign key ID.
3. Guard `saved.success` in `agent/cli.ts` so error messages are surfaced cleanly.
