/**
 * thincoder-core/doc-graph/doc-batch-face.mjs — **批档面判族**：批档 ↔ 批档互引不判——实现族（基底根 ∥ 拼路径 ∥ 谓词）整族住本档，
 * 应用点 = `./anchors.mjs` 的三条抽取分支（那三处只调 `isBatchFaceRef`，不自持第二份）。
 *
 * 判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.29 条目 AC（一个 token 判之前先过面判——引用方与目标
 * **同在**一个批档基底根下 ⇒ 不判：不进 `hits`、不读目标档、不计 `unreadable`，只计 `batchRefs`）。
 * 分拆落点 = 归批档 §2 的机读清单（`thincoder-core/doc-graph/anchors.mjs` 越 500 设计器硬线）。
 * **只搬不改**：搬前搬后 `doc_check` 两模式报面与判决逐字相等——本档只把已经写好的四个函数整族搬出来。
 *
 * 为什么这一族立得住：它只回答「这个 token 归不归本门判」，不抽 token、不解析、不判存在性、不改 verdict；
 * 判据的两个依赖面（基底根 = `../agent-tools/batch-paths.mjs`、拼路径 = `node:path`）都由它自己引，
 * 与判法面没有反向依赖。
 */
import { dirname, resolve } from "node:path"

import { batchDocBases, baseContaining } from "../agent-tools/batch-paths.mjs"

/** 批档面（面判）上下文：基底根单源 = `batchDocBases`（声明面 ∪ 缺省回退 `docs/batches`，恒非空）。
 *  读不到声明面 ∥ 该根不在盘都不抛错——空面只会让引用**照判**（fail-closed 方向，不静默放宽）。
 *  一次调用建一份：基底根不随 token 变，逐 token 读 manifest 是白读。
 *  **注入形**：`manifest` 给了 ⇒ 传进 `batchDocBases`（引擎按组根已读的那份，每根一次读）——
 *  它同时判「工作区并合」那支：组根恒是项目根 ∥ 声明根，注入即短路 workspaceCandidates 的重扫。 */
export function batchFaceContext(root, manifest) {
  let bases
  try { bases = batchDocBases(root, { manifest }) } catch { bases = [] }
  return { root, bases: Array.isArray(bases) ? bases : [] }
}

/** `abs` 落在的那个基底根（不落任何基底根 ⇒ null）——判定单源 = `../agent-tools/batch-paths.mjs` 的
 *  `baseContaining`（与 create 面的越基底判据同一实现，本档不另持一份）。 */
const baseOf = (bases, abs) => baseContaining(abs, bases)

/** 目标路径候选（**先拼后判**，不等解析结果——目标已删时等 `resolved.abs` 就永远走不到面判）：
 *  `..` / `.` 与 `\` 先归一；① `<项目根>/<token>` 对任何 token 都拼；
 *  ② `<引用方档所在目录>/<token>` **只对不带目录段的裸名成立**——带目录段的 token 拼上引用方目录
 *  恒落在批档根下，面判会变成「批档指到哪都不算」（越界照判与集成行 `7-6` 的改写同时落空）。 */
function batchFaceTargets(root, refAbs, token) {
  const norm = String(token).replace(/\\/g, "/").split("/").filter((s) => s !== "" && s !== ".").join("/")
  const targets = [resolve(root, norm)]
  if (!norm.includes("/")) targets.push(resolve(dirname(refAbs), norm))
  return targets
}

/**
 * 面判谓词（**唯一一处** · 判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.29 条目 AC）：
 * 引用方档在同一批档基底根下 ∧ 目标路径也在同一基底根下 ⇒ **该 token 不判**（不进 `hits`、不读目标档、
 * 不计 `unreadable`，只计 `batchRefs`）。**方向纪律照判**：规范档引批档时引用方不在批档根下 ⇒ 恒 false。
 * @param {string} refAbs 引用方档绝对路径
 * @param {string} token 写出来的档 token（裸名 ∥ `目录段/名`）
 * @param {{root:string, bases:string[]}} face `batchFaceContext` 的返回值（一次调用建一份）
 * @returns {boolean} 面判成立 ⇒ 调用方跳过该 token（不解析、不判）
 */
export function isBatchFaceRef(refAbs, token, face) {
  if (!refAbs || !face || !Array.isArray(face.bases) || face.bases.length === 0) return false
  // 判据句要求的是「**同一**批档基底根」：先定引用方落在哪一根，再要求目标也落**这一根**（两端各落各根不算）
  const refBase = baseOf(face.bases, refAbs)
  if (refBase === null) return false // 引用方不在批档面 ⇒ 面判不成立（规范档引批档照判）
  return batchFaceTargets(face.root, refAbs, token).some((t) => baseOf(face.bases, t) === refBase)
}
