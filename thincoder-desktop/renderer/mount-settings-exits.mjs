/**
 * mount-settings-exits.mjs — 设置面出口族 + 写路辅助（「桌面处理流 · VSC 对齐」批 R8 · 自
 * `renderer/mount-settings.mjs` 拆出 —— 300 行层拆分，零语义变化）：**本档直辖出口**（提交 ∕ 校验 ∕ 移除 ∕
 * 采用模型 ∕ 语言 ∕ 开合 ＋ Esc 关闭绑定）+ **五族出口工厂装配**（段 ∕ MCP ∕ models ∕ 渠道 ∕ agent ——
 * 本档装配合并，单一 `handlers` 表对外零改）。
 * **R7（桌面功能对位批）先拆后改**：MCP 增删 ∕ 索引构建三出口 + 新增段出口（env ∕ 两 key ∕ models ∕ MCP
 * 展开面）共**二十一**出口随族迁出（env ∕ 工具 ∕ MCP **十三** = `renderer/mount-settings-segments.mjs`；models 八 =
 * `renderer/mount-settings-segments-models.mjs`）；`formOf` 经 `deps` 回注段族（单一 owner ⇒ 零副本）。
 * **MCP 键值行式输入批（#1036 · 2026-10-07）**：MCP 族**九**出口自 `mount-settings-segments.mjs` 拆出
 * `renderer/mount-settings-segments-mcp.mjs`（该族现**十二** = 九搬移 + kv 加 ∕ 删两新 + 入口开径〔KD-77 ① · #1054〕；先拆后改——越 300 在册预案兑现；本档装配即合并，对外零改）。
 *
 * 接线沿 `mount-onboarding.mjs` 注入先例：`createExits(deps)` —— `deps = { ask, store, setSettings, report, clearReport, occupies, reads, slot, paintSettings }`
 * （窄桥 ∕ 值面 ∕ 失败面 ∕ 读数供给 ∕ 槽锚 ∕ 重绘归装配面）；返回 `{ handlers, openSettings, closeSettings }`（`handlers` = 视图 `data-action` 同域出口表）。
 * **B10 W2**：渠道面六出口（S1 钥编辑两件 + 设 ∕ 改钥 + 删钥 · S5 代理开关 · S2 拉取模型）随族拆出
 * `renderer/mount-settings-segments-providers.mjs`（按族续拆；本档装配合并，单一 `handlers` 表对外零改）；
 * 本档增：渠移除 ∕ 删钥删除门（S6 —— `settings-confirm.mjs`）+ 开 ∕ 关面面态复位（`edit` ∕ `probe` ∕ `draft`）。
 * **B10 W3**：agent 段三出口（`namedOut` ∥ `applyNamedField` ∥ `toggleGuard`
 * —— S10 ∕ S11 ∕ S14b）随族拆出 `renderer/mount-settings-segments-agent.mjs`（拆分债注③预案落形：本批
 * agent 面三触点原拆点；本档装配合并，单一 `handlers` 表对外零改）；开 ∕ 关面面态复位同拍扩 MCP 表单态
 * （`form` —— S8 编辑态不跨面驻留）。
 * **D33（主题切换批 · 2026-09-30 · 台账 #743）**：主题出口 `onSetTheme` —— 单写者 = `renderer/theme.mjs`
 * （`setTheme` 落 `data-theme` + 存储）⇒ 切片写（`SETTINGS_KEYS` 含 `theme` ⇒ 设置面头三钮当前态随动）；表外值 ⇒ `null`（零写零改）。
 * 语义锚（`docs/desktop/design/IPC.md` §2 设置族注）：出站失败 ⇒ **零乐观写**（不摘项、不改段读数）；畸形 JSON ⇒ **零发送**；
 * 写成功 ⇒ 清失败串 + 重读本段。**#652**：写成功径（渠道两形提交 ∕ 钥存）在复位写前声明草稿失效（`invalidateDrafts(scope)`
 * 注入 —— 作用域取值面 = 视图档 `[data-draft-scope]` 自携；失败径零声明 —— 草稿保真）。**2026-10-01 复核扫面收正批（M2）**：
 * 渠道提交成功径同清**草稿专件** `providers.draft`（复位点表第五点 —— 现役注面 = `mount-settings-segments-providers.mjs` 档头）。**P14 出值规范化**（数值 ⇒ `Number(v)`〔空 / 非数 ⇒ 零发送〕· 布尔 ⇒ `.checked` · 串 ⇒ 原串；无效值 ⇒ 控件回退现值）· **P15 具名控件即改即存**（单键 patch 直发 —— 写路随 W3 迁 `mount-settings-segments-agent.mjs`）· **F-Esc 关面板**（Esc ⇒ 既有 `closeSettings` 出口，单一实现 —— 绑定宿主 = `document`）。
 * **D39（设置菜单升级批 · #817 ∥ KD-68）**：`resetFacets(state, group)` = 本组面态复位原语（modal 开 ∥ 关**限本组** ——
 * 开 ∥ 关面整复位同源取用）；`closeSettings` 同拍清 `modal`；F-Esc 闸增 `modal != null` 守卫（弹窗体自持卡内 Esc —— 不连带关页）。
 * **三端对齐批（2026-10-07 · 台账 #1027–#1029 · KD-75 ②⑥）**：新增「添加入口」出口 `onAddProvider`
 *  （`deps.openModal` 迟绑定注入 —— 沿 `paintSettings` 先例；缺 ⇒ 本键不注册）；`submitChannel` 随单表改线：
 *  名称 ∥ 形状自 `preset` ∥ 隐藏 `shape` 读、载荷 + `proxy`（勾选 ⇒ `true`）、成功径宿主关（`deps.closeModal` —— KD-68 关径）；
 *  `resetFacets` 增添加弹窗组支（`addShape` 回报 `"preset"` + `probe` ∥ `draft` 清）。
 * **添加入口弹窗统一批（2026-10-07 · 台账 #1054 · KD-77 ①②）**：`resetFacets` 增两新组支（`mcpForm` → `form` 清 ∥
 *  `consultAdd` → `models.picker` 复位）；`openModal` ∥ `closeModal` 同注入两段族（`mcpSegments` ∥ `modelSegments`）——
 *  两入口 handler（`onMcpAddOpen` ∥ `onConsultAddOpen`）∥ 编辑开径（先开后写）∥ 成功径 ∥ 取消径的关框皆住各族，
 *  本档装配即合并，对外零改。
 * **#841（provider 态第三刷新点）**：设置写成功回执（`settings:agent` ∥ `provider:save`）携 `providerState` ⇒
 * 同写点落切片（`useModel` ∥ `submitChannel` 两处；键缺席 ⇒ 零写）——设置面修好 `defaultModel`
 * 后输入区提示行即时退场；单源 = `docs/desktop/design/IPC.md` §2「provider 态投影注」项 3。
 * **2026-10-09 清除批**：`submitChannel` 载荷去 `model` ∥ `active`（渠道单值模型退场——`defaultModel` 写入面
 * = 视图出口 ∥ 选定写回；向导步 1 复选随实施期 fix 轮退场〔`active` 无写路 ⇒ 死控——件 ∥ 参双净删〕）。
 * 纪律：零 `node:` / 零裸包 · 逐通道回执形单源 = IPC.md §2。
 */
