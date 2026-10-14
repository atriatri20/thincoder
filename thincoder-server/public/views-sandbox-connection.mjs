/**
 * views-sandbox-connection.mjs — 沙盒页·连接方式件（webui/SANDBOX.md §2.1①「连接方式编辑」；sandbox-exec-rebuild 批 · 增补 #2）：
 * **连接段与编辑窗两处共用一件**——`createConnectionSection`（二择「明文 ∥ TLS 客户端证书」+ TLS 档三件输入
 * （CA 证书 ∥ 客户端证书 ∥ 客户端私钥——多行输入；**零回填**）+ 当刻态标（已设（时间）/未设））——
 * 添加节点弹窗（`views-sandbox.mjs`）与连接方式编辑窗（本档 `openConnectionModal`）同件挂载。
 * 编辑窗：当刻态回显（地址 scheme 派生）⇒ 提交 ⇒ 自检中态 ⇒ 成：关窗 + 刷新 + 提示；败：窗内就地人话（服务端 502 原文）+ 库零变；
 * **切回明文 = 二次确认（材料将清零，不可恢复）**。
 * 形态 = 地址 scheme 单源（`http` = 明文缺省 ∥ `https` = TLS——连接方式由 scheme 派生呈现；机制 = `sandbox/SANDBOX.md` §3 连接方式块）；
 * 契约 = `gateway/API.md` §2.5（`POST …/runners` 体增 `connection`/`tls`——缺省档不携键、零行为变化 ∥
 * `PUT …/runners/:id/connection`——全列覆写 ∥ 先自检后落库）；文案经 `t()`（`webui/I18N.md` §2.1）；渲染一律节点 + textContent（零拼串）。
 * 单元测试档直测面 = `connectionSchemeOf`（纯函数） ∥ `createConnectionSection` ∥ `openConnectionModal`。
 */
import { mapError, t } from "./i18n.mjs"
import { confirmModal, field, openModal, showNote, submitThen } from "./modal.mjs"

/** 连接档（地址 scheme 单源派生——`https` = TLS ∥ 余（空/裸 host/`http`）= 明文；行徽标与编辑窗当刻态同源）。 */
export function connectionSchemeOf(address) {
  return String(address ?? "").trim().toLowerCase().startsWith("https://") ? "https" : "http"
}

/** 三件字段（序 = 提交体键序；`field` 标题键与材料键一一对位）。 */
const MATERIAL_FIELDS = [
  ["ca", "admin.sandbox.connCa"],
  ["cert", "admin.sandbox.connCert"],
  ["key", "admin.sandbox.connKey"],
]

/**
 * 连接段共用件（添加节点弹窗 ∥ 连接方式编辑窗同件）：二择 + TLS 档三件 + 当刻态标（`tls.state = sealed` ⇒ 「已设（时间）」）。
 * `tls` = 行 `tls` 元数据（`{ state, updatedAt }`——编辑窗当刻态；添加侧省 ⇒ 「未设」）；`initial` = 当刻档（编辑窗按 scheme 回显）。
 * 出 = `{ node, kind, materials, missingKey }`：`kind()` = `"plain" ∥ "tls"`（提交体按档携键）；`materials()` = `{ ca, cert, key }`（原文——只进不出）；
 * `missingKey()` = 首个空缺字段的标题键（无缺 ⇒ `null`——调用方转必填人话）。零回填：三件恒空输入框。
 */
