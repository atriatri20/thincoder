/**
 * secret-input.js — 凭据 / 秘密输入卡端壳（端协议壳 —— 与 `question.js` 同族）。
 * 本档留端（照 `question.js` 先例）：出站绑 `vscode.postMessage` + 提交 / 取消径摘卡 +
 * 回焦输入框 + append 到 `#messages` + `scrollIntoView` + 首输入框初始聚焦。
 *
 * 载荷 = 核注入缝 `ctx.onSecretInput(payload)`（设计单源 = `docs/core/design/TOOLS.md` §6.22 ⑧）：
 *   `{ kind, sessionId, host, user, port, fields: [{ name, masked, required, prefill, checkbox? }],
 *      keys: { title, prompt } }`
 * 词面 = i18n 键（端投影走本端字典——渲染期以载荷 host / user / port 作 `${…}` 插值）；
 * 字段标签 = 词键 `ssh.field.<name>`，缺键回退字段原名（不空标）。
 *
 * **值面纪律（NS4）**：值只走返回路（`secretInputResponse`）——卡面零日志 ∥ 零状态留存
 * （提交 / 取消即摘卡，输入值随节点一并丢弃）；掩码字段以 `type=password` 渲染（零回显）。
 */
import { vscode } from "./state.js"
import { t } from "./i18n.js"

/** 出站单点（判别式字面量在发射位——照 `question.js` 端协议形）：提交 ⇒ `values` 对象；
 *  取消 ⇒ `values: null`。`promptId` 同行（host 按 id 查队列条目——迟到 / 错序响应不误 resolve）。 */
function respond(values, promptId) {
  const msg = { type: "secretInputResponse", values: values ?? null }
  if (promptId != null) msg.promptId = promptId
  vscode.postMessage(msg)
}

/** 字段标签词（端投影）：`ssh.field.<name>` 命中 ⇒ 该词；缺键 ⇒ 字段原名。 */
function fieldWord(name) {
  const raw = String(name ?? "")
  const key = `ssh.field.${raw}`
  const word = t(key)
  return word === key ? raw : word
}

/** 凭据卡（inline secret-input —— 非 VS Code 原生弹窗）：提交 ⇒ `secretInputResponse`
 *  `{ values: { <name>: <值> }, promptId }`；取消 ⇒ `{ values: null, promptId }`。两径皆摘卡。 */
export function showSecretInput(ctx, payload, promptId) {
  const keys = payload?.keys ?? {}
  const vars = { host: payload?.host ?? "", user: payload?.user ?? "", port: payload?.port ?? "" }
  const el = document.createElement("div")
  el.className = "secret-card"
  el.setAttribute("role", "alert")
  el.setAttribute("aria-label", t("secret.label"))
  if (promptId != null) el.dataset.promptId = String(promptId)

  const titleEl = document.createElement("div")
  titleEl.className = "secret-title"
  titleEl.textContent = t(String(keys.title ?? ""), vars)
  el.appendChild(titleEl)

  const promptEl = document.createElement("div")
  promptEl.className = "secret-prompt"
  promptEl.textContent = t(String(keys.prompt ?? ""), vars)
  el.appendChild(promptEl)

  const rows = []
  for (const f of Array.isArray(payload?.fields) ? payload.fields : []) {
    const field = f ?? {}
    const row = document.createElement("div")
    row.className = "secret-field"
    const label = document.createElement("label")
    label.textContent = fieldWord(field.name)
    const input = document.createElement("input")
    input.className = "secret-input"
    // 勾选字段（`save`——§6.22 ⑪）：原生复选框；值 = 布尔（`checked`）；缺省不勾（opt-in）。
    input.type = field.checkbox === true ? "checkbox" : field.masked === true ? "password" : "text"
    input.autocomplete = "off"
    // 预填 = 仅非密非勾选字段（设计 ⑨「密码零预填 ∥ 零记忆」；三端同判据 = CLI `secret-prompt.mjs`
    // `field?.masked === true ? "" : …` ∥ 桌面 `secret-prompt.mjs`「非密预填，密码零预填」）。
    if (field.checkbox === true) input.checked = field.prefill === true
    else input.value = field.masked === true ? "" : String(field.prefill ?? "")
    input.addEventListener("keydown", (e) => {
      // IME 组字门（同族先例 = 核卡 `cards/question.mjs` 的作答控件）：组合期回车 = 选字确认 ⇒ 零提交
      if (e.isComposing || e.keyCode === 229) return
      if (e.key === "Enter") submit()
    })
    row.appendChild(label)
    row.appendChild(input)
    el.appendChild(row)
    rows.push({ field, input })
  }

  const actions = document.createElement("div")
  actions.className = "secret-actions"
  const submitBtn = document.createElement("button")
  submitBtn.className = "perm-btn approve"
  submitBtn.textContent = t("secret.submit")
  const cancelBtn = document.createElement("button")
  cancelBtn.className = "perm-btn deny"
  cancelBtn.textContent = t("secret.cancel")
  actions.appendChild(submitBtn)
  actions.appendChild(cancelBtn)
  el.appendChild(actions)

  /** 两径共出口（提交 / 取消）：出站 → 摘卡 → 回焦输入框。 */
  const done = (values) => { respond(values, promptId); el.remove(); ctx.inputEl.focus() }

  /** 提交：必填门（载荷字段语义）——首个空必填字段 ⇒ 聚焦该字段、零出站；否则收集全字段值。
   *  勾选字段 ⇒ 布尔（`checked === true`）。 */
  function submit() {
    for (const { field, input } of rows) {
      if (field.checkbox !== true && field.required === true && input.value === "") { input.focus(); return }
    }
    const values = {}
    for (const { field, input } of rows) {
      values[String(field.name ?? "")] = field.checkbox === true ? input.checked === true : input.value
    }
    done(values)
  }
  submitBtn.addEventListener("click", submit)
  cancelBtn.addEventListener("click", () => done(null))

  ctx.messagesEl.appendChild(el)
  el.scrollIntoView({ behavior: "smooth", block: "nearest" })
  const first = el.querySelector(".secret-input")
  if (first) setTimeout(() => first.focus(), 50)
}
