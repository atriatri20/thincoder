/**
 * agent-tools/batch-gate.mjs — 文档机检门（`batch` 工具两机械点的单源门）。
 *
 * 判据与报面句子全部来自引擎 `../doc-check/index.mjs`（判据源唯一）；本门只决定**判哪几份档**与**何时强制**。
 * 判据句单源 = `docs/core/design/DOC-CHECK.md`：一段太长 ∥ 拿行号做锚 ∥ 悬空指针，三件之外不判。
 *
 * 调用面（`scope` 两取值、无第三值）：
 *   ① `writer`——`batch` 的 `append` ∥ `edit` 两路：判**写者本轮碰过的档**（触达账）∪ 批档自身。
 *      `append` 交候选全文、`edit` 交改写后的整档视图——那些字节还没落盘，所以直接从文本判，不造临时档。
 *      `REFUSED` ⇒ 调用面 throw（零字节）；门自身异常 ⇒ 放行 + 回执明示（子代理无法重启会话，卡死写账 = 无账之笔）。
 *   ② `close`——收口 ∥ `status → 已收口`：笔域集 = **触达账 ∪ 本批提交 diff ∪ 批档自身**，判域 = 其中
 *      **收口时点要判的那几档**（`judgedDomainDocs`：批档面整份移出——批档只在写的那一刻判）。
 *      `REFUSED` ∥ 门自身异常 ⇒ 调用面 throw（fail-closed）。
 *
 * **判域带时点**（判据句单源 = `docs/core/design/DOC-CHECK.md` §9）：两个 `scope` 各站一个时点，判域一律由
 * 引擎的 `judgedDomainDocs` 算——写时点原样交回，收口时点移出批档面。两处各写一份「批档免不免」，就会让
 * `范围 N 档` 与 `doc_check` 的 `checkFiles` 迟早不同数，而 `CLI 7-7` 断的就是两数相等。
 *
 * **判域 = 本批变更区**（§6）：一份档进了判域不等于它整份进来判——只判量出的那几行，区内照判三件、区外一字不出。
 * 两个时点取法不同源：收口读 `git diff -U0 <批起 sha>`（`changedRegionsOf`）；写时点读盘上现文与这一笔要写的候选
 * 全文两份（`changedRegionOf`），表里只装这一笔在写的那一档。
 * 取区之前，收口臂自己把要判的档 `git add` 掉（`stageDocs`，按路径限定、不 `git add -A`）——索引外的档
 * `git diff` 看不见，那不是「没改」（§6「收口门自己把要判的档 `git add` 掉」）。写时点不动索引。
 * 不拦的那一层不出声：门内没有「判了但不阻断」的读数行（用户令：不拦截的就不要报数）。
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import { owningProject, readManifest } from "../manifest.mjs"
import { changedRegionOf, displayPath, hitLine, judgeText, judgedDomainDocs, MOMENT } from "../doc-check/index.mjs"
import { plannedPathsOf } from "../doc-check/existence.mjs"
import { changedRegionsOf, committedDocs, stageDocs } from "./batch-regions.mjs"
import { sectionHeaderRe } from "./batch-skeleton.mjs"
import { batchProjectRoot } from "./batch-paths.mjs"

/** 文档档谓词 + 绝对化（触达账 / 提交 diff 同形；非 `.md` 不进范围）。 */
const isDocPath = (p) => typeof p === "string" && p.trim() !== "" && p.toLowerCase().endsWith(".md")
function docPaths(list, base) {
  const out = []
  for (const p of Array.isArray(list) ? list : []) if (isDocPath(p)) out.push(resolve(base, p))
  return out
}

/** 路径键（比较用：win32 折小写）。 */
const pathKey = (p) => (process.platform === "win32" ? String(p).toLowerCase() : String(p))

/**
 * `<批起 sha>` 的取法（唯一）= 批档 §1 的记入行 `批起 sha = <sha>`：段界消费 `sectionHeaderRe(1)`
 * （段头形态单源——`## §10` 不误命中 `§1`），取段内该行行内首个 40 位十六进制串。
 * 无该行 ∥ 形态不合 ∥ 读不到 ⇒ `null`——调用面按「基 sha 未定」明示，不静默。
 */
export function baseShaOf(abs) {
  let src
  try { src = readFileSync(abs, "utf8") } catch { return null }
  const hdr = sectionHeaderRe(1).exec(src)
  if (!hdr) return null
  const nextRe = /^## §\d/gm
  nextRe.lastIndex = hdr.index + hdr[0].length
  const next = nextRe.exec(src)
  const body = src.slice(hdr.index + hdr[0].length, next ? next.index : src.length)
  for (const line of body.split(/\r?\n/)) {
    if (!line.includes("批起 sha")) continue
    const sha = /[0-9a-f]{40,64}/i.exec(line)?.[0]
    if (sha) return sha
  }
  return null
}

/** 空范围返回形（`range` 恒在场——回执要读 `范围 N 档`）。 */
const emptyRange = (basis) => ({ count: 0, k: 0, basis })

