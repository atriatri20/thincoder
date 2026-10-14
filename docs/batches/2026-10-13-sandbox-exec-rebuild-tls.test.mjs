/**
 * 2026-10-13-sandbox-exec-rebuild-tls.test.mjs — thincoder-server 批内单测件（`sandbox-exec-rebuild` 批 · 连接面 TLS 档（增补 #2）
 * + 写门实时化 + 队列死件删净）；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-sandbox-exec-rebuild-tls.test.mjs`
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/sandbox/EXECUTION.md` §2.1/§12/§13 ∥ `sandbox/SANDBOX.md` §3 连接方式块）：
 *   T1 地址归一按档（裸 host 补 scheme + 缺省端口 2375/2376 ∥ 显式相抵 ⇒ 抛 ∥ 明文档逐值同现状）
 *   T2 明文行零行为变化（恒用注入 `fetchImpl`——调用序列 + 传输同一性为证 ∥ TLS 行零涉明文链）
 *   T3 `httpsFetchOf` 逐值注入（`ca`/`cert`/`key` 入请求选项 ∥ fetch 形最小件三件 ∥ 响应零材料 ∥ 传输错误原样抛）
 *   T4 三件形校验（缺件/空件/超长 ⇒ 人话）+ 连接档派生（scheme 单源）
 *   T5 TLS 档添加节点全链（自检走 `node:https` 假件 ⇒ 四列落库（私钥密文可解回）⇒ 响应/审计/总览零材料 ⇒ `connection`/`tls` 行形）
 *   T6 形面：缺件/相抵/明文档携材料/档非法 ⇒ 400 零外呼 ∥ 重名 400（既有面）
 *   T7 `PUT …/connection` 全列覆写（plain→tls ∥ tls→plain 原子清零 ∥ 自检失败 ⇒ 502 库零变 + 审计 ∥ 404/403/401 ∥ 缺 `connection` 键 ⇒ 400 零静默切档）
 *   T8 写门实时探活（无节点/全离线/非 active ⇒ 503 人话 ∥ 在线过 ∥ 零缓存两探两调用）
 *   T9 放置（在线 active 最少绑定者 ∥ 并列 ⇒ id 小 ∥ 容量上限 ⇒ null ∥ 全离线 ⇒ null）
 *   T10 盒读数读引擎（running ∥ 不在 ⇒ stopped ∥ 引擎不可达 ⇒ unreachable）+ 成员面行形
 *   T11 死件删净（源面机检：注释剥离后队列/心跳/标签放置标识零命中 + 零后台定时器）
 *   T12 探针执行器内嵌脚本逐条 vm 语法编译（真机跑前拦错）+ 脚本表完整
 *   T13 绑定节点门 `requireRunnerAvailable`（§7 绑定面：未绑/非 active/不可达 ⇒ 503 人话三因 ∥ 在线过；与创建面「探任一」成对）
 *   T14 终端升级腿传输按行择（修轮——TLS「生效面全谱」含终端族：明文行 ⇒ http 传输（同一引用透传 ∥ 缺省不注入 ⇒ `node:http`）∥
 *     TLS 行 ⇒ 三件材料逐值交 `https.request`（经 `createExecOps.start` 真消费为证）∥ 缺件 ⇒ 抛（零静默降级明文））
 * 假件 = 真 HTTP 假 Docker（明文链——真 fetch 链）+ `https.request` 假件（TLS 链）+ 升级形假件（T14——101 裸 socket 两形同录）+ 计数 `fetchImpl`（零行为变化腿）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync, readFileSync } from "node:fs"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import vm from "node:vm"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const SANDBOX = await load("thincoder-server/src/sandbox/routes.mjs")
const REGISTRY = await load("thincoder-server/src/sandbox/registry.mjs")
const DOCKER = await load("thincoder-server/src/sandbox/docker.mjs")
const TLS = await load("thincoder-server/src/sandbox/docker-tls.mjs")
const TERMINAL = await load("thincoder-server/src/sandbox/terminal-routes.mjs")
const EXEC = await load("thincoder-server/src/sandbox/docker-exec.mjs")
const CRYPTO = await load("thincoder-server/src/store/credential-crypto.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const PROBE = await load("thincoder-server/deploy/sandbox-probe.mjs")

const PASSWORD = "password-123"
const TEMP = mkdtempSync(join(tmpdir(), "tc-exec-rebuild-tls-"))
const VERSION_BODY = JSON.stringify({ Version: "29.1.3", ApiVersion: "1.52", MinAPIVersion: "1.44", Os: "linux", Arch: "amd64" })

// ── 假件①：真 HTTP 假 Docker（明文链——真 fetch 链；调用逐条在 `calls`）──────────

async function startFakeDocker(opts = {}) {
  const version = opts.version ?? { Version: "29.1.3", ApiVersion: "1.52", MinAPIVersion: "1.44", Os: "linux", Arch: "amd64" }
  const calls = []
  const state = { containers: (opts.containers ?? []).map((item) => ({ ...item })), nextId: 1 }
  const server = createServer((req, res) => {
    const chunks = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => {
      const url = new URL(req.url, "http://engine")
      calls.push({ method: req.method, path: url.pathname, query: url.search })
      const json = (status, payload) => {
        res.writeHead(status, { "content-type": "application/json" })
        res.end(payload === undefined ? "" : JSON.stringify(payload))
      }
      const p = url.pathname.replace(/^\/v?[0-9.]+/, "") || "/"
      if (p === "/version") return json(200, version)
      if (p === "/info") {
        return json(200, {
          ServerVersion: version.Version,
          Containers: state.containers.length,
          ContainersRunning: state.containers.filter((item) => item.State === "running").length,
        })
      }
      if (p === "/containers/json") return json(200, state.containers)
      const detail = /^\/containers\/([^/]+)\/json$/.exec(p)
      if (detail && req.method === "GET") {
        const id = decodeURIComponent(detail[1])
        const target = state.containers.find((item) => item.Id === id)
        if (!target) return json(404, { message: `No such container: ${id}` })
        return json(200, { Id: target.Id, State: { Status: target.State, Running: target.State === "running", StartedAt: "2026-10-14T00:00:00Z", FinishedAt: "0001-01-01T00:00:00Z", ExitCode: 0 } })
      }
      const action = /^\/containers\/([^/]+)\/(start|stop)$/.exec(p)
      if (action) {
        const id = decodeURIComponent(action[1])
        const target = state.containers.find((item) => item.Id === id)
        if (!target) return json(404, { message: `No such container: ${id}` })
        target.State = action[2] === "start" ? "running" : "exited"
        return json(204)
      }
      const del = /^\/containers\/([^/]+)$/.exec(p)
      if (del && req.method === "DELETE") {
        state.containers = state.containers.filter((item) => item.Id !== decodeURIComponent(del[1]))
        return json(204)
      }
      return json(404, { message: `unknown path ${url.pathname}` })
    })
  })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    calls,
    state,
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
    },
  }
}

/** 死地址（监听即关——连不上）：离线腿用。 */
async function deadBase() {
  const engine = await startFakeDocker()
  const base = engine.base
  await engine.close()
  return base
}

