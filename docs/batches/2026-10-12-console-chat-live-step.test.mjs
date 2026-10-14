/**
 * 2026-10-12-console-chat-live-step.test.mjs — thincoder-server 批内件（`console-chat-live-step` 批 · 台账 #1325；名随批档 · 住 `docs/batches/`）：
 * 活流按步交错（**块 = 步**——`turn` 帧开合）+ 与终态同形（形态签名机检）+ 结构腿 + 服务端帧发射点回归腿。
 * 运行（自 `thincoder/` 仓根——`--import` 缝行不可省：页/核同源取件面 = `/rc/**`）：
 *   `node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-12-console-chat-live-step.test.mjs`
 *
 * 判据源 = `webui/CHAT.md` §2.1②/§4（KD-SV-132）∥ 批档 §2：
 *   N73（多步序——块/卡归位）∥ 逆序腿（同一步 `call` 先于 `delta`——泡恒为块首子）∥ N74（同形签名）∥
 *   B71（工具-only 步 ∥ 零内容步）∥ E56（失败卡 ∥ 中止重读）∥ 结构腿（零 CJK 代码段 ∥ 行宽 ≤300 ∥ 零 `innerHTML` 写口）∥
 *   服务端零改（帧发射点回归腿——`chat.mjs` 四处 `emitFrame`）。
 *
 * N74 同形判据的**登记差异位**（核侧对位探针实测——唯一失配位；父侧裁定 = 走「剔除登记位后逐字相等」）：
 *   活流卡 `span.tool-call-summary`（核 `flow/tool-card.mjs:119-127`——`formatToolSummary` 非空即加）
 *   ∥ 回读卡无该位（核 `flow/tool-card-restore.mjs:40-44`）。探针读数：6 例中 4 例失配、失配位唯一 = 该 span、
 *   剔除后 6/6 逐字相等（失败卡 `.open` 态两径一致——不登记）。登记 = **白名单非容差**：其余位零剔除。
 *   核面补位（`buildFinishedToolCard` 补 summary 位）已由父侧挂账（另批）——本档不改核件、不增第二份渲染。
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
const ADMIN_ZH_MOD = await load("thincoder-server/public/i18n-zh-admin.mjs")
const CHAT_VIEW = await load("thincoder-server/public/views-chat.mjs")
const VIEW_SRC = readPublic("views-chat.mjs")
const MESSAGES_SRC = readPublic("views-chat-messages.mjs")
const SERVER_SRC = readFileSync(join(ROOT, "thincoder-server", "src", "agent", "chat.mjs"), "utf8")
const ADMIN_ZH = ADMIN_ZH_MOD.ZH_ADMIN ?? ADMIN_ZH_MOD.ZH
/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」U+2014 ∥ 「…」U+2026 等中性标点不在内——全仓 canon 同式）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
const MODEL = "fake/kimi-k3"
const TS = "2026-10-12T10:00:00.000Z"
/** 登记差异位（唯一——见档头；N74 比对白名单：仅此一项剔除）。 */
const REGISTERED_SUMMARY = "span.tool-call-summary"

// ── 装置：假 DOM（核件真跑——`h` 后 app 语义近似；沿批目录先例：`2026-10-11-chat-shell-align.test.mjs` 装置 B）──

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
  const head = selector.replace(/\[[^\]]*\]$/, "")
  if (head.startsWith("#")) return node.attrs?.id === head.slice(1)
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

/** 形态签名（**标签/类名序**——元素节点文档序；文本节点不计——KD-SV-132③ 判据单源 = `webui/CHAT.md` §2.1②）。 */
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
async function settle(ticks = 8) {
  for (let index = 0; index < ticks; index++) await new Promise((resolve) => setTimeout(resolve, 0))
}

// ── 夹具（N73 活流 ∥ N74 回读 = 同内容；三步两卡——A/B/C 步文本，c1/c2 工具调用）────────────────

const STEP_TEXT = ["先查", "再看", "收尾"]
const CALLS = [
  { id: "c1", name: "members", args: '{"op":"list"}', summary: "已办" },
  { id: "c2", name: "sandbox", args: '{"op":"ls"}', summary: "已办" },
]
const USER_TEXT = "在吗"