/** 门自身异常态（不产 PASS：这一轮没判完，不能读成判过）。 */
const errorState = (first, range = emptyRange("none")) =>
  ({ state: "error", first, report: first, hitLines: [], noteLines: [], unjudged: [], range })

/** 成功回执行（append ∥ close ∥ status 三面同形）：verdict + `范围 N 档`。 */
export function gateReceiptLine(gate) {
  if (!gate) return ""
  if (gate.state === "not-applicable") return "\n[doc-check gate] 未跑（本项目无声明面）"
  // 「没判」照实说：判不成的档逐行点名——`范围 N 档` 只数真判过的，不把它算成干净（假绿防线）。
  const unjudged = (gate.unjudged ?? []).map((l) => `\n  ${l}`).join("")
  return `\n[doc-check gate] ${gate.first} · 范围 ${gate.range?.count ?? 0} 档${unjudged}`
}

/**
 * 拒绝串（throw 载荷）：`batch:` 前缀 + verdict 首行 + 逐条命中行 + 零字节声明。
 * 处置面不在这里：命中行说的是哪一处、为什么，改法归作者；本门只拒、不代改。
 */
export function gateRefusalMessage(gate, action = "append") {
  const writeFace = action === "append" || action === "edit"
  const lead = action === "edit"
    ? "batch: 文档机检门拒写（doc-check gate）—— 本次段内就地改未落盘，档字节不变。"
    : writeFace
      ? "batch: 文档机检门拒写（doc-check gate）—— 本次段写入未落盘，档字节不变。"
      : `batch: 文档机检门拒收口（doc-check gate）—— ${action === "close" ? "close" : "status → 已收口"} 被拒绝，§1 状态行字节不变。`
  const detail = gate.state === "error" ? String(gate.report ?? "").split("\n").slice(1) : gate.hitLines
  const noBytes = writeFace
    ? action === "edit"
      ? "Nothing was written — the target range and every other byte of the record are unchanged."
      : "Nothing was written. Do NOT close the record after a refused append — nothing landed, and closing freezes the missing section for good (失败 ⇒ 勿 close)."
    : "Nothing was written."
  return [lead, gate.first, ...(detail ?? []), `处置：同轮修正后复跑（改文档 ∥ 修引擎）；不转台账；拿不准 ⇒ 上抛主 agent 裁决。${noBytes}`].join("\n")
}

/**
 * 跑一次门（**非抛错**：门自身异常收为 `error` 态，由调用面按 `scope` 消费）。
 * @param {{abs:string, cwd?:string, agent?:object, scope?:'writer'|'close',
 *   pending?:{section?:number, body?:string, recordView?:string}|null}} o
 *   `abs` = 目标批次档绝对路径（**笔域集恒含它**；收口时点它是批档面 ⇒ 不进判域，见 `judgedDomainDocs`）；`agent._touchedFiles` = 触达记账；
 *   `pending.body` = 本次写进来的文本（`append` 候选全文）；`pending.recordView` = 改写后的整档全文（`edit`）。
 * @returns {{state:'pass'|'refused'|'error'|'not-applicable', first:string|null, report:string,
 *   hitLines:string[], noteLines:string[], unjudged:string[], range:{count:number, k:number, basis:string}}}
 *   `unjudged` = 判不成的档（逐行「不在盘，未判」∥「读不到，未判」）——回执行把它附在 `范围 N 档` 之后，
 *   且 `range.count` 只数真判过的（没判的档不算进范围、也不算干净）。
 */
export function runBatchGate({ abs, cwd, agent = {}, scope = "writer", pending = null } = {}) {
  if (scope !== "writer" && scope !== "close") {
    return errorState(`DOC-CHECK GATE: ERROR（未知 scope：${JSON.stringify(scope)}——取值只有 "writer" ∥ "close"）`)
  }
  try {
    return evaluate({ abs, cwd, agent, scope, pending })
  } catch (e) {
    return errorState(`DOC-CHECK GATE: ERROR（门自身异常：${e?.message ?? String(e)}）`)
  }
}

