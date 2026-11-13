The other filters:

- `kind` — requirement vs tech_todo (the field itself holds those two words).
- `board` — the owning board (a requirement-document name).
- `trigger` — the tech-todo trigger.
- `task_book` — the task-book pointer, i.e. the row → batch lookup.

Rows come back 10 per page, with or without filters — a filter narrows what is eligible, not how many rows a page carries.

- Every page ends with a tail line giving the total, this page's rank range, and — when another page exists — the command for it: `ledger({action:"query"<the filters in force>, cursor:"<cursor>"})`. Run that line whole: it repeats this page's filters, and copying only the `cursor` drops them. Omit `cursor` for the first page; a malformed one is refused, never treated as page one.
- `count` is a different book: it counts the four unsettled states only, while a page's total covers all six.

Every returned row carries a reading about itself:

- `aged` — unsettled and older than 30 days.
- `evidenceTooLong` — the evidence text is too long to read.
- `taskBookOnDisk` — the row's task-book file part resolves and is on disk.
- `overdue` — the exit state as one word (resume_due / dangling / unlabeled / aged); first match wins.

`cwd` decides which project's ledger is read. Omit it to use the session anchor.

The project root is derived along the ancestor chain — the nearest directory carrying PROJECT-MANIFEST.json. A ledger file sitting on disk does not make a project.

A relative path resolves against the session anchor, and the project root is taken inside the anchor; outside it, no project is attached.

Rows are stored in the user data directory keyed by project root, so a query never reads another project's book by accident and the repository stays free of ledger files.