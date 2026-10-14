/**
 * 2026-10-13-sandbox-exec-rebuild-tls-ui.test.mjs — thincoder-server 批内单测件（控制台面·连接方式 TLS 档——
 * sandbox-exec-rebuild 批 · 增补 #2 · **前端舱**；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 判据源 = `webui/SANDBOX.md` §2.1①（「连接方式编辑」块 + 添加节点弹窗连接段）∥ §4 连接面 TLS 档行 ∥ §3 件账
 * （`views-sandbox-connection.mjs`）∥ `sandbox/SANDBOX.md` §3 连接方式块（:324-333）∥ `sandbox/EXECUTION.md` §13（N73 ∥ B76）∥
 * `gateway/API.md` §2.5（POST …/runners 体扩 ∥ PUT …/runners/:id/connection）∥ 批档 §2。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-sandbox-exec-rebuild-tls-ui.test.mjs`
 *
 * 射程（腿 ↔ 验收对照）：
 *   ① 连接段：`connectionSchemeOf` 两态（地址 scheme 单源）∥ 二择两态（明文 ⇒ 三件区隐 ∥ TLS ⇒ 显）
 *   ② 添加窗连接段（B76）：缺省档 ⇒ 体零 `connection`/`tls` 键（零行为变化）∥ TLS 档 ⇒ 体携三件逐值 ∥ 缺件 ⇒ 窗内必填人话 + 零请求
 *   ③ 行「连接」钮 + 读数（N73 入口）：行钮序（展开 ∥ SSH 凭据 ∥ 连接 ∥ 删除）∥ 地址列 http/https 徽标逐值
 *   ④ 连接方式编辑窗（N73）：当刻态回显（scheme 派生）∥ 态标（已设（时间）/未设）∥ 提交 ⇒ PUT 全列覆写体逐值 ∥
 *      自检中态 ⇒ 败 ⇒ 窗内就地人话 + 库零变（零 flash ∥ 零重取）∥ 零回填（三件恒空）
 *   ⑤ 切回明文：当刻 TLS ⇒ 提交 ⇒ 二次确认（材料将清零，不可恢复）⇒ 确认 ⇒ PUT `{ connection: "plain" }` ∥ 取消 ⇒ 零请求
 *   ⑥ i18n：+17 键两表逐字 ∥ 占位符一致 ∥ en 零 CJK ∥ 消费在册 ∥ 键数 269
 *   ⑦ 静态面：新档 ≤500 行 ∥ 零色字面量 ∥ 零新 `:root` 变量
 *
 * 桩说明：整页装配 `renderSandbox`（桩 ctx + 假 API 路由表 + `history` 桩）；DOM 桩 = `h` 语义近似。
 * 零网络零真浏览器（真机收口 = 父侧收口轮）。
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
const linesOf = (name) => { const text = readPublic(name); return text.split("\n").length - (text.endsWith("\n") ? 1 : 0) }
const load = (name) => import(pathToFileURL(join(PUBLIC_DIR, name)).href)

// ── 桩 DOM（`h` 语义近似：受控属性 ∥ on* 事件 ∥ 子节点）─────────────────────────────

function makeNode(tag) {
  const classes = new Set()
  return {
    tag, children: [], listeners: {}, attrs: {}, parent: null,
    open: false, textContent: "", className: "", value: "", hidden: false, disabled: false, checked: false,
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
    append(...items) {
      for (const item of items.flat(Infinity)) {
        if (item === null || item === undefined || item === false) continue
        if (typeof item === "object") item.parent = this
        this.children.push(item)
      }
    },
    replaceChildren(...items) { this.children = []; this.append(...items) },
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

const stubDocument = () => ({ body: makeNode("body"), createElement: (tag) => makeNode(tag), getElementById: () => null })

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
  if (root !== null && typeof root === "object") {
    if (pred(root)) out.push(root)
    for (const child of root.children ?? []) fFindAll(child, pred, out)
  }
  return out
}
const fFind = (root, pred) => fFindAll(root, pred)[0] ?? null
const byText = (root, text) => fFind(root, (node) => node.textContent === text)
const textOf = (node) => (node === null ? "" : (node.children ?? []).reduce((acc, child) => acc + (typeof child === "object" && child !== null ? textOf(child) : String(child)), node.textContent ?? ""))
const buttonsOf = (root) => fFindAll(root, (node) => node.tag === "button")
const rowFor = (root, name) => fFindAll(root, (node) => node.tag === "tr").find((row) => fFind(row, (cell) => cell.tag === "td" && cell.textContent === name)) ?? null
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const fill = (text, params) => String(text).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",")
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/

/** 桩 ctx（api 路由表 `"METHOD path"` ⇒ handler；全调用入 `calls`）。 */
function fCtx(routes = {}) {
  const calls = []
  const ctx = {
    h: fH,
    state: {},
    api: async (path, { method = "GET", body } = {}) => {
      calls.push([method, path, body ?? null])
      const handler = routes[`${method} ${path}`]
      if (handler === undefined) throw new Error(`unexpected ${method} ${path}`)
      return handler(body)
    },
    fmtTs: (ts) => `ts:${ts}`,
    fmtValue: (value) => (value === null || value === undefined ? "—" : String(value)),
    flash: (message) => calls.push(["flash", message]),
    fail: (error) => calls.push(["fail", String(error?.message ?? error)]),
  }
  return { ctx, calls }
}

