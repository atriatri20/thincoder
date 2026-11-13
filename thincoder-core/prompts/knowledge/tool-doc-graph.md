Edge kinds and what each one is produced from:
- `cites` — a document path token, with or without a section indicator (`§5`), including `依据 <path>「<quotation>」` lines.
- `cites-req` — a requirement number (`F16`, `AC-14`) written in a document.
- `mentions-case` — a test-case number written with its family name (`CLI 41-1`).
- `case-file` — an RTM row: the row's case number paired with the case file its last cell names.
- `cites-symbol` — an identifier in backticks (`editTool`).
- `imports` — a case file's `import … from "<relative path>"`, one edge per named import. This is the only case-to-code edge: a string inside an assertion is a runtime result, not a reference, so it is never turned into an edge.

Each edge carries `evidence` in the fixed form `<referring file> @ <line> 「<the first 80 characters of that line>」` — the snippet is always cut from the start of the line, so a reader lands on the right line and sees which one it is.

Each edge also carries a state:
- `ok` — the target was checked and is on disk (document targets only).
- `目标不在盘` — checked, not on disk. The edge is kept rather than dropped: "this file is gone but three places still cite it" is exactly what a reverse query is for. The `dst` is never replaced with a guess.
- `判不了存在性` — not checked, or not checkable: requirement numbers, case numbers, symbols, boards and sessions are never claimed to exist, and a document just a declared sibling repository is not present on this machine either.

Reading the output:
- Every line is text, one edge at a time, followed by its evidence — never a picture.
- Document targets fold by document: `doc:P` and `doc:P#5` share their neighbours, and each edge still prints its real target, so "cited by section" and "cited as a whole file" stay distinguishable.
- Ledger rows are projected in memory, never copied into the edge table: `ledger:#N --task_book--> doc:<path>`, plus `req_doc`, `board` and `executor`. A ledger row changes; a copy would go stale.
- An empty answer and a degraded one read differently: "this node has no edges" is an empty answer; `本仓无需求层` on a `scan` receipt is a degradation reading, and it still reports which edge kinds the repository can produce.
- A `chain` layer prints at most 200 edges (`LAYER_CAP`). A wider layer prints its first 200 in sort order, then one self-describing line: `本层并列 M 条，此处印前 200 条；收窄办法 = kind=<取值>（第 n 跳）` — `M` is the layer's true width, not the printed count. A layer whose excess edges are all ledger projections says so instead: `本层无可收窄的 kind（截断部分只有投影类边）`.
- Read what was cut off by re-running with the `kind` that line names (per kind when one kind is still too wide). Depth truncation is a separate line, `已截断（depth = …）`, never merged with the width line. `forward` and `reverse` are not capped: for a single-node question the count itself is the answer.

Business refusals — each names the parameter or the state it is about, and none of them answers with an empty graph:
- `target` missing, or not on disk: refused by name, and no edge is written.
- `node` missing (forward / reverse / chain), `depth` missing or not a positive integer (`chain`): refused by name.
- `kind` outside the closed set: refused and the offending value named — never treated as an empty set, never answered with "this node has no edges".
- the ledger database cannot be read: reported as a read failure.
- the repository has never been scanned (there is no `doc_edges` table yet): reported as "not scanned yet — run `scan` first", never as an empty graph.