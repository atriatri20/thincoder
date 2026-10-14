/**
 * 2026-10-13-gitee-namespace-kinds.test.mjs — thincoder-server 批内单测件（`gitee-namespace-kinds` 批 ·
 * **D 件 = 服务端核心**：v21 迁移/回填 ∥ 三态形门（建/改）∥ 列表/名册两径路由 ∥ 企业嵌套行解析 ∥
 * 不符报错（404——不静默改走他径）∥ 读类超时平台口径（含两调用面接线）∥ 企业仓行兼容 ∥ 形错零变。
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-gitee-namespace-kinds.test.mjs`
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/project/PROJECTS.md` §2/§4/§9/§10；腿 ↔ 用例在括号）：
 *   N24（v21 迁移/回填——gitee 在场⇒org ∥ 空⇒personal ∥ 非 gitee 零动 ∥ 幂等）∥ N25（建/改三态形门 + 跨态清空两形）
 *   ∥ N26（列表三态路由 + 并集去重 + 零另一径出站）∥ N27（名册路由 + 企业嵌套行 + personal 不可用 + 同步落行）
 *   ∥ N28（范围径 404 ⇒ 人话 + 出站零另一径）∥ N29（超时两值 + 挂起假件模拟时钟 ⇒ 消息逐值 + 注入面恒胜）
 *   ∥ N29′（拉列表/同步**两调用面**缺省 ⇒ 无 `deps.timeoutMs` 时亦按 gitee 20000ms 收口）
 *   ∥ B4（企业仓行兼容）∥ E5（范围三态形错零变）。
 * 假平台 = 真 HTTP（真 fetch 链——基址改写指向本机假件）；gitee 三态两径路径逐条。
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
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const ADMIN_ROUTES = await load("thincoder-server/src/project/admin-routes.mjs")
const SYNC = await load("thincoder-server/src/project/sync.mjs")
const CLIENT = await load("thincoder-server/src/project/platform-client.mjs")
const GS = await load("thincoder-server/src/project/git-sources.mjs")

const PASSWORD = "password-123"
const TEMP = mkdtempSync(join(tmpdir(), "tc-gitee-kinds-"))
const ORIGINS = { gitee: "https://gitee.com/api/v5" }

const flush = async (n = 20) => { for (let i = 0; i < n; i += 1) await Promise.resolve() }

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

// ── 假 gitee（真 HTTP；三态两径 + 主径逐条回——调用逐条入 `calls`）─────────────────

/** 仓行（gitee 现行形——企业实测同形：`full_name`/`html_url`/`ssh_url`/`private`）。 */
const repoRawOf = (fullName) => ({ full_name: fullName, html_url: `https://gitee.com/${fullName}`, ssh_url: `git@gitee.com:${fullName}.git`, private: false })

/** 组织成员行（现行形：顶层 `login` + `is_admin`）。 */
const orgMemberOf = (login, isAdmin = false) => ({ login, is_admin: isAdmin })

/** 企业成员行（实测嵌套形：`user.login` + 顶层 `role` + 余字段）。 */
const entMemberOf = (login, role = "member") => ({ url: `https://gitee.com/enterprises/ent-x/members/${login}`, active: true, remark: "", role, outsourced: false, enterprise: "ent-x", user: { login, name: login.toUpperCase() } })

/**
 * 假 gitee：`reposOf` / `rosterOf` = 路径 ⇒ 行数组；`statusOf` = 路径 ⇒ 状态码（404 腿）。
 * 主径 `/user/repos` 按 `per_page`/`page` 分页；范围径同。
 */
