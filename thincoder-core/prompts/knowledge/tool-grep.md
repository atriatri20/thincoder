aliases: 搜索内容, 正则, 查找文本
**Route to grep instead of bash:** `findstr /c:"pat" file` / `grep -rn pat .` → grep. Searching file contents is a read - never shell out for it.

Parameters:
- `pattern` (required): a JavaScript regular expression, or a literal string when `literal: true`.
- `path`: directory or file to search (default cwd).
- `glob`: only search files matching this glob - supports `**`, `*`, `?`, `[..]`, `{a,b}` braces and space-separated exclusion (`"**/*.js !test/**"` = .js files outside test/); e.g. `'*.mjs'`.
- `ignoreCase`: case-insensitive match (default false).
- `literal`: literal string match, no regex interpretation (default false; use it for strings carrying `.` or `\`).
- `before`: lines of context to show before each match (like `grep -B`). Default 0.
- `after`: lines of context to show after each match (like `grep -A`). Default 0.

Notes:
- Skips node_modules, .git, dist, build, .turbo, coverage.
- Results are capped at 200 matches.
- Binary and unreadable files are skipped silently.
- Use this to find usages, definitions and patterns; use `glob` to find files by name.
- With `before` / `after`: a matching line uses the `:` separator and a context line uses `-` (as in ripgrep), and overlapping context ranges in one file are merged and de-duplicated - you see each context line once.