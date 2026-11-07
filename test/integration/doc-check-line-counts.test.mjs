/**
 * doc-check-line-counts.test.mjs — 集成用例 26-5（RTM CLI 端故事 26「清账要先有一把可复述的尺」；
 * 判据原文 = `test/RTM.md` 第 26 节）。
 *
 * 业务入口 = 真 `doc_check` 工具调用（`thincoder-core/agent-tools/doc-check.mjs` 的 `report` + 显式 `docs` + `lines`）——
 * 不直调 `runDocCheck`（读数面的 `tier` 另就同一夹具取引擎返回对象作同源读数，同 26-3 的取法）。
 * 断言面 = 工具回执文本（报面读数块 / 末行结论句 / verdict 首行）与两处调用面的整数相等。
 *
 * 机制 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「行数读数」块（量法单源 = `countContentLines`；
 *   档位标记只给源 / 单元测试档；读数不是判据、不进 `gate`）。
 * 夹具 = 系统临时域（`mkdtempSync`）⇒ 零落仓 + 并发免疫；各例各自独立起一份。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-check-line-counts.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"
import { DOC_CHECK_BUILTINS, runDocCheck } from "../../thincoder-core/doc-check/index.mjs"
// 缝档（手跑读数器）= 再出口：同源判取的是同一个函数。
import { countContentLines as seamCountContentLines } from "../../scripts/doc-check-linecounts.mjs"

const TMP = []

/** 夹具：`{相对路径: 内容}` ⇒ 临时域根（绝对路径）。 */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "lc-integration-"))
  TMP.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

/** n 行内容（末行带换行）——内容行数 = n。 */
const body = (n, tag = "L") => Array.from({ length: n }, (_, i) => `${tag}${i + 1}`).join("\n") + "\n"

/** 26-5 的三档夹具：`.mjs` 812（越硬限）∥ `.mjs` 500（恰在软线上，不标）∥ `.md` 900（只出数）。 */
const CASE = {
  "docs/target.md": "# 靶档\n\n正文一行。\n",
  "src/big.mjs": body(812),
  "src/ok.mjs": body(500),
  "docs/big.md": body(900, "D"),
}
const LINES = ["src/big.mjs", "src/ok.mjs", "docs/big.md"]

/** 业务入口：真工具调用（`report` + 显式 `docs` + `lines`）。 */
const runWithLines = (root, lines) => docCheckTool.execute({ mode: "report", docs: ["docs/target.md"], lines, target: root }, { agent: { cwd: root } })
const runPlain = (root) => docCheckTool.execute({ mode: "report", docs: ["docs/target.md"], target: root }, { agent: { cwd: root } })

/** 读数块 = 块首行起、到合计行为止（块内无空行）。 */
function blockLines(report) {
  const lines = report.split("\n")
  const start = lines.findIndex((l) => l.startsWith("行数读数（量法 = countContentLines"))
  assert.notEqual(start, -1, `报面里没有读数块：\n${report}`)
  const end = lines.findIndex((l, i) => i >= start && l.startsWith("合计 "))
  assert.notEqual(end, -1, `读数块没有合计行：\n${report}`)
  return lines.slice(start, end + 1)
}

after(() => { for (const d of TMP) removeTempDirBestEffort(d) })

test("CLI 26-5 行数读数与缝档同源：逐档整数相等，越线标记与两常量一致，读数不进 hits", () => {
  const root = fixture(CASE)
  const report = runWithLines(root, LINES)
  const block = blockLines(report)
  assert.equal(block.length, 5, `块首行 + 三档 + 合计行：${JSON.stringify(block)}`)
  // 三档标记：812 越硬限 ∥ 500 恰在软线（严格大于 ⇒ 不标）∥ .md 900 只出数；行序 = 路径升序
  assert.equal(block[1], "  900  docs/big.md", `.md 只出数：${block[1]}`)
  assert.equal(block[2], `  812  src/big.mjs  · 越 ${DOC_CHECK_BUILTINS.fileHardMax} 硬限（必须拆）`, `硬限标记：${block[2]}`)
  assert.equal(block[3], "  500  src/ok.mjs", `500 不标：${block[3]}`)
  assert.equal(block[4], "合计 3 档（越硬限 1 · 越软线 0 · 未越线 2）", `合计三数：${block[4]}`)
  // 缝档再出口与 `lines` 读数逐档相等（一条实现，缝档只转出）
  const res = runDocCheck(root, { docs: ["docs/target.md"], lines: LINES })
  for (const r of res.lineReads) {
    assert.equal(r.lines, seamCountContentLines(readFileSync(r.file, "utf8")), `${r.file} 两读相等`)
  }
  assert.equal(res.lineReads.find((r) => r.file.endsWith("big.md")).tier, null, `.md 档 tier = null：${JSON.stringify(res.lineReads)}`)
  // 同一档同一次调用与不给 lines 时 hits 逐字相等（末行仍是结论句）
  const plainHits = runDocCheck(root, { docs: ["docs/target.md"] }).hits
  assert.deepEqual(res.hits, plainHits, "读数不进 hits")
  const withoutBlock = report.split("\n").filter((l) => !block.includes(l)).join("\n")
  assert.equal(withoutBlock, runPlain(root), "既有报面零改：去掉读数块逐字等于不给 lines 的报面")
  assert.match(report.split("\n").at(-1), /^结论：/, `末行仍是结论句：${report.split("\n").at(-1)}`)
})

test("CLI 26-5 异常：gate + lines ⇒ 明确拒绝（抛错点名、不产 verdict 首行），去 lines 再跑照常判决", () => {
  const root = fixture(CASE)
  assert.throws(
    () => docCheckTool.execute({ mode: "gate", docs: ["docs/target.md"], lines: LINES, target: root }, { agent: { cwd: root } }),
    (err) => {
      assert.match(err.message, /^doc_check: /, `抛错串首：${err.message}`)
      assert.ok(err.message.includes("`lines`"), `点名原因：${err.message}`)
      assert.ok(!err.message.includes("DOC-CHECK GATE:"), "不产 verdict 首行")
      return true
    }
  )
  const gate = docCheckTool.execute({ mode: "gate", docs: ["docs/target.md"], target: root }, { agent: { cwd: root } })
  assert.match(gate.split("\n")[0], /^DOC-CHECK GATE: PASS/, `去 lines 后照常判决：${gate.split("\n")[0]}`)
  assert.ok(!gate.includes("行数读数"), "gate 面不出读数块")
})