const callsOf = (calls, method, path) => calls.filter(([m, p]) => m === method && p === path).length
const flashOf = (calls) => calls.filter(([tag]) => tag === "flash").map(([, message]) => message)
const upstreamFail = (message) => () => { throw Object.assign(new Error(message), { code: "upstream_error", status: 502 }) }
const deferred = () => { let resolve; const promise = new Promise((res) => { resolve = res }); return { promise, resolve } }

const fRunner = (over = {}) => ({ id: 1, name: "box-a", address: "http://10.0.0.6:2375", status: "ok", online: true, version: "29.1.3", containers: { total: 0, running: 0 }, ...over })

/** 沙盒页夹具（整页装配 `renderSandbox`——`history` 桩收 replaceState）。 */
async function fMount({ routes = {}, runners = [fRunner()] } = {}) {
  globalThis.document = stubDocument()
  const { ctx, calls } = fCtx({
    "GET /api/admin/sandbox/overview": () => ({ status: "ok", runners }),
    "GET /api/admin/sandbox/onboarding": () => ({ runs: [] }),
    ...routes,
  })
  globalThis.history = { replaceState: () => {} }
  const mount = makeNode("section")
  await SANDBOX.renderSandbox(ctx, mount)
  await tick()
  return { ctx, calls, mount, modal: () => fFind(globalThis.document.body, (node) => node.tag === "dialog") }
}
const closePage = () => { delete globalThis.document; delete globalThis.history }

const TLS = { ca: "-----BEGIN CERTIFICATE-----\nCA", cert: "-----BEGIN CERTIFICATE-----\nCERT", key: "-----BEGIN PRIVATE KEY-----\nKEY" }

const CONN = await load("views-sandbox-connection.mjs")
const SANDBOX = await load("views-sandbox.mjs")
const { ZH_SANDBOX } = await load("i18n-zh-sandbox.mjs")
const { EN_SANDBOX } = await load("i18n-en-sandbox.mjs")
const { ZH } = await load("i18n-zh.mjs")
const SOURCE = readPublic("views-sandbox-connection.mjs")
const PAGE = readPublic("views-sandbox.mjs")
const CSS = readPublic("style.css")

// ── ① 连接段（scheme 纯函数 ∥ 二择两态）──────────────────────────────────────────

