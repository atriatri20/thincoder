/**
 * 2026-10-11-console-chat-align.test.mjs — thincoder-server 批内单测件（管理面 chat 呈现面复用渲染核——console-chat-align 批；
 * 判据源 = `docs/server/design/webui/WEBUI.md` §2.10 ∥ §2.2 ∥ §5 ∥ §6 本批行 ∥ §7 验收；名随批档 · 住 `docs/batches/` ·
 * 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根——`--import` 缝行不可省：页/核同源取件面 = `/rc/**`）：
 *   `node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-11-console-chat-align.test.mjs`
 *
 * 射程（腿 ↔ 设计轴对照在括号）：
 *   ① 供给面双根（复用形）——`/rc/**` ⇒ 核包根：前缀序 ∥ 逃逸门逐根 ∥ 200 + mime + 字节等于磁盘 ∥ 无档 ⇒ 404 面（不吞）
 *      ∥ 装载期包名解析（fail-loud 形）（§2.10「复用形」）
 *   ② 文本面 = 核 `md.mjs` **单源**（对齐集①③；注入点单点——user `mdInline` ∥ assistant `md`，innerHTML 逐字等核产物）
 *   ③ 工具卡 = 核三件（对齐集②；live 建卡/结算 + 回读历史卡）+ 失败判据 `isToolFailure`（红标 + 展开 + 人话）
 *   ④ 流式 = 核 `createStreamRenderer`（对齐集④；rAF 节流 + 增量画件；本页零每帧全量 `md`/`innerHTML`）
 *   ⑤ 滚动 = 核 `applyPin`/`createPinWatch`（对齐集⑤；上滚不夺位 ∥ 回底恢复跟随 ∥ 重读回底 ∥ `end` ⇒ 重读收口）
 *   ⑥ 核件词面（§2.2）——`i18n-{zh,en}-core.mjs` 5 键逐字等于 VSC locales ∥ 键首段 ⊆ 核件 `t()` 发射段集 ∥
 *      门面合体 ∥ `setStrings` 装配期 + 语言切换重注册
 *   ⑦ 档面（§5/§6）——档目 43 ∥ 42（favicon 除外）∥ 零外链 ∥ 本批 style.css 新增类 ⊆ 核件发射类清单 ∥ 自持渲染零残留
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { Writable } from "node:stream"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const PUBLIC_DIR = join(ROOT, "thincoder-server", "public")
const CORE_DIR = join(ROOT, "thincoder-render-core")
const VSC_LOCALES = join(ROOT, "thincoder-vscode", "locales")
const readPublic = (name) => readFileSync(join(PUBLIC_DIR, name), "utf8")
const load = (name) => import(pathToFileURL(join(PUBLIC_DIR, name)).href)

/** 核件取件面 = `/rc/**`（缝行 `--import ./thincoder-server/test/rc-resolve.mjs` 供）——与页同址同源。 */
const CORE_MD = await import("/rc/md.mjs")
const CORE_I18N = await import("/rc/i18n.mjs")
const STATIC = await import(pathToFileURL(join(ROOT, "thincoder-server", "src", "webui", "static.mjs")).href)
const [{ ZH }, { EN }, CHAT, I18N, ZH_CORE_MOD, EN_CORE_MOD] = await Promise.all([
  load("i18n-zh.mjs"), load("i18n-en.mjs"), load("views-chat.mjs"), load("i18n.mjs"), load("i18n-zh-core.mjs"), load("i18n-en-core.mjs"),
])
const ZH_CORE = ZH_CORE_MOD.ZH_CORE
const EN_CORE = EN_CORE_MOD.EN_CORE
const VIEW_SRC = readPublic("views-chat.mjs")
const CSS = readPublic("style.css")

// ── 桩 DOM（`h` 同 app 语义近似；核件真跑——`document` 全局面供核取）───────────────────────────

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" }
const decode = (text) => text.replace(/&(?:amp|lt|gt|quot|#39);/g, (match) => ENTITIES[match])
const stripTags = (html) => decode(html.replace(/<[^>]*>/g, ""))

/** 片段建件：`<span class｜title>text</span>` ⇒ 元素节点（核件 header 面）；其余标记 ⇒ 文本节点（md/token 面只取文面）。 */
function parseFragment(html) {
  const out = []
  const pushText = (chunk) => {
    const text = stripTags(chunk)
    if (text === "") return
    const node = makeNode("#text")
    node.textContent = text
    out.push(node)
  }
  const re = /<span([^>]*)>([\s\S]*?)<\/span>/g
  let last = 0
  let match
  while ((match = re.exec(html)) !== null) {
    pushText(html.slice(last, match.index))
    const node = makeNode("span")
    const cls = /\bclass="([^"]*)"/.exec(match[1])
    if (cls !== null) node.className = cls[1]
    const title = /\btitle="([^"]*)"/.exec(match[1])
    if (title !== null) node.setAttribute("title", title[1])
    node._html = match[2]
    node.textContent = stripTags(match[2])
    out.push(node)
    last = re.lastIndex
  }
  pushText(html.slice(last))
  return out
}

