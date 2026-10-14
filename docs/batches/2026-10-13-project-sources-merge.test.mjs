/**
 * 2026-10-13-project-sources-merge.test.mjs — thincoder-server 批内单测件（项目面单入口合并 + 添加源基址门修复——功能点 48 ∥ AC-48；
 * 判据源 = `webui/PROJECTS.md` §2.2/§2.3/§2.4/§4 ∥ `webui/WEBUI.md` §2/§6 ∥ `webui/STYLE.md` §2.3/§4 ∥ `webui/TABS.md` §2.3）；
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存。
 * 运行（自 `thincoder/` 仓根）：`node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/2026-10-13-project-sources-merge.test.mjs`
 *
 * 射程（腿 ↔ 判据）：
 *   ① nav 直测（AC-48①② ∥ AC-12）：管理 10 项（旧入口退场）∥ 别名行 +1 ∥ 解析序（别名先行、别名目标再走子段裁分 ⇒ `sub` 回传）∥
 *     redirect 解析形（旧址 ⇒ `path` + `sub` + `redirect`）∥ 既有别名/角色默认/未知回落零改
 *   ② app 装配（AC-48②）：`PAGES` 无 git-sources 行 ∥ 不再直挂 Git 源件 ∥ 重定向带子段（源码 + 合成目标）∥ 三参透传 ∥ `SHELL_PAGES` 五路径零改
 *   ③ 页装配（AC-48①③）：两标签在场（词 = 原两入口词——键复用）∥ 懒读时点/次数（未激活面板零读）∥ `replaceState` 写子段（零重渲）∥
 *     直打/非法子段回落 ∥ 面板保活（重切零读）
 *   ④ 面板②零回归（AC-44⑦⑨ · 控制台面）：源表七列/五钮在场 ∥「添加源」钮行 ∥ 页题 h2 撤销（面题入标签——同词不双题）
 *   ⑤ 基址门（AC-48④）：弹窗两态（非自建 ⇒ `baseField.hidden === true`；「自建」⇒ false——真值切换）∥ github 事件块两态同规 ∥
 *     自建必填提交门在册 ∥ 组件侧零内联 display（修在 CSS 侧——`hidden` 写法逐字不动）
 *   ⑥ CSS 静态（AC-48⑤ ∥ AC-19 canon）：全局 `[hidden]` 兜底在册（含 `display: none` 与 `!important`）∥ `!important` 计数 = 1 ∥
 *     旧两按例补丁字面零残留 ∥ 核对表穷尽性集合断言 ∥ `:root` 58 ∥ 悬停清单八
 *   ⑦ i18n（AC-14 · 本批零触）：shell ∥ project 两域部件键数零动（61 ∥ 154——两表逐表）∥ 两表键集对位 ∥ 标签词逐字（复用既有键）∥ 新壳 `t` 字面量闭合 ∥ en 零 CJK
 *     （门面全局键数/指纹 = 跨批结构守卫件面，不入本件——他批增键不得动本批判定；2026-10-13 并行批实证：sandbox 域 +3 键）
 *
 * 桩说明：`dom.mjs` 顶层触 `document`（`flashEl` 取件——WEBUI §1）⇒ 先桩后 import；本档零网络/零真模型（stub ctx 路由表）。
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

globalThis.document = { getElementById: () => null } // `dom.mjs` 顶层取件桩（先桩后 import）

const [{ ZH }, { EN }, { ZH_PROJECT }, { EN_PROJECT }, { ZH_SHELL }, { EN_SHELL }] = await Promise.all([
  load("i18n-zh.mjs"), load("i18n-en.mjs"),
  load("i18n-zh-project.mjs"), load("i18n-en-project.mjs"),
  load("i18n-zh-shell.mjs"), load("i18n-en-shell.mjs"),
])
const NAV = await load("nav.mjs")
const ADMIN_VIEW = await load("views-admin-projects.mjs")
const APP = readPublic("app.mjs")
const CSS = readPublic("style.css")
const ADMIN_SRC = readPublic("views-admin-projects.mjs")
const GIT_SRC = readPublic("views-git-sources.mjs")

/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」「…」等中性标点不在内）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
/** 剥注释（字符串态感知——沿 `2026-10-11-console-tabs-component.test.mjs` 同法）。 */
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

