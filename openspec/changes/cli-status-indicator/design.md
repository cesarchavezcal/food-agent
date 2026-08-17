# Design: Zero-Dependency ANSI Terminal Spinner

## Architecture

### `createCliSpinner(stream = process.stdout)` in `agent/cli.ts`
- Uses braille frames: `["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"]`.
- Interval: 80ms.
- Methods:
  - `start(initialText: string)`: Begins animation and writes `\r\x1b[K\x1b[36m${frame}\x1b[0m ${text}`.
  - `update(newText: string)`: Changes the displayed label.
  - `stop()`: Clears interval and erases line with `\r\x1b[K`.
- Wraps tools in `agent/cli.ts` so when a tool executes, `spinner.update("Ejecutando herramienta: " + toolName)` is called.
