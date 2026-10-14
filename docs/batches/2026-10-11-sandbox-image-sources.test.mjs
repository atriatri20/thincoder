/**
 * 2026-10-11-sandbox-image-sources.test.mjs — thincoder-server 批内单测件（`sandbox-image-sources` 批 · 服务面——
 * 镜像源清单 CRUD + 预选 ∥ v2/Hub 两面读取 ∥ 匿名 Bearer 挑战 ∥ 有界首页 ∥ 五分类读绪；名随批档 · 住 `docs/batches/` ·
 * 不入仓套件 · 随批留存）。运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-11-sandbox-image-sources.test.mjs`
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/sandbox/SANDBOX.md` §12 用例表；腿 ↔ 用例在括号）：
 *   N57（增/改/删/列逐值 ∥ 址归一 ∥ kind 派生 ∥ 三审计行 detail 键集 ∥ 预选六条两字段 ∥ 零外呼/零节点门）
 *   ∥ N58（v2 两读逐值 ∥ Link 截断 ∥ n 缺省入参 ∥ 零审计）∥ N59（Hub 两读：裸名补 library/ ∥ page_size=min(n,100) ∥ 目录 unsupported）
 *   ∥ B52（匿名 Bearer 逐跳：挑战解析 ⇒ 换 token ⇒ 携 Bearer 复读；scope 逐值；零凭据）
 *   ∥ B53（空目录 ⇒ 成 + 空表——非错误）∥ B54（n 越界/非数 ∥ name 形非法 ⇒ 400 零外呼）
 *   ∥ B55（405 ⇒ unsupported）∥ B56（200 非 JSON ∥ 形不符 ⇒ bad_response）∥ E43（增/改形/唯一 ⇒ 400 库零变）
 *   ∥ E44（不可达/超时/挑战不可解析/token 端点 401/复读仍 401 ⇒ 三分类）∥ E45（判权 403/401 ∥ 不存在 id ⇒ 404）
 *   ∥ v15 迁移（空库直落 15 ∥ v14 升后 15 ∥ 幂等 ∥ 五列 ∥ 两 UNIQUE 拒重 ∥ 存量表零变）
 *   ∥ 纯函数面（形校验 ∥ kind ∥ 挑战解析 ∥ 有界 n ∥ 仓库名 ∥ Link 判据）。
 * 假 registry/hub = 真 HTTP（真 fetch 链；Hub URL 经包装改写指向本机假件）；链路 = 进程内网关 + 账号面 + 沙盒面 + 镜像源面。
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
const SOURCES = await load("thincoder-server/src/sandbox/image-sources.mjs")
const CLIENT = await load("thincoder-server/src/sandbox/registry-client.mjs")
const SOURCE_ROUTES = await load("thincoder-server/src/sandbox/image-source-routes.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")

const PASSWORD = "password-123"
const TEMP = mkdtempSync(join(tmpdir(), "tc-image-sources-"))
const HUB_ORIGIN = "https://hub.docker.com"

// ── 假 registry（真 HTTP——真 fetch 链；调用逐条在 `calls`）────────────────────────

async function startFakeRegistry(opts = {}) {
  const calls = []
  let base = ""
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://registry")
    calls.push({ method: req.method, path: url.pathname, query: url.search, url: `${base}${req.url}`, headers: req.headers })
    const json = (status, payload, headers = {}) => {
      res.writeHead(status, { "content-type": "application/json", ...headers })
      res.end(JSON.stringify(payload))
    }
    if (opts.hang === true) return // 挂起（超时腿——不响应）
    if (url.pathname === "/token") {
      if (opts.tokenStatus === 401) return json(401, { errors: [{ code: "UNAUTHORIZED" }] })
      return json(200, opts.tokenBody ?? { token: "tok-1" })
    }
    const bearer = String(req.headers.authorization ?? "")
    if (opts.challenge === true && !bearer.startsWith("Bearer ")) {
      const challenge = opts.challengeHeader ?? `Bearer realm="${base}/token",service="fake-registry"`
      return json(401, {}, { "www-authenticate": challenge })
    }
    if (opts.challenge === true && bearer.startsWith("Bearer ") && opts.reReadStatus === 401) {
      return json(401, {}, { "www-authenticate": `Bearer realm="${base}/token"` })
    }
    if (url.pathname === "/v2/_catalog") {
      if (opts.catalogMode === "unsupported") return json(405, { errors: [{ code: "UNSUPPORTED" }] })
      if (opts.catalogMode === "html") {
        res.writeHead(200, { "content-type": "text/html" })
        return res.end("<html><body>registry says hello</body></html>")
      }
      if (opts.catalogMode === "badShape") return json(200, { repositories: "x" })
      if (opts.catalogMode === "empty") return json(200, { repositories: [] })
      const headers = opts.catalogLink === undefined ? {} : { link: opts.catalogLink }
      return json(200, opts.catalogBody ?? { repositories: ["library/nginx", "foo/bar"] }, headers)
    }
    const tags = /^\/v2\/(.+)\/tags\/list$/.exec(url.pathname)
    if (tags) {
      const headers = opts.tagsLink === undefined ? {} : { link: opts.tagsLink }
      return json(200, opts.tagsBody ?? { name: tags[1], tags: ["1.25", "latest"] }, headers)
    }
    return json(404, { errors: [{ code: "NOT_FOUND" }] })
  })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  base = `http://127.0.0.1:${server.address().port}`
  return {
    base,
    calls,
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
    },
  }
}

/** 死地址（监听即关——连不上）：E44 不可达腿。 */
async function deadBase() {
  const registry = await startFakeRegistry()
  const base = registry.base
  await registry.close()
  return base
}

