/**
 * 2026-10-11-chat-shell-align.test.mjs — thincoder-server 批内件（`chat-shell-align` 批 · 台账 #1292；名随批档 · 住 `docs/batches/`）：
 * **机制面腿**（帧序 / 换模型 / 图片 / 中止——装置 A：假模型出口 + 假工具面 + 进程内应用）；
 * 壳面 + 结构腿 + 词面腿 = 拆档新档 `2026-10-11-chat-shell-align-ui.test.mjs`（拆档执行 = console-chat-live-step 批；缘由 = 原档 877 行越 800 硬限）。
 * 运行（自 `thincoder/` 仓根）：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-11-chat-shell-align.test.mjs`
 *
 * 判据源 = 批档 §2 ∥ `agent/ADMIN-AGENT.md` §8/§11 ∥ `gateway/API.md` §2.8：
 *   机制面：N64（帧序 + usage + `end` 两字段）∥ N65/E51（换模型两态 + 错误族）∥ N66/B66/E50（图片三门 + 回放 + 详情仅计数）∥ N67/B65（中止全链 + 两窗 + 错误族）。
 */

import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const CHAT = await load("thincoder-server/src/agent/chat.mjs")
const CHAT_ROUTES = await load("thincoder-server/src/agent/chat-routes.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const GATE = await load("thincoder-core/attachments.mjs") // 核单源（真件——非替身：本批两门逐值可证）

const tempRoot = mkdtempSync(join(tmpdir(), "tc-shell-align-"))
const PASSWORD = "password-123"
const PNG = `data:image/png;base64,${Buffer.from("png-bytes-1234").toString("base64")}`
const MODEL = "fake/kimi-k3" // 多模态（核表源——N66/E50 两判据）
const PLAIN = "fake/glm-5.3" // 非多模态
// ── 装置：假模型出口（可 gate/可 signal）/ 假工具面 / 进程内应用 ─────────────────

function abortErr() { const error = new Error("aborted"); error.name = "AbortError"; return error }

function scriptedChat(turns) {
  const state = { i: 0, calls: [] }
  const chat = async ({ messages, tools, onToken, signal }) => {
    state.calls.push({ messages: JSON.parse(JSON.stringify(messages)), tools })
    const turn = turns[Math.min(state.i, turns.length - 1)]
    state.i += 1
    const spec = typeof turn === "function" ? await turn({ messages, tools, onToken, signal }) : (turn ?? {})
    if (signal?.aborted) throw abortErr()
    if (spec?.deltas) for (const piece of spec.deltas) onToken?.(piece)
    if (spec?.gate) await spec.gate
    if (spec?.throws) throw spec.throws instanceof Error ? spec.throws : new Error(String(spec.throws))
    return { content: spec?.content ?? "", toolCalls: spec?.toolCalls ?? [], ...(spec?.usage ? { usage: spec.usage } : {}) }
  }
  return { chat, state }
}

const fakeTools = () => ({
  schemas: [{ type: "function", function: { name: "members", parameters: { type: "object", properties: { op: { type: "string" } }, required: ["op"] } } }],
  calls: [],
  invoke: async () => ({ ok: true, summary: "已办" }),
})

async function call(base, method, path, { body, cookie } = {}) {
  const headers = { "content-type": "application/json" }
  if (cookie) headers.cookie = cookie
  const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* NDJSON 流 ∥ 空体 */ }
  return { status: res.status, text, json, setCookies: res.headers.getSetCookie?.() ?? [] }
}

/** 帧流读器（增量——abort 窗需在途观察；`waitFor` 轮询帧到场）。 */
function frameReader(response) {
  const frames = []
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  const pump = (async () => {
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      let index = buffer.indexOf("\n")
      while (index >= 0) {
        const line = buffer.slice(0, index).trim()
        buffer = buffer.slice(index + 1)
        if (line !== "") frames.push(JSON.parse(line))
        index = buffer.indexOf("\n")
      }
    }
    if (buffer.trim() !== "") frames.push(JSON.parse(buffer.trim()))
  })()
  return {
    frames,
    done: pump,
    types: () => frames.map((frame) => frame.type),
    waitFor: async (type, ms = 3000) => {
      const started = Date.now()
      while (!frames.some((frame) => frame.type === type)) {
        if (Date.now() - started > ms) throw new Error(`等帧超时：${type}（实收 ${frames.map((f) => f.type).join("∥")}）`)
        await new Promise((resolve) => setTimeout(resolve, 10))
      }
    },
  }
}

