More reliable than `edit` when whitespace or encoding varies, because the addresses are line bytes as they sit on disk.

Parameters:
- `path` (required): file path.
- `old_hashes` (required): array of the line hashes to replace (12-char hex). Read the file with `hashes=true` first to get them; a single line takes `[hash]`, a contiguous block takes `[hash1, hash2, ...]` in order.
- `new_content` (required): the replacement text (multi-line ok, `\n` separated).

Notes:
- Hashes are position-independent: they identify lines by content, not by line number, so a line-number drift after an edit does not touch them.
- When the hash sequence is not found, the error carries the file's current hashes so you can retry with corrected values.
- Prefer this over `edit` when (1) the file may have mixed whitespace or encoding, or (2) you want to edit a block of lines in one call.
- The replacement replaces exactly the lines the hashes identify - whatever is not in `new_content` is deleted. For a new line after a known line use `insert_after`; for a single simple string swap use `edit`.
- Re-read the file after it changed: hashes taken before a write are stale.