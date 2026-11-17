/**
 * doc-graph.mjs — 文档锚点图：扫描编排 ∥ 落库 ∥ 三查询 ∥ 走查 ∥ 降级读数。
 *
 * 机制单源 = `docs/core/design/DOC-GRAPH.md`（本档只实现，不重述口径）；需求单源 =
 * `docs/core/requirements/DOC-GRAPH.md`（F1–F5 ∥ F7 ∥ 边界七条 ∥ AC-1–AC-10；本档覆盖 AC-1–AC-9，
 * AC-10（子代理变体）的设计落点住另一档）。工具面 = `agent-tools/doc-graph.mjs`。
 *
 * **不写第二个解析器**（F2）：文档里的边由 `doc-check/anchors.mjs` 的**同一次逐行遍历**旁挂产出
 * （回调 `onEdge`，三支新家族的取形纯函数住 `doc-check/graph-tokens.mjs`）；本档只做三件它不管的事——
 * ① 决定扫哪些档；② 把回调交出来的边整形成七列并落库；③ 查询与走查。
 *
 * 扫描面（**本档的受理判据**，设计只规定「扫一次」不规定扫哪些档）：
 *  · 文档面 = `docRoot` 各层下的 `.md`，扣掉 `index.excludePaths` 声明面；层键集**单源** =
 *    `agent-tools/review-facts.mjs` 的 `REVIEW_ROOT_KEYS`（本档不另持字面——与写门 `agent/write-face.mjs` 同一组，
 *    含标准层 `standards`：它是目录层，与其余各层同扫）。
 *    边 = `cites` ∥ `cites-req` ∥ `mentions-case` ∥ `cites-symbol`。
 *  · RTM 面 = `test/RTM.md` 与 `test/rtm/*.md`：这两处不在 `docRoot` 任何一层里，而用例号的登记处就在这里
 *    ⇒ 单列一面。边 = 上面四类 + `case-file`（行配对，KD-9）。
 *  · 用例档面 = `case-file` 边点名的那些档（RTM 末格）——`imports` 边的**唯一**产出面（KD-6：只认 import 边）。
 *    这一面按需取、不扫全仓代码：图问的是「文档与代码之间那一条」，用例档就是那条桥的代码端。
 *
 * 落库纪律（KD-3 ∥ KD-4）：只存一条方向（反向查靠 `doc_edges_dst` 索引与档级折叠）；
 * 台账号（`req_doc` ∥ `task_book` ∥ `board` ∥ `executor`）**不复制进边表**，查询面在内存里投影。
 * 边表按 `scope`（产出这条边的那一档）整档替换：全仓扫 = 整表重写；带 `scope` 的扫 = 逐 scope 先删后插。
 *
 * 回执的可读性上限（设计 §2.5.2 第 5–7 条 ∥ §2.5.3）：`chain` 每层最多印 `LAYER_CAP` 条，超限层紧跟一行
 * 自述（该层**真实**条数 + 收窄办法）；被截掉的部分靠 `kind` 收窄重跑取回，不靠放大上限把整张图印出来。
 * `forward` ∥ `reverse` 不设上限——单节点直查的条数就是读者要的答案。
 *
 * 回执的行序（AC-7 ∥ AC-9）：首行口径 → 按类计数行（§2.5.0：每类后跟「已验存在 ∥ 目标不在盘 ∥ 判不了存在性」
 * 三格，零也印）→ 边行 → 时效格（§2.5.4，末行）。`scan` ∥ `forward` ∥ `reverse` 的首行**不带混合边总数**；
 * `chain` 首行的「命中 E 条边 / V 个节点」是走查规模的口径，不参与边类读数。
 *
 * W8 契约②：本档静态入 `doc-check/*`（不达 `node:sqlite`），台账库一律**动态** import（与 `ledger-tools.mjs` 同律）。
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { basename, dirname, join, relative, resolve } from "node:path"
// 文档面键集**不另持字面**（单源 = `agent-tools/review-facts.mjs` 的 `REVIEW_ROOT_KEYS`——与写门
// `agent/write-face.mjs` 同一组 docRoot 子键；两份清单漂移就是「图扫的 / 写面拦的」各说各话）。
// 层键集只在那一个常量里改，本档不另持字面。
import { REVIEW_ROOT_KEYS } from "./agent-tools/review-facts.mjs"
import { checkAnchors } from "./doc-graph/anchors.mjs"
import { caseNumberOf, rtmFamilyOf, rtmRowOf } from "./doc-graph/graph-tokens.mjs"
import { docRootPaths, readManifest } from "./manifest.mjs"
import { createResolutionSession, resolvePathTarget } from "./path-resolve.mjs"

/** 三态词（设计 §2.2 的值表原文；与 `doc_check` 的 `档缺` / `unverified` 同义不同词）。 */
const STATE_OK = "ok"
const STATE_OFF_DISK = "目标不在盘"
const STATE_UNKNOWN = "判不了存在性"

/** 目录遍历的跳过面（与 `doc-check` 的取形族同源：依赖树 / 构建产物 / 归档区都不算「本仓的档」）。 */
const SKIP_DIRS = new Set(["node_modules", "dist", "build", "coverage", "obj", "_archive"])

/** `evidence` 片段的**行首长度上限**（设计 §2.3 的形：恒从行首切，不从被引 token 处切）。 */
const SNIPPET_MAX = 80

/** `chain` 每层打印上限（设计 §2.5.2 第 5 条：`200` 是**契约常量**——改它就是改回执的可读性上限）。
 *  超限层印前 200 条 + 一行自述；深度截断另有一行，两种各印各的、不合并。 */
const LAYER_CAP = 200

/** 台账四列投影出来的 `kind`（设计 §2.4）：它们**不落** `doc_edges`，只在查询面出现，故不在存储面的
 *  六类闭集里 ⇒ 也没有 `kind` 收窄入口。`kind` 缺席 = 不滤，这四类照常全收（§2.5.3）。 */
const PROJECTION_KINDS = ["task_book", "req_doc", "board", "executor"]

/** RTM 面的目录与索引（缺一个就少产一类边，不报错——不是每个仓都有 RTM）。 */
const RTM_DIR = join("test", "rtm")
const RTM_INDEX = join("test", "RTM.md")

