Run an independent review of your work. `type` is REQUIRED — one of exactly two values, no default and no silent fallback.

- `type="design"` — design review: reviews design / requirement documents BEFORE implementation. Pass `documents=[...]` and `batchDoc` — the batch record this review belongs to. **`batchDoc` is required**: a design review without it is refused before launch.
- `type="code"` — code review: reviews the code you changed AFTER implementation. Pass `paths=[...]` to scope files/directories; `documents=[...]` adds acceptance-criteria context.

`documents` — one rule: a relative path resolves against the session project root (e.g. `docs/<area>/<name>.md`); an absolute path is used as-is.

The relative form needs the session anchor to be inside a project. When the anchor is a workspace root (several projects below it, no manifest of its own) there is no single project root to resolve against, and a relative path is refused with `no-project-root` — write the absolute path there.

Accepted = an existing `.md` file anywhere inside a project — a doc sitting at the repo root counts. Anything else is refused with the resolved path, the reason and the two expected forms.

A call without a type (or with a conflicting `object.type`) is refused.

{{knowledge:tool-advisor}}

Returns the verdict: all-clear (call `verify`) or a findings list to fix.
