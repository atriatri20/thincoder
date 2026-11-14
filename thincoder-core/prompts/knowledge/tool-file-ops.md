**Route to file_ops instead of bash:**
- `mv a b` → file_ops action=move
- `cp a b` / `copy` → file_ops action=copy
- `ren a b` / `rename a b` → file_ops action=rename

Parameters:
- action (required): move | copy | rename
- source (required): source path, relative to cwd or absolute
- dest (required): destination path

Notes:
- Paths resolve relative to cwd — no directory restriction (same boundary as bash; the approval gate is the guard).
- `dest` is overwritten if it already exists. `copy` is recursive for directories.
- To create a directory, use `write` (creates parent dirs) or `bash mkdir`.
- Returns one line: `Moved` / `Copied` / `Renamed`, then the two paths exactly as you passed them separated by an arrow; or `Error: ...` (same path, missing path, unknown action).