// ── 假件②：`https.request` 替身（TLS 链——逐请求记录 options；`byHost` 分流）────────

function fakeHttpsRequest({ status = 200, body = VERSION_BODY, error = null, record = [], byHost = null } = {}) {
  return (options, onResponse) => {
    record.push(options)
    const reqHandlers = {}
    const req = {
      on(name, fn) {
        reqHandlers[name] = fn
        return req
      },
      write(chunk) {
        this.written = (this.written ?? "") + Buffer.from(chunk).toString("utf8")
      },
      end() {
        const route = byHost === null ? null : byHost[options.hostname] ?? null
        const failure = route?.error ?? error
        if (failure !== null) {
          setImmediate(() => reqHandlers.error?.(failure))
          return
        }
        const resHandlers = {}
        const res = {
          statusCode: route?.status ?? status,
          headers: {},
          on(name, fn) {
            resHandlers[name] = fn
            return res
          },
        }
        onResponse(res)
        setImmediate(() => {
          resHandlers.data?.(Buffer.from(route?.body ?? body, "utf8"))
          resHandlers.end?.()
        })
      },
    }
    return req
  }
}

/** 升级形替身（`node:http.request` ∥ `node:https.request` 同形——T14：逐请求记录 options；`end` 后回 101 + 裸 socket 桩；`bodies` 在场时收体文）。 */
function fakeUpgradeRequest(record, bodies = null) {
  return (options) => {
    record.push(options)
    const handlers = {}
    const socket = { destroyed: false, destroy() { socket.destroyed = true } }
    const req = {
      on(name, fn) {
        handlers[name] = fn
        return req
      },
      write(chunk) {
        this.written = (this.written ?? "") + Buffer.from(chunk).toString("utf8")
        return true
      },
      end(chunk) {
        if (chunk !== undefined && bodies !== null) bodies.push(Buffer.isBuffer(chunk) ? chunk.toString("utf8") : String(chunk))
        setImmediate(() => handlers.upgrade?.({ statusCode: 101, headers: {} }, socket, Buffer.alloc(0)))
      },
      destroy() {
        socket.destroyed = true
        setImmediate(() => handlers.error?.(new Error("destroyed")))
      },
    }
    return req
  }
}

// ── 进程内应用（网关 + 账号面 + 沙盒面）────────────────────────────────────────

async function call(base, method, path, { body, cookie } = {}) {
  const headers = { "content-type": "application/json" }
  if (cookie) headers.cookie = cookie
  const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    /* 非 JSON 体：以 text 判 */
  }
  return { status: res.status, text, json, setCookies: res.headers.getSetCookie?.() ?? [] }
}

async function startApp({ requestImpl = null, fetchImpl = null } = {}) {
  const db = DB.openDatabase(":memory:")
  const admin = await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  const bob = await MEMBERS.createMember(db, { username: "bob", role: "user", password: PASSWORD })
  const routes = SERVER.createRouteTable()
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(TEMP, "gateway.db") })
  SANDBOX.registerSandboxRoutes(routes, { db, config, log: null, ...(fetchImpl === null ? {} : { fetchImpl }), ...(requestImpl === null ? {} : { requestImpl }) })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  const server = SERVER.createGatewayServer({ config, routes, log: null })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const base = `http://127.0.0.1:${server.address().port}`
  const login = async (username) => {
    const res = await call(base, "POST", "/api/login", { body: { username, password: PASSWORD } })
    const line = res.setCookies.find((item) => item.startsWith(`${SESSION.SESSION_COOKIE}=`)) ?? null
    return line ? line.split(";")[0] : null
  }
  return {
    db,
    base,
    config,
    adminId: admin.member.id,
    bobId: bob.member.id,
    adminCookie: await login("admin"),
    userCookie: await login("bob"),
    audits: (kind) => db.prepare("SELECT * FROM audit_events WHERE type = 'sandbox_event' ORDER BY id").all().filter((row) => JSON.parse(row.detail ?? "{}").kind === kind),
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}

/** 添节点（明文档——既有面）。出 = 响应。 */
async function addRunner(app, name, address) {
  return call(app.base, "POST", "/api/admin/sandbox/runners", { cookie: app.adminCookie, body: { name, address } })
}

/** 直插工作区行（放置/盒读数腿前置——`key_id` FK 须真行）。 */
function insertWorkspace(db, { name, runnerId = null, ownerId }) {
  const key = db
    .prepare("INSERT INTO api_keys (member_id, key_hash, key_hint, created_at) VALUES (?, ?, ?, ?)")
    .run(ownerId, `hash-${name}-${Math.random().toString(16).slice(2)}`, "sk-tc-…hint", new Date().toISOString())
  return Number(
    db
      .prepare("INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, runner_id, limits_json, created_at) VALUES (?, ?, ?, ?, ?, '{}', ?)")
      .run(name, ownerId, Number(key.lastInsertRowid), `sk-tc-${name}`, runnerId, new Date().toISOString()).lastInsertRowid,
  )
}

// ── T1 ∥ T4：纯函数面（归一按档 ∥ 三件形）────────────────────────────────────

