# Specification: Chat-Based Table Ingestion

## Domain
Chat Parsing / Prompt Engineering

## Requirements

### Requirement: Raw Table and Symbol Recognition
The agent MUST parse raw markdown tables with symbol `·` or `-` representing zero equivalents.

#### Scenario: Parse Table with Dots and Slashes
- **Given** a markdown table with rows containing `·` in meal columns
- **When** the agent processes the message
- **Then** `·` is translated to `0`
- **And** non-zero numbers are mapped to the corresponding meal and standard SMAE group
- **And** `saveMealPlan` is called immediately.

### Requirement: Automatic Plan Identity Resolution
The agent MUST infer plan names from calorie signatures if no explicit title is provided.

#### Scenario: Infer Plan Name by Calories
- **Given** a table with `Meta kcal: 2,025`
- **When** no plan name is explicitly given
- **Then** the agent assigns `planName: "DESCANSO"`
- **And** saves the plan under `planName: "DESCANSO"`.
