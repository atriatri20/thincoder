/**
 * 2026-10-13-server-mcp-ui.test.mjs — thincoder-server 批内件（`server-mcp` 批 · **控制台面舱**；名随批档 · 住 `docs/batches/`）：
 * MCP 管理页（`#/admin/mcp`——`views-mcp.mjs` + i18n mcp 两部件 + nav/app/壳/审计渲染随正）：页形/清单/探活/启停腿
 * （判据 = `webui/MCP.md` §4 ①–⑧ 逐条）∥ 键面腿（两部件逐键在场 ∥ en 零 CJK ∥ 占位符对位 ∥ shell/system 各 +1）∥
 * 接线腿（nav 管理 11 ∥ app 接线 ∥ `views-audit` 枚举 +1）∥ 静态腿（`node --check` 全改档 ∥ ≤500 软线 ∥ 零 CJK 代码段 ∥ 类双向闭合）。
 * 运行（自 `thincoder/` 仓根——`--import` 缝行沿批目录先例；本件 import 链零 `/rc/*` 取件）：
 *   `node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-13-server-mcp-ui.test.mjs`
 *
 * 面别限定：本档只测 控制台面（webui）；服务端面（`src/mcp/*` ∥ 迁移 ∥ chat 挂载 ∥ 审计写入）= 同批另舱件
 * `docs/batches/2026-10-13-server-mcp.test.mjs`（同批两舱、文件域互不相交）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { spawnSync } from "node:child_process"
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, "..", "..")
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`批内件须住 thincoder/docs/batches/ 下——HERE = ${HERE}`)
const SERVER = join(ROOT, "thincoder-server")
const PUBLIC_DIR = join(SERVER, "public")
const DOCS = join(ROOT, "docs")
const readPublic = (name) => readFileSync(join(PUBLIC_DIR, name), "utf8")
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const ZH_MCP = (await load("thincoder-server/public/i18n-zh-mcp.mjs")).ZH_MCP
const EN_MCP = (await load("thincoder-server/public/i18n-en-mcp.mjs")).EN_MCP
const ZH_SHELL = (await load("thincoder-server/public/i18n-zh-shell.mjs")).ZH_SHELL
const EN_SHELL = (await load("thincoder-server/public/i18n-en-shell.mjs")).EN_SHELL
const ZH_SYSTEM = (await load("thincoder-server/public/i18n-zh-system.mjs")).ZH_SYSTEM
const EN_SYSTEM = (await load("thincoder-server/public/i18n-en-system.mjs")).EN_SYSTEM
const ZH_ALL = (await load("thincoder-server/public/i18n-zh.mjs")).ZH
const EN_ALL = (await load("thincoder-server/public/i18n-en.mjs")).EN
const NAV = await load("thincoder-server/public/nav.mjs")
const AUDIT = await load("thincoder-server/public/views-audit.mjs")
const PAGE = await load("thincoder-server/public/views-mcp.mjs")

const PAGE_SRC = readPublic("views-mcp.mjs")
const ZH_MCP_SRC = readPublic("i18n-zh-mcp.mjs")
const EN_MCP_SRC = readPublic("i18n-en-mcp.mjs")
const APP_SRC = readPublic("app.mjs")
const NAV_SRC = readPublic("nav.mjs")
const AUDIT_SRC = readPublic("views-audit.mjs")
const STYLE_SRC = readPublic("style.css")
const WEBUI_SRC = readFileSync(join(DOCS, "server", "design", "webui", "WEBUI.md"), "utf8")

/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——中性标点「—」「…」不在内——全仓 canon 同式）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
/** 本舱改档（静态腿扫描面——逐档 `node --check` + 行数/行宽）。 */
const TOUCHED = [
  "thincoder-server/public/views-mcp.mjs",
  "thincoder-server/public/i18n-zh-mcp.mjs",
  "thincoder-server/public/i18n-en-mcp.mjs",
  "thincoder-server/public/i18n-zh.mjs",
  "thincoder-server/public/i18n-en.mjs",
  "thincoder-server/public/i18n-zh-shell.mjs",
  "thincoder-server/public/i18n-en-shell.mjs",
  "thincoder-server/public/i18n-zh-system.mjs",
  "thincoder-server/public/i18n-en-system.mjs",
  "thincoder-server/public/views-audit.mjs",
  "thincoder-server/public/nav.mjs",
  "thincoder-server/public/app.mjs",
]

// ── 装置：假 DOM（`openModal`/`confirmModal` 真跑——沿批目录先例假 DOM 法） ────────────

