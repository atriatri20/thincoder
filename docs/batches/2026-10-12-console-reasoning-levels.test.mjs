/**
 * 2026-10-12-console-reasoning-levels.test.mjs — thincoder-server 批内件（`console-reasoning-levels` 批 · 台账 #1303；
 * 名随批档 · 住 `docs/batches/`）：控制台对话页思考档位选择器（源 ⇒ 线 ⇒ 界面三段补齐；功能点 42 ∥ AC-42 五条）。
 * 运行（自 `thincoder/` 仓根）：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-12-console-reasoning-levels.test.mjs`
 *
 * 判据源 = 批档 §2.3/§2.4 ∥ `webui/CHAT.md` §4（AC-42 两行 + 壳面用例）∥ `agent/ADMIN-AGENT.md` §8（N71 ∥ B69 ∥ E54）
 *   ∥ `gateway/API.md` §2.2/§2.8 ∥ `store/STORE.md` §2/§3 v16。
 *   ① 档位源在册：`modelReasoning` 稀疏 map（假 specLookup 注入——有档登键 ∥ 无档零键 ∥ 键 = 上游真名）∥
 *      `deriveModels` 行携 `reasoning` ⇒ 核行非恒空 ∥ 缺核 ⇒ `{}` + 一条警告（不 5xx）。
 *   ② 选择生效（N71）：PATCH `{ reasoning }` ⇒ 200 落库 + 回执/列表/详情三面行形携值 ∥ 装配（假出口入参携 `reasoningEffort`）。
 *   ③ 界面可用：`style.css` 五钮收窄（`#reasoning-btn` 出列）∥ 点选 ⇒ PATCH 恰一条 ∥ 切会话 ⇒ 推送回读（页级实驱动）。
 *   ④ 默认静默（B69）：未设 ⇒ 出口零 `reasoningEffort` 键 ∥ 表外存量 ⇒ 零字段（读侧容忍）∥ 换模型 ⇒ 清 NULL ∥
 *      v16 零迁移（空库直落 16 ∥ v15 库升 16 ∥ 幂等 ∥ 列面六列 ∥ 存量行 NULL 零变）。
 *   E54 非法拒：表外值 ∥ 非串 ∥ 同携 `model` ∥ 缺核 ⇒ 逐形 400 人话 + 库零变。
 *   壳面：N72（钮解隐藏 + 点选 ⇒ PATCH + 推送回读）∥ B70（无档模型中性能辨 ∥ 切会话各自记住）∥ E55（写失败 ⇒ 就地人话 + 钮面重派生）。
 *   结构腿：适配层接线（`selectReasoning` 映射 ∥ 核行真档位 ∥ prefs 携档）∥ 键面零新键 ∥ 核件取件面零新增。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const SERVER_DIR = join(ROOT, "thincoder-server")
const readPublic = (name) => readFileSync(join(SERVER_DIR, "public", name), "utf8")
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const PROVIDERS = await load("thincoder-server/src/gateway/providers.mjs")
const PROVIDER_ADMIN = await load("thincoder-server/src/gateway/provider-admin.mjs")
const LEVELS = await load("thincoder-server/src/gateway/reasoning-levels.mjs")
const CHAT = await load("thincoder-server/src/agent/chat.mjs")
const CHAT_ROUTES = await load("thincoder-server/src/agent/chat-routes.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const ACCOUNT_ROUTES = await load("thincoder-server/src/accounts/routes.mjs")
const SESSION = await load("thincoder-server/src/accounts/session.mjs")
const CORE_I18N = await import("/rc/i18n.mjs")
const ZH_CORE_MOD = await load("thincoder-server/public/i18n-zh-core.mjs")

const PASSWORD = "password-123"
const UPSTREAM = "kimi-k3" // 上游真名（有档——核枚举替身三档）
const ALIAS = "fast" // 对外标识（别名——解析径判据）
const PLAIN = "plain-model" // 无档模型（枚举缺省 ⇒ 零键/中性面）
const PLAIN_REF = `fake/${PLAIN}` // 无档模型对外标识（无别名 ⇒ `provider/model` 前缀形）
const ENUMS = { [UPSTREAM]: ["low", "high", "max"] }
/** 假 specLookup（核 `specForModel` 替身——有档给枚举 ∥ 无档零字段）：键 = 上游真名查询面。 */
const fakeSpecLookup = (model) => (ENUMS[model] ? { reasoningEffortEnum: ENUMS[model] } : { context: 128_000 })
/** 缺核替身（值域源不可用——与本机缺 `@thincoder/core` 同失败形）。 */
const throwingSpecLookup = () => { throw new Error(`${LEVELS.CORE_MISSING_MESSAGE}——模拟缺核`) }
/** 微任务链排空（确定性收面——零墙钟：本批假 ctx.api 全即时兑现，链深固定）。 */
const tick = async (n = 60) => { for (let i = 0; i < n; i++) await Promise.resolve() }

// ── 装置：进程内应用（provider 管理面 + 会话面 + 账号面）────────────────────────