const slash = (p) => String(p ?? "").replace(/\\/g, "/")
const pathKey = (p) => {
  const abs = slash(resolve(String(p)))
  return process.platform === "win32" ? abs.toLowerCase() : abs
}

/** 仓相对形（节点身份与 `scope` 都按它写：正斜杠、无前导 `./`）。 */
const relOf = (root, abs) => slash(relative(root, abs))

/** `evidence` 的片段：该行**从行首起**的 ≤ 80 字符原文（不足取全行、超出以 `…` 收尾）。
 *  为什么从行首切：token 常远在行末（表格行第一格才是「这一行关于谁」），从 token 切会把那一格丢掉。 */
function snippetOf(line) {
  const chars = Array.from(String(line ?? ""))
  return chars.length > SNIPPET_MAX ? `${chars.slice(0, SNIPPET_MAX).join("")}…` : chars.join("")
}

/** `evidence` 的固定形（设计 §2.3）：`<引用方档的仓相对路径> @ <行号> 「<行首片段>」`。 */
const evidenceOf = (root, file, line, text) => `${relOf(root, file)} @ ${line} 「${snippetOf(text)}」`

/** 边的统一形（七列 + 两格标签）。`scope` = **产出这条边的那一档**（不是 `src` 解出来的档——
 *  `case-file` 的 `src` 是 `case:`，产出它的是 RTM 档；整档替换按 `scope` 删，故它必须指产出者）。
 *  `src_label` = 引用方的**名字原文**（设计 §2.3）：`doc:` 取档名，`case:` ∥ `ledger:` 取本地名
 *  （`case:CLI 41-1` ⇒ `CLI 41-1`）——一律 null 会让「按标签看这一列」在非档 src 上整列为空。 */
function makeEdge({ src, kind, dst, dstLabel = null, evidence, state, scope }) {
  const cut = src.indexOf(":")
  const head = cut < 0 ? "" : src.slice(0, cut)
  const rest = cut < 0 ? src : src.slice(cut + 1)
  return {
    src,
    src_label: head === "doc" ? basename(rest) : (head === "" ? null : rest),
    kind,
    dst,
    dst_label: dstLabel ?? null,
    evidence,
    state,
    scope,
  }
}

/** 边的去重键（与 DDL 的 `UNIQUE(src, kind, dst, evidence)` 同一把尺——同一档里同一行两处写法相同的引用，
 *  只算一条：读者的问题是「谁引了谁」，不是「写了几遍」）。 */
const edgeKey = (e) => `${e.src}\u0000${e.kind}\u0000${e.dst}\u0000${e.evidence}`

function makeSink() {
  const edges = []
  const seen = new Set()
  return {
    edges,
    push(e) {
      // 自环不入边（AC-8 ∥ 设计 §2.2）：`src` 与 `dst` **逐字相同** ⇒ 不产出边。拦在这一处，六个 `kind` 共用
      // ——回调那四类与写入侧的 `case-file` ∥ `imports` 都经这里落边，故「产出面一处」是字面的一处。
      // `doc:P → doc:P#5` 是两个节点（KD-7），不在此列、照常落边（写的人指名了那一节）。
      if (e.src === e.dst) return
      const key = edgeKey(e)
      if (seen.has(key)) return
      seen.add(key)
      edges.push(e)
    },
  }
}

/** 三格状态的**读法词**（设计 §2.5.0）：值仍是 `ok`，回执里印「已验存在」——格名回答的是「验没验过」，
 *  不是库里的枚举值本身。映射写死、第三套说法不许有（与 §2.2 的三态表同一份）。 */
const STATE_CELL_OF = { [STATE_OK]: "已验存在", [STATE_OFF_DISK]: STATE_OFF_DISK, [STATE_UNKNOWN]: STATE_UNKNOWN }

/** 按类计数行（设计 §2.5.0）：四个回执共用的形——一行内逐个类列出，每类后跟三格。
 *
 *  · **三格恒印、零也印**：省成两格就要读者记住「哪几类能判存在性」（§2.2 的三态表），而「这一类从来
 *    判不了」正是零格要传达的信息。
 *  · `cites` 与 `cites-symbol` **永不共格**（AC-7）：后者在一份设计档上往往比前者多出量级且一条也验不了，
 *    合成一个总数会让读者把满屏反引号标识符读成验过的引用。
 *  · 只列**有边的类**（列序 = 闭集序）：一条边也没有 ⇒ `按类：（本次无边）`——六个 `0 条` 不是读数。
 *  · 数的是「本次回执所依据的那批边」（§2.5.0 末条）：`scan` = 本次落库的、`forward` ∥ `reverse` = 滤后全量、
 *    `chain` = 走查命中且**已展开**的那批——数出来的数与下面印出的边是同一批。
 *
 * @param {{kind:string, state:string}[]} edges 本次回执所依据的那批边
 * @param {string[]} orderKinds 列序（存储六类在前、台账投影四类在后）
 * @returns {string} 一行（`按类：…`）
 */
function kindCountLine(edges, orderKinds) {
  if (edges.length === 0) return "按类：（本次无边）"
  const parts = []
  for (const kind of orderKinds) {
    const rows = edges.filter((e) => e.kind === kind)
    if (rows.length === 0) continue
    const cells = Object.keys(STATE_CELL_OF).map((s) => `${STATE_CELL_OF[s]} ${rows.filter((e) => e.state === s).length}`)
    parts.push(`${kind} ${rows.length} 条（${cells.join(" ∥ ")}）`)
  }
  return `按类：${parts.join(" · ")}`
}

