# Design: Multiline Paste Debouncer

## Architecture

### 1. `readMultilineInput(rl, prompt)` in `agent/cli.ts`
- Uses `readline` interface events (`rl.on("line")` or `rl.question` with paste buffering).
- Sets a 100ms debounce timer:
  - If lines arrive in rapid succession (<100ms apart), they belong to the same clipboard paste block $\rightarrow$ buffer accumulates.
  - When the timer expires, the promise resolves with the full trimmed multiline string.
- Directly feeds into `sanitizeTerminalTableInput(sanitized)`.
