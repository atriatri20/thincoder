The project's todo book — one entry per requirement point or per piece of engineering debt. `action` = add / update / close / query / count. `query` / `count` are read-only and open to every role; `add` / `update` / `close` write and are main-agent only.

- `add`: a new entry lands in `待讨论`.
  - `kind` = `requirement` (requirement pool) / `tech_todo` (engineering debt).
{{knowledge:tool-ledger}}
- `close --batch`: settles only the rows already at `待核销`. `待讨论` / `待设计` rows are skipped and named (move them to `在途` first to claim them), `在途` rows are skipped and named (they cannot be jumped), settled and withdrawn rows are not counted.
  - `status` may be omitted (default `已核销`) and can only be `已核销`.
- `query`: equality filters (`status` / `kind` / `board` / `trigger` / `task_book`); with none given, every row is eligible. Rows come back 10 per page either way — a filter narrows which rows are eligible, not how many a page carries. Each row carries:
  - `aged` — an unsettled state and older than 30 days.
  - `evidenceTooLong` — the evidence text is too long to read; a reading, never a write refusal.
  - `taskBookOnDisk` — the `task_book` file part resolves and that file is on disk.
  - `overdue` — the exit state as a word: `resume_due` / `dangling` / `unlabeled` / `aged`, first match wins.
  - The six states: `待讨论` / `待设计` / `在途` / `待核销` / `已核销` / `已废弃`.
  - **Every page ends with a tail line** giving the total, this page's rank range, and — when another page exists — the command for it: `ledger({action:"query"<the filters in force>, cursor:"<cursor>"})`. **Run that line whole**: it repeats this page's filters, and copying only the `cursor` drops them, so the next page comes from the unfiltered set with no error. Omit `cursor` for the first page; a malformed one is refused, never treated as page one.
  - `count` is a different book: it counts the four unsettled states only, while a page's total covers all six.
- `count`: `{ count, overdue, evidenceTooLong }`. `count` = rows in the four unsettled states; `overdue` = how many of those are in an overdue exit state; `evidenceTooLong` = how many carry over-long evidence. Same equality filters as `query`.