/** 时效格（设计 §2.5.4）两形的形（`K` **恒印，两形都印**——它是「此后 N 档变更」的分母）：
 *  同批 ⇒ `图建于 <T>（<K> 档同批） · 此后 <N> 档变更 · <D> 档已不在盘`；
 *  时刻不一 ⇒ `图建于 <Tmin> … <Tmax>（各档时刻不一，<K> 档） · 此后 <N> 档变更 · <D> 档已不在盘`。
 *  旧形（各档时刻不一）漏了 `K`——`K` 是「此后 N 档变更」的分母，故两形都印；缺了它，读者只知道变了几档、不知共几档。
 *
 * 来源 = `doc_edges.scanned_at`（每行都带，按 `scope` 一档一个时刻）——**不另建表、不加列、不做增量扫描**。
 * 逐档比文件的 `mtime`，**严格大于**才算变更（等于不算：同一次落盘写出的档不该被算成「扫完又改过」）；
 * 一次目录走，不读全文、不解析、不落库。
 *
 * · `K` = 0（库里一条边行也没有）印专句、**不印**「此后 0 档变更」——零行时那句是假话，它把「没东西可量」
 *   读成「什么都没变」。
 * · 量的是**已落边的档**：扫过但零边的档、扫描之后新增的档都没有行、没有时刻，不在读数内（§7 已知限界）；
 *   `K` 印出来就是让读者知道这把尺量了多少档。
 * · 不拿全图最大时刻一把比：带 `scope` 扫过一档之后，那个新时刻会把其余各档的老化一并洗掉——那正是
 *   「写着 0 档变更而盘上确有变」的失效面。
 *
 * @param {string} root 项目根（`scope` 是仓相对形，按它解析）
 * @param {{scope?:string, scanned_at?:string}[]} rows 边表的 `scope` ∥ `scanned_at` 两列
 * @returns {string} 一行
 */
function freshnessOf(root, rows) {
  const stamps = new Map()
  for (const r of rows) if (r?.scope) stamps.set(r.scope, r.scanned_at)
  const K = stamps.size
  if (K === 0) return "本仓尚无落边的档：时效不可算（先跑 scan）"
  let changed = 0
  let gone = 0
  for (const [scope, stamp] of stamps) {
    let mtimeMs
    try {
      mtimeMs = statSync(resolve(root, scope)).mtimeMs
    } catch (e) {
      // 「已不在盘」只给真的不在盘（不在 ∥ 路径上某一段没了）。权限 ∥ 占用这类「读不到但在盘」的档记进这一格
      // 就是一句假话——这一格不猜，那几档不进任何计数（回执不说它算不出来的事）。
      if (e?.code === "ENOENT" || e?.code === "ENOTDIR") gone++
      continue
    }
    const built = Date.parse(String(stamp ?? ""))
    if (Number.isFinite(built) && mtimeMs > built) changed++
  }
  const values = [...new Set(stamps.values())].sort()
  const when = values.length === 1
    ? `图建于 ${values[0]}（${K} 档同批）`
    : `图建于 ${values[0]} … ${values[values.length - 1]}（各档时刻不一，${K} 档）`
  return `${when} · 此后 ${changed} 档变更 · ${gone} 档已不在盘`
}

/** 声明面里的排除项（项目根相对）→ 绝对路径键集（前缀命中即整棵子树不扫）。 */
function excludeKeysOf(manifest, root) {
  const raw = manifest?.index?.excludePaths
  if (!Array.isArray(raw)) return []
  return raw.filter((p) => typeof p === "string" && p.trim() !== "").map((p) => pathKey(resolve(root, p.trim())))
}

/** 目录 / 档 → 其下全部 `.md`（不跟隐藏目录、不跟依赖树与归档区；落在排除面内的一律不扫）。 */
function collectMarkdown(root, bases, excludeKeys) {
  const out = []
  const seen = new Set()
  const excluded = (abs) => {
    const k = pathKey(abs)
    return excludeKeys.some((x) => k === x || k.startsWith(`${x}/`))
  }
  const push = (abs) => {
    const k = pathKey(abs)
    if (seen.has(k)) return
    seen.add(k)
    out.push(abs)
  }
  const walk = (abs) => {
    if (excluded(abs)) return
    let st
    try { st = statSync(abs) } catch { return }
    if (st.isFile()) {
      if (/\.md$/i.test(abs)) push(abs)
      return
    }
    if (!st.isDirectory()) return
    let entries
    try { entries = readdirSync(abs, { withFileTypes: true }) } catch { return }
    for (const e of entries.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0))) {
      if (e.name.startsWith(".")) continue
      const child = join(abs, e.name)
      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue
        walk(child)
      } else if (e.isFile() && /\.md$/i.test(e.name)) push(child)
    }
  }
  for (const b of bases) walk(b)
  return out
}

/** RTM 面（索引 + 分册）：缺哪个就少哪块，不报错——不是每个仓都有 RTM。 */
function rtmFilesOf(root) {
  const out = []
  const index = join(root, RTM_INDEX)
  if (existsSync(index)) out.push(index)
  const dir = join(root, RTM_DIR)
  try {
    const names = readdirSync(dir).filter((n) => /\.md$/i.test(n)).sort()
    for (const n of names) out.push(join(dir, n))
  } catch { /* 无分册目录 ⇒ 只用索引 */ }
  return out
}

/** 读档（读不到 ⇒ 空串；本档不是判据，读不成只意味着这档产不出边）。 */
function readTextSafe(abs) {
  try { return readFileSync(abs, "utf8") } catch { return "" }
}

/** 说明符 → 仓内档（只认相对形：裸包名与 `node:` 前缀解析不到仓内档，不是本图的边）。 */
function specifierTarget(fromAbs, spec) {
  if (!spec.startsWith(".")) return null
  const abs = resolve(dirname(fromAbs), spec)
  return existsSync(abs) ? abs : null
}

/** import 子句 → 具名 / 默认导入的名字表（`{ a, b as c }` ⇒ `a`, `b`；`X, { … }` ⇒ `X` + 那批）。 */
function importNames(clause) {
  const out = []
  let rest = String(clause ?? "").replace(/^\s*import\s+/, "")
  const brace = /\{([\s\S]*?)\}/.exec(rest)
  if (brace) {
    for (const part of brace[1].split(",")) {
      const name = part.trim().split(/\s+as\s+/)[0].trim()
      if (/^[A-Za-z_$][\w$]*$/.test(name)) out.push(name)
    }
    rest = rest.replace(brace[0], "")
  }
  const ns = /\*\s*as\s+([A-Za-z_$][\w$]*)/.exec(rest)
  if (ns) { out.push(ns[1]); return out }
  const def = /^\s*([A-Za-z_$][\w$]*)\s*,?\s*$/.exec(rest)
  if (def) out.push(def[1])
  return out
}

/** `imports` 边的取形式：`import … from "<说明符>"`（单行 / 多行两种写法都吃，`[^;]` 不跨语句）。 */
const IMPORT_RE = /import\s+([^;]*?)\s*from\s*["']([^"']+)["']/g

