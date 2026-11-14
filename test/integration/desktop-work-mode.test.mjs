/**
 * desktop-work-mode.test.mjs — Desktop 三档模式根集成测试（批次 #2393）。
 *
 * 真实入口链：渲染面斜径命令（`/eng` 的 toggleEng）或控件写面（`wire.post("setMode")`）
 * → `session:flags` 通道 → 主侧 `createSessionFlags` 校验写槽 → 活代理重施 → `ev:flags`
 * 事件回投渲染面 `applyFlags`/`onFlags` → 槽恢复（`pageHistory`）读回唯一 `mode`。
 * 非法值（表外 mode）整笔零写：槽零动、零事件、渲染面 store 零动、回执 fail-loud。
 *
 * 主侧/渲染面模块均直接取当前源树（core 经 resolve 钩子指向 `../thincoder-core`，
 * 与包内 `thincoder-desktop/test/work-mode-main.test.mjs` 同式，避免开发目录物化副本落后）。
 */
import assert from "node:assert/strict"
import { after, test } from "node:test"
import { setImmediate as waitImmediate } from "node:timers/promises"
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { registerHooks } from "node:module"
import { fileURLToPath, pathToFileURL } from "node:url"

// 本用例测试当前仓内 core；开发目录里的物化副本可能落后于源树，不能用旧副本判定新接口。
// `/rc/`（@thincoder/render-core）同式解析到源树——渲染档在测试下仍走同一份核件。
const coreRoot = fileURLToPath(new URL("../../thincoder-core", import.meta.url))
const renderCoreRoot = fileURLToPath(new URL("../../thincoder-render-core", import.meta.url))
registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@thincoder/core/")) {
      return { url: pathToFileURL(join(coreRoot, specifier.slice("@thincoder/core/".length))).href, shortCircuit: true }
    }
    if (specifier.startsWith("/rc/")) {
      return { url: pathToFileURL(join(renderCoreRoot, specifier.slice(4))).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})

const { _setConfigPathForTest, _resetConfigPathForTest } = await import("@thincoder/core/config-io.mjs")
const { loadSlotFile } = await import("@thincoder/core/session.mjs")
const {
  _setSessionsDirForTest, _resetSessionsDirForTest, pageHistory, slotPath, writeSessionFile,
} = await import("../../thincoder-desktop/src/main/session-slots.mjs")
const { createSessionFlags } = await import("../../thincoder-desktop/src/main/session-flags.mjs")
const { createComposerWire } = await import("../../thincoder-desktop/renderer/composer-wire.mjs")
const { createSlashCommands } = await import("../../thincoder-desktop/renderer/slash-commands.mjs")
const { applyFlags, onFlags } = await import("../../thincoder-desktop/renderer/events-flags.mjs")
const { createStore, initialState } = await import("../../thincoder-desktop/renderer/store.mjs")

const work = mkdtempSync(join(tmpdir(), "desktop-work-mode-root-"))
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

/** 活代理四布尔规范投影（与宿主 `flagsOf` 同口径）。 */
function liveFlags(agent) {
  const mode = agent.config.agent.mode
  return {
    planMode: mode !== "engineering" && agent.planMode === true,
    autoApprove: agent.autoApprove === true,
    advisorGuard: agent.config.advisor?.guard === true,
    mode,
  }
}

/** 装配一份活代理 + 主侧 setFlags + 渲染面 store/wire，返回可驱动斜径与控件链的句柄。 */
function assemble(key, { mode = "normal", engineering = false } = {}) {
  const agents = new Map()
  const agent = {
    cwd,
    config: { agent: { mode, engineering }, advisor: {} },
    providers: [], history: [], _fullHistory: [], autoApprove: false, planMode: false,
  }
  agents.set(String(key), agent)

  // 渲染面 store：活动会话 + 初始模式位（页读口径同形）。
  const store = createStore({
    ...initialState(), activeSession: String(key),
    sessionFlags: { [String(key)]: { planMode: false, autoApprove: false, advisorGuard: false, mode } },
  })

  // 主侧出站事件：按真实接线回投渲染面归约面 onFlags。
  const events = []
  const { setFlags } = createSessionFlags({
    agents,
    projects: { currentCwd: () => cwd },
    post: (channel, payload) => {
      events.push({ channel, payload })
      if (channel === "ev:flags") store.set(onFlags(store.get(), payload))
    },
    flagsOf: () => liveFlags(agent),
  })

  // 渲染面写面：`call` = 真实窄桥 → 主侧 setFlags（session:flags 通道）。
  const wire = createComposerWire({
    store,
    activeKey: () => String(key),
    call: async (channel, payload) => (channel === "session:flags" ? setFlags(payload.key, payload.patch) : { ok: false, reason: "bad-channel" }),
    push: () => {}, panelOf: () => null, repaint: () => {}, applyFlags,
  })

  return { store, wire, events, agent, setFlags }
}

