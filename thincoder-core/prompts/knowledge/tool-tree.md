Use it to see quickly which modules exist and where files live. Skips dotfiles, .git/node_modules/dist/build/obj and other build/vendor dirs, and binary files.

**Route to tree instead of bash:**
- `tree` / `find .` / `dir /s` → tree

Parameters:
- path: Root directory (default cwd)
- depth: Tree depth (default 3, max 6)

Notes:
- Returns the tree as text: directories first (each ending with `/`), files after, both sorted, capped at 200 entries.
- Tree-drawing uses `├──`/`└──`/`│`.
- Use depth for a shallow overview; use `ls` for one directory, `glob` for a specific file pattern.