/** 一份代码档的 import 语句 → 具名导入的符号名（逐条 `{name, spec, line}`）。
 *  **只认 import 边**（KD-6）：断言里的字符串是运行结果，不是引用——那条反推不做（需求档 §3 第一行）。 */
function importsOf(abs, text) {
  const out = []
  const lines = text.split("\n")
  const lineAt = (idx) => text.slice(0, idx).split("\n").length
  IMPORT_RE.lastIndex = 0
  let m
  while ((m = IMPORT_RE.exec(text)) !== null) {
    const clause = m[1]
    const spec = m[2]
    if (!spec.startsWith(".")) continue // 裸包名 / `node:` 前缀：不进图（仓内档才是端点）
    const target = specifierTarget(abs, spec)
    if (!target) continue // 说明符解析不到仓内档 ⇒ 不是本图的边（不猜）
    const line = lineAt(m.index)
    for (const name of importNames(clause)) out.push({ name, line, text: lines[line - 1] ?? "" })
  }
  return out
}

/** 节点 → 档级折叠格（KD-8）：`doc:P#5` 与 `doc:P` 属同一格；其余身份自成一格。
 *  **只折邻接、不并身份**：打印时逐条按它真实的 `dst` 出去（AC-5 要靠这个分辨力）。 */
function foldNode(node) {
  const s = String(node ?? "")
  if (!s.startsWith("doc:")) return s
  const rest = s.slice(4)
  const i = rest.indexOf("#")
  return i < 0 ? s : `doc:${rest.slice(0, i)}`
}

/** 台账四列的**查询面投影**（KD-4）：不落进 `doc_edges`，每次查询按当下行值算——
 *  台账行会变（状态迁移、指针改写），复制出来的边立刻过期。 */
function projectItems(rows) {
  const out = []
  const add = (row, col, dst) => out.push({
    src: `ledger:#${row.id}`,
    src_label: null,
    kind: col,
    dst,
    dst_label: null,
    evidence: `台账行 #${row.id} · ${col} = ${dst}`,
    state: STATE_UNKNOWN, // 投影面不判存在性（指针可能指仓外档），不冒充 ok
    scope: `ledger:#${row.id}`,
  })
  const ptrPath = (v) => {
    if (typeof v !== "string") return null
    const p = v.split("§")[0].trim()
    return p || null
  }
  for (const row of rows) {
    const tb = ptrPath(row.task_book)
    if (tb) add(row, "task_book", `doc:${slash(tb)}`)
    const rd = ptrPath(row.req_doc)
    if (rd) add(row, "req_doc", `doc:${slash(rd)}`)
    if (typeof row.board === "string" && row.board.trim() !== "") add(row, "board", `board:${row.board.trim()}`)
    if (typeof row.executor === "string" && row.executor.trim() !== "") add(row, "executor", `session:${row.executor.trim()}`)
  }
  return out
}

/** 扫描（`target` = 项目根，`scope` = 只重扫这些档）。
 *
 * 业务门（设计 §6 用例 7–10：抛或拒并**点名**，不许降级成空结果）：
 * `target` 不在盘 ⇒ 抛（零写）；无项目根 ⇒ 抛（台账写面「无根即抛」的既有判据，零落盘零建库）；
 * 台账库读不到 / 写不进 ⇒ 抛（不静默交一份没落库的读数）。
 *
 * @param {{target:string, scope?:string[], boundary:string}} o
 * @returns {Promise<string>} 回执（首格恒写 `全仓` 或 `范围 K 档`；无需求层时首行是降级读数）
 */
