/**
 * batch-gates-reanchor.test.mjs — 集成用例 14-1 … 14-12（RTM CLI 端故事 14「评审过、完成清单收口、重开回」）。
 *
 * 判据原文 = `test/RTM.md` 第 14 节；机制 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.5 / §2.6 /
 * §2.6.1 / §2.7 / §2.13 与 `docs/core/design/LEDGER.md` §10。**进入口 = 父侧工具面**（`batch` / `ledger` / `write`）——断言业务可观察结果
 * （拒 ∥ 写入、回执行、行状态、产品码可写性）。14-1 的第二支是 `§3` 写入闸（`R-G3`）：无裁定行的 `§3`
 * 在写的那一刻就拒，存量无裁定块仍由 `§5` 门报出来。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-gates-reanchor.test.mjs`
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { batchTool, configureBatchSegment, resetBatchSegment } from "../../thincoder-core/agent-tools/batch.mjs"
import { ledgerTool } from "../../thincoder-core/ledger-tools.mjs"
import { getSessionId } from "../../thincoder-core/session-slots.mjs"
import { executeToolCalls } from "../../thincoder-core/agent/dispatch.mjs"
import { writeTool } from "../../thincoder-core/tools/file.mjs"
const { _setLedgerDirForTest, _resetLedgerDirForTest, batchLedgerConsistency, ledgerAdd, ledgerClose, ledgerDbPath, ledgerQuery, ledgerUpdate } = await import("../../thincoder-core/ledger.mjs")

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const SCRATCH = join(ROOT, ".thincoder/tmp")
const ledgerDir = mkdtempSync(join(SCRATCH, "gates-ledger-"))
_setLedgerDirForTest(ledgerDir)
const fixtures = []
after(() => {
  _resetLedgerDirForTest()
  for (const p of fixtures) removeTempDirBestEffort(p)
  removeTempDirBestEffort(ledgerDir)
})

const REC = "docs/batches/g.md"
const UUID = "22222222-2222-2222-2222-222222222222"
function makeProject(tag) {
  mkdirSync(SCRATCH, { recursive: true })
  const root = mkdtempSync(join(SCRATCH, `gt-${tag}-`))
  fixtures.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" } }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "thincoder-core"), { recursive: true })
  return root
}
const agentOf = (root, { designSlot = false } = {}) => {
  const agent = { cwd: root, config: { agent: { engineering: true } } }
  if (designSlot) { agent.planMode = false; agent.autoApprove = true; agent._engDesignTokens = new Map([["fx", `${UUID}:${Date.now() + 3600_000}`]]) }
  return agent
}
const ctx0 = (root) => ({ depth: 0, agent: agentOf(root) })
const parent = batchTool(null)
const rowsOf = (root) => ledgerQuery({ cwd: root, boundary: root })
const recOf = (root) => join(root, REC)
const workOf = (root) => rowsOf(root).find((r) => r.task_book === REC && r.status === "在途")
/** 建一档并填 §2 / §3 段体 / §4 / §6（§3 结论由各例处置）。 */
async function freshRecord(tag, { s3Body = true } = {}) {
  const root = makeProject(tag)
  await parent.execute({ action: "create", path: REC, topic: "g", source: "集成夹具" }, ctx0(root))
  let src = readFileSync(recOf(root), "utf8")
    .replace("## §2 批次任务与设计（eng-designer）", "## §2 批次任务与设计（eng-designer）\n\nbody")
    .replace(/## §4 用户批准（[^）]*）/, "## §4 用户批准（主 agent）\n\nbody")
    .replace("## §6 验证与收口（父代理）", "## §6 验证与收口（父代理）\n\nbody")
  if (s3Body) src = src.replace("## §3 设计评审（评审子代理）", "## §3 设计评审（评审子代理）\n\n轮次 1 的发现与结论。")
  writeFileSync(recOf(root), src)
  return root
}
const review = (root) => batchTool(REC, { review: true })
const writeToolMap = new Map([["write", writeTool]])
const runWrite = async (agent, rel, extra = {}) => {
  const [res] = await executeToolCalls(agent, writeToolMap, [{ name: "write", id: "1", arguments: JSON.stringify({ path: rel, content: "x\n", ...extra }) }], {}, 0)
  return res
}

test("CLI 14-1 无裁定行的 §3 写不进去（R-G3）；存量无裁定块仍拒 append §5（R-G2b）；补一块携 VERDICT: pass ⇒ 放行", async () => {
  const root = await freshRecord("14-1")
  const coder = batchTool(REC)
  const ctx = { depth: 1, agent: { ...agentOf(root, { designSlot: false }), _role: "eng-coder", _batchDoc: REC } }
  await assert.rejects(() => coder.execute({ action: "append", segment: "§5", text: "先写实现" }, ctx), (e) => /§5 append refused/.test(e.message))
  // ① 工具写一笔无裁定行的 §3 ⇒ 当场拒（R-G3）：字节零改、轮次号不消耗（块数不变）
  const before = readFileSync(recOf(root), "utf8")
  const blocksOf = (s) => s.split("\n").filter((l) => /^### 轮次 \d+（评审子代理）/.test(l)).length
  await assert.rejects(
    () => review(root).execute({ action: "append", segment: "§3", text: "方案可行，另附两条补记。" }, { agent: agentOf(root) }),
    (e) => /§3 append refused/.test(e.message)
      && e.message.includes("VERDICT: pass") && e.message.includes("VERDICT: changes-required")
      && /no round number was consumed/.test(e.message),
  )
  const afterRefusal = readFileSync(recOf(root), "utf8")
  assert.equal(afterRefusal, before, "拒写：档字节逐字节不变")
  assert.equal(blocksOf(afterRefusal), blocksOf(before), "拒写：轮次块数不变（N 未消耗）")
  // ② 存量无裁定块（夹具直写、不经工具）⇒ `append §5` 仍拒（R-G2b：门所依赖的那个块自己没说结论）
  writeFileSync(
    recOf(root),
    afterRefusal
      .replace("## §3 设计评审（评审子代理）\n\n轮次 1 的发现与结论。",
        "## §3 设计评审（评审子代理）\n**状态行**：评审通过\n\n### 轮次 1（评审子代理）\n\n存量块：只有散文，没有裁定行。"),
  )
  assert.match(readFileSync(recOf(root), "utf8"), /\*\*状态行\*\*：评审通过/, "夹具：状态词已过判据 1")
  await assert.rejects(
    () => coder.execute({ action: "append", segment: "§5", text: "先写实现" }, ctx),
    (e) => /last §3 round block carries no pass verdict/.test(e.message) && /块内裁定 = 无裁定行/.test(e.message),
  )
  // ③ 末块携 pass 裁定 ⇒ 两判据同过，写入
  await review(root).execute({ action: "append", segment: "§3", text: "结论：通过。\n\nVERDICT: pass" }, { agent: agentOf(root) })
  assert.match(await coder.execute({ action: "append", segment: "§5", text: "实现落地" }, ctx), /appended/)
})

test("CLI 14-2 §3 非 pass ⇒ close 拒，回执含 `§3 状态行 =`；§1 状态行字节不变", async () => {
  const root = await freshRecord("14-2")
  const before = readFileSync(recOf(root), "utf8").match(/\*\*状态行\*\*：.*/)[0]
  await assert.rejects(
    () => parent.execute({ action: "close", path: recOf(root) }, ctx0(root)),
    (e) => /§3 状态行 = （无状态行），须 = 评审通过/.test(e.message),
  )
  assert.equal(readFileSync(recOf(root), "utf8").match(/\*\*状态行\*\*：.*/)[0], before, "§1 状态行字节不变")
})

test("CLI 14-3 换会话凭工作证据核销，锚批未收口且缺评审也通过", async () => {
  const root = makeProject("14-3")
  writeFileSync(join(root, "docs/batches/open.md"), "# 未收口批\n\n## §1 讨论（主 agent）\n**状态行**：进行中\n")
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "合格行", task_book: "docs/batches/open.md", trigger: "归批", evidence: "工作完成证据" }, boundary: root })
  ledgerUpdate({ cwd: root, id, patch: { status: "待设计" }, boundary: root })
  ledgerUpdate({ cwd: root, id, patch: { status: "在途" }, boundary: root })
  ledgerUpdate({ cwd: root, id, patch: { status: "待核销" }, boundary: root })
  // 真 `ledger` 工具入口；ctx 里没有任何槽 / designId（= 换了一个会话）
  const out = JSON.parse(await ledgerTool.execute({ action: "close", id, status: "已核销" }, { depth: 0, agent: { cwd: root, config: { agent: { engineering: true } } } }))
  assert.deepEqual(out, { id, status: "已核销" })
  assert.equal(rowsOf(root).find((r) => r.id === id).status, "已核销")
})

