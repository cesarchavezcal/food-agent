# Design: Meal Plan Foreign Key Integrity

## Architecture

### `normalizeSmaeGroupId(groupId: string): string` in `agent/tools/saveMealPlan.ts` & `agent/utils/tableParser.ts`
Canonical mapping dictionary:
- `verdura`, `verduras` $\rightarrow$ `verduras`
- `fruta`, `frutas` $\rightarrow$ `frutas`
- `cereal_sg`, `cereal_sin_grasa`, `cereales_sin_grasa`, `cereal s/grasa` $\rightarrow$ `cereales_sin_grasa`
- `cereal_cg`, `cereal_con_grasa`, `cereales_con_grasa`, `cereal c/grasa` $\rightarrow$ `cereales_con_grasa`
- `leguminosa`, `leguminosas` $\rightarrow$ `leguminosas`
- `aoa`, `aoa_mbag`, `aoa_muy_bajo_grasa` $\rightarrow$ `aoa_muy_bajo_grasa`
- `leche`, `leche_descremada` $\rightarrow$ `leche_descremada`
- `grasa_sin_proteina`, `aceites_sin_proteina`, `grasa s/prot`, `aceites_y_grasas` $\rightarrow$ `aceites_y_grasas`
- `grasa_con_proteina`, `aceites_con_proteina`, `grasa c/prot`, `aceites_y_grasas_con_proteina` $\rightarrow$ `aceites_y_grasas_con_proteina`

### `agent/cli.ts` Guard
- When calling `(saveMealPlan as any).execute(...)`, check `if (!saved || !saved.success)` and print `saved?.error || "Error al guardar el plan"` instead of throwing `TypeError: Cannot convert undefined or null to object`.