async function call(base, method, path, { body, cookie } = {}) {
  const headers = { "content-type": "application/json" }
  if (cookie) headers.cookie = cookie
  const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await res.text()
  let json = null
  try { json = JSON.parse(text) } catch { /* NDJSON 流 ∥ 空体 */ }
  return { status: res.status, text, json, setCookies: res.headers.getSetCookie?.() ?? [] }
}

async function startApp({ specLookup = fakeSpecLookup, log = null } = {}) {
  const db = DB.openDatabase(":memory:")
  await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  await MEMBERS.createMember(db, { username: "user", role: "user", password: PASSWORD })
  const now = new Date().toISOString()
  db.prepare("INSERT INTO providers (name, base_url, api_key, models_json, created_at, updated_at) VALUES (?,?,?,?,?,?)")
    .run("fake", "http://127.0.0.1:9/v1", "sk-test", JSON.stringify([{ name: UPSTREAM, alias: ALIAS }, PLAIN]), now, now)
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(mkdtempSync(join(tmpdir(), "tc-levels-")), "gateway.db") })
  const runtime = PROVIDERS.bootstrapProviderRuntime({ db, config, log: null })
  const routes = SERVER.createRouteTable()
  PROVIDER_ADMIN.registerProviderAdminRoutes(routes, { db, config, runtime, log, specLookup })
  CHAT_ROUTES.registerChatRoutes(routes, { db, log, deps: { chat: async () => ({ content: "在", toolCalls: [] }), tools: { schemas: [], invoke: async () => ({ ok: true }) }, config } })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  const server = SERVER.createGatewayServer({ config, routes, log: null })
  await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve) })
  const base = `http://127.0.0.1:${server.address().port}`
  const login = async (username) => {
    const res = await call(base, "POST", "/api/login", { body: { username, password: PASSWORD } })
    const line = res.setCookies.find((item) => item.startsWith(`${SESSION.SESSION_COOKIE}=`)) ?? null
    return line ? line.split(";")[0] : null
  }
  const app = {
    db,
    base,
    cookie: await login("admin"),
    cookieUser: await login("user"),
    chats: () => db.prepare("SELECT * FROM agent_chats ORDER BY id").all(),
    newChat: async (model = ALIAS) => {
      const res = await call(base, "POST", "/api/admin/agent/chats", { cookie: app.cookie, body: { model } })
      assert.equal(res.status, 200, `建会话须 200：${res.text}`)
      return res.json.chat
    },
    patch: (id, body, { cookie = null } = {}) => call(base, "PATCH", `/api/admin/agent/chats/${id}`, { cookie: cookie ?? app.cookie, body }),
    async close() { server.closeAllConnections?.(); await new Promise((resolve) => server.close(resolve)); db.close() },
  }
  return app
}

/** 出口装配实跑（假出口入参读面——`buildChatExit` 直驱：`chatImpl` = 记录 provider 配置）。 */
async function exitCall(db, { ref, reasoning = null, log = null } = {}) {
  const seen = []
  const exit = await CHAT.buildChatExit({ db, ref, reasoning, log, chatImpl: async (provider) => { seen.push(provider); return { content: "ok", toolCalls: [] } } })
  await exit({ messages: [], tools: [] })
  return seen[0]
}

// ── ① 源面 ∥ ④ 缺核退化 ────────────────────────────────────────────────────────

test("① 源在册：GET providers 行 `modelReasoning` 稀疏图（有档登键 ∥ 无档零键 ∥ 键 = 上游真名）∥ `deriveModels` 行携 `reasoning`", async () => {
  const app = await startApp()
  try {
    const res = await call(app.base, "GET", "/api/admin/providers", { cookie: app.cookie })
    assert.equal(res.status, 200)
    const row = res.json.providers[0]
    assert.deepEqual(row.modelReasoning, { [UPSTREAM]: ["low", "high", "max"] }, "有档登键 ∥ 无档（plain-model）零键")
    assert.deepEqual(Object.keys(row.modelReasoning), [UPSTREAM], `键 = 上游真名（别名 ${ALIAS} 零键）`)
    // 行造面（控制台 `deriveModels` 同源消费——核行非恒空）
    const MODELS = await load("thincoder-server/public/views-models.mjs")
    const rows = MODELS.deriveModels(res.json.providers)
    assert.deepEqual(rows.find((item) => item.id === ALIAS).reasoning, ["low", "high", "max"], "别名行 ⇒ 上游枚举（id = 别名 ∥ 档位 = 上游真名查询面）")
    assert.deepEqual(rows.find((item) => item.id === `fake/${PLAIN}`).reasoning, [], "无档行 ⇒ `[]`（控制台零二次改写——核无档面）")
    // 响应缺档图（旧面兼容——未携 `modelReasoning` ⇒ `[]`）
    assert.deepEqual(MODELS.deriveModels([{ name: "p", models: ["m"] }])[0].reasoning, [])
  } finally {
    await app.close()
  }
})