test("T1 地址归一按档：裸 host 补 scheme + 缺省端口（2375/2376）∥ 显式相抵 ⇒ 抛 ∥ 明文档逐值同现状", () => {
  assert.equal(DOCKER.normalizeDockerAddress("10.0.0.5"), "http://10.0.0.5:2375", "裸 host 明文档 ⇒ http:2375（逐值同现状）")
  assert.equal(DOCKER.normalizeDockerAddress("10.0.0.5:2500"), "http://10.0.0.5:2500", "裸 host 携端口 ⇒ 保留")
  assert.equal(DOCKER.normalizeDockerAddress("http://10.0.0.5"), "http://10.0.0.5:2375", "明文档缺端口补 2375")
  assert.equal(DOCKER.normalizeDockerAddress("10.0.0.5", { tls: true }), "https://10.0.0.5:2376", "TLS 档裸 host ⇒ https:2376")
  assert.equal(DOCKER.normalizeDockerAddress("10.0.0.5:9999", { tls: true }), "https://10.0.0.5:9999", "TLS 档显式端口 ⇒ 保留")
  assert.equal(DOCKER.normalizeDockerAddress("https://10.0.0.5", { tls: true }), "https://10.0.0.5:2376", "TLS 档显式 https 缺端口 ⇒ 2376")
  assert.equal(DOCKER.normalizeDockerAddress("http://10.0.0.5:2375", { tls: false }), "http://10.0.0.5:2375", "明文档显式 scheme+端口 ⇒ 逐值不变")
  assert.throws(() => DOCKER.normalizeDockerAddress("https://10.0.0.5"), /相抵/, "显式 https + 明文档 ⇒ 抛（零静默推断）")
  assert.throws(() => DOCKER.normalizeDockerAddress("http://10.0.0.5", { tls: true }), /相抵/, "显式 http + TLS 档 ⇒ 抛")
  assert.throws(() => DOCKER.normalizeDockerAddress(""), /不可为空/)
  assert.throws(() => DOCKER.normalizeDockerAddress("ftp://10.0.0.5"), /仅收/, "非 http/https scheme ⇒ 抛")
  assert.throws(() => DOCKER.normalizeDockerAddress("http://10.0.0.5:2375/docker"), /仅收 <host>:<port>/, "路径形 ⇒ 抛（零静默截断）")
  assert.throws(() => DOCKER.normalizeDockerAddress("http://user:pass@10.0.0.5:2375"), /仅收 <host>:<port>/, "凭据形 ⇒ 抛")
  assert.equal(DOCKER.normalizeDockerAddress("http://10.0.0.5:2375/"), "http://10.0.0.5:2375", "尾斜杠 ⇒ 归一如常")
  assert.equal(DOCKER.DEFAULT_DOCKER_TLS_PORT, 2376)
})

test("T4 三件形校验：缺件/空件/超长 ⇒ 人话 ∥ 齐备 ⇒ 值对 ∥ 连接档取值域", () => {
  assert.throws(() => TLS.parseTlsMaterials({ ca: "a", cert: "b" }), /key（客户端私钥 PEM）必填/)
  assert.throws(() => TLS.parseTlsMaterials({ ca: "  ", cert: "b", key: "c" }), /ca（CA 证书 PEM）必填/)
  assert.throws(() => TLS.parseTlsMaterials({ ca: "a", cert: "b", key: "x".repeat(TLS.TLS_MATERIAL_MAX + 1) }), /超长/)
  assert.deepEqual(TLS.parseTlsMaterials({ ca: "a", cert: "b", key: "c" }), { ca: "a", cert: "b", key: "c" })
  assert.deepEqual(TLS.normalizeConnectionKind(undefined), "plain", "不携档 ⇒ plain（零行为变化）")
  assert.deepEqual(TLS.normalizeConnectionKind(""), "plain")
  assert.equal(TLS.normalizeConnectionKind("tls"), "tls")
  assert.throws(() => TLS.normalizeConnectionKind("mutual"), /connection 非法/)
  assert.equal(TLS.connectionKindOf("https://h:2376"), "tls", "连接档 = 地址 scheme 单源派生")
  assert.equal(TLS.connectionKindOf("http://h:2375"), "plain")
  assert.deepEqual(TLS.CONNECTION_KINDS, ["plain", "tls"])
})

// ── T2 ∥ T3：传输面（明文零行为变化 ∥ TLS 适配件逐值）──────────────────────────

test("T2 明文行零行为变化：恒用注入 fetchImpl（调用序列 + 传输同一性）∥ TLS 行零涉明文链", async () => {
  const calls = []
  const fakeFetch = async (url, init) => {
    calls.push({ url, init })
    return { status: 200, text: async () => VERSION_BODY, arrayBuffer: async () => new ArrayBuffer(0) }
  }
  const config = { db: join(TEMP, "t2.db") }
  const plain = { id: 1, name: "plain", address: "http://10.0.0.5:2375", runtime_json: JSON.stringify({ apiVer: "1.44" }) }
  assert.equal(DOCKER.transportForRunner(plain, { fetchImpl: fakeFetch, config }), fakeFetch, "明文行传输 = 注入 fetchImpl（同一引用——不构造适配件）")
  await DOCKER.clientForRunner(plain, { fetchImpl: fakeFetch, config }).info()
  assert.deepEqual(calls.map((item) => item.url), ["http://10.0.0.5:2375/v1.44/info"], "明文链调用逐条 = 现状形态")
  // TLS 行：三件齐（密文列）⇒ 传输 ≠ fetchImpl；一次调用全走 `https.request` 假件（明文链零交叉）
  const key = CRYPTO.loadOrCreateCredentialKey(CRYPTO.credentialKeyPath(config))
  const tlsRow = {
    id: 2,
    name: "tls",
    address: "https://10.0.0.9:2376",
    runtime_json: JSON.stringify({ apiVer: "1.44" }),
    tls_ca: "CA-PEM",
    tls_cert: "CERT-PEM",
    tls_key_cipher: CRYPTO.encryptSecret("KEY-PEM", key),
    tls_updated_at: "2026-10-14T00:00:00.000Z",
  }
  const tlsTransport = DOCKER.transportForRunner(tlsRow, { fetchImpl: fakeFetch, config })
  assert.notEqual(tlsTransport, fakeFetch, "TLS 行传输 = 适配件（非 fetchImpl）")
  const record = []
  const before = calls.length
  const client = DOCKER.clientForRunner(tlsRow, { fetchImpl: fakeFetch, config, requestImpl: fakeHttpsRequest({ record }) })
  const res = await client.info()
  assert.equal(calls.length, before, "TLS 调用零落明文链（fetchImpl 计数不动）")
  assert.equal(record.length, 1, "TLS 调用一次 = `https.request` 一次")
  assert.deepEqual([record[0].ca, record[0].cert, record[0].key], ["CA-PEM", "CERT-PEM", "KEY-PEM"], "材料按行解密后逐值入选项")
  assert.equal(res.status, 200)
  assert.equal(JSON.parse(res.text).Version, "29.1.3")
  // 缺件行（不变量 https ⇔ 三件齐的读面）：抛人话（不静默降级明文）
  assert.throws(() => DOCKER.transportForRunner({ address: "https://10.0.0.9:2376", runtime_json: "{}" }, { fetchImpl: fakeFetch, config }), /材料不齐/)
})

