/**
 * 2026-10-11-sandbox-image-sources-ui.test.mjs — thincoder-server 批内单测件（控制台面·沙盒页镜像源卡 + 列表过滤——`sandbox-image-sources` 批；
 * 判据源 = `webui/WEBUI.md` §2.8① ∥ §2.2 ∥ §5 行数预算 ∥ §6 AC-19/AC-20 面；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-11-sandbox-image-sources-ui.test.mjs`
 *
 * 射程（腿 ↔ 设计轴对照在括号）：
 *   ① 源卡（表四列逐值 ∥ 面型派生文案 ∥ 操作三钮 ∥ 添加源钮）+ 增/改弹窗（预选六条 ⇒ 选中回填名+址（可再改）∥ 提交体 ∥ flash ∥ 重取）
 *   ② 删除确认（后果句（只删清单行，不动镜像）∥ 非原生 confirm ∥ danger 钮 ⇒ DELETE ⇒ flash ⇒ 重取）
 *   ③ 目录浏览窗（v2：仓库列表 ⇒ 点行取标签 ∥ 两处过滤输入 ∥ truncated 提示 ∥ 空态 ∥ Hub：目录 unsupported 人话呈 + 按镜像名查标签）
 *   ∥ 五分类读绪一键文案（窗内就地呈——不关窗）
 *   ④ 本地镜像表过滤（名/标签匹配 ∥ 无匹配空态 ∥ 零新端点）+ i18n 两表（本批 34 键逐键在场 ∥ 占位符对位 ∥ en 零 CJK ∥ 基键集双向相等）
 *   ⑤ 静态面（档目 43 ∥ 42 ∥ 新档在册 ∥ 行数/行宽 ∥ 零外链/零 CJK ∥ `t` 字面量闭合 ∥ 类名双向闭合 ∥ canon 不破 ∥ 门禁链完整）
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

const [{ ZH }, { EN }, SANDBOX, SOURCE_VIEW] = await Promise.all([
  load("i18n-zh.mjs"), load("i18n-en.mjs"), load("views-sandbox.mjs"), load("views-sandbox-image-sources.mjs"),
])
const PKG = JSON.parse(readFileSync(join(ROOT, "thincoder-server", "package.json"), "utf8"))
const SOURCES = {
  "views-sandbox.mjs": readPublic("views-sandbox.mjs"),
  "views-sandbox-image-sources.mjs": readPublic("views-sandbox-image-sources.mjs"),
  "views-sandbox-images.mjs": readPublic("views-sandbox-images.mjs"),
}
const CSS = readPublic("style.css")

/** 本批新增键（34——§2.2 键族登记；两表逐键同步）。 */
const NEW_KEYS = [
  "admin.sandbox.sourcesTitle", "admin.sandbox.sourceAdd", "admin.sandbox.sourcePreset", "admin.sandbox.sourcePresetPh",
  "admin.sandbox.sourceKind", "admin.sandbox.sourceKindHub", "admin.sandbox.sourceKindV2", "admin.sandbox.sourceEdit",
  "admin.sandbox.sourceCatalogBtn", "admin.sandbox.sourcesEmpty", "admin.sandbox.sourceAdded", "admin.sandbox.sourceUpdated",
  "admin.sandbox.sourceDeleted", "admin.sandbox.sourceDeleteTitle", "admin.sandbox.sourceDeleteConfirm", "admin.sandbox.catalogTitle",
  "admin.sandbox.catalogReposTitle", "admin.sandbox.catalogTagsTitle", "admin.sandbox.catalogFilterPh", "admin.sandbox.catalogReposEmpty",
  "admin.sandbox.catalogTagsEmpty", "admin.sandbox.catalogNoMatch", "admin.sandbox.catalogTruncated", "admin.sandbox.catalogTagHint",
  "admin.sandbox.catalogHubName", "admin.sandbox.catalogNamePh", "admin.sandbox.catalogRead", "admin.sandbox.readKindTimeout",
  "admin.sandbox.readKindUnreachable", "admin.sandbox.readKindAuthRequired", "admin.sandbox.readKindUnsupported", "admin.sandbox.readKindBadResponse",
  "admin.sandbox.imageFilterPh", "admin.sandbox.imagesNoMatch",
]
/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」「…」等中性标点不在内）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",")
const fill = (text, params) => String(text).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/([^:])\/\/.*$/gm, "$1")

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
const fImage = (over = {}) => ({ id: "sha256:aaa", tags: ["thincoder-sandbox:1"], size: 123456, created: 1700000000, ...over })
const fSource = (over = {}) => ({ id: 1, name: "Docker Hub", address: "https://docker.io", kind: "hub", createdAt: "2026-10-11T00:00:00.000Z", ...over })
const fPresets = () => ([
  { name: "Docker Hub", address: "https://docker.io" },
  { name: "GitHub Container Registry", address: "https://ghcr.io" },
  { name: "Quay", address: "https://quay.io" },
  { name: "阿里云 ACR", address: "https://registry.cn-hangzhou.aliyuncs.com" },
  { name: "华为云 SWR", address: "https://swr.cn-north-4.myhuaweicloud.com" },
  { name: "Docker Hub 镜像（DaoCloud）", address: "https://docker.m.daocloud.io" },
])
const upstreamFail = (message) => () => { throw Object.assign(new Error(message), { code: "upstream_error", status: 502 }) }
const invalidFail = (message) => () => { throw Object.assign(new Error(message), { code: "invalid_request_error", status: 400 }) }

