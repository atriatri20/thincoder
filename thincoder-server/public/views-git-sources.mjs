/**
 * views-git-sources.mjs — 管理·Git 源面板（webui/PROJECTS.md §2.4——KD-SV-124 ∥ KD-SV-149；team-projects-permissions 批（B2）∥ project-sources-merge 批（页转面板件——管理·项目页标签②；页题 h2 撤）；台账 #1216）：
 * `#/admin/projects/git-sources`（面板——admin 门；`renderGitSources` 导出名不变）——源表七列（名字 ∥ 平台 ∥ PAT 掩码 ∥ 状态（行内一键切）∥ 同步方式 ∥ 上次同步（时间 + 结果点 + 摘要人话——失败面服务端原文优先于分类词）
 * ∥ 操作五钮恒显：「立即同步」（进行中禁 + 终态刷新结果列与时间）∥「拉列表」（共用添加仓对话框——预选本行源）∥「体检」（就地读数：成 ⇒ ok 行；
 * 败 ⇒ 分类人话 + PAT 列标红 + `token_state` 提示）∥「编辑」∥「删除」（确认窗 + 删源防护 400 就地呈））
 * + 添/编弹窗（名字 ∥ 平台四值（「自建」才显基址）∥ **gitee 范围三态**（`scopeKind` 选单「个人 ∥ 组织 ∥ 企业」——仅 gitee 显 ∥ 创建无默认 + 必选门 ∥ 个人 ⇒ 范围隐 + 附注 ∥ 组织/企业 ⇒ 范围显且必填；切「个人」⇒ 范围清空 ∥ 切非 gitee ⇒ `scopeKind` 不携——KD-SV-151）∥ 组织/组 ∥ PAT（编辑留空 = 不改——掩码三态沿 provider apiKey 口径）∥ 启用
 * ∥ 同步方式（「事件」仅 github 可选——平台门）∥ 间隔 5–1440 + 事件块（地址/一次性密钥/登记步——`project/PROJECTS.md` §13））。
 *
 * PAT/密钥恒掩码（读面永不回显原文——替换走明传）；判权全在后端（requireAdmin——页面不是判据）；文案经 `t()`；渲染一律节点 + textContent。
 * 端点 = gateway/API.md §2.9；分类人话六值单源 = `views-projects.mjs` `readKindLabel`。导出面 = 单元测试档直测（`platformLabel`）。
 */
import { copyText } from "./dom.mjs"
import { mapError, t } from "./i18n.mjs"
import { field, openModal, showNote, submitThen } from "./modal.mjs"
import { countsText, openAddRepoDialog, readKindLabel } from "./views-projects.mjs"

/** 平台四值文案键（服务端枚举 `gitee`/`github`/`gitlab`/`selfhosted`）。 */
const PLATFORM_KEYS = {
  gitee: "admin.gitSources.platform.gitee",
  github: "admin.gitSources.platform.github",
  gitlab: "admin.gitSources.platform.gitlab",
  selfhosted: "admin.gitSources.platform.selfhosted",
}

/** gitee 范围三态值（服务端枚举 `personal`/`org`/`enterprise`——KD-SV-151；文案键 = `admin.gitSources.scopeKind.*`）。 */
const SCOPE_KIND_VALUES = ["personal", "org", "enterprise"]

/** 平台文案（纯函数——单元测试档断言；枚举外 ⇒ 原值兜底）。 */
export function platformLabel(platform) {
  const key = PLATFORM_KEYS[platform]
  return key === undefined ? String(platform ?? "—") : t(key)
}

// ── 面板：管理·Git 源（管理·项目页标签②） ──────────────────────────────────

