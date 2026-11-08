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
- `DOC-CHECK GATE: PASS` — every listed document is clean.
- `DOC-CHECK GATE: REFUSED（命中 K 条）` — K hits; fix them in the same round.
- `DOC-CHECK GATE: ERROR（reason）` — nothing was judged, so neither `PASS` nor `REFUSED` was produced. Fail-closed: no `PASS` means not passed.

`ERROR` is what you get for three things:
- a document that is on disk but cannot be read — a file the check could not read is not a clean file.
- a range that judges no document at all: an empty `docs` list, a round that wrote no `.md`, a list whose paths are all off disk.
- a rootless call (`无法定根`), where every document is named with its reason and no hit line is printed.

In each case, pass explicit `docs` and re-run.

Misuse:
- Do not wire `report` mode as a gate or a CI step — that is what `mode:"gate"` is for.
- Never treat a finding as a reason to refuse an instruction: a machine check never outranks a user instruction. An explicit go-ahead is followed, with the hits written into it.
- A line number is never a pointer: write the section or the symbol name instead. Fenced blocks are skipped whole by the anchor and paragraph criteria, so commands, samples and before/after readings go in a fence.
- A pointer into a repo this project has not declared under `index.publicRepos` is refused, not merely noted: it is reported as a missing document and a `gate` run fails the delivery.

Use it when you write or revise a project's documents and want the discipline checked in one pass. It is not a reader: use `doc_search` / `read` to read documents and `grep` to search them.