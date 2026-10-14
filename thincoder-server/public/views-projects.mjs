/**
 * views-projects.mjs — 我的·项目页 + 项目面共用构建器（webui/PROJECTS.md §2.1/§2.2——KD-SV-124；team-projects-permissions 批（B2）；台账 #1216）：
 * `#/me/projects`（可见项目表（显示名 ∥ 仓地址 ∥ 源 ∥ 我的权限 ∥ 负责人——搜索 ∥ 行点击 ⇒ 项目详情弹窗）；需求 44②「未授权即不可见」的成员落点）∥
 * 共用件单源（三入口消费：我的页 ∥ 管理页 ∥ Git 源页「拉列表」预选源）：**项目详情弹窗**（权限感知——`my` 读数显隐：成员操作列 ∥ 加成员 ∥
 * 改显示名 ∥ 改地址（admin）∥ 更换负责人（admin）∥ 删除钮（`can.delete`）+ 确认窗）∥ **添加仓对话框**（源拉列表勾选批量 ∥ 手输保底）。
 *
 * 判权全在后端（控件显隐 = 服务端 `my` 读数——`can` 六键 ∥ `admin` 布尔；页面不是判据——直打端点仍 403/404）；渲染一律节点 + textContent（零拼串）；
 * 文案经 `t()` 取值；失败就地人话（404 直取 = 「项目不存在或不可见」——刷新列表收口）。端点 = gateway/API.md §2.9。
 * 导出面 = 单元测试档直测（`levelLabel` ∥ `readKindLabel` ∥ `countsText` ∥ `projectsTable` ∥ 共用件两枚：`openProjectDetail` ∥ `openAddRepoDialog`）。
 */
import { mapError, t } from "./i18n.mjs"
import { confirmModal, field, openModal, showNote, submitThen } from "./modal.mjs"

/** 档位三值文案键（成员档位 ∥ 我的权限徽标共用——判据 = project/PROJECTS.md §3）。 */
const LEVEL_KEYS = { read: "me.projects.level.read", readwrite: "me.projects.level.readwrite", manage: "me.projects.level.manage" }
/** 读取失败分类键（六值——`error.kind`；拉列表 ∥ Git 源页同步/体检三面共用——键族 = Git 源部件）。 */
const ERR_KIND_KEYS = {
  auth: "admin.gitSources.errKind.auth",
  scope_missing: "admin.gitSources.errKind.scopeMissing",
  unreachable: "admin.gitSources.errKind.unreachable",
  timeout: "admin.gitSources.errKind.timeout",
  http_error: "admin.gitSources.errKind.httpError",
  bad_response: "admin.gitSources.errKind.badResponse",
}

/** 档位/徽标文案（纯函数——单元测试档断言）：负责人优先显；档位空（admin 非成员）⇒ 「—」。 */
export function levelLabel(level, isOwner = false) {
  if (isOwner === true) return t("me.projects.level.owner")
  return LEVEL_KEYS[level] === undefined ? "—" : t(LEVEL_KEYS[level])
}

/** 徽标类（四态——只读中性 ∥ 读写 accent ∥ 管理 ok ∥ 负责人 warn；零新颜色变量——全取既有色板）。 */
function badgeOf(level, isOwner) {
  if (isOwner === true) return "badge warn"
  if (level === "readwrite") return "badge accent"
  if (level === "manage") return "badge ok"
  return "badge"
}

/** 分类人话（纯函数——六值；枚举外 ⇒ 原值兜底）。 */
export function readKindLabel(kind) {
  const key = ERR_KIND_KEYS[kind]
  return key === undefined ? String(kind ?? "—") : t(key)
}

/** 同步计数摘要（缺键 ⇒ 0——占位符恒填；Git 源页结果列 ∥ 审计详情两处共用）。 */
export function countsText(counts) {
  return t("admin.gitSources.syncCounts", {
    projects: counts?.projects ?? 0, added: counts?.added ?? 0, updated: counts?.updated ?? 0, removed: counts?.removed ?? 0,
  })
}

