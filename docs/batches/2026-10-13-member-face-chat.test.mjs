/**
 * 2026-10-13-member-face-chat.test.mjs — 单元测试档（服务端面舱 · member-face-chat 批 · 台账 #1215 · 功能点 50 · AC-50）
 *
 * 覆盖（服务端腿——页面腿归 webui 舱：N76/N77）：
 *  - 迁移 v23：空库直落 23 ∥ v22 升 23 ∥ 幂等 ∥ 凭据表七列 + `(member_id,host)` 唯一 ∥ **会话两表不在** ∥ 存量审计行保形 + 两索引 ∥ `member_event` 可写；
 *  - N71 读指令族回呈（列表/读史/新建/改——假盒桩逐形）∥ N72 relay 状态机（attach ⇒ run ⇒ 帧流 ⇒ end；掉线；重启；零会话落库断言）；
 *  - N73 端点判权与门（双鉴权 ∥ 本人过滤 404 ∥ 工作区级在途门 ∥ 上限 ∥ 两新码）∥ N74 拉仓（可见性门/组装/结果对位/凭据经助手取件）；
 *  - N75 盒协议编解码（下行六事件 ∥ 上行三口 + 凭据口；SSE 帧 ∥ NDJSON 增量行 ∥ 流式体读路由级例外）∥ N78 凭据（存取/取件逐形/零回显/审计）；
 *  - E54 上限拒 ∥ E55 越权拒（404 零泄露）∥ E56 盒离线拒（409 + 启动指引）∥ E57 凭据未绑定（人话指账户页）∥ B69 掉线收尾 ∥ B70 重启清空 ∥ B71 跨会话在途门。
 *
 * 运行（仓根 = `thincoder/`；本档在 `docs/batches/` 下两级即 `thincoder-server/`）：
 *   `node --test docs/batches/2026-10-13-member-face-chat.test.mjs`
 * 依赖 = 零（真 src 件 + 假 req/res/引擎/盒桩；库 = 临时目录真库）；档随批次档保存（单元测试档——不进 `test/` 树、不入门）。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { Readable } from "node:stream"
import { mkdtempSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = join(HERE, "..", "..", "thincoder-server")
const load = (rel) => import(pathToFileURL(join(SERVER_ROOT, rel)).href)

const { openDatabase, MIGRATIONS, migrate, readVersion, SCHEMA_VERSION } = await load("src/store/db.mjs")
const { createMemberRelay, sseFrame } = await load("src/agent/member-relay.mjs")
const { registerMemberRoutes, parseSessionId, sessionRowOf } = await load("src/agent/member-routes.mjs")
const { createLineReader, registerBoxRoutes, sessionRefOf } = await load("src/agent/box-routes.mjs")
const { defaultPullDir, normalizePullDir, cloneUrlOf, hostOfAddress } = await load("src/agent/member-pull.mjs")
const { normalizeGitHost, credentialForHost } = await load("src/agent/member-cred.mjs")
const { ERROR_CODES, HttpError, sendJson } = await load("src/gateway/errors.mjs")
const { createGatewayServer, createRouteTable, readJsonBody, readStreamBody } = await load("src/gateway/server.mjs")
const { createSession } = await load("src/accounts/session.mjs")
const { issueKey } = await load("src/accounts/keys.mjs")

// 夹具/假件（共用件——为守 800 行硬限单列，见同目录 `-harness.mjs`）
import {
  attachBox, auditKinds, auditRows, boxAnswer, boxCall, boxTurns, expectHttp, face, fakeDocker, fakeHost,
  meCall, probeFetch, seedProvider, seedRunner, seedWorkspace, tick, waitFor, world,
} from "./2026-10-13-member-face-chat-harness.mjs"
// ── T1 迁移 v23 ─────────────────────────────────────────────────────────────

test("T1 迁移 v23：空库直落 23 ∥ v22 升 23 ∥ 幂等 ∥ 凭据表七列 + 唯一 ∥ 会话两表不在 ∥ 存量审计行保形 + 两索引 ∥ member_event 可写", () => {
  const fresh = openDatabase(":memory:")
  assert.ok(readVersion(fresh) >= 23, "空库直落 ≥ 23（本批落地 23；后续批递升——2026-10-14 父侧裁：前向兼容）")
  assert.ok(SCHEMA_VERSION >= 23, "链尾段号 ≥ 23（同上）")
  assert.equal(fresh.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='member_sessions'").get(), undefined) // 会话真源在盒内——两表不建
  assert.equal(fresh.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='member_session_messages'").get(), undefined)
  fresh.close()

  const db = openDatabase(":memory:", { migrations: MIGRATIONS.filter((step) => step.v <= 22) })
  assert.equal(readVersion(db), 22)
  db.prepare("INSERT INTO audit_events (ts, type, actor_id, actor_name, target_id, target_name, detail) VALUES (7, 'login_success', 1, 'Alice', NULL, '', '{\"a\":1}')").run()
  migrate(db, { migrations: MIGRATIONS })
  assert.ok(readVersion(db) >= 23, "v22 库升后 ≥ 23（本批段在链——同上）")
  const before = db.prepare("SELECT * FROM audit_events").all()
  assert.equal(before.length, 1)
  assert.equal(before[0].ts, 7)
  assert.equal(before[0].type, "login_success")
  assert.equal(before[0].actor_name, "Alice")
  assert.equal(before[0].detail, '{"a":1}')
  migrate(db, { migrations: MIGRATIONS }) // 幂等
  assert.equal(db.prepare("SELECT COUNT(*) AS n FROM audit_events").get().n, 1)
  assert.deepEqual(
    db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='audit_events' AND name LIKE 'idx_%' ORDER BY name").all().map((row) => row.name),
    ["idx_audit_ts", "idx_audit_type_ts"],
  )

  assert.deepEqual(db.prepare("PRAGMA table_info(member_git_credentials)").all().map((row) => row.name), ["id", "member_id", "host", "username", "secret_cipher", "created_at", "updated_at"])
  assert.deepEqual(db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='member_git_credentials'").all().map((row) => row.name), ["idx_member_git_credentials"])
  const insert = "INSERT INTO member_git_credentials (member_id, host, username, secret_cipher, created_at, updated_at) VALUES (1, 'gitee.com', 'u', 'c', 't', 't')"
  db.prepare(insert).run()
  assert.throws(() => db.prepare(insert).run(), /UNIQUE/) // `(member_id, host)` 唯一
  db.prepare("INSERT INTO audit_events (ts, type, actor_name) VALUES (1, 'member_event', 'Alice')").run() // 十六型可写
  assert.throws(() => db.prepare("INSERT INTO audit_events (ts, type, actor_name) VALUES (1, 'bogus_event', 'Alice')").run(), /CHECK/) // 表外拒
  db.close()
})

// ── T2 纯函数腿 ──────────────────────────────────────────────────────────────

test("T2 纯函数腿：会话 id/行形 ∥ SSE 帧 ∥ NDJSON 增量行 ∥ 会话引用 ∥ 拉仓组链 ∥ 主机归一", () => {
  assert.deepEqual(parseSessionId("7:3"), { workspaceId: 7, slot: "3" })
  assert.equal(parseSessionId("7:"), null)
  assert.equal(parseSessionId(":3"), null)
  assert.equal(parseSessionId("abc"), null)
  assert.equal(parseSessionId(undefined), null)

  const row = sessionRowOf({ id: 2, name: "工作区 1" }, { slot: 5, activeModel: "gpt-x", effort: "high", firstMessage: "你好", timestamp: 1234 })
  assert.deepEqual(row, { id: "2:5", workspaceId: 2, workspaceName: "工作区 1", model: "gpt-x", reasoning: "high", status: "idle", excerpt: "你好", agentOnline: true, updatedAt: 1234 })
  assert.equal(sessionRowOf({ id: 2, name: "w" }, { id: "9", model: "a/b", reasoning: null, excerpt: "", updatedAt: "2026-01-01T00:00:00.000Z" }).id, "2:9")

  assert.equal(sseFrame("run", { cmdId: "c1" }), 'event: run\ndata: {"cmdId":"c1"}\n\n')

  const reader = createLineReader()
  assert.deepEqual(reader.push(Buffer.from('{"type":"begin","cmdId":"c1"}\n{"type":"turn",')), ['{"type":"begin","cmdId":"c1"}'])
  assert.deepEqual(reader.push(Buffer.from('"n":1}\n\n')), ['{"type":"turn","n":1}', ""])
  assert.equal(reader.flush(), "")

  assert.deepEqual(sessionRefOf("2:9", { id: 2 }), { slot: "9" })
  assert.deepEqual(sessionRefOf("9", { id: 2 }), { slot: "9" })
  assert.equal(sessionRefOf("3:9", { id: 2 }), null) // 会话 ∉ 本工作区
  assert.equal(sessionRefOf("2:", { id: 2 }), null)

  assert.equal(defaultPullDir("gitee.com/team/repo"), "repo")
  assert.equal(cloneUrlOf("gitee.com/team/repo"), "https://gitee.com/team/repo.git")
  assert.equal(hostOfAddress("gitee.com:8443/team/repo"), "gitee.com:8443")
  assert.equal(normalizePullDir(undefined, "repo"), "repo")
  assert.equal(normalizePullDir(" sub/dir/ ", "repo"), "sub/dir")
  assert.throws(() => normalizePullDir("/abs", "repo"), /相对路径/)
  assert.throws(() => normalizePullDir("../x", "repo"), /\.\./)

  assert.equal(normalizeGitHost(" Gitee.COM "), "gitee.com")
  assert.equal(normalizeGitHost("git.example.com:8443"), "git.example.com:8443")
  assert.throws(() => normalizeGitHost("https://gitee.com"), /scheme|路径/)
  assert.throws(() => normalizeGitHost(""), /不可为空/)
})

// ── T3 在线全链（N71/N72/N75/N78 腿）────────────────────────────────────────

test("T3 在线全链：attach ⇒ hello ∥ 列表/读史/新建/改（盒桩逐形）∥ 回合帧流序 ∥ 中止 ∥ ping", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice, { name: "工作区 1" })
  seedWorkspace(w.db, w.bob, { name: "工作区 9" })
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  const sid = `${workspace.id}:3`

  const box = attachBox(routes, { workspace, key })
  assert.equal(box.hello()?.data.redeliver.length, 0)
  assert.equal(typeof box.hello()?.data.serverTime, "number")

  // 列表（核形键兼容：`firstMessage`/`activeModel`/`timestamp`）
  const listPending = meCall(routes, "GET", "/api/me/chat/sessions", { cookie })
  await tick()
  const listCmd = box.last("cmd")
  assert.equal(listCmd.data.kind, "sessions.list")
  await boxAnswer(routes, box, { key, cmdId: listCmd.data.cmdId, detail: { sessions: [{ slot: 3, activeModel: "gpt-x", effort: "high", firstMessage: "你好", timestamp: 2 }, { slot: 1, activeModel: "gpt-y", timestamp: 1 }] } })
  const list = await listPending
  assert.equal(list.status, 200)
  assert.deepEqual(list.json().sessions.map((item) => item.id), [sid, `${workspace.id}:1`])
  assert.equal(list.json().sessions[0].reasoning, "high")
  assert.equal(list.json().sessions[0].agentOnline, true)
  assert.equal(list.json().sessions[0].workspaceName, "工作区 1")

  // 新建（`detail.id` 槽号 ⇒ 复合 id；缺省模型 = 开放清单首个）
  seedProvider(w.db)
  const models2 = await meCall(routes, "GET", "/api/me/chat/models", { cookie })
  assert.deepEqual(models2.json(), { models: [{ id: "openai/gpt-x", reasoning: [] }, { id: "openai/gpt-y", reasoning: [] }] })
  await expectHttp(meCall(routes, "POST", "/api/me/chat/sessions", { cookie, body: { workspaceId: workspace.id, model: "nope" } }), { code: "invalid_request_error", status: 400, match: /模型不可用/ })

  const createPending = meCall(routes, "POST", "/api/me/chat/sessions", { cookie, body: { workspaceId: workspace.id } })
  await tick()
  const createCmd = box.last("cmd")
  assert.equal(createCmd.data.kind, "session.create")
  assert.deepEqual(createCmd.data.args, { model: "openai/gpt-x" })
  await boxAnswer(routes, box, { key, cmdId: createCmd.data.cmdId, detail: { id: 4 } })
  const created = await createPending
  assert.equal(created.status, 200)
  assert.equal(created.json().session.id, `${workspace.id}:4`)
  assert.equal(created.json().session.model, "openai/gpt-x")

  // 详情（读史）
  const readPending = meCall(routes, "GET", `/api/me/chat/sessions/${workspace.id}:3`, { cookie })
  await tick()
  const readCmd = box.last("cmd")
  assert.equal(readCmd.data.kind, "session.read")
  assert.deepEqual(readCmd.data.args, { slot: "3" })
  await boxAnswer(routes, box, { key, cmdId: readCmd.data.cmdId, detail: { session: { slot: 3, activeModel: "gpt-x" }, messages: [{ role: "user", content: "你好" }, { role: "assistant", content: "在" }] } })
  const read = await readPending
  assert.equal(read.json().session.id, sid)
  assert.equal(read.json().messages.length, 2)

  // 会话不存在（盒侧 failed + notFound ⇒ 404 不辨）
  const gonePending = meCall(routes, "GET", `/api/me/chat/sessions/${workspace.id}:9`, { cookie })
  await tick()
  await boxAnswer(routes, box, { key, cmdId: box.last("cmd").data.cmdId, state: "failed", detail: { notFound: true, message: "无此槽" } })
  await expectHttp(gonePending, { code: "not_found", status: 404, match: /会话不存在/ })

  // 改（换模型 ⇒ 档位清；一次一件）
  const patchPending = meCall(routes, "PATCH", `/api/me/chat/sessions/${workspace.id}:3`, { cookie, body: { model: "openai/gpt-y" } })
  await tick()
  const patchCmd = box.last("cmd")
  assert.equal(patchCmd.data.kind, "session.update")
  assert.deepEqual(patchCmd.data.args, { slot: "3", model: "openai/gpt-y", reasoning: null })
  await boxAnswer(routes, box, { key, cmdId: patchCmd.data.cmdId, detail: { session: { slot: 3, activeModel: "openai/gpt-y" } } })
  const patched = await patchPending
  assert.equal(patched.json().session.model, "openai/gpt-y")
  assert.equal(patched.json().session.reasoning, null)
  await expectHttp(meCall(routes, "PATCH", `/api/me/chat/sessions/${workspace.id}:3`, { cookie, body: { model: "openai/gpt-y", reasoning: "high" } }), { code: "invalid_request_error", status: 400, match: /一次一件/ })

  // 回合帧流（begin 帧 = 盒内面；六帧词表逐帧转发 ⇒ 浏览器 NDJSON 流）
  const turnPending = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "干点活" } })
  await tick()
  const runFrame = box.last("run")
  assert.equal(runFrame.data.sessionId, "3")
  assert.equal(runFrame.data.content, "干点活")
  const frames = [{ type: "begin", cmdId: runFrame.data.cmdId }, { type: "turn", n: 1 }, { type: "delta", text: "好" }, { type: "call", id: "t1", name: "exec", args: '{"apiKey":"sk-secret-value","cmd":"ls"}' }, { type: "result", id: "t1", ok: true, summary: "退出码 0" }, { type: "end", status: "succeeded", durationMs: 12, calls: 1 }]
  const stream = await boxTurns(routes, key, "3", frames)
  assert.equal(stream.status, 200)
  const turn = await turnPending
  assert.equal(turn.status, 200)
  assert.equal(turn.headers["Content-Type"], "application/x-ndjson; charset=utf-8")
  assert.equal(turn.headers["Cache-Control"], "no-store")
  const parsed = turn.text.trim().split("\n").map((line) => JSON.parse(line))
  assert.deepEqual(parsed.map((frame) => frame.type), ["turn", "delta", "call", "result", "end"]) // `begin` = 盒内帧（不落浏览器流）
  assert.equal(parsed.at(-1).status, "succeeded")
  assert.equal(parsed[2].args.includes("sk-secret-value"), false) // 转发浏览器前：管理面同款掩蔽（敏感键 ⇒ ***）
  assert.match(parsed[2].args, /\*\*\*/)

  // 中止（在途 ⇒ 下行 abort + 200；非在途 ⇒ 400 零副作用）
  const busyPending = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "再干" } })
  await tick()
  const abort = await meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/abort`, { cookie })
  assert.equal(abort.json().ok, true)
  assert.equal(box.last("abort").data.sessionId, "3")
  await expectHttp(meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:4/abort`, { cookie }), { code: "invalid_request_error", status: 400, match: /不在执行中/ })
  const busyRun = box.last("run")
  await boxTurns(routes, key, "3", [{ type: "begin", cmdId: busyRun.data.cmdId }, { type: "end", status: "failed", reason: "aborted" }])
  const aborted = await busyPending
  assert.equal(JSON.parse(aborted.text.trim().split("\n").at(-1)).reason, "aborted")

  // 保活应答（204 + 在线态不翻）
  const pong = await boxCall(routes, "POST", "/api/box/ping", { key, body: { t: 1 } })
  assert.equal(pong.status, 204)
  assert.equal(pong.ended, true)

  // 审计（chat_start ∥ chat_call ∥ chat_stop）
  const kinds = auditKinds(w.db)
  assert.ok(kinds.includes("chat_start"))
  assert.ok(kinds.includes("chat_call"))
  assert.ok(kinds.includes("chat_stop"))
  const call = auditRows(w.db).find((row) => row.detail.kind === "chat_call")
  assert.equal(call.type, "member_event")
  assert.equal(call.actor, "Alice")
  assert.equal(call.target, "session:3")
  assert.equal(call.detail.tool, "exec")
  assert.equal(call.detail.resultCode, 0)
  assert.equal(call.detail.summary, "退出码 0")
  const stop = auditRows(w.db).find((row) => row.detail.kind === "chat_stop")
  assert.equal(stop.detail.reason, "aborted")

  // 零会话落库（N72 断言）
  assert.equal(w.db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'member_session%'").all().length, 0)
})

