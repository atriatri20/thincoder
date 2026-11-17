/*
 * apply-patch-write-phase.test.mjs — 集成用例 CLI 42-1（RTM 新故事 CLI 42「补丁改多档：写盘段中途失败，
 * 回执说清哪几档已落盘」）。
 *
 * 回指 = 设计档 `docs/core/design/APPLY-PATCH.md` §6.3 集成面 ∥ §4「返回值（未全成）」∥ §7 D-P2 ∥ D-P4；
 * 需求 = `docs/core/requirements/TOOLS.md` F17。
 *
 * 业务入口 = 真 `apply_patch` 调用。三档补丁，第 1 档的目标档在 IDE 里打开着（注入径 ⇒ 暂存段即提交），
 * 第 2 档的提交段 `rename` 失败。业务问题：**补丁改多档改到一半失败，回执会不会说「一个都没动」而盘上
 * 其实已经改了第一档**（改前那里抛的是一句裸 `rename` 错误：无清单、不说哪一档失败）。
 *
 * 复现径（可重放）：编辑器径那档的 `applyEdit` 在宿主侧落盘之后，把第 2 档的目标档换成一个目录
 * ——于是第 2 档的 `rename(<abs>.thincoder-tmp → <abs>)` 必然失败（Windows EPERM ∥ POSIX EISDIR），
 * 而第 1 档已在盘上。这条失败发生在**提交段**，不是 hunk 段，也不是注入径那一笔本身。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/apply-patch-write-phase.test.mjs`
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { basename, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { applyPatchTool } from "../../thincoder-core/tools/patch.mjs"
import { configureWritePath, resetWritePath } from "../../thincoder-core/tools/write-path.mjs"

const projects = []
after(() => {
  resetWritePath()
  for (const p of projects) removeTempDirBestEffort(p)
})

/** 三档补丁：每档一行替换。 */
const THREE_FILE_PATCH = `--- a/alpha.txt
+++ b/alpha.txt
@@ -1,1 +1,1 @@
-one
+ONE
--- a/beta.txt
+++ b/beta.txt
@@ -1,1 +1,1 @@
-green
+GREEN
--- a/gamma.txt
+++ b/gamma.txt
@@ -1,1 +1,1 @@
-three
+THREE
`

test("CLI 42-1 补丁改多档写到一半失败：回执逐档说清哪几档已在盘上，已落盘的不回滚", async () => {
  const root = mkdtempSync(join(tmpdir(), "apwp-42-1-"))
  projects.push(root)
  writeFileSync(join(root, "alpha.txt"), "one\n")
  writeFileSync(join(root, "beta.txt"), "red\ngreen\n")
  writeFileSync(join(root, "gamma.txt"), "three\n")
  const bAbs = join(root, "beta.txt")

  // 桩宿主：只有第 1 档在 IDE 里打开着（注入径 ⇒ 暂存段即提交）；它落盘之后让第 2 档的目标档变成目录
  configureWritePath({
    openDoc: (abs) => (basename(abs) === "alpha.txt" ? { abs } : null),
    isDirty: () => false,
    applyEdit: async (doc, content) => {
      writeFileSync(doc.abs, content)
      renameSync(bAbs, `${bAbs}.orig`)
      mkdirSync(bAbs)
      return true
    },
  })

  let message = ""
  try {
    await applyPatchTool.execute({ patch: THREE_FILE_PATCH }, { cwd: root })
    assert.fail("写盘段中途失败必须抛出（改前抛的是裸 rename 错误——本用例钉住它已改成按盘上实况报）")
  } catch (e) {
    message = e.message
  }

  // 逐档一行、按补丁序：已落盘标 `modified` / 失败那档点名它自己 / 未落盘的档 `not committed`
  assert.ok(message.includes("  modified alpha.txt"), `已落盘的第一档照实列出：\n${message}`)
  assert.ok(message.includes("beta.txt — failed: "), `失败那档点名它自己（原因原文逐字）：\n${message}`)
  assert.ok(message.includes("  not committed gamma.txt"), `后面那档说明它没落盘：\n${message}`)
  assert.ok(message.indexOf("modified alpha.txt") < message.indexOf("beta.txt — failed: ") &&
    message.indexOf("beta.txt — failed: ") < message.indexOf("not committed gamma.txt"), "逐档行按补丁序")
  // 末行：报单位 = 写单位 = 档 ⇒ 末段省，清单 = 已落盘的档
  assert.equal(message.split("\n").at(-1), "apply_patch: 1/3 file(s) applied, 2 failed: alpha.txt")
  // 盘上实况：第一档真的改了、不回滚；第三档零字节
  assert.equal(readFileSync(join(root, "alpha.txt"), "utf8"), "ONE\n", "已落盘档留在盘上")
  assert.equal(readFileSync(join(root, "gamma.txt"), "utf8"), "three\n", "未落盘档逐字未动")
})