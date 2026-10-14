/**
 * nav.mjs — 控制台导航单源（webui/WEBUI.md §2 ∥ KD-SV-20）：组/项数据（我的 7 ∥ 管理 11——2026-10-10 代理回迁批去代理项 ∥ 沙盒运行面批 +「沙盒」项 ∥ admin-agent-chat 批 +「对话」项〔总览后〕 ∥ team-projects-permissions 批 +三项〔我的·项目末位 ∥ 管理·项目 ∥ 管理·Git 源——「成员」后〕
 * ∥ sandbox-outbound-member-face 批 +「我的工作区」项〔我的·项目后〕 ∥ team-ledger 批 +「团队台账」项〔我的·末位〕 ∥ project-sources-merge 批：「管理·Git 源」项退场〔并入管理·项目页标签②——管理 11 ⇒ 10〕 ∥ member-face-chat 批 +「对话」项〔我的·首位〕 ∥ server-mcp 批 +「MCP 服务器」项〔管理·模型后〕）∥ `resolveRoute` 纯函数
 * （无 DOM——单元测试档直测：别名重定向 ∥ 角色默认 ∥ admin 面 `denied` ∥ 子段容许——console-tabs-component 批）∥ 侧栏渲染（品牌 ∥ 组标题/项/活动态 ∥
 * 底部 meta 槽（健康状态灯 + 版本行 + 语言切换器）+ 退出登录）。
 *
 * 文案单源 = 文案表（`i18n-zh.mjs` ∥ `i18n-en.mjs`）——本档数据持 `labelKey`（键——非字面量），渲染经 `t()` 取值
 * （`webui/I18N.md` §2.1）；判权全在后端——`denied` 仅页面级「无权限」块（服务端才是判据——§3）。零外部资源（内网自洽）。
 * 健康状态灯（`webui/READINGS.md` §2.1⑤）= meta 槽 `#nav-health` 占位元素（点 + 文案）——app.mjs 轮询回调直更，无整页重渲。
 */
import { t, langSwitch } from "./i18n.mjs"

/** 侧栏组/项（数据单源——path = hash 路径；labelKey = 文案表键；adminOnly = 仅 admin 渲染且可过 `denied` 判）。 */
export const NAV_GROUPS = [
  { key: "me", labelKey: "nav.group.me", items: [
    { key: "chat", labelKey: "nav.page.me.chat", path: "/me/chat" },
    { key: "keys", labelKey: "nav.page.me.keys", path: "/me/keys" },
    { key: "usage", labelKey: "nav.page.me.usage", path: "/me/usage" },
    { key: "account", labelKey: "nav.page.me.account", path: "/me/account" },
    { key: "projects", labelKey: "nav.page.me.projects", path: "/me/projects" },
    { key: "sandbox", labelKey: "nav.page.me.sandbox", path: "/me/sandbox" },
    { key: "ledger", labelKey: "nav.page.me.ledger", path: "/me/ledger" },
  ] },
  { key: "admin", labelKey: "nav.group.admin", adminOnly: true, items: [
    { key: "overview", labelKey: "nav.page.admin.overview", path: "/admin/overview" },
    { key: "chat", labelKey: "nav.page.admin.chat", path: "/admin/chat" },
    { key: "members", labelKey: "nav.page.admin.members", path: "/admin/members" },
    { key: "projects", labelKey: "nav.page.admin.projects", path: "/admin/projects" },
    { key: "providers", labelKey: "nav.page.admin.providers", path: "/admin/providers" },
    { key: "models", labelKey: "nav.page.admin.models", path: "/admin/models" },
    { key: "mcp", labelKey: "nav.page.admin.mcp", path: "/admin/mcp" },
    { key: "usage", labelKey: "nav.page.admin.usage", path: "/admin/usage" },
    { key: "audit", labelKey: "nav.page.admin.audit", path: "/admin/audit" },
    { key: "system", labelKey: "nav.page.admin.system", path: "/admin/system" },
    { key: "sandbox", labelKey: "nav.page.admin.sandbox", path: "/admin/sandbox" },
  ] },
]

export const LOGIN_PATH = "/login"

/** 旧链别名（重定向——旧书签可达）：`#/me` ⇒ `#/me/keys` ∥ `#/admin` ⇒ `#/admin/overview` ∥ `#/admin/proxy` ⇒ `#/admin/system`（2026-10-10 代理回迁批——§2）
 * ∥ `#/admin/git-sources` ⇒ `#/admin/projects/git-sources`（2026-10-13 project-sources-merge 批——别名目标再走子段裁分 ⇒ `sub` 回传；重定向带子段）。 */
