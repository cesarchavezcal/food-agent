# Change Proposal: Terminal Multiline Paste Capture & Buffering

## Problem
In `agent/cli.ts`, standard `rl.question` breaks after the first newline (`\n`). When a user pastes a multiline table (e.g. 10 lines), only the first title line is submitted to the LLM while the rest remains unconsumed in stdin, causing the agent to ask for the table that the user already pasted.

## Solution
Replace `rl.question` with a debounced multiline input reader `readMultilineInput(rl)` that captures all rapid-fire pasted lines from clipboard into a single string before executing the turn.