/** 页面渲染夹具（运行面 + 镜像源卡两读）。 */
async function fMount({ routes = {}, runners = [fRunner()], images = [fImage()], sources = [fSource()], presets = fPresets() } = {}) {
  globalThis.document = stubDocument()
  globalThis.history = { replaceState: () => {} } // 标签②切换回写地址栏（console-tabs-component 批——桩面补）
  const { ctx, calls } = fCtx({
    "GET /api/admin/sandbox/overview": () => ({ status: "ok", runners }),
    "GET /api/admin/sandbox/onboarding": () => ({ runs: [] }),
    "GET /api/admin/sandbox/runners/1/containers": () => ({ containers: [] }),
    "GET /api/admin/sandbox/runners/1/images": () => ({ images }),
    "GET /api/admin/sandbox/image-sources": () => ({ sources }),
    "GET /api/admin/sandbox/image-sources/presets": () => ({ presets }),
    "POST /api/admin/sandbox/image-sources": () => ({ source: fSource() }),
    "PATCH /api/admin/sandbox/image-sources/1": () => ({ source: fSource() }),
    "DELETE /api/admin/sandbox/image-sources/1": () => ({ ok: true }),
    ...routes,
  })
  const mount = makeNode("section")
  await SANDBOX.renderSandbox(ctx, mount)
  await tick()
  await byText(mount, ZH["admin.sandbox.tabImages"]).fire("click") // 标签②（镜像源卡 + 镜像表——console-tabs-component 批后两区迁②，懒建）
  await tick()
  return { ctx, calls, mount, modal: () => fFind(globalThis.document.body, (node) => node.tag === "dialog") }
}

/** 卡件直装（导出面直测——不缠整页）。 */
async function fSection({ routes = {}, sources = [fSource()], presets = fPresets() } = {}) {
  globalThis.document = stubDocument()
  globalThis.history = { replaceState: () => {} } // 标签②切换回写地址栏（console-tabs-component 批——桩面补）
  const { ctx, calls } = fCtx({
    "GET /api/admin/sandbox/image-sources": () => ({ sources }),
    "GET /api/admin/sandbox/image-sources/presets": () => ({ presets }),
    ...routes,
  })
  const card = SOURCE_VIEW.createImageSourceSection(ctx)
  const host = makeNode("section")
  host.append(card.card)
  await tick()
  return { ctx, calls, host, modal: () => fFind(globalThis.document.body, (node) => node.tag === "dialog") }
}

