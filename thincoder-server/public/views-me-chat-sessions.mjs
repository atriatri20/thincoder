/**
 * views-me-chat-sessions.mjs — 成员·对话页·会话条（`webui/CHAT.md` §2.2 差异⑨；机制 = `agent/MEMBER-AGENT.md` §3.11(6)）；
 * 自 `views-me-chat.mjs` 外拆（拆档缘由 = 该件越 500 软线——增行前先外拆；member-face-parity 批 KD-SV-221）——面内三族：
 * ① 工作区读数段（名 ∥ 盒态 ∥ 回收原因 ∥ 在线态——沿 §2.2 差异②）；② **自绘会话下拉**（原生 `<select>` 换自绘——行 = 位标
 *    （● 运行中 ∥ ⏸ 待审批）∥ 标题（槽 `title` 非空顶行 ∥ 空 ⇒ `excerpt`）∥ meta（工作区 · provider · N msgs · 日期）∥
 *    ✎ 行内重命名 ∥ ✕ 删除（>1 时在场；确认门））；③ 成员条自有钮（新会话 ∥ 启动工作区 ∥ 拉取项目 ∥ 重读 ∥ 📁 工作区选择）。
 * 取数/写面归页面（本档零 `fetch`——回调注入）；**会话弹窗三件与四相引导**（`createSessionDialogs`——§3.11(6)：建工作区 ∥ 新会话（预选 = 当刻工作区）∥ 引导四相）同住本档（会话起点面；创建/拾取经回调回页面）。
 * 模型 id 归属派生（`providerOf`）与两纯件（`rowTitleOf`/`rowMetaOf`）单源住本档（§2.2 差异⑧ 口径——composer 模型菜单同引）。
 */
import { mapError, t } from "./i18n.mjs"
import { confirmModal, field, openModal, showNote } from "./modal.mjs"
import { boxStateClass, boxStateLabel, stopReasonLabel } from "./views-me-sandbox.mjs"

/** 模型 id ⇒ 归属名（§2.2 差异⑧：id 首段——首斜杠口径；无斜杠 ⇒ 全串；本页两消费面共引单源）。 */
export function providerOf(id) {
  const text = String(id ?? "")
  const cut = text.indexOf("/")
  return cut > 0 ? text.slice(0, cut) : text
}

/** 会话行标题（自动标题展示——`title` 非空用 `title`、空 ⇒ `excerpt` 顶行；两缺 ⇒ 空串）。 */
export function rowTitleOf(row) {
  const title = typeof row?.title === "string" ? row.title.trim() : ""
  if (title !== "") return title
  return String(row?.excerpt ?? "").trim()
}

/** 会话行 meta（工作区 · provider · N msgs · 日期——§3.11(6) 行形；缺源段零输出）。 */
export function rowMetaOf(row, fmtTs) {
  const parts = []
  const name = String(row?.workspaceName ?? "").trim()
  if (name !== "") parts.push(name)
  const provider = providerOf(row?.model)
  if (provider !== "") parts.push(provider)
  if (typeof row?.count === "number" && Number.isFinite(row.count)) parts.push(t("me.chat.rowMetaMsgs", { n: row.count }))
  const stamp = typeof fmtTs === "function" ? fmtTs(row?.updatedAt) : ""
  if (typeof stamp === "string" && stamp !== "") parts.push(stamp)
  return parts.join(" · ")
}

/** 会话行位标（● 运行中 ∥ ⏸ 待审批——源 = 行 `status`（盒读）+ `awaitingApproval`（relay 在途 ask 读数）；两缺 ⇒ `null` 零位标）。 */
export function rowBadgeOf(row) {
  if (row?.awaitingApproval === true) return { mark: "⏸", key: "me.chat.rowApproval", cls: "chat-dot wait" }
  if (String(row?.status ?? "") === "running") return { mark: "●", key: "me.chat.rowRunning", cls: "chat-dot run" }
  return null
}

