/**
 * config.mjs — configuration loading and saving
 * Model-merge schema v2 (2026-09-10 MODEL-SELECTION; 2026-10-09 清除批：渠道单值模型退场):
 * providers[] carry NO channel default model (`providers[].model` retired — 渠道不是模型选择
 * 单位); the candidates list field models[] is gone — the available-model list is fetched from
 * the provider at runtime (`GET /models`, PROVIDER.md §16). config.defaultModel (top level,
 * "provider:model" composite) is the new-session starting point; activeProvider/activeModel
 * are gone from config (session slots keep their own double fields). Legacy fields migrate
 * on load (write-back failure never blocks startup).
 * Config file: ~/.thincoder/config.json
 * API key comes from providers[].apiKey only — environment variables are not a key source.
 */

import { existsSync, readFileSync } from "node:fs"
import { parseModelRef, resolveChannelModel, resolveProviderPlan, resolveRuntimeProvider, defaultModelReason } from "./model-ref.mjs"
// 老形态迁移核（M7 v2——纯函数零依赖——本文件超 500 行硬限拆分，VSC 同构文件）
import { migrateLegacyModelFields, resolveWorkMode } from "./config-migrate.mjs"
import { expandHome } from "./expand-home.mjs"
// 核内单一读写面 + 预设表（§2.5 #129 / #131——拆档以容纳 500 行硬限）
import {
  PROVIDER_PRESETS, presetToEntry, configDir, configPath, _setConfigPathForTest, _resetConfigPathForTest,
  _configPath, writeConfigAtomic,
} from "./config-io.mjs"

export { parseModelRef, resolveChannelModel, resolveProviderPlan, resolveRuntimeProvider, defaultModelReason, migrateLegacyModelFields }
export { WORK_MODES, resolveWorkMode, resolveSessionWorkMode, setConfigWorkMode } from "./config-migrate.mjs"
export { PROVIDER_PRESETS, presetToEntry, configDir, configPath, _setConfigPathForTest, _resetConfigPathForTest }
// 核内单一写盘执行体（已迁 `config-io.mjs`）——本档 re-export 保持既有导入面（§2.5 #131）。
export { writeConfigAtomic }

function cfgPath() { return _configPath() }

// 配置默认值表本体已迁 `config-defaults.mjs`（CONTEXT-COMPACTION.md §6.16.9 —— C1：默认值数据 /
// 加载期归一逻辑 / 请求预算算式三件分家）；本档 re-export 保持既有导入面（34 档零改）。
import { DEFAULTS } from "./config-defaults.mjs"
export { DEFAULTS }

// Model capability table + spec lookup live in model-specs.mjs (2026-08-31
// extract — config.mjs had grown past the 300-line advisory). Re-exported here
// so the 23 existing importers keep their import paths.
import { specForModel, providerSpec, providerSpecResolution, specMatch, formatContextK, assistantToolCallMessage, setModelOverrides, getModelOverrides, effortDefaultFor, overrideKeyFor } from "./model-specs.mjs"
export { specForModel, providerSpec, providerSpecResolution, specMatch, formatContextK, assistantToolCallMessage, setModelOverrides, getModelOverrides, effortDefaultFor, overrideKeyFor }
// 上下文解析链的取值校验单点（PROVIDER.md §6.15）：装载归一与读面共用一个谓词。
import { positiveInt, warnContextOnce } from "./model-context.mjs"


// 预算族（`outputReserve` ∥ `usableWindow` ∥ `requestBudget` ∥ `policyBudget` ∥ `effectiveWindow` ∥
// `resolveCompactThreshold` ∥ `INJECT_HEADROOM_TOKENS` ∥ `RETAIN_CAP_TOKENS`）居 `window-policy.mjs`——`CONTEXT-COMPACTION.md` §2.1 ∥
// §2.2 把「窗口事实」与「窗口策略」两件事分开，本档越 500 行硬限按设计给的候选线抽出；以下 re-export
// 保既有导入面（同 `model-specs.mjs` 拆分形态）。`resolveCompactThreshold` 在本档装载期自用
// （auto 档派生 `compactThresholdResolved`——按本会话档位现算，tiny 档随之落在有效窗口上），故先 import 再转口。
import { resolveCompactThreshold } from "./window-policy.mjs"
export {
  TINY_WINDOW_CAP, INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS, effectiveWindow, outputReserve, usableWindow, requestBudget, policyBudget, resolveCompactThreshold,
} from "./window-policy.mjs"

