# Specification: Model Fallback Cascade

## Domain
AI Provider / Model Routing & Resilience

## Requirements

### Requirement: Default High-Throughput Model
The system MUST default to `openai/gpt-oss-20b` when `GROQ_MODEL` is not explicitly set in the environment.

### Requirement: Automated Failover on Model Deprecation
If an API call fails due to model deprecation or non-existence (`model_not_found`, `decommissioned`, or `404`), the runner MUST log a clear failover notification and retry with the next healthy candidate in the model cascade.

#### Scenario: Fallback on Decommissioned Model
- **Given** a requested model that returns `404 model_not_found`
- **When** `generateTextWithFallback` is invoked
- **Then** it logs `⚠️ Model ... is unavailable. Failing over to ...`
- **And** executes the turn on the fallback model successfully.
