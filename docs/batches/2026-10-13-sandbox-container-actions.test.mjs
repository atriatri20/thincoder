/**
 * 2026-10-13-sandbox-container-actions.test.mjs — thincoder-server 批内单测件（控制台面·沙盒容器动作钮——sandbox-container-actions 批；
 * 判据源 = `webui/SANDBOX.md` §2.1① `:19`–`:24` ∥ §4 本批判据行 ∥ 需求 功能点 49 ∥ AC-49；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-13-sandbox-container-actions.test.mjs`
 *
 * 射程（腿 ↔ 验收对照）：
 *   ① 门矩阵两态：运行中 ⇒ 启动禁/停止与重启可用 ∥ 非运行（已创建/已退出/枚举外原值兜底）⇒ 启动可用/停止与重启禁
 *      （纯函数 `actionGate` + 渲染面逐行双核；七钮序不变〔末位终端 = sandbox-container-terminal 批 +1——2026-10-13 父侧随正〕∥ 详情/日志/删除不随门 ∥ 终端 = 运行中门）
 *   ② 忙态 + 行闩：点停 ⇒ 该行七钮即时禁用（发请求前——`disabled` 非 `hidden`）∥ 在飞连点零第二请求（假 API 计数）∥
 *      完成 ⇒ 回门矩阵态（随新数据重渲）∥ 失败面专项：运行中「停止」失败 ⇒ 启动仍禁用（非七钮无条件全启）
 *   ③ 反馈：成功 ⇒ `flash` 成功句（三动作三句——含容器名）∥ 失败 ⇒ 红条 `ctx.fail`（零成功句）
 *   ④ i18n：+3 键两表在册 ∥ 句形逐字 ∥ 占位符 `{name}` 两表一致 ∥ en 零 CJK ∥ 两表键集相等 ∥ 成功句键消费在册
 *   ⑤ 静态面：本批零 CSS 触面（`:root` 计数 2026-10-13 父侧随正 58 ⇒ 76——容器终端批 +18；他批改 `style.css` 时本件随之重核）∥ 禁用态 = `button:disabled` 既有（零新样式件）
 *
 * 桩说明：直调 `createContainerSection`（桩 ctx + 假 API 路由表；`reload`/`refresh` 入账）；DOM 桩 = `dom.mjs` `h`（结构轮自 `app.mjs` 外拆）
 * 语义近似（`disabled`/`hidden` 走受控属性——`.disabled` 可观察）。零网络零真模型。
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
const load = (name) => import(pathToFileURL(join(PUBLIC_DIR, name)).href)

// ── 桩 DOM（`h` 语义近似：disabled/hidden 受控属性 ∥ on* 事件 ∥ 子节点）───────────────────────

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
globalThis.document = stubDocument() // 模块面保险桩（开窗路径不参与本批腿）

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

/** 确定性失败（映射面人话——`upstream_error` 携引擎原文）。 */
const upstreamFail = (message) => () => { throw Object.assign(new Error(message), { code: "upstream_error", status: 502 }) }

/** 延迟桩（在飞期观察——resolve/reject 由腿驱）。 */
function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

const fRunner = (over = {}) => ({ id: 1, name: "box-a", address: "http://10.0.0.6:2375", status: "ok", online: true, version: "29.1.3", containers: { total: 3, running: 2 }, ...over })
const fContainer = (over = {}) => ({ id: "c1", name: "workspace-a", image: "thincoder-sandbox:1", state: "running", ...over })

/** 容器区夹具（直调 `createContainerSection`——桩 ctx + 假 API；`reload`/`refresh` 入账）。 */
async function fMountSection({ routes = {}, containers = [] } = {}) {
  const data = { containers }
  const { ctx, calls } = fCtx({ "GET /api/admin/sandbox/runners/1/containers": () => ({ containers: data.containers }), ...routes })
  const reloads = []
  const refreshes = []
  const section = CONTAINERS.createContainerSection(ctx)
  const box = () => section.area(fRunner(), { reload: () => { reloads.push("reload"); return Promise.resolve() }, refresh: () => refreshes.push("refresh") })
  box()
  await tick()
  return { ctx, calls, data, reloads, refreshes, section, box }
}