test("CLI 14-4 batch close 漏列在写档前拒绝；completed 点名在途行同笔结清，未动行改挂条件", async () => {
  const root = await freshRecord("14-4")
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  const idle = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "没动" }, boundary: root })
  ledgerUpdate({ cwd: root, id: idle, patch: { task_book: REC }, boundary: root })
  const work = workOf(root)
  const ctx = ctx0(root)
  const beforeDoc = readFileSync(recOf(root), "utf8")
  const beforeRows = rowsOf(root)
  await assert.rejects(() => parent.execute({ action: "close", path: recOf(root), completed: [], closeEvidence: "证据" }, ctx), /completed 漏列在途行/)
  assert.equal(readFileSync(recOf(root), "utf8"), beforeDoc)
  assert.deepEqual(rowsOf(root), beforeRows)
  assert.equal(ctx.agent._engDesignTokens, undefined)

  const msg = await parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "本批把活做完并结算" }, ctx)
  assert.equal(rowsOf(root).find((r) => r.id === work.id).status, "已核销", "点名行同事务两跳至已核销")
  assert.equal(rowsOf(root).find((r) => r.id === idle).trigger, "条件")
  const lines = msg.split("\n").filter((l) => l.startsWith("[ledger reanchor]"))
  assert.equal(lines.length, 2)
  assert.match(lines[0], new RegExp(`#${work.id} 「g」 在途 → 待核销 → 已核销`), `在途起点那行：${msg}`)
  assert.match(lines[1], /本批未动行 → 条件 1 行/)
  assert.doesNotMatch(msg, /默认推进|认领行只有两种终局/)
  assert.match(msg, /\[ledger consistency\] 一致（本批 2 行）/, "回执末尾恒带一致性读数")
})

