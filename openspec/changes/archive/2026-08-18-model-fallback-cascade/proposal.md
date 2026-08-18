# Change Proposal: Model Fallback Cascade & High-Throughput Default

## Problem
`openai/gpt-oss-120b` has an 8,000 TPM limit on Groq's Free Tier that can trigger 20s cooldowns, and static model configurations risk failure if Groq sun-sets or deprecates a model ID.

## Solution
1. Set the default Groq model to `openai/gpt-oss-20b` for instant (<300ms) execution and high token headroom.
2. Implement an automated Model Fallback Cascade (`[GROQ_MODEL, "openai/gpt-oss-20b", "qwen/qwen3.6-27b", "openai/gpt-oss-120b"]`) that seamlessly fails over if a model ID is decommissioned or returns 404/400.
