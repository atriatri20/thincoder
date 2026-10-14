/**
 * settings-sections.mjs — 设置面段体档（批 9 · 批档 §2.12–§2.13；自 `renderer/views/settings.mjs` 拆出
 * —— 300 行层拆分，零语义变化）：模型段体 + 拆档族 re-export 面（渠道 / agent / 工具 / env / models /
 * MCP —— 各段体自立出档，本档 re-export ⇒ 分派面零改）。
 *   - 渠道族（行族 + 段体）随 D37 设置面样式收正批（2026-10-02 · 台账 #812）出档
 *     `renderer/views/settings-sections-providers.mjs`（**先拆后改** · 越层消解 —— 本档 309 ⇒ 回线）；
 *   - agent 段体（含具名十键表 `NAMED_FIELDS`）随 R8 拆出 `./settings-agent.mjs`（本档 re-export 两件）；
 *   - 「工具与服务」段体随 R2 拆出 `./settings-sections-tools.mjs`（本档 re-export 一件）；
 *   - R7 两新段体拆出 `./settings-sections-env.mjs` ∥ `./settings-sections-models.mjs`（本档 re-export 两件）；
 *   - MCP 段体随两钮出档 `./settings-sections-mcp.mjs`（本档 re-export 一件）；
 *   - 「团队」段体随 B1 登录面批（2026-10-10 · 台账 #1212）自立出档 `./settings-sections-team.mjs`（本档 re-export 一件）。
 * 面形要点：各段体供 `settings.mjs` 段体分派（段体经 `deps` 注入取用两导出面（`verifyControl`）
 * 与词表（`reasonWord`），本档零 import 反向（无环）—— **R7 起 = 六段体**（env ∕ models 两新段
 * 经本档 re-export 面入分派；MCP 体第三参 `deps` 供 `reasonWord` 出词）。
 * 导出面：`modelHeadNode` / `modelChoicesTree` 供首启向导第二步复用（单一 owner、零副本）；`providersBody` = D37 拆档 re-export（消费面零改）；
 * 三端对齐批：`providerAddBody`（添加弹窗体）随渠道族同档经本档 re-export；
 * 添加入口弹窗统一批（KD-77 ①②）：`mcpFormBody`（MCP 表单弹窗体）∥ `consultAddBody`（会诊添加弹窗体）同径 re-export；
 * B1 批（台账 #1212）：`teamBody`（团队段体——登录表单 ∥ 状态行两态）同径 re-export（**登录面补全批收正**——改 `teamAdminBody`：卡降管理面，登/退面段体改由面板直取段体档）。
 * 纪律：零 DOM（描述符树）；文案一律经 `t()`；零 `node:` / 零裸包 / 零 `store.mjs` import。
 */
import { t } from "../i18n.mjs"
import { wire } from "./chat-tool.mjs"
// 上下文窗口 K 摘要（单源 —— 「编辑模型配置」弹窗与本段行徽标同形；本档零第二副本）。
import { contextKBadge } from "./settings-sections-modelparams.mjs"

