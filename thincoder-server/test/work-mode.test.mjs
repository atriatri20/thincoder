import { after, beforeEach, test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, readFileSync } from "node:fs"
import { Readable } from "node:stream"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { setStrings } from "/rc/i18n.mjs"
import { EN_CORE } from "../public/i18n-en-core.mjs"
import { ZH_CORE } from "../public/i18n-zh-core.mjs"
import {
  FLAG_KEYS, WORK_MODES, createMeChatComposer, createSlashCommands, workModeOf,
} from "../public/views-me-chat-composer.mjs"
import { SESSION_SETTING_KEYS, registerMemberRoutes, sessionRowOf } from "../src/agent/member-routes.mjs"
import { createRouteTable } from "../src/gateway/server.mjs"
import { issueKey } from "../src/accounts/keys.mjs"
import { openDatabase } from "../src/store/db.mjs"
import { createCoreRun } from "../deploy/sandbox/member-shell/core-run.mjs"
import { flagsOf, mergeSlotControl } from "../deploy/sandbox/member-shell/core-run-util.mjs"
import { removeTempDirBestEffort } from "../../test/teardown.mjs"
import {
  applySession, loadSlotFile, newSession, loadManifest, slotPath, saveSession,
} from "../../thincoder-core/session.mjs"
import {
  setSlotAutoApprove, setSlotAdvisorGuard, setSlotMode, setSlotPlanMode, setSlotPrefs,
} from "../../thincoder-core/session-slot-write.mjs"
import { createAgent } from "../../thincoder-core/agent.mjs"
import { resolveWorkMode } from "../../thincoder-core/config.mjs"
import { _resetSessionsDirForTest, _setSessionsDirForTest } from "../../thincoder-core/session-slots.mjs"
import { h, installMiniDom } from "./mini-dom.mjs"

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
  const path = mkdtempSync(join(tmpdir(), `server-work-mode-${tag}-`))
  cleanup.push(path)
  return path
}

function bareAgent(root, mode = "normal") {
  const provider = { name: "server", model: "demo", baseURL: "http://127.0.0.1:1/v1" }
  return createAgent({
    provider, tools: [], cwd: root, memory: null,
    config: { agent: { mode, engineering: mode === "engineering" }, providersList: [provider] },
  })
}

test("Server composer renders three localized modes and sends setMode through the real adapter", async () => {
  let flags = { autoApprove: false, advisorGuard: false, mode: "engineering", planMode: true }
  const writes = []
  const root = document.createElement("main")
  document.body.append(root)
  const composer = createMeChatComposer({ h }, {
    root,
    currentChat: () => null,
    flagsOf: () => flags,
    readings: () => ({}),
    onSelectFlag: async (name, value) => {
      writes.push({ name, value })
      flags = { ...flags, [name]: value, ...(name === "mode" && value === "engineering" ? { planMode: false } : {}) }
      return true
    },
  })
  const select = root.querySelector("#mode-select")
  const plan = root.querySelector("#plan-btn")
  assert.deepEqual(select.options.map((option) => option.value), ["tiny", "normal", "engineering"])
  assert.deepEqual(select.options.map((option) => option.textContent), ["MIN", "NORMAL", "ENG"])
  assert.equal(select.value, "engineering")
  assert.equal(plan.disabled, true, "legacy plan residue must not survive engineering restore")
  assert.equal(plan.classList.contains("active"), false)

  select.value = "tiny"
  select.dispatch("change")
  await Promise.resolve()
  await Promise.resolve()
  assert.deepEqual(writes, [{ name: "mode", value: "tiny" }])
  assert.equal(select.value, "tiny")
  assert.equal(plan.disabled, false)

  flags = { ...flags, mode: "engineering", planMode: true }
  composer.syncFlags()
  assert.equal(select.value, "engineering")
  assert.equal(plan.disabled, true)
  assert.equal(plan.classList.contains("active"), false)
})

test("Server mode reader migrates legacy engineering without exposing a second writable flag", () => {
  assert.deepEqual(WORK_MODES, ["tiny", "normal", "engineering"])
  assert.deepEqual(FLAG_KEYS, ["autoApprove", "advisorGuard", "planMode"])
  assert.equal(workModeOf({ mode: "minimal", engineering: true }), "tiny", "旧值 minimal 归一为 tiny（读兼容夹具）")
  assert.equal(workModeOf({ mode: "normal", engineering: true }), "normal")
  assert.equal(workModeOf({ engineering: true }), "engineering")
  assert.equal(workModeOf({ engineering: false }), "normal")
  assert.equal(workModeOf({}), "normal")
  assert.ok(!SESSION_SETTING_KEYS.includes("engineering"))
  assert.ok(SESSION_SETTING_KEYS.includes("mode"))
})

