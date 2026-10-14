/**
 * 2026-10-11-sandbox-pull-by-source.test.mjs — thincoder-server 批内单测件（控制台面·拉取认源——`sandbox-pull-by-source` 批；
 * 判据源 = `webui/WEBUI.md` §2.8① ∥ §2.2；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-11-sandbox-pull-by-source.test.mjs`
 *
 * 射程（腿 ↔ 用例 = `sandbox/SANDBOX.md` §12）：
 *   ① B59 组装逐值（v2 四支——含端口逐值 ∥ 已带主机剥换（引擎同口径三形）∥ 标签缺省补 `:latest` ∥ 空输入不动作）
 *     ∥ B60 Hub 三支（裸名补 `library/` ∥ 已含 `/` 不重复补 ∥ `@` digest 透传）+ 幂等 + 与 `pullRefFor` 同口径
 *   ② B62 无源 ∥ E47 读败 ⇒ 选单不选态 + 人话（拉取不阻断——手输提交照常）；重开窗可重试
 *   ③ B61 认源态生命周期：携源认源态（预选态非自动改写）∥ 改选剥换主机重组装 ∥ 改选「不选」输入不动（单向）∥
 *     手改不自动回落 + 完成即再组装（幂等）∥ 记忆预选（P2——重开预选 ∥ 记忆源失效 ⇒ 不选态回落）
 *   ④ N61 手动径全链（开窗 ⇒ P1「目标节点」行恒显 ⇒ 选源 ⇒ 输入 ⇒ 组装可见改写 ⇒ 确认走既有拉取径（体 = 当刻文本）⇒
 *     镜像表重取）+ 零新端点（两端点面扫描 ∥ 服务端拉取路由零触）
 *   ⑤ i18n +3 键两表（逐键在场 ∥ 占位符对位 ∥ en 零 CJK ∥ 键集双向相等）+ 复用 `sourcesEmpty`（零新增）在盘
 *   ⑥ 静态面（档目 43 ∥ 42（集合快照）∥ 行数/行宽 ∥ 零外链/零 CJK ∥ `t` 字面量闭合 ∥ 类名双向闭合 ∥ canon 不破
 *     （`:root` 58〔2026-10-12 走查实修④ +8〕 ∥ 悬停 8）∥ 装配接线 ∥ 门禁链零悬空 + 本批件在链）
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
const BATCH_FILE = "docs/batches/2026-10-11-sandbox-pull-by-source.test.mjs"

/** 本批新增键（3——§2.2 键族登记；两表逐键同步）；复用 1 键（零新增——无源提示）。 */
const NEW_KEYS = ["admin.sandbox.pullSource", "admin.sandbox.pullSourceNone", "admin.sandbox.pullSourceHint"]
const REUSED_KEY = "admin.sandbox.sourcesEmpty"
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
/** 剥注释（字符串态感知——`//`/`/*` 出现在字符串内不误剥；沿 `2026-10-06-server-i18n.test.mjs` 同法——防正则/URL 串削弱「零 CJK ∥ `t` 字面量闭合」判据）。 */
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

/** 桩 `localStorage`（P2 记忆腿——Map 背书；`delete globalThis.localStorage` 收尾）。 */
function fStorage(initial = {}) {
  const store = new Map(Object.entries(initial))
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => { store.set(key, String(value)) },
  }
  return store
}

const fRunner = (over = {}) => ({ id: 1, name: "box-a", address: "http://10.0.0.6:2375", status: "ok", online: true, version: "29.1.3", containers: { total: 0, running: 0 }, selfCheck: "ok", createdAt: 1700000000, ...over })
const fImage = (over = {}) => ({ id: "sha256:aaa", tags: ["thincoder-sandbox:1"], size: 123456, created: 1700000000, ...over })
const fSource = (over = {}) => ({ id: 2, name: "自建", address: "https://ghcr.io", kind: "v2", createdAt: "2026-10-11T00:00:00.000Z", ...over })
const upstreamFail = (message) => () => { throw Object.assign(new Error(message), { code: "upstream_error", status: 502 }) }
const postOk = () => ({ ok: true, image: "ubuntu", tag: "24.04" })

