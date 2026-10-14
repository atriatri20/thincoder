/**
 * 2026-10-11-sandbox-volumes-ui.test.mjs — thincoder-server 批内单测件（控制台面·卷族——`sandbox-volumes` 批；
 * 判据源 = `webui/SANDBOX.md` §2.1① ∥ §2.2 ∥ §4；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-11-sandbox-volumes-ui.test.mjs`
 *
 * 射程（腿 ↔ 用例 = `sandbox/SANDBOX.md` §12）：
 *   ① N62/B65 卷区渲染（名 ∥ 创建时间 ∥ 删除）∥ 读败 ⇒ 行内人话 + 页内不反噬 ∥ 再展开重取可重试
 *   ② N62/E48 删除确认窗（后果句 ∥ 取消零调用 ∥ 成 ⇒ DELETE + flash + 卷表重取 ∥ 在用卷 400 就地在窗内呈——窗不关可重试）
 *   ③ N63/B63/B64 建容器卷选单（节点已有卷 + 「新建卷（手输）」∥ 选定回填 ∥ 读败/空表 ⇒ 手输照常 ∥ 空 = 不挂）
 *     + 容器动作后卷区随取（建容器成 ⇒ 卷表重取——首用即建清单随动）
 *   ④ i18n +7 键两表（zh 逐字 ∥ 占位符对位 ∥ en 零 CJK ∥ 键集双向相等）+ 复用 4 键在盘
 *   ⑤ 静态面（档目 43 ∥ 42（集合快照）∥ 行数/行宽 ∥ 零外链/零 CJK ∥ `t` 字面量闭合 ∥ 类名双向闭合 ∥ canon 不破
 *     （`:root` 38 ∥ 悬停盘面 8）∥ 装配接线（import 并合并行 ∥ 转出口 ∥ 卷区在容器区后 ∥ reset 接线）∥ 门禁链零悬空 + 本批件在链）
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

const [{ ZH }, { EN }, SANDBOX, CONTAINERS, VOLUMES] = await Promise.all([
  load("i18n-zh.mjs"), load("i18n-en.mjs"), load("views-sandbox.mjs"),
  load("views-sandbox-containers.mjs"), load("views-sandbox-volumes.mjs"),
])
const PKG = JSON.parse(readFileSync(join(ROOT, "thincoder-server", "package.json"), "utf8"))
const SOURCES = {
  "views-sandbox.mjs": readPublic("views-sandbox.mjs"),
  "views-sandbox-containers.mjs": readPublic("views-sandbox-containers.mjs"),
  "views-sandbox-volumes.mjs": readPublic("views-sandbox-volumes.mjs"),
}
const CSS = readPublic("style.css")
const BATCH_FILE = "docs/batches/2026-10-11-sandbox-volumes-ui.test.mjs"

/** 本批新增键（7——§2.2 键族登记；两表逐键同步）；复用 4 键（零新增——卷表列头 + 行钮）。 */
const NEW_KEYS = ["admin.sandbox.volumeFromNode", "admin.sandbox.volumeNew", "admin.sandbox.volumesTitle", "admin.sandbox.volumesEmpty",
  "admin.sandbox.volumeDeleteTitle", "admin.sandbox.volumeDeleteConfirm", "admin.sandbox.volumeDeleted"]
const REUSED_KEYS = ["admin.sandbox.name", "admin.sandbox.colCreated", "admin.sandbox.colActions", "admin.sandbox.remove"]
/** public/ 档集快照（本批 +1：`views-sandbox-volumes.mjs` ⇒ 43 ∥ 42——含并行批 chat-shell-align 新档 `views-chat-composer.mjs`；落笔当刻实读）。 */
const PUBLIC_SNAPSHOT = ["app.mjs", "dom.mjs", "favicon.png", "health.mjs", "i18n-en-admin.mjs", "i18n-en-core.mjs", "i18n-en-me.mjs", "i18n-en-project.mjs", "i18n-en-sandbox.mjs",
  "i18n-en-shell.mjs", "i18n-en-system.mjs", "i18n-en.mjs", "i18n-zh-admin.mjs", "i18n-zh-core.mjs", "i18n-zh-me.mjs", "i18n-zh-project.mjs", "i18n-zh-sandbox.mjs", "i18n-zh-shell.mjs",
  "i18n-zh-system.mjs", "i18n-zh.mjs", "i18n.mjs", "index.html", "modal.mjs", "model-specs-snapshot.mjs", "nav.mjs", "style.css", "tabs.mjs",
  "views-admin-projects.mjs", "views-admin.mjs", "views-audit.mjs", "views-auth.mjs", "views-chat-composer.mjs", "views-chat.mjs", "views-git-sources.mjs", "views-me.mjs", "views-models.mjs", "views-overview.mjs",
  "views-projects.mjs", "views-providers-modals.mjs", "views-providers.mjs", "views-sandbox-containers.mjs", "views-sandbox-image-sources.mjs",
  "views-sandbox-images.mjs", "views-sandbox-volumes.mjs", "views-sandbox.mjs", "views-system-config.mjs", "views-system.mjs", "views-usage.mjs"]

