/**
 * chat-store.mjs — 管理面 chat **库面**（`agent/ADMIN-AGENT.md` §11 ∥ KD-SV-89——v14 两表单源；admin-agent-awareness 批拆档，
 * 台账 #1310：`chat.mjs` 越 §6 预案触发线 ⇒ 库面段抽出；**机械搬运 + 重导出**，行为零改）。
 *
 * 面 = 会话行/消息序**读写**（读时读，无后台常驻）∥ 行形展平（`chatView` ∥ `messageView`）∥ 两条库面常量
 * （`CHAT_ROLES` = 库 CHECK 镜像 ∥ `CHAT_EXCERPT_MAX` = 列表 `excerpt` 上限）∥ `data_json` 解码助手 `parseJson`
 * （聊天面 `replayMessages` 同用 ⇒ 导出）。
 * **依赖方向单源**：唯一方向 = `chat.mjs` → 本档（本档零反引——不 import `chat.mjs`；零循环）。回合环 ∥ 帧流 ∥ 环境块 ∥
 * 工具面 ∥ 在途门 ∥ 重放编解码 = `chat.mjs` 面（本档只出库面）。
 * 导出面经 `chat.mjs` 重导出（既有导入方零改——含单元测试档经 `CHAT.CHAT_EXCERPT_MAX` 的命名空间取法）。
 * 会话历史读面（§16.1 ∥ KD-SV-131——server-wake-face 批 · 修订轮）：`recordStoreOf(db, chatId)` = 核件
 * `read_history` 的 `_recordStore` 注入面（库面单源——行 ⇒ 核记录形；本档只出读面，不过写）。
 */
import { HttpError } from "../gateway/errors.mjs"

/** 消息角色（库 CHECK 四值——v14 段；notice = 回放滤除的收尾行）。 */
export const CHAT_ROLES = Object.freeze(["user", "assistant", "tool", "notice"])
/** 会话列表 `excerpt` 上限（首条用户消息截断——`gateway/API.md` §2.8）。 */
export const CHAT_EXCERPT_MAX = 40

/** `data_json` 解码（对象形——坏 JSON ∥ 非对象 ⇒ `fallback`）。 */
export function parseJson(text, fallback = null) {
  try {
    const value = JSON.parse(text ?? "")
    return value === null || typeof value !== "object" ? fallback : value
  } catch {
    return fallback
  }
}

// ── 库面（会话 ∥ 消息序——v14 两表；读时读，无后台常驻）───────────────────────

/** 会话行 or 404（`not_found`）。 */
export function chatRowOr404(db, id) {
  const row = db.prepare("SELECT * FROM agent_chats WHERE id = ?").get(Number(id))
  if (!row) throw new HttpError("not_found", `会话不存在：${String(id)}`)
  return row
}

/** 会话读数（§2.8 行形——`excerpt` = 首条用户消息截断 ≤40 字；无消息 ⇒ 空串）。 */
export function chatView(db, row) {
  const first = db.prepare("SELECT content FROM agent_chat_messages WHERE chat_id = ? AND role = 'user' ORDER BY seq LIMIT 1").get(row.id)
  const content = typeof first?.content === "string" ? first.content : ""
  return {
    id: row.id,
    model: row.model,
    reasoning: row.reasoning ?? null, // 会话级思考档位（v16——`null` = 未设；KD-SV-110）
    autoApprove: row.auto_approve === 1, // 审批免问旗（v25——`always` ∥ PATCH 两写径；KD-SV-226）
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    excerpt: content.length > CHAT_EXCERPT_MAX ? content.slice(0, CHAT_EXCERPT_MAX) : content,
  }
}

/** 会话列表（倒序——新在前）。 */
export function listChats(db, { limit = 100 } = {}) {
  const rows = db.prepare("SELECT * FROM agent_chats ORDER BY id DESC LIMIT ?").all(Number(limit))
  return { chats: rows.map((row) => chatView(db, row)) }
}

/** 图片轮附加形（KD-SV-109——dataURL 数组 ⇒ parts 数组素形；空 ⇒ `null` 零键）。 */
export function imagePartsOf(images = []) {
  const list = Array.isArray(images) ? images : []
  if (list.length === 0) return null
  return { imageParts: list.map((url) => ({ type: "image_url", image_url: { url: String(url) } })) }
}

/** 消息读数（§2.8 行形；`data` = 附加形解码——**图片只出计数**（user 行 `imageCount`——dataURL 零下发）∥ 序 = `seq` 升序）。 */
export function messageView(row) {
  const data = parseJson(row.data_json, null)
  if (row.role === "user" && Array.isArray(data?.imageParts)) {
    return { seq: row.seq, role: row.role, content: row.content, data: { imageCount: data.imageParts.length }, createdAt: row.created_at }
  }
  return {
    seq: row.seq,
    role: row.role,
    content: row.content,
    data,
    createdAt: row.created_at,
  }
}

