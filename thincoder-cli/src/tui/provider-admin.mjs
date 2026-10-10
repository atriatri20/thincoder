/**
 * provider-admin.mjs — 渠道管理四流 + 级联清理出档（structure-split-2 · 2026-09-29）：自
 * `model-picker.mjs` 迁出〔原 `:309-471`（probeChannelFlow ∥ addProviderFlow ∥ removeProviderFlow ∥
 * setKeyFlow ∥ setProviderKey ∥ setContextFlow）+ `:476-499`（cascadeRemoveProvider）〕——
 * 结构拆分零语义（面不变 ∕ 判据不变，只换宿主档）；切点 ∕ 缝单源 = 批档
 * `docs/batches/2026-09-29-structure-split-2.md` §2.2-A。
 *
 * 装配 = `createProviderAdmin(ctx)`（ctx = `{ agent, showPicker, askQuestion, pushLine, persistRaw,
 * maskKey, confirmDelete, C, fmtContextK, defaultModelLabel }`——后两名 = 主档纯 helper，ctx 注入
 * 同 `maskKey` 先例）→ `{ addProviderFlow, removeProviderFlow, setKeyFlow, setProviderKey, setContextFlow,
 * setModelParamsFlow }`；`cascadeRemoveProvider` 模块级导出（宿主 `model-picker.mjs` 尾同名再出口——
 * 历史导出面零改）。零环：本档不 import 主档（宿主 → 本档单向）。
 * 语义（迁出原文照录）：四流 = provider 级 config 写——M9 配置阶段准入探一次 `/models`（不阻断保存）
 * ∥ F-4 (IKCDMR)：removeProviderFlow 级联清理悬挂引用（consultModels ∕ subagentModels ∕ advisor.provider）。
 */
import { PROVIDER_PRESETS as PRESETS, providerSpec, specMatch, effortDefaultFor, overrideKeyFor, getModelOverrides, setModelOverrides } from "@thincoder/core/config.mjs"
import { probeChannelModels, getProviderModels } from "./model-catalog.mjs"

/** 常见档位提示串（**仅提示文本** —— 用户「还得看多少位数」；CLI 是行编辑，无 `datalist` 概念 ⇒ 把档位
 *  写进提示行。渲染端对应表 = `thincoder-desktop/renderer/context-tiers.mjs`（**端差面**：渲染面静态闭包
 *  判据禁 `@thincoder/core` 导入 ⇒ 两侧各持一份；值同源，改一处须同改另一处）。 */
const CONTEXT_K_TIER_HINT = "32 ∕ 64 ∕ 128 ∕ 200 ∕ 256 ∕ 512 ∕ 1024"
const CONTEXT_TOKEN_TIER_HINT = "32000 ∕ 64000 ∕ 128000 ∕ 200000 ∕ 256000 ∕ 512000 ∕ 1000000 ∕ 2000000"
const MAX_OUTPUT_TIER_HINT = "8000 ∕ 16000 ∕ 32000 ∕ 64000 ∕ 128000 ∕ 256000 ∕ 384000"

