Read the project manifest (PROJECT-MANIFEST.json) — the project-level state file: version / phase / docRoot / codePaths / index.

`docRoot` holds one entry per document layer, each a directory (a string | a multi-root array | `null` = absent): requirements / specs / design / modules / batches.

`standards` is the standards **layer** — a directory whose `.md` files — subdirectories included, in layer-root-relative path order — are the standards; a file path is not accepted (one key, one meaning).

Read-only: the only action is `read`. Creating or editing a manifest belongs to the main agent — this subagent variant has no init / write action.

read — report the manifest state with a stable anchor `state=ok|missing|invalid|workspace|no-project`. The ok state prints the manifest JSON plus missingKeys / errors rows (only when non-empty). Never throws — a missing manifest is reported, not refused.

Use it to locate documentation instead of assuming a path: read `docRoot.<key>` and resolve your target under that root. A missing face (`null`) means that document layer does not exist in this project — report it instead of inventing a path.

target — the project root or directory you mean; **required** — omitting it is refused. Relative paths resolve against the session anchor. A workspace target (several projects below it) is reported with the full candidate list — name the project root you mean and pass it as target.