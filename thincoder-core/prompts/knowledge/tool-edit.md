aliases: 编辑, 改档, 修改文件
Two targeting forms (mutually exclusive — use one):

① line-based: `line: N` replaces that single line, `startLine: N, endLine: M` replaces the inclusive 1-based line range — no old_string needed when you know the line number; give new_string to replace, or OMIT new_string to delete the line/range;

② content-based: old_string is the current content of the region to change (must match exactly once); new_string is the desired result of that region.

old_string matching is tolerant: exact match first, then a unique whitespace-only variant, then a fuzzy match on a unique window — indentation width and quote style are normalized on both sides, so a straight-quoted copy still matches a curly-quoted original.

Lines shared by old/new are kept; lines only in new_string take their position relative to the shared lines (LCS order); lines only in old_string are deleted — a replacement never leaves old lines behind (zero overlap → old lines are replaced by new_string, not kept).

A unique single-line old_string paired with a single-line new_string replaces that exact line in place (line count unchanged). To add a new line without removing anything use insert_after.

replace_all applies to content-based edits only: literal replacement of every occurrence — the diff rules do not apply.

**Routing — pick the right edit tool:**
- Delete a line/range by number → omit new_string: edit with `line: N` / `startLine: N, endLine: M`
- Line numbers fresh (just read) → `line`/`startLine`/`endLine` targeting — precise, no content copy needed
- Line numbers may have drifted / content has whitespace-encoding noise → `hashline_edit` (content-hash addressing — position-independent)
- Add a line/entry after a known line → insert_after
- Same change across multiple files → apply_patch
- Rewrite an entire file → write
- Rename a symbol project-wide → `lsp` or `grep` first to map every caller

**Batch multiple changes into ONE call via the `edits` array** (preferred over N single edit calls) — same file or across files. Each entry gets its own block in the receipt, in call order: one that fails is named, and the rest still apply.

A file whose final content the write gate rejects writes nothing and all its entries fail; a file already written is never rolled back. One permission ask and one turn instead of N. Per-entry shape and targeting are in the schema.

Line-number entries in one `edits` array must not overlap (overlap ⇒ **those two entries fail**, each naming the other's range; the rest of the batch still applies); each is anchored on the numbers you read, and the receipt stays in call order.

Notes:
- Prefer this over write for targeted edits — it's safer and keeps changes targeted
- If old_string matches zero times (even fuzzy): error. If it matches multiple times without replace_all: error — add more surrounding context to make it unique
- Returns `Edited <path>: replaced N occurrence(s)` (delete-mode: `Deleted line N of <path>` / `Deleted lines N-M of <path>`) + git diff + syntax-check note + context block (L..-L..).
- Batch form returns one block per entry in call order — `edits[i] — failed: <reason>` for a failure (the reason is verbatim, so it may run over several lines) — and a final count line: `edit batch: 2/3 entries applied, 1 failed — 2 file(s) written: a.md, b.md`.
- Never fabricate the old_string — copy it verbatim from the actual file using read first
- **Line-number anchoring**: a `line` / `startLine`+`endLine` target is judged against the last write to that file, so a target that drifted is refused — the refusal names the path, the drift (`L<startLine>`, `±shift`) and two ways on (re-read, or address the region without line numbers).
- use the most recent read of the file as the source of old_string / line numbers / hashes — re-read after the file changed