function seedProvider(db, { name = "fake", models = ["kimi-k3", "glm-5.3"] } = {}) {
  const now = new Date().toISOString()
  db.prepare("INSERT INTO providers (name, base_url, api_key, models_json, created_at, updated_at) VALUES (?,?,?,?,?,?)")
    .run(name, "http://127.0.0.1:9/v1", "sk-test", JSON.stringify(models), now, now)
}

async function startApp({ turns = [], withProvider = true, models = ["kimi-k3", "glm-5.3"] } = {}) {
  const db = DB.openDatabase(":memory:")
  await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  await MEMBERS.createMember(db, { username: "user", role: "user", password: PASSWORD })
  if (withProvider) seedProvider(db, { models })
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(mkdtempSync(join(tempRoot, "app-")), "gateway.db") })
  const routes = SERVER.createRouteTable()
  const scripted = scriptedChat(turns)
  const tools = fakeTools()
  CHAT_ROUTES.registerChatRoutes(routes, { db, log: null, deps: { chat: scripted.chat, tools, config, imageGate: GATE } })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  const server = SERVER.createGatewayServer({ config, routes, log: null })
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve) })
  const base = `http://127.0.0.1:${server.address().port}`
  const login = async (username) => {
    const res = await call(base, "POST", "/api/login", { body: { username, password: PASSWORD } })
    const line = res.setCookies.find((item) => item.startsWith(`${SESSION.SESSION_COOKIE}=`)) ?? null
    return line ? line.split(";")[0] : null
  }
  const cookie = await login("admin")
  const cookieUser = await login("user")
  const newChat = async (model = MODEL) => {
    const res = await call(base, "POST", "/api/admin/agent/chats", { body: { model }, cookie })
    assert.equal(res.status, 200, `建会话须 200：${res.text}`)
    return res.json.chat.id
  }
  const rows = (chatId) => db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(chatId)
  return { db, base, cookie, cookieUser, scripted, tools, newChat, rows, close: () => new Promise((resolve) => server.close(resolve)) }
}

// ── 机制面 ─────────────────────────────────────────────────────────────────

const USAGE1 = { prompt_tokens: 1000, completion_tokens: 200, total_tokens: 1200, prompt_cache_hit_tokens: 800, prompt_cache_miss_tokens: 200 }
const USAGE2 = { prompt_tokens: 1500, completion_tokens: 50, total_tokens: 1550, prompt_cache_hit_tokens: 300, prompt_cache_miss_tokens: 700 }

test("N64 帧序：turn/delta/usage/call/result/turn/delta/usage/end + usage 逐值 + end 两字段", async () => {
  const app = await startApp({
    turns: [
      { content: "先查", deltas: ["先查"], usage: USAGE1, toolCalls: [{ id: "call-1", name: "members", arguments: '{"op":"list"}' }] },
      { content: "收尾", deltas: ["收尾"], usage: USAGE2, toolCalls: [] },
    ],
  })
  try {
    const chatId = await app.newChat()
    const res = await fetch(`${app.base}/api/admin/agent/chats/${chatId}/messages`, {
      method: "POST", headers: { "content-type": "application/json", cookie: app.cookie }, body: JSON.stringify({ content: "在吗" }),
    })
    assert.equal(res.status, 200)
    const reader = frameReader(res)
    await reader.done
    assert.deepEqual(reader.types(), ["turn", "delta", "usage", "call", "result", "turn", "delta", "usage", "end"], "帧序（N64 逐项）")
    const [first, second] = reader.frames.filter((frame) => frame.type === "usage")
    assert.deepEqual(first, { type: "usage", prompt: 1000, completion: 200, cacheHit: 800, cacheMiss: 200 }, "usage 逐值 = 假模型（帧面短键）")
    assert.deepEqual(second, { type: "usage", prompt: 1500, completion: 50, cacheHit: 300, cacheMiss: 700 })
    assert.equal(reader.frames.filter((frame) => frame.type === "turn").map((frame) => frame.n).join(","), "1,2", "turn 序号 = 模型调用序")
    const end = reader.frames.at(-1)
    assert.equal(end.status, "succeeded")
    assert.equal(end.calls, 1, "end.calls = 工具调用数")
    assert.equal(typeof end.durationMs, "number", "end.durationMs 在场（可字段）")
    // 零落库（帧面 = 视图面）：库行 = user ∥ assistant ∥ tool ∥ assistant 四行，usage 不入库
    const rows = app.rows(chatId)
    assert.deepEqual(rows.map((row) => row.role), ["user", "assistant", "tool", "assistant"], "帧面零落库")
    assert.ok(!JSON.stringify(rows).includes("prompt_cache_hit_tokens"), "usage 零落库")
  } finally { await app.close() }
  // 缺源 ⇒ 零帧（同批口径：无 usage 的回合不产 usage 帧）
  const bare = await startApp({ turns: [{ content: "无计", deltas: ["无计"], toolCalls: [] }] })
  try {
    const chatId = await bare.newChat()
    const res = await fetch(`${bare.base}/api/admin/agent/chats/${chatId}/messages`, {
      method: "POST", headers: { "content-type": "application/json", cookie: bare.cookie }, body: JSON.stringify({ content: "再来" }),
    })
    const reader = frameReader(res)
    await reader.done
    assert.deepEqual(reader.types(), ["turn", "delta", "end"], "无 usage 源 ⇒ 零 usage 帧")
    assert.equal(reader.frames.at(-1).durationMs >= 0, true, "`end` 两字段恒在场")
  } finally { await bare.close() }
})

