/**
 * advisor-record-gate.test.mjs — 集成用例 17-1 / 17-2 / 17-3（RTM CLI 端故事 17「评审没写进批档就不算过」；
 * 回指需求 F-A13；机制单源 = `docs/core/design/ADVISOR-GUARDS.md` §1.2（结算判据：批档可读 ∥ 块写进并回读）∥
 * §2 第 6 条（准入面：设计评审必携 `batchDoc`）∥ §2 第 7 条（账链门：批档须挂未决台账行））。
 *
 * 业务可观察面 = 两件：① 准入回执 / 结算回执（有没有 token、拒因点名）② 同 designId 的 eng-coder spawn 门解析
 * （放行 ∥ 机械拒）。驱动面 = 准入面与账链门都走真工具 `advisorTool.execute`（两门都发生在工具入参门，
 * 结算函数不参与）；结算面直调函数本体 `settleDesignReview`——同步轨（`advisor.mjs`）与异步轨（`advisor-settle.mjs`）
 * 调的就是它，本档不重复模拟工具包装层。
 *
 * 每轮 = 一次「点火 + 结算」：§3 的轮次块由**结算**写（评审席在工程模式没有 §3 写通道），
 * 故本档不再模拟评审往 §3 写字——它只检验结算自写之后的业务结果。
 *
 * 夹具 = 系统临时域（项目根 + 六段批档 + 设计档；独立 sessions 根 ∥ 台账库目录——零落真实用户目录）。
 * 复跑（cwd = 仓根）：`node --test test/integration/advisor-record-gate.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, relative } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { countRoundBlocks, readSectionStatusWord } from "../../thincoder-core/agent-tools/batch-skeleton.mjs"
import { advisorTool } from "../../thincoder-core/agent-tools/advisor.mjs"
import { __setRecordWriterForTest, settleDesignReview } from "../../thincoder-core/agent-tools/design-token.mjs"
import { docSetKey } from "../../thincoder-core/agent-tools/review-facts.mjs"
import { resolveDesignSlot } from "../../thincoder-core/agent-tools/subagent-spawn.mjs"
import { _resetSessionsDirForTest, _setSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
// 台账模块静态链入 `node:sqlite`（W8 契约）——消费侧一律动态取（先例 `test/integration/batch-close-token-consume.test.mjs`）。
const { _resetLedgerDirForTest, _setLedgerDirForTest, ledgerAdd, ledgerClose, ledgerUpdate } = await import("../../thincoder-core/ledger.mjs")

const BATCH_REL = "docs/batches/fixture.md"
const DESIGN_REL = "docs/core/design/DESIGN-FIXTURE.md"
const DESIGN_ID = "design-17"

/** 六段批档；`blocks` = §3 存量轮次块数，`statusRow` = §3 段级状态行（`null` = 该行不存在）。 */
const recordText = ({ blocks = 0, statusRow = null } = {}) => [
  "# 夹具批 · §3 评审记录",
  "",
  "> 编制：夹具 · 2026-10-27 · 来源 = 集成夹具。",
  "",
  "## §1 讨论（主 agent）",
  "**状态行**：🔄 进行中",
  "",
  "夹具讨论。",
  "",
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "",
  "夹具任务。",
  "",
  "## §3 设计评审（评审子代理）",
  ...(statusRow ? [`**状态行**：${statusRow}`, ""] : []),
  ...Array.from({ length: blocks }, (_, i) => [`### 轮次 ${i + 1}（评审子代理）`, "", `夹具评审第 ${i + 1} 轮发现。`, ""]).flat(),
  "## §4 用户批准（主 agent）",
  "夹具批准。",
  "",
  "## §5 实施记录（eng-coder）",
  "夹具实施。",
  "",
  "## §6 验证与收口（父代理）",
  "夹具收口。",
  "",
].join("\n")

const sessionsDir = mkdtempSync(join(tmpdir(), "arg-sessions-"))
_setSessionsDirForTest(sessionsDir)
// 台账缝：账链门要读台账——夹具的账种在临时目录，不碰真实用户目录。
const ledgerDir = mkdtempSync(join(tmpdir(), "arg-ledger-"))
_setLedgerDirForTest(ledgerDir)
const roots = []
after(() => {
  __setRecordWriterForTest(null)
  _resetSessionsDirForTest()
  _resetLedgerDirForTest()
  for (const p of roots) removeTempDirBestEffort(p)
  removeTempDirBestEffort(sessionsDir)
  removeTempDirBestEffort(ledgerDir)
})

function fixture(tag, text) {
  const root = mkdtempSync(join(tmpdir(), `arg-${tag}-`))
  roots.push(root)
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "docs/core/design"), { recursive: true })
  writeFileSync(join(root, BATCH_REL), text)
  writeFileSync(join(root, DESIGN_REL), "# 设计夹具\n\n夹具正文。\n")
  const agent = { cwd: root, _slot: 1, config: { agent: { engineering: true } } }
  return { root, agent, batchAbs: join(root, BATCH_REL) }
}

