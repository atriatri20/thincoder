/**
 * protocol.mjs — 盒接入协议帧编解码（member-face-chat 批 · 盒壳）
 *
 * 单源 = `agent/MEMBER-AGENT.md` §3.3（下行 SSE 六事件 ∥ 上行 NDJSON 帧流）+ `gateway/API.md`
 * §2.8/§2.12（帧词表六帧）。本档 = 纯函数腿（零 I/O、零 core 依赖）——帧形逐字在此成文，
 * 其余各档只经本档构造 / 解析，不得自拼帧面。
 *
 * 下行（server → 盒）`GET /api/box/events`（SSE）：
 *   hello { serverTime, redeliver:[cmdId…] } ∥ run { cmdId, sessionId, content } ∥
 *   abort { cmdId, sessionId } ∥ pull { cmdId, url, dir } ∥ cmd { cmdId, kind, args } ∥ ping {}
 * 上行（盒 → server）：
 *   `POST /api/box/sessions/:id/turns` 体 = NDJSON 帧流：begin { cmdId } ⇒ 六帧词表 ⇒ end
 *   六帧 = delta ∥ call ∥ result ∥ turn ∥ usage ∥ end（`agent/ADMIN-AGENT.md` §11.3 同源）；
 *   本面增补 = begin 帧 + `end.reason` 新值 `box_lost`（box_lost 由 server 侧合成——盒只中止本地回合）。
 *   两处加宽（§3.3）：`call.args` ∥ `result.content` 携全文——掩蔽/截断（args ≤500 ∥ 摘要 ≤300）
 *   在 server 转发浏览器前执行（盒无掩蔽表——不在本侧做）。
 */

/** 下行 SSE 事件名（§3.3 事件表——逐值）。 */
export const SSE_EVENTS = ["hello", "run", "abort", "pull", "cmd", "ping"]

/** 上行帧型（begin + 六帧词表——§11.3 同源）。 */
export const FRAME_TYPES = ["begin", "delta", "call", "result", "turn", "usage", "end"]

/** 管理面同源常量（`gateway/API.md` §2.8 / `agent/ADMIN-AGENT.md` §11——值 = 展示面口径）。 */
export const CALL_ARGS_MAX = 500
export const RESULT_SUMMARY_MAX = 300

// ========== SSE（下行）==========

/** SSE 事件编码（server 侧同形参考——盒侧用于测试桩与自证；`data` 恒 JSON 单行）。 */
export function encodeSseEvent(name, data) {
  return `event: ${name}\ndata: ${JSON.stringify(data ?? {})}\n\n`
}

/** NS 增量解析器：`push(chunk)` ⇒ 本次块中已完结的事件 [{ event, data }]。
 *  分块安全（跨块残行留住）；容 CRLF；`:` 注释行与空行按 SSE 规约忽略；
 *  data 逐行拼接后 JSON 解析——解析失败 ⇒ 原文串（不静默丢——调用侧可判）。 */
export function createSseParser() {
  let buffer = ""
  return {
    push(chunk) {
      buffer += String(chunk ?? "")
      const events = []
      // 事件块分隔 = 空行（\n\n；CRLF 归一后同判）
      let idx
      while ((idx = buffer.search(/\r?\n\r?\n/)) !== -1) {
        const block = buffer.slice(0, idx)
        buffer = buffer.slice(idx + (buffer[idx] === "\r" ? 4 : 2))
        const evt = parseSseBlock(block)
        if (evt) events.push(evt)
      }
      return events
    },
    /** 流终结时冲刷残块（无尾空行的末事件——宽容面）。 */
    flush() {
      const rest = buffer.trim()
      buffer = ""
      const evt = rest ? parseSseBlock(rest) : null
      return evt ? [evt] : []
    },
  }
}