const flush = () => waitImmediate()

test("斜径 /eng 与控件 setMode 同走 session:flags → 槽写 → ev:flags → 页读恢复唯一 mode", async () => {
  saveSlot(1, { mode: "normal" })
  const { store, wire, events, agent } = assemble(1, { mode: "normal" })

  // 斜径入口：/eng 只调 ctx.actions.toggleEng()，toggleEng 与 MODE 控件共用 setMode。
  let mode = "normal"
  const actions = {
    setMode: (value) => { mode = value; wire.post("setMode", { value }); return true },
    toggleEng: () => actions.setMode(mode === "engineering" ? "normal" : "engineering"),
  }
  const commands = createSlashCommands(() => true, () => mode)
  const run = (name) => commands.find((command) => command.name === name).run({ actions })

  assert.equal(run("/eng"), true, "/eng 应受理")
  await flush()
  assert.equal(mode, "engineering")
  assert.equal(store.get().sessionFlags["1"].mode, "engineering", "ev:flags/回执写回 store 唯一 mode")
  assert.equal(agent.config.agent.mode, "engineering", "活代理重施")
  assert.equal(loadSlotFile(cwd, 1).mode, "engineering", "槽落唯一 mode")
  assert.equal(loadSlotFile(cwd, 1).engineering, undefined, "旧 engineering 布尔退役")
  assert.equal(events.at(-1).channel, "ev:flags")
  assert.equal(events.at(-1).payload.flags.mode, "engineering", "事件活值只携 mode")
  assert.equal(pageHistory(cwd, { key: "1", before: null }).flags.mode, "engineering", "页读从槽恢复 mode")

  // 控件入口：MODE 下拉直接 setMode，同一条链。
  wire.post("setMode", { value: "tiny" })
  await flush()
  assert.equal(store.get().sessionFlags["1"].mode, "tiny")
  assert.equal(loadSlotFile(cwd, 1).mode, "tiny")
  assert.equal(pageHistory(cwd, { key: "1", before: null }).flags.mode, "tiny")
  assert.equal(events.at(-1).payload.flags.mode, "tiny")

  // engineering 下开 PLAN 仍被拒（同批双开清 PLAN 的既有规则在控件链同样成立）。
  wire.post("setMode", { value: "engineering" })
  await flush()
  const before = readFileSync(slotPath(cwd, 1), "utf8")
  wire.post("setPlanMode", { value: true })
  await flush()
  assert.equal(readFileSync(slotPath(cwd, 1), "utf8"), before, "engineering 下开 PLAN 零写")
  assert.equal(wire.failure()?.reason, "invalid-patch")
})

test("非法 patch 整笔零写：槽零动、零事件、store 零动、回执 fail-loud", async () => {
  saveSlot(2, { mode: "normal" })
  const { store, wire, events, agent } = assemble(2, { mode: "normal" })

  const beforeSlot = readFileSync(slotPath(cwd, 2), "utf8")
  const beforeStore = store.get().sessionFlags["2"]
  const eventsBefore = events.length

  // 表外 mode（真实控件值域外）：主侧 patchFailure 拒绝，渲染面零乐观写 + 可见失败态。
  wire.post("setMode", { value: "bad" })
  await flush()

  assert.equal(readFileSync(slotPath(cwd, 2), "utf8"), beforeSlot, "非法值槽零写")
  assert.equal(events.length, eventsBefore, "非法值零事件")
  assert.deepEqual(store.get().sessionFlags["2"], beforeStore, "非法值 store 零动")
  assert.equal(agent.config.agent.mode, "normal", "非法值活代理零重施")
  assert.equal(wire.failure()?.source, "session:flags")
  assert.equal(wire.failure()?.reason, "invalid-patch")
  assert.equal(pageHistory(cwd, { key: "2", before: null }).flags.mode, "normal", "槽恢复仍是 normal")
})
