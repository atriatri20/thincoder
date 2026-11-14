/**
 * agent-tools/batch-segment-vocab.mjs — 批次档的**段词表 / 段白名单 / 状态行读写面**单源
 * （2026-11-05 拆档族从 `batch-skeleton.mjs` 迁出；原档改再导出，导出面零变）。
 *
 * 本档是整条批次档依赖链的**最底叶**（零 import、零副作用、零 fs）：词表（STATUS_WORDS ∥ 别名表）、
 * 段白名单（SEGMENT_BY_ROLE ∥ 普通模式增表 ∥ DEPTH0_SEGMENTS）、段头与状态行形态、段解析
 * （`sectionBodyLines` ∥ `sectionHeaderZoneEntries`）、以及状态行读写三件（`readBatchStatusLine` ∥
 * `updateSectionStatusLine` ∥ `readSectionStatusWord`）+ 位置/计数三件（`zoneStatusLines` ∥
 * `zoneStatusCount` ∥ `firstZoneStatusLineRange`）。
 *
 * 为什么段解析也住这里：上面几件状态行函数都要「取某段的段头区行集」，而取行集只有一份实现
 * （`sectionHeaderZoneEntries` → `sectionBodyLines`）。把它留在原档，本档就得反向 import 原档 ⇒ 两档
 * 互 import 成环；复制一份解析 ⇒ 判据有了第二份字面。所以段解析随其最低位读者下沉，原档按名 import 回来
 * ——这是本批唯一一处与设计档落点表述不同的地方（**单向依赖优先于同档偏好**）。
 *
 * 依赖单向：`batch-segment-vocab ← batch-skeleton ← 其余批次档`——本档不 import 任何档。
 */
/**
 * 段标题定位（`## §N` 独立标题——`## §20` 不误命中 §2）。
 */
export const sectionHeaderRe = (seg) => new RegExp(`^## §${seg}(?=\\s|$)`, "m")

/** §1 段头正则（单源——`readBatchStatusLine` 与 `isBatchRecord` 共用；`## §10` 不误命中 §1）。 */
const SECTION_1_HEADER_RE = /^## §1(?=\s|$)/m
/** 批档谓词（只读 · 零 fs）：档内有 §1 段头 ⇒ 批次档——判别式 = 上面那条同一正则（「是不是批档」与
 *  「§1 状态行是什么」两问不各持一份）；消费面 = 台账核销机检（`ledger-close-proof.mjs`）。 */
export function isBatchRecord(src) {
  return typeof src === "string" && SECTION_1_HEADER_RE.test(src)
}
/**
 * STATUS_WORDS——状态行合法关键字**分段词表常量单源**（D-BR19 / fix 轮 #1；轮 2 #3 裁定②）：
 *  - §1 项 = gate 词表 `{ open: 进行中, closed: 已收口 }`——**gate 只消费 §1 项**（单源仍成立）；
 *  - §2/§3/§5 各带段内生命周期词表（`done` 词 = 段属主的完成态关键字）；
 *  - §4/§6 无项——主 agent 的 status 写域**仅 §1**（§4/§6 状态面走普通文档写，与 D-BR18 分工一致）。
 * 词面纪律（最小词面）：一条状态行值只带**一个**关键字——校验面（batch 工具 status）拒绝内嵌另一冻结词的
 * 值（含「进行中…已收口」双词 ⇒ 已收口优先误冻结——2026-09-20 词面纪律）。emoji / 括注 / 日期后缀容忍
 * （**读侧** gate 判定 = 子串包含，同 gate——写入面 value 谓词自本批起收紧为「剥装饰白名单后余核 = 关键词」，
 * 见 batch-lifecycle.mjs）；全词表并集 = 各段项去重集合（note 字段零命中的判据——括注永不误触 gate）。
 */
