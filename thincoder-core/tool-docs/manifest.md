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

Key catalog — the 16 writable nodes (3 whole keys + docRoot's 6 sub-keys + index's 7 sub-keys): what each is; when to change it; wrong ⇒ consequence.
- `version` — schema version (a number); change on migration; wrong ⇒ validation refuses.
- `phase` — `initial-dev` / `production`; change when the stage is crossed; wrong ⇒ validation refuses.
- `codePaths` — path segment names (replaces `["src"]`); change when the layout moves; wrong ⇒ no segment is classified.
- `docRoot.requirements` · `docRoot.specs` · `docRoot.design` · `docRoot.modules` · `docRoot.batches` — each doc-layer root (a string | a multi-root array | `null` = absent); change when a layer moves; wrong ⇒ validation refuses, or checks / batch landing / review roots point elsewhere.
- `docRoot.standards` — the standards document, by FILE path (a string | an array | `null` = undeclared); the reviewer judges methodology compliance against it; wrong ⇒ the review reports the declaration unreadable and names the path (there is no default).
- `index.codeExtensions` · `index.docExtensions` — extra code / doc extensions (unioned, add-only); change when a type is missing from the index; wrong ⇒ that type stays out.
- `index.excludePaths` — project-root-relative prefixes for the index; change to keep a directory out; wrong ⇒ it is still indexed, or another is wrongly excluded.
- `index.docCheckExcludePaths` — project-root-relative prefixes for `doc_check`; change to keep a directory out of the check; wrong ⇒ those documents are still judged, or others are wrongly skipped. Not interchangeable with `index.excludePaths` (index only) nor with `index.docCheckExemptions`.
- `index.docCheckExts` — extra document-name extensions for `doc_check` (unioned onto the built-in list, add-only). A bare name and a path-shaped name sit under one ruler: only a suffix on this list makes a token a document name. Change it when a real type is not recognised; wrong ⇒ that suffix never counts, so a dangling path carrying it goes unreported. A single-character suffix or an archive inner layer (`gz` / `tar` / `zip`) never takes effect.
- `index.docCheckExemptions` — per-hit exemptions for `doc_check` (an array; one entry = `file` · `kind` · `text` · `why` · `review`, matched on the first three, never a line number); change it when a hit is a false positive and the document should stand; wrong ⇒ the entry does not apply and the hit still blocks (a missing field voids it; no directory / prefix / wildcard).
- `index.publicRepos` — public-repo paths (resolvable from this repo root) = this repo's out-edge table: a repo listed here may be **searched and cited**. Change it when wiring one in or dropping one. Not listed ⇒ a pointer into it is a missing document and the delivery gate fails; listed but absent here ⇒ that origin is lost and pointers into it read `unverified` (reported, never blocking).

- **`ledger`** — the in-flight ledger row this call serves (`"#N"`). Engineering mode: required for `write`; for `init` only when the target sits inside an existing project. `read` needs none.

**`project`** — the project this call belongs to; `target` wins and `project` never replaces it. It changes no directory.