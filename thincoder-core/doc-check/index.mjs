/**
 * doc-check/index.mjs — 文档纪律机检 · 引擎入口（三条判据 + 一条读数面 + 报面行）。
 *
 * 判据三条（起步 · 闭集——口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20 条目 S）：
 *   ① 锚（档缺 / 节缺 / 引缺）——实现 = `./anchors.mjs`；② 段判据（文字太长，难于阅读 ∥ 行太长）——口径 = §3.18 条目 Q，实现 = `./paragraph.mjs`；
 *   ③ 行号坐标——见下面「判据三条」段（本档头注不重复数一次）。判据数 = **三**，`lines` 读数不算第四条。
 * 判据参数 = **工具内置常量** `DOC_CHECK_BUILTINS`：不读任何项目的声明面，因而没有「缺参数 ⇒ 拒跑」这一层，
 *   也没有常量校验面——改判据 = 改代码、走评审。
 * 判定范围 = **调用方传入的文件清单**（判定范围 = 解析范围 = 传入的那几档；无目录遍历、无全域兜底）：
 *   不给清单 ⇒ 明确报错要求显式清单——判了本轮没碰过的档，别轮的存量问题会记到本轮头上。
 * 两种问法（§3.20「工具形」——同一条判据）：
 *   `report`（缺省）= 报告态——**零门禁 / 零退出码 / 零阻断**，输出不得被读作拒执行的理由（用户令 > 机检）；
 *   清单里不可判档（不在盘 ∥ 非 .md）⇒ 报错点名、整次零判定；
 *   `gate` = 交付时点的裁定——首行给机器可判 verdict；不可判档给跳过行（可见，不静默丢掉）。
 *   强制面住交付协议 + 批次档 §6 前置，工具本体不阻断任何动作。
 * 第三条判据 = **行号坐标**（`./line-refs.mjs` 采集 · 口径 = `docs/core/design/DOC-DISCIPLINE.md` §3.23 条目 W）：
 *   一个档名之后出现的 `:` 加数字即命中。**采集一次、两个问法各读一份**——`report` 面据此出清账清单（不产 verdict），
 *   `gate` 面取同一份采集的**正文面**计入 `hits.lineRefs`（围栏内只出一行读数，不入判——口径 = §3.23「判面 = 正文面」块）。
 *   两条既有判据的命中集与判决词一字不改。
 * 读面（读不到 ≠ 干净）：三条判据各带 `unreadable` 清单，本档**并集上报**——`report` 面在清单块之前单列一行点名，
 *   `gate` 面首行判 `ERROR`（不产 `PASS` 也不产 `REFUSED`）。口径 = 同档 §3.20「读面」块：
 *   静默跳过会让「没读成」与「干净」在报面上同形，而本判据已是交付门——那样一个读不到的坐标会让门判 `PASS`。
 * 读数面（**不是判据** · 参数 `lines`，仅报告态）：逐档出内容行数 + 尺寸档位标记。口径 = 同档 §3.20「行数读数」块——
 *   读数不进 `hits`、不进 verdict、不动跳过行与读面行；`gate` 面带 `lines` 直接抛错（读数不是判据，门面不接）。
 *   量法的家 = 本档 `countContentLines`（全仓唯一实现）；`scripts/doc-check-linecounts.mjs` 只是再出口缝。
 * 批档面留痕行（`批档面互引未判 N 处`——读数，不是判据）：口径单源 = 同档 §3.29 条目 AC；只在 `report` 面出，
 *   不进 `hits`、不改 verdict，`gate` 面零改（详情住 `./anchors.mjs` 的面判谓词，本档只把数摆上报面）。
 * 判域（**按档定根** · 判据句单源 = `docs/core/design/DOC-CHECK.md` §2.1–§2.4；需求条 = `docs/core/requirements/DOC-CHECK.md` 的 F17 ∥ AC-15）：
 *   每个档用**自己的落点**定根——`rootOf(abs) = owningProject(abs, parse(abs).root) ?? 声明根`；界 = 该档所在盘的盘根
 *   （界填声明根会把跨项目的档先判出界、再落回声明根，那正是本批要修的 `档缺`）。
 *   `root` 入参 = **声明根**（调用方给出的坐标系），不再是整批共用的坐标系；**缺声明根 ⇒ 整清单不判、显式 `ERROR`**
 *   （政策：半份判定在报面上分不出「这档干净」与「这档没判」），「声明根自身是不是项目」不参与判断。
 *   判定内容（锚 ∥ 段长 ∥ 行号坐标 ∥ 引文）一字不动——改的只是「拿哪个根去解析」：按根分组、逐组调既有 `checkAnchors(root_i, …)`。
 */
import { readFileSync, statSync } from "node:fs"
import { basename, isAbsolute, parse, relative, resolve } from "node:path"
import { checkParagraphs, DOC_CLASS } from "./paragraph.mjs"
import { checkAnchors } from "./anchors.mjs"
import { collectLineRefs, lineRefsBlock } from "./line-refs.mjs"
// 跨仓引用一行读数的文案骨架（单源 = 统一解析层；本档只把它摆进报面）。
import { crossRepoNote } from "../path-resolve.mjs"
// 域表的一次读（§2.5 KD-7）∥ 取根判据本体（转口单源 = `thincoder-core/manifest.mjs`；判据式见下面 `rootOf`）。
import { readManifest, owningProject } from "../manifest.mjs"

/** 判据参数（内置常量 · 冻结）：阈值 300 字符（一段 ∥ 一行同值——§3.18 ④）；两项空列表 = 区带类 / 豁免类默认值且恒空
 *  ——豁免谓词（表行 / 围栏 / 列表项 / 引文）住代码，没有「登记后放过」的写入口（空列表 ≠ 可登记豁免）。
 *  后两键 = 文件档尺寸档位的**数值单源**（§3.10 的读数口径行指向这里；判据是**严格大于**）：
 *  `fileSoftMax` 越线 = 主动审视（报面标「软线」）∥ `fileHardMax` 越线 = 必须拆（标「硬限」）。
 *  它们只服务 `lines` 读数面的档位标记——`.md` 零尺寸档位义务（§3.7 条目 H），出数不标。 */
