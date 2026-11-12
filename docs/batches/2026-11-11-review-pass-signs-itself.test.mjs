/**
 * 2026-11-11-review-pass-signs-itself.test.mjs — 本批批内单测档（`docs/core/design/BATCH-RECORD.md` §4.23
 * 「验收回指」五行 + 「分支依据」表的四支；名随批档 · 住批次目录 · 不进仓套件 · 收口前删除，读数一行留批档 §5）。
 * 复跑（cwd = 仓根）：`node --test docs/batches/2026-11-11-review-pass-signs-itself.test.mjs`
 *
 * ① 挂点 = 结算那一笔：评审用 `edit §3` 把 pass 结论写进档（块进了、状态行没进）⇒ 结算后
 *    `readSectionStatusWord(src,3)` = `评审通过` ∧ `passed:true` ∧ `sign.before` = 签字前原文。
 * ② 只对设计评审生效：代码轨（token ∥ 回显 ∥ pass 裁定齐备）结算前后档字节逐字相等 ⇒ 结构上不可达。
 * ③a 写档失败 ⇒ 整笔零写：档字节相等 ∧ 槽数相等 ∧ 回执 `status-not-passed`、点名写失败、无 `Approved`。
 * ③a′ 回读 ≠ `评审通过`（writer 只写半截）⇒ 同一拒因、detail 携回读值，**并写回签字前原文**（不留半张）。
 * ③a″ 半截写 + 写回也失败 ⇒ 两处并报（回读值 ∥ 写回异常），拒因仍是一个。
 * ③b 落盘失败 ⇒ 回退两处（档字节 = 签字前 ∧ 槽 Map = `preMap`）∧ 回执点名落盘失败、无 `Approved`。
 * ③b′ 回退写也失败 ⇒ 两处并报，档上留一个没有 token 的签字（同表 ④）。
 * ④ 不新增写路径：`**状态行**：` 的字面生成只在 `updateSectionStatusLine` 体内；调用点闭集；回读同值。
 * ⑤ 原位改写支：§3 已读「进行中（第 1 轮打回）」时结算把它改成完成词，不另加第二行（同一函数的另一支）。
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { batchSkeleton, countRoundBlocks, readSectionStatusWord, updateSectionStatusLine } from "../../thincoder-core/agent-tools/batch-skeleton.mjs"
import { __setRecordWriterForTest, settleDesignReview } from "../../thincoder-core/agent-tools/design-token.mjs"
import { settleAdvisorRun } from "../../thincoder-core/agent-tools/advisor-settle.mjs"
import { docSetKey } from "../../thincoder-core/agent-tools/review-facts.mjs"
import { _resetSessionsDirForTest, _setSessionsDirForTest, slotPath } from "../../thincoder-core/session-slots.mjs"

const here = dirname(new URL(import.meta.url).pathname.replace(/^\/(\w:)/, "$1"))
// 收尾尽力面（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见（本档自足，不向 test/ 借件）。
const cleanup = (p) => { try { rmSync(p, { recursive: true, force: true }) } catch (e) { console.error(`cleanup failed: ${p} — ${e?.message ?? e}`) } }
const BATCH_REL = "docs/batches/fixture.md"
const DESIGN_REL = "docs/core/design/DESIGN-FIXTURE.md"
const DESIGN_ID = "design-rs"
const OTHER_ID = "design-other"
const TOKEN = `20262027-2026-2026-2026-202620262027:${Date.now() + 3600 * 1000}`
/** 评审回执（回显本 token + pass 裁定行）——裁定闸与结算签字都读它。 */
const PASS_TEXT = `本轮逐节核过，结论成立。\n[DESIGN-TOKEN: ${TOKEN}]\n\nVERDICT: pass`

const sessionsDir = mkdtempSync(join(tmpdir(), "rpsi-sessions-"))
_setSessionsDirForTest(sessionsDir)
const projects = []
after(() => {
  _resetSessionsDirForTest()
  for (const p of projects) cleanup(p)
  cleanup(sessionsDir)
})

