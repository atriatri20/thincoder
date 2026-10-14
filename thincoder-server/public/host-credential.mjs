/**
 * host-credential.mjs — 主机凭据弹窗件（webui/SANDBOX.md §2.1①「主机凭据」∥ sandbox/SANDBOX.md §3 KD-SV-134；admin-chat-creds-merge 批——台账 #1326）：
 * **两页共用同一件**（沙盒页·节点行动作 ∥ 对话页·会话条钮——同一弹窗件、同一端点；零第二份表单）。
 *
 * 面：表单（SSH 端口（缺省 22）∥ SSH 用户 ∥ 认证 = 密钥/密码 + 秘密输入 ∥ sudo 口令（可选））∥ 已有凭据 ⇒ **只显元数据**（用户/端口/认证形/状态/更新时间——**密文零回填**）
 * ∥「撤销凭据」钮（二次确认）；提交 = `PUT …/runners/:id/credential`（成 ⇒ 关窗 + `onSaved`；形非法/失败 ⇒ 窗内就地人话）；撤销 = `DELETE …`（同前）。
 * 秘密面：输入只在提交体里去（本件零回显、零日志）；状态取值 `none` ∥ `sealed` ∥ `revoked`；文案键 = `admin.sandbox.*`（两页同源）。
 */
import { mapError, t } from "./i18n.mjs"
import { confirmModal, field, openModal, showNote, submitThen } from "./modal.mjs"

/** 认证形选项（键 = 既有 onboarding 两键——同词同表）。 */
const AUTH_OPTIONS = [["key", "admin.sandbox.authKey"], ["password", "admin.sandbox.authPassword"]]

/** 凭据状态文案（三值——枚举外 ⇒ 原值兜底）。 */
const STATE_KEYS = Object.freeze({ none: "admin.sandbox.hostCredStateNone", sealed: "admin.sandbox.hostCredStateSealed", revoked: "admin.sandbox.hostCredStateRevoked" })

/** 状态文案（选单 ∥ 弹窗元数据共用——枚举外 ⇒ 原值兜底）。 */
export function hostCredentialStateLabel(state) {
  return t(STATE_KEYS[state] ?? String(state ?? "none"))
}

/**
 * 主机选单（对话页径——`webui/CHAT.md` §2.1（会话条钮）⇒ 选主机 ⇒ **同弹窗件**）：行 = 名 ∥ 地址 ∥ SSH 用户 ∥ 凭据状态（`ssh` 元数据——零秘密）；
 * 列表读时读（概览既有端点——零新端点）；无主机 ∥ 读败 ⇒ 窗内就地人话（不静默）；点行 ⇒ 开主机凭据弹窗（单例弹窗：开新先关旧）。
 */
export function openHostCredentialPicker(ctx, { onSaved = null } = {}) {
  const { h } = ctx
  const box = h("div", {}, h("p", { class: "hint", text: t("common.loading") }))
  openModal({ title: t("admin.chat.hostCredPick"), body: box })
  ctx.api("/api/admin/sandbox/overview").then((data) => {
    const runners = Array.isArray(data?.runners) ? data.runners : []
    if (runners.length === 0) {
      box.replaceChildren(h("p", { class: "hint", text: t("admin.chat.hostCredNone") }))
      return
    }
    const body = runners.map((runner) => {
      const ssh = runner.ssh ?? {}
      const tr = h("tr", { class: "row-clickable", tabindex: "0" },
        h("td", { text: String(runner.name ?? "") }),
        h("td", { text: String(runner.address ?? "") }),
        h("td", { text: typeof ssh.user === "string" && ssh.user !== "" ? ssh.user : "—" }),
        h("td", { text: hostCredentialStateLabel(ssh?.credential?.state) }))
      const pick = () => openHostCredentialModal(ctx, { runner, onSaved }) // 单例：开新先关旧（选单随关）
      tr.addEventListener("click", pick)
      tr.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); pick() } })
      return tr
    })
    const headers = [t("admin.sandbox.name"), t("admin.sandbox.address"), t("admin.sandbox.onboardingUser"), t("admin.sandbox.hostCredState")]
    box.replaceChildren(h("div", { class: "table-wrap" },
      h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...body))))
  }).catch((error) => box.replaceChildren(h("p", { class: "hint error", text: mapError(error) })))
}

/** 元数据只读块（用户/端口/认证形/状态/更新时间——**零秘密字段**）。 */
function metaTable(ctx, ssh, state) {
  const { h } = ctx
  const kindKey = AUTH_OPTIONS.find(([value]) => value === ssh.authKind)
  const rows = [
    [t("admin.sandbox.onboardingUser"), ssh.user ?? "—"],
    [t("admin.sandbox.onboardingPort"), ssh.port === null || ssh.port === undefined ? "—" : String(ssh.port)],
    [t("admin.sandbox.authKind"), kindKey ? t(kindKey[1]) : "—"],
    [t("admin.sandbox.hostCredState"), t(STATE_KEYS[state] ?? state)],
    [t("admin.sandbox.hostCredUpdated"), ssh.credential?.updatedAt ? ctx.fmtTs(ssh.credential.updatedAt) : "—"],
  ]
  return h("div", { class: "table-wrap" },
    h("table", {}, h("tbody", {}, ...rows.map(([label, value]) => h("tr", {}, h("td", { text: label }), h("td", { text: value }))))))
}