test("T3 httpsFetchOf 逐值注入：ca/cert/key 入选项 ∥ fetch 形最小件三件 ∥ 响应零材料 ∥ 传输错误原样抛", async () => {
  const record = []
  const fetcher = TLS.httpsFetchOf({ ca: "CA-PEM", cert: "CERT-PEM", key: "KEY-PEM" }, { requestImpl: fakeHttpsRequest({ status: 200, body: VERSION_BODY, record }) })
  const res = await fetcher("https://10.0.0.9:2376/v1.44/version?x=1", { method: "GET", headers: { accept: "application/json" } })
  assert.equal(res.status, 200)
  assert.equal(await res.text(), VERSION_BODY)
  assert.equal(Buffer.from(await res.arrayBuffer()).toString("utf8"), VERSION_BODY, "arrayBuffer() 同体")
  const [options] = record
  assert.deepEqual([options.ca, options.cert, options.key], ["CA-PEM", "CERT-PEM", "KEY-PEM"], "三件逐值入请求选项")
  assert.deepEqual([options.method, options.hostname, options.port, options.path], ["GET", "10.0.0.9", 2376, "/v1.44/version?x=1"], "形 = 名/端口/路径/查询")
  assert.ok(!JSON.stringify(res).includes("KEY-PEM"), "响应面零材料（fetch 形三件）")
  // 字节体 + content-length 补全（archive put / build 同径）
  const record2 = []
  const post = TLS.httpsFetchOf({ ca: "c", cert: "c", key: "k" }, { requestImpl: fakeHttpsRequest({ status: 200, body: "{}", record: record2 }) })
  await post("https://h:1/containers/x/archive?path=%2F", { method: "PUT", headers: { "content-type": "application/x-tar" }, body: Buffer.from("TAR-BYTES") })
  assert.equal(record2[0].headers["content-length"], "9", "字节体 ⇒ content-length 补全")
  assert.equal(record2[0].method, "PUT")
  // 传输错误原样抛（调用方按 signal 分类）
  const failing = TLS.httpsFetchOf({ ca: "c", cert: "c", key: "k" }, { requestImpl: fakeHttpsRequest({ error: new Error("ECONNREFUSED 10.0.0.9:2376") }) })
  await assert.rejects(() => failing("https://10.0.0.9:2376/version"), /ECONNREFUSED/)
})

// ── T5 ∥ T6：添加节点（TLS 档全链 ∥ 形面）──────────────────────────────────────

test("T5 TLS 档添加节点：自检走 node:https 假件 ⇒ 四列落库（私钥密文可解回）⇒ 响应/审计/总览零材料 ∥ connection/tls 行形", async () => {
  const record = []
  const app = await startApp({ requestImpl: fakeHttpsRequest({ status: 200, body: VERSION_BODY, record }) })
  try {
    const res = await call(app.base, "POST", "/api/admin/sandbox/runners", {
      cookie: app.adminCookie,
      body: { name: "node-tls", address: "10.0.0.9", connection: "tls", tls: { ca: "CA-PEM-X", cert: "CERT-PEM-X", key: "KEY-PEM-X" } },
    })
    assert.equal(res.status, 200, res.text)
    const row = app.db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(res.json.runner.id)
    assert.equal(row.address, "https://10.0.0.9:2376", "TLS 档裸 host ⇒ https:2376 归一后落库")
    assert.deepEqual([row.tls_ca, row.tls_cert], ["CA-PEM-X", "CERT-PEM-X"], "CA/证书 = 原文档列")
    assert.notEqual(row.tls_key_cipher, "KEY-PEM-X", "私钥非明文落库")
    const key = CRYPTO.loadOrCreateCredentialKey(CRYPTO.credentialKeyPath(app.config))
    assert.equal(CRYPTO.decryptSecret(row.tls_key_cipher, key), "KEY-PEM-X", "私钥密文可解回（读面解密径同键）")
    assert.equal(typeof row.tls_updated_at, "string")
    assert.equal(res.json.runner.connection, "tls", "行形 connection = scheme 派生")
    assert.deepEqual(res.json.runner.tls.state, "sealed", "行形 tls.state = sealed（三件齐）")
    assert.equal(res.json.runner.tls.updatedAt, row.tls_updated_at, "行形 tls.updatedAt = 材料时刻")
    const surface = JSON.stringify(res.json) + JSON.stringify(app.audits("runner_add")) + JSON.stringify(app.db.prepare("SELECT * FROM audit_events").all())
    for (const secret of ["CA-PEM-X", "CERT-PEM-X", "KEY-PEM-X"]) assert.ok(!surface.includes(secret), `零回显（响应/审计）：${secret}`)
    assert.ok(record.some((item) => item.path === "/version"), "引导步（无前缀）走 https 假件")
    assert.ok(record.some((item) => item.path === "/v1.44/version"), "复读（带前缀）走 https 假件")
    assert.ok(record.some((item) => item.ca === "CA-PEM-X" && item.cert === "CERT-PEM-X" && item.key === "KEY-PEM-X"), "自检请求携三件逐值")
    const detail = JSON.parse(app.audits("runner_add")[0].detail)
    assert.equal(detail.tls, true, "审计 detail 增 tls 布尔")
    assert.equal(detail.address, "https://10.0.0.9:2376")
    const overview = await call(app.base, "GET", "/api/admin/sandbox/overview", { cookie: app.adminCookie })
    assert.equal(overview.json.runners[0].connection, "tls")
    assert.equal(overview.json.runners[0].tls.state, "sealed")
    assert.ok(!JSON.stringify(overview.json).includes("KEY-PEM-X"), "总览行零材料")
  } finally {
    await app.close()
  }
})

