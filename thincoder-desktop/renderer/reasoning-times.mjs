/**
 * reasoning-times.mjs — 思考摘要回写（耗时 + 流式走马灯 + 边界自动收起）（Codex 形大改批 · 2026-10-04；
 * 走马灯 = ZCode `ai-elements/reasoning.tsx` `ReasoningTrigger` 同构 —— 折叠态摘要携带思考最新一行，
 * 单行 ∕ 边缘渐隐 ∕ 视口恒滚到最新；源参照用户点单）：
 * ① 耗时：端点 = 建块 `startedAt`（`events-blocks.mjs` 三径 —— `reduce` 帧时刻），建节点投影 `data-started`
 *    （`chat-tree.mjs` ∕ `chat-text.mjs`）；本档补**增量挂载径**的缝（`chat.mjs` `mountItem` 只建新块，
 *    前序推理块摘要不随后继到达重算）：扫 `.block-reasoning:not([data-done])` ⇒ 紧邻后继 `data-started`
 *    计秒差（显示下限 1s）⇒ `data-done` + 摘要「已思考 Ns」。全量重建径零依赖（`reasoningNode` 构树期已携）。
 * ② 走马灯（ZCode `resolveReasoningStreamingSummary` 同口径 = 思考原文**最后一个非空行**）：
 *    流式 ∧ 折叠 ⇒ 摘要追加 `.reasoning-ticker`（源文本读 `[data-raw]` 属性 —— 免大节点 textContent 全量读），
 *    行变才写 ∕ 视口 `scrollLeft = scrollWidth` 恒滚最新；展开态不显示（ZCode 同口径）。完成 ⇒ 摘除。
 * 纪律：MutationObserver（300ms 去抖 —— 流式 chunk 高频）；查询缺席 ⇒ 空转；零 `node:` ∕ 零裸包。
 */
import { t } from "./i18n.mjs"

/** 思考原文最后一非空行（ZCode `resolveReasoningStreamingSummary` 同判据）。 */
function lastNonEmptyLine(text) {
  const lines = String(text ?? "").replace(/\r\n?/gu, "\n").split("\n")
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    const line = lines[index]?.trim() ?? ""
    if (line !== "") return line
  }
  return ""
}

/** toggle 追踪绑定（幂等 · ZCode `userInteractedRef` 同义）：程序态翻转 = `dataset.autoT` 预标记（见写径）；
 *  toggle 事件不带 autoT ⇒ **用户手动翻动** —— 展开时记 `userOpen`（边界收起豁免），收起时记 0（顺手归位）。 */
function bindToggle(details) {
  if (details.dataset.toggleBound === "1") return
  details.dataset.toggleBound = "1"
  details.addEventListener("toggle", () => {
    if (details.dataset.autoT === "1") {
      delete details.dataset.autoT
      return
    }
    if (details.open) details.dataset.userOpen = "1"
    else details.dataset.userOpen = "0"
  })
}

/** 单轮回写：① 折叠流式 ⇒ 走马灯（行变才写）；② 紧邻后继端点 ⇒ 已思考 Ns + **边界自动收起**。 */
function sweepBlock(block) {
  const summary = block.querySelector(".reasoning-summary")
  const details = block.querySelector(".reasoning-block")
  if (summary === null) return
  bindToggle(details)

  const closed = details === null || !details.open

  if (closed) {
    const raw = block.querySelector("[data-raw]")?.getAttribute("data-raw") ?? ""
    const line = lastNonEmptyLine(raw)
    let ticker = summary.querySelector(".reasoning-ticker")
    if (line === "") {
      ticker?.remove()
    } else {
      if (ticker === null) {
        ticker = document.createElement("span")
        ticker.className = "reasoning-ticker"
        const viewport = document.createElement("span")
        viewport.className = "reasoning-ticker-viewport"
        const inner = document.createElement("span")
        inner.className = "reasoning-ticker-inner"
        viewport.append(inner)
        ticker.append(viewport)
        summary.append(ticker)
      }
      const viewport = ticker.firstElementChild
      const inner = viewport.firstElementChild
      if (inner.textContent !== line) {
        inner.textContent = line
        viewport.scrollLeft = viewport.scrollWidth // 恒滚最新（ZCode `scrollReasoningSummaryToEnd` 同径）
      }
    }
  }

  const start = Number(block.getAttribute("data-started"))
  if (!Number.isFinite(start)) {
    // 旧会话完结块（无时刻面 —— 本批前落盘）：不假造时长，摘要改「已思考」〔有后继 = 已完结〕。
    if (block.nextElementSibling !== null) {
      block.setAttribute("data-done", "")
      summary.textContent = t("reasoning.doneUnknown")
      collapseAtBoundary(details)
    }
    return
  }
  const sib = block.nextElementSibling
  if (sib === null) return // 尾块在途（后继块未到）—— 保持「思考中」+ 走马灯
  const end = Number(sib.getAttribute("data-started"))
  if (!Number.isFinite(end) || end <= start) return
  const secs = Math.max(1, Math.round((end - start) / 1000)) // 显示下限 1s（同 `chat-tree.mjs` 投影口径）
  block.setAttribute("data-done", "")
  summary.textContent = t("reasoning.done", { n: secs }) // 整体改写 —— 走马灯随 textContent 清除一并摘除
  collapseAtBoundary(details)
}

/** 边界自动收起（ZCode `shouldAutoCollapseReasoning` 同义 —— 流式→完成边界默认收起）：
 *  **用户手动展开过的块豁免**（`dataset.userOpen` —— toggle 判据面）；程序态翻转预标 `autoT`
 *  （只在确将变化时预标 —— 已收起块零写，免 autoT 空挂吞掉下次用户 toggle）。 */
function collapseAtBoundary(details) {
  if (details === null || details.dataset.userOpen === "1") return
  if (details.open) {
    details.dataset.autoT = "1"
    details.open = false
  }
}

/** 全流扫（幂等）：done 位 ∕ 走马灯 ∕ 摘要词三写。 */
function sweep(root) {
  for (const block of root.querySelectorAll(".block-reasoning:not([data-done])")) {
    sweepBlock(block)
  }
}

/** 装配（一次性 —— `renderer/app.mjs` 消费）：流观察（childList+subtree ∷ attributes[data-raw] · 300ms 去抖）+ 首扫。 */
export function attachReasoningTimes() {
  const flow = document.querySelector('[data-slot="flow"]')
  if (flow === null) return { sweep: () => {} }
  let timer = 0
  new MutationObserver(() => {
    if (timer !== 0) return
    timer = setTimeout(() => {
      timer = 0
      sweep(flow)
    }, 300)
  }).observe(flow, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-raw", "data-started"] })
  sweep(flow)
  return { sweep: () => sweep(flow) }
}
