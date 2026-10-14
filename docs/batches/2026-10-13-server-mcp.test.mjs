/**
 * 2026-10-13-server-mcp.test.mjs — thincoder-server 批内单测件（`server-mcp` 批 · **服务端面舱**——MCP 清单/工具面挂载/探活/审计；台账 #1379）。
 * 名随批档 · 住 `docs/batches/` · 随批留存 · 不入任何门（开发期反馈件——改后直接重跑）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-server-mcp.test.mjs`
 *
 * 射程（判据源 = `docs/server/design/mcp/MCP.md` §8 N1–N3 ∥ B1–B2 ∥ E1 ∥ §10 ∥ §11 ∥ `store/STORE.md` §3 v24 ∥ `gateway/API.md` §2.13）：
 *   T1 迁移 v24（空库直落 24 ∥ v23 升 24 ∥ 幂等 ∥ 列面 ∥ `name` 唯一 ∥ `transport` 枚举 ∥ 存量审计保形 + 两索引 ∥ `mcp_event` 可写）
 *   T2 静态腿（`node --check` 全改档 ∥ 新档 ≤500 软线 ∥ 全改档 <800 硬限 ∥ `TRIMMED_FACES` 零 `mcp` ∥ chat 面装配含 MCP 面 ∥ bin 注册/停机收尾接线）
 *   T3 N1 chat 一轮（假建连替身——工具在场 ∥ 帧逐值 ∥ `chat_call` 行 ∥ 结果 ≤4000 落库 ∥ 预算计数 ∥ `ctx.signal` 透传）
 *   T4 N2 清单流（POST⇒GET⇒PATCH⇒GET⇒DELETE⇒GET ∥ 行逐值零秘密 ∥ 停用后工具面移除 ∥ `mcp_event` 三 kind 逐值）
 *   T5 N3 探活两径（替身 ∥ `{id}` 回落库内行 ∥ 草稿全量 ∥ 库零变 ∥ 核 `_sessions` 零增）
 *   T6 B1 冷却（首回合跳过 + 日志 ∥ 窗内零尝试 ∥ 窗满重试 ∥ 探活成功清冷却）
 *   T7 B2 名碰撞（静态面碰撞 ∥ 服务器×服务器同形——先者留存 ∥ 空清单 = 既有 16 件逐字）
 *   T8 E1 形非法五形（逐形 400 人话 + 库零变）∥ B3 附腿（缺席 = 不变 ∥ 传输切换缺必填 400 ∥ 切换连带清列）
 *   T9 N4 秘密编辑语义（留空 = 不变——密文列逐值 ∥ 显式 `null` = 清 ∥ 对象位空串 = 类型错）
 *   T10 N5 停机收尾（`closeMcpConnections` 靶含各服务器件——`deps.mcpCloseImpl` 替身）∥ 零工具服务器边界（关闭靶空——诚实 `false`）
 * 注入缝 = 假件（零真连）：`deps.mcpConnectImpl`（建连）∥ `deps.mcpProbeImpl`（探活）∥ `deps.mcpRemoveImpl`（单服务器关闭）∥ `deps.mcpCloseImpl`（停机收尾）；核件真件仅取 `_sessions` 读数（零副作用断言面）。
 * 未覆盖腿（如实记）：E2「缺核 ⇒ MCP 面不挂载 + 警告」——核件真件在场（仓内可载）⇒ 该降级径无注入点；行为面由 T6（不挂载 + 日志）∥ T3/T7（回合照跑）等价覆盖。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { mkdtempSync, readFileSync, rmSync } from "node:fs"
import { Readable } from "node:stream"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, "..", "..")
const SERVER = join(ROOT, "thincoder-server")
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const SERVER_MOD = await load("thincoder-server/src/gateway/server.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const MCP_ROUTES = await load("thincoder-server/src/mcp/routes.mjs")
const MCP_FACE = await load("thincoder-server/src/mcp/face.mjs")
const CHAT = await load("thincoder-server/src/agent/chat.mjs")
const RUN = await load("thincoder-server/src/agent/run.mjs")
const CORE_MCP = await load("thincoder-core/mcp.mjs") // 仓内直引真件（只读 `_sessions` 读数——零真连）

// ── 夹具与假件 ───────────────────────────────────────────────────────────────

const contentLines = (text) => {
  const lines = text.split("\n")
  return lines[lines.length - 1] === "" ? lines.length - 1 : lines.length
}

/** 假响应（沿 member-face-chat harness 先例——`out.json()` 解析 `out.text`）。 */
function fakeRes() {
  const out = { status: null, chunks: [], text: "" }
  const res = {
    headersSent: false,
    writableEnded: false,
    destroyed: false,
    writeHead(status) {
      out.status = status
      res.headersSent = true
      return res
    },
    write(chunk) {
      out.chunks.push(String(chunk))
      return true
    },
    end(chunk) {
      if (chunk !== undefined) out.chunks.push(String(chunk))
      out.text = out.chunks.join("")
      res.writableEnded = true
      return res
    },
    on() {
      return res
    },
    off() {
      return res
    },
  }
  out.json = () => JSON.parse(out.text)
  return { res, out }
}

