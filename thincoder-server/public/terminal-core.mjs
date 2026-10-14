/**
 * terminal-core.mjs — 终端核·纯件（`webui/TERMINAL.md` §2.1/§2.2/§2.3；KD-SV-181/183——可复用件，本期唯一落地点 = 容器终端窗）：
 * ① 字符网格模型（单元格 = 码点 + SGR 属性 ∥ 宽字符两列占位 ∥ DECSTBM 滚动区 ∥ 备用屏 ∥ 卷回 1000 行环 ∥ 模式位
 * `?1`/`?6`/`?7`/`?12`/`?25`/`?47`/`?1047`/`?1049`/`?2004` + IRM）——语义（解析产物 ⇒ 网格操作）随本档；
 * ② 增量 UTF-8 解码（`Utf8Decoder`）∥ ③ 键盘编码（`encodeKey`/`encodePaste`——§2.3 表）——②③ 住编解码面，本档转出。
 * **拆分面 = 职责三分**（实施实读越 500 软线后按职责界线拆——`webui/TERMINAL.md` §3 越线拆案触发点）：
 * 解析面 = `terminal-vt.mjs`（字符级状态机）∥ 编解码面 = `terminal-codec.mjs`（增量 UTF-8 ∥ 键盘编码——经本档转出）。
 * **零 DOM ∥ 零网络 ∥ 零控制台依赖**（不 import `i18n.mjs`/`modal.mjs`/`dom.mjs`——壳与文案归宿主；§2.6 宿主契约）。
 * 读面 = 只读快照（`screenRow`/`scrollbackRow`/`cursor`/`modes`/`takeDirty`/`version`）——`terminal-render.mjs` 按脏行重渲（§2.4）。
 * 会话尺寸合法域 = §3 帧协议（cols 1–500 ∥ rows 1–300——越界忽略，零帧）。
 */
import { createParser } from "./terminal-vt.mjs"

/** 编解码面转出口（单点取件——沿 `views-sandbox-containers.mjs` 转出口先例）。 */
export { Utf8Decoder, encodeKey, encodePaste } from "./terminal-codec.mjs"

// ── 尺寸域与字符宽度 ─────────────────────────────────────────────────────────

/** 会话尺寸合法域（`sandbox/SANDBOX.md` §3 尺寸口径——渲染面 ∥ 传输面同源）。 */
export const MAX_COLS = 500
export const MAX_ROWS = 300

/** 尺寸合法判据（整型 ∧ 域内——越界/非法 ⇒ 调用方忽略）。 */
export function isValidSize(cols, rows) {
  return Number.isInteger(cols) && Number.isInteger(rows) && cols >= 1 && cols <= MAX_COLS && rows >= 1 && rows <= MAX_ROWS
}

/** 东亚宽/全角（= 2 列）码点区段（`wcwidth` 简表——§2.2 字符网格行）；表外 = 1 列（组合字符按单列落格 = §2.2 登记不做项）。 */
const WIDE_RANGES = [
  [0x1100, 0x115f], [0x2e80, 0x303e], [0x3041, 0x33ff], [0x3400, 0x4dbf], [0x4e00, 0x9fff],
  [0xa000, 0xa4cf], [0xa960, 0xa97f], [0xac00, 0xd7a3], [0xf900, 0xfaff], [0xfe10, 0xfe19],
  [0xfe30, 0xfe6f], [0xff00, 0xff60], [0xffe0, 0xffe6], [0x1f300, 0x1f64f], [0x1f900, 0x1f9ff],
  [0x20000, 0x2fffd], [0x30000, 0x3fffd],
]

/** 字符显示宽度（码点 ⇒ 1 ∥ 2）。 */
export function charWidth(code) {
  for (const [start, end] of WIDE_RANGES) {
    if (code >= start && code <= end) return 2
  }
  return 1
}

// ── 网格与语义（§2.1 解析器 + 字符网格模型）──────────────────────────────────

