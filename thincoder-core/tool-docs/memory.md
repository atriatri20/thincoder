Manage long-term memory in ONE tool — the action parameter picks the operation:
- search — find knowledge saved in previous sessions; each result row carries [layer] + entry id (the id's prefix = the layer)
- put — save knowledge for future sessions; type = rule (coding standards) / knowledge (project facts) / decision (architecture decisions) / pattern (debugging/workflow patterns)
- list — inventory what memory holds; one row per entry: [layer] id [type] title (date); a truncated list notes the full count
- delete — SINGLE: {id, layer} removes the entry shown in put/search/list output — layer is optional: passed, it is validated against the id prefix (a mismatch is refused — guards against deleting the wrong entry); omitted, the id prefix routes the delete (any id from put/search/list is directly deletable). BATCH (no id): {layer, type and/or keyword} removes every matching entry in that layer — layer plus at least one of type / keyword is required; without confirm:true it returns the count + preview instead; a layer-wide wipe without filters is refused on every layer
- clear — {layer: "personal", confirm: true} wipes ALL personal memory entries. clear is personal-only: a missing layer or a project/team layer is refused (use delete batch filters on shared layers)
- maintain — index self-maintenance. Dry run by default: without confirm:true you get the plan and its readings and nothing is written; confirm:true executes. It takes no layer — it works on the whole store, not one layer.

Layer = the memory tier: personal (private) / project (shared via this repo's .thincoder/memory/) / team (CLI only, git-synced); the [layer] tag, the id prefix, and the layer parameter are the same concept — pass a result row's [layer] as layer.

Deleting project/team entries: team deletion is local only — a later team sync may bring the entry back while the remote still holds it.

Save bugs, conventions, and preferences here — they persist across sessions.
Session message history (what was said in this or past sessions) is NOT in memory — search session messages with read_history.

**`ledger`** — the in-flight ledger row this call serves: `"#N"` or `"N"`.

In engineering mode the parent agent must pass it for any write that lands in the project layer: either `layer: "project"`, or a single delete whose id starts with `project:` while `layer` is omitted (`personal` / `team` entries live in the user data directory, so they need no number).

**`project`** — the project this call belongs to (absolute path of the project root). Needed for exactly those project-layer writes: they also refuse without it. `personal` / `team` entries need neither. Pure declaration: it changes no execution directory.