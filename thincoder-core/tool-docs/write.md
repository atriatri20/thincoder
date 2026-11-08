Write content to a file. Creates parent directories; overwrites the existing file.

Parameters:
- path (required): File path, relative to cwd or absolute
- content (required): Full content to write

Notes:
- write replaces the WHOLE file: read it first and confirm you intend to rewrite it entirely. For a targeted change use edit / insert_after instead.
- The file is atomic: it either writes completely or fails.
- Returns `Wrote N chars to <path>` + git diff + syntax-check note.

**`ledger`** — the in-flight ledger row this call serves: `"#N"` or `"N"`. In engineering mode the parent agent must pass it — a call that does not say which row it serves is refused.

**`project`** — the project this call serves: its root, the directory carrying `PROJECT-MANIFEST.json`. Read only when the target sits outside every project and the session anchor is that workspace root; else the target's root decides and `project` is not read.