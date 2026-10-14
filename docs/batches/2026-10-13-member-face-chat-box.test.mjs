/**
 * 2026-10-13-member-face-chat-box.test.mjs — member-face-chat 批 · **盒壳腿（一）**：协议码 + 壳行为面
 * （随批档归档；不入任何门——单测纪律：改动实施者写并跑本档）。
 *
 * 覆盖 = `agent/MEMBER-AGENT.md` §7 盒内部分：**成员面 B69–B72**（盒掉线/服务端重启/跨会话在途门/
 * 换机）∥ **E54–E56 盒内部分**（E54 上限拒 ∥ E55 越权拒 = 服务端面，盒侧零；E56 盒离线拒 = 连不上
 * ⇒ 退避重连）＋ 协议腿（§3.3 帧形逐字——SSE/NDJSON 两径）＋ 拉仓执行面（`pull.mjs`——假 spawn）。
 * 姊妹档 = `…-box-core.test.mjs`（核接口面 ∥ 凭据助手 ∥ 镜像面）；两档合计即原一档（超 800 行硬限
 * 拆档——member-face-chat 批 fix round 2）。
 *
 * 跑法（仓内）：`cd thincoder && node --test docs/batches/2026-10-13-member-face-chat-box.test.mjs`
 */
import test from "node:test"
import assert from "node:assert/strict"
import { EventEmitter } from "node:events"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import {
  beginFrame, callFrame, capText, createSseParser, deltaFrame, encodeFrame, encodeSseEvent,
  endFrame, parseFrameLine, resultFrame, turnFrame, usageFrame, FRAME_TYPES, SSE_EVENTS,
} from "../../thincoder-server/deploy/sandbox/member-shell/protocol.mjs"
import { createShell } from "../../thincoder-server/deploy/sandbox/member-shell/index.mjs"
import { classifyCloneFailure, createPull, defaultDirFromUrl, stripUrlCredentials } from "../../thincoder-server/deploy/sandbox/member-shell/pull.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))

// ========== 工具 ==========

/** 轮询等待条件成立（测试节拍——上限防挂死）。 */
async function until(fn, { timeout = 3000, label = "condition" } = {}) {
  const start = Date.now()
  while (!fn()) {
    if (Date.now() - start > timeout) throw new Error(`until timeout: ${label}`)
    await new Promise((r) => setTimeout(r, 5))
  }
}

/** 可控 SSE 源（假 fetch 的响应体）。 */
function createSseSource() {
  const encoder = new TextEncoder()
  const queue = []
  let waiter = null
  let done = false
  return {
    body: {
      getReader: () => ({
        read() {
          if (queue.length > 0) return Promise.resolve({ done: false, value: encoder.encode(queue.shift()) })
          if (done) return Promise.resolve({ done: true })
          return new Promise((resolve) => { waiter = resolve })
        },
        async cancel() { done = true },
      }),
    },
    push(text) {
      if (waiter) {
        const resolve = waiter
        waiter = null
        resolve({ done: false, value: encoder.encode(text) })
      } else {
        queue.push(text)
      }
    },
    close() {
      done = true
      if (waiter) {
        const resolve = waiter
        waiter = null
        resolve({ done: true })
      }
    },
  }
}

/** 读尽一个请求体流（假 fetch 用——turns 上行流的采集面）。 */
async function readAll(bodyStream) {
  const reader = bodyStream.getReader()
  const decoder = new TextDecoder()
  let out = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    out += decoder.decode(value, { stream: true })
  }
  return out + decoder.decode()
}

/** 壳测试台：假 fetch（`/events` ⇒ 可控 SSE 源；上行 ⇒ 记录 { url, body }）。 */
function createHarness({ coreRun, pull, turnsResponse = null, sleep = async () => {} } = {}) {
  const upstream = []
  const sources = []
  let eventsOpen = 0
  const fetchImpl = async (url, init = {}) => {
    const target = String(url)
    if (target.endsWith("/api/box/events")) {
      eventsOpen += 1
      const source = createSseSource()
      sources.push(source)
      return { ok: true, status: 200, body: source.body }
    }
    const rec = { url: target, body: null, init }
    upstream.push(rec)
    if (turnsResponse) {
      const shaped = turnsResponse(rec)
      if (shaped) return shaped
    }
    if (init.body?.getReader) rec.body = await readAll(init.body)
    else if (typeof init.body === "string") rec.body = init.body
    return { ok: true, status: 204, json: async () => ({}) }
  }
  const shell = createShell({
    env: { TC_SERVER_URL: "http://server.test", OPENAI_API_KEY: "wk-1", OPENAI_BASE_URL: "http://server.test/v1" },
    fetchImpl, coreRun, pull, sleep,
    log: { info: () => {}, warn: () => {} },
  })
  return {
    shell, upstream, sources,
    openEvents: () => eventsOpen,
    lastSource: () => sources[sources.length - 1],
    sse: (name, data) => sources[sources.length - 1].push(encodeSseEvent(name, data)),
    stop: async () => {
      await shell.stop()
      for (const s of sources) s.close()
    },
  }
}

