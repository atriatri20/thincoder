/**
 * settings-sections-modelparams.mjs — 「编辑模型配置」弹窗树（2026-10-10 · 模型参数能力批）。
 *
 * 背景：核 `MODEL_SPECS` 是源码硬表，用户改不了；反代 ∕ 聚合网关还会带来表内没有的模型名
 * （`cn:auto`、`global:gpt-5.4`、`qdcn/qfmodel`…）⇒ 一律落 `DEFAULT_SPEC`（128K ∕ 32K ∕ 无思考）。
 * 本弹窗给用户**不改源码**的覆写入口（写 `config.json` 的 `modelOverrides` 键）。
 *
 * 面形（参照 ZCode `ProviderModelMetadataDialog.tsx`「编辑模型配置」）：标题 + ✕；模型 ID 读数 + 来源徽标；
 * 上下文窗口 ∕ 最大输出 Token 两基本字段；「高级配置」折叠区（思考 ∕ 推理档位 ∕ 默认档）；页脚
 * 「重置为默认」+ 取消 ∕ 保存。入口 = **模型段每行的铅笔钮**（非独立段 —— 用户裁定 2026-10-10：
 * 「不用独立一页，在采用后面加一个编辑按钮，弹窗编辑」）。
 *
 * 宿主 = `renderer/settings-modal.mjs`（单例弹层，`renderSettingsModal({ backdrop, card })`）——
 * 与设置组弹窗**同宿主不同源**：装配面按 `settings.modelParams.open` 二选一渲染（互斥）。
 * 数据面全由装配层供给（本档零读零写）：`section = { open, id, spec }`——`spec` 来自 `model:spec`。
 * 纪律：零 DOM（描述符树）；文案一律经 `t()`；字形住 CSS `content`；零 `node:` / 零裸包 / 零 `store.mjs`。
 */
import { t } from "../i18n.mjs"
import { wire } from "./chat-tool.mjs"
// 常见档位下拉（单一来源 —— 弹窗 ∕ 渠道表单 ∕ 渠行同表；`select` 快填 + `input` 值持有，见其档头）。
import { CONTEXT_TOKEN_TIERS, MAX_OUTPUT_TIERS, tierSelectNode } from "../context-tiers.mjs"

/** 列表切片：缺 / 非数组 ⇒ 空表（零节点 —— 禁假数据）。 */
const listOf = (value) => (Array.isArray(value) ? value : [])
/** 非空串归一。 */
const str = (value) => (typeof value === "string" && value !== "" ? value : null)
/** 有限正整数归一（零 / 负 / 非数 ⇒ null）。 */
const posInt = (value) => (Number.isInteger(value) && value > 0 ? value : null)

/** 来源徽标词键闭集（主侧 `specMatch().source` 三值；表外 ⇒ 兜底词 —— 不猜）。 */
const SOURCE_WORD = Object.freeze({
  builtin: "settings.modelParams.source.builtin",
  override: "settings.modelParams.source.override",
  default: "settings.modelParams.source.default",
})

/** 来源徽标节点（`source` 表外 ⇒ 兜底词）。 */
function sourceBadge(source) {
  const key = Object.hasOwn(SOURCE_WORD, source) ? source : "default"
  return { tag: "span", props: { class: "settings-row-badge", "data-source": key }, children: [t(SOURCE_WORD[key])] }
}

/** 思考态三值归一（`thinking` + `alwaysOn` 两核字段 ⇒ 表单单值）。 */
function thinkOf(spec) {
  if (spec?.alwaysOn === true) return "always"
  return spec?.thinking === true ? "on" : "off"
}

/** 上下文窗口徽标（行面 ∕ 读数面共用；`ctx` 缺 ⇒ null —— 禁假造）。**十进制口径**（ZCode 模型列表
 *  `200K` 同形——用户心智模型即「128K ∕ 1M」这类标称值，非 2^10 严格值）：≥100 万 ⇒ `1M` ∕ `1.5M`；
 *  否则 `${round(ctx/1000)}K`。 */
