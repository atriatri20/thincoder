/**
 * 2026-10-13-team-ledger.test.mjs — 批内单测件（`team-ledger` 批 · 台账 #1206）。
 * §A = 核工具面（`thincoder-core/team-ledger.mjs`——端侧 `team_ledger`）∥ §B = 服务端面（`thincoder-server/src/ledger/*`
 * + store v20 + 审计型）∥ §C = 控制台面断言（UI 席落——`thincoder-server/public/**` 面：页面渲染 ∥ i18n ∥ nav ∥ 审计面）。
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-team-ledger.test.mjs`
 *
 * 射程（判据源 = 批档 §2 ∥ `docs/server/design/ledger/LEDGER.md` §11 ∥ `docs/core/design/TEAM-LEDGER.md` §7 ∥
 * `docs/server/design/store/STORE.md` §3 v20 行 ∥ `docs/server/design/gateway/API.md` §2.10；腿 ↔ 用例在括号）：
 *   §A：N1（未登录 ⇒ 明示 + 零 fetch ∥ 本机账照常）∥ N2（仓派生原文上送——假 git 面）∥ N3（scope 缺省 repo /
 *   team ∥ 过滤参）∥ B1（无 git 源 ⇒ 明示 + 零请求）∥ B2（401 ⇒ 「登录已失效」）∥ B3（不可达 ⇒ 「服务器不可达」，
 *   重试零旧值）∥ E1（子代理只读变体——写三 schema 级不可达）∥ 守卫面（未知参数 / 缺必填 / 枚举外 / 类型错 ⇒ 零请求）
 *   ∥ 机检（零跨账 import ∥ 零写盘面）。
 *   §B：N2（端侧原文归一落行 + owner 缺省 = token 主体）∥ N3（行集过滤 ∥ 端侧面无 `repos[]`）∥ N4（全局编号不重）
 *   ∥ N5（零去重）∥ B2（能力矩阵三档：read 档写 403 ∥ 非成员零出现 + 直取 404 不辨）∥ B3（未登记仓 400）∥
 *   B6（归档再动 400）∥ B7（非法迁移 / 追认门 400）∥ B8（aged 31/30 边界）∥ E1（401/403/404 三态）∥ E4（审计四
 *   kind + surface）∥ v20 三读数 + 表/两索引/CHECK 十五型 ∥ KD-SV-147（项目删除不级联）∥ 机检（零跨账 import）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)
const SOURCE = (rel) => readFileSync(join(ROOT, rel), "utf8")

const DB = await load("thincoder-server/src/store/db.mjs")
const AUDIT = await load("thincoder-server/src/accounts/audit.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const KEYS = await load("thincoder-server/src/accounts/keys.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const LEDGER_ITEMS = await load("thincoder-server/src/ledger/items.mjs")
const LEDGER_ROUTES = await load("thincoder-server/src/ledger/routes.mjs")
const CLIENT_LEDGER_ROUTES = await load("thincoder-server/src/ledger/client-routes.mjs")

const CORE_CONFIG = await load("thincoder-core/config.mjs")
const TEAM_LEDGER = await load("thincoder-core/team-ledger.mjs")
const FAMILY = await load("thincoder-core/agent/family-tools.mjs")
const LEDGER_DB = await load("thincoder-core/ledger-db.mjs")
const LEDGER_CMD = await load("thincoder-core/ledger-cmd.mjs")

const PASSWORD = "password-123"
const TEMP = mkdtempSync(join(tmpdir(), "tc-team-ledger-"))
const STATUSES = ["待讨论", "待设计", "在途", "待核销", "已核销", "已废弃"]

/** 本机台账模块名（import 面机检——「零跨账代码路径」判据：本域文件零 import 这些件）。 */
const LOCAL_LEDGER_RE = /(?:^|\/)(?:ledger|ledger-db|ledger-cmd|ledger-tools|ledger-read|ledger-migrate|ledger-executors|ledger-surface|ledger-variant-notice)\.mjs$/

/** import 面抽取（`from "…"` ∥ `import("…")` 两形——机检素材）。 */
const importSpecs = (src) => [...src.matchAll(/(?:from|import)\s*\(?\s*["']([^"']+)["']/g)].map((match) => match[1])

// ── §A 夹具：假 fetch ∥ 假 git 面 ∥ 临时 config ───────────────────────────────

const REAL_FETCH = globalThis.fetch
let fetchCalls = []

/** 桩 fetch（零真网络——逐调用记账；出 = `{ ok, status, text }` 形）。 */
function stubFetch(handler) {
  fetchCalls = []
  globalThis.fetch = async (url, init) => {
    fetchCalls.push({ url, init })
    return handler(url, init)
  }
}

const restoreFetch = () => { globalThis.fetch = REAL_FETCH }
const jsonRes = (status, body) => ({ ok: status >= 200 && status < 300, status, text: async () => JSON.stringify(body) })

/** 临时 config（登录态注入面——`_setConfigPathForTest`）+ team 段。 */
function useTeamConfig({ server = "http://team.test", token = "sk-tc-test-token" } = {}) {
  const dir = mkdtempSync(join(TEMP, "cfg-"))
  const path = join(dir, "config.json")
  writeFileSync(path, JSON.stringify({ team: { server, member: { username: "alice", name: "Alice" }, label: "cli@test", token } }), "utf8")
  CORE_CONFIG._setConfigPathForTest(path)
  return path
}

/** 假 git 面（origin 原文——KD-SV-144「原文上送」判据素材）。 */
const fakeGit = (origin) => (_cwd, args) => (args[0] === "rev-parse" ? "/repo/root" : args.includes("remote.origin.url") ? origin : null)

const ctxOf = (cwd) => ({ agent: { cwd } })

// ── §B 夹具：进程内应用（网关 + 账号面 + 台账两面族） ────────────────────────

async function call(base, method, path, { body, cookie, token, headers = {} } = {}) {
  const finalHeaders = { "content-type": "application/json", ...headers }
  if (cookie) finalHeaders.cookie = cookie
  if (token) finalHeaders.authorization = `Bearer ${token}`
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

/** 加仓直插（前置态造用——B2 端点面已有专属单测；本批射程 = 台账面）。出 = 项目 id。 */
function seedProject(app, { address, displayName = null, owner = null, members = [] }) {
  const at = new Date().toISOString()
  const info = app.db
    .prepare("INSERT INTO projects (source_id, address, display_name, owner_username, created_by, created_at) VALUES (NULL, ?, ?, ?, NULL, ?)")
    .run(address, displayName ?? address.split("/").pop(), owner, at)
  const projectId = Number(info.lastInsertRowid)
  for (const [username, level] of members) {
    app.db
      .prepare("INSERT INTO project_members (project_id, username, level, origin, synced_role, created_at, updated_at) VALUES (?, ?, ?, 'manual', NULL, ?, ?)")
      .run(projectId, username, level, at, at)
  }
  return projectId
}

/** 进程内应用（沿 `bin` 装配序取台账两面族 + 账号面；四账号：admin ∥ alice ∥ bob ∥ carol）。 */
async function startApp() {
  const db = DB.openDatabase(":memory:")
  for (const [username, role] of [["admin", "admin"], ["alice", "user"], ["bob", "user"], ["carol", "user"]]) {
    await MEMBERS.createMember(db, { username, role, password: PASSWORD })
  }
  const members = {}
  for (const row of db.prepare("SELECT * FROM members").all()) members[row.username] = row
  const routes = SERVER.createRouteTable()
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(TEMP, "ledger.db") })
  LEDGER_ROUTES.registerLedgerRoutes(routes, { db })
  CLIENT_LEDGER_ROUTES.registerClientLedgerRoutes(routes, { db })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  const server = SERVER.createGatewayServer({ config, routes, log: null })
  await new Promise((resolve, reject) => {
    server.once("error", reject)
    server.listen(0, "127.0.0.1", resolve)
  })
  const base = `http://127.0.0.1:${server.address().port}`
  const cookies = {}
  for (const username of Object.keys(members)) {
    const res = await call(base, "POST", "/api/login", { body: { username, password: PASSWORD } })
    const line = (res.setCookies ?? []).find((item) => item.startsWith(`${SESSION.SESSION_COOKIE}=`))
    cookies[username] = line ? line.split(";")[0] : null
  }
  const tokens = {}
  for (const [username, row] of Object.entries(members)) tokens[username] = KEYS.issueKey(db, row.id, { name: `cli-${username}` }).plain
  return {
    db,
    base,
    members,
    cookies,
    tokens,
    /** 审计行（按 `ledger_event` detail.kind 筛）。 */
    audits: (kind = null) =>
      db
        .prepare("SELECT * FROM audit_events WHERE type = 'ledger_event' ORDER BY id")
        .all()
        .filter((row) => kind === null || JSON.parse(row.detail ?? "{}").kind === kind),
    rows: (id) => db.prepare("SELECT * FROM team_ledger_items WHERE id = ?").get(id),
    allRows: () => db.prepare("SELECT * FROM team_ledger_items ORDER BY id").all(),
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
      db.close()
    },
  }
}

/** 常用腿：端侧建（缺省 alice/token + 仓 A 原文）。 */
async function addViaClient(app, { repo = "git@git.example.com:org/repo.git", title = "一条", detail, owner, who = "alice" } = {}) {
  const res = await call(app.base, "POST", "/api/client/ledger", { token: app.tokens[who], body: { repo, title, detail, owner } })
  assert.equal(res.status, 200, `端侧建失败：${res.text}`)
  return res.json.item
}

// ═══════════════════════════════════════════════════════════════════════════
// §A 核工具面（TEAM-LEDGER.md §7）
// ═══════════════════════════════════════════════════════════════════════════

test("§A E1 工具面：depth-0 五 action ∥ 全部 depth>0 段只读变体（写三 schema 级不可达）∥ 描述单点在场", async () => {
  const depth0 = await FAMILY.assembleFamilyTools({ depth: 0 })
  const full = depth0.find((tool) => tool.name === "team_ledger")
  assert.ok(full, "depth-0 段含 team_ledger（核单源——三端零逐端改动）")
  assert.deepEqual(full.parameters.properties.action.enum, ["query", "count", "add", "update", "close"], "全量五 action")
  assert.equal(full.readonly, false)
  assert.equal(full.isReadonlyAction({ action: "query" }), true, "query 归只读类（planMode 放行 / 免审批）")
  assert.equal(full.isReadonlyAction({ action: "close" }), false)
  assert.ok(typeof full.description === "string" && full.description.includes("团队台账"), "描述 = tool-docs 单点（DESC 加载面）")
  for (const [role, batchDoc] of [["eng-coder", "docs/batches/x.md"], ["eng-designer", "docs/batches/x.md"], ["coder", "docs/batches/x.md"], ["consult", null], [null, null]]) {
    const seg = await FAMILY.assembleFamilyTools({ depth: 1, role, batchDoc })
    const read = seg.find((tool) => tool.name === "team_ledger")
    assert.ok(read, `子代理段（${role ?? "兜底"}）含 team_ledger 读变体`)
    assert.equal(read.readonly, true)
    assert.deepEqual(read.parameters.properties.action.enum, ["query", "count"], "只读二值（写三 action schema 级不可达）")
  }
  await assert.rejects(() => TEAM_LEDGER.teamLedgerReadTool.execute({ action: "add", title: "x" }), /action 非法/, "只读变体 execute 面拒写（schema 之外的机械兜底）")
})

