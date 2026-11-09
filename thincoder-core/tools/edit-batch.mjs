/**
 * edit-batch.mjs — edit 工具的数组形态（edits: [...]）：一次多档替换，**逐条成败、逐档落盘**。
 * （2026-08-31 工具顺手度 §9 ②；2026-09-01 缺陷修复"同文件多条串行累积"；
 * 2026-09-04 EDIT.md §6——条目级判定+应用迁至 edit-diff.mjs——批量调共用。）
 *
 * 语义（权威 = EDIT.md §5 ∥ §8 D-5）：同一 path 的多条编辑**分两类应用**（帧判据单源 =
 * EDIT-HELPERS §7.3 R1–R4）——行号条目先应用（按 startLine 降序，范围重叠则**那两条都废**），
 * 内容条目随后按调用序串行累积；同一档的多条**只写一次**（写前门判该档最终内容）。
 * 一条失败只废它自己，同档其余条照应用、其余档照落盘，批内零回滚；档级失败（读不到 ∥ 门拒 ∥
 * 写盘抛错）只连坐该档。每条目独立按判定序（EDIT.md §4——分支 0 单行替换 / 零重叠→替换即删 /
 * LCS / 空 new 显式报错；EDIT.md §5（约束——删行形态）：省略 new_string = 删行。顶层 path
 * （args.path）为无自带 path 条目的默认（2026-09-05 用户裁定——条目自带 path 优先——见
 * EDIT.md §5 修订注）。排顺序与累积走 edit-diff 的两个零 IO 纯函数——本档只留 IO（读 / 写 / 回执）。
 */
import { readFile } from "node:fs/promises"
import { resolveInCwd, normalizeEOL, joinWithEol, gitDiffOne, autoSyntaxCheck } from "./shared.mjs"
// edit-batch ↔ edit-diff 循环引用：两侧导入的都是函数声明（提升初始化），
// 仅在调用期使用——ESM 循环下安全（无模块求值期取值）。
// 写盘经单一写路径点（§2.13.5）——本档不再直调 fs；回执组装共用 edit-diff 的 composeEditReceipt。
import { writeThroughPath, lineAnchorVerdict, lineAnchorRefusal } from "./write-path.mjs"
// EDIT.md §6：批量条目判定+应用共用 edit-diff（EDIT.md §4 分支 0 单行替换 + 行级 LCS——零重叠→替换即删）；
// EDIT.md §5：edits 互斥错误文本随前置校验分支迁出至 edit-diff.mjs。
// 回执组装共用 edit-diff 的 composeEditReceipt（单点——缺省回执 = base + 写入点上下文）；
// 批级回执的两件文案（逐条失败行 ∥ 末行汇总）单源 = edit-receipt.mjs（EDIT.md §5 ∥ §8 D-16）。
import { editEntryFailureLine, editBatchSummary } from "./edit-receipt.mjs"
import { assertEditArgsExclusive, assertEditsContainer, validateEditEntry, hasLineParams, planEditEntries, applyPlannedEntries, splitLines, EMPTY_NEW_STRING_LINE, EDIT_ENTRY_NO_PATH, editEntryLabel, editsEntryError, deleteTarget, composeEditReceipt } from "./edit-diff.mjs"

/**
 * Apply the `edits` array form: **逐条成败、逐档落盘**（EDIT.md §5 ∥ §8 D-5）。
 *
 * 一条失败只废它那一条：条目校验 ∥ 行号锚护栏 ∥ 应用都在内存里逐条做，失败只记它自己那一行，
 * 同档其余条照应用、其余档照落盘；批内零回滚（§8 D-10）。档级失败（档读不到 ∥ 该档最终内容
 * 被写前门拒 ∥ 写盘抛错）只连坐该档——那几条没有可落的内容，报成功就是假话。
 *
 * **写单位 = 档、报单位 = 条**：同一 path 的多条合成一次就地写（`writeThroughPath` 的
 * `op:"write"` + 同一跳记账，不落暂存档、不走 `rename`——§8 D-12）；回执逐条一行、按调用序
 * 回原位，末行恒为计数行（§8 D-9 ∥ D-14）。
 *
 * 批内**没有任何跨档保证**：已写成的档不回滚，「全部成功」不是可以依赖的前提——调用方据以
 * 决策的单位是每一行回执。
 */
