/**
 * path-resolution.test.mjs — 集成用例 29-1 … 29-5（RTM CLI 端故事 29「路径解析统一层」）。
 *
 * 判据原文 = `test/RTM.md` 第 29 节；机制 = `docs/core/design/PATH-RESOLUTION.md` §2 / §2.6 / §2.7。
 * 业务入口全部是真工具调用（`batch` / `ledger` / `doc_check`），断言的是**回执文本与落盘结果**——
 * 不是内部函数返回值。夹具 = 系统临时域（零落仓 + 并发免疫）；台账缝 `_setLedgerDirForTest` 隔离真实用户目录。
 *
 * 五行对应关系（行号 = RTM 定死的号）：
 * 29-1 裸档名 ⇒ 批档写入落盘、门不再判档缺 · 29-2 三面同一句报明（拒 + 候选全列）·
 * 29-3 文档门：缺哪一段 + 同名候选 · 29-4 声明出边：已声明在盘照判 / 未声明即拒 · 29-5 形态错仍阻断（文档面 / 台账面两面差）·
 * 29-6 唯一后缀兜底：恰一处 ⇒ 解析并标解析方式；两处 ∥ 零处 ⇒ 仍判档缺（红绿并置）。
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"
import { ledgerTool } from "../../thincoder-core/ledger-tools.mjs"

const { _resetLedgerDirForTest, _setLedgerDirForTest, ledgerAdd } = await import("../../thincoder-core/ledger.mjs")

const LEDGER_DIR = mkdtempSync(join(tmpdir(), "pr-int-ledger-"))
_setLedgerDirForTest(LEDGER_DIR)
const TMP = []
after(() => {
  _resetLedgerDirForTest()
  removeTempDirBestEffort(LEDGER_DIR)
  for (const d of TMP) removeTempDirBestEffort(d)
})

const BATCH_SKELETON = [
  "# 夹具批 · 路径解析",
  "",
  "## §1 讨论（主 agent）",
  "**状态行**：🔄 进行中（…）",
  "",
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "",
  "## §3 设计评审（评审子代理）",
  "**状态行**：评审通过",
  "",
  "## §4 用户批准（主 agent）",
  "",
  "## §5 实施记录（eng-coder）",
  "",
  "## §6 验证与收口（父代理）",
  "",
].join("\n")

/** 项目夹具：`docRoot` 五键齐（裸档名要能经 `docRoot.batches` / `docRoot` 各键找到）。 */
const manifestOf = (publicRepos = []) => JSON.stringify({
  version: 1,
  phase: "initial-dev",
  docRoot: {
    requirements: "docs/core/requirements",
    specs: "docs/core/specs",
    design: "docs/core/design",
    modules: "docs/core/modules",
    batches: "docs/batches",
    standards: null,
  },
  codePaths: ["thincoder-core"],
  index: { codeExtensions: [], docExtensions: [], excludePaths: [], publicRepos },
}, null, 2)

function makeProject(files = {}, publicRepos = []) {
  // **建在私有父目录下**（`<私有>/proj`）：第 6′ 步的前置读「项目根的同级目录名」，夹具根若直接落在
  // `tmpdir()` 下，同级集合就是共享的系统临时目录 ⇒ 多段 token 那几行（29-6 的包内相对形）会隐含依赖
  // 「/tmp 里没有同名目录」这件环境事实。
  const parent = mkdtempSync(join(tmpdir(), "pr-int-proj-"))
  TMP.push(parent)
  const root = join(parent, "proj")
  mkdirSync(root, { recursive: true })
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), manifestOf(publicRepos))
  for (const [rel, body] of Object.entries(files)) put(root, rel, body)
  return root
}

function put(root, rel, body = "# x\n") {
  const abs = join(root, rel)
  mkdirSync(dirname(abs), { recursive: true })
  writeFileSync(abs, body)
  return abs
}

const agentOf = (root) => ({ cwd: root, config: { agent: { engineering: true } }, planMode: false, autoApprove: false })
const ctx0 = (root) => ({ depth: 0, agent: agentOf(root) })