/** 假 coreRun（壳测试——回合驱动替身）。 */
function fakeCoreRun(runTurnImpl) {
  const calls = { runTurn: 0, args: [] }
  return {
    cwd: "/workspace",
    calls,
    listSessions: () => [{ id: 1, model: "m1", reasoning: null, status: "idle", excerpt: "你好", updatedAt: 1 }],
    readSession: (id) => ({ session: { id: Number(id), model: "m1", reasoning: null, status: "idle", excerpt: "你好", updatedAt: 1 }, messages: [] }),
    createSession: async () => ({ id: 2 }),
    updateSession: () => ({ session: { id: 1, model: "m2", reasoning: null, status: "idle", excerpt: "你好", updatedAt: 2 } }),
    async runTurn(args) {
      calls.runTurn += 1
      calls.args.push(args)
      return runTurnImpl ? runTurnImpl(args) : endFrame({ status: "succeeded", durationMs: 3, calls: 0 })
    },
  }
}

/** 假 spawn（`node:child_process.spawn` 同形——pull 档注入面）。 */
function fakeSpawn(script) {
  return (command, args, options) => {
    const child = new EventEmitter()
    child.stdout = new EventEmitter()
    child.stderr = new EventEmitter()
    child.kill = () => { child.emit("close", -1) }
    process.nextTick(() => script({ command, args, options, child }))
    return child
  }
}

// ========== A. 协议腿：帧形逐字（SSE / NDJSON 两径）==========

test("A1 SSE 编码逐字（event + data 单行）", () => {
  assert.equal(encodeSseEvent("run", { cmdId: "c1", sessionId: 3, content: "hi" }), 'event: run\ndata: {"cmdId":"c1","sessionId":3,"content":"hi"}\n\n')
  assert.equal(encodeSseEvent("ping", {}), "event: ping\ndata: {}\n\n")
})

test("A2 SSE 解析：分块增量 + 两事件 + 残尾 flush + 注释行", () => {
  const parser = createSseParser()
  // 首块即含完整事件（尾随分块内的残事件留待下块）
  assert.deepEqual(parser.push("event: hello\ndata: {\"serverTime\":1,\"redeliver\":[]}\n\nevent: pi"), [{ event: "hello", data: { serverTime: 1, redeliver: [] } }])
  const events = parser.push('ng\ndata: {}\n\n: 注释\n')
  assert.equal(events.length, 1)
  assert.deepEqual(events[0], { event: "ping", data: {} })
  // 第一个事件跨了一次 push——分块安全
  const p2 = createSseParser()
  const first = p2.push('event: hello\ndata: {"serverTime":1,"redeliver":["a","b"]}\n\n')
  assert.deepEqual(first, [{ event: "hello", data: { serverTime: 1, redeliver: ["a", "b"] } }])
  // 无尾空行的残事件（flush 兜底）
  const p3 = createSseParser()
  assert.deepEqual(p3.push('event: run\ndata: {"cmdId":"c9"}'), [])
  assert.deepEqual(p3.flush(), [{ event: "run", data: { cmdId: "c9" } }])
})

test("A3 SSE：下行六事件名逐值可解析（§3.3 事件表）", () => {
  assert.deepEqual(SSE_EVENTS, ["hello", "run", "abort", "pull", "cmd", "ping"])
  const doc = [
    encodeSseEvent("hello", { serverTime: 1, redeliver: [] }),
    encodeSseEvent("run", { cmdId: "c1", sessionId: 1, content: "写一个测试" }),
    encodeSseEvent("abort", { cmdId: "c2", sessionId: 1 }),
    encodeSseEvent("pull", { cmdId: "c3", url: "https://example.com/git/repo.git", dir: "/workspace/repo" }),
    encodeSseEvent("cmd", { cmdId: "c4", kind: "sessions.list", args: {} }),
    encodeSseEvent("ping", {}),
  ].join("")
  const parser = createSseParser()
  const events = parser.push(doc)
  assert.deepEqual(events.map((e) => e.event), SSE_EVENTS)
  assert.equal(events[4].data.kind, "sessions.list")
  assert.equal(events[3].data.url, "https://example.com/git/repo.git")
})

