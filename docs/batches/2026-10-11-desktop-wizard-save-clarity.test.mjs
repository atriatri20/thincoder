/**
 * 2026-10-11-desktop-wizard-save-clarity.test.mjs — 批内单测件（首启向导保存 ∥ 校验面收正批 · 名随批档 ·
 * 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-11-desktop-wizard-save-clarity.test.mjs`
 *
 * 射程（判据源 = `docs/desktop/design/SETTINGS.md` §1 KD-79 ∥ §2.23（项 1–4 = 保存面；项 8 = 校验面）∥
 * `docs/desktop/requirements/SETTINGS.md` D11 判据 ①–④；需求 = 台账 #1277 ∥ #1278）：
 *   腿一 构树：步 1 提交钮 = `.wizard-save` + 词「保存并继续」∥ 步 1 零「下一步」（尾控件 = 「完成」单钮）∥
 *      步 2「下一步」在场（零改）∥ 护栏节点随旗（旗在场 ⇒ `[data-finish-guard]` + 提示句 + 两钮；旗缺 ⇒ 零节点）；
 *   腿二 逐态接线：空 key ⇒ 零提交 + 进 ∥ 非空 ⇒ 先存后进（写未落定 ⇒ 原地；成 ⇒ 进；败 ∥ 非 `true` ⇒ 留步）∥
 *      桥面（装配面 `exits.handlers.onSubmit` 成 ⇒ 返回 `true` —— 唯一 +1 行为行）；
 *   腿三 护栏：未配 ⇒ 旗 + 不退场 ∥ 已配 ⇒ 照退（零旗）∥ `guardBack` ⇒ 步 1 + 旗清 ∥ 任意步写 ⇒ 旗随写收束；
 *   腿四 弹窗负控：`channelFormTree` 缺 `submitClass` ⇒ 缺省类 `settings-submit`（弹窗径零变）；
 *   腿五 词表：4 新键 × 两语逐字（en 零 CJK）∥ 旧键 `wizard.save` 两语退场 + 渲染面源扫零命中 ∥ 键数链 349（键集相等）；
 *   腿六 校验消费：树面四径（ok ∥ fail ∥ 空 ∥ kind 表外 —— 锚 ∥ 短形词 ∥ 明细行）∥ 投影对拍
 *      （`wizardModel.verify` ≡ `settingsModel.providers.verify`）∥ 共序负控（verify = fail 在场 ⇒ 两径照走）。
 * 平 node 直测（假 `FormData` ∥ 桩出口族；零真配置 ∥ 零真 DOM）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = [join(HERE, "..", ".."), join(HERE, "..", "..", "..")].find((d) => existsSync(join(d, "thincoder-desktop")))
const at = (rel) => pathToFileURL(join(ROOT, rel)).href
const read = (rel) => readFileSync(join(ROOT, rel), "utf8")

await import(at("thincoder-desktop/test/rc-resolve.mjs")) // `/rc/` 解析钩子（须先于渲染档取件注册）

const i18n = await import(at("thincoder-desktop/renderer/i18n.mjs"))
i18n.initDict({ locale: "zh" })
const STORE = await import(at("thincoder-desktop/renderer/store.mjs"))
const ONBOARDING = await import(at("thincoder-desktop/renderer/views/onboarding.mjs"))
const CONTROLS = await import(at("thincoder-desktop/renderer/views/settings-controls.mjs"))
const SETTINGS_VIEW = await import(at("thincoder-desktop/renderer/views/settings.mjs"))

/** 深搜 / 全收（树面小工具 —— null 容错；沿登录面补全批件同式）。 */
const findDeep = (node, pred) => {
  if (node === null || typeof node !== "object") return null
  if (Array.isArray(node)) { for (const item of node) { const hit = findDeep(item, pred); if (hit !== null) return hit } return null }
  if (pred(node)) return node
  return findDeep(node.children ?? null, pred)
}
const collectDeep = (node, pred, out = []) => {
  if (node === null || typeof node !== "object") return out
  if (Array.isArray(node)) { for (const item of node) collectDeep(item, pred, out); return out }
  if (pred(node)) out.push(node)
  collectDeep(node.children ?? null, pred, out)
  return out
}