test("① 连接段：`connectionSchemeOf` 两态（地址 scheme 单源）∥ 二择两态（明文 ⇒ 三件区隐 ∥ TLS ⇒ 显）", async () => {
  assert.equal(CONN.connectionSchemeOf("http://10.0.0.6:2375"), "http", "明文地址 ⇒ http")
  assert.equal(CONN.connectionSchemeOf("https://10.0.0.6:2376"), "https", "TLS 地址 ⇒ https")
  assert.equal(CONN.connectionSchemeOf("10.0.0.6:2375"), "http", "裸 host ⇒ 明文兜底（未携档）")
  assert.equal(CONN.connectionSchemeOf(null), "http", "空值 ⇒ 明文兜底")
  const ctx = fCtx().ctx
  const section = CONN.createConnectionSection(ctx)
  const radios = fFindAll(section.node, (node) => node.tag === "input" && node.attrs.type === "radio")
  assert.deepEqual(radios.map((radio) => radio.value), ["plain", "tls"], "二择两项（明文 ∥ TLS）")
  assert.equal(radios[0].checked, true, "缺省档 = 明文（零行为变化）")
  assert.equal(textOf(section.node).includes(ZH_SANDBOX["admin.sandbox.connPlain"]), true, "明文项文案在册")
  assert.equal(textOf(section.node).includes(ZH_SANDBOX["admin.sandbox.connTls"]), true, "TLS 项文案在册")
  const box = fFindAll(section.node, (node) => node.tag === "div" && node.className === "stack-box" && node !== section.node).find((node) => fFind(node, (item) => item.tag === "textarea") !== null)
  assert.equal(box.hidden, true, "明文档 ⇒ 三件区隐（零噪声）")
  await radios[1].fire("change")
  assert.equal(section.kind(), "tls", "选 TLS ⇒ 档 = tls")
  assert.equal(box.hidden, false, "TLS 档 ⇒ 三件区显")
  assert.deepEqual(section.materials(), { ca: "", cert: "", key: "" }, "三件恒空（零回填）")
  assert.equal(section.missingKey(), "admin.sandbox.connCa", "缺件判据 = 首个空缺字段标题键")
  await radios[0].fire("change")
  assert.equal(section.kind(), "plain", "切回明文 ⇒ 档 = plain")
  assert.equal(box.hidden, true, "明文档 ⇒ 三件区复隐")
})

// ── ② 添加窗连接段（B76 零行为变化 ∥ N73 携三件 ∥ 缺件门）──────────────────────────

test("② 添加窗连接段：缺省档 ⇒ 体零 `connection`/`tls` 键（零行为变化）∥ TLS 档 ⇒ 体携三件逐值 ∥ 缺件 ⇒ 窗内必填人话 + 零请求", async () => {
  const POSTS = { "POST /api/admin/sandbox/runners": (body) => ({ runner: fRunner({ name: body.name, address: body.address }) }) }
  const mount = await fMount({ routes: POSTS })
  await byText(mount.mount, ZH_SANDBOX["admin.sandbox.addRunner"]).fire("click")
  let dialog = mount.modal()
  const form = fFind(dialog, (node) => node.tag === "form")
  const [nameInput, addressInput] = fFindAll(dialog, (node) => node.tag === "input" && node.attrs.type === undefined)
  nameInput.value = "box-b"
  addressInput.value = "http://10.0.0.9:2375"
  await form.fire("submit")
  assert.deepEqual(mount.calls.find(([m]) => m === "POST"), ["POST", "/api/admin/sandbox/runners", { name: "box-b", address: "http://10.0.0.9:2375" }], "缺省档 ⇒ 体零 `connection`/`tls` 键（B76 零行为变化）")
  assert.deepEqual(flashOf(mount.calls), [fill(ZH_SANDBOX["admin.sandbox.added"], { name: "box-b" })], "成 ⇒ 关窗 + 成功句")
  // TLS 档：缺件 ⇒ 窗内必填人话 + 零请求
  await byText(mount.mount, ZH_SANDBOX["admin.sandbox.addRunner"]).fire("click")
  dialog = mount.modal()
  const [name2, address2] = fFindAll(dialog, (node) => node.tag === "input" && node.attrs.type === undefined)
  name2.value = "box-c"
  address2.value = "10.0.0.9"
  const tlsRadio = fFindAll(dialog, (node) => node.tag === "input" && node.value === "tls")[0]
  await tlsRadio.fire("change")
  await fFind(dialog, (node) => node.tag === "form").fire("submit")
  assert.equal(callsOf(mount.calls, "POST", "/api/admin/sandbox/runners"), 1, "缺件 ⇒ 零新请求")
  assert.ok(textOf(dialog).includes(fill(ZH_SANDBOX["admin.sandbox.fieldRequired"], { field: ZH_SANDBOX["admin.sandbox.connCa"] })), "缺件 ⇒ 窗内必填人话（首个空缺字段）")
  const [caBox, certBox, keyBox] = fFindAll(dialog, (node) => node.tag === "textarea")
  assert.deepEqual(fFindAll(dialog, (node) => node.tag === "textarea").map((node) => node.attrs.placeholder), [ZH_SANDBOX["admin.sandbox.connMaterialPh"], ZH_SANDBOX["admin.sandbox.connMaterialPh"], ZH_SANDBOX["admin.sandbox.connMaterialPh"]], "三件占位（多行输入——零回填）")
  caBox.value = TLS.ca
  certBox.value = TLS.cert
  keyBox.value = TLS.key
  await fFind(dialog, (node) => node.tag === "form").fire("submit")
  const post = mount.calls.filter(([m]) => m === "POST").pop()
  assert.deepEqual(post, ["POST", "/api/admin/sandbox/runners", { name: "box-c", address: "10.0.0.9", connection: "tls", tls: { ...TLS } }], "TLS 档 ⇒ 体携 `connection`/`tls` 三件逐值")
})

