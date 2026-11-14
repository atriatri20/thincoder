Returns matching paths (relative to the search path), sorted, capped at 1000. Use it to discover file structure; use `grep` to search file contents.

Parameters:
- `pattern` (required): glob pattern, relative to `path`. Supported:
  - `**` (recursive), `**/`, `*` (within a segment), `?` (single char), `[..]` character classes, and `{a,b}` brace expansion - e.g. `**/*.{js,txt}` matches .js and .txt files at any depth.
  - Exclusions: a space-separated `!` token - `**/*.js !test/**` matches .js files except those under test/.
  - Several extension alternatives go in one `{a,b}` group (e.g. `**/*.{js,md}`); adjacent space-separated includes are not a supported form. A pattern containing a literal space is fine on its own - spaces separate patterns only when a `!` exclusion is present.
- `path`: directory to search in (default cwd).

Notes:
- Invalid glob syntax is an EXPLICIT error, never a silent no-match: unsupported extglob dialects (`?(x)` / `@(a|b)` / `+(x)`) and malformed braces (empty `{}`, unclosed `{`, nested `{a,{b,c}}`) return `glob error: ...` - use `{a,b}`, or a space-separated `!exclude`, instead.
- Skips node_modules, .git, dist, build, .turbo, coverage.
- Results are capped at 1000 matches.
- Prefer a pattern with a literal anchor (an extension or a subdirectory) over a bare wildcard.