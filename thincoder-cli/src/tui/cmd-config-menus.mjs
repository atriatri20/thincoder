/**
 * cmd-config-menus.mjs — the four `/config` sub-menus: proxy ∥ consult/escalate pool ∥ async
 * pools ∥ default model. Split out of cmd-config.mjs (CONTEXT-COMPACTION.md §6.16.9 — C2):
 * the entry file keeps the command spine (embedding key / save + reload / main menu / numeric
 * items), this file only renders sub-menus.
 *
 * Factory form (design-pinned): `create<Name>Menu(ctx)` with
 *   ctx = { agent, DEFAULTS, showPicker, askQuestion, pushLine, pushLabel, saveProxy, pickModelForSlot }
 * cmd-config.mjs builds `saveProxy` first, then constructs the four menus once and reuses them —
 * behaviour is unchanged (same entries, same wording, same save path).
 */

import { ansi, C } from "./ansi.mjs"
import { probeChannelModels, dedupeModels } from "./model-catalog.mjs"
// 派生条目隐藏判据单源（TEAM.md §2.4——#1223：/config 渠道读面过滤）
import { isDerivedProviderHidden } from "./provider-admin.mjs"
import { probeTargetOf } from "@thincoder/core/provider-flows.mjs"
import { effortMenuLevels, poolCur } from "./config-helpers.mjs"

/** ── 代理子菜单：URI ∥ Web 工具开关 ∥ 连通性自测 ∥ 清除。
 *  每轮重建 entries 显示最新状态，defaultIndex 记住上次位置。 */
export function createProxyMenu(ctx) {
  const { agent, showPicker, askQuestion, pushLine, pushLabel, saveProxy } = ctx
  return async function proxyMenu() {
    let proxyIdx = 0
    for (;;) {
      const pc = agent.config?.proxy // 已归一化 { uri, web } | undefined
      const entries = [
        { type: "header", text: `Proxy: ${pc?.uri || "(not set)"}` },
        { type: "item", text: "Set proxy URI…", action: "seturi" },
        { type: "item", text: `Web tools (fetch/websearch): ${!pc || pc.web ? "ON" : "OFF"}`, action: "toggleweb" },
        { type: "item", text: "Test connection", action: "test" },
        { type: "item", text: "Clear proxy", action: "clear" },
      ]
      const c = await showPicker("Proxy", entries, { defaultIndex: proxyIdx })
      if (!c) return // Esc 返回主菜单
      proxyIdx = Math.max(0, entries.filter((e) => e.type === "item").indexOf(c))

      try {
        if (c.action === "seturi") {
          const newUri = await askQuestion("Proxy URI (e.g. http://127.0.0.1:7890):")
          if (!newUri) continue // 空输入不改动
          // 写即归一：两键重建 `{ uri, web }`——旧 string 形态 ∥ 盘上退役残键（如 `model`）读后即清；
          // `web` 不显式 OFF 即 true（沿现值显示口径 `!pc || pc.web`——改 URI 不动 web 开合）。
          await saveProxy((raw) => {
            raw.proxy = { uri: newUri, web: !pc || pc.web !== false }
          })
          pushLabel("❯ Config", ansi.bold + C.tool)
          pushLine(`proxy.uri = ${newUri}`, C.tool)
        } else if (c.action === "toggleweb") {
          if (!pc) { pushLine("Proxy URI not set — use Set proxy URI… first", C.error); continue }
          await saveProxy((raw) => { raw.proxy = { ...pc, web: !pc.web } })
          pushLabel("❯ Config", ansi.bold + C.tool)
          pushLine(`proxy.web = ${!pc.web ? "on" : "off"}`, C.tool)
        } else if (c.action === "test") {
          const { proxyFetch, resolveWebProxy } = await import("@thincoder/core/proxy.mjs")
          const { UA } = await import("@thincoder/core/tools/web.mjs")
          const uri = resolveWebProxy({ agent })
          pushLabel("❯ Config", ansi.bold + C.tool)
          pushLine(`Testing ${uri ? `via proxy ${uri}` : "direct (no proxy)"}...`, C.dim)
          try {
            const res = await Promise.race([
              proxyFetch("https://www.gstatic.com/generate_204", { headers: { "User-Agent": UA } }, uri),
              new Promise((_, reject) => setTimeout(() => reject(new Error("timeout after 5s")), 5000)),
            ])
            if (res.ok) pushLine(`✓ OK (HTTP ${res.status})`, C.tool)
            else pushLine(`✗ HTTP ${res.status}`, C.error)
          } catch (error) {
            pushLine(`✗ ${error.message}`, C.error)
          }
        } else if (c.action === "clear") {
          await saveProxy((raw) => { delete raw.proxy })
          pushLabel("❯ Config", ansi.bold + C.tool)
          pushLine("Proxy cleared", C.tool)
        }
      } catch (error) { pushLine(`Save failed: ${error.message}`, C.error) }
    }
  }
}

