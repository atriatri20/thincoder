aliases: 交付前校验, 验证门
verify does NOT run any test or verification command for you, and does NOT require a test per change.

You DECLARE your verification status through the `verification` argument, `{ status: 'passed' | 'failed' | 'skipped', command?, summary?, basis? }` - the declaration is self-reported evidence.

The three outcomes and what each does to your completion:
- `passed` → allowed.
- `failed` → blocked.
- `skipped` → allowed, but needs a `summary` giving the reason.

`basis` (optional) is the "what it stands on" dimension of the declaration: a judgment source, the exact words you read at their path, or an explicit `unverified`. It is declaration-only - no format is enforced and nothing is machine-checked.

A `passed` / `skipped` declaration with no `basis` gets one advisory hint line in the report: never blocking, never changing the outcome. A `failed` declaration gets no basis hint - it is already blocked.

Whether and how to verify is described in natural language in the project's AGENTS.md, and is decided and executed by you.

The report also carries the changed files (git diff), an advisory `node --check` hint on changed .js / .mjs files (not gating), the task list, and a self-review checklist.

Call this BEFORE declaring a coding task complete - do not say "done" until verify passes.