export const STATUS_WORDS = Object.freeze({
  1: Object.freeze({ open: "进行中", closed: "已收口" }),
  2: Object.freeze({ open: "进行中", done: "设计完成" }),
  3: Object.freeze({ open: "进行中", done: "评审通过" }),
  5: Object.freeze({ open: "进行中", done: "实施完成" }),
})

/** 段状态行**旧字面兼容别名表**（只用于**读侧**：写侧词表零别名——旧字面写不进去，词表外拒）。
 *  §3 自 2026-10-27 起只留一个完成词 `评审通过`（只有 pass 叫完成；`changes-required` 不写状态词——
 *  「评审没通过」= 评审未完成）。存量批档里的旧字面 `评审完成` 读侧等义于 `评审通过`（存量档**不回填**
 *  ——已冻结档不改字节）。**退场条件**：盘上再无该字面（判据 = `grep -r '评审完成' docs/batches`）。 */
export const STATUS_WORD_ALIASES = Object.freeze({
  3: Object.freeze({ "评审完成": "评审通过" }),
})

/** 身份 → 可写段号（append 段白名单的**子代理面**——原 batch-segment.mjs 逐字迁移；主 agent
 *  的 depth-0 白名单（模式感知——工程 §1/§4/§6 · §1 ∥ 普通 §1/§2/§4/§5/§6 · §1/§2/§5，§4.16）
 *  由身份判据在 batch.mjs / batch-lifecycle.mjs 分支，不经本表。旧 batch-segment.mjs 导出面等价
 *  保持——本符号经 batch.mjs re-export（过渡 shim 面零触）。**表零字面改**——普通模式另立增表
 *  `SEGMENT_BY_ROLE_NORMAL`（合并查只在普通模式分支）；工程面「逐字不变」判据据此成立。 */
export const SEGMENT_BY_ROLE = { "eng-designer": 2, "eng-coder": 5 }

/** 普通模式增表（§4.16——**合并查只在普通模式分支**，工程模式分支不消费本表）：coder 承办 ⇒ §5
 *  实施记录（可选绑定自写——未绑定由主 agent 代记、行内注明来源）。 */
export const SEGMENT_BY_ROLE_NORMAL = { "coder": 5 }

/**
 * 评审实例的可写段（`BATCH-RECORD.md` §4.1 ∥ §4.4，按「模式 × 评审轨」分岔）：
 * 工程模式的**设计轨** ⇒ `null`（`§3` 对那一路的一切工具通道只读——轮次块只由设计评审结算写）；
 * 工程模式的**代码轨**与**普通模式** ⇒ `3`（那两条路没有设计结算可代写，而收口门读的是 `§3` 的段级状态行）。
 * 两个输入（模式 × 评审轨）缺一即判不出，故不许用默认值顶替：`reviewTrack` 未给 ⇒ 按设计轨处置
 * （这一面是拒面，判不出就不放行——fail-closed）。
 * 消费面两处、同一判据：`batch-record-write.mjs` 的段白名单（`append` ∥ `edit`）∥
 * `batch-lifecycle.mjs` 的 `status` 段域。
 * @param {boolean} engineering 模式位（执行期实读）
 * @param {string|null|undefined} reviewTrack 评审轨（`"design"` ∥ `"code"`）
 * @returns {3|null} 可写段号 / 不可写
 */
export function reviewWritableSegment(engineering, reviewTrack) {
  return engineering && reviewTrack !== "code" ? null : 3
}

/** 工程设计轨 §3 写面拒串（`BATCH-RECORD.md` §4.4——评审席与批工具的任何席位通道都不写它）。
 *  前缀由调用面给（`append` = `batch_segment:`，`edit` ∥ `status` = `batch:`——三面各自既有前缀零改）。 */
export function sectionThreeDesignTrackError(prefix) {
  return `${prefix}: §3 is closed to this caller — in engineering mode the design-track round block is written by the settlement: the tool stamps the round heading, adds the settlement header line and the review's report verbatim, in the same stroke that decides the token. §3 is read-only for every tool channel on that track (a block you add would sit beside the settlement's and the record would read as two rounds). The code track and normal mode keep the §3 channel. Nothing was written.`
}

