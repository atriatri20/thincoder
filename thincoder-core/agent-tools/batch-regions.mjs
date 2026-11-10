/**
 * agent-tools/batch-regions.mjs — 批档门的 git 改动区、片段路径与纯删基线映射。
 *
 * 判域单源 = `docs/core/design/DOC-CHECK.md` §2.9.4：写段与收口共用批起基线；
 * 纯删按前后端行号映射存活行，新组合单元不因邻段存量而放行。
 */
import { execFileSync } from "node:child_process"
import { readFileSync, unlinkSync, writeFileSync } from "node:fs"
import { dirname, join, relative } from "node:path"

import { runDocCheck, DOC_CLASS } from "../doc-check/index.mjs"
import { fragmentZones, mergeZones, paragraphRuns } from "../tools/doc-write-gate.mjs"

/** 片段档名前缀（与批档同目录的隐藏档——锚解析序 ② 与批档本体同源）。**导出面**：`batch-lifecycle.mjs` 的在飞
 *  扫描要靠它把两类片段档排除在外——`edit` 面的 `recordView` 是**整档副本**（`## §1` 段头 + `进行中` 都在），
 *  不排除就会被当成第二本在飞批（假拒），进程被杀则残留一本永久 open 的幽灵档。 */
export const FRAGMENT_PREFIX = ".gate-"

/** 片段档路径（每次一个随机名：并发两次门不撞名，也不互删）。 */
export function fragmentPathOf(abs) {
  return join(dirname(abs), `${FRAGMENT_PREFIX}${process.pid}-${Math.random().toString(36).slice(2, 10)}.md`)
}

/** 平台路径键（win32 大小写不敏感——只作集比对，非判据面）。 */
const pathKey = (p) => (process.platform === "win32" ? p.toLowerCase() : p)

/** 读档（读不到 ⇒ 空串：归属标注取不到就只出 `§N`，不猜）。 */
function safeRead(abs) {
  try { return readFileSync(abs, "utf8") } catch { return "" }
}

/**
 * 本批提交 diff 腿（`git diff --name-only <sha> HEAD`——只取清单，判定归引擎）：路径以**仓根**
 * （`rev-parse --show-toplevel`）为基还原——项目根住大仓子目录时条目不丢（清单相对仓根）。
 * `-c core.quotepath=false`：不关此开关时 git 把含非 ASCII 字节的路径整串加引号转义，
 * 下流 `endsWith(".md")` 判据会判假 ⇒ 非 ASCII 档名的档静默掉出范围（正是本批要关的「范围跑偏」）。
 * 跑不出（非仓 / sha 不可解析）⇒ `ok: false` + 空集（调用面按「基 sha 未定」明示，不静默）。
 */
export function committedDocs(root, sha) {
  const run = (cwd, argv) => execFileSync("git", ["-C", cwd, "-c", "core.quotepath=false", ...argv], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 8000 })
  try {
    const top = run(root, ["rev-parse", "--show-toplevel"]).trim() || root
    const files = run(top, ["diff", "--name-only", sha, "HEAD"]).split(/\r?\n/).filter(Boolean)
    return { ok: true, base: top, files }
  } catch {
    return { ok: false, base: root, files: [] }
  }
}

/** git 输出（成功 = trim 后的 stdout；跑不出 ⇒ `null`——非仓 ∥ 无 git 二进制 ∥ 无该对象同一支，由调用面按四态分流）。 */
function gitOut(cwd, argv) {
  try {
    return execFileSync("git", ["-C", cwd, "-c", "core.quotepath=false", ...argv], { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 8000 }).trim()
  } catch { return null }
}

/** git 读基线全文；保留文末换行，不用 gitOut 的 trim。 */
function gitFileText(cwd, sha, relPath) {
  try {
    return execFileSync("git", ["-C", cwd, "show", `${sha}:${relPath}`], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 8000,
    })
  } catch { return null }
}

