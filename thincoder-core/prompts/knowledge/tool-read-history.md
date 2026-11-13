Cross-session (`path`, optional): a session file path deep-queries THAT session with the same filters (a relative path resolves against the project cwd). A session too large to deep-query is refused as `session too large`.

`cwd:<dir>` lists that directory's session slots (slot + file path + title + count + updatedAt; copy one into `path` to deep-query it).

`all` searches every INDEXED session (cross-project; the rows carry `session.file`). A session never indexed yet is invisible - query it with `path=<file>`, or index first with the CLI `thincoder session index --rebuild`.

Which tool for which question:
- what was said or ruled in THIS session → `read_history` (default).
- an older conversation in another session or project → `read_history` with `path` / `cwd`.
- which files changed in this run → `recent_changes`.
- stored knowledge and conventions (cross-session) → `memory search`.
- project design documents → `doc_search`.
- the code as implemented → `code_search`.
- a git snapshot → `checkpoint cat` / `versions`.

`read_history` only reads session messages; file-level changes belong to `recent_changes`, knowledge and conventions to `memory` - none substitutes for another.