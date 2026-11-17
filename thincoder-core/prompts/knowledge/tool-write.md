aliases: 写文件, 新建文件
Parameters:
- path (required): File path (relative to cwd or absolute)
- content (required): Full content to write

Notes:
- write replaces the WHOLE file: read it first and confirm you intend to rewrite it entirely. For a targeted change use edit / insert_after instead.
- The file is atomic: it either writes completely or fails.
- Returns `Wrote N chars to <path>` + git diff + syntax-check note.