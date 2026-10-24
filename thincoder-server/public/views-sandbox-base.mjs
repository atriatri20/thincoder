/**
 * views-sandbox-base.mjs — 沙盒页·底座与私有仓凭据两卡件（webui/SANDBOX.md §2.1①「底座卡 + 私有仓凭据卡」；sandbox-exec-rebuild 批 ·
 * 修订轮增补「底座可换」——两卡入标签②「镜像与镜像源」，镜像族家）：
 * 底座卡（说明行 ∥ 工作区表（工作区 ∥ 底座（「标准」∥ 引用）∥ 操作：「设底座」弹窗 + 「构建」钮）∥ 设底座弹窗（镜像引用输入 +
 * 形提示 + 「恢复标准」——两径同窗：`PATCH …/workspaces/:id` 的 `baseImage` / `null`）∥ 构建（`POST …/workspaces/:id/derive`——
 * 在飞态「构建中……可能持续数分钟」+ 钮禁用；成 ⇒ 成功句（含 tag/缓存与否）；败 ⇒ 红条人话；未绑节点 ⇒ 钮禁用 + 一句人话））
 * ∥ 私有仓凭据卡（表（注册表 ∥ 用户名 ∥ 更新时间 ∥ 操作：改/删）+「添加凭据」钮 ∥ 增/改弹窗（注册表主机 ∥ 用户名 ∥ 口令/令牌——
 * password 输入 ∥ **密文零回显、零回填**：已有凭据只回非秘密列，改 = 重填新值）∥ 删除确认（后果句：只删 server 侧存留——已拉镜像不受影响））。
 * 契约 = `gateway/API.md` §2.5（workspaces 两行扩 ∥ derive 一行 ∥ registry-credentials 四行）；机制 = `sandbox/EXECUTION.md` §8 底座可换块；
 * 文案经 `t()`（`webui/I18N.md` §2.1）；渲染一律节点 + textContent（零拼串）。
 * 单元测试档直测面 = `createBaseSection`（两卡渲染 ∥ 弹窗三径）。
 */
import { mapError, t } from "./i18n.mjs"
import { confirmModal, field, openModal, showNote, submitThen } from "./modal.mjs"

