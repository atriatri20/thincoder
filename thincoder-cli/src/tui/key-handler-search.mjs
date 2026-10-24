/** Perform search on state.lines, update state.search.matches and clamp index
 *  TUI-OOM-ROOTCAUSE（TUI-SESSION-VIEW.md §5.1 SEARCH_MATCH_CAP）：匹配计数上限——超限截断 +
 *  `state.search.capped` 提示标志（渲染面提示行；次要无界面）。
 */
import { SEARCH_MATCH_CAP } from "./display-budget.mjs"
// 掩码族让位判据单源 = ask-steps.mjs（#1437 迁入：键路由 ∥ 显示面两用同引）
import { maskSurfacePresent } from "./ask-steps.mjs"

export function performSearch(state) {
  if (!state.search) return
  const query = state.search.query.toLowerCase()
  state.search.matches = []
  state.search.capped = false
  // Clear old highlights
  state.lines.forEach(l => delete l._searchMatches)

  if (!query) { state.search.index = 0; return }

  state.lines.forEach((line, lineIndex) => {
    if (state.search.matches.length >= SEARCH_MATCH_CAP) { state.search.capped = true; return }
    const text = (line.text || "").toLowerCase()
    let charIndex = text.indexOf(query)
    if (charIndex !== -1) {
      line._searchMatches = []
    }
    while (charIndex !== -1) {
      if (state.search.matches.length >= SEARCH_MATCH_CAP) { state.search.capped = true; break }
      state.search.matches.push({ lineIndex, charIndex })
      line._searchMatches.push(charIndex)
      charIndex = text.indexOf(query, charIndex + 1)
    }
  })

  if (state.search.matches.length === 0) {
    state.search.index = 0
  } else {
    state.search.index = Math.min(state.search.index, state.search.matches.length - 1)
  }
}

/** Estimate scroll position to make a line visible (simplified) */
export function scrollToMatch(state, lineIndex) {
  if (lineIndex == null) return
  // Rough estimate: each state.line takes 1-2 rendered lines
  let estimatedLine = 0
  for (let i = 0; i < lineIndex && i < state.lines.length; i++) {
    estimatedLine += Math.max(1, Math.ceil((state.lines[i].text?.length || 0) / 80))
  }
  const rows = (state.dims?.get() ?? {}).rows ?? (process.stdout.rows || 24)
  const visibleH = Math.max(5, rows - 10) // reserve space for header, input, status, etc.
  // scroll is number of lines hidden above viewport
  // We want estimatedLine to be near the bottom of the viewport
  state.scroll = Math.max(0, state.lines.length - estimatedLine - visibleH + 3)
}

/** Handle search-mode keyboard events.
 *  Returns true if the key was consumed (search mode handled it).
 *  Call before other handlers so search mode has priority. */
export function handleSearchKey(str, key, state, render) {
  // 反交错明文口（2026-10-14 · SSH 凭据窗批 fix 轮）：掩码族在场 ⇒ 搜索层整体让位——键一律走
  // 掩码层（含「搜索已开 → 凭据窗弹出」交错：否则键入旁路到 `state.search.query` 明文回显）。
  // #1437：同判据兼管显示面（键归谁、面显谁——判据单源 = ask-steps.mjs `maskSurfacePresent`）。
  // 返回 false 使键按无搜索态照常下行（掩码面吞面 ∥ 可打印键落编辑族 = 掩码层收字）；
  // 搜索态原地保留——掩码退场即恢复（query 不清、匹配不清）。
  if (maskSurfacePresent(state)) return false

  // Ctrl+F toggles search mode ON——权限 / 提问模态在场时不入场（模态独占按键——搜索框可开不可用）；
  // 掩码族在场时由上行让位守卫统管（Ctrl+F 同不入场）。
  if (key.ctrl && key.name === "f" && !state.permission && !state.question) {
    if (!state.search) {
      state.search = { query: "", matches: [], index: 0 }
    }
    render()
    return true
  }

  if (!state.search) return false

  if (key.name === "escape" || (key.ctrl && key.name === "c")) {
    state.search = null
    render()
    return true
  }
  // Navigation requires Ctrl — bare n/p are query characters (regression fix: bare n/p
  // used to hijack typing, making it impossible to type those letters into the query)
  if ((key.ctrl && key.name === "n") || (key.ctrl && key.name === "g")) {
    // Next match
    if (state.search.matches.length > 0) {
      state.search.index = (state.search.index + 1) % state.search.matches.length
      scrollToMatch(state, state.search.matches[state.search.index].lineIndex)
    }
    render()
    return true
  }
  if ((key.ctrl && key.name === "p") || (key.ctrl && key.name === "r")) {
    // Previous match
    if (state.search.matches.length > 0) {
      state.search.index = (state.search.index - 1 + state.search.matches.length) % state.search.matches.length
      scrollToMatch(state, state.search.matches[state.search.index].lineIndex)
    }
    render()
    return true
  }
  if (key.name === "return") {
    // Exit search mode but keep highlighting until next Ctrl+F
    state.search = null
    render()
    return true
  }
  if (key.name === "backspace") {
    if (state.search.query.length > 0) {
      state.search.query = state.search.query.slice(0, -1)
      performSearch(state)
      render()
    }
    return true
  }
  // Regular character input
  if (str && str.length === 1 && !key.ctrl && !key.alt && !key.meta) {
    state.search.query += str
    performSearch(state)
    if (state.search.matches.length > 0) {
      scrollToMatch(state, state.search.matches[state.search.index].lineIndex)
    }
    render()
    return true
  }
  // Swallow every other key (arrows/Tab/Delete/…) — without this they fall through
  // to normal input handling and edit the HIDDEN state.input instead of the search box
  return true
}