async function startFakeGitee(opts = {}) {
  const calls = []
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://fake")
    calls.push({ method: req.method, path: url.pathname, params: Object.fromEntries(url.searchParams) })
    const json = (status, payload) => {
      res.writeHead(status, { "content-type": "application/json" })
      res.end(JSON.stringify(payload))
    }
    const page = Number(url.searchParams.get("page") ?? 1)
    const per = Number(url.searchParams.get("per_page") ?? 100)
    const slice = (rows) => rows.slice((page - 1) * per, page * per)
    if (url.pathname === "/user") {
      if (opts.userStatus) return json(opts.userStatus, { message: "Bad credentials" })
      return json(200, { login: "fake-bot" })
    }
    if ((opts.statusOf ?? {})[url.pathname] !== undefined) return json(opts.statusOf[url.pathname], { message: "Not Found" })
    if ((opts.reposOf ?? {})[url.pathname] !== undefined) return json(200, slice(opts.reposOf[url.pathname].map(repoRawOf)))
    if ((opts.rosterOf ?? {})[url.pathname] !== undefined) return json(200, slice(opts.rosterOf[url.pathname]))
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

/** 基址改写（gitee 固定基址 ⇒ 本机假件；余原样——真 fetch 链）+ 出站记录。 */
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

// ── 进程内应用（网关 + 账号面 + 项目管理面——沿 `bin` 装配序）──────────────────────

async function startApp({ fetchImpl = fetch, timeoutMs = 400, now = Date.now } = {}) {
  const db = DB.openDatabase(":memory:")
  for (const [username, role] of [["admin", "admin"], ["alice", "user"]]) {
    await MEMBERS.createMember(db, { username, role, password: PASSWORD })
  }
  const routes = SERVER.createRouteTable()
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(TEMP, "gateway.db") })
  const scheduler = SYNC.createSyncScheduler({ db, config, log: null, deps: { fetchImpl, timeoutMs }, now })
  ADMIN_ROUTES.registerProjectAdminRoutes(routes, { db, config, log: null, scheduler, deps: { fetchImpl, timeoutMs }, now })
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
    routes,
    scheduler,
    adminCookie: await login("admin"),
    sourceRows: () => db.prepare("SELECT * FROM git_sources ORDER BY id").all(),
    memberRows: (projectId) => db.prepare("SELECT * FROM project_members WHERE project_id = ? ORDER BY id").all(projectId),
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}

const api = (app, method, path, options = {}) => call(app.base, method, path, { cookie: app.adminCookie, ...options })

/** 增源（多数腿共用；`scopeKind` 缺省不携——非 gitee 同形）。 */
async function addSource(app, { name, platform = "github", token = "token-x1", baseURL, scope, scopeKind, syncMode, intervalMinutes, enabled } = {}) {
  const res = await api(app, "POST", "/api/admin/git-sources", { body: { name, platform, token, baseURL, scope, scopeKind, syncMode, intervalMinutes, enabled } })
  assert.equal(res.status, 200, `增源失败：${res.text}`)
  return res.json.source
}

// ── 腿：N24（v21 迁移/回填）───────────────────────────────────────────────────

test("N24 v21 迁移/回填：v20 库升 21 ∥ 列面含 `scope_kind`（尾插）∥ 回填三用例 ∥ 余列逐值保形 ∥ 幂等", () => {
  const db = DB.openDatabase(":memory:", { migrations: DB.MIGRATIONS.slice(0, 20) })
  try {
    assert.equal(db.prepare("PRAGMA user_version").get().user_version, 20, "前置：v20 库")
    assert.equal(db.prepare("PRAGMA table_info(git_sources)").all().some((c) => c.name === "scope_kind"), false, "前置：无 scope_kind 列")
    const at = "2026-10-13T00:00:00.000Z"
    const insert = db.prepare(`INSERT INTO git_sources (name, platform, base_url, scope, token_cipher, enabled, sync_mode, interval_minutes, last_sync_result_json, token_state, created_by, created_at)
      VALUES (?, ?, NULL, ?, 'cipher-x', 1, 'poll', 60, '{"ok":true}', 'ok', NULL, ?)`)
    insert.run("gitee-有范围", "gitee", "shanghai-xinbo", at) // 旧企业源（id=2 这类）
    insert.run("gitee-空范围", "gitee", null, at)
    insert.run("gitee-空白范围", "gitee", "   ", at) // SQL 层 TRIM 支
    insert.run("github-有范围", "github", "acme", at)
    const before = db.prepare("SELECT * FROM git_sources ORDER BY id").all().map((row) => ({ ...row }))

    assert.ok(DB.migrate(db) >= 21, "升后读数 ≥ 21（本批落地 21；后续批递升）")
    assert.equal(db.prepare("PRAGMA user_version").get().user_version, 21, "持久读数 21")
    const columns = db.prepare("PRAGMA table_info(git_sources)").all().map((c) => c.name)
    assert.deepEqual(columns, ["id", "name", "platform", "base_url", "scope", "token_cipher", "hook_secret_cipher", "enabled", "sync_mode",
      "interval_minutes", "last_sync_at", "last_sync_result_json", "token_state", "token_checked_at", "created_by", "created_at", "scope_kind"], "列面含 `scope_kind`（尾插）")

    const after = db.prepare("SELECT * FROM git_sources ORDER BY id").all()
    assert.deepEqual(after.map((row) => [row.name, row.scope_kind]), [
      ["gitee-有范围", "org"], ["gitee-空范围", "personal"], ["gitee-空白范围", "personal"], ["github-有范围", null],
    ], "回填：gitee 在场 ⇒ org ∥ 空 ⇒ personal ∥ 非 gitee 零动（NULL）")
    for (const [index, fresh] of after.entries()) {
      const { scope_kind: _kind, ...rest } = fresh
      assert.deepEqual(rest, before[index], `存量行余列逐值保形：${fresh.name}`)
    }

    assert.throws(() => db.prepare("UPDATE git_sources SET scope_kind = 'bogus' WHERE id = 1").run(), /CHECK/, "CHECK 三值（表外 ⇒ 拒）")
    const version = db.prepare("PRAGMA user_version").get().user_version
    const snapshot = db.prepare("SELECT * FROM git_sources ORDER BY id").all()
    DB.migrate(db) // 幂等：已在链尾 ⇒ 零动作
    assert.deepEqual([db.prepare("PRAGMA user_version").get().user_version, db.prepare("SELECT * FROM git_sources ORDER BY id").all()], [version, snapshot], "再升零变（幂等）")
  } finally {
    db.close()
  }
})

