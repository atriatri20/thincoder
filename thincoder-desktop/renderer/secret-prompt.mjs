/**
 * secret-prompt.mjs — 凭据弹窗面（SSH 会话批 · `docs/core/design/TOOLS.md` §6.22 ⑧ 桌面落点 ——
 * `onSecretInput` 缝的渲染端；同族参照 = `renderer/questions.mjs`〔归约切片面〕∥ `renderer/settings-modal.mjs`
 * 〔单例弹层宿主〕∥ `renderer/mount-cards.mjs` `submitAnswer`〔出站 + 非乐观摘除〕）。六节：
 *   ① **归约体（纯）**：`onSecretRequest` / `clearSecret` —— `ev:secret` 待答项写 `secretPrompt[ev.key]`
 *      （首写自种 · 同键就地替换 · 零键门 —— 切回即见）+ `approval` 位标（与 `onQuestion` 同形）；出场两调用面
 *      = 出站回执 `ok` 真 ∥ `stopped` 终局（`renderer/events.mjs` 回合尾同点）。
 *   ② **弹窗树（纯描述符）**：`secretPromptTree(item, handlers)` —— 零 DOM（DOM 构造唯一 = `renderer/dom.mjs`
 *      `build`）；词面三路 = 载荷 `keys.title` / `keys.prompt`（**核字典 / 端字典键名经 `t()` 端投影** ——
 *      渲染期以载荷 `host` / `user` / `port` 作 `${…}` 插值；缺键 ⇒ 键名自身）⊕ 字段标签 `ssh.field.<name>`
 *      （缺键 ⇒ 字段原名 —— **不空标**）⊕ 卡面三键（`secret.label` 可及名 ∥ `secret.submit` ∥ `secret.cancel`
 *      —— 值逐字同 VSC locales 同名键）；字段面逐项 = `{ name, masked, required, prefill }`（`masked` ⇒
 *      `type=password`；`prefill` ⇒ 初值 —— **非密预填**，密码零预填）。**两语对齐**：字段标签 / 卡面三键
 *      与 VSC 端 `webview/secret-input.js` 同键同形（词面值源同一批）。
 *   ③ **值面读取（纯 · 节点注入）**：`readSecretValues(card)` —— 入参 = 类 DOM 节点（`querySelectorAll` 面）；
 *      返回 `{ values, missing }`（`missing` = 必填空字段名表）。**值只在返回路**：本件零状态写 ∥ 零日志。
 *   ④ **弹窗宿主（DOM）**：`renderSecretPrompt` ∥ `closeSecretPrompt` ∥ `secretPromptNode` —— 单例；壳面复用
 *      既有族（`.auto-backdrop` ∥ `.auto-confirm` ∥ `.settings-field*` —— **零新 CSS**）；同 `promptId` ⇒ 零 DOM 写
 *      （草稿 / 焦点保全）；「提交」= 读值 ⇒ 必填门（缺 ⇒ 标 `data-invalid` + 置焦，零出站）。
 *   ⑤ **出站**：`respondSecret`（窄桥 `secret:respond`）∥ `submitSecret`（回执 `ok` 真 ⇒ 摘切片 —— **零乐观摘除**，
 *      失败 ⇒ 零写、弹窗留场可重试；对照项 = VSC 端 `secret-input.js` 提交即摘卡 —— 本端沿**本端提问族**
 *      同律（`renderer/mount-cards.mjs` `submitAnswer` 零乐观摘除），端差已登记）。
 *   ⑥ **装配**：`attachSecretPrompt(host, deps)` —— 自持重绘订阅（触发切片 = `activeSession` / `secretPrompt` / `locale`），
 *      活动会话有待答项 ⇒ 开 ∥ 换卡，无 ⇒ 退场（调用面 = `renderer/app.mjs` 一行）。
 * **值面纪律（NS4 端面落点）**：字段值只经「DOM ⇒ 出站载荷 ⇒ 待决门结算」返回路流动 —— 不入本件切片
 * （切片只载描述面 `fields` / `keys`）∥ 不入 store ∥ 不入任何 `console.*`（错误面只记 reason 串 / error.message）。
 * 纪律：零 `node:` ∥ 零裸包 ∥ 零 `/rc/` 静态导入（平 node 可装载 —— DOM 只在 §④ 函数体内取用）。
 */