/** Reasoning-effort 取档（会诊条目用）：显示该模型真实枚举——枚举跨渠道异构（deepseek:
 *  low/high/max；qwen3.8-max: xhigh/medium/low；kimi: 7 级），固定 min/low/medium/high/max
 *  会让用户选出运行期静默丢弃的档（2026-08-17 审计）。 */
async function pickEffort(ctx, current, model) {
  const { showPicker } = ctx
  const { specForModel } = await import("@thincoder/core/config.mjs")
  const enumList = model ? specForModel(model).reasoningEffortEnum : null
  if (!enumList || enumList.length === 0) return null // model has no effort — skip
  const levels = effortMenuLevels(enumList) // "none" = clear the effort（自带去重——#16）
  const entries = levels.map((l) => ({ type: "item", text: l === current ? `${l}  ← current` : l, action: l }))
  const c = await showPicker("Reasoning effort", entries, { defaultIndex: Math.max(0, levels.indexOf(current ?? "none")) })
  return c ? c.action : null // Esc → null (keep unchanged)
}

/** ── 会诊/飞刀候选池子菜单：列出 / 添加 / 编辑 effort / 删除 consultModels 条目。 */
export function createConsultMenu(ctx) {
  const { agent, showPicker, pushLine, pushLabel, saveProxy, pickModelForSlot } = ctx
  return async function consultMenu() {
    let idx = 0
    for (;;) {
      const cm = agent.config?.agent?.consultModels ?? []
      const entries = [
        { type: "header", text: `Consult/escalate pool: ${cm.length} model(s) (max 5)` },
        ...cm.map((m, i) => ({ type: "item", text: `${m.provider}:${m.model}${m.effort ? ` (${m.effort})` : ""}`, action: "edit", index: i })),
        { type: "item", text: cm.length ? "＋ Add model" : "＋ Add model (none yet)", action: "add" },
      ]
      const c = await showPicker("Consult models", entries, { defaultIndex: idx })
      if (!c) return // Esc → 返回主菜单
      if (c.action === "add") {
        if (cm.length >= 5) { pushLine("At most 5 consult models", C.error); continue }
        // BOTH provider and model are pickers (discipline: options, never free-text) —
        // pickModelForSlot reuses /model's provider list + async-fetched model list.
        const picked = await pickModelForSlot()
        if (!picked) continue
        const effort = await pickEffort(ctx, null, picked.model)
        const entry = { provider: picked.provider, model: picked.model }
        if (effort && effort !== "none") entry.effort = effort
        const next = [...cm, entry]
        await saveProxy((raw) => { raw.agent ??= {}; raw.agent.consultModels = next })
        pushLabel("❯ Config", ansi.bold + C.tool)
        pushLine(`Added ${entry.provider}:${entry.model}${entry.effort ? ` (${entry.effort})` : ""}`, C.tool)
        idx = 0
      } else if (c.action === "edit") {
        // Per-model sub-menu: change effort or remove.
        const m = cm[c.index]
        const tag = `${m.provider}:${m.model}`
        const subEntries = [
          { type: "header", text: `${tag} — effort: ${m.effort ?? "(none)"}` },
          { type: "item", text: `Change effort (current: ${m.effort ?? "none"})`, action: "effort" },
          { type: "item", text: "Remove", action: "remove" },
        ]
        const s = await showPicker(tag, subEntries, {})
        if (!s) continue
        if (s.action === "remove") {
          const next = cm.filter((_, i) => i !== c.index)
          await saveProxy((raw) => { raw.agent ??= {}; raw.agent.consultModels = next })
          pushLabel("❯ Config", ansi.bold + C.tool)
          pushLine(`Removed ${tag}`, C.tool)
        } else if (s.action === "effort") {
          const effort = await pickEffort(ctx, m.effort, m.model)
          if (effort === null) { continue } // Esc 保持
          const next = cm.map((x, i) => {
            if (i !== c.index) return x
            if (effort === "none") { const { effort, ...rest } = x; return rest }
            return { ...x, effort }
          })
          await saveProxy((raw) => { raw.agent ??= {}; raw.agent.consultModels = next })
          pushLabel("❯ Config", ansi.bold + C.tool)
          const after = next[c.index]
          pushLine(`${tag} effort = ${after?.effort ?? "none"}`, C.tool)
        }
        idx = 0
      }
    }
  }
}

