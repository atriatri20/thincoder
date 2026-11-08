Batch-record lifecycle tool (一段一作者 — six sections, one author each; the author has two actions on that one section: append adds text at its end, edit rewrites its lines in place; the section's status line has a single writer, `status`).

actions: create (depth-0 only — write a new six-section skeleton record; pass path + topic + source, plus optional ledger / board that fill the record's 台账 header line at creation;

ledger:"#N" takes over an existing row, and omitting ledger opens a new row only when no unsettled row exists on the same board — otherwise create is refused with the candidate list and you pass newDebt:"<why this is a new debt>" or ledger:"#<id>")

· attach (depth-0 only — hang a ledger row on an ALREADY EXISTING in-flight record: a reopened record that takes on a new piece of work, where create cannot go (the file exists) and a settled row has no way back)

attach opens a new row (title required — the row's own subject, never the batch's original one) or takes over an unsettled one with ledger:"#<id>"; the real number lands at the end of the header 台账 list, and the parenthesis group (board · trigger) stays where it is.

Its ledger parameters are create's own, with the same meaning and the same same-face rule: `ledger` (take over a row) / `newDebt` (why this is a new debt) / `board` (the row's face and kind). Only `title` is attach's own.

That `board` does not rewrite the header's parenthesis group: on attach the group keeps its text and only the number list grows — a parenthesis that must change is a plain document write.

Replaying the same attach is zero-write when the number is already in that list. A settled row is never reopened by this action.

attach skips the dead-placeholder gate on purpose: a record whose header still carries `#<编号>` is already real on the ledger side, and attach is exactly the way to replace that placeholder with a real number — after which edit opens.

Refused with nothing written: the record is frozen (§1 已收口 — reopen first, or start a new batch), its §1 status line is unreadable, the header has no 台账 line, opening a new row without title, or a face that already has unsettled rows with no newDebt reason.

· append (add text to the END of YOUR section — the lines already there are left byte-for-byte as they stand)

A §3 append must carry exactly one verdict on its own line — `VERDICT: pass` or `VERDICT: changes-required`; the localized whole-line forms count too (`结论：通过` / `结论：不通过`, and their 需修改 variants), and the Chinese forms take an optional trailing 。.

A §3 write that reads as no verdict line, or as both lines at once, is refused with nothing written — no round number is consumed, so resend the same text with the verdict line added.

A line that starts with the status-line form (`**状态行**：…`) is refused: that line has exactly one writer (`status`), and the tool channel may only make such lines fewer, never more. Quote it with a leading `> ` instead, or write it as prose.

A design review's §3 append carries the round's conclusion table — one row per finding (`#` / severity / status / evidence) — plus the VERDICT line and the counts.

An evidence cell holds a pointer: a section number, a symbol name, or the exact words of the line — never a line number; the report's own paragraphs stay out of the record.


· edit — replace one anchored range inside YOUR OWN section (any section you may append to; your identity decides which)

oldText must match exactly once, byte for byte (line endings included), inside the section body; newText replaces that range, and an empty newText deletes it. Limit 20000 characters per call, the same cap append enforces.

Refused with nothing written: a blank oldText, zero hits, two or more hits (the matching lines are named), and an anchor crossing the section boundary.

A section has one PROTECTED status line — the first `**状态行**：` line of its header zone; an anchor touching it is refused (that line has one writer: `status`). Deleting a status line elsewhere is allowed, e.g. a surplus copy in the same zone.

Refused too: a newText that introduces a `**状态行**：` line, and any edit that would leave MORE status lines in the header zone than before (deleting the sub-heading that fences a body line off would promote it).

On §3 an incoming `### 轮次 N（评审子代理）` line is dropped from newText — the round stamp is tool-generated only.

Two gates hang on `append` alone and do not apply to `edit`: the §5 ordering gate (an edit needs an existing anchor, so it cannot write what does not exist yet) and the §3 verdict line (that gate reads the block you append; rewriting words inside an existing block changes no machine criterion).


· status (update YOUR section's `**状态行**：` line — the value must carry exactly ONE legal keyword of your section's STATUS_WORDS entry, decorated only by surrounding symbols / a trailing ISO date / whitespace).

Prose goes to the separate `note` field, which lands as a parenthetical.

A section's status is read only when its header zone holds exactly one status line; with two or more it reads as unset, and `status` refuses with the repair order.

The repair order: first `edit` the surplus line away (an empty newText), then `status` rewrites the remaining one. On §1 that order is unavailable — the main agent repairs it with an ordinary document write.

A §3 pass round sets that section's status line in the same write — `status` on §3 is an optional rewrite, never a required step.

Writing §1 已收口 closes the record and runs the closeout-chain gate: every section must carry content (§5 exempt) — the `不适用` declaration is retired, so any `> 不适用：§N` line in §1 is refused outright.

