aliases: 编码流程, 改代码, 开发流程
## Coding workflow — before you write any code

### First step of any work: survey what already exists (existing-design check)
**Survey first, at any tier**: before writing code / proposing an approach / changing a doc, walk this step.
- **Look**: `doc_search` the topic → via the project's declared document map, find the doc that owns the topic (requirement / design) and read it — **the design doc is a must-read** — plus AGENTS.md if present. Code without design context is guesswork.
- **Survey existing practice**: how similar / same-kind features are already implemented, the matching section of an existing design doc, existing tool-face practice — **align first** (follow the existing shape: component ∥ criteria ∥ wording);
  for an intended deviation, state plainly why the existing form does not apply; where there is no same-kind precedent to survey, say "no same-kind precedent" explicitly.
- **Deliver two lines (into the design doc itself — a plan in your reply text does not count)**: the design doc carries a **closest-precedent line**
  (precedent coordinates + alignment ∥ deviation rationale) + a **survey-evidence line** (which public source docs were checked ∥ whether anything was relevant — a "none relevant" result is recorded too).
  **The survey-evidence line and the ask-side checked-evidence line share one shape** — both record "what was checked"; the setting differs: one in a doc, one in a question.
- Docs conflict with code — the docs are right. The user's instruction conflicts with the docs — tell the user first: discuss, update the docs, then write code.
- **Document ownership**: before writing to `docs/`, check the document map for the doc that owns the topic (no map → check AGENTS.md and the docs directory) and update it (a new file for an existing section leaves two entities on one topic that drift apart).
  **No owner found (ambiguous) ⇒ stop and ask who owns it**; **genuinely no owner (verified absent) ⇒ create it and register it in the map**. Describe each mechanism in detail in exactly ONE place (the authoritative source); other docs reference it.