function makeNode(tag) {
  let text = ""
  const classes = new Set()
  const node = {
    tag, children: [], listeners: {}, attrs: {}, parent: null,
    open: false, value: "", hidden: false, disabled: false, checked: false,
    get textContent() { return node.children.length > 0 ? node.children.map((child) => (typeof child === "string" ? child : (child.textContent ?? ""))).join("") : text },
    set textContent(value) { text = String(value); node.children = [] },
  }
  Object.defineProperty(node, "className", {
    get: () => [...classes].join(" "),
    set: (value) => { classes.clear(); for (const token of String(value).split(/\s+/)) if (token) classes.add(token) },
  })
  node.classList = {
    add: (...names) => names.forEach((name) => classes.add(name)),
    remove: (...names) => names.forEach((name) => classes.delete(name)),
    contains: (name) => classes.has(name),
  }
  node.append = (...items) => { for (const item of items.flat(Infinity)) { if (item === null || item === undefined || item === false) continue; if (typeof item === "object") item.parent = node; node.children.push(item) } }
  node.replaceChildren = (...items) => { node.children = []; node.append(...items) }
  node.querySelector = (selector) => walk(node).find((child) => matches(child, selector)) ?? null
  node.querySelectorAll = (selector) => walk(node).filter((child) => matches(child, selector))
  node.addEventListener = (type, fn) => { (node.listeners[type] ??= []).push(fn) }
  node.setAttribute = (name, value) => { node.attrs[name] = String(value) }
  node.getAttribute = (name) => node.attrs[name] ?? null
  node.remove = () => { if (node.parent !== null) node.parent.children = node.parent.children.filter((child) => child !== node); node.parent = null }
  node.focus = () => {}
  node.showModal = () => { node.open = true }
  node.close = () => { node.open = false; for (const fn of node.listeners.close ?? []) fn({}) }
  node.fire = (type, event = {}) => {
    const target = { target: node, preventDefault() {}, stopPropagation() {}, ...event }
    return Promise.all((node.listeners[type] ?? []).map((fn) => fn(target)))
  }
  return node
}

const walk = (node, out = []) => { for (const child of node.children ?? []) { if (child && typeof child === "object") { out.push(child); walk(child, out) } } return out }

/** 选择器面（本档只用到：`tag` ∥ `#id` ∥ `.a` ∥ `.a.b` ∥ `tag.class` ∥ `[attr]`/`[attr="v"]`）。 */
function matches(node, selector) {
  if (typeof node === "string" || node.tag === "#text") return false
  const attr = /\[([\w-]+)(?:="([^"]*)")?\]$/.exec(selector)
  const head = attr === null ? selector : selector.slice(0, attr.index)
  if (attr !== null) {
    const value = node.attrs?.[attr[1]] ?? null
    if (value === null) return false
    if (attr[2] !== undefined && value !== attr[2]) return false
  }
  if (head === "") return true
  if (head.startsWith("#")) return (node.attrs?.id ?? null) === head.slice(1)
  if (head.startsWith(".")) return head.slice(1).split(".").every((name) => node.classList?.contains(name) === true)
  const tagMatch = /^([a-z][a-z0-9]*)((?:\.\w+)*)$/.exec(head)
  if (tagMatch === null) return false
  if (node.tag !== tagMatch[1]) return false
  return tagMatch[2].split(".").filter(Boolean).every((name) => node.classList?.contains(name) === true)
}

/** 假环境装台（`document`/`body`——弹窗件 `openModal` 真跑所需最小面）。 */
function installDom() {
  const body = makeNode("body")
  const document = {
    body,
    createElement: (tag) => makeNode(tag),
    createTextNode: (value) => { const node = makeNode("#text"); node.textContent = String(value); return node },
    getElementById: () => null,
    addEventListener: () => {},
  }
  globalThis.document = document
  return { body, mount: makeNode("section") }
}

/** `h`（`dom.mjs` 语义近似——class ∥ text ∥ on* ∥ 受控属性 ∥ setAttribute + 子节点）。 */
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

// ── 夹具（清单行 = `gateway/API.md` §2.13 行形）──────────────────────────────────

const STDIO_ROW = { id: 1, name: "web", transport: "stdio", target: "npx", enabled: true, hasSecrets: true }
const HTTP_ROW = { id: 2, name: "api", transport: "http", target: "http://127.0.0.1:9/mcp", enabled: false, hasSecrets: false }

/** 假世界（活行集 ∥ 逐端点定制——定制返回 `undefined` 落缺省行为）。 */
function makeWorld({ servers = [], probe = null, post = null, patch = null, del = null } = {}) {
  const dom = installDom()
  const state = { servers: servers.map((row) => ({ ...row })), calls: [], failures: [], flashes: [] }
  const api = async (path, request = {}) => {
    const method = request?.method ?? "GET"
    const body = request?.body
    state.calls.push({ path, method, body })
    if (path === "/api/admin/mcp" && method === "GET") return { servers: state.servers.map((row) => ({ ...row })) }
    if (path === "/api/admin/mcp" && method === "POST") {
      if (post !== null) { const custom = await post(body); if (custom !== undefined) return custom }
      const row = { id: 90, name: body.name, transport: body.transport, target: body.command ?? body.url ?? body.wsUrl ?? "", enabled: body.enabled !== false, hasSecrets: Boolean(body.token || body.env || body.headers) }
      state.servers.push(row)
      return { id: 90 }
    }
    if (path === "/api/admin/mcp/probe" && method === "POST") {
      if (probe !== null) { const custom = await probe(body); if (custom !== undefined) return custom }
      return { ok: true, toolCount: 7, latencyMs: 42 }
    }
    if (path.startsWith("/api/admin/mcp/") && method === "PATCH") {
      if (patch !== null) { const custom = await patch(path, body); if (custom !== undefined) return custom }
      const id = Number(path.split("/").pop())
      const row = state.servers.find((item) => item.id === id)
      if (row !== undefined) Object.assign(row, body)
      return { ok: true }
    }
    if (path.startsWith("/api/admin/mcp/") && method === "DELETE") {
      if (del !== null) { const custom = await del(path); if (custom !== undefined) return custom }
      const id = Number(path.split("/").pop())
      state.servers = state.servers.filter((item) => item.id !== id)
      return { ok: true }
    }
    throw new Error(`unexpected api: ${method} ${path}`)
  }
  const ctx = { h: fH, api, fail: (error) => state.failures.push(error), flash: (text) => state.flashes.push(String(text)) }
  return { dom, state, ctx }
}