/** N73 活流帧序（§4：`turn`(1) ∥ A ∥ call c1 ∥ result c1 ∥ `turn`(2) ∥ B ∥ call c2 ∥ result c2 ∥ `turn`(3) ∥ C——无 `end`）。 */
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

/** N74 回读夹具（同内容——库行 ⇒ `messageNodes`）：assistant 行 ×3 + tool 行 ×2。 */
function readRows() {
  return [
    { seq: 1, role: "user", content: USER_TEXT, data: null, createdAt: TS },
    { seq: 2, role: "assistant", content: STEP_TEXT[0], data: { toolCalls: [{ id: CALLS[0].id, name: CALLS[0].name, args: CALLS[0].args }] }, createdAt: TS },
    { seq: 3, role: "tool", content: "{\"ok\":true}", data: { toolCallId: CALLS[0].id, name: CALLS[0].name, ok: true, summary: CALLS[0].summary }, createdAt: TS },
    { seq: 4, role: "assistant", content: STEP_TEXT[1], data: { toolCalls: [{ id: CALLS[1].id, name: CALLS[1].name, args: CALLS[1].args }] }, createdAt: TS },
    { seq: 5, role: "tool", content: "{\"ok\":true}", data: { toolCallId: CALLS[1].id, name: CALLS[1].name, ok: true, summary: CALLS[1].summary }, createdAt: TS },
    { seq: 6, role: "assistant", content: STEP_TEXT[2], data: null, createdAt: TS },
  ]
}

// ── 页面夹具（装配 `#/admin/chat` ⇒ 发一条 ⇒ 帧流读完）──────────────────────────────

/** 装配 + 发一条 + 帧流读完；返回 `{ dom, thread, failures }`（`detail` = `end` 重读夹具）。 */
async function runLive(frames, { detail = [], text = USER_TEXT } = {}) {
  const dom = installDom()
  CORE_I18N.setStrings(ZH_CORE_MOD.ZH_CORE)
  const failures = []
  const ctx = {
    h: fH, fmtTs: (value) => String(value ?? ""),
    api: async (path) => {
      if (path === "/api/admin/agent/chats") return { chats: [{ id: 1, model: MODEL, status: "idle", updatedAt: TS, excerpt: "你好" }] }
      if (path === "/api/admin/agent/chats/1") return { chat: { id: 1, model: MODEL, status: "idle" }, messages: detail }
      if (path === "/api/admin/providers") return { providers: [{ name: "fake", models: ["kimi-k3", "glm-5.3"] }] }
      throw new Error(`unexpected api：${path}`)
    },
    fail: (error) => failures.push(String(error?.message ?? error)), flash: () => {},
  }
  globalThis.fetch = async () => fStreamResponse(frames.map((frame) => `${JSON.stringify(frame)}\n`))
  await CHAT_VIEW.renderChat(ctx, dom.mount)
  const thread = dom.mount.querySelector(".chat-thread")
  const input = dom.mount.querySelector("textarea")
  assert.ok(input, "输入区 textarea 在册")
  input.value = text
  await input.fire("keydown", { key: "Enter", shiftKey: false, isComposing: false })
  await settle()
  assert.deepEqual(failures, [], "装配/回合期零 `ctx.fail`（就地人话零触发）")
  return { dom, thread, failures }
}

// ── N73 按步（活流）───────────────────────────────────────────────────────────

