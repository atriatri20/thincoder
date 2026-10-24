/**
 * title-tips.mjs — 原生 title tooltip 全局接管（fork 2026-10-05 —— 用户反馈「浮选窗还是旧样式，
 * 可以考虑小地图的样式」）：`title` 属性的原生 tooltip = 系统旧样式（灰盒白字，与美化面不合）。
 * 本档 = **单点接管**：① `setAttribute("title", …)` 拦截（`Element.prototype.setAttribute` 微包裹——
 * 值入 `WeakMap` 册子后**移除属性** ⇒ 原生 tooltip 永不失锚；`getAttribute("title")` 同步回读册值
 * ⇒ 既有读面零感知）；② `document` 级 mouseover/mouseout 委托显示 美化面卡（小地图 `.minimap-tip`
 * 同形：12px 圆角 ∕ 描边 ∕ pop 阴影 ∕ 13px 字）。纯 chrome 面：零 store ∕ 零 IPC ∕ 零 node。
 * 装配 = `app.mjs` 装配期一次（先于首绘——否则首帧 title 原生弹）；读 `title` 而不改写值的既有面
 * （chrome-words 汉化改写 ∕ 测试断言）经 `getAttribute` 回读仍得原值。
 * 边界：SVG 元素走属性面同拦（`instanceof Element` 总catch）；含换行的长 title 换行呈现（`white-space: pre-line`）；
 * `readonly`/禁用控件照常显（title 在父级也托底——事件委托 target 冒泡取最近 `[data-tip]`）。
 */

/** 册子（元素 → title 值）：WeakRef 不需要——元素亡则条目随 GC（WeakMap 语义）。 */
const tips = new WeakMap()

/** 卡节点（懒建 · 单例）：`.title-tip` —— 形 = `.minimap-tip` 同构（beauty.css）。 */
let tip = null
function tipNode() {
  if (tip !== null) return tip
  tip = document.createElement("div")
  tip.className = "title-tip"
  tip.setAttribute("role", "tooltip")
  tip.style.display = "none"
  document.body.append(tip)
  return tip
}

/** 展示（锚元素视口 rect ⇒ 卡贴下方居中；底边溢出 ⇒ 翻上方）：值空 ⇒ 零显。 */
function showTip(target) {
  const text = tips.get(target)
  if (typeof text !== "string" || text === "") return
  const card = tipNode()
  card.textContent = text
  card.style.display = "block"
  const rect = target.getBoundingClientRect()
  const cardRect = card.getBoundingClientRect()
  const below = rect.bottom + 6
  const flip = below + cardRect.height > window.innerHeight - 8
  card.style.left = `${Math.max(8, Math.min(rect.left + rect.width / 2 - cardRect.width / 2, window.innerWidth - cardRect.width - 8))}px`
  card.style.top = `${flip ? Math.max(8, rect.top - cardRect.height - 6) : below}px`
  card.toggleAttribute("data-visible", true)
}

function hideTip() {
  if (tip !== null) {
    tip.removeAttribute("data-visible")
    tip.style.display = "none"
  }
}

/** 装配（app.mjs 装配期一次）：属性拦截 + 文档级委托。返停表（测试 ∕ 热重载用——本档现状零调用面）。 */
export function initTitleTips() {
  // ① title 属性拦截（包裹 setAttribute；getAttribute 回读册值）
  const proto = Element.prototype
  const rawSet = proto.setAttribute
  const rawGet = proto.getAttribute
  const rawRemove = proto.removeAttribute
  proto.setAttribute = function (name, value) {
    if (name === "title") {
      const next = String(value ?? "")
      const prev = tips.get(this)
      if (prev !== next) {
        tips.set(this, next)
        rawSet.call(this, "data-tip", "") // 委托锚（已在树元素亦即时生效——childList 观察不到属性写）
        rawRemove.call(this, "title") // 原生 tooltip 失锚 —— 卡面接管
        // 信号面（原生属性变异已消失 —— 观察者替代径）：值变即派 `titlechange`（bubbles —— document 级消费；
        // 先例消费 = chrome-words plan 钮词面自愈）。同值零派（幂等写零噪声）。
        try { this.dispatchEvent(new CustomEvent("titlechange", { bubbles: true })) } catch { /* 非文档元素容错 */ }
      }
      return
    }
    return rawSet.call(this, name, value)
  }
  proto.getAttribute = function (name) {
    if (name === "title" && tips.has(this)) return tips.get(this)
    return rawGet.call(this, name)
  }

  // ② `title` IDL 访问器拦截（**关键** —— `el.title = x` 走 WebIDL 内部算法，**不经** setAttribute 的
  //  JS 包装；chrome-words ∕ render-core `btn.title = …` 全在此径）：重定义 HTMLElement ∕ SVGElement
  //  原型 title 访问器——set 径转 `this.setAttribute("title", v)`（⇒ ① 拦截），get 径读册值 ∕ 原生兜底。
  for (const host of [globalThis.HTMLElement, globalThis.SVGElement]) {
    const proto = host?.prototype
    const desc = proto === undefined ? undefined : Object.getOwnPropertyDescriptor(proto, "title")
    if (desc === undefined || desc.get === undefined || desc.set === undefined) continue
    Object.defineProperty(proto, "title", {
      configurable: true,
      enumerable: desc.enumerable,
      get() {
        if (tips.has(this)) return tips.get(this)
        return desc.get.call(this) ?? ""
      },
      set(value) {
        this.setAttribute("title", value) // ⇒ ① 拦截（册写 + data-tip 锚 + 原生属性摘除）
      },
    })
  }

  // ③ 已在树元素的存量 title（首绘前的静态 HTML —— index.html）一次性收编
  const collect = (root) => {
    for (const el of root.querySelectorAll("[title]")) {
      tips.set(el, rawGet.call(el, "title"))
      rawRemove.call(el, "title")
      rawSet.call(el, "data-tip", "")
    }
  }

  // ④ 文档级委托（mouseover 进 ∕ mouseout 出——与 mouseenter 不同源但冒泡，恰合委托）
  document.addEventListener("mouseover", (event) => {
    const target = event?.target instanceof Element ? event.target.closest("[data-tip]") : null
    if (target !== null) showTip(target)
    else hideTip()
  })
  document.addEventListener("mouseout", (event) => {
    if (event?.target instanceof Element && event.target.closest("[data-tip]") !== null) hideTip()
  })
  // 滚动 ∕ 按下即隐（卡不悬空——与原生 tooltip 行为对齐）
  window.addEventListener("scroll", hideTip, true)
  window.addEventListener("mousedown", hideTip, true)

  // ⑤ MutationObserver：后插 ∕ 改 title 的元素打 `data-tip` 锚（委托判据）+ 收编值
  const mark = (el) => {
    if (tips.has(el)) rawSet.call(el, "data-tip", "")
  }
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) {
            collect(node) // 子树存量 title 收编（HTML 解析面原生属性——拦截器不在场）
            for (const el of [node, ...node.querySelectorAll("[data-tip]")]) mark(el)
          }
        }
      }
    }
  })
  collect(document)
  observer.observe(document.documentElement, { childList: true, subtree: true })
  return () => observer.disconnect()
}
