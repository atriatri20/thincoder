Query the project's ledger — the todo book of requirement points and engineering debt. Read-only: `query` (filtered rows) and `count` (how many). Nothing here adds, moves or settles a row.

A row is one requirement point or one piece of engineering debt. The six states are `待讨论` / `待设计` / `在途` / `待核销` / `已核销` / `已废弃`; `status` filters to one of them.

{{knowledge:tool-ledger-read}}

Use it to find what work is already queued before proposing more: the open rows on your board, what is in flight for this batch record, and how old the unsettled ones are.

Adding, moving or settling a row belongs to the main agent. Those actions are not part of this tool face, and calling one directly is refused before anything is written.