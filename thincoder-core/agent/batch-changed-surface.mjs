/**
 * agent/batch-changed-surface.mjs — 收口档位臂取材面的判据一族（从 `agent-tools/batch-closeout.mjs` 拆出）：
 * 比较键 `surfaceKey` ∥ 显示式 `displayRelOf` ∥ 三处判据 `selfAttributedOf` / `sessionClaimsOf` / `neighborListClaims`。
 *
 * 语义单源 = `docs/core/design/BATCH-RECORD.md` §4.18.1（本批改动面的取材：写时归属作判据一 ∥ 提交 diff 按认领收窄）；
 * 本档只实现它，不重述口径。
 *
 * 依赖单向：`agent-tools/batch-closeout.mjs` → 本档——入口 `changedSurface` 与回执段 `changedSurfaceReceiptLine`
 * 留在那里；本档不 import 它，两档不成环。比较键随判据一族住在这里：三处判据都用它，留在入口侧就要反向 import。
 *
 * 本档不是无依赖那一形（同族的 `batch-attribution.mjs` 才是「零 fs、零 import」）：认领的计划源本来就要读盘、
 * 要问 git——`batchDirs` ∥ `machineListRowsOf` ∥ `baseShaOf` ∥ `committedDocs` 都在它的取材路径上。
 */
import { readdirSync, readFileSync } from "node:fs"
import { isAbsolute, relative, resolve } from "node:path"

import { owningProject } from "../manifest.mjs"
import { batchDirs } from "../doc-check/existence.mjs"
import { baseShaOf } from "../agent-tools/batch-gate.mjs"
import { committedDocs } from "../agent-tools/batch-regions.mjs"
import { isBatchRecord, machineListRowsOf, readBatchStatusLine } from "../agent-tools/batch-segment-vocab.mjs"
import { attributedTo } from "./batch-attribution.mjs"

/** 比较键（绝对路径归一：`/` 分隔符 + win32 折小写）——归属表、认领表与改动面条目三处共用一把尺。 */
export function surfaceKey(p) {
  const s = resolve(String(p ?? "")).replace(/\\/g, "/")
  return process.platform === "win32" ? s.toLowerCase() : s
}

/** 显示用的仓根相对路径（**不折大小写**：折小写是比较键的事，回执上印真名；仓外 ⇒ 照原值）。 */
export function displayRelOf(root, p) {
  const raw = String(p ?? "").replace(/\\/g, "/")
  if (typeof root !== "string" || root === "") return raw
  const rel = relative(resolve(root), resolve(p)).replace(/\\/g, "/")
  return rel === "" || rel.startsWith("../") || isAbsolute(rel) ? raw : rel
}

/** 归属表里归属**含本档**的路径集（比较键）。精确取件走叶档的 `attributedTo`，再按归一键补一遍：
 *  表键与批档串在分隔符 ∥ 大小写上可能不同形，而判据一必须比认领更硬——少判的那一侧只许来自认领。 */
export function selfAttributedOf(agent, selfAbs) {
  const mine = new Set(attributedTo(agent, selfAbs).map(surfaceKey))
  const table = agent?._batchAttribution
  if (!(table instanceof Map)) return mine
  const self = surfaceKey(selfAbs)
  for (const [batch, paths] of table) {
    if (surfaceKey(batch) !== self) continue
    for (const p of paths) mine.add(surfaceKey(p))
  }
  return mine
}

/** 本会话归属表里**别的批**的路径集（认领的观测源）。
 *  不按批档状态筛：归属记的是「哪一批写了这一档」这件已发生的事，那一批收口之后这个事实不变——
 *  同会话并行的两批，后收口的一方靠这一源减掉先收口那一方的档（正是「各自收口不为对方档要行」的实现面）。 */
export function sessionClaimsOf(agent, selfAbs) {
  const table = agent?._batchAttribution
  const claims = new Set()
  if (!(table instanceof Map)) return claims
  const self = surfaceKey(selfAbs)
  for (const [batch, paths] of table) {
    if (surfaceKey(batch) === self) continue
    for (const p of paths) claims.add(surfaceKey(p))
  }
  return claims
}

/** 盘上**别的在途批档**已认领的路径集（认领的计划源），`Map<比较键, 批档绝对路径>`。
 *
 *  清单只是**计划面**——它声明打算改哪些档，不证明真改了；单凭计划认领，一条永不兑现的计划就能把一档从
 *  每一批的判据里摘出去。故本源另加三条（缺一不认领）：
 *   ① 该档确在**那份批档自己的**批起 sha..HEAD 之内（`baseShaOf` 取那份批档的 sha，`committedDocs` 给档清单）；
 *   ② 那份批档与本次收口**同项目根**——跨项目同名的相对路径不认领；
 *   ③ 那份批档**可读地未收口**（状态词 = `进行中`）：收口批的 `committedDocs` 上界是现在的 HEAD、会一直往后长，
 *      「该档在它的 baseSha..HEAD 之内」对它几乎恒真 ⇒ 计划面变成所有权，正是①要防的静默放过；状态不可读
 *      （`unknown`）的与写锁同口按冻结处置，同样不给认领权。已收口的批走观测源（本会话归属表）。
 *  抽取面 = `machineListRowsOf`（机读清单读取）＋ `batchDirs`（批档目录）：按「哪一份批档列了哪一档」取，
 *  不取跨批合并后的路径集（并集给不出①要的那份批档自己的批起 sha）。 */
export function neighborListClaims(root, selfAbs) {
  const claims = new Map()
  const self = surfaceKey(selfAbs)
  const base = resolve(root)
  for (const dir of batchDirs(base)) {
    let names
    try { names = readdirSync(dir) } catch { continue }
    for (const name of names) {
      if (!name.toLowerCase().endsWith(".md")) continue
      const abs = resolve(dir, name)
      if (surfaceKey(abs) === self) continue
      let src
      try { src = readFileSync(abs, "utf8") } catch { continue }
      // 认领面只收**可读的未收口**批档：`unknown`（无状态行 ∥ 两条以上 ∥ 两词皆不命中）与写锁同口按冻结处置——
      // 状态不明的一方不给认领权（不明不等于未收口，认领是往「少判」方向倒的那一条）。
      if (!isBatchRecord(src) || readBatchStatusLine(src) !== "open") continue
      const rows = machineListRowsOf(src)
      if (rows.length === 0) continue
      const owned = owningProject(abs, base)
      if (!owned || surfaceKey(owned) !== surfaceKey(base)) continue // ②（取不到根 ⇒ 不认领）
      const sha = baseShaOf(abs)
      if (sha === null) continue // 没有它自己的批起 sha ⇒ 观测不成立
      const committed = committedDocs(base, sha)
      if (!committed.ok) continue
      // 认领键与改动面条目同一坐标系（绝对路径归一）——两侧共用 `surfaceKey` 一把尺。
      const changed = new Set()
      for (const f of committed.files ?? []) changed.add(surfaceKey(resolve(committed.base, f)))
      for (const row of rows) {
        const key = surfaceKey(resolve(base, row.path))
        if (changed.has(key)) claims.set(key, abs) // ①
      }
    }
  }
  return claims
}