export async function applyEditBatch(args, ctx) {
  assertEditsContainer(args.edits)
  assertEditArgsExclusive(args)
  const total = args.edits.length
  // 每条一个结局：{ ok:true, g, out } ∥ { ok:false, reason }。回执只在全部写盘之后组装——
  // 档级写失败要把该档已算成的条改判为失败（「该档不成就整档不成」）。
  const state = new Array(total)
  const fail = (i, reason) => { state[i] = { ok: false, reason } }
  const groups = new Map() // abs → 每档一条流水线

  // ① 分组（路径解析 ∥ 条目校验——失败的条目只记它自己，不进组）
  for (let i = 0; i < total; i++) {
    const e = args.edits[i]
    // 条目非对象（null / 字符串 / 数字 / 数组）= **该条**成形错、不进组（EDIT.md §5「条目守卫」
    // 的文案单源 editsEntryError(i)「一条失败只废它自己」——整批拒会让一条手滑废掉全批，而那正是
    // 逐条成败要灭的代价）。桥面同一判据（EDIT.md §8 D-15）。
    if (e === null || typeof e !== "object" || Array.isArray(e)) { fail(i, editsEntryError(i)); continue }
    // 2026-09-05 用户裁定：顶层 path + edits 并存合法化——`e.path || args.path`（条目优先；
    // 缺省入口仅在此兜底）；两者皆无 → 原错误文本（措辞补顶层选项）。
    const p = e.path || args.path
    if (!p) { fail(i, EDIT_ENTRY_NO_PATH); continue }
    try {
      // 成形错 ∥ 空串 ∥ 互斥 ∥ 行号非法：都只废这一条（scope:"batch" ⇒ 文本不带写盘结论）
      validateEditEntry(e, { label: editEntryLabel(p), scope: "batch" })
    } catch (err) {
      fail(i, err.message)
      continue
    }
    const abs = resolveInCwd(ctx, p)
    let g = groups.get(abs)
    if (!g) {
      g = { abs, path: p, raw: null, content: null, readError: null, entries: [], idx: [], written: false }
      groups.set(abs, g)
    }
    g.entries.push(e)
    g.idx.push(i) // 条目在 args.edits 里的原始下标——回显按它回位（EDIT-HELPERS §7.3）
  }

  // ② 逐档读一次（读不到 ⇒ 该档所有条失败——原因带 ENOENT 原文）
  for (const g of groups.values()) {
    try {
      g.raw = await readFile(g.abs, "utf8")
      g.content = normalizeEOL(g.raw)
    } catch (err) {
      g.readError = err.message
      for (const i of g.idx) fail(i, g.readError)
    }
  }

  // ③ 行号锚护栏（判定点写死：批前快照逐条判——命中只废那一条，零写不是它的后果）
  // 组内不逐条再判：组内漂移由 R2（降序应用）自己算得出来，逐条再判会用同一份快照判出与 R2 相反的结果。
  for (const g of groups.values()) {
    if (g.readError) continue
    const keep = []
    const keepIdx = []
    g.entries.forEach((e, k) => {
      if (hasLineParams(e)) {
        const startLine = e.line ?? e.startLine
        const endLine = e.line ?? e.endLine
        if (lineAnchorVerdict(g.abs, startLine, endLine)) {
          fail(g.idx[k], lineAnchorRefusal(g.abs, startLine, endLine))
          return
        }
      }
      keep.push(e)
      keepIdx.push(g.idx[k])
    })
    g.entries = keep
    g.idx = keepIdx
  }

  // ④ 帧排 + 逐条累积（帧单源 = edit-diff 的两个零 IO 纯函数：排顺序 + 按计划序累积）
  const planned = [] // { g, results, idx }——待写档
  for (const g of groups.values()) {
    if (g.readError || g.entries.length === 0) continue
    const plan = planEditEntries(g.entries, g.path)
    const rejected = new Set(plan.rejections.map((r) => r.index))
    for (const r of plan.rejections) fail(g.idx[r.index], r.reason) // 重叠：两条互指，各得一行
    const pos = new Map() // 组内下标 → 存活序下标
    const liveE = []
    const liveIdx = []
    g.entries.forEach((e, k) => {
      if (rejected.has(k)) return
      pos.set(k, liveE.length)
      liveE.push(e)
      liveIdx.push(g.idx[k])
    })
    if (liveE.length === 0) continue
    const order = plan.order.filter((k) => !rejected.has(k)).map((k) => pos.get(k))
    const applied = applyPlannedEntries(g.content, liveE, order, { path: g.path, scope: "batch", onEntryError: "collect" })
    g.content = applied.content
    for (const f of applied.failures) fail(liveIdx[f.index], f.reason)
    planned.push({ g, results: applied.results, idx: liveIdx })
  }

  // ⑤ 逐档一次就地写（该档有 ≥1 条成功才写；零条成功 ⇒ 不写、也不记账）
  // recordWrite 每档一条合并快照：startLine = 已应用条受影响行的最小值（#2——原实现取首条 =
  // 调用序第一条，逆序条目时护栏下界过高、受影响区内的 insert_after 被放行），shift = 已应用条净漂移之和。
  for (const { g, results, idx } of planned) {
    const okPos = []
    results.forEach((r, k) => { if (r) okPos.push(k) })
    if (okPos.length === 0) continue
    const startLine = Math.min(...okPos.map((k) => results[k].editStartLine))
    const shift = okPos.reduce((n, k) => n + results[k].lineShift, 0)
    try {
      // 单一写路径点：默认 = writeFile + 记账；写前文档门挂在这一跳之前（命中即 throw、该档一个字节没动）
      await writeThroughPath(g.abs, joinWithEol(normalizeEOL(g.content).split("\n"), g.raw), {
        op: "write",
        record: { type: "edit", startLine, shift },
      })
    } catch (err) {
      // 档级失败只连坐该档：原因 = 那个档级错误原文（门拒文对它报的那一档为真——§8 D-11）。
      // 已有自己失败原因的条目保留自己那一句——它讲的是另一件事，覆写掉就丢一件（不改报成成功）。
      for (const k of idx) if (!state[k]) fail(k, err.message)
      continue
    }
    g.written = true
    okPos.forEach((k) => { state[idx[k]] = { ok: true, g, out: results[k] } })
  }

  // ⑥ 回执：逐条一行、按调用序回原位（成 = 现成功回执一字不改；败 = `edits[<i>] — failed: <原因原文>`）
  const results = new Array(total)
  let appliedCount = 0
  for (let i = 0; i < total; i++) {
    const s = state[i]
    if (!s) throw new Error(`applyEditBatch: entry ${i} produced no outcome — internal invariant break, not a bad input`)
    if (!s.ok) { results[i] = editEntryFailureLine(`edits[${i}]`, s.reason); continue }
    appliedCount++
    // #4（2026-09-01 交付评审尾巴）：与单文件路径对齐——每条结果附 git diff +
    // autoSyntaxCheck（同文件多条会重复 diff/检查，换取格式一致、实现零分支）
    const diff = await gitDiffOne(ctx.cwd, s.g.abs)
    const base = s.out.deleted
      ? `Deleted ${deleteTarget(s.out)} of ${s.g.path}${diff ? "\n" + diff : ""}${await autoSyntaxCheck(s.g.abs)}`
      : `Edited ${s.g.path}: replaced ${s.out.occurrences} occurrence(s)${s.out.note ? ` — ${s.out.note}` : ""}${diff ? "\n" + diff : ""}${await autoSyntaxCheck(s.g.abs)}`
    results[i] = await composeEditReceipt({
      abs: s.g.abs,
      path: s.g.path,
      writeLine: s.out.editStartLine,
      base,
      deleted: s.out.deleted === true,
      occurrences: s.out.occurrences,
      note: s.out.note,
    })
  }
  // 末行恒为一行计数（#796 ∥ §8 D-9 ∥ D-14）：大回执（>64K）落盘后双端 preview 保尾
  // （TOOL-OUTPUT-LIMITS.md §2）⇒ 汇总结论恒可见。三个符号各一义：M = 条目总数、k = 应用成功的
  // 条目数、K = 实际写盘的档数（一档多条只写一次 ⇒ K ≤ M）；K = 0 ⇒ 无路径清单支。
  const written = [...groups.values()].filter((g) => g.written).map((g) => g.path)
  const summary = editBatchSummary({ tool: "edit batch", applied: appliedCount, total, unit: "entries", filesWritten: written })
  return [...results, summary].join("\n")
}

