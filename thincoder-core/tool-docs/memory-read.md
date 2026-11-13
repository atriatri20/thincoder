Search and inventory long-term memory, read-only. Nothing here writes: no entry is saved, deleted, cleared or re-indexed.

Two actions:

- `search` — find knowledge saved in previous sessions. Each result row carries `[layer]` plus the entry id, and the id's prefix is the layer.
- `list` — inventory what memory holds, one row per entry: `[layer] id [type] title (date)`. A truncated list notes the full count.

{{knowledge:tool-memory-read}}

Use it before re-exploring something the project may already know: a saved rule, a decision, a debugging pattern. Session message history is NOT in memory — that is `read_history`.

Writing memory belongs to the role that owns writes. Those actions are not part of this tool face, and calling one directly is refused before anything is written.