/**
 * agent-tools/batch-tier-gate.mjs — 收口面的第 ⑤ 臂：**档位臂**（单源叶档）。
 *
 * 权威规格（语义单源）= `docs/core/standards/CODE-TIER.md` §2.2：收口面判的是 **§2 的记录缺件**，分两半，
 * 同一臂里一遍判完、两半的发现拼成一条拒文。读数那一半的判法、三值分流与拒文措辞 =
 * `docs/core/design/DOC-CHECK.md` §8；量法的定义单源 = 同档 §1。位次与跳过集 =
 * `batch-closeout.mjs` 的 `assertCloseoutGates` 第 ⑤ 臂。本档只实现，不重述口径（D2）。
 *
 * 两节，触发物不同，谁都不替谁启动：
 *   ① **读数支**（触发物 = 本批改动面里有在盘的码档——几乎每批都有）：每个这样的档，§2 机读清单里它那一行的
 *      第三列须带行读数，且 = 该档**在批起快照上**的内容行数（不是收口时盘上的长度：本批实施就是要改它）。
 *      快照里没有这一档 ⇒ 那一格只认 `新`；写数即拒。
 *      **读数之前先判表形**：档全文出现块名、清单却解析出零行 ⇒ 一条专门拒文（`tierListUnreadableError`），
 *      不逐档报缺行——「表形不对」与「漏写行」的下一步动作不同（口径 = `docs/core/design/DOC-CHECK.md` §8.4）。
 *   ② **越线方案支**（触发物 = 收口时盘上的实测越过收口线）：越线档须带正向形分拆方案。
 *
 * **读数支的实质是「与基线一致」，不是「有没有数」**：只查有没有数，写个 1 也能过。
 * **「§2 缺块」仍不是拒因**：块缺时拒的是「每个在盘码档都缺它那一行读数」，不是「格式没写对」。
 * 而「档里有它的名字、清单零行」不是缺行——那是表形不对，另出一条拒文（见 ①）。
 *
 * 入参 `(src, root, changed, baseTextOf)`：`src` = 调用方已读的**写盘前全文**；
 * `root` = 仓根（清单第一列是仓根相对路径）；`changed` = 本批改动面——**调用方交的现成两面**
 * （写工具触达账 ∪ 提交 diff，绝对路径）；`baseTextOf` = **基线内容取值函数**（收仓根相对路径），
 * 三值三判：串 = 该档在快照里的内容 ∥ `null` = 快照里没有这一档 ∥ `undefined` = 基线不可判（整批一条拒）。
 * **本档不读 git**：基线内容由调用方交进来，缺了按入参缺件拒——判据才保持「一段 §2 文本 + 一个仓根 +
 * 一份改动面 + 一个取值函数」的可直取形，单测不必装一个 git 仓。
 *
 * 依赖：只取段词表叶档的 §2 机读清单解析（`batch-segment-vocab.mjs`——**形单源**，与文档门的计划件判据同一份）；
 * 它零 import，无环；本档不 import 任何批次判序档（`batch-closeout.mjs` 单向调本档，本档不回头）。
 */
import { readFileSync, statSync } from "node:fs"
import { isAbsolute, relative, resolve } from "node:path"

import { MACHINE_LIST_HEAD_NAME, machineListRowsOf } from "./batch-segment-vocab.mjs"

/** 收口线（> 即越线）：语义与时点的单源 = `docs/core/standards/CODE-TIER.md` §2.2。 */
const FILE_CLOSE_MAX = 800

/** 内容行数（末行换行不计）——本档是它唯一的消费面，量法随消费面走。 */
export function countContentLines(text) {
  const parts = String(text).split("\n")
  if (parts.length && parts[parts.length - 1] === "") parts.pop()
  return parts.length
}

/** 源码 / 单测档后缀闭集。 */
const CODE_EXTS = Object.freeze([".mjs", ".cjs", ".js"])

/** 读数格的值形之一：纯十进制整数（剥装饰符与首尾空白后）。 */
const READING_NUM_RE = /^\d+$/