// ---------------------------------------------------------------------------
// 2026-09-08 edit 语义升级（EDIT.md §2/§3——D1 按行号改 / D2 模糊匹配，落点定死本模块；
// 条目判定接线在 edit-diff.mjs computeEditEntry——单形态/批量/ACP 桥三通道自动继承；
// 2026-11-02：排顺序（帧 R1–R4）与累积也上提到 edit-diff（planEditEntries /
// applyPlannedEntries）——两通道共用同一份排法。
// 阶段 2 删行形态见 EDIT.md §5（约束）。以下均为纯函数（无 IO）——edit-diff.mjs 调用期导入
// （ESM 循环引用安全：两侧仅函数声明，提升初始化——同 file.mjs ↔ edit-diff.mjs 先例）。

/**
 * D2 行级 normalize（EDIT.md §3——匹配档位；阶段 2 normalize 统一基准——双端同算法）：
 * ① 去首尾空白 + 去行尾空格；② tab → 2 空格；③ 引号**单遍逐字符映射**——ASCII 单引号 /
 * 弯引号 ‘ ’ “ ” / 反引号 → 直双引号 "（评审 #2 定稿目标字符 = "——与 ASCII 单引号规则
 * 合并为单遍映射，无顺序依赖——防两端分叉）。**不做行内 \s+ 折叠**——缩进/对齐是结构信息，
 * 折叠会误匹配文字相似但结构不同的行（统一基准 5——CLI 从未折叠，防误配回归）。仅用于匹配
 * 比较——替换永远用文件原文窗口。
 */