// ── T4/T5 掉线与超窗收尾（B69）──────────────────────────────────────────────

test("T4 掉线收尾（B69）：在途回合 ⇒ 补 notice + end{box_lost}；空闲掉线 ⇒ 零帧；在线态翻转", async (t) => {
  const w = world(t)
  const { routes, relay } = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token

  const box = attachBox(routes, { workspace, key })
  const idle = relay.detach(workspace.id) // 空闲掉线：零在途 ⇒ 零补帧
  assert.equal(idle, true)
  assert.equal(relay.online(workspace.id), false)
  assert.deepEqual(box.frames.map((frame) => frame.event), ["hello"])

  assert.equal(relay.detach(workspace.id), false) // 已断开 ⇒ 幂等 no-op
  const box2 = attachBox(routes, { workspace, key })
  const pending = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "跑" } })
  await tick()
  assert.equal(relay.busy(workspace.id), true)
  relay.detach(workspace.id)
  const turn = await pending
  const frames = turn.text.trim().split("\n").map((line) => JSON.parse(line))
  assert.deepEqual(frames.map((frame) => frame.type), ["notice", "end"])
  assert.equal(frames[0].reason, "box_lost")
  assert.equal(frames[1].status, "failed")
  assert.equal(frames[1].reason, "box_lost")
  const stop = auditRows(w.db).find((row) => row.detail.kind === "chat_stop")
  assert.equal(stop.detail.reason, "box_lost")
  assert.equal(box2.hello()?.data.redeliver.length, 0)
})

