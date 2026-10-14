/**
 * 2026-10-12-team-projects-permissions-sync.test.mjs — thincoder-server 批内单测件（`team-projects-permissions` 批（B2）·
 * **B 件 = 同步/平台假件**：名册同步（增/删/改 + 手工行不触 + 截断跳删）∥ 并发锁 ∥ 失败六分类 ∥ 定时调度 ∥ 拉列表分页 ∥
 * PAT 体检 ∥ 零反向出站 ∥ 事件接收端（成链/忽略面/撞锁合并/验签门）∥ 自含失败形。
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-12-team-projects-permissions-sync.test.mjs`
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/project/PROJECTS.md` §4/§5/§9/§10/§13；腿 ↔ 用例在括号）：
 *   N11（名册增/删/改 ∥ manual 行不触 ∥ 三平台映射 ∥ 结果入库 + 审计）∥ N12（同步锁 400）∥ N13（六分类 ∥ auth ⇒ invalid ∥
 *   截断跳删 ∥ 失败零部分写）∥ N14（到期判据 + 调度器：停用不跑 ∥ event 源照跑 ∥ 到期触发一次）∥ N15（拉列表分页/截断/自含形）
 *   ∥ N16（体检成交）∥ N17（出站全 GET）∥ N20（事件成链——验签 + 触发 + `trigger='event'`/actor=`webhook`）
 *   ∥ N21（忽略面三件）∥ B3（撞锁合并/重放幂等）∥ E2（不可达 = 自含失败形）∥ E3（验签门四态 + log.warn 不入审计）
 *   ∥ B2（同步不双插同名）。假平台 = 真 HTTP（真 fetch 链——基址改写指向本机假件）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync } from "node:fs"
import { createServer } from "node:http"
import { createHmac } from "node:crypto"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const PROJECT_ROUTES = await load("thincoder-server/src/project/routes.mjs")
const ADMIN_ROUTES = await load("thincoder-server/src/project/admin-routes.mjs")
const WEBHOOK_ROUTES = await load("thincoder-server/src/project/webhooks.mjs")
const SYNC = await load("thincoder-server/src/project/sync.mjs")
const CLIENT = await load("thincoder-server/src/project/platform-client.mjs")

const PASSWORD = "password-123"
const TEMP = mkdtempSync(join(tmpdir(), "tc-projects-sync-"))
const ORIGINS = { github: "https://api.github.com", gitee: "https://gitee.com/api/v5", gitlab: "https://gitlab.com" }
const ACCESS_LEVEL = { read: 10, readwrite: 30, manage: 50 }

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitFor(fn, { timeoutMs = 4000, stepMs = 20 } = {}) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const value = await fn()
    if (value) return value
    if (Date.now() > deadline) throw new Error("waitFor 超时")
    await sleep(stepMs)
  }
}

async function call(base, method, path, { body, cookie, headers = {} } = {}) {
  const finalHeaders = { "content-type": "application/json", ...headers }
  if (cookie) finalHeaders.cookie = cookie
  const res = await fetch(base + path, { method, headers: finalHeaders, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    /* 非 JSON 体：以 text 判 */
  }
  return { status: res.status, text, json, setCookies: res.headers.getSetCookie?.() ?? [] }
}

// ── 假平台（真 HTTP；三平台路径各按其形回；调用逐条入 `calls`）────────────────────

function buildRoster(opts) {
  if (Array.isArray(opts.roster)) return opts.roster
  const count = Number(opts.rosterCount ?? 0)
  return Array.from({ length: count }, (_, i) => ({ username: `bulk-${i + 1}`, level: "read" }))
}

function buildRepos(opts) {
  if (Array.isArray(opts.repos)) return opts.repos
  const count = Number(opts.repoCount ?? 0)
  return Array.from({ length: count }, (_, i) => ({ fullName: `acme/repo-${i + 1}`, address: `https://github.com/acme/repo-${i + 1}.git`, private: false }))
}