test("CLI 14-5 status 写 §1 已收口与 close 同序：漏列拒；点名后同笔结清并用同一 closeEvidence", async () => {
  const root = await freshRecord("14-5")
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  const work = workOf(root)
  const ctx = ctx0(root)
  const beforeDoc = readFileSync(recOf(root), "utf8")
  const beforeRows = rowsOf(root)
  const args = { action: "status", path: recOf(root), segment: "§1", value: "已收口", completed: [], closeEvidence: "证据" }
  await assert.rejects(() => parent.execute(args, ctx), /completed 漏列在途行/)
  assert.equal(readFileSync(recOf(root), "utf8"), beforeDoc)
  assert.deepEqual(rowsOf(root), beforeRows)
  assert.equal(ctx.agent._engDesignTokens, undefined)

  args.completed = [work.id]
  args.closeEvidence = "本批把活做完并结算"
  const msg = await parent.execute(args, ctx)
  assert.match(msg, new RegExp(`#${work.id} 「g」 在途 → 待核销 → 已核销`), `两路同序、同一回执形：${msg}`)
  assert.equal(rowsOf(root).find((r) => r.id === work.id).status, "已核销")
  assert.match(rowsOf(root).find((r) => r.id === work.id).evidence, /^收口 \d{4}-\d{2}-\d{2}：本批把活做完并结算$/)
  assert.doesNotMatch(msg, /默认推进|认领行只有两种终局/)
})

test("CLI 14-6 手工回退与重开均写当前会话；产品码写分辨在号（带号照写 ∥ 不带号拒）", async () => {
  const root = await freshRecord("14-6")
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  const work = workOf(root)
  await parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "证据" }, ctx0(root))
  assert.equal(rowsOf(root).find((r) => r.id === work.id).status, "已核销", "收口即结算")
  // 收口后行已是归档终态 ⇒ 起一条 `待核销` 行只能靠 `ledger update` 手工推进（§9 delta 的题设改写）
  const back = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "重开要回收的行", task_book: REC, trigger: "归批", evidence: "工作证据" }, boundary: root })
  for (const s of ["待设计", "在途", "待核销"]) ledgerUpdate({ cwd: root, id: back, patch: { status: s }, boundary: root })
  await ledgerTool.execute({ action: "update", id: back, status: "在途", executor: "explicit-old" }, ctx0(root))
  assert.equal(rowsOf(root).find((r) => r.id === back).executor, getSessionId(), "手工回退忽略显式旧 executor，写当前会话")
  ledgerUpdate({ cwd: root, id: back, patch: { status: "待核销" }, boundary: root })
  const msg = await parent.execute({ action: "status", path: recOf(root), segment: "§1", value: "进行中", note: "同一件事继续做" }, ctx0(root))
  assert.match(msg, /\[ledger reopen\] 本批待核销行 → 在途 1 行/)
  assert.equal(rowsOf(root).find((r) => r.id === back).status, "在途")
  assert.equal(rowsOf(root).find((r) => r.id === back).executor, getSessionId())
  // 新判据（笔-账绑定）：行回 `在途` 只说明可带的号存在；写盘还得把号报出来
  const agent = agentOf(root, { designSlot: true })
  const noNumber = await runWrite(agent, "thincoder-core/agent/w.mjs")
  assert.equal(noNumber.ok, false, "不带号写产品码 ⇒ 拒（有在途行不再自动放行）")
  assert.match(noNumber.result, /no ledger number on this call/)
  assert.equal(existsSync(join(root, "thincoder-core/agent/w.mjs")), false, "不带号拒写后目标文件不存在")
  const numbered = await runWrite(agent, "thincoder-core/agent/w.mjs", { ledger: `#${back}` })
  assert.equal(numbered.ok, true, `带重开那条在途号 ⇒ 产品码写照写 — ${numbered.result}`)
})