test("T5 ping 应答欠 3 周期 ⇒ 判掉线（B69 二腿）：超窗收尾 + 晚到应答恢复在线态", async (t) => {
  const w = world(t)
  const { routes, relay } = face(w, t, { relayOptions: { pingIntervalMs: 10, pongWindowMs: 60_000 } })
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  const box = attachBox(routes, { workspace, key })

  const pending = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "跑" } })
  await tick()
  w.clock.t += 61_000 // 超窗（3 × 20s）
  await waitFor(() => relay.busy(workspace.id) === false) // 等 ping 节拍（超窗 ⇒ 收尾）
  const turn = await pending
  const frames = turn.text.trim().split("\n").map((line) => JSON.parse(line))
  assert.deepEqual(frames.map((frame) => frame.type), ["notice", "end"])
  assert.equal(frames[1].reason, "box_lost")
  assert.equal(relay.online(workspace.id), false)

  const pong = await boxCall(routes, "POST", "/api/box/ping", { key, body: { t: 1 } })
  assert.equal(pong.status, 204)
  assert.equal(relay.online(workspace.id), true) // 晚到应答 ⇒ 在线态恢复（连接未断）
  assert.ok(await waitFor(() => box.frames.some((frame) => frame.event === "ping"))) // 应答后续拍 ⇒ 下发 ping（在线保温）
})

