/**
 * buffered-edit.mjs — IDE 缓冲编辑面（读缓冲 → 行号锚护栏 → 纯函数判定 → 写回 → 记账）。
 *
 * 2026-11-05 拆档族从 `bridge.mjs` 外移：`absOf` / `editSingle` / `editBatch` 三者原是
 * `buildAcpCallbacks` 体内的闭包，依赖四个同作用域闭包（`agent` ∥ `readBuffer` ∥ `writeBuffer` ∥
 * `pathOf`）——裸搬会把 `request` 与 sessionId 一并带走，故改为**工厂形注入**：IO 缝由调用方给，
 * 链体逐字搬家。
 *
 * 判据与回执零变（本批是纯搬家）：edit 判定/应用单一权威仍是本地 `edit-diff.mjs` 的
 * `computeEditEntry` / `planEditEntries` / `applyPlannedEntries`——本档零字面副本；行号锚护栏的判据
 * 与拒文仍是核单源 `write-path.mjs`；记账键 = `resolveInCwd` 后的绝对路径（与核同一键）。
 *
 * 依赖单向：`本档 ← bridge.mjs`（本档不 import `bridge.mjs`）。
 */
import { normalizeEOL, joinWithEol, resolveInCwd } from "@thincoder/core/tools/shared.mjs"
import { computeEditEntry, validateEditEntry, assertEditArgsExclusive, assertEditsContainer, assertEditEntries, hasLineParams, planEditEntries, applyPlannedEntries, deleteTarget, EDIT_ENTRY_NO_PATH, editEntryLabel } from "@thincoder/core/tools/edit-diff.mjs"
// 行号锚护栏（EDIT-HELPERS §7）：桥不经 writeThroughPath ⇒ 判据与记账都得在桥面接（§7.4）。
// 判据 / 拒文 = 核单源；记账 = 写缓冲成功后桥自 recordWrite，键 = resolveInCwd 后的绝对路径。
import { recordWrite, lineAnchorVerdict, lineAnchorRefusal } from "@thincoder/core/tools/write-path.mjs"

/**
 * 造一个 IDE 缓冲编辑面。
 * @param {{ agent: object, readBuffer: (p: string) => Promise<string>,
 *           writeBuffer: (p: string, content: string) => Promise<void>,
 *           pathOf: (args: object) => string|null }} deps
 *   `agent` = 会话的活引用（取 `cwd`）；`readBuffer` / `writeBuffer` = 客户端 fs 反向 RPC 的两件闭包
 *   （各带自己的能力位守卫——本档只 issue）；`pathOf` = `args.path ?? args.filePath` 的取值闭包
 *   （数组形态里条目缺 path 时回落到顶层 path 的判据靠它）。
 * @returns {{ absOf: (p: string) => string, editSingle: Function, editBatch: Function }}
 */