/**
 * 会话条工厂。`ctx` = 视图上下文（`h` ∥ `fmtTs`）——本档只读；`deps` 八回调：
 * `onSelect(id)` 拾取会话 · `onNewSession()` 新会话弹窗 · `onStartWorkspace()` 启动工作区 · `onPull()` 拉取弹窗 ·
 * `onReread()` 重读 · `onRename(id, title) ⇒ Promise<boolean>`（页面 `PATCH { title }`）· `onDelete(id) ⇒ Promise<boolean>`（页面 `POST …/delete`）·
 * `onPickWorkspace(id)` 工作区选择。返回 `{ el, render(view), close() }`；`view` = `{ workspaces, sessions, activeId, startingId, ws, row, needStart }`
 * （页面单点快照——`sessions` 已按当刻工作区过滤）。
 */
export function createSessionBar(ctx, deps = {}) {
  const { h } = ctx
  const wsInfo = h("span", { class: "chat-ws" })
  const dropLabel = h("span", { class: "chat-drop-label" })
  const dropBtn = h("button", { type: "button", class: "chat-drop-btn", "aria-haspopup": "listbox", "aria-expanded": "false" }, dropLabel)
  const dropList = h("div", { class: "chat-drop-list", role: "listbox", "aria-label": t("me.chat.selectChat"), hidden: true })
  const drop = h("div", { class: "chat-drop" }, dropBtn, dropList)
  const newBtn = h("button", { type: "button", text: t("me.chat.newSession"), onclick: () => deps.onNewSession?.() })
  const startBtn = h("button", { type: "button", text: t("me.chat.startWorkspace"), onclick: () => deps.onStartWorkspace?.() })
  const pullBtn = h("button", { type: "button", class: "tiny", text: t("me.chat.pull"), onclick: () => deps.onPull?.() })
  const rereadBtn = h("button", { type: "button", class: "tiny", text: t("me.chat.reread"), onclick: () => deps.onReread?.() })
  const wsBtn = h("button", { type: "button", class: "tiny chat-ws-btn", text: "📁", title: t("me.chat.pickWorkspace"), "aria-label": t("me.chat.pickWorkspace"), onclick: () => openWorkspacePicker() })
  const el = h("div", { class: "chat-bar" }, wsInfo, drop, newBtn, startBtn, pullBtn, rereadBtn, wsBtn)
  let view = { workspaces: [], sessions: [], activeId: null, startingId: null, ws: null, row: null, needStart: false }
  let renaming = null // 当刻行内重命名会话 id（单飞——同刻恰一行入编辑态）

  /** 下拉开合（点击钮 ⇒ 反相；选行/点外/Esc ⇒ 关）。 */
  function close() { dropList.hidden = true; dropBtn.setAttribute("aria-expanded", "false") }
  dropBtn.addEventListener("click", () => {
    dropList.hidden = !dropList.hidden
    dropBtn.setAttribute("aria-expanded", String(!dropList.hidden))
  })
  el.addEventListener("keydown", (event) => { if (event.key === "Escape") close() })
  // 点外关闭（重渲跨代累积守：`detach` 收口——页面重渲前先撤上一实例）
  const onDocClick = (event) => { if (dropList.hidden !== true && drop.contains?.(event?.target) !== true) close() }
  document.addEventListener("click", onDocClick)

  /** 工作区读数段（差异②：名 ∥ 盒态读 ∥ 回收原因 ∥ 在线态；缺源 ⇒ 整段隐）。 */
  function paintWs() {
    const nodes = []
    const ws = view.ws
    if (ws !== null && ws !== undefined) {
      nodes.push(h("span", { text: String(ws.name ?? "—") }))
      if (view.startingId === ws.id) nodes.push(h("span", { class: "badge warn", text: t("me.chat.stateStarting") }))
      else nodes.push(h("span", { class: boxStateClass(ws.boxState), text: boxStateLabel(ws.boxState) }))
      if (view.startingId !== ws.id && ws.stopReason !== null && ws.stopReason !== undefined) nodes.push(h("span", { class: "hint", text: stopReasonLabel(ws.stopReason) }))
      const row = view.row
      if (row !== null && typeof row.agentOnline === "boolean") nodes.push(h("span", { class: row.agentOnline ? "badge ok" : "badge off", text: t(row.agentOnline ? "me.chat.online" : "me.chat.offline") }))
    }
    wsInfo.replaceChildren(...nodes)
    wsInfo.hidden = nodes.length === 0
  }

  /** 行内重命名（✎ ⇒ 行内输入 ⇒ Enter/blur 提交 ∥ Esc 取消；单飞守卫）。 */
  function startRename(rowEl, row) {
    const id = String(row.id)
    renaming = id
    const titleEl = rowEl.querySelector(".chat-item-title")
    const input = h("input", { type: "text", class: "chat-item-input", value: rowTitleOf(row), "aria-label": t("me.chat.renamePh") })
    titleEl.parent.insertBefore(input, titleEl)
    titleEl.remove()
    input.focus()
    input.setSelectionRange(0, input.value.length)
    let done = false
    const finish = (commit) => {
      if (done) return
      done = true
      renaming = null
      const value = String(input.value ?? "").trim()
      if (commit && value !== "") void Promise.resolve(deps.onRename?.(id, value)).then(() => render(view), () => render(view))
      else render(view)
    }
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") { event.preventDefault(); finish(true) }
      else if (event.key === "Escape") { event.preventDefault(); finish(false) }
    })
    input.addEventListener("blur", () => finish(true))
    input.addEventListener("click", (event) => event.stopPropagation())
  }

  /** 删除（✕ ⇒ 确认弹层 ⇒ 页面 `POST …/delete { confirm: true }`；失败 ⇒ 窗内人话零改）。 */
  function askDelete(row) {
    const id = String(row.id)
    const handle = confirmModal(ctx, {
      title: "me.chat.deleteTitle",
      bodyText: "me.chat.deleteConfirm",
      confirmText: t("me.chat.deleteSubmit"),
      submit: () => {
        void (async () => {
          handle.confirmBtn.disabled = true
          try {
            const ok = await deps.onDelete?.(id)
            if (ok === true) handle.modal.close()
            else handle.confirmBtn.disabled = false
          } catch (error) { handle.confirmBtn.disabled = false; showNote(handle.note, mapError(error)) }
        })()
      },
    })
  }

  /** 会话行（位标 ∥ 标题 ∥ meta ∥ ✎ ∥ ✕——行点击 = 拾取；行内钮点击不冒泡拾取）。 */
  function rowNode(row) {
    const id = String(row.id)
    const rowEl = h("div", {
      class: `chat-item${id === view.activeId ? " active" : ""}`, role: "option", "aria-selected": String(id === view.activeId),
      onclick: () => { deps.onSelect?.(id); close() },
    })
    const badge = rowBadgeOf(row)
    if (badge !== null) rowEl.append(h("span", { class: badge.cls, text: badge.mark, title: t(badge.key), "aria-label": t(badge.key) }))
    rowEl.append(h("span", { class: "chat-item-title", text: rowTitleOf(row) === "" ? t("me.chat.rowUntitled") : rowTitleOf(row) }))
    const meta = rowMetaOf(row, ctx.fmtTs)
    if (meta !== "") rowEl.append(h("span", { class: "chat-item-meta", text: meta }))
    const renameBtn = h("button", { type: "button", class: "tiny chat-item-btn", text: "✎", title: t("me.chat.rowRename"), "aria-label": t("me.chat.rowRename") })
    renameBtn.addEventListener("click", (event) => { event.stopPropagation(); startRename(rowEl, row) })
    rowEl.append(renameBtn)
    if (view.sessions.length > 1) {
      const delBtn = h("button", { type: "button", class: "tiny chat-item-btn danger", text: "✕", title: t("me.chat.rowDelete"), "aria-label": t("me.chat.rowDelete") })
      delBtn.addEventListener("click", (event) => { event.stopPropagation(); askDelete(row) })
      rowEl.append(delBtn)
    }
    return rowEl
  }

  /** 工作区选择弹层（本人工作区 + 盒态读数 ⇒ 页面切换；启停仍走「启动工作区」钮）。 */
  function openWorkspacePicker() {
    const list = h("div", { class: "chat-ws-list" })
    for (const ws of Array.isArray(view.workspaces) ? view.workspaces : []) {
      const row = h("button", { type: "button", class: "chat-ws-row", onclick: () => { modal.close(); deps.onPickWorkspace?.(ws.id) } },
        h("span", { text: String(ws?.name ?? "—") }),
        h("span", { class: boxStateClass(ws?.boxState), text: boxStateLabel(ws?.boxState) }))
      list.append(row)
    }
    const modal = openModal({ title: t("me.chat.pickWorkspace"), body: h("div", {}, h("p", { class: "hint", text: t("me.chat.pickWorkspaceHint") }), list) })
    close()
  }

  /** 单点重渲（页面每改读数即调）：读数段 ∥ 下拉行集 ∥ 自有钮显隐与门。 */
  function render(next) {
    if (next !== undefined) view = { ...view, ...next }
    paintWs()
    const sessions = Array.isArray(view.sessions) ? view.sessions : []
    const active = sessions.find((row) => String(row?.id) === view.activeId) ?? view.row
    const label = active !== null && active !== undefined && String(active.id) === view.activeId ? rowTitleOf(active) : ""
    dropLabel.textContent = label === "" ? (sessions.length === 0 ? t("me.chat.sessionsEmpty") : t("me.chat.selectChat")) : label
    dropBtn.disabled = sessions.length === 0
    dropList.replaceChildren(...sessions.map(rowNode))
    newBtn.hidden = (view.workspaces ?? []).length === 0
    startBtn.hidden = view.needStart !== true
    startBtn.disabled = view.startingId !== null
    pullBtn.hidden = view.ws === null || view.ws === undefined
    rereadBtn.disabled = view.activeId === null
    wsBtn.hidden = (view.workspaces ?? []).length === 0
    if (renaming !== null && sessions.every((row) => String(row?.id) !== renaming)) renaming = null
  }

  return { el, render, close, detach: () => document.removeEventListener("click", onDocClick) }
}