/** 假请求（JSON 体 ∥ `tc_session` cookie）。 */
function jsonReq(body, { cookie = null } = {}) {
  const stream = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body), "utf8")])
  stream.headers = { cookie: cookie === null ? "" : `tc_session=${cookie}`, "content-type": "application/json" }
  return stream
}

/** 世界夹具：真库（内存）+ admin + 会话 + MCP 路由（`config.db` 落临时目录——密文键文件零入仓）。 */
function world(t, { deps = {} } = {}) {
  const dir = mkdtempSync(join(tmpdir(), "tc-mcp-"))
  const db = DB.openDatabase(":memory:")
  const info = db.prepare("INSERT INTO members (username, name, password_hash, role, created_at) VALUES ('alice','Alice','x','admin','2026-01-01T00:00:00.000Z')").run()
  const admin = db.prepare("SELECT * FROM members WHERE id = ?").get(Number(info.lastInsertRowid))
  const cookie = SESSION.createSession(db, admin.id).token
  const config = { db: join(dir, "gateway.db") }
  const routes = SERVER_MOD.createRouteTable()
  MCP_ROUTES.registerMcpRoutes(routes, { db, config, log: null, deps })
  t.after(() => {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  })
  const call = async (method, path, body) => {
    const hit = routes.resolve(method, path)
    assert.ok(hit, `路由未命中：${method} ${path}`)
    const { res, out } = fakeRes()
    await hit.handler(jsonReq(body, { cookie }), res, { params: hit.params })
    return out
  }
  return { dir, db, admin, cookie, config, call }
}

/** HTTP 异常断言（状态 + 人话片段）。 */
async function expectError(promise, { status, match }) {
  try {
    await promise
  } catch (e) {
    assert.equal(e.status, status, `状态不符：${e.status}——${e.message}`)
    if (match !== undefined) assert.match(e.message, match)
    return e
  }
  assert.fail(`未抛错（期望 ${status}）`)
}

/** 审计行读数（detail 展开 ∥ actor/target 并列）。 */
const auditRows = (db, type) =>
  db.prepare("SELECT * FROM audit_events WHERE type = ? ORDER BY id").all(type).map((row) => ({ ...JSON.parse(row.detail), actor: row.actor_name, target: row.target_name }))

/** 假模型出口（脚本回合——用尽 ⇒ 恒用末回合）。 */
function scriptedChat(turns) {
  const state = { i: 0, calls: [] }
  const chat = async ({ messages, tools }) => {
    state.calls.push({ messages: JSON.parse(JSON.stringify(messages)), tools })
    const turn = turns[Math.min(state.i, turns.length - 1)]
    state.i += 1
    return { content: turn.content ?? "", toolCalls: turn.toolCalls ?? [] }
  }
  return { chat, state }
}

/** 假环境核件（八件 + `toOpenAISchema`——空清单腿的「既有 16 件」断言面）。 */
function fakeCoreTools() {
  const names = ["get_current_time", "process", "timer", "ls", "read", "grep", "bash", "read_history"]
  const tool = (name) => ({ name, description: name, parameters: { type: "object" }, execute: async () => "ok" })
  return {
    getCurrentTimeTool: tool("get_current_time"),
    processTool: tool("process"),
    timerTool: tool("timer"),
    lsTool: tool("ls"),
    readTool: tool("read"),
    grepTool: tool("grep"),
    bashTool: tool("bash"),
    readHistoryTool: tool("read_history"),
    toOpenAISchema: (item) => ({ type: "function", function: { name: item.name, description: item.description, parameters: item.parameters } }),
  }
}

const warnLog = () => {
  const warns = []
  return { warns, log: { warn: (event, info) => warns.push({ event, info }), info: () => {}, error: () => {} } }
}

// ── T1 迁移 v24 ─────────────────────────────────────────────────────────────

