/**
 * doc-check-fence-verdict.test.mjs — 集成用例 26-6（RTM CLI 端故事 26「清账要先有一把可复述的尺」；
 * 判据原文 = `test/RTM.md` 第 26 节）。
 *
 * 这一行判的是 `gate` 面第三条判据（行号坐标）的**判面 = 正文面**：围栏块里的坐标是逐字证据
 * （日志 ∥ 拒文 ∥ diff），钉的是被引那份原文里的位置，不随盘面漂 ⇒ 不入判，只出一行读数；
 * 围栏块外的坐标是指向今天盘面的指针 ⇒ 照判（机制单源 = `docs/core/design/DOC-DISCIPLINE.md`
 * §3.23「判面 = 正文面」块）。三半：围栏内一处 + 围栏外一处 ⇒ 首行只计外那处；只留围栏内那处 ⇒ `PASS`；
 * `report` 面的清账读数照旧含围栏内那处（读数不是判据）。
 *
 * 业务入口 = 真 `doc_check` 工具调用（`agent-tools/doc-check.mjs` 的 `gate` ∥ `report` + 显式 `docs`）——
 * 不直调 `runDocCheck`：本档要的是「交付门判出什么」与「清账读到什么」两个业务可观察结果。
 * 断言面 = 工具回执文本（首行判决串 ∥ 命中行 ∥ 围栏内读数行 ∥ 清单块合计行）。
 *
 * 夹具 = 系统临时域（`mkdtempSync`）⇒ 零落仓 + 并发免疫；三半住在同一份夹具根里（换的是被调用的档，不是夹具）。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-check-fence-verdict.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"

const TMP = []

/** 夹具：`{相对路径: 内容}` ⇒ 临时域根（绝对路径）。 */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "fence-verdict-"))
  TMP.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

/** 业务入口：真工具调用（`gate` ∥ `report` + 显式 `docs`）——回执文本即用户读到的那一面。 */
const runGate = (root, docs) => docCheckTool.execute({ mode: "gate", docs }, { agent: { cwd: root } })
const runReport = (root, docs) => docCheckTool.execute({ mode: "report", docs }, { agent: { cwd: root } })

/** 首行判决串（唯一机判串）。 */
const firstLineOf = (receipt) => receipt.split("\n")[0]
/** 命中行（`✗ …`）——围栏内那处一条也不许出现在这里。 */
const hitLinesOf = (receipt) => receipt.split("\n").filter((l) => l.startsWith("✗ "))
/** 围栏内读数行（固定句形）。 */
const FENCED_NOTE = /^围栏内行号坐标 (\d+) 处——快照里的位置，不是指针；不入判（report 清单照列）$/

after(() => { for (const d of TMP) removeTempDirBestEffort(d) })

test("CLI 26-6 正常 · gate 判面 = 正文面：围栏内那处只出读数行、围栏外那处照判；只留围栏内 ⇒ PASS；report 清单仍含围栏内", () => {
  const root = fixture({
    "docs/common.md": "# 共用档\n\n正文。\n",
    // 前半 / 后半同一份档：围栏外一处（第 3 行）∥ 围栏内一处（第 6 行）
    "docs/both.md": [
      "# 两面并存档",
      "",
      "正文：见 docs/common.md:12 那一行。",
      "",
      "```text",
      "围栏：docs/common.md:34 那一行。",
      "```",
      "",
    ].join("\n"),
    // 后半：只留围栏内那处
    "docs/fenced-only.md": [
      "# 只留围栏档",
      "",
      "```text",
      "围栏：docs/common.md:34 那一行。",
      "```",
      "",
    ].join("\n"),
  })

  // ── 前半：围栏内 ∥ 围栏外各一处 ⇒ 首行只计 1 处，围栏内那处零命中行、只出读数行 ──
  const both = runGate(root, ["docs/both.md"])
  assert.equal(firstLineOf(both), "DOC-CHECK GATE: REFUSED（行号坐标 1 处）", `首行只计正文面那一处：${both}`)
  const hits = hitLinesOf(both)
  assert.equal(hits.length, 1, `命中行只一条（围栏内那处不入命中面）：${JSON.stringify(hits)}`)
  assert.match(hits[0], /^✗ 行号坐标 docs\/both\.md:3 /, `命中的是围栏外那处（第 3 行）：${hits[0]}`)
  const noteBoth = both.split("\n").filter((l) => FENCED_NOTE.test(l))
  assert.equal(noteBoth.length, 1, `围栏内读数行恰一行：${both}`)
  assert.equal(FENCED_NOTE.exec(noteBoth[0])[1], "1", `读数行报围栏内 1 处：${noteBoth[0]}`)
  assert.doesNotMatch(both, /✗ 行号坐标 [^\n]*:6 /, `围栏内那处不出逐处命中行（改证据 = 篡改原文）：${both}`)

  // ── 后半：只留围栏内那处 ⇒ 放行，但那行读数照出（不让读者以为围栏那片没有）──
  const only = runGate(root, ["docs/fenced-only.md"])
  assert.equal(firstLineOf(only), "DOC-CHECK GATE: PASS", `围栏内坐标不入判 ⇒ 放行：${only}`)
  assert.equal(hitLinesOf(only).length, 0, `零命中行：${only}`)
  const noteOnly = only.split("\n").filter((l) => FENCED_NOTE.test(l))
  assert.equal(noteOnly.length, 1, `放行也不静默：读数行仍在：${only}`)
  assert.equal(FENCED_NOTE.exec(noteOnly[0])[1], "1", `读数行报围栏内 1 处：${noteOnly[0]}`)

  // ── 第三半：report 面的清账读数照旧含围栏内那处（读数不是判据，两面各按各的判面消费）──
  const report = runReport(root, ["docs/both.md"])
  const lines = report.split("\n")
  const total = lines.find((l) => l.startsWith("正文面 "))
  assert.equal(total, "正文面 1 处 · 围栏内 1 处 · 合计 2 处", `清单合计行逐字读数：${report}`)
  assert.equal(lines.filter((l) => l.includes("围栏内") && l.startsWith("  · ")).length, 1, `逐处行里围栏内那处带标照列：${report}`)
})
