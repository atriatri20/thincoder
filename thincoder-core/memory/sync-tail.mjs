/**
 * memory/sync-tail.mjs — 同步收尾族（§6.14 面② B6 ∕ M3 收尾让出 + 面③ P2 行预算——**单源**）。
 *
 * 两个同步入口（`codeSync` ∕ `docSync`）共用的收尾机制都住本档（拆分点 = 批档 §2.12 补块 3 缝
 * 「code-sync〔预算判定 + stale 收尾块〕」）：
 *   · **P2 行预算**（`createRowBudget`）：基准 = 本 origin 库内行数（code+doc，开趟读一次；`opts.baseOffset`
 *     = 测试注入缝——缺省 = 实读核计数）；过 `INDEX_ORIGIN_ROW_WARN` 出一行中性信息（每 origin 每趟至多
 *     一行；真实行数——F-S14 ①）＋ `logEvent`；过 `INDEX_ORIGIN_ROW_CAP` 由调用方跳过列序后缀
 *     （**只停新增**——存量行不失效；跳过 = 不落行 ∕ 不记 mtime ⇒ 下趟重试）。
 *   · **stale 收尾循环**（`sweepStaleRows`）：同款时间片让出（§6.10 A2 口径——每 `SCAN_YIELD_CHECK_ROWS`
 *     行读钟，累计 ≥ `yieldMs` 即让出）＋ **收尾保护位**（两族并列：面①∪面⑥ `isExcludedRelPath` ∪
 *     面⑦ `isInDeclaredScope` 命中路径短路——被排除 ∥ 范围外而文件仍在盘的路径，存量行不因声明
 *     删除；收尾只删「不在盘 ∥ 不再列」的行，收敛仅经 `sweep --path`）。
 *
 * 零环：只引 `log.mjs` ∕ `conventions.mjs`（谓词）∕ `schema.mjs`（常量）∕ `scan.mjs`（预算常量）∕
 * `code-index.mjs`（`yieldTick`）——不引 `code-sync.mjs` ∕ `docs.mjs`。作业皆经传入句柄，档内零状态。
 */
import { logEvent } from "../log.mjs"
import { isExcludedRelPath, isInDeclaredScope } from "../conventions.mjs"
import { INDEX_ORIGIN_ROW_WARN, INDEX_ORIGIN_ROW_CAP } from "./schema.mjs"
import { SCAN_YIELD_CHECK_ROWS, SCAN_YIELD_MS } from "./scan.mjs"
import { yieldTick } from "./code-index.mjs"

/** 本 origin 库内行数（`code_chunks` + `doc_chunks` 合计——§6.14 P2 预算基准；开趟读一次）。 */
export function originRowCount(memory, origin) {
  const n = (t) => Number(memory.db.prepare(`SELECT COUNT(*) AS n FROM ${t} WHERE origin = ?`).get(origin)?.n ?? 0)
  return n("code_chunks") + n("doc_chunks")
}

/** 单路径行数（预算差量用——PK 前缀范围扫描）。 */
export function rowCountOfPath(memory, table, origin, rel) {
  return Number(memory.db.prepare(`SELECT COUNT(*) AS n FROM ${table} WHERE origin = ? AND path = ?`).get(origin, rel)?.n ?? 0)
}

/** §6.14 P2 行预算（单源——codeSync ∕ docSync 同用；`opts.baseOffset` = 测试注入缝，缺省 = 实读核计数）：
 *  `note()` 每 origin 每趟至多一行中性信息（真实行数——F-S14 ①；CAP 越线另出一行优雅降级说明）；
 *  `over()` = 已到 CAP（调用方跳过后列文件）；`add(delta)` = 本趟净增行数（新入 − 被替换——与「库内行数」同刻度）。 */
export function createRowBudget(memory, origin, kind, dir, { baseOffset } = {}) {
  const base = originRowCount(memory, origin) + (baseOffset ?? 0)
  let landed = 0, warned = false, capped = false
  const rows = () => base + landed
  return {
    add: (delta) => { landed += delta },
    over: () => rows() >= INDEX_ORIGIN_ROW_CAP,
    note() {
      if (!warned && rows() >= INDEX_ORIGIN_ROW_WARN) {
        warned = true
        console.warn(`[memory] index origin=${origin} rows≈${rows()} (code + doc)`)
        logEvent("index:budget", { dir, kind, rows: rows(), warn: INDEX_ORIGIN_ROW_WARN })
      }
      if (!capped && rows() >= INDEX_ORIGIN_ROW_CAP) {
        capped = true
        console.warn(
          `[memory] index origin=${origin} rows≈${rows()} — index is at its size limit: ` +
          `new files are not being indexed for now (existing rows are kept and remain searchable). ` +
          `Options: exclude paths from indexing (index.excludePaths in PROJECT-MANIFEST.json), or remove old rows ` +
          `(thincoder memory sweep --origin "${origin}" --path <sub>)`
        )
        logEvent("index:budget-cap", { dir, kind, rows: rows(), cap: INDEX_ORIGIN_ROW_CAP })
      }
    },
  }
}

/**
 * §6.14 B6 ∕ M3：收尾 stale 删除循环（同款让出 + 收尾保护位）。返回删除行数（文件级）。
 * @param {object} memory 句柄
 * @param {{table: string, origin: string, indexed: Map<string, number>, seen: Set<string>, decl: object,
 *   base?: string|null, scope?: readonly object[]|null, yieldFn?: Function, nowFn?: Function, yieldMs?: number}} opts
 *   `indexed` = 库内 path→mtime（开趟读）；`seen` = 本趟列文件；`decl` = `loadProjectDeclaration()` 回执；
 *   `base` = `indexed`/`seen` 里 `rel` 的相对基（调用面 dir——#700 等价换算；缺省 = 根相对）；
 *   `scope` = `declaredIndexScope(base)` 回执（面⑦ 保护位——缺省 `null` ⇒ **范围面不判**（仅面①∪面⑥ 保护，
 *   既有调用方语义零改）；在场（含空数组 = 零条目）⇒ 范围外短路（存量行不删））
 */
export async function sweepStaleRows(memory, { table, origin, indexed, seen, decl, base = null, scope = null, yieldFn = yieldTick, nowFn = Date.now, yieldMs = SCAN_YIELD_MS }) {
  let removed = 0
  let checked = 0
  let lastYieldAt = nowFn()
  for (const stale of indexed.keys()) {
    // 面⑦ 保护位：`scope` 在场 ⇒「声明面内才删」（范围外短路）；缺省 ⇒ 范围面不判（既有调用方语义零改）
    if (!seen.has(stale) && !isExcludedRelPath(stale, decl, base) && (scope === null || isInDeclaredScope(stale, scope, base))) {
      memory.db.prepare(`DELETE FROM ${table} WHERE origin = ? AND path = ?`).run(origin, stale)
      removed++
    }
    if (++checked >= SCAN_YIELD_CHECK_ROWS) {
      checked = 0
      if (nowFn() - lastYieldAt >= yieldMs) { await yieldFn(); lastYieldAt = nowFn() }
    }
  }
  return removed
}
