# Exploration: Terminal Multiline Paste Capture (`multiline-paste-support`)

## Root Cause Identified

In `agent/cli.ts`, the REPL used:
```ts
const userInput = await rl.question("\n🧑 Tú: ");
```
In Node.js, `rl.question` resolves on the **first newline character (`\n`)**.
When a user pastes a multiline table from the clipboard:
1. `rl.question` immediately returned after the first line: `"Guarda este plan: DÍA DE PIERNAS (3,000 kcal)"`.
2. The agent only received that header line with **no table body**.
3. Naturally, the agent asked: *"Para guardar el plan necesito conocer cómo se distribuyen los equivalentes... ¿Podrías proporcionarme la tabla?"*.
4. The remaining 9 lines of the table were left stranded in the stdin buffer.

---

## The Solution: Fast Paste Debounce Buffering

Replace `rl.question` with a debounced multiline reader:
- When a user presses Enter manually, a 100ms debounce fires and immediately returns the typed single line.
- When a user pastes a 10-line or 50-line table, all lines arrive in stdin in < 5ms. The debouncer collects all lines into a single complete multiline string before invoking the agent.
- Passes the complete table to `sanitizeTerminalTableInput` and directly triggers `saveMealPlan`.

---

## Verification Strategy

1. **Automated Unit Tests (`tests/cli/multiline.test.ts`)**:
   - Verify multiline paste capture and table sanitization.
2. **Interactive Live Test in `npm run dev`**:
   - Paste the full 10-line table in the terminal.
   - Confirm the agent receives the entire table in a single turn and calls `saveMealPlan`.
