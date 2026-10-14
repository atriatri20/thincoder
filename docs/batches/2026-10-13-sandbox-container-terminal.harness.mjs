/**
 * 2026-10-13-sandbox-container-terminal.harness.mjs — `sandbox-container-terminal` 批 · 服务端面测试夹具（批内件共享件；配合
 * `2026-10-13-sandbox-container-terminal.test.mjs`——主档 >500 软线 ⇒ 夹具外提，用例全量留在主档，零覆盖缩减）。
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存。运行 = `node --test docs/batches/2026-10-13-sandbox-container-terminal.test.mjs`（自 `thincoder/` 仓根）。
 *
 * 三件 = ① 裸 socket WS 客户端（手写帧——可注掩码/非法 opcode/超长声明/非 UTF-8/分片；`RawWs`）
 * ② 假 Docker 引擎（真 HTTP + 真 101 升级劫持（裸双工/回显/扣答闸）——真 fetch 链）
 * ③ 进程内应用（真库 + 账号面 + 沙盒面 + 终端 hub + `createGatewayServer` upgrade 接线）。
 * 注：升级 socket 不归 `server.closeAllConnections`（实测）——两服务皆自持 socket 集合、关闭时逐个 destroy。
 */
import assert from "node:assert/strict"
import { randomBytes } from "node:crypto"
import { existsSync } from "node:fs"
import { createServer } from "node:http"
import { connect } from "node:net"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const WS = await load("thincoder-server/src/gateway/ws.mjs")
const SANDBOX = await load("thincoder-server/src/sandbox/routes.mjs")
const REGISTRY = await load("thincoder-server/src/sandbox/registry.mjs")
const TERMINAL = await load("thincoder-server/src/sandbox/terminal-routes.mjs")
const EXEC = await load("thincoder-server/src/sandbox/docker-exec.mjs")
const DOCKER = await load("thincoder-server/src/sandbox/docker.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")

export { DB, CONFIG, SERVER, WS, SANDBOX, REGISTRY, TERMINAL, EXEC, DOCKER, MEMBERS, ACCOUNT_ROUTES, SESSION }

export const PASSWORD = "password-123"
export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
export const withTimeout = (promise, ms, label) =>
  Promise.race([promise, wait(ms).then(() => { throw new Error(`超时（${ms}ms）：${label}`) })])
export const countByte = (buffer, byte) => buffer.reduce((n, value) => n + (value === byte ? 1 : 0), 0)
/** 轮询至条件成立（正等待用——代固定 sleep，负载抖动不假红）。 */
export const waitUntil = async (predicate, timeoutMs = 2000, stepMs = 10) => {
  const deadline = Date.now() + timeoutMs
  while (Date.now() <= deadline) {
    if (predicate()) return true
    await wait(stepMs)
  }
  return false
}
export const safeJson = (payload) => {
  try { return JSON.parse(payload.toString("utf8")) } catch { return null }
}

/** 帧头（可声明任意长度而不带载荷——E63 超限腿；`key` 显式传入时掩码位与键一并写出）。 */
export function frameHeader(opcode, length, { fin = true, masked = true, key = null } = {}) {
  const head = [Buffer.from([(fin ? 0x80 : 0) | opcode])]
  if (length < 126) head.push(Buffer.from([(masked ? 0x80 : 0) | length]))
  else if (length <= 0xffff) {
    const part = Buffer.alloc(3)
    part[0] = (masked ? 0x80 : 0) | 126
    part.writeUInt16BE(length, 1)
    head.push(part)
  } else {
    const part = Buffer.alloc(9)
    part[0] = (masked ? 0x80 : 0) | 127
    part.writeBigUInt64BE(BigInt(length), 1)
    head.push(part)
  }
  if (masked) head.push(key ?? randomBytes(4))
  return Buffer.concat(head)
}

/** 客户端帧（掩码应用——默认掩码；`masked:false` = E63 未掩码腿；`fin:false` + opcode 0 = 分片腿）。 */
export function clientFrame(opcode, payload = Buffer.alloc(0), { fin = true, masked = true } = {}) {
  const body = Buffer.from(payload ?? "")
  const key = randomBytes(4)
  const header = frameHeader(opcode, body.length, { fin, masked, key })
  if (!masked) return Buffer.concat([header, body])
  const out = Buffer.from(body)
  for (let i = 0; i < out.length; i++) out[i] ^= key[i & 3]
  return Buffer.concat([header, out])
}

// ── ① 裸 socket WS 客户端（手写帧——可注掩码/非法 opcode/超长声明/非 UTF-8）─────────────

/** 客户端（服务端帧解码用 `ws.mjs` `decodeFrame`；等待 = `next(predicate)` / `waitJson(t)` / `waitClose()`）。 */
export class RawWs {
  constructor(socket) {
    this.socket = socket
    this.buffer = Buffer.alloc(0)
    this.queue = []
    this.waiters = []
    this.closeInfo = null
    this.closeWaiters = []
    this.handshakeDone = false
    this.autoPong = false
  }

