/**
 * image-preview.mjs — 用户消息缩略图**点击预览** lightbox（2026-10-12 · ZCode `ImagePreviewDialog`
 * 对位——零构建 DOM 版）。数据流复用图文管线：缩略图经 `chat-images.mjs` 回填 dataURL（模块级缓存），
 * 本档只做展示面——点击委托 `.block-images img[data-loaded]`（`data-gone` ∕ 加载中不响应——诚实面）
 * 收集同条图组为 gallery，打开遮罩层。
 *
 * 功能面（ZCode 同表）：居中大图（object-contain）· 缩放 50%–300%（底部药丸 −∕百分比∕+ · 滚轮 ±25%
 * · 双指捏合）· 拖拽平移（pointer capture + 视口钳制——`clampImagePreviewOffset` 同式）· 多图左右切
 * 换（箭头钮 ∕ ←→ 键，循环）· 下载（`<a download>`——dataURL 直落）· 关闭（钮 ∕ Esc ∕ 点遮罩空白）。
 * 字形纪律：钮面字形住 `beauty.css` `content`（零字形字面——`.settings-icon-btn` 同式）；可及名走词表
 * （`preview.*` 六键——`i18n-composer.mjs` 两语同增）。
 * 纪律：零 `node:` ∕ 零裸包；单例遮罩挂 `document.body`（对话流重绘零扰——不进 flow 容器）。
 */

import { t } from "./i18n.mjs"

const ZOOM_MIN = 0.5
const ZOOM_MAX = 3
const ZOOM_STEP = 0.5
const ZOOM_WHEEL = 0.25

/** 单例件引用（懒建——首次打开才落 DOM）。 */
let root = null
let stage = null
let img = null
let pctEl = null
let prevBtn = null
let nextBtn = null

/** 会话态：当前 gallery ∕ 位次 ∕ 变换（缩放 + 平移偏移）。 */
let items = []
let index = 0
let scale = 1
let offset = { x: 0, y: 0 }
const pointers = new Map()
let dragStart = null
let pinchStart = null

/** 钮面工厂（class + CSS 字形 + 可及名——零字形字面进 JS）。 */
function makeBtn(className, labelKey) {
  const b = document.createElement("button")
  b.type = "button"
  b.className = className
  b.setAttribute("aria-label", t(labelKey))
  b.title = t(labelKey)
  return b
}

/** 平移钳制（ZCode `clampImagePreviewOffset` 同式）：图缩放后不越视口——有余量归零，无余量夹边。 */
function clampOffset(o, s) {
  const maxX = Math.max(0, (img.offsetWidth * s - stage.clientWidth) / 2)
  const maxY = Math.max(0, (img.offsetHeight * s - stage.clientHeight) / 2)
  return {
    x: maxX === 0 ? 0 : Math.min(maxX, Math.max(-maxX, o.x)),
    y: maxY === 0 ? 0 : Math.min(maxY, Math.max(-maxY, o.y)),
  }
}

function clampScale(s) {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, s))
}

/** 变换落位（translate3d + scale——合成层直写，零布局抖动）+ 百分比读数。 */
function applyTransform() {
  img.style.transform = `translate3d(${offset.x}px, ${offset.y}px, 0) scale(${scale})`
  pctEl.textContent = `${Math.round(scale * 100)}%`
}

function resetTransform() {
  scale = 1
  offset = { x: 0, y: 0 }
  applyTransform()
}

/** 展示位次（循环取模）+ 复位变换 + 双图以上才出箭头。 */
function show(i) {
  index = ((i % items.length) + items.length) % items.length
  const it = items[index]
  img.src = it.src
  img.alt = it.name ?? ""
  const hasMultiple = items.length > 1
  prevBtn.style.display = hasMultiple ? "" : "none"
  nextBtn.style.display = hasMultiple ? "" : "none"
  resetTransform()
}

function close() {
  root.style.display = "none"
  window.removeEventListener("keydown", onKey, true)
}

function onKey(e) {
  if (e.key === "Escape") {
    e.stopPropagation()
    close()
  } else if (e.key === "ArrowLeft" && items.length > 1) {
    show(index - 1)
  } else if (e.key === "ArrowRight" && items.length > 1) {
    show(index + 1)
  }
}

function changeScale(delta) {
  scale = clampScale(scale + delta)
  offset = clampOffset(offset, scale)
  applyTransform()
}

/** 指针三事件（stage 上 capture）：单指拖平移 ∕ 双指捏合缩放——ZCode `handlePointer*` 同式。 */
function onPointerDown(e) {
  stage.setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 1) {
    dragStart = { offset: { ...offset }, x: e.clientX, y: e.clientY }
    pinchStart = null
    return
  }
  const [a, b] = [...pointers.values()]
  const distance = Math.hypot(b.x - a.x, b.y - a.y)
  if (distance > 0) pinchStart = { distance, scale }
}

function onPointerMove(e) {
  if (!pointers.has(e.pointerId)) return
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  const pts = [...pointers.values()]
  if (pts.length >= 2 && pinchStart) {
    const distance = Math.hypot(pts[1].x - pts[0].x, pts[1].y - pts[0].y)
    if (distance > 0) {
      scale = clampScale(pinchStart.scale * (distance / pinchStart.distance))
      offset = clampOffset(offset, scale)
      applyTransform()
    }
    return
  }
  if (dragStart) {
    offset = clampOffset(
      { x: dragStart.offset.x + e.clientX - dragStart.x, y: dragStart.offset.y + e.clientY - dragStart.y },
      scale,
    )
    applyTransform()
  }
}