async function startFakePlatform(opts = {}) {
  const calls = []
  const server = createServer(async (req, res) => {
    const url = new URL(req.url, "http://fake")
    calls.push({ method: req.method, path: url.pathname, query: url.search, params: Object.fromEntries(url.searchParams), headers: req.headers })
    const json = (status, payload) => {
      res.writeHead(status, { "content-type": "application/json" })
      res.end(JSON.stringify(payload))
    }
    if (opts.hang === true) return // 挂起（超时腿——不响应）
    if (opts.holdFor) await sleep(opts.holdFor) // 慢响应（并发锁腿）
    const page = Number(url.searchParams.get("page") ?? 1)
    const per = Number(url.searchParams.get("per_page") ?? 100)
    const slice = (rows) => rows.slice((page - 1) * per, page * per)
    if (url.pathname === "/user" || url.pathname === "/api/v4/user") {
      if (opts.userStatus) return json(opts.userStatus, { message: "Bad credentials" })
      if (opts.userBadShape) return json(200, { nope: true })
      return json(200, url.pathname === "/user" ? { login: "fake-bot" } : { username: "fake-bot" })
    }
    if (url.pathname === "/user/repos" || url.pathname === "/api/v4/projects" || /^\/orgs\/[^/]+\/repos$/.test(url.pathname)) {
      if (opts.reposStatus) return json(opts.reposStatus, { message: "nope" })
      if (opts.reposBadShape) return json(200, { nope: true })
      const rows = buildRepos(opts).map((repo) => {
        if (url.pathname === "/api/v4/projects") return { path_with_namespace: repo.fullName, http_url_to_repo: repo.address, visibility: repo.private ? "private" : "public" }
        return { full_name: repo.fullName, clone_url: repo.address, html_url: repo.address.replace(/\.git$/, ""), private: repo.private, is_admin: false }
      })
      return json(200, slice(rows))
    }
    if (/^\/orgs\/[^/]+\/members$/.test(url.pathname) || /^\/api\/v4\/groups\/[^/]+\/members\/all$/.test(url.pathname)) {
      if (opts.rosterStatus) return json(opts.rosterStatus, { message: "nope" })
      if (opts.rosterBadShape) return json(200, { nope: true })
      const gitlab = url.pathname.startsWith("/api/v4/")
      const adminOnly = url.searchParams.get("role") === "admin"
      const rows = buildRoster(opts)
        .filter((person) => (adminOnly ? person.level === "manage" : true))
        .map((person) => (gitlab ? { username: person.username, access_level: ACCESS_LEVEL[person.level] ?? 10 } : { login: person.username, is_admin: person.level === "manage" }))
      return json(200, slice(rows))
    }
    json(404, { message: "Not Found" })
  })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const base = `http://127.0.0.1:${server.address().port}`
  return {
    base,
    calls,
    callsOf: (path) => calls.filter((entry) => entry.path === path),
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
    },
  }
}

/** 基址改写（三平台固定基址 ⇒ 本机假件；余原样——真 fetch 链）+ 出站记录（N17）。 */
function platformFetch(fake, { record = null } = {}) {
  return async (url, init) => {
    const text = String(url)
    if (record) record.push({ method: init?.method ?? "GET", url: text })
    for (const origin of Object.values(ORIGINS)) {
      if (text === origin || text.startsWith(`${origin}/`)) return fetch(`${fake.base}${text.slice(origin.length)}`, init)
    }
    return fetch(url, init)
  }
}

/** 死地址（监听即关——连不上）：E2 不可达腿。 */
async function deadBase() {
  const fake = await startFakePlatform()
  const base = fake.base
  await fake.close()
  return base
}

// ── 进程内应用（网关 + 账号面 + 项目面三族——沿 `bin` 装配序）──────────────────────

async function startApp({ fetchImpl = fetch, timeoutMs = 300, log = null, now = Date.now } = {}) {
  const db = DB.openDatabase(":memory:")
  for (const [username, role] of [["admin", "admin"], ["alice", "user"]]) {
    await MEMBERS.createMember(db, { username, role, password: PASSWORD })
  }
  const routes = SERVER.createRouteTable()
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(TEMP, "gateway.db") })
  const scheduler = SYNC.createSyncScheduler({ db, config, log, deps: { fetchImpl, timeoutMs }, now })
  PROJECT_ROUTES.registerProjectRoutes(routes, { db })
  ADMIN_ROUTES.registerProjectAdminRoutes(routes, { db, config, log, scheduler, deps: { fetchImpl, timeoutMs } })
  WEBHOOK_ROUTES.registerProjectWebhookRoutes(routes, { db, config, log, scheduler, deps: { fetchImpl, timeoutMs } })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  const server = SERVER.createGatewayServer({ config, routes, log: null })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const base = `http://127.0.0.1:${server.address().port}`
  const login = async (username) => {
    const res = await call(base, "POST", "/api/login", { body: { username, password: PASSWORD } })
    const line = res.setCookies.find((item) => item.startsWith(`${SESSION.SESSION_COOKIE}=`))
    return line ? line.split(";")[0] : null
  }
  return {
    db,
    base,
    config,
    scheduler,
    adminCookie: await login("admin"),
    audits: (kind) => db.prepare("SELECT * FROM audit_events WHERE type = 'project_event' ORDER BY id").all().filter((row) => JSON.parse(row.detail ?? "{}").kind === kind),
    auditCount: () => db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n,
    projects: () => db.prepare("SELECT * FROM projects ORDER BY id").all(),
    memberRows: (projectId) => db.prepare("SELECT * FROM project_members WHERE project_id = ? ORDER BY id").all(projectId),
    sourceRow: (id) => db.prepare("SELECT * FROM git_sources WHERE id = ?").get(Number(id)),
    rows: (sql, ...args) => db.prepare(sql).all(...args),
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}

const api = (app, method, path, options = {}) => call(app.base, method, path, { cookie: app.adminCookie, ...options })

async function addSource(app, { name, platform = "github", token = "ghp_abcd1234", baseURL, scope = "acme", syncMode = "poll", intervalMinutes, enabled } = {}) {
  const res = await api(app, "POST", "/api/admin/git-sources", { body: { name, platform, token, baseURL, scope, syncMode, intervalMinutes, enabled } })
  assert.equal(res.status, 200, `增源失败：${res.text}`)
  return res.json.source
}

async function addProject(app, body) {
  const res = await api(app, "POST", "/api/admin/projects", { body })
  assert.equal(res.status, 200, `加仓失败：${res.text}`)
  return res.json.projects[0]
}