// ── 桩 DOM（`h` 同 app 语义近似；modal 壳面近形）────────────────────────────────

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
const settle = async () => { await tick(); await tick(); await tick() }
const modalOf = () => fFind(globalThis.document.body, (node) => node.tag === "dialog")
const tabButtons = (root) => fFindAll(root, (node) => String(node.className).split(" ").includes("tab"))
const tabPanels = (root) => fFindAll(root, (node) => String(node.className).split(" ").includes("tab-panel"))
const activeTab = (root) => tabButtons(root).find((button) => String(button.className).includes("active")) ?? null

/** 桩 ctx（api 路由表 `"METHOD path"` ⇒ handler；全调用入 `calls`）。 */
function fCtx(routes = {}) {
  const calls = []
  const ctx = {
    h: fH,
    state: { member: { username: "alice", role: "admin" }, system: null },
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
    showSecret: (box, label, value) => { box.hidden = false; box.replaceChildren(fH("code", { class: "secret-value", text: value })) },
  }
  return { ctx, calls }
}
const callsOf = (calls, method, path) => calls.filter(([m, p]) => m === method && p === path).length
const replaceUrls = (calls) => calls.filter(([tag]) => tag === "replaceState").map(([, url]) => url)

const fProject = (over = {}) => ({ id: 1, displayName: "Repo One", address: "https://gitee.com/org/repo", source: { id: 7, name: "src-a", platform: "gitee" }, owner: "alice", memberCount: 2, ...over })
const fSource = (over = {}) => ({
  id: 1, name: "src-a", platform: "github", baseURL: null, scope: "org-a", token: { set: true, hint: "…abcd" }, hookSecret: { set: false, hint: null },
  enabled: 1, syncMode: "poll", intervalMinutes: 60, lastSyncAt: null, lastSyncResult: {}, tokenState: "unknown", tokenCheckedAt: null, createdAt: "2026-10-13T00:00:00Z", ...over,
})

/** 页夹具（整页装配 `renderAdminProjects`——`sub` = 地址栏子段；`history` 桩收 replaceState）。 */
async function fMount({ sub = null, routes = {} } = {}) {
  globalThis.document = stubDocument()
  const { ctx, calls } = fCtx({
    "GET /api/projects": () => ({ projects: [fProject()] }),
    "GET /api/admin/git-sources": () => ({ sources: [fSource()] }),
    "GET /api/members": () => ({ members: [{ username: "alice" }] }),
    ...routes,
  })
  globalThis.history = { replaceState: (_state, _title, url) => calls.push(["replaceState", url]) }
  const mount = makeNode("section")
  await ADMIN_VIEW.renderAdminProjects(ctx, mount, sub)
  await settle()
  return { ctx, calls, mount }
}
const closePage = () => { delete globalThis.document; delete globalThis.history }

/** 源表七列（既有键——零改）。 */
const SOURCE_HEADERS = ["admin.gitSources.name", "admin.gitSources.col.platform", "admin.gitSources.pat", "admin.gitSources.col.status",
  "admin.gitSources.col.syncMode", "admin.gitSources.col.lastSync", "admin.gitSources.col.actions"]

// ── ① nav 直测（管理 10 ∥ 别名 ∥ `sub` 回传 ∥ redirect 解析形）──────────────────