/** createProviderAdmin(ctx) → { addProviderFlow, removeProviderFlow, setKeyFlow, setProviderKey, setContextFlow } */
export function createProviderAdmin(ctx) {
  const { agent, showPicker, askQuestion, pushLine, persistRaw, maskKey, confirmDelete, C, fmtContextK, defaultModelLabel } = ctx

  // ═══ 渠道管理流（provider 级 config 写——语义不变——与 /model 会话选择分离）═══

  /** M9 配置阶段准入探：探通 → 清标记；探不通 → 会话内存标「不可用」+ 明示原因（绝不落 config；
   *  不阻断保存——条目已保存，仅标注）。 */
  async function probeChannelFlow(cfg, label) {
    const r = await probeChannelModels(cfg)
    if (r.ok) {
      delete cfg._unavailable
      pushLine(`${label}: /models 可用（${r.list.length} 个模型可候选）`, C.tool)
    } else {
      cfg._unavailable = true
      pushLine(`${label} 不可用 — ${r.message}`, C.error)
    }
    return r
  }

  async function addProviderFlow() {
    const entries = [
      { type: "header", text: "Select a preset provider" },
      ...Object.entries(PRESETS).filter(([name]) => !agent.providers.some((p) => p.name === name))
        .map(([name, p]) => ({ type: "item", text: `${name.padEnd(10)} ${p.desc ?? ""} (${p.model ?? ""})`, name, kind: "preset" })),
      { type: "header", text: "Other" },
      { type: "item", text: "Custom (manual config)", name: "__custom__", kind: "custom" },
    ]
    const se = await showPicker("Add Provider", entries)
    if (!se) return // Esc → 返回上级（openModelPicker 循环会重开主菜单）
    if (se.kind === "custom") {
      const name = await askQuestion("Enter provider name:")
      if (!name) return
      if (agent.providers.some((p) => p.name === name)) return
      const baseURL = (await askQuestion("Enter baseURL:")).replace(/\/+$/, "")
      if (!baseURL) return
      const model = await askQuestion("Enter model name:")
      if (!model) return
      const format = await showPicker("API format", [
        { type: "item", text: "openai", name: "openai" },
        { type: "item", text: "anthropic", name: "anthropic" },
        { type: "item", text: "google", name: "google" },
      ])
      if (!format) return // Esc/取消 → 中止流程
      const cfg = { name, baseURL, model }
      if (format.name === "anthropic" || format.name === "google") cfg.format = format.name
      else if (format.name !== "openai") return // 防御：未知格式（理论不可达——picker 枚举）
      await persistRaw((raw) => { raw.providers ??= []; raw.providers.push(cfg) }) // D-F5a 先盘后存
      agent.providers.push(cfg)
      const key = await askQuestion(`Enter API key for ${name} (skip if none):`)
      if (key) await setProviderKey(name, key, { probe: false }) // 探统一在流尾（M9——精确一次）
      await probeChannelFlow(cfg, name) // M9 准入探（加渠道配置写入面；保存已落——不阻断）
      return
    }
    const preset = PRESETS[se.name]
    if (!preset || agent.providers.some((p) => p.name === se.name)) return
    const cfg = { name: se.name, baseURL: preset.baseURL, model: preset.model }
    if (preset.thinking) cfg.thinking = preset.thinking
    if (preset.reasoningEffort) cfg.reasoningEffort = preset.reasoningEffort
    if (preset.maxTokens) cfg.maxTokens = preset.maxTokens
    if (preset.chatPath) cfg.chatPath = preset.chatPath
    if (preset.format) cfg.format = preset.format
    await persistRaw((raw) => { raw.providers ??= []; raw.providers.push(cfg) }) // D-F5a 先盘后存
    agent.providers.push(cfg)
    const key = await askQuestion(`Enter API key for ${se.name} (skip if none):`)
    if (key) await setProviderKey(se.name, key, { probe: false }) // 探统一在流尾（M9——精确一次）
    await probeChannelFlow(cfg, se.name) // M9 准入探（加渠道配置写入面；保存已落——不阻断）
  }

  async function removeProviderFlow() {
    const candidates = agent.providers.filter((p) => p.name !== agent.activeProvider)
    if (!candidates.length) return
    const se = await showPicker("Remove Provider", [
      { type: "header", text: "Select provider to remove" },
      ...candidates.map((p) => ({ type: "item", text: `${p.name} (${defaultModelLabel(p)})`, name: p.name })),
    ])
    if (!se) return
    if (!(await confirmDelete(`Remove provider ${se.name}?`))) return
    await persistRaw((raw) => {
      raw.providers ??= []
      const idx = raw.providers.findIndex((p) => p?.name === se.name)
      if (idx !== -1) raw.providers.splice(idx, 1)
      // F-4 级联（IKCDMR——AC-4）：同盘清 consultModels/subagentModels/advisor.provider 悬挂引用
      cascadeRemoveProvider(raw, se.name)
    })
    agent.providers.splice(agent.providers.findIndex((p) => p.name === se.name), 1)
    // 会话内存镜像同清（agent.config = loadConfig 产物——consult/escalate 同会话读
    // agent.config.agent.*；merged.advisor 为 agent.advisor 的提升拷贝——双处清理）
    if (agent.config) {
      cascadeRemoveProvider(agent.config, se.name)
      if (agent.config.advisor?.provider === se.name) delete agent.config.advisor.provider
    }
  }

  async function setKeyFlow() {
    const se = await showPicker("Configure API Key", [
      { type: "header", text: "Select provider" },
      ...agent.providers.map((p) => ({ type: "item", text: `${p.name} ${p.apiKey ? `(has key: ${maskKey(p.apiKey)})` : "(no key)"}`, name: p.name })),
    ])
    if (!se) return
    const key = await askQuestion(`Enter API key for ${se.name}:`)
    if (key) await setProviderKey(se.name, key)
  }

  /** 设 API key（可以来自渠道管理流 / 加渠道流内的 key 步）：写盘 + 内存镜像；
   *  M9：设 key 属配置写入面——默认探一次 `/models`（不阻断——key 已保存）；
   *  加渠道流内调用传 `{ probe: false }`（探由该流尾部统一执行——精确一次）。 */
  async function setProviderKey(name, key, { probe = true } = {}) {
    const target = agent.providers.find((p) => p.name === name)
    if (!target) return
    await persistRaw((raw) => {
      raw.providers ??= []
      const t = raw.providers.find((p) => p?.name === name)
      if (t) t.apiKey = key
    })
    target.apiKey = key
    if (name === agent.activeProvider) agent.provider.apiKey = key
    if (probe) await probeChannelFlow(target, name)
  }

  /** /model provider 管理：context 窗口字段（K 单位）——picker 选 provider + 表单输入。
   *  提示行列出**常见档位**（2026-10-10 四轮 · 用户「还得看多少位数」—— 给档位免数位，输入仍自由）。 */
  async function setContextFlow() {
    const se = await showPicker("Set Context Window", [
      { type: "header", text: "Select provider" },
      ...agent.providers.map((p) => ({
        type: "item",
        text: `${p.name} (ctx ${fmtContextK(providerSpec(p).context)})`,
        name: p.name,
      })),
    ])
    if (!se?.name) return // Esc
    const target = agent.providers.find((p) => p.name === se.name)
    if (!target) return
    const current = Number.isInteger(target.context) && target.context > 0 ? target.context : null
    const val = (await askQuestion(
      `Context window for ${se.name} in K units (common: ${CONTEXT_K_TIER_HINT}; current: ${current ? `${current}K` : "spec default"} — e.g. 128 = 128K; empty to clear):`
    ))?.trim() ?? ""
    let newCtx // undefined = 清空（回 spec 值）
    if (val !== "") {
      const n = Number(val)
      if (!Number.isInteger(n) || n <= 0) {
        pushLine(`Invalid context: "${val}" — must be a positive integer in K units (e.g. 128 = 128K)`, C.error)
        return
      }
      newCtx = n
    }
    await persistRaw((raw) => {
      raw.providers ??= []
      const t = raw.providers.find((p) => p?.name === se.name)
      if (!t) return
      if (newCtx === undefined) delete t.context
      else t.context = newCtx
    })
    if (newCtx === undefined) delete target.context
    else target.context = newCtx
    if (se.name === agent.activeProvider) {
      if (newCtx === undefined) delete agent.provider.context
      else agent.provider.context = newCtx
      if (agent.config?.agent?.compactThresholdAuto) {
        const { resolveCompactThreshold } = await import("@thincoder/core/config.mjs")
        agent.config.agent.compactThreshold = resolveCompactThreshold(null, agent.provider).value
      }
    }
    pushLine(target.context !== undefined
      ? `ctx = ${target.context}K (${target.context * 1024} tokens)`
      : `context cleared — using model spec (${fmtContextK(providerSpec(target).context)})`, C.tool)
  }

  /** 单字段录入（返回覆写叶 patch；`undefined` = 取消 ∕ 非法——调用侧 `continue` 回菜单）。
   *  `null` 值 = 清除该叶；数值叶正整数字符串化校验（与核 `sanitizeOverride` 同判据，此处提前报错）。 */
  async function promptModelParamPatch(field) {
    if (field === "thinking") {
      const se = await showPicker("Thinking", [
        { type: "item", text: "off — model has no thinking mode", name: "off" },
        { type: "item", text: "on — thinking can be turned off", name: "on" },
        { type: "item", text: "always on — server enforces thinking", name: "always" },
      ])
      if (!se?.name) return undefined
      if (se.name === "off") return { thinking: false, thinkAlwaysOn: false }
      if (se.name === "on") return { thinking: true, thinkAlwaysOn: false }
      return { thinking: true, thinkAlwaysOn: true }
    }
    if (field === "context" || field === "maxOutput") {
      const tiers = field === "context" ? CONTEXT_TOKEN_TIER_HINT : MAX_OUTPUT_TIER_HINT
      const val = ((await askQuestion(`${field} in tokens (common: ${tiers}; empty to clear):`)) ?? "").trim()
      if (val === "") return { [field]: null }
      const n = Number(val)
      if (!Number.isInteger(n) || n <= 0) {
        pushLine(`Invalid ${field}: "${val}" — must be a positive integer (tokens, not K)`, C.error)
        return undefined
      }
      return { [field]: n }
    }
    if (field === "reasoningEffortEnum") {
      const val = ((await askQuestion("Reasoning levels, comma-separated, low→high (e.g. low,high,max; empty to clear):")) ?? "").trim()
      if (val === "") return { reasoningEffortEnum: null }
      const levels = [...new Set(val.split(",").map((s) => s.trim()).filter(Boolean))]
      if (!levels.length) { pushLine("no valid levels entered", C.error); return undefined }
      return { reasoningEffortEnum: levels }
    }
    if (field === "reasoningEffortDefault") {
      const val = ((await askQuestion("Default reasoning level (empty to clear):")) ?? "").trim()
      return val === "" ? { reasoningEffortDefault: null } : { reasoningEffortDefault: val }
    }
    return undefined
  }

  /** /model → 「Model parameters」：**模型级**规格覆写编辑流（`config.modelOverrides` · 2026-10-10）。
   *
   *  与 `setContextFlow` 分工：渠道级 `providers[].context`（K 单位）= 端点差异；模型级 = 模型能力
   *  （内置表缺行 ∕ 反代前缀名 `cn:auto`、`global:gpt-5.4`——此前一律落 DEFAULT_SPEC 128K/32K/无思考）。
   *
   *  三级：选渠道 → 选模型（候选拉取 + 手输兜底）→ 字段菜单循环（逐项即写即存——沿本档即写惯例）。
   *  每写一拍同拍 `setModelOverrides(raw.modelOverrides)` 重注册核覆写表（`persistRaw` 的 mutate 收到
   *  的是**新鲜盘面 raw**）⇒ 本进程内 `specForModel` ∕ 状态行 ∕ 思考档位即时随动（无需重启）。
   *  空值 = 清除该叶（与桌面「重置为默认」同语义：整条清空 ⇒ 删键回内置表）。 */
  async function setModelParamsFlow() {
    if (!agent.providers.length) return
    const se = await showPicker("Model parameters", [
      { type: "header", text: "Select provider" },
      ...agent.providers.map((p) => ({ type: "item", text: `${p.name} (${defaultModelLabel(p)})`, name: p.name })),
    ])
    if (!se?.name) return
    const provider = agent.providers.find((p) => p.name === se.name)
    if (!provider) return

    const askModelId = async () =>
      ((await askQuestion("Enter model ID (exactly as sent to the API, e.g. cn:deepseek-v4-flash):")) ?? "").trim() || null
    let model = null
    try {
      const models = await getProviderModels(provider)
      const picked = await showPicker(`Model parameters — ${provider.name}`, [
        { type: "header", text: "Select model" },
        ...models.slice(0, 80).map((id) => ({ type: "item", text: id, name: id })),
        { type: "header", text: "Other" },
        { type: "item", text: "Type a model ID…", name: "__type__" },
      ])
      if (!picked?.name) return
      model = picked.name === "__type__" ? await askModelId() : picked.name
    } catch {
      model = await askModelId() // 拉取失败（渠道不可用）⇒ 手输兜底，不阻断编辑
    }
    if (!model) return

    for (;;) {
      const r = specMatch(model)
      const key = overrideKeyFor(model)
      pushLine(`model: ${model}`, C.tool)
      pushLine(`  source: ${r.source}${key === null ? "" : ` — override key "${key}"`}`, C.tool)
      pushLine(`  context: ${r.spec.context} tokens · maxOutput: ${r.spec.maxOutput}`, C.tool)
      pushLine(`  thinking: ${r.spec.thinking === true ? (r.spec.thinkAlwaysOn === true ? "always on" : "on") : "off"} · levels: ${(r.spec.reasoningEffortEnum ?? []).join(",") || "(none)"} · default: ${effortDefaultFor(model) ?? "(none)"}`, C.tool)
      const field = await showPicker(`Model parameters — ${model}`, [
        { type: "header", text: "Edit" },
        { type: "item", text: "Context window (tokens)…", name: "context" },
        { type: "item", text: "Max output tokens…", name: "maxOutput" },
        { type: "item", text: "Thinking (off / on / always)…", name: "thinking" },
        { type: "item", text: "Reasoning levels (comma-separated, low→high)…", name: "reasoningEffortEnum" },
        { type: "item", text: "Default reasoning level…", name: "reasoningEffortDefault" },
        { type: "header", text: "Actions" },
        { type: "item", text: key === null ? "Reset to built-in default (no override)" : `Reset to built-in default (drop "${key}")`, name: "__reset__" },
        { type: "item", text: "Done", name: "__done__" },
      ])
      if (!field?.name || field.name === "__done__") return
      if (field.name === "__reset__") {
        if (key === null) { pushLine("no override in place — nothing to reset", C.tool); continue }
        await persistRaw((raw) => { removeOverrideKey(raw, key); setModelOverrides(raw.modelOverrides) })
        pushLine(`modelOverrides["${key}"] removed — back to the built-in spec`, C.tool)
        continue
      }
      const patch = await promptModelParamPatch(field.name)
      if (patch === undefined) continue // Esc / 取消 / 非法值（已 pushLine 报错）
      await persistRaw((raw) => { setOverrideFields(raw, model, patch); setModelOverrides(raw.modelOverrides) })
      pushLine(`modelOverrides["${model}"] ← ${JSON.stringify(patch)}`, C.tool)
    }
  }

  return { addProviderFlow, removeProviderFlow, setKeyFlow, setProviderKey, setContextFlow, setModelParamsFlow }
}

