/**
 * 2026-10-13-member-face-chat-ui.test.mjs — thincoder-server 批内件（`member-face-chat` 批 · 台账 #1215；名随批档 · 住 `docs/batches/`）：
 * 成员面对话页（`#/me/chat`——`views-me-chat{,-messages,-composer}.mjs`）：页面结构/四相引导 ∥ 会话条工作区维度 ∥ 盒态动作
 * （启动/拉仓四态）∥ 活流帧消费与同形签名 ∥ notice 第六值 `box_lost` ∥ 键族/接线/样式面 ∥ 结构 canons。
 * 运行（自 `thincoder/` 仓根——`--import` 缝行不可省：页/核同源取件面 = `/rc/**`）：
 *   `node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-13-member-face-chat-ui.test.mjs`
 *
 * 判据源 = `webui/CHAT.md` §2.2/§4（本批行——成员面页面腿）+ 批档 §2.1① ∥ `agent/MEMBER-AGENT.md` §6（AC-50①）/§7（页面腿 = **N76** 页面结构 ∥ **N77** 页面帧消费；盒侧 B69–B72 ∥ 服务端 N71–N75 ∥ 错误 E54–E57 **不在本档面**——同号面别限定）。
 * 面别限定：用例号沿「成员面」序列（N71–N78 ∥ B69–B72 ∥ E54–E57——与管理面同号项区分）。
 * 登记差异位（沿 `2026-10-12-console-chat-live-step.test.mjs` 先例——核侧对位探针实测）：活流卡 `span.tool-call-summary`
 * 有、回读卡无；同形比对 = **剔除该位后逐字相等**（白名单非容差）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const PUBLIC_DIR = join(ROOT, "thincoder-server", "public")
const readPublic = (name) => readFileSync(join(PUBLIC_DIR, name), "utf8")
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const CORE_I18N = await import("/rc/i18n.mjs")
const ZH_CORE_MOD = await load("thincoder-server/public/i18n-zh-core.mjs")
const ZH_ME_MOD = await load("thincoder-server/public/i18n-zh-me.mjs")
const EN_ME_MOD = await load("thincoder-server/public/i18n-en-me.mjs")
const ZH_SHELL_MOD = await load("thincoder-server/public/i18n-zh-shell.mjs")
const EN_SHELL_MOD = await load("thincoder-server/public/i18n-en-shell.mjs")
const ZH_ADMIN_MOD = await load("thincoder-server/public/i18n-zh-admin.mjs")
const NAV = await load("thincoder-server/public/nav.mjs")
const PAGE = await load("thincoder-server/public/views-me-chat.mjs")
const MESSAGES = await load("thincoder-server/public/views-me-chat-messages.mjs")
const COMPOSER = await load("thincoder-server/public/views-me-chat-composer.mjs")

const ZH_ME = ZH_ME_MOD.ZH_ME
const EN_ME = EN_ME_MOD.EN_ME
const ZH_SHELL = ZH_SHELL_MOD.ZH_SHELL
const EN_SHELL = EN_SHELL_MOD.EN_SHELL
const ZH_ADMIN = ZH_ADMIN_MOD.ZH_ADMIN
const PAGE_SRC = readPublic("views-me-chat.mjs")
const MESSAGES_SRC = readPublic("views-me-chat-messages.mjs")
const COMPOSER_SRC = readPublic("views-me-chat-composer.mjs")
const APP_SRC = readPublic("app.mjs")
const NAV_SRC = readPublic("nav.mjs")
const STYLE_SRC = readPublic("style.css")
/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」U+2014 ∥ 「…」U+2026 等中性标点不在内——全仓 canon 同式）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
const MODEL = "fake/kimi-k3"
const TS = "2026-10-13T10:00:00.000Z"
/** 登记差异位（唯一——见档头；同形比对白名单：仅此一项剔除）。 */
const REGISTERED_SUMMARY = "span.tool-call-summary"

// ── 装置：假 DOM（核件真跑——沿批目录先例：`2026-10-12-console-chat-live-step.test.mjs` 装置）──

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" }
const decode = (text) => text.replace(/&(?:amp|lt|gt|quot|#39);/g, (match) => ENTITIES[match])

function parseFragment(html) {
  const out = []
  const stack = [{ node: null }]
  const childrenOf = (frame) => (frame.node === null ? out : frame.node.children)
  const attach = (node) => {
    const frame = stack.at(-1)
    childrenOf(frame).push(node)
    if (frame.node !== null) node.parent = frame.node
  }
  const pushText = (chunk) => {
    const text = decode(chunk)
    if (text.trim() === "") return
    const node = makeNode("#text")
    node.textContent = text
    attach(node)
  }
  const re = /<\/?([a-z0-9]+)((?:\s+[\w-]+="[^"]*")*)\s*\/?>/gi
  let last = 0
  let match
  while ((match = re.exec(html)) !== null) {
    pushText(html.slice(last, match.index))
    last = re.lastIndex
    const tag = match[1].toLowerCase()
    if (match[0].startsWith("</")) { if (stack.length > 1) stack.pop(); continue }
    const node = makeNode(tag)
    const cls = /\bclass="([^"]*)"/.exec(match[2] ?? "")
    if (cls !== null) node.className = cls[1]
    const id = /\bid="([^"]*)"/.exec(match[2] ?? "")
    if (id !== null) node.setAttribute("id", id[1])
    attach(node)
    if (!match[0].endsWith("/>") && !["br", "img", "hr", "input"].includes(tag)) stack.push({ node })
  }
  pushText(html.slice(last))
  return out
}

const walk = (node, out = []) => { for (const child of node.children ?? []) { if (child && typeof child === "object") { out.push(child); walk(child, out) } } return out }

