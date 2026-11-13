Who may write what — identity decides, and a write outside your own section is refused:
- main agent (depth 0) — create / attach / close / supersede.
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

Every hit line names the file and the offending thing: the token for a dangling pointer, the paragraph's start line and its length, or the line and the token for a line-number anchor.

Document-check gate — every append and every edit runs it before the write, any section, depth-0 and sub-agent and design review alike; so does closing a record, or setting §1 to `已收口`.
- It judges the same three things `doc_check` judges — a paragraph over 300 characters, a line number used as an anchor, a dangling pointer — and nothing else.
- What it judges in a document depends on the moment. **Writing** (`append` / `edit`) judges the whole of what is being written — the candidate text, or the record view after the edit — and a hit anywhere in it refuses. **Closing** (`close` / `status → 已收口`) judges only **this batch's changed region**: the lines a `git diff` of the record's start snapshot against the working tree yields. Inside the region the three criteria apply as usual; outside it nothing comes out at all — no hit, no line, no reading — because a closeout measures what this batch did, not the old debt a document carries.
- A document with nothing to judge produces no line and is not counted in `范围 N 档` — the same disposition for every way it happens: this batch did not touch it, the changed region could not be derived, or the region came out empty. The closeout does not depend on whether the writer staged them: the closing arm itself runs `git add` on the documents it is about to judge — by path, never `git add -A`, so another seat's half-finished file does not enter the index — and only then takes the region. A file this batch created therefore has a changed region too, and inside that region the three criteria apply as usual. That is not a fallback to judging a file whole: a line outside the region still produces nothing.
- Which documents: `append` / `edit` judge the files this run has already touched plus the record itself (before it lands, the candidate text stands in for the record); `close` and `status → 已收口` judge those plus every document the batch committed, minus the record itself.
- The record itself is exempt from the dangling criterion, whole: §1–§6 may name a file that is not on disk, because "this file does not exist" is a finding a record has to be able to write down. The other two criteria apply to it at the moment it is written, like to any other document.
- A path this batch plans to create is exempt while the record is in flight — list it in the §2 machine-readable table (under `**受影响文件（机读清单）**`) and no document of this round is refused for naming it. The exemption ends when the record closes.
- A refusal throws with the gate named, the verdict line and every hit line; nothing is written. A pass receipt reads `[doc-check gate] DOC-CHECK GATE: PASS · 范围 N 档` — N = the documents actually judged (a document with nothing to judge is not one of them) — and a document that could not be judged is named (`不在盘，未判` / `读不到，未判`) rather than counted as clean.
- `ERROR` lets an append land but refuses a closeout — no `PASS` means not passed. With no `PROJECT-MANIFEST.json` the gate does not run.

Failures are hard and visible (no silent fallback): if a write is refused or fails, say so in your report — “§N not written”.