const render = async (world) => { await PAGE.renderMcp(world.ctx, world.dom.mount); return world.dom.mount }
const rowOf = (mount, name) => mount.querySelectorAll("tr").find((tr) => (tr.querySelectorAll("td")[0]?.textContent ?? "") === name) ?? null
const cellsOf = (tr) => tr.querySelectorAll("td").map((cell) => cell.textContent)
const byText = (root, label, tag = "button") => root.querySelectorAll(tag).find((node) => node.textContent === label) ?? null
/** 键值渲染（`{name}` 占位替换——同 `t()` 语义的最小版）。 */
const filled = (key, table, params) => Object.entries(params).reduce((text, [name, value]) => text.replaceAll(`{${name}}`, String(value)), table[key])

// ── T1 页形与清单（§4 ① ② ⑦——页在册 ∥ 五列逐值 ∥ 空态） ──────────────────────────

test("T1 页形与清单：标题+添加钮 ∥ 表五列逐值（目标列零秘密）∥ 启用勾随行 ∥ 三钮 ∥ 空态句", async () => {
  const decoy = { ...STDIO_ROW, token: "secret-token-1", headers: { A: "secret-h" }, env: { K: "secret-e" } } // 行面只取非秘密列（旁证键零泄）
  const world = makeWorld({ servers: [decoy, HTTP_ROW] })
  const mount = await render(world)

  assert.equal(mount.querySelector("h2").textContent, ZH_MCP["admin.mcp.title"], "页题 = `admin.mcp.title`")
  assert.ok(byText(mount, ZH_MCP["admin.mcp.add"]), "「添加」钮在册")
  assert.equal(world.dom.mount.querySelectorAll("table").length, 1, "清单表恰一枚")

  const headers = mount.querySelectorAll("th").map((th) => th.textContent)
  assert.deepEqual(headers, [ZH_MCP["admin.mcp.colName"], ZH_MCP["admin.mcp.colTransport"], ZH_MCP["admin.mcp.colTarget"], ZH_MCP["admin.mcp.colEnabled"], ZH_MCP["admin.mcp.colActions"]], "表头五列逐值")

  const rowWeb = rowOf(mount, "web")
  const rowApi = rowOf(mount, "api")
  assert.ok(rowWeb && rowApi, "两行在册（库序）")
  assert.deepEqual(cellsOf(rowWeb).slice(0, 3), ["web", "stdio", "npx"], "行一逐值（名称 ∥ 传输 ∥ 目标）")
  assert.deepEqual(cellsOf(rowApi).slice(0, 3), ["api", "http", "http://127.0.0.1:9/mcp"], "行二逐值")
  assert.equal(rowWeb.querySelector("input").checked, true, "启用勾随行（行一）")
  assert.equal(rowApi.querySelector("input").checked, false, "启用勾随行（行二）")
  assert.deepEqual(rowWeb.querySelectorAll("button").map((btn) => btn.textContent), [ZH_MCP["admin.mcp.probe"], ZH_MCP["admin.mcp.edit"], ZH_MCP["admin.mcp.remove"]], "三钮逐值（探活/改/删）")
  assert.equal(mount.textContent.includes("secret-token-1") || mount.textContent.includes("secret-h") || mount.textContent.includes("secret-e"), false, "清单表零秘密（旁证键零泄）")

  const empty = makeWorld({ servers: [] })
  const emptyMount = await render(empty)
  assert.equal(emptyMount.querySelector(".hint").textContent, ZH_MCP["admin.mcp.empty"], "空态引导句 = `admin.mcp.empty`")
})

// ── T2 探活行内三态（§4 ⑤——在飞/成/败 ∥ 体 `{id}`） ─────────────────────────────