test("A4 NDJSON：编码 / 解析 / 坏行零抛", () => {
  assert.equal(encodeFrame({ type: "delta", text: "甲" }), '{"type":"delta","text":"甲"}\n')
  assert.deepEqual(parseFrameLine('{"type":"turn","n":2}'), { type: "turn", n: 2 })
  assert.equal(parseFrameLine("{ 坏"), null)
  assert.equal(parseFrameLine('"x"'), null)
  assert.equal(parseFrameLine("[1]"), null)
  assert.equal(parseFrameLine(""), null)
})

test("A5 帧构造器逐形（begin + 六帧词表——键集精确）", () => {
  assert.deepEqual(FRAME_TYPES, ["begin", "delta", "call", "result", "turn", "usage", "end"])
  assert.deepEqual(beginFrame("c1"), { type: "begin", cmdId: "c1" })
  assert.deepEqual(deltaFrame("文本"), { type: "delta", text: "文本" })
  assert.deepEqual(callFrame({ id: "t1", name: "read", args: { path: "a" } }), { type: "call", id: "t1", name: "read", args: '{"path":"a"}' })
  assert.deepEqual(resultFrame({ id: "t1", ok: false, summary: "摘要", content: "全文" }), { type: "result", id: "t1", ok: false, summary: "摘要", content: "全文" })
  assert.deepEqual(turnFrame(2), { type: "turn", n: 2 })
  assert.deepEqual(usageFrame({ prompt_tokens: 3, completion_tokens: 4, prompt_cache_hit_tokens: 1, prompt_cache_miss_tokens: 2 }), { type: "usage", prompt: 3, completion: 4, cacheHit: 1, cacheMiss: 2 })
  assert.deepEqual(usageFrame(undefined), { type: "usage", prompt: 0, completion: 0, cacheHit: 0, cacheMiss: 0 })
  assert.deepEqual(endFrame({ status: "succeeded" }), { type: "end", status: "succeeded" })
  assert.deepEqual(endFrame({ status: "failed", reason: "aborted", durationMs: 5, calls: 1 }), { type: "end", status: "failed", reason: "aborted", durationMs: 5, calls: 1 })
  assert.equal("reason" in endFrame({ status: "succeeded" }), false)
  assert.equal(capText("abcdef", 5), "abcd…")
  assert.equal(capText("abc", 5), "abc")
})

// ========== C. 壳 index：连挂 / 掉线重连 / 在途门 / 指令 / 拉仓 ==========

test("C1 连接形：GET /api/box/events + 工作区 key（Bearer）", async () => {
  const h = createHarness({ coreRun: fakeCoreRun() })
  const loop = h.shell.start()
  await until(() => h.openEvents() === 1, { label: "events open" })
  h.sse("hello", { serverTime: 1, redeliver: [] })
  await until(() => h.shell.state.events === 1, { label: "hello consumed" })
  await h.stop()
  await loop
})

test("C2 ping 事件 ⇒ POST /api/box/ping { t }", async () => {
  const h = createHarness({ coreRun: fakeCoreRun() })
  const loop = h.shell.start()
  await until(() => h.openEvents() === 1)
  h.sse("ping", {})
  await until(() => h.upstream.some((r) => r.url.endsWith("/api/box/ping")), { label: "ping ack" })
  const rec = h.upstream.find((r) => r.url.endsWith("/api/box/ping"))
  assert.equal(typeof JSON.parse(rec.body).t, "number")
  assert.equal(rec.init.headers.authorization, "Bearer wk-1")
  await h.stop()
  await loop
})

