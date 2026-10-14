/**
 * views-admin-projects.mjs — 管理·项目（webui/PROJECTS.md §2.2/§2.3——KD-SV-124 ∥ KD-SV-149；team-projects-permissions 批（B2）∥
 * project-sources-merge 批（两标签壳——2026-10-13）；台账 #1216）：`#/admin/projects`（admin 门）——页题 + 两标签
 * （「项目」∥「Git 源」；子段 `#/admin/projects/<tab>`）= `createTabs`（公共组件 `tabs.mjs`——KD-SV-102）＋两面板：
 * 面板①「项目」= 全量项目表（显示名 ∥ 仓地址 ∥ 源 ∥ 负责人 ∥ 成员数——搜索 ∥「添加仓」钮〔面板内〕；行点击 ⇒
 * 项目详情弹窗（共用构建器单源住 `views-projects.mjs`——admin 能力面全显））∥ 面板②「Git 源」= `renderGitSources`
 * （`views-git-sources.mjs`——面板形，导出名不变；页题 h2 已撤）。
 *
 * 懒读 = 面板首激活建即读（未激活面板零读——首屏只读一个列表）；切换 = `history.replaceState` 写子段（不触发 hashchange——
 * 零重渲）；非法 ∥ 缺省子段 ⇒ 标签①回落（组件 `initial` 静默回落）；面板建后保活（重切不重建）。
 * 判权全在后端（管理面 = `requireAdmin`——页面不是判据）；文案经 `t()` 取值（标签词复用既有 nav 键——零新增键）；
 * 渲染一律节点 + textContent（零拼串）。端点 = gateway/API.md §2.9（列表径与我的页同源——admin 读数 ⇒ 全量集）。
 */
import { t } from "./i18n.mjs"
import { createTabs } from "./tabs.mjs"
import { openAddRepoDialog, openProjectDetail, projectsTable } from "./views-projects.mjs"
import { renderGitSources } from "./views-git-sources.mjs"

export async function renderAdminProjects(ctx, mount, sub = null) {
  const { h } = ctx

  /** 面板①「项目」建（首激活一次——数据随建读；`build` 为同步口 ⇒ 异步读不 await）。 */
  const buildProjectsPanel = () => {
    const search = h("input", { placeholder: t("me.projects.searchPh") })
    const box = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
    /** 取数 + 渲染（全量集——admin 读数；`?q=` 搜索与我的页同径）。 */
    const load = async () => {
      box.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
      try {
        const keyword = search.value.trim()
        const data = await ctx.api(keyword === "" ? "/api/projects" : `/api/projects?q=${encodeURIComponent(keyword)}`)
        const projects = data.projects ?? []
        box.replaceChildren(projects.length === 0
          ? h("p", { class: "hint", text: t("admin.projects.empty") })
          : projectsTable(ctx, {
              projects,
              open: (project) => openProjectDetail(ctx, { projectId: project.id, onChanged: load }),
              extraHeaders: [t("me.projects.col.owner"), t("admin.projects.col.memberCount")],
              extraCells: (project) => [h("td", { text: project.owner ?? "—" }), h("td", { text: String(project.memberCount ?? 0) })],
            }))
      } catch (error) {
        ctx.fail(error)
        box.replaceChildren(h("p", { class: "hint error", text: t("admin.projects.loadFailed") }))
      }
    }
    const form = h("form", { class: "row-form" }, search, h("button", { type: "submit", text: t("me.projects.search") }))
    form.addEventListener("submit", (event) => { event.preventDefault(); load() })
    const addBtn = h("button", { type: "button", text: t("admin.projects.addBtn"), onclick: () => openAddRepoDialog(ctx, { onAdded: load }) }) // 入口①：面板①内钮（非页头位——页头位会在标签②仍在场；入口② = 面板②源行「拉列表」）
    load() // 数据随建读（未激活面板零读——本面板首激活即此建点）
    return h("div", {}, h("div", { class: "row-form" }, addBtn), h("section", { class: "card" }, form, box))
  }

  /** 面板②「Git 源」建（首激活一次——件 = `renderGitSources` 面板形；导出名不变，页题 h2 已撤）。 */
  const buildGitSourcesPanel = () => {
    const panel = h("div")
    renderGitSources(ctx, panel) // 同步段入面板（异步读随建起——同面板①口径）
    return panel
  }

  const tabs = createTabs(ctx, {
    tabs: [
      { id: "projects", labelKey: "nav.page.admin.projects", build: buildProjectsPanel },
      { id: "git-sources", labelKey: "nav.page.admin.gitSources", build: buildGitSourcesPanel },
    ],
    initial: sub, // 子段 = 初始标签（非法 ∥ 缺省 ⇒ 标签①回落——组件内静默校验）
    onChange: (id) => { history.replaceState(null, "", `#/admin/projects/${id}`) }, // 地址栏径（不触发 hashchange——零重渲）
  })
  mount.append(h("h2", { text: t("admin.projects.title") }), tabs.root)
}
