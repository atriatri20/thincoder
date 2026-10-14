/**
 * 2026-10-11-sandbox-volumes.test.mjs — thincoder-server 批内单测件（`sandbox-volumes` 批 · 服务面——卷族两端点；
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-11-sandbox-volumes.test.mjs`
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/sandbox/SANDBOX.md` §12 用例表；腿 ↔ 用例在括号）：
 *   N62（列表逐值（`Volumes` 缺/null ⇒ `[]`；零审计）∥ 删除 204 ⇒ 200 + 审计 `volume_delete`（detail 键集逐值））
 *   ∥ N63（建容器卷两腿：引擎体 `Binds` 逐值 ∥ **零建卷调用**——零 `POST /volumes/create`）
 *   ∥ E48（在用卷 409 ⇒ 400 人话 + 处置句携引擎原文；卷在零删；零审计）
 *   ∥ E49（无此卷 404 ∥ 名形非法 400 **零外呼** ∥ 不可达 502 ∥ `user` 403 ∥ 无会话 401）
 *   ∥ 纯函数腿（`normalizeVolumeTarget` ∥ `volumeView` ∥ `volumeDeleteFailure` 三映射）。
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
const REGISTRY = await load("thincoder-server/src/sandbox/registry.mjs")
const VOLUMES = await load("thincoder-server/src/sandbox/volume-routes.mjs")
const DOCKER = await load("thincoder-server/src/sandbox/docker.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")

const PASSWORD = "password-123"
const TEMP = mkdtempSync(join(tmpdir(), "tc-volumes-"))

/** 引擎列表样件（真机字段形——`Name`/`Driver`/`CreatedAt` 三字段）。 */
const VOLUMES_SAMPLE = {
  Volumes: [
    { Name: "vol-a", Driver: "local", CreatedAt: "2026-10-11T05:00:00Z" },
    { Name: "vol-b", Driver: "local", CreatedAt: "2026-10-10T05:00:00Z" },
  ],
  Warnings: null,
}

// ── 假 Docker 引擎（真 HTTP——真 fetch 链；调用逐条在 `calls`）────────────────────