/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」「…」等中性标点不在内）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",")
const fill = (text, params) => String(text).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
/** 剥注释（字符串态感知——沿 `2026-10-06-server-i18n.test.mjs` 同法）。 */
function stripComments(src) {
  let out = ""
  let mode = "code"
  for (let i = 0; i < src.length; i += 1) {
    const ch = src[i]
    const next = src[i + 1]
    if (mode === "code") {
      if (ch === "/" && next === "/") { mode = "line"; i += 1; continue }
      if (ch === "/" && next === "*") { mode = "block"; i += 1; continue }
      if (ch === '"') mode = "dq"
      else if (ch === "'") mode = "sq"
      else if (ch === "`") mode = "tq"
      out += ch
    } else if (mode === "line") {
      if (ch === "\n") { mode = "code"; out += ch }
    } else if (mode === "block") {
      if (ch === "*" && next === "/") { mode = "code"; i += 1 }
    } else {
      out += ch // 字符串内原样保留（转义跳格）
      if (ch === "\\") { out += next ?? ""; i += 1 }
      else if ((mode === "dq" && ch === '"') || (mode === "sq" && ch === "'") || (mode === "tq" && ch === "`")) mode = "code"
    }
  }
  return out
}

// ── 桩 DOM（`modal.mjs` 壳面近形；`h` 同 app 语义近似）────────────────────────────

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
      const target = { preventDefault() {}, stopPropagation() {}, ...event }
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
const textOf = (node) => (typeof node === "string" ? node : [node?.textContent ?? "", ...(node?.children ?? []).map(textOf)].filter(Boolean).join(" "))
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))

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

const fRunner = (over = {}) => ({ id: 1, name: "box-a", address: "http://10.0.0.6:2375", status: "ok", online: true, version: "29.1.3", containers: { total: 0, running: 0 }, selfCheck: "ok", createdAt: 1700000000, ...over })
const fVolume = (over = {}) => ({ name: "vol-a", driver: "local", createdAt: "2026-10-11T05:00:00Z", ...over })
const fContainer = (over = {}) => ({ id: "c1", name: "box-one", image: "thincoder-sandbox:1", state: "created", status: "Created", ...over })
const postOk = () => ({ container: { id: "ctr-new", name: "box-v1", image: "thincoder-sandbox:1", state: "created" } })

/** 页面渲染夹具（运行面 + 容器区 + 卷区——整页装配 `renderSandbox`；标签①）。 */
async function fMount({ routes = {}, runners = [fRunner()], containers = [fContainer()], volumes = [fVolume()] } = {}) {
  globalThis.document = stubDocument()
  const { ctx, calls } = fCtx({
    "GET /api/admin/sandbox/overview": () => ({ status: "ok", runners }),
    "GET /api/admin/sandbox/onboarding": () => ({ runs: [] }),
    "GET /api/admin/sandbox/runners/1/containers": () => ({ containers }),
    "GET /api/admin/sandbox/runners/1/volumes": () => ({ volumes }),
    "GET /api/admin/sandbox/runners/1/images": () => ({ images: [] }),
    "GET /api/admin/sandbox/settings": () => ({ settings: { image: "thincoder-sandbox:1" } }),
    ...routes,
  })
  const mount = makeNode("section")
  await SANDBOX.renderSandbox(ctx, mount)
  await tick()
  return { ctx, calls, mount, modal: () => fFind(globalThis.document.body, (node) => node.tag === "dialog") }
}

