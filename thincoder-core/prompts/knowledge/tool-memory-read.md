Layer = the memory tier: personal (private) / project (shared via this repo's .thincoder/memory/) / team (CLI only, git-synced). The `[layer]` tag, the id prefix and the `layer` parameter are the same concept.

Both actions take `layer` optionally — omit it to read every layer.

The other arguments:

- `type` — filters list by entry type: rule (coding standards) · knowledge (project facts) · decision (architecture decisions) · pattern (debugging/workflow patterns).
- `keyword` — filters list by a substring of the title or content.
- `query` — search's natural-language question.
- `limit` — caps the rows (list 50 by default, search 5).