/**
 * Bailian (阿里云百炼) host check — enable_thinking is a Bailian-only extension parameter;
 * sending it to other endpoints (kimi/glm/custom proxies) would pollute the request.
 */
export function isBailianHost(baseURL) {
  return typeof baseURL === "string"
    && (baseURL.includes("dashscope.aliyuncs.com") || baseURL.includes(".maas.aliyuncs.com"))
}

/**
 * Resolve the Bailian `enable_thinking` switch for qwen hybrid-thinking models (`docs/core/design/PROVIDER.md` §6.12).
 * qwen3.x on Bailian defaults to thinking ON, so an explicit off must send enable_thinking:false
 * or the server silently keeps thinking. Whitelist: model name starts with "qwen" (excluding the
 * non-thinking qwen3-coder line) AND the provider points at a Bailian host.
 *   provider.thinking === null → false     (explicit off: /think off, panel off — NF1 convention)
 *   provider.reasoningEffort   → true      (effort tier implies thinking on; rides with reasoning_effort)
 *   otherwise                  → undefined (field omitted — server default stays, no behavior change)
 * NOTE: spec carries no model field today — the name comes from provider.model (spec?.model is
 * a forward-compatible fallback). 非串 model（脏载 / 手工档）归一等价空串（未登记 ⇒ undefined）——
 * 本函数恒 total、不因类型脏载抛（#638 查表族同归一）。
 */
export function resolveEnableThinking(provider, spec) {
  const raw = provider?.model ?? spec?.model ?? ""
  const model = (typeof raw === "string" ? raw : "").toLowerCase()
  if (!model.startsWith("qwen") || model.startsWith("qwen3-coder")) return undefined
  if (!isBailianHost(provider?.baseURL)) return undefined
  // 一致性分支（#1659）：effort 档位有值且非 "none" ⇒ effort 赢（thinking on）。
  // 百炼约束：enable_thinking:false 时 reasoning_effort 必须为 "none"，互斥即 400。
  // 压缩下行（context.mjs 的 compressIfNeeded）显式 thinking:null 但继承 effort（v3 同源裁定）——
  // 无此分支则发出 {enable_thinking:false, reasoning_effort:"medium"} ⇒ 400 ⇒ 压缩三连败。
  if (provider.reasoningEffort && provider.reasoningEffort !== "none") return true
  if (provider.thinking === null) return false
  if (provider.reasoningEffort) return true
  return undefined
}

// 加载期归一 / 清洗纯函数族已迁 `config-normalize.mjs`（§6.16.9 —— C1）——四个公共函数经本档
// re-export 保持既有导入面；其余六个（sanitizeProviderHeaders ∥ sanitizeConsultModels ∥
// isUsableProviderEntry ∥ providerDropReason ∥ 两枚一次性警告旗）只由 loadConfig 消费
// （`reloadProviders` 经 loadConfig 共用同一次判定，本档只转交，不另调）。
import {
  sanitizeConsultModels, warnConsultModelsFiltered, sanitizeSubagentModel, sanitizeSubagentModels,
  warnSubagentModelsFiltered, sanitizeProviderHeaders, normalizeProxy, normalizeTeamSection, isUsableProviderEntry, providerDropReason,
} from "./config-normalize.mjs"
export { sanitizeSubagentModel, sanitizeSubagentModels, normalizeProxy, normalizeTeamSection }

/** Module-level one-time warn dedupe for invalid providers[].context (PROVIDER.md §15 D-C1). */
const warnedContextProviders = new Set()

/**
 * Find provider by name in providers[].
 * Throws if name is non-empty but not found — a typo in the caller-supplied name (e.g. `defaultModel`) silently falling to the first provider would use the wrong key on the wrong endpoint.
 * Returns the first provider when name is empty.
 */
export function findProvider(providers, name) {
  if (name) {
    const found = providers.find((p) => p.name === name)
    if (found) return found
    const available = providers.map((p) => p.name).join(", ") || "(empty)"
    throw new Error(`provider "${name}" not in providers list (available: ${available}); check for a typo in: ${configPath}`)
  }
  return providers[0] ?? { name: "default", baseURL: "" }
}

