# Specification: Meal Plan Ingestion & Schedule

## Domain
Nutrition Planning / Database

## Requirements

### Requirement: Granular Meal Plan Storage (`saveMealPlan`)
The system MUST allow creating and updating meal plans with daily macro targets, total group equivalents, and per-meal breakdowns (`byMeal`).

#### Scenario: Save Plan with Per-Meal Breakdowns
- **Given** a plan name `"ALTA DEMANDA"`, target calories `2550`, target macros (159g P, 73g L, 315g HC)
- **And** per-meal portions for `almuerzo`, `colacion_1`, `comida`, `colacion_2`, `cena`
- **When** `saveMealPlan` is executed
- **Then** the plan is persisted in the `plans` table
- **And** contains both `dailyTotal` and `byMeal` structured objects.

### Requirement: Weekly Schedule Binding (`setWeeklySchedule`)
The system MUST bind days of the week (0 = Sunday to 6 = Saturday) to valid stored plans.

#### Scenario: Set 7-day Schedule
- **Given** an existing plan `"ALTA DEMANDA"`
- **When** `setWeeklySchedule` is called with Monday through Friday assigned to `"ALTA DEMANDA"`
- **Then** `weekly_schedule` records for days 1 to 5 reference the `"ALTA DEMANDA"` plan.
