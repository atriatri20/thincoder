/**
 * doc-check/line-reads.mjs — **行数读数**族：量法的唯一实现 ∥ 档位标记 ∥ `lines` 清单归一与读数块。
 *
 * 机制单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「行数读数」块（本档只实现，不重述口径）；
 * 分拆落点与验收 = `docs/core/design/DOC-CHECK.md` §2.9.7。
 * **这一族不是判据**：读数不进 `hits`、不进 verdict、不动跳过行与读面行，`gate` 面带 `lines` 直接抛错。
 *
 * `DOC_CHECK_BUILTINS`（判据参数的数值单源）住 `./paragraph.mjs` ⇒ 本档只吃它，不回指引擎（分拆后不建环）。
 */
import { readFileSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { DOC_CHECK_BUILTINS } from "./paragraph.mjs"
import { pathKey, rel } from "./per-root.mjs"

/**
 * 内容行数（**全仓唯一实现** · 量法的家）：口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「行数读数」块。
 * 两个消费面同取这一个函数——`lines` 读数面（引擎）∥ `scripts/doc-check-linecounts.mjs` 的再出口（零函数体）。
 * 为什么必须单源：同一份档用 shell 计数 ∥ 编辑器状态栏 ∥ 读工具行号各量一次，会得到四个数、四份「口径」，
 *   而其中只有这里的一个是判据值——其余不是「另一种口径」，是错的（§3.22 U-2）。
 * 算法不在此重述（D2）：末行有无换行这类边界以实现为准，行数 = 内容行数、文末换行不计。
 */
export function countContentLines(text) {
  const parts = text.split("\n")
  if (parts.length && parts[parts.length - 1] === "") parts.pop()
  return parts.length
}

/** 尺寸档位标记的**档类闭集**：只有源 / 单元测试档带标记；其余档（含 `.md`）只出数。
 *  `.md` 零标记是用户裁定下的行为，不是遗漏——文档档零行数义务、零拆分触发（§3.7 条目 H ∥ §3.10）。 */
const SIZE_TIER_EXTS = Object.freeze([".mjs", ".cjs", ".js"])

/** 档位分级（严格大于 · 阈值单源 = `DOC_CHECK_BUILTINS`）：越其他检查硬线 ⇒ `hard` ∥ 越设计器硬线 ⇒ `soft` ∥ 未越线 ∥ 非源档 ⇒ `null`。 */
function sizeTier(n, abs) {
  const lower = abs.toLowerCase()
  if (!SIZE_TIER_EXTS.some((e) => lower.endsWith(e))) return null
  if (n > DOC_CHECK_BUILTINS.fileHardMax) return "hard"
  if (n > DOC_CHECK_BUILTINS.fileSoftMax) return "soft"
  return null
}

/** 档位标记字面（单源 · 字面随常量取值）：读面行尾追加，未越线不追加。 */
function sizeTierMark(tier) {
  if (tier === "hard") return `越 ${DOC_CHECK_BUILTINS.fileHardMax}（其他检查硬线：必须拆）`
  if (tier === "soft") return `越 ${DOC_CHECK_BUILTINS.fileSoftMax}（设计器硬线：设计轮必给分拆方案）`
  return ""
}

/**
 * `lines` 清单 → 逐档读数（去重后按路径升序，同 `resolveRange` 的既有形）。
 * 失败面 = fail-closed（业务门纪律：该失败就失败）——六类各抛一条，**整次零读数**，不静默丢一条：
 *   非数组 ∥ 空清单（含全空白元素——清单不指任何档）∥ 条目非字符串（点名下标）∥
 *   条目不在盘 ∥ 在盘但不是档 ∥ 读不到（均点名该档）。抛错串首 `doc_check: `，调用方见 `Error: …` 且 `ok: false`。
 * @returns {{file:string, lines:number, tier:'hard'|'soft'|null}[]} `file` = 绝对路径（与 `anchorHits` 同形）
 */
export function resolveLineReads(base, lines) {
  if (!Array.isArray(lines)) {
    throw new Error(`doc_check: \`lines\` must be an array of paths (got ${typeof lines}) — a bare value is refused rather than read as one file; pass ["<path>"].`)
  }
  if (lines.length === 0) {
    throw new Error('doc_check: `lines` is empty — an empty list names no file, so nothing can be measured; list the files you mean.')
  }
  const notPaths = []
  lines.forEach((d, i) => { if (typeof d !== "string") notPaths.push(i) })
  if (notPaths.length) {
    throw new Error(`doc_check: \`lines\` entries ${notPaths.map((i) => `[${i}]`).join(", ")} are not paths — every entry must be a non-empty string; no file was measured.`)
  }
  if (lines.every((d) => d.trim() === "")) {
    throw new Error('doc_check: `lines` names no file — every entry is blank, so nothing can be measured; list the files you mean.')
  }
  // 混在有效条里的空白条目不再另立拒绝支：`""` 解析为 base 目录、`"   "` 落不在盘——两支各自抛错，一样 fail-closed。
  const seen = new Set()
  const abs = []
  for (const d of lines) {
    const p = resolve(base, d)
    const key = pathKey(p)
    if (seen.has(key)) continue
    seen.add(key)
    abs.push(p)
  }
  const reads = []
  const missing = []
  const notFile = []
  const unreadable = []
  for (const p of abs.sort()) {
    let st
    try { st = statSync(p) } catch { missing.push(p); continue }
    if (!st.isFile()) { notFile.push(p); continue }
    let text
    try { text = readFileSync(p, "utf8") } catch { unreadable.push(p); continue }
    const n = countContentLines(text)
    reads.push({ file: p, lines: n, tier: sizeTier(n, p) })
  }
  if (missing.length) {
    throw new Error(`doc_check: \`lines\` names ${missing.length} file(s) that are not on disk — no file was measured: ${missing.map((p) => rel(base, p)).join(" ∥ ")}.`)
  }
  // 目录 ∥ 设备档：在盘但不是档——归在这里点名（不能说它「不在盘」）。
  if (notFile.length) {
    throw new Error(`doc_check: \`lines\` names ${notFile.length} path(s) that are on disk but are not files — no file was measured: ${notFile.map((p) => rel(base, p)).join(" ∥ ")}.`)
  }
  if (unreadable.length) {
    throw new Error(`doc_check: \`lines\` names ${unreadable.length} file(s) that are on disk but cannot be read — no file was measured: ${unreadable.map((p) => rel(base, p)).join(" ∥ ")}.`)
  }
  return reads
}

/**
 * 读数块（固定句形 · §3.20「行数读数」）：块首行写量法与档类射程 → 逐档一行（行数 + 档路径，越线时行尾追加标记）
 * → 末行合计三数。块内无空行；位置 = 读面行之后、行号坐标清单块之前（末行仍留给 `结论：…`）。
 */
export function lineReadBlock(base, reads) {
  const hard = reads.filter((r) => r.tier === "hard").length
  const soft = reads.filter((r) => r.tier === "soft").length
  const out = ["行数读数（量法 = countContentLines · 档位标记只给源 / 单元测试档；.md 档只出数不标）"]
  for (const r of reads) out.push(`  ${r.lines}  ${rel(base, r.file)}${r.tier ? `  · ${sizeTierMark(r.tier)}` : ""}`)
  out.push(`合计 ${reads.length} 档（其他检查硬线 ${hard} · 设计器硬线 ${soft} · 未越线 ${reads.length - hard - soft}）`)
  return out
}