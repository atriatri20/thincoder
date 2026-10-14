/**
 * tabs.mjs — 控制台公共标签页组件（webui/TABS.md §2.1——KD-SV-102；console-tabs-component 批）：一页多面时以页签切换。
 *
 * API：`createTabs(ctx, { tabs, initial, onChange })` ⇒ 句柄 `{ root, active() }`。
 *   `tabs` = `[{ id, labelKey, build }]`：`id` = 稳定标识（页内唯一——DOM 标识与地址栏子段）；`labelKey` = 文案表键
 *   （经 `t()` 取——组件零自持文案）；`build` = 面板构建函数（返回节点——**首激活调用一次**，结果缓存，重切不重建）。
 *   `initial` = 初始激活 id（不在集内 ∥ 缺省 ⇒ 首项——非法外部值静默回落）；`onChange(id)` = 每次激活变更回调
 *   （激活未变 ⇒ 零回调）。
 * DOM 形：`.tabs`（容器）> `.tab-list[role=tablist]`（页签钮 `button.tab[role=tab]`——`type=button`）＋每页签一节
 *   `.tab-panel[role=tabpanel]`（非激活 `hidden`；**建后保活**——面板内状态/滚动不丢）。
 * ARIA/键盘：`aria-selected` ∥ `aria-controls`/`aria-labelledby` 成对（DOM 标识 = 模块内自增序号前缀——多实例唯一）；
 *   roving tabindex（激活页签 `0`、余 `-1`）；`←`/`→` = 循环切换 ∥ `Home`/`End` = 首/末（焦点随激活）；点按 = 激活（同链）。
 * 组件零涉路由（**零读零写 hash**——地址栏径 = 消费面经 `initial` + `onChange` 接线）；零依赖零构建（仅取 `t`——KD-SV-9 不破）。
 * 可测性：模块顶层零浏览器全局（node 可 import——API 形断言）；DOM 仅 `createTabs` 内（沿 `modal.mjs` 口径）。
 */
import { t } from "./i18n.mjs"

/** 实例序号（DOM 标识前缀——多实例唯一；模块级自增，模块顶层零浏览器全局）。 */
let instanceSeq = 0

/** 建标签页：返回句柄 `{ root, active() }`（`active()` = 当刻激活 id）。 */
export function createTabs(ctx, { tabs = [], initial = null, onChange = null } = {}) {
  const { h } = ctx
  const uid = `tabs-${(instanceSeq += 1)}`
  const items = [...tabs]
  const slots = new Map() // id ⇒ { button, panel }
  const built = new Set() // 已建 id（首激活一次——结果缓存，重切不重建）
  let activeId = items.some((tab) => tab.id === initial) ? initial : (items[0]?.id ?? null)

  const list = h("div", { class: "tab-list", role: "tablist" })
  for (const tab of items) {
    const button = h("button", {
      type: "button", class: "tab", role: "tab", id: `${uid}-tab-${tab.id}`,
      "aria-controls": `${uid}-panel-${tab.id}`, tabindex: "-1", text: t(tab.labelKey),
      onclick: () => activate(tab.id),
    })
    button.addEventListener("keydown", (event) => onKeydown(event, tab.id))
    const panel = h("div", { class: "tab-panel", role: "tabpanel", id: `${uid}-panel-${tab.id}`, "aria-labelledby": `${uid}-tab-${tab.id}`, hidden: true })
    slots.set(tab.id, { button, panel })
    list.append(button)
  }
  const root = h("div", { class: "tabs" }, list, ...items.map((tab) => slots.get(tab.id).panel))

  /** 首激活建（一次）：`build()` 返回节点 ⇒ 入面板；空返回 ⇒ 零动作。 */
  function ensure(id) {
    if (id === null || built.has(id)) return
    built.add(id)
    const node = items.find((tab) => tab.id === id)?.build()
    if (node !== null && node !== undefined && node !== false) slots.get(id).panel.append(node)
  }

  /** 选中态同拍（闭包单源 `activeId`——类/`aria-selected`/roving tabindex/`hidden` 四项一处收口）。 */
  function sync() {
    for (const tab of items) {
      const { button, panel } = slots.get(tab.id)
      const on = tab.id === activeId
      button.className = on ? "tab active" : "tab"
      button.setAttribute("aria-selected", on ? "true" : "false")
      button.setAttribute("tabindex", on ? "0" : "-1")
      panel.hidden = !on
    }
    ensure(activeId)
  }

  /** 激活（未变 ⇒ 零动作零回调；`focus` = 焦点随激活——键盘径）。 */
  function activate(id, { focus = false } = {}) {
    if (!slots.has(id) || id === activeId) return
    activeId = id
    sync()
    if (focus) slots.get(id).button.focus()
    if (onChange !== null) onChange(id)
  }

  /** 键盘：`←`/`→` 循环 ∥ `Home`/`End` 首末（焦点随激活）。 */
  function onKeydown(event, id) {
    const index = items.findIndex((tab) => tab.id === id)
    let next = null
    if (event.key === "ArrowLeft") next = items[(index - 1 + items.length) % items.length]
    else if (event.key === "ArrowRight") next = items[(index + 1) % items.length]
    else if (event.key === "Home") next = items[0]
    else if (event.key === "End") next = items[items.length - 1]
    if (next === null || next === undefined) return
    event.preventDefault()
    activate(next.id, { focus: true })
  }

  sync() // 初态同拍（含首项面板建——初始激活即首激活）
  return { root, active: () => activeId }
}