import { initDict } from "./i18n.mjs"
import { configuredFlag, patchSettings, setProviderState } from "./store.mjs"
import { setAccent, setCustomAccent, setTheme } from "./theme.mjs"
import { presetValue } from "./mount-onboarding.mjs"
import { createSegmentExits } from "./mount-settings-segments.mjs"
import { createMcpExits } from "./mount-settings-segments-mcp.mjs"
import { createModelsExits } from "./mount-settings-segments-models.mjs"
import { createProviderExits } from "./mount-settings-segments-providers.mjs"
import { createAgentExits } from "./mount-settings-segments-agent.mjs"
import { closeSettingsConfirm, confirmSecretDelete } from "./settings-confirm.mjs"
import { ADD_MODAL_GROUP, CONSULT_ADD_MODAL_GROUP, MCP_FORM_MODAL_GROUP } from "./views/settings.mjs"

/** 表单自取：提交控件 `type="button"`（handlers 直传 ⇒ 监听器 = 本函数，收 **Event**）⇒ `closest("form")`。 */
function formOf(event) {
  const target = event?.currentTarget ?? event?.target ?? null
  if (target === null || typeof target.closest !== "function") return null
  return target.closest("form")
}

/** 列表归一：缺 / 非数组 ⇒ 空表（零节点 —— 禁假数据）。 */
const listOf = (value) => (Array.isArray(value) ? value : [])
/** 失败串归一：回执 `reason` 非空串 ⇒ 直传（核错误串 ∕ 表内码）；缺 ⇒ 端侧形判码（零静默 —— 调用面另记错）。 */
const reasonOf = (receipt) => (typeof receipt?.reason === "string" && receipt.reason !== "" ? receipt.reason : "invalid-shape")

/**
 * 出口族工厂。`deps.reads = { loadProviders, loadAgent, loadMcp }`（读数供给族注入）；`deps.paintSettings`
 * = 装配面重绘口（无效数值回退现值用）；`deps.slot` = 设置槽锚（表单现选自读）；`deps.openModal` = 添加弹窗开径
 * （`onAddProvider` 出口 —— KD-75 ②；**KD-77 ①②** 起同注入两段族（`mcpSegments` ∥ `modelSegments` —— 两入口开径）；
 * 缺 ⇒ 出口不注册，钮面 `wire` 落 `disabled`）；`deps.closeModal` = 保存成功径宿主关
 * （KD-75 ⑥ —— §2.4 行 6「提交 ⇒ 宿主关（KD-68 关径）」；**KD-77 ①②** 起同注入两工厂（成功 ∥ 取消径））。
 */