/** 读败面（分类人话 + 服务端原文——拉列表就地呈；转读失败（我们的 API 抛）⇒ `mapError` 人话）。 */
function readErrorNodes(ctx, error) {
  const { h } = ctx
  const nodes = [h("p", { class: "hint error", text: error?.kind === undefined ? mapError(error ?? {}) : readKindLabel(error.kind) })]
  if (typeof error?.message === "string" && error.message !== "") nodes.push(h("p", { class: "hint", text: error.message }))
  return nodes
}

// ── 页：我的·项目（`#/me/projects`——全体；可见集由服务端过滤） ─────────────────

export async function renderMeProjects(ctx, mount) {
  const { h } = ctx
  const search = h("input", { placeholder: t("me.projects.searchPh") })
  const box = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  /** 取数 + 渲染（成 ⇒ 表/空态；败 ⇒ 页内人话——`ctx.fail` 同拍）。 */
  const load = async () => {
    box.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    try {
      const keyword = search.value.trim()
      const data = await ctx.api(keyword === "" ? "/api/projects" : `/api/projects?q=${encodeURIComponent(keyword)}`)
      const projects = data.projects ?? []
      box.replaceChildren(projects.length === 0
        ? h("div", {}, h("p", { class: "hint", text: t("me.projects.empty") }), h("p", { class: "hint", text: t("me.projects.emptyHint") }))
        : projectsTable(ctx, {
            projects,
            open: (project) => openProjectDetail(ctx, { projectId: project.id, onChanged: load }),
            extraHeaders: [t("me.projects.col.level"), t("me.projects.col.owner")],
            extraCells: (project, mine) => [
              h("td", {}, h("span", { class: badgeOf(project.level, mine), text: levelLabel(project.level, mine) })),
              h("td", { text: project.owner ?? "—" }),
            ],
          }))
    } catch (error) {
      ctx.fail(error)
      box.replaceChildren(h("p", { class: "hint error", text: t("me.projects.loadFailed") }))
    }
  }
  const form = h("form", { class: "row-form" }, search, h("button", { type: "submit", text: t("me.projects.search") }))
  form.addEventListener("submit", (event) => { event.preventDefault(); load() })
  mount.append(h("h2", { text: t("me.projects.title") }), h("section", { class: "card" }, form, box))
  await load()
}

/** 项目表（我的 ∥ 管理两页同构——共有三列 + 页别列（`extraHeaders`/`extraCells`）；行点击/键盘 ⇒ `open`）。 */
export function projectsTable(ctx, { projects, open, extraHeaders = [], extraCells = null }) {
  const { h } = ctx
  const me = ctx.state?.member?.username ?? null
  const headers = [t("me.projects.col.name"), t("me.projects.col.address"), t("me.projects.col.source"), ...extraHeaders]
  const rows = projects.map((project) => {
    const mine = project.owner !== null && project.owner !== undefined && project.owner === me // 负责人优先显（行 = 我的读数）
    const tr = h("tr", { class: "row-clickable", tabindex: "0" },
      h("td", { text: project.displayName }),
      h("td", {}, h("code", { text: project.address })),
      h("td", { text: project.source === null || project.source === undefined ? "—" : project.source.name }),
      ...(extraCells === null ? [] : extraCells(project, mine)))
    const show = () => open(project)
    tr.addEventListener("click", show)
    tr.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); show() } })
    return tr
  })
  return h("div", { class: "table-wrap" },
    h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...rows)))
}

// ── 共用件：项目详情弹窗（权限感知——`my` 读数显隐；§2.1） ──────────────────────

