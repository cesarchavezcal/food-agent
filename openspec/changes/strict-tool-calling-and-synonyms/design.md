# Design: Strict Tool Calling & SMAE Synonym Search

## Architecture

### `normalizeFoodQuery(query: string): string` in `agent/utils/synonyms.ts`
- Trims whitespace and accents.
- Replaces colloquial aliases with standard SMAE search tokens before passing to SQL trigram or cache.

### `getGramsForPortion.ts` & `coverageForAmount.ts`
- Uses `normalizeFoodQuery(input.foodName)` on input before checking cache and database.

### System Prompt & Model Cascade in `agent/cli.ts`
- Sets default primary model to `qwen/qwen3.6-27b`.
- System prompt reinforces that every portion request strictly invokes `getGramsForPortion`.