/**
 * Promote `agent.advisor` into the runtime view `config.advisor`（decoupled copy——`{ ...config.advisor,
 * ...config.agent.advisor }`）。单一规则：`loadConfig` 装载期与 `settings set` 写面共用（`SETTINGS-TOOL.md` §2.3）。
 * 只住运行面的会话级键（如 `advisor.guard`——`cmd-advisor.mjs` 只写 promoted）在合并中保留；
 * promoted 是副本而不自动跟随 nested，所以每个写点都得同步（`AGENT-PARAMS.md` §2 写面不变式）。
 */
export function promoteAgentViews(config) {
  const nested = config.agent?.advisor
  // 非对象段（手写 config.json 的畸形值）不展开——字符串 spread 会产出 0/1/2 垃圾键；
  // 读面本身对非法值「一律回退默认」（AGENT-PARAMS.md §2 / D-P3）
  config.advisor = { ...config.advisor, ...(nested !== null && typeof nested === "object" && !Array.isArray(nested) ? nested : {}) }
  return config
}

/**
 * 丢弃记录一句一条（`docs/core/design/PROVIDER.md` §6.29「丢弃要看得见」）：`providers[18]: null`。
 * 只有盘上下标 + 原因闭集四值之一——**绝不带条目内容**：载体是数据层，会进日志 ∥ 报错 ∥ 调试输出，
 * 一条「有 apiKey 却缺 name」的条目若取 JSON，`sk-…` 就原样写进不需要它的地方。原因由
 * `providerDropReason`（`thincoder-core/config-normalize.mjs`）给出——与准入判据同源，同一条目不会
 * 在这里和装载分支各判出一种说法；下标让用户能找到要改的那一条。
 */
function providerDropLine(index, reason) {
  return `providers[${index}]: ${reason}`
}

/**
 * Load configuration.
 * No env-var overrides — config.json is the single source of truth
 * (API keys, baseURL, defaultModel all come from the file).
 * loadConfig 内联迁移核已迁 config-migrate.mjs（500 行硬限拆分——VSC 同构）——
 * migrateLegacyModelFields 纯函数 + 本文件 import/写回编排（折中 C 见其头注释）。
 */