test("T2 行内探活：读数行三态（在飞 ⇒ 钮禁 ∥ 成 ∥ 败就地错态）∥ 体 `{ id }` ∥ 复探复位", async () => {
  let release = null
  const gate = new Promise((resolve) => { release = resolve })
  const world = makeWorld({ servers: [STDIO_ROW], probe: () => gate })
  const mount = await render(world)
  const row = rowOf(mount, "web")
  const probeBtn = row.querySelectorAll("button")[0]
  const readoutRow = mount.querySelectorAll(".detail-row")[0]
  assert.ok(readoutRow && readoutRow.hidden === true, "读数行初隐（随行在册）")

  const done = probeBtn.fire("click") // 不 await：在飞面即时断言
  assert.equal(probeBtn.disabled, true, "在飞 ⇒ 钮禁用")
  assert.equal(readoutRow.hidden, false, "读数行随点展开")
  assert.equal(readoutRow.querySelector("span").textContent, ZH_MCP["admin.mcp.probeRunning"], "在飞文案")
  release({ ok: true, toolCount: 7, latencyMs: 42 })
  await done
  assert.equal(probeBtn.disabled, false, "落定 ⇒ 钮复位")
  assert.equal(readoutRow.querySelector("span").textContent, filled("admin.mcp.probeOk", ZH_MCP, { toolCount: 7, latencyMs: 42 }), "成 = `✓ {toolCount} tools, {latencyMs}ms`")
  assert.equal(readoutRow.querySelector("span").className, "hint", "成态中性（零错类）")
  assert.deepEqual(world.state.calls.filter((call) => call.path === "/api/admin/mcp/probe").map((call) => [call.method, call.body]), [["POST", { id: 1 }]], "行内径 = 体 `{ id }`")

  let probeCalls = 0
  const failed = makeWorld({ servers: [STDIO_ROW], probe: async () => ((probeCalls += 1) === 1 ? { ok: false, error: "连接超时" } : { ok: true, toolCount: 2, latencyMs: 3 }) })
  const failedMount = await render(failed)
  const failedBtn = rowOf(failedMount, "web").querySelectorAll("button")[0]
  await failedBtn.fire("click")
  const failedRow = failedMount.querySelectorAll(".detail-row")[0]
  assert.equal(failedRow.querySelector("span").textContent, filled("admin.mcp.probeFail", ZH_MCP, { error: "连接超时" }), "败 = `✗ {error}`")
  assert.equal(failedRow.querySelector("span").className, "hint error", "败 = 就地错态")

  await failedBtn.fire("click", {}) // 复探（成）⇒ 错态复位
  const retryRow = failedMount.querySelectorAll(".detail-row")[0]
  assert.equal(retryRow.querySelector("span").className, "hint", "复探成 ⇒ 错类退场")
  assert.equal(retryRow.querySelector("span").textContent, filled("admin.mcp.probeOk", ZH_MCP, { toolCount: 2, latencyMs: 3 }), "复探读数随新结果")
})

// ── T3 启用勾选即时写（§4 ④——成/败两态） ───────────────────────────────────────

test("T3 启用勾选即时写：成 ⇒ 行态随新数据 ∥ 败 ⇒ 红条 + 勾选回读", async () => {
  const world = makeWorld({ servers: [STDIO_ROW] })
  const mount = await render(world)
  const box = rowOf(mount, "web").querySelector("input")
  box.checked = false
  await box.fire("change")
  assert.deepEqual(world.state.calls.filter((call) => call.method === "PATCH").map((call) => [call.path, call.body]), [["/api/admin/mcp/1", { enabled: false }]], "即时写 = `PATCH …/:id { enabled }`")
  assert.equal(box.checked, false, "成 ⇒ 勾态留存（行态随新数据）")
  assert.deepEqual(world.state.failures, [], "成 ⇒ 零 fail")

  const failing = makeWorld({ servers: [STDIO_ROW], patch: async () => { throw Object.assign(new Error("存储不可用"), { status: 500, code: "internal_error" }) } })
  const failingMount = await render(failing)
  const failedBox = rowOf(failingMount, "web").querySelector("input")
  failedBox.checked = false
  await failedBox.fire("change")
  assert.equal(failing.state.failures.length, 1, "败 ⇒ `ctx.fail`（红条）恰一条")
  assert.equal(failedBox.checked, true, "败 ⇒ 勾选回读（行态未动）")
})

// ── T4 增/改弹窗（§4 ③ ⑥——三径 ∥ 秘密零回填 ∥ 草稿探活） ─────────────────────────

