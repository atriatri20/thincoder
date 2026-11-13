The team ledger: one book on the server, shared by the whole team, usable once you are logged in. It is a separate book from the local `ledger` - two independent accounts, no sync between them, and this one keeps no offline copy. `action` = query / count / add / update / close.

- `query` / `count` are read-only and open to every role; `add` / `update` / `close` write and reach the main agent only (a subagent gets the read-only two).
- The repo tag is derived for you from the current project root's git origin; with no git repo, or no `remote.origin.url`, the call fails explicitly and sends no request. You cannot pick or change the repo.
- `query`: `scope` = `"repo"` (default - the current repo) / `"team"` (every repo in the team); filters `status` (one of the six states `待讨论` / `待设计` / `在途` / `待核销` / `已核销` / `已废弃`) and `owner` (exact username). Each row carries `aged` when it sits in an unsettled state and is older than 30 days.
- `count`: the same filters as `query`, and returns the total.
{{knowledge:tool-team-ledger}}