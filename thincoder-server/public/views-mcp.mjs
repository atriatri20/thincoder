/**
 * views-mcp.mjs — 管理·MCP 页（webui/MCP.md §2.1——KD-SV-202；server-mcp 批 · 台账 #1379）：
 * `#/admin/mcp`——仅 admin；页首 = 标题「MCP 服务器」+「添加」钮；清单表五列（名称 ∥ 传输 ∥ 目标 ∥ 启用 ∥ 操作（探活/改/删））
 * + 行内探活读数行（在飞/成/败三态——读数形对位 CLI `/mcp test`——`mcp/MCP.md` §3.3）+ 空态引导句；增/改弹窗（同窗体两态——
 * 三传输字段组切换 ∥ 秘密零回填：「已保存——留空 = 不变」+「清除」勾 ⇒ 显式 `null`）+ 删除确认弹窗（非原生 confirm——`confirmModal` 复用）。
 *
 * 契约 = `gateway/API.md` §2.13（五端点）：清单 = `GET /api/admin/mcp`；启用勾选即时写 = `PATCH …/:id { enabled }`；
 * 探活两入口（行内体 `{ id }`——零副作用 ∥ 窗内「测试」= 草稿体）= `POST /api/admin/mcp/probe`；提交 = `POST`/`PATCH`
 * （PATCH 字段缺席 = 不动）；删 = `DELETE`。编辑态非秘密字段回填 = 清单行 `target`（command ∥ url/wsUrl——`args` 清单行
 * 不下发 ⇒ 参数留空 = 不变）；秘密字段恒零回填（只进不出）。判权全在后端（admin 面——服务端 403 为准）；渲染一律节点 +
 * textContent；文案经 `t()` 取值（`webui/I18N.md` §2.1）。
 */
import { mapError, t } from "./i18n.mjs"
import { confirmModal, field, openModal, showNote, submitThen } from "./modal.mjs"

/** 传输三选（域语汇线值直示——弹窗选单 ∥ 行面共用）。 */
const TRANSPORTS = Object.freeze(["stdio", "http", "ws"])

/** KV 行解析（每行 `KEY=VALUE`——首 `=` 分键值；空行略；非法行 ⇒ `false`——调用方就地人话，零静默）。 */
function parseKvLines(text) {
  const out = {}
  for (const raw of String(text).split("\n")) {
    const line = raw.trim()
    if (line === "") continue
    const cut = line.indexOf("=")
    if (cut <= 0) return false
    out[line.slice(0, cut).trim()] = line.slice(cut + 1)
  }
  return out
}

// ── 页：管理·MCP（`#/admin/mcp`——仅 admin） ─────────────────────────────────

export async function renderMcp(ctx, mount) {
  const { h } = ctx
  const box = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  const addBtn = h("button", { type: "button", text: t("admin.mcp.add"), onclick: () => openMcpForm(ctx, { server: null, reload: load }) })
  mount.append(
    h("div", { class: "toolbar" }, h("h2", { text: t("admin.mcp.title") }), addBtn),
    h("section", { class: "card" }, box))

  /** 取数 + 渲染（成 ⇒ 表/空态两形；败 ⇒ 页内人话——`ctx.fail` 同拍）。 */
  async function load() {
    try {
      const data = await ctx.api("/api/admin/mcp")
      const servers = data.servers ?? []
      box.replaceChildren(...(servers.length === 0
        ? [h("p", { class: "hint", text: t("admin.mcp.empty") })]
        : [mcpTable(ctx, servers, { reload: load })]))
    } catch (error) {
      ctx.fail(error)
      box.replaceChildren(h("p", { class: "hint error", text: t("admin.mcp.loadFailed") }))
    }
  }
  await load()
}

