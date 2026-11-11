/**
 * agent-tools/batch-gate-judge.mjs — 判集分腿（批档门三族之一）。
 *
 * 一族一件事：**一条命中算「本次」还是「存量」**——交出哪些区（`zoneTablesOf`）＋ 逐条收口（`blocks`）。
 * 它不组装显示行（那一族住 `thincoder-core/agent-tools/batch-gate-hit.mjs`），也不拼报面（那一族住
 * `thincoder-core/agent-tools/batch-gate-report.mjs`）；编排与范围解析留在 `thincoder-core/agent-tools/batch-gate.mjs`。
 *
 * 判据口径单源（D2——本档只实现，不重述）：`docs/core/design/DOC-DISCIPLINE.md` §3.20「触达账腿的判面 = 本次改动区」∥
 * `docs/core/design/DOC-CHECK.md` §2.9.4（三面取区）∥ §2.10.1（`zones` 的逐档语义：某档在 `docs` 里而 `zones`
 * 里没有它的键 ⇒ 该档整份进阻断集）。
 */
// 共享小件取既有单源（本族不自持、也不反向 import 编排档——那会成环且是层次倒挂）：
// 路径键 = `thincoder-core/doc-check/per-root.mjs` 的既有导出。
import { pathKey } from "../doc-check/per-root.mjs"

/** 写段 ∥ 收口两腿的区间表（§2.10.1 的表）：只交「改动区已定」的那些档（`kind:"region"`）。
 *  一档都交不出 ⇒ `undefined`（与「没给 `zones`」同形：整档判）。
 *  **各腿各交哪些档**（差异只在这一层，判定体一处）：
 *   · `append` 交**触达账各档**，批档本体的键**不进**——引擎的逐档语义（某档在 `docs` 里而 `zones` 里没有它的键 ⇒
 *     该档整份进阻断集）因此让候选整份即本次：`append` 改不动批档的既有行，候选全文就是这一笔的全部（AC-P7）。
 *   · `edit` 与 `append` 同交触达账各档改动区；批档本体另交替换区（单源 = `docs/core/design/DOC-CHECK.md` §2.10.1 的 `edit` 行）。
 *   · 收口腿交逐档——整档（本轮新建的笔）∥ 未定（无基线）就不交该档，引擎按整档判（fail-closed）。
 *     写段面的「未定 ⇒ 零强制」走另一条路：那条路由本档的 `blocks` 判，不经引擎（两面倒向本来就不同，§2.9.4）。 */
export function zoneTablesOf(regions, docs) {
  const out = new Map()
  for (const p of docs) {
    const r = regions.get(pathKey(p))
    if (r && r.kind === "region" && r.zones.length > 0) out.set(p, r.zones)
  }
  return out.size > 0 ? out : undefined
}

/**
 * 判集分腿（`evaluate` 内那个闭包，原样提为纯函数：入参 = 改动区表 ∥ 面别 ∥ `pureDeleteStock`）：
 * 三态判定表达式与顺序逐字照搬，`close` ∥ `viewBody` ∥ `candidate` 三个闭包捕获值改为入参同名传进。
 * @param {{regions:Map, close:boolean, pureDeleteStock:Set, viewBody:string|null, candidate:boolean}} face
 *   `regions` = 改动区表（`touchedRegions` ∥ 收口面的整档 ∥ 未定）；`close` = 面别（收口 ∥ 写段）；
 *   `pureDeleteStock` = 纯删基线映射判为存量的那批命中；`viewBody` = `edit` 的改后整档视图（`null` ⇒ 非 `edit` 面）；
 *   `candidate` = `append` 面（有候选全文、无视图）。
 * @returns {(e:{inSelf:boolean,file:string,line:number}) => boolean} 这一条命中是否进强制集。
 */
export function blocks({ regions, close, pureDeleteStock, viewBody, candidate }) {
  return (e) => {
    if (close) {
      const region = regions.get(pathKey(e.file))
      if (!region || region.kind !== "region") return true
      const inZone = region.zones.some((z) => e.line >= z.start && e.line <= z.end)
      return inZone && !pureDeleteStock.has(e)
    }
    if (e.inSelf) return viewBody !== null || candidate
    const region = regions.get(pathKey(e.file))
    if (!region) return true // 判域内既非批档自身也非触达账 ⇒ 构造异常；照强制断住（fail-closed）
    if (region.kind === "whole") return true // ② 未跟踪档 ⇒ 整档即本轮的笔
    if (region.kind === "unknown") return false // 写段面未定 ⇒ 零强制；收口面独立按批起基线判定
    return region.zones.some((z) => e.line >= z.start && e.line <= z.end)
  }
}
