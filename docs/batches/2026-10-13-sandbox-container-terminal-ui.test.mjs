/**
 * 2026-10-13-sandbox-container-terminal-ui.test.mjs — thincoder-server 批内单测件（控制台面·容器终端——sandbox-container-terminal 批·
 * **前端舱**；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 判据源 = `webui/TERMINAL.md` §2.1/§2.2/§2.3/§2.4/§2.5/§2.6/§3/§4 ∥ `webui/SANDBOX.md` §2.1①/§4（终端行）∥ `sandbox/SANDBOX.md` §3 容器终端块
 * ∥ §12（N84 ∥ B79/B80 ∥ E61）∥ `webui/STYLE.md` §2.1③/§4（终端行）∥ 批档 §2.3/§2.4。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-sandbox-container-terminal-ui.test.mjs`
 *
 * 射程（腿 ↔ 验收对照）：
 *   ① 核件·解析与网格：喂文本 ⇒ 网格快照（CUP/擦除/插删/滚动区/备用屏/宽字符两列 + 边界折行/制表/卷回 1000/SGR 16-256-真彩/模式位）
 *   ② 核件·键盘编码：§2.3 表逐键（普通/应用两态 ∥ 修饰码 ∥ Ctrl 族 ∥ Alt 前缀）∥ 粘贴包裹（`?2004`）
 *   ③ 核件·增量 UTF-8（跨块拆分）+ **零控制台依赖**（import 面机检——无 `i18n.mjs`/`modal.mjs`/`dom.mjs`）
 *   ④ 尺寸链（N84｜B79）：就绪前挂起 ⇒ `onopen` 首帧即发 ∥ 就绪后直发 ∥ 越界/非法忽略（零帧）
 *   ⑤ 心跳与断开（B80｜N84）：30s 文本 ping ∥ 60s 无下行 ⇒ `onClose("stale")` ∥ 对端 close/error 上抛
 *   ⑥ 渲染腿：脏行重渲（行节点 + SGR 段 `span`）∥ 光标元素定位/显隐 ∥ 卷回视口（同步 ∥ 贴底）∥ 隐藏输入区（特殊键码 ∥ IME 提交 ∥ 粘贴 ∥ Shift+PageUp 不入 pty ∥ Ctrl+Shift+C 复制不发）
 *   ⑦ 窗件：题含容器名 ∥ 状态行四态 ∥ in-band 四码 ⇒ 窗内人话（不关窗）∥ 重连钮（新会话）∥ 同容器窗单例 ∥ Esc 不关窗 ∥ 关窗收口
 *   ⑧ 容器行第七钮：门 = 运行中 ∥ 钮序（末位）∥ 入行闩（三动作在飞 ⇒ 七钮即时禁用）
 *   ⑨ i18n：+12 键两表逐字 ∥ 占位符一致 ∥ en 零 CJK ∥ 键数 220 ∥ 消费在册
 *   ⑩ 静态面：调色板 18 变量入 `:root` ∥ 面类族五枚 ∥ 零动画零过渡 ∥ 终端块零悬停规则 ∥ 档行数 ≤500 软线
 *
 * 桩说明：桩 DOM（`h` 语义近似 + 面类/属性/事件）+ 假 `WebSocket`（帧收发入账）+ rAF 队列（手动推帧）；真库 = i18n 两表（node 直读）。
 * 零网络零真浏览器（真机收口 = 父侧收口轮）。
 */
import test, { mock } from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const PUBLIC_DIR = join(ROOT, "thincoder-server", "public")
const readPublic = (name) => readFileSync(join(PUBLIC_DIR, name), "utf8")
const linesOf = (name) => { const text = readPublic(name); return text.split("\n").length - (text.endsWith("\n") ? 1 : 0) }
const load = (name) => import(pathToFileURL(join(PUBLIC_DIR, name)).href)

// ── 桩 DOM（语义近似 `dom.mjs` `h` + 面类/属性/事件/几何）────────────────────────

const CELL = { w: 8, h: 16 } // 量尺实测（cell 宽高——`RULER_CHARS` = 64 ⇒ 量尺宽 = 512）
const execCalls = []

function makeNode(tag) {
  const classes = new Set()
  const node = {
    tag, children: [], listeners: {}, attrs: {}, parent: null, ownerDocument: DOC,
    textContent: "", value: "", hidden: false, disabled: false, checked: false, open: false,
    style: { cssText: "" }, clientWidth: 0, clientHeight: 0, scrollTop: 0, scrollHeight: 0, rect: null,
    get className() { return [...classes].join(" ") },
    set className(value) {
      classes.clear()
      for (const name of String(value ?? "").split(/\s+/).filter(Boolean)) classes.add(name)
    },
    classList: {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
    },
    append(...items) {
      for (const item of items.flat(Infinity)) {
        if (item === null || item === undefined || item === false) continue
        if (typeof item === "object") item.parent = this
        this.children.push(item)
      }
    },
    insertBefore(item, anchor) {
      const index = anchor === null || anchor === undefined ? this.children.length : this.children.indexOf(anchor)
      if (typeof item === "object") item.parent = this
      this.children.splice(index < 0 ? this.children.length : index, 0, item)
    },
    replaceChildren(...items) { this.children = []; this.append(...items) },
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn) },
    removeEventListener(type, fn) { this.listeners[type] = (this.listeners[type] ?? []).filter((item) => item !== fn) },
    setAttribute(name, value) { this.attrs[name] = String(value); if (name === "style") this.style.cssText = String(value) },
    removeAttribute(name) { delete this.attrs[name] },
    remove() {
      if (this.parent !== null) this.parent.children = this.parent.children.filter((child) => child !== this)
      this.parent = null
    },
    contains(candidate) { return candidate === this || this.children.some((child) => typeof child === "object" && child !== null && child.contains?.(candidate) === true) },
    focus() { DOC.activeElement = this },
    showModal() { this.open = true },
    close() { this.open = false; for (const fn of this.listeners.close ?? []) fn({}) },
    getBoundingClientRect() { return this.rect ?? { width: CELL.w * 64, height: CELL.h } },
    fire(type, event = {}) {
      const target = { preventDefault() {}, ...event }
      return Promise.all((this.listeners[type] ?? []).map((fn) => fn(target)))
    },
  }
  return node
}