export async function scanDocGraph({ target, scope, boundary }) {
  const start = resolve(String(target ?? "."))
  if (!existsSync(start)) {
    throw new Error(`doc_graph(scan)：target 不存在：${start}——请给存在的项目根（相对路径按会话锚解析）；未落任何边`)
  }
  const { DOC_EDGE_KINDS, noRootMessage, nowIso, openLedger, resolveLedgerRoot } = await import("./ledger-db.mjs")
  const derived = resolveLedgerRoot(start, boundary)
  if (!derived) throw new Error(noRootMessage(start, boundary))
  const root = derived.root
  let man = { ok: false }
  try { man = readManifest(root) } catch { man = { ok: false } }
  const docRoot = man.ok ? (man.manifest?.docRoot ?? {}) : {}
  const rootsOf = (key) => docRootPaths(docRoot[key], root)
  // 「本仓无需求层」的判据 = **声明档里没有这个键**（键缺席；`null` 同判）——不能只看填好默认值后的值：
  // `readManifest` 会按 `DEFAULT_MANIFEST` 补上 `docRoot.requirements`（补出来的路径通常不在盘），
  // 那样每个仓都「有」需求层，F5 的降级读数永远不出。`missingKeys` 正是「写出来的那一份里缺哪些键」。
  const requirementsDeclared = man.ok && !(man.missingKeys ?? []).includes("docRoot.requirements")
  const hasRequirements = requirementsDeclared && rootsOf("requirements").length > 0
  const excludeKeys = man.ok ? excludeKeysOf(man.manifest, root) : []

  // ① 扫描面：文档面（`REVIEW_ROOT_KEYS` 声明的各层）∪ RTM 面（`scope` 给了 ⇒ 两侧都按它收窄——「只重扫这些档」说的是档，不是说面）
  const docBases = []
  for (const key of REVIEW_ROOT_KEYS) {
    for (const b of rootsOf(key)) if (!docBases.some((x) => pathKey(x) === pathKey(b))) docBases.push(b)
  }
  const scopeWanted = (Array.isArray(scope) ? scope : []).filter((s) => typeof s === "string" && s.trim() !== "")
  const scopeKeys = new Set(scopeWanted.map((s) => pathKey(resolve(root, s.trim()))))
  const keep = (abs) => scopeKeys.size === 0 || scopeKeys.has(pathKey(abs))
  const docFiles = collectMarkdown(root, docBases, excludeKeys).filter(keep)
  const rtmAbs = rtmFilesOf(root).filter(keep)
  const scanned = new Set([...docFiles, ...rtmAbs].map(pathKey))
  // 本次真正重扫过的档（仓相对；整档替换按它删）——`case-file` / `imports` 的 scope 取**产出者**，
  // 与 `src` 解出来的档不一定同一个，故这份清单在产边过程中累积，不靠入参猜。
  const touchedScopes = new Set([...docFiles, ...rtmAbs].map((f) => relOf(root, f)))

  // ② 文档面 + RTM 面：一次 `checkAnchors`、一个回调（边与判定同一批 token——F2 的那条理由）
  const sink = makeSink()
  const anchorsRes = checkAnchors(root, {
    files: [...docFiles, ...rtmAbs],
    manifest: man,
    onEdge: (t) => {
      const evidence = evidenceOf(root, t.file, t.line, t.text)
      const scopeRel = relOf(root, t.file)
      if (t.kind === "cites") {
        // `dst` 用解析出来的档（在盘时）∥ 写出来的 token（不在盘时——**不替换 dst**，AC-6）
        const docPart = t.abs ? relOf(root, t.abs) : slash(t.token)
        const dst = t.section ? `doc:${docPart}#${t.section}` : `doc:${docPart}`
        sink.push(makeEdge({ src: `doc:${scopeRel}`, kind: "cites", dst, dstLabel: t.sectionLabel ?? null, evidence, state: t.state, scope: scopeRel }))
        return
      }
      const dst = t.kind === "cites-req" ? `req:${t.token}` : t.kind === "mentions-case" ? `case:${t.token}` : `symbol:${t.token}`
      sink.push(makeEdge({ src: `doc:${scopeRel}`, kind: t.kind, dst, dstLabel: t.token, evidence, state: STATE_UNKNOWN, scope: scopeRel }))
    },
  })

  // ③ RTM 行配对（KD-9）：`case:CLI 41-1 --case-file--> doc:test/integration/…`
  const session = createResolutionSession()
  for (const rtmPath of rtmAbs) {
    const text = readTextSafe(rtmPath)
    let family = null
    text.split("\n").forEach((l, i) => {
      const head = rtmFamilyOf(l)
      if (head !== null) { family = head; return }
      const row = rtmRowOf(l)
      if (!row || family === null) return
      const caseNode = caseNumberOf(family, row.num) // 身份 = 族名 + 行首格编号（`CLI 41-1`；拼法单源 = 取形档）
      if (row.fileToken === null) return // 末格没有档 token ⇒ 这条关系没有登记处可读，不猜（KD-9）
      const r = resolvePathTarget(root, row.fileToken, { kind: "file", order: "root-first", referrer: rtmPath, declaredRepos: true, suffixFallback: true, session })
      const onDisk = r.state === "resolved"
      sink.push(makeEdge({
        src: `case:${caseNode}`,
        kind: "case-file",
        dst: onDisk ? `doc:${relOf(root, r.abs)}` : `doc:${slash(row.fileToken)}`,
        evidence: evidenceOf(root, rtmPath, i + 1, l),
        state: onDisk ? STATE_OK : STATE_OFF_DISK,
        scope: relOf(root, rtmPath),
      }))
    })
  }

  // ④ 用例档面（`imports` 边）：只扫 `case-file` 点名的那些档——图问的是「文档与代码之间那一条」
  const caseTargets = []
  for (const e of sink.edges) {
    if (e.kind !== "case-file" || e.state !== STATE_OK) continue
    const abs = resolve(root, e.dst.slice(4))
    if (!caseTargets.some((x) => pathKey(x) === pathKey(abs))) caseTargets.push(abs)
  }
  for (const abs of caseTargets) {
    const scopeRel = relOf(root, abs)
    if (!scanned.has(pathKey(abs))) scanned.add(pathKey(abs))
    touchedScopes.add(scopeRel)
    for (const imp of importsOf(abs, readTextSafe(abs))) {
      sink.push(makeEdge({
        src: `doc:${scopeRel}`,
        kind: "imports",
        dst: `symbol:${imp.name}`,
        dstLabel: imp.name,
        evidence: evidenceOf(root, abs, imp.line, imp.text),
        state: STATE_UNKNOWN, // `symbol:` 一律判不了存在性（设计 §2.2 三态表）
        scope: scopeRel,
      }))
    }
  }

  // ⑤ 落库：全仓扫 = 整表重写；带 `scope` = 逐 scope 先删后插（设计 §2.3「整档替换，没有旧边留一半的中间态」）
  const edges = sink.edges
  const db = openLedger(root, { create: true, boundary })
  // 时效格的原料（设计 §2.5.4）：落库之后按 `scope` 取一档一个时刻。刚落的这批就是下面那个 `stamp`，
  // 带 `scope` 扫时其余各档留着旧值——「一档一个时刻」本来就在每行上，不另建表、不加列、不做增量扫描。
  let stamps = []
  try {
    const stamp = nowIso()
    db.exec("BEGIN")
    try {
      if (scopeKeys.size === 0) db.exec("DELETE FROM doc_edges")
      else {
        // 删的键 = 本次真正重扫过的那些档（`touchedScopes`）——不是把调用方给的原串直接当 scope 用：
        // 入参可以是绝对路径或带 `./`，而表里存的是仓相对形，照原串删会一条都删不到（旧边留着、新边插入被
        // `UNIQUE` 挡掉，看起来「重扫没生效」）。
        const del = db.prepare("DELETE FROM doc_edges WHERE scope = ?")
        for (const s of touchedScopes) del.run(s)
      }
      const ins = db.prepare("INSERT OR IGNORE INTO doc_edges (src, src_label, kind, dst, dst_label, evidence, state, scope, scanned_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)")
      for (const e of edges) ins.run(e.src, e.src_label, e.kind, e.dst, e.dst_label, e.evidence, e.state, e.scope, stamp)
      db.exec("COMMIT")
    } catch (e) {
      try { db.exec("ROLLBACK") } catch { /* 已回滚 / 未开 */ }
      throw new Error(`doc_graph(scan)：边表写入失败：${e?.message ?? e}——本次零改动`)
    }
    stamps = db.prepare("SELECT DISTINCT scope, scanned_at FROM doc_edges").all().map((r) => ({ ...r }))
  } finally {
    try { db.close() } catch { /* 已关 */ }
  }

  // ⑥ 回执：首格恒写范围（缺席的含义被印出来，不靠记）；无需求层时**首行**是降级读数（AC-4）。
  // 首行**不带任何混合边总数**（AC-7 ∥ 设计 §2.5）：数与分布都在紧跟的按类计数行里，读者不必自己拆一个总数。
  // 行序 = 降级读数 → 首行 → 按类计数（§2.5.0）→ 回调异常（§2.6，有则一行）→ 时效格（§2.5.4，末行）。
  const kinds = [...new Set(edges.map((e) => e.kind))].sort()
  const out = []
  if (!hasRequirements) {
    // 降级第一级（F5）：没有需求层 ⇒ 仍出（`cites` ∥ `cites-symbol` ∥ `case-file` ∥ `imports` 这些不依赖它的边）
    out.push("本仓无需求层")
    out.push(`实出的边类型：${kinds.length > 0 ? kinds.join(" ∥ ") : "无"}`)
  }
  const scopeRead = scopeKeys.size === 0 ? "全仓" : `范围 ${scopeWanted.length} 档`
  out.push(`${scopeRead} · 扫 ${scanned.size} 档`)
  out.push(kindCountLine(edges, DOC_EDGE_KINDS))
  if ((anchorsRes.edgeCallbackErrors ?? 0) > 0) out.push(`回调异常 ${anchorsRes.edgeCallbackErrors} 条（边可能少落——回调抛过，doc_check 的判定零改）`)
  out.push(freshnessOf(root, stamps))
  return out.join("\n")
}

