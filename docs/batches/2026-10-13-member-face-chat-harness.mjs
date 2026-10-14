/**
 * 2026-10-13-member-face-chat-harness.mjs — 单元测试档的**共用夹具与假件**（member-face-chat 批 · 台账 #1215；
 * 服务端面舱）——与 `2026-10-13-member-face-chat.test.mjs` 同目录随批次档保存（开发期工具；不进 `test/` 树、不入门）。
 *
 * 为何单列：测试档原为单件（超 800 行硬限）——夹具与用例分离后两件各守软线；夹具只被本批测试档消费，
 * 语义 = 「假 req/res + 假盒桩 + 假引擎/主机 + 世界夹具」；真件面（src）零改。
 * 复用注意：`world(t)` 落临时目录真库（`t.after` 收口）∥ `face()` 每调用一枚独立 relay（`t.after` 关连接）。
 */
import assert from "node:assert/strict"
import { Readable } from "node:stream"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = join(HERE, "..", "..", "thincoder-server")
const load = (rel) => import(pathToFileURL(join(SERVER_ROOT, rel)).href)

const { openDatabase } = await load("src/store/db.mjs")
const { createMemberRelay } = await load("src/agent/member-relay.mjs")
const { registerMemberRoutes } = await load("src/agent/member-routes.mjs")
const { registerBoxRoutes } = await load("src/agent/box-routes.mjs")
const { ERROR_CODES, HttpError } = await load("src/gateway/errors.mjs")
const { issueWorkspaceKey } = await load("src/sandbox/credentials.mjs")

// ── 假件（假 req/res + 假盒桩 + 世界夹具）──────────────────────────────────────

/** 假响应：JSON 面（`chunks` 拼接）与流面（`chunks` 逐块）两用；`onWrite` = 盒桩联动钩。 */
export function fakeRes({ onWrite = null } = {}) {
  const out = { status: null, headers: null, chunks: [], ended: false, text: "" }
  const listeners = new Map()
  const fire = (event) => {
    for (const cb of listeners.get(event) ?? []) cb()
  }
  const res = {
    headersSent: false,
    writableEnded: false,
    destroyed: false,
    writeHead(status, headers) {
      out.status = status
      out.headers = headers ?? null
      res.headersSent = true
      return res
    },
    write(chunk) {
      out.chunks.push(String(chunk))
      onWrite?.(String(chunk))
      return true
    },
    end(chunk) {
      if (chunk !== undefined) out.chunks.push(String(chunk))
      out.ended = true
      out.text = out.chunks.join("")
      res.writableEnded = true
      fire("close")
      return res
    },
    destroy() {
      res.destroyed = true
    },
    on(event, cb) {
      listeners.set(event, [...(listeners.get(event) ?? []), cb])
      return res
    },
    off(event, cb) {
      listeners.set(event, (listeners.get(event) ?? []).filter((fn) => fn !== cb))
      return res
    },
  }
  out.json = () => JSON.parse(out.text)
  return { res, out }
}

/** 假请求（体 = Buffer 块数组；`Readable` 保 `data`/`end`/`off`/`resume` 面）。 */
export function fakeReq(chunks = [], { cookie = null, authorization = null, contentType = "application/json" } = {}) {
  const stream = Readable.from(chunks)
  stream.headers = {
    cookie: cookie === null ? "" : `tc_session=${cookie}`,
    "content-type": contentType,
    ...(authorization === null ? {} : { authorization }),
  }
  return stream
}

export const jsonReq = (body, opts = {}) => fakeReq(body === undefined ? [] : [Buffer.from(JSON.stringify(body), "utf8")], opts)

export function makeRoutes() {
  const handlers = new Map()
  return { handlers, add: (method, path, handler) => handlers.set(`${method} ${path}`, handler) }
}

/** 路由匹配（注册序——首个命中者胜，同真 router `createRouteTable.resolve`；字面路径 ⇒ 处理件 + 逐段参数）。 */
export function matchRoute(routes, method, path) {
  const segments = String(path).split("/").filter((part) => part !== "")
  for (const [key, handler] of routes.handlers) {
    const split = key.indexOf(" ")
    if (key.slice(0, split) !== method) continue
    const parts = key.slice(split + 1).split("/").filter((part) => part !== "")
    if (parts.length !== segments.length) continue
    const params = {}
    let ok = true
    for (let index = 0; index < parts.length; index += 1) {
      if (parts[index].startsWith(":")) params[parts[index].slice(1)] = segments[index]
      else if (parts[index] !== segments[index]) {
        ok = false
        break
      }
    }
    if (ok) return { handler, params }
  }
  return null
}

export async function invoke(routes, method, path, { req, res }) {
  const hit = matchRoute(routes, method, path)
  assert.ok(hit, `路由未注册：${method} ${path}`)
  await hit.handler(req, res, { params: hit.params })
  return res
}

export const tick = async (n = 4) => {
  for (let index = 0; index < n; index += 1) await new Promise((resolve) => setTimeout(resolve, 0))
}

