/**
 * doc-write-gate.test.mjs — 集成用例 7-14 ∥ 7-18（RTM CLI 端故事 7；判据原文 = `test/rtm/guard.md` 第 7 节）。
 *
 * 机制 = `docs/core/design/DOC-DISCIPLINE.md` §3.26 条目 Z（写前文档机检门：判本笔触碰的段落）∥ §5 `A-DD40`
 * ③⑤；需求 = `docs/core/requirements/DOC-CHECK.md` F14 ∥ AC-12。
 *
 * 业务入口 = 真 `edit` 工具（`tools/file.mjs`）往一篇**设计档**写一笔——不直调 `runDocWriteGate`：
 * 本例测的是「写者把坏字写进规范档、当场被拒、盘上逐字不变」这件事的业务可观察结果。
 * 交互组件 = `write-path.writeThroughPath`（`op === "write"` 调门）⟷ `doc-write-gate.runDocWriteGate`
 * （改后整份内容 + 判定区 ⇒ `runDocCheck` 的 `texts` ∥ `zones`）⟷ `doc-check` 的锚判据（`档缺`）。
 *
 * 夹具 = 系统临时域（项目根 + 自带 `PROJECT-MANIFEST.json`，`docRoot.design = docs/design`）——零落仓、可并发；
 * 面与解析基准随夹具走，不读本仓 manifest。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-write-gate.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { editTool } from "../../thincoder-core/tools/file.mjs"

const DOC_REL = "docs/design/fixture.md"
const REAL_REL = "docs/design/real.md" // 在盘档（改成这条之后同一笔应当落盘）
const BODY = "# 夹具设计档\n\n现有段落。\n"

const projects = []
after(() => {
  // 句柄未即释时清理会抛 ⇒ 走助手（有界重试、失败只写一行 stderr，不判红整档）。
  for (const p of projects) removeTempDirBestEffort(p)
})

/** 夹具项目根（项目声明 + 设计档目录；不落盘任何真实仓内容）。 */
function makeProject(tag) {
  const root = mkdtempSync(join(tmpdir(), `dwg-int-${tag}-`))
  projects.push(root)
  writeFileSync(
    join(root, "PROJECT-MANIFEST.json"),
    JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design", batches: "docs/batches" } }, null, 2),
  )
  mkdirSync(join(root, "docs/design"), { recursive: true })
  writeFileSync(join(root, REAL_REL), "# 在盘档\n\n这一档存在。\n")
  writeFileSync(join(root, DOC_REL), BODY)
  return root
}

test("CLI 7-14 错误 · 设计档直写盘带悬空档名 ⇒ 拒写、目标档逐字不变；改成在盘全路径后同一笔落盘", async () => {
  const root = makeProject("r714")
  const before = readFileSync(join(root, DOC_REL), "utf8")
  const ctx = { cwd: root }

  // ① 写一笔含悬空档名的段落 ⇒ 拒写（坏字当场进不了盘）
  await assert.rejects(
    () => editTool.execute({ path: DOC_REL, old_string: "现有段落。", new_string: `现有段落，另见 \`docs/design/nope.md\`。` }, ctx),
    (e) => {
      assert.match(e.message, /^DOC-CHECK GATE: REFUSED（锚 1 条）/, `拒串首行 = 引擎 verdict 词：${e.message}`)
      assert.match(e.message, /✗ 锚·档缺 docs\/design\/fixture\.md:3/, `命中行落回目标档坐标：${e.message}`)
      assert.match(e.message, /判面：改动区 1 区 · 判定区 1 区/, `判面行点名本笔改动区与判定区：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, DOC_REL), "utf8"), before, "拒写 ⇒ 目标档字节逐字不变（零字节落盘）")

  // ② 改成在盘全路径 ⇒ 同一笔落盘成功（门不是「一律拦」，判的还是这段字）
  const receipt = await editTool.execute({ path: DOC_REL, old_string: "现有段落。", new_string: `现有段落，另见 \`${REAL_REL}\`。` }, ctx)
  assert.match(receipt, /Edited docs\/design\/fixture\.md/, `落盘回执：${receipt}`)
  const after = readFileSync(join(root, DOC_REL), "utf8")
  assert.match(after, new RegExp(`另见 \`${REAL_REL}\``), "改对之后已落盘")
  assert.equal(after.slice(0, after.indexOf("现有段落")), before.slice(0, before.indexOf("现有段落")), "目标段之前逐字不变")
})

test("CLI 7-18 边界 · 只动围栏块内一个空行 ⇒ 判定区取到整份文本、块内示例路径不入判", async () => {
  const root = makeProject("r718")
  const fenced = "# 围栏夹具\n\n```text\ndocs/design/example-only.md\n\n```\n"
  writeFileSync(join(root, DOC_REL), fenced)
  const receipt = await editTool.execute({
    path: DOC_REL,
    old_string: "```text\ndocs/design/example-only.md\n\n```",
    new_string: "```text\ndocs/design/example-only.md\n```",
  }, { cwd: root })
  assert.match(receipt, /Edited docs\/design\/fixture\.md/, receipt)
  assert.equal(readFileSync(join(root, DOC_REL), "utf8"), fenced.replace("example-only.md\n\n```", "example-only.md\n```"))
})