const rowFor = (box, name) => fFindAll(box, (node) => node.tag === "tr").find((row) => fFind(row, (cell) => cell.tag === "td" && cell.textContent === name)) ?? null
const buttonsOf = (row) => fFindAll(row, (node) => node.tag === "button")
const disabledOf = (row) => buttonsOf(row).map((button) => button.disabled)
const hiddenOf = (row) => buttonsOf(row).map((button) => button.hidden)
const postsOf = (calls) => calls.filter(([method]) => method === "POST")
const flashOf = (calls) => calls.filter(([tag]) => tag === "flash").map(([, message]) => message)
const failOf = (calls) => calls.filter(([tag]) => tag === "fail").map(([, message]) => message)

const CONTAINERS = await load("views-sandbox-containers.mjs")
const { ZH_SANDBOX } = await load("i18n-zh-sandbox.mjs")
const { EN_SANDBOX } = await load("i18n-en-sandbox.mjs")
const { ZH } = await load("i18n-zh.mjs")
const SOURCE = readPublic("views-sandbox-containers.mjs")
const CSS = readPublic("style.css")

/** 七钮序（详情/启动/停止/重启/日志/删除/终端——sandbox-docker-admin 批起；末位终端 = sandbox-container-terminal 批 +1——2026-10-13 父侧随正）。 */
const LABELS = [ZH["admin.sandbox.detail"], ZH["admin.sandbox.start"], ZH["admin.sandbox.stop"], ZH["admin.sandbox.restart"], ZH["admin.sandbox.logs"], ZH["admin.sandbox.remove"], ZH["admin.sandbox.terminal"]]
const fill = (text, params) => String(text).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",")
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/([^:])\/\/.*$/gm, "$1")

// ── ① 门矩阵两态（纯函数 + 渲染面逐行）───────────────────────────────────────────

test("① 门矩阵两态：运行中 ⇒ 启动禁/停止与重启可用 ∥ 已创建/已退出/枚举外兜底 ⇒ 启动可用/停止与重启禁", async () => {
  assert.deepEqual(CONTAINERS.actionGate("running"), { start: true, stop: false, restart: false }, "运行中 ⇒ 启动禁（停止/重启可用）")
  for (const state of ["created", "exited", "paused", undefined]) {
    assert.deepEqual(CONTAINERS.actionGate(state), { start: false, stop: true, restart: true }, `非运行（${String(state)}——含枚举外兜底）⇒ 停止/重启禁（启动可用）`)
  }
  const containers = [
    fContainer(),
    fContainer({ id: "c2", name: "created-a", state: "created" }),
    fContainer({ id: "c3", name: "exited-a", state: "exited" }),
    fContainer({ id: "c4", name: "paused-a", state: "paused" }),
  ]
  const { box } = await fMountSection({ containers })
  const view = box()
  assert.deepEqual(buttonsOf(rowFor(view, "workspace-a")).map((button) => button.textContent), LABELS, "七钮序不变（详情/启动/停止/重启/日志/删除/终端）")
  assert.deepEqual(disabledOf(rowFor(view, "workspace-a")), [false, true, false, false, false, false, false], "运行中行：启动禁（详情/停止/重启/日志/删除/终端可用）")
  for (const name of ["created-a", "exited-a", "paused-a"]) {
    assert.deepEqual(disabledOf(rowFor(view, name)), [false, false, true, true, false, false, true], `非运行行（${name}）：停止/重启/终端禁（启动可用）`)
  }
})

// ── ② 忙态 + 行闩（在飞零第二请求 ∥ 完成回门矩阵态 ∥ 失败面专项）────────────────────────