const DOC = {
  body: null,
  defaultView: globalThis,
  activeElement: null,
  documentElement: null,
  createElement: (tag) => makeNode(tag),
  createTextNode: (text) => text,
  getElementById: () => null,
  execCommand: (command) => { execCalls.push(command); return true },
}
DOC.body = makeNode("body")
DOC.documentElement = makeNode("html")
globalThis.document = DOC

// rAF 队列（手动推帧）+ 几何/选区桩
const RAF = []
globalThis.requestAnimationFrame = (fn) => RAF.push(fn)
globalThis.cancelAnimationFrame = () => {}
globalThis.getComputedStyle = () => ({ paddingLeft: STUB_PADDING.left, paddingRight: STUB_PADDING.right, paddingTop: STUB_PADDING.top, paddingBottom: STUB_PADDING.bottom })
const STUB_PADDING = { left: "0px", right: "0px", top: "0px", bottom: "0px" }
const OBSERVERS = []
globalThis.ResizeObserver = class { constructor(callback) { this.callback = callback; OBSERVERS.push(this) } observe() {} disconnect() {} }
let SELECTION = { isCollapsed: true, anchorNode: null, focusNode: null, toString: () => "" }
globalThis.getSelection = () => SELECTION

function flushFrames(rounds = 4) {
  for (let i = 0; i < rounds && RAF.length > 0; i++) {
    const queue = RAF.splice(0)
    for (const fn of queue) fn()
  }
}
const findAll = (root, pred, out = []) => {
  if (root !== null && typeof root === "object") {
    if (pred(root)) out.push(root)
    for (const child of root.children ?? []) findAll(child, pred, out)
  }
  return out
}
const byClass = (root, name) => findAll(root, (node) => typeof node.className === "string" && node.className.split(" ").includes(name))[0] ?? null
const textOf = (node) => (node === null ? "" : (node.children ?? []).reduce((acc, child) => acc + (typeof child === "object" && child !== null ? textOf(child) : String(child)), node.textContent ?? ""))
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

// ── 假 WebSocket（帧收发入账）────────────────────────────────────────────────

class FakeSocket {
  constructor(url) {
    this.url = url
    this.sent = []
    this.closed = false
    this.binaryType = "blob"
    FakeSocket.all.push(this)
  }
  static all = []
  static reset() { FakeSocket.all = [] }
  send(data) { this.sent.push(data) }
  close() { this.closed = true }
  /** 测试驱动面。 */
  open() { this.onopen?.({}) }
  frame(data) { this.onmessage?.({ data }) }
  bytes(text) { this.onmessage?.({ data: new TextEncoder().encode(text).buffer }) }
  serverClose() { this.onclose?.({}) }
  fail() { this.onerror?.({}) }
  control(index = this.sent.length - 1) { return JSON.parse(this.sent[index]) }
}
globalThis.WebSocket = FakeSocket

const { createTerminal, Utf8Decoder, encodeKey, encodePaste, charWidth, isValidSize, MAX_COLS, MAX_ROWS } = await load("terminal-core.mjs")
const CORE = await load("terminal-core.mjs")
const CODEC = await load("terminal-codec.mjs")
const VT = await load("terminal-vt.mjs")
const { createTerminalView } = await load("terminal-render.mjs")
const { createTerminalLink } = await load("terminal-link.mjs")
const { openTerminalModal } = await load("views-sandbox-terminal.mjs")
const CONTAINERS = await load("views-sandbox-containers.mjs")
const { ZH_SANDBOX } = await load("i18n-zh-sandbox.mjs")
const { EN_SANDBOX } = await load("i18n-en-sandbox.mjs")
const { ZH } = await load("i18n-zh.mjs")
const CSS = readPublic("style.css")

const row = (term, y) => term.screenRow(y).map((cell) => cell.ch).join("")
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",")
const decode = (bytes) => new TextDecoder().decode(bytes)
const fill = (text, params) => String(text).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))

/** 假 ctx（消费件只用 `h`——其余沿容器件桩形）。 */
const fakeCtx = () => ({ h: (tag, props = {}, ...children) => {
  const node = makeNode(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue
    if (key === "class") node.className = String(value)
    else if (key === "text") node.textContent = String(value)
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value)
    else if (["value", "checked", "disabled", "hidden"].includes(key)) node[key] = value
    else node.setAttribute(key, value)
  }
  node.append(...children)
  return node
}, state: {}, api: async () => ({}), fmtTs: (ts) => String(ts), fmtValue: (value) => (value === null || value === undefined ? "—" : String(value)), flash: () => {}, fail: () => {} })

const fRunner = (over = {}) => ({ id: 1, name: "box-a", address: "http://10.0.0.6:2375", status: "ok", online: true, version: "29.1.3", containers: { total: 3, running: 2 }, ...over })
const fContainer = (over = {}) => ({ id: "c1", name: "workspace-a", image: "thincoder-sandbox:1", state: "running", ...over })

/** 容器区夹具（桩 ctx + 假 API——沿容器批件形；两跳 = 首跳取数、次跳渲染）。 */
async function mountContainerSection({ containers = [fContainer()] } = {}) {
  const ctx = fakeCtx()
  ctx.api = async () => ({ containers })
  const section = CONTAINERS.createContainerSection(ctx)
  section.area(fRunner(), { reload: () => Promise.resolve(), refresh: () => {} })
  await tick()
  return section.area(fRunner(), { reload: () => Promise.resolve(), refresh: () => {} })
}

const buttonsOf = (node) => findAll(node, (item) => item.tag === "button")
const disabledOf = (node) => buttonsOf(node).map((button) => button.disabled)

// ── ① 核件·解析与网格 ─────────────────────────────────────────────────────────

