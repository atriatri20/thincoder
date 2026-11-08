Delete a file, or an empty directory. Use it when the agent created a temporary or junk file or empty directory that should be cleaned up, or when the user explicitly asks to delete something.

Refuses to delete git-tracked files as a safety measure - a tracked file should be edited, or removed through `bash` with the user's explicit confirmation.

**Route to delete instead of bash:** `del file` / `rm file` → delete (single files); an empty directory → delete (empty directories only). A non-empty directory has no delete path - stop and report to the user instead of hand-rolling a recursive shell delete.

Parameters:
- `path` (required): file or empty-directory path, relative to cwd or absolute.
- `force`: allow deleting git-tracked files (default false).

Notes:
- Untracked or non-git files are deleted immediately.
- Tracked files require `force: true`, and the user must confirm separately.
- Directories: empty ones only - a non-empty directory is refused, and nothing recursive is ever removed. Delete nested empty trees bottom-up.
- Symbolic links are removed as links: the link itself is deleted, never followed, and its target is untouched.
- Returns `Deleted <path>`, or `Error: ...` on failure / on a tracked-file or non-empty-directory refusal.

**`ledger`** - the in-flight ledger row this call serves: `"#N"` or `"N"`. In engineering mode the parent agent must pass it - a call that does not say which row it serves is refused.

**`project`** - the project this call serves: absolute path of a project root (the directory carrying `PROJECT-MANIFEST.json`). Read only when the target sits outside every project and the session anchor is that workspace root; else the target's root decides and `project` is not read.