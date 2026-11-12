/*
 * batch-status-auto-set.test.mjs — 集成用例 27-1 ∥ 27-2 ∥ 27-3（RTM CLI 端故事 27「评审写一笔 §3 就够：状态行由工具置位」；
 * 回指 = 批档条目 R23；机制 + 判据单源 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.5 ∥ §5 R23 ∥ §2.15；
 * 27-3 的签字一半 = `docs/core/design/BATCH-RECORD.md` §4.23）。
 *
 * 业务入口 = 真 `batch` 工具的评审追加轨（`batchTool(batchDoc, { review: true })`）→ 真结算
 * （`settleDesignReview`）→ 真的 `append §5`——三面都从工具面进，不直调内部计划函数。
 * 本行与 17-1 同一入口、判相反的那一半：17-1 判「没写 §3 ⇒ 不签发」，27-1 判「写了一笔就够」。
 * 27-2 = 工具面批（无设计档）：走**代码轨**并携 `batchDoc`，评审员从真 `advisor` 工具里拿到 `batch` 写通道并把
 * `§3` 写进绑定档（判据单源 = 同档 §2.15）。
 * 27-2 负半幅 = 同一入口不携 `batchDoc` ⇒ 工具表无 `batch`、§3 轮次块 = 0（写通道只能由绑定开出）。
 * 27-3 = 评审用 `edit §3` 写结论（`edit` 不挂裁定行闸 ⇒ 块进了、状态行没进）⇒ 签字由结算补上，
 * 而不是靠 `append §3` 那一笔的通过置位。
 *
 * 夹具 = 骨架原形批档（`batchSkeleton` 产出：§3 **无**段级状态行——新批首轮 pass 的常态形）+
 * 系统临时域的项目根（带项目声明，文档机检门照跑）；27-2 的模型侧 = `node:http` 本机假 OpenAI SSE 端点
 * （脚本两轮：先发 `batch` 工具调用、再回收尾文本；先例 = `test/integration/advisor-guard-reminder-cap.test.mjs`）。
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-status-auto-set.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { batchSkeleton, countRoundBlocks, readSectionStatusWord } from "../../thincoder-core/agent-tools/batch-skeleton.mjs"
import { settleDesignReview } from "../../thincoder-core/agent-tools/design-token.mjs"
import { docSetKey } from "../../thincoder-core/agent-tools/review-facts.mjs"
import { advisorTool } from "../../thincoder-core/agent-tools/advisor.mjs"

const BATCH_REL = "docs/batches/fixture.md"
const DESIGN_REL = "docs/core/design/DESIGN-FIXTURE.md"
const DELIVERED_REL = "scripts/delivered.mjs"
const DESIGN_ID = "design-27"
const TOKEN = `20262027-2026-2026-2026-202620262027:${Date.now() + 3600 * 1000}`

const projects = []
after(() => {
  for (const p of projects) removeTempDirBestEffort(p)
})

/** 工程模式夹具：项目根（项目声明 + 骨架原形批档 + 设计档）+ 主 agent。 */
function fixture(tag) {
  const root = mkdtempSync(join(tmpdir(), `bsas-${tag}-`))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" } }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "docs/core/design"), { recursive: true })
  mkdirSync(join(root, "scripts"), { recursive: true })
  // 骨架模板的 §2 占位行点了一份真档（示例行）⇒ 夹具里让它真在盘：档名解得到，哪一面都不因它出一条悬空命中。
  mkdirSync(join(root, "thincoder-core/agent-tools"), { recursive: true })
  writeFileSync(join(root, "thincoder-core/agent-tools/batch-tier-gate.mjs"), "// 夹具：骨架模板示例行点名的档\n")
  // 骨架原形：`ledger` / `board` 给值 ⇒ 档头两处死占位当场填掉（否则首个 append 被占位机检拒）
  writeFileSync(join(root, BATCH_REL), batchSkeleton({
    date: "2026-11-01", topic: "fixture", source: "集成夹具", prev: "无（独立批）", baseSha: "未取到（夹具直调骨架）", ledger: "#1999", board: "core",
  }))
  writeFileSync(join(root, DESIGN_REL), "# 设计夹具\n\n夹具正文。\n")
  writeFileSync(join(root, DELIVERED_REL), "export const delivered = 1\n")
  const agent = { cwd: root, _slot: 1, config: { agent: { engineering: true } } }
  return { root, agent }
}