/** 假 Hub（本机 HTTP；`https://hub.docker.com` 经包装改写指此——Hub 主机 = 常量，与登记址无关）。 */
async function startFakeHub(opts = {}) {
  const calls = []
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://hub")
    calls.push({ path: url.pathname, query: url.search })
    res.writeHead(200, { "content-type": "application/json" })
    if (url.pathname === "/v2/repositories/denied/tags") return res.end(JSON.stringify({ detail: "not found" }))
    res.end(JSON.stringify(opts.body ?? { count: 2, next: null, results: [{ name: "1.25" }, { name: "latest" }] }))
  })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const base = `http://127.0.0.1:${server.address().port}`
  return {
    base,
    calls,
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
    },
  }
}

/** Hub 改写包装（`https://hub.docker.com/**` ⇒ 本机假 Hub；余原样——真 fetch 链）。 */
function hubRewritingFetch(hub) {
  return async (url, init) => {
    const text = String(url)
    if (text.startsWith(`${HUB_ORIGIN}/`)) return fetch(`${hub.base}${text.slice(HUB_ORIGIN.length)}`, init)
    return fetch(url, init)
  }
}

// ── 进程内应用（网关 + 账号面 + 沙盒面 + 镜像源面——沿 `bin` 装配序）──────────────────

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

async function startApp({ fetchImpl = fetch, readTimeoutMs = 500 } = {}) {
  const db = DB.openDatabase(":memory:")
  await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  await MEMBERS.createMember(db, { username: "bob", role: "user", password: PASSWORD })
  const routes = SERVER.createRouteTable()
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(TEMP, "gateway.db") })
  SANDBOX.registerSandboxRoutes(routes, { db, config, log: null })
  SOURCE_ROUTES.registerImageSourceRoutes(routes, { db, fetchImpl, readTimeoutMs })
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
    rows: () => db.prepare("SELECT * FROM image_sources ORDER BY id").all(),
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}

const api = (app, method, path, options = {}) => call(app.base, method, path, { cookie: app.adminCookie, ...options })

/** 增源（多数腿共用）；出 = 源读数行。 */
async function addSource(app, name, address) {
  const res = await api(app, "POST", "/api/admin/sandbox/image-sources", { body: { name, address } })
  assert.equal(res.status, 200, `增源失败：${res.text}`)
  return res.json.source
}

const catalogOf = (app, id, query = "") => api(app, "GET", `/api/admin/sandbox/image-sources/${id}/catalog${query}`)
const tagsOf = (app, id, name, query = "") => api(app, "GET", `/api/admin/sandbox/image-sources/${id}/tags?name=${encodeURIComponent(name)}${query}`)

// ── 腿：N57（源清单 CRUD + 预选）──────────────────────────────────────────────