test("T4a 新建弹窗：三传输字段 ∥ 提交 POST 体逐值 ⇒ 关窗+flash+刷新 ∥ 败 ⇒ 窗内人话+草稿不丢 ∥ KV 非法就地人话", async () => {
  const world = makeWorld({ servers: [] })
  const mount = await render(world)
  await byText(mount, ZH_MCP["admin.mcp.add"]).fire("click")
  const dialog = world.dom.body.querySelector("dialog")
  assert.ok(dialog, "弹窗在场")
  assert.equal(dialog.querySelector("h3").textContent, ZH_MCP["admin.mcp.addTitle"], "新建标题")
  const [nameInput, commandInput, enabledCheck] = dialog.querySelectorAll("input")
  const [argsArea, envArea] = dialog.querySelectorAll("textarea")
  const transportSelect = dialog.querySelector("select")
  assert.deepEqual(transportSelect.querySelectorAll("option").map((option) => option.value), ["stdio", "http", "ws"], "传输三择")
  assert.equal(enabledCheck.checked, true, "启用缺省勾（新建）")

  // KV 非法 ⇒ 就地人话（零静默、零请求）
  nameInput.value = "web"
  commandInput.value = "npx"
  envArea.value = "BADLINE"
  const before = world.state.calls.length
  await byText(dialog, ZH_SHELL["common.save"]).fire("click")
  assert.equal(world.state.calls.length, before, "KV 非法 ⇒ 零请求")
  assert.equal(dialog.querySelector(".hint.error").hidden, false, "窗内人话在场")

  // 修好 ⇒ 提交
  argsArea.value = "-y\npkg"
  envArea.value = "API_KEY=abc\nX=1"
  await byText(dialog, ZH_SHELL["common.save"]).fire("click")
  assert.deepEqual(world.state.calls.filter((call) => call.method === "POST").map((call) => call.body), [{ name: "web", transport: "stdio", command: "npx", args: ["-y", "pkg"], env: { API_KEY: "abc", X: "1" }, enabled: true }], "POST 体逐值（args 数组 ∥ env 映射）")
  assert.equal(world.dom.body.querySelector("dialog"), null, "成 ⇒ 关窗")
  assert.ok(world.state.flashes.includes(filled("admin.mcp.saved", ZH_MCP, { name: "web" })), "成 ⇒ flash")
  assert.ok(rowOf(mount, "web"), "成 ⇒ 刷新（新行在册）")

  // 败 ⇒ 窗内人话 + 草稿不丢
  const failing = makeWorld({ servers: [], post: async () => { throw Object.assign(new Error("名称已存在"), { status: 400, code: "invalid_request_error" }) } })
  const failingMount = await render(failing)
  await byText(failingMount, ZH_MCP["admin.mcp.add"]).fire("click")
  const failedDialog = failing.dom.body.querySelector("dialog")
  const [failedName, failedCommand] = failedDialog.querySelectorAll("input")
  failedName.value = "dup"
  failedCommand.value = "npx"
  await byText(failedDialog, ZH_SHELL["common.save"]).fire("click")
  assert.ok(failedDialog.querySelector(".hint.error").textContent.includes("名称已存在"), "败 ⇒ 窗内人话（服务端原句）")
  assert.equal(failedName.value, "dup", "草稿不丢（名称在窗）")
  assert.equal(failedCommand.value, "npx", "草稿不丢（命令在窗）")
  assert.equal(failing.dom.body.querySelector("dialog").open, true, "败 ⇒ 弹窗留驻")
})

test("T4b 编辑弹窗：非秘密回填 ∥ 秘密零回填+提示+清除勾 ⇒ 显式 null ∥ 草稿探活携 id", async () => {
  const world = makeWorld({ servers: [{ ...HTTP_ROW, enabled: true, hasSecrets: true }] })
  const mount = await render(world)
  await rowOf(mount, "api").querySelectorAll("button")[1].fire("click")
  const dialog = world.dom.body.querySelector("dialog")
  assert.equal(dialog.querySelector("h3").textContent, ZH_MCP["admin.mcp.editTitle"], "编辑标题")
  const inputs = dialog.querySelectorAll("input")
  const nameInput = inputs[0]
  const urlInput = inputs[1]
  const tokenInput = inputs[2]
  const clearCheck = dialog.querySelectorAll("label").find((label) => label.textContent.includes(ZH_MCP["admin.mcp.clearSecret"])).querySelectorAll("input")[0]
  assert.equal(nameInput.value, "api", "名称回填")
  assert.equal(dialog.querySelector("select").value, "http", "传输回填")
  assert.equal(urlInput.value, "http://127.0.0.1:9/mcp", "非秘密寻址回填（`target`）")
  assert.equal(tokenInput.value, "", "秘密零回填（令牌恒空）")
  assert.equal(tokenInput.attrs.type, "password", "令牌 = password 输入")
  assert.ok(dialog.textContent.includes(ZH_MCP["admin.mcp.secretSaved"]), "零回填提示句在窗")
  assert.ok(dialog.textContent.includes(ZH_MCP["admin.mcp.clearSecret"]), "「清除」勾在窗")
  assert.equal(clearCheck.checked, false, "清除勾缺省不勾")

  // 窗内「测试」= 草稿探活（携 id；秘密留空 ⇒ 缺席 = 服务端回落库内行）
  await byText(dialog, ZH_MCP["admin.mcp.test"]).fire("click")
  const probeCall = world.state.calls.filter((call) => call.path === "/api/admin/mcp/probe").at(-1)
  assert.deepEqual(probeCall.body, { name: "api", transport: "http", url: "http://127.0.0.1:9/mcp", id: 2 }, "草稿探活体（id 在场 + 表单当前值；秘密缺席）")
  assert.ok(dialog.textContent.includes(filled("admin.mcp.probeOk", ZH_MCP, { toolCount: 7, latencyMs: 42 })), "探活成 ⇒ 窗内读数（✓ …——非错态）")

  // 窗内探活败 ⇒ 就地人话（错态结果行——AC-54 ⑤ 败支）
  const badWorld = makeWorld({ servers: [{ ...HTTP_ROW, enabled: true, hasSecrets: false }], probe: async () => ({ ok: false, error: "连接被拒" }) })
  const badMount = await render(badWorld)
  await rowOf(badMount, "api").querySelectorAll("button")[1].fire("click")
  const badDialog = badWorld.dom.body.querySelector("dialog")
  await byText(badDialog, ZH_MCP["admin.mcp.test"]).fire("click")
  const badNote = badDialog.querySelector(".hint.error")
  assert.ok(badNote, "窗内探活败 ⇒ 错态结果行")
  assert.equal(badNote.textContent, filled("admin.mcp.probeFail", ZH_MCP, { error: "连接被拒" }), "窗内探活败 = 就地人话（✗ {error}）")

  // 提交（未动秘密）⇒ PATCH 体不含秘密字段
  await byText(dialog, ZH_SHELL["common.save"]).fire("click")
  assert.deepEqual(world.state.calls.filter((call) => call.method === "PATCH").map((call) => call.body), [{ name: "api", transport: "http", url: "http://127.0.0.1:9/mcp", enabled: true }], "PATCH 体（秘密缺席 = 不变）")

  // 「清除」勾 ⇒ 显式 null 清空
  const world2 = makeWorld({ servers: [{ ...HTTP_ROW, enabled: true, hasSecrets: true }] })
  const mount2 = await render(world2)
  await rowOf(mount2, "api").querySelectorAll("button")[1].fire("click")
  const dialog2 = world2.dom.body.querySelector("dialog")
  const clear2 = dialog2.querySelectorAll("label").find((label) => label.textContent.includes(ZH_MCP["admin.mcp.clearSecret"])).querySelectorAll("input")[0]
  clear2.checked = true
  await clear2.fire("change")
  assert.equal(dialog2.querySelectorAll("input")[2].disabled, true, "清除勾 ⇒ 秘密输入随禁")
  await byText(dialog2, ZH_SHELL["common.save"]).fire("click")
  assert.deepEqual(world2.state.calls.filter((call) => call.method === "PATCH").map((call) => call.body), [{ name: "api", transport: "http", url: "http://127.0.0.1:9/mcp", enabled: true, token: null, headers: null, env: null }], "清除勾 ⇒ 显式 null 清空（凭据列整体）")
})

