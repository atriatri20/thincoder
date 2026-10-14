/**
 * views-audit.mjs — 管理·审计（webui/READINGS.md §2.1④——`#/admin/audit`）：过滤三轴（类型/成员/时段）∥
 * 事件表（时间 ∥ 类型 ∥ 操作者 ∥ 对象 ∥ 详情——按型模板渲染）∥ 空态；`GET /api/audit` 取数（倒序，新在前）。
 *
 * 类型枚举与 detail 形 = accounts/ACCOUNTS.md §2.1（型面十七型——全型收编；本表十六型在册——`member_event` 待落（他批登记）；server-mcp 批 + `mcp_event`）；
 * 详情字段（IP ∥ 维度 ∥ key 提示形 ∥ 角色 ∥ `keys`（配置变更键名清单） ∥ `summary`（agent_event 会话动作摘要——`agent/ADMIN-AGENT.md` §11）
 * ∥ agent 行（`agent_event`——tool · subject · 成败 ·〔截断〕· summary；KD-SV-114） ∥ 沙盒 kind 族（`sandbox_event`——走查轮 2026-10-11）
 * ∥ project 行（`project_event`——kind 族 + 源/项目/成员三面逐值；team-projects-permissions 批（B2））
 * ∥ ledger 行（`ledger_event`——kind 族 + id/repo/两面逐值；team-ledger 批））
 * 按在场渲染；对象与操作者同名 ⇒「—」（名快照口径——改/删后记录自足）。渲染一律节点 + textContent；文案经 `t()` 取值。
 */
import { t } from "./i18n.mjs"
import { countsText, levelLabel, readKindLabel } from "./views-projects.mjs"

/** 审计类型枚举（类型值 ∥ 文案键——accounts/ACCOUNTS.md §2.1；未知型 ⇒ 原值兜底——未来新型零遗漏）。 */
const AUDIT_TYPES = [
  ["login_success", "audit.type.login_success"],
  ["login_failure", "audit.type.login_failure"],
  ["login_locked", "audit.type.login_locked"],
  ["key_rotate", "audit.type.key_rotate"],
  ["key_issue", "audit.type.key_issue"],
  ["key_revoke", "audit.type.key_revoke"],
  ["password_change", "audit.type.password_change"],
  ["password_reset", "audit.type.password_reset"],
  ["member_create", "audit.type.member_create"],
  ["config_update", "audit.type.config_update"],
  ["agent_event", "audit.type.agent_event"],
  ["sandbox_event", "audit.type.sandbox_event"],
  ["sandbox_rule", "audit.type.sandbox_rule"],
  ["project_event", "audit.type.project_event"],
  ["ledger_event", "audit.type.ledger_event"],
  ["mcp_event", "audit.type.mcp_event"],
]

export async function renderAudit(ctx, mount) {
  const { h } = ctx

  const filterType = h("select", { title: t("audit.typeLabel") },
    h("option", { value: "", text: t("audit.typeAll") }),
    ...AUDIT_TYPES.map(([type, key]) => h("option", { value: type, text: t(key) })))
  const filterMember = h("input", { placeholder: t("audit.memberPh") })
  const filterFrom = h("input", { type: "datetime-local", title: t("admin.usage.fromTitle") })
  const filterTo = h("input", { type: "datetime-local", title: t("admin.usage.toTitle") })

  const eventsBox = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  const loadEvents = async () => {
    const params = new URLSearchParams()
    if (filterType.value) params.set("type", filterType.value)
    if (filterMember.value.trim()) params.set("member", filterMember.value.trim())
    if (filterFrom.value) params.set(`from`, String(new Date(filterFrom.value).getTime()))
    if (filterTo.value) params.set(`to`, String(new Date(filterTo.value).getTime()))
    try {
      const data = await ctx.api(`/api/audit?${params.toString()}`)
      const events = data.events ?? []
      eventsBox.replaceChildren(eventsTable(ctx, events))
    } catch (error) {
      ctx.fail(error)
      eventsBox.replaceChildren(h("p", { class: "hint error", text: t("audit.loadFailed") }))
    }
  }
  const filterForm = h("form", { class: "row-form" },
    h("label", {}, t("audit.typeLabel"), filterType),
    filterMember,
    h("label", {}, t("audit.fromLabel"), filterFrom), h("label", {}, t("audit.toLabel"), filterTo),
    h("button", { type: "submit", text: t("audit.submit") }),
  )
  filterForm.addEventListener("submit", (event) => { event.preventDefault(); loadEvents() })
  ctx.dataShell(mount, { // 视口高壳（§2.6②——页题固定 ∥ 卡内过滤行 ∥ 表槽吃剩高；表尾计数 = 表内 tfoot）
    head: h("h2", { text: t("audit.title") }), // 单标题（head 的 h2；卡内 h3 已删——#995）
    area: h("section", { class: "card" }, filterForm, eventsBox),
  })
  await loadEvents()
}