test("② 忙态 + 行闩：点停 ⇒ 七钮即时禁用（`disabled` 非 `hidden`）∥ 在飞连点零第二请求 ∥ 完成回门矩阵态 ∥ 失败 ⇒ 启动仍禁用", async () => {
  const pending = deferred()
  const mount = await fMountSection({ routes: { "POST /api/admin/sandbox/runners/1/containers/c1/stop": () => pending.promise }, containers: [fContainer()] })
  const row = rowFor(mount.box(), "workspace-a")
  const [, startBtn, stopBtn, restartBtn] = buttonsOf(row)
  assert.equal(postsOf(mount.calls).length, 0, "静置 ⇒ 零请求")
  const inflight = stopBtn.fire("click") // 不 await——在飞期立即观察
  assert.equal(postsOf(mount.calls).length, 1, "点停 ⇒ 恰一发（POST …/stop）")
  assert.deepEqual(disabledOf(row), [true, true, true, true, true, true, true], "在飞期：该行七钮即时禁用（发请求前）")
  assert.deepEqual(hiddenOf(row), [false, false, false, false, false, false, false], "禁用走 `disabled` 属性（非 `hidden`）")
  await stopBtn.fire("click") // 在飞连点：同钮
  await restartBtn.fire("click") // 在飞连点：他钮（闩覆盖面 = 该行七钮）
  await startBtn.fire("click")
  assert.equal(postsOf(mount.calls).length, 1, "在飞连点 ⇒ 零第二请求（行闩早退）")
  pending.resolve({ ok: true }) // 完成（成功）⇒ flash 成功句 + 失缓存重取 + 回门矩阵态
  await inflight
  await tick()
  assert.deepEqual(flashOf(mount.calls), [fill(ZH["admin.sandbox.containerStopped"], { name: "workspace-a" })], "成功 ⇒ flash 成功句（含容器名）")
  assert.equal(failOf(mount.calls).length, 0, "成功 ⇒ 零红条")
  assert.equal(mount.reloads.length, 1, "成功 ⇒ 失缓存重取（既有 invalidate 路径）")
  assert.deepEqual(disabledOf(row), [false, true, false, false, false, false, false], "完成 ⇒ 回门矩阵态（当刻态列 = 运行中）")
  mount.data.containers = [fContainer({ state: "exited" })] // 服务端态已变——重取后行随新数据重建
  mount.box() // 失缓存 ⇒ 新取（loading 占位）
  await tick()
  assert.equal(mount.calls.filter(([method, path]) => method === "GET" && path.endsWith("/containers")).length, 2, "重取 = 第二读（态列随新数据）")
  assert.deepEqual(disabledOf(rowFor(mount.box(), "workspace-a")), [false, false, true, true, false, false, true], "新态列（已退出）⇒ 门矩阵随动")
  // 失败面专项：运行中「停止」失败 ⇒ 启动仍禁用（非七钮无条件全启）
  const bad = await fMountSection({ routes: { "POST /api/admin/sandbox/runners/1/containers/c1/stop": upstreamFail("docker down") }, containers: [fContainer()] })
  const badRow = rowFor(bad.box(), "workspace-a")
  await buttonsOf(badRow)[2].fire("click")
  assert.equal(postsOf(bad.calls).length, 1, "失败 ⇒ 恰一发（零重试）")
  assert.deepEqual(failOf(bad.calls), ["docker down"], "失败 ⇒ 红条 `ctx.fail`（引擎原文透传）")
  assert.equal(flashOf(bad.calls).length, 0, "失败 ⇒ 零成功句")
  assert.deepEqual(disabledOf(badRow), [false, true, false, false, false, false, false], "失败恢复 = 按当刻态列重算（运行中 ⇒ 启动仍禁用）")
  assert.equal(bad.reloads.length, 0, "失败 ⇒ 零重取")
})

// ── ③ 结果反馈（三动作三句 ∥ 失败红条）────────────────────────────────────────────

