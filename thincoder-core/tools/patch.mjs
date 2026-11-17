import {
  DESC,
  autoSyntaxCheck,
  resolveInCwd,
  normalizeEOL,
  detectFileEol,
  majorityEol,
  LEDGER_PARAM_DESC,
  PROJECT_PARAM_DESC
} from "./shared.mjs";
import { writeThroughPath, TMP_SUFFIX, markDirty, clearLastWrite } from "./write-path.mjs";
// 失败回执（未全成）两件文案单源 = edit-receipt.mjs（骨架单源 = EDIT-HELPERS §4 ·
// 决策 = APPLY-PATCH §7 D-P4）：与 `edit` 批面同一副骨架，本工具只填工具名 ∥ 单位 ∥ 定位。
import { editEntryFailureLine, editBatchSummary, FILE_UNIT } from "./edit-receipt.mjs";
import { spawnGit } from "./git-run.mjs";
import { mkdir, readFile, lstat, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { relative, dirname } from "node:path";

/**
 * Parse a unified diff: returns [{ path, isNew, hunks: [{ ops: [{type:" "|"-"|"+", text}] }] }]
 * Consume hunk lines by the line counts in the @@ header — LLMs often strip context blank lines to pure empty lines,
 * so we use counts rather than first characters to determine hunk boundaries.
 * APPLY-PATCH.md §3: a bare "@@" header (no coordinates) is accepted — the hunk body runs until the next hunk/file header
 * ("@@" / "--- " / "+++ " / "diff " / "index "), purely located by its ops.
 */
/**
 * P15.10（2026-09-05 用户裁定——「符合模型直觉」）：文件头判定——
 * 完整头（`--- x` 后随 `+++ `）任意老路径形态均认（git 规范）；
 * 容缺头（`+++ b/<path>` 配对行省略——模型单文件补丁自然形态）仅认 a//b/ 前缀——
 * newPath 推导 = oldPath；`/dev/null` 容缺仍拒（新文件名从 --- 侧不可推导——parsePatch 内特报）；
 * 其他 `--- x` = 普通删行内容（行首标记 - + 内容 `-- x`）——不是文件头——hunk 体不得误断。
 */
function isFileHeader(line, nextLine) {
  if (!line.startsWith("--- ")) return false
  if (nextLine?.startsWith("+++ ")) return true
  return /^[ab]\//.test(line.slice(4).trim())
}

function parsePatch(patch) {
  // Patch text often comes from CRLF terminals/model output; trailing \r mixed into hunk content breaks context matching, strip uniformly
  const lines = patch.replace(/\r(?=\n|$)/g, "").split("\n")
  const files = []
  let cur = null
  let i = 0
  const stripPrefix = (p) => p.replace(/^[ab]\//, "")
  while (i < lines.length) {
    const line = lines[i]
    if (line.startsWith("--- ")) {
      const oldPath = line.slice(4).trim()
      const plus = lines[i + 1]
      if (plus?.startsWith("+++ ")) {
        const newPath = plus.slice(4).trim()
        if (newPath === "/dev/null") throw new Error("Deleting files via patch is not supported — use the delete tool")
        cur = { path: stripPrefix(newPath), isNew: oldPath === "/dev/null", hunks: [] }
        files.push(cur)
        i += 2
        continue
      }
      // P15.10：容缺头——`--- a/<path>`（或 b/ 前缀）后直接跟 hunk = 对同路径的修改。
      if (/^[ab]\//.test(oldPath)) {
        cur = { path: stripPrefix(oldPath), isNew: false, hunks: [] }
        files.push(cur)
        i += 1
        continue
      }
      if (oldPath === "/dev/null") {
        throw new Error(`"--- /dev/null" needs a "+++ b/<path>" line naming the new file — the --- side does not carry the file name`)
      }
      throw new Error(`Malformed patch: expected "+++" line after "${line}"`)
    }
    if (line.startsWith("@@")) {
      if (!cur) throw new Error("Malformed patch: hunk header before any file header")
      const m = line.match(/^@@ -\d+(?:,(\d+))? \+\d+(?:,(\d+))? @@/)
      if (!m) {
        // APPLY-PATCH.md §3：坐标裸 "@@" 头——hunk 完全靠操作行定位。
        // 无行数可用：操作行以 " " / "-" / "+" 开头（空行宽容为上下文行），
        // 直到下一个 hunk 头 / 文件头 "@@"/"--- "/"+++ "/"diff "/"index " 为止。
        if (!/^@@(?: @@)?\s*$/.test(line)) {
          throw new Error(`Malformed patch: bad hunk header "${line}" (need @@ -old,count +new,count @@ or bare @@)`)
        }
        const hunk = { ops: [] }
        i++
        while (i < lines.length) {
          const hl = lines[i]
          if (hl.startsWith("@") || isFileHeader(hl, lines[i + 1]) || hl.startsWith("+++ ") || hl.startsWith("diff ") || hl.startsWith("index ")) break
          if (hl.startsWith("\\")) { i++; continue } // "\ No newline at end of file"
          // 宽容空行=上下文行——但 patch 文本末尾（或 hunk 之间/文件头之前）的 "" 是
          // 分隔产物而非内容：仅当后继仍是操作行时才当作上下文消费。
          // 复评 #1（2026-09-04）：文件头 "--- "/"+++ " 以 -/+ 开头会被 op 前缀判定误收——
          // 文件头前的分隔空行不得吞成幽灵上下文行（会把 - 锚序列尾部拼上 ""——跨文件
          // 零上下文 hunk 因此误报 not-found）。
          const next = lines[i + 1]
          if (hl === "" && (next == null || !/^[ +\-\\]/.test(next) || isFileHeader(next, lines[i + 2]) || next.startsWith("+++ "))) break
          const tag = hl === "" ? " " : hl[0]
          if (tag !== " " && tag !== "-" && tag !== "+") break // metadata / file section end
          hunk.ops.push({ type: tag, text: hl === "" ? "" : hl.slice(1) })
          i++
        }
        if (hunk.ops.length === 0) throw new Error(`Malformed patch: empty coordinate-less hunk "${line.trim()}"`)
        const ctxCount = hunk.ops.filter((o) => o.type === " ").length
        // §3 (APPLY-PATCH.md——2026-09-04)：context<2 且含 ≥1 个 - 行 → 接受——定位锚 = hunk 内
        // 匹配行序列（空格上下文行 + - 行——按出现序）连续——唯一匹配即应用（applyHunks 既有锚匹配域——
        // 多匹配 / not-found 语义不变）。0 上下文与 1 上下文同待遇（评审 #4a）。
        // 纯 +（无 - 锚）且 context<2 仍拒——插入位置不可判——报错引导加锚（NF15.8c）。
        const removedCount = hunk.ops.filter((o) => o.type === "-").length
        if (ctxCount < 2 && removedCount === 0) {
          throw new Error(
            `Coordinate-less hunk ${cur.hunks.length + 1} in ${cur.path} has ${ctxCount} context line(s) — add more context lines`,
          )
        }
        cur.hunks.push(hunk)
        continue
      }
      let oldNeed = m[1] == null ? 1 : Number(m[1])
      let newNeed = m[2] == null ? 1 : Number(m[2])
      const hunk = { ops: [] }
      i++
      while (oldNeed > 0 || newNeed > 0) {
        if (i >= lines.length) throw new Error("Malformed patch: hunk truncated (line counts in @@ header not satisfied)")
        const hl = lines[i]
        if (hl.startsWith("\\")) { i++; continue } // "\ No newline at end of file"
        const tag = hl === "" ? " " : hl[0] // pure blank line: treat leniently as context line
        const text = hl === "" ? "" : hl.slice(1)
        if (tag === " ") { hunk.ops.push({ type: " ", text }); oldNeed--; newNeed-- }
        else if (tag === "-") { hunk.ops.push({ type: "-", text }); oldNeed-- }
        else if (tag === "+") { hunk.ops.push({ type: "+", text }); newNeed-- }
        else throw new Error(`Malformed patch: unexpected line "${hl.slice(0, 60)}" inside hunk`)
        i++
      }
      cur.hunks.push(hunk)
      continue
    }
    i++ // skip diff --git / index / blank lines and other metadata
  }
  // P15.10：容缺/完整空段头（头后无任何 hunk）过滤——不虚报 touchedPaths、不触发无谓 read+write
  const withHunks = files.filter((f) => f.hunks.length > 0)
  if (withHunks.length === 0) throw new Error("No file changes found in patch (need --- / +++ headers)")
  return withHunks
}

/** Apply hunks sequentially onto an in-memory line array; any failure throws (caller guarantees nothing is written to disk). Ignores trailing \r when comparing; context lines retain original bytes */
function applyHunks(fileLines, hunks, eol, path) {
  const cr = eol === "\r\n" ? "\r" : ""
  for (let h = 0; h < hunks.length; h++) {
    const oldSeq = hunks[h].ops.filter((o) => o.type !== "+").map((o) => o.text)
    if (oldSeq.length === 0) throw hunkFailure(h + 1, `Hunk ${h + 1} in ${path} has no context/removed lines to locate`)
    const matches = []
    for (let pos = 0; pos + oldSeq.length <= fileLines.length; pos++) {
      let ok = true
      for (let j = 0; j < oldSeq.length; j++) {
        if (fileLines[pos + j].replace(/\r$/, "") !== oldSeq[j]) { ok = false; break }
      }
      if (ok) matches.push(pos)
    }
    if (matches.length === 0) {
      const preview = oldSeq.slice(0, 3).join(" ⏎ ")
      throw hunkFailure(h + 1, `Hunk ${h + 1} in ${path} does not apply — context not found: "${preview}${oldSeq.length > 3 ? "…" : ""}". Read the file first and regenerate the patch from actual content.`)
    }
    if (matches.length > 1) {
      const preview = oldSeq.slice(0, 3).join(" ⏎ ")
      throw hunkFailure(h + 1, `Hunk ${h + 1} in ${path} matches ${matches.length} locations — add more context lines to make it unique. Anchor: "${preview}${oldSeq.length > 3 ? "…" : ""}"`)
    }
    const pos = matches[0]
    const out = []
    let src = pos
    for (const op of hunks[h].ops) {
      if (op.type === " ") out.push(fileLines[src++]) // preserve original context line (trailing whitespace as-is)
      else if (op.type === "-") src++
      else out.push(op.text + cr)
    }
    fileLines.splice(pos, oldSeq.length, ...out)
  }
}

/** hunk 段失败带上 hunk 序（1-based）：回执的定位 = `<path> hunk <n>`（APPLY-PATCH.md §4）——
 *  调用方据 `hunkNumber` 组装定位，不去解析文案（错误对象本来只有文本、不带路径）。 */
function hunkFailure(hunkNumber, message) {
  const err = new Error(message)
  err.hunkNumber = hunkNumber
  return err
}

/**
 * 失败回执（未全成）：逐档一行、按补丁序 + 末行汇总——骨架单源 = `docs/core/design/EDIT-HELPERS.md`
 * §4，本工具只填填充位（工具名 `apply_patch` · 单位 `file(s)` ⇒ 末段省：报单位 = 写单位 = 档）。
 *
 * 三态逐档行：已落盘 `  modified <path>` ∥ `  created <path>`（逐字复用全成路径那一行）·
 * 失败那档 `<定位> — failed: <原因原文>`（hunk 段带 hunk 序）· 未落盘且没有自身原因的档
 * `  not committed <path>`——不替它编一个原因（APPLY-PATCH.md §4）。
 */
function failureReceipt({ entries, failedPath, failedHunk, reason }) {
  const lines = []
  for (const e of entries) {
    if (failedPath != null && e.path === failedPath) {
      lines.push(editEntryFailureLine(failedHunk == null ? e.path : `${e.path} hunk ${failedHunk}`, reason))
    } else if (e.landed) {
      lines.push(`  ${e.isNew ? "created " : "modified"} ${e.path}`)
    } else {
      lines.push(`  not committed ${e.path}`)
    }
  }
  const written = entries.filter((e) => e.landed).map((e) => e.path)
  lines.push(editBatchSummary({ tool: "apply_patch", applied: written.length, total: entries.length, unit: FILE_UNIT, filesWritten: written }))
  return lines.join("\n")
}

/**
 * 阶段一（hunk 段）：读盘 + 内存算 + 全部 hunk 应用——任一档失败 ⇒ 调用方一个字节都还没写。
 * `onFile(f)` = 正在算的那一档：失败回执靠它点名失败档，并与 `hunkNumber` 配对组装定位。
 */
async function planFiles(files, ctx, onFile) {
  const planned = []
  for (const f of files) {
    onFile(f)
    const abs = resolveInCwd(ctx, f.path)
    if (f.isNew) {
      if (existsSync(abs)) throw new Error(`Cannot create ${f.path}: file already exists`)
      // New file: follow the directory's majority EOL style (default LF).
      const eol = majorityEol(dirname(abs))
      const content = f.hunks.flatMap((h) => h.ops.filter((o) => o.type === "+").map((o) => o.text)).join(eol) + eol
      planned.push({ abs, path: f.path, content, isNew: true })
    } else {
      const original = await readFile(abs, "utf8").catch(() => { throw new Error(`File not found: ${f.path}`) })
      const eol = detectFileEol(original)
      // Apply hunks in the normalized LF domain, then write back joined with the
      // file's ORIGINAL EOL style — join("\n") here used to rewrite CRLF files as LF.
      const lines = normalizeEOL(original).split("\n")
      applyHunks(lines, f.hunks, "\n", f.path)
      planned.push({ abs, path: f.path, content: lines.join(eol), isNew: false })
    }
  }
  return planned
}

export const applyPatchTool = {
  name: "apply_patch",
  description: DESC("apply_patch"),
  parameters: {
    type: "object",
    properties: {
      patch: { type: "string", description: "Unified diff. May span multiple files (multiple --- / +++ header pairs — including creating MULTIPLE new files via --- /dev/null); --- / +++ headers per file, @@ -old,count +new,count @@ hunks (a bare @@ header is also accepted — coordinate-less hunks are located by their anchor lines: context lines plus the removed (-) lines, matched as a contiguous sequence — a unique match applies; a zero/one-context hunk is accepted only when it removes (-) at least one line and that anchor sequence is unique, while anchor-free pure-+ (insert) hunks need at least 2 context lines). The +++ b/<path> pair may be omitted for existing files — a lone --- a/<path> (or --- b/<path>) header followed directly by hunks applies to that path (new files still need --- /dev/null + +++ b/<path>)." },
      ledger: { type: "string", description: LEDGER_PARAM_DESC },
      // 工作区根窄口（设计档 §2.3.1）：目标取不到项目根时才被读；目标有根时以路径为准（定位参数优先）。
      project: { type: "string", description: PROJECT_PARAM_DESC },
    },
    required: ["patch"],
  },
  readonly: false,
  /** For the agent layer to track touched files (multi-path, replaces single path parameter) */
  touchedPaths(args) {
    try { return parsePatch(args.patch ?? "").map((f) => f.path) } catch { return [] }
  },
  async execute(args, ctx) {
    const files = parsePatch(args.patch ?? "")
    // 阶段一（hunk 段）：读盘 + 内存算 + 全部 hunk 应用——任一档失败 ⇒ 一个字节都没写
    // （APPLY-PATCH.md §4「两个失败段」）。失败回执按补丁序列出全部档：失败那档带 hunk 序、
    // 其余档 `not committed`，末行 `k = 0`（零字节，故无路径清单、无末段——单位本来就是档）。
    let inFlight = null // 正在处理的那一档：catch 靠它点名失败档（错误对象不带路径）
    let planned
    try {
      planned = await planFiles(files, ctx, (f) => { inFlight = f })
    } catch (err) {
      throw new Error(failureReceipt({
        entries: files.map((f) => ({ path: f.path, isNew: f.isNew, landed: false })),
        failedPath: inFlight?.path ?? null,
        failedHunk: err?.hunkNumber ?? null,
        reason: err?.message ?? String(err),
      }))
    }
    // 阶段二（写盘段）：逐档暂存 → 逐档提交。**非原子（登记行为）**——已落盘的档留在盘上、不回滚
    // （APPLY-PATCH.md §4 ∥ §7 D-P2）；失败时按盘上实况逐档报，`k` 计入每一个已落盘的档。
    // 两段式经单一写路径点（§2.13.5）：阶段一全部 staging（写入各自 `<abs>.thincoder-tmp`）
    // ⇒ 阶段二逐档 commit（rename 到目标）。
    // 编辑器径（注入面）例外：内容在阶段一即提交（宿主侧同款——applyEdit + save）⇒ 阶段二跳过该档；
    // 已提交档不回滚（与宿主侧现行为一致，非本档引入的语义），但它**算已落盘**——计入 k、列 modified。
    const staged = []
    const committedByEditor = new Set()
    const committed = new Set() // 已落盘 = 注入径已提交 ∪ 提交段 rename 成功——回执的 k 与逐档行的唯一来源
    // Mark every touched file dirty — insert_after must not run on stale line numbers.
    // 整批记账（dirty）= apply_patch 的批级语义；**只对已落盘的档跑，成功 ∥ 失败两路同**（注入径那批在内）——
    // 已落盘却未记账的档会让行号锚护栏拿着写前快照放行（EDIT-HELPERS §3 第 4 行），下一笔行号编辑按旧行号改到别处。
    // 2026-11-02：落 dirty 同时清写入快照——apply_patch 不记快照，留着旧 `startLine` 就是
    // 陈旧的锚：行号锚护栏第 2 行（dirty ∧ 快照在场）会拒，而第 4 行会拿旧值判「目标区在之前
    // ⇒ 放行」——两种结果都不该由一笔没更新快照的写来决定（EDIT-HELPERS §3）。
    const recordCommitted = () => {
      for (const p of planned) {
        if (!committed.has(p.abs)) continue
        markDirty(p.abs)
        clearLastWrite(p.abs)
      }
    }
    try {
      for (const p of planned) {
        inFlight = p
        await mkdir(dirname(p.abs), { recursive: true })
        const r = await writeThroughPath(p.abs, p.content, { op: "write", stage: true, agent: ctx.agent })
        if (r.via === "editor") {
          committedByEditor.add(p.abs)
          committed.add(p.abs) // 注入径无暂存档（即时提交）⇒ 它已经在盘上了
        } else staged.push(p.abs)
      }
      for (const p of planned) {
        if (committedByEditor.has(p.abs)) continue
        inFlight = p
        await writeThroughPath(p.abs, null, { op: "commit" })
        committed.add(p.abs)
      }
    } catch (writeError) {
      // 失败路径照样记账：已落盘的档就是盘上事实，与成功路径同一把尺（否则见上面的护栏后果）。
      recordCommitted()
      // rename / staging 失败：清掉默认径已暂存的 .tmp（那些目标档逐字未动——它们是「没写」，不是「写了」）
      for (const abs of staged) {
        try { await unlink(abs + TMP_SUFFIX) } catch {}
      }
      throw new Error(failureReceipt({
        entries: planned.map((p) => ({ path: p.path, isNew: p.isNew, landed: committed.has(p.abs) })),
        failedPath: inFlight?.path ?? null,
        failedHunk: null, // 写盘段的失败只到档——hunk 早在阶段一应用过，没有 hunk 序可报
        reason: writeError?.message ?? String(writeError),
      }))
    }
    const summary = planned.map((p) => `  ${p.isNew ? "created " : "modified"} ${p.path}`).join("\n")
    recordCommitted()
    const syntaxChecks = await Promise.all(planned.map(async (p) => {
      const r = await autoSyntaxCheck(p.abs)
      return r ? `${p.path}:${r.replace("Syntax: ", "")}` : ""
    }))
    const syntaxResults = syntaxChecks.filter(Boolean).join("\n")
    return `Applied patch to ${planned.length} file(s):\n${summary}${syntaxResults ? "\n\nSyntax checks:\n" + syntaxResults : ""}`
  },
}



// ---------------------------------------------------------------- bash

export const deleteTool = {
  name: "delete",
  description: DESC("delete"),
  parameters: {
    type: "object",
    properties: {
      path: { type: "string", description: "File or empty-directory path (relative to cwd or absolute)" },
      force: { type: "boolean", description: "Allow deleting git-tracked files (default false)" },
      ledger: { type: "string", description: LEDGER_PARAM_DESC },
      project: { type: "string", description: PROJECT_PARAM_DESC },
    },
    required: ["path"],
  },
  readonly: false,
  touchedPaths(args) { return args.path ? [args.path] : [] },
  async execute(args, ctx) {
    const abs = resolveInCwd(ctx, args.path)
    let s
    try {
      s = await lstat(abs)
    } catch {
      throw new Error(`File not found: ${args.path}`)
    }
    if (s.isDirectory()) {
      try { await writeThroughPath(abs, null, { op: "rmdir" }) } catch (e) {
        if (e?.code !== "ENOTEMPTY" && e?.code !== "EEXIST") throw e
        throw new Error(`"${args.path}" is a directory and is not empty — only empty directories can be deleted (nothing recursive is ever removed). Remove the contents first (delete bottom-up for nested empty directories).`)
      }
      return `Deleted ${args.path}`
    }
    // git-tracked files: refuse direct deletion (safety net); untracked: allow
    // Use resolved relative path (normalized forward slashes) to prevent backslash/unusual paths from bypassing ls-files matching
    const rel = relative(ctx.cwd, abs).replace(/\\/g, "/")
    let tracked = false
    try {
      // #208①（2026-09-25）：表外同步 spawn 收口——探针转 `spawnGit` 单点（GIT_ENV 加固 + 超时 + 树杀）；
      // 失败语义零变（未跟踪 / 非仓 ⇒ tracked 保持 false）。
      await spawnGit(ctx.cwd, ["ls-files", "--error-unmatch", "--", rel])
      tracked = true
    } catch {
      // untracked / non-git repo
    }
    if (tracked && !args.force) throw new Error(`"${args.path}" is git-tracked. Set force=true to delete anyway.`)
    // 单一写路径点（§2.13.5）：删除也经注入面（打开且脏 ⇒ 拒删）；默认径 = unlink + 记账。
    await writeThroughPath(abs, null, { op: "delete" })
    return `Deleted ${args.path}`
  },
}

// ---------------------------------------------------------------- git_diff
