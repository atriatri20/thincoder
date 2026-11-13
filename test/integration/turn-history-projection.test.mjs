/**
 * turn-history-projection.test.mjs — 集成场景 CLI 1-5 ∥ 1-6（`test/rtm/tooling.md`「CLI 1」；机制正文 =
 * `docs/core/design/CONTEXT-COMPACTION.md` §1.1 ∥ §6 与 `docs/core/design/SESSION.md` §2）。
 *
 * 业务入口 = 真 CLI 子进程 `node bin/thincoder.mjs acp`：本仓 CLI 里唯一同时具备「会话流」「多轮」
 * 「进程重开 + 历史从盘上回放」三项的用户入口；本档扮演 ACP 客户端（NDJSON JSON-RPC，夹具
 * `test/integration/fixtures/acp-cli.mjs`）。
 *
 * 1-5 业务可观察结果：重开后的请求仍带上一程已登记轮的用户请求、最终回复与任务状态，以及**未登记那一段**
 * （在途 ∥ 异常段）的原文；已登记轮的工具过程不再携带；恢复后经 `read_history` 仍可取回原始工具结果。
 * 1-6 业务可观察结果：压缩后重开，机读线以摘要注记开头、其后只装切割点之后的轮记录、不含被摘要轮的原文；
 * 压缩不重做（重开那一程零摘要请求）；被摘要轮仍可从 `read_history` 取回。
 *
 * 模型侧 = 本地脚本化假 Anthropic 端点（零外网、零付费端点，夹具
 * `test/integration/fixtures/anthropic-endpoint.mjs`）：它在回复里回显本进程实际收到的
 * tool_result 文本，因此「`read_history` 取回了什么」落在回复文本上，断言不必窥探内部形态。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/turn-history-projection.test.mjs`
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { fakeAnthropic } from "./fixtures/anthropic-endpoint.mjs"
import { openSession, say, startCli } from "./fixtures/acp-cli.mjs"

const SCENE_TIMEOUT_MS = 240_000
const MODEL = "claude-sonnet-5"
const NOTE_BODY = "PINEAPPLE-42"
const NOTE2_BODY = "MANGO-77"
const FIRST_QUESTION = "Read note.txt and tell me what it says."
const SECOND_QUESTION = "What does note2.txt say? (this turn will be cut off by the upstream)"
const THIRD_QUESTION = "Summarize what we know so far."
const REOPEN_QUESTION = "What did you need the file for earlier?"

/** 假家目录 config（同一 home 可在两程之间改指向另一个假端点——两程必须连同一个会话槽）。
 *  `MODEL` 取大窗格模型：本仓当前固定开销（system + 工具 schema）已超过 128K 窗格模型的请求上限，
 *  而本档要验的是**历史投影**与**压缩检查点恢复**，不是窗格——夹具选大窗模型，场景才真的跑得到业务行为。 */
function writeConfig(home, port) {
  mkdirSync(join(home, ".thincoder"), { recursive: true })
  writeFileSync(join(home, ".thincoder", "config.json"), JSON.stringify({
    defaultModel: `fake-anthropic:${MODEL}`,
    providers: [{ name: "fake-anthropic", baseURL: `http://127.0.0.1:${port}/v1`, format: "anthropic", apiKey: "test-key" }],
  }, null, 2))
}

/** 请求体里的工具块原文（Anthropic 形：assistant 的 `tool_use` ∥ user 的 `tool_result`）。 */
const wireText = (body) => JSON.stringify(body?.messages ?? [])

/** 一条消息的全部文本块（跳过 `[System reminder:` 一类机器注入）。 */
const textBlocks = (messages) => (messages ?? []).flatMap((m) => {
  const parts = Array.isArray(m?.content) ? m.content : [{ type: "text", text: m?.content }]
  return parts.filter((b) => b?.type === "text").map((b) => String(b.text ?? ""))
})

/** 一程的公共夹具：临时家目录 + 临时工作目录 + 进程与端点清单（`t.after` 统一收尾）。 */
function scene(t) {
  const home = mkdtempSync(join(tmpdir(), "tc-int-proj-home-"))
  const cwd = mkdtempSync(join(tmpdir(), "tc-int-proj-cwd-"))
  writeFileSync(join(cwd, "note.txt"), `${NOTE_BODY}\n`)
  writeFileSync(join(cwd, "note2.txt"), `${NOTE2_BODY}\n`)
  const children = []
  const endpoints = []
  t.after(async () => {
    for (const cli of children) await cli.stop()
    for (const ep of endpoints) await ep.close()
    removeTempDirBestEffort(home)
    removeTempDirBestEffort(cwd)
  })
  const launch = () => {
    const cli = startCli({ home, cwd })
    children.push(cli)
    return cli
  }
  const endpointFor = async (opts) => {
    const ep = await fakeAnthropic(opts)
    endpoints.push(ep)
    writeConfig(home, ep.port)
    return ep
  }
  return { home, cwd, launch, endpointFor }
}

