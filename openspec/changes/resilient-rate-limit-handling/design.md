# Design: Groq Rate Limit Auto-Retry & Context Window Pruning

## Architecture

### 1. `extractRetryDelay(errorMsg: string): number` in `agent/cli.ts`
- Parses strings matching `/try again in ([0-9.]+)s/i` or `retry-after`.
- Returns milliseconds (e.g. `6.42s` $\rightarrow$ `Math.ceil(6.42 * 1000) + 500 = 7000ms`).
- Defaults to 5000ms if no exact timestamp is detected.

### 2. `generateTextWithRetry(options, maxRetries = 3)` in `agent/cli.ts`
- Wraps `generateText`.
- Catches 429 errors, logs an informative waiting status to the user:
  `\x1b[33m⏳ Límite de tokens de Groq alcanzado. Esperando ${seconds}s para reintentar automáticamente...\x1b[0m`
- Waits with `setTimeout` and transparently retries.

### 3. Context Sliding Window in `agent/cli.ts`
- Before each turn, prunes `messages` to:
  `[messages[0], ...messages.slice(-4)]` (system prompt + last 4 dialogue turns).
