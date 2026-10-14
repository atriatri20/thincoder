/**
 * 2026-10-11-sandbox-image-quick-pull.test.mjs — thincoder-server 批内单测件（控制台面·沙盒页一键拉取——`sandbox-image-quick-pull` 批；
 * 判据源 = `webui/WEBUI.md` §2.8① ∥ §2.2；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-11-sandbox-image-quick-pull.test.mjs`
 *
 * 射程（腿 ↔ 用例 = `sandbox/SANDBOX.md` §12）：
 *   ① N60 全链（目录窗标签行「拉取」⇒ 节点选单（单例——目录窗关）⇒ 既有拉取窗预填 + 「目标节点」行 ⇒
 *     预填可改 ⇒ 确认走既有拉取径（`POST …/runners/:id/images/pull` 入参 = 所见值）⇒ flash + 关窗 ⇒ 节点镜像表重取）
 *   ② B57（无节点 ∥ 全离线 ⇒ 钮禁用 + 一句人话（复用 `noNodes`/`allOffline`）；点击零动作 ∥ 零外呼）
 *   ∥ E46（概览读败 ⇒ 钮禁用 + `mapError` 人话；重开目录窗可重试）
 *   ③ B58 预填逐值四形（Hub 四别名 ⇒ `docker.io` + 裸名补 `library/` ∥ 含端口逐值 ∥ 仓库行 `:latest` ∥ 标签行所取标签）
 *     + Hub 面 DOM 径（按名读标签 ⇒ 标签行钮 ⇒ 预填 `docker.io/library/<名>:<标签>`）
 *   ④ 零新端点 ∥ 审计既有 `image_pull`（拉取窗唯一径 = 既有端点；服务端路由 + 审计 kind 在盘零触；两件端点面扫描）
 *   ⑤ i18n +3 键两表（逐键在场 ∥ 占位符对位 ∥ en 零 CJK ∥ 键集双向相等）+ 复用 2 键在盘
 *   ⑥ 静态面（档目 43 ∥ 42（文件集合快照）∥ 行数/行宽 ∥ 零外链/零 CJK ∥ `t` 字面量闭合 ∥ 类名双向闭合 ∥
 *     canon 不破（`:root` 58〔2026-10-12 走查实修④ +8〕 ∥ 悬停 8）∥ 装配接线 ∥ 门禁链零悬空 + 本批件在链）
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

const [{ ZH }, { EN }, SANDBOX, PULL, IMAGES] = await Promise.all([
  load("i18n-zh.mjs"), load("i18n-en.mjs"), load("views-sandbox.mjs"),
  load("views-sandbox-image-sources.mjs"), load("views-sandbox-images.mjs"),
])
const PKG = JSON.parse(readFileSync(join(ROOT, "thincoder-server", "package.json"), "utf8"))
const SOURCES = {
  "views-sandbox.mjs": readPublic("views-sandbox.mjs"),
  "views-sandbox-image-sources.mjs": readPublic("views-sandbox-image-sources.mjs"),
  "views-sandbox-images.mjs": readPublic("views-sandbox-images.mjs"),
}
const CSS = readPublic("style.css")

/** 本批新增键（3——§2.2 键族登记；两表逐键同步）；复用 2 键（零新增——可用态提示条）。 */
const NEW_KEYS = ["admin.sandbox.catalogPull", "admin.sandbox.pullPickNodeTitle", "admin.sandbox.pullTarget"]
const REUSED_KEYS = ["admin.sandbox.noNodes", "admin.sandbox.allOffline"]
/** public/ 档集快照（本批零新档——档目 43 ∥ 42；差集空 = 集合逐名相等）。 */
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
const stripComments = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/^\s*\/\/.*$/gm, "").replace(/([^:])\/\/.*$/gm, "$1")

// ── 桩 DOM（`modal.mjs` 壳面近形；`h` 同 app 语义近似；事件靶补 `stopPropagation`——钮内点击与行选取分离）──

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
const fImage = (over = {}) => ({ id: "sha256:aaa", tags: ["thincoder-sandbox:1"], size: 123456, created: 1700000000, ...over })
const fSource = (over = {}) => ({ id: 2, name: "自建", address: "https://ghcr.io", kind: "v2", createdAt: "2026-10-11T00:00:00.000Z", ...over })
const upstreamFail = (message) => () => { throw Object.assign(new Error(message), { code: "upstream_error", status: 502 }) }