function makeNode(tag) {
  const classes = new Set()
  return {
    tag, children: [], listeners: {}, attrs: {}, parent: null, style: {}, dataset: {},
    open: false, textContent: "", className: "", value: "", hidden: false, disabled: false,
    scrollTop: 0, scrollHeight: 0, clientHeight: 0, _html: "",
    get innerHTML() { return this._html },
    set innerHTML(value) {
      this._html = String(value)
      this.children = []
      for (const child of parseFragment(this._html)) { child.parent = this; this.children.push(child) }
    },
    get firstChild() { return this.children[0] ?? null },
    get childNodes() { return [...this.children] },
    get nextSibling() {
      const siblings = this.parent?.children ?? []
      return siblings[siblings.indexOf(this) + 1] ?? null
    },
    get ownerDocument() { return globalThis.document },
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle: (name) => { if (classes.has(name)) { classes.delete(name); return false } classes.add(name); return true },
    },
    append(...items) {
      for (const item of items.flat(Infinity)) {
        if (item === null || item === undefined || item === false) continue
        if (typeof item === "object") item.parent = this
        this.children.push(item)
      }
    },
    appendChild(item) { this.append(item); return item },
    removeChild(item) { this.children = this.children.filter((child) => child !== item); item.parent = null; return item },
    replaceChildren(...items) { this.children = []; this.append(...items) },
    querySelector(selector) { return fFindAll(this, (node) => node.className.split(/\s+/).includes(selector.slice(1)))[0] ?? null },
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn) },
    setAttribute(name, value) { this.attrs[name] = String(value) },
    remove() {
      if (this.parent !== null) this.parent.children = this.parent.children.filter((child) => child !== this)
      this.parent = null
    },
    focus() {},
    fire(type, event = {}) {
      const target = { preventDefault() {}, ...event }
      return Promise.all((this.listeners[type] ?? []).map((fn) => fn(target)))
    },
    showModal() { this.open = true },
    close() { this.open = false; for (const fn of this.listeners.close ?? []) fn({}) },
  }
}

const stubDocument = () => {
  const scrolling = makeNode("html")
  scrolling.scrollTop = 0
  scrolling.scrollHeight = 0
  scrolling.clientHeight = 0
  return {
    body: makeNode("body"), head: makeNode("head"), scrollingElement: scrolling, documentElement: scrolling,
    createElement: (tag) => makeNode(tag), getElementById: () => null, querySelector: () => null,
    addEventListener: () => {}, removeEventListener: () => {},
  }
}

/** `h`（app.mjs 语义近似）：class ∥ text ∥ on 前缀事件 ∥ 受控属性 ∥ 其余 setAttribute + 子节点。 */
function fH(tag, props = {}, ...children) {
  const node = makeNode(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue
    if (key === "class") node.className = String(value)
    else if (key === "text") node.textContent = String(value)
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value)
    else if (["value", "checked", "disabled", "hidden"].includes(key)) node[key] = value
    else node.setAttribute(key, value)
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue
    node.append(child)
  }
  return node
}

function fFindAll(root, pred, out = []) {
  if (root !== null && typeof root === "object" && root.tag !== undefined) {
    if (pred(root)) out.push(root)
    for (const child of root.children ?? []) fFindAll(child, pred, out)
  }
  return out
}
const fFind = (root, pred) => fFindAll(root, pred)[0] ?? null
const textOf = (node) => (typeof node === "string" ? node : [node?.textContent ?? "", ...(node?.children ?? []).map(textOf)].filter(Boolean).join(" "))
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))
/** 帧泵（桩 rAF 队列——核重渲器按真 rAF 节拍画件：`minMs` 50ms 门在案 ⇒ 发帧前清门）。 */
const RAF_QUEUE = []
const pump = async () => {
  for (let round = 0; round < 8 && RAF_QUEUE.length > 0; round += 1) {
    for (const callback of RAF_QUEUE.splice(0)) callback()
    await tick()
  }
}