test("① 核件·解析与网格：喂文本 ⇒ 网格快照（CUP/擦除/插删/滚动区/备用屏/宽字符折行/制表/卷回 1000/SGR/模式位）", () => {
  const term = createTerminal({ cols: 10, rows: 4, scrollback: 1000 })
  term.write("hello")
  assert.equal(row(term, 0), "hello     ", "普通输出落格（尾补空）")
  assert.deepEqual(term.cursor, { row: 0, col: 5, visible: true }, "光标随写")

  term.write("\x1b[2;3H\x1b[1;31mRED\x1b[0m-")
  assert.equal(row(term, 1), "  RED-    ", "CUP 定位 + SGR 段（粗体 + 红）")
  assert.deepEqual(term.screenRow(1)[2].attrs, { ...term.screenRow(1)[2].attrs, fg: 1, bold: true }, "SGR 前景 31 ⇒ 索引 1、粗体在册")
  assert.equal(term.screenRow(1)[5].attrs.fg, null, "SGR 0 复位")

  term.write("\x1b[2J\x1b[H\x1b[38;5;196mX\x1b[48;2;10;20;30mY")
  assert.equal(term.screenRow(0)[0].attrs.fg, 196, "256 色（38;5;n）")
  assert.deepEqual(term.screenRow(0)[1].attrs.bg, { r: 10, g: 20, b: 30 }, "真彩（48;2;r;g;b）")

  term.write("\x1b[2J\x1b[Habcdef\x1b[H\x1b[2@\x1b[3P")
  assert.equal(row(term, 0), "bcdef     ", "ICH `@` / DCH `P`（行内插删）")
  term.write("\x1b[2J\x1b[Habcdef\x1b[H\x1b[2X")
  assert.equal(row(term, 0), "  cdef    ", "ECH `X`（擦除）")
  term.write("\x1b[2J\x1b[Habcdef\x1b[1;4H\x1b[1K")
  assert.equal(row(term, 0), "    ef    ", "EL 1 左擦（自行首到光标格——含光标格）")
  term.write("\x1b[2J\x1b[Habcdef\x1b[1;4H\x1b[0K")
  assert.equal(row(term, 0), "abc       ", "EL 0 右擦（自光标格到行尾）")
  term.write("\x1b[2J\x1b[H\x1b[4:2mX\x1b[0m")
  assert.equal(term.screenRow(0)[0].attrs.underline, true, "`4:2` 样式子参不做 ⇒ 基础属性照施（下划线在）")
  assert.equal(term.screenRow(0)[0].attrs.dim, false, "样式子参不入属性流（不落 dim）")

  const guard = createTerminal({ cols: 10, rows: 4 }) // 重复数夹取（pty 字节不可信——无界循环会冻结页）
  guard.write("a\r\nb\r\n\x1b[999999999L")
  assert.equal(row(guard, 0), "a         ", "超大 IL ⇒ 区高夹取（区外行不动）")
  assert.equal(row(guard, 1), "b         ", "超大 IL 不越区（光标行以上不动）")
  assert.equal(row(guard, 2), "          ", "超大 IL 后光标行起为空白（零无界插入）")
  guard.write("\x1b[2J\x1b[Habcdefgh\x1b[1;4H\x1b[999999@")
  assert.equal(row(guard, 0), "abc       ", "超大 ICH ⇒ 行宽夹取（光标位起涌到行尾——零无界循环）")

  const tabs = createTerminal({ cols: 20, rows: 1 })
  tabs.write("a\tb")
  assert.equal(row(tabs, 0), "a       b           ", "制表位 = 每 8 列")

  const wide = createTerminal({ cols: 4, rows: 2 })
  wide.write("中")
  assert.equal(wide.screenRow(0)[0].w, 2, "宽字符主格 = 两列")
  assert.equal(wide.screenRow(0)[1].w, 0, "宽字符续格占位")
  assert.equal(wide.cursor.col, 2, "宽字符推进两列")
  wide.write("abc")
  assert.equal(row(wide, 1), "c   ", "末列写满 ⇒ 折行（DECAWM——`abc` 的 `c` 落次行）")
  const narrow = createTerminal({ cols: 2, rows: 2 })
  narrow.write("中")
  assert.equal(narrow.cursor.row, 0, "宽字符恰落末两列不折行")

  const region = createTerminal({ cols: 6, rows: 4 })
  region.write("1\r\n2\r\n3\r\n4\r\n5\x1b[2;3r\x1b[3;1H\nX")
  assert.deepEqual([0, 1, 2, 3].map((y) => row(region, y).trim()), ["2", "4", "X", "5"], "DECSTBM 滚动区（区内滚——区外不动）")
  const scb = createTerminal({ cols: 4, rows: 2, scrollback: 3 })
  scb.write("a\r\nb\r\nc\r\nd\r\ne")
  assert.equal(scb.scrollbackCount, 3, "卷回环上限 3")
  assert.equal(scb.scrollbackTotal, 3, "卷回总计数（超顶淘汰在册）")
  const ring = createTerminal({ cols: 2, rows: 2, scrollback: 1000 })
  ring.write(Array.from({ length: 1005 }, (_, i) => `${i % 10}\r\n`).join(""))
  assert.equal(ring.scrollbackCount, 1000, "卷回环上限 1000（§2.2）")

  const alt = createTerminal({ cols: 6, rows: 2 })
  alt.write("main\x1b[?1049h\x1b[HALT\x1b[?1049l")
  assert.equal(alt.altActive, false, "备用屏退出")
  assert.equal(row(alt, 0), "main  ", "主屏内容零损（备用屏进出清屏语义）")

  const modes = createTerminal({ cols: 6, rows: 2 })
  modes.write("\x1b[?1h\x1b[?2004h\x1b[?25l\x1b[?7l\x1b[4h")
  assert.equal(modes.modes.applicationCursorKeys, true, "?1 应用光标键")
  assert.equal(modes.modes.bracketedPaste, true, "?2004 bracketed paste")
  assert.equal(modes.modes.cursorVisible, false, "?25 光标隐藏")
  assert.equal(modes.modes.autowrap, false, "?7 自动换行关")
  assert.equal(modes.modes.insert, true, "IRM 插入模式")

  const line = createTerminal({ cols: 6, rows: 1 })
  line.write("\x1b(0lqk\x1b(B")
  assert.equal(row(line, 0), "┌─┐   ", "DEC 特殊图形（线绘）")
  assert.equal(charWidth("中".codePointAt(0)), 2, "charWidth：东亚宽 = 2")
  assert.equal(charWidth("a".codePointAt(0)), 1, "charWidth：ASCII = 1")
})

// ── ② 核件·键盘编码（§2.3 表）────────────────────────────────────────────────

