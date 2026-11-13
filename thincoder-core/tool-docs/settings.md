Adjust ThinCoder runtime configuration - persisted to config.json AND hot-applied to the live agent config.

Actions: `list` (all keys and values, flattened) | `get <key>` | `set <key> <value>` - dot paths into config.json, at any nesting.

`set` persists to disk (only the key you set is written, defaults are never baked in) and takes effect in the running session immediately - keys that apply at a turn boundary apply from the next turn - and the value survives restarts.

{{knowledge:tool-settings}}

`list` / `get` are read-only (fine in planMode, no approval); `set` is a side effect and goes through the approval gate. The `/config` TUI command is the human equivalent.
