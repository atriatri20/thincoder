/**
 * doc-check/report-blocks.mjs — **报面块与命中行**族：两问法的回执行、读数块、清单块的句形单源。
 *
 * 机制单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20（报面固定句形）与 §2.7 ∥ §2.5（豁免块 ∥ 域表读数）；
 * 分拆落点与验收 = `docs/core/design/DOC-CHECK.md` §2.9.7。**为什么单独立档**：这一族只把已经判出来的东西
 * 排成行——它不抽 token、不判存在性、不改 verdict，所以整族搬走不动判法一字。
 *
 * **句形单源**：同一句话在中多处被消费（`gate` 报面 ∥ 报告态报面 ∥ `agent-tools/batch-gate.mjs` 的拒串 ∥
 * `scripts/doc-check.mjs` 的段报告段）时只在本档写一遍，消费面只 import——抄一次就是「改一处漏两处」。
 */
import { resolve } from "node:path"
import { DOC_CHECK_BUILTINS, DOC_CLASS } from "./paragraph.mjs"
import { LINE_REF_CLASS } from "./line-refs.mjs"
import { NO_ROOT_HEAD, bucketLines, pathKey, rootsSuffix } from "./per-root.mjs"

/** 判集未指向成环仓时的读数；该仓级事实不进本次阻断集。 */
export const CYCLE_READ_LINE = (n) => `环引 ${n} 条（本次判集未指向成环仓，不阻断交付）`

/** 行号坐标命中行（报面单源）：档 + 行定位 + 形别（①②③ 是读数分类，不是判据分级）+ 原文片段 ≤ 40 字
 *  （读者不打开源档就能判「这是引用还是举例」）。**只出正文面**（围栏内不入判、只出一行读数），故不带围栏标。
 *  `lay` = 报面路径形（§2.3）：行首项目标签（≥2 根才打）+ 行内路径相对该档自身的根。 */
export const lineRefHitLine = (lay, h) => `${lay.tag(h.file)}✗ ${LINE_REF_CLASS} ${lay.shown(h.file)}:${h.line} ${h.form} ${h.snippet}`

/** 围栏内读数行（固定句形 · 单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.23「gate 判据」块的读数句）：
 *  围栏里的是逐字证据（日志 ∥ 拒文 ∥ diff ∥ 前后对照），坐标钉的是那份原文里的位置——不是指向今天盘面的指针，
 *  所以不入判；留这一行是为了「围栏内那片未判的坐标没被忘掉」与「闸那边也不改它」两件事都看得见。N = 0 时不出。 */
export const fencedRefNote = (n) => `围栏内行号坐标 ${n} 处——快照里的位置，不是指针；不入判（report 清单照列）`

/** 段命中的处置块（五行 · 逐字单源）：口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「报面（固定句形 · 交付门 gate）」尾行。
 *  三处消费面（本档 `gateReport` ∥ `agent-tools/batch-gate.mjs` 的报面组装与拒串 ∥ `scripts/doc-check.mjs` 的段报告段）
 *  只 import 本数组、零字面复制——同一句话抄三遍，改一处漏两处是必然。
 *  **为什么住本档**：报面尾行本来就住这里，`batch-gate.mjs` 已 import 引擎 ⇒ 字面随报面同源，不新增第三个 import 面。
 *  **为什么是五行而不是一句命令口吻的单条出路**：被拒的人当场只读得到这一面——旧句只说「你该怎么改」且只给一条出路；
 *  规则面本有三条，且「过机检」与「是处置」是两件事（切段 ∥ 缩短能过计数，读者拿到的还是同一堵墙）。
 *  **何时出**：只跟「文字太长，难于阅读」类命中走；仅锚 ∥ 仅行命中 ⇒ 零处置块（叫人对段落动手而问题不在此 = 指错方向）。 */