const readRecord = (root) => readFileSync(join(root, BATCH_REL), "utf8")
const statusLineOf = (src) => src.split(/\r?\n/).find((l) => /^\s*\*\*状态行\*\*[：:]/.test(l) && l.includes("评审"))
const trailLinesOf = (src) => src.split(/\r?\n/).filter((l) => l.startsWith("> 状态行重置"))

test("CLI 27-1 正常 · 绑本档的评审只写一笔携 pass 的 §3（不另写状态行）⇒ 状态行自动置位、结算签发、`append §5` 放行", async () => {
  const { root, agent } = fixture("r271")
  // 前置：骨架原形批档的 §3 无段级状态行（新批首轮 pass 的常态形）
  assert.equal(readSectionStatusWord(readRecord(root), 3), null, "前置：骨架原形 §3 无状态行")

  // ① 评审写一笔 §3——正文携 `VERDICT: pass`，全程不调 `status`、不手写状态行
  const review = batchTool(BATCH_REL, { review: true })
  const receipt = await review.execute(
    { action: "append", segment: "§3", text: "两份设计档逐节核过，结论成立。\n\nVERDICT: pass" },
    { agent },
  )
  const afterReview = readRecord(root)
  assert.match(receipt, /### 轮次 1（评审子代理）/, `回执应点名本轮块：${receipt}`)
  assert.equal(countRoundBlocks(afterReview, 3), 1, "轮次块 +1")
  assert.match(statusLineOf(afterReview) ?? "", /^\*\*状态行\*\*：评审通过$/, "§3 段级状态行由工具随块置位")
  assert.equal(readSectionStatusWord(afterReview, 3), "评审通过", "读侧同值（下游 §5 门 / 收口门 / 核销门③ / 结算面读的同一行）")
  assert.deepEqual(trailLinesOf(afterReview), [], "通过方向零留痕行（落进 §3 的轮次块即记录）")

  // ② 结算面：同一档、同一实例键，回执回显 token + 裁定行 ⇒ 签发（§3 落地门两判据当场成立）
  const run = {
    designId: DESIGN_ID,
    batchDoc: resolve(root, BATCH_REL),
    docSetKey: docSetKey([DESIGN_REL], root),
    section3BlocksAtStart: 0, // 点火基线 = 评审写块之前读到的块数
    open: true,
  }
  const settled = settleDesignReview(agent, run, TOKEN, `评审正文。\n[DESIGN-TOKEN: ${TOKEN}]\n\nVERDICT: pass`)
  assert.equal(settled.passed, true, `应签发（修前红：状态行缺 ⇒ status-not-passed）— ${settled.output}`)
  assert.match(settled.output, /Approved\. Pass this exact token to eng-coder/, "回执带已批准后缀（token 已签发）")
  assert.equal(agent._engDesignTokens.get(DESIGN_ID), TOKEN, "槽里是该 designId 的全串 token")

  // ③ 随后 `append §5` 放行：段序门两判据（状态词 ∥ 末块自带 pass 裁定）都由「那一笔」满足
  const coderCtx = { depth: 1, agent: { cwd: root, config: { agent: { engineering: true } }, _role: "eng-coder", _batchDoc: BATCH_REL } }
  const five = await batchTool(BATCH_REL).execute({ action: "append", segment: "§5", text: "实现落地。" }, coderCtx)
  assert.match(five, /appended/, `§5 应写入：${five}`)
  assert.equal(readSectionStatusWord(readRecord(root), 3), "评审通过", "§5 那一笔不改 §3 状态行")
})

test("CLI 27-3 正常 · 评审用 `edit §3` 写进 pass 结论（状态行未置）⇒ 结算补签、签发；§5 门随后放行", async () => {
  const { root, agent } = fixture("r273")
  const review = batchTool(BATCH_REL, { review: true })
  // ① 评审这一轮：块由工具戳标题落进 §3，正文裁定经 `edit §3` 改成 pass——`edit` 不挂裁定行闸（正路允许），
  //    但它也不经「通过即置位」⇒ 块进了、§3 状态行没进（本行要消掉的那一步）。
  const appended = await review.execute(
    { action: "append", segment: "§3", text: "两份设计档逐节核过，三处已回写。\n\nVERDICT: changes-required" },
    { agent },
  )
  assert.match(appended, /### 轮次 1（评审子代理）/, `回执应点名本轮块：${appended}`)
  const edited = await review.execute(
    { action: "edit", segment: "§3", oldText: "VERDICT: changes-required", newText: "VERDICT: pass" },
    { agent },
  )
  assert.match(edited, /edited §3/, `edit 应写入：${edited}`)
  const afterReview = readRecord(root)
  assert.equal(countRoundBlocks(afterReview, 3), 1, "轮次块 +1")
  assert.equal(readSectionStatusWord(afterReview, 3), null, "前置：§3 状态行仍未置（edit 写块不置位）")

  // ② 结算面：同一档、同一实例键 ⇒ 签字是结算自己的一笔（§3 状态行由它补，不靠评审再签一次）
  const run = {
    designId: DESIGN_ID,
    batchDoc: resolve(root, BATCH_REL),
    docSetKey: docSetKey([DESIGN_REL], root),
    section3BlocksAtStart: 0, // 点火基线 = 评审写块之前读到的块数
    open: true,
  }
  const settled = settleDesignReview(agent, run, TOKEN, `评审正文。\n[DESIGN-TOKEN: ${TOKEN}]\n\nVERDICT: pass`)
  assert.equal(settled.passed, true, `应签发（修前红：edit 写的块不置状态行 ⇒ status-not-passed）— ${settled.output}`)
  assert.match(settled.output, /Approved\. Pass this exact token to eng-coder/, "回执带已批准后缀（token 已签发）")
  assert.equal(readSectionStatusWord(readRecord(root), 3), "评审通过", "§3 段级状态行由结算补签")
  assert.equal(agent._engDesignTokens.get(DESIGN_ID), TOKEN, "槽里是该 designId 的全串 token")

  // ③ 随后 `append §5` 放行：段序门两判据（状态词 ∥ 末块自带 pass 裁定）此刻都成立
  const coderCtx = { depth: 1, agent: { cwd: root, config: { agent: { engineering: true } }, _role: "eng-coder", _batchDoc: BATCH_REL } }
  const five = await batchTool(BATCH_REL).execute({ action: "append", segment: "§5", text: "实现落地。" }, coderCtx)
  assert.match(five, /appended/, `§5 应写入：${five}`)
  assert.equal(readSectionStatusWord(readRecord(root), 3), "评审通过", "§5 那一笔不改 §3 状态行")
})

/** 脚本化假端点：第 1 轮发 `batch` 工具调用（评审写 §3），第 2 轮回收尾文本。请求体留档供断言。 */
function scriptedProvider(closers, calls = []) {
  const requests = []
  const server = createServer((req, res) => {
    let raw = ""
    req.on("data", (chunk) => { raw += chunk })
    req.on("end", () => {
      const turn = requests.length
      requests.push(raw)
      // calls 为空 ⇒ 单轮纯文本（负半幅：不给工具调用，只判工具表里有没有 `batch`）
      const chunks = turn === 0 && calls.length > 0
        ? [
            { choices: [{ delta: { content: "" }, finish_reason: null }] },
            { choices: [{ delta: { tool_calls: calls.map((c, i) => ({ index: i, id: `call_${i}`, type: "function", function: { name: c.name, arguments: JSON.stringify(c.args) } })) }, finish_reason: null }] },
            { choices: [{ delta: {}, finish_reason: "tool_calls" }] },
          ]
        : [
            { choices: [{ delta: { content: "交付件逐个读过：绑定生效、§3 已落。VERDICT: pass" }, finish_reason: null }] },
            { choices: [{ delta: {}, finish_reason: "stop" }] },
          ]
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" })
      for (const c of chunks) res.write(`data: ${JSON.stringify(c)}\n\n`)
      res.write("data: [DONE]\n\n")
      res.end()
    })
  })
  const ready = new Promise((done) => server.listen(0, "127.0.0.1", () => {
    // 不持有事件循环（收尾不靠 close 的回调链：win32 上 `closeAllConnections` + 在途 socket 会撞 libuv 断言）
    server.unref()
    done(server.address().port)
  }))
  return ready.then((port) => {
    closers.push(() => { try { server.close() } catch { /* 尽力面 */ } })
    return { port, requests }
  })
}

test("CLI 27-2 正常 · 工具面批（无设计档）走代码轨 + 携 batchDoc ⇒ 评审员拿到 batch 并把 §3 写进绑定档", { timeout: 120_000 }, async (t) => {
  const { root } = fixture("r272")
  const closers = []
  t.after(async () => { for (const c of closers) { try { await c() } catch { /* 尽力面 */ } } })
  const entry = await scriptedProvider(closers, [{
    name: "batch",
    args: { action: "append", segment: "§3", text: "交付件逐个读过，结论成立。\n\nVERDICT: pass" },
  }])
  const provider = { name: "fake", baseURL: `http://127.0.0.1:${entry.port}`, apiKey: "test-key", model: "gpt-4o" }
  const agent = {
    cwd: root,
    provider: { ...provider },
    config: { agent: { engineering: true }, advisor: { guard: false }, traces: { enabled: false } },
  }

  // 入口 = 父侧 fire 一轮代码评审（携本批批次档）——工具面批的调用形
  const receipt = String(await advisorTool.execute(
    { type: "code", async: false, paths: [DELIVERED_REL], documents: [BATCH_REL], batchDoc: BATCH_REL },
    { agent, _toolCallId: "i272" },
  ))

  const tools = (JSON.parse(entry.requests[0]).tools ?? []).map((x) => x.function?.name).filter(Boolean)
  assert.ok(tools.includes("batch"), `代码轨评审员应拿到 batch 写通道：${tools.join(", ")}`)
  assert.match(receipt, /VERDICT: pass/, `评审跑完并带回模型文本（不是半途拒发）：${receipt}`)
  assert.equal(entry.requests.length, 2, "一轮工具调用 + 一轮收尾 = 两次模型请求")
  // 业务可观察结果：§3 被写进绑定档、段级状态行由工具置位 ⇒ 收口 / 核销两门有可读的「评审过没过」
  assert.equal(readSectionStatusWord(readRecord(root), 3), "评审通过", "§3 状态行 = 评审通过（工具面批交付完核销得了）")
  assert.equal(countRoundBlocks(readRecord(root), 3), 1, "轮次块 +1")
})

test("CLI 27-2 负半幅 · 不携 batchDoc ⇒ 工具表不含 batch、§3 轮次块 = 0（写不进任何档）", { timeout: 120_000 }, async (t) => {
  const { root } = fixture("r272n")
  const closers = []
  t.after(async () => { for (const c of closers) { try { await c() } catch { /* 尽力面 */ } } })
  const entry = await scriptedProvider(closers, [])
  const provider = { name: "fake", baseURL: `http://127.0.0.1:${entry.port}`, apiKey: "test-key", model: "gpt-4o" }
  const agent = {
    cwd: root,
    provider: { ...provider },
    config: { agent: { engineering: true }, advisor: { guard: false }, traces: { enabled: false } },
  }

  // 同一入口、同一交付件，只是不携 batchDoc：代码轨不携档是合法形（不拒发），但不绑定
  const receipt = String(await advisorTool.execute(
    { type: "code", async: false, paths: [DELIVERED_REL], documents: [BATCH_REL] },
    { agent, _toolCallId: "i272n" },
  ))

  const tools = (JSON.parse(entry.requests[0]).tools ?? []).map((x) => x.function?.name).filter(Boolean)
  assert.ok(!tools.includes("batch"), `不携 batchDoc ⇒ 零写通道：${tools.join(", ")}`)
  assert.match(receipt, /VERDICT: pass/, `评审照跑（缺档不拒发）：${receipt}`)
  assert.equal(countRoundBlocks(readRecord(root), 3), 0, "§3 轮次块 = 0")
  assert.equal(readSectionStatusWord(readRecord(root), 3), null, "§3 段级状态行仍缺（无通道即写不进）")
})