/** 详情弹窗（我的 ∥ 管理两页行点击共用；`onChanged` = 宿主页列表刷新口——动作成 ∥ 404 收口两径调用）。 */
export function openProjectDetail(ctx, { projectId, onChanged = null }) {
  const { h } = ctx
  const bodyBox = h("div")
  const footBox = h("div", { class: "row-form" })
  const note = h("p", { class: "hint error", hidden: true }) // 窗内状态行（动作失败就地人话）
  const modal = openModal({ title: t("me.projects.detailTitle"), body: bodyBox, footer: footBox })

  /** 数据重取 + 全量重渲（动作成后收口）。 */
  const reload = async () => {
    bodyBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    note.hidden = true
    try {
      const data = await ctx.api(`/api/projects/${projectId}`)
      render(data.project, data.members ?? [], data.my ?? {})
    } catch (error) {
      if (error?.status === 404) { // 不存在或不可见——两态不辨（KD-SV-120）；刷新列表收口
        bodyBox.replaceChildren(h("p", { class: "hint error", text: t("me.projects.notFound") }))
        footBox.replaceChildren(h("button", { type: "button", class: "tiny", text: t("common.close"), onclick: () => modal.close() }))
        await onChanged?.()
        return
      }
      ctx.fail(error)
      bodyBox.replaceChildren(h("p", { class: "hint error", text: t("me.projects.loadFailed") }))
    }
  }

  /** 动作收口（`call` = thunk——house 约定沿 `modal.mjs` submitThen）：成 ⇒ flash + 重载（弹窗与列表同拍）；败 ⇒ 窗内状态行（编辑器保持——可重试；本档 `act` 无 submitThen 的钮 disable/复位两拍——评审 #133 收正）。 */
  const act = async (call, message) => {
    note.hidden = true
    try {
      await call()
      ctx.flash(message)
      await reload()
      await onChanged?.()
    } catch (error) {
      showNote(note, mapError(error))
    }
  }

  /** 就地编辑（改控件三件：input 预填现值 ⇒ 保存 ⇒ `act`；取消 ⇒ 重载还原）。 */
  const editInPlace = (cell, value, call, message) => {
    const input = h("input", { value })
    const save = h("button", { type: "button", class: "tiny", text: t("common.save") })
    const cancel = h("button", { type: "button", class: "tiny", text: t("common.cancel") })
    save.addEventListener("click", () => act(() => call(input.value.trim()), message))
    cancel.addEventListener("click", () => reload())
    cell.replaceChildren(input, save, cancel)
    input.focus()
  }

  const render = (project, members, my) => {
    const can = my.can ?? {}
    const ownerCell = h("dd", {}, project.owner ?? "—")
    const nameCell = h("dd", {}, project.displayName)
    const addressCell = h("dd", {}, h("code", { text: project.address }))
    if (can.rename === true) { // 负责人 ∥ admin（服务端同判）
      const rename = h("button", { type: "button", class: "tiny", text: t("me.projects.rename") })
      rename.addEventListener("click", () => editInPlace(nameCell, project.displayName,
        (value) => ctx.api(`/api/projects/${projectId}`, { method: "PATCH", body: { displayName: value } }), t("me.projects.renamed")))
      nameCell.append(" ", rename)
    }
    if (my.admin === true) { // 改仓地址仅 admin（KD-SV-121；非 admin 无此控件）
      const edit = h("button", { type: "button", class: "tiny", text: t("me.projects.modifyAddress") })
      edit.addEventListener("click", () => editInPlace(addressCell, project.address,
        (value) => ctx.api(`/api/projects/${projectId}`, { method: "PATCH", body: { address: value } }), t("me.projects.addressSaved")))
      addressCell.append(" ", edit)
      const change = h("button", { type: "button", class: "tiny", text: t("me.projects.changeOwner") }) // 负责人指派/更换 = admin
      change.addEventListener("click", () => {
        if (members.length === 0) { showNote(note, t("me.projects.membersEmpty")); return }
        const select = h("select", {}, ...members.map((member) => h("option", { value: member.username, text: member.username })))
        select.value = project.owner ?? members[0].username
        const save = h("button", { type: "button", class: "tiny", text: t("common.save") })
        const cancel = h("button", { type: "button", class: "tiny", text: t("common.cancel") })
        save.addEventListener("click", () => act(() => ctx.api(`/api/projects/${projectId}`, { method: "PATCH", body: { owner: select.value } }), t("me.projects.ownerSaved")))
        cancel.addEventListener("click", () => reload())
        ownerCell.replaceChildren(select, save, cancel)
      })
      ownerCell.append(" ", change)
    }

    const headers = [t("col.username"), t("me.projects.col.memberLevel"), t("me.projects.col.origin"),
      ...(can.manageMembers === true ? [t("me.projects.col.actions")] : [])]
    const rows = members.map((member) => {
      const isOwner = member.username === project.owner
      const cells = [
        h("td", {}, member.username, isOwner ? h("span", { class: "badge warn", text: t("me.projects.level.owner") }) : null),
        h("td", { text: levelLabel(member.level) }),
        h("td", { text: t(member.origin === "sync" ? "me.projects.origin.sync" : "me.projects.origin.manual") }),
      ]
      if (can.manageMembers === true) { // 操作列仅 `can.manageMembers`；负责人行保护 = 无移除/降档控件（KD-SV-121）
        cells.push(isOwner === true ? h("td", { text: "—" }) : membersActions(ctx, { projectId, member, act }))
      }
      return h("tr", {}, ...cells)
    })
    const memberTable = members.length === 0
      ? h("p", { class: "hint", text: t("me.projects.membersEmpty") })
      : h("div", { class: "table-wrap" }, h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...rows)))

    const addMember = can.manageMembers === true ? addMemberRow(ctx, { projectId, act, note }) : null
    bodyBox.replaceChildren(
      h("dl", { class: "detail-grid" },
        h("dt", { text: t("me.projects.col.name") }), nameCell,
        h("dt", { text: t("me.projects.col.address") }), addressCell,
        h("dt", { text: t("me.projects.col.source") }),
        h("dd", { text: project.source === null || project.source === undefined ? "—" : `${project.source.name} · ${project.source.platform}` }),
        h("dt", { text: t("me.projects.col.owner") }), ownerCell),
      h("h4", { text: t("me.projects.membersTitle") }), memberTable,
      ...(addMember === null ? [] : [addMember]), note)

    footBox.replaceChildren(
      ...(can.delete === true ? [deleteButton(ctx, { projectId, project, modal, onChanged })] : []),
      h("button", { type: "button", class: "tiny", text: t("common.close"), onclick: () => modal.close() }))
  }
  reload().catch(() => {})
  return modal
}

