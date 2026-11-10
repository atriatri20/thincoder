/**
 * batch-touched-region-gate.test.mjs — 集成用例 7-16 ∥ 7-19（RTM CLI 端故事 7「收口只判本批改过的档」；
 * 判据原文 = `test/RTM.md` 第 7 节）。
 *
 * 这一行判的是**写门与收口都判改动区、整档存量只出读数**的统一边界（机制单源 =
 * `docs/core/design/DOC-DISCIPLINE.md` §3.20「触达账腿的判面 = 本次改动区」∥「两面的分工」）：
 *   ① 一档带存量悬空锚、本轮只改了别处 ⇒ 写段放行，存量只出一行计数（不逐条列、不阻写）；
 *   ② 同一夹具收口 ⇒ 存量不阻断、`PASS` + 统一存量读数；
 *   ③ 同一次改动里改动区自带一处悬空 ⇒ 当场拒（改动区判据没失效），存量那处不进拒面。
 *
 * 业务入口 = 真 `batch` 工具（`agent-tools/batch.mjs`）的三个动作——子代理 `append`（写段面）与 depth-0 `close`
 * （收口面），**不直调 `runBatchGate`**：本档要的是「这一笔写进去没有」「收口放没放行」两个业务可观察结果。
 * 断言面 = 工具回执文本 ∥ 拒串文本 ∥ 批档落盘字节。
 *
 * 改动区取自 git 基线（写工具不提交 ⇒ 本 run 的笔迹在工作树里）：夹具因此把「存量债」放进基提交、
 * 把「本轮的笔」留在工作树——基线之上的 diff 才是这一轮的改动区，存量落在区外。
 *
 * 夹具 = 系统临时域（项目根 + 真 git 仓 + 六段批档；`mkdtempSync`——零落仓、可并发）。收口后的台账重锚
 * 经测试缝 `_setLedgerDirForTest` 导向临时目录（不碰真实用户数据目录）。三半各用各的夹具根
 * （「同一夹具」= 同一夹具形，用例不依赖执行序；② 与 ① 同根——收口判的正是 ① 写进去之后的那份档）。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-touched-region-gate.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
// `ledger.mjs` 走动态导入：静态链入 `node:sqlite`（W8 契约——台账模块的消费侧一律动态取）。
const { _setLedgerDirForTest, _resetLedgerDirForTest } = await import("../../thincoder-core/ledger.mjs")

const BATCH_REL = "docs/batches/fixture.md"
const DESIGN_REL = "docs/notes/design.md" // 达触账里的设计档：存量债在基提交里，本轮的笔在工作树里
const CLEAN_A = "docs/notes/clean-a.md"
const CLEAN_B = "docs/notes/clean-b.md"

/** 设计档基内容：**存量悬空锚**（`old-gap.md` 不在盘）住第一段——它在基提交里 ⇒ 永远落在改动区外。 */
const DESIGN_BASE = [
  "# 设计档",
  "",
  "存量段：见 `docs/notes/old-gap.md` 的旧案。",
  "",
  "正文段：无指针。",
  "",
].join("\n")
/** 本轮的笔（工作树内、基提交之上）：干净的一行——改动区只有它。 */
const DESIGN_EDIT_CLEAN = `${DESIGN_BASE}\n本轮补充：见 \`docs/notes/clean-a.md\` 的判据。\n`
/** 本轮的笔（同上，自己写坏）：改动区自带一处悬空锚——存量那处仍在区外。 */
const DESIGN_EDIT_DIRTY = `${DESIGN_BASE}\n新段：见 \`docs/notes/new-gap.md\` 的旧案。\n`

const CLEAN = "# 干净档\n\n无指针。\n"
/** 写段文本（每笔都干净：本用例要挡的是「档上存量」，不是这一笔自己）。 */
const APPEND_TEXT = "本段引 `docs/notes/clean-a.md` 的判据。"

/** 档头「一段一作者」映射（`batch` create 落骨架时写入）。 */
const MAPPING = "> 一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）"

const ledgerDir = mkdtempSync(join(tmpdir(), "btrg-ledgerdir-"))
_setLedgerDirForTest(ledgerDir)