test("§A N1 未登录：query / add ⇒ 明示「未登录」∥ 零网络调用 ∥ 本机账照常可用", async () => {
  const dir = mkdtempSync(join(TEMP, "nol-"))
  writeFileSync(join(dir, "config.json"), JSON.stringify({}), "utf8")
  CORE_CONFIG._setConfigPathForTest(join(dir, "config.json"))
  stubFetch(() => jsonRes(200, {}))
  try {
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "query" }, ctxOf(dir)), /未登录——团队账不可用（本机台账照常）/, "未登录 ⇒ 明示人话")
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "add", title: "x" }, ctxOf(dir)), /未登录/, "未登录 ⇒ add 同判")
    assert.equal(fetchCalls.length, 0, "未登录 ⇒ 零网络调用")
    // 本机账照常（两账独立——本机读面零涉团队面；空账 ⇒ 空集不抛）
    LEDGER_DB._setLedgerDirForTest(join(dir, "ledger-dir"))
    try {
      assert.deepEqual(LEDGER_CMD.ledgerQuery({ cwd: dir }), [], "本机账读面照常（未登录面零涉）")
    } finally {
      LEDGER_DB._resetLedgerDirForTest()
    }
  } finally {
    restoreFetch()
    CORE_CONFIG._resetConfigPathForTest()
  }
})

test("§A N2 仓派生：origin 原文上送（假 git 面）∥ 请求面（URL / method / Bearer）∥ 回显落行", async () => {
  const dir = mkdtempSync(join(TEMP, "repo-"))
  useTeamConfig({ server: "http://team.test", token: "sk-tc-fake-token" })
  TEAM_LEDGER._setGitRunnerForTest(fakeGit("git@host:org/repo.git"))
  stubFetch(() => jsonRes(200, { item: { id: 7, repo: "host/org/repo", status: "待讨论" } }))
  try {
    const out = await TEAM_LEDGER.teamLedgerTool.execute({ action: "add", title: "t", detail: "d", owner: "alice" }, ctxOf(dir))
    assert.equal(fetchCalls.length, 1, "恰一次请求")
    assert.equal(fetchCalls[0].url, "http://team.test/api/client/ledger")
    assert.equal(fetchCalls[0].init.method, "POST")
    assert.equal(fetchCalls[0].init.headers.authorization, "Bearer sk-tc-fake-token", "Bearer = team.token")
    assert.deepEqual(JSON.parse(fetchCalls[0].init.body), { repo: "git@host:org/repo.git", title: "t", detail: "d", owner: "alice" }, "repo = origin 原文（归一在服务端——端侧零归一实现）")
    assert.match(out, /"id": 7/, "回显落行")
  } finally {
    TEAM_LEDGER._setGitRunnerForTest(null)
    restoreFetch()
    CORE_CONFIG._resetConfigPathForTest()
  }
})

test("§A N3 query / count：缺省 scope ⇒ 派生当前仓；team ⇒ 不带 repo；过滤参透传；count ⇒ total", async () => {
  const dir = mkdtempSync(join(TEMP, "scope-"))
  useTeamConfig()
  TEAM_LEDGER._setGitRunnerForTest(fakeGit("https://git.example.com/org/repo"))
  stubFetch(() => jsonRes(200, { items: [{ id: 1, repo: "git.example.com/org/repo", status: "在途" }], total: 1 }))
  try {
    await TEAM_LEDGER.teamLedgerTool.execute({ action: "query" }, ctxOf(dir))
    assert.equal(fetchCalls[0].url, "http://team.test/api/client/ledger?repo=https%3A%2F%2Fgit.example.com%2Forg%2Frepo", "缺省 scope = 当前仓（派生原文）")
    assert.equal(fetchCalls[0].init.method, "GET")
    await TEAM_LEDGER.teamLedgerTool.execute({ action: "query", scope: "team", status: "在途", owner: "alice" }, ctxOf(dir))
    assert.equal(fetchCalls[1].url, "http://team.test/api/client/ledger?status=%E5%9C%A8%E9%80%94&owner=alice", "team ⇒ 不带 repo；过滤参透传")
    const counted = await TEAM_LEDGER.teamLedgerTool.execute({ action: "count", scope: "team" }, ctxOf(dir))
    assert.match(counted, /"count":1/, "count = 同参取 total")
  } finally {
    TEAM_LEDGER._setGitRunnerForTest(null)
    restoreFetch()
    CORE_CONFIG._resetConfigPathForTest()
  }
})

test("§A B1 无 git 源：非 git 仓 ∥ 无 origin ⇒ 明示失败 ∥ 零请求", async () => {
  const dir = mkdtempSync(join(TEMP, "nogit-"))
  useTeamConfig()
  stubFetch(() => jsonRes(200, {}))
  try {
    TEAM_LEDGER._setGitRunnerForTest((_cwd, args) => (args[0] === "rev-parse" ? null : "git@host:org/repo.git"))
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "add", title: "x" }, ctxOf(dir)), /未检出 git 源（origin）/)
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "query" }, ctxOf(dir)), /未检出 git 源（origin）/, "query 缺省 scope 同判")
    TEAM_LEDGER._setGitRunnerForTest((_cwd, args) => (args[0] === "rev-parse" ? "/repo/root" : null))
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "add", title: "x" }, ctxOf(dir)), /未检出 git 源（origin）/, "有仓无 origin 同判")
    assert.equal(fetchCalls.length, 0, "零请求零写库")
  } finally {
    TEAM_LEDGER._setGitRunnerForTest(null)
    restoreFetch()
    CORE_CONFIG._resetConfigPathForTest()
  }
})

test("§A B2/B3/E1 传输三态：401 ⇒ 「登录已失效」∥ 不可达 ⇒ 「服务器不可达」（重试零旧值）∥ 403/404 人话透传", async () => {
  const dir = mkdtempSync(join(TEMP, "trans-"))
  useTeamConfig()
  try {
    stubFetch(() => jsonRes(401, { error: { message: "无效的 API key" } }))
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "query", scope: "team" }, ctxOf(dir)), /登录已失效——请重新登录/, "401 ⇒ 失效出词")
    stubFetch(() => { throw new TypeError("fetch failed") })
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "query", scope: "team" }, ctxOf(dir)), /服务器不可达——团队账不可用（零离线缓存）/, "不可达 ⇒ 明示")
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "query", scope: "team" }, ctxOf(dir)), /服务器不可达/, "重试零旧值（零缓存回读）")
    stubFetch(() => jsonRes(403, { error: { message: "写团队账需项目读写权限（can.write）" } }))
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "close", id: 1, status: "已废弃" }, ctxOf(dir)), /can\.write/, "403 人话透传")
    stubFetch(() => jsonRes(404, { error: { message: "条目不存在或不可见" } }))
    await assert.rejects(() => TEAM_LEDGER.teamLedgerTool.execute({ action: "update", id: 9, title: "x" }, ctxOf(dir)), /条目不存在或不可见/, "404 人话透传")
  } finally {
    restoreFetch()
    CORE_CONFIG._resetConfigPathForTest()
  }
})

test("§A 守卫面：未知参数 ∥ 缺必填 ∥ 枚举外 ∥ 类型错 ⇒ 拒（判于网络前——零请求）", async () => {
  const dir = mkdtempSync(join(TEMP, "guard-"))
  useTeamConfig()
  stubFetch(() => jsonRes(200, {}))
  try {
    const tool = TEAM_LEDGER.teamLedgerTool
    await assert.rejects(() => tool.execute({ action: "add" }, ctxOf(dir)), /title 缺失（必填/)
    await assert.rejects(() => tool.execute({ action: "add", title: "x", repo: "a/b" }, ctxOf(dir)), /未知参数/, "无 repo 参数（零手挑仓——需求 ①）")
    await assert.rejects(() => tool.execute({ action: "query", status: "乱七八糟" }, ctxOf(dir)), /status 非法/)
    await assert.rejects(() => tool.execute({ action: "update", id: "1" }, ctxOf(dir)), /应为数字/)
    await assert.rejects(() => tool.execute({ action: "close", id: 1, status: "待设计" }, ctxOf(dir)), /status 非法/)
    await assert.rejects(() => tool.execute({ action: "关闭" }, ctxOf(dir)), /action 非法/)
    await assert.rejects(() => tool.execute({ action: "query", scope: "all" }, ctxOf(dir)), /scope 非法/)
    assert.equal(fetchCalls.length, 0, "零请求")
  } finally {
    restoreFetch()
    CORE_CONFIG._resetConfigPathForTest()
  }
})

test("§A 机检：team-ledger.mjs 零 import 本机台账模块（KD-SV-145/D-TL2）∥ 零写盘面（AC-32⑤）", () => {
  const src = SOURCE("thincoder-core/team-ledger.mjs")
  const specs = importSpecs(src)
  assert.ok(specs.length > 0, "import 面抽取非空")
  for (const spec of specs) assert.ok(!LOCAL_LEDGER_RE.test(spec), `零跨账 import：${spec}`)
  assert.ok(!/\b(writeFileSync|writeFile|appendFileSync|createWriteStream|mkdirSync|rmSync|unlinkSync)\b/.test(src), "工具面零写盘（无缓存文件 / 无落盘路径）")
  assert.ok(!/localStorage|sessionStorage|indexedDB|cacheFile/i.test(src), "零本地持久化面（无缓存 / 无浏览器存储）")
  assert.ok(!specs.some((spec) => spec === "node:fs" || spec.startsWith("node:fs/")), "零 fs import（写盘面结构不可达）")
  assert.ok(existsSync(join(ROOT, "thincoder-core/tool-docs/team_ledger.md")), "描述单点档在场（DESC 加载面）")
})

// ═══════════════════════════════════════════════════════════════════════════
// §B 服务端面（ledger/LEDGER.md §11 ∥ store/STORE.md §3 v20）
// ═══════════════════════════════════════════════════════════════════════════

