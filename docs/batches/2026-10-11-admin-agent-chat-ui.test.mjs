/**
 * 2026-10-11-admin-agent-chat-ui.test.mjs — thincoder-server 批内单测件（控制台面·对话页——admin-agent-chat 批；判据源 =
 * `webui/WEBUI.md` §2.10 ∥ §2.2 ∥ §2.3④ ∥ §5 行数预算 ∥ §6 本批行；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-11-admin-agent-chat-ui.test.mjs`
 *
 * 射程（腿 ↔ 设计轴对照在括号）：
 *   ① 纯函数（NDJSON 行切分 ∥ 帧解析 ∥ 参数摘要两形 ∥ notice 四形（精确值））
 *   ② 会话条（加载/空/失败三态 + 重试 ∥ 活动态 ∥ 在途徽标 ∥ 摘要空值「—」）
 *   ③ 新会话弹窗（模型下拉 `deriveModels` 同源 ∥ 缺省 = 最近一次所用 ∥ 无模型门 ∥ 提交 ⇒ 建会话 ⇒ 选中）
 *   ④ 对话区四形（用户 ∥ 助手 ∥ 工具行（失败红标 + 参数摘要回填）∥ notice）+ 空态
 *   ⑤ 输入区（空值不提交 ∥ 在途禁用 + 运行中指示）
 *   ⑥ 流读取（假流桩：分块跨帧 ∥ delta 追加 ∥ call/result 工具行 ∥ end ⇒ 重读详情——取数序列逐条）
 *   ⑦ 断连（读流中止——零未押异常，部分文本留场）∥ 离页（挂载点断开 ⇒ reader.cancel）∥ 流前错误（信封 ⇒ 就地人话 + 草稿还原）
 *   ⑧ i18n 两表（本批 29 键逐键在场 ∥ 四退役键零残留 ∥ 占位符对位 ∥ en 零 CJK ∥ 基键集双向相等 ∥ 键数终值）
 *   ⑨ 审计面（`agent_event` 型接 ∥ 详情 `summary` 支 ∥ 枚举外原值兜底）
 *   ⑩ 静态面（档目 +1 ∥ nav 管理 9 ∥ app 接线 ∥ 非壳页 ∥ 行数/行宽 ∥ 零外链 ∥ t 字面量闭合 ∥ 类名双向闭合 ∥ AC-19 canon）
 *   ⑪ 键消费闭包（本批键零死键）
 *   ⑫ 流归属（流中切会话 ⇒ 丢帧不串台 ∥ `end` 不重读换视图 —— 评审轮 must-fix 的回归腿）
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const PUBLIC_DIR = join(ROOT, "thincoder-server", "public")
const readPublic = (name) => readFileSync(join(PUBLIC_DIR, name), "utf8")
const load = (name) => import(pathToFileURL(join(PUBLIC_DIR, name)).href)

const [{ ZH }, { EN }, CHAT, MODELS, NAV, AUDIT] = await Promise.all([
  load("i18n-zh.mjs"), load("i18n-en.mjs"), load("views-chat.mjs"), load("views-models.mjs"), load("nav.mjs"), load("views-audit.mjs"),
])
const VIEW_SRC = readPublic("views-chat.mjs")
const AUDIT_SRC = readPublic("views-audit.mjs")
const CSS = readPublic("style.css")

// 核件帧纪律桩（`createStreamRenderer` rAF 节流——桩落宏任务，随 `await tick()` 落帧）
globalThis.requestAnimationFrame = (fn) => setTimeout(() => fn(Date.now()), 0)
globalThis.cancelAnimationFrame = (id) => clearTimeout(id)

/** 本批新增键现值（27 `admin.chat.*`〔新增 31 − 退役 4——§2.7-1〕+ 1 nav〔shell 部件〕+ 1 `audit.type.agent_event`〔system 部件〕——§2.2 键族登记；两表逐键同步）。 */
const NEW_KEYS = [
  "admin.chat.title", "admin.chat.newChat", "admin.chat.create", "admin.chat.modelLabel",
  "admin.chat.modelPick", "admin.chat.noModels", "admin.chat.modelRequired", "admin.chat.chatsEmpty",
  "admin.chat.listFailed", "admin.chat.detailFailed", "admin.chat.retry", "admin.chat.statusRunning", "admin.chat.noChatSelected",
  "admin.chat.threadEmpty", "admin.chat.reread", "admin.chat.noticeInterrupted", "admin.chat.noticeBudget", "admin.chat.noticeModelError",
  "admin.chat.noticeEmpty", "admin.chat.streamBroken",
  "nav.page.admin.chat", "audit.type.agent_event",
]
/** 退役键（console-chat-align 批四键 + chat-shell-align 批七键——删净断言）。 */
const RETIRED_KEYS = ["admin.chat.toolCall", "admin.chat.toolResult", "admin.chat.toolCalling", "admin.chat.toolFailed",
  "admin.chat.newChatHint", "admin.chat.chatsTitle", "admin.chat.running", "admin.chat.inputPh", "admin.chat.send", "admin.chat.messageRequired", "admin.chat.inputHint"]
