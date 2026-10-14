/**
 * terminal-render.mjs — 终端核·渲染面（`webui/TERMINAL.md` §2.1/§2.4；终端核渲染件——核入口 `terminal-core.mjs`，实施实读按职责另拆 `terminal-vt.mjs`/`terminal-codec.mjs`）：
 * **DOM 渲染 + 输入捕获**——脏行重渲（行节点 + SGR 段 `span`）∥ 光标元素（形状随模式——v1 取块形即止；闪烁 = CSS 固定）∥
 * 卷回视口映射（滚轮 ∥ Shift+PageUp/PageDown ∥ 输入即回底）∥ 尺寸观测（`ResizeObserver` ⇒ cell 量宽 ⇒ cols/rows ⇒ `onResize`；
 * 150ms 去抖）∥ 隐藏输入区（`keydown` 特殊键码 + IME 组合 + `paste` 事件 ∥ 选区非空时 Ctrl+Shift+C 复制不发给 pty）。
 * 依赖 = 仅 `terminal-core.mjs`（可复用件——§2.6 宿主契约：① 一个尺寸可测的挂载元素 ② `onData(bytes)` ③ §2.6 ④ 自备壳与文案）。
 * 颜色一律走 CSS 变量（`--term-bg`/`--term-fg`/`--term-c0..c15`——面内零颜色字面量）；256 色/真彩 = 标准色立方/灰度式（SGR 语义）。
 * 几何（量尺/输入区/光标）走内联尺寸——类名只用面类族五枚（§4 类名双向闭合）。
 */
import { encodeKey, encodePaste, isValidSize } from "./terminal-core.mjs"

/** 量尺字符数（`"M"×N` 实测 cell 宽——§2.4 量宽）。 */
const RULER_CHARS = 64
/** 尺寸去抖（§2.4——150ms）。 */
const MEASURE_DEBOUNCE_MS = 150

/** 256 色/真彩取值式（16 色走变量；16–231 = 6×6×6 色立方；232–255 = 灰阶）。 */
const CUBE_STEPS = [0, 95, 135, 175, 215, 255]

/** 颜色 ⇒ CSS 值（缺省 = 面调色板底色/前景色——§2.4 调色板）。 */
function colorValue(color, background) {
  if (color === null || color === undefined) return background ? "var(--term-bg)" : "var(--term-fg)"
  if (typeof color === "number") {
    if (color < 16) return `var(--term-c${color})`
    if (color < 232) {
      const n = color - 16
      return `rgb(${CUBE_STEPS[Math.floor(n / 36) % 6]},${CUBE_STEPS[Math.floor(n / 6) % 6]},${CUBE_STEPS[n % 6]})`
    }
    const gray = 8 + (color - 232) * 10
    return `rgb(${gray},${gray},${gray})`
  }
  return `rgb(${color.r},${color.g},${color.b})`
}

/** SGR 属性 ⇒ 内联样式（反显 = 前景/底互换——双缺省同样互换；粗体 = 面内登记例外，`webui/STYLE.md` §2.1 ③）。 */
function attrsStyle(attrs) {
  const parts = []
  const inverse = attrs.inverse === true
  const fg = inverse ? attrs.bg : attrs.fg
  const bg = inverse ? attrs.fg : attrs.bg
  if (fg !== null && fg !== undefined) parts.push(`color:${colorValue(fg, false)}`)
  else if (inverse) parts.push(`color:${colorValue(null, true)}`)
  if (bg !== null && bg !== undefined) parts.push(`background:${colorValue(bg, true)}`)
  else if (inverse) parts.push(`background:${colorValue(null, false)}`)
  if (attrs.bold === true) parts.push("font-weight:700")
  if (attrs.dim === true) parts.push("opacity:.6")
  if (attrs.italic === true) parts.push("font-style:italic")
  if (attrs.underline === true) parts.push("text-decoration:underline")
  if (attrs.strike === true) parts.push("text-decoration:line-through")
  if (attrs.invisible === true) parts.push("visibility:hidden")
  return parts.join(";")
}

/**
 * 建渲染视图（挂 `host`——本件为其加面类）：`{ host, term, onData, onResize }` ⇒ 句柄
 * `{ layout, wake, toBottom, focus, dispose }`。`onData(bytes)` = 上行字节（键/粘贴/IME——UTF-8 已出）；
 * `onResize(cols, rows)` = 量宽结果（消费件转 `resize` 帧——越界不报，§3 尺寸域）。
 */
