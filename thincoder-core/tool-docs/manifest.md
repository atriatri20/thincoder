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

Key catalog — the 15 writable nodes (3 whole keys + docRoot's 6 sub-keys + index's 6 sub-keys): what each is; when to change it; wrong ⇒ consequence.
- `version` — schema version (a number); change on migration; wrong ⇒ validation refuses.
- `phase` — `initial-dev` / `production`; change when the stage is crossed; wrong ⇒ validation refuses.
- `codePaths` — path segment names (segment match at any depth; **no default segment** — the key is empty until the project declares one, so a project that never declares it has no code segment and a `.md` under `src/` reads as a document); change when the layout moves; wrong ⇒ no segment is classified.
- `docRoot.requirements` · `docRoot.specs` · `docRoot.design` · `docRoot.modules` · `docRoot.batches` — each doc-layer root (a string | a multi-root array | `null` = absent); change when a layer moves; wrong ⇒ validation refuses, or checks / batch landing / review roots point elsewhere.
- `docRoot.standards` — the standards **layer**: one directory of `.md` files (a string | a multi-directory array | `null` = no such face; default `null` — there is no default directory, so no default name to guess); members = every `.md` file under the directory, subdirectories included, in layer-root-relative path order (case-insensitive; symbolic links are not followed); change it when a standards document is added or the layer moves; wrong ⇒ the reviewer reports the declaration unreadable and names the path, splitting the cause (no such directory / not a directory / no .md file) — never a silent skip. A file path is not accepted (one key, one meaning).
- `index.codeExtensions` · `index.docExtensions` — extra code / doc extensions (unioned, add-only); change when a type is missing from the index; wrong ⇒ that type stays out.
- `index.excludePaths` — project-root-relative prefixes for the index; change to keep a directory out; wrong ⇒ it is still indexed, or another is wrongly excluded.
- `index.docCheckExcludePaths` — project-root-relative prefixes the document check leaves alone: a document under one of them is not judged and not counted, and a manifest that cannot be read excludes nothing, so every document is judged. Not interchangeable with `index.excludePaths`, which the index reads.
- `index.publicRepos` — public-repo paths (resolvable from this repo root) = this repo's out-edge table: a repo listed here may be **searched and cited**. Change it when wiring one in or dropping one. Not listed ⇒ that repo is not part of this project's searchable corpus and is not a source this project can cite. Not interchangeable with `index.writableRepos` (reading ≠ writing).
- `index.writableRepos` — external **directories** this repo may write into (directories, not repos — no `.git` / manifest is read; resolvable from this repo root) = this repo's write-rights table, one-way: the target gets no say, git permissions are the real defence. A target inside the table ⇒ the write gate takes the ledger row number from **this** project's ledger and books the change here; a target outside it ⇒ the gate refuses and names this table. Change it only when you mean to spend **this repo's** account on an external directory — leaving it empty means the target can only be written under its own account. Not interchangeable with `index.publicRepos` (reading ≠ writing). Wrong ⇒ that directory's writes are still refused (the refusal names `writableRepos` and the target), or a directory you did not mean to open sits in the table.