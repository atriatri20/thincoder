aliases: 任务清单, 待办列表
Each call replaces the entire list.

Statuses: pending | in_progress | done - synonyms (completed/finished/complete, todo/open/waiting, active/running/working, …) are accepted and normalized with a warning.

- Keep exactly one item in_progress at a time.
- Mark items done as you complete them; never mark done while tests fail or the work is partial.
- title is required and must be non-empty: an item whose title is empty is dropped, and the receipt names it.

Engineering mode: `task` is unavailable - the batch record and the ledger are the tracking authority there. For cross-session / project-level tracking in any mode, use `/ledger`.

Returns a one-line receipt - `Task list updated: N/M done` - plus a warning naming every status or title that was normalized or dropped.