/**
 * 会话弹窗三件 + 四相引导工厂（§3.11(6)——会话起点面；与条同住本档，拆档缘由同头部）。`deps` 九回调：
 * `workspaces()` · `shownWorkspace()`（新会话预选 ∥ 引导相判）· `wsFailed()`（读面失败 ⇒ 错态引导）· `scopedCount()`
 * （当刻范围会话数——四相判据）· `startingId()` · `reload()`（重试钮）· `onWorkspaceCreated()` ⇒ Promise（建后刷新读数）·
 * `onSessionListChanged()` ⇒ Promise（新会话后刷列表）· `onSessionCreated(id)`（拾取新会话）· `onStart()` · `onPull()`。
 * 返回 `{ openCreateWorkspace, openNewSession, guideNode }`——两弹窗共用 `formModal` 壳（`openModal` + `.provider-form.stacked` 既有族）。
 */
export function createSessionDialogs(ctx, deps = {}) {
  const { h } = ctx
  function formModal(titleKey, fields, onSubmit, opts = {}) {
    const note = h("p", { class: "hint error", hidden: true })
    const submitBtn = h("button", { type: "submit", text: t(opts.submitKey ?? "me.chat.create") })
    const form = h("form", { class: "provider-form stacked", novalidate: true, onsubmit: (event) => { event.preventDefault(); void onSubmit({ note, submitBtn, modal }) } }, ...fields, note, submitBtn)
    const modal = openModal({ title: t(titleKey), body: h("div", {}, form), onClose: opts.onClose ?? null })
    return { modal, note, submitBtn }
  }

  /** 建工作区弹窗（相①——名称可选；缺省名服务端定；越限 ⇒ 窗内人话（含数字——服务端 message））。 */
  function openCreateWorkspace() {
    const name = h("input", { type: "text", placeholder: t("me.chat.wsNamePh") })
    formModal("me.chat.createWorkspace", [field(h, "me.chat.wsNameLabel", name)], async ({ note, submitBtn, modal }) => {
      note.hidden = true
      submitBtn.disabled = true
      const value = name.value.trim()
      try {
        await ctx.api("/api/me/sandbox/workspaces", { method: "POST", body: value === "" ? {} : { name: value } })
        modal.close()
        await deps.onWorkspaceCreated?.()
      } catch (error) { submitBtn.disabled = false; showNote(note, mapError(error)) }
    })
  }

  /** 新会话弹窗（会话起点）：选工作区——一枚 ⇒ 零选择（仅示名）；多枚 ⇒ 预选 = 当刻（📁 ∥ 会话所属）工作区（§3.11(6) 第 21 项）。
   *  `POST /api/me/chat/sessions`（模型缺省 = 开放清单首个——服务端定）；盒离线 ⇒ 409 人话（含启动指引——零静默）。 */
  function openNewSession() {
    const workspaces = Array.isArray(deps.workspaces?.()) ? deps.workspaces() : []
    if (workspaces.length === 0) return // 无工作区 ⇒ 建引导承载（guide ①——零静默）
    let select = null
    const fields = []
    if (workspaces.length === 1) fields.push(h("p", { class: "hint", text: `${t("me.chat.workspaceLabel")}: ${String(workspaces[0]?.name ?? "—")}` }))
    else {
      select = h("select", {}, ...workspaces.map((ws, index) => h("option", { value: String(index), text: String(ws?.name ?? "—") })))
      const at = workspaces.findIndex((ws) => String(ws?.id) === String(deps.shownWorkspace?.()?.id))
      if (at >= 0) select.value = String(at)
      fields.push(field(h, "me.chat.workspaceLabel", select))
    }
    const picked = select
    formModal("me.chat.newSession", fields, async ({ note, submitBtn, modal }) => {
      note.hidden = true
      submitBtn.disabled = true
      const workspace = picked === null ? workspaces[0] : workspaces[Number(picked.value)]
      if (workspace === undefined) { submitBtn.disabled = false; return }
      try {
        const data = await ctx.api("/api/me/chat/sessions", { method: "POST", body: { workspaceId: workspace.id } })
        modal.close()
        await deps.onSessionListChanged?.()
        if (data?.session?.id !== undefined && data?.session?.id !== null) deps.onSessionCreated?.(data.session.id)
      } catch (error) { submitBtn.disabled = false; showNote(note, mapError(error)) }
    })
  }

  /** 引导块（提示句 + 动作行——`.chat-guide` 自持面；零 `.card`）∥ 当刻相判：读面失败 ⇒ 错态；无工作区 ⇒ ①；
   *  盒未运行 ⇒ ②（判据 = 盒态——§3.6 四相；「未连接」态的启动动作 = 会话条承载）；零会话 ⇒ 直聊引导；卷空 ⇒ ③。 */
  const guide = (textKey, actions, error = false) => h("div", { class: "chat-guide" },
    h("p", { class: error ? "hint error" : "hint", text: t(textKey) }), h("div", { class: "row-form" }, ...actions))
  function guideNode() {
    if (deps.wsFailed?.() === true) return guide("me.chat.listFailed", [h("button", { type: "button", class: "tiny", text: t("me.chat.retry"), onclick: () => { void deps.reload?.() } })], true)
    const workspaces = Array.isArray(deps.workspaces?.()) ? deps.workspaces() : []
    if (workspaces.length === 0) return guide("me.chat.noWorkspace", [h("button", { type: "button", text: t("me.chat.createWorkspace"), onclick: () => openCreateWorkspace() })])
    const ws = deps.shownWorkspace?.() ?? null
    if (ws === null || ws.boxState !== "running") return guide("me.chat.wsBoxStopped", [h("button", { type: "button", text: t("me.chat.startWorkspace"), disabled: deps.startingId?.() !== null, onclick: () => deps.onStart?.() })])
    // 零会话支（走查轮笔 3——原先落到「卷空」引导误导）
    if (deps.scopedCount?.() === 0) return guide("me.chat.noSessionGuide", [h("button", { type: "button", text: t("me.chat.newSession"), onclick: () => openNewSession() }), h("button", { type: "button", class: "tiny", text: t("me.chat.pull"), onclick: () => deps.onPull?.() })])
    return guide("me.chat.wsEmptyVolume", [h("button", { type: "button", text: t("me.chat.pull"), onclick: () => deps.onPull?.() }), h("button", { type: "button", class: "tiny", text: t("me.chat.newSession"), onclick: () => openNewSession() })])
  }

  return { openCreateWorkspace, openNewSession, guideNode }
}