// ── T6/T7 重启清空 ∥ 跨会话在途门（B70/B71）────────────────────────────────

test("T6 重启清空（B70）：在途态纯内存 ⇒ 新 relay 零残留；未知 pullId ⇒ 结果未知——重试", async (t) => {
  const w = world(t)
  const first = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  attachBox(first.routes, { workspace, key })
  assert.equal(first.relay.online(workspace.id), true)

  const second = face(w, t) // 模拟进程重启（新 relay 实例 = 零内存态）
  assert.equal(second.relay.online(workspace.id), false)
  await expectHttp(
    meCall(second.routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "在？" } }),
    { code: "workspace_offline", status: 409, match: /启动工作区/ },
  )
  const pull = await meCall(second.routes, "GET", `/api/me/sandbox/workspaces/${workspace.id}/pulls/pull-1`, { cookie })
  assert.deepEqual(pull.json(), { state: "failed", detail: "结果未知——重试" })
  // 会话读数零落库（工作区行仍在 = 卷恒留语义的服务端面）
  assert.equal(w.db.prepare("SELECT COUNT(*) AS n FROM sandbox_workspaces").get().n, 1)
})

test("T7 跨会话在途门（B71）：同工作区并发二发 ⇒ 400 零副作用；回合毕 ⇒ 放行", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  const box = attachBox(routes, { workspace, key })

  const first = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "一" } })
  await tick()
  const runsBefore = box.frames.filter((frame) => frame.event === "run").length
  await expectHttp(
    meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:4/messages`, { cookie, body: { content: "二" } }),
    { code: "invalid_request_error", status: 400, match: /正在执行另一回合/ },
  )
  assert.equal(box.frames.filter((frame) => frame.event === "run").length, runsBefore) // 零副作用（第二发不下行）
  const run = box.last("run")
  await boxTurns(routes, key, "3", [{ type: "begin", cmdId: run.data.cmdId }, { type: "end", status: "succeeded" }])
  await first
  const third = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:4/messages`, { cookie, body: { content: "三" } })
  await tick()
  const run2 = box.last("run")
  assert.equal(run2.data.sessionId, "4") // 门已放行（换会话亦通）
  await boxTurns(routes, key, "4", [{ type: "begin", cmdId: run2.data.cmdId }, { type: "end", status: "succeeded" }])
  await third
})

// ── T8 判权（N73/E55）───────────────────────────────────────────────────────

test("T8 双鉴权与本人过滤（N73/E55）：401 两形 ∥ cookie/Bearer 双门同判权 ∥ 他人资源 404 不辨 ∥ 列表零出现", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  const mine = seedWorkspace(w.db, w.alice, { name: "工作区 1" })
  const other = seedWorkspace(w.db, w.bob, { name: "工作区 2" })
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  const bearer = (await issueKey(w.db, w.alice.id)).plain

  await expectHttp(meCall(routes, "GET", "/api/me/chat/sessions"), { code: "unauthorized", status: 401 })
  await expectHttp(meCall(routes, "GET", "/api/me/chat/sessions", { bearer: "Bearer nope" }), { code: "invalid_api_key", status: 401 })
  await expectHttp(meCall(routes, "GET", "/api/me/git-credentials", { bearer: "Bearer nope" }), { code: "invalid_api_key", status: 401 })

  const viaBearer = await meCall(routes, "GET", "/api/me/chat/sessions", { bearer: `Bearer ${bearer}` })
  assert.equal(viaBearer.status, 200)
  const viaCookie = await meCall(routes, "GET", "/api/me/chat/sessions", { cookie })
  assert.equal(viaCookie.status, 200)

  // 他人会话/工作区：直取 404 不辨（消息零存在性泄露）
  const foreign = `${other.row.id}:1`
  await expectHttp(meCall(routes, "GET", `/api/me/chat/sessions/${other.row.id}:1`, { cookie }), { code: "not_found", status: 404, match: /^工作区不存在/ })
  await expectHttp(meCall(routes, "POST", `/api/me/chat/sessions/${other.row.id}:1/messages`, { cookie, body: { content: "x" } }), { code: "not_found", status: 404 })
  await expectHttp(meCall(routes, "POST", `/api/me/sandbox/workspaces/${other.row.id}/start`, { cookie, body: {} }), { code: "not_found", status: 404 })
  await expectHttp(meCall(routes, "GET", `/api/me/sandbox/workspaces/${other.row.id}/pulls/pull-1`, { cookie }), { code: "not_found", status: 404 })
  // 形不合的会话 id 同判 404（不辨）
  await expectHttp(meCall(routes, "GET", "/api/me/chat/sessions/9:x", { cookie }), { code: "not_found", status: 404 })

  // 列表：仅本人工作区（他人工作区零出现——盒离线 ⇒ 会话零行，但工作区归属滤在扇出前）
  const list = await meCall(routes, "GET", "/api/me/chat/sessions", { cookie })
  assert.deepEqual(list.json(), { sessions: [] })
  assert.equal(mine.row.owner_member_id, w.alice.id)
})

// ── T9/T10 工作区写面（E54/E56/by:"member" 审计）───────────────────────────

test("T9 上限（E54）：达上限 ⇒ 400 workspace_limit_reached（人话含数字）∥ 他人工作区不计入 ∥ 库零变", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  w.db.prepare("INSERT INTO sandbox_settings (k, v) VALUES ('memberWorkspaceLimit', '1')").run()
  seedWorkspace(w.db, w.alice, { name: "我的工作区" }) // 现有 1 个（达上限）
  seedWorkspace(w.db, w.bob, { name: "Bob 的" }) // 他人行不计
  seedWorkspace(w.db, w.bob, { name: "Bob 的 2" })
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token

  await expectHttp(meCall(routes, "POST", "/api/me/sandbox/workspaces", { cookie, body: { name: "第二个" } }), { code: "workspace_limit_reached", status: 400, match: /上限（1 个）/ })
  assert.equal(w.db.prepare("SELECT COUNT(*) AS n FROM sandbox_workspaces WHERE owner_member_id = ?").get(w.alice.id).n, 1) // 库零变（拒之不入）
  assert.equal(w.db.prepare("SELECT COUNT(*) AS n FROM sandbox_workspaces").get().n, 3) // 他人行零触
})

