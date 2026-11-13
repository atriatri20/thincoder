Query the documentation anchor graph, read-only: which documents cite which, which requirement a batch record serves, which case file a test-case number lives in, which symbol a case file imports. This face only queries the graph; it does not build or rebuild it.

The questions this tool face carries: `forward` (the edges leaving a node) · `reverse` (the edges pointing at a node — the question plain text search cannot answer: "who cites this section?") · `chain` (a layered walk outward from a node, one layer per edge count).

Every call needs `target` — the project root (the directory carrying PROJECT-MANIFEST.json; a relative path resolves against the session anchor). There is no default for it and none for `node` / `depth`: a missing one is refused by name, never answered with an empty result.

{{knowledge:tool-doc-graph-read}}