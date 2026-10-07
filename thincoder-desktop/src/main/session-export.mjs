/**
 * session-export.mjs — 会话导出（Markdown · fork 2026-10-07 —— 会话条导出钮数据面）。
 *
 * 职责：整会话读（核 `loadSlotFile` 单源 —— **一次读全量**，零翻页）→ 人读线窗口（核 `historyWindow`
 * 全窗投影 —— 与 `history:page` 同形同源，可见性谓词零副本）→ Markdown 拼装（纯函数可直测）。
 * 收录面（**v2 定形 —— 用户裁定「只导正文」** 2026-10-07：v1 逐帧出段产出 659 个标题 ∕ 大量空段——
 * 工作过程帧 ∕ 旁白帧全成了节）：**每轮一问一答** = 用户消息 + 本轮**最后一条非空** assistant 正文
 * （轮尾最终正文——`chat-work.mjs` 轮组同语义）；思考链 ∕ 工具调用 ∕ 子代理留档 ∕ 消化记录 ∕
 * 错误行 ∕ 中途旁白帧**全不收录**；段间零分隔线零时间戳（人读文档最小面）。
 * **隔离形（禁令）= 零 `electron` import**（先例 `heap-watch.mjs` ∕ `usage-log.mjs` —— 平 node 可 import 直测；
 * 保存对话框归 `ipc.mjs` 处理体，本档零 UI）。
 */
import { historyWindow } from "@thincoder/core/history-window.mjs"
import { loadSlotFile } from "@thincoder/core/session.mjs"
import { slotOfKey } from "./session-slots.mjs"

/** 非法文件名字符（Windows 保留集 —— `\ / : * ? " < > |`）→ `_`；控制字符同清。 */
const UNSAFE_NAME = /[\\/:*?"<>|\u0000-\u001f]/g

/** 文件名净化：非法字符折叠 ∕ 首尾空白点修剪 ∕ 长度夹 60 ∕ 空 ⇒ `session`。 */
export function sanitizeFileName(name) {
  const cleaned = String(name ?? "").replace(UNSAFE_NAME, "_").replace(/^[\s.]+|[\s.]+$/g, "").slice(0, 60).trim()
  return cleaned === "" ? "session" : cleaned
}

/** 本地时区 `YYYY-MM-DD`（默认文件名前缀 —— 与用量段 `dayKeyOf` 同式独立实现）。 */
const datePrefix = (date = new Date()) => {
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${m}-${d}`
}

/** 保存对话框默认文件名：`YYYY-MM-DD-<标题>.md`（标题截 24 字 —— 文件名可读，文档内标题仍全量）。 */
export function exportFileName(title, date = new Date()) {
  return `${datePrefix(date)}-${sanitizeFileName(String(title ?? "").slice(0, 24))}.md`
}

/** 单段修剪：剥首尾空白（段内原文保留 —— 零再加工）。 */
const asBlock = (text) => String(text ?? "").trim()

/**
 * Markdown 拼装（**纯函数**）：`{ title, cwd, messages }` → 文档串。
 * **轮折叠**：扫人读线——用户消息 = 开新轮（前轮挂起的 assistant 正文先落段）；assistant 帧 = 挂起
 * 正文覆写（**最后一条非空胜出** = 轮尾最终正文）；其余形（空帧 ∕ 错误 ∕ 工具 ∕ 留档）零贡献。
 * 文档 = `# 标题` + 引注行（N 轮对话）+ 逐轮 `## 用户 ∕ ## ThinCoder` 两段，零分隔线零时间戳。
 */
export function buildMarkdown({ title, cwd, messages }) {
  const list = Array.isArray(messages) ? messages : []
  const turns = []
  let pending = null
  const flush = () => {
    if (pending !== null) {
      turns.push({ role: "ThinCoder", text: pending })
      pending = null
    }
  }
  for (const msg of list) {
    if (msg?.kind === "user") {
      const text = asBlock(msg.text)
      if (text === "") continue
      flush()
      turns.push({ role: "用户", text })
    } else if (msg?.kind === "assistant") {
      const text = asBlock(msg.text)
      if (text !== "") pending = text
    }
  }
  flush()
  if (turns.length === 0) return ""
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const exportedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const userTurns = turns.filter((turn) => turn.role === "用户").length
  const head = [
    `# ${String(title ?? "").trim() === "" ? "会话" : title}`,
    "",
    `> 导出自 ThinCoder${typeof cwd === "string" && cwd !== "" ? ` · 项目 \`${cwd}\`` : ""} · ${exportedAt} · ${userTurns} 轮对话（正文）`,
    "",
  ]
  const body = []
  for (const turn of turns) {
    body.push(`## ${turn.role}`, "", turn.text, "")
  }
  return `${head.join("\n")}\n${body.join("\n")}`
}

/**
 * 整会话导出读面：`(cwd, key)` ⇒ `{ ok, title, markdown, count }` ∥ `{ ok:false, reason }`
 * （reason 闭集 = `bad-key` ∕ `slot-missing` ∕ `empty`）。历史窗口 = 核 `historyWindow` **全窗**一次出
 * （pageSize = 全长 —— 与 `history:page` 同形投影 ∕ 同源谓词，零算法副本）。
 */
export function sessionToMarkdown(cwd, key) {
  const slot = slotOfKey(key)
  if (slot === null) return { ok: false, reason: "bad-key" }
  const data = loadSlotFile(cwd, slot)
  if (!data) return { ok: false, reason: "slot-missing" }
  const history = Array.isArray(data.history) ? data.history : []
  if (history.length === 0) return { ok: false, reason: "empty" }
  const { messages } = historyWindow(history, null, history.length)
  // 标题兜底（核 `ensureSessionTitle` 同律）：title 空 ⇒ 首条用户消息单行截 40 字（文件名可读）。
  const firstUser = messages.find((msg) => msg?.kind === "user" && typeof msg.text === "string" && msg.text.trim() !== "")
  const fallbackTitle = firstUser === undefined ? "会话" : String(firstUser.text).replace(/\s+/g, " ").trim().slice(0, 40)
  const title = typeof data.title === "string" && data.title !== "" ? data.title : fallbackTitle
  if (messages.length === 0) return { ok: false, reason: "empty" }
  const markdown = buildMarkdown({ title, cwd, messages })
  if (markdown === "") return { ok: false, reason: "empty" }
  // 轮数 = 用户段数（正文内助手自带的 `## ` 标题不算 —— `## 用户` 前缀锚定）。
  const turns = (markdown.match(/^## 用户/gm) ?? []).length
  return { ok: true, title, markdown, count: turns }
}
