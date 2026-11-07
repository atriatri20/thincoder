/**
 * doc-check-line-refs.test.mjs — 集成用例 26-1 / 26-2 / 26-3 / 26-4（RTM CLI 端故事 26「清账要先有一把可复述的尺」；
 * 判据原文 = `test/RTM.md` 第 26 节）。
 *
 * 业务入口 = 真 `doc_check` 工具调用（`thincoder-core/agent-tools/doc-check.mjs` 的 `report` / `gate` + 显式 `docs`）——
 * 不直调 `runDocCheck`（26-3 ∥ 26-4 另就同一夹具取 `runDocCheck` 的 `hits` 作同源读数）：本档要的是「清账读到的那份清单」
 * 与「交付门判出什么」两个业务可观察结果。
 * 断言面 = 工具回执文本（报面）：清单块的量法行 / 合计行 / 逐处行 / 空态行、末行结论句，以及 `gate` 面首行判决串与命中行。
 *
 * 机制 = `docs/core/design/DOC-DISCIPLINE.md` §3.23 条目 W（行号坐标：`report` 面出清账清单 ∥ `gate` 面计入 `hits` 拦）
 *   + §3.20（锚面射程：扩展名闭集 ∥ 豁免只免裸名——26-4）。
 * 夹具 = 系统临时域（`mkdtempSync`）⇒ 零落仓 + 并发免疫；各例各自独立起一份（「同一夹具」= 同一夹具形，不依赖执行序；
 *   26-4 的两半住在同一个夹具根——换的是被引两处的写法，不是夹具）。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-check-line-refs.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"
import { runDocCheck } from "../../thincoder-core/doc-check/index.mjs"

const TMP = []

/** 夹具：`{相对路径: 内容}` ⇒ 临时域根（绝对路径）。 */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "lr-integration-"))
  TMP.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

/** 业务入口：真工具调用（`report` + 显式 `docs`）——回执文本即清账读到的那份报面。 */
const runReport = (root, docs) => docCheckTool.execute({ mode: "report", docs }, { agent: { cwd: root } })

/** 清单块 = 从量法行起、到末行结论之前的那几行。 */
function blockLines(report) {
  const lines = report.split("\n")
  const start = lines.findIndex((l) => l.startsWith("量法（行号坐标清单）"))
  assert.notEqual(start, -1, `报面里没有清单块（量法行 = 块首行）：\n${report}`)
  assert.match(lines[lines.length - 1], /^结论：/, `末行仍是结论句：${lines[lines.length - 1]}`)
  return lines.slice(start, lines.length - 1)
}

after(() => { for (const d of TMP) removeTempDirBestEffort(d) })

test("CLI 26-1 三形各一处：量法行 + 合计 3 处 + 三行逐处（①②③）+ 末行仍是结论", () => {
  const root = fixture({
    "docs/common.md": "# 共用档\n\n正文。\n",
    "docs/notes.md": [
      "# 笔记",
      "",
      "紧贴：docs/common.md:12 处。",
      "承名：见 docs/common.md，第 :34 行。",
      "段落承名：docs/common.md",
      ":56 处。",
      "",
    ].join("\n"),
  })
  const report = runReport(root, ["docs/notes.md"])
  const block = blockLines(report)
  // 首行 = 量法行：抽取式（档名 ∥ 坐标）与扫描域都在这一行
  assert.ok(block[0].includes("档名 = /"), `量法行缺档名抽取式：${block[0]}`)
  assert.ok(block[0].includes("坐标 = /"), `量法行缺坐标抽取式：${block[0]}`)
  assert.ok(block[0].includes("扫描域 = 传入清单 1 档"), `量法行缺扫描域：${block[0]}`)
  // 合计行
  assert.equal(block[1], "正文面 3 处 · 围栏内 0 处 · 合计 3 处")
  // 逐处行：三行，形别 ①②③ 各一
  const perHit = block.slice(2)
  assert.equal(perHit.length, 3, `逐处行应为三行：${JSON.stringify(perHit)}`)
  for (const mark of ["①", "②", "③"]) {
    assert.equal(perHit.filter((l) => l.includes(mark)).length, 1, `形别 ${mark} 应各一处：${JSON.stringify(perHit)}`)
  }
  // 末行仍是结论句（清单不抢结论的位）
  assert.match(report.split("\n").at(-1), /^结论：0 条命中/)
})

