/**
 * sse-first-chunk-window.test.mjs — 集成用例 19-1 ∥ 19-2（`test/RTM.md` CLI 端故事 19
 * 「首 token 慢的长上下文请求不再被当断流」；判据 = `docs/core/design/TIMEOUT-DIGEST.md` §2.4（A11 ∥ A13））。
 *
 * 业务可观察结果（用户看到什么）：
 *  - 19-1：上游 3s 才吐首帧，而用户把 `agent.bodyIdleTimeoutMs` 设成了 800 ⇒ 用户照常拿到正文答复。
 *    修前：空闲看门狗从「等首帧」就开始按 800ms 计时 ⇒ 慢 prefill 被当断流。
 *  - 19-2：同一个桩吐过首帧后停摆 ⇒ 仍在 0.8s 处按**空闲窗**报错，相位串 = `sse-idle`
 *    （不是 `sse-first-chunk`、不是 600s 首 chunk 窗）。两态分开计时，不是把看门狗整体放宽。
 *
 * 交互组件（全走真件）= provider 读侧看门狗（`thincoder-core/provider/sse.mjs` 的 `readSSE` 两态臂）
 * ⟷ 两个取值点 `effectiveFetchTimeoutMs`（首 chunk 窗）∥ `effectiveBodyIdleMs`（空闲窗）；
 * 进入口 = 真配置装载（`loadConfig` 把 `agent.bodyIdleTimeoutMs` 提升为 `provider.bodyIdleTimeoutMs`）
 * → 真会话链路（`createAgent` + `runAgent`）→ 本机假上游。零外网、零付费端点、零 `globalThis.fetch` 桩。
 *
 * 既有件三问（新增档名 `sse-first-chunk-window.test.mjs`）：`none found:` 查过三面——
 * ① `test/integration/*.test.mjs` 新增本档前的 37 档（落盘后 38 档），逐档档名无故事 19 的落点；
 * ② `test/RTM.md` 故事 19 两行证据格当刻均为 `未落（用例待补）`；
 * ③ 全仓 `.test.mjs` 档 grep `first-chunk` ∥ `firstChunkMs` 零命中（实现面只住 `provider/sse.mjs` ∥ `provider/google.mjs`）。
 * 新档落 `test/integration/`；消费方 = `test/RTM.md` 故事 19 两行证据格 + `node --test` 的改面跑。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/sse-first-chunk-window.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { createAgent, runAgent } from "../../thincoder-core/agent.mjs"
import { _resetConfigPathForTest, _setConfigPathForTest, loadConfig } from "../../thincoder-core/config.mjs"
import { effectiveBodyIdleMs, effectiveFetchTimeoutMs } from "../../thincoder-core/provider/core.mjs"
import { _resetLogsDirForTest, _setLogsDirForTest } from "../../thincoder-core/log.mjs"

// ---------- 夹具 ----------

/** RTM 故事 19 的取值：`agent.bodyIdleTimeoutMs` 设 800（两行的共同前提）。 */
const BODY_IDLE_MS = 800
/** RTM 19-1：首帧延迟 3s（慢 prefill 的现场形），远大于空闲窗、远小于首 chunk 窗。 */
const FIRST_FRAME_DELAY_MS = 3_000
/** 上游模型名（本档不判窗口 ∥ 预算，只要一个可解析的模型身份）。 */
const MODEL = "deepseek-v4.1-flash"
/** 上游回的那段正文（19-1 的业务判据取值来源）。 */
const REPLY = "慢 prefill 之后的第一段正文。"

const cwd = mkdtempSync(join(tmpdir(), "sse-first-chunk-int-"))
const logsDir = mkdtempSync(join(tmpdir(), "sse-first-chunk-int-logs-"))
const cfgDir = mkdtempSync(join(tmpdir(), "sse-first-chunk-int-cfg-"))
const cfgPath = join(cfgDir, "config.json")
_setLogsDirForTest(logsDir)
_setConfigPathForTest(cfgPath)
after(() => {
  _resetLogsDirForTest()
  _resetConfigPathForTest()
  for (const dir of [cwd, logsDir, cfgDir]) removeTempDirBestEffort(dir)
})

/** 一句话拆成 SSE 帧（正文帧 + 收束帧）——与真上游同形。 */
const sseChunks = (text) => [
  { choices: [{ delta: { content: text }, finish_reason: null }] },
  { choices: [{ delta: {}, finish_reason: "stop" }] },
]

/**
 * 假上游两态（响应头都立刻回——本档量的是 body 阶段，不是响应头阶段）：
 *  - `"slow-then-ok"`：等 `delayMs` 才吐首帧，此后正常吐正文与收束帧；
 *  - `"stall-after-first"`：先吐一帧「只有 role、无正文」（真上游常见形），此后一个字节都不再吐、也不 end——
 *    复刻「首帧之后停摆」，且**不带正文**（带正文的停摆走 partial 支，是另一条路径，见 `readSSE` 的 network-partial）。
 */
