/**
 * reasoning-pref.mjs — 思考链**批量动作瞬时态**（美化形大改批 · 2026-10-04；第六轮 ZCode 语义对齐重定义）：
 * 块级默认态 = **恒收起**（`chat-text.mjs` `reasoningNode` `open: false` —— ZCode `Reasoning` `defaultOpen=false`
 * 同口径：流式 ∕ 完成皆默认收起，边界自动收起见 `reasoning-times.mjs`）；本档 = 线程头「思考」钮的
 * **总折叠 ∕ 总展开目标态**（瞬时不持久 —— 不落 localStorage：粘性偏好会让后续所有新块按展开构建，
 * 用户实测几十个思考块全部展开即此因；重开应用回到默认收起）。
 * 读面 = `session-control.mjs` 钮态；写面唯一 = `app.mjs` `onToggleReasoning`（翻态 + 当前树就地翻转）。
 * 纪律：零 `node:` ∕ 零裸包；chrome 级直写面先例 = `theme.mjs` ∕ `pool-width.mjs`。
 */
let bulkExpanded = false

/** 读面（钮态构树期取用）。 */
export function reasoningBulkExpanded() {
  return bulkExpanded
}

/** 写面（唯一出口翻转）：真 = 总展开。回值 = 新值。 */
export function setReasoningBulkExpanded(value) {
  bulkExpanded = value === true
  return bulkExpanded
}