/** 条件等待（真实节拍类断言——轮询至条件成立或超时；缺省 2s 上限）。 */
export const waitFor = async (condition, timeoutMs = 2000) => {
  const started = Date.now()
  while (Date.now() - started < timeoutMs) {
    if (condition()) return true
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  return false
}

const unreachable = async () => {
  throw new Error("unreachable（测试桩：无网络）")
}

/** 世界夹具（临时目录真库 + 两成员 + 假时钟）。 */
export function world(t) {
  const dir = mkdtempSync(join(tmpdir(), "tc-member-"))
  const config = { db: join(dir, "gateway.db"), host: "127.0.0.1" }
  const db = openDatabase(config.db)
  const clock = { t: Date.now() }
  t.after(() => {
    db.close()
    rmSync(dir, { recursive: true, force: true })
  })
  const seed = (username, name) => {
    const info = db.prepare("INSERT INTO members (username, name, password_hash, role, created_at) VALUES (?, ?, 'x', 'user', '2026-01-01T00:00:00.000Z')").run(username, name)
    return db.prepare("SELECT * FROM members WHERE id = ?").get(Number(info.lastInsertRowid))
  }
  return { dir, config, db, clock, alice: seed("alice", "Alice"), bob: seed("bob", "Bob") }
}

/** 工作区夹具（真签发 key——盒鉴权腿）。 */
export function seedWorkspace(db, member, { name = "工作区 1", runnerId = null } = {}) {
  const key = issueWorkspaceKey(db, { ownerMemberId: member.id, workspaceName: name, now: Date.now() })
  const info = db
    .prepare(`INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, runner_id, limits_json, stop_reason, base_image, created_at)
      VALUES (?, ?, ?, ?, ?, '{}', NULL, NULL, '2026-01-01T00:00:00.000Z')`)
    .run(name, member.id, key.id, key.plain, runnerId)
  return { row: db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(Number(info.lastInsertRowid)), key: key.plain }
}

export function seedRunner(db, { name = "节点一", address = "127.0.0.1:2375", status = "active" } = {}) {
  const info = db
    .prepare(`INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at)
      VALUES (?, ?, ?, '{"apiVer":"1.44"}', '2026-01-01T00:00:00.000Z')`)
    .run(name, address, status)
  return db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(Number(info.lastInsertRowid))
}

export function seedProvider(db, { name = "openai", models = ["gpt-x", "gpt-y"] } = {}) {
  const info = db
    .prepare(`INSERT INTO providers (name, base_url, api_key, models_json, created_at, updated_at, settings_json, model_meta_json, proxy)
      VALUES (?, 'https://api.example.com/v1', 'sk-x', ?, 't', 't', '{}', '{}', '')`)
    .run(name, JSON.stringify(models))
  return db.prepare("SELECT * FROM providers WHERE id = ?").get(Number(info.lastInsertRowid))
}

/** 探活 fetch（节点 `/info` ⇒ 200）。 */
export function probeFetch({ fail = false } = {}) {
  return async () => {
    if (fail) throw new Error("节点不可达")
    return { ok: true, status: 200, json: async () => ({ ServerVersion: "29.1.3" }), text: async () => "", arrayBuffer: async () => new ArrayBuffer(0) }
  }
}

/** 假 Docker 客户端（`clientForRunner` 面——链级动作）。 */
export function fakeDocker({ containers = [], networks = new Map(), calls = [] } = {}) {
  const nameOf = (item) => String(item?.Names?.[0] ?? "").replace(/^\//, "")
  const find = (ref) => containers.find((item) => item.Id === ref || nameOf(item) === ref) ?? null
  return {
    calls,
    boxes: containers, // 预置/读回容器行（用例侧直推）
    async containers() {
      calls.push({ op: "containers" })
      return { json: containers }
    },
    async containerState(ref) {
      const hit = find(ref)
      return { json: { State: { Running: hit?.State === "running" } }, state: { running: hit?.State === "running" } }
    },
    async createContainer(name, payload) {
      calls.push({ op: "createContainer", name, payload })
      const item = { Id: `cid-${containers.length + 1}`, Names: [`/${name}`], State: "created" }
      containers.push(item)
      return { json: { Id: item.Id } }
    },
    async startContainer(ref) {
      calls.push({ op: "startContainer", ref })
      const hit = find(ref)
      if (hit) hit.State = "running"
      return { json: {} }
    },
    async stopContainer(ref) {
      calls.push({ op: "stopContainer", ref })
      const hit = find(ref)
      if (hit) hit.State = "exited"
      return { json: {} }
    },
    async deleteContainer(ref) {
      calls.push({ op: "deleteContainer", ref })
      const index = containers.findIndex((item) => item.Id === ref || nameOf(item) === ref)
      if (index >= 0) containers.splice(index, 1)
      return { json: {} }
    },
    async inspectNetwork(name) {
      const hit = networks.get(name)
      if (!hit) throw Object.assign(new Error("no such network"), { status: 404 })
      return { json: hit }
    },
    async createNetwork(body) {
      calls.push({ op: "createNetwork", name: body?.Name })
      networks.set(body?.Name, { Name: body?.Name, Options: body?.Options, IPAM: { Config: [{ Subnet: "172.30.5.0/24" }] } })
      return { json: {} }
    },
    async deleteNetwork(name) {
      networks.delete(name)
      return { json: {} }
    },
  }
}

/** 假主机执行者（链级 `host.run`/`host.call`——只记调用）。 */
export function fakeHost(calls = []) {
  const record = (op) => async (runner, command) => {
    calls.push({ op, runnerId: runner?.id ?? null, command })
    return { text: "", code: 0 }
  }
  return {
    calls,
    run: record("host.run"),
    call: record("host.call"),
    execOf: () => async (command) => {
      calls.push({ op: "host.exec", command })
      return { text: "", code: 0 }
    },
  }
}

/** 面装配（成员面 + 盒面，共一 relay）。 */
export function face(worldRef, t, { relayOptions = {}, fetchImpl = null, deps = {} } = {}) {
  const routes = makeRoutes()
  const now = () => worldRef.clock.t
  const relay = createMemberRelay({ db: worldRef.db, log: null, now, ...relayOptions })
  registerMemberRoutes(routes, { db: worldRef.db, config: worldRef.config, log: null, relay, now, fetchImpl: fetchImpl ?? unreachable, requestImpl: null, deps })
  registerBoxRoutes(routes, { db: worldRef.db, config: worldRef.config, log: null, relay, now, deps })
  t.after(() => relay.closeAll())
  return { routes, relay }
}

/** 成员面调用（cookie ∥ Bearer；路径 = 字面形——参数由路由匹配逐段取）。 */
export async function meCall(routes, method, path, { cookie = null, bearer = null, body = undefined, contentType = "application/json" } = {}) {
  const { res, out } = fakeRes()
  const req = body === undefined && contentType === "application/json" ? fakeReq([], { cookie, authorization: bearer }) : jsonReq(body, { cookie, authorization: bearer, contentType })
  await invoke(routes, method, path, { req, res })
  return out
}

/** 盒面调用（JSON 体）。 */
export async function boxCall(routes, method, path, { key, body = undefined } = {}) {
  const { res, out } = fakeRes()
  await invoke(routes, method, path, { req: jsonReq(body, { authorization: `Bearer ${key}` }), res })
  return out
}

/** 盒上行回合流（NDJSON 块数组——跨块残行可测）。 */
export async function boxTurns(routes, key, sessionId, chunks) {
  const { res, out } = fakeRes()
  const body = chunks.map((chunk) => Buffer.from(typeof chunk === "string" ? chunk : `${JSON.stringify(chunk)}\n`, "utf8"))
  await invoke(routes, "POST", `/api/box/sessions/${sessionId}/turns`, { req: fakeReq(body, { authorization: `Bearer ${key}`, contentType: "application/x-ndjson" }), res })
  return out
}

/** 盒桩：SSE 下行连接 + 帧缓冲（`frames` = 解析后事件表）。 */
export function attachBox(routes, { workspace, key }) {
  const frames = []
  const state = { buffer: "" }
  const { res, out } = fakeRes({
    onWrite: (chunk) => {
      state.buffer += chunk
      let index
      while ((index = state.buffer.indexOf("\n\n")) >= 0) {
        const block = state.buffer.slice(0, index)
        state.buffer = state.buffer.slice(index + 2)
        const event = /^event: (.+)$/m.exec(block)?.[1] ?? null
        const data = JSON.parse(/^data: (.+)$/m.exec(block)?.[1] ?? "null")
        frames.push({ event, data })
      }
    },
  })
  const handler = routes.handlers.get("GET /api/box/events")
  assert.ok(handler, "盒 SSE 路由未注册")
  handler(fakeReq([], { authorization: `Bearer ${key}` }), res, { params: {} })
  return {
    frames,
    out,
    res,
    hello: () => frames.find((frame) => frame.event === "hello") ?? null,
    last: (event) => [...frames].reverse().find((frame) => frame.event === event) ?? null,
  }
}

/** 盒桩回呈（cmd ∥ pull ⇒ `commands/:cmdId/result`；run ⇒ 回合流）。 */
export async function boxAnswer(routes, box, { key, cmdId, state: resultState = "done", detail = null } = {}) {
  return boxCall(routes, "POST", `/api/box/commands/${cmdId}/result`, { key, body: { state: resultState, detail } })
}

/** HTTP 异常断言（码 + 状态 + 人话片段）。 */
export async function expectHttp(promise, { code, status, match = null } = {}) {
  try {
    await promise
  } catch (e) {
    assert.ok(e instanceof HttpError, `非 HttpError：${e?.message ?? e}`)
    assert.equal(e.code, code)
    assert.equal(ERROR_CODES[e.code].status, status ?? ERROR_CODES[e.code].status)
    if (match !== null) assert.match(e.message, match)
    return e
  }
  assert.fail(`未抛错（期望 ${code}）`)
}

export const auditRows = (db) => db.prepare("SELECT type, actor_name, target_name, detail FROM audit_events ORDER BY id").all().map((row) => ({ type: row.type, actor: row.actor_name, target: row.target_name, detail: JSON.parse(row.detail) }))
export const auditKinds = (db) => [...new Set(auditRows(db).map((row) => row.detail.kind))]
