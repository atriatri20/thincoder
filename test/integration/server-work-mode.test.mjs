/**
 * server-work-mode.test.mjs — Server 三档模式根集成测试（批次 #2393）。
 *
 * 真实入口链 = composer setMode（`#mode-select` change → `writeFlag` → `onSelectFlag`）
 * → member PATCH（真路由 `PATCH /api/me/chat/sessions/:id`，真 DB + key 鉴权 + 真 relay）
 * → 盒内槽写（真 `createCoreRun.updateSession` → `setSlotMode` 落盘）
 * → 盒内槽恢复（`loadSlotFile` + `applySession` 回读 mode）。
 *
 * 另验一个非法 mode：真 PATCH 400 拒，零 `session.update` 到达盒，槽零变。
 * 参考 = thincoder-server/test/work-mode.test.mjs（包内 7 项已通过）；运行 = `node --test test/integration/server-work-mode.test.mjs`（自仓根）。
 */
import { after, beforeEach, test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync } from "node:fs"
import { Readable } from "node:stream"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { pathToFileURL } from "node:url"
import { createRequire, registerHooks } from "node:module"

import { applySession, loadSlotFile, loadManifest, newSession, slotPath } from "../../thincoder-core/session.mjs"
import { setSlotAdvisorGuard, setSlotAutoApprove, setSlotMode, setSlotPlanMode, setSlotPrefs } from "../../thincoder-core/session-slot-write.mjs"
import { createAgent } from "../../thincoder-core/agent.mjs"
import { resolveWorkMode } from "../../thincoder-core/config.mjs"
import { _resetSessionsDirForTest, _setSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
import { removeTempDirBestEffort } from "../teardown.mjs"

// ── `/rc/` ∥ `@thincoder/render-core` 解析钩子（仓根无 node_modules——包内先例 thincoder-server/test/rc-resolve.mjs 同法；
//    钩子注册后再动态 import 服务端模块，避免静态 import 先于钩子解析失败）。──
const serverRequire = createRequire(new URL("../../thincoder-server/package.json", import.meta.url))
const renderCoreRoot = dirname(serverRequire.resolve("@thincoder/render-core/package.json"))
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("/rc/")) {
      return { url: pathToFileURL(join(renderCoreRoot, specifier.slice(4))).href, shortCircuit: true }
    }
    if (specifier.startsWith("@thincoder/render-core/")) {
      return { url: pathToFileURL(join(renderCoreRoot, specifier.slice("@thincoder/render-core/".length))).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})

const { setStrings } = await import("/rc/i18n.mjs")
const { EN_CORE } = await import("../../thincoder-server/public/i18n-en-core.mjs")
const { createMeChatComposer } = await import("../../thincoder-server/public/views-me-chat-composer.mjs")
const { registerMemberRoutes } = await import("../../thincoder-server/src/agent/member-routes.mjs")
const { createRouteTable } = await import("../../thincoder-server/src/gateway/server.mjs")
const { issueKey } = await import("../../thincoder-server/src/accounts/keys.mjs")
const { openDatabase } = await import("../../thincoder-server/src/store/db.mjs")
const { createCoreRun } = await import("../../thincoder-server/deploy/sandbox/member-shell/core-run.mjs")
const { flagsOf } = await import("../../thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs")
const { createMemberRelay } = await import("../../thincoder-server/src/agent/member-relay.mjs")
const { h, installMiniDom } = await import("../../thincoder-server/test/mini-dom.mjs")

const cleanup = []
after(() => {
  _resetSessionsDirForTest()
  for (const path of cleanup) removeTempDirBestEffort(path)
})
beforeEach(() => {
  installMiniDom()
  setStrings(EN_CORE)
})

function tempDir(tag) {
  const path = mkdtempSync(join(tmpdir(), `server-work-mode-int-${tag}-`))
  cleanup.push(path)
  return path
}

/** 恢复用裸 agent（沿包内 work-mode.test.mjs 第 7 项同形）。 */
function bareAgent(root, mode = "normal") {
  const provider = { name: "server", model: "demo", baseURL: "http://127.0.0.1:1/v1" }
  return createAgent({
    provider, tools: [], cwd: root, memory: null,
    config: { agent: { mode, engineering: mode === "engineering" }, providersList: [provider] },
  })
}

/** 真成员面 PATCH 调用器（真路由 handler + 真 key 鉴权 + 真请求体读取）。 */
function patchInvoker(s, slot) {
  const route = s.routes.resolve("PATCH", `/api/me/chat/sessions/${s.workspaceId}:${slot}`)
  return async (body) => {
    const req = Readable.from([Buffer.from(JSON.stringify(body))])
    req.headers = { authorization: `Bearer ${s.key.plain}` }
    const res = {
      headersSent: false,
      writeHead(status) { this.status = status; this.headersSent = true },
      end(text) { this.text = text },
    }
    await route.handler(req, res, { params: route.params })
    return res
  }
}

