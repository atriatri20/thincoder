/**
 * 2026-10-12-admin-chat-creds-merge.test.mjs — thincoder-server 批内单测件（`admin-chat-creds-merge` 批 · 后台舱——主机表凭据面 ∥ `exec` 进 chat ∥ v18 迁移；
 * 名随批档 · 住 `docs/batches/` · 随批留存 · **不入任何发布门**（2026-10-12 用户裁——批内件零维护））。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-12-admin-chat-creds-merge.test.mjs`
 *
 * 射程（判据源 = 批档 §2 ∥ `docs/server/design/sandbox/SANDBOX.md` §12（N79–N82 ∥ B76–B78 ∥ E59/E60）∥ `docs/server/design/agent/ADMIN-AGENT.md` §8（N83 ∥ B79 ∥ E61））：
 *   ① v18 迁移三径（空库直落 18 ∥ v17 升 18 + 回填移交（后者胜）∥ 幂等 + 结构面）∥ ② 凭据两端点（N79 密封/零秘密/审计三键 ∥ E59 形非法四支库零变 ∥ E60 判权/404）
 *   ∥ ③ 撤销两径（N82——端点径一行 ∥ chat 径两行；再 `exec` ⇒ 工具级错误）∥ ④ `runnerByRef`（名 ∥ 地址 ∥ 歧义 ∥ 未在册）
 *   ∥ ⑤ `execOnHost`（假 ssh——退出码/掩蔽/私钥用毕即删/解密失败/超时）∥ ⑥ chat 一轮 `exec`（假模型 + 假 ssh——帧/审计 subject=命令原文/resultCode=退出码/截断位/零秘密四面）
 *   ∥ ⑦ B77/E61（未登记凭据 ∥ 歧义 ∥ 命令形 ∥ 超时值/上界——工具级错误且零 ssh 调用；界内透传）∥ ⑧ N81（托管接入 `keep` 成功 ⇒ 移交七列 + run 行 `'moved'`）∥ ⑨ i18n 两表键面 + 新档在场。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync, readFileSync } from "node:fs"
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
const SANDBOX = await load("thincoder-server/src/sandbox/routes.mjs")
const REGISTRY = await load("thincoder-server/src/sandbox/registry.mjs")
const HOSTS = await load("thincoder-server/src/sandbox/hosts.mjs")
const CRYPTO = await load("thincoder-server/src/store/credential-crypto.mjs")
const CHAT_TOOLS = await load("thincoder-server/src/agent/chat-tools.mjs")
const CHAT_ROUTES = await load("thincoder-server/src/agent/chat-routes.mjs")

const PASSWORD = "password-123"
const MODEL = "fake/fake-model"
const SECRET = "KEY-MATERIAL-9f3a"
const SUDO = "SUDO-SECRET-7b21"
const tempRoot = mkdtempSync(join(tmpdir(), "tc-creds-"))

// ── 假件（假 ssh ∥ 假模型 ∥ 假 Docker 读数）────────────────────────────────────

/** 假 ssh（`execImpl` 形——返回 `{ code, stdout, stderr, timedOut? }`；记调用）。 */
function makeFakeSsh(handler = () => ({})) {
  const calls = []
  const execImpl = async (cmd, args, opts = {}) => {
    const rec = { cmd, args, command: args[args.length - 1], env: opts.env ?? {}, input: opts.input ?? null, timeoutMs: opts.timeoutMs ?? null }
    calls.push(rec)
    const out = handler(rec.command, rec) ?? {}
    return { code: out.code ?? 0, stdout: out.stdout ?? "", stderr: out.stderr ?? "", ...(out.spawnError ? { spawnError: true } : {}), ...(out.timedOut ? { timedOut: true } : {}) }
  }
  return { execImpl, calls }
}

/** 假模型：脚本回合（每回合 = `{ content?, toolCalls? }`；用尽 ⇒ 恒用末回合）。 */
function scriptedChat(turns) {
  const state = { i: 0, schemas: null }
  const chat = async ({ tools }) => {
    state.schemas = tools
    const turn = turns[Math.min(state.i, turns.length - 1)]
    state.i += 1
    return typeof turn === "function" ? turn() : turn
  }
  return { chat, state }
}

const turnCall = (name, args, { content = "" } = {}) => ({ content, toolCalls: [{ id: `call-${name}-${Math.random().toString(16).slice(2, 8)}`, name, arguments: JSON.stringify(args) }] })

/** 假 Docker 读数（`/version` 两读——引导步 + 协商复读；`register` 工具面所需——客户端读 `text()`）。 */
const fakeDockerFetch = async () => {
  const body = { Version: "27.0.0", ApiVersion: "1.45", MinAPIVersion: "1.24", Os: "linux", Arch: "amd64", KernelVersion: "6.1.0" }
  return { ok: true, status: 200, json: async () => body, text: async () => JSON.stringify(body), arrayBuffer: async () => new TextEncoder().encode(JSON.stringify(body)).buffer }
}

// ── 进程内应用 ────────────────────────────────────────────────────────────────

async function call(base, method, path, { body, cookie } = {}) {
  const headers = { "content-type": "application/json" }
  if (cookie) headers.cookie = cookie
  const res = await fetch(base + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const text = await res.text()
  let json = null
  try {
    json = JSON.parse(text)
  } catch {
    /* 非 JSON（NDJSON 流）——以 text 判 */
  }
  return { status: res.status, text, json, setCookies: res.headers.getSetCookie?.() ?? [] }
}

/** 读 NDJSON 帧流。 */
async function readFrames(response) {
  const frames = []
  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })
    let index = buffer.indexOf("\n")
    while (index >= 0) {
      const line = buffer.slice(0, index).trim()
      buffer = buffer.slice(index + 1)
      if (line !== "") frames.push(JSON.parse(line))
      index = buffer.indexOf("\n")
    }
  }
  if (buffer.trim() !== "") frames.push(JSON.parse(buffer.trim()))
  return frames
}

