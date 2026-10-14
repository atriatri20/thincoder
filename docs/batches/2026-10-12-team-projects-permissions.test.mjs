/**
 * 2026-10-12-team-projects-permissions.test.mjs — thincoder-server 批内单测件（`team-projects-permissions` 批（B2）·
 * **A 件 = 服务端核心**：v17 迁移 ∥ 源 CRUD/掩码 ∥ 加仓两径 ∥ 能力矩阵/可见性 ∥ 成员管理 ∥ 删源防护 ∥ 鉴权门 ∥
 * 搜索 ∥ 项目删除 ∥ 凭据键路径单源 ∥ 地址/用户名归一 ∥ 形错零变 ∥ 删除门。名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-12-team-projects-permissions.test.mjs`
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/project/PROJECTS.md` §9/§10；腿 ↔ 用例在括号）：
 *   N1（空库直落 v17）∥ N2（v16 升 17 + 幂等 + 存量审计行保形）∥ N3（源 CRUD + 掩码 + 平台门）
 *   ∥ N4（手输加仓）∥ N5（批量加仓全成或全拒）∥ N6（能力矩阵六主体）∥ N7（可见性）∥ N8（成员管理）
 *   ∥ N9（改项目三件）∥ N10（删源防护）∥ N18（判权三态）∥ N19（列表搜索）∥ N22（项目删除成链）
 *   ∥ N23（凭据键路径单源）∥ B1（地址跨形归一）∥ B2（用户名归一）∥ E1（形错零变）∥ E4（删除门）
 *   ∥ 纯函数面（归一 ∥ 能力矩阵读数 ∥ 到期判据）。
 * 跨件注：同步/平台假件腿（N11–N17 ∥ N20/N21 ∥ B3 ∥ E2/E3）住姊妹件 `…-sync.test.mjs`（批档 §2 用例划分）。
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
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const AUDIT = await load("thincoder-server/src/accounts/audit.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const CRYPTO = await load("thincoder-server/src/store/credential-crypto.mjs")
const ONBOARDING = await load("thincoder-server/src/sandbox/onboarding.mjs")
const PROJECTS = await load("thincoder-server/src/project/projects.mjs")
const PROJECT_ROUTES = await load("thincoder-server/src/project/routes.mjs")
const ADMIN_ROUTES = await load("thincoder-server/src/project/admin-routes.mjs")
const WEBHOOK_ROUTES = await load("thincoder-server/src/project/webhooks.mjs")
const SYNC = await load("thincoder-server/src/project/sync.mjs")

const PASSWORD = "password-123"
const TEMP = mkdtempSync(join(tmpdir(), "tc-projects-"))

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

/** 进程内应用（网关 + 账号面 + 项目面三族——沿 `bin` 装配序）；四账号：admin ∥ alice ∥ bob ∥ carol ∥ dave ∥ erin。 */
async function startApp() {
  const db = DB.openDatabase(":memory:")
  for (const [username, role] of [["admin", "admin"], ["alice", "user"], ["bob", "user"], ["carol", "user"], ["dave", "user"], ["erin", "user"]]) {
    await MEMBERS.createMember(db, { username, role, password: PASSWORD })
  }
  const routes = SERVER.createRouteTable()
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(TEMP, "gateway.db") })
  const scheduler = SYNC.createSyncScheduler({ db, config, log: null, deps: { fetchImpl: () => { throw new Error("A 件零外呼") } } })
  PROJECT_ROUTES.registerProjectRoutes(routes, { db })
  ADMIN_ROUTES.registerProjectAdminRoutes(routes, { db, config, log: null, scheduler })
  WEBHOOK_ROUTES.registerProjectWebhookRoutes(routes, { db, config, log: null, scheduler })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  const server = SERVER.createGatewayServer({ config, routes, log: null })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const base = `http://127.0.0.1:${server.address().port}`
  const login = async (username) => {
    const res = await call(base, "POST", "/api/login", { body: { username, password: PASSWORD } })
    const line = (res.setCookies ?? []).find((item) => item.startsWith(`${SESSION.SESSION_COOKIE}=`))
    return line ? line.split(";")[0] : null
  }
  const cookies = {}
  for (const username of ["admin", "alice", "bob", "carol", "dave", "erin"]) cookies[username] = await login(username)
  return {
    db,
    base,
    config,
    cookies,
    adminCookie: cookies.admin,
    /** 审计行（按 kind 筛——`project_event` 型）。 */
    audits: (kind) => db.prepare("SELECT * FROM audit_events WHERE type = 'project_event' ORDER BY id").all().filter((row) => JSON.parse(row.detail ?? "{}").kind === kind),
    auditCount: () => db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n,
    projects: () => db.prepare("SELECT * FROM projects ORDER BY id").all(),
    memberRows: (projectId) => db.prepare("SELECT * FROM project_members WHERE project_id = ? ORDER BY id").all(projectId),
    sourceRows: () => db.prepare("SELECT * FROM git_sources ORDER BY id").all(),
    rows: (sql, ...args) => db.prepare(sql).all(...args),
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}

const as = (app, who) => (method, path, options = {}) => call(app.base, method, path, { cookie: app.cookies[who], ...options })
const api = (app, method, path, options = {}) => call(app.base, method, path, { cookie: app.adminCookie, ...options })

/** 增源（多数腿共用——缺省 github/poll；出 = 源读数）。 */
async function addSource(app, { name, platform = "github", token = "ghp_abcd1234", baseURL, scope, scopeKind, syncMode, intervalMinutes, enabled } = {}) {
  const res = await api(app, "POST", "/api/admin/git-sources", { body: { name, platform, token, baseURL, scope, scopeKind, syncMode, intervalMinutes, enabled } })
  assert.equal(res.status, 200, `增源失败：${res.text}`)
  return res.json.source
}

/** 手输加仓（出 = 项目行）。 */
async function addProject(app, body) {
  const res = await api(app, "POST", "/api/admin/projects", { body })
  assert.equal(res.status, 200, `加仓失败：${res.text}`)
  return res.json.projects[0]
}

/** 成员行素材（直插——多数腿造前置态用；经端点加人 = N8）。 */
function seedMember(app, projectId, username, level, origin = "manual") {
  const at = new Date().toISOString()
  app.db.prepare("INSERT INTO project_members (project_id, username, level, origin, synced_role, created_at, updated_at) VALUES (?, ?, ?, ?, NULL, ?, ?)").run(projectId, username, level, origin, at, at)
}