function seedMember(app, projectId, username, level, origin = "manual", syncedRole = null) {
  const at = new Date().toISOString()
  app.db.prepare("INSERT INTO project_members (project_id, username, level, origin, synced_role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").run(projectId, username, level, origin, syncedRole, at, at)
}

/** 投递 github 事件（合法签名或按参改坏——E3）。 */
async function deliverHook(app, sourceId, { secret, event = "member", body = { action: "member_added" }, signature } = {}) {
  const raw = JSON.stringify(body)
  const headers = { "x-github-event": event }
  if (signature !== null) {
    headers["x-hub-signature-256"] = signature ?? `sha256=${createHmac("sha256", secret ?? "").update(raw).digest("hex")}`
  }
  return call(app.base, "POST", `/api/hooks/git-sources/${sourceId}`, { headers, body })
}

// ── 腿：N11（名册同步——增/删/改 ∥ manual 行不触 ∥ 三平台映射 ∥ 结果入库）──────────

test("N11 成员同步：增/删/改逐值 ∥ manual 同名行不触 ∥ counts/结果行/审计逐值 ∥ gitlab 档位映射", async () => {
  const fake = await startFakePlatform({
    roster: [
      { username: "u-upd", level: "manage" },
      { username: "u-new", level: "read" },
      { username: "u-manual", level: "read" },
    ],
  })
  const app = await startApp({ fetchImpl: platformFetch(fake) })
  try {
    const source = await addSource(app, { name: "同步源" })
    const project = await addProject(app, { address: "https://github.com/acme/sync.git", displayName: "同步仓" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(source.id, project.id)
    seedMember(app, project.id, "u-upd", "read", "sync", "member")
    seedMember(app, project.id, "u-manual", "manage", "manual")
    seedMember(app, project.id, "u-del", "readwrite", "sync", "member")

    const res = await api(app, "POST", `/api/admin/git-sources/${source.id}/sync`)
    assert.deepEqual([res.status, res.json.ok, res.json.counts], [200, true, { projects: 1, roster: 3, added: 1, updated: 1, removed: 1 }], "手动同步自含形（增/改/删逐值）")
    assert.deepEqual(app.memberRows(project.id).map((row) => [row.username, row.level, row.origin, row.synced_role]), [
      ["u-upd", "manage", "sync", "admin"],
      ["u-manual", "manage", "manual", null],
      ["u-new", "read", "sync", "member"],
    ], "同步行增/改 ∥ manual 不触 ∥ 名册外 sync 行删（u-del 落掉）")

    const row = app.sourceRow(source.id)
    assert.equal(row.token_state, "ok", "成功 ⇒ token_state=ok")
    assert.ok(row.last_sync_at, "last_sync_at 随写（尝试时刻）")
    const recorded = JSON.parse(row.last_sync_result_json)
    assert.deepEqual(
      { ok: recorded.ok, trigger: recorded.trigger, counts: recorded.counts, at: typeof recorded.at, ms: typeof recorded.ms },
      { ok: true, trigger: "manual", counts: { projects: 1, roster: 3, added: 1, updated: 1, removed: 1 }, at: "string", ms: "number" },
      "结果行逐值（§5 算法 4）",
    )
    assert.deepEqual(
      app.audits("source_sync").map((audit) => [audit.actor_name, audit.actor_id, JSON.parse(audit.detail)]),
      [["admin", 1, { kind: "source_sync", sourceId: source.id, trigger: "manual", ok: true, counts: { projects: 1, roster: 3, added: 1, updated: 1, removed: 1 } }]],
      "`source_sync` 审计逐值（actor = 操作 admin）",
    )

    // gitlab 档位映射（§4 四表：10/20 ⇒ 只读 ∥ 30 ⇒ 读写 ∥ 40/50 ⇒ 管理）
    const gitlabSource = await addSource(app, { name: "gitlab 源", platform: "gitlab", token: "glpat-1", scope: "grp" })
    const gitlabProject = await addProject(app, { address: "https://gitlab.com/grp/app.git", displayName: "grp/app" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(gitlabSource.id, gitlabProject.id)
    assert.deepEqual(
      CLIENT.levelOfRole("gitlab", 10) + "|" + CLIENT.levelOfRole("gitlab", 20) + "|" + CLIENT.levelOfRole("gitlab", 30) + "|" + CLIENT.levelOfRole("gitlab", 40) + "|" + CLIENT.levelOfRole("gitlab", 50),
      "read|read|readwrite|manage|manage",
      "gitlab access_level 映射逐值",
    )
    assert.equal(await fake.callsOf("/api/v4/groups/grp/members/all").length > 0, false, "本段未触 gitlab（映射为纯函数面）")
  } finally {
    await app.close()
    await fake.close()
  }
})

test("B2 同名不双插：平台名册与既有行同名（大小写异形）⇒ 不新增第二行", async () => {
  const fake = await startFakePlatform({ roster: [{ username: "Alice", level: "manage" }] })
  const app = await startApp({ fetchImpl: platformFetch(fake) })
  try {
    const source = await addSource(app, { name: "大小写源" })
    const project = await addProject(app, { address: "https://github.com/acme/case.git", displayName: "case" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(source.id, project.id)
    seedMember(app, project.id, "alice", "read", "sync", "member")
    const res = await api(app, "POST", `/api/admin/git-sources/${source.id}/sync`)
    assert.deepEqual(res.json.counts, { projects: 1, roster: 1, added: 0, updated: 1, removed: 0 }, "同名命中既有行（改档——零新增）")
    assert.deepEqual(app.memberRows(project.id).map((row) => [row.username, row.level]), [["alice", "manage"]], "零双插（保留原行写形）")
  } finally {
    await app.close()
    await fake.close()
  }
})

test("B2′ 同趟重复行：名册内两形同名（gitlab 径零去重）⇒ 归一行、整趟不失败（随插随记账）", async () => {
  const fake = await startFakePlatform({ roster: [{ username: "dup", level: "read" }, { username: "DUP", level: "readwrite" }] })
  const app = await startApp({ fetchImpl: platformFetch(fake) })
  try {
    const source = await addSource(app, { name: "重复行源", platform: "gitlab" })
    const project = await addProject(app, { address: "https://gitlab.com/team/dup.git", displayName: "dup" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(source.id, project.id)
    const res = await api(app, "POST", `/api/admin/git-sources/${source.id}/sync`)
    assert.deepEqual([res.status, res.json.ok, res.json.counts], [200, true, { projects: 1, roster: 2, added: 1, updated: 1, removed: 0 }], "重复行不撞唯一约束（零 500）")
    assert.deepEqual(app.memberRows(project.id).map((row) => [row.username, row.level]), [["dup", "readwrite"]], "同键归一行（后到行覆写档位——幂等）")
  } finally {
    await app.close()
    await fake.close()
  }
})



// ── 腿：N12（并发锁）∥ N17（零反向出站）──────────────────────────────────────

test("N12 同步锁：在飞重触发 ⇒ 400 人话（零并发双跑）∥ N17 出站全 GET", async () => {
  const fake = await startFakePlatform({ roster: [{ username: "u1", level: "read" }], holdFor: 400 })
  const outbound = []
  const app = await startApp({ fetchImpl: platformFetch(fake, { record: outbound }), timeoutMs: 5000 })
  try {
    const source = await addSource(app, { name: "锁源" })
    const project = await addProject(app, { address: "https://github.com/acme/lock.git", displayName: "lock" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(source.id, project.id)
    const first = api(app, "POST", `/api/admin/git-sources/${source.id}/sync`)
    await waitFor(() => app.scheduler.isRunning(source.id))
    const second = await api(app, "POST", `/api/admin/git-sources/${source.id}/sync`)
    assert.deepEqual([second.status, second.json.error.message], [400, "该源正在同步中，稍后再试"], "在飞重触发 ⇒ 400 人话")
    const done = await first
    assert.deepEqual([done.status, done.json.ok], [200, true], "首跑照成")
    assert.equal(app.audits("source_sync").length, 1, "恰一趟（零并发双跑）")
    assert.equal(app.memberRows(project.id).length, 1, "名册应用一次")

    // N17：全流程（同步 ∥ 体检 ∥ 拉列表）出站逐调用核
    await api(app, "POST", `/api/admin/git-sources/${source.id}/check`)
    await api(app, "GET", `/api/admin/git-sources/${source.id}/repos`)
    assert.ok(outbound.length >= 3, `出站有记录（实得 ${outbound.length}）`)
    assert.deepEqual([...new Set(outbound.map((entry) => entry.method))], ["GET"], "零反向出站：全客户端只发 GET")
    assert.equal(outbound.some((entry) => entry.url.includes("/api/v4/projects?") && entry.url.includes("membership=true")), false, "github 源不携 gitlab 入参")
  } finally {
    await app.close()
    await fake.close()
  }
})

// ── 腿：N13（失败六分类 ∥ 截断跳删 ∥ 失败零部分写）────────────────────────────

test("N13 失败分类：auth ⇒ invalid + 零部分写 ∥ 超时 ∥ 形不合 ∥ 截断 ⇒ 跳过删除段", async () => {
  const authFake = await startFakePlatform({ rosterStatus: 401 })
  const app = await startApp({ fetchImpl: platformFetch(authFake) })
  try {
    const source = await addSource(app, { name: "auth 源" })
    const project = await addProject(app, { address: "https://github.com/acme/auth.git", displayName: "auth" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(source.id, project.id)
    seedMember(app, project.id, "kept", "read", "sync", "member")
    const before = app.memberRows(project.id)
    const res = await api(app, "POST", `/api/admin/git-sources/${source.id}/sync`)
    assert.deepEqual([res.status, res.json.ok, res.json.error.kind, typeof res.json.ms], [200, false, "auth", "number"], "auth 失败 ⇒ 自含形")
    assert.equal(app.sourceRow(source.id).token_state, "invalid", "auth ⇒ token_state=invalid（界面标红）")
    assert.ok(app.sourceRow(source.id).last_sync_at, "失败也记尝试时刻")
    assert.deepEqual(app.memberRows(project.id), before, "失败零部分写（成员行不动）")
    assert.deepEqual(JSON.parse(app.sourceRow(source.id).last_sync_result_json).counts, { projects: 1, roster: 0, added: 0, updated: 0, removed: 0 }, "失败 counts 如实")
    assert.deepEqual(app.audits("source_sync").map((row) => JSON.parse(row.detail).ok), [false], "审计记败行")
    assert.equal(app.audits("source_sync").filter((row) => JSON.parse(row.detail).errorKind === "auth").length, 1, "审计携 errorKind")

    // 超时（挂起 + 小超时）
    const hangFake = await startFakePlatform({ hang: true })
    const app2 = await startApp({ fetchImpl: platformFetch(hangFake), timeoutMs: 120 })
    try {
      const source2 = await addSource(app2, { name: "超时源" })
      const res2 = await api(app2, "POST", `/api/admin/git-sources/${source2.id}/sync`)
      assert.equal(res2.json.error.kind, "timeout", "挂起 ⇒ timeout")
    } finally {
      await app2.close()
      await hangFake.close()
    }

    // 形不合
    const shapeFake = await startFakePlatform({ rosterBadShape: true })
    const app3 = await startApp({ fetchImpl: platformFetch(shapeFake) })
    try {
      const source3 = await addSource(app3, { name: "形错源" })
      const res3 = await api(app3, "POST", `/api/admin/git-sources/${source3.id}/sync`)
      assert.equal(res3.json.error.kind, "bad_response", "页体非数组 ⇒ bad_response")
    } finally {
      await app3.close()
      await shapeFake.close()
    }

    // 截断 ⇒ 跳过删除段（只增改不删）
    const truncFake = await startFakePlatform({ rosterCount: CLIENT.ROSTER_ROW_LIMIT + 500 })
    const app4 = await startApp({ fetchImpl: platformFetch(truncFake) })
    try {
      const source4 = await addSource(app4, { name: "截断源" })
      const project4 = await addProject(app4, { address: "https://github.com/acme/trunc.git", displayName: "trunc" })
      app4.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(source4.id, project4.id)
      seedMember(app4, project4.id, "ghost", "read", "sync", "member") // 名册外 ⇒ 无截断则删
      const res4 = await api(app4, "POST", `/api/admin/git-sources/${source4.id}/sync`)
      assert.deepEqual([res4.json.ok, res4.json.truncated, res4.json.counts.roster, res4.json.counts.removed], [true, true, CLIENT.ROSTER_ROW_LIMIT, 0], "截断旗如实 ∥ 删除段跳过（removed=0）")
      assert.equal(app4.memberRows(project4.id).some((row) => row.username === "ghost"), true, "名册外 sync 行保留（防误删）")
    } finally {
      await app4.close()
      await truncFake.close()
    }
  } finally {
    await app.close()
    await authFake.close()
  }
})

// ── 腿：N14（到期判据 + 调度器）──────────────────────────────────────────────

test("N14 定时调度：`sync_mode` 不参与判据 ∥ 停用不跑 ∥ event 源照跑（对账）∥ 到期触发一次", async () => {
  const fake = await startFakePlatform({ roster: [{ username: "u1", level: "read" }] })
  const clock = { ts: Date.parse("2026-10-12T00:00:00.000Z") }
  const app = await startApp({ fetchImpl: platformFetch(fake), now: () => clock.ts })
  try {
    const poll = await addSource(app, { name: "定时源", intervalMinutes: 5 })
    const event = await addSource(app, { name: "事件源", syncMode: "event", intervalMinutes: 5 })
    const off = await addSource(app, { name: "停用源", intervalMinutes: 5, enabled: false })
    for (const id of [poll.id, event.id, off.id]) {
      app.db.prepare("UPDATE git_sources SET created_at = ? WHERE id = ?").run(new Date(clock.ts - 6 * 60000).toISOString(), id)
    }
    const due = (row) => SYNC.dueAt(row, clock.ts)
    assert.deepEqual([due(app.sourceRow(poll.id)), due(app.sourceRow(event.id)), due(app.sourceRow(off.id))], [true, true, false], "到期判据 = enabled ∧ 到期（模式不参与 ∥ 停用不跑）")

    await app.scheduler.check()
    assert.deepEqual(app.audits("source_sync").map((row) => [JSON.parse(row.detail).trigger, row.actor_name, row.actor_id]), [
      ["schedule", "scheduler", null],
      ["schedule", "scheduler", null],
    ], "两源到期 ⇒ 各跑一趟（actor=scheduler）")
    assert.equal(app.sourceRow(off.id).last_sync_at, null, "停用源零跑")
    assert.equal(app.sourceRow(event.id).token_state, "ok", "event 源照跑（对账兜底——消死区）")

    const runs = app.audits("source_sync").length
    await app.scheduler.check()
    assert.equal(app.audits("source_sync").length, runs, "刚跑过 ⇒ 未到期（零重复触发）")
    clock.ts += 5 * 60000
    await app.scheduler.check()
    assert.equal(app.audits("source_sync").length, runs + 2, "过间隔 ⇒ 再触发一次")
  } finally {
    await app.close()
    await fake.close()
  }
})

// ── 腿：N15（拉列表）∥ N16（体检）∥ E2（不可达自含形）─────────────────────────

test("N15 拉列表：分页取齐 ∥ 上限 300 截断旗 ∥ `known` 跨形命中 ∥ 失败自含形零审计", async () => {
  const fake = await startFakePlatform({ repoCount: 250 })
  const app = await startApp({ fetchImpl: platformFetch(fake) })
  try {
    const source = await addSource(app, { name: "拉列表源" })
    await addProject(app, { address: "git@github.com:acme/repo-1.git", displayName: "已在册" })
    const auditBefore = app.auditCount()
    const res = await api(app, "GET", `/api/admin/git-sources/${source.id}/repos`)
    assert.equal(res.json.ok, true)
    assert.equal(res.json.repos.length, 250, "两页取齐（100+100+50）")
    assert.equal(res.json.truncated, false, "末页不满 ⇒ 零截断")
    assert.deepEqual(fake.callsOf("/user/repos").map((entry) => entry.params.page), ["1", "2", "3"], "逐页取（page 1..3）")
    assert.deepEqual([res.json.repos[0].fullName, res.json.repos[0].private, res.json.repos[0].known], ["acme/repo-1", false, true], "首行逐值（`known` 跨形命中在册项目）")
    assert.equal(res.json.repos[1].known, false, "未在册 ⇒ known=false")
    assert.equal(typeof res.json.ms, "number", "ms 读数在场")
    assert.equal(app.auditCount(), auditBefore, "拉列表零审计（读动作）")

    const truncFake = await startFakePlatform({ repoCount: 350 })
    const app2 = await startApp({ fetchImpl: platformFetch(truncFake) })
    try {
      const source2 = await addSource(app2, { name: "截断源" })
      const res2 = await api(app2, "GET", `/api/admin/git-sources/${source2.id}/repos`)
      assert.deepEqual([res2.json.repos.length, res2.json.truncated], [CLIENT.REPO_ROW_LIMIT, true], "上限 300 ⇒ 截断旗如实")
    } finally {
      await app2.close()
      await truncFake.close()
    }

    const failFake = await startFakePlatform({ reposStatus: 403 })
    const app3 = await startApp({ fetchImpl: platformFetch(failFake) })
    try {
      const source3 = await addSource(app3, { name: "拒源" })
      const auditBefore = app3.auditCount()
      const res3 = await api(app3, "GET", `/api/admin/git-sources/${source3.id}/repos`)
      assert.deepEqual([res3.status, res3.json.ok, res3.json.error.kind, typeof res3.json.ms], [200, false, "auth", "number"], "403 ⇒ auth 自含形（不成统一信封）")
      assert.equal(res3.json.error.message.length > 0, true, "人话在场")
      assert.equal(app3.auditCount(), auditBefore, "零审计（读动作）")
    } finally {
      await app3.close()
      await failFake.close()
    }
  } finally {
    await app.close()
    await fake.close()
  }
})

test("N16 体检：成 ⇒ ok + token_state ∥ 败 auth ⇒ invalid ∥ 皆写 token_checked_at ∥ 审计 `source_check`", async () => {
  const okFake = await startFakePlatform({})
  const app = await startApp({ fetchImpl: platformFetch(okFake) })
  try {
    const source = await addSource(app, { name: "体检源" })
    const ok = await api(app, "POST", `/api/admin/git-sources/${source.id}/check`)
    assert.deepEqual([ok.status, ok.json.ok, typeof ok.json.ms], [200, true, "number"], "体检成")
    assert.deepEqual([app.sourceRow(source.id).token_state, typeof app.sourceRow(source.id).token_checked_at], ["ok", "string"], "成 ⇒ ok + 时间戳")
    assert.deepEqual(app.audits("source_check").map((row) => JSON.parse(row.detail)), [{ kind: "source_check", sourceId: source.id, ok: true }], "审计成行")

    const badFake = await startFakePlatform({ userStatus: 401 })
    const app2 = await startApp({ fetchImpl: platformFetch(badFake) })
    try {
      const source2 = await addSource(app2, { name: "体检败源" })
      const bad = await api(app2, "POST", `/api/admin/git-sources/${source2.id}/check`)
      assert.deepEqual([bad.status, bad.json.ok, bad.json.error.kind], [200, false, "auth"], "体检败 ⇒ auth 自含形")
      assert.deepEqual([app2.sourceRow(source2.id).token_state, typeof app2.sourceRow(source2.id).token_checked_at], ["invalid", "string"], "败 ⇒ invalid + 时间戳照写")
      assert.deepEqual(app2.audits("source_check").map((row) => JSON.parse(row.detail)), [{ kind: "source_check", sourceId: source2.id, ok: false, errorKind: "auth" }], "审计败行")
    } finally {
      await app2.close()
      await badFake.close()
    }
  } finally {
    await app.close()
    await okFake.close()
  }
})

test("E2 自含形失败：源不可达（体检 ∥ 同步 ∥ 拉列表三面）⇒ 200 `{ok:false,error:{kind},ms}`", async () => {
  const base = await deadBase()
  const app = await startApp({ fetchImpl: fetch, timeoutMs: 400 })
  try {
    const source = await addSource(app, { name: "死源", platform: "selfhosted", baseURL: base, token: "self-1" })
    const check = await api(app, "POST", `/api/admin/git-sources/${source.id}/check`)
    assert.deepEqual([check.status, check.json.ok, check.json.error.kind, typeof check.json.ms], [200, false, "unreachable", "number"], "体检不可达")
    const sync = await api(app, "POST", `/api/admin/git-sources/${source.id}/sync`)
    assert.deepEqual([sync.status, sync.json.ok, sync.json.error.kind], [200, false, "unreachable"], "同步不可达")
    const repos = await api(app, "GET", `/api/admin/git-sources/${source.id}/repos`)
    assert.deepEqual([repos.status, repos.json.ok, repos.json.error.kind], [200, false, "unreachable"], "拉列表不可达")
    assert.equal(app.sourceRow(source.id).token_state, "unknown", "非 auth 失败 ⇒ 状态列不动")

    // 凭据不可解（键文件轮换/丢失径）——三读面同形：实测 200 自含 `auth`（不成 500）
    const broken = await addSource(app, { name: "坏凭据源" })
    app.db.prepare("UPDATE git_sources SET token_cipher = ? WHERE id = ?").run("not-a-cipher", broken.id)
    const checkBroken = await api(app, "POST", `/api/admin/git-sources/${broken.id}/check`)
    assert.deepEqual([checkBroken.status, checkBroken.json.ok, checkBroken.json.error.kind, typeof checkBroken.json.ms], [200, false, "auth", "number"], "体检面：凭据不可解 ⇒ auth 自含形")
    const syncBroken = await api(app, "POST", `/api/admin/git-sources/${broken.id}/sync`)
    assert.deepEqual([syncBroken.status, syncBroken.json.ok, syncBroken.json.error.kind, typeof syncBroken.json.ms], [200, false, "auth", "number"], "同步面：同形")
    const reposBroken = await api(app, "GET", `/api/admin/git-sources/${broken.id}/repos`)
    assert.deepEqual([reposBroken.status, reposBroken.json.ok, reposBroken.json.error.kind, typeof reposBroken.json.ms], [200, false, "auth", "number"], "拉列表面：同形（修复前此径 500）")
    assert.equal(reposBroken.json.error.message.includes("凭据不可解"), true, "人话在场（三面单源）")
  } finally {
    await app.close()
  }
})

// ── 腿：N20（事件成链）∥ N21（忽略面）∥ B3（撞锁合并）∥ E3（验签门）───────────

test("N20 事件接收成链：合法签名 + `member` 事件 ⇒ 200 受理 + 异步同步（trigger=event ∥ actor=webhook）", async () => {
  const fake = await startFakePlatform({ roster: [{ username: "hooked", level: "manage" }] })
  const app = await startApp({ fetchImpl: platformFetch(fake) })
  try {
    const source = await addSource(app, { name: "事件源", syncMode: "event" })
    const project = await addProject(app, { address: "https://github.com/acme/hook.git", displayName: "hook" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(source.id, project.id)
    const secretRes = await api(app, "POST", `/api/admin/git-sources/${source.id}/hook-secret`)
    const secret = secretRes.json.hookSecret.plain
    assert.equal(/^[0-9a-f]{64}$/.test(secret), true, "密钥 = 32 字节 hex（一次性明文）")
    assert.deepEqual(JSON.parse(app.audits("source_update").at(-1).detail), { kind: "source_update", sourceId: source.id, keys: ["hookSecret"] }, "密钥面审计只记键名（值零入）")
    const listed = await api(app, "GET", "/api/admin/git-sources")
    assert.deepEqual(listed.json.sources[0].hookSecret, { set: true, hint: `…${secret.slice(-4)}` }, "读面恒掩码")
    assert.equal(listed.text.includes(secret), false, "读面零明文")

    const res = await deliverHook(app, source.id, { secret })
    assert.deepEqual([res.status, res.json], [200, { ok: true, triggered: true }], "受理 200（先回后跑）")
    await waitFor(() => app.sourceRow(source.id).last_sync_at)
    assert.deepEqual(app.memberRows(project.id).map((row) => [row.username, row.level, row.origin, row.synced_role]), [["hooked", "manage", "sync", "admin"]], "名册应用逐值（github 两级取：管理员集 ⇒ 管理档）")
    assert.deepEqual(
      app.audits("source_sync").map((audit) => [audit.actor_name, audit.actor_id, JSON.parse(audit.detail).trigger]),
      [["webhook", null, "event"]],
      "审计 actor=webhook ∥ trigger=event",
    )
  } finally {
    await app.close()
    await fake.close()
  }
})

test("N21 忽略面：非 `member` 事件 ∥ 源停用 ∥ `poll` 模式 ⇒ 200 `{ok:true,ignored:true}` 零同步零落库", async () => {
  const fake = await startFakePlatform({ roster: [{ username: "u1", level: "read" }] })
  const app = await startApp({ fetchImpl: platformFetch(fake) })
  try {
    const eventSource = await addSource(app, { name: "事件源", syncMode: "event" })
    const offSource = await addSource(app, { name: "停用事件源", syncMode: "event", enabled: false })
    const pollSource = await addSource(app, { name: "轮询源", syncMode: "poll" })
    const project = await addProject(app, { address: "https://github.com/acme/ignore.git", displayName: "ignore" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(eventSource.id, project.id)
    const secrets = {}
    for (const source of [eventSource, offSource, pollSource]) {
      secrets[source.id] = (await api(app, "POST", `/api/admin/git-sources/${source.id}/hook-secret`)).json.hookSecret.plain
    }

    const nonMember = await deliverHook(app, eventSource.id, { secret: secrets[eventSource.id], event: "push" })
    assert.deepEqual([nonMember.status, nonMember.json], [200, { ok: true, ignored: true }], "非 member 事件 ⇒ 忽略")
    const off = await deliverHook(app, offSource.id, { secret: secrets[offSource.id] })
    assert.deepEqual([off.status, off.json], [200, { ok: true, ignored: true }], "源停用 ⇒ 忽略")
    const poll = await deliverHook(app, pollSource.id, { secret: secrets[pollSource.id] })
    assert.deepEqual([poll.status, poll.json], [200, { ok: true, ignored: true }], "poll 模式 ⇒ 忽略")
    await sleep(120)
    assert.equal(app.sourceRow(eventSource.id).last_sync_at, null, "零同步")
    assert.equal(app.memberRows(project.id).length, 0, "零落库")
    assert.equal(app.audits("source_sync").length, 0, "零同步审计")
  } finally {
    await app.close()
    await fake.close()
  }
})

test("B3 撞锁/重放合并：在飞重复投递 ⇒ 200×3 受理 ∥ 合并续跑一次（零并发双跑）∥ 名册幂等零差", async () => {
  const fake = await startFakePlatform({ roster: [{ username: "u1", level: "read" }], holdFor: 500 })
  const app = await startApp({ fetchImpl: platformFetch(fake), timeoutMs: 5000 })
  try {
    const source = await addSource(app, { name: "合并源", syncMode: "event" })
    const project = await addProject(app, { address: "https://github.com/acme/merge.git", displayName: "merge" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(source.id, project.id)
    const secret = (await api(app, "POST", `/api/admin/git-sources/${source.id}/hook-secret`)).json.hookSecret.plain

    const first = await deliverHook(app, source.id, { secret })
    assert.equal(first.status, 200, "首投受理")
    await waitFor(() => app.scheduler.isRunning(source.id))
    const second = await deliverHook(app, source.id, { secret })
    const third = await deliverHook(app, source.id, { secret })
    assert.deepEqual([second.status, third.status], [200, 200], "在飞重复投递 ⇒ 照回 200（受理）")
    assert.equal(app.scheduler.isPending(source.id), true, "撞锁 ⇒ 待跑旗合并")
    await waitFor(() => !app.scheduler.isRunning(source.id) && !app.scheduler.isPending(source.id), { timeoutMs: 6000 })
    assert.deepEqual(app.audits("source_sync").map((row) => JSON.parse(row.detail).trigger), ["event", "event"], "两次合并 ⇒ 恰两趟（多次投递合并为一次）")
    assert.deepEqual(app.memberRows(project.id).map((row) => [row.username, row.level]), [["u1", "read"]], "名册幂等零差（零双插）")
  } finally {
    await app.close()
    await fake.close()
  }
})

test("E3 验签门：签名不符 ∥ 缺签名 ∥ 密钥未生成 ⇒ 401（零细节）∥ 未知源 ⇒ 404 ∥ log.warn 一笔不入审计", async () => {
  const warns = []
  const log = { info() {}, warn: (event, info) => warns.push({ event, info }) }
  const fake = await startFakePlatform({ roster: [{ username: "u1", level: "read" }] })
  const app = await startApp({ fetchImpl: platformFetch(fake), log })
  try {
    const source = await addSource(app, { name: "验签源", syncMode: "event" })
    const project = await addProject(app, { address: "https://github.com/acme/verify.git", displayName: "verify" })
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(source.id, project.id)
    const secret = (await api(app, "POST", `/api/admin/git-sources/${source.id}/hook-secret`)).json.hookSecret.plain
    const noSecretSource = await addSource(app, { name: "未生成密钥源", syncMode: "event" })
    const before = app.auditCount()

    const bad = await deliverHook(app, source.id, { secret, signature: `sha256=${"0".repeat(64)}` })
    assert.deepEqual([bad.status, bad.json.error.code, bad.text.includes("签名"), bad.text.includes("sha256")], [401, "unauthorized", true, false], "签名不符 ⇒ 401 零细节")
    const missing = await deliverHook(app, source.id, { secret, signature: null })
    assert.deepEqual([missing.status, missing.json.error.code], [401, "unauthorized"], "缺签名 ⇒ 401")
    const shape = await deliverHook(app, source.id, { secret, signature: "sha256=zz" })
    assert.deepEqual([shape.status, shape.json.error.code], [401, "unauthorized"], "签名形不合 ⇒ 401")

    const noSecret = await deliverHook(app, noSecretSource.id, { secret: "whatever" })
    assert.deepEqual([noSecret.status, noSecret.json.error.code], [401, "unauthorized"], "密钥未生成 ⇒ 401（零细节）")

    const unknown = await deliverHook(app, 9999, { secret })
    assert.deepEqual([unknown.status, unknown.json.error.code, unknown.json.error.message], [404, "not_found", "git 源不存在：9999"], "未知源 ⇒ 404（统一信封）")

    await sleep(100)
    assert.equal(app.sourceRow(source.id).last_sync_at, null, "零同步")
    assert.equal(app.memberRows(project.id).length, 0, "零落库")
    assert.equal(app.auditCount(), before, "零审计行（公网噪声不入审计）")
    assert.deepEqual(warns.map((entry) => entry.event), Array(4).fill("project_hook_rejected"), "log.warn 逐笔（四拒）")
  } finally {
    await app.close()
    await fake.close()
  }
})