// ── 腿：N25（建/改三态形门 + 跨态清空）∥ E5（形错零变）────────────────────────

test("N25 建/改三态形门：三值各一落库逐值 ∥ 六拒形 400（设计「五形」+ §2.2③ 表外腿）∥ 改源键级（不携 ⇒ 沿行值）∥ 跨态清空两形", async () => {
  const app = await startApp()
  try {
    const personal = await addSource(app, { name: "个人源", platform: "gitee", scopeKind: "personal" })
    const org = await addSource(app, { name: "组织源", platform: "gitee", scope: "acme", scopeKind: "org" })
    const enterprise = await addSource(app, { name: "企业源", platform: "gitee", scope: "shanghai-xinbo", scopeKind: "enterprise" })
    assert.deepEqual([personal.scopeKind, personal.scope, org.scopeKind, org.scope, enterprise.scopeKind, enterprise.scope],
      ["personal", null, "org", "acme", "enterprise", "shanghai-xinbo"], "三值各一落库 + `sourceView.scopeKind` 回读")
    assert.deepEqual(app.sourceRows().map((row) => [row.name, row.scope_kind]), [["个人源", "personal"], ["组织源", "org"], ["企业源", "enterprise"]], "库列逐值")

    // 六拒形（库零变——含表外类型腿）
    const before = app.sourceRows()
    const rejects = [
      [{ name: "缺类型", platform: "gitee", token: "t" }, /范围类型/],
      [{ name: "个人带范围", platform: "gitee", token: "t", scopeKind: "personal", scope: "acme" }, /个人范围不带范围名/],
      [{ name: "组织缺范围", platform: "gitee", token: "t", scopeKind: "org" }, /组织\/企业范围须填范围名/],
      [{ name: "企业缺范围", platform: "gitee", token: "t", scopeKind: "enterprise" }, /组织\/企业范围须填范围名/],
      [{ name: "github 带类型", platform: "github", token: "t", scopeKind: "org" }, /范围类型仅 gitee 适用/],
      [{ name: "类型表外", platform: "gitee", token: "t", scopeKind: "team", scope: "acme" }, /范围类型非法/],
    ]
    for (const [body, pattern] of rejects) {
      const res = await api(app, "POST", "/api/admin/git-sources", { body })
      assert.equal(res.status, 400, `拒形 400：${body.name}（实得 ${res.status}：${res.text}）`)
      assert.match(res.json.error.message, pattern, `拒形人话：${body.name}`)
    }
    assert.deepEqual(app.sourceRows(), before, "六拒形库零变")

    // 改源键级：不携 ⇒ 沿行值（只改 name 不动类型/范围）
    const renamed = await api(app, "PATCH", `/api/admin/git-sources/${enterprise.id}`, { body: { name: "企业源二号" } })
    assert.deepEqual([renamed.json.source.name, renamed.json.source.scopeKind, renamed.json.source.scope], ["企业源二号", "enterprise", "shanghai-xinbo"], "改源不携 ⇒ 沿行值")
    const kindSwitched = await api(app, "PATCH", `/api/admin/git-sources/${org.id}`, { body: { scopeKind: "enterprise", scope: "ent-z" } })
    assert.deepEqual([kindSwitched.json.source.scopeKind, kindSwitched.json.source.scope], ["enterprise", "ent-z"], "组织 ⇒ 企业（类型 + 范围同携）")

    // 跨态清空两形：① 组织/企业 ⇒ 个人（`scopeKind:'personal'` + `scope:''`）② 平台切出 gitee（scopeKind 不携 ∥ 携 null）
    const toPersonal = await api(app, "PATCH", `/api/admin/git-sources/${kindSwitched.json.source.id}`, { body: { scopeKind: "personal", scope: "" } })
    assert.deepEqual([toPersonal.json.source.scopeKind, toPersonal.json.source.scope], ["personal", null], "清空形①：落 scope=NULL ∥ scope_kind=personal")

    const outOfGitee = await api(app, "PATCH", `/api/admin/git-sources/${personal.id}`, { body: { platform: "github", scopeKind: null } })
    assert.deepEqual([outOfGitee.json.source.platform, outOfGitee.json.source.scopeKind], ["github", null], "清空形②：平台切出 ⇒ scope_kind 落 NULL（携 null）")
    const outOfGitee2 = await api(app, "PATCH", `/api/admin/git-sources/${toPersonal.json.source.id}`, { body: { platform: "github" } })
    assert.deepEqual([outOfGitee2.json.source.platform, outOfGitee2.json.source.scopeKind], ["github", null], "清空形②：不携 ⇒ 旧值随清（非 gitee 恒 NULL）")
    const residual = await api(app, "PATCH", `/api/admin/git-sources/${renamed.json.source.id}`, { body: { platform: "github", scopeKind: "org" } })
    assert.deepEqual([residual.status, residual.json.error.message], [400, "范围类型仅 gitee 适用"], "残留提交 ⇒ 400")
    assert.deepEqual(app.sourceRows().find((row) => row.id === renamed.json.source.id).scope_kind, "enterprise", "残留 400 ⇒ 库零变")
  } finally {
    await app.close()
  }
})