// agent 段体（含具名十键表 `NAMED_FIELDS`）已随 R8 拆出 `./settings-agent.mjs`；本档 re-export ⇒ 导出面零改。
export { agentBody, NAMED_FIELDS } from "./settings-agent.mjs"
// 「工具与服务」段体（本批 = 索引族行）随 R2 拆出 `./settings-sections-tools.mjs`；本档 re-export ⇒ 导出面零改。
export { toolsBody } from "./settings-sections-tools.mjs"
// R7 两新段体（环境 ∕ 咨询与顾问）自立出档；本档 re-export ⇒ 分派面零改；KD-77 ②：同档增出 `consultAddBody`（会诊添加弹窗体）。
export { envBody } from "./settings-sections-env.mjs"
// 用量段体（Token 用量统计批 · 2026-10-06）同拍出档；本档 re-export ⇒ 分派面零改。
export { usageBody } from "./settings-sections-usage.mjs"
export { consultAddBody, modelsBody } from "./settings-sections-models.mjs"
// MCP 段体（R7 随两钮先拆后改 —— `-mcp.mjs`）同拍；本档 re-export ⇒ 分派面零改；KD-77 ①：同档增出 `mcpFormBody`（MCP 表单弹窗体）。
export { mcpBody, mcpFormBody } from "./settings-sections-mcp.mjs"// 渠道族（行族 + 段体）随 D37 先拆后改出档 `./settings-sections-providers.mjs`；本档 re-export ⇒ 分派面零改。
// 三端对齐批：同档增出 `providerAddBody`（添加弹窗体 —— `views/settings.mjs` `providerAdd` 支消费）随本行 re-export。
export { providerAddBody, providersBody } from "./settings-sections-providers.mjs"
// B1 批（台账 #1212）「团队」段体自立出档；本档 re-export ⇒ 分派面零改（消费 = `views/settings.mjs` 段体分派 `team` 支）。
// 登录面补全批（台账 #1231）收正：卡降管理面 ⇒ re-export 改 `teamAdminBody`（`teamBody` 改由登/退面就地面板直取段体档——单一实现）。
export { teamAdminBody } from "./settings-sections-team.mjs"

/** 列表切片：缺 / 非数组 ⇒ 空表（零节点 —— 禁假数据）。 */
const listOf = (value) => (Array.isArray(value) ? value : [])

/** 模型候选项 → 标识串（**单向投影 · 单源** —— 回执元素形 `{ id, effortEnum, thinkOff }`（`docs/desktop/design/IPC.md` §2
 *  `model:list` 行「批 B 增」）⇒ 逐项 `.id` 逐字（`docs/desktop/design/UI.md` §1 项 1 候选口径）；串元素（直测面）⇒ 自身；
 *  空串 ∥ 空 `.id` ∥ 非串非对象 ⇒ `null`（零假造 —— 调用面自行过滤）。 */
export function modelIdOf(value) {
  if (typeof value === "string") return value === "" ? null : value
  const id = value?.id
  return typeof id === "string" && id !== "" ? id : null
}

/** 当前模型读数节点（**导出面** —— 设置面模型段与首启向导第二步同一构造）；无当前 ⇒ `null`（零节点）。 */
export function modelHeadNode(model) {
  if (model?.current === null || model?.current === undefined) return null
  return {
    tag: "div",
    props: { class: "settings-row", "data-read": "current" },
    children: [{ tag: "span", props: { class: "settings-row-name" }, children: [t("settings.model.current")] },
      { tag: "span", props: { class: "settings-row-value" }, children: [model.current] }],
  }
}

/** 候选行（**导出面** —— 同上）：行 + 空态词（`ready` 而零候选 ⇒ 禁假造）。行形 = 行自带渠 `{ id, provider }`
 *  （全渠扇出面 · #842）∥ 纯 id（常规面 —— 渠落段级）。
 *  **2026-10-04 卡片网格**：行族包进 `.model-grid`（CSS 网格 —— `codex.css` 多列紧凑卡；原单行通栏占用过大）。 */
export function modelChoicesTree(model, handlers = {}) {
  const rows = listOf(model?.models).map((row) => modelRowNode(row, model, handlers))
  if (model?.state !== "ready" || rows.length > 0) {
    return [{ tag: "div", props: { class: "model-grid", "data-grid": "models" }, children: rows }]
  }
  return [{ tag: "div", props: { class: "settings-empty", "data-empty": "" }, children: [t("settings.model.empty")] }]
}