/** 默认 SGR 属性（一个新对象 = 一次 SGR 变更——渲染面按对象同一性分段）。 */
const DEFAULT_ATTRS = Object.freeze({ fg: null, bg: null, bold: false, dim: false, italic: false, underline: false, blink: false, inverse: false, invisible: false, strike: false })
/** 整型兜底（缺省值入）。 */
const int = (value, fallback) => (Number.isFinite(value) ? Math.floor(value) : fallback)

/**
 * 建终端（解析器 + 网格）：`{ cols, rows, scrollback }` ⇒ 句柄（`write` ∥ `resize` ∥ `reset` ∥ 只读快照面）。
 * 快照面 = `screenRow(y)` ∥ `scrollbackRow(i)` ∥ `scrollbackCount` ∥ `scrollbackTotal` ∥ `cursor` ∥ `modes` ∥ `takeDirty()` ∥ `version`。
 */
export function createTerminal({ cols = 80, rows = 24, scrollback = 1000 } = {}) {
  let width = Math.max(1, int(cols, 80))
  let height = Math.max(1, int(rows, 24))
  const maxScrollback = Math.max(0, int(scrollback, 1000))

  const modes = { autowrap: true, origin: false, insert: false, cursorVisible: true, cursorBlink: false, applicationCursorKeys: false, bracketedPaste: false, cursorShape: "block" }
  const cursor = { row: 0, col: 0 }
  const scrollbackLines = []
  const dirty = new Set()
  let screen = []
  let alt = []
  let altActive = false
  let savedCursor = null
  let savedAltCursor = null
  let attrs = DEFAULT_ATTRS
  let scrollTop = 0
  let scrollBottom = height - 1
  let wrapPending = false
  let tabStops = defaultTabs()
  let scrollbackTotal = 0
  let version = 1

  const grid = () => (altActive ? alt : screen)
  const blankCell = () => ({ ch: " ", w: 1, attrs })
  const blankRow = () => Array.from({ length: width }, blankCell)
  const makeScreen = () => Array.from({ length: height }, blankRow)
  const inBounds = (y) => y >= 0 && y < height
  const clampCol = (x) => Math.max(0, Math.min(width - 1, x))
  const clampRow = (y) => Math.max(0, Math.min(height - 1, y))

  /** 制表位（HT 每 8 列——§2.2 字符网格行）。 */
  function defaultTabs() {
    const stops = new Set()
    for (let x = 8; x < width; x += 8) stops.add(x)
    return stops
  }

  function markDirty(y) { dirty.add(y) }
  function markAllDirty() {
    for (let y = 0; y < height; y++) dirty.add(y)
  }

  /** 整行填充（ED 用——`[from, to]` 闭区间）。 */
  function fill(from, to) {
    for (let y = from; y <= to; y++) {
      if (!inBounds(y)) continue
      grid()[y] = blankRow()
      markDirty(y)
    }
  }

  /** 设格（越界忽略）。 */
  function setCell(y, x, cell) {
    if (!inBounds(y) || x < 0 || x >= width) return
    grid()[y][x] = cell
    markDirty(y)
  }

  /** 行内擦除（`[from, to]` 闭区间——属性 = 当刻）。 */
  function eraseRange(y, from, to) {
    if (!inBounds(y)) return
    for (let x = Math.max(0, from); x <= Math.min(width - 1, to); x++) setCell(y, x, blankCell())
  }

  /** 行内插/删（ICH `@` ∥ DCH `P` ∥ IRM 用）。重复数夹取 = 一行宽——pty 字节不可信，无界循环会冻结页。 */
  function insertCells(y, x, count) {
    if (!inBounds(y)) return
    const row = grid()[y]
    for (let i = 0, n = Math.min(count, width); i < n; i++) row.splice(x, 0, blankCell())
    row.length = width
    markDirty(y)
  }

  function deleteCells(y, x, count) {
    if (!inBounds(y)) return
    const row = grid()[y]
    row.splice(x, Math.min(count, width))
    while (row.length < width) row.push(blankCell())
    markDirty(y)
  }

  /** 行插/删（IL `L` ∥ DL `M`——区内；光标列不动）。重复数夹取 = 区高（同族防无界，§3 尺寸域口径）。 */
  function insertLines(count) {
    const y = cursor.row
    if (y < scrollTop || y > scrollBottom) return
    for (let i = 0, n = Math.min(count, scrollBottom - scrollTop + 1); i < n; i++) {
      grid().splice(scrollBottom, 1)
      grid().splice(y, 0, blankRow())
    }
    markAllDirty()
  }

  function deleteLines(count) {
    const y = cursor.row
    if (y < scrollTop || y > scrollBottom) return
    for (let i = 0, n = Math.min(count, scrollBottom - scrollTop + 1); i < n; i++) {
      grid().splice(y, 1)
      grid().splice(scrollBottom, 0, blankRow())
    }
    markAllDirty()
  }

  /** 区内滚动（SU `S` ∥ SD `T` ∥ 行尾 LF——顶行出屏时（全屏 ∧ 主屏）入卷回环）。重复数夹取 = 区高。 */
  function scrollUp(count) {
    for (let i = 0, n = Math.min(count, scrollBottom - scrollTop + 1); i < n; i++) {
      if (!altActive && scrollTop === 0 && scrollBottom === height - 1) pushScrollback(grid()[0])
      grid().splice(scrollTop, 1)
      grid().splice(scrollBottom, 0, blankRow())
    }
    markAllDirty()
  }

  function scrollDown(count) {
    for (let i = 0, n = Math.min(count, scrollBottom - scrollTop + 1); i < n; i++) {
      grid().splice(scrollBottom, 1)
      grid().splice(scrollTop, 0, blankRow())
    }
    markAllDirty()
  }

  /** 卷回环（1000 行——主屏顶行出屏；超顶 ⇒ 丢最旧并记总计数 `scrollbackTotal`）。 */
  function pushScrollback(line) {
    if (maxScrollback === 0) return
    scrollbackLines.push(line.map((cell) => ({ ...cell })))
    scrollbackTotal += 1
    while (scrollbackLines.length > maxScrollback) scrollbackLines.shift()
  }

  function lineFeed() {
    if (cursor.row === scrollBottom) scrollUp(1)
    else if (cursor.row < height - 1) cursor.row += 1
  }

  function reverseIndex() {
    if (cursor.row === scrollTop) scrollDown(1)
    else if (cursor.row > 0) cursor.row -= 1
  }

  /** 落格（DECAWM `?7` 折返语义——末列写入后置挂起折返位）。 */
  function print(ch) {
    const wide = charWidth(ch.codePointAt(0)) === 2
    if (wrapPending) {
      wrapPending = false
      if (modes.autowrap) {
        cursor.col = 0
        lineFeed()
      }
    }
    if (wide && cursor.col === width - 1) {
      if (!modes.autowrap) return // 末列落不下宽字符 ⇒ 硬裁（不落格）
      cursor.col = 0
      lineFeed()
    }
    if (modes.insert) insertCells(cursor.row, cursor.col, 1)
    setCell(cursor.row, cursor.col, { ch, w: wide ? 2 : 1, attrs })
    if (wide) setCell(cursor.row, cursor.col + 1, { ch: "", w: 0, attrs })
    wrapPending = false
    const next = cursor.col + (wide ? 2 : 1)
    if (next < width) cursor.col = next
    else {
      cursor.col = width - 1 // 末列 ⇒ 停格 + 挂起折返位（DECAWM 关 ⇒ 零挂起——末列覆盖）
      wrapPending = modes.autowrap
    }
  }

  /** 制表（HT——下一制表位；无 ⇒ 末列）。 */
  function tab() {
    let x = cursor.col + 1
    while (x < width - 1 && !tabStops.has(x)) x += 1
    cursor.col = x
    wrapPending = false
  }

  /** 备用屏进出（`?47`/`?1047`/`?1049`——进出清屏语义）。 */
  function enterAlt({ save = false, clear = true } = {}) {
    if (!altActive) {
      if (save) savedAltCursor = { row: cursor.row, col: cursor.col }
      altActive = true
      alt = makeScreen()
      if (clear) {
        cursor.row = 0
        cursor.col = 0
      }
    }
    version += 1
    markAllDirty()
  }

  function exitAlt({ restore = false, clear = true } = {}) {
    if (altActive) {
      altActive = false
      if (clear) alt = []
      if (restore && savedAltCursor !== null) {
        cursor.row = clampRow(savedAltCursor.row)
        cursor.col = clampCol(savedAltCursor.col)
      }
      savedAltCursor = null
    }
    version += 1
    markAllDirty()
  }

  // ── 解析产物语义（`terminal-vt.mjs` 事件 ⇒ 网格操作——§2.2 能力表逐面）────────

  /** SGR（`m`）：0–9 与 22–29 ∥ 30–37/40–47/90–97/100–107 ∥ 38/48 扩展（256/真彩）∥ 39/49。 */
  function applySgr(list) {
    const next = { ...attrs }
    for (let i = 0; i < list.length; i++) {
      const p = list[i]
      if (p === 0) Object.assign(next, DEFAULT_ATTRS)
      else if (p === 1) next.bold = true
      else if (p === 2) next.dim = true
      else if (p === 3) next.italic = true
      else if (p === 4) next.underline = true
      else if (p === 5) next.blink = true
      else if (p === 7) next.inverse = true
      else if (p === 8) next.invisible = true
      else if (p === 9) next.strike = true
      else if (p === 22) next.bold = next.dim = false
      else if (p === 23) next.italic = false
      else if (p === 24) next.underline = false
      else if (p === 25) next.blink = false
      else if (p === 27) next.inverse = false
      else if (p === 28) next.invisible = false
      else if (p === 29) next.strike = false
      else if (p >= 30 && p <= 37) next.fg = p - 30
      else if (p === 39) next.fg = null
      else if (p >= 40 && p <= 47) next.bg = p - 40
      else if (p === 49) next.bg = null
      else if (p >= 90 && p <= 97) next.fg = p - 90 + 8
      else if (p >= 100 && p <= 107) next.bg = p - 100 + 8
      else if (p === 38 || p === 48) {
        const key = p === 38 ? "fg" : "bg"
        const kind = list[i + 1]
        if (kind === 5 && Number.isFinite(list[i + 2])) {
          next[key] = Math.max(0, Math.min(255, list[i + 2]))
          i += 2
        } else if (kind === 2 && Number.isFinite(list[i + 2]) && Number.isFinite(list[i + 3]) && Number.isFinite(list[i + 4])) {
          next[key] = { r: list[i + 2] & 255, g: list[i + 3] & 255, b: list[i + 4] & 255 }
          i += 4
        }
      }
    }
    attrs = Object.freeze(next)
  }

  /** 模式位（`h`/`l`——`?` 私有族；非私有面 = IRM `4`）。 */
  function setMode(flag, p, enable) {
    if (!flag) {
      if (p === 4) modes.insert = enable // IRM（插入模式）
      return
    }
    if (p === 1) modes.applicationCursorKeys = enable
    else if (p === 6) {
      modes.origin = enable
      cursor.row = enable ? scrollTop : 0
      cursor.col = 0
    } else if (p === 7) modes.autowrap = enable
    else if (p === 12) modes.cursorBlink = enable // 解析在册；闪烁 = CSS 固定（§2.2 光标行——不随 `?12` 切换）
    else if (p === 25) modes.cursorVisible = enable
    else if (p === 47) (enable ? enterAlt({ clear: false }) : exitAlt({ clear: false }))
    else if (p === 1047) (enable ? enterAlt({ clear: true }) : exitAlt({ clear: true }))
    else if (p === 1049) (enable ? enterAlt({ save: true, clear: true }) : exitAlt({ restore: true, clear: true }))
    else if (p === 2004) modes.bracketedPaste = enable
  }

  /** C0 控制码（解析面未吞的——§2.2 字符网格/光标行）。 */
  function control(code) {
    if (code === 0x08) {
      if (cursor.col > 0) cursor.col -= 1
      wrapPending = false
    } else if (code === 0x09) tab()
    else if (code === 0x0a || code === 0x0b || code === 0x0c) lineFeed()
    else if (code === 0x0d) {
      cursor.col = 0
      wrapPending = false
    }
  }

  /** ESC + 终符（`7`/`8` 保存恢复 ∥ `D`/`M`/`E` 行移 ∥ `H` 设制表位 ∥ `c` RIS）。 */
  function escape(final) {
    if (final === "7") savedCursor = { row: cursor.row, col: cursor.col }
    else if (final === "8") {
      if (savedCursor !== null) {
        cursor.row = clampRow(savedCursor.row)
        cursor.col = clampCol(savedCursor.col)
      }
    } else if (final === "D") lineFeed()
    else if (final === "M") reverseIndex()
    else if (final === "E") {
      cursor.col = 0
      lineFeed()
    } else if (final === "H") tabStops.add(cursor.col)
    else if (final === "c") reset()
  }

  /** CSI 分派（光标系列 ∥ 擦除/插删系列 ∥ 屏与滚动 ∥ SGR ∥ 模式位 ∥ 余项忽略）。 */
  function csi({ final, params, privateMark }) {
    const flag = privateMark === "?"
    const arg = (index, fallback = 1) => (Number.isFinite(params[index]) && params[index] !== 0 ? params[index] : fallback)
    const mode = (index) => (Number.isFinite(params[index]) ? params[index] : 0)
    /** 光标定位（清挂起折返位——§2.2 光标行）。 */
    const moveTo = (row, col) => {
      cursor.row = clampRow(row)
      cursor.col = clampCol(col)
      wrapPending = false
    }
    if (final === "A") moveTo(cursor.row - arg(0), cursor.col)
    else if (final === "B") moveTo(cursor.row + arg(0), cursor.col)
    else if (final === "C") moveTo(cursor.row, cursor.col + arg(0))
    else if (final === "D") moveTo(cursor.row, cursor.col - arg(0))
    else if (final === "E") moveTo(cursor.row + arg(0), 0)
    else if (final === "F") moveTo(cursor.row - arg(0), 0)
    else if (final === "G" || final === "`") moveTo(cursor.row, arg(0) - 1)
    else if (final === "d") moveTo(arg(0) - 1, cursor.col)
    else if (final === "H" || final === "f") {
      const top = modes.origin ? scrollTop : 0
      const bottom = modes.origin ? scrollBottom : height - 1
      moveTo(Math.max(top, Math.min(bottom, top + arg(0) - 1)), arg(1) - 1)
    } else if (final === "J") {
      const row = cursor.row
      if (mode(0) === 2) fill(0, height - 1)
      else if (mode(0) === 1) { fill(0, row - 1); eraseRange(row, 0, cursor.col) }
      else { eraseRange(row, cursor.col, width - 1); fill(row + 1, height - 1) }
    } else if (final === "K") {
      if (mode(0) === 1) eraseRange(cursor.row, 0, cursor.col)
      else if (mode(0) === 2) eraseRange(cursor.row, 0, width - 1)
      else eraseRange(cursor.row, cursor.col, width - 1)
    } else if (final === "X") eraseRange(cursor.row, cursor.col, cursor.col + arg(0) - 1)
    else if (final === "@") insertCells(cursor.row, cursor.col, arg(0))
    else if (final === "P") deleteCells(cursor.row, cursor.col, arg(0))
    else if (final === "L") insertLines(arg(0))
    else if (final === "M") deleteLines(arg(0))
    else if (final === "S") scrollUp(arg(0))
    else if (final === "T") scrollDown(arg(0))
    else if (final === "m") applySgr(params.length === 0 ? [0] : params)
    else if (final === "r") {
      if (flag) {
        scrollTop = 0
        scrollBottom = height - 1
      } else {
        const top = Math.max(0, (Number.isFinite(params[0]) ? params[0] : 1) - 1)
        scrollTop = top
        scrollBottom = Math.min(height - 1, Math.max(top, (Number.isFinite(params[1]) ? params[1] : height) - 1))
      }
      cursor.row = modes.origin ? scrollTop : 0
      cursor.col = 0
    } else if (final === "s") savedCursor = { row: cursor.row, col: cursor.col }
    else if (final === "u") {
      if (savedCursor !== null) {
        cursor.row = clampRow(savedCursor.row)
        cursor.col = clampCol(savedCursor.col)
      }
    } else if (final === "h" || final === "l") {
      for (const value of params) setMode(flag, value, final === "h")
    } else if (final === "g") {
      if (mode(0) === 0) tabStops.delete(cursor.col)
      else if (mode(0) === 3) tabStops = new Set()
    } else if (final === "q") modes.cursorShape = "block" // DECSCUSR：形状随模式——渲染取块形即止（§2.2 光标行）
  }

  /** 全复位（RIS `ESC c` ∥ 重连新会话）。 */
  function reset() {
    attrs = DEFAULT_ATTRS
    screen = makeScreen()
    alt = []
    altActive = false
    savedCursor = null
    savedAltCursor = null
    scrollTop = 0
    scrollBottom = height - 1
    wrapPending = false
    tabStops = defaultTabs()
    scrollbackLines.length = 0
    scrollbackTotal = 0
    Object.assign(modes, { autowrap: true, origin: false, insert: false, cursorVisible: true, cursorBlink: false, applicationCursorKeys: false, bracketedPaste: false, cursorShape: "block" })
    cursor.row = 0
    cursor.col = 0
    parser.reset()
    version += 1
    markAllDirty()
  }

  /** 尺寸变更（reflow 不做——普通输出硬裁/补空；TUI 收 SIGWINCH 自绘；§2.2 屏与滚动行）。 */
  function resize(nextCols, nextRows) {
    const w = Math.max(1, int(nextCols, width))
    const h = Math.max(1, int(nextRows, height))
    if (w === width && h === height) return false
    const rebuild = (old) => Array.from({ length: h }, (_, y) => {
      const row = Array.from({ length: w }, () => ({ ch: " ", w: 1, attrs: DEFAULT_ATTRS }))
      for (let x = 0; x < Math.min(w, width) && old[y] !== undefined && x < old[y].length; x++) row[x] = old[y][x]
      return row
    })
    screen = rebuild(screen)
    alt = altActive ? rebuild(alt) : []
    width = w
    height = h
    cursor.row = clampRow(cursor.row)
    cursor.col = clampCol(cursor.col)
    scrollTop = 0
    scrollBottom = height - 1
    tabStops = defaultTabs()
    wrapPending = false
    version += 1
    markAllDirty()
    return true
  }

  const parser = createParser({
    print: (ch) => print(ch),
    control: (code) => control(code),
    escape: (final) => escape(final),
    csi: (event) => csi(event),
  })
  screen = makeScreen()

  return {
    /** 喂文本（链路已解码——`Utf8Decoder` ⇒ 字符串）。 */
    write: (text) => parser.write(text),
    resize,
    reset,
    get cols() { return width },
    get rows() { return height },
    get scrollbackCount() { return scrollbackLines.length },
    get scrollbackTotal() { return scrollbackTotal },
    get cursor() { return { row: cursor.row, col: cursor.col, visible: modes.cursorVisible } },
    get modes() { return modes },
    get altActive() { return altActive },
    get version() { return version },
    /** 屏行（只读——单元格数组；越界 ⇒ null）。 */
    screenRow(y) { return inBounds(y) ? grid()[y] : null },
    scrollbackRow(index) { return index >= 0 && index < scrollbackLines.length ? scrollbackLines[index] : null },
    /** 取脏行集（取走即清——单消费面：渲染件）。 */
    takeDirty() {
      const taken = new Set(dirty)
      dirty.clear()
      return taken
    },
  }
}
