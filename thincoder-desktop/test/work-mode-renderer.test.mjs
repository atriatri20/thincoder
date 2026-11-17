import assert from "node:assert/strict"
import { test } from "node:test"
import { setImmediate as waitImmediate } from "node:timers/promises"
import { createComposerSync } from "../renderer/composer-sync.mjs"
import { createComposerWire } from "../renderer/composer-wire.mjs"
import { applyFlags, onFlags } from "../renderer/events-flags.mjs"
import { HOST_DICT, initDict } from "../renderer/i18n.mjs"
import { createAgentExits } from "../renderer/mount-settings-segments-agent.mjs"
import { createSlashCommands } from "../renderer/slash-commands.mjs"
import { createStore, initialState } from "../renderer/store.mjs"
import { agentBody, NAMED_FIELDS } from "../renderer/views/settings-agent.mjs"
import { bannerSegments } from "../renderer/views/statusline-banner.mjs"

const flush = () => waitImmediate()

test("页读、回执与 ev:flags 共用唯一 mode；非法载荷整笔拒收", () => {
  const base = initialState()
  const full = { planMode: true, autoApprove: false, advisorGuard: true, mode: "tiny" }
  const paged = applyFlags(base, "1", full)
  assert.deepEqual(paged.sessionFlags["1"], full)
  const receipt = applyFlags(paged, "1", { ...full, mode: "normal", planMode: false })
  assert.equal(receipt.sessionFlags["1"].mode, "normal")
  const pushed = onFlags(receipt, { key: "1", flags: { ...full, mode: "engineering" } })
  assert.equal(pushed.sessionFlags["1"].mode, "engineering")

  for (const flags of [{ mode: "bad" }, { mode: null }, { mode: "tiny", planMode: "yes" }]) {
    assert.equal(applyFlags(pushed, "1", flags), pushed, `非法 ${JSON.stringify(flags)} 不改原引用`)
  }
  const legacy = applyFlags(base, "old", { engineering: true, planMode: true })
  assert.deepEqual(legacy.sessionFlags.old, { planMode: true, mode: "engineering" })
  assert.equal("engineering" in legacy.sessionFlags.old, false, "旧布尔不进入第二可写状态")
})

test("composer 推送与出站都使用 setMode，状态行显示 MODE 当前值", async () => {
  initDict({ locale: "en" })
  const store = createStore({
    ...initialState(), activeSession: "1",
    sessionFlags: { "1": { planMode: true, autoApprove: false, advisorGuard: false, mode: "tiny" } },
  })
  const pushed = []
  const sync = createComposerSync({
    store, activeKey: () => "1", call: async () => ({ ok: true, models: [], unavailable: [] }),
    push: (message) => pushed.push(message), pushSubs: [], wire: { failure: () => null },
    panelOf: () => null, noticesOf: () => null,
  })
  sync.syncPanel()
  assert.equal(pushed.find((message) => message.type === "agentSettings")?.settings.mode, "tiny")
  assert.equal(pushed.find((message) => message.type === "planMode")?.active, true)

  store.set(applyFlags(store.get(), "1", { planMode: true, autoApprove: false, advisorGuard: false, mode: "engineering" }))
  sync.syncPanel()
  assert.equal(pushed.filter((message) => message.type === "agentSettings").at(-1).settings.mode, "engineering")
  assert.equal(pushed.filter((message) => message.type === "planMode").at(-1).active, false)

  const calls = []
  const wire = createComposerWire({
    store, activeKey: () => "1",
    call: async (channel, payload) => {
      calls.push({ channel, payload })
      return { ok: true, flags: store.get().sessionFlags["1"] }
    },
    push: () => {}, panelOf: () => null, repaint: () => {}, applyFlags,
  })
  wire.post("setMode", { value: "normal" })
  await flush()
  assert.deepEqual(calls, [{ channel: "session:flags", payload: { key: "1", patch: { mode: "normal" } } }])

  for (const mode of ["tiny", "normal", "engineering"]) {
    const segments = bannerSegments({ mode, planMode: true })
    assert.equal(segments.at(-1).code, "mode")
    assert.equal(segments.at(-1).parts[0].text, `MODE:${mode}`)
    assert.equal(segments.some((segment) => segment.code === "plan"), mode !== "engineering")
  }
})