/** 模型行：名 + 上下文 K 徽标 + 两**图标钮**（编辑 ∕ 采用）。**#842**：行自带渠（全渠扇出面）⇒ 名显示
 *  `provider · id`、「采用」按行自带渠（`onUseModel(provider, id)`）；行无渠 ⇒ 落段级激活渠（常规面判据零变）。
 *  **2026-10-10（模型参数批 · 用户裁定）**：①「采用」改**图标钮**（原文字胶囊占宽 —— 四列网格下挤）；
 *  ②其后加**编辑图标钮** ⇒ 开「编辑模型配置」弹窗（`onEditModel(id)` —— 覆写键 = 模型 ID，与渠道无关）；
 *  ③行携上下文 K 徽标（ZCode 模型列表同形 —— `qd/qfmodel 200K`），规格来源 = 主侧 `modelEntry` 投影；
 *  ④**已覆写**行（`source === "override"`）⇒ 编辑钮染主题色（`data-overridden` 锚 —— 一眼可辨自定模型）。
 *  字形住 `renderer/codex.css` `content`（零字形字面 —— 纪律同全档）；`aria-label` ∕ `title` 保留可及名。 */
function modelRowNode(row, model, handlers) {
  const id = modelIdOf(row) ?? ""
  const own = row !== null && typeof row === "object" && typeof row.provider === "string" && row.provider !== "" ? row.provider : null
  const provider = own ?? (typeof model?.provider === "string" && model.provider !== "" ? model.provider : null)
  const current = model.current === `${provider}:${id}`
  const onUse = !current && typeof handlers?.onUseModel === "function" && provider !== null
    ? () => handlers.onUseModel(provider, id)
    : undefined
  const onEdit = typeof handlers?.onEditModel === "function" ? () => handlers.onEditModel(id) : undefined
  const kb = contextKBadge(row?.context)
  const overridden = row !== null && typeof row === "object" && row.source === "override"
  const iconBtn = (kind, action, handler, label) => ({
    tag: "button",
    props: wire({
      class: `settings-icon-btn ${kind}`,
      type: "button",
      "data-action": action,
      "data-model": id,
      ...(kind === "edit" && overridden ? { "data-overridden": "" } : {}),
      "aria-label": label,
      title: label,
    }, handler),
    children: [],
  })
  return {
    tag: "div",
    props: { class: "settings-row", "data-model": id, "data-current": current ? "" : undefined },
    children: [
      { tag: "span", props: { class: "settings-row-name" }, children: [
        { tag: "span", props: { class: "settings-row-model" }, children: [own === null ? id : `${own} · ${id}`] },
        ...(kb === null ? [] : [{ tag: "span", props: { class: "settings-row-k" }, children: [kb] }]),
      ] },
      iconBtn("use", "settings:useModel", onUse, t("settings.model.use")),
      iconBtn("edit", "settings:editModel", onEdit, t("settings.modelParams.edit")),
    ],
  }
}

/** 模型段体：当前读数 + 候选行（**向导不经本函数**）
 *  + **自定义模型 ID 行**（2026-10-05 —— 网关列表外的模型（如 `qd/qfmodel`）此前无入口；写径复用
 *  `onUseCustomModel`（装配层现读输入值 + 活跃渠道 `section.provider`）——值持久 = 草稿面（`data-draft`）。 */
export function modelBody(section, handlers) {
  const onUseCustom = typeof handlers?.onUseCustomModel === "function" && section?.provider !== null ? handlers.onUseCustomModel : undefined
  return [
    modelHeadNode(section),
    ...modelChoicesTree(section, handlers),
    {
      tag: "div",
      props: { class: "settings-field-row", "data-field": "model.custom" },
      children: [
        {
          tag: "input",
          props: {
            class: "settings-field",
            "data-draft": "custom-model",
            placeholder: t("settings.model.customPlaceholder"),
            "aria-label": t("settings.model.customPlaceholder"),
            onKeydown: (event) => {
              if (event?.key === "Enter") handlers?.onUseCustomModel?.()
            },
          },
          children: [],
        },
        {
          tag: "button",
          props: wire({ class: "settings-row-action", type: "button", "data-action": "settings:useCustomModel" }, onUseCustom),
          children: [t("settings.model.customUse")],
        },
      ],
    },
  ]
}