/** 微任务 + 三拍宏任务冲刷（链路全微任务 ⇒ 一拍即足；多拍 = 防链路引入单跳定时器后的脆性）。 */
const settle = async () => { for (let i = 0; i < 3; i += 1) await new Promise((done) => setTimeout(done, 0)) }

/** 假 `FormData`（提交端 `data.get` 取件面）。 */
class FakeFormData {
  constructor(form) { this.map = new Map(Object.entries(form?._fields ?? {})) }
  get(name) { return this.map.has(name) ? this.map.get(name) : null }
}

const formOf = (fields) => ({ _fields: fields })
const eventOf = (form) => ({ currentTarget: { closest: (sel) => (sel === "form" ? form : null) } })

/** 向导态夹具（未配 ⇒ 占槽；`step` ∥ `verify` ∥ `finishBlocked` 可注）。 */
const wizardState = ({ step = 1, verify = null, finishBlocked = false } = {}) => {
  const base = STORE.initialState()
  return {
    ...base,
    settings: {
      ...base.settings,
      configured: false,
      wizard: { step, dismissed: false, notice: null, ...(finishBlocked ? { finishBlocked: true } : {}) },
      verify,
      providers: { ...base.settings.providers, presets: [{ name: "p1", baseURL: "https://api.example/v1" }] },
    },
  }
}

/** 树面快捷件：态 ⇒ 树（handlers 缺省 ⇒ 各钮 `wire` 落 `disabled`，树形不涉）。 */
const treeOf = (overrides = {}) => ONBOARDING.wizardTree(ONBOARDING.wizardModel(wizardState(overrides)), {})

// ─── 腿一 · 构树 ─────────────────────────────────────────────────────────────

test("腿一 构树：步 1 提交钮 = `.wizard-save` + 词「保存并继续」∥ 步 1 零「下一步」∥ 步 2 在场 ∥ 护栏节点随旗", () => {
  const stepOne = treeOf({ step: 1 })
  const submit = findDeep(stepOne, (n) => n?.props?.class === "wizard-save")
  assert.ok(submit !== null, "步 1 提交钮 = `.wizard-save`（KD-79 ① 提级）")
  assert.equal(submit.children[0], "保存并继续", "钮词 = `wizard.saveAndNext`（②③ 合并）")
  assert.equal(findDeep(stepOne, (n) => n?.props?.["data-action"] === "wizard:next"), null, "步 1 零「下一步」（前向唯一径 = 表单提交钮）")
  const foot = findDeep(stepOne, (n) => n?.tag === "footer")
  assert.deepEqual(collectDeep(foot, (n) => n?.tag === "button").map((b) => b.props["data-action"]), ["wizard:finish"], "步 1 尾控件 = 「完成」单钮")
  assert.equal(findDeep(stepOne, (n) => n?.props?.["data-finish-guard"] !== undefined), null, "旗缺 ⇒ 零护栏节点")

  const stepTwo = treeOf({ step: 2 })
  assert.ok(findDeep(stepTwo, (n) => n?.props?.["data-action"] === "wizard:next") !== null, "步 2「下一步」在场（零改）")
  const footTwo = findDeep(stepTwo, (n) => n?.tag === "footer")
  assert.equal(collectDeep(footTwo, (n) => n?.tag === "button").length, 2, "步 2 尾控件 = 两钮（下一步 + 完成）")

  const guarded = treeOf({ step: 3, finishBlocked: true })
  const guard = findDeep(guarded, (n) => n?.props?.["data-finish-guard"] !== undefined)
  assert.ok(guard !== null, "旗在场 ⇒ `[data-finish-guard]` 节点在场")
  assert.equal(guard.children[0], i18n.t("wizard.finishGuard"), "护栏提示句逐字（`wizard.finishGuard`）")
  const guardButtons = collectDeep(guard, (n) => n?.tag === "button")
  assert.deepEqual(guardButtons.map((b) => b.props["data-action"]), ["wizard:guardBack", "settings:close"], "两钮锚逐字（去保存渠道 ∥ 仍要退出）")
  assert.deepEqual(guardButtons.map((b) => b.children[0]), ["去保存渠道", "仍要退出"], "两钮词逐字（`finishGuardGo` ∥ `finishGuardExit`）")
})

// ─── 腿二 · 逐态接线 ─────────────────────────────────────────────────────────