  static async open({ port, path, cookie = null, origin = null, autoPong = false }) {
    const socket = connect(port, "127.0.0.1")
    const client = new RawWs(socket)
    client.autoPong = autoPong
    socket.on("data", (chunk) => client.feed(chunk))
    socket.on("error", () => {})
    socket.on("close", () => client.markClosed())
    await new Promise((resolve, reject) => { socket.once("connect", resolve); socket.once("error", reject) })
    const key = randomBytes(16).toString("base64")
    const lines = [
      `GET ${path} HTTP/1.1`,
      `Host: 127.0.0.1:${port}`,
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Key: ${key}`,
      "Sec-WebSocket-Version: 13",
      ...(cookie ? [`Cookie: ${cookie}`] : []),
      ...(origin ? [`Origin: ${origin}`] : []),
      "", "",
    ]
    socket.write(lines.join("\r\n"))
    client.key = key
    await client.readHandshake()
    return client
  }

  async readHandshake(timeoutMs = 3000) {
    const deadline = Date.now() + timeoutMs
    while (!this.buffer.includes("\r\n\r\n")) {
      if (Date.now() > deadline) throw new Error("握手响应超时")
      await wait(5)
    }
    const split = this.buffer.indexOf("\r\n\r\n")
    const head = this.buffer.subarray(0, split).toString("utf8")
    this.buffer = this.buffer.subarray(split + 4)
    const [statusLine, ...lines] = head.split("\r\n")
    this.status = Number(statusLine.split(" ")[1])
    this.headers = {}
    for (const line of lines) {
      const colon = line.indexOf(":")
      if (colon > 0) this.headers[line.slice(0, colon).trim().toLowerCase()] = line.slice(colon + 1).trim()
    }
    this.handshakeDone = this.status === 101 // 非 101（拒绝面）不回帧解析——响应体 JSON 原样留在 buffer
    if (this.handshakeDone) this.drain()
    return this
  }

  feed(chunk) {
    this.buffer = Buffer.concat([this.buffer, chunk])
    if (this.handshakeDone) this.drain()
  }

  markClosed() {
    this.closed = true
    if (!this.closeInfo) this.closeInfo = { code: 1006, reason: "" }
    for (const resolve of this.closeWaiters.splice(0)) resolve(this.closeInfo)
  }

  drain() {
    while (true) {
      const decoded = WS.decodeFrame(this.buffer)
      if (!decoded.ok) {
        if (decoded.needMore) return
        throw new Error(`服务端帧解不出：${decoded.reason}`)
      }
      this.buffer = this.buffer.subarray(decoded.size)
      const frame = { opcode: decoded.opcode, payload: decoded.payload }
      if (decoded.opcode === 0x8) {
        frame.code = decoded.payload.length >= 2 ? decoded.payload.readUInt16BE(0) : 1005
        frame.reason = decoded.payload.length > 2 ? decoded.payload.subarray(2).toString("utf8") : ""
        this.closeInfo = { code: frame.code, reason: frame.reason }
        for (const resolve of this.closeWaiters.splice(0)) resolve(this.closeInfo)
      }
      if (decoded.opcode === 0x9 && this.autoPong) this.socket.write(clientFrame(0xa, decoded.payload))
      let consumed = false
      const remaining = []
      for (const waiter of this.waiters) {
        if (!consumed && waiter(frame)) { consumed = true; continue }
        remaining.push(waiter)
      }
      this.waiters = remaining
      if (!consumed) this.queue.push(frame)
    }
  }

  next(predicate = null, { timeout = 4000, label = "帧" } = {}) {
    const match = (frame) => !predicate || predicate(frame)
    const index = this.queue.findIndex(match)
    if (index >= 0) return Promise.resolve(this.queue.splice(index, 1)[0])
    return withTimeout(
      new Promise((resolve) => {
        this.waiters.push((frame) => {
          if (!match(frame)) return false
          resolve(frame)
          return true
        })
      }),
      timeout,
      label,
    )
  }

  waitJson(t, options = {}) {
    return this.next((frame) => frame.opcode === 0x1 && safeJson(frame.payload)?.t === t, options).then((frame) => safeJson(frame.payload))
  }

  waitBinary(options = {}) {
    return this.next((frame) => frame.opcode === 0x2, options).then((frame) => frame.payload)
  }

  waitClose(timeout = 4000) {
    if (this.closeInfo) return Promise.resolve(this.closeInfo)
    return withTimeout(new Promise((resolve) => this.closeWaiters.push(resolve)), timeout, "close 帧")
  }

  sendText(text) { this.socket.write(clientFrame(0x1, Buffer.from(text, "utf8"))) }
  sendJson(value) { this.sendText(JSON.stringify(value)) }
  sendBinary(payload) { this.socket.write(clientFrame(0x2, payload)) }
  sendRaw(buffer) { this.socket.write(buffer) }
  close(code = 1000) { if (!this.socket.destroyed) this.socket.write(clientFrame(0x8, Buffer.from([code >> 8, code & 0xff]))) }
  destroy() { this.socket.destroy() }
}

// ── ② 假 Docker 引擎（真 HTTP——真 fetch 链 + 真 101 升级劫持；调用逐条在 `state`）────────

export async function startFakeDocker(opts = {}) {
  const version = { Version: "29.1.3", ApiVersion: "1.52", MinAPIVersion: "1.44", Os: "linux", Arch: "amd64" }
  const state = {
    containerJson: opts.containerJson ?? { State: { Status: "running", Running: true }, Config: { Env: ["PATH=/usr/bin"] } },
    execStatus: opts.execStatus ?? 201,
    execBodies: [],
    startBodies: [],
    resizeCalls: [],
    resizeFailures: opts.resizeFailures ?? 0,
    execIds: [],
    exitCode: opts.exitCode === undefined ? 7 : opts.exitCode,
  }
  if (opts.holdRead) state.readGate = new Promise((resolve) => { state.releaseRead = resolve })
  if (opts.holdStart) state.startGate = new Promise((resolve) => { state.releaseStart = resolve })
  const requests = []
  const pty = { records: [], echo: opts.echo !== false }
  const sockets = new Set()
  const readBody = (req) => new Promise((resolve) => {
    const chunks = []
    req.on("error", () => resolve(Buffer.concat(chunks).toString("utf8")))
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")))
  })
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://engine")
    const path = url.pathname.replace(/^\/v[\d.]+/, "") || "/"
    const bodyText = await readBody(req)
    let body = null
    try { body = bodyText === "" ? null : JSON.parse(bodyText) } catch { body = bodyText }
    requests.push({ method: req.method, path, query: url.search, body })
    res.on("error", () => { /* 对端中止（读超时收口）——零噪声 */ })
    const json = (status, payload) => { res.writeHead(status, { "content-type": "application/json" }); res.end(payload === undefined ? "" : JSON.stringify(payload)) }
    if (path === "/version") return json(200, version)
    if (path === "/info") return json(200, { ServerVersion: version.Version })
    if (/^\/containers\/[^/]+\/json$/.test(path) && req.method === "GET") {
      if (state.readGate) await state.readGate
      if (res.destroyed) return
      return json(200, state.containerJson)
    }
    if (/^\/containers\/[^/]+\/exec$/.test(path) && req.method === "POST") {
      state.execBodies.push(body)
      if (state.execStatus === 409) return json(409, { message: "container 4f8a is not running" })
      if (state.execStatus >= 400) return json(state.execStatus, { message: "engine says no" })
      const id = `exec-${state.execIds.length + 1}`
      state.execIds.push(id)
      return json(201, { Id: id })
    }
    const resize = /^\/exec\/([^/]+)\/resize$/.exec(path)
    if (resize && req.method === "POST") {
      state.resizeCalls.push({ execId: decodeURIComponent(resize[1]), h: url.searchParams.get("h"), w: url.searchParams.get("w") })
      if (state.resizeFailures > 0) { state.resizeFailures -= 1; return json(500, { message: "timeout waiting for exec session ready" }) }
      return json(200, "")
    }
    if (/^\/exec\/[^/]+\/json$/.test(path) && req.method === "GET") return json(200, { ExitCode: state.exitCode, Running: false })
    return json(404, { message: `unknown path ${url.pathname}` })
  })
  server.on("upgrade", (req, socket, head) => {
    socket.on("error", () => { /* 对端强断（收口 destroy）——零噪声 */ })
    const url = new URL(req.url, "http://engine")
    const path = url.pathname.replace(/^\/v[\d.]+/, "")
    const match = /^\/exec\/([^/]+)\/start$/.exec(path)
    if (!match || req.method !== "POST") { socket.destroy(); return }
    const execId = decodeURIComponent(match[1])
    const need = Number(req.headers["content-length"] ?? 0)
    const begin = async (bodyText) => {
      state.startBodies.push({ execId, body: bodyText, connection: req.headers.connection, upgrade: req.headers.upgrade })
      if (state.startGate) await state.startGate
      if (socket.destroyed) return
      socket.write(Buffer.concat([
        Buffer.from("HTTP/1.1 101 UPGRADE\r\nConnection: Upgrade\r\nUpgrade: tcp\r\n\r\n"),
        Buffer.from(opts.initialOutput ?? ""), // 与 101 同段到达的首块（Node `'upgrade'` 的 head——实测腿）
      ]))
      const record = { execId, socket, bytes: [], closed: false }
      pty.records.push(record)
      socket.on("data", (chunk) => {
        record.bytes.push(chunk)
        if (pty.echo) { try { socket.write(chunk) } catch { /* 对端已断 */ } }
      })
      socket.on("close", () => { record.closed = true })
    }
    let buffer = Buffer.from(head ?? Buffer.alloc(0))
    if (buffer.length >= need) return void begin(buffer.subarray(0, need).toString("utf8"))
    const onData = (chunk) => {
      buffer = Buffer.concat([buffer, chunk])
      if (buffer.length >= need) {
        socket.off("data", onData)
        void begin(buffer.subarray(0, need).toString("utf8"))
      }
    }
    socket.on("data", onData)
  })
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve) })
  server.on("connection", (socket) => { sockets.add(socket); socket.on("close", () => sockets.delete(socket)) })
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    port: server.address().port,
    state,
    requests,
    pty,
    endPty() { for (const record of pty.records) { try { record.socket.end() } catch { /* 已断 */ } } },
    calls: (needle) => requests.filter((item) => item.path.includes(needle)),
    async close() {
      for (const record of pty.records) { try { record.socket.destroy() } catch { /* 已断 */ } }
      for (const socket of sockets) socket.destroy() // 升级 socket 不归 closeAllConnections（实测）——自持集合销毁
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
    },
  }
}

/** 死地址（监听即关——连不上）：`engine_unreachable` 腿。 */
export async function deadBase() {
  const engine = await startFakeDocker()
  const base = engine.base
  await engine.close()
  return base
}

// ── ③ 进程内应用（网关 + 账号面 + 沙盒面 + 终端 hub）────────────────────────────────

export async function call(base, method, path, { body, cookie } = {}) {
  const headers = { "content-type": "application/json" }
  if (cookie) headers.cookie = cookie
  const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await res.text()
  return { status: res.status, text, json: (() => { try { return JSON.parse(text) } catch { return null } })(), setCookies: res.headers.getSetCookie?.() ?? [] }
}

export async function startApp({ engine = null, hubOptions = {}, withHub = true } = {}) {
  const db = DB.openDatabase(":memory:")
  await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  await MEMBERS.createMember(db, { username: "bob", role: "user", password: PASSWORD })
  const routes = SERVER.createRouteTable()
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(tmpdir(), "tc-terminal-test.db") })
  SANDBOX.registerSandboxRoutes(routes, { db, config, log: null })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  const hub = withHub ? TERMINAL.createTerminalHub({ db, log: null, ...hubOptions }) : null
  const server = SERVER.createGatewayServer({ config, routes, log: null, ...(hub ? { upgrade: hub.handleUpgrade } : {}) })
  const sockets = new Set()
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve) })
  server.on("connection", (socket) => { sockets.add(socket); socket.on("close", () => sockets.delete(socket)) })
  const port = server.address().port
  const base = `http://127.0.0.1:${port}`
  const login = async (username) => {
    const res = await call(base, "POST", "/api/login", { body: { username, password: PASSWORD } })
    const line = res.setCookies.find((item) => item.startsWith(`${SESSION.SESSION_COOKIE}=`)) ?? null
    return line ? line.split(";")[0] : null
  }
  const app = {
    db, hub, port, base,
    adminCookie: await login("admin"),
    userCookie: await login("bob"),
    audits: (kind = null) => db.prepare("SELECT * FROM audit_events WHERE type = 'sandbox_event' ORDER BY id").all()
      .map((row) => ({ ...row, detail: JSON.parse(row.detail ?? "{}") }))
      .filter((row) => kind === null || row.detail.kind === kind),
    async close() {
      hub?.closeAll("client_close") // 收口在飞会话（审计须在库关前落——收口幂等）
      for (const socket of sockets) socket.destroy() // 升级 socket 不归 closeAllConnections（实测）——自持集合销毁
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      await wait(30) // 在飞收口事件落定（异步 'close' 回调 → finishSession）
      db.close()
    },
  }
  if (engine) {
    const res = await call(base, "POST", "/api/admin/sandbox/runners", { cookie: app.adminCookie, body: { name: "node-terminal", address: engine.base } })
    assert.equal(res.status, 200, `添节点失败：${res.text}`)
    app.runner = res.json.runner
  }
  return app
}

export const terminalUrl = (app) => `/api/admin/sandbox/runners/${app.runner.id}/containers/ctr-1/terminal`
export const openTerminal = (app, { cookie = null, origin = null, autoPong = false, path = null } = {}) =>
  RawWs.open({ port: app.port, path: path ?? terminalUrl(app), cookie: cookie ?? app.adminCookie, origin: origin ?? `http://127.0.0.1:${app.port}`, autoPong })