test("Server slash commands share mode actions: tiny/eng toggle and normal is constant", () => {
  let mode = "normal"
  const calls = []
  const commands = createSlashCommands({ mode: () => mode })
  const actions = {
    toggleEng: () => { calls.push("toggleEng"); return true },
    setMode: (value) => { calls.push(value); return true },
  }
  const run = (name) => commands.find((command) => command.name === name).run({ actions })
  assert.equal(run("/tiny"), true)
  assert.equal(mode, "normal")
  assert.equal(calls.pop(), "tiny")
  mode = "tiny"
  assert.equal(run("/tiny"), true)
  assert.equal(calls.pop(), "normal")
  mode = "engineering"
  assert.equal(run("/normal"), true)
  assert.equal(calls.pop(), "normal")
  assert.equal(run("/eng"), true)
  assert.equal(calls.pop(), "toggleEng")
  assert.equal(commands.find((command) => command.name === "/plan").rejectKey, "toolbar.planDisabled")
})

test("Server row projection carries authoritative mode, legacy migration and effective PLAN", () => {
  const workspace = { id: 7, name: "ws" }
  const modern = sessionRowOf(workspace, { slot: 2, flags: { mode: "minimal", engineering: true, planMode: true } })
  assert.deepEqual(modern.flags, { autoApprove: false, planMode: true, advisorGuard: false, mode: "tiny" })
  const legacy = sessionRowOf(workspace, { slot: 3, flags: { engineering: true, planMode: true } })
  assert.deepEqual(legacy.flags, { autoApprove: false, planMode: false, advisorGuard: false, mode: "engineering" })
  assert.ok(!Object.hasOwn(legacy.flags, "engineering"))
  assert.deepEqual(flagsOf({ mode: "normal", engineering: true, planMode: true }), {
    autoApprove: false, planMode: true, advisorGuard: false, mode: "normal",
  })
})

test("Server i18n and CSS expose the shared mode control in both locales", () => {
  const keys = ["toolbar.mode", "toolbar.modeTiny", "toolbar.modeNormal", "toolbar.modeEngineering"]
  for (const table of [EN_CORE, ZH_CORE]) {
    for (const key of keys) assert.equal(typeof table[key], "string", key)
    for (const key of ["slash.desc.auto", "slash.desc.plan", "slash.desc.eng", "slash.desc.tiny", "slash.desc.normal"]) {
      assert.equal(typeof table[key], "string", key)
    }
  }
  const css = readFileSync(new URL("../public/style.css", import.meta.url), "utf8")
  assert.ok(!css.includes("#eng-btn"))
  assert.ok(css.includes("#auto-btn, #advisor-btn, #mode-select, #plan-btn, #settings-btn"))
  assert.ok(css.includes("#toolbar[data-flags=\"live\"] :is(#auto-btn, #advisor-btn, #mode-select, #plan-btn, #settings-btn)"))
})

test("Server PATCH accepts only a valid mode and invalid/legacy values never reach the box", async () => {
  const db = openDatabase(":memory:")
  try {
    const memberId = Number(db.prepare("INSERT INTO members (username, name, password_hash, role, created_at) VALUES ('user', 'User', 'unused', 'user', 'now')").run().lastInsertRowid)
    const key = issueKey(db, memberId)
    db.prepare("INSERT INTO sandbox_workspaces (name, owner_member_id, key_id, key_plain, created_at) VALUES ('ws', ?, ?, 'workspace-key', 'now')").run(memberId, key.id)
    const calls = []
    const relay = {
      online: () => true,
      pendingAskOf: () => false,
      runCommand: async (workspaceId, command, args) => {
        calls.push({ workspaceId, command, args })
        return { state: "done", detail: { session: { slot: args.slot, flags: { mode: args.mode } } } }
      },
    }
    const routes = createRouteTable()
    registerMemberRoutes(routes, { db, relay })
    const route = routes.resolve("PATCH", "/api/me/chat/sessions/1:1")
    const invoke = async (body) => {
      const req = Readable.from([Buffer.from(JSON.stringify(body))])
      req.headers = { authorization: `Bearer ${key.plain}` }
      const res = {
        headersSent: false,
        writeHead(status) { this.status = status; this.headersSent = true },
        end(text) { this.text = text },
      }
      await route.handler(req, res, { params: route.params })
      return res
    }
    const ok = await invoke({ mode: "tiny" })
    assert.equal(ok.status, 200)
    assert.equal(JSON.parse(ok.text).session.flags.mode, "tiny")
    assert.deepEqual(calls, [{ workspaceId: 1, command: "session.update", args: { slot: "1", mode: "tiny" } }])
    await assert.rejects(() => invoke({ mode: "bad" }), /mode/)
    await assert.rejects(() => invoke({ engineering: true }), /一次一件/)
    assert.equal(calls.length, 1, "invalid values and the retired boolean cause zero box writes")
  } finally {
    db.close()
  }
})