test("腿二 逐态接线：空 key ⇒ 零提交 + 进 ∥ 非空 ⇒ 先存后进（成 ⇒ 进 ∥ 败/非 true ⇒ 留步）∥ 桥面返回 `true`", async () => {
  const { createWizard } = await import(at("thincoder-desktop/renderer/mount-onboarding.mjs"))
  const prevFormData = globalThis.FormData
  globalThis.FormData = FakeFormData
  try {
    const calls = []
    let mode = "ok" // ok ⇒ true ∥ fail ⇒ false ∥ hold ⇒ 手放 ∥ undefined ⇒ 非 true
    let release = null
    const store = STORE.createStore(wizardState({ step: 1 }))
    const { handlers } = createWizard({
      store, ask: async () => ({ ok: false, reason: "stub" }), report: () => {}, clearReport: () => {},
      loadModels: () => {}, verifyChannel: () => {},
      submitChannel: (event) => {
        calls.push(event)
        if (mode === "hold") return new Promise((resolve) => { release = resolve })
        if (mode === "fail") return Promise.resolve(false)
        if (mode === "undefined") return Promise.resolve(undefined)
        return Promise.resolve(true)
      },
    })
    const backToStepOne = () => store.set(STORE.setWizardStep(store.get(), 1))

    // 空 key ⇒ 零写直进（「零输入可走」性质保持 —— KD-79 逐态表）
    handlers.onSubmit(eventOf(formOf({ key: "" })))
    await settle()
    assert.equal(calls.length, 0, "空 key ⇒ 零提交调用（零写）")
    assert.equal(store.get().settings.wizard.step, 2, "空 key ⇒ 直进步 2")
    backToStepOne()

    // 非空 ⇒ 先存后进：写未落定 ⇒ 原地（零乐观前进）
    mode = "hold"
    handlers.onSubmit(eventOf(formOf({ key: "sk-live" })))
    await settle()
    assert.equal(calls.length, 1, "非空 ⇒ 先存（恰一次）")
    assert.equal(store.get().settings.wizard.step, 1, "写未落定 ⇒ 原地留步")
    release(true)
    await settle()
    assert.equal(store.get().settings.wizard.step, 2, "写落定（`true`）⇒ 进")
    backToStepOne()

    // 非空败（false）⇒ 留步；非 `true` 返回值一律不进（负控 = 旧 `void` 消费形不回引）
    mode = "fail"
    handlers.onSubmit(eventOf(formOf({ key: "sk-live" })))
    await settle()
    assert.equal(store.get().settings.wizard.step, 1, "写败（`false`）⇒ 原地留步（失败串归出口族 `report`）")
    mode = "undefined"
    handlers.onSubmit(eventOf(formOf({ key: "sk-live" })))
    await settle()
    assert.equal(store.get().settings.wizard.step, 1, "返回值非 `true` ⇒ 不进（负控）")

    // 桥面（唯一 +1 行为行 —— 实读 `mount-settings-exits.mjs` 成功径 `return true`）：装配面 `handlers.onSubmit` 成 ⇒ `true`
    const { createExits } = await import(at("thincoder-desktop/renderer/mount-settings-exits.mjs"))
    const patches = []
    const exitsStore = STORE.createStore(wizardState({ step: 1 }))
    const exits = createExits({
      ask: async (channel) => (channel === "provider:save" ? { ok: true, providerState: null } : { ok: true }),
      store: exitsStore,
      setSettings: (patch) => { patches.push(patch); exitsStore.set(STORE.patchSettings(exitsStore.get(), patch)) },
      report: () => {}, clearReport: () => {}, occupies: () => false, slot: '[data-slot="settings"]',
      reads: { loadProviders: async () => {} },
    })
    const landed = await exits.handlers.onSubmit(eventOf(formOf({ shape: "preset", preset: "p1", key: "sk-live" })))
    assert.equal(landed, true, "成功径返回 `true`（向导「保存并继续」消费面；弹窗径 DOM 监听忽略返回值 —— 零变）")
    assert.ok(patches.some((patch) => patch.verify === null), "成功径同拍清校验读数（既有 —— 零改）")
  } finally {
    globalThis.FormData = prevFormData
  }
})

// ─── 腿三 · 护栏 ─────────────────────────────────────────────────────────────

