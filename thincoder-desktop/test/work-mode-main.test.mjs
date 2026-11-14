import assert from "node:assert/strict"
import { after, test } from "node:test"
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { registerHooks } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

// 本用例测试当前仓内 core；开发目录里的物化副本可能落后于源树，不能用旧副本判定新接口。
const coreRoot = fileURLToPath(new URL("../../thincoder-core", import.meta.url))
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@thincoder/core/")) {
      return { url: pathToFileURL(join(coreRoot, specifier.slice("@thincoder/core/".length))).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})

const { _setConfigPathForTest, _resetConfigPathForTest } = await import("@thincoder/core/config-io.mjs")
const { loadSlotFile } = await import("@thincoder/core/session.mjs")
const { createAgentHost } = await import("../src/main/agent-host.mjs")
const { createSessionFlags } = await import("../src/main/session-flags.mjs")
const {
  _setSessionsDirForTest, _resetSessionsDirForTest, newSession, pageHistory, slotPath, writeSessionFile,
} = await import("../src/main/session-slots.mjs")
const { settingsAgent } = await import("../src/main/settings.mjs")

const work = mkdtempSync(join(tmpdir(), "desktop-work-mode-main-"))
const cwd = join(work, "project")
const sessions = join(work, "sessions")
const configPath = join(work, "config.json")
mkdirSync(cwd, { recursive: true })
mkdirSync(sessions, { recursive: true })
writeFileSync(configPath, JSON.stringify({ providers: [], agent: { mode: "normal" } }, null, 2))
_setConfigPathForTest(configPath)
_setSessionsDirForTest(sessions)

after(() => {
  _resetConfigPathForTest()
  _resetSessionsDirForTest()
  rmSync(work, { recursive: true, force: true })
})

function saveSlot(slot, fields = {}) {
  writeSessionFile(slotPath(cwd, slot), {
    version: 2, cwd, title: "", history: [], contextHistory: [], tasks: [],
    planMode: false, autoApprove: false, advisor: null, goal: null, ...fields,
  })
}

function liveFlags(agents, key) {
  const agent = agents.get(String(key))
  if (!agent) return null
  const mode = agent.config.agent.mode
  return {
    planMode: mode !== "engineering" && agent.planMode === true,
    autoApprove: agent.autoApprove === true,
    advisorGuard: agent.config.advisor?.guard === true,
    mode,
  }
}

test("session:flags 三档写唯一 mode，非法补丁整笔零写，活代理即时重施", () => {
  saveSlot(1, { mode: "normal", planMode: false, engineering: true })
  const agents = new Map()
  const agent = {
    cwd, config: { agent: { mode: "normal", engineering: false }, advisor: {} },
    providers: [], history: [], _fullHistory: [], autoApprove: false, planMode: false,
  }
  agents.set("1", agent)
  const events = []
  const { setFlags } = createSessionFlags({
    agents,
    projects: { currentCwd: () => cwd },
    post: (channel, payload) => events.push({ channel, payload }),
    flagsOf: (key) => liveFlags(agents, key),
  })

  const invalid = [
    null, [], {}, { engineering: true }, { mode: "ENG" }, { mode: null },
    { mode: "tiny " }, { mode: true }, { planMode: "true" },
    { mode: "tiny", extra: true }, { mode: "bad", planMode: true },
  ]
  for (const patch of invalid) {
    const before = readFileSync(slotPath(cwd, 1), "utf8")
    assert.deepEqual(setFlags("1", patch), { ok: false, reason: "invalid-patch" })
    assert.equal(readFileSync(slotPath(cwd, 1), "utf8"), before, `非法补丁 ${JSON.stringify(patch)} 零写`)
  }

  // 旧值的写面输入（夹具保留字面）：`minimal` 是 tiny 的历史写法，写面只收新枚举 ⇒ 零写、零推送。
  const legacyWrite = setFlags("1", { mode: "minimal" })
  assert.equal(legacyWrite.ok, false, "旧值写面拒收")
  assert.equal(legacyWrite.reason, "invalid-patch")
  assert.equal(loadSlotFile(cwd, 1).mode, "normal", "旧值写面零写（槽停在上一次的 normal）")

  const tiny = setFlags("1", { mode: "tiny" })
  assert.equal(tiny.ok, true)
  assert.equal(tiny.flags.mode, "tiny")
  assert.equal(agent.config.agent.mode, "tiny")
  assert.equal(agent.config.agent.engineering, false)
  assert.equal(loadSlotFile(cwd, 1).mode, "tiny")
  assert.equal(loadSlotFile(cwd, 1).engineering, undefined, "合法写后旧布尔退役")
  assert.equal(events.at(-1).payload.flags.mode, "tiny")

  assert.equal(setFlags("1", { planMode: true }).ok, true, "tiny 允许 PLAN")
  assert.equal(agent.planMode, true)
  const engineering = setFlags("1", { mode: "engineering", planMode: true })
  assert.equal(engineering.ok, true)
  assert.equal(engineering.flags.mode, "engineering")
  assert.equal(engineering.flags.planMode, false)
  assert.equal(loadSlotFile(cwd, 1).planMode, false, "同笔双开由 engineering 清 PLAN")
  assert.equal(agent.config.agent.engineering, true)

  const beforePlan = readFileSync(slotPath(cwd, 1), "utf8")
  assert.deepEqual(setFlags("1", { planMode: true }), { ok: false, reason: "invalid-patch" })
  assert.equal(readFileSync(slotPath(cwd, 1), "utf8"), beforePlan, "engineering 下单开 PLAN 零写")

  assert.equal(setFlags("1", { mode: "normal" }).flags.mode, "normal")
  assert.equal(setFlags("1", { planMode: true }).ok, true, "normal 允许 PLAN")
  assert.equal(agent.planMode, true)
})

