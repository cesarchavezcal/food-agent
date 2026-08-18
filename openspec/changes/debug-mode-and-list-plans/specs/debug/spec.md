# Specification: CLI Debug Mode & `listPlans` Tool

## Domain
Agent CLI Runtime & Meal Plan Discovery

## Requirements

### Requirement: Real-Time Debug Traces
When `--debug` or `process.env.DEBUG` is active, the CLI MUST log:
- Cyan: `[DEBUG Tool Call: <toolName>(<args>)]`
- Green: `[DEBUG Tool Result: <result>]`
- Magenta: `[DEBUG Steps: <count>, Model: <name>]`

### Requirement: `listPlans` Database Tool
The system MUST provide a `listPlans` tool that returns an array of all distinct saved plans with their registered daily totals, calorie targets, and assigned days of the week.

### Requirement: Robust Table Row Reconstruction
The table sanitizer MUST assemble rows wrapped across 2+ lines into a single coherent row before parsing.