test("T6 添节点形面：缺件/相抵/明文档携材料/档非法 ⇒ 400 零外呼 ∥ 重名 400（既有面）", async () => {
  const engine = await startFakeDocker()
  const tlsRecord = []
  const app = await startApp({ requestImpl: fakeHttpsRequest({ record: tlsRecord }) })
  try {
    const cases = [
      [{ name: "n1", address: "https://10.0.0.9" }, /相抵/, "显式 https 无档"],
      [{ name: "n1", address: "10.0.0.9", connection: "tls", tls: { ca: "a", cert: "b" } }, /key（客户端私钥 PEM）必填/, "TLS 档缺件"],
      [{ name: "n1", address: "http://10.0.0.9", connection: "tls", tls: { ca: "a", cert: "b", key: "c" } }, /相抵/, "显式 http + TLS 档"],
      [{ name: "n1", address: "http://10.0.0.9", tls: { ca: "a", cert: "b", key: "c" } }, /明文档不携材料/, "明文档携材料"],
      [{ name: "n1", address: "10.0.0.9", connection: "mutual" }, /connection 非法/, "档非法"],
    ]
    for (const [body, pattern, label] of cases) {
      const res = await call(app.base, "POST", "/api/admin/sandbox/runners", { cookie: app.adminCookie, body })
      assert.equal(res.status, 400, `${label} ⇒ 400：${res.text}`)
      assert.match(res.json.error.message, pattern, label)
    }
    assert.equal(tlsRecord.length, 0, "形面全拒在自检之前（https 网面零触）")
    assert.equal(engine.calls.length, 0, "形面全拒零明文外呼")
    assert.equal((await addRunner(app, "node-a", engine.base)).status, 200, "明文档既有面 ≡ 现状（回归腿）")
    const dup = await addRunner(app, "node-a", engine.base)
    assert.equal(dup.status, 400)
    assert.match(dup.json.error.message, /节点名已存在/)
    assert.equal(tlsRecord.length, 0)
  } finally {
    await app.close()
    await engine.close()
  }
})

// ── T7：连接方式编辑（全列覆写）────────────────────────────────────────────────

test("T7 PUT …/connection：plain→tls ∥ tls→plain 原子清零 ∥ 自检失败 502 库零变 + 审计 ∥ 404/403/401", async () => {
  const engine = await startFakeDocker()
  const record = []
  const requestImpl = fakeHttpsRequest({ record, byHost: { "127.0.0.1": { status: 200, body: VERSION_BODY }, "10.9.9.9": { error: new Error("ECONNREFUSED 10.9.9.9:2376") } } })
  const app = await startApp({ requestImpl })
  try {
    const added = await addRunner(app, "node-x", engine.base)
    assert.equal(added.status, 200)
    const id = added.json.runner.id
    assert.equal(added.json.runner.connection, "plain", "明文档行形")
    assert.deepEqual(added.json.runner.tls, { state: "none", updatedAt: null }, "明文档 tls = none")
    // ① plain → tls（地址缺省 ⇒ 保留主机 + 按档补方案/端口）
    const up = await call(app.base, "PUT", `/api/admin/sandbox/runners/${id}/connection`, { cookie: app.adminCookie, body: { connection: "tls", tls: { ca: "CA-2", cert: "CERT-2", key: "KEY-2" } } })
    assert.equal(up.status, 200, up.text)
    assert.equal(up.json.runner.address, "https://127.0.0.1:2376", "切档 ⇒ https:2376（主机保留）")
    assert.equal(up.json.runner.connection, "tls")
    assert.equal(up.json.runner.tls.state, "sealed")
    const tlsRow = app.db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(id)
    assert.deepEqual([tlsRow.tls_ca, tlsRow.tls_cert], ["CA-2", "CERT-2"])
    const auditUp = app.audits("runner_connection")
    assert.equal(auditUp.length, 1, "审计 runner_connection 一枚")
    assert.deepEqual([JSON.parse(auditUp[0].detail).runnerId, JSON.parse(auditUp[0].detail).tls, JSON.parse(auditUp[0].detail).address], [id, true, "https://127.0.0.1:2376"])
    // ② tls → plain（单语句：地址回 http + 材料清零）
    const down = await call(app.base, "PUT", `/api/admin/sandbox/runners/${id}/connection`, { cookie: app.adminCookie, body: { connection: "plain", address: engine.base } })
    assert.equal(down.status, 200, down.text)
    assert.equal(down.json.runner.address, engine.base)
    assert.deepEqual(down.json.runner.tls, { state: "none", updatedAt: null }, "关 TLS ⇒ 行形 none")
    const plainRow = app.db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(id)
    assert.deepEqual([plainRow.tls_ca, plainRow.tls_cert, plainRow.tls_key_cipher, plainRow.tls_updated_at], [null, null, null, null], "材料四列清零（原子）")
    assert.equal(JSON.parse(app.audits("runner_connection")[1].detail).tls, false)
    // ③ 自检失败 ⇒ 502 + 库零变 + 审计（runnerId 在场）
    const beforeRow = app.db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(id)
    const fail = await call(app.base, "PUT", `/api/admin/sandbox/runners/${id}/connection`, { cookie: app.adminCookie, body: { connection: "tls", address: "10.9.9.9", tls: { ca: "CA-3", cert: "CERT-3", key: "KEY-3" } } })
    assert.equal(fail.status, 502, fail.text)
    const afterRow = app.db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(id)
    assert.deepEqual([afterRow.address, afterRow.tls_ca, afterRow.tls_cert, afterRow.tls_key_cipher], [beforeRow.address, beforeRow.tls_ca, beforeRow.tls_cert, beforeRow.tls_key_cipher], "自检失败 ⇒ 库零变")
    const auditFail = app.audits("runner_selfcheck_failed")
    assert.equal(auditFail.length, 1)
    assert.equal(JSON.parse(auditFail[0].detail).runnerId, id)
    assert.ok(!JSON.stringify(app.db.prepare("SELECT * FROM audit_events").all()).includes("KEY-3"), "审计零材料")
    // ④ 形面：404 ∥ 403 ∥ 401 ∥ 缺 connection 键（全列覆写必携——防静默关 TLS）
    assert.equal((await call(app.base, "PUT", "/api/admin/sandbox/runners/9999/connection", { cookie: app.adminCookie, body: { connection: "plain" } })).status, 404)
    assert.equal((await call(app.base, "PUT", `/api/admin/sandbox/runners/${id}/connection`, { cookie: app.userCookie, body: { connection: "plain" } })).status, 403)
    assert.equal((await call(app.base, "PUT", `/api/admin/sandbox/runners/${id}/connection`, { body: { connection: "plain" } })).status, 401)
    const bare = await call(app.base, "PUT", `/api/admin/sandbox/runners/${id}/connection`, { cookie: app.adminCookie, body: { address: "10.0.0.9" } })
    assert.equal(bare.status, 400, "缺 connection 键 ⇒ 400（全列覆写必携——零静默切档）")
    assert.match(bare.json.error.message, /connection 必携/)
    const nulled = await call(app.base, "PUT", `/api/admin/sandbox/runners/${id}/connection`, { cookie: app.adminCookie, body: { connection: null, address: "10.0.0.9" } })
    assert.equal(nulled.status, 400, "connection: null ⇒ 400（enum 外——零静默关 TLS）")
    assert.match(nulled.json.error.message, /connection 必携/)
    const afterBare = app.db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(id)
    assert.deepEqual([afterBare.address, afterBare.tls_ca], [beforeRow.address, beforeRow.tls_ca], "缺键拒 ⇒ 库零变")
  } finally {
    await app.close()
    await engine.close()
  }
})

