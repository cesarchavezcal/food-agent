# Exploration: Token Cost Optimization & Portion Table Efficiency

## 1. Where Tokens Are Spent Today (Breakdown per Turn)

| Component | Current Token Footprint | % of Turn Cost |
|---|---|---|
| **System Prompt (`instructions.md`)** | ~1,450 tokens | **45%** |
| **Tool Definitions (7 Tools)** | ~1,100 tokens | **35%** |
| **Tool Result Payloads (e.g. `getPlanPortions`)** | ~400 tokens | **12%** |
| **User Message + Table** | ~250 tokens | **8%** |
| **Total per Turn** | **~3,200 tokens** | **100%** |

---

## 2. Top 4 Optimization Strategies

### Strategy 1: Sparse Tool Payloads (Drop Zero Values) — *High Impact*
Currently, when `saveMealPlan` or `getPlanPortions` returns database records, it includes all 15 SMAE groups even when they are `0`.
- **Before (Dense)**:
  ```json
  { "verdura": 2, "fruta": 0, "cereal_sg": 3, "cereal_cg": 0, "aoa_mbag": 0, "aoa_bag": 4, "leche": 0, ... }
  ```
- **After (Sparse)**:
  ```json
  { "verdura": 2, "cereal_sg": 3, "aoa_bag": 4 }
  ```
- **Savings**: **~70% reduction in tool response tokens** (~300 tokens saved per tool call).

---

### Strategy 2: Compact Clinical System Prompt — *Immediate Impact*
`agent/instructions.md` currently contains extensive explanatory prose.
- We can compress it into a tight Markdown specification with concise bullet points and direct formatting constraints.
- **Savings**: Reduces baseline overhead from **1,450 tokens down to ~550 tokens** (**-60% prompt tokens on EVERY turn**).

---

### Strategy 3: Deterministic Zero-Cost Table Pre-Parser — *Maximum Efficiency*
When a user pastes a Markdown table in the CLI (`| Grupo | Desayuno | ... |`):
- Instead of burning 3,200 LLM tokens to parse numbers from Markdown pipes into JSON, a lightweight TypeScript parser extracts the rows and calls `saveMealPlan` directly.
- The LLM only formats the friendly clinical confirmation response.
- **Savings**: **~75% token reduction** for meal plan creation.

---

### Strategy 4: Compact Table Markdown Format
When users paste or the agent prints tables:
- Omit empty columns/rows or collapse middle dots `·`.
- Represent tables in compact YAML/JSON or stripped Markdown.

---

## Token Reduction Impact Summary

| Metric | Before Optimization | After Optimization | Reduction |
|---|---|---|---|
| **Tokens per Query** | ~3,200 tokens | **~1,100 tokens** | **-65%** |
| **Queries per Minute under 8k TPM** | ~2 queries/min | **~7 queries/min** | **+250% capacity** |
| **Daily Queries under 200k TPD** | ~60 queries/day | **~180 queries/day** | **+200% capacity** |