test("§B N1 空库直落 v21（链尾）：版本读数 ∥ 十列 + 两索引 ∥ 审计 CHECK 十五型（ledger_event 可写）∥ 六态 CHECK", () => {
  const db = DB.openDatabase(":memory:")
  try {
    assert.equal(DB.SCHEMA_VERSION, 21, "链尾段号 21（gitee-namespace-kinds 批 v21 随正——本批落地段 = 20）")
    assert.equal(db.prepare("PRAGMA user_version").get().user_version, 21, "空库直落 21（链尾）")
    assert.deepEqual(
      db.prepare("PRAGMA table_info(team_ledger_items)").all().map((c) => c.name),
      ["id", "repo", "status", "title", "detail", "owner", "created_by", "created_at", "updated_at", "closed_at"],
      "十列",
    )
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'").all().map((r) => r.name)
    for (const name of ["idx_team_ledger_repo_status", "idx_team_ledger_owner", "idx_audit_ts", "idx_audit_type_ts"]) {
      assert.ok(indexes.includes(name), `索引在场：${name}`)
    }
    assert.equal(AUDIT.AUDIT_TYPES.length, 15, "审计型面十五")
    assert.ok(AUDIT.AUDIT_TYPES.includes("ledger_event"))
    assert.ok(AUDIT.recordAudit(db, { type: "ledger_event", actor: "t", target: "ledger:1", detail: { kind: "create" } }) > 0, "`ledger_event` 可写（CHECK 放行）")
    assert.throws(() => AUDIT.recordAudit(db, { type: "no_such_type", actor: "t" }), /审计类型非法/, "表外型 ⇒ 拒（应用层目录）")
    const rawInsert = (type) => db.prepare("INSERT INTO audit_events (ts, type, actor_name, detail) VALUES (1, ?, 't', '{}')").run(type)
    assert.ok(Number(rawInsert("ledger_event").lastInsertRowid) > 0, "CHECK 直插放行（五型 + ledger_event）")
    assert.throws(() => rawInsert("no_such_type"), /CHECK/, "CHECK 直插拒（表级枚举——防目录与 DDL 漂移）")
    const insert = (status) => db.prepare("INSERT INTO team_ledger_items (repo, status, title, owner, created_by, created_at) VALUES ('host/org/repo', ?, 't', 'alice', 'alice', '2026-10-13T00:00:00.000Z')").run(status)
    for (const status of STATUSES) insert(status) // 六态放行
    assert.throws(() => insert("乱七八糟"), /CHECK/, "枚举外 ⇒ CHECK 拒")
  } finally {
    db.close()
  }
})

test("§B N2 v19 库升 21（链尾）：读数 / 幂等（再开零变）∥ 存量审计行逐值保形 ∥ 索引重建 ∥ 新 id 不撞存量", () => {
  const db = DB.openDatabase(":memory:", { migrations: DB.MIGRATIONS.slice(0, 19) })
  try {
    assert.equal(db.prepare("PRAGMA user_version").get().user_version, 19, "前置：v19")
    const first = AUDIT.recordAudit(db, { type: "project_event", actor: "admin", actorId: 1, target: "project:1", detail: { kind: "project_add" }, ts: 1700000000000 })
    const snapshot = db.prepare("SELECT * FROM audit_events ORDER BY id").all()
    assert.equal(DB.migrate(db), 21, "升后读数 21（链尾）")
    assert.equal(db.prepare("PRAGMA user_version").get().user_version, 21, "持久读数 21（链尾）")
    assert.deepEqual(db.prepare("SELECT * FROM audit_events ORDER BY id").all(), snapshot, "存量审计行逐值保形")
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type = 'index'").all().map((r) => r.name)
    for (const name of ["idx_audit_ts", "idx_audit_type_ts"]) assert.ok(indexes.includes(name), `重建后索引在场：${name}`)
    const fresh = AUDIT.recordAudit(db, { type: "ledger_event", actor: "alice", target: "ledger:1", detail: { kind: "create" } })
    assert.ok(fresh > first, "新行 id 不撞存量（sqlite_sequence 连续）")
    const version = db.prepare("PRAGMA user_version").get().user_version
    const count = db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n
    DB.migrate(db)
    assert.deepEqual(
      [db.prepare("PRAGMA user_version").get().user_version, db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n],
      [version, count],
      "再升零变（幂等）",
    )
  } finally {
    db.close()
  }
})

test("§B N2 端侧建一条：`repo` 原文归一（`git@host:org/repo.git` ⇒ `host/org/repo`）∥ 落行四值 ∥ 审计 surface=client", async () => {
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/repo", owner: "alice", members: [["alice", "readwrite"]] })
    const res = await call(app.base, "POST", "/api/client/ledger", { token: app.tokens.alice, body: { repo: "git@git.example.com:org/repo.git", title: "端侧一条" } })
    assert.equal(res.status, 200, res.text)
    const item = res.json.item
    assert.equal(item.repo, "git.example.com/org/repo", "服务端归一（端侧零归一实现）")
    assert.equal(item.status, "待讨论", "首态固定")
    assert.equal(item.owner, "alice", "owner 缺省 = token 主体")
    assert.equal(item.createdBy, "alice", "created_by = 服务端填")
    assert.equal(item.aged, false)
    assert.equal(item.canWrite, true)
    assert.deepEqual(Object.keys(item).sort(), ["aged", "canWrite", "closedAt", "createdAt", "createdBy", "detail", "id", "owner", "repo", "status", "title", "updatedAt"].sort(), "行形十二件（零 repoName）")
    const audits = app.audits("create")
    assert.equal(audits.length, 1)
    assert.equal(audits[0].actor_name, "alice", "actor = 名快照")
    assert.equal(audits[0].target_name, `ledger:${item.id}`, "target = ledger:<id> 可读形")
    assert.deepEqual(JSON.parse(audits[0].detail), { kind: "create", id: item.id, repo: "git.example.com/org/repo", surface: "client" })
  } finally {
    await app.close()
  }
})

test("§B N4/N5 全局编号不重（跨仓两建）∥ 零去重（同题两条皆落）∥ 零门槛（无审批面）", async () => {
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"]] })
    seedProject(app, { address: "gitee.com/org/b", owner: "bob", members: [["bob", "readwrite"]] })
    const one = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "仓 A 一条" })
    const two = await addViaClient(app, { repo: "git@gitee.com:org/b.git", title: "仓 B 一条", who: "bob" })
    assert.notEqual(one.id, two.id, "跨仓两建 ⇒ 编号不复用（全局一号空间）")
    assert.deepEqual([one.repo, two.repo], ["git.example.com/org/a", "gitee.com/org/b"], "各归各仓")
    const dup1 = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "同题" })
    const dup2 = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "同题" })
    assert.notEqual(dup1.id, dup2.id, "同题两条皆落（零去重拦截——需求 ②）")
    assert.equal(app.allRows().length, 4)
  } finally {
    await app.close()
  }
})

test("§B N3 行集与三筛：控制台 `repos[]`（可见项目 + canWrite）∥ 端侧面无 `repos[]` ∥ repo/status/owner 过滤 ∥ 枚举外 400", async () => {
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"], ["carol", "read"]] })
    seedProject(app, { address: "git.example.com/org/b", owner: "bob", members: [["bob", "readwrite"]] })
    const a1 = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "A1" })
    await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "A2", owner: "carol" })
    await addViaClient(app, { repo: "git@git.example.com:org/b.git", title: "B1", who: "bob" })
    const list = await call(app.base, "GET", "/api/ledger", { cookie: app.cookies.alice })
    assert.equal(list.status, 200, list.text)
    assert.equal(list.json.total, 2, "alice 可见 = 仓 A 两条（仓 B 非成员零出现）")
    assert.deepEqual(list.json.repos, [{ address: "git.example.com/org/a", displayName: "a", canWrite: true }], "repos[] = 可见项目 + 写权读数（非成员零出现）")
    assert.equal(list.json.items[0].canWrite, true)
    const carolList = await call(app.base, "GET", "/api/ledger", { cookie: app.cookies.carol })
    assert.deepEqual(carolList.json.repos, [{ address: "git.example.com/org/a", displayName: "a", canWrite: false }], "read 档：可见、写权读数 false（渲法源区分）")
    const byRepo = await call(app.base, "GET", "/api/ledger?repo=git%40git.example.com%3Aorg%2Fa.git", { cookie: app.cookies.alice })
    assert.equal(byRepo.json.total, 2, "repo 原文再归一后精确匹配")
    const byStatus = await call(app.base, "GET", "/api/ledger?status=%E5%BE%85%E8%AE%A8%E8%AE%BA", { cookie: app.cookies.alice })
    assert.equal(byStatus.json.total, 2, "status 过滤")
    const byOwner = await call(app.base, "GET", "/api/ledger?owner=carol", { cookie: app.cookies.alice })
    assert.equal(byOwner.json.total, 1, "owner 精确匹配")
    assert.equal(byOwner.json.items[0].id, a1.id + 1)
    const bad = await call(app.base, "GET", "/api/ledger?status=%E4%B9%B1%E4%B8%83%E5%85%AB%E7%B3%9F", { cookie: app.cookies.alice })
    assert.equal(bad.status, 400, "status 枚举外 ⇒ 400")
    const clientList = await call(app.base, "GET", "/api/client/ledger", { token: app.tokens.bob })
    assert.equal(clientList.status, 200, clientList.text)
    assert.equal(clientList.json.repos, undefined, "端侧面无 repos[]（仓标记自动派生）")
    assert.deepEqual(clientList.json.items.map((row) => row.id), [a1.id + 2], "端侧面行集同形（bob 只见仓 B）")
    assert.equal(clientList.json.total, 1)
    const clientFiltered = await call(app.base, "GET", "/api/client/ledger?repo=git%40git.example.com%3Aorg%2Fb.git", { token: app.tokens.bob })
    assert.equal(clientFiltered.json.total, 1, "端侧 repo 原文过滤（服务端归一）")
  } finally {
    await app.close()
  }
})

test("§B B2/B4/B5 能力矩阵三档：read 档写 ⇒ 403（读面在）∥ 非成员 ⇒ 列表零出现 + 直取 404 不辨 ∥ admin 全量", async () => {
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"], ["carol", "read"]] })
    seedProject(app, { address: "git.example.com/org/secret", owner: "bob", members: [["bob", "readwrite"]] })
    const item = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "A1" })
    const hidden = await addViaClient(app, { repo: "git@git.example.com:org/secret.git", title: "机密", who: "bob" })
    // carol（read 档）：读面在 ∥ 写三动作 403
    const readList = await call(app.base, "GET", "/api/ledger", { cookie: app.cookies.carol })
    assert.equal(readList.json.total, 1, "读面在（can.view 真）")
    assert.equal(readList.json.items[0].canWrite, false, "行级 canWrite = false")
    const patch = await call(app.base, "PATCH", `/api/ledger/${item.id}`, { cookie: app.cookies.carol, body: { title: "改" } })
    assert.equal(patch.status, 403, `read 档改 ⇒ 403：${patch.text}`)
    assert.match(patch.json.error.message, /can\.write/)
    const closed = await call(app.base, "POST", `/api/ledger/${item.id}/close`, { cookie: app.cookies.carol, body: { status: "已废弃" } })
    assert.equal(closed.status, 403, "read 档收口 ⇒ 403")
    const created = await call(app.base, "POST", "/api/ledger", { cookie: app.cookies.carol, body: { repo: "git.example.com/org/a", title: "x" } })
    assert.equal(created.status, 403, "read 档新建 ⇒ 403")
    assert.equal(app.rows(item.id).title, "A1", "403 库零变")
    // 建面三态（父裁 2026-10-13——仓不存 400 ∥ 仓存无 view 404 不辨 ∥ 可见无写权 403）
    const unregistered = await call(app.base, "POST", "/api/ledger", { cookie: app.cookies.carol, body: { repo: "git.example.com/org/未登记", title: "x" } })
    assert.equal(unregistered.status, 400, "仓不存 ⇒ 400 人话")
    const noView = await call(app.base, "POST", "/api/ledger", { cookie: app.cookies.carol, body: { repo: "git.example.com/org/secret", title: "探存在性" } })
    assert.equal(noView.status, 404, `仓存而无 can.view ⇒ 404 不辨：${noView.text}`)
    assert.equal(noView.json.error.message, "项目不存在或不可见", "措辞同 B2 项目面（不探存在性——KD-SV-143）")
    const noViewClient = await call(app.base, "POST", "/api/client/ledger", { token: app.tokens.carol, body: { repo: "git@git.example.com:org/secret.git", title: "探存在性" } })
    assert.equal(noViewClient.status, 404, "端侧同判（同一域模块）")
    assert.equal(noViewClient.json.error.message, noView.json.error.message, "两面同措辞")
    assert.equal(app.allRows().length, 2, "404 零落库（两仓各一条）")
    // carol 对仓 secret：列表零出现 + 直取 404 不辨
    assert.ok(!readList.json.items.some((row) => row.id === hidden.id), "非成员列表零出现")
    const direct = await call(app.base, "GET", "/api/ledger", { cookie: app.cookies.carol })
    assert.ok(!direct.json.items.some((row) => row.repo === "git.example.com/org/secret"))
    const take = await call(app.base, "PATCH", `/api/ledger/${hidden.id}`, { cookie: app.cookies.carol, body: { title: "偷看" } })
    assert.equal(take.status, 404, "直取 ⇒ 404 不辨")
    assert.equal(take.json.error.message, "条目不存在或不可见", "与「不存在」同措辞")
    const missing = await call(app.base, "PATCH", "/api/ledger/99999", { cookie: app.cookies.carol, body: { title: "x" } })
    assert.equal(missing.status, 404)
    assert.equal(missing.json.error.message, take.json.error.message, "两态不辨（措辞逐一相同）")
    // admin 全量
    const adminList = await call(app.base, "GET", "/api/ledger", { cookie: app.cookies.admin })
    assert.equal(adminList.json.total, 2, "admin ⇒ 全量")
    assert.deepEqual(adminList.json.repos.map((row) => row.address), ["git.example.com/org/a", "git.example.com/org/secret"])
    assert.ok(adminList.json.repos.every((row) => row.canWrite === true), "admin 写权读数全真")
  } finally {
    await app.close()
  }
})

