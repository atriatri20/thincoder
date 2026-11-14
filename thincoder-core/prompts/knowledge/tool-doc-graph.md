aliases: 文档图, 锚点图, 引用关系
The graph is stored as edges in the same SQLite file as the ledger (`doc_edges` beside `items`), so there is no second store to keep in step.

Edges are collected by the same per-line pass that `doc_check` already runs over a document — one parser, two consumers — so an edge never disagrees with a pointer verdict.

Four questions, one action each:
- `scan` — collect the edges. It reads the repository's document layers (the `docRoot` keys the write gate uses: requirements, specs, design, modules, batches, standards — `standards` is a directory layer like the rest, its `.md` files, subdirectories included, being the standards), the RTM face (`test/RTM.md` and `test/rtm/*.md`), and the case files those RTM rows name (for `imports` edges). One explicit pass, no watcher, no background index.
- `forward` — the edges leaving a node: `kind → dst`, each followed by its `evidence`.
- `reverse` — the edges pointing at a node: this is the question plain text search cannot answer ("who cites this section?").
- `chain` — a layered walk outward from a node, one layer per edge count.

Parameters — there is no default for any of them, so a missing one is refused by name rather than answered with an empty result:
- `target` (required, every action): the project root.
- `node` (required for forward / reverse / chain): the identity form — `req:F16` · `doc:<path>` · `doc:<path>#<section>` · `case:CLI 41-1` · `symbol:editTool` · `ledger:#2236` · `board:core` · `session:<id>`.
- `depth` (required for chain): how many edge steps to walk. Hops are counted in edges, not nodes.
- `kind` (forward / reverse / chain, optional): a comma-separated subset of edge kinds — `cites`, `cites-req`, `mentions-case`, `case-file`, `cites-symbol`, `imports`. The edges are filtered before sorting and layering, so a narrowed run is a complete run rather than a few lines pulled out of a big receipt — and it is how the edges a `chain` layer cut off are read back. Omit it to read every kind, ledger projections included; the receipt's first line always prints the set in force. A value outside that closed set is refused by name, never treated as an empty set.
- `scope` (`scan` only, optional): re-scan just these documents; every other document's edges stay untouched. The receipt's first field always says whether it scanned `全仓` or `范围 K 档`, so an absent scope is never a silent difference.

Use it to answer relationship questions that a full-text search cannot: what a section is cited by, what a requirement's chain down to code looks like, and which batch record or document is the last place a rule was mentioned.

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