/** 展开首节点（容器区 + 卷区——懒加载；两 tick 收两区落定）。 */
async function expand(mount) {
  await byText(mount, ZH["admin.sandbox.expand"]).fire("click")
  await tick()
  await tick()
}

const volumeBox = (mount) => byText(mount, ZH["admin.sandbox.volumesTitle"])?.parent ?? null
const volumeGets = (calls) => calls.filter(([method, path]) => method === "GET" && path === "/api/admin/sandbox/runners/1/volumes").length
const deleteCalls = (calls) => calls.filter(([method]) => method === "DELETE")

// ── ① 卷区渲染 ∥ B65 读败 ∥ 再展开重取 ────────────────────────────────────────

test("① N62 卷区渲染：数据卷表（名 ∥ 创建时间 ∥ 删除——容器区之后）∥ B65 读败 ⇒ 行内人话 + 页内不反噬 ∥ 再展开重取可重试", async () => {
  try {
    const { calls, mount } = await fMount({ volumes: [fVolume(), fVolume({ name: "vol-b", createdAt: "2026-10-10T05:00:00Z" })] })
    await expand(mount)
    assert.ok(volumeBox(mount) !== null, "卷区在册（h4 = 数据卷）")
    const rows = fFindAll(volumeBox(mount), (node) => node.tag === "tr")
    assert.deepEqual(rows[0].children.map((cell) => cell.textContent), [ZH["admin.sandbox.name"], ZH["admin.sandbox.colCreated"], ZH["admin.sandbox.colActions"]], "列头 = 名 ∥ 创建时间 ∥ 操作（复用键）")
    assert.deepEqual([byText(mount, "vol-a") !== null, byText(mount, "ts:2026-10-11T05:00:00Z") !== null, byText(mount, "vol-b") !== null], [true, true, true], "行逐值（名 ∥ 创建时间）")
    assert.equal(rows.length, 3, "表 = 列头 + 两行")
    assert.deepEqual(fFindAll(volumeBox(mount), (node) => node.tag === "button").map((button) => button.textContent), [ZH["admin.sandbox.remove"], ZH["admin.sandbox.remove"]], "行操作 = 删除（逐行）")
    assert.equal(calls.filter(([method, path]) => method === "GET" && path === "/api/admin/sandbox/runners/1/volumes").length, 1, "列表读一次（懒加载）")

    // B65：卷区读败（非 coded 错误 ⇒ mapError 透传原文）⇒ 行内人话 + 页内不反噬；再展开重取可重试
    let tries = 0
    const failing = await fMount({ routes: { "GET /api/admin/sandbox/runners/1/volumes": () => { tries += 1; if (tries === 1) throw new Error("节点不可达——测试样件"); return { volumes: [fVolume()] } } } })
    await expand(failing.mount)
    assert.ok(textOf(failing.mount).includes("节点不可达——测试样件"), "卷区行内人话（区级）")
    assert.ok(byText(failing.mount, "box-a") !== null, "页内不反噬：节点区仍在场")
    assert.ok(byText(failing.mount, ZH["admin.sandbox.createContainer"]) !== null, "页内不反噬：容器区仍在场")
    assert.deepEqual(failing.calls.filter(([tag]) => tag === "fail").length, 0, "区级失败不掀页（不落 ctx.fail）")
    await byText(failing.mount, ZH["admin.sandbox.collapse"]).fire("click")
    await tick()
    await expand(failing.mount)
    assert.equal(tries, 2, "再展开重取（可重试）")
    assert.ok(byText(failing.mount, "vol-a") !== null, "重试成 ⇒ 表在册")
  } finally { delete globalThis.document }
})

// ── ② 删除确认窗 ∥ 取消零调用 ∥ 在用卷 400 就地呈 ─────────────────────────────