/** 门体（正常路径——异常由上抛给 `runBatchGate` 收口）。 */
function evaluate({ abs, cwd, agent, scope, pending }) {
  const base = resolve(cwd)
  const selfAbs = resolve(abs)
  const root = owningProject(selfAbs, base) ?? batchProjectRoot(base)
  const close = scope === "close"

  const read = readManifest(root)
  if (!read.ok && read.reason === "missing") {
    return { state: "not-applicable", first: null, report: "[doc-check gate] 未跑（本项目无声明面）", hitLines: [], noteLines: [], unjudged: [], range: emptyRange("none") }
  }

  // 取材：writer = 触达账 ∪ 批档自身；close = 触达账 ∪ 本批提交 diff ∪ 批档自身（单集，范围外的档不入判域）。
  const touched = docPaths(agent?._touchedFiles, base)
  const baseSha = close ? baseShaOf(selfAbs) : null
  const diff = close && baseSha ? committedDocs(root, baseSha) : { ok: false, base: root, files: [] }
  const diffDocs = docPaths(diff.ok ? diff.files : [], diff.base)
  // 笔域集 = 取材两面 ∪ 批档自身；判域 = 其中这一刻真判的档（§9）。收口时点批档面整份移出——
  // 判它量的是几小时前的记录与现态的距离，不是缺陷；写时点原样交回（§9 表第一行）。
  const penDomain = [...new Map([...touched, ...diffDocs, selfAbs].map((p) => [pathKey(p), p])).values()]
  const docs = judgedDomainDocs(penDomain, { moment: close ? MOMENT.close : MOMENT.writer, root })

  // 本次写入的判定输入（写时点）：`edit` = 改写后整档视图；`append` = 候选全文。
  const viewBody = !close && pending && typeof pending.recordView === "string" ? pending.recordView : null
  const body = !close && pending && typeof pending.body === "string" && pending.body.trim() ? pending.body : null
  const fromCandidate = viewBody === null && body !== null
  const inputBody = viewBody ?? body

  // 判哪几行（§6）：两个时点取法不同源。
  // 收口：按**本批变更区**收窄到行（取不到基线 ∥ 旧形批 ∥ 非 git 目录 ⇒ 空表 ⇒ 每一档都没有要判的行）。
  // 收口门自己把要判的档 add 掉再取区：索引外的档 `git diff` 看不见，那不是「没改」；没有基线就没有要取的区 ⇒ 索引也不动。
  // 写时点：表**只装这一笔在写的那一档**——该档区间 = 盘上现文与候选全文两份直接求（`changedRegionOf`），
  // 与写门同一句；盘上读不到该档现文 ⇒ 那一格 `null` = 整份判（新档同一条）；本笔没有候选文本 ⇒ 不进表 ⇒ 零输出。
  // 其余进笔域集的档本笔一字未写 ⇒ 不在表里 ⇒ 不判、不数（走下面 `region === undefined ⇒ continue`）。
  if (close && baseSha) stageDocs(root, docs)
  let regions = null
  if (close) {
    regions = changedRegionsOf(root, baseSha, docs).regions
  } else if (inputBody !== null) {
    let current = null
    try { current = readFileSync(selfAbs, "utf8") } catch { current = null }
    regions = new Map([[resolve(selfAbs), current === null ? null : changedRegionOf(current, inputBody)]])
  } else {
    regions = new Map()
  }

  const planned = plannedPathsOf(root)
  const hits = []
  const hitLines = []
  const notes = []
  const unjudged = []
  let judged = 0
  const selfKey = pathKey(selfAbs)
  for (const doc of docs) {
    const isSelf = pathKey(doc) === selfKey
    // 没有要判的行 ⇒ 这一档一行也不出（不点名、不解释，也不计入 `范围 N 档`）。
    const region = regions === null ? null : regions.get(resolve(doc))
    if (regions !== null && region === undefined) continue
    if (isSelf && inputBody !== null) {
      const given = judgeText(inputBody, { file: selfAbs, root, planned, region })
      hits.push(...given)
      const at = `${displayPath(root, selfAbs)}（${fromCandidate ? "候选文本" : "改写后整档"}）`
      for (const h of given) hitLines.push(hitLine(root, h).replace(displayPath(root, selfAbs), at))
      judged += 1
      continue
    }
    let text
    try { text = readFileSync(doc, "utf8") } catch (e) {
      // 区间面、区内只有纯删的缝、且盘上真没了（ENOENT）= 这一档在建档之后被删掉整份 ⇒ 不出一行（§6）。
      // 还在地盘上却读不到 ⇒ 它不是那个情形，照实点名（否则一条读失败就被吞成零输出了）。
      // `region === null`（这一档判整份）不是那个情形——那一格走的是读盘后的整份判。
      if (regions !== null && region !== null && (region.rows ?? []).length === 0 && e?.code === "ENOENT") continue
      unjudged.push(e?.code === "ENOENT" ? `${displayPath(root, doc)} 不在盘，未判` : `${displayPath(root, doc)} 读不到，未判`)
      continue
    }
    judged += 1
    const given = judgeText(text, { file: doc, root, planned, region })
    hits.push(...given)
    for (const h of given) hitLines.push(hitLine(root, h))
  }
  if (fromCandidate) notes.push("本次写入尚未落盘——一个字没写（档字节逐字不变）。")

  const first = hits.length ? "DOC-CHECK GATE: REFUSED" : "DOC-CHECK GATE: PASS"
  return {
    state: hits.length ? "refused" : "pass",
    first,
    report: [first, ...hitLines, ...unjudged, ...notes].join("\n"),
    hitLines,
    noteLines: notes,
    unjudged,
    range: { count: judged, k: hits.length, basis: close ? (baseSha === null ? "touched（基 sha 未定）" : diff.ok ? "touched+diff" : "touched（提交 diff 腿未取到）") : "touched+pending" },
  }
}
