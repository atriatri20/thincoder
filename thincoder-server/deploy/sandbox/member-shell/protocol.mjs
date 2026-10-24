/**
 * protocol.mjs — 盒接入协议帧编解码（member-face-chat 批 · 盒壳；member-face-parity 批增补七型）
 *
 * 单源 = `agent/MEMBER-AGENT.md` §3.3（下行 SSE 事件表 ∥ 上行 NDJSON 帧流）+ §3.11(1)（帧面七型增补 ∥
 * `usage` 两扩字段）+ `gateway/API.md` §2.8/§2.12。本档 = 纯函数腿（零 I/O、零 core 依赖）——帧形逐字
 * 在此成文，其余各档只经本档构造 / 解析，不得自拼帧面。
 *
 * 下行（server → 盒）`GET /api/box/events`（SSE）：
 *   hello { serverTime, redeliver:[cmdId…] } ∥ run { cmdId, sessionId, content, images? } ∥
 *   abort { cmdId, sessionId, key? } ∥ pull { cmdId, url, dir } ∥ cmd { cmdId, kind, args } ∥ ping {} ∥
 *   answer { promptId, kind, verdict? ∥ answer? ∥ values? }（member-face-parity 批增补——ask 应答回程）
 * 上行（盒 → server）：
 *   `POST /api/box/sessions/:id/turns` 体 = NDJSON 帧流：begin { cmdId } ⇒ 六帧词表 + 本批增补七型 ⇒ end
 *   六帧 = delta ∥ call ∥ result ∥ turn ∥ usage ∥ end（`agent/ADMIN-AGENT.md` §11.3 同源）；
 *   七型 = reasoning ∥ toolOutput ∥ sub ∥ ask ∥ tasks ∥ compress ∥ wait（帧表全文 = §3.11(1)）；
 *   本面增补 = begin 帧 + `end.reason` 新值 `box_lost`（box_lost 由 server 侧合成——盒只中止本地回合）。
 *   两处加宽（§3.3）：`call.args`/`ask.args` ∥ `result.content` 携全文——掩蔽/截断（args ≤500 ∥
 *   摘要 ≤300）在 server 转发浏览器前执行（盒无掩蔽表——不在本侧做）。
 */

/** 下行 SSE 事件名（§3.3 事件表——逐值；`answer` = 本批增补）。 */
export const SSE_EVENTS = ["hello", "run", "abort", "pull", "cmd", "ping", "answer"]

/** 上行帧型（begin + 六帧词表 + 本批增补七型——§11.3 同源）。 */
export const FRAME_TYPES = [
  "begin", "delta", "call", "result", "turn", "usage", "end",
  "reasoning", "toolOutput", "sub", "ask", "tasks", "compress", "wait",
]

/** ask 帧 kind 四值（§3.11(2) 表——卡族与应答体按此分发）。 */
export const ASK_KINDS = Object.freeze(["permission", "batch", "question", "secret"])

/** 裁决词表（沿桌面 `thincoder-desktop/src/main/suspensions.mjs` 的 `ITEM_VERDICTS`/`BATCH_VERDICTS` 逐值——`respond` 映射单点同源）：
 *  单件三值 ∥ 批门三值。**映射**（盒壳 = `core-run.mjs` 单点）：`once`/`always` ⇒ `true`（`always` 另置槽
 *  `autoApprove`）、`reject` ⇒ `false`；批门三值直传（核 `dispatch.mjs` `executeToolCalls` 同判）。 */
export const ITEM_VERDICTS = Object.freeze(["once", "always", "reject"])
export const BATCH_VERDICTS = Object.freeze(["approveAll", "deny", "oneByOne"])

/** `sub` 帧内容面四值（核 `thincoder-render-core/subblocks/relay.mjs` `relaySubContentChunk` 面集同源）。 */
export const SUB_FACES = Object.freeze(["text", "think", "toolCall", "toolOutput"])

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

/** 每次模型调用返回且 usage 在场（缺 ⇒ 零帧——有源才发）；源 = 核 usage 四读（蛇形 → 驼形）+ 本批
 *  两扩字段：`reasoning`（核 `usage.reasoning_tokens`——`✦` 段源）∥ `timers { count, expired }`（盒内
 *  `agent._pendingTimers` 活读投影——`⏰` 段源；`expired` > 0 ⇒ 警示色）。 */