test("② N62/E48 删除确认窗：后果句 ∥ 取消零调用 ∥ 成 ⇒ DELETE + flash + 卷表重取 ∥ 在用卷 400 就地在窗内呈（窗不关）", async () => {
  try {
    const { calls, mount, modal } = await fMount({ routes: { "DELETE /api/admin/sandbox/runners/1/volumes/vol-a": () => ({ ok: true, name: "vol-a" }) } })
    await expand(mount)
    await fFindAll(volumeBox(mount), (node) => node.tag === "button")[0].fire("click")
    const dialog = modal()
    assert.ok(dialog !== null, "确认窗在册（非原生 confirm）")
    assert.ok(textOf(dialog).includes(fill(ZH["admin.sandbox.volumeDeleteConfirm"], { name: "vol-a" })), "后果句逐值（卷内数据一并消失且不可恢复）")
    await byText(dialog, ZH["common.cancel"]).fire("click")
    await tick()
    assert.equal(deleteCalls(calls).length, 0, "取消 ⇒ 零调用（零审计面同源）")
    assert.equal(modal(), null, "取消 ⇒ 窗关（零副作用）")

    await fFindAll(volumeBox(mount), (node) => node.tag === "button")[0].fire("click")
    const dialog2 = modal()
    await byText(dialog2, ZH["admin.sandbox.remove"]).fire("click")
    await tick()
    assert.deepEqual(deleteCalls(calls).at(-1), ["DELETE", "/api/admin/sandbox/runners/1/volumes/vol-a", null], "删卷路径逐值（名在径）")
    assert.ok(calls.some(([tag, message]) => tag === "flash" && message === fill(ZH["admin.sandbox.volumeDeleted"], { name: "vol-a" })), "flash 逐值")
    await tick()
    assert.equal(deleteCalls(calls).length, 1, "恰一次 DELETE")
    assert.equal(calls.filter(([method, path]) => method === "GET" && path === "/api/admin/sandbox/runners/1/volumes").length, 2, "成 ⇒ 卷表重取（失缓存）")

    // E48：在用卷 ⇒ 服务端 400 就地在窗内呈——窗不关（可重试）
    const inUse = await fMount({ routes: {
      "DELETE /api/admin/sandbox/runners/1/volumes/vol-a": () => {
        throw Object.assign(new Error("卷正被容器使用——无法删除（引擎 409：remove vol-a: volume is in use - [4f8a9c2b7d1e]）——请先删除或改用该卷的容器，再试"), { code: "invalid_request_error", status: 400 })
      },
    } })
    await expand(inUse.mount)
    await fFindAll(volumeBox(inUse.mount), (node) => node.tag === "button")[0].fire("click")
    const inUseDialog = inUse.modal()
    await byText(inUseDialog, ZH["admin.sandbox.remove"]).fire("click")
    await tick()
    assert.ok(inUse.modal() !== null, "400 ⇒ 窗不关（可重试）")
    assert.ok(textOf(inUse.modal()).includes("卷正被容器使用——无法删除"), "就地在窗内呈（服务端人话）")
    assert.ok(textOf(inUse.modal()).includes("请先删除或改用该卷的容器"), "处置句在册")
    assert.equal(deleteCalls(inUse.calls).length, 1, "首次尝试已打（零删成）")
    await byText(inUse.modal(), ZH["admin.sandbox.remove"]).fire("click")
    await tick()
    assert.equal(deleteCalls(inUse.calls).length, 2, "同窗可重试（钮复位）")
  } finally { delete globalThis.document }
})

// ── ③ 建容器卷选单 ∥ 空 = 不挂 ∥ 容器动作后随取 ───────────────────────────────