function makeNode(tag) {
  let text = ""
  const node = {
    tag, children: [], listeners: {}, attrs: {}, parent: null, style: {}, dataset: {},
    open: false, value: "", hidden: false, disabled: false, readOnly: false, placeholder: "",
    scrollTop: 0, scrollHeight: 2000, clientHeight: 800, selectionStart: 0, selectionEnd: 0, isConnected: true,
    get innerHTML() { return this._html ?? "" },
    set innerHTML(value) { this._html = String(value); this.children = []; for (const child of parseFragment(this._html)) { child.parent = this; this.children.push(child) } },
    get textContent() { return node.children.length > 0 ? node.children.map((child) => (typeof child === "string" ? child : (child.textContent ?? ""))).join("") : text },
    set textContent(value) { text = String(value); node.children = [] },
    get firstChild() { return this.children[0] ?? null },
    get nextSibling() { const siblings = this.parent?.children ?? []; return siblings[siblings.indexOf(this) + 1] ?? null },
    get ownerDocument() { return globalThis.document },
  }
  const classes = new Set()
  Object.defineProperty(node, "className", {
    get: () => [...classes].join(" "),
    set: (value) => { classes.clear(); for (const token of String(value).split(/\s+/)) if (token) classes.add(token) },
  })
  node.classList = {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    contains: (name) => classes.has(name),
    toggle: (name) => { if (classes.has(name)) { classes.delete(name); return false } classes.add(name); return true },
  }
  node.append = (...items) => { for (const item of items.flat(Infinity)) { if (item === null || item === undefined || item === false) continue; if (typeof item === "object") item.parent = node; node.children.push(item) } }
  node.appendChild = (item) => { node.append(item); return item }
  node.prepend = (...items) => { const list = items.flat(Infinity).filter((item) => item !== null && item !== undefined && item !== false); for (const item of list) if (typeof item === "object") item.parent = node; node.children.unshift(...list) }
  node.insertBefore = (item, ref) => { const index = node.children.indexOf(ref); if (item !== null && typeof item === "object") item.parent = node; if (index === -1) node.children.push(item); else node.children.splice(index, 0, item); return item }
  node.replaceChildren = (...items) => { node.children = []; node.append(...items) }
  node.removeChild = (item) => { node.children = node.children.filter((child) => child !== item); return item }
  node.querySelector = (selector) => walk(node).find((child) => matches(child, selector)) ?? null
  node.querySelectorAll = (selector) => walk(node).filter((child) => matches(child, selector))
  node.matches = (selector) => matches(node, selector)
  node.closest = (selector) => { let current = node; while (current) { if (matches(current, selector)) return current; current = current.parent } return null }
  node.addEventListener = (type, fn) => { (node.listeners[type] ??= []).push(fn) }
  node.removeEventListener = (type, fn) => { node.listeners[type] = (node.listeners[type] ?? []).filter((item) => item !== fn) }
  node.setAttribute = (name, value) => { node.attrs[name] = String(value) }
  node.getAttribute = (name) => node.attrs[name] ?? null
  node.removeAttribute = (name) => { delete node.attrs[name] }
  node.remove = () => { if (node.parent !== null) node.parent.children = node.parent.children.filter((child) => child !== node); node.parent = null }
  node.focus = () => {}
  node.setSelectionRange = () => {}
  node.scrollIntoView = () => {}
  node.fire = (type, event = {}) => {
    const target = { target: node, preventDefault() {}, stopPropagation() {}, ...event }
    return Promise.all((node.listeners[type] ?? []).map((fn) => fn(target)))
  }
  node.showModal = () => { node.open = true }
  node.close = () => { node.open = false; for (const fn of node.listeners.close ?? []) fn({}) }
  return node
}

/** 选择器面（本档只用到：`#id` ∥ `.a` ∥ `.a.b` ∥ `tag` ∥ `tag.class`）。 */
function matches(node, selector) {
  if (typeof node === "string") return false
  const attr = /\[([\w-]+)(?:=(?:"([^"]*)"|([^\]]+)))?\]$/.exec(selector)
  const head = attr === null ? selector : selector.slice(0, attr.index)
  if (attr !== null) {
    const value = node.attrs?.[attr[1]] ?? null
    if (value === null) return false
    const wanted = attr[2] ?? attr[3]
    if (wanted !== undefined && value !== wanted) return false
  }
  if (head === "") return true
  if (head.startsWith("#")) return (node.attrs?.id ?? node.id) === head.slice(1)
  if (head.startsWith(".")) return head.slice(1).split(".").every((name) => node.classList?.contains(name) === true)
  const tagMatch = /^([a-z]+)((?:\.\w+)*)$/.exec(head)
  if (tagMatch === null) return false
  if (node.tag !== tagMatch[1]) return false
  return tagMatch[2].split(".").filter(Boolean).every((name) => node.classList?.contains(name) === true)
}

/** 假环境装台（`document`/`window`/rAF 桩——核 `createStreamRenderer` 帧纪律需 rAF 全局）。 */
function installDom() {
  const head = makeNode("head")
  const body = makeNode("body")
  const html = makeNode("html")
  const document = {
    head, body, scrollingElement: html,
    createElement: (tag) => makeNode(tag),
    createTextNode: (text) => { const node = makeNode("#text"); node.textContent = String(text); return node },
    getElementById: (id) => [head, body, html].map((node) => node.querySelector(`#${id}`)).find((hit) => hit !== null) ?? null,
    querySelector: (selector) => [head, body, html].map((node) => node.querySelector(selector)).find((hit) => hit !== null) ?? null,
    querySelectorAll: (selector) => [head, body, html].flatMap((node) => node.querySelectorAll(selector)),
    addEventListener: () => {},
    removeEventListener: () => {},
  }
  globalThis.document = document
  globalThis.window = { innerWidth: 1200, innerHeight: 800, addEventListener() {}, removeEventListener() {}, document }
  globalThis.requestAnimationFrame = (callback) => setTimeout(() => callback(Date.now()), 0)
  return { document, head, body, html, mount: makeNode("main") }
}

/** `h`（app.mjs 语义近似——class ∥ text ∥ on* ∥ 受控属性 ∥ setAttribute + 子节点）。 */
function fH(tag, props = {}, ...children) {
  const node = makeNode(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue
    if (key === "class") node.className = value
    else if (key === "text") node.textContent = String(value)
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value)
    else if (["value", "checked", "disabled", "hidden"].includes(key)) node[key] = value
    else node.setAttribute(key, value)
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue
    node.append(typeof child === "object" ? child : String(child))
  }
  return node
}

