/**
 * 2026-10-13-sandbox-outbound-member-face.test.mjs — thincoder-server 批内单测件（`sandbox-outbound-member-face` 批 · 服务面：
 * 出站强制面求值/带入接线 ∥ 成员端点 `runnerName`；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-sandbox-outbound-member-face.test.mjs`
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/sandbox/SANDBOX.md` §4 强制面 ∥ §12 N64 ∥ B66 ∥ §14 KD-SV-136）：
 *   B66③ 零地址拒（`host` 在场而 `ips` 空 ⇒ `unresolved`——fail-closed）；直连 IP 径空目标 = `no_target`（既有义）∥ 双径同判（域名径 ∥ 直连 IP 径同判同序）
 *   ∥ N64① L1 命中即拒（`hard_deny`——显式 allow 在场仍拒；与 L2/L3 拒可辨 = 不可批准面；零副作用）
 *   ∥ N64② 内置允许 ≻ L2/L3（生命线不断——种子 deny ∥ 显式 deny 皆不可覆盖；端口逐值）
 *   ∥ N64③ 种子 deny ≺ 显式 allow（U2-A 保持）∥ 段值推导（host /24 ∥ 通配/非 IPv4 ⇒ null）
 *   ∥ B66① 首见带入（行入 + `rulesRev` +1 + 审计一行「自动带入」+ 段值逐值）∥ B66② 重复登记（零重行零动零审计）
 *   ∥ B66③-侧 段值推导落面（`host` /24 ∥ 通配/非 IPv4 ⇒ `null`——零行 + 登记读数如实标；§4 段值推导行）∥ 成员行 `runnerName`（绑定 ⇒ 名 ∥ 未绑定 ⇒ null）
 *   ∥ 恒本人过滤（他人工作区零出现）。
 * 假引擎 = 真 HTTP 假 Docker（真 fetch 链）；链路 = 进程内网关 + 账号面 + 沙盒面。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync } from "node:fs"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const SANDBOX = await load("thincoder-server/src/sandbox/routes.mjs")
const DOCKER = await load("thincoder-server/src/sandbox/docker.mjs")
const RULES = await load("thincoder-server/src/sandbox/rules.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")

const PASSWORD = "password-123"
const TEMP = mkdtempSync(join(tmpdir(), "tc-outbound-"))
const SERVER_HOST = "10.0.0.5" // 服务器段取值点 = 盒 env `OPENAI_BASE_URL` 地址（`sandboxPublicBase`——config.host/port）
const SERVER_PORT = 3000

/** 求值速记（rules = 库内全量规则——含 v11 种子行：RFC1918 三条 deny ∥ 默认单五条 allow）。 */
const evaluate = (db, query) => RULES.evaluateEgress(RULES.listRules(db), query)

// ── 假 Docker 引擎（真 HTTP——真 fetch 链；自检两读在案）────────────────────────

async function startFakeDocker() {
  const version = { Version: "29.1.3", ApiVersion: "1.52", MinAPIVersion: "1.44", Os: "linux", Arch: "amd64" }
  const calls = []
  const server = createServer((req, res) => {
    const chunks = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => {
      const url = new URL(req.url, "http://engine")
      calls.push({ method: req.method, path: url.pathname })
      const json = (status, payload) => {
        res.writeHead(status, { "content-type": "application/json" })
        res.end(JSON.stringify(payload))
      }
      const p = url.pathname.replace(/^\/v?[0-9.]+/, "") || "/"
      if (p === "/version") return json(200, version)
      if (p === "/info") return json(200, { ServerVersion: version.Version, Containers: 0, ContainersRunning: 0 })
      return json(404, { message: `unknown path ${url.pathname}` }) // 容器列表（删节点 keep 径）/collect ⇒ 不可达判据
    })
  })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    calls,
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
    },
  }
}

// ── 盒链假件（建工作区走建盒链——SSH = 逐条记录 ∥ Docker = 注入客户端；2026-10-14 随正）──────────

const NOW = 1_770_000_000_000 // 固定时钟（假件默认值用）