test("腿三 护栏：未配 ⇒ 旗 + 不退场 ∥ 已配 ⇒ 照退（零旗）∥ `guardBack` ⇒ 步 1 + 旗清 ∥ 任意步写 ⇒ 旗随写收束", async () => {
  const { createWizard } = await import(at("thincoder-desktop/renderer/mount-onboarding.mjs"))
  const mk = (receipt) => {
    const store = STORE.createStore(wizardState({ step: 3 }))
    const { handlers } = createWizard({
      store, ask: async () => receipt, report: () => {}, clearReport: () => {},
      loadModels: () => {}, submitChannel: () => {}, verifyChannel: () => {},
    })
    return { store, handlers }
  }

  // 未配 ⇒ 不退场 + 旗落位（④ —— 零静默退场）
  const blocked = mk({ configured: false })
  blocked.handlers.onFinish()
  await settle()
  assert.equal(blocked.store.get().settings.wizard.dismissed, false, "未配 ⇒ 不退场")
  assert.equal(blocked.store.get().settings.wizard.finishBlocked, true, "未配 ⇒ 护栏旗落位")
  assert.equal(ONBOARDING.wizardModel(blocked.store.get()).active, true, "向导仍在场（占槽保持）")
  assert.ok(findDeep(ONBOARDING.wizardTree(ONBOARDING.wizardModel(blocked.store.get()), {}), (n) => n?.props?.["data-finish-guard"] !== undefined) !== null, "旗 ⇒ 护栏就地可见")

  // 已配 ⇒ 照退（零改：走 configured 闸）+ 零旗
  const passed = mk({ configured: true })
  passed.handlers.onFinish()
  await settle()
  assert.equal(passed.store.get().settings.configured, true, "已配 ⇒ 配置读数落真")
  assert.equal(ONBOARDING.wizardModel(passed.store.get()).active, false, "已配 ⇒ 向导退场（零改）")
  assert.notEqual(passed.store.get().settings.wizard.finishBlocked, true, "已配 ⇒ 零护栏旗")

  // guardBack ⇒ 步 1 + 旗清（④ 两钮之一）
  const backed = mk({ configured: false })
  backed.handlers.onFinish()
  await settle()
  assert.equal(backed.store.get().settings.wizard.finishBlocked, true, "护栏前置：旗在场")
  backed.handlers.onGuardBack()
  assert.equal(backed.store.get().settings.wizard.step, 1, "`guardBack` ⇒ 回步 1")
  assert.notEqual(backed.store.get().settings.wizard.finishBlocked, true, "`guardBack` ⇒ 旗清")

  // 「仍要退出」= 复用既有 `dismissWizard`（锚 `settings:close`——单一实现）⇒ 照退场（零新退场机制）
  const exited = mk({ configured: false })
  exited.handlers.onFinish()
  await settle()
  assert.equal(exited.store.get().settings.wizard.finishBlocked, true, "护栏前置：旗在场")
  exited.handlers.onDismiss()
  assert.equal(exited.store.get().settings.wizard.dismissed, true, "「仍要退出」⇒ 退场（同 `dismissWizard`）")
  assert.equal(ONBOARDING.wizardModel(exited.store.get()).active, false, "退场后向导零占槽（容器清空）")

  // 任意步写 ⇒ 旗随写收束（`setStep` 单点清 —— 负控径 = 回路由屏）
  const written = mk({ configured: false })
  written.handlers.onFinish()
  await settle()
  written.handlers.onBackToRoute()
  assert.equal(written.store.get().settings.wizard.step, "route", "步写落地（回路由屏）")
  assert.notEqual(written.store.get().settings.wizard.finishBlocked, true, "任意步写 ⇒ 旗随写收束（`setStep` 单点清）")
})

// ─── 腿四 · 弹窗负控 ─────────────────────────────────────────────────────────