/** 读数格的另一个值形：快照里没有这一档。写 0 会被读成「量过、是空的」；写别的数就是编。 */
const NEW_TOKEN = "新"

/** 正向形 ①：目标档 token 须**带目录段**（至少一个 `/`）与档后缀——只点名一个光秃名字不算点名目标。 */
const TARGET_TOKEN_RE = /[A-Za-z0-9_.@-]+\/[A-Za-z0-9_.@/-]*\.[A-Za-z0-9]{1,8}/

/** 正向形 ②：本批落步词闭集——方案须说出本批哪一步把它落成。闭集住本档（判据面），文档面不复述。 */
const STEP_WORDS = Object.freeze(["实施轮", "§5"])

/** 路径归一（比较用：win32 大小写不敏感，分隔符统一成 `/`）——改动面是绝对路径、清单第一列是仓根相对路径，
 *  两边的基不同，只能靠「路径段对齐的尾巴」认同一档。 */
const normPath = (p) => {
  const s = String(p ?? "").replace(/\\/g, "/")
  return process.platform === "win32" ? s.toLowerCase() : s
}

/** 该路径是不是源码 / 单测档（后缀闭集单源 = `CODE_EXTS`）。 */
const isCodePath = (p) => typeof p === "string" && CODE_EXTS.some((e) => p.toLowerCase().endsWith(e))