/** 桩 ctx（api 路由表 `"METHOD path"` ⇒ handler；全调用入共享 `log`——与假 fetch 同序）。 */
function fCtx(routes = {}, log = []) {
  return {
    h: fH,
    api: async (path, { method = "GET", body } = {}) => {
      log.push(`api ${method} ${path}`)
      const handler = routes[`${method} ${path}`] ?? routes[`${method} ${path.split("?")[0]}`]
      if (handler === undefined) throw new Error(`unexpected ${method} ${path}`)
      return handler(body)
    },
    fmtTs: (ts) => `ts:${ts}`,
    flash: (message) => log.push(`flash ${message}`),
    fail: (error) => log.push(`fail ${String(error?.message ?? error)}`),
  }
}

/** 假流（NDJSON 分块 ⇒ response）。 */
function fStreamResponse(chunks) {
  let index = 0
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    body: {
      getReader: () => ({
        async read() {
          if (index >= chunks.length) return { done: true, value: undefined }
          return { done: false, value: new TextEncoder().encode(chunks[index++]) }
        },
        async cancel() {},
      }),
    },
  }
}

const frame = (payload) => `${JSON.stringify(payload)}\n`
const fChatRow = (over = {}) => ({ id: 1, model: "p1/m-1", status: "idle", createdAt: 1700000000000, updatedAt: 1700000000000, excerpt: "你好", ...over })

/** 页面渲染夹具（桩 DOM + 假 fetch；`rAF` 桩 = 帧队列〔`pump` 泵〕——核缺省 = 真 rAF）。`selected` ⇒ 选中会话（取详情）。 */
async function fMount({ routes = {}, chunks = [], selected = false } = {}) {
  globalThis.document = stubDocument()
  globalThis.requestAnimationFrame = (callback) => { RAF_QUEUE.push(callback); return RAF_QUEUE.length }
  RAF_QUEUE.length = 0
  const log = []
  const ctx = fCtx({ "GET /api/admin/agent/chats": () => ({ chats: [fChatRow()] }), ...routes }, log)
  globalThis.fetch = async (url, init) => { log.push(`fetch ${init.method} ${url}`); return fStreamResponse(chunks) }
  const mount = makeNode("section")
  await CHAT.renderChat(ctx, mount)
  const thread = fFind(mount, (node) => node.className === "chat-thread")
  if (selected) {
    await fFind(mount, (node) => node.className === "chat-row tiny").fire("click")
    await tick()
  }
  return { ctx, log, mount, thread }
}

/** 输入区驱动（真路径：填值 ⇒ 触发 submit——发送门/流读取全走页面实现；发帧前清 `minMs` 门——见 `pump`）。 */
async function fSend(mount, text) {
  await sleep(55)
  fFind(mount, (node) => node.tag === "textarea").value = text
  await fFind(mount, (node) => node.className === "chat-form").fire("submit")
  await pump()
  await tick()
}

const streamReply = (chunks) => {
  globalThis.fetch = async () => fStreamResponse(chunks)
}

// ── ① 供给面双根（复用形）───────────────────────────────────────────────────

