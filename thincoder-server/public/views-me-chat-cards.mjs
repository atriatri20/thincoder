/**
 * views-me-chat-cards.mjs — 成员·对话页·ask 卡族（`webui/CHAT.md` §2.2 差异⑨；机制 = `agent/MEMBER-AGENT.md` §3.11(2) KD-SV-217）；
 * 自 `views-me-chat.mjs` 外拆（拆档缘由 = 该件越 500 软线——增行前先外拆；member-face-parity 批）——面内四族：
 * ① **卡族四件**：`permission`（核 `renderApprovalCard`——diff 预览内建）∥ `batch`（核 `renderBatchApprovalCard`）∥
 *    `question`（核 `renderQuestionCard`）∥ `secret`（**页内件**——核无此卡；沿 VSC `secret-input.js` 同族：`fields` 逐项
 *    masked/prefill/required + 提交/取消——值只经应答体，零入上下文零落盘）；
 * ② **应答单点**：`POST /api/me/chat/sessions/:id/asks/:promptId`（体按 kind：`{ verdict }` ∥ `{ answer }` ∥ `{ values }`——
 *    词表单源 = API.md §2.11）；回执失败 ⇒ 卡面重挂（非乐观——桌面同规）+ 就地人话；
 * ③ **`view-diff` ⇒ 页内弹窗全量 patch**：判类 = 核 `patchLineType`、差分 = 核 `lineDiff`（页零自持算法）；节点自组
 *    （页 canon 零 `innerHTML` 写口——类名沿用核发射面 `.diff-*`）；
 * ④ **收尾清卡**：回合 `end`/中止/掉线 ⇒ 残留卡全摘（relay 侧同拍全量结算；后到应答 ⇒ 400 零副作用）。
 */
import { t } from "./i18n.mjs"
import { coreText } from "./views-me-chat-messages.mjs"
import { openModal } from "./modal.mjs"
import { renderApprovalCard, renderBatchApprovalCard } from "/rc/cards/permission.mjs"
import { renderQuestionCard } from "/rc/cards/question.mjs"
import { lineDiff } from "/rc/diff.mjs"
import { patchLineType } from "/rc/lib.mjs"

/** 核件 `deps.emit` ⇒ 应答 verdict（映射逐字同桌面 `views/approval.mjs` `verdictOfEmit`）：
 *  逐项 `true ⇒ once ∥ "approveAll" ⇒ always ∥ false ⇒ reject`；批 `choice` 三值直传；表外 ⇒ `null`（零派发）。 */
export function verdictOfEmit(type, payload) {
  if (type === "permissionResponse") {
    if (payload?.approved === true) return "once"
    if (payload?.approved === "approveAll") return "always"
    if (payload?.approved === false) return "reject"
    return null
  }
  if (type === "batchPermissionResponse") {
    const choice = payload?.choice
    return choice === "approveAll" || choice === "oneByOne" || choice === "deny" ? choice : null
  }
  return null
}

/** 字段标签（VSC 同式）：`ssh.field.<name>` 命中 ⇒ 该词；缺键 ⇒ 字段原名（不空标）。 */
function fieldWord(name) {
  const raw = String(name ?? "")
  const key = `ssh.field.${raw}`
  const word = t(key)
  return word === key ? raw : word
}

/** 卡体（文本型消息区——卡挂 `.chat-thread` 尾）∥ 应答回调 `respond(values)` 注入（页面侧 `POST …/asks/:promptId`）。 */
export function secretNode(h, frame, respond) {
  const card = h("div", { class: "secret-card", role: "alert", "aria-label": t("secret.label") })
  const vars = { host: frame?.host ?? "", user: frame?.user ?? "", port: frame?.port ?? "" }
  const titleKey = typeof frame?.keys?.title === "string" ? frame.keys.title : ""
  const promptKey = typeof frame?.keys?.prompt === "string" ? frame.keys.prompt : ""
  if (titleKey !== "") card.append(h("div", { class: "secret-title", text: coreText(titleKey, vars) }))
  if (promptKey !== "") card.append(h("div", { class: "secret-prompt", text: coreText(promptKey, vars) }))
  const rows = []
  for (const field of Array.isArray(frame?.fields) ? frame.fields : []) {
    const input = h("input", {
      class: "secret-input", type: field?.masked === true ? "password" : "text", autocomplete: "off",
      value: field?.masked === true ? "" : String(field?.prefill ?? ""), // 密码零预填（三端同判据）
    })
    rows.push({ field, input })
    card.append(h("div", { class: "secret-field" }, h("label", { text: fieldWord(field?.name) }), input))
  }
  /** 两径共出口：提交（必填门——首个空必填 ⇒ 聚焦零出站）∥ 取消（`values: null`）。 */
  function submit() {
    for (const { field, input } of rows) if (field?.required === true && input.value === "") { input.focus(); return }
    const values = {}
    for (const { field, input } of rows) values[String(field?.name ?? "")] = input.value
    respond(values)
  }
  const submitBtn = h("button", { type: "button", class: "perm-btn approve", text: t("secret.submit"), onclick: submit })
  const cancelBtn = h("button", { type: "button", class: "perm-btn deny", text: t("secret.cancel"), onclick: () => respond(null) })
  card.append(h("div", { class: "secret-actions" }, submitBtn, cancelBtn))
  for (const { input } of rows) {
    input.addEventListener("keydown", (event) => {
      if (event.isComposing || event.keyCode === 229) return // IME 组字门（同族先例 = 核 `cards/question.mjs`）
      if (event.key === "Enter") submit()
    })
  }
  return card
}