test("T9b 建工作区（N73 写面）：满员 ⇒ 200 未放置（不降级）+ 缺省名 ∥ 动作行 by:\"member\" ∥ 链进入 ⇒ 502 行留幂等", async (t) => {
  const w = world(t)
  const client = fakeDocker()
  const host = fakeHost()
  const { routes } = face(w, t, { fetchImpl: probeFetch(), deps: { clientForRunner: () => client, host } })
  const runner = seedRunner(w.db)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token

  // 满员（放置容量 = 1，已绑 1）⇒ 无候选 ⇒ 未放置（不降级——行留「待人放」）
  w.db.prepare("INSERT INTO sandbox_settings (k, v) VALUES ('maxBoxesPerRunner', '1')").run()
  seedWorkspace(w.db, w.alice, { name: "已绑的", runnerId: runner.id })
  const created = await meCall(routes, "POST", "/api/me/sandbox/workspaces", { cookie, body: {} })
  assert.equal(created.status, 200)
  assert.equal(created.json().workspace.name, "工作区 2") // 缺省名 = 工作区 N（N = 本人现存行数 + 1）
  const row = w.db.prepare("SELECT * FROM sandbox_workspaces WHERE name = '工作区 2'").get()
  assert.equal(row.runner_id, null)
  assert.equal(row.owner_member_id, w.alice.id)
  assert.ok(w.db.prepare("SELECT id FROM api_keys WHERE id = ?").get(row.key_id)) // 每工作区 key 已签发
  const action = auditRows(w.db).find((item) => item.detail.kind === "workspace_create")
  assert.equal(action.type, "sandbox_event")
  assert.equal(action.actor, "Alice")
  assert.equal(action.detail.by, "member")

  // 有候选 ⇒ 链进入（②配额步挡在最小主机桩上——行留 + 502 人话；链本体正确性归沙盒批测试）
  w.db.prepare("DELETE FROM sandbox_settings WHERE k = 'maxBoxesPerRunner'").run()
  w.db.prepare("DELETE FROM sandbox_workspaces WHERE name = '已绑的'").run()
  await expectHttp(meCall(routes, "POST", "/api/me/sandbox/workspaces", { cookie, body: { name: "走链的" } }), { code: "upstream_error", status: 502, match: /^建盒链失败（行留/ })
  const chained = w.db.prepare("SELECT * FROM sandbox_workspaces WHERE name = '走链的'").get()
  assert.equal(chained.runner_id, runner.id) // 放置已绑（行留——重试续链）
  assert.ok(host.calls.some((call) => call.op === "host.run" && String(call.command).includes("mkdir -p"))) // 链已进入（① 卷目录）
})

