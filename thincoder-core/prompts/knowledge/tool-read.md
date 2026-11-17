aliases: 读文档, 读文件, 查看文件
Use `offset` / `limit` to page through a large file.

**Route to read instead of bash:** `cat file` / `type file` / `node -e "fs.readFileSync(...)"` → read. Reading a file is a read - never shell out for it.

**Routing:**
- Don't know which file? → `repo_outline` / `code_search` / `glob` first.
- Know the symbol but not the location? → `code_search` or `lsp definition`.
- Know the file but not the lines? → `grep` to find line numbers, then read that range with `offset` / `limit`.
- Reading an image? → `read_image` instead.

Parameters:
- `path` (required): file path, relative to cwd or absolute (alias: `filePath`).
- `offset`: 1-based line number to start reading from.
- `limit`: max lines to return (default 2000). A window over a file longer than that returns the head, a `…(truncated: K lines in middle, use offset to continue)` marker, and the file's real tail lines - the file end is never hidden.
- `hashes`: include a content hash per line (`hashes: true`), for `hashline_edit`. Set it on the read you take before using `hashline_edit`.

Notes:
- Always prefer this over `cat` or shell-based reading - it caps output and avoids large dumps.
- Use `offset` for pagination when the file is large.
- When you plan to edit the file, take `hashes: true` in the same read: hash-based editing is immune to whitespace and encoding mismatches.