export const DOC_CHECK_BUILTINS = Object.freeze({
  paragraphMax: 300,
  lineMax: 300,
  paragraphExemptZones: Object.freeze([]),
  exemptions: Object.freeze([]),
  fileSoftMax: 500,
  fileHardMax: 800,
})

/** 命中类名单源再出口（`./paragraph.mjs` 的 `DOC_CLASS`）：`agent-tools/batch-gate.mjs` 要判「处置块何时出」，
 *  而它按判据链纪律只 import 本档（引擎 import 只指向 `../doc-check/index.mjs`）⇒ 类名由本档再出口，
 *  消费面不抄字面类名——抄一次就是「改报面忘改过滤」那类字面漂移（`paragraph.mjs` 头注记着 2026-10-26 实发过一次）。 */
export { DOC_CLASS }

/** 第三条判据命中的类名（`hits` 的第三类）：报面标签 ∥ `hits.lineRefs` ∥ 批档门的类属切分同取这一字面。
 *  按**处**计（与锚的「条」区分），命中行形 = `✗ 行号坐标 <源档>:<行> <形别> <原文片段>`。
 *  **判集 = 正文面**（围栏块外）；围栏内那部分只作读数（`report` 清单的 `合计` 含它）——**合计是读数，不是判集**。 */
export const LINE_REF_CLASS = "行号坐标"

/** 行号坐标命中行（报面单源）：档 + 行定位 + 形别（①②③ 是读数分类，不是判据分级）+ 原文片段 ≤ 40 字
 *  （读者不打开源档就能判「这是引用还是举例」）。**只出正文面**（围栏内不入判、只出一行读数），故不带围栏标。
 *  `lay` = 报面路径形（§2.3）：行首项目标签（≥2 根才打）+ 行内路径相对该档自身的根。 */
const lineRefHitLine = (lay, h) => `${lay.tag(h.file)}✗ ${LINE_REF_CLASS} ${lay.shown(h.file)}:${h.line} ${h.form} ${h.snippet}`

/** 围栏内读数行（固定句形 · 单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.23「gate 判据」块的读数句）：
 *  围栏里的是逐字证据（日志 ∥ 拒文 ∥ diff ∥ 前后对照），坐标钉的是那份原文里的位置——不是指向今天盘面的指针，
 *  所以不入判；留这一行是为了「围栏内那片存量没被忘掉」与「闸那边也不改它」两件事都看得见。N = 0 时不出。 */
const fencedRefNote = (n) => `围栏内行号坐标 ${n} 处——快照里的位置，不是指针；不入判（report 清单照列）`

/** 段命中的处置块（五行 · 逐字单源）：口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「报面（固定句形 · 交付门 gate）」尾行。
 *  三处消费面（本档 `gateReport` ∥ `agent-tools/batch-gate.mjs` 的报面组装与拒串 ∥ `scripts/doc-check.mjs` 的段报告段）
 *  只 import 本数组、零字面复制——同一句话抄三遍，改一处漏两处是必然。
 *  **为什么住本档**：报面尾行本来就住这里，`batch-gate.mjs` 已 import 本档 ⇒ 字面随报面同源，不新增第三个 import 面。
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

/** 相对路径显示形（正斜杠——跨平台同形）。 */
const rel = (root, p) => relative(root, p).replace(/\\/g, "/")

/** 平台路径键（Windows 大小写不敏感——只用于清单去重，非判据面）。 */
const pathKey = (p) => (process.platform === "win32" ? p.toLowerCase() : p)

/** 声明根（§2.4）：`root` 入参 = **调用方给出的坐标系**。缺省 ∥ 空串 ∥ 非字符串 ⇒ `null`。
 *  **「声明根自身是不是项目」不参与判断**——普通目录、多项目工作区都能当声明根，照它判。
 *  空串判缺省是对今日的收紧：今日 `resolve("")` 悄悄落进程 cwd，那正是本批要禁的「猜一个根」。 */
function declaredRoot(root) {
  if (typeof root !== "string" || root.trim() === "") return null
  return resolve(root)
}

/** 取根式（§2.1 · 判据本体 = `owningProject`，全仓单源）：该档落点的项目根；祖先链至盘根无 manifest ⇒ 声明根。
 *  **界必须是盘根**：界填声明根时，跨项目的档在第一步就判出界、再落回声明根——那正是本批要修的 `档缺`。 */
function rootOf(abs, declaredBase) {
  return owningProject(abs, parse(abs).root) ?? declaredBase
}

/** 按根分组（§2.2）：可判集 → `{ root, files }[]`（首现序）。每组调一次既有 `checkAnchors`——判法内部一字不动。 */
function perRootGroups(files, declaredBase) {
  const byRoot = new Map()
  for (const abs of files) {
    const root = rootOf(abs, declaredBase)
    const key = pathKey(root)
    const g = byRoot.get(key)
    if (g) g.files.push(abs)
    else byRoot.set(key, { root, files: [abs] })
  }
  return [...byRoot.values()]
}

/** 并组的锚结果（§2.2）：命中按**文件稳定序**（清单位次）再按行号合并。
 *  单组时不重排（次序就是逐档一次的既有次序）；多组时这一步让跨项目的命中按清单序读，而不是按组的首现序读。 */
