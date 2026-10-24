/**
 * secret-prompt.mjs — CLI 面 SSH 凭据窗（SSH-SESSION 批 · 台账 #1436 · CLI 腿）。
 *
 * 设计单源 = `docs/core/design/TOOLS.md` §6.22：⑧ 三端弹窗载荷（`ctx.onSecretInput`）∥ ⑦ 凭据零入
 * 上下文 ∥ ⑨ 非密字段预填。先例 = `ask-steps.mjs`（掩码回显 `maskEcho` 直取 ∥ 掩码步值零留存）∥
 * `question.mjs` 无 UI 抛例（无 UI ⇒ 可读错误句——不挂起、不静默）。
 *
 * 面形态（模态族第四支——overlay 支 ∥ 键面序 2c）：`state.secretPrompt` =
 *   { kind, sessionId, host, user, port, keys, fields, index, values, lines, scroll }
 * 步进 = 一屏一字段（Enter 推进 / 末步提交 ∥ Esc 整窗取消）；当前字段原文住输入框 `state.input`
 * （同 `/team login` 掩码步口径——显示层变换，提交值取 `state.input` 原数组）。**值零留面体态**：
 * 掩码字段值提交即交本档字段决议（`_resolveField` 一字段一决议）——不入 `state.secretPrompt` ∥
 * 不入对话行 ∥ 不入日志（NS4）；提交后输入框即清（面退场同清）。非密字段（user 类）留 `face.values`
 * 供上下文行回显（形同 `teamAskLines` 已填行）。
 * 无 UI（`onSecretInput` 未注入 ∥ ACP 通道）：`refuseSecretInput()` 抛 `SECRET_NO_UI_TEXT`（核字典
 * `ssh.no_ui` 投影——端零字面副本）——ACP 面经 `src/acp.mjs` 取本件（单源一档；工具本体不剔除
 * ——密钥 / agent 径照常）。
 * 词面 = i18n 键端投影（`t(key, vars)` 插值载荷三值 `host` / `user` / `port`；字段标签
 * `ssh.field.<name>` 缺键回退原名——同批三端（VSC / 桌面 `fieldWord`）同式）。
 */
import { ansi, C } from "./ansi.mjs"
import { t } from "@thincoder/core/i18n.mjs"

/** 无 UI 可读句（失败句 + 指引——设计 §6.22 ⑧/E6）：**核字典投影**（键 `ssh.no_ui`——单源一档；
 *  端零字面副本）。CLI 无交互面 ∥ ACP 通道共此一句。 */
export const SECRET_NO_UI_TEXT = t("ssh.no_ui")

/** 载荷无字段（成形外——核侧不产）：可读句同族拒绝（fail-closed——不静默交空值）。 */
const SECRET_MALFORMED_TEXT = "ssh credential request carries no fields (malformed payload)"

/** 整窗取消哨兵（面内私有——与用户输入值不同域：空串是非必填字段的合法值）。 */
const CANCELLED = Symbol("secret-prompt-cancelled")

/** 无 UI 拒绝（`onSecretInput` 契约的失败面）：同步抛——调用方（核工具）取回可读错误。 */
export function refuseSecretInput() {
  throw new Error(SECRET_NO_UI_TEXT)
}

/** 面标题（overlay 标题行左段）：`keys.title` = i18n 键（核字典 + 端投影——`t(key, vars)` 插值）。
 *  键位缺（防御）⇒ `"Secret"`。 */
export function secretPromptTitle(face) {
  const text = secretKeyText(face?.keys?.title, secretVars(face))
  return text !== "" ? text : "Secret"
}

/** 当前字段（步位）。 */
export function secretCurrentField(face) {
  return face?.fields?.[face.index ?? 0] ?? null
}

/** 掩码判据（显示层：`layout.mjs` 输入框 buf 构造消费——与 `askMaskActive` 同位，各面各判据）。 */
export function secretMaskActive(state) {
  const face = state?.secretPrompt
  return face != null && secretCurrentField(face)?.masked === true
}

/** 目标投影（`[user@]host[:port]`——三段皆缺 ⇒ `""`；缺一段省一段）。 */
export function secretTargetText(face) {
  const host = typeof face?.host === "string" ? face.host.trim() : ""
  const user = typeof face?.user === "string" ? face.user.trim() : ""
  const port = face?.port
  if (host === "") return user
  const portPart = port === null || port === undefined || port === "" ? "" : `:${port}`
  return `${user === "" ? "" : `${user}@`}${host}${portPart}`
}

/** 面体行（overlay 契约 `{ lines, scroll }`）：目标行 ∥ 核 prompt 投影行（dim 上下文行族）∥ 已填
 *  非密字段行（掩码值恒不示）∥ 当前字段问句行（bold）∥ 输入提示行（同 `teamAskLines` 行形）。
 *  字段标签 = `ssh.field.<name>` 端投影（缺键回退原名——同批三端同式）。 */
export function secretPromptFaceLines(face) {
  const lines = []
  const target = secretTargetText(face)
  if (target !== "") lines.push({ text: ` ${target}`, color: C.dim })
  const prompt = secretKeyText(face?.keys?.prompt, secretVars(face))
  if (prompt !== "") lines.push({ text: ` ${prompt}`, color: C.dim })
  for (const f of face.fields ?? []) {
    if (f?.masked === true) continue
    const v = face.values?.[f.name]
    if (typeof v === "string" && v !== "") lines.push({ text: ` ${fieldWord(f.name)}: ${v}`, color: C.dim })
  }
  const field = secretCurrentField(face)
  if (field) {
    // 勾选字段（`save`）：`(y/N)` 尾缀——Enter = 不勾（缺省不勾，§6.22 ⑪）
    const suffix = field.checkbox === true ? " (y/N)" : ""
    lines.push({ text: ` \u276f ${fieldWord(field.name)}${suffix}:`, color: ansi.bold + C.text })
  }
  lines.push({ text: " (type in input box below)", color: C.dim })
  return lines
}