function seedProvider(db, { name = "fake", models = ["fake-model"] } = {}) {
  const now = new Date().toISOString()
  db.prepare("INSERT INTO providers (name, base_url, api_key, models_json, created_at, updated_at) VALUES (?,?,?,?,?,?)").run(
    name, "http://127.0.0.1:9/v1", "sk-test", JSON.stringify(models), now, now,
  )
}

async function waitFor(fn, { timeoutMs = 3000, stepMs = 20 } = {}) {
  const deadline = Date.now() + timeoutMs
  for (;;) {
    const value = fn()
    if (value) return value
    if (Date.now() > deadline) throw new Error("waitFor 超时")
    await new Promise((resolve) => setTimeout(resolve, stepMs))
  }
}

/** 起应用（沙盒面 + 账号面 + chat 面；`ssh`/`turns` = 假件；`deps` 追加注入口）。 */
async function startApp({ ssh = makeFakeSsh(), turns = [], withChat = false, withProvider = false, deps = {} } = {}) {
  const dir = mkdtempSync(join(tempRoot, "app-"))
  const db = DB.openDatabase(":memory:")
  await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
  await MEMBERS.createMember(db, { username: "user", role: "user", password: PASSWORD })
  if (withChat || withProvider) seedProvider(db)
  const config = CONFIG.validateConfig({ host: "127.0.0.1", db: join(dir, "gateway.db") })
  const routes = SERVER.createRouteTable()
  const scripted = scriptedChat(turns)
  SANDBOX.registerSandboxRoutes(routes, { db, config, log: null, deps: { execImpl: ssh.execImpl, hasSshpass: async () => true, fetchImpl: fakeDockerFetch, chat: scripted.chat, ...deps } })
  ACCOUNT_ROUTES.registerAccountRoutes(routes, { db })
  if (withChat) {
    CHAT_ROUTES.registerChatRoutes(routes, {
      db,
      log: null,
      deps: { chat: scripted.chat, config, execImpl: ssh.execImpl, fetchImpl: fakeDockerFetch, ...deps },
    })
  }
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
  const app = {
    db, base, dir, config, ssh, scripted,
    keyPath: join(dir, "credentials.key"),
    adminCookie: await login("admin"),
    userCookie: await login("user"),
    runner: (id) => db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(Number(id)),
    audit: (kind = null) => db.prepare("SELECT * FROM audit_events ORDER BY id").all()
      .filter((row) => kind === null || JSON.parse(row.detail ?? "{}").kind === kind),
    messages: (chatId) => db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(Number(chatId)),
    createChat: async () => {
      const res = await call(app.base, "POST", "/api/admin/agent/chats", { cookie: app.adminCookie, body: { model: MODEL } })
      assert.equal(res.status, 200, `建会话应 200——实读 ${res.status}：${res.text}`)
      return res.json.chat
    },
    send: async (chatId, content) => {
      const res = await fetch(`${app.base}/api/admin/agent/chats/${chatId}/messages`, {
        method: "POST",
        headers: { "content-type": "application/json", cookie: app.adminCookie },
        body: JSON.stringify({ content }),
      })
      assert.equal(res.status, 200, `发消息应 200——实读 ${res.status}`)
      return readFrames(res)
    },
    async close() {
      server.closeAllConnections?.()
      await new Promise((resolve) => server.close(resolve))
    },
  }
  return app
}

// ── ① v18 迁移（B76 三径 + 结构面）──────────────────────────────────────────────