// ── 29-1 唯一项目根 + 裸档名 ⇒ 批档写入落盘，门不再判档缺 ────────────────────
test('CLI 29-1 父侧 batch append：裸档名定位批档 ⇒ 写入落盘，文档门不再判档缺', { timeout: 60_000 }, async (t) => {
  const root = makeProject({ "docs/batches/2026-11-02-bare.md": BATCH_SKELETON })
  put(root, "docs/batches/bare-ref.md", "# 被引档\n\n正文。\n")
  await seedRow(root, "docs/batches/2026-11-02-bare.md")
  const tool = batchTool(null)

  const receipt = String(await tool.execute(
    { action: "append", path: "2026-11-02-bare.md", segment: "§1", text: "举证：bare-ref.md 这一笔已核对。" },
    ctx0(root),
  ))
  assert.match(receipt, /appended/, `裸档名定位成"可读批档"并写入，实际：${receipt}`)
  assert.doesNotMatch(receipt, /DOC-CHECK GATE: REFUSED/, `门不再判档缺，实际：${receipt}`)
  assert.match(readFileSync(join(root, "docs/batches/2026-11-02-bare.md"), "utf8"), /bare-ref\.md 这一笔已核对/, "文本已落盘")
})

// ── 29-2 各一笔报明：三面（批档 / 台账 / 文档门）在工作区锚下都拒（文档门面 = 点名 `target`） ─────
test('CLI 29-2 工作区锚：批档 / 台账 / 文档门三面各一笔报明形——拒（文档门面 = 点名 `target`）', { timeout: 60_000 }, async (t) => {
  const ws = mkdtempSync(join(tmpdir(), "pr-int-ws-"))
  TMP.push(ws)
  for (const name of ["pa", "pb"]) {
    mkdirSync(join(ws, name), { recursive: true })
    writeFileSync(join(ws, name, "PROJECT-MANIFEST.json"), manifestOf())
  }
  const batch = batchTool(null)
  const ledger = ledgerTool
  const docCheck = docCheckTool

  // ① 批档读面：相对形判不出唯一 ⇒ 候选项名两个项目
  await assert.rejects(
    () => batch.execute({ action: "status", path: "docs/batches/x.md", value: "进行中" }, ctx0(ws)),
    (e) => /not a readable file/.test(e.message) && /Candidates: .*pa.*pb/.test(e.message),
    "批档面拒 + 候选全列",
  )
  // ② 台账读面：无根 ⇒ 报明 + 下辖候选
  await assert.rejects(
    () => ledger.execute({ action: "count" }, ctx0(ws)),
    (e) => /未找到项目根/.test(e.message) && /下辖候选项目：.*pa.*pb/.test(e.message),
    "台账面拒 + 候选全列",
  )
  // ③ 文档门：`target` 必填——不传 ⇒ 拒、报文点名 `target`（不再走歧义支：首行不是 gate ERROR 串）
  const gate = String(docCheck.execute({ mode: "gate", docs: [] }, ctx0(ws)))
  assert.match(gate, /^doc_check: `target` is required/, `文档门面拒、报文点名 target，实际：${gate}`)
  assert.doesNotMatch(gate, /DOC-CHECK GATE: ERROR（多项目工作区：请指名 target）/, `target 必填后不再走歧义支，实际：${gate}`)
})

// ── 29-3 文档门：裸档名不在任何基根 ⇒ 报「缺哪一段」+ 同名候选 ───────────────
//    夹具的裸名在**两处**深处同名：唯一后缀（恰一处）自 2026-11-08 起由第 6′ 步解析（见 29-6），
//    所以本行要守的「候选不产受理」必须落在「定位得到、但不是唯一那处」这一形上。
test('CLI 29-3 文档门判档：裸名两层基根零命中 ⇒ 报缺哪一段 + 同名候选（"你是不是指这个"）', { timeout: 60_000 }, async (t) => {
  const root = makeProject({
    "docs/core/design/modules/域/guide-topic.md": "# 深处的档\n\n正文。\n",
    "docs/core/design/modules/另一域/guide-topic.md": "# 另一份深处的档\n\n正文。\n",
  })
  put(root, "docs/core/design/prose.md", "# 正文面\n\n去读 guide-topic.md 那份。\n")
  const report = String(docCheckTool.execute({ mode: "report", docs: ["docs/core/design/prose.md"], target: root }, ctx0(root)))

  assert.match(report, /✗ 锚·档缺 docs\/core\/design\/prose\.md:3/, `命中原行，实际：${report}`)
  assert.match(report, /缺「guide-topic\.md」/, `报缺的那一段，实际：${report}`)
  assert.match(report, /盘上同名：.*modules\/域\/guide-topic\.md/, `列同名候选（不产命中档），实际：${report}`)
  assert.match(report, /后缀命中 2 处：/, `两处同名 ⇒ 后缀兜底也判不出唯一（候选只提示，实际：${report}`)
})