/** ── 并发池子菜单（agent.poolLimits——读/改三域；保存经 saveProxy
 *  落盘 + reloadConfig 热应用——下个 spawn 生效）── */
export function createPoolMenu(ctx) {
  const { agent, DEFAULTS, showPicker, askQuestion, pushLine, pushLabel, saveProxy } = ctx
  return async function poolMenu() {
    let poolIdx = 0
    for (;;) {
      const pl = agent.config?.agent?.poolLimits ?? {}
      // 显示回退与默认同源（DEFAULTS.agent.poolLimits——配置 DEFAULTS 与运行时回退常量
      // ASYNC_POOL_LIMITS/ADVISOR_POOL_LIMIT 的耦合由 T-24a4 锚定断言锁住——防默认值单侧漂移）
      const cur = poolCur(pl, DEFAULTS)
      const entries = [
        { type: "header", text: `Async pools: eng-coder ${cur("engCoder")} / other ${cur("other")} / advisor ${cur("advisor")}（默认 4/4/4——分域互不阻塞——subagent 超限排队/advisor 超限即拒）` },
        { type: "item", text: `eng-coder 池上限 = ${cur("engCoder")}`, action: "engCoder" },
        { type: "item", text: `其他角色池上限 = ${cur("other")}`, action: "other" },
        { type: "item", text: `advisor 评审池上限 = ${cur("advisor")}`, action: "advisor" },
      ]
      const c = await showPicker("并发池（agent.poolLimits）", entries, { defaultIndex: poolIdx })
      if (!c) return // Esc 返回主菜单
      poolIdx = Math.max(0, entries.filter((e) => e.type === "item").indexOf(c))
      const val = await askQuestion(`${c.action} pool limit (current: ${cur(c.action)} — positive integer ≥1):`)
      if (!val) continue // 空输入不改动
      const num = Number(val)
      if (!Number.isInteger(num) || num < 1) { pushLine("Pool limit must be a positive integer (≥1)", C.error); continue }
      // 写盘全对象（三键——未触碰的键带当前值重写——全非法/空输入不改动）
      const next = { engCoder: cur("engCoder"), other: cur("other"), advisor: cur("advisor"), [c.action]: num }
      try {
        await saveProxy((raw) => { raw.agent ??= {}; raw.agent.poolLimits = { engCoder: next.engCoder, other: next.other, advisor: next.advisor } })
        pushLabel("❯ Config", ansi.bold + C.tool)
        pushLine(`agent.poolLimits = { engCoder: ${next.engCoder}, other: ${next.other}, advisor: ${next.advisor} }（下个 spawn 生效——分域互不阻塞）`, C.tool)
      } catch (error) { pushLine(`Save failed: ${error.message}`, C.error) }
    }
  }
}