export async function renderGitSources(ctx, mount) {
  const { h } = ctx
  let sources = []
  const running = new Set() // 在飞同步（进行中禁——重渲随动）
  const readings = new Map() // 行级就地读数（体检结果——重取不丢）
  const box = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  const load = async () => {
    box.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    try {
      const data = await ctx.api("/api/admin/git-sources")
      sources = data.sources ?? []
      render()
    } catch (error) {
      ctx.fail(error)
      box.replaceChildren(h("p", { class: "hint error", text: t("admin.gitSources.loadFailed") }))
    }
  }
  const render = () => {
    if (sources.length === 0) { box.replaceChildren(h("p", { class: "hint", text: t("admin.gitSources.empty") })); return }
    const headers = [t("admin.gitSources.name"), t("admin.gitSources.col.platform"), t("admin.gitSources.pat"), t("admin.gitSources.col.status"),
      t("admin.gitSources.col.syncMode"), t("admin.gitSources.col.lastSync"), t("admin.gitSources.col.actions")]
    const rows = sources.map((source) => h("tr", {},
      h("td", { text: source.name }),
      h("td", { text: platformLabel(source.platform) }),
      patCell(ctx, source, readings.get(source.id)),
      h("td", {}, h("button", { type: "button", class: "tiny", text: t(enabledOf(source) ? "admin.gitSources.disable" : "admin.gitSources.enable"), onclick: () => toggleEnabled(ctx, source, load) })),
      h("td", { text: source.syncMode === "event" ? t("admin.gitSources.modeEvent") : t("admin.gitSources.modePoll", { minutes: source.intervalMinutes ?? 60 }) }),
      lastSyncCell(ctx, source),
      h("td", {}, ...actions(ctx, source, { reload: load, running, readings }))))
    box.replaceChildren(h("div", { class: "table-wrap" },
      h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...rows))))
  }
  const addBtn = h("button", { type: "button", text: t("admin.gitSources.addBtn"), onclick: () => openSourceModal(ctx, { reload: load }) })
  mount.append(h("div", { class: "row-form" }, addBtn), h("section", { class: "card" }, box))
  await load()
}

/** 启用读数（服务端 0/1 ∥ 布尔两形兼容）。 */
const enabledOf = (source) => source.enabled === 1 || source.enabled === true

/** 结果点（成 = ok ∥ 败 = fail——既有色板变量）。 */
const resultDot = (h, ok) => h("span", { class: ok === true ? "sync-dot ok" : "sync-dot fail" })

/** PAT 列（掩码 + 失效标红（`token_state='invalid'`）+ 行级体检读数就地呈）。 */
function patCell(ctx, source, reading) {
  const { h } = ctx
  const invalid = source.tokenState === "invalid"
  const nodes = [h("code", { text: source.token?.hint ?? "—" })]
  if (invalid) nodes.push(h("p", { class: "cell-hint hint error", text: t("admin.gitSources.patInvalid") }))
  if (reading !== undefined) nodes.push(h("p", { class: reading.ok === true ? "cell-hint hint" : "cell-hint hint error", text: reading.text }))
  return h("td", { class: invalid ? "error" : null }, ...nodes)
}

/** 上次同步列（时间 + 结果点 + 摘要人话；未同步 ⇒ 空态句）。 */
function lastSyncCell(ctx, source) {
  const { h } = ctx
  if (source.lastSyncAt === null || source.lastSyncAt === undefined) return h("td", { text: t("admin.gitSources.neverSynced") })
  const result = source.lastSyncResult ?? {}
  const ok = result.ok === true
  return h("td", {},
    resultDot(h, ok),
    h("span", { text: t(ok ? "admin.gitSources.resultOk" : "admin.gitSources.resultFail") }), " ",
    h("span", { text: ctx.fmtTs(source.lastSyncAt) }),
    h("p", { class: ok ? "cell-hint hint" : "cell-hint hint error", text: ok ? countsText(result.counts) : failedText(result) }))
}

/** 失败面摘要（KD-SV-151——服务端原文（`result.message`）优先于分类词；缺 ⇒ 分类人话——该句可达）。 */
function failedText(result) {
  return typeof result.message === "string" && result.message !== "" ? result.message : readKindLabel(result.kind)
}

/** 操作五钮（恒显——需求 44③「手动拉取钮永在」=「立即同步」三模式下恒在）。 */
function actions(ctx, source, { reload, running, readings }) {
  const { h } = ctx
  const busy = running.has(source.id)
  const sync = h("button", { type: "button", class: "tiny", text: busy ? t("admin.gitSources.syncing") : t("admin.gitSources.sync"), disabled: busy })
  sync.addEventListener("click", () => runSync(ctx, source, { reload, running }))
  const repos = h("button", { type: "button", class: "tiny", text: t("admin.gitSources.repos"), onclick: () => openAddRepoDialog(ctx, { sourceId: source.id, onAdded: reload }) })
  const check = h("button", { type: "button", class: "tiny", text: t("admin.gitSources.check"), onclick: () => runCheck(ctx, source, { reload, readings }) })
  const edit = h("button", { type: "button", class: "tiny", text: t("admin.gitSources.edit"), onclick: () => openSourceModal(ctx, { source, reload }) })
  const remove = h("button", { type: "button", class: "tiny danger", text: t("admin.gitSources.remove"), onclick: () => openDeleteModal(ctx, { source, reload }) })
  return [sync, repos, check, edit, remove]
}

