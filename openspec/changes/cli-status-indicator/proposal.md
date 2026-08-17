# Change Proposal: Real-Time Thinking & Tool Activity CLI Spinner

## Problem
In `agent/cli.ts`, while the LLM generates a response or executes tools against Neon Postgres, the terminal sits blank without visual feedback, making it unclear whether the system is analyzing, executing tools, or waiting on rate limits.

## Solution
Add a lightweight, zero-dependency ANSI terminal spinner `createCliSpinner` that shows live animated status:
- `⠋ Pensando y analizando solicitud...`
- `⠹ Ejecutando herramienta: saveMealPlan...`
- Clean erase when output is ready.