/** 成员行操作（改档选单 ∥ 移除钮——`can.manageMembers` 面；`act` = 弹窗动作收口）。 */
function membersActions(ctx, { projectId, member, act }) {
  const { h } = ctx
  const select = h("select", {}, ...Object.keys(LEVEL_KEYS).map((level) => h("option", { value: level, text: levelLabel(level) })))
  select.value = member.level
  select.addEventListener("change", () => act(
    () => ctx.api(`/api/projects/${projectId}/members/${encodeURIComponent(member.username)}`, { method: "PATCH", body: { level: select.value } }),
    t("me.projects.memberUpdated", { username: member.username })))
  const remove = h("button", { type: "button", class: "tiny danger", text: t("me.projects.memberRemove") })
  remove.addEventListener("click", () => act(
    () => ctx.api(`/api/projects/${projectId}/members/${encodeURIComponent(member.username)}`, { method: "DELETE" }),
    t("me.projects.memberRemoved", { username: member.username })))
  return h("td", {}, select, remove)
}

/** 加成员行（用户名 + 档位选单 + 添加——仅 `can.manageMembers`；档位缺省 = 只读底线）。 */
function addMemberRow(ctx, { projectId, act, note }) {
  const { h } = ctx
  const username = h("input", { placeholder: t("me.projects.memberPh") })
  const select = h("select", {}, ...Object.keys(LEVEL_KEYS).map((level) => h("option", { value: level, text: levelLabel(level) })))
  const add = h("button", { type: "button", class: "tiny", text: t("me.projects.memberAdd") })
  add.addEventListener("click", () => {
    const name = username.value.trim()
    if (name === "") { showNote(note, t("admin.projects.requiredField", { field: t("me.projects.memberPh") })); return }
    return act(() => ctx.api(`/api/projects/${projectId}/members`, { method: "POST", body: { username: name, level: select.value } }),
      t("me.projects.memberAdded", { username: name }))
  })
  return h("div", { class: "row-form" }, username, select, add)
}