test("N65/E51 换模型：PATCH 两态（idle 落库 ∥ 在途零触）+ 下回合生效 + 错误族库零变", async () => {
  let release = null
  const app = await startApp({ turns: [{ content: "甲", deltas: ["甲"], toolCalls: [] }, { content: "乙", deltas: ["乙"], toolCalls: [] }] })
  try {
    const chatId = await app.newChat(MODEL)
    // E51 错误族：缺 model ∥ 模型不在册 ∥ 不存在会话 ∥ user 角色
    assert.equal((await call(app.base, "PATCH", `/api/admin/agent/chats/${chatId}`, { body: {}, cookie: app.cookie })).status, 400)
    assert.equal((await call(app.base, "PATCH", `/api/admin/agent/chats/${chatId}`, { body: { model: "no/such" }, cookie: app.cookie })).status, 400)
    assert.equal((await call(app.base, "PATCH", "/api/admin/agent/chats/9999", { body: { model: PLAIN }, cookie: app.cookie })).status, 404)
    assert.equal((await call(app.base, "PATCH", `/api/admin/agent/chats/${chatId}`, { body: { model: PLAIN }, cookie: app.cookieUser })).status, 403)
    assert.equal(app.db.prepare("SELECT model FROM agent_chats WHERE id = ?").get(chatId).model, MODEL, "E51 库零变")
    // 在途零触：回合起点读行 ⇒ 中途 PATCH 不影响本回合（本回合出口已定）
    const gate = new Promise((resolve) => { release = resolve })
    app.scripted.state.i = 0
    const first = fetch(`${app.base}/api/admin/agent/chats/${chatId}/messages`, {
      method: "POST", headers: { "content-type": "application/json", cookie: app.cookie }, body: JSON.stringify({ content: "跑" }),
    })
    await new Promise((resolve) => setTimeout(resolve, 40))
    const patched = await call(app.base, "PATCH", `/api/admin/agent/chats/${chatId}`, { body: { model: PLAIN }, cookie: app.cookie })
    assert.equal(patched.status, 200, "在途 PATCH 零门（无 400）")
    assert.equal(patched.json.chat.model, PLAIN, "PATCH 回执 = 行形（新 model）")
    assert.equal(app.db.prepare("SELECT model FROM agent_chats WHERE id = ?").get(chatId).model, PLAIN, "PATCH 落库")
    release()
    const reader = frameReader(await first)
    await reader.done
    assert.equal(reader.frames.at(-1).status, "succeeded", "在途回合照常收尾（出口零变）")
    // 下回合生效：撤掉新 model 出册 ⇒ 下一回合信封 400 报文携新 model 名（证 = 回合读行）
    const beforeReject = app.db.prepare("SELECT COUNT(*) AS n FROM agent_chat_messages WHERE chat_id = ?").get(chatId).n
    app.db.prepare("UPDATE providers SET models_json = ? WHERE name = 'fake'").run(JSON.stringify(["kimi-k3"]))
    const next = await call(app.base, "POST", `/api/admin/agent/chats/${chatId}/messages`, { body: { content: "再来" }, cookie: app.cookie })
    assert.equal(next.status, 400, "撤册 ⇒ 400（流未起——信封形）")
    assert.ok(String(next.json?.error?.message ?? "").includes(PLAIN), `报文携当刻会话模型（证：下回合读行）：${next.text}`)
    // 历史零动（被拒 POST 零行）
    assert.equal(app.db.prepare("SELECT COUNT(*) AS n FROM agent_chat_messages WHERE chat_id = ?").get(chatId).n, beforeReject, "历史零动")
  } finally { await app.close() }
})

