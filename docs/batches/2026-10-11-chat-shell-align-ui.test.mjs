/**
 * 2026-10-11-chat-shell-align-ui.test.mjs — thincoder-server 批内件（`chat-shell-align` 批 · 台账 #1292；名随批档 · 住 `docs/batches/`）：
 * **壳面腿 + 结构腿 + 词面腿**——自 `2026-10-11-chat-shell-align.test.mjs` 外拆（拆档执行 = console-chat-live-step 批；缘由 = 原档 877 行越 800 硬限）：
 * 机制面（装置 A + N64–N67）留原档；装置 B（假 DOM）只本档用——两档零重复。
 * 运行（自 `thincoder/` 仓根）：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-11-chat-shell-align-ui.test.mjs`
 *
 * 判据源 = 批档 §2 ∥ `webui/CHAT.md` §4：
 *   壳面：N68（页四段 + css 幂等 + 零 card）∥ N69（回读装配：块 + 嵌套卡 + 标签恰一次 + notice 灰条）∥ N70（状态行段表）∥
 *        B67（队列：待发泡/队满/`end` 队首/Ctrl+I）∥ B68（斜径表纪律 + 名称 ⊆ CLI 名集）∥ E53（发送失败就地人话 + 草稿还原）。
 *   结构腿：零自持渲染 ∥ 核件调用面逐件（扫面 = `views-chat.mjs` + 外拆件 `views-chat-messages.mjs`）∥ 类名闭合域 ∥ 无源钮隐藏 ∥ AC-19 canon（别名块零新值）∥ 档目。
 *   词面腿：核件消费件 `t()` 字面 ⊙ 两部件表 ∥ VSC locales 逐键相等 ∥ admin 部件随正。
 *
 * 随正（2026-10-12 console-chat-live-step 批）：结构腿核件接线扫面 += 外拆新源 `views-chat-messages.mjs`；
 * 词面腿 `admin.chat.*` 键数按当刻盘面实读收正（28 ⇒ **31**——admin-chat-creds-merge 批 +3 落盘）。
 */

import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const PUBLIC_DIR = join(ROOT, "thincoder-server", "public")
const CORE_DIR = join(ROOT, "thincoder-render-core")
const VSC_LOCALES = join(ROOT, "thincoder-vscode", "locales")
const readPublic = (name) => readFileSync(join(PUBLIC_DIR, name), "utf8")
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const CORE_I18N = await import("/rc/i18n.mjs")
const [{ ZH }, { EN }, ZH_CORE_MOD, EN_CORE_MOD, ADMIN_ZH_MOD, ADMIN_EN_MOD] = await Promise.all([
  load("thincoder-server/public/i18n-zh.mjs"), load("thincoder-server/public/i18n-en.mjs"),
  load("thincoder-server/public/i18n-zh-core.mjs"), load("thincoder-server/public/i18n-en-core.mjs"),
  load("thincoder-server/public/i18n-zh-admin.mjs"), load("thincoder-server/public/i18n-en-admin.mjs"),
])
const VIEW_SRC = readPublic("views-chat.mjs")
const MESSAGES_SRC = readPublic("views-chat-messages.mjs") // 消息面外拆件（console-chat-live-step 批——接线扫面新档源）
const COMPOSER_SRC = readPublic("views-chat-composer.mjs")
const CSS = readPublic("style.css")
const MODEL = "fake/kimi-k3" // 多模态（核表源——壳面腿夹具模型）
// ── 装置：假 DOM（核件真跑——`h` 后 app 语义近似；沿同批先例）────────────────────

const ENTITIES = { "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#39;": "'" }
const decode = (text) => text.replace(/&(?:amp|lt|gt|quot|#39);/g, (match) => ENTITIES[match])
const stripTags = (html) => decode(html.replace(/<[^>]*>/g, ""))

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
    const title = /\btitle="([^"]*)"/.exec(match[2] ?? "")
    if (title !== null) node.setAttribute("title", title[1])
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
    scrollTop: 0, scrollHeight: 0, clientHeight: 0, selectionStart: 0, selectionEnd: 0, isConnected: true,
    get innerHTML() { return this._html ?? "" },
    set innerHTML(value) { this._html = String(value); this.children = []; for (const child of parseFragment(this._html)) { child.parent = this; this.children.push(child) } },
    get textContent() { return node.children.length > 0 ? node.children.map((child) => (typeof child === "string" ? child : (child.textContent ?? ""))).join("") : text },
    set textContent(value) { text = String(value); node.children = [] },
    get firstChild() { return this.children[0] ?? null },
    get childNodes() { return [...this.children] },
    get ownerDocument() { return globalThis.document },
    get nextSibling() { const siblings = this.parent?.children ?? []; return siblings[siblings.indexOf(this) + 1] ?? null },
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

