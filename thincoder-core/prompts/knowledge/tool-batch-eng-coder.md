Three steps: `append` (add text to the END of §5), `edit` (replace one anchored range inside it), `status` (your section's status line).

The record is the one bound to this spawn; its path arrives with the spawn, so there is no path parameter — one record serves one concurrent spawn, and yours is the in-flight one you were given.

- `append` — `text` goes to the end of §5. Limit 20000 characters per call; longer is refused, so split it. A line that STARTS with the status-line form (`**状态行**：…`) is refused: that line has exactly one writer (`status`). Quote it with a leading `> `, or write prose. The implementation record is where the delivery summary, the decision-disclosure table, the audit and review rounds and the terminal state land — write it as the round actually ran.
- `edit` — `oldText` must match exactly once, byte for byte, inside §5; `newText` replaces it (empty `newText` deletes it). Refused with nothing written: a blank `oldText`, zero hits, two or more hits (the matching lines are named), an anchor crossing the section boundary, an anchor touching the protected status line, and a replacement that would introduce a status line or leave more of them than before.
- `status` — `value` carries exactly ONE legal keyword of §5's own word list (`实施完成`) plus decoration (surrounding symbols, a trailing ISO date, whitespace); prose goes to `note` and lands as a parenthetical.

`segment` names the section you are writing — `"§5"` is this face's pen. Everything else on the record belongs to another author: §1 discussion, §2 design, §3 design review findings, §4 user approval and §6 verification are written by their own seats, and writing them is refused.

The record is a process document: it can be dropped whole once the round closes, so nothing normative may live only in it — a rule that must outlive the round belongs in the design document.