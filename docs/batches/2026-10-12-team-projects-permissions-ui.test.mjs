/**
 * 2026-10-12-team-projects-permissions-ui.test.mjs — thincoder-server 批内单测件（控制台项目面——team-projects-permissions 批（B2）· C 件；
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。判据源 = `webui/PROJECTS.md` §2/§4 ∥ `project/PROJECTS.md` §10（C 件行）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-12-team-projects-permissions-ui.test.mjs`
 *
 * 射程：
 *   ① AC-12 IA 直测（我的 3 ⇒ 4——`#/me/projects` 末位 ∥ 管理 9 ⇒ 11——「成员」后两页 ∥ admin 组门 ∥ 别名/角色默认零改 ∥ 新径解析）
 *   ② AC-14 键集（project 两部件键集相等 ∥ en 零 CJK ∥ 域界三前缀 ∥ shell +3 ∥ system +1 ∥ 键引用闭合 ∥ kind 族 11 键 + 六分类）
 *   ③ AC-19/20 静态面（`:root` 76 变量（58 + 终端批 18——2026-10-14 收口随正） ∥ `:hover` 8 零新 ∥ 类名双向闭合 ∥ 零外链 ∥ 行宽/行数）
 *   ④ 三页在册/路由（三模块导出面 ∥ `PAGES` 三行 + 三 import ∥ 壳页集零改——三页非壳）
 *   ⑤ 行为形·我的·项目（列表五列 ∥ 搜索 `?q=` ∥ 空态 ∥ 行点击 ⇒ 详情弹窗：权限感知显隐 ∥ 负责人行保护 ∥ 删除钮 + 确认窗）
 *   ⑥ 行为形·添加仓对话框（源选单预选 ∥ 读取自含形 ∥ 已在册禁提交 ∥ 客户端过滤 ∥ 截断 ∥ 六分类 + 重试 ∥ 提交体 ∥ 手输区）
 *   ⑦ 行为形·Git 源（七列五钮 ∥ 立即同步进行中禁 + 终态刷新 ∥ 体检就地读数 + PAT 标红 ∥ 编辑窗平台门 + 事件块 + 一次性密钥 ∥ 删除确认）
 *
 * 实读锚：键数 892 ∥ 897（2026-10-13 随正——sandbox-outbound-member-face 批后实读；后续批次增键 ⇒ 沿先例随正，与跨批守卫件同拍）。
 *
 * 桩说明：`dom.mjs` 顶层触 `document`（`flashEl` 取件——WEBUI §1）——先桩后 import；本档零外部网络/零真库（stub ctx 路由表）。
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

// 桩（`dom.mjs` 顶层触 `document`——先桩后 import；渲染函数另见下方每测例的桩）
globalThis.document = { getElementById: () => null }

const [{ ZH }, { EN }] = await Promise.all([load("i18n-zh.mjs"), load("i18n-en.mjs")])
const NAV = await load("nav.mjs")
const PROJECTS_VIEW = await load("views-projects.mjs")
const ADMIN_PROJECTS_VIEW = await load("views-admin-projects.mjs")
const GIT_SOURCES_VIEW = await load("views-git-sources.mjs")
const AUDIT_VIEW = await load("views-audit.mjs")
const CSS = readPublic("style.css")

/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」「…」等中性标点不在内）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/
/** 剥注释（字符串态感知——沿 `2026-10-11-sandbox-volumes-ui.test.mjs` 同法）。 */
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

// ── 桩 DOM 夹具（`modal.mjs` 壳面近形；`h` 同 app 语义近似）─────────────────────────

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

/** 桩 ctx（api 路由表 `"METHOD path"` ⇒ handler；全调用入 `calls`）。 */
function fCtx(routes = {}, member = { username: "alice", role: "admin" }) {
  const calls = []
  const secrets = []
  const ctx = {
    h: fH,
    state: { member, system: null },
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
    showSecret: (box, label, value) => { secrets.push({ label, value }); box.hidden = false; box.replaceChildren(fH("code", { class: "secret-value", text: value })) },
  }
  return { ctx, calls, secrets }
}

const modalOf = () => fFind(globalThis.document.body, (node) => node.tag === "dialog")
const fProject = (over = {}) => ({ id: 1, displayName: "Repo One", address: "https://gitee.com/org/repo", source: { id: 7, name: "src-a", platform: "gitee" }, owner: "alice", level: "read", memberCount: 2, ...over })
const fSource = (over = {}) => ({
  id: 1, name: "src-a", platform: "github", baseURL: null, scope: "org-a", token: { set: true, hint: "…abcd" }, hookSecret: { set: false, hint: null },
  enabled: 1, syncMode: "poll", intervalMinutes: 60, lastSyncAt: null, lastSyncResult: {}, tokenState: "unknown", tokenCheckedAt: null, createdAt: "2026-10-12T00:00:00Z", ...over,
})

// ── ① AC-12 IA（nav 直测） ─────────────────────────────────────────────────────