/** 立即同步（进行中禁；终态刷新结果列与时间；失败 ⇒ 分类人话 + 结果列随重取落终态；在飞重触发 400 ⇒ flash）。 */
async function runSync(ctx, source, { reload, running }) {
  running.add(source.id)
  await reload()
  try {
    const data = await ctx.api(`/api/admin/git-sources/${source.id}/sync`, { method: "POST" })
    if (data?.ok === false) ctx.flash(readKindLabel(data?.error?.kind))
  } catch (error) {
    ctx.flash(mapError(error))
  } finally {
    running.delete(source.id)
    await reload()
  }
}

/** PAT 体检（就地读数：成 ⇒ ok 行；败 ⇒ 分类人话；`token_state` 随重取 ⇒ PAT 列标红）。 */
async function runCheck(ctx, source, { reload, readings }) {
  try {
    const data = await ctx.api(`/api/admin/git-sources/${source.id}/check`, { method: "POST" })
    readings.set(source.id, data?.ok === true
      ? { ok: true, text: t("admin.gitSources.checkOk", { ms: data.ms ?? 0 }) }
      : { ok: false, text: readKindLabel(data?.error?.kind) })
  } catch (error) {
    readings.set(source.id, { ok: false, text: mapError(error) })
  }
  await reload()
}

/** 启用/停用一键切（行内；成 ⇒ 重取随动——停用 ⇒ 定时停、已挂项目保留）。 */
async function toggleEnabled(ctx, source, reload) {
  try {
    await ctx.api(`/api/admin/git-sources/${source.id}`, { method: "PATCH", body: { enabled: enabledOf(source) ? 0 : 1 } })
    await reload()
  } catch (error) { ctx.fail(error) }
}

/** 删除确认窗（后果句 + 防护处置句；挂项目 ⇒ 服务端 400 就地人话——窗不关可重试）。 */
function openDeleteModal(ctx, { source, reload }) {
  const { h } = ctx
  const note = h("p", { class: "hint error", hidden: true })
  const confirmBtn = h("button", { type: "button", class: "danger", text: t("admin.gitSources.remove") })
  const modal = openModal({
    title: t("admin.gitSources.deleteTitle"),
    body: h("div", {},
      h("p", { class: "hint", text: t("admin.gitSources.deleteConfirm", { name: source.name }) }),
      h("p", { class: "hint", text: t("admin.gitSources.deleteBlocked") }),
      note),
    footer: h("div", { class: "row-form" }, confirmBtn, h("button", { type: "button", class: "tiny", text: t("common.cancel"), onclick: () => modal.close() })),
  })
  confirmBtn.addEventListener("click", () => submitThen(ctx, {
    note, button: confirmBtn, modal, reload,
    call: () => ctx.api(`/api/admin/git-sources/${source.id}`, { method: "DELETE" }),
    flash: t("admin.gitSources.deleted", { name: source.name }),
  }))
  return modal
}

// ── 添源/编辑弹窗（含事件块） ───────────────────────────────────────────────