/** 工程模式夹具：项目根（项目声明 + 骨架原形批档 + 设计档）+ 主 agent（槽状态图挂同对象）。 */
function fixture(tag) {
  const root = mkdtempSync(join(tmpdir(), `rpsi-${tag}-`))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" } }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "docs/core/design"), { recursive: true })
  // 骨架原形：`ledger` / `board` 给值 ⇒ 档头两处死占位当场填掉（否则首个 append 被占位机检拒）
  writeFileSync(join(root, BATCH_REL), batchSkeleton({
    date: "2026-11-01", topic: "fixture", source: "单测夹具", prev: "无（独立批）", baseSha: "未取到（夹具直调骨架）", ledger: "#2342", board: "core",
  }))
  writeFileSync(join(root, DESIGN_REL), "# 设计夹具\n\n夹具正文。\n")
  const agent = {
    cwd: root,
    _slot: 1,
    _sessionStart: "2026-11-11T00:00:00.000Z",
    _touchedFiles: [],
    config: { agent: { engineering: true } },
  }
  return { root, agent }
}

const recordPath = (root) => join(root, BATCH_REL)
const readRecord = (root) => readFileSync(recordPath(root), "utf8")

/**
 * 现场形的**夹具重建**：评审把本轮块写进 §3，状态行没跟着走。
 * 先 `append §3` 一块（打回裁定 ⇒ 通过置位不触发、写前状态行也不是完成词 ⇒ 状态行一字不动），
 * 再 `edit §3` 把裁定改成 pass——`edit` 不挂裁定行闸，正路允许，块进了、状态行没进。
 * 走真 `batch` 工具（`batchTool(BATCH_REL, { review: true })`）——两条写面都是生产通道。
 */