/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」「…」等中性标点不在内）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",")
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/([^:])\/\/.*$/gm, "$1")

// ── 桩 DOM（`h` 同 app 语义近似；`modal.mjs` 壳面近形：showModal/close/classList/remove）───────────

/** 核件 `innerHTML` 产物 ⇒ 桩节点（最小子集：标签/类/文本——供 `textOf`/`fFind` 遍历）。 */
function parseHtmlInto(host, html) {
  host.children = []
  const stack = [host]
  const re = /<\/?([a-zA-Z][\w-]*)((?:\s+[^>]*?)?)\/?>|([^<]+)/g
  let match
  while ((match = re.exec(html)) !== null) {
    if (match[3] !== undefined) {
      stack[stack.length - 1].children.push({ textContent: match[3].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, "\"").replace(/&#39;/g, "'").replace(/&amp;/g, "&") })
      continue
    }
    if (match[0].startsWith("</")) {
      if (stack.length > 1) stack.pop()
      continue
    }
    const node = makeNode(match[1])
    const classAttr = (match[2] ?? "").match(/\bclass\s*=\s*"([^"]*)"/)
    if (classAttr !== null) node.className = classAttr[1]
    stack[stack.length - 1].children.push(node)
    if (!match[0].endsWith("/>") && !["br", "hr", "img", "input"].includes(match[1].toLowerCase())) stack.push(node)
  }
}

function makeNode(tag) {
  const classes = new Set()
  return {
    tag, children: [], listeners: {}, attrs: {}, parent: null,
    open: false, textContent: "", className: "", value: "", hidden: false, disabled: false, scrollTop: 0, scrollHeight: 0, dataset: {}, style: {},
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle: (name, force) => { const on = force ?? !classes.has(name); if (on) classes.add(name); else classes.delete(name); return on },
    },
    append(...items) {
      for (const item of items.flat(Infinity)) {
        if (item === null || item === undefined || item === false) continue
        if (typeof item === "object") item.parent = this
        this.children.push(item)
      }
    },
    replaceChildren(...items) { this.children = []; this.append(...items) },
    appendChild(item) { this.append(item); return item },
    insertBefore(item, ref) { const index = this.children.indexOf(ref); if (index === -1) { this.append(item); return item } if (item !== null && typeof item === "object") item.parent = this; this.children.splice(index, 0, item); return item },
    removeChild(item) { this.children = this.children.filter((child) => child !== item); if (item !== null && typeof item === "object") item.parent = null; return item },
    prepend(...items) { const list = items.flat(Infinity).filter((item) => item !== null && item !== undefined && item !== false); for (const item of list) if (typeof item === "object") item.parent = this; this.children.unshift(...list) },
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
    querySelector(selector) {
      const pred = selector.startsWith(".") ? (node) => String(node.className).split(/\s+/).includes(selector.slice(1)) : (node) => node.tag === selector
      return fFindAll(this, pred)[0] ?? null
    },
    querySelectorAll(selector) {
      const pred = selector.startsWith(".") ? (node) => String(node.className).split(/\s+/).includes(selector.slice(1)) : (node) => node.tag === selector
      return fFindAll(this, pred)
    },
    get innerHTML() { return this._innerHTML ?? "" },
    set innerHTML(value) { this._innerHTML = String(value); parseHtmlInto(this, this._innerHTML) },
    showModal() { this.open = true },
    close() { this.open = false; for (const fn of this.listeners.close ?? []) fn({}) },
  }
}

