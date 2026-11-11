/**
 * agent-tools/batch-gate-report.mjs — 报面组装（批档门三族之一）。
 *
 * 一族一件事：**强制集 ∥ 明示集 ∥ 读数行 → 首行 ∥ 拒串 ∥ 回执行**。它不组装命中行（那一族住
 * `thincoder-core/agent-tools/batch-gate-hit.mjs`），也不判谁该阻断（那一族住
 * `thincoder-core/agent-tools/batch-gate-judge.mjs`）；编排与范围解析留在 `thincoder-core/agent-tools/batch-gate.mjs`。
 *
 * 判据口径单源（D2——本档只实现，不重述）：`docs/core/design/BATCH-RECORD.md` §4.9 门 ④（回执与拒面的形）∥
 * §4.22（拒文四件 · 处置块按命中类分形）；处置面字面单源 = 引擎导出的 `PARA_DISPOSE`，本档零字面副本。
 */
import { PARA_DISPOSE } from "../doc-check/index.mjs"

import { ANCHOR_CLASSES } from "./batch-gate-hit.mjs"

/** 批档档头骨架行的「一段一作者」映射（`batch` create 落骨架时写入）——取不到 ⇒ 空表。 */
export function authorMapOf(src) {
  const map = new Map()
  for (const line of String(src ?? "").split("\n")) {
    if (!line.includes("一段一作者")) continue
    for (const m of line.matchAll(/§\s*(\d+)\s*[^（(]*[（(]([^）)]+)[）)]/g)) {
      const n = Number(m[1])
      if (!map.has(n)) map.set(n, m[2].trim())
    }
  }
  return map
}

/** 行号 → 所属段号（`## §N` 段头分段；首个段头之前 ⇒ null）。 */
function sectionOfLine(src, line) {
  const lines = String(src ?? "").split("\n")
  const end = Math.min(line, lines.length)
  let cur = null
  for (let i = 0; i < end; i++) {
    const m = /^## §(\d+)(?=\s|$)/.exec(lines[i])
    if (m) cur = Number(m[1])
  }
  return cur
}

/** 命中行落在批档内时的归属标注：` §N（作者：<角色>）`；作者取不到 ⇒ 只出 ` §N`（不猜）。 */
export function attributionOf(src, line, authors) {
  const seg = sectionOfLine(src, line)
  if (seg === null) return ""
  const who = authors.get(seg)
  return who ? ` §${seg}（作者：${who}）` : ` §${seg}`
}

/** 命中集按类分列（`锚 A 条 · P 处<类名>`）——引擎报面行形不动，只在这里做计数。 */
export function classifyCounts(entries) {
  const parts = []
  const anchor = entries.filter((e) => ANCHOR_CLASSES.has(e.clazz)).length
  if (anchor) parts.push(`锚 ${anchor} 条`)
  const byClass = new Map()
  for (const e of entries) if (!ANCHOR_CLASSES.has(e.clazz)) byClass.set(e.clazz, (byClass.get(e.clazz) ?? 0) + 1)
  for (const [clazz, n] of byClass) parts.push(`${n} 处${clazz}`)
  return parts.join(" · ")
}

/** 报面组装：首行 verdict + 强制集命中行 + 存量命中行 + 附注行 + 处置块（只跟段命中走——仅锚 ∥ 仅行命中不得叫人对段落动手；
 *  字面单源 = 引擎导出的 `PARA_DISPOSE`，本档零字面副本）。明示集 = 不属本次改动区的命中（收口面纯删映射重分类的那批 ∥
 *  写段面区外存量）——它们是读数不是判决，因此只明示、不阻交付。 */
export function composeReport({ first, forcedLines, disclosedLines, notes, disposePara }) {
  const out = [first, ...forcedLines]
  if (disclosedLines.length) {
    out.push("—— 区外存量命中（不属本次改动区，只读数、不阻交付；整档读数）：", ...disclosedLines)
  }
  out.push(...notes)
  if (disposePara) out.push(...PARA_DISPOSE)
  return out.join("\n")
}