test("T1 迁移 v24：空库直落 24 ∥ v23 升 24 ∥ 幂等 ∥ 列面 + name 唯一 + transport 枚举 ∥ 存量审计保形 + 两索引 ∥ mcp_event 可写", () => {
  const fresh = DB.openDatabase(":memory:")
  assert.equal(DB.readVersion(fresh), 24)
  assert.equal(DB.SCHEMA_VERSION, 24)
  assert.deepEqual(
    fresh.prepare("PRAGMA table_info(mcp_servers)").all().map((row) => row.name),
    ["id", "name", "transport", "command", "args_json", "url", "ws_url", "secret_cipher", "enabled", "created_at", "updated_at"],
  )
  fresh.close()

  const db = DB.openDatabase(":memory:", { migrations: DB.MIGRATIONS.filter((step) => step.v <= 23) })
  assert.equal(DB.readVersion(db), 23)
  db.prepare("INSERT INTO audit_events (ts, type, actor_id, actor_name, target_id, target_name, detail) VALUES (7,'login_success',3,'Bob',9,'member:9','{\"k\":1}')").run()
  DB.migrate(db, { migrations: DB.MIGRATIONS })
  assert.equal(DB.readVersion(db), 24)
  const rows = db.prepare("SELECT * FROM audit_events").all()
  assert.equal(rows.length, 1)
  assert.deepEqual({ ...rows[0] }, { id: rows[0].id, ts: 7, type: "login_success", actor_id: 3, actor_name: "Bob", target_id: 9, target_name: "member:9", detail: '{"k":1}' }) // 存量行逐值保形
  assert.deepEqual(
    db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='audit_events' AND name LIKE 'idx_%' ORDER BY name").all().map((row) => row.name),
    ["idx_audit_ts", "idx_audit_type_ts"],
  )
  DB.migrate(db, { migrations: DB.MIGRATIONS }) // 幂等（再开零变）
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n, 1)

  const insert = "INSERT INTO mcp_servers (name, transport, command, created_at, updated_at) VALUES (?, ?, ?, 't', 't')"
  db.prepare(insert).run("a", "stdio", "cmd")
  db.prepare(insert).run("b", "http", null)
  db.prepare(insert).run("c", "ws", null) // 枚举逐值可写（stdio ∥ http ∥ ws）
  assert.throws(() => db.prepare(insert).run("a", "stdio", "x"), /UNIQUE/) // name 唯一
  assert.throws(() => db.prepare(insert).run("d", "ftp", "x"), /CHECK/) // 表外拒
  db.prepare("INSERT INTO audit_events (ts, type, actor_name) VALUES (1,'mcp_event','Alice')").run() // 十七型可写
  assert.throws(() => db.prepare("INSERT INTO audit_events (ts, type, actor_name) VALUES (1,'bogus_event','Alice')").run(), /CHECK/)
  db.close()
})

// ── T2 静态腿 ───────────────────────────────────────────────────────────────

test("T2 静态腿：node --check 全改档 ∥ 新档 ≤500 ∥ 全改档 <800 ∥ TRIMMED_FACES 零 mcp ∥ chat 装配含 MCP 面 ∥ bin 接线", () => {
  const touched = [
    "src/mcp/store.mjs",
    "src/mcp/face.mjs",
    "src/mcp/routes.mjs",
    "src/agent/chat.mjs",
    "src/agent/run.mjs",
    "src/store/migrations.mjs",
    "src/accounts/audit.mjs",
    "bin/thincoder-server.mjs",
  ]
  const fresh = ["src/mcp/store.mjs", "src/mcp/face.mjs", "src/mcp/routes.mjs"]
  for (const rel of touched) {
    const abs = join(SERVER, rel)
    const check = spawnSync(process.execPath, ["--check", abs], { encoding: "utf8" })
    assert.equal(check.status, 0, `${rel} node --check 失败：${check.stderr}`)
    const lines = contentLines(readFileSync(abs, "utf8"))
    assert.ok(lines < 800, `${rel} 越 800 硬限：${lines} 行`)
    if (fresh.includes(rel)) assert.ok(lines <= 500, `${rel} 越 500 软线：${lines} 行`)
  }
  assert.equal(RUN.TRIMMED_FACES.includes("mcp"), false) // 解裁达成（源扫腿）
  assert.ok(RUN.TRIMMED_FACES.includes("team_ledger")) // 余族仍在（零误删）
  assert.match(readFileSync(join(SERVER, "src/agent/chat.mjs"), "utf8"), /createMcpToolFace/) // chat 面装配含 MCP 面
  const bin = readFileSync(join(SERVER, "bin/thincoder-server.mjs"), "utf8")
  assert.match(bin, /registerMcpRoutes/) // 路由挂载
  assert.match(bin, /closeMcpConnections/) // 停机收尾
  assert.match(readFileSync(join(SERVER, "src/accounts/audit.mjs"), "utf8"), /"mcp_event"/)
})

// ── T3 N1 chat 一轮 ─────────────────────────────────────────────────────────

