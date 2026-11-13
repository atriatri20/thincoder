/**
 * core-run-util.mjs — 核回合驱动的纯件叶子（自 `core-run.mjs` 整块外提）：八常/类 + 八件纯函数。
 * 依赖面仅 `node:fs` / `node:path` / `./protocol.mjs`——不触核面束、不持回合态。
 * 导出 14 名 = 改前 11 名 + 保留体回用转导出 3 名（`FLAG_SETTERS` ∥ `flagsOf` ∥ `excerptOf`）；
 * `textOf` ∥ `IGNORED_DIRS` 档内私有。`core-run.mjs` 只 re-export 原 11 名（其 import 面零改）。
 */

import { readdirSync } from "node:fs"
import { join } from "node:path"
import { RESULT_SUMMARY_MAX, capText } from "./protocol.mjs"

/** 工具结果全文截断（核 `thincoder-render-core/lib.mjs` `MAX_TOOL_OUTPUT` 镜像——渲染核不件位于盒
 *  镜像（件位契约 = 核 + 壳），故与 `isToolFailureText` 同法镜像；网页侧仍以渲染核原文为准）。 */
export const MAX_TOOL_OUTPUT = 64 * 1024

/** 盒内单渠道名（会话槽 `activeProvider` 恒此值——成员面外标 = 服务器开放清单标识）。 */
export const BOX_PROVIDER = "server"

/** 壳侧错误（kind 供结果面分类与 `end.reason` 取值——`not_found` ∥ `invalid_request` ∥ `write_failed` ∥
 *  `model_error`（模型未就绪旧值 `provider_invalid` 已归并至此——少一扩展值）∥ 其余原文）。 */
export class ShellError extends Error {
  constructor(kind, message) {
    super(message)
    this.name = "ShellError"
    this.kind = kind
  }
}

/** 会话布尔开关与三档工作模式。旧 engineering 只在读面迁移，不进入写面。 */
export const FLAG_KEYS = Object.freeze(["autoApprove", "planMode", "advisorGuard"])
export const WORK_MODES = Object.freeze(["minimal", "normal", "engineering"])

export const FLAG_SETTERS = Object.freeze({
  autoApprove: "setSlotAutoApprove",
  planMode: "setSlotPlanMode",
  advisorGuard: "setSlotAdvisorGuard",
})

/** `@` 候选上限（§3.11(6) `GET /api/me/chat/files`——≤50 行）∥ 遍历访问上限（防御面：巨树不空转）。 */
export const FILE_LIST_LIMIT = 50
export const FILE_SCAN_LIMIT = 4000

/** 遍历忽略目录（§3.11(6) 逐值——其余目录一律扫）。 */
const IGNORED_DIRS = new Set(["node_modules", ".git"])

/** 复合 id / 裸号 ⇒ 槽号（`<workspaceId>:<槽号>` 容错——服务器的归属校验在其侧；盒只取尾号）。 */
export function slotOf(sessionId) {
  if (typeof sessionId === "number" && Number.isInteger(sessionId) && sessionId >= 1) return sessionId
  const m = /(?:^|:)(\d+)$/.exec(String(sessionId ?? "").trim())
  const n = m ? Number(m[1]) : NaN
  return Number.isInteger(n) && n >= 1 ? n : null
}

/** 配置桥①：核默认配置 ⇒ 覆写 provider 面 = 盒 env（server 网关；`OPENAI_BASE_URL`/`OPENAI_API_KEY`）。 */
export function withBoxProvider(config, env) {
  const entry = {
    name: BOX_PROVIDER,
    baseURL: String(env.OPENAI_BASE_URL ?? "").replace(/\/+$/, ""),
    apiKey: env.OPENAI_API_KEY ?? "",
  }
  config.providers = [entry]
  config.providersList = config.providers
  config.provider = { ...entry } // 核 loadConfig 语义 = 独立拷贝（PROVIDER.md 既有形）
  config.defaultModel = null // 模型身份 = 会话槽选定（渠道单值模型退场）
  config.providerState = "ok"
  config.providerStateReason = null
  config.providerInvalidReason = null
  return config
}

