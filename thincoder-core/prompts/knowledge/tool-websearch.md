Notes:
- Before searching the web, call the `memory` tool (action: search) first - you may already know the answer from a previous session. Reach for websearch only when memory comes up empty.
- It runs synchronously: the call returns when the search finishes.
- Follow up with `fetch` to read a result page in full.
- **Weak engine warning**: Bing's index is noisy for technical queries. If a first websearch returns irrelevant, townhall-grade results, do NOT retry the same query - configure a search MCP tool (e.g. `glm-websearch` via the MCP config) and use it for technical lookups; websearch is the fallback.