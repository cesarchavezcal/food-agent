# Tracking & Meal Planning Specification

## Purpose
Manages structured meal plans, weekly day-to-plan schedules, per-meal food intake logs strictly in grams, and real-time daily summary diffs.

## Requirements

### Requirement: Meal Plan & Schedule Resolution
The system MUST retrieve planned equivalents for a specified meal and automatically resolve the active plan for a given day of the week.

#### Scenario: Explicit Plan Query
- GIVEN a plan "leg day" with breakfast defined as 2 eq Cereal, 3 eq AOA, 1 eq Grasa
- WHEN `getPlanPortions({ planName: "leg day", meal: "desayuno" })` is called
- THEN the system returns the exact planned equivalent breakdown for breakfast.

#### Scenario: Schedule Auto-Resolution
- GIVEN `weekly_schedule` maps "monday" $\rightarrow$ "leg day"
- WHEN `getPlanPortions({ date: "2026-08-17", meal: "almuerzo" })` is called without `planName`
- THEN the system resolves the day as Monday, looks up "leg day", and returns the lunch equivalents.

### Requirement: Per-Meal Food Intake Logging
The system MUST log consumed food entries with exact date, meal type, food ID, and grams.

#### Scenario: Valid Food Log
- GIVEN a valid food "Pechuga de pollo" (1 eq = 30g)
- WHEN `logFood({ date: "2026-08-17", meal: "comida", foodName: "pechuga de pollo", grams: 150 })` is called
- THEN the system stores the entry in `daily_logs`
- AND computes that 5.0 equivalents of AOA were fulfilled.

### Requirement: Daily Summary & Plan Diffing
The system MUST aggregate logged intake for a date, group by equivalent category and macronutrients, and compare against the active scheduled plan.

#### Scenario: Summary Comparison
- GIVEN planned intake of 5 eq AOA and 4 eq Cereal for the day
- AND logged intake of 5 eq AOA and 2 eq Cereal
- WHEN `getDailySummary({ date: "2026-08-17" })` is called
- THEN the system returns consumed totals, planned targets, and remaining differences (`{ aoaRemaining: 0, cerealRemaining: 2 }`).