// ── 29-4 声明出边：已声明且根在盘 ⇒ 照判（含节号）；未声明的仓名 ⇒ 拒（不再是读数行）──
test('CLI 29-4 文档门判跨仓引用：已声明且根在盘 ⇒ 零命中 PASS · 错节号 ⇒ 锚·节缺 · 未声明仓名 ⇒ 锚·档缺 + 同级候选与未声明注解 · 项目根下另配同后缀路径亦不兜底', { timeout: 60_000 }, async (t) => {
  const parent = mkdtempSync(join(tmpdir(), "pr-int-cross-"))
  TMP.push(parent)
  const proj = join(parent, "proj")
  mkdirSync(proj, { recursive: true })
  writeFileSync(join(proj, "PROJECT-MANIFEST.json"), manifestOf(["../thin2"]))
  // 已声明仓（本机在盘、有 manifest、档在盘、首节号 = 1）
  mkdirSync(join(parent, "thin2", "docs"), { recursive: true })
  writeFileSync(join(parent, "thin2", "PROJECT-MANIFEST.json"), manifestOf())
  writeFileSync(join(parent, "thin2", "docs", "guide.md"), "# 对面仓\n\n## 1. 一节\n")
  // 未声明仓：与 proj 同级、无 manifest
  mkdirSync(join(parent, "otherside", "docs"), { recursive: true })
  writeFileSync(join(parent, "otherside", "docs", "guide.md"), "# 对面仓\n")
  put(proj, "docs/core/design/declared-ok.md", "# 已声明在盘\n\n① thin2/docs/guide.md\n")
  put(proj, "docs/core/design/bad-section.md", "# 错节号\n\n① thin2/docs/guide.md §9.9\n")
  put(proj, "docs/core/design/undeclared.md", "# 未声明\n\n① otherside/docs/guide.md\n")
  // 同后缀路径（AC-20 ① 的守卫）：项目根下这一处使 `otherside/docs/guide.md` 在全仓恰一处后缀相符。
  // 没这一处，本行只是「今天没撞上」；有它，兜底一旦在声明仓形上成立，未声明那一条即刻转绿。
  put(proj, "pkg/otherside/docs/guide.md", "# 同后缀的假目标\n")
  const run = (doc, mode) => String(docCheckTool.execute({ mode, docs: [doc], target: proj }, ctx0(proj)))

  // ① 已声明 ∧ 根在盘 ∧ 档在盘 ⇒ 静默（与仓内指针同形）
  const ok = run("docs/core/design/declared-ok.md", "gate")
  assert.match(ok, /^DOC-CHECK GATE: PASS/, `已声明在盘档零命中，实际：${ok}`)
  assert.doesNotMatch(ok, /锚·档缺|跨仓引用：/, `已声明形不再出读数行，实际：${ok}`)
  // ② 已声明 ∧ 根在盘 ∧ 节号不在 ⇒ 锚·节缺（跨仓指针从此也管节号）
  const sec = run("docs/core/design/bad-section.md", "report")
  assert.match(sec, /✗ 锚·节缺 docs\/core\/design\/bad-section\.md:3/, `跨仓指针管节号，实际：${sec}`)
  assert.match(sec, /无 §9\.9/, `点名缺的节号，实际：${sec}`)
  assert.match(run("docs/core/design/bad-section.md", "gate").split("\n")[0], /REFUSED（锚 1 条）/, "节缺进闸")
  // ③ 未声明仓名 ⇒ 锚·档缺 + 同级目录候选 + 一句未声明（从读数行变成拒绝）
  const undeclared = run("docs/core/design/undeclared.md", "report")
  assert.match(undeclared, /✗ 锚·档缺 docs\/core\/design\/undeclared\.md:3/, `未声明即拒，实际：${undeclared}`)
  assert.match(undeclared, /本机同级目录：.*otherside/, `列同级候选，实际：${undeclared}`)
  assert.match(undeclared, /该名未在 index\.publicRepos 声明/, `点名未声明，实际：${undeclared}`)
  assert.doesNotMatch(undeclared, /后缀兜底读数/, `声明仓形不进兜底——没有解析出的指针，就没有读数块，实际：${undeclared}`)
  assert.match(run("docs/core/design/undeclared.md", "gate").split("\n")[0], /REFUSED（锚 1 条）/, "未声明进闸")
})