const selectOf = (dialog) => fFind(dialog, (node) => node.tag === "select")
const inputOf = (dialog) => fFind(dialog, (node) => node.tag === "input")
const optionsOf = (dialog) => fFindAll(selectOf(dialog), (node) => node.tag === "option")
const dialogTitle = (dialog) => fFind(dialog, (node) => node.tag === "h3")?.textContent ?? ""
const closeButton = (dialog) => fFind(dialog, (node) => node.tag === "button" && node.className === "modal-close")

/** 拉取窗直装（`openPullImageModal` 导出面直测——不缠整页）。 */
async function fWindow({ sources = [fSource()], routes = {}, prefill = null, source = null } = {}) {
  globalThis.document = stubDocument()
  globalThis.history = { replaceState: () => {} } // 标签②切换回写地址栏（console-tabs-component 批——桩面补）
  const { ctx, calls } = fCtx({ "GET /api/admin/sandbox/image-sources": () => ({ sources }), ...routes })
  IMAGES.openPullImageModal(ctx, { runner: fRunner(), reload: async () => {}, prefill, source })
  await tick()
  return { ctx, calls, dialog: () => fFind(globalThis.document.body, (node) => node.tag === "dialog") }
}

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
  return { ctx, calls, mount, modal: () => fFind(globalThis.document.body, (node) => node.tag === "dialog") }
}

// ── ① B59 组装逐值（v2 四支）∥ B60 Hub 三支 ────────────────────────────────────