test("N57 增/改/删/列 + 预选：行逐值（址归一 ∥ kind 派生）∥ 三审计行 detail 键集 ∥ 预选六条两字段 ∥ 零外呼零节点门", async () => {
  const registry = await startFakeRegistry()
  const app = await startApp()
  try {
    // 零节点（无 runner 注册）⇒ 源面照常（与节点零涉——不查沙盒可用性门）
    assert.equal(app.db.prepare("SELECT COUNT(*) AS n FROM sandbox_runners").get().n, 0, "前置：零节点")
    const before = registry.calls.length

    const hub = await addSource(app, "Docker Hub", "docker.io") // 缺 scheme ⇒ 补 https://
    assert.deepEqual(
      [hub.name, hub.address, hub.kind, typeof hub.id, typeof hub.createdAt],
      ["Docker Hub", "https://docker.io", "hub", "number", "string"],
      "增源行逐值（归一 + kind 派生）",
    )
    const v2 = await addSource(app, "自建测试源", "http://127.0.0.1:5000") // 明 scheme + 端口 ⇒ 原样
    assert.deepEqual([v2.address, v2.kind], ["http://127.0.0.1:5000", "v2"], "v2 面形")

    const patched = await api(app, "PATCH", `/api/admin/sandbox/image-sources/${v2.id}`, { body: { name: "自建源二号" } })
    assert.equal(patched.status, 200)
    assert.deepEqual(
      [patched.json.source.name, patched.json.source.address, patched.json.source.id],
      ["自建源二号", "http://127.0.0.1:5000", v2.id],
      "改源键级（只改 name——址不动）",
    )
    const renamed = await api(app, "PATCH", `/api/admin/sandbox/image-sources/${v2.id}`, { body: { address: "ghcr.io" } })
    assert.deepEqual([renamed.json.source.address, renamed.json.source.kind], ["https://ghcr.io", "v2"], "改址（Hub 四别名外 ⇒ v2）")

    const list = await api(app, "GET", "/api/admin/sandbox/image-sources")
    assert.deepEqual(list.json.sources.map((row) => `${row.name}|${row.address}|${row.kind}`), [
      "Docker Hub|https://docker.io|hub",
      "自建源二号|https://ghcr.io|v2",
    ], "列读数逐值（id 序）")

    const deleted = await api(app, "DELETE", `/api/admin/sandbox/image-sources/${v2.id}`)
    assert.deepEqual([deleted.status, deleted.json], [200, { ok: true }], "删源")
    const afterDelete = await api(app, "GET", "/api/admin/sandbox/image-sources")
    assert.deepEqual(afterDelete.json.sources.map((row) => row.name), ["Docker Hub"], "删后列")

    // 审计三 kind——detail 键集逐值（accounts/ACCOUNTS.md §2.1）
    const adds = app.audits("image_source_add")
    assert.equal(adds.length, 2, "两增两行")
    assert.deepEqual(JSON.parse(adds[0].detail), { kind: "image_source_add", sourceId: hub.id, name: "Docker Hub", address: "https://docker.io" }, "增行 detail 键集逐值")
    const updates = app.audits("image_source_update")
    assert.equal(updates.length, 2, "两改两行")
    assert.deepEqual(JSON.parse(updates[0].detail), { kind: "image_source_update", sourceId: v2.id, name: "自建源二号", address: "http://127.0.0.1:5000" }, "改行 detail 键集逐值")
    const deletes = app.audits("image_source_delete")
    assert.equal(deletes.length, 1, "一删一行")
    assert.deepEqual(JSON.parse(deletes[0].detail), { kind: "image_source_delete", sourceId: v2.id, name: "自建源二号" }, "删行 detail 键集逐值（kind+sourceId+name）")

    // 预选七条（名/址两字段——零隐藏语义）
    const presets = await api(app, "GET", "/api/admin/sandbox/image-sources/presets")
    assert.equal(presets.status, 200)
    assert.deepEqual(presets.json.presets.map((row) => Object.keys(row).sort().join(",")), Array(7).fill("address,name"), "七条逐条只携名/址")
    assert.deepEqual(presets.json.presets.map((row) => `${row.name}|${row.address}`), [
      "Docker Hub|https://docker.io",
      "GitHub Container Registry|https://ghcr.io",
      "Quay|https://quay.io",
      "阿里云 ACR|https://registry.cn-hangzhou.aliyuncs.com",
      "华为云 SWR|https://swr.cn-north-4.myhuaweicloud.com",
      "Docker Hub 镜像（DaoCloud）|https://docker.m.daocloud.io",
      "Docker Hub 镜像（1ms.run）|https://docker.1ms.run",
    ], "预选七条逐值")

    assert.equal(registry.calls.length, before, "本面零外呼（源清单面不触远端）")
    assert.equal(app.audits("image_source_add").length + app.audits("image_source_update").length + app.audits("image_source_delete").length, 5, "审计恰五枚（读动作零审计）")
  } finally {
    await app.close()
    await registry.close()
  }
})

// ── 腿：N58（v2 两读）∥ B53（空目录）──────────────────────────────────────────

test("N58 v2 两读：repositories/tags 逐值 ∥ Link 在场 ⇒ truncated ∥ ?n=200 入参逐值 ∥ 零审计", async () => {
  const registry = await startFakeRegistry({ catalogLink: '</v2/_catalog?n=200&last=foo>; rel="next"' })
  const app = await startApp()
  try {
    const source = await addSource(app, "自建 v2", registry.base)
    const before = app.auditCount()

    const catalog = await catalogOf(app, source.id)
    assert.deepEqual([catalog.status, catalog.json.ok, catalog.json.kind], [200, true, "v2"], "目录读成")
    assert.deepEqual(catalog.json.repositories, ["library/nginx", "foo/bar"], "repositories 逐值")
    assert.equal(catalog.json.truncated, true, "Link 在场 ⇒ truncated=true")
    assert.equal(typeof catalog.json.ms, "number", "ms 读数在场")
    const catalogCall = registry.calls.at(-1)
    assert.deepEqual([catalogCall.path, catalogCall.query], ["/v2/_catalog", "?n=200"], "引擎入参逐值（n 缺省 200）")

    const tags = await tagsOf(app, source.id, "library/nginx")
    assert.deepEqual([tags.status, tags.json.ok, tags.json.kind], [200, true, "v2"], "标签读成")
    assert.deepEqual(tags.json.tags, ["1.25", "latest"], "tags 逐值")
    assert.equal(tags.json.truncated, false, "无 Link ⇒ truncated=false")
    const tagsCall = registry.calls.at(-1)
    assert.deepEqual([tagsCall.path, tagsCall.query], ["/v2/library/nginx/tags/list", "?n=200"], "标签入参逐值（仓库名进路径）")

    await tagsOf(app, source.id, "library/nginx", "&n=5")
    assert.equal(registry.calls.at(-1).query, "?n=5", "n 随携逐值")

    assert.equal(app.auditCount(), before, "两读零审计（读动作）")
  } finally {
    await app.close()
    await registry.close()
  }
})