/** 叶面文本（只取叶子/文本节点——祖先 `textContent` 含后代，逐节点取会重复计数）。 */
const textOf = (node) => [node, ...walk(node)]
  .filter((item) => typeof item === "string" || item.tag === "#text" || (item.children ?? []).length === 0)
  .map((item) => (typeof item === "string" ? item : (item.textContent ?? "")))
  .join("\n")

/** 形态签名（**标签/类名序**——元素节点文档序；文本节点不计——判据单源 = `webui/CHAT.md` §2.1②）。 */
function signature(node, out = []) {
  for (const child of node.children ?? []) {
    if (typeof child !== "object" || child === null || child.tag === "#text") continue
    out.push(`${child.tag}.${(child.className ?? "").split(/\s+/).filter(Boolean).join(".")}`)
    signature(child, out)
  }
  return out
}

/** 假流（NDJSON 分块 ⇒ response——体 = 帧行 + 换行）。 */
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

/** 确定性等待（假流即时 resolve——固定宏任务拍数；零墙钟依赖）。 */
async function settle(ticks = 12) {
  for (let index = 0; index < ticks; index++) await new Promise((resolve) => setTimeout(resolve, 0))
}

/** 注释剥离（块注释 ∥ 行注释——字符串态机：`//` 落在字符串内不误判）。 */
function stripComments(src) {
  let out = ""
  let index = 0
  let quote = null
  while (index < src.length) {
    const char = src[index]
    const next = src[index + 1]
    if (quote === null && char === "/" && next === "*") { const end = src.indexOf("*/", index + 2); index = end === -1 ? src.length : end + 2; continue }
    if (quote === null && char === "/" && next === "/") { const end = src.indexOf("\n", index); index = end === -1 ? src.length : end; continue }
    if (quote === null && (char === '"' || char === "'" || char === "`")) quote = char
    else if (quote !== null && char === quote && src[index - 1] !== "\\") quote = null
    out += char
    index += 1
  }
  return out
}

// ── 夹具（工作区/会话/帧序——行形 = `gateway/API.md` §2.11）──────────────────────────

const WORKSPACE = { id: 11, name: "研发盒", runnerName: "runner-a", boxState: "running", checkpointCount: 2, pending: null }
const SESSION = { id: "11:2", workspaceId: 11, workspaceName: "研发盒", model: MODEL, reasoning: "low", status: "idle", excerpt: "在吗", agentOnline: true, updatedAt: TS }
const STEP_TEXT = ["先查", "再看", "收尾"]
const CALLS = [
  { id: "c1", name: "sandbox", args: '{"op":"ls"}', summary: "已办" },
  { id: "c2", name: "projects", args: '{"q":""}', summary: "已办" },
]
const USER_TEXT = "在吗"

/** 活流帧序（`turn`(1) ∥ A ∥ call ∥ result ∥ `turn`(2) ∥ B ∥ call ∥ result ∥ `turn`(3) ∥ C——无 `end`）。 */
function liveFrames() {
  return [
    { type: "turn", n: 1 },
    { type: "delta", text: STEP_TEXT[0] },
    { type: "call", id: CALLS[0].id, name: CALLS[0].name, args: CALLS[0].args },
    { type: "result", id: CALLS[0].id, ok: true, summary: CALLS[0].summary },
    { type: "turn", n: 2 },
    { type: "delta", text: STEP_TEXT[1] },
    { type: "call", id: CALLS[1].id, name: CALLS[1].name, args: CALLS[1].args },
    { type: "result", id: CALLS[1].id, ok: true, summary: CALLS[1].summary },
    { type: "turn", n: 3 },
    { type: "delta", text: STEP_TEXT[2] },
  ]
}

/** 回读夹具（同内容——盒内槽行 ⇒ `messageNodes`）：assistant 行 ×3 + tool 行 ×2。 */
function readRows() {
  return [
    { seq: 1, role: "user", content: USER_TEXT, data: null, createdAt: TS },
    { seq: 2, role: "assistant", content: STEP_TEXT[0], data: { toolCalls: [{ id: CALLS[0].id, name: CALLS[0].name, args: CALLS[0].args }] }, createdAt: TS },
    { seq: 3, role: "tool", content: '{"ok":true}', data: { toolCallId: CALLS[0].id, name: CALLS[0].name, ok: true, summary: CALLS[0].summary }, createdAt: TS },
    { seq: 4, role: "assistant", content: STEP_TEXT[1], data: { toolCalls: [{ id: CALLS[1].id, name: CALLS[1].name, args: CALLS[1].args }] }, createdAt: TS },
    { seq: 5, role: "tool", content: '{"ok":true}', data: { toolCallId: CALLS[1].id, name: CALLS[1].name, ok: true, summary: CALLS[1].summary }, createdAt: TS },
    { seq: 6, role: "assistant", content: STEP_TEXT[2], data: null, createdAt: TS },
  ]
}

/** 定时接管：`≥ PULL_POLL_MS` 量级的定时 ⇒ 0ms 落地（零真实等待——确定性；其余定时原样）；出口必复原。 */
async function withFastPoll(run) {
  const realSetTimeout = globalThis.setTimeout
  globalThis.setTimeout = (fn, ms, ...rest) => realSetTimeout(fn, ms >= PAGE.PULL_POLL_MS ? 0 : ms, ...rest)
  try { return await run() } finally { globalThis.setTimeout = realSetTimeout }
}

