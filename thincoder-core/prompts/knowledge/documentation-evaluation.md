aliases: 文档, 文档体系, 文档评审, 文档标准
## Documentation system — evaluation criteria (generic ruler for projects you work on)

> Premise: **judge by the target project's own conventions first**; use the generic criteria in this section only when the project has no written standard.
> Surface findings to the owner — remodelling someone else's system changes a normative surface its owner did not approve (the project's `AGENTS.md` / established conventions win).

**A Layering**:
1. Three layers present — requirements (what) / design (how) / tests (how it is verified); code without corresponding docs is a defect.
2. Overall vs module separated — overall goals and overall design live at the overview level (whole picture at a glance); module detail lives in module docs.
   The same fact at two layers drifts, and the reader cannot tell which copy is current, so overviews don't sink into detail and modules don't scatter conclusions.
3. One document answers one class of question — requirements docs answer "what", design docs answer "how"; one document answering two questions forces the reader to split it, so layers cross-reference, each answering its own question.

**B Location & naming (predictable)**:
4. Canonical locations — each document class has a single, predictable home (directory = category); a file dropped wherever it fits leaves the next reader no directory that owns the topic, so find the owning directory before creating a file.
5. Consistent naming — same class, same shape (category and subject recognizable at a glance); unique within a directory; references resolvable across directories.
6. One owning document per topic — look for the document that owns the topic before writing; create a new one only when none exists, and register it in the map/index.

**C Quality (checkable)**:
7. Single source of truth — a mechanism is detailed in exactly one place; elsewhere references it; restatement is a defect.
8. Stale prescriptions get deleted — dead rules/acceptance lines come off the live face; pointers must resolve against the current state (a dead pointer is a defect).
9. Acceptance before prose — every requirement is verifiable; a set of things named in one place goes by the same names wherever else it appears, and a count of them is a reading, kept in the batch record.
   **A criterion earns its place by being able to fail**: a reader reads it and the thing it judges, then says it does not hold — that reading is the failing side; where the thing does not exist yet, the criterion says what would make it fail.
   **It also has to be able to pass**: a criterion the finished work cannot meet — a retired wording still demanded, a `Why` line still required after the rule that carried it was withdrawn — reads exactly like a strict one, so before it is imposed it is checked on the work that should satisfy it.
   **The check is named before it is run**: on a code face, the changed-face unit test file and the command that runs it; on a document face, the sections to read and what counts as right in them — a document change with no runnable test is not a gap to fill.
   **No number is conjured to fill the blank**: a grep count, a probe, a fixture — anything manufactured because the criterion wanted something runnable — proves the tool ran, and outlives the doubt that produced it.
   **`verifiable` is about the reader, not the machine**: the word points at the reader's reading, and nothing has to run for it to be true.
   Why: a criterion nobody can watch fail is a sentence shaped like a gate, and the number invented to green it is what the next reader mistakes for evidence.
10. Final state only — **a requirement/design doc states only what is true now**. Anything that makes retrieval unable to tell "this is the current rule" from "this is something else" is **pollution**.
    Four forms — the list is examples, not a closed set:
    - **History** — superseded statements, changelog, lineage notes, "previously X".
    - **Dead pointers** — references to something deleted (at best a wasted lookup, at worst it fabricates a source that does not exist).
    - **Point-in-time statements** — "as of 2026-09-15: …", "currently / for now". Reads as a specification, is actually a snapshot — it outlives its moment silently.
    - **Negations about removed things** — "X is not merged in", "X was scrapped". **Retrieval cannot represent the negation** — it surfaces the mention, and whatever it names gets treated as present. This one is the most invisible: it looks like honest disclosure.
    **The test (apply it to any sentence, listed form or not)**: pulled out alone and handed to someone who sees no context, would it be acted on as "this is how it is now"? If yes and it is not — it is pollution.
    **Why this is not optional**: retrieval cannot tell which sentence is current — keep a superseded statement and it is fetched *alongside* the correct one with equal weight, and the wrong one gets acted on (not merely "read" — **copied into new work**).
    Keeping history in the doc is therefore **pure loss**: git already holds every past version, so the doc copy adds zero recoverability while adding a live pollution surface.
    **The trail lives in git commits** — that is where you go to ask "what changed".
    Organize by business board (not per feature point); closed records stay as written — a back-edit rewrites an account someone already settled.
11. Citation form — a citation is judged by whether it resolves against the current state: a relative pointer like "see earlier" / "see elsewhere" goes stale, while a named target stays findable.
    Citations are one-directional (a cycle leaves neither end primary); cite instead of copying — a copy drifts from its source; pointers resolve against the current state.
    - **Direction rule: a state doc cites a state doc** — a batch record is a one-off carrier that can be deleted whole, so a requirement/design doc citing it (or its unit test files, **history lines included**) dies with it.
      **The citation direction is batch record → state doc only**, and not the reverse — the reverse breaks the moment the record is deleted.
    - A clause reading "the criterion is batch X §2" (or naming a batch's own unit-test file) dies the moment that batch closes or its file is deleted.
    - **A change-trail line names what changed and where (section / symbol name), not which batch carried it** — provenance lives in git and in the batch record itself.
    - **Existing instances are violations too — no exemption.** Touching a document means fixing what you found in it, whenever it was written: the question is "did I touch this file this round", not "did I write this sentence".
      **The why**: everything in this repo was written here, by these same hands — calling a hit "pre-existing" only hands you a reason not to fix it.
      And a "cleanup batch" is that same reason wearing a different name — which is why the old half-sentence about one is gone.
12. Internal tension made explicit — when the same mechanism/fact appears inconsistently in two places (wording / criteria / counts / timestamps), resolve it explicitly: one authoritative place, the others cite it.
    Report on discovery — silently picking one side leaves two versions live, and nobody can tell which is current.

**D Evaluation domain**:
13. **The evaluation domain is the document as it stands now**: content that only later stages of the work can produce is outside that domain while the document is read before those stages.
    Such content includes an approval given only after the review passes, an implementation record and a verification record; an empty section of that kind is not a defect of the document.
    **No review-object declaration pulls it in**: naming such a section in the review target does not make its emptiness a finding.
    **Reading is not judging**: the file stays readable for whatever it tells you about what exists now; the exclusion covers findings about that section, not reading it.
    Why: judging such a section asks the document to carry a product that cannot exist yet, and the review then fails it on emptiness where nothing was ever due.