test("Server box shell writes and restores one mode; invalid and legacy writes leave bytes unchanged", async () => {
  const root = tempDir("project")
  _setSessionsDirForTest(tempDir("slots"))
  const config = { agent: { mode: "tiny" } }
  const core = {
    loadConfig: () => config, resolveWorkMode, newSession, setSlotPrefs, setSlotMode,
    setSlotAutoApprove, setSlotPlanMode, setSlotAdvisorGuard, loadSlotFile, loadManifest, slotPath,
  }
  const runner = createCoreRun({ cwd: root, core })
  const created = await runner.createSession({ model: "server/demo" })
  const { id } = created
  let data = loadSlotFile(root, id)
  assert.equal(data.mode, "tiny", "new sessions inherit agent.mode")
  assert.equal(created.session.flags.mode, "tiny", "the create receipt exposes the same persisted mode")

  const restored = bareAgent(root, "normal")
  applySession(restored, data)
  assert.equal(restored.config.agent.mode, "tiny")
  assert.equal(restored.config.agent.engineering, false)

  runner.updateSession({ slot: id, planMode: true })
  runner.updateSession({ slot: id, mode: "engineering" })
  data = loadSlotFile(root, id)
  assert.equal(data.mode, "engineering")
  assert.equal(data.planMode, false, "setMode engineering clears PLAN at the slot write")
  assert.ok(!Object.hasOwn(data, "engineering"))

  const beforePlan = readFileSync(slotPath(root, id), "utf8")
  assert.throws(() => runner.updateSession({ slot: id, planMode: true }), /PLAN/)
  assert.equal(readFileSync(slotPath(root, id), "utf8"), beforePlan, "PLAN cannot be enabled over engineering")

  const beforeInvalid = readFileSync(slotPath(root, id), "utf8")
  assert.throws(() => runner.updateSession({ slot: id, mode: "invalid" }), /非法工作模式/)
  assert.equal(readFileSync(slotPath(root, id), "utf8"), beforeInvalid)
  assert.throws(() => runner.updateSession({ slot: id, engineering: true }), /至少需要一个字段/)
  assert.equal(readFileSync(slotPath(root, id), "utf8"), beforeInvalid)

  runner.updateSession({ slot: id, mode: "tiny" })
  runner.updateSession({ slot: id, planMode: true })
  data = loadSlotFile(root, id)
  assert.equal(data.mode, "tiny")
  assert.equal(data.planMode, true, "PLAN remains available outside engineering")
})

test("mergeSlotControl merges latest slot control fields and never touches history", () => {
  const agent = bareAgent("merge-util", "normal")
  agent.title = "old title"
  agent.history = [{ role: "user", content: "keep me" }]
  agent._fullHistory = [{ role: "user", content: "keep me" }]
  const data = {
    mode: "engineering", planMode: false, autoApprove: true,
    advisor: { guard: true }, title: "new title", effort: "high",
    activeProvider: "server", activeModel: "server/x",
  }
  mergeSlotControl(agent, data)
  assert.equal(agent.config.agent.mode, "engineering")
  assert.equal(agent.config.agent.engineering, true)
  assert.equal(agent.planMode, false)
  assert.equal(agent.autoApprove, true)
  assert.deepEqual(agent.config.advisor, { guard: true })
  assert.equal(agent.title, "new title")
  assert.equal(agent._slotEffort, "high")
  assert.equal(agent.activeModel, "server/x")
  assert.equal(agent.provider.model, "server/x")
  assert.deepEqual(agent.history, [{ role: "user", content: "keep me" }], "merge must not touch history")
  assert.deepEqual(agent._fullHistory, [{ role: "user", content: "keep me" }], "merge must not touch full history")
})

test("turn-end save keeps busy-period PATCH control values and the current turn history", async () => {
  const root = tempDir("turnmerge")
  _setSessionsDirForTest(tempDir("turnmerge-slots"))
  const config = { agent: { mode: "normal" } }
  const core = {
    loadConfig: () => config, resolveWorkMode,
    newSession, setSlotPrefs, setSlotMode, setSlotAutoApprove, setSlotPlanMode, setSlotAdvisorGuard,
    loadSlotFile, loadManifest, slotPath, applySession, saveSession,
    assembleAgent: () => bareAgent(root, "normal"),
    validateProvider: () => {},
    runAgent: async (agent, input, callbacks) => {
      // 本回合历史（记录存储单点——saveSession 投影源）
      agent._recordStore.append({ role: "user", content: "hello turn" })
      agent._recordStore.append({ role: "assistant", content: "hi turn" })
      // 忙期 PATCH / always 直落盘（起跑 agent 未同步——正是合并面要守的值）
      setSlotMode(root, agent._slot, "engineering")
      setSlotAutoApprove(root, agent._slot, true)
    },
    parseRelayPath: () => null,
    getAsyncPool: () => null,
    cancelSyncChild: () => null,
    executeCancelAction: () => null,
  }
  const runner = createCoreRun({ cwd: root, core })
  const { id } = await runner.createSession({ model: "server/demo" })

  const end = await runner.runTurn({ sessionId: id, content: "hello", onFrame: () => {} })
  assert.equal(end.status, "succeeded")

  const saved = loadSlotFile(root, id)
  assert.equal(saved.mode, "engineering", "busy-period PATCH mode survives turn-end save")
  assert.equal(saved.autoApprove, true, "busy-period always autoApprove survives turn-end save")
  const contents = saved.history.map((m) => m.content)
  assert.ok(contents.includes("hello turn"), "current turn history must not be dropped")
  assert.ok(contents.includes("hi turn"), "current turn history must not be dropped")
})

