/**
 * ws.mjs — 最小 WebSocket 服务端（gateway/API.md §4 ∥ sandbox/SANDBOX.md §3「传输层」；sandbox-container-terminal 批 · 台账 #1374）。
 * 可复用件（非沙盒专用——升级面传输层）；零依赖（`node:crypto` + 标准 Buffer）。
 *
 * 面 = 握手（`Sec-WebSocket-Accept` = `base64(sha1(key + GUID))`——逐字）∥ 帧编解码（掩码位 ∥ 两档扩展长度 ∥ 分片重组 ∥ 控制帧）
 * ∥ ping/pong（收 ping 自动回 pong）∥ close ∥ 上界（单帧 ≤ 1 MiB ∥ 解码缓冲 ≤ 4 MiB——越 ⇒ 协议错收口）。
 * 协议错（E63 四形 + 结构非法：未掩码帧 ∥ 非法 opcode ∥ 帧超 1 MiB ∥ 分片累计超 4 MiB ∥ 文本帧非 UTF-8）⇒ `close 1002` 收口，
 * 服务端不崩（畸形流零残留）。101 前的失败（判权/同源/404/形错）走 `refuseUpgrade`——HTTP 语义 + 统一错误形（`errors.mjs`；**零 `Sec-WebSocket-Accept`**）。
 */
import { createHash } from "node:crypto"

import { ERROR_CODES, errorBody } from "./errors.mjs"

export const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"
export const WS_MAX_FRAME_BYTES = 1024 * 1024      // 单帧上界（§3）
export const WS_MAX_BUFFER_BYTES = 4 * 1024 * 1024 // 解码缓冲上界（分片重组累计——§3）
export const WS_CLOSE_NORMAL = 1000                // 正常（exec_exit 收口——§3）
export const WS_CLOSE_GOING_AWAY = 1001            // 离场（余项收口——§3）
export const WS_CLOSE_PROTOCOL_ERROR = 1002        // 协议错（E63）
export const WS_CLOSE_NO_STATUS = 1005             // 无状态码（close 帧空体——仅内部用）

/** 帧 opcode（RFC 6455 §5.2——本件所用子集）。 */
const OP_CONTINUATION = 0x0
const OP_TEXT = 0x1
const OP_BINARY = 0x2
const OP_CLOSE = 0x8
const OP_PING = 0x9
const OP_PONG = 0xa