test("T10 工作区动作（N73/E56）：盒离线 ⇒ 409 + 启动指引 ∥ start/stop/destroy 链 + 确认门 ∥ 动作行 by:\"member\"", async (t) => {
  const w = world(t)
  const client = fakeDocker()
  const host = fakeHost()
  const { routes, relay } = face(w, t, { fetchImpl: probeFetch(), deps: { clientForRunner: () => client, host } })
  const runner = seedRunner(w.db)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice, { runnerId: runner.id })
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token

  // 盒离线 ⇒ 409（含启动指引）∥ 节点不可达 ⇒ 503（绑定节点探活门）
  await expectHttp(meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:1/messages`, { cookie, body: { content: "x" } }), { code: "workspace_offline", status: 409, match: /启动工作区/ })
  const unreachableFace = face(w, t, { fetchImpl: probeFetch({ fail: true }), deps: { clientForRunner: () => client, host } })
  await expectHttp(meCall(unreachableFace.routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/start`, { cookie, body: {} }), { code: "sandbox_unavailable", status: 503, match: /不可达/ })

  // 盒在跑 ⇒ start 幂等（noop）
  client.boxes.push({ Id: "cid-1", Names: [`tc-ws-${workspace.id}`], State: "running" })
  const started = await meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/start`, { cookie, body: {} })
  assert.equal(started.status, 200)
  assert.deepEqual(started.json().noop, true)

  const stopped = await meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/stop`, { cookie, body: {} })
  assert.equal(stopped.json().stopped, true)
  assert.equal(w.db.prepare("SELECT stop_reason FROM sandbox_workspaces WHERE id = ?").get(workspace.id).stop_reason, "manual")

  // 销毁：无 confirm ⇒ 400（读数先行——boxState ∥ 快照数）；确认 ⇒ 链 + key 吊销
  await expectHttp(meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/destroy`, { cookie, body: {} }), { code: "invalid_request_error", status: 400, match: /confirm/ })
  assert.ok(w.db.prepare("SELECT id FROM sandbox_workspaces WHERE id = ?").get(workspace.id), "未确认 ⇒ 行留")
  const destroyed = await meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/destroy`, { cookie, body: { confirm: true, deleteVolume: false } })
  assert.equal(destroyed.json().destroyed, true)
  assert.equal(w.db.prepare("SELECT id FROM sandbox_workspaces WHERE id = ?").get(workspace.id), undefined)
  assert.equal(w.db.prepare("SELECT status FROM api_keys WHERE id = ?").get(workspace.key_id).status, "revoked")
  await expectHttp(meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/rotate`, { cookie, body: {} }), { code: "invalid_request_error", status: 400, match: /未知动作/ })

  // 动作行（§2.1：kind 沿既有枚举 + detail.by = "member"）
  const actions = auditRows(w.db).filter((row) => row.type === "sandbox_event")
  for (const kind of ["box_start", "box_stop", "workspace_destroy"]) {
    const hit = actions.find((row) => row.detail.kind === kind && row.detail.by === "member")
    assert.ok(hit, `缺成员动作行：${kind}`)
    assert.equal(hit.actor, "Alice")
  }
  assert.equal(relay.online(workspace.id), false) // 全程无盒连接
})

// ── T11 拉仓（N74/E57）───────────────────────────────────────────────────

test("T11 拉仓（N74）：可见性门 ⇒ 404 ∥ 组装（凭据不随命令）∥ 结果对位 ∥ 审计 pull ∥ 目录形门", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  const project = Number(w.db.prepare("INSERT INTO projects (display_name, address, created_at) VALUES ('仓一', 'gitee.com/team/repo', '2026-01-01T00:00:00.000Z')").run().lastInsertRowid)
  w.db.prepare("INSERT INTO project_members (project_id, username, level, created_at, updated_at) VALUES (?, 'alice', 'read', 't', 't')").run(project)
  const hidden = Number(w.db.prepare("INSERT INTO projects (display_name, address, created_at) VALUES ('仓二', 'gitee.com/team/secret', '2026-01-01T00:00:00.000Z')").run().lastInsertRowid)

  // 未连盒：项目不可见 ⇒ 404 不辨（门序 = 项目可见性先于盒态——零泄露）∥ 可见项目 ⇒ 409 盒离线
  await expectHttp(meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/pulls`, { cookie, body: { projectId: hidden } }), { code: "not_found", status: 404, match: /项目不存在或不可见/ })
  await expectHttp(meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/pulls`, { cookie, body: { projectId: project } }), { code: "workspace_offline", status: 409 })

  const box = attachBox(routes, { workspace, key })
  await expectHttp(meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/pulls`, { cookie, body: { projectId: project, dir: "/abs" } }), { code: "invalid_request_error", status: 400, match: /相对路径/ })

  const startPending = meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/pulls`, { cookie, body: { projectId: project } })
  await tick()
  const pullFrame = box.last("pull")
  assert.deepEqual(Object.keys(pullFrame.data).sort(), ["cmdId", "dir", "url"]) // 凭据不随命令（零 username/password 键）
  assert.equal(pullFrame.data.url, "https://gitee.com/team/repo.git")
  assert.equal(pullFrame.data.dir, "repo")
  const started = await startPending
  const pullId = started.json().pullId
  assert.equal(typeof pullId, "string")
  const running = await meCall(routes, "GET", `/api/me/sandbox/workspaces/${workspace.id}/pulls/${pullId}`, { cookie })
  assert.equal(running.json().state, "running")

  await boxAnswer(routes, box, { key, cmdId: pullFrame.data.cmdId, state: "done", detail: { dir: "repo", bytes: 1024 } })
  await tick()
  const done = await meCall(routes, "GET", `/api/me/sandbox/workspaces/${workspace.id}/pulls/${pullId}`, { cookie })
  assert.equal(done.json().state, "done")
  assert.equal(done.json().detail.bytes, 1024)

  // 归属判：同一 pullId 经另一工作区路径 ⇒ 不辨（未知同形——零枚举面）
  const second = seedWorkspace(w.db, w.alice, { name: "工作区 2" })
  const foreignPull = await meCall(routes, "GET", `/api/me/sandbox/workspaces/${second.row.id}/pulls/${pullId}`, { cookie })
  assert.deepEqual(foreignPull.json(), { state: "failed", detail: "结果未知——重试" })

  // 失败径（结果对位：state=failed）
  const failedPending = meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/pulls`, { cookie, body: { projectId: project, dir: "sub" } })
  await tick()
  const pullFrame2 = box.last("pull")
  assert.equal(pullFrame2.data.dir, "sub")
  await boxAnswer(routes, box, { key, cmdId: pullFrame2.data.cmdId, state: "failed", detail: { message: "认证失败——请检查凭据" } })
  const failed = await failedPending
  const failedState = await meCall(routes, "GET", `/api/me/sandbox/workspaces/${workspace.id}/pulls/${failed.json().pullId}`, { cookie })
  assert.equal(failedState.json().state, "failed")
  assert.match(failedState.json().detail.message, /认证失败/)

  const pulls = auditRows(w.db).filter((row) => row.detail.kind === "pull")
  assert.equal(pulls.length, 2)
  assert.equal(pulls[0].type, "member_event")
  assert.equal(pulls[0].target, `workspace:${workspace.id}`)
  assert.equal(pulls[0].detail.ok, true)
  assert.equal(pulls[1].detail.ok, false)
  assert.equal(pulls[1].detail.reason, "认证失败——请检查凭据") // 零秘密（无凭据字段）
})

// ── T12/T13 凭据（N78/E57）──────────────────────────────────────────────

test("T12 git 凭据三端点（N78）：绑/列/撤 ∥ 密文落库零回显 ∥ 唯一键 upsert ∥ 审计两 kind", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token

  assert.deepEqual((await meCall(routes, "GET", "/api/me/git-credentials", { cookie })).json(), { credentials: [] })
  const put = await meCall(routes, "PUT", "/api/me/git-credentials", { cookie, body: { host: "Gitee.com", username: "alice", secret: "s3cret-token" } })
  assert.equal(put.status, 200)
  assert.deepEqual(put.json().credential, { host: "gitee.com", username: "alice", updatedAt: put.json().credential.updatedAt })
  assert.equal(JSON.stringify(put.json()).includes("s3cret-token"), false) // 零回显

  const row = w.db.prepare("SELECT * FROM member_git_credentials WHERE member_id = ?").get(w.alice.id)
  assert.notEqual(row.secret_cipher, "s3cret-token")
  assert.match(row.secret_cipher, /^[^|]+\|[^|]+\|[^|]+$/) // iv|tag|ct 包形
  assert.equal(JSON.stringify(row).includes("s3cret-token"), false)

  await expectHttp(meCall(routes, "PUT", "/api/me/git-credentials", { cookie, body: { host: "b", username: "" } }), { code: "invalid_request_error", status: 400, match: /不可为空/ })
  await expectHttp(meCall(routes, "PUT", "/api/me/git-credentials", { cookie, body: { host: "https://x.com", username: "u", secret: "s" } }), { code: "invalid_request_error", status: 400 })

  const again = await meCall(routes, "PUT", "/api/me/git-credentials", { cookie, body: { host: "gitee.com", username: "alice2", secret: "s3cret-2" } })
  assert.equal(again.json().credential.username, "alice2")
  assert.equal(w.db.prepare("SELECT COUNT(*) AS n FROM member_git_credentials WHERE member_id = ?").get(w.alice.id).n, 1) // upsert（唯一键）
  const list = await meCall(routes, "GET", "/api/me/git-credentials", { cookie })
  assert.deepEqual(list.json().credentials, [{ host: "gitee.com", username: "alice2", updatedAt: again.json().credential.updatedAt }])

  const revoked = await meCall(routes, "DELETE", "/api/me/git-credentials/gitee.com", { cookie })
  assert.deepEqual(revoked.json(), { ok: true })
  await expectHttp(meCall(routes, "DELETE", "/api/me/git-credentials/gitee.com", { cookie }), { code: "not_found", status: 404, match: /未绑定/ })

  const kinds = auditRows(w.db).filter((item) => item.type === "member_event").map((item) => item.detail.kind)
  assert.deepEqual(kinds, ["credential_set", "credential_set", "credential_revoke"])
  const set = auditRows(w.db).find((item) => item.detail.kind === "credential_set")
  assert.equal(set.target, "host:gitee.com")
  assert.equal(set.detail.username, "alice")
  assert.equal(JSON.stringify(set).includes("s3cret"), false) // detail 零秘密
})