test("② 核件·键盘编码：§2.3 表逐键（普通/应用两态 ∥ 修饰码 ∥ Ctrl ∥ Alt）∥ 粘贴包裹（`?2004`）", () => {
  const app = { applicationCursorKeys: true }
  const cases = [
    [{ key: "ArrowUp" }, null, "\x1b[A"], [{ key: "ArrowUp" }, app, "\x1bOA"],
    [{ key: "ArrowDown" }, null, "\x1b[B"], [{ key: "ArrowDown" }, app, "\x1bOB"],
    [{ key: "ArrowRight" }, null, "\x1b[C"], [{ key: "ArrowRight" }, app, "\x1bOC"],
    [{ key: "ArrowLeft" }, null, "\x1b[D"], [{ key: "ArrowLeft" }, app, "\x1bOD"],
    [{ key: "Home" }, null, "\x1b[H"], [{ key: "Home" }, app, "\x1bOH"],
    [{ key: "End" }, null, "\x1b[F"], [{ key: "End" }, app, "\x1bOF"],
    [{ key: "PageUp" }, null, "\x1b[5~"], [{ key: "PageDown" }, null, "\x1b[6~"],
    [{ key: "Insert" }, null, "\x1b[2~"], [{ key: "Delete" }, null, "\x1b[3~"],
    [{ key: "ArrowLeft", ctrlKey: true }, null, "\x1b[1;5D"],
    [{ key: "ArrowLeft", ctrlKey: true, shiftKey: true }, null, "\x1b[1;6D"],
    [{ key: "F1" }, null, "\x1bOP"], [{ key: "F4" }, null, "\x1bOS"],
    [{ key: "F5" }, null, "\x1b[15~"], [{ key: "F12" }, null, "\x1b[24~"],
    [{ key: "Tab" }, null, "\t"], [{ key: "Tab", shiftKey: true }, null, "\x1b[Z"],
    [{ key: "Enter" }, null, "\r"], [{ key: "Backspace" }, null, "\x7f"], [{ key: "Escape" }, null, "\x1b"],
    [{ key: "a", ctrlKey: true }, null, "\x01"], [{ key: "z", ctrlKey: true }, null, "\x1a"],
    [{ key: " ", ctrlKey: true }, null, "\x00"], [{ key: "C", ctrlKey: true }, null, "\x03"],
    [{ key: "[", ctrlKey: true }, null, "\x1b"], [{ key: "\\", ctrlKey: true }, null, "\x1c"],
    [{ key: "]", ctrlKey: true }, null, "\x1d"], [{ key: "^", ctrlKey: true }, null, "\x1e"], [{ key: "_", ctrlKey: true }, null, "\x1f"],
    [{ key: "f", altKey: true }, null, "\x1bf"], [{ key: "A" }, null, "A"], [{ key: "中" }, null, "中"],
    [{ key: "Shift" }, null, null], [{ key: "Control" }, null, null], [{ key: "v", metaKey: true }, null, null], [{ key: "Dead" }, null, null],
  ]
  for (const [event, modes, want] of cases) {
    assert.equal(encodeKey(event, modes ?? {}), want, `§2.3 逐键：${JSON.stringify(event)}`)
  }
  assert.equal(encodePaste("hi", {}), "hi", "bracketed paste 关 ⇒ 原样")
  assert.equal(encodePaste("hi", { bracketedPaste: true }), "\x1b[200~hi\x1b[201~", "bracketed paste 开 ⇒ `ESC[200~`…`ESC[201~`")
  assert.equal(isValidSize(80, 24), true, "尺寸域内合法")
  for (const [cols, rows] of [[0, 24], [24, 0], [MAX_COLS + 1, 24], [80, MAX_ROWS + 1], ["80", 24], [80.5, 24]]) {
    assert.equal(isValidSize(cols, rows), false, `尺寸域外/非法 ⇒ 假（${String(cols)}×${String(rows)}）`)
  }
})

// ── ③ 核件·增量 UTF-8 + 零控制台依赖 ─────────────────────────────────────────

test("③ 核件·增量 UTF-8（跨块）+ 零控制台依赖（import 面机检 ∥ 三件纯件）", () => {
  const decoder = new Utf8Decoder()
  const bytes = new TextEncoder().encode("中A文")
  assert.equal(decoder.push(bytes.slice(0, 1)), "", "首字节不完整 ⇒ 零文本（残尾滞留）")
  assert.equal(decoder.push(bytes.slice(1, 3)), "中", "跨块补齐 ⇒ 逐字出")
  assert.equal(decoder.push(bytes.slice(3)), "A文", "余块续出")
  const carried = new Utf8Decoder()
  carried.push(new TextEncoder().encode("中").slice(0, 2))
  carried.reset()
  assert.equal(carried.push(new TextEncoder().encode("文")), "文", "reset 丢弃残尾（新会话）")

  const term = createTerminal({ cols: 8, rows: 1 })
  const split = new Utf8Decoder()
  const encoded = new TextEncoder().encode("你好")
  term.write(split.push(encoded.slice(0, 2)))
  term.write(split.push(encoded.slice(2)))
  assert.equal(row(term, 0), "你好    ", "字节级拆分经解码 ⇒ 网格落格逐值（宽字符占两列）")

  const CORE_FILES = ["terminal-core.mjs", "terminal-vt.mjs", "terminal-codec.mjs", "terminal-render.mjs", "terminal-link.mjs"]
  for (const file of CORE_FILES) {
    const source = readPublic(file)
    for (const line of source.match(/^import .*$/gm) ?? []) {
      for (const forbidden of ["i18n.mjs", "modal.mjs", "dom.mjs"]) {
        assert.equal(line.includes(forbidden), false, `核件零控制台依赖（${file}）：${line}`)
      }
    }
  }
  assert.equal(/createTerminal|encodeKey/.test(readPublic("terminal-core.mjs")), true, "核件出口在册")
  assert.equal(typeof CORE.createTerminal, "function", "出口：createTerminal")
  assert.equal(typeof CODEC.encodeKey, "function", "出口：encodeKey（编解码面）")
  assert.equal(typeof VT.createParser, "function", "出口：createParser（解析面）")
})

// ── ④ 尺寸链（N84｜B79）──────────────────────────────────────────────────────

