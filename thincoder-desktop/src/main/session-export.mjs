/**
 * session-export.mjs — 会话导出（Markdown · fork 2026-10-07 —— 会话条导出钮数据面）。
 *
 * 职责：整会话读（核 `loadSlotFile` 单源 —— **一次读全量**，零翻页）→ 人读线窗口（核 `historyWindow`
 * 全窗投影 —— 与 `history:page` 同形同源，可见性谓词零副本）→ Markdown 拼装（纯函数可直测）。
 * 收录面（v1）：**用户 ∕ ThinCoder 正文** + 思考链（`<details>` 折叠块）+ 错误行（引用块）；
 * 工具调用 ∕ 子代理留档 ∕ 消化记录**不收录**（面向人读文档，机器噪声零价值）。
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

/** 保存对话框默认文件名：`YYYY-MM-DD-<标题>.md`。 */
export function exportFileName(title, date = new Date()) {
  return `${datePrefix(date)}-${sanitizeFileName(title)}.md`
}

/** 时间戳显示（本地 `YYYY-MM-DD HH:mm`；缺 ∕ 非数 ⇒ `null` —— 零假造）。 */
function formatTs(ms) {
  if (!Number.isFinite(ms) || ms <= 0) return null
  const d = new Date(ms)
  const pad = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 单段转义：md 语义字符最少处理（正文原样保留 —— 零再加工；仅剥尾部多余空行）。 */
const asBlock = (text) => String(text ?? "").replace(/\s+$/, "")

/** 思考折叠块（GFM `<details>` —— GitHub ∕ 常见阅读器可折叠；空 ⇒ `null` 零节点）。 */
function reasoningBlock(reasoning) {
  const body = asBlock(reasoning)
  if (body === "") return null
  return `<details>\n<summary>思考</summary>\n\n${body}\n\n</details>`
}

/**
 * Markdown 拼装（**纯函数**）：`{ title, cwd, messages }` → 文档串。
 * 结构 = `# 标题` + 引注行（导出源 ∕ 项目 ∕ 时间 ∕ 条数）+ 逐消息 `## 用户 ∕ ## ThinCoder` 段
 * （时间戳在场则随标题行；思考链折叠块随段尾；错误行 `>` 引用）。
 */
export function buildMarkdown({ title, cwd, messages }) {
  const list = Array.isArray(messages) ? messages : []
  const now = new Date()
  const pad = (n) => String(n).padStart(2, "0")
  const exportedAt = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`
  const head = [
    `# ${String(title ?? "").trim() === "" ? "会话" : title}`,
    "",
    `> 导出自 ThinCoder${typeof cwd === "string" && cwd !== "" ? ` · 项目 \`${cwd}\`` : ""} · ${exportedAt} · ${list.length} 条消息`,
    "",
  ]
  const body = []
  for (const msg of list) {
    const at = formatTs(msg?.timestamp)
    if (msg?.kind === "user") {
      body.push("", "---", "", `## 用户${at === null ? "" : ` · ${at}`}`, "", asBlock(msg.text))
    } else if (msg?.kind === "assistant") {
      body.push("", "---", "", `## ThinCoder${at === null ? "" : ` · ${at}`}`, "")
      const text = asBlock(msg.text)
      if (text !== "") body.push(text)
      const reasoning = reasoningBlock(msg.reasoning)
      if (reasoning !== null) body.push("", reasoning)
    } else if (msg?.kind === "error") {
      body.push("", "---", "", `> ⚠ ${asBlock(msg.text)}`)
    }
    // tool ∕ subagent ∕ digest ∕ 未知形：不收录（见档头收录面）。
  }
  return `${head.join("\n")}${body.join("\n")}\n`
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
  const exported = messages.filter((msg) => msg?.kind === "user" || msg?.kind === "assistant" || msg?.kind === "error")
  if (exported.length === 0) return { ok: false, reason: "empty" }
  return { ok: true, title, markdown: buildMarkdown({ title, cwd, messages }), count: exported.length }
}