test("CLI 14-7 核销后重开 ⇒ 行零改、逐 id 点名；两种重开并存 ⇒ 两行回执各一行", async () => {
  const root = await freshRecord("14-7")
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  const work = workOf(root)
  await parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "证据" }, ctx0(root))
  // 收口即结算 ⇒ 建档行已 已核销。重开要看到「待核销 ∥ 已核销」两态并存，只能在收口之后造：
  // 行 A = 手工推进到 待核销（收口后重开回收它）；行 B = 手工推进到 待核销 再核销（终态不回收）
  const a = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "待结账", task_book: REC }, boundary: root })
  const b = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "结过账", task_book: REC, evidence: "工作完成证据" }, boundary: root })
  for (const id of [a, b]) {
    ledgerUpdate({ cwd: root, id, patch: { status: "待设计" }, boundary: root })
    ledgerUpdate({ cwd: root, id, patch: { status: "在途" }, boundary: root })
    ledgerUpdate({ cwd: root, id, patch: { status: "待核销" }, boundary: root })
  }
  ledgerClose({ cwd: root, id: b, status: "已核销", boundary: root, agent: {} })
  // A 待核销，B 与建档行 已核销——两态并存后重开
  const msg = await parent.execute({ action: "status", path: recOf(root), segment: "§1", value: "进行中", note: "继续" }, ctx0(root))
  const lines = msg.split("\n").filter((l) => l.startsWith("[ledger reopen]"))
  assert.equal(lines.length, 2, "两行回执各一行")
  assert.match(lines[0], new RegExp(`本批待核销行 → 在途 1 行：#${a} 「待结账」`))
  assert.match(lines[1], new RegExp(`本批已核销行不可回收 2 行：#1 「g」；#${b} 「结过账」——已核销为终态`))
  assert.equal(rowsOf(root).find((r) => r.id === a).status, "在途")
  assert.equal(rowsOf(root).find((r) => r.id === b).status, "已核销", "已核销行零改")
})

test("CLI 14-8 §3 已 pass 后同批打回 ⇒ 状态行重置、§5 拒；补一块携 pass 裁定的轮次块后放行", async () => {
  const root = await freshRecord("14-8")
  const coder = batchTool(REC)
  const ctx = { depth: 1, agent: { ...agentOf(root), _role: "eng-coder", _batchDoc: REC } }
  // 第 1 轮：评审真写一轮 pass（工具盖戳 `### 轮次 1`）⇒ 状态行 = 评审通过
  await review(root).execute({ action: "append", segment: "§3", text: "首选方案可行。\n\nVERDICT: pass" }, { agent: agentOf(root) })
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  // 第 2 轮：同一批判 changes-required ⇒ 工具同笔重置状态行 + 本轮块首留痕
  await review(root).execute({ action: "append", segment: "§3", text: "复核发现一处缺陷。\n\nVERDICT: changes-required" }, { agent: agentOf(root) })
  const src = readFileSync(recOf(root), "utf8")
  const s3 = src.slice(src.indexOf("## §3"), src.indexOf("## §4"))
  assert.match(s3, /\*\*状态行\*\*：进行中（第 2 轮打回）/, "档面：§3 状态行字节（不经解析）")
  assert.match(s3, /> 状态行重置：第 2 轮打回（changes-required）· 上一轮状态行 = 评审通过 → 进行中 · \d{4}-\d{2}-\d{2}/, "重置留痕在档")
  // §5 拒面 = 门打印的解析词（不是带括注的整串），§5 字节不变
  await assert.rejects(
    () => coder.execute({ action: "append", segment: "§5", text: "先写实现" }, ctx),
    (e) => /§3 状态行 = 进行中，须 = 评审通过/.test(e.message),
  )
  assert.equal(readFileSync(recOf(root), "utf8"), src, "§5 拒后档字节不变")
  // 评审再 pass：判据 2 要末块自己携 pass 裁定 ⇒ `status` 单写不足以开 `§5`（末块仍是携 changes-required 的那一块）
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  await assert.rejects(
    () => coder.execute({ action: "append", segment: "§5", text: "实现落地" }, ctx),
    (e) => /last §3 round block carries no pass verdict/.test(e.message) && /块内裁定 = VERDICT: changes-required/.test(e.message),
  )
  // 再 pass = 追加一块携 `VERDICT: pass` 的轮次块（块落进 §3 即可）⇒ 放行
  await review(root).execute({ action: "append", segment: "§3", text: "缺陷已修，结论改为通过。\n\nVERDICT: pass" }, { agent: agentOf(root) })
  assert.match(await coder.execute({ action: "append", segment: "§5", text: "实现落地" }, ctx), /appended/)
})