test("§B B3 未登记仓：add ⇒ 400 人话 ∥ 零落库（控制台 ∥ 端侧两面同判）", async () => {
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"]] })
    const viaClient = await call(app.base, "POST", "/api/client/ledger", { token: app.tokens.alice, body: { repo: "git@git.example.com:org/未登记.git", title: "x" } })
    assert.equal(viaClient.status, 400, viaClient.text)
    assert.match(viaClient.json.error.message, /该仓未登记——请先在控制台登记项目/)
    const viaConsole = await call(app.base, "POST", "/api/ledger", { cookie: app.cookies.alice, body: { repo: "git.example.com/org/未登记", title: "x" } })
    assert.equal(viaConsole.status, 400)
    assert.equal(app.allRows().length, 0, "零落库")
    assert.equal(app.audits().length, 0, "零审计行")
  } finally {
    await app.close()
  }
})

test("§B B6/B7 状态机：迁移表非法 400 ∥ 追认核销须正文 400 ∥ 勾销链全绿 ∥ 归档再动 400（库零变）", async () => {
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"]] })
    const bare = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "无正文" })
    const closeNoDetail = await call(app.base, "POST", `/api/ledger/${bare.id}/close`, { cookie: app.cookies.alice, body: { status: "已核销" } })
    assert.equal(closeNoDetail.status, 400, closeNoDetail.text)
    assert.match(closeNoDetail.json.error.message, /追认核销须正文/)
    const skip = await call(app.base, "PATCH", `/api/ledger/${bare.id}`, { cookie: app.cookies.alice, body: { status: "已核销" } })
    assert.equal(skip.status, 400, "待讨论 ⇒ 已核销 非法迁移 ⇒ 400")
    assert.match(skip.json.error.message, /非法状态迁移/)
    const jump = await call(app.base, "PATCH", `/api/ledger/${bare.id}`, { cookie: app.cookies.alice, body: { status: "在途" } })
    assert.equal(jump.status, 400, "待讨论 ⇒ 在途 非法迁移 ⇒ 400")
    assert.equal(app.rows(bare.id).status, "待讨论", "库零变")
    // 勾销链：待讨论 → 待设计（携正文）→ 在途 →〔在途 ⇒ 已核销 不可跳〕→ 待核销 → 已核销
    const toDesign = await call(app.base, "PATCH", `/api/ledger/${bare.id}`, { cookie: app.cookies.alice, body: { status: "待设计", detail: "推进中" } })
    assert.equal(toDesign.status, 200, toDesign.text)
    const toFlight = await call(app.base, "PATCH", `/api/ledger/${bare.id}`, { cookie: app.cookies.alice, body: { status: "在途", detail: "推进中" } })
    assert.equal(toFlight.status, 200, toFlight.text)
    const inFlight = await call(app.base, "POST", `/api/ledger/${bare.id}/close`, { cookie: app.cookies.alice, body: { status: "已核销" } })
    assert.equal(inFlight.status, 400, "在途 ⇒ 已核销 不可跳")
    assert.match(inFlight.json.error.message, /在途须先过 待核销/)
    const queued = await call(app.base, "PATCH", `/api/ledger/${bare.id}`, { cookie: app.cookies.alice, body: { status: "待核销", detail: "推进中" } })
    assert.equal(queued.status, 200, queued.text)
    const done = await call(app.base, "POST", `/api/ledger/${bare.id}/close`, { cookie: app.cookies.alice, body: { status: "已核销" } })
    assert.equal(done.status, 200, done.text)
    assert.equal(done.json.item.status, "已核销")
    assert.ok(done.json.item.closedAt !== null, "closed_at 落")
    const again = await call(app.base, "PATCH", `/api/ledger/${bare.id}`, { cookie: app.cookies.alice, body: { title: "改" } })
    assert.equal(again.status, 400, "归档再动 ⇒ 400")
    assert.match(again.json.error.message, /已归档/)
    const reactivate = await call(app.base, "POST", `/api/ledger/${bare.id}/close`, { cookie: app.cookies.alice, body: { status: "已废弃" } })
    assert.equal(reactivate.status, 400, "归档再动（close）⇒ 400")
    // 撤回 = 任意未归档态；仓不可改
    const withdraw = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "撤回我" })
    const repoSwap = await call(app.base, "PATCH", `/api/ledger/${withdraw.id}`, { cookie: app.cookies.alice, body: { repo: "git.example.com/org/a" } })
    assert.equal(repoSwap.status, 400, "仓不可改（记账键）")
    assert.match(repoSwap.json.error.message, /仓不可改/)
    const gone = await call(app.base, "POST", `/api/ledger/${withdraw.id}/close`, { cookie: app.cookies.alice, body: { status: "已废弃" } })
    assert.equal(gone.status, 200)
    assert.equal(gone.json.item.status, "已废弃")
    assert.equal(app.rows(withdraw.id).closed_at !== null, true, "行保留（软删除）")
  } finally {
    await app.close()
  }
})

test("§B B8 老化：未决 31 天 ⇒ true ∥ 30 天整 / 缺时间戳 / 不可解析 / 归档态 ⇒ false ∥ HTTP 面 aged 读数", async () => {
  const base = Date.parse("2026-10-13T00:00:00.000Z")
  const iso = (ms) => new Date(ms).toISOString()
  assert.equal(LEDGER_ITEMS.agedOf("在途", null, iso(base - 31 * 86400000), base), true, "31 天 ⇒ 老化")
  assert.equal(LEDGER_ITEMS.agedOf("在途", null, iso(base - 30 * 86400000), base), false, "30 天整 ⇒ 未老化（阈值边界）")
  assert.equal(LEDGER_ITEMS.agedOf("在途", iso(base - 31 * 86400000), iso(base), base), true, "行龄源 = updated_at ?? created_at")
  assert.equal(LEDGER_ITEMS.agedOf("在途", null, null, base), false, "时间戳缺 ⇒ false（零假阳）")
  assert.equal(LEDGER_ITEMS.agedOf("在途", null, "不是时间", base), false, "不可解析 ⇒ false")
  for (const status of ["已核销", "已废弃"]) assert.equal(LEDGER_ITEMS.agedOf(status, null, iso(base - 31 * 86400000), base), false, `归档态（${status}）恒 false`)
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"]] })
    const row = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "老条" })
    app.db.prepare("UPDATE team_ledger_items SET created_at = ?, updated_at = NULL WHERE id = ?").run(new Date(Date.now() - 31 * 86400000).toISOString(), row.id)
    const list = await call(app.base, "GET", "/api/ledger", { cookie: app.cookies.alice })
    assert.equal(list.json.items[0].aged, true, "HTTP 面 aged 读数（31 天行）")
  } finally {
    await app.close()
  }
})

test("§B E1 三态：端侧无 token ⇒ 401 invalid_api_key ∥ 控制台无会话 ⇒ 401 unauthorized ∥ 403/404 双态在场", async () => {
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"]] })
    const noToken = await call(app.base, "GET", "/api/client/ledger")
    assert.equal(noToken.status, 401, noToken.text)
    assert.equal(noToken.json.error.code, "invalid_api_key", "无 token（三态不区分）")
    const badToken = await call(app.base, "GET", "/api/client/ledger", { token: "sk-tc-nope" })
    assert.equal(badToken.status, 401)
    assert.equal(badToken.json.error.code, "invalid_api_key")
    const noSession = await call(app.base, "GET", "/api/ledger")
    assert.equal(noSession.status, 401)
    assert.equal(noSession.json.error.code, "unauthorized", "无会话 ⇒ unauthorized")
  } finally {
    await app.close()
  }
})

test("§B E4 审计：四 kind 各一（create / edit / close / withdraw）∥ surface 分列 ∥ 载 id / repo", async () => {
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"]] })
    const one = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "四动作", detail: "正文在" })
    await call(app.base, "PATCH", `/api/ledger/${one.id}`, { cookie: app.cookies.alice, body: { title: "改名" } })
    await call(app.base, "POST", `/api/ledger/${one.id}/close`, { cookie: app.cookies.alice, body: { status: "已核销" } })
    const two = await call(app.base, "POST", "/api/ledger", { cookie: app.cookies.alice, body: { repo: "git.example.com/org/a", title: "走控制台" } })
    assert.equal(two.status, 200, two.text)
    await call(app.base, "POST", `/api/ledger/${two.json.item.id}/close`, { cookie: app.cookies.alice, body: { status: "已废弃" } })
    const kinds = app.audits().map((row) => JSON.parse(row.detail).kind)
    assert.deepEqual(kinds, ["create", "edit", "close", "create", "withdraw"], "四 kind 各一（close / withdraw 分记）")
    const surfaces = app.audits().map((row) => JSON.parse(row.detail).surface)
    assert.deepEqual(surfaces, ["client", "console", "console", "console", "console"], "surface = console ∥ client（两面写入可辨）")
    for (const row of app.audits()) {
      const detail = JSON.parse(row.detail)
      assert.equal(row.type, "ledger_event")
      assert.equal(typeof detail.id, "number", "detail 载 id")
      assert.equal(detail.repo, "git.example.com/org/a", "detail 载 repo（归地址）")
      assert.equal(row.target_name, `ledger:${detail.id}`)
      assert.equal(row.actor_name, "alice")
      assert.equal(row.actor_id, app.members.alice.id)
    }
    const edit = app.audits("edit")[0]
    assert.equal(edit.target_name, `ledger:${one.id}`)
  } finally {
    await app.close()
  }
})