/** diff hunk 的双侧行号；零宽侧的起点归一成「下一个存活行」，供纯删映射使用。 */
function diffHunksOf(text, relPath) {
  const out = []
  const want = `+++ b/${relPath}`
  let active = false
  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (line.startsWith("+++ ")) { active = line.trim() === want; continue }
    if (!active) continue
    const m = /^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@/.exec(line)
    if (!m) continue
    const oldCount = m[2] === undefined ? 1 : Number(m[2])
    const newCount = m[4] === undefined ? 1 : Number(m[4])
    out.push({
      oldStart: oldCount === 0 ? Number(m[1]) + 1 : Number(m[1]), oldCount,
      newStart: newCount === 0 ? Number(m[3]) + 1 : Number(m[3]), newCount,
    })
  }
  return out
}

/** 改后行号区间；纯删段保持零宽，交给同一张扩区表。 */
function diffRangesOf(text, relPath) {
  return diffHunksOf(text, relPath).map((h) => ({ start: h.newStart, end: h.newStart + h.newCount - 1 }))
}

/**
 * 触达账腿的改动区（四态判定 · 判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「改动区取法（基线两级 · 四态判定）」）：
 * **先问「在不在 git 仓」、再问「该档在不在跟踪面」**——问序反了就把 ④ 吃掉（非 git 仓里所有档都「不在跟踪面」，
 * 会被 ② 判成整档，而那正是本批要治的病）。返 `Map<pathKey, {kind:'region',zones}|{kind:'whole'}|{kind:'unknown',why}>`。
 * 扩区只调用写前门的导出（单源）：「什么叫一段」仍只由 `thincoder-core/doc-check/paragraph.mjs` 的谓词族定。
 * 逐档一次 `git diff -U0 <基线> -- <该档>`；任何一步问不出（无 git ∥ 抛错）⇒ `unknown` + `why`，**不抛给门体**
 * （写段面向宽并明示；收口面使用批起基线，区未定时整档判兜底）。
 */
export function touchedRegions(docs, baseSpec) {
  const out = new Map()
  // 同一次门内按仓缓存：仓根 ∥ 跟踪面清单 ∥ 基线解析——省下的是「每档三次」的机跑，判据一点不改。
  const tops = new Map() // dirname → 仓根 ∥ null（非仓）
  const indexes = new Map() // 仓根 → Set(相对路径) ∥ null（清单跑不出）
  const bases = new Map() // 仓根 → 基线 sha ∥ null（不可解析）
  for (const abs of docs) {
    try {
      const dir = dirname(abs)
      if (!tops.has(dir)) tops.set(dir, gitOut(dir, ["rev-parse", "--show-toplevel"]))
      const top = tops.get(dir)
      if (!top) { out.set(pathKey(abs), { kind: "unknown", why: "不在 git 仓" }); continue }
      if (!indexes.has(top)) {
        const list = gitOut(top, ["ls-files", "-z"])
        indexes.set(top, list === null ? null : new Set(list.split("\0").filter(Boolean)))
      }
      const index = indexes.get(top)
      if (index === null) { out.set(pathKey(abs), { kind: "unknown", why: "git ls-files 跑不出" }); continue }
      const relPath = relative(top, abs).replace(/\\/g, "/")
      // ② 在仓而**不在**跟踪面 ⇒ 整档：写工具不提交 ⇒ 未跟踪的 `.md` 只可能是本轮新建的档。
      if (!index.has(relPath)) { out.set(pathKey(abs), { kind: "whole" }); continue }
      if (!bases.has(top)) bases.set(top, gitOut(top, ["rev-parse", "--verify", "--quiet", `${baseSpec}^{commit}`]))
      const base = bases.get(top)
      if (!base) { out.set(pathKey(abs), { kind: "unknown", why: `基线不可解析（${baseSpec}）` }); continue }
      const atBase = gitOut(top, ["ls-tree", "--name-only", base, "--", relPath])
      if (atBase === null) { out.set(pathKey(abs), { kind: "unknown", why: "git ls-tree 跑不出" }); continue }
      if (atBase === "") { out.set(pathKey(abs), { kind: "whole" }); continue } // 基线没有该档：整份都是本批的笔
      const diff = gitOut(top, ["diff", "-U0", base, "--", relPath])
      if (diff === null) { out.set(pathKey(abs), { kind: "unknown", why: "git diff 跑不出" }); continue }
      const lines = safeRead(abs).split("\n")
      const hunks = diffHunksOf(diff, relPath)
      const zones = mergeZones(diffRangesOf(diff, relPath).flatMap((r) => fragmentZones(lines, r)))
      out.set(pathKey(abs), { kind: "region", zones, hunks, base, top, relPath })
    } catch {
      out.set(pathKey(abs), { kind: "unknown", why: "判定抛错" })
    }
  }
  return out
}