/** 底座卡 + 私有仓凭据卡件（件建即取数——读时口径；动作后重取 = 界面上新）。出 = `{ baseCard, credCard }`（页装配两挂载点）。 */
export function createBaseSection(ctx) {
  const { h } = ctx

  // ── 底座卡（说明行 ∥ 工作区表 ∥ 设底座弹窗 ∥ 构建钮）──────────────────────────────────

  let workspaces = []
  const baseBox = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  const baseCard = h("section", { class: "card" },
    h("h3", { text: t("admin.sandbox.baseTitle") }),
    h("p", { class: "hint", text: t("admin.sandbox.baseIntro") }),
    baseBox)

  async function loadBase() {
    baseBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    try {
      const data = await ctx.api("/api/admin/sandbox/workspaces")
      workspaces = Array.isArray(data?.workspaces) ? data.workspaces : []
      renderBase()
    } catch (error) {
      baseBox.replaceChildren(h("p", { class: "hint error", text: mapError(error) }))
    }
  }

  function renderBase() {
    if (workspaces.length === 0) {
      baseBox.replaceChildren(h("p", { class: "hint", text: t("admin.sandbox.baseEmpty") }))
      return
    }
    const headers = [t("admin.sandbox.baseColWorkspace"), t("admin.sandbox.baseColBase"), t("admin.sandbox.colActions")]
    const rows = workspaces.map((workspace) => h("tr", {},
      h("td", { text: ctx.fmtValue(workspace.name) }),
      // 底座列：「标准」态标（`baseImage` 缺）∥ 归一引用（非空）
      h("td", {}, workspace.baseImage === null || workspace.baseImage === undefined
        ? h("span", { class: "badge", text: t("admin.sandbox.baseStandard") })
        : h("span", { text: String(workspace.baseImage) })),
      h("td", {}, baseActions(workspace))))
    baseBox.replaceChildren(h("div", { class: "table-wrap" },
      h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...rows))))
  }

  /** 行操作：「设底座」弹窗 + 「构建」钮（未绑节点 ⇒ 禁用 + 一句人话；在飞态 = 该钮禁用 + 行内进度句）。 */
  function baseActions(workspace) {
    const bound = workspace.runnerId !== null && workspace.runnerId !== undefined
    const hint = h("span", { class: "hint", hidden: bound, text: bound ? "" : t("admin.sandbox.baseUnbound") })
    const buildBtn = h("button", {
      type: "button", class: "tiny", text: t("admin.sandbox.baseBuild"), disabled: !bound,
      onclick: () => runBuild(buildBtn, hint, workspace),
    })
    return [
      h("button", { type: "button", class: "tiny", text: t("admin.sandbox.baseSet"), onclick: () => openBaseModal(ctx, { workspace, reload: loadBase }) }),
      buildBtn,
      hint,
    ]
  }

  /** 派生构建（同步请求——最坏 ≈20 分钟）：在飞 ⇒ 钮禁用 + 进度句；成 ⇒ 成功句（缓存命中/新构建两形）+ 重取；败 ⇒ 红条人话。 */
  async function runBuild(button, hint, workspace) {
    button.disabled = true
    hint.hidden = false
    hint.textContent = t("admin.sandbox.baseBuilding")
    try {
      const data = await ctx.api(`/api/admin/sandbox/workspaces/${workspace.id}/derive`, { method: "POST" })
      const tag = String(data?.tag ?? "")
      ctx.flash(data?.cached === true ? t("admin.sandbox.baseDerivedCached", { tag }) : t("admin.sandbox.baseDerived", { tag }))
      await loadBase()
    } catch (error) {
      button.disabled = false
      hint.hidden = true
      ctx.fail(error) // 败 ⇒ 红条人话（400 人话 ∥ 502 原文透传）
    }
  }

  // ── 私有仓凭据卡（表 ∥ 增/改弹窗 ∥ 删除确认——密文零回显）────────────────────────────

  let credentials = []
  const credBox = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  const credCard = h("section", { class: "card" },
    h("h3", { text: t("admin.sandbox.credTitle") }),
    h("div", { class: "info-actions" },
      h("button", { type: "button", text: t("admin.sandbox.credAdd"), onclick: () => openCredentialModal(ctx, { reload: loadCred }) })),
    credBox)

  async function loadCred() {
    credBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    try {
      const data = await ctx.api("/api/admin/sandbox/registry-credentials")
      credentials = Array.isArray(data?.credentials) ? data.credentials : []
      renderCred()
    } catch (error) {
      credBox.replaceChildren(h("p", { class: "hint error", text: mapError(error) }))
    }
  }

  function renderCred() {
    if (credentials.length === 0) {
      credBox.replaceChildren(h("p", { class: "hint", text: t("admin.sandbox.credEmpty") }))
      return
    }
    const headers = [t("admin.sandbox.credColHost"), t("admin.sandbox.credColUser"), t("admin.sandbox.credColUpdated"), t("admin.sandbox.colActions")]
    const rows = credentials.map((credential) => h("tr", {},
      h("td", { text: ctx.fmtValue(credential.host) }),
      h("td", { text: ctx.fmtValue(credential.username) }),
      h("td", { text: credential.updatedAt ? ctx.fmtTs(credential.updatedAt) : "—" }),
      h("td", {},
        h("button", { type: "button", class: "tiny", text: t("admin.sandbox.sourceEdit"), onclick: () => openCredentialModal(ctx, { credential, reload: loadCred }) }),
        h("button", { type: "button", class: "tiny", text: t("admin.sandbox.remove"), onclick: () => openCredentialDeleteModal(ctx, { credential, reload: loadCred }) }))))
    credBox.replaceChildren(h("div", { class: "table-wrap" },
      h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...rows))))
  }

  loadBase()
  loadCred()
  return { baseCard, credCard }
}