test("§B/A E2/E3 两账互不影响：上送后改本机条 ⇒ 团队行零变 ∥ 改/撤团队条 ⇒ 本机行零变（两账各自独立演进）", async () => {
  const dir = mkdtempSync(join(TEMP, "twobook-"))
  LEDGER_DB._setLedgerDirForTest(join(dir, "ledger-dir"))
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"]] })
    // 本机账（键 = 本地目录——未登录照旧）
    assert.deepEqual(LEDGER_CMD.ledgerQuery({ cwd: dir }), [], "本机账起手空")
    const localId = LEDGER_CMD.ledgerAdd({ cwd: dir, row: { kind: "tech_todo", title: "本机一条" } })
    // 上送 = agent 两步显式动作（读本机 ⇒ 写团队）——本用例只验结构：两账各自独立演进
    const team = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "本机一条" })
    const teamSnapshot = app.rows(team.id)
    LEDGER_CMD.ledgerUpdate({ cwd: dir, id: localId, patch: { title: "本机改名" } })
    assert.deepEqual(app.rows(team.id), teamSnapshot, "E2：上送后改本机条 ⇒ 团队行逐值零变（零回写）")
    const localSnapshot = LEDGER_CMD.ledgerQuery({ cwd: dir })
    await call(app.base, "PATCH", `/api/ledger/${team.id}`, { cookie: app.cookies.alice, body: { title: "团队改名" } })
    await call(app.base, "POST", `/api/ledger/${team.id}/close`, { cookie: app.cookies.alice, body: { status: "已废弃" } })
    assert.deepEqual(LEDGER_CMD.ledgerQuery({ cwd: dir }), localSnapshot, "E3：改 / 撤团队条 ⇒ 本机行逐值零变")
    assert.equal(LEDGER_CMD.ledgerQuery({ cwd: dir }).length, 1, "本机账照常可用（两账独立）")
  } finally {
    await app.close()
    LEDGER_DB._resetLedgerDirForTest()
  }
})

test("§B KD-SV-147 项目删除不级联：账保留 ∥ admin 恒可见 ∥ 非成员自然收敛（不可见）", async () => {
  const app = await startApp()
  try {
    seedProject(app, { address: "git.example.com/org/a", owner: "alice", members: [["alice", "readwrite"]] })
    const row = await addViaClient(app, { repo: "git@git.example.com:org/a.git", title: "留账" })
    app.db.prepare("DELETE FROM projects WHERE address = ?").run("git.example.com/org/a")
    assert.equal(app.rows(row.id) !== undefined, true, "账保留（零级联删）")
    const adminList = await call(app.base, "GET", "/api/ledger", { cookie: app.cookies.admin })
    assert.deepEqual(adminList.json.items.map((item) => item.id), [row.id], "admin 恒可见")
    const aliceList = await call(app.base, "GET", "/api/ledger", { cookie: app.cookies.alice })
    assert.equal(aliceList.json.total, 0, "无项目行 ⇒ 非 admin 不可判（零出现）")
    assert.deepEqual(aliceList.json.repos, [], "repos[] 随项目行收敛")
    const direct = await call(app.base, "PATCH", `/api/ledger/${row.id}`, { cookie: app.cookies.alice, body: { title: "x" } })
    assert.equal(direct.status, 404, "直取 ⇒ 404 不辨")
  } finally {
    await app.close()
  }
})

test("§B 机检：ledger 域三档 import 面零跨账（本域文件零 import 本机台账模块）", () => {
  for (const rel of ["thincoder-server/src/ledger/items.mjs", "thincoder-server/src/ledger/routes.mjs", "thincoder-server/src/ledger/client-routes.mjs"]) {
    const src = SOURCE(rel)
    const specs = importSpecs(src)
    assert.ok(specs.length > 0, `${rel} import 面抽取非空`)
    for (const spec of specs) assert.ok(!LOCAL_LEDGER_RE.test(spec), `${rel} 零跨账 import：${spec}`)
  }
  assert.ok(LEDGER_ITEMS.ALLOWED_MIGRATIONS["待讨论"].join(",") === "待设计,已废弃", "迁移表沿本机台账逐字（语汇同源、存储独立）")
  assert.deepEqual(LEDGER_ITEMS.STATUSES, STATUSES, "六态同集")
})

// ═══════════════════════════════════════════════════════════════════════════
// §C 控制台面断言（页面渲染 / i18n / nav——UI 席追加）
// ═══════════════════════════════════════════════════════════════════════════

// ── §C 夹具（DOM 桩 + 渲染上下文——沿 `2026-10-12-team-projects-permissions-ui.test.mjs` 同法） ──

const PUBLIC_DIR = join(ROOT, "thincoder-server", "public")
const readPublic = (name) => readFileSync(join(PUBLIC_DIR, name), "utf8")
const linesOf = (name) => { const text = readPublic(name); return text.split("\n").length - (text.endsWith("\n") ? 1 : 0) }
const loadPublic = (name) => import(pathToFileURL(join(PUBLIC_DIR, name)).href)

/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」「…」等中性标点不在内）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/

/** 剥注释（字符串态感知——沿既有 UI 单测档同法；「注释外零 CJK」判据取此）。 */
function stripComments(src) {
  let out = ""
  let mode = "code"
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i]
    const next = src[i + 1]
    if (mode === "code") {
      if (ch === "/" && next === "/") { mode = "line"; i += 1; continue }
      if (ch === "/" && next === "*") { mode = "block"; i += 1; continue }
      if (ch === '"') mode = "dq"
      else if (ch === "'") mode = "sq"
      else if (ch === "`") mode = "tq"
      out += ch
    } else if (mode === "line") {
      if (ch === "\n") { mode = "code"; out += ch }
    } else if (mode === "block") {
      if (ch === "*" && next === "/") { mode = "code"; i += 1 }
    } else {
      out += ch
      if (ch === "\\") { out += next ?? ""; i += 1 }
      else if ((mode === "dq" && ch === '"') || (mode === "sq" && ch === "'") || (mode === "tq" && ch === "`")) mode = "code"
    }
  }
  return out
}

// 桩（`modal.mjs`/`dom.mjs` 顶层取件面——先桩后 import；各行为测例按需换新桩）
globalThis.document = { getElementById: () => null }

function makeNode(tag) {
  const classes = new Set()
  const node = {
    tag, children: [], listeners: {}, attrs: {}, parent: null,
    open: false, textContent: "", value: "", hidden: false, disabled: false, checked: false,
    append(...items) {
      for (const item of items.flat(Infinity)) {
        if (item === null || item === undefined || item === false) continue
        if (typeof item === "object") item.parent = this
        this.children.push(item)
      }
    },
    replaceChildren(...items) { this.children = []; this.append(...items) },
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn) },
    setAttribute(name, value) { this.attrs[name] = String(value) },
    remove() {
      if (this.parent !== null) this.parent.children = this.parent.children.filter((child) => child !== this)
      this.parent = null
    },
    focus() {},
    fire(type, event = {}) {
      const target = { preventDefault() {}, stopPropagation() {}, ...event }
      return Promise.all((this.listeners[type] ?? []).map((fn) => fn(target)))
    },
    showModal() { this.open = true },
    close() { this.open = false; for (const fn of this.listeners.close ?? []) fn({}) },
  }
  // `className` ⇄ `classList` 同步（真 DOM 语义——「类名重写后补类」类断言可判）
  Object.defineProperty(node, "className", {
    get: () => [...classes].join(" "),
    set: (value) => { classes.clear(); for (const token of String(value).split(/\s+/)) if (token) classes.add(token) },
  })
  node.classList = {
    add: (name) => { classes.add(name) },
    remove: (name) => { classes.delete(name) },
    contains: (name) => classes.has(name),
  }
  return node
}

const stubDocument = () => ({ body: makeNode("body"), createElement: (tag) => makeNode(tag), getElementById: () => null })

/** `h`（app.mjs 语义近似）：class ∥ text ∥ on 前缀事件 ∥ 受控属性 ∥ 其余 setAttribute + 子节点。 */
function fH(tag, props = {}, ...children) {
  const node = makeNode(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue
    if (key === "class") node.className = String(value)
    else if (key === "text") node.textContent = String(value)
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value)
    else if (["value", "checked", "disabled", "hidden"].includes(key)) node[key] = value
    else node.setAttribute(key, value)
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue
    node.append(child)
  }
  return node
}

function fFindAll(root, pred, out = []) {
  if (root !== null && typeof root === "object") {
    if (pred(root)) out.push(root)
    for (const child of root.children ?? []) fFindAll(child, pred, out)
  }
  return out
}
const fFind = (root, pred) => fFindAll(root, pred)[0] ?? null
const textOf = (node) => (typeof node === "string" ? node : [node?.textContent ?? "", ...(node?.children ?? []).map(textOf)].filter(Boolean).join(" "))
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const settle = async () => { await tick(); await tick(); await tick() }
const modalOf = () => fFind(globalThis.document.body, (node) => node.tag === "dialog")

/** 桩 ctx（api 路由表 `"METHOD path"` ⇒ handler；`"*"` = 兜底；全调用入 `calls`）。 */
function fCtx(routes = {}, member = { username: "alice", role: "user" }) {
  const calls = []
  const ctx = {
    h: fH,
    state: { member, system: null },
    api: async (path, { method = "GET", body } = {}) => {
      calls.push([method, path, body === undefined ? null : body])
      const handler = routes[`${method} ${path}`] ?? routes["*"]
      if (handler === undefined) throw new Error(`unexpected ${method} ${path}`)
      return handler(path, body)
    },
    fmtTs: (ts) => `ts:${ts}`,
    flash: (message) => calls.push(["flash", message]),
    fail: (error) => calls.push(["fail", String(error?.message ?? error)]),
  }
  return { ctx, calls }
}

const q = (params) => `/api/ledger?${new URLSearchParams(params).toString()}`
const fRepo = (over = {}) => ({ address: "git.example.com/org/repo", displayName: "repo-a", canWrite: true, ...over })
const fLedger = (over = {}) => ({
  id: 7, repo: "git.example.com/org/repo", status: "待讨论", title: "一条", detail: "正文内容", owner: "alice",
  createdBy: "alice", createdAt: "2026-10-13T00:00:00.000Z", updatedAt: "2026-10-13T01:00:00.000Z", closedAt: null, aged: false, canWrite: true, ...over,
})

const { ZH } = await loadPublic("i18n-zh.mjs")
const { EN } = await loadPublic("i18n-en.mjs")
const NAV = await loadPublic("nav.mjs")
const LEDGER_VIEW = await loadPublic("views-ledger.mjs")
const AUDIT_VIEW = await loadPublic("views-audit.mjs")

