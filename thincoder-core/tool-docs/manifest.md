Read, initialize, or point-edit the project manifest (PROJECT-MANIFEST.json) — the project-level state file. Subagents carry a read-only variant (action `read`); init / write stay main-agent only.

Actions:
- read — report the state with a stable anchor `state=ok|missing|invalid|workspace|no-project`. The ok state prints the manifest JSON plus missingKeys / errors rows (only when non-empty). Never throws — a missing manifest is reported, not refused.
- init — create the default manifest where the project root resolves. Refused when one already exists — init never overwrites.
- write <key> <value> — point-edit one node: read, set, write back through the writer gate. The result must validate (a fault is refused, disk byte-for-byte unchanged); a missing manifest is refused — run init first.

target — the project root or directory you mean; **required** — omitting it is refused. Relative paths resolve against the session anchor.

A workspace target (several projects below it) is reported by `read` and refused by `init` / `write` — name the project root you mean.

key — dot path into the manifest: version / phase / codePaths, or a sub-key of docRoot / index. Whole-object writes of those two families are refused, as is any key outside the set (spelling protection).

value — JSON first (null / true / 5 / ["a","b"]), else a literal string (docs/design). "null" is the explicit "no such face" for docRoot.<key>: a legal value, not a deletion.

Refusals throw `manifest <action>: refused — …`; a missing parameter throws `manifest <action>: <param> is required — …`. Both leave the disk unchanged; the written file reaches the project-state line next turn.

read is read-only (no approval); init / write are side effects (approval gate).

{{knowledge:tool-manifest}}