test("history:page 从槽恢复三档，旧 engineering 只读迁移且合法 mode 优先", () => {
  saveSlot(2, { engineering: true, planMode: true })
  const legacy = pageHistory(cwd, { key: "2", before: null })
  assert.equal(legacy.ok, true)
  assert.deepEqual(legacy.flags, { planMode: false, autoApprove: false, advisorGuard: false, mode: "engineering" })
  assert.equal(loadSlotFile(cwd, 2).engineering, true, "页读不写回迁移")

  saveSlot(3, { engineering: false })
  assert.equal(pageHistory(cwd, { key: "3", before: null }).flags.mode, "normal")
  saveSlot(4, { mode: "minimal", engineering: true })
  assert.equal(pageHistory(cwd, { key: "4", before: null }).flags.mode, "tiny", "旧槽 mode 读到即归一为 tiny")
  saveSlot(5, { mode: "invalid", engineering: true })
  assert.equal(pageHistory(cwd, { key: "5", before: null }).flags.mode, "engineering")
})

test("host ev:flags 活值只携 mode，并在 engineering 下压住 PLAN", () => {
  const host = createAgentHost({ emit: () => {}, projects: { currentCwd: () => cwd } })
  try {
    host.agents.set("8", {
      planMode: true, autoApprove: false,
      config: { agent: { mode: "engineering", engineering: true }, advisor: { guard: true } },
    })
    assert.deepEqual(host.flagsOf("8"), { planMode: false, autoApprove: false, advisorGuard: true, mode: "engineering" })
    assert.equal(host.flagsOf("missing"), null)
  } finally {
    host.stopHeartbeat()
  }
})

test("settings:agent 的 agent.mode 只写新会话默认值，旧 engineering 不可写", () => {
  for (const mode of ["tiny", "normal", "engineering"]) {
    const receipt = settingsAgent({ patch: { "agent.mode": mode } })
    assert.equal(receipt.ok, true)
    assert.equal(receipt.fields.find((field) => field.path === "agent.mode")?.value, mode)
    assert.equal(JSON.parse(readFileSync(configPath, "utf8")).agent.mode, mode)
  }
  const before = readFileSync(configPath, "utf8")
  assert.equal(settingsAgent({ patch: { "agent.mode": "bad" } }).ok, false)
  assert.equal(readFileSync(configPath, "utf8"), before)
  assert.deepEqual(settingsAgent({ patch: { "agent.engineering": true } }).reason, "slot-authority")
  assert.equal(readFileSync(configPath, "utf8"), before)
})


test("新建会话播种 agent.mode；无模式旧槽页读沿用同一配置默认", async () => {
  assert.equal(settingsAgent({ patch: { "agent.mode": "tiny" } }).ok, true)
  const slot = await newSession(cwd)
  assert.equal(loadSlotFile(cwd, slot).mode, "tiny")
  saveSlot(slot + 100, {})
  assert.equal(pageHistory(cwd, { key: String(slot + 100), before: null }).flags.mode, "tiny")
})

test("无活代理时写后规范 flags 回执与发布（slotFlags 兜底，成功回执恒携 flags）", () => {
  saveSlot(21, { mode: "normal" })
  const events = []
  const { setFlags } = createSessionFlags({
    agents: new Map(), // 无活代理 ⇒ 走槽投影 slotFlags
    projects: { currentCwd: () => cwd },
    post: (channel, payload) => events.push({ channel, payload }),
    flagsOf: () => null, // 与宿主 flagsOf 无 agent 时的返回一致
  })

  const receipt = setFlags("21", { autoApprove: true, planMode: true })
  assert.equal(receipt.ok, true)
  assert.deepEqual(receipt.flags, { planMode: true, autoApprove: true, advisorGuard: false, mode: "normal" })
  assert.deepEqual(events.at(-1), { channel: "ev:flags", payload: { key: "21", flags: receipt.flags } })
  assert.equal(loadSlotFile(cwd, 21).autoApprove, true)
  assert.equal(loadSlotFile(cwd, 21).planMode, true)
})

test("在飞含未落盘 history 的活代理写 mode/auto/plan 后 history 引用与内容不变", () => {
  saveSlot(22, { mode: "normal", history: [{ kind: "user", text: "on-disk" }] })
  const agents = new Map()
  const inFlight = [{ kind: "user", text: "unsaved" }]
  const agent = {
    cwd,
    config: { agent: { mode: "normal", engineering: false }, advisor: {} },
    providers: [], history: inFlight, _fullHistory: [], autoApprove: false, planMode: false,
  }
  agents.set("22", agent)
  const events = []
  const { setFlags } = createSessionFlags({
    agents,
    projects: { currentCwd: () => cwd },
    post: (channel, payload) => events.push({ channel, payload }),
    flagsOf: (key) => liveFlags(agents, key),
  })

  const ref = agent.history
  const snapshot = JSON.stringify(agent.history)

  assert.equal(setFlags("22", { mode: "engineering" }).ok, true)
  assert.equal(agent.history, ref, "写 mode 后 history 引用不变")
  assert.equal(JSON.stringify(agent.history), snapshot, "写 mode 后 history 内容不变")
  assert.equal(agent.config.agent.mode, "engineering")

  assert.equal(setFlags("22", { mode: "normal", planMode: true, autoApprove: true }).ok, true)
  assert.equal(agent.history, ref, "写 mode/plan/auto 后 history 引用不变")
  assert.equal(JSON.stringify(agent.history), snapshot, "写 mode/plan/auto 后 history 内容不变")
  assert.equal(agent.config.agent.mode, "normal")
  assert.equal(agent.planMode, true)
  assert.equal(agent.autoApprove, true)
})