test("① nav 直测：管理 10（旧入口退场）∥ 别名 +1 ∥ 解析序 sub 回传 ∥ redirect 带子段 ∥ 既有形零改", () => {
  const [me, admin] = NAV.NAV_GROUPS
  assert.deepEqual(NAV.NAV_GROUPS.map((group) => group.key), ["me", "admin"], "两组")
  assert.deepEqual(me.items.map((item) => item.path), ["/me/keys", "/me/usage", "/me/account", "/me/projects", "/me/sandbox", "/me/ledger"], "我的 6——零改")
  assert.deepEqual(admin.items.map((item) => item.path),
    ["/admin/overview", "/admin/chat", "/admin/members", "/admin/projects", "/admin/providers", "/admin/models", "/admin/usage", "/admin/audit", "/admin/system", "/admin/sandbox"],
    "管理 10——`#/admin/git-sources` 项退场（并入项目页两标签）")
  assert.equal(admin.items.some((item) => item.path === "/admin/git-sources"), false, "旧入口不在册")
  assert.equal(admin.adminOnly, true, "admin 组仅 admin")
  for (const item of [...me.items, ...admin.items]) assert.ok(item.labelKey in ZH && item.labelKey in EN, `labelKey 两表在盘：${item.labelKey}`)
  assert.deepEqual(NAV.ROUTE_ALIASES,
    { "/me": "/me/keys", "/admin": "/admin/overview", "/admin/proxy": "/admin/system", "/admin/git-sources": "/admin/projects/git-sources" },
    "别名集 +1（旧链 ⇒ 子段形规范址）")

  // 解析序 = 别名先行、别名目标再走子段裁分 ⇒ `sub` 回传（AC-48②）
  assert.deepEqual(NAV.resolveRoute("/admin/git-sources", "admin"), { path: "/admin/projects", sub: "git-sources", redirect: true }, "老址 ⇒ 规范址 + `sub` 回传 + redirect")
  const resolved = NAV.resolveRoute("/admin/git-sources", "admin")
  assert.equal(resolved.sub === undefined ? resolved.path : `${resolved.path}/${resolved.sub}`, "/admin/projects/git-sources", "重定向目标 = 子段形（落标签②——app 拼回）")
  assert.deepEqual(NAV.resolveRoute("/admin/projects/git-sources", "admin"), { path: "/admin/projects", sub: "git-sources" }, "子段直打/刷新 ⇒ 同落（零 redirect）")
  assert.deepEqual(NAV.resolveRoute("/admin/projects/projects", "admin"), { path: "/admin/projects", sub: "projects" }, "子段 `projects` ⇒ 标签①（同形）")
  assert.deepEqual(NAV.resolveRoute("/admin/projects/nope", "admin"), { path: "/admin/projects", sub: "nope" }, "非法子段 ⇒ 照传（页面回落——组件 `initial` 静默校验）")
  assert.deepEqual(NAV.resolveRoute("/admin/projects", "admin"), { path: "/admin/projects" }, "无子段 ⇒ 逐字同前")
  assert.deepEqual(NAV.resolveRoute("/admin/git-sources", "user"), { path: "/admin/projects", sub: "git-sources", redirect: true, denied: true }, "user ⇒ redirect 先行 ∥ denied 共存（页面级块照落）")
  assert.deepEqual([NAV.resolveRoute("/me", "user"), NAV.resolveRoute("/admin", "admin"), NAV.resolveRoute("/admin/proxy", "admin"), NAV.resolveRoute("/nope", "user")],
    [{ path: "/me/keys", redirect: true }, { path: "/admin/overview", redirect: true }, { path: "/admin/system", redirect: true }, { path: "/me/keys", redirect: true }],
    "既有别名/未知回落逐字不变")
  assert.deepEqual([NAV.defaultPath("admin"), NAV.defaultPath("user")], ["/admin/overview", "/me/keys"], "角色默认页零改")
})

// ── ② app 装配（PAGES 无 git-sources 行 ∥ 重定向带子段 ∥ 三参透传）───────────────