// ── T8 ∥ T9：写门实时化 ∥ 放置 ────────────────────────────────────────────────

test("T8 写门实时探活：无节点/全离线/非 active ⇒ 503 人话 ∥ 在线过 ∥ 零缓存（两探两调用）", async () => {
  const engine = await startFakeDocker()
  const app = await startApp()
  try {
    await assert.rejects(
      () => REGISTRY.requireSandboxAvailable(app.db, {}),
      (error) => error.code === "sandbox_unavailable" && /无节点注册/.test(error.message),
      "无节点 ⇒ 503 sandbox_unavailable",
    )
    assert.equal((await addRunner(app, "node-a", engine.base)).status, 200)
    const probes = () => engine.calls.filter((item) => item.path.endsWith("/info")).length
    const before = probes()
    await REGISTRY.requireSandboxAvailable(app.db, {})
    await REGISTRY.requireSandboxAvailable(app.db, {})
    assert.equal(probes() - before, 2, "零缓存：两次门检 = 两次轻探")
    const dead = await deadBase()
    app.db.prepare("UPDATE sandbox_runners SET address = ? WHERE name = 'node-a'").run(dead)
    await assert.rejects(
      () => REGISTRY.requireSandboxAvailable(app.db, {}),
      (error) => error.code === "sandbox_unavailable" && /全部不可达/.test(error.message),
      "active 全离线 ⇒ 503",
    )
    app.db.prepare("UPDATE sandbox_runners SET status = 'disabled' WHERE name = 'node-a'").run()
    await assert.rejects(
      () => REGISTRY.requireSandboxAvailable(app.db, {}),
      (error) => error.code === "sandbox_unavailable" && /均非 active/.test(error.message),
      "非 active 不在候选 ⇒ 503",
    )
  } finally {
    await app.close()
    await engine.close()
  }
})

test("T9 放置：在线 active 最少绑定者 ∥ 并列 ⇒ id 小 ∥ 容量上限 ⇒ null ∥ 全离线 ⇒ null", async () => {
  const engineA = await startFakeDocker()
  const engineB = await startFakeDocker()
  const app = await startApp()
  try {
    const a = await addRunner(app, "node-a", engineA.base)
    const b = await addRunner(app, "node-b", engineB.base)
    const pick0 = await REGISTRY.placeWorkspace(app.db, {})
    assert.equal(pick0.name, "node-a", "零绑定并列 ⇒ id 小者")
    insertWorkspace(app.db, { name: "ws-1", runnerId: a.json.runner.id, ownerId: app.adminId })
    insertWorkspace(app.db, { name: "ws-2", runnerId: a.json.runner.id, ownerId: app.adminId })
    insertWorkspace(app.db, { name: "ws-3", runnerId: b.json.runner.id, ownerId: app.adminId })
    const pick1 = await REGISTRY.placeWorkspace(app.db, {})
    assert.equal(pick1.name, "node-b", "A 绑 2 ∥ B 绑 1 ⇒ 落 B（最少者）")
    app.db.prepare("INSERT INTO sandbox_settings (k, v) VALUES ('maxBoxesPerRunner', '1') ON CONFLICT(k) DO UPDATE SET v = excluded.v").run()
    assert.equal(await REGISTRY.placeWorkspace(app.db, {}), null, "容量上限（8 缺省可覆写）⇒ 无候选")
    app.db.prepare("UPDATE sandbox_settings SET v = '8' WHERE k = 'maxBoxesPerRunner'").run()
    const dead = await deadBase()
    app.db.prepare("UPDATE sandbox_runners SET address = ?").run(dead)
    assert.equal(await REGISTRY.placeWorkspace(app.db, {}), null, "全离线 ⇒ 无候选（不降级）")
  } finally {
    await app.close()
    await engineA.close()
    await engineB.close()
  }
})

// ── T10：盒读数（读引擎）+ 成员面行形 ─────────────────────────────────────────

