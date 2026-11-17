/**
 * buffered-edit.mjs — IDE 缓冲编辑面（读缓冲 → 行号锚护栏 → 纯函数判定 → 写回 → 记账）。
 *
 * 2026-11-05 拆档族从 `bridge.mjs` 外移：`absOf` / `editSingle` / `editBatch` 三者原是
 * `buildAcpCallbacks` 体内的闭包，依赖四个同作用域闭包（`agent` ∥ `readBuffer` ∥ `writeBuffer` ∥
 * `pathOf`）——裸搬会把 `request` 与 sessionId 一并带走，故改为**工厂形注入**：IO 缝由调用方给，
 * 链体逐字搬家。
 *
 * 判据与回执：edit 判定/应用单一权威仍是本地 `edit-diff.mjs` 的 `computeEditEntry` /
 * `planEditEntries` / `applyPlannedEntries`——本档零字面副本；行号锚护栏的判据与拒文仍是核单源
 * `write-path.mjs`；批级回执的两件文案单源 `edit-receipt.mjs`（与核同调、零字面副本）；
 * 记账键 = `resolveInCwd` 后的绝对路径（与核同一键）。
 *
 * **批量口径与核批面同一**（`docs/core/design/EDIT.md` §2「匹配与应用」）：逐条成败、逐档一次写回、批内零回滚。
 *
 * 依赖单向：`本档 ← bridge.mjs`（本档不 import `bridge.mjs`）。
 */
