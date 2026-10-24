/**
 * views-me-chat-subs.mjs — 成员·对话页·子代理面（`webui/CHAT.md` §2.2 差异⑨；机制 = `agent/MEMBER-AGENT.md` §3.11(5) KD-SV-219）；
 * 自 `views-me-chat.mjs` 外拆（拆档缘由 = 该件越 500 软线——增行前先外拆；member-face-parity 批）——面内四族：
 * ① **`sub` 帧 ⇒ 核 `subblocks/*` 链**：`ev` 事件 token ⇒ 核 `relayEventToSubPatch` ⇒ `subBlocksReduce`；内容 ⇒ 核
 *    `relaySubContentChunk` ⇒ `renderSubagentChunk`；块装配 = 核 `renderSubBlock`（出生 ∕ 接管 ∥ 终态折叠 ∥ 归档 ∥ 排队取消）；
 * ② **效果表执行**（`born`/`takeover`/`fold`/`awaiting`/`archive`/`remove`/`refresh`——核件效果表逐条、`key → DOM` 于该条执行时解析）；
 *    出生位 = 活动区 `#subagent-activity` 区尾（页内），归档 = 入流尾追（`#messages`——到达序普通块，与桌面 `#765` 同规）；
 * ③ **停单个**：块 ⏹（核 `CANCELABLE_ROLES` 门）⇒ `deps.onAbortKey("<role>#<id>")`（页面 `POST …/abort { key }`）；
 * ④ **池读数**（状态行段 12）：`pool()` = `{ running, settled }`（非冻结块 ∥ `awaitingDigest` 驻留块）。
 * `connectedOf`/`regionOf` 注入 = 页内 DOM 事实（核 `state.mjs` 端接线注）；跨回合池态 = 端面约束（§9 R83）。
 */
import { t } from "./i18n.mjs"
import { renderSubBlock, renderSubDesc, renderSubagentChunk, initBlockFollow, maybeScrollBlock } from "/rc/subblocks/block.mjs"
import { refreshBlock } from "/rc/subblocks/activity-view.mjs"
import { ensureSubBlock, subBlocksReduce } from "/rc/subblocks/state.mjs"
import { createRelayScope, relayEventToSubPatch, relaySubContentChunk } from "/rc/subblocks/relay.mjs"

/**
 * 子代理面工厂。`ctx` = 视图上下文（`h`）；`deps` 四件：`thread()` ⇒ 归档目标（`.chat-thread` 尾追）· `onAbortKey(key)` ⇒ 停单件 ·
 * `onChanged()` ⇒ 块集变动回调（状态行段 12 读数）· `onFail(error)` ⇒ 就地人话。返回面：
 * `{ activity, handle(frame), reset(), pool(), blockOf(key) }`——`activity` = 活动区元素（页面挂 `#thread` 之后）。
 */