export function createTerminalView({ host, term, onData = null, onResize = null }) {
  const doc = host.ownerDocument ?? globalThis.document
  const win = doc.defaultView ?? globalThis
  host.classList.add("terminal-surface")

  // 结构：行区（裸容器——流内）∥ 光标元素 ∥ 隐藏量尺 ∥ 隐藏输入区
  const rowBox = doc.createElement("div")
  const cursorEl = doc.createElement("div")
  cursorEl.className = "terminal-cursor"
  const ruler = doc.createElement("span")
  ruler.textContent = "M".repeat(RULER_CHARS)
  ruler.setAttribute("aria-hidden", "true")
  ruler.setAttribute("style", "position:absolute;visibility:hidden;white-space:pre;left:0;top:0;")
  const input = doc.createElement("textarea")
  input.setAttribute("autocomplete", "off")
  input.setAttribute("autocapitalize", "off")
  input.setAttribute("spellcheck", "false")
  input.setAttribute("style", "position:absolute;left:0;top:0;width:1px;height:1px;padding:0;margin:0;border:0;opacity:0;resize:none;")
  host.append(rowBox, cursorEl, ruler, input)

  const scbNodes = [] // 卷回行节点（视图前段——不可变）
  const screenNodes = [] // 屏行节点（视图后段——脏行重渲）
  let renderedTotal = 0 // 已渲染的卷回总计数（`scrollbackTotal` 对齐——超顶淘汰的判据）
  let lastVersion = -1 // 结构版本（`term.version`——重建判据）
  let reported = null // 已上报尺寸（首报 + 变更报——重复 layout 不重发帧）
  let cellW = 0
  let cellH = 0
  let padLeft = 0 // 面内距（光标坐标补量——绝对定位包含块 = padding box）
  let padTop = 0
  let frameId = null
  let measureTimer = null
  let stickBottom = true // 贴底（新输出/输入/初开 ⇒ 真；滚轮上滚 ⇒ 假）
  let disposed = false

  const raf = (fn) => (typeof win.requestAnimationFrame === "function" ? win.requestAnimationFrame(fn) : setTimeout(() => fn(), 16))
  const cancelRaf = (id) => { if (typeof win.cancelAnimationFrame === "function") win.cancelAnimationFrame(id); else clearTimeout(id) }

  // ── 尺寸（量宽 ⇒ cols/rows ⇒ `onResize`；越界忽略）──────────────────────────

  /** 量宽（量尺实测 cell 宽高 ⇒ `floor(面宽/cell宽)` ∥ `floor(面高/cell高)`——§2.4）。 */
  function measure() {
    const rect = typeof ruler.getBoundingClientRect === "function" ? ruler.getBoundingClientRect() : null
    if (rect === null || rect.width <= 0 || rect.height <= 0) return null
    const style = typeof win.getComputedStyle === "function" ? win.getComputedStyle(host) : null
    const px = (value) => Number.parseFloat(value ?? "0") || 0
    const innerW = host.clientWidth - px(style?.paddingLeft) - px(style?.paddingRight)
    const innerH = host.clientHeight - px(style?.paddingTop) - px(style?.paddingBottom)
    const cw = rect.width / RULER_CHARS
    return {
      cellW: cw,
      cellH: rect.height,
      cols: Math.floor(innerW / cw),
      rows: Math.floor(innerH / rect.height),
      // 内距（光标绝对定位的包含块 = padding box，行文本在 content box——坐标须补内距，否则错一格）。
      padLeft: px(style?.paddingLeft),
      padTop: px(style?.paddingTop),
    }
  }

  /** 重算尺寸（窗变化 ⇒ 去抖后调用；`force` = 建链期强制上报当期尺寸——每链首帧 `resize` 归此）：越界（§3 尺寸域）
   * ⇒ 忽略（不施、不报）；同尺寸重复 layout 不重发帧。 */
  function layout(force = false) {
    if (disposed) return null
    const size = measure()
    if (size === null || !isValidSize(size.cols, size.rows)) return null
    cellW = size.cellW
    cellH = size.cellH
    padLeft = size.padLeft
    padTop = size.padTop
    if (size.cols !== term.cols || size.rows !== term.rows) term.resize(size.cols, size.rows) // 结构变 ⇒ 下一帧重建
    if (force || reported === null || reported.cols !== size.cols || reported.rows !== size.rows) {
      reported = { cols: size.cols, rows: size.rows }
      if (onResize !== null) onResize(size.cols, size.rows)
    }
    wake()
    return size
  }

  /** 去抖（`ResizeObserver` ⇒ 150ms——§2.4）。 */
  function scheduleLayout() {
    if (disposed) return
    if (measureTimer !== null) clearTimeout(measureTimer)
    measureTimer = setTimeout(() => {
      measureTimer = null
      layout()
    }, MEASURE_DEBOUNCE_MS)
  }

  const observer = typeof win.ResizeObserver === "function" ? new win.ResizeObserver(() => scheduleLayout()) : null
  if (observer !== null) observer.observe(host)

  // ── 渲染（脏行重渲 ∥ 卷回增量 ∥ 光标定位）──────────────────────────────────

  /** 行节点（SGR 段 = 相邻同属性单元格合一段——§2.4 脏行重渲）。 */
  function rowSpans(cells) {
    const spans = []
    let attrs = null
    let buffer = ""
    const flush = () => {
      if (attrs === null) return
      const span = doc.createElement("span")
      span.textContent = buffer
      const style = attrsStyle(attrs)
      if (style !== "") span.setAttribute("style", style)
      spans.push(span)
    }
    for (const cell of cells ?? []) {
      if (cell.w === 0) continue // 宽字符续格（无独立字形——首格已占两列）
      if (cell.attrs !== attrs) {
        flush()
        attrs = cell.attrs
        buffer = ""
      }
      buffer += cell.ch
    }
    flush()
    return spans
  }

  /** 行节点（一行一 `div`）。 */
  function rowNode(cells) {
    const node = doc.createElement("div")
    node.className = "terminal-row"
    node.append(...rowSpans(cells))
    return node
  }

  /** 全量重建（版本变——缩放/重置/换屏）。 */
  function rebuild() {
    lastVersion = term.version
    renderedTotal = term.scrollbackTotal
    term.takeDirty()
    rowBox.replaceChildren()
    scbNodes.length = 0
    screenNodes.length = 0
    for (let i = 0; i < term.scrollbackCount; i++) {
      const node = rowNode(term.scrollbackRow(i))
      rowBox.append(node)
      scbNodes.push(node)
    }
    for (let y = 0; y < term.rows; y++) {
      const node = rowNode(term.screenRow(y))
      rowBox.append(node)
      screenNodes.push(node)
    }
  }

  /** 卷回增量（新行入环 ⇒ 尾部追加；超顶淘汰 ⇒ 头部摘除——全量重建由版本变触发）。 */
  function syncScrollback() {
    const dropped = term.scrollbackTotal - renderedTotal
    if (dropped > 0) {
      for (let i = 0; i < Math.min(dropped, scbNodes.length); i++) scbNodes.shift().remove()
      renderedTotal += dropped
    }
    while (scbNodes.length < term.scrollbackCount) {
      const node = rowNode(term.scrollbackRow(scbNodes.length))
      rowBox.insertBefore(node, screenNodes[0] ?? null)
      scbNodes.push(node)
    }
  }

  /** 光标定位与显隐（绝对定位元素——一 cell 大小；`?25` 关 ⇒ 隐）。 */
  function positionCursor() {
    const cursor = term.cursor
    if (cellW <= 0 || cellH <= 0 || cursor.visible !== true) {
      cursorEl.hidden = true
      return
    }
    cursorEl.hidden = false
    cursorEl.setAttribute("style", `left:${padLeft + cursor.col * cellW}px;top:${padTop + (term.scrollbackCount + cursor.row) * cellH}px;width:${cellW}px;height:${cellH}px;`)
  }

  /** 一帧（`requestAnimationFrame`）：结构同步 ⇒ 脏行重渲 ⇒ 光标 ⇒ 贴底。 */
  function tick() {
    frameId = null
    if (disposed) return
    if (term.version !== lastVersion) rebuild()
    else syncScrollback()
    for (const y of term.takeDirty()) {
      const node = screenNodes[y]
      if (node !== undefined) node.replaceChildren(...rowSpans(term.screenRow(y)))
    }
    positionCursor()
    if (stickBottom) host.scrollTop = host.scrollHeight
  }

  /** 唤醒（调度一帧——幂等）。 */
  function wake() {
    if (disposed || frameId !== null) return
    frameId = raf(tick)
  }

  // ── 输入捕获（隐藏输入区——特殊键 ∥ IME ∥ 粘贴 ∥ 视口滚动 ∥ 复制）──────────────

  /** 上行（字符串 ⇒ UTF-8 字节交消费件）。 */
  function send(text) {
    if (text === null || text === undefined || text === "" || onData === null) return
    onData(new TextEncoder().encode(text))
  }

  /** 选区文本（限本面内——面外选区不参与）。 */
  function selectionText() {
    const selection = typeof win.getSelection === "function" ? win.getSelection() : null
    if (selection === null || selection.isCollapsed === true) return ""
    return host.contains(selection.anchorNode) && host.contains(selection.focusNode) ? String(selection) : ""
  }

  /** 复制（剪贴板面——零控制台依赖：本件自持；失败静默）。 */
  function copySelection(text) {
    const clipboard = win.navigator?.clipboard
    if (typeof clipboard?.writeText === "function") {
      Promise.resolve(clipboard.writeText(text)).catch(() => { doc.execCommand?.("copy") })
      return
    }
    doc.execCommand?.("copy")
  }

  /** 键捕获（特殊键码 ∥ Ctrl+Shift+C 复制 ∥ Shift+PageUp/PageDown 视口 ∥ 余 = `encodeKey`）。 */
  function onKeyDown(event) {
    if (event.isComposing === true || event.keyCode === 229) return // IME 组合中（提交走 compositionend）
    const key = typeof event.key === "string" ? event.key : ""
    if (event.ctrlKey === true && event.shiftKey === true && key.toLowerCase() === "c") {
      const text = selectionText()
      if (text !== "") {
        event.preventDefault()
        copySelection(text)
        return
      }
    }
    if (event.shiftKey === true && (key === "PageUp" || key === "PageDown")) {
      event.preventDefault() // 视口滚动（本地——不发 pty）
      stickBottom = false
      host.scrollTop += (key === "PageUp" ? -1 : 1) * Math.max(1, host.clientHeight - cellH)
      return
    }
    const text = encodeKey(event, term.modes)
    if (text === null) return
    event.preventDefault()
    stickBottom = true // 输入即回底（§2.4 卷回视口）
    send(text)
  }

  /** IME 提交（组合中间态不发——提交文本一次性上行）。 */
  function onCompositionEnd(event) {
    const text = event.data ?? input.value ?? ""
    input.value = ""
    stickBottom = true
    send(text)
  }

  /** 粘贴（`?2004` 开 ⇒ bracketed paste 包裹——`encodePaste`）。 */
  function onPaste(event) {
    const text = event.clipboardData?.getData("text") ?? ""
    event.preventDefault()
    stickBottom = true
    send(encodePaste(text, term.modes))
  }

  function focus() {
    if (typeof input.focus === "function") input.focus({ preventScroll: true })
  }

  input.addEventListener("keydown", onKeyDown)
  input.addEventListener("compositionend", onCompositionEnd)
  input.addEventListener("paste", onPaste)
  host.addEventListener("mouseup", focus)
  const onScroll = () => { stickBottom = host.scrollTop + host.clientHeight >= host.scrollHeight - 2 }
  host.addEventListener("scroll", onScroll)

  // ── 出口 ─────────────────────────────────────────────────────────────────

  /** 贴底（新输出/输入 ⇒ 回底显示最新——§2.4）。 */
  function toBottom() {
    stickBottom = true
    wake()
  }

  function dispose() {
    if (disposed) return
    disposed = true
    if (observer !== null) observer.disconnect()
    if (measureTimer !== null) clearTimeout(measureTimer)
    if (frameId !== null) cancelRaf(frameId)
    frameId = null
    measureTimer = null
    host.removeEventListener("mouseup", focus)
    host.removeEventListener("scroll", onScroll)
    input.removeEventListener("keydown", onKeyDown)
    input.removeEventListener("compositionend", onCompositionEnd)
    input.removeEventListener("paste", onPaste)
    rowBox.remove()
    cursorEl.remove()
    ruler.remove()
    input.remove()
  }

  rowBox.replaceChildren()
  rebuild()
  wake()

  return { layout, wake, toBottom, focus, dispose, get cellSize() { return { cellW, cellH } } }
}
