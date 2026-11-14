DeepSeek results also carry a `date · authority (0-4) · rerank (0-3)` line and a long summary.

Search goes to DeepSeek when a DeepSeek provider is configured, otherwise to Tavily when a key is set, otherwise to Bing - `websearch.backend: "local"` takes DeepSeek out of the chain.

Use it for information that is not in the local codebase: current docs, release status, error messages, API references.

Parameters:
- `query` (required): the search query. DeepSeek operators pass through as given - `site:`, `lang:`, `after:` / `before:`, and quoted phrases.
- `limit`: max results (default 8, max 20).
- `engine`: a specific engine - `"bing"`. Omit it to search all engines and merge their results.
- `page`: page number for pagination (1-based, default 1). Only used when `engine` is given.
- `proxy`: `http://host:port`, an explicit proxy - pass it only when you mean to use one; no `proxy` argument means a direct connection. A proxy configured in config.json is NOT applied here: Bing and foreign sites usually need one passed explicitly, domestic targets do not.

Notes:
- Before searching the web, call the `memory` tool (action: search) first - you may already know the answer from a previous session. Reach for websearch only when memory comes up empty.
- It runs synchronously: the call returns when the search finishes.
- Follow up with `fetch` to read a result page in full.
- **Weak engine warning**: Bing's index is noisy for technical queries. If a first websearch returns irrelevant, townhall-grade results, do NOT retry the same query - configure a search MCP tool (e.g. `glm-websearch` via the MCP config) and use it for technical lookups; websearch is the fallback.