/** 设底座弹窗（镜像引用输入 + 形提示；「恢复标准」= `baseImage: null`——两径同窗，同闩集）：成 ⇒ 关窗 + 提示 + 重取；败 ⇒ 窗内就地人话（库零变）；在飞 ⇒ 双钮禁（连点零第二 PATCH）。 */
function openBaseModal(ctx, { workspace, reload }) {
  const { h } = ctx
  const name = String(workspace?.name ?? "")
  const input = h("input", { placeholder: t("admin.sandbox.baseRefPh") })
  if (typeof workspace?.baseImage === "string" && workspace.baseImage !== "") input.value = workspace.baseImage
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: t("admin.sandbox.baseSet") })
  // 恢复钮提为件级引用——并入 `save` 闩集（在飞 ⇒ 双钮禁；败 ⇒ 双复）——连点零第二 PATCH
  const restoreBtn = h("button", { type: "button", class: "tiny", text: t("admin.sandbox.baseRestore"), onclick: () => save({ baseImage: null }, t("admin.sandbox.baseRestoreOk", { name })) })
  const modal = openModal({
    title: t("admin.sandbox.baseSet"),
    body: h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
      field(h, "admin.sandbox.baseRef", input), // 无目标行：设计未列（工作区名即在表行）——他日补则另立「工作区：{name}」键
      h("p", { class: "hint", text: t("admin.sandbox.baseRefHint") }),
      note, submitBtn),
    footer: h("div", { class: "row-form" },
      restoreBtn,
      h("button", { type: "button", class: "tiny", text: t("common.cancel"), onclick: () => modal.close() })),
  })

  async function submit(event) {
    event.preventDefault()
    note.hidden = true
    const baseImage = input.value.trim()
    if (baseImage === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.baseRef") }))
    await save({ baseImage }, t("admin.sandbox.baseSetOk", { name }))
  }

  async function save(body, flashText) {
    note.hidden = true
    submitBtn.disabled = true
    restoreBtn.disabled = true // 在飞 ⇒ 双钮禁（恢复钮并入同闩集——连点零第二 PATCH）
    try {
      await ctx.api(`/api/admin/sandbox/workspaces/${workspace.id}`, { method: "PATCH", body })
      ctx.flash(flashText)
      modal.close()
      await reload()
    } catch (error) {
      submitBtn.disabled = false
      restoreBtn.disabled = false // 败 ⇒ 双复（可重试）
      showNote(note, mapError(error)) // 形非法 ⇒ 400 逐句人话（库零变）；草稿不丢
    }
  }
}

/** 凭据增/改弹窗（注册表主机 ∥ 用户名 ∥ 口令/令牌——password 输入；**已有凭据不回填秘密**，改 = 留空保持原值、重填即覆写）。 */
function openCredentialModal(ctx, { credential = null, reload }) {
  const { h } = ctx
  const editing = credential !== null && credential !== undefined
  const hostInput = h("input")
  const userInput = h("input", { autocomplete: "off" })
  const secretInput = h("input", { type: "password", autocomplete: "off", placeholder: t("admin.sandbox.credSecretPh") })
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: editing ? t("common.save") : t("admin.sandbox.credAdd") })
  const modal = openModal({
    title: t("admin.sandbox.credTitle"),
    body: h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
      field(h, "admin.sandbox.credHost", hostInput),
      h("p", { class: "hint", text: t("admin.sandbox.credHostHint") }),
      field(h, "admin.sandbox.credColUser", userInput),
      field(h, "admin.sandbox.credSecret", secretInput),
      note, submitBtn),
  })
  if (editing) {
    hostInput.value = String(credential.host ?? "")
    userInput.value = String(credential.username ?? "") // 非秘密列回填；秘密列恒空（零回填）
  }

  async function submit(event) {
    event.preventDefault()
    note.hidden = true
    const host = hostInput.value.trim()
    const username = userInput.value.trim()
    const secret = secretInput.value
    if (host === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.credHost") }))
    if (username === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.credColUser") }))
    if (!editing && secret === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.credSecret") }))
    const body = { host, username }
    if (secret !== "") body.secret = secret // 键级（出现键 = 应用）：改径留空 ⇒ 密文不动
    submitBtn.disabled = true
    try {
      await ctx.api(editing ? `/api/admin/sandbox/registry-credentials/${credential.id}` : "/api/admin/sandbox/registry-credentials",
        { method: editing ? "PATCH" : "POST", body })
      ctx.flash(t("admin.sandbox.credSaved", { host }))
      modal.close()
      await reload()
    } catch (error) {
      submitBtn.disabled = false
      showNote(note, mapError(error)) // 400 逐句人话（形非法/撞主机——库零变）
    }
  }
}

/** 删除凭据确认窗（后果句：只删 server 侧存留——已拉镜像不受影响；非原生 confirm）。 */
function openCredentialDeleteModal(ctx, { credential, reload }) {
  const host = String(credential?.host ?? "")
  const { modal, note, confirmBtn } = confirmModal(ctx, {
    title: "admin.sandbox.credDeleteTitle",
    bodyText: "admin.sandbox.credDeleteConfirm",
    bodyParams: { host },
    confirmText: t("admin.sandbox.remove"),
    submit: () => submitThen(ctx, {
      note, button: confirmBtn, modal, reload,
      call: () => ctx.api(`/api/admin/sandbox/registry-credentials/${credential.id}`, { method: "DELETE" }),
      flash: t("admin.sandbox.credDeleted", { host }),
    }),
  })
}
