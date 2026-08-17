# Implementation Plan: Terminal Table Sanitizer & Direct Table Parser

Fix the issue where pasting Markdown tables in terminal emulators introduces broken line wraps across rows (e.g. `Post-\n Workout | Cena`), causing the LLM to receive fragmented lines instead of complete table rows.

## User Review Required

> [!IMPORTANT]
> **Root Cause Identified**:
> In your terminal paste, the window width introduced soft line-breaks inside table cells:
> ```text
> | Grupo          | Pre-Workout | Almuerzo | Post-
>   Workout | Cena | Total |
> ```
> Because `Post-` and `Workout` were split onto different lines, the Markdown table syntax broke into disjoint fragments.

---

## Proposed Changes

### Component 1: Terminal Table Sanitizer (`agent/cli.ts`)

#### [MODIFY] `agent/cli.ts`
Add a pre-processing step `sanitizeTerminalTableInput(input: string): string` before passing user messages to the model:
1. Detects header row containing `Grupo` or `Alimento` and determines the column/pipe count $N$.
2. Re-assembles fragmented/wrapped lines until a full $N$-column table row is reconstructed.
3. Passes clean, valid Markdown tables to the agent.

---

## Verification Plan

### Automated Tests
```bash
npm run test
npm run typecheck
```
- `tests/cli/sanitizer.test.ts` verifying fragmented table lines from terminal line-wrapping are reconstructed into valid tables.

### Manual Verification
- Run `npm run dev` and paste the broken wrapped table.
- Verify `saveMealPlan` executes immediately and saves `"DÍA DE PIERNAS"` in Neon Postgres.
