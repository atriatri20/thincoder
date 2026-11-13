Check a project's documents for the three things this project judges, and print every hit as one plain sentence.

`mode` says what the call is for, and the two modes judge **different ranges** and sit differently on the index.

- `report` is read-only: it writes no document and no index entry, asks for no approval, and is safe to run beside other calls.
- `gate` writes no document either, but with a batch record bound to it, it stages the documents it was given before judging (`git add` by path, never `git add -A`) — a document this batch created and never staged has no changed region otherwise.
- With no batch record bound, `gate` has no changed region to take: it judges nothing, and the index is not touched either.

`report` is the diagnostic face and judges each document **whole**. `gate` is the delivery verdict and judges only **this batch's changed region** inside each document. Both judge the same three things and print the same sentences.

This tool stands where the reading happens: the documents are already on disk, so it judges them at that moment. A batch record is a record of a past round read back after the fact — this tool judges nothing in it, and writing it is where it does get judged.

{{knowledge:tool-doc-check}}

Parameters:
- `target` (required): the base root. Relative `docs` entries resolve against it, and a document belonging to no project falls back to it. Each document is judged against its own project root — the nearest ancestor holding `PROJECT-MANIFEST.json`. A relative target matching several directories is refused as ambiguous; a workspace holding several projects is refused with the candidates named — pass the project root.
- `mode`: `report` (default) — the diagnostic face, every named document judged whole; or `gate` — the delivery verdict, only this batch's changed region inside each named document judged, so a pre-existing dangling pointer outside the region is not reported.
- `docs`: the documents to judge, relative to `target` or absolute. In `report` mode each is judged whole — a pre-existing dangling pointer in a document you touch is reported too. In `gate` mode only the changed region is judged; the region is what a `git diff` of the bound batch record's start snapshot against the working tree yields, and a document with no changed lines has nothing to judge. Required in `report` mode: a bare string, an empty list and a missing list are all refused — nothing is scanned unless you name it. In `gate` mode, omitting it means the Markdown documents this session wrote; a session that wrote no `.md` gets `ERROR（0 档受检——本轮没有碰过 .md）`. A `gate` call with no batch record bound to it has no "this batch" to take a region from, so it judges nothing and prints the bare `PASS` line.

Misuse:
- Do not wire `report` mode as a gate or a CI step — that is what `mode:"gate"` is for.
- A line number is never a pointer: write the section name or a symbol name instead.
- Never treat a finding as a reason to refuse an instruction: an explicit go-ahead is carried out, with the hits written into it.

Use it when you write or revise a project's documents. It is not a reader: use `doc_search` / `read` to read documents and `grep` to search them.
