// 批内单元测试档（用后即删——§5 留读数行；零留存）
// 断言 = §2 ④ 判据 1（服务端 N40/E29）∥ 判据 2（核 N4/B4/E4）∥ 判据 3（三端结构源扫）∥ 判据 4（文案三串对拍）
//        ∥ 块 B（确认门：取消 ∥ 未确认 ⇒ 零请求零写盘）
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { createServer } from "node:http"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const load = (rel) => import(pathToFileURL(join(repoRoot, rel)).href)
const readRepo = (rel) => readFileSync(join(repoRoot, rel), "utf8")
const requireFromRepo = createRequire(pathToFileURL(join(repoRoot, "package.json")))

const CORE = await load("thincoder-core/team.mjs")
const CONFIG_IO = await load("thincoder-core/config-io.mjs")
const CORE_I18N = await load("thincoder-core/i18n.mjs")
const DB = await load("thincoder-server/src/store/db.mjs")
const SERVER = await load("thincoder-server/src/gateway/server.mjs")
const CLIENT_ROUTES = await load("thincoder-server/src/client/routes.mjs")
const GATEWAY_ROUTES = await load("thincoder-server/src/gateway/routes.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const KEYS = await load("thincoder-server/src/accounts/keys.mjs")
const CONFIG = await load("thincoder-server/src/ops/config.mjs")
const TEAM_CMD = await load("thincoder-cli/src/cli/team-command.mjs")
const DESKTOP_I18N = await load("thincoder-desktop/renderer/i18n-settings.mjs")

const PASSWORD = "password-123"
const tmpDir = mkdtempSync(join(tmpdir(), "trot-"))
after(() => rmSync(tmpDir, { recursive: true, force: true }))

// ── 真 server 面（内存库 + 真 HTTP——沿 N37/B27 同桩制） ──────────────────────
const db = DB.openDatabase(":memory:")
await MEMBERS.createMember(db, { username: "alice", role: "user", password: PASSWORD })
const routes = SERVER.createRouteTable()
CLIENT_ROUTES.registerClientRoutes(routes, { db })
GATEWAY_ROUTES.registerGatewayRoutes(routes, { db, config: CONFIG.validateConfig({ host: "127.0.0.1" }) })
const server = SERVER.createGatewayServer({ config: { trustProxy: false }, routes })
await new Promise((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve) })
const base = `http://127.0.0.1:${server.address().port}`
after(() => { server.closeAllConnections?.(); server.close(); db.close() })

