aliases: 语法检查, 静态检查
Parameters:
- path: File to check (default: most recently modified file)
- full: Run the full language-aware cascade instead of just node --check (default false)

Without `full` it runs `node --check` only, which covers the JS/TS family; any other file gets a hint to pass `full` instead.

With `full` the cascade is picked by extension:

- TS: tsc --noEmit, run only where a TypeScript project config exists.
- Python: ruff. Rust: cargo check, run only where a Cargo manifest is present.
- Go: go vet. JS/JSX: still `node --check`.

Use the fast default after every write or edit, and `full` before declaring a task complete.

Returns `Syntax OK: <path>` / `Syntax error in <path>: <message>`, or the language checker's own line (`✓ <checker>: no issues` / `✗ <checker>: <failure text>`), or a `lint:` line saying that checker is not installed or that no linter exists for that extension.