export const PARA_DISPOSE = Object.freeze([
  "处置：上面这些段落，读者一口气读不完——不是字符数超了，是这一段装的事太多。",
  "出路三条：① 重组结构——无标记的续行逐条添标记、逐条起名，拆成带名的列表项（逐字不改）∥ ② 重写文字——把长句拆成几句短的（意思不变，句子变少）∥ ③ 改写成表格行——内容本是逐条读数 / 映射 / 清单时成立。",
  "① ∥ ③ 只对能逐条起名的并列断言成立——一条因果链拆成带名条目还是同一条因果链，读者拿到的只有断点；讲因果的长段走 ②。",
  "折行连机检都过不了——句子中间插换行，读者拿到的还是同一堵墙；切段 ∥ 缩短能过机检，但不是处置——机检绿了不等于读者读得动。",
  "同轮修正后复跑；不转台账。",
])

/** 段判据命中行（报面单源——两类命中同形，按 `clazz` 分词）。**不报字符数**：用户 2026-10-26 11:16「不能表述成超长多少个字符，要表述成为文字太长难于阅读」。
 *  `lay` = 报面路径形（§2.3：单根零标签、相对声明根；≥2 根行首项目标签、相对该档自身的根）。 */
export const paragraphHitLine = (lay, h) => `${lay.tag(h.file)}✗ ${h.clazz} ${lay.shown(h.file)}:${h.line}`

/** 花括号组形命中的那一格（抽取面那一支）：报面**同时**点名原 token 与缺的那个展开名——
 *  只报展开名，读者拿到的是一个他档里从没写过的名字；只报原 token，他看不出该改哪一处。其余命中类不带这一格。 */
export const expandedNote = (h) => (typeof h.expanded === "string" && h.expanded !== "" ? `（花括号展开名 \`${h.expanded}\`）` : "")

/** `档缺` 命中行的追加提示（§2.6：缺的那一段 + 盘上同名 + 声明仓两格——候选只提示，不改判态）。
 *  **后缀多解不进这里**：`档缺` 只断言「不存在」，解得到（一处 ∥ 多处）就通、零输出——没有候选可列（§2.8）。 */
export const missingHint = (lay, h) => {
  const seg = typeof h.missing === "string" && h.missing !== "" ? `缺「${h.missing}」` : ""
  const same = Array.isArray(h.sameName) && h.sameName.length > 0 ? `盘上同名：${h.sameName.map((p) => lay.shown(p)).join(" ∥ ")}` : ""
  const parts = [seg, same].filter(Boolean)
  // 已声明而根在机却缺档 ⇒ 点名声明仓与「根在盘」这个事实（两件事：声明无罪、目标真的不在）
  if (typeof h.declaredRepo === "string" && h.declaredRepo !== "") {
    parts.push(`声明仓 ${h.declaredRepo}（声明根 ${lay.shown(h.declaredRoot)}，本机在盘：${h.rootOnDisk === true ? "在" : "不在"}）`)
  }
  // 未声明形的同级目录候选随该形整支退场：未声明同级仓现在是**域外**（不判、不出行），没有提示可给。
  return parts.length > 0 ? `（${parts.join("；")}）` : ""
}

/** 锚命中的类名词（报面标签——类名由引擎定，本档只配显示形；四属同一条判据、同计「锚 N 条」）。 */
const ANCHOR_LABELS = { 档缺: "锚·档缺", 节缺: "锚·节缺", 引缺: "锚·引缺", 环引: "锚·环引" }

/** 锚命中行（报面单源——四命中类同形，按 `clazz` 分词）：`档缺` 追加缺哪一段与盘上同名，
 *  `节缺` 点名目标档，`引缺` 点名引文前 40 字（读者不必回目标档自己找哪一段不对），
 *  `环引` 点名成环的仓链——环是**仓级**事实（没有行号），坐标拿声明档本身与组根（判据单源 = `docs/core/design/PATH-RESOLUTION.md` §2.7「环检」）。
 *  两处消费（`gate` 报面 ∥ 报告态报面）只调本函数；`batch-gate.mjs` 与 `doc-write-gate.mjs` 取的是本函数产出的 `✗` 行，故也吃 `expanded` 这一格。
 *  `lay` = 报面路径形（§2.3）：行首项目标签（≥2 根才打）+ 行内路径相对该档自身的根。 */