import { normalizeEOL, joinWithEol, resolveInCwd } from "@thincoder/core/tools/shared.mjs"
import { computeEditEntry, validateEditEntry, assertEditArgsExclusive, assertEditsContainer, hasLineParams, planEditEntries, applyPlannedEntries, deleteTarget, EDIT_ENTRY_NO_PATH, editEntryLabel, editsEntryError } from "@thincoder/core/tools/edit-diff.mjs"
// 行号锚护栏（`EDIT-HELPERS.md` §3「行号锚」）：桥不经 writeThroughPath ⇒ 判据与记账都得在桥面接（同节）。
// 判据 / 拒文 = 核单源；记账 = 写缓冲成功后桥自 recordWrite，键 = resolveInCwd 后的绝对路径。
import { recordWrite, lineAnchorVerdict, lineAnchorRefusal } from "@thincoder/core/tools/write-path.mjs"
// 批级回执两件文案（逐条失败行 ∥ 末行汇总）单源 = edit-receipt.mjs（`EDIT-HELPERS.md` §4「批量帧」）：
// 核批面与桥面同调用——两工具一副骨架，改一处就同时改到另一处。
import { editEntryFailureLine, editBatchSummary } from "@thincoder/core/tools/edit-receipt.mjs"

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
  /** 记账键（`EDIT-HELPERS.md` §3「行号锚」）：与核同一键 = `resolveInCwd` 后的绝对路径——键不一致则核与桥各记一条、
   *  互相看不见，护栏对另一条通道等于零。 */
  const absOf = (p) => resolveInCwd({ cwd: agent?.cwd ?? process.cwd() }, p)
  /** 单形态：读 IDE 缓冲 → 行号锚护栏判定 → computeEditEntry（rich——同本地 runSingleEdit）→
   *  写回 → 记账。EOL 权威（F1）：判定/应用在 normalizeEOL 后的 LF 域；写回
   *  joinWithEol 按原文首换行恢复（LF 域判定——CRLF 域写回——与本地 edit 工具同判同恢复）。 */
  const editSingle = async (p, args) => {
    const raw = await readBuffer(p)
    const content = normalizeEOL(raw)
    const abs = absOf(p)
    // 行号锚护栏（`EDIT-HELPERS.md` §3「行号锚」）：行号形才需判——内容形态是位置无关寻址，没有可漂移的锚。
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
    // 单形态回执说真话（EDIT.md §3「写与桥」）：路由门要求单形态的 `new_string` 是字符串，而空串也是字符串
    // ⇒ 行号形 + 空串改后确实走到这里，且它的结局是一次删除——继续印 `OK: edited` 就是把删除
    // 说成替换。两路同一措辞：`Deleted <line N|lines N-M> of <path>`（行号段 = 同一 `deleteTarget`）。
    return out.deleted
      ? `Deleted ${deleteTarget(out)} of ${p}`
      : `OK: edited ${p} via IDE (${out.occurrences} occurrence(s))${out.note ? ` — ${out.note}` : ""}`
  }
  /** 数组形态：与核批面同一条六段流水线（EDIT.md §2「匹配与应用」）——
   *  ① 容器守卫整批拒 → ② 分组（非对象条目 ∥ 缺 path ∥ 条目校验不过 ⇒ 该条失败、不进组）→
   *  ③ 逐档读缓冲（读不到连坐该档）→ ④ 行号锚护栏逐条判（命中只废那一条）→
   *  ⑤ 帧排 + `onEntryError:"collect"` 累积（重叠两条互指、各得一行）→
   *  ⑥ 有 ≥1 条成功的档写缓冲一次并记合并快照；零成功的档不写不记账，写缓冲抛错只连坐该档。
   *
   *  **两段结构保留、不拆**：`readBuffer` / `writeBuffer` 指 IDE 文档缓冲（传输事实），不是暂存区；
   *  变的是第一段的身份——从「全过才写的闸」变成逐条判定点。桥的 IO 缝与消息契约字段零改。
   *
   *  回执三形（EDIT.md §2「匹配与应用」）：成功行保持桥面现措辞；失败行与末行与核同一构造器；末行汇总行桥面
   *  照写——它的数字（条目总数 / 成功条数 / 已写档数与路径）全在内存里，没有宿主能力依据可以挡它。
   *  桥面不写的三样仍是 diff ∥ 语法检查 ∥ 写入点上下文（它们都读盘面内容或起外部进程）。
   *
   *  ACP batch-edit 通道**不进 offload 面**：回执自持逐条文字行，不含 diff 结构。
   */
  const editBatch = async (args) => {
    const edits = args.edits
    assertEditsContainer(edits) // ① 容器成形错 = 整批拒（经 toolRouter catch 渲染 `Error: <msg>`）
    assertEditArgsExclusive(args)
    const total = edits.length
    // 每条一个结局：{ ok:true, g, out } ∥ { ok:false, reason }。回执只在全部写回之后组装——
    // 档级写失败要把该档已算成的条改判为失败（「该档写不成就整档不成」）。
    const state = new Array(total)
    const fail = (i, reason) => { state[i] = { ok: false, reason } }
    const groups = new Map() // abs → 每档一条流水线

    // ② 分组（同核批面判据）：非对象条目 = **该条**成形错（文案单源 editsEntryError(i)），不进组
    for (let i = 0; i < total; i++) {
      const e = edits[i]
      if (e === null || typeof e !== "object" || Array.isArray(e)) { fail(i, editsEntryError(i)); continue }
      // 2026-09-05 用户裁定（CLI parity——本地 edit-batch 同句）：条目自带 path 优先；
      // 缺省回退顶层 path（pathOf——path/filePath 别名同单形态）
      const p = e.path || pathOf(args) // 同核 edit-batch 的兜底判（`||` 而非 `??`——空串也回落顶层）
      if (!p) { fail(i, EDIT_ENTRY_NO_PATH); continue }
      try {
        // 成形错 ∥ 空串 ∥ 互斥 ∥ 行号非法：都只废这一条（scope:"batch" ⇒ 文本不带写盘结论）
        validateEditEntry(e, { label: editEntryLabel(p), scope: "batch" })
      } catch (err) {
        fail(i, err.message)
        continue
      }
      const abs = absOf(p)
      let g = groups.get(abs)
      if (!g) {
        g = { abs, path: p, raw: "", content: "", readError: null, entries: [], idx: [], written: false }
        groups.set(abs, g)
      }
      g.entries.push(e)
      g.idx.push(i) // 条目在 `edits` 数组里的原始下标——回显按它回位（`EDIT-HELPERS.md` §4「批量帧」）
    }

    // ③ 逐档读一次缓冲（读不到 ⇒ 该档所有条失败——原因取读错误原文）
    for (const g of groups.values()) {
      try {
        g.raw = await readBuffer(g.path)
        g.content = normalizeEOL(g.raw)
      } catch (err) {
        g.readError = err.message
        for (const i of g.idx) fail(i, g.readError)
      }
    }

    // ④ 行号锚护栏（判定点同核：批前快照逐条判——命中只废那一条，零写不是它的后果）
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

    // ⑤ 帧排 + 逐条累积（帧单源 = edit-diff 的两个零 IO 纯函数；`onEntryError:"collect"` + `scope:"batch"`
    //    与核批面同组实参——桥只做「读缓冲 → 应用计划 → 写缓冲」）
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

    // ⑥ 逐档一次写回（该档有 ≥1 条成功才写；零条成功 ⇒ 不写、也不记账）
    // recordWrite 每档一条合并快照：startLine = 已应用条受影响行的最小值、shift = 已应用条净漂移之和
    // （失败条没有可记的漂移）。零条成功的档不记账，否则护栏会拿一条没有对应写盘的快照放行/拒绝。
    for (const { g, results, idx } of planned) {
      const okPos = []
      results.forEach((r, k) => { if (r) okPos.push(k) })
      if (okPos.length === 0) continue
      const startLine = Math.min(...okPos.map((k) => results[k].editStartLine))
      const shift = okPos.reduce((n, k) => n + results[k].lineShift, 0)
      try {
        await writeBuffer(g.path, joinWithEol(normalizeEOL(g.content).split("\n"), g.raw))
      } catch (err) {
        // 写缓冲抛错只连坐该档：已有自己失败原因的条目保留自己那一句——它讲的是另一件事。
        for (const k of idx) if (!state[k]) fail(k, err.message)
        continue
      }
      // 缓冲写回**成功之后**记账：快照对同一坐标系有效（行号语义跟的是缓冲）
      recordWrite(g.abs, { type: "edit", startLine, shift })
      g.written = true
      okPos.forEach((k) => { state[idx[k]] = { ok: true, g, out: results[k] } })
    }

    // ⑦ 回执：逐条一行、按调用序回原位（成 = 桥面成功形；败 = `edits[<i>] — failed: <原因原文>`）+ 末行汇总
    const lines = new Array(total)
    let appliedCount = 0
    for (let i = 0; i < total; i++) {
      const s = state[i]
      if (!s) throw new Error(`editBatch: entry ${i} produced no outcome — internal invariant break, not a bad input`)
      if (!s.ok) { lines[i] = editEntryFailureLine(`edits[${i}]`, s.reason); continue }
      appliedCount++
      // 删行条目写 `Deleted <line N|lines N-M> of <path> via IDE`，行号段取同一 `deleteTarget`；
      // 替换条目写确认形。两形是模型区分「删了行」与「换了内容」的两条线索。
      lines[i] = s.out.deleted
        ? `Deleted ${deleteTarget(s.out)} of ${s.g.path} via IDE`
        : `OK: edited ${s.g.path} via IDE (${s.out.occurrences} occurrence(s))${s.out.note ? ` — ${s.out.note}` : ""}`
    }
    const written = [...groups.values()].filter((g) => g.written).map((g) => g.path)
    lines.push(editBatchSummary({ tool: "edit batch", applied: appliedCount, total, unit: "entries", filesWritten: written }))
    return lines.join("\n")
  }
  return { absOf, editSingle, editBatch }
}