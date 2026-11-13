Read the project manifest (PROJECT-MANIFEST.json) — the project-level state file: version / phase / docRoot / codePaths / index.

{{knowledge:tool-manifest-read}}

target — the project root or directory you mean; **required** — omitting it is refused. Relative paths resolve against the session anchor. A workspace target (several projects below it) is reported with the full candidate list — name the project root you mean and pass it as target.