/** 覆写表写点（纯 mutate —— `persistRaw` 新鲜 raw 上调用）：建表 → 建条目 → 逐叶写（`null` = 删该叶）；
 *  条目空 ⇒ 删条目；表空 ⇒ 删表（规范形态——与核 `sanitizeOverride` 的「零有效叶即无覆写」同义）。 */
export function setOverrideFields(raw, model, patch) {
  if (raw.modelOverrides === null || typeof raw.modelOverrides !== "object" || Array.isArray(raw.modelOverrides)) raw.modelOverrides = {}
  const cur = raw.modelOverrides[model]
  const entry = cur !== null && typeof cur === "object" && !Array.isArray(cur) ? { ...cur } : {}
  for (const [k, v] of Object.entries(patch)) { if (v === null) delete entry[k]; else entry[k] = v }
  if (Object.keys(entry).length === 0) delete raw.modelOverrides[model]
  else raw.modelOverrides[model] = entry
  if (Object.keys(raw.modelOverrides).length === 0) delete raw.modelOverrides
}

/** 覆写键删除（纯 mutate）——「重置为内置默认」：删键 + 空表收口。 */
export function removeOverrideKey(raw, key) {
  const table = raw.modelOverrides
  if (table === null || typeof table !== "object" || Array.isArray(table)) return
  delete table[key]
  if (Object.keys(table).length === 0) delete raw.modelOverrides
}

