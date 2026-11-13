Output format:
```
[stdout]:
<standard output, or "(empty)">

[stderr]:
<standard error, only present if non-empty>

(exit code N)
```

Notes:
- There is NO TTY — editors, pagers (vim, less), and interactive prompts WILL hang. Always pass non-interactive flags: `git commit -m`, `git --no-pager`, `-y`/`--yes` where applicable
- The environment sets GIT_PAGER=cat, PAGER=cat, EDITOR=true, TERM=dumb — but still always use non-interactive flags
- Output is capped at ~200K chars; if you need more, redirect to a file and read it. Truncated output ends with a `[... truncated: N chars omitted]` marker — the missing tail may contain errors, so read the saved log file's tail before trusting success. Use `filter` to narrow instead of hand-piping.
- Check `[stderr]` for error messages, warnings, and diagnostic output — it is separated from `[stdout]` so you can quickly identify problems.
- Shell identity: the bash tool's shell is NOT fixed — it depends on configuration and environment. The current executor is declared in the Executor line above; write commands for THAT shell, and when a command fails read its error output to identify the actual shell.
- Never use bash to read, copy, or transmit secret files (.env, keys, tokens)
- Do NOT run destructive commands (rm -rf, force-push, drop table) without explicit user confirmation
- After commands that change files (git checkout, npm install, etc.), repo_outline and code_search may be stale — re-run them to get current results.
- Prefer read/glob/grep/ls for file operations inside the project — file tools and bash reach the same paths (no directory restriction).
- NEVER use bash to write or modify files (echo/sed/printf > file, cat << EOF, etc.). Use write/edit/insert_after/apply_patch instead — they handle encoding, escaping, and EOL conventions correctly.