// ── 腿：N1（空库直落 v17）────────────────────────────────────────────────────

test("N1 空库直落 v17：版本读数 ∥ 三表列面/两索引 ∥ 审计 CHECK 十四型（`project_event` 可写）", () => {
  const db = DB.openDatabase(":memory:")
  try {
    assert.ok(DB.SCHEMA_VERSION >= 17, "链尾段号 ≥ 17（本批落地 17；后续批递升——2026-10-13 父侧收正）")
    assert.ok(db.prepare("PRAGMA user_version").get().user_version >= 17, "空库直落 ≥ 17（同上）")
    assert.deepEqual(
      db.prepare("PRAGMA table_info(git_sources)").all().map((c) => c.name),
      ["id", "name", "platform", "base_url", "scope", "token_cipher", "hook_secret_cipher", "enabled", "sync_mode", "interval_minutes", "last_sync_at", "last_sync_result_json", "token_state", "token_checked_at", "created_by", "created_at", "scope_kind"],
      "git_sources 列面（含 hook_secret_cipher ∥ v21 尾插 scope_kind）",
    )
    assert.deepEqual(
      db.prepare("PRAGMA table_info(projects)").all().map((c) => c.name),
      ["id", "source_id", "address", "display_name", "owner_username", "created_by", "created_at"],
      "projects 列面",
    )
    assert.deepEqual(
      db.prepare("PRAGMA table_info(project_members)").all().map((c) => c.name),
      ["id", "project_id", "username", "level", "origin", "synced_role", "created_at", "updated_at"],
      "project_members 列面",
    )
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'").all().map((r) => r.name)
    for (const name of ["idx_project_members_user", "idx_projects_source", "idx_audit_ts", "idx_audit_type_ts"]) {
      assert.ok(indexes.includes(name), `索引在场：${name}`)
    }
    assert.equal(AUDIT.AUDIT_TYPES.length, 15, "审计型面十五（team-ledger 批扩 `ledger_event`——2026-10-13）")
    assert.equal(AUDIT.recordAudit(db, { type: "project_event", actor: "tester", detail: { kind: "project_add" } }) > 0, true, "`project_event` 可写（CHECK 放行）")
    assert.throws(() => AUDIT.recordAudit(db, { type: "no_such_type", actor: "tester" }), /审计类型非法/, "表外型 ⇒ 拒")
  } finally {
    db.close()
  }
})

// ── 腿：N2（旧库升 v17 + 幂等 + 存量保形）────────────────────────────────────

test("N2 v16 库升 17：读数/幂等（再开零变）∥ 存量审计行逐值保形 ∥ 索引重建 ∥ 新 id 不撞存量", () => {
  const db = DB.openDatabase(":memory:", { migrations: DB.MIGRATIONS.slice(0, 16) })
  try {
    assert.equal(db.prepare("PRAGMA user_version").get().user_version, 16, "前置：v16")
    const before = [
      AUDIT.recordAudit(db, { type: "login_success", actor: "alice", actorId: 1, target: "x", targetId: 2, detail: { ip: "127.0.0.1" }, ts: 1700000000000 }),
      AUDIT.recordAudit(db, { type: "sandbox_event", actor: "admin", detail: { kind: "onboarding_start" }, ts: 1700000000001 }),
    ]
    const snapshot = db.prepare("SELECT * FROM audit_events ORDER BY id").all()
    assert.ok(DB.migrate(db) >= 17, "升后读数 ≥ 17（本批落地 17；后续批递升——2026-10-13 父侧收正）")
    assert.ok(db.prepare("PRAGMA user_version").get().user_version >= 17, "持久读数 ≥ 17（同上）")
    assert.deepEqual(db.prepare("SELECT * FROM audit_events ORDER BY id").all(), snapshot, "存量审计行逐值保形")
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'").all().map((r) => r.name)
    for (const name of ["idx_audit_ts", "idx_audit_type_ts"]) assert.ok(indexes.includes(name), `重建后索引在场：${name}`)
    const fresh = AUDIT.recordAudit(db, { type: "project_event", actor: "admin", detail: { kind: "source_add" } })
    assert.ok(fresh > Math.max(...before), "新行 id 不撞存量（sqlite_sequence 连续）")
    const version = db.prepare("PRAGMA user_version").get().user_version
    const again = db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n
    DB.migrate(db) // 幂等：已在链尾 ⇒ 零动作
    assert.deepEqual([db.prepare("PRAGMA user_version").get().user_version, db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n], [version, again], "再升零变（幂等）")
  } finally {
    db.close()
  }
})

// ── 腿：N3（源 CRUD + 掩码 + 平台门）─────────────────────────────────────────