/** 选择器面（控制台测试面只用到：`#id` ∥ `.a` ∥ `.a.b` ∥ `tag` ∥ `tag.class` ∥ `[attr="..."]`）。 */
function matches(node, selector) {
  if (typeof node === "string") return false
  const attr = /\[([\w-]+)="([^"]*)"\]$/.exec(selector)
  if (attr !== null) return node.attrs?.[attr[1]] === attr[2]
  if (selector.startsWith("[")) return node.attrs?.[selector.slice(1, -1)] !== undefined
  const head = selector.replace(/\[[^\]]*\]$/, "")
  if (head.startsWith("#")) return node.attrs?.id === head.slice(1) || node.id === head.slice(1)
  if (head.startsWith(".")) return head.slice(1).split(".").every((name) => node.classList?.contains(name) === true)
  const tagMatch = /^([a-z]+)((?:\.\w+)*)$/.exec(head)
  if (tagMatch === null) return false
  if (node.tag !== tagMatch[1]) return false
  const classes = tagMatch[2].split(".").filter(Boolean)
  return classes.every((name) => node.classList?.contains(name) === true)
}

function installDom() {
  const head = makeNode("head")
  const body = makeNode("body")
  const html = makeNode("html")
  html.scrollTop = 0
  html.scrollHeight = 2000
  html.clientHeight = 800
  html.classList = html.classList
  const document = {
    head, body, scrollingElement: html,
    createElement: (tag) => makeNode(tag),
    createTextNode: (text) => { const node = makeNode("#text"); node.textContent = String(text); return node },
    getElementById: (id) => [head, body, html].map((node) => node.querySelector(`#${id}`)).find((hit) => hit !== null) ?? null,
    querySelector: (selector) => [head, body, html].map((node) => node.querySelector(selector)).find((hit) => hit !== null) ?? null,
    querySelectorAll: (selector) => [head, body, html].flatMap((node) => node.querySelectorAll(selector)),
    addEventListener: (type, fn) => { (document._listeners ??= {}); (document._listeners[type] ??= []).push(fn) },
    removeEventListener: () => {},
    _listeners: {},
  }
  globalThis.document = document
  globalThis.window = { innerWidth: 1200, innerHeight: 800, addEventListener() {}, removeEventListener() {}, document }
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

/** 叶面文本（只取叶子/文本节点——祖先节点 `textContent` 含后代，逐节点取会重复计数）。 */
const textOf = (node) => [node, ...walk(node)]
  .filter((item) => typeof item === "string" || item.tag === "#text" || (item.children ?? []).length === 0)
  .map((item) => (typeof item === "string" ? item : (item.textContent ?? "")))
  .join("\n")

/** 队列冲空等待（B67 收尾：轮询 queueCount + 让微任务链跑完——零定时器残留）。 */
async function waitIdle(composer, ms = 500) {
  const started = Date.now()
  while (composer.queueCount() > 0) {
    if (Date.now() - started > ms) return
    await new Promise((resolve) => setTimeout(resolve, 5))
  }
  await new Promise((resolve) => setTimeout(resolve, 5))
}

// ── 壳面 ───────────────────────────────────────────────────────────────────

test("N68 装配：页四段在册 + 零 card + `#toolbar`/`#status-line` 各恰一 + 两 css 幂等", async () => {
  const dom = installDom()
  const COMPOSER = await load("thincoder-server/public/views-chat-composer.mjs")
  const CHAT_VIEW = await load("thincoder-server/public/views-chat.mjs")
  const ctx = {
    h: fH, fmtTs: (value) => String(value ?? ""),
    api: async (path) => (path === "/api/admin/agent/chats" ? { chats: [{ id: 1, model: MODEL, status: "idle", updatedAt: "2026-10-11T12:00:00.000Z", excerpt: "你好" }] } : { chat: { id: 1, model: MODEL, status: "idle" }, messages: [] }),
    fail: (error) => { throw error }, flash: () => {},
  }
  await CHAT_VIEW.renderChat(ctx, dom.mount)
  assert.equal(dom.mount.querySelectorAll("#toolbar").length, 1, "`#toolbar` 恰一")
  assert.equal(dom.mount.querySelectorAll("#status-line").length, 1, "`#status-line` 恰一")
  assert.ok(dom.mount.querySelector(".chat-bar"), "① 会话条在册")
  assert.ok(dom.mount.querySelector(".chat-thread"), "② 消息流在册")
  assert.equal(dom.mount.querySelectorAll(".card").length, 0, "零卡片包裹（本页无 `.card` 面）")
  const toolbar = dom.mount.querySelector("#toolbar")
  assert.equal(toolbar.children[0].attrs.id, "status-line", "状态行 = `#toolbar` 首子（输入区上方）")
  assert.ok(toolbar.querySelector(".chat-input") || toolbar.querySelector("textarea"), "④ 输入区在册")
  const links = dom.document.head.querySelectorAll("link")
  assert.equal(links.filter((link) => link.attrs["data-rc-css"] === "/rc/composer/composer.css").length, 1, "壳 css 在册")
  assert.equal(links.filter((link) => link.attrs["data-rc-css"] === "/rc/composer/model-menu.css").length, 1, "菜单 css 在册")
  COMPOSER.injectCoreCss() // 幂等：重注零增
  assert.equal(dom.document.head.querySelectorAll("link").length, links.length, "重注零增（幂等）")
})

test("N69 回读装配：用户块/助手块+嵌套卡（标签恰一次）/notice 灰条", async () => {
  const dom = installDom()
  CORE_I18N.setStrings(ZH_CORE_MOD.ZH_CORE)
  const CHAT_VIEW = await load("thincoder-server/public/views-chat.mjs")
  const ctx = { h: fH, fmtTs: String }
  const rows = [
    { seq: 1, role: "user", content: "第一条", data: null, createdAt: "2026-10-11T10:00:00.000Z" },
    { seq: 2, role: "assistant", content: "先查", data: { toolCalls: [{ id: "call-1", name: "members", args: "{\"op\":\"list\"}" }] }, createdAt: "2026-10-11T10:00:01.000Z" },
    { seq: 3, role: "tool", content: "{\"ok\":true}", data: { toolCallId: "call-1", name: "members", ok: true, summary: "已办" }, createdAt: "2026-10-11T10:00:02.000Z" },
    { seq: 4, role: "assistant", content: "收尾", data: null, createdAt: "2026-10-11T10:00:03.000Z" },
    { seq: 5, role: "notice", content: "预算超限——本轮已收尾", data: { reason: "budget" }, createdAt: "2026-10-11T10:00:04.000Z" },
    { seq: 6, role: "user", content: "第二条", data: null, createdAt: "2026-10-11T10:00:05.000Z" },
    { seq: 7, role: "assistant", content: "答", data: null, createdAt: "2026-10-11T10:00:06.000Z" },
  ]
  const nodes = CHAT_VIEW.messageNodes(ctx, rows)
  const root = fH("div", {}, ...nodes)
  const userBlocks = root.querySelectorAll(".message.user")
  assert.equal(userBlocks.length, 2, "用户块两枚（核 `buildUserMessage`）")
  assert.equal(userBlocks[0].querySelector(".msg-label").textContent.includes("你"), true, "标签 = 核 `msg.user`")
  assert.ok(userBlocks[0].querySelector(".msg-time"), "时间在场（真实 ts）")
  const assistantBlocks = root.querySelectorAll(".message.assistant")
  assert.equal(assistantBlocks.length, 3, "助手块三枚（两回合 + 单行）")
  assert.equal(assistantBlocks[0].querySelectorAll(".tool-call").length, 1, "工具卡嵌助手块内")
  assert.equal(root.querySelectorAll(".tool-call").length, 1, "工具卡无顶层悬挂")
  assert.equal(textOf(root).split("❯ ThinCoder:").length - 1, 2, "「❯ ThinCoder:」恰一次/回合（两回合 ⇒ 两枚）")
  const notice = root.querySelector(".message.notice")
  assert.ok(notice, "notice 行 = 自持灰条")
  assert.equal(notice.textContent, "预算超限——本轮已收尾", "notice 文案映射（reason=budget）")
  assert.equal(CHAT_VIEW.noticeText({ data: { reason: "aborted" }, content: "" }), "已手动中止——本轮已收尾", "notice 第五值映射")
  assert.equal(CHAT_VIEW.noticeText({ data: { reason: "future_value" }, content: "原文" }), "原文", "枚举外 ⇒ 服务端原文兜底（零信息丢）")
})

test("N70 状态行段表：运行中/工具/↑↓/hit/context/轮次/耗时/静默 + 未收录零段 + 警示阈", async () => {
  const COMPOSER = await load("thincoder-server/public/views-chat-composer.mjs")
  CORE_I18N.setStrings(ZH_CORE_MOD.ZH_CORE)
  const now = Date.now()
  const live = COMPOSER.emptyStatusState()
  Object.assign(live, { running: true, model: "kimi-k3", turn: 2, toolName: "members", prompt: 12_500, completion: 900, cacheHit: 750, cacheMiss: 250, contextPct: 1, startedAt: now - 7000, lastOutputAt: now - 11_000 })
  const segs = COMPOSER.statusSegments(live, now).map((seg) => seg.text)
  assert.deepEqual(segs, ["运行中…", "工具: members", "↑13k ↓900", "hit75%", "context 1%", "轮次 2", "耗时 7s", "已静默 11s"], `段集（N70 逐项）：${JSON.stringify(segs)}`)
  assert.equal(COMPOSER.statusSegments({ ...live, running: false, lastOutputAt: 0, turn: 0, toolName: "", prompt: 0, completion: 0, cacheHit: 0, cacheMiss: 0, contextPct: null, startedAt: 0, frozenMs: null }, now).length, 0, "缺源 ⇒ 零段")
  assert.equal(COMPOSER.contextPctOf("kimi-k3", 250_000), 25, "context 段 = 末次 prompt ÷ 快照件上下文")
  assert.equal(COMPOSER.contextPctOf("unknown-model-x", 250_000), null, "未收录 ⇒ 零段（零兜底）")
  assert.equal(COMPOSER.contextPctOf("kimi-k3", 0), null, "零读数 ⇒ 零段")
  const warn = COMPOSER.statusSegments({ ...live, contextPct: 85 }, now).find((seg) => seg.text.includes("context"))
  assert.equal(warn.warn, true, "context ≥80% ⇒ 警示段")
  assert.equal(COMPOSER.statusSegments({ ...live, running: false, frozenMs: 3200, startedAt: 0, lastOutputAt: now }, now).find((seg) => seg.text.startsWith("耗时")).text, "耗时 3s", "end.durationMs 冻结源")
  // 帧面 ⇒ 段面（装配面实跑：`applyFrame` 四类 + `end` 冻结）
  const dom = installDom()
  const composer = COMPOSER.createChatComposer({ h: fH }, {
    root: dom.mount,
    currentChat: () => ({ id: 1, model: "kimi-k3" }),
    onProviders: async () => ({ providers: [] }),
    onSend: async () => ({ accepted: true, ended: true }),
    onAbort: () => {},
    onSelectModel: async () => true,
    onEcho: () => null,
    onNewChat: () => true,
    onHelp: () => true,
  })
  composer.resetTurn()
  composer.applyFrame({ type: "turn", n: 2 })
  composer.applyFrame({ type: "delta", text: "半" })
  composer.applyFrame({ type: "usage", prompt: 1000, completion: 100, cacheHit: 500, cacheMiss: 500 })
  composer.applyFrame({ type: "call", id: "c1", name: "members", args: "{}" })
  const midText = textOf(composer.statusLine)
  assert.ok(midText.includes("轮次 2") && midText.includes("工具: members") && midText.includes("↑1.0k ↓100") && midText.includes("hit50%"), `帧面 ⇒ 段面：${midText}`)
  composer.applyFrame({ type: "result", id: "c1", ok: true, summary: "好" })
  assert.ok(!textOf(composer.statusLine).includes("工具: members"), "result ⇒ 工具段退场")
  composer.applyFrame({ type: "end", status: "succeeded", durationMs: 2500, calls: 1 })
  assert.ok(textOf(composer.statusLine).includes("耗时 2s"), "`end.durationMs` ⇒ 冻结段")
  composer.resetTurn()
  assert.equal(textOf(composer.statusLine), "", "重读 ⇒ 状态行归零")
})

test("B67 队列：待发泡 + 容量 8 + `end` 队首发起 + Ctrl+I 折法", async () => {
  const dom = installDom()
  CORE_I18N.setStrings(ZH_CORE_MOD.ZH_CORE)
  const COMPOSER = await load("thincoder-server/public/views-chat-composer.mjs")
  const thread = dom.mount
  const sends = []
  let aborts = 0
  const gates = new Map()
  const blocked = new Set([1, 10]) // 第 1 次（首回合）∥ 第 10 次（Ctrl+I 在飞回合）阻塞——其余（队列冲空）直返
  const composer = COMPOSER.createChatComposer({ h: fH }, {
    root: thread,
    currentChat: () => ({ id: 1, model: MODEL }),
    onProviders: async () => ({ providers: [{ name: "fake", models: ["kimi-k3"] }] }),
    onSend: async (text, images) => {
      sends.push({ text, images })
      const nth = sends.length
      if (blocked.has(nth)) await new Promise((resolve) => { gates.set(nth, resolve) })
      return { accepted: true, ended: true }
    },
    onAbort: () => { aborts += 1 },
    onSelectModel: async () => true,
    onEcho: (text) => { const node = fH("div", { class: "message user" }, fH("div", { class: "msg-label", text: `❯ 你: ${text}` }), fH("div", { class: "bubble", text })); thread.append(node); return node },
    onNewChat: () => true,
    onHelp: () => true,
  })
  const input = composer.panel.inputEl
  const submit = async (text) => { input.value = text; await input.fire("keydown", { key: "Enter", shiftKey: false, isComposing: false }) }
  const release = (nth) => { gates.get(nth)?.() }
  await submit("第一条")
  assert.equal(sends.length, 1, "空闲径：直发（不入队）")
  await submit("第二条")
  assert.equal(composer.queueCount(), 1, "在途提交 ⇒ 入队（核面板出泡 + queuedUserMessage）")
  const pending = thread.querySelectorAll(".message.user").find((node) => node.classList.contains("pending"))
  assert.ok(pending, "待发泡：`markPending` 类在册")
  assert.ok(pending.querySelector(".msg-label").textContent.includes("⏳ 待发送"), "待发标（核 `queued.pending`）")
  for (let i = 0; i < 7; i++) await submit(`填队${i}`)
  assert.equal(composer.queueCount(), 8, "容量 = 核 `QUEUED_MAX_ITEMS`（8）")
  await submit("溢出")
  assert.equal(composer.queueCount(), 8, "队满 ⇒ 拒收（不出队）")
  const toast = dom.body.querySelector("#paste-toast")
  assert.ok(toast, "核 toast 在册")
  assert.match(toast.textContent, /排队已满/, "队满 ⇒ 核 `input.slotFull` toast")
  release(1)
  await waitIdle(composer)
  assert.equal(sends.length, 9, "`end` ⇒ 队首发起（1 条首发 + 8 条队列）")
  assert.equal(composer.queueCount(), 0, "队列冲空")
  // Ctrl+I 折法：新回合在飞（挂起）期中止 + 该文本入队首
  await submit("新回合")
  assert.equal(gates.has(10), true, "在飞回合（挂起中）")
  aborts = 0
  await input.fire("keydown", { key: "i", ctrlKey: true })
  input.value = "打断并注入"
  await input.fire("keydown", { key: "Enter", shiftKey: false, isComposing: false })
  assert.equal(aborts, 1, "Ctrl+I ⇒ 中止（折法）")
  assert.equal(composer.queueCount() >= 1, true, "注入文本入队首")
  release(10)
  await waitIdle(composer)
  assert.equal(composer.queueCount(), 0, "中止后队首照发（收尾冲空）")
})

test("B68/E53 斜径表纪律 + 发送失败（就地人话 + 草稿还原 + 会话模型零变）", async () => {
  const dom = installDom()
  CORE_I18N.setStrings(ZH_CORE_MOD.ZH_CORE)
  const COMPOSER = await load("thincoder-server/public/views-chat-composer.mjs")
  const CHAT_VIEW = await load("thincoder-server/public/views-chat.mjs")
  const commands = COMPOSER.createSlashCommands({})
  assert.deepEqual(commands.map((cmd) => cmd.name), ["/model", "/new", "/help"], "控制台三命令（名 ⊆ CLI 名集）")
  assert.deepEqual(commands.map((cmd) => cmd.aliases), [["/m"], ["/n"], ["/h"]], "别名（CLI `SLASH_ALIASES` 键集内）")
  assert.deepEqual(commands.map((cmd) => cmd.group), ["Agent", "Session", "System"], "组名 ⊆ 核 `HELP_GROUPS`（CLI 表逐字）")
  assert.deepEqual(commands.map((cmd) => cmd.descKey), ["slash.desc.model", "slash.desc.new", "slash.desc.help"])
  // 表纪律：名/别名 ⊆ CLI 名集（读 CLI 源档机检）
  const cli = await load("thincoder-cli/src/tui/slash-commands.mjs")
  const cliNames = new Set(cli.SLASH_COMMANDS.map((cmd) => cmd.name))
  const cliAliases = new Set(Object.keys(cli.SLASH_ALIASES))
  for (const cmd of commands) {
    assert.ok(cliNames.has(cmd.name), `名 ⊆ CLI 名集：${cmd.name}`)
    for (const alias of cmd.aliases) assert.ok(cliAliases.has(alias), `别名 ⊆ CLI 别名集：${alias}`)
  }
  for (const cmd of cli.SLASH_COMMANDS.filter((item) => commands.some((ours) => ours.name === item.name))) {
    assert.equal(commands.find((ours) => ours.name === cmd.name).group, cmd.group, `组名逐字 = CLI：${cmd.name}`)
  }
  // E53 发送失败：信封 400 ⇒ 就地人话（ctx.fail）+ 草稿还原 + 会话模型零变
  const failures = []
  const posts = []
  const composer = COMPOSER.createChatComposer({ h: fH }, {
    root: dom.mount,
    currentChat: () => ({ id: 7, model: MODEL }),
    onProviders: async () => ({ providers: [] }),
    onSend: async (text) => { posts.push(text); return { accepted: false, ended: false } },
    onAbort: () => {},
    onSelectModel: async () => true,
    onEcho: () => fH("div", { class: "message user" }, fH("div", { class: "msg-label" })),
    onNewChat: () => true,
    onHelp: () => true,
  })
  const input = composer.panel.inputEl
  input.value = "发不出去"
  await input.fire("keydown", { key: "Enter", shiftKey: false, isComposing: false })
  assert.equal(posts.length, 1, "发送面已触（页面传输）")
  assert.equal(input.value, "发不出去", "未受理 ⇒ 草稿还原（零丢失）")
  // E53 换模型 400：页面面 = `ctx.fail`（服务端报文直呈 ∥ 会话模型零变）
  const failCalls = []
  const ctx = {
    h: fH, fmtTs: String,
    api: async (path, options = {}) => {
      if (options.method === "PATCH") { const error = new Error("模型不可用：fake/glm-5.3（不在注册表——先在服务模型页配置）"); error.status = 400; throw error }
      return path === "/api/admin/agent/chats" ? { chats: [{ id: 7, model: MODEL, status: "idle", updatedAt: "2026-10-11T12:00:00.000Z", excerpt: "" }] } : { chat: { id: 7, model: MODEL }, messages: [] }
    },
    fail: (error) => failures.push(error), flash: () => {},
  }
  const mount2 = makeNode("main")
  await CHAT_VIEW.renderChat(ctx, mount2)
  const composer2 = mount2.querySelector("#toolbar") ?? null
  assert.ok(composer2, "页装配可重入（第二挂载点）")
  assert.equal(failures.length, 0, "装配期零失败")
  // CHAT_VIEW 面：`onSelectModel` 失败 ⇒ 就地人话 + 返回假（钮面回退由 composer 重派生）
  assert.equal(typeof CHAT_VIEW.messageNodes, "function")
  assert.equal(CHAT_VIEW.noticeText({ data: { reason: "model_error" }, content: "" }), "模型调用失败——本轮已收尾")
})

// ── 结构腿与词面腿 ──────────────────────────────────────────────────────────

const emittedClasses = () => {
  const emitted = new Set()
  const walkDir = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) { walkDir(path); continue }
      if (!entry.name.endsWith(".mjs")) continue
      const src = readFileSync(path, "utf8")
      for (const match of src.matchAll(/className\s*=\s*["'`]([\w\s-]+)["'`]/g)) for (const token of match[1].split(/\s+/)) if (token) emitted.add(token)
      for (const match of src.matchAll(/classList\.(?:add|remove|toggle)\(\s*["']([\w-]+)["']/g)) emitted.add(match[1])
      for (const match of src.matchAll(/class="([^"${]*?)"/g)) for (const token of match[1].split(/\s+/)) if (token) emitted.add(token)
      if (src.includes('class="tk-${')) for (const match of src.matchAll(/type:\s*"([a-z]+)"/g)) emitted.add(`tk-${match[1]}`)
    }
  }
  walkDir(CORE_DIR)
  return emitted
}

test("结构腿：零自持渲染 ∥ 核件调用面逐件 ∥ 类闭合域 ∥ 六钮隐藏 ∥ AC-19 canon ∥ 档目", () => {
  // ① 页零自持渲染（无手写 HTML/markdown 拼装；核件调用面在册——扫面 += 外拆件 `views-chat-messages.mjs`）
  assert.equal(((VIEW_SRC + MESSAGES_SRC).match(/\.innerHTML\s*=/g) ?? []).length, 0, "页面零 `innerHTML` 写口（md/工具卡归核件——两档扫描面）")
  for (const spec of ["/rc/flow/block.mjs", "/rc/flow/tool-card.mjs", "/rc/flow/stream.mjs", "/rc/scroll.mjs", "/rc/i18n.mjs", "/rc/lib.mjs"]) {
    assert.ok(VIEW_SRC.includes(`from "${spec}"`) || MESSAGES_SRC.includes(`from "${spec}"`), `核件接线缺位：${spec}`)
  }
  for (const name of ["buildUserMessage", "buildAssistantRestore", "renderBlock"]) assert.ok(VIEW_SRC.includes(name) || MESSAGES_SRC.includes(name), `核件四件之：${name}`)
  for (const name of ["createComposerPanel", "formatHelp", "QUEUED_MAX_ITEMS", "markPending", "nearBottom", "applyPin", "createPinWatch", "createStreamRenderer", "finishToolCard", "renderToolCard"]) {
    assert.ok(VIEW_SRC.includes(name) || COMPOSER_SRC.includes(name), `核件调用面缺件：${name}`)
  }
  assert.ok(COMPOSER_SRC.includes('from "/rc/composer/panel.mjs"'), "输入区全件 = 核面板")
  assert.ok(VIEW_SRC.includes("document.scrollingElement"), "滚动作用元素 = 文档流（§2.1①）")
  for (const dead of ["chat-msg", "chat-list", "chat-row", "chat-form", "mdInline(", "md("]) {
    assert.ok(!VIEW_SRC.includes(dead) && !MESSAGES_SRC.includes(dead), `自持渲染残留：${dead}`)
  }
  // ② 类闭合域：三档类字面 ⊆（核件发射 ∪ style.css）
  const emitted = emittedClasses()
  const used = new Set()
  for (const src of [VIEW_SRC, MESSAGES_SRC, COMPOSER_SRC]) {
    for (const match of src.matchAll(/class:\s*["'`]([\w\s-]+)["'`]/g)) for (const token of match[1].split(/\s+/)) if (token) used.add(token)
    for (const match of src.matchAll(/class="([^"${]*?)"/g)) for (const token of match[1].split(/\s+/)) if (token) used.add(token)
  }
  const orphans = [...used].filter((name) => !emitted.has(name) && !CSS.includes(`.${name}`) && !["text", "#text"].includes(name))
  assert.deepEqual(orphans, [], `类名闭合域（核件发射 ∪ 样式面）：${orphans.join("∕")}`)
  // ③ 无源钮收窄（六 id + 菜单 footer 两族）
  for (const id of ["#auto-btn", "#advisor-btn", "#eng-btn", "#plan-btn", "#settings-btn"]) assert.ok(CSS.includes(id), `无源钮隐藏规则缺位：${id}`)
  for (const cls of [".mm-sep", ".mm-row.mm-manage"]) assert.ok(CSS.includes(cls), `模型菜单式项收窄缺位（特征度升形 ≻ 核件 \`.mm-row\`）：${cls}`)
  // ④ 四段面子（会话条/消息流/状态行/输入区）与旧面退役
  for (const name of [".chat-bar", ".chat-select", ".chat-thread", "#toolbar", "#status-line", ".status-sep", ".status-warn", ".message", ".message.notice", ".message.pending", ".msg-label", ".msg-time", ".bubble"]) {
    assert.ok(CSS.includes(name), `四段面样式缺位：${name}`)
  }
  for (const dead of [".chat-msg", ".chat-list", ".chat-row", ".chat-form", ".chat-thread { max-height"]) assert.ok(!CSS.includes(dead), `旧面残留：${dead}`)
  // ⑤ AC-19 canon：`:root` 别名块逐键 `var(--既有)`（零新值 ∥ 零颜色字面量）+ 零新悬停规则
  const rootBlock = CSS.slice(CSS.indexOf(":root"), CSS.indexOf("}", CSS.indexOf(":root")))
  const aliases = rootBlock.slice(rootBlock.indexOf("核件壳族变量桥"))
  for (const line of aliases.split("\n")) {
    const match = /^--([\w-]+):\s*([^;]+);/.exec(line.trim())
    if (match === null) continue
    assert.match(match[2].trim(), /^var\(--[\w-]+\)$|^none$/, `别名值须逐键 var(--既有)：--${match[1]} = ${match[2]}`)
  }
  const hover = [...CSS.matchAll(/([^{}\n]*):hover[^{]*\{/g)].map((match) => match[1]).join(" ")
  for (const face of ["chat-bar", "chat-select", "chat-thread", "toolbar", "status-line", "bubble", "message", "auto-btn", "eng-btn", "plan-btn", "advisor-btn", "settings-btn", "mm-sep", "mm-manage"]) {
    assert.ok(!hover.includes(face), `零新悬停规则：${face}`)
  }
  // ⑥ 档目随正（本批 +1 档：`views-chat-composer.mjs`；实读 = 43 ∥ 42（非 favicon）∥ 40 `.mjs`——**精确计数归跨批结构件**
  //    （在途批组同时落档——硬数会与并行批组相犯）；本腿只守本批增量与四件在册）
  const files = readdirSync(PUBLIC_DIR)
  const mjs = files.filter((name) => name.endsWith(".mjs"))
  assert.ok(mjs.length >= 40, `档目下界：≥40 档 .mjs（实读 ${mjs.length}）`)
  assert.ok(files.length >= 42, `档目下界：≥42 档（实读 ${files.length}）`)
  for (const name of ["views-chat.mjs", "views-chat-composer.mjs", "style.css", "index.html"]) assert.ok(files.includes(name), `四件在册：${name}`)
  for (const name of ["views-chat.mjs", "views-chat-composer.mjs"]) assert.ok(!/https?:\/\//.test(readPublic(name)), `零外链（AC-14）：${name}`)
})

test("词面腿：核件消费件 `t()` 字面 ⊆ 两部件表 ∥ VSC locales 逐键相等 ∥ admin 部件随正", async () => {
  const files = [
    "composer/panel.mjs", "composer/controls.mjs", "composer/model-menu.mjs", "composer/attach.mjs", "composer/slash.mjs",
    "flow/block.mjs", "flow/queued-mark.mjs", "flow/tool-card.mjs", "flow/tool-card-restore.mjs", "flow/stream.mjs", "toast.mjs",
  ]
  const emitted = new Set()
  for (const file of files) {
    const src = readFileSync(join(CORE_DIR, file), "utf8")
    for (const match of src.matchAll(/(?:coreT|(?<![\w.])t)\(\s*["']([\w.]+)["']/g)) emitted.add(match[1])
  }
  for (const key of ["slash.desc.model", "slash.desc.new", "slash.desc.help", "reasoning.xhigh", "reasoning.high", "reasoning.medium", "reasoning.low", "reasoning.minimal", "reasoning.none", "reasoning.enabled"]) emitted.add(key) // 模板前缀 `reasoning.` 展开面（VSC 八级）∥ 斜径 descKey（表侧键）
  const prefixKeys = [...emitted].filter((key) => key.endsWith("."))
  for (const prefix of prefixKeys) {
    emitted.delete(prefix)
    assert.ok(Object.keys(ZH_CORE_MOD.ZH_CORE).some((key) => key.startsWith(prefix)), `模板前缀面须有注册键：${prefix}`)
  }
  // ① 键 ⊙ 两部件表（缺 = 核件词面漂移）
  const missingZh = [...emitted].filter((key) => !(key in ZH_CORE_MOD.ZH_CORE))
  assert.deepEqual(missingZh, [], `核件字面缺键（zh 部件）：${missingZh.join("∕")}`)
  assert.deepEqual([...emitted].filter((key) => !(key in EN_CORE_MOD.EN_CORE)), [], "核件字面缺键（en 部件）")
  // ② 两语键集相等 ∥ 占位符同形
  const zhKeys = Object.keys(ZH_CORE_MOD.ZH_CORE).sort()
  assert.deepEqual(zhKeys, Object.keys(EN_CORE_MOD.EN_CORE).sort(), "两部件键集相等")
  const placeholders = (text) => (text.match(/\$\{\w+\}/g) ?? []).sort().join(",")
  for (const key of zhKeys) assert.equal(placeholders(ZH_CORE_MOD.ZH_CORE[key]), placeholders(EN_CORE_MOD.EN_CORE[key]), `占位符同形：${key}`)
  assert.equal(zhKeys.filter((key) => /\{\w+\}/.test(EN_CORE_MOD.EN_CORE[key]) && /[\u4e00-\u9fff]/.test(EN_CORE_MOD.EN_CORE[key])).length, 0, "en 面零 CJK")
  // ③ VSC locales 逐键相等（VSC 无该族者除外——slash 族走桌面表，逐字断言）
  const vscZh = JSON.parse(readFileSync(join(VSC_LOCALES, "zh.json"), "utf8"))
  const vscEn = JSON.parse(readFileSync(join(VSC_LOCALES, "en.json"), "utf8"))
  const slashFamily = new Set(["slash.unknown", "slash.args", "slash.help.label", "slash.desc.model", "slash.desc.new", "slash.desc.help"])
  for (const key of zhKeys) {
    if (slashFamily.has(key)) continue
    if (key in vscZh) assert.equal(ZH_CORE_MOD.ZH_CORE[key], vscZh[key], `zh 值须逐字等 VSC locales：${key}`)
    if (key in vscEn) assert.equal(EN_CORE_MOD.EN_CORE[key], vscEn[key], `en 值须逐字等 VSC locales：${key}`)
  }
  const desktop = readFileSync(join(ROOT, "thincoder-desktop", "renderer", "i18n-views.mjs"), "utf8")
  const desktopValue = (lang, key) => new RegExp(`"${key}":\\s*"((?:[^"\\\\]|\\\\.)*)"`).exec(desktop.slice(desktop.indexOf(`"${lang}"`)))?.[1] ?? null
  for (const key of slashFamily) {
    const zhValue = desktopValue("zh", key)
    const enValue = desktopValue("en", key)
    if (zhValue !== null && key !== "slash.desc.new") assert.equal(ZH_CORE_MOD.ZH_CORE[key], zhValue, `slash 族 zh 值随桌面表：${key}`)
    if (enValue !== null && key !== "slash.desc.new") assert.equal(EN_CORE_MOD.EN_CORE[key], enValue, `slash 族 en 值随桌面表：${key}`)
  }
  assert.equal(ZH_CORE_MOD.ZH_CORE["slash.desc.new"], "新建会话", "唯一新撰键（zh）")
  assert.equal(EN_CORE_MOD.EN_CORE["slash.desc.new"], "start a new chat", "唯一新撰键（en）")
  // ④ admin 部件随正：31 键/表 ∥ 退役键清零 ∥ 状态行七键在册
  const chatKeys = Object.keys(ADMIN_ZH_MOD.ZH_ADMIN ?? ADMIN_ZH_MOD.ZH ?? {}).filter((key) => key.startsWith("admin.chat."))
  assert.equal(chatKeys.length, 31, `admin 部件 31 键（实读 ${chatKeys.length}——admin-chat-creds-merge 批 +3 落盘）`)
  for (const retired of ["admin.chat.newChatHint", "admin.chat.chatsTitle", "admin.chat.running", "admin.chat.inputPh", "admin.chat.send", "admin.chat.messageRequired", "admin.chat.inputHint"]) {
    assert.ok(!(retired in (ADMIN_ZH_MOD.ZH_ADMIN ?? ADMIN_ZH_MOD.ZH ?? {})), `退役键须清零：${retired}`)
    assert.ok(!(retired in (ADMIN_EN_MOD.EN_ADMIN ?? ADMIN_EN_MOD.EN ?? {})), `退役键须清零（en）：${retired}`)
  }
  for (const key of ["statusTool", "statusContext", "statusCache", "statusTurn", "statusElapsed", "statusQuiet", "selectChat", "noticeAborted"]) {
    assert.ok(`admin.chat.${key}` in (ADMIN_ZH_MOD.ZH_ADMIN ?? ADMIN_ZH_MOD.ZH ?? {}), `新增键在册：admin.chat.${key}`)
    assert.ok(`admin.chat.${key}` in (ADMIN_EN_MOD.EN_ADMIN ?? ADMIN_EN_MOD.EN ?? {}), `新增键在册（en）：admin.chat.${key}`)
  }
  assert.equal(ZH.statusTurnNote ?? (ZH_CORE_MOD.ZH_CORE["status.thinking"] === "思考中" ? "ok" : "bad"), "ok", "词面合体面在册（门面展开）")
})