test("T4c 传输切换：字段组随换（stdio ⇒ http ⇒ ws）∥ 状态行复位（旧错行零残留）∥ ws 占位随档", async () => {
  const world = makeWorld({ servers: [] })
  const mount = await render(world)
  await byText(mount, ZH_MCP["admin.mcp.add"]).fire("click")
  const dialog = world.dom.body.querySelector("dialog")
  const select = dialog.querySelector("select")
  dialog.querySelectorAll("input")[0].value = "x"
  dialog.querySelectorAll("textarea")[1].value = "BADLINE" // env（stdio 组）
  await byText(dialog, ZH_SHELL["common.save"]).fire("click")
  assert.equal(dialog.querySelector(".hint.error").hidden, false, "stdio 组：KV 非法 ⇒ 错行在场")
  assert.equal(dialog.querySelectorAll("input").length, 3, "stdio 组：名称 ∥ 命令 ∥ 启用勾")
  select.value = "http"
  await select.fire("change")
  assert.equal(dialog.querySelector(".hint.error").hidden, true, "切组 ⇒ 状态行复位（旧错行零残留）")
  assert.equal(dialog.querySelectorAll("input").length, 4, "http 组：名称 ∥ 地址 ∥ 令牌 ∥ 启用勾")
  select.value = "ws"
  await select.fire("change")
  assert.equal(dialog.querySelectorAll("input")[1].attrs.placeholder, ZH_MCP["admin.mcp.wsUrlPh"], "ws ⇒ 地址占位随档（wsUrlPh）")
})

// ── T5 删除确认弹窗（§4 ③——非原生 confirm ∥ 后果句） ─────────────────────────────

test("T5 删除：确认弹窗（后果句）⇒ DELETE ⇒ flash + 关窗 + 刷新 ∥ 取消零请求", async () => {
  const world = makeWorld({ servers: [STDIO_ROW, HTTP_ROW] })
  const mount = await render(world)

  await rowOf(mount, "web").querySelectorAll("button")[2].fire("click")
  const dialog = world.dom.body.querySelector("dialog")
  assert.ok(dialog, "确认弹窗在场（非原生 confirm）")
  assert.equal(dialog.querySelector("h3").textContent, ZH_MCP["admin.mcp.deleteTitle"], "确认窗题")
  assert.ok(dialog.textContent.includes(filled("admin.mcp.deleteConfirm", ZH_MCP, { name: "web" })), "后果句逐值（含名——「该服务器的工具将不再对管理会话可用」）")
  await byText(dialog, ZH_SHELL["common.cancel"]).fire("click")
  assert.equal(world.dom.body.querySelector("dialog"), null, "取消 ⇒ 关窗")
  assert.equal(world.state.calls.some((call) => call.method === "DELETE"), false, "取消 ⇒ 零请求")

  await rowOf(mount, "web").querySelectorAll("button")[2].fire("click")
  const confirmDialog = world.dom.body.querySelector("dialog")
  await byText(confirmDialog, ZH_MCP["admin.mcp.deleteSubmit"]).fire("click")
  assert.deepEqual(world.state.calls.filter((call) => call.method === "DELETE").map((call) => call.path), ["/api/admin/mcp/1"], "删 = `DELETE /api/admin/mcp/:id`")
  assert.ok(world.state.flashes.includes(filled("admin.mcp.deleted", ZH_MCP, { name: "web" })), "成 ⇒ flash")
  assert.equal(world.dom.body.querySelector("dialog"), null, "成 ⇒ 关窗")
  assert.equal(rowOf(mount, "web"), null, "成 ⇒ 刷新（行退场；余行照常）")
  assert.ok(rowOf(mount, "api"), "余行在册（零误删）")
})