test("/eng、/tiny、/normal 与控件共用 setMode，帮助词表中英齐全", () => {
  let mode = "tiny"
  const selected = []
  const actions = {
    setMode: (value) => { selected.push(value); mode = value; return true },
    toggleEng: () => actions.setMode(mode === "engineering" ? "normal" : "engineering"),
  }
  const commands = createSlashCommands(() => true, () => mode)
  const run = (name) => commands.find((command) => command.name === name).run({ actions })
  assert.equal(run("/tiny"), true)
  assert.equal(selected.at(-1), "normal")
  run("/tiny")
  assert.equal(selected.at(-1), "tiny")
  run("/eng")
  assert.equal(selected.at(-1), "engineering")
  run("/eng")
  assert.equal(selected.at(-1), "normal")
  mode = "engineering"
  run("/normal")
  assert.equal(selected.at(-1), "normal")
  assert.deepEqual(commands.map((command) => command.name), ["/model", "/auto", "/plan", "/eng", "/tiny", "/normal", "/help"])

  for (const locale of ["en", "zh"]) {
    for (const key of ["slash.desc.eng", "slash.desc.tiny", "slash.desc.normal", "toolbar.mode", "toolbar.modeTiny", "toolbar.modeNormal", "toolbar.modeEngineering", "settings.agent.mode", "settings.agent.modeTiny", "settings.agent.modeNormal", "settings.agent.modeEngineering", "status.banner.mode"]) {
      assert.equal(typeof HOST_DICT[locale][key], "string", `${locale} 缺 ${key}`)
    }
  }
  assert.equal(HOST_DICT.en["slash.desc.eng"], "toggle engineering ↔ normal work mode")
  assert.equal(HOST_DICT.en["slash.desc.tiny"], "toggle tiny ↔ normal work mode")
  assert.equal(HOST_DICT.en["slash.desc.normal"], "select normal work mode")
})

test("设置页 agent.mode 是固定三选项，变更只写 settings:agent 默认值", async () => {
  const entry = NAMED_FIELDS.find((field) => field.path === "agent.mode")
  assert.equal(entry.kind, "mode")
  const rows = agentBody({
    fields: [{ path: "agent.mode", value: "tiny", kind: "string", sensitive: false }],
    guard: false, models: [],
  }, { onNamedField: () => {}, onToggleGuard: () => {} })
  const row = rows.find((node) => node.props["data-field-name"] === "agent.mode")
  const select = row.children.find((node) => node.tag === "select")
  assert.deepEqual(select.children.map((option) => option.props.value), ["tiny", "normal", "engineering"])
  assert.equal(select.children.find((option) => option.props.selected === true)?.props.value, "tiny")

  const calls = []
  const { handlers } = createAgentExits({
    ask: async (channel, payload) => {
      calls.push({ channel, payload })
      return { ok: true, fields: [{ path: "agent.mode", value: payload.patch["agent.mode"], kind: "string" }] }
    },
    store: createStore(), setSettings: () => {}, report: () => {}, clearReport: () => {}, paintSettings: () => {},
  })
  handlers.onNamedField(entry, { target: { value: "engineering" } })
  await flush()
  assert.deepEqual(calls, [{ channel: "settings:agent", payload: { patch: { "agent.mode": "engineering" } } }])
})

test("session:flags 写失败可见且控件从当前 store 重推回滚", async () => {
  initDict({ locale: "en" })
  const store = createStore({
    ...initialState(), activeSession: "1",
    sessionFlags: { "1": { planMode: false, autoApprove: false, advisorGuard: true, mode: "tiny" } },
  })
  const pushed = []
  const wire = createComposerWire({
    store, activeKey: () => "1",
    call: async () => ({ ok: false, reason: "slot-missing" }),
    push: (message) => pushed.push(message),
    panelOf: () => null, repaint: () => {}, applyFlags,
  })
  wire.post("setAutoApprove", { value: true })
  await flush()
  // 失败可见（B21 行源）
  assert.equal(wire.failure().source, "session:flags")
  assert.equal(wire.failure().reason, "slot-missing")
  // 零乐观写：store 未动
  assert.equal(store.get().sessionFlags["1"].autoApprove, false)
  // 回滚：核件控件行以当前 store 值重推（autoApprove false / planMode false / advisorGuard true / mode tiny）
  assert.deepEqual(pushed.find((message) => message.type === "autoApprove"), { type: "autoApprove", value: false })
  assert.deepEqual(pushed.find((message) => message.type === "planMode"), { type: "planMode", active: false })
  assert.deepEqual(pushed.find((message) => message.type === "agentSettings"), {
    type: "agentSettings", settings: { advisor: { guard: true }, mode: "tiny" },
  })
})