test("CLI 14-9 在途与待核销退回待讨论：理由必填、解绑、created_at 保持、回执带 reason", async () => {
  const root = await freshRecord("14-9")
  const ctx = ctx0(root)
  const active = workOf(root)
  const pending = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "待核销退回", task_book: REC, evidence: "旧证据" }, boundary: root })
  for (const status of ["待设计", "在途", "待核销"]) ledgerUpdate({ cwd: root, id: pending, patch: { status }, boundary: root })

  for (const [id, from] of [[active.id, "在途"], [pending, "待核销"]]) {
    const before = rowsOf(root).find((r) => r.id === id)
    for (const evidence of [undefined, "   "]) {
      await assert.rejects(() => ledgerTool.execute({ action: "update", id, status: "待讨论", evidence }, ctx), /退回.*理由|evidence 为空/)
      assert.deepEqual(rowsOf(root).find((r) => r.id === id), before, `${from} 缺理由必须整行不变`)
    }
    const reason = `${from} 尚未完成，退回等待`
    const out = JSON.parse(await ledgerTool.execute({ action: "update", id, status: "待讨论", evidence: reason }, ctx))
    assert.equal(out.reason, reason)
    const after = rowsOf(root).find((r) => r.id === id)
    assert.equal(after.status, "待讨论")
    assert.equal(after.executor, null)
    assert.equal(after.task_book, null)
    assert.equal(after.trigger, null)
    assert.equal(after.created_at, before.created_at)
    assert.ok(after.evidence.endsWith(reason))
  }
})

// ─── 收口一致性批（R38–R40 · RTM 14-10 / 14-11 / 14-12）──────────────────────────────────

/** 第二连接持写锁（台账写失败注入手法 = `docs/core/design/LEDGER.md` §8 T108：第二连接持写锁）。 */
async function holdLedgerLock(root) {
  const { DatabaseSync } = await import("node:sqlite")
  const lock = new DatabaseSync(ledgerDbPath(root, root))
  lock.exec("BEGIN IMMEDIATE")
  return () => { try { lock.exec("ROLLBACK") } catch { /* 已结 */ } lock.close() }
}
/** 档写盘后同步置只读；台账持锁失败后，补偿回写也必失败。挂钩与锁都在 finally 撤掉。 */
async function closeWithDoubleFailure(root, completed) {
  const release = await holdLedgerLock(root)
  configureBatchSegment({ onWrite: (_agent, abs) => chmodSync(abs, 0o444) })
  try {
    return await parent.execute({ action: "close", path: recOf(root), completed, closeEvidence: "证据" }, ctx0(root)).then(() => null, (e) => e)
  } finally {
    resetBatchSegment()
    release()
    chmodSync(recOf(root), 0o644)
  }
}
/** 手工把一条新行推进到 `待核销`（收口后行已是归档终态 ⇒ 这是造「待核销」夹具的唯一合法路）。 */
const pushToSettling = (root, title) => {
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title, task_book: REC, trigger: "归批", evidence: "工作证据" }, boundary: root })
  for (const s of ["待设计", "在途", "待核销"]) ledgerUpdate({ cwd: root, id, patch: { status: s }, boundary: root })
  return id
}