test("T13 凭据取件（E57）：工作区 key 判权 ∥ 未绑定 ⇒ 404 人话指账户页 ∥ 绑定后取件逐形", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  const { key } = seedWorkspace(w.db, w.alice)
  const memberKey = (await issueKey(w.db, w.alice.id)).plain

  await expectHttp(boxCall(routes, "POST", "/api/box/credential", { key: "sandbox:nope", body: { host: "gitee.com" } }), { code: "invalid_api_key", status: 401 })
  await expectHttp(boxCall(routes, "POST", "/api/box/credential", { key: memberKey, body: { host: "gitee.com" } }), { code: "invalid_api_key", status: 401, match: /非工作区凭据/ })
  await expectHttp(boxCall(routes, "POST", "/api/box/credential", { key, body: { host: "gitee.com" } }), { code: "not_found", status: 404, match: /账户/ })

  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  await meCall(routes, "PUT", "/api/me/git-credentials", { cookie, body: { host: "gitee.com", username: "alice", secret: "tok-1234" } })
  const got = await boxCall(routes, "POST", "/api/box/credential", { key, body: { host: "GITEE.com" } })
  assert.deepEqual(got.json(), { username: "alice", password: "tok-1234" })
  assert.deepEqual(Object.keys(got.json()), ["username", "password"]) // 逐形（零额外键）

  // 取件直读（同源口径）
  const direct = credentialForHost(w.db, { memberId: w.alice.id, host: "gitee.com", config: w.config })
  assert.deepEqual(direct, { username: "alice", password: "tok-1234" })
  assert.equal(credentialForHost(w.db, { memberId: w.bob.id, host: "gitee.com", config: w.config }), null) // 他人凭据零可见

  await expectHttp(boxCall(routes, "POST", "/api/box/credential", { key, body: { host: "" } }), { code: "invalid_request_error", status: 400 })
})

// ── T14 上行结果口 + 流式体读路由级例外（N75）──────────────────────────────

test("T14 命令结果口与体门（N75）：未知/已了结 cmdId ⇒ 400 零副作用 ∥ NDJSON 流式体读例外（真 dispatch）", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const attached = attachBox(routes, { workspace, key })
  assert.ok(attached.hello())

  await expectHttp(boxCall(routes, "POST", "/api/box/commands/cmd-999/result", { key, body: { state: "done" } }), { code: "invalid_request_error", status: 400, match: /未知或已了结/ })

  // 跨工作区结果口（工作区不符 ⇒ 400 零副作用）
  const other = seedWorkspace(w.db, w.bob, { name: "工作区 2" })
  const pending = meCall(routes, "GET", "/api/me/chat/sessions", { cookie: createSession(w.db, w.alice.id, { now: w.clock.t }).token })
  await tick()
  const cmd = attached.last("cmd")
  await expectHttp(boxCall(routes, "POST", `/api/box/commands/${cmd.data.cmdId}/result`, { key: other.key, body: { state: "done", detail: { sessions: [] } } }), { code: "invalid_request_error", status: 400 })
  await boxAnswer(routes, attached, { key, cmdId: cmd.data.cmdId, detail: { sessions: [] } })
  await pending

  // 真 dispatch：`turns` = 路由级 NDJSON 例外（其余写端点仍卡 application/json）
  const serverRoutes = createRouteTable()
  let bytes = 0
  serverRoutes.add("POST", "/api/box/sessions/:id/turns", async (req, res) => {
    const result = await readStreamBody(req, { onChunk: (chunk) => (bytes += chunk.length) })
    sendJson(res, 200, { ok: true, bytes: result.bytes })
  })
  serverRoutes.add("POST", "/api/box/commands/:cmdId/result", async (req, res) => {
    await readJsonBody(req).catch(() => null)
    sendJson(res, 200, { ok: true })
  })
  const server = createGatewayServer({ config: {}, routes: serverRoutes })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  t.after(() => server.close())
  const base = `http://127.0.0.1:${server.address().port}`

  const payload = '{"type":"begin","cmdId":"c1"}\n{"type":"end","status":"succeeded"}\n'
  const accepted = await fetch(`${base}/api/box/sessions/1:2/turns`, { method: "POST", headers: { "content-type": "application/x-ndjson" }, body: payload })
  assert.equal(accepted.status, 200)
  assert.equal((await accepted.json()).bytes, payload.length)
  assert.equal(bytes, payload.length) // 逐块交 onChunk（流式——非整段缓冲）

  const rejected = await fetch(`${base}/api/box/commands/c1/result`, { method: "POST", headers: { "content-type": "text/plain" }, body: "{}" })
  assert.equal(rejected.status, 400)
  const rejectedNdjson = await fetch(`${base}/api/box/commands/c1/result`, { method: "POST", headers: { "content-type": "application/x-ndjson" }, body: "{}" })
  assert.equal(rejectedNdjson.status, 400) // 例外只限 turns 路由
})

test("T14b 回合体非法 ⇒ 400 且在途态回收（工作区级门不锁死）", async (t) => {
  const w = world(t)
  const { routes, relay } = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  const box = attachBox(routes, { workspace, key })

  const pending = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "跑" } })
  await tick()
  assert.ok(box.last("run"), "下行 run 未到达")

  // 首帧非 `begin` ⇒ 400；在途回合须随之回收（残留 = 工作区级门恒闭）
  await expectHttp(boxTurns(routes, key, "3", [{ type: "turn", n: 1 }]), { code: "invalid_request_error", status: 400, match: /begin/ })
  assert.equal(relay.busy(workspace.id), false)
  const turn = await pending
  const frames = turn.text.trim().split("\n").map((line) => JSON.parse(line))
  assert.deepEqual(frames.map((frame) => frame.type), ["end"]) // 失败收尾（人话在 detail——零落库面）
  assert.equal(frames[0].status, "failed")
  assert.equal(frames[0].reason, "model_error")
  assert.equal(relay.online(workspace.id), true) // 连接未动——在线态不回卷

  // `begin` 携未知 cmdId ⇒ 404 零副作用：该槽在途回合**不被误收尾**
  const third = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "三跑" } })
  await tick()
  await expectHttp(boxTurns(routes, key, "3", [{ type: "begin", cmdId: "no-such" }]), { code: "not_found", status: 404 })
  assert.equal(relay.busy(workspace.id), true) // 拒绝该流 ≠ 收尾在途回合
  const runCmd = box.last("run").data.cmdId
  await boxTurns(routes, key, "3", [{ type: "begin", cmdId: runCmd }, { type: "end", status: "succeeded" }])
  assert.equal(relay.busy(workspace.id), false)
  await third

  // 行非 JSON（begin 前）⇒ 同收回；且门已解 ⇒ 再发即放行
  const again = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "再跑" } })
  await tick()
  await expectHttp(boxTurns(routes, key, "3", ["不是 JSON 的一行\n"]), { code: "invalid_request_error", status: 400, match: /NDJSON/ })
  assert.equal(relay.busy(workspace.id), false)
  await again
})