test("① 缺核退化：GET 不 5xx（`modelReasoning = {}` + 一条警告——档位面退中性，回合不阻断）", async () => {
  LEVELS.setReasoningLevelsDeps({}) // 复位注入（警告旗随复位——本测试自持首条）
  const warns = []
  const app = await startApp({ specLookup: throwingSpecLookup, log: { info() {}, warn: (evt, payload) => warns.push({ evt, payload }) } })
  try {
    const res = await call(app.base, "GET", "/api/admin/providers", { cookie: app.cookie })
    assert.equal(res.status, 200, "缺核 ⇒ 不 5xx（档位面退中性）")
    assert.deepEqual(res.json.providers[0].modelReasoning, {}, "缺核 ⇒ 空图")
    assert.deepEqual(warns.map((item) => item.evt), ["reasoning_levels_core_missing"], "一条警告（模块级旗——一进程一条）")
    assert.ok(String(warns[0].payload.message).includes("@thincoder/core"), "警告携缺核人话")
    assert.ok(String(warns[0].payload.cause).includes("模拟缺核"), "警告携真因（免误诊）")
    // 装配面同判：缺核 ⇒ 零字段（回合不阻断——不抛）；模块级注入同注（免依赖环境：真核在盘时本腿恒真）
    LEVELS.setReasoningLevelsDeps({ specLookup: throwingSpecLookup })
    const provider = await exitCall(app.db, { ref: ALIAS, reasoning: "high" })
    assert.equal("reasoningEffort" in provider, false, "缺核 ⇒ 装配零字段")
  } finally {
    await app.close()
    LEVELS.setReasoningLevelsDeps({})
  }
})

// ── ② N71 设档 ∥ 三面行形 ∥ 装配携值 ──────────────────────────────────────────

test("N71 设档生效：PATCH `{ reasoning }` ⇒ 200 落库 + 回执携值 ∥ 列表/详情同源行形 ∥ 装配携 `reasoningEffort`", async () => {
  LEVELS.setReasoningLevelsDeps({ specLookup: fakeSpecLookup })
  const app = await startApp()
  try {
    const chat = await app.newChat(ALIAS) // 别名 ⇒ 上游真名解（KD-SV-59）
    assert.equal(chat.reasoning, null, "建会话 ⇒ `reasoning: null`（未设）")
    assert.equal(app.chats()[0].reasoning, null, "库列缺省 NULL")

    const res = await app.patch(chat.id, { reasoning: "high" })
    assert.equal(res.status, 200, res.text)
    assert.deepEqual(res.json.chat, { id: chat.id, model: ALIAS, reasoning: "high", status: "idle", createdAt: chat.createdAt, updatedAt: res.json.chat.updatedAt }, "回执行形（行形同建会话 + `reasoning`）")
    assert.equal(app.chats()[0].reasoning, "high", "库列落值")

    const list = await call(app.base, "GET", "/api/admin/agent/chats", { cookie: app.cookie })
    assert.equal(list.json.chats[0].reasoning, "high", "列表行携值（`chatView` 同源）")
    const detail = await call(app.base, "GET", `/api/admin/agent/chats/${chat.id}`, { cookie: app.cookie })
    assert.equal(detail.json.chat.reasoning, "high", "详情行携值（同源）")

    const provider = await exitCall(app.db, { ref: ALIAS, reasoning: "high" })
    assert.equal(provider.model, UPSTREAM, "装配 = 上游真名（别名反查 KD-SV-59）")
    assert.equal(provider.reasoningEffort, "high", "值 ∈ 当刻模型枚举 ⇒ provider 配置携 `reasoningEffort`")
  } finally {
    await app.close()
    LEVELS.setReasoningLevelsDeps({})
  }
})

test("E54 非法拒：表外值 ∥ 空串 ∥ 非串 ∥ 同携 `model` ∥ 缺核 ⇒ 逐形 400 人话 + 库零变", async () => {
  LEVELS.setReasoningLevelsDeps({ specLookup: fakeSpecLookup })
  const app = await startApp()
  try {
    const chat = await app.newChat(ALIAS)
    assert.equal((await app.patch(chat.id, { reasoning: "high" })).status, 200, "前置：先落一档（库零变判据锚）")

    const outside = await app.patch(chat.id, { reasoning: "ultra" })
    assert.deepEqual([outside.status, outside.json.error.code], [400, "invalid_request_error"], "表外值 ⇒ 400")
    assert.match(outside.json.error.message, /不在当前模型枚举内/, "人话（含模型名）")
    const empty = await app.patch(chat.id, { reasoning: "" })
    assert.equal(empty.status, 400, "空串 ∉ 枚举 ⇒ 400（写面不收中性档字面）")
    const nonString = await app.patch(chat.id, { reasoning: 5 })
    assert.deepEqual([nonString.status, nonString.json.error.code], [400, "invalid_request_error"], "非串 ⇒ 400")
    assert.match(nonString.json.error.message, /须为字符串或 null/)
    const both = await app.patch(chat.id, { model: PLAIN_REF, reasoning: "high" })
    assert.equal(both.status, 400, "同携 ⇒ 400（一次一件）")
    assert.match(both.json.error.message, /一次一件/)
    const blank = await app.patch(chat.id, {})
    assert.equal(blank.status, 400, "空体 ⇒ 400（会话设置面：须携一件）")

    assert.equal(app.chats()[0].model, ALIAS, "库零变（模型）")
    assert.equal(app.chats()[0].reasoning, "high", "库零变（档位——仍 = 前置值）")

    // 缺核 ⇒ 400 人话（值域源不可用——fail-closed）
    LEVELS.setReasoningLevelsDeps({ specLookup: throwingSpecLookup })
    const missing = await app.patch(chat.id, { reasoning: "low" })
    assert.deepEqual([missing.status, missing.json.error.code], [400, "invalid_request_error"], "缺核 ⇒ 400")
    assert.match(missing.json.error.message, /值域源不可用/, "人话 = 缺核（缺 @thincoder/core）")
    assert.equal(app.chats()[0].reasoning, "high", "缺核 400 ⇒ 库零变")

    // 判权沿用（`user` ⇒ 403——requireAdmin 全族）
    assert.equal((await app.patch(chat.id, { reasoning: "low" }, { cookie: app.cookieUser })).status, 403, "user ⇒ 403")
    assert.equal((await app.patch(9999, { reasoning: "low" })).status, 404, "不存在 ⇒ 404")
  } finally {
    await app.close()
    LEVELS.setReasoningLevelsDeps({})
  }
})

