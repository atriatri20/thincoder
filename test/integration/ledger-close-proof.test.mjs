/**
 * ledger-close-proof.test.mjs — 集成用例 CLI 10-3 ∥ 10-5。
 *
 * 业务入口 = 真 `ledger` 工具的 close / update action。核销只凭应用本笔后的工作证据，
 * 不读锚批在盘、§1 收口或 §3 评审状态；核销源态与两种归档终态仍在同一入口拒绝非法写入。
 * 夹具 = 独立项目、会话槽根与台账库目录，不触真实用户数据。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/ledger-close-proof.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { removeTempDirBestEffort } from "../teardown.mjs"

import { _resetSessionsDirForTest, _setSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
const { _resetLedgerDirForTest, _setLedgerDirForTest, ledgerQuery, ledgerTool } = await import("../../thincoder-core/ledger.mjs")

const CLOSED = "docs/batches/closed.md"
const OPEN = "docs/batches/open.md"
const CLOSED_NO_REVIEW = "docs/batches/closed-no-review.md"
const DECLARED = "docs/batches/declared.md"

const recordText = (statusLine, s3Line, sec1 = "夹具讨论。") => [
  "# 夹具批 · 核销工作证据",
  "",
  "> 编制：夹具 · 2026-11-10 · 来源 = 集成夹具。",
  "",
  "## §1 讨论（主 agent）",
  `**状态行**：${statusLine}`,
  "",
  sec1,
  "",
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "",
  "夹具任务。",
  "",
  "## §3 设计评审（评审子代理）",
  `**状态行**：${s3Line}`,
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

const sessionsDir = mkdtempSync(join(tmpdir(), "lcproof-sessions-"))
const ledgerDir = mkdtempSync(join(tmpdir(), "lcproof-ledger-"))
_setSessionsDirForTest(sessionsDir)
_setLedgerDirForTest(ledgerDir)
const projects = []
after(() => {
  _resetSessionsDirForTest()
  _resetLedgerDirForTest()
  for (const p of projects) removeTempDirBestEffort(p)
  removeTempDirBestEffort(sessionsDir)
  removeTempDirBestEffort(ledgerDir)
})

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "lcproof-"))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev" }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  writeFileSync(join(root, CLOSED), recordText("✅ 已收口 2026-11-10", "评审通过"))
  writeFileSync(join(root, OPEN), recordText("🔄 进行中", "评审通过"))
  writeFileSync(join(root, CLOSED_NO_REVIEW), recordText("✅ 已收口 2026-11-10", "进行中"))
  writeFileSync(join(root, DECLARED), recordText("✅ 已收口 2026-11-10", "进行中", "夹具讨论。\n\n> 不适用：§3 —— 存量声明。"))
  const agent = { cwd: root, _slot: 1, _sessionStart: "2026-11-10T00:00:00.000Z", _touchedFiles: [], config: { agent: { engineering: true } } }
  return { root, agent }
}

const ctxOf = (agent) => ({ depth: 0, agent })
const exec = (ctx, args) => ledgerTool.execute(args, ctx)
const rowOf = (root, id) => ledgerQuery({ cwd: root, boundary: root }).find((r) => r.id === id)

async function rowAt(ctx, taskBook, title, steps = [], evidence = "工作完成证据") {
  const { id } = JSON.parse(await exec(ctx, { action: "add", kind: "tech_todo", title, task_book: taskBook, evidence }))
  for (const status of steps) await exec(ctx, { action: "update", id, status })
  return id
}
const pendingCloseRow = (ctx, taskBook, title, evidence) => rowAt(ctx, taskBook, title, ["待设计", "在途", "待核销"], evidence)

test("CLI 10-3 锚批未收口、缺评审或有存量声明均不阻断有效证据；无证据与空白覆盖仍拒", async () => {
  const { root, agent } = fixture()
  const ctx = ctxOf(agent)
  const cases = [
    [CLOSED, "已收口且评审通过"],
    [OPEN, "锚批未收口"],
    [CLOSED_NO_REVIEW, "锚批未评审"],
    [DECLARED, "存量声明档"],
  ]
  for (const [taskBook, title] of cases) {
    const id = await pendingCloseRow(ctx, taskBook, title)
    const receipt = await exec(ctx, { action: "close", id, status: "已核销" })
    assert.match(receipt, /"status":"已核销"/, `${title} 应凭工作证据核销：${receipt}`)
    assert.equal(rowOf(root, id).status, "已核销")
    assert.ok(rowOf(root, id).closed_at)
  }

  const empty = await pendingCloseRow(ctx, OPEN, "无工作证据", null)
  const emptyBefore = rowOf(root, empty)
  await assert.rejects(() => exec(ctx, { action: "close", id: empty, status: "已核销" }), /evidence|工作证据/)
  assert.deepEqual(rowOf(root, empty), emptyBefore)

  const blank = await pendingCloseRow(ctx, OPEN, "空白覆盖证据")
  const blankBefore = rowOf(root, blank)
  await assert.rejects(
    () => exec(ctx, { action: "close", id: blank, status: "已核销", evidence: "   ", evidenceReplace: true }),
    /evidence 为空|工作证据/,
  )
  assert.deepEqual(rowOf(root, blank), blankBefore)
  assert.match(readFileSync(join(root, CLOSED), "utf8"), /\*\*状态行\*\*：✅ 已收口 2026-11-10/, "台账动作不改批档")
})

test("CLI 10-5 核销只从待核销出发；已核销与已废弃均为终态，重复撤回不改行", async () => {
  const { root, agent } = fixture()
  const ctx = ctxOf(agent)
  const id = await rowAt(ctx, CLOSED, "核销源态门")
  for (const [status, exit] of [
    ["待讨论", "先 update 到 在途 认领"],
    ["待设计", "先 update 到 在途 认领"],
    ["在途", "先 update 到 待核销"],
  ]) {
    if (status !== "待讨论") await exec(ctx, { action: "update", id, status })
    await assert.rejects(() => exec(ctx, { action: "close", id, status: "已核销" }), (e) => {
      assert.match(e.message, new RegExp(`核销仅限 待核销（现态 ${status}）`))
      assert.ok(e.message.includes(exit), `拒文应含出路 ${exit}：${e.message}`)
      return true
    })
    assert.equal(rowOf(root, id).status, status)
    assert.equal(rowOf(root, id).closed_at, null)
  }
  await exec(ctx, { action: "update", id, status: "待核销" })
  await exec(ctx, { action: "close", id, status: "已核销" })
  assert.equal(rowOf(root, id).status, "已核销")
  assert.ok(rowOf(root, id).closed_at)

  const settledBefore = rowOf(root, id)
  await assert.rejects(() => exec(ctx, { action: "update", id, status: "已废弃" }), /不在允许迁移表/)
  assert.deepEqual(rowOf(root, id), settledBefore)
  await assert.rejects(() => exec(ctx, { action: "close", id, status: "已废弃" }), /撤回仅限未归档态（现态 已核销）/)
  assert.deepEqual(rowOf(root, id), settledBefore)

  const withdrawn = await rowAt(ctx, CLOSED, "重复撤回")
  await exec(ctx, { action: "close", id: withdrawn, status: "已废弃" })
  const withdrawnBefore = rowOf(root, withdrawn)
  await assert.rejects(() => exec(ctx, { action: "close", id: withdrawn, status: "已废弃" }), /撤回仅限未归档态（现态 已废弃）/)
  assert.deepEqual(rowOf(root, withdrawn), withdrawnBefore)
  await assert.rejects(() => exec(ctx, { action: "close", id: withdrawn, status: "已核销" }), /该行已归档（已废弃），不在核销面/)
  assert.deepEqual(rowOf(root, withdrawn), withdrawnBefore)
})