test("① AC-12 IA：我的 6（`#/me/ledger` 末位）∥ 管理 10（单入口——project-sources-merge 批）∥ admin 组门 ∥ 别名/角色默认零改 ∥ 新径解析", () => {
  const [me, admin] = NAV.NAV_GROUPS
  assert.deepEqual(NAV.NAV_GROUPS.map((group) => group.key), ["me", "admin"], "两组")
  assert.deepEqual(me.items.map((item) => item.path), ["/me/keys", "/me/usage", "/me/account", "/me/projects", "/me/sandbox", "/me/ledger"], "我的 6——ledger 末位追加（2026-10-13 team-ledger 批）")
  assert.deepEqual(admin.items.map((item) => item.path), ["/admin/overview", "/admin/chat", "/admin/members", "/admin/projects",
    "/admin/providers", "/admin/models", "/admin/usage", "/admin/audit", "/admin/system", "/admin/sandbox"], "管理 10——单入口（project-sources-merge 批：Git 源併入项目页子段）")
  assert.equal(admin.adminOnly, true, "admin 组仅 admin")
  for (const item of [...me.items, ...admin.items]) assert.ok(item.labelKey in ZH && item.labelKey in EN, `labelKey 两表在盘：${item.labelKey}`)
  assert.deepEqual(NAV.ROUTE_ALIASES, { "/me": "/me/keys", "/admin": "/admin/overview", "/admin/proxy": "/admin/system", "/admin/git-sources": "/admin/projects/git-sources" }, "别名集——git-sources 旧链别名 +1（project-sources-merge 批）")
  assert.deepEqual([NAV.defaultPath("admin"), NAV.defaultPath("user")], ["/admin/overview", "/me/keys"], "角色默认页零改")
  assert.deepEqual(NAV.resolveRoute("/me/projects", "user"), { path: "/me/projects" }, "我的·项目——user 可达（非 admin 面）")
  assert.deepEqual(NAV.resolveRoute("/admin/projects", "admin"), { path: "/admin/projects" }, "管理·项目——admin 在册")
  assert.deepEqual(NAV.resolveRoute("/admin/git-sources", "admin"), { path: "/admin/projects", sub: "git-sources", redirect: true }, "管理·Git 源旧链 ⇒ 单入口子段（project-sources-merge 批）")
  assert.equal(NAV.resolveRoute("/admin/projects", "user").denied, true, "admin 面非 admin ⇒ denied")
  assert.equal(NAV.resolveRoute("/admin/git-sources", "user").denied, true, "同前（Git 源页）")
  assert.deepEqual(NAV.resolveRoute("/me/projects/extra", "user"), { path: "/me/projects", sub: "extra" }, "子段容许零改")
  assert.deepEqual(NAV.resolveRoute("/unknown", "user"), { path: "/me/keys", redirect: true }, "未知 hash ⇒ 默认页")
})

// ── ② AC-14 键集（project 两部件 + 既有两部件随动 + 键引用闭合） ────────────────────