export const anchorHitLine = (lay, h) => {
  const label = ANCHOR_LABELS[h.clazz] ?? `锚·${h.clazz}`
  if (h.clazz === "环引") return `${lay.tag(h.file)}✗ ${label} ${lay.shown(h.file)}（${h.root}）publicRepos 成环：${h.chain}`
  const head = `${lay.tag(h.file)}✗ ${label} ${lay.shown(h.file)}:${h.line} \`${h.token}\``
  if (h.clazz === "引缺") return `${head}（引文不在该档内：「${String(h.quote ?? "").slice(0, 40)}…」）`
  if (h.clazz === "节缺") return `${head}（目标 ${lay.shown(h.target)} 无 §${h.section}）`
  return head + expandedNote(h) + missingHint(lay, h)
}

/** 域表读数块的**句形单源**（§2.5 读数口径——块首行 ∥ 无 manifest 根那一行，逐字）：
 *  报面（引擎 `report` 支）∥ 用例断言同取这两条——两处各写一份字面，改一处必漂一处。
 *  **出场条件两支**（与设计 §2.5 ∥ KD-8 逐字同源）：「本次读到域表的根集 ≠ {声明根}」**或任一根无 manifest**
 *  ——单项目锚下根集恰是声明根且该根有 manifest ⇒ 两支皆假 ⇒ 零出（单项目零回归的判据面）。 */
const DOMAIN_TABLE_HEAD = (n, withMan, without) => `域表读数：${n} 根（读 manifest ${withMan} · 无 manifest ${without}）`
const DOMAIN_TABLE_EMPTY = "无 PROJECT-MANIFEST.json —— 域表为空（批档面互引照判 · 同名候选零提示）"

/** 域表读数块（§2.5 读数口径 · 仅 `report` 面 · 不进 `hits`、不动 verdict）：
 *  块首行 = 读了几根哪几态；逐根一行（无 manifest 的根写明空域表——降级可见，不静默）。
 *  `roots` = 本次参与判定的根（升序）；`read` = 同序的对位布尔（该根读到了 manifest）。 */
export function domainTableBlock(roots, read) {
  const withMan = read.filter(Boolean).length
  const out = [DOMAIN_TABLE_HEAD(roots.length, withMan, roots.length - withMan)]
  roots.forEach((root, i) => out.push(`  ${root}${read[i] ? "        读 manifest" : `        ${DOMAIN_TABLE_EMPTY}`}`))
  return out
}

/** 无声明根的 `gate` 返回形（§2.4）：**零命中、零 `✗` 行**——判不了就是一次都没判，不得出成「有的判过了」。
 *  形状与正常返回同键（消费面零改）：调用方读 `report` 首行拿到 `ERROR（无法定根 N 档）`。 */
export function noRootOutcome(items) {
  const report = [`DOC-CHECK GATE: ERROR（无法定根 ${items.length} 档）`, NO_ROOT_HEAD, ...items].join("\n")
  return {
    report,
    hits: { total: 0, anchors: 0, paragraph: 0, lineRefs: 0 },
    anchorHits: [], paragraphHits: [], lineRefHits: [],
    files: [], checkFiles: [], excluded: [], paragraphMax: DOC_CHECK_BUILTINS.paragraphMax,
    skipped: { missing: [], notMarkdown: [] },
    unreadable: [], lineReads: [],
    lineRefs: { body: [], fenced: [], total: 0, unreadable: [] },
    batchFaceRefs: 0,
    cycleReads: [],
    suffixHits: [],
    suffixBuilds: 0,
    projectRoots: [],
    domainTables: [],
    // 豁免桶（§2.7）的返回形同键：无声明根时一条都没有，但消费面读 `.exempted` 不该拿到 undefined。
    exempted: [],
    exemptInvalid: [],
    exemptStale: 0,
  }
}

