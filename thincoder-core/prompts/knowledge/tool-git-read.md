aliases: git, 只读, 版本库, 查看提交
Nothing here writes: no commit, no staging, no branch or tag changes, no push, no checkout, no snapshot restore.

The actions this tool face carries: diff / status / log / show / ls-remote / blame / checkpoint list·cat / tag list / branch list / stash list / remote list / worktree list.

- diff: unified diff since last commit (`staged` — staged only; `ref` — compare a commit/branch; `path` — scope).
- status: working tree state — staged / unstaged / untracked / conflicts.
- log: recent commits (`count`, `oneline`, `path` — one file's history).
- show: one commit with --stat (`ref`, default HEAD).
- ls-remote: light remote-ref check — network (`remote`, optional `ref`).
- blame: file blame (`path` required).
- checkpoint: snapshots — `checkpointAction` `list` (shows file tree) or `cat` (a file from the snapshot id); `checkpointId` for `cat`.
- tag / branch / stash / remote / worktree: `tagAction` / `branchAction` / `stashAction` / `remoteAction` / `worktreeAction` `list` only.

`filter` narrows any of these outputs (case-insensitive regex); `workdir` runs git in a subdirectory (default: the discovered project repo root); `config` carries `git -c` overrides for `ls-remote`.

Two things this variant does not do, by design: it never runs a write action, and calling one directly is refused before anything executes — nothing is staged, committed, restored or pushed. If the work needs a write, report it and let the role that owns writes do it.

Failures come back as errors — `git <action> failed: <reason>`.