test("T3 N1 chat 一轮：MCP 工具在场 ∥ call/result 帧逐值 ∥ chat_call 行 ∥ 结果 ≤4000 落库 ∥ 预算计数 ∥ ctx.signal 透传", async (t) => {
  const w = world(t)
  await w.call("POST", "/api/admin/mcp", { name: "web", transport: "stdio", command: "npx", args: ["-y", "pkg"] })
  const chat = CHAT.createChat(w.db, { model: "fake/fake-model", createdBy: w.admin.id })
  const executed = []
  const coreTools = [
    { name: "web_search", description: "搜索", parameters: { type: "object" }, _mcpName: "web", execute: async (args, ctx) => { executed.push({ name: "web_search", args, signal: ctx?.signal ?? null }); return "搜索结果：ThinCoder" } },
    { name: "web_fetch", description: "抓取", parameters: { type: "object" }, _mcpName: "web", execute: async (args) => { executed.push({ name: "web_fetch", args }); return "F".repeat(4600) } },
  ]
  const connectCalls = []
  const scripted = scriptedChat([
    { toolCalls: [{ id: "c1", name: "web_search", arguments: JSON.stringify({ q: "x" }) }, { id: "c2", name: "web_fetch", arguments: "{}" }] },
    { content: "办完了" },
  ])
  const frames = []
  const { warns, log } = warnLog()
  const result = await CHAT.runChatTurn({
    db: w.db,
    chatId: chat.id,
    content: "查一下",
    emit: (frame) => frames.push(frame),
    deps: { chat: scripted.chat, config: w.config, mcpConnectImpl: async (cfg) => { connectCalls.push(cfg); return coreTools } },
    log,
  })
  assert.equal(result.status, "succeeded")
  assert.equal(result.calls, 2) // 预算计数含本次（两调用）
  assert.equal(connectCalls.length, 1)
  assert.deepEqual(connectCalls[0], { name: "web", command: "npx", args: ["-y", "pkg"] }) // 核 config 形（清单行映射）
  assert.equal(warns.some((item) => item.event === "mcp_connect_failed"), false)
  // 工具在场（模型所见 schemas——名 = `{server}_{tool}`）
  const names = scripted.state.calls[0].tools.map((schema) => schema.function.name)
  assert.ok(names.includes("web_search") && names.includes("web_fetch"))
  // 帧序与逐值（文本面路由——非 JSON 壳；结果摘要人话）
  assert.deepEqual(frames.map((frame) => frame.type), ["turn", "call", "result", "call", "result", "turn", "end"])
  const callFrame = frames.find((frame) => frame.type === "call")
  assert.equal(callFrame.name, "web_search")
  const resultFrame = frames.find((frame) => frame.type === "result")
  assert.equal(resultFrame.ok, true)
  assert.ok(resultFrame.summary.includes("web"))
  assert.deepEqual({ status: frames.at(-1).status, calls: frames.at(-1).calls }, { status: "succeeded", calls: 2 })
  // 结果落库（文本原文 ∥ ≤4000）
  const toolRows = w.db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? AND role = 'tool' ORDER BY seq").all(chat.id)
  assert.equal(toolRows.length, 2)
  assert.equal(toolRows[0].content, "搜索结果：ThinCoder")
  assert.equal(JSON.parse(toolRows[0].data_json).name, "web_search")
  assert.ok(toolRows[1].content.length <= 4000)
  assert.ok(toolRows[1].content.includes("（截断——实长 4600）"))
  // `ctx.signal` 透传核件（中止面）
  assert.ok(executed[0].signal !== null && typeof executed[0].signal.aborted === "boolean")
  assert.deepEqual(executed[1].args, {})
  // 逐调用 `chat_call` 行（tool = 挂载名 ∥ subject = 服务器名）
  const calls = auditRows(w.db, "agent_event").filter((row) => row.kind === "chat_call")
  assert.equal(calls.length, 2)
  assert.equal(calls[0].tool, "web_search")
  assert.equal(calls[0].subject, "web")
  assert.equal(calls[0].resultCode, 0)
  assert.equal(calls[0].truncated, false)
  assert.equal(calls[1].tool, "web_fetch")
  assert.equal(calls[1].subject, "web")
  assert.equal(calls[1].truncated, true)
})

// ── T4 N2 清单流 ────────────────────────────────────────────────────────────