export function createSubAgentFace(ctx, deps = {}) {
  const { h } = ctx
  const activity = h("div", { id: "subagent-activity", class: "sub-activity", "aria-label": t("me.chat.subActivity") })
  const list = [] // 核 `subBlocks/*` 模型表（原地变更——与块 `_subMeta` 同一引用）
  const dom = new Map() // key ⇒ 块元素
  const scope = createRelayScope() // relay 事件态（pendingAsync / queued 缓存——端持有）
  let descShown = false // 说明行一次性（核 `renderSubDesc`——会话首个活动块）

  /** 在连判据（DOM 事实在端——核件头「端接线注意」；缺省视为在连）。 */
  const connectedOf = (model) => dom.get(model?.key)?.isConnected !== false
  const regionOf = (model) => (dom.get(model?.key)?.parentNode === activity ? "activity" : "flow")

  /** 建块（核构件 + 出生位 + 说明行 + 块级跟滚 + 挂后重刷——沿 VSC `activity.js` `buildBlockEl` 同序）。 */
  function buildBlockEl(model) {
    const block = renderSubBlock(model)
    if (descShown === false) {
      descShown = true
      const desc = renderSubDesc()
      block.insertBefore(desc, block.querySelector(".advisor-content"))
    }
    activity.append(block)
    initBlockFollow(block)
    refreshBlock(block) // 挂 DOM 后重刷（⏹ 门控读 `isConnected`——核首刷在挂载前）
    return block
  }

  /** 归档入流（幂等——已在流内 ⇒ 零动作）：尾追（到达序普通块；`atBoundary` 端无消化面 ⇒ 同径）。 */
  function archiveBlock(block) {
    if (block === null || block === undefined || block.parentNode === deps.thread?.()) return
    deps.thread?.()?.append(block)
  }

  /** 效果表按序逐条执行（`key → DOM` 于该条执行时解析——核件「执行序约定」）。 */
  function applyEffects(effects) {
    for (const effect of effects) {
      if (effect.type === "born" || effect.type === "takeover") {
        const model = list.find((item) => item.key === effect.key)
        if (model !== undefined && model !== null) dom.set(effect.key, buildBlockEl(model))
        continue
      }
      const block = dom.get(effect.key)
      if (block === undefined || block === null) continue
      if (effect.type === "fold") {
        block.classList.remove("sub-live")
        block.classList.add("sub-frozen")
        block.open = false
        block.querySelector(".sub-stop-btn")?.remove()
        refreshBlock(block)
      } else if (effect.type === "refresh" || effect.type === "awaiting") {
        refreshBlock(block)
      } else if (effect.type === "archive") {
        archiveBlock(block)
        if (effect.clearAwaiting === true) refreshBlock(block)
      } else if (effect.type === "remove") {
        block.remove() // queued 取消：从未启动——不冻结
        dom.delete(effect.key)
      }
    }
    deps.onChanged?.()
  }

  /** 状态 patch（核态机单源）：`subBlocksReduce` ⇒ 效果表。 */
  function reduce(patch) {
    const { effects } = subBlocksReduce(list, patch, { connectedOf, regionOf, now: () => Date.now() })
    applyEffects(effects)
  }

  /** `sub` 帧 ⇒ 两径：`ev` 事件 token ⇒ relay 映射；内容 chunk ⇒ 出生闸 + 块内追加（核件链）。 */
  function handle(frame) {
    const token = String(frame?.token ?? "")
    if (frame?.ev === true) {
      const patch = relayEventToSubPatch(token, scope, { syncLiveOf: () => false })
      if (patch !== null) reduce(patch)
      return
    }
    const face = String(frame?.face ?? "")
    const chunk = relaySubContentChunk(face, token, frame?.args ?? frame?.text ?? "")
    if (chunk === null) return
    const key = `sub:${chunk.role}#${chunk.id}`
    // 出生闸（内容面单源 = 核 `ensureSubBlock`）：无块 ⇒ 建块；已冻结 ∕ 墓碑 ⇒ 丢弃（迟来 chunk 不半复活）
    const gate = ensureSubBlock(list, key, { connectedOf, regionOf, now: () => Date.now() })
    applyEffects(gate.effects)
    if (gate.block === null) return
    const block = dom.get(key)
    if (block === undefined || block === null) return
    renderSubagentChunk(block, chunk)
    maybeScrollBlock(block)
  }

  /** 停单件（委托单点：活动区 ∥ 流内归档块 ⏹ 同门——核件 ⏹ 为块级 overlay，点不改折叠）。 */
  function onStopClick(event) {
    const target = event?.target
    const btn = typeof target?.closest === "function" ? target.closest(".sub-stop-btn") : null
    if (btn === null || btn === undefined) return
    event.preventDefault?.()
    event.stopPropagation?.()
    const key = `${btn.dataset?.subRole ?? ""}#${btn.dataset?.subId ?? ""}`
    if (key === "#") return
    void deps.onAbortKey?.(key)
  }
  activity.addEventListener("click", onStopClick)
  deps.thread?.()?.addEventListener("click", onStopClick)

  return {
    activity,
    handle,
    /** 子代理块头审批态（`MEMBER-AGENT.md` §3.11(5) 等待审批态——子代理门 `ask` 帧携 `owner` ⇒ 核块头写点）
     *  `owner` = relay token 头（`role#id`——`askFrame` `owner` = `parseRelayPath(name).head`）；`tool` 非空 = 置词 ∥ `null` = 清态；
     *  无块不建块（核态机自守）、终态由核件自清（`state.mjs` `meta.approval = null`）。 */
    approvalHead(owner, tool) {
      const head = String(owner ?? "")
      const hash = head.indexOf("#")
      const id = hash > 0 ? Number(head.slice(hash + 1)) : Number.NaN
      if (hash <= 0 || Number.isInteger(id) === false) return
      reduce({ status: "approval", role: head.slice(0, hash), id, tool: tool === null || tool === undefined ? null : String(tool) })
    },
    /** 会话切换复位（VSC `resetActivity` 语义）：区子树清 + 表清（流内归档块 = 会话历史，不动）。 */
    reset() {
      for (const block of dom.values()) if (block.parentNode === activity) block.remove()
      dom.clear()
      list.length = 0
      scope.pendingAsync.clear()
      scope.queued.clear()
      deps.onChanged?.()
    },
    /** 池读数（状态行段 12）：N = 非冻结块（running + queued）∥ M = `awaitingDigest` 驻留块。 */
    pool() {
      let running = 0
      let settled = 0
      for (const model of list) {
        if (model.frozen !== true) running += 1
        else if (model.awaitingDigest === true) settled += 1
      }
      return { running, settled }
    },
    blockOf: (key) => dom.get(key) ?? null,
    /** 块级跟滚（核 `maybeScrollBlock` 单源——流重渲器 `subScroll` 脏集回调；块离场 ⇒ 零动作）。 */
    followBlock: (block) => { if (block !== null && block !== undefined && block.parentNode !== null) maybeScrollBlock(block) },
  }
}
