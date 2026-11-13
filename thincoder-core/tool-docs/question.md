Ask the user a question and wait for their response. Use when the task is ambiguous, you need a design decision, or you are stuck and need human judgment.

Parameters:
- `question` (required): the question to ask the user.
- `options`: an array of single-choice options for the user to pick from (optional). They MUST be plain strings, e.g. `["A", "B", "C"]` - never objects.

Notes:
- The agent loop pauses until the user answers, and their reply arrives as the next user message: the chosen option or free text. The loop resumes when it arrives.
{{inject:question-ui-face}}
{{knowledge:tool-question}}