export const ROUTE_ALIASES = { "/me": "/me/keys", "/admin": "/admin/overview", "/admin/proxy": "/admin/system", "/admin/git-sources": "/admin/projects/git-sources" }

const KNOWN_PAGES = new Set([...NAV_GROUPS.flatMap((group) => group.items.map((item) => item.path)), LOGIN_PATH])
const ADMIN_PREFIX = "/admin/"

/** 角色默认页（`#/` ∥ 未知 hash ⇒ 此）：admin ⇒ `#/admin/overview`（总览——落地页）∥ user ⇒ `#/me/keys`。 */
export function defaultPath(role) {
  return role === "admin" ? "/admin/overview" : "/me/keys"
}

/** hash 路径归一：补前导 `/` ∥ 去尾斜杠（`/me/keys/` ⇒ `/me/keys`；根保 `/`）。 */
export function normalizePath(path) {
  let value = String(path ?? "").trim()
  if (!value.startsWith("/")) value = `/${value}`
  if (value.length > 1) value = value.replace(/\/+$/, "")
  return value
}

/**
 * 路由解析（纯函数——无 DOM）：
 * 返回 `{ path }` ＋ 可选 `sub`（子段——在册页 + 一截末段，供页面消费）∥ `redirect: true`（别名/未知 ⇒ 调用方替换 hash）∥
 * `denied: true`（admin 面非 admin——页面级块）。
 * 子段容许（console-tabs-component 批——2026-10-11 裁定「进」）：`#/<组>/<页>/<子段>`——裁末段试前缀（在册 ⇒ 记 `sub`
 * 供页面消费（页面自判；不认 ⇒ 忽略）∥ 未在册 ⇒ 照旧默认页回落）；登录面（`LOGIN_PATH`）除外——其不经 `PAGES` 分派；
 * 解析序 = 别名先行、别名目标再走子段裁分（别名指向带子段的规范址 ⇒ `sub` 回传——`#/admin/git-sources` ⇒ `/admin/projects` + `sub: "git-sources"`；
 * 2026-10-13 project-sources-merge 批）；既有 hash 形行为逐字不变（webui/TABS.md §2.2）。
 */
export function resolveRoute(path, role) {
  const clean = normalizePath(path)
  if (clean === LOGIN_PATH) return { path: LOGIN_PATH }
  const canonical = ROUTE_ALIASES[clean] ?? clean
  const cut = canonical.lastIndexOf("/")
  const head = cut > 0 ? canonical.slice(0, cut) : canonical
  const sub = KNOWN_PAGES.has(canonical) || !KNOWN_PAGES.has(head) || head === LOGIN_PATH ? null : canonical.slice(cut + 1) // 登录面排除（见上注）
  const resolved = { path: sub === null ? canonical : head }
  if (sub !== null) resolved.sub = sub
  if (!KNOWN_PAGES.has(resolved.path)) return { path: defaultPath(role), redirect: true }
  if (canonical !== clean) resolved.redirect = true
  if (resolved.path.startsWith(ADMIN_PREFIX) && role !== "admin") resolved.denied = true
  return resolved
}

/** 侧栏渲染（DOM 面——`ctx.h` 注入）：品牌 ∥ 组（admin 组仅 admin）∥ 项（活动态）∥ 底部 meta 槽（健康状态灯
 *  `#nav-health`（§2.3⑤——轮询回调直更） + 版本行（`version` 缺省/空 ⇒ 留空静默，`GET /api/system` 失败同面））
 *  + 语言切换器 + 退出登录。 */
export function renderSidebar(ctx, el) {
  const { h, member, path, onLogout, version, onChange } = ctx
  const nodes = [h("div", { class: "brand", text: t("nav.brand") })]
  for (const group of NAV_GROUPS) {
    if (group.adminOnly && member.role !== "admin") continue
    nodes.push(h("div", { class: "nav-group" },
      h("div", { class: "nav-group-title", text: t(group.labelKey) }),
      ...group.items.map((item) => h("a", {
        class: item.path === path ? "nav-item active" : "nav-item",
        href: `#${item.path}`,
        text: t(item.labelKey),
      }))))
  }
  nodes.push(h("div", { class: "nav-bottom" },
    h("div", { class: "health", id: "nav-health" }), // 健康状态灯（点 + 文案——三态 §2.3⑤；轮询回调直更）
    h("div", { class: "meta", id: "nav-meta", text: version ? `v${version}` : "" }), // meta 槽：版本行（全角色）
    langSwitch(h, onChange), // 语言切换器（meta 槽同区——登录后十页全达；窄屏随顶条）
    h("button", { type: "button", class: "link", text: t("nav.logout"), onclick: onLogout })))
  el.replaceChildren(...nodes)
}
