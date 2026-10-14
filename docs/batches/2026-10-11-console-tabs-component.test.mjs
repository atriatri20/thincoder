/**
 * 2026-10-11-console-tabs-component.test.mjs — thincoder-server 批内单测件（控制台公共标签页组件 + 沙盒页分标签首消费；
 * 判据源 = `webui/TABS.md` §2.1/§2.2/§4 ∥ `webui/SANDBOX.md` §2.1①/§4 ∥ `webui/WEBUI.md` §2（子段容许）；名随批档 ·
 * 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-11-console-tabs-component.test.mjs`
 *
 * 射程（腿 ↔ 判据）：
 *   ① 组件基座（§2.1）：句柄形 `{ root, active() }` ∥ DOM 形（`.tabs` > `.tab-list[role=tablist]` + `.tab-panel[role=tabpanel]`）∥
 *     `build` 时点/次数（首激活一次——重切不重建）∥ `initial` 非法回落 ∥ ARIA 成对 ∥ roving tabindex ∥ 多实例标识唯一
 *   ② 切换（§2.1）：点按 ∥ ←/→ 循环 ∥ Home/End ∥ 焦点随激活 ∥ onChange（未变 ⇒ 零回调）∥ 建后保活（面板身份不变）
 *   ③ 首消费（§2.2）：两面板划分（归位逐件）∥ 卡题去重（运行面 h3 去 ∥ 镜像卡 h3 = imagesTitle ∥ 源卡 h3 保留）∥
 *     懒（首激活前零读：镜像源清单 ∥ 镜像表）∥ 节点选单三态（列全部 ∥ 缺省首节点 ∥ 无节点空态）∥ 换选 ⇒ 该节点镜像表重取
 *   ④ 地址栏径三件（§2.2——2026-10-11 裁定「进」）：`nav.mjs` 子段容许（纯函数——既有 hash 形逐字不变、登录面排除）∥ `app.mjs` 三参透传 ∥
 *     页内 `history.replaceState`（零重渲——切换零额外读 ∥ 展开态/弹窗保活）∥ 直打/分享（子段 ⇒ 直达标签 ∥ 非法子段回落首标签）∥ 读在途 ⇒ loading 句
 *   ⑤ 零回归（§2.2）：五族动作面装配点逐族在场（节点/容器/任务/镜像/镜像源）∥ 镜像区零残留于节点展开
 *   ⑥ 静态面（§4）：i18n +2 键两表同步（en 零 CJK ∥ 键集双向相等）∥ 档目 43 ∥ 42（集合快照）∥ 行数/行宽 ∥ 零外链/零 CJK ∥
 *     `t` 字面量闭合 ∥ 类名双向闭合 ∥ AC-19 canon（`:root` 58〔2026-10-12 走查实修④ +8 `--vscode-*` 族桥〕 ∥ 行悬停清单二 ∥ `:hover` 8 = 七 + 页签一）∥ 门禁链含本批件
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

// `tabs.mjs` 头位取件（`document` 尚未桩 —— 即「模块顶层零浏览器全局（node 可 import）」的实证位）
const TABS = await load("tabs.mjs")
const [{ ZH }, { EN }, NAV, SANDBOX, IMAGES] = await Promise.all([
  load("i18n-zh.mjs"), load("i18n-en.mjs"), load("nav.mjs"), load("views-sandbox.mjs"), load("views-sandbox-images.mjs"),
])
const PKG = JSON.parse(readFileSync(join(ROOT, "thincoder-server", "package.json"), "utf8"))
const CSS = readPublic("style.css")
const BATCH_FILE = "docs/batches/2026-10-11-console-tabs-component.test.mjs"
const SOURCES = {
  "tabs.mjs": readPublic("tabs.mjs"),
  "views-sandbox.mjs": readPublic("views-sandbox.mjs"),
  "views-sandbox-images.mjs": readPublic("views-sandbox-images.mjs"),
  "nav.mjs": readPublic("nav.mjs"),
}
const APP = readPublic("app.mjs")

/** 本批新增键（2——两表逐键同步）；zh 值逐字。 */
const NEW_KEYS = { "admin.sandbox.tabImages": "镜像与镜像源", "admin.sandbox.imageNode": "节点" }
/** public/ 档集快照（本批 +1：`tabs.mjs`——档目 43 ∥ 42 ⇒ 48 ∥ 47（2026-10-12 team-projects-permissions 批后））。 */
const PUBLIC_SNAPSHOT = ["app.mjs", "dom.mjs", "favicon.png", "health.mjs", "i18n-en-admin.mjs", "i18n-en-core.mjs", "i18n-en-me.mjs", "i18n-en-project.mjs", "i18n-en-sandbox.mjs",
  "i18n-en-shell.mjs", "i18n-en-system.mjs", "i18n-en.mjs", "i18n-zh-admin.mjs", "i18n-zh-core.mjs", "i18n-zh-me.mjs", "i18n-zh-project.mjs", "i18n-zh-sandbox.mjs", "i18n-zh-shell.mjs",
  "i18n-zh-system.mjs", "i18n-zh.mjs", "i18n.mjs", "index.html", "modal.mjs", "model-specs-snapshot.mjs", "nav.mjs", "style.css", "tabs.mjs",
  "views-admin-projects.mjs", "views-admin.mjs", "views-audit.mjs", "views-auth.mjs", "views-chat-composer.mjs", "views-chat.mjs", "views-git-sources.mjs", "views-me.mjs", "views-models.mjs", "views-overview.mjs",
  "views-projects.mjs", "views-providers-modals.mjs", "views-providers.mjs", "views-sandbox-containers.mjs", "views-sandbox-image-sources.mjs",
  "views-sandbox-images.mjs", "views-sandbox-volumes.mjs", "views-sandbox.mjs", "views-system-config.mjs", "views-system.mjs", "views-usage.mjs"]

