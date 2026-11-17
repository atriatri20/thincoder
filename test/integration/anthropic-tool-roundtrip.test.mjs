/**
 * anthropic-tool-roundtrip.test.mjs — 集成场景 G1–G3（设计：`docs/core/design/PROVIDER.md` §6.28）：
 * 配了 Anthropic 原生通道的会话，用过工具之后还能继续对话。
 * 生产现象（GitHub #20 ∥ Gitee IKKJEE）：带工具的多轮对话，第二轮必被上游
 * `400 Unexpected role "tool"`（网关包装为 502）——毒在历史里，重开会话也不解决。
 *
 * 业务入口 = 真 CLI 子进程 `node bin/thincoder.mjs acp`：本仓 CLI 里唯一同时具备
 * 「会话流」「多轮」「进程重开 + 历史从盘上回放」三项的用户入口（`chat` 一次性且不落会话，
 * TUI 需要真 TTY）；本档扮演 ACP 客户端（NDJSON JSON-RPC）。
 *
 * 模型侧 = 本地脚本化假 Anthropic 端点（零外网、零付费端点）：按 Messages API 回**三态**——
 * 端点本体住 `test/integration/fixtures/anthropic-endpoint.mjs`（可 import——识别规则要能单独核对，链 = `#1833`），本档只做 import：
 * 「tool_use 回合」·「文本回合」·「摘要回合」（压缩链路，按请求内容认，不按请求序号）；文本由本进程实际收到的 tool_result 拼成，
 * 因此「模型看见过工具结果」「历史是否回放」都落在回复文本里——断言不必窥探内部形态。
 *
 * 可证伪点（G1–G3 同一判据）：`messages[].role` 只收 user / assistant——出现其它 role
 * （含 `role:"tool"`，即 OpenAI 形历史漏进请求体）按上游语义回 400
 * `Unexpected role "<role>"`。转换层没把历史改成 tool_use / tool_result，本档即红。
 *
 * 断言只落在业务可观察结果：会话流出现工具调用与结果、模型给出引用结果的回复、
 * 全程无 400 ∥ 502。块结构等内部形态由单元层（§6.27 T-1–T-16）断言，两层不重复。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { estimateText } from "../../thincoder-core/provider/rate.mjs"
import { requestBudget } from "../../thincoder-core/config.mjs"
import { fakeAnthropic } from "./fixtures/anthropic-endpoint.mjs"
import { openSession, say, startCli } from "./fixtures/acp-cli.mjs"

const SCENE_TIMEOUT_MS = 240_000

// ---------- 场景骨架 ----------

/** 一次集成场景的隔离现场：假家目录（config + sessions）、临时项目目录、假 Anthropic 端点。 */
async function scene(t, { files = {}, calls = [] } = {}) {
  const home = mkdtempSync(join(tmpdir(), "tc-int-anthropic-home-"))
  const cwd = mkdtempSync(join(tmpdir(), "tc-int-anthropic-proj-"))
  const endpoint = await fakeAnthropic({ calls })
  const children = []
  t.after(async () => {
    for (const cli of children) await cli.stop()
    await endpoint.close()
    removeTempDirBestEffort(home)
    removeTempDirBestEffort(cwd)
  })
  for (const [rel, content] of Object.entries(files)) {
    mkdirSync(dirname(join(cwd, rel)), { recursive: true })
    writeFileSync(join(cwd, rel), content)
  }
  mkdirSync(join(home, ".thincoder"), { recursive: true })
  // `maxTokens: 4096` 是**本档夹具的前提**，不是被测行为：这题要的正是「128K 窗格下固定开销越过压缩线」
  // 那一格（见下方 `assertFixedOverheadOverLine`），而 #2398 的发送前守卫要求 prompt + max_tokens ≤ 窗格——
  // 默认 reserve（32K）会把 limit 压到 96000、落在本仓固定开销（≈110K）之下，于是守卫先抛错、场景跑不到。
  // 显式调小 max_tokens 让 limit 回到窗口近旁，压缩线（76800）仍低于固定开销 ⇒ 原判据与可达性门一格不动。
  writeFileSync(join(home, ".thincoder", "config.json"), JSON.stringify({
    defaultModel: "fake-anthropic:claude-fake-1",
    providers: [{ name: "fake-anthropic", baseURL: `http://127.0.0.1:${endpoint.port}/v1`, format: "anthropic", apiKey: "test-key", maxTokens: 4096 }],
  }, null, 2))
  const launch = () => {
    const cli = startCli({ home, cwd })
    children.push(cli)
    return cli
  }
  return { cwd, endpoint, launch }
}


