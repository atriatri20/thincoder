aliases: 历史, 会话历史, 回看
Recall what was said or done earlier: design decisions, tool-call timing, past rulings.

Default (no `path`): this session's full record - never compacted, audit-complete.

Sub-agent face: eng-coder / eng-designer children get a bounded form of this tool instead — the parent session only, limited to this batch's window (its creation, or where its first spawn bound it, up to the next batch's start), `limit` required and capped at 50, and no `path`.

Everything else (explore / plan / coder / tester / consult) carries no history tool: the facts it needs ride the task book's `knownFacts`.

Filters combine with AND (`role` / `keyword` / `tool` / `since`-`until` / `limit` / `direction` - semantics per parameter; `keyword` with `path="all"` matches words and phrases, not only an exact substring).

Returns a JSON array in chronological order:

```text
[{ts, role, name?, tool_call_id?, content (≈500 chars, truncated marker), tool_calls ([{name, arguments}] - arguments capped at 300 chars)}]
```

Messages without `ts` return `ts: null`. `content` is truncated to ≈500 chars, and the marker states what is actually retrievable -
`user` / `assistant` bodies: the full text is in the session file; `tool` results: the session file keeps only those first 500 chars, so re-run the tool if you need more.

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