/** 按 hunk 前后端行号映射存活行；不按相同文本猜对应关系。 */
function survivingLineMap(hunks, newLength) {
  const map = new Map()
  let oldNext = 1
  let newNext = 1
  for (const h of hunks) {
    while (newNext < h.newStart && oldNext < h.oldStart) {
      map.set(newNext, oldNext)
      newNext++
      oldNext++
    }
    oldNext = h.oldStart + h.oldCount
    newNext = h.newStart + h.newCount
  }
  while (newNext <= newLength) {
    map.set(newNext, oldNext)
    newNext++
    oldNext++
  }
  return map
}

/**
 * 纯删面的存量识别：逐行文本判据要能在基线同一存活行找到同形命中；
 * 段类另比完整成员行，删除造成的新组合段不能借邻段的基线命中退场。
 */
export function pureDeleteStockEntries(entries, root, regions) {
  const stock = new Set()
  const groups = new Map()
  for (const entry of entries) {
    const region = regions.get(pathKey(entry.file))
    if (region?.kind !== "region" || !region.hunks.some((h) => h.newCount === 0)) continue
    const key = pathKey(entry.file)
    if (!groups.has(key)) groups.set(key, { file: entry.file, region, entries: [] })
    groups.get(key).entries.push(entry)
  }
  for (const { file, region, entries: list } of groups.values()) {
    const baseText = gitFileText(region.top, region.base, region.relPath)
    if (baseText === null) throw new Error(`纯删基线读不出：${region.relPath}`)
    const baselineAbs = fragmentPathOf(file)
    try {
      writeFileSync(baselineAbs, baseText)
      const baseline = runDocCheck(root, { mode: "gate", docs: [baselineAbs] })
      const baseHits = [...baseline.anchorHits, ...baseline.paragraphHits, ...(baseline.lineRefHits ?? [])]
      const currentLines = safeRead(file).split("\n")
      const baseLines = baseText.split("\n")
      const lineMap = survivingLineMap(region.hunks, currentLines.length)
      const deletionZones = mergeZones(region.hunks.filter((h) => h.newCount === 0)
        .flatMap((h) => fragmentZones(currentLines, { start: h.newStart, end: h.newStart - 1 })))
      const currentParas = paragraphRuns(currentLines)
      const baseParas = paragraphRuns(baseLines)
      for (const entry of list) {
        if (!deletionZones.some((z) => entry.line >= z.start && entry.line <= z.end)) continue
        const oldLine = lineMap.get(entry.line)
        if (oldLine === undefined) continue
        if (entry.clazz === DOC_CLASS.para) {
          const unit = currentParas.find((r) => r.start <= entry.line && entry.line <= r.end)
          if (!unit) continue
          const mapped = []
          for (let line = unit.start; line <= unit.end; line++) {
            const old = lineMap.get(line)
            if (old === undefined) { mapped.length = 0; break }
            mapped.push(old)
          }
          if (mapped.length !== unit.end - unit.start + 1) continue
          const baseUnit = baseParas.find((r) => r.start === mapped[0] && r.end === mapped[mapped.length - 1])
          if (baseUnit && baseHits.some((h) => h.clazz === DOC_CLASS.para && h.line === baseUnit.start)) stock.add(entry)
          continue
        }
        if (baseHits.some((h) => h.line === oldLine && h.clazz === entry.clazz && String(h.token ?? "") === String(entry.token ?? ""))) {
          stock.add(entry)
        }
      }
    } finally {
      try { unlinkSync(baselineAbs) } catch { /* 清理失败不覆盖判定 */ }
    }
  }
  return stock
}
