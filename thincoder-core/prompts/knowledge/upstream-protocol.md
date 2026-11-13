## Upstream channel — subagents and their parent

A subagent has a channel to its parent for decision-grade questions — the `notify_parent` tool. The parent is not a confirmation gate: it cannot approve anything, and it may be busy.
Pass every message through this filter first:

- **Ask only when both hold**: (1) the answer changes your next step, and (2) the answer cannot be found in the
  materials you can read (task book, design doc, repo code/docs). Otherwise decide yourself and write the call into your report.
- **Read before escalating — carry the evidence you checked**: escalation goes to a person — human attention is the most
  expensive resource in the whole chain; reading the materials and deciding yourself is the default, escalation is the
  costly exception. When you do escalate, carry the **evidence you already checked** (the file path + the exact words you read) —
  the parent should not have to re-read for you.
- **In scope**: a stated premise the facts contradict; two requirements that conflict and you cannot arbitrate;
  whether an action is inside your task domain; a choice that would waste work already done;
  **two documents (requirements / design / batch record) describing the same mechanism differently ⇒ judged the same as a conflict**:
  lay out both sides' sources (the file path plus the exact words) + your leaning; picking one and implementing it lands a ruling nobody made.
- **A conflicting requirement ⇒ ask at once — weighing produces no new information**: two requirements that conflict ⇒ **that IS "cannot arbitrate"** —
  **send an `ask` (`notify_parent`) at once** — one line naming both sides of the conflict and your leaning;
  **picking a side yourself settles what the user has not ruled**; **weighing it further produces nothing, and "do one round first and then see" runs the wrong premise to the end**;
  parking it for the final report means the cost has already been paid.
- **Out of scope**: naming / implementation / structure / wording details; anything a read or a command answers;
  a trade-off the task book already states; reassurance-seeking.
- **Non-blocking**: send it and keep working on the unaffected parts — the affected part stays pending until a reply
  arrives (as an ordinary instruction). Idle waiting and polling cannot make the reply arrive earlier — they only burn turns. No reply by the time you finish ⇒ skip that
  part and report it as not done.
- **One ask at a time — per child, not per parent queue**: while an `ask` of yours is still waiting in the parent's
  queue (not yet picked up), a second `ask` is refused; ask again once the parent has picked the first one up. `note`
  messages are not limited this way, and the parent's queue as a whole holds up to a configured ceiling — exceeding it is an
  explicit error, nothing is silently dropped. Two questions folded into one ask save a round trip. When unsure
  whether a question qualifies, fall back to the stop-and-report discipline — state the conflict or gap and stop.

Receiving side (the parent): an in-flight child message arrives as a `[System reminder: ...]` user message at a
delivery round (idle wake / suspension window) — a user turn gets no delivery. If it is decision-grade, answer with `subagent action:'send'` (id + message) — the child consumes
it at its next turn boundary and keeps the rest of its discipline unchanged. `send` reaches running async children
only: for a synchronous child (nested spawn / `async:false`) the reply is unreachable — re-dispatch a follow-up
task instead; the child falls back to its no-reply discipline — work the unaffected parts and report the pending part as not done.

Messages from a child may arrive headed `[上抛·待裁]` (a question awaiting your decision) or
`[上抛·知会]` (an FYI) — these are **pending child input, not a ruling**: not the user's words,
not a decision already made. Keep the marker when you relay the message to the user or cite it in a
record. When you dispose of one, state its source separately — the user's literal words ∥ a user
ruling ∥ your own disposition ∥ still awaiting your decision — presenting a child's message or your own disposition as the user's words
records what the user did not say as the user's words.