/** 格内文本（去首尾空白与 markdown 装饰符——写手会写成 `` `x` `` ∥ `**x**`）。 */
const cellText = (s) => String(s ?? "").replace(/[`*]/g, "").trim()

/** 拒文公共两件（下一步 ∥ 零写声明）：本门只拒、不代改。 */
const TIER_PLAN_DISPOSAL =
  "要写什么：在本批 §2 的「受影响文件（机读清单）」为每个越线档补一行——第二列写正向形方案" +
  "（点名目标档，带目录段；并写出本批落步 `实施轮` ∥ `§5`）；未越线的档不受此约束。本门只拒、不代改。Nothing was written."

/** 读数那一半的「要写什么」（据 `docs/core/design/DOC-CHECK.md` §8 拒文块**改写**：设计档写「本档 §1」∥
 *  「本节「快照怎么取」」，而运行时串里没有「本档 ∥ 本节」可指，所以把两个家的路径写全；逐档发现句 ∥ 首句 ∥
 *  `Nothing was written.` 三处与设计档同字面）。 */
const TIER_READING_DISPOSAL =
  "要写什么：在 §2「受影响文件（机读清单）」的第三列写该档的原始行数——量法 = `countContentLines`" +
  "（定义单源 = `docs/core/design/DOC-CHECK.md` §1）；取数 = 该档在**批起快照**上的内容" +
  "（快照怎么取 = 同档 §8）；快照里没有这一档就写 `新`。只报这一个数：不写增量 ∥ 百分比 ∥ 超了多少行。" +
  "本门只拒、不代改。Nothing was written."

/** 拒文（门自身入参缺件）：改动面与基线取值都是判据的输入，缺省由调用方决定，不由本档猜。 */
function tierInputMissingError(what) {
  return "batch: tier-plan gate is missing its input（收口前置门 · tier-plan gate）— close refuses: " +
    `${what}. 触发物是本批改动面的实测长度、比对基准是批起快照——不知道改了哪几档、基线是什么，就没有可判的东西；` +
    "猜一个等于替调用方决定。Nothing was written."
}

/** 逐档读数那一半的节首句（`tier-reading gate` 是 A1 ∥ A7 认的那一句）。 */
function tierReadingHeader() {
  return "batch: 码档缺原始行数 ∥ 读数与基线不符（收口前置门 · tier-reading gate）— close refuses: " +
    "a code file this batch changed carries no usable line reading in §2's 受影响文件（机读清单）" +
    "（判的是记录缺件，不是代码长短）:"
}

/** 越线方案那一半的节首句（`tier-plan gate` 是 A2 认的那一句）。 */
function tierPlanHeader() {
  return "batch: 越了收口线却没有分拆方案（收口前置门 · tier-plan gate）— close refuses: a source/test file this batch changed " +
    `crosses the closeout line (> ${FILE_CLOSE_MAX}) and §2 carries no usable split plan for it（判的是记录缺件：§2 有没有可用方案）:`
}

/** 拒文（基线不可判）：它不是逐档读数的问题，是整批的比对基准缺件——整批一条，不逐档点名。 */
function tierBaselineError() {
  return "batch: 批起基线不可判（收口前置门 · tier-reading gate）— close refuses: " +
    "§1 has no usable `批起 sha`（缺记入行 ∥ 该对象读不到），读数的比对基准不存在，这一半无从核起:\n" +
    "要写什么：在 §1 记入行写 `批起 sha = <批起快照 sha>`（快照怎么取 = `docs/core/design/DOC-CHECK.md` §8）。" +
    "本门只拒、不代改。Nothing was written."
}

/** 一条拒文装两节（KD-5）：两节各带自己的「要写什么」，设计席一次改完再收口。 */
function tierRefusalError(readingFindings, planFindings) {
  const blocks = []
  if (readingFindings.length) blocks.push([tierReadingHeader(), ...readingFindings, TIER_READING_DISPOSAL].join("\n"))
  if (planFindings.length) {
    blocks.push([tierPlanHeader(), ...planFindings, TIER_PLAN_DISPOSAL].join("\n"))
  }
  return blocks.join("\n")
}

/**
 * 正向形判据（纯函数）：`null` = 满足 ∥ 一句说缺什么。
 * 正向形 = **两件同时在场的合取**，不是词表：① 点名一个带目录段的档 token；② 说出本批哪一步落成
 * （`实施轮` ∥ `§5`）。缺一即视同未填——「另起一批」「留到下批」「下批拆」点名不了目标，全不命中；
 * 点名了目标却把落地推给下一批的，不命中落步词，同样不命中。黑名单挡不住下一种说法，正向形挡得住
 * 还没进词表的那一种。**它只在「确实越线」之后才被查**，不是每次收口都查。
 */
function planGapOf(plan) {
  const cell = cellText(plan)
  if (cell === "" || /^[—–-]+$/.test(cell)) return "方案为空 ∥ 只有 `—`"
  if (!TARGET_TOKEN_RE.test(cell)) return "方案不满足正向形：缺目标档 token（要点名一个带目录段的档路径）"
  if (!STEP_WORDS.some((w) => cell.includes(w))) return "方案不满足正向形：缺本批落步（`实施轮` ∥ `§5`）"
  return null
}

/**
 * 该档在 §2 清单里的那一行（按「路径段对齐的尾巴」认，最长者胜）：改动面是绝对路径、清单第一列是
 * 仓根相对路径，两边基不同；`null` = 清单里没有它。
 */
function rowFor(absPath, rows) {
  const target = normPath(absPath)
  let best = null
  for (const row of rows) {
    const key = normPath(row.path)
    if (key === "") continue
    if (target !== key && !target.endsWith(`/${key}`) && !key.endsWith(`/${target}`)) continue
    if (best === null || key.length > normPath(best.path).length) best = row
  }
  return best
}

/** 拒文里的档名（**仓根相对**——那正是写手要填进 §2 清单那格的值；盘到仓外就照原值点名，不猜）。 */
function displayPath(p, root) {
  const abs = isAbsolute(p) ? p : resolve(root, p)
  const rel = relative(root, abs).replace(/\\/g, "/")
  return rel === "" || rel.startsWith("../") || isAbsolute(rel) ? p : rel
}

/**
 * 逐档实测内容行数（**读数尺 = `countContentLines`**，收口面自己量——不采信任何抄来的数）。
 * 量不到 ⇒ `null`：本批删掉 / 搬走的档在盘上没有长度可量，跳过（不是「干净的档」，是**没有这一档**）。
 * @param {string} changedPath — 改动面条目（绝对路径 ∥ 仓根相对路径）
 * @param {string} root — 仓根
 * @returns {number|null} 内容行数 ∥ `null`（不在盘 ⇒ 无长度）
 */
function contentLinesOf(changedPath, root) {
  const abs = isAbsolute(changedPath) ? changedPath : resolve(root, changedPath)
  try {
    if (!statSync(abs).isFile()) return null
    return countContentLines(readFileSync(abs, "utf8"))
  } catch {
    return null
  }
}

/**
 * 判域 = 本批改动面里**在盘**的码档（同一档去重后只量一次——触达账与提交清单会重叠）。
 * @returns {{abs:string, len:number}[]} 绝对路径 + 盘上内容行数（`len` 只喂越线方案支；读数支按快照比）
 */
function codeFilesOf(changed, root) {
  const out = []
  const seen = new Set()
  for (const p of changed) {
    if (!isCodePath(p)) continue
    const abs = isAbsolute(p) ? p : resolve(root, p)
    const key = normPath(abs)
    if (seen.has(key)) continue
    seen.add(key)
    const len = contentLinesOf(abs, root)
    if (len === null) continue // 本批删掉 / 搬走的档：盘上没有长度可量，也不进判域（判域 = 在盘的码档）
    out.push({ abs, len })
  }
  return out
}

/** 一个码档那一格缺什么：`null` = 读数成立 ∥ 一句「哪一格不对、写的是什么、基线是什么」。 */
function readingGapOf(row, baseLines) {
  const cell = cellText(row?.reading)
  if (baseLines === null) {
    if (cell === NEW_TOKEN) return null
    if (READING_NUM_RE.test(cell)) return `写的是 ${Number(cell)}，而批起快照里没有这一档；本批期间建的档写 \`新\``
    return "该列没有数（空 ∥ `—`）；批起快照里也没有这一档，该格写 `新`"
  }
  if (cell === NEW_TOKEN) return `写的是 \`新\`，而批起快照里这一档有 ${baseLines} 行`
  if (!READING_NUM_RE.test(cell)) return `该列没有数（空 ∥ \`—\`）；基线是 ${baseLines}`
  const n = Number(cell)
  return n === baseLines ? null : `写的是 ${n}，基线是 ${baseLines}`
}

