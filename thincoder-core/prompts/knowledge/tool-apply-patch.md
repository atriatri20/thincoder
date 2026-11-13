Notes:
- Hunk header "@@" without coordinates is accepted: a coordinate-less hunk is located by its context and removed (-) lines and applies only on a unique match. A pure-addition hunk needs at least 2 context lines; a hunk that removes something is anchored by that sequence, so one context line is enough.
- Returns the applied-file summary (`Applied patch to N file(s)` plus per-file change lines and syntax-check notes for changed .mjs files)
- A failure in the write phase reports every file block in patch order (`modified` / `created` / `not committed`),
  the block that failed as `<path> — failed: <reason>`, and a final line
  `apply_patch: <k>/<M> file(s) applied, <M−k> failed` plus the committed paths.
  Files already committed stay on disk and are never rolled back.
- Use this for multi-file changes (e.g. rename an interface + update all callers) — one call, every hunk is checked before anything is written
- Hunks are located by their context/removed lines, not line numbers — but the context must match the file EXACTLY. Read the files first and generate the patch from actual content
- If a hunk's context matches multiple locations it is rejected — add more surrounding context lines
- Deleting files is not supported — use the delete tool
- For single-file edits, edit is simpler; for full rewrites, write is simpler