/** 页面渲染夹具（运行面 + 镜像区 + 镜像源卡——整页装配 `renderSandbox`）。 */
async function fMount({ routes = {}, runners = [fRunner()], images = [fImage()], sources = [fSource()] } = {}) {
  globalThis.document = stubDocument()
  globalThis.history = { replaceState: () => {} } // 标签②切换回写地址栏（console-tabs-component 批——桩面补）
  const { ctx, calls } = fCtx({
    "GET /api/admin/sandbox/overview": () => ({ status: "ok", runners }),
    "GET /api/admin/sandbox/onboarding": () => ({ runs: [] }),
    "GET /api/admin/sandbox/runners/1/containers": () => ({ containers: [] }),
    "GET /api/admin/sandbox/runners/1/images": () => ({ images }),
    "GET /api/admin/sandbox/image-sources": () => ({ sources }),
    "GET /api/admin/sandbox/image-sources/presets": () => ({ presets: [] }),
    ...routes,
  })
  const mount = makeNode("section")
  await SANDBOX.renderSandbox(ctx, mount)
  await tick()
  await byText(mount, ZH["admin.sandbox.tabImages"]).fire("click") // 标签②（源卡 + 镜像表——console-tabs-component 批后两区迁②，懒建）
  await tick()
  return { ctx, calls, mount, modal: () => fFind(globalThis.document.body, (node) => node.tag === "dialog") }
}

/** 卡件直装（导出面直测——不缠整页）。 */
async function fCard({ routes = {}, sources = [fSource()] } = {}) {
  globalThis.document = stubDocument()
  const { ctx, calls } = fCtx({
    "GET /api/admin/sandbox/image-sources": () => ({ sources }),
    "GET /api/admin/sandbox/image-sources/presets": () => ({ presets: [] }),
    ...routes,
  })
  const card = PULL.createImageSourceSection(ctx)
  const host = makeNode("section")
  host.append(card.card)
  await tick()
  return { ctx, calls, host, modal: () => fFind(globalThis.document.body, (node) => node.tag === "dialog") }
}

/** 目录窗内两列过滤列表（父节点直接携 `div.filter-row`——列容器不算）。 */
const listNodes = (root) => fFindAll(root, (node) => node.tag === "div" && node.className === "stack-box" && (node.children ?? []).some((child) => child.tag === "div" && child.className === "filter-row"))
/** 行（按首格文取——行尾动作钮不入判）。 */
const rowByFirstCell = (root, text) => fFindAll(root, (node) => node.tag === "tr" && fFind(node, (cell) => cell.tag === "td")?.textContent === text)[0] ?? null
const pullBtnIn = (row) => fFind(row, (node) => node.tag === "button" && node.textContent === ZH["admin.sandbox.catalogPull"])
const dialogTitle = (dialog) => fFind(dialog, (node) => node.tag === "h3")?.textContent ?? ""
const dialogs = () => fFindAll(globalThis.document.body, (node) => node.tag === "dialog")

const V2_CATALOG = { ok: true, kind: "v2", repositories: ["library/nginx", "library/redis"], truncated: false, ms: 9 }
const V2_TAGS = { ok: true, kind: "v2", tags: ["1.25", "latest"], truncated: false, ms: 7 }

// ── ① N60 全链（§2.8①：目录窗 ⇒ 选单 ⇒ 预填拉取窗 ⇒ 既有拉取径 ⇒ 镜像表重取）────────────────