test("v18 迁移：空库直落 18 ∥ 七列 + 四态 CHECK ∥ v17 升 18 回填移交（后者胜/失败行不动/余行零伪造）∥ 幂等", () => {
  assert.ok(DB.SCHEMA_VERSION >= 18, "链尾段号 ≥ 18（本批落地 18；后续批递升——2026-10-13 父侧收正）")
  const empty = DB.openDatabase(":memory:")
  assert.ok(DB.readVersion(empty) >= 18, "空库直落 ≥ 18（同上）")
  const cols = empty.prepare("PRAGMA table_info(sandbox_runners)").all().map((row) => row.name)
  for (const name of ["ssh_port", "ssh_user", "auth_kind", "secret_cipher", "sudo_cipher", "credential_state", "credential_updated_at"]) {
    assert.ok(cols.includes(name), `主机表七列在场：${name}`)
  }
  assert.equal(empty.prepare("SELECT dflt_value v FROM pragma_table_info('sandbox_runners') WHERE name = 'credential_state'").get().v, "'none'")
  assert.doesNotThrow(() => empty.prepare("UPDATE sandbox_onboarding SET credential_state = 'moved' WHERE id = -1").run(), "四态 CHECK 收 'moved'")
  empty.prepare(`INSERT INTO sandbox_onboarding (id, host, ssh_port, ssh_user, auth_kind, credential_mode, credential_state, model, status, steps_json, created_at)
    VALUES (1, 'h', 22, 'u', 'key', 'keep', 'sealed', 'm', 'running', '[]', '2026-10-01T00:00:00.000Z')`).run()
  assert.doesNotThrow(() => empty.prepare("UPDATE sandbox_onboarding SET credential_state = 'moved' WHERE id = 1").run(), "四态 CHECK 收 'moved'")
  assert.throws(() => empty.prepare("UPDATE sandbox_onboarding SET credential_state = 'gone' WHERE id = 1").run(), /CHECK/, "表外态仍拒")

  const file = join(mkdtempSync(join(tempRoot, "v17-")), "gateway.db")
  const old = DB.openDatabase(file, { migrations: DB.MIGRATIONS.slice(0, 17) })
  assert.equal(DB.readVersion(old), 17)
  old.prepare("INSERT INTO sandbox_runners (id, name, address, status, runtime_json, created_at) VALUES (1, 'node-a', 'http://10.0.0.6:2375', 'active', '{}', '2026-10-01T00:00:00.000Z')").run()
  old.prepare("INSERT INTO sandbox_runners (id, name, address, status, runtime_json, created_at) VALUES (2, 'node-b', 'http://10.0.0.7:2375', 'active', '{}', '2026-10-01T00:00:00.000Z')").run()
  const ins = old.prepare(`INSERT INTO sandbox_onboarding (id, host, ssh_port, ssh_user, auth_kind, secret_cipher, sudo_cipher, credential_mode, credential_state, model, status, steps_json, runner_id, created_at, finished_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
  ins.run(1, "10.0.0.6", 2200, "ubuntu", "key", "cipher-1", null, "keep", "sealed", MODEL, "succeeded", "[]", 1, "2026-10-01T00:00:00.000Z", "2026-10-01T01:00:00.000Z")
  ins.run(2, "10.0.0.6", 2201, "root", "password", "cipher-2", "sudo-2", "keep", "sealed", MODEL, "succeeded", "[]", 1, "2026-10-01T00:00:00.000Z", "2026-10-01T02:00:00.000Z")
  ins.run(3, "10.0.0.7", 22, "deploy", "key", "cipher-3", null, "keep", "sealed", MODEL, "failed", "[]", null, "2026-10-01T00:00:00.000Z", "2026-10-01T03:00:00.000Z")
  ins.run(4, "10.0.0.8", 22, "solo", "key", "cipher-4", null, "keep", "sealed", MODEL, "succeeded", "[]", null, "2026-10-01T00:00:00.000Z", "2026-10-01T04:00:00.000Z")
  ins.run(5, "10.0.0.9", 22, "ghost", "key", "cipher-5", null, "keep", "sealed", MODEL, "succeeded", "[]", 99, "2026-10-01T00:00:00.000Z", "2026-10-01T05:00:00.000Z")
  old.close()

  const up = DB.openDatabase(file)
  assert.ok(DB.readVersion(up) >= 18, "v17 库升后 ≥ 18（本批段在链）")
  const host = up.prepare("SELECT * FROM sandbox_runners WHERE id = 1").get()
  assert.deepEqual(
    [host.ssh_user, host.ssh_port, host.auth_kind, host.secret_cipher, host.sudo_cipher, host.credential_state, host.credential_updated_at],
    ["root", 2201, "password", "cipher-2", "sudo-2", "sealed", "2026-10-01T02:00:00.000Z"],
    "接收行 = 后者胜（id 序）逐列值",
  )
  const untouched = up.prepare("SELECT * FROM sandbox_runners WHERE id = 2").get()
  assert.deepEqual([untouched.secret_cipher, untouched.credential_state, untouched.ssh_user], [null, "none", null], "未接收行 ⇒ NULL/'none'（零伪造回填）")
  const runs = up.prepare("SELECT id, status, secret_cipher, sudo_cipher, credential_state FROM sandbox_onboarding ORDER BY id").all().map((row) => ({ ...row })) // 展开：node:sqlite 行零原型——deepEqual 需普通对象
  assert.deepEqual(runs[0], { id: 1, status: "succeeded", secret_cipher: null, sudo_cipher: null, credential_state: "moved" }, "移交行 ⇒ 密列零化 + 'moved'")
  assert.deepEqual(runs[1], { id: 2, status: "succeeded", secret_cipher: null, sudo_cipher: null, credential_state: "moved" })
  assert.deepEqual(runs[2], { id: 3, status: "failed", secret_cipher: "cipher-3", sudo_cipher: null, credential_state: "sealed" }, "keep 未成功 ⇒ 留 run 行（密文不动）")
  assert.deepEqual(runs[3], { id: 4, status: "succeeded", secret_cipher: "cipher-4", sudo_cipher: null, credential_state: "sealed" }, "无接收行（runner_id NULL）⇒ 留 run 行（零吞密）")
  assert.deepEqual(runs[4], { id: 5, status: "succeeded", secret_cipher: "cipher-5", sudo_cipher: null, credential_state: "sealed" }, "接收行已删（悬空 runner_id）⇒ 留 run 行（与 live 径同判）")
  up.close()
  const again = DB.openDatabase(file) // 幂等（重开零抛、读数不变）
  assert.ok(DB.readVersion(again) >= 18, "幂等重开 ≥ 18")
  assert.equal(again.prepare("SELECT count(*) c FROM sandbox_onboarding").get().c, 5)
  assert.equal(again.prepare("SELECT secret_cipher c FROM sandbox_runners WHERE id = 1").get().c, "cipher-2")
  again.close()
})

// ── ② 凭据两端点（N79 ∥ E59 ∥ E60）──────────────────────────────────────────

test("N79/E59/E60：PUT 凭据（密封 + 零秘密 + 审计三键）∥ 形非法四支 400 库零变 ∥ 判权三态 ∥ 404", async () => {
  const app = await startApp()
  try {
    const runner = REGISTRY.insertRunner(app.db, { name: "node-a", address: "http://10.0.0.6:2375", runtime: {} })
    const path = `/api/admin/sandbox/runners/${runner.id}/credential`
    const body = { sshUser: "ubuntu", auth: { kind: "key", secret: SECRET }, sudoSecret: SUDO, sshPort: 2222 }

    const res = await call(app.base, "PUT", path, { cookie: app.adminCookie, body })
    assert.equal(res.status, 200, res.text)
    assert.deepEqual(res.json.runner.ssh, { user: "ubuntu", port: 2222, authKind: "key", credential: { state: "sealed", updatedAt: res.json.runner.ssh.credential.updatedAt } })
    assert.match(String(res.json.runner.ssh.credential.updatedAt), /^\d{4}-\d{2}-\d{2}T/, "credential_updated_at 在场")
    const wire = JSON.stringify(res.json)
    assert.ok(!wire.includes(SECRET) && !wire.includes(SUDO), "响应零秘密字段（键面扫描）")
    assert.ok(!("secret_cipher" in res.json.runner) && !("ssh_port" in res.json.runner), "行形只见 ssh 元数据（密列不出行面）")

    const row = app.runner(runner.id)
    assert.notEqual(row.secret_cipher, SECRET, "库列非明文")
    assert.equal(row.secret_cipher.split("|").length, 3, "密文形 = iv|tag|ct（三段）")
    assert.equal(CRYPTO.decryptSecret(row.secret_cipher, CRYPTO.loadOrCreateCredentialKey(app.keyPath)), SECRET)
    assert.equal(CRYPTO.decryptSecret(row.sudo_cipher, CRYPTO.loadOrCreateCredentialKey(app.keyPath)), SUDO)

    const audits = app.audit("host_credential_set")
    assert.equal(audits.length, 1, "审计 host_credential_set 一行")
    const detail = JSON.parse(audits[0].detail)
    assert.deepEqual(Object.keys(detail).sort(), ["authKind", "kind", "runnerId", "sshUser"], "detail 键集 = kind + 三键（零秘密）")
    assert.deepEqual([detail.runnerId, detail.sshUser, detail.authKind], [runner.id, "ubuntu", "key"])
    assert.ok(!audits[0].detail.includes(SECRET) && !audits[0].detail.includes(SUDO), "审计零秘密")

    const before = app.runner(runner.id)
    const bad = [
      { sshUser: "", auth: { kind: "key", secret: SECRET } },
      { sshUser: "u", auth: { kind: "token", secret: SECRET } },
      { sshUser: "u", auth: { kind: "key", secret: "  " } },
      { sshUser: "u", auth: { kind: "key", secret: SECRET }, sshPort: 70000 },
      { sshUser: "u", auth: { kind: "key", secret: SECRET }, sshPort: 0 },
    ]
    for (const item of bad) {
      const out = await call(app.base, "PUT", path, { cookie: app.adminCookie, body: item })
      assert.equal(out.status, 400, `形非法 ⇒ 400：${JSON.stringify(item)}——实读 ${out.status}`)
      assert.ok(typeof out.json?.error?.message === "string" && out.json.error.message !== "", "400 携人话")
      const now = app.runner(runner.id)
      assert.deepEqual([now.ssh_user, now.ssh_port, now.auth_kind, now.secret_cipher, now.sudo_cipher, now.credential_state, now.credential_updated_at],
        [before.ssh_user, before.ssh_port, before.auth_kind, before.secret_cipher, before.sudo_cipher, before.credential_state, before.credential_updated_at], "库零变（回读逐列）")
    }

    const anon = await call(app.base, "PUT", path, { body })
    assert.equal(anon.status, 401, "无会话 ⇒ 401")
    const asUser = await call(app.base, "PUT", path, { cookie: app.userCookie, body })
    assert.equal(asUser.status, 403, "user ⇒ 403")
    const missing = await call(app.base, "PUT", "/api/admin/sandbox/runners/9999/credential", { cookie: app.adminCookie, body })
    assert.equal(missing.status, 404, "不存在 ⇒ 404")
    const delAnon = await call(app.base, "DELETE", path)
    assert.equal(delAnon.status, 401, "撤销端点无会话 ⇒ 401")
    const delUser = await call(app.base, "DELETE", path, { cookie: app.userCookie })
    assert.equal(delUser.status, 403, "撤销端点 user ⇒ 403")
  } finally {
    await app.close()
  }
})

// ── ③ 撤销（N82 端点径 ∥ 两径同效 ∥ 再 exec 拒）─────────────────────────────────

test("N82（端点径）：DELETE 密列零化 + 'revoked' + 审计一行；无凭据在留 ⇒ 400；再 exec ⇒ 工具级错误", async () => {
  const app = await startApp()
  try {
    const runner = REGISTRY.insertRunner(app.db, { name: "node-a", address: "http://10.0.0.6:2375", runtime: {} })
    const path = `/api/admin/sandbox/runners/${runner.id}/credential`
    await call(app.base, "PUT", path, { cookie: app.adminCookie, body: { sshUser: "ubuntu", auth: { kind: "password", secret: SECRET } } })

    const res = await call(app.base, "DELETE", path, { cookie: app.adminCookie })
    assert.equal(res.status, 200, res.text)
    assert.deepEqual(res.json.runner.ssh.credential.state, "revoked", "state = revoked")
    const row = app.runner(runner.id)
    assert.deepEqual([row.secret_cipher, row.sudo_cipher, row.ssh_user, row.ssh_port, row.auth_kind], [null, null, "ubuntu", 22, "password"], "密列零化 ∥ 元数据保留")
    assert.equal(JSON.stringify(res.json).includes(SECRET), false, "响应零秘密")
    assert.equal(app.audit("host_credential_revoke").length, 1, "审计 host_credential_revoke 一行")
    assert.deepEqual(Object.keys(JSON.parse(app.audit("host_credential_revoke")[0].detail)).sort(), ["kind", "runnerId"])

    const again = await call(app.base, "DELETE", path, { cookie: app.adminCookie })
    assert.equal(again.status, 400, "无凭据在留 ⇒ 400")
    assert.match(again.text, /无凭据在留/)

    const tools = CHAT_TOOLS.createChatTools({ db: app.db, config: app.config, actor: "admin", actorId: 1, execImpl: app.ssh.execImpl })
    const out = await tools.invoke("exec", { host: "node-a", command: "id" })
    assert.equal(out.ok, false, "撤销后 exec ⇒ 工具级错误")
    assert.match(out.message, /未登记 SSH 凭据/)
    assert.match(out.message, /主机凭据/, "人话指向录入弹窗")
    assert.equal(app.ssh.calls.length, 0, "零 ssh 调用")
  } finally {
    await app.close()
  }
})

// ── ④ runnerByRef（名 ∥ 地址 ∥ 歧义 ∥ 未在册）──────────────────────────────────

test("runnerByRef：名 ∥ 地址两形命中（含归一形）；歧义 ∥ 未在册 ⇒ 抛（工具级错误人话）", () => {
  const db = DB.openDatabase(":memory:")
  REGISTRY.insertRunner(db, { name: "node-a", address: "http://10.0.0.6:2375", runtime: {} })
  assert.equal(REGISTRY.runnerByRef(db, "node-a").id, 1)
  assert.equal(REGISTRY.runnerByRef(db, "http://10.0.0.6:2375").id, 1)
  assert.equal(REGISTRY.runnerByRef(db, "10.0.0.6:2375").id, 1, "归一形同判")
  db.prepare("INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at) VALUES ('10.0.0.6:2375', 'http://10.0.0.9:2375', 'active', '{}', '2026-10-01T00:00:00.000Z')").run()
  assert.throws(() => REGISTRY.runnerByRef(db, "10.0.0.6:2375"), /歧义/, "多命中 ⇒ 歧义（不猜）")
  assert.throws(() => REGISTRY.runnerByRef(db, "node-ghost"), /未在册/)
  assert.throws(() => REGISTRY.runnerByRef(db, ""), /不可为空/)
})

// ── ⑤ execOnHost（假 ssh——退出码/掩蔽/私钥即删/解密失败/超时）───────────────────

test("execOnHost（假 ssh）：非零退出 ⇒ ok:true + 退出码；行凭据值掩蔽；私钥用毕即删；解密失败 ∥ 超时 ⇒ 抛人话", async () => {
  const app = await startApp()
  try {
    const runner = REGISTRY.insertRunner(app.db, { name: "node-a", address: "http://10.0.0.6:2375", runtime: {} })
    const row = HOSTS.setHostCredential(app.db, runner, HOSTS.parseHostCredentialInput({ sshUser: "ubuntu", auth: { kind: "key", secret: SECRET }, sudoSecret: SUDO }), { config: app.config })
    const out = await HOSTS.execOnHost(row, { command: `echo ${SECRET}; sudo -S id` }, { config: app.config, execImpl: app.ssh.execImpl })
    assert.equal(out.ok, true)
    assert.equal(out.exitCode, 0)
    assert.equal(out.subject, "echo ***; sudo -S id", "subject 过掩蔽")
    assert.equal(app.ssh.calls.length, 1)
    assert.equal(app.ssh.calls[0].input, `${SUDO}\n`, "sudo 口令经 stdin（sudo -S 判定）")

    const sshSvc = await load("thincoder-server/src/sandbox/ssh.mjs")
    const keyFiles = () => app.ssh.calls.map((call) => call.args[1]).filter((file) => typeof file === "string" && file.endsWith(".key"))
    assert.equal(keyFiles().length, 1, "key 认证形 ⇒ 临时私钥档一枚")
    assert.equal(existsSync(keyFiles()[0]), false, "用毕即删（零残留）")
    assert.equal(existsSync(sshSvc.sshDir(app.dir)), true)

    const noisy = makeFakeSsh(() => ({ code: 7, stdout: `out ${SECRET}`, stderr: `pw ${SUDO}` }))
    const masked = await HOSTS.execOnHost(row, { command: "id" }, { config: app.config, execImpl: noisy.execImpl })
    assert.deepEqual(masked.stdout, "out ***")
    assert.deepEqual(masked.stderr, "pw ***")
    assert.equal(masked.exitCode, 7)
    assert.ok(!JSON.stringify(masked).includes(SECRET) && !JSON.stringify(masked).includes(SUDO), "行凭据值零入结果")

    const timeout = makeFakeSsh(() => ({ code: -1, timedOut: true, stderr: "hang" }))
    await assert.rejects(() => HOSTS.execOnHost(row, { command: "sleep 9" }, { config: app.config, execImpl: timeout.execImpl }), /超时/, "超时 ⇒ 抛人话（SshError）")

    app.db.prepare("UPDATE sandbox_runners SET secret_cipher = 'broken' WHERE id = ?").run(runner.id)
    const broken = app.runner(runner.id)
    await assert.rejects(() => HOSTS.execOnHost(broken, { command: "id" }, { config: app.config, execImpl: app.ssh.execImpl }), /解密失败/)
  } finally {
    await app.close()
  }
})

// ── ⑥ chat 一轮 exec（N80 ∥ N83 ∥ B78：帧/审计/掩蔽/截断）+ N82 chat 径两行 ──────

test("N80/N83/B78/N82：chat 一轮 exec（帧 ∥ resultCode=退出码 ∥ subject=命令原文 ∥ 截断位 ∥ 零秘密四面）+ chat 径撤销两行", async () => {
  const long = "x".repeat(20000)
  const ssh = makeFakeSsh((command) => (command.includes("LONG") ? { code: 0, stdout: long, stderr: long } : { code: 7, stdout: `uid=0 ${SECRET}`, stderr: `pw ${SUDO}` }))
  const app = await startApp({
    ssh,
    withChat: true,
    turns: [
      turnCall("exec", { host: "node-a", command: "sudo -S id" }), // sudo 径 + 输出含行凭据值（N83 构造用例）
      turnCall("exec", { host: "node-a", command: "echo LONG" }),
      turnCall("runners", { op: "revoke_credential", id: 1 }),
      { content: "完成" },
    ],
  })
  try {
    const runner = REGISTRY.insertRunner(app.db, { name: "node-a", address: "http://10.0.0.6:2375", runtime: {} })
    HOSTS.setHostCredential(app.db, runner, HOSTS.parseHostCredentialInput({ sshUser: "ubuntu", auth: { kind: "key", secret: SECRET }, sudoSecret: SUDO }), { config: app.config })
    const chat = await app.createChat()
    const frames = await app.send(chat.id, "看下主机")

    const calls = frames.filter((frame) => frame.type === "call")
    assert.deepEqual(calls.map((frame) => frame.name), ["exec", "exec", "runners"], "三工具调用逐帧在场")
    assert.ok(calls[0].args.length <= 500, "call 帧 args = 摘要 ≤500 字")
    const results = frames.filter((frame) => frame.type === "result")
    assert.deepEqual(results.map((frame) => frame.ok), [true, true, true])
    assert.ok(results.every((frame) => frame.summary.length <= 300), "result 帧 summary ≤300（N80——含注记总长上限）")
    assert.equal(frames.at(-1).type, "end")
    assert.equal(frames.at(-1).status, "succeeded")

    const toolRows = app.messages(chat.id).filter((row) => row.role === "tool")
    const first = JSON.parse(toolRows[0].content)
    assert.deepEqual(Object.keys(first).sort(), ["exitCode", "ok", "stderr", "stdout", "subject", "summary"], "结果形 = 六字段（§12 exec 行）")
    assert.deepEqual([first.ok, first.exitCode], [true, 7], "命令非零退出 ⇒ ok:true（退出码在结果内）")
    assert.equal(first.stdout, "uid=0 ***", "stdout 含行凭据值 ⇒ 掩蔽（N83）")
    assert.equal(first.stderr, "pw ***")
    assert.equal(first.subject, "sudo -S id", "subject = 命令原文")
    assert.ok(!JSON.stringify(first).includes(SECRET) && !JSON.stringify(first).includes(SUDO), "结果文本零秘密")
    assert.equal(ssh.calls[0].input, `${SUDO}\n`, "sudo 口令经 stdin（sudo -S 判定——同任务面单源）")
    assert.ok(toolRows[1].content.length <= 4000, "结果可见形截断 ≤4000 字（B78）")
    assert.ok(JSON.parse(toolRows[1].data_json).summary.length <= 300, "tool 行 data_json.summary ≤300（N80——长输出 ⇒ 实截断）")

    const agentRows = app.db.prepare("SELECT * FROM audit_events WHERE type = 'agent_event' ORDER BY id").all().filter((row) => JSON.parse(row.detail).kind === "chat_call")
    const execRows = agentRows.filter((row) => JSON.parse(row.detail).tool === "exec")
    assert.equal(execRows.length, 2, "逐调用一条 chat_call")
    const firstAudit = JSON.parse(execRows[0].detail)
    assert.deepEqual([firstAudit.subject, firstAudit.resultCode], ["sudo -S id", 7], "审计 subject = 命令原文 ∥ resultCode = exitCode（N80）")
    assert.equal(firstAudit.truncated, false)
    assert.equal(JSON.parse(execRows[1].detail).truncated, true, "长输出 ⇒ truncated=true（B78）")
    assert.ok(!JSON.stringify(agentRows).includes(SECRET) && !JSON.stringify(agentRows).includes(SUDO), "审计零秘密")

    const rowAfter = app.runner(runner.id)
    assert.deepEqual([rowAfter.secret_cipher, rowAfter.credential_state], [null, "revoked"], "chat 径撤销同效")
    assert.equal(app.audit("host_credential_revoke").length, 1, "chat 径域行随落（凭据类例外）")
    const revokeCall = agentRows.filter((row) => JSON.parse(row.detail).tool === "runners")
    assert.equal(revokeCall.length, 1, "chat 径 chat_call 一行 ⇒ 两行（N82）")

    // 零秘密（结果面四面：结果帧 ∥ 工具行 ∥ 审计 ∥ 帧流；命令正文 = 模型自写输入——掩蔽面不涉）
    const wire = JSON.stringify(frames.filter((frame) => frame.type === "result"))
    const rows = JSON.stringify(app.messages(chat.id).filter((row) => row.role === "tool"))
    assert.ok(!wire.includes(SECRET) && !wire.includes(SUDO), "结果帧零秘密（含行凭据值）")
    assert.ok(!rows.includes(SECRET) && !rows.includes(SUDO), "工具行零秘密")
    assert.ok(!JSON.stringify(agentRows).includes(SECRET) && !JSON.stringify(agentRows).includes(SUDO), "审计零秘密")
    assert.deepEqual(ssh.calls.map((call) => call.command), ["sudo -S id", "echo LONG"], "两次 ssh 调用逐值")
    assert.equal(ssh.calls.some((call) => /\.key$/.test(call.args[1]) && existsSync(call.args[1])), false, "临时私钥用毕即删（假件断）")
  } finally {
    await app.close()
  }
})

// ── ⑦ B77 ∥ E61（工具级错误 ∥ 零 ssh 调用）──────────────────────────────────────

test("B77/E61：未登记凭据 ∥ 主机歧义 ∥ 命令空/超长 ∥ timeoutS 非法/越界 ⇒ 工具级错误（回合不停）；零 ssh 调用 ∥ 界内透传", async () => {
  const app = await startApp()
  try {
    const nodeA = REGISTRY.insertRunner(app.db, { name: "node-a", address: "http://10.0.0.6:2375", runtime: {} })
    app.db.prepare("INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at) VALUES ('10.0.0.6:2375', 'http://10.0.0.9:2375', 'active', '{}', '2026-10-01T00:00:00.000Z')").run()
    const tools = CHAT_TOOLS.createChatTools({ db: app.db, config: app.config, actor: "admin", actorId: 1, execImpl: app.ssh.execImpl })
    assert.deepEqual(CHAT_TOOLS.CHAT_TOOL_NAMES, ["members", "providers", "models", "usage", "audit", "runners", "docker", "exec"], "工具面八件")
    assert.deepEqual(CHAT_TOOLS.CHAT_TOOL_OPS.runners, ["list", "add", "remove", "revoke_credential"])

    const cases = [
      [{ host: "node-a", command: "" }, /必填/],
      [{ host: "node-a", command: "x".repeat(8001) }, /超长/],
      [{ host: "node-a", command: "id", timeoutS: 0 }, /timeoutS 非法/],
      [{ host: "node-a", command: "id", timeoutS: "abc" }, /timeoutS 非法/],
      [{ host: "node-a", command: "id", timeoutS: true }, /timeoutS 非法/],
      [{ host: "node-a", command: "id", timeoutS: "120" }, /timeoutS 非法/],
      [{ host: "10.0.0.6:2375", command: "id" }, /歧义/],
      [{ host: "node-ghost", command: "id" }, /未在册/],
    ]
    for (const [args, pattern] of cases) {
      const out = await tools.invoke("exec", args)
      assert.equal(out.ok, false, `工具级错误：${JSON.stringify(args).slice(0, 80)}`)
      assert.match(out.message, pattern)
      assert.equal(out.summary, undefined, "错误形 = { ok:false, message }（回合不停）")
    }
    const runner = REGISTRY.insertRunner(app.db, { name: "node-c", address: "http://10.0.0.8:2375", runtime: {} })
    const noCred = await tools.invoke("exec", { host: "node-c", command: "id" })
    assert.equal(noCred.ok, false)
    assert.match(noCred.message, /主机凭据/, "缺凭据 ⇒ 人话指向录入弹窗（B77）")
    const listOut = await tools.invoke("runners", { op: "list" })
    assert.equal(listOut.ok, true)
    assert.deepEqual(listOut.runners.find((item) => item.id === runner.id).ssh, { user: null, port: null, authKind: null, credential: { state: "none", updatedAt: null } }, "runners.list 行携 ssh 元数据")
    assert.equal(app.ssh.calls.length, 0, "零 ssh 调用")
    const sudoCall = await tools.invoke("exec", { host: "node-c", command: "id" })
    assert.equal(sudoCall.ok, false)

    // ── 上界判据（§12 exec 行 · fix 轮 2——父侧 2026-10-13 裁）：越界 ⇒ 工具级错误人话「超时上限 24 小时」+ 库零变 ∥ 界内（= 86 400）⇒ 行为不变 ──
    const snapshotRunners = () => JSON.stringify(app.db.prepare("SELECT * FROM sandbox_runners ORDER BY id").all().map((row) => ({ ...row })))
    const beforeRows = snapshotRunners()
    const beforeAuditCount = app.db.prepare("SELECT count(*) c FROM audit_events").get().c
    for (const over of [86401, 10 ** 12]) {
      const out = await tools.invoke("exec", { host: "node-a", command: "id", timeoutS: over })
      assert.equal(out.ok, false, `越界 ⇒ 工具级错误：${over}`)
      assert.match(out.message, /超时上限 24 小时/, "人话 = 超时上限 24 小时")
      assert.equal(out.summary, undefined, "错误形 = { ok:false, message }（回合不停）")
    }
    assert.equal(app.ssh.calls.length, 0, "越界零 ssh 调用")
    assert.equal(snapshotRunners(), beforeRows, "库零变（主机表回读逐行）")
    assert.equal(app.db.prepare("SELECT count(*) c FROM audit_events").get().c, beforeAuditCount, "库零变（审计零行）")

    HOSTS.setHostCredential(app.db, nodeA, HOSTS.parseHostCredentialInput({ sshUser: "ubuntu", auth: { kind: "key", secret: SECRET } }), { config: app.config })
    const inBound = await tools.invoke("exec", { host: "node-a", command: "id", timeoutS: 86400 })
    assert.equal(inBound.ok, true, inBound.message)
    assert.equal(app.ssh.calls.length, 1, "界内（= 上界）⇒ 正常调用传输面")
    assert.equal(app.ssh.calls[0].timeoutMs, 86400000, "上界值透传（86 400 000 ms ≪ Node 计时器量程）")
  } finally {
    await app.close()
  }
})

// ── ⑧ N81（托管接入 keep ∧ 成功 ⇒ 移交）──────────────────────────────────────

test("N81：托管接入 keep ⇒ 成功 ⇒ 移交七列（密文同源）+ run 行零化 + 'moved'；随后同主机 exec 可跑", async () => {
  const app = await startApp({
    withProvider: true, // 模型注册表（托管接入 POST 的 model 校验需在场）
    turns: [turnCall("register", { host: "10.0.0.6", endpoint: "http://10.0.0.6:2375", step: "S6" }), turnCall("report", { ok: true, summary: "接入成功", step: "S8" })],
  })
  try {
    const res = await call(app.base, "POST", "/api/admin/sandbox/onboarding", {
      cookie: app.adminCookie,
      body: { host: "10.0.0.6", sshUser: "ubuntu", auth: { kind: "key", secret: SECRET }, model: MODEL, credentialMode: "keep" },
    })
    assert.equal(res.status, 200, res.text)
    const runId = res.json.run.id
    const done = await waitFor(() => app.db.prepare("SELECT * FROM sandbox_onboarding WHERE id = ?").get(runId), { timeoutMs: 5000 })
    const run = await waitFor(() => {
      const row = app.db.prepare("SELECT * FROM sandbox_onboarding WHERE id = ?").get(runId)
      return row.status === "succeeded" ? row : null
    }, { timeoutMs: 5000 })
    assert.equal(run.credential_state, "moved", "run 行 ⇒ 'moved'（一次性终态）")
    assert.deepEqual([run.secret_cipher, run.sudo_cipher], [null, null], "run 行密列零化")
    assert.ok(run.runner_id, `run 行关联 runner（#${run.runner_id}）`)
    const host = app.runner(run.runner_id)
    assert.equal(host.credential_state, "sealed", "主机行 = sealed")
    assert.deepEqual([host.ssh_user, host.ssh_port, host.auth_kind], ["ubuntu", 22, "key"], "主机行逐列落值")
    assert.equal(CRYPTO.decryptSecret(host.secret_cipher, CRYPTO.loadOrCreateCredentialKey(app.keyPath)), SECRET, "密文同源（原值可解）")
    assert.equal(host.credential_updated_at, run.finished_at, "credential_updated_at = 移交当刻")
    assert.ok(done.status, "读数稳定")

    const out = await HOSTS.execOnHost(host, { command: "docker version" }, { config: app.config, execImpl: app.ssh.execImpl })
    assert.equal(out.ok, true, "移交给的凭据可供 exec")
    assert.equal(app.ssh.calls.at(-1).command, "docker version")
  } finally {
    await app.close()
  }
})