export function contextKBadge(context) {
  const ctx = posInt(context)
  if (ctx === null) return null
  if (ctx >= 1_000_000) {
    const m = Math.round(ctx / 100_000) / 10
    return `${Number.isInteger(m) ? m : m.toFixed(1)}M`
  }
  return `${Math.round(ctx / 1000)}K`
}

/** 生效值摘要串（读数面）。 */
function effectText(spec) {
  const ctx = posInt(spec?.context)
  const out = posInt(spec?.maxOutput)
  if (ctx === null && out === null) return null
  return `${t("settings.modelParams.context")} ${ctx ?? "—"} · ${t("settings.modelParams.maxOutput")} ${out ?? "—"}`
}

/** 数值字段（token 全量；`data-draft` ⇒ 跨重绘保真 —— 沿设置面 #604 总闸）。
 *  布局 = 标词 ∕ **[输入框 + 档位下拉] 同排** ∕ 提示。`tiers` 给 ⇒ 右侧挂档位 `select`（快填菜单 ——
 *  选中即写进紧邻输入框；输入框仍是唯一值持有者，任意值照填）。`onPick` = 出口族 `onPickTier`（单一实现）。 */
function numberField({ field, labelKey, value, hintKey, tiers, onPick }) {
  const input = {
    tag: "input",
    props: {
      class: "settings-field",
      type: "number",
      min: "1",
      step: "1",
      name: field,
      "data-draft": `modelParams.${field}`,
      value: value === null || value === undefined ? "" : String(value),
      "aria-label": t(labelKey),
    },
    children: [],
  }
  const picker = tiers === undefined ? null : tierSelectNode({
    tiers,
    className: "settings-field settings-tier-select",
    label: t("settings.tiers.placeholder"),
    placeholder: t("settings.tiers.placeholder"),
    props: { onChange: onPick },
  })
  return {
    tag: "label",
    props: { class: "settings-field-block", "data-field": field },
    children: [
      { tag: "span", props: { class: "settings-field-label" }, children: [t(labelKey)] },
      picker === null
        ? input
        : { tag: "div", props: { class: "settings-field-pair" }, children: [input, picker] },
      ...(hintKey === undefined ? [] : [{ tag: "span", props: { class: "settings-field-hint" }, children: [t(hintKey)] }]),
    ],
  }
}

/** 思考态三态 select（`off` ∕ `on` ∕ `always` ⇒ 出口映射 `thinking` + `thinkAlwaysOn` 两叶）。 */
function thinkField(current) {
  return {
    tag: "label",
    props: { class: "settings-field-block", "data-field": "thinking" },
    children: [
      { tag: "span", props: { class: "settings-field-label" }, children: [t("settings.modelParams.thinking")] },
      {
        tag: "select",
        props: { class: "settings-field", name: "thinking", "data-draft": "modelParams.thinking", "aria-label": t("settings.modelParams.thinking") },
        children: ["off", "on", "always"].map((value) => ({
          tag: "option",
          props: { value, ...(value === current ? { selected: "" } : {}) },
          children: [t(`settings.modelParams.thinking.${value}`)],
        })),
      },
    ],
  }
}

/** 推理档位（逗号分隔文本 ⇒ `reasoningEffortEnum` 数组；顺序 = 强度低 → 高，与核枚举同序语义）。 */
function effortField(enumList) {
  return {
    tag: "label",
    props: { class: "settings-field-block", "data-field": "reasoningEffortEnum" },
    children: [
      { tag: "span", props: { class: "settings-field-label" }, children: [t("settings.modelParams.effortEnum")] },
      {
        tag: "input",
        props: {
          class: "settings-field",
          type: "text",
          name: "reasoningEffortEnum",
          "data-draft": "modelParams.effortEnum",
          value: enumList.join(", "),
          placeholder: t("settings.modelParams.effortEnumPlaceholder"),
          "aria-label": t("settings.modelParams.effortEnum"),
        },
        children: [],
      },
      { tag: "span", props: { class: "settings-field-hint" }, children: [t("settings.modelParams.effortEnumHint")] },
    ],
  }
}

