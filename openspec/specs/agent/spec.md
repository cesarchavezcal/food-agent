# Eve Agent Runtime & Orchestration Specification

## Purpose
Configures Vercel Eve agent instructions, tool registration, Groq model provider, and conversational guidelines for the SMAE personal diet assistant.

## Requirements

### Requirement: Groq Model & Eve Runtime Configuration
The system MUST initialize the Eve agent runtime using `@ai-sdk/groq` with `llama-3.3-70b-versatile`.

#### Scenario: Runtime Initialization
- GIVEN a valid `GROQ_API_KEY`
- WHEN the agent initializes in local dev (`npx eve dev`) or production
- THEN the model connects to Groq with streaming response support and automatic tool calling.

### Requirement: Strict Tool Delegation for Nutritional Math
The agent MUST delegate all arithmetic, portion calculations, and database modifications to deterministic TypeScript tools.

#### Scenario: Natural Language Portion Request
- GIVEN a user asks "¿Cuántos gramos de arroz debo comer para 2 equivalentes?"
- WHEN the agent receives the prompt
- THEN the agent calls `getGramsForPortion({ foodName: "arroz", nEquivalentes: 2 })`
- AND formats the returned tool output in natural Mexican Spanish without modifying the calculated numbers.

#### Scenario: Zero Hallucinated Values
- GIVEN a user asks for nutritional data not in catalog
- WHEN the agent searches via tool and receives null
- THEN the agent prompts the user to supply the nutrition facts table rather than inventing macronutrient numbers.