/** 「删除项目」钮（仅 `can.delete` 渲）+ 二次确认窗（后果句：成员表随删 ∥ 不可恢复——服务端 `confirm` 门同判）。 */
function deleteButton(ctx, { projectId, project, modal, onChanged }) {
  const { h } = ctx
  const del = h("button", { type: "button", class: "danger", text: t("me.projects.deleteSubmit") })
  del.addEventListener("click", () => {
    const { modal: confirm, note, confirmBtn } = confirmModal(ctx, {
      title: "me.projects.deleteTitle",
      bodyText: "me.projects.deleteConfirm",
      bodyParams: { name: project.displayName },
      confirmText: t("me.projects.deleteSubmit"),
      submit: () => submitThen(ctx, {
        note, button: confirmBtn, modal: confirm,
        call: () => ctx.api(`/api/admin/projects/${projectId}`, { method: "DELETE", body: { confirm: true } }),
        flash: t("me.projects.deleted", { name: project.displayName }),
        reload: async () => { modal.close(); await onChanged?.() },
      }),
    })
  })
  return del
}

// ── 共用件：添加仓对话框（拉列表勾选批量 ∥ 手输保底；§2.2——管理页 ∥ Git 源页两入口） ──────────

/** 添加仓对话框（`sourceId` = 预选源（Git 源页「拉列表」入口）∥ null；`onAdded` = 宿主页刷新口）。 */
export function openAddRepoDialog(ctx, { sourceId = null, onAdded = null } = {}) {
  const { h } = ctx
  const sourceSelect = h("select", {}, h("option", { value: "", text: t("admin.projects.sourceManual") }))
  const readBtn = h("button", { type: "button", class: "tiny", text: t("admin.projects.readBtn") })
  const filter = h("input", { placeholder: t("admin.projects.filterPh") })
  const truncatedHint = h("p", { class: "hint", text: t("admin.projects.truncated"), hidden: true })
  const listBox = h("div", { class: "table-slot" })
  const note = h("p", { class: "hint error", hidden: true }) // 窗内状态行（源区：读取失败/提交失败/需先选源）
  const submitBtn = h("button", { type: "button", text: t("admin.projects.submitCount", { count: 0 }) })
  const address = h("input", { placeholder: t("admin.projects.addressPh") })
  const displayName = h("input", { placeholder: t("admin.projects.displayNamePh") })
  const owner = h("select", {}, h("option", { value: "", text: t("admin.projects.ownerNone") }))
  const manualNote = h("p", { class: "hint error", hidden: true })
  const manualSubmit = h("button", { type: "button", text: t("admin.projects.manualSubmit") })
  let repos = [] // 已载仓库行（`{ fullName, address, private, known }`——勾选态随行对象留存：过滤/失败重渲不丢）
  let boxes = [] // 勾选节点对照（提交收集 + 计数随动——每次渲染重建）

  const modal = openModal({ title: t("admin.projects.dialogTitle"), body: h("div", { class: "stack-box" },
    h("h4", { text: t("admin.projects.sourceLabel") }),
    h("div", { class: "row-form" }, sourceSelect, readBtn),
    h("div", { class: "filter-row" }, filter),
    truncatedHint, listBox, note, submitBtn,
    h("h4", { text: t("admin.projects.manualTitle") }),
    h("div", { class: "provider-form stacked" },
      field(h, "admin.projects.addressLabel", address),
      field(h, "admin.projects.displayNameLabel", displayName),
      field(h, "admin.projects.ownerLabel", owner),
      manualNote, manualSubmit)) })

  // 源清单（含「手输（无源）」项；读败 ⇒ 窗内一行人话——不反噬手输区）
  ctx.api("/api/admin/git-sources").then((data) => {
    for (const source of data.sources ?? []) sourceSelect.append(h("option", { value: String(source.id), text: source.name }))
    if (sourceId !== null) sourceSelect.value = String(sourceId)
  }).catch(() => { showNote(note, t("admin.gitSources.loadFailed")) })
  // 负责人选单（成员表读——可空；读败 ⇒ 手输区一行人话）
  ctx.api("/api/members").then((data) => {
    for (const member of data.members ?? []) owner.append(h("option", { value: member.username, text: member.username }))
  }).catch(() => { showNote(manualNote, t("admin.projects.ownerLoadFailed")) })

  /** 勾选计数（已在册行禁提交——不计）；按钮文案随动。 */
  const countChecked = () => {
    submitBtn.textContent = t("admin.projects.submitCount", { count: boxes.filter(({ box }) => box.checked === true && box.disabled !== true).length })
  }
  const renderRepos = () => {
    boxes = []
    const keyword = filter.value.trim().toLowerCase()
    const shown = repos.filter((repo) => keyword === "" || String(repo.fullName).toLowerCase().includes(keyword))
    if (repos.length === 0) { listBox.replaceChildren(h("p", { class: "hint", text: t("admin.projects.reposEmpty") })); return }
    if (shown.length === 0) { listBox.replaceChildren(h("p", { class: "hint", text: t("admin.projects.reposNoMatch") })); return }
    const rows = shown.map((repo) => {
      const box = h("input", { type: "checkbox", checked: repo.known === true || repo.checked === true, disabled: repo.known === true }) // 已在册 ⇒ 标 + 禁提交
      box.addEventListener("change", () => { repo.checked = box.checked; countChecked() })
      boxes.push({ repo, box })
      return h("tr", {}, h("td", {}, h("label", {}, box, repo.fullName,
        repo.private === true ? h("span", { class: "badge", text: t("admin.projects.privateTag") }) : null,
        repo.known === true ? h("span", { class: "badge ok", text: t("admin.projects.knownTag") }) : null)))
    })
    listBox.replaceChildren(h("div", { class: "table-wrap" }, h("table", {}, h("tbody", {}, ...rows))))
  }
  const readRepos = async () => {
    const value = sourceSelect.value
    if (value === "") { showNote(note, t("admin.projects.pickSource")); return }
    note.hidden = true
    truncatedHint.hidden = true
    listBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    /** 读败面（分类人话 + 重试——窗内就地呈，不关窗）。 */
    const failFace = (error) => listBox.replaceChildren(h("div", { class: "stack-box" }, ...readErrorNodes(ctx, error),
      h("button", { type: "button", class: "tiny", text: t("admin.projects.retry"), onclick: readRepos })))
    try {
      const data = await ctx.api(`/api/admin/git-sources/${encodeURIComponent(value)}/repos`)
      if (data?.ok === true) {
        repos = data.repos ?? []
        truncatedHint.hidden = data.truncated !== true
        renderRepos()
        countChecked()
      } else {
        failFace(data?.error ?? {})
      }
    } catch (error) {
      failFace(error)
    }
  }
  readBtn.addEventListener("click", readRepos)
  filter.addEventListener("input", renderRepos)
  sourceSelect.addEventListener("change", () => { // 换源 ⇒ 旧列表作废（提交体 `sourceId` 取现选中值——防跨源错挂）
    repos = []
    boxes = []
    listBox.replaceChildren()
    truncatedHint.hidden = true
    note.hidden = true
    submitBtn.textContent = t("admin.projects.submitCount", { count: 0 })
  })

  submitBtn.addEventListener("click", async () => {
    const picked = boxes.filter(({ box }) => box.checked === true && box.disabled !== true).map(({ repo }) => repo)
    if (picked.length === 0) { showNote(note, t("admin.projects.pickHint")); return }
    note.hidden = true
    submitBtn.disabled = true
    try {
      await ctx.api("/api/admin/projects", { method: "POST", body: { sourceId: Number(sourceSelect.value), repos: picked.map((repo) => (repo.fullName ? { address: repo.address, displayName: repo.fullName } : { address: repo.address })) } })
      ctx.flash(t("admin.projects.added", { count: picked.length }))
      modal.close()
      await onAdded?.()
    } catch (error) {
      submitBtn.disabled = false
      showNote(note, mapError(error)) // 全成或全拒：撞重复 ⇒ 重复项人话就地呈；勾选保留（可改）
    }
  })
  manualSubmit.addEventListener("click", async () => {
    const value = address.value.trim()
    if (value === "") { showNote(manualNote, t("admin.projects.requiredField", { field: t("admin.projects.addressLabel") })); return }
    manualNote.hidden = true
    manualSubmit.disabled = true
    try {
      await ctx.api("/api/admin/projects", { method: "POST", body: { address: value, displayName: displayName.value.trim() || null, owner: owner.value || null } })
      ctx.flash(t("admin.projects.added", { count: 1 }))
      modal.close()
      await onAdded?.()
    } catch (error) {
      manualSubmit.disabled = false
      showNote(manualNote, mapError(error))
    }
  })
  return modal
}