async function login() {
  const res = await fetch(`${base}/api/client/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: "alice", password: PASSWORD, label: "cli@test" }),
  })
  assert.equal(res.status, 200)
  return (await res.json()).token
}
const auth = (token) => ({ authorization: `Bearer ${token}` })
const keyRows = (name) => db.prepare("SELECT status, name FROM api_keys WHERE name = ? ORDER BY id").all(name)
const auditRows = (type) => db.prepare("SELECT detail FROM audit_events WHERE type = ? ORDER BY id").all(type)

// ── 计数 HTTP 桩（确认门 ∥ 核面零请求断言用） ───────────────────────────────
const stubs = []
function startStub(reply) {
  const hits = []
  const stub = createServer((req, res) => {
    let body = ""
    req.on("data", (c) => { body += c })
    req.on("end", () => {
      hits.push({ method: req.method, url: req.url, headers: req.headers, body })
      const r = (typeof reply === "function" ? reply(req) : null) ?? { status: 200, body: { ok: true, token: "sk-tc-stub-new" } }
      res.writeHead(r.status, { "content-type": "application/json" })
      res.end(JSON.stringify(r.body))
    })
  })
  stubs.push(stub)
  return new Promise((resolve) => stub.listen(0, "127.0.0.1", () => resolve({ stub, hits, base: `http://127.0.0.1:${stub.address().port}` })))
}
after(() => { for (const s of stubs) { s.closeAllConnections?.(); s.close() } })

// ── 判据 1（服务端——N40/E29） ─────────────────────────────────────────────
test("N40 服务端：rotate ⇒ 200 {ok:true,token} ∥ 旧 token 下一请求 401 ∥ api_keys 双行（旧 revoked ∥ 新 active——名同）∥ 审计 key_rotate 单行 surface:client", async () => {
  const oldToken = await login()
  const res = await fetch(`${base}/api/client/rotate`, { method: "POST", headers: { ...auth(oldToken), "content-type": "application/json" }, body: "{}" })
  assert.equal(res.status, 200)
  const body = await res.json()
  assert.equal(body.ok, true)
  assert.ok(typeof body.token === "string" && body.token !== "", "新明文一次回显")
  assert.notEqual(body.token, oldToken, "新 token ≠ 旧 token")

  const me = await fetch(`${base}/api/client/me`, { headers: auth(oldToken) })
  assert.equal(me.status, 401, "旧 token /api/client/me 下一请求即 401")
  const models = await fetch(`${base}/v1/models`, { headers: auth(oldToken) })
  assert.equal(models.status, 401, "旧 token /v1/models 下一请求即 401")
  const meNew = await fetch(`${base}/api/client/me`, { headers: auth(body.token) })
  assert.equal(meNew.status, 200, "新 token 可用")

  const rows = keyRows("cli@test")
  assert.equal(rows.length, 2, "api_keys 双行（旧 + 新）")
  assert.equal(rows[0].status, "revoked")
  assert.equal(rows[1].status, "active")

  const rotateRows = auditRows("key_rotate")
  assert.equal(rotateRows.length, 1, "审计 key_rotate 单行")
  assert.equal(JSON.parse(rotateRows[0].detail).surface, "client")
})

test("E29 服务端：无 ∥ 无效 token ⇒ 401（零变更——审计零行）∥ 非 JSON 体 ⇒ 400", async () => {
  const keysBefore = db.prepare("SELECT COUNT(*) AS n FROM api_keys").get().n
  const auditsBefore = auditRows("key_rotate").length

  const noToken = await fetch(`${base}/api/client/rotate`, { method: "POST", headers: { "content-type": "application/json" }, body: "{}" })
  assert.equal(noToken.status, 401)
  const badToken = await fetch(`${base}/api/client/rotate`, { method: "POST", headers: { ...auth("sk-tc-bogus"), "content-type": "application/json" }, body: "{}" })
  assert.equal(badToken.status, 401)
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM api_keys").get().n, keysBefore, "库零变")
  assert.equal(auditRows("key_rotate").length, auditsBefore, "审计零行")

  const nonJson = await fetch(`${base}/api/client/rotate`, { method: "POST", headers: { ...auth(await login()), "content-type": "text/plain" }, body: "x" })
  assert.equal(nonJson.status, 400, "写端点 JSON 型门（分派层统一）")
})

// ── 判据 2（核——N4/B4/E4） ────────────────────────────────────────────────
test("N4 核：轮换成 ⇒ team.token 替换 + 派生条目 apiKey 同值（一次写盘）", async () => {
  const cfgPath = join(tmpDir, "n4-config.json")
  CONFIG_IO._setConfigPathForTest(cfgPath)
  const oldToken = await login()
  writeFileSync(cfgPath, JSON.stringify({
    team: { server: base, member: { username: "alice", name: "alice" }, label: "cli@test", token: oldToken },
    providers: [{ name: "team", baseURL: `${base}/v1`, apiKey: oldToken, derived: true }],
  }, null, 2) + "\n")

  const r = await CORE.teamRotate()
  assert.equal(r.ok, true, JSON.stringify(r))
  const cfg = JSON.parse(readFileSync(cfgPath, "utf8"))
  assert.notEqual(cfg.team.token, oldToken, "team.token = 新明文（替换）")
  assert.equal(cfg.providers[0].apiKey, cfg.team.token, "派生条目 apiKey 同值")
  assert.equal(cfg.team.label, "cli@test", "标签不动")
  CONFIG_IO._resetConfigPathForTest()
})

test("B4 核：派生条目缺失 ⇒ 仅落 token（零覆盖）∥ 未登录 ⇒ 兜底归类零请求", async () => {
  const stub = await startStub()
  const cfgPath = join(tmpDir, "b4-config.json")
  CONFIG_IO._setConfigPathForTest(cfgPath)
  writeFileSync(cfgPath, JSON.stringify({
    team: { server: stub.base, member: { username: "alice", name: "alice" }, label: "cli@test", token: "sk-tc-old" },
    providers: [{ name: "team", baseURL: "http://manual.example/v1", apiKey: "sk-manual" }],
  }, null, 2) + "\n")

  const r = await CORE.teamRotate()
  assert.equal(r.ok, true)
  const cfg = JSON.parse(readFileSync(cfgPath, "utf8"))
  assert.equal(cfg.team.token, "sk-tc-stub-new", "仅落 token")
  assert.equal(cfg.providers[0].apiKey, "sk-manual", "同名手工条目逐字零改（零覆盖）")

  const emptyPath = join(tmpDir, "b4-empty.json")
  CONFIG_IO._setConfigPathForTest(emptyPath)
  writeFileSync(emptyPath, "{}\n")
  const before = stub.hits.length
  const r2 = await CORE.teamRotate()
  assert.equal(r2.ok, false)
  assert.equal(r2.reason, "network", "未登录 ⇒ 兜底归类")
  assert.equal(stub.hits.length, before, "零请求旁路")
  assert.equal(readFileSync(emptyPath, "utf8"), "{}\n", "零写盘")
  CONFIG_IO._resetConfigPathForTest()
})

test("E4 核：网络败 ⇒ 零写盘 ∥ 401 ⇒ reason invalid 零写盘 ∥ 畸形档（数组根）⇒ 兜底 network 零请求 ∥ 写盘败（await 窗口内改档）⇒ write_failed", async () => {
  const cfgPath = join(tmpDir, "e4-config.json")
  CONFIG_IO._setConfigPathForTest(cfgPath)
  const writeCfg = (server, token) => writeFileSync(cfgPath, JSON.stringify({
    team: { server, member: { username: "alice", name: "alice" }, label: "cli@test", token },
    providers: [{ name: "team", baseURL: `${server}/v1`, apiKey: token, derived: true }],
  }, null, 2) + "\n")

  // 网络败（闭合端口）
  writeCfg("http://127.0.0.1:9", "sk-tc-old")
  const beforeNet = readFileSync(cfgPath, "utf8")
  const rNet = await CORE.teamRotate()
  assert.equal(rNet.reason, "network")
  assert.equal(readFileSync(cfgPath, "utf8"), beforeNet, "网络败 ⇒ 零写盘（旧 token 仍在场）")

  // 401 ⇒ invalid
  const stub401 = await startStub(() => ({ status: 401, body: { error: { code: "invalid_api_key" } } }))
  writeCfg(stub401.base, "sk-tc-dead")
  const before401 = readFileSync(cfgPath, "utf8")
  const r401 = await CORE.teamRotate()
  assert.equal(r401.reason, "invalid", JSON.stringify(r401))
  assert.equal(readFileSync(cfgPath, "utf8"), before401, "401 ⇒ 零写盘")
  assert.equal(stub401.hits.length, 1)

  // 畸形档（数组根）：`loadRaw` 归一为 `{}` ⇒ 无凭据 ⇒ 兜底归类 + 零请求。
  const stubOk = await startStub()
  writeFileSync(cfgPath, "[1,2]")
  const rWrite = await CORE.teamRotate()
  assert.equal(rWrite.reason, "network", "数组根 ⇒ loadRaw 归一 {} ⇒ 无凭据 ⇒ 兜底归类")
  assert.equal(stubOk.hits.length, 0, "零请求")

  // write_failed：写盘败（服务端已应答、本地拒写）——确定性注入 = 同进程桩处理器在**应答前**改写配置：
  // `await fetch` 窗口夹在 `loadConfig()`（读）与 `persistRaw`（写）之间 ⇒ 写时 raw 无 `team` 段 ⇒ mutate 抛
  // ⇒ `write_failed`（单线程 + 同步改写先于 `res.end` ⇒ 序确定，非碰运气）
  const stubMorph = await startStub(() => { writeFileSync(cfgPath, "{}\n") })
  writeCfg(stubMorph.base, "sk-tc-old")
  const rMorph = await CORE.teamRotate()
  assert.equal(rMorph.reason, "write_failed", "写盘败 ⇒ write_failed（拒写——零假成功）")
  assert.equal(stubMorph.hits.length, 1, "服务端已应答（败在本地写盘）")
  assert.equal(readFileSync(cfgPath, "utf8"), "{}\n", "拒写 ⇒ 零成功落盘（保桩改写后现场）")
  CONFIG_IO._resetConfigPathForTest()
})

// ── 判据 4（文案——三串三端逐字同拍） ──────────────────────────────────────
test("判据 4：确认句 ∥ 成句 ∥ 失效句 = VSC zh 键值 ∥ 桌面 i18n 键值 ∥ CLI 词面常量 ∥ 核字典键", () => {
  const zh = JSON.parse(readRepo("thincoder-vscode/locales/zh.json"))
  const en = JSON.parse(readRepo("thincoder-vscode/locales/en.json"))
  const dt = DESKTOP_I18N.SETTINGS_DICT
  const coreInvalid = CORE_I18N.CORE_MESSAGES["status.team.invalid"].zh

  const confirmText = TEAM_CMD.TEXT_ROTATE_CONFIRM
  const doneText = TEAM_CMD.TEXT_ROTATED
  const invalidText = TEAM_CMD.FAILURE_TEXT.invalid

  assert.equal(zh["settings.team.rotateConfirm"], confirmText, "VSC zh 确认句逐字")
  assert.equal(dt.zh["settings.team.rotateConfirm"], confirmText, "桌面 zh 确认句逐字")
  assert.equal(zh["settings.team.rotateDone"], doneText, "VSC zh 成句逐字")
  assert.equal(dt.zh["settings.team.rotateDone"], doneText, "桌面 zh 成句逐字")
  assert.equal(zh["settings.team.fail.invalid"], invalidText, "VSC zh 失效句逐字")
  assert.equal(dt.zh["settings.team.reason.invalid"], invalidText, "桌面 zh 失效句逐字")
  assert.equal(coreInvalid, invalidText, "核字典键 status.team.invalid zh 值同句")

  // 两语键集相等（VSC locales 纪律）——四个新键两表俱在
  for (const key of ["settings.team.rotate", "settings.team.rotateConfirm", "settings.team.rotateDone", "settings.team.fail.invalid"]) {
    assert.ok(Object.hasOwn(zh, key), `zh.json 缺 ${key}`)
    assert.ok(Object.hasOwn(en, key), `en.json 缺 ${key}`)
  }
  for (const key of ["settings.team.rotate", "settings.team.rotateConfirm", "settings.team.rotateDone", "settings.team.reason.invalid"]) {
    assert.ok(Object.hasOwn(dt.zh, key), `桌面 zh 缺 ${key}`)
    assert.ok(Object.hasOwn(dt.en, key), `桌面 en 缺 ${key}`)
  }
})

// ── 判据 3（三端注册/结构——源扫 + 真结构面） ──────────────────────────────
test("判据 3 CLI：team rotate（argv ∥ /team ∥ usage ∥ completions 词面）在册", () => {
  const cmd = readRepo("thincoder-cli/src/cli/team-command.mjs")
  assert.match(cmd, /sub === "rotate"/)
  assert.match(cmd, /Usage: thincoder team login \[--server <url>\] \[--user <name>\] \| thincoder team logout \| thincoder team rotate \| thincoder team status/)
  assert.match(cmd, /export const TEXT_ROTATE_CONFIRM/)
  assert.match(cmd, /export const TEXT_ROTATED/)

  const tui = readRepo("thincoder-cli/src/tui/cmd-team.mjs")
  assert.match(tui, /sub === "rotate"/)
  assert.match(tui, /async function runTeamRotate/)
  assert.match(tui, /Usage: \/team login \| \/team logout \| \/team rotate \| \/team status/)

  assert.match(readRepo("thincoder-cli/bin/thincoder.mjs"), /thincoder team rotate/)

  const comp = readRepo("thincoder-cli/src/completions.mjs")
  const rotateHits = comp.split("\n").filter((l) => l.includes("rotate")).length
  assert.equal(rotateHits, 4, "completions team 词面 rotate 四处（bash ∥ zsh ∥ fish 两处）")
})

test("判据 3 VSC：卡轮换控件 + teamRotate/teamRotateResult 消息链", () => {
  const card = readRepo("thincoder-vscode/webview/settings-team.js")
  assert.match(card, /t\("settings\.team\.rotate"\)/, "控件键精确形（非 rotateConfirm 带过）")
  assert.match(card, /window\._teamRotateStart/)
  assert.match(card, /window\._teamRotateConfirm/)
  assert.match(card, /window\._teamRotateCancel/)
  assert.match(card, /type: "teamRotate"/)
  assert.match(card, /export function onTeamRotateResult/)
  assert.match(card, /invalid: "settings\.team\.fail\.invalid"/)

  assert.match(readRepo("thincoder-vscode/src/extension/team.mjs"), /export function teamRotate\(\)/)
  assert.match(readRepo("thincoder-vscode/src/extension/panel-messages-settings.mjs"), /export async function handleTeamRotate/)
  assert.match(readRepo("thincoder-vscode/src/extension/panel-messages.mjs"), /case "teamRotate": await handleTeamRotate/)
  assert.match(readRepo("thincoder-vscode/webview/chat-messages.js"), /case "teamRotateResult": onTeamRotateResult/)
})

test("判据 3 桌面：段轮换控件 + team:rotate 通道（preload ∥ registry ∥ 白名单计数）", () => {
  const section = readRepo("thincoder-desktop/renderer/views/settings-sections-team.mjs")
  assert.match(section, /t\("settings\.team\.rotate"\)/, "控件键精确形（非 rotateConfirm 带过）")
  assert.match(section, /rotateControlNode/)
  assert.match(section, /onTeamRotateConfirm/)
  assert.match(section, /invalid: "settings\.team\.reason\.invalid"/)

  assert.match(readRepo("thincoder-desktop/renderer/views/settings.mjs"), /teamAdminBody\(model\.team, handlers\)/)
  assert.match(readRepo("thincoder-desktop/renderer/mount-team.mjs"), /team:rotate/)
  assert.match(readRepo("thincoder-desktop/renderer/mount-team.mjs"), /onTeamRotateConfirm/)
  assert.match(readRepo("thincoder-desktop/src/main/team.mjs"), /export function teamRotateChannel/)
  assert.match(readRepo("thincoder-desktop/src/main/ipc-registry.mjs"), /"team:rotate": teamRotateChannel/)

  const preload = requireFromRepo(join(repoRoot, "thincoder-desktop/src/preload/preload.cjs"))
  assert.equal(preload.CHANNELS.length, 69, "白名单计数（fork 并集面：上游 54 ∪ fork 增项 = 69——2026-10-24 合并批重锚）")
  assert.ok(preload.CHANNELS.includes("team:rotate"))
})

test("判据 3 服务端 ∥ 核结构：rotate 处理器在注册面 ∥ 核 teamRotate 在册 ∥ 档头句随正", () => {
  assert.match(readRepo("thincoder-server/src/client/routes.mjs"), /routes\.add\("POST", "\/api\/client\/rotate"/)
  assert.match(readRepo("thincoder-server/src/client/routes.mjs"), /login ∥ logout ∥ rotate ∥ me 四处理/)
  assert.match(readRepo("thincoder-core/team.mjs"), /export async function teamRotate\(\)/)
})

// ── 块 B（确认门——CLI argv 实走：取消 ∥ 确认） ────────────────────────────
function runCli(args, input, home) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [join(repoRoot, "thincoder-cli", "bin", "thincoder.mjs"), ...args], {
      cwd: join(repoRoot, "thincoder-cli"),
      env: { ...process.env, USERPROFILE: home, HOME: home },
      stdio: ["pipe", "pipe", "pipe"],
    })
    let out = ""
    let err = ""
    const timer = setTimeout(() => { child.kill(); resolve({ code: -1, out, err, timeout: true }) }, 60_000)
    child.stdout.on("data", (d) => { out += d })
    child.stderr.on("data", (d) => { err += d })
    child.on("close", (code) => { clearTimeout(timer); resolve({ code, out, err }) })
    child.stdin.end(input)
  })
}