// ── ③ 行「连接」钮 + 读数（N73 入口）────────────────────────────────────────────

test("③ 行「连接」钮 + 读数：行钮序（展开 ∥ SSH 凭据 ∥ 连接 ∥ 删除）∥ 地址列 http/https 徽标逐值", async () => {
  const runners = [fRunner(), fRunner({ id: 2, name: "box-b", address: "https://10.0.0.7:2376" })]
  const mount = await fMount({ runners })
  const rowA = rowFor(mount.mount, "box-a")
  assert.deepEqual(buttonsOf(rowA).map((button) => button.textContent), [
    ZH_SANDBOX["admin.sandbox.expand"], ZH_SANDBOX["admin.sandbox.hostCredBtn"], ZH_SANDBOX["admin.sandbox.connBtn"], ZH_SANDBOX["admin.sandbox.remove"],
  ], "四钮序（连接 = 与 SSH 凭据并列、删除仍末位）")
  const badges = fFindAll(rowA, (node) => String(node.className).includes("badge"))
  assert.deepEqual(badges.map((badge) => badge.textContent), ["http", ZH_SANDBOX["admin.sandbox.online"]], "读数 = 地址 scheme 派生（http 徽标 + 在线态）")
  const rowB = rowFor(mount.mount, "box-b")
  assert.equal(fFindAll(rowB, (node) => String(node.className).includes("badge"))[0].textContent, "https", "https 地址 ⇒ https 徽标")
  closePage()
})

// ── ④ 连接方式编辑窗（N73：态回显 ∥ PUT 全列覆写 ∥ 败 ⇒ 库零变）─────────────────────

