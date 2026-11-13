Apply a unified diff to one or more files, atomically: if any hunk fails to apply, nothing is written.

**Use it for whole-file and multi-file changes:** creating MULTIPLE new files at once (`--- /dev/null` header per file), whole-file replacement, and cross-file refactors — one unified-diff call covers the whole change. A batched call is one permission ask and one turn instead of N separate calls.

Parameters:
- patch (required): Unified diff text. One `--- a/path` / `+++ b/path` header pair per file, then `@@ -old,count +new,count @@` hunks. Use `--- /dev/null` to create a new file. The `+++ b/path` pair may be omitted for existing files — a lone `--- a/path` (or `--- b/path`) header followed directly by hunks applies to that path (new files still need `--- /dev/null` + `+++ b/path`).

{{knowledge:tool-apply-patch}}

**`ledger`** — the in-flight ledger row this call serves: `"#N"` or `"N"`. In engineering mode the parent agent must pass it — a call that does not say which row it serves is refused.

**`project`** — the project this call serves: absolute path of a project root (the directory carrying `PROJECT-MANIFEST.json`). Read only when the target sits outside every project and the session anchor is that workspace root; else the target's root decides and `project` is not read.