/** 工具失败判据（镜像 `thincoder-render-core/lib.mjs` `isToolFailure`——两行同判据；
 *  渲染核不件位于盒镜像（件位契约 = 核 + 壳），故此镜像；网页侧仍以渲染核原文判定为准）。 */
export function isToolFailureText(text) {
  const t = String(text ?? "").trim()
  if (!t) return false
  if (/^Error[:：]/.test(t)) return true
  return t.split("\n").some((line) => /^\((?:exit code (\d+)|killed: (.+)|spawn failed)\)$/.test(line.trim()))
}

/** 内容取文（字符串 ∥ parts 数组——图块跳过；核槽 history 的 content 两形）。 */
function textOf(content) {
  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    return content.filter((b) => b?.type === "text").map((b) => String(b.text ?? "")).join("\n")
  }
  return ""
}

/** 槽工作模式读面：合法 mode 优先，旧槽才读 engineering 布尔。 */
export function workModeOf(data) {
  if (WORK_MODES.includes(data?.mode)) return data.mode
  return data?.engineering === true ? "engineering" : "normal"
}

/** 会话控件读面；engineering 与残留 PLAN 的半状态在投影层收正。 */
export function flagsOf(data) {
  const mode = workModeOf(data)
  return {
    autoApprove: data?.autoApprove === true,
    planMode: mode !== "engineering" && data?.planMode === true,
    advisorGuard: data?.advisor?.guard === true,
    mode,
  }
}

/**
 * 回合尾控制字段合并（纯函数）：起跑快照 agent 的槽控制字段落后于忙期 PATCH（mode/plan/auto/
 * advisor/model/effort/title 皆经槽写面直落盘）——`saveSession(agent)` 原样写会把忙期新值盖回
 * 起跑旧值。此函数把盘上最新控制值并回 agent（**只并控制字段**——history/_fullHistory/记录存储
 * 一律不动 ⇒ 当回合历史不丢）。盒内回合（runAgent）不写控制字段（零自动标题 ∥ 零 /eng·/plan 件），
 * 故盘面即真源。
 */
export function mergeSlotControl(agent, data) {
  if (!agent || !data || typeof data !== "object") return agent
  agent.config ??= {}
  agent.config.agent ??= {}
  // 模型身份（槽双字段；`setSlotPrefs` 换模型写 `activeProvider`/`activeModel`）
  if (typeof data.activeProvider === "string" && data.activeProvider !== "") agent.activeProvider = data.activeProvider
  if (typeof data.activeModel === "string" && data.activeModel !== "") {
    agent.activeModel = data.activeModel
    if (agent.provider && typeof agent.provider === "object") agent.provider.model = data.activeModel
  }
  // 工作模式（单源：合法 mode 优先，旧 engineering 布尔回落；盘面无 mode 信息 ⇒ 不动现行值）
  if (WORK_MODES.includes(data.mode)) {
    agent.config.agent.mode = data.mode
    agent.config.agent.engineering = data.mode === "engineering"
  } else if (data.engineering !== undefined) {
    agent.config.agent.mode = data.engineering === true ? "engineering" : "normal"
    agent.config.agent.engineering = data.engineering === true
  }
  // 三布尔开关（槽规范结构恒有 planMode/autoApprove；advisor 守卫空 ⇒ 不落）
  if (Object.hasOwn(data, "planMode")) agent.planMode = data.planMode === true
  if (Object.hasOwn(data, "autoApprove")) agent.autoApprove = data.autoApprove === true
  if (data.advisor && typeof data.advisor === "object") agent.config.advisor = { ...data.advisor }
  // 标题（盒内回合零自动标题——盘面 = 起跑值 ∥ 忙期重命名新值，皆真源）
  if (typeof data.title === "string") agent.title = data.title
  // 会话级档位（§6.21 判据句 5 保存面——`_slotEffort` 原样携带：键在 ⇒ 原样，缺键 ⇒ undefined 不落盘）
  agent._slotEffort = Object.hasOwn(data, "effort") ? (data.effort ?? null) : undefined
  return agent
}

