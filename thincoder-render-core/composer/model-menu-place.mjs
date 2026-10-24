/**
 * model-menu-place.mjs — 模型菜单面板落位纯件（零 DOM 读写）。
 * 入参：`anchorRect`（触发钮 viewport 矩形，`getBoundingClientRect()` 形）· `viewport`（`{ width, height }`）·
 *       `panelHeight`（面板高；调用方已按 `Math.min(offsetHeight || 200, 340)` 夹取）·
 *       `panelWidth`（缺省 270 = 既有写死常量，`model-menu.mjs` 原 `window.innerWidth - 270`）· `up`（触发钮要求向上）。
 * 返形：`{ left, top }`（px 数值）。
 *
 * 零矩形兜位：锚无 CSS 盒（矩形四值全零——未挂载 / `display:none`）⇒ 面板视口居中；不兜位则落视口左上角，
 * 菜单看起来「凭空出现在角落」（`RENDER-CORE.md` §5 条 6）。
 * 正常锚：横向 `Math.max(4, Math.min(r.left, viewport.width − panelWidth))`；纵向下方无位（或 `up`）⇒ 翻上。
 */
export function computePlacement({ anchorRect, viewport, panelHeight, panelWidth = 270, up = false }) {
  if (anchorRect.width === 0 && anchorRect.height === 0 && anchorRect.left === 0 && anchorRect.top === 0) {
    return { left: (viewport.width - panelWidth) / 2, top: (viewport.height - panelHeight) / 2 }
  }
  const below = viewport.height - anchorRect.bottom - 4
  const openUp = up || below < Math.min(panelHeight, 180)
  return {
    left: Math.max(4, Math.min(anchorRect.left, viewport.width - panelWidth)),
    top: openUp ? Math.max(4, anchorRect.top - panelHeight - 4) : anchorRect.bottom + 4,
  }
}
