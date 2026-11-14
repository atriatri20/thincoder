Three steps: `append` (add text to the END of §2), `edit` (replace one anchored range inside it), `status` (your section's status line).

The record is the one bound to this spawn; its path arrives with the spawn, so there is no path parameter — one record serves one concurrent spawn, and yours is the in-flight one you were given.

- `append` — `text` goes to the end of §2. Limit 20000 characters per call; longer is refused, so split it. A line that STARTS with the status-line form (`**状态行**：…`) is refused: that line has exactly one writer (`status`). Quote it with a leading `> `, or write prose.
- `edit` — `oldText` must match exactly once, byte for byte, inside §2; `newText` replaces it (empty `newText` deletes it). Refused with nothing written: a blank `oldText`, zero hits, two or more hits (the matching lines are named), an anchor crossing the section boundary, an anchor touching the protected status line, and a replacement that would introduce a status line or leave more of them than before.
- `status` — `value` carries exactly ONE legal keyword of §2's own word list (`设计完成`) plus decoration (surrounding symbols, a trailing ISO date, whitespace); prose goes to `note` and lands as a parenthetical. Reading a section's status needs exactly one status line in its header zone — with two or more it reads as unset and `status` refuses, naming the repair order.

`segment` names the section you are writing — `"§2"` is this face's pen. Everything else on the record belongs to another author: §1 discussion, §3 design review findings, §4 user approval, §5 implementation record and §6 verification are written by their own seats, and writing them is refused.

The record is a process document: it can be dropped whole once the round closes, so nothing normative may live only in it.