// ── ④ B69 默认静默 ∥ 表外容忍 ∥ 换模型清档 ∥ v16 结构 ──────────────────────────

test("B69 默认静默：未设 ⇒ 出口零 `reasoningEffort` 键 ∥ 表外存量 ⇒ 零字段（读侧容忍）∥ 换模型 ⇒ 档位清 NULL", async () => {
  LEVELS.setReasoningLevelsDeps({ specLookup: fakeSpecLookup })
  const app = await startApp()
  try {
    const chat = await app.newChat(ALIAS)
    const unset = await exitCall(app.db, { ref: ALIAS, reasoning: null })
    assert.equal("reasoningEffort" in unset, false, "未设 ⇒ 零字段（与今日行为逐字同）")

    app.db.prepare("UPDATE agent_chats SET reasoning = ? WHERE id = ?").run("legacy-level", chat.id) // 表外存量（规格表演进面）
    const stale = await exitCall(app.db, { ref: ALIAS, reasoning: "legacy-level" })
    assert.equal("reasoningEffort" in stale, false, "表外 ⇒ 零字段（不炸不改行——读侧容忍）")

    assert.equal((await app.patch(chat.id, { reasoning: "high" })).status, 200)
    const switched = await app.patch(chat.id, { model: PLAIN_REF })
    assert.deepEqual([switched.status, switched.json.chat.model, switched.json.chat.reasoning], [200, PLAIN_REF, null], "换模型 ⇒ 回执 `reasoning: null`（换模型回中性——口径②）")
    assert.equal(app.chats()[0].reasoning, null, "换模型随写清 NULL（同一写）")
    assert.equal(app.chats()[0].model, PLAIN_REF)
  } finally {
    await app.close()
    LEVELS.setReasoningLevelsDeps({})
  }
})

test("④ v16 零迁移：空库直落 16 ∥ v15 库升 16 ∥ 幂等 ∥ 列面六列（尾插）∥ 存量行 NULL 零变 ∥ 存量其余列保形", () => {
  const fresh = DB.openDatabase(":memory:")
  try {
    assert.deepEqual([DB.SCHEMA_VERSION, DB.readVersion(fresh)], [17, 17], "空库直落 17")
    const cols = fresh.prepare("SELECT name FROM pragma_table_info('agent_chats') ORDER BY cid").all().map((row) => row.name)
    assert.deepEqual(cols, ["id", "model", "status", "created_by", "created_at", "updated_at", "reasoning"], "列面六列 + `reasoning` 尾插（加列——表不重建）")
  } finally {
    fresh.close()
  }
  // v15 存量库（历史夹具——迁移起点保持 15）
  const file = join(mkdtempSync(join(tmpdir(), "tc-levels-mig-")), "gateway.db")
  const legacy = DB.openDatabase(file, { migrations: DB.MIGRATIONS.filter((step) => step.v <= 15) })
  assert.equal(DB.readVersion(legacy), 15, "夹具 = v15 库（起点）")
  const legacyRow = { model: ALIAS, status: "idle", created_by: null, created_at: "2026-10-01T00:00:00.000Z", updated_at: "2026-10-01T00:00:00.000Z" }
  legacy.prepare("INSERT INTO agent_chats (model, status, created_by, created_at, updated_at) VALUES (?,?,?,?,?)")
    .run(legacyRow.model, legacyRow.status, legacyRow.created_by, legacyRow.created_at, legacyRow.updated_at)
  legacy.close()

  const db = DB.openDatabase(file)
  try {
    assert.equal(DB.readVersion(db), 16, "v15 库升后读数 16")
    const row = db.prepare("SELECT * FROM agent_chats WHERE id = 1").get()
    assert.equal(row.reasoning, null, "存量行 `reasoning IS NULL`（零回填 ∥ 零改写）")
    assert.deepEqual(
      { model: row.model, status: row.status, created_by: row.created_by, created_at: row.created_at, updated_at: row.updated_at },
      legacyRow,
      "存量其余列逐值保形",
    )
  } finally {
    db.close()
  }
  const again = DB.openDatabase(file)
  try {
    assert.equal(DB.readVersion(again), 16, "v16 段幂等（再开零变）")
    assert.equal(again.prepare("SELECT reasoning FROM agent_chats WHERE id = 1").get().reasoning, null, "再开读数零变")
  } finally {
    again.close()
  }
})