test("腿四 弹窗负控：`channelFormTree` 缺 `submitClass` ⇒ 缺省类 `settings-submit`（弹窗径零变）∥ 传类 ⇒ 采纳", () => {
  const legacy = CONTROLS.channelFormTree({ shape: "preset", presets: [{ name: "p1" }] }, { onSubmit: () => {} })
  const legacySubmit = findDeep(legacy, (n) => n?.tag === "button" && n?.props?.["data-action"] === "settings:addPreset")
  assert.equal(legacySubmit.props.class, "settings-submit", "缺省类 = `settings-submit`（弹窗 ∥ 行内径零变）")
  assert.equal(legacySubmit.children[0], i18n.t("settings.save"), "缺省词 = 既有 `settings.save`（零变）")

  const wizardish = CONTROLS.channelFormTree({ shape: "preset", presets: [{ name: "p1" }], submitKey: "wizard.saveAndNext", submitClass: "wizard-save" }, { onSubmit: () => {} })
  const wizardishSubmit = findDeep(wizardish, (n) => n?.tag === "button" && n?.props?.["data-action"] === "settings:addPreset")
  assert.equal(wizardishSubmit.props.class, "wizard-save", "传类 ⇒ 采纳（向导步 1 径）")
  assert.equal(wizardishSubmit.children[0], "保存并继续", "传词键 ⇒ 采纳")
})

// ─── 腿五 · 词表 ─────────────────────────────────────────────────────────────

test("腿五 词表：4 新键 × 两语逐字（en 零 CJK）∥ 旧键 `wizard.save` 退场 + 源扫零命中 ∥ 键数链 349", () => {
  const pairs = [
    ["wizard.saveAndNext", "保存并继续", "Save & continue"],
    ["wizard.finishGuard", "尚未保存任何配置——请先保存渠道，或选择『仍要退出』稍后再配置", "Nothing has been saved yet — save a provider first, or exit and configure later."],
    ["wizard.finishGuardGo", "去保存渠道", "Save a provider"],
    ["wizard.finishGuardExit", "仍要退出", "Exit anyway"],
  ]
  for (const [key, zh, en] of pairs) {
    assert.equal(i18n.HOST_DICT.zh[key], zh, `zh ${key} 逐字`)
    assert.equal(i18n.HOST_DICT.en[key], en, `en ${key} 逐字`)
    assert.equal(/[\u4e00-\u9fff]/.test(en), false, `en ${key} 零 CJK`)
  }
  assert.equal(Object.hasOwn(i18n.HOST_DICT.zh, "wizard.save"), false, "旧键 zh 退场")
  assert.equal(Object.hasOwn(i18n.HOST_DICT.en, "wizard.save"), false, "旧键 en 退场")

  // 键数链（届盘实读 346 ⇒ 349：−1 + 4）∥ 两语键集相等
  const enKeys = Object.keys(i18n.HOST_DICT.en)
  const zhKeys = Object.keys(i18n.HOST_DICT.zh)
  assert.equal(enKeys.length, 349, "键数链 = 349（en）")
  assert.equal(zhKeys.length, 349, "键数链 = 349（zh）")
  assert.deepEqual([...enKeys].sort(), [...zhKeys].sort(), "两语键集相等")

  // 渲染面源扫：旧键零命中（`"wizard.save"` 带引号 —— 排除 `wizard.saveAndNext` 前缀误伤）
  const out = []
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name)
      if (statSync(p).isDirectory()) walk(p)
      else if (name.endsWith(".mjs")) out.push(p)
    }
  }
  walk(join(ROOT, "thincoder-desktop/renderer"))
  for (const file of out) assert.equal(readFileSync(file, "utf8").includes('"wizard.save"'), false, `旧键零命中：${file.replace(ROOT, "")}`)
})

// ─── 腿六 · 校验消费 ─────────────────────────────────────────────────────────