export function loadConfig() {
  let config = {}
  const path = cfgPath()
  if (existsSync(path)) {
    try {
      config = JSON.parse(readFileSync(path, "utf8"))
    } catch (error) {
      throw new Error(`Config file is not valid JSON, check or delete it: ${path}\n  ${error.message}`, { cause: error })
    }
  }

  // ── 迁移（M7 v2）：检测老字段（models[] / active* / 垃圾值）→ 内存迁移态先行；写回失败绝不阻断（下次 load 重试——幂等）──
  if (migrateLegacyModelFields(config)) {
    try {
      const r = writeConfigAtomic(path, migrateLegacyModelFields) // 磁盘 fresh raw 同变换
      if (r.ok === false) console.warn(`[config] migration write-back skipped (${r.reason}) — memory state continues, retried on next load`)
    } catch (e) {
      console.warn(`[config] migration write-back failed — memory state continues, retried on next load: ${e.message}`)
    }
  }

  // 渠道条目准入过滤（`docs/core/design/PROVIDER.md` §6.29）：无名条目不进使用面——`name` 是渠道
  // 唯一句柄（findProvider ∥ parseModelRef ∥ 会话槽 ∥ 选择器全按 name 匹配），无名条目既不可寻址
  // 也不可被发送，留着只会让读它的地方失真：`/model` 的 `${p.name.padEnd(12)}` 直接抛
  // `Cannot read properties of undefined (reading 'padEnd')`，19 个正常渠道被 1 条空条目连累。
  // 过滤在整表别名 `merged.providersList = merged.providers` **之前**：别名之后没有第二个汇聚点，
  // 漏一处就留一条不可寻址的条目在运行面。判据单源 = `isUsableProviderEntry`（装载 ∥ 重读共用）。
  // 盘面处置 = 不重写被丢弃的那条（同节「零写盘」：它可能携用户已填的 apiKey ∥ baseURL）。
  // 丢弃记录只写盘上下标 + 原因闭集（条目内容不进载体——载体是数据层，会进日志与调试输出）。
  const droppedProviders = []
  const providers = Array.isArray(config.providers)
    ? config.providers.flatMap((p, index) => {
      if (isUsableProviderEntry(p)) return [sanitizeProviderHeaders({ ...p })]
      droppedProviders.push(providerDropLine(index, providerDropReason(p)))
      return []
    })
    : []

  const merged = {
    ...DEFAULTS,
    ...config,
    defaultModel: typeof config.defaultModel === "string" && config.defaultModel.trim() ? config.defaultModel : null,
    providers,
    agent: { ...DEFAULTS.agent, ...config.agent },
    memory: { ...DEFAULTS.memory, ...config.memory },
    embedding: { ...DEFAULTS.embedding, ...config.embedding },
    browser: { ...DEFAULTS.browser, ...config.browser },
    traces: { ...DEFAULTS.traces, ...config.traces },
    diagnostics: { ...DEFAULTS.diagnostics },
  }

  // Work mode is normalized from the raw input: a valid mode wins; legacy engineering is read
  // only when mode is absent. The old boolean remains a derived runtime view, never a second authority.
  merged.agent.mode = resolveWorkMode(config.agent)
  merged.agent.engineering = merged.agent.mode === "engineering"

  // 丢弃要看得见（同节「丢弃要看得见 · 数据面载体」）：载体只在有丢弃时有值（无丢弃 ⇒ undefined，
  // 与 `[]` 同义）。一条一句挂数据层；出词归消费面——本批唯一消费方 = `/model` L1 列表首行
  // （`thincoder-cli/src/tui/provider-entries.mjs`），故不走 console。无条件写一次：载体是派生值，
  // 而 `merged` 先摊平了盘上原文（`...config`），条件赋值会把盘上手写的同名键原样放进数据层。
  merged.providersDropped = droppedProviders.length ? droppedProviders : undefined

  // 家目录展开（第 29 批）：config 路径字段单一规范化点——只读归一（磁盘原文保留）
  merged.memory.dbPath = expandHome(merged.memory.dbPath)
  merged.memory.projectDir = expandHome(merged.memory.projectDir)
  const team = merged.memory.team
  if (team && typeof team === "object" && !Array.isArray(team) && team.dir !== undefined) {
    merged.memory.team = { ...team, dir: expandHome(team.dir) }   // 无 dir 键不注入（零键面变化）
  }
  merged.shell = expandHome(merged.shell)

  // diagnostics（① 配置键，CONFIG.md §6.2 名录）：两键只认布尔值——非法 / 缺失回退默认（不 throw）
  const _diagRaw = config.diagnostics && typeof config.diagnostics === "object" && !Array.isArray(config.diagnostics) ? config.diagnostics : {}
  for (const key of ["heapWatch", "heapSnapshot"]) if (typeof _diagRaw[key] === "boolean") merged.diagnostics[key] = _diagRaw[key]

  // providers[].model 一律删除（2026-10-09 清除批——渠道单值模型退场：渠道不携模型，不落任何
  // 回退；模型身份唯二 = 顶层 defaultModel 复合串 ∥ 会话槽选定——PROVIDER.md §6.16 M3）。
  for (const p of merged.providers) {
    if (p.model !== undefined) delete p.model
  }

  // providers[].context (K units, PROVIDER.md §15 D-C1): positive integer only — invalid
  // values (0/negative/non-numeric) are IGNORED (spec value applies) with a ONE-TIME warn
  // per provider name (module-level dedupe, same precedent as warnedModels in model-specs.mjs).
  for (const p of merged.providers) {
    if (p.context === undefined) continue
    if (Number.isInteger(Number(p.context)) && Number(p.context) > 0) { p.context = Number(p.context); continue } // 数字字符串（"128"）归一为数字——两端语义统一（code review #1）
    if (!warnedContextProviders.has(p.name ?? "(unnamed)")) {
      warnedContextProviders.add(p.name ?? "(unnamed)")
      console.warn(`[config] provider "${p.name}" context must be a positive integer in K units (e.g. 128 = 128K) — got ${JSON.stringify(p.context)} — ignored, using the model spec value`)
    }
    delete p.context
  }

  // modelOverrides（2026-10-10 · fork 模型参数批）：模型级规格覆写——装载期注册进核查表（模块级单写者；
  // `specForModel` 无 config 入参 ⇒ 注册式装配，先例 = model-specs.mjs 的 warnedModels Set ∕ theme.mjs）。
  // 清洗在 `setModelOverrides` 内（可覆写叶白名单 + 逐叶类型判据，非法条目丢弃 + 一次性警告——同上方
  // providers[].context 清洗先例，绝不 throw）。**必须早于下方 compactThresholdResolved 派生**（该处经
  // providerSpec → specForModel 消费覆写值）。合并值挂 merged.modelOverrides 供端侧读面（设置页表单回填）。
  merged.modelOverrides = setModelOverrides(merged.modelOverrides)

  // providers[].modelContext（按模型的人工声明，K 单位——PROVIDER.md §6.15）：值只收正整数，
  // 非法（0 / 负 / 非数 / 非整 / 布尔 / 数字字符串）⇒ 该键视为未声明（落 L2）+ 装载期告警一次
  // （P-13）。数字字符串**不归一**（不同于旧键 context）：写面先 parse 再落盘，文件里的字符串是
  // 手改/笔误，静默转数会把「想写哪个单位」藏起来（旧键两起 ×1024 事故的根因）。
  // 读面（manualContextK）仍逐次防御——装载归一不产新键，只清内存镜像（磁盘原文零变）。
  for (const p of merged.providers) {
    if (p.modelContext === undefined) continue
    const rawMC = p.modelContext
    if (!rawMC || typeof rawMC !== "object" || Array.isArray(rawMC)) {
      warnContextOnce(`modelContext-shape\0${p.name ?? ""}`,
        `[config] provider "${p.name}" modelContext must be an object of model ID → positive integer K (e.g. 128 = 128K) — got ${JSON.stringify(rawMC)} — ignored`)
      delete p.modelContext
      continue
    }
    p.modelContext = { ...rawMC }
    for (const [key, value] of Object.entries(p.modelContext)) {
      if (positiveInt(value) !== null) continue
      warnContextOnce(`modelContext-invalid\0${p.name ?? ""}\0${key}`,
        `[config] provider "${p.name}" modelContext["${key}"] must be a positive integer in K units (e.g. 128 = 128K) — got ${JSON.stringify(value)} — ignored, falling through to the provider context / list / model spec value`)
      delete p.modelContext[key]
    }
    if (Object.keys(p.modelContext).length === 0) delete p.modelContext // 不留空对象
  }

  // F-4 (IKCDMR) consultModels 软失败化——D-S1 范式（defaultModel 无效同族）：非法条目
  // 过滤不 throw（去 startup brick——无修复入口的硬崩消）；一次性启动警告内嵌修复指引
  // （引导清条目载体——保留 discoverability）；过滤记录挂 merged.agent.consultModelsFiltered
  // （数据层——consumer-ready——首帧 UI 消费点同 D-S1 promptProviderIfInvalid 属后续批）。
  // VSC loadAgentSettings 同规则（共享 config——双端锁步）。
  const cmClean = sanitizeConsultModels(merged.agent.consultModels, merged.providers.map((p) => p.name))
  warnConsultModelsFiltered(cmClean.dropped, path)
  merged.agent.consultModels = cmClean.keep
  if (cmClean.dropped.length) merged.agent.consultModelsFiltered = cmClean.dropped

  const smClean = sanitizeSubagentModel(merged.agent.subagentModel), smsClean = sanitizeSubagentModels(merged.agent.subagentModels) // #861（§6.7.1）：加载期清洗——非法形态不采纳 + 一次性警告（不 throw——同 F-4 范式）
  warnSubagentModelsFiltered([...smClean.dropped, ...smsClean.dropped], path)
  merged.agent.subagentModel = smClean.value
  merged.agent.subagentModels = smsClean.value

  // Backward compatibility: promote root-level config fields to agent sub-object
  if (config.verifyGuard !== undefined) {
    merged.agent.verifyGuard = config.verifyGuard
  }

  // Normalize baseURL trailing slash (prevents //chat/completions)
  for (const p of merged.providers) {
    if (p.baseURL) p.baseURL = p.baseURL.replace(/\/+$/, "")
  }

  // Normalize proxy: string → { uri, web:true }; object 补默认值；非法类型丢弃。
  // 保证 agent.config.proxy 永远是规范形态或 undefined
  merged.proxy = normalizeProxy(merged.proxy)

  // 团队登录段（B1 批——TEAM.md §2.1）：加载归一（形不符 ⇒ null——软失败不阻启动）；不入 DEFAULTS
  merged.team = normalizeTeamSection(merged.team)

  // Runtime provider = 统一解析（#841——resolveProviderPlan 单源：回退序 + 三态；PROVIDER.md §6.22）。
  // 不可运行（渠表空 ∥ 全表无 key）⇒ {} + providerInvalidReason（D-S1 处置不 throw——make-agent 打
  // _providerInvalid 标记 → TUI 首帧弹选择 / headless 报可读错误；同 2026-09-02 Q1 语义——不复用
  // findProvider throw 契约——findProvider 保留给 advisor/run.mjs 等直接调用方）。
  const plan = resolveProviderPlan({ providers: merged.providers, defaultModel: merged.defaultModel })
  merged.provider = plan.provider
  merged.providerState = plan.state // ok ∥ fallback ∥ invalid（三值闭集——KD-841-3 config 级）
  merged.providerStateReason = plan.reason // state≠ok 时非空（语义源；消费者按 state 出词——禁串嗅探）
  // providerInvalidReason 语义不变（provider 不完整时非空——装配校验 validateProvider 消费面照旧）
  merged.providerInvalidReason = merged.provider.name
    ? null
    : plan.reason ?? defaultModelReason(merged.providers, merged.defaultModel)

  // Compaction threshold 三档落值（CONTEXT-COMPACTION.md §6.17）：数值在场 = 显式（原样，不猜来源）；
  // 不在场 = auto——派生值只进 compactThresholdResolved，永不写 agent.compactThreshold、不落盘。
  const explicitThreshold = config.agent?.compactThreshold
  if (explicitThreshold != null) {
    merged.agent.compactThreshold = explicitThreshold
    merged.agent.compactThresholdResolved = explicitThreshold
    merged.agent.compactThresholdAuto = false
  } else {
    merged.agent.compactThreshold = undefined
    merged.agent.compactThresholdResolved = resolveCompactThreshold(null, merged.provider, merged.agent.mode).value
    merged.agent.compactThresholdAuto = true
  }

  // Write back to merged for convenient access by upper layers
  // fetch 超时可配置（2026-09-01：agent.fetchTimeoutMs——provider/core.mjs effectiveFetchTimeoutMs 消费）
  merged.provider.fetchTimeoutMs = Number.isFinite(merged.agent?.fetchTimeoutMs) && merged.agent.fetchTimeoutMs > 0
    ? merged.agent.fetchTimeoutMs : undefined
  // body 阶段空闲超时同形提升（TIMEOUT-DIGEST.md §2.1 —— provider/core.mjs effectiveBodyIdleMs 消费）：
  // 非法 ∥ 缺省 ⇒ undefined ⇒ 回退 DEFAULT_BODY_IDLE_MS（不静默禁用保护）
  merged.provider.bodyIdleTimeoutMs = Number.isFinite(merged.agent?.bodyIdleTimeoutMs) && merged.agent.bodyIdleTimeoutMs > 0
    ? merged.agent.bodyIdleTimeoutMs : undefined
  merged.providersList = merged.providers
  promoteAgentViews(merged)  // agent.advisor → advisor promote for consistent access (decoupled copy)

  return merged
}

