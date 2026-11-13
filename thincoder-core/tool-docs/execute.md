Execute JavaScript — either inline `code` or a `scriptFile`. Runs in a real child `node` process — a pure node ESM environment: top-level `await` and dynamic `import()` are available, no globals are injected.

File reads/writes/searches belong to the dedicated read/ls/glob/grep/write/edit tools — not to execute. If a script genuinely needs fs/path, `import` the `node:` module inside the code (one explicit import line).

{{knowledge:tool-execute}}

**`ledger`** — the in-flight ledger row this call serves: `"#N"` or `"N"`. In engineering mode the parent agent must pass it — a call that does not say which row it serves is refused, and read-only scripts are judged the same way (no command-line classification).

**`project`** — the project this call belongs to (absolute path of the project root). Read only when `workdir` is absent — `workdir` wins when both are given. Pure declaration: it does not change the execution directory (`workdir` does).