test("T4 N2 清单流：POST⇒GET⇒PATCH⇒GET⇒DELETE⇒GET ∥ 行逐值零秘密 ∥ 停用/删除 ⇒ 会话关闭（靶含目标件）∥ 停用后工具面移除 ∥ mcp_event 三 kind 逐值", async (t) => {
  const removeCalls = []
  const w = world(t, { deps: { mcpRemoveImpl: (target, name) => { removeCalls.push({ name, tools: target.tools.map((item) => item.name) }) } } })
  const created = await w.call("POST", "/api/admin/mcp", { name: "web", transport: "stdio", command: "npx", args: ["-y", "pkg"], env: { API_KEY: "secret-value-1" }, token: "secret-token-1" })
  assert.deepEqual(created.json(), { id: 1 })
  const second = await w.call("POST", "/api/admin/mcp", { name: "api", transport: "http", url: "http://127.0.0.1:9/mcp", token: "secret-token-2" })
  assert.deepEqual(second.json(), { id: 2 })

  // GET（库序——行形逐键 ∥ 零秘密）
  const first = await w.call("GET", "/api/admin/mcp")
  const rows = first.json().servers
  assert.deepEqual(Object.keys(rows[0]).sort(), ["createdAt", "enabled", "hasSecrets", "id", "name", "target", "transport", "updatedAt"])
  assert.deepEqual(rows.map((row) => [row.id, row.name, row.transport, row.target, row.enabled, row.hasSecrets]), [
    [1, "web", "stdio", "npx", true, true],
    [2, "api", "http", "http://127.0.0.1:9/mcp", true, true],
  ])
  assert.equal(first.text.includes("secret-value-1") || first.text.includes("secret-token-1") || first.text.includes("secret-token-2"), false)
  const stored = w.db.prepare("SELECT * FROM mcp_servers WHERE id = 1").get()
  assert.ok(typeof stored.secret_cipher === "string" && stored.secret_cipher.includes("secret-value-1") === false) // 密文 ≠ 明文

  // 工具面装配（两服务器皆启用 ⇒ 逐行连接——关闭靶由此登记）
  const connects = []
  const connectImpl = async (cfg) => {
    connects.push(cfg.name)
    return [{ name: `${cfg.name}_t`, description: "d", parameters: { type: "object" }, _mcpName: cfg.name, execute: async () => "x" }]
  }
  const face1 = await MCP_FACE.createMcpToolFace({ db: w.db, deps: { config: w.config, mcpConnectImpl: connectImpl }, reservedNames: [] })
  assert.deepEqual(connects, ["web", "api"])
  assert.deepEqual([...face1.names].sort(), ["api_t", "web_t"])

  // PATCH 停用（`{ enabled:false }`——走本端点）⇒ 关闭该服务器会话（靶 = 该服务器件表——先取后清回归断言）
  assert.deepEqual((await w.call("PATCH", "/api/admin/mcp/2", { enabled: false })).json(), { ok: true })
  assert.deepEqual(removeCalls, [{ name: "api", tools: ["api_t"] }])
  const after = (await w.call("GET", "/api/admin/mcp")).json().servers
  assert.equal(after[1].enabled, false)
  assert.equal(after[1].hasSecrets, true) // 秘密零触

  // 停用后下回合工具面不含该服务器件（逐回合读 enabled 行）
  const face2 = await MCP_FACE.createMcpToolFace({ db: w.db, deps: { config: w.config, mcpConnectImpl: connectImpl }, reservedNames: [] })
  assert.deepEqual(connects, ["web", "api", "web"])
  assert.deepEqual(face2.names, ["web_t"])

  // DELETE（硬删 + 会话关闭）⇒ GET 空
  assert.deepEqual((await w.call("DELETE", "/api/admin/mcp/1")).json(), { ok: true })
  assert.deepEqual(removeCalls, [{ name: "api", tools: ["api_t"] }, { name: "web", tools: ["web_t"] }])
  assert.deepEqual((await w.call("DELETE", "/api/admin/mcp/2")).json(), { ok: true }) // 行已停用且会话已关 ⇒ 关闭靶空（零动作）
  assert.equal(removeCalls.length, 2)
  assert.deepEqual((await w.call("GET", "/api/admin/mcp")).json(), { servers: [] })
  await expectError(w.call("DELETE", "/api/admin/mcp/1"), { status: 404, match: /不存在/ })
  await expectError(w.call("PATCH", "/api/admin/mcp/1", { enabled: true }), { status: 404, match: /不存在/ })

  // `mcp_event` 三 kind 逐值（成事才落 ∥ 零秘密 ∥ actor 名快照 ∥ target 空）
  const events = auditRows(w.db, "mcp_event")
  assert.deepEqual(events.map((row) => row.kind), ["server_add", "server_add", "server_update", "server_remove", "server_remove"])
  assert.deepEqual(events[0], { kind: "server_add", id: 1, name: "web", transport: "stdio", actor: "Alice", target: "" })
  assert.deepEqual(events[1], { kind: "server_add", id: 2, name: "api", transport: "http", actor: "Alice", target: "" })
  assert.deepEqual(events[2], { kind: "server_update", id: 2, name: "api", keys: ["enabled"], actor: "Alice", target: "" })
  assert.deepEqual(events[3], { kind: "server_remove", id: 1, name: "web", actor: "Alice", target: "" })
  assert.deepEqual(events[4], { kind: "server_remove", id: 2, name: "api", actor: "Alice", target: "" })
  assert.equal(JSON.stringify(events).includes("secret-"), false) // 值永不入
})

// ── T5 N3 探活两径 ──────────────────────────────────────────────────────────