/** ── 默认模型子菜单（F-5：config.defaultModel 专用入口——L1 provider → L2 **运行期拉取**候选 →
 *  写 config.defaultModel——saveProxy/writeConfigAtomic 通道——不落会话槽；不加手输行——O1 已裁）── */
export function createDefaultModelMenu(ctx) {
  const { agent, showPicker, pushLine, pushLabel, saveProxy } = ctx
  return async function defaultModelMenu() {
    let idx = 0
    // M9 配置阶段准入：进本子菜单探一次各渠道 `/models`（复用 M1 + 会话缓存）。
    // 探通 → 渠道可用 + 候选直接可用；探不通 → 不缓存不阻断（标「不可用」且不入可选来源）。
    // #1223（TEAM.md §2.4 六消费面）：派生无 key 条目隐藏——探针 ∥ 条目录入两面同过滤。
    const probes = new Map()
    pushLine("Fetching channel model lists (GET /models)…", C.dim)
    await Promise.all(agent.providers.filter((p) => !isDerivedProviderHidden(p)).map(async (p) => {
      const r = await probeChannelModels(probeTargetOf(p)) // 探针目标构造收敛核判据（③′——逐渠旗 ∧ `uri` 在案；执行体零改）
      probes.set(p.name, r)
      if (r.ok) delete p._unavailable
      else p._unavailable = true
    }))
    for (;;) {
      const dm = agent.config?.defaultModel ?? null
      const entries = [
        { type: "header", text: `config.defaultModel = ${dm ?? "(not set — 新会话起点未配置)"}` },
        ...agent.providers.filter((p) => !isDerivedProviderHidden(p)).map((p) => {
          const r = probes.get(p.name)
          if (!r?.ok) return { type: "item", text: `${p.name.padEnd(10)} 不可用`, action: "provider", provider: p.name, unavailable: true }
          const n = r.list.length
          // M3③：渠道行显示回退 = `baseURL`（渠道条目不携模型——2026-10-09 清除批）+ 探得候选数
          return { type: "item", text: `${p.name.padEnd(10)} ${p.baseURL} (${n} model${n === 1 ? "" : "s"})`, action: "provider", provider: p.name }
        }),
      ]
      const c = await showPicker("Default Model (新会话起点)", entries, { defaultIndex: idx })
      if (!c) return // Esc → 返回主菜单
      idx = Math.max(0, entries.filter((e) => e.type === "item").indexOf(c))
      if (c.action !== "provider") continue
      const r = probes.get(c.provider)
      if (!r?.ok) {
        // 准入判据：探不通的渠道不作为默认模型的可选来源——明示原因（M8 长句），不阻断菜单
        pushLine(r?.message ?? `${c.provider} 不可用`, C.error)
        continue
      }
      if (r.list.length === 0) { pushLine(`${c.provider}: /models 未返回任何模型`, C.error); continue }
      const me = await showPicker(`${c.provider} models`, [
        { type: "header", text: "选为 config.defaultModel（新会话起点——当前会话槽不受影响）" },
        ...dedupeModels(r.list).map((m) => ({ type: "item", text: m, action: "model", model: m })),
      ])
      if (!me) continue // Esc → 回默认模型菜单
      try {
        await saveProxy((raw) => { raw.defaultModel = `${c.provider}:${me.model}` })
        pushLabel("❯ Config", ansi.bold + C.tool)
        pushLine(`config.defaultModel = ${c.provider}:${me.model}（新会话起点；会话模型不受影响）`, C.tool)
      } catch (error) { pushLine(`Save failed: ${error.message}`, C.error) }
    }
  }
}
