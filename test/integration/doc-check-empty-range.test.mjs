/**
 * doc-check-empty-range.test.mjs — 集成用例 36-4（RTM CLI 端故事 36「跨项目文档清单的交付门按各档自身项目根判」；
 * 判据原文 = `test/rtm/guard.md` 第 36 节）。
 *
 * 这一行判的是**交付门首行怎么读**的第四态：前三种是 36-1 一档干净读 `PASS`、36-2 ∥ 36-3 有命中读 `REFUSED`；
 * 本行判「一个档都没判」——首行必须读作 `ERROR（0 档受检——空范围不判 PASS）`，不得读成「全清」
 * （机制单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「空范围不判 PASS」条）。
 * 四个入口都要量：显式空清单 ∥ 省略 `docs` 而本会话零 `.md` 触达 ∥ 路径全不在盘 ∥ 全非 `.md`；
 * 原因不丢由既有 `范围为空：…` 说明行与跳过桶头承担，故一并断言它们仍在。
 * 对照 = 同一入口换成一档真的判过且干净的档 ⇒ 首行仍逐字 `PASS`（防把门判宽：宽到连判过的绿档也判不出区分）。
 *
 * 业务入口 = 真 `doc_check` 工具调用（`agent-tools/doc-check.mjs` 的 `gate` 面 + 显式 `target`）——
 * 不直调引擎：本用例要的是「用户收口时读到的那一行」，而首行的组装在引擎、读法在工具面。
 * 夹具 = 系统临时域（`mkdtempSync`）⇒ 零落仓 + 并发免疫。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-check-empty-range.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"

/** 空范围唯一首行（DS 侧口径 · 四个入口同一句回）。 */
const EMPTY_FIRST = "DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）"

/** 「0 档受检」那行（逐字：空范围的实况照说，不得只给空范围）。 */
const zeroRangeLine = (src) => `范围：${src} —— **0 档受检**（空清单：本次没有判任何档，不得读作「已检」）`

const TMP = []

/** 夹具：`{相对路径: 内容}` ⇒ 临时域根（绝对路径）。 */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "empty-range-"))
  TMP.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

/** 业务入口：真工具调用（`gate` 面 + 显式 `target`）。`touched` = 本会话触达记账。 */
const runGate = (root, args, touched = []) =>
  docCheckTool.execute({ mode: "gate", target: root, ...args }, { agent: { cwd: root, _touchedFiles: touched } })

/** 首行判决串（唯一机判串）。 */
const firstLineOf = (receipt) => receipt.split("\n")[0]

after(() => { for (const d of TMP) removeTempDirBestEffort(d) })

test("CLI 36-4 边界 · 一个档都没判 ⇒ 首行 ERROR（0 档受检），不产 PASS；对照那档仍 PASS", () => {
  const root = fixture({
    "docs/clean.md": "# 干净档\n\n一句话。\n",
    "docs/data.json": "{\"a\":1}\n",
    "docs/notes.txt": "纯文本。\n",
  })

  // 四个入口：同一个判词位，原因由说明行 / 跳过行承担
  const entries = [
    ["显式空清单", { docs: [] }, [], "显式 docs"],
    ["本会话零 .md 触达", {}, [], "本会话写过的文档"],
    ["路径全不在盘", { docs: ["no/such/a.md", "no/such/b.md"] }, [], "显式 docs"],
    ["全非 .md", { docs: ["docs/data.json", "docs/notes.txt"] }, [], "显式 docs"],
  ]
  for (const [name, args, touched, src] of entries) {
    const receipt = runGate(root, args, touched)
    assert.equal(firstLineOf(receipt), EMPTY_FIRST, `入口「${name}」首行须读作「没判」：${receipt}`)
    assert.ok(receipt.includes(zeroRangeLine(src)), `入口「${name}」须逐字照出「0 档受检」行（不许只给空范围）：${receipt}`)
    assert.match(receipt, /^范围为空：/m, `入口「${name}」须给出「为什么空」的说明行：${receipt}`)
    // 一条 verdict：全文只出现一次机判串
    assert.equal(receipt.split("\n").filter((l) => l.includes("DOC-CHECK GATE:")).length, 1, `入口「${name}」须只有一条 verdict：${receipt}`)
  }

  // 原因不丢：两种来源各一句分流句（有 ∥ 无跳过行）
  assert.ok(runGate(root, { docs: [] }).includes("范围为空：显式 docs 是空清单——列出要判的档后复跑"))
  assert.ok(runGate(root, {}).includes("范围为空：本会话没有写过 .md 档——若确认改过 ⇒ 显式传 docs"))
  const missing = runGate(root, { docs: ["no/such/a.md", "no/such/b.md"] })
  assert.ok(missing.includes("跳过 2 档（已不在盘，未检）：no/such/a.md ∥ no/such/b.md"), missing)
  assert.ok(missing.includes("范围为空：显式 docs 里没有可判档——见上方跳过行"), missing)
  const notMd = runGate(root, { docs: ["docs/data.json", "docs/notes.txt"] })
  assert.ok(notMd.includes("跳过 2 档（非 markdown 档，未检）：docs/data.json ∥ docs/notes.txt"), notMd)

  // 对照：同一入口，一档真的判过且干净 ⇒ 首行仍逐字 PASS（「没判」与「全清」不再同形）
  const clean = runGate(root, { docs: ["docs/clean.md"] })
  assert.equal(firstLineOf(clean), "DOC-CHECK GATE: PASS", `判过且干净的档仍须 PASS：${clean}`)
})