/**
 * 读数支（在盘的每个码档逐档核）：三值分流全部在这里，`undefined` ⇒ 抛整批一条「批起基线不可判」
 * （放行等于没核，静默退回头更坏）。
 * @returns {string[]} 逐档发现（空 = 这一半成立）
 */
function readingFindingsOf(files, rows, root, baseTextOf) {
  const findings = []
  for (const f of files) {
    const rel = displayPath(f.abs, root)
    const base = baseTextOf(rel)
    if (base === undefined || (base !== null && typeof base !== "string")) throw new Error(tierBaselineError())
    const baseLines = base === null ? null : countContentLines(base)
    const row = rowFor(f.abs, rows)
    const gap = row === null
      ? baseLines === null
        ? "§2 清单里没有这一档的行；批起快照里也没有这一档，该格写 `新`"
        : `§2 清单里没有这一档的行；基线是 ${baseLines}`
      : readingGapOf(row, baseLines)
    if (gap === null) continue
    findings.push(`  ${rel} — ${gap}`)
  }
  return findings
}

/** 拒文（清单读不出行）：档里明明写着块名，解析面却一行都没有——那是表形不对，不是漏写行。
 *  形单源 = `docs/core/design/DOC-CHECK.md` §8.4；块名取解析器那一份字面（`MACHINE_LIST_HEAD_NAME`）。 */