const stubDocument = () => ({ body: makeNode("body"), createElement: (tag) => makeNode(tag), createTextNode: (text) => ({ textContent: String(text) }), getElementById: () => null })

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
const byText = (root, text) => fFind(root, (node) => node.textContent === text)
const textOf = (node) => (typeof node === "string" ? node : [node?.textContent ?? "", ...(node?.children ?? []).map(textOf)].filter(Boolean).join(" "))
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const optionsOf = (select) => fFindAll(select, (node) => node.tag === "option")

/** 桩 ctx（api 路由表 `"METHOD path"` ⇒ handler；全调用入共享 `log`——与假 fetch 同序）。 */
function fCtx(routes = {}, log = []) {
  return {
    h: fH,
    dataShell: (mount, { head, area }) => mount.append(head, area),
    api: async (path, { method = "GET", body } = {}) => {
      log.push(`api ${method} ${path}`)
      const handler = routes[`${method} ${path}`] ?? routes[`${method} ${path.split("?")[0]}`]
      if (handler === undefined) throw new Error(`unexpected ${method} ${path}`)
      return handler(body)
    },
    fmtTs: (ts) => `ts:${ts}`,
    table: (headers, rows, { foot = false } = {}) => fH("div", { class: "table-wrap" },
      fH("table", {},
        fH("thead", {}, fH("tr", {}, ...headers.map((label) => fH("th", { text: label })))),
        fH("tbody", {}, ...rows.map((cells) => fH("tr", {}, ...cells.map((cell) => fH("td", {}, ...(Array.isArray(cell) ? cell : [cell])))))),
        ...(foot ? [fH("tfoot", {}, fH("tr", {}, fH("td", { colspan: String(headers.length), text: ZH["common.rowCount"].replace("{count}", String(rows.length)) })))] : []))), // 表格（dom.mjs `table` 同形近似——审计页面）
    flash: (message) => log.push(`flash ${message}`),
    fail: (error) => log.push(`fail ${String(error?.message ?? error)}`),
  }
}

/** 假流（NDJSON 分块 ⇒ response）：`chunks` = 字符串块数组 ∥ `failAt` = 第 N 次 read 抛错（断连桩）。 */
function fStreamResponse(chunks, { failAt = -1 } = {}) {
  let index = 0
  let reads = 0
  return {
    ok: true,
    status: 200,
    json: async () => ({}),
    body: {
      getReader: () => ({
        async read() {
          if (failAt >= 0 && reads === failAt) throw new Error("socket closed")
          reads += 1
          if (index >= chunks.length) return { done: true, value: undefined }
          return { done: false, value: new TextEncoder().encode(chunks[index++]) }
        },
        async cancel() { reads += 1 },
      }),
    },
  }
}

/** 确定性失败（映射面人话——服务端信封形）。 */
const failEnvelope = (status, code, message) => () => ({
  ok: false, status, json: async () => ({ error: { code, message } }),
})

const fChatRow = (over = {}) => ({ id: 1, model: "p1/m-1", status: "idle", createdAt: 1700000000000, updatedAt: 1700000000000, excerpt: "你好", ...over })
const PROVIDERS = [{ id: 1, name: "p1", baseURL: "http://x/v1", apiKey: "", models: ["m-1", "m-2"] }]
const MODEL_IDS = MODELS.deriveModels(PROVIDERS).map((row) => row.id)

/** 页面渲染夹具（桩 DOM + 假 fetch——fetch 调用与 api 调用同入 `log`）。 */
async function fMount({ routes = {}, chats = [fChatRow()], chunks = [], fetchImpl = null } = {}) {
  globalThis.document = stubDocument()
  const log = []
  const ctx = fCtx({ "GET /api/admin/agent/chats": () => ({ chats }), ...routes }, log)
  globalThis.fetch = async (url, init) => {
    log.push(`fetch ${init.method} ${url}`)
    if (fetchImpl !== null) return fetchImpl(url, init)
    return fStreamResponse(chunks)
  }
  const mount = makeNode("section")
  await CHAT.renderChat(ctx, mount)
  return { ctx, log, mount }
}

const threadOf = (mount) => fFind(mount, (node) => node.className === "chat-thread")
const noteOf = (mount) => fFindAll(mount, (node) => node.tag === "p" && node.className === "hint error").at(-1) ?? null
const sendBtnOf = (mount) => byText(mount, ZH["admin.chat.send"])