function mergeAnchors(perGroup, fileOrder) {
  const hits = []
  const crossRepo = []
  const unreadable = []
  let batchRefs = 0
  for (const { res } of perGroup) {
    hits.push(...res.hits)
    crossRepo.push(...(res.crossRepo ?? []))
    for (const u of res.unreadable ?? []) if (!unreadable.includes(u)) unreadable.push(u)
    batchRefs += res.batchRefs ?? 0
  }
  if (perGroup.length > 1) {
    const at = (h) => (fileOrder.has(h.file) ? fileOrder.get(h.file) : Number.MAX_SAFE_INTEGER)
    hits.sort((a, b) => at(a) - at(b) || a.line - b.line)
    crossRepo.sort((a, b) => at(a) - at(b) || a.line - b.line)
  }
  return { hits, crossRepo, unreadable, batchRefs }
}

/** 多根的项目名（§2.3）：**本次调用里能唯一定位该根的最短路径后缀**（段间 `/`）。
 *  末尾一段在各根之间不重复 ⇒ 就是根目录名；重名（两个项目各有一个 `web`）⇒ 往前多取一段，直到各根互不相同。
 *  **判据面 = 本次调用的根集**，不是全盘路径：标签的职责是让读者在两账同时出现时分得清是谁的账。
 *  兜底支（整串路径仍撞——根集已按 `pathKey` 去重，理论上进不来）⇒ 用归一后的整串路径。 */
function rootLabels(roots) {
  const segsOf = (r) => r.replace(/\\/g, "/").split("/").filter((s) => s !== "" && !/^[A-Za-z]:$/.test(s))
  const lists = roots.map(segsOf)
  const maxDepth = Math.max(1, ...lists.map((s) => s.length))
  for (let d = 1; d <= maxDepth; d++) {
    const labels = lists.map((s) => s.slice(Math.max(0, s.length - d)).join("/"))
    if (labels.some((l) => l === "")) continue
    const keys = labels.map(pathKey)
    if (new Set(keys).size === keys.length) return new Map(roots.map((r, i) => [pathKey(r), labels[i]]))
  }
  return new Map(roots.map((r) => [pathKey(r), r.replace(/\\/g, "/")]))
}

/** 报面路径形（§2.3）：单根 = 相对声明根、零标签（与今日逐字同——零回归的判据面）；
 *  ≥2 根 = 行首 `[<项目名>]`（项目名 = `rootLabels` 的最短唯一定位后缀）、行内路径相对**该档自身的根**。
 *  为什么多根要相对自身根：统一相对声明根会写出 `../<别的项目>/…`，读回执的人分不清这是谁的账。 */
function reportLayout(declaredBase, projectRoots) {
  const multi = projectRoots.length >= 2
  const memo = new Map()
  const rootFor = (abs) => {
    const k = pathKey(abs)
    let r = memo.get(k)
    if (r === undefined) { r = rootOf(abs, declaredBase); memo.set(k, r) }
    return r
  }
  const labels = rootLabels(projectRoots)
  // 根集之外（跳过 ∥ 读不到的档，其落点没进 `projectRoots`）⇒ 退回根目录名：唯一性的判据面是根集，
  // 在集外没有可谈的唯一性；报面那里只需要一个可读的项目名，拿绝对路径填括号是噪声。
  const name = (root) => labels.get(pathKey(root)) ?? basename(root)
  return {
    multi, rootFor, roots: projectRoots, name,
    /** 行内路径（单根 = 相对声明根；多根 = 相对该档自身的根）。 */
    shown: (abs) => rel(multi ? rootFor(abs) : declaredBase, abs),
    /** 行首项目标签（≥2 根才打）：项目名 = 最短唯一定位后缀。 */
    tag: (abs) => (multi ? `[${name(rootFor(abs))}] ` : ""),
  }
}

/** 范围行尾的根清单（§2.3「≥2 根：范围行追加根清单」）；单根 = 空串（那一行与今日逐字同）。 */
const rootsSuffix = (lay) => (lay.multi ? `（根 ${lay.roots.length} 个：${lay.roots.join(" ∥ ")}）` : "")

/** 一类清单行（跳过 ∥ 读不到）的报面：单根一行到底、零标签；≥2 根按根拆行、行首项目标签。
 *  多根时一行一根——一行里挂两个项目标签，读者读不出哪个路径属哪个项目。 */
function bucketLines(lay, absList, label) {
  if (absList.length === 0) return []
  if (!lay.multi) return [`${label(absList.length)}${absList.map((p) => lay.shown(p)).join(" ∥ ")}`]
  const order = []
  const byRoot = new Map()
  for (const p of absList) {
    const root = lay.rootFor(p)
    const k = pathKey(root)
    if (!byRoot.has(k)) { byRoot.set(k, { root, list: [] }); order.push(k) }
    byRoot.get(k).list.push(p)
  }
  return order.map((k) => {
    const { root, list } = byRoot.get(k)
    return `[${lay.name(root)}] ${label(list.length)}${list.map((p) => lay.shown(p)).join(" ∥ ")}`
  })
}

/** 不可判档的两因（闭集 · 判序 = 存在性 → 类型）：不在盘 ∥ 非 markdown 档（目录归后因）。 */
function undecidableReason(abs) {
  let st
  try { st = statSync(abs) } catch { return "not on disk" }
  if (!st.isFile() || !abs.toLowerCase().endsWith(".md")) return "not a markdown document"
  return null
}

/** 清单条目的形状（闭集：非字符串 ∥ 空白）= 调用方错误，两种问法同拒——静默丢掉一条就是不静默地收窄范围。
 *  它判的是**清单本身**，与声明根无关 ⇒ 排在定根之前（根缺不缺都有这一拒，报错时说的仍是清单的毛病）。 */
function assertEntryShapes(docs) {
  const bad = []
  docs.forEach((d, i) => { if (typeof d !== "string" || d.trim() === "") bad.push(i) })
  if (bad.length) {
    throw new Error(`doc_check: \`docs\` entries ${bad.map((i) => `[${i}]`).join(", ")} are not paths — every entry must be a non-empty string; no document was judged.`)
  }
}