function fakeHost({ fail = () => false, stdoutOf = () => "" } = {}) {
  const calls = []
  const call = async (row, command, opts = {}) => {
    calls.push({ command, stdin: opts.stdin ?? null, label: opts.label ?? null })
    if (fail(command)) return { exitCode: 1, stdout: "", stderr: "boom（假件）" }
    return { exitCode: 0, stdout: stdoutOf(command), stderr: "" }
  }
  const run = async (row, command, opts = {}) => {
    const out = await call(row, command, opts)
    if (out.exitCode !== 0) throw new Error(`主机命令非零退出（exit=${out.exitCode}）：boom（假件）`)
    return out
  }
  return { calls, call, run, execOf: (row) => (command, opts = {}) => call(row, command, opts) }
}

/** 建盒链假主机：xfs 配额径 + nft 在位——项目 id / diskMb 由 `limit` 命令记忆（读回核自洽）。 */
function chainHost() {
  const memo = { projectId: 100001, diskMb: 4096 }
  return fakeHost({
    stdoutOf: (command) => {
      const limit = command.match(/limit -p bhard=(\d+)m (\d+)/)
      if (limit) {
        memo.diskMb = Number(limit[1])
        memo.projectId = Number(limit[2])
        return ""
      }
      if (command.includes("findmnt")) return "/ xfs rw,pquota\n"
      if (command.includes("xfs_info")) return "bsize=4096\n"
      if (command.includes("report -p -b -n")) return `${memo.projectId} 0 0 ${(memo.diskMb * 1024 * 1024) / 4096} 0 [------]\n`
      if (command === "command -v nft") return "/usr/sbin/nft\n"
      return ""
    },
  })
}