// ── ① 纯函数（流帧面）────────────────────────────────────────────────────────

test("① 纯函数：行切分（跨块/残行）∥ 帧解析（坏行 null）∥ 参数摘要两形 ∥ notice 四形 ∥ 工具参数索引", () => {
  assert.deepEqual(CHAT.splitLines('{"type":"delta"}\n{"type":"ca', 'll"}\n'), { lines: ['{"type":"delta"}', '{"type":"call"}'], rest: "" }, "跨块行切分（残行归位）")
  assert.deepEqual(CHAT.splitLines("", '{"a":1}\n{"b"'), { lines: ["{\"a\":1}"], rest: '{"b"' }, "末帧无换行 ⇒ 残行留待再切")
  assert.deepEqual(CHAT.parseFrame('{"type":"delta","text":"x"}'), { type: "delta", text: "x" }, "帧解析")
  assert.deepEqual([CHAT.parseFrame("junk"), CHAT.parseFrame("[1]"), CHAT.parseFrame('{"text":"x"}')], [null, null, null], "坏行/非对象/无 type ⇒ null（跳过——零未押异常）")
  assert.deepEqual([CHAT.argsText('{"op":"list"}'), CHAT.argsText({ op: "list" }), CHAT.argsText(null)], ['{"op":"list"}', '{"op":"list"}', ""], "参数摘要两形兼容")
  assert.deepEqual(
    [CHAT.noticeText({ content: "x", data: { reason: "restart" } }), CHAT.noticeText({ content: "x", data: { reason: "budget" } }),
      CHAT.noticeText({ content: "x", data: { reason: "model_error" } }), CHAT.noticeText({ content: "x", data: { reason: "empty_turn" } }),
      CHAT.noticeText({ content: "服务端人话句", data: { reason: "model_error_v2" } }), CHAT.noticeText({ content: "人话句", data: {} }),
      CHAT.noticeText({ content: "" })],
    [ZH["admin.chat.noticeInterrupted"], ZH["admin.chat.noticeBudget"], ZH["admin.chat.noticeModelError"], ZH["admin.chat.noticeEmpty"],
      "服务端人话句", "人话句", "—"],
    "notice 四形精确值命中（`restart`/`budget`/`model_error`/`empty_turn`）+ 近似值不当命中（`model_error_v2` ⇒ 原文）+ 无 reason/空值兜底")
})

// ── ②–⑦ 页面行为腿（旧页类名断言——**页件经 chat-shell-align 批重写后失效**）────────────
// 承继关系：本页 = 同一页件的后续重构（`views-chat.mjs` 改写 + `views-chat-composer.mjs` 拆件；类面改由核件发射
// `message user`/`message assistant`/`bubble`，会话选取 = `select.chat-select` 换 `chat-row` 行点）。②–⑦ 的旧类名断言
// 已不可机检——**语义覆盖移至承继件**（同一门禁链）：`docs/batches/2026-10-11-chat-shell-align.test.mjs` ∥ `docs/batches/2026-10-11-chat-shell-align-ui.test.mjs`（2026-10-13 拆档）
// （N68 装配 ∥ N69 回读装配 ∥ N64 帧序 ∥ N67 中止 ∥ N70 状态行 ∥ 结构腿核件调用面）。

test("②–⑦ 页面行为腿：由承继件覆盖（页件重写后生效——指针腿）", () => {
  const successor = join(ROOT, "docs", "batches", "2026-10-11-chat-shell-align.test.mjs")
  const successorUi = join(ROOT, "docs", "batches", "2026-10-11-chat-shell-align-ui.test.mjs")
  assert.ok(existsSync(successor) && existsSync(successorUi), "承继件在盘（行为面覆盖所归——同一门禁链；2026-10-13 拆档两档）")
  const successorSrc = readFileSync(successor, "utf8") + readFileSync(successorUi, "utf8")
  for (const leg of ["N68 装配", "N69 回读装配", "N64 帧序", "N67/B65 中止", "N70 状态行", "结构腿"]) {
    assert.ok(successorSrc.includes(leg), `承继腿在册：${leg}`)
  }
})

