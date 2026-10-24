/**
 * config-normalize.mjs — load-time normalization: pure functions that wash a dirty disk face
 * into a canonical shape (and the one-time warn flags that report what was dropped). Split out
 * of config.mjs by responsibility (CONTEXT-COMPACTION.md §6.16.9 — C1): defaults (data) ∥ these
 * rules (logic) ∥ request-budget arithmetic. Zero core imports — every function here is pure
 * (the warn flags are process-level once-only guards), so the module adds no cycle.
 *
 * config.mjs re-exports the four load-bearing ones (`sanitizeSubagentModel` ·
 * `sanitizeSubagentModels` · `normalizeProxy` · `normalizeTeamSection`) — importers keep their
 * path. `sanitizeProviderHeaders` / `sanitizeConsultModels` / the two warn helpers are consumed
 * by loadConfig only and are not part of the public config.mjs surface.
 */

/** F-4 (IKCDMR) 软失败清洗（D-S1 范式——loadConfig 是 CLI 启动砖点）：consultModels 非法
 *  条目过滤不 throw——非数组 → []、形状非法/未知渠道丢弃、超 5 截断（keep 前 5）。
 *  返回 { keep, dropped }——dropped 供一次性警告；merged.agent.consultModelsFiltered 挂载
 *  供后续首帧引导消费（数据层——本批文件面无消费方——同 providerInvalidReason 载体先例）。 */
export function sanitizeConsultModels(cm, providerNames) {
  if (cm === undefined || cm === null) return { keep: [], dropped: [] }
  if (!Array.isArray(cm)) {
    return { keep: [], dropped: [`agent.consultModels must be an array of { provider, model } entries (got ${typeof cm})`] }
  }
  const names = new Set(providerNames)
  const keep = []
  const dropped = []
  for (const entry of cm) {
    if (keep.length >= 5) { dropped.push(`over the 5-entry cap — dropped ${JSON.stringify(entry)}`); continue }
    if (!entry || typeof entry !== "object" || typeof entry.provider !== "string" || !entry.provider.trim()
        || typeof entry.model !== "string" || !entry.model.trim()) {
      dropped.push(`invalid entry (expected { provider: string, model: string }) — got ${JSON.stringify(entry)}`)
      continue
    }
    if (!names.has(entry.provider)) {
      dropped.push(`entry "${entry.provider}:${entry.model}" references unknown provider "${entry.provider}" (available: ${[...names].join(", ") || "none"})`)
      continue
    }
    keep.push(entry)
  }
  return { keep, dropped }
}

/** F-4：过滤警告——进程级一次性（loadConfig 同进程可多次调用：TUI 启动 + reloadConfig）。 */
let warnedConsultModels = false
export function warnConsultModelsFiltered(dropped, path) {
  if (warnedConsultModels || dropped.length === 0) return
  warnedConsultModels = true
  console.warn(`[config] agent.consultModels: ${dropped.length} invalid entr${dropped.length === 1 ? "y ignored" : "ies ignored"} (filtered — startup continues; no crash):\n` +
    dropped.map((d) => `  - ${d}`).join("\n") +
    `\n  Fix: clean agent.consultModels in ${path} or use /config → consult/escalate pool menu.`)
}

/** #861（AGENT-LOOP-SUBAGENT.md §6.7.1）：subagent 模型覆盖加载期清洗——单源纯函数（核 loadConfig ∥ VSC 端壳 raw 读点同消费）；非法形态不 throw（`subagentModel` 非法 ⇒ null、`subagentModels` 非对象 ⇒ {}、值非法 ⇒ 剔除该键）。 */
export function sanitizeSubagentModel(v) {
  const ok = typeof v === "string" && v.trim()
  const dropped = ok || v == null ? [] : [`agent.subagentModel must be a non-empty string ("provider:model" | model) — got ${Array.isArray(v) ? "array" : typeof v} — ignored (inherits the parent provider)`]
  return { value: ok ? v : null, dropped }
}
export function sanitizeSubagentModels(v) {
  if (v == null) return { value: {}, dropped: [] }
  if (typeof v !== "object" || Array.isArray(v)) return { value: {}, dropped: [`agent.subagentModels must be an object mapping role → model override — got ${Array.isArray(v) ? "array" : typeof v} — ignored`] }
  const value = {}, dropped = []
  for (const [role, val] of Object.entries(v)) {
    if (typeof val === "string" && val.trim()) { value[role] = val; continue }
    dropped.push(`agent.subagentModels.${role} must be a non-empty string ("provider:model" | model) — got ${Array.isArray(val) ? "array" : typeof val} — dropped`)
  }
  return { value, dropped }
}

let warnedSubagentModels = false // #861：清洗警告——进程级一次性（同 consultModels 先例）
export function warnSubagentModelsFiltered(dropped, path) {
  if (warnedSubagentModels || dropped.length === 0) return
  warnedSubagentModels = true
  console.warn(`[config] agent.subagentModel/subagentModels: ${dropped.length} invalid entr${dropped.length === 1 ? "y ignored" : "ies ignored"} (filtered — startup continues; no crash):\n` +
    `${dropped.map((d) => `  - ${d}`).join("\n")}\n  Fix: clean it in ${path} — "provider:model" | model.`)
}

/** Normalize proxy config to { uri, web } or undefined (uri/url both accepted; invalid types dropped) */
export function normalizeProxy(proxy) {
  if (typeof proxy === "string") return proxy ? { uri: proxy, web: true } : undefined
  if (!proxy || typeof proxy !== "object" || Array.isArray(proxy)) return undefined
  const uri = proxy.uri || proxy.url || ""
  if (typeof uri !== "string" || !uri) return undefined
  return { uri, web: proxy.web !== false }
}

/** 团队登录段加载归一（B1 批——`docs/core/design/TEAM.md` §2.1 ∥ CONFIG.md §6.4）：非对象 ⇒ null（软失败
 *  不阻启动——沿 proxy 段先例）；键级 = trim 非空字符串（非串 ∥ 空 ⇒ null）；`member` 浅形 `{ username, name }`。
 *  **不入 `DEFAULTS`**（settings 工具面零涉——agent 不可写；`team.token` 经读面到达 = 敏感段词表遮罩）。 */
export function normalizeTeamSection(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return null
  const str = (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null)
  const raw = value.member
  const member = raw !== null && typeof raw === "object" && !Array.isArray(raw) ? { username: str(raw.username), name: str(raw.name) } : null
  return { server: str(value.server), member, label: str(value.label), token: str(value.token) }
}

/** Keep only { header: "string value" } pairs from a provider's headers field — anything
 *  else (null, arrays, nested objects) is dropped so it can never reach a fetch call.
 *  Authorization is built-in and cannot be overridden from headers (core.mjs spreads first). */
export function sanitizeProviderHeaders(p) {
  if (p.headers == null || typeof p.headers !== "object" || Array.isArray(p.headers)) { delete p.headers; return p }
  const clean = {}
  for (const [k, v] of Object.entries(p.headers)) {
    if (typeof v === "string" && k.toLowerCase() !== "authorization") clean[k] = v
  }
  if (Object.keys(clean).length > 0) p.headers = clean
  else delete p.headers
  return p
}