function onPointerEnd(e) {
  if (stage.hasPointerCapture(e.pointerId)) stage.releasePointerCapture(e.pointerId)
  pointers.delete(e.pointerId)
  pinchStart = null
  const rest = [...pointers.values()][0]
  dragStart = rest ? { offset: { ...offset }, x: rest.x, y: rest.y } : null
}

/** 下载（`<a download>`——dataURL 直落；文件名 = 落盘件基名 ∕ image.png）。 */
function downloadCurrent() {
  const it = items[index]
  if (!it?.src) return
  const a = document.createElement("a")
  a.href = it.src
  a.download = it.name || "image.png"
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/** 单例遮罩装配（懒建——首开一次；结构 = 遮罩 ∕ 舞台 ∕ 图 ∕ 右上双钮 ∕ 双侧箭头 ∕ 底部缩放药丸）。 */
function ensureRoot() {
  if (root !== null) return
  root = document.createElement("div")
  root.className = "image-preview"
  stage = document.createElement("div")
  stage.className = "image-preview-stage"
  img = document.createElement("img")
  img.className = "image-preview-img"
  img.draggable = false
  img.alt = ""
  img.addEventListener("load", resetTransform)
  stage.appendChild(img)
  stage.addEventListener("pointerdown", onPointerDown)
  stage.addEventListener("pointermove", onPointerMove)
  stage.addEventListener("pointerup", onPointerEnd)
  stage.addEventListener("pointercancel", onPointerEnd)
  // 点空白关（stage 铺满遮罩 ⇒ root 永不吃点）：target = stage 本体（非图 ∕ 钮）∧ 位移 < 5px（拖拽释放
  // 的 click 不算点）⇒ 关。downXY 记录挂 pointerdown 同点。
  let downXY = null
  stage.addEventListener("pointerdown", (e) => { downXY = { x: e.clientX, y: e.clientY } })
  stage.addEventListener("click", (e) => {
    if (e.target !== stage || downXY === null) return
    if (Math.hypot(e.clientX - downXY.x, e.clientY - downXY.y) >= 5) return
    close()
  })
  stage.addEventListener("wheel", (e) => {
    e.preventDefault()
    changeScale(e.deltaY < 0 ? ZOOM_WHEEL : -ZOOM_WHEEL)
  }, { passive: false })
  const closeBtn = makeBtn("image-preview-btn image-preview-close", "preview.close")
  closeBtn.addEventListener("click", close)
  const dlBtn = makeBtn("image-preview-btn image-preview-download", "preview.download")
  dlBtn.addEventListener("click", downloadCurrent)
  prevBtn = makeBtn("image-preview-btn image-preview-nav image-preview-prev", "preview.prev")
  prevBtn.addEventListener("click", () => show(index - 1))
  nextBtn = makeBtn("image-preview-btn image-preview-nav image-preview-next", "preview.next")
  nextBtn.addEventListener("click", () => show(index + 1))

  const pill = document.createElement("div")
  pill.className = "image-preview-pill"
  const minus = makeBtn("image-preview-btn image-preview-zoom-out", "preview.zoomOut")
  minus.addEventListener("click", () => changeScale(-ZOOM_STEP))
  pctEl = document.createElement("span")
  pctEl.className = "image-preview-pct"
  pctEl.textContent = "100%"
  const plus = makeBtn("image-preview-btn image-preview-zoom-in", "preview.zoomIn")
  plus.addEventListener("click", () => changeScale(ZOOM_STEP))
  pill.append(minus, pctEl, plus)

  root.append(stage, dlBtn, closeBtn, prevBtn, nextBtn, pill)
  document.body.appendChild(root)
}

/** 打开预览（公开面——`wireImagePreview` 委托消费；items = `{ src, name? }` 列表）。 */
export function openImagePreview(list, i = 0) {
  const list0 = Array.isArray(list) ? list.filter((it) => typeof it?.src === "string" && it.src !== "") : []
  if (list0.length === 0) return
  items = list0
  ensureRoot()
  root.style.display = "flex"
  show(Math.min(Math.max(i, 0), items.length - 1))
  window.addEventListener("keydown", onKey, true)
}

/** 装配（一次性——`renderer/app.mjs` 消费；`attachChatImages` 同款全局委托接线）：点击已回填缩略图
 *  ⇒ 同条图组开预览（`data-gone` ∕ pending 不响应）。 */
export function wireImagePreview() {
  if (typeof document === "undefined" || typeof document.addEventListener !== "function") return
  document.addEventListener("click", (e) => {
    const el = e.target instanceof Element ? e.target.closest(".block-images img[data-loaded]") : null
    if (el === null) return
    const strip = el.closest(".block-images")
    if (strip === null) return
    const list = [...strip.querySelectorAll("img[data-loaded]")].map((im) => ({
      src: im.src,
      name: (im.getAttribute("data-path") ?? "").split(/[\\/]/).pop(),
    }))
    openImagePreview(list, list.findIndex((it) => it.src === el.src))
  })
}