// ---------- G1 正常 / G2 边界 / G3 边界 ----------

/**
 * 夹具前提（不是被测行为）：本档这一配置的**固定开销估算越过自动压缩线**——§6.17 的可达性门要挡的正是这一格。
 * 不锁这条，下面那句「零摘要请求」在系统提示 / 工具 schema 缩水到线下后会由 `tokens <= threshold` 早退保持绿，
 * 等于什么都没测到（假绿）。估算法与 `contextUsage` 同式：`system` ∥ `tools` 各按 `estimateText` 估。
 */
function assertFixedOverheadOverLine(endpoint) {
  const turn = endpoint.requests.find((r) => !r.summary)
  assert.ok(turn, "至少一发对话请求（本档的会话确实发过话）")
  const fixed = estimateText(String(turn.body.system ?? "")) + estimateText(JSON.stringify(turn.body.tools ?? []))
  const threshold = requestBudget({ model: "claude-fake-1", format: "anthropic", maxTokens: 4096 }).threshold
  assert.ok(fixed > threshold, `夹具前提：固定开销估算 ${fixed} 应越过压缩线 ${threshold}`)
}

test('CLI 1-1 正常：一次工具调用后继续对话 —— 会话流有调用与结果，模型回复引用结果，无 400', { timeout: SCENE_TIMEOUT_MS }, async (t) => {
  const s = await scene(t, {
    files: { "note.txt": "PINEAPPLE-42\n" },
    calls: [{ id: "toolu_g1", name: "read", input: { path: "note.txt" } }],
  })
  const cli = s.launch()
  const sessionId = await openSession(cli, s.cwd)
  const reply = await say(cli, sessionId, "Read note.txt and tell me what it says.")

  const updates = cli.updates()
  const calls = updates.filter((u) => u.sessionUpdate === "tool_call")
  const completed = updates.filter((u) => u.sessionUpdate === "tool_call_update" && u.status === "completed")
  assert.equal(calls.length, 1, `会话流应出现一次工具调用，实际：${JSON.stringify(calls.map((c) => c.title))}`)
  assert.equal(calls[0].title, "read", "工具调用是 read")
  assert.equal(calls[0].rawInput?.path, "note.txt", "读的就是那个内容已知的小文件")
  assert.equal(completed.length, 1, "会话流应出现该工具的结果")
  assert.match(JSON.stringify(completed[0].content), /PINEAPPLE-42/, "工具结果带回文件内容")
  assert.match(reply, /PINEAPPLE-42/, `模型下段回复应引用工具结果，实际：${reply}`)
  assert.equal(s.endpoint.rejections.length, 0, `上游无 role 类 400（本档证伪点）：${s.endpoint.rejections.join("｜")}`)
  assert.ok(s.endpoint.requests.length >= 2, "工具回合之后还有下一回合（会话确实继续了）")
  assert.equal(s.endpoint.requests.filter((r) => r.summary).length, 0, "零摘要请求——固定开销吃掉压缩线时不白付一次压缩（§6.17 可达性门）")
  assertFixedOverheadOverLine(s.endpoint)
})

test('CLI 1-2 边界：一轮两个工具调用后继续对话 —— 两个结果都回到模型，无 400', { timeout: SCENE_TIMEOUT_MS }, async (t) => {
  const s = await scene(t, {
    files: { "note-a.txt": "ALPHA-1\n", "note-b.txt": "BETA-2\n" },
    calls: [
      { id: "toolu_g2a", name: "read", input: { path: "note-a.txt" } },
      { id: "toolu_g2b", name: "read", input: { path: "note-b.txt" } },
    ],
  })
  const cli = s.launch()
  const sessionId = await openSession(cli, s.cwd)
  const reply = await say(cli, sessionId, "Read note-a.txt and note-b.txt, then tell me both contents.")

  const updates = cli.updates()
  const calls = updates.filter((u) => u.sessionUpdate === "tool_call")
  const completed = updates.filter((u) => u.sessionUpdate === "tool_call_update" && u.status === "completed")
  assert.equal(calls.length, 2, `一轮应出现两个工具调用，实际：${JSON.stringify(calls.map((c) => c.rawInput?.path))}`)
  assert.deepEqual(calls.map((c) => c.rawInput?.path).sort(), ["note-a.txt", "note-b.txt"], "两个调用各读一个文件")
  assert.equal(completed.length, 2, "两个调用都拿到了结果")
  assert.match(reply, /ALPHA-1/, `模型回复应引用第一个结果，实际：${reply}`)
  assert.match(reply, /BETA-2/, `模型回复应引用第二个结果，实际：${reply}`)
  assert.equal(s.endpoint.rejections.length, 0, `上游无 role 类 400（本档证伪点）：${s.endpoint.rejections.join("｜")}`)
  assert.ok(s.endpoint.requests.length >= 2, "多工具回合之后还有下一回合（会话确实继续了）")
  assert.equal(s.endpoint.requests.filter((r) => r.summary).length, 0, "零摘要请求——固定开销吃掉压缩线时不白付一次压缩（§6.17 可达性门）")
  assertFixedOverheadOverLine(s.endpoint)
})

