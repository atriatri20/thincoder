Actions: `list` (all keys and values, flattened) | `get <key>` | `set <key> <value>` - dot paths into config.json, at any nesting.

`set` persists to disk (only the key you set is written, defaults are never baked in) and takes effect in the running session immediately - keys that apply at a turn boundary apply from the next turn - and the value survives restarts.

`list` / `get` are read-only (fine in planMode, no approval); `set` is a side effect and goes through the approval gate. The `/config` TUI command is the human equivalent.

Known keys are type-checked, so a value the app would silently drop is refused:

- scalar keys against their built-in default (`agent.maxTurns` a number, `traces.enabled` a boolean);
- `agent.mode` accepts exactly `tiny`, `normal` or `engineering` and sets the new-session default without changing the current session; `agent.engineering` is a derived read-only view and cannot be set directly or through an agent object;
- keys whose default is null against their real consumption shape (`defaultModel` in `"provider:model"` form, `agent.subagentModel` / `shell` a non-empty string, `memory.team` an object carrying a repo).

`null` clears a key: the entry is removed from config.json and the built-in default applies. String-typed keys refuse `null` - there is no "unset" state to fall back to. Unknown keys under a known section are stored as given.

SENSITIVE keys are NEVER echoed in plaintext: list / get / set replies show `••••（masked）`. Setting a sensitive key is allowed and stored, but it is never echoed back.

A key counts as sensitive when a path segment looks like a credential (`apiKey`, `token`, `secret`, `password`, `authorization`, `cookie`, `credential` …), or when it sits under a `headers` / `env` segment.