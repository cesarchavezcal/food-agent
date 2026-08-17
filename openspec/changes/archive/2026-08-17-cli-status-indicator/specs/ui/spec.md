# Specification: CLI Live Status Spinner

## Domain
CLI / User Experience

## Requirements

### Requirement: Interactive Animated Thinking Spinner
The CLI runner MUST render an animated spinner on stdout while awaiting model generation and tool execution, updating its message during tool calls and erasing itself before printing final output.

#### Scenario: Tool Execution Animation
- **Given** an active REPL session
- **When** the user sends a prompt or table
- **Then** the spinner starts with `Pensando...`
- **And** updates to `Ejecutando herramienta: <toolName>...` during tool calls
- **And** stops cleanly upon receiving the final text response.