test("E5 范围三态形错零变：六拒不落库 ∥ 行集逐值零变（沿 E1）", async () => {
  const app = await startApp()
  try {
    const seed = await addSource(app, { name: "基准源", platform: "gitee", scope: "acme", scopeKind: "org" })
    const before = app.sourceRows()
    const cases = [
      ["缺类型", { platform: "gitee", token: "t" }, /范围类型/],
      ["个人带范围名", { platform: "gitee", token: "t", scopeKind: "personal", scope: "acme" }, /个人范围不带范围名/],
      ["组织缺范围名", { platform: "gitee", token: "t", scopeKind: "org" }, /组织\/企业范围须填范围名/],
      ["企业缺范围名", { platform: "gitee", token: "t", scopeKind: "enterprise" }, /组织\/企业范围须填范围名/],
      ["非 gitee 携类型", { platform: "gitlab", token: "t", scopeKind: "org" }, /范围类型仅 gitee 适用/],
    ]
    for (const [label, rest, pattern] of cases) {
      const res = await api(app, "POST", "/api/admin/git-sources", { body: { name: `形错-${label}`, ...rest } })
      assert.equal(res.status, 400, `${label} ⇒ 400（实得 ${res.status}：${res.text}）`)
      assert.match(res.json.error.message, pattern, `${label} 人话`)
    }
    const residual = await api(app, "PATCH", `/api/admin/git-sources/${seed.id}`, { body: { platform: "gitlab", scopeKind: "org" } })
    assert.deepEqual([residual.status, residual.json.error.message], [400, "范围类型仅 gitee 适用"], "残留提交（改源切出 gitee）⇒ 400")
    assert.deepEqual(app.sourceRows(), before, "`git_sources` 行集逐值零变")
  } finally {
    await app.close()
  }
})

// ── 腿：N26（列表三态路由）────────────────────────────────────────────────────