test("CLI 26-2 无行号坐标：量法行仍出 + 空态行「行号坐标 0 处」+ 块内无空行", () => {
  const root = fixture({ "docs/prose.md": "# 纯正文档\n\n这一行没有行号坐标，也没有档名。\n" })
  const report = runReport(root, ["docs/prose.md"])
  const block = blockLines(report)
  assert.ok(block[0].startsWith("量法（行号坐标清单）"), `块首行必须是量法行：${block[0]}`)
  assert.ok(block[0].includes("扫描域 = 传入清单 1 档"), `量法行缺扫描域：${block[0]}`)
  assert.equal(block[1], "行号坐标 0 处")
  assert.equal(block.length, 2, `无命中时块内只此两条：${JSON.stringify(block)}`)
  assert.ok(block.every((l) => l.trim() !== ""), "块内不留空行——空行读起来像「没跑」")
})

test("CLI 26-3 闸面拦：同一处真坐标 ⇒ gate 判 REFUSED（行号坐标 1 处），report 清单合计与 hits.lineRefs 逐字相等", () => {
  const root = fixture({
    "docs/common.md": "# 共用档\n\n正文。\n",
    "docs/leak.md": "# 漏\n\n见 docs/common.md:12 那一行。\n",
  })
  const gate = docCheckTool.execute({ mode: "gate", docs: ["docs/leak.md"] }, { agent: { cwd: root } })
  const first = gate.split("\n")[0]
  assert.equal(first, "DOC-CHECK GATE: REFUSED（行号坐标 1 处）", `首行判决串：${first}`)
  assert.match(gate, /✗ 行号坐标 docs\/leak\.md:3 ① /, `命中行形：${gate}`)
  // 清账读数与闸面计数同源：同一份采集，不各采一次
  const res = runDocCheck(root, { mode: "gate", docs: ["docs/leak.md"] })
  assert.equal(res.hits.lineRefs, 1, "闸面计数 = 1")
  assert.equal(res.hits.total, res.hits.anchors + res.hits.paragraph + res.hits.lineRefs, "三数之和 = hits.total")
  const block = blockLines(runReport(root, ["docs/leak.md"]))
  assert.equal(block[1], `正文面 ${res.hits.lineRefs} 处 · 围栏内 0 处 · 合计 ${res.hits.lineRefs} 处`, `清单合计与闸面计数逐字相等：${block[1]}`)
})

test("CLI 26-4 锚面射程：悬空代码路径 + 带目录段的类名 ⇒ REFUSED（锚 2 条）；换裸名 ∥ 在盘路径 ⇒ PASS", () => {
  const root = fixture({
    "docs/impl.mjs": "export const x = 1\n",
    // 上半：一处解析不到的代码路径（非 .md）∥ 一处带目录段、解析不到的类名 token
    "docs/leak.md": "# 漏\n\n实现见 thincoder-core/missing/impl.mjs 与 .thincoder/advisor.md 两处。\n",
    // 下半：同一个夹具根，把两处换成裸名 ∥ 在盘路径
    "docs/clean.md": "# 清\n\n实现见 docs/impl.mjs 与 advisor.md 两处。\n",
  })
  const gate = docCheckTool.execute({ mode: "gate", docs: ["docs/leak.md"] }, { agent: { cwd: root } })
  const first = gate.split("\n")[0]
  assert.equal(first, "DOC-CHECK GATE: REFUSED（锚 2 条）", `首行判决串：${first}`)
  const hitLines = gate.split("\n").filter((l) => l.startsWith("✗ "))
  assert.equal(hitLines.length, 2, `命中行应为两条：${JSON.stringify(hitLines)}`)
  assert.ok(hitLines.every((l) => l.startsWith("✗ 锚·档缺 ")), `两条都归锚类（档缺）：${JSON.stringify(hitLines)}`)
  assert.ok(hitLines.some((l) => l.includes("thincoder-core/missing/impl.mjs")), `代码路径那条点名：${JSON.stringify(hitLines)}`)
  assert.ok(hitLines.some((l) => l.includes(".thincoder/advisor.md")), `带目录段类名那条点名：${JSON.stringify(hitLines)}`)
  // 两条都来自锚面：行号坐标那一类不得跟着计数（本夹具零坐标）
  const res = runDocCheck(root, { mode: "gate", docs: ["docs/leak.md"] })
  assert.equal(res.hits.anchors, 2, "锚 = 2 条")
  assert.equal(res.hits.lineRefs, 0, "行号坐标 = 0 处")
  // 下半：裸名（类名免照免）∥ 在盘路径（解析得到）⇒ 放行
  const clean = docCheckTool.execute({ mode: "gate", docs: ["docs/clean.md"] }, { agent: { cwd: root } })
  assert.equal(clean.split("\n")[0], "DOC-CHECK GATE: PASS", `换裸名 ∥ 在盘路径后应放行：${clean.split("\n")[0]}`)
})
