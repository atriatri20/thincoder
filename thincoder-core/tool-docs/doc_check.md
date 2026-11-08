Run a built-in documentation-discipline check on a project and report its findings.
Read-only. In the default `report` mode it is non-gating: it reports, it never blocks, never sets an exit code, and its output is never a reason to refuse a task or a user instruction.

What it checks — exactly three criteria, all built into the engine:
- Anchors — a documentation pointer must resolve: the file must exist on disk (`档缺` when it does not), and when a section
  indicator follows, the target must carry a heading numbered with it (`节缺` when it does not).

  A pointer is a file token in the closed extension set (`md`, `mjs`, `cjs`, `js`, `json`, `css`, `html`, `svg`, `yml`,
  `yaml`, `sh`, `ps1`), optionally carrying directory segments and optionally followed by `§N` / `§N.M` / `§N.M.K`.

  Line-number coordinates (`<doc>:12`) are not section references and are not judged as such. Files inside fenced code blocks
  are skipped whole; on a command line only its code spans are skipped, so a pointer written outside them is judged.

  A pointer whose referring document and whose target both sit under a `docRoot.batches` root is not judged — `report` mode counts them as a reading and they never enter a verdict; a spec document pointing at the batch face is still judged.
- **The reach is what survives extraction, not every file token.** Three name families are never extracted, so they are never
  judged: **conventional file names** used to say which files get read (`AGENTS.md`, `SKILL.md`, `project_rules.md`, `todo.md`
  and the rest of that closed set),

  **placeholder stems** (single letters plus the usual sample words — `x.md`, `file.md`, `foo.md`, `example.md`), and — on the
  prompt face only — the seven operand names the `Operand names` block below lists.

  Both families exempt a **bare name only**: a token carrying directory segments is judged as a real path, so a stem like
  `file` does not save `thincoder-core/tools/file.mjs` from being a pointer — a real file was being read as an example.

  A file token outside those families is judged even when misspelled: a wrong name reports `档缺`, never a pass.

~~~text
  **Operand names.** Seven names count as operands rather than documents: the model writes them, or reads a file by that name. On
the prompt face (`thincoder-core/prompts/**`) a **whole token** matching one of them is stripped before extraction; a name that is only
the tail of a longer token (`RTM.md` inside `test/RTM.md`) is not stripped, and that path is judged like any other pointer. On other
faces the operand family is not stripped at all: three of the seven are exempt as file-name classes, and the exemption reaches
bare names only — `AGENTS.md`, `SKILL.md`, `project_rules.md`. The other four are judged as pointers, `.thincoder/advisor.md`
(its directory segment puts it outside the class exemption) and `RTM.md` included, so write the index path-qualified
(e.g. `test/RTM.md`). The seven:

  ```text
  AGENTS.md  SKILL.md  README.md  MANIFEST.md  .thincoder/advisor.md  project_rules.md  RTM.md
  ```
~~~

- Citation check — the same criterion, one more hit class `引缺` (a line that claims its own basis).

  A claim line writes `依据 <document path>「<verbatim quotation>」`, and the quoted text must appear as a contiguous substring
  of the file that path resolves to; when it does not, the hit is `引缺` and the report names the path plus the first 40 characters.

  The path is judged for existence first: a path that does not resolve reports `档缺`, never `引缺` — the fix differs
  (check the path ∥ check the words). Both classes count into the one `锚` total: no third criterion, no new verdict word.

  Between the path token and `「` only the optional separator (`:` ∥ `：` ∥ `=`) and an optional backtick may sit. Anything else
  (a space, a prose word, a punctuation mark) means the line is not a basis marker and nothing is judged; an empty `「」` is not a marker either.

  A path whose name falls in the exempt families above is not a marker path either — the same exemption decides both faces.

  Existence only: no whitespace folding, no case or width folding. A verbatim quotation taken from the wrong place still passes —
  whether it is the *right* basis (a contract rather than a comment) belongs to review, and this tool does not claim to judge it.