test("N26 列表三态路由：org ⇒ `/orgs/` ∥ enterprise ⇒ `/enterprises/` ∥ personal ⇒ 仅主径 ∥ 并集去重 ∥ 零另一径出站", async () => {
  const mainRepos = ["acme/dup-1", ...Array.from({ length: 149 }, (_, i) => `acme/main-${i + 2}`)]
  const fake = await startFakeGitee({
    reposOf: {
      "/user/repos": mainRepos,
      "/orgs/acme/repos": ["acme/dup-1", "acme/extra-1", "acme/extra-2"],
      "/enterprises/ent-x/repos": ["ent-x/app-1", "ent-x/app-2"],
    },
  })
  const app = await startApp({ fetchImpl: platformFetch(fake) })
  try {
    const org = await addSource(app, { name: "组织源", platform: "gitee", scope: "acme", scopeKind: "org" })
    const ent = await addSource(app, { name: "企业源", platform: "gitee", scope: "ent-x", scopeKind: "enterprise" })
    const personal = await addSource(app, { name: "个人源", platform: "gitee", scopeKind: "personal" })

    let mark = fake.calls.length
    const orgRes = await api(app, "GET", `/api/admin/git-sources/${org.id}/repos`)
    const orgCalls = fake.calls.slice(mark).map((entry) => entry.path)
    assert.deepEqual([...new Set(orgCalls)].sort(), ["/orgs/acme/repos", "/user/repos"], "org 出站 = 主径 + 组织径")
    assert.deepEqual(fake.calls.slice(mark).filter((entry) => entry.path === "/user/repos").map((entry) => entry.params.page), ["1", "2"], "主径两页")
    assert.equal(orgCalls.some((path) => path.startsWith("/enterprises/")), false, "org 径零企业径出站")
    assert.deepEqual([orgRes.json.ok, orgRes.json.repos.length, orgRes.json.truncated], [true, 152, false], "并集去重（150 + 3 − 1）∥ 未截断")
    assert.deepEqual([orgRes.json.repos[0].fullName, orgRes.json.repos.at(-2).fullName, orgRes.json.repos.at(-1).fullName], ["acme/dup-1", "acme/extra-1", "acme/extra-2"], "去重保持主径行 ∥ 范围新行尾插")

    mark = fake.calls.length
    const entRes = await api(app, "GET", `/api/admin/git-sources/${ent.id}/repos`)
    const entCalls = fake.calls.slice(mark).map((entry) => entry.path)
    assert.deepEqual([...new Set(entCalls)].sort(), ["/enterprises/ent-x/repos", "/user/repos"], "enterprise 出站 = 主径 + 企业径")
    assert.equal(entCalls.some((path) => path.startsWith("/orgs/")), false, "enterprise 径零组织径出站（不静默改走他径）")
    assert.deepEqual(entRes.json.repos.map((row) => row.fullName).slice(-2), ["ent-x/app-1", "ent-x/app-2"], "企业仓行并入逐值")

    mark = fake.calls.length
    const personalRes = await api(app, "GET", `/api/admin/git-sources/${personal.id}/repos`)
    const personalCalls = fake.calls.slice(mark).map((entry) => entry.path)
    assert.deepEqual([...new Set(personalCalls)], ["/user/repos"], "personal ⇒ 仅主径（无范围径）")
    assert.equal(personalRes.json.repos.length, 150, "个人可见仓逐值")
  } finally {
    await app.close()
    await fake.close()
  }
})

// ── 腿：N27（名册路由 + 企业嵌套行 + personal 不可用 + 同步落行）───────────────

