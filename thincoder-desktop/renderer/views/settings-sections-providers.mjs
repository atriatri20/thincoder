/**
 * settings-sections-providers.mjs — 设置面渠道段体 + 渠道行族（D37 · 设置面样式收正批 · 2026-10-02 · 台账 #812；
 * **先拆后改**：渠道族自 `renderer/views/settings-sections.mjs` 命名面出档 —— 本档 = 单一 owner，
 * 原档 re-export ⇒ 分派面零改）。
 *
 * 行形（单源 = `docs/desktop/design/PROJECT.md` §2 KD-66 ∥ `docs/desktop/design/UI.md` §1
 * 「本批注（设置面样式收正 · D37 · 2026-10-02）」项 2；值源 = VSC 实读
 * `thincoder-vscode/webview/settings-providers.js:178-193`）：
 *  ① **两行卡**（`[data-provider]` 行根纵排）：**主行**（`.settings-row-main`）= 名 + 钥面（masked ∥ 未设词）+
 *     当前标 + 动作簇（修改 ∥ ✕ 删钥 ∥ 校验 ∥ 移除名 —— 四件全保留、序恒定 = 现盘序）；**副行**（`.settings-row-sub`）
 *     = `模型 · baseURL`（串形照 VSC —— 缺段不落空分隔符）+ 不可用标 + 行尾代理开关；**第三行**（条件）=
 *     不可用原因句（`!hostBusy` 时 —— S3 分档保持；锚 `[data-unavailable-reason]`）。
 *  ② **编辑态**（钥行编辑中，`deps.edit` = 本行名）= 主行换形：名 + 钥面 + 输入（伸缩）+ 存 ∥ 消；
 *     代理 ∥ 移除 ∥ 校验暂撤（取消即回 —— 沿既有 `providerRowNode` 换形；输入种子 = `deps.keyDraft`）。
 * ③ **校验反馈就地化（轮六 · 2026-10-02 · 轻通道 · 台账 #819）**：`verify` 结果携行名（`name`）——匹配行 ⇒ **本行呈现**
 *    （校验按钮态短形（`okShort` ∥ `failShort`）+ 结果明细行 = `verifyNode` 形）；段末仅作**无行渲出结果**回退（名不在列表 ∥ kind 表外——向导径等）。
 * 段内按钮（锚名 ∕ 可及名 ∕ 词面三处同源；缺 handler ⇒ `wire` 落 `disabled` —— 诚实非死控）。
 * 纪律：零 DOM（描述符树）；文案一律经 `t()`；零 `node:` ∕ 零裸包 ∕ 零 `store.mjs` import；零新词键（除轮六 2 键：`okShort` ∥ `failShort`——同域内增）。
 */
import { t } from "../i18n.mjs"
import { wire } from "./chat-tool.mjs"
// 常见档位下拉（K 单位 —— 单一来源同「编辑模型配置」弹窗；见 `renderer/context-tiers.mjs` 档头）。
import { CONTEXT_K_TIERS, tierSelectNode } from "../context-tiers.mjs"

/** 列表切片：缺 / 非数组 ⇒ 空表（零节点 —— 禁假数据）。 */
const listOf = (value) => (Array.isArray(value) ? value : [])

/** 键面回显：已配 ⇒ 遮罩值（主侧出口直传，**明文零下发**）；未配 ⇒ 无密钥词。 */
function keyFaceNode(row) {
  const word = row.hasKey === true ? String(row.maskedKey ?? "") : t("settings.providers.noKey")
  return { tag: "span", props: { class: "settings-key", "data-key": row.hasKey === true ? "masked" : "none" }, children: [word] }
}

/** 校验结果节点（两态词键；核错误串经 `deps.reasonWord` —— 表内码出词、表外原样）。 */
function verifyNode(verify, deps) {
  if (verify === null) return null
  const word = verify.kind === "ok"
    ? t("settings.providers.verify.ok", { count: Number.isFinite(verify.count) ? verify.count : 0 })
    : t("settings.providers.verify.fail", { reason: deps.reasonWord(verify.reason) ?? "" })
  return { tag: "div", props: { class: "settings-verify", "data-verify": verify.kind === "ok" ? "ok" : "fail" }, children: [word] }
}

/** 段级回退（轮六）：**无行渲出结果**（名不在列表 ∥ kind 表外；如向导径结果）⇒ 段末渲；有行渲出 ⇒ `null`（本行已渲）。 */
function fallbackVerifyNode(section, deps) {
  const verify = section.verify ?? null
  if (verify === null) return null
  return section.rows.some((row) => row.name === verify.name && (verify.kind === "ok" || verify.kind === "fail")) ? null : verifyNode(verify, deps)
}

