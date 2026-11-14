Two actions:

- `search` — find knowledge saved in previous sessions. Each result row carries `[layer]` plus the entry id, and the id's prefix is the layer.
- `list` — inventory what memory holds, one row per entry: `[layer] id [type] title (date)`. A truncated list notes the full count.

Use it before re-exploring something the project may already know: a saved rule, a decision, a debugging pattern. Session message history is NOT in memory — that is `read_history`.

Writing memory belongs to the role that owns writes. Those actions are not part of this tool face, and calling one directly is refused before anything is written.

Layer = the memory tier: personal (private) / project (shared via this repo's .thincoder/memory/) / team (CLI only, git-synced). The `[layer]` tag, the id prefix and the `layer` parameter are the same concept.

Both actions take `layer` optionally — omit it to read every layer.

The other arguments:

- `type` — filters list by entry type: rule (coding standards) · knowledge (project facts) · decision (architecture decisions) · pattern (debugging/workflow patterns).
- `keyword` — filters list by a substring of the title or content.
- `query` — search's natural-language question.
- `limit` — caps the rows (list 50 by default, search 5).