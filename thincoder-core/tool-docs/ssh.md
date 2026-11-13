Open and drive a persistent interactive SSH session (remote login shell) on a host, and move single files to or from that host (`put` / `get`).

A session survives across tool calls. Password hosts get a credential window — the value never appears in tool args or results.

**Route to ssh instead of bash:**
- a one-shot non-interactive command over ssh → `bash` with `ssh host <command>` (cheaper, no session)
- an interactive shell that must survive several calls (network device CLI, interactive prompts) → ssh
- one file to or from a host you already have a session on → `put` / `get` (they reuse the session's host and credential chain, which `bash scp` cannot reach)
- a whole directory tree, a resumable transfer or a progress bar → not this tool (single file only)
- port forwarding (`ssh -L` / `-R`) → `bash`

Parameters:
- action (required): connect | send | read | secret_input | close | list | credentials | forget | put | get
- host: connect / forget — target host (IP or name)
- user: connect — login user (optional: your local ssh config decides, else the user recorded for this host locally)
- port: connect / forget — TCP port (optional, default 22)
- label: connect — short human label for this session (optional); secret_input — label for the value being sent
- promptPattern: connect — regex that marks the shell prompt as ready (optional). Give it when the device's prompt does not look like a shell prompt — otherwise each command waits out the full timeout. Left out, a line ending in `#` `>` `$` `%` counts as the prompt.
- identityFile: connect — private-key path to offer as `-i` (`~` expands); remembered for this host and reused when omitted (optional)
- id: send / read / secret_input / close / put / get — session id from connect (`ssh#N`)
- data: send — text to type into the session (a trailing newline is passed as-is; otherwise Enter is sent as `\r`)
- settle: send — wait for the ready verdict before returning (default true); false returns right after the bytes are written
- timeoutMs: send / read — wait budget override (default 60000; the wait ends as soon as the device is waiting for input — a prompt, `--More--`, a y/n or password prompt); put / get — transfer budget override (default 600000; on expiry the process tree is killed)
- maxChars: read — return-window override (default 8000): head 60% + a note + tail 40%, and the omitted middle stays in the session for the next read
- localPath: put / get — local file path (`~` expands; a file, never a directory)
- remotePath: put / get — path of that file on the session host (e.g. `/flash/img.bin`)
- overwrite: get — replace an existing local file (default false: an existing target is refused, never overwritten silently). put follows scp's own semantics: a same-named remote file is replaced
- protocol: put / get — `scp` (classic SCP protocol, the default, what network devices speak) | `sftp` (for hosts that only offer that). There is no automatic fallback between them
- ledger: the in-flight ledger row this call serves (`"#N"` or `"N"`) — required for `get` in engineering mode (the same write gate `write` goes through; `put` writes the remote host and needs no number)

Output:
- connect / send / read / secret_input / close / list / put / get results start with the session status line: `[ssh (ssh#3) 10.0.0.5 — ready · idle 3s]`
- connect returns the first screen; send returns the round's output plus the ready verdict (answer prompt such as `--More--` | prompt matched | timeout); read returns what arrived since the last read
- put / get return the status line, then exactly one more line — `put <localPath> → <remotePath> · N bytes · exit 0` (and the mirrored form for get). The file's content never enters the context: the bytes travel over the disk only, never through a result, a log or a message. On failure you get an `Error:` line plus the tail of scp's stderr (≤ 600 characters), with the exit code named

{{knowledge:tool-ssh}}