const parentCtx = (root, touched) => ({ depth: 0, agent: { cwd: root, _touchedFiles: touched, config: { agent: { engineering: true } } } })
/** 子代理（`eng-designer` ⇒ §2），目标是 spawn 绑定的批档；`touched` = 本席触达账（写段面判改动区的那张表）。 */
const designerCtx = (root, touched = []) => ({ depth: 1, agent: { cwd: root, _role: "eng-designer", _touchedFiles: touched, config: { agent: { engineering: true } } } })
const depth0 = batchTool(null)
const asDesigner = batchTool(BATCH_REL)

const projects = []

after(() => {
  _resetLedgerDirForTest()
  for (const p of projects) removeTempDirBestEffort(p)
  removeTempDirBestEffort(ledgerDir)
})

/** 六段批档全文（`sha` ⇒ §1 落 `批起 sha = <sha>` 记入行；close 的链门前置 = 各段各有内容）。 */
const record = (sha) => [
  "# 夹具批 · 触达账判面",
  "",
  MAPPING,
  "> 编制：夹具 · 2026-11-07 · 来源 = 集成夹具。",
  "> 台账 = #1（夹具）。前情 = 无（独立批）。",
  "",
  "## §1 讨论（主 agent）",
  "**状态行**：🔄 进行中",
  "",
  "夹具讨论。",
  "",
  `**批起 sha = ${sha}**`,
  "",
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "",
  "夹具任务。",
  "",
  "## §3 设计评审（评审子代理）",
  "**状态行**：评审通过",
  "",
  "夹具评审。",
  "",
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

function makeProject(tag) {
  const root = mkdtempSync(join(tmpdir(), `btrg-${tag}-`))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev" }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "docs/notes"), { recursive: true })
  return root
}

/** git 封装（`core.quotepath=false` 与受测实现同款）。 */
const git = (cwd, ...argv) => execFileSync("git", [
  "-C", cwd, "-c", "user.email=fixture@example.test", "-c", "user.name=fixture",
  "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", "-c", "core.quotepath=false", ...argv,
], { encoding: "utf8" })
const commit = (cwd, message) => { git(cwd, "add", "-A"); git(cwd, "commit", "-q", "-m", message) }
const rev = (cwd) => git(cwd, "rev-parse", "HEAD").trim()

/**
 * 真 git 仓：**基提交**里放设计档（带存量悬空锚）+ 两档干净档 ⇒ 取基 sha ⇒ 写批档（§1 记入基 sha）+ 本批两档 ⇒ 提交。
 * 于是基提交之上的改动 = 本轮的笔（① 面实测的正是它）；存量债在基提交里，恒落在改动区外。
 */
function gitRepo(root) {
  writeFileSync(join(root, DESIGN_REL), DESIGN_BASE)
  writeFileSync(join(root, CLEAN_A), CLEAN)
  writeFileSync(join(root, CLEAN_B), CLEAN)
  git(root, "init", "-q")
  commit(root, "base（设计档带存量债）")
  const sha = rev(root)
  writeFileSync(join(root, BATCH_REL), record(sha))
  commit(root, "批档")
  return sha
}

/** 回执里的 **gate 段首行**（`[doc-check gate] <verdict> · 范围 N 档`）。 */
const gateLineOf = (receipt) => {
  const line = receipt.split("\n").find((l) => l.startsWith("[doc-check gate] "))
  assert.ok(line, `回执应携 gate 行，实际回执：${receipt}`)
  return line
}

/** §1 状态行原文（拒收口 ⇒ 逐字不变）。 */
const statusLineOf = (root) => readFileSync(join(root, BATCH_REL), "utf8").split("\n").find((l) => l.startsWith("**状态行**："))

test('CLI 7-16 正常 · 写段与收口均判改动区（存量只出统一读数）∥ 改动区自带悬空 ⇒ 拒写', async () => {
  // ── 前半：档上另有存量锚、本轮只改了别处 ⇒ 写段放行，存量只出一行计数 ──
  const root = makeProject("r716")
  gitRepo(root)
  writeFileSync(join(root, DESIGN_REL), DESIGN_EDIT_CLEAN) // 本轮的笔（工作树内）
  const touched = [join(root, DESIGN_REL), join(root, CLEAN_A)]

  const receipt = await asDesigner.execute({ action: "append", segment: "§2", text: APPEND_TEXT }, designerCtx(root, touched))

  assert.match(receipt, /appended \d+ characters to §2/, `写入放行且落盘：${receipt}`)
  assert.match(gateLineOf(receipt), /^\[doc-check gate\] DOC-CHECK GATE: PASS · 范围 \d+ 档$/, `写段面放行（判域 = 触达账 ∪ 批档自身 ∪ 本次写入文本）：${receipt}`)
  // 存量那处只出一行计数：不逐条列、不阻写，且计数行是固定字面（N 是唯一变量）
  assert.match(receipt, /^存量命中 1 条（不属本次改动区，不阻断交付；整档读数）$/m, `存量只出统一计数行：${receipt}`)
  assert.doesNotMatch(receipt, /✗ /, `拒面零该档命中行（存量一条也没摆进命中面）：${receipt}`)
  assert.doesNotMatch(receipt, /old-gap/, `存量那处连名字都不出现在回执里：${receipt}`)

  // ── 中半：同一夹具收口 ⇒ 存量锚不阻，整档读数照出 ──
  const closeReceipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched))
  assert.match(gateLineOf(closeReceipt), /^\[doc-check gate\] DOC-CHECK GATE: PASS · 范围 \d+ 档$/, `收口放行：${closeReceipt}`)
  assert.match(closeReceipt, /^存量命中 1 条（不属本次改动区，不阻断交付；整档读数）$/m, `收口存量读数：${closeReceipt}`)
  assert.doesNotMatch(closeReceipt, /old-gap/, `存量不逐条列进拒面：${closeReceipt}`)
  assert.match(statusLineOf(root), /已收口/, "收口已落盘")

  // ── 后半：同一次改动里改动区自带一处悬空 ⇒ 当场拒（改动区判据没失效），存量那处不进拒面 ──
  // 另起一份夹具（上面的批档已有一次 append 落盘，两件事互不干扰）。
  const root2 = makeProject("r716b")
  gitRepo(root2)
  writeFileSync(join(root2, DESIGN_REL), DESIGN_EDIT_DIRTY)
  const beforeWrite = readFileSync(join(root2, BATCH_REL), "utf8")

  await assert.rejects(
    () => asDesigner.execute({ action: "append", segment: "§2", text: APPEND_TEXT }, designerCtx(root2, [join(root2, DESIGN_REL)])),
    (e) => {
      assert.match(e.message, /文档机检门拒写/, `拒串点名门位：${e.message}`)
      assert.match(e.message, /触达账改动区（锚 1 条）/, `首行第三段指名改动区，且只计区内那一条：${e.message}`)
      assert.match(e.message, /new-gap/, `拒面点名本轮自己写坏的那处：${e.message}`)
      assert.doesNotMatch(e.message, /old-gap/, `区外存量不进拒面（被拒的人不该被要求改别人的字）：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root2, BATCH_REL), "utf8"), beforeWrite, "拒写 ⇒ 批档字节逐字不变（零字节落盘）")
})

test('CLI 7-19 边界 · 收口按批级改动区放行存量；区未定则整档判并点名原因', async () => {
  const root = makeProject("r719")
  gitRepo(root)
  writeFileSync(join(root, DESIGN_REL), DESIGN_EDIT_CLEAN)
  const touched = [join(root, DESIGN_REL)]
  const receipt = await depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(root, touched))
  assert.match(gateLineOf(receipt), /DOC-CHECK GATE: PASS/, receipt)
  assert.match(receipt, /^存量命中 1 条（不属本次改动区，不阻断交付；整档读数）$/m, receipt)

  const unknown = makeProject("r719b")
  gitRepo(unknown)
  writeFileSync(join(unknown, DESIGN_REL), DESIGN_EDIT_CLEAN)
  const batchAbs = join(unknown, BATCH_REL)
  writeFileSync(batchAbs, readFileSync(batchAbs, "utf8").split("\n").filter((l) => !l.includes("批起 sha =")).join("\n"))
  const before = readFileSync(batchAbs, "utf8")
  await assert.rejects(
    () => depth0.execute({ action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" }, parentCtx(unknown, [join(unknown, DESIGN_REL)])),
    (e) => {
      assert.match(e.message, /DOC-CHECK GATE: REFUSED（命中 1 条）/, e.message)
      assert.match(e.message, /收口改动区未定——整档判/, e.message)
      assert.match(e.message, /§1 无有效批起 sha 记入行/, e.message)
      return true
    },
  )
  assert.equal(readFileSync(batchAbs, "utf8"), before, "未定拒收口 ⇒ 批档字节不变")
})