test("N3 源 CRUD：四平台各一 ∥ 掩码零明文 ∥ token_state 缺省 unknown ∥ 重名/枚举外/自建缺基址/间隔越界 ⇒ 400 ∥ 事件平台门", async () => {
  const app = await startApp()
  try {
    const gitee = await addSource(app, { name: "gitee 组织", platform: "gitee", token: "gitee-secret-9999", scopeKind: "org", scope: "org-a" })
    const github = await addSource(app, { name: "github 组织", platform: "github", token: "ghp_abcd1234", scope: "acme", syncMode: "event", intervalMinutes: 15 })
    const gitlab = await addSource(app, { name: "gitlab 组", platform: "gitlab", token: "glpat-7777" })
    const self = await addSource(app, { name: "自建", platform: "selfhosted", baseURL: "https://git.example.com", token: "self-token-0001", enabled: false })
    assert.deepEqual(
      [gitee.platform, gitee.token, gitee.hookSecret, gitee.enabled, gitee.syncMode, gitee.intervalMinutes, gitee.tokenState, gitee.lastSyncAt, gitee.lastSyncResult],
      ["gitee", { set: true, hint: "…9999" }, { set: false, hint: null }, true, "poll", 60, "unknown", null, {}],
      "增源行逐值（掩码 = `…`+末 4；状态列缺省）",
    )
    assert.deepEqual([github.syncMode, github.intervalMinutes, github.scope], ["event", 15, "acme"], "github 事件方式 + 间隔 + scope")
    assert.deepEqual([gitlab.baseURL, self.baseURL, self.enabled], [null, "https://git.example.com", false], "基址仅自建落库 ∥ 停用旗")

    const list = await api(app, "GET", "/api/admin/git-sources")
    assert.equal(list.json.sources.length, 4, "列四行（id 序）")
    assert.equal(list.json.sources.map((row) => row.name).join("|"), "gitee 组织|github 组织|gitlab 组|自建", "列序 id 序")
    for (const plain of ["gitee-secret-9999", "ghp_abcd1234", "glpat-7777", "self-token-0001"]) {
      assert.equal(list.text.includes(plain), false, `读面零明文：${plain}`)
    }
    assert.ok(list.text.includes("…9999"), "掩码在场")

    // 冲突/形错面（库零变）
    const before = app.sourceRows()
    const dup = await api(app, "POST", "/api/admin/git-sources", { body: { name: "gitee 组织", platform: "gitee", token: "x1", scopeKind: "org", scope: "org-a" } })
    assert.equal(dup.status, 400, "重名 ⇒ 400")
    const badPlatform = await api(app, "POST", "/api/admin/git-sources", { body: { name: "别的平台", platform: "bitbucket", token: "x1" } })
    assert.equal(badPlatform.status, 400, "平台枚举外 ⇒ 400")
    const noBase = await api(app, "POST", "/api/admin/git-sources", { body: { name: "自建二号", platform: "selfhosted", token: "x1" } })
    assert.equal(noBase.status, 400, "自建缺基址 ⇒ 400")
    const badInterval = await api(app, "POST", "/api/admin/git-sources", { body: { name: "间隔越界", platform: "gitee", token: "x1", intervalMinutes: 1441, scopeKind: "org", scope: "org-a" } })
    assert.equal(badInterval.status, 400, "间隔越界 ⇒ 400")
    const eventGate = await api(app, "POST", "/api/admin/git-sources", { body: { name: "gitee 事件", platform: "gitee", token: "x1", syncMode: "event", scopeKind: "org", scope: "org-a" } })
    assert.equal(eventGate.status, 400, "非 github 平台选事件 ⇒ 400（平台门）")
    assert.match(eventGate.json.error.message, /无成员事件/, "平台门人话")
    assert.deepEqual(app.sourceRows(), before, "形错/冲突库零变")

    // 改源（键级）：只改 name ⇒ 掩码不动；明填 token ⇒ 替换（掩码随动）
    const renamed = await api(app, "PATCH", `/api/admin/git-sources/${gitlab.id}`, { body: { name: "gitlab 组二号" } })
    assert.deepEqual([renamed.json.source.name, renamed.json.source.token.hint], ["gitlab 组二号", "…7777"], "键级改（token 不动）")
    const rekeyed = await api(app, "PATCH", `/api/admin/git-sources/${gitlab.id}`, { body: { token: "glpat-8888" } })
    assert.deepEqual(rekeyed.json.source.token.hint, "…8888", "明填 token ⇒ 替换（掩码随新值）")
    const giteeEvent = await api(app, "PATCH", `/api/admin/git-sources/${gitee.id}`, { body: { syncMode: "event" } })
    assert.equal(giteeEvent.status, 400, "改源同过平台门")
    const updateAudits = app.audits("source_update")
    assert.deepEqual(updateAudits.map((row) => JSON.parse(row.detail).keys), [["name"], ["token"]], "改源审计只记变更键名（值零入）")
    assert.equal(updateAudits.map((row) => row.detail).join("").includes("glpat"), false, "审计零明文")

    const addAudits = app.audits("source_add")
    assert.deepEqual(
      addAudits.map((row) => JSON.parse(row.detail)),
      [
        { kind: "source_add", sourceId: gitee.id, name: "gitee 组织", platform: "gitee" },
        { kind: "source_add", sourceId: github.id, name: "github 组织", platform: "github" },
        { kind: "source_add", sourceId: gitlab.id, name: "gitlab 组", platform: "gitlab" },
        { kind: "source_add", sourceId: self.id, name: "自建", platform: "selfhosted" },
      ],
      "增源审计 detail 键集逐值",
    )

    // 删源（零挂 ⇒ 成）
    const deleted = await api(app, "DELETE", `/api/admin/git-sources/${self.id}`)
    assert.deepEqual([deleted.status, deleted.json], [200, { ok: true }], "零挂删源成")
    assert.equal((await api(app, "GET", "/api/admin/git-sources")).json.sources.length, 3, "删后列三行")
    assert.deepEqual(JSON.parse(app.audits("source_delete")[0].detail), { kind: "source_delete", sourceId: self.id, name: "自建" }, "删源审计 detail 键集")
  } finally {
    await app.close()
  }
})

// ── 腿：N4（手输加仓）∥ N5（批量加仓）────────────────────────────────────────

test("N4 手输加仓：归一逐值 ∥ 缺省显示名 = 地址末段 ∥ `project_add` 审计行 ∥ 负责人落成员行", async () => {
  const app = await startApp()
  try {
    const bare = await addProject(app, { address: "https://git.example.com/team/Alpha.git/" })
    assert.deepEqual([bare.displayName, bare.address, bare.source, bare.owner, bare.level, bare.memberCount], ["Alpha", "git.example.com/team/Alpha", null, null, null, 0], "手输行逐值（归一 + 末段名）")
    const owned = await addProject(app, { address: "git@git.example.com:team/Beta", displayName: "Beta 仓", owner: "alice" })
    assert.deepEqual([owned.displayName, owned.address, owned.owner, owned.memberCount], ["Beta 仓", "git.example.com/team/Beta", "alice", 1], "手输 + 负责人")
    assert.deepEqual(app.memberRows(owned.id).map((row) => [row.username, row.level, row.origin]), [["alice", "manage", "manual"]], "负责人 = 成员行（manual/manage）")

    const audits = app.audits("project_add")
    assert.deepEqual(
      audits.map((row) => [row.actor_name, row.target_name, JSON.parse(row.detail)]),
      [
        ["admin", `project:${bare.id}`, { kind: "project_add", projectId: bare.id, displayName: "Alpha", sourceId: null }],
        ["admin", `project:${owned.id}`, { kind: "project_add", projectId: owned.id, displayName: "Beta 仓", sourceId: null }],
      ],
      "`project_add` 审计行逐值（target = project:<id>）",
    )

    const unknownOwner = await api(app, "POST", "/api/admin/projects", { body: { address: "https://git.example.com/team/Gamma", owner: "ghost" } })
    assert.equal(unknownOwner.status, 400, "负责人非现存成员 ⇒ 400")
    assert.equal(app.projects().length, 2, "库零变")
  } finally {
    await app.close()
  }
})