test("N73 按步：块数 = 步数 ∥ 卡归当步（不堆块尾）∥ 标签恰一枚 ∥ 逆序腿（泡恒为块首子）", async () => {
  const { thread } = await runLive(liveFrames())
  const blocks = thread.querySelectorAll(".message.assistant")
  assert.equal(blocks.length, 3, "块数 = 步数 = 3（`turn` 帧分段——KD-SV-132①）")
  assert.equal(thread.querySelectorAll(".message.user").length, 1, "用户块一枚（本地回声）")
  assert.deepEqual(blocks.map((block) => block.querySelector(".bubble.content") !== null), [true, true, true], "每步文本泡在场")
  assert.deepEqual(blocks.map((block) => textOf(block.querySelector(".bubble.content"))), STEP_TEXT, "泡文本 = 当步文本（A ∥ B ∥ C）")
  assert.deepEqual(blocks.map((block) => block.querySelectorAll(".tool-call").length), [1, 1, 0], "卡各归当步（不堆块尾 ∥ 不跨步）")
  assert.deepEqual(blocks.map((block) => block.querySelector(".msg-label") !== null), [true, false, false], "标签恰一枚 = 回合首块（块数 ≠ 标签数——KD-SV-132②）")
  assert.equal(textOf(blocks[0].querySelector(".msg-label")), `❯ ${ZH_CORE_MOD.ZH_CORE["msg.assistant"]}:`, "标签 = 核件词面（`msg.assistant`）")
  const cards = thread.querySelectorAll(".tool-call")
  assert.equal(cards.length, 2, "卡恰两枚")
  assert.equal(cards[0].closest(".message.assistant"), blocks[0], "卡 c1 归块1")
  assert.equal(cards[1].closest(".message.assistant"), blocks[1], "卡 c2 归块2")
  assert.deepEqual(cards.map((card) => textOf(card.querySelector(".tool-call-name"))), ["members", "sandbox"], "卡名按到达序")
  assert.equal(thread.children.at(-1), blocks[2], "消息流末位 = 末步块（卡不再堆会话末尾——用户 15:58 实走判的缺陷收正）")

  // 逆序腿：同一步 `call` 先于 `delta` ⇒ 泡仍为块首子（结构插入——与到达序无关——§2.1②）
  const reverse = await runLive([
    { type: "turn", n: 1 },
    { type: "call", id: "c1", name: "members", args: '{"op":"list"}' },
    { type: "result", id: "c1", ok: true, summary: "已办" },
    { type: "delta", text: "后到的文本" },
  ])
  const revBlock = reverse.thread.querySelector(".message.assistant")
  const kinds = revBlock.children.map((child) => (child.classList?.contains("msg-label") ? "label" : child.classList?.contains("bubble") ? "bubble" : child.classList?.contains("tool-call") ? "card" : "other"))
  assert.deepEqual(kinds.slice(0, 3), ["label", "bubble", "card"], "逆序到达 ⇒ 泡仍居卡前（块内子序 = 泡恒为块首子）")
  assert.equal(textOf(revBlock.querySelector(".bubble.content")), "后到的文本", "泡文本 = 迟到的 `delta` 文本")
})

// ── N74 同形（活流径 ∥ 回读径——形态签名逐字比对）────────────────────────────────

test("N74 同形：两径形态签名（剔登记位后逐字相等——差异仅登记位 `.tool-call-summary`）", async () => {
  const { thread } = await runLive(liveFrames())
  const liveNodes = thread.children.filter((child) => typeof child === "object" && child.classList?.contains("hint") !== true)
  const liveSig = signature(fH("div", {}, ...liveNodes))
  const restoreSig = signature(fH("div", {}, ...CHAT_VIEW.messageNodes({ h: fH }, readRows())))
  const stripped = (list) => list.filter((item) => item !== REGISTERED_SUMMARY)
  assert.deepEqual(stripped(liveSig), stripped(restoreSig), "剔登记位后「标签/类名序」逐字相等（KD-SV-132③ 判据——表述单源 = §2.1②）")
  assert.equal(restoreSig.filter((item) => item === REGISTERED_SUMMARY).length, 0, "回读径零登记位（核 `buildFinishedToolCard` 无 summary 位）")
  assert.equal(liveSig.length - stripped(liveSig).length, 2, "活流径登记位计数 = 有摘要卡数（卡数 2——`formatToolSummary` 非空即加）")
  assert.equal(stripped(liveSig).filter((item) => item === "div.message.assistant").length, 3, "两径块数同为 3（步数）")
})

// ── B71 边界（工具-only 步 ∥ 零内容步）────────────────────────────────────────

