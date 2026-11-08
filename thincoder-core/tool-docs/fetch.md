Fetch a URL and return its content. Use it after websearch to read full pages. Internal, private and metadata addresses are refused before any request goes out.

Parameters:
- url (required): http/https URL; any other scheme is refused.
- proxy: http://host:port explicit proxy (optional) — use ONLY when passed; no proxy = direct. A proxy set in config.json is not applied here, and neither is a proxy environment variable: pick one per target (github/foreign sites usually need one, domestic sites do not).

Notes:
- With a DeepSeek provider configured, the page is fetched through DeepSeek's servers and comes back as Markdown (`[deepseek] title + content`); otherwise it is fetched locally and HTML is reduced to readable text (scripts, styles, navigation stripped).
- Follows one redirect, http/https only; a redirect into an internal, private or metadata address is refused.
- Timeout 15 seconds. Non-HTML responses come back as-is, truncated at 200000 chars.
- `fetch.backend: "local"` disables the DeepSeek backend.