/** 默认档 select（选项 = 当前枚举；空枚举 ⇒ 单项「—」占位 —— 不取枚举首项回落）。 */
function effortDefaultField(enumList, current) {
  const values = enumList.length > 0 ? enumList : [""]
  return {
    tag: "label",
    props: { class: "settings-field-block", "data-field": "reasoningEffortDefault" },
    children: [
      { tag: "span", props: { class: "settings-field-label" }, children: [t("settings.modelParams.effortDefault")] },
      {
        tag: "select",
        props: { class: "settings-field", name: "reasoningEffortDefault", "data-draft": "modelParams.effortDefault", "aria-label": t("settings.modelParams.effortDefault") },
        children: values.map((value) => ({
          tag: "option",
          props: { value, ...(value === (current ?? "") ? { selected: "" } : {}) },
          children: [value === "" ? t("settings.modelParams.none") : value],
        })),
      },
    ],
  }
}

/** 读数行（`value` 缺 ⇒ 零节点）。 */
function readRow(labelKey, value) {
  if (value === null || value === undefined || value === "") return null
  return {
    tag: "div",
    props: { class: "settings-row", "data-read": labelKey },
    children: [
      { tag: "span", props: { class: "settings-row-name" }, children: [t(labelKey)] },
      { tag: "span", props: { class: "settings-row-value" }, children: [String(value)] },
    ],
  }
}

/** 图像输入 select（`multimodal` 叶——文本 ∕ 多模态区分，参照 ZCode「输入类型」；消费点 = 附件门
 *  `attachments.mjs isNonVisionModel` ∕ 视觉读图工具注册 `vision-reader.mjs`——改它有真效果）。
 *  三态：**跟随内置表**（空值 = 不写该叶 ⇒ 整条覆写重写时该叶缺席）∕ 支持图片 ∕ 不支持图片。
 *  初值判据 = **显式覆写值**（非生效值——生效值恒有，用它选不出「跟随」态）；生效值另见读数行。 */
function multimodalField(explicit, effective) {
  const opts = [
    { value: "", word: t("settings.modelParams.multimodal.follow") },
    { value: "true", word: t("settings.modelParams.multimodal.yes") },
    { value: "false", word: t("settings.modelParams.multimodal.no") },
  ]
  const current = explicit === true ? "true" : explicit === false ? "false" : ""
  return {
    tag: "label",
    props: { class: "settings-field-block", "data-field": "multimodal" },
    children: [
      { tag: "span", props: { class: "settings-field-label" }, children: [t("settings.modelParams.multimodal")] },
      {
        tag: "select",
        props: { class: "settings-field", name: "multimodal", "data-draft": "modelParams.multimodal", "aria-label": t("settings.modelParams.multimodal") },
        children: opts.map((o) => ({ tag: "option", props: { value: o.value, ...(o.value === current ? { selected: "" } : {}) }, children: [o.word] })),
      },
      { tag: "span", props: { class: "settings-field-hint" }, children: [t("settings.modelParams.multimodalHint")] },
    ],
  }
}