/** `未核` 列报块（**判不了** = 声明根不在本机）——句形单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「报面」两条行：
 *  `未核 N 条（声明源缺位——列报不入闸）` + 逐声明根一行。**一个声明根一行、条数按声明根计**（不是按指针计）。
 *  两个产出方共用这一形：`trigger:"pointer"` 的逐指针（列档:行与 token）∥ `trigger:"walk"` 的环走查止步。
 *  **不进 `hits`、不动 verdict**——它是「看过了、判不了」在报面上的唯一形（口径单源 = `docs/core/design/PATH-RESOLUTION.md` §2.7）。 */
const UNVERIFIED_HEAD = (n) => `未核 ${n} 条（声明源缺位——列报不入闸）`

export function unverifiedBlock(lay, list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const byRoot = new Map()
  for (const u of list) {
    const key = pathKey(u.declaredRoot)
    let g = byRoot.get(key)
    if (!g) { g = { repo: u.declaredRepo, root: u.declaredRoot, entry: u.declarationEntry, pointers: [], walk: false }; byRoot.set(key, g) }
    if (u.trigger === "walk") g.walk = true
    else g.pointers.push(`${lay.shown(u.file)}:${u.line} \`${u.token}\``)
  }
  const out = [UNVERIFIED_HEAD(byRoot.size)]
  for (const g of byRoot.values()) {
    const triggers = []
    if (g.pointers.length > 0) triggers.push(g.pointers.join(" ∥ "))
    if (g.walk) triggers.push("环走查止步（该根无出边可读）")
    out.push(`未核（声明源缺位）  仓 ${g.repo}：声明根 ${g.root} 本机不存在（声明项 = ${g.entry}）  触发 = ${triggers.join(" ∥ ")}`)
  }
  return out
}

/** 后缀兜底清单的封顶（§2.6 / §2.8 护栏一：按处数降序取前 50 行）。 */
const SUFFIX_LIST_MAX = 50

/** 后缀兜底读数行（固定句形）：写明这一支解析了几处、索引建了几次。
 *  **为什么必须显式**：后缀兜底证明「能定位」，不证明「是你想指的那个」——不标，它就混进绿里（§2.8 护栏一）。
 *  `后缀索引建 N 次` 是读数不是判据：它衡量「建一次」这件事，墙钟不衡量任何事（§2.8）。 */
const SUFFIX_HEAD = (n, builds) => `后缀兜底读数：how="suffix" ${n} 处（后缀兜底命中的指针——能定位，不等于你想指的那一处；后缀索引建 ${builds} 次）`

/** 后缀兜底读数块（仅 `report` 面 · 不进 `hits`、不改 verdict）：
 *  一行读数 + 按 token 去重的清账清单（`token ⇒ 绝对路径（N 处）`）。
 *  界：按处数降序、token 字典序为次键、取前 `SUFFIX_LIST_MAX` 行，末行 `共 N 条 token · M 处`
 *  （N = 去重后的 token 数、M = 处数——两个数都由当次载荷算出，不估）。
 *  位置 = `未核` 列报之后、行号坐标清单块之前（末行仍留给 `结论：…`）。 */
export function suffixBlock(hits, builds) {
  if (!Array.isArray(hits) || hits.length === 0) return []
  const byToken = new Map()
  for (const h of hits) {
    const g = byToken.get(h.token)
    if (g) g.count++
    else byToken.set(h.token, { abs: h.abs, count: 1 })
  }
  const rows = [...byToken.entries()].sort((a, b) => b[1].count - a[1].count || (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))
  const out = [SUFFIX_HEAD(hits.length, builds)]
  for (const [token, g] of rows.slice(0, SUFFIX_LIST_MAX)) out.push(`  ${token} ⇒ ${g.abs.replace(/\\/g, "/")}（${g.count} 处）`)
  out.push(`  共 ${byToken.size} 条 token · ${hits.length} 处`)
  return out
}