const QUOTE_TO_DOUBLE = {
  "'": '"', "\u2018": '"', "\u2019": '"', "\u201c": '"', "\u201d": '"', "`": '"',
}
export function normalizeEditLine(line) {
  let out = ""
  for (const ch of line) {
    if (ch === "\t") out += "  "
    else out += QUOTE_TO_DOUBLE[ch] ?? ch
  }
  return out.replace(/\s+$/g, "").trim()
}

/** D2 模糊匹配阈值：行级 normalize 后逐行相等比例 ≥0.9 即匹配（评审 #4 定稿）。 */
export const FUZZY_MATCH_THRESHOLD = 0.9
/** D2 成功消息追加 note（双端同句——同 WHITESPACE_VARIANT_NOTE 机制）。 */
export const FUZZY_MATCH_NOTE = "applied via fuzzy match (≥90% of lines identical after whitespace/indent/quote normalization)"

/**
 * D2 模糊匹配（P15.11 空白自动落点的推广——逐字/trim 等价都失败后的最后一档）：
 * 找文件中**唯一**窗口——行数与 old 相同、normalizeEditLine 后逐行相等比例 ≥90% →
 * 返回 { actual }（actual = 文件窗口原文）；多窗口达标 → null（歧义不猜——走 not-found
 * 报错引导）；old 含尾换行 → null（终止符语义边界——同 P15.11）。比例向上取整行数：
 * 需要相等行数 = ceil(m × 0.9)（m=1 即 normalize 后全等——单行细微差异由此命中）。
 */