test("C3 run 事件 ⇒ 回合流（begin ⇒ 帧 ⇒ end 逐帧；URL 逐值）", async () => {
  const coreRun = fakeCoreRun(async ({ onFrame }) => {
    onFrame(deltaFrame("第一段"))
    onFrame(turnFrame(1))
    return endFrame({ status: "succeeded", durationMs: 9, calls: 0 })
  })
  const h = createHarness({ coreRun })
  const loop = h.shell.start()
  await until(() => h.openEvents() === 1)
  h.sse("run", { cmdId: "c-run-1", sessionId: 6, content: "写个测试" })
  await until(() => h.upstream.some((r) => r.url.includes("/turns")), { label: "turns open" })
  const rec = h.upstream.find((r) => r.url.includes("/turns"))
  assert.equal(rec.url, "http://server.test/api/box/sessions/6/turns")
  assert.equal(rec.init.headers["content-type"], "application/x-ndjson")
  const frames = rec.body.trim().split("\n").map((line) => parseFrameLine(line))
  assert.deepEqual(frames[0], { type: "begin", cmdId: "c-run-1" })
  assert.deepEqual(frames[1], { type: "delta", text: "第一段" })
  assert.deepEqual(frames[2], { type: "turn", n: 1 })
  assert.equal(frames[3].type, "end")
  assert.equal(frames[3].status, "succeeded")
  assert.equal(coreRun.calls.args[0].content, "写个测试")
  await h.stop()
  await loop
})

test("C4 abort 事件 ⇒ 在途回合中止（终态经 end 帧；零结果回呈）", async () => {
  let aborted = false
  const coreRun = fakeCoreRun(async ({ signal }) => {
    await new Promise((resolve) => signal.addEventListener("abort", () => { aborted = true; resolve() }, { once: true }))
    return endFrame({ status: "failed", reason: "aborted", message: "已中止本回合" })
  })
  const h = createHarness({ coreRun })
  const loop = h.shell.start()
  await until(() => h.openEvents() === 1)
  h.sse("run", { cmdId: "c-run-2", sessionId: 6, content: "长回合" })
  await until(() => coreRun.calls.runTurn === 1)
  h.sse("abort", { cmdId: "c-run-2", sessionId: 6 })
  await until(() => aborted, { label: "turn aborted" })
  await until(() => {
    const rec = h.upstream.find((r) => r.url.includes("/turns"))
    return typeof rec?.body === "string" && rec.body.includes('"end"')
  }, { label: "end frame landed" })
  const frames = h.upstream.find((r) => r.url.includes("/turns")).body.trim().split("\n").map((line) => parseFrameLine(line))
  assert.deepEqual(frames[0], { type: "begin", cmdId: "c-run-2" })
  assert.equal(frames[frames.length - 1].type, "end")
  assert.equal(frames[frames.length - 1].status, "failed")
  assert.equal(frames[frames.length - 1].reason, "aborted")
  // abort 事件携的是**回合** cmdId（不在 server `pending` 表）⇒ 盒侧零结果回呈（审计分歧 #1 收口）
  assert.equal(h.upstream.some((r) => r.url.includes("/commands/")), false)
  await h.stop()
  await loop
})

test("C5 B71 盒内部分：在途单飞（第二 run ⇒ 立即 failed/busy 流，不排第二回合）", async () => {
  let release
  const coreRun = fakeCoreRun(async () => {
    await new Promise((resolve) => { release = resolve })
    return endFrame({ status: "succeeded" })
  })
  const h = createHarness({ coreRun })
  const loop = h.shell.start()
  await until(() => h.openEvents() === 1)
  h.sse("run", { cmdId: "c-run-3", sessionId: 6, content: "一" })
  await until(() => coreRun.calls.runTurn === 1)
  h.sse("run", { cmdId: "c-run-4", sessionId: 6, content: "二" })
  await until(() => h.upstream.filter((r) => r.url.includes("/turns")).length === 2, { label: "busy stream" })
  const second = h.upstream.filter((r) => r.url.includes("/turns"))[1]
  const frames = second.body.trim().split("\n").map((line) => parseFrameLine(line))
  assert.deepEqual(frames[0], { type: "begin", cmdId: "c-run-4" })
  assert.equal(frames[1].type, "end")
  assert.equal(frames[1].status, "failed")
  assert.equal(frames[1].reason, "busy")
  assert.equal(coreRun.calls.runTurn, 1) // 第二回合未进核
  release()
  await until(() => h.shell.state.running === null)
  await h.stop()
  await loop
})