test("N5 批量加仓：两行落库 ∥ 撞重复 ⇒ 400 列重复项零落库（含同批内重复）", async () => {
  const app = await startApp()
  try {
    const source = await addSource(app, { name: "批量源" })
    const res = await api(app, "POST", "/api/admin/projects", {
      body: {
        sourceId: source.id,
        repos: [
          { address: "https://github.com/acme/api.git", displayName: "acme/api" },
          { address: "git@github.com:acme/web.git", displayName: "acme/web" },
        ],
      },
    })
    assert.equal(res.status, 200, `批量加仓失败：${res.text}`)
    assert.deepEqual(res.json.projects.map((row) => [row.displayName, row.address, row.source.name]), [
      ["acme/api", "github.com/acme/api", "批量源"],
      ["acme/web", "github.com/acme/web", "批量源"],
    ], "两项目落库（源在场）")
    assert.deepEqual(app.audits("project_add").map((row) => JSON.parse(row.detail).sourceId), [source.id, source.id], "每项目一行审计（detail.sourceId）")

    const before = app.projects()
    const dupHit = await api(app, "POST", "/api/admin/projects", {
      body: { sourceId: source.id, repos: [{ address: "ssh://git@github.com/acme/api.git" }, { address: "https://github.com/acme/fresh.git" }] },
    })
    assert.equal(dupHit.status, 400, "跨形重复（ssh 形 ↔ https 形同键）⇒ 400")
    assert.match(dupHit.json.error.message, /github\.com\/acme\/api/, "400 列重复项")
    const innerDup = await api(app, "POST", "/api/admin/projects", { body: { sourceId: source.id, repos: [{ address: "https://github.com/x/y.git" }, { address: "git@github.com:x/y.git" }] } })
    assert.equal(innerDup.status, 400, "同批内重复 ⇒ 400")
    assert.deepEqual(app.projects(), before, "两径皆零落库")
    const noSource = await api(app, "POST", "/api/admin/projects", { body: { sourceId: 999, repos: [{ address: "https://github.com/x/z.git" }] } })
    assert.equal(noSource.status, 400, "源不存在 ⇒ 400")
  } finally {
    await app.close()
  }
})

// ── 腿：N6（能力矩阵）∥ N7（可见性）──────────────────────────────────────────

test("N6 能力矩阵：六主体 × 六键逐值（`can.delete` 仅 admin）∥ read 写动作 403 ∥ 非成员 404", async () => {
  const app = await startApp()
  try {
    const project = await addProject(app, { address: "https://git.example.com/team/Matrix", displayName: "矩阵仓" })
    seedMember(app, project.id, "alice", "read")
    seedMember(app, project.id, "bob", "readwrite")
    seedMember(app, project.id, "carol", "manage")
    seedMember(app, project.id, "dave", "read")
    const patch = await api(app, "PATCH", `/api/projects/${project.id}`, { body: { owner: "dave" } })
    assert.equal(patch.status, 200, `指派负责人失败：${patch.text}`)

    const myOf = async (who) => (await as(app, who)("GET", `/api/projects/${project.id}`)).json.my
    assert.deepEqual(await myOf("admin"), { level: null, owner: false, admin: true, can: { view: true, write: true, manageMembers: true, rename: true, editAddress: true, delete: true } }, "admin 恒全量真")
    assert.deepEqual(await myOf("dave"), { level: "read", owner: true, admin: false, can: { view: true, write: true, manageMembers: true, rename: true, editAddress: false, delete: false } }, "负责人（档位 read 但 owner 胜）")
    assert.deepEqual(await myOf("carol"), { level: "manage", owner: false, admin: false, can: { view: true, write: true, manageMembers: true, rename: false, editAddress: false, delete: false } }, "管理档")
    assert.deepEqual(await myOf("bob"), { level: "readwrite", owner: false, admin: false, can: { view: true, write: true, manageMembers: false, rename: false, editAddress: false, delete: false } }, "读写档")
    assert.deepEqual(await myOf("alice"), { level: "read", owner: false, admin: false, can: { view: true, write: false, manageMembers: false, rename: false, editAddress: false, delete: false } }, "只读档")

    const readWrite = await as(app, "alice")("PATCH", `/api/projects/${project.id}`, { body: { displayName: "不该成" } })
    assert.deepEqual([readWrite.status, readWrite.json.error.code], [403, "forbidden"], "只读写动作 ⇒ 403")
    const outsider = await as(app, "erin")("GET", `/api/projects/${project.id}`)
    assert.deepEqual([outsider.status, outsider.json.error.code, outsider.json.error.message], [404, "not_found", "项目不存在或不可见"], "非成员直取 ⇒ 404 不辨")

    // 纯函数面同判（判定读数 = §3 逐值）
    const rows = app.rows("SELECT * FROM projects WHERE id = ?", project.id)
    const admin = app.rows("SELECT * FROM members WHERE username = 'admin'")[0]
    const caps = PROJECTS.capabilitiesOf(app.db, admin, rows[0])
    assert.deepEqual(caps.can, { view: true, write: true, manageMembers: true, rename: true, editAddress: true, delete: true }, "判定函数直测（admin）")
  } finally {
    await app.close()
  }
})

test("N7 可见性：非成员零出现 ∥ 成员仅见己列 ∥ admin 全量", async () => {
  const app = await startApp()
  try {
    const p1 = await addProject(app, { address: "https://git.example.com/team/One", displayName: "一仓" })
    const p2 = await addProject(app, { address: "https://git.example.com/team/Two", displayName: "二仓" })
    const p3 = await addProject(app, { address: "https://git.example.com/team/Three", displayName: "三仓" })
    seedMember(app, p2.id, "alice", "read")
    seedMember(app, p3.id, "alice", "readwrite")
    seedMember(app, p1.id, "bob", "read")
    seedMember(app, p1.id, "carol", "read")
    const patch = await api(app, "PATCH", `/api/projects/${p1.id}`, { body: { owner: "carol" } })
    assert.equal(patch.status, 200, `指派负责人失败：${patch.text}`)

    const listOf = async (who) => (await as(app, who)("GET", "/api/projects")).json.projects
    assert.deepEqual((await listOf("alice")).map((row) => row.id), [p2.id, p3.id], "成员：成员行集")
    assert.deepEqual((await listOf("carol")).map((row) => [row.id, row.owner, row.level]), [[p1.id, "carol", "read"]], "负责人命中集（成员且负责人）")
    assert.deepEqual(await listOf("erin"), [], "非成员：零出现")
    assert.deepEqual((await listOf("admin")).map((row) => row.id), [p1.id, p2.id, p3.id], "admin：全量")
    assert.deepEqual((await listOf("bob")).map((row) => [row.id, row.level, row.memberCount]), [[p1.id, "read", 2]], "行形：我的档位 + 成员数")
    assert.equal((await listOf("erin")).some((row) => row.address.includes("git.example.com")), false, "非成员零泄漏")
  } finally {
    await app.close()
  }
})