// ── ⑨ i18n 两表键面 + 新档在场 ────────────────────────────────────────────────

test("i18n/档目随正：主机凭据档在场；两表键面同步（zh=en ∥ en 零 CJK）；沙盒 +13 ∥ admin +3 ∥ kind +2", async () => {
  const ZH = (await load("thincoder-server/public/i18n-zh.mjs")).ZH
  const EN = (await load("thincoder-server/public/i18n-en.mjs")).EN
  // 键集口径：两表同族逐键同步；全表差异仅在语言名（`lang.*`——zh 独有）与英文复数 `.one` 变体（en 独有）——族内应逐键相同
  assert.deepEqual(
    Object.keys(ZH).filter((key) => key.startsWith("admin.sandbox.")).sort(),
    Object.keys(EN).filter((key) => key.startsWith("admin.sandbox.")).sort(),
    "沙盒族两表键集逐键同步",
  )
  assert.ok(Object.values(EN).every((value) => !/[\u4e00-\u9fff]/.test(String(value))), "en 表零 CJK")

  const sandboxKeys = ["hostCredBtn", "hostCredTitle", "hostCredTarget", "hostCredState", "hostCredUpdated", "hostCredStateNone", "hostCredStateSealed", "hostCredStateRevoked", "hostCredSealedNote", "hostCredSave", "hostCredSaved", "hostCredRevokeConfirm", "hostCredRevoked"]
  for (const key of sandboxKeys) {
    assert.ok(typeof ZH[`admin.sandbox.${key}`] === "string" && ZH[`admin.sandbox.${key}`] !== "", `沙盒键在场：admin.sandbox.${key}`)
    assert.ok(typeof EN[`admin.sandbox.${key}`] === "string" && EN[`admin.sandbox.${key}`] !== "", `en 同键：admin.sandbox.${key}`)
  }
  for (const key of ["hostCred", "hostCredPick", "hostCredNone"]) {
    assert.ok(ZH[`admin.chat.${key}`] !== undefined && EN[`admin.chat.${key}`] !== undefined, `admin 键在场：admin.chat.${key}`)
  }
  for (const kind of ["host_credential_set", "host_credential_revoke"]) {
    assert.ok(ZH[`audit.sandboxKind.${kind}`] !== undefined && EN[`audit.sandboxKind.${kind}`] !== undefined, `kind 键在场：${kind}`)
  }
  const zhKindKeys = Object.keys(ZH).filter((key) => key.startsWith("audit.sandboxKind."))
  assert.equal(zhKindKeys.length, 28, "kind 族 26 ⇒ 28")

  const file = join(ROOT, "thincoder-server/public/host-credential.mjs")
  assert.equal(existsSync(file), true, "新档在场：public/host-credential.mjs")
  const mod = await load("thincoder-server/public/host-credential.mjs")
  assert.equal(typeof mod.openHostCredentialModal, "function", "两页共用弹窗件导出（两挂载点同件）")
  assert.equal(typeof mod.openHostCredentialPicker, "function")
  assert.equal(typeof mod.hostCredentialStateLabel, "function")
  const VIEWS_CHAT_SRC = readFileSync(join(ROOT, "thincoder-server/public/views-chat.mjs"), "utf8")
  assert.match(VIEWS_CHAT_SRC, /import \{ openHostCredentialPicker \} from "\.\/host-credential\.mjs"/, "对话页接线 = 同一弹窗件（零第二份表单）")
  assert.match(VIEWS_CHAT_SRC, /t\("admin\.chat\.hostCred"\)/, "会话条钮在场（文案键）")
  const VIEWS_SANDBOX = await load("thincoder-server/public/views-sandbox.mjs")
  assert.equal(typeof VIEWS_SANDBOX.renderSandbox, "function")
  const VIEWS_SANDBOX_SRC = readFileSync(join(ROOT, "thincoder-server/public/views-sandbox.mjs"), "utf8")
  assert.match(VIEWS_SANDBOX_SRC, /t\("admin\.sandbox\.hostCredBtn"\)/, "节点行动作在场（文案键）")
  const AUDIT_SRC = readFileSync(join(ROOT, "thincoder-server/public/views-audit.mjs"), "utf8")
  assert.match(AUDIT_SRC, /host_credential_set: "audit\.sandboxKind\.host_credential_set"/, "审计面 kind 两键接线")
})