let seq = 0
const mintToken = () => `2026202${++seq}-2026-2026-2026-202620262026:${Date.now() + 3600 * 1000}`
const receipt = (token) => `评审正文。\n[DESIGN-TOKEN: ${token}]\n\nVERDICT: pass`

/** 最小项目档（夹具只需「目录里有没有这份档」——形同 `DEFAULT_MANIFEST` 的键集）。 */
const MANIFEST = JSON.stringify({
  version: "0.0.0-test",
  phase: "test",
  docRoot: {
    requirements: "docs/core/requirements",
    specs: "docs/core/specs",
    design: "docs/core/design",
    modules: "docs/core/modules",
    batches: "docs/batches",
  },
  codePaths: ["thincoder-core"],
  index: { publicRepos: [] },
}, null, 2)

/** 账链门夹具：项目根（**带项目声明档**——账链门的根解析要求根是「已注册项目」）+ 六段批档 + 设计档。 */
function ledgerFixture(tag, text) {
  const root = mkdtempSync(join(tmpdir(), `arg-${tag}-`))
  roots.push(root)
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "docs/core/design"), { recursive: true })
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), MANIFEST)
  writeFileSync(join(root, BATCH_REL), text)
  writeFileSync(join(root, DESIGN_REL), "# 设计夹具\n\n夹具正文。\n")
  return { root, batchAbs: join(root, BATCH_REL) }
}

/** 种一行指着 `batchAbs` 的台账行并返回行号（**只走写面，不直写 SQL**——`在途` 必挂 `task_book`
 *  这类 CHECK 正是被测前提的一半）：`ledgerAdd` 落 `待讨论` → `ledgerUpdate` 迁 `在途` + 写指针。 */
function seedRow(root, batchAbs) {
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "夹具批 · 账链门" }, boundary: root })
  ledgerUpdate({ cwd: root, id, patch: { status: "在途", task_book: relative(root, batchAbs).replace(/\\/g, "/") }, boundary: root })
  return id
}

/** 评审实例键（结算读的就是它：`batchDoc` 必携，`docSetKey` 给封印集合）。 */
const runOf = (root, batchAbs) => ({ reviewId: DESIGN_ID, designId: DESIGN_ID, batchDoc: batchAbs, docSetKey: docSetKey([DESIGN_REL], root), open: true })

test("CLI 17-1 错误 · 块写不进 ⇒ 拒签且零字节", () => {
  // 正半幅：pass 轮由结算自己把轮次块写进 §3（评审席在工程模式没有这条通道）⇒ 记录在案且签发
  const ok = fixture("r171a", recordText({ blocks: 0, statusRow: null }))
  const runA = runOf(ok.root, ok.batchAbs)
  const tokenA = mintToken()
  const issued = settleDesignReview(ok.agent, runA, tokenA, receipt(tokenA))
  assert.equal(issued.passed, true, `结算自写块后应签发：${issued.output}`)
  const afterOk = readFileSync(ok.batchAbs, "utf8")
  assert.equal(countRoundBlocks(afterOk, 3), 1, "§3 本轮块由结算写（1 块）")
  assert.match(afterOk, /^\*\*结算\*\*：已签发（pass）· \d{4}-\d{2}-\d{2}$/m, "块内结算头点名已签发")
  assert.equal(readSectionStatusWord(afterOk, 3), "评审通过", "§3 段级状态行 = 评审通过（同笔）")
  assert.equal(resolveDesignSlot(ok.agent, DESIGN_ID).token, tokenA, "spawn 门放行（拿到本 designId 的凭证）")

  // 失败侧：块写不进 ⇒ 拒签、档字节回到写前、槽零写、spawn 被机械拒
  const bad = fixture("r171b", recordText({ blocks: 0, statusRow: null }))
  const before = readFileSync(bad.batchAbs, "utf8")
  const tokenB = mintToken()
  __setRecordWriterForTest(() => { throw new Error("injected write failure") })
  try {
    const refused = settleDesignReview(bad.agent, runOf(bad.root, bad.batchAbs), tokenB, receipt(tokenB))
    assert.equal(refused.passed, false, "块写不进不得签发")
    assert.ok(refused.output.includes("review record incomplete"), `回执应点名记录不合格：${refused.output}`)
  } finally {
    __setRecordWriterForTest(null)
  }
  assert.equal(readFileSync(bad.batchAbs, "utf8"), before, "档字节 = 写前（零字节写入）")
  assert.throws(() => resolveDesignSlot(bad.agent, DESIGN_ID), /designId not found/, "同 designId 的 eng-coder spawn 被机械拒")
})