test("④ 尺寸链（N84｜B79）：就绪前挂起 ⇒ `onopen` 首帧即发 ∥ 就绪后直发 ∥ 越界/非法忽略（零帧）", () => {
  FakeSocket.reset()
  const term = createTerminal({ cols: 80, rows: 24 })
  const ready = []
  const link = createTerminalLink({ url: "ws://localhost/x", term, onReady: (event) => ready.push(event) })
  const socket = FakeSocket.all[0]
  assert.equal(socket.sent.length, 0, "建链期零发")
  assert.equal(link.resize(100, 30), false, "就绪前 ⇒ 挂起（不直发）")
  assert.equal(socket.sent.length, 0, "挂起期零帧（零引擎调用——B79）")
  socket.open()
  assert.deepEqual(socket.control(0), { t: "resize", cols: 100, rows: 30 }, "首帧即发（当期尺寸——挂起的那一枚）")
  socket.frame(JSON.stringify({ t: "ready", cols: 100, rows: 30 }))
  assert.deepEqual(ready, [{ cols: 100, rows: 30 }], "就绪帧上抛（`cols`/`rows` = 当刻施加值）")
  assert.equal(link.resize(90, 25), true, "就绪后 ⇒ 直发")
  assert.deepEqual(socket.control(), { t: "resize", cols: 90, rows: 25 }, "二次 resize 逐值（`cols`/`rows`——引擎参数序在案）")
  const before = socket.sent.length
  for (const [cols, rows] of [[0, 25], [90, 999], ["90", 25], [90.5, 25], [MAX_COLS + 1, 25]]) {
    assert.equal(link.resize(cols, rows), false, `越界/非法 ⇒ 拒（${String(cols)}×${String(rows)}）`)
  }
  assert.equal(socket.sent.length, before, "越界/非法 ⇒ 零帧（零引擎调用 ∥ 会话不受影响）")
  link.close()
})

// ── ⑤ 心跳与断开（B80｜N84）──────────────────────────────────────────────────

test("⑤ 心跳与断开（B80）：30s 文本 ping ∥ 60s 无下行 ⇒ `onClose(\"stale\")` ∥ 对端 close/error 上抛", () => {
  mock.timers.enable({ apis: ["setTimeout", "setInterval"] })
  try {
    FakeSocket.reset()
    const closes = []
    const term = createTerminal({ cols: 80, rows: 24 })
    const link = createTerminalLink({ url: "ws://localhost/x", term, onClose: (reason) => closes.push(reason) })
    const socket = FakeSocket.all[0]
    socket.open()
    mock.timers.tick(30000)
    assert.deepEqual(JSON.parse(socket.sent[0]), { t: "ping" }, "客户端 30s 文本 ping（浏览器不能发 ping 帧）")
    socket.frame(JSON.stringify({ t: "pong" }))
    mock.timers.tick(30000)
    assert.deepEqual(closes, [], "下行（pong）重置判死计时")
    mock.timers.tick(60000)
    assert.deepEqual(closes, ["stale"], "60s 无任何下行 ⇒ 本地判死回调 `onClose(\"stale\")`")
    assert.equal(socket.closed, true, "判死 ⇒ socket 收口（断开只由 WS close 表达——不收则服务端会话/exec 悬挂）")
    assert.equal(link.phase, "closed", "判死 ⇒ 收口")
    assert.equal(link.send(new Uint8Array([1])), false, "收口后零上行")
    assert.equal(link.resize(80, 24), false, "收口后零帧")

    FakeSocket.reset()
    const pair = []
    const second = createTerminalLink({ url: "ws://localhost/y", term, onClose: (reason) => pair.push(reason) })
    const peer = FakeSocket.all[0]
    peer.open()
    peer.serverClose()
    assert.deepEqual(pair, ["closed"], "对端 close ⇒ `onClose(\"closed\")`")
    FakeSocket.reset()
    const third = createTerminalLink({ url: "ws://localhost/z", term, onClose: (reason) => closes.push(reason) })
    FakeSocket.all[0].fail()
    assert.deepEqual(closes, ["stale", "error"], "链路错 ⇒ `onClose(\"error\")`")
    second.close()
    third.close()
    assert.equal(link.phase, "closed", "显式 close 幂等")
  } finally {
    mock.timers.reset()
  }
})

// ── ⑥ 渲染腿 ────────────────────────────────────────────────────────────────