test("B71 边界：工具-only 步零泡有卡 ∥ 零内容步零空块 ∥ `turn` 后即 `end`（重读同判）", async () => {
  const toolOnly = await runLive([
    { type: "turn", n: 1 },
    { type: "call", id: "c1", name: "members", args: '{"op":"list"}' },
    { type: "result", id: "c1", ok: true, summary: "已办" },
  ])
  const toolBlocks = toolOnly.thread.querySelectorAll(".message.assistant")
  assert.equal(toolBlocks.length, 1, "工具-only 步 ⇒ 一块")
  assert.equal(toolBlocks[0].querySelector(".bubble.content"), null, "零 delta ⇒ 零泡（有文本才建）")
  assert.equal(toolBlocks[0].querySelectorAll(".tool-call").length, 1, "卡组在场")

  const emptyStep = await runLive([
    { type: "turn", n: 1 },
    { type: "delta", text: "甲" },
    { type: "turn", n: 2 },
    { type: "turn", n: 3 },
    { type: "delta", text: "乙" },
  ])
  assert.equal(emptyStep.thread.querySelectorAll(".message.assistant").length, 2, "零内容步（步2）不建块——块数 = 有内容步数")
  assert.deepEqual(emptyStep.thread.querySelectorAll(".bubble.content").map((node) => textOf(node)), ["甲", "乙"], "泡序 = 有内容步序（步2 无泡——零空块）")

  // 空白 token 步 ⇒ 零块（块建门 = 首个非空白文本 ∥ 首个 `call`——`trim` 判，与泡建门同源）
  const blankStep = await runLive([
    { type: "turn", n: 1 },
    { type: "delta", text: " " },
    { type: "turn", n: 2 },
    { type: "delta", text: "终" },
  ])
  assert.equal(blankStep.thread.querySelectorAll(".message.assistant").length, 1, "空白 token 步 ⇒ 零空块（只非空白文本/`call` 建块）")
  assert.equal(textOf(blankStep.thread.querySelector(".bubble.content")), "终", "空白 token 不入泡（`trim` 判）")
  assert.deepEqual(blankStep.thread.querySelectorAll(".message.assistant").map((block) => block.querySelector(".msg-label") !== null), [true], "标签仍归回合首块（空白步不吃标签）")

  const ended = await runLive([
    { type: "turn", n: 1 },
    { type: "end", status: "failed", reason: "空回合", durationMs: 4, calls: 0 },
  ], { detail: [
    { seq: 1, role: "user", content: USER_TEXT, data: null, createdAt: TS },
    { seq: 2, role: "notice", content: "", data: { reason: "empty_turn" }, createdAt: TS },
  ] })
  assert.equal(ended.thread.querySelectorAll(".message.assistant").length, 0, "`turn` 后即 `end` ⇒ 零空块（重读置换后同判）")
  assert.ok(ended.thread.querySelector(".message.notice"), "notice 行经重读唯一呈现径在场（`empty_turn`）")
})

// ── E56 错误（失败卡 ∥ 中止重读）──────────────────────────────────────────────

test("E56 错误：失败卡红面+展开且归当步 ∥ 中止 `end` 重读：块位一致 + notice 行在场", async () => {
  const failedFrames = [
    { type: "turn", n: 1 },
    { type: "delta", text: "先查" },
    { type: "call", id: "c1", name: "members", args: '{"op":"list"}' },
    { type: "result", id: "c1", ok: false, summary: "炸了" },
  ]
  const live = await runLive(failedFrames)
  const liveBlocks = live.thread.querySelectorAll(".message.assistant")
  const liveCard = liveBlocks[0].querySelector(".tool-call")
  assert.equal(liveBlocks.length, 1, "失败步 = 一块")
  assert.equal(liveCard.querySelector(".tool-call-status").style.color, "#f14c4c", "失败卡红面（活流径——核 `isToolFailure` 判据）")
  assert.equal(liveCard.querySelector(".tool-call-body").classList.contains("open"), true, "失败卡自动展开（活流径）")
  assert.equal(liveCard.closest(".message.assistant"), liveBlocks[0], "失败卡归当步块（不跨步）")

  const at = "2026-10-12T10:00:01.000Z"
  const ended = await runLive([...failedFrames, { type: "end", status: "failed", reason: "已手动中止（测试）", durationMs: 12, calls: 1 }], { detail: [
    { seq: 1, role: "user", content: USER_TEXT, data: null, createdAt: TS },
    { seq: 2, role: "assistant", content: "先查", data: { toolCalls: [{ id: "c1", name: "members", args: '{"op":"list"}' }] }, createdAt: at },
    { seq: 3, role: "tool", content: "{\"ok\":false}", data: { toolCallId: "c1", name: "members", ok: false, summary: "炸了" }, createdAt: at },
    { seq: 4, role: "notice", content: "", data: { reason: "aborted" }, createdAt: at },
  ] })
  const endedBlocks = ended.thread.querySelectorAll(".message.assistant")
  assert.equal(endedBlocks.length, 1, "重读置换：块位与活流一致（一块）")
  assert.ok(endedBlocks[0].querySelector(".tool-call"), "失败卡仍归当步块（重读径）")
  assert.equal(endedBlocks[0].querySelector(".tool-call-body").classList.contains("open"), true, "重读径失败卡展开态同形")
  const notice = ended.thread.querySelector(".message.notice")
  assert.ok(notice, "notice 行在场（唯一呈现径 = 重读）")
  assert.equal(notice.textContent, ADMIN_ZH["admin.chat.noticeAborted"], "notice 文案 = 第五值映射（`aborted`）")
})