/** 摘要请求数（`summary: true` 那一族——压缩链路的唯一载荷）。 */
const summaryCalls = (ep) => ep.requests.filter((r) => r.summary).length

test("CLI 1-5 正常：跨轮机读投影——已登记轮的工具过程不再带，未登记那一段的原文重开后仍在；恢复后 read_history 仍可回查", { timeout: SCENE_TIMEOUT_MS }, async (t) => {
  const { cwd, launch, endpointFor } = scene(t)

  // ── 第一程：① 一轮工具调用后收尾（回合尾落盘：history ∥ contextHistory ∥ turns）；
  //             ② 第二轮工具结果已入线，随后那次模型请求被上游拒 ⇒ 该轮**不登记**，那一段留在途/异常面 ──
  const first = await endpointFor({
    callsAt: {
      1: [{ id: "toolu_1_5", name: "read", input: { path: "note.txt" } }],
      3: [{ id: "toolu_inflight", name: "read", input: { path: "note2.txt" } }],
    },
    failAt: 4,
  })
  const cli1 = launch()
  const sessionId = await openSession(cli1, cwd)
  const firstReply = await say(cli1, sessionId, FIRST_QUESTION)
  assert.match(firstReply, new RegExp(NOTE_BODY), `第一程回复应引用工具结果，实际：${firstReply}`)
  const firstRequests = first.requests.filter((r) => !r.summary)
  assert.ok(firstRequests.length >= 2, "第一程有工具回合与收束回合")
  assert.match(JSON.stringify(firstRequests.at(-1).body.messages), new RegExp(NOTE_BODY), "本轮机读线在轮内保留完整工具结果（1-1 的语义不变）")

  const cut = await cli1.request("session/prompt", { sessionId, prompt: [{ type: "text", text: SECOND_QUESTION }] })
  assert.ok(cut.error, `被上游拒的那一轮应以错误收尾（不登记轮记录），实读：${JSON.stringify(cut.result ?? cut.error)}`)
  await cli1.stop()

  // ── 第二程：重开同一会话（历史从盘上回放），再问一句，并要求模型用 read_history 回查原始结果 ──
  const second = await endpointFor({ calls: [{ id: "toolu_hist", name: "read_history", input: { tool: "read", limit: 5 } }] })
  const cli2 = launch()
  const init = await cli2.request("initialize", { protocolVersion: 1, clientCapabilities: {} })
  assert.equal(init.error, undefined, `第二程 initialize 被拒：${JSON.stringify(init.error)}`)
  const loaded = await cli2.request("session/load", { sessionId })
  assert.equal(loaded.error, undefined, `装载同一会话失败：${JSON.stringify(loaded.error)}｜stderr: ${cli2.stderr.slice(-2000)}`)
  const reply = await say(cli2, sessionId, REOPEN_QUESTION)

  const opened = second.requests.map((r) => r.body)
  assert.ok(opened.length >= 1, "第二程确实发了请求")
  const openedWire = wireText(opened[0])
  const openedText = textBlocks(opened[0].messages).join("\n")

  // ① 已登记轮的工具过程不再携带（按那一轮的调用 id 判：工具结果正文会在回复里被引用，不能当探针）
  assert.equal(openedWire.includes("toolu_1_5"), false, `已登记轮的工具调用不得再装：${openedWire.slice(0, 1200)}`)
  assert.equal(openedWire.includes('"input":{"path":"note.txt"}'), false, `已登记轮的工具调用参数不得再装：${openedWire.slice(0, 1200)}`)
  // ② 但仍带着已登记轮的用户请求、最终回复与任务状态
  assert.ok(openedText.includes(FIRST_QUESTION), `重开后的请求应带上一轮用户请求，实际：${openedText.slice(0, 1500)}`)
  assert.ok(openedText.includes("Answer to"), `重开后的请求应带上一轮的最终回复，实际：${openedText.slice(0, 1500)}`)
  assert.ok(openedText.includes("[Task state]"), `重开后的请求应带任务状态，实际：${openedText.slice(0, 1500)}`)
  // ③ 未登记那一段（在途 ∥ 异常段）的原文也在——改造前整段消失（`turns` 非空即短路）
  assert.ok(openedText.includes(SECOND_QUESTION), `未登记那一段的用户请求原文应仍在，实际：${openedText.slice(0, 2000)}`)
  assert.ok(openedWire.includes(NOTE2_BODY), `未登记那一段的工具结果原文应仍在，实际：${openedWire.slice(0, 2000)}`)
  // ④ 恢复后 read_history 仍取回原始工具结果（它的工具结果被回显进最终回复）
  assert.match(reply, new RegExp(NOTE_BODY), `恢复后 read_history 应仍能取回原始工具结果，实际回复：${reply}`)
  assert.equal(second.rejections.length, 0, `上游无 role 类 400：${second.rejections.join("｜")}`)
  assert.equal(first.rejections.length, 0, `第一程上游无 role 类 400：${first.rejections.join("｜")}`)
})