test("② AC-14 键集：project 两部件键集相等 ∥ en 零 CJK ∥ 域界三前缀 ∥ shell +3 ∥ system +1 ∥ 键引用闭合 ∥ kind 族 11 键 + 六分类", async () => {
  const [zhPart, enPart, zhShell, enShell, zhSystem, enSystem] = await Promise.all([
    load("i18n-zh-project.mjs"), load("i18n-en-project.mjs"), load("i18n-zh-shell.mjs"), load("i18n-en-shell.mjs"),
    load("i18n-zh-system.mjs"), load("i18n-en-system.mjs"),
  ])
  assert.deepEqual([Object.keys(zhPart), Object.keys(enPart)], [["ZH_PROJECT"], ["EN_PROJECT"]], "两部件单导出")
  assert.ok(Object.isFrozen(zhPart.ZH_PROJECT) && Object.isFrozen(enPart.EN_PROJECT), "两部件冻结")
  const zhKeys = Object.keys(zhPart.ZH_PROJECT), enKeys = Object.keys(enPart.EN_PROJECT)
  assert.deepEqual(enKeys, zhKeys, "两表键集相等（逐键对位）")
  for (const key of zhKeys) assert.ok(/^(me\.projects|admin\.projects|admin\.gitSources)\./.test(key), `域界三前缀：${key}`)
  for (const [key, value] of Object.entries(enPart.EN_PROJECT)) {
    assert.ok(typeof value === "string" && value.trim() !== "", `en 值非空：${key}`)
    assert.equal(CJK.test(value), false, `en 值含 CJK：${key}`)
  }
  for (const key of zhKeys) assert.ok(typeof zhPart.ZH_PROJECT[key] === "string" && zhPart.ZH_PROJECT[key].trim() !== "", `zh 值非空：${key}`)
  // 既有部件随动：shell +3 键（导航三）∥ system +1 键（audit 型）
  for (const [table, lang] of [[zhShell.ZH_SHELL, "zh"], [enShell.EN_SHELL, "en"]]) {
    assert.equal(Object.keys(table).length, 61, `${lang} shell 键数 61（56 + 3 + 1 + 1——2026-10-13 sandbox 批 + team-ledger 批 nav.page.me.ledger）`)
    for (const key of ["nav.page.me.projects", "nav.page.admin.projects", "nav.page.admin.gitSources"]) assert.ok(key in table, `${lang} shell 在盘：${key}`)
  }
  for (const [table, lang] of [[zhSystem.ZH_SYSTEM, "zh"], [enSystem.EN_SYSTEM, "en"]]) {
    assert.equal(Object.keys(table).length, 198, `${lang} system 键数 198（185〔2026-10-13〕+ 终端批 +2〔audit.sandboxKind.terminal_open/close〕+ 重做批 i18n 面 +10〔审计 kind 键〕+ B 审计 kind +1〔audit.placement_failed〕——2026-10-14 收口随正）`)
    assert.ok("audit.type.project_event" in table, `${lang} system 在盘：audit.type.project_event`)
  }
  // 门面并集（部件 ⊂ 门面；键数实读）
  assert.equal(Object.keys(ZH).length, 1041, "zh 门面键数 1041（实读——975 链：+ 重做批 i18n 面 +10/表 ∥ 终端批 +14/表 ∥ B/D 修复轮 −2/表——2026-10-14 收口随正；全局同锚 = 守卫件 [1041, 1046]）")
  assert.equal(Object.keys(EN).length, 1046, "en 门面键数 1046（实读——含 `.one` 变体；同链随正）")
  for (const key of zhKeys) assert.ok(key in ZH && key in EN, `门面并集：${key}`)
  // 键引用闭合（三视图 + 审计面 `t` 字面量 ⊆ 两表——含 nav.mjs labelKey 面）
  for (const name of ["views-projects.mjs", "views-admin-projects.mjs", "views-git-sources.mjs", "views-audit.mjs"]) {
    for (const match of stripComments(readPublic(name)).matchAll(/\bt\(\s*"([^"]+)"\s*[,)]/g)) {
      assert.ok(match[1] in ZH && match[1] in EN, `${name} t 字面量悬空：${match[1]}`)
    }
  }
  // kind 族 11 键 + 六分类（审计详情 + 分类人话）
  for (const kind of ["source_add", "source_update", "source_delete", "source_sync", "source_check", "project_add", "project_update", "project_delete", "member_add", "member_update", "member_remove"]) {
    assert.ok(`admin.projects.kind.${kind}` in ZH, `kind 族在盘：${kind}`)
  }
  for (const [kind, key] of [["auth", "auth"], ["scope_missing", "scopeMissing"], ["unreachable", "unreachable"], ["timeout", "timeout"], ["http_error", "httpError"], ["bad_response", "badResponse"]]) {
    assert.ok(`admin.gitSources.errKind.${key}` in ZH && `admin.gitSources.errKind.${key}` in EN, `六分类在盘：${kind}`)
    assert.equal(PROJECTS_VIEW.readKindLabel(kind), ZH[`admin.gitSources.errKind.${key}`], `六分类映射：${kind}`)
  }
  assert.equal(PROJECTS_VIEW.readKindLabel("future_kind"), "future_kind", "分类枚举外 ⇒ 原值兜底")
  // 行为形：kind 文案（枚举外原值兜底）∥ 档位文案（负责人优先）
  assert.equal(AUDIT_VIEW.projectKindLabel("source_sync"), ZH["admin.projects.kind.source_sync"], "kind 文案取表")
  assert.equal(AUDIT_VIEW.projectKindLabel("future_kind"), "future_kind", "kind 枚举外 ⇒ 原值兜底")
  assert.equal(PROJECTS_VIEW.levelLabel("readwrite"), ZH["me.projects.level.readwrite"], "档位文案取表")
  assert.equal(PROJECTS_VIEW.levelLabel("read", true), ZH["me.projects.level.owner"], "负责人优先显")
  assert.equal(PROJECTS_VIEW.levelLabel(null), "—", "档位空 ⇒ 「—」（admin 非成员）")
})

// ── ③ AC-19/20 静态面（零新变量 ∥ 零新悬停 ∥ 类名闭合 ∥ 零外链） ────────────────────