test("B53 源如实回空目录 ⇒ 200 { ok:true, repositories:[], truncated:false }（空非错误）", async () => {
  const registry = await startFakeRegistry({ catalogMode: "empty" })
  const app = await startApp()
  try {
    const source = await addSource(app, "quay 形", registry.base)
    const res = await catalogOf(app, source.id)
    assert.deepEqual([res.status, res.json], [200, { ok: true, kind: "v2", repositories: [], truncated: false, ms: res.json.ms }], "空目录 = 成 + 空表")
    assert.equal(typeof res.json.ms, "number", "ms 在场")
  } finally {
    await app.close()
    await registry.close()
  }
})

// ── 腿：N59（Hub 两读）───────────────────────────────────────────────────────

test("N59 Hub 两读：裸名补 library/ 逐值 ∥ page_size=min(n,100) ∥ 目录 ⇒ unsupported（零外呼）", async () => {
  const registry = await startFakeRegistry()
  const hub = await startFakeHub({ body: { count: 2, next: "https://hub.docker.com/v2/repositories/library/nginx/tags?page=2", results: [{ name: "1.25" }, { name: "latest" }] } })
  const app = await startApp({ fetchImpl: hubRewritingFetch(hub) })
  try {
    const source = await addSource(app, "Docker Hub", "docker.io")
    assert.equal(source.kind, "hub", "Hub 四别名 ⇒ kind=hub")

    const catalog = await catalogOf(app, source.id)
    assert.deepEqual([catalog.status, catalog.json.ok, catalog.json.error.kind], [200, false, "unsupported"], "Hub 目录 ⇒ 如实不支持")
    assert.match(catalog.json.error.message, /目录/, "人话（Hub 无全站目录 API）")
    assert.equal(hub.calls.length, 0, "目录读零外呼")

    const tags = await tagsOf(app, source.id, "nginx")
    assert.deepEqual([tags.status, tags.json.ok, tags.json.kind], [200, true, "hub"], "Hub 标签读成")
    assert.deepEqual(tags.json.tags, ["1.25", "latest"], "tags 逐值（results[].name）")
    assert.equal(tags.json.truncated, true, "next 非空 ⇒ truncated=true")
    assert.deepEqual(hub.calls.at(-1), { path: "/v2/repositories/library/nginx/tags", query: "?page_size=100" }, "裸名补 library/ + page_size=min(200,100)=100")

    await tagsOf(app, source.id, "nginx", "&n=50")
    assert.equal(hub.calls.at(-1).query, "?page_size=50", "n=50 ⇒ page_size=50")
    await tagsOf(app, source.id, "library/nginx", "&n=1000")
    assert.deepEqual(hub.calls.at(-1), { path: "/v2/repositories/library/nginx/tags", query: "?page_size=100" }, "含 / ⇒ 不补 library/；min(1000,100)=100")

    const hubTags = await tagsOf(app, source.id, "ns/repo")
    assert.deepEqual(hub.calls.at(-1).path, "/v2/repositories/ns/repo/tags", "带命名空间 ⇒ 原样")
    assert.equal(hubTags.json.ok, true, "命名空间形可用")
    assert.equal(registry.calls.filter((item) => item.headers.authorization !== undefined).length, 0, "Hub 面零凭据头")
  } finally {
    await app.close()
    await registry.close()
    await hub.close()
  }
})

// ── 腿：B52（匿名 Bearer 挑战）───────────────────────────────────────────────

test("B52 匿名 Bearer：挑战解析 ⇒ 换 token ⇒ 携 Bearer 复读；scope 逐值（目录 registry:catalog:* ∥ 标签 repository:<name>:pull）；零凭据", async () => {
  const registry = await startFakeRegistry({ challenge: true })
  const app = await startApp()
  try {
    const source = await addSource(app, "ghcr 形", registry.base)
    const catalog = await catalogOf(app, source.id)
    assert.deepEqual([catalog.status, catalog.json.ok], [200, true], "挑战换取后目录读成")
    const hops = registry.calls.slice(-3)
    assert.deepEqual(hops.map((item) => item.path), ["/v2/_catalog", "/token", "/v2/_catalog"], "逐跳顺序：原读 ⇒ 换 token ⇒ 复读")
    assert.equal(hops[0].headers.authorization, undefined, "首读零凭据")
    assert.equal(hops[1].headers.authorization, undefined, "token 端点零凭据")
    assert.deepEqual([hops[1].query.includes("service=fake-registry"), new URL(hops[1].url).searchParams.get("scope")], [true, "registry:catalog:*"], "挑战 service 随携 + 目录 scope 逐值")
    assert.equal(hops[2].headers.authorization, "Bearer tok-1", "复读携 Bearer（响应键 token）")

    const tags = await tagsOf(app, source.id, "library/nginx")
    assert.equal(tags.json.ok, true, "标签面同链")
    const tokenHop = registry.calls.slice(-3)[1]
    assert.equal(new URL(tokenHop.url).searchParams.get("scope"), "repository:library/nginx:pull", "标签 scope 逐值")

    const basics = registry.calls.filter((item) => /basic/i.test(String(item.headers.authorization ?? "")))
    assert.deepEqual(basics, [], "全程零 Basic 凭据")
  } finally {
    await app.close()
    await registry.close()
  }
})