// ── ⑧ i18n 两表（§2.2——键族 ∥ 占位符 ∥ en 零 CJK ∥ 键集 ∥ 键数）────────────────

test("⑧ i18n：本批 22 键逐键在场 ∥ 十一退役键删净 ∥ 占位符对位 ∥ en 零 CJK ∥ 基键集双向相等 ∥ 键数终值 892 ∥ 897", () => {
  for (const key of NEW_KEYS) {
    for (const [lang, table] of [["zh", ZH], ["en", EN]]) {
      assert.ok(typeof table[key] === "string" && table[key].trim() !== "", `${lang} 表缺键：${key}`)
    }
    assert.equal(placeholders(ZH[key]), placeholders(EN[key]), `占位符不对位：${key}`)
    assert.equal(CJK.test(EN[key]), false, `en 值含 CJK：${key}`)
  }
  assert.equal(NEW_KEYS.length, 22, "本批键数（20 admin.chat + 1 nav + 1 audit 型键）")
  for (const key of RETIRED_KEYS) assert.deepEqual([key in ZH, key in EN], [false, false], `退役键删净：${key}`)
  const SELF_NAMES = new Set(["lang.zh", "lang.en"])
  const base = (table) => new Set(Object.keys(table).filter((key) => !SELF_NAMES.has(key)).map((key) => key.replace(/\.one$/, "")))
  const zhBase = base(ZH)
  const enBase = base(EN)
  assert.deepEqual([...zhBase].filter((key) => !enBase.has(key)), [], "仅 zh 键（自称名族除外）")
  assert.deepEqual([...enBase].filter((key) => !zhBase.has(key)), [], "仅 en 键（`.one` 变体族除外）")
  assert.equal(ZH["nav.page.admin.chat"], "对话", "nav 键（zh）")
  assert.equal(EN["nav.page.admin.chat"], "Chat", "nav 键（en）")
    assert.deepEqual([Object.keys(ZH).length, Object.keys(EN).length], [970, 975], "键数终值（2026-10-11 批组 + 走查实修后 + 走查实修④ kind +4 + 轻通道笔 10 命令字段 +2 + admin-agent-awareness 批 +3 + team-projects-permissions 批 +158 + 在途批组键增（2026-10-13 父侧复读 872 ∥ 877）+ sandbox-outbound-member-face 批 +20/表（`me.sandbox.*` 19 键 + `nav.page.me.sandbox` 1 键）+ team-ledger 批 +67/表 + sandbox-container-actions 批 +3/表 + gitee-namespace-kinds 批 +8/表——实读）")
})

// ── ⑨ 审计面（`agent_event` 型接 ∥ 详情 summary 支）──────────────────────────

test("⑨ 审计面：`agent_event` 型接（下拉 + 表）∥ 详情 `summary` 支 ∥ 枚举外型原值兜底", async () => {
  const events = [
    { ts: 1700000000000, type: "agent_event", actor: "admin", target: "chat:1", detail: { kind: "chat_call", chatId: 1, tool: "members", summary: "members list ⇒ ok（3 项）" } },
    { ts: 1700000001000, type: "sandbox_event", actor: "admin", target: "", detail: { kind: "container_start" } },
    { ts: 1700000002000, type: "weird_event", actor: "admin", target: "", detail: {} },
  ]
  globalThis.document = stubDocument()
  const log = []
  const ctx = fCtx({ "GET /api/audit": () => ({ events }) }, log)
  const mount = makeNode("section")
  await AUDIT.renderAudit(ctx, mount)
  const select = fFind(mount, (node) => node.tag === "select")
  assert.ok(optionsOf(select).some((option) => option.value === "agent_event" && option.textContent === ZH["audit.type.agent_event"]), "型面下拉接 agent_event")
  const cells = fFindAll(mount, (node) => node.tag === "td").map((cell) => textOf(cell))
  assert.ok(cells.includes(ZH["audit.type.agent_event"]), "表内类型文案（表键）")
  assert.ok(cells.some((cell) => cell.includes("members list ⇒ ok（3 项）")), "详情模板渲染（含 summary 原句）")
  assert.ok(cells.includes(ZH["audit.type.sandbox_event"]), "沙盒型 ⇒ 表键文案（走查轮两型入枚举）")
  assert.ok(cells.includes("weird_event"), "枚举外型 ⇒ 原值兜底（零遗漏）")
  assert.ok(AUDIT_SRC.includes("agent_event") && AUDIT_SRC.includes("detail.summary"), "型枚举 + summary 支在档（结构面）")
  delete globalThis.document
})