/** 弹窗体（`spec` 未达 ⇒ 载入提示 —— 宿主已在场，零退场）。 */
function bodyNodes(section, handlers) {
  const spec = section?.spec
  const id = str(section?.id)
  if (spec === null || typeof spec !== "object") {
    return [{ tag: "div", props: { class: "settings-empty", "data-empty": "modelParams" }, children: [t("settings.modelParams.loading")] }]
  }
  const enumList = listOf(spec.effortEnum).filter((x) => typeof x === "string" && x !== "")
  const onSave = typeof handlers?.onSaveModelSpec === "function" ? handlers.onSaveModelSpec : undefined
  const onReset = typeof handlers?.onResetModelSpec === "function" && str(spec.overrideKey) !== null ? handlers.onResetModelSpec : undefined
  const onCancel = typeof handlers?.onCloseModelParams === "function" ? handlers.onCloseModelParams : undefined
  return [
    { tag: "div", props: { class: "settings-row", "data-read": "modelParams.id" }, children: [
      { tag: "span", props: { class: "settings-row-name" }, children: [t("settings.modelParams.modelId")] },
      { tag: "span", props: { class: "settings-row-value mono" }, children: [id ?? ""] },
      sourceBadge(spec.source),
    ] },
    readRow("settings.modelParams.effective", effectText(spec)),
    readRow("settings.modelParams.multimodal", spec.multimodal === true ? t("settings.modelParams.multimodal.yes") : t("settings.modelParams.multimodal.no")),
    {
      tag: "form",
      props: { class: "settings-form", "data-form": "modelParams", "data-draft-scope": "modelParams" },
      children: [
        numberField({ field: "context", labelKey: "settings.modelParams.context", value: spec.context, hintKey: "settings.modelParams.contextHint", tiers: CONTEXT_TOKEN_TIERS, onPick: handlers?.onPickTier }),
        numberField({ field: "maxOutput", labelKey: "settings.modelParams.maxOutput", value: spec.maxOutput, hintKey: "settings.modelParams.maxOutputHint", tiers: MAX_OUTPUT_TIERS, onPick: handlers?.onPickTier }),
        {
          tag: "details",
          props: { class: "settings-advanced" },
          children: [
            { tag: "summary", props: { class: "settings-advanced-summary" }, children: [t("settings.modelParams.advanced")] },
            { tag: "div", props: { class: "settings-advanced-body" }, children: [
              multimodalField(spec.multimodalExplicit, spec.multimodal === true),
              thinkField(thinkOf(spec)),
              effortField(enumList),
              effortDefaultField(enumList, spec.effortDefault),
            ] },
          ],
        },
        {
          tag: "div",
          props: { class: "settings-modal-actions" },
          children: [
            { tag: "button", props: wire({ class: "settings-link", type: "button", "data-action": "settings:modelSpecReset" }, onReset), children: [t("settings.modelParams.reset")] },
            { tag: "span", props: { class: "settings-actions-spacer" }, children: [] },
            { tag: "button", props: wire({ class: "settings-row-action", type: "button", "data-action": "settings:modelParamsClose" }, onCancel), children: [t("settings.modelParams.cancel")] },
            { tag: "button", props: wire({ class: "settings-submit", type: "button", "data-action": "settings:modelSpecSave" }, onSave), children: [t("settings.modelParams.save")] },
          ],
        },
      ],
    },
  ]
}

/** 弹窗树（`{ backdrop, card }` —— 宿主人参形；三关：背板 ∥ ✕ ∥ 卡内 Esc〔`stopPropagation` —— 不连带关设置页〕）。 */
export function modelParamsModalTree(section, handlers = {}) {
  const onClose = typeof handlers?.onCloseModelParams === "function" ? handlers.onCloseModelParams : undefined
  const close = () => { if (typeof onClose === "function") onClose() }
  const id = str(section?.id)
  const title = id === null ? t("settings.modelParams.title") : `${t("settings.modelParams.title")} — ${id}`
  return {
    backdrop: { tag: "div", props: { class: "settings-modal-backdrop", onClick: close }, children: [] },
    card: {
      tag: "div",
      props: {
        class: "settings-modal settings-modelparams",
        role: "dialog",
        "aria-modal": "true",
        "aria-label": title,
        onKeydown: (event) => { if (event?.key !== "Escape") return; event.stopPropagation?.(); close() },
      },
      children: [
        { tag: "header", props: { class: "settings-head" }, children: [
          { tag: "h2", props: { class: "settings-title" }, children: [t("settings.modelParams.title")] },
          { tag: "button", props: wire({ class: "settings-close", type: "button", "data-action": "settings:modelParamsClose", "aria-label": t("settings.close") }, onClose), children: [] },
        ] },
        { tag: "div", props: { class: "settings-modal-body", "data-state": section?.spec === null || typeof section?.spec !== "object" ? "loading" : "ready" }, children: bodyNodes(section, handlers) },
      ],
    },
  }
}
