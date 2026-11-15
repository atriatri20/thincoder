/**
 * context-window-derivation.test.mjs — 集成用例 16-2（`test/RTM.md` CLI 端故事 16「状态行百分比与压缩判据同尺」行 16-2）。
 * 机制正文 = `docs/core/design/CONTEXT-COMPACTION.md` §2.2（派生链）∥ §2.5（显示与判定同基准）。
 *
 * 业务入口 = 用户在 TUI 把 `providers[].context` 从 1024 改成 320（K 单位 ⇒ 窗口 327,680），再发一条消息。
 * 业务可观察结果：不出现 `context overflow`；状态行百分比的分母是 262,144（可填量）而不是 327,680（窗口），
 * 越过 212,144 时告警亮起，而请求仍发得出去（硬上限还剩 50,000）。
 *
 * 交互组件（全走真件）：`policyBudget`（派生链）→ CLI 渲染缓存 `ctxCacheOf` → 状态行渲染（`renderStatus`）；
 * 发送面 = 本机假 OpenAI SSE 端点（零外网、零付费、零 `globalThis.fetch` 桩）。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { createAgent, runAgent } from "../../thincoder-core/agent.mjs"
import { policyBudget, resolveWorkMode } from "../../thincoder-core/config.mjs"
import { historyReading, tokenRatioOf } from "../../thincoder-core/token-window.mjs"
import { ctxCacheOf } from "../../thincoder-cli/src/tui/render-loop.mjs"
import { renderStatus } from "../../thincoder-cli/src/tui/status-line.mjs"
import { C } from "../../thincoder-cli/src/tui/ansi.mjs"

/** 状态行最小状态夹具（渲染只读这些位——与 `context-percent-calibrated.test.mjs` 同形，本档自持）。 */
const statusState = (ctxCache) => ({
  input: [],
  scroll: 0,
  processing: false,
  status: "Ready",
  permission: null,
  question: null,
  picker: null,
  wizard: null,
  teamAsk: null,
  secretPrompt: null,
  tasks: [],
  currentTool: null,
  pendingInput: [],
  attentionAwaiting: false,
  tokens: { prompt: 0, completion: 0, cacheHit: 0, cacheMiss: 0, reasoningTokens: 0 },
  ctxCache,
})

/** 一笔 ≈ `tokens` 的 ASCII 载荷（估算式 = 3 ASCII 字符 / token）。 */
const ascii = (tokens) => "x".repeat(tokens * 3)

/** 本机假 OpenAI SSE 端点：压缩请求回摘要，回合请求回正文。 */
async function stubServer() {
  const requests = []
  const SUMMARIZE_SIG = "The conversation above is our work log so far"
  const server = createServer((req, res) => {
    let raw = ""
    req.on("data", (c) => (raw += c))
    req.on("end", () => {
      let body = null
      try { body = JSON.parse(raw) } catch { body = null }
      const compress = String(body?.messages?.at(-1)?.content ?? "").startsWith(SUMMARIZE_SIG)
      requests.push({ compress, status: 200 })
      res.writeHead(200, { "content-type": "text/event-stream" })
      const content = compress ? "SUMMARY: earlier work compressed." : "handled"
      res.write(`data: ${JSON.stringify({ choices: [{ delta: { content }, finish_reason: null }] })}\n\n`)
      res.write(`data: ${JSON.stringify({ choices: [{ delta: {}, finish_reason: "stop" }] })}\n\n`)
      res.end("data: [DONE]\n\n")
    })
  })
  await new Promise((done) => server.listen(0, "127.0.0.1", done))
  return { port: server.address().port, requests, close: () => new Promise((d) => server.close(d)) }
}