import { badgeStamps, hasPendingFor } from "./badges.mjs"
import { build } from "./dom.mjs"
import { t } from "./i18n.mjs"
import { store as defaultStore } from "./store.mjs"

// ─── ① 归约体（纯 —— 值面零载：切片只存描述面）────────────────────────────────

/** 待答项键白名单（零新键 —— 载荷七键逐项收；表外键不入切片；值恒不在载荷内）。 */
const SECRET_SPEC_KEYS = ["kind", "sessionId", "host", "user", "port", "fields", "keys"]

/** `ev:secret`——待答项写 `secretPrompt[ev.key]`（**首写自种** · 同键就地替换零叠条 · 不入 `pool` ——
 *  单源 = `renderer/questions.mjs` `onQuestion` 同形）；位标 `tabBadges[key] ⊇ {approval}`（与 `onQuestion`
 *  同形 —— 置位面 = 归约面）；零键门：非活动会话的项与位标同样在场（切回即见弹窗）。出场两调用面 =
 *  出站回执 `ok` 真（本档 `submitSecret`）∥ `stopped` 终局（`renderer/events.mjs`）。 */
export function onSecretRequest(state, ev) {
  const item = { promptId: ev.promptId }
  for (const field of SECRET_SPEC_KEYS) if (ev[field] !== undefined) item[field] = ev[field]
  const secretPrompt = { ...(state.secretPrompt ?? {}), [ev.key]: item }
  const stamps = badgeStamps(state.tabBadges ?? {}, ev.key, "approval", true)
  return stamps.changed ? { ...state, secretPrompt, tabBadges: stamps.badges } : { ...state, secretPrompt }
}

/** 凭据待答出场 ⇒ 摘本键项 + 清本键 `approval` 位（零乐观写 —— 两调用面 = 出站回执 `ok` 真 ∥ `stopped` 终局；
 *  **清码判据 = 全族皆清**（#780 共享判据 —— `renderer/badges.mjs` `hasPendingFor` 三族）；无本键项 ⇒ 原引用
 *  （幂等）。 */
export function clearSecret(state, key) {
  const secretPrompt = state.secretPrompt
  if (secretPrompt === undefined || !Object.hasOwn(secretPrompt, key)) return state
  const remaining = { ...secretPrompt }
  delete remaining[key]
  const next = { ...state, secretPrompt: remaining }
  if (hasPendingFor(next, key)) return next // 同键尚有他族项 ⇒ 位标留
  const cleared = badgeStamps(next.tabBadges ?? {}, key, "approval", false)
  return cleared.changed
    ? { ...next, tabBadges: cleared.badges }
    : next
}

// ─── ② 弹窗树（纯描述符 —— 零 DOM / 零 store）────────────────────────────────

/** 词面投影（键名 → 词）：载荷 `keys.title` / `keys.prompt` = 核字典 / 端字典键名；`vars` = 载荷三值
 *  （`host` / `user` / `port` —— `${…}` 插值，沿 VSC 端 `secret-input.js` 同式）；缺键 ⇒ `t` 兜底返键名自身。 */
function wordOf(value, vars) {
  return t(String(value ?? ""), vars)
}

/** 字段标签词（端投影 —— 与 VSC 端 `secret-input.js` `fieldWord` 同式）：`ssh.field.<name>` 命中 ⇒ 该词；
 *  缺键 ⇒ 字段原名（不空标）。 */
function fieldWord(name) {
  const raw = String(name ?? "")
  const word = t(`ssh.field.${raw}`)
  return word === `ssh.field.${raw}` ? raw : word
}

/** 字段行（`label` + 输入 —— 复用设置面字段族样式）；`masked` ⇒ 密码输入；`checkbox` ⇒ 原生复选框
 *  （值 = 布尔；缺省不勾——§6.22 ⑪）；`prefill` ⇒ 初值（**仅非密非勾选字段** —— 掩码字段忽略载荷预填 =
 *  NS4 纵深防线：切片 ∥ DOM 初值两面皆零值）。 */
