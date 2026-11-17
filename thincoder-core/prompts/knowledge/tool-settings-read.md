aliases: 配置, 只读配置
Nothing here writes: no key is written or cleared.

Two actions: `list` (all keys and values, flattened) and `get <key>` — dot paths into config.json, at any nesting.

SENSITIVE keys are NEVER echoed in plaintext: list / get replies show `••••（masked）`.

A key counts as sensitive when a path segment looks like a credential (`apiKey`, `token`, `secret`, `password`, `authorization`, `cookie`, `credential` …), or when it sits under a `headers` / `env` segment.

Use it to answer "how is this session configured" with a reading instead of a guess — which provider and model, which limits, which switches are on.

Changing configuration belongs to the main agent. It is a side effect that persists to config.json and hot-applies to the live session, so it is not part of this tool face — calling it directly is refused before anything is written.