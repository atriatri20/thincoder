List running processes, optionally filtered by name — read-only. Nothing here kills: no process tree and no background task is terminated.

The action this tool face carries: `list` (the default). It returns one line per process (name / PID, plus memory on Windows).

**Route to process instead of bash:**
- `tasklist` (Windows) / `ps aux` (POSIX) → process

Parameters:
- action (optional, default 'list'): list — show running processes
- name: (list) substring filter (case-insensitive), e.g. "node", "python"

Use it to check what a previous run left behind, or whether a server you started is still up. Terminating something (`kill`) is deliberately not part of this tool face: it is destructive and stays with the roles that own it — calling it directly is refused before any process is signalled.