/** 页面装配（`#/me/chat`——取数三件：工作区读数 ∥ 会话列表 ∥ 模型候选）。 */
async function runPage(options = {}) {
  const { workspaces = [], sessions = [], detail = null, frames = [], pullStates = [], startsTo = "running", models = [{ id: MODEL, reasoning: ["low", "high"] }] } = options
  const dom = installDom()
  CORE_I18N.setStrings(ZH_CORE_MOD.ZH_CORE)
  const liveWorkspaces = workspaces.map((ws) => ({ ...ws }))
  const liveSessions = sessions.map((row) => ({ ...row }))
  const calls = []
  const failures = []
  const flashes = []
  const pulls = []
  let created = 0
  const ctx = {
    h: fH,
    fmtTs: (value) => String(value ?? ""),
    api: async (path, request = {}) => {
      const method = request?.method ?? "GET"
      calls.push({ path, method, body: request?.body })
      if (path === "/api/me/sandbox/workspaces") return { workspaces: liveWorkspaces }
      if (path === "/api/me/chat/models") return { models }
      if (path === "/api/me/chat/sessions" && method === "GET") return { sessions: liveSessions }
      if (path === "/api/me/chat/sessions" && method === "POST") {
        created += 1
        const row = { ...SESSION, id: `11:${8 + created}`, excerpt: "" }
        liveSessions.unshift(row)
        return { session: row }
      }
      if (path.startsWith("/api/me/chat/sessions/") && method === "PATCH") return { session: { ...(liveSessions[0] ?? SESSION), ...request.body } }
      if (path.endsWith("/abort")) return {}
      if (path.endsWith("/start")) { for (const ws of liveWorkspaces) ws.boxState = startsTo; return {} }
      if (path.startsWith("/api/projects")) return { projects: [{ id: 7, address: "https://gitee.com/acme/demo.git", displayName: "acme/demo" }] }
      if (path.endsWith("/pulls") && method === "POST") { pulls.push({ path, body: request.body }); return { pullId: "p1" } }
      if (path.includes("/pulls/")) return pullStates.shift() ?? { state: "running", detail: "" }
      if (path.startsWith("/api/me/chat/sessions/")) return detail ?? { session: liveSessions[0] ?? SESSION, messages: [] }
      throw new Error(`unexpected api：${method} ${path}`)
    },
    fail: (error) => failures.push(String(error?.message ?? error)),
    flash: (text) => flashes.push(String(text)),
  }
  globalThis.fetch = async () => fStreamResponse(frames.map((frame) => `${JSON.stringify(frame)}\n`))
  await PAGE.renderMeChat(ctx, dom.mount)
  await settle()
  return { dom, ctx, calls, failures, flashes, pulls, pullStates, liveSessions, liveWorkspaces, thread: dom.mount.querySelector(".chat-thread"), bar: dom.mount.querySelector(".chat-bar") }
}

/** 发一条（输入区 Enter——核面板提交径）。 */
async function send(page, text = USER_TEXT) {
  const input = page.dom.mount.querySelector("textarea")
  assert.ok(input, "输入区 textarea 在册")
  input.value = text
  await input.fire("keydown", { key: "Enter", shiftKey: false, isComposing: false })
  await settle()
}

// ── N76 页面结构（四轴件 ∥ 零 `.card` ∥ 五钮收窄 ∥ 核件全件消费）────────────────────

