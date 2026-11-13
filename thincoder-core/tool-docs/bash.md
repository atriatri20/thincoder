Execute a shell command and return stdout+stderr. Use for running commands, builds, tests.

**Route to a dedicated tool instead of bash:**
- `cat file` / `head` / `tail` → `read`
- `ls` / `dir` → `ls`
- `find` / glob search → `glob`
- `grep` / `rg` → `grep`
- `echo >` / `sed` / `printf >` / `cat << EOF` → `write` / `edit` / `hashline_edit` / `apply_patch` (preferred: write tools handle encoding/EOL correctly)
- `git diff` / `git status` / `git log` → `git` tool

Parameters:
- command (required): Shell command to execute
- timeout: Timeout in milliseconds (default 120000 for synchronous runs; background runs have no default — an explicit timeout still applies; no upper bound)
- filter: Optional — a regex; only output lines matching it are returned (case-insensitive). Use instead of hand-writing a pipe into `findstr`/`grep`.
- async: Run in the background (default false) — returns an ack at once (bash#<id>, log path); the result arrives as a digest when the process exits. Depth-0 only.
{{inject:bash-terminal-face}}

{{knowledge:tool-bash}}

**`ledger`** — the in-flight ledger row this call serves: `"#N"` or `"N"`. In engineering mode the parent agent must pass it — a call that does not say which row it serves is refused, and read-only commands are judged the same way (no command-line classification).

**`project`** — the project this call belongs to: the absolute path of the project root (the directory carrying PROJECT-MANIFEST.json). Engineering mode: pass it together with `ledger`. Pure declaration: it does not change the execution directory.