test("N66/B66/E50 图片：三门拒形 + 落库 parts + 回放数组 + 详情仅 imageCount", async () => {
  const app = await startApp({ turns: [{ content: "看图", deltas: ["看图"], toolCalls: [] }] })
  try {
    const chatId = await app.newChat(MODEL)
    // B66 三门（逐形 400 + 库零变 + 流未起）
    const before = app.rows(chatId).length
    for (const images of ["not-an-array", ["data:image/svg+xml;base64," + Buffer.from("<svg/>").toString("base64")], ["data:image/png;base64," + Buffer.alloc(15_000_001).toString("base64")]]) {
      const res = await call(app.base, "POST", `/api/admin/agent/chats/${chatId}/messages`, { body: { content: "x", images }, cookie: app.cookie })
      assert.equal(res.status, 400, `B66 拒形须 400：${JSON.stringify(images).slice(0, 40)}`)
      assert.ok(res.json?.error?.message, "信封形（非流）")
    }
    assert.equal(app.rows(chatId).length, before, "B66 库零变")
    // E50 非多模态 + images ⇒ 400 人话（核 `isNonVisionModel` 判）
    const plainId = await app.newChat(PLAIN)
    const e50 = await call(app.base, "POST", `/api/admin/agent/chats/${plainId}/messages`, { body: { content: "x", images: [PNG] }, cookie: app.cookie })
    assert.equal(e50.status, 400)
    assert.match(String(e50.json?.error?.message ?? ""), /不支持图片输入/, "E50 人话")
    assert.equal(app.rows(plainId).length, 0, "E50 库零变")
    // N66 正形：流照常 + user 行 parts + 回放数组 + 详情仅计数
    const res = await fetch(`${app.base}/api/admin/agent/chats/${chatId}/messages`, {
      method: "POST", headers: { "content-type": "application/json", cookie: app.cookie }, body: JSON.stringify({ content: "看图", images: [PNG] }),
    })
    assert.equal(res.status, 200)
    const reader = frameReader(res)
    await reader.done
    assert.equal(reader.frames.at(-1).status, "succeeded", "图片随行不破流")
    const userRow = app.rows(chatId).find((row) => row.role === "user")
    assert.deepEqual(JSON.parse(userRow.data_json).imageParts, [{ type: "image_url", image_url: { url: PNG } }], "user 行 data_json.imageParts 逐值")
    const sent = app.scripted.state.calls[0].messages.filter((message) => message.role === "user" && !String(message.content).startsWith("[System reminder: ")).at(-1) // 尾位环境块（三活体行）除外——admin-agent-awareness 批随正
    assert.deepEqual(sent.content, [{ type: "text", text: "看图" }, { type: "image_url", image_url: { url: PNG } }], "回放 content = parts 数组（模型出口入参）")
    const detail = await call(app.base, "GET", `/api/admin/agent/chats/${chatId}`, { cookie: app.cookie })
    const viewUser = detail.json.messages.find((message) => message.role === "user")
    assert.deepEqual(viewUser.data, { imageCount: 1 }, "详情 user 行 data 仅 imageCount")
    assert.ok(!detail.text.includes("data:image"), "dataURL 零下发（KD-SV-109）")
    // 纯文本轮：data 缺省 null（零回归——另开一会话，行序不复用图片行）
    const textChat = await app.newChat(MODEL)
    const textRes = await fetch(`${app.base}/api/admin/agent/chats/${textChat}/messages`, {
      method: "POST", headers: { "content-type": "application/json", cookie: app.cookie }, body: JSON.stringify({ content: "纯文本" }),
    })
    await frameReader(textRes).done
    assert.equal(app.rows(textChat)[0].data_json, null, "零图轮 data_json 零键")
  } finally { await app.close() }
})