export function makeBufferedEditFace({ agent, readBuffer, writeBuffer, pathOf }) {
  /** 记账键（§7.4）：与核同一键 = `resolveInCwd` 后的绝对路径——键不一致则核与桥各记一条、
   *  互相看不见，护栏对另一条通道等于零。 */
  const absOf = (p) => resolveInCwd({ cwd: agent?.cwd ?? process.cwd() }, p)
  /** 单形态：读 IDE 缓冲 → 行号锚护栏判定 → computeEditEntry（rich——无 abortPrefix——同本地
   *  runSingleEdit）→ 写回 → 记账。EOL 权威（F1）：判定/应用在 normalizeEOL 后的 LF 域；写回
   *  joinWithEol 按原文首换行恢复（LF 域判定——CRLF 域写回——与本地 edit 工具同判同恢复）。 */
  const editSingle = async (p, args) => {
    const raw = await readBuffer(p)
    const content = normalizeEOL(raw)
    const abs = absOf(p)
    // 行号锚护栏（§7.4）：行号形才需判——内容形态是位置无关寻址，没有可漂移的锚。
    // 形态校验先于护栏（与核 runSingleEdit 同序）：缺 endLine / 与 old_string 互斥报自己的句。
    if (hasLineParams(args)) {
      validateEditEntry(args, { rich: true })
      const startLine = args.line ?? args.startLine
      const endLine = args.line ?? args.endLine
      if (lineAnchorVerdict(abs, startLine, endLine)) throw new Error(lineAnchorRefusal(abs, startLine, endLine))
    }
    const out = computeEditEntry(content, args, { path: p, absPath: abs })
    await writeBuffer(p, joinWithEol(normalizeEOL(out.updated).split("\n"), raw))
    // 缓冲写回**成功之后**记账（快照对同一坐标系有效——缓冲与盘面可能不同步，行号语义跟的是缓冲）
    recordWrite(abs, { type: "edit", startLine: out.editStartLine, shift: out.lineShift })
    // 逐条回执（§7.4「单形态删行不经桥」）：单形态经桥恒为确认形——路由门要求单形态的
    // `new_string` 是字符串，而删行只在**省略**它时成立 ⇒ 单形态删行走不到这里（落本地通道，
    // 回执 = 核面 `Deleted line N of <path>`），桥面的删行回执只来自 `edits` 数组形态（editBatch）。
    // 不留删行分支：为没出现过的输入加分支 = 加一条没人走的路，且它会让下一个读这里的人
    // 以为单形态删行走 IDE 缓冲（实测不走）；放宽路由门是行为变更，没人要求过。
    return `OK: edited ${p} via IDE (${out.occurrences} occurrence(s))${out.note ? ` — ${out.note}` : ""}`
  }
  /** 数组形态（D15.7）：守卫与文案单源 = 本地 edit-diff（assertEditsContainer / assertEditEntries /
   *  validateEditEntry——EDIT.md §8 D-7：核 edit-batch 与桥同调用、桥零字面副本）→
   *  读全部涉及文件缓冲（按绝对路径去重——一次读）→ 用批前快照判一次 → **帧调同一对纯函数**
   *  （planEditEntries / applyPlannedEntries，R1–R4；不另写组循环）→ 全部通过 → 逐文件写回
   *  一次并同记账（判失败 → 零写；写失败 → 同本地 edit-batch 既有原子语义）。 */
  /** ACP batch-edit 通道——与 EDIT.md:#796 汇总行体系**无关**。
   * 桥面 `prepared.map(...).join("\\n")` 自持逐条文字行，不经 `applyEditBatch`/`diffLines`/offload；
   * 距 64K offload 阈值远 + 不含 diff 结构 ⇒ 不在 offload 盲区范围。**判定：非 #796 射程（#908）**。
   */
  const editBatch = async (args) => {
    const edits = args.edits
    assertEditsContainer(edits)
    assertEditArgsExclusive(args)
    assertEditEntries(edits)
    const groups = new Map() // abs → { abs, path, raw, content, edits, origIdx }
    for (let i = 0; i < edits.length; i++) {
      const e = edits[i]
      // 2026-09-05 用户裁定（CLI parity——本地 edit-batch 同句）：条目自带 path 优先；
      // 缺省回退顶层 path（pathOf——path/filePath 别名同单形态）
      const p = e.path || pathOf(args) // 同核 edit-batch 的兜底判（`||` 而非 `??`——空串也回落顶层）
      if (!p) throw new Error(EDIT_ENTRY_NO_PATH)
      validateEditEntry(e, { label: editEntryLabel(p), rich: false })
      const abs = absOf(p)
      let g = groups.get(abs)
      if (!g) {
        g = { abs, path: p, raw: "", content: "", edits: [], origIdx: [] }
        groups.set(abs, g)
      }
      g.edits.push(e)
      g.origIdx.push(i) // 条目在 `edits` 数组里的原始下标——回显按它回位（§7.3）
    }
    for (const g of groups.values()) {
      g.raw = await readBuffer(g.path)
      g.content = normalizeEOL(g.raw)
    }
    // 判定点（§7.3 同核）：组循环之前用**批前快照**判一次——命中即抛、零写
    for (const g of groups.values()) {
      for (const e of g.edits) {
        if (!hasLineParams(e)) continue
        const startLine = e.line ?? e.startLine
        const endLine = e.line ?? e.endLine
        if (lineAnchorVerdict(g.abs, startLine, endLine)) throw new Error(lineAnchorRefusal(g.abs, startLine, endLine))
      }
    }
    // 帧单源：调 §7.3 的同一对零 IO 纯函数——桥只做「读缓冲 → 应用计划 → 写缓冲」。
    // 回显按调用序 = 按条目的**原始下标**回填（§7.3）：跨文件交错的批若按文件分组去排会排成
    // A、A、B——模型按位置对号入座，顺序一变它会把结果贴到错的那一笔上。
    const prepared = new Array(edits.length)
    for (const g of groups.values()) {
      const plan = planEditEntries(g.edits, g.path)
      if (plan.rejection) throw new Error(plan.rejection)
      const applied = applyPlannedEntries(g.content, g.edits, plan.order, { path: g.path })
      g.content = applied.content
      g.netShift = applied.results.reduce((n, r) => n + r.lineShift, 0)
      // results 按组内调用序；g.origIdx 给出它在这一组里的下标对应的原始下标
      applied.results.forEach((r, k) => { prepared[g.origIdx[k]] = { g, ...r } })
    }
    for (const g of groups.values()) {
      await writeBuffer(g.path, joinWithEol(normalizeEOL(g.content).split("\n"), g.raw))
      // 写缓冲成功后记账：合并快照 startLine = 组内最小、shift = 组内净漂移（同核批量语义）
      const startLine = Math.min(...prepared.filter((p) => p.g === g).map((p) => p.editStartLine))
      recordWrite(g.abs, { type: "edit", startLine, shift: g.netShift })
    }
    // 逐条回执同单形态（§7.4）：删行条目写 `Deleted <line N|lines N-M> of <path> via IDE`，
    // 行号段取同一 `deleteTarget`；替换条目保持确认形。核面的 diff / `context (L…-L…)` /
    // 批末汇总行桥面不写（那三样读盘面内容或起外部进程，缓冲与盘面可能不同步）。
    return prepared
      .map((o) => (o.deleted
        ? `Deleted ${deleteTarget(o)} of ${o.g.path} via IDE`
        : `OK: edited ${o.g.path} via IDE (${o.occurrences} occurrence(s))${o.note ? ` — ${o.note}` : ""}`))
      .join("\n")
  }
  return { absOf, editSingle, editBatch }
}