test("CLI 16-2 把小窗口设小后，压缩线由硬上限派生、状态行百分比以可填量为分母", { timeout: 120_000 }, async (t) => {
  const cwd = mkdtempSync(join(tmpdir(), "ctx-window-derivation-"))
  t.after(() => removeTempDirBestEffort(cwd))
  const stub = await stubServer()
  t.after(() => stub.close())

  // ① 用户的原配置：1M 窗模型的正常档
  const provider = { model: "deepseek-flash", modelContext: { "deepseek-flash": 1024 }, baseURL: `http://127.0.0.1:${stub.port}`, apiKey: "sk-test" }
  const agent = createAgent({ provider, tools: [], config: { agent: {}, traces: { enabled: false } }, cwd, history: [] })
  const workMode = resolveWorkMode(agent.config?.agent)
  const wide = policyBudget(agent.provider, undefined, workMode)
  assert.equal(wide.window, 1_048_576, "改前窗口 = 1024K")

  // ② 用户在 TUI 把 `providers[].context` 改成 320（K 单位 ⇒ 327,680），下一次装配即生效
  provider.modelContext = { "deepseek-flash": 320 }
  const budget = policyBudget(agent.provider, undefined, workMode)
  assert.equal(budget.window, 327_680, "320K 窗口按 K 单位展开")
  assert.equal(budget.limit, 262_144, "硬上限 = 窗口 − 服务端默认输出预留 65,536")
  assert.equal(budget.threshold, 212_144, "压缩线 = 硬上限 − 注入余量 50,000")
  assert.equal(budget.limit - budget.threshold, 50_000, "两线分离：压缩线在前、红线在后")

  // ③ 用户手上有一段越过压缩线、仍在硬上限之内的历史（230,000 token）：状态行此刻应当告警
  agent.history = [{ role: "user", content: ascii(230_000) }]
  const cache = ctxCacheOf(agent, null)
  const reading = historyReading(agent.history, agent.provider, tokenRatioOf(agent), workMode)
  assert.equal(cache.threshold, 212_144, "状态行拿得到同一条压缩线（同一次读数带出）")
  assert.ok(reading.tokens >= 212_144, `夹具前提：越过压缩线（${reading.tokens} ≥ 212144）`)
  assert.ok(reading.tokens <= 262_144, `夹具前提：仍在硬上限之内（${reading.tokens} ≤ 262144）`)
  // 分母 = 可填量：与「窗口作分母」是两个不同的数，这一条正是本批改的那一格
  assert.equal(reading.pct, Math.round((reading.tokens / 262_144) * 100), "百分比分母是 limit")
  assert.notEqual(reading.pct, Math.round((reading.tokens / 327_680) * 100), "改前用窗口作分母 ⇒ 本条红")
  assert.equal(cache.pct, reading.pct, "缓存读数与核读数同值（端侧零自算式）")

  // 告警判据 = 越过压缩线（不是魔数 80%）：本夹具 88% 亮，70% 不亮——两个读数都在，判据只认 tokens
  const warned = renderStatus(statusState(cache), agent, 120, [])
  assert.ok(warned.includes(`context ${cache.pct}%`), `状态行显示出百分比：${cache.pct}%`)
  assert.ok(warned.includes(`${C.warn}context ${cache.pct}%`), "越过压缩线 ⇒ 该段带告警色")

  // ④ 用户照常发一条消息：不出现 context overflow，请求发得出去
  const answer = await runAgent(agent, "continue", {}, {})
  assert.equal(answer, "handled", "用户拿到答复（不是越窗错误）")
  assert.ok(stub.requests.every((r) => r.status === 200), "零 400")
  assert.ok(stub.requests.some((r) => !r.compress), "回合请求确实发出")
  assert.ok(stub.requests.some((r) => r.compress), "越过压缩线 ⇒ 安全点先压一次再发")
  const sent = cacheFetchGuard(agent, workMode)
  assert.ok(sent <= budget.limit, `压后的请求落在硬上限内（${sent} ≤ ${budget.limit}）`)
})

/** 压后那一段历史按核口径的规模（实测优先；`contextUsage` 的单源读数即发送面的量）。 */
function cacheFetchGuard(agent, workMode) {
  return historyReading(agent.history, agent.provider, tokenRatioOf(agent), workMode).tokens
}