// ── §C ① AC-12 IA（nav 直测 + 挂载接线） ───────────────────────────────────────

test("§C ① AC-12 IA：我的 6（`#/me/ledger` 末位）∥ 管理 10（project-sources-merge 批单入口）∥ labelKey 单源 ∥ 别名/角色默认零改 ∥ `PAGES` 行 ∥ 壳页集零改", () => {
  const [me, admin] = NAV.NAV_GROUPS
  assert.deepEqual(NAV.NAV_GROUPS.map((group) => group.key), ["me", "admin"], "两组")
  assert.deepEqual(me.items.map((item) => item.path), ["/me/keys", "/me/usage", "/me/account", "/me/projects", "/me/sandbox", "/me/ledger"], "我的 6——ledger 末位追加")
  assert.deepEqual(admin.items.map((item) => item.path), ["/admin/overview", "/admin/chat", "/admin/members", "/admin/projects",
    "/admin/providers", "/admin/models", "/admin/usage", "/admin/audit", "/admin/system", "/admin/sandbox"], "管理 10（project-sources-merge 批：单入口）")
  assert.equal(me.items.at(-1).labelKey, "nav.page.me.ledger", "末位项 labelKey 单源")
  for (const item of [...me.items, ...admin.items]) assert.ok(item.labelKey in ZH && item.labelKey in EN, `labelKey 两表在盘：${item.labelKey}`)
  assert.deepEqual(NAV.ROUTE_ALIASES, { "/me": "/me/keys", "/admin": "/admin/overview", "/admin/proxy": "/admin/system", "/admin/git-sources": "/admin/projects/git-sources" }, "别名集——git-sources 旧链别名 +1（project-sources-merge 批）")
  assert.deepEqual([NAV.defaultPath("admin"), NAV.defaultPath("user")], ["/admin/overview", "/me/keys"], "角色默认页零改")
  assert.deepEqual(NAV.resolveRoute("/me/ledger", "user"), { path: "/me/ledger" }, "新径——user 可达（非 admin 面）")
  assert.deepEqual(NAV.resolveRoute("/me/ledger", "admin"), { path: "/me/ledger" }, "admin 同页")
  assert.deepEqual(NAV.resolveRoute("/me/ledger/extra", "user"), { path: "/me/ledger", sub: "extra" }, "子段容许零改")
  assert.equal(NAV.resolveRoute("/admin/projects", "user").denied, true, "admin 面非 admin ⇒ denied 零改")
  // 挂载接线（+1 import +1 `PAGES` 行；壳页集不动——本页非数据表壳）
  const appSrc = readPublic("app.mjs")
  assert.ok(appSrc.includes('import { renderMeLedger } from "./views-ledger.mjs"'), "import 接线")
  assert.ok(appSrc.includes('"/me/ledger": renderMeLedger,'), "`PAGES` 行在册")
  const shell = appSrc.match(/const SHELL_PAGES = new Set\(\[([^\]]*)\]\)/)[1]
  assert.deepEqual([...shell.matchAll(/"([^"]+)"/g)].map((match) => match[1]),
    ["/admin/members", "/admin/providers", "/admin/models", "/admin/audit", "/me/usage"], "壳页五路径零改（本页不入数据表壳）")
  for (const name of ["renderMeLedger", "openLedgerDetail", "openCreateLedger", "statusLabel", "nextStatusOptions", "repoNameOf"]) {
    assert.equal(typeof LEDGER_VIEW[name], "function", `导出面：${name}`)
  }
  assert.equal(Object.keys(LEDGER_VIEW).length, 9, "导出面 9 名（零冗余面）")
})

// ── §C ② AC-14 键集（ledger 两部件 + 两随动件 + 门面 + 引用闭合） ─────────────────

test("§C ② AC-14 键集：ledger 两部件 65 键（键集相等 ∥ en 零 CJK ∥ 域界 `me.ledger.`）∥ shell +1 ∥ system +1 ∥ 门面并集 ∥ 键引用闭合", async () => {
  const [zhPart, enPart, zhShell, enShell, zhSystem, enSystem] = await Promise.all([
    loadPublic("i18n-zh-ledger.mjs"), loadPublic("i18n-en-ledger.mjs"), loadPublic("i18n-zh-shell.mjs"), loadPublic("i18n-en-shell.mjs"),
    loadPublic("i18n-zh-system.mjs"), loadPublic("i18n-en-system.mjs"),
  ])
  assert.deepEqual([Object.keys(zhPart), Object.keys(enPart)], [["ZH_LEDGER"], ["EN_LEDGER"]], "两部件单导出")
  assert.ok(Object.isFrozen(zhPart.ZH_LEDGER) && Object.isFrozen(enPart.EN_LEDGER), "两部件冻结")
  const zhKeys = Object.keys(zhPart.ZH_LEDGER)
  const enKeys = Object.keys(enPart.EN_LEDGER)
  assert.deepEqual(enKeys, zhKeys, "两表键集相等（逐键对位）")
  assert.equal(zhKeys.length, 65, "ledger 部件 65 键（实读）")
  for (const key of zhKeys) assert.ok(key.startsWith("me.ledger."), `域界：${key}`)
  for (const [key, value] of Object.entries(enPart.EN_LEDGER)) {
    assert.ok(typeof value === "string" && value.trim() !== "", `en 值非空：${key}`)
    assert.equal(CJK.test(value), false, `en 值含 CJK：${key}`)
  }
  for (const key of zhKeys) assert.ok(typeof zhPart.ZH_LEDGER[key] === "string" && zhPart.ZH_LEDGER[key].trim() !== "", `zh 值非空：${key}`)
  // 随动键：shell +1（`nav.page.me.ledger`）∥ system +1（`audit.type.ledger_event`）
  for (const [table, lang] of [[zhShell.ZH_SHELL, "zh"], [enShell.EN_SHELL, "en"]]) {
    assert.equal(Object.keys(table).length, 61, `${lang} shell 键数 61（60 + 1——team-ledger 批）`)
    assert.ok("nav.page.me.ledger" in table, `${lang} shell 在盘：nav.page.me.ledger`)
  }
  for (const [table, lang] of [[zhSystem.ZH_SYSTEM, "zh"], [enSystem.EN_SYSTEM, "en"]]) {
    assert.equal(Object.keys(table).length, 185, `${lang} system 键数 185（184 + 1——team-ledger 批）`)
    assert.ok("audit.type.ledger_event" in table, `${lang} system 在盘：audit.type.ledger_event`)
  }
  // 门面并集与键数（实读；随批随正）
  assert.equal(Object.keys(ZH).length, 970, "zh 门面 970（892 + 65 + 1 + 1 + 3 + 8——实读；+3 = sandbox-container-actions 批/表；+8 = gitee-namespace-kinds 批/表）")
  assert.equal(Object.keys(EN).length, 975, "en 门面 975（897 + 65 + 1 + 1 + 3 + 8——实读；+3 = sandbox-container-actions 批/表；+8 = gitee-namespace-kinds 批/表）")
  for (const key of zhKeys) assert.ok(key in ZH && key in EN, `门面并集：${key}`)
  // 键引用闭合（本批两视图 `t` 字面量 ⊆ 两表；nav labelKey 面见 ①）
  for (const name of ["views-ledger.mjs", "views-audit.mjs"]) {
    for (const match of stripComments(readPublic(name)).matchAll(/\bt\(\s*"([^"]+)"\s*[,)]/g)) {
      assert.ok(match[1] in ZH && match[1] in EN, `${name} t 字面量悬空：${match[1]}`)
    }
  }
  // 审计词面（四 kind ∥ 两面）两表在盘
  for (const kind of ["create", "edit", "close", "withdraw"]) assert.ok(`me.ledger.kind.${kind}` in ZH && `me.ledger.kind.${kind}` in EN, `kind 词面：${kind}`)
  for (const surface of ["console", "client"]) assert.ok(`me.ledger.surface.${surface}` in ZH && `me.ledger.surface.${surface}` in EN, `surface 词面：${surface}`)
})

// ── §C ③ AC-19/20 静态面（零新变量/悬停 ∥ 类名闭合 ∥ 行宽/行数 ∥ 代码段零 CJK） ──

