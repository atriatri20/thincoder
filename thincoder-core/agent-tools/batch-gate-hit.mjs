/**
 * agent-tools/batch-gate-hit.mjs — 命中行组装（批档门三族之一）。
 *
 * 一族一件事：**引擎交出的命中 → 拒文四件的显示行 ∥ 证据格判读**。它不判「哪一条该阻断」（那一族住
 * `thincoder-core/agent-tools/batch-gate-judge.mjs`），也不拼首行 ∥ 拒串 ∥ 回执（那一族住
 * `thincoder-core/agent-tools/batch-gate-report.mjs`）；编排与范围解析留在 `thincoder-core/agent-tools/batch-gate.mjs`。
 *
 * 判据口径单源（D2——本档只实现，不重述）：
 *   · 拒文四件 = `docs/core/design/BATCH-RECORD.md` §4.22「拒文四件」；
 *   · 证据格识别 = 同节「证据格怎么认」（闭集两字面 `证据` ∥ `evidence`，fail-closed）；
 *   · `aligned` 降为读数 = 同节「对齐与否不影响四件」。
 */
import { relative } from "node:path"

// 共享小件取既有单源（本族不自持、也不反向 import 编排档——那会成环且是层次倒挂）：
// 路径键 = `thincoder-core/doc-check/per-root.mjs` 的既有导出；读档 = `thincoder-core/agent-tools/batch-regions.mjs` 的既有实现。
import { pathKey } from "../doc-check/per-root.mjs"
import { safeRead } from "./batch-regions.mjs"

/** 锚类命中（引擎大类中的锚面；其余 clazz = 段判据命中 —— 另加引擎的第三类 `行号坐标`（按**处**计，不是按「条」）。类名由引擎产出，本档只作切分。
 *  四属同计「锚 N 条」：`档缺` / `节缺` / `引缺`（引文不在所指档内——同属锚判据，不是段类）/ `环引`
 *  （声明出边走回本根——仓级事实，与 `档缺` 同计锚、不新增判决词）。 */
export const ANCHOR_CLASSES = new Set(["档缺", "节缺", "引缺", "环引"])

/** 证据格识别器的**字面闭集**（判据单源 = `docs/core/design/BATCH-RECORD.md` §4.22「证据格怎么认」）：
 *  只有这两个字面。`依据` ∥ `一行依据` ∥ `判据落点` 等一律**不是**证据格 ⇒ 照旧阻写（失败方向 = 拒，fail-closed）。 */
const EVIDENCE_HEADERS = new Set(["证据", "evidence"])

/** 表格分隔行（`|---|:--:|`）：表头 = 它上面那一行——本档不带表格状态机，只借这一行认出表头在哪。 */
const DELIM_ROW_RE = /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/

/** 一行的**末格跨度**（`{start, end}`，0 基；不以 `|` 收尾 ⇒ `null`）。
 *  末格 = 倒数第二个 `|` 之后、收尾 `|` 之前；本档只认这一格的文字与范围。 */
function lastCellSpan(line) {
  const t = String(line).replace(/\s+$/, "")
  if (!t.endsWith("|")) return null
  const close = t.length - 1
  const open = t.lastIndexOf("|", close - 1)
  return open < 0 ? null : { start: open + 1, end: close }
}

/** 格内文字（判据 = 去首尾空白、去包裹反引号后**全等**）：`证据` ∥ `` `证据` `` ∥ `` `evidence` `` 都认，别的都不认。 */
const cellLabel = (raw) => String(raw).trim().replace(/^`+/, "").replace(/`+$/, "").trim()