// ── 腿：N8（成员管理）∥ N9（改项目）───────────────────────────────────────────

test("N8 成员管理：manage 加人 ✓ ∥ read 加人 403 ∥ 改档/移除 ∥ 非 admin 动负责人 ⇒ 403 ∥ 三审计行", async () => {
  const app = await startApp()
  try {
    const project = await addProject(app, { address: "https://git.example.com/team/Members", displayName: "成员仓" })
    seedMember(app, project.id, "carol", "manage")
    seedMember(app, project.id, "dave", "manage")
    const owner = await api(app, "PATCH", `/api/projects/${project.id}`, { body: { owner: "dave" } })
    assert.equal(owner.status, 200, `指派负责人失败：${owner.text}`)

    const added = await as(app, "carol")("POST", `/api/projects/${project.id}/members`, { body: { username: "frank", level: "readwrite" } })
    assert.deepEqual([added.status, added.json.member], [200, { username: "frank", level: "readwrite", origin: "manual", syncedRole: null }], "manage 加人 ✓")
    const dup = await as(app, "carol")("POST", `/api/projects/${project.id}/members`, { body: { username: "FRANK", level: "read" } })
    assert.equal(dup.status, 400, "同名（不辨大小写）⇒ 400")
    const badLevel = await as(app, "carol")("POST", `/api/projects/${project.id}/members`, { body: { username: "gina", level: "root" } })
    assert.equal(badLevel.status, 400, "档位枚举外 ⇒ 400")
    const readAdd = await as(app, "alice") ("POST", `/api/projects/${project.id}/members`, { body: { username: "gina", level: "read" } })
    assert.deepEqual([readAdd.status, readAdd.json.error.code], [404, "not_found"], "非成员加人 ⇒ 404 不辨")
    seedMember(app, project.id, "alice", "read")
    const readAdd2 = await as(app, "alice")("POST", `/api/projects/${project.id}/members`, { body: { username: "gina", level: "read" } })
    assert.deepEqual([readAdd2.status, readAdd2.json.error.code], [403, "forbidden"], "只读档加人 ⇒ 403")

    const updated = await as(app, "carol")("PATCH", `/api/projects/${project.id}/members/frank`, { body: { level: "manage" } })
    assert.deepEqual([updated.status, updated.json.member.level], [200, "manage"], "改档 ✓")
    const missing = await as(app, "carol")("PATCH", `/api/projects/${project.id}/members/ghost`, { body: { level: "read" } })
    assert.equal(missing.status, 404, "改档目标不存在 ⇒ 404")
    const removed = await as(app, "carol")("DELETE", `/api/projects/${project.id}/members/frank`)
    assert.deepEqual([removed.status, removed.json], [200, { ok: true }], "移除 ✓")

    const demoteOwner = await as(app, "carol")("PATCH", `/api/projects/${project.id}/members/dave`, { body: { level: "read" } })
    assert.deepEqual([demoteOwner.status, demoteOwner.json.error.code], [403, "forbidden"], "负责人不可被非 admin 降档")
    const removeOwner = await as(app, "carol")("DELETE", `/api/projects/${project.id}/members/dave`)
    assert.equal(removeOwner.status, 403, "负责人不可被非 admin 移除")
    const adminDemote = await api(app, "PATCH", `/api/projects/${project.id}/members/dave`, { body: { level: "read" } })
    assert.deepEqual([adminDemote.status, adminDemote.json.member.level], [200, "read"], "admin 可动负责人档位")

    assert.deepEqual(
      [app.audits("member_add").map((row) => JSON.parse(row.detail)), app.audits("member_update").map((row) => JSON.parse(row.detail)), app.audits("member_remove").map((row) => JSON.parse(row.detail))],
      [
        [{ kind: "member_add", projectId: project.id, username: "frank", level: "readwrite" }],
        [
          { kind: "member_update", projectId: project.id, username: "frank", level: "manage" },
          { kind: "member_update", projectId: project.id, username: "dave", level: "read" },
        ],
        [{ kind: "member_remove", projectId: project.id, username: "frank", level: "manage" }],
      ],
      "三审计行 detail 键集逐值（失败动作零行）",
    )
  } finally {
    await app.close()
  }
})