test("T10 盒读数读引擎（running ∥ 不在 ⇒ stopped ∥ 引擎不可达 ⇒ unreachable）+ 成员面行形", async () => {
  const engine = await startFakeDocker()
  const app = await startApp()
  try {
    const added = await addRunner(app, "node-a", engine.base)
    const runnerId = added.json.runner.id
    const wsId = insertWorkspace(app.db, { name: "ws-member", runnerId, ownerId: app.bobId })
    const row = app.db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(wsId)
    const runner = app.db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(runnerId)
    const client = DOCKER.clientForRunner(runner, {})
    const absent = await REGISTRY.boxStateOf(row, runner, { client })
    assert.deepEqual([absent.boxState, absent.containerId, absent.unreachable], ["stopped", null, false], "盒不在 ⇒ stopped（`dirty` 2026-10-14 收口修复轮退役）")
    engine.state.containers.push({ Id: "ctr-ws", Names: [`/tc-ws-${wsId}`], State: "running", Status: "Up 1 second" })
    const running = await REGISTRY.boxStateOf(row, runner, { client })
    assert.deepEqual([running.boxState, running.containerId], ["running", "ctr-ws"], "引擎态 running 如实上")
    engine.state.containers[0].State = "exited"
    assert.equal((await REGISTRY.boxStateOf(row, runner, { client })).boxState, "stopped", "exited ⇒ stopped")
    const dead = await deadBase()
    const deadRunner = { ...runner, address: dead }
    assert.equal((await REGISTRY.boxStateOf(row, deadRunner, { client: DOCKER.clientForRunner(deadRunner, {}) })).unreachable, true, "引擎不可达 ⇒ unreachable 如实标")
    const me = await call(app.base, "GET", "/api/me/sandbox/workspaces", { cookie: app.userCookie })
    assert.equal(me.status, 200, me.text)
    const item = me.json.workspaces[0]
    assert.deepEqual([item.runnerName, item.boxState, item.pending, item.checkpointCount], ["node-a", "stopped", null, 0], "成员面行形（runnerName ∥ boxState 读引擎）")
    const anon = await call(app.base, "GET", "/api/me/sandbox/workspaces")
    assert.equal(anon.status, 401, "无会话 ⇒ 401")
  } finally {
    await app.close()
    await engine.close()
  }
})

// ── T12：探针执行器（内嵌脚本语法机检）──────────────────────────────────────

test("T12 探针执行器：P1–P13 内嵌探针脚本逐条语法可编译（真机跑前拦错）∥ 脚本表完整", async () => {
  const ids = Object.keys(PROBE.PROBE_SCRIPTS)
  assert.deepEqual(ids, ["P1", "P2", "P3", "P4", "P5", "P6", "P7", "P8", "P9", "P10", "P11", "P12", "P13"], "P1–P13 脚本全在场（P14 = 服务端 HTTP，无脚本）")
  for (const [id, script] of Object.entries(PROBE.PROBE_SCRIPTS)) {
    assert.doesNotThrow(() => new vm.Script(script), `${id} 探针脚本语法可编译（容器内 = /usr/local/bin/node -e）`)
    assert.match(script, /__PROBE__/, `${id} 输出契约：末行 \`__PROBE__{json}\``)
  }
  const source = readFileSync(join(ROOT, "thincoder-server/deploy/sandbox-probe.mjs"), "utf8")
  assert.match(source, /零 `docker exec`/, "口径在档：零 docker exec")
  assert.match(source, /exitCode|退出码/, "退出码语义在档")
})

// ── T13：绑定节点门（§7 绑定面）──────────────────────────────────────────────

test("T13 绑定节点门 requireRunnerAvailable：在线过 ∥ 未绑/非 active/不可达 ⇒ 503 人话三因", async () => {
  const engine = await startFakeDocker()
  const app = await startApp()
  try {
    const added = await addRunner(app, "node-a", engine.base)
    const row = app.db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(added.json.runner.id)
    await assert.doesNotReject(() => REGISTRY.requireRunnerAvailable(row, { detail: "动作需要节点" }), "在线 active 绑定节点 ⇒ 过")
    await assert.rejects(
      () => REGISTRY.requireRunnerAvailable(null, { detail: "动作需要节点" }),
      (error) => error.code === "sandbox_unavailable" && /未绑定节点——先放置/.test(error.message) && /动作需要节点/.test(error.message),
      "未绑 ⇒ 503「先放置」（与创建面探任一成对）",
    )
    await assert.rejects(
      () => REGISTRY.requireRunnerAvailable({ ...row, status: "disabled" }, {}),
      (error) => error.code === "sandbox_unavailable" && /非 active/.test(error.message),
      "非 active ⇒ 503",
    )
    const dead = await deadBase()
    await assert.rejects(
      () => REGISTRY.requireRunnerAvailable({ ...row, address: dead }, {}),
      (error) => error.code === "sandbox_unavailable" && /不可达/.test(error.message),
      "绑定节点不可达 ⇒ 503 人话",
    )
  } finally {
    await app.close()
    await engine.close()
  }
})

// ── T11：死件删净（源面机检）───────────────────────────────────────────────────

test("T11 死件删净：注释剥离后队列/心跳/标签放置标识零命中 ∥ 零后台定时器 ∥ 队列表已删（v22）", async () => {
  const strip = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "")
  const dead = [
    "TASK_KINDS", "IDEMPOTENT_TASK_KINDS", "CLAIM_TIMEOUT_MS", "enqueueTask", "claimTasks", "reportTask", "sweepStuckTasks",
    "lastTaskView", "normalizeBoxes", "boxPayload", "sandbox_tasks", "applyHeartbeat", "boxTransitions", "recordBoxTransitions",
    "BOX_STATES", "joinTtlMinutes", "sanitizeLabels", "required_labels_json", "finalizeBox", "heartbeat",
  ]
  for (const file of ["thincoder-server/src/sandbox/registry.mjs", "thincoder-server/src/sandbox/routes.mjs"]) {
    const code = strip(readFileSync(join(ROOT, file), "utf8"))
    for (const token of dead) assert.ok(!code.includes(token), `${file.split("/").pop()} 代码面零命中「${token}」`)
    assert.ok(!code.includes("setInterval"), `${file.split("/").pop()} 零后台定时器`)
  }
  const app = await startApp()
  try {
    const table = app.db.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sandbox_tasks'").get()
    assert.equal(table, undefined, "v22 已删 sandbox_tasks（队列退场）")
    const columns = app.db.prepare("PRAGMA table_info(sandbox_runners)").all().map((row) => row.name)
    for (const column of ["tls_ca", "tls_cert", "tls_key_cipher", "tls_updated_at"]) assert.ok(columns.includes(column), `v22 连接材料四列在场：${column}`)
    assert.ok(REGISTRY.DEFAULT_SETTINGS.maxBoxesPerRunner === 8, "设置键 maxBoxesPerRunner 缺省 8")
    assert.equal(typeof REGISTRY.DEFAULT_SETTINGS.workspaceRoot, "string", "设置键 workspaceRoot 在场")
    assert.equal("joinTtlMinutes" in REGISTRY.DEFAULT_SETTINGS, false, "设置键 joinTtlMinutes 已删")
    assert.deepEqual(Object.keys(REGISTRY.DEFAULT_SETTINGS).length, REGISTRY.SETTING_KEYS.length)
  } finally {
    await app.close()
  }
})

