/*
 * edit-batch-entry-outcome.test.mjs — 集成用例 41-1 ∥ 41-3（RTM CLI 端故事 41「批量改多档：一条失败只废那一条，成了的不返工，回执逐条说清」）。
 *
 * 回指 = 设计档 `docs/core/design/EDIT.md` §1「参数」（两形态空值矩阵）∥ §2「匹配与应用」（归一落点）∥
 * §4「验证」；需求 = `docs/core/requirements/TOOLS.md` F16；批档
 * `docs/batches/2026-11-09-edit-batch-atomic-receipt.md` §2「集成用例设计（RTM 增量）」∥
 * `docs/batches/2026-11-15-edit-empty-string-deletion.md` §2「集成增量」。
 *
 * 业务入口 = 真 `edit` 工具的 `edits` 形（不直调 `applyEditBatch`）。它答两个业务问题：
 * 41-1：**批量改多档时一条手滑，会不会把已经改成的档一起退回去**（改前 = 整批抛错、前面档零字节，
 * 用户为此改成一档一调 + 逐次回读；本用例钉住那条行为已退场）。
 * 41-3：**行号形传空串删行，会不会又被拒、逼用户绕去手写文件**（2026-11-15 现场：`new_string: ""`
 * 被拒 → 绕行 PowerShell 写档 → 编码写坏；本用例钉住空串 = 删除与内容形空串仍拒两边）。
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
  const okPath = join(root2, "notes.txt")
  const docPath = join(root2, "docs/design/notes.md")
  writeFileSync(okPath, "plain line\n")
  writeFileSync(docPath, "first line\nsecond line\n")
  const docBefore = sha(docPath)

  const gated = await editTool.execute({ edits: [
    { path: "notes.txt", old_string: "plain", new_string: "PLAIN" },
    { path: "docs/design/notes.md", old_string: "first line", new_string: "x".repeat(400) },
    { path: "docs/design/notes.md", old_string: "second line", new_string: "SECOND LINE" },
  ] }, { cwd: root2 })

  assert.equal(readFileSync(okPath, "utf8"), "PLAIN line\n", "另一档照落盘")
  assert.equal(sha(docPath), docBefore, "被门拒的那档字节逐字不变（零字节）")
  const failed = gated.split("\n").filter((l) => /^edits\[\d+\] — failed: /.test(l))
  assert.equal(failed.length, 2, `该档两条都失败、各占一行：${gated}`)
  assert.equal(gated.split("文档机检门拒写（doc-check gate）").length - 1, 2,
    "失败原因 = 门拒文原文（对它报的那一档为真）")
  assert.equal(gated.split("\n").at(-1), "edit batch: 1/3 entries applied, 2 failed — 1 file(s) written: notes.txt")
})

test("CLI 41-3 批内行号形空串按删除生效：一条删、一条替换各按语义，内容形空串仍拒", async () => {
  const root = fixture("empty-string")
  const p = join(root, "p.txt")
  const q = join(root, "q.txt")
  writeFileSync(p, "keep\ndrop\nchange\n")
  writeFileSync(q, "dup\ndup\n")
  const qBefore = sha(q)

  const receipt = await editTool.execute({ edits: [
    { path: "p.txt", line: 2, new_string: "" },
    { path: "p.txt", old_string: "change", new_string: "CHANGED" },
    { path: "q.txt", old_string: "dup", new_string: "", replace_all: true },
  ] }, { cwd: root })

  // ① 行号形空串 = 删除：那一行真没了，同批的替换照自己的语义落
  assert.equal(readFileSync(p, "utf8"), "keep\nCHANGED\n", "空串删行与替换各按自己的语义生效")
  // ② 内容形空串仍拒：不该静默删掉全部匹配（q.txt 字节逐字不变）
  assert.equal(sha(q), qBefore, "内容形空串的条目一个字节也没写")
  // ③ 回执逐条说清：删行说「删了哪行」，替换说「换了几处」，内容形空串报它自己那句
  const lines = receipt.split("\n")
  assert.ok(lines[0].startsWith("Deleted line 2 of p.txt"), `第 1 条是删行回执：${lines[0]}`)
  assert.ok(receipt.includes("\nEdited p.txt: replaced 1 occurrence(s)"), `第 2 条是替换回执：\n${receipt}`)
  const failed = lines.filter((l) => /^edits\[2\] — failed: /.test(l))
  assert.equal(failed.length, 1, `第 3 条按原位报它自己：\n${receipt}`)
  assert.match(failed[0], /content-based/, `报文点名这是内容形：${failed[0]}`)
  assert.match(failed[0], /line-based/, `报文指到行号形可传空串：${failed[0]}`)
  assert.equal(lines.at(-1), "edit batch: 2/3 entries applied, 1 failed — 1 file(s) written: p.txt")
  assert.doesNotMatch(receipt, /nothing written|no files written/, "批面回执不说「什么都没写」那句假话")
})