/** 清单 → 可判集（去重保序）+ 不可判档两类（`missing` ∥ `notMarkdown`）。条目的形状由 `assertEntryShapes` 先拒。 */
function resolveRange(base, docs) {
  const seen = new Set()
  const check = []
  const undecidable = []
  const missing = []
  const notMarkdown = []
  docs.forEach((d) => {
    const abs = resolve(base, d)
    const key = pathKey(abs)
    const reason = undecidableReason(abs)
    if (reason === null) { if (!seen.has(key)) { seen.add(key); check.push(abs) } return }
    undecidable.push({ abs, reason })
    if (reason === "not on disk") missing.push(abs)
    else notMarkdown.push(abs)
  })
  return { check: check.sort(), undecidable, missing, notMarkdown }
}

/** 无声明根那一行的头句（§2.4 逐字）——政策，不是公式的推论。 */
const NO_ROOT_HEAD = "本次没有声明根：声明根是这条判据的调用前置，缺它整清单不判（不出半份判定）"

/** 域表读数块的**句形单源**（§2.5 读数口径——块首行 ∥ 无 manifest 根那一行，逐字）：
 *  报面（本档 `report` 支）∥ 用例断言（本批单元测试档）同取这两条——两处各写一份字面，改一处必漂一处。
 *  **出场条件两支**（与设计 §2.5 ∥ KD-8 逐字同源）：「本次读到域表的根集 ≠ {声明根}」**或任一根无 manifest**
 *  ——单项目锚下根集恰是声明根且该根有 manifest ⇒ 两支皆假 ⇒ 零出（单项目零回归的判据面）。 */
const DOMAIN_TABLE_HEAD = (n, withMan, without) => `域表读数：${n} 根（读 manifest ${withMan} · 无 manifest ${without}）`
const DOMAIN_TABLE_EMPTY = "无 PROJECT-MANIFEST.json —— 域表为空（批档面互引照判 · 同名候选零提示）"

/** 域表读数块（§2.5 读数口径 · 仅 `report` 面 · 不进 `hits`、不动 verdict）：
 *  块首行 = 读了几根哪几态；逐根一行（无 manifest 的根写明空域表——降级可见，不静默）。
 *  `roots` = 本次参与判定的根（升序）；`read` = 同序的对位布尔（该根读到了 manifest）。 */
function domainTableBlock(roots, read) {
  const withMan = read.filter(Boolean).length
  const out = [DOMAIN_TABLE_HEAD(roots.length, withMan, roots.length - withMan)]
  roots.forEach((root, i) => out.push(`  ${root}${read[i] ? "        读 manifest" : `        ${DOMAIN_TABLE_EMPTY}`}`))
  return out
}

/** 无声明根的**逐档点名**（§2.4 · 三式逐字照抄，不合并成一句）：
 *  ① 绝对路径条目、祖先链有 manifest ⇒ 说「本档本可归 `<该根>`」；
 *  ② 绝对路径条目、祖先链至盘根无 manifest ⇒ 说「祖先链至盘根无 PROJECT-MANIFEST.json」；
 *  ③ 相对路径条目 ⇒ 说「无根无法定位」。
 *  **报文不得断言盘上为假的事**：只有祖先链**真的**没有 manifest 才走第二式——本可定根的档走第一式。
 *  `<档>` 一律按**条目原文**显示：无声明根就没有可相对的根，不套 `rel(…)`。N = 去重后的档条目数。 */
function noRootItems(docs) {
  const seen = new Set()
  const items = []
  for (const d of docs) {
    const abs = isAbsolute(d)
    const key = abs ? pathKey(resolve(d)) : `relative\u0000${d}`
    if (seen.has(key)) continue
    seen.add(key)
    if (!abs) { items.push(`${d} —— 原因：本次没有声明根，整清单不判——本档是相对路径条目，无根无法定位`); continue }
    const owner = owningProject(resolve(d), parse(resolve(d)).root)
    items.push(owner === null
      ? `${d} —— 原因：祖先链至盘根无 PROJECT-MANIFEST.json，且本次没有声明根`
      : `${d} —— 原因：本次没有声明根，整清单不判——本档本可归 ${owner}`)
  }
  return items
}

/** 无声明根的 `gate` 返回形（§2.4）：**零命中、零 `✗` 行**——判不了就是一次都没判，不得出成「有的判过了」。
 *  形状与正常返回同键（消费面零改）：调用方读 `report` 首行拿到 `ERROR（无法定根 N 档）`。 */
function noRootOutcome(items) {
  const report = [`DOC-CHECK GATE: ERROR（无法定根 ${items.length} 档）`, NO_ROOT_HEAD, ...items].join("\n")
  return {
    report,
    hits: { total: 0, anchors: 0, paragraph: 0, lineRefs: 0 },
    anchorHits: [], paragraphHits: [], lineRefHits: [],
    files: [], checkFiles: [], paragraphMax: DOC_CHECK_BUILTINS.paragraphMax,
    skipped: { missing: [], notMarkdown: [] },
    unreadable: [], lineReads: [],
    lineRefs: { body: [], fenced: [], total: 0, unreadable: [] },
    batchFaceRefs: 0,
    projectRoots: [],
    domainTables: [],
  }
}

/**
 * 内容行数（**全仓唯一实现** · 量法的家）：口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「行数读数」块。
 * 两个消费面同取这一个函数——`lines` 读数面（本档）∥ `scripts/doc-check-linecounts.mjs` 的再出口（零函数体）。
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

/** 档位分级（严格大于 · 阈值单源 = `DOC_CHECK_BUILTINS`）：越硬限 ⇒ `hard` ∥ 越软线 ⇒ `soft` ∥ 未越线 ∥ 非源档 ⇒ `null`。 */
function sizeTier(n, abs) {
  const lower = abs.toLowerCase()
  if (!SIZE_TIER_EXTS.some((e) => lower.endsWith(e))) return null
  if (n > DOC_CHECK_BUILTINS.fileHardMax) return "hard"
  if (n > DOC_CHECK_BUILTINS.fileSoftMax) return "soft"
  return null
}