/** F-4 (IKCDMR) 级联清理（删渠道共享写点）：raw/merged config 移除 name 渠道后清悬挂引用——
 *  agent.consultModels 条目 / agent.subagentModels 角色值（=== name 或 "name:…" 前缀——
 *  角色值是 "provider:model" | 裸渠道名 | 裸模型名）/ agent.advisor.provider。
 *  纯 mutate（removeProviderFlow persistRaw 的 D-F5 新鲜 raw 上调用；agent.config 内存镜像
 *  子树与 raw.agent 同构可复用）。空数组/空对象键删除（规范形态）。 */
export function cascadeRemoveProvider(raw, name) {
  const a = raw?.agent
  if (!a || typeof a !== "object" || Array.isArray(a)) return
  if (Array.isArray(a.consultModels)) {
    const keep = a.consultModels.filter((m) => m?.provider !== name)
    if (keep.length) a.consultModels = keep
    else delete a.consultModels
  }
  if (a.subagentModels && typeof a.subagentModels === "object" && !Array.isArray(a.subagentModels)) {
    for (const role of Object.keys(a.subagentModels)) {
      const v = a.subagentModels[role]
      if (typeof v === "string" && (v === name || v.startsWith(`${name}:`))) delete a.subagentModels[role]
    }
    if (Object.keys(a.subagentModels).length === 0) delete a.subagentModels
  }
  if (a.advisor && typeof a.advisor === "object" && !Array.isArray(a.advisor) && a.advisor.provider === name) {
    delete a.advisor.provider
  }
}