test("④ 编辑窗：当刻态回显 ∥ 态标（已设（时间）/未设）∥ 提交 ⇒ PUT 全列覆写体逐值 ∥ 自检中态 ⇒ 败 ⇒ 窗内人话 + 库零变", async () => {
  const pending = deferred()
  const mount = await fMount({
    routes: { "PUT /api/admin/sandbox/runners/2/connection": () => pending.promise },
    runners: [fRunner({ id: 2, name: "box-b", address: "https://10.0.0.7:2376", tls: { state: "sealed", updatedAt: "2026-10-13T10:00:00.000Z" } })],
  })
  await byText(rowFor(mount.mount, "box-b"), ZH_SANDBOX["admin.sandbox.connBtn"]).fire("click")
  const dialog = mount.modal()
  assert.equal(fFind(dialog, (node) => node.tag === "h3").textContent, ZH_SANDBOX["admin.sandbox.connTitle"], "窗题 = 连接方式")
  assert.ok(textOf(dialog).includes(fill(ZH_SANDBOX["admin.sandbox.hostCredTarget"], { name: "box-b" })), "目标行 = 主机：{name}")
  const radios = fFindAll(dialog, (node) => node.tag === "input" && node.attrs.type === "radio")
  assert.deepEqual(radios.map((radio) => radio.checked), [false, true], "当刻态回显：https 地址 ⇒ TLS 选中")
  assert.ok(textOf(dialog).includes(fill(ZH_SANDBOX["admin.sandbox.connStateSet"], { time: "ts:2026-10-13T10:00:00.000Z" })), "密文只回「已设（时间）」（零回显）")
  assert.deepEqual(fFindAll(dialog, (node) => node.tag === "textarea").map((node) => node.value), ["", "", ""], "三件零回填（恒空）")
  const [caBox, certBox, keyBox] = fFindAll(dialog, (node) => node.tag === "textarea")
  caBox.value = TLS.ca
  certBox.value = TLS.cert
  keyBox.value = TLS.key
  const inflight = fFind(dialog, (node) => node.tag === "form").fire("submit") // 不 await——在飞期立即观察
  assert.equal(callsOf(mount.calls, "PUT", "/api/admin/sandbox/runners/2/connection"), 1, "提交 ⇒ 恰一发 PUT")
  assert.ok(textOf(dialog).includes(ZH_SANDBOX["admin.sandbox.connChecking"]), "自检中态（服务端先自检后落库）")
  pending.resolve({ runner: fRunner({ id: 2, address: "https://10.0.0.7:2376" }) })
  await inflight
  await tick()
  assert.deepEqual(mount.calls.find(([m]) => m === "PUT"), ["PUT", "/api/admin/sandbox/runners/2/connection", { connection: "tls", tls: { ...TLS } }], "PUT 体 = 全列覆写（TLS 档三件逐值）")
  assert.deepEqual(flashOf(mount.calls), [fill(ZH_SANDBOX["admin.sandbox.connSaved"], { name: "box-b" })], "成 ⇒ 关窗 + 成功句")
  assert.equal(callsOf(mount.calls, "GET", "/api/admin/sandbox/overview"), 2, "成 ⇒ 重取（界面上新）")
  // 未设态（`tls.state = none`）+ 明文当刻 + 败径（窗内人话 ∥ 库零变）
  const bad = await fMount({
    routes: { "PUT /api/admin/sandbox/runners/1/connection": upstreamFail("自检失败：TLS 握手被拒（档与地址相抵）") },
  })
  await byText(rowFor(bad.mount, "box-a"), ZH_SANDBOX["admin.sandbox.connBtn"]).fire("click")
  const badDialog = bad.modal()
  assert.deepEqual(fFindAll(badDialog, (node) => node.tag === "input" && node.attrs.type === "radio").map((radio) => radio.checked), [true, false], "http 地址 ⇒ 明文选中")
  assert.equal(textOf(badDialog).includes(ZH_SANDBOX["admin.sandbox.connStateUnset"]), true, "未设态标在册")
  await fFind(badDialog, (node) => node.tag === "form").fire("submit")
  const putBefore = callsOf(bad.calls, "PUT", "/api/admin/sandbox/runners/1/connection")
  assert.equal(putBefore, 1, "明文当刻 ⇒ 直接提交（零确认）")
  assert.ok(textOf(badDialog).includes("自检失败：TLS 握手被拒（档与地址相抵）"), "败 ⇒ 窗内就地人话（服务端原文）")
  assert.equal(bad.modal() !== null, true, "败 ⇒ 窗不关（草稿不丢）")
  assert.equal(flashOf(bad.calls).length, 0, "败 ⇒ 零成功句（库零变）")
  assert.equal(callsOf(bad.calls, "GET", "/api/admin/sandbox/overview"), 1, "败 ⇒ 零重取")
  closePage()
})

// ── ⑤ 切回明文（二次确认 ∥ 确认 ⇒ 原子调用 ∥ 取消 ⇒ 零请求）────────────────────────

