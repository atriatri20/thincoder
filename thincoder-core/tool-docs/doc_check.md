Check a project's documents for documentation-discipline findings and report them.

Read-only: it writes nothing, asks for no approval, and is safe to run beside other calls.

Two modes:
- `report` (default) — a non-gating report. It never blocks, never sets an exit code, and its output is never a reason to refuse a task or a user instruction.
- `gate` — the delivery gate, for the end of a design or development round. Every listed document is judged **whole**: a pre-existing dangling pointer or an overlong paragraph anywhere in it counts, not only this round's lines.

Parameters:
- `target` (required): the declared root for this call. Each document is judged against its own project root (the nearest ancestor holding `PROJECT-MANIFEST.json`); `target` supplies only the base for relative `docs` entries. Omitting it is refused. A plain directory or a multi-project workspace is a legal value, judged as given; only a relative target that matches several existing directories is refused as ambiguous.
- `mode`: `report` (default) or `gate`.
- `docs`: the documents to judge, as paths relative to the project root or absolute. Required in `report` mode — there is no default range: omitting it, or passing an empty list, is refused rather than widened. In `gate` mode, omitting it means the Markdown documents this session wrote. A path that is not on disk or is not a Markdown document is an error in `report` mode; in `gate` mode such paths are listed as skipped.
- `lines` (`report` mode only): the files to measure — one content-line count each, source files, unit-test files and Markdown files alike. Source and unit-test files carry a size-tier mark once they pass a threshold (the soft line asks for a review, the hard line means split); Markdown files report a number only. This is a reading, not a criterion: it never enters the hit count and never moves the verdict. `gate` refuses `lines` outright rather than ignoring it, so you cannot believe a file was measured when it was not.

What it checks: three criteria, with built-in thresholds that no project declaration changes:
- **Anchors** — a documentation pointer must resolve. Four hit classes, all counted into one `锚` total (no separate verdict word): `档缺` (the file is not on disk), `节缺` (the section indicator matches no heading in the target), `引缺` (the line claims its own basis as `依据 <path>「<quotation>」` and the quotation is not a contiguous substring of that file), and `环引` (the repos this project declares cycle back to the group root - a repo-level finding, reported against the declaration file itself, with no line number).

  A pointer is a token whose suffix is on the extension list, plus a shape split. A path-shaped token (one carrying a `/`) counts on that suffix alone.

  A bare name counts only when its suffix is a document-name extension (`md`, `markdown`). A bare name whose suffix is only a code extension is prose mention - not resolved, not judged; write it with its directory to have it judged.

  The list = the built-in `DEFAULT_DOC_EXTS` united with `index.docCheckExts` (add-only, never a replacement; a single-character suffix or an archive inner layer never takes effect). A project writing that key gets one reading line in `report` mode.

  Two optional engine inputs narrow what counts as this write's own hits, and this tool passes neither.

  `texts` (a document's full new text) replaces the file read; `zones` (per-document line ranges) makes only hits inside those ranges block, listing the rest as a stock reading.

  With both absent, every listed document is judged whole - which is what `doc_check` always does.

  A pointer resolves through these legs, in this order:

  - the project root (full path);
  - the pointing document's own directory;
  - a repo this project declares under `index.publicRepos` (first segment = that repo's directory name);
  - the unique-suffix fallback, reached only when the legs above find nothing - exactly one file in the repo whose path ends with the whole token.

  A bare name resolves through the last-resort unique-suffix leg: while exactly one file in the repo carries that name it resolves and passes; with two or more, or none, it is judged 档缺.

  A pointer whose referring document and whose target both sit under a `docRoot.batches` root is not judged - `report` mode counts them as a reading and they never enter a verdict; a spec document pointing at the batch face is still judged.
- **Paragraph length** — adjacent non-blank body lines merge into one paragraph and are judged as a whole; blank lines, table rows, headings, list items, quote-block lines and fenced code blocks do not count into a paragraph and break it. A prompt-face file is judged line by line instead, with no structural exemption. No face is exempt: a tool-description file, this one included, is judged too.
- **Line-number coordinates** — a filename token followed by `:` and digits is a hit. Both modes collect them: `report` prints the inventory (a measure line, the totals, one line per hit) and `gate` counts the body-face ones into its total and names them in the REFUSED line as `行号坐标 N 处`. A coordinate inside a fenced block is a reading, never a hit.

Gate receipt — the first line is the machine-readable verdict, and consumers judge by that prefix:
- `DOC-CHECK GATE: PASS` — every listed document is clean, or every listed document sits inside the manifest's `index.docCheckExcludePaths` face: those are exempt, not judged, and the receipt names them in the exclusion bucket.
- `DOC-CHECK GATE: REFUSED（命中 K 条）` — K hits; fix them in the same round. K counts only hits **not** registered as adjudicated false positives.
- `DOC-CHECK GATE: ERROR（reason）` — nothing was judged, so neither `PASS` nor `REFUSED` was produced. Fail-closed: no `PASS` means not passed.

**Adjudicated false positives (the third bucket)** - a hit you have ruled a false positive, and whose document should stand, is registered in the manifest's `index.docCheckExemptions` (an array, read per project root).

One entry = five fields, all required: `file` (project-root-relative) · `kind` (hit class) · `text` (hit text) · `why` (the ruling and its basis) · `review` (when to re-examine).

A registered hit still appears in every receipt under `豁免 N 条（已裁定假阳，不阻断交付）：`, listing all four items, and it no longer blocks the gate.

- Matched on `file` + `kind` + `text` verbatim, never on a line number: inserting a line above the hit does not void the entry; editing the hit text does, and the hit blocks again. Deleting the entry puts the hit back in the blocking count - nothing is memoised.
- An entry missing a field, or carrying a `kind` outside the closed set, does not apply: the hit still blocks and the receipt names it (`豁免登记无效 N 条`). An entry matching no hit is reported as `登记未命中 N 条（原文已变或已不在判集，复核后删）`.
- Never a class rule: a directory, a prefix or a wildcard does not count. Keeping a whole region unjudged is the exclusion face's job - "not looked at", against "looked at, ruled, not blocking". The two are not interchangeable.

`ERROR` is what you get for three things:
- a document that is on disk but cannot be read — a file the check could not read is not a clean file.
- a range that judges no document at all: an empty `docs` list, a round that wrote no `.md`, a list whose paths are all off disk.
  A list whose documents all sit inside the manifest's `index.docCheckExcludePaths` face is not this case: those documents are exempt from judging, and the first line is still `DOC-CHECK GATE: PASS`.
- a rootless call (`无法定根`), where every document is named with its reason and no hit line is printed.

In each case, pass explicit `docs` and re-run.

Misuse:
- Do not wire `report` mode as a gate or a CI step — that is what `mode:"gate"` is for.
- Never treat a finding as a reason to refuse an instruction: a machine check never outranks a user instruction. An explicit go-ahead is followed, with the hits written into it.
- A line number is never a pointer: write the section or the symbol name instead. Fenced blocks are skipped whole by the anchor and paragraph criteria, so commands, samples and before/after readings go in a fence.
- A pointer into a repo this project has not declared under `index.publicRepos` is refused, not merely noted: it is reported as a missing document and a `gate` run fails the delivery.

Use it when you write or revise a project's documents and want the discipline checked in one pass. It is not a reader: use `doc_search` / `read` to read documents and `grep` to search them.