/** 读面：`doc_edges` + 台账四列投影（一次读全，内存折叠）。 */
async function loadGraph(target, boundary) {
  const { noRootMessage, openLedger, resolveLedgerRoot } = await import("./ledger-db.mjs")
  const start = resolve(String(target ?? "."))
  if (!existsSync(start)) {
    throw new Error(`doc_graph：target 不存在：${start}——请给存在的项目根；本次零查询`)
  }
  const derived = resolveLedgerRoot(start, boundary)
  if (!derived) throw new Error(noRootMessage(start, boundary))
  let db
  try {
    db = openLedger(start, { readOnly: true, boundary })
  } catch (e) {
    throw new Error(`doc_graph：台账库读不到：${e?.message ?? e}（读失败就是读失败，不回一份空图）`)
  }
  if (!db) return { scanned: false, edges: [], projections: [] }
  try {
    const has = db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'doc_edges'").get()
    // 旧库（v3 之前）没有边表：这不是「空图」，是「还没扫过」——两张面不许同形（设计 §6 用例 10）
    if (has === undefined) return { scanned: false, edges: [], projections: [] }
    // `scanned_at` 一并取出：时效格（§2.5.4）按 `scope` 一档一个时刻算，读面不再查一次库
    const edges = db.prepare("SELECT src, src_label, kind, dst, dst_label, evidence, state, scope, scanned_at FROM doc_edges").all()
      .map((r) => ({ ...r }))
    const rows = db.prepare("SELECT id, req_doc, task_book, board, executor FROM items").all()
    return { scanned: true, root: derived.root, edges, projections: projectItems(rows) }
  } finally {
    try { db.close() } catch { /* 已关 */ }
  }
}

/** 参数门（设计 §2.5「参数零默认」）：缺即拒并**点名**那个参数——给默认值就是替调用方做决定。 */
function requireParam(name, value) {
  const missing = value === undefined || value === null || (typeof value === "string" && value.trim() === "")
  if (missing) throw new Error(`doc_graph：${name} 缺失（必填）——请给 ${name}；本次零查询（不拿空结果当答案）`)
  return typeof value === "string" ? value.trim() : value
}

const edgeLineOf = (e) => `${e.src} --${e.kind}--> ${e.dst}`
const evidenceLineOf = (e) => `    ${e.evidence}`
const stateCellOf = (e) => ` · ${e.state}`
/** 只读角色的未建图空态（逐字 = TOOLS.md §6.29 ③ 的目标字面）：说明「尚未建图」不是「业务空图」、
 *  并给出可重试的方向——不含「ask the parent」，也不要求本角色执行 `scan`（B5 要消除的正是那次往返）。 */
export const UNSCANNED_READONLY_STATE = "doc_graph: graph not built yet (read-only empty state) — no edges are asserted because this repository has not been scanned. Retry after the existing scan entry updates the graph."

/** 字典序比较（层内全序补键与顺带排序共用；不引 locale 比较——输出要跨机逐字节相同）。 */
const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

/**
 * `kind` 收窄入参（设计 §2.5.3）：逗号分隔的子集，闭集 = **存储面的六类**（单源 = `ledger-db.mjs` 的
 * `DOC_EDGE_KINDS`，DDL 的 CHECK 由它生成——一份闭集，两个消费面）。
 *
 * **缺席 ⇒ 不滤**（六类 + 台账投影四类全收）：投影是 §2.4「链路 = `doc_edges` ∪ `items` 投影」的那一半，
 * 它落不进存储面的闭集，却绝不该被「没传 kind」静默丢掉。
 * **闭集外的值 ⇒ 拒并点名那个值**：静默当空集就是让「没这类边」冒充「没边」。
 *
 * @param {unknown} raw 调用方给的 `kind`（缺席 = `undefined` / `null`）
 * @param {string[]} closed 闭集（存储面六类，顺序即回执里的印刷序）
 * @returns {Set<string>|null} null = 不滤
 */
function kindFilterOf(raw, closed) {
  if (raw === undefined || raw === null) return null
  if (typeof raw !== "string") {
    throw new Error(`doc_graph：kind 须为逗号分隔的字符串（收到 ${typeof raw}）——取值 ∈ {${closed.join(", ")}}；本次零查询`)
  }
  const list = raw.split(",").map((s) => s.trim()).filter((s) => s !== "")
  const bad = list.find((k) => !closed.includes(k))
  if (bad !== undefined || list.length === 0) {
    throw new Error(
      `doc_graph：kind 非法（${JSON.stringify(bad ?? raw)}）——取值 ∈ {${closed.join(", ")}}（逗号分隔可给多个；`
      + `台账投影四类 ${PROJECTION_KINDS.join(" ∥ ")} 没有收窄入口——不传 kind 即全收）；本次零查询`,
    )
  }
  return new Set(list)
}

/** 首行恒印「本次生效的 kind 集合」（设计 §2.5.3：缺席的含义印出来，不靠记）。 */
function kindHeadOf(kindSet, closed) {
  if (kindSet === null) return `kind = 全部十类：${[...closed, ...PROJECTION_KINDS].join(" ∥ ")}`
  return `kind = ${closed.filter((k) => kindSet.has(k)).join(" ∥ ")}`
}