test("③ N63/B63/B64 建容器卷选单：已有卷在单 ∥ 选定回填 ∥ 读败/空表 ⇒ 手输照常 ∥ 空 = 不挂 ∥ 建容器成 ⇒ 卷表随取", async () => {
  try {
    const { calls, mount, modal } = await fMount({ routes: { "POST /api/admin/sandbox/runners/1/containers": postOk } })
    await expand(mount)
    await byText(mount, ZH["admin.sandbox.createContainer"]).fire("click")
    await tick()
    const dialog = modal()
    const selects = fFindAll(dialog, (node) => node.tag === "select")
    assert.equal(selects.length, 2, "镜像选单 + 卷选单在册")
    const volumeSelect = selects[1]
    assert.deepEqual(fFindAll(volumeSelect, (node) => node.tag === "option").map((option) => option.value), ["", "vol-a"], "卷选单 = 「新建卷（手输）」+ 节点已有卷")
    const inputs = fFindAll(dialog, (node) => node.tag === "input")
    assert.equal(inputs.length, 4, "四输入（名 ∥ 镜像 ∥ 卷 ∥ 命令——轻通道笔 10）")
    assert.equal(inputs[3].value, "sleep infinity", "命令预填 = 待命命令（默认可覆写）")
    volumeSelect.value = "vol-a"
    await volumeSelect.fire("change")
    assert.equal(inputs[2].value, "vol-a", "选定 ⇒ 回填下方卷名（可再改）")
    inputs[0].value = "box-v1"
    const getsBefore = volumeGets(calls)
    await fFind(dialog, (node) => node.tag === "form").fire("submit")
    await tick()
    await tick()
    assert.deepEqual(calls.filter(([method, path]) => method === "POST" && path === "/api/admin/sandbox/runners/1/containers").at(-1),
      ["POST", "/api/admin/sandbox/runners/1/containers", { name: "box-v1", image: "thincoder-sandbox:1", volume: "vol-a", command: "sleep infinity" }], "选定腿：提交体 = 选值 + 命令预填（`Binds` 形零改）")
    assert.equal(volumeGets(calls), getsBefore + 1, "容器动作后卷区随取（建容器成 ⇒ 卷表重取——首用即建清单随动）")

    // B64：留空 ⇒ 不挂（省略键——现行为零回归）
    await byText(mount, ZH["admin.sandbox.createContainer"]).fire("click")
    await tick()
    const dialog2 = modal()
    const inputs2 = fFindAll(dialog2, (node) => node.tag === "input")
    inputs2[0].value = "box-v2"
    await fFind(dialog2, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.deepEqual(calls.filter(([method, path]) => method === "POST" && path === "/api/admin/sandbox/runners/1/containers").at(-1),
      ["POST", "/api/admin/sandbox/runners/1/containers", { name: "box-v2", image: "thincoder-sandbox:1", command: "sleep infinity" }], "卷空 ⇒ 省略键（不挂）∥ 命令恒携（笔 10 预填）")

    // 笔 10：清空命令 ⇒ 就地拦（人话 + 不发 POST）
    await byText(mount, ZH["admin.sandbox.createContainer"]).fire("click")
    await tick()
    const dialog2b = modal()
    const inputs2b = fFindAll(dialog2b, (node) => node.tag === "input")
    inputs2b[0].value = "box-v2b"
    inputs2b[3].value = "   "
    const postsBefore = calls.filter(([method, path]) => method === "POST" && path === "/api/admin/sandbox/runners/1/containers").length
    await fFind(dialog2b, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.ok(textOf(dialog2b).includes(fill(ZH["admin.sandbox.fieldRequired"], { field: ZH["admin.sandbox.command"] })), "命令清空 ⇒ 就地人话（必填门）")
    assert.equal(calls.filter(([method, path]) => method === "POST" && path === "/api/admin/sandbox/runners/1/containers").length, postsBefore, "命令清空 ⇒ 不发 POST")

    // B63：卷清单读败 ⇒ 选单只余「新建卷（手输）」；手输照常（提交不受阻——不反噬）
    const manual = await fMount({ routes: { "GET /api/admin/sandbox/runners/1/volumes": () => { throw new Error("节点不可达——测试样件") }, "POST /api/admin/sandbox/runners/1/containers": postOk } })
    await expand(manual.mount)
    await byText(manual.mount, ZH["admin.sandbox.createContainer"]).fire("click")
    await tick()
    const dialog3 = manual.modal()
    const volumeSelect3 = fFindAll(dialog3, (node) => node.tag === "select")[1]
    assert.deepEqual(fFindAll(volumeSelect3, (node) => node.tag === "option").map((option) => option.value), [""], "读败 ⇒ 选单只余逃逸项")
    const inputs3 = fFindAll(dialog3, (node) => node.tag === "input")
    inputs3[0].value = "box-v3"
    inputs3[2].value = "brand-new"
    await fFind(dialog3, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.deepEqual(manual.calls.filter(([method, path]) => method === "POST" && path === "/api/admin/sandbox/runners/1/containers").at(-1),
      ["POST", "/api/admin/sandbox/runners/1/containers", { name: "box-v3", image: "thincoder-sandbox:1", volume: "brand-new", command: "sleep infinity" }], "手输照常（读取败不反噬）")

    // B63：卷清单空表（读成而空）⇒ 选单亦只余「新建卷（手输）」；卷区空态在册
    const empty = await fMount({ volumes: [] })
    await expand(empty.mount)
    assert.ok(textOf(volumeBox(empty.mount)).includes(ZH["admin.sandbox.volumesEmpty"]), "卷区空态在册（volumesEmpty）")
    await byText(empty.mount, ZH["admin.sandbox.createContainer"]).fire("click")
    await tick()
    const volumeSelect4 = fFindAll(empty.modal(), (node) => node.tag === "select")[1]
    assert.deepEqual(fFindAll(volumeSelect4, (node) => node.tag === "option").map((option) => option.value), [""], "空表 ⇒ 选单只余逃逸项")
  } finally { delete globalThis.document }
})

// ── ④ i18n +7 键两表 + 复用 4 键 ──────────────────────────────────────────────

test("④ i18n：本批 7 键两表逐键在场 ∥ zh 逐字 ∥ 占位符对位 ∥ en 零 CJK ∥ 键集双向相等 ∥ 复用 4 键在盘", () => {
  const ZH_VALUES = {
    "admin.sandbox.volumeFromNode": "节点已有卷（选 ⇒ 回填下方，可再改）",
    "admin.sandbox.volumeNew": "新建卷（手输）",
    "admin.sandbox.volumesTitle": "数据卷",
    "admin.sandbox.volumesEmpty": "暂无数据卷",
    "admin.sandbox.volumeDeleteTitle": "删除数据卷",
    "admin.sandbox.volumeDeleteConfirm": "删除数据卷「{name}」？卷内数据会一并消失，且不可恢复。",
    "admin.sandbox.volumeDeleted": "已删除数据卷：{name}",
  }
  for (const key of NEW_KEYS) {
    assert.equal(ZH[key], ZH_VALUES[key], `zh 值逐字：${key}`)
    assert.ok(typeof EN[key] === "string" && EN[key].trim() !== "", `en 表缺键：${key}`)
    assert.equal(placeholders(ZH[key]), placeholders(EN[key]), `占位符不对位：${key}`)
    assert.equal(CJK.test(EN[key]), false, `en 值含 CJK：${key}`)
  }
  assert.equal(NEW_KEYS.length, 7, "本批键数（7——选单 label/逃逸项/区题/空态/删窗两枚/flash）")
  for (const key of REUSED_KEYS) {
    assert.ok(typeof ZH[key] === "string" && typeof EN[key] === "string", `复用键在盘（零新增）：${key}`)
  }
  const SELF_NAMES = new Set(["lang.zh", "lang.en"])
  const base = (table) => new Set(Object.keys(table).filter((key) => !SELF_NAMES.has(key)).map((key) => key.replace(/\.one$/, "")))
  assert.deepEqual([...base(ZH)].filter((key) => !base(EN).has(key)), [], "仅 zh 键（自称名族除外）")
  assert.deepEqual([...base(EN)].filter((key) => !base(ZH).has(key)), [], "仅 en 键")
})

// ── ⑤ 静态面（档目 ∥ 行数/行宽 ∥ canon ∥ 接线 ∥ 门禁链）───────────────────────

test("⑤ 静态面：档目 43 ∥ 42（集合快照）∥ 行数/行宽 ∥ 零外链/零 CJK ∥ `t` 字面量闭合 ∥ 类名双向闭合 ∥ canon 不破 ∥ 接线 ∥ 链", () => {
  const names = readdirSync(PUBLIC_DIR).sort()
  assert.deepEqual(names, [...PUBLIC_SNAPSHOT].sort(), "public/ 文件集合 = 快照（本批 +1：`views-sandbox-volumes.mjs`——含并行批 chat-shell-align 新档）")
  assert.deepEqual([names.length, names.filter((name) => name !== "favicon.png").length], [48, 47], "档目 48 ∥ 47（test 口径——实读；2026-10-12 team-projects-permissions 批后）")
  const cssClasses = new Set([...CSS.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]))
  for (const [name, source] of Object.entries(SOURCES)) {
    const lines = source.split("\n").length
    assert.ok(lines <= 500, `${name} 越 500 硬限：${lines}`)
    assert.ok(Math.max(...source.split("\n").map((line) => line.length)) <= 300, `${name} 行宽 ≤300`)
    assert.deepEqual([/https?:\/\//.test(source), source.includes("@import")], [false, false], `${name} 零外链（KD-SV-9）`)
    assert.equal(CJK.test(stripComments(source)), false, `${name} 代码段零 CJK（文案全入两表）`)
    for (const match of stripComments(source).matchAll(/\bt\(\s*"([^"]+)"\s*[,)]/g)) {
      assert.ok(match[1] in ZH && match[1] in EN, `${name} t 字面量悬空：${match[1]}`)
    }
    const used = new Set()
    for (const match of source.matchAll(/\bclass(?:Name)?\s*[:=]\s*([^\n;]*?)(?=\s*\bclass(?:Name)?\s*[:=]|[;\n]|$)/g)) {
      const window = match[1].replace(/\$\{[^}]*\}/g, " ").split("//")[0].split("}")[0].split(/,\s*[A-Za-z_$][\w$]*\s*:/)[0]
      for (const literal of window.matchAll(/["'`]([^"'`]*)["'`]/g)) for (const token of literal[1].split(/\s+/)) if (token) used.add(token)
    }
    for (const token of used) assert.ok(cssClasses.has(token), `${name} 档面类无样式规则：${token}`)
  }
  // canon（本批零 CSS 触面——`style.css` 不在本批文件面）：绝对计数归触 CSS 的批（tabs/chat 同期在改），此件只守「不缩」
  const cssClean = stripComments(CSS)
  assert.ok([...cssClean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].length >= 38, ":root ≥ 38（不缩——本批零 CSS 触面）")
  assert.ok([...cssClean.matchAll(/:hover/g)].length >= 7, "悬停 ≥ 7（不缩——本批零 CSS 触面）")
  // 装配接线（行预算 ≤500 的取件形）：import 并入既有行 ∥ 卷区件工厂转出口 ∥ 卷区在容器区之后 ∥ reset 两处接线
  assert.ok(SOURCES["views-sandbox.mjs"].includes('import { createContainerSection, createVolumeSection } from "./views-sandbox-containers.mjs"'), "import 并入既有 import 行（净增 ≤+1）")
  assert.ok(SOURCES["views-sandbox-containers.mjs"].includes('export { createVolumeSection } from "./views-sandbox-volumes.mjs"'), "卷区件工厂转出口（页装配单点取件）")
  assert.ok(/containerArea\(runner\), volumes\.area\(runner/.test(SOURCES["views-sandbox.mjs"]), "卷区装配 = 容器区之后")
  assert.ok(SOURCES["views-sandbox.mjs"].includes("volumes.reset(runner)"), "容器动作后随取接线（重置卷区缓存）")
  assert.ok(SOURCES["views-sandbox-containers.mjs"].includes('field(h, "admin.sandbox.volumeFromNode", volumeSelect)'), "建容器卷字段 = 选单（回填保底）")
  assert.equal(typeof VOLUMES.createVolumeSection, "function", "卷区件导出面")
  assert.equal(typeof CONTAINERS.createVolumeSection, "function", "转出口取件面")
  // 端点面：卷区件只用卷族两径（零新端点）
  const endpoints = [...SOURCES["views-sandbox-volumes.mjs"].matchAll(/\/api\/[^"`\s]*/g)].map((match) => match[0].split("${")[0])
  assert.deepEqual([...new Set(endpoints)], ["/api/admin/sandbox/runners/"], "卷区件端点面 = 卷族径（零新端点）")
  assert.equal(SOURCES["views-sandbox-volumes.mjs"].includes("volumes/${encodeURIComponent(volume.name)}"), true, "删卷径（名在径）")
  // 门禁链：本批两件在链 ∥ 存量链目标零悬空
  const chain = PKG.scripts.prepublishOnly.match(/docs\/batches\/[^\s"]+/g) ?? []
  for (const file of ["docs/batches/2026-10-11-sandbox-volumes.test.mjs", BATCH_FILE]) assert.ok(chain.includes(file), `本批件在链：${file}`)
  for (const rel of chain) assert.ok(existsSync(join(ROOT, rel)), `链目标在盘：${rel}`)
})
