Query message history - THIS session by default, any session on disk with `path`. Recall what was said or done earlier: design decisions, tool-call timing, past rulings.

Default (no `path`): this session's full record - never compacted, audit-complete.

Sub-agent face: eng-coder / eng-designer children get a bounded form of this tool instead — the parent session only, limited to this batch's window (its creation, or where its first spawn bound it, up to the next batch's start), `limit` required and capped at 50, and no `path`.

Everything else (explore / plan / coder / tester / consult) carries no history tool: the facts it needs ride the task book's `knownFacts`.

Filters combine with AND (`role` / `keyword` / `tool` / `since`-`until` / `limit` / `direction` - semantics per parameter; `keyword` with `path="all"` matches words and phrases, not only an exact substring).

Returns a JSON array in chronological order:

```text
[{ts, role, name?, tool_call_id?, content (≈500 chars, truncated marker), tool_calls ([{name, arguments}] - arguments capped at 300 chars)}]
```

Messages without `ts` return `ts: null`. `content` is truncated - the full text is in the session file.

{{knowledge:tool-read-history}}