test("⑥ 渲染腿：脏行重渲（SGR 段 `span`）∥ 光标元素 ∥ 卷回视口 ∥ 隐藏输入区（键码/IME/粘贴/本地滚动/复制）", async () => {
  const host = makeNode("div")
  host.clientWidth = CELL.w * 80
  host.clientHeight = CELL.h * 20
  const term = createTerminal({ cols: 80, rows: 24 })
  const sent = []
  const sizes = []
  const view = createTerminalView({ host, term, onData: (bytes) => sent.push(bytes), onResize: (cols, rows) => sizes.push([cols, rows]) })
  assert.equal(host.classList.contains("terminal-surface"), true, "挂载元素取面类 `.terminal-surface`")
  const size = view.layout()
  assert.deepEqual([size.cols, size.rows], [80, 20], "量宽 = floor(面宽/cell宽) × floor(面高/cell高)")
  assert.deepEqual(sizes, [[80, 20]], "尺寸上报（消费件转 `resize` 帧）")
  assert.equal(term.rows, 20, "网格随量宽改尺寸")
  flushFrames()
  const rowBox = host.children[0]
  assert.equal(rowBox.children.length, 20, "屏行节点数 = rows")
  assert.equal(rowBox.children[0].className, "terminal-row", "行节点取面类 `.terminal-row`")

  term.write("hi\x1b[31mRED\x1b[0m")
  view.wake()
  flushFrames()
  const spans = rowBox.children[0].children
  assert.equal(spans.length, 3, "SGR 段切 span（默认 ∥ 红 ∥ 复位）")
  assert.equal(spans[0].textContent, "hi", "段一文本")
  assert.equal(spans[1].textContent, "RED", "段二文本")
  assert.equal(spans[1].attrs.style.includes("color:var(--term-c1)"), true, "16 色走 `:root` 变量（面内零颜色字面量）")
  assert.equal(term.cursor.col, 5, "复位后光标在段尾")

  const cursor = byClass(host, "terminal-cursor")
  assert.equal(cursor.hidden, false, "光标元素在场")
  assert.equal(cursor.style.cssText.includes("left:40px"), true, "光标定位 = col × cell宽（5 × 8）")
  STUB_PADDING.left = "8px"; STUB_PADDING.right = "8px"; STUB_PADDING.top = "8px"; STUB_PADDING.bottom = "8px" // 光标坐标补面内距（绝对定位包含块 = padding box）
  const padHost = makeNode("div")
  padHost.clientWidth = CELL.w * 8
  padHost.clientHeight = CELL.h * 2
  const padView = createTerminalView({ host: padHost, term: createTerminal({ cols: 8, rows: 2 }), onData: () => {} })
  padView.layout()
  flushFrames()
  const padCursor = byClass(padHost, "terminal-cursor")
  assert.equal(padCursor.style.cssText.includes("left:8px"), true, "光标左标 = 面内距 + col × cell宽（与行文本同基）")
  assert.equal(padCursor.style.cssText.includes("top:8px"), true, "光标上标 = 面内距 + 行 × cell高")
  padView.dispose()
  STUB_PADDING.left = "0px"; STUB_PADDING.right = "0px"; STUB_PADDING.top = "0px"; STUB_PADDING.bottom = "0px"
  term.write("\x1b[?25l")
  view.wake()
  flushFrames()
  assert.equal(cursor.hidden, true, "`?25` 关 ⇒ 光标隐")

  const scb = createTerminal({ cols: 4, rows: 2 })
  const scbHost = makeNode("div")
  scbHost.clientWidth = CELL.w * 4
  scbHost.clientHeight = CELL.h * 2
  const scbView = createTerminalView({ host: scbHost, term: scb, onData: () => {} })
  scbView.layout()
  scb.write("a\r\nb\r\nc")
  scbView.wake()
  flushFrames()
  const scbRows = scbHost.children[0]
  assert.equal(scbRows.children.length, 3, "视口行 = 卷回尾部 + 屏内容（1 + 2）")
  assert.equal(scbRows.children[0].children[0].textContent, "a   ", "卷回行在视口前段")

  const input = findAll(host, (node) => node.tag === "textarea")[0]
  assert.equal(input !== undefined, true, "隐藏输入区在场（`keydown`/IME/`paste` 三面载体）")
  await input.fire("keydown", { key: "a" })
  await input.fire("keydown", { key: "ArrowLeft", ctrlKey: true })
  await input.fire("keydown", { key: "Enter" })
  assert.deepEqual(sent.map(decode), ["a", "\x1b[1;5D", "\r"], "特殊键码 + 可打印字符逐值上行")
  term.modes.bracketedPaste = true
  await input.fire("paste", { clipboardData: { getData: () => "中" } })
  assert.equal(decode(sent[sent.length - 1]), "\x1b[200~中\x1b[201~", "粘贴 ⇒ bracketed paste 包裹（`?2004` 开）")
  await input.fire("compositionend", { data: "你好" })
  assert.equal(decode(sent[sent.length - 1]), "你好", "IME 提交 ⇒ UTF-8 字节（组合中间态不发）")

  const before = sent.length
  host.scrollHeight = 400
  host.clientHeight = 100
  host.scrollTop = 100
  await input.fire("keydown", { key: "PageUp", shiftKey: true })
  assert.equal(sent.length, before, "Shift+PageUp 视口滚动不发 pty")
  assert.equal(host.scrollTop < 100, true, "视口上卷一页（本地——滚动量 = 视口高减一行）")
  await input.fire("keydown", { key: "PageDown", shiftKey: true })
  assert.equal(host.scrollTop, 100, "Shift+PageDown 回卷（其量对称）")
  SELECTION = { isCollapsed: false, anchorNode: host, focusNode: host, toString: () => "SELECTED" }
  await input.fire("keydown", { key: "C", ctrlKey: true, shiftKey: true })
  assert.equal(sent.length, before, "选区非空 + Ctrl+Shift+C ⇒ 不发 pty（复制面）")
  assert.equal(execCalls.includes("copy"), true, "复制尝试在册（剪贴板面）")
  SELECTION = { isCollapsed: true, anchorNode: null, focusNode: null, toString: () => "" }
  await input.fire("keydown", { key: "c", ctrlKey: true })
  assert.equal(decode(sent[sent.length - 1]), "\x03", "选区空 + Ctrl+C ⇒ SIGINT（\u0003）照发")

  host.scrollHeight = 400
  host.scrollTop = 0
  view.toBottom()
  flushFrames()
  assert.equal(host.scrollTop, 400, "贴底（新输出/输入 ⇒ 回底显示最新）")
  const sizeReports = []
  const linkHost = makeNode("div")
  linkHost.clientWidth = CELL.w * 40
  linkHost.clientHeight = CELL.h * 10
  const linkView = createTerminalView({ host: linkHost, term: createTerminal({ cols: 80, rows: 24 }), onData: () => {}, onResize: (cols, rows) => sizeReports.push([cols, rows]) })
  linkView.layout(true) // 首链
  linkView.layout() // 同链同尺寸重复 ⇒ 去重（不重发）
  linkView.layout(true) // 重链（重连 = 新会话）⇒ 强制上报（每链首帧必发）
  assert.deepEqual(sizeReports, [[40, 10], [40, 10]], "`force` = 每链首报 ∥ 同链同尺寸不重发")
  linkView.dispose()
  view.dispose()
  scbView.dispose()
  assert.equal(host.children.length, 0, "dispose 撤净（行区/光标/量尺/输入区）")
})

// ── ⑦ 窗件 ──────────────────────────────────────────────────────────────────

