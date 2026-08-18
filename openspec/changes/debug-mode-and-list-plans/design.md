# Design: CLI Debug Mode & `listPlans` Tool

## Architecture

### `agent/tools/listPlans.ts`
- Queries `plans` and `weeklySchedule` tables.
- Groups by `planName` and aggregates total equivalentes per group.
- Returns `{ plans: Array<{ planName: string, meals: string[], dailyTotal: Record<string, number>, assignedDays: string[] }> }`.

### `agent/cli.ts` Debug Instrumentation
- Checks `process.argv.includes("--debug") || Boolean(process.env.DEBUG)`.
- Wraps tool execute callbacks to print input arguments and output results when `DEBUG` is true.

### `sanitizeTerminalTableInput` in `agent/cli.ts`
- Merges consecutive lines that start with `|` or have trailing pipe fragments until pipe count matches table header column count.