test("① 组装逐值纯函数（pullRefWithSource）：B59 v2 四支 ∥ B60 Hub 三支 ∥ 判据支 ∥ 幂等 ∥ 与 pullRefFor 同口径", () => {
  const v2 = { kind: "v2", address: "http://10.0.0.5:5000" }
  // B59① 含端口源 + ns/repo:tag
  assert.equal(IMAGES.pullRefWithSource("ns/repo:tag", v2), "10.0.0.5:5000/ns/repo:tag", "B59① 去 scheme + 含端口逐值")
  // B59② 已带主机（ghcr.io/foo/bar:1）⇒ 首段剥 + 换源主机
  assert.equal(IMAGES.pullRefWithSource("ghcr.io/foo/bar:1", v2), "10.0.0.5:5000/foo/bar:1", "B59② 已带主机剥换（覆盖）")
  // B59③ 标签缺省（nginx）⇒ 补 :latest 显式
  assert.equal(IMAGES.pullRefWithSource("nginx", v2), "10.0.0.5:5000/nginx:latest", "B59③ 无标签 ⇒ :latest 显式")
  // B59④ 空输入 ⇒ 不动作
  assert.equal(IMAGES.pullRefWithSource("", v2), "", "B59④ 空输入不动作")
  assert.equal(IMAGES.pullRefWithSource("   ", v2), "", "空（空白）输入不动作")
  // 主机判据（引擎同口径三形：首段含 `.`/`:` ∥ = localhost）+ 反例（首段无点/冒号 ⇒ 不剥）
  assert.equal(IMAGES.pullRefWithSource("foo.bar/baz:1", v2), "10.0.0.5:5000/baz:1", "首段含点 ⇒ 剥")
  assert.equal(IMAGES.pullRefWithSource("localhost/foo:1", v2), "10.0.0.5:5000/foo:1", "localhost ⇒ 剥")
  assert.equal(IMAGES.pullRefWithSource("localhost:5000/foo:1", v2), "10.0.0.5:5000/foo:1", "localhost + 端口 ⇒ 剥")
  assert.equal(IMAGES.pullRefWithSource("ns/repo:tag", v2), "10.0.0.5:5000/ns/repo:tag", "首段无点/冒号 ⇒ 不剥（路径保真）")
  // B60 Hub 三支（主机统一 docker.io + 裸名补 library/）
  const hub = { kind: "hub", address: "https://hub.docker.com" }
  assert.equal(IMAGES.pullRefWithSource("nginx", hub), "docker.io/library/nginx:latest", "B60① 裸名 ⇒ docker.io/library/ + :latest")
  assert.equal(IMAGES.pullRefWithSource("ubuntu:24.04", hub), "docker.io/library/ubuntu:24.04", "Hub 裸名携标签（剥后裸名判据）")
  assert.equal(IMAGES.pullRefWithSource("library/nginx:1.1", hub), "docker.io/library/nginx:1.1", "B60② 已含 `/` ⇒ 不重复补")
  assert.equal(IMAGES.pullRefWithSource("ghcr.io/foo/bar:1", hub), "docker.io/foo/bar:1", "Hub + 已带主机 ⇒ 剥换（补名不适用）")
  assert.equal(IMAGES.pullRefWithSource("foo@sha256:abc", hub), "foo@sha256:abc", "B60③ `@` digest 原样透传")
  assert.equal(IMAGES.pullRefWithSource("foo@sha256:abc", v2), "foo@sha256:abc", "digest 透传（v2 同）")
  // 四别名 ⇒ 同形（Hub 主机统一）
  for (const host of ["docker.io", "index.docker.io", "registry-1.docker.io", "hub.docker.com"]) {
    assert.equal(IMAGES.pullRefWithSource("nginx", { kind: "hub", address: `https://${host}` }), "docker.io/library/nginx:latest", `${host} ⇒ docker.io`)
  }
  // 幂等（组装施加点两处皆一次性幂等）
  assert.equal(IMAGES.pullRefWithSource("10.0.0.5:5000/ns/repo:tag", v2), "10.0.0.5:5000/ns/repo:tag", "再组装幂等（v2）")
  assert.equal(IMAGES.pullRefWithSource("docker.io/library/nginx:latest", hub), "docker.io/library/nginx:latest", "再组装幂等（Hub）")
  // 与 pullRefFor 同口径（值规则单源——组装/预填两径同值）
  assert.equal(PULL.pullRefFor(v2, { repo: "ns/repo", tag: "tag" }), IMAGES.pullRefWithSource("ns/repo:tag", v2), "两径同值（v2）")
  assert.equal(PULL.pullRefFor(hub, { repo: "nginx", tag: null }), IMAGES.pullRefWithSource("nginx", hub), "两径同值（Hub 裸名）")
  assert.equal(IMAGES.sourceHost(v2), "10.0.0.5:5000", "源主机导出（去 scheme，v2）")
  assert.equal(IMAGES.hubLibraryName(hub, "nginx"), "library/nginx", "补名导出（Hub 裸名）")
  assert.equal(IMAGES.hubLibraryName({ kind: "hub-mirror", address: "https://docker.m.daocloud.io" }, "alpine"), "library/alpine", "补名导出（Hub 镜像裸名——走查轮 2026-10-11 甲）")
  assert.equal(IMAGES.hubLibraryName({ kind: "hub-mirror", address: "https://docker.m.daocloud.io" }, "ns/repo"), "ns/repo", "含 / ⇒ 原样（Hub 镜像）")
})

// ── ② 可用态两分支（B62 无源 ∥ E47 读败）───────────────────────────────────────