// 运行中重读盘上渠道表本体居 `config-reload.mjs`（`docs/core/design/PROVIDER.md` §6.30）——本档已过
// 500 行后按设计指的候选线抽出，以下 re-export 保持既有导入面（同 config-io.mjs 拆分形态）。
export { reloadProviders } from "./config-reload.mjs"

/**
 * MCP.md §5 D-3 (2026-09-01): re-read config.json and replace ONLY the agent's mcp section
 * — the agent 代配 closed loop (agent edits config.json with its edit tool, /mcp picks it
 * up). Never touches other config sections (providers/defaultModel stay as loaded).
 *
 * Malformed disk config → memory state kept, { ok:false, error } returned (the /mcp menu
 * shows "⚠ disk config unreadable"). Never throws.
 *
 * 对账 (reconciliation, MCP.md §5 D-3 / T23): returns which disk servers CHANGED
 * (fingerprint differs) or are DELETED from disk while still connected — fingerprint =
 * endpoint + token + headers/env key order. Existing connections are NOT torn down (an
 * in-use server must not be dropped): a deleted-but-connected server KEEPS its memory
 * entry (appended after the disk list) so the /mcp list can still show the row with the
 * "⚠ disk changed" mark. A server that is merely NEW on disk is not drift. persistRaw
 * write + reload is idempotent (fingerprints equal → no drift mark).
 *
 * @param path optional config path override (tests inject a tmp file; default configPath)
 */