/** 事件表：时间 ∥ 类型 ∥ 操作者 ∥ 对象（与操作者同名 ⇒ 「—」）∥ 详情（按型模板：IP ∥ 维度 ∥ key 提示形 ∥ 角色 ∥ keys ∥ agent 行 ∥ agent_event 摘要）。 */
function eventsTable(ctx, events) {
  const { h } = ctx
  if (events.length === 0) return h("p", { class: "hint", text: t("audit.empty") })
  const rows = events.map((event) => [
    ctx.fmtTs(event.ts),
    typeLabel(event.type),
    event.actor,
    event.target && event.target !== event.actor ? event.target : "—",
    event.type.startsWith("sandbox_") ? sandboxDetailText(event.detail) : event.type === "agent_event" ? agentDetailText(event.detail) : event.type === "project_event" ? projectDetailText(event.detail) : event.type === "ledger_event" ? ledgerDetailText(event.detail) : detailText(event.detail),
  ])
  return ctx.table([t("audit.col.time"), t("audit.col.type"), t("audit.col.actor"), t("audit.col.target"), t("audit.col.detail")], rows, { foot: true })
}

/** 类型文案（枚举内 ⇒ 表键；枚举外 ⇒ 原值兜底——未来新型零遗漏）。 */
function typeLabel(type) {
  const hit = AUDIT_TYPES.find(([value]) => value === type)
  return hit ? t(hit[1]) : String(type)
}

/** 详情按型模板（在场字段渲染）：IP ∥ 维度 ∥ key 提示形 ∥ 角色 ∥ 配置变更键名清单（§2.10）；无字段 ⇒ 「—」。
 *  agent 行（`agent_event`）走专用模板 `agentDetailText`（沙盒两型走 `sandboxDetailText`）。 */
function detailText(detail) {
  const parts = []
  if (detail?.ip) parts.push(`${t("audit.ip")}: ${detail.ip}`)
  if (detail?.dimension) parts.push(`${t("audit.dimension")}: ${detail.dimension}`)
  if (detail?.keyHint) parts.push(`${t("audit.keyHint")}: ${detail.keyHint}`)
  if (detail?.role) parts.push(`${t("audit.role")}: ${detail.role}`)
  if (Array.isArray(detail?.keys) && detail.keys.length > 0) parts.push(`${t("audit.keys")}: ${detail.keys.join(", ")}`)
  return parts.length === 0 ? "—" : parts.join(" · ")
}

/** agent 行详情模板（`agent_event`——KD-SV-114：`tool · subject · 成败 ·〔截断〕· summary`——非裸 JSON）：
 *  成败 = 既有 `resultCode`（`0` ⇒ 成功 ∥ 其余 ⇒ 失败；缺 ⇒ 不渲）；`subject` 空（无主事词件）⇒ 略；
 *  零字段行（`chat_start` 等）⇒ 「—」。导出 = 单元测试档断言（同 `sandboxKindLabel` 先例）。 */
export function agentDetailText(detail) {
  const parts = []
  if (typeof detail?.tool === "string" && detail.tool !== "") parts.push(detail.tool)
  if (typeof detail?.subject === "string" && detail.subject !== "") parts.push(detail.subject)
  if (detail?.resultCode !== undefined && detail?.resultCode !== null) parts.push(Number(detail.resultCode) === 0 ? t("audit.agentOk") : t("audit.agentFail"))
  if (detail?.truncated === true) parts.push(t("audit.agentTruncated"))
  if (typeof detail?.summary === "string" && detail.summary !== "") parts.push(detail.summary)
  return parts.length === 0 ? "—" : parts.join(" · ")
}

/** 项目 kind 文案键（`project_event` detail.kind——十一 kind；枚举外 ⇒ 原值兜底）。 */
const PROJECT_KIND_KEYS = {
  source_add: "admin.projects.kind.source_add",
  source_update: "admin.projects.kind.source_update",
  source_delete: "admin.projects.kind.source_delete",
  source_sync: "admin.projects.kind.source_sync",
  source_check: "admin.projects.kind.source_check",
  project_add: "admin.projects.kind.project_add",
  project_update: "admin.projects.kind.project_update",
  project_delete: "admin.projects.kind.project_delete",
  member_add: "admin.projects.kind.member_add",
  member_update: "admin.projects.kind.member_update",
  member_remove: "admin.projects.kind.member_remove",
}