test("② app 装配：`PAGES` 无 git-sources 行 ∥ 不再直挂 Git 源件 ∥ 重定向带子段 ∥ 三参透传 ∥ 壳页集零改", () => {
  const pages = APP.match(/const PAGES = \{([\s\S]*?)\n\}/)[1]
  assert.equal(pages.includes("/admin/git-sources"), false, "`PAGES` 无 git-sources 行（页不再直挂——走别名）")
  assert.ok(pages.includes('"/admin/projects": renderAdminProjects'), "项目页行在册（两标签壳）")
  assert.equal(APP.includes("views-git-sources.mjs"), false, "app 不再 import Git 源件（面板②随壳件取）")
  assert.ok(APP.includes("resolved.sub === undefined ? resolved.path : `${resolved.path}/${resolved.sub}`"), "重定向带子段（`path` ∥ `sub` 拼回）")
  assert.ok(APP.includes("PAGES[resolved.path](viewCtx(), mount, resolved.sub ?? null)"), "三参透传（子段入视图第三参——零改）")
  const shell = APP.match(/const SHELL_PAGES = new Set\(\[([^\]]*)\]\)/)[1]
  assert.deepEqual([...shell.matchAll(/"([^"]+)"/g)].map((match) => match[1]),
    ["/admin/members", "/admin/providers", "/admin/models", "/admin/audit", "/me/usage"], "`SHELL_PAGES` 五路径零改（本两页非壳页）")
})

// ── ③ 页装配（两标签 ∥ 懒读 ∥ replaceState ∥ 直打/回落/保活）────────────────────

test("③ 页装配：两标签在场 ∥ 懒读时点/次数 ∥ `replaceState` 写子段 ∥ 直打/非法子段回落 ∥ 面板保活", async () => {
  try {
    const { calls, mount } = await fMount()
    assert.equal(byText(mount, ZH["admin.projects.title"]) !== null, true, "页题在册（`admin.projects.title`）")
    assert.deepEqual(tabButtons(mount).map((button) => button.textContent),
      [ZH["nav.page.admin.projects"], ZH["nav.page.admin.gitSources"]], "两标签词 = 原两入口词（既有键复用——零新增）")
    assert.equal(activeTab(mount), tabButtons(mount)[0], "缺省子段 ⇒ 标签①激活")
    assert.deepEqual([callsOf(calls, "GET", "/api/projects"), callsOf(calls, "GET", "/api/admin/git-sources")], [1, 0], "首屏只读列表①（未激活面板零读——懒读口径）")
    assert.deepEqual(tabPanels(mount)[1].children, [], "标签②面板首激活前零内容（懒建）")
    assert.deepEqual(replaceUrls(calls), [], "初始零改写（地址栏原样）")

    await tabButtons(mount)[1].fire("click")
    await settle()
    assert.equal(activeTab(mount), tabButtons(mount)[1], "点按 ⇒ 标签②激活")
    assert.deepEqual([callsOf(calls, "GET", "/api/projects"), callsOf(calls, "GET", "/api/admin/git-sources")], [1, 1], "切到才取数（面板②随建读一次——面板①不重读）")
    assert.deepEqual(replaceUrls(calls), ["#/admin/projects/git-sources"], "切换 ⇒ `replaceState` 写子段（不触发 hashchange——零重渲）")

    await tabButtons(mount)[0].fire("click")
    await tabButtons(mount)[1].fire("click")
    await settle()
    assert.deepEqual([callsOf(calls, "GET", "/api/projects"), callsOf(calls, "GET", "/api/admin/git-sources")], [1, 1], "往返重切零额外读（面板保活——建后不重建）")
    assert.deepEqual(replaceUrls(calls), ["#/admin/projects/git-sources", "#/admin/projects/projects", "#/admin/projects/git-sources"], "每次切换写一次子段")

    const direct = await fMount({ sub: "git-sources" })
    assert.equal(activeTab(direct.mount), tabButtons(direct.mount)[1], "子段 `git-sources` ⇒ 直达标签②（刷新/分享同落）")
    assert.deepEqual([callsOf(direct.calls, "GET", "/api/projects"), callsOf(direct.calls, "GET", "/api/admin/git-sources")], [0, 1], "直打标签② ⇒ 面板①零读（懒读——只读一个列表）")
    assert.deepEqual(replaceUrls(direct.calls), [], "直达零改写（地址栏原样）")

    const bad = await fMount({ sub: "nope" })
    assert.equal(activeTab(bad.mount), tabButtons(bad.mount)[0], "非法子段 ⇒ 标签①回落（组件 `initial` 静默校验）")
    assert.deepEqual([callsOf(bad.calls, "GET", "/api/projects"), callsOf(bad.calls, "GET", "/api/admin/git-sources")], [1, 0], "回落后面板②零读（懒保守）")
    assert.deepEqual(replaceUrls(bad.calls), [], "非法子段不写地址栏")
  } finally { closePage() }
})