// ── T6 键面腿（§4 ⑧——两部件 ∥ shell/system 各 +1 ∥ 消费闭合） ─────────────────────

test("T6 键面：mcp 两部件同键集（40）∥ en 零 CJK ∥ 占位符对位 ∥ 0 悬空 ∥ shell/system 各 +1 ∥ 审计枚举 +1", () => {
  const zhKeys = Object.keys(ZH_MCP).sort()
  const enKeys = Object.keys(EN_MCP).sort()
  assert.equal(zhKeys.length, 40, `mcp 键数 = 40（实读 ${zhKeys.length}）`)
  assert.deepEqual(enKeys, zhKeys, "两表同键集（逐键在场）")
  assert.deepEqual(zhKeys.filter((key) => !key.startsWith("admin.mcp.")), [], "键族域界 = `admin.mcp.*`（逐键）")
  const placeholders = (text) => (String(text).match(/\{(\w+)\}/g) ?? []).sort()
  for (const key of zhKeys) {
    assert.deepEqual(placeholders(EN_MCP[key]), placeholders(ZH_MCP[key]), `占位符对位：${key}`)
    assert.equal(CJK.test(EN_MCP[key]), false, `en 零 CJK：${key}`)
    assert.equal(String(ZH_MCP[key]).trim() === "", false, `zh 非空：${key}`)
  }
  // 消费闭合（键字符串字面量 ⊆ 表键——含门面合体键；扫描面 = 页源全字面量中键形者——覆盖 t() ∥ field() ∥ 弹窗选项实参 ∥ 三元字面量）
  const used = new Set([...stripComments(PAGE_SRC).matchAll(/"([A-Za-z][A-Za-z0-9_.]*\.[A-Za-z0-9_.]+)"/g)].map((match) => match[1]).filter((key) => /^(admin\.mcp|common|nav|audit)\./.test(key)))
  for (const key of used) assert.ok(key in ZH_ALL && key in EN_ALL, `消费键在场：${key}`)
  assert.ok(used.size >= 43, `消费面广度（实读 ${used.size} 键——40 mcp 键 + 3 common 键）`)
  // shell +1（导航族）∥ system +1（审计型）
  assert.equal(ZH_SHELL["nav.page.admin.mcp"], "MCP 服务器", "shell zh 键在册")
  assert.equal(EN_SHELL["nav.page.admin.mcp"], "MCP servers", "shell en 键在册")
  assert.equal(CJK.test(EN_SHELL["nav.page.admin.mcp"]), false, "shell en 零 CJK")
  assert.equal(ZH_SYSTEM["audit.type.mcp_event"], "MCP 服务器", "system zh 键在册")
  assert.equal(CJK.test(EN_SYSTEM["audit.type.mcp_event"]), false, "system en 零 CJK")
  assert.equal(ZH_ALL["nav.page.admin.mcp"], ZH_SHELL["nav.page.admin.mcp"], "门面合体（shell）")
  assert.equal(ZH_ALL["audit.type.mcp_event"], ZH_SYSTEM["audit.type.mcp_event"], "门面合体（system）")
  // 审计渲染枚举 +1：mcp_event 在册 ∥ 型面包（下拉/表）消费
  assert.ok(AUDIT_SRC.includes('["mcp_event", "audit.type.mcp_event"]'), "`views-audit.mjs` 枚举增行")
  assert.equal(AUDIT_SRC.split("\n").length <= 500, true, "views-audit ≤500 软线")
})

// ── T7 接线腿（§4 ①——nav 管理 11 ∥ app 接线 ∥ 档目链随正） ───────────────────────