// ── 29-5 形态错的跨仓引用：文档面仍阻断；改台账面 ⇒ 硬拒（KD-10 的可见差）──
test('CLI 29-5 形态错的跨仓引用：文档门仍判缺（阻断）；同输入改台账面 ⇒ 硬拒', { timeout: 60_000 }, async (t) => {
  const root = makeProject({ "docs/core/design/bad-form.md": "# 形态错\n\n借道：thin2/../escape.md\n" }, ["thin2"])
  const report = String(docCheckTool.execute({ mode: "report", docs: ["docs/core/design/bad-form.md"], target: root }, ctx0(root)))
  assert.match(report, /✗ 锚·档缺 docs\/core\/design\/bad-form\.md:3/, `形态错仍阻断，实际：${report}`)

  // 台账面：同形跨仓指针（task_book 指向外部仓）⇒ 写门硬拒（L4 判据零改）
  await seedRow(root, "docs/batches/2026-11-02-bad.md", { writeRecord: true })
  const ledger = ledgerTool
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "夹具行 · 跨仓指针" }, boundary: root })
  await assert.rejects(
    () => ledger.execute({ action: "update", id, status: "在途", task_book: "thin2/../escape.md" }, ctx0(root)),
    /task_book 指向的档不存在/,
    "台账面跨仓指针硬拒（文档面放宽、台账面不放宽）",
  )
})

// ── 29-6 唯一后缀兜底：恰一处 ⇒ 解析（首行 PASS · 报面读数行计 1）；两处 ∥ 零处 ⇒ 仍判档缺 ──
test('CLI 29-6 文档门判「包内相对」写法：唯一后缀 ⇒ PASS 且报面读数行计 1 · 同名两处 ∥ 零命中 ⇒ 锚·档缺', { timeout: 60_000 }, async (t) => {
  const root = makeProject({
    // 唯一后缀：token 写成包内相对形（仓根相对不存在，靠第 6′ 步定位）
    "thincoder-vscode/src/extension/workspace-guard.mjs": "export const guard = true\n",
    // 同名两处：`src/dup.mjs` 后缀命中两个仓
    "thincoder-vscode/src/dup.mjs": "export {}\n",
    "thincoder-core/src/dup.mjs": "export {}\n",
    "docs/core/design/suffix-ok.md": "# 绿侧\n\n① src/extension/workspace-guard.mjs\n",
    "docs/core/design/suffix-bad.md": "# 红侧\n\n① src/dup.mjs\n\n② no-such-file-xyz.mjs\n",
  })
  const run = (doc, mode) => String(docCheckTool.execute({ mode, docs: [doc], target: root }, ctx0(root)))

  // ① 恰一处：路径解析出（节号没有 ⇒ 零命中），报面把解析方式与清账清单显式标出来
  const okGate = run("docs/core/design/suffix-ok.md", "gate")
  assert.match(okGate, /^DOC-CHECK GATE: PASS/, `唯一后缀应解析出、零命中，实际：${okGate}`)
  const okReport = run("docs/core/design/suffix-ok.md", "report")
  assert.match(okReport, /后缀兜底读数：how="suffix" 1 处/, `报面标出解析方式与处数，实际：${okReport}`)
  assert.match(okReport, /src\/extension\/workspace-guard\.mjs ⇒ .*（1 处）/, `清账清单行形 = token ⇒ 绝对路径（N 处），实际：${okReport}`)
  assert.match(okReport, /共 1 条 token · 1 处/, "末行总数行（N 与 M 由当次载荷算出）")

  // ② 两处 ∥ 零处：仍判档缺（兜底只答「能定位」，答不了「是哪一处」与「根本不存在」）
  const badGate = run("docs/core/design/suffix-bad.md", "gate")
  assert.match(badGate.split("\n")[0], /^DOC-CHECK GATE: REFUSED（锚 2 条）/, `两红同计，实际：${badGate}`)
  const badReport = run("docs/core/design/suffix-bad.md", "report")
  assert.match(badReport, /✗ 锚·档缺 docs\/core\/design\/suffix-bad\.md:3 `src\/dup\.mjs`/, `同名两处仍判缺，实际：${badReport}`)
  assert.match(badReport, /后缀命中 2 处：/, `候选走后缀命中集（不并进「盘上同名」），实际：${badReport}`)
  assert.match(badReport, /✗ 锚·档缺 docs\/core\/design\/suffix-bad\.md:5 `no-such-file-xyz\.mjs`/, `零命中仍判缺（反向控制），实际：${badReport}`)
  assert.doesNotMatch(badReport, /后缀兜底读数/, "红侧零处：没有解析出的指针，就没有清账清单")
})

/** 种一行未决账（批档写门 / 台账面用法与既有夹具同形）。 */
async function seedRow(root, recordRel, { writeRecord = false } = {}) {
  if (writeRecord) put(root, recordRel, BATCH_SKELETON)
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "夹具批 · 路径解析" }, boundary: root })
  const ledger = ledgerTool
  await ledgerTool.execute({ action: "update", id, status: "在途", task_book: recordRel }, ctx0(root))
  return id
}