export function reloadMcpFromDisk(agent, path) {
  const memoryServers = Array.isArray(agent.config?.mcp?.servers) ? agent.config.mcp.servers : []
  const fileExists = existsSync(path ?? configPath)
  const diskMcp = readMcpSection(path)
  if (!diskMcp.ok) return { ok: false, error: diskMcp.error, changedNames: [] }
  // Missing/deleted config file → keep whichever mcp servers the session had (never
  // silently drop user servers because the file vanished — same memory-keeps policy
  // as the malformed-disk fallback).
  let diskServers = diskMcp.servers
  if (diskServers.length === 0 && !fileExists) diskServers = memoryServers
  // Drift vs the RAW disk list: fingerprint-changed or deleted-from-disk (T23 ⚠ 标记依据)
  const diskNames = new Set(diskServers.filter((s) => s?.name).map((s) => s.name))
  const changedNames = diffMcpServers(memoryServers, diskServers)
  // Connected servers deleted from disk stay in the list (memory copy) — T23: the row
  // must remain visible (marked ⚠) and its live connection untouched. They are already
  // in changedNames (absent from disk), and stay flagged on every reload until the user
  // reconnects (re-persists them) or removes them — real drift, honestly reported.
  const connectedNames = new Set((agent.tools ?? []).filter((t) => t?._mcpName).map((t) => t._mcpName))
  const keptConnected = memoryServers.filter((s) => s?.name && connectedNames.has(s.name) && !diskNames.has(s.name))
  const finalServers = [...diskServers, ...keptConnected]
  agent.config ??= {}
  agent.config.mcp = { ...agent.config.mcp, servers: finalServers }
  return { ok: true, servers: finalServers, changedNames }
}