/** 真环境：盒（createCoreRun）+ 真 relay（SSE 假 res 把 `session.update` 派到真盒并回呈）+ 真成员面路由 + 真槽。 */
async function scene({ mode = "normal" } = {}) {
  const cwd = tempDir("proj")
  _setSessionsDirForTest(tempDir("slots"))

  const db = openDatabase(":memory:")
  const memberId = Number(db.prepare("INSERT INTO members (username, name, password_hash, role, created_at) VALUES ('user', 'User', 'unused', 'user', 'now')").run().lastInsertRowid)
  const key = issueKey(db, memberId)
  db.prepare("INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, created_at) VALUES ('ws', ?, ?, 'workspace-key', 'now')").run(memberId, key.id)
  const workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE id = ?").get(1)
  const workspaceId = Number(workspace.id)

  const config = { agent: { mode } }
  const core = {
    loadConfig: () => config, resolveWorkMode, newSession, setSlotPrefs, setSlotMode,
    setSlotAutoApprove, setSlotPlanMode, setSlotAdvisorGuard, loadSlotFile, loadManifest, slotPath,
  }
  const coreRun = createCoreRun({ cwd, core })

  const relay = createMemberRelay({ pingIntervalMs: 60_000 })
  const boxUpdates = []
  relay.attach(workspace, {
    write(text) {
      const event = /^event: ([^\n]*)/m.exec(text)
      if (!event || event[1] !== "cmd") return
      const data = /^data: (.*)$/m.exec(text)
      let payload = null
      try { payload = data ? JSON.parse(data[1]) : null } catch { return }
      if (payload?.kind !== "session.update") return
      boxUpdates.push(payload.args)
      try {
        const out = coreRun.updateSession(payload.args)
        relay.completeCommand(payload.cmdId, { state: "done", detail: out, workspaceId })
      } catch (e) {
        relay.completeCommand(payload.cmdId, { state: "failed", detail: { kind: e?.kind ?? "internal", message: String(e?.message ?? e) }, workspaceId })
      }
    },
    end() {},
  })

  const routes = createRouteTable()
  registerMemberRoutes(routes, { db, relay })

  const created = await coreRun.createSession({ model: "server/demo" })
  return { cwd, db, key, workspaceId, coreRun, relay, boxUpdates, routes, slot: String(created.id), created }
}

test("composer setMode walks the real PATCH into the box slot and the mode survives restore", async (t) => {
  const s = await scene({ mode: "normal" })
  t.after(() => s.db.close())
  const initial = flagsOf(loadSlotFile(s.cwd, s.created.id))
  assert.equal(initial.mode, "normal", "新会话继承 agent.mode")

  let flags = { ...initial }
  const patched = []
  let resolveSignal
  const signal = new Promise((resolve) => { resolveSignal = resolve })
  const invoke = patchInvoker(s, s.slot)

  const root = document.createElement("main")
  document.body.append(root)
  const composer = createMeChatComposer({ h }, {
    root,
    currentChat: () => ({ id: `${s.workspaceId}:${s.slot}`, model: "server/demo", reasoning: null }),
    flagsOf: () => flags,
    readings: () => ({}),
    onSelectFlag: async (name, value) => {
      const body = name === "mode" ? { mode: value } : { [name]: value === true }
      const res = await invoke(body)
      if (res.status !== 200) return false
      const session = JSON.parse(res.text).session
      flags = { ...flags, ...session.flags }
      patched.push({ name, value })
      resolveSignal()
      return true
    },
  })

  const select = root.querySelector("#mode-select")
  assert.deepEqual(select.options.map((option) => option.value), ["minimal", "normal", "engineering"], "三档模式")
  assert.equal(select.value, "normal")

  select.value = "engineering"
  select.dispatch("change")
  await signal

  assert.deepEqual(patched, [{ name: "mode", value: "engineering" }], "composer 真发了一次 setMode")
  assert.deepEqual(s.boxUpdates, [{ slot: s.slot, mode: "engineering" }], "真 PATCH 落盒一次 session.update")

  const data = loadSlotFile(s.cwd, s.created.id)
  assert.equal(data.mode, "engineering", "盒内槽已写 engineering")
  assert.equal(data.planMode, false, "engineering 写槽时清 PLAN")

  const restored = bareAgent(s.cwd, "normal")
  applySession(restored, data)
  assert.equal(restored.config.agent.mode, "engineering", "盒内槽恢复 engineering")
  assert.equal(restored.config.agent.engineering, true)
})

test("an illegal mode is rejected by the real PATCH and never reaches the box", async (t) => {
  const s = await scene({ mode: "normal" })
  t.after(() => s.db.close())
  const invoke = patchInvoker(s, s.slot)

  await assert.rejects(() => invoke({ mode: "bad" }), /mode 须为/)

  assert.equal(s.boxUpdates.length, 0, "非法 mode 零 session.update 到达盒")
  assert.equal(loadSlotFile(s.cwd, s.created.id).mode, "normal", "槽零变")
})