test("T5 N3 探活两径：行内 {id} 回落库内行 ∥ 草稿全量 ∥ 库零变 ∥ 核 _sessions 零增", async (t) => {
  const probeCalls = []
  const w = world(t, { deps: { mcpProbeImpl: async (config) => { probeCalls.push(config); return { ok: true, toolCount: 7, latencyMs: 42 } } } })
  await w.call("POST", "/api/admin/mcp", { name: "web", transport: "stdio", command: "npx", args: ["-y", "pkg"], env: { K: "v" } })
  const before = w.db.prepare("SELECT * FROM mcp_servers ORDER BY id").all()
  const sessionsBefore = CORE_MCP._sessions.size

  // 行内（体 `{id}`——缺席字段（含非秘密）一律回落库内行）
  const inline = await w.call("POST", "/api/admin/mcp/probe", { id: 1 })
  assert.deepEqual(inline.json(), { ok: true, toolCount: 7, latencyMs: 42 })
  assert.deepEqual(probeCalls[0], { name: "web", command: "npx", args: ["-y", "pkg"], env: { K: "v" } })

  // 新建草稿（全量——无 id；transport 必填 + 本传输必填）
  const draft = await w.call("POST", "/api/admin/mcp/probe", { name: "draft", transport: "ws", wsUrl: "ws://127.0.0.1:9/mcp", headers: { A: "b" }, token: "t" })
  assert.equal(draft.json().ok, true)
  assert.deepEqual(probeCalls[1], { name: "draft", wsUrl: "ws://127.0.0.1:9/mcp", headers: { A: "b" }, token: "t" })

  // 零副作用（库零变 ∥ 核 `_sessions` 零增）
  assert.deepEqual(w.db.prepare("SELECT * FROM mcp_servers ORDER BY id").all(), before)
  assert.equal(CORE_MCP._sessions.size, sessionsBefore)

  // 形不可解 ⇒ 400 ∥ 行缺 ⇒ 404
  await expectError(w.call("POST", "/api/admin/mcp/probe", { transport: "stdio" }), { status: 400, match: /command/ })
  await expectError(w.call("POST", "/api/admin/mcp/probe", { id: 1, transport: "http" }), { status: 400, match: /url 必填/ })
  await expectError(w.call("POST", "/api/admin/mcp/probe", { id: 999 }), { status: 404, match: /不存在/ })

  // 探活失败 ⇒ 200 自含（`ok:false`；沿 `proxy/test` 口径）
  const failing = world(t, { deps: { mcpProbeImpl: async () => ({ ok: false, error: "连接超时" }) } })
  await failing.call("POST", "/api/admin/mcp", { name: "down", transport: "stdio", command: "x" })
  const failed = await failing.call("POST", "/api/admin/mcp/probe", { id: 1 })
  assert.equal(failed.status, 200)
  assert.deepEqual(failed.json(), { ok: false, error: "连接超时" })
})

// ── T6 B1 冷却 ──────────────────────────────────────────────────────────────

test("T6 B1 冷却：首回合跳过 + 日志 ∥ 窗内零尝试 ∥ 窗满重试 ∥ 探活成功清冷却", async (t) => {
  const w = world(t, { deps: { mcpProbeImpl: async () => ({ ok: true, toolCount: 1, latencyMs: 1 }) } })
  await w.call("POST", "/api/admin/mcp", { name: "dead", transport: "stdio", command: "nope" })
  let clock = 1_000_000
  let attempts = 0
  const { warns, log } = warnLog()
  const deps = { mcpConnectImpl: async () => { attempts += 1; throw new Error("boom") }, config: w.config }
  const build = () => MCP_FACE.createMcpToolFace({ db: w.db, deps, log, now: () => clock, reservedNames: [] })

  assert.equal(await build(), null) // 首回合：建连失败 ⇒ 跳过（面空）
  assert.equal(attempts, 1)
  assert.equal(warns.filter((item) => item.event === "mcp_connect_failed").length, 1)
  assert.equal(await build(), null) // 冷却窗内：零连接尝试
  assert.equal(attempts, 1)

  const probed = await w.call("POST", "/api/admin/mcp/probe", { id: 1 }) // 探活成功 ⇒ 清冷却
  assert.equal(probed.json().ok, true)
  await build()
  assert.equal(attempts, 2) // 冷却已清 ⇒ 再试（失败 ⇒ 重新入冷）

  clock += MCP_FACE.MCP_COOLDOWN_MS + 1 // 窗满重试
  await build()
  assert.equal(attempts, 3)
})

// ── T7 B2 名碰撞 ∥ 空清单 ───────────────────────────────────────────────────

test("T7 B2 名碰撞：静态面件不挂 ∥ 服务器×服务器同形（先者留存）∥ 空清单 = 既有 16 件逐字", async (t) => {
  const w = world(t)
  await w.call("POST", "/api/admin/mcp", { name: "web", transport: "stdio", command: "a" })
  await w.call("POST", "/api/admin/mcp", { name: "search", transport: "stdio", command: "b" })
  const { warns, log } = warnLog()
  const fakeTool = (name, tag) => ({ name, description: "d", parameters: { type: "object" }, _mcpName: tag, execute: async () => tag })
  const serverTools = {
    web: [fakeTool("web_search", "web")],
    search: [fakeTool("web_search", "search")], // sanitize 同形（两服务器）——后到者不挂
  }
  const face = await MCP_FACE.createMcpToolFace({ db: w.db, deps: { config: w.config, mcpConnectImpl: async (cfg) => serverTools[cfg.name] }, log, now: () => 1, reservedNames: [] })
  assert.deepEqual(face.names, ["web_search"]) // 先者留存（单件）
  assert.equal((await face.invoke("web_search", {}, {})).subject, "web")
  assert.equal(warns.filter((item) => item.event === "mcp_tool_name_collision").length, 1)

  // 撞静态面（reservedNames = 管理 ∥ 环境名集）——该件不挂，其余照常
  const face2 = await MCP_FACE.createMcpToolFace({
    db: w.db,
    deps: { config: w.config, mcpConnectImpl: async () => [fakeTool("bash", "web"), fakeTool("web_ok", "web")] },
    log,
    now: () => 1,
    reservedNames: ["bash", "members"],
  })
  assert.deepEqual(face2.names, ["web_ok"]) // `bash` 后到者不挂；`web_ok` 照常
  assert.equal(warns.some((item) => item.info?.tool === "bash"), true)

  // 空清单 ⇒ MCP 面 = 空面（零连接）；chat 工具面逐字 = 既有 16 件（管理八 + 环境八）
  w.db.prepare("DELETE FROM mcp_servers").run()
  const emptyConnects = []
  assert.equal(await MCP_FACE.createMcpToolFace({ db: w.db, deps: { mcpConnectImpl: async () => { emptyConnects.push(1); return [] } } }), null)
  assert.equal(emptyConnects.length, 0)
  const chat = CHAT.createChat(w.db, { model: "fake/fake-model", createdBy: w.admin.id })
  const scripted = scriptedChat([{ content: "好" }])
  const result = await CHAT.runChatTurn({ db: w.db, chatId: chat.id, content: "在吗", emit: null, deps: { chat: scripted.chat, coreTools: fakeCoreTools(), config: w.config } })
  assert.equal(result.status, "succeeded")
  assert.deepEqual(scripted.state.calls[0].tools.map((schema) => schema.function.name), [
    "members", "providers", "models", "usage", "audit", "runners", "docker", "exec",
    "get_current_time", "process", "timer", "ls", "read", "grep", "bash", "read_history",
  ])
  // 模块级状态收尾（关闭靶 ∥ 冷却 = 进程级——用例间不泄漏；T10 停机收尾腿的干净前提）
  MCP_FACE.closeMcpConnections({ deps: { mcpCloseImpl: () => {} } })
})