// ── ④ 面板②零回归（七列/五钮 ∥ 页题 h2 撤销）──────────────────────────────────

test("④ 面板②零回归：源表七列 ∥ 五钮恒显 ∥「添加源」钮行 ∥ 页题 h2 撤销（面题入标签）", async () => {
  try {
    const { mount } = await fMount({ sub: "git-sources" })
    const panel = tabPanels(mount)[1]
    assert.deepEqual(fFindAll(panel, (node) => node.tag === "th").map((cell) => cell.textContent), SOURCE_HEADERS.map((key) => ZH[key]), "源表七列（件零改）")
    assert.ok(textOf(panel).includes("GitHub") && textOf(panel).includes("…abcd"), "平台文案 + PAT 掩码（零明文）")
    assert.equal(byText(panel, ZH["admin.gitSources.addBtn"]) !== null, true, "「添加源」钮行在册")
    for (const label of ["sync", "repos", "check", "edit", "remove"]) {
      assert.equal(fFindAll(panel, (node) => node.tag === "button").some((button) => button.textContent === ZH[`admin.gitSources.${label}`]), true, `五钮恒显：${label}`)
    }
    assert.deepEqual(fFindAll(mount, (node) => node.tag === "h2").map((node) => node.textContent), [ZH["admin.projects.title"]], "页题 h2 唯一（Git 源页题撤销——面题入标签，同词不双题）")
    assert.equal(fFindAll(panel, (node) => node.tag === "h2").length, 0, "面板②零页题")
    const back = fFind(panel, (node) => node.tag === "button" && String(node.className).split(" ").includes("tiny") && node.textContent === ZH["admin.gitSources.repos"])
    await back.fire("click")
    await settle()
    assert.ok(textOf(modalOf()).includes(ZH["admin.projects.dialogTitle"]), "「拉列表」⇒ 共用添仓对话框（既有入口②零改）")
  } finally { closePage() }
})

// ── ⑤ 基址门（弹窗两态 ∥ 事件块两态 ∥ 提交门 ∥ 组件侧零内联 display）─────────────

test("⑤ 基址门：非自建 ⇒ `baseField.hidden === true` ∥「自建」⇒ false（真值切换）∥ 事件块两态 ∥ 提交门在册", async () => {
  try {
    const { mount } = await fMount({ sub: "git-sources" })
    await byText(tabPanels(mount)[1], ZH["admin.gitSources.addBtn"]).fire("click")
    await settle()
    const editor = modalOf()
    assert.ok(editor !== null, "添源弹窗在场（件零改）")
    const selects = fFindAll(editor, (node) => node.tag === "select")
    const platformSelect = selects[0]
    assert.deepEqual(fFindAll(platformSelect, (node) => node.tag === "option").map((option) => option.value), ["gitee", "github", "gitlab", "selfhosted"], "平台四值选单（件零改）")
    const baseField = fFindAll(editor, (node) => node.tag === "label").find((label) => textOf(label).includes(ZH["admin.gitSources.baseUrl"]))
    assert.equal(baseField.hidden, true, "非自建（缺省）⇒ 基址字段 hidden 真值置位（不手写内联 display——修在 CSS 侧）")
    platformSelect.value = "selfhosted"
    await platformSelect.fire("change")
    assert.equal(baseField.hidden, false, "「自建」⇒ 基址在场")
    platformSelect.value = "gitee"
    await platformSelect.fire("change")
    assert.equal(baseField.hidden, true, "切回非自建 ⇒ 复隐（两态真值切换）")

    const eventTitle = fFindAll(editor, (node) => node.tag === "h4").find((node) => node.textContent === ZH["admin.gitSources.eventTitle"])
    assert.equal(eventTitle.parent.hidden, true, "缺省（poll）⇒ 事件块隐（同规第二受压点）")
    platformSelect.value = "github"
    await platformSelect.fire("change")
    const modeSelect = selects.find((sel) => fFindAll(sel, (node) => node.tag === "option").some((option) => option.value === "event"))
    assert.ok(modeSelect, "同步方式选单按 option 值定位（gitee-namespace-kinds 批类型选单插入后位次后移）")
    modeSelect.value = "event"
    await modeSelect.fire("change")
    assert.equal(eventTitle.parent.hidden, false, "github ∧ 事件 ⇒ 事件块显")
    assert.equal(baseField.hidden, true, "github ⇒ 基址仍隐（平台门）")

    assert.ok(GIT_SRC.includes('if (platform.value === "selfhosted" && baseUrl.value.trim() === "")'), "自建必填提交门在册")
    assert.ok(GIT_SRC.includes("baseField.hidden = platform.value !== \"selfhosted\""), "组件侧只切 `hidden` 属性（切换写法逐字不动——修在 CSS 侧）")
    assert.equal(/\bstyle\.display\b/.test(GIT_SRC), false, "组件侧零内联 display")
  } finally { closePage() }
})