test("§C ③ AC-19/20：`style.css` 零动读数（58 变量 ∥ 8 悬停）∥ 新档类名闭合 ∥ 行宽/行数 ∥ 代码段零 CJK ∥ 零外链", () => {
  const css = readPublic("style.css")
  const clean = stripComments(css)
  assert.equal([...clean.match(/:root\s*\{[\s\S]*?\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].length, 58, ":root 58 变量（本批零触 style.css——零新颜色变量）")
  assert.equal([...clean.matchAll(/:hover/g)].length, 8, "`:hover` 8（零新悬停规则）")
  const cssClasses = new Set([...css.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]))
  const source = readPublic("views-ledger.mjs")
  const used = new Set()
  for (const match of source.matchAll(/\bclass\s*:\s*"([^"]*)"/g)) for (const token of match[1].split(/\s+/)) if (token) used.add(token)
  assert.ok(used.size > 0, "类名抽取非空")
  for (const token of used) assert.ok(cssClasses.has(token), `views-ledger.mjs 类无样式规则：${token}`)
  assert.equal(/https?:\/\//.test(source), false, "views-ledger.mjs 零外链（KD-SV-9）")
  assert.ok(Math.max(...source.split("\n").map((line) => line.length)) <= 300, "views-ledger.mjs 行宽 ≤300")
  assert.ok(linesOf("views-ledger.mjs") <= 500, `views-ledger.mjs ≤500（实读 ${linesOf("views-ledger.mjs")}）`)
  assert.ok(Math.max(...readPublic("views-audit.mjs").split("\n").map((line) => line.length)) <= 300, "views-audit.mjs 行宽 ≤300")
  assert.ok(linesOf("views-audit.mjs") <= 500, `views-audit.mjs ≤500（实读 ${linesOf("views-audit.mjs")}）`)
  for (const name of ["i18n-zh-ledger.mjs", "i18n-en-ledger.mjs"]) {
    assert.ok(Math.max(...readPublic(name).split("\n").map((line) => line.length)) <= 300, `${name} 行宽 ≤300`)
    assert.ok(linesOf(name) <= 500, `${name} ≤500（实读 ${linesOf(name)}）`)
  }
  for (const name of ["views-ledger.mjs", "views-audit.mjs"]) {
    assert.equal(CJK.test(stripComments(readPublic(name))), false, `${name} 代码段零 CJK（文案入 zh 表；域语汇值取 zh 表词）`)
  }
  // 本页零本机台账面（AC-32①）∥ 零本地持久化（AC-32⑤）——import 面闭合
  assert.deepEqual([...source.matchAll(/from "([^"]+)"/g)].map((match) => match[1]).sort(), ["./i18n-zh.mjs", "./i18n.mjs", "./modal.mjs"], "import 面闭合（零本机台账模块 ∥ 零服务端 src 直引）")
  assert.equal(/localStorage|sessionStorage|indexedDB/.test(source), false, "零本地持久化面（无离线缓存）")
})

// ── §C ④ 页行为·列表 ∥ 三筛 ∥ 空态两形 ∥ 错态 ─────────────────────────────────

test("§C ④ 页行为：七列 ∥ 仓回填（缺 ⇒ 归地址）∥ 老化标 ∥ 行内动作随 `canWrite` ∥ 三筛逐参 ∥ 「清除」复位 ∥ 空态两形 ∥ 读败人话", async () => {
  try {
    globalThis.document = stubDocument()
    const list = {
      items: [fLedger(), fLedger({ id: 8, repo: "git.example.com/org/gone", status: ZH["me.ledger.status.inflight"], aged: true, owner: "bob", canWrite: false, updatedAt: null })],
      repos: [fRepo(), fRepo({ address: "git.example.com/org/b", displayName: "repo-b", canWrite: false })],
      total: 2,
    }
    const { ctx, calls } = fCtx({ "*": () => list })
    const mount = makeNode("section")
    await LEDGER_VIEW.renderMeLedger(ctx, mount)
    const headers = fFindAll(mount, (node) => node.tag === "th").map((cell) => cell.textContent)
    assert.deepEqual(headers, [ZH["me.ledger.col.id"], ZH["me.ledger.col.repo"], ZH["me.ledger.col.title"], ZH["me.ledger.col.status"],
      ZH["me.ledger.col.owner"], ZH["me.ledger.col.updated"], ZH["me.ledger.col.actions"]], "七列列头")
    assert.equal(fFindAll(mount, (node) => node.tag === "tfoot").length, 0, "非数据表壳（无 tfoot 行计数——沿三页之例）")
    const rows = fFindAll(mount, (node) => node.tag === "tr" && node.className === "row-clickable")
    assert.equal(rows.length, 2, "两数据行（可点）")
    assert.ok(textOf(rows[0]).includes("#7") && textOf(rows[0]).includes("repo-a") && textOf(rows[0]).includes(ZH["me.ledger.status.discuss"]), "行一：编号/仓回填/状态词")
    assert.ok(textOf(rows[0]).includes("ts:2026-10-13T01:00:00.000Z"), "更新时间列（fmtTs 取值）")
    const rowButtons = fFindAll(rows[0], (node) => node.tag === "button").map((button) => button.textContent)
    assert.deepEqual(rowButtons, [ZH["me.ledger.close"], ZH["me.ledger.withdraw"]], "行内动作（canWrite ⇒ 收口 + 撤回）")
    assert.ok(textOf(rows[1]).includes(ZH["me.ledger.aged"]), "老化标（aged=true ⇒ 徽标）")
    assert.equal(fFindAll(rows[1], (node) => node.tag === "button").length, 0, "非 canWrite 行零动作控件")
    assert.ok(textOf(rows[1]).includes("git.example.com/org/gone"), "仓缺失（项目已删）⇒ 归地址兜底")
    // 三筛逐参（即选即查）
    const selects = fFindAll(mount, (node) => node.tag === "select")
    const ownerFilter = fFind(mount, (node) => node.tag === "input" && node.attrs.placeholder === ZH["me.ledger.filterOwnerPh"])
    selects[0].value = "git.example.com/org/repo"
    await selects[0].fire("change")
    assert.equal(calls.at(-1)[1], q({ repo: "git.example.com/org/repo" }), "仓筛逐参")
    selects[1].value = ZH["me.ledger.status.inflight"]
    await selects[1].fire("change")
    assert.equal(calls.at(-1)[1], q({ repo: "git.example.com/org/repo", status: ZH["me.ledger.status.inflight"] }), "状态筛逐参（并集）")
    ownerFilter.value = "carol"
    await ownerFilter.fire("change")
    assert.equal(calls.at(-1)[1], q({ repo: "git.example.com/org/repo", status: ZH["me.ledger.status.inflight"], owner: "carol" }), "负责人筛逐参（三筛并集）")
    const clearBtn = fFindAll(mount, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.filterClear"])
    await clearBtn.fire("click")
    assert.equal(calls.at(-1)[1], "/api/ledger", "「清除」复位三筛（无参径）")
    // 空态两形
    globalThis.document = stubDocument()
    const emptyA = fCtx({ "*": () => ({ items: [], repos: [fRepo()], total: 0 }) })
    const mountA = makeNode("section")
    await LEDGER_VIEW.renderMeLedger(emptyA.ctx, mountA)
    assert.ok(textOf(mountA).includes(ZH["me.ledger.empty"]) && textOf(mountA).includes(ZH["me.ledger.emptyHint"]), "空态形一（无可见条目——两句）")
    assert.equal(textOf(mountA).includes(ZH["me.ledger.emptyFiltered"]), false, "形一不混形二句")
    const selectsA = fFindAll(mountA, (node) => node.tag === "select")
    selectsA[1].value = ZH["me.ledger.status.inflight"]
    await selectsA[1].fire("change")
    await settle()
    assert.ok(textOf(mountA).includes(ZH["me.ledger.emptyFiltered"]) && textOf(mountA).includes(ZH["me.ledger.emptyFilteredHint"]), "空态形二（筛选零命中——另句）")
    assert.equal(textOf(mountA).includes(ZH["me.ledger.emptyHint"]), false, "形二不混形一句")
    // 读败
    globalThis.document = stubDocument()
    const failing = fCtx({ "*": () => { throw Object.assign(new Error("boom"), { status: 500, code: "internal_error" }) } })
    const mountF = makeNode("section")
    await LEDGER_VIEW.renderMeLedger(failing.ctx, mountF)
    assert.ok(textOf(mountF).includes(ZH["me.ledger.loadFailed"]), "读败 ⇒ 页内人话")
    assert.equal(failing.calls.some(([method]) => method === "fail"), true, "`ctx.fail` 同拍")
    // 行点击 ⇒ 详情弹窗
    globalThis.document = stubDocument()
    const openCtx = fCtx({ "*": () => list })
    const mount2 = makeNode("section")
    await LEDGER_VIEW.renderMeLedger(openCtx.ctx, mount2)
    const row = fFindAll(mount2, (node) => node.tag === "tr" && node.className === "row-clickable")[0]
    await row.fire("click")
    assert.ok(modalOf() !== null, "行点击 ⇒ 详情/编辑弹窗")
  } finally { delete globalThis.document }
})

// ── §C ⑤ 弹窗行为·详情/编辑（权限感知 ∥ 状态选单 ∥ PATCH 体） ─────────────────────

test("§C ⑤ 详情/编辑弹窗：详情段恒显 ∥ 编辑段仅 `canWrite`（仓只读选单）∥ 状态选单 = 当前 ∪ 合法后继 ∥ 保存 ⇒ PATCH 体 ∥ 败 ⇒ 窗内人话", async () => {
  try {
    globalThis.document = stubDocument()
    const reloaded = []
    const { ctx, calls } = fCtx({ "PATCH /api/ledger/7": () => ({ item: fLedger() }) })
    LEDGER_VIEW.openLedgerDetail(ctx, { item: fLedger({ aged: true }), repos: [fRepo()], reload: () => { reloaded.push(1) } })
    const dialog = modalOf()
    assert.ok(dialog !== null, "弹窗在册")
    assert.ok(textOf(dialog).includes("#7") && textOf(dialog).includes("repo-a") && textOf(dialog).includes("正文内容"), "详情段：编号/仓/正文")
    assert.ok(textOf(dialog).includes(ZH["me.ledger.detail.createdBy"]) && textOf(dialog).includes(ZH["me.ledger.detail.body"]), "详情段标签在册")
    assert.ok(textOf(dialog).includes(ZH["me.ledger.aged"]), "详情段老化标随行")
    const selects = fFindAll(dialog, (node) => node.tag === "select")
    assert.equal(selects.length, 2, "仓只读选单 + 状态选单")
    assert.equal(selects[0].disabled, true, "仓不可改（选单置只读）")
    assert.deepEqual(fFindAll(selects[0], (node) => node.tag === "option").map((option) => option.value), ["git.example.com/org/repo"], "只读选单 = 现仓")
    assert.deepEqual(fFindAll(selects[1], (node) => node.tag === "option").map((option) => option.value),
      [ZH["me.ledger.status.discuss"], ZH["me.ledger.status.design"], ZH["me.ledger.status.withdrawn"]], "状态选单 = 当前值 ∪ 迁移表合法后继")
    const save = fFindAll(dialog, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.save"])
    assert.ok(save !== undefined, "保存钮在册（canWrite）")
    await save.fire("click")
    await settle()
    assert.deepEqual(calls.filter(([method]) => method === "PATCH").at(-1),
      ["PATCH", "/api/ledger/7", { title: "一条", detail: "正文内容", owner: "alice", status: ZH["me.ledger.status.discuss"] }], "PATCH 体逐值")
    assert.equal(reloaded.length, 1, "成 ⇒ reload")
    assert.ok(calls.some(([method, message]) => method === "flash" && message === ZH["me.ledger.saved"]), "flash「已保存」")
    // 败 ⇒ 窗内人话（服务端原文入映射）
    globalThis.document = stubDocument()
    const bad = fCtx({ "PATCH /api/ledger/7": () => { throw Object.assign(new Error("条目已归档（已核销）——不可再改（行保留；撤回须先于归档）"), { status: 400, code: "invalid_request_error" }) } })
    LEDGER_VIEW.openLedgerDetail(bad.ctx, { item: fLedger(), repos: [] })
    const badDialog = modalOf()
    await fFindAll(badDialog, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.save"]).fire("click")
    await settle()
    assert.ok(textOf(badDialog).includes("不可再改"), "败 ⇒ 窗内状态行（服务端原文）")
    // 非 canWrite ⇒ 无编辑段（详情段仍在）
    globalThis.document = stubDocument()
    const low = fCtx({})
    LEDGER_VIEW.openLedgerDetail(low.ctx, { item: fLedger({ canWrite: false }), repos: [] })
    const lowDialog = modalOf()
    assert.equal(fFindAll(lowDialog, (node) => node.tag === "button").some((button) => button.textContent === ZH["me.ledger.save"]), false, "无保存钮（canWrite false）")
    assert.equal(fFindAll(lowDialog, (node) => node.tag === "input").length + fFindAll(lowDialog, (node) => node.tag === "textarea").length, 0, "零编辑控件")
    assert.ok(textOf(lowDialog).includes(ZH["me.ledger.detail.body"]), "详情段恒显")
    // 纯函数：状态选单/文案（归档态仅当前值 ∥ 枚举外原值兜底）
    assert.deepEqual(LEDGER_VIEW.nextStatusOptions(ZH["me.ledger.status.closed"]), [ZH["me.ledger.status.closed"]], "归档态 = 终态门先行（仅当前值）")
    assert.deepEqual(LEDGER_VIEW.nextStatusOptions(ZH["me.ledger.status.closeout"]),
      [ZH["me.ledger.status.closeout"], ZH["me.ledger.status.closed"], ZH["me.ledger.status.withdrawn"]], "待核销 ⇒ 已核销/已废弃")
    assert.equal(LEDGER_VIEW.statusLabel("future"), "future", "状态枚举外 ⇒ 原值兜底")
    assert.equal(LEDGER_VIEW.repoNameOf("git.example.com/org/gone", []), "git.example.com/org/gone", "仓缺失（项目已删）⇒ 归地址")
  } finally { delete globalThis.document }
})

// ── §C ⑥ 行内动作·收口（成/败）∥ 撤回（非原生 confirm + 后果句） ─────────────────

test("§C ⑥ 行内动作：收口（成 ⇒ POST 已核销；400 ⇒ 行内就地人话）∥ 撤回（非原生 confirm + 后果句 ⇒ POST 已废弃）", async () => {
  try {
    const list = { items: [fLedger()], repos: [fRepo()], total: 1 }
    // 收口成
    globalThis.document = stubDocument()
    const { ctx, calls } = fCtx({ "*": () => list, "POST /api/ledger/7/close": () => ({ item: fLedger() }) })
    const mount = makeNode("section")
    await LEDGER_VIEW.renderMeLedger(ctx, mount)
    const closeOf = () => fFindAll(mount, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.close"])
    await closeOf().fire("click")
    await settle()
    assert.deepEqual(calls.filter(([method]) => method === "POST").at(-1), ["POST", "/api/ledger/7/close", { status: ZH["me.ledger.status.closed"] }], "收口载荷 = 已核销")
    assert.ok(calls.some(([method, message]) => method === "flash" && message === ZH["me.ledger.closed"]), "flash「已收口」")
    // 收口败（追认核销须正文 ⇒ 400）⇒ 行内状态行
    globalThis.document = stubDocument()
    const failCtx = fCtx({
      "*": () => list,
      "POST /api/ledger/7/close": () => { throw Object.assign(new Error("追认核销须正文（detail）非空（现态 待讨论）"), { status: 400, code: "invalid_request_error" }) },
    })
    const mount2 = makeNode("section")
    await LEDGER_VIEW.renderMeLedger(failCtx.ctx, mount2)
    const row2 = fFindAll(mount2, (node) => node.tag === "tr" && node.className === "row-clickable")[0]
    await fFindAll(row2, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.close"]).fire("click")
    await settle()
    const note = fFindAll(row2, (node) => node.tag === "p")[0]
    assert.ok(note !== undefined && note.hidden === false, "400 ⇒ 行内状态行就地呈")
    assert.ok(note.textContent.includes("追认核销须正文"), "服务端原文入映射（人话）")
    assert.equal(note.className.includes("cell-hint"), true, "表内折行类保住（`showNote` 类名重写后补回——`th,td` 全局 `nowrap`）")
    assert.equal(failCtx.calls.some(([method]) => method === "flash"), false, "败不 flash（就地）")
    // 撤回：非原生 confirm + 后果句 ⇒ 确认后才 POST
    globalThis.document = stubDocument()
    const wd = fCtx({ "*": () => list, "POST /api/ledger/7/close": () => ({ item: fLedger() }) })
    const mount3 = makeNode("section")
    await LEDGER_VIEW.renderMeLedger(wd.ctx, mount3)
    const row3 = fFindAll(mount3, (node) => node.tag === "tr" && node.className === "row-clickable")[0]
    await fFindAll(row3, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.withdraw"]).fire("click")
    const confirm = modalOf()
    assert.ok(confirm !== null, "撤回 ⇒ 弹窗二次确认（非原生 confirm）")
    assert.ok(textOf(confirm).includes(ZH["me.ledger.withdrawTitle"]), "确认窗题在册")
    assert.ok(textOf(confirm).includes(ZH["me.ledger.withdrawConfirm"]), "后果句在册（行保留）")
    assert.deepEqual(wd.calls.filter(([method]) => method === "POST"), [], "确认前零 POST（二次确认门）")
    await fFindAll(confirm, (node) => node.tag === "button" && node.className === "danger")[0].fire("click")
    await settle()
    assert.deepEqual(wd.calls.filter(([method]) => method === "POST").at(-1), ["POST", "/api/ledger/7/close", { status: ZH["me.ledger.status.withdrawn"] }], "确认 ⇒ 撤回载荷 = 已废弃")
    assert.ok(wd.calls.some(([method, message]) => method === "flash" && message === ZH["me.ledger.withdrawn"]), "flash「已撤回」")
    // 机检：零原生 confirm（撤回走平台 dialog 确认窗）
    assert.equal(/window\.confirm|\bconfirm\s*\(/.test(stripComments(readPublic("views-ledger.mjs"))), false, "零原生 confirm")
  } finally { delete globalThis.document }
})

// ── §C ⑦ 新建弹窗（可写过滤 ∥ 无可写禁用 + 括注 ∥ 必填门 ∥ 提交体） ──────────────

test("§C ⑦ 新建弹窗：仓选单 = `canWrite` 过滤 ∥ 无可写 ⇒ 钮禁用 + 括注 ∥ 必填门 ∥ 提交体逐值（负责人留空 ⇒ null）", async () => {
  try {
    globalThis.document = stubDocument()
    const repos = [fRepo(), fRepo({ address: "git.example.com/org/b", displayName: "repo-b", canWrite: false })]
    const reloaded = []
    const { ctx, calls } = fCtx({ "POST /api/ledger": () => ({ item: fLedger() }) })
    LEDGER_VIEW.openCreateLedger(ctx, { repos, reload: () => { reloaded.push(1) } })
    const dialog = modalOf()
    assert.ok(dialog !== null, "新建弹窗在册")
    const repoSelect = fFindAll(dialog, (node) => node.tag === "select")[0]
    assert.deepEqual(fFindAll(repoSelect, (node) => node.tag === "option").map((option) => option.value),
      ["git.example.com/org/repo"], "仓选单 = 可写项目（read 档零出现）")
    const submit = fFindAll(dialog, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.create.submit"])
    await submit.fire("click")
    assert.equal(calls.some(([method]) => method === "POST"), false, "标题空 ⇒ 不发 POST（必填门）")
    assert.ok(textOf(dialog).includes(ZH["me.ledger.titleRequired"]), "必填门人话在册")
    repoSelect.value = "git.example.com/org/repo" // 桩 select 无浏览器缺省首选中——显式置值（真 DOM 首选项即缺省选中）
    fFind(dialog, (node) => node.tag === "input" && node.attrs.placeholder === ZH["me.ledger.create.titlePh"]).value = "新条"
    fFindAll(dialog, (node) => node.tag === "textarea")[0].value = "正文"
    await submit.fire("click")
    await settle()
    assert.deepEqual(calls.filter(([method]) => method === "POST").at(-1),
      ["POST", "/api/ledger", { repo: "git.example.com/org/repo", title: "新条", detail: "正文", owner: null }], "提交体逐值")
    assert.equal(reloaded.length, 1, "成 ⇒ reload")
    // 无可写项目 ⇒ 「新建」禁用 + 括注
    globalThis.document = stubDocument()
    const noWrite = fCtx({ "*": () => ({ items: [], repos: [fRepo({ canWrite: false })], total: 0 }) })
    const mount = makeNode("section")
    await LEDGER_VIEW.renderMeLedger(noWrite.ctx, mount)
    const newBtn = fFindAll(mount, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.create"])
    assert.equal(newBtn.disabled, true, "无可写项目 ⇒ 钮禁用")
    const hint = fFind(mount, (node) => node.tag === "span" && node.textContent === ZH["me.ledger.noWritable"])
    assert.ok(hint !== null && hint.hidden === false, "括注「需先加入项目」在册")
    // 有可写项目 ⇒ 钮可用、括注隐
    globalThis.document = stubDocument()
    const writeCtx = fCtx({ "*": () => ({ items: [], repos: [fRepo()], total: 0 }) })
    const mount2 = makeNode("section")
    await LEDGER_VIEW.renderMeLedger(writeCtx.ctx, mount2)
    const newBtn2 = fFindAll(mount2, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.create"])
    assert.equal(newBtn2.disabled, false, "可写 ⇒ 钮可用")
    assert.equal(fFind(mount2, (node) => node.tag === "span" && node.textContent === ZH["me.ledger.noWritable"]).hidden, true, "括注隐")
    await newBtn2.fire("click")
    assert.ok(modalOf() !== null, "「新建」⇒ 弹窗（仓选单 = 可写）")
    // 首屏（首个列表响应前）：「新建」禁用——可写项目未知
    globalThis.document = stubDocument()
    const pendingCtx = fCtx({ "*": () => new Promise(() => {}) })
    const mountPending = makeNode("section")
    LEDGER_VIEW.renderMeLedger(pendingCtx.ctx, mountPending) // 不等（列表在飞）
    const pendingBtn = fFindAll(mountPending, (node) => node.tag === "button").find((button) => button.textContent === ZH["me.ledger.create"])
    assert.equal(pendingBtn.disabled, true, "首个响应前「新建」禁用（零空仓上送）")
  } finally { delete globalThis.document }
})

// ── §C ⑧ 审计面与域一致性（`ledger_event` ∥ 四 kind/两面 ∥ 值集/迁移表 = 服务端） ──

test("§C ⑧ 审计面与域一致性：型表 + `ledger_event` 行 ∥ 详情模板四 kind/两面 ∥ 六态值集与迁移表 = 服务端逐字（防两面漂移）", () => {
  const src = readPublic("views-audit.mjs")
  assert.ok(src.includes('["ledger_event", "audit.type.ledger_event"]'), "型表 +1 行（十五型）")
  assert.ok(src.includes('event.type === "ledger_event" ? ledgerDetailText(event.detail)'), "详情支接线")
  assert.equal(AUDIT_VIEW.ledgerKindLabel("create"), ZH["me.ledger.kind.create"], "kind 词面取表")
  assert.equal(AUDIT_VIEW.ledgerKindLabel("future"), "future", "kind 枚举外 ⇒ 原值兜底")
  assert.equal(AUDIT_VIEW.ledgerDetailText({ kind: "withdraw", id: 9, repo: "git.example.com/org/repo", surface: "client" }),
    [ZH["me.ledger.kind.withdraw"], "#9", "git.example.com/org/repo", ZH["me.ledger.surface.client"]].join(" · "), "详情模板逐值")
  assert.equal(AUDIT_VIEW.ledgerDetailText({ kind: "close", id: 1, repo: "a/b", surface: "console" }).includes(ZH["me.ledger.surface.console"]), true, "console 面词面")
  assert.equal(AUDIT_VIEW.ledgerDetailText({}), "—", "零字段 ⇒ 「—」")
  // 域一致性（控制台副本 = 服务端单源；值取 zh 表——域语汇非文案）
  assert.deepEqual([...LEDGER_VIEW.STATUS_VALUES], [...LEDGER_ITEMS.STATUSES], "六态值集逐字 = 服务端 STATUSES")
  assert.deepEqual(LEDGER_VIEW.ALLOWED_MIGRATIONS, LEDGER_ITEMS.ALLOWED_MIGRATIONS, "迁移表逐字 = 服务端 ALLOWED_MIGRATIONS")
  assert.equal(LEDGER_ITEMS.STATUSES.every((status) => status in LEDGER_VIEW.STATUS_KEYS), true, "六态键集全覆（值 ⇒ 键）")
  for (const language of [ZH, EN]) {
    for (const status of LEDGER_ITEMS.STATUSES) assert.equal(typeof language[LEDGER_VIEW.STATUS_KEYS[status]], "string", `标签两表在盘：${status}`)
  }
})