test("⑦ 窗件：题含容器名 ∥ 状态行四态 ∥ in-band 四码人话（不关窗）∥ 重连 = 新会话 ∥ 单例 ∥ Esc 不关窗 ∥ 关窗收口", async () => {
  FakeSocket.reset()
  const ctx = fakeCtx()
  const modal = openTerminalModal(ctx, { runner: fRunner(), container: fContainer() })
  const dialog = DOC.body.children.find((child) => child.tag === "dialog")
  assert.equal(dialog !== undefined && dialog !== null, true, "窗在场")
  assert.equal(dialog.classList.contains("terminal-modal"), true, "大窗类 `.terminal-modal`")
  assert.equal(findAll(dialog, (node) => node.tag === "h3")[0].textContent, fill(ZH_SANDBOX["admin.sandbox.terminalTitle"], { name: "workspace-a" }), "题含容器名")
  const status = byClass(dialog, "terminal-status")
  assert.equal(status.textContent, ZH_SANDBOX["admin.sandbox.terminalConnecting"], "初态：连接中")
  assert.equal(byClass(dialog, "terminal-surface") !== null, true, "终端面 `.terminal-surface` 在场")
  assert.equal(textOf(dialog).includes(ZH_SANDBOX["admin.sandbox.terminalNote"]), true, "窗内说明行（Esc 不关窗/断开语义）")

  const socket = FakeSocket.all[0]
  socket.open()
  socket.frame(JSON.stringify({ t: "ready", cols: 120, rows: 30 }))
  assert.equal(status.textContent, fill(ZH_SANDBOX["admin.sandbox.terminalConnected"], { cols: 120, rows: 30 }), "已连接 `cols×rows`")
  const reconnect = buttonsOf(dialog).find((button) => button.textContent === ZH_SANDBOX["admin.sandbox.terminalReconnect"])
  assert.equal(reconnect.hidden, true, "已连接 ⇒ 重连钮隐")

  socket.frame(JSON.stringify({ t: "error", code: "container_not_running", detail: "not running" }))
  socket.serverClose()
  assert.equal(status.textContent, `${ZH_SANDBOX["admin.sandbox.terminalDisconnected"]} · ${ZH_SANDBOX["admin.sandbox.terminalErrNotRunning"]}`, "in-band 四码 ⇒ 窗内人话（不关窗）")
  assert.equal(dialog.parent !== null, true, "错态不关窗")
  assert.equal(reconnect.hidden, false, "断开态 ⇒ 重连钮显")

  const surface = byClass(dialog, "terminal-surface")
  surface.clientWidth = CELL.w * 40 // 量宽可测（重连链首帧 `resize` 断言用）
  surface.clientHeight = CELL.h * 10
  const before = FakeSocket.all.length
  await reconnect.fire("click")
  assert.equal(FakeSocket.all.length, before + 1, "重连 ⇒ 新会话（新链）")
  assert.equal(FakeSocket.all[before].url.includes("/api/admin/sandbox/runners/1/containers/c1/terminal"), true, "升级端点路径逐值")
  assert.equal(FakeSocket.all[before].url.startsWith("ws:"), true, "同源升级（ws:）")
  assert.equal(status.textContent, ZH_SANDBOX["admin.sandbox.terminalConnecting"], "重连 ⇒ 回连接中")
  FakeSocket.all[before].open()
  assert.deepEqual(FakeSocket.all[before].control(0), { t: "resize", cols: 40, rows: 10 }, "重连 ⇒ 新链 `onopen` 首帧 = 当期尺寸 `resize`（每链必发——非「变更才发」）")

  let prevented = false
  await dialog.fire("cancel", { preventDefault: () => { prevented = true } })
  assert.equal(prevented, true, "Esc ⇒ `cancel` `preventDefault`（Esc 不关窗）")
  assert.equal(dialog.parent !== null, true, "Esc 后窗仍在场")

  const again = openTerminalModal(ctx, { runner: fRunner(), container: fContainer() })
  assert.equal(again, modal, "同容器窗单例（再点 ⇒ 复用当前窗）")
  assert.equal(DOC.body.children.filter((child) => child.tag === "dialog").length, 1, "单例：同时最多一窗")

  const closeBtn = buttonsOf(dialog).find((button) => button.textContent === ZH["common.close"])
  const sessionSocket = FakeSocket.all[FakeSocket.all.length - 1]
  await closeBtn.fire("click")
  assert.equal(dialog.parent, null, "关窗（× / 关闭）⇒ 撤离 DOM")
  assert.equal(sessionSocket.closed, true, "关窗 ⇒ 会话收口（客户端关 WS）")
})

// ── ⑧ 容器行第七钮 ──────────────────────────────────────────────────────────

test("⑧ 容器行第七钮：门 = 运行中 ∥ 钮序（末位）∥ 入行闩（三动作在飞 ⇒ 七钮即时禁用）", async () => {
  const running = await mountContainerSection({ containers: [fContainer()] })
  const rowRunning = findAll(running, (node) => node.tag === "tr").find((candidate) => findAll(candidate, (cell) => cell.tag === "td").some((cell) => cell.textContent === "workspace-a"))
  const labels = buttonsOf(rowRunning).map((button) => button.textContent)
  assert.deepEqual(labels, [
    ZH_SANDBOX["admin.sandbox.detail"], ZH_SANDBOX["admin.sandbox.start"], ZH_SANDBOX["admin.sandbox.stop"],
    ZH_SANDBOX["admin.sandbox.restart"], ZH_SANDBOX["admin.sandbox.logs"], ZH_SANDBOX["admin.sandbox.remove"],
    ZH_SANDBOX["admin.sandbox.terminal"],
  ], "七钮序（终端 = 第七钮）")
  assert.deepEqual(disabledOf(rowRunning), [false, true, false, false, false, false, false], "运行中：启动禁 ∥ 终端可用")

  const stopped = await mountContainerSection({ containers: [fContainer({ state: "exited" })] })
  const rowStopped = findAll(stopped, (node) => node.tag === "tr").find((candidate) => findAll(candidate, (cell) => cell.tag === "td").some((cell) => cell.textContent === "workspace-a"))
  assert.deepEqual(disabledOf(rowStopped), [false, false, true, true, false, false, true], "非运行：终端禁（exec 需运行态——门）")

  const busyCtx = fakeCtx()
  let release = null
  busyCtx.api = (path, options = {}) => (options.method === "POST" ? new Promise((resolve) => { release = resolve }) : Promise.resolve({ containers: [fContainer()] }))
  const section = CONTAINERS.createContainerSection(busyCtx)
  section.area(fRunner(), { reload: () => Promise.resolve(), refresh: () => {} })
  await tick()
  const busyBox = section.area(fRunner(), { reload: () => Promise.resolve(), refresh: () => {} })
  const busyRow = findAll(busyBox, (node) => node.tag === "tr").find((candidate) => findAll(candidate, (cell) => cell.tag === "td").some((cell) => cell.textContent === "workspace-a"))
  const stopBtn = buttonsOf(busyRow)[2]
  const inflight = stopBtn.fire("click")
  assert.deepEqual(disabledOf(busyRow), [true, true, true, true, true, true, true], "在飞期：七钮即时禁用（发请求前）")
  await buttonsOf(busyRow)[6].fire("click")
  release?.({ ok: true })
  await inflight
  assert.deepEqual(disabledOf(busyRow), [false, true, false, false, false, false, false], "完成 ⇒ 回门矩阵态（终端随门）")
})

