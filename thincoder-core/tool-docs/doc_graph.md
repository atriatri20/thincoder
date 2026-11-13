Read and query the documentation anchor graph: which documents cite which, which requirement a batch record serves, which case file a test-case number lives in, which symbol a case file imports.

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

{{knowledge:tool-doc-graph}}

Use it to answer relationship questions that a full-text search cannot: what a section is cited by, what a requirement's chain down to code looks like, and which batch record or document is the last place a rule was mentioned.