/** 页面渲染面（动态 import——模块级 `document.addEventListener` 需 installMiniDom 先行）。 */
const flush = async (n = 8) => { for (let i = 0; i < n; i++) await Promise.resolve(); await new Promise((r) => setTimeout(r, 0)) }
const workspace = { id: 1, name: "ws", boxState: "running", stopReason: null }
function sessionRowOfId(id, mode) {
  return {
    id, workspaceId: 1, workspaceName: "ws", model: "server/demo", reasoning: null,
    title: `s-${id.split(":")[1]}`, count: 0, flags: { autoApprove: false, planMode: false, advisorGuard: false, mode },
    status: "idle", excerpt: "ex", agentOnline: true, updatedAt: 1,
  }
}
async function renderChatPage({ sessions, api }) {
  const { renderMeChat } = await import("../public/views-me-chat.mjs")
  const mount = document.createElement("main")
  document.body.append(mount)
  const ctx = {
    h, fmtTs: () => "", navigate: () => {}, fail: () => {}, flash: () => {},
    api: api ?? (async (path, opts) => {
      if (path === "/api/me/sandbox/workspaces") return { workspaces: [workspace] }
      if (path === "/api/me/chat/sessions") return { sessions }
      if (path === "/api/me/chat/models") return { models: [] }
      if (path.startsWith("/api/me/chat/sessions/") && opts?.method !== "PATCH") {
        const session = sessions.find((s) => s.id === path.split("/").pop())
        return { session, messages: [] }
      }
      return {}
    }),
  }
  await renderMeChat(ctx, mount)
  await flush()
  return mount
}

test("renderBar syncs flags across sessions with different modes", async () => {
  const sessions = [sessionRowOfId("1:1", "tiny"), sessionRowOfId("1:2", "engineering")]
  const mount = await renderChatPage({ sessions })
  const select = mount.querySelector("#mode-select")
  assert.equal(select.value, "tiny", "auto-selected first session mode syncs into the composer")

  // 切到第二会话 ⇒ renderBar 必须重派生控件镜像（`syncFlags` 拆分语句）
  const rows = mount.querySelectorAll(".chat-item")
  assert.equal(rows.length, 2)
  rows[1].dispatch("click")
  await flush()
  assert.equal(select.value, "engineering", "renderBar syncs flags when the active session changes")
})

test("flag writes are serialized per session and apply in call order", async () => {
  const sessions = [sessionRowOfId("1:1", "normal")]
  const patchCalls = []
  let releaseFirst = null
  const firstGate = new Promise((resolve) => { releaseFirst = resolve })
  const mount = await renderChatPage({
    sessions,
    api: async (path, opts) => {
      if (path === "/api/me/sandbox/workspaces") return { workspaces: [workspace] }
      if (path === "/api/me/chat/sessions") return { sessions }
      if (path === "/api/me/chat/models") return { models: [] }
      if (opts?.method === "PATCH") {
        patchCalls.push(opts.body)
        if (patchCalls.length === 1) await firstGate // 首写挂起——第二写必须排队等它落地
        return { session: { id: "1:1", flags: { autoApprove: false, planMode: false, advisorGuard: false, mode: opts.body.mode } } }
      }
      if (path.startsWith("/api/me/chat/sessions/")) return { session: sessions[0], messages: [] }
      return {}
    },
  })

  const select = mount.querySelector("#mode-select")
  select.value = "engineering"; select.dispatch("change")
  await flush(3)
  assert.equal(patchCalls.length, 1, "first flag write is issued")

  select.value = "tiny"; select.dispatch("change")
  await flush(3)
  assert.equal(patchCalls.length, 1, "second write queues behind the in-flight first write")

  releaseFirst()
  await flush()
  assert.deepEqual(patchCalls.map((body) => body.mode), ["engineering", "tiny"], "consecutive writes apply in call order")
})