/** Disk read behind reloadMcpFromDisk — bounded, never throws. */
function readMcpSection(path = configPath) {
  try {
    if (!existsSync(path)) return { ok: true, servers: [] }
    const raw = JSON.parse(readFileSync(path, "utf8"))
    const servers = raw?.mcp?.servers
    // 非数组 = 畸形磁盘配置（2.3 代码正确性批）——ok:false 走调用方既有畸形回退（reloadMcpFromDisk 早退）
    if (servers !== undefined && !Array.isArray(servers)) return { ok: false, error: "mcp.servers must be an array" }
    return { ok: true, servers: Array.isArray(servers) ? servers : [] }
  } catch (error) {
    return { ok: false, error: error?.message ?? String(error) }
  }
}

/** Fingerprint = endpoint + token + headers/env entries in key order (JSON.stringify
 *  of a normalized subset — key order included, matching connectMcpServer's
 *  configFingerprint semantics: any change the connect layer would see counts).
 *  Drift = CHANGED (fingerprint differs) or DELETED (missing from disk) — a server
 *  that is new on disk is not drift (no live connection to protect). */
function diffMcpServers(memoryServers, diskServers) {
  const memFp = new Map(memoryServers.filter((s) => s?.name).map((s) => [s.name, mcpFingerprint(s)]))
  const diskFp = new Map(diskServers.filter((s) => s?.name).map((s) => [s.name, mcpFingerprint(s)]))
  const changed = []
  for (const [name, fp] of diskFp) if (memFp.has(name) && memFp.get(name) !== fp) changed.push(name)
  for (const name of memFp.keys()) if (!diskFp.has(name)) changed.push(name)
  return changed
}

function mcpFingerprint(s) {
  return JSON.stringify([
    s.wsUrl ?? s.url ?? s.command ?? null,
    s.args ?? null,
    s.token ?? null,
    s.headers ?? null,
    s.env ?? null,
  ])
}