test("② 可用态：B62 无源 ∥ E47 读败 ⇒ 不选态 + 人话；手输提交照常（拉取不阻断）∥ 重开窗可重试", async () => {
  try {
    // B62：无源 ⇒ 选单仅「不选（原样）」+「暂无镜像源」提示（复用 sourcesEmpty——零新键）
    const none = await fWindow({ sources: [], routes: { "POST /api/admin/sandbox/runners/1/images/pull": postOk } })
    const dialog = none.dialog()
    assert.deepEqual(optionsOf(dialog).map((option) => option.textContent), [ZH["admin.sandbox.pullSourceNone"]], "选单仅「不选（原样）」")
    assert.equal(selectOf(dialog).value, "", "不选态")
    assert.ok(textOf(dialog).includes(ZH["admin.sandbox.sourcesEmpty"]), "「暂无镜像源」提示（复用键）")
    inputOf(dialog).value = "ubuntu:24.04" // 手输提交照常（零涉）
    await fFind(dialog, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.deepEqual(none.calls.filter(([method]) => method === "POST").at(-1), ["POST", "/api/admin/sandbox/runners/1/images/pull", { image: "ubuntu:24.04" }], "手输提交照常（不阻断）")

    // E47：源清单读败 ⇒ 不选态 + mapError 就地人话；手输提交仍成
    const broken = await fWindow({
      routes: { "GET /api/admin/sandbox/image-sources": upstreamFail("网关炸了"), "POST /api/admin/sandbox/runners/1/images/pull": postOk },
    })
    const brokenDialog = broken.dialog()
    assert.deepEqual(optionsOf(brokenDialog).map((option) => option.textContent), [ZH["admin.sandbox.pullSourceNone"]], "读败 ⇒ 不选态")
    assert.ok(textOf(brokenDialog).includes(fill(ZH["err.upstream_error"], { detail: "网关炸了" })), "读败 ⇒ mapError 人话")
    inputOf(brokenDialog).value = "nginx" // 不选 ⇒ 原样提交（组装零涉）
    await fFind(brokenDialog, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.deepEqual(broken.calls.filter(([method]) => method === "POST").at(-1), ["POST", "/api/admin/sandbox/runners/1/images/pull", { image: "nginx" }], "读败不阻断：手输提交仍成")

    // 重开窗可重试（读时读——每次开窗重读）
    const retry = await fWindow({ sources: [fSource({ id: 4, name: "1ms", address: "https://docker.1ms.run" })] })
    assert.deepEqual(optionsOf(retry.dialog()).map((option) => option.textContent), [ZH["admin.sandbox.pullSourceNone"], "1ms"], "重开 ⇒ 源清单重读（可重试）")
    assert.equal(retry.calls.filter(([, path]) => path === "/api/admin/sandbox/image-sources").length, 1, "开窗读一次（零新端点）")
  } finally { delete globalThis.document }
})

// ── ③ B61 认源态生命周期（含 P2 记忆）─────────────────────────────────────────

test("③ B61 认源态：携源认源态 ∥ 改选剥换重组装 ∥「不选」输入不动 ∥ 手改不回落 + 完成即再组装（幂等）∥ 记忆预选（P2）", async () => {
  const store = fStorage()
  try {
    const a = fSource({ id: 2, name: "ghcr", address: "https://ghcr.io" })
    const b = fSource({ id: 3, name: "自建", address: "http://10.0.0.5:5000" })
    // 一键拉取径：携源 + 预填 ⇒ 认源态（选单呈现该源——开窗不改写输入）
    const one = await fWindow({ sources: [a, b], prefill: "ghcr.io/library/nginx:1.25", source: a })
    const select = selectOf(one.dialog())
    assert.deepEqual(optionsOf(one.dialog()).map((option) => option.textContent), [ZH["admin.sandbox.pullSourceNone"], "ghcr", "自建"], "选单项 = 不选 + 各源名")
    assert.equal(select.value, "2", "携源 ⇒ 选单认源态")
    assert.equal(inputOf(one.dialog()).value, "ghcr.io/library/nginx:1.25", "预选态非自动改写（输入 = 预填原样）")
    // 改选另一源 ⇒ 剥换主机重组装（预填逐值与组装同口径）
    select.value = "3"
    await select.fire("change")
    assert.equal(inputOf(one.dialog()).value, "10.0.0.5:5000/library/nginx:1.25", "改选 ⇒ 剥换主机重组装")
    assert.equal(store.get("tc_pull_source"), "3", "记忆随选单变更更新")
    // 改选「不选」⇒ 输入不动（单向——不逆变换）
    const kept = inputOf(one.dialog()).value
    select.value = ""
    await select.fire("change")
    assert.equal(inputOf(one.dialog()).value, kept, "「不选」= 不逆变换输入")
    assert.equal(store.get("tc_pull_source"), "", "记忆含「不选」（空串）")
    // 再选回源 ⇒ 手改 ⇒ 输入完成（change ∥ blur）⇒ 不回落且再组装（幂等）
    select.value = "3"
    await select.fire("change")
    const input = inputOf(one.dialog())
    input.value = "nginx"
    await input.fire("change")
    assert.equal(input.value, "10.0.0.5:5000/nginx:latest", "手改完成 ⇒ 再组装（补 :latest 显式）")
    assert.equal(select.value, "3", "手改 ⇒ 选单不自动回落（不保证与当刻输入一致）")
    await input.fire("blur")
    assert.equal(input.value, "10.0.0.5:5000/nginx:latest", "完成即再组装（幂等）")
    // 关窗重开（记忆在场）⇒ 预选上次所选（只动选单，不动输入）
    closeButton(one.dialog()).fire("click")
    const two = await fWindow({ sources: [a, b] })
    assert.equal(selectOf(two.dialog()).value, "3", "重开 ⇒ 预选上次所选（P2——预选态）")
    assert.equal(inputOf(two.dialog()).value, "", "预选态非自动改写（输入原样）")
    // 记忆源已被删 ⇒ 不选态回落（拉取不阻断）
    closeButton(two.dialog()).fire("click")
    store.set("tc_pull_source", "99")
    const three = await fWindow({ sources: [a, b] })
    assert.equal(selectOf(three.dialog()).value, "", "记忆源失效 ⇒ 不选态回落")
    assert.equal(optionsOf(three.dialog()).length, 3, "源清单照常在场")
    inputOf(three.dialog()).value = "nginx"
    await inputOf(three.dialog()).fire("change")
    assert.equal(inputOf(three.dialog()).value, "nginx", "不选态 ⇒ 不组装（拉取不阻断——原样提交）")
  } finally {
    delete globalThis.document
    delete globalThis.localStorage
  }
})

// ── ④ N61 手动径全链（含 P1 恒显 ∥ 零新端点）───────────────────────────────────

test("④ N61 手动径全链：开窗 ⇒ P1 目标节点行恒显 ⇒ 选源 ⇒ 组装可见改写 ⇒ 确认走既有拉取径 ⇒ 镜像表重取", async () => {
  try {
    const { calls, mount, modal } = await fMount({
      sources: [fSource({ id: 7, name: "1ms", address: "https://docker.1ms.run" })],
      routes: { "POST /api/admin/sandbox/runners/1/images/pull": () => ({ ok: true, image: "docker.1ms.run/ubuntu", tag: "24.04" }) },
    })
    const callsOf = (method, path) => calls.filter(([m, p]) => m === method && p === path).length
    // 展开节点 ⇒ 镜像区首取（重取腿的基线）
    await byText(mount, ZH["admin.sandbox.expand"]).fire("click")
    await byText(mount, ZH["admin.sandbox.tabImages"]).fire("click") // 标签②（镜像表懒建——console-tabs-component 批后）
    await tick()
    assert.equal(callsOf("GET", "/api/admin/sandbox/runners/1/images"), 1, "前置：标签②激活 ⇒ 镜像表首取")
    const readsBefore = callsOf("GET", "/api/admin/sandbox/image-sources") // 卡装配已读一次
    // 镜像区「拉取镜像」⇒ 开窗（手动径）
    await byText(mount, ZH["admin.sandbox.imagePull"]).fire("click")
    const dialog = modal()
    assert.ok(dialog !== null, "拉取窗开启")
    assert.equal(dialogTitle(dialog), ZH["admin.sandbox.imagePull"], "题 = 拉取镜像")
    await tick()
    assert.equal(callsOf("GET", "/api/admin/sandbox/image-sources"), readsBefore + 1, "开窗读一次源清单（既有端点——零新端点）")
    // P1：手动径也示去向（「目标节点：{name}」行恒显）
    assert.ok(textOf(dialog).includes(fill(ZH["admin.sandbox.pullTarget"], { name: "box-a" })), "「目标节点：{name}」行恒显（P1——手动径）")
    // 选单形：首项「不选（原样）」+ 各源一项（项文 = 源名）；提示行在场
    assert.deepEqual(optionsOf(dialog).map((option) => option.textContent), [ZH["admin.sandbox.pullSourceNone"], "1ms"], "选单形")
    assert.ok(textOf(dialog).includes(ZH["admin.sandbox.pullSourceHint"]), "提示行在场")
    const select = selectOf(dialog)
    const input = inputOf(dialog)
    // 选源 ⇒ 空输入不动作；输入完成（change——回车提交径同链）⇒ 组装可见改写
    select.value = "7"
    await select.fire("change")
    assert.equal(input.value, "", "空输入 + 选源 ⇒ 不动作（B59④ 窗内同形）")
    input.value = "ubuntu:24.04"
    await input.fire("change")
    assert.equal(input.value, "docker.1ms.run/ubuntu:24.04", "组装逐值就地显示（输入框可见改写）")
    // 确认 ⇒ 既有拉取径（体 = 输入框当刻文本）；flash ⇒ 关窗 ⇒ 该节点镜像表重取
    await fFind(dialog, (node) => node.tag === "form").fire("submit")
    await tick()
    assert.deepEqual(calls.filter(([method]) => method === "POST").at(-1), ["POST", "/api/admin/sandbox/runners/1/images/pull", { image: "docker.1ms.run/ubuntu:24.04" }], "确认 ⇒ 既有拉取径（体 = 当刻文本；端点形零改）")
    assert.ok(calls.some(([tag, message]) => tag === "flash" && message === fill(ZH["admin.sandbox.imagePulled"], { ref: "docker.1ms.run/ubuntu:24.04" })), "拉取 flash（服务端拆分读数：fromImage/tag 逐值）")
    assert.equal(modal(), null, "成 ⇒ 关窗")
    await tick()
    assert.equal(callsOf("GET", "/api/admin/sandbox/runners/1/images"), 2, "成后该节点镜像表重取（列表上新）")
  } finally { delete globalThis.document }
})

test("④ 零新端点：两端点面扫描（除既有前缀外零新径）∥ 服务端拉取路由/审计零触", () => {
  const routesSrc = readFileSync(join(ROOT, "thincoder-server", "src", "sandbox", "image-routes.mjs"), "utf8")
  assert.ok(routesSrc.includes('routes.add("POST", "/api/admin/sandbox/runners/:id/images/pull"'), "既有拉取路由在盘（零新端点）")
  assert.ok(routesSrc.includes('kind: "image_pull"'), "审计既有 image_pull 行在盘（零新 kind）")
  const allowed = ["/api/admin/sandbox/image-sources", "/api/admin/sandbox/overview", "/api/admin/sandbox/runners/"]
  for (const name of ["views-sandbox-image-sources.mjs", "views-sandbox-images.mjs"]) {
    for (const match of SOURCES[name].matchAll(/\/api\/[^"`\s]*/g)) {
      const endpoint = match[0].split("${")[0].split("?")[0]
      assert.ok(allowed.some((prefix) => endpoint.startsWith(prefix)), `${name} 端点面越界：${endpoint}`)
    }
  }
  assert.ok(SOURCES["views-sandbox-images.mjs"].includes("`/api/admin/sandbox/runners/${runner.id}/images/pull`"), "拉取窗唯一径 = 既有端点")
})

// ── ⑤ i18n +3 键两表 + 复用 1 键 ──────────────────────────────────────────────

test("⑤ i18n：本批 3 键两表逐键在场 ∥ 占位符对位 ∥ en 零 CJK ∥ 键集双向相等 ∥ 复用 1 键在盘", () => {
  for (const key of NEW_KEYS) {
    for (const [lang, table] of [["zh", ZH], ["en", EN]]) {
      assert.ok(typeof table[key] === "string" && table[key].trim() !== "", `${lang} 表缺键：${key}`)
    }
    assert.equal(placeholders(ZH[key]), placeholders(EN[key]), `占位符不对位：${key}`)
    assert.equal(CJK.test(EN[key]), false, `en 值含 CJK：${key}`)
  }
  assert.equal(NEW_KEYS.length, 3, "本批键数（3——选单 label/缺省项/提示行）")
  assert.equal(ZH["admin.sandbox.pullSource"], "经由源", "选单 label 逐值（zh）")
  assert.equal(ZH["admin.sandbox.pullSourceNone"], "不选（原样）", "缺省项逐值（zh）")
  assert.equal(ZH["admin.sandbox.pullSourceHint"], "选定后引用按该源组装（可再改）", "提示行逐值（zh）")
  assert.ok(typeof ZH[REUSED_KEY] === "string" && typeof EN[REUSED_KEY] === "string", "复用键在盘（sourcesEmpty——零新增）")
  const SELF_NAMES = new Set(["lang.zh", "lang.en"])
  const base = (table) => new Set(Object.keys(table).filter((key) => !SELF_NAMES.has(key)).map((key) => key.replace(/\.one$/, "")))
  const zhBase = base(ZH)
  const enBase = base(EN)
  assert.deepEqual([...zhBase].filter((key) => !enBase.has(key)), [], "仅 zh 键（自称名族除外）")
  assert.deepEqual([...enBase].filter((key) => !zhBase.has(key)), [], "仅 en 键")
})

// ── ⑥ 静态面（档目 ∥ 行数/行宽 ∥ canon ∥ 接线 ∥ 门禁链）───────────────────────

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
  // AC-19 canon 不破（零新 `:root` 变量 ∥ 零新悬停规则）
  const cssClean = stripComments(CSS)
  assert.equal([...cssClean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].length, 58, ":root 58（2026-10-11 走查轮后基线 ⇒ 2026-10-12 走查实修④ +8）")
   assert.equal([...cssClean.matchAll(/:hover/g)].length, 8, "悬停八条（七 + 页签一）")
  // 装配接线：拉取窗导出面 ∥ 一键拉取调用点携源（认源态）∥ 件间 import 单向（images 不被 image-sources 反向依赖）
  assert.equal(typeof IMAGES.pullRefWithSource, "function", "组装纯函数导出")
  assert.equal(typeof IMAGES.sourceHost, "function", "源主机导出（两径同源）")
  assert.equal(typeof IMAGES.hubLibraryName, "function", "补名导出（两径同源）")
  assert.ok(/openPullImageModal\(ctx, \{ runner, prefill: pullRefFor\(source, \{ repo, tag \}\), source,/.test(SOURCES["views-sandbox-image-sources.mjs"]), "一键拉取调用点携 `source`（认源态）")
  assert.ok(SOURCES["views-sandbox-image-sources.mjs"].includes("hubLibraryName, openPullImageModal, sourceHost"), "预填复用组装同源规则（零第二份值规则）")
  // 门禁链：本批件在链 ∥ 存量链目标零悬空
  const chain = PKG.scripts.prepublishOnly.match(/docs\/batches\/[^\s"]+/g) ?? []
  assert.ok(chain.includes(BATCH_FILE), "本批件在链（prepublishOnly）")
  for (const rel of chain) assert.ok(existsSync(join(ROOT, rel)), `链目标在盘：${rel}`)
})
