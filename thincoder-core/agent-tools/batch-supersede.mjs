/**
 * agent-tools/batch-supersede.mjs — 第三条收口边：**被取代的收口**（`batch({action:"supersede"})`，2026-11-11）。
 *
 * 权威规格 = `docs/core/design/BATCH-RECORD.md` §4.18-D（机制判据单源；本档只实现，不重述口径）。
 * 要修的那一个死局：一份「设计在、实施没做、对象已消失」的批档两条收口路都走不了（正常收口要链门齐全，
 * 补关要行集全归档）⇒ 它名下已完成的 `待核销` 行永远结不掉。这条边靠一句人给的事实冻结它：**谁取代了它**。
 *
 * 这条边不许伪造的部分（用户 2026-11-11 11:54 的裁定，§1「这条边不许伪造的部分」）：冻结的记录**不许出现**
 * §3 评审结论 / §4 批准 / §6 验证这些从未发生过的东西；也**不许把这些段留成空白**了事——空白读起来像
 * 「还没来得及写」，而事实是「这批永远不会实施了」。故三条必带内容：① 谁取代了它（§1 追记行）② 它自己
 * 从未实施（§1 追记行逐字 `本批无实施记录（§5 未写）`）③ 行的去向（台账重锚事务）。
 *
 * 五条放行合取（每条都能拒）：D-1 §1 = `open` ∥ D-2 台账读得出 ∥ D-3 行集**未**全归档 ∥ D-4 §5 空 ∥
 * D-5 取代者解得出在盘落点且不指回本档。
 *
 * 保留门（「从未实施」不是「环节全免」）：本批批内单测档门、文档机检门、完成清单预检（`requireAllInFlight=false`
 * 那一支）、设计凭证消费、写序与失败补偿、`[ledger consistency]` 回执行——全部保留，只跳过链门的内容门与
 * `§3` 状态词臂（`assertCloseoutGates({ mode: "supersede" })`）。
 *
 * 依赖单向：`skeleton ← closeout ← ledger-view ← lifecycle ← 本档 ← batch.mjs`（本档 import lifecycle 的四个
 * 出口而不反向——lifecycle 不 import 本档，无环）。
 */
