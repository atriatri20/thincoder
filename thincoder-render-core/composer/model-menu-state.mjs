/**
 * model-menu-state.mjs — 模型菜单候选三态纯件（`RENDER-CORE.md` §5 条 6「空表 ≠ 未到」的判据单源，零 DOM）。
 * `null`（候选未到）⇒ `"loading"` · 空数组（已到且空）⇒ `"empty"` · 有候选 ⇒ `"list"`。
 * 渲面两支（加载行 ∥ 无可用模型行）与单测共用同一判定——两处各写一遍会让「空表」退回「加载中」。
 */
export function menuStateOf(models) {
  if (!Array.isArray(models)) return "loading"
  return models.length === 0 ? "empty" : "list"
}