test("① N60 全链：标签行「拉取」⇒ 节点选单（单例）⇒ 预填 + 目标节点行 ⇒ 预填可改 ⇒ 确认走既有拉取径 ⇒ 镜像表重取", async () => {
  try {
    const { calls, mount, modal } = await fMount({
      routes: {
        "GET /api/admin/sandbox/image-sources/2/catalog": () => V2_CATALOG,
        "GET /api/admin/sandbox/image-sources/2/tags?name=library%2Fnginx": () => V2_TAGS,
        "POST /api/admin/sandbox/runners/1/images/pull": () => ({ ok: true, image: "docker.io/library/nginx", tag: "1.25" }),
      },
    })
    const callsOf = (method, path) => calls.filter(([m, p]) => m === method && p === path).length

    // 标签②激活 ⇒ 镜像表首取（重取腿的基线）
    await byText(mount, ZH["admin.sandbox.expand"]).fire("click")
    await tick()
    assert.equal(callsOf("GET", "/api/admin/sandbox/runners/1/images"), 1, "前置：标签②激活 ⇒ 镜像表首取")

    // 目录窗：开窗读一次概览 ⇒ 拉取钮可用（在线节点在场）
    await byText(mount, ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
    const dialog = modal()
    assert.ok(dialog !== null, "目录窗开启")
    await tick()
    assert.equal(callsOf("GET", "/api/admin/sandbox/overview"), 2, "开窗读一次概览（页装配一次 + 本轮一次——零新端点）")
    const lists = listNodes(dialog)
    assert.equal(lists.length, 2, "两列（仓库 ∥ 标签）")
    // 可用态重渲不顶掉首屏面：未选仓库时标签列=待命句（本批重渲只及读成面）
    assert.ok(textOf(lists[1]).includes(ZH["admin.sandbox.catalogTagHint"]), "概览落定后标签列仍为待命句（未选仓库）")
    const repoRow = rowByFirstCell(lists[0], "library/nginx")
    assert.ok(repoRow !== null, "仓库行在场")
    const repoPull = pullBtnIn(repoRow)
    assert.equal(repoPull.disabled, false, "在线节点在场 ⇒ 行尾「拉取」钮可用")
    // 键盘同径：钮内 Enter/Space 不外传（行级 keydown 否则吞钮激活 ⇒ 行选取 ≠ 钮动作）
    let escaped = false
    await repoPull.fire("keydown", { key: "Enter", stopPropagation: () => { escaped = true } })
    assert.equal(escaped, true, "钮内 Enter 不外传")

    // 点行取标签 ⇒ 标签行尾「拉取」钮
    await repoRow.fire("click")
    await tick()
    const tagRow = rowByFirstCell(lists[1], "1.25")
    assert.ok(tagRow !== null, "标签行在场")
    assert.equal(pullBtnIn(tagRow).disabled, false, "标签行「拉取」钮可用")

    // 点标签行「拉取」⇒ 节点选单（单例：目录窗自动关）
    await pullBtnIn(tagRow).fire("click")
    const picker = modal()
    assert.equal(dialogs().length, 1, "单例：同时最多一窗（目录窗已关）")
    assert.equal(dialogTitle(picker), ZH["admin.sandbox.pullPickNodeTitle"], "节点选单题")
    const pickerRows = fFindAll(picker, (node) => node.tag === "tr")
    assert.deepEqual(pickerRows.map((row) => rowByFirstCell(picker, "box-a") === row ? textOf(row) : null).filter(Boolean), ["box-a http://10.0.0.6:2375"], "在线节点行 = 名 + 地址")
    assert.equal(callsOf("POST", "/api/admin/sandbox/runners/1/images/pull"), 0, "选单未开 ⇒ 零拉取")

    // 选节点 ⇒ 既有拉取窗：预填逐值 + 「目标节点」行
    await pickerRows[0].fire("click")
    const pullDialog = modal()
    assert.equal(dialogs().length, 1, "单例链：选单已关——拉取窗唯一在场")
    assert.equal(dialogTitle(pullDialog), ZH["admin.sandbox.imagePull"], "既有拉取窗（题不变）")
    const input = fFind(pullDialog, (node) => node.tag === "input")
    assert.equal(input.value, "ghcr.io/library/nginx:1.25", "预填逐值（去 scheme + 标签行所取标签）")
    assert.ok(textOf(pullDialog).includes(fill(ZH["admin.sandbox.pullTarget"], { name: "box-a" })), "「目标节点：{name}」行在场")

    // 预填可改 ⇒ 确认值 = 所见值；走既有拉取径
    input.value = "docker.io/library/nginx:1.25"
    await fFind(pullDialog, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.deepEqual(calls.filter(([method]) => method === "POST").at(-1), ["POST", "/api/admin/sandbox/runners/1/images/pull", { image: "docker.io/library/nginx:1.25" }], "确认 ⇒ 既有拉取径（入参 = 改后所见值）")
    assert.ok(calls.some(([tag, message]) => tag === "flash" && message === fill(ZH["admin.sandbox.imagePulled"], { ref: "docker.io/library/nginx:1.25" })), "拉取 flash")
    assert.equal(modal(), null, "成 ⇒ 关窗")

    // 拉取成 ⇒ 该节点镜像表重取（页注入回调——列表上新）
    await tick()
    assert.equal(callsOf("GET", "/api/admin/sandbox/runners/1/images"), 2, "镜像表重取（缓存失效 + 重渲）")
  } finally { delete globalThis.document }
})

// ── ② 可用态（B57 两分支 ∥ E46 读败）──────────────────────────────────────────

test("② B57 可用态：无节点 ∥ 全离线 ⇒ 钮禁用 + 一句人话；点击零动作 ∥ 零外呼", async () => {
  try {
    for (const [runners, key] of [[[], "admin.sandbox.noNodes"], [[fRunner({ online: false })], "admin.sandbox.allOffline"]]) {
      const { calls, mount, modal } = await fMount({
        runners,
        routes: { "GET /api/admin/sandbox/image-sources/2/catalog": () => V2_CATALOG },
      })
      await byText(mount, ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
      const dialog = modal()
      await tick()
      const button = pullBtnIn(rowByFirstCell(listNodes(dialog)[0], "library/nginx"))
      assert.equal(button.disabled, true, `${key} ⇒ 钮禁用`)
      assert.ok(textOf(dialog).includes(ZH[key]), `${key} ⇒ 一句人话（复用运行面文案）`)
      const before = calls.length
      await button.fire("click")
      assert.equal(calls.length, before, "点击零动作 ∥ 零外呼")
      assert.equal(dialogs().length, 1, "零新窗（未开选单）")
      assert.equal(calls.filter(([method]) => method === "POST").length, 0, "零拉取提交")
    }
  } finally { delete globalThis.document }
})

test("② E46 概览读败 ⇒ 钮禁用 + mapError 人话；重开目录窗可重试", async () => {
  try {
    let failing = true
    const { calls, host, modal } = await fCard({
      routes: {
        "GET /api/admin/sandbox/overview": () => {
          if (failing) upstreamFail("网关炸了")()
          return { status: "ok", runners: [fRunner()] }
        },
        "GET /api/admin/sandbox/image-sources/2/catalog": () => V2_CATALOG,
      },
    })
    await byText(host, ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
    const broken = modal()
    await tick()
    assert.equal(pullBtnIn(rowByFirstCell(listNodes(broken)[0], "library/nginx")).disabled, true, "读败 ⇒ 钮禁用")
    assert.ok(textOf(broken).includes(fill(ZH["err.upstream_error"], { detail: "网关炸了" })), "读败 ⇒ mapError 人话")

    failing = false // 重开目录窗 = 重读（读时读）
    await byText(host, ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
    const retried = modal()
    await tick()
    assert.equal(pullBtnIn(rowByFirstCell(listNodes(retried)[0], "library/nginx")).disabled, false, "重开可重试 ⇒ 钮可用")
    assert.equal(calls.filter(([, path]) => path === "/api/admin/sandbox/overview").length, 2, "两开两读（零新端点）")
  } finally { delete globalThis.document }
})

// ── ③ 预填逐值（B58 四形 ∥ Hub 面 DOM 径）────────────────────────────────────

test("③ B58 预填逐值四形：Hub 四别名 ⇒ docker.io + 裸名补 library/ ∥ 含端口逐值 ∥ 仓库行 :latest ∥ 标签行所取标签", () => {
  for (const host of ["hub.docker.com", "index.docker.io", "registry-1.docker.io", "docker.io"]) {
    assert.equal(PULL.pullRefFor({ kind: "hub", address: `https://${host}` }, { repo: "nginx", tag: "1.25" }), "docker.io/library/nginx:1.25", `${host} ⇒ 主机统一 docker.io + 裸名补 library/`)
  }
  assert.equal(PULL.pullRefFor({ kind: "hub", address: "https://hub.docker.com" }, { repo: "ns/repo", tag: "v2" }), "docker.io/ns/repo:v2", "含命名空间 ⇒ 原样")
  assert.equal(PULL.pullRefFor({ kind: "v2", address: "http://10.0.0.5:5000" }, { repo: "library/nginx", tag: "1.25" }), "10.0.0.5:5000/library/nginx:1.25", "去 scheme + 含端口逐值")
  assert.equal(PULL.pullRefFor({ kind: "v2", address: "https://ghcr.io" }, { repo: "ns/repo", tag: "v2" }), "ghcr.io/ns/repo:v2", "无端口逐值")
  assert.equal(PULL.pullRefFor({ kind: "v2", address: "https://ghcr.io" }, { repo: "ns/repo" }), "ghcr.io/ns/repo:latest", "仓库行 ⇒ :latest 显式")
  assert.equal(PULL.pullRefFor({ kind: "v2", address: "https://ghcr.io" }, { repo: "ns/repo", tag: "" }), "ghcr.io/ns/repo:latest", "空标签兜 :latest")
})

test("③ Hub 面 DOM 径：按名读标签 ⇒ 标签行钮 ⇒ 预填 docker.io/library/<名>:<标签>（窗内「目标节点」行）", async () => {
  try {
    const hubSource = fSource({ id: 1, name: "Docker Hub", address: "https://hub.docker.com", kind: "hub" })
    const { calls, mount, modal } = await fMount({
      sources: [hubSource],
      routes: {
        "GET /api/admin/sandbox/image-sources/1/catalog": () => ({ ok: false, error: { kind: "unsupported", message: "Hub 无全站目录 API（官方关闭）" }, ms: 0 }),
        "GET /api/admin/sandbox/image-sources/1/tags?name=nginx": () => ({ ok: true, kind: "hub", tags: ["1.25", "latest"], truncated: false, ms: 6 }),
      },
    })
    await byText(mount, ZH["admin.sandbox.sourceCatalogBtn"]).fire("click")
    const dialog = modal()
    await tick()
    const nameInput = fFind(dialog, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.sandbox.catalogNamePh"])
    nameInput.value = "nginx" // 裸名（补 library/ 归预填面——两表惯例同形）
    await fFind(dialog, (node) => node.tag === "form").fire("submit")
    await tick()
    const tagRow = rowByFirstCell(listNodes(dialog)[0], "1.25")
    await pullBtnIn(tagRow).fire("click")
    const picker = modal()
    await fFind(picker, (node) => node.tag === "tr").fire("click")
    const pullDialog = modal()
    assert.equal(fFind(pullDialog, (node) => node.tag === "input").value, "docker.io/library/nginx:1.25", "Hub 面预填（站点主机 ⇒ docker.io；裸名补 library/）")
    assert.ok(textOf(pullDialog).includes(fill(ZH["admin.sandbox.pullTarget"], { name: "box-a" })), "目标节点行在场")
    assert.equal(calls.filter(([, path]) => path.includes("/tags?name=nginx")).length, 1, "标签读一次（裸名——补 library/ 归服务端读取面）")
  } finally { delete globalThis.document }
})

// ── ④ 零新端点 ∥ 审计既有 image_pull（服务端零触）──────────────────────────────

test("④ 零新端点 ∥ 审计既有 image_pull：唯一拉取径 = 既有端点（服务端路由 + 审计 kind 在盘）", () => {
  const routesSrc = readFileSync(join(ROOT, "thincoder-server", "src", "sandbox", "image-routes.mjs"), "utf8")
  assert.ok(routesSrc.includes('routes.add("POST", "/api/admin/sandbox/runners/:id/images/pull"'), "既有拉取路由在盘（零新端点）")
  assert.ok(routesSrc.includes('kind: "image_pull"'), "审计既有 image_pull 行在盘（零新 kind）")
  assert.ok(SOURCES["views-sandbox-images.mjs"].includes("`/api/admin/sandbox/runners/${runner.id}/images/pull`"), "拉取窗唯一径 = 既有端点")
  // 端点面扫描（拉取链两件）——除既有前缀外零新径
  const allowed = ["/api/admin/sandbox/image-sources", "/api/admin/sandbox/overview", "/api/admin/sandbox/runners/"]
  for (const name of ["views-sandbox-image-sources.mjs", "views-sandbox-images.mjs"]) {
    for (const match of SOURCES[name].matchAll(/\/api\/[^"`\s]*/g)) {
      const endpoint = match[0].split("${")[0].split("?")[0]
      assert.ok(allowed.some((prefix) => endpoint.startsWith(prefix)), `${name} 端点面越界：${endpoint}`)
    }
  }
})

// ── ⑤ i18n +3 键两表 + 复用 2 键 ──────────────────────────────────────────────

test("⑤ i18n：本批 3 键两表逐键在场 ∥ 占位符对位 ∥ en 零 CJK ∥ 键集双向相等 ∥ 复用 2 键在盘", () => {
  for (const key of NEW_KEYS) {
    for (const [lang, table] of [["zh", ZH], ["en", EN]]) {
      assert.ok(typeof table[key] === "string" && table[key].trim() !== "", `${lang} 表缺键：${key}`)
    }
    assert.equal(placeholders(ZH[key]), placeholders(EN[key]), `占位符不对位：${key}`)
    assert.equal(CJK.test(EN[key]), false, `en 值含 CJK：${key}`)
  }
  assert.equal(NEW_KEYS.length, 3, "本批键数（3——行动作钮/选单题/目标节点行）")
  assert.equal(fill(ZH["admin.sandbox.pullTarget"], { name: "box-a" }), "目标节点：box-a", "目标节点行逐值（zh）")
  for (const key of REUSED_KEYS) {
    for (const [lang, table] of [["zh", ZH], ["en", EN]]) assert.ok(typeof table[key] === "string" && table[key] !== "", `${lang} 复用键缺位：${key}`)
  }
  const SELF_NAMES = new Set(["lang.zh", "lang.en"])
  const base = (table) => new Set(Object.keys(table).filter((key) => !SELF_NAMES.has(key)).map((key) => key.replace(/\.one$/, "")))
  const zhBase = base(ZH)
  const enBase = base(EN)
  assert.deepEqual([...zhBase].filter((key) => !enBase.has(key)), [], "仅 zh 键（自称名族除外）")
  assert.deepEqual([...enBase].filter((key) => !zhBase.has(key)), [], "仅 en 键")
})

// ── ⑥ 静态面（档目 ∥ 行数/行宽 ∥ canon ∥ 接线 ∥ 门禁链）─────────────────────────

test("⑥ 静态面：档目 43 ∥ 42（集合快照）∥ 行数/行宽 ∥ 零外链/零 CJK ∥ `t` 字面量闭合 ∥ 类名双向闭合 ∥ canon 不破 ∥ 接线 ∥ 链", () => {
  const names = readdirSync(PUBLIC_DIR).sort()
  assert.deepEqual(names, [...PUBLIC_SNAPSHOT].sort(), "public/ 文件集合 = 快照（本批零新档——差集空）")
  assert.deepEqual([names.length, names.filter((name) => name !== "favicon.png").length], [48, 47], "档目 48 ∥ 47（test 口径——2026-10-12 team-projects-permissions 批后）")
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
    const used = new Set()
    for (const match of source.matchAll(/\bclass(?:Name)?\s*[:=]\s*([^\n;]*?)(?=\s*\bclass(?:Name)?\s*[:=]|[;\n]|$)/g)) {
      const window = match[1].replace(/\$\{[^}]*\}/g, " ").split("//")[0].split("}")[0].split(/,\s*[A-Za-z_$][\w$]*\s*:/)[0]
      for (const literal of window.matchAll(/["'`]([^"'`]*)["'`]/g)) for (const token of literal[1].split(/\s+/)) if (token) used.add(token)
    }
    for (const token of used) assert.ok(cssClasses.has(token), `${name} 档面类无样式规则：${token}`)
  }
  // 装配接线：页注入回调（拉取成 ⇒ 镜像表重取）
  assert.ok(SOURCES["views-sandbox.mjs"].includes("createImageSourceSection(ctx, { onPulled:"), "页装配点注入 `onPulled`")
  assert.ok(SOURCES["views-sandbox.mjs"].includes("images.reset(runner)"), "回调 = 失缓存重取（列表上新）")
  assert.ok(SOURCES["views-sandbox-image-sources.mjs"].includes('from "./views-sandbox-images.mjs"'), "拉取窗复用（既有窗单源）")
  assert.equal(typeof IMAGES.openPullImageModal, "function", "拉取窗导出面（预填参入口）")
  // AC-19 canon 不破（零新 `:root` 变量 ∥ 零新悬停规则）
  const cssClean = stripComments(CSS)
  assert.equal([...cssClean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].length, 58, ":root 58（2026-10-11 走查轮后基线 ⇒ 2026-10-12 走查实修④ +8）")
   assert.equal([...cssClean.matchAll(/:hover/g)].length, 8, "悬停八条（七 + 页签一）")
  // 门禁链：本批件在链 ∥ 存量链目标零悬空
  const chain = PKG.scripts.prepublishOnly.match(/docs\/batches\/[^\s"]+/g) ?? []
  assert.ok(chain.includes("docs/batches/2026-10-11-sandbox-image-quick-pull.test.mjs"), "本批件在链（prepublishOnly）")
  for (const rel of chain) assert.ok(existsSync(join(ROOT, rel)), `链目标在盘：${rel}`)
})