// ── 结构腿（新档 ∥ 代码段 canons）────────────────────────────────────────────────

/** 注释剥离（块注释 ∥ 行注释——字符串态机：`//` 落在字符串内不误判；行注释含尾随形）。 */
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

test("结构腿：外拆新档在册 ∥ 兼容重导出 ∥ 零 CJK 代码段 ∥ 行宽 ≤300 ∥ 零 `innerHTML` 写口", () => {
  assert.ok(MESSAGES_SRC.includes("export function messageNodes"), "外拆件 `views-chat-messages.mjs` 承回读装配")
  assert.ok(VIEW_SRC.includes('from "./views-chat-messages.mjs"'), "页件接线外拆件")
  for (const name of ["splitLines", "parseFrame", "argsText", "noticeText", "messageNodes"]) {
    assert.match(VIEW_SRC, new RegExp(`export \\{[^}]*\\b${name}\\b`), `兼容重导出缺位：${name}（既有测试档零改）`)
  }
  for (const [name, src] of [["views-chat.mjs", VIEW_SRC], ["views-chat-messages.mjs", MESSAGES_SRC]]) {
    assert.equal(CJK.test(stripComments(src)), false, `${name} 代码段零 CJK（文案全入两表）`)
    assert.equal((src.match(/\.innerHTML\s*=/g) ?? []).length, 0, `${name} 零 \`innerHTML\` 写口（md/工具卡归核件）`)
    assert.equal(/https?:\/\//.test(src), false, `${name} 零外链`)
    assert.ok(Math.max(...src.split("\n").map((line) => line.length)) <= 300, `${name} 行宽 ≤300`)
  }
  const lines = VIEW_SRC.split("\n").length
  assert.ok(lines <= 500, `views-chat.mjs ≤500 软线（实读 ${lines}）`)
  assert.ok(MESSAGES_SRC.split("\n").length <= 500, "外拆件 ≤500 软线")
})

// ── 服务端零改（帧发射点回归腿——KD-SV-132④）───────────────────────────────────

test("服务端零改：帧发射点回归腿（`chat.mjs`——`turn`/`delta`/`call`/`result`/`end` 在档）", () => {
  for (const shape of [
    'emitFrame({ type: "turn", n: modelCalls })',
    'emitFrame({ type: "delta", text: token })',
    'emitFrame({ type: "call", id: call.id, name: call.name, args: call.args })',
    'emitFrame({ type: "result", id: call.id, ok: result?.ok === true, summary })',
  ]) {
    assert.ok(SERVER_SRC.includes(shape), `帧发射点缺位（服务端零改——零新帧/零新字段）：${shape}`)
  }
  assert.ok(/emitFrame\(\{ type: "end", status:/.test(SERVER_SRC), "`end` 帧发射点在档")
  assert.equal(SERVER_SRC.includes('type: "step"'), false, "零新帧（步界 = 既有 `turn` 帧——KD-SV-132④）")
})
