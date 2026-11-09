/*
 * edit-batch-entry-outcome.test.mjs — 集成用例 41-1（RTM CLI 端故事 41「批量改多档：一条失败只废那一条，成了的不返工，回执逐条说清」）。
 *
 * 回指 = 设计档 `docs/core/design/EDIT.md` §5「批量回执（逐条 + 末行计数）」∥「一条失败只废它自己」∥
 * 「该档写不成就整档不成」；需求 = `docs/core/requirements/TOOLS.md` F16；批档
 * `docs/batches/2026-11-09-edit-batch-atomic-receipt.md` §2「集成用例设计（RTM 增量）」。
 *
 * 业务入口 = 真 `edit` 工具的 `edits` 形（不直调 `applyEditBatch`）。它答的业务问题：
 * **批量改多档时一条手滑，会不会把已经改成的档一起退回去**（改前 = 整批抛错、前面档零字节，
 * 用户为此改成一档一调 + 逐次回读；本用例钉住那条行为已退场）。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/edit-batch-entry-outcome.test.mjs`
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { editTool } from "../../thincoder-core/tools/file.mjs"

const projects = []
after(() => {
  for (const p of projects) removeTempDirBestEffort(p)
})

const sha = (abs) => createHash("sha256").update(readFileSync(abs)).digest("hex")

/** 夹具 = 系统临时域（零落仓、可并发）；带 manifest 的那份给写前文档门用。 */
function fixture(tag, withManifest = false) {
  const root = mkdtempSync(join(tmpdir(), `ebeo-${tag}-`))
  projects.push(root)
  if (withManifest) {
    writeFileSync(join(root, "PROJECT-MANIFEST.json"),
      JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design" } }, null, 2))
    mkdirSync(join(root, "docs/design"), { recursive: true })
  }
  return root
}

test("CLI 41-1 批量改多档：一条失败只废那一条（成了的留在盘上、回执逐条说清、末行给计数）", async () => {
  // ① 一条手滑（old_string 匹配不到）——已成的档留在盘上，不需要重做整批
  const root = fixture("plain")
  const a = join(root, "alpha.txt")
  const b = join(root, "beta.txt")
  writeFileSync(a, "one\ntwo\n")
  writeFileSync(b, "red\ngreen\n")
  const bBefore = sha(b)

  const receipt = await editTool.execute({ edits: [
    { path: "alpha.txt", old_string: "two", new_string: "TWO" },
    { path: "beta.txt", old_string: "this line is not in the file", new_string: "x" },
    { path: "alpha.txt", old_string: "one", new_string: "ONE" },
  ] }, { cwd: root })

  // 盘上字节：成了的两条在盘（同档一次写、两条都在），败的那档逐字不变
  assert.equal(readFileSync(a, "utf8"), "ONE\nTWO\n", "成了的条目都在盘上——不需要重做整批")
  assert.equal(sha(b), bBefore, "败的那一档字节逐字不变")
  // 回执：逐条一行按调用序回原位 + 末行计数
  const lines = receipt.split("\n")
  assert.ok(lines[0].startsWith("Edited alpha.txt: replaced 1 occurrence(s)"), `第 1 条是成功行：${lines[0]}`)
  assert.ok(receipt.includes("\nedits[1] — failed: old_string not found in beta.txt"), `第 2 条按原位报它自己：${receipt}`)
  assert.ok(receipt.includes("\nEdited alpha.txt: replaced 1 occurrence(s)"), "第 3 条成功行在（同档另一条不受连累）")
  assert.equal(lines[lines.length - 1], "edit batch: 2/3 entries applied, 1 failed — 1 file(s) written: alpha.txt",
    `末行 = 计数行（k/M 两个单位分报）：${lines[lines.length - 1]}`)
  assert.doesNotMatch(receipt, /nothing written|no files written/, "批面回执不说「什么都没写」那句假话")

  // ② 某档最终内容被写前门拒（段落超长）——只连坐该档，其他档照落
  const root2 = fixture("gate", true)
  const okPath = join(root2, "docs/design/notes.txt")
  const docPath = join(root2, "docs/design/notes.md")
  writeFileSync(okPath, "plain line\n")
  writeFileSync(docPath, "first line\nsecond line\n")
  const docBefore = sha(docPath)

  const gated = await editTool.execute({ edits: [
    { path: "docs/design/notes.txt", old_string: "plain", new_string: "PLAIN" },
    { path: "docs/design/notes.md", old_string: "first line", new_string: "x".repeat(400) },
    { path: "docs/design/notes.md", old_string: "second line", new_string: "SECOND LINE" },
  ] }, { cwd: root2 })

  assert.equal(readFileSync(okPath, "utf8"), "PLAIN line\n", "另一档照落盘")
  assert.equal(sha(docPath), docBefore, "被门拒的那档字节逐字不变（零字节）")
  const failed = gated.split("\n").filter((l) => /^edits\[\d+\] — failed: /.test(l))
  assert.equal(failed.length, 2, `该档两条都失败、各占一行：${gated}`)
  assert.equal(gated.split("本次写入未落盘——目标档字节逐字不变（零字节）。").length - 1, 2,
    "失败原因 = 门拒文原文（对它报的那一档为真）")
  assert.equal(gated.split("\n").at(-1), "edit batch: 1/3 entries applied, 2 failed — 1 file(s) written: docs/design/notes.txt")
})