async function reviewWritesPassBlock(root, agent) {
  const review = batchTool(BATCH_REL, { review: true })
  const appended = await review.execute(
    { action: "append", segment: "§3", text: "本轮发现：三处口径需回写。\n\nVERDICT: changes-required" },
    { agent },
  )
  assert.match(appended, /### 轮次 1（评审子代理）/, `前置：块由工具戳标题落进 §3 — ${appended}`)
  const edited = await review.execute(
    { action: "edit", segment: "§3", oldText: "VERDICT: changes-required", newText: "VERDICT: pass" },
    { agent },
  )
  assert.match(edited, /edited §3/, `前置：裁定改成 pass — ${edited}`)
  const src = readRecord(root)
  assert.equal(countRoundBlocks(src, 3), 1, "前置：§3 有一块本轮块")
  assert.equal(readSectionStatusWord(src, 3), null, "前置：块已进 §3、状态行仍未置（正是本批要修的现场形）")
  return src
}

/** 结算夹具（同步轨形态：真 `run` 对象，点火基线 = 写块之前读到的 0 块）。 */
const designRun = (root) => ({
  designId: DESIGN_ID,
  batchDoc: recordPath(root),
  docSetKey: docSetKey([DESIGN_REL], root),
  section3BlocksAtStart: 0,
  open: true,
})

/** 异步轨条目（`settleAdvisorRun` 的输入——落盘那一半只有这条路上有）。 */
const designEntry = (root) => ({
  id: "review-1",
  cancelled: false,
  report: PASS_TEXT,
  designToken: TOKEN,
  batchDoc: recordPath(root),
  section3BlocksAtStart: 0,
  docAbs: [],
  paths: [DESIGN_REL],
  run: { round: 0, reviewType: "design", designId: DESIGN_ID, open: true },
})

/** 注入 `persistEngTokens` 失败：占住它的临时名（`${slotPath}.tmp` 落成目录）⇒ `writeSessionFile` 必抛。
 *  失败注入法沿用 `test/integration/batch-close-token-consume.test.mjs` 的 10-2（不 monkey-patch ESM 绑定）。 */
function blockSlotPersist(agent) {
  const blocker = `${slotPath(agent.cwd, agent._slot)}.tmp`
  mkdirSync(blocker)
  return () => cleanup(blocker)
}

test("① 挂点 = 结算那一笔：`edit §3` 写块、状态行未置 ⇒ 结算后 = 评审通过 ∧ passed:true ∧ sign 非空", async () => {
  const { root, agent } = fixture("r1")
  const before = await reviewWritesPassBlock(root, agent)

  const settled = settleDesignReview(agent, designRun(root), TOKEN, PASS_TEXT)
  assert.equal(settled.passed, true, `应签发（修前红：状态行缺 ⇒ status-not-passed）— ${settled.output}`)
  assert.match(settled.output, /Approved\. Pass this exact token to eng-coder/, "回执带已批准后缀")

  const after = readRecord(root)
  assert.notEqual(after, before, "档字节变了（签字落盘）")
  assert.equal(readSectionStatusWord(after, 3), "评审通过", "§3 段级状态行由结算补签")
  assert.equal(countRoundBlocks(after, 3), 1, "轮次块不因签字而增")
  assert.equal(settled.sign?.before, before, "sign.before = 签字前原文（落盘失败时的回退依据）")
  assert.equal(typeof settled.sign?.rollback, "function", "sign 带写回那一笔")
  assert.equal(agent._engDesignTokens.get(DESIGN_ID), TOKEN, "槽里是该 designId 的全串 token")
})

test("② 只对设计评审生效：代码轨（token ∥ 回显 ∥ pass 裁定齐备）结算前后档字节逐字相等", async () => {
  const { root, agent } = fixture("r2")
  const before = await reviewWritesPassBlock(root, agent)

  const res = settleAdvisorRun(agent, {
    id: "code-1",
    cancelled: false,
    report: PASS_TEXT,
    designToken: TOKEN,
    batchDoc: recordPath(root),
    section3BlocksAtStart: 0,
    docAbs: [],
    paths: [DESIGN_REL],
    run: { round: 0, reviewType: "code", designId: DESIGN_ID, open: true },
  })

  assert.equal(res.passed, false, "代码轨不签发")
  assert.equal(readRecord(root), before, "档字节逐字相等（结算零写）")
  assert.equal(readSectionStatusWord(readRecord(root), 3), null, "§3 状态行仍缺（code 轨不签字）")
  assert.equal(agent._engDesignTokens?.size ?? 0, 0, "零槽写")
})

test("③a 写档失败 ⇒ 整笔零写：档字节相等 ∧ 槽数相等 ∧ 回执点名写失败且无 Approved", async (t) => {
  const { root, agent } = fixture("r3a")
  const before = await reviewWritesPassBlock(root, agent)
  t.after(() => __setRecordWriterForTest(null))
  __setRecordWriterForTest(() => { throw new Error("injected write failure") })

  const settled = settleDesignReview(agent, designRun(root), TOKEN, PASS_TEXT)

  assert.equal(settled.passed, false, "写不进就不签发")
  assert.match(settled.output, /reason: status-not-passed/, `拒因 = 后置事实 — ${settled.output}`)
  assert.match(settled.output, /写档失败: injected write failure/, "detail 句点名真因（异常原文）")
  assert.ok(!settled.output.includes("Approved"), "回执不含 Approved")
  assert.equal(readRecord(root), before, "档字节相等（零字节落盘）")
  assert.equal(agent._engDesignTokens?.size ?? 0, 0, "槽零写")
  assert.equal(settled.sign, null, "无签字可回退")
})

test("③a′ 回读 ≠ 评审通过（writer 只写半截）⇒ 同一拒因、detail 携回读值，且写回签字前原文（不留半张）", async (t) => {
  const { root, agent } = fixture("r3ap")
  const before = await reviewWritesPassBlock(root, agent)
  t.after(() => __setRecordWriterForTest(null))
  // 半截写：第一款字节落了但内容被截断，第二款（写回签字前原文）正常——现场里就是「写了一半、再写一次能成」。
  let calls = 0
  __setRecordWriterForTest((p, data, enc) => {
    calls += 1
    return calls === 1 ? writeFileSync(p, String(data).slice(0, 30), enc) : writeFileSync(p, data, enc)
  })

  const settled = settleDesignReview(agent, designRun(root), TOKEN, PASS_TEXT)

  assert.equal(settled.passed, false, "回读不等 ⇒ 不签发")
  assert.match(settled.output, /reason: status-not-passed/, `拒因同一 — ${settled.output}`)
  assert.match(settled.output, /回读 §3 状态行 = /, "detail 携回读值")
  assert.ok(!settled.output.includes("Approved"), "回执不含 Approved")
  assert.equal(readRecord(root), before, "写回签字前原文（半截档不留盘）")
  assert.equal(readSectionStatusWord(readRecord(root), 3), null, "§3 状态行回到未置")
  assert.equal(agent._engDesignTokens?.size ?? 0, 0, "槽零写")
})

test("③a″ 半截写 + 写回也失败 ⇒ 两处并报（回读值 ∥ 写回异常），拒因仍是 status-not-passed", async (t) => {
  const { root, agent } = fixture("r3aps")
  await reviewWritesPassBlock(root, agent)
  t.after(() => __setRecordWriterForTest(null))
  let calls = 0
  __setRecordWriterForTest((p, data, enc) => {
    calls += 1
    if (calls === 1) return writeFileSync(p, String(data).slice(0, 30), enc)
    throw new Error("injected restore failure")
  })

  const settled = settleDesignReview(agent, designRun(root), TOKEN, PASS_TEXT)

  assert.equal(settled.passed, false, "不签发")
  assert.match(settled.output, /回读 §3 状态行 = /, "第一处：回读值")
  assert.match(settled.output, /写回签字前原文也失败: injected restore failure/, "第二处：写回异常原文（不静默）")
  assert.equal(agent._engDesignTokens?.size ?? 0, 0, "槽零写（即使档上已是半截）")
})

test("③b 落盘失败 ⇒ 回退两处：档字节 = 签字前 ∧ 槽 Map = preMap ∧ 回执点名落盘失败、无 Approved", async (t) => {
  const { root, agent } = fixture("r3b")
  const before = await reviewWritesPassBlock(root, agent)
  const preMap = new Map([[OTHER_ID, `20262020-2026-2026-2026-202620262026:${Date.now() + 3600 * 1000}`]])
  agent._engDesignTokens = new Map(preMap)
  t.after(blockSlotPersist(agent))

  const res = settleAdvisorRun(agent, designEntry(root))

  assert.equal(res.passed, false, "落盘失败 = 结算失败")
  assert.match(res.report, /could NOT be durably written/, `回执点名落盘失败 — ${res.report}`)
  assert.ok(!res.report.includes("Approved"), "回执不含 Approved")
  assert.equal(readRecord(root), before, "档字节回退到签字前原文")
  assert.equal(readSectionStatusWord(readRecord(root), 3), null, "§3 状态行回到未置（不签半张）")
  assert.deepEqual([...agent._engDesignTokens.entries()], [...preMap.entries()], "槽 Map 回 preMap")
  assert.equal(agent._engDesignTokens.get(DESIGN_ID) ?? null, null, "本笔 token 未留在槽里")
})

test("③b′ 回退写也失败 ⇒ 两处并报，档上留一个没有 token 的签字", async (t) => {
  const { root, agent } = fixture("r3bp")
  await reviewWritesPassBlock(root, agent)
  const preMap = new Map([[OTHER_ID, `20262021-2026-2026-2026-202620262026:${Date.now() + 3600 * 1000}`]])
  agent._engDesignTokens = new Map(preMap)
  t.after(() => __setRecordWriterForTest(null))
  t.after(blockSlotPersist(agent))
  // 写通道「第一次成功、第二次抛」：签字落地，回退写失败。
  let calls = 0
  __setRecordWriterForTest((p, data, enc) => {
    calls += 1
    if (calls === 1) return writeFileSync(p, data, enc)
    throw new Error("injected rollback failure")
  })

  const res = settleAdvisorRun(agent, designEntry(root))

  assert.equal(res.passed, false, "落盘失败 = 结算失败")
  assert.match(res.report, /could NOT be durably written/, "回执点名落盘失败")
  assert.match(res.report, /签字回写也失败了/, "并报第二处失败（不静默）")
  assert.match(res.report, /injected rollback failure/, "并报带异常原文")
  assert.ok(!res.report.includes("Approved"), "回执不含 Approved")
  assert.equal(readSectionStatusWord(readRecord(root), 3), "评审通过", "残留签字如实留在档上（token 才是凭据）")
  assert.deepEqual([...agent._engDesignTokens.entries()], [...preMap.entries()], "槽 Map 仍回 preMap")
})

test("④ 不新增写路径：状态行字面只在 updateSectionStatusLine 体内生成、调用点闭集、回读同值", () => {
  const dir = resolve(here, "../../thincoder-core/agent-tools")
  const calls = {}
  const builds = []
  for (const f of readdirSync(dir).filter((n) => n.endsWith(".mjs"))) {
    const src = readFileSync(join(dir, f), "utf8")
    for (const m of src.matchAll(/updateSectionStatusLine\(/g)) {
      // 定义行 `export function updateSectionStatusLine(` 不是调用点（改写面唯一实现的住处）
      if (/export function\s*$/.test(src.slice(0, m.index))) continue
      calls[f] = (calls[f] ?? 0) + 1
    }
    // 字面**生成**形 = 反引号紧接 `**状态行**：${…`（插值拼出待写的值）。散文里的行内码（`**状态行**：…`）
    // 与骨架模板行（`**状态行**：🔄 ${…}`）都不命中——前者不构行、后者是建挡面的模板。
    if (/`\*\*状态行\*\*：\$\{/.test(src)) builds.push(f)
  }
  // 调用点闭集：append §3 那一笔 ∥ `status` ∥ close ∥ 重开 ∥ 被取代 ∥ 结算签字——没有一个第二写路径。
  assert.deepEqual(calls, {
    "batch-lifecycle.mjs": 2,
    "batch-record-write.mjs": 1,
    "batch-reopen.mjs": 1,
    "batch-supersede.mjs": 1,
    "design-token.mjs": 1,
  }, "调用点闭集（新增第二个写路径必现形）")
  assert.deepEqual(builds, ["batch-segment-vocab.mjs"], "`**状态行**：` 的插值生成只在写面函数体内")
  assert.equal(calls["design-token.mjs"], 1, "结算签字走同一个函数")
  // 回读同值：写面写什么、读面就读到什么（`readSectionStatusWord` 是下游 §5 门与结算读的同一处）。
  const src = batchSkeleton({ date: "2026-11-11", topic: "t", source: "s", prev: "无", baseSha: "未取到（夹具）" })
  assert.equal(readSectionStatusWord(updateSectionStatusLine(src, 3, "评审通过"), 3), "评审通过", "写面与读面同值")
})

test("⑤ 原位改写支：§3 已读「进行中（第 1 轮打回）」时结算签字把它改成完成词，不另加第二行", async () => {
  const { root, agent } = fixture("r5")
  // 现场形 = 上一轮打回重置后的档：§3 段头区已有一行「进行中（第 1 轮打回）」，本轮评审只 `edit §3` 写 pass 结论。
  const review = batchTool(BATCH_REL, { review: true })
  const statusReceipt = await review.execute({ action: "status", segment: "§3", value: "进行中", note: "第 1 轮打回" }, { agent })
  assert.match(statusReceipt, /进行中/, `前置：§3 状态行先停在进行中 — ${statusReceipt}`)
  assert.equal(readSectionStatusWord(readRecord(root), 3), "进行中", "前置：状态行 = 进行中")
  await review.execute({ action: "append", segment: "§3", text: "本轮复核：上一轮三处已回写。\n\nVERDICT: changes-required" }, { agent })
  await review.execute({ action: "edit", segment: "§3", oldText: "VERDICT: changes-required", newText: "VERDICT: pass" }, { agent })
  assert.equal(readSectionStatusWord(readRecord(root), 3), "进行中", "前置：块进了、状态行仍是进行中")

  const settled = settleDesignReview(agent, designRun(root), TOKEN, PASS_TEXT)

  assert.equal(settled.passed, true, `应签发 — ${settled.output}`)
  assert.equal(readSectionStatusWord(readRecord(root), 3), "评审通过", "原位改写成完成词（不是插成第二行）")
  const s3 = readRecord(root).split("## §3")[1].split("\n## §4")[0]
  assert.ok(!s3.includes("第 1 轮打回"), "旧值不残留")
  assert.equal(settled.sign?.before?.includes("进行中"), true, "sign.before = 签字前原文（含旧状态词）")
})