// ── ③ 界面腿（结构）──────────────────────────────────────────────────────────

test("③ 界面腿：`style.css` 五钮收窄（`#reasoning-btn` 出列）∥ 适配层接线（映射/真档位/prefs）∥ 键面零新键 ∥ 核件取件面零新增", () => {
  const css = readPublic("style.css")
  const narrow = css.split("\n").find((line) => line.includes("display: none") && line.includes("#auto-btn")) ?? ""
  for (const id of ["#auto-btn", "#advisor-btn", "#eng-btn", "#plan-btn", "#settings-btn"]) assert.ok(narrow.includes(id), `无源钮收窄缺位：${id}`)
  assert.equal(narrow.includes("#reasoning-btn"), false, "档位钮出列（解隐藏——KD-SV-111）")
  assert.equal(css.includes("#reasoning-btn, "), false, "零收窄残留（合并行形）")

  const composer = readPublic("views-chat-composer.mjs")
  assert.ok(composer.includes('if (type === "selectReasoning")'), "注入口桥映射（`selectReasoning` ⇒ PATCH）在册")
  assert.ok(composer.includes("reasoning: row.reasoning ?? []"), "核行携真档位（恒空面退役）")
  assert.ok(composer.includes("reasoning: chat?.reasoning ?? null"), "`prefs.reasoning` = 当刻会话档位")
  assert.ok(readPublic("views-chat.mjs").includes("onSelectReasoning"), "装配面注入在册")

  const zhCore = readPublic("i18n-zh-core.mjs")
  for (const key of ["model.noReasoning", "model.noReasoningDesc", "model.reasoning", "reasoning.high", "reasoning.off"]) {
    assert.ok(zhCore.includes(`"${key}"`), `核件词面键在册（零新键）：${key}`)
  }
  const viewSrc = readPublic("views-chat.mjs")
  const composerSrc = readPublic("views-chat-composer.mjs")
  const coreImports = [...new Set([...viewSrc.matchAll(/from "(\/rc\/[^"]+)"/g), ...composerSrc.matchAll(/from "(\/rc\/[^"]+)"/g)].map((match) => match[1]))]
  assert.deepEqual(coreImports.filter((spec) => !["/rc/flow/block.mjs", "/rc/flow/tool-card.mjs", "/rc/flow/stream.mjs", "/rc/scroll.mjs", "/rc/i18n.mjs", "/rc/lib.mjs", "/rc/composer/panel.mjs", "/rc/composer/slash.mjs", "/rc/flow/queued-mark.mjs", "/rc/toast.mjs"].includes(spec)), [], "核件取件面零新增")
})

// ── 壳面（假 DOM + 核件真跑）──────────────────────────────────────────────────

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" }
const decode = (text) => text.replace(/&(?:amp|lt|gt|quot|#39);/g, (match) => ENTITIES[match])

function parseFragment(html) {
  const out = []
  const stack = [{ node: null }]
  const childrenOf = (frame) => (frame.node === null ? out : frame.node.children)
  const attach = (node) => {
    const frame = stack.at(-1)
    childrenOf(frame).push(node)
    if (frame.node !== null) node.parent = frame.node
  }
  const pushText = (chunk) => {
    const text = decode(chunk)
    if (text.trim() === "") return
    const node = makeNode("#text")
    node.textContent = text
    attach(node)
  }
  const re = /<\/?([a-z0-9]+)((?:\s+[\w-]+="[^"]*")*)\s*\/?>/gi
  let last = 0
  let match
  while ((match = re.exec(html)) !== null) {
    pushText(html.slice(last, match.index))
    last = re.lastIndex
    const tag = match[1].toLowerCase()
    if (match[0].startsWith("</")) { if (stack.length > 1) stack.pop(); continue }
    const node = makeNode(tag)
    const cls = /\bclass="([^"]*)"/.exec(match[2] ?? "")
    if (cls !== null) node.className = cls[1]
    const id = /\bid="([^"]*)"/.exec(match[2] ?? "")
    if (id !== null) node.setAttribute("id", id[1])
    attach(node)
    if (!match[0].endsWith("/>") && !["br", "img", "hr", "input"].includes(tag)) stack.push({ node })
  }
  pushText(html.slice(last))
  return out
}

const walk = (node, out = []) => { for (const child of node.children ?? []) { if (child && typeof child === "object") { out.push(child); walk(child, out) } } return out }