export function findFuzzyWindow(content, old) {
  if (old.endsWith("\n")) return null
  const oldLines = old.split("\n")
  const m = oldLines.length
  const fileLines = content.split("\n")
  if (m === 0 || fileLines.length < m) return null
  const norm = oldLines.map(normalizeEditLine)
  const need = Math.ceil(m * FUZZY_MATCH_THRESHOLD)
  let hit = null
  for (let i = 0; i + m <= fileLines.length; i++) {
    let eq = 0
    for (let j = 0; j < m; j++) {
      if (normalizeEditLine(fileLines[i + j]) === norm[j]) eq++
    }
    if (eq < need) continue
    const actual = fileLines.slice(i, i + m).join("\n")
    if (actual === old) continue // 逐字已匹配——occurrences=0 前提下不会发生
    if (hit) return null // 多窗口达标 → 歧义 → 不猜
    hit = { actual }
  }
  return hit
}

/**
 * D1 按行号改（EDIT.md §2/§5——F1）：entry 带 line（单行）或 startLine/endLine（1-based
 * 闭区间）→ 直接按行号替换该行/行范围为 new_string（无需 old_string——互斥校验在
 * validateEditEntry）。阶段 2 删行形态（EDIT.md §5——裁定 A）：**省略 new_string =
 * 删除该行/范围**（意图有界——删哪行是显式声明）；显式空串 `new_string: ""` →
 * EMPTY_NEW_STRING_LINE 显式报错（模板生成 new_string 但落空 ≠ 删行意图——防误删）。
 * 内容域 = normalizeEOL 后 LF（与 computeEditEntry 同域）；尾随换行随原文件保持（删到
 * 文件为空 → ""——无剩余行即无终止符）。行号越界 → 明确报错。原子性由调用方保证
 * （本函数纯计算）。
 * 返回 { updated, editStartLine, lineShift, occurrences, note, deleted? }（同 computeEditEntry 形态）。
 */
export function applyLineEdit(content, entry, opts = {}) {
  // 错误文本不带任何写盘结论（EDIT.md §5 / §8 D-14）：` — nothing written` 后缀的取废由 validateEditEntry
  // 按 `scope:"batch"` 决定，本函数只报行号事实；前缀形随 D-17 退役，不再有要拼的。
  if (entry.new_string === "") throw new Error(EMPTY_NEW_STRING_LINE)
  const lines = splitLines(content)
  const start = entry.line ?? entry.startLine
  const end = entry.line ?? entry.endLine
  if (start > lines.length || end > lines.length) {
    throw new Error(`line ${end > lines.length ? end : start} out of range — ${opts.path ?? "file"} has ${lines.length} line(s)`)
  }
  const removed = end - start + 1
  if (entry.new_string === undefined) {
    // 删行/删范围（EDIT.md §5）——省略 new_string：受影响行整体移除
    const remaining = [...lines.slice(0, start - 1), ...lines.slice(end)]
    const updated = remaining.join("\n") + (remaining.length > 0 && content.endsWith("\n") ? "\n" : "")
    return { updated, editStartLine: start, lineShift: -removed, occurrences: 1, note: null, deleted: true }
  }
  const newLines = splitLines(entry.new_string)
  const updated = [...lines.slice(0, start - 1), ...newLines, ...lines.slice(end)].join("\n") +
    (content.endsWith("\n") ? "\n" : "")
  return { updated, editStartLine: start, lineShift: newLines.length - removed, occurrences: 1, note: null }
}