test("腿六 校验消费：树面四径（锚 ∥ 短形词 ∥ 明细行）∥ 投影对拍 ∥ 共序负控（verify = fail 不拦写）", async () => {
  // ① ok 径
  const okTree = treeOf({ verify: { kind: "ok", count: 3, reason: null, name: "p1" } })
  const okButton = findDeep(okTree, (n) => n?.props?.["data-action"] === "settings:verify")
  assert.equal(okButton.props["data-verify-state"], "ok", "锚 = `data-verify-state=\"ok\"`")
  assert.equal(okButton.children[0], "校验通过", "短形词「校验通过」（`okShort`）")
  const okRow = findDeep(okTree, (n) => n?.props?.["data-verify"] !== undefined)
  assert.equal(okRow.props["data-verify"], "ok", "明细行锚")
  assert.equal(okRow.children[0], "校验通过 · 3 个模型", "明细行 = `verifyNode` 同源形（计数在场）")

  // ② fail 径（原因经 `reasonWord`）
  const failTree = treeOf({ verify: { kind: "fail", count: null, reason: "timeout", name: "p1" } })
  const failButton = findDeep(failTree, (n) => n?.props?.["data-action"] === "settings:verify")
  assert.equal(failButton.props["data-verify-state"], "fail", "锚 = `data-verify-state=\"fail\"`")
  assert.equal(failButton.children[0], "校验失败", "短形词「校验失败」（`failShort`）")
  const failRow = findDeep(failTree, (n) => n?.props?.["data-verify"] !== undefined)
  assert.equal(failRow.props["data-verify"], "fail", "明细行锚（fail 态）")
  assert.equal(failRow.children[0], "校验失败：超时", "明细行（原因经 `reasonWord`）")

  // ③ 空径（未校验）—— 原词 + 零锚 + 零明细行
  const noneTree = treeOf({ verify: null })
  const noneButton = findDeep(noneTree, (n) => n?.props?.["data-action"] === "settings:verify")
  assert.equal(noneButton.children[0], "校验", "未校验 ⇒ 原词「校验」")
  assert.equal(noneButton.props["data-verify-state"], undefined, "未校验 ⇒ 零锚")
  assert.equal(findDeep(noneTree, (n) => n?.props?.["data-verify"] !== undefined), null, "未校验 ⇒ 零明细行")

  // ④ kind 表外 ⇒ 零假造（钮词与明细行皆退）
  const junkTree = treeOf({ verify: { kind: "probe", count: 1, reason: null, name: "p1" } })
  const junkButton = findDeep(junkTree, (n) => n?.props?.["data-action"] === "settings:verify")
  assert.equal(junkButton.children[0], "校验", "kind 表外 ⇒ 原词（零假造）")
  assert.equal(junkButton.props["data-verify-state"], undefined, "kind 表外 ⇒ 零锚")
  assert.equal(findDeep(junkTree, (n) => n?.props?.["data-verify"] !== undefined), null, "kind 表外 ⇒ 零明细行（零假造）")

  // ⑤ 投影对拍：`wizardModel.verify` ≡ `settingsModel.providers.verify`（同源 —— 单一 owner 住 `views/settings.mjs:172`）
  for (const verify of [null, { kind: "ok", count: 1, reason: null, name: "p1" }, { kind: "fail", count: null, reason: "timeout", name: "p1" }]) {
    const state = wizardState({ verify })
    assert.equal(ONBOARDING.wizardModel(state).verify, SETTINGS_VIEW.settingsModel(state).providers.verify, "投影同源对拍")
  }
  const junkState = wizardState({ verify: "bogus" })
  assert.equal(ONBOARDING.wizardModel(junkState).verify, null, "形不合 ⇒ null（零假造）")
  assert.equal(SETTINGS_VIEW.settingsModel(junkState).providers.verify, null, "同判（同源）")

  // ⑥ 共序负控：verify = fail 在场 ⇒ `submitAndContinue` 两径照走（零互锁 —— KD-11 延伸）
  const { createWizard } = await import(at("thincoder-desktop/renderer/mount-onboarding.mjs"))
  const prevFormData = globalThis.FormData
  globalThis.FormData = FakeFormData
  try {
    const calls = []
    const store = STORE.createStore(wizardState({ step: 1, verify: { kind: "fail", count: null, reason: "timeout", name: "p1" } }))
    const { handlers } = createWizard({
      store, ask: async () => ({ ok: false, reason: "stub" }), report: () => {}, clearReport: () => {},
      loadModels: () => {}, verifyChannel: () => {},
      submitChannel: (event) => { calls.push(event); return Promise.resolve(true) },
    })
    handlers.onSubmit(eventOf(formOf({ key: "" })))
    await settle()
    assert.equal(store.get().settings.wizard.step, 2, "fail 读数在场 ⇒ 空 key 径照进（零互锁）")
    store.set(STORE.setWizardStep(store.get(), 1))
    assert.equal(store.get().settings.verify?.kind, "fail", "fail 读数仍在场（前置保持）")
    handlers.onSubmit(eventOf(formOf({ key: "sk-x" })))
    await settle()
    assert.equal(calls.length, 1, "fail 读数在场 ⇒ 非空径照存（校验不拦写 —— KD-11）")
    assert.equal(store.get().settings.wizard.step, 2, "照进（零乐观回退）")
  } finally {
    globalThis.FormData = prevFormData
  }
})
