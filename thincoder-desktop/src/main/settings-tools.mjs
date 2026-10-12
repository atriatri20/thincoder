/**
 * settings-tools.mjs — 主侧 tools 族处理体（R7 · 桌面功能对位批 · 批档 §2 R7 #4；**先拆后改**：自
 * `src/main/settings.mjs` 拆出 —— 300 行层拆分）。
 *
 * 面：`settings:tools` 两支 —— 读 `{}`（embedding ∕ websearch 两键在场判据；**值一律不下发** ——
 * 密钥纪律）· 写 `{ patch: { embedding?: { apiKey }, websearch?: { apiKey } } }`（**写经核
 * `writeConfigAtomic`**；空串 = 清键 ⇒ 摘键，节点空 ⇒ 删节点）。
 * 语义源：embedding merge（置键回填 `baseURL` ∕ `model`——既有自定义值优先、缺位取核
 * `DEFAULTS.embedding`）= CLI `cmd-config.mjs:6` `embeddingPatch`（默认值单源 = 核）；websearch
 * 单键写 = VSC `saveWebsearchKeyFromPanel`。
 * **热应用（2026-10-12 · 方案 A）**：写盘成功后同笔把补丁刷进**在装配 agent 的活配置对象**
 * （`agent.config`）——此前只写盘 ⇒ 运行中 agent 的 `config.websearch.apiKey` 恒空 ⇒ 核
 * `tools/web.mjs` `fetchTavily` 取不到 key **静默掉回 Bing**（用户实测：盘上有 key、工具仍出
 * `[bing]` 标签）。语义与核 `agent-tools/settings.mjs` set 对齐（写盘 + 内存同笔，回合边界键下回合
 * 生效）；在装配列表经调用面注入（`listAgents`——mcp 四转口同款，本档**不 import** 会话宿主 ⇒ 零环）；
 * 无宿主 ∕ 无在装配 agent ⇒ 零动作（配置已落盘，下次装配生效——非静默降级）。
 * 纪律：零 electron 依赖（平 node 可直测）；`apiKey` 非串 ⇒ `invalid-patch`（零写）。
 */
import { DEFAULTS, loadConfig } from "@thincoder/core/config.mjs"
import { _configPath, writeConfigAtomic } from "@thincoder/core/config-io.mjs"

/** tools 读面：两键在场判据（值一律不下发）。 */
function toolsFace() {
  const config = loadConfig()
  return {
    embedding: { hasKey: typeof config?.embedding?.apiKey === "string" && config.embedding.apiKey !== "" },
    websearch: { hasKey: typeof config?.websearch?.apiKey === "string" && config.websearch.apiKey !== "" },
  }
}

/** embedding key 写形（merge 语义源 = CLI `cmd-config.mjs:6` `embeddingPatch`：置键并回填
 *  `baseURL` ∕ `model`（既有自定义值优先、缺位取核 `DEFAULTS.embedding`——**默认值单源 = 核**）；
 *  空 key ⇒ **摘键**，节点空 ⇒ 删节点）。 */
function applyEmbeddingKey(disk, apiKey) {
  const emb = disk.embedding && typeof disk.embedding === "object" && !Array.isArray(disk.embedding) ? disk.embedding : {}
  const key = typeof apiKey === "string" ? apiKey.trim() : ""
  if (key) {
    emb.apiKey = key
    if (typeof emb.baseURL !== "string" || emb.baseURL === "") emb.baseURL = DEFAULTS.embedding.baseURL
    if (typeof emb.model !== "string" || emb.model === "") emb.model = DEFAULTS.embedding.model
  } else {
    delete emb.apiKey
  }
  if (Object.keys(emb).length) disk.embedding = emb
  else delete disk.embedding
}

/** websearch key 写形（沿 VSC `saveWebsearchKeyFromPanel`：只动 `apiKey` 一键；空 ⇒ 摘键，
 *  节点空 ⇒ 删节点——不落空节点）。 */
function applyWebsearchKey(disk, apiKey) {
  const ws = disk.websearch && typeof disk.websearch === "object" && !Array.isArray(disk.websearch) ? disk.websearch : {}
  const key = typeof apiKey === "string" ? apiKey.trim() : ""
  if (key) ws.apiKey = key
  else delete ws.apiKey
  if (Object.keys(ws).length) disk.websearch = ws
  else delete disk.websearch
}

/**
 * 热应用（方案 A · 2026-10-12）：把同一补丁刷进在装配 agent 的活配置对象——写形与写盘**同函数复用**
 * （`applyEmbeddingKey` ∕ `applyWebsearchKey` 只碰 `.embedding` ∕ `.websearch` 两节 ⇒ 盘对象与
 * `agent.config` 同形可共用；摘键 ∕ 删空节点语义逐字一致 ⇒ 盘 ∕ 内存零分叉）。
 * 在装配列表缺位（无宿主）⇒ 零动作（配置已落盘，下次装配生效）。
 */
function hotApply(patch, listAgents) {
  const agents = typeof listAgents === "function" ? listAgents() : null
  if (!Array.isArray(agents)) return
  for (const agent of agents) {
    const config = agent?.config
    if (!config || typeof config !== "object") continue
    if ("embedding" in patch) applyEmbeddingKey(config, patch.embedding.apiKey)
    if ("websearch" in patch) applyWebsearchKey(config, patch.websearch.apiKey)
  }
}

/**
 * `settings:tools(payload)`：读 `{}` ⇒ `{ ok, reason:null, embedding:{hasKey}, websearch:{hasKey} }`；
 * 写 `{ patch: { embedding?: { apiKey }, websearch?: { apiKey } } }` ⇒ 同形回执（写后回读）。
 *  `apiKey` 非串 ⇒ `invalid-patch`（零写）；空串 = 清键（摘键语义）。
 *  `deps.listAgents` = 在装配 agent 列表访问器（缺省 `null` ⇒ 热应用零动作——平 node 直测面）。
 */
export function settingsTools(payload, { listAgents = null } = {}) {
  const patch = payload?.patch
  if (patch === undefined || patch === null) return { ok: true, reason: null, ...toolsFace() }
  if (typeof patch !== "object" || Array.isArray(patch)) return { ok: false, reason: "invalid-patch", ...toolsFace() }
  const keys = Object.keys(patch)
  if (keys.length === 0 || keys.some((k) => k !== "embedding" && k !== "websearch")) {
    return { ok: false, reason: "invalid-patch", ...toolsFace() }
  }
  for (const key of keys) {
    const value = patch[key]
    if (value === null || typeof value !== "object" || Array.isArray(value)) return { ok: false, reason: "invalid-patch", ...toolsFace() }
    const fields = Object.keys(value)
    if (fields.length !== 1 || fields[0] !== "apiKey") return { ok: false, reason: "invalid-patch", ...toolsFace() }
    if (typeof value.apiKey !== "string") return { ok: false, reason: "invalid-patch", ...toolsFace() }
  }
  const w = writeConfigAtomic(_configPath(), (disk) => {
    if ("embedding" in patch) applyEmbeddingKey(disk, patch.embedding.apiKey)
    if ("websearch" in patch) applyWebsearchKey(disk, patch.websearch.apiKey)
  })
  if (!w.ok) return { ok: false, reason: w.reason, ...toolsFace() }
  hotApply(patch, listAgents) // 写盘成功 ⇒ 同笔热应用（运行中 agent 即刻可用——下回合生效）
  return { ok: true, reason: null, ...toolsFace() }
}