// ── ⑥ CSS 静态（全局兜底 ∥ 计数 = 1 ∥ 旧补丁零残留 ∥ 核对表穷尽 ∥ AC-19 canon）───

test("⑥ CSS 静态：全局 `[hidden]` 兜底在册 ∥ `!important` 计数 = 1 ∥ 旧两补丁零残留 ∥ 核对表穷尽 ∥ canon 不破", () => {
  const cssClean = stripComments(CSS)
  const rules = [...cssClean.matchAll(/([^{}]*)\{([^{}]*)\}/g)].map((match) => [match[1].trim().replace(/\s+/g, " "), match[2].trim().replace(/\s+/g, " ")])
  assert.deepEqual(rules.find(([selector]) => selector === "[hidden]"), ["[hidden]", "display: none !important;"], "全局兜底规则在册（含 `display: none` 与 `!important`）")
  assert.equal((CSS.match(/!important/g) ?? []).length, 1, "全档 `!important` 计数 = 1（唯新规则）")
  assert.equal((cssClean.match(/!important/g) ?? []).length, 1, "去注释后同数（注释零自称）")
  assert.equal(CSS.includes(".sidebar[hidden]"), false, "旧按例补丁删净：`.sidebar[hidden]` 字面零残留")
  assert.equal(CSS.includes(".tab-panel[hidden]"), false, "旧按例补丁删净：`.tab-panel[hidden]` 字面零残留")
  assert.ok(CSS.indexOf("[hidden] { display: none !important; }") > CSS.indexOf("* { box-sizing: border-box; }"), "规则落底座区（`* { box-sizing }` 归一处之后）")
  assert.ok(CSS.indexOf("[hidden] { display: none !important; }") < CSS.indexOf(".sidebar {"), "规则在侧栏族之前（底座区）")

  // 核对表穷尽性（STYLE.md §2.3 机检 ⑤——集合断言）：`public/**` 含 `hidden` 字面档集 ⊆ 核对表在册档集
  // （在册 = STYLE.md §2.3 表 1/3/4/5/6 行档集；`style.css` = 规则源 ∥ `index.html` = 壳——非切换点档，不入扫描面）
  const HIDDEN_REGISTERED = new Set([
    "app.mjs", "dom.mjs", "host-credential.mjs", "modal.mjs", "tabs.mjs",
    "views-admin.mjs", "views-chat.mjs", "views-git-sources.mjs", "views-ledger.mjs", "views-me.mjs", "views-me-sandbox.mjs",
    "views-models.mjs", "views-projects.mjs", "views-providers-modals.mjs",
    "views-sandbox.mjs", "views-sandbox-containers.mjs", "views-sandbox-image-sources.mjs", "views-sandbox-images.mjs",
    "views-system.mjs", "views-system-config.mjs",
  ])
  const scanned = readdirSync(PUBLIC_DIR).filter((name) => name.endsWith(".mjs") && readPublic(name).includes("hidden"))
  assert.deepEqual(scanned.filter((name) => !HIDDEN_REGISTERED.has(name)), [], "含 `hidden` 字面档全在核对表在册（漏列即红）")

  assert.equal([...cssClean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].length, 58, ":root 58（本批零新变量）")
  assert.deepEqual(rules.filter(([selector]) => selector.includes(":hover")).map(([selector]) => selector).sort(),
    ["button.danger:hover", "button.link:hover", "button.tab:hover", "button.tiny:hover", "button:hover", ".modal-close:hover", ".nav-item:hover", "tbody tr:hover"].sort(),
    "悬停声明清单不变（八——零新悬停规则）")
})

