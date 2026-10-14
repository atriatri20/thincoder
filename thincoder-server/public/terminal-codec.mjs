/**
 * terminal-codec.mjs — 终端核·编解码面·纯件（`webui/TERMINAL.md` §2.1/§2.2/§2.3；终端核的**输入/字节面**）：
 * 下行 = 字节 ⇒ 文本（增量 UTF-8——`Utf8Decoder`）∥ 上行 = 键/粘贴 ⇒ 待发序列（§2.3 键盘编码表——`encodeKey`/`encodePaste`）。
 * **实施实读越 500 软线后按职责界线拆出**（拆案触发点在册——`webui/TERMINAL.md` §3；同批 `terminal-vt.mjs` = 解析面）。
 * 出口经 `terminal-core.mjs` 转出（单点取件——沿 `views-sandbox-containers.mjs` 转出口先例）：消费面仍 import 核件一处。
 * **零 DOM ∥ 零网络 ∥ 零控制台依赖**（可独立直测——喂字节 ⇒ 文本 ∥ 喂键 ⇒ 序列）。
 */

// ── 增量 UTF-8 解码（`TextDecoder` 流式——跨块字节不丢）────────────────────────

/** 增量 UTF-8 解码器：`push(bytes)` 逐块进食（残尾序列留待下一块）∥ `reset()` 丢弃残尾（新会话）。 */
export class Utf8Decoder {
  constructor() {
    this.decoder = new TextDecoder("utf-8")
  }

  /** 喂一块字节（`Uint8Array` ∥ `ArrayBuffer`）⇒ 本块可确定的文本（不完整尾序列滞留内部）。 */
  push(bytes) {
    const chunk = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes ?? [])
    return this.decoder.decode(chunk, { stream: true })
  }

  /** 复位（丢弃残尾——重连 = 新会话）。 */
  reset() {
    this.decoder.decode()
  }
}

// ── 键盘编码（§2.3 表——纯函数）──────────────────────────────────────────────

/** 终符族（方向键 ∥ Home/End ⇒ 普通态 `ESC[A`…；应用态 `ESCOA`…——DECCKM `?1`）。 */
const FINAL_KEYS = { ArrowUp: "A", ArrowDown: "B", ArrowRight: "C", ArrowLeft: "D", Home: "H", End: "F" }
/** SS3 族（F1–F4——`ESCOP`…`ESCOS`，两态同形）。 */
const SS3_KEYS = { F1: "P", F2: "Q", F3: "R", F4: "S" }
/** 波浪族（`ESC[<n>~`）。 */
const TILDE_KEYS = { Insert: 2, Delete: 3, PageUp: 5, PageDown: 6, F5: 15, F6: 17, F7: 18, F8: 19, F9: 20, F10: 21, F11: 23, F12: 24 }
/** Ctrl+符号 ⇒ 控制码（Ctrl+`[` = `\x1b`——与 Esc 同码）。 */
const CTRL_SYMBOLS = { "[": "\x1b", "\\": "\x1c", "]": "\x1d", "^": "\x1e", "_": "\x1f" }

/** 修饰码 = 1 + Shift(1) + Alt(2) + Ctrl(4)（§2.3——xterm 修饰形 `ESC[1;<m>X`）。 */
function modifierOf(event) {
  return 1 + (event.shiftKey === true ? 1 : 0) + (event.altKey === true ? 2 : 0) + (event.ctrlKey === true ? 4 : 0)
}

/** 控制码映射（Ctrl 组合）：字母 `0x01–0x1a` ∥ 空格 `\x00` ∥ 符号 `0x1b–0x1f` ∥ 余 ⇒ null。 */
function controlCode(key) {
  const lower = key.toLowerCase()
  if (lower >= "a" && lower <= "z") return String.fromCharCode(lower.charCodeAt(0) - 96)
  if (key === " ") return "\x00"
  return CTRL_SYMBOLS[lower] ?? null
}

/**
 * 键盘编码（§2.3 表——纯函数）：`event` = `{ key, ctrlKey, altKey, shiftKey, metaKey }`；`modes` = `{ applicationCursorKeys, bracketedPaste }`。
 * 返回 = 待发序列（字符串——UTF-8 字节由调用面 `TextEncoder` 出）；非编码键（修饰键/IME 中间态/Meta 组合）⇒ `null`（调用面忽略）。
 */
export function encodeKey(event, modes = {}) {
  const key = typeof event?.key === "string" ? event.key : ""
  if (key === "" || event?.metaKey === true) return null
  const ctrl = event?.ctrlKey === true
  const alt = event?.altKey === true
  const mod = modifierOf(event)
  const app = modes?.applicationCursorKeys === true

  if (key in FINAL_KEYS) {
    if (mod !== 1) return `\x1b[1;${mod}${FINAL_KEYS[key]}` // 修饰形（普通/应用两态同形）
    return app ? `\x1bO${FINAL_KEYS[key]}` : `\x1b[${FINAL_KEYS[key]}`
  }
  if (key in SS3_KEYS) return mod === 1 ? `\x1bO${SS3_KEYS[key]}` : `\x1b[1;${mod}${SS3_KEYS[key]}`
  if (key in TILDE_KEYS) return mod === 1 ? `\x1b[${TILDE_KEYS[key]}~` : `\x1b[${TILDE_KEYS[key]};${mod}~`
  if (key === "Tab") return event?.shiftKey === true ? "\x1b[Z" : "\t"
  if (key === "Enter") return "\r"
  if (key === "Backspace") return "\x7f"
  if (key === "Escape") return "\x1b"
  if (key.length === 1) {
    // 可打印字符（含 IME 提交 ∥ 粘贴文本）；Ctrl ⇒ 控制码；Alt ⇒ `ESC` + 该键原码
    const base = ctrl ? controlCode(key) : key
    if (base === null) return null
    return alt ? `\x1b${base}` : base
  }
  return null
}

/** 粘贴编码（§2.2 模式位行——`?2004` 开 ⇒ 包 `ESC[200~`…`ESC[201~`；关 ⇒ 原样）。 */
export function encodePaste(text, modes = {}) {
  const body = String(text ?? "")
  return modes?.bracketedPaste === true ? `\x1b[200~${body}\x1b[201~` : body
}