function providerStub(mode, delayMs = 0) {
  const requests = []
  const server = createServer((req, res) => {
    let raw = ""
    req.on("data", (chunk) => { raw += chunk })
    req.on("end", () => {
      requests.push(raw)
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" })
      res.flushHeaders() // 头立刻到 —— fetch 当场 resolve，body 阶段的窗才有意义
      if (mode === "stall-after-first") {
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { role: "assistant" }, finish_reason: null }] })}\n\n`)
        return // 此后静默：不写、不 end
      }
      setTimeout(() => {
        for (const chunk of sseChunks(REPLY)) res.write(`data: ${JSON.stringify(chunk)}\n\n`)
        res.write("data: [DONE]\n\n")
        res.end()
      }, delayMs)
    })
  })
  return new Promise((done) => {
    server.listen(0, "127.0.0.1", () => done({
      port: server.address().port,
      requests,
      close: () => new Promise((finish) => { server.closeAllConnections?.(); server.close(() => finish()) }),
    }))
  })
}

/**
 * 一次 CLI 会话夹具：把用户真会写的那一行（`agent.bodyIdleTimeoutMs`）写进临时 `config.json`，
 * 经**真配置装载**得到运行面 provider（两个取值点都在这一步落到 provider 上），再建真会话。
 * 不走手搓 provider 字面量——那样「配置键 → 取值点」这段接线没被走过，断在哪一层看不出来。
 */
async function session(t, { mode, delayMs = 0 }) {
  const stub = await providerStub(mode, delayMs)
  t.after(() => stub.close())
  writeFileSync(cfgPath, JSON.stringify({
    defaultModel: `stub:${MODEL}`,
    providers: [{ name: "stub", baseURL: `http://127.0.0.1:${stub.port}`, apiKey: "sk-test" }],
    agent: { bodyIdleTimeoutMs: BODY_IDLE_MS, maxTurns: 2 },
    traces: { enabled: false },
  }, null, 2))
  const config = loadConfig()
  const agent = createAgent({ provider: config.provider, tools: [], config, cwd, history: [] })
  return { stub, config, agent }
}

// ---------- 行 19-1 ----------

test("19-1 慢 prefill 不被当断流：空闲窗 800ms 也拿得到答复", { timeout: 60_000 }, async (t) => {
  const s = await session(t, { mode: "slow-then-ok", delayMs: FIRST_FRAME_DELAY_MS })

  // 取值点读数（前提，不是判据）：用户写的是 agent.bodyIdleTimeoutMs，到读侧那一跳真的落了地；
  // 首 chunk 窗走现网缺省（远大于 3s 延迟）——本行量的正是「等首帧用大窗、等后续用用户的小窗」。
  assert.equal(effectiveBodyIdleMs(s.config.provider), BODY_IDLE_MS, "配置键 agent.bodyIdleTimeoutMs 应落到空闲窗取值点")
  const firstChunkWindow = effectiveFetchTimeoutMs(s.config.provider)
  assert.ok(firstChunkWindow > FIRST_FRAME_DELAY_MS * 10, `夹具前提：首 chunk 窗 ${firstChunkWindow}ms 应远大于首帧延迟 ${FIRST_FRAME_DELAY_MS}ms`)

  const answer = await runAgent(s.agent, "在吗", {})

  assert.equal(answer, REPLY, `用户拿到正文答复（首帧 3s 迟到，不得被判成断流），实读：${answer}`)
  assert.equal(s.stub.requests.length, 1, "一个回合一次模型请求（没有因「超时」重发）")
  const transcript = s.agent.history.map((m) => (typeof m.content === "string" ? m.content : "")).join("\n")
  assert.doesNotMatch(transcript, /SSE .*timeout/, "会话流零 `SSE … timeout` 报错")
})

// ---------- 行 19-2 ----------

test("19-2 首帧之后停摆仍按空闲窗报错：0.8s、相位 sse-idle", { timeout: 60_000 }, async (t) => {
  const s = await session(t, { mode: "stall-after-first" })

  const started = Date.now()
  const error = await runAgent(s.agent, "在吗", {}).then(() => null, (e) => e)
  const elapsedMs = Date.now() - started
  // 用时只作旁证，不作断言（先例 = `test/RTM.md` 故事 22 的 22-2「用时只作旁证，不作断言」）：
  // 判据是文案与相位串——换台机器、换个负载，那两样都不变，墙钟会变。
  t.diagnostic(`用时旁证：从发消息到报错 ${elapsedMs}ms（判据只看文案与相位串，不看墙钟）`)

  assert.ok(error, "首帧之后停摆必须当场报错——不静默挂着、不静默返回空回复")
  assert.match(error.message, /no data for 0\.8s/, `错误文案点到实际生效的空闲窗（800ms ⇒ 0.8s），实读：${error.message}`)
  assert.equal(error.abortInfo?.detail, "sse-idle", `相位串 = 空闲臂（不是首 chunk 臂），实读：${JSON.stringify(error.abortInfo)}`)
  assert.doesNotMatch(error.message, /first-chunk/, `不得落到首 chunk 臂（首帧已到），实读：${error.message}`)
  assert.doesNotMatch(error.message, /600s/, `不得报首 chunk 窗的 600s，实读：${error.message}`)
})