test("CLI 17-2 错误 · 不带 `batchDoc` 的设计评审 ⇒ 拒发、槽数不变、spawn 被机械拒", async () => {
  const { agent } = fixture("r172", recordText({ blocks: 0, statusRow: null }))
  const slotsBefore = agent._engDesignTokens?.size ?? 0
  // 准入门（`docs/core/design/ADVISOR-GUARDS.md` §2 第 6 条）：未携 `batchDoc` ⇒ 拒发，零实例 / 零槽 / 零 LLM。
  const receipt = String(await advisorTool.execute(
    { type: "design", async: false, documents: [DESIGN_REL] },
    { agent, _toolCallId: "t17-2" },
  ))

  assert.match(receipt, /^Advisor: launch refused — a design review must carry `batchDoc`/, `拒发首行点名 batchDoc 必填：${receipt}`)
  assert.match(receipt, /criterion=batchdoc-missing/, `标识行载判据名：${receipt}`)
  assert.match(receipt, /Expected form 1 — project-root-relative:/, "期望形第 1 句")
  assert.match(receipt, /Expected form 2 — absolute:/, "期望形第 2 句")
  assert.match(receipt, /batch\(\{action:"create"/, "下一步：没有批档 ⇒ 先建档（一条命令）")
  assert.equal(agent._advisorRefusals.has("t17-2"), true, "拒发登记")
  assert.equal(agent._engDesignTokens?.size ?? 0, slotsBefore, "跑前跑后槽数不变（零签发）")
  assert.equal((agent._advisorRuns?.size ?? 0), 0, "零评审实例")
  assert.throws(() => resolveDesignSlot(agent, DESIGN_ID), /designId not found/, "随后 eng-coder spawn 因无授权被机械拒")
})

test("CLI 17-3 错误 · 批档的未决行被撤后发设计评审 ⇒ 拒发（账不在）；另一本带未决行的批档 ⇒ 放行", { timeout: 120_000 }, async () => {
  const { root, batchAbs } = ledgerFixture("r173", recordText({ blocks: 0, statusRow: null }))
  // 反证格：同一根下另起一本批档，它那一行保持未决（`在途`）
  const otherAbs = join(root, "docs/batches/other.md")
  writeFileSync(otherAbs, recordText({ blocks: 0, statusRow: null }))

  // 本档那一行被撤回 ⇒ 本档零未决行。P2-5 锚批门之后，「在途 → 已废弃」必须先退回等待态
  //（退回同时解绑指针，既有语义）——结果仍是本用例要的现场：该档不在账上。
  const withdrawn = seedRow(root, batchAbs)
  ledgerUpdate({ cwd: root, id: withdrawn, patch: { status: "待讨论", evidence: "本批不做了，先退回" }, boundary: root })
  ledgerClose({ cwd: root, id: withdrawn, status: "已废弃", boundary: root })
  const alive = seedRow(root, otherAbs)
  assert.ok(alive > 0, "反证格的未决行已种上")

  const agent = { cwd: root, _slot: 1, config: { agent: { engineering: true } } }
  const slotsBefore = agent._engDesignTokens?.size ?? 0

  // 账链门（`docs/core/design/ADVISOR-GUARDS.md` §2 第 7 条）：零未决行 ⇒ 拒发，零实例 / 零 token / 零 LLM。
  const refused = String(await advisorTool.execute(
    { type: "design", async: false, documents: [DESIGN_REL], batchDoc: batchAbs },
    { agent, _toolCallId: "t17-3" },
  ))
  assert.match(refused, /^Advisor: launch refused — a design review needs its batch record to carry an unsettled ledger row\./, `拒发首行点名账链：${refused}`)
  assert.match(refused, /criterion=batchdoc-no-ledger/, `标识行载判据名：${refused}`)
  assert.match(refused, /reason=no-pending-row/, `真因 = 零未决行：${refused}`)
  assert.match(refused, /Record: .+unsettled: 0/, `回执载读数 unsettled: 0：${refused}`)
  assert.match(refused, /Nothing was sent:/, "收尾句：零发送")
  assert.equal(agent._advisorRefusals.has("t17-3"), true, "拒发登记")
  assert.equal(agent._engDesignTokens?.size ?? 0, slotsBefore, "零签发（槽数不变）")
  assert.equal((agent._advisorRuns?.size ?? 0), 0, "零评审实例")

  // 反证格：另一本带未决行的批档，同调用 ⇒ 不被账链门拦（放行；后续失败与本门无关）。
  const counter = String(await advisorTool.execute(
    { type: "design", async: false, documents: [DESIGN_REL], batchDoc: otherAbs },
    { agent, _toolCallId: "t17-3b" },
  ))
  assert.doesNotMatch(counter, /batchdoc-no-ledger/, `账在 ⇒ 不得以账链门拒发，实际：${counter}`)
  assert.equal(agent._advisorRefusals.has("t17-3b"), false, "未登记拒发（本门放行）")
})