/** 项目 kind 文案（导出——单元测试档断言；枚举外 ⇒ 原值兜底）。 */
export function projectKindLabel(kind) {
  return PROJECT_KIND_KEYS[kind] === undefined ? String(kind ?? "—") : t(PROJECT_KIND_KEYS[kind])
}

/** 项目事件详情（`project_event`——kind 族 + 源/项目/成员三面逐值；`level`/计数/分类人话 = 项目部件单源）。 */
function projectDetailText(detail) {
  const parts = []
  if (typeof detail?.kind === "string" && detail.kind !== "") parts.push(projectKindLabel(detail.kind))
  if (detail?.sourceId !== undefined && detail?.sourceId !== null) parts.push(`#${detail.sourceId}`)
  if (detail?.projectId !== undefined && detail?.projectId !== null) parts.push(`#${detail.projectId}`)
  if (typeof detail?.name === "string" && detail.name !== "") parts.push(detail.name)
  if (typeof detail?.displayName === "string" && detail.displayName !== "") parts.push(detail.displayName)
  if (typeof detail?.address === "string" && detail.address !== "") parts.push(detail.address)
  if (typeof detail?.username === "string" && detail.username !== "") parts.push(detail.username)
  if (typeof detail?.level === "string" && detail.level !== "") parts.push(levelLabel(detail.level))
  if (typeof detail?.trigger === "string" && detail.trigger !== "") parts.push(detail.trigger)
  if (detail?.ok === true) parts.push(t("admin.gitSources.resultOk"))
  if (detail?.ok === false) parts.push(`${t("admin.gitSources.resultFail")}${detail?.errorKind === undefined ? "" : ` · ${readKindLabel(detail?.errorKind)}`}`)
  if (detail?.counts !== undefined && detail?.counts !== null) parts.push(countsText(detail.counts))
  if (detail?.memberCount !== undefined && detail?.memberCount !== null) parts.push(`${t("admin.projects.col.memberCount")} ${detail?.memberCount}`)
  return parts.length === 0 ? "—" : parts.join(" · ")
}

/** 台账 kind 文案键（`ledger_event` detail.kind——四 kind；枚举外 ⇒ 原值兜底）。 */
const LEDGER_KIND_KEYS = {
  create: "me.ledger.kind.create",
  edit: "me.ledger.kind.edit",
  close: "me.ledger.kind.close",
  withdraw: "me.ledger.kind.withdraw",
}

/** 台账 kind 文案（导出——单元测试档断言；枚举外 ⇒ 原值兜底）。 */
export function ledgerKindLabel(kind) {
  return LEDGER_KIND_KEYS[kind] === undefined ? String(kind ?? "—") : t(LEDGER_KIND_KEYS[kind])
}

/** 台账写入面文案键（`surface` = console ∥ client——两面写入可辨；枚举外 ⇒ 原值兜底）。 */
const LEDGER_SURFACE_KEYS = { console: "me.ledger.surface.console", client: "me.ledger.surface.client" }

/** 台账事件详情（`ledger_event`——kind 族 + id/repo/两面逐值；team-ledger 批；导出 = 单元测试档断言）。 */
export function ledgerDetailText(detail) {
  const parts = []
  if (typeof detail?.kind === "string" && detail.kind !== "") parts.push(ledgerKindLabel(detail.kind))
  if (detail?.id !== undefined && detail?.id !== null) parts.push(`#${detail.id}`)
  if (typeof detail?.repo === "string" && detail.repo !== "") parts.push(detail.repo)
  if (typeof detail?.surface === "string" && detail.surface !== "") {
    parts.push(LEDGER_SURFACE_KEYS[detail.surface] === undefined ? String(detail.surface) : t(LEDGER_SURFACE_KEYS[detail.surface]))
  }
  return parts.length === 0 ? "—" : parts.join(" · ")
}