// ── ⑨ i18n ──────────────────────────────────────────────────────────────────

test("⑨ i18n：+12 键两表逐字 ∥ 占位符一致 ∥ en 零 CJK ∥ 键数 220 ∥ 消费在册", () => {
  const ZH_WANT = {
    "admin.sandbox.terminal": "终端",
    "admin.sandbox.terminalTitle": "终端 · {name}",
    "admin.sandbox.terminalConnecting": "连接中……",
    "admin.sandbox.terminalConnected": "已连接（{cols}×{rows}）",
    "admin.sandbox.terminalDisconnected": "已断开",
    "admin.sandbox.terminalExit": "会话已结束（退出码 {code}）",
    "admin.sandbox.terminalErrNotRunning": "容器未在运行——先启动再连",
    "admin.sandbox.terminalErrUnreachable": "节点不可达——检查 Docker API 监听与节点网络",
    "admin.sandbox.terminalErrExecFailed": "容器内起会话失败——引擎拒绝了执行请求",
    "admin.sandbox.terminalErrClosed": "会话已被服务端收口",
    "admin.sandbox.terminalReconnect": "重新连接",
    "admin.sandbox.terminalNote": "Esc 不关窗（终端要用 Esc）；关窗即收口会话，重连 = 新会话（无回放）。",
  }
  const EN_WANT = {
    "admin.sandbox.terminal": "Terminal",
    "admin.sandbox.terminalTitle": "Terminal · {name}",
    "admin.sandbox.terminalConnecting": "Connecting…",
    "admin.sandbox.terminalConnected": "Connected ({cols}×{rows})",
    "admin.sandbox.terminalDisconnected": "Disconnected",
    "admin.sandbox.terminalExit": "Session ended (exit code {code})",
    "admin.sandbox.terminalErrNotRunning": "The container is not running — start it first",
    "admin.sandbox.terminalErrUnreachable": "Node unreachable — check the Docker API listener and the node network",
    "admin.sandbox.terminalErrExecFailed": "Could not start a session in the container — the engine refused the exec request",
    "admin.sandbox.terminalErrClosed": "The server closed the session",
    "admin.sandbox.terminalReconnect": "Reconnect",
    "admin.sandbox.terminalNote": "Esc does not close this window (the terminal needs Esc); closing it ends the session — reconnecting starts a new one (no replay).",
  }
  const consumer = readPublic("views-sandbox-terminal.mjs")
  const containers = readPublic("views-sandbox-containers.mjs")
  for (const [key, text] of Object.entries(ZH_WANT)) {
    assert.equal(ZH_SANDBOX[key], text, `zh 逐字：${key}`)
  }
  for (const [key, text] of Object.entries(EN_WANT)) {
    assert.equal(EN_SANDBOX[key], text, `en 逐字：${key}`)
    assert.equal(CJK.test(text), false, `en 零 CJK：${key}`)
    assert.equal(placeholders(EN_SANDBOX[key]), placeholders(ZH_SANDBOX[key]), `占位符两表一致：${key}`)
    assert.equal(consumer.includes(key), true, `消费在册（views-sandbox-terminal.mjs）：${key}`)
  }
  assert.equal(containers.includes("admin.sandbox.terminal"), true, "第七钮键消费在册（views-sandbox-containers.mjs）")
  assert.equal(Object.keys(ZH_SANDBOX).length, 269, "zh 沙盒部件键数 269（原 220——2026-10-14 随正：后批增 49）")
  assert.equal(Object.keys(EN_SANDBOX).length, 269, "en 沙盒部件键数 269（原 220——2026-10-14 随正：后批增 49）")
})

// ── ⑩ 静态面 ────────────────────────────────────────────────────────────────

test("⑩ 静态面：调色板 18 变量入 `:root` ∥ 面类族五枚 ∥ 零动画零过渡 ∥ 终端块零悬停规则 ∥ 档行数 ≤500", () => {
  const clean = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
  const root = clean.match(/:root\s*\{[^{}]*\}/)[0]
  const vars = [...root.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1])
  const termVars = ["--term-bg", "--term-fg", ...Array.from({ length: 16 }, (_, index) => `--term-c${index}`)]
  for (const name of termVars) assert.equal(vars.includes(name), true, `终端调色板入 :root：${name}`)
  assert.equal(termVars.length, 18, "调色板 = 18 枚（bg/fg + ANSI 16）")
  assert.equal(vars.length, 76, ":root 变量总数 = 实施当刻实读 76（前置 58 + 18；他批改 style.css 时随之重核）")

  for (const name of ["terminal-modal", "terminal-surface", "terminal-row", "terminal-cursor", "terminal-status"]) {
    assert.equal(clean.includes(`.${name}`), true, `面类族在册：.${name}`)
  }
  const block = CSS.slice(CSS.indexOf("终端窗（views-sandbox-terminal"), CSS.indexOf(".terminal-status {"))
  assert.equal(block.includes(":hover"), false, "终端块零新悬停规则（面内无悬停态）")
  assert.equal(/animation|transition/.test(block), false, "终端块零动画零过渡")
  assert.equal([...clean.matchAll(/:hover/g)].length, 8, "行悬停声明清单不变（全档 :hover 计数 = 实施当刻实读 8）")
  assert.equal(clean.includes("font-weight: 400"), true, "全局零粗体口径在册（终端面例外登记）")

  for (const file of ["terminal-core.mjs", "terminal-vt.mjs", "terminal-codec.mjs", "terminal-render.mjs", "terminal-link.mjs", "views-sandbox-terminal.mjs", "views-sandbox-containers.mjs"]) {
    assert.ok(linesOf(file) <= 500, `${file} 越 500 软线：${linesOf(file)}`)
  }
})