// ── 腿：B54（形判——零外呼）──────────────────────────────────────────────────

test("B54 n 越界/非数 ∥ name 形非法 ⇒ 400 零外呼", async () => {
  const registry = await startFakeRegistry()
  const app = await startApp()
  try {
    const source = await addSource(app, "形判源", registry.base)
    const before = registry.calls.length
    const beforeAudits = app.auditCount()
    for (const bad of ["0", "5000", "abc", "-1", "1.5"]) {
      const res = await catalogOf(app, source.id, `?n=${bad}`)
      assert.deepEqual([res.status, res.json.error.code], [400, "invalid_request_error"], `catalog n=${bad} ⇒ 400`)
      assert.match(res.json.error.message, /n/, "范围人话")
    }
    for (const bad of ["NGINX", "a..b", "a b", "a?b", "a#b", "/abs", "trailing/"]) {
      const res = await tagsOf(app, source.id, bad)
      assert.deepEqual([res.status, res.json.error.code], [400, "invalid_request_error"], `name=${bad} ⇒ 400`)
    }
    const missing = await api(app, "GET", `/api/admin/sandbox/image-sources/${source.id}/tags`)
    assert.equal(missing.status, 400, "缺 name ⇒ 400")
    assert.equal(registry.calls.length, before, "全部形拒零外呼（假件断）")
    assert.equal(app.auditCount(), beforeAudits, "形拒零审计")
  } finally {
    await app.close()
    await registry.close()
  }
})

// ── 腿：B55 ∥ B56（读绪分类）─────────────────────────────────────────────────

test("B55 目录接口不支持（405 UNSUPPORTED——实测 DaoCloud 形）⇒ { ok:false, error:{ kind:unsupported, message:人话 } }", async () => {
  const registry = await startFakeRegistry({ catalogMode: "unsupported" })
  const app = await startApp()
  try {
    const source = await addSource(app, "DaoCloud 形", registry.base)
    const res = await catalogOf(app, source.id)
    assert.deepEqual([res.status, res.json.ok, res.json.error.kind], [200, false, "unsupported"], "405 ⇒ unsupported（非改写为空目录）")
    assert.match(res.json.error.message, /不支持/, "人话")
    assert.equal(typeof res.json.ms, "number", "ms 在场")
  } finally {
    await app.close()
    await registry.close()
  }
})

test("B56 远端 200 非 JSON ∥ 形不符 ⇒ bad_response；零落库（控制台就地呈）", async () => {
  const app = await startApp()
  try {
    const html = await startFakeRegistry({ catalogMode: "html" })
    const shape = await startFakeRegistry({ catalogMode: "badShape" })
    try {
      const a = await addSource(app, "HTML 源", html.base)
      const resA = await catalogOf(app, a.id)
      assert.deepEqual([resA.status, resA.json.ok, resA.json.error.kind], [200, false, "bad_response"], "200 非 JSON ⇒ bad_response")
      assert.match(resA.json.error.message, /非 JSON/, "人话（携体小结）")
      const b = await addSource(app, "形不符源", shape.base)
      const resB = await catalogOf(app, b.id)
      assert.deepEqual([resB.status, resB.json.ok, resB.json.error.kind], [200, false, "bad_response"], "形不符 ⇒ bad_response")
      assert.match(resB.json.error.message, /形不符/, "人话")
      assert.equal(app.auditCount(), 2, "读败零审计（只两成行——读动作零审计）")
      assert.equal(app.audits("image_source_add").length, 2, "两行皆增源（无读侧行）")
      assert.equal(app.rows().length, 2, "源表零变（读不落库）")
    } finally {
      await html.close()
      await shape.close()
    }
  } finally {
    await app.close()
  }
})

// ── 腿：E43（增/改形与唯一）──────────────────────────────────────────────────

