Manage long-term memory in ONE tool — the action parameter picks the operation:
- search — find knowledge saved in previous sessions; each result row carries [layer] + entry id (the id's prefix = the layer)
- put — save knowledge for future sessions; type = rule (coding standards) / knowledge (project facts) / decision (architecture decisions) / pattern (debugging/workflow patterns)
- list — inventory what memory holds; one row per entry: [layer] id [type] title (date); a truncated list notes the full count
{{knowledge:tool-memory}}

**`ledger`** — the in-flight ledger row this call serves: `"#N"` or `"N"`.

In engineering mode the parent agent must pass it for any write that lands in the project layer: either `layer: "project"`, or a single delete whose id starts with `project:` while `layer` is omitted (`personal` / `team` entries live in the user data directory, so they need no number).

**`project`** — the project this call belongs to (absolute path of the project root). Needed for exactly those project-layer writes: they also refuse without it. `personal` / `team` entries need neither. Pure declaration: it changes no execution directory.