/**
 * 查询（`forward` ∥ `reverse` ∥ `chain`）。
 *
 * 档级邻接折叠（KD-8）：`doc:P` 与 `doc:P#N` 共用同一批邻边（逐条按真实身份打印）。
 * 排序 = `kind` / `src` / `dst` 字典序（设计 §7：本面没有「相关度」这个概念）；`chain` 的层内另按
 * `dst` → `kind` → `src` → `evidence` 全序（§2.5.2 第 6 条）。
 * `kind`（可选，设计 §2.5.3）：**先滤 → 再排序 → 再分层 → 再按上限印**，收窄后那一跑是完整的一跑。
 *
 * `unscanned`（TOOLS.md §6.29 ③ · B5）：未建图时的策略，由**结构状态** `graph.scanned === false`
 * 分流，不靠错误文本猜。缺省 = 抛既有指引（depth-0 面逐字不变）；只读角色传 `readonly-empty` ⇒
 * 返回可读空态（点名「尚未建图」≠「业务空图」，且不要求本角色或父代去跑 `scan`）。数据库读不到
 * 仍是读取失败（`loadGraph` 抛），绝不落成空态。
 *
 * @param {{action:'forward'|'reverse'|'chain', target:string, node?:string, depth?:number, kind?:string, boundary:string, unscanned?:'throw'|'readonly-empty'}} o
 * @returns {Promise<string>} 回执（文字；一行一条边，后随 `evidence`；首行口径→按类计数行→边行→时效格末行）
 */
export async function queryDocGraph({ action, target, node, depth, kind, boundary, unscanned = "throw" }) {
  requireParam("target", target)
  const nodeText = requireParam("node", node)
  let depthNum = null
  if (action === "chain") {
    depthNum = requireParam("depth", depth)
    if (typeof depthNum !== "number" || !Number.isInteger(depthNum) || depthNum < 1) {
      throw new Error(`doc_graph：depth 非法（${JSON.stringify(depth)}）——请给正整数（跳数 = 边数）；本次零查询`)
    }
  }
  // 闭集单源 = `ledger-db.mjs` 的 `DOC_EDGE_KINDS`；动态 import 遵 W8 契约②（本档静态链不入 node:sqlite）
  const { DOC_EDGE_KINDS } = await import("./ledger-db.mjs")
  const kindSet = kindFilterOf(kind, DOC_EDGE_KINDS) // 先校验：闭集外的值连库都不打开
  const graph = await loadGraph(target, boundary)
  if (!graph.scanned) {
    if (unscanned === "readonly-empty") return UNSCANNED_READONLY_STATE
    throw new Error("doc_graph：本仓尚未扫过（无 doc_edges 表）——先跑 scan（空图与「没扫过」不是一件事，不输出空图）")
  }
  const all = [...graph.edges, ...graph.projections]
  // 先滤（§2.5.3 的作用点）：缺席 = 不滤；被宽度截掉的那部分靠这里取回
  const selected = kindSet === null ? all : all.filter((e) => kindSet.has(e.kind))
  const kindHead = kindHeadOf(kindSet, DOC_EDGE_KINDS)
  // 按类计数行的列序：存储六类在前（闭集单源 = `DOC_EDGE_KINDS`），台账投影四类在后——与 `kindHead` 同一序
  const orderKinds = [...DOC_EDGE_KINDS, ...PROJECTION_KINDS]
  // 时效格按**整张表**算，不按本次收窄的那批：图的年纪不随问法变（§2.5.4）
  const fresh = freshnessOf(graph.root, graph.edges)
  // 空结果的两种形状分开说：收窄后的「这一集里没有」不许冒充「这个节点没有边」
  const emptyOf = (dir) => (kindSet === null
    ? `该节点没有${dir}（空结果——不是降级读数：本仓有没有需求层由 scan 回执说）`
    : `该节点在本次收窄的 kind 集合里没有${dir}（首行印了生效集合；不传 kind 查全量）`)
  const family = foldNode(nodeText)
  if (action === "forward") {
    const rows = selected.filter((e) => foldNode(e.src) === family).sort(byKindSrcDst)
    // 首行**不带混合条数**（AC-7）：条数与三态分布都在紧随的按类行里，`（按档折叠）` 只标邻接口径
    const head = `doc_graph(forward) · 起点 ${nodeText} · ${kindHead}（按档折叠）`
    const body = rows.length === 0
      ? [emptyOf("出边")]
      : rows.map((e) => `${edgeLineOf(e)}${stateCellOf(e)}\n${evidenceLineOf(e)}`)
    return [head, kindCountLine(rows, orderKinds), ...body, fresh].join("\n")
  }
  if (action === "reverse") {
    const rows = selected.filter((e) => foldNode(e.dst) === family).sort(byKindSrcDst)
    const head = `doc_graph(reverse) · 起点 ${nodeText} · ${kindHead}（按档折叠）`
    const body = rows.length === 0
      ? [emptyOf("入边")]
      : rows.map((e) => `${edgeLineOf(e)}${stateCellOf(e)}\n${evidenceLineOf(e)}`)
    return [head, kindCountLine(rows, orderKinds), ...body, fresh].join("\n")
  }
  return chainOf({ all: selected, nodeText, depth: depthNum, closedKinds: DOC_EDGE_KINDS, orderKinds, kindHead, narrowed: kindSet !== null, fresh })
}

/** 排序单源：`kind` → `src` → `dst`（字典序；不分相关度）。 */
function byKindSrcDst(a, b) {
  if (a.kind !== b.kind) return a.kind < b.kind ? -1 : 1
  if (a.src !== b.src) return a.src < b.src ? -1 : 1
  return a.dst < b.dst ? -1 : a.dst > b.dst ? 1 : 0
}