test("E43 增/改：空名 ∥ 名超 40 ∥ 撞名 ∥ 撞址 ∥ 址含路径/空白 ⇒ 400（逐形人话）∥ 库零变", async () => {
  const registry = await startFakeRegistry()
  const app = await startApp()
  try {
    await addSource(app, "既有源", "docker.io")
    const before = app.rows()
    const badAdds = [
      [{ name: "  ", address: "ghcr.io" }, /不可为空/],
      [{ name: "a".repeat(41), address: "ghcr.io" }, /超长/],
      [{ name: "既有源", address: "quay.io" }, /已存在/],
      [{ name: "别名源", address: "docker.io" }, /已存在/],
      [{ name: "路径源", address: "ghcr.io/prefix" }, /路径/],
      [{ name: "空白源", address: "gh cr.io" }, /空白/],
      [{ name: "凭据源", address: "https://user:pass@ghcr.io" }, /凭据/],
      [{ name: "空址", address: "  " }, /不可为空/],
    ]
    for (const [body, pattern] of badAdds) {
      const res = await api(app, "POST", "/api/admin/sandbox/image-sources", { body })
      assert.equal(res.status, 400, `增拒：${JSON.stringify(body)}`)
      assert.match(res.json.error.message, pattern, "逐形人话")
    }
    const alpha = await addSource(app, "甲源", "quay.io")
    const beta = await addSource(app, "乙源", "ghcr.io")
    for (const [id, body, pattern] of [
      [beta.id, { name: "甲源" }, /已存在/],
      [beta.id, { address: "quay.io" }, /已存在/],
      [beta.id, { name: "" }, /不可为空/],
      [beta.id, { address: "quay.io/x" }, /路径/],
      [beta.id, {}, /至少一键/],
    ]) {
      const res = await api(app, "PATCH", `/api/admin/sandbox/image-sources/${id}`, { body })
      assert.equal(res.status, 400, `改拒：${JSON.stringify(body)}`)
      assert.match(res.json.error.message, pattern, "改逐形人话")
    }
    assert.deepEqual(app.rows().map((row) => `${row.id}|${row.name}|${row.address}`), before.map((row) => `${row.id}|${row.name}|${row.address}`).concat([`${alpha.id}|甲源|https://quay.io`, `${beta.id}|乙源|https://ghcr.io`]), "库零变（拒行零落库；仅两成行新增）")
    assert.equal(app.audits("image_source_add").length, 3, "拒在审计之前（成三行才审计）")
  } finally {
    await app.close()
    await registry.close()
  }
})

// ── 腿：E44（读败三分类）─────────────────────────────────────────────────────

test("E44 源目录读：不可达 ∥ 超时 ∥ 挑战不可解析 ∥ token 端点 401 ∥ 复读仍 401 ⇒ 三分类如实", async () => {
  const app = await startApp()
  try {
    const dead = await deadBase()
    const deadSource = await addSource(app, "死端口源", dead)
    const resDead = await catalogOf(app, deadSource.id)
    assert.deepEqual([resDead.status, resDead.json.ok, resDead.json.error.kind], [200, false, "unreachable"], "不可达 ⇒ unreachable")
    assert.match(resDead.json.error.message, /不可达/, "人话")

    const hang = await startFakeRegistry({ hang: true })
    try {
      const hangSource = await addSource(app, "挂起源", hang.base)
      const resHang = await catalogOf(app, hangSource.id)
      assert.deepEqual([resHang.status, resHang.json.ok, resHang.json.error.kind], [200, false, "timeout"], "挂起 ⇒ timeout")
      assert.match(resHang.json.error.message, /超时/, "人话")
    } finally {
      await hang.close()
    }

    const unparseable = await startFakeRegistry({ challenge: true, challengeHeader: `Basic realm="x"` })
    const token401 = await startFakeRegistry({ challenge: true, tokenStatus: 401 })
    const reRead401 = await startFakeRegistry({ challenge: true, reReadStatus: 401 })
    try {
      for (const [name, registry, label] of [
        ["挑战不可解析", unparseable, "挑战"],
        ["token 端点 401", token401, "token"],
        ["复读仍 401", reRead401, "仍 401"],
      ]) {
        const source = await addSource(app, name, registry.base)
        const res = await catalogOf(app, source.id)
        assert.deepEqual([res.status, res.json.ok, res.json.error.kind], [200, false, "auth_required"], `${label} ⇒ auth_required`)
        assert.match(res.json.error.message, /认证|token/, "人话")
      }
    } finally {
      await unparseable.close()
      await token401.close()
      await reRead401.close()
    }
    assert.equal(app.auditCount(), 5, "读败零审计（只五成行——读动作零审计）")
    assert.equal(app.audits("image_source_add").length, 5, "五行皆增源（无读侧行）")
  } finally {
    await app.close()
  }
})

// ── 腿：E45（判权 ∥ 404）────────────────────────────────────────────────────