test("N27 名册路由 + 嵌套解析：org 径零回归 ∥ 企业嵌套行（只读底线/管理/缺名）∥ personal ⇒ scope_missing ∥ 同步落行逐值", async () => {
  const roster13 = [
    ...Array.from({ length: 12 }, (_, i) => entMemberOf(`member-${String(i + 1).padStart(2, "0")}`, "member")),
    entMemberOf("boss-01", "admin"),
  ]
  const fake = await startFakeGitee({
    rosterOf: {
      "/orgs/acme/members": [orgMemberOf("org-boss", true), orgMemberOf("org-user", false)],
      "/enterprises/ent-x/members": roster13,
    },
  })
  const app = await startApp({ fetchImpl: platformFetch(fake) })
  try {
    // org 径零回归（顶层 `login` + `is_admin`——逐值）
    const orgRoster = await CLIENT.fetchRoster({ platform: "gitee", token: "t", scope: "acme", scopeKind: "org", fetchImpl: platformFetch(fake) })
    assert.deepEqual(orgRoster.members, [
      { username: "org-boss", role: "admin", level: "manage" },
      { username: "org-user", role: "member", level: "read" },
    ], "组织行解析零回归")
    assert.equal(fake.callsOf("/orgs/acme/members").length, 1, "组织径出站")

    // 企业嵌套行（`user.login` + 顶层 `role`）——直测
    const entRoster = await CLIENT.fetchRoster({ platform: "gitee", token: "t", scope: "ent-x", scopeKind: "enterprise", fetchImpl: platformFetch(fake) })
    assert.equal(fake.callsOf("/enterprises/ent-x/members").length, 1, "企业径出站")
    assert.deepEqual([entRoster.members.length, entRoster.members[0], entRoster.members.at(-1)], [13, { username: "member-01", role: "member", level: "read" }, { username: "boss-01", role: "admin", level: "manage" }], "企业行逐值（member ⇒ 只读底线 ∥ role:'admin' ⇒ 管理）")
    assert.equal(entRoster.members.some((person) => person.username.includes("undefined")), false, "嵌套取用户名（非顶层空）")

    // 三谓词：`is_admin === true` ∥ `admin === true` ∥ `role === "admin"`（缺 ⇒ 只读）
    const shapeFake = await startFakeGitee({
      rosterOf: { "/enterprises/ent-x/members": [
        { user: { login: "p-1" }, is_admin: true, role: "member" },
        { user: { login: "p-2" }, admin: true, role: "member" },
        { user: { login: "p-3" }, role: "admin" },
        { user: { login: "p-4" }, role: "member" },
        { user: { login: "p-5" } },
      ] },
    })
    try {
      const shaped = await CLIENT.fetchRoster({ platform: "gitee", token: "t", scope: "ent-x", scopeKind: "enterprise", fetchImpl: platformFetch(shapeFake) })
      assert.deepEqual(shaped.members.map((person) => [person.username, person.role, person.level]), [
        ["p-1", "admin", "manage"], ["p-2", "admin", "manage"], ["p-3", "admin", "manage"], ["p-4", "member", "read"], ["p-5", "member", "read"],
      ], "三谓词逐值（缺 ⇒ 只读底线）")
    } finally {
      await shapeFake.close()
    }

    // 缺名 ⇒ bad_response（现行口径）
    const badFake = await startFakeGitee({ rosterOf: { "/enterprises/ent-x/members": [{ role: "member", user: {} }] } })
    try {
      await assert.rejects(
        CLIENT.fetchRoster({ platform: "gitee", token: "t", scope: "ent-x", scopeKind: "enterprise", fetchImpl: platformFetch(badFake) }),
        (e) => e.kind === "bad_response" && /缺用户名/.test(e.message),
        "企业行缺用户名 ⇒ bad_response",
      )
    } finally {
      await badFake.close()
    }

    // personal ⇒ scope_missing（人话）；同步面自含形同判
    await assert.rejects(
      CLIENT.fetchRoster({ platform: "gitee", token: "t", scope: null, scopeKind: "personal", fetchImpl: platformFetch(fake) }),
      (e) => e.kind === "scope_missing" && /个人范围无成员表/.test(e.message),
      "personal ⇒ scope_missing 人话",
    )
    const personal = await addSource(app, { name: "个人源", platform: "gitee", scopeKind: "personal" })
    const personalSync = await api(app, "POST", `/api/admin/git-sources/${personal.id}/sync`)
    assert.deepEqual([personalSync.status, personalSync.json.ok, personalSync.json.error.kind, /个人范围无成员表/.test(personalSync.json.error.message)],
      [200, false, "scope_missing", true], "个人源同步 ⇒ 自含形 + 人话")

    // 同步落行逐值（13 人——企业源）
    const enterprise = await addSource(app, { name: "企业源", platform: "gitee", scope: "ent-x", scopeKind: "enterprise" })
    const projectRes = await api(app, "POST", "/api/admin/projects", { body: { address: "https://gitee.com/ent-x/app-1.git", displayName: "ent-x/app-1" } })
    assert.equal(projectRes.status, 200, `加仓失败：${projectRes.text}`)
    const project = projectRes.json.projects[0]
    app.db.prepare("UPDATE projects SET source_id = ? WHERE id = ?").run(enterprise.id, project.id)
    const sync = await api(app, "POST", `/api/admin/git-sources/${enterprise.id}/sync`)
    assert.deepEqual([sync.json.ok, sync.json.counts], [true, { projects: 1, roster: 13, added: 13, updated: 0, removed: 0 }], "企业名册同步成（13 人）")
    const rows = app.memberRows(project.id)
    assert.deepEqual([rows.length, rows.filter((row) => row.level === "read").length, rows.filter((row) => row.level === "manage").length], [13, 12, 1], "落行档位逐值（只读底线 12 ∥ 管理 1）")
    assert.deepEqual(rows.filter((row) => row.level === "manage").map((row) => [row.username, row.synced_role, row.origin]), [["boss-01", "admin", "sync"]], "`synced_role` 原文入行（admin）")
  } finally {
    await app.close()
    await fake.close()
  }
})