test("C6 B69/B70 盒内部分：上行失败 ⇒ 中止本地回合；断开重连零对齐", async () => {
  let aborted = false
  const coreRun = fakeCoreRun(async ({ signal }) => {
    await new Promise((resolve) => {
      signal.addEventListener("abort", () => { aborted = true; resolve() }, { once: true })
      setTimeout(resolve, 50)
    })
    return endFrame({ status: "succeeded" })
  })
  const h = createHarness({
    coreRun,
    // 上行 POST 立即 502（模拟掉线/服务端重启窗口）——不读体
    turnsResponse: (rec) => (rec.url.includes("/turns") ? { ok: false, status: 502, body: null } : null),
  })
  const loop = h.shell.start()
  await until(() => h.openEvents() === 1)
  h.sse("run", { cmdId: "c-run-5", sessionId: 6, content: "x" })
  await until(() => aborted, { label: "upstream failure aborts turn" })
  // 连接断开 ⇒ 重连（零对齐——只看连接数增长与既有上行面）
  const before = h.upstream.length
  h.lastSource().close()
  await until(() => h.shell.state.reconnects >= 1 && h.openEvents() === 2, { label: "reconnect" })
  await new Promise((r) => setTimeout(r, 30))
  assert.equal(h.upstream.length, before) // 重连不发任何对齐/回灌请求
  assert.equal(h.upstream.every((r) => !/sync|replay|realign|resume/i.test(r.url)), true)
  await h.stop()
  await loop
})

test("C7 E56 盒内部分：连不上 ⇒ 退避重试（不崩、不退出）", async () => {
  let fails = 2
  const sources = []
  const fetchImpl = async (url, init = {}) => {
    if (String(url).endsWith("/api/box/events")) {
      if (fails > 0) {
        fails -= 1
        throw new Error("ECONNREFUSED")
      }
      const source = createSseSource()
      sources.push(source)
      return { ok: true, status: 200, body: source.body }
    }
    return { ok: true, status: 204, json: async () => ({}) }
  }
  const shell = createShell({
    env: { TC_SERVER_URL: "http://server.test", OPENAI_API_KEY: "wk-1" },
    fetchImpl, coreRun: fakeCoreRun(), sleep: async () => {}, log: { info: () => {}, warn: () => {} },
  })
  const loop = shell.start()
  await until(() => shell.state.connections === 1, { label: "connected after retries" })
  await shell.stop()
  for (const s of sources) s.close()
  await loop
})

test("C8 读指令族：cmd 四 kind 回呈 + 未知 kind", async () => {
  const h = createHarness({ coreRun: fakeCoreRun() })
  const loop = h.shell.start()
  await until(() => h.openEvents() === 1)
  h.sse("cmd", { cmdId: "q1", kind: "sessions.list", args: {} })
  h.sse("cmd", { cmdId: "q2", kind: "session.read", args: { slot: 1 } })
  h.sse("cmd", { cmdId: "q3", kind: "session.create", args: { model: "m1" } })
  h.sse("cmd", { cmdId: "q4", kind: "session.update", args: { slot: 1, model: "m2" } })
  h.sse("cmd", { cmdId: "q5", kind: "session.delete", args: {} })
  await until(() => h.upstream.filter((r) => r.url.includes("/commands/")).length === 5, { label: "five results" })
  const by = (id) => JSON.parse(h.upstream.find((r) => r.url.includes(`/commands/${id}/result`)).body)
  assert.equal(by("q1").state, "done")
  assert.equal(by("q1").detail.sessions[0].id, 1)
  assert.equal(by("q2").detail.session.id, 1)
  assert.deepEqual(by("q3").detail, { id: 2 })
  assert.equal(by("q4").detail.session.model, "m2")
  assert.equal(by("q5").state, "failed")
  assert.equal(by("q5").detail.kind, "invalid_request")
  await h.stop()
  await loop
})

test("C9 pull 事件 ⇒ 拉仓执行 + 结果回呈（成 / 败）", async () => {
  const seen = []
  const pull = {
    async runPull(cmd) {
      seen.push(cmd)
      return cmd.url.includes("bad")
        ? { state: "failed", detail: { kind: "auth", message: "凭据缺失或无效——请在我的·账户页绑定 Git 凭据后重试" } }
        : { state: "done", detail: { dir: "/workspace/repo" } }
    },
  }
  const h = createHarness({ coreRun: fakeCoreRun(), pull })
  const loop = h.shell.start()
  await until(() => h.openEvents() === 1)
  h.sse("pull", { cmdId: "p1", url: "https://gitee.com/a/repo.git", dir: "/workspace/repo" })
  h.sse("pull", { cmdId: "p2", url: "https://bad.example/x.git", dir: "/workspace/x" })
  await until(() => h.upstream.filter((r) => r.url.includes("/commands/")).length === 2, { label: "pull results" })
  const by = (id) => JSON.parse(h.upstream.find((r) => r.url.includes(`/commands/${id}/result`)).body)
  assert.deepEqual(by("p1"), { state: "done", detail: { dir: "/workspace/repo" } })
  assert.equal(by("p2").state, "failed")
  assert.equal(by("p2").detail.kind, "auth")
  assert.equal(seen[0].dir, "/workspace/repo")
  await h.stop()
  await loop
})

