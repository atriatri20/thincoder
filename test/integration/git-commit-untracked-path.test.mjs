/*
 * git-commit-untracked-path.test.mjs — 集成用例 CLI 55-1（RTM CLI 端故事 55「git commit 携未跟踪路径 ⇒
 * 当场拒并点名，不给原始 pathspec 报错」）。
 *
 * 回指 = 设计档 `docs/core/design/TOOLS.md`「4.1 commit 携 path 的未跟踪预检」（判据单源）。
 * 业务入口 = 模型面 `git` 工具（`gitTool.execute`，走装配给它的工具 ctx——不直调内部预检）。
 * 它答的业务问题：**提交一个从没进过索引的新档时，助手拿到的是一句「哪个档没进索引 + 怎么走」，
 * 还是 git 的 `pathspec … did not match any file(s) known to git`**——改前是后者，一句读起来像
 * 路径打错的话；生产上正是它让一次 12 档的提交白跑一轮。
 *
 * 只断言业务可观察结果（拒文点名、工作树与提交面零变化），不锁预检的实现形状。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/git-commit-untracked-path.test.mjs`
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { gitTool } from "../../thincoder-core/tools/git.mjs"

const roots = []
after(() => {
  for (const p of roots) removeTempDirBestEffort(p)
})

const git = (cwd, ...argv) =>
  execFileSync("git", ["-c", "core.quotepath=false", ...argv], { cwd, encoding: "utf8", stdio: "pipe" })

/** 隔离夹具：临时真仓 + 一条初始提交（`tracked.txt` 已在索引里）。 */
function fixture(tag) {
  const root = mkdtempSync(join(tmpdir(), `gcu-rtm-${tag}-`))
  roots.push(root)
  git(root, "init", "-q")
  git(root, "config", "user.email", "rtm@example.test")
  git(root, "config", "user.name", "rtm fixture")
  git(root, "config", "commit.gpgsign", "false")
  git(root, "config", "core.autocrlf", "false")
  writeFileSync(join(root, "tracked.txt"), "tracked\n")
  git(root, "add", "-A")
  git(root, "commit", "-q", "-m", "fixture base")
  return root
}

test("CLI 55-1 git commit 携未跟踪路径 ⇒ 当场拒并点名，不给原始 pathspec 报错", async () => {
  const root = fixture("refuse")
  // 一个已跟踪档的改动 + 一个从没 add 过的新档，放在同一次 path 提交里
  writeFileSync(join(root, "tracked.txt"), "tracked changed\n")
  writeFileSync(join(root, "draft.txt"), "draft\n")
  const before = Number(git(root, "rev-list", "--count", "HEAD").trim())

  const out = await gitTool.execute(
    { action: "commit", message: "rtm 55 probe", path: "tracked.txt draft.txt" },
    { cwd: root }
  )

  assert.ok(/draft\.txt/.test(out), `拒文点名没进索引的那个档：${out}`)
  assert.ok(!/pathspec/i.test(out), `不给 git 的原始 pathspec 报错（那读起来像路径打错）：${out}`)
  assert.ok(/git add/.test(out) && /omit path/.test(out), `拒文给两条可执行出路：${out}`)

  assert.equal(Number(git(root, "rev-list", "--count", "HEAD").trim()), before, "零提交：提交条数不变")
  const status = git(root, "status", "--porcelain")
  assert.match(status, /^ M tracked\.txt$/m, "已跟踪档的改动仍在工作树（没有只提交一半）")
  assert.match(status, /^\?\? draft\.txt$/m, "未跟踪档没进提交")
})