/** 消息全量（seq 升序）。 */
export function listMessages(db, chatId) {
  return db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(Number(chatId))
}

/** 会话详情（`{ chat, messages }`——不存在 ⇒ null）。 */
export function getChatDetail(db, id) {
  const row = db.prepare("SELECT * FROM agent_chats WHERE id = ?").get(Number(id))
  if (!row) return null
  return { chat: chatView(db, row), messages: listMessages(db, row.id).map(messageView) }
}

/** 建会话（`model` 合法性归路由面——KD-SV-87 同判）：出 = 会话行。 */
export function createChat(db, { model, createdBy = null, now = Date.now } = {}) {
  const ts = new Date(now()).toISOString()
  const info = db.prepare("INSERT INTO agent_chats (model, status, created_by, created_at, updated_at) VALUES (?, 'idle', ?, ?, ?)").run(String(model), createdBy, ts, ts)
  return db.prepare("SELECT * FROM agent_chats WHERE id = ?").get(Number(info.lastInsertRowid))
}

/** 追加一条消息（`seq` = 会话内自增——逐条增量落库）。出 = 行。 */
export function appendMessage(db, chatId, { role, content = "", data = null, now = Date.now } = {}) {
  if (!CHAT_ROLES.includes(role)) throw new Error(`消息角色非法：${String(role)}（${CHAT_ROLES.join(" ∥ ")}）`)
  const ts = new Date(now()).toISOString()
  const info = db
    .prepare(
      `INSERT INTO agent_chat_messages (chat_id, seq, role, content, data_json, created_at)
       VALUES (?, (SELECT COALESCE(MAX(seq), 0) + 1 FROM agent_chat_messages WHERE chat_id = ?), ?, ?, ?, ?)`,
    )
    .run(Number(chatId), Number(chatId), role, String(content ?? ""), data === null ? null : JSON.stringify(data), ts)
  db.prepare("UPDATE agent_chats SET updated_at = ? WHERE id = ?").run(ts, Number(chatId))
  return db.prepare("SELECT * FROM agent_chat_messages WHERE id = ?").get(Number(info.lastInsertRowid))
}

// ── 会话历史记录面（§16.1——核件 `read_history` 的 `_recordStore` 注入面；库面单源）──────────────

/** 回放/记录面 `function.arguments` 净化（2026-10-14 缺陷修——轻通道轮）：存量坏行（旧版截断残 JSON）⇒ `"{}"` 兜底；
 *  合法 JSON 串 ⇒ 原样逐字（回放逐值面零变）；非串 ⇒ 既有 `JSON.stringify` 形。 */
function replayArgsOf(value) {
  if (typeof value !== "string") return JSON.stringify(value ?? {})
  try { JSON.parse(value); return value } catch { return "{}" }
}

/** 行 ⇒ 核记录形（§16.1 逐形）：`user`/`notice` ⇒ `{ role, content, ts }` ∥ `assistant`（携 `toolCalls`）⇒
 *  `{ role, content, ts, tool_calls }` ∥ `tool` ⇒ `{ role, name, tool_call_id, content, ts }`；
 *  `ts` = `created_at` 解析毫秒（解析失败 ⇒ 该键缺席——核件作 `ts:null` 读，时间窗永不命中）。 */
function recordOfRow(row) {
  const ts = Date.parse(row.created_at)
  const base = { role: row.role, content: row.content }
  if (Number.isFinite(ts)) base.ts = ts
  if (row.role === "assistant") {
    const data = parseJson(row.data_json, null)
    const calls = Array.isArray(data?.toolCalls) ? data.toolCalls : [] // 重建形（同 `replayMessages` 口径）
    if (calls.length > 0) {
      base.tool_calls = calls.map((call) => ({
        id: call.id,
        type: "function",
        function: { name: call.name, arguments: replayArgsOf(call.args) },
      }))
    }
    return base
  }
  if (row.role === "tool") {
    const data = parseJson(row.data_json, null)
    return { ...base, name: data?.name ?? "", tool_call_id: data?.toolCallId ?? "" }
  }
  return base
}

/** 记录存储（§16.1——`pad._recordStore` 取值面）：`iterate(direction)` 生成器逐行出记录形
 *  （`newest` = 自尾向前——核件按方向取 limit 窗，输出自身反转回时间序；`oldest` = 自首向后）。 */
export function recordStoreOf(db, chatId) {
  const id = Number(chatId)
  return {
    *iterate(direction = "newest") {
      const order = direction === "oldest" ? "ASC" : "DESC"
      const rows = db.prepare(`SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq ${order}`).all(id)
      for (const row of rows) yield recordOfRow(row)
    },
  }
}

// ── 回放面（§11/KD-SV-89 ∥ §17.3 A3——库行 ⇒ 模型消息数组；压缩标记解析归此）────────────────────

/** 压缩标记行判定（§17.3 A3——落库形：`role="user"` ∥ `data.kind="compaction"` ∥ `data.covers=[seq首, seq尾]`）。
 *  出 = `[seq首, seq尾]` ∥ `null`（非标记行 ∥ 形不正——坏行按普通行回放，零误吞）。 */