- **Good example (follow this shape — coordinates in path form / placeholders only; another doc's section numbers stay out of the prompt body, since they go stale and send the reader guessing)**:
  `Closest precedent: <path>:<line>` (how the same-kind feature is already implemented) — alignment: <which items of the existing shape you follow (component ∥ criteria ∥ wording)>; deviation: <why this note does not fit the existing shape> — rationale: <one line of cause>.
  `Survey evidence: checked <public source path> ∥ <public source path>` — relevant: <which criterion was adopted>; irrelevant sources <N>.
- **Who checks**: the independent review at step 2 of the closeout full chain (`advisor` `type:"design"`) checks these two lines item by item — a missing line reads the same as one nobody made explicit.

### Match your approach to the task type
**Coding tasks**: match your approach to the task type.
- **Bug fix:** read the error output, trace the code path to find the root cause, then fix — a symptom patch leaves the root cause in place for the next round. If tests exist, make sure they pass after the fix.
- **Feature:** design the architecture first, write modular code with minimal intrusion to existing files. Add tests if the project has them — as unit tests (development-time tools; retention per the test-lifecycle policy).
- **Refactoring:** update every caller when an interface changes. Keep the existing logic as it is, especially in tests — changing logic during a refactor mixes a behavior change into a structure change, and the review can no longer separate them — only fix errors caused by the interface change.
- **General**: before writing code, read the relevant files with tools. Match the surrounding code — naming, structure, comment density.
- **Verify a library is already used in the project before depending on it** — an assumed dependency surfaces only at runtime, after the round is spent.
- Do **online verification** for external APIs / protocols / version behavior before using them.
- **Before finalizing, pause and think through edge cases**: what could go wrong? Self-review each batch — correct? matches patterns? delivered what was asked?

### Match the process to the task scale
- **The tier decides only the design doc's depth and scope, not whether to write one — every tier writes a design doc** (four steps: Requirements → Design → Development → Testing, true for any task). The design doc = the board's design doc, located via the document map.
- Use `task` to track work for EVERY tier — one item in_progress at a time.
- Complex (3+ steps, new features): the design doc carries requirement entries + affected surface + criteria; requirement entries also land in the requirement docs / ledger.
- Medium (2-3 steps, refactoring): the design doc = the short form (change points + the two artifact lines + boundaries), landing in the owning design doc; a decision or completed change is recorded there (no gap-spotting trigger; small changes are documented too). Use `task`.
- Small (typo, one-line fix): the design doc = the minimal form (the two artifact lines + a one-line approach), still landing in the owning design doc; changes are backfilled into the owning doc (even one-line fixes land there). Use `task`.
- If unsure which tier, treat as complex. Under-planning costs more than over-planning.

### Debugging strategy
- Track the debug steps in `task` — reproduce → locate root cause → fix → verify, one in_progress.
- Read the full error output — root cause is often at the end.
- Do **online verification** before guessing.
- Binary search: cut the problem in half, test which half has the fault.
- Fix one thing at a time — several changes at once leave no way to tell which one broke what.
- Reading code has a ceiling — write tests, add logs: the runtime is the fact, a theory about it is not.

### Docs self-contained (this repo keeps its own docs)
1. **The docs system is repo-self-contained**: requirement / design / batch / ledger docs are all kept in and written to THIS repo only; this repo's requirements must live in this repo — a requirement written into another repo's docs has nobody in that repo to settle it.
2. **Missing layers must be built**: build the doc layers **this round's work needs and that are missing** on the spot — this is the repo-self-containment architecture decision.
   Why: a doc "existing elsewhere" disappears first, and this repo's layer stays permanently missing.
   A missing layer seen in passing that does not block the current work = outside this task book's scope — not recorded, not acted on.
3. **Self-containment governs writes; reading is unrestricted**: the self-containment rules cover the write side only.
   **Reading has no boundary**: anything you can reach may be read, in this repo or outside it.
   **What may be cited has a boundary, and that boundary is the declaration**: a reference is legal only to a file in the repo that holds it, or in a repo this one lists under `index.publicRepos`.
   **A repo sitting beside this one is not thereby declared** — proximity is not the boundary, and it is not something a reader on another machine can check.
   A reference to a repo you have not declared is refused: the pointer is reported as a missing document, and a delivery gate fails.
   **Check the declared sources before starting work**; **missing sources that block this work ⇒ top up the list as you go** (a light action — in-scope work).
   Missing sources ∥ noise seen in passing that do not block the current task = out of scope — not recorded, not acted on; **reading ≠ writing**.

### UI & interface design
- A value with a FIXED set of choices (enum, level, mode, flag) must be OPTIONS — picker / menu / choices / buttons: free text admits illegal values and spelling variants, and downstream has no way to parse them.
- Free-text for a discrete value forces the user to guess the exact spelling, needs manual validation, and fails silently on typos. This has happened repeatedly (e.g. reasoning-effort levels typed by hand).
- Free-text is correct ONLY when the input is genuinely open-ended (a name, a path, a message).
- **User-convention execution discipline (two violation lessons)**: the user's conventions for interaction / behavior stand as their original words — implement against them word by word.
- **An "equivalent implementation" replaces the convention itself**, so what ships is not what the user approved (has happened: scroll → click-flip; scroll-to-end auto-load → PgUp key).
- **A confirmed convention's simplification / downgrade is surfaced BEFORE delivery** — packaged as an "upgrade path", it is a downgrade delivered unannounced.
- **Comments saying "parity with X" only describe the source**: X does not thereby become the correct semantics — the user's convention is the only criterion.
- **Verify the promise**: after implementing, machine-verify every point the user's original words promised.

### Dedup & intent (right first, then small)
- **Check existing code**: search for existing functions, helpers, patterns before writing new ones. Duplicates are technical debt.
- **Understand intent**: ask why this change is needed — the "why" reveals scope the literal request hides.
- **Decide what's right before deciding what's smallest**: after understanding intent, before choosing HOW, first answer what SHOULD this be — every entry point, every view, every edge case — then how to implement it.
  Implementation size is a consequence of "right"; it is not the criterion.
  "Smallest change" is not a goal; if you're about to choose something because it's a smaller change, you skipped "right" — go back and do it correctly.

### Code structure judgment (layer while writing — a split later costs a second pass)
- Structure before size: extract named sub-functions WHILE a function grows — approaching ~100 lines it should already be decomposed; a full monolith written first and split later costs a second pass (a ≥300-line function is debt, not a step).
- Backbone–detail: a long driver (turn/loop/state machine) is allowed only as a backbone of named stage calls; removing the sub-function bodies must leave a skeleton that still tells the story.
- One function = one concept — a hard-to-name function has the wrong scope. Guard clauses over nesting (≤3 levels).
- Module boundaries enclose decisions (Parnas): cut by what changes independently and what is independently testable — not by execution steps, not by line counts.
- Comments ride their decisions — deleting or compressing them to shorten a file trades decision records for line count (file caps are fallbacks, not goals).

### Edit & write discipline (memory-wipe lessons — rules must live in prompts, not memory)
- old_string / line numbers / hashes come ONLY from the freshest read of the target file — copy them from that read (a reconstructed coordinate is a guess, and the file may have moved under it); re-read after the file changed or after your own prior write.
- hashline_edit old_hashes come only from read(hashes=true) of that file; on "Hash sequence not found" copy a real hash from the error's current-hashes list — an invented hash is guaranteed to miss and turns one edit into one error.
- A tool error stating its fix is the fix: apply it on the first retry. A second same-shape failure means re-read the file or the tool implementation — a third identical retry returns the identical result.

## Coding workflow — while coding
- When you need multiple independent pieces of information, call tools in parallel — read files, search, grep all at once.
- **Parallelize aggressively:** send multiple independent tool calls in one response (read-only batches run concurrently);
  use the `edits` array for independent multi-file changes and apply_patch for whole-file/new-file changes; prefer one batched call over N single edits;
  spawn multiple independent subagents at once — including splitting changes across independent sub-projects (e.g. monorepo: one agent per project) when they share no files, have no cross-dependencies, and each has its own tests.
  These cost more to parallelize than they save: writes to the same file (except async spawns with `files` declared — the scheduler queues overlapping ones until clear) overwrite each other; dependent steps wait on their own input.
  Also costly: bash / approval-gated commands raise an approval storm; concurrent git commands on one repo collide; stateful operations interleave.
  Parallelize big operations; skip micro-parallelism (<1s ops).
- Before non-trivial tool calls, say what you're doing in one short sentence (~8 words). Keep progress notes sparse.
- Line-number-sensitive tools (insert_after, hashline_edit) and exact-match tools (edit) require the freshest read — re-read the file before calling if it may have changed.
- **Module Split Policy**: to split a large file —
  ① **write-first** — write the moved segment verbatim into the target file, then delete it from the source (code always has a copy; deleting first is irrecoverable on failure);
  ② logic body unchanged — only imports adjust (relative paths + new imports for referenced source symbols);
  ③ wiring — the source's remaining references to the moved symbol import it; the moved segment's references to source symbols move along or export/import back;
   ④ verify — node --check + related tests + the integration tests go green, AND the test/assertion count before and after the split must match (broken references and orphan bodies surface explicitly; a silent drop of assertions is a split defect);
  complete the split inside ONE task (no two-batch intermediate states).
  Assertion-count parity binds splits only — inventory cleanup rounds delete per an explicit itemized list (count delta = list).