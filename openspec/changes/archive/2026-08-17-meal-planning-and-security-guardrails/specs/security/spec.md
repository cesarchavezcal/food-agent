# Specification: Agent Security & Domain Boundary

## Domain
Agent Security / Safety Guardrails

## Requirements

### Requirement: Strict Nutrition Domain Enforcement
The agent MUST decline any request unrelated to clinical nutrition, meal planning, dietary tracking, or SMAE food equivalence.

#### Scenario: General Math Prompt Rejection
- **Given** a user input `"How much is $100 - $50?"`
- **When** the agent processes the input
- **Then** the agent declines to perform generic non-nutrition calculations
- **And** politely re-anchors the user to nutrition and SMAE diet management.

#### Scenario: Code or Unrelated Task Rejection
- **Given** a user input asking to write code, discuss politics, or provide financial advice
- **When** the agent processes the input
- **Then** the agent declines and explains its clinical nutrition boundaries.