/**
 * 证据格识别器：同一张 markdown 表内，表头行**最后一个单元格**落在闭集里 ⇒ 该表**表体所在的行区集合**。
 * @param {string} src 一份文本（候选文本 ∥ 批档整档 ∥ 收口面各档——三条腿各喂自己那份视图）
 * @returns {Map<number, number>} 1 基行号 → 该行**末格起点列**（0 基）
 *   **为什么连列起点一起返回**：命中的粒度是「一行」，判据的粒度是「一格」——同一行别的列照旧阻写（§4.22
 *   「正文与其他列一字不放」），于是调用面还要知道末格从第几个字符起。行不在表体 ⇒ 不在 Map 里（照判）。
 *   **不按段号豁免**：按段号会把 §3 的正文一起放宽（结论表与裁定行同在一段）——理由单源 = 该节「同类先例 · 偏离」。
 */
export function pointerCells(src) {
  const out = new Map()
  const lines = String(src ?? "").split("\n")
  let active = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const span = lastCellSpan(line)
    if (DELIM_ROW_RE.test(line)) {
      // 分隔行：上面那一行即表头——末格落进闭集才认这张表的表体。
      const head = i > 0 ? lastCellSpan(lines[i - 1]) : null
      active = head !== null && EVIDENCE_HEADERS.has(cellLabel(lines[i - 1].slice(head.start, head.end)))
      continue
    }
    // 表体行 = 以 `|` 起、以 `|` 收（与段判据的表格行谓词同一形）；其余行一律断表。
    if (span === null || !/^\s*\|/.test(line)) { active = false; continue }
    if (active) out.set(i + 1, span.start)
  }
  return out
}

/** 这条命中是不是落在**证据格**里（§4.22：证据格里只判「判得了的」）：
 *  ① 命中类必须是 `档缺`（`节缺` ∥ `引缺` 的前提是目标档在盘——判得出来就照判）；
 *  ② 该行必须在证据格表体内；
 *  ③ 被拒的 token 必须真的落在**末格**里（同一行别的列照旧阻写）。
 *  `环引` 没有行号（仓级事实）⇒ 恒不在证据格；读不到那一行 ⇒ 不在（照判，不往宽里掉）。 */
function inEvidenceCell(h, rowsOf, srcOf) {
  if (h.clazz !== "档缺" || typeof h.line !== "number") return false
  const start = rowsOf(h.file).get(h.line)
  if (start === undefined) return false
  const token = String(h.token ?? "")
  if (token === "") return false
  const line = String(srcOf(h.file) ?? "").split("\n")[h.line - 1] ?? ""
  return line.indexOf(token, start) >= start
}

/** 多行原文压成一行（段类的内容格是整段原文，段内换行在本行里显形——`⏎` 不是省略号，字一个没少）。 */
const oneLine = (s) => String(s ?? "").replace(/\s*\n\s*/g, " ⏎ ")

/**
 * 拒文四件的**显示行**（判据单源 = §4.22「拒文四件」）：档 + 位置 + 被拒的内容 + 解析根，按命中类取值、一格不空。
 * **引擎 `✗` 行齐四件的才直接用**：`环引` 那一行本就有根（`（<root>）`）与仓链，照用。
 * 不齐的按命中类补齐——引擎行不齐不是它的错：`paragraphHitLine` 只出档与行号（无原文、无根）；`lineRefHitLine`
 * 只出形别与前 40 字；锚行的根只在声明仓提示里出现。
 * `engineLine` 为 `null`（`aligned` 假、配不上对）⇒ 按命中对象现造，四件仍齐。
 * `at` = 命中位置那一段的**显示形**（`<档>:<行>` ∥ append 面 `<档> 候选文本第 N 行`）——引擎行里那一截逐字换掉，
 * 其余字节一字不改（四件的档与位置两格因此始终是同一个写法）。
 */
