# Specification: Meal Plan Foreign Key Integrity

## Domain
Database Integrity & SMAE Group Normalization

## Requirements

### Requirement: Canonical Database Foreign Key IDs
All rows inserted into the `plans` table MUST use valid `equivalent_groups.id` values:
- `verduras`
- `frutas`
- `cereales_sin_grasa`
- `cereales_con_grasa`
- `leguminosas`
- `aoa_muy_bajo_grasa`
- `aoa_bajo_grasa`
- `aoa_moderado_grasa`
- `aoa_alto_grasa`
- `leche_descremada`
- `leche_semidescremada`
- `leche_entera`
- `leche_con_azucar`
- `aceites_y_grasas`
- `aceites_y_grasas_con_proteina`
- `azucares_sin_grasa`
- `azucares_con_grasa`

### Requirement: Automatic Group Alias Normalization
`saveMealPlan` MUST automatically map common abbreviations and aliases (e.g. `verdura` $\rightarrow$ `verduras`, `cereal_sg` $\rightarrow$ `cereales_sin_grasa`, `aoa` $\rightarrow$ `aoa_muy_bajo_grasa`, `grasa s/prot` $\rightarrow$ `aceites_y_grasas`, `grasa c/prot` $\rightarrow$ `aceites_y_grasas_con_proteina`) before issuing SQL statements.