function fieldRow(field) {
  const name = String(field?.name ?? "")
  const masked = field?.masked === true
  const checkbox = field?.checkbox === true
  const required = field?.required === true && !checkbox
  const prefill = masked || checkbox || field?.prefill === null || field?.prefill === undefined ? null : String(field.prefill)
  const label = fieldWord(name)
  return {
    tag: "label",
    props: { class: "settings-field-row", "data-secret-row": name },
    children: [
      { tag: "span", props: { class: "settings-field-label" }, children: [label] },
      {
        tag: "input",
        props: {
          class: "settings-field", type: checkbox ? "checkbox" : masked ? "password" : "text",
          name, "data-secret-input": name, "aria-label": label,
          autocomplete: "off", spellcheck: "false",
          ...(required ? { required: true } : {}),
          ...(checkbox ? (field?.prefill === true ? { checked: true } : {}) : {}),
          ...(prefill === null ? {} : { value: prefill }),
        },
        children: [],
      },
    ],
  }
}

/** 弹窗描述符（纯 —— 单元测试档直测面）：`{ backdrop, card }`；`handlers` = `{ onSubmit(), onCancel() }`
 *  （值面读取在宿主 §④ —— 描述符不持节点）。Escape = 取消（`stopPropagation` ⇒ 不连带触上层键面）。 */
export function secretPromptTree(item, handlers = {}) {
  const vars = { host: item?.host ?? "", user: item?.user ?? "", port: item?.port ?? "" }
  const title = wordOf(item?.keys?.title, vars)
  const prompt = wordOf(item?.keys?.prompt, vars)
  const fields = Array.isArray(item?.fields) ? item.fields : []
  return {
    backdrop: { tag: "div", props: { class: "auto-backdrop" }, children: [] },
    card: {
      tag: "form",
      props: {
        class: "auto-confirm secret-prompt", role: "dialog", "aria-modal": "true", "aria-label": t("secret.label"),
        "data-prompt-id": String(item?.promptId ?? ""),
        onSubmit: (event) => { event?.preventDefault?.(); handlers?.onSubmit?.() },
        onKeydown: (event) => {
          // IME 组字门（同族先例 = 核卡作答控件）：组合期按键不归本框（Escape 亦不触取消）
          if (event?.isComposing === true || event?.keyCode === 229) return
          if (event?.key !== "Escape") return
          event.stopPropagation?.()
          handlers?.onCancel?.()
        },
      },
      children: [
        { tag: "div", props: { class: "auto-confirm-text" }, children: [title] },
        { tag: "div", props: { class: "auto-confirm-text" }, children: [prompt] },
        ...fields.map(fieldRow),
        {
          tag: "div",
          props: { class: "auto-confirm-actions" },
          children: [
            { tag: "button", props: { type: "submit", class: "secret-submit auto-confirm-no" }, children: [t("secret.submit")] },
            {
              tag: "button",
              props: { type: "button", class: "secret-cancel auto-confirm-no", onClick: () => handlers?.onCancel?.() },
              children: [t("secret.cancel")],
            },
          ],
        },
      ],
    },
  }
}

// ─── ③ 值面读取（纯 —— 类 DOM 节点注入；值只在返回路）────────────────────────

/** 读值（节点注入面）：返回 `{ values: { <name>: <串|布尔> }, missing: [<name>…] }` —— `missing` = 必填且空
 *  （原值空串 —— **不 trim**）字段名表；勾选字段 ⇒ 布尔（`checked === true`——§6.22 ⑧）；节点缺
 *  `querySelectorAll` 面 ⇒ `{ values: {}, missing: [] }`（零抛）。**零写**：不落切片 / 不记日志（值只作返回值交调用面）。 */
export function readSecretValues(card) {
  const inputs = typeof card?.querySelectorAll === "function" ? [...(card.querySelectorAll("[data-secret-input]") ?? [])] : []
  const values = {}
  const missing = []
  for (const input of inputs) {
    const name = input?.getAttribute?.("data-secret-input") ?? null
    if (name === null || name === "") continue
    const checkbox = (input?.type ?? input?.getAttribute?.("type")) === "checkbox"
    if (checkbox) { values[name] = input?.checked === true; continue }
    const value = typeof input.value === "string" ? input.value : String(input?.value ?? "")
    values[name] = value
    const required = typeof input.hasAttribute === "function" ? input.hasAttribute("required") : input.required === true
    if (required && value === "") missing.push(name) // 空判 = 原值空串（**不 trim** —— 口令空白可能有意，沿 VSC 同式）
  }
  return { values, missing }
}

