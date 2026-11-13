- delete — SINGLE: {id, layer} removes the entry shown in put/search/list output — layer is optional: passed, it is validated against the id prefix (a mismatch is refused — guards against deleting the wrong entry); omitted, the id prefix routes the delete (any id from put/search/list is directly deletable). BATCH (no id): {layer, type and/or keyword} removes every matching entry in that layer — layer plus at least one of type / keyword is required; without confirm:true it returns the count + preview instead; a layer-wide wipe without filters is refused on every layer
- clear — {layer: "personal", confirm: true} wipes ALL personal memory entries. clear is personal-only: a missing layer or a project/team layer is refused (use delete batch filters on shared layers)
- maintain — index self-maintenance. Dry run by default: without confirm:true you get the plan and its readings and nothing is written; confirm:true executes. It takes no layer — it works on the whole store, not one layer.

Layer = the memory tier: personal (private) / project (shared via this repo's .thincoder/memory/) / team (CLI only, git-synced); the [layer] tag, the id prefix, and the layer parameter are the same concept — pass a result row's [layer] as layer.

Deleting project/team entries: team deletion is local only — a later team sync may bring the entry back while the remote still holds it.

Save bugs, conventions, and preferences here — they persist across sessions.
Session message history (what was said in this or past sessions) is NOT in memory — search session messages with read_history.