const STATUS_TEXT = { 400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found", 413: "Payload Too Large", 500: "Internal Server Error" }

/** 握手接受键（`base64(sha1(key + GUID))`——§3 逐字）。 */
export function wsAcceptKey(key) {
  return createHash("sha1").update(`${key}${WS_GUID}`).digest("base64")
}

/** 升级请求判据（`Upgrade: websocket` + `Connection` 含 `upgrade` + `Sec-WebSocket-Key` 在场——标准握手前置）。 */
export function isWsUpgradeRequest(req) {
  const upgrade = String(req?.headers?.upgrade ?? "").toLowerCase()
  const connection = String(req?.headers?.connection ?? "").toLowerCase()
  const key = req?.headers?.["sec-websocket-key"]
  const tokens = connection.split(",").map((token) => token.trim())
  return upgrade === "websocket" && tokens.includes("upgrade") && typeof key === "string" && key.trim() !== ""
}

/** 101 切换响应（握手成功后 socket 交调用方持有——升级 socket 生命周期不归 HTTP 层）。 */
export function writeUpgradeResponse(socket, key) {
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${wsAcceptKey(key)}\r\n\r\n`,
  )
}

/** 101 前的拒绝（判权 401/403 ∥ 同源 403 ∥ 404 ∥ 形错 400——统一错误形；**零 `Sec-WebSocket-Accept`**）⇒ 断开。 */
export function refuseUpgrade(socket, code, message) {
  const finalCode = ERROR_CODES[code] ? code : "internal_error"
  const entry = ERROR_CODES[finalCode]
  const body = JSON.stringify(errorBody(finalCode, message))
  const head =
    `HTTP/1.1 ${entry.status} ${STATUS_TEXT[entry.status] ?? "Error"}\r\n` +
    "Content-Type: application/json; charset=utf-8\r\n" +
    `Content-Length: ${Buffer.byteLength(body)}\r\n` +
    "Connection: close\r\n\r\n"
  try { socket.write(head + body) } catch { /* 已断 */ }
  try { socket.end() } catch { /* 已断 */ }
  return entry.status
}

/** 帧编码（服务端 → 客户端——不掩码；FIN 恒置）：opcode 1 文本 ∥ 2 二进制 ∥ 8 close ∥ 9 ping ∥ 10 pong。 */
export function encodeFrame(opcode, payload = Buffer.alloc(0)) {
  const body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload ?? "")
  const length = body.length
  let header
  if (length < 126) {
    header = Buffer.from([0x80 | opcode, length])
  } else if (length <= 0xffff) {
    header = Buffer.alloc(4)
    header[0] = 0x80 | opcode
    header[1] = 126
    header.writeUInt16BE(length, 2)
  } else {
    header = Buffer.alloc(10)
    header[0] = 0x80 | opcode
    header[1] = 127
    header.writeBigUInt64BE(BigInt(length), 2)
  }
  return Buffer.concat([header, body])
}

export const encodeTextFrame = (text) => encodeFrame(OP_TEXT, Buffer.from(String(text), "utf8"))
export const encodeBinaryFrame = (data) => encodeFrame(OP_BINARY, Buffer.isBuffer(data) ? data : Buffer.from(data ?? ""))
export const encodePingFrame = (payload = Buffer.alloc(0)) => encodeFrame(OP_PING, payload)
export const encodePongFrame = (payload = Buffer.alloc(0)) => encodeFrame(OP_PONG, payload)

/** close 帧编码（载荷 = 状态码 u16 大端 + 原因文本——超 123 字节截断）。 */
export function encodeCloseFrame(code = WS_CLOSE_NORMAL, reason = "") {
  const text = Buffer.from(String(reason), "utf8").subarray(0, 123)
  const payload = Buffer.alloc(2 + text.length)
  payload.writeUInt16BE(code, 0)
  text.copy(payload, 2)
  return encodeFrame(OP_CLOSE, payload)
}

/** 声明帧长（仅读头——大帧早拒不缓冲；头不足 ⇒ null）。 */
export function declaredFrameLength(buffer) {
  if (buffer.length < 2) return null
  const length7 = buffer[1] & 0x7f
  if (length7 < 126) return length7
  if (length7 === 126) return buffer.length < 4 ? null : buffer.readUInt16BE(2)
  return buffer.length < 10 ? null : Number(buffer.readBigUInt64BE(2))
}

/** 单帧解码（缓冲首帧）：`{ ok:true, fin, opcode, masked, payload, size }` ∥ `{ ok:false, needMore:true }` ∥ `{ ok:false, reason }`。 */
export function decodeFrame(buffer) {
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer ?? "")
  if (buf.length < 2) return { ok: false, needMore: true }
  if ((buf[0] & 0x70) !== 0) return { ok: false, reason: "rsv" } // RSV 位必须为 0（无扩展协商）
  const fin = (buf[0] & 0x80) !== 0
  const opcode = buf[0] & 0x0f
  const masked = (buf[1] & 0x80) !== 0
  let length = buf[1] & 0x7f
  let offset = 2
  if (length === 126) {
    if (buf.length < 4) return { ok: false, needMore: true }
    length = buf.readUInt16BE(2)
    offset = 4
  } else if (length === 127) {
    if (buf.length < 10) return { ok: false, needMore: true }
    const big = buf.readBigUInt64BE(2)
    if (big > BigInt(Number.MAX_SAFE_INTEGER)) return { ok: false, reason: "length" }
    length = Number(big)
    offset = 10
  }
  let mask = null
  if (masked) {
    if (buf.length < offset + 4) return { ok: false, needMore: true }
    mask = buf.subarray(offset, offset + 4)
    offset += 4
  }
  if (buf.length < offset + length) return { ok: false, needMore: true }
  const raw = buf.subarray(offset, offset + length)
  let payload = raw
  if (mask) {
    payload = Buffer.from(raw)
    for (let i = 0; i < payload.length; i++) payload[i] ^= mask[i & 3]
  }
  return { ok: true, fin, opcode, masked, payload, size: offset + length }
}

/** 关段（帧必达序：write ⇒ end（FIN 冲刷）⇒ 兜底 destroy——对端不关不悬停；幂等）。 */
function shutSocket(socket, frame) {
  try { if (frame) socket.write(frame) } catch { /* 已断 */ }
  try { socket.end() } catch { /* 已断 */ }
  const timer = setTimeout(() => { try { socket.destroy() } catch { /* 已断 */ } }, 1000)
  timer.unref?.()
}

/**
 * 连接件（服务端侧——`socket` 已经 101）：帧状态机 + 事件回调。
 * 回调：`onText(text)` ∥ `onBinary(buffer)` ∥ `onPong()` ∥ `onActivity()`（任意合法入帧——心跳活性面）
 * ∥ `onClose({ code, reason, protocolError? })`（远端关 ∥ 协议错 ∥ 套接字断——恰一次）。
 * 出帧：`text(value)` ∥ `binary(data)` ∥ `ping(payload?)` ∥ `close(code, reason?)`（本地收口——不再回调 `onClose`）。
 * 入字节 = 套接字数据自动喂；**升级握手后同段到达的残字节（`head`）须由调用方 `feed(head)`**（漏喂 ⇒ 首帧丢失）——
 * 先接线回调再喂（回调可能同步触发）。
 */
export function createWsConnection(socket, {
  onText = null,
  onBinary = null,
  onPong = null,
  onActivity = null,
  onClose = null,
  maxFrameBytes = WS_MAX_FRAME_BYTES,
  maxBufferBytes = WS_MAX_BUFFER_BYTES,
} = {}) {
  let buffer = Buffer.alloc(0)
  let fragments = null
  let closed = false
  let notified = false

  try { socket.setNoDelay?.(true) } catch { /* 非 TCP 面（理论外）——不阻建连 */ }

  const notify = (info) => {
    if (notified) return
    notified = true
    onClose?.(info)
  }

  /** 协议错收口（E63——close 1002）：发帧 ⇒ 关段 ⇒ 恰一次通知。 */
  const protocolFail = (reason) => {
    if (closed) return
    closed = true
    shutSocket(socket, encodeCloseFrame(WS_CLOSE_PROTOCOL_ERROR, "protocol error"))
    notify({ code: WS_CLOSE_PROTOCOL_ERROR, reason, protocolError: true })
  }

  /** 完整消息投递（文本帧先做严格 UTF-8 校验——失败 = 协议错）。 */
  const deliver = (opcode, payload) => {
    onActivity?.()
    if (opcode === OP_TEXT) {
      let text
      try {
        text = new TextDecoder("utf-8", { fatal: true }).decode(payload)
      } catch {
        protocolFail("invalid_utf8")
        return
      }
      onText?.(text)
      return
    }
    onBinary?.(payload)
  }

  const handleFrame = ({ fin, opcode, masked, payload }) => {
    if (!masked) return protocolFail("unmasked") // 客户端帧必须掩码（RFC 6455 §5.1——未掩码 ⇒ 1002）
    if (opcode >= OP_CLOSE) { // 控制帧（8–15）：不可分片 ∥ 载荷 ≤ 125
      if (!fin || payload.length > 125) return protocolFail("control_frame")
      if (opcode === OP_CLOSE) {
        const code = payload.length >= 2 ? payload.readUInt16BE(0) : WS_CLOSE_NO_STATUS
        const reason = payload.length > 2 ? payload.subarray(2).toString("utf8") : ""
        closed = true
        shutSocket(socket, encodeCloseFrame(code === WS_CLOSE_NO_STATUS ? WS_CLOSE_NORMAL : code)) // 回声（RFC 6455 §5.5.1）
        notify({ code, reason })
        return
      }
      if (opcode === OP_PING) {
        try { socket.write(encodePongFrame(payload)) } catch { /* 已断 */ }
        onActivity?.()
        return
      }
      if (opcode === OP_PONG) {
        onActivity?.()
        onPong?.()
        return
      }
      return protocolFail("bad_control")
    }
    if (opcode === OP_CONTINUATION) {
      if (!fragments) return protocolFail("unexpected_continuation")
      fragments.chunks.push(payload)
      fragments.length += payload.length
      if (fragments.length > maxBufferBytes) return protocolFail("buffer_overflow")
      if (!fin) return
      const message = { opcode: fragments.opcode, payload: Buffer.concat(fragments.chunks) }
      fragments = null
      return deliver(message.opcode, message.payload)
    }
    if (opcode === OP_TEXT || opcode === OP_BINARY) {
      if (fragments) return protocolFail("interleaved")
      if (fin) return deliver(opcode, payload)
      fragments = { opcode, chunks: [payload], length: payload.length }
      return
    }
    return protocolFail("bad_opcode") // 3–7（保留数据）⇒ 1002
  }

  /** 入字节喂解码器（逐帧推进；协议错/上界越界即时收口——服务端不崩）。 */
  const feed = (chunk) => {
    if (closed) return
    if (chunk && chunk.length > 0) buffer = buffer.length === 0 ? Buffer.from(chunk) : Buffer.concat([buffer, chunk])
    while (!closed && buffer.length > 0) {
      const declared = declaredFrameLength(buffer)
      if (declared !== null && declared > maxFrameBytes) return protocolFail("frame_too_large") // 大帧早拒（不缓冲）
      const decoded = decodeFrame(buffer)
      if (!decoded.ok) {
        if (decoded.needMore) {
          if (buffer.length > maxBufferBytes) return protocolFail("buffer_overflow")
          return
        }
        return protocolFail(decoded.reason)
      }
      buffer = buffer.subarray(decoded.size)
      handleFrame(decoded)
    }
  }

  socket.on("data", feed)
  socket.on("error", () => { closed = true; notify({ code: 1006, reason: "socket_error" }) })
  socket.on("end", () => { closed = true; notify({ code: 1006, reason: "socket_end" }) })
  socket.on("close", () => { closed = true; notify({ code: 1006, reason: "socket_closed" }) })

  const send = (frame) => {
    if (closed) return false
    try {
      socket.write(frame)
      return true
    } catch {
      return false
    }
  }

  return {
    get isOpen() { return !closed },
    /** 入字节喂解码器（升级 `head` 残字节 ∥ 测试直喂）。 */
    feed,
    /** 文本帧（控制面——JSON 序列化归调用方）。 */
    text: (value) => send(encodeTextFrame(value)),
    /** 二进制帧（pty 字节——原样，不做编码转换）。 */
    binary: (data) => send(encodeBinaryFrame(data)),
    /** ping 帧（服务端心跳——客户端自动 pong）。 */
    ping: (payload = Buffer.alloc(0)) => send(encodePingFrame(payload)),
    /** 本地收口（close 帧 + 关段——恰一次；不再回调 `onClose`：发起方自持生命周期）。 */
    close(code = WS_CLOSE_NORMAL, reason = "") {
      if (closed) return
      closed = true
      notified = true
      shutSocket(socket, encodeCloseFrame(code, reason))
    },
  }
}