test("N9 改项目三件：显示名（负责人 ✓ / 管理档 403）∥ 地址（非 admin 403 / admin ✓ / 撞 400）∥ 负责人（非 admin 403 / admin ✓）∥ 审计逐件", async () => {
  const app = await startApp()
  try {
    const project = await addProject(app, { address: "https://git.example.com/team/Edit", displayName: "原名" })
    const other = await addProject(app, { address: "https://git.example.com/team/Other", displayName: "他仓" })
    seedMember(app, project.id, "dave", "read")
    seedMember(app, project.id, "carol", "manage")
    assert.equal((await api(app, "PATCH", `/api/projects/${project.id}`, { body: { owner: "dave" } })).status, 200, "前置：指派负责人")

    const renamed = await as(app, "dave")("PATCH", `/api/projects/${project.id}`, { body: { displayName: "新名" } })
    assert.deepEqual([renamed.status, renamed.json.project.displayName], [200, "新名"], "负责人改显示名 ✓")
    const manageRename = await as(app, "carol")("PATCH", `/api/projects/${project.id}`, { body: { displayName: "管理档改名" } })
    assert.deepEqual([manageRename.status, manageRename.json.error.code], [403, "forbidden"], "管理档（非负责人）改名 ⇒ 403")
    const addressByOwner = await as(app, "dave")("PATCH", `/api/projects/${project.id}`, { body: { address: "https://git.example.com/team/Moved" } })
    assert.deepEqual([addressByOwner.status, addressByOwner.json.error.message], [403, "改仓地址仅管理员"], "负责人改地址 ⇒ 403（人话）")
    const addressByAdmin = await api(app, "PATCH", `/api/projects/${project.id}`, { body: { address: "ssh://git@git.example.com:2222/team/Moved.git" } })
    assert.deepEqual([addressByAdmin.status, addressByAdmin.json.project.address], [200, "git.example.com:2222/team/Moved"], "admin 改地址 ✓（归一跨形）")
    const addressSame = await api(app, "PATCH", `/api/projects/${project.id}`, { body: { address: "https://git.example.com:2222/team/Moved/" } })
    assert.deepEqual([addressSame.status, addressSame.json.project.address], [200, "git.example.com:2222/team/Moved"], "改回同一键 ⇒ 零改动（不算撞他仓）")
    const addressClash = await api(app, "PATCH", `/api/projects/${project.id}`, { body: { address: "git@git.example.com:team/Other" } })
    assert.deepEqual([addressClash.status, addressClash.json.error.code], [400, "invalid_request_error"], "撞他仓地址 ⇒ 400")
    const ownerByOwner = await as(app, "dave")("PATCH", `/api/projects/${project.id}`, { body: { owner: "carol" } })
    assert.deepEqual([ownerByOwner.status, ownerByOwner.json.error.code], [403, "forbidden"], "负责人自换 ⇒ 403")
    const ownerByAdmin = await api(app, "PATCH", `/api/projects/${project.id}`, { body: { owner: "carol" } })
    assert.deepEqual([ownerByAdmin.status, ownerByAdmin.json.project.owner], [200, "carol"], "admin 换负责人 ✓")
    const ownerGhost = await api(app, "PATCH", `/api/projects/${project.id}`, { body: { owner: "erin" } })
    assert.equal(ownerGhost.status, 400, "负责人非该项目成员 ⇒ 400")
    const twoKeys = await api(app, "PATCH", `/api/projects/${project.id}`, { body: { displayName: "x", owner: "dave" } })
    assert.equal(twoKeys.status, 400, "一次一件（双键 ⇒ 400）")
    assert.equal((await api(app, "PATCH", `/api/projects/${other.id}`, { body: { owner: "erin" } })).status, 400, "他仓造态（同上）")

    assert.deepEqual(
      app.audits("project_update").map((row) => JSON.parse(row.detail)),
      [
        { kind: "project_update", projectId: project.id, keys: ["owner"], values: { owner: "dave" } }, // 前置指派（setup 行）
        { kind: "project_update", projectId: project.id, keys: ["displayName"], values: { displayName: "新名" } },
        { kind: "project_update", projectId: project.id, keys: ["address"], values: { address: "git.example.com:2222/team/Moved" } },
        { kind: "project_update", projectId: project.id, keys: ["address"], values: { address: "git.example.com:2222/team/Moved" } }, // 改回同一键（零改动——仍计一行）
        { kind: "project_update", projectId: project.id, keys: ["owner"], values: { owner: "carol" } },
      ],
      "`project_update` 逐件审计（失败零行）",
    )
  } finally {
    await app.close()
  }
})

// ── 腿：N10（删源防护）∥ N22（项目删除）──────────────────────────────────────

test("N10 删源防护：挂项目 ⇒ 400「尚有 N 个项目挂此源」零删 ∥ 脱挂后可删", async () => {
  const app = await startApp()
  try {
    const source = await addSource(app, { name: "挂载源" })
    await api(app, "POST", "/api/admin/projects", { body: { sourceId: source.id, repos: [{ address: "https://github.com/acme/a.git" }, { address: "https://github.com/acme/b.git" }] } })
    const blocked = await api(app, "DELETE", `/api/admin/git-sources/${source.id}`)
    assert.deepEqual([blocked.status, blocked.json.error.message], [400, "尚有 2 个项目挂此源（先删项目再删源）"], "防护 400 人话含计数")
    assert.equal(app.sourceRows().length, 1, "零删")
    assert.equal(app.audits("source_delete").length, 0, "零审计")
    for (const row of app.projects()) {
      const res = await api(app, "DELETE", `/api/admin/projects/${row.id}`, { body: { confirm: true } })
      assert.equal(res.status, 200, `脱挂失败：${res.text}`)
    }
    assert.deepEqual([(await api(app, "DELETE", `/api/admin/git-sources/${source.id}`)).status, app.sourceRows().length], [200, 0], "脱挂后删源成")
  } finally {
    await app.close()
  }
})

test("N22 项目删除成链：admin + confirm ⇒ 200 ∥ 项目行删 + 成员行随删（零孤儿）∥ 审计逐值 ∥ 同地址可再挂", async () => {
  const app = await startApp()
  try {
    const project = await addProject(app, { address: "https://git.example.com/team/Doomed", displayName: "待删仓" })
    seedMember(app, project.id, "alice", "read")
    seedMember(app, project.id, "bob", "readwrite")
    const res = await api(app, "DELETE", `/api/admin/projects/${project.id}`, { body: { confirm: true } })
    assert.deepEqual([res.status, res.json], [200, { ok: true }], "删除成")
    assert.deepEqual(app.rows("SELECT * FROM projects WHERE id = ?", project.id), [], "项目行删")
    assert.deepEqual(app.rows("SELECT * FROM project_members WHERE project_id = ?", project.id), [], "成员行随删（零孤儿）")
    assert.deepEqual(
      app.audits("project_delete").map((row) => [row.actor_name, row.target_name, JSON.parse(row.detail)]),
      [["admin", `project:${project.id}`, { kind: "project_delete", projectId: project.id, displayName: "待删仓", address: "git.example.com/team/Doomed", memberCount: 2 }]],
      "`project_delete` 审计逐值",
    )
    const again = await api(app, "DELETE", `/api/admin/projects/${project.id}`, { body: { confirm: true } })
    assert.deepEqual([again.status, again.json.error.code], [404, "not_found"], "二次删 ⇒ 404（幂等零副作用）")
    const reAdd = await api(app, "POST", "/api/admin/projects", { body: { address: "git@git.example.com:team/Doomed.git" } })
    assert.deepEqual([reAdd.status, reAdd.json.projects[0].address], [200, "git.example.com/team/Doomed"], "同地址可再挂（新行——不设墓碑）")
  } finally {
    await app.close()
  }
})

