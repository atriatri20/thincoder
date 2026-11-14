# Prompt and knowledge resources

Prompt-assembly topics live in `prompts/knowledge`. Full normal and engineering prompts inline those topics at their master anchors; tiny prompts omit the anchored bodies and allow on-demand queries.

Pure-query topics live in this directory. They are available through `knowledge` in every work mode and are never inlined into a system prompt. Pure-query marker: PURE_QUERY_ONLY_MARKER. Topic identifiers share one global namespace across both directories, so a duplicate identifier is an installation error rather than an order-dependent choice.