- Paragraph length — on every non-prompt face, adjacent non-blank body lines merge into one paragraph whose total character
  count (CJK counts as 1) is judged against the built-in threshold; blank lines, table rows, headings, list items,
  quote-block lines and fenced code blocks do not count into a paragraph and break it, and lines inside an exempt zone

  are excluded. No face is exempt: a tool-description file (`thincoder-core/tool-docs/**`, this file included) is judged on
  this criterion too — a long paragraph hides its later points from every reader, the model included.

  Breaking a paragraph into more lines changes nothing, and clearing the length check is not the same as fixing it: splitting a
  paragraph into more paragraphs, or writing it shorter, clears the count while the reader still faces the same packed paragraph.

  What fixes it is fewer and shorter sentences, a list of named items where the paragraph holds parallel assertions, or a table
  where it holds enumerated readings.
- Line length — a prompt-face file (`thincoder-core/prompts/**`) is judged line by line: the model reads raw text, so
  one line is one block, and any single line over the threshold counts with no structural exemption.

- Line-number coordinates — a filename token followed by `:` and digits (`<doc>:12`, ranges included) is a hit.

  One collection feeds both faces: `report` prints it as an inventory block, `gate` counts the body-face ones as its
  third criterion — a coordinate outside a fenced block fails the gate.

  Two shapes never become a hit: placeholder or conventional filenames written bare (`x.md:12` is an example, not a
  reference — with directory segments it is a real path), and section numbers (a `§` plus digits carries no colon).

  A coordinate with no filename on its own line still counts when the line directly above wrote one: the name is carried
  down one line. Only a coordinate with no name on either line falls outside the criterion — write the section or the
  symbol and there is nothing to carry.

  A fenced block is verbatim evidence — a log, a refused message, a diff, a before / after pair. Its coordinates pin a
  position in the original it quotes, not a place in today's tree, so `gate` does not judge them.

  The reach of that exemption: fenced ones appear as one reading line and never in the hit list; the body face alone
  decides the verdict. Outside a fenced block the rule stands — a line number is never a pointer; write the section,
  the symbol name, or the quoted line instead.

  Examples — sample rows, commands, paths — go in a fenced block, which the anchor and paragraph criteria skip whole; a path left in prose or a table must be a real file — a made-up one is judged `档缺`. An assumed name in a sentence takes `<area>/<name>.md`.

`report` mode also prints that collection as an inventory block: a measure line naming the extractor and the scan
range, then the totals, then one line per hit.

Those three totals (`正文面` / `围栏内` / `合计`) are debt-clearing readings; `gate` scores the body face alone, so a
fenced-block coordinate raises the inventory count without ever entering a verdict.

It cannot — in `report` mode — write anything, gate anything, or turn a finding into a refusal.

Arguments — `target` (required): the **declared root** for this call, not one coordinate system for the whole list.
Each document is judged against its own project root — the nearest ancestor holding `PROJECT-MANIFEST.json`.

`target` supplies only two things: the base for relative `docs` entries, and the root for a document whose ancestor chain holds no manifest.

Pass the project root you mean — omitting it is refused (the session anchor is the base for relative `docs` entries, not a default).

A plain directory or a multi-project workspace is a legal value and is judged as given; only a relative `target` that matches several existing directories is refused as ambiguous.

`mode` (optional) — `report` (default: a non-gating report over the documents you list) or `gate` (the delivery gate below).
`docs` (required) — the documents to judge, as paths relative to the project root or absolute; each is judged whole and nothing

else is read except the targets those documents point at. Omitted in `gate` mode ⇒ the Markdown documents this session wrote.
There is no default range in `report` mode: omitting `docs`, or passing an empty list, is refused rather than widened — nothing

is scanned unless you name it. A path that is not on disk or is not a Markdown document is an error in `report` mode and nothing
is judged; in `gate` mode such paths are listed as skipped instead.

A pointer resolves through these legs, in this order:

