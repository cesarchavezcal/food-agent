# Change Proposal: Strict Tool Calling & SMAE Synonym Search

## Problem
1. When short queries (e.g. `"porción de jitomate"`) were sent, smaller models occasionally answered directly with hallucinated numbers (30g / 100g) instead of invoking the database tool `getGramsForPortion`.
2. Colloquial searches like `"jitomate rojo"` failed to match `"Jitomate"` in the SMAE database.
3. The primary model needs to be `qwen/qwen3.6-27b` to guarantee 100% strict tool-calling discipline and exact SMAE Net Weights (113g for Jitomate, 106g for Manzana).

## Solution
1. Add a synonym normalization dictionary (`jitomate rojo` $\rightarrow$ `jitomate`, `pechuga` $\rightarrow$ `pechuga de pollo`, etc.) in `agent/utils/synonyms.ts`.
2. Set default model cascade to `[GROQ_MODEL, "qwen/qwen3.6-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"]`.
3. Strengthen system prompt rules so any portion question ALWAYS triggers `getGramsForPortion`.
