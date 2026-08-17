# Exploration: Groq Rate Limit Resilience & Sliding Window Context (`resilient-rate-limit-handling`)

## Problem Statement

On Groq's Free Tier, `openai/gpt-oss-120b` has an 8,000 Tokens Per Minute (TPM) limit.
Because each turn sends the full `instructions.md` (~1,500 tokens), tool schemas (~1,200 tokens), plus conversation history (~500 tokens), a multi-step tool execution can consume ~3,200 tokens per step. After 2 turns within 60 seconds, Groq returns:
```text
Rate limit reached on TPM: Limit 8000, Used 5648, Requested 3209. Please try again in 6.4s.
```

---

## 3-Pronged Architecture Fix

### 1. Auto-Retry with Intelligent Sleep on 429 Rate Limits
In `agent/cli.ts`, intercept Groq 429 rate limit errors:
- Extract the wait time from the error message (e.g. `6.4s` $\rightarrow$ 7000ms).
- Show a clean terminal spinner: `⏳ Cuota temporal de Groq alcanzada. Esperando 6.4s para continuar automáticamente...`.
- Sleep for the requested duration and automatically re-execute the request without failing the turn.

### 2. Conversation Sliding Window (Context Pruning)
In `agent/cli.ts`, maintain a sliding window of the last 4 messages (plus system instructions).
- Prevents past turns from inflating prompt tokens from 3,000 to 7,000+ tokens.
- Keeps every turn under ~2,200 tokens, allowing multiple turns per minute without hitting the 8,000 TPM threshold.

### 3. Compact Instruction Footprint
Streamline `agent/instructions.md` to be concise, eliminating redundant prose while preserving all clinical and tool directives, reducing baseline token overhead by ~30%.

---

## Verification Strategy

1. **Automated Unit Tests (`tests/cli/retry.test.ts`)**:
   - Test rate-limit duration extraction and retry logic.
2. **Interactive Live Test in `npm run dev`**:
   - Paste table repeatedly; confirm auto-retry waits 6s and successfully saves the plan without crashing.
