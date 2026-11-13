Wait until a condition becomes true — polls every interval_ms and returns as soon as it holds or timeout_ms passes.

**Use it only for states that cannot announce themselves**: a file appearing, a port opening, a background bash or browser task finishing. Nothing delivers those into the session, so a blocking wait is the only way to learn about them.

**Never use it to wait for a subagent, a review report or a timer.** Those arrive on their own when the session is idle, so waiting for one costs the whole budget and learns nothing. Before calling it, ask: will this state announce itself to me anyway? If yes, end the turn.

{{knowledge:tool-wait-for}}

Notes:
- Read-only and non-destructive — it only observes (agent pools, the filesystem, a local port probe).
- Blocking by design — call it ALONE in a turn, not batched with calls that depend on its result.