/** depth-0 段白名单（§4.16——**模式键两集**；工程面判定字面逐字保持、普通面新增）：
 *  append：工程 = §1/§4/§6 ∥ 普通 = §1/§2/§4/§5/§6（§2 = 设计师席并入主 agent；§5 = 直做实施记录）；
 *  status：工程 = §1 ∥ 普通 = §1/§2/§5（写域仍「调用者自己段」；`segment` 缺省 = §1）。 */
export const DEPTH0_SEGMENTS = Object.freeze({
  append: Object.freeze({ engineering: Object.freeze([1, 4, 6]), normal: Object.freeze([1, 2, 4, 5, 6]) }),
  status: Object.freeze({ engineering: Object.freeze([1]), normal: Object.freeze([1, 2, 5]) }),
})

/** §1 状态行前缀形态（`**状态行**：` 独立行——表格行 / 块引用行不命中；判定只认关键字）。 */
export const STATUS_LINE_RE = /^\s*\*\*状态行\*\*[：:]\s*(.*)$/

/** 段头区界（任意 `##` / `###` 起的行——写面与触发读面同一条判据；`updateSectionStatusLine` 与
 *  `sectionHeaderZoneEntries` 读它，随段解析下沉本档）。 */
const ZONE_END_RE = /^#{2,}/

/**
 * 骨架死占位**枚举单源**（F11-C 判据——create 骨架产出过的全部死占位字面）：
 *  - `#<编号>` / `<板块>` = 现行骨架仍在产出的两处（台账行——填充人 = 主 agent，时点 =
 *    建档后、本档首个 append/status 之前）；
 *  - `<BATCH-ID>` / `<讨论来源>` = 改形**删除**的两处旧占位（create 不再产出；旧档残留同判）。
 * 判据 = 枚举而非泛形正则：`<[^>]{1,40}>` 一类泛形会误杀正文合法尖括号（`Error: <message>` /
 * 泛型 `Array<T>` / 讨论字面本身）与 `<§N 模板占位：…>` 合法暂存行（append 不删行——段内留存
 * 是常态）——设计档 `TOOLS.md` 6.15 裁定点④。
 */
export const TEMPLATE_PLACEHOLDERS = ["<BATCH-ID>", "<讨论来源>", "#<编号>", "<板块>"]

/** 档头结构行值形（骨架三类——标题行 `# …` / 编制行 `> 编制` / 台账行 `> 台账`）：判据可辨性收正
 *  （`TOOLS.md` §6.20）后只有这三类行参与死占位判定；骨架↔结构行不变量 = `batchSkeleton` 产出中
 *  枚举字面 ⊆ 本三类行（骨架改形与判据同拍——结构行外新增占位 = 静默漏检）。 */