export function compactionCoversOf(row) {
  if (row?.role !== "user") return null
  const data = parseJson(row.data_json, null)
  if (data?.kind !== "compaction") return null
  const covers = data.covers
  if (!Array.isArray(covers) || covers.length !== 2) return null
  const [from, to] = covers.map(Number)
  if (!Number.isInteger(from) || !Number.isInteger(to) || from > to) return null
  return [from, to]
}

/** 行 ⇒ 消息（§11 ∥ §17.3 A1 逐值重建）：`user`（含图 parts——KD-SV-109）∥ `assistant`（携 `toolCalls` ⇒ 回灌形：
 *  `data.reasoning` ⇒ `reasoning_content`（`""` 亦回插——回声族「缺值 ⇒ `""`」落库面同值）∥ `data.toolCalls[].extraContent`
 *  ⇒ `extra_content`（在场才带）；空文本 ⇒ `content: null`——核件构造同式）∥ `tool`；`notice` ⇒ `null`（滤除）。 */
function messageOfRow(row) {
  if (row.role === "user") {
    const data = parseJson(row.data_json, null)
    const parts = Array.isArray(data?.imageParts) ? data.imageParts : []
    // 图片轮 ⇒ `content` 数组（文本素 + parts——KD-SV-109）；无图轮恒字符串形（存量零变）
    return parts.length === 0
      ? { role: "user", content: row.content }
      : { role: "user", content: [{ type: "text", text: row.content }, ...parts] }
  }
  if (row.role === "assistant") {
    const data = parseJson(row.data_json, null)
    const calls = Array.isArray(data?.toolCalls) ? data.toolCalls : []
    if (calls.length > 0) {
      return {
        role: "assistant",
        content: row.content || null, // 核件构造（§17.3 A1）同式：空文本归 `null`
        tool_calls: calls.map((call) => ({
          id: call.id,
          type: "function",
          function: { name: call.name, arguments: replayArgsOf(call.args) },
          ...(call.extraContent ? { extra_content: call.extraContent } : {}), // 假值按「不在场」归一（与核件真值判同式）
        })),
        ...(typeof data.reasoning === "string" ? { reasoning_content: data.reasoning } : {}),
      }
    }
    return { role: "assistant", content: row.content }
  }
  if (row.role === "tool") {
    const data = parseJson(row.data_json, null)
    return { role: "tool", tool_call_id: data?.toolCallId ?? "", content: row.content }
  }
  return null // notice ⇒ 滤除（收尾行不入模型上下文——§11）
}

/**
 * 回放条目（§11/§17.3 A3——库行 ⇒ `{ message, seq, covers }` 有序数组）：
 * ① **覆盖区间以标记行代**——标记行 `covers` 内各行跳过，标记行内容（压缩产物原文）在区间前沿出 `user` 消息；
 *    嵌套标记自然消解（先标记行落于后标记 `covers` 区间 ⇒ 随覆盖跳过，其注记由后标记统一代表）；
 * ② `seq` = 源行 seq（标记条目 = 标记行自身 seq——压缩覆盖映射用）；`covers` = 标记条目的覆盖区间（普通行 `null`）。
 */
export function replayEntriesOf(rows = []) {
  const marks = []
  for (const row of rows) {
    const covers = compactionCoversOf(row)
    if (covers !== null) marks.push({ row, covers })
  }
  const covered = new Set()
  for (const mark of marks) for (let seq = mark.covers[0]; seq <= mark.covers[1]; seq++) covered.add(seq)
  const active = marks.filter((mark) => !covered.has(mark.row.seq)) // 嵌套 ⇒ 消解（先标记行入后标记覆盖集）
  active.sort((a, b) => a.covers[0] - b.covers[0] || a.row.seq - b.row.seq) // 区间前沿序（映射面对齐）
  const entries = []
  let mi = 0
  const emitMark = () => {
    const mark = active[mi]
    entries.push({ message: { role: "user", content: mark.row.content }, seq: mark.row.seq, covers: mark.covers })
    mi += 1
  }
  for (const row of rows) {
    while (mi < active.length && row.seq > active[mi].covers[0]) emitMark() // 区间前沿 ⇒ 以标记代段
    if (covered.has(row.seq) || compactionCoversOf(row) !== null) continue
    const message = messageOfRow(row)
    if (message !== null) entries.push({ message, seq: row.seq, covers: null })
  }
  while (mi < active.length) emitMark() // 兜底（覆盖区间延至日志尾——正常不可达）
  return entries
}

/** 历史重放（§11/KD-SV-89）：库行 ⇒ 模型消息数组（**notice 滤除**；压缩会话以标记行代覆盖段——§17.3 A3）。 */
export function replayMessages(rows = []) {
  return replayEntriesOf(rows).map((entry) => entry.message)
}

