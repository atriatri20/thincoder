Available roles (exposed per mode; the role is REQUIRED for action:'spawn' — a missing or misspelled role is refused):
- explore — read-only search & analysis; its git access is read-only (log / show / diff / status / blame …) and no git working-tree context is injected — evidence comes from reads and the task book; its report must list what it searched and what it did NOT find. Say quick / medium / thorough (default medium).
- plan — read-only planning; NEVER edits; returns a step-by-step plan.
- coder — full implementation; the parent's read/write/execute toolset minus the interactive main-session tools (`question` · `ssh` — a child has no user to ask and no credential window / session to hand back), plus verify and advisor self-review. Its report carries a delivery table, one row per requirement (Done / Simplified / Not done — no deferred column). Normal mode: may optionally carry `batchDoc`, which binds this spawn's §5 record-write channel (unbound ⇒ the main agent records §5 on its behalf); when provided the path must resolve to a readable file.
- eng-coder — engineering mode only (replaces coder): the same toolset plus the design-driven methodology overlay; its delivery protocol (implementation → audit → self-fix → advisor re-review → converged delivery) runs fully inside the child. REQUIRES a valid designToken from a passed advisor(type='design') review — pass the exact value from that review, or copy it verbatim from the action:'design-slots' row (the text after designToken=): missing or mismatched = the spawn is refused, and an expired token is refused with expired named. Its reply also echoes a designId — pass it (required to pick between concurrent designs, optional for one) and echo it back in the delivery report. REQUIRES a batchDoc — the batch record path, the task book this spawn implements (refused when absent, when it does not resolve to a readable file, or when that record already has an in-flight spawn).
- eng-designer — engineering mode only: the SOLE author of the design documents and of the batch record's design section (requirement docs stay with the main agent). Writes no implementation code, does not edit prompts, does not fire reviews, needs NO designToken. Surveys on its own; may only spawn read-only explore children (sync, ≤6 per batch). REQUIRES a batchDoc (same gate as eng-coder).
- tester — BOTH modes: the readings seat. It runs the verification commands the task book puts in `goal` and hands the readings back as they stand — no verdict, no fix, no document of any kind. Its tool face is the read-only tools plus `execute` / `bash` (dependency installs, compiles and fixtures included), minus `verify`. Run only, never change is a role contract, not a sandbox — `bash` can write, so a tester that edits anything is a defect.

Task book (non-engineering roles: explore / plan / coder / tester): four core structured parameters plus `scope`.
- goal — the goal & why.
- knownFacts — the facts you already verified.
- acceptance — machine-verifiable criteria.
- reportFormat — the delivery-report format.
- scope — scope & forbidden scope: what to read and what not to touch.

All five are required: a missing, blank or non-string value is refused with the parameter named. A free-text task is an optional supplement, never the whole brief.

Engineering roles (eng-coder / eng-designer) take their task book from the batch record:
- batchDoc — the record path; the child reads §2 of that record itself, and no other task text is passed.
- round — initial | fix.
- files / dependsOn — for scheduling.
- An eng-coder spawn also carries designToken (the write credential) and designId when several designs are open: missing or mismatched = the spawn is refused.

A record carries one concurrent spawn at a time: a second spawn on a record still in flight is refused, naming the occupant — wait for it to settle, or cancel it. Sequential hand-offs (design → implementation → fix round) pass, because the previous spawn has settled first.

Pass one parameter per field — contents only (the runtime adds the labels):
subagent(role="eng-coder", round="initial", batchDoc="<batch record>", designToken="…", files=[…], async=true)
subagent(role="explore", goal="…", knownFacts="…", scope="…", acceptance="…", reportFormat="…", async=true)

Mode filtering: normal mode exposes explore/plan/coder/tester (eng-coder and eng-designer are refused); engineering mode exposes explore/eng-designer/eng-coder/tester (plan and coder are refused — plan is a normal-mode role, coder is replaced by eng-coder; tester is dispatchable in both).

Async spawn:
- Pass `async: true` — the spawn returns {id, status:"running"} immediately and the report arrives automatically; if your next step needs it, end the turn and let the digest deliver it — do not poll. Omitting `async` is refused, so pass it explicitly.
- Inside subagents (depth>0) spawns are always synchronous — pass `async: false` there (an explicit `async: true` is refused).

Pool: async spawns are pooled per role domain — 4 concurrent eng-coders plus 4 concurrent other-role spawns by default (agent.poolLimits overrides both); a full domain queues further spawns with a position while the other keeps starting.

Task scheduling: declare files (the file paths this task will modify) and dependsOn (ids from prior async returns whose outcome this task needs) to let the scheduler order your spawns.
- Overlapping-file tasks serialize and dependents start in order: a conflicting or dependent spawn queues (position/reason) and auto-starts when the conflict clears or the dependency settles (cancel to drop).
- A cancelled/failed dependency leaves it queued marked "dependency cancelled" until you decide. Unknown ids error; a consumed id counts as satisfied.
- Omit both for a plain immediate spawn.

Writing the prompt — the child starts with zero context, so brief it like a colleague who just walked in: goal, what you already know, the specifics.
- Put exact paths and commands in — do not make it search for what you already know.
- Do not delegate understanding: resolve the paths and the symbols the task hinges on first.
- Once it runs, leave that scope to it — don't redo its searches in parallel or finish manually midway.