// ── 腿：N18（鉴权门）∥ N19（搜索）∥ E1（形错零变）∥ E4（删除门）───────────────

test("N18 鉴权门：管理面三态（无会话 401 ∥ user 403 ∥ admin 200）∥ 成员面无会话 401", async () => {
  const app = await startApp()
  try {
    for (const [method, path] of [["GET", "/api/admin/git-sources"], ["POST", "/api/admin/projects"], ["DELETE", "/api/admin/git-sources/1"], ["GET", "/api/admin/git-sources/1/repos"]]) {
      const anon = await call(app.base, method, path, { body: method === "GET" ? undefined : {} })
      assert.deepEqual([method, path, anon.status, anon.json.error.code], [method, path, 401, "unauthorized"], "无会话 ⇒ 401")
      const user = await as(app, "alice")(method, path, { body: method === "GET" ? undefined : {} })
      assert.deepEqual([method, path, user.status, user.json.error.code], [method, path, 403, "forbidden"], "user ⇒ 403")
    }
    assert.equal((await api(app, "GET", "/api/admin/git-sources")).status, 200, "admin ⇒ 200")
    const anonList = await call(app.base, "GET", "/api/projects")
    assert.deepEqual([anonList.status, anonList.json.error.code], [401, "unauthorized"], "成员面无会话 ⇒ 401")
    const publicHook = await call(app.base, "POST", "/api/hooks/git-sources/999", { body: {} })
    assert.equal(publicHook.status, 404, "接收面公开（无会话可达——源不存在 404）")
  } finally {
    await app.close()
  }
})

test("N19 列表搜索：显示名/地址子串 ∥ 零命中 ⇒ 空数组（零错）∥ 非成员视角命中集 ⊆ 可见集", async () => {
  const app = await startApp()
  try {
    const p1 = await addProject(app, { address: "https://git.example.com/team/Alpha", displayName: "一仓 Alpha" })
    const p2 = await addProject(app, { address: "https://git.example.com/team/Beta", displayName: "二仓 Beta" })
    const p3 = await addProject(app, { address: "https://git.other.com/x/Gamma", displayName: "三仓 Gamma" })
    seedMember(app, p1.id, "alice", "read")
    seedMember(app, p3.id, "alice", "read")

    const byName = await as(app, "admin")("GET", "/api/projects?q=Alpha")
    assert.deepEqual(byName.json.projects.map((row) => row.id), [p1.id], "显示名子串")
    const byAddress = await as(app, "admin")("GET", "/api/projects?q=other.com")
    assert.deepEqual(byAddress.json.projects.map((row) => row.id), [p3.id], "地址子串")
    const noHit = await as(app, "admin")("GET", "/api/projects?q=zzz")
    assert.deepEqual([noHit.status, noHit.json.projects], [200, []], "零命中 ⇒ 空数组（零错）")
    const all = await as(app, "admin")("GET", "/api/projects")
    assert.deepEqual(all.json.projects.map((row) => row.id), [p1.id, p2.id, p3.id], "q 缺省 = 全量")

    const mine = await as(app, "alice")("GET", "/api/projects")
    assert.deepEqual(mine.json.projects.map((row) => row.id), [p1.id, p3.id], "成员可见集")
    const aliceHit = await as(app, "alice")("GET", "/api/projects?q=Beta")
    assert.deepEqual(aliceHit.json.projects, [], "命中集恒 ⊆ 可见集（不可见项目搜不到）")
    const aliceNameHit = await as(app, "alice")("GET", "/api/projects?q=Gamma")
    assert.deepEqual(aliceNameHit.json.projects.map((row) => row.id), [p3.id], "可见项可搜")
    const outsider = await as(app, "erin")("GET", "/api/projects?q=一仓")
    assert.deepEqual(outsider.json.projects, [], "非成员视角零出现")
  } finally {
    await app.close()
  }
})

test("E1 形错零变：源形/档位枚举/level/地址非法 ⇒ 400 ∥ 库零变", async () => {
  const app = await startApp()
  try {
    const source = await addSource(app, { name: "形错源" })
    const project = await addProject(app, { address: "https://git.example.com/team/Shape", displayName: "形仓" })
    seedMember(app, project.id, "carol", "manage")
    const before = { sources: app.sourceRows(), projects: app.projects(), members: app.memberRows(project.id), audits: app.auditCount() }

    const cases = [
      ["POST", "/api/admin/git-sources", { name: "  ", platform: "gitee", token: "t", scopeKind: "org" }, "空源名"],
      ["POST", "/api/admin/git-sources", { name: "x".repeat(41), platform: "gitee", token: "t", scopeKind: "org" }, "源名超长"],
      ["POST", "/api/admin/git-sources", { name: "无 Pat", platform: "gitee", token: "  ", scopeKind: "org" }, "PAT 空"],
      ["PATCH", `/api/admin/git-sources/${source.id}`, { syncMode: "scheduled" }, "同步方式枚举外"],
      ["POST", "/api/admin/projects", { address: "https://git.example.com/team/Shape" }, "撞地址"],
      ["POST", "/api/admin/projects", { address: "  " }, "空地址"],
      ["POST", "/api/admin/projects", { address: "https://git.example.com" }, "地址缺路径"],
      ["POST", `/api/projects/${project.id}/members`, { username: "a/b", level: "read" }, "用户名含斜杠"],
      ["POST", `/api/projects/${project.id}/members`, { username: "zoe", level: "admin" }, "档位枚举外"],
      ["PATCH", `/api/projects/${project.id}`, { displayName: "" }, "显示名空"],
      ["PATCH", `/api/projects/${project.id}`, { displayName: "x", address: "https://git.example.com/team/Y" }, "双键"],
    ]
    for (const [method, path, body, label] of cases) {
      const res = await api(app, method, path, { body })
      assert.equal(res.status, 400, `${label} ⇒ 400（实得 ${res.status}：${res.text}）`)
    }
    assert.deepEqual(
      { sources: app.sourceRows(), projects: app.projects(), members: app.memberRows(project.id), audits: app.auditCount() },
      before,
      "形错全径库零变",
    )
    const missingSource = await api(app, "PATCH", "/api/admin/git-sources/999", { body: { name: "x" } })
    assert.deepEqual([missingSource.status, missingSource.json.error.code], [404, "not_found"], "改源目标不存在 ⇒ 404（非 400——资源不存在语义）")
    const managerBad = await as(app, "carol")("POST", `/api/projects/${project.id}/members`, { body: { username: "zoe", level: "boss" } })
    assert.equal(managerBad.status, 400, "非 admin 径同判 400")
  } finally {
    await app.close()
  }
})