/** 段内按钮（锚名 ∕ 可及名 ∕ 词面三处同源；缺 handler ⇒ `wire` 落 `disabled` —— 诚实非死控）。 */
function rowButton(action, name, word, aria, handler) {
  return {
    tag: "button",
    props: wire({ class: "settings-row-action", type: "button", "data-action": action, "data-name": name, "aria-label": aria }, handler),
    children: [word],
  }
}

/** 副行串（D37 项 2）：`模型 · baseURL` 串形（照 VSC `${model} · ${baseURL}` —— 缺段不落空分隔符）；
 *  两段皆空 ⇒ `null`（零节点 —— 禁假造）。 */
function subLineWord(row) {
  const parts = [row?.model, row?.baseURL].filter((value) => typeof value === "string" && value !== "")
  return parts.length > 0 ? parts.join(" · ") : null
}

/** 副行节点：串（省略中段）+ 不可用标 + 行尾代理开关（编辑态由调用面抽去代理件；三段皆空 ⇒ 零节点）。
 *  **S3 分档（#673 · 2026-09-29 —— 消）**：`failure === "hostBusy"` ⇒ 状态词「宿主繁忙」（≠ 渠道故障词）+
 *  **抑制渠道故障句**（载体为宿主忙，不得渲渠道故障文案 —— 载具 = `data-failure` 机检锚 + 词键分档；
 *  判据同 VSC `webview/settings-providers.js:189 ∕ :192`；单源 = `docs/vsc/design/SETTINGS.md` §2.12 展示面分档）。 */
function subRowNode(row, handlers, editing, ctxEditing, deps) {
  const unavailable = row?.available === false
  const hostBusy = unavailable && row?.failure === "hostBusy"
  const line = subLineWord(row)
  const failure = typeof row?.failure === "string" && row.failure !== "" ? row.failure : undefined
  const children = [
    line === null ? null : { tag: "span", props: { class: "settings-row-value" }, children: [line] },
    unavailable
      ? { tag: "span", props: { class: "settings-mark", "data-available": "false", "data-failure": failure }, children: [t(hostBusy ? "settings.reason.hostBusy" : "settings.reason.unavailable")] }
      : null,
    ...(editing ? [] : contextControls(row, handlers, ctxEditing, deps)),
    ...(editing || ctxEditing ? [] : [proxyNode(row, handlers)]),
  ]
  if (children.every((child) => child === null)) return null
  return { tag: "div", props: { class: "settings-row-sub" }, children }
}

/** 第三行（条件）= 不可用原因句：`!hostBusy` 且原因非空才显（禁假造；空 ⇒ 零节点，两行卡收束）。 */
function reasonNode(row) {
  const unavailable = row?.available === false
  const hostBusy = unavailable && row?.failure === "hostBusy"
  const reason = typeof row?.unavailableReason === "string" && row.unavailableReason !== "" ? row.unavailableReason : ""
  if (!unavailable || hostBusy || reason === "") return null
  return { tag: "span", props: { class: "settings-row-value", "data-unavailable-reason": "" }, children: [reason] }
}

/** 渠级代理复选（S5）：`change-to-save`（值 ⇒ `onSetProxy(name, checked)`）；缺 handler ⇒ `disabled`（沿段内先例）。 */
function proxyNode(row, handlers) {
  const props = { type: "checkbox", class: "settings-field", "data-provider-proxy": "", checked: row.proxy === true ? true : undefined }
  if (typeof handlers?.onSetProxy === "function") props.onChange = (event) => handlers.onSetProxy(row.name, event?.target?.checked === true)
  else props.disabled = true
  return {
    tag: "label",
    props: { class: "settings-field-label", title: t("settings.proxyRowTitle") },
    children: [{ tag: "input", props }, t("settings.proxyRow")],
  }
}

/** 钥控件两态（S1）：静止 = 设 ∕ 改钥（已配 ⇒ 兼出删钥；两删除门经出口前置确认）；编辑中 = 密码输入 + 存 ∕ 消。
 *  **#615②**：编辑态输入以 `deps.keyDraft`（`{ name, value }` —— 本行名对上才回填）为种子 —— 失败径重挂不丢键入。
 *  **#652**：编辑态输入携 `[data-draft]`（无 `id` ⇒ 标记取值作显式键 = 行名）＋作用域 `key:<名>`（写成功径失效声明自读件取值）。 */