// ── T15 六 kind 审计汇总（机制行）────────────────────────────────────────

test("T15 机制行（审计）：member_event 六 kind 落行（chat_start ∥ chat_call ∥ chat_stop ∥ pull ∥ credential_set ∥ credential_revoke）", async (t) => {
  const w = world(t)
  const { routes, relay } = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  const project = Number(w.db.prepare("INSERT INTO projects (display_name, address, created_at) VALUES ('仓', 'gitee.com/t/r', 't')").run().lastInsertRowid)
  w.db.prepare("INSERT INTO project_members (project_id, username, level, created_at, updated_at) VALUES (?, 'alice', 'read', 't', 't')").run(project)
  const box = attachBox(routes, { workspace, key })

  // chat_start
  seedProvider(w.db)
  const createPending = meCall(routes, "POST", "/api/me/chat/sessions", { cookie, body: { workspaceId: workspace.id, model: "openai/gpt-x" } })
  await tick()
  await boxAnswer(routes, box, { key, cmdId: box.last("cmd").data.cmdId, detail: { id: 4 } })
  await createPending

  // chat_call（工具调用行）+ chat_stop（失败收尾）
  const turnPending = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:4/messages`, { cookie, body: { content: "跑" } })
  await tick()
  const run = box.last("run")
  await boxTurns(routes, key, "4", [{ type: "begin", cmdId: run.data.cmdId }, { type: "call", id: "t9", name: "verify", args: "{}" }, { type: "result", id: "t9", ok: false, summary: "失败" }, { type: "end", status: "failed", reason: "model_error" }])
  await turnPending

  // pull
  const pullPending = meCall(routes, "POST", `/api/me/sandbox/workspaces/${workspace.id}/pulls`, { cookie, body: { projectId: project } })
  await tick()
  await boxAnswer(routes, box, { key, cmdId: box.last("pull").data.cmdId, state: "done", detail: {} })
  await pullPending

  // credential_set ∥ credential_revoke
  await meCall(routes, "PUT", "/api/me/git-credentials", { cookie, body: { host: "gitee.com", username: "alice", secret: "tok-1" } })
  await meCall(routes, "DELETE", "/api/me/git-credentials/gitee.com", { cookie })

  const kinds = new Set(auditRows(w.db).map((row) => row.detail.kind))
  for (const kind of ["chat_start", "chat_call", "chat_stop", "pull", "credential_set", "credential_revoke"]) {
    assert.ok(kinds.has(kind), `缺审计 kind：${kind}`)
  }
  assert.ok(auditRows(w.db).every((row) => row.type === "member_event"))
  assert.equal(w.db.prepare("SELECT COUNT(*) AS n FROM audit_events WHERE type = 'member_event'").get().n, 6)
  assert.equal(relay.online(workspace.id), true)
})

// ── T16 转发掩蔽（`result.content`——管理面同源值掩蔽）──────────────────────

test("T16 转发掩蔽（`result.content`）：`call.args` 敏感键值 ⇒ 转发 content 掩蔽后 ∥ 保全文长度（不套截断）∥ `summary` 无秘密值 ⇒ 恒等透传", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  const box = attachBox(routes, { workspace, key })

  const pending = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "跑" } })
  await tick()
  const run = box.last("run")
  const secret = "sk-leak-1a2b3c"
  const content = `$ cat ~/.netrc\nmachine gitee.com password ${secret}\n${"x".repeat(900)}`
  await boxTurns(routes, key, "3", [
    { type: "begin", cmdId: run.data.cmdId },
    { type: "call", id: "t1", name: "bash", args: JSON.stringify({ password: secret, cmd: "cat ~/.netrc" }) },
    { type: "result", id: "t1", ok: true, summary: "退出码 0", content },
    { type: "end", status: "succeeded", durationMs: 5, calls: 1 },
  ])
  const turn = await pending
  const frames = turn.text.trim().split("\n").map((line) => JSON.parse(line))
  const result = frames.find((frame) => frame.type === "result")
  assert.equal(result.content, content.split(secret).join("***")) // 值掩蔽（所有出现位替换——秘密值 = 该调用 args 敏感键值）
  assert.ok(!result.content.includes(secret))
  assert.ok(result.content.length > 500) // 逾 `args ≤500` ∥ `摘要 ≤300` 两线仍在场——content 不套截断（保全文）
  assert.equal(result.summary, "退出码 0") // 无秘密值的 summary 不受掩蔽影响（恒等透传；携秘密值的情形 = T16b）
})

// ── T16b 转发掩蔽（`result.summary`——随裁同轮补）─────────────────────────

test("T16b 转发掩蔽（`result.summary`）：summary 携秘密值 ⇒ 转发帧掩蔽后 ∥ 审计行 `detail.summary` 同拍掩蔽", async (t) => {
  const w = world(t)
  const { routes } = face(w, t)
  const { row: workspace, key } = seedWorkspace(w.db, w.alice)
  const cookie = createSession(w.db, w.alice.id, { now: w.clock.t }).token
  const box = attachBox(routes, { workspace, key })

  const pending = meCall(routes, "POST", `/api/me/chat/sessions/${workspace.id}:3/messages`, { cookie, body: { content: "跑" } })
  await tick()
  const run = box.last("run")
  const secret = "sk-summary-7x9y2z"
  await boxTurns(routes, key, "3", [
    { type: "begin", cmdId: run.data.cmdId },
    { type: "call", id: "s1", name: "bash", args: JSON.stringify({ password: secret, cmd: "env" }) },
    { type: "result", id: "s1", ok: true, summary: `TOKEN=${secret} 已泄漏`, content: "同上" },
    { type: "end", status: "succeeded", durationMs: 3, calls: 1 },
  ])
  const turn = await pending
  const frames = turn.text.trim().split("\n").map((line) => JSON.parse(line))
  const result = frames.find((frame) => frame.type === "result")
  assert.equal(result.summary, "TOKEN=*** 已泄漏") // 转发帧 summary = 值掩蔽后（秘密值 = 该调用 args 敏感键值——与 content 同取值面）
  const callRows = auditRows(w.db).filter((row) => row.detail.kind === "chat_call")
  assert.ok(callRows.some((row) => row.detail.summary === "TOKEN=*** 已泄漏")) // 审计行 `detail.summary` 同拍掩蔽
  assert.ok(callRows.every((row) => !String(row.detail.summary).includes(secret))) // 零泄漏
})