/** 读史投射：核槽 `history`（人读线）⇒ 展示行集（role 四值面取三值——notice 无源不造）。
 *  `data` 按 role 同 `gateway/API.md` §2.8：assistant 携 `toolCalls` ∥ tool 携 `toolCallId`/`name`/`ok`/`summary`
 *  （member-face-parity 批扩 `content` = 全文——截断单源 = `MAX_TOOL_OUTPUT`，活流/回读同径 §3.11(6)）。 */
export function projectMessages(data) {
  const history = Array.isArray(data?.history) ? data.history : []
  const rows = []
  let seq = 0
  for (const m of history) {
    if (!m || typeof m !== "object") continue
    const role = m.role
    if (role !== "user" && role !== "assistant" && role !== "tool") continue
    seq += 1
    const content = textOf(m.content)
    let rowData = null
    if (role === "assistant" && Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
      rowData = {
        toolCalls: m.tool_calls.map((tc) => ({
          id: tc?.id ?? "",
          name: tc?.function?.name ?? "",
          args: tc?.function?.arguments ?? "",
        })),
      }
    } else if (role === "tool") {
      rowData = {
        toolCallId: m.tool_call_id ?? null,
        name: m.name ?? null,
        ok: !isToolFailureText(content),
        summary: capText(content, RESULT_SUMMARY_MAX),
        content: capText(content, MAX_TOOL_OUTPUT),
      }
    }
    rows.push({ seq, role, content, data: rowData, createdAt: m.ts ?? null })
  }
  return rows
}

/** 首条真实用户消息（excerpt 源——≤40 字；无 ⇒ 空串）。`[System reminder:` 行按核读面单源
 *  `isRealUserMsg`（`thincoder-core/history-window.mjs`）同判跳过——提醒行不算首条用户消息。 */
export function excerptOf(data) {
  const history = Array.isArray(data?.history) ? data.history : []
  for (const m of history) {
    if (m?.role !== "user") continue
    const text = textOf(m.content)
    if (text.startsWith("[System reminder:")) continue
    return capText(text, 40)
  }
  return ""
}

/** 工作区根遍历（`files.list` 指令——§3.11(6)）：忽略 `node_modules`/`.git`，`q` 在场 ⇒ 径/名子串过滤
 *  （大小写无关）；出 = `[{ name, path }]`（相对径——`@` 引用原文），≤ `FILE_LIST_LIMIT` 行；坏目录跳过。 */
export function listFilesOf(cwd, { q = "", limit = FILE_LIST_LIMIT, scanLimit = FILE_SCAN_LIMIT } = {}) {
  const needle = String(q ?? "").trim().toLowerCase()
  const queue = [""]
  const files = []
  let scanned = 0
  while (queue.length > 0 && files.length < limit && scanned < scanLimit) {
    const rel = queue.shift()
    let entries
    try {
      entries = readdirSync(rel === "" ? cwd : join(cwd, rel), { withFileTypes: true })
    } catch {
      continue // 不可读目录 ⇒ 跳过（权限/竞态——零抛）
    }
    for (const entry of entries) {
      if (scanned >= scanLimit || files.length >= limit) break
      scanned += 1
      const path = rel === "" ? entry.name : `${rel}/${entry.name}`
      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name) || entry.isSymbolicLink()) continue
        queue.push(path)
        continue
      }
      if (!entry.isFile()) continue
      if (needle !== "" && !path.toLowerCase().includes(needle)) continue
      files.push({ name: entry.name, path })
    }
  }
  return files
}