test("① 供给双根：`/rc/**` ⇒ 核包根（前缀序 ∥ 逃逸门 ∥ 200 + mime + 字节等磁盘 ∥ 无档 404 面）", async () => {
  const roots = STATIC.staticRoots()
  assert.deepEqual(roots.map((entry) => entry.prefix), ["/rc/", "/"], "前缀序：`/rc/` 先于 `/` 兜底根")
  assert.equal(roots[0].dir, STATIC.DEFAULT_RENDER_CORE_DIR, "第二根 = 核包根（包名解析单源）")
  assert.equal(STATIC.DEFAULT_RENDER_CORE_DIR.toLowerCase(), CORE_DIR.toLowerCase(), "核包根解析面 = `@thincoder/render-core` 包根（win32 盘符大小写归一）")
  // 装载期 fail-loud 形（模块级 const——沿桌面 `CORE_ROOT` 先例）：缺包 ⇒ import 期即抛（此处验在案解析面）
  const site = STATIC.createStaticSite()
  const serve = async (pathname) => {
    const chunks = []
    const res = new Writable({ write(chunk, _encoding, callback) { chunks.push(chunk); callback() } })
    res.writeHead = (code, headers) => { res.statusCode = code; res.headers = headers }
    const hit = site.serve({ method: "GET" }, res, pathname)
    if (!hit) return { hit, statusCode: null, type: null, bytes: null }
    await new Promise((resolve) => res.on("finish", resolve))
    return { hit, statusCode: res.statusCode, type: res.headers["Content-Type"], bytes: Buffer.concat(chunks) }
  }
  const md = await serve("/rc/md.mjs")
  assert.equal(md.statusCode, 200, "`/rc/md.mjs` ⇒ 200")
  assert.equal(md.type, "text/javascript; charset=utf-8", "核件 mime（ESM 直发）")
  assert.ok(md.bytes.equals(readFileSync(join(CORE_DIR, "md.mjs"))), "字节等于核包磁盘档")
  assert.equal((await serve("/rc/flow/tool-card.mjs")).statusCode, 200, "核子目录件（flow/**）同根可发")
  assert.equal((await serve("/style.css")).statusCode, 200, "本根（`public/`）照旧")
  const miss = await serve("/rc/nope.mjs")
  assert.deepEqual([miss.hit, miss.statusCode], [false, null], "`/rc/**` 无档 ⇒ 不吞（false ⇒ 调用方 404）；不回落本根")
  for (const evil of ["/rc/../package.json", "/rc/..%2Fpackage.json", "/rc/%2e%2e/package.json", "/rc/a/./b", "/rc/a\\b", "/rc/%00", "/..%2Fpackage.json", "/../x"]) {
    assert.equal(STATIC.resolveStaticTarget(evil, roots), null, `穿越形须拒（分派面）：${evil}`)
    assert.equal((await serve(evil)).hit, false, `穿越形须拒（供给面）：${evil}`)
  }
})

// ── ②–⑤ 行为腿（旧页类名断言——**页件经 chat-shell-align 批重写后失效**）────────────
// 承继关系：本页 = 同一页件的后续重构（`views-chat.mjs` 改写 + `views-chat-composer.mjs` 拆件；类面改由核件发射
// `message user`/`message assistant`/`bubble`，会话选取 = `select.chat-select` 换 `chat-row` 行点）。②–⑤ 的旧类名断言
// 已不可机检——**语义覆盖移至承继件**（同一门禁链）：`docs/batches/2026-10-11-chat-shell-align.test.mjs` ∥ `docs/batches/2026-10-11-chat-shell-align-ui.test.mjs`（2026-10-13 拆档——console-chat-live-step 批）
// （N68 装配 ∥ N69 回读装配 ∥ N64 帧序 ∥ N67 中止 ∥ 结构腿核件调用面 ∥ N70 状态行）。本件保留 ① ⑥ ⑦（供给缝 ∥ 核件词面 ∥ 档面）。
// 2026-10-13 收正：承继两档均扫（拆档后行为腿入 `…-chat-shell-align-ui.test.mjs`）。

test("②–⑤ 行为腿：由承继件覆盖（页件重写后生效——指针腿）", () => {
  const successor = join(ROOT, "docs", "batches", "2026-10-11-chat-shell-align.test.mjs")
  const successorUi = join(ROOT, "docs", "batches", "2026-10-11-chat-shell-align-ui.test.mjs")
  assert.ok(existsSync(successor) && existsSync(successorUi), "承继件在盘（行为面覆盖所归——同一门禁链；2026-10-13 拆档两档）")
  const successorSrc = readFileSync(successor, "utf8") + readFileSync(successorUi, "utf8")
  for (const leg of ["N68 装配", "N69 回读装配", "N64 帧序", "N67/B65 中止", "结构腿"]) {
    assert.ok(successorSrc.includes(leg), `承继腿在册：${leg}`)
  }
})

// ── ⑥ 核件词面（§2.2）──────────────────────────────────────────────────────

