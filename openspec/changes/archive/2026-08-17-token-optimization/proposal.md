# Change Proposal: Token Optimization Architecture

## Problem
Every query currently burns ~3,200 tokens due to dense system instructions (~1,450 tokens), dense 15-key database returns (~400 tokens), and LLM-based markdown table extraction (~3,000 tokens), causing rate limit pressure on Groq's 8,000 TPM limit.

## Solution
1. Deterministic TypeScript CLI pre-parser for meal plan tables at $0 token cost.
2. Sparse JSON serialization in database tools (omitting zero values).
3. Compact clinical system prompt (~550 tokens) enabling 100% prefix caching.