function seedHome(serverBase, token) {
  const home = mkdtempSync(join(tmpDir, "home-"))
  mkdirSync(join(home, ".thincoder"), { recursive: true })
  const cfgPath = join(home, ".thincoder", "config.json")
  writeFileSync(cfgPath, JSON.stringify({
    team: { server: serverBase, member: { username: "alice", name: "alice" }, label: "cli@test", token },
    providers: [{ name: "team", baseURL: `${serverBase}/v1`, apiKey: token, derived: true }],
  }, null, 2) + "\n")
  return { home, cfgPath }
}

test("块 B 确认门：取消（非 y 应答）⇒ 零请求零写盘（逐字节）", async () => {
  const stub = await startStub()
  const { home, cfgPath } = seedHome(stub.base, "sk-tc-old")
  const before = readFileSync(cfgPath)
  const r = await runCli(["team", "rotate"], "n\n", home)
  assert.equal(r.timeout, undefined, `CLI 未退出：${r.err}`)
  assert.equal(r.code, 0, r.err)
  assert.equal(stub.hits.length, 0, "取消 ⇒ HTTP 桩零请求")
  assert.ok(readFileSync(cfgPath).equals(before), "取消 ⇒ 临时 config 逐字节零变")
  assert.match(r.err, /轮换将立即吊销当前登录 token/, "确认句 zh 直出")
  assert.ok(!r.out.includes("已轮换"), "零结果行")
})