- the project root (full path);
- the pointing document's own directory;
- a repo this project declares under `index.publicRepos` (first segment = that repo's directory name);
- the unique-suffix fallback, reached only when the legs above find nothing — exactly one file in the repo whose path ends with the whole token.

A bare name resolves through the last-resort unique-suffix leg: while exactly one file in the repo carries that name it resolves and passes; with two or more, or none, it is judged 档缺.

A pointer into a repo this project has not declared is refused, not merely noted: it is reported as a missing document and a `gate` run fails the delivery.
- **Doc names: any form that resolves — a bare name is fine while the name is unique.** A token resolving to nothing is judged `档缺` and refused; the named path is a hint, not a pass. A bare name goes red the day a `same name` file appears — then write the distinguishing form.

`lines` (optional, `report` mode only) — the files to measure, as paths relative to the project root or absolute.

Each gets one line of content count — source files, unit-test files and Markdown files alike.

- Source and unit-test files carry a size-tier mark once they pass a threshold: the soft line asks for a review, the hard
  line means split.
- Markdown files report a number only — a document carries no line budget.
- The tier is a strict greater-than; both thresholds live in the engine's constants.

That count comes from `countContentLines` in the engine — the only way to measure a file's content lines.

A shell count, an editor's status bar and the read tool's line numbers are not another convention: they are wrong.
A number taken from one of them cannot be compared with this one, nor quoted as this one.

This reading answers one question — whether a file should be split — and nothing else.

- It is not a criterion: it never enters the hit count, never changes the verdict.
- It never moves the last conclusion line; `report` without `lines` prints exactly what it printed before.
- `gate` refuses `lines` outright rather than ignoring it, so a caller cannot believe a file was measured when it was not.

Delivery gate — `mode: "gate"`, for the end of a design or development round. Every listed doc is judged **whole**:
a pre-existing dangling pointer or overlong paragraph / line anywhere in it counts, not only this round's edited lines.

The first line is the machine-readable verdict — `DOC-CHECK GATE: PASS` / `DOC-CHECK GATE: REFUSED（命中 K 条）` / `DOC-CHECK GATE: ERROR（reason）` —

and consumers judge by that prefix; the hits are fixed in the same round and are never booked to the ledger.

A listed document that is on disk but cannot be read makes the verdict `ERROR（读不到 N 档）`: that document was not judged,
so neither `PASS` nor `REFUSED` is produced — a file the check could not read is not a clean file.

A range that judges **no document at all** makes the verdict `ERROR（0 档受检——空范围不判 PASS）` — an empty `docs` list, a
round that wrote no `.md`, a list whose paths are all off disk, and a list holding no Markdown file all read the same way.

`PASS` is a statement about the documents: all of them are clean. With no document there is nothing for it to be true of, so
an empty range is a verdict that could not be reached, not a clean one.

Why the range is empty is not in the first line: the `范围为空：…` line and the skip lines name it, entry by entry.

A rootless call — the engine given no declared root, an empty string, or a non-string — judges nothing.
The verdict is `ERROR（无法定根 N 档）`, every document is named with its reason, and no hit line is printed.

That is policy, not arithmetic: half a verdict cannot be told apart from "the rest is clean".

The gate refuses **one delivery**, not a user instruction: an explicit user go-ahead is followed, with the hits written into it.

`ERROR` is fail-closed (no PASS means not passed): a multi-project workspace is a legal declared root — the list is judged document by document, each against its own project root.
An empty range is one of its causes too: pass explicit `docs` and re-run.

Do not wire it as a gate or CI step in `report` mode, and do not treat a finding as a reason to refuse an instruction — a
machine check never outranks a user instruction.

Routing — use it when you write or revise a project's documents and want the discipline checked in one pass. It is not
a reader: use `doc_search` / `read` to read documents and `grep` to search them; this tool only reports discipline findings.

Side effects and permissions — none. The tool is read-only: no writes, no approval prompt, safe to run in parallel with other calls.

Parameters and scope — all three criteria run on built-in constants (`DOC_CHECK_BUILTINS`).

Those constants are the paragraph and line threshold, the exempt-zone and exemption lists, and the two file size thresholds.

The judged set is the document list the caller passes — the judged set and the resolution set are the same documents.
There is no scan-dir / domain / root / exclude surface and no whole-repository scan.

Changing a criterion or a threshold is a code change and goes through review; no project declaration changes these readings.

Consistency — the checks and this description are one core implementation: every end that loads the core tool registry gets the
same semantics.