/**
 * 走查（设计 §2.5.2 七条规则逐条落地）：
 * ① 一步 = 一条边，允许正反交替（`cites-req` 的 src 恒是 `doc:`，从 `req:` 起第一步**只能**反向走）；
 * ② 按**边数**分层，逐条打印（反向步印 `src <--kind-- dst`，落点在那条线的**左端**——接不接得上按「上一步的
 *    落点 = 下一步的起点」读，不按打印列序读）；③ 每节点只入队一次（按折叠后的档级格），环自然截断；
 * ④ 首行印口径（起点 / 深度 / 边数 / 节点数 / 本次生效的 kind 集合）；
 * ⑤ 截断分两种、各印各的：**宽度**每层上限 `LAYER_CAP`，超限层紧跟一行自述（真实条数 + 收窄办法，
 *    哪一层截就在哪一层说）；**深度**走满仍可展开 ⇒ 末行印「已截断（depth = …）」，不静默交出半条链；
 * ⑥ 层内**全序** `dst` → `kind` → `src` → `evidence`（与库内行序无关：同一跑两次逐字节相同，
 *    被截掉的那部分于是可复现、可用 `kind` 收窄取回）；
 * ⑦ 上限之内不替读者挑路——同层并列的边全部打印；超上限的那部分由 §2.5.3 的收窄入口取回，
 *    不由本面猜「哪一条重要」。
 * ⑧ 按类计数行紧跟首行，只数**已展开**的那批（被宽度截掉的不在内，那一层的真实条数由自述行给——§2.5.0）。
 */
function chainOf({ all, nodeText, depth, closedKinds, orderKinds, kindHead, narrowed, fresh }) {
  // 邻接索引（按**折叠后的档级格**建两份）：走查是「通路搜索」，每层只在当代前沿上展开——
  // 每层扫全表是 O(前沿 × 边)，97k 条边的图上那是分钟级；建两份表是 O(边)，之后每层只碰真正相邻的那些。
  const bySrc = new Map()
  const byDst = new Map()
  const addTo = (map, key, e) => {
    const list = map.get(key)
    if (list) list.push(e)
    else map.set(key, [e])
  }
  for (const e of all) {
    addTo(bySrc, foldNode(e.src), e)
    addTo(byDst, foldNode(e.dst), e)
  }
  const visited = new Set([foldNode(nodeText)])
  const printed = new Set()
  const layers = []
  const nodesSeen = [nodeText]
  let frontier = [nodeText]
  let truncated = 0
  for (let hop = 1; hop <= depth; hop++) {
    const layer = []
    const next = []
    for (const cur of frontier) {
      const curFold = foldNode(cur)
      const incidents = [...(bySrc.get(curFold) ?? []), ...(byDst.get(curFold) ?? [])]
      for (const e of incidents) {
        const key = edgeKey(e)
        if (printed.has(key)) continue
        const srcFold = foldNode(e.src)
        const dstFold = foldNode(e.dst)
        // 同一档级格内的边（`doc:P` ↔ `doc:P#5`）：**照印**（它是真关系——「这一档按整档引了它自己的那一节」
        // 也是要看得见的），但落点仍在本格 ⇒ 不展开、不重复入队。设计 §2.5.2 只授权「环自然截断」，
        // 没有授权把格内的边静默吃掉。方向按正向印（`src --kind--> dst`）。
        const sameCell = srcFold === curFold && dstFold === curFold
        const forward = sameCell ? true : srcFold === curFold
        printed.add(key)
        const landing = forward ? e.dst : e.src
        layer.push({ e, forward })
        const landingFold = foldNode(landing)
        if (!visited.has(landingFold)) {
          visited.add(landingFold)
          nodesSeen.push(landing)
          next.push(landing)
        }
      }
    }
    // 全序（§2.5.2 第 6 条）：前两键定层内次序，后两键只在同 dst 同 kind 时生效——不加后两键，
    // 「前 200 条」就落在库内行序上，「同一跑两次相同」只是碰巧成立。
    layer.sort((a, b) => cmp(a.e.dst, b.e.dst) || cmp(a.e.kind, b.e.kind) || cmp(a.e.src, b.e.src) || cmp(a.e.evidence, b.e.evidence))
    layers.push({ hop, layer })
    frontier = next
    if (frontier.length === 0) break
    if (hop === depth) truncated = frontier.length
  }
  const edgeCount = layers.reduce((n, l) => n + l.layer.length, 0)
  const head = `走查起点 ${nodeText} · 深度 ${depth} 跳 · 命中 ${edgeCount} 条边 / ${nodesSeen.length} 个节点 · ${kindHead}`
  const body = []
  const expanded = [] // 按类计数的对象 = 真正印出来的那批（§2.5.0 末条：数与下面印出的边是同一批）
  for (const { hop, layer } of layers) {
    if (layer.length === 0) continue
    body.push(`第${hop}跳`)
    for (const { e, forward } of layer.slice(0, LAYER_CAP)) {
      expanded.push(e)
      const arrow = forward ? `${e.src} --${e.kind}--> ${e.dst}` : `${e.src} <--${e.kind}-- ${e.dst}`
      body.push(`  ${arrow}${stateCellOf(e)}`)
      body.push(`  ${evidenceLineOf(e).trim()}`)
    }
    // 宽度截断：紧跟本层边行、下一层 `第 n 跳` 之前（§2.5.2 第 5 条「哪一层截就在哪一层说」）
    if (layer.length > LAYER_CAP) body.push(layerCapLine(layer, hop, closedKinds))
  }
  if (edgeCount === 0) {
    body.push(narrowed
      ? "该节点在本次收窄的 kind 集合里没有邻边（首行印了生效集合；不传 kind 查全量）"
      : "该节点在图上没有邻边（空结果——不是降级读数：本仓有没有需求层由 scan 回执说）")
  }
  if (truncated > 0) body.push(`已截断（depth = ${depth}）：${truncated} 个节点未展开`)
  return [head, kindCountLine(expanded, orderKinds), ...body, fresh].join("\n")
}

/** 宽度截断自述行（设计 §2.5.2 第 5 条）：`M` 是**该层真实条数**，不是印出来的条数。
 *  点名的 `kind` 必须是闭集内、且该层真实有的那几类——点名闭集外的值等于把读者送进拒文。
 *  闭集内一个都没有（整层是台账投影边）⇒ 明说收窄不到，不赔一句假办法。 */
function layerCapLine(layer, hop, closedKinds) {
  const present = new Set(layer.map(({ e }) => e.kind))
  const usable = closedKinds.filter((k) => present.has(k))
  if (usable.length === 0) return `本层无可收窄的 kind（截断部分只有投影类边）`
  return `本层并列 ${layer.length} 条，此处印前 ${LAYER_CAP} 条；收窄办法 = kind=${usable.join(",")}（第 ${hop} 跳）`
}