aliases: 查文档, 先查文档, 资料查找
## Check the docs before you ask or answer
**Before you ask anything or answer anyone**, look for the answer in the docs — `doc_search` ∥ requirement docs ∥ design docs ∥ code ∥ the project map.
**"The user never said" is not "nothing is written down"**: a convention already settled gets ruled on again, and the same rule ends up in two versions on disk.
If the docs already hold the answer, asking again spends the most expensive attention in the chain.
**Ask only when it changes what you do next**: a question the docs already answer changes nothing — it only spends attention.
**Why**: the docs are **where questions already asked and answered are written down**. Asking again makes the human **answer the same thing twice**.
**A doc answers facts; intent gets asked**: what the docs can settle is a **fact** — what exists, what the code does, what was ruled before.
**Intent · rules · trade-offs** are the user's to state and must be asked: no document holds them, and a rule nobody asked for is a rule the user has not given — so the work built on it gets redone.
Once the user has stated one, it is a fact like any other — asking again spends the attention the first look was meant to save.
**The line holds while the requirement is being formed**; once work is under way, the in-flight ask still steers with a workable default drawn from what the user already confirmed.
**Applies to both**: the main session asking the user, and a subagent asking its parent.
**Carry the checked-evidence line when you ask** — both directions follow this.
**The checked-evidence line** = which docs / design precedents were checked: the file path plus the key text, copied verbatim from what you read this turn.
A pointer alone leaves "I checked it" and "I remember it" reading the same.
Where the check found nothing relevant, write "checked, nothing relevant" and name the surface you checked — a query that missed and a surface with nothing on it otherwise read the same.
**The checked-evidence line and the survey-evidence line share one shape** — both record "what was checked"; the setting differs: one in a question, one in a doc.
**A claimed basis is written with its quotation** — `依据 <repo path>「<the exact words from that file>」`; the quotation must
exist character for character in the file named, or the line is not evidence at all. A paraphrase, an abbreviation and a line recalled
from memory read the same from outside — the quotation is what makes the claim checkable, and it is what a machine check reads.
The keyword and the quotes keep that literal Chinese form even inside an English text (the check reads them verbatim). Example
(the fence keeps the sample out of the check — a teaching line is not a claim):

```text
依据 docs/<area>/<file>.md「<the exact words from that file>」
```

## Check the docs before you act
**Before you act, look at how this thing already works**: the interfaces, the conventions, the decisions made earlier. The user's words say what is wanted; the docs and the code say how it currently works.
**Why — you only ever see a part**: one session finishes one step of a large task, and what is in front of you — this conversation, the files you opened — is a fraction of what the project already knows. The docs and the code are how the rest reaches you.
**A part taken for the whole**: acting on what you can see alone treats a piece as the whole. Every reading may be right about its own piece and still wrong about the whole.
**Why nothing warns you**: no conflict, no unclear point — so nothing flags it. The mismatch shows up later, as a diff against a document nobody opened.
**Why it costs**: the code records what is; the reasons and the consequences live in the docs. A decision may have carried a requirement no test covers — changed blind, what it protected is gone, and nothing reports it.
**When the docs are silent**: go ahead, and say what you looked at — what you searched, which doc you opened, which code you read. Checked and found nothing is itself a result worth stating.
**Bounds**: the instruction-precedence ladder stays as it is — that one governs conflict, this one governs the look before acting; the check is narrow — whether the how of this work is already written, not a long survey before every move.