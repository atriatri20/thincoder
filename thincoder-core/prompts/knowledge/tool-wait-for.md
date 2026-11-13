Parameters:
- condition (required): a semantic condition expression:
  - `advisor settled` — an in-flight advisor review session has finished — discouraged: the report is delivered automatically; end the turn instead
  - `subagent id:N done` — async subagent N (the id your async spawn ack returned) has settled — discouraged, same reason
  - `consult done` — every consult_start session has drained — the verdict text is delivered automatically; wait only when a synchronous caller cannot proceed without it
  - `bash id:N done` — background bash task N (the id from the bash async ack, `bash#N`) has finished — settled, or already left the pool (nothing left to wait on)
  - `browser id:N done` — a background browser task N (the id from the ack, `browser#N`) has settled — finished, or already left the pool (nothing left to wait on)
  - `file exists:path` — the file at path exists (path relative to cwd)
  - `port open:N` — something is listening on 127.0.0.1 port N
  - The agent-internal conditions (advisor / subagent / consult / bash) apply to ASYNC sessions only — a synchronous call already completed before it returned and has nothing to wait for.
  - An unknown condition is an explicit error (`wait_for: unsupported condition "..."` — the supported forms are listed above), never a silent wait.
- interval_ms: poll interval (default 1000, floor 100 — polling never busy-spins)
- timeout_ms: overall ceiling (default 30000; config.json `agent.waitForTimeoutMs` overrides the default; hard cap 600000 like the execute tool)

Returns:
- `wait_for: condition satisfied after Nms (N checks): "<condition>"` — condition held
- `wait_for: timed out after Nms waiting for "<condition>" ...` — ceiling passed with the condition still false (never burns beyond the ceiling)
- interrupts (Ctrl+C / cancel) exit immediately; malformed conditions and unsupported syntax error out explicitly