async function startFakeDocker(opts = {}) {
  const version = opts.version ?? { Version: "29.1.3", ApiVersion: "1.52", MinAPIVersion: "1.44", Os: "linux", Arch: "amd64" }
  const calls = []
  const server = createServer((req, res) => {
    const chunks = []
    req.on("data", (chunk) => chunks.push(chunk))
    req.on("end", () => {
      const url = new URL(req.url, "http://engine")
      const raw = Buffer.concat(chunks).toString("utf8")
      let body = null
      try {
        body = raw === "" ? null : JSON.parse(raw)
      } catch {
        body = raw
      }
      calls.push({ method: req.method, path: url.pathname, query: url.search, body })
      const json = (status, payload) => {
        res.writeHead(status, { "content-type": "application/json" })
        res.end(payload === undefined ? "" : JSON.stringify(payload))
      }
      const p = url.pathname.replace(/^\/v?[0-9.]+/, "") || "/"
      if (p === "/version") return json(200, version)
      if (p === "/info") return json(200, { ServerVersion: version.Version })
      if (p === "/volumes" && req.method === "GET") return json(200, opts.volumesSample ?? VOLUMES_SAMPLE)
      const volume = /^\/volumes\/(.+)$/.exec(p)
      if (volume && req.method === "DELETE") {
        const name = decodeURIComponent(volume[1])
        if (opts.volumeRemoveFail === "conflict" || name === "in-use") {
          return json(409, { message: `remove ${name}: volume is in use - [4f8a9c2b7d1e]` })
        }
        if (opts.volumeRemoveFail === "notFound" || name === "ghost") return json(404, { message: `get ${name}: no such volume` })
        return json(204)
      }
      if (p === "/containers/create" && req.method === "POST") {
        return json(201, { Id: "ctr-new", Warnings: [] })
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
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
    },
  }
}

/** 死地址（监听即关——连不上）：不可达腿。 */
async function deadBase() {
  const engine = await startFakeDocker()
  const base = engine.base
  await engine.close()
  return base
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

async function startApp() {
  const db = DB.openDatabase(":memory:")
  await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  await MEMBERS.createMember(db, { username: "bob", role: "user", password: PASSWORD })
  const routes = SERVER.createRouteTable()
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(TEMP, "gateway.db") })
  SANDBOX.registerSandboxRoutes(routes, { db, config, log: null })
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
    adminCookie: await login("admin"),
    userCookie: await login("bob"),
    /** 审计行（按 kind 筛——列 `detail`）。 */
    audits: (kind) => db.prepare("SELECT * FROM audit_events WHERE type = 'sandbox_event' ORDER BY id").all().filter((row) => JSON.parse(row.detail ?? "{}").kind === kind),
    auditCount: () => db.prepare("SELECT COUNT(*) AS n FROM audit_events WHERE type = 'sandbox_event'").get().n,
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}

/** 添节点（走真自检链）。出 = 节点行。 */
async function addRunner(app, name, address) {
  const res = await call(app.base, "POST", "/api/admin/sandbox/runners", { cookie: app.adminCookie, body: { name, address } })
  assert.equal(res.status, 200, `添节点失败：${res.text}`)
  return res.json.runner
}

const api = (app, method, path, options = {}) => call(app.base, method, path, { cookie: app.adminCookie, ...options })
const volumeCalls = (engine, method = null) => engine.calls.filter((item) => item.path.includes("/volumes") && (method === null || item.method === method))

// ── 纯函数腿（名形 ∥ 逐值 ∥ 三映射）────────────────────────────────────────────

test("纯函数：`normalizeVolumeTarget` 名形（非法 ⇒ 抛）∥ `volumeView` 逐值 ∥ `volumeDeleteFailure` 三映射", () => {
  for (const ok of ["vol-a", "box_data.1", "A9"]) assert.equal(VOLUMES.normalizeVolumeTarget(ok), ok, `收：${ok}`)
  for (const bad of ["../x", "a b", "-lead", ".hidden", "..%2Fx", "a/b", ""]) {
    assert.throws(() => VOLUMES.normalizeVolumeTarget(bad), `拒：${bad}`)
  }
  assert.deepEqual(
    VOLUMES.volumeView({ Name: "v", Driver: "local", CreatedAt: "2026-10-11T05:00:00Z" }),
    { name: "v", driver: "local", createdAt: "2026-10-11T05:00:00Z" },
    "逐值（名/驱动/创建时间如实）",
  )
  assert.deepEqual(VOLUMES.volumeView(), { name: null, driver: null, createdAt: null }, "缺字段 ⇒ null（不假装）")

  const conflict = VOLUMES.volumeDeleteFailure(new DOCKER.DockerError("api", "x", { status: 409, apiMessage: "remove vol-a: volume is in use - [4f8a]" }))
  assert.deepEqual([conflict.code, conflict.status], ["invalid_request_error", 400], "409（在用卷）⇒ 400")
  assert.ok(conflict.message.includes("卷正被容器使用") && conflict.message.includes("volume is in use - [4f8a]") && conflict.message.includes("先删除或改用"), "人话 + 引擎原文 + 处置句")
  const missing = VOLUMES.volumeDeleteFailure(new DOCKER.DockerError("api", "x", { status: 404, apiMessage: "get ghost: no such volume" }))
  assert.deepEqual([missing.code, missing.status], ["not_found", 404], "404 ⇒ 404 not_found")
  const other = VOLUMES.volumeDeleteFailure(new DOCKER.DockerError("api", "x", { status: 500, apiMessage: "boom" }))
  assert.equal(other.status, 502, "余 api ⇒ 502")
  assert.equal(VOLUMES.volumeDeleteFailure(new DOCKER.DockerError("unreachable", "节点不可达")).status, 502, "非 api ⇒ 502")
})

// ── N62 列表 ∥ 删除 ∥ 零审计 ───────────────────────────────────────────────────

test("N62 卷列表逐值：`{ volumes: [{ name, driver, createdAt }] }` ∥ `Volumes` 缺/null ⇒ `[]` ∥ 零审计", async () => {
  const engine = await startFakeDocker()
  const app = await startApp()
  try {
    const runner = await addRunner(app, "node-vol", engine.base)
    const before = app.auditCount()
    const res = await api(app, "GET", `/api/admin/sandbox/runners/${runner.id}/volumes`)
    assert.equal(res.status, 200)
    assert.deepEqual(res.json.volumes, [
      { name: "vol-a", driver: "local", createdAt: "2026-10-11T05:00:00Z" },
      { name: "vol-b", driver: "local", createdAt: "2026-10-10T05:00:00Z" },
    ], "列表逐值（三字段如实取）")
    const read = volumeCalls(engine, "GET").at(-1)
    assert.equal(read.path, "/v1.44/volumes", "引擎读数路径逐值（协商版本前缀 1.44 属实）")
    assert.equal(app.auditCount(), before, "列表零审计")

    const empty = await startFakeDocker({ volumesSample: { Warnings: null } })
    const app2 = await startApp()
    try {
      const runner2 = await addRunner(app2, "node-empty", empty.base)
      const res2 = await api(app2, "GET", `/api/admin/sandbox/runners/${runner2.id}/volumes`)
      assert.deepEqual([res2.status, res2.json.volumes], [200, []], "`Volumes` 缺 ⇒ []（非错）")
    } finally {
      await app2.close()
      await empty.close()
    }
  } finally {
    await app.close()
    await engine.close()
  }
})

test("N62 删卷：204 ⇒ 200 `{ ok, name }` + 审计 `volume_delete`（detail 键集逐值）∥ 引擎 DELETE 命中", async () => {
  const engine = await startFakeDocker()
  const app = await startApp()
  try {
    const runner = await addRunner(app, "node-del", engine.base)
    const before = app.auditCount()
    const res = await api(app, "DELETE", `/api/admin/sandbox/runners/${runner.id}/volumes/vol-a`)
    assert.deepEqual([res.status, res.json], [200, { ok: true, name: "vol-a" }], "204 ⇒ 200 `{ ok, name }`")
    const del = volumeCalls(engine, "DELETE").at(-1)
    assert.equal(del.path.endsWith("/volumes/vol-a"), true, "引擎调用命中（名逐值）")
    const audits = app.audits("volume_delete")
    assert.equal(audits.length, 1, "审计一行")
    const detail = JSON.parse(audits[0].detail)
    assert.deepEqual(Object.keys(detail).sort(), ["kind", "runnerId", "volume"], "detail 键集 = kind+runnerId+volume")
    assert.deepEqual([detail.kind, detail.runnerId, detail.volume], ["volume_delete", runner.id, "vol-a"], "detail 逐值")
    assert.equal(app.auditCount(), before + 1, "恰一行（无余审计）")
  } finally {
    await app.close()
    await engine.close()
  }
})

// ── E48 在用卷 ∥ E49 错误面 ────────────────────────────────────────────────────

test("E48 在用卷：引擎 409 ⇒ 400 人话 + 处置句（携原文）∥ 卷在（零删）∥ 零审计（可重试）", async () => {
  const engine = await startFakeDocker()
  const app = await startApp()
  try {
    const runner = await addRunner(app, "node-inuse", engine.base)
    const before = app.auditCount()
    const res = await api(app, "DELETE", `/api/admin/sandbox/runners/${runner.id}/volumes/in-use`)
    assert.equal(res.status, 400, "409 ⇒ 400（零新码）")
    assert.equal(res.json.error.code, "invalid_request_error")
    assert.match(res.json.error.message, /卷正被容器使用——无法删除/, "人话")
    assert.match(res.json.error.message, /volume is in use - \[4f8a9c2b7d1e\]/, "引擎原文如实携")
    assert.match(res.json.error.message, /请先删除或改用该卷的容器，再试/, "处置句")
    assert.equal(app.auditCount(), before, "零审计（未删成）")
    // 不可达重试面另腿；此处 = 可重试语义（窗不关）由 UI 件断言——服务面只保证 400 可再打
    const retry = await api(app, "DELETE", `/api/admin/sandbox/runners/${runner.id}/volumes/vol-a`)
    assert.equal(retry.status, 200, "同窗可重试（再打可成）")
  } finally {
    await app.close()
    await engine.close()
  }
})

test("E49 删卷错误面：404 ∥ 名形非法 400 零外呼 ∥ 不可达 502 ∥ user 403 ∥ 无会话 401", async () => {
  const engine = await startFakeDocker()
  const app = await startApp()
  try {
    const runner = await addRunner(app, "node-err", engine.base)
    const missing = await api(app, "DELETE", `/api/admin/sandbox/runners/${runner.id}/volumes/ghost`)
    assert.equal(missing.status, 404, "无此卷 ⇒ 404")
    assert.equal(missing.json.error.code, "not_found")
    assert.match(missing.json.error.message, /no such volume/, "携引擎原文")

    for (const bad of ["..%2Fx", "a%20b", "-lead"]) {
      const callsBefore = engine.calls.length
      const res = await api(app, "DELETE", `/api/admin/sandbox/runners/${runner.id}/volumes/${bad}`)
      assert.equal(res.status, 400, `名形非法 ⇒ 400：${bad}`)
      assert.equal(engine.calls.length, callsBefore, `零外呼：${bad}`)
    }

    const dead = await deadBase()
    const deadRunner = REGISTRY.insertRunner(app.db, { name: "node-dead-vol", address: dead, runtime: { apiVer: "1.44", version: "29.1.3" } })
    const unreachable = await api(app, "DELETE", `/api/admin/sandbox/runners/${deadRunner.id}/volumes/vol-a`)
    assert.equal(unreachable.status, 502, "不可达 ⇒ 502")
    assert.equal(unreachable.json.error.code, "upstream_error")

    const asUser = await call(app.base, "DELETE", `/api/admin/sandbox/runners/${runner.id}/volumes/vol-a`, { cookie: app.userCookie })
    assert.equal(asUser.status, 403, "user ⇒ 403")
    const anonymous = await call(app.base, "DELETE", `/api/admin/sandbox/runners/${runner.id}/volumes/vol-a`)
    assert.equal(anonymous.status, 401, "无会话 ⇒ 401")
    const anonymousList = await call(app.base, "GET", `/api/admin/sandbox/runners/${runner.id}/volumes`)
    assert.equal(anonymousList.status, 401, "列表面同判权")
  } finally {
    await app.close()
    await engine.close()
  }
})

// ── N63 建容器卷两腿（`Binds` 逐值 ∥ 零建卷调用）─────────────────────────────

test("N63 建容器卷两腿：选已有卷 ∥ 手输新名——引擎体 `Binds` 逐值 ∥ 零建卷调用（假件断）∥ 命令三态（缺省 ⇒ 待命 ∥ 自定义 ⇒ 空格切分 ∥ 空串 ⇒ 400——轻通道笔 10）", async () => {
  const engine = await startFakeDocker()
  const app = await startApp()
  try {
    const runner = await addRunner(app, "node-bind", engine.base)
    const first = await api(app, "POST", `/api/admin/sandbox/runners/${runner.id}/containers`, { body: { name: "box-v1", image: "thincoder-sandbox:1", volume: "vol-a" } })
    assert.equal(first.status, 200, "建容器（选已有卷腿）")
    const create1 = engine.calls.filter((item) => item.path.endsWith("/containers/create")).at(-1)
    assert.equal(create1.query, "?name=box-v1", "名经 query 传")
    assert.deepEqual(create1.body.HostConfig, { Binds: ["vol-a:/workspace"] }, "Binds 逐值（选已有卷）")
    assert.deepEqual(create1.body.Cmd, ["sleep", "infinity"], "命令键缺 ⇒ 待命命令零改（轻通道笔 10——默认不变）")

    const second = await api(app, "POST", `/api/admin/sandbox/runners/${runner.id}/containers`, { body: { name: "box-v2", image: "thincoder-sandbox:1", volume: "brand-new" } })
    assert.equal(second.status, 200, "建容器（手输新名腿）")
    const create2 = engine.calls.filter((item) => item.path.endsWith("/containers/create")).at(-1)
    assert.deepEqual(create2.body.HostConfig, { Binds: ["brand-new:/workspace"] }, "Binds 逐值（手输新名——首用即建归引擎）")

    const created = engine.calls.filter((item) => item.method === "POST" && item.path.endsWith("/volumes/create"))
    assert.equal(created.length, 0, "零建卷调用（我方零 `POST /volumes/create`——KD-SV-104）")

    // 轻通道笔 10：命令三态（自定义 ∥ 空串拒）
    const custom = await api(app, "POST", `/api/admin/sandbox/runners/${runner.id}/containers`, { body: { name: "box-v9", image: "thincoder-sandbox:1", command: "sh -c top -b" } })
    assert.equal(custom.status, 200, "建容器（自定义命令腿）")
    const create3 = engine.calls.filter((item) => item.path.endsWith("/containers/create")).at(-1)
    assert.deepEqual(create3.body.Cmd, ["sh", "-c", "top", "-b"], "自定义命令 ⇒ 空格切分逐值（轻通道笔 10）")
    const blank = await api(app, "POST", `/api/admin/sandbox/runners/${runner.id}/containers`, { body: { name: "box-v10", image: "thincoder-sandbox:1", command: "   " } })
    assert.equal(blank.status, 400, "显式空串 ⇒ 400（空命令容器一亮即退——不给这个坑）")
  } finally {
    await app.close()
    await engine.close()
  }
})