/**
 * 卡族工厂。`ctx` = 视图上下文（`h`）；`deps` 五件：`thread()` ⇒ 挂载容器（`.chat-thread`）· `sessionId()` ⇒ 当刻会话 id ·
 * `respond(path, body)` ⇒ `ctx.api` 直取（页面注入）· `onFail(error)` ⇒ 就地人话 · `onChanged()` ⇒ 卡集变动回调（状态行段 11 读数）·
 * `focusInput()` ⇒ 弹窗/作答收口回焦输入区。返回 `{ append(frame), clear(), pendingCount() }`。
 */
export function createAskCards(ctx, deps = {}) {
  const { h } = ctx
  const live = new Map() // promptId ⇒ 卡元素（在决 ask 表——状态行段 11 读数源）

  /** 卡挂载（`#messages` 尾 + `scrollIntoView`——§3.11(2) 页面去留）。 */
  function attach(node, frame, kind) {
    live.set(String(frame?.promptId ?? ""), { node, kind })
    deps.thread?.()?.append(node)
    node.scrollIntoView?.({ block: "nearest" })
    deps.onChanged?.()
  }
  /** 应答（单点）：先摘卡 ⇒ `POST …/asks/:promptId`；失败 ⇒ 人话 + 卡面重挂（非乐观——桌面同规）。 */
  function respond(frame, node, body) {
    const sessionId = deps.sessionId?.() ?? null
    const promptId = frame?.promptId
    liveDelete(node)
    node.remove()
    if (sessionId === null || promptId === undefined || promptId === null) return
    void Promise.resolve(deps.respond?.(`/api/me/chat/sessions/${encodeURIComponent(sessionId)}/asks/${encodeURIComponent(String(promptId))}`, body))
      .then(() => deps.onAnswered?.(frame))
      .catch((error) => { deps.onFail?.(error); attach(node, frame, "retry") })
  }
  function liveDelete(node) {
    for (const [id, item] of live) if (item.node === node) live.delete(id)
    deps.onChanged?.()
  }
  /** `view-diff` 弹窗：全量 patch（判类/差分 = 核两件；节点自组——类名沿核发射面）；关闭回焦输入区。 */
  function openDiff(diff) {
    const body = h("div", { class: "diff-preview" })
    const patch = typeof diff?.patch === "string" ? diff.patch : null
    const line = (type, text) => h("div", { class: `diff-line ${type === "add" ? "diff-add" : type === "del" ? "diff-del" : "diff-same"}` },
      h("span", { class: "diff-prefix", text: type === "add" ? "+" : type === "del" ? "-" : " " }), String(text ?? "") || " ")
    if (patch !== null) {
      body.append(h("div", { class: "diff-header", text: "apply_patch" }))
      for (const text of patch.split("\n")) body.append(line(patchLineType(text), text))
    } else if (diff !== null && typeof diff === "object" && (typeof diff.old === "string" || typeof diff.new === "string")) {
      body.append(h("div", { class: "diff-header", text: String(diff.path ?? "") }))
      for (const item of lineDiff(diff.old ?? "", diff.new ?? "")) body.append(line(item.type, item.text))
    } else return
    openModal({ title: t("me.chat.diffTitle"), body, onClose: () => deps.focusInput?.() })
  }
  /** `ask` 帧 ⇒ 卡（四 kind）∥ 表外 kind ⇒ 零投（禁假造）。 */
  function append(frame) {
    const kind = String(frame?.kind ?? "")
    if (kind === "permission") {
      const node = renderApprovalCard({ promptId: frame.promptId, tool: String(frame.tool ?? ""), args: typeof frame.args === "string" ? frame.args : "", diff: frame.diff ?? null, owner: frame.owner ?? null }, {
        emit: (type, payload) => {
          if (type === "openDiff") { openDiff(payload?.diff ?? frame.diff ?? null); return }
          const verdict = verdictOfEmit(type, payload)
          if (verdict !== null) respond(frame, node, { verdict })
        },
      })
      attach(node, frame, kind)
      return
    }
    if (kind === "batch") {
      const tools = (Array.isArray(frame.tools) ? frame.tools : []).map((name) => (typeof name === "string" ? { name } : name))
      const node = renderBatchApprovalCard({ promptId: frame.promptId, count: frame.count, tools }, {
        emit: (type, payload) => {
          const verdict = verdictOfEmit(type, payload)
          if (verdict !== null) respond(frame, node, { verdict })
        },
      })
      attach(node, frame, kind)
      return
    }
    if (kind === "question") {
      const node = renderQuestionCard({ promptId: frame.promptId, question: String(frame.question ?? ""), options: Array.isArray(frame.options) ? frame.options : [] }, {
        emit: (type, payload) => { if (type === "questionResponse") respond(frame, node, { answer: payload?.answer ?? null }) },
        onAnswered: () => deps.focusInput?.(),
      })
      attach(node, frame, kind)
      return
    }
    if (kind === "secret") {
      const node = secretNode(h, frame, (values) => respond(frame, node, { values: values ?? null }))
      attach(node, frame, kind)
    }
  }

  return {
    append,
    /** 收尾清卡（`end`/中止/掉线——relay 侧同拍全量结算）：全摘 + 清表 + 回调。 */
    clear() {
      for (const { node } of live.values()) node.remove()
      live.clear()
      deps.onChanged?.()
    },
    /** 重读径重挂（回读装配不动在决卡：`renderThread` 的 `replaceChildren` 摘走卡体但表不变⇒旧卡失答；此处把表内卡重挂区尾）。 */
    remount() {
      for (const { node } of live.values()) if (node.parentNode === null) deps.thread?.()?.append(node)
    },
    pendingCount: () => live.size,
  }
}