function keyControls(row, handlers, editing, deps) {
  if (editing) {
    const draft = deps?.keyDraft ?? null
    const seed = draft !== null && draft.name === row.name && typeof draft.value === "string" ? draft.value : undefined
    const save = typeof handlers?.onProviderKeySave === "function" ? () => handlers.onProviderKeySave(row.name) : undefined
    const cancel = typeof handlers?.onProviderKeyCancel === "function" ? () => handlers.onProviderKeyCancel() : undefined
    return [
      { tag: "input", props: { class: "settings-field", type: "password", "data-provider-key-input": row.name, "data-draft": row.name,
        "data-draft-scope": `key:${row.name}`, placeholder: "sk-...", "aria-label": t("settings.providers.keyLabel"), value: seed } },
      rowButton("settings:providerKeySave", row.name, t("settings.save"), t("settings.save"), save),
      rowButton("settings:providerKeyCancel", row.name, t("settings.cancel"), t("settings.cancel"), cancel),
    ]
  }
  const word = t(row.hasKey === true ? "settings.changeKey" : "settings.addKey")
  const edit = typeof handlers?.onProviderKeyEdit === "function" ? () => handlers.onProviderKeyEdit(row.name) : undefined
  const controls = [rowButton("settings:providerKeyEdit", row.name, word, word, edit)]
  if (row.hasKey === true) {
    const del = typeof handlers?.onProviderKeyDelete === "function" ? () => handlers.onProviderKeyDelete(row.name) : undefined
    controls.push(rowButton("settings:providerKeyDelete", row.name, t("settings.keyDelete"), t("settings.deleteKey"), del))
  }
  return controls
}

/** 渠级生效窗口读数（**K 单位** —— 渠级字段本即 K，显示与输入同单位；`Math.round(tokens/1024)` 与核
 *  `providerSpec` 的 ×1024 互逆 ⇒ 有覆写时显示值与用户键入值逐字相同）。`tokens` 缺 ∕ 非正 ⇒ `—`。 */
function ctxKWord(tokens) {
  return Number.isFinite(tokens) && tokens > 0 ? `${Math.round(tokens / 1024)}K` : "—"
}

/** 渠级生效窗口的**裸 K 数**（编辑态占位用 —— 输入框内不带 `K` 后缀，免用户照抄出非法值）。 */
function ctxKNumber(tokens) {
  return Number.isFinite(tokens) && tokens > 0 ? String(Math.round(tokens / 1024)) : null
}

/** 渠级上下文窗口控件（2026-10-10 · 模型参数能力批 —— CLI `setContextFlow` 桌面对位）：静止 = 紧凑按钮
 *  （`ctx 128K` = **生效值**；有渠道级覆写 ⇒ `data-override` 锚，CSS 染主题色）；编辑态 = K 输入 + 存 ∕ 消
 *  （输入空 = 清除覆写 ⇒ 回模型规格值）。输入携 `[data-draft]`（作用域 `ctx:<名>`）—— 沿钥行编辑态同款
 *  （#604 草稿保真 ∕ #615② 失败种子 ∕ #652 写成功失效）。
 *  初值两径：有覆写 ⇒ 预填该 K 值（改而不重敲）；无覆写 ⇒ **空值 + 占位 = 生效 K 数**（看得到当前吃什么值，
 *  且不因预填而静默造出一条覆写 —— 规格值非 K 整数倍，预填会失真）。
 *  缺 handler ⇒ `wire` 落 `disabled`（诚实非死控 —— 沿全档通则）。 */
function contextControls(row, handlers, editing, deps) {
  if (editing) {
    const draft = deps?.ctxDraft ?? null
    const seeded = draft !== null && draft.name === row.name && typeof draft.value === "string" ? draft.value : undefined
    const overrideK = Number.isInteger(row?.context) && row.context > 0 ? String(row.context) : undefined
    const save = typeof handlers?.onProviderCtxSave === "function" ? () => handlers.onProviderCtxSave(row.name) : undefined
    const cancel = typeof handlers?.onProviderCtxCancel === "function" ? () => handlers.onProviderCtxCancel() : undefined
    return [
      { tag: "input", props: {
        class: "settings-field settings-ctx-input", type: "text", inputmode: "numeric",
        "data-provider-ctx-input": row.name, "data-draft": row.name, "data-draft-scope": `ctx:${row.name}`,
        placeholder: ctxKNumber(row?.contextTokens) ?? t("settings.providers.contextPlaceholder"),
        "aria-label": t("settings.providers.contextLabel"), value: seeded ?? overrideK,
      } },
      // 档位下拉（快填菜单 —— 恒为上方输入框的紧邻后继兄弟，出口族按此邻接解析；见 `renderer/context-tiers.mjs`）。
      tierSelectNode({
        tiers: CONTEXT_K_TIERS,
        className: "settings-field settings-ctx-tier",
        label: t("settings.providers.contextLabel"),
        placeholder: t("settings.tiers.short"),
        props: { onChange: handlers?.onPickTier },
      }),
      rowButton("settings:providerCtxSave", row.name, t("settings.save"), t("settings.save"), save),
      rowButton("settings:providerCtxCancel", row.name, t("settings.cancel"), t("settings.cancel"), cancel),
    ]
  }
  const edit = typeof handlers?.onProviderCtxEdit === "function" ? () => handlers.onProviderCtxEdit(row.name) : undefined
  return [{
    tag: "button",
    props: wire({
      class: "settings-row-action settings-ctx-btn",
      type: "button",
      "data-action": "settings:providerCtxEdit",
      "data-name": row.name,
      ...(Number.isInteger(row?.context) && row.context > 0 ? { "data-override": "" } : {}),
      "aria-label": t("settings.providers.contextLabel"),
      title: t("settings.providers.contextLabel"),
    }, edit),
    children: [`${t("settings.providers.contextShort")} ${ctxKWord(row?.contextTokens)}`],
  }]
}

