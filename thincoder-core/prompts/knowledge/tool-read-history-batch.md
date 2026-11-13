It starts where the batch record was created (or where its first spawn bound it), and ends at the next batch's start — or now, if this is the latest batch.

Messages with no timestamp never fall inside a window, so a fact that must not be missed belongs in the task book's `knownFacts`, not here.

Filters combine with AND, and every one of them narrows inside that window:

- `role` — user / assistant / tool.
- `keyword` — case-insensitive substring of the message text.
- `tool` — tool messages by name, plus assistant messages that declared the call.
- `since` / `until` — epoch ms, inclusive. The batch window still applies on top: the later start and the earlier end win.
- `direction` — take the limit window from the oldest or newest end of the matched set.

`limit` is REQUIRED and carries no default — say how many messages you need (1–50). The window is the caller's decision; nothing supplies it for you.