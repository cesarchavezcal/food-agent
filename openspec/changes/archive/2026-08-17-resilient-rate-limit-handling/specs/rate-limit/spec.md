# Specification: Resilient Rate Limit Handling

## Domain
CLI / API Resilience

## Requirements

### Requirement: 429 Rate Limit Auto-Retry
The CLI runner MUST detect Groq TPM rate limits, extract the required sleep seconds (e.g. `Please try again in 6.42s`), pause execution, and re-execute the request without failing the turn.

#### Scenario: Intercept 429 and Retry
- **Given** Groq returns `Rate limit reached on TPM... Please try again in 6.42s`
- **When** the error is caught by `generateTextWithRetry`
- **Then** the runner extracts `6.42s` (rounded up to 7000ms)
- **And** sleeps for that duration while displaying a retry indicator
- **And** retries the LLM generation successfully.

### Requirement: Context Sliding Window
The CLI runner MUST preserve the system prompt while maintaining only the most recent turns (last 4–6 messages) to prevent context token bloat.