test("C10 指令槽不存在 ⇒ failed + `notFound:true`（服务器 404 映射面）", async () => {
  const coreRun = { ...fakeCoreRun(), readSession: () => null, updateSession: () => null }
  const h = createHarness({ coreRun })
  const loop = h.shell.start()
  await until(() => h.openEvents() === 1)
  h.sse("cmd", { cmdId: "n1", kind: "session.read", args: { slot: 9 } })
  h.sse("cmd", { cmdId: "n2", kind: "session.update", args: { slot: 9, reasoning: "high" } })
  await until(() => h.upstream.filter((r) => r.url.includes("/commands/")).length === 2, { label: "notFound results" })
  const by = (id) => JSON.parse(h.upstream.find((r) => r.url.includes(`/commands/${id}/result`)).body)
  assert.equal(by("n1").state, "failed")
  assert.equal(by("n1").detail.notFound, true)
  assert.equal(by("n2").detail.notFound, true)
  await h.stop()
  await loop
})

// ========== D. pull：git 执行面（假 spawn）==========

test("D1 clone 成功：argv/env/目录逐值 + 非交互", async () => {
  const runs = []
  const pull = createPull({
    cwd: "/workspace",
    env: { PATH: "/usr/bin" },
    spawnImpl: fakeSpawn(({ command, args, options, child }) => {
      runs.push({ command, args, options })
      child.emit("close", 0)
    }),
  })
  const result = await pull.runPull({ url: "https://gitee.com/a/repo.git", dir: "/workspace/repo" })
  assert.deepEqual(result, { state: "done", detail: { dir: resolve("/workspace", "repo") } })
  assert.equal(runs[0].command, "git")
  assert.deepEqual(runs[0].args, ["clone", "https://gitee.com/a/repo.git", resolve("/workspace", "repo")])
  assert.equal(runs[0].options.env.GIT_TERMINAL_PROMPT, "0")
})

test("D2 clone 失败分类 + 相对目录 + 缺省目录", async () => {
  const cases = [
    ["fatal: destination path 'repo' already exists and is not an empty directory.", "dir_conflict"],
    ["fatal: Authentication failed for 'https://gitee.com/a/repo'", "auth"],
    ["fatal: could not read Username for 'https://gitee.com': terminal prompts disabled", "auth"],
    ["fatal: unable to access: Could not resolve host: gitee.com", "network"],
    ["fatal: 别的错误", "other"],
  ]
  for (const [stderr, kind] of cases) {
    const pull = createPull({
      cwd: "/workspace",
      spawnImpl: fakeSpawn(({ child }) => {
        child.stderr.emit("data", stderr)
        child.emit("close", 128)
      }),
    })
    const result = await pull.runPull({ url: "https://gitee.com/a/repo.git" })
    assert.equal(result.state, "failed", stderr)
    assert.equal(result.detail.kind, kind, stderr)
    assert.equal(result.detail.dir, resolve("/workspace", "repo")) // 缺省目录 = 仓名（平台无关形）
  }
  assert.equal(classifyCloneFailure("").kind, "other")
  assert.equal(defaultDirFromUrl("https://gitee.com/a/repo.git/"), "repo")
  assert.equal(stripUrlCredentials("https://user:tok@gitee.com/a/repo.git"), "https://gitee.com/a/repo.git")
  assert.equal(stripUrlCredentials("git@gitee.com:a/repo.git"), "git@gitee.com:a/repo.git")

  // 目录围栅：`..` 逃逸 ∥ 工作区外绝对路径 ⇒ 拒（不落工作区外）
  const escaping = createPull({ cwd: "/workspace", spawnImpl: fakeSpawn(({ child }) => child.emit("close", 0)) })
  const escaped = await escaping.runPull({ url: "https://gitee.com/a/repo.git", dir: "../escape" })
  assert.equal(escaped.state, "failed")
  assert.equal(escaped.detail.kind, "other")
})