// ── 腿：N28（不符报错——404 人话 + 出站零另一径）───────────────────────────────

test("N28 不符报错：范围径 404 ⇒ `http_error` + 核对范围类型人话 ∥ 出站零另一径请求", async () => {
  const fake = await startFakeGitee({
    reposOf: { "/user/repos": ["acme/main-1"] },
    statusOf: { "/orgs/acme/repos": 404, "/enterprises/ent-x/members": 404 },
  })
  const app = await startApp({ fetchImpl: platformFetch(fake) })
  try {
    const org = await addSource(app, { name: "自称组织", platform: "gitee", scope: "acme", scopeKind: "org" })
    let mark = fake.calls.length
    const orgRes = await api(app, "GET", `/api/admin/git-sources/${org.id}/repos`)
    const orgCalls = fake.calls.slice(mark).map((entry) => entry.path)
    assert.deepEqual([orgRes.status, orgRes.json.ok, orgRes.json.error.kind], [200, false, "http_error"], "组织径 404 ⇒ 自含形 `http_error`")
    assert.match(orgRes.json.error.message, /「acme」在组织端点不存在——请核对范围类型\/编辑源改选/, "人话逐值")
    assert.equal(orgCalls.includes("/orgs/acme/repos"), true, "自称组织 ⇒ 只打组织径")
    assert.equal(orgCalls.some((path) => path.startsWith("/enterprises/")), false, "出站零企业径（不静默改走他径）")

    const ent = await addSource(app, { name: "自称企业", platform: "gitee", scope: "ent-x", scopeKind: "enterprise" })
    mark = fake.calls.length
    const entSync = await api(app, "POST", `/api/admin/git-sources/${ent.id}/sync`)
    const entCalls = fake.calls.slice(mark).map((entry) => entry.path)
    assert.deepEqual([entSync.status, entSync.json.ok, entSync.json.error.kind], [200, false, "http_error"], "企业名册径 404 ⇒ 自含形")
    assert.match(entSync.json.error.message, /「ent-x」在企业端点不存在——请核对范围类型\/编辑源改选/, "名册面同人话")
    assert.equal(entCalls.some((path) => path.startsWith("/orgs/")), false, "出站零组织径（不静默改走他径）")
  } finally {
    await app.close()
    await fake.close()
  }
})

// ── 腿：N29（超时口径）────────────────────────────────────────────────────────

test("N29 超时口径：`readTimeoutOf` 两值（缺省同余平台）∥ 挂起假件模拟时钟 ⇒ 消息逐值 ∥ 注入面恒胜", async (t) => {
  assert.deepEqual([CLIENT.readTimeoutOf("gitee"), CLIENT.readTimeoutOf("github"), CLIENT.readTimeoutOf("gitlab"), CLIENT.readTimeoutOf("selfhosted"), CLIENT.readTimeoutOf(undefined)],
    [20000, 10000, 10000, 10000, 10000], "平台两值（gitee 20000 ∥ 余 10000）")
  assert.deepEqual([CLIENT.GITEE_READ_TIMEOUT_MS, CLIENT.READ_TIMEOUT_MS], [20000, 10000], "常量逐值")

  /** 挂起假件（不响应——仅按 abort 信号收口）。 */
  const hangFetch = (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener("abort", () => reject(Object.assign(new Error("The operation was aborted"), { name: "AbortError" })))
  })
  const settle = (promise, box) => { promise.then(() => { box.error = "resolved" }, (e) => { box.error = e }) }

  t.mock.timers.enable({ apis: ["setTimeout"] })
  try {
    const gitee = {}
    settle(CLIENT.checkToken({ platform: "gitee", token: "t", fetchImpl: hangFetch }), gitee)
    t.mock.timers.tick(19999)
    await flush()
    assert.equal(gitee.error, undefined, "未到 20s ⇒ 未超时")
    t.mock.timers.tick(1)
    await flush()
    assert.deepEqual([gitee.error?.kind, gitee.error?.message], ["timeout", "请求超时（20000ms）"], "gitee 缺省 ⇒ 20000ms 消息")

    const github = {}
    settle(CLIENT.checkToken({ platform: "github", token: "t", fetchImpl: hangFetch }), github)
    t.mock.timers.tick(9999)
    await flush()
    assert.equal(github.error, undefined, "未到 10s ⇒ 未超时")
    t.mock.timers.tick(1)
    await flush()
    assert.deepEqual([github.error?.kind, github.error?.message], ["timeout", "请求超时（10000ms）"], "余平台缺省 ⇒ 10000ms 消息")

    const injected = {}
    settle(CLIENT.checkToken({ platform: "gitee", token: "t", fetchImpl: hangFetch, timeoutMs: 1234 }), injected)
    t.mock.timers.tick(1234)
    await flush()
    assert.deepEqual([injected.error?.kind, injected.error?.message], ["timeout", "请求超时（1234ms）"], "注入面恒胜（覆盖平台缺省）")
  } finally {
    t.mock.timers.reset()
  }
})

