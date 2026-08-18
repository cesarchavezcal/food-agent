# Change Proposal: CLI Debug Mode, `listPlans` Tool & Robust Table Stitcher

## Problem
1. When debugging agent execution, there was no visibility into which tools were invoked or what raw outputs were generated.
2. The agent lacked a `listPlans` tool to query and list saved nutrition plans from Neon Postgres.
3. Narrow terminal windows wrapped pasted Markdown tables across lines, causing partial row fragmentation that bypassed the deterministic $0-token table parser.
4. LLMs returning empty text (`""`) due to reasoning/thinking stripping caused silent blank turns and poisoned message history.

## Solution
1. Add `--debug` CLI flag / `DEBUG=1` support to print real-time colored traces for tool calls, payloads, step counts, and latency.
2. Implement `listPlans` database tool querying all registered meal plans and daily calorie targets.
3. Enhance table sanitizer to stitch wrapped multiline table rows before parsing.
4. Guard against empty LLM responses by failing over to the next candidate model and preventing empty assistant messages in history.