test("T7 接线：nav 管理 11（模型后）∥ 可达/denied ∥ app import+PAGES ∥ 非壳页五路径不动 ∥ 三新档在盘 ∥ 档目链随正", () => {
  const admin = NAV.NAV_GROUPS.find((group) => group.key === "admin")
  assert.equal(admin.items.length, 11, "管理组 11 项（AC-12）")
  assert.deepEqual(admin.items[6], { key: "mcp", labelKey: "nav.page.admin.mcp", path: "/admin/mcp" }, "「MCP 服务器」= 管理·模型后（第 7 位）")
  assert.deepEqual(NAV.resolveRoute("/admin/mcp", "admin"), { path: "/admin/mcp" }, "admin 面可达")
  assert.equal(NAV.resolveRoute("/admin/mcp", "user").denied, true, "非 admin ⇒ 页面级 denied（判权仍在服务端）")
  assert.equal(NAV.NAV_GROUPS.find((group) => group.key === "me").items.length, 7, "我的组零动（7）")

  assert.ok(APP_SRC.includes('import { renderMcp } from "./views-mcp.mjs"'), "app 导入面")
  assert.ok(APP_SRC.includes('"/admin/mcp": renderMcp'), "app PAGES 行")
  const shell = /const SHELL_PAGES = new Set\(\[([^\]]*)\]\)/.exec(APP_SRC)
  assert.deepEqual(shell[1].match(/"[^"]+"/g).map((item) => item.slice(1, -1)), ["/admin/members", "/admin/providers", "/admin/models", "/admin/audit", "/me/usage"], "非壳页五路径零动（MCP 页非壳）")

  const names = readdirSync(PUBLIC_DIR)
  for (const name of ["views-mcp.mjs", "i18n-zh-mcp.mjs", "i18n-en-mcp.mjs"]) assert.ok(names.includes(name), `新档在盘：${name}`)
  for (const name of ["views-mcp.mjs", "i18n-{zh,en}-mcp.mjs"]) assert.ok(WEBUI_SRC.includes(name), `档目链随正（单源 = webui/WEBUI.md §1）：${name}`)
})

// ── T8 静态腿（`node --check` ∥ ≤500 软线 ∥ 零 CJK 代码段 ∥ 类双向闭合 ∥ 零外链） ──

test("T8 静态腿：全改档 `node --check` 绿 ∥ ≤500 软线 ∥ 行宽 ≤300 ∥ 零 CJK 代码段 ∥ 零内嵌 HTML/外链 ∥ 类双向闭合", () => {
  for (const rel of TOUCHED) {
    const abs = join(ROOT, rel)
    const check = spawnSync(process.execPath, ["--check", abs], { encoding: "utf8" })
    assert.equal(check.status, 0, `${rel} node --check 失败：${check.stderr}`)
    const src = readFileSync(abs, "utf8")
    const lines = src.split("\n").length - (src.endsWith("\n") ? 1 : 0)
    assert.ok(lines <= 500, `${rel} 越 500 软线：${lines}`)
    assert.ok(Math.max(...src.split("\n").map((line) => line.length)) <= 300, `${rel} 行宽越 300`)
  }
  // 页件代码段零 CJK（文案全入两表）∥ 零内嵌 HTML 写口 ∥ 零外链
  assert.equal(CJK.test(stripComments(PAGE_SRC)), false, "views-mcp 代码段零 CJK")
  assert.equal((PAGE_SRC.match(/\.innerHTML\s*=/g) ?? []).length, 0, "零 `innerHTML` 写口")
  assert.deepEqual([/https?:\/\//.test(stripComments(PAGE_SRC)), PAGE_SRC.includes("@import")], [false, false], "零外链（KD-SV-9）")
  assert.equal(/from "\.\/views-me-chat/.test(PAGE_SRC) || PAGE_SRC.includes("/rc/"), false, "零他面取件（成员面/核件缝不涉）")
  // 类双向闭合（档面字面类 ⊆ 样式类）
  const cssClasses = new Set([...STYLE_SRC.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]))
  const used = new Set()
  for (const match of PAGE_SRC.matchAll(/\bclass(?:Name)?\s*[:=]\s*([^\n;]*?)(?=\s*\bclass(?:Name)?\s*[:=]|[;\n]|$)/g)) {
    const window = match[1].replace(/\$\{[^}]*\}/g, " ").split("//")[0].split("}")[0].split(/,\s*(?:[A-Za-z_$][\w$]*|"[^"]*"|'[^']*')\s*:/)[0]
    for (const literal of window.matchAll(/["'`]([^"'`]*)["'`]/g)) for (const token of literal[1].split(/\s+/)) if (token) used.add(token)
  }
  for (const token of used) assert.ok(cssClasses.has(token), `档面类无样式规则：${token}`)
  for (const token of ["toolbar", "card", "table-slot", "table-wrap", "detail-row", "provider-form", "stacked", "key-clear", "info-actions", "row-form", "hint", "error", "tiny", "danger"]) {
    assert.ok(used.has(token) && cssClasses.has(token), `本页类双向闭合：${token}`)
  }
  // 页内非秘密面行读（不读秘密字段——秘密只在窗内输入面进出）
  assert.equal(/row\.token|row\.headers|row\.env/.test(PAGE_SRC), false, "行面零秘密读（目标列 = `target`）")
  assert.ok(typeof PAGE.renderMcp === "function" && typeof PAGE.openMcpForm === "function" && typeof PAGE.openMcpRemove === "function", "导出面（页 + 两窗）")
})
