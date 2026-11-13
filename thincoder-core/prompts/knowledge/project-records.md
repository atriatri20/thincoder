## Ledger — the project's todo book
**What it is**: the project's **todo book** — a **requirement pool** (user requirement points) plus **tech todos** (engineering debt); persists across sessions, and it is the **only todo-tracking surface** (checklist retired).
**Where it lives**: keyed by **project root**, stored in the **user data directory** (outside the work tree — in the tree it travels with every clone and disappears with the project tree; no file left in the project); an empty read = that project has no ledger yet (the first write creates it).
**Six states**: 待讨论 → 待设计 → 在途 → 待核销 (the four **unsettled states**); **已核销 / 已废弃 = archive states** (soft delete — settled entries leave the unsettled surface).
**Who reads / writes**: **reads = every role** (`ledger` (action=query/count); `cwd` defaults to the session project root — pass an absolute path to touch another project); **writes = the main agent only** (subagent tool assemblies carry no write command).
**Subagent view**: the ledger is your **input** (this batch's entries come with the spawn), **not your write surface** — new findings go back to your parent, which books them.
**A note is not a ledger**: an **unresolved** gap / difference / limitation resting in prose, comments or inline notes is seen by nobody and cashed by nobody — fix it, surface it upward, or get it booked, so it lands on a **visible todo surface**.
A "noted on the record" registration inside a doc is valid **only for ruled items** (judgment + reasons + resolution window).
**Anchors & detail**: entries hang on **pointers** (requirement-doc section / batch-record section / evidence line).

## Batch record — the carrier of task flow
**What it is**: the **batch record** = the **carrier** of task flow — the single file threading one implementation round from start to closeout.
The path is the one your task book carries (`batchDoc`) — the project declares where its batch records live, so never guess a path (relative paths resolve against the session cwd first, then candidate project roots, or absolute).
A hard-coded path breaks the moment the batch record moves.
**Disposable by design — it may be cleaned up at any time**: a batch record is a **one-off execution record**; the whole set **must be deletable at any moment**.
**⚠️ Deletable ≠ delete-after-every-round** — nothing in this mechanism deletes a record automatically; tend to it **when the cost of keeping it outweighs its value**, e.g. it has been polluted and repairing it costs more than dropping it.
**A batch record may be dropped whole**: anything that must outlive the round lives in the requirement/design docs.
Dropping one is a maintainer's decision; no schedule does it.
**Practical consequence**: no mechanism, a decision or a criterion lives only there — it can be dropped whole, and whatever lives only there disappears with it; if deleting every batch record would lose something, that something is in the wrong document.
Cited only from batch records to spec docs, and not the reverse — a spec doc that cites a batch record breaks the moment the record is deleted.
**Mode scope**: the documentation system is the same across all modes; the difference from engineering mode = whether strong process constraints apply.
**Six-segment map (one segment, one author)**: §1 discussion = the main agent.
§2 batch task & design = eng-designer (engineering) ∥ the main agent (normal) · §3 design review findings = the review subagent (advisor).
§4 user approval = the main agent · §5 implementation record = eng-coder (engineering) ∥ the implementer (normal — the main agent working directly ∥ a coder taking it on).
§6 verification & closeout = the main agent (the parent, as seen by subagents).
**Writing means**: the `batch` tool — **no path parameter** (the target record is bound to you at spawn); **the segment number follows from your identity**; if the write does not land ⇒ say "§× not written" plainly in your report.
**The task book itself**: `batchDoc` = the batch-record path = **your task book** (mandatory on every eng-designer / eng-coder spawn); unreadable ⇒ refused — executing without it runs a whole round on a guessed direction, so bounce it back.
**This section maps the segments only**: each segment and its author — structure rules, gates and the lifecycle are not restated here.
**Per repo, its own record**: batch records live in their own repo — the base root resolves from the session anchor's project declaration.
**A cross-repo create is refused — that is the correct behavior**, because a cross-repo record cannot be created or closed and a workaround only produces an account that does not exist.
A task spanning several repos ⇒ **each repo gets its own record and its own batch**.
## Doc vs process — state goes in the state doc, process in the process doc
**Process lives in the process doc; state lives in the state doc** — a mixed doc makes the reader work out which value is still alive.
The **process doc = the batch record** — how this one round was run.
The **state doc = requirement docs / design docs** — what is true now, and how it is built now.
**A state doc** states what is true now. History lives in git; a past value left in the doc is retrieved as current guidance.
**Why (three layers — miss one and you get the boundary cases wrong)**:
① **Reader side** — a state doc's reader is always asking "what is it **now**"; hand them a run of historical values and they must work out which one is still alive = **their judgment wasted**.
② **Retrieval side** — a stale value gets retrieved and **read as the current way** ⇒ this is not tidiness, it is **error propagation**.
③ **Lifetime side** — a state doc **lives long**; what goes in **cannot be cleaned out**. A process doc **can be cleaned up whole** (a maintainer may drop an entire record without losing normative content) ⇒ process has to live there to be **cleanable at all**.
**The test is one question**: *would this sentence still mean something once this round is over?* Yes ⇒ it is state; keep it. No ⇒ it is process; delete it.
**Process (delete-eligible in a state doc)**: symptom · root cause · problem statement · reproduction · trial readings · experimental rejection details · change trail · superseded values.

**State (keep)**: the current rule · current value · current contract · current acceptance criterion · current boundary · decision + its one-line reason · design-level rejected alternatives and their lasting reasons.

Mechanism-body sentences, directory-ownership sentences, template / placeholder forms, and a date that is part of a rule also stay.
**Common sense — every mode and every role**: this is not an engineering-mode rule; the same split holds in normal mode and for every role that writes a doc.

## Work structure (board → domain → file)

**Work structure (code tree ∥ doc tree) comes in three tiers: board → domain → file** — board = a business board; domain = a directory (the **concurrency-isolation unit**); file = a single file.

**Why domains**: the root of write conflicts = two pieces of parallel work editing the same set of files — overwriting each other, stepping on each other, rework.
**How to draw domains**: things that always move together ⇒ one document; things that never move together ⇒ separate.
Split this way, and parallel work stays in separate domains without interfering; **get the domains right, and parallel write conflicts stay low enough** — get them wrong, and the conflict only surfaces at runtime.

**Four rules**:
- **① Domain = the concurrency-isolation unit**: parallel work moves within its own domains — no pull between domains; a piece of work lands only in its own domain.
- **② Stand the domain directory up from day one** (even with a single file inside): starting late = existing files must move — moving = path churn + broken references; stand it up first, and later splits never move what is already there.
- **③ Splits always land inside the domain**: new files go into the same domain directory — **zero cross-domain churn ∥ zero path rearrangement**, zero disturbance outside the domain.
- **④ Code tree and doc tree move in step**: modules mirrored — when the code splits out a module, the doc tree splits out the matching domain at the corresponding position; the two trees keep one module structure.