test("E45 user ∥ 无会话打镜像源七端点 ⇒ 403 ∥ 401 ∥ 改/删不存在 id ⇒ 404", async () => {
  const registry = await startFakeRegistry()
  const app = await startApp()
  try {
    const source = await addSource(app, "判权源", registry.base)
    const base = "/api/admin/sandbox/image-sources"
    const legs = [
      ["GET", base, {}],
      ["GET", `${base}/presets`, {}],
      ["POST", base, { body: { name: "x", address: "example.com" } }],
      ["PATCH", `${base}/${source.id}`, { body: { name: "y" } }],
      ["DELETE", `${base}/${source.id}`, {}],
      ["GET", `${base}/${source.id}/catalog`, {}],
      ["GET", `${base}/${source.id}/tags?name=nginx`, {}],
    ]
    for (const [method, path, extra] of legs) {
      const asUser = await call(app.base, method, path, { cookie: app.userCookie, ...extra })
      assert.equal(asUser.status, 403, `user ⇒ 403：${method} ${path}`)
      const anon = await call(app.base, method, path, extra)
      assert.equal(anon.status, 401, `无会话 ⇒ 401：${method} ${path}`)
    }
    for (const [method, extra] of [["PATCH", { body: { name: "z" } }], ["DELETE", {}]]) {
      const res = await api(app, method, `${base}/9999`, extra)
      assert.deepEqual([res.status, res.json.error.code], [404, "not_found"], `${method} 不存在 id ⇒ 404`)
    }
    assert.equal(app.audits("image_source_delete").length, 0, "拒/404 在动作之前（零审计）")
    assert.equal(app.rows().length, 1, "库零变")
  } finally {
    await app.close()
    await registry.close()
  }
})

// ── 腿：v15 迁移（store/STORE.md §3 v15 判据）────────────────────────────────

test("v15 迁移：空库直落 22 ∥ v14 升 15（仅 v15 段）⇒ 增量 image_sources 一表 ∥ 幂等（再开零变）∥ 五列 ∥ 两 UNIQUE 拒重 ∥ 存量表零变", () => {
  // 空库直落 22（链尾——2026-10-14 随正）
  const fresh = DB.openDatabase(":memory:")
  assert.equal(DB.readVersion(fresh), 22, "空库直落 22（链尾）")
  assert.equal(DB.SCHEMA_VERSION, 22, "结构版本读数 = 链尾 v22（2026-10-14 随正）")
  const freshTables = fresh.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name)
  assert.ok(freshTables.includes("image_sources"), "image_sources 在表集")
  // 五列在场 + 两 UNIQUE 拒重
  assert.deepEqual(fresh.prepare("PRAGMA table_info(image_sources)").all().map((row) => row.name), ["id", "name", "address", "created_at", "created_by"], "五列逐值")
  const insert = fresh.prepare("INSERT INTO image_sources (name, address, created_at, created_by) VALUES (?, ?, ?, ?)")
  insert.run("甲", "https://a.example", "2026-10-11T00:00:00.000Z", null)
  assert.throws(() => insert.run("甲", "https://b.example", "2026-10-11T00:00:00.000Z", null), /UNIQUE constraint failed: image_sources\.name/, "重名拒")
  assert.throws(() => insert.run("乙", "https://a.example", "2026-10-11T00:00:00.000Z", null), /UNIQUE constraint failed: image_sources\.address/, "重址拒")
  fresh.close()

  // v14 库升 v15 段 + 存量表零变（v15 段只加 image_sources 一表；2026-10-13 收正）
  const file = join(TEMP, "v14-upgrade.db")
  const down = DB.openDatabase(file, { migrations: DB.MIGRATIONS.slice(0, 14) })
  assert.equal(DB.readVersion(down), 14, "前置：v14 库")
  const beforeTables = down.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name)
  assert.equal(beforeTables.includes("image_sources"), false, "前置：v14 无 image_sources")
  assert.equal(DB.migrate(down, { migrations: DB.MIGRATIONS.slice(0, 15) }), 15, "v15 段升级读数 15")
  const afterTables = down.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name)
  assert.deepEqual(afterTables.filter((name) => !beforeTables.includes(name)), ["image_sources"], "存量表零变（增量 = image_sources 一表）")
  down.close()

  // 幂等（再开零变：版本升链尾 22 ∥ 列面零变 ∥ 存量行保形）
  const reopen = DB.openDatabase(file)
  assert.equal(DB.readVersion(reopen), 22, "再开读数 22（链尾）")
  assert.deepEqual(reopen.prepare("PRAGMA table_info(image_sources)").all().map((row) => row.name), ["id", "name", "address", "created_at", "created_by"], "再开列面零变")
  const auditTypes = reopen.prepare("SELECT sql FROM sqlite_master WHERE name = 'audit_events'").get().sql
  assert.match(auditTypes, /'agent_event'/, "审计 CHECK 十三型保形（v14 重建未受扰）")
  reopen.close()
})

// ── 腿：纯函数面 ─────────────────────────────────────────────────────────────