test("块 B 确认门：EOF（无应答）⇒ 零请求零写盘", async () => {
  const stub = await startStub()
  const { home, cfgPath } = seedHome(stub.base, "sk-tc-old")
  const before = readFileSync(cfgPath)
  const r = await runCli(["team", "rotate"], "", home)
  assert.equal(r.code, 0, r.err)
  assert.equal(stub.hits.length, 0, "EOF ⇒ 零请求")
  assert.ok(readFileSync(cfgPath).equals(before), "EOF ⇒ 零写盘")
})

test("块 B 确认门：y ⇒ 恰一次 /api/client/rotate + 成句直出 + 新 token 落盘", async () => {
  const stub = await startStub()
  const { home, cfgPath } = seedHome(stub.base, "sk-tc-old")
  const r = await runCli(["team", "rotate"], "y\n", home)
  assert.equal(r.timeout, undefined, `CLI 未退出：${r.err}`)
  assert.equal(r.code, 0, r.err)
  assert.equal(stub.hits.length, 1, "恰一次请求")
  assert.match(stub.hits[0].url, /\/api\/client\/rotate$/)
  assert.equal(stub.hits[0].headers.authorization, "Bearer sk-tc-old")
  assert.match(r.out, /已轮换——本机已改用新 token/, "成句直出（结果行）")
  assert.equal(JSON.parse(readFileSync(cfgPath, "utf8")).team.token, "sk-tc-stub-new", "新 token 落盘")
})
