# Design: Few-Shot Table Ingestion Architecture

## Architecture

### 1. `agent/instructions.md` Few-Shot Ingestion Section
Include explicit instruction and concrete examples:
- `·` / `-` $\rightarrow$ `0`
- Group mappings:
  - `Verduras` $\rightarrow$ `verdura`
  - `Frutas` $\rightarrow$ `fruta`
  - `Cereal s/grasa` $\rightarrow$ `cereal_sin_grasa`
  - `AOA` $\rightarrow$ `aoa_muy_bajo_grasa`
  - `Leche` $\rightarrow$ `leche_descremada`
  - `Grasa s/prot` $\rightarrow$ `aceites_sin_proteina`
  - `Grasa c/prot` $\rightarrow$ `aceites_con_proteina`
- Calorie signatures:
  - 2,025 kcal $\rightarrow$ `DESCANSO`
  - 2,375 kcal $\rightarrow$ `MEDIA`
  - 2,550 kcal $\rightarrow$ `ALTA DEMANDA`
- Execution directive: Call `saveMealPlan` immediately and return a Markdown confirmation. Never return an empty form.