// ── ⑦ i18n 零触（两域部件键数零动 ∥ 标签词逐字 ∥ `t` 字面量闭合）──────────────────

test("⑦ i18n 零触：shell ∥ project 两域部件键数（61 ∥ 162——project 随 gitee-namespace-kinds 批 +8）∥ 标签词复用既有键（逐字）∥ 新壳 `t` 字面量闭合 ∥ en 零 CJK", () => {
  // 本批文案面 = shell（标签词）∥ project（页题/表件）两域部件——逐表键数零动 + 两表键集对位；
  // 门面全局键数归跨批结构守卫件（他批增键不改本批判定——2026-10-13 并行批实证）
  assert.equal(Object.keys(ZH_SHELL).length, 61, "shell 部件 zh 键数 61（标签词复用既有键——零新增）")
  assert.equal(Object.keys(EN_SHELL).length, 61, "shell 部件 en 键数 61（含 `.one` 变体两枚）")
  assert.equal(Object.keys(ZH_PROJECT).length, 162, "project 部件 zh 键数 162（本批零增零减 ∥ gitee-namespace-kinds 批 +8/表）")
  assert.equal(Object.keys(EN_PROJECT).length, 162, "project 部件 en 键数 162（同上）")
  const SELF = new Set(["lang.zh", "lang.en"])
  const base = (table) => new Set(Object.keys(table).filter((key) => !SELF.has(key)).map((key) => key.replace(/\.one$/, "")))
  assert.deepEqual([...base(ZH_SHELL)].filter((key) => !base(EN_SHELL).has(key)), [], "shell 仅 zh 键（自称名族除外）")
  assert.deepEqual([...base(EN_SHELL)].filter((key) => !base(ZH_SHELL).has(key)), [], "shell 仅 en 键")
  assert.deepEqual(Object.keys(EN_PROJECT), Object.keys(ZH_PROJECT), "project 两表键集逐键对位（零 `.one` 变体——精确集）")
  assert.deepEqual([ZH["nav.page.admin.projects"], ZH["nav.page.admin.gitSources"]], ["项目", "Git 源"], "标签词 = 原两入口词（逐字）")
  assert.deepEqual([EN["nav.page.admin.projects"], EN["nav.page.admin.gitSources"]], ["Projects", "Git sources"], "en 同源（en 零 CJK）")
  for (const key of ["nav.page.admin.projects", "nav.page.admin.gitSources", "admin.projects.title"]) assert.equal(CJK.test(EN[key]), false, `en 值含 CJK：${key}`)
  for (const match of stripComments(ADMIN_SRC).matchAll(/\bt\(\s*"([^"]+)"\s*[,)]/g)) assert.ok(match[1] in ZH && match[1] in EN, `新壳 t 字面量悬空：${match[1]}`)
  assert.ok(ADMIN_SRC.includes('createTabs(ctx, {'), "壳经公共组件装配（tabs.mjs——组件零改）")
  assert.ok(ADMIN_SRC.includes("history.replaceState(null, \"\", `#/admin/projects/${id}`)"), "地址栏径 = `replaceState` 写子段（零 hashchange）")
})