// ─── ④ 弹窗宿主（DOM —— 单例；壳面复用既有族）────────────────────────────────

/** 现态弹窗（宿主 → `{ promptId, backdrop, card }`；单例 —— 同刻至多一框；零值面：本件不存字段值）。 */
let face = null

/** 现卡根（装配面在途判据 / 测试面读数）：无弹窗 ⇒ `null`。 */
export function secretPromptNode() {
  return face === null ? null : face.card
}

/** 退场（单例）：两件同清；无弹窗 ⇒ 零动作。 */
export function closeSecretPrompt() {
  if (face === null) return false
  face.card.remove()
  face.backdrop.remove()
  face = null
  return true
}

/** 必填缺项标注（就地）：**每次提交就地重评** —— 先清旧标、再标当前缺项 + 置焦首缺项（注：卡片退场即随清）。 */
function markMissing(card, missing) {
  const inputs = typeof card?.querySelectorAll === "function" ? [...(card.querySelectorAll("[data-secret-input]") ?? [])] : []
  let first = null
  for (const input of inputs) {
    const name = input?.getAttribute?.("data-secret-input") ?? null
    if (name === null || name === "") continue
    if (!missing.includes(name)) {
      input.removeAttribute?.("data-invalid") // 已补填 ⇒ 摘旧标（失败留场重试时不带陈标）
      continue
    }
    input.setAttribute?.("data-invalid", "required")
    if (first === null) first = input
  }
  first?.focus?.()
}

/** 挂 ∕ 刷（单例）：`item == null` ⇒ 退场清件；同 `promptId` 在场 ⇒ 零 DOM 写（草稿 / 焦点保全 —— 沿
 *  `mount-cards.mjs` 刷新幂等律）；异 `promptId` ⇒ 换卡。`handlers` = `{ onSubmit(values), onCancel() }`
 *  （值面读毕才交出 —— 必填缺项 ⇒ 零出站）。宿主缺 `append` 面 ⇒ 记错零动作（零静默 —— 沿确认件同形）。
 *  **语言切换面**：同 `promptId` 零写优先于词面重取 ⇒ 框在场时切语言，词面留下一�次开框（壳面遮罩挡
 *  其余交互 —— 切语言必先退框；重取词面换卡会丢已输入值，取舍取**草稿保全**—— 明记不静默）。
 *  **背板零点击面**：值面输入中误击不退框（退框 = 超时输入丢失；取消一键之遥）。 */
export function renderSecretPrompt(item, handlers = {}) {
  if (item === null || item === undefined) {
    closeSecretPrompt()
    return null
  }
  const promptId = String(item.promptId ?? "")
  if (face !== null && face.promptId === promptId) return face.card // 同项 ⇒ 零写（草稿 / 焦点保全）
  const body = typeof document !== "undefined" ? document.body ?? document.documentElement : null
  if (body === null || typeof body.append !== "function") {
    console.error("[renderer] secret prompt: overlay host unavailable")
    return null
  }
  /** 提交受理（描述符回调 —— 值面读取在此收口：读值 ⇒ 必填门 ⇒ 交出；**值零落本档**）。 */
  const onSubmit = () => {
    const card = face?.card ?? null
    if (card === null) return
    const { values, missing } = readSecretValues(card)
    if (missing.length > 0) {
      markMissing(card, missing)
      return
    }
    if (typeof handlers?.onSubmit === "function") handlers.onSubmit(values)
  }
  const tree = secretPromptTree(item, { onSubmit, onCancel: () => handlers?.onCancel?.() })
  const card = build(tree.card)
  if (face === null) {
    const backdrop = build(tree.backdrop)
    body.append(backdrop)
    body.append(card)
    face = { promptId, backdrop, card }
    // 初始焦点：首个输入（缺 ⇒ 提交键）—— 沿确认件 ∥ 设置弹窗先例（+50ms）
    setTimeout(() => {
      const first = card.querySelector?.("[data-secret-input]") ?? card.querySelector?.(".secret-submit")
      first?.focus?.()
    }, 50)
  } else {
    face.card.replaceWith(card) // 换卡（背板无内容 —— 留场复用）
    face.card = card
    face.promptId = promptId
  }
  return card
}