function makeNode(tag) {
  let text = ""
  const node = {
    tag, children: [], listeners: {}, attrs: {}, parent: null, style: {}, dataset: {},
    open: false, value: "", hidden: false, disabled: false, readOnly: false, placeholder: "",
    scrollTop: 0, scrollHeight: 0, clientHeight: 0, selectionStart: 0, selectionEnd: 0, isConnected: true,
    get innerHTML() { return this._html ?? "" },
    set innerHTML(value) { this._html = String(value); this.children = []; for (const child of parseFragment(this._html)) { child.parent = this; this.children.push(child) } },
    get textContent() { return node.children.length > 0 ? node.children.map((child) => (typeof child === "string" ? child : (child.textContent ?? ""))).join("") : text },
    set textContent(value) { text = String(value); node.children = [] },
    get firstChild() { return this.children[0] ?? null },
    get childNodes() { return [...this.children] },
    get ownerDocument() { return globalThis.document },
    get nextSibling() { const siblings = this.parent?.children ?? []; return siblings[siblings.indexOf(this) + 1] ?? null },
  }
  const classes = new Set()
  Object.defineProperty(node, "className", {
    get: () => [...classes].join(" "),
    set: (value) => { classes.clear(); for (const token of String(value).split(/\s+/)) if (token) classes.add(token) },
  })
  node.classList = {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    contains: (name) => classes.has(name),
    toggle: (name) => { if (classes.has(name)) { classes.delete(name); return false } classes.add(name); return true },
  }
  node.append = (...items) => { for (const item of items.flat(Infinity)) { if (item === null || item === undefined || item === false) continue; if (typeof item === "object") item.parent = node; node.children.push(item) } }
  node.appendChild = (item) => { node.append(item); return item }
  node.replaceChildren = (...items) => { node.children = []; node.append(...items) }
  node.removeChild = (item) => { node.children = node.children.filter((child) => child !== item); return item }
  node.querySelector = (selector) => walk(node).find((child) => matches(child, selector)) ?? null
  node.querySelectorAll = (selector) => walk(node).filter((child) => matches(child, selector))
  node.matches = (selector) => matches(node, selector)
  node.closest = (selector) => { let current = node; while (current) { if (matches(current, selector)) return current; current = current.parent } return null }
  node.addEventListener = (type, fn) => { (node.listeners[type] ??= []).push(fn) }
  node.removeEventListener = (type, fn) => { node.listeners[type] = (node.listeners[type] ?? []).filter((item) => item !== fn) }
  node.setAttribute = (name, value) => { node.attrs[name] = String(value) }
  node.getAttribute = (name) => node.attrs[name] ?? null
  node.removeAttribute = (name) => { delete node.attrs[name] }
  node.remove = () => { if (node.parent !== null) node.parent.children = node.parent.children.filter((child) => child !== node); node.parent = null }
  node.focus = () => {}
  node.setSelectionRange = () => {}
  node.scrollIntoView = () => {}
  node.fire = (type, event = {}) => {
    const target = { target: node, preventDefault() {}, stopPropagation() {}, ...event }
    return Promise.all((node.listeners[type] ?? []).map((fn) => fn(target)))
  }
  node.showModal = () => { node.open = true }
  node.close = () => { node.open = false; for (const fn of node.listeners.close ?? []) fn({}) }
  return node
}

/** 选择器面（`.a` ∥ `.a.b` ∥ `tag` ∥ `tag.class` ∥ `#id`）。 */
function matches(node, selector) {
  if (typeof node === "string") return false
  const head = selector.replace(/\[[^\]]*\]$/, "")
  if (head.startsWith("#")) return node.attrs?.id === head.slice(1) || node.id === head.slice(1)
  if (head.startsWith(".")) return head.slice(1).split(".").every((name) => node.classList?.contains(name) === true)
  const tagMatch = /^([a-z]+)((?:\.\w+)*)$/.exec(head)
  if (tagMatch === null) return false
  if (node.tag !== tagMatch[1]) return false
  return tagMatch[2].split(".").filter(Boolean).every((name) => node.classList?.contains(name) === true)
}

function installDom() {
  const head = makeNode("head")
  const body = makeNode("body")
  const html = makeNode("html")
  const document = {
    head, body, scrollingElement: html,
    createElement: (tag) => makeNode(tag),
    createTextNode: (text) => { const node = makeNode("#text"); node.textContent = String(text); return node },
    getElementById: (id) => [head, body, html].map((node) => node.querySelector(`#${id}`)).find((hit) => hit !== null) ?? null,
    querySelector: (selector) => [head, body, html].map((node) => node.querySelector(selector)).find((hit) => hit !== null) ?? null,
    querySelectorAll: (selector) => [head, body, html].flatMap((node) => node.querySelectorAll(selector)),
    addEventListener: (type, fn) => { (document._listeners ??= {}); (document._listeners[type] ??= []).push(fn) },
    removeEventListener: () => {},
  }
  globalThis.document = document
  globalThis.window = { innerWidth: 1200, innerHeight: 800, addEventListener() {}, removeEventListener() {}, document }
  return { document, head, body, html, mount: makeNode("main") }
}