export function createExits(deps = {}) {
  const { ask, store, setSettings, report, clearReport, occupies, slot, paintSettings, onProvidersChanged, invalidateDrafts } = deps
  const { loadProviders, loadAgent, loadMcp, loadEnv, loadTools, loadUsage, loadModelParams } = deps.reads ?? {}
  const openModal = typeof deps.openModal === "function" ? deps.openModal : null
  const closeModal = typeof deps.closeModal === "function" ? deps.closeModal : null

  /** 渠道表单提交（单表一路）：载荷按形直取（表内 `name` = 载荷键）——空名 ⇒ 端侧形判 `invalid-shape` 零发送。
   *  形状判据 = 隐藏携带值（`providers.addShape` 渲染面）为主；类型选择现选为 `"custom"`（预设表空时兜底现选）⇒ 自定形。
   *  名称：自定形读 `name`；预设形读 `preset`（类型选择现值 = 预设名）。`proxy`：勾选 ⇒ `true`；未勾 ∥ 缺 ⇒ 直连（零键）。
   *  **2026-10-09 清除批**：载荷去 `active` ∥ `model`（渠道单值模型退场——形 = `IPC.md` §2 `provider:save` 行）。
   *  **关·保存**（KD-75 ⑥）：弹窗体提交（成盘回执 `ok`）⇒ 宿主关（KD-68 关径 —— 切片清 + 本组面态复位 + 子确认同清）；
   *  失败径留框（失败串落框体 —— 零静默）；向导步 1 提交（无弹窗体）零动作；**成功径返回 `true`**（首启保存面收正批 · KD-79 ②③ ——
   *  向导「保存并继续」消费：成 ⇒ 前进；弹窗径 DOM 监听忽略返回值 ⇒ 零变）。 */
  async function submitChannel(event) {
    const form = formOf(event)
    if (form === null) return
    const data = new FormData(form)
    const choice = String(data.get("preset") ?? "")
    const shape = data.get("shape") === "custom" || choice === "custom" ? "custom" : "preset"
    const name = shape === "custom" ? String(data.get("name") ?? "") : choice
    const key = String(data.get("key") ?? "")
    // 上下文窗口（2026-10-10 · 模型参数能力批）：**K 单位**；空 ⇒ 不带键（不落 = 用模型规格值）。
    const ctx = String(data.get("context") ?? "").trim()
    const ctxPart = ctx === "" ? {} : { context: ctx }
    if (name === "") {
      console.error("[renderer] provider:save: empty name")
      report("providers", { reason: "invalid-shape" }, "provider:save")
      return
    }
    const common = { ...(data.get("proxy") !== null ? { proxy: true } : {}), ...(key === "" ? {} : { key }) }
    const payload = shape === "custom"
      ? { name, shape, baseURL: String(data.get("baseURL") ?? ""), format: String(data.get("format") ?? ""), ...common, ...ctxPart }
      : { name, shape: "preset", preset: name, ...common, ...ctxPart }
    const receipt = await ask("provider:save", payload)
    if (receipt.ok !== true) {
      report("providers", receipt, "provider:save")
      return
    }
    if (store.get().settings?.modal === ADD_MODAL_GROUP) {
      if (closeModal !== null) closeModal()
      else console.error("[renderer] provider:save: modal close unavailable")
    }
    store.set(setProviderState(store.get(), receipt.providerState)) // #841：设置写回执 providerState 落切片（第三刷新点；键缺席 ⇒ 零写）
    // #652 写成功径：该表单草稿一次性作废（作用域 = 表单自携 `data-draft-scope` —— 单源在视图档；失败径零声明）。
    invalidateDrafts?.(typeof form.getAttribute === "function" ? form.getAttribute("data-draft-scope") : null)
    clearReport()
    // M2（2026-10-01 复核扫面收正批）：成功径同清**草稿专件** `providers.draft`（S2 暂存值快照 —— 不清 ⇒ 重挂经种子
    // 回填旧值含钥）；复位点表第五点（#671 裁定现役注面 = `mount-settings-segments-providers.mjs` 档头）；失败径零清。
    const providers = store.get().settings?.providers ?? {}
    setSettings({ verify: null, providers: { ...providers, draft: null } })
    await loadProviders()
    onProvidersChanged?.() // 全渠扇出批 · #3：provider 写成功 ⇒ 输入区候选面强制刷新（渠道集已变 —— 首启向导同路）
    return true // 向导「保存并继续」消费（KD-79 ②③）：成 ⇒ 前进；弹窗径 DOM 监听忽略返回值（零变）
  }

  /** 校验出口（`provider:verify`）：`name` 缺（向导步 1）⇒ 自读表单现选；探不通**仍可保存**（只出读数，不拦写）。 */
  async function verifyChannel(name) {
    const target = typeof name === "string" && name !== "" ? name : presetValue(slot)
    if (target === null) {
      console.error("[renderer] provider:verify: no channel selected")
      report("providers", { reason: "invalid-shape" }, "provider:verify")
      return
    }
    setSettings({ verify: null })
    const receipt = await ask("provider:verify", { name: target })
    if (receipt.ok === true) {
      clearReport()
      setSettings({ verify: { kind: "ok", count: listOf(receipt.models).length, reason: null, name: target } })
      return
    }
    setSettings({ verify: { kind: "fail", count: null, reason: reasonOf(receipt), name: target } })
  }

  /** 渠道移除**执行径**（确认面「是」⇒ 本径；S6 前 = 直删）：失败（含激活渠道保护）⇒ 核文案直传
   *  ⇒ **零乐观摘项**（列表不动 + 失败面）。 */
  async function runRemoveProvider(name) {
    const receipt = await ask("provider:remove", { name })
    if (receipt.ok !== true) {
      report("providers", receipt, "provider:remove")
      return
    }
    clearReport()
    setSettings({ verify: null })
    await loadProviders()
    onProvidersChanged?.() // 全渠扇出批 · #3：同上（删除至无渠 ⇒ #6 零推送边界）
  }

  /** 渠道移除出口（S6：**不可复得类删除前置确认** —— 条目连带其 `apiKey` 原文消失；驳回 ⇒ 零写）。 */
  function removeProvider(name) {
    confirmSecretDelete(() => { void runRemoveProvider(name) })
  }

  /** 模型采用出口：写 `defaultModel` 复合串（键面与形态判归核 —— `settings:agent` 写通道）⇒ 写后回读两段。 */
  async function useModel(provider, name) {
    if (typeof provider !== "string" || provider === "" || typeof name !== "string" || name === "") return
    const composite = `${provider}:${name}`
    const receipt = await ask("settings:agent", { patch: { defaultModel: composite } })
    if (receipt.ok !== true) {
      report("panel", receipt, "settings:agent")
      return
    }
    store.set(setProviderState(store.get(), receipt.providerState)) // #841：设置写回执 providerState 落切片（第三刷新点；键缺席 ⇒ 零写）
    clearReport()
    setSettings({ agent: { state: "ready", fields: listOf(receipt.fields) } })
    await loadProviders()
  }

  /** 正整数归一（空 ∕ 非数 ∕ 非正 ⇒ null——零发送该叶）。 */
  function posIntOrNull(raw) {
    const text = String(raw ?? "").trim()
    if (text === "") return null
    const n = Number(text)
    return Number.isInteger(n) && n > 0 ? n : null
  }

  /** 「编辑模型配置」保存出口（2026-10-10 · 模型参数能力批）：表单值 ⇒ patch（逐叶归一，白名单在核）⇒
   *  `model:specSave`（写 `config.modelOverrides[<模型 ID>]`）。**空值 ⇒ 该叶不入 patch**（保持既有 ∕
   *  默认值，不写空叶）；档位文本逗号分隔 ⇒ 数组（去重保序）。成功 ⇒ 清失败串 + 草稿一次性作废 +
   *  复读 `model:spec`（生效值 ∕ 来源徽标 ∕ 行徽标随动——零网络复探；**弹窗保持开**，可连续改）。 */
  async function saveModelSpec(event) {
    const form = formOf(event)
    if (form === null) return
    const id = store.get().settings?.modelParams?.id
    if (typeof id !== "string" || id === "") {
      report("model", { reason: "invalid-shape" }, "model:specSave")
      return
    }
    const data = new FormData(form)
    const patch = {}
    const context = posIntOrNull(data.get("context"))
    if (context !== null) patch.context = context
    const maxOutput = posIntOrNull(data.get("maxOutput"))
    if (maxOutput !== null) patch.maxOutput = maxOutput
    const think = String(data.get("thinking") ?? "")
    if (think === "off") { patch.thinking = false; patch.thinkAlwaysOn = false }
    else if (think === "on") { patch.thinking = true; patch.thinkAlwaysOn = false }
    else if (think === "always") { patch.thinking = true; patch.thinkAlwaysOn = true }
    // 图像输入（三态）：空 = 跟随内置表（不入 patch ⇒ 整条覆写重写时该叶缺席）∕ 真 ∕ 假
    const mm = String(data.get("multimodal") ?? "")
    if (mm === "true") patch.multimodal = true
    else if (mm === "false") patch.multimodal = false
    const enums = String(data.get("reasoningEffortEnum") ?? "").split(",").map((s) => s.trim()).filter((s) => s !== "")
    if (enums.length > 0) patch.reasoningEffortEnum = [...new Set(enums)]
    const effortDefault = String(data.get("reasoningEffortDefault") ?? "").trim()
    if (effortDefault !== "") patch.reasoningEffortDefault = effortDefault
    const receipt = await ask("model:specSave", { id, patch })
    if (receipt.ok !== true) {
      report("model", receipt, "model:specSave")
      return
    }
    clearReport()
    invalidateDrafts?.("modelParams") // #652：写成功 ⇒ 该表单草稿一次性作废（失败径零声明）
    await loadModelParams?.(id)
    // **输入区候选面强制刷新**（2026-10-10 真机实测漏点）：覆写改的是模型**档位枚举 ∕ 默认档**，
    // 而输入区的候选行来自 `model:catalog` 投影（`modelEntry` 经 `specMatch`）—— 不重取则「前面」仍持
    // 旧行（用户实测：弹窗里设了 推理档位 low,max + 默认档 low，输入区钮仍显「未设置」、下拉只有「关闭」）。
    // 复用 provider 写成功同一条出口（`onProvidersChanged` ⇒ `composer.refreshCandidates()`）。
    onProvidersChanged?.()
  }

  /** 「编辑模型配置」重置出口：删 `modelOverrides[命中键]`（键 = `spec.overrideKey`，缺 ⇒ 模型 ID）⇒ 复读。
   *  **弹窗保持开**（用户看得到生效值 ∕ 徽标回落到内置表）。 */
  async function resetModelSpec() {
    const held = store.get().settings?.modelParams ?? {}
    const id = typeof held.id === "string" && held.id !== "" ? held.id : null
    if (id === null) {
      report("model", { reason: "invalid-shape" }, "model:specReset")
      return
    }
    const key = typeof held.spec?.overrideKey === "string" && held.spec.overrideKey !== "" ? held.spec.overrideKey : id
    const receipt = await ask("model:specReset", { key })
    if (receipt.ok !== true) {
      report("model", receipt, "model:specReset")
      return
    }
    clearReport()
    invalidateDrafts?.("modelParams")
    await loadModelParams?.(id)
    onProvidersChanged?.() // 同保存径：重置也改了档位枚举 ∕ 默认档 ⇒ 输入区候选面同拍刷新
  }

  /** 「编辑模型配置」弹窗开（模型行铅笔钮 ⇒ 本出口）：切片落 `{ open:true, id }` + 读 `model:spec`
   *  （读数落地即重绘弹窗体；读失败 ⇒ `loadModelParams` 自行退场 + 失败面 —— 零静默）。 */
  function openModelParams(id) {
    if (typeof id !== "string" || id === "") return
    setSettings({ modelParams: { open: true, id, spec: null } })
    void loadModelParams?.(id)
  }

  /** 「编辑模型配置」弹窗关（✕ ∕ 背板 ∕ 卡内 Esc 三关同引）：切片清（宿主 `renderSettingsModal(null)` 退场）。 */
  function closeModelParams() {
    setSettings({ modelParams: { open: false, id: null, spec: null } })
  }

  /** 段出口族（env ∕ 工具与服务 ∕ MCP **十八**项 + models 八项 —— 合 **26**）随 R7 ∕ W3 迁 `mount-settings-segments.mjs` ∕
   *  `mount-settings-segments-models.mjs`（段出口族工厂 —— 共享项注入，本档零副本）；`formOf` 回注
   *  （单一 owner 在本档）；**#679**：`invalidateDrafts` 随注入（段族三径声明 —— MCP 增 ∕ 改 · tools 钥存 ∕ 删钥 · env shell）。 */
  const segments = createSegmentExits({
    ask, store, setSettings, report, clearReport, reads: deps.reads ?? {}, formOf, invalidateDrafts,
  })
  // KD-77 ②：`openModal` ∥ `closeModal` 同注入（入口开径 ∥ 成功 ∥ 取消三径的弹窗开关）。
  const modelSegments = createModelsExits({ ask, store, setSettings, report, clearReport, reads: deps.reads ?? {}, openModal, closeModal })
  /** 渠道面出口族（S1 ∕ S2 ∕ S5 —— 随本批按族拆出 `mount-settings-segments-providers.mjs`：
   *  本档装配即合并，单一 `handlers` 表对外零改；`loadProviders` 绑定 `{ models: false }` —— 渠行面
   *  复读不重探模型面（候选面随动另路 = `onProvidersChanged`））。 */
  const providerSegments = createProviderExits({
    ask, store, setSettings, report, clearReport, onProvidersChanged, formOf, invalidateDrafts,
    loadProviders: () => loadProviders({ models: false }),
  })
  /** agent 段出口族（S10 ∕ S11 ∕ S14b —— 随本批按族拆出 `mount-settings-segments-agent.mjs`：本档装配
   *  即合并，单一 `handlers` 表对外零改）。 */
  const agentSegments = createAgentExits({ ask, store, setSettings, report, clearReport, paintSettings })
  /** MCP 段出口族（S8 ∕ S9 —— MCP 键值行式输入批（#1036）按族拆出 `mount-settings-segments-mcp.mjs`：
   *  本档装配即合并，单一 `handlers` 表对外零改）。 */
  // KD-77 ①：`openModal` ∥ `closeModal` 同注入（入口 ∥ 编辑开径 ∥ 成功 ∥ 取消四径的弹窗开关）。
  const mcpSegments = createMcpExits({ ask, store, setSettings, report, clearReport, reads: deps.reads ?? {}, slot, formOf, invalidateDrafts, openModal, closeModal })

  /** 语言出口（`config:write` 键白名单仅 `locale`）：成功回带 `{ locale, dict, configured }` ⇒ 词表重刷 + 向导闸随新档态（**一次写**）。 */
  async function toggleLang(target) {
    const receipt = await ask("config:write", { patch: { locale: target } })
    if (receipt.ok !== true) {
      report("panel", receipt, "config:write")
      return
    }
    clearReport()
    const locale = initDict(receipt)
    store.set({ ...patchSettings(store.get(), { configured: configuredFlag(receipt.configured), notice: null }), locale })
  }

  /** 主题出口（D33 · 台账 #743 —— 单写者 = `renderer/theme.mjs`）：`setTheme` 落 `data-theme` + 存储 ⇒ 返落地值；
   *  落地值非 `null` ⇒ 切片写（`SETTINGS_KEYS` 含 `theme` ⇒ 设置面头三钮当前态随动）+ **勾选态回读报告**（D36 · 两写作点②）；
   *  表外值 ⇒ `null`（零写零改 —— 面零变更；报告零发）。 */
  /** 主题色出口（下级配色 · 2026-10-05 —— `theme.mjs` `setAccent` 单写者 + 切片写）：
   *  落地 `data-accent` + 落存储 ⇒ `--accent` 全域联动；SETTINGS_KEYS 含 accent ⇒ 色板态随重绘。 */
  function setAccentFace(id) {
    // 自定义取色 · 2026-10-05：#开头值 = 自定义 hex（theme.mjs setCustomAccent 校验落地 —— inline --accent + data-accent=custom）
    if (typeof id === "string" && id.startsWith("#")) {
      const hex = setCustomAccent(id)
      if (hex === null) return
      store.set({ accent: hex })
      return
    }
    const landed = setAccent(id)
    if (landed === null) return
    store.set({ accent: landed })
  }

  function setThemeFace(target) {
    const landed = setTheme(target)
    if (landed === null) return
    store.set({ theme: landed })
    // D36 勾选态回读（两写作点②）：报告落地值 ⇒ 主进程菜单主题▸带勾；失败 ⇒ 记错（零静默 —— 菜单侧 fail-open 全零勾）。
    void ask("theme:state", { theme: landed }).then((receipt) => {
      if (receipt?.ok !== true) console.error(`[renderer] theme:state failed: ${receipt?.reason ?? "unknown"}`)
    })
  }

  /** 档位快填出口（2026-10-10 五轮 —— 三处档位 `select` 共用：弹窗两字段 ∕ 渠道表单 ∕ 渠行内 ctx 编辑态）。
   *  **邻接不变量**：档位 `select` 恒为其值输入框的**紧邻后继兄弟**（`previousElementSibling` 解析 ——
   *  三处布局各异，且渠道表单两形的 `id="context"` 是重复 id ⇒ 不能按 id ∕ name 定位）。
   *  `select` 选完**自复位**（它是纯快填菜单、不持有值 —— 唯一值持有者恒为输入框；免「谁是真值」歧义）；
   *  写值后派 `input` 事件（下游若监听 input 亦能感知）。邻接失配 ⇒ 记错零动作（零静默 —— 结构漂移即显）。 */
  function pickTier(event) {
    const select = event?.target ?? null
    const value = typeof select?.value === "string" ? select.value : ""
    if (typeof select === "object" && select !== null && "value" in select) select.value = ""
    if (value === "") return
    const input = select?.previousElementSibling ?? null
    if (input === null || input.tagName !== "INPUT") {
      console.error("[renderer] tier pick: sibling value input not found (adjacency invariant broken)")
      return
    }
    input.value = value
    input.dispatchEvent?.(new Event("input", { bubbles: true }))
  }

  /** 本组面态复位（D39 ∥ KD-68 ④ —— modal 开 ∥ 关**限本组**；原语与开 ∥ 关面整复位同口径：providers →
   *  `edit/probe/draft/keyDraft`（S1 ∕ S2 ∕ #615②）∥ mcp → `form`（S8）；
   *  **添加弹窗组（KD-75 ②）** → `addShape` 回 `"preset"`（形状复位 = 缺省态）+ `probe` ∥ `draft` 清
   *  （行面态 `edit` ∥ `keyDraft` 不住本组 —— 零动）；**两新组（KD-77 ①②）** → `mcpForm` = `form` 清（开 = 新增态；
   *  编辑态 = 开径后写 —— 先开后写）∥ `consultAdd` = `models.picker` 复位（两 picker 开框归零）；他组零动）。
   *  返回 `setSettings` 补丁。 */
  function resetFacets(state, group) {
    if (group === "providers") {
      const providers = state.settings?.providers ?? {}
      return { providers: { ...providers, edit: null, probe: null, draft: null, keyDraft: null, ctxEdit: null, ctxDraft: null } }
    }
    if (group === ADD_MODAL_GROUP) {
      const providers = state.settings?.providers ?? {}
      return { providers: { ...providers, addShape: "preset", probe: null, draft: null } }
    }
    if (group === "mcp") {
      const mcp = state.settings?.mcp ?? {}
      return { mcp: { ...mcp, form: null } }
    }
    if (group === MCP_FORM_MODAL_GROUP) {
      const mcp = state.settings?.mcp ?? {}
      return { mcp: { ...mcp, form: null } }
    }
    if (group === CONSULT_ADD_MODAL_GROUP) {
      const models = state.settings?.models ?? {}
      return { models: { ...models, picker: { provider: "", rows: [], model: null } } }
    }
    return {}
  }

  /** 设置面开（**现役入口 = 输入区控件行第 7 钮**（经句柄面转口 `renderer/mount-composer.mjs`）+ `renderer/composer-wire.mjs` footer 三出口映射 —— 原「信息行」入口随会话模型轮 R13 已裁撤，本行收正）：开 + 失败串清位 ⇒ 七段读数随动（段态 `none` → `loading` → `ready`）。
   *  S1 ∕ S2：渠道段面态复位（钥编辑态 ∕ 探果 ∕ 暂存值 ∕ 失败草稿〔#615②〕——**钥暂存不跨面驻留**）；S8：MCP 编辑态复位（`form`）——本组复位原语 = `resetFacets`。 */
  function openSettings() {
    const state = store.get()
    setSettings({ open: true, notice: null, modelParams: { open: false, id: null, spec: null }, ...resetFacets(state, "providers"), ...resetFacets(state, "mcp") })
    void loadProviders()
    void loadAgent()
    void loadMcp()
    void loadEnv()
    void loadTools()
    void loadUsage()
  }

  /** 设置面关（退场 = 零子节点 —— 订阅面重绘清容器）：同清确认弹层（S6 —— 弹层挂 `document.body`，
   *  不在容器内 ⇒ 关面须显式清；先例 = VSC `closeSettings` 同清）+ 渠道段面态复位（S1 ∕ S2 —— 含失败草稿 `keyDraft`〔#615②〕）+ MCP 编辑态复位（S8）；
   *  **D39 同拍清 `modal`**（组弹窗随关 —— 页 ∥ 弹窗不并存于关态）。 */
  function closeSettings() {
    closeSettingsConfirm()
    const state = store.get()
    setSettings({ open: false, notice: null, modal: null, modelParams: { open: false, id: null, spec: null }, ...resetFacets(state, "providers"), ...resetFacets(state, "mcp") })
  }

  /** 设置面出口族（锚名逐字 = 视图 `data-action` 同域；具名控件面 = 单键同路；段族 **33** 项（`segments` 9 ∥ `modelSegments` 10 ∥
   *  `mcpSegments` 12 ∥ `agentSegments` 2）经四族合并 + 渠道面 **7** 项经 `providerSegments` 合并 + **添加弹窗开径 1 项**
   *  （`onAddProvider` —— KD-75 ②；`openModal` 缺 ⇒ 本键不注册，钮面 `wire` 落 `disabled`；KD-77 ①②两入口开径同律，
   *  住两段族内 —— 上计数已含）—— 五档出口族工厂）。 */
  const handlers = {
    ...segments.handlers,
    ...modelSegments.handlers,
    ...mcpSegments.handlers,
    ...providerSegments.handlers,
    ...agentSegments.handlers,
    // 期档切换（2026-10-06 二轮 —— 9Router 同形）：切片先落（tab active 态随重绘即达）+ force 重读
    //（聚合在主进程单源 —— byModel ∕ 24h 滚动窗不可由客户端 byDay 推导）。loadUsage 自持 loading 态。
    // 快捷键段搜索词（只读参考页 · 2026-10-12）：查询态住设置切片 ⇒ 段体随重绘过滤（伪段零数据面）
    onShortcutQuery: (value) => {
      setSettings({ shortcuts: { ...store.get().settings?.shortcuts, query: String(value ?? "") } })
    },
    onSelectPeriod: (period) => {
      setSettings({ usage: { ...store.get().settings?.usage, period } })
      void loadUsage({ force: true, period })
    },
    onRefreshUsage: () => void loadUsage({ force: true }),
    ...(openModal === null ? {} : { onAddProvider: () => { openModal(ADD_MODAL_GROUP) } }),
    onToggleLang: (target) => void toggleLang(target),
    onSetTheme: (target) => setThemeFace(target),
    onSetAccent: (id) => setAccentFace(id),
    // 自定义取色两段出口（views/settings.mjs input[type=color]）：**input = 预览段** —— 只落 `documentElement` +
    // localStorage（`setCustomAccent`），**零 store 写**（SETTINGS_KEYS 含 accent ⇒ store 写即设置面重绘 ⇒
    // 重绘销毁 input 节点 ⇒ 原生取色弹层失锚即关 —— 用户「点一下就退出 ∕ 没法试色」根因）；
    // **change ∕ cancel = 提交段**（弹层已收口）⇒ 补 store 切片 ⇒ 色板 active 态随重绘；cancel 值 = 打开时原值 ⇒ 语义 = 还原。
    onSetCustomAccent: (hex) => {
      if (typeof hex !== "string" || !hex.startsWith("#")) return
      setCustomAccent(hex)
    },
    onCommitCustomAccent: (hex) => {
      if (typeof hex !== "string" || !hex.startsWith("#")) return
      const landed = setCustomAccent(hex)
      if (landed === null) return
      store.set({ accent: landed })
    },
    onCloseSettings: () => closeSettings(),
    // 用量段懒加载（Token 用量统计批 · 2026-10-06）：选中段即触发（loadUsage 自持切片幂等门 ——
    // 有 stats 不重读；刷新钮走 `onRefreshUsage` force 形）。
    onSelectSection: (name) => {
      setSettings({ nav: name })
      if (name === "usage") void loadUsage()
    },
    // 「编辑模型配置」弹窗（2026-10-10 · 模型参数能力批）：开 = 模型行铅笔钮；关 = ✕ ∕ 背板 ∕ 卡内 Esc 三关同引；
    // 保存 ∕ 重置 = 写 `modelOverrides`（弹窗保持开 —— 可连续改）。
    onEditModel: (id) => openModelParams(id),
    onCloseModelParams: () => closeModelParams(),
    onSaveModelSpec: (event) => void saveModelSpec(event),
    onResetModelSpec: () => void resetModelSpec(),
    // 档位快填（三处档位 select 共用 —— 见 `pickTier` 注）
    onPickTier: (event) => pickTier(event),
    onSubmit: (event) => void submitChannel(event),
    onSubmit: (event) => submitChannel(event), // 值贯链：向导「保存并继续」消费（KD-79 ②③）；点击径忽略返回值（零变）
    onVerify: (name) => void verifyChannel(name),
    onRemoveProvider: (name) => void removeProvider(name),
    onUseModel: (provider, name) => void useModel(provider, name),
    /** 自定义模型 ID 采用（2026-10-05 —— 网关列表外模型入口）：现读输入值（`data-draft="custom-model"` ——
     *  草稿面持久）+ 活跃渠道（`model.provider` 切片）⇒ 复用 `useModel` 单一实现（写 `defaultModel` 复合串）。
     *  值空 ∕ 无活跃渠道 ⇒ 零动作（钮态已 disabled —— 双保险）。 */
    onUseCustomModel: () => {
      const input = document.querySelector('[data-draft="custom-model"]')
      const id = typeof input?.value === "string" ? input.value.trim() : ""
      const provider = store.get().settings?.model?.provider
      if (id === "" || typeof provider !== "string" || provider === "") return
      void useModel(provider, id)
    },
  }

  /** Esc 关闭（F-Esc —— 一律经既有 `closeSettings` 出口，单一实现；向导态不在本项）：**绑定宿主 = `document`**（面板为窗口级覆盖层
   *  ⇒ 绑面板节点收不到本键）；闸取**现刻**态（开 ∧ 非向导占槽 ∧ **组弹窗不在场**——弹窗体自持卡内 Esc〔`stopPropagation`〕，
   *  本闸零连带；D39 ∥ KD-68 ⑥）；宿主无 `addEventListener` 面 ⇒ 零绑定。 */
  if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
    document.addEventListener("keydown", (event) => {
      if (event?.key !== "Escape") return
      const state = store.get()
      if (state?.settings?.open !== true || occupies(state)) return
      if (state?.settings?.modal != null) return // 弹窗在场 ⇒ 页保持开（D39 ∥ KD-68 ⑥——卡内 Esc 自持）
      if (state?.settings?.modelParams?.open === true) return // 模型配置弹窗在场 ⇒ 同上（卡内 Esc 自持）
      closeSettings()
    })
  }

  return { handlers, openSettings, closeSettings, resetFacets }
}