/** 渠道行（D37 两行卡）：主行 + 副行 + 条件第三行；编辑态 = 主行换形 [名 + 钥面 + 输入 + 存 ∥ 消]
 *  （代理 ∥ 移除 ∥ 校验暂撤 —— 取消即回；见档头 ②）。**2026-10-10**：副行尾增渠级上下文窗口控件
 *  （`ctxEdit` = 本行名 ⇒ 换输入形；钥编辑态中同撤 —— 一行一编辑态，防两输入并存）。 */
function providerRowNode(row, handlers, deps, verify = null) {
  const editing = typeof deps?.edit === "string" && deps.edit !== "" && deps.edit === row.name
  const ctxEditing = typeof deps?.ctxEdit === "string" && deps.ctxEdit !== "" && deps.ctxEdit === row.name
  /** 本行校验态（轮六）：结果行名对上 ⇒ `"ok"` ∥ `"fail"`；否则 `null`（按钮原词）。 */
  const verifyState = verify !== null && verify.name === row.name && (verify.kind === "ok" || verify.kind === "fail") ? verify.kind : null
  const onRemove = typeof handlers?.onRemoveProvider === "function" ? () => handlers.onRemoveProvider(row.name) : undefined
  const remove = rowButton(
    "settings:removeProvider", row.name, t("settings.providers.remove", { name: row.name }),
    t("settings.providers.remove", { name: row.name }), onRemove,
  )
  return {
    tag: "div",
    props: {
      class: "settings-row", "data-provider": row.name,
      "data-active": row.active === true ? "" : undefined, "data-edit": editing ? "" : undefined,
      "data-ctx-edit": ctxEditing ? "" : undefined,
    },
    children: [
      {
        tag: "div",
        props: { class: "settings-row-main" },
        children: [
          { tag: "span", props: { class: "settings-row-name" }, children: [row.name] },
          keyFaceNode(row),
          row.active === true ? { tag: "span", props: { class: "settings-mark", "data-active": "" }, children: [t("settings.providers.active")] } : null,
          ...keyControls(row, handlers, editing, deps),
          ...(editing ? [] : [deps.verifyControl(row.name, handlers, verifyState), remove]),
        ],
      },
      subRowNode(row, handlers, editing, ctxEditing, deps),
      reasonNode(row),
      verifyState === null || editing ? null : verifyNode(verify, deps),
    ],
  }
}

/** 拉取模型状态面（S2）：三态词 —— 探期 ∕ 探通（计数 = 候选数）∥ 探不通（`reason` 经 `deps.reasonWord`
 *  直传，缺 ⇒ `settings.connFailed`）；无探 ⇒ `null`（零节点 —— 禁假造）。 */
function probeFace(probe, deps) {
  const state = probe !== null && typeof probe?.state === "string" ? probe.state : null
  if (state === "running") return { state, word: t("settings.connecting") }
  if (state === "ok") return { state, word: t("settings.connOk", { count: listOf(probe?.models).length }) }
  if (state === "fail") return { state, word: deps.reasonWord(probe.reason) ?? t("settings.reason.probeFailed") }
  return null
}

/** 渠道段体：渠道行（校验结果**就地**在本行——轮六；无行渲出结果 ⇒ 段末回退）+ 两形表单（`loading` 期零表单）。**S2**：自定形随表单给
 *  `probe`（已出词状态面）∕ `draft`（暂存值回填）∕ `modelCandidates`（探通才有候选 —— 零假造）。 */
export function providersBody(section, handlers, deps) {
  const loading = section.state === "loading"
  const candidates = section?.probe?.state === "ok" ? listOf(section.probe.models) : []
  const forms = loading ? [] : [
    deps.channelForm({ shape: "preset", presets: section.presets, formats: deps.formats }, handlers),
    deps.channelForm({
      shape: "custom", presets: [], formats: deps.formats,
      probe: probeFace(section?.probe ?? null, deps), draft: section?.draft ?? null, modelCandidates: candidates,
    }, handlers),
  ]
  return [
    ...section.rows.map((row) => providerRowNode(row, handlers, deps, section.verify ?? null)),
    fallbackVerifyNode(section, deps),
    ...forms,
  ]
}
