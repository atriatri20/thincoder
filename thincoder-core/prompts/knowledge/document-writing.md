aliases: 文档, 写文档, 文档写作, 语义合并
## Document writing discipline — semantic merge, no script ghost-writing
- **A script does not read semantics**: scripted section splicing, regex bulk replacement, whole-file appending, "verbatim porting" via script — all count, because what the splice loses is lost for every later reader.
  Why: a splice drops what the splicer did not read, and the loss is invisible to every later reader — the document keeps looking complete.
- **Every document content change must be made by YOU**, reading each spot, understanding the semantics, writing it yourself.
- **Semantic merge**: fuse new content INTO the target document's corresponding position — update the owning section, and the superseded old description is **deleted**; nothing is kept. That is not mechanical splicing of two files.
- **The doc holds only the final, current state** — no history, no "previously X", no changelog, no lineage section.
  Why: invalidated statements are a RAG pollution source — retrieval surfaces a deleted wrong statement as if it were current guidance, and the reader cannot tell it apart from the live rule.
  History lives only in **git commits**.
- **A document carries its own stage's products, not the next stage's**: a design document carries the design, its target state and its acceptance criteria; it carries no implementation record, and lists no product that exists only after implementation as something this document must contain.
  Why: the next reader takes that line as this document's requirement and hunts for what cannot exist yet — and a review then fails the document for being empty where nothing was ever due.
- **Verify the merge mapping's semantics file by file first** — surface resemblance is not topic identity; two documents can carry the same name and answer different questions.
- **Scripted moves fit only zero-semantics operations** (e.g. a single-symbol global rename), and even then say so explicitly; scripting a semantic document change loses the semantics at the move — a script does not read what it moves.
- **The user's words outrank any paraphrase of yours**: task books / design docs / plans you wrote are not grounds to violate an explicit user instruction — on conflict, stop and re-align instead of hiding behind your own document.
- **An invalidated expression is deleted, not revised**: on the **normative face** (feature points / AC / judgment lines / discipline lines / boundaries / status statements), once an expression is invalidated (ruled out / its object gone / superseded) ⇒ **delete it**.
  No `~~strikethrough~~`, no "previously X ⇒ corrected Y", no corpse-marking "void / scrapped".
  Why: **residue makes readers re-open dead items as live work orders** — and in a RAG pipeline a stale statement is retrieved as if current, which is worse.
- **A requirement/design doc carries no history at all**: history lives only in **git commits**.
- **Prompt face — no normative document references**: a **citation** that supplies the meaning of a rule has no place in any text the model reads — prompt files · tool descriptions · schema text · strings returned to the model.
  A citation = any token that sends the reader to **another document** for what the sentence means: a doc name, a doc name with a section number, a path carrying a line number into another doc, a **pointer sentence** such as "see the design doc".
  Why: its wording changes under the sentence, and a model reading it follows the pointer and guesses instead of reading the source — the sentence stands on its own.
  Disposal = delete, not re-point: the citation goes, the meaning stays in the sentence (they belong in docs or comments).
  **The test — what work does it do?** A **citation** sends the reader to another document for the rule's wording or meaning, and that wording can change under the sentence — banned.
  A **machine coordinate** points at a position **inside the protocol the model is executing**, and stays.
  Machine coordinates include: the batch-record segment it writes (`batch record §2` = the eng-coder's task book; `§1`–`§6` = the segments) · a tool parameter name it passes (`batchDoc` / `segment` / `files` / `docs`) · a ledger state it moves · this file's own section numbers.
  **An execution coordinate is allowed**: a task-book reference to the approved design tells the implementer which spec to read and follow; it carries the work, not the wording of a rule in this prompt.
  The model acts on it directly, and nothing outside can reword it.
  **Operand exemption**: `AGENTS.md` · `SKILL.md` · `README.md` · `MANIFEST.md` · `.thincoder/advisor.md` · `project_rules.md` · path forms · the `".md"` literal — names the model **reads, writes or passes**, not prose it has to chase; those stay.
- **A document's numbers belong to that document**: a decision number, a feature number, an acceptance number, a section number — each is the label one document gives its own item.
  Its scope is that document, sometimes a single section of it; the same string in another document names something else.
  **A reference from another document carries that document's name**, and a search hit is not evidence of what a number means — the hit finds the string, never the document that issued it.
  Why: a label read as global makes a live reference look dead, and what the deletion takes out is a rule the other document still runs on.
- **Two positions, two forms — and the evidence claim**: pick by where the reference is written, never by habit.
  **Body text**: the target's path, then the section's number, then the section's name in 「」 — `docs/<area>/<name>.md §<N>`「<section name>」.
  **Nothing sits between the path and its number, not even a backtick**: written apart, the number stops being part of the address, and the edge a graph builds from that line is a document-level edge with no section at all.
  Bare assumed names follow the convention this discipline already states (`<area>/<name>.md`); the body form adds the doc root so the path resolves.
  The number is what a graph query builds its edge from; the name is what a person still reads after a renumbering moved the number. Both, never one of them.
  **Tool parameter**: the `doc:` identity form — a query's argument, a tool's output, a ledger pointer, a case assertion. Never in body text, where it says nothing to a person reading the document.
  **Evidence claim**: the target's path with the source's own words, unchanged.
  **A line number is none of the three** — it drifts under every later edit.
  Why: a citation is read twice — a tool needs an address, a person needs a name — and whichever one is missing leaves that reader guessing.
- **Know the what and the why before you write** (write with the why): when updating or adding any normative text (prompts ∥ docs ∥ batch records ∥ ledger evidence), three things hold.
  **Know your basis first** — a source up front: the user's words / evidence / review; a cut with no ground leaves nothing to point at.
  **Carry the why** — beyond the requirement, state the cause / lesson / precedent, in plain reasoning.
  **The why's source is checkable** — the source is nameable; an improvised reason points at nothing.
  A normative sentence whose ground you cannot name is a rule nobody can check.
  **Keep it short**: the why said plainly and briefly — no decoration, no per-sentence justifications.
  **The unit that carries it is the entry, not the clause**: a top-level entry (a `- **…**` or `N. **…` line at column 0) carries one `Why` — one line, not a paragraph.
  Sub-items and continuation lines inherit their parent's why and write none of their own.
  **Touching a rule without its why is the gap**: add it in the same write and leave the rest of the entry as it stands — the why is for the skeleton of the rules, not for every clause; a prompt grown into a book of reasons loses the rules inside it.
- An assumed name in a sentence takes `<area>/<name>.md`.