/*
 * batch-status-auto-set.test.mjs — 集成用例 27-2 ∥ 27-4（RTM CLI 端故事 27「状态行由工具置位，不另调 `status`」；
 * 回指 = 需求 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-BATCH-SEGMENT.md` ② 功能点 5 ∥ 功能点 9 ∥ `AC-M3-11`；
 * 机制 + 判据单源 = `docs/core/design/BATCH-RECORD.md` §4.3 ∥ §4.4 ∥ §4.12，`docs/core/design/ADVISOR-GUARDS.md` §1.2）。
 *
 * 27-2 = 工具面批（无设计档）：走**代码轨**并携 `batchDoc`，评审员从真 `advisor` 工具里拿到 `batch` 写通道并把
 * `§3` 写进绑定档——那一条路没有设计结算可代写，故写通道与「随裁定行置位」都保留。
 * 27-2 异常格 = **工程模式设计轨**：同一夹具，工具表不含 `batch`（挂载面拒），且绕过挂载直写 `§3` 也被段白名单拒
 * （fail-closed）。
 * 27-4 = 状态行被动写：`append` 一笔非空正文到 `§2`/`§5`，同笔把该段状态行置成完成词，全程不调 `status`；
 * 异常格 = 正文只有占位行 ⇒ 状态行不动。
 *
 * 夹具 = 骨架原形批档（`batchSkeleton` 产出）+ 系统临时域的项目根（带项目声明，文档机检门照跑）；
 * 27-2 的模型侧 = `node:http` 本机假 OpenAI SSE 端点（脚本两轮：先发 `batch` 工具调用、再回收尾文本；
 * 先例 = `test/integration/advisor-guard-reminder-cap.test.mjs`）。
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-status-auto-set.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { batchSkeleton, countRoundBlocks, readSectionStatusWord } from "../../thincoder-core/agent-tools/batch-skeleton.mjs"
import { _advisorToolsFor } from "../../thincoder-core/advisor/loop.mjs"
import { advisorTool } from "../../thincoder-core/agent-tools/advisor.mjs"

const BATCH_REL = "docs/batches/fixture.md"
const DELIVERED_REL = "scripts/delivered.mjs"

const projects = []
after(() => {
  for (const p of projects) removeTempDirBestEffort(p)
})

/** 工程模式夹具：项目根（项目声明 + 骨架原形批档）+ 主 agent。 */
function fixture(tag, { engineering = true } = {}) {
  const root = mkdtempSync(join(tmpdir(), `bsas-${tag}-`))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" } }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "scripts"), { recursive: true })
  // 骨架模板的 §2 占位行点了一份真档（示例行）⇒ 夹具里让它真在盘：档名解得到，哪一面都不因它出一条悬空命中。
  mkdirSync(join(root, "thincoder-core/agent-tools"), { recursive: true })
  writeFileSync(join(root, "thincoder-core/agent-tools/batch-tier-gate.mjs"), "// 夹具：骨架模板示例行点名的档\n")
  // 骨架原形：`ledger` / `board` 给值 ⇒ 档头两处死占位当场填掉（否则首个 append 被占位机检拒）
  writeFileSync(join(root, BATCH_REL), batchSkeleton({
    date: "2026-11-01", topic: "fixture", source: "集成夹具", prev: "无（独立批）", baseSha: "未取到（夹具直调骨架）", ledger: "#1999", board: "core",
  }))
  writeFileSync(join(root, DELIVERED_REL), "export const delivered = 1\n")
  const agent = { cwd: root, _slot: 1, config: { agent: { engineering } } }
  return { root, agent }
}

const readRecord = (root) => readFileSync(join(root, BATCH_REL), "utf8")
/** `§N` 段头区状态行（本档只关心段级那一行）。 */
const statusZoneLines = (src) => src.split(/\r?\n/).filter((l) => /^\s*\*\*状态行\*\*[：:]/.test(l))

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

test("CLI 27-2 异常格 · 同一夹具走工程模式设计轨 ⇒ 工具表不含 batch、§3 写不进（fail-closed）", async () => {
  const { root, agent } = fixture("r272d")
  // 挂载面（`advisorToolsFor`）：同一对输入（模式 × 评审轨）判出设计轨 ⇒ 不追加 batch 工具
  const tools = _advisorToolsFor(agent, "design", BATCH_REL).byName
  assert.ok(!tools.has("batch"), `工程设计轨的评审实例零 §3 写通道：${[...tools.keys()].join(", ")}`)
  // 段白名单面（工具在、段不拒的缺口由它补）：绕过挂载直写 §3 一样被拒
  const review = batchTool(BATCH_REL, { review: true, reviewType: "design" })
  await assert.rejects(
    () => review.execute({ action: "append", segment: "§3", text: "越界一块。\n\nVERDICT: pass" }, { agent }),
    /§3 is closed to this caller/,
    "设计轨的 §3 写不进（块只由结算写）",
  )
  assert.equal(countRoundBlocks(readRecord(root), 3), 0, "§3 零块")
  assert.equal(readSectionStatusWord(readRecord(root), 3), null, "§3 段级状态行仍缺（无通道即写不进）")
})

test("CLI 27-4 正常 ∥ 边界 · 状态行被动写：`§2`/`§5` 写正文那一笔即置完成词；正文只有占位行 ⇒ 不动", async () => {
  const { root, agent } = fixture("r274")
  const designer = { depth: 1, agent: { ...agent, _role: "eng-designer", _batchDoc: BATCH_REL } }
  const coder = { depth: 1, agent: { ...agent, _role: "eng-coder", _batchDoc: BATCH_REL } }

  // 边界格（先做：§2 仍是骨架占位句）：一笔只含占位行的正文 ⇒ 状态行不动
  await batchTool(BATCH_REL).execute({ action: "append", segment: "§2", text: "<§2 模板占位：补充说明>" }, designer)
  assert.equal(readSectionStatusWord(readRecord(root), 2), null, "正文只有占位行 ⇒ §2 状态行不动")

  // 正常格 ①：`§2` 写一笔非空正文 ⇒ 同笔置「设计完成」（全程不调 status）
  const two = await batchTool(BATCH_REL).execute({ action: "append", segment: "§2", text: "本批设计第二段。" }, designer)
  assert.match(two, /状态行 = 设计完成/, `回执点名同笔置位：${two}`)
  assert.equal(readSectionStatusWord(readRecord(root), 2), "设计完成", "§2 段级状态行 = 设计完成")

  // 正常格 ②：`§5` 写一笔非空正文 ⇒ 同笔置「实施完成」；`§5` 写入门的两条判据由代码轨评审那一笔满足
  const review = batchTool(BATCH_REL, { review: true, reviewType: "code" })
  await review.execute({ action: "append", segment: "§3", text: "工具面交付件核过。\n\nVERDICT: pass" }, { agent })
  const five = await batchTool(BATCH_REL).execute({ action: "append", segment: "§5", text: "实现落地。" }, coder)
  assert.match(five, /状态行 = 实施完成/, `回执点名同笔置位：${five}`)
  assert.equal(readSectionStatusWord(readRecord(root), 5), "实施完成", "§5 段级状态行 = 实施完成")

  // 四行状态行各自在位：§1「进行中」不动、§2「设计完成」∥ §3「评审通过」∥ §5「实施完成」——同一词表、同一段头区
  const lines = statusZoneLines(readRecord(root))
  assert.deepEqual(lines, ["**状态行**：进行中", "**状态行**：设计完成", "**状态行**：评审通过", "**状态行**：实施完成"], `每段恰一条、值取各自词表：${lines.join(" ∥ ")}`)
})