test("⑤ 切回明文：当刻 TLS ⇒ 提交 ⇒ 二次确认（材料将清零，不可恢复）∥ 确认 ⇒ PUT `{ connection: \"plain\" }` ∥ 取消 ⇒ 零请求", async () => {
  const mount = await fMount({
    routes: { "PUT /api/admin/sandbox/runners/2/connection": () => ({ runner: fRunner({ id: 2, address: "http://10.0.0.7:2375" }) }) },
    runners: [fRunner({ id: 2, name: "box-b", address: "https://10.0.0.7:2376", tls: { state: "sealed", updatedAt: "2026-10-13T10:00:00.000Z" } })],
  })
  await byText(rowFor(mount.mount, "box-b"), ZH_SANDBOX["admin.sandbox.connBtn"]).fire("click")
  let dialog = mount.modal()
  await fFindAll(dialog, (node) => node.tag === "input" && node.value === "plain")[0].fire("change")
  await fFind(dialog, (node) => node.tag === "form").fire("submit")
  dialog = mount.modal()
  assert.equal(callsOf(mount.calls, "PUT", "/api/admin/sandbox/runners/2/connection"), 0, "切回明文 ⇒ 先确认（零直发）")
  assert.equal(fFind(dialog, (node) => node.tag === "h3").textContent, ZH_SANDBOX["admin.sandbox.connConvertTitle"], "确认窗题 = 切回明文")
  assert.ok(textOf(dialog).includes(ZH_SANDBOX["admin.sandbox.connConvertConfirm"]), "后果句「材料将清零，不可恢复」")
  await byText(dialog, ZH["common.cancel"]).fire("click")
  assert.equal(callsOf(mount.calls, "PUT", "/api/admin/sandbox/runners/2/connection"), 0, "取消 ⇒ 零请求（材料零触）")
  // 确认径：`{ connection: "plain" }`（服务端原子清零材料 + 地址回 http）
  await byText(rowFor(mount.mount, "box-b"), ZH_SANDBOX["admin.sandbox.connBtn"]).fire("click")
  dialog = mount.modal()
  await fFindAll(dialog, (node) => node.tag === "input" && node.value === "plain")[0].fire("change")
  await fFind(dialog, (node) => node.tag === "form").fire("submit")
  dialog = mount.modal()
  await fFind(dialog, (node) => node.tag === "button" && String(node.className).includes("danger")).fire("click")
  assert.deepEqual(mount.calls.find(([m]) => m === "PUT"), ["PUT", "/api/admin/sandbox/runners/2/connection", { connection: "plain" }], "确认 ⇒ PUT 体 = `{ connection: \"plain\" }`（关 TLS 原子）")
  assert.deepEqual(flashOf(mount.calls), [fill(ZH_SANDBOX["admin.sandbox.connSaved"], { name: "box-b" })], "成 ⇒ 成功句")
  closePage()
})

// ── ⑥ i18n（+17 键两表逐字 ∥ 消费在册 ∥ 键数 269）───────────────────────────────