test("CLI 1-6 正常：压缩检查点恢复——重开后的请求以摘要注记开头，只装切割点之后的轮记录，压缩不重做", { timeout: SCENE_TIMEOUT_MS }, async (t) => {
  const { cwd, launch, endpointFor } = scene(t)

  // ── 第一程：两轮正常对话（第 1 轮带工具），第 3 轮请求模型主动压缩（`context` 工具）──
  // 自动阈值触发在**本套件不可达**：压缩线（1M 窗格的 600K）在本套件固定开销（system + tools）与两轮
  // 对话的历史之上，短对话长不到那条线（与夹具档头同一说法）。可走的真支 = 模型主动压缩（force），
  // 它走的是同一条 `applyCompression` ⇒ 同一条检查点落槽 / 恢复路（批档 §5 记这一处差别）。
  const first = await endpointFor({
    callsAt: {
      1: [{ id: "toolu_1_6", name: "read", input: { path: "note.txt" } }],
      4: [{ id: "toolu_compact", name: "context", input: { action: "compact", focus: "keep the note facts for the work coming next" } }],
    },
  })
  const cli1 = launch()
  const sessionId = await openSession(cli1, cwd)
  const firstReply = await say(cli1, sessionId, FIRST_QUESTION)
  assert.match(firstReply, new RegExp(NOTE_BODY), `第 1 轮回复应引用工具结果，实际：${firstReply}`)
  await say(cli1, sessionId, THIRD_QUESTION)
  await say(cli1, sessionId, "Now compact what we have before we go on.")
  assert.equal(summaryCalls(first), 1, `第一程应恰好压过一次（真摘要），实读 ${summaryCalls(first)}`)
  // 压缩后那一次对话请求的 system ∥ tools 前缀（RTM 1-6「前缀同形」的对照面）
  const postCompact = first.requests.filter((r) => !r.summary).at(-1).body
  await cli1.stop()

  // ── 第二程：重开同一会话再问一句——压缩不重做，机读线以摘要注记开头 ──
  const second = await endpointFor({ calls: [{ id: "toolu_hist2", name: "read_history", input: { tool: "read", limit: 5 } }] })
  const cli2 = launch()
  const init = await cli2.request("initialize", { protocolVersion: 1, clientCapabilities: {} })
  assert.equal(init.error, undefined, `第二程 initialize 被拒：${JSON.stringify(init.error)}`)
  const loaded = await cli2.request("session/load", { sessionId })
  assert.equal(loaded.error, undefined, `装载同一会话失败：${JSON.stringify(loaded.error)}｜stderr: ${cli2.stderr.slice(-2000)}`)
  const reply = await say(cli2, sessionId, REOPEN_QUESTION)

  const opened = second.requests.map((r) => r.body)
  assert.ok(opened.length >= 1, "第二程确实发了请求")
  const openedText = textBlocks(opened[0].messages).join("\n")
  const openedWire = wireText(opened[0])

  // ① 机读线以摘要注记开头（注记 = 压缩前缀 + 摘要正文，摘要正文由夹具回既定串）
  assert.match(openedText, /SUMMARY: earlier work compressed\./, `重开后首请求应带摘要注记，实际：${openedText.slice(0, 1500)}`)
  assert.equal(textBlocks(opened[0].messages)[0]?.includes("SUMMARY: earlier work compressed."), true, "注记是机读线首条")
  // ② 不含被摘要轮的原文（第 1 轮的用户请求与它的工具结果都不该再被投影回来）
  assert.equal(openedText.includes(FIRST_QUESTION), false, `被摘要轮的用户请求不得再装：${openedText.slice(0, 2000)}`)
  assert.equal(openedWire.includes(NOTE_BODY), false, `被摘要轮的工具结果不得再装：${openedWire.slice(0, 1500)}`)
  // ③ 压缩不重做（重开那一程零摘要请求，且 system ∥ tools 前缀与压缩后那一次同形）
  assert.equal(summaryCalls(second), 0, `重开那一程不得再发摘要请求，实读 ${summaryCalls(second)}`)
  assert.deepEqual(opened[0].tools, postCompact.tools, "重开后首请求的 tools 声明与压缩后那一次同形（没重做前缀）")
  assert.deepEqual(opened[0].system, postCompact.system, "重开后首请求的 system 与压缩后那一次同形")
  // ④ 被摘要轮仍可从 read_history 取回
  assert.match(reply, new RegExp(NOTE_BODY), `被摘要轮的原始工具结果应仍可取回，实际回复：${reply}`)
  assert.equal(second.rejections.length, 0, `上游无 role 类 400：${second.rejections.join("｜")}`)
})
