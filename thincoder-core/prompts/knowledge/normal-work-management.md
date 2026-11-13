## Work management (batch record + ledger + closeout)

**The same management logic as engineering mode** — batch record + ledger + closeout; the only difference is constraint strength:
that side is backstopped by mechanical gates, this side is held by discipline — with one exception: the ledger chain
(a design review needs a batch record carrying an unsettled ledger row) is a mechanical check here too. Three usages:

### Ledger usage (when the ledger moves)

The ledger (tool `ledger`; command `/ledger`) = the project's todo book: requirement pool + tech todos, persistent across sessions.
**Writes = the main agent only** (subagents can read, not write — new findings go up in their reports).
Six states: 待讨论 → 待设计 → 在途 → 待核销 (the four unsettled states) · 已核销 / 已废弃 (archive).
**Four moments that move the ledger**:

- **Register** — the user states a real requirement (complex tier: 3+ steps / a new feature) ⇒ one requirement-pool row (`title` = the requirement name, `board` = the owning board).
  Scan the existing rows on the same face first — **the same topic = the same item** (same problem ∥ same work object — irrespective of the `kind` field): merge it in; otherwise note the relation.
- **Advance** — the task is confirmed and the record opened ⇒ the row steps up to **在途** (待讨论 → 待设计 → 在途), its `task_book` pointing at the batch record; **the account precedes the pen**: open the record and hang the row before the first stroke.
- **Book a debt** — work turns up a new defect / debt / doc drift **within scope** → record it as a row **(tech todo)** **before the closeout of the batch that carries it**,
  and settle it there; **out-of-scope items are not booked** (scope test: inside this task book's scope → booked; beyond it → a suspicion, not a fact).
  `trigger` is one of three values: `归批` (the batch name goes into `evidence`) · `条件` (the condition sentence goes into `evidence`) · `认账不排期`.
  **The closeout names the count** — `本批新债 N 条 + #<row>`, or `本批无新债`.
  Why: a debt left in report prose or code comments is seen by nobody and gets done by nobody; and a debt whose closeout says nothing is one the next
  reader will re-discover from scratch.
- **Settle at closeout** — once the closeout chain has run ⇒ the row steps twice (在途 → 待核销 → 已核销; a jump from 在途 to 已核销 would wash an in-flight entry into done), the settlement basis written into `evidence` (batch-record section / landing coordinates / commit hash).
  **Settlement order**: settlement needs the closeout first.

### Batch record usage

**One delivery goal = one batch record** (boundaries same-source with engineering): the delivery goal changes (the topic word changes) ∥ a phase boundary crossed ∥ the entry set changes ⇒ a new batch, a new record.
**Record opening trigger = complex tier** (3+ steps / a new feature); diagnostics ∥ read-only probes open none (zero-chain — no record, nothing booked).
Small / medium changes as before: backfill the owning doc + `task`.

- **Open the record** (main agent only): `batch`'s create — the six-segment skeleton comes complete; **the account precedes the pen**: open the record first, then hang the ledger row (its `task_book` points at the record), and only then start the work.
- **Record as you go**: log each pen in `§1` (change coordinates ∥ walkthrough readings ∥ the ledger row); `§2` = batch task & design; `§5` = implementation record.
  **The implementer writes §5** (same source as engineering): you work directly ⇒ you write it; a coder takes it on ⇒ pass `batchDoc` at spawn and it writes its own; unbound handoffs (escalate and the like) ⇒ you record on its behalf from its report and your review, noting the source.
  After the freeze, back-editing rewrites history and the account stops being checkable — a change = a new batch, a new record.
- **The author seats**: normal mode has no designer role — the pens of `§1` / `§2` / `§4` / `§5` / `§6` are all in your hand (the designer seat folds into the main agent); `§3` = independent review.
- **Guardrails** (same judgment as engineering): a single record >1000 lines = an overrun signal ⇒ start a new batch; written content is not back-edited (a back-edit rewrites history); the deciding authority = the main agent; a subagent hitting the batch boundary ⇒ stop and bounce it back.

### Closeout discipline

**Landing**: land batch by batch — details ∥ defects ∥ problems named on the spot are changed directly (no per-pen design → review gate).
The routing criterion has the same source as engineering, not a second set: new mechanism ∥ major change ⇒ design first, then act; everything else lands directly, with the closeout as the backstop.

**The closeout runs the full chain once** (trigger moments — the obligation to raise it is yours): the user says "closeout" ∥ a natural pause ∥ a topic switch ∥ a wind-down signal — the form is one line: batch ∥ pens ∥ steps owed ∥ one word back and it runs, no chasing.

1. **Documentation normalization** (yours — the same standard as the engineering-mode designer): formalize each landed change into `§2` (kind ∥ origin ∥ landing coordinates ∥ doc-reconciliation destination); reconcile docs and implementation to agreement.
2. **Independent review**: `advisor` (`type:"design"`, with the landing-document set + this record's `batchDoc`) — the reconciliation = landed code ∥ records ∥ docs;
   the reviewer writes the conclusion table (each row's evidence = a pointer: a section number / a symbol name / the exact words of the line) + the VERDICT line + the counts into `§3`.
3. **Fixes (if any)**: dispose of each finding — you fix it ∥ bounce it back.
4. **Approval**: the user's confirmation record lands in `§4`.
5. **Closeout settlement**: `§6` records the closeout (plus the necessary tests and the closeout test line); the ledger row steps twice to 已核销; `batch`'s close freezes the record.

**Settlement follows the closeout** (the ledger row hangs and does not pass). **Cross-session pick-up**: at session start, scan for unclosed batches (`§1` status line not 「已收口」 ∥ the ledger row not settled) — found ⇒ raise the closeout first.

- **The ledger chain**: launching a design review requires its batch record to carry an unsettled ledger row — a row whose `task_book` points at that record,
  in one of the four unsettled states. Without one the launch is refused (`criterion=batchdoc-no-ledger`). This is a mechanical check on both sides; it is not discipline.