/** 档位标记字面（单源 · 字面随常量取值）：读面行尾追加，未越线不追加。 */
function sizeTierMark(tier) {
  if (tier === "hard") return `越 ${DOC_CHECK_BUILTINS.fileHardMax} 硬限（必须拆）`
  if (tier === "soft") return `越 ${DOC_CHECK_BUILTINS.fileSoftMax} 软线（主动审视）`
  return ""
}

/**
 * `lines` 清单 → 逐档读数（去重后按路径升序，同 `resolveRange` 的既有形）。
 * 失败面 = fail-closed（业务门纪律：该失败就失败）——六类各抛一条，**整次零读数**，不静默丢一条：
 *   非数组 ∥ 空清单（含全空白元素——清单不指任何档）∥ 条目非字符串（点名下标）∥
 *   条目不在盘 ∥ 在盘但不是档 ∥ 读不到（均点名该档）。抛错串首 `doc_check: `，调用方见 `Error: …` 且 `ok: false`。
 * @returns {{file:string, lines:number, tier:'hard'|'soft'|null}[]} `file` = 绝对路径（与 `anchorHits` 同形）
 */
function resolveLineReads(base, lines) {
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
function lineReadBlock(base, reads) {
  const hard = reads.filter((r) => r.tier === "hard").length
  const soft = reads.filter((r) => r.tier === "soft").length
  const out = ["行数读数（量法 = countContentLines · 档位标记只给源 / 单元测试档；.md 档只出数不标）"]
  for (const r of reads) out.push(`  ${r.lines}  ${rel(base, r.file)}${r.tier ? `  · ${sizeTierMark(r.tier)}` : ""}`)
  out.push(`合计 ${reads.length} 档（越硬限 ${hard} · 越软线 ${soft} · 未越线 ${reads.length - hard - soft}）`)
  return out
}

/** 段判据命中行（报面单源——两类命中同形，按 `clazz` 分词）。**不报字符数**：用户 2026-10-26 11:16「不能表述成超长多少个字符，要表述成为文字太长难于阅读」。
 *  `lay` = 报面路径形（§2.3：单根零标签、相对声明根；≥2 根行首项目标签、相对该档自身的根）。 */
const paragraphHitLine = (lay, h) => `${lay.tag(h.file)}✗ ${h.clazz} ${lay.shown(h.file)}:${h.line}`

/** 跨仓引用读数行（零命中、只入回执——文案骨架单源 = `path-resolve.mjs` 的 `crossRepoNote`）。 */
const crossRepoLine = (h) => `跨仓引用：${crossRepoNote(h.token, h)}`

/** `档缺` 命中行的追加提示（§2.6：缺的那一段 + 盘上同名——候选只提示，不改判态）。 */
const missingHint = (lay, h) => {
  const seg = typeof h.missing === "string" && h.missing !== "" ? `缺「${h.missing}」` : ""
  const same = Array.isArray(h.sameName) && h.sameName.length > 0 ? `盘上同名：${h.sameName.map((p) => lay.shown(p)).join(" ∥ ")}` : ""
  const parts = [seg, same].filter(Boolean)
  return parts.length > 0 ? `（${parts.join("；")}）` : ""
}

/** 锚命中的类名词（报面标签——类名由引擎定，本档只配显示形；三属同一条判据、同计「锚 N 条」）。 */
const ANCHOR_LABELS = { 档缺: "锚·档缺", 节缺: "锚·节缺", 引缺: "锚·引缺" }

/** 锚命中行（报面单源——三命中类同形，按 `clazz` 分词）：`档缺` 追加缺哪一段与盘上同名，
 *  `节缺` 点名目标档，`引缺` 点名引文前 40 字（读者不必回目标档自己找哪一段不对）。
 *  两处消费（`gate` 报面 ∥ 报告态报面）只调本函数——各写一份三元式改一处必漏一处。
 *  `lay` = 报面路径形（§2.3）：行首项目标签（≥2 根才打）+ 行内路径相对该档自身的根。 */
const anchorHitLine = (lay, h) => {
  const head = `${lay.tag(h.file)}✗ ${ANCHOR_LABELS[h.clazz] ?? `锚·${h.clazz}`} ${lay.shown(h.file)}:${h.line} \`${h.token}\``
  if (h.clazz === "引缺") return `${head}（引文不在该档内：「${String(h.quote ?? "").slice(0, 40)}…」）`
  if (h.clazz === "节缺") return `${head}（目标 ${lay.shown(h.target)} 无 §${h.section}）`
  return head + missingHint(lay, h)
}

/** 批档面留痕行（固定句形 · 单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.29 条目 AC「回执可见面」）：
 *  `report` 面**恒出一行**（0 也出——0 与「没扫」不得同形）；`gate` 面零改。
 *  它不是命中：不进 `hits`、不改 verdict、不动首行与命中行形（不拦、留痕）。 */
const batchFaceLine = (n) => `批档面互引未判 ${n} 处（批档 ↔ 批档 · 只留痕，不进 hits、不改 verdict）`

/** 「读不到」清单行的句头（报面单源 · 两问法同形）：点名哪几档未判——一个不点名的「没读成」与「干净」在报面上无法区分。 */
const unreadableHead = (n) => `读不到 ${n} 档（未判，不得读作已检）：`

/** gate 报面（固定句形——§3.20「报面（固定句形 · 交付门 gate）」）：首行 verdict = 唯一机判串。
 *  §2.3：verdict 只有一条；单根清单报面逐字不变（零回归的判据面）；≥2 根时范围行追加根清单、
 *  命中 ∥ 跳过 ∥ 读不到行带项目标签。 */
function gateReport({ lay, docsSource, checkFiles, skipped, unreadable, anchors, paragraphs, lineRefs }) {
  // 第三条判据的**判集 = 正文面**（围栏块外）；围栏内那部分只进下面那行读数（口径 = §3.23「判面 = 正文面」块）。
  const bodyRefs = lineRefs.body.length
  const fencedRefs = lineRefs.fenced.length
  const total = anchors.hits.length + paragraphs.length + bodyRefs
  const src = docsSource === "session" ? "本会话写过的文档" : "显式 docs"
  // 首行：锚与段分列（用户 11:16：段的问题叫「文字太长，难于阅读」，不是「命中 N 条」也不是字符数）
  const verdict = () => {
    // 读不到优先：判不出就不产 PASS ∥ REFUSED（既有 ERROR 位——fail-closed，没 PASS 就是没过）
    if (unreadable.length) return `DOC-CHECK GATE: ERROR（读不到 ${unreadable.length} 档）`
    if (total === 0) return checkFiles.length ? "DOC-CHECK GATE: PASS" : "DOC-CHECK GATE: PASS（0 档）"
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
      : `范围：${src} —— **0 档受检**（空清单：本次没有判任何档，不得读作「已检」）`,
    "判据：逐段检查——" + DOC_CLASS.para,
  ]
  out.push(...bucketLines(lay, skipped.missing, (n) => `跳过 ${n} 档（已不在盘，未检）：`))
  out.push(...bucketLines(lay, skipped.notMarkdown, (n) => `跳过 ${n} 档（非 markdown 档，未检）：`))
  out.push(...bucketLines(lay, unreadable, unreadableHead)) // 读面：与跳过行分开——「没读成」不是「不在盘」
  // 跨仓引用读数（零命中类——不进 `total`、不改 verdict，只让作者看到「这一处没保证」）；
  // 位置 = 命中区之前，末行仍留给结论 / 处置块。
  for (const h of anchors.crossRepo ?? []) out.push(crossRepoLine(h))
  if (checkFiles.length === 0) {
    // 空范围不静默当通过（K6）——照实说明 + 给出补充通道（两侧都不得读成「已检」）。
    // 措辞按「有没有跳过行」分流：无跳过行时不得写「见上方跳过行」。
    const hasSkips = skipped.missing.length > 0 || skipped.notMarkdown.length > 0
    out.push(docsSource === "session"
      ? (hasSkips
        ? "范围为空：本会话触达的档均不可判（见上方跳过行）——若确认改过 ⇒ 显式传 docs"
        : "范围为空：本会话没有写过 .md 档——若确认改过 ⇒ 显式传 docs")
      : (hasSkips
        ? "范围为空：显式 docs 里没有可判档——见上方跳过行"
        : "范围为空：显式 docs 是空清单——列出要判的档后复跑"))
  } else if (total === 0) {
    // 正文面零命中但围栏内有存量 ⇒ 判 `PASS` 的同时把那一行读数照出（读数不是判据，但不能让读者以为「围栏那片没有」）。
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
  return out.join("\n")
}

/**
 * 跑一次文档纪律机检。
 * @param {string} root **声明根**（调用方给出的坐标系；相对 `docs` 条目按它解析，无 manifest 祖先的档也落它）。
 *   语义变了：它不再是整批共用的坐标系——每个档的判定根 = 该档自己的落点（§2.1）；
 *   缺省 ∥ 空串 ∥ 非字符串 ⇒ **整清单不判**（§2.4：`gate` 面 `ERROR（无法定根 N 档）`、`report` 面抛错）。
 * @param {{docs?:string[], mode?:'report'|'gate', docsSource?:'session'|'explicit', lines?:string[]}} [o]
 *   `mode` 缺省 = `report`；`docs` = 被判档清单（相对 `root` 或绝对）——**必填**（两种问法同）：
 *   缺省 ∥ 非数组 ⇒ 报错要求显式清单（零遍历、零全域兜底）；`report` 面**空数组也报错**，`gate` 面空数组 ⇒
 *   `PASS（0 档）` + 空范围说明（「本轮一档没碰」是真实读数）；`report` 面不可判档 ⇒ 报错、整次零判定；
 *   `gate` 面不可判档 ⇒ 跳过行；`docsSource` = 范围来源标签（`session` = 本会话触达记账 ∥ `explicit` = 显式
 *   `docs`）——缺省 = `explicit`；只影响报面措辞。
 *   `lines` = 读数面清单（相对 `root` 或绝对；收任意在盘档）——**读数，不是判据**：
 *   把它给 `mode:"gate"` 是不支持的用法 ⇒ 开判之前抛错（静默忽略会让调用方以为量过）；
 *   `report` 面逐档出一行内容行数，并给源 / 单元测试档的尺寸档位标记。
 * @returns {{report:string, hits:{total:number, anchors:number, paragraph:number, lineRefs?:number}, anchorHits:Array,
 *   paragraphHits:Array, lineRefHits:Array, files:string[], checkFiles:string[], paragraphMax:number,
 *   skipped:{missing:string[], notMarkdown:string[]}, unreadable:string[], lineReads:{file:string, lines:number, tier:'hard'|'soft'|null}[],
 *   lineRefs:{body:Array, fenced:Array, total:number, unreadable:string[]}, batchFaceRefs:number, projectRoots:string[],
 *   domainTables:{root:string, manifest:boolean}[]}}
 *   `lineRefs` = 行号坐标的采集结果，**两个问法返回同一份**（同一次采集）。
 *   `projectRoots` = 参与判定的根（升序；§2.3）。**消费者只有两处**：报面的根清单行（≥2 根才出）与本批用例的断言。
 *   `domainTables` = 域表读数（§2.5：每组一根、按路径升序；`manifest` = 该根读到了 manifest）。
 *   **消费者只有两处**：`report` 面的域表读数块与本批用例的断言——不进 `hits`、不改 verdict（`gate` 面零改）。
 *   `batchFaceRefs` = 面判剔除的 token 数（批档面互引不判——读数，**不进 `hits`**、不改 verdict；只有 `report` 面报面出这一行）。
 *   `lineReads` = 读数面结果（给了 `lines` 才有内容；`gate` 面恒空——该面带 `lines` 直接抛错）。
 *   它**不进 `hits`**（不是命中），也不改 verdict、不改跳过行与读面行。
 *   `unreadable` = 三条判据的并集（在盘但读不到的档）——**不进 `hits`**（不是命中），但它让 `gate` 首行判 `ERROR`；
 *   消费面（批档门）据此 fail-closed。
 *   `hits.lineRefs` = `lineRefs.body.length`（**正文面**——围栏内那部分是不入判的读数），且只在 `gate` 面计入 `hits.total`
 *   ——`report` 面的 `hits.total` 仍是两条判据之积
 *   （清点不产 verdict：报告态的「命中 N 条」与末行结论句只为两条判据而写）。**`report` 面的 `hits` 对象不带 `lineRefs` 键**
 *   （两处 `hits` 形状不同：要读行号类读数一律取 `lineRefs` 的 `body` ∥ `fenced` ∥ `total`，别读 `hits.lineRefs`）。
 *   消费面判「清」须读 `report` 首行（gate）∥ `hits.total`（report），不得只看其中一个。
 */
export function runDocCheck(root, { docs, mode = "report", docsSource, lines } = {}) {
  const base = declaredRoot(root)
  const gate = mode === "gate"
  // 读数不是判据 ⇒ 门面不接（开判之前拒绝，不静默忽略）：静默忽略会让调用方以为量过（业务门纪律：该失败就失败）。
  if (gate && lines !== undefined) {
    throw new Error('doc_check: `lines` is a reading, not a criterion — `mode:"gate"` does not accept it. Pass `lines` with `mode:"report"` for the readings, and `gate` without it for the verdict; nothing was judged.')
  }
  if (docs !== undefined && !Array.isArray(docs)) {
    throw new Error(`doc_check: \`docs\` must be an array of paths (got ${typeof docs}) — a bare string is refused rather than read as a whole-domain request; pass ["<path>"].`)
  }
  if (!Array.isArray(docs)) {
    throw new Error('doc_check: `docs` is required — pass the explicit list of documents to judge. There is no default range: nothing is scanned unless you name it.')
  }
  // 报告态空清单 = 报错（「没跑」不得装成「跑了且清」）；gate 面空清单照实出 `PASS（0 档）` + 空范围说明
  // ——交付面「本轮一档没碰」是一种真实读数，不是省略。
  if (!gate && (docs.length === 0 || docs.every((d) => typeof d !== "string" || d.trim() === ""))) {
    throw new Error('doc_check: docs is empty — an empty list names no document, so nothing can be judged; list the documents you mean.')
  }
  const source = docsSource ?? "explicit"
  // 清单条目的形状先判（与声明根无关——根缺不缺都有这一拒，拒文说的仍是清单的毛病）。
  assertEntryShapes(docs)
  // 定声明根（§2.4）：声明根是这条判据的**调用前置**——缺它整清单不判，不出半份判定。
  // `gate` 面给一条能读的 `ERROR`（首行 + 逐档点名 + 原因），`report` 面照既有 fail-closed 形抛错、整次零判定。
  if (base === null) {
    const items = noRootItems(docs)
    if (!gate) {
      throw new Error(`doc_check: 无法定根 ${items.length} 档 —— ${NO_ROOT_HEAD}；${items.join(" ∥ ")}; no document was judged and none was silently skipped.`)
    }
    return noRootOutcome(items)
  }
  const range = resolveRange(base, docs)
  // 报告态 fail-closed：清单里有一个不可判档 ⇒ 报错点名、整次零判定——清单写错却报 0 命中就是「没跑」装成「跑了且清」。
  if (!gate && range.undecidable.length) {
    const named = range.undecidable.map((u) => `${rel(base, u.abs)}（${u.reason}）`).join(" ∥ ")
    throw new Error(`doc_check: docs names ${range.undecidable.length} document(s) that cannot be judged — no document was checked: ${named}. Fix the list and re-run; nothing is silently skipped and the check never widens beyond the list.`)
  }
  const checkFiles = range.check
  // 读数面：在判据之前算完——一个量不成的清单整次零读数（fail-closed），不产报面也不混进 hits
  const lineReads = lines === undefined ? [] : resolveLineReads(base, lines)
  const { paragraphMax, lineMax, paragraphExemptZones } = DOC_CHECK_BUILTINS
  // 判域（§2.2）：按档定根、逐组判——判法内部（抽取式 ∥ 解析序 ∥ 面判）一字不动，改的只是喂进去的根。
  // 单组不并组：结果与次序就是逐档一次的既有形（零回归 = 报面逐字相等的前提）。
  // 域表（§2.5 KD-7）：**每组只读一次 manifest**，锚判与批档基底都吃这一份（注入形——缺省自读支留给直调判法的夹具）；
  // 读不到 manifest（组根无档 ∥ 声明根是普通目录 ∥ 工作区）⇒ 空域表、向严判，不静默（读数面写明）。
  const groups = perRootGroups(checkFiles, base)
  const domainTables = groups.map((g) => {
    let man
    try { man = readManifest(g.root) } catch { man = { ok: false } }
    return { root: g.root, ok: !!man?.ok, manifest: man }
  })
  const perGroup = groups.map((g, i) => ({ root: g.root, res: checkAnchors(g.root, { files: g.files, manifest: domainTables[i].manifest }) }))
  const anchors = groups.length === 1
    ? perGroup[0].res
    : mergeAnchors(perGroup, new Map(checkFiles.map((f, i) => [f, i])))
  const projectRoots = [...new Map(groups.map((g) => [pathKey(g.root), g.root])).values()].sort()
  const lay = reportLayout(base, projectRoots)
  const paragraphs = checkParagraphs({ paragraphMax, lineMax, exemptZones: paragraphExemptZones, files: checkFiles })

  // 行号坐标的**唯一采集点**：放在两支分支之前——`report` 与 `gate` 读出的是同一份结果，不各采一次
  // （同源判 = 两个问法的 `lineRefs.body` 逐字相等；一套萃取式，不是一套宽一套窄）。
  const lineRefs = collectLineRefs({ files: checkFiles })
  // 读面并集（三条判据各带清单）：同一个未读档可能出现多次（一档三面都读不到）⇒ 去重保序
  const unreadable = [...new Set([
    ...(anchors.unreadable ?? []),
    ...(paragraphs.unreadable ?? []),
    ...(lineRefs.unreadable ?? []),
  ])]
  const anchorCount = anchors.hits.length
  const paraCountAll = paragraphs.filter((h) => h.clazz === DOC_CLASS.para).length
  const lineCountAll = paragraphs.filter((h) => h.clazz === DOC_CLASS.line).length
  const shared = {
    anchorHits: anchors.hits, paragraphHits: paragraphs, files: checkFiles, checkFiles, paragraphMax,
    skipped: { missing: range.missing, notMarkdown: range.notMarkdown },
    unreadable,
    lineReads,
    // 面判读数（批档面互引不判——**不是命中**：不进 `hits`、不改 verdict；与 `lineRefs` 同层靠读数消费面取）
    batchFaceRefs: anchors.batchRefs ?? 0,
    lineRefHits: lineRefs.body.map((h) => ({ ...h, clazz: LINE_REF_CLASS })),
    lineRefs,
    // 参与判定的根（升序）：报面根清单与用例断言两处消费（§2.3／§3）
    projectRoots,
    // 域表读数（§2.5）：每组一根、按路径升序；`manifest` = 该根读到了 manifest。消费者 = 报面读数块与用例断言。
    domainTables: domainTables
      .slice()
      .sort((a, b) => (a.root.toLowerCase() < b.root.toLowerCase() ? -1 : a.root.toLowerCase() > b.root.toLowerCase() ? 1 : 0))
      .map(({ root, ok }) => ({ root, manifest: ok })),
  }
  if (gate) {
    // `gate` 面：第三条判据的**正文面**计入 `hits` 与 `hits.total`（三数之和）；围栏内只作读数（不进 `hits`）。
    // 读不到列不计数但定判决词（`ERROR`）。
    const hits = { total: anchorCount + paragraphs.length + lineRefs.body.length, anchors: anchorCount, paragraph: paragraphs.length, lineRefs: lineRefs.body.length }
    return { ...shared, hits, report: gateReport({ lay, docsSource: source, checkFiles, skipped: shared.skipped, unreadable, anchors, paragraphs, lineRefs }) }
  }

  const hits = { total: anchorCount + paragraphs.length, anchors: anchorCount, paragraph: paragraphs.length }

  const out = [
    "文档纪律机检（报告态 · 非门禁）",
    `射程：${base} · 传入清单 ${checkFiles.length} 档 · 区带豁免：${paragraphExemptZones.length ? paragraphExemptZones.join(" ∥ ") : "无"}`,
    "声明：判据参数 = 工具内置常量；范围 = 传入文件（判定范围 = 解析范围）",
    `范围：传入清单 ${checkFiles.length} 档（整档入判 · 判定范围 = 解析范围）${rootsSuffix(lay)}`,
    `命中 ${hits.total} 条（锚 ${anchorCount} · ${DOC_CLASS.para} ${paraCountAll} · ${DOC_CLASS.line} ${lineCountAll}）`,
  ]
  for (const h of anchors.hits) out.push(anchorHitLine(lay, h))
  for (const w of paragraphs) out.push(paragraphHitLine(lay, w))
  // 跨仓引用读数（零命中类——只报不拦，位置 = 命中区之后、清单块之前）
  for (const h of anchors.crossRepo ?? []) out.push(crossRepoLine(h))
  // 读面：清单块之前单列一行点名（口径 = §3.20「读面」块——「没读成」不得与「干净」同形）
  out.push(...bucketLines(lay, unreadable, unreadableHead))
  // 读数块：位置 = 读面行之后、行号坐标清单块之前（末行恒是 `结论：…`；读数不抢它的位）
  if (lineReads.length) out.push(...lineReadBlock(base, lineReads))
  // 域表读数块（§2.5 · 仅 `report` 面）：出场条件两支——「本次读到域表的根集 ≠ {声明根}」或任一根无 manifest；
  // 单项目锚下根集恰是声明根且该根有 manifest ⇒ 零出（单项目零回归的判据面，AC-2）。
  {
    const read = domainTables.map((d) => d.ok)
    const rootSetDiffers = projectRoots.length !== 1 || pathKey(projectRoots[0]) !== pathKey(base)
    if (rootSetDiffers || read.some((r) => !r)) out.push(...domainTableBlock(projectRoots, read))
  }
  // 批档面留痕（面判的读数）：位置 = 清点块之上、末行结论句之前；0 也出（0 与「没扫」不得同形）
  out.push(batchFaceLine(anchors.batchRefs ?? 0))
  // 清单块位置 = 命中区之后、末行 `结论：…` 之前（报面的末行恒是结论句，清单不抢它的位）。
  out.push(...lineRefsBlock({ base, files: checkFiles, refs: lineRefs }))
  out.push(hits.total
    ? `结论：${hits.total} 条命中——报告态，不作拒执行的理由`
    : unreadable.length
      ? `结论：0 条命中（但有 ${unreadable.length} 档未判——见上方「读不到」行，不得读作已检）`
      : `结论：0 条命中（锚 ∥ ${DOC_CLASS.para} ∥ ${DOC_CLASS.line} 均清）`)

  return { ...shared, hits, report: out.join("\n") }
}