test("N29′ 调用点接线：拉列表/同步两径缺省（无 `deps.timeoutMs`）⇒ 挂起假件模拟时钟 ⇒ gitee 20000ms 消息", async (t) => {
  /** 挂起假件（不响应——仅按 abort 信号收口）。 */
  const hangFetch = (url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener("abort", () => reject(Object.assign(new Error("The operation was aborted"), { name: "AbortError" })))
  })
  const app = await startApp({ fetchImpl: hangFetch, timeoutMs: null }) // deps.timeoutMs 缺省 ⇒ 平台解析径
  try {
    const source = await addSource(app, { name: "接线源", platform: "gitee", scopeKind: "personal" })
    t.mock.timers.enable({ apis: ["setTimeout"] })
    try {
      // ① sync.mjs 调用点（体检径——`checkToken` 缺省按平台解析）
      let check = null
      app.scheduler.checkPat(source.id, { actor: "tester" }).then((body) => { check = body }, (e) => { check = e })
      t.mock.timers.tick(19999)
      await flush()
      assert.equal(check, null, "未到 20s ⇒ 体检未收口")
      t.mock.timers.tick(1)
      await flush()
      assert.deepEqual([check?.ok, check?.error?.kind, check?.error?.message], [false, "timeout", "请求超时（20000ms）"], "sync 调用点缺省 ⇒ gitee 20000ms")

      // ② admin-routes.mjs 调用点（拉列表径——`listRepos` 缺省按平台解析）
      const route = app.routes.resolve("GET", `/api/admin/git-sources/${source.id}/repos`)
      const res = { headersSent: false, status: null, text: "", writeHead(status) { this.headersSent = true; this.status = status }, end(text) { this.text = String(text) } }
      let pending = null
      Promise.resolve(route.handler({ method: "GET", headers: { cookie: app.adminCookie } }, res, { params: route.params })).then(() => { pending = "done" }, (e) => { pending = e })
      t.mock.timers.tick(19999)
      await flush()
      assert.equal(pending, null, "未到 20s ⇒ 拉列表未收口")
      t.mock.timers.tick(1)
      await flush()
      const body = JSON.parse(res.text)
      assert.deepEqual([pending, body.ok, body.error.kind, body.error.message], ["done", false, "timeout", "请求超时（20000ms）"], "admin-routes 调用点缺省 ⇒ gitee 20000ms")
    } finally {
      t.mock.timers.reset()
    }
  } finally {
    await app.close()
  }
})

// ── 腿：B4（企业仓行兼容）─────────────────────────────────────────────────────

test("B4 企业仓行兼容：`repoRowOf('gitee', raw)` 逐值（零解析分支——与现行同形）", () => {
  const raw = {
    id: 123456, full_name: "shanghai-xinbo/app", human_name: "app", url: "https://gitee.com/api/v5/repos/shanghai-xinbo/app",
    html_url: "https://gitee.com/shanghai-xinbo/app", ssh_url: "git@gitee.com:shanghai-xinbo/app.git", private: true,
  }
  assert.deepEqual(CLIENT.repoRowOf("gitee", raw), { fullName: "shanghai-xinbo/app", address: "https://gitee.com/shanghai-xinbo/app", private: true }, "企业仓行逐值（`full_name`/`html_url`/`private`）")
  assert.deepEqual(CLIENT.repoRowOf("gitee", { full_name: "ent/public", ssh_url: "git@gitee.com:ent/public.git", private: false }),
    { fullName: "ent/public", address: "git@gitee.com:ent/public.git", private: false }, "址回退链（html_url 缺 ⇒ ssh_url）")
  assert.throws(() => CLIENT.repoRowOf("gitee", { full_name: "ent/no-address" }), /缺地址字段/, "缺址 ⇒ bad_response（现行口径零变）")
  assert.equal(GS.SCOPE_KINDS.join("|"), "personal|org|enterprise", "三值枚举单源在场")
})