test('CLI 1-3 边界：关进程重开同一会话，历史从盘回放后继续 —— 回复接上新问题，无 400（跨轮机读投影：重开的请求带请求 ∥ 最近两轮的工具段 ∥ 回复 ∥ 任务状态）', { timeout: SCENE_TIMEOUT_MS }, async (t) => {
  const s = await scene(t, {
    files: { "note.txt": "PINEAPPLE-42\n" },
    calls: [{ id: "toolu_g3", name: "read", input: { path: "note.txt" } }],
  })

  // 第一程：开会话、用一次工具、拿到回复
  const first = s.launch()
  const sessionId = await openSession(first, s.cwd)
  const firstReply = await say(first, sessionId, "Read note.txt and tell me what it says.")
  assert.match(firstReply, /PINEAPPLE-42/, `本程回复应引用工具结果，实际：${firstReply}`)
  await first.stop() // 关掉 CLI 进程（会话已在本回合收尾时落盘）

  const requestsBefore = s.endpoint.requests.length
  const rejectionsBefore = s.endpoint.rejections.length

  // 第二程：重开 CLI、装载同一会话（机读线从槽回放）、再发一句话
  const second = s.launch()
  const init = await second.request("initialize", { protocolVersion: 1, clientCapabilities: {} })
  assert.equal(init.error, undefined, `第二程 initialize 被拒：${JSON.stringify(init.error)}`)
  const loaded = await second.request("session/load", { sessionId })
  assert.equal(loaded.error, undefined, `装载同一会话失败：${JSON.stringify(loaded.error)}｜stderr: ${second.stderr.slice(-2000)}`)

  const reply = await say(second, sessionId, "what did the file say?")
  assert.match(reply, /what did the file say\?/, `模型应看见本程的新问题，实际：${reply}`)
  assert.equal(s.endpoint.rejections.length - rejectionsBefore, 0, `第二程无 role 类 400：${s.endpoint.rejections.slice(rejectionsBefore).join("｜")}`)
  assert.ok(s.endpoint.requests.length > requestsBefore, "第二程确实向模型发了请求（回放的历史 + 新问题）")

  // 跨轮机读投影（CONTEXT-COMPACTION §1.1）：机读线带上一程的用户请求、工具段、最终回复与任务状态——
  // 本场景只有一程，它就在保留窗内，工具段与结果成组跟回，且是原文（机读线不过 slim）。
  const reopened = s.endpoint.requests.slice(requestsBefore).filter((r) => !r.summary)[0]
  const wire = JSON.stringify(reopened.body.messages)
  assert.ok(wire.includes('"tool_result"'), `重开后的请求应带上保留窗内的工具结果：${wire.slice(0, 1500)}`)
  assert.ok(wire.includes('"tool_use"'), "也应带上它的工具调用（成组保留，不留孤立配对）")
  assert.ok(wire.includes("PINEAPPLE-42"), "工具结果正文原文在")
  assert.ok(wire.includes("Read note.txt and tell me what it says."), "重开后的请求应带上一程的用户请求")
  assert.ok(wire.includes("Answer to"), "重开后的请求应带上一程的最终回复")
  assert.ok(wire.includes("[Task state]"), "重开后的请求应带任务状态")
  assert.equal(s.endpoint.requests.filter((r) => r.summary).length, 0, "两程零摘要请求——固定开销吃掉压缩线时不白付一次压缩（§6.17 可达性门）")
  assertFixedOverheadOverLine(s.endpoint)
})