test("CLI 14-10 batch close 一次结清两种起点：点名行两跳到已核销、既有待核销行一并结清；closeEvidence 空白写档前拒", async () => {
  const root = await freshRecord("14-10")
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  const work = workOf(root)
  const settling = pushToSettling(root, "做完没结账")
  const waiting = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "等待下一批", task_book: REC, trigger: "归批" }, boundary: root })
  const deferred = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "认账不排期", task_book: REC, trigger: "认账不排期" }, boundary: root })
  ledgerUpdate({ cwd: root, id: deferred, patch: { status: "待设计" }, boundary: root })
  const ctx = ctx0(root)
  // ① 证据空白（缺 ∥ 空串 ∥ 全空白）⇒ 写档前拒，档账令牌零改
  const beforeDoc = readFileSync(recOf(root), "utf8")
  const beforeRows = rowsOf(root)
  for (const closeEvidence of [undefined, "", "   "]) {
    await assert.rejects(
      () => parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence }, ctx),
      /closeEvidence 必填/,
      `空证据（${JSON.stringify(closeEvidence)}）⇒ 拒`,
    )
    assert.equal(readFileSync(recOf(root), "utf8"), beforeDoc, "档字节零改")
    assert.deepEqual(rowsOf(root), beforeRows, "台账零改")
  }
  assert.equal(ctx.agent._engDesignTokens, undefined)
  // ② 一次收口：两种起点各一行点名，本批零 在途 零 待核销
  const msg = await parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "本批把一致性做完了" }, ctx)
  assert.equal(rowsOf(root).find((r) => r.id === work.id).status, "已核销")
  assert.equal(rowsOf(root).find((r) => r.id === settling).status, "已核销", "既有 待核销 行一并结清")
  for (const id of [work.id, settling]) {
    const row = rowsOf(root).find((r) => r.id === id)
    assert.ok(row.closed_at, `#${id} closed_at 落值`)
    assert.match(row.evidence, /收口 \d{4}-\d{2}-\d{2}：本批把一致性做完了$/, `#${id} 证据带收口前缀`)
  }
  assert.equal(rowsOf(root).filter((r) => r.task_book === REC && (r.status === "在途" || r.status === "待核销")).length, 0)
  const lines = msg.split("\n").filter((l) => l.startsWith("[ledger reanchor]"))
  assert.ok(lines.some((l) => l.includes(`#${work.id} 「g」 在途 → 待核销 → 已核销`)), `在途起点那行：${msg}`)
  assert.ok(lines.some((l) => l.includes(`#${settling} 「做完没结账」 待核销 → 已核销`)), `待核销起点那行：${msg}`)
  assert.equal(rowsOf(root).find((r) => r.id === waiting).status, "待讨论")
  assert.equal(rowsOf(root).find((r) => r.id === waiting).trigger, "条件")
  assert.equal(rowsOf(root).find((r) => r.id === deferred).status, "待设计")
  assert.equal(rowsOf(root).find((r) => r.id === deferred).trigger, "认账不排期")
  const check = batchLedgerConsistency({ cwd: root, batch: REC, boundary: root })
  assert.equal(check.record, "closed")
  assert.equal(check.consistent, true, "正常收口绿侧：等待态不命中 closed-but-open-rows")
  assert.deepEqual(check.halfStates, [])
  assert.equal(check.rows.find((r) => r.id === waiting).trigger, "条件", "查询面露出 trigger")
  assert.match(msg, /\[ledger consistency\] 一致（本批 4 行）/)
})