/** 源表（按表头定位——不赖下标）。 */
const sourceTable = (root) => fFindAll(root, (node) => node.tag === "table").find((table) => fFindAll(table, (cell) => cell.tag === "th").map((cell) => cell.textContent).includes(ZH["admin.sandbox.sourceKind"])) ?? null
const headersOf = (table) => fFindAll(table, (node) => node.tag === "th").map((cell) => cell.textContent)
const rowsOf = (table) => fFindAll(table, (node) => node.tag === "tr").filter((row) => fFind(row, (cell) => cell.tag === "td") !== null)
const filterInputs = (root) => fFindAll(root, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.sandbox.catalogFilterPh"])
/** 过滤列表块（父节点直接携 `div.filter-row`——列容器不算）。 */
const listNodes = (root) => fFindAll(root, (node) => node.tag === "div" && node.className === "stack-box" && (node.children ?? []).some((child) => child.tag === "div" && child.className === "filter-row"))
const listRows = (box) => fFindAll(box, (node) => node.tag === "tr")
/** 镜像表按表头现取（重渲染后引用会失效——逐次现取；详表头全等——节点表内嵌容器/镜像两表）。 */
const imageTableNow = (root) => fFindAll(root, (node) => node.tag === "table").find((table) => headersOf(table).join("|") === [ZH["admin.sandbox.image"], ZH["admin.sandbox.colSize"], ZH["admin.sandbox.colCreated"], ZH["admin.sandbox.colActions"]].join("|")) ?? null
/** 按行文取行（点行入口 = `tr`——非其 `td`）。 */
const rowByText = (root, text) => fFindAll(root, (node) => node.tag === "tr" && textOf(node) === text)[0] ?? null
const firstCellText = (row) => textOf(fFind(row, (cell) => cell.tag === "td"))

// ── ① 源卡 + 增/改弹窗（§2.8①）──────────────────────────────────────────────

test("① 源卡：表四列逐值 ∥ 面型文案派生 ∥ 操作三钮 ∥ 添加源钮 + 增/改弹窗（预选回填 + 提交体 + flash + 重取）", async () => {
  try {
    const sources = [fSource({ id: 1, name: "Docker Hub", address: "https://docker.io", kind: "hub" }), fSource({ id: 2, name: "自建", address: "https://ghcr.io", kind: "v2" })]
    const { calls, mount, modal } = await fMount({ sources })
    assert.ok(textOf(mount).includes(ZH["admin.sandbox.sourcesTitle"]), "源卡在册（沙盒页挂载）")
    const table = sourceTable(mount)
    assert.deepEqual(headersOf(table), [ZH["admin.sandbox.name"], ZH["admin.sandbox.address"], ZH["admin.sandbox.sourceKind"], ZH["admin.sandbox.colActions"]], "源表四列")
    const rows = rowsOf(table)
    assert.equal(rows.length, 2, "两源两行")
    assert.deepEqual(fFindAll(rows[0], (node) => node.tag === "td").map((cell) => cell.textContent), ["Docker Hub", "https://docker.io", ZH["admin.sandbox.sourceKindHub"], ""], "行逐值（Hub 面）")
    assert.deepEqual(fFindAll(rows[1], (node) => node.tag === "td").map((cell) => cell.textContent), ["自建", "https://ghcr.io", ZH["admin.sandbox.sourceKindV2"], ""], "行逐值（标准 v2）")
    assert.deepEqual(fFindAll(table, (node) => node.tag === "button").map((node) => node.textContent), [
      ZH["admin.sandbox.sourceCatalogBtn"], ZH["admin.sandbox.sourceEdit"], ZH["admin.sandbox.remove"],
      ZH["admin.sandbox.sourceCatalogBtn"], ZH["admin.sandbox.sourceEdit"], ZH["admin.sandbox.remove"],
    ], "每行三钮（目录/改/删）")
    assert.equal(fFindAll(mount, (node) => node.tag === "button" && node.textContent === ZH["admin.sandbox.sourceAdd"]).length, 1, "添加源钮")

    // 增窗：预选六条 ⇒ 选中回填名 + 址（可再改）；提交 ⇒ POST 两键 + flash + 重取
    await byText(mount, ZH["admin.sandbox.sourceAdd"]).fire("click")
    const addDialog = modal()
    assert.ok(addDialog !== null, "增窗开启")
    await tick()
    const select = fFind(addDialog, (node) => node.tag === "select")
    const options = fFindAll(select, (node) => node.tag === "option")
    assert.deepEqual(options.map((option) => option.value), ["", ...fPresets().map((preset) => preset.address)], "预选六条（+ 占位项）")
    assert.deepEqual(options.slice(1).map((option) => option.textContent), fPresets().map((preset) => preset.name), "预选项名逐值")
    const inputs = fFindAll(addDialog, (node) => node.tag === "input")
    assert.deepEqual(inputs.map((input) => input.attrs.placeholder), [ZH["admin.sandbox.namePh"], ZH["admin.sandbox.sourceAddressPh"]], "名/址两输入")
    select.value = "https://quay.io"
    await select.fire("change")
    assert.deepEqual([inputs[0].value, inputs[1].value], ["Quay", "https://quay.io"], "选中 ⇒ 回填名 + 址（可再改）")
    inputs[0].value = "我的 Quay" // 回填后可再改
    const form = fFind(addDialog, (node) => node.tag === "form")
    await form.fire("submit")
    await tick()
    assert.deepEqual(calls.find(([method]) => method === "POST"), ["POST", "/api/admin/sandbox/image-sources", { name: "我的 Quay", address: "https://quay.io" }], "提交体两键")
    assert.ok(calls.some(([tag, message]) => tag === "flash" && message === fill(ZH["admin.sandbox.sourceAdded"], { name: "我的 Quay" })), "增源 flash")
    assert.equal(calls.filter(([method, path]) => method === "GET" && path === "/api/admin/sandbox/image-sources").length, 2, "成 ⇒ 重取（卡装配一次 + 动作后一次）")
    assert.equal(modal(), null, "成功 ⇒ 关窗")

    // 改窗：预填现值 ⇒ PATCH 两键
    await byText(table, ZH["admin.sandbox.sourceEdit"]).fire("click")
    const editDialog = modal()
    const editInputs = fFindAll(editDialog, (node) => node.tag === "input")
    assert.deepEqual([editInputs[0].value, editInputs[1].value], ["Docker Hub", "https://docker.io"], "改窗预填现值")
    editInputs[1].value = "https://hub.docker.com"
    await fFind(editDialog, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.deepEqual(calls.find(([method]) => method === "PUT" || method === "PATCH"), ["PATCH", "/api/admin/sandbox/image-sources/1", { name: "Docker Hub", address: "https://hub.docker.com" }], "改源体两键")
    assert.ok(calls.some(([tag, message]) => tag === "flash" && message === fill(ZH["admin.sandbox.sourceUpdated"], { name: "Docker Hub" })), "改源 flash")

    // 必填门（空名/空址 ⇒ 不提交 + 人话）
    await byText(mount, ZH["admin.sandbox.sourceAdd"]).fire("click")
    const gateDialog = modal()
    const gateInputs = fFindAll(gateDialog, (node) => node.tag === "input")
    gateInputs[1].value = "https://ghcr.io"
    await fFind(gateDialog, (node) => node.tag === "form").fire("submit")
    assert.ok(textOf(gateDialog).includes(fill(ZH["admin.sandbox.fieldRequired"], { field: ZH["admin.sandbox.name"] })), "空名 ⇒ 必填门人话")
    assert.equal(calls.filter(([method]) => method === "POST").length, 1, "必填门 ⇒ 不提交")
    // 400（形）⇒ 窗内就地人话 + 草稿不丢
    gateInputs[0].value = "撞名源"
    const denied = await fMount({ routes: { "POST /api/admin/sandbox/image-sources": invalidFail("源名已存在：撞名源") } })
    await byText(denied.mount, ZH["admin.sandbox.sourceAdd"]).fire("click")
    const deniedDialog = denied.modal()
    const deniedInputs = fFindAll(deniedDialog, (node) => node.tag === "input")
    deniedInputs[0].value = "撞名源"
    deniedInputs[1].value = "https://quay.io"
    await fFind(deniedDialog, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.ok(textOf(deniedDialog).includes(fill(ZH["err.invalid_request_error"], { detail: "源名已存在：撞名源" })), "400 ⇒ 窗内就地人话")
    assert.deepEqual([deniedInputs[0].value, deniedInputs[1].value], ["撞名源", "https://quay.io"], "草稿不丢")
    assert.equal(denied.modal(), deniedDialog, "失败 ⇒ 不关窗")
  } finally { delete globalThis.document }
})

// ── ② 删除确认（§2.8①）─────────────────────────────────────────────────────

test("② 删除确认：后果句（只删清单行，不动镜像）∥ 非原生 confirm ∥ danger 钮 ⇒ DELETE ⇒ flash ⇒ 重取", async () => {
  try {
    const { calls, mount, modal } = await fMount({ sources: [fSource({ name: "自建", address: "https://ghcr.io", kind: "v2" })] })
    const table = sourceTable(mount)
    await byText(table, ZH["admin.sandbox.remove"]).fire("click")
    const dialog = modal()
    assert.ok(dialog !== null, "确认窗开启")
    assert.ok(textOf(dialog).includes(fill(ZH["admin.sandbox.sourceDeleteConfirm"], { name: "自建" })), "后果句携源名（只删清单行，不动镜像）")
    assert.ok(textOf(dialog).includes(ZH["admin.sandbox.sourceDeleteTitle"]), "窗题")
    const dangerBtn = fFind(dialog, (node) => node.tag === "button" && node.className === "danger")
    await dangerBtn.fire("click")
    await tick()
    assert.deepEqual(calls.find(([method]) => method === "DELETE"), ["DELETE", "/api/admin/sandbox/image-sources/1", null], "删除路径")
    assert.ok(calls.some(([tag, message]) => tag === "flash" && message === fill(ZH["admin.sandbox.sourceDeleted"], { name: "自建" })), "删除 flash")
    assert.equal(calls.filter(([method, path]) => method === "GET" && path === "/api/admin/sandbox/image-sources").length, 2, "成 ⇒ 重取")
    assert.equal(modal(), null, "成功 ⇒ 关窗")
    // 空表 ⇒ 空态句
    const empty = await fMount({ sources: [] })
    assert.ok(textOf(empty.mount).includes(ZH["admin.sandbox.sourcesEmpty"]), "空清单 ⇒ 空态句")
    assert.ok(textOf(empty.mount).includes(ZH["admin.sandbox.sourceAdd"]), "空清单仍可添加")
  } finally { delete globalThis.document }
})

// ── ③ 目录浏览窗（v2 ∥ Hub）+ 五分类读绪（§2.8①）────────────────────────────

test("③ 目录浏览窗：v2（仓库 ⇒ 点行取标签 ∥ 两处过滤 ∥ truncated ∥ 空态）∥ Hub（目录 unsupported 人话呈 + 按名查标签）", async () => {
  try {
    const routes = {
      "GET /api/admin/sandbox/image-sources/2/catalog": () => ({ ok: true, kind: "v2", repositories: ["library/nginx", "library/redis", "foo/bar"], truncated: true, ms: 12 }),
      "GET /api/admin/sandbox/image-sources/2/tags?name=library%2Fnginx": () => ({ ok: true, kind: "v2", tags: ["1.25", "latest"], truncated: false, ms: 8 }),
    }
    const { calls, mount, modal } = await fMount({ sources: [fSource({ id: 2, name: "自建", address: "https://ghcr.io", kind: "v2" })], routes })
    await byText(sourceTable(mount), ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
    const dialog = modal()
    assert.ok(dialog !== null, "浏览窗开启")
    await tick()
    assert.ok(textOf(dialog).includes(fill(ZH["admin.sandbox.catalogTitle"], { name: "自建" })), "窗题携源名")
    assert.deepEqual(calls.filter(([, path]) => path.endsWith("/catalog")).map(([, path]) => path), ["/api/admin/sandbox/image-sources/2/catalog"], "目录读一次（n 缺省——不携参）")
    const lists = listNodes(dialog)
    assert.equal(lists.length, 2, "两列（仓库 ∥ 标签）各一枚过滤列表")
    assert.equal(fFindAll(dialog, (node) => node.tag === "h4").map((node) => node.textContent).join("|"), [ZH["admin.sandbox.catalogReposTitle"], ZH["admin.sandbox.catalogTagsTitle"]].join("|"), "两列小标题")
    const repoRows = rowsOf(lists[0])
    assert.deepEqual(repoRows.map((row) => textOf(row)), ["library/nginx 拉取", "library/redis 拉取", "foo/bar 拉取"], "仓库逐行（含行尾拉取钮——一键拉取批随正）")
    assert.equal(byText(lists[0], ZH["admin.sandbox.catalogTruncated"]).hidden, false, "truncated 提示在场")
    assert.ok(textOf(lists[1]).includes(ZH["admin.sandbox.catalogTagHint"]), "标签列待命句（未选仓库）")
    // 过滤（仓库列——纯前端）
    const [repoFilter, tagFilter] = filterInputs(dialog)
    repoFilter.value = "nginx"
    await repoFilter.fire("input")
    assert.deepEqual(rowsOf(lists[0]).map((row) => textOf(row)), ["library/nginx 拉取"], "仓库过滤（纯前端）")
    assert.equal(calls.filter(([, path]) => path.endsWith("/catalog")).length, 1, "过滤零新端点")
    repoFilter.value = "zzz"
    await repoFilter.fire("input")
    assert.ok(textOf(lists[0]).includes(ZH["admin.sandbox.catalogNoMatch"]), "无匹配 ⇒ 空态句")
    repoFilter.value = ""
    await repoFilter.fire("input")
    // 点行取标签
    await rowByText(lists[0], "library/nginx 拉取").fire("click")
    await tick()
    assert.deepEqual(calls.find(([method, path]) => method === "GET" && path.includes("/tags")), ["GET", "/api/admin/sandbox/image-sources/2/tags?name=library%2Fnginx", null], "点行 ⇒ 标签读（名转义）")
    assert.deepEqual(rowsOf(lists[1]).map((row) => textOf(row)), ["1.25 拉取", "latest 拉取"], "标签逐行")
    assert.equal(byText(lists[1], ZH["admin.sandbox.catalogTruncated"]).hidden, true, "无下一页 ⇒ 提示隐藏")
    tagFilter.value = "1."
    await tagFilter.fire("input")
    assert.deepEqual(rowsOf(lists[1]).map((row) => textOf(row)), ["1.25 拉取"], "标签过滤")
    // 键盘同径（Enter）
    tagFilter.value = ""
    await tagFilter.fire("input")
    await rowByText(lists[0], "foo/bar 拉取").fire("keydown", { key: "Enter" })
    await tick()
    assert.deepEqual(calls.filter(([, path]) => path.includes("/tags")).at(-1), ["GET", "/api/admin/sandbox/image-sources/2/tags?name=foo%2Fbar", null], "键盘同径（行可聚焦）")

    // 空目录 ⇒ 空态句（非错误）
    const emptyTry = await fMount({ routes: { "GET /api/admin/sandbox/image-sources/2/catalog": () => ({ ok: true, kind: "v2", repositories: [], truncated: false, ms: 3 }) }, sources: [fSource({ id: 2, kind: "v2" })] })
    await byText(sourceTable(emptyTry.mount), ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
    await tick()
    assert.ok(textOf(emptyTry.modal()).includes(ZH["admin.sandbox.catalogReposEmpty"]), "空目录 ⇒ 空态句（如实——非错误）")

    // Hub 面：目录 unsupported 人话呈 + 按镜像名查标签（单输入）
    const hubRoutes = {
      "GET /api/admin/sandbox/image-sources/1/catalog": () => ({ ok: false, error: { kind: "unsupported", message: "Hub 无全站目录 API（官方关闭）——改用「按镜像名查标签」（Hub 面）" }, ms: 0 }),
      "GET /api/admin/sandbox/image-sources/1/tags?name=nginx": () => ({ ok: true, kind: "hub", tags: ["1.25", "latest"], truncated: true, ms: 21 }),
    }
    const hub = await fMount({ sources: [fSource()], routes: hubRoutes })
    await byText(sourceTable(hub.mount), ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
    const hubDialog = hub.modal()
    await tick()
    const hubText = textOf(hubDialog)
    assert.ok(hubText.includes(ZH["admin.sandbox.readKindUnsupported"]), "Hub 目录 ⇒ unsupported 一键文案")
    assert.ok(hubText.includes("Hub 无全站目录 API（官方关闭）——改用「按镜像名查标签」（Hub 面）"), "服务端人话就地呈")
    assert.ok(hubText.includes(ZH["admin.sandbox.catalogHubName"]), "仓库面改走「按镜像名查标签」")
    assert.equal(fFindAll(hubDialog, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.sandbox.catalogFilterPh"]).length, 1, "Hub 面单过滤列表（仓库面换单输入）")
    const hubInput = fFind(hubDialog, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.sandbox.catalogNamePh"])
    hubInput.value = "nginx"
    await fFind(hubDialog, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.deepEqual(hub.calls.find(([method, path]) => method === "GET" && path.includes("/tags")), ["GET", "/api/admin/sandbox/image-sources/1/tags?name=nginx", null], "按名查标签（裸名——补 library/ 归服务端）")
    assert.ok(fFindAll(hubDialog, (node) => node.tag === "td").map((cell) => cell.textContent).includes("latest"), "标签逐值")
    assert.equal(hub.modal(), hubDialog, "读成 ⇒ 不关窗")
    // 空输入 ⇒ 必填门（零外呼）
    hubInput.value = ""
    await fFind(hubDialog, (node) => node.tag === "form").fire("submit")
    assert.equal(hub.calls.filter(([, path]) => path.includes("/tags")).length, 1, "空名 ⇒ 不提交")
    assert.ok(textOf(hubDialog).includes(fill(ZH["admin.sandbox.fieldRequired"], { field: ZH["admin.sandbox.catalogHubName"] })), "必填门人话")
  } finally { delete globalThis.document }
})

test("③b 五分类读绪：每类一键文案 + 服务端人话——窗内就地呈（不关窗）", async () => {
  try {
    const kinds = [
      ["timeout", "admin.sandbox.readKindTimeout", "源响应超时（10000ms）：https://ghcr.io/v2/_catalog?n=200"],
      ["unreachable", "admin.sandbox.readKindUnreachable", "源不可达：https://ghcr.io"],
      ["auth_required", "admin.sandbox.readKindAuthRequired", "源要求认证（HTTP 401——零凭据面）"],
      ["unsupported", "admin.sandbox.readKindUnsupported", "远端不支持该接口（HTTP 405）"],
      ["bad_response", "admin.sandbox.readKindBadResponse", "源响应非 JSON（HTTP 200）"],
    ]
    for (const [kind, key, message] of kinds) {
      const { mount, modal, calls } = await fMount({
        sources: [fSource({ id: 2, kind: "v2" })],
        routes: { "GET /api/admin/sandbox/image-sources/2/catalog": () => ({ ok: false, error: { kind, message }, ms: 7 }) },
      })
      await byText(sourceTable(mount), ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
      const dialog = modal()
      await tick()
      assert.ok(textOf(dialog).includes(ZH[key]), `${kind} ⇒ 一键文案`)
      assert.ok(textOf(dialog).includes(message), `${kind} ⇒ 服务端人话就地呈`)
      assert.equal(modal(), dialog, `${kind} ⇒ 窗不关`)
      assert.deepEqual(calls.filter(([tag]) => tag === "fail"), [], `${kind} ⇒ 零页级 fail（窗内收口）`)
    }
    // 转读失败（我们的 API 抛——非五分类）⇒ mapError 人话
    const broken = await fMount({ sources: [fSource({ id: 2, kind: "v2" })], routes: { "GET /api/admin/sandbox/image-sources/2/catalog": upstreamFail("网关炸了") } })
    await byText(sourceTable(broken.mount), ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
    await tick()
    assert.ok(textOf(broken.modal()).includes(fill(ZH["err.upstream_error"], { detail: "网关炸了" })), "转读失败 ⇒ mapError 人话")
  } finally { delete globalThis.document }
})

// ── ④ 本地镜像表过滤 + i18n（§2.8① ∥ §2.2）──────────────────────────────────

test("④ 本地镜像表过滤：名/标签匹配 ∥ 无匹配空态 ∥ 零新端点 + i18n 34 键对位", async () => {
  try {
    const images = [fImage({ tags: ["thincoder-sandbox:1"] }), fImage({ id: "sha256:bbb", tags: ["ubuntu:latest"], size: 2048 })]
    const { calls, mount } = await fMount({ images })
    await byText(mount, ZH["admin.sandbox.expand"]).fire("click")
    await tick()
    const filter = fFind(mount, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.sandbox.imageFilterPh"])
    assert.ok(filter !== null, "镜像表过滤输入在册（表上方）")
    assert.equal(rowsOf(imageTableNow(mount)).length, 2, "前置：两镜像两行")
    const before = calls.length
    filter.value = "thincoder"
    await filter.fire("input")
    assert.deepEqual(rowsOf(imageTableNow(mount)).map(firstCellText), ["thincoder-sandbox:1"], "按名匹配")
    filter.value = "latest"
    await filter.fire("input")
    assert.deepEqual(rowsOf(imageTableNow(mount)).map(firstCellText), ["ubuntu:latest"], "按标签匹配")
    filter.value = "zzz"
    await filter.fire("input")
    assert.equal(imageTableNow(mount), null, "无匹配 ⇒ 表撤（零行）")
    assert.ok(textOf(mount).includes(ZH["admin.sandbox.imagesNoMatch"]), "无匹配 ⇒ 空态句")
    filter.value = ""
    await filter.fire("input")
    assert.equal(rowsOf(imageTableNow(mount)).length, 2, "清词 ⇒ 复原")
    assert.equal(calls.length, before, "过滤零新端点（已载集合纯前端）")

    // i18n 两表（本批 34 键）
    for (const key of NEW_KEYS) {
      for (const [lang, table] of [["zh", ZH], ["en", EN]]) {
        assert.ok(typeof table[key] === "string" && table[key].trim() !== "", `${lang} 表缺键：${key}`)
      }
      assert.equal(placeholders(ZH[key]), placeholders(EN[key]), `占位符不对位：${key}`)
      assert.equal(CJK.test(EN[key]), false, `en 值含 CJK：${key}`)
    }
    assert.equal(NEW_KEYS.length, 34, "本批键数（34——源卡/浏览窗/过滤/五分类）")
    const SELF_NAMES = new Set(["lang.zh", "lang.en"])
    const base = (table) => new Set(Object.keys(table).filter((key) => !SELF_NAMES.has(key)).map((key) => key.replace(/\.one$/, "")))
    const zhBase = base(ZH)
    const enBase = base(EN)
    assert.deepEqual([...zhBase].filter((key) => !enBase.has(key)), [], "仅 zh 键（自称名族除外）")
    assert.deepEqual([...enBase].filter((key) => !zhBase.has(key)), [], "仅 en 键")
    // 纯函数面（面型/读绪文案）
    assert.deepEqual([SOURCE_VIEW.sourceKindLabel("hub"), SOURCE_VIEW.sourceKindLabel("hub-mirror"), SOURCE_VIEW.sourceKindLabel("v2"), SOURCE_VIEW.sourceKindLabel("bogus")], [ZH["admin.sandbox.sourceKindHub"], ZH["admin.sandbox.sourceKindHubMirror"], ZH["admin.sandbox.sourceKindV2"], ZH["admin.sandbox.sourceKindV2"]], "面型文案（枚举外兜底 v2）")
    for (const [kind, key] of [["timeout", "readKindTimeout"], ["unreachable", "readKindUnreachable"], ["auth_required", "readKindAuthRequired"], ["unsupported", "readKindUnsupported"], ["bad_response", "readKindBadResponse"]]) {
      assert.equal(SOURCE_VIEW.readKindLabel(kind), ZH[`admin.sandbox.${key}`], `读绪文案：${kind}`)
    }
    assert.equal(SOURCE_VIEW.readKindLabel("bogus"), "bogus", "读绪枚举外 ⇒ 原文兜底")
    assert.equal(typeof SOURCE_VIEW.createImageSourceSection, "function", "卡件导出")
  } finally { delete globalThis.document }
})

// ── ⑤ 静态面（档目 ∥ 行数/行宽 ∥ canon ∥ 门禁链）─────────────────────────────

test("⑤ 静态面：档目 43 ∥ 42 ∥ 新档在册 ∥ 行数/行宽 ∥ 零外链/零 CJK ∥ `t` 字面量闭合 ∥ 类名双向闭合 ∥ canon 不破 ∥ 门禁链完整", () => {
  // 档目（43 ∥ 42——2026-10-11 走查轮后；test 口径 = [总档数, 除 favicon 档数]）
  const names = readdirSync(PUBLIC_DIR).sort()
  assert.deepEqual([names.length, names.filter((name) => name !== "favicon.png").length], [48, 47], "档目 48 ∥ 47（test 口径——2026-10-12 team-projects-permissions 批后）")
  assert.ok(names.includes("views-sandbox-image-sources.mjs"), "新档在册：views-sandbox-image-sources.mjs")
  const cssClasses = new Set([...CSS.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]))
  for (const [name, source] of Object.entries(SOURCES)) {
    const lines = source.split("\n").length
    assert.ok(lines <= 500, `${name} 越 500 软线：${lines}`)
    assert.ok(Math.max(...source.split("\n").map((line) => line.length)) <= 300, `${name} 行宽 ≤300`)
    assert.deepEqual([/https?:\/\//.test(source), source.includes("@import")], [false, false], `${name} 零外链（KD-SV-9）`)
    assert.equal(CJK.test(stripComments(source)), false, `${name} 代码段零 CJK（文案全入两表）`)
    for (const match of stripComments(source).matchAll(/\bt\(\s*"([^"]+)"\s*[,)]/g)) {
      assert.ok(match[1] in ZH && match[1] in EN, `${name} t 字面量悬空：${match[1]}`)
    }
    // 类名双向闭合（档面字面类 ⊆ 样式类）
    const used = new Set()
    for (const match of source.matchAll(/\bclass(?:Name)?\s*[:=]\s*([^\n;]*?)(?=\s*\bclass(?:Name)?\s*[:=]|[;\n]|$)/g)) {
      const window = match[1].replace(/\$\{[^}]*\}/g, " ").split("//")[0].split("}")[0].split(/,\s*[A-Za-z_$][\w$]*\s*:/)[0]
      for (const literal of window.matchAll(/["'`]([^"'`]*)["'`]/g)) for (const token of literal[1].split(/\s+/)) if (token) used.add(token)
    }
    for (const token of used) assert.ok(cssClasses.has(token), `${name} 档面类无样式规则：${token}`)
  }
  for (const token of ["filter-row", "browse-grid"]) assert.ok(cssClasses.has(token), `本批新类在样式面：${token}`)
  // 零原生 confirm（删除确认 = 自窗——§2.8①）
  assert.equal(/\bwindow\.confirm\s*\(/.test(SOURCES["views-sandbox-image-sources.mjs"]), false, "零原生 confirm")
  // 接线（页面挂载两处：件 import + `sources.card` 挂载）
  assert.ok(SOURCES["views-sandbox.mjs"].includes('from "./views-sandbox-image-sources.mjs"') && SOURCES["views-sandbox.mjs"].includes("createImageSourceSection"), "源卡件接线")
  assert.ok(SOURCES["views-sandbox.mjs"].includes("imagePanel.append(createImageSourceSection(ctx,"), "源卡挂载点（标签②面板——console-tabs-component 批后）")
  // AC-19 canon 不破（零新 `:root` 变量 ∥ 零新悬停规则）
  const cssClean = stripComments(CSS)
  assert.equal([...cssClean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].length, 58, ":root 58（2026-10-11 走查轮后基线 ⇒ 2026-10-12 走查实修④ +8）")
   assert.equal([...cssClean.matchAll(/:hover/g)].length, 8, "悬停八条（七 + 页签一）")
  // 门禁链：存量链目标在盘 + 本批两件同链（入链 = 父侧随正件 47 ⇒ 49——本件只断言「零悬空 ∥ 本批两件同链不半落」）
  const chain = PKG.scripts.prepublishOnly.match(/docs\/batches\/[^\s"]+/g) ?? []
  for (const rel of chain.filter((entry) => !entry.includes("sandbox-image-sources"))) assert.ok(existsSync(join(ROOT, rel)), `链目标在盘：${rel}`)
  const mine = chain.filter((entry) => entry.includes("sandbox-image-sources"))
  assert.ok(mine.length === 0 || mine.length === 2, `本批两件须同链（现 ${mine.length} 件——父侧随正件）`)
  for (const rel of ["docs/batches/2026-10-11-sandbox-image-sources.test.mjs", "docs/batches/2026-10-11-sandbox-image-sources-ui.test.mjs"]) {
    assert.ok(existsSync(join(ROOT, rel)), `本批件在盘：${rel}`)
  }
})