// ── T14：终端升级腿传输按行择（修轮——TLS「生效面全谱」含终端族）────────────────────

test("T14 终端升级腿传输按行择：明文行 ⇒ http 传输（同一引用透传 ∥ 缺省不注入 ⇒ `node:http`）∥ TLS 行 ⇒ 三件材料逐值交 `https.request`（`createExecOps.start` 真消费）∥ 缺件 ⇒ 抛（零静默降级）", async () => {
  const config = { db: join(TEMP, "t14.db") }
  const key = CRYPTO.loadOrCreateCredentialKey(CRYPTO.credentialKeyPath(config))
  const plainRow = { id: 11, name: "plain-term", address: "http://10.0.0.5:2375", runtime_json: JSON.stringify({ apiVer: "1.44" }) }
  const tlsRow = {
    id: 12,
    name: "tls-term",
    address: "https://10.0.0.9:2376",
    runtime_json: JSON.stringify({ apiVer: "1.44" }),
    tls_ca: "CA-T14",
    tls_cert: "CERT-T14",
    tls_key_cipher: CRYPTO.encryptSecret("KEY-T14", key),
    tls_updated_at: "2026-10-14T00:00:00.000Z",
  }

  // —— 明文行 ⇒ http 传输被选（同一引用透传——零包装零旁路；缺省不注入 ⇒ docker-exec 缺省 = `node:http`）——
  const httpRecord = []
  const httpFake = fakeUpgradeRequest(httpRecord)
  assert.equal(TERMINAL.execUpgradeTransportFor(plainRow, { httpRequestImpl: httpFake }), httpFake, "明文行 ⇒ 透传既有注入（同一引用）")
  assert.equal(TERMINAL.execUpgradeTransportFor(plainRow, {}), undefined, "明文行缺省 ⇒ 不注入（`startExecTransport` 缺省 `node:http`——逐值同现状）")
  const httpsRecordA = []
  assert.equal(TERMINAL.execUpgradeTransportFor(plainRow, { httpsRequestImpl: fakeUpgradeRequest(httpsRecordA) }), undefined, "明文行 ⇒ 不因 https 缝在场而择 https（按行择）")
  assert.equal(httpsRecordA.length, 0, "明文行零涉 https 缝")
  // 端到端消费（经 `createExecOps.start` 走选定传输 ⇒ 101 达成；假件记账）
  const plainOps = EXEC.createExecOps({ client: { baseUrl: plainRow.address, apiVer: "1.44" }, httpRequestImpl: TERMINAL.execUpgradeTransportFor(plainRow, { httpRequestImpl: httpFake }) })
  const plainResult = await plainOps.start("exec-p")
  assert.equal(typeof plainResult.socket, "object", "明文行升级经选定 http 传输达成（101 裸 socket）")
  assert.deepEqual([httpRecord[0].method, httpRecord[0].host, httpRecord[0].port, httpRecord[0].path], ["POST", "10.0.0.5", 2375, "/v1.44/exec/exec-p/start"], "明文行请求形逐值（名/端口/路径）")

  // —— TLS 行 ⇒ https 传输被选（三件按行解密逐值入选项；http 缝零涉）——
  const httpsRecord = []
  const httpsBodies = []
  const httpsFake = fakeUpgradeRequest(httpsRecord, httpsBodies)
  const transport = TERMINAL.execUpgradeTransportFor(tlsRow, { config, httpRequestImpl: httpFake, httpsRequestImpl: httpsFake })
  assert.equal(typeof transport, "function", "TLS 行 ⇒ 材料感知传输（构造件）")
  const tlsOps = EXEC.createExecOps({ client: { baseUrl: tlsRow.address, apiVer: "1.44" }, httpRequestImpl: transport })
  const tlsResult = await tlsOps.start("exec-t")
  assert.equal(typeof tlsResult.socket, "object", "TLS 行升级经 https 传输达成（101 裸 socket）")
  assert.equal(httpsRecord.length, 1, "TLS 行升级一次 = https 缝一次")
  const [options] = httpsRecord
  assert.deepEqual([options.ca, options.cert, options.key], ["CA-T14", "CERT-T14", "KEY-T14"], "三件按行解密后逐值入请求选项（密文列不经手）")
  assert.deepEqual([options.method, options.host, options.port, options.path], ["POST", "10.0.0.9", 2376, "/v1.44/exec/exec-t/start"], "请求形逐值（同明文链）")
  assert.deepEqual(options.headers, { "content-type": "application/json", "content-length": Buffer.byteLength(JSON.stringify({ Detach: false, Tty: true })), connection: "Upgrade", upgrade: "tcp" }, "升级两头 + JSON 头（逐值）")
  assert.equal(httpsBodies[0], '{"Detach":false,"Tty":true}', "start 体原样入选定 https 传输")
  assert.equal(httpRecord.length, 1, "TLS 行零落 http 传输（明文链零交叉——计数不动）")

  // —— 缺件行 ⇒ 抛人话（不变量 `https` ⇔ 三件齐——零静默降级明文）——
  assert.throws(() => TERMINAL.execUpgradeTransportFor({ address: "https://10.0.0.9:2376" }, { config }), /材料不齐/, "TLS 行缺件 ⇒ 抛（不静默降级）")
})