// ── ⑩ 静态面（档目 ∥ nav ∥ app 接线 ∥ 非壳页 ∥ 行数/行宽 ∥ 零外链 ∥ 键/类闭合 ∥ canon）─────

test("⑩ 静态面：档目 54 ∥ 53 ∥ nav 管理 10（对话位次 2）∥ app 接线 ∥ 非壳页 ∥ 行数/行宽/零外链 ∥ 键/类闭合 ∥ AC-19 canon", () => {
  const names = readdirSync(PUBLIC_DIR).sort()
  assert.deepEqual([names.length, names.filter((name) => name !== "favicon.png").length], [54, 53], "档目 54 ∥ 53（2026-10-13：+admin-chat-creds-merge host-credential.mjs ∥ +console-chat-live-step views-chat-messages.mjs ∥ +sandbox-outbound-member-face views-me-sandbox.mjs ⇒ +team-ledger 批 +3）")
  assert.ok(names.includes("views-chat.mjs"), "新档在册")
  // nav（管理 11 ∥ 「对话」第 2 位——总览后）
  const admin = NAV.NAV_GROUPS.find((group) => group.key === "admin")
  assert.equal(admin.items.length, 10, "管理 10（2026-10-13 project-sources-merge 批：单入口后收正；对话位次不变）")
  assert.deepEqual(admin.items[1], { key: "chat", labelKey: "nav.page.admin.chat", path: "/admin/chat" }, "对话 = 管理组第 2 位（labelKey 单源）")
  assert.deepEqual(NAV.resolveRoute("/admin/chat", "admin"), { path: "/admin/chat" }, "admin 面可达")
  assert.equal(NAV.resolveRoute("/admin/chat", "user").denied, true, "user ⇒ 页面级 denied（判权仍在服务端）")
  assert.deepEqual(NAV.ROUTE_ALIASES, { "/me": "/me/keys", "/admin": "/admin/overview", "/admin/proxy": "/admin/system", "/admin/git-sources": "/admin/projects/git-sources" }, "旧链别名 +1（project-sources-merge 批）")
  // app.mjs 接线（import + PAGES 行）+ 非壳页
  const appSrc = readPublic("app.mjs")
  assert.ok(appSrc.includes('import { renderChat } from "./views-chat.mjs"'), "app 导入面")
  assert.ok(appSrc.includes('"/admin/chat": renderChat'), "app PAGES 行")
  const shell = appSrc.match(/const SHELL_PAGES = new Set\(\[([^\]]*)\]\)/)[1]
  assert.deepEqual(shell.split(",").map((entry) => entry.trim()).filter(Boolean), ['"/admin/members"', '"/admin/providers"', '"/admin/models"', '"/admin/audit"', '"/me/usage"'], "SHELL_PAGES 五路径不动（对话页非壳——§2.10）")
  // 行数/行宽/零外链/零 CJK（软线 500）
  const lines = VIEW_SRC.split("\n").length
  assert.ok(lines <= 500, `views-chat.mjs 越 500 软线（硬限 800）：${lines}`)
  assert.ok(Math.max(...VIEW_SRC.split("\n").map((line) => line.length)) <= 300, "行宽 ≤300")
  assert.deepEqual([/https?:\/\//.test(VIEW_SRC), VIEW_SRC.includes("@import")], [false, false], "零外链（KD-SV-9）")
  assert.equal(CJK.test(stripComments(VIEW_SRC)), false, "档面代码段零 CJK（文案全入两表）")
  // `t` 字面量闭合（两表）
  for (const match of stripComments(VIEW_SRC).matchAll(/\bt\(\s*"([^"]+)"\s*[,)]/g)) {
    assert.ok(match[1] in ZH && match[1] in EN, `t 字面量悬空：${match[1]}`)
  }
  // 类名双向闭合（AC-19 canon 同口径——档面字面类 ⊆ 样式类；新类双向在场）
  const cssClasses = new Set([...CSS.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]))
  const used = new Set()
  for (const match of VIEW_SRC.matchAll(/\bclass(?:Name)?\s*[:=]\s*([^\n;]*?)(?=\s*\bclass(?:Name)?\s*[:=]|[;\n]|$)/g)) {
    const window = match[1].replace(/\$\{[^}]*\}/g, " ").split("//")[0].split("}")[0].split(/,\s*(?:[A-Za-z_$][\w$]*|"[^"]*"|'[^']*')\s*:/)[0]
    for (const literal of window.matchAll(/["'`]([^"'`]*)["'`]/g)) for (const token of literal[1].split(/\s+/)) if (token) used.add(token)
  }
  for (const match of VIEW_SRC.matchAll(/classList\.(?:add|remove)\(([^)]*)\)/g)) {
    for (const literal of match[1].matchAll(/["'`]([^"'`]*)["'`]/g)) for (const token of literal[1].split(/\s+/)) if (token) used.add(token) // 类名直添面（`classList.add("failed")` 类）
  }
  // （启发式注：上面两条提取优先把模板占位置空再取字面量——本批类名全为字面量故完整；后续批若改拼接类名需同步加固）
  for (const token of used) assert.ok(cssClasses.has(token), `档面类无样式规则：${token}`)
  for (const token of ["chat-bar", "chat-select", "chat-thread", "message", "notice"]) {
    assert.ok(used.has(token) && cssClasses.has(token), `新页类双向闭合：${token}`)
  }
   // `:root` 58 ∥ 悬停八条（2026-10-11 走查轮后基线——AC-19 canon；2026-10-12 走查实修④ `--vscode-*` 族桥 +8）
  const cssClean = stripComments(CSS)
  assert.equal([...cssClean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].length, 58, ":root 58（2026-10-11 走查轮后基线 ⇒ 2026-10-12 走查实修④ +8）")
   assert.equal([...cssClean.matchAll(/:hover/g)].length, 8, "悬停八条（七 + 页签一）")
})

// ── ⑪ 收尾：`t` 键族闭包（本批键全被消费）────────────────────────────────────

test("⑪ 键消费闭包：`admin.chat.*` 键族在档面被消费（零死键）∥ notice 四形经映射表消费", () => {
  const source = stripComments(VIEW_SRC) + stripComments(readPublic("views-chat-composer.mjs")) + stripComments(readPublic("views-chat-messages.mjs"))
  const consumed = new Set([
    ...[...source.matchAll(/\bt\(\s*"([^"]+)"/g)].map((match) => match[1]),
    ...[...source.matchAll(/"([a-zA-Z][\w]*(?:\.[\w]+)+)"/g)].map((match) => match[1]), // 全字符串字面量（键可作映射表值——如 NOTICE_KEYS）
  ])
  const deadKeys = NEW_KEYS.filter((key) => key.startsWith("admin.chat.") && !consumed.has(key))
  assert.deepEqual(deadKeys, [], "admin.chat.* 零死键（逐键有消费点）")
  for (const key of ["admin.chat.noticeInterrupted", "admin.chat.noticeBudget", "admin.chat.noticeModelError", "admin.chat.noticeEmpty"]) {
    assert.ok(consumed.has(key), `notice 四形消费：${key}`)
  }
})

// ── ⑫ 流归属（旧页类名断言——**页件经 chat-shell-align 批重写后失效**）────────────
// 承继关系：流中切会话/丢帧面 = 承继件 `docs/batches/2026-10-11-chat-shell-align.test.mjs`（N64 帧序 ∥ N67 中止 ∥
// B67 队列 ∥ 结构腿）；旧 `chat-row` 行选取断言已不可机检。

test("⑫ 流归属：由承继件覆盖（页件重写后生效——指针腿）", () => {
  const successor = join(ROOT, "docs", "batches", "2026-10-11-chat-shell-align.test.mjs")
  const successorUi = join(ROOT, "docs", "batches", "2026-10-11-chat-shell-align-ui.test.mjs")
  assert.ok(existsSync(successor) && existsSync(successorUi), "承继件在盘（流归属面覆盖所归；2026-10-13 拆档两档）")
  const successorSrc = readFileSync(successor, "utf8") + readFileSync(successorUi, "utf8")
  for (const leg of ["N64 帧序", "N67/B65 中止", "B67 队列"]) {
    assert.ok(successorSrc.includes(leg), `承继腿在册：${leg}`)
  }
})