/**
 * 开主机凭据弹窗（`runner` = `runners`/overview 行——`ssh` 元数据在场；`onSaved` = 落定后刷新回调（沙盒页 = 页重取；对话页可省））。
 * 已有凭据（`state = sealed`）⇒ 只显元数据 + 撤销钮（改 = 撤销后重录——密文不可回填）；余（`none` ∥ `revoked`）⇒ 表单 + 可省元数据。
 */
export function openHostCredentialModal(ctx, { runner, onSaved = null } = {}) {
  const { h } = ctx
  const ssh = runner?.ssh ?? {}
  const state = ssh?.credential?.state ?? "none"
  const refresh = async () => { if (onSaved !== null) await onSaved() }

  const kindSelect = h("select", {}, ...AUTH_OPTIONS.map(([value, key]) => h("option", { value, text: t(key) })))
  if (ssh.authKind === "password") kindSelect.value = "password"
  const portInput = h("input", { type: "number", min: "1", step: "1", value: String(ssh.port ?? 22) })
  const userInput = h("input", { value: ssh.user ?? "" })
  const secretTitle = h("span", { text: t(kindSelect.value === "password" ? "admin.sandbox.secretPassword" : "admin.sandbox.secretKey") })
  const secretInput = h("textarea", { rows: "3", autocomplete: "off", placeholder: t("admin.sandbox.secretPh") })
  const sudoInput = h("input", { type: "password", autocomplete: "off" })
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: t("admin.sandbox.hostCredSave") })
  kindSelect.addEventListener("change", () => {
    secretTitle.textContent = t(kindSelect.value === "password" ? "admin.sandbox.secretPassword" : "admin.sandbox.secretKey")
  })

  const form = h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
    field(h, "admin.sandbox.onboardingPort", portInput),
    field(h, "admin.sandbox.onboardingUser", userInput),
    field(h, "admin.sandbox.authKind", kindSelect),
    h("label", {}, secretTitle, secretInput),
    field(h, "admin.sandbox.sudoSecret", sudoInput),
    note,
    submitBtn)

  const bodyParts = [h("p", { class: "hint", text: t("admin.sandbox.hostCredTarget", { name: String(runner?.name ?? "") }) })]
  if (state !== "none") bodyParts.push(metaTable(ctx, ssh, state))
  if (state === "sealed") bodyParts.push(h("p", { class: "hint", text: t("admin.sandbox.hostCredSealedNote") }))
  else bodyParts.push(form)

  const modal = openModal({
    title: t("admin.sandbox.hostCredTitle"),
    body: h("div", {}, ...bodyParts),
    footer: state === "sealed"
      ? h("div", { class: "row-form" },
        h("button", { type: "button", class: "danger", text: t("admin.sandbox.revoke"), onclick: () => openRevokeConfirm() }),
        h("button", { type: "button", class: "tiny", text: t("common.cancel"), onclick: () => modal.close() }))
      : null,
  })

  /** 撤销（二次确认——只清服务器侧存留）。 */
  function openRevokeConfirm() {
    let handle = null
    handle = confirmModal(ctx, {
      title: "admin.sandbox.revoke", // 确认窗题 = 既有「撤销凭据」键（同词同表——零重复键）
      bodyText: "admin.sandbox.hostCredRevokeConfirm",
      bodyParams: { name: String(runner?.name ?? "") },
      confirmText: t("admin.sandbox.revoke"),
      submit: () => submitThen(ctx, {
        note: handle.note, button: handle.confirmBtn, modal: handle.modal, reload: refresh,
        call: () => ctx.api(`/api/admin/sandbox/runners/${runner.id}/credential`, { method: "DELETE" }),
        flash: t("admin.sandbox.hostCredRevoked", { name: String(runner?.name ?? "") }),
      }),
    })
  }

  /** 提交（设/改）：形非法 ⇒ 窗内人话（服务端 400 逐句）；成 ⇒ 关窗 + 刷新。 */
  async function submit(event) {
    event.preventDefault()
    note.hidden = true
    const sshUser = userInput.value.trim()
    const secret = secretInput.value
    if (sshUser === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.onboardingUser") }))
    if (secret === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: secretTitle.textContent }))
    const payload = { sshUser, auth: { kind: kindSelect.value, secret } }
    const port = portInput.value.trim()
    if (port !== "") payload.sshPort = Number(port)
    if (sudoInput.value !== "") payload.sudoSecret = sudoInput.value
    submitBtn.disabled = true
    showNote(note, t("admin.sandbox.submitting"), false)
    try {
      await ctx.api(`/api/admin/sandbox/runners/${runner.id}/credential`, { method: "PUT", body: payload })
      ctx.flash(t("admin.sandbox.hostCredSaved", { name: String(runner?.name ?? "") }))
      modal.close()
      await refresh()
    } catch (error) {
      submitBtn.disabled = false
      showNote(note, mapError(error)) // 400 逐句人话（库零变）——草稿不丢
    }
  }
}