/** 清单表（五列——名称 ∥ 传输 ∥ 目标 ∥ 启用 ∥ 操作（探活/改/删）+ 行内探活读数行；行 = [数据行, 读数行] 成对入 `<tbody>`）。 */
function mcpTable(ctx, servers, { reload }) {
  const { h } = ctx
  const headers = [t("admin.mcp.colName"), t("admin.mcp.colTransport"), t("admin.mcp.colTarget"), t("admin.mcp.colEnabled"), t("admin.mcp.colActions")]
  const body = []
  for (const row of servers) {
    const readout = h("span", { class: "hint" })
    const readoutRow = h("tr", { class: "detail-row", hidden: true }, h("td", { colspan: String(headers.length) }, readout))
    const probeBtn = h("button", { type: "button", class: "tiny", text: t("admin.mcp.probe") })
    probeBtn.addEventListener("click", async () => {
      probeBtn.disabled = true
      readoutRow.hidden = false
      readout.className = "hint"
      readout.textContent = t("admin.mcp.probeRunning")
      try {
        const result = await ctx.api("/api/admin/mcp/probe", { method: "POST", body: { id: row.id } }) // 行内径 = 体 `{ id }`（零副作用——不进会话 ∥ 不动库）
        if (result.ok === true) readout.textContent = t("admin.mcp.probeOk", { toolCount: result.toolCount, latencyMs: result.latencyMs })
        else { readout.className = "hint error"; readout.textContent = t("admin.mcp.probeFail", { error: result.error ?? "" }) }
      } catch (error) {
        readout.className = "hint error"
        readout.textContent = t("admin.mcp.probeFail", { error: mapError(error) })
      } finally {
        probeBtn.disabled = false
      }
    })
    const enabledBox = h("input", { type: "checkbox", checked: row.enabled === true })
    enabledBox.addEventListener("change", async () => {
      const next = enabledBox.checked
      enabledBox.disabled = true
      try {
        await ctx.api(`/api/admin/mcp/${row.id}`, { method: "PATCH", body: { enabled: next } })
        row.enabled = next // 成 ⇒ 行态随新数据
      } catch (error) {
        ctx.fail(error) // 败 ⇒ 红条
        enabledBox.checked = row.enabled === true // 勾选回读
      } finally {
        enabledBox.disabled = false
      }
    })
    const editBtn = h("button", { type: "button", class: "tiny", text: t("admin.mcp.edit") })
    editBtn.addEventListener("click", () => openMcpForm(ctx, { server: row, reload }))
    const removeBtn = h("button", { type: "button", class: "tiny danger", text: t("admin.mcp.remove") })
    removeBtn.addEventListener("click", () => openMcpRemove(ctx, { server: row, reload }))
    body.push(
      h("tr", {},
        h("td", { text: row.name }),
        h("td", { text: row.transport }),
        h("td", { text: row.target ?? "—" }),
        h("td", {}, enabledBox),
        h("td", {}, probeBtn, editBtn, removeBtn)),
      readoutRow)
  }
  return h("div", { class: "table-wrap" },
    h("table", {},
      h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))),
      h("tbody", {}, ...body)))
}

// ── 共用件：增/改弹窗（同窗体两态 ∥ 秘密零回填 ∥ 草稿探活） ──────────────────────

