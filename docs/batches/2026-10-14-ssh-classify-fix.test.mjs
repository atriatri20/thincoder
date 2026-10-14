// 2026-10-14 · ssh 传输分类器误判修复——单元腿（红绿对）
// 红（修前）：L1 远程命令级 EACCES（exit≠255）被误抛「认证被拒」（2026-10-14 排障实证）。
// 绿（修后）：L1 原样返回读数（stderr 真因上抛）；L2/L3（ssh 自身失败 exit=255）分类保留。
// 台账 #1408 ∥ 轮档 docs/batches/2026-10-14-ssh-classify-fix.md
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createSshExecutor } from "../../thincoder-server/src/sandbox/ssh.mjs"

const EXEC_ARGS = { host: "10.0.0.6", port: 22, user: "liwei", authKind: "password", secret: "pw", command: "mkdir -p /srv/x" }

function makeExec(result) {
  return async () => ({ code: result.code, stdout: result.stdout ?? "", stderr: result.stderr ?? "", spawnError: false, timedOut: false })
}

test("L1 远程命令级 EACCES（exit=1）⇒ 原样返回读数，零分类", async () => {
  const baseDir = mkdtempSync(join(tmpdir(), "tc-ssh-classify-"))
  try {
    const exec = createSshExecutor({ baseDir, execImpl: makeExec({ code: 1, stderr: "mkdir: cannot create directory '/srv/x': Permission denied" }) })
    const out = await exec.exec(EXEC_ARGS)
    assert.equal(out.exitCode, 1)
    assert.match(out.stderr, /Permission denied/)
  } finally {
    rmSync(baseDir, { recursive: true, force: true })
  }
})

test("L2 ssh 自身失败（exit=255 + Permission denied）⇒ 仍抛「认证被拒」", async () => {
  const baseDir = mkdtempSync(join(tmpdir(), "tc-ssh-classify-"))
  try {
    const exec = createSshExecutor({ baseDir, execImpl: makeExec({ code: 255, stderr: "liwei@10.0.0.6: Permission denied (publickey,password)." }) })
    await assert.rejects(() => exec.exec(EXEC_ARGS), /认证被拒/)
  } finally {
    rmSync(baseDir, { recursive: true, force: true })
  }
})

test("L3 ssh 自身失败（exit=255 + Connection refused）⇒ 仍抛「主机不可达」", async () => {
  const baseDir = mkdtempSync(join(tmpdir(), "tc-ssh-classify-"))
  try {
    const exec = createSshExecutor({ baseDir, execImpl: makeExec({ code: 255, stderr: "ssh: connect to host 10.0.0.6 port 22: Connection refused" }) })
    await assert.rejects(() => exec.exec(EXEC_ARGS), /主机不可达/)
  } finally {
    rmSync(baseDir, { recursive: true, force: true })
  }
})