function fakeClient({ containers = [], network = null, archive = Buffer.from("tar-payload"), failOn = () => false } = {}) {
  const calls = []
  const state = { containers: containers.map((item) => ({ ...item })), network }
  const guard = (op) => {
    const message = failOn(op)
    if (message) {
      const e = new Error(message)
      e.status = 500
      throw e
    }
  }
  const find = (id) => state.containers.find((item) => item.Id === id)
  return {
    calls,
    state,
    info: async () => ({ json: { ServerVersion: "29.1.3", Containers: state.containers.length, ContainersRunning: 0 } }),
    containers: async () => {
      guard("containers")
      return { json: state.containers }
    },
    containerState: async (id) => {
      guard("containerState")
      const item = find(id) ?? {}
      return { state: { status: item.State ?? "stopped", running: item.State === "running", startedAt: item.StartedAt ?? new Date(NOW - 1000).toISOString(), finishedAt: null, exitCode: 0 } }
    },
    createNetwork: async (body) => {
      guard("createNetwork")
      state.network = { Name: body.Name, Options: body.Options, IPAM: { Config: [{ Subnet: "172.31.9.0/24" }] } }
      calls.push({ op: "createNetwork", body })
      return { json: { Id: "net-1" } }
    },
    inspectNetwork: async (name) => {
      calls.push({ op: "inspectNetwork", name })
      if (state.network === null) {
        const e = new Error("network not found")
        e.status = 404
        throw e
      }
      return { json: state.network }
    },
    deleteNetwork: async (name) => {
      calls.push({ op: "deleteNetwork", name })
      state.network = null
      return { json: {} }
    },
    archiveGet: async (id, path) => {
      guard("archiveGet")
      calls.push({ op: "archiveGet", id, path })
      return { status: 200, buffer: archive }
    },
    archivePut: async (id, path, tar) => {
      guard("archivePut")
      calls.push({ op: "archivePut", id, path, bytes: tar.length })
      return { status: 200, json: { message: "ok" } }
    },
    createContainer: async (name, body) => {
      guard("createContainer")
      const item = { Id: `c${state.containers.length + 1}`, Names: [`/${name}`], State: "created", StartedAt: new Date(NOW - 1000).toISOString() }
      state.containers.push(item)
      calls.push({ op: "createContainer", name, body })
      return { json: { Id: item.Id } }
    },
    startContainer: async (ref) => {
      guard("startContainer")
      const item = find(ref) ?? state.containers.find((entry) => String(entry.Names?.[0] ?? "").replace(/^\//, "") === ref)
      if (item) item.State = "running"
      calls.push({ op: "startContainer", ref })
      return { json: {} }
    },
    stopContainer: async (ref) => {
      guard("stopContainer")
      const item = find(ref) ?? state.containers.find((entry) => String(entry.Names?.[0] ?? "").replace(/^\//, "") === ref)
      if (item) item.State = "exited"
      calls.push({ op: "stopContainer", ref })
      return { json: {} }
    },
    deleteContainer: async (ref, opts = {}) => {
      guard("deleteContainer")
      calls.push({ op: "deleteContainer", ref, force: opts.force })
      state.containers = state.containers.filter((entry) => entry.Id !== ref && String(entry.Names?.[0] ?? "").replace(/^\//, "") !== ref)
      return { json: {} }
    },
    imageDetail: async (ref) => {
      throw new DOCKER.DockerError("api", `No such image: ${ref}`, { status: 404, apiMessage: `No such image: ${ref}` })
    },
    pullImage: async () => ({ text: "" }),
    buildImage: async () => ({ text: "" }),
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

async function startApp({ host = SERVER_HOST, port = SERVER_PORT } = {}) {
  const db = DB.openDatabase(":memory:")
  await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  await MEMBERS.createMember(db, { username: "bob", role: "user", password: PASSWORD })
  await MEMBERS.createMember(db, { username: "carol", role: "user", password: PASSWORD })
  const routes = SERVER.createRouteTable()
  const config = CONFIG.validateConfig({ host, port, db: join(TEMP, "gateway.db") })
  SANDBOX.registerSandboxRoutes(routes, { db, config, log: null, deps: { host: chainHost(), clientForRunner: () => fakeClient() } })
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
  const adminCookie = await login("admin")
  const memberCookie = { bob: await login("bob"), carol: await login("carol") }
  return {
    db,
    base,
    memberCookie,
    /** 控制台面调用（admin 会话）。 */
    api: (method, path, options = {}) => call(base, method, path, { cookie: adminCookie, ...options }),
    /** 规则面读数（`GET /api/admin/sandbox/rules`——`{ rules, rulesRev }`）。 */
    rulesState: async () => {
      const res = await call(base, "GET", "/api/admin/sandbox/rules", { cookie: adminCookie })
      assert.equal(res.status, 200, `规则面读数失败：${res.text}`)
      return res.json
    },
    /** 审计行（按 `type`）。 */
    auditRows: (type) => db.prepare("SELECT * FROM audit_events WHERE type = ? ORDER BY id").all(type),
    /** `sandbox_event` 行（按 `detail.kind`）。 */
    audits: (kind) => db.prepare("SELECT * FROM audit_events WHERE type = 'sandbox_event' ORDER BY id").all().filter((row) => JSON.parse(row.detail ?? "{}").kind === kind),
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}

/** 添节点（走真自检链）。出 = 节点行。 */
async function addRunner(app, name, address) {
  const res = await app.api("POST", "/api/admin/sandbox/runners", { body: { name, address } })
  assert.equal(res.status, 200, `添节点失败：${res.text}`)
  return res.json.runner
}

/** 建工作区（控制台面——写门需可用节点）。出 = 工作区行。 */
async function createWorkspace(app, name, username) {
  const owner = MEMBERS.findMemberByUsername(app.db, username)
  const res = await app.api("POST", "/api/admin/sandbox/workspaces", { body: { name, ownerMemberId: owner.id } })
  assert.equal(res.status, 200, `建工作区失败：${res.text}`)
  return res.json.workspace
}

// ── 求值腿（零地址 ∥ 双径同判 ∥ N64①②③）──────────────────────────────────────

test("B66③ 零地址拒（fail-closed）：`host` 在场而 `ips` 空 ⇒ 拒（域名 allow 命中亦不放行）∥ 直连 IP 径空目标 = `no_target`", () => {
  const db = DB.openDatabase(":memory:")
  try {
    const unresolved = evaluate(db, { host: "github.com", ips: [], port: 443, protocol: "tcp" })
    assert.deepEqual([unresolved.action, unresolved.reason], ["deny", "unresolved"], "解析零地址 ⇒ 拒（不得以「未解析」放行——即便该域在默认单）")
    assert.equal(unresolved.rule, null, "零地址拒无规则对象（未解析不放行 = 门级语义）")

    const empty = evaluate(db, { ips: [] })
    assert.deepEqual([empty.action, empty.reason], ["deny", "no_target"], "直连 IP 径空目标 = 既有 `no_target`（两义分立）")
  } finally {
    db.close()
  }
})

test("N64① L1 命中即拒：两径同判 ∥ 显式 allow 在场仍拒（不可批准面——与 L2/L3 拒可辨）∥ 零副作用", () => {
  const db = DB.openDatabase(":memory:")
  try {
    // 两面铺显式 allow（域名 ∥ 直连 IP）+ 表内铺同段行——L1 仍不可绕（非行）
    RULES.createRule(db, { kind: "domain", action: "allow", target: "metadata.example.com" })
    RULES.createRule(db, { kind: "cidr", action: "allow", target: "169.254.169.254/32" })
    RULES.createRule(db, { kind: "cidr", action: "allow", target: "127.0.0.1/32" })
    RULES.ensureSegmentDeny(db, "169.254.169.0/24")

    const viaDomain = evaluate(db, { host: "metadata.example.com", ips: ["169.254.169.254"], port: 80, protocol: "tcp" })
    const viaIp = evaluate(db, { ips: ["169.254.169.254"], port: 80, protocol: "tcp" })
    assert.deepEqual([viaDomain.action, viaDomain.reason], ["deny", "hard_deny"], "域名径：解析 IP 落 169.254/16 ⇒ L1 即拒（allow 条目不可绕）")
    assert.deepEqual([viaIp.action, viaIp.reason, viaIp.ip], ["deny", "hard_deny", "169.254.169.254"], "直连 IP 径：同判同序")
    assert.equal(viaDomain.rule, null, "L1 = 门级（非行）——表内行不参与")

    const loop = evaluate(db, { ips: ["127.0.0.1"], port: 22, protocol: "tcp" })
    assert.deepEqual([loop.action, loop.reason], ["deny", "hard_deny"], "127/8 = L1（回环）")

    // 即时拒 = 与 L2 拒（`ip_deny`）可辨的独立理由码（挂起窗只服务 L2/L3 新域——§6）
    const l2 = evaluate(db, { ips: ["10.0.0.9"], port: 80, protocol: "tcp" })
    assert.deepEqual([l2.action, l2.reason], ["deny", "ip_deny"], "对照：L2 种子 deny 命中 = `ip_deny`（可批准面）")
    assert.equal(db.prepare("SELECT COUNT(*) AS n FROM sandbox_pending").get().n, 0, "求值零副作用——零待批行（L1 不挂起）")
  } finally {
    db.close()
  }
})

test("N64② 内置允许 ≻ L2/L3：网关地址:端口命中即放（生命线不断）∥ 显式 deny 亦不可覆盖 ∥ 端口逐值", () => {
  const db = DB.openDatabase(":memory:")
  try {
    RULES.ensureSegmentDeny(db, "10.0.0.0/24") // 服务器段种子 deny（登记带入形）
    RULES.createRule(db, { kind: "cidr", action: "deny", target: "10.0.0.5/32" }) // L3 显式 deny 同目标（最严档）
    const gateway = [{ kind: "cidr", target: "10.0.0.5/32", port: SERVER_PORT }]

    const bare = evaluate(db, { ips: ["10.0.0.5"], port: SERVER_PORT, protocol: "tcp" })
    assert.deepEqual([bare.action, bare.reason], ["deny", "ip_deny"], "基线：无内置允许 ⇒ 种子 deny/显式 deny 命中（生命线会断）")

    const lifeline = evaluate(db, { ips: ["10.0.0.5"], port: SERVER_PORT, protocol: "tcp", builtinAllow: gateway })
    assert.deepEqual([lifeline.action, lifeline.reason, lifeline.rule], ["allow", "builtin_allow", null], "内置允许在场 ⇒ 放（≻ L2 种子 deny ∥ ≻ L3 显式 deny）")

    const byName = evaluate(db, { host: "server.internal", ips: ["10.0.0.5"], port: SERVER_PORT, builtinAllow: [{ kind: "domain", target: "server.internal", port: SERVER_PORT }] })
    assert.deepEqual([byName.action, byName.reason], ["allow", "builtin_allow"], "域名形网关：域名径同判（双径同判）")

    const otherPort = evaluate(db, { ips: ["10.0.0.5"], port: 22, protocol: "tcp", builtinAllow: gateway })
    assert.deepEqual([otherPort.action, otherPort.reason], ["deny", "ip_deny"], "端口不符 ⇒ 非生命线（:端口 逐值——宿主 22 口即 P2 形态）")

    const wrongHost = evaluate(db, { ips: ["10.0.0.6"], port: SERVER_PORT, protocol: "tcp", builtinAllow: gateway })
    assert.deepEqual([wrongHost.action, wrongHost.reason], ["deny", "ip_deny"], "地址不符 ⇒ 非生命线")
  } finally {
    db.close()
  }
})

test("N64③ 种子 deny ≺ 显式 allow（U2-A 保持）：显式 allow 开 RFC1918 单点 ∥ 同段余址照拒", () => {
  const db = DB.openDatabase(":memory:")
  try {
    const before = evaluate(db, { ips: ["10.0.0.7"], port: 8080, protocol: "tcp" })
    assert.deepEqual([before.action, before.reason], ["deny", "ip_deny"], "种子 deny：RFC1918 默认拒")
    const allow = RULES.createRule(db, { kind: "cidr", action: "allow", target: "10.0.0.7/32" })
    const after = evaluate(db, { ips: ["10.0.0.7"], port: 8080, protocol: "tcp" })
    assert.deepEqual([after.action, after.reason], ["allow", "ip_allow"], "显式 allow 可开种子 deny（U2——内网后端可用）")
    const neighbor = evaluate(db, { ips: ["10.0.0.8"], port: 8080, protocol: "tcp" })
    assert.deepEqual([neighbor.action, neighbor.reason], ["deny", "ip_deny"], "同段余址不随开（种子行按目标判）")
    RULES.deleteRule(db, allow.rule.id, {})
    const reopened = evaluate(db, { ips: ["10.0.0.7"], port: 8080, protocol: "tcp" })
    assert.deepEqual([reopened.action, reopened.reason], ["deny", "ip_deny"], "撤显式 allow ⇒ 回落种子 deny（U2-A 两端逐值）")
  } finally {
    db.close()
  }
})

test("双径同判（L2）：域名命中 allow ⇒ 解析 IP 仍过 CIDR 闸 ∥ 与直连 IP 径同判同序（白名单域名 + 内网解析不绕过）", () => {
  const db = DB.openDatabase(":memory:")
  try {
    RULES.createRule(db, { kind: "domain", action: "allow", target: "intranet.example.com" })
    const viaDomain = evaluate(db, { host: "intranet.example.com", ips: ["10.0.0.9"], port: 8443, protocol: "tcp" })
    const viaIp = evaluate(db, { ips: ["10.0.0.9"], port: 8443, protocol: "tcp" })
    assert.deepEqual([viaDomain.action, viaDomain.reason], ["deny", "ip_deny"], "域名径：域名 allow 命中 ⇒ 解析 IP 仍过闸（种子 deny ⇒ 拒）")
    assert.deepEqual([viaIp.action, viaIp.reason], ["deny", "ip_deny"], "直连 IP 径：同判同序（同一理由码）")
  } finally {
    db.close()
  }
})

test("段值推导（`segmentCidrOf`）：登记地址/URL ⇒ host 所属 /24（归一形）∥ 通配/非 IPv4/空 ⇒ null（零行 + 如实标）", () => {
  for (const ok of ["10.0.0.6", "10.0.0.6:2375", "http://10.0.0.6:2375", "http://10.0.0.5:3000/v1", "192.168.1.200"]) {
    assert.equal(RULES.segmentCidrOf(ok), ok.startsWith("192.168") ? "192.168.1.0/24" : "10.0.0.0/24", `收并取段：${ok}`)
  }
  for (const bad of ["0.0.0.0", "0.0.0.0:3000", "http://0.0.0.0:3000/v1", "server.internal:2375", "localhost", "", null, 42, "[::1]:80"]) {
    assert.equal(RULES.segmentCidrOf(bad), null, `不可推导 ⇒ null（零行 + 读数如实标）：${String(bad)}`)
  }
})

// ── 带入腿（B66①②③——节点登记 handler 接线）──────────────────────────────────

test("B66① 首次登记带入：节点段 ∥ 服务器段各行入（`source='default'`）∥ `rulesRev` +2 ∥ 审计两行「自动带入」+ 段值逐值", async () => {
  const engine = await startFakeDocker()
  const app = await startApp()
  try {
    const before = await app.rulesState()
    await addRunner(app, "node-a", engine.base)
    const after = await app.rulesState()
    assert.equal(after.rulesRev, before.rulesRev + 2, "两段首见 ⇒ `rulesRev` +2")

    const imported = after.rules.filter((rule) => rule.createdBy === "auto")
    const byTarget = Object.fromEntries(imported.map((rule) => [rule.target, rule]))
    assert.deepEqual(Object.keys(byTarget).sort(), ["10.0.0.0/24", "127.0.0.0/24"], "段值逐值（服务器段 = `OPENAI_BASE_URL` host /24 ∥ 节点段 = 登记地址 host /24）")
    for (const [target, rule] of Object.entries(byTarget)) {
      assert.deepEqual([rule.kind, rule.action, rule.source, rule.port, rule.protocol], ["cidr", "deny", "default", null, null], `${target}：种子 deny 行（可改可删）`)
    }

    const rulesAudits = app.auditRows("sandbox_rule")
    assert.equal(rulesAudits.length, 2, "审计恰两行（各段一行）")
    const details = rulesAudits.map((row) => JSON.parse(row.detail))
    assert.deepEqual(details.map((item) => [item.segment, item.autoImport]).sort(), [["10.0.0.0/24", "自动带入"], ["127.0.0.0/24", "自动带入"]], "detail：段值逐值 + 明写「自动带入」")
    assert.deepEqual(details.map((item) => item.rule.target).sort(), ["10.0.0.0/24", "127.0.0.0/24"], "规则原文同携")

    const add = JSON.parse(app.audits("runner_add").at(-1).detail)
    assert.deepEqual([add.runnerId, add.address], [1, engine.base], "登记审计既有两键保持")
    assert.deepEqual(
      add.segments.map((item) => [item.kind, item.cidr, item.state]),
      [["runner", "127.0.0.0/24", "imported"], ["server", "10.0.0.0/24", "imported"]],
      "登记读数：逐项如实（kind ∥ 段值 ∥ 状态）",
    )
  } finally {
    await app.close()
    await engine.close()
  }
})

test("B66② 重复登记（段已在）：零重行 ∥ `rulesRev` 零动 ∥ 零审计（读数 = `present`）", async () => {
  const engineA = await startFakeDocker()
  const engineB = await startFakeDocker()
  const app = await startApp()
  try {
    await addRunner(app, "node-a", engineA.base)
    const mid = await app.rulesState()
    const ids = mid.rules.map((rule) => rule.id)
    const auditCount = app.auditRows("sandbox_rule").length
    await addRunner(app, "node-b", engineB.base) // 同 host ⇒ 同 /24（节点段已在）；服务器段同源（已在）
    const after = await app.rulesState()
    assert.equal(after.rulesRev, mid.rulesRev, "`rulesRev` 零动")
    assert.deepEqual(after.rules.map((rule) => rule.id), ids, "零重行（规则 id 集不变）")
    assert.equal(app.auditRows("sandbox_rule").length, auditCount, "零审计行")
    const add = JSON.parse(app.audits("runner_add").at(-1).detail)
    assert.deepEqual(add.segments.map((item) => item.state), ["present", "present"], "登记读数如实：段已在（零重行零动零审计）")
  } finally {
    await app.close()
    await engineA.close()
    await engineB.close()
  }
})

test("段值推导（§4 行——配置通配 `0.0.0.0`）：服务器段零行 + 登记读数如实标（`underivable`——不猜、不静默）", async () => {
  const engine = await startFakeDocker()
  const app = await startApp({ host: "0.0.0.0" })
  try {
    const before = await app.rulesState()
    await addRunner(app, "node-w", engine.base)
    const after = await app.rulesState()
    assert.equal(after.rules.some((rule) => rule.target === "0.0.0.0/24"), false, "通配 ⇒ 该项零行")
    assert.equal(after.rulesRev, before.rulesRev + 1, "仅节点段一行 ⇒ `rulesRev` +1")
    const add = JSON.parse(app.audits("runner_add").at(-1).detail)
    const server = add.segments.find((item) => item.kind === "server")
    assert.deepEqual([server.address, server.cidr, server.state], [`http://0.0.0.0:${SERVER_PORT}/v1`, null, "underivable"], "服务器段如实标（不静默）")
    const runner = add.segments.find((item) => item.kind === "runner")
    assert.deepEqual([runner.cidr, runner.state], ["127.0.0.0/24", "imported"], "仅不可推导项零行（节点段照常代入）")
    assert.equal(app.auditRows("sandbox_rule").length, 1, "审计一行（仅节点段）")
  } finally {
    await app.close()
    await engine.close()
  }
})

// ── 成员面腿（`runnerName` 两支 ∥ 恒本人过滤）──────────────────────────────────

test("成员行 `runnerName`：绑定 ⇒ 节点名 ∥ 未绑定 ⇒ null ∥ 恒本人过滤（他人工作区零出现）", async () => {
  const engineA = await startFakeDocker()
  const engineB = await startFakeDocker()
  const app = await startApp()
  try {
    const nodeA = await addRunner(app, "node-a", engineA.base)
    const ws1 = await createWorkspace(app, "bob-ws", "bob")
    assert.equal(ws1.runnerName, "node-a", "建面同拍：放置 ⇒ 绑定节点名")

    // 容量门：node-b 只容一盒（满员 ⇒ 无候选 ⇒ 留未绑）
    app.db.prepare("INSERT INTO sandbox_settings (k, v) VALUES ('maxBoxesPerRunner', ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v").run(JSON.stringify(1))

    // 弃置续跑（2026-10-14 随正）：卸 node-a（保留卷）⇒ 行归一 + 立即重放置（有在线候选 ⇒ 重绑 node-b；链尾 await——确定性）
    await addRunner(app, "node-b", engineB.base)
    const del = await app.api("DELETE", `/api/admin/sandbox/runners/${nodeA.id}`, { body: { containers: "keep", confirm: true } })
    assert.equal(del.status, 200, `卸节点失败：${del.text}`)

    const bob = await call(app.base, "GET", "/api/me/sandbox/workspaces", { cookie: app.memberCookie.bob })
    assert.equal(bob.status, 200, `成员面读数失败：${bob.text}`)
    assert.deepEqual(bob.json.workspaces.map((row) => row.name), ["bob-ws"], "恒本人过滤：carol 的工作区零出现")
    const row = bob.json.workspaces[0]
    assert.deepEqual(Object.keys(row).sort(), ["boxState", "checkpointCount", "id", "name", "pending", "runnerName", "stopReason"], "行形逐键（§2.7——`dirty` 键退场随 D 裁 2026-10-14）")
    assert.equal(row.runnerName, "node-b", "弃置续跑 ⇒ 重绑在线节点（绑定 ⇒ 节点名）")
    assert.equal(row.pending, null, "无待批 ⇒ null")

    // 未绑定支：node-b 满员（maxBoxesPerRunner = 1）⇒ 创建无候选 ⇒ 留未绑 ⇒ null
    const ws2 = await createWorkspace(app, "carol-ws", "carol")
    assert.equal(ws2.runnerName, null, "满员无候选 ⇒ 创建留未绑")
    const carol = await call(app.base, "GET", "/api/me/sandbox/workspaces", { cookie: app.memberCookie.carol })
    assert.deepEqual(carol.json.workspaces.map((item) => [item.name, item.runnerName]), [["carol-ws", null]], "未绑定 ⇒ null（端侧呈「未绑定」）∥ 只见本人")
  } finally {
    await app.close()
    await engineA.close()
    await engineB.close()
  }
})