// ─── ⑤ 出站（窄桥 `secret:respond` —— 回执 `ok` 真才摘切片）──────────────────

/** 出站动作：窄桥 `secret:respond` `{ promptId, values }`（`values` = `{ <name>: <值> }` ∥ `null` 取消）；
 *  抛 / 拒绝 ⇒ `console.error`（**记 error.message —— 值不入日志**）+ 回执 `null`（调用面零分支）。 */
export function respondSecret(host, promptId, values) {
  try {
    return Promise.resolve(host.invoke("secret:respond", { promptId, values })).catch((error) => {
      console.error(`[renderer] secret:respond failed: ${error?.message ?? String(error)}`)
      return null
    })
  } catch (error) {
    console.error(`[renderer] secret:respond failed: ${error?.message ?? String(error)}`)
    return null
  }
}

/** 提交 / 取消同一路（值面唯一出口）：回执 `ok` 真 ⇒ 摘本键待答项（切片 + 位标同清）；**零乐观摘除** ——
 *  失败 / 拒收 / 抛 ⇒ 零切片写（弹窗恒在场可重试）。**会话键 = 入口现刻读**（回执在途可能已切会话 —— 按现刻
 *  `activeSession` 摘会误摘别会话待答项，沿 `renderer/mount-cards.mjs` `submitAnswer` 同律）；摘项前验
 *  `promptId` 仍是本项（已被事件面摘 ∥ 已被新项替换 ⇒ 零写，仅回执判定）。值只在出站载荷里出现一次，零落盘。 */
export async function submitSecret({ store = defaultStore, host } = {}, promptId, values) {
  const key = store.get()?.activeSession ?? null // 入口键（摘项目标 —— 非回执时点现读）
  const receipt = await respondSecret(host, promptId, values)
  if (receipt?.ok !== true) {
    if (receipt !== null) console.error(`[renderer] secret:respond failed: ${receipt?.reason ?? "unknown"}`)
    return false
  }
  const state = store.get()
  if (key === null || state?.secretPrompt?.[key]?.promptId !== promptId) return true
  store.set(clearSecret(state, key))
  return true
}

// ─── ⑥ 装配（自持重绘订阅 —— 调用面 = `renderer/app.mjs` 一行）────────────────

/** 重挂触发切片（薄 —— 本面活性只随三键）。 */
export const SECRET_PROMPT_KEYS = Object.freeze(["activeSession", "secretPrompt", "locale"])

/** 弹窗面装配：订阅现态 ⇒ 活动会话有待答项 ⇒ 开 ∥ 同项零写，无 ⇒ 退场（非活动会话的项留切片 —— 切回即见，
 *  与提问卡零键门同判）。返回 `{ paint, detach }`（`detach` = 退订句柄 —— 调用面可接，缺省零动作）。 */
export function attachSecretPrompt(host, deps = {}) {
  const store = deps.store ?? defaultStore
  const paint = (state = store.get()) => {
    const key = state?.activeSession ?? null
    const item = key === null ? undefined : state?.secretPrompt?.[key]
    if (item === undefined) {
      closeSecretPrompt()
      return null
    }
    return renderSecretPrompt(item, {
      onSubmit: (values) => { void submitSecret({ store, host }, item.promptId, values) },
      onCancel: () => { void submitSecret({ store, host }, item.promptId, null) },
    })
  }
  const detach = typeof store?.subscribe === "function"
    ? store.subscribe((state, changedKeys) => {
      const keys = Array.isArray(changedKeys) ? changedKeys : SECRET_PROMPT_KEYS
      if (!keys.some((changed) => SECRET_PROMPT_KEYS.includes(changed))) return
      paint(state)
    })
    : () => {}
  paint()
  return { paint, detach }
}