function tierListUnreadableError(files, root) {
  // 逐个一行、与逐档发现同形（`  <仓根相对> — <gap>`）：这一份的 gap 对每档相同——清单读不出行，就没有它的行可读
  const list = files.map((f) => `  ${displayPath(f.abs, root)} — 清单读不出行，无行可读`).join("\n")
  return "batch: §2 的机读清单读不出行（收口前置门 · tier-reading gate）— close refuses: " +
    "the batch record carries the block name in its text, yet §2's machine-readable list parses to zero rows — " +
    `档里有它的名字，清单却解析出零行，本批每个在盘码档就没有行可读:` +
    `\n${list}\n` +
    "为什么零行（三者任一不满足都读不出）：① 块头形态不在两种之内——可接受的两形 = 行首粗体 " +
    "`**受影响文件（机读清单）**`，或同名标题行（`#{1,6}` 起头、标题文字以这个名字结尾，如 " +
    "`### 受影响文件（机读清单）` ∥ `### 3. 受影响文件（机读清单）`）；" +
    "`### 受影响文件（机读清单）的写法` 这类「在提它」的标题不在两形之内。" +
    "② 表不在 2–3 列（4 格以上的行跳过）。" +
    "③ 表行不连续——中间夹一个空行即截断，其后的行读不到；只剩表头行或全是 `<…>` 占位行同样是零行。" +
    "要写什么：把块头改成两形之一，其下紧跟一张连续的 2–3 列表（`| 档 | 分拆方案 | 行数 |`），一行一档。" +
    "本门只拒、不代改。Nothing was written."
}

/**
 * 收口前置门（第 ⑤ 臂 · 档位臂）：**两节一趟判完，一条拒文**。
 * 判序：读数支在前（缺数是更前一件缺件），越线方案支在后；两节的触发物不同，各自启动。
 * 放行零回执（与其余收口前置同形：不写回执段、不改回执字面）。
 * @param {string} src — 写盘前的档全文
 * @param {string} root — 仓根（**必填**：清单第一列与改动面条目都按它落盘，缺省由调用方决定而不是本档猜）
 * @param {string[]} changed — 本批改动面（触达账 ∪ 提交 diff；**必填**——它就是触发物的取材）
 * @param {(relPath:string) => string|null|undefined} baseTextOf — 基线内容取值函数（**必填**：串 ∥ `null` ∥ `undefined`）
 * @throws 入参缺件 ∥ 基线不可判 ∥ 读数缺件 ∥ 越线而缺方案
 */
export function assertTierPlan(src, root, changed, baseTextOf) {
  if (typeof root !== "string" || root.trim() === "") {
    throw new Error(tierInputMissingError("the repo root was not given — the affected-file list's first column is repo-root-relative, and a guessed base measures the wrong files"))
  }
  if (!Array.isArray(changed)) {
    throw new Error(tierInputMissingError("the changed-file list was not given — the trigger is the measured length of this batch's own changed files, so the gate cannot guess it"))
  }
  if (typeof baseTextOf !== "function") {
    throw new Error(tierInputMissingError("the baseline reader (`baseTextOf`) was not given as a function — the reading column is compared against each file's content in the batch-start snapshot, and this gate does not read git itself; a guessed baseline measures the wrong thing"))
  }
  const files = codeFilesOf(changed, root)
  // ① 读数支：没有在盘码档 ⇒ 这一半不启动（连 §2 都不解析）。
  const rows = files.length ? machineListRowsOf(src) : []
  // ①-前 表形自诊断：先判表形再判读数——整份读不出行时，每一条逐档比对都只是同一个原因的回声。
  // 三条件全从既有入参算得（码档非空 ∥ 清单零行 ∥ 档全文出现块名），不新增参数、不设开关。
  if (files.length && rows.length === 0 && String(src ?? "").includes(MACHINE_LIST_HEAD_NAME)) {
    throw new Error(tierListUnreadableError(files, root))
  }
  const readingFindings = files.length ? readingFindingsOf(files, rows, root, baseTextOf) : []
  // ② 越线方案支：只在收口时的实测越过收口线时才查（`§2 缺块本身不是拒因` 照旧成立）。
  const planFindings = []
  for (const f of files) {
    if (f.len <= FILE_CLOSE_MAX) continue
    const row = rowFor(f.abs, rows)
    const gap = row === null ? "§2 清单里没有这一档的方案行" : planGapOf(row.plan)
    if (gap === null) continue
    planFindings.push(`  ${displayPath(f.abs, root)} — ${f.len} > ${FILE_CLOSE_MAX}；${gap}`)
  }
  if (readingFindings.length || planFindings.length) throw new Error(tierRefusalError(readingFindings, planFindings))
}
