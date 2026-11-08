Batch-record lifecycle tool: a record has six sections, one author each. The author has two actions on that one section — `append` adds text at its end, `edit` rewrites its lines in place — and the section's status line has a single writer, `status`.

Writing a record is never silent: every write runs the document-check gate first and can be refused, and a refusal always leaves the file byte-for-byte unchanged (`Nothing was written.`).

- create (depth-0 only): write a new six-section skeleton record — `path` (where it lands), `topic` (the subject the header and the file name share), `source` (REQUIRED: the record's origin line), plus optional `ledger` / `board` that fill the record's `台账` header line at creation, and `date` / `prev` for the record date and its predecessor pointer.
  - `ledger:"#N"` takes over an existing row. Omitting it opens a new row — but only when no unsettled row exists on the same board; otherwise create is refused with the candidate list, and you pass `newDebt:"<why this is a new debt>"` or `ledger:"#<id>"`.
- attach (depth-0 only): hang a ledger row on an ALREADY EXISTING in-flight record — a reopened record taking on a new piece of work, where create cannot go (the file exists) and a settled row has no way back.
  - `title` is required and opens a new row (the row's own subject, never the batch's original one); or take over an unsettled one with `ledger:"#<id>"`. The real number lands at the end of the header `台账` list; the parenthesis group (board · trigger) stays where it is and is not rewritten — a parenthesis that must change is a plain document write.
  - Its ledger parameters are create's own, with the same meaning and the same same-face rule: `ledger` / `newDebt` / `board`. Replaying the same attach is zero-write once the number is in that list, and a settled row is never reopened here.
  - attach skips the dead-placeholder gate on purpose: a record whose header still carries `#<编号>` is already real on the ledger side, and attach is how that placeholder becomes a real number.
  - Refused with nothing written: the record is frozen (§1 `已收口` — reopen first, or start a new batch), its §1 status line is unreadable, the header has no `台账` line, a new row without `title`, or a face that already has unsettled rows with no `newDebt` reason.
- append: add `text` to the END of YOUR section — the lines already there are left byte-for-byte as they stand. A line that starts with the status-line form (`**状态行**：…`) is refused: that line has exactly one writer (`status`), and the tool channel may only make such lines fewer, never more. Quote it with a leading `> ` instead, or write it as prose.
- edit: replace one anchored range inside YOUR OWN section — `oldText` must match exactly once, byte for byte (line endings included), inside the section body; `newText` replaces that range, and an empty `newText` deletes it. Limit 20000 characters per call, the same cap append enforces. Refused with nothing written: a blank `oldText`, zero hits, two or more hits (the matching lines are named), an anchor crossing the section boundary, an anchor touching the section's **first** `**状态行**：` line, and any replacement that introduces a status line or leaves more of them than before. Deleting a surplus status line is allowed — that is the repair path for a section that reads as unset.
- status: update YOUR section's `**状态行**：` line. `value` must carry exactly ONE legal keyword of your section's own word list (the schema enumerates them) and nothing else but decoration — surrounding symbols, a trailing ISO date, whitespace; prose goes to the separate `note` field and lands as a parenthetical.
  - A section's status is read only when its header zone holds exactly one status line; with two or more it reads as unset and `status` refuses, naming the repair order (edit the surplus line away, then rewrite the remaining one; on §1 the main agent repairs it with an ordinary document write).
  - Writing §1 `已收口` closes the record and runs the closeout-chain gate: every section must carry content (§5 exempt) — the `不适用` declaration is retired, so any `> 不适用：§N` line in §1 is refused outright.
  - Reopening a frozen record = §1 → `进行中` with `note` = the reason: the tool rewrites the §1 status line and appends a `重开记录` line — no other existing line is touched.
- close (depth-0 only): freeze the record — §1 → `已收口 <date>`; every further write is refused except the reopen conjunction. It runs the same closeout-chain gate as status, so an incomplete chain is refused, naming the missing sections.
  - Closing also writes the ledger: this record's unsettled rows (task_book → this record, status `待讨论` / `待设计` / `在途`, trigger ≠ `认账不排期` — a policy call leaves its row untouched, and a row already `条件` is skipped with zero writes) get trigger → `条件`, with the resume sentence 「原批 <record> 已收口，须另起批次接手」 landing in resume_when (a non-empty resume_when keeps its value — the sentence is appended to evidence instead).
  - Each changed / skipped row is named in a `[ledger reanchor]` receipt block; a ledger write failure (busy store, no derivable project root) is named there too and never blocks the freeze.

Who may write what — identity decides, and a write outside your own section is refused:
- main agent (depth 0) — create / attach / close.
- append / status domains are mode-dependent: engineering — append §1/§4/§6, status §1; normal — append §1/§2/§4/§5/§6, status §1/§2/§5 (the main agent holds the designer and implementer seats there).
- edit reads the same whitelist as append — one table, two actions: the section you may append to is the section you may rewrite in place. Depth-0 gains §2 and §5 on edit in normal mode.
- eng-designer — §2; eng-coder — §5; a normal-mode coder bound via `batchDoc` — §5; design review (review binding) — §3.

Skeleton placeholders are dead literals in the record header's structural lines — `#<编号>` / `<板块>` and the older `<BATCH-ID>` / `<讨论来源>`. They block append / edit / status until they are filled:
- create with ledger / board fills them at creation.
- On an in-flight record that still carries them, attach fills the number.
- Otherwise the main agent fills the header by file edit (citing these literals in a section's prose is fine — only the header is checked).
- `<§N 模板占位：…>` template lines are legal and never blocked.

Target record:
- Sub-agents and design reviews have NO path parameter in practice — the record arrives via the spawn binding or the review instance key, and passing `path` is refused.
- Depth-0 MAY pass `path` on any action (a value passed must be readable); omitting it picks the unique in-flight record (0 or ≥2 in flight ⇒ refused — pass `path`).

§3 has its own rules:
- A §3 append must carry exactly one verdict on its own line — `VERDICT: pass` or `VERDICT: changes-required`; the localized whole-line forms count too (`结论：通过` / `结论：不通过`, and their 需修改 variants, with an optional trailing 。). A §3 write that reads as no verdict line, or as both at once, is refused with nothing written — no round number is consumed, so resend the same text with the verdict line added.
- A design review's §3 append carries the round's conclusion table — one row per finding (`#` / severity / status / evidence) — plus the VERDICT line and the counts. An evidence cell holds a pointer: a section number, a symbol name, or the exact words of the line — never a line number; the report's own paragraphs stay out of the record.
- A design review's append is stamped by the tool with a `### 轮次 N（评审子代理）` heading — N is tool-counted; do not write your own heading (it would be dropped).

Document-check gate — every append and every edit runs it before the write, any section, depth-0 and sub-agent and design review alike; so does closing a record, or setting §1 to `已收口`.
- `append` judges the text you are appending, the change region of the markdown files already touched in this run, and the record itself — only the first two can refuse the write.
- `edit` judges the paragraph / line-length classes on the `newText` you pass, and the anchor classes (`档缺` / `节缺` / `引缺`) on the whole record as it will stand after your edit — so a dead citation anywhere in the record refuses an unrelated edit, and replacing that very line is the way through.
- A hit in a touched file but outside its change region is earlier debt: the receipt prints one count line and the write goes through. A hit in a section that has already landed is named with its section and author and never blocks the write — the close face is where it is enforced.
- An append receipt reads `[doc-check gate] DOC-CHECK GATE: PASS · 范围 N 档` — N = the documents actually judged, the record itself always one of them. `ERROR` lets an append land but refuses a closeout; with no `PROJECT-MANIFEST.json` the gate does not run and the receipt says so.

Failures are hard and visible (no silent fallback): if a write is refused or fails, say so in your report — “§N not written”.