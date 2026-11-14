aliases: 插入行, 加一行
Safer than `edit` for adding new content - no surrounding context to copy, so no exact-string matching to get wrong.

Parameters:
- `path` (required): file path.
- `content` (required): the text to insert; it becomes its own line, placed after the target line.
- `after_line`: line number to insert after (1-based). Preferred when you know the exact line number from `read`.
- `after_regex`: a JavaScript regex finding the line to insert after. It must match exactly one line; when it matches several the tool errors and shows the matching line numbers.

Notes:
- Either `after_line` or `after_regex` is required; if both are given, `after_line` wins.
- Use this instead of `edit` when you are adding a line - a checklist item, a doc heading, a line of prose, a function, an import, or a block - rather than fabricating surrounding context to anchor an exact-string match.
- Returns a diff of the change.
- **Read-before-insert guard**: `after_line` is judged against the last write to that file. A line at or above that write's write point is allowed; inside or below it - or when the file was written after your read without updating that anchor - the call is refused, naming the path, the drift `±shift` and two ways on: re-read, or address the region without line numbers.
- Take line numbers from the most recent `read` of that file; re-read after the file changed.