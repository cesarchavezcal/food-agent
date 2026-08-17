# Specification: SMAE Catalog Header Resolution and Invariants

## Domain
Catalog / Excel Ingestion

## Requirements

### Requirement: Excel Table Header Detection
The workbook parser MUST accurately identify the column header row containing `Cantidad sugerida`, `Unidad`, `Peso bruto redondeado (g)`, `Peso neto (g)`, `Energia (Kcal)`, `Proteina (g)`, `Lípidos (g)`, and `Hidratos de carbono (g)`.

#### Scenario: Multi-row Sheet Header Resolution
- **Given** an SMAE spreadsheet with title banners on row 0 and column headers on row 2
- **When** `parseSmaeWorkbook` processes the workbook
- **Then** the parser locates the true column header row without matching title banners
- **And** extracts exact net weights, units, and macronutrients for each food item

### Requirement: Golden Clinical Invariants
The ingestion process MUST preserve clinical portion equivalents for canonical Mexican foods.

#### Scenario: Canonical Food Portion Invariants
- **Given** the parsed SMAE catalog
- **Then** `Pechuga de pollo deshuesada sin piel cruda` MUST equal `30g` (1 equivalent)
- **And** `Pechuga de pollo sin piel a la plancha` MUST equal `30g` (1 equivalent)
- **And** `Manzana` MUST equal `106g` (1 equivalent)
- **And** `Tortilla de maíz` MUST equal `30g` (1 equivalent)
- **And** `Aceite de oliva` MUST equal `5g` (1 equivalent)