test("③ AC-19/20：`:root` 76 变量（58 + 终端批 18）∥ `:hover` 8（零新）∥ 新类在盘 ∥ 档面类闭合 ∥ 零外链 ∥ 行宽/行数", () => {
  const clean = stripComments(CSS)
  assert.equal([...clean.match(/:root\s*\{[\s\S]*?\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].length, 76, ":root 76（58 + 终端批 18〔--term-* 调色板〕——2026-10-14 收口随正；零新其他颜色变量）")
  assert.equal([...clean.matchAll(/:hover/g)].length, 8, "`:hover` 8（零新悬停规则）")
  assert.equal(/(#[0-9a-fA-F]{3,8}\b|rgba?\()/.test(clean.replace(/:root\s*\{[\s\S]*?\}/g, "")), false, ":root 块外零颜色字面量")
  for (const selector of [".sync-dot", ".sync-dot.ok", ".sync-dot.fail", ".badge.accent", ".badge.warn", ".cell-hint"]) {
    assert.ok(CSS.includes(selector), `新类在盘：${selector}（零新变量前提）`)
  }
  // 档面类名闭合（三视图字面类 ⊆ style.css 类选择器）
  const cssClasses = new Set([...CSS.matchAll(/\.([a-z][a-z0-9-]*)/g)].map((match) => match[1]))
  for (const name of ["views-projects.mjs", "views-admin-projects.mjs", "views-git-sources.mjs"]) {
    const source = readPublic(name)
    const used = new Set()
    for (const match of source.matchAll(/\bclass(?:Name)?\s*[:=]\s*([^\n;]*?)(?=\s*\bclass(?:Name)?\s*[:=]|[;\n]|$)/g)) {
      const window = match[1].replace(/\$\{[^}]*\}/g, " ").split("//")[0].split("}")[0].split(/,\s*[A-Za-z_$][\w$]*\s*:/)[0]
      for (const literal of window.matchAll(/["'`]([^"'`]*)["'`]/g)) for (const token of literal[1].split(/\s+/)) if (token) used.add(token)
    }
    for (const token of used) assert.ok(cssClasses.has(token), `${name} 档面类无样式规则：${token}`)
  }
  for (const name of ["views-projects.mjs", "views-admin-projects.mjs", "views-git-sources.mjs"]) {
    const source = readPublic(name)
    assert.equal(/https?:\/\//.test(source), false, `${name} 零外链（KD-SV-9）`)
    assert.ok(Math.max(...source.split("\n").map((line) => line.length)) <= 300, `${name} 行宽 ≤300`)
    assert.ok(linesOf(name) <= 500, `${name} ≤500（实读 ${linesOf(name)}）`)
  }
  for (const name of ["i18n-zh-project.mjs", "i18n-en-project.mjs"]) {
    assert.ok(Math.max(...readPublic(name).split("\n").map((line) => line.length)) <= 300, `${name} 行宽 ≤300`)
    assert.ok(linesOf(name) <= 500, `${name} ≤500（实读 ${linesOf(name)}）`)
  }
  assert.equal(CJK.test(stripComments(readPublic("views-projects.mjs"))) || CJK.test(stripComments(readPublic("views-git-sources.mjs"))), false, "新档代码段零 CJK（文案全入两表）")
})

// ── ④ 三页在册/路由（`PAGES` 三行 ∥ 壳页集零改） ─────────────────────────────────

test("④ 两页在册：两模块导出面 ∥ `PAGES` 两行 + 两 import ∥ 壳页集零改（非壳——钉表五页不扩）", async () => {
  const appSrc = readPublic("app.mjs")
  const wiring = [["views-projects.mjs", "renderMeProjects", "/me/projects"], ["views-admin-projects.mjs", "renderAdminProjects", "/admin/projects"]]
  for (const [module, fn, path] of wiring) {
    assert.ok(appSrc.includes(`import { ${fn} } from "./${module}"`), `import 接线：${module}`)
    assert.ok(new RegExp(`"${path}": ${fn},`).test(appSrc), `PAGES 行：${path}`)
    assert.equal(typeof (await load(module))[fn], "function", `导出面：${module}`)
  }
  assert.equal(typeof PROJECTS_VIEW.openProjectDetail, "function", "共用件导出：详情弹窗")
  assert.equal(typeof PROJECTS_VIEW.openAddRepoDialog, "function", "共用件导出：添加仓对话框")
  assert.equal(typeof ADMIN_PROJECTS_VIEW.renderAdminProjects, "function", "管理·项目页导出")
  assert.equal(typeof GIT_SOURCES_VIEW.renderGitSources, "function", "Git 源页导出")
  assert.equal(typeof GIT_SOURCES_VIEW.platformLabel, "function", "平台文案纯函数导出")
  const shell = appSrc.match(/const SHELL_PAGES = new Set\(\[([^\]]*)\]\)/)[1]
  assert.deepEqual([...shell.matchAll(/"([^"]+)"/g)].map((match) => match[1]),
    ["/admin/members", "/admin/providers", "/admin/models", "/admin/audit", "/me/usage"], "壳页五路径零改（三页非壳——STYLE.md §2.2）")
})

// ── ⑤ 行为形·我的·项目（列表 ∥ 搜索 ∥ 空态 ∥ 详情弹窗权限感知） ──────────────────────

const DETAIL = {
  project: { id: 1, displayName: "Repo One", address: "https://gitee.com/org/repo", source: { id: 7, name: "src-a", platform: "gitee" }, owner: "alice", level: "manage", memberCount: 2 },
  members: [{ username: "alice", level: "manage", origin: "manual", syncedRole: null }, { username: "bob", level: "read", origin: "sync", syncedRole: "member" }],
  my: { level: "manage", owner: true, admin: false, can: { view: true, write: true, manageMembers: true, rename: true, editAddress: false, delete: false } },
}

test("⑤ 我的·项目：列表五列 ∥ 搜索 `?q=` ∥ 空态 ∥ 行点击 ⇒ 详情弹窗（权限感知显隐 ∥ 负责人行保护 ∥ 删除钮 + 确认窗）", async () => {
  try {
    globalThis.document = stubDocument()
    const { ctx, calls } = fCtx({
      "GET /api/projects": () => ({ projects: [fProject(), fProject({ id: 2, displayName: "Repo Two", address: "git@gitee.com:org/two.git", level: null, owner: "carol" })] }),
      "GET /api/projects?q=two": () => ({ projects: [fProject({ id: 2, displayName: "Repo Two" })] }),
      "GET /api/projects/1": () => DETAIL,
      "DELETE /api/admin/projects/1": () => ({ ok: true }),
    })
    const mount = makeNode("section")
    await PROJECTS_VIEW.renderMeProjects(ctx, mount)
    const headers = fFindAll(mount, (node) => node.tag === "th").map((cell) => cell.textContent)
    assert.deepEqual(headers, [ZH["me.projects.col.name"], ZH["me.projects.col.address"], ZH["me.projects.col.source"], ZH["me.projects.col.level"], ZH["me.projects.col.owner"]], "五列列头")
    const rows = fFindAll(mount, (node) => node.tag === "tr" && node.className === "row-clickable")
    assert.equal(rows.length, 2, "两数据行（可点）")
    assert.ok(textOf(rows[0]).includes(ZH["me.projects.level.owner"]), "负责人优先显（首行 owner = 本会话成员）")
    assert.ok(textOf(rows[1]).includes("—"), "档位空（admin 非成员）⇒ 「—」")

    // 搜索：提交 ⇒ `?q=` 服务端过滤
    const input = fFind(mount, (node) => node.tag === "input")
    input.value = "two"
    await fFind(mount, (node) => node.tag === "form").fire("submit")
    await settle()
    assert.deepEqual(calls.filter(([method]) => method === "GET").at(-1), ["GET", "/api/projects?q=two", null], "搜索走 `?q=`（服务端）")

    // 空态
    const empty = fCtx({ "GET /api/projects": () => ({ projects: [] }) })
    const emptyMount = makeNode("section")
    await PROJECTS_VIEW.renderMeProjects(empty.ctx, emptyMount)
    assert.ok(textOf(emptyMount).includes(ZH["me.projects.empty"]) && textOf(emptyMount).includes(ZH["me.projects.emptyHint"]), "空态句 + 说明句")

    // 行点击 ⇒ 详情弹窗（权限感知：can.manageMembers ⇒ 操作列 + 加成员行；can.delete false ⇒ 无删除钮）
    globalThis.document = stubDocument()
    const detailCtx = fCtx({ "GET /api/projects/1": () => ({ ...DETAIL, my: { ...DETAIL.my, admin: false, can: { ...DETAIL.my.can, delete: true } } }), "DELETE /api/admin/projects/1": () => ({ ok: true }) })
    PROJECTS_VIEW.openProjectDetail(detailCtx.ctx, { projectId: 1 })
    await settle()
    const dialog = modalOf()
    assert.ok(dialog !== null, "详情弹窗在册")
    assert.ok(textOf(dialog).includes("alice") && textOf(dialog).includes("bob"), "成员表两行在册")
    assert.ok(textOf(dialog).includes(ZH["me.projects.col.actions"]), "操作列在册（can.manageMembers）")
    const memberRows = fFindAll(dialog, (node) => node.tag === "tr")
    const ownerRow = memberRows.find((row) => textOf(row).includes("alice"))
    assert.equal(fFindAll(ownerRow, (node) => node.tag === "button").length, 0, "负责人行保护：无移除/降档控件")
    assert.equal(fFindAll(ownerRow, (node) => node.tag === "select").length, 0, "负责人行保护：无档位选单")
    const bobRow = memberRows.find((row) => textOf(row).includes("bob"))
    assert.equal(fFindAll(bobRow, (node) => node.tag === "select").length, 1, "非负责人行：改档选单在册")
    assert.equal(fFindAll(bobRow, (node) => node.tag === "button").length, 1, "非负责人行：移除钮在册")
    assert.ok(fFind(dialog, (node) => node.tag === "input"), "加成员用户输入在册")
    assert.equal(fFindAll(dialog, (node) => node.tag === "button").some((button) => button.className === "danger"), true, "删除钮在册（can.delete）")

    // 删除 ⇒ 二次确认窗 ⇒ `{ confirm: true }`
    await fFindAll(dialog, (node) => node.tag === "button" && node.className === "danger")[0].fire("click")
    const confirm = modalOf()
    assert.ok(textOf(confirm).includes(ZH["me.projects.deleteTitle"]) && textOf(confirm).includes("Repo One"), "确认窗在册（后果句）")
    await fFindAll(confirm, (node) => node.tag === "button" && node.className === "danger")[0].fire("click")
    await settle()
    assert.deepEqual(detailCtx.calls.filter(([method]) => method === "DELETE").at(-1), ["DELETE", "/api/admin/projects/1", { confirm: true }], "删径载荷逐值")

    // 权限低面：无操作列 / 无加成员行 / 无删除钮（页面不是判据——控件显隐 = 服务端读数）
    globalThis.document = stubDocument()
    const lowCtx = fCtx({ "GET /api/projects/1": () => ({ ...DETAIL, my: { level: "read", owner: false, admin: false, can: { view: true, write: false, manageMembers: false, rename: false, editAddress: false, delete: false } } }) })
    PROJECTS_VIEW.openProjectDetail(lowCtx.ctx, { projectId: 1 })
    await settle()
    const lowDialog = modalOf()
    assert.equal(textOf(lowDialog).includes(ZH["me.projects.col.actions"]), false, "无操作列（can.manageMembers false）")
    assert.equal(fFindAll(lowDialog, (node) => node.tag === "input").length, 0, "无加成员输入（同权）")
    assert.equal(fFindAll(lowDialog, (node) => node.tag === "button").some((button) => button.className === "danger"), false, "无删除钮（can.delete false）")
    assert.equal(fFindAll(lowDialog, (node) => node.tag === "button").some((button) => button.textContent === ZH["me.projects.rename"]), false, "无改显示名控件（can.rename false）")
  } finally { delete globalThis.document }
})

// ── ⑥ 行为形·添加仓对话框（读取 ∥ 已在册 ∥ 过滤 ∥ 六分类 ∥ 提交 ∥ 手输） ──────────────

test("⑥ 添加仓对话框：源选单预选 ∥ 读取自含形 ∥ 已在册禁提交 ∥ 客户端过滤 ∥ 截断 ∥ 六分类 + 重试 ∥ 提交体 ∥ 手输区", async () => {
  try {
    globalThis.document = stubDocument()
    const repos = [
      { fullName: "org/repo-a", address: "https://gitee.com/org/repo-a.git", private: false, known: false },
      { fullName: "org/repo-b", address: "https://gitee.com/org/repo-b.git", private: true, known: true },
    ]
    let reads = 0
    const { ctx, calls } = fCtx({
      "GET /api/admin/git-sources": () => ({ sources: [fSource({ id: 7, name: "src-a" }), fSource({ id: 8, name: "src-b", platform: "gitee" })] }),
      "GET /api/members": () => ({ members: [{ username: "alice" }, { username: "carol" }] }),
      "GET /api/admin/git-sources/7/repos": () => {
        reads += 1
        if (reads === 1) return { ok: false, error: { kind: "auth", message: "bad token" } }
        return { ok: true, repos, truncated: true, ms: 12 }
      },
      "POST /api/admin/projects": () => ({ ok: true }),
    })
    PROJECTS_VIEW.openAddRepoDialog(ctx, { sourceId: 7 })
    await settle()
    const dialog = modalOf()
    const selects = fFindAll(dialog, (node) => node.tag === "select")
    assert.deepEqual(fFindAll(selects[0], (node) => node.tag === "option").map((option) => option.value), ["", "7", "8"], "源选单 = 「手输（无源）」 + 两源")
    assert.equal(selects[0].value, "7", "「拉列表」入口预选本行源")
    const ownerSelect = selects[1]
    assert.deepEqual(fFindAll(ownerSelect, (node) => node.tag === "option").map((option) => option.value), ["", "alice", "carol"], "负责人选单 = 成员表读（可空）")

    // 读取（自含形失败 ⇒ 分类人话 + 原始消息 + 重试）
    const readBtn = fFindAll(dialog, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.projects.readBtn"])
    await readBtn.fire("click")
    await settle()
    assert.ok(textOf(dialog).includes(ZH["admin.gitSources.errKind.auth"]) && textOf(dialog).includes("bad token"), "六分类人话 + 服务端原文就地呈")
    const retryBtn = fFindAll(dialog, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.projects.retry"])
    await retryBtn.fire("click")
    await settle()
    assert.equal(reads, 2, "重试重读（可重试）")
    assert.ok(textOf(dialog).includes(ZH["admin.projects.truncated"]), "截断提示在册")
    const boxes = fFindAll(dialog, (node) => node.tag === "input" && node.attrs.type === "checkbox")
    assert.deepEqual(boxes.map((box) => box.disabled), [false, true], "已在册行禁提交（服务端 `known`）")
    assert.ok(textOf(dialog).includes(ZH["admin.projects.knownTag"]) && textOf(dialog).includes(ZH["admin.projects.privateTag"]), "已添加标 + 私有标在册")

    // 客户端过滤（零新端点——纯前端过滤）
    const filter = fFind(dialog, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.projects.filterPh"])
    filter.value = "repo-b"
    await filter.fire("input")
    assert.equal(fFindAll(dialog, (node) => node.tag === "tr").length, 1, "过滤 ⇒ 单行在册（零新端点）")
    filter.value = "nothing"
    await filter.fire("input")
    assert.ok(textOf(dialog).includes(ZH["admin.projects.reposNoMatch"]), "无匹配句在册")
    filter.value = ""
    await filter.fire("input")

    // 提交：勾选非在册行 ⇒ `{ sourceId, repos: [...] }`
    const submitBtn = fFindAll(dialog, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.projects.submitCount"].replace("{count}", "0"))
    const target = fFindAll(dialog, (node) => node.tag === "input" && node.attrs.type === "checkbox" && node.disabled === false)
    assert.equal(target.length, 1, "可选行一枚")
    target[0].checked = true
    await target[0].fire("change")
    assert.equal(submitBtn.textContent, ZH["admin.projects.submitCount"].replace("{count}", "1"), "计数随动")
    await submitBtn.fire("click")
    await settle()
    assert.deepEqual(calls.filter(([method, path]) => method === "POST" && path === "/api/admin/projects").at(-1),
      ["POST", "/api/admin/projects", { sourceId: 7, repos: [{ address: "https://gitee.com/org/repo-a.git", displayName: "org/repo-a" }] }], "批量提交体逐值（全成或全拒）")

    // 换源 ⇒ 旧列表作废（防跨源错挂——提交体 `sourceId` = 现选中值）
    selects[0].value = ""
    await selects[0].fire("change")
    assert.equal(fFindAll(dialog, (node) => node.tag === "input" && node.attrs.type === "checkbox").length, 0, "换源 ⇒ 旧列表作废（跨源错挂防护）")
    assert.equal(submitBtn.textContent, ZH["admin.projects.submitCount"].replace("{count}", "0"), "提交计数复位")

    // 手输区：必填门 + 提交体（displayName/owner 可空）
    globalThis.document = stubDocument()
    const manual = fCtx({
      "GET /api/admin/git-sources": () => ({ sources: [] }),
      "GET /api/members": () => ({ members: [{ username: "alice" }] }),
      "POST /api/admin/projects": () => ({ ok: true }),
    })
    PROJECTS_VIEW.openAddRepoDialog(manual.ctx, {})
    await settle()
    const dialog2 = modalOf()
    const manualSubmit = fFindAll(dialog2, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.projects.manualSubmit"])
    await manualSubmit.fire("click")
    assert.equal(manual.calls.filter(([method]) => method === "POST").length, 0, "地址空 ⇒ 不发 POST（必填门）")
    const manualInputs = (placeholder) => fFind(dialog2, (node) => node.tag === "input" && node.attrs.placeholder === placeholder)
    manualInputs(ZH["admin.projects.addressPh"]).value = "git@gitee.com:org/manual.git"
    manualInputs(ZH["admin.projects.displayNamePh"]).value = "手动仓"
    await manualSubmit.fire("click")
    await settle()
    assert.deepEqual(manual.calls.filter(([method, path]) => method === "POST" && path === "/api/admin/projects").at(-1),
      ["POST", "/api/admin/projects", { address: "git@gitee.com:org/manual.git", displayName: "手动仓", owner: null }], "手输提交体逐值")
  } finally { delete globalThis.document }
})

// ── ⑦ 行为形·Git 源（七列五钮 ∥ 同步 ∥ 体检 ∥ 编辑窗平台门 + 事件块 ∥ 删除确认） ─────────

test("⑦ Git 源：七列五钮 ∥ 立即同步进行中禁 + 终态刷新 ∥ 体检读数 + PAT 标红 ∥ 平台门 + 事件块 + 一次性密钥 ∥ 删除确认 + 防护句", async () => {
  try {
    globalThis.document = stubDocument()
    let gets = 0
    let release = null
    const gate = new Promise((resolve) => { release = resolve })
    const { ctx, calls } = fCtx({
      "GET /api/admin/git-sources": () => {
        gets += 1
        return { sources: [fSource(gets >= 3 ? { lastSyncAt: "2026-10-12T10:00:00Z", lastSyncResult: { ok: false, kind: "auth", counts: {} }, tokenState: "invalid" } : {})] }
      },
      "POST /api/admin/git-sources/1/sync": () => gate.then(() => ({ ok: true, ms: 30, counts: { projects: 1, roster: 2, added: 1, updated: 0, removed: 0 } })),
      "POST /api/admin/git-sources/1/check": () => ({ ok: true, ms: 12 }),
      "POST /api/admin/git-sources/1/hook-secret": () => ({ hookSecret: { plain: "abcd1234ef" } }),
      "DELETE /api/admin/git-sources/1": () => { throw Object.assign(new Error("尚有 2 个项目挂此源"), { code: "invalid_request_error", status: 400 }) },
    })
    const mount = makeNode("section")
    await GIT_SOURCES_VIEW.renderGitSources(ctx, mount)
    const headers = fFindAll(mount, (node) => node.tag === "th").map((cell) => cell.textContent)
    assert.deepEqual(headers, [ZH["admin.gitSources.name"], ZH["admin.gitSources.col.platform"], ZH["admin.gitSources.pat"], ZH["admin.gitSources.col.status"],
      ZH["admin.gitSources.col.syncMode"], ZH["admin.gitSources.col.lastSync"], ZH["admin.gitSources.col.actions"]], "源表七列")
    assert.ok(textOf(mount).includes("GitHub") && textOf(mount).includes("…abcd"), "平台文案 + PAT 掩码（零明文）")
    assert.ok(textOf(mount).includes(ZH["admin.gitSources.neverSynced"]), "未同步空态句")
    const buttons = () => fFindAll(mount, (node) => node.tag === "button")
    for (const label of ["sync", "repos", "check", "edit", "remove"]) {
      assert.equal(buttons().some((button) => button.textContent === ZH[`admin.gitSources.${label}`]), true, `五钮恒显：${label}`)
    }

    // 立即同步：进行中禁（文案「同步中……」）⇒ 释放 ⇒ 终态刷新（失败 + 分类人话）
    const pending = buttons().find((button) => button.textContent === ZH["admin.gitSources.sync"]).fire("click")
    await settle()
    const busy = fFindAll(mount, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.gitSources.syncing"])
    assert.ok(busy !== undefined && busy.disabled === true, "进行中禁 + 文案「同步中……」")
    release()
    await pending
    await settle()
    assert.deepEqual(calls.filter(([method, path]) => method === "POST" && path === "/api/admin/git-sources/1/sync").length, 1, "同步径一次")
    assert.ok(textOf(mount).includes(ZH["admin.gitSources.resultFail"]) && textOf(mount).includes(ZH["admin.gitSources.errKind.auth"]), "终态刷新：失败 + 分类人话")
    assert.ok(textOf(mount).includes(ZH["admin.gitSources.patInvalid"]), "token_state='invalid' ⇒ PAT 列人话")

    // 体检：就地读数（成 ⇒ ok 行）
    await fFindAll(mount, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.gitSources.check"]).fire("click")
    await settle()
    assert.ok(textOf(mount).includes(ZH["admin.gitSources.checkOk"].replace("{ms}", "12")), "体检 ok 行就地呈")

    // 编辑窗：平台门（自建才显基址）∥ 事件块（github ∧ 事件）∥ 一次性密钥
    await fFindAll(mount, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.gitSources.edit"]).fire("click")
    await settle()
    const editor = modalOf()
    const selects = fFindAll(editor, (node) => node.tag === "select")
    assert.deepEqual(fFindAll(selects[0], (node) => node.tag === "option").map((option) => option.value), ["gitee", "github", "gitlab", "selfhosted"], "平台四值选单")
    const baseField = fFindAll(editor, (node) => node.tag === "label").find((label) => textOf(label).includes(ZH["admin.gitSources.baseUrl"]))
    assert.equal(baseField.hidden, true, "非自建 ⇒ 基址不显")
    const modeSelect = selects.find((sel) => fFindAll(sel, (node) => node.tag === "option").some((option) => option.value === "event"))
    assert.ok(modeSelect, "同步方式选单按 option 值定位（gitee-namespace-kinds 批类型选单插入后位次后移）")
    const eventOption = fFind(modeSelect, (node) => node.tag === "option" && node.value === "event")
    assert.equal(eventOption.disabled, false, "github ⇒ 「事件」可选")
    const eventTitle = fFindAll(editor, (node) => node.tag === "h4").find((node) => node.textContent === ZH["admin.gitSources.eventTitle"])
    assert.equal(eventTitle.parent.hidden, true, "事件块默认隐（poll 模式）")
    modeSelect.value = "event"
    await modeSelect.fire("change")
    assert.equal(eventTitle.parent.hidden, false, "事件块（github ∧ 事件）")
    assert.ok(textOf(editor).includes("/api/hooks/git-sources/1") && textOf(editor).includes(ZH["admin.gitSources.secretUnset"]), "地址行（id 在径）+ 密钥「未生成」态")
    assert.ok(textOf(editor).includes(ZH["admin.gitSources.registerSteps"]), "登记步说明在册")
    await fFindAll(editor, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.gitSources.generate"]).fire("click")
    await settle()
    assert.deepEqual(calls.filter(([method, path]) => method === "POST" && path === "/api/admin/git-sources/1/hook-secret").length, 1, "密钥生成径一次")
    assert.ok(textOf(editor).includes("abcd1234ef"), "一次性明文回显在册")
    assert.ok(textOf(editor).includes("…34ef"), "读面掩码态（末 4）")
    assert.ok(textOf(editor).includes(ZH["admin.gitSources.rotateNote"]), "轮换语义句在册")
    await fFind(editor, (node) => node.tag === "button" && node.className === "modal-close").fire("click")
    await settle()

    // 删除确认：后果句 + 防护处置句 + 400 就地呈（窗不关）
    await fFindAll(mount, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.gitSources.remove"]).fire("click")
    const confirm = modalOf()
    assert.ok(textOf(confirm).includes(ZH["admin.gitSources.deleteConfirm"].replace("{name}", "src-a")), "后果句逐值")
    assert.ok(textOf(confirm).includes(ZH["admin.gitSources.deleteBlocked"]), "防护处置句在册")
    await fFindAll(confirm, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.gitSources.remove"]).fire("click")
    await settle()
    assert.ok(modalOf() !== null, "400 ⇒ 窗不关（可重试）")
    assert.ok(textOf(modalOf()).includes("尚有 2 个项目挂此源"), "删源防护人话就地呈")
  } finally { delete globalThis.document }
})