test("⑥ i18n：+17 键两表逐字 ∥ 占位符一致 ∥ en 零 CJK ∥ 消费在册 ∥ 键数 269", () => {
  const ZH_WANT = {
    "admin.sandbox.connBtn": "连接",
    "admin.sandbox.connTitle": "连接方式",
    "admin.sandbox.connKind": "连接方式",
    "admin.sandbox.connPlain": "明文（缺省——安全组控制）",
    "admin.sandbox.connTls": "TLS 客户端证书",
    "admin.sandbox.connCa": "CA 证书",
    "admin.sandbox.connCert": "客户端证书",
    "admin.sandbox.connKey": "客户端私钥",
    "admin.sandbox.connMaterialPh": "粘贴 PEM 文本（只进不出——提交后不可回看）",
    "admin.sandbox.connStateSet": "已设（{time}）",
    "admin.sandbox.connStateUnset": "未设",
    "admin.sandbox.connNote": "三件只进不出：不回显、不回填——换材料 = 重新提交三件。",
    "admin.sandbox.connSave": "保存连接方式",
    "admin.sandbox.connChecking": "正在自检……",
    "admin.sandbox.connSaved": "连接方式已保存：{name}",
    "admin.sandbox.connConvertTitle": "切回明文",
    "admin.sandbox.connConvertConfirm": "切回明文？TLS 材料将清零，不可恢复。",
  }
  const EN_WANT = {
    "admin.sandbox.connBtn": "Connection",
    "admin.sandbox.connTitle": "Connection",
    "admin.sandbox.connKind": "Connection method",
    "admin.sandbox.connPlain": "Plain (default — security-group controlled)",
    "admin.sandbox.connTls": "TLS client certificate",
    "admin.sandbox.connCa": "CA certificate",
    "admin.sandbox.connCert": "Client certificate",
    "admin.sandbox.connKey": "Client private key",
    "admin.sandbox.connMaterialPh": "Paste PEM text (write-only — cannot be viewed again)",
    "admin.sandbox.connStateSet": "Set ({time})",
    "admin.sandbox.connStateUnset": "Not set",
    "admin.sandbox.connNote": "The three items are write-only: never echoed, never pre-filled — replacing them means submitting all three again.",
    "admin.sandbox.connSave": "Save connection",
    "admin.sandbox.connChecking": "Running the self-check…",
    "admin.sandbox.connSaved": "Connection saved: {name}",
    "admin.sandbox.connConvertTitle": "Switch back to plain",
    "admin.sandbox.connConvertConfirm": "Switch back to plain? The TLS material is cleared and cannot be recovered.",
  }
  assert.equal(Object.keys(ZH_WANT).length, 17, "连接族键数 = 17")
  for (const [key, text] of Object.entries(ZH_WANT)) assert.equal(ZH_SANDBOX[key], text, `zh 逐字：${key}`)
  for (const [key, text] of Object.entries(EN_WANT)) {
    assert.equal(EN_SANDBOX[key], text, `en 逐字：${key}`)
    assert.equal(CJK.test(text), false, `en 零 CJK：${key}`)
    assert.equal(placeholders(EN_SANDBOX[key]), placeholders(ZH_SANDBOX[key]), `占位符两表一致：${key}`)
  }
  for (const key of Object.keys(ZH_WANT)) {
    if (key === "admin.sandbox.connBtn") assert.equal(PAGE.includes(key), true, `消费在册（views-sandbox.mjs——行钮）：${key}`)
    else assert.equal(SOURCE.includes(key), true, `消费在册（views-sandbox-connection.mjs）：${key}`)
  }
  assert.deepEqual(Object.keys(ZH_SANDBOX).sort(), Object.keys(EN_SANDBOX).sort(), "两表键集相等（逐键同步）")
  assert.equal(Object.keys(ZH_SANDBOX).length, 269, "zh 沙盒部件键数 269（220 + 32 底座/凭据 + 17 连接族）")
  assert.equal(Object.keys(EN_SANDBOX).length, 269, "en 沙盒部件键数 269")
})

// ── ⑦ 静态面（行数 ∥ 零色字面量 ∥ 零新变量）──────────────────────────────────────

test("⑦ 静态面：新档 ≤500 行 ∥ 零色字面量（变量驱动）∥ 零新 `:root` 变量 ∥ 页装配挂载在册", () => {
  assert.ok(linesOf("views-sandbox-connection.mjs") <= 500, `views-sandbox-connection.mjs 越 500 软线：${linesOf("views-sandbox-connection.mjs")}`)
  assert.equal(/#[0-9a-fA-F]{3,8}\b/.test(SOURCE) || /rgba?\(/.test(SOURCE), false, "零色字面量（徽标取既有 `.badge` 类——零新样式）")
  const clean = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
  const rootVars = [...clean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1])
  assert.equal(rootVars.length, 76, ":root 变量计数 = 实施当刻实读 76（本批零 CSS 触面）")
  assert.equal(PAGE.includes("openConnectionModal"), true, "页装配挂载：行「连接」动作 ⇒ 编辑窗在册")
  assert.equal(PAGE.includes("createConnectionSection"), true, "页装配挂载：添加窗连接段在册")
})
