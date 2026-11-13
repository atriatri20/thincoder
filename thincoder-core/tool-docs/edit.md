Edit a file as a patch — targeted by content or by line number.

Two targeting forms (mutually exclusive — use one):

① line-based: `line: N` replaces that single line, `startLine: N, endLine: M` replaces the inclusive 1-based line range — no old_string needed when you know the line number; give new_string to replace, or OMIT new_string to delete the line/range;

② content-based: old_string is the current content of the region to change (must match exactly once); new_string is the desired result of that region.

old_string matching is tolerant: exact match first, then a unique whitespace-only variant, then a fuzzy match on a unique window — indentation width and quote style are normalized on both sides, so a straight-quoted copy still matches a curly-quoted original.

Lines shared by old/new are kept; lines only in new_string take their position relative to the shared lines (LCS order); lines only in old_string are deleted — a replacement never leaves old lines behind (zero overlap → old lines are replaced by new_string, not kept).

A unique single-line old_string paired with a single-line new_string replaces that exact line in place (line count unchanged). To add a new line without removing anything use insert_after.

replace_all applies to content-based edits only: literal replacement of every occurrence — the diff rules do not apply.

{{knowledge:tool-edit}}

**`ledger`** — the in-flight ledger row this call serves: `"#N"` or `"N"`. In engineering mode the parent agent must pass it — a call that does not say which row it serves is refused.

**`project`** — the project this call serves: absolute path of a project root (the directory carrying `PROJECT-MANIFEST.json`). Read only when the target sits outside every project and the session anchor is that workspace root; else the target's root decides and `project` is not read.
