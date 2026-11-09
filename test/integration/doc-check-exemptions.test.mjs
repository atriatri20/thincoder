/**
 * doc-check-exemptions.test.mjs — 集成用例 45-1（RTM CLI 端故事 45「已裁定的假阳照列不阻断，撤销后重新计入」；
 * 用例行原文 = `test/rtm/guard.md` 第 45 节）。
 *
 * 业务入口 = 真 `doc_check` 工具调用（`mode:"gate"` + 显式 `docs` + `target`），与 44-1 同一个入口。
 * 业务可观察结果 = 七段：① 无登记判红；② 登记后首行 `PASS` 且逐条列出（四项齐全）；③ 命中所在一行之上插一行空行
 * 仍 `PASS`（识别键不含行号）；④ 命中文本改一个字 ⇒ 回 `REFUSED` + `登记未命中 1 条`；⑤ 撤销登记 ⇒ 回 `REFUSED`；
 * ⑥ 条目缺 `review` ⇒ 不生效、照拦，并点名；⑦ 同一档同时落在排除面内 ⇒ 排除优先（该档不入判、豁免块零出）。
 * 判据 = `docs/core/design/DOC-CHECK.md` §2.7（条目五字段 ∥ 识别键 = 档 + 判据类 + 文本、不含行号 ∥ 装配处分类 ∥
 * 排除优先）∥ §6 AC-X1–AC-X5；回指 = `docs/core/requirements/DOC-CHECK.md` F20 ∥ AC-18 ∥ F21 ∥ AC-19。
 *
 * 夹具 = 系统临时域（`mkdtempSync`）⇒ 零落仓 + 并发免疫；七段同一夹具、只换 manifest 或档内一字。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-check-exemptions.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { removeTempDirBestEffort } from "../teardown.mjs"

import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"

const TMP = []
after(() => { for (const d of TMP) removeTempDirBestEffort(d) })

const HIT_TEXT = "docs/planned/NEW.md"
const DOC = "# X\n\n见 docs/planned/NEW.md。\n"
const DOC_SHIFTED = "# X\n\n\n见 docs/planned/NEW.md。\n"
const DOC_CHANGED = "# X\n\n见 docs/planned/NEW2.md。\n"
const ENTRY = {
  file: "docs/design/X.md",
  kind: "锚·档缺",
  text: HIT_TEXT,
  why: "规则要求计划新建件先写路径",
  review: "2027-01-31",
}

/** 夹具 manifest；`entry === null` ⇒ 不写 `docCheckExemptions`；`exclude === undefined` ⇒ 不写排除面。 */
const manifestText = (entry, exclude) => JSON.stringify({
  version: 1,
  docRoot: { batches: "docs/batches" },
  ...(entry === null && exclude === undefined ? {} : {
    index: {
      ...(entry === null ? {} : { docCheckExemptions: Array.isArray(entry) ? entry : [entry] }),
      ...(exclude === undefined ? {} : { docCheckExcludePaths: exclude }),
    },
  }),
}, null, 2) + "\n"

function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "dcex2-integration-"))
  TMP.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

test("CLI 45-1 逐条豁免：登记不阻断且逐条列出，撤销即回，排除面优先", () => {
  const root = fixture({
    "PROJECT-MANIFEST.json": manifestText(null, undefined),
    "docs/design/X.md": DOC,
  })
  const run = () => docCheckTool.execute({ mode: "gate", docs: ["docs/design/X.md"], target: root }, { agent: { cwd: root } })
  const firstLine = (report) => report.split("\n")[0]
  const exemptBlock = (report) => report.split("\n").filter((l) => l.trimStart().startsWith("✗ ") && l.includes("（复审 "))

  // ① 无登记 ⇒ 判红、豁免块零出
  const g1 = run()
  assert.equal(firstLine(g1), "DOC-CHECK GATE: REFUSED（锚 1 条）", g1)
  assert.equal(exemptBlock(g1).length, 0, g1)

  // ② 登记一条假阳 ⇒ 首行 PASS，且四项齐全地列出
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), manifestText(ENTRY, undefined))
  const g2 = run()
  assert.equal(firstLine(g2), "DOC-CHECK GATE: PASS", g2)
  assert.equal(g2.includes("豁免 1 条（已裁定假阳，不阻断交付）："), true, g2)
  const block2 = exemptBlock(g2)
  assert.equal(block2.length, 1, `豁免块行数不符：\n${g2}`)
  for (const part of ["锚·档缺", HIT_TEXT, "docs/design/X.md", "规则要求计划新建件先写路径", "复审 2027-01-31"]) {
    assert.equal(block2[0].includes(part), true, `豁免块缺「${part}」：\n${g2}`)
  }

  // ③ 命中所在一行之上插一行空行 ⇒ 仍 PASS（识别键不含行号）
  writeFileSync(join(root, "docs/design/X.md"), DOC_SHIFTED)
  assert.equal(firstLine(run()), "DOC-CHECK GATE: PASS")

  // ④ 命中文本改一个字 ⇒ 回 REFUSED，且出「登记未命中 1 条」
  writeFileSync(join(root, "docs/design/X.md"), DOC_CHANGED)
  const g4 = run()
  assert.equal(firstLine(g4).startsWith("DOC-CHECK GATE: REFUSED"), true, g4)
  assert.equal(g4.includes("登记未命中 1 条"), true, g4)

  // ⑤ 删掉登记 ⇒ 同一处重新计入、豁免块零出
  writeFileSync(join(root, "docs/design/X.md"), DOC)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), manifestText(null, undefined))
  const g5 = run()
  assert.equal(firstLine(g5), "DOC-CHECK GATE: REFUSED（锚 1 条）", g5)
  assert.equal(exemptBlock(g5).length, 0, g5)

  // ⑥ 条目缺 review ⇒ 该条不生效（命中照拦），并点名缺哪个字段
  const { review: _drop, ...noReview } = ENTRY
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), manifestText(noReview, undefined))
  const g6 = run()
  assert.equal(firstLine(g6).startsWith("DOC-CHECK GATE: REFUSED"), true, g6)
  assert.equal(g6.includes("豁免登记无效 1 条"), true, g6)
  assert.equal(g6.includes("缺 review"), true, g6)

  // ⑦ 同一档又落在排除面内 ⇒ 排除优先：不入判、豁免块零出
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), manifestText(ENTRY, ["docs/design"]))
  const g7 = run()
  assert.equal(firstLine(g7), "DOC-CHECK GATE: PASS", g7)
  assert.equal(g7.includes("排除 1 档（manifest 排除面命中，未判）：docs/design/X.md"), true, g7)
  assert.equal(g7.includes("豁免 1 条"), false, `排除优先，豁免块不得出：\n${g7}`)
})