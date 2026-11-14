/**
 * agent/offload.mjs — 一次「把超长正文落到盘上、把注入体压成预览 + 路径」：门限常量 → 两端安全切片 → 预览拼装 → 落盘 → 写时自清理。
 */
import { configDir } from "../config.mjs"
import { writeFile, mkdir, readdir, stat, unlink } from "node:fs/promises"
import { join } from "node:path"
import { safeSliceUTF16, safeSliceUTF16Tail } from "../text-budget.mjs"

const TOOL_RESULT_OFFLOAD_LIMIT = 64 * 1024 // 65536 chars — offload only above 64K (2026-08-24)
const TOOL_RESULT_PREVIEW = 64 * 1024 // total preview budget: head + middle note + tail ≤ 65536 (aligns with CLI/VS Code webview)

/** Dual-end preview: head + middle-omitted note + tail — the tail carries results/errors/stats that a
 *  pure-head truncation would cut off (design §5 D-4.1; `docs/core/design/TOOL-OUTPUT-LIMITS.md` §2).
 *
 *  `budget` is REQUIRED and has no default (`CONTEXT-COMPACTION.md` §1.2): a default would decide the
 *  caller's crop size on its behalf. head = floor(budget / 4), the note reports the ACTUAL omitted
 *  count, tail = budget remainder (never a hardcoded number).
 *  The 64K face is byte-identical to before: floor(65536 / 4) = 16384 was the old fixed head, and the
 *  old 48K tail nominal was only ever `budget − head − note` — the cap never bit.
 *
 *  Both cut points run the surrogate-safe slices exported by `text-budget.mjs`. The deleted local END
 *  slice guarded only the slice START; `safeSliceUTF16Tail` also drops a lone high surrogate at the
 *  trailing end, so a result that itself ends in half a surrogate pair loses one more code unit.
 *  Callers only pass text LONGER than the budget (a shorter body would come out twice). */
export function buildDualEndPreview(text, budget) {
  if (!(typeof budget === "number" && Number.isFinite(budget) && budget > 0)) {
    throw new Error("buildDualEndPreview: `budget` is required (a positive character budget, no default) — pass the preview budget this caller needs")
  }
  const t = String(text ?? "")
  const head = safeSliceUTF16(t, Math.floor(budget / 4))
  const noteFn = (omitted) => `\n\n… [middle omitted: ${omitted} chars] …\n\n`
  const tailLen = Math.max(0, budget - head.length - noteFn(t.length).length)
  const tail = safeSliceUTF16Tail(t, tailLen)
  return head + noteFn(Math.max(0, t.length - head.length - tail.length)) + tail
}

/** Offload-dir write-time self-cleanup retention window (2026-08-21): files older than 3 days are deleted on the next offload. */
export const TMP_RETENTION_MS = 3 * 24 * 3600 * 1000

/**
 * Best-effort write-time self-cleanup: delete files in dir whose mtime exceeds TMP_RETENTION_MS.
 * Subdirectories are never touched; every failure is silent — cleanup must not affect offload.
 */
export async function cleanupOldToolResults(dir) {
  const now = Date.now()
  let entries
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return // dir missing or unreadable → nothing to clean
  }
  for (const entry of entries) {
    if (!entry.isFile()) continue // subdirectories untouched
    try {
      const st = await stat(join(dir, entry.name))
      if (now - st.mtimeMs > TMP_RETENTION_MS) await unlink(join(dir, entry.name))
    } catch {
      /* entry vanished concurrently or I/O error — best effort, keep going */
    }
  }
}

/** Offload a tool result / report to disk (§2.2): `force` = write regardless of size (async
 *  subagent reports must survive the parent turn). Rendering splits on the SAME constant as the old
 *  gate: ≤ TOOL_RESULT_OFFLOAD_LIMIT ⇒ body once + path (never dual-end — a short body would come
 *  out twice with `middle omitted: 0 chars`); > ⇒ dual-end preview + path. Writes self-clean first. */
export async function offloadToolResult(text, callId, dir = join(configDir, "tool-results"), { force = false } = {}) {
  const overLimit = text.length > TOOL_RESULT_OFFLOAD_LIMIT
  if (!force && !overLimit) return text
  try {
    await cleanupOldToolResults(dir)
    await mkdir(dir, { recursive: true })
    const file = join(dir, `${Date.now()}-${String(callId).replace(/[^a-zA-Z0-9_-]/g, "_")}.log`)
    await writeFile(file, text, "utf8")
    if (!overLimit) return `${text}\n\n[... full content saved to: ${file}\nPage through it with the read tool (offset/limit) if you need the full text later.]`
    return buildDualEndPreview(text, TOOL_RESULT_PREVIEW) + `\n\n[... output too large (${text.length} chars total), full content saved to: ${file}\n` +
      `Page through it with the read tool (offset/limit) or sed -n 'START,ENDp' — do NOT re-run the tool blindly.]`
  } catch {
    // 写盘失败不吞报告：>LIMIT 走双端预览 + 原文案；≤LIMIT 正文整段在前（不谎称 truncated）
    const body = overLimit ? buildDualEndPreview(text, TOOL_RESULT_PREVIEW) : text
    return body + (overLimit ? `\n\n[... truncated: ${text.length} chars total, offload to disk failed]`
      : `\n\n[... full text kept inline above (${text.length} chars), offload to disk failed]`)
  }
}