/** 沙盒 kind 文案键（`sandbox_event` detail.kind——枚举外 ⇒ 原值兜底；§2.1）。 */
const SANDBOX_KIND_KEYS = {
  container_create: "audit.sandboxKind.container_create",
  container_start: "audit.sandboxKind.container_start",
  container_stop: "audit.sandboxKind.container_stop",
  container_restart: "audit.sandboxKind.container_restart",
  container_kill: "audit.sandboxKind.container_kill",
  container_delete: "audit.sandboxKind.container_delete",
  image_pull: "audit.sandboxKind.image_pull",
  image_delete: "audit.sandboxKind.image_delete",
  volume_delete: "audit.sandboxKind.volume_delete",
  image_source_add: "audit.sandboxKind.image_source_add",
  image_source_update: "audit.sandboxKind.image_source_update",
  image_source_delete: "audit.sandboxKind.image_source_delete",
  runner_add: "audit.sandboxKind.runner_add",
  runner_delete: "audit.sandboxKind.runner_delete",
  runner_selfcheck_failed: "audit.sandboxKind.runner_selfcheck_failed",
  workspace_create: "audit.sandboxKind.workspace_create",
  workspace_limits: "audit.sandboxKind.workspace_limits",
  box_start: "audit.sandboxKind.box_start",
  box_stop: "audit.sandboxKind.box_stop",
  box_destroy: "audit.sandboxKind.box_destroy",
  onboarding_start: "audit.sandboxKind.onboarding_start",
  onboarding_exec: "audit.sandboxKind.onboarding_exec",
  onboarding_done: "audit.sandboxKind.onboarding_done",
  onboarding_failed: "audit.sandboxKind.onboarding_failed",
  onboarding_credential_revoke: "audit.sandboxKind.onboarding_credential_revoke",
  host_credential_set: "audit.sandboxKind.host_credential_set",
  host_credential_revoke: "audit.sandboxKind.host_credential_revoke",
  terminal_open: "audit.sandboxKind.terminal_open",
  terminal_close: "audit.sandboxKind.terminal_close",
  approval: "audit.sandboxKind.approval",
  workspace_base: "audit.sandboxKind.workspace_base", // sandbox-exec-rebuild 批 · 修订轮增补「底座可换」（四 kind——系统部件两表同拍）
  image_derive: "audit.sandboxKind.image_derive",
  registry_credential_set: "audit.sandboxKind.registry_credential_set",
  registry_credential_revoke: "audit.sandboxKind.registry_credential_revoke",
  runner_connection: "audit.sandboxKind.runner_connection", // sandbox-exec-rebuild 批 · 增补 #2（连接面 TLS 档）
  workspace_destroy: "audit.sandboxKind.workspace_destroy", // sandbox-exec-rebuild 批 · 执行面动作/失败族（服务端实发全量对齐——工作区拆 ∥ 快照 ∥ 闸/配额下发）
  checkpoint: "audit.sandboxKind.checkpoint",
  checkpoint_fail: "audit.sandboxKind.checkpoint_fail",
  egress_apply_failed: "audit.sandboxKind.egress_apply_failed",
  quota_apply_failed: "audit.sandboxKind.quota_apply_failed",
  placement_failed: "audit.sandboxKind.placement_failed", // sandbox-exec-rebuild 批 · 收口修复轮（B 裁——补放置失败审计 kind）
}

/** 沙盒 kind 文案（导出——日志窗「操作记录」块同源消费；走查轮 2026-10-11）。 */
export function sandboxKindLabel(kind) {
  return SANDBOX_KIND_KEYS[kind] ? t(SANDBOX_KIND_KEYS[kind]) : String(kind ?? "—")
}

/** 沙盒事件详情（`sandbox_event`——kind 文案 + 在场字段逐值；走查轮 2026-10-11）。 */
function sandboxDetailText(detail) {
  const parts = []
  if (typeof detail?.kind === "string" && detail.kind !== "") parts.push(sandboxKindLabel(detail.kind))
  if (detail?.name) parts.push(String(detail.name))
  if (detail?.containerId) parts.push(String(detail.containerId).slice(0, 12))
  if (detail?.image) parts.push(String(detail.image))
  if (detail?.ref) parts.push(String(detail.ref))
  if (detail?.volume) parts.push(String(detail.volume))
  if (detail?.address) parts.push(String(detail.address))
  if (detail?.host) parts.push(String(detail.host))
  if (detail?.runId !== undefined) parts.push(`#${detail.runId}`)
  if (detail?.kept !== undefined || detail?.removed !== undefined) parts.push(`${t("audit.sandboxKept")} ${detail.kept ?? 0} / ${t("audit.sandboxRemoved")} ${detail.removed ?? 0}`)
  if (typeof detail?.summary === "string" && detail.summary !== "") parts.push(detail.summary)
  return parts.length === 0 ? "—" : parts.join(" · ")
}