test("⑥ 核件词面：5 键逐字等 VSC locales ∥ 键首段 ⊆ 核件 `t()` 发射段集 ∥ 门面合体 ∥ 装订 + 语言切换重注册", async () => {
  const vscZh = JSON.parse(readFileSync(join(VSC_LOCALES, "zh.json"), "utf8"))
  const vscEn = JSON.parse(readFileSync(join(VSC_LOCALES, "en.json"), "utf8"))
  const VSC_KEYS = ["tool.running", "tool.initial", "tool.truncated", "tool.error", "tool.done"]
  assert.deepEqual(VSC_KEYS.every((key) => key in ZH_CORE), true, "核件原名五枚在册")
  assert.equal(Object.keys(ZH_CORE).length, 54, `部件键族 54 枚（5 原名 + 49 控制台叙事——chat-shell-align 批；2026-10-12 走查实修：+\`reasoning.off\` 哨兵键）：${Object.keys(ZH_CORE).length}`)
  for (const key of VSC_KEYS) {
    assert.equal(ZH_CORE[key], vscZh[key], `zh 值须逐字等 VSC locales：${key}`)
    assert.equal(EN_CORE[key], vscEn[key], `en 值须逐字等 VSC locales：${key}`)
  }
  // 键首段 ⊆ 核件 `t()` 发射段集（核件是本键族的产生者——漂移即红）
  const emitted = new Set()
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) { walk(path); continue }
      if (!entry.name.endsWith(".mjs")) continue
      for (const match of readFileSync(path, "utf8").matchAll(/\bt\(\s*["']([\w.]+)["']/g)) emitted.add(match[1].split(".")[0])
    }
  }
  walk(CORE_DIR)
  for (const key of Object.keys(ZH_CORE)) assert.ok(emitted.has(key.split(".")[0]), `键首段须属核件发射段集：${key}`)
  for (const key of Object.keys(ZH_CORE)) {
    assert.equal(ZH[key], ZH_CORE[key], `zh 门面合体：${key}`)
    assert.equal(EN[key], EN_CORE[key], `en 门面合体：${key}`)
  }
  // 装订（装配期）+ 语言切换重注册（语言变 ⇒ 重挂本页 ⇒ 重注册）
  await fMount({ routes: {}, chunks: [] })
  assert.equal(CORE_I18N.t("tool.done"), ZH_CORE["tool.done"], "装配期装订（zh）")
  I18N.setLang("en")
  await fMount({ routes: {}, chunks: [] })
  assert.equal(CORE_I18N.t("tool.done"), EN_CORE["tool.done"], "语言切换重挂 ⇒ 重注册（en）")
  I18N.setLang("zh")
})

// ── ⑦ 档面（§5/§6）──────────────────────────────────────────────────────────

test("⑦ 档面：档目 50 ∥ 49（favicon 除外）∥ 零外链 ∥ 新增类 ⊆ 核件发射类清单 ∥ 自持渲染零残留", () => {
  const files = readdirSync(PUBLIC_DIR)
  assert.equal(files.length, 50, `档目同拍：50（实读 ${files.length}）——2026-10-13 父侧收正（+在途新档两件）`)
  assert.equal(files.filter((name) => name !== "favicon.png").length, 49, "档目同拍：49（favicon 除外）")
  assert.ok(files.includes("i18n-zh-core.mjs") && files.includes("i18n-en-core.mjs"), "核件词面两部件在册")
  for (const name of ["i18n-zh-core.mjs", "i18n-en-core.mjs", "views-chat.mjs", "style.css"]) {
    assert.ok(!/https?:\/\//.test(readPublic(name)), `零外链（AC-14）：${name}`)
  }
  // 本批新增类 ⊆ 核件发射类清单（AC-19 canon 随正面的本批证据——父侧闭包腿按此清单收正）
  const emitted = new Set()
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) { walk(path); continue }
      if (!entry.name.endsWith(".mjs")) continue
      const src = readFileSync(path, "utf8")
      for (const match of src.matchAll(/className\s*=\s*["'`]([\w\s-]+)["'`]/g)) for (const token of match[1].split(/\s+/)) if (token) emitted.add(token)
      for (const match of src.matchAll(/classList\.(?:add|remove|toggle)\(\s*["']([\w-]+)["']/g)) emitted.add(match[1])
      for (const match of src.matchAll(/class="([^"${]*?)"/g)) for (const token of match[1].split(/\s+/)) if (token) emitted.add(token)
      if (src.includes('class="tk-${')) for (const match of src.matchAll(/type:\s*"([a-z]+)"/g)) emitted.add(`tk-${match[1]}`) // token 类 = `tk-${t.type}` 模板面（字面源 = tokenize 的 type 枚）
    }
  }
  walk(CORE_DIR)
  const ADDED = ["tool-call", "tool-call-header", "tool-call-icon", "tool-call-name", "tool-call-args", "tool-call-status", "tool-call-summary", "tool-call-body", "code-block", "code-lang", "tk-comment", "tk-keyword", "tk-string", "tk-number", "tk-type", "open"]
  for (const name of ADDED) assert.ok(emitted.has(name), `新增类须属核件发射类清单：${name}`)
  for (const name of ADDED.filter((item) => item !== "open")) assert.ok(CSS.includes(`.${name}`), `样式面须在册：.${name}`)
  assert.ok(CSS.includes(".tool-call-icon.open") && CSS.includes(".tool-call-body.open"), "态类（`open`）样式在册")
  // 自持渲染零残留 + 复用形接线（页面侧件面单源）
  for (const dead of ["chat-msg tool", "chat-tool-arrow", "toolRow", "toolArgsIndex"]) assert.ok(!VIEW_SRC.includes(dead), `自持渲染残留：${dead}`)
  for (const retired of ["admin.chat.toolCall", "admin.chat.toolResult", "admin.chat.toolCalling", "admin.chat.toolFailed"]) {
    assert.ok(!VIEW_SRC.includes(retired), `自持行文案面残留：${retired}`)
  } // 自持工具行退役 ⇒ 四键在档面无消费；表侧存废 = 随正裁（既有件 `-admin-agent-chat-ui` 键闭腿）
  assert.ok(!CSS.includes(".chat-msg.tool"), "自持工具行样式零残留")
  const COMPOSER_SRC = readPublic("views-chat-composer.mjs")
  for (const spec of ["/rc/flow/block.mjs", "/rc/flow/tool-card.mjs", "/rc/flow/stream.mjs", "/rc/scroll.mjs", "/rc/i18n.mjs"]) {
    assert.ok(VIEW_SRC.includes(`from "${spec}"`), `核件接线缺位（页件）：${spec}`)
  }
  // `/rc/lib.mjs` 随消息面外拆迁出（console-chat-live-step 批）——归外拆件核（2026-10-13 父侧收正）
  const MESSAGES_SRC = readPublic("views-chat-messages.mjs")
  assert.ok(MESSAGES_SRC.includes(`from "/rc/lib.mjs"`), "核件接线缺位（外拆件）：/rc/lib.mjs")
  for (const spec of ["/rc/composer/panel.mjs", "/rc/composer/slash.mjs", "/rc/flow/queued-mark.mjs", "/rc/toast.mjs", "/rc/lib.mjs"]) {
    assert.ok(COMPOSER_SRC.includes(`from "${spec}"`), `核件接线缺位（输入区件）：${spec}`)
  }
  // 不做项机检（§2.10 ⑥–⑪）+ 取件面白名单（chat-shell-align 批扩面后——逐件校）：核件零拷贝副本 ∥ 零 `../node_modules` 相对径
  const ALLOWED_VIEW = ["/rc/flow/block.mjs", "/rc/flow/tool-card.mjs", "/rc/flow/stream.mjs", "/rc/scroll.mjs", "/rc/i18n.mjs", "/rc/lib.mjs"]
  const ALLOWED_MESSAGES = ["/rc/flow/block.mjs", "/rc/flow/tool-card.mjs", "/rc/lib.mjs"]
  const ALLOWED_COMPOSER = ["/rc/composer/panel.mjs", "/rc/composer/slash.mjs", "/rc/flow/queued-mark.mjs", "/rc/toast.mjs", "/rc/lib.mjs"]
  for (const [name, src, allowed] of [["views-chat.mjs", VIEW_SRC, ALLOWED_VIEW], ["views-chat-composer.mjs", COMPOSER_SRC, ALLOWED_COMPOSER], ["views-chat-messages.mjs", MESSAGES_SRC, ALLOWED_MESSAGES]]) {
    const coreImports = [...src.matchAll(/from "(\/rc\/[^"]+)"/g)].map((match) => match[1])
    assert.deepEqual(coreImports.filter((spec) => !allowed.includes(spec)), [], `${name} 取件面越出对齐集`)
  }
  assert.ok(!VIEW_SRC.includes("../node_modules"), "零 `../node_modules` 相对径（单 HTTP 根越根不可达——设计点）")
  for (const name of ["md.mjs", "highlight.mjs", "tool-summary.mjs", "scroll.mjs", "tool-card.mjs", "stream.mjs", "live-md.mjs", "live-scan.mjs", "reasoning.mjs", "search.mjs"]) {
    assert.ok(!files.includes(name), `核件拷贝副本残留：public/${name}`)
  }
})