function displayLineOf(h, engineLine, at, shown, root) {
  const where = h.root ?? root
  const line = typeof h.line === "number" ? String(engineLine ?? "").split(`${shown(h.file)}:${h.line}`).join(at) : engineLine
  if (h.clazz === "环引") {
    return line ?? `✗ 锚·环引 ${shown(h.file)}（${where}）publicRepos 成环：${h.chain ?? ""}`
  }
  if (ANCHOR_CLASSES.has(h.clazz)) {
    const base = line ?? `✗ 锚·${h.clazz} ${at} \`${h.token ?? ""}\``
    return String(base).includes(String(where)) ? base : `${base}（根：${where}）`
  }
  const base = line ?? `✗ ${h.clazz} ${at}${h.snippet === undefined ? "" : ` ${h.form ?? ""} ${h.snippet}`}`
  const content = oneLine(h.token)
  // 行号坐标的引擎行已带整行原文（片段 = 全长时）⇒ 内容格不重复；否则补原文。
  const hasContent = h.snippet !== undefined && h.snippet === content
  const tail = [hasContent ? "" : `原文：${content}`, `根：${where}`].filter(Boolean).join(" —— ")
  return `${base} —— ${tail}`
}

/** 命中所在文本的**读取器**（证据格判据要读原文：表头与末格范围都在文本里，不在命中对象里）：
 *  批档本体那一档 ⇒ `inputBody`（`edit` 的改后整档视图 ∥ `append` 的候选全文——两者都是批档本体的判定输入）；其余 ⇒ 盘上读。
 *  按路径记一次——一笔里多命中同档时不重复读盘。读不到 ⇒ 空串（于是 `inEvidenceCell` 判「不在证据格」，照判不往宽里掉）。 */
export function srcOfOf({ selfAbs, inputBody }) {
  const memo = new Map()
  return (abs) => {
    const key = pathKey(abs)
    let src = memo.get(key)
    if (src === undefined) {
      src = inputBody !== null && selfAbs !== null && key === pathKey(selfAbs) ? String(inputBody) : safeRead(abs)
      memo.set(key, src)
    }
    return src
  }
}

/** 命中 → `{ aligned, drift, entries }`：`file` / `line` / `clazz` / `token` / `root` = 判定用（引擎给绝对路径，两格载荷 = 引擎补的）；
 *  显示行 = **拒文四件**（单源 = `docs/core/design/BATCH-RECORD.md` §4.22「拒文四件」）：档 + 位置 + 被拒的内容 + 解析根，
 *  按命中类取值、一格不空；`pointerRead` = 这一条落在证据格里且只失败存在性（只列读数、不阻写）。
 *  `aligned`（引擎 `✗` 行数与命中数是否同序）**降为读数**：不同序时引擎行不可逐条配对 ⇒ 显示行按命中对象现造，
 *  判定仍按命中对象（那句读数由调用面出固定一行）。 */
export function hitEntries(res, root, atOf, srcOf) {
  const lines = res.report.split("\n").filter((l) => l.startsWith("✗ "))
  // 三条判据的命中按**报面行序**串起（锚 ∥ 段 ∥ 行号坐标）——引擎的命中数组顺序即报面行序，
  // 少串一类就会让 `aligned` 永为 false（显示行全走自造形）。
  const hits = [...res.anchorHits, ...res.paragraphHits, ...(res.lineRefHits ?? [])]
  const drift = Math.abs(lines.length - hits.length)
  const aligned = drift === 0
  const shown = (f) => relative(root, f).replace(/\\/g, "/")
  // 证据格表体（一行一次 `pointerCells`）：同一笔里多命中同档时不重扫。
  const rowsMemo = new Map()
  const rowsOf = (file) => {
    const key = pathKey(file)
    let rows = rowsMemo.get(key)
    if (rows === undefined) { rows = pointerCells(srcOf(file)); rowsMemo.set(key, rows) }
    return rows
  }
  const entries = hits.map((h, i) => {
    const at = atOf(h)
    return {
      file: h.file,
      line: h.line,
      clazz: h.clazz,
      token: h.token,
      where: at,
      pointerRead: inEvidenceCell(h, rowsOf, srcOf),
      text: displayLineOf(h, aligned ? lines[i] : null, at, shown, root),
    }
  })
  return { aligned, drift, entries }
}