// ── T8 E1 形非法五形 ∥ B3 附腿 ─────────────────────────────────────────────

test("T8 E1 形非法五形（400 人话 + 库零变）∥ B3 附腿（缺席 = 不变 ∥ 传输切换缺必填 ∥ 切换连带清列）", async (t) => {
  const w = world(t)
  const count = () => w.db.prepare("SELECT COUNT(*) AS n FROM mcp_servers").get().n
  await expectError(w.call("POST", "/api/admin/mcp", { name: "   ", transport: "stdio", command: "x" }), { status: 400, match: /不可为空/ })
  await w.call("POST", "/api/admin/mcp", { name: "dup", transport: "stdio", command: "x" })
  await expectError(w.call("POST", "/api/admin/mcp", { name: "dup", transport: "stdio", command: "y" }), { status: 400, match: /已存在/ })
  await expectError(w.call("POST", "/api/admin/mcp", { name: "t", transport: "ftp" }), { status: 400, match: /传输方式非法/ })
  await expectError(w.call("POST", "/api/admin/mcp", { name: "t", transport: "stdio" }), { status: 400, match: /command/ })
  await expectError(w.call("POST", "/api/admin/mcp", { name: "t", transport: "http" }), { status: 400, match: /url/ })
  await expectError(w.call("POST", "/api/admin/mcp", { name: "t", transport: "ws" }), { status: 400, match: /wsUrl/ })
  await expectError(w.call("POST", "/api/admin/mcp", { name: "t", transport: "stdio", command: "x", args: "not-array" }), { status: 400, match: /字符串数组/ })
  await expectError(w.call("POST", "/api/admin/mcp", { name: "t", transport: "stdio", command: "x", args: ["ok", 7] }), { status: 400, match: /字符串数组/ })
  await expectError(w.call("POST", "/api/admin/mcp", { name: "t", transport: "stdio", command: "x", enabled: "yes" }), { status: 400, match: /enabled/ })
  assert.equal(count(), 1) // 仅 `dup` 行落库——逐形库零变

  // B3 附腿：传输切换缺必填 ⇒ 400 库零变
  await expectError(w.call("PATCH", "/api/admin/mcp/1", { transport: "http" }), { status: 400, match: /url 必填/ })
  assert.equal(w.db.prepare("SELECT transport FROM mcp_servers WHERE id = 1").get().transport, "stdio")
  // 缺席 = 不变（同传输改 `command`——余列逐值）
  const before = w.db.prepare("SELECT * FROM mcp_servers WHERE id = 1").get()
  await w.call("PATCH", "/api/admin/mcp/1", { command: "npx" })
  const after = w.db.prepare("SELECT * FROM mcp_servers WHERE id = 1").get()
  assert.deepEqual(
    { name: after.name, transport: after.transport, command: after.command, args_json: after.args_json, enabled: after.enabled, secret_cipher: after.secret_cipher },
    { name: before.name, transport: before.transport, command: "npx", args_json: before.args_json, enabled: before.enabled, secret_cipher: before.secret_cipher },
  )
  // 显式 `null` = 清（args 清空）；`args` 缺席 = 不变已由上行覆盖
  const withArgs = await w.call("PATCH", "/api/admin/mcp/1", { args: ["--flag"] })
  assert.deepEqual(withArgs.json(), { ok: true })
  assert.equal(w.db.prepare("SELECT args_json FROM mcp_servers WHERE id = 1").get().args_json, '["--flag"]')
  await w.call("PATCH", "/api/admin/mcp/1", { args: null })
  assert.equal(w.db.prepare("SELECT args_json FROM mcp_servers WHERE id = 1").get().args_json, null)
  // 传输切换带必填 ⇒ 成（stdio ⇒ http；旧传输列连带清）
  await w.call("PATCH", "/api/admin/mcp/1", { transport: "http", url: "http://127.0.0.1:9/mcp" })
  const switched = w.db.prepare("SELECT * FROM mcp_servers WHERE id = 1").get()
  assert.deepEqual({ transport: switched.transport, url: switched.url, command: switched.command, args_json: switched.args_json }, { transport: "http", url: "http://127.0.0.1:9/mcp", command: null, args_json: null })
  // 审计 `keys` 逐值（变更键名——值永不入）
  const updates = auditRows(w.db, "mcp_event").filter((row) => row.kind === "server_update")
  // `keys` = 变更键名（新旧值比对——传输切换连带清列随变；未变键不入）
  assert.deepEqual(updates.map((row) => row.keys), [["command"], ["args"], ["args"], ["transport", "command", "url"]])
})

