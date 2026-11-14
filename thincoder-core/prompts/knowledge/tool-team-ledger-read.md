aliases: 团队台账, 只读, 团队待办
It is a separate book from the local `ledger` — two independent accounts, no sync between them, and this one keeps no offline copy.

The actions this tool face carries: `query` (filtered entries) and `count` (how many). Both are read-only.

- The repo tag is derived for you from the current project root's git origin; with no git repo, or no `remote.origin.url`, the call fails explicitly and sends no request. You cannot pick or change the repo.
- `query`: `scope` = `"repo"` (default — the current repo) or `"team"` (every repo in the team); filters `status` (one of the six states `待讨论` / `待设计` / `在途` / `待核销` / `已核销` / `已废弃`) and `owner` (exact username). Each row carries `aged` when it sits in an unsettled state and is older than 30 days.
- `count`: the same filters as `query`, and returns the total.
- Login gate: not logged in ⇒ the call fails with a message saying so, and sends no request; 401 (token expired) ⇒ login expired, log in again; server unreachable ⇒ reported as such, with no offline fallback: a retry never serves an old value.

Use it to see what the rest of the team already has queued on this repo before proposing the same work again. Adding, moving or settling an entry belongs to the main agent — those actions are not part of this tool face, and calling one directly is refused before any request goes out.