/** 单块 → { event, data }：无 `event:` 行 ⇒ 缺省 `message`（SSE 规约）；无 `data:` 行 ⇒ null。 */
function parseSseBlock(block) {
  let name = "message"
  const dataLines = []
  for (const raw of block.split(/\r?\n/)) {
    const line = raw
    if (line === "" || line.startsWith(":")) continue
    const colon = line.indexOf(":")
    const field = colon === -1 ? line : line.slice(0, colon)
    let value = colon === -1 ? "" : line.slice(colon + 1)
    if (value.startsWith(" ")) value = value.slice(1)
    if (field === "event") name = value
    else if (field === "data") dataLines.push(value)
  }
  if (dataLines.length === 0) return null
  const text = dataLines.join("\n")
  let data = text
  try {
    data = JSON.parse(text)
  } catch {
    /* 非 JSON 体按原文串——调用侧判形 */
  }
  return { event: name, data }
}

// ========== 上行 NDJSON（帧流）==========

/** 帧编码：一行一帧（`application/x-ndjson`）。 */
export function encodeFrame(frame) {
  return `${JSON.stringify(frame)}\n`
}

/** 帧行解析：坏行 / 非对象 / 无 type ⇒ null（与网页侧 `parseFrame` 同判据）。 */
export function parseFrameLine(line) {
  if (typeof line !== "string" || line.trim() === "") return null
  let frame = null
  try {
    frame = JSON.parse(line)
  } catch {
    return null
  }
  if (frame === null || typeof frame !== "object" || typeof frame.type !== "string") return null
  return frame
}

// ========== 帧构造器（形单源）==========

/** 回合起始帧（§3.3 本面增补）：`begin { cmdId }` —— 上行流首行。 */
export function beginFrame(cmdId) {
  return { type: "begin", cmdId }
}

/** 模型文本增量。 */
export function deltaFrame(text) {
  return { type: "delta", text: String(text ?? "") }
}

/** 工具调用开始：`args` = JSON 字符串（加宽全文——server 转发前掩蔽/截断 ≤500）。 */
export function callFrame({ id, name, args }) {
  return { type: "call", id, name, args: typeof args === "string" ? args : JSON.stringify(args ?? {}) }
}

/** 工具结果：`summary` = 短形（≤300——盒侧先cap）∥ `content` = 全文（加宽——server 另行掩蔽/截断）。 */
export function resultFrame({ id, ok, summary, content }) {
  return { type: "result", id, ok: ok === true, summary: String(summary ?? ""), content: String(content ?? "") }
}

/** 每次模型调用前（n = 本回合第 n 次调用——状态行/分步界双职帧）。 */
export function turnFrame(n) {
  return { type: "turn", n }
}

/** 每次模型调用返回且 usage 在场（缺 ⇒ 零帧——有源才发）；源 = 核 usage 四读（蛇形 → 驼形）。 */
export function usageFrame(usage) {
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0)
  return {
    type: "usage",
    prompt: num(usage?.prompt_tokens),
    completion: num(usage?.completion_tokens),
    cacheHit: num(usage?.prompt_cache_hit_tokens),
    cacheMiss: num(usage?.prompt_cache_miss_tokens),
  }
}

/** 回合终态：`reason`/`message`/`durationMs`/`calls` = 可字段（无值即缺键——不落 null）。
 *  `reason` = 短值枚举：设计词表内 = `aborted` ∥ `budget` ∥ `model_error`（管理面五值之三——§3.4）；
 *  盒自产扩展（防御面可达）= `save_failed` ∥ `busy` ∥ `not_found` ∥ `internal`（逐值已在批档 §5 登记）；
 *  `box_lost` 不由盒发（server 合成）。`message` = 人话明细（**加性字段**——§11.3「加性扩展（既有消费零破）」；
 *  转 notice 文案的取值面）。 */
export function endFrame({ status, reason, message, durationMs, calls }) {
  const frame = { type: "end", status }
  if (reason !== undefined && reason !== null) frame.reason = reason
  if (message !== undefined && message !== null) frame.message = message
  if (durationMs !== undefined) frame.durationMs = durationMs
  if (calls !== undefined) frame.calls = calls
  return frame
}

/** 展示形截断（管理面同源口径——`call.args` ≤500 ∥ 摘要 ≤300，逾限加省略号）。 */
export function capText(text, max) {
  const value = typeof text === "string" ? text : text === null || text === undefined ? "" : String(text)
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`
}