test("纯函数面：形校验 ∥ kind 派生 ∥ 挑战解析 ∥ 有界 n ∥ 仓库名形 ∥ Link 判据 ∥ 五分类枚举", () => {
  assert.equal(SOURCES.normalizeSourceName("  nginx  "), "nginx", "名 trim")
  assert.equal(SOURCES.normalizeSourceName("a".repeat(40)), "a".repeat(40), "名 40 整可过")
  assert.throws(() => SOURCES.normalizeSourceName("a".repeat(41)), /超长/)
  assert.throws(() => SOURCES.normalizeSourceName(""), /不可为空/)

  assert.equal(SOURCES.normalizeSourceAddress("docker.io"), "https://docker.io", "缺 scheme 补 https://")
  assert.equal(SOURCES.normalizeSourceAddress("http://10.0.0.5:5000"), "http://10.0.0.5:5000", "明 scheme + 端口原样")
  assert.equal(SOURCES.normalizeSourceAddress("https://Host:443"), "https://host", "主机名小写 + 缺省端口归并")
  assert.throws(() => SOURCES.normalizeSourceAddress("https://host/prefix"), /路径/)
  assert.throws(() => SOURCES.normalizeSourceAddress("host?x=1"), /查询/)
  assert.throws(() => SOURCES.normalizeSourceAddress("ho st"), /空白/)
  assert.throws(() => SOURCES.normalizeSourceAddress("https://user:pass@host"), /凭据/)
  assert.throws(() => SOURCES.normalizeSourceAddress("https://token@host"), /凭据/)
  assert.equal(SOURCES.normalizeSourceAddress("http://host:5000/"), "http://host:5000", "尾斜杠归一接受（归一后去）")
  assert.throws(() => SOURCES.normalizeSourceAddress(""), /不可为空/)
  assert.throws(() => SOURCES.normalizeSourceAddress("https://"), /形非法/)

  for (const host of ["docker.io", "index.docker.io", "registry-1.docker.io", "hub.docker.com"]) {
    assert.equal(SOURCES.sourceKind(`https://${host}`), "hub", `${host} ⇒ hub`)
  }
  assert.equal(SOURCES.sourceKind("https://hub.docker.com:443"), "hub", "带端口归并后仍 hub")
  assert.equal(SOURCES.sourceKind("https://ghcr.io"), "v2", "非别名 ⇒ v2")
  assert.equal(SOURCES.sourceKind("https://registry.cn-hangzhou.aliyuncs.com"), "v2", "ACR ⇒ v2")
  assert.equal(SOURCES.sourceKind("https://docker.m.daocloud.io"), "hub-mirror", "Hub 镜像（DaoCloud）⇒ hub-mirror（走查轮 2026-10-11 甲）")
  assert.equal(SOURCES.sourceKind("https://docker.1ms.run"), "hub-mirror", "Hub 镜像（1ms.run）⇒ hub-mirror")

  assert.deepEqual(CLIENT.parseBearerChallenge('Bearer realm="https://auth.example/token",service="reg",scope="repository:x:pull"'), { realm: "https://auth.example/token", service: "reg", scope: "repository:x:pull" }, "带引号挑战")
  assert.deepEqual(CLIENT.parseBearerChallenge("Bearer realm=https://auth.example/token"), { realm: "https://auth.example/token", service: null, scope: null }, "无引号 realm")
  assert.equal(CLIENT.parseBearerChallenge('Basic realm="x"'), null, "非 Bearer ⇒ null")
  assert.equal(CLIENT.parseBearerChallenge('Bearer service="reg"'), null, "缺 realm ⇒ null（落 auth_required）")
  assert.equal(CLIENT.parseBearerChallenge(null), null, "缺头 ⇒ null")

  assert.equal(CLIENT.parseBoundedN(null), 200, "n 缺省 200")
  assert.equal(CLIENT.parseBoundedN("1000"), 1000, "上界可过")
  for (const bad of ["0", "1001", "abc", "-1", "1.5"]) assert.throws(() => CLIENT.parseBoundedN(bad), /越界|正整数/, `n=${bad} 拒`)

  assert.equal(CLIENT.normalizeRepoName("library/nginx"), "library/nginx", "常规形")
  assert.equal(CLIENT.normalizeRepoName("a.b-c_d/e"), "a.b-c_d/e", "分隔符合法")
  for (const bad of ["NGINX", "a..b", "a b", "a?b", "a#b", "/abs", "trailing/", ""]) assert.throws(() => CLIENT.normalizeRepoName(bad), /空白|不可为空|大写|\.\.|形非法/, `name=${bad} 拒`)

  assert.equal(CLIENT.hubRepoPath("nginx"), "library/nginx", "裸名补 library/")
  assert.equal(CLIENT.hubRepoPath("ns/repo"), "ns/repo", "含 / ⇒ 原样")

  const headers = (link) => ({ headers: { get: (name) => (name === "link" ? link : null) } })
  assert.equal(CLIENT.hasNextLink(headers('</v2/_catalog?n=200&last=x>; rel="next"')), true, "rel=next ⇒ true")
  assert.equal(CLIENT.hasNextLink(headers('</x>; rel="prev"')), false, "非 next ⇒ false")
  assert.equal(CLIENT.hasNextLink(headers(null)), false, "无头 ⇒ false")

  assert.deepEqual([...CLIENT.READ_ERROR_KINDS], ["timeout", "unreachable", "auth_required", "unsupported", "bad_response"], "五分类枚举逐值")
  assert.equal(new CLIENT.RegistryError("bogus", "x").kind, "bad_response", "枚举外兜底 bad_response")
  assert.equal(typeof SOURCE_ROUTES.registerImageSourceRoutes, "function", "路由注册面导出")
  assert.equal(SOURCES.SOURCE_PRESETS.length, 7, "预选七条")
})