/** `h`（app.mjs 语义近似——class ∥ text ∥ on* ∥ 受控属性 ∥ 子节点）。 */
function fH(tag, props = {}, ...children) {
  const node = makeNode(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue
    if (key === "class") node.className = value
    else if (key === "text") node.textContent = String(value)
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value)
    else if (["value", "checked", "disabled", "hidden"].includes(key)) node[key] = value
    else node.setAttribute(key, value)
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue
    node.append(typeof child === "object" ? child : String(child))
  }
  return node
}

/** 核件词面装订 + 组合件（`createChatComposer` 直组——核面板真跑）。 */
async function bootComposer({ current, providers, onSelectReasoning = async () => true, mount = null }) {
  const COMPOSER = await load("thincoder-server/public/views-chat-composer.mjs")
  const root = mount ?? installDom().mount
  const composer = COMPOSER.createChatComposer({ h: fH }, {
    root,
    currentChat: () => (typeof current === "function" ? current() : current),
    onProviders: async () => providers,
    onSend: async () => ({ accepted: true, ended: true }),
    onAbort: () => {},
    onSelectModel: async () => true,
    onSelectReasoning,
    onEcho: () => null,
    onNewChat: () => true,
    onHelp: () => true,
  })
  await composer.refreshModels()
  return { composer, root }
}

/** 推理下拉取面（核件建件——`.dropdown-item` 逐档 + 说明行）。 */
const reasoningItems = (root) => (root.querySelector("#reasoning-dropdown")?.querySelectorAll(".dropdown-item") ?? [])

test("B70 壳面：无档模型中性能辨（`reasoning.off` + 「不支持推理」+ 零写出）∥ 未设 ⇒ 中性 `—` ∥ 已设 ⇒ 核字面", async () => {
  CORE_I18N.setStrings(ZH_CORE_MOD.ZH_CORE)
  const providers = { providers: [{ name: "fake", models: [{ name: UPSTREAM, alias: ALIAS }, PLAIN], modelReasoning: { [UPSTREAM]: ENUMS[UPSTREAM] } }] }
  let chat = { id: 1, model: ALIAS, reasoning: "high" }
  const picks = []
  const { composer, root } = await bootComposer({ current: () => chat, providers, onSelectReasoning: async (value) => { picks.push(value); return true } })
  const btn = root.querySelector("#reasoning-btn")
  assert.notEqual(btn.style.display, "none", "档位钮解隐藏（核面板面——收窄行已出列）")
  assert.equal(btn.textContent, "高", "已设档 ⇒ 钮字 = 核词面 `reasoning.high`（推送回读）")

  chat = { id: 1, model: ALIAS, reasoning: null }
  composer.syncModel()
  assert.equal(btn.textContent, "—", "未设 ⇒ 中性面 `—`（口径②默认静默——零假档）")

  chat = { id: 1, model: PLAIN_REF, reasoning: null }
  composer.syncModel()
  assert.equal(btn.textContent, "关闭", "无档模型 ⇒ `reasoning.off`（核哨兵档逐字）")
  await btn.fire("click")
  assert.ok(root.querySelector("#reasoning-dropdown").textContent.includes("不支持推理"), "菜单 = 核件哨兵（「不支持推理」）")
  assert.equal(reasoningItems(root).length, 1, "无档 ⇒ 零可选（仅说明行）")
  await reasoningItems(root)[0].fire("click")
  assert.deepEqual(picks, [], "无档面 ⇒ 零 `selectReasoning`（零写出）")
})

