/**
 * 2026-10-13-chat-cred-sender.test.mjs — thincoder-server 批内单测件（`chat-cred-sender` 轻通道轮：管理会话出口凭据主体
 * = 本回合发送者（谁用谁——用户 2026-10-13 16:39 裁）；名随批档 · 住 `docs/batches/` · 随批留存 · 不入任何门）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-chat-cred-sender.test.mjs`
 *
 * 射程：① 出口凭据 = 发送者（owner 无匙亦成——发送者有匙即可）∥ ② 出口装配直驱（假核收到发送者明文）∥
 *   ③ 发送者缺位 ⇒ 人话（凭据缺位；含 senderId 缺省）∥ ④ 回落链与管道透传源形（`senderId ?? owner` ∥ 路由 2 处 ∥ 唤醒面在册）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const KEYS = await load("thincoder-server/src/accounts/keys.mjs")
const CHAT = await load("thincoder-server/src/agent/chat.mjs")

const PASSWORD = "pass-12345678"
const REF = "fake/fake-model"
const BASE = "http://127.0.0.1:9"

function fixture() {
  const db = DB.openDatabase(":memory:")
  const ts = new Date().toISOString()
  db.prepare("INSERT INTO providers (name, base_url, api_key, models_json, created_at, updated_at) VALUES (?,?,?,?,?,?)")
    .run("fake", "http://127.0.0.1:9/v1", "sk-upstream-test", JSON.stringify(["fake-model"]), ts, ts)
  return db
}

async function twoAdmins(db) {
  const { member: a } = await MEMBERS.createMember(db, { username: "alpha", role: "admin", password: PASSWORD })
  const { member: b } = await MEMBERS.createMember(db, { username: "beta", role: "admin", password: PASSWORD })
  return { a, b }
}

test("① 出口凭据主体 = 发送者：owner 无匙、发送者有匙 ⇒ 出口携发送者明文（谁用谁）", async () => {
  const db = fixture()
  const { a, b } = await twoAdmins(db)
  const keyB = KEYS.ensureAgentKey(db, b.id) // 发送者（beta）有匙；owner（alpha）零匙
  const chat = CHAT.createChat(db, { model: REF, createdBy: a.id }) // owner = alpha
  assert.equal(chat.created_by, a.id)
  const { provider } = await CHAT.chatProviderOf({ db, ref: REF, senderId: b.id, selfBaseUrl: BASE })
  assert.equal(provider.apiKey, keyB.key.plain, "出口 sk = 发送者（beta）明文——非会话 owner")
  assert.equal(provider.baseURL, `${BASE}/v1`)
  assert.equal(provider.model, REF)
})

test("② 出口装配直驱（buildChatExit）：假核收到 provider.apiKey = 发送者明文", async () => {
  const db = fixture()
  const { a, b } = await twoAdmins(db)
  const keyB = KEYS.ensureAgentKey(db, b.id)
  CHAT.createChat(db, { model: REF, createdBy: a.id })
  const seen = []
  const exit = await CHAT.buildChatExit({
    db, ref: REF, senderId: b.id, selfBaseUrl: BASE,
    chatImpl: async (provider) => { seen.push(provider); return { content: "ok", toolCalls: [] } },
  })
  await exit({ messages: [{ role: "user", content: "hi" }], tools: [] })
  assert.equal(seen.length, 1)
  assert.equal(seen[0].apiKey, keyB.key.plain, "核所见凭据 = 发送者")
})

test("③ 发送者缺位 ⇒ 人话（管理会话模型凭据缺位——零静默）", async () => {
  const db = fixture()
  const { a, b } = await twoAdmins(db)
  KEYS.ensureAgentKey(db, b.id) // 只有 beta 有匙；alpha 无
  await assert.rejects(() => CHAT.chatProviderOf({ db, ref: REF, senderId: a.id, selfBaseUrl: BASE }), /管理会话模型凭据缺位/)
  await assert.rejects(() => CHAT.chatProviderOf({ db, ref: REF, senderId: null, selfBaseUrl: BASE }), /管理会话模型凭据缺位/)
})

test("④ 回落链与管道透传（源形断言）：senderId ?? owner ∥ 路由 2 处 ∥ 唤醒面在册", () => {
  const chatSrc = readFileSync(join(ROOT, "thincoder-server/src/agent/chat.mjs"), "utf8")
  const routesSrc = readFileSync(join(ROOT, "thincoder-server/src/agent/chat-routes.mjs"), "utf8")
  const wakeSrc = readFileSync(join(ROOT, "thincoder-server/src/agent/chat-wake.mjs"), "utf8")
  assert.ok(chatSrc.includes("senderId: senderId ?? chat.created_by ?? null"), "回落链在册（唤醒轮随最近发送者、主人兜底）")
  assert.ok(chatSrc.includes("installSettleHook({ chatId: chat.id, db, deps, now, log, senderId })"), "结算钩子携发送者")
  assert.ok(chatSrc.includes("runChatTurn({ db, chatId, content: \"\", emit: null, deps, now, log, wake: { source, domain }, senderId })"), "唤醒轮透传")
  assert.equal((routesSrc.match(/senderId: admin\.id/g) ?? []).length, 2, "路由两处（回合 + 链尾泵）")
  assert.ok(routesSrc.includes("const { member: admin } = requireAdmin(db, req) // 发送者 = 凭据主体"), "发送者取自登录成员")
  assert.ok(wakeSrc.includes("runChatWakeTurn({ db, chatId: key, source: sourceOf(timerPadOf(key), { now, core: timers }), deps, now, log, senderId })"), "唤醒面透传在册")
  assert.ok(wakeSrc.includes("return (await armChatWake({ chatId: key, db, deps, now, log, senderId })) !== null"), "无交付再武装携发送者（#45 上抛 1 修复断言）")
})