test("N76 结构：四轴件在册 ∥ 零 `.card` ∥ 收窄五钮 CSS ∥ 核件全件消费（页/核同源取件面）", async () => {
  const page = await runPage({ workspaces: [], sessions: [] })
  assert.ok(page.dom.mount.querySelector(".chat-bar"), "① 会话条在册")
  assert.ok(page.thread, "② 消息流容器在册")
  assert.ok(page.dom.mount.querySelector("#toolbar"), "③ 输入区容器 `#toolbar` 在册（核件适配层① 容器自建）")
  assert.equal(page.dom.mount.querySelectorAll("#status-line").length, 1, "④ 状态行恰一枚（`#toolbar` 首子）")
  assert.ok(page.dom.mount.querySelector("#input") && page.dom.mount.querySelector("#send-btn") && page.dom.mount.querySelector("#abort-btn"), "核面板三件（输入 ∥ 发送 ∥ 中止）在册")
  assert.equal(page.dom.mount.querySelectorAll(".card").length, 0, "本页零 `.card` 面（引导块 = `.chat-guide`）")
  assert.ok(page.dom.mount.querySelector(".chat-guide"), "空态 = 四相引导块在册")
  for (const href of COMPOSER.CORE_CSS) assert.ok(page.dom.head.querySelector(`link[data-rc-css="${href}"]`), `核件样式档注入：${href}`)
  assert.equal(page.dom.head.querySelectorAll("link").length, COMPOSER.CORE_CSS.length, "两样式档幂等（重渲零重复）")
  // 无源钮收窄（§2.2 差异④——五枚 CSS 隐藏 + 主机凭据钮不设）
  for (const id of ["#auto-btn", "#advisor-btn", "#eng-btn", "#plan-btn", "#settings-btn"]) assert.ok(STYLE_SRC.includes(`${id}`), `收窄面在册：${id}`)
  assert.ok(!PAGE_SRC.includes("hostCred") && !COMPOSER_SRC.includes("hostCred"), "主机凭据钮不设（成员面无源）")
  // 核件消费（源面：页内零自持消息/工具件渲染——归核件与自持外拆件）
  for (const spec of ["/rc/flow/block.mjs", "/rc/flow/tool-card.mjs", "/rc/flow/stream.mjs", "/rc/scroll.mjs", "/rc/i18n.mjs"]) {
    assert.ok(PAGE_SRC.includes(spec), `核件取件面在册：${spec}`)
  }
  for (const spec of ["/rc/composer/panel.mjs", "/rc/composer/slash.mjs", "/rc/flow/queued-mark.mjs", "/rc/toast.mjs", "/rc/lib.mjs"]) {
    assert.ok(COMPOSER_SRC.includes(spec) || PAGE_SRC.includes(spec) || MESSAGES_SRC.includes(spec), `核件取件面在册：${spec}`)
  }
  assert.equal(/from "\.\/views-chat/.test(PAGE_SRC + COMPOSER_SRC + MESSAGES_SRC), false, "自持同构件（零 `views-chat*` 导入——公共适配层抽取 = 登记不做）")
})

// ── N76 四相引导（§2.2——① 无工作区 ② 盒未运行 ③ 卷空 ④ 直聊）─────────────────────

test("N76 四相：① 无工作区 ⇒ 建引导 ∥ ② 盒未运行 ⇒ 启动 ∥ ③ 卷空 ⇒ 拉仓+新会话 ∥ ④ 有会话 ⇒ 直聊", async () => {
  const none = await runPage({ workspaces: [], sessions: [] })
  assert.equal(textOf(noone(none).querySelector("p")), ZH_ME["me.chat.noWorkspace"], "相① 提示句 = 键面文案")
  assert.equal(textOf(noone(none).querySelector("button")), ZH_ME["me.chat.createWorkspace"], "相① 动作 = 创建工作区")

  const stopped = await runPage({ workspaces: [{ ...WORKSPACE, boxState: "stopped", stopReason: "idle" }], sessions: [] })
  const stoppedGuide = stopped.dom.mount.querySelector(".chat-guide")
  assert.equal(textOf(stoppedGuide.querySelector("p")), ZH_ME["me.chat.wsBoxStopped"], "相② 提示句在册")
  assert.equal(textOf(stoppedGuide.querySelector("button")), ZH_ME["me.chat.startWorkspace"], "相② 动作 = 启动工作区")

  const empty = await runPage({ workspaces: [WORKSPACE], sessions: [] })
  const emptyGuide = empty.dom.mount.querySelector(".chat-guide")
  const emptyButtons = emptyGuide.querySelectorAll("button").map((node) => textOf(node))
  assert.equal(textOf(emptyGuide.querySelector("p")), ZH_ME["me.chat.wsEmptyVolume"], "相③ 提示句在册")
  assert.deepEqual(emptyButtons, [ZH_ME["me.chat.pull"], ZH_ME["me.chat.newSession"]], "相③ 直聊不设门（拉仓引导 + 新会话钮）")

  const chat = await runPage({ workspaces: [WORKSPACE], sessions: [SESSION], detail: { session: SESSION, messages: readRows() } })
  assert.equal(chat.dom.mount.querySelector(".chat-guide") === null, true, "相④ 有会话 ⇒ 零引导块（直聊）")
  assert.equal(chat.thread.querySelectorAll(".message.assistant").length, 3, "回读装配：助手块 = 步数（3）")
  assert.equal(chat.thread.querySelectorAll(".message.user").length, 1, "用户块一枚")

  function noone(page) { return page.dom.mount.querySelector(".chat-guide") }
})

// ── N76 会话条（§2.2 差异②——工作区名 + 盒态读数 + 在线态 + 选择器行形）──────────────

test("N76 会话条：工作区名+盒态+在线态 ∥ 选择器行形 ∥ 启动动作 ⇒ 读数刷新", async () => {
  const page = await runPage({ workspaces: [WORKSPACE], sessions: [SESSION], detail: { session: SESSION, messages: readRows() } })
  const info = textOf(page.bar.querySelector(".chat-ws"))
  assert.ok(info.includes("研发盒"), "会话条示工作区名")
  assert.ok(info.includes(ZH_ME["me.sandbox.stateRunning"]), "盒态读数（运行中——沿工作区面键族）")
  assert.ok(info.includes(ZH_ME["me.chat.online"]), "在线态（`agentOnline` ⇒ 已连接）")
  const option = page.bar.querySelector("option")
  assert.equal(option.value, "11:2", "选择器值 = 会话 id（复合形）")
  assert.equal(option.textContent, `研发盒 · ${MODEL} · 在吗 · ${TS}`, "选择器行形 = 工作区名 · 模型 · 摘要 · 时间")
  assert.equal(page.bar.querySelector("button").hidden, false, "「新会话」钮在场（有工作区）")

  const stopped = await runPage({ workspaces: [{ ...WORKSPACE, boxState: "stopped", stopReason: "wallclock_ttl" }], sessions: [], startsTo: "running" })
  const startBtn = stopped.bar.querySelectorAll("button")[1]
  assert.equal(startBtn.hidden, false, "盒未运行 ⇒ 就地形「启动工作区」在场")
  assert.ok(textOf(stopped.bar.querySelector(".chat-ws")).includes(ZH_ME["me.sandbox.stopWallclock"]), "已停读数携回收原因")
  await startBtn.fire("click")
  await settle()
  assert.ok(stopped.calls.some((call) => call.method === "POST" && call.path === "/api/me/sandbox/workspaces/11/start"), "启动 = `POST …/workspaces/:id/start`")
  assert.ok(textOf(stopped.bar.querySelector(".chat-ws")).includes(ZH_ME["me.sandbox.stateRunning"]), "启动落定 ⇒ 读数刷新（盒态转运行中）")
  assert.equal(stopped.dom.mount.querySelector(".chat-guide") !== null, true, "无会话仍归引导面（卷空）")
})

// ── N76 状态行段表（同款段表——“界面跟 VSC/桌面基本一致”）──────────────────────────

test("N76 状态行：段序/文案沿 §2.1 段表（本面键族 `me.chat.status*`——值与 admin 面同字）", () => {
  const now = 100000
  const segments = COMPOSER.statusSegments({
    running: true, model: MODEL, turn: 2, toolName: "sandbox",
    prompt: 13000, completion: 900, cacheHit: 75, cacheMiss: 25,
    contextPct: 1, startedAt: 0, frozenMs: 7000, lastOutputAt: now - 11000,
  }, now)
  assert.deepEqual(segments.map((seg) => seg.text), ["运行中…", "工具: sandbox", "↑13k ↓900", "hit75%", "context 1%", "轮次 2", "耗时 7s", "已静默 11s"], "段序 = §2.1④ 表")
  assert.deepEqual(segments.map((seg) => seg.warn), [false, false, false, false, false, false, false, false], "零警示段（context 1% < 80%）")
  assert.equal(COMPOSER.statusSegments({ ...COMPOSER.emptyStatusState(), contextPct: 90 })[0].warn, true, "context ≥80% ⇒ 警示段")
  assert.deepEqual(COMPOSER.statusSegments(COMPOSER.emptyStatusState(), now), [], "零态 ⇒ 零段（段表 ⊆ 有源）")
  for (const key of ["statusRunning", "statusTool", "statusContext", "statusCache", "statusTurn", "statusElapsed", "statusQuiet"]) {
    assert.equal(ZH_ME[`me.chat.${key}`], ZH_ADMIN[`admin.chat.${key}`], `段表同字（${key}——同款状态行段表）`)
  }
})

// ── N77 活流帧消费（按步块 ∥ 同形签名 ∥ notice 第六值）──────────────────────────────

test("N77 活流：按步块（卡归当步）∥ 同形签名（剔登记位逐字相等）∥ `box_lost` 第六值", async () => {
  const page = await runPage({ workspaces: [WORKSPACE], sessions: [SESSION], detail: { session: SESSION, messages: [] }, frames: liveFrames() })
  const before = page.thread.querySelectorAll(".message.assistant").length
  assert.equal(before, 0, "发前 = 空白会话（零回读块）")
  await send(page)
  assert.deepEqual(page.failures, [], "回合期零 `ctx.fail`")
  const blocks = page.thread.querySelectorAll(".message.assistant")
  assert.equal(blocks.length, 3, "活流：块数 = 步数（`turn` 帧开合）")
  assert.deepEqual(blocks.map((block) => textOf(block.querySelector(".bubble.content"))), STEP_TEXT, "泡文本 = 当步文本")
  assert.deepEqual(blocks.map((block) => block.querySelectorAll(".tool-call").length), [1, 1, 0], "卡各归当步（不堆块尾）")
  assert.equal(blocks[0].querySelector(".msg-label") !== null, true, "标签 = 回合首块（一回合一枚）")
  const input = page.dom.mount.querySelector("textarea")
  assert.equal(input.value, "", "受理 ⇒ 草稿不还原")
  const status = textOf(page.dom.mount.querySelector("#status-line"))
  assert.ok(status.includes("轮次 3") && status.includes("工具") === false, "状态行收全帧（`turn` 帧 ⇒ 轮次段）")

  const liveSig = signature(fH("div", {}, ...page.thread.children.filter((child) => typeof child === "object" && child.classList?.contains("message") === true)))
  const restoreSig = signature(fH("div", {}, ...MESSAGES.messageNodes({ h: fH }, readRows())))
  const stripped = (list) => list.filter((item) => item !== REGISTERED_SUMMARY)
  assert.deepEqual(stripped(liveSig), stripped(restoreSig), "活流径 ∥ 回读径「标签/类名序」逐字相等（剔登记位）")
  assert.equal(liveSig.length - stripped(liveSig).length, 2, "登记位计数 = 有摘要卡数（2）")

  // notice 第六值 `box_lost`（本面新增——差异⑤；`end` ⇒ 重读唯一呈现径）
  const lost = await runPage({
    workspaces: [WORKSPACE], sessions: [SESSION], frames: [{ type: "turn", n: 1 }, { type: "delta", text: "半句" }, { type: "end", status: "failed", reason: "box_lost", durationMs: 9, calls: 0 }],
    detail: { session: SESSION, messages: [{ seq: 1, role: "user", content: USER_TEXT, data: null, createdAt: TS }, { seq: 2, role: "notice", content: "", data: { reason: "box_lost" }, createdAt: TS }] },
  })
  await send(lost)
  const notice = lost.thread.querySelector(".message.notice")
  assert.ok(notice, "`box_lost` ⇒ notice 行在场（重读置换）")
  assert.equal(textOf(notice), ZH_ME["me.chat.noticeBoxLost"], "第六值文案 = `me.chat.noticeBoxLost`")
  assert.equal(MESSAGES.noticeText({ data: { reason: "budget" } }), ZH_ME["me.chat.noticeBudget"], "五值映射在册（budget）")
  assert.equal(MESSAGES.noticeText({ content: "服务端原文", data: { reason: "未来值" } }), "服务端原文", "枚举外 ⇒ 服务端原文兜底（零信息丢）")
  assert.equal(MESSAGES.resultText("炸了", false), "Error: 炸了", "失败判据 = 核 `isToolFailure` 单源（无判据头 ⇒ 立核判据头）")
})

// ── N76 拉仓流（相③——可见项目选择制 ∥ 四态人话 ∥ 失败重试）────────────────────────

test("N76 · 拉仓流：四态文案 ∥ 弹窗流程（项目清单 ⇒ 提交 ⇒ 轮询 done 闭窗 ∥ failed 窗内人话+重试）", async () => {
  assert.deepEqual(["queued", "running", "done", "failed"].map((state) => PAGE.pullStateLabel(state)), [ZH_ME["me.chat.pullQueued"], ZH_ME["me.chat.pullRunning"], ZH_ME["me.chat.pullDone"], ZH_ME["me.chat.pullFailed"]], "四态人话在册")
  assert.equal(PAGE.pullStateLabel("unknown"), null, "枚举外 ⇒ `null`（零假造）")
  assert.equal(PAGE.PULL_POLL_MS > 0, true, "轮询间隔在册")

  await withFastPoll(async () => {
    const pulled = await runPage({ workspaces: [WORKSPACE], sessions: [], pullStates: [{ state: "running" }] })
    await pulled.bar.querySelectorAll("button")[2].fire("click")
    await settle()
    const dialog = pulled.dom.body.querySelector("dialog")
    assert.ok(dialog, "拉仓弹窗在场")
    assert.ok(textOf(dialog).includes("acme/demo"), "可见项目清单在场（`GET /api/projects?q=`）")
    const dirInput = dialog.querySelectorAll("input").at(-1)
    dirInput.value = ""
    await dialog.querySelector("form").fire("submit")
    await settle()
    assert.deepEqual(pulled.pulls.map((item) => item.body), [{ projectId: 7 }], "目标目录留空 ⇒ 零字段（缺省 = 仓名——服务端定）")
    assert.ok(textOf(pulled.dom.body.querySelector("dialog")).includes(ZH_ME["me.chat.pullRunning"]), "`running` 态 ⇒ 窗内人话（四态其一——轮询未完 ⇒ 窗未闭）")
    pulled.pullStates.push({ state: "done", detail: "/workspace/demo" }) // 放行：下一轮 ⇒ done
    await settle(20)
    assert.equal(pulled.dom.body.querySelector("dialog") === null, true, "done ⇒ 闭窗")
    assert.ok(pulled.flashes.some((text) => text.includes(ZH_ME["me.chat.pullDone"]) && text.includes("/workspace/demo")), "done ⇒ flash 携目标目录人话")

    const failed = await runPage({ workspaces: [WORKSPACE], sessions: [], pullStates: [{ state: "failed", detail: "目录冲突" }] })
    await failed.bar.querySelectorAll("button")[2].fire("click")
    await settle()
    const dialog2 = failed.dom.body.querySelector("dialog")
    const dirInput2 = dialog2.querySelectorAll("input").at(-1)
    dirInput2.value = "demo"
    await dialog2.querySelector("form").fire("submit")
    await settle()
    assert.deepEqual(failed.pulls.map((item) => item.body), [{ projectId: 7, dir: "demo" }], "目录在场 ⇒ 字段在场")
    const note = dialog2.querySelector(".hint.error")
    assert.equal(note.hidden, false, "failed ⇒ 窗内人话在场（零静默）")
    assert.ok(textOf(note).includes(ZH_ME["me.chat.pullFailed"]) && textOf(note).includes("目录冲突"), "失败分类原文直呈")
    assert.equal(dialog2.querySelector("form").querySelectorAll("button")[0].disabled === false, true, "失败 ⇒ 提交钮复位（重试 = 复提交）")
  })
})

// ── N76 档位拾取（PATCH 回执落读数面——钮面字随新值，零回退）────────────────────────────

test("N76 · 档位拾取：点选 ⇒ `PATCH` 恰一条 ⇒ 钮面字随新值（回执落读数面——零回退）", async () => {
  const page = await runPage({ workspaces: [WORKSPACE], sessions: [SESSION], detail: { session: SESSION, messages: [] } })
  const btn = page.dom.mount.querySelector("#reasoning-btn")
  assert.ok(btn, "档位钮在册（核件控件行）")
  await btn.fire("click")
  const items = page.dom.mount.querySelector("#reasoning-dropdown").querySelectorAll(".dropdown-item")
  assert.equal(items.length, 2, "候选 = 当刻模型行 `reasoning`（两级：low ∥ high）")
  const picked = textOf(items[1])
  await items[1].fire("click")
  await settle()
  assert.deepEqual(page.calls.filter((call) => call.method === "PATCH").map((call) => ({ path: call.path, body: call.body })), [{ path: "/api/me/chat/sessions/11:2", body: { reasoning: "high" } }], "点选 ⇒ `PATCH …/:id` 恰一条（体 = `{ reasoning }`）")
  assert.equal(btn.textContent, picked, "钮面字随新值（回执落列表行 ⇒ `prefs` 随正——零回退）")
})

// ── N76 新会话弹窗（选工作区——一枚 ⇒ 零选择）────────────────────────────────

test("N76 · 新会话弹窗：一枚工作区 ⇒ 零选择 ∥ 多枚 ⇒ 选择在场 ∥ POST 体 `{ workspaceId }` ∥ 落定选中", async () => {
  const single = await runPage({ workspaces: [WORKSPACE], sessions: [] })
  await single.bar.querySelectorAll("button")[0].fire("click")
  await settle()
  const dialog = single.dom.body.querySelector("dialog")
  assert.ok(dialog, "新会话弹窗在场")
  assert.equal(dialog.querySelector("select") === null, true, "一枚工作区 ⇒ 零选择（仅示名）")
  assert.ok(textOf(dialog).includes("研发盒"), "示名在册")
  await dialog.querySelector("form").fire("submit")
  await settle()
  assert.deepEqual(single.calls.filter((call) => call.method === "POST" && call.path === "/api/me/chat/sessions").map((call) => call.body), [{ workspaceId: 11 }], "建会话体 = `{ workspaceId }`（模型缺省服务端定）")
  assert.equal(single.dom.mount.querySelector(".chat-select").value, "11:9", "落定 ⇒ 选中新建会话")

  const multi = await runPage({ workspaces: [WORKSPACE, { ...WORKSPACE, id: 12, name: "备用盒" }], sessions: [] })
  await multi.bar.querySelectorAll("button")[0].fire("click")
  await settle()
  const select = multi.dom.body.querySelector("dialog").querySelector("select")
  assert.ok(select, "多枚 ⇒ 选择器在场")
  assert.deepEqual(select.querySelectorAll("option").map((option) => option.textContent), ["研发盒", "备用盒"], "候选 = 全部本人工作区")
  select.value = "1"
  await multi.dom.body.querySelector("dialog").querySelector("form").fire("submit")
  await settle()
  assert.deepEqual(multi.calls.filter((call) => call.method === "POST" && call.path === "/api/me/chat/sessions").map((call) => call.body), [{ workspaceId: 12 }], "选择生效（第二枚）")
})

// ── 键族面（`me.chat.*` 两表在场 ∥ en 零 CJK ∥ 占位符对位 ∥ shell +1）────────────────

test("键族：`me.chat.*` 两表同键集在场 ∥ en 零 CJK ∥ 占位符对位 ∥ shell `nav.page.me.chat` +1", () => {
  const zhKeys = Object.keys(ZH_ME).filter((key) => key.startsWith("me.chat.")).sort()
  const enKeys = Object.keys(EN_ME).filter((key) => key.startsWith("me.chat.")).sort()
  assert.equal(zhKeys.length, 46, `键族数 = 46（实读 ${zhKeys.length}——批档 §2.4 ≈40）`)
  assert.deepEqual(enKeys, zhKeys, "两表同键集（逐键在场）")
  const placeholders = (text) => (String(text).match(/\{(\w+)\}/g) ?? []).sort()
  for (const key of zhKeys) {
    assert.deepEqual(placeholders(EN_ME[key]), placeholders(ZH_ME[key]), `占位符对位：${key}`)
    assert.equal(CJK.test(EN_ME[key]), false, `en 零 CJK：${key}`)
    assert.equal(ZH_ME[key].trim() === "", false, `zh 非空：${key}`)
  }
  // 消费面闭合：三新档引用的 `me.chat.*` 键全在两表（零悬空键）
  for (const [name, src] of [["views-me-chat.mjs", PAGE_SRC], ["views-me-chat-composer.mjs", COMPOSER_SRC], ["views-me-chat-messages.mjs", MESSAGES_SRC]]) {
    for (const [, key] of src.matchAll(/"(me\.chat\.[\w.]+)"/g)) assert.ok(ZH_ME[key] !== undefined, `${name} 引用键在场：${key}`)
  }
  assert.equal(ZH_SHELL["nav.page.me.chat"].trim() === "", false, "shell zh 键在册")
  assert.equal(EN_SHELL["nav.page.me.chat"], "Chat", "shell en 键在册（零 CJK）")
  assert.equal(CJK.test(EN_SHELL["nav.page.me.chat"]), false, "shell en 零 CJK")
})

// ── 接线面（app.mjs ∥ nav.mjs 我的首位 ∥ 非壳页五路径零动 ∥ style.css）──────────────

test("接线：`app.mjs` 路由在册 ∥ `nav.mjs` 我的组首位 ∥ 非壳页五路径零动 ∥ `style.css` 面", () => {
  assert.ok(APP_SRC.includes('import { renderMeChat } from "./views-me-chat.mjs"'), "`app.mjs` 导入在册")
  assert.ok(APP_SRC.includes('"/me/chat": renderMeChat'), "`PAGES` 路由行在册")
  const shell = /const SHELL_PAGES = new Set\(\[([^\]]*)\]\)/.exec(APP_SRC)
  assert.ok(shell, "`SHELL_PAGES` 在册")
  assert.deepEqual(shell[1].match(/"[^"]+"/g).map((item) => item.slice(1, -1)), ["/admin/members", "/admin/providers", "/admin/models", "/admin/audit", "/me/usage"], "非壳页面零动（五路径）")
  const me = NAV.NAV_GROUPS.find((group) => group.key === "me")
  assert.deepEqual(me.items[0], { key: "chat", labelKey: "nav.page.me.chat", path: "/me/chat" }, "我的组首位 = 对话项")
  assert.equal(NAV.resolveRoute("/me/chat", "member").path, "/me/chat", "路由解析在册")
  assert.ok(STYLE_SRC.includes(".chat-ws {"), "工作区读数段类在册（面外新增两枚之一）")
  assert.ok(STYLE_SRC.includes(".chat-guide {"), "四相引导块类在册")
  const section = STYLE_SRC.slice(STYLE_SRC.indexOf("/* ── 我的·对话"))
  assert.equal(/\.chat-ws[^{]*\{[^}]*:hover/.test(section), false, "本面零新悬停规则")
  assert.equal(section.includes(":root"), false, "本面零新变量（复用既有类族）")
  assert.equal(/--[a-z-]+:\s*#/.test(section), false, "本面零新色值字面（全走既有变量）")
})

// ── 结构腿（canons：≤500 软线 ∥ 零 CJK 代码段 ∥ 行宽 ∥ 零 `innerHTML` ∥ 零外链）──────

test("结构腿：三新档 ≤500 软线 ∥ 零 CJK 代码段 ∥ 行宽 ≤300 ∥ 零 `innerHTML` 写口 ∥ 零外链", () => {
  for (const [name, src] of [["views-me-chat.mjs", PAGE_SRC], ["views-me-chat-messages.mjs", MESSAGES_SRC], ["views-me-chat-composer.mjs", COMPOSER_SRC]]) {
    const lines = src.split("\n").length
    assert.ok(lines <= 500, `${name} ≤500 软线（实读 ${lines}）`)
    assert.equal(CJK.test(stripComments(src)), false, `${name} 代码段零 CJK（文案全入两表）`)
    assert.equal((src.match(/\.innerHTML\s*=/g) ?? []).length, 0, `${name} 零 \`innerHTML\` 写口（md/工具卡归核件）`)
    assert.equal(/https?:\/\//.test(src), false, `${name} 零外链`)
    assert.ok(Math.max(...src.split("\n").map((line) => line.length)) <= 300, `${name} 行宽 ≤300`)
  }
  assert.ok(MESSAGES_SRC.includes("export function messageNodes"), "外拆件 `…-messages.mjs` 承回读装配")
  assert.ok(COMPOSER_SRC.includes("export function createMeChatComposer"), "外拆件 `…-composer.mjs` 承输入区与状态行")
  assert.ok(PAGE_SRC.includes('from "./views-me-chat-messages.mjs"') && PAGE_SRC.includes('from "./views-me-chat-composer.mjs"'), "页件接线两外拆件")
})