test("N67/B65 中止：两窗命中 + 全链（end/notice/审计/回 idle/登记表清零）+ 错误族", async () => {
  let release = null
  const app = await startApp({
    turns: [
      async ({ onToken, signal }) => {
        onToken("半截")
        await new Promise((resolve) => { release = resolve })
        if (signal?.aborted) throw abortErr()
        return { content: "半截完整", toolCalls: [] }
      },
      { content: "后来", deltas: ["后来"], toolCalls: [] },
    ],
  })
  try {
    const chatId = await app.newChat()
    // B65 错误族
    assert.equal((await call(app.base, "POST", `/api/admin/agent/chats/${chatId}/abort`, { body: {}, cookie: app.cookie })).status, 400, "idle ⇒ 400")
    assert.equal((await call(app.base, "POST", "/api/admin/agent/chats/9999/abort", { body: {}, cookie: app.cookie })).status, 404, "不存在 ⇒ 404")
    assert.equal((await call(app.base, "POST", `/api/admin/agent/chats/${chatId}/abort`, { body: {}, cookie: app.cookieUser })).status, 403, "user ⇒ 403")
    assert.equal(app.rows(chatId).length, 0, "B65 零副作用")
    // 窗② 在途调用当即中断（核 signal 通道）
    const pending = fetch(`${app.base}/api/admin/agent/chats/${chatId}/messages`, {
      method: "POST", headers: { "content-type": "application/json", cookie: app.cookie }, body: JSON.stringify({ content: "长回合" }),
    })
    const reader = frameReader(await pending)
    await reader.waitFor("delta")
    const abort = await call(app.base, "POST", `/api/admin/agent/chats/${chatId}/abort`, { body: {}, cookie: app.cookie })
    assert.equal(abort.status, 200)
    assert.deepEqual(abort.json, { ok: true })
    release()
    await reader.done
    const end = reader.frames.at(-1)
    assert.equal(end.type, "end")
    assert.equal(end.status, "failed")
    assert.match(String(end.reason ?? ""), /已手动中止/, "end 帧携第五终态人话")
    const rows = app.rows(chatId)
    assert.equal(rows.at(-1).role, "notice")
    assert.equal(JSON.parse(rows.at(-1).data_json).reason, "aborted", "notice 第五值")
    assert.equal(rows.some((row) => row.role === "assistant" && row.content === "半截"), true, "已生成文本如实落库")
    assert.equal(app.db.prepare("SELECT status FROM agent_chats WHERE id = ?").get(chatId).status, "idle", "回 idle")
    const stop = app.db.prepare("SELECT detail FROM audit_events WHERE type = 'agent_event' ORDER BY id DESC").all()
      .map((row) => JSON.parse(row.detail)).find((detail) => detail.kind === "chat_stop")
    assert.equal(stop.reason, "aborted", "chat_stop 审计（reason aborted）")
    assert.equal(CHAT.isChatAbortRequested(chatId), false, "登记表清零")
    // 窗① 环内检查点（模型调用前）：登记先于回合 ⇒ 零模型调用即收尾
    CHAT.requestChatAbort(chatId)
    const second = await fetch(`${app.base}/api/admin/agent/chats/${chatId}/messages`, {
      method: "POST", headers: { "content-type": "application/json", cookie: app.cookie }, body: JSON.stringify({ content: "再来" }),
    })
    const reader2 = frameReader(second)
    await reader2.done
    assert.equal(reader2.frames.at(-1).status, "failed")
    assert.ok(!reader2.types().includes("turn"), "检查点先于模型调用（零 turn 帧）")
    assert.equal(CHAT.isChatAbortRequested(chatId), false, "窗① 亦清零")
    // 登记表清零后照常可跑（零残留）
    const third = await fetch(`${app.base}/api/admin/agent/chats/${chatId}/messages`, {
      method: "POST", headers: { "content-type": "application/json", cookie: app.cookie }, body: JSON.stringify({ content: "正常" }),
    })
    const reader3 = frameReader(third)
    await reader3.done
    assert.equal(reader3.frames.at(-1).status, "succeeded", "登记表零残留 ⇒ 后续回合照常")
  } finally { await app.close() }
})