/** 步入场：当前字段行 + 输入框预填（**仅非掩码非勾选字段**——密码零预填（设计 ⑨）；掩码步恒空；
 *  勾选步 = y/n 输入，Enter = 不勾）。 */
function enterSecretField(ctx, face, index) {
  const { state } = ctx
  const field = face.fields[index]
  face.index = index
  face.lines = secretPromptFaceLines(face)
  const prefill = field?.masked === true || field?.checkbox === true ? "" : String(field?.prefill ?? "")
  state.input = [...prefill]
  state.cursor = state.input.length
  ctx.render()
}

/** Enter（键面转口）：当前字段决议。必填且空 ⇒ 驻留（零推进零提交——零新文案）；取值口径同
 *  `/team login`：掩码字段原样（密码零裁剪）∥ 非掩码字段 trim（账号 / 地址同族）∥ **勾选字段 = 布尔**
 *  （`y` / `yes` ⇒ true；空 Enter ∥ 其他 ⇒ false——缺省不勾，§6.22 ⑪）。 */
export function secretPromptSubmit(ctx) {
  const { state } = ctx
  const face = state.secretPrompt
  const field = secretCurrentField(face)
  const resolve = face?._resolveField
  if (field == null || typeof resolve !== "function") return
  const raw = state.input.join("")
  const value = field.checkbox === true ? /^(y|yes|true)$/i.test(raw.trim()) : field.masked === true ? raw : raw.trim()
  if (field.required === true && value === "") return
  face._resolveField = null
  resolve(value)
}

/** Esc（键面转口）：整窗取消——面退场 + 输入框归还（清空 + 光标归零）+ 字段决议交哨兵；零行
 *  （同 `/team login` 口径——零新文案；工具面自出可读句）。 */
export function secretPromptCancel(ctx) {
  const { state } = ctx
  const face = state.secretPrompt
  if (face == null) return
  state.secretPrompt = null
  state.input = []
  state.cursor = 0
  const resolve = face._resolveField
  face._resolveField = null
  if (typeof resolve === "function") resolve(CANCELLED)
  ctx.render()
}

/** 开窗（`onSecretInput` 的 CLI 面实现——`interaction.mjs` `askSecretInput` 直取）：
 *  `Promise<{<name>:<值>} | null>`——提交 = 值映射（字段序）∥ 取消 = null。 */
export async function runSecretPrompt(ctx, payload) {
  const fields = normalizeSecretFields(payload)
  if (fields.length === 0) throw new Error(SECRET_MALFORMED_TEXT)
  const { state } = ctx
  const face = {
    kind: payload?.kind ?? null,
    sessionId: payload?.sessionId ?? null,
    host: payload?.host ?? null,
    user: payload?.user ?? null,
    port: payload?.port ?? null,
    keys: payload?.keys ?? null,
    fields,
    index: 0,
    values: {}, // 非密字段已填值（上下文行回显——掩码值恒不入）
    lines: [],
    scroll: 0, // overlay 契约位（layout/renderPicker 读）
  }
  const out = {}
  for (let i = 0; i < fields.length; i++) {
    state.secretPrompt = face
    const value = await new Promise((resolve) => {
      face._resolveField = resolve
      enterSecretField(ctx, face, i)
    })
    if (value === CANCELLED || state.secretPrompt !== face) return null
    out[fields[i].name] = value
    if (fields[i].masked !== true) face.values[fields[i].name] = value
    // 提交值已取走 ⇒ 输入框即清（掩码步零留存；非掩码步下一步自预填）
    state.input = []
    state.cursor = 0
  }
  state.secretPrompt = null
  ctx.render()
  return out
}

/** 载荷字段归一（成形外条目丢弃——空集 ⇒ `runSecretPrompt` 拒绝）。 */
function normalizeSecretFields(payload) {
  const raw = Array.isArray(payload?.fields) ? payload.fields : []
  return raw
    .filter((f) => f != null && typeof f.name === "string" && f.name !== "")
    .map((f) => ({
      name: f.name,
      masked: f.masked === true,
      required: f.required === true,
      checkbox: f.checkbox === true,
      prefill: typeof f.prefill === "string" ? f.prefill : "",
    }))
}

/** i18n 键投影（词面单源 = 核字典——`t(key, vars)` 插值；缺键回键名本身、不抛；非字符串键 ⇒ 零文本）。 */
function secretKeyText(key, vars) {
  return typeof key === "string" && key !== "" ? t(key, vars) : ""
}

/** 插值面（沿同批三端同式：载荷三值 `host` / `user` / `port`；缺值不传——不让 `${port}` 落成 `"null"`）。 */
function secretVars(face) {
  const vars = {}
  for (const name of ["host", "user", "port"]) {
    const v = face?.[name]
    if (v !== null && v !== undefined && v !== "") vars[name] = v
  }
  return vars
}

/** 字段标签词（端投影——与 VSC `secret-input.js` / 桌面 `secret-prompt.mjs` `fieldWord` 同式）：
 *  `ssh.field.<name>` 命中 ⇒ 该词；缺键 ⇒ 字段原名（不空标）。 */
function fieldWord(name) {
  const raw = String(name ?? "")
  const key = `ssh.field.${raw}`
  const word = t(key)
  return word === key ? raw : word
}
