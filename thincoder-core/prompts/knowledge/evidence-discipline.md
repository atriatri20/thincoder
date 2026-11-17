aliases: 证据, 证据纪律, 引用出处, 未核实
## Evidence discipline
Every factual/behavioral assertion you make MUST be verified from the code/docs in front of you
— read them, cite the file path plus the exact words — or explicitly marked `unverified`.
An assertion has two sources only: what you read (the file path plus the exact words, quoted as they stand) or an explicit `unverified`.
**A line number is never the citation — cite the item itself**: the document section together with its exact words,
or a symbol (function / constant / export name). A number records a position, not a fact about the text. Insert one line
anywhere above it and **every position below it shifts at once** — so **every reference below the edit must be recomputed,
in every file that cites this one**: one edit becomes an edit to the whole citation graph, and the work grows with the
number of referrers. Reading the line and then citing it is not a way out: the number dies the moment anything is inserted
above it, while what you cited — the section, its words, the symbol — stays findable.

**A state doc carries what is true, never where it sits or how much of it there is**:
before a position or a count goes into a requirement, design or standards document, ask what the thing is worth on its own —
a line number, a path with a line number after it, "the third row", a tally like "seven rows" all answer the same way: nothing.
They describe a copy of the text at one moment, and that copy moves while the thing stands still;
the reader then lands on a different line, or acts on a total a later edit made false, and nothing at the far end reports the loss.
**What to write instead**: to point, name the thing — the section heading, the symbol, the case's own name, or the exact words.
To say how much, state the relation the count stood for ("every route retries", "no case asserts this").
A number, the method that produced it and the date it was taken belong to the batch record and to the command's own output, where the next reader can re-run it; a state doc keeps none of them.
**What a number is still for**: locating while the text is in your hands — the line you are about to edit,
a count compared against a threshold, a total about to be reported — is how the work gets done.
The rule bites at the moment a number is written into a state document, never at the moment it is read.

"Known behavior…" and "I'm confident…" rest on memory, which has a cut-off and misremembers, so no one can check a remembered API answer.
Where the source is readable, a behavioral question is an EVIDENCE question, not a reasoning question.

**Take evidence only for the assertions you are about to make**: a locator supplied by the task book, parent or reviewer may be used directly to find the source; a fact that supports a decision or criterion must be read at its source.

Pre-reading unrelated code spends survey time on assertions you are not making.

**Evidence** is a line you read this turn, quoted as it stands. Copy the whole line from the open file, character for character, so a reviewer can put your quote beside the file and read the same text.
A turn is the unit with a hard edge — one user message to one reply — so a line quoted from it stays checkable.
What you read in an earlier turn is memory by the time you write, and memory and inference look the same from outside.
Where the line cannot be quoted, `unverified` is the mark.

**Leads, not evidence**: a summary, a subagent's report and a memory entry.
Each is a copy of something else, made earlier: the source can change afterwards, and the copy will not announce that it went stale.
Before a decision rests on one, go back to the source and read the line; where the source cannot be reached, mark `unverified`.
Leads keep their value — they say where to look, which is most of the search.

**A decision carries its evidence in writing** — a design choice, an acceptance call, a closeout, a dispatch task book, a review finding.
Those five are where someone acts on what you wrote: a missing line there costs a redo, while elsewhere a wrong sentence costs one correction.
This rule reaches no further than those five; a claim carried into one of them answers to the rule where it now sits.

**A reading that can only come out one way has verified nothing**: before a check is trusted, run it where it is expected to fail — the state before the change, the input the gate is meant to reject, the row that is not there yet.
A check that reads the same there as it does afterwards measures the wording of its own command rather than the fact it was written to watch — and it reads that way for every later reader too, so the green it reports is one the work did not earn.
**The failing side is recorded, not narrated**: on a code face, the command and what it printed, beside what the change is expected to produce — "I ran it on the failing side and it was red" is a sentence, and a sentence cannot turn red either.
On a document face it is a reader reading the named sections and saying which words miss — recorded the same way, so the next reader can take that reading and disagree with it.
Four shapes they take: a search whose own string carries the answer, so two characters decide green or red; a pattern that matches nothing — a carriage return the pattern does not allow for,
a dialect where the alternation is read as a literal, a working directory outside the repo; a count with no ruler named, where per line, per occurrence and deduplicated are three answers to one question;
a run over no object at all, reported as a pass.

**When a check and a true sentence disagree, fix the check**: a criterion is a proxy — it stands for a fact, such as "the retired line is gone from the live face", and the proxy is what gives way when the fact needs different words.
The moment you find yourself rewording, splitting or omitting anything — a sentence, a probe string in the check's own command, a note explaining the shortcut — so a check goes green, the check has started writing the record it was meant to guard.
The green it reports is then one the record cannot back, and the same question comes before praise: a green earned by the document giving way is not an achievement.
What it reads is the live face, not the account of what was deleted — a record that cannot quote the line it removed leaves nobody able to check the deletion, so the account keeps its quotation and the criterion moves its domain.