test("③ 反馈：成功 ⇒ flash 成功句（三动作三句——含容器名）∥ 失败 ⇒ 红条 `ctx.fail`", async () => {
  const cases = [
    { action: "start", state: "created", index: 1, key: "admin.sandbox.containerStarted" },
    { action: "stop", state: "running", index: 2, key: "admin.sandbox.containerStopped" },
    { action: "restart", state: "running", index: 3, key: "admin.sandbox.containerRestarted" },
  ]
  for (const item of cases) {
    const mount = await fMountSection({ routes: { [`POST /api/admin/sandbox/runners/1/containers/c1/${item.action}`]: () => ({ ok: true }) }, containers: [fContainer({ state: item.state })] })
    await buttonsOf(rowFor(mount.box(), "workspace-a"))[item.index].fire("click")
    assert.deepEqual(flashOf(mount.calls), [fill(ZH[item.key], { name: "workspace-a" })], `成功句逐字（含容器名）：${item.key}`)
    assert.equal(failOf(mount.calls).length, 0, "成功 ⇒ 零红条")
  }
  const bad = await fMountSection({ routes: { "POST /api/admin/sandbox/runners/1/containers/c1/start": upstreamFail("engine error") }, containers: [fContainer({ state: "exited" })] })
  await buttonsOf(rowFor(bad.box(), "workspace-a"))[1].fire("click")
  assert.deepEqual(failOf(bad.calls), ["engine error"], "失败 ⇒ 红条 `ctx.fail`（既有映射面）")
  assert.equal(flashOf(bad.calls).length, 0, "失败 ⇒ 零成功句")
})

// ── ④ i18n 两表（+3 键在册 ∥ 句形 ∥ 占位符 ∥ en 零 CJK ∥ 键集相等）─────────────────────

test("④ i18n：+3 键两表在册 ∥ 句形逐字 ∥ 占位符 `{name}` 两表一致 ∥ en 零 CJK ∥ 两表键集相等", () => {
  const ZH_WANT = {
    "admin.sandbox.containerStarted": "容器已启动：{name}",
    "admin.sandbox.containerStopped": "容器已停止：{name}",
    "admin.sandbox.containerRestarted": "容器已重启：{name}",
  }
  const EN_WANT = {
    "admin.sandbox.containerStarted": "Container started: {name}",
    "admin.sandbox.containerStopped": "Container stopped: {name}",
    "admin.sandbox.containerRestarted": "Container restarted: {name}",
  }
  for (const [key, text] of Object.entries(ZH_WANT)) assert.equal(ZH_SANDBOX[key], text, `zh 句形：${key}`)
  for (const [key, text] of Object.entries(EN_WANT)) assert.equal(EN_SANDBOX[key], text, `en 句形：${key}`)
  for (const key of Object.keys(ZH_WANT)) {
    assert.equal(placeholders(ZH_SANDBOX[key]), "name", `zh 占位符：${key}`)
    assert.equal(placeholders(EN_SANDBOX[key]), placeholders(ZH_SANDBOX[key]), `占位符两表一致：${key}`)
    assert.equal(CJK.test(EN_SANDBOX[key]), false, `en 零 CJK：${key}`)
    assert.ok(SOURCE.includes(key), `成功句键消费在册（views-sandbox-containers.mjs）：${key}`)
  }
  assert.deepEqual(Object.keys(ZH_SANDBOX).sort(), Object.keys(EN_SANDBOX).sort(), "两表键集相等（逐键同步）")
})

// ── ⑤ 静态面（零新变量 ∥ 禁用态既有件）────────────────────────────────────────────

test("⑤ 静态面：本批零 CSS 触面（`:root` 计数当刻实读 76——终端批 +18，他批改触时随之重核）∥ 禁用态 = `button:disabled` 既有", () => {
  const clean = stripComments(CSS)
  const rootVars = [...clean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1])
  assert.equal(rootVars.length, 76, ":root 变量计数 = 当刻实读 76（2026-10-13 父侧随正——容器终端批 +18；本批零 CSS 触面——他批改 style.css 时本件随之重核，非本批回归）")
  assert.ok(clean.includes("button:disabled"), "禁用态样式 = `button:disabled` 既有（零新样式件）")
})