export function createConnectionSection(ctx, { tls = null, initial = "plain" } = {}) {
  const { h } = ctx
  let kind = initial === "tls" ? "tls" : "plain"
  const inputs = {}
  const plainRadio = h("input", { type: "radio", name: "conn-kind", value: "plain", checked: kind === "plain" })
  const tlsRadio = h("input", { type: "radio", name: "conn-kind", value: "tls", checked: kind === "tls" })
  const stateLine = h("p", {
    class: "hint",
    text: tls?.state === "sealed"
      ? t("admin.sandbox.connStateSet", { time: tls.updatedAt === null || tls.updatedAt === undefined ? "—" : ctx.fmtTs(tls.updatedAt) })
      : t("admin.sandbox.connStateUnset"),
  })
  const tlsBox = h("div", { class: "stack-box" }, stateLine,
    ...MATERIAL_FIELDS.map(([name, labelKey]) => {
      const input = h("textarea", { rows: "4", autocomplete: "off", placeholder: t("admin.sandbox.connMaterialPh") })
      inputs[name] = input
      return field(h, labelKey, input)
    }),
    h("p", { class: "hint", text: t("admin.sandbox.connNote") }))
  const node = h("div", { class: "stack-box" },
    h("span", { class: "hint", text: t("admin.sandbox.connKind") }),
    h("label", { class: "key-clear" }, plainRadio, t("admin.sandbox.connPlain")),
    h("label", { class: "key-clear" }, tlsRadio, t("admin.sandbox.connTls")),
    tlsBox)

  /** 二择同拍（选中态 + 三件区显隐——单点收口）。 */
  function sync() {
    plainRadio.checked = kind === "plain"
    tlsRadio.checked = kind === "tls"
    tlsBox.hidden = kind !== "tls"
  }
  plainRadio.addEventListener("change", () => { kind = "plain"; sync() })
  tlsRadio.addEventListener("change", () => { kind = "tls"; sync() })
  sync()

  return {
    node,
    kind: () => kind,
    materials: () => ({ ca: inputs.ca.value, cert: inputs.cert.value, key: inputs.key.value }),
    missingKey: () => {
      for (const [name, labelKey] of MATERIAL_FIELDS) {
        if (String(inputs[name].value).trim() === "") return labelKey
      }
      return null
    },
  }
}

/**
 * 连接方式编辑窗（节点行「连接」动作）：当刻态回显（`connectionSchemeOf`——地址 scheme 单源）⇒ 二择/三件/态标；
 * 提交 = `PUT …/runners/:id/connection`（全列覆写）：明文 ⇒ `{ connection: "plain" }`（服务端原子清零材料 + 地址回 http）∥
 * TLS ⇒ `{ connection: "tls", tls: { ca, cert, key } }` 三件逐值（缺件 ⇒ 窗内必填人话——服务端亦校验）；
 * **切回明文**（当刻为 TLS）⇒ 二次确认（材料将清零，不可恢复——确认窗顶替编辑窗，沿主机凭据撤销先例）。
 */
export function openConnectionModal(ctx, { runner, reload }) {
  const { h } = ctx
  const name = String(runner?.name ?? "")
  const current = connectionSchemeOf(runner?.address) === "https" ? "tls" : "plain"
  const section = createConnectionSection(ctx, { tls: runner?.tls ?? null, initial: current })
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: t("admin.sandbox.connSave") })
  const modal = openModal({
    title: t("admin.sandbox.connTitle"),
    body: h("div", {},
      h("p", { class: "hint", text: t("admin.sandbox.hostCredTarget", { name }) }),
      h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit }, section.node, note, submitBtn)),
  })

  /** 提交体（全列覆写形——缺省档不携 `tls` 键）。 */
  function payload() {
    if (section.kind() !== "tls") return { connection: "plain" }
    const { ca, cert, key } = section.materials()
    return { connection: "tls", tls: { ca, cert, key } }
  }

  async function put(body) {
    submitBtn.disabled = true
    showNote(note, t("admin.sandbox.connChecking"), false) // 自检中态（服务端先自检后落库——失败库零变）
    try {
      await ctx.api(`/api/admin/sandbox/runners/${runner.id}/connection`, { method: "PUT", body })
      ctx.flash(t("admin.sandbox.connSaved", { name }))
      modal.close()
      await reload()
    } catch (error) {
      submitBtn.disabled = false
      showNote(note, mapError(error)) // 窗内就地人话（服务端 502 原文）；草稿不丢（输入不清）
    }
  }

  async function submit(event) {
    event.preventDefault()
    note.hidden = true
    if (section.kind() === "tls") {
      const missing = section.missingKey()
      if (missing !== null) return showNote(note, t("admin.sandbox.fieldRequired", { field: t(missing) }))
    }
    if (section.kind() === "plain" && current === "tls") return openConvertConfirm() // 切回明文 = 确认句（材料将清零）
    await put(payload())
  }

  /** 切回明文二次确认（确认窗顶替编辑窗——取消 ⇒ 两窗皆闭，材料零触）。 */
  function openConvertConfirm() {
    let handle = null
    handle = confirmModal(ctx, {
      title: "admin.sandbox.connConvertTitle",
      bodyText: "admin.sandbox.connConvertConfirm",
      confirmText: t("admin.sandbox.connConvertTitle"),
      submit: () => submitThen(ctx, {
        note: handle.note, button: handle.confirmBtn, modal: handle.modal, reload,
        call: () => ctx.api(`/api/admin/sandbox/runners/${runner.id}/connection`, { method: "PUT", body: { connection: "plain" } }),
        flash: t("admin.sandbox.connSaved", { name }),
      }),
    })
  }
}
