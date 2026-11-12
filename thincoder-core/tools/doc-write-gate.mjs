/**
 * tools/doc-write-gate.mjs — 写前文档机检门（写盘面）。
 *
 * 判据句单源 = `docs/core/design/DOC-CHECK.md`（本档只装配，不重述口径）：一段太长 ∥ 拿行号做锚 ∥ 悬空指针。
 * 挂点唯一 = `./write-path.mjs` 的 `writeThroughPath`（`op === "write"`，含 `apply_patch` 的 stage 段）。
 *
 * 一句话：文档面 `.md` 的每一笔内容写，在**落盘之前**判**改后整份内容**——命中即 throw、零字节。
 * **时点 = 写时点**（判据句单源 = `docs/core/design/DOC-CHECK.md` §9）：判域谓词原样交回，所以批档面在这一刻
 * 照判段长 ∥ 行号锚（悬空按 §3 第二条例免）——与 §9 之前逐字相同。
 * **判域 = 整份文档（写时点）**：写门交 `regions: null`（单源 = `docs/core/design/DOC-CHECK.md` §6「写门与 `report` mode 交 `null`」）
 *——不剥公共前后缀、不取改动区、不加 ±2 行上下文。按变更区收窄的只有**收口那一刻**；写时点判的是这一笔将要落盘的整份内容。
 *
 * 判据本体零副本（D2）：三条判据与报面句子全部来自 `../doc-check/index.mjs` 的导出。
 */
import { readFileSync } from "node:fs"
import { parse, resolve } from "node:path"

import { owningProject } from "../manifest.mjs"
import { hitLine, judgeText, judgedDomainDocs, MOMENT } from "../doc-check/index.mjs"
import { pathIndexOf, plannedPathsOf } from "../doc-check/existence.mjs"
import { faceDetail } from "../agent/write-face.mjs"

/**
 * 写前门（挂点唯一的入口）。
 *
 * @param {{abs:string, content:string, root?:string}} o
 *   `abs` = 目标绝对路径；`content` = **改后整份内容**（各写径实读同形 ⇒ 门不必自己合并改动）；
 *   `root` = 文档机检的基根，**显式参数**，缺省回落 = `owningProject(abs, <目标所在盘根>)`。
 * @returns {{judged:boolean, hits:number}} 面窄化（非 `.md` ∥ 出辖 ∥ 内容逐字未变）⇒ `judged:false`；
 *   放行 ⇒ `hits:0`。命中 ⇒ **throw**（拒串 = verdict + 逐条命中行 + 零字节声明），目标档字节不变。
 */
export async function runDocWriteGate({ abs, content, root } = {}) {
  const target = resolve(String(abs ?? ""))
  if (typeof content !== "string") return { judged: false, hits: 0 }
  if (!target.toLowerCase().endsWith(".md")) return { judged: false, hits: 0 }
  const projectRoot = root ? resolve(root) : owningProject(target, parse(target).root)
  if (!projectRoot) return { judged: false, hits: 0 }
  if (faceDetail(target).reason !== "doc-root") return { judged: false, hits: 0 }
  // 逐字未变 ⇒ 这一笔不写任何字节 ⇒ 判面为空（不是「放行一条有问题的档」）。
  let old = null
  try { old = readFileSync(target, "utf8") } catch { old = null }
  if (old !== null && old === content) return { judged: false, hits: 0 }

  // 判域谓词（判据句单源 = `docs/core/design/DOC-CHECK.md` §9）：本门站在**写时点**——那一刻判域原样交回，
  // 所以批档面照判段长 ∥ 行号锚（悬空按 §3 第二条例免）。这一笔写出去的是目标档改后整份内容，判域里只有它自己：
  // 谓词在这里是「报到」，不是过滤器。判域那一维不变：写时点一律判**整份**（`region: null`）。
  const domain = judgedDomainDocs([target], { moment: MOMENT.writer, root: projectRoot })
  // 判域与目标档对不上 = 接线错了，不是「这一笔没病」：当场抛带门名的错，不转发 `resolve(undefined)` 那种语言错，
  // 也不静默判零条（判零条会交一个 `hits:0` 的放行——门没判过却报干净）。
  if (domain.length !== 1 || domain[0] !== target) {
    throw new Error(`doc_write_gate: 判域异常——写时点判域应恒含目标档本身，实得 ${domain.length} 档（判域与写时点不一致；本笔未落盘）。Nothing was written.`)
  }
  const [file] = domain
  const planned = plannedPathsOf(projectRoot)
  const indexPath = pathIndexOf(projectRoot)
  const hits = judgeText(content, { file, root: projectRoot, planned, indexPath, region: null })
  if (hits.length === 0) return { judged: true, hits: 0 }
  throw new Error([
    "doc_write_gate: 文档机检门拒写（doc-check gate）—— 本次写入未落盘，目标档字节逐字不变（零字节）。",
    "DOC-CHECK GATE: REFUSED",
    ...hits.map((h) => hitLine(projectRoot, h)),
    "处置：改掉上面每一处再写同一笔；拿不准 ⇒ 上抛主 agent 裁决。Nothing was written.",
  ].join("\n"))
}
