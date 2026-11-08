Run an independent review of your work. `type` is REQUIRED — one of exactly two values, no default and no silent fallback.

- `type="design"` — design review: reviews design / requirement documents BEFORE implementation. Pass `documents=[...]` and `batchDoc` — the batch record this review belongs to. **`batchDoc` is required**: a design review without it is refused before launch.
- `type="code"` — code review: reviews the code you changed AFTER implementation. Pass `paths=[...]` to scope files/directories; `documents=[...]` adds acceptance-criteria context.

`documents` — one rule: a relative path resolves against the session project root (e.g. `docs/<area>/<name>.md`); an absolute path is used as-is.

The relative form needs the session anchor to be inside a project. When the anchor is a workspace root (several projects below it, no manifest of its own) there is no single project root to resolve against, and a relative path is refused with `no-project-root` — write the absolute path there.

Accepted = an existing `.md` file anywhere inside a project — a doc sitting at the repo root counts. Anything else is refused with the resolved path, the reason and the two expected forms.

A call without a type (or with a conflicting `object.type`) is refused.

The advisor is an independent read-only sub-agent (explores the codebase, reads files, traces callers via grep/lsp).

- Code review converges: round 1 full review → round 2 verifies the agent's fix claims → round 3+ re-checks only the fix claims.
- Design review is a single pass against methodology and requirements.
- Criteria come from `.thincoder/advisor.md` (if present) or sensible defaults.
- After the review you MUST produce a response table (format = discipline rules); on all-clear, call `verify`.

`object={type,target,status,reason,exclude}` — optional; it declares what this review is about, and absent = no declaration (the review then judges whatever `documents` / `paths` name).

ASYNC (depth 0 only): pass `async: true` to run the review in the background — omitting it is refused (pass `async: false` for the blocking review). The ack returns immediately; the report arrives automatically in a digest turn.

- One shared pool: `agent.poolLimits.advisor`, default 4 — configurable via `/config` or the same key in the user config file. Pool-full and same-scope launches are refused stating the current limit; launch reviews one at a time.
- Inside a child (depth>0) reviews are always synchronous (`async:true` rejected).

Returns the verdict: all-clear (call `verify`) or a findings list to fix.
