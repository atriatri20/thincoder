/**
 * terminal-link.mjs — 终端核·传输面（`webui/TERMINAL.md` §2.1/§2.5；终端核传输件——核入口 `terminal-core.mjs`，实施实读按职责另拆 `terminal-vt.mjs`/`terminal-codec.mjs`）：
 * **WS 客户端**——建链（同源 url ⇒ cookie 随握手）∥ 帧分派（二进制 = pty 字节 ⇒ 增量 UTF-8 ⇒ 交网格写；文本 = JSON 控制
 * `ready`/`exit`/`error`/`pong`）∥ 上行（键入/粘贴二进制帧 ∥ 尺寸 `resize` 文本帧）∥ 心跳（30s 文本 `{"t":"ping"}`；
 * 60s 无任何下行 ⇒ 本地判死 —— 回调 `onClose("stale")`）∥ 断开态上抛（回调——文案归宿主；重连 = 新会话）。
 * **零控制台依赖**（KD-SV-181）：错误只上抛码（`container_not_running`/`engine_unreachable`/`exec_failed`/`session_closed`）——
 * 文案由消费件 `t()` 渲染；依赖 = 仅 `terminal-core.mjs`。帧协议单源 = `sandbox/SANDBOX.md` §3（本档零复制）。
 */
import { Utf8Decoder, isValidSize } from "./terminal-core.mjs"

/** 心跳周期（§2.5——30s 文本 ping）。 */
const PING_MS = 30000
/** 判死窗（§2.5——60s 无任何下行 ⇒ 本地判死）。 */
const STALE_MS = 60000

/**
 * 建链：`{ url, term, onData, onReady, onExit, onError, onClose }` ⇒ 句柄 `{ resize, send, close, phase }`。
 * - `onData()`：下行 pty 字节已写入网格（消费件借此重渲/回底）。
 * - `onReady({ cols, rows })`：就绪帧（当刻施加尺寸）。
 * - `onExit({ code })`：会话结束（引擎退出码——读败 ⇒ `null`）。
 * - `onError({ code, detail })`：in-band 错误码（窗内人话、不关窗——文案归消费件）。
 * - `onClose(reason)`：断开（`"closed"` 对端关 ∥ `"error"` 链路错 ∥ `"stale"` 心跳判死；显式 `close()` 不回调）。
 */
export function createTerminalLink({ url, term, onData = null, onReady = null, onExit = null, onError = null, onClose = null }) {
  const socket = new WebSocket(url)
  socket.binaryType = "arraybuffer"
  const decoder = new Utf8Decoder()
  let phase = "connecting" // connecting ∥ open ∥ ready ∥ closed
  let pending = null // 就绪前挂起的尺寸（`onopen` 首帧即发——§2.5）
  let pingTimer = null
  let staleTimer = null
  let closed = false

  /** 判死计时（任意下行 ⇒ 重置——§2.5）。 */
  function armStale() {
    if (closed) return
    if (staleTimer !== null) clearTimeout(staleTimer)
    staleTimer = setTimeout(() => finish("stale"), STALE_MS)
  }

  /** 收口（一次——对端 close/error/判死三路同链）。 */
  function finish(reason) {
    if (closed) return
    closed = true
    phase = "closed"
    if (pingTimer !== null) clearInterval(pingTimer)
    if (staleTimer !== null) clearTimeout(staleTimer)
    pingTimer = null
    staleTimer = null
    // 判死路也收口：断开只由 WS close 表达（`sandbox/SANDBOX.md` §3）——不收则服务端会话/exec 悬挂。
    if (typeof socket.close === "function") socket.close()
    if (onClose !== null) onClose(reason)
  }

  /** 文本帧上行（控制面——建链前/收口后零发）。 */
  function sendFrame(payload) {
    if (closed || phase === "connecting") return
    socket.send(JSON.stringify(payload))
  }

  socket.onopen = () => {
    if (closed) return
    phase = "open"
    if (pending !== null) {
      // 首帧即发 resize（当期尺寸——就绪前挂起的那一枚）
      socket.send(JSON.stringify({ t: "resize", cols: pending.cols, rows: pending.rows }))
      pending = null
    }
    pingTimer = setInterval(() => sendFrame({ t: "ping" }), PING_MS)
    armStale()
  }

  socket.onmessage = (event) => {
    if (closed) return
    armStale()
    const data = event?.data
    if (data instanceof ArrayBuffer || ArrayBuffer.isView(data)) {
      term.write(decoder.push(data)) // 下行 pty 字节 ⇒ 文本 ⇒ 网格
      if (onData !== null) onData()
      return
    }
    if (typeof data !== "string") return
    let frame = null
    try {
      frame = JSON.parse(data)
    } catch {
      return // 非法文本帧忽略（协议错归服务端收口——§3）
    }
    if (frame?.t === "ready") {
      phase = "ready"
      if (onReady !== null) onReady({ cols: frame.cols, rows: frame.rows })
    } else if (frame?.t === "exit") {
      if (onExit !== null) onExit({ code: frame.code ?? null })
    } else if (frame?.t === "error") {
      if (onError !== null) onError({ code: frame.code, detail: frame.detail ?? null })
    }
  }

  socket.onclose = () => finish("closed")
  socket.onerror = () => finish("error")

  return {
    get phase() { return phase },
    /** 尺寸变更（越界/非法 ⇒ 忽略——不当帧、不发；建链前 ⇒ 挂起，`onopen` 首帧即发）。 */
    resize(cols, rows) {
      if (!isValidSize(cols, rows) || closed) return false
      if (phase === "connecting") {
        pending = { cols, rows }
        return false
      }
      sendFrame({ t: "resize", cols, rows })
      return true
    },
    /** 上行 pty 字节（二进制帧——建链前/收口后零发）。 */
    send(bytes) {
      if (closed || phase === "connecting") return false
      socket.send(bytes)
      return true
    },
    /** 客户端收口（关窗——服务端三件归其收口；显式关闭不回调）。 */
    close() {
      if (closed) return
      closed = true
      phase = "closed"
      if (pingTimer !== null) clearInterval(pingTimer)
      if (staleTimer !== null) clearTimeout(staleTimer)
      pingTimer = null
      staleTimer = null
      socket.close()
    },
  }
}