const HEADER_STRUCTURAL_RE = [/^#\s/, /^>\s*编制/, /^>\s*台账/]

/**
 * 死占位残留扫描（F11-C——append/status 落笔前的机检；**纯函数 · 零 fs**）。
 * 判定域 = **档头结构行**（区域 = 档首至首个 `## §N` 段头前；值形 = 骨架三类结构行：标题行 `# …` / 编制行
 * `> 编制` / 台账行 `> 台账`）——行内出现枚举字面 ⇒ 残留；段体（首段头起）任意位置出现字面 = 正文引用 ⇒
 * **豁免**（引用非未填——2026-10-05 判据可辨性收正，`TOOLS.md` §6.20；原全域子串扫描分不清两者——本批 §1 首投实害）。
 * @param {string} src — 档全文
 * @returns {Array<{line: number, text: string}>} 残留列表（空 = 无残留）；
 *   `line` = 档头域内 1-based 行号（档头域自档首行起——便于定位），`text` = 命中行 trim 原文
 */
export function findPlaceholderResidue(src) {
  const firstSection = /^## §\d/m.exec(src)
  const out = []
  src.slice(0, firstSection ? firstSection.index : 0).split("\n").forEach((line, i) => {
    if (!HEADER_STRUCTURAL_RE.some((re) => re.test(line))) return
    if (TEMPLATE_PLACEHOLDERS.some((ph) => line.includes(ph))) out.push({ line: i + 1, text: line.trim() })
  })
  return out
}

/**
 * 占位残留拒绝句（F11-C——append / status 两个挂点共用单源文案；逐行列残留：行号 + 原文）。
 * 错误句前缀 = `batch:`（本批新增错误面——与 append 迁移面的 `batch_segment:` 旧面不混）。
 * 逐字 = `TOOLS.md` §6.20 拒句表（「or your target section」半句随判定域收正退场）。
 * @param {Array<{line:number,text:string}>} residues — findPlaceholderResidue 的返回值（非空）
 * @returns {string} 完整拒绝句（调用方 throw new Error(...)）
 */
export function placeholderResidueError(residues) {
  const list = residues.map((r) => `  档头 line ${r.line}: ${r.text}`).join("\n")
  return "batch: 骨架死占位残留 — the batch record's header still carries skeleton placeholders. " +
    "Fill them before writing: create with ledger / board fills the 台账 line at creation; otherwise the main agent fills the header by file edit ⇒ the record's first append/status opens. " +
    `Nothing was written. Residue:\n${list}`
}

/** §N 段体行集（段头缺失 ⇒ null——create 是骨架唯一权威入口；行切分 = /\r?\n/——EOL 形态无关）。
 *  读数面广：本档的 `sectionHeaderZoneEntries` 与 `batch-skeleton.mjs` 的 `countRoundBlocks` /
 *  `lastRoundBlock` / `sectionContentState` / `malformedInapplicableLine` 同读这一份（故导出）。 */
export function sectionBodyLines(src, seg) {
  const hdr = sectionHeaderRe(seg).exec(src)
  if (!hdr) return null
  const nextRe = /^## §\d/gm
  nextRe.lastIndex = hdr.index + hdr[0].length
  const next = nextRe.exec(src)
  const body = src.slice(hdr.index + hdr[0].length, next ? next.index : src.length)
  const nl = body.indexOf("\n") // 跳过段头行余文（`## §N …` 的标题部分）
  return (nl >= 0 ? body.slice(nl + 1) : "").split(/\r?\n/)
}

/** §N **段头区行项**（行文 + 档内绝对字符区间；段级状态行的唯一住所：`## §N` 标题行之后、下一个
 *  `##` / `###` 起行之前；段头缺失 ⇒ null）。**段头区定位的单源实现**——两个读面（`readBatchStatusLine` ∥
 *  `readSectionStatusWord`）与三个位置/计数导出（`zoneStatusLines` ∥ `zoneStatusCount` ∥
 *  `firstZoneStatusLineRange`）都从这里取，不另写第二份区界判断。 */
function sectionHeaderZoneEntries(src, seg) {
  const hdr = sectionHeaderRe(seg).exec(src)
  if (!hdr) return null
  const nextRe = /^## §\d/gm
  nextRe.lastIndex = hdr.index + hdr[0].length
  const next = nextRe.exec(src)
  const end = next ? next.index : src.length
  const nl = src.indexOf("\n", hdr.index + hdr[0].length) // 跳过段头行余文（`## §N …` 的标题部分）
  const out = []
  let at = nl < 0 || nl + 1 > end ? end : nl + 1
  while (at < end) {
    const nlAt = src.indexOf("\n", at)
    const lineEnd = nlAt < 0 || nlAt > end ? end : nlAt
    const raw = src.slice(at, lineEnd)
    const line = raw.endsWith("\r") ? raw.slice(0, -1) : raw
    if (ZONE_END_RE.test(line)) break
    out.push({ line, start: at, end: at + line.length })
    at = lineEnd + 1
  }
  return out
}

/** 段头区内**全部** `**状态行**：` 形态行（设计档 §4.21.2「列举面」；段头缺失 ∥ 区内零条 ⇒ 空集）。
 *  与 `firstZoneStatusLineRange` 同一份区界——列举与定位不各判一次。 */
export function zoneStatusLines(src, seg) {
  return (sectionHeaderZoneEntries(src, seg) ?? [])
    .filter((e) => STATUS_LINE_RE.test(e.line))
    .map((e) => e.line)
}

/** 段头区内状态行**条数**（§4.21.2——`edit` 的「改写后不多于改写前」单调性判据的唯一读数）。 */
export function zoneStatusCount(src, seg) {
  return zoneStatusLines(src, seg).length
}

/** **受保护行**的字符区间（§4.21.2「位置义」）：段头区内**第一个** `**状态行**：` 形态行——`edit` 不许碰、
 *  `status` / `close` / 重开径改写的那一行。区内零条 ⇒ null（没有保护对象，`edit` 面据此不拦）。
 *  @param {string} src — 档全文
 *  @param {number|string} seg — 段号
 *  @returns {{start:number,end:number}|null} 档内绝对字符区间（不含行尾） */
export function firstZoneStatusLineRange(src, seg) {
  const hit = (sectionHeaderZoneEntries(src, seg) ?? []).find((e) => STATUS_LINE_RE.test(e.line))
  return hit ? { start: hit.start, end: hit.end } : null
}

/**
 * §1 状态行解析（冻结门与 lifecycle 共用的**单源解析器**——原 batch-segment.mjs 逐字迁移，
 * 字面「已收口/进行中」改为消费 STATUS_WORDS[1]，行为零变）：解析对象 = §1 **段头区**内
 * `**状态行**：` 前缀行（`## §1` 标题之后、下一 `^#{2,}` 之前——与写面同一条定位面；
 * 段体 / 轮次块里引述的状态行不参与判定）。判定只认关键字（emoji / 括号装饰 / 日期后缀容忍）：含「已收口」→ "closed"
 * （冻结优先）、含「进行中」→ "open"；无 §1 / 无该行 / **区内两条以上** / 两关键字皆不命中 → "unknown"
 * （fail-closed 视为冻结）。
 * **取值面 = 可读行（计数义，§4.21.4）**：区内**恰一条**形态行才读——两条以上时机器不猜哪一条是结论。
 */
export function readBatchStatusLine(src) {
  const hits = zoneStatusLines(src, 1) // 段头单源（段头缺失 ⇒ 空集；与 isBatchRecord 同一段头正则）
  if (hits.length !== 1) return "unknown" // 零条 = 无该行 ∥ 两条以上 = 可读行不存在（同判 unknown）
  const m = STATUS_LINE_RE.exec(hits[0])
  if (!m) return "unknown"
  const value = m[1].trim()
  if (value.includes(STATUS_WORDS[1].closed)) return "closed"
  if (value.includes(STATUS_WORDS[1].open)) return "open"
  return "unknown"
}

/** 机读清单块标题（**形单源** = `batch-skeleton.mjs` 的 §2 模板占位）：行首即认，尾随标点不计。 */
const MACHINE_LIST_HEAD_RE = /^\s*\*\*受影响文件（机读清单）\*\*/
/** 表行判据（与 `doc-check/paragraph.mjs` 的 `isTableRow` 同形）。 */
const MACHINE_LIST_ROW_RE = /^\s*\|.*\|\s*$/
/** 子块界：一个块头只管到下一个标题行 ∥ 下一个块头。 */
const MACHINE_LIST_HEADING_RE = /^\s*#{1,6}\s/
/** 占位格判据（`<仓根相对路径>` 这类模板 token）：模板示例行不是记录。 */
const MACHINE_LIST_PLACEHOLDER_RE = /^<.*>$/
/** 分隔行判据（`|---|---|`）。 */
const MACHINE_LIST_SEPARATOR_RE = /^:?-{3,}:?$/
/** 表头首格（`| 档 | 分拆方案 |`）——只用来跳过表头行。 */
const MACHINE_LIST_HEADER_CELLS = Object.freeze(["档", "file"])

/** 格内文本（去首尾空白与 markdown 装饰符——写手会写成 `` `x` `` ∥ `**x**`）。 */
const cellTextOf = (s) => String(s ?? "").replace(/[`*]/g, "").trim()

/**
 * 解析 §2 的机读清单（纯函数 · 零 fs）：逐个 `**受影响文件（机读清单）**` 块头，取它**之后的第一张表**；
 * 找表范围止于下一个标题行 ∥ 下一个块头。看头不看行——同一份档里块头可能出现不止一次（先举例、再写真清单
 * 是正常写法），逐行跟读会把示例当档案。读不成 2–3 格的行跳过而不抛：那三个消费面都只为「点名哪些档」。
 * **2 格 ∥ 3 格都收，加列不移位**：第三列「行数」是追加的读数格，两格旧行照旧解得开（`reading` = 空串，
 * 由消费面按「该列没有数」判）；4 格以上仍跳过（多出来的列没有判据，读了就是替写手猜）。
 * @param {string} src 档全文
 * @returns {{path:string, plan:string, reading:string}[]} `path` 去装饰符；`plan` = 第二列原值去首尾空白；
 *   `reading` = 第三列原值去首尾空白（**两格行 = 空串**——不是 `null`：缺列与空格在这里同判「缺读数」）
 */
export function machineListRowsOf(src) {
  const lines = String(src ?? "").split(/\r?\n/)
  const rows = []
  lines.forEach((l, at) => {
    if (!MACHINE_LIST_HEAD_RE.test(l)) return
    const table = firstMachineListTable(lines, at)
    if (table === null) return
    table.forEach((raw, k) => {
      const cells = raw.trim().replace(/^\|/, "").replace(/\|$/, "").split("|")
      if (cells.length < 2 || cells.length > 3) return
      if (cells.every((c) => MACHINE_LIST_SEPARATOR_RE.test(c.trim()))) return
      if (k === 0 && MACHINE_LIST_HEADER_CELLS.includes(cellTextOf(cells[0]).toLowerCase())) return
      const path = cellTextOf(cells[0])
      if (MACHINE_LIST_PLACEHOLDER_RE.test(path)) return
      rows.push({ path, plan: cells[1].trim(), reading: cells.length === 3 ? cells[2].trim() : "" })
    })
  })
  return rows
}

/** 块头之后的第一张表（连续表行；找不到 ⇒ `null`）——扫描范围止于下一个标题行 ∥ 下一个块头。 */
function firstMachineListTable(lines, at) {
  for (let i = at + 1; i < lines.length; i++) {
    const raw = lines[i]
    if (MACHINE_LIST_HEADING_RE.test(raw) || MACHINE_LIST_HEAD_RE.test(raw)) return null
    if (!MACHINE_LIST_ROW_RE.test(raw)) continue // 空行 ∥ 围栏行 ∥ 散文：都不划块界
    const table = []
    for (let j = i; j < lines.length && MACHINE_LIST_ROW_RE.test(lines[j]); j++) table.push(lines[j])
    return table
  }
  return null
}

/**
 * 段内状态行**单行改写**（status / close / 重开三处共用——改写面之一，域限状态行；另两处 = §2 段体区间改写
 * （`edit`，§4.19）∥ 重开追记行（§4.18-B），三处都不动其余字节）：定位 `## §N` 段
 * （sectionHeaderRe 单源），**段头区**（标题行之后、下一 `##` / `###` 起行之前）内首命中行原位替换（行尾随命中行
 * 自身）；区内无该行 ⇒ 沿用既有插入形（状态行 + 两空行，段头后原有空行不动；插入块行尾 = 标题行自身行尾）。
 * 区外正文（轮次块引述的 `**状态行**：…` 行）字节零变——住所只有段头区，§1–§5 同一规则，无按段分支。
 * 字节零变（行切分 = /\r?\n/：EOL 形态无关）；段标题缺失 ⇒ throw（create 是骨架唯一权威入口）；纯字符串变换（零 fs）。
 * @param {string} src — 档全文
 * @param {number|string} seg — 段号
 * @param {string} value — 状态行值（`**状态行**：<value>`）
 * @returns {string} 改写后全文
 */
export function updateSectionStatusLine(src, seg, value) {
  const hdr = sectionHeaderRe(seg).exec(src)
  if (!hdr) {
    throw new Error(`batch: the batch record has no "## §${seg}" section header — cannot update its status line (create is the skeleton's only authoritative entry; append/status never add one). Nothing was written.`)
  }
  const nextRe = /^## §\d/gm
  nextRe.lastIndex = hdr.index + hdr[0].length
  const next = nextRe.exec(src)
  const endIdx = next ? next.index : src.length
  const line = `**状态行**：${value}`
  const parts = src.slice(hdr.index, endIdx).split(/(\r?\n)/) // 保留分隔符（奇数下标 = 行尾）——替换只动命中行
  const zoneEnd = parts.findIndex((p, i) => i >= 2 && ZONE_END_RE.test(p)) // 段头区界下标（0 = 段头行自身，不判）
  const limit = zoneEnd < 0 ? parts.length : zoneEnd
  const idx = parts.findIndex((p, i) => i < limit && STATUS_LINE_RE.test(p))
  if (idx >= 0) { parts[idx] = line } else {
    const eol = parts[1] === "\r\n" ? "\r\n" : "\n" // 缺行插入块行尾 = 标题行自身行尾
    if (parts.length === 1) parts.splice(1, 0, eol, line, eol, "", eol, "")
    else parts.splice(2, 0, line, eol, "", eol, "", eol)
  }
  return src.slice(0, hdr.index) + parts.join("") + src.slice(endIdx)
}

/**
 * §N 段状态词解析（读面单源，设计档 §2.5 的单源表）：段头（sectionHeaderRe）/ 状态行正则（STATUS_LINE_RE）/
 * 词表（STATUS_WORDS）全消费既有单源常量——与冻结门字面零漂移。**取值区只有一个 = 段头区**（`## §N` 标题行
 * 之后、下一 `^#{2,}` 之前，与写面 `updateSectionStatusLine` 同一条定位面）；区外正文引述的 `**状态行**：…`
 * 既不被改写，也不构成结论。区内**恰一条**（可读行，计数义 §4.21.4）时按**终态词优先**（closed / done 先于 open
 * ——镜像冻结门取值序）⇒ 返回该关键词；段头缺失 / 无该行 / **区内两条以上** / 无命中 ⇒ null。
 * `§4` / `§6` 无词条 ⇒ 字面 `无状态词`（不造词）。
 * @param {string} src — 档全文
 * @param {number|string} seg — 段号（`2` / `"2"`——同 sectionHeaderRe 消费形）
 * @returns {string|null} 已识别关键词 / null / 字面「无状态词」（§4 / §6）
 */
export function readSectionStatusWord(src, seg) {
  const words = STATUS_WORDS[seg]
  if (!words) return "无状态词"
  const hits = zoneStatusLines(src, seg)
  if (hits.length !== 1) return null // 零条 = 无该行 ∥ 两条以上 = 可读行不存在（§4.21.4 同判 null）
  const m = STATUS_LINE_RE.exec(hits[0])
  if (!m) return null
  const value = m[1].trim()
  // 旧字面先映到规范词（读侧等义——写侧词表零别名）
  for (const [alias, canonical] of Object.entries(STATUS_WORD_ALIASES[seg] ?? {})) {
    if (value.includes(alias)) return canonical
  }
  for (const w of [words.closed, words.done, words.open]) {
    if (w !== undefined && value.includes(w)) return w
  }
  return null
}