test("E4 删除门：缺 confirm ⇒ 400 人话 ∥ 非 admin ⇒ 403 ∥ 不存在 ⇒ 404 ∥ 零删", async () => {
  const app = await startApp()
  try {
    const project = await addProject(app, { address: "https://git.example.com/team/Gate", displayName: "门仓" })
    seedMember(app, project.id, "carol", "manage")
    const noConfirm = await api(app, "DELETE", `/api/admin/projects/${project.id}`, { body: {} })
    assert.deepEqual([noConfirm.status, noConfirm.json.error.message], [400, "删除将连同成员表一并移除——确认后重试"], "缺 confirm ⇒ 400 人话")
    const falseConfirm = await api(app, "DELETE", `/api/admin/projects/${project.id}`, { body: { confirm: "yes" } })
    assert.equal(falseConfirm.status, 400, "confirm 非真 ⇒ 400")
    const noBody = await call(app.base, "DELETE", `/api/admin/projects/${project.id}`, { cookie: app.adminCookie })
    assert.equal(noBody.status, 400, "无体 ⇒ 400（同人话面）")
    const nonAdmin = await as(app, "carol")("DELETE", `/api/admin/projects/${project.id}`, { body: { confirm: true } })
    assert.deepEqual([nonAdmin.status, nonAdmin.json.error.code], [403, "forbidden"], "非 admin ⇒ 403")
    const missing = await api(app, "DELETE", "/api/admin/projects/99999", { body: { confirm: true } })
    assert.deepEqual([missing.status, missing.json.error.code], [404, "not_found"], "不存在 ⇒ 404")
    assert.equal(app.projects().length, 1, "零删（库零变）")
    assert.equal(app.audits("project_delete").length, 0, "零审计")
  } finally {
    await app.close()
  }
})

// ── 腿：N23（凭据键路径单源）∥ B1（地址归一）∥ B2（用户名归一）──────────────

test("N23 凭据键路径单源：缺省 db ∥ 自定义 db 两形与 sandbox 现口径同址；两域共享同键（加解密往返）", () => {
  assert.equal(CRYPTO.credentialKeyPath({}), join("data", "credentials.key"), "缺省 db ⇒ data/credentials.key")
  assert.equal(CRYPTO.credentialKeyPath({ db: "gateway.db" }), join("data", "credentials.key"), "裸档名 ⇒ data/")
  const custom = join(TEMP, "nested", "gateway.db")
  assert.equal(CRYPTO.credentialKeyPath({ db: custom }), join(TEMP, "nested", "credentials.key"), "自定义 db ⇒ 同目录")
  for (const config of [{}, { db: custom }, { db: join(TEMP, "gw2.db") }]) {
    assert.equal(CRYPTO.credentialKeyPath(config), join(ONBOARDING.dataDir(config), "credentials.key"), "与 sandbox 现口径同址（逐字同值）")
  }
  const keyPath = CRYPTO.credentialKeyPath({ db: join(TEMP, "n23", "gateway.db") })
  const keyA = CRYPTO.loadOrCreateCredentialKey(keyPath)
  const keyB = ONBOARDING.loadOrCreateCredentialKey(keyPath)
  assert.deepEqual([...keyA], [...keyB], "同键文件 ⇒ 同键（两域共享）")
  const sealed = CRYPTO.encryptSecret("pat-value-1234", keyA)
  assert.equal(ONBOARDING.decryptSecret(sealed, keyB), "pat-value-1234", "project 加密 ⇒ sandbox 解密（同件单源）")
  assert.equal(sealed.includes("pat-value-1234"), false, "密文零明文")
  assert.deepEqual([...CRYPTO.encryptSecret("x", keyA).split("|").map((part) => part.length > 0)], [true, true, true], "包形 = iv|tag|ct 三段")
})

test("B1 地址归一：尾斜杠/`.git`/空白/跨形三组同键 ∥ 异 host/port/路径不同键", () => {
  const same = ["https://h/a/b", "https://h/a/b.git", "https://h/a/b/", " git@h:a/b ", "ssh://git@h/a/b"]
  const key = PROJECTS.normalizeAddress(same[0])
  assert.equal(key, "h/a/b", "规范形")
  for (const form of same) assert.equal(PROJECTS.normalizeAddress(form), key, `同键：${form}`)
  const others = ["https://h2/a/b", "https://h/a/b2", "https://h:8443/a/b", "git@other.host:group/repo", "ssh://git@h:22/a/b.git"]
  for (const form of others) assert.notEqual(PROJECTS.normalizeAddress(form), key, `不同键：${form}`)
  assert.equal(PROJECTS.normalizeAddress("https://h:2222/a/b"), "h:2222/a/b", "端口保留（https 形）")
  assert.throws(() => PROJECTS.normalizeAddress("https://h/"), /形非法/, "缺路径 ⇒ 拒")
  assert.throws(() => PROJECTS.normalizeAddress("a b/c"), /空白/, "空白 ⇒ 拒")
})

test("B2 用户名归一：`Alice` ⇄ `alice` 同一人（成员行唯一）", async () => {
  const app = await startApp()
  try {
    const project = await addProject(app, { address: "https://git.example.com/team/Case", displayName: "大小写仓" })
    seedMember(app, project.id, "carol", "manage")
    assert.equal((await as(app, "carol")("POST", `/api/projects/${project.id}/members`, { body: { username: "Alice", level: "read" } })).status, 200, "先加 Alice")
    const dup = await as(app, "carol")("POST", `/api/projects/${project.id}/members`, { body: { username: "alice", level: "manage" } })
    assert.equal(dup.status, 400, "小写同名 ⇒ 400（同人）")
    assert.deepEqual(app.memberRows(project.id).map((row) => row.username), ["carol", "Alice"], "成员行唯一（零双插）")
    const detail = await as(app, "alice")("GET", `/api/projects/${project.id}`)
    assert.deepEqual(detail.json.my.level, "read", "`Alice` 行对小写会话命中（不辨大小写）")
  } finally {
    await app.close()
  }
})
