aliases: 文档检查, 文档校验, 交付门
`mode` says what the call is for, and the two modes judge **different ranges** and sit differently on the index.

- `report` is read-only: it writes no document and no index entry, asks for no approval, and is safe to run beside other calls.
- `gate` writes no document either, but with a batch record bound to it, it stages the documents it was given before judging (`git add` by path, never `git add -A`) — a document this batch created and never staged has no changed region otherwise.
- With no batch record bound, `gate` has no changed region to take: it judges nothing, and the index is not touched either.

`report` is the diagnostic face and judges each document **whole**. `gate` is the delivery verdict and judges only **this batch's changed region** inside each document. Both judge the same three things and print the same sentences.

This tool stands where the reading happens: the documents are already on disk, so it judges them at that moment. A batch record is a record of a past round read back after the fact — this tool judges nothing in it, and writing it is where it does get judged.

Parameters:
- `target` (required): the base root. Relative `docs` entries resolve against it, and a document belonging to no project falls back to it. Each document is judged against its own project root — the nearest ancestor holding `PROJECT-MANIFEST.json`. A relative target matching several directories is refused as ambiguous; a workspace holding several projects is refused with the candidates named — pass the project root.
- `mode`: `report` (default) — the diagnostic face, every named document judged whole; or `gate` — the delivery verdict, only this batch's changed region inside each named document judged, so a pre-existing dangling pointer outside the region is not reported.
- `docs`: the documents to judge, relative to `target` or absolute. In `report` mode each is judged whole — a pre-existing dangling pointer in a document you touch is reported too. In `gate` mode only the changed region is judged; the region is what a `git diff` of the bound batch record's start snapshot against the working tree yields, and a document with no changed lines has nothing to judge. Required in `report` mode: a bare string, an empty list and a missing list are all refused — nothing is scanned unless you name it. In `gate` mode, omitting it means the Markdown documents this session wrote; a session that wrote no `.md` gets `ERROR（0 档受检——本轮没有碰过 .md）`. A `gate` call with no batch record bound to it has no "this batch" to take a region from, so it judges nothing and prints the bare `PASS` line.

Misuse:
- Do not wire `report` mode as a gate or a CI step — that is what `mode:"gate"` is for.
- A line number is never a pointer: write the section name or a symbol name instead.
- Never treat a finding as a reason to refuse an instruction: an explicit go-ahead is carried out, with the hits written into it.

Use it when you write or revise a project's documents. It is not a reader: use `doc_search` / `read` to read documents and `grep` to search them.

What it checks — three things, nothing else:

- **A paragraph too long** — one paragraph over 300 characters. A paragraph is a run of adjacent non-blank body lines; headings, tables, lists, quote lines and code blocks break it and do not count into it. Whole table, list and code blocks are excluded, including list continuation lines, tables without outer pipes and code blocks indented by four spaces or a tab. A file under `thincoder-core/prompts/` is judged line by line instead, because there a newline is layout, not a paragraph break; table, list and code blocks remain excluded. 300 is a constant: no project setting changes it, and changing it is a code change.
- **A line number used as an anchor** — a file name followed by `:` and digits. One line inserted above shifts every number below it, so whoever follows the number lands on something else.
- **A dangling pointer** — a file name written in the text that cannot be found inside the repository. A name carrying a directory segment is looked up once at the project root: it passes when that path is on disk, or when any file in the repository ends with that whole token; it is reported only when neither holds. Several files of the same name all count as present — the check asks whether the thing is there, not whether it is unique. A bare name (no directory segment) has no place to look, so this check does not judge it; a bare name can still be a hit for the line-number rule above.

Four cases are not reported at all — none of them is an error:

- **Outside this repository** — a name starting with `../`, a name starting with `/` (an absolute path), or a path whose first segment is a sibling directory that is itself a project. The check does not know what other repositories hold, so it says nothing about them: not a hit, not a count, not a warning. A wrong outside path therefore stays invisible, and the fix is to write the path in full — not to make the check guess.
- **A file this batch intends to create** — a name listed in the §2 machine-readable list of an in-flight batch record. A design document has to be able to name the file it is about to create, and that file cannot be on disk yet.

  - **How to get a path onto that list**: the record's §2 机读清单 is a block headed `**受影响文件（机读清单）**`, then a three-column table (header `| 档 | 分拆方案 | 行数 |`, one row per path in the first column). The batch skeleton's §2 placeholder shows the exact form.
  - Write the path the way the document will write it: root-relative with `/` separators. A leading `./` is ignored; case is ignored on Windows.
  - The list is built once per project root from every record in the batch directory that is a batch record and is not closed (`doc-check/existence.mjs`, `plannedPathsOf`) — no registry to maintain, no comment syntax to get right.
  - The exemption lasts exactly as long as that record: its §1 status line is not `已收口`.
  - Once the record closes, the same path goes straight back to "not found ⇒ reported", so nothing needs cleaning up. A path that never gets created is reported the round the record closes — while someone can still act on it.

- **A batch record, whole** — a document under `docRoot.batches` is not judged by this tool at all, §1 through §6 alike, and it is not counted as a judged document either (`checkFiles` leaves it out). A batch record is an execution record that can be dropped whole, not a map: nobody follows its §2 to look a file up. Two moments are kept apart here — while an engineering-mode record is being written (`batch`'s `append` ∥ `edit`, and the gate before any `.md` lands), a paragraph over 300 characters and a line number used as an anchor are still refused, while a name that cannot be found is not; normal-mode content writes are not refused by this check. Once the round is over and the record is read back, that paragraph and that anchor measure the distance between the record and today's tree rather than a defect, so nothing in it is judged. Judging the whole record here would also keep "this file does not exist" from ever being written down. A project that declares no batch face (`docRoot.batches` is `null`) has nothing to exempt.

- **A document its project declares excluded** — a project may name path prefixes in `index.docCheckExcludePaths` of its manifest; a document under one of those prefixes is not judged at all (none of the three things), produces no line, and is not counted as a judged document either (`checkFiles` leaves it out). The two moments do not divide here: an excluded document is out of the domain whether it is being written or read. A project that declares nothing, or whose manifest cannot be read, excludes nothing — every named document is judged.

Receipt — the first line is the machine verdict, then one plain sentence per hit:

```text
DOC-CHECK GATE: PASS
```

```text
DOC-CHECK GATE: REFUSED
docs/x/y.md 这个档不存在
docs/x/y.md 第 3 段 412 字，超过 300
docs/x/y.md 第 12 行的 foo.md:120 用行号做锚，行号会漂
```

No hit ⇒ `PASS` and not one further line. Any hit ⇒ `REFUSED` first, then every hit on its own line — none dropped, no statistics line added.

In `gate` mode the range is this batch's changed region, so a line outside it produces nothing at all: not a hit, not a name, not a note, and the document is not counted as judged either.

Before taking that region, `gate` stages the documents named in the call — `git add` by path, never `git add -A`, so another seat's half-finished file does not enter the index.

That is what gives a document this batch created a changed region at all: an unstaged file does not show up in the diff, so the gate stages it and judges it. `report` never touches the index.

Nothing to judge and nothing judged read the same on purpose — a document this batch did not touch has no work for anyone to do, and every extra sentence only sends the reader guessing.

A document that was not judged says so and counts as neither a hit nor clean (`… 不在盘，未判` / `… 读不到，未判`): a `PASS` over nothing judged would read as "all checked, all clean".

A batch record is out of the judged set, so it gets no such line: a call naming only batch records prints `DOC-CHECK GATE: PASS` and nothing else — that means there was nothing else to judge, not that anything was verified.