test("N72/E55/B70 页级实驱动：点选 ⇒ PATCH 恰一条 ∥ 切会话 ⇒ 推送回读（各自记住）∥ 写失败 ⇒ 就地人话 + 钮面重派生 ∥ 连写串行 ∥ 回执卫", async () => {
  const dom = installDom()
  CORE_I18N.setStrings(ZH_CORE_MOD.ZH_CORE)
  const CHAT_VIEW = await load("thincoder-server/public/views-chat.mjs")
  const failures = []
  const patches = []
  let failPATCH = false
  let holdPATCH = false
  let release = null
  const chats = [
    { id: 1, model: ALIAS, reasoning: "low", status: "idle", updatedAt: "2026-10-12T00:00:00.000Z", excerpt: "甲" },
    { id: 2, model: ALIAS, reasoning: null, status: "idle", updatedAt: "2026-10-12T00:00:00.000Z", excerpt: "乙" },
  ]
  const ctx = {
    h: fH, fmtTs: String,
    api: async (path, options = {}) => {
      if (options.method === "PATCH") {
        patches.push({ path, body: options.body })
        if (holdPATCH) await new Promise((resolve) => { release = resolve }) // 在飞（链式串行判据：未落地）
        if (failPATCH) {
          const error = new Error("思考档位不在当前模型枚举内：zzz（模型 fast）——库零变")
          error.status = 400
          throw error
        }
        const id = Number(path.split("/").pop())
        const chat = chats.find((item) => item.id === id)
        chat.reasoning = options.body.reasoning ?? null
        if (options.body.model !== undefined) chat.model = options.body.model
        return { chat: { ...chat } }
      }
      if (path === "/api/admin/providers") return { providers: [{ name: "fake", models: [{ name: UPSTREAM, alias: ALIAS }], modelReasoning: { [UPSTREAM]: ENUMS[UPSTREAM] } }] }
      if (path === "/api/admin/agent/chats") return { chats }
      const id = Number(path.split("/").pop())
      return { chat: { ...(chats.find((item) => item.id === id) ?? chats[0]) }, messages: [] }
    },
    fail: (error) => failures.push(error), flash: () => {},
  }
  await CHAT_VIEW.renderChat(ctx, dom.mount)
  await tick()
  const btn = dom.mount.querySelector("#reasoning-btn")
  assert.equal(btn.textContent, "低", "进页 = 当刻会话（倒序首行）档位（推送回读）")

  // 切会话（选择器 change ⇒ `selectChat` ⇒ 详情重读 ⇒ 推送回读——各自记住）
  const selector = dom.mount.querySelector(".chat-select")
  selector.value = "2"
  await selector.fire("change")
  await tick()
  assert.equal(btn.textContent, "—", "切到未设档会话 ⇒ 中性 `—`")
  selector.value = "1"
  await selector.fire("change")
  await tick()
  assert.equal(btn.textContent, "低", "切回 ⇒ 档位各自记住")

  // 点选（核推理菜单拾取 ⇒ `selectReasoning` 出站 ⇒ PATCH 恰一条 + 推送回读）
  await btn.fire("click")
  const dropdown = dom.mount.querySelector("#reasoning-dropdown")
  assert.notEqual(dropdown.style.display, "none", "下拉在场（钮可开——解隐藏生效）")
  const highItem = reasoningItems(dom.mount).find((item) => item.textContent.includes("高"))
  assert.ok(highItem, "档位行在场（核件枚举逐档）")
  await highItem.fire("click")
  await tick()
  assert.equal(patches.length, 1, "点选 ⇒ PATCH 恰一条")
  assert.deepEqual([patches[0].path, patches[0].body], ["/api/admin/agent/chats/1", { reasoning: "high" }], "载荷 = `{ reasoning }`（会话设置面）")
  assert.equal(btn.textContent, "高", "回执落地 ⇒ 钮字随值（推送回读）")
  assert.deepEqual(failures, [], "成功径零就地人话")

  // E55 写失败 ⇒ 就地人话 + 钮面重派生（回当刻会话档位）
  failPATCH = true
  await btn.fire("click")
  const maxItem = reasoningItems(dom.mount).find((item) => item.textContent.includes("最大"))
  await maxItem.fire("click")
  await tick()
  assert.equal(patches.length, 2, "失败径照发一条（零重试）")
  assert.equal(failures.length, 1, "写失败 ⇒ 就地人话（`ctx.fail`）")
  assert.match(failures[0].message, /不在当前模型枚举内/, "人话 = 服务端报文直呈")
  assert.equal(btn.textContent, "高", "钮面重派生 = 当刻会话档位（旧值——乐观值零留影）")

  // 连写串行（单变量链——KD-SV-110）：首写在飞 ⇒ 次写不发（按序落地；`onSend` 发送前 await 尾）
  failPATCH = false
  holdPATCH = true
  await btn.fire("click")
  await reasoningItems(dom.mount).find((item) => item.textContent.includes("最大")).fire("click")
  await tick(2)
  assert.equal(patches.length, 3, "首写已发且在飞（未落地）")
  await btn.fire("click")
  await reasoningItems(dom.mount).find((item) => item.textContent.includes("低")).fire("click")
  await tick(2)
  assert.equal(patches.length, 3, "次写在链上等尾（零并发发——单变量串行）")
  release()
  holdPATCH = false
  await tick()
  assert.deepEqual(patches.slice(2).map((item) => item.body.reasoning), ["max", "low"], "链尾落地：按拾取序逐条")
  assert.equal(btn.textContent, "低", "末写获胜（按序——显示面随落地）")

  // 回执卫（竞态收面——评审 🟡 收正）：写回执仅落当刻会话——切走后回执零落（不套到新会话详上）
  const before = patches.length
  holdPATCH = true
  await btn.fire("click")
  await reasoningItems(dom.mount).find((item) => item.textContent.includes("最大")).fire("click")
  await tick(2)
  assert.equal(patches.length, before + 1, "会话 1 的在飞写（未落地）")
  selector.value = "2"
  await selector.fire("change")
  await tick()
  assert.equal(btn.textContent, "—", "切到会话 2 ⇒ 中性（未设档）")
  release()
  holdPATCH = false
  await tick()
  assert.equal(chats[0].reasoning, "max", "写已落库（会话 1——服务端面零变）")
  assert.equal(btn.textContent, "—", "回执零落（会话 2 钮面不被会话 1 回执套写）")
})