test("CLI 14-11 close 双失败两拍：回滚成功可重试；补偿失败按实际行集报 closed-but-open-rows 或全归档一致", async () => {
  const root = await freshRecord("14-11")
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  const work = workOf(root)
  const beforeDoc = readFileSync(recOf(root), "utf8")
  const beforeRows = rowsOf(root)
  const beforeCheck = batchLedgerConsistency({ cwd: root, batch: REC, boundary: root })
  const release = await holdLedgerLock(root)
  try {
    const err = await parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "证据" }, ctx0(root)).then(() => null, (e) => e)
    assert.ok(err, "台账写失败 ⇒ close 抛")
    assert.match(err.message, /^batch: close failed — 台账事务未提交（.+）；批档已回滚到写前字节，可原样重试。Ledger: no committed change from this call \(it never reached COMMIT\)\.$/)
    assert.equal(readFileSync(recOf(root), "utf8"), beforeDoc, "档回滚到写前字节")
  } finally { release() }
  assert.deepEqual(rowsOf(root), beforeRows, "台账零改")
  assert.deepEqual(batchLedgerConsistency({ cwd: root, batch: REC, boundary: root }), beforeCheck, "回滚成功 ⇒ check 与写前逐项相等")
  const after = await parent.execute({ action: "check", path: recOf(root) }, ctx0(root))
  assert.match(after, /  record = open · rows = 1 · consistent = true/)
  const msg = await parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "证据" }, ctx0(root))
  assert.match(msg, /已收口/)
  assert.equal(rowsOf(root).find((r) => r.id === work.id).status, "已核销")

  // 第二拍①：点名行仍在途。onWrite 在档写盘后同步置只读 ⇒ 台账失败之外，补偿回写也真失败。
  const namedRoot = await freshRecord("14-11-named")
  await review(namedRoot).execute({ action: "status", value: "评审通过" }, { agent: agentOf(namedRoot) })
  const namedWork = workOf(namedRoot)
  const namedErr = await closeWithDoubleFailure(namedRoot, [namedWork.id])
  assert.ok(namedErr)
  assert.match(namedErr.message, /^batch: close failed — 台账事务未提交（database is locked）；批档回滚也失败（.+）——批档可能仍为已收口。/)
  assert.ok(namedErr.message.includes(`batch({action:"check", path:"${recOf(namedRoot)}"})`))
  assert.match(namedErr.message, /if consistent=false, repair the ledger and reopen before retrying/)
  const namedRead = batchLedgerConsistency({ cwd: namedRoot, batch: REC, boundary: namedRoot })
  assert.equal(namedRead.record, "closed")
  assert.deepEqual(namedRead.halfStates.map((h) => h.name), ["closed-but-open-rows"])
  assert.deepEqual(namedRead.halfStates[0].rows, [namedWork.id])

  // 第二拍②：completed=[]，等待态仍未重锚 ⇒ 同类命中；不依赖一条在途行。
  const waitingRoot = await freshRecord("14-11-waiting")
  await review(waitingRoot).execute({ action: "status", value: "评审通过" }, { agent: agentOf(waitingRoot) })
  ledgerUpdate({ cwd: waitingRoot, id: workOf(waitingRoot).id, patch: { status: "待讨论", evidence: "退回等待" }, boundary: waitingRoot })
  const waiting = ledgerAdd({ cwd: waitingRoot, row: { kind: "tech_todo", title: "待重锚等待态", task_book: REC, trigger: "归批" }, boundary: waitingRoot })
  const waitingErr = await closeWithDoubleFailure(waitingRoot, [])
  assert.ok(waitingErr)
  assert.match(waitingErr.message, /批档回滚也失败/)
  const waitingRead = batchLedgerConsistency({ cwd: waitingRoot, batch: REC, boundary: waitingRoot })
  assert.deepEqual(waitingRead.halfStates.map((h) => h.name), ["closed-but-open-rows"])
  assert.deepEqual(waitingRead.halfStates[0].rows, [waiting])

  // 第二拍③：completed=[]，非空全归档且档头不缺号 ⇒ 已是目标终态；不得为重试造一个不一致。
  const archivedRoot = await freshRecord("14-11-archived")
  await review(archivedRoot).execute({ action: "status", value: "评审通过" }, { agent: agentOf(archivedRoot) })
  const archivedWork = workOf(archivedRoot)
  ledgerUpdate({ cwd: archivedRoot, id: archivedWork.id, patch: { status: "待核销", evidence: "工作证据" }, boundary: archivedRoot })
  ledgerClose({ cwd: archivedRoot, id: archivedWork.id, status: "已核销", boundary: archivedRoot, agent: {} })
  const archivedErr = await closeWithDoubleFailure(archivedRoot, [])
  assert.ok(archivedErr)
  assert.match(archivedErr.message, /if consistent=true, the batch is already closed and settled — do not retry\.$/)
  const archivedRead = batchLedgerConsistency({ cwd: archivedRoot, batch: REC, boundary: archivedRoot })
  assert.equal(archivedRead.record, "closed")
  assert.equal(archivedRead.consistent, true)
  assert.deepEqual(archivedRead.halfStates, [])
})

