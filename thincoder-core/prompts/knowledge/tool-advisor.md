The advisor is an independent read-only sub-agent (explores the codebase, reads files, traces callers via grep/lsp).

- Code review converges: round 1 full review → round 2 verifies the agent's fix claims → round 3+ re-checks only the fix claims.
- Design review is a single pass against methodology and requirements.
- Criteria come from `.thincoder/advisor.md` (if present) or sensible defaults.
- After the review you MUST produce a response table (format = discipline rules); on all-clear, call `verify`.

`object={type,target,status,reason,exclude}` — optional; it declares what this review is about, and absent = no declaration (the review then judges whatever `documents` / `paths` name).

ASYNC (depth 0 only): pass `async: true` to run the review in the background — omitting it is refused (pass `async: false` for the blocking review). The ack returns immediately; the report arrives automatically in a digest turn.

- One shared pool: `agent.poolLimits.advisor`, default 4 — configurable via `/config` or the same key in the user config file. Pool-full and same-scope launches are refused stating the current limit; launch reviews one at a time.
- Inside a child (depth>0) reviews are always synchronous (`async:true` rejected).