/** 批档面留痕行（固定句形 · 单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.29 条目 AC「回执可见面」）：
 *  `report` 面**恒出一行**（0 也出——0 与「没扫」不得同形）；`gate` 面零改。
 *  它不是命中：不进 `hits`、不改 verdict、不动首行与命中行形（不拦、留痕）。 */
export const batchFaceLine = (n) => `批档面互引未判 ${n} 处（批档 ↔ 批档 · 只留痕，不进 hits、不改 verdict）`

/** 豁免块的句形（§2.7 报面 · **两问法同出**，不进 `hits`、不改 verdict）：N = 0 时零出 ⇒ 未登记任何豁免的仓，
 *  两面报面与改动前逐字相等（零回归）。F21 的四项一个不少：哪一条（`kind` + `text`）∥ 哪一份档（`file`）∥
 *  理由（`why`）∥ 复审（`review`）。 */
const EXEMPT_HEAD = (n) => `豁免 ${n} 条（已裁定假阳，不阻断交付）：`
const EXEMPT_INVALID_HEAD = (n) => `豁免登记无效 ${n} 条（字段缺一或形态不对，不生效；命中照拦）：`
export const EXEMPT_STALE = (n) => `登记未命中 ${n} 条（原文已变或已不在判集，复核后删）`

/** 已裁定条目一行：行首项目标签（≥2 根才打）+ 判据类 + 档与行 + 命中文本 + 理由 + 复审。 */
export function exemptBlock(lay, list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const out = [EXEMPT_HEAD(list.length)]
  for (const e of list) {
    const at = typeof e.line === "number" ? `:${e.line}` : ""
    out.push(`  ${lay.tag(e.file)}✗ ${e.kind} ${lay.shown(e.file)}${at} ${e.exemption.text} —— ${e.exemption.why}（复审 ${e.exemption.review}）`)
  }
  return out
}

/** 无效登记一行：点名是哪一份 manifest 的第几项、差在哪一条——「登记了却不生效」必须看得见，否则作者以为已经放过。 */
export function invalidExemptionBlock(lay, list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const out = [EXEMPT_INVALID_HEAD(list.length)]
  for (const v of list) {
    const at = lay.shown(resolve(v.root, "PROJECT-MANIFEST.json"))
    out.push(`  ${lay.tag(resolve(v.root, "PROJECT-MANIFEST.json"))}${at} · index.docCheckExemptions[${v.index}] —— ${v.problem}`)
  }
  return out
}

/** 扩展名清单读数（§2.6：「报面读数一行，只在该仓写了这一项时出」· 仅 `report` 面）：不进 `hits`、不改 verdict；
 *  没写这一项的仓零出 ⇒ 单项目零回归面不破。N = 该仓写了几项（按字面数；被取形剔掉的不逐条点名）。 */
export const extListLine = (n) => `扩展名清单：缺省 + 本仓 ${n} 项`

/** 「读不到」清单行的句头（报面单源 · 两问法同形）：点名哪几档未判——一个不点名的「没读成」与「干净」在报面上无法区分。 */
export const unreadableHead = (n) => `读不到 ${n} 档（未判，不得读作已检）：`

/** gate 报面（固定句形——§3.20「报面（固定句形 · 交付门 gate）」）：首行 verdict = 唯一机判串。
 *  §2.3：verdict 只有一条；单根清单报面逐字不变（零回归的判据面）；≥2 根时范围行追加根清单、
 *  命中 ∥ 跳过 ∥ 读不到行带项目标签。 */