/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」「…」等中性标点不在内）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
/** 剥注释（字符串态感知——`//`/`/*` 出现在字符串内不误剥；沿 `2026-10-06-server-i18n.test.mjs` 同法）。 */
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
      out += ch
      if (ch === "\\") { out += next ?? ""; i += 1 }
      else if ((mode === "dq" && ch === '"') || (mode === "sq" && ch === "'") || (mode === "tq" && ch === "`")) mode = "code"
    }
  }
  return out
}

// ── 桩 DOM（`h` 同 app 语义近似；select 取 `value` 属性形）────────────────────────

function makeNode(tag) {
  const classes = new Set()
  return {
    tag, children: [], listeners: {}, attrs: {}, parent: null, focusCount: 0,
    open: false, textContent: "", className: "", value: "", hidden: false, disabled: false, checked: false, tabIndex: 0,
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
    focus() { this.focusCount += 1 },
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
const byClass = (root, name) => fFindAll(root, (node) => String(node.className ?? "").split(" ").includes(name))
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
const callsOf = (calls, method, path) => calls.filter(([m, p]) => m === method && p === path).length

const fRunner = (over = {}) => ({ id: 1, name: "box-a", address: "http://10.0.0.6:2375", status: "ok", online: true, version: "29.1.3", containers: { total: 0, running: 0 }, selfCheck: "ok", createdAt: 1700000000, ...over })
const fImage = (over = {}) => ({ id: "sha256:aaa", tags: ["thincoder-sandbox:1"], size: 123456, created: 1700000000, ...over })
const fSource = (over = {}) => ({ id: 2, name: "自建", address: "https://ghcr.io", kind: "v2", createdAt: "2026-10-11T00:00:00.000Z", ...over })

/** 沙盒页夹具（整页装配 `renderSandbox`——`sub` = 地址栏子段；`history` 桩收 replaceState）。 */
async function fMount({ sub = null, routes = {}, runners = [fRunner()], sources = [fSource()], images = [fImage()], runs = [], settle = true } = {}) {
  globalThis.document = stubDocument()
  const { ctx, calls } = fCtx({
    "GET /api/admin/sandbox/overview": () => ({ status: "ok", runners }),
    "GET /api/admin/sandbox/onboarding": () => ({ runs }),
    "GET /api/admin/sandbox/runners/1/containers": () => ({ containers: [] }),
    "GET /api/admin/sandbox/runners/1/images": () => ({ images }),
    "GET /api/admin/sandbox/runners/2/containers": () => ({ containers: [] }),
    "GET /api/admin/sandbox/runners/2/images": () => ({ images: [] }),
    "GET /api/admin/sandbox/image-sources": () => ({ sources }),
    "GET /api/admin/sandbox/image-sources/presets": () => ({ presets: [] }),
    "GET /api/admin/providers": () => ({ providers: [] }),
    ...routes,
  })
  globalThis.history = { replaceState: (_state, _title, url) => calls.push(["replaceState", url]) }
  const mount = makeNode("section")
  await SANDBOX.renderSandbox(ctx, mount, sub)
  if (settle) await tick()
  return { ctx, calls, mount }
}
const tabButtons = (mount) => byClass(mount, "tab")
const tabPanels = (mount) => byClass(mount, "tab-panel")
const activeTab = (mount) => tabButtons(mount).find((button) => String(button.className).includes("active")) ?? null
const closePage = () => { delete globalThis.document; delete globalThis.history }

// ── ① 组件基座（API 形 ∥ DOM/ARIA ∥ build 时点/次数 ∥ initial 回落）────────────

test("① 组件基座：句柄形 ∥ DOM/ARIA 成对 ∥ build 首激活一次 ∥ initial 非法回落 ∥ 多实例标识唯一", () => {
  const built = []
  const ctx = { h: fH }
  const tabs = TABS.createTabs(ctx, {
    tabs: [
      { id: "runners", labelKey: "admin.sandbox.runnersTitle", build: () => { built.push("runners"); return fH("p", { text: "R" }) } },
      { id: "images", labelKey: "admin.sandbox.tabImages", build: () => { built.push("images"); return fH("p", { text: "I" }) } },
    ],
  })
  assert.deepEqual(Object.keys(tabs).sort(), ["active", "root"], "句柄形 = { root, active() }")
  assert.equal(tabs.active(), "runners", "初始激活 = 首项（initial 缺省）")
  assert.deepEqual(built, ["runners"], "build 时点 = 建时（首项即首激活）——余项未建")
  assert.equal(tabs.root.className, "tabs", "容器 `.tabs`")
  const [list, ...panels] = tabs.root.children
  assert.deepEqual([list.className, list.attrs.role], ["tab-list", "tablist"], "页签条 `.tab-list[role=tablist]`")
  const buttons = list.children
  assert.equal(buttons.length, 2, "两页签钮")
  assert.deepEqual(buttons.map((button) => [button.tag, button.attrs.type, button.attrs.role]), [["button", "button", "tab"], ["button", "button", "tab"]], "`button.tab[role=tab]` + `type=button`")
  assert.deepEqual(buttons.map((button) => button.textContent), [ZH["admin.sandbox.runnersTitle"], ZH["admin.sandbox.tabImages"]], "页签文案 = 表键取值（组件零自持文案）")
  assert.deepEqual(panels.map((panel) => [panel.className, panel.attrs.role]), [["tab-panel", "tabpanel"], ["tab-panel", "tabpanel"]], "每页签一节 `.tab-panel[role=tabpanel]`")
  assert.deepEqual(buttons.map((button) => button.attrs["aria-controls"]), panels.map((panel) => panel.attrs.id), "`aria-controls` ⇒ 面板 id 成对")
  assert.deepEqual(panels.map((panel) => panel.attrs["aria-labelledby"]), buttons.map((button) => button.attrs.id), "`aria-labelledby` ⇒ 页签 id 成对")
  assert.deepEqual(buttons.map((button) => [button.attrs["aria-selected"], button.attrs.tabindex]), [["true", "0"], ["false", "-1"]], "roving tabindex（激活 0 ∥ 余 −1）")
  assert.deepEqual(panels.map((panel) => panel.hidden), [false, true], "非激活面板 `hidden`; 激活面在场")
  assert.deepEqual([buttons[0].attrs.id, ...panels.map((panel) => panel.attrs.id)], [...new Set([buttons[0].attrs.id, ...panels.map((panel) => panel.attrs.id)])], "DOM 标识唯一")
  const second = TABS.createTabs(ctx, { tabs: [{ id: "runners", labelKey: "admin.sandbox.runnersTitle", build: () => null }] })
  assert.notEqual(second.root.children[0].children[0].attrs.id, buttons[0].attrs.id, "多实例 DOM 标识前缀唯一")
  assert.equal(second.root.children[1].children.length, 0, "`build` 返回 null ⇒ 零动作（面板空）")
  const fallback = TABS.createTabs(ctx, { tabs: [{ id: "runners", labelKey: "admin.sandbox.runnersTitle", build: () => null }], initial: "nope" })
  assert.equal(fallback.active(), "runners", "`initial` 非法 ⇒ 首项静默回落（零炸）")
})

// ── ② 切换（点按 ∥ 键盘 ∥ onChange ∥ 保活）─────────────────────────────────────

test("② 切换：点按 ∥ ←/→ 循环 ∥ Home/End ∥ 焦点随激活 ∥ onChange（未变零回调）∥ 建后保活", async () => {
  const built = []
  const changed = []
  const tabs = TABS.createTabs({ h: fH }, {
    tabs: [
      { id: "a", labelKey: "admin.sandbox.runnersTitle", build: () => { built.push("a"); return fH("p", { text: "A" }) } },
      { id: "b", labelKey: "admin.sandbox.tabImages", build: () => { built.push("b"); return fH("p", { text: "B" }) } },
    ],
    onChange: (id) => changed.push(id),
  })
  const [list, panelA, panelB] = tabs.root.children
  const [buttonA, buttonB] = list.children

  await buttonB.fire("click") // 点按 = 激活（同链）
  const contentB = panelB.children[0] // 建后面板内容（保活判据基线）
  assert.equal(tabs.active(), "b", "点按 ⇒ 激活")
  assert.deepEqual(built, ["a", "b"], "点按 ⇒ 该面板首建（一次）")
  assert.deepEqual(changed, ["b"], "onChange 每次激活变更一次")
  assert.deepEqual([buttonB.attrs["aria-selected"], buttonB.attrs.tabindex, buttonB.className], ["true", "0", "tab active"], "选中态四件同拍")
  assert.deepEqual([buttonA.attrs["aria-selected"], buttonA.attrs.tabindex, panelA.hidden, panelB.hidden], ["false", "-1", true, false], "余项退态")

  await buttonA.fire("click")
  await buttonB.fire("click") // 重切
  assert.deepEqual(built, ["a", "b"], "重切不重建（结果缓存）")
  assert.equal(panelB.children[0], contentB, "建后保活（面板内容身份不变——状态/滚动不丢）")
  assert.deepEqual(changed, ["b", "a", "b"], "往返两次变更 = 两次回调")

  await buttonB.fire("keydown", { key: "ArrowRight" }) // 循环：末项 ⇒ 首项
  assert.deepEqual([tabs.active(), buttonA.focusCount], ["a", 1], "`→` 循环 + 焦点随激活")
  await buttonA.fire("keydown", { key: "ArrowLeft" }) // 循环：首项 ⇒ 末项
  assert.equal(tabs.active(), "b", "`←` 循环")
  await buttonB.fire("keydown", { key: "Home" })
  assert.equal(tabs.active(), "a", "`Home` ⇒ 首")
  await buttonA.fire("keydown", { key: "End" })
  assert.equal(tabs.active(), "b", "`End` ⇒ 末")
  const before = changed.length
  await buttonB.fire("keydown", { key: "End" }) // 已末 ⇒ 未变
  await buttonB.fire("click")
  assert.equal(changed.length, before, "激活未变 ⇒ 零回调")
  await buttonB.fire("keydown", { key: "ArrowDown" }) // 枚举外键 ⇒ 零动作
  assert.equal(tabs.active(), "b", "枚举外键零动作")
})

// ── ③ 首消费：沙盒页分标签（面板划分 ∥ 卡题去重 ∥ 懒 ∥ 节点选单）──────────────

test("③ 沙盒分标签：两面板划分 ∥ 卡题去重 ∥ 懒（首激活前零读）∥ 节点选单三态 ∥ 换选重取", async () => {
  try {
    const { calls, mount } = await fMount({ runners: [fRunner(), fRunner({ id: 2, name: "box-b", online: false })] })
    const [panelRunners, panelImages] = tabPanels(mount)
    const [buttonRunners, buttonImages] = tabButtons(mount)
    assert.equal(byText(mount, ZH["admin.sandbox.title"]) !== null, true, "页题「沙盒」在场")
    assert.equal(String(activeTab(mount).textContent), ZH["admin.sandbox.runnersTitle"], "首标签 = 运行面（缺省）")

    // 归位逐件（标签①）：提示条 ∥ 两钮 ∥ 节点表 ∥ 装机任务区
    assert.deepEqual([byText(panelRunners, ZH["admin.sandbox.addRunner"]) !== null, byText(panelRunners, ZH["admin.sandbox.onboardingBtn"]) !== null], [true, true], "「添加节点」∥「托管接入」入标签①")
    assert.equal(byText(panelRunners, ZH["admin.sandbox.name"]) !== null, true, "节点表入标签①")
    assert.equal(byText(panelRunners, ZH["admin.sandbox.tasksTitle"]) !== null, true, "装机任务区（h4）入标签①")
    assert.equal(fFindAll(panelRunners, (node) => node.tag === "h3").every((node) => node.textContent !== ZH["admin.sandbox.runnersTitle"]), true, "卡题去重：运行面卡 h3 去（面题入标签——同词不双题）")
    assert.equal(fFind(panelRunners, (node) => node.tag === "section" && String(node.className).includes("card")) !== null, true, "卡壳保留（岔口㈡）")

    // 懒建：标签②面板首激活前零内容（面板建时挂入）
    assert.deepEqual(panelImages.children, [], "标签②面板首激活前零内容（懒建——㈢ 裁定）")

    // 懒：首激活前零读（镜像源清单 ∥ 镜像表）；页级单源读取已触发（首激活面板）
    assert.deepEqual([callsOf(calls, "GET", "/api/admin/sandbox/image-sources"), callsOf(calls, "GET", "/api/admin/sandbox/runners/1/images")], [0, 0], "标签②未激活 ⇒ 镜像源清单/镜像表零读（懒——㈢ 裁定）")
    assert.deepEqual([callsOf(calls, "GET", "/api/admin/sandbox/overview"), callsOf(calls, "GET", "/api/admin/sandbox/onboarding")], [1, 1], "标签①首激活触发页级读取（节点清单 + 装机任务）")

    // 激活标签②（懒建）：镜像源清单 + 镜像表随建读
    await buttonImages.fire("click")
    assert.equal(activeTab(mount).textContent, ZH["admin.sandbox.tabImages"], "点按 ⇒ 标签②激活")
    await tick()
    assert.deepEqual([callsOf(calls, "GET", "/api/admin/sandbox/image-sources"), callsOf(calls, "GET", "/api/admin/sandbox/runners/1/images")], [1, 1], "标签②首激活 ⇒ 镜像源清单 + 镜像表各读一次")
    assert.equal(callsOf(calls, "GET", "/api/admin/sandbox/overview"), 1, "节点清单 = 页级单源（两面板共读——只读一次）")

    // 归位逐件（标签②）：镜像卡（h3 imagesTitle + 节点选单）∥ 镜像源卡（h3 保留）
    const imageCardHeads = fFindAll(panelImages, (node) => node.tag === "h3").map((node) => node.textContent)
    assert.deepEqual(imageCardHeads, [ZH["admin.sandbox.imagesTitle"], ZH["admin.sandbox.sourcesTitle"]], "标签② = 镜像卡 + 镜像源卡（卡题逐枚）")
    const select = fFind(panelImages, (node) => node.tag === "select")
    assert.deepEqual([select.attrs.id ?? null, select.parent.tag], [null, "label"], "节点选单在场（标签行）")
    assert.equal(textOf(select.parent).includes(ZH["admin.sandbox.imageNode"]), true, "选单 label = `imageNode` 键")
    assert.equal(fFindAll(panelImages, (node) => node.tag === "h3" && node.textContent === ZH["admin.sandbox.sourcesTitle"]).length, 1, "镜像源卡 h3 保留（件零改）")
    assert.equal(byText(panelImages, ZH["admin.sandbox.imagePull"]) !== null, true, "镜像区（拉取钮）入标签②")
    assert.equal(byText(panelImages, ZH["admin.sandbox.sourceAdd"]) !== null, true, "镜像源卡（添加源钮）入标签②")

    // 节点选单：列全部注册节点（在线/离线皆列）；缺省 = 首节点
    const options = select.children
    assert.deepEqual(options.map((option) => option.textContent), ["box-a", "box-b"], "选单 = 全部注册节点（离线亦列）")
    assert.equal(select.value, "1", "缺省 = 首节点")

    // 换选 ⇒ 该节点镜像表重取（失缓存）
    select.value = "2"
    await select.fire("change")
    await tick()
    assert.equal(callsOf(calls, "GET", "/api/admin/sandbox/runners/2/images"), 1, "换选 ⇒ 新节点镜像表重取")
    await buttonRunners.fire("click") // 切回再切来（不重取——缓存在场）
    await buttonImages.fire("click")
    await tick()
    assert.equal(callsOf(calls, "GET", "/api/admin/sandbox/runners/2/images"), 1, "重切不重建/不重取（面板保活）")
  } finally { closePage() }
})

test("③ 节点选单：无节点 ⇒ 空态句（复用 `empty`）∥ 空选单", async () => {
  try {
    const { mount } = await fMount({ runners: [] })
    await tabButtons(mount)[1].fire("click")
    await tick()
    const select = fFind(tabPanels(mount)[1], (node) => node.tag === "select")
    assert.deepEqual(select.children.map((option) => option.textContent), [], "无节点 ⇒ 空选单")
    assert.equal(byText(tabPanels(mount)[1], ZH["admin.sandbox.empty"]) !== null, true, "无节点 ⇒ 空态句（复用 `admin.sandbox.empty`）")
    assert.equal(byText(tabPanels(mount)[0], ZH["admin.sandbox.empty"]) !== null, true, "标签①照常（零节点提示）")
  } finally { closePage() }
})

// ── ④ 地址栏径三件（nav 子段 ∥ app 三参 ∥ 页内 replaceState）──────────────────

test("④ 地址栏径：`nav.mjs` 子段容许（既有 hash 形逐字不变）∥ `app.mjs` 三参透传 ∥ 页内 replaceState（零重渲）", async () => {
  assert.deepEqual(NAV.resolveRoute("/admin/sandbox/images", "admin"), { path: "/admin/sandbox", sub: "images" }, "子段形 ⇒ 在册页 + `sub` 回传")
  assert.deepEqual(NAV.resolveRoute("/admin/sandbox/runners", "admin"), { path: "/admin/sandbox", sub: "runners" }, "子段 ∈ 两枚（runners ∥ images——页面自判）")
  assert.deepEqual(NAV.resolveRoute("/admin/sandbox", "admin"), { path: "/admin/sandbox" }, "无子段 ⇒ 逐字同前（零新增键）")
  assert.deepEqual(NAV.resolveRoute("/admin/sandbox/", "admin"), { path: "/admin/sandbox" }, "尾斜杠归一（既有形）")
  assert.deepEqual(NAV.resolveRoute("/admin/sandbox/images", "user"), { path: "/admin/sandbox", sub: "images", denied: true }, "子段形同受 denied 判")
  assert.deepEqual(NAV.resolveRoute("/admin/sandbox/deep/extra", "admin"), { path: "/admin/overview", redirect: true }, "越一截子段 ⇒ 照旧默认页回落")
  assert.deepEqual([NAV.resolveRoute("/login/images", "admin"), NAV.resolveRoute("/login/x", "user")],
    [{ path: "/admin/overview", redirect: true }, { path: "/me/keys", redirect: true }], "登录面子段形 ⇒ 照旧默认页回落（登录面不经 PAGES 分派）")
  assert.deepEqual([NAV.resolveRoute("/me/keys/x", "user"), NAV.resolveRoute("/admin/proxy", "admin"), NAV.resolveRoute("/nope", "user")],
    [{ path: "/me/keys", sub: "x" }, { path: "/admin/system", redirect: true }, { path: "/me/keys", redirect: true }], "子段容宽 + 别名/未知回落（既有形行为不变）")
  assert.ok(APP.includes("PAGES[resolved.path](viewCtx(), mount, resolved.sub ?? null)"), "`app.mjs` 三参透传（视图面第三参 = 子段）")

  try {
    const { calls, mount } = await fMount()
    await tabButtons(mount)[1].fire("click")
    await tabButtons(mount)[0].fire("click")
    assert.deepEqual(calls.filter(([tag]) => tag === "replaceState").map(([, url]) => url), ["#/admin/sandbox/images", "#/admin/sandbox/runners"], "切换 ⇒ `history.replaceState` 写子段（不触发 hashchange）")
    const reads = calls.filter(([method]) => method === "GET").length
    await tabButtons(mount)[1].fire("click")
    await tick()
    assert.equal(calls.filter(([method]) => method === "GET").length, reads, "切换零额外读（零重渲——面板保活）")

    // 直打/分享：`sub` ⇒ 该标签起、零 replaceState（地址栏原样）
    const direct = await fMount({ sub: "images" })
    assert.equal(String(activeTab(direct.mount).textContent), ZH["admin.sandbox.tabImages"], "子段 `images` ⇒ 直达标签②")
    assert.equal(direct.calls.filter(([tag]) => tag === "replaceState").length, 0, "直达零改写（地址栏原样）")
    const bad = await fMount({ sub: "nope" })
    assert.equal(String(activeTab(bad.mount).textContent), ZH["admin.sandbox.runnersTitle"], "非法子段 ⇒ 首标签回落（组件 `initial` 校验）")
    assert.equal(callsOf(bad.calls, "GET", "/api/admin/sandbox/image-sources"), 0, "非法子段回落后标签②未建（懒保守）")

    // 直打标签②：读在途 ⇒ 读势三态生效（loading，非「无节点」空态句）——同节点表口径
    let release = null
    const gate = new Promise((resolve) => { release = resolve })
    const loading = await fMount({ sub: "images", settle: false, routes: { "GET /api/admin/sandbox/overview": () => gate.then(() => ({ status: "ok", runners: [fRunner()] })) } })
    assert.equal(byText(tabPanels(loading.mount)[1], ZH["common.loading"]) !== null, true, "直打标签②：读在途 ⇒ loading 句")
    assert.equal(byText(tabPanels(loading.mount)[1], ZH["admin.sandbox.empty"]), null, "读在途不落「无节点」空态（免误告）")
    release()
    await tick()
    assert.equal(byText(tabPanels(loading.mount)[1], ZH["admin.sandbox.empty"]), null, "读数回 ⇒ 表在册（非空态）")
    assert.equal(callsOf(loading.calls, "GET", "/api/admin/sandbox/overview"), 1, "读触发一次（两面板共读单源）")
  } finally { closePage() }
})

// ── ⑤ 零回归：五族动作面装配点 + 镜像区零残留 ────────────────────────────────

test("⑤ 零回归：五族动作面装配点逐族在场 ∥ 镜像区零残留于节点展开 ∥ 弹窗保活", async () => {
  try {
    const { calls, mount } = await fMount()
    const [panelRunners, panelImages] = tabPanels(mount)

    // 节点族：添/删钮在场 + 弹窗照旧可达（件零改）
    await byText(panelRunners, ZH["admin.sandbox.addRunner"]).fire("click")
    await tick()
    const dialog = fFind(globalThis.document.body, (node) => node.tag === "dialog")
    assert.equal(fFind(dialog, (node) => node.tag === "h3").textContent, ZH["admin.sandbox.addRunner"], "节点族：添加节点弹窗（公共件零改）")

    // 容器族：节点行展开 ⇒ 容器区在位（`/containers` 读 + 创建容器钮）；镜像区零残留
    await byText(panelRunners, ZH["admin.sandbox.expand"]).fire("click")
    await tick()
    assert.equal(callsOf(calls, "GET", "/api/admin/sandbox/runners/1/containers"), 1, "容器族：展开 ⇒ 容器区读（懒加载口径不变）")
    assert.equal(byText(panelRunners, ZH["admin.sandbox.createContainer"]) !== null, true, "容器族：创建容器钮在场")
    assert.equal(callsOf(calls, "GET", "/api/admin/sandbox/runners/1/images"), 0, "镜像区零残留于节点展开（迁标签②）")
    assert.equal(byText(panelRunners, ZH["admin.sandbox.imagesTitle"]), null, "镜像区题不入标签①")

    // 任务族：装机任务区在场（空态句）
    assert.equal(byText(panelRunners, ZH["admin.sandbox.tasksEmpty"]) !== null, true, "任务族：装机任务区照旧（空态）")

    // 弹窗保活：切换标签不关窗（`closeActiveModal` 收口口径不变——切换非路由切换）
    await tabButtons(mount)[1].fire("click")
    assert.equal(fFind(globalThis.document.body, (node) => node.tag === "dialog") !== null, true, "切换标签 ⇒ 在场弹窗保活")

    // 镜像族 + 镜像源族：标签②在位
    await tick()
    assert.equal(byText(panelImages, ZH["admin.sandbox.imagePull"]) !== null, true, "镜像族：拉取镜像钮在场")
    assert.equal(byText(panelImages, ZH["admin.sandbox.remove"]) !== null, true, "镜像族：行删除钮在场")
    assert.deepEqual([byText(panelImages, ZH["admin.sandbox.sourceCatalogBtn"]) !== null, byText(panelImages, ZH["admin.sandbox.sourceEdit"]) !== null], [true, true], "镜像源族：目录/改 行钮在场")
  } finally { closePage() }
})

// ── ⑥ i18n 两键 + 静态面（档目 ∥ canon ∥ 闭合 ∥ 门禁链）──────────────────────

test("⑥ i18n：本批 2 键两表逐键在场 ∥ 键集双向相等 ∥ zh 值逐字 ∥ en 零 CJK", () => {
  for (const [key, zhValue] of Object.entries(NEW_KEYS)) {
    assert.equal(ZH[key], zhValue, `zh 值逐字：${key}`)
    assert.ok(typeof EN[key] === "string" && EN[key].trim() !== "", `en 表缺键：${key}`)
    assert.equal(CJK.test(EN[key]), false, `en 值含 CJK：${key}`)
  }
  const SELF_NAMES = new Set(["lang.zh", "lang.en"])
  const base = (table) => new Set(Object.keys(table).filter((key) => !SELF_NAMES.has(key)).map((key) => key.replace(/\.one$/, "")))
  assert.equal(Object.keys(ZH).length, 854, "zh 键数 854（2026-10-11 批组 + 走查实修后 + 走查实修④ kind +4 + 轻通道笔 10 +2 + admin-agent-awareness 批 +3 + team-projects-permissions 批 +158——实读；跨批件 `2026-10-08-server-public-structure.test.mjs` 同拍随正）")
  assert.equal(Object.keys(EN).length, 859, "en 键数 859（2026-10-11 批组 + 走查实修后 + 走查实修④ kind +4 + 轻通道笔 10 +2 + admin-agent-awareness 批 +3 + team-projects-permissions 批 +158——实读）")
  assert.deepEqual([...base(ZH)].filter((key) => !base(EN).has(key)), [], "仅 zh 键（自称名族除外）")
  assert.deepEqual([...base(EN)].filter((key) => !base(ZH).has(key)), [], "仅 en 键")
})

test("⑥ 静态面：档目 48 ∥ 47 ∥ 行数/行宽 ∥ 零外链/零 CJK ∥ `t` 字面量闭合 ∥ 类名双向闭合", () => {
  const names = readdirSync(PUBLIC_DIR).sort()
  assert.deepEqual(names, [...PUBLIC_SNAPSHOT].sort(), "public/ 文件集合 = 快照（本批 +1：`tabs.mjs`）")
  assert.deepEqual([names.length, names.filter((name) => name !== "favicon.png").length], [48, 47], "档目 48 ∥ 47（test 口径——2026-10-12 team-projects-permissions 批后）")
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
  for (const token of ["tabs", "tab-list", "tab", "tab-panel", "active"]) assert.ok(cssClasses.has(token), `页签族类在册：${token}`)
  assert.equal(SOURCES["views-sandbox.mjs"].includes("createImageSourceSection(ctx, { onPulled: (runner) => { images.reset(runner); loadRunners() } }).card"), true, "镜像源卡随标签②建（懒读单点）")
  assert.equal(/build: buildImagePanel/.test(SOURCES["views-sandbox.mjs"]), true, "标签② `build` 接线在册")
  assert.equal(TABS.createTabs !== undefined && typeof TABS.createTabs === "function", true, "公共组件导出面（node 可 import——经头位取件）")
})

test("⑥ AC-19 canon：`:root` 58 ∥ 行悬停清单不变 ∥ `:hover` 8（七 + 页签一）∥ 门禁链含本批件", () => {
  const cssClean = stripComments(CSS)
  assert.equal([...cssClean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].length, 58, ":root 58（2026-10-11 走查轮后基线——㈣ 裁定后 ⇒ 2026-10-12 走查实修④ +8）")
  const rules = [...cssClean.matchAll(/([^{}]*)\{([^{}]*)\}/g)].map((match) => [match[1].trim().replace(/\s+/g, " "), match[2].trim().replace(/\s+/g, " ")])
  const hovers = rules.filter(([selector]) => selector.includes(":hover"))
  assert.deepEqual(hovers.map(([selector]) => selector).sort(),
    ["button.danger:hover", "button.link:hover", "button.tab:hover", "button.tiny:hover", "button:hover", ".modal-close:hover", ".nav-item:hover", "tbody tr:hover"].sort(),
    "悬停声明 = 行悬停二 + 交互件五 + 页签一（② 型表在册）")
  assert.deepEqual(rules.filter(([selector]) => selector.includes("tr:hover") || selector === ".nav-item:hover").map(([selector, body]) => [selector, body]),
    [[".nav-item:hover", "background: var(--hover);"], ["tbody tr:hover", "background: var(--hover);"]], "行悬停声明清单不变（同取 `--hover`）")
  assert.equal(rules.find(([selector]) => selector === "button.tab:hover")[1], "background: var(--hover);", "页签悬停取 `--hover` 底（② 型表在册）")
  assert.deepEqual(rules.find(([selector]) => selector === "button.tab.active"), ["button.tab.active", "background: var(--selected); color: var(--accent);"], "页签选中态 = `--selected` 底 + `--accent` 字")
  const chain = PKG.scripts.prepublishOnly.match(/docs\/batches\/[^\s"]+/g) ?? []
  assert.ok(chain.includes(BATCH_FILE), "本批件在链（prepublishOnly）")
  for (const rel of chain) assert.ok(existsSync(join(ROOT, rel)), `链目标在盘：${rel}`)
  assert.equal(IMAGES.createImageSection !== undefined, true, "镜像区件导出面零改（接口零改——仅题行去重）")
})