// ── T9 N4 秘密编辑语义 ──────────────────────────────────────────────────────

test("T9 N4 编辑面秘密语义：留空（空串/空对象）= 不变（密文逐值）∥ 显式 null = 清 ∥ 对象位空串 = 类型错", async (t) => {
  const w = world(t)
  await w.call("POST", "/api/admin/mcp", { name: "api", transport: "http", url: "http://127.0.0.1:9/mcp", token: "secret-token-2", headers: { "X-K": "v" }, env: { E: "1" } })
  const cipherOf = () => w.db.prepare("SELECT secret_cipher FROM mcp_servers WHERE id = 1").get().secret_cipher
  const rowOf = async () => (await w.call("GET", "/api/admin/mcp")).json().servers[0]
  const before = cipherOf()
  assert.ok(typeof before === "string")
  assert.equal((await rowOf()).hasSecrets, true)

  // 留空 = 不变（控制台「留空 = 不变」口径——空串/空对象非清空；密文列逐值不动）
  assert.deepEqual((await w.call("PATCH", "/api/admin/mcp/1", { url: "http://127.0.0.1:8/mcp", token: "", headers: {} })).json(), { ok: true })
  assert.equal(cipherOf(), before)
  assert.equal((await rowOf()).hasSecrets, true)
  assert.equal((await rowOf()).target, "http://127.0.0.1:8/mcp")
  assert.deepEqual(auditRows(w.db, "mcp_event").filter((row) => row.kind === "server_update").map((row) => row.keys), [["url"]]) // 秘密面零变更（值永不入）

  // 对象位空串 = 类型错（400 库零变——既非「清」亦非「不变」）
  await expectError(w.call("PATCH", "/api/admin/mcp/1", { env: "" }), { status: 400, match: /env/ })
  assert.equal(cipherOf(), before)

  // 显式 `null` = 清（逐键——headers 清单后 token/env 仍在）
  await w.call("PATCH", "/api/admin/mcp/1", { headers: null })
  assert.equal((await rowOf()).hasSecrets, true)
  await w.call("PATCH", "/api/admin/mcp/1", { token: null, env: null })
  assert.equal((await rowOf()).hasSecrets, false)
  assert.equal(cipherOf(), null)
})

// ── T10 N5 停机收尾 ∥ 零工具边界 ────────────────────────────────────────────

test("T10 N5 停机收尾：closeMcpConnections 靶含各服务器件（替身断）∥ 零工具服务器 = 关闭靶空（诚实 false，边界披露）", async (t) => {
  const closed = []
  const w = world(t, { deps: { mcpRemoveImpl: () => {} } })
  await w.call("POST", "/api/admin/mcp", { name: "web", transport: "stdio", command: "npx" })
  await w.call("POST", "/api/admin/mcp", { name: "zero", transport: "stdio", command: "noop" })
  const gear = (name, tag) => ({ name, description: "d", parameters: { type: "object" }, _mcpName: tag, execute: async () => "x" })
  const face = await MCP_FACE.createMcpToolFace({
    db: w.db,
    deps: { config: w.config, mcpConnectImpl: async (cfg) => (cfg.name === "zero" ? [] : [gear("web_t", "web")]) },
    reservedNames: [],
  })
  assert.deepEqual(face.names, ["web_t"]) // 零工具服务器 ⇒ 零件（面不含；核会话已建——关闭靶空）
  assert.equal(await MCP_FACE.closeMcpServer("zero"), false) // 诚实返回（非「已关」）——路线 DELETE 亦零炸
  assert.equal((await w.call("DELETE", "/api/admin/mcp/2")).status, 200)

  // N5：停机收尾 ⇒ 核 `closeAllMcp`（替身断——靶 = 各服务器件表）
  const out = MCP_FACE.closeMcpConnections({ deps: { mcpCloseImpl: (target) => closed.push(target.tools.map((item) => item.name)) } })
  assert.equal(out, true)
  assert.deepEqual(closed, [["web_t"]])
})