Reopening a frozen record = §1 → 进行中 with `note` = the reason: the tool rewrites the §1 status line and appends a 「重开记录」 line — no other existing line is touched.

· close (depth-0 only — freeze the record: §1 → 「已收口 <date>」, every further write is refused except the reopen conjunction; runs the same closeout-chain gate as status — an incomplete chain is refused, naming the missing sections).

Closing a record — the close action, or status writing §1 已收口 — also writes the ledger: this record's unsettled rows (task_book → this record, status 待讨论 / 待设计 / 在途, trigger ≠ 认账不排期 — a policy call leaves its row untouched, and a row already 条件 is skipped with zero writes) get trigger → 条件,

with the resume sentence 「原批 <record> 已收口，须另起批次接手」 landing in resume_when (a non-empty resume_when keeps its value — the sentence is appended to evidence instead);

each changed / skipped row is named in a `[ledger reanchor]` receipt block (a ledger write failure — busy store / no derivable project root — is named there too and never blocks the freeze).

Identity fixes what you may write (段白名单): main agent (depth 0) — create/attach/close;

append/status domains are mode-dependent: engineering — append §1/§4/§6, status §1; normal — append §1/§2/§4/§5/§6, status §1/§2/§5 (the main agent holds the designer seat and records direct implementation);

edit reads the same whitelist as append — one table, two actions: the section you may append to is the section you may rewrite in place. Depth-0 gains §2 and §5 on edit in normal mode for the reason it gains them on append (the main agent holds the designer and implementer seats).

eng-designer — §2; eng-coder — §5; a normal-mode coder bound via batchDoc — §5; design review (review binding) — §3.

A write outside your own section is refused.

Skeleton placeholders (dead literals — `#<编号>` / `<板块>` and the older `<BATCH-ID>` / `<讨论来源>`) in the record header's structural lines block append/edit/status until filled:

create with ledger / board fills them at creation; on an in-flight record that still carries them, attach fills the number (and clears it); otherwise the main agent fills the header by file edit (citing these literals in a section's prose is fine — only the header is checked);

`<§N 模板占位：…>` template lines are legal and never blocked.

Target record: sub-agents and design reviews have NO path parameter in practice — the record arrives via the spawn binding / the review instance key (passing path is refused).

Depth-0 MAY pass path on create / attach / append / edit / status / close (若传则须可读); omitting it picks the unique in-flight record (0 or ≥2 in flight ⇒ refuse — pass path).

A design review's append is stamped by the tool with a `### 轮次 N（评审子代理）` heading — N is tool-counted; do not write your own heading (it would be dropped).

Credential values are stripped mechanically before writing (never write a token or designId value).

Document-check gate: every append and every edit runs it before the write — any section (§1–§6), depth-0 and sub-agent and design review alike — and so does closing a record (or setting §1 to 已收口).

On `edit` the judged set splits by hit class: paragraph / line length is judged on the newText you pass; the anchor classes (档缺 / 节缺 / 引缺) are judged on the whole record as it will stand after your edit.

A dead citation anywhere in the record therefore refuses an unrelated edit — and replacing that very line is the way through, which is why the record is judged as it will stand, not as it sits.
- Examples — sample rows, commands, paths — go in a fenced block, which the anchor and paragraph criteria skip whole; a path left in prose or a table must be a real file — a made-up one is judged `档缺`. An assumed name in a sentence takes `<area>/<name>.md`.
- **Doc names: any form that resolves — a bare name is fine while the name is unique.** A token resolving to nothing is judged `档缺` and refused; the named path is a hint, not a pass. A bare name goes red the day a `same name` file appears — then write the distinguishing form.

On append it judges three things: the text you are appending now, the change region of the markdown files already touched in this run, and the record itself — only the first two can refuse the write.

A hit in the text you are appending or inside the change region of a touched file ⇒ REFUSED: nothing lands, the record's bytes stay unchanged (do not close a record after a refused append).

A hit in a touched file that sits outside its change region is debt an earlier round left there: the receipt prints one count line for it and the write goes through — the close face judges the whole file and lists every one.

A hit in a section that has already landed is named in the receipt with its section number and author and never blocks the write — another author's landed lines cannot be rewritten here; the close face is where it is enforced.

On close (and on status writing §1 已收口) every hit in the range refuses, each one named as `§N（作者：…）` when it sits inside the record.

An append receipt reads `[doc-check gate] DOC-CHECK GATE: PASS · 范围 N 档` — N = the documents actually judged, the record itself always one of them.

ERROR ⇒ a closeout is refused while an append still lands with an ERROR receipt line;

no PROJECT-MANIFEST.json ⇒ the gate does not run and the receipt says so.

Failures are hard and visible (no silent fallback): if a write is refused or fails, say so in your report — “§× 未写入”.