/** 添源/编辑弹窗：平台门（「自建」才显基址；「事件」仅 github 可选）+ 事件块（地址/一次性密钥/登记步）。 */
function openSourceModal(ctx, { source = null, reload }) {
  const { h } = ctx
  const editing = source !== null && source !== undefined
  const name = h("input", { placeholder: t("admin.gitSources.namePh"), value: editing ? source.name : "" })
  const platform = h("select", {}, ...Object.keys(PLATFORM_KEYS).map((value) => h("option", { value, text: platformLabel(value) })))
  const baseUrl = h("input", { placeholder: t("admin.gitSources.baseUrlPh") })
  const baseField = field(h, "admin.gitSources.baseUrl", baseUrl)
  const scopeKind = h("select", {}, h("option", { value: "", text: t("admin.gitSources.scopeKindPh") }),
    ...SCOPE_KIND_VALUES.map((value) => h("option", { value, text: t(`admin.gitSources.scopeKind.${value}`) })))
  const kindNote = h("p", { class: "hint", text: t("admin.gitSources.kindNotePersonal"), hidden: true })
  const scopeKindField = field(h, "admin.gitSources.scopeKind", scopeKind, kindNote)
  const scopeLabel = h("span", { text: t("admin.gitSources.scope") })
  const scope = h("input", { placeholder: t("admin.gitSources.scopePh") })
  const scopeField = h("label", {}, scopeLabel, scope)
  const pat = h("input", { type: "password", placeholder: editing ? t("admin.gitSources.patKeep") : t("admin.gitSources.patPh") })
  const enabled = h("input", { type: "checkbox", checked: editing ? enabledOf(source) : true })
  const eventOption = h("option", { value: "event", text: t("admin.gitSources.modeEventOpt") })
  const mode = h("select", {}, h("option", { value: "poll", text: t("admin.gitSources.modePollOpt") }), eventOption)
  const modeNote = h("p", { class: "hint" })
  const interval = h("input", { type: "number", min: "5", max: "1440", value: editing ? String(source.intervalMinutes ?? 60) : "60" })
  const note = h("p", { class: "hint error", hidden: true })
  const secretBox = h("div", { class: "secret", hidden: true })
  const rotateHint = h("p", { class: "hint", text: t("admin.gitSources.rotateNote"), hidden: !(editing && source.hookSecret?.set === true) })
  const secretState = h("span", { text: editing ? (source.hookSecret?.set === true ? source.hookSecret.hint : t("admin.gitSources.secretUnset")) : t("admin.gitSources.secretAfterSave") })
  const hookPath = editing ? `/api/hooks/git-sources/${source.id}` : "/api/hooks/git-sources/<id>"
  const pathCode = h("code", { text: hookPath })
  const copyBtn = h("button", { type: "button", class: "tiny", text: t("common.copy") })
  copyBtn.addEventListener("click", () => { copyText(hookPath, pathCode, copyBtn) }) // 三路回退单源（选中兜底随 `pathCode`）
  const genBtn = h("button", { type: "button", class: "tiny", text: t(editing && source.hookSecret?.set === true ? "admin.gitSources.regenerate" : "admin.gitSources.generate"), disabled: !editing })
  genBtn.addEventListener("click", async () => {
    genBtn.disabled = true
    try {
      const data = await ctx.api(`/api/admin/git-sources/${source.id}/hook-secret`, { method: "POST" })
      const plain = String(data?.hookSecret?.plain ?? "")
      ctx.showSecret(secretBox, t("admin.gitSources.hookSecret"), plain) // 一次性明文（此后读面恒掩码）
      secretState.textContent = `…${plain.slice(-4)}`
      genBtn.textContent = t("admin.gitSources.regenerate")
      rotateHint.hidden = false // 轮换 ⇒ 旧密钥即刻失效
    } catch (error) { showNote(note, mapError(error)) }
    genBtn.disabled = false
  })
  const eventBox = h("div", { class: "stack-box" },
    h("h4", { text: t("admin.gitSources.eventTitle") }),
    h("p", {}, h("span", { text: `${t("admin.gitSources.hookUrl")}: ` }), pathCode, " ", copyBtn),
    h("p", { class: "hint", text: t("admin.gitSources.hookUrlNote") }),
    h("p", {}, h("span", { text: `${t("admin.gitSources.hookSecret")}: ` }), secretState, " ", genBtn),
    rotateHint, secretBox,
    h("h4", { text: t("admin.gitSources.registerTitle") }),
    h("p", { class: "hint", text: t("admin.gitSources.registerSteps") }))
  if (editing) {
    platform.value = source.platform
    baseUrl.value = source.baseURL ?? ""
    scopeKind.value = source.scopeKind ?? ""
    scope.value = source.scope ?? ""
    mode.value = source.syncMode ?? "poll"
  }
  /** 平台门 / gitee 范围门与事件块显隐（范围类型仅 gitee 显；个人 ⇒ 范围隐 + 附注；组织/企业 ⇒ 范围显；github ∧ 事件 ⇒ 事件块显）。 */
  const applyGates = () => {
    baseField.hidden = platform.value !== "selfhosted"
    const gitee = platform.value === "gitee"
    const kind = gitee ? scopeKind.value : ""
    scopeKindField.hidden = !gitee
    scopeField.hidden = gitee && kind !== "org" && kind !== "enterprise"
    scopeLabel.textContent = t(gitee ? "admin.gitSources.scopeGitee" : "admin.gitSources.scope")
    scope.placeholder = gitee && kind === "enterprise" ? t("admin.gitSources.scopePhEnterprise") : t("admin.gitSources.scopePh")
    kindNote.hidden = kind !== "personal"
    const github = platform.value === "github"
    eventOption.disabled = !github
    if (!github && mode.value === "event") mode.value = "poll"
    modeNote.textContent = github ? t("admin.gitSources.eventNote") : t("admin.gitSources.eventLocked")
    eventBox.hidden = !(github && mode.value === "event")
  }
  platform.addEventListener("change", applyGates)
  mode.addEventListener("change", applyGates)
  scopeKind.addEventListener("change", () => {
    if (scopeKind.value === "personal") scope.value = "" // 切「个人」⇒ 范围输入清空（提交 = 清除形——KD-SV-151）
    applyGates()
  })

  const submitForm = async (event) => {
    event.preventDefault()
    note.hidden = true
    if (name.value.trim() === "") return showNote(note, t("admin.gitSources.required", { field: t("admin.gitSources.name") }))
    if (platform.value === "selfhosted" && baseUrl.value.trim() === "") return showNote(note, t("admin.gitSources.required", { field: t("admin.gitSources.baseUrl") }))
    if (platform.value === "gitee") {
      if (scopeKind.value === "") return showNote(note, t("admin.gitSources.required", { field: t("admin.gitSources.scopeKind") }))
      if (scopeKind.value !== "personal" && scope.value.trim() === "") return showNote(note, t("admin.gitSources.required", { field: t("admin.gitSources.scopeGitee") }))
    }
    if (!editing && pat.value.trim() === "") return showNote(note, t("admin.gitSources.required", { field: t("admin.gitSources.pat") }))
    const body = {
      name: name.value.trim(), platform: platform.value,
      baseURL: platform.value === "selfhosted" ? baseUrl.value.trim() : null,
      scope: scope.value.trim() || null, enabled: enabled.checked ? 1 : 0,
      syncMode: mode.value, intervalMinutes: Number(interval.value),
    }
    if (platform.value === "gitee") body.scopeKind = scopeKind.value // 仅 gitee 携（切非 gitee ⇒ 不携——清空形，不撞「仅 gitee 适用」400）
    if (pat.value.trim() !== "") body.token = pat.value.trim() // 编辑留空 = 不改（明填 = 替换）
    submit.disabled = true
    try {
      if (editing) {
        await ctx.api(`/api/admin/git-sources/${source.id}`, { method: "PATCH", body })
        ctx.flash(t("admin.gitSources.updated", { name: body.name }))
      } else {
        await ctx.api("/api/admin/git-sources", { method: "POST", body })
        ctx.flash(t("admin.gitSources.added", { name: body.name }))
      }
      modal.close()
      await reload()
    } catch (error) {
      submit.disabled = false
      showNote(note, mapError(error))
    }
  }
  const submit = h("button", { type: "submit", text: editing ? t("common.save") : t("admin.gitSources.addBtn") })
  const modal = openModal({
    title: t(editing ? "admin.gitSources.editTitle" : "admin.gitSources.addTitle"),
    body: h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submitForm },
      field(h, "admin.gitSources.name", name),
      field(h, "admin.gitSources.platformLabel", platform),
      baseField,
      scopeKindField,
      scopeField,
      field(h, "admin.gitSources.pat", pat),
      field(h, "admin.gitSources.enabledLabel", enabled),
      field(h, "admin.gitSources.modeLabel", mode, modeNote),
      field(h, "admin.gitSources.interval", interval, h("span", { class: "hint", text: t("admin.gitSources.intervalRule") })),
      eventBox, note, submit),
  })
  applyGates()
  return modal
}