/** 空范围返回形（`range` 恒在场——回执要读 `范围 N 档`）。 */
export const emptyRange = (basis) => ({ count: 0, k: 0, basis })
export const errorState = (first, range = emptyRange("none")) => ({ state: "error", first, report: first, hitLines: [], noteLines: [], disposePara: false, range })

/** 成功回执行（append / close / status 三面同形；`null` 门 ⇒ 零改——非挂门路径回执逐字旧形）。
 *  两件 = verdict + `范围 N 档` 事实行；附注行（「基 sha 未定」∥ 命中行与引擎报面不同序 ∥ 指针读数 ∥ 存量读数）紧随其后
 *  **逐字**列出——不静默吞掉可见性。 */
export function gateReceiptLine(gate) {
  if (!gate) return ""
  if (gate.state === "not-applicable") return "\n[doc-check gate] 未跑（本项目无声明面）"
  const head = `\n[doc-check gate] ${gate.first} · 范围 ${gate.range?.count ?? 0} 档`
  return [head, ...(gate.noteLines ?? []).map((l) => `\n${l}`)].join("")
}

/**
 * 拒绝串（throw 载荷；两机械点同源措辞）：`batch:` 前缀 + verdict 首行 + 逐条 `✗` 行 + 附注行 + 处置面。
 * **处置面按命中类分形**（本批裁定）：
 *   · 段命中 ⇒ **空行 + 五行处置块**（字面单源 = 引擎的 `PARA_DISPOSE`）。块末行逐字就是「同轮修正后复跑；不转台账」，
 *     故旧尾句那一截删去——留着就是两句「处置：」+ 一句重复；收尾的裁决指引与「Nothing was written」两句不重复，随原因面照出。
 *   · 仅锚 ∥ 仅行命中 ⇒ **照旧一句**（那五条出路是给「段」的，对错误的面对动手比不给方向更贵）。
 * ① 写盘面两路（`append` 段尾 ∥ `edit` 段内区间）同路既有句「失败 ⇒ 勿 close」（字面同 append 既有拒因，不新造措辞）。
 */
export function gateRefusalMessage(gate, action = "append") {
  const writeFace = action === "append" || action === "edit" // 写盘面两路：段尾追加 ∥ 段内区间改写
  const lead = action === "edit"
    ? "batch: 文档机检门拒写（doc-check gate · 结构兜底 ①）—— 本次段内就地改未落盘，档字节不变。"
    : writeFace
      ? "batch: 文档机检门拒写（doc-check gate · 结构兜底 ①）—— 本次段写入未落盘，档字节不变。"
      : `batch: 文档机检门拒收口（doc-check gate · 结构兜底 ②）—— ${action === "close" ? "close" : "status → 已收口"} 被拒绝，§1 状态行字节不变。`
  const detail = gate.state === "error" ? String(gate.report ?? "").split("\n").slice(1) : gate.hitLines
  const routing = "拿不准 ⇒ 上抛主 agent 裁决（主 agent 拿不准 ⇒ 转呈用户）。"
  // 尾句按动作取形：`edit` 拒后段里本就有内容，劝「勿 close」把两件事说成一件（那句防的是收口冻结一个空段）。
  const noBytes = writeFace
    ? action === "edit"
      ? "Nothing was written — the target range and every other byte of the record are unchanged."
      : "Nothing was written. Do NOT close the record after a refused append — nothing landed, and closing freezes the missing section for good (失败 ⇒ 勿 close)."
    : "Nothing was written."
  const head = [lead, gate.first, ...(detail ?? []), ...(gate.noteLines ?? [])]
  // 段命中：原因面 + 空行 + 五行块（处置面 = 块，不再另起一句「处置：同轮修正后复跑…」）
  if (gate.disposePara) return [...head, `${routing}${noBytes}`, "", ...PARA_DISPOSE].join("\n")
  return [...head, `处置：同轮修正后复跑（改文档 ∥ 修引擎）；不转台账；${routing}${noBytes}`].join("\n")
}