/** 增/改弹窗（`server` = 行（编辑态）∥ `null`（新建态）；`reload` = 宿主列表刷新口）。导出 = 单元测试档直测。 */
export function openMcpForm(ctx, { server = null, reload = () => {} }) {
  const { h } = ctx
  const isEdit = server !== null
  const hasSecrets = isEdit && server.hasSecrets === true
  const bodyBox = h("div")
  const footBox = h("div", { class: "row-form" })
  const modal = openModal({ title: t(isEdit ? "admin.mcp.editTitle" : "admin.mcp.addTitle"), body: bodyBox, footer: footBox })

  const nameInput = h("input", { value: isEdit ? String(server.name) : "", placeholder: t("admin.mcp.namePh") })
  const transportSelect = h("select", {}, ...TRANSPORTS.map((value) => h("option", { value, text: value })))
  transportSelect.value = isEdit ? String(server.transport) : TRANSPORTS[0]
  const enabledCheck = h("input", { type: "checkbox", checked: isEdit ? server.enabled === true : true }) // 缺省勾（新建——与 v24 DDL ∥ 服务端 `enabled` 缺省同拍）
  const commandInput = h("input", { value: isEdit && server.transport === "stdio" ? String(server.target ?? "") : "", placeholder: t("admin.mcp.commandPh") })
  const argsArea = h("textarea", { rows: "3" }) // 清单行不含 `args`（无回填面）——留空 = 不变
  const envArea = h("textarea", { rows: "3" })
  const urlInput = h("input", { value: isEdit && server.transport !== "stdio" ? String(server.target ?? "") : "", placeholder: t("admin.mcp.urlPh") })
  const headersArea = h("textarea", { rows: "3" })
  const tokenInput = h("input", { type: "password", autocomplete: "off" })
  const clearCheck = h("input", { type: "checkbox" })
  const note = h("p", { class: "hint error", hidden: true })
  const testBtn = h("button", { type: "button", class: "tiny", text: t("admin.mcp.test") })
  const submitBtn = h("button", { type: "button", text: t("common.save") })

  /** 草稿体（当前传输字段组；秘密字段：明填 ⇒ 携值 ∥ 编辑态留空 ⇒ 缺席（= 不变）；非法 KV 行 ⇒ `null` + 窗内人话）。 */
  const draftBody = () => {
    const transport = transportSelect.value
    const body = { name: nameInput.value.trim(), transport }
    if (transport === "stdio") {
      const command = commandInput.value.trim()
      if (command !== "") body.command = command
      const args = argsArea.value.split("\n").map((line) => line.trim()).filter((line) => line !== "")
      if (args.length > 0) body.args = args
      const env = parseKvLines(envArea.value)
      if (env === false) { showNote(note, t("admin.mcp.kvInvalid")); return null }
      if (Object.keys(env).length > 0) body.env = env
    } else {
      const url = urlInput.value.trim()
      if (url !== "") body[transport === "ws" ? "wsUrl" : "url"] = url
      const headers = parseKvLines(headersArea.value)
      if (headers === false) { showNote(note, t("admin.mcp.kvInvalid")); return null }
      if (Object.keys(headers).length > 0) body.headers = headers
      if (tokenInput.value !== "") body.token = tokenInput.value
    }
    if (hasSecrets && clearCheck.checked) { body.token = null; body.headers = null; body.env = null } // 清除勾 ⇒ 显式 null（凭据列整体清空）
    return body
  }

  /** 体渲（传输三择 ⇒ 字段组切换；控件节点重挂，已填值随节点保留；状态行随切复位）。 */
  const renderBody = () => {
    const transport = transportSelect.value
    urlInput.setAttribute("placeholder", t(transport === "ws" ? "admin.mcp.wsUrlPh" : "admin.mcp.urlPh"))
    note.hidden = true // 状态行复位（旧错行不对应新字段组——零残留）
    note.textContent = ""
    const fields = [
      field(h, "admin.mcp.name", nameInput),
      field(h, "admin.mcp.transport", transportSelect),
      ...(transport === "stdio"
        ? [field(h, "admin.mcp.command", commandInput), field(h, "admin.mcp.args", argsArea), field(h, "admin.mcp.env", envArea)]
        : [field(h, "admin.mcp.url", urlInput), field(h, "admin.mcp.headers", headersArea), field(h, "admin.mcp.token", tokenInput)]),
      h("label", { class: "key-clear" }, enabledCheck, t("admin.mcp.enabled")),
    ]
    if (hasSecrets) {
      fields.push(h("p", { class: "hint", text: t("admin.mcp.secretSaved") })) // 零回填提示（已保存凭据——留空 = 不变）
      fields.push(h("label", { class: "key-clear" }, clearCheck, t("admin.mcp.clearSecret")))
    }
    bodyBox.replaceChildren(
      h("div", { class: "provider-form stacked" }, ...fields),
      h("div", { class: "info-actions" }, testBtn),
      note)
  }
  transportSelect.addEventListener("change", renderBody)
  clearCheck.addEventListener("change", () => { // 清除勾 ⇒ 秘密输入随禁（勾选态 = 清空语义——输入面失效防混淆）
    for (const input of [envArea, headersArea, tokenInput]) input.disabled = clearCheck.checked
  })

  /** 窗内「测试」= 草稿探活（体 = 表单当前值；编辑态携 `id` ⇒ 缺席字段回落库内行）。 */
  testBtn.addEventListener("click", async () => {
    const body = draftBody()
    if (body === null) return
    if (isEdit) body.id = server.id
    testBtn.disabled = true
    showNote(note, t("admin.mcp.probeRunning"), false)
    try {
      const result = await ctx.api("/api/admin/mcp/probe", { method: "POST", body })
      if (result.ok === true) showNote(note, t("admin.mcp.probeOk", { toolCount: result.toolCount, latencyMs: result.latencyMs }), false)
      else showNote(note, t("admin.mcp.probeFail", { error: result.error ?? "" }))
    } catch (error) {
      showNote(note, t("admin.mcp.probeFail", { error: mapError(error) }))
    } finally {
      testBtn.disabled = false
    }
  })

  submitBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim()
    if (name === "") { showNote(note, t("admin.mcp.nameRequired")); return }
    const body = draftBody()
    if (body === null) return
    body.enabled = enabledCheck.checked
    await submitThen(ctx, {
      note, button: submitBtn, modal,
      call: () => ctx.api(isEdit ? `/api/admin/mcp/${server.id}` : "/api/admin/mcp", { method: isEdit ? "PATCH" : "POST", body }),
      flash: t("admin.mcp.saved", { name }),
      reload,
    })
  })

  footBox.replaceChildren(submitBtn, h("button", { type: "button", class: "tiny", text: t("common.cancel"), onclick: () => modal.close() }))
  renderBody()
  nameInput.focus()
  return modal
}

// ── 共用件：删除确认弹窗（非原生 confirm——后果句 + 取消） ──────────────────────

/** 删除确认（成 ⇒ flash + 关窗 + 刷新）。导出 = 单元测试档直测。 */
export function openMcpRemove(ctx, { server, reload = () => {} }) {
  let handle = null
  handle = confirmModal(ctx, {
    title: "admin.mcp.deleteTitle",
    bodyText: "admin.mcp.deleteConfirm",
    bodyParams: { name: String(server.name) },
    confirmText: t("admin.mcp.deleteSubmit"),
    submit: () => submitThen(ctx, {
      note: handle.note, button: handle.confirmBtn, modal: handle.modal,
      call: () => ctx.api(`/api/admin/mcp/${server.id}`, { method: "DELETE" }),
      flash: t("admin.mcp.deleted", { name: String(server.name) }),
      reload,
    }),
  })
  return handle
}
