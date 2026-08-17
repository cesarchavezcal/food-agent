# Specification: Multiline Paste Buffering

## Domain
CLI / Input Capture

## Requirements

### Requirement: Multiline Clipboard Paste Buffering
The CLI runner MUST buffer multiline stdin chunks emitted during paste operations and provide the consolidated multiline payload to the model.

#### Scenario: 10-Line Table Paste
- **Given** an active CLI runner
- **When** a user pastes a 10-line Markdown meal plan table
- **Then** `readMultilineInput` buffers all lines within the paste window (<100ms between lines)
- **And** submits the full 10-line string to `sanitizeTerminalTableInput` and the agent turn.
