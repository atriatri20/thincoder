aliases: 文档图, 锚点图, 只读
This face only queries the graph; it does not build or rebuild it.

The questions this tool face carries: `forward` (the edges leaving a node) · `reverse` (the edges pointing at a node — the question plain text search cannot answer: "who cites this section?") · `chain` (a layered walk outward from a node, one layer per edge count).

Every call needs `target` — the project root (the directory carrying PROJECT-MANIFEST.json; a relative path resolves against the session anchor). There is no default for it and none for `node` / `depth`: a missing one is refused by name, never answered with an empty result.

Arguments:

- `node` (forward / reverse / chain) — the identity form: `req:F16` · `doc:<path>` · `doc:<path>#<section>` · `case:CLI 41-1` · `symbol:editTool` · `ledger:#2236`.
- `depth` (chain only) — edge steps to walk; hops are counted in edges, not nodes.
- `kind` (optional on the three queries) — a comma-separated subset of `cites`, `cites-req`, `mentions-case`, `case-file`, `cites-symbol`, `imports`. Omit it to read every kind (ledger projections included); the receipt's first line always prints the set in force.

Reading the output: every line is text, one edge at a time, followed by its evidence (`<referring file> @ <line> 「<the first 80 characters of that line>」`).

Document targets fold by document — `doc:P` and `doc:P#5` share their neighbours, and each edge still prints its real target.

An empty answer and a degraded one read differently. "This node has no edges" is an empty answer. A graph that was never built reads as a read-only empty state that names itself, and that state is not a business empty graph — retry after the scan entry updates the graph.

Use it to answer relationship questions a full-text search cannot: what a section is cited by, what a requirement's chain down to code looks like, and which document or batch record last mentioned a rule.