test("CLI 14-12 重开回收失败注入 ⇒ 重开拒（逐字重开第一条串）、档回已收口字节、行仍待核销；库恢复重开成功；残态 check 点名 open-but-unwritable", async () => {
  const root = await freshRecord("14-12")
  await review(root).execute({ action: "status", value: "评审通过" }, { agent: agentOf(root) })
  const work = workOf(root)
  await parent.execute({ action: "close", path: recOf(root), completed: [work.id], closeEvidence: "证据" }, ctx0(root))
  const back = pushToSettling(root, "重开要回收的行")
  const frozenDoc = readFileSync(recOf(root), "utf8")
  const beforeCheck = batchLedgerConsistency({ cwd: root, batch: REC, boundary: root })
  assert.deepEqual(beforeCheck.halfStates.map((h) => h.name), ["closed-but-settling"], "旁行原态：重开前就有待核销行")
  const release = await holdLedgerLock(root)
  try {
    const err = await parent.execute({ action: "status", path: recOf(root), segment: "§1", value: "进行中", note: "继续做" }, ctx0(root)).then(() => null, (e) => e)
    assert.ok(err, "回收失败 ⇒ 重开抛")
    assert.match(err.message, /^batch: reopen failed — 台账事务未提交（.+）；批档仍为已收口（已回滚），可原样重试。Ledger: no committed change from this call \(it never reached COMMIT\)\.$/)
    assert.equal(readFileSync(recOf(root), "utf8"), frozenDoc, "档回到已收口字节")
  } finally { release() }
  assert.equal(rowsOf(root).find((r) => r.id === back).status, "待核销", "行仍 待核销（回收没成）")
  assert.deepEqual(batchLedgerConsistency({ cwd: root, batch: REC, boundary: root }), beforeCheck, "check 与重开前逐项相等")
  // 第二拍：再重开一次，档写盘后同步置只读 ⇒ 回收失败且补偿回写也失败，第二条串与残态同拍出现。
  const secondRelease = await holdLedgerLock(root)
  configureBatchSegment({ onWrite: (_agent, abs) => chmodSync(abs, 0o444) })
  let secondErr = null
  try {
    secondErr = await parent.execute({ action: "status", path: recOf(root), segment: "§1", value: "进行中", note: "继续做" }, ctx0(root)).then(() => null, (e) => e)
  } finally {
    resetBatchSegment()
    secondRelease()
    chmodSync(recOf(root), 0o644)
  }
  assert.ok(secondErr)
  assert.match(secondErr.message, /^batch: reopen failed — 台账事务未提交（database is locked）；批档回滚也失败（.+）——半状态成立：批档已开，本批行仍待核销。/)
  assert.ok(secondErr.message.includes(`batch({action:"check", path:"${recOf(root)}"})`))
  const read = batchLedgerConsistency({ cwd: root, batch: REC, boundary: root })
  assert.equal(read.record, "open")
  assert.equal(read.consistent, false, "残态不得报一致")
  assert.deepEqual(read.halfStates.map((h) => h.name), ["open-but-unwritable"])
  assert.match(read.halfStates[0].exit, /收口一次把它结清；或把它退到 在途 继续做/)
  const receipt = await parent.execute({ action: "check", path: recOf(root) }, ctx0(root))
  assert.match(receipt, /open-but-unwritable/)
  assert.match(receipt, /\[ledger consistency\] 不一致/)
  // 残态下档已是 open，直接 status 不会触发回收；按拒文先修复，再把档修回冻结字节后原样重试。
  writeFileSync(recOf(root), frozenDoc)
  const msg = await parent.execute({ action: "status", path: recOf(root), segment: "§1", value: "进行中", note: "继续做" }, ctx0(root))
  assert.match(msg, /\[ledger reopen\] 本批待核销行 → 在途 1 行/)
  assert.equal(rowsOf(root).find((r) => r.id === back).status, "在途")

  // 全归档起点：失败重开回滚后，check 与写前逐项相等；此形写前一致，不能钉成 closed-but-settling。
  const archivedRoot = await freshRecord("14-12-archived")
  await review(archivedRoot).execute({ action: "status", value: "评审通过" }, { agent: agentOf(archivedRoot) })
  const archivedWork = workOf(archivedRoot)
  await parent.execute({ action: "close", path: recOf(archivedRoot), completed: [archivedWork.id], closeEvidence: "证据" }, ctx0(archivedRoot))
  const archivedDoc = readFileSync(recOf(archivedRoot), "utf8")
  const archivedBefore = batchLedgerConsistency({ cwd: archivedRoot, batch: REC, boundary: archivedRoot })
  assert.equal(archivedBefore.consistent, true)
  const archivedRelease = await holdLedgerLock(archivedRoot)
  let archivedErr = null
  try {
    archivedErr = await parent.execute({ action: "status", path: recOf(archivedRoot), segment: "§1", value: "进行中", note: "继续做" }, ctx0(archivedRoot)).then(() => null, (e) => e)
  } finally { archivedRelease() }
  assert.ok(archivedErr)
  assert.match(archivedErr.message, /^batch: reopen failed — 台账事务未提交（database is locked）；批档仍为已收口（已回滚），可原样重试。Ledger: no committed change from this call \(it never reached COMMIT\)\.$/)
  assert.equal(readFileSync(recOf(archivedRoot), "utf8"), archivedDoc)
  assert.deepEqual(batchLedgerConsistency({ cwd: archivedRoot, batch: REC, boundary: archivedRoot }), archivedBefore)
})