export function usageFrame(usage, { timers = null } = {}) {
  const num = (v) => (typeof v === "number" && Number.isFinite(v) ? v : 0)
  const frame = {
    type: "usage",
    prompt: num(usage?.prompt_tokens),
    completion: num(usage?.completion_tokens),
    cacheHit: num(usage?.prompt_cache_hit_tokens),
    cacheMiss: num(usage?.prompt_cache_miss_tokens),
    reasoning: num(usage?.reasoning_tokens),
  }
  if (timers !== null && typeof timers === "object") {
    frame.timers = { count: num(timers.count), expired: num(timers.expired) }
  }
  return frame
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

/** 推理块增量（`reasoning` 型——§3.11(1)；页面 = 核 `renderReasoning`（默认展开）+ 流渲染器 `markReasoning`）。 */
export function reasoningFrame(text) {
  return { type: "reasoning", text: String(text ?? "") }
}

/** 工具实时输出（`toolOutput` 型——`onToolOutput(name, chunk, id)` 之 chunk 文本；卡内尾追 = 核
 *  `appendToolOutput`（截断标随核件））。`kind` 可缺（源形缺省 —— 页面零判）。 */
export function toolOutputFrame({ id, name, text, kind }) {
  const frame = { type: "toolOutput", id: id ?? null, name: String(name ?? ""), text: String(text ?? "") }
  if (kind !== undefined && kind !== null) frame.kind = kind
  return frame
}

/** 子代理面（`sub` 型——§3.11(1)/(5)）：`token` = 核 token 原文（**零剥离**——前缀解析 / 内容构形全在页面
 *  核件）；`ev` = 事件 token 判位（真 ⇒ 页核 `relayEventToSubPatch`；假 ⇒ `relaySubContentChunk(face, …)`）；
 *  `face` = 内容面四值（`SUB_FACES`——`ev:true` 帧零键）；`text` = toolOutput 内容载荷 ∥ `args` = toolCall
 *  入参对象（核件 `b` 参同形）。 */
export function subFrame({ token, ev, face, text, args }) {
  const frame = { type: "sub", token: String(token ?? ""), ev: ev === true }
  if (!frame.ev && typeof face === "string") frame.face = face
  if (text !== undefined && text !== null) frame.text = String(text)
  if (args !== undefined && args !== null) frame.args = args
  return frame
}

/** ask 帧（kind 四值——体逐形 = §3.11(2) 表）。**秘密面 = 白名单**（逐项 = 桌面 `askSecret` 七键同形：
 *  描述面零值）：`secretKind`/`sessionId`/`host`/`user`/`port`/`fields`/`keys`——表外键不入出站。
 *  > 帧判别位 `kind`（四值）与核 `onSecretInput` 载荷的凭据类 `kind`（`ssh-credential` ∥ `ssh-secret`）
 *  > 同名两义 ⇒ 后者落 `secretKind`（本批实施定形——设计表 :253 的 `kind?` 归此键；见批档 §5 披露）。
 *  `promptId` = 盒壳铸（`node:crypto` randomUUID——调用侧给）。 */
export function askFrame(kind, body = {}) {
  const promptId = String(body.promptId ?? "")
  if (kind === "permission") {
    const frame = {
      type: "ask", kind, promptId,
      tool: String(body.tool ?? ""),
      args: typeof body.args === "string" ? body.args : JSON.stringify(body.args ?? {}),
    }
    if (body.diff !== undefined && body.diff !== null) frame.diff = body.diff
    if (typeof body.owner === "string" && body.owner !== "") frame.owner = body.owner
    return frame
  }
  if (kind === "batch") {
    const tools = (Array.isArray(body.tools) ? body.tools : []).map((tool) => String(tool?.name ?? tool ?? ""))
    const count = Number.isInteger(body.count) ? body.count : tools.length
    return { type: "ask", kind, promptId, count, tools }
  }
  if (kind === "question") {
    const options = Array.isArray(body.options) ? body.options.map((option) => String(option)) : []
    return { type: "ask", kind, promptId, question: String(body.question ?? ""), options }
  }
  if (kind === "secret") {
    return {
      type: "ask", kind, promptId,
      secretKind: body.secretKind ?? body.kind ?? null,
      sessionId: body.sessionId ?? null,
      host: body.host ?? null,
      user: body.user ?? null,
      port: body.port ?? null,
      fields: Array.isArray(body.fields) ? body.fields : [],
      keys: body.keys !== null && typeof body.keys === "object" && !Array.isArray(body.keys) ? body.keys : {},
    }
  }
  throw new Error(`askFrame：未知 kind「${kind}」（四值：${ASK_KINDS.join(" ∥ ")}）`)
}

/** 任务面帧（`tasks` 型——核 `onTaskUpdate`；状态行「任务」段源）。 */
export function tasksFrame(items) {
  const list = Array.isArray(items) ? items : []
  const statusOf = (item) => String(item?.status ?? "")
  return {
    type: "tasks",
    done: list.filter((item) => statusOf(item) === "done" || statusOf(item) === "completed").length,
    inProgress: list.filter((item) => statusOf(item) === "in_progress" || statusOf(item) === "inProgress").length,
    pending: list.filter((item) => {
      const status = statusOf(item)
      return status !== "done" && status !== "completed" && status !== "in_progress" && status !== "inProgress"
    }).length,
    total: list.length,
  }
}

/** 压缩面帧（`compress` 型——`start`/`done`/`fallback`/`failed`；状态行段 15）：源 = 核
 *  `onCompressStart({ messages })` ∥ `onCompress({ mode, tokensFreed, elapsedMs })`（`mode` ⇒ `done`/`fallback`）
 *  ∥ `onCompressFail(error)`（`error` ⇒ `failed`）。 */
export function compressFrame({ status, tokensFreed, elapsedMs, error }) {
  const frame = { type: "compress", status: String(status ?? "") }
  if (typeof tokensFreed === "number" && Number.isFinite(tokensFreed)) frame.tokensFreed = tokensFreed
  if (typeof elapsedMs === "number" && Number.isFinite(elapsedMs)) frame.elapsedMs = elapsedMs
  if (typeof error === "string" && error !== "") frame.error = error
  return frame
}

/** 等待相位帧（`wait` 型——核 `onWait` 载荷原样：`{ phase, seconds? , message? }`；相位词单源 = 核
 *  `provider/wait-status.mjs`——盒零相位枚举）。 */
export function waitFrame(info) {
  return { type: "wait", info: info !== null && typeof info === "object" ? info : {} }
}

/** `answer` 下行帧 → 核回调结算值（**盒壳映射单点**——§3.11(2)）：四 kind 各自合法体：
 *  单件 `verdict ∈ ITEM_VERDICTS` ⇒ `once`/`always` 真、`reject` 假；批门 `verdict ∈ BATCH_VERDICTS` ⇒ 三值直传；
 *  问询 `answer` 键在场（串 ∥ null）⇒ 串值（`null` = 取消）；秘密 `values` 键在场（对象 ∥ null）⇒ 对象
 *  （`null` = 取消）。体与 kind 不符 / 值表外 ⇒ `{ ok: false }`（**零结算**——核承诺保持挂起；
 *  服务端同判据 400 零副作用 = `member-relay.mjs`）。`always` 判据随 `value` 回出（置槽在调用侧）。 */
export function answerSettlementOf(kind, payload = {}) {
  if (kind === "permission" || kind === "batch") {
    const verdict = payload?.verdict
    const table = kind === "permission" ? ITEM_VERDICTS : BATCH_VERDICTS
    if (typeof verdict !== "string" || !table.includes(verdict)) return { ok: false }
    if (kind === "batch") return { ok: true, value: verdict }
    return { ok: true, value: verdict !== "reject", always: verdict === "always" }
  }
  if (kind === "question") {
    if (!Object.hasOwn(payload ?? {}, "answer")) return { ok: false }
    const answer = payload.answer
    if (answer !== null && typeof answer !== "string") return { ok: false }
    return { ok: true, value: answer }
  }
  if (kind === "secret") {
    if (!Object.hasOwn(payload ?? {}, "values")) return { ok: false }
    const values = payload.values
    if (values !== null && (typeof values !== "object" || Array.isArray(values))) return { ok: false }
    return { ok: true, value: values }
  }
  return { ok: false }
}

/** 展示形截断（管理面同源口径——`call.args` ≤500 ∥ 摘要 ≤300，逾限加省略号）。 */
export function capText(text, max) {
  const value = typeof text === "string" ? text : text === null || text === undefined ? "" : String(text)
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`
}