export function gateReport({ lay, docsSource, checkFiles, skipped, excluded, unreadable, anchors, paragraphs, lineRefs, cycleReads = [], exempted = [], exemptInvalid = [], exemptStale = 0 }) {
  // 第三条判据的**判集 = 正文面**（围栏块外）；围栏内那部分只进下面那行读数（口径 = §3.23「判面 = 正文面」块）。
  const bodyRefs = lineRefs.body.length
  const fencedRefs = lineRefs.fenced.length
  const total = anchors.hits.length + paragraphs.length + bodyRefs
  const src = docsSource === "session" ? "本会话写过的文档" : "显式 docs"
  const hasSkips = skipped.missing.length > 0 || skipped.notMarkdown.length > 0
  // 免检全关（§2.6 KD-Ex4 / AC-Ex6）：判集被排除面清空、且没有别的未判档 ⇒ 这是「免检放行」，不是「判了 0 档」。
  // 算一次、三处读它（首行 ∥ `范围` 行 0 档括注 ∥ 空范围说明行守卫）；`report` 面末行删支后不吃它。
  const exemptedAll = checkFiles.length === 0 && excluded.length > 0 && !hasSkips
  // 首行：锚与段分列（用户 11:16：段的问题叫「文字太长，难于阅读」，不是「命中 N 条」也不是字符数）
  const verdict = () => {
    // 读不到优先：判不出就不产 PASS ∥ REFUSED（既有 ERROR 位——fail-closed，没 PASS 就是没过）
    if (unreadable.length) return `DOC-CHECK GATE: ERROR（读不到 ${unreadable.length} 档）`
    // 判了 0 档 ≠ 全清：`PASS` 是「这些档都干净」的断言，空集上出 `PASS` 等于给「什么都没判」发一张「判过了」的通行证。
    // **免检全关不属此列**（`exemptedAll`）：那几档按 manifest 声明不进判集、等于通过，判集空是声明出来的 ⇒ 照出 `PASS`。
    // 四个入口（显式空清单 ∥ 本会话零 `.md` 触达 ∥ 路径全不在盘 ∥ 全非 `.md`）同一句回；「为什么空」由下方
    // 「范围为空：…」四句分流与两个跳过桶头照说。词位用既有 `ERROR`（判不出），不造新动词——消费面按首行前缀判
    // （口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「空范围不判 PASS」条；排除面例外 = `docs/core/design/DOC-CHECK.md` §2.6）。
    if (total === 0) return checkFiles.length || exemptedAll ? "DOC-CHECK GATE: PASS" : "DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）"
    const parts = []
    if (anchors.hits.length) parts.push(`锚 ${anchors.hits.length} 条`)
    // 段与行分列——两类命中不得合并（提示词面一行 = 一个块，属「行太长」，不是「一段文字太长」）
    const paraCount = paragraphs.filter((h) => h.clazz === DOC_CLASS.para).length
    const lineCount = paragraphs.filter((h) => h.clazz === DOC_CLASS.line).length
    if (paraCount) parts.push(`${paraCount} 段${DOC_CLASS.para}`)
    if (lineCount) parts.push(`${lineCount} ${DOC_CLASS.line}`)
    if (bodyRefs) parts.push(`${LINE_REF_CLASS} ${bodyRefs} 处`)
    return `DOC-CHECK GATE: REFUSED（${parts.join(" · ")}）`
  }
  const out = [
    verdict(),
    "文档纪律机检（交付门 · gate）",
    checkFiles.length
      ? `范围：${src} ${checkFiles.length} 档${rootsSuffix(lay)}`
      : exemptedAll
        ? `范围：${src} —— **0 档受检**（清单 ${excluded.length} 档全落在 manifest 排除面内）`
        : `范围：${src} —— **0 档受检**（空清单：本次没有判任何档，不得读作「已检」）`,
    "判据：逐段检查——" + DOC_CLASS.para,
  ]
  out.push(...bucketLines(lay, skipped.missing, (n) => `跳过 ${n} 档（已不在盘，未检）：`))
  out.push(...bucketLines(lay, skipped.notMarkdown, (n) => `跳过 ${n} 档（非 markdown 档，未检）：`))
  // 排除桶（§2.6）：与两个跳过桶同一层——它属于「未判」族（可见、不静默丢掉），不是量。
  // N = 0 时 `bucketLines` 对空清单返回空数组（不出行）⇒ 未声明该键的 manifest 上报面与改动前逐字相等。
  out.push(...bucketLines(lay, excluded, (n) => `排除 ${n} 档（manifest 排除面命中，未判）：`))
  out.push(...bucketLines(lay, unreadable, unreadableHead)) // 读面：与跳过行分开——「没读成」不是「不在盘」
  // `未核` 列报（判不了类——不进 `total`、不改 verdict）：位置 = 命中区之前（口径 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「报面」），
  // 末行仍留给结论 / 处置块。
  out.push(...unverifiedBlock(lay, anchors.unverified))
  if (cycleReads.length) out.push(CYCLE_READ_LINE(cycleReads.length))
  if (checkFiles.length === 0 && !exemptedAll) {
    // 空范围不静默当通过（K6）——照实说明 + 给出补充通道（两侧都不得读成「已检」）。
    // 措辞按「有没有跳过行」分流：无跳过行时不得写「见上方跳过行」。
    // 免检全关（`exemptedAll`）不进这一块：那几档是声明出来的免检、不是「空范围」⇒ 零说明行（§2.6 AC-Ex6）；
    // 混态（另有不在盘 ∥ 非 `.md` 的档）照进这一块，由 `hasSkips` 那两句点名——免检不放宽「清单与盘不符」。
    out.push(docsSource === "session"
      ? (hasSkips
        ? "范围为空：本会话触达的档均不可判（见上方跳过行）——若确认改过 ⇒ 显式传 docs"
        : "范围为空：本会话没有写过 .md 档——若确认改过 ⇒ 显式传 docs")
      : (hasSkips
        ? "范围为空：显式 docs 里没有可判档——见上方跳过行"
        : "范围为空：显式 docs 是空清单——列出要判的档后复跑"))
  } else if (total === 0) {
    // 正文面零命中但围栏内有未判坐标 ⇒ 判 `PASS` 的同时把那一行读数照出（读数不是判据，但不能让读者以为「围栏那片没有」）。
    if (fencedRefs) out.push(fencedRefNote(fencedRefs))
    out.push(unreadable.length
      ? `结论：0 条命中（但 ${unreadable.length} 档未判——见上方「读不到」行，不得读作已检）`
      : `结论：0 段有问题（${checkFiles.length} 档全清）`)
  } else {
    for (const h of anchors.hits) out.push(anchorHitLine(lay, h))
    for (const w of paragraphs) out.push(paragraphHitLine(lay, w))
    for (const h of lineRefs.body) out.push(lineRefHitLine(lay, h))
    // 围栏内：只出计数行、不出逐处 `✗` 行——那处已不入判，摆进命中面会叫读者去改证据（改证据 = 篡改原文）。
    if (fencedRefs) out.push(fencedRefNote(fencedRefs))
    // 处置块只跟「段」命中走：仅有行太长时不得叫人对段落重写；字面单源 = `PARA_DISPOSE`（三处消费面同一份）
    if (paragraphs.some((h) => h.clazz === DOC_CLASS.para)) out.push(...PARA_DISPOSE)
  }
  // 豁免块（§2.7 · **两问法同出**）：位置 = 命中区之后（处置块之后）；不进 `hits`、不改 verdict。
  out.push(...exemptBlock(lay, exempted))
  out.push(...invalidExemptionBlock(lay, exemptInvalid))
  if (exemptStale > 0) out.push(EXEMPT_STALE(exemptStale))
  return out.join("\n")
}