import { execFileSync } from "node:child_process"
import { readFileSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"

import { readBatchStatusLine, sectionContentState, updateSectionStatusLine } from "./batch-skeleton.mjs"
import { resolveBatchReadPath } from "./batch-paths.mjs"
import {
  assertCloseoutGates, consistencyReceiptLine, newDebtReasonReceiptLine, readCloseoutSource,
} from "./batch-closeout.mjs"
import { archivedStateOf, assertCloseDisposition, consistencyOf } from "./batch-ledger-view.mjs"
import {
  assertGateOpen, assertMainAgentOnly, consumeBatchDesignTokens, designTokensReceiptLine, ledgerAfterRecordWrite,
  reanchorOnClose,
} from "./batch-lifecycle.mjs"
import { appendLineToSection, todayLocal } from "./batch-reopen.mjs"
import { gateReceiptLine } from "./batch-gate.mjs"

// ─── 取代者的语法（§4.18-D「取代者的语法」三形——每形都有机读判据）────────────────────────

/** commit 形 = 40 位十六进制（design 逐字「40 位十六进制」）。短 sha 不在闭集里：三形是给出的语法，
 *  不是「看起来像哈希的都算」——解不出的形与没给的形要分别点名（R1 两种拒面）。 */
const COMMIT_RE = /^[0-9a-f]{40}$/i
/** 文档 + 节号形：`<文档路径> §<N[.M…]>`（节号 = `§` 后到空白前的数字段）。 */
const DOC_SECTION_RE = /^(.+?)\s*§\s*(\d+(?:\.\d+)*)$/

/** 路径同一性比较（win32 大小写不敏感——与 `batch-paths.mjs` 同口径）。 */
function samePath(a, b) {
  const norm = (p) => (process.platform === "win32" ? p.toLowerCase() : p)
  return norm(a) === norm(b)
}

/** commit 可达判据（§4.18-D 逐字「`git cat-file -e <sha>`」）：判的是**版本库可达**，不是文件在盘。
 *  `cwd` = 批档所在目录——版本库从那里上溯，即该批档所属的那个库（不借会话锚猜）。 */
function commitReachable(sha, nearDir) {
  try {
    execFileSync("git", ["cat-file", "-e", sha], { cwd: nearDir, stdio: "ignore" })
    return true
  } catch { return false }
}

/** 节号命中判据（§4.18-D 逐字「节号的数字段（`§` 后到空白前的 `N[.M…]`）在该档命中一个标题行（`^#{1,6}\s`）」）：
 *  标题行里须出现该号，且**号的两边都不是数字或点**（`11` 不命中 `11.2` 也不命中 `4.11`；`11.2` 不命中 `11.2.3`）——
 *  左侧那半与右侧同等重要：只卡右边时，`§3` 会命中 `## 13`，机器就替人写了一条并不存在的取代事实。 */
function headingMatchesNumber(abs, num) {
  let src = ""
  try { src = readFileSync(abs, "utf8") } catch { return false }
  const esc = num.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`(?<![0-9.])(?:§\\s*)?${esc}(?![0-9.])`)
  return src.split(/\r?\n/).some((line) => /^#{1,6}\s/.test(line) && re.test(line))
}

// ─── 五条拒面（语域同 `batch` 族：点名 + 下一步 + `Nothing was written.`）──────────────

/** D-5 / R1a：`supersededBy` 空白——机器不代写这条事实（§4.18-D「不存在就拒」）。 */
const successorMissingError = () => "batch: supersede refused (successor) — `supersededBy` is empty, and this closeout's whole basis is the fact of who replaced the work. The machine never invents it: name a batch record (`docs/batches/<x>.md`), a document plus a section (`docs/<area>/<name>.md §<N>`), or a commit (40 hex). Nothing was written."

/** D-5 / R1：形合法而解不到——拒文点名解不到的是哪一段（档案不在盘 ∥ 节号不命中 ∥ commit 不可达）。 */
const successorUnresolvedError = (piece, raw, hint) => `batch: supersede refused (successor unresolved) — the ${piece} of \`supersededBy\` does not resolve: ${raw}. ${hint} \`supersededBy\` must name a place that already did the same work — "not done yet" cannot be written as a successor (§4.18-D R1). Nothing was written.`

/** D-5 / R2：解析回本档自身——续命走重开，不是取代。 */
const successorSelfError = (raw) => `batch: supersede refused (self) — \`supersededBy\` resolves back to this very record (${raw}): a record cannot be the thing that replaced itself. Keeping it alive is the reopen path (§4.18-B): \`status\` §1 → 进行中 with a note. Nothing was written.`

/** D-3 / R3：行集全归档——补关本来就免费覆盖它，指回另一条路。 */
const allArchivedError = () => "batch: supersede refused (ledger supersede) — every ledger row of this record is already archived (已核销 / 已废弃), so freezing it belongs to the closeout path that already covers it. Use `close` (all-archived records take the repair path, §4.18-C): it freezes the same record without claiming a successor. Nothing was written."

/** D-4 / R4：§5 有内容 = 确实实施过——「本批无实施记录」即为假话。 */
const implementedError = () => "batch: supersede refused (implemented record) — §5 carries content, so this batch was actually implemented: the successor record would have to say 「本批无实施记录（§5 未写）」, which is false on its face. If the work is done, complete the chain and `close` it; if it is unfinished, reopen it (§4.18-B) and return its rows to 待讨论 with a reason. Nothing was written."

// ─── 取代者解析（D-5）────────────────────────────────────────────────────────────

/**
 * `supersededBy` → 三形之一 + 逐字原值（落 §1 追记行的那一段）。
 * 批档路径形与文档 + 节号形都走**批档同一解析器**（`resolveBatchReadPath`——不另造解析序）；
 * commit 形的判据是版本库可达。三支解不到各自点名（R1），解回本档自身 ⇒ R2。
 * @param {string} cwd — 会话锚（路径解析的候选起点）
 * @param {unknown} raw — 参数原值
 * @param {string} selfAbs — 本批批档绝对路径（R2 的比较对象）
 * @returns {{form:"record"|"document"|"commit", label:string, abs:string|null}}
 */
export function resolveSupersededBy(cwd, raw, selfAbs) {
  const text = typeof raw === "string" ? raw.trim() : ""
  if (!text) throw new Error(successorMissingError())
  if (COMMIT_RE.test(text)) {
    if (!commitReachable(text, dirname(selfAbs))) {
      throw new Error(successorUnresolvedError("commit", text, "The version store cannot reach it (`git cat-file -e` refused)."))
    }
    return { form: "commit", label: text, abs: null }
  }
  const docSection = DOC_SECTION_RE.exec(text)
  if (docSection) {
    const docRaw = docSection[1].trim(), num = docSection[2]
    const abs = resolveBatchReadPath(cwd, docRaw)
    if (!abs) throw new Error(successorUnresolvedError("document", docRaw, "No readable file resolves from that path."))
    if (!headingMatchesNumber(abs, num)) {
      throw new Error(successorUnresolvedError("section", `§${num} of ${docRaw}`, "The document is on disk but no heading line carries that number."))
    }
    if (samePath(abs, selfAbs)) throw new Error(successorSelfError(text))
    return { form: "document", label: text, abs }
  }
  const abs = resolveBatchReadPath(cwd, text)
  if (!abs) throw new Error(successorUnresolvedError("path", text, "No readable batch record resolves from that path."))
  if (samePath(abs, selfAbs)) throw new Error(successorSelfError(text))
  return { form: "record", label: text, abs }
}

// ─── 档面两处落笔（§1 追记行 + 回执段）──────────────────────────────────────────────

/**
 * §1 段尾追记行（逐字 = `docs/core/design/BATCH-RECORD.md` §4.18-D「§1 追记行」）：
 * 三条必带内容里前两条在这一行上（谁取代了它 ∥ 它自己从未实施），第三条在台账重锚事务里。
 * 载体 = `appendLineToSection`（与补关 / 重开同一条：一次写盘两处落笔、只追加不改写）。
 * 为什么不能只靠瞬时回执：§3 / §4 / §6 空着、状态行又已冻结，不落一行，下一位读者就看不出这个档为何能冻结。
 * @param {string} date — 本地日期（与状态行同一枚）
 * @param {string} successor — `supersededBy` 原值
 * @param {{settled:number, conditioned:number}} counts — 结算行数 / 改挂条件行数（写盘前从同一份读数算出）
 */
export const supersedeTraceLine = (date, successor, counts) => `**取代记录**：${date} · 由 ${successor} 取代 · 本批无实施记录（§5 未写）· §3/§4/§6 未补写 · 结算 ${counts.settled} 行 · 改挂条件 ${counts.conditioned} 行 · 操作者 = 主 agent`

/**
 * 回执段 `[ledger supersede]`（§4.18-D「回执另出 `[ledger supersede]` 一段，逐行点名结算与改挂」）：
 * 结算行沿用收口的两种起点写法（`在途 → 待核销 → 已核销` ∥ ` 待核销 → 已核销`），退回边另起一句——
 * 退回不是结算，报成一笔会把「没做完」写成「做完了」。
 * **两个计数与档面同一源**（`settledCount` / `conditionedCount` 由调用方传写前那份读数）：档已冻结、
 * 回执是瞬时面，两者对同一笔收口说不同的数，账就对不上；逐行明细仍取事务回执（那是实际落账的行）。
 * @param {{successor:string, date:string, settled?:Array, retreated?:Array, conditioned?:Array,
 *   settledCount?:number, conditionedCount?:number}|null} result
 */
export function supersedeReceiptLine(result) {
  if (!result) return ""
  const face = (r) => `#${r.id} 「${r.title}」`
  const settled = result.settled ?? []
  const retreated = result.retreated ?? []
  const conditioned = result.conditioned ?? []
  const lines = [
    `\n[ledger supersede] 被取代收口：由 ${result.successor} 取代 · 结算 ${result.settledCount ?? settled.length} 行 · 改挂条件 ${result.conditionedCount ?? 0} 行 · 本批无实施记录（§5 未写）· §3/§4/§6 未补写 · §1 段尾已追加一行 取代记录（${result.date}）`,
  ]
  for (const r of settled) {
    lines.push(`\n[ledger supersede] ${face(r)} ${r.from === "在途" ? "在途 → 待核销 → 已核销" : "待核销 → 已核销"}`)
  }
  if (retreated.length) {
    lines.push(`\n[ledger supersede] 未点名的在途行 → 待讨论 + 条件 ${retreated.length} 行：${retreated.map(face).join("；")}` +
      " —— 已清 task_book / executor，续启句已落，由下一批接手")
  }
  if (conditioned.length) {
    lines.push(`\n[ledger supersede] 本批未动行 → 条件 ${conditioned.length} 行：${conditioned.map(face).join("；")}`)
  }
  return lines.join("")
}

// ─── 动作本体 ───────────────────────────────────────────────────────────────────

/**
 * 写盘**之前**从同一份台账读数算出的两格计数（§1 追记行的 `结算 N 行` / `改挂条件 M 行`）。
 * 为什么要预读：写序是「档先写、台账后写」，而追记行随档一起落——台账事务的逐行回执那时还没有。
 * 判据与 `ledgerReanchorBatch` 同一条（`待核销` 恒结清；`在途` 点名的结清、未点名的退回；
 * 等待态里 `条件` / `认账不排期` 不算改挂），不另立一条统计口径。
 */
function supersedeCountsOf(rows, completed) {
  const named = new Set(Array.isArray(completed) ? completed : [])
  const settled = rows.filter((r) => r.status === "待核销" || (r.status === "在途" && named.has(Number(r.id)))).length
  const retreated = rows.filter((r) => r.status === "在途" && !named.has(Number(r.id))).length
  const conditioned = rows.filter((r) =>
    (r.status === "待讨论" || r.status === "待设计") && r.trigger !== "条件" && r.trigger !== "认账不排期").length
  return { settled, conditioned: retreated + conditioned }
}

/**
 * `supersede`——被取代的收口（§4.18-D，仅 depth-0，与 `close` 同一身份门）。
 * 判序 = D-1 §1 状态 → D-2/D-3 归档态读数 → D-4 §5 空 → D-5 取代者 → 保留门（单测档门 + 文档机检门）
 * → 完成清单预检（`requireAllInFlight=false`）→ 凭证消费 → 档写盘（状态行 + §1 追记行，一次写盘两处落笔）
 * → 台账重锚事务（未点名的在途行走退回边）→ 台账失败则用写前全文回滚档并抛拒。
 * @param {{args:object, ctx:object, review:boolean, pickTarget:Function, onWritten?:Function}} o
 * @returns {Promise<string>} 成功回执
 */
export async function supersedeBatchRecord({ args, ctx, review, pickTarget, onWritten }) {
  assertMainAgentOnly(ctx, "supersede", review) // 与 close 同一身份门（depth-0 only）
  const cwd = ctx?.agent?.cwd
  const abs = pickTarget(args?.path)
  const src = readCloseoutSource(abs)
  // D-1：§1 必须 open。非 open 由既有冻结门早拒（串逐字不变——同一函数，不复制文案）。
  if (readBatchStatusLine(src) !== "open") assertGateOpen(src)
  const completed = args?.completed === undefined ? [] : args.completed
  // D-2 ∥ D-3：归档态读数（读不出 ⇒ 拒，不降级放行）；行集全归档 ⇒ 拒并指回 close / 补关。
  const archived = await archivedStateOf(abs, cwd)
  if (archived.allArchived) throw new Error(allArchivedError())
  // D-4：§5 空（有内容 = 确实实施过）
  if (sectionContentState(src, 5) !== "empty") throw new Error(implementedError())
  // D-5：取代者三形（解不到 ⇒ 拒；解析回本档 ⇒ 拒，走重开径）
  const successor = resolveSupersededBy(cwd, args?.supersededBy, abs)
  // 保留门：只跳过链内容门与 §3 状态词臂（本批批内单测档门 ∥ 文档机检门照跑）
  const gate = assertCloseoutGates({ abs, cwd, agent: ctx?.agent ?? {}, src, action: "close", mode: "supersede" })
  // 完成清单预检：本路传 false——未点名的在途行走退回边，故「漏列在途行」那一臂不触发；
  // closeEvidence 这一格不随结算行数放宽（同一判据在三条路上不能两套）。
  await assertCloseDisposition(abs, cwd, completed, args?.closeEvidence, false)
  const designTokens = consumeBatchDesignTokens(ctx?.agent ?? {}, abs)
  const date = todayLocal()
  const counts = supersedeCountsOf(archived.rows, completed)
  // 一次写盘、两处落笔：状态行 → `已收口 <日期>（被取代）`（仍读作 closed——冻结真值的读取器只有一枚），
  // 再加 §1 段尾追记行。§3 / §4 / §6 一个字节不动（本路不补写它们）。
  const statusWritten = updateSectionStatusLine(src, 1, `已收口 ${date}（被取代）`)
  writeFileSync(abs, appendLineToSection(statusWritten, 1, supersedeTraceLine(date, successor.label, counts)))
  // 记账口径同 close 径（记「落过盘」，回档不回退）——见 `batch-lifecycle.mjs` 写盘处的注释。
  if (ctx?.agent) ctx.agent._batchWrites = (ctx.agent._batchWrites ?? 0) + 1 // §6.6 `wrote` 判据（写盘成功才增）
  onWritten?.(ctx?.agent ?? {}, abs)
  // 写序：档先写、台账后写；台账失败 ⇒ 用写前全文回滚档并抛拒（与 close 同一单源）。
  const reanchor = await ledgerAfterRecordWrite({
    side: "close", abs, src, run: () => reanchorOnClose(abs, cwd, completed, args?.closeEvidence, false),
  })
  return `batch: §1 status line → 「已收口 ${date}（被取代）」 — the record is frozen as superseded: append is refused from now on, and status is refused except the reopen conjunction (§4.18-D). 本条未补写 §3 / §4 / §6 — 本批从未实施。${supersedeReceiptLine({ ...reanchor, successor: successor.label, date, settledCount: counts.settled, conditionedCount: counts.conditioned })}${gateReceiptLine(gate)}${designTokensReceiptLine(designTokens)}${newDebtReasonReceiptLine(reanchor)}${consistencyReceiptLine(await consistencyOf(abs, cwd))}`
}
