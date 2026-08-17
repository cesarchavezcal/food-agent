# Exploration: Interactive Status Indicators & Progress in CLI

## Overview

When interacting with the CLI runner (`agent/cli.ts`), especially when Groq processes large tables or multi-step tool calls, having real-time visual feedback is critical for user experience.

---

## Approaches & Options

### Approach 1: Animated Terminal Spinner with Real-time Tool Activity (Recommended)
Display a live spinner in the terminal while waiting for the model and tool execution:
- `⠋ Pensando y analizando...`
- `⠹ Ejecutando: saveMealPlan("ALTA DEMANDA")...`
- `⠼ Consultando base de datos SMAE...`
- `✔ Listo!`

**Pros**:
- Immediate visual feedback that the agent is working.
- Shows exactly which database tool is running under the hood without cluttering final output.
- Clean erase when the final answer appears.

**Cons**:
- Minimal overhead to manage terminal cursor escape codes (`\r`, `\x1b[K`).

---

### Approach 2: Live Token Streaming (`streamText`)
Switch `generateTextWithRetry` to `streamText` from Vercel AI SDK:
- Words appear in real-time as Groq outputs them (300+ tokens/second).

**Pros**:
- Feels blazing fast and interactive.

**Cons**:
- Multi-step tool execution requires handling tool call events before text streams.

---

### Approach 3: Context & Plan Status Line in Prompt
Display a compact status badge above or inside the user prompt:
`[📊 Plan Activo: DESCANSO (2,025 kcal) | Consumido: 550 kcal]`

**Pros**:
- Always informs the user of their current day's progress at a glance.

---

## Recommendation

Implement **Approach 1 (Animated Tool & Thinking Spinner)** + **Approach 3 (Active Plan Indicator)**:
1. When user presses Enter or pastes a table: start a lightweight terminal spinner (`ora`-like or pure native escape code spinner with 0 external dependencies).
2. Update spinner message when tools (`saveMealPlan`, `searchFood`, etc.) start and complete.
3. Cleanly clear the spinner and print the final assistant response.
