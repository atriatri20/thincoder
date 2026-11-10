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
 * 后缀兜底读数块（`how="suffix" N 处` + 按 token 去重的清账清单——读数，不是判据）：口径单源 = `docs/core/design/PATH-RESOLUTION.md`
 *   §2.6 ∥ §2.8；只在 `report` 面出。**为什么必须显式**：唯一后缀证明「能定位」，不证明「是你想指的那个」——
 *   不标，它就混进绿里；清单的封顶与总数行（`共 N 条 token · M 处`）同住 `suffixBlock`。
 * 判域（**按档定根** · 判据句单源 = `docs/core/design/DOC-CHECK.md` §2.1–§2.4；需求条 = `docs/core/requirements/DOC-CHECK.md` 的 F17 ∥ AC-15；
 *   实现落 `./per-root.mjs`——定根 ∥ 分组 ∥ 报面路径形同出一档）：
 *   每个档用**自己的落点**定根——`rootOf(abs, 声明根) = owningProject(abs, parse(abs).root) ?? 声明根`；界 = 该档所在盘的盘根
 *   （界填声明根会把跨项目的档先判出界、再落回声明根，那正是本批要修的 `档缺`）。
 *   `root` 入参 = **声明根**（调用方给出的坐标系），不再是整批共用的坐标系；**缺声明根 ⇒ 整清单不判、显式 `ERROR`**
 *   （政策：半份判定在报面上分不出「这档干净」与「这档没判」），「声明根自身是不是项目」不参与判断。
 *   判定内容（锚 ∥ 段长 ∥ 行号坐标 ∥ 引文）一字不动——改的只是「拿哪个根去解析」：按根分组、逐组调既有 `checkAnchors(root_i, …)`。
 * 判集排除（manifest 的 `index.docCheckExcludePaths`——机制单源 = `docs/core/design/DOC-CHECK.md` §2.7）：
 *   判之前把落在排除面里的档从**判集**里去掉——改的是判集，判据本体（阈值 ∥ 命中类 ∥ verdict 词）零改。
 *   排除面相对**该档自己的项目根**声明（一档一根）；排除档进 `excluded` 桶、两面都出行（记录「这批档按声明免检」，
 *   不是免责句）——它既不是命中，也不是「不在盘」或「读不到」。**免检即放行**：全清单被排除是合法状态，
 *   两面照常通过（首行 `PASS`、末行均清句）、零免责句。排除是调用方的声明，不是「检不了的声明」。
 * 逐条豁免（manifest 的 `index.docCheckExemptions`——机制单源 = 同档 §2.7）：
 *   三条判据都跑完之后、verdict 之前分类：登记的命中进 `exempted` 桶（照列、不阻断），未登记的留 `hits`（拦）。
 *   识别键 = `file` + `kind` + `text` 三合一全等（**不用行号**——插一行整片失效，豁免就成了一次性的）。
 *   登记表按**该条命中自己的 `file`** 求 `rootOf` 取（一个仓的登记不替另一个仓放行）；条目形态在**消费点**判，
 *   不进 `validateManifest` 的 `errors`（一个写坏的条目不该把整份 manifest 打掉）。**两面同出**、不进 `hits`、不改 verdict。
 * 扩展名清单（manifest 的 `index.docCheckExts`——机制单源 = 同档 §2.6）：
 *   装配处的**一处拼装**：`DEFAULT_DOC_EXTS ∪ 该根 index.docCheckExts`，再过一次取形过滤（单字符后缀 ∥ 归档内层剔除）；
 *   清单透传给判法面的 `isDocToken`（锚 ∥ 花括号 ∥ 依据行 ∥ 行号面四处同吃）。`report` 面出读数一行（该仓写了这项才出）。
 * 判定输入与判定区（**一个判定、两个入参**——机制单源 = `docs/core/design/DOC-CHECK.md` §2.10.1）：
 *   `texts`（可选，键 = 档、值 = 该档本次完整新内容）—— 给了它，该档的判定输入就是这份文本，不再读盘；
 *     它替换的是「读哪份字节」，三条判据 ∥ 四条抽取面 ∥ 解析序 ∥ 豁免谓词一字不动。
 *   `zones`（可选，键 = 档、值 = 区间表，按**改后档**行号、闭区间）—— 给了它，阻断集 = **命中行落在任一区内**的那些；
 *     区外命中进 `stockHits` 读数桶（照列、不阻断；句形单源 = `STOCK_LINE`）。**两个入参都缺席 ⇒ 与今日逐字相同**。
 *   身份不再造临时片段档：命中的 `file` / `root` / 豁免识别键 / 报面坐标全部是**目标档**的（§2.10.2）。
 */
import { readFileSync, statSync } from "node:fs"
import { resolve } from "node:path"
import { checkParagraphs, DOC_CLASS } from "./paragraph.mjs"
// 判法面（锚 ∥ 行号坐标）：生效扩展名清单的缺省值也住 `./anchors.mjs`（扩展名定义只此一处，D2）。
import { DEFAULT_DOC_EXTS, checkAnchors } from "./anchors.mjs"
import { collectLineRefs, lineRefsBlock } from "./line-refs.mjs"
// 域表的一次读（§2.5 KD-7）。
import { readManifest } from "../manifest.mjs"
// 判域族出档（定根 ∥ 分组 ∥ 报面路径形 ∥ 无声明根的逐档点名）：接缝与理由见 `./per-root.mjs` 头注。
import { NO_ROOT_HEAD, bucketLines, declaredRoot, noRootItems, pathKey, perRootGroups, rel, reportLayout, rootOf, rootsSuffix } from "./per-root.mjs"
// 排除面的归一单源（§2.6 KD-Ex2）：与 `index.excludePaths` 同一份 `normalizePathList`——不写第二份归一。
import { normalizePathList } from "../declaration.mjs"

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

/** 批档 edit 与收口共用的存量读数句形；N = 整档命中中不属本次改动区的条数。 */
export const STOCK_LINE = (n) => `存量命中 ${n} 条（不属本次改动区，不阻断交付；整档读数）`

/** 判集未指向成环仓时的读数；该仓级事实不进本次阻断集。 */
export const CYCLE_READ_LINE = (n) => `环引 ${n} 条（本次判集未指向成环仓，不阻断交付）`

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

/** **一根一次读**（§2.6 装配处）：按根记忆 `readManifest`——排除面的过滤与吃 `domainTables` 的是**同一次读**。
 *  两次读会让「排除面读到了什么」与「域表读到了什么」成为两个可分离的事实，而它们本就该是同一份声明。
 *  读不到 ∥ 读错 ⇒ `{ ok: false }`（向严：域表降级、排除面按空集，照判）。
 *  @returns {(root:string) => {ok:boolean, res:object}} */
function manifestReader() {
  const memo = new Map()
  return (root) => {
    const key = pathKey(root)
    const hit = memo.get(key)
    if (hit !== undefined) return hit
    let res
    try { res = readManifest(root) } catch { res = { ok: false } }
    const entry = { ok: !!res?.ok, res }
    memo.set(key, entry)
    return entry
  }
}

/** 该根的排除面（§2.6）：`index.docCheckExcludePaths` 经归一单源展开，再折成比较键。
 *  manifest 不可用（读不到 ∥ 校验不过）⇒ **空集、照判**——值形态非法的降级就是域表降级这一条路，
 *  不为「排除面读坏了」另设分支（向严：少排除一档只是多判一档，不会把该判的档洗成干净）。 */
function excludeFaceOf(entry) {
  return entry.ok ? normalizePathList(entry.res.manifest?.index?.docCheckExcludePaths).map(pathKey) : []
}

/** 判集过滤（§2.6 生效坐标 · **分组之前**）：逐档按**该档自己的根**取其排除面，落在里面 ⇒ 不进可判集、记 `excluded`。
 *  命中语义 = 恰等 ∨ 后随 `/`（归一已吃掉尾斜杠，目录与单个档同写一式）；比较走 `pathKey`——
 *  Windows 上大小写写错的排除项会静默不生效，那正是本节要消的静默漏。
 *  口径写死一条路：过滤后的清单就是 `checkFiles`，**不另设 `judgedFiles` 这第二个名字**——否则
 *  「范围」行的档数 ∥ 「0 档受检」那一支 ∥ `hits` 口径各要重新指定吃谁，实现席只能猜。 */
function splitExcluded(files, declaredBase, readOf) {
  const faces = new Map()
  const faceOf = (root) => {
    const key = pathKey(root)
    let face = faces.get(key)
    if (face === undefined) { face = excludeFaceOf(readOf(root)); faces.set(key, face) }
    return face
  }
  const checkFiles = []
  const excluded = []
  for (const abs of files) {
    const root = rootOf(abs, declaredBase)
    const own = pathKey(rel(root, abs))
    if (faceOf(root).some((p) => own === p || own.startsWith(`${p}/`))) excluded.push(abs)
    else checkFiles.push(abs)
  }
  return { checkFiles, excluded }
}

/** 归档内层扩展名（§2.6 取形第六条）：装了外层的名字，内层后缀不单列 ⇒ `build/app.tar.gz` 的末段是 `gz`、不在清单
 *  ⇒ 整串不当档名。**两条取形规则对项目自己写的项同样生效**（写了与不写，读数逐字相同）。 */
const ARCHIVE_INNER_EXTS = Object.freeze(["tar", "gz", "zip", "bz2", "xz", "7z", "tgz", "rar"])

/** 生效扩展名清单（**装配处单源** · §2.6「生效清单怎么拼」）：`DEFAULT_DOC_EXTS ∪ 该根 index.docCheckExts`，
 *  并集**不替换**（与 `codeExtensions` ∥ `docExtensions` 同族语义：只增不减——窄判集是豁免面的事），
 *  再过一次取形过滤：单字符后缀 ∥ 归档内层一律剔除；比较不折叠点、不分大小写（书写面允许带前导点）。
 *  **过滤坐在装配处而不是谓词里**：谓词 `isDocToken` 只按字面查这张表，项目写进去的项先被剔掉，它看不到。 */
function effectiveExtsOf(entry) {
  const declared = entry.ok ? entry.res.manifest?.index?.docCheckExts : []
  const out = []
  for (const raw of [...DEFAULT_DOC_EXTS, ...(Array.isArray(declared) ? declared : [])]) {
    const e = String(raw ?? "").trim().replace(/^\./, "").toLowerCase()
    if (e.length < 2 || ARCHIVE_INNER_EXTS.includes(e)) continue
    if (!out.includes(e)) out.push(e)
  }
  return out
}

/** 一根一份生效清单（与排除面 ∥ 域表吃**同一次** `readManifest`——`readOf` 的记忆体）：清单随根变，不成全局常量。 */
function extsReader(readOf) {
  const memo = new Map()
  return (root) => {
    const key = pathKey(root)
    let list = memo.get(key)
    if (list === undefined) { list = effectiveExtsOf(readOf(root)); memo.set(key, list) }
    return list
  }
}

/** 登记条目的判据类闭集（§2.7 的 `kind` 表）：按类 ∥ 通配 ∥ 路径前缀都不作数——`kind` 是判据类、`text` 是逐处文本。 */
const EXEMPTION_KINDS = Object.freeze(["锚·档缺", "锚·节缺", "锚·引缺", `段·${DOC_CLASS.para}`, `行·${DOC_CLASS.line}`, LINE_REF_CLASS])

/** 一条登记的形态判据（**在消费点判**，不进 `validateManifest` 的 `errors`——一个写坏的条目不该把整份 manifest 打掉：
 *  manifest 不可用 ⇒ 域表空集 ⇒ 批档面互引不豁免 ⇒ 邻仓批档引用一律 `档缺`）。
 *  @returns {null|string} `null` = 可用；否则 = 报面点名用的那句（五字段缺一 ∥ 非字符串 ∥ 空白，或 `kind` 在闭集外） */
function exemptionProblem(e) {
  if (e === null || typeof e !== "object" || Array.isArray(e)) return "条目不是对象"
  for (const k of ["file", "kind", "text", "why", "review"]) {
    if (typeof e[k] !== "string" || e[k].trim() === "") return `缺 ${k}`
  }
  if (!EXEMPTION_KINDS.includes(e.kind)) return `kind 不在闭集：${e.kind}`
  return null
}

/** 命中 → 识别键（§2.7「命中怎么被稳定识别」）：`file` + `kind` + `text` 三合一全等，**不用行号**。
 *  `null` = 该类不可登记：`环引` 是仓级命中（无行号、无档内文本）——假环意味着声明的 `index.publicRepos` 本身错了，
 *  那是改声明，不是登记一个假阳。 */
function exemptionKeyOf(hit) {
  if (hit.clazz === "档缺") return { kind: "锚·档缺", text: hit.token }
  if (hit.clazz === "节缺") return { kind: "锚·节缺", text: `${hit.token}§${hit.section}` }
  if (hit.clazz === "引缺") return { kind: "锚·引缺", text: `${hit.token}「${hit.quote ?? ""}」` }
  if (hit.clazz === DOC_CLASS.para) return { kind: `段·${hit.clazz}`, text: String(hit.text ?? "") }
  if (hit.clazz === DOC_CLASS.line) return { kind: `行·${hit.clazz}`, text: String(hit.text ?? "") }
  if (hit.clazz === LINE_REF_CLASS) return { kind: LINE_REF_CLASS, text: String(hit.text ?? "") }
  return null
}

/** 装配处的豁免分类（§2.7 · **三条判据跑完之后、verdict 之前**）：一档一根地取登记表（与域表同一次读），
 *  已登记的命中进 `exempted`（照列、不阻断），未登记的留 `hits`（拦）。
 *  - **`hits` 只数未登记的那批**：消费面（批档门 ∥ 收口 ∥ 写前门）全读 `hits.total`，留在里面就要每处各学一遍「已裁定的不算」。
 *  - **登记未命中** = 这一轮一条都没对上的有效条目（原文已变 ∥ 该档已不在判集）——登记跟着一条消失的命中活下来，
 *    就是下一轮没人敢删的残骸。
 *  - **无效条目单独点名**：它不生效（命中照拦），但不把整份 manifest 打掉。
 *  @returns {{anchorHits:Array, paragraphHits:Array, lineRefHits:Array, exempted:Array, invalid:Array, stale:number}}
 *   `exempted` 每格 = 原命中 + `kind` + `exemption`（`why` ∥ `review` 从登记条目带出，报面四项一个不少） */
function classifyExemptions({ anchorHits, paragraphHits, lineRefHits, base, roots, readOf }) {
  const tables = new Map()
  const tableOf = (root) => {
    const key = pathKey(root)
    const hit = tables.get(key)
    if (hit !== undefined) return hit
    const entry = readOf(root)
    const raw = entry.ok ? entry.res.manifest?.index?.docCheckExemptions : []
    const items = (Array.isArray(raw) ? raw : []).map((e, i) => {
      const problem = exemptionProblem(e)
      if (problem !== null) return { problem, index: i }
      return { fileKey: pathKey(String(e.file).trim()), kind: e.kind, text: e.text, why: e.why, review: e.review, used: false }
    })
    const t = { root, items }
    tables.set(key, t)
    return t
  }
  // 参与判定的每个根都读一次（与域表同一次读）：登记未命中要能数出「这一轮一条都没对上」的那批。
  for (const r of roots) tableOf(r)
  const split = (hits) => {
    const kept = []
    const exempted = []
    for (const h of hits) {
      const k = exemptionKeyOf(h)
      if (k === null) { kept.push(h); continue }
      const t = tableOf(rootOf(h.file, base))
      const own = pathKey(rel(t.root, h.file))
      const matched = t.items.find((it) => it.problem === undefined && it.fileKey === own && it.kind === k.kind && it.text === k.text)
      // 同一识别键可能对上多处（同一行两处行号坐标 ∥ 两段同文）：**一处登记免掉这一组**——识别键本身分不开它们，
      // 只认第一处会让第二处「登记了却照拦」，而作者看回执只会以为登记坏了。
      if (matched) { matched.used = true; exempted.push({ ...h, kind: k.kind, exemption: matched }); continue }
      kept.push(h)
    }
    return { kept, exempted }
  }
  const a = split(anchorHits)
  const p = split(paragraphHits)
  const l = split(lineRefHits)
  const invalid = []
  let stale = 0
  for (const t of tables.values()) for (const it of t.items) {
    if (it.problem !== undefined) invalid.push({ root: t.root, index: it.index, problem: it.problem })
    else if (!it.used) stale++
  }
  return {
    anchorHits: a.kept, paragraphHits: p.kept, lineRefHits: l.kept,
    exempted: [...a.exempted, ...p.exempted, ...l.exempted],
    invalid, stale,
  }
}

/** 并组的锚结果（§2.2）：命中按**文件稳定序**（清单位次）再按行号合并。
 *  单组时不重排（次序就是逐档一次的既有次序）；多组时这一步让跨项目的命中按清单序读，而不是按组的首现序读。
 *  `unverified` 并组不排序：它按声明根汇总，次序按组首现序（报面一行一根，不按档排）。 */
function mergeAnchors(perGroup, fileOrder) {
  const hits = []
  const unverified = []
  const unreadable = []
  const suffixHits = []
  let batchRefs = 0
  let suffixBuilds = 0
  const cycleReads = []
  for (const { res } of perGroup) {
    hits.push(...res.hits)
    cycleReads.push(...(res.cycleReads ?? []))
    unverified.push(...(res.unverified ?? []))
    suffixHits.push(...(res.suffixHits ?? []))
    for (const u of res.unreadable ?? []) if (!unreadable.includes(u)) unreadable.push(u)
    batchRefs += res.batchRefs ?? 0
    suffixBuilds += res.suffixBuilds ?? 0
  }
  if (perGroup.length > 1) {
    const at = (h) => (fileOrder.has(h.file) ? fileOrder.get(h.file) : Number.MAX_SAFE_INTEGER)
    hits.sort((a, b) => at(a.file) - at(b.file) || (a.line ?? 0) - (b.line ?? 0))
  }
  return { hits, unverified, unreadable, batchRefs, suffixHits, suffixBuilds, cycleReads }
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

/** 清单 → 可判集（去重保序）+ 不可判档两类（`missing` ∥ `notMarkdown`）。条目的形状由 `assertEntryShapes` 先拒。
 *  **给了 `texts` 的那一档不看盘面**（§2.10.1）：判定输入就是那份文本，新建档（还没落盘）因此同样可判；
 *  形态不变形：非 `.md` 仍归 `notMarkdown`（判据面只看 markdown 档，这条与读盘与否无关）。 */
function resolveRange(base, docs, textOf) {
  const seen = new Set()
  const check = []
  const undecidable = []
  const missing = []
  const notMarkdown = []
  docs.forEach((d) => {
    const abs = resolve(base, d)
    const key = pathKey(abs)
    if (textOf(abs) !== undefined) {
      if (!abs.toLowerCase().endsWith(".md")) { undecidable.push({ abs, reason: "not a markdown document" }); notMarkdown.push(abs) }
      else if (!seen.has(key)) { seen.add(key); check.push(abs) }
      return
    }
    const reason = undecidableReason(abs)
    if (reason === null) { if (!seen.has(key)) { seen.add(key); check.push(abs) } return }
    undecidable.push({ abs, reason })
    if (reason === "not on disk") missing.push(abs)
    else notMarkdown.push(abs)
  })
  return { check: check.sort(), undecidable, missing, notMarkdown }
}

/** `texts` 归一一处（§2.10.1）：调用方交的是「档 → 该档本次完整新内容」，键按 `docs` 同一条解析（相对声明根或绝对）。
 *  没给 ⇒ 一个恒 `undefined` 的查表（那一路与改前逐字相同：一律读盘）。
 *  形态错（非 Map/对象、键不是路径、值不是字符串）⇒ **抛**：静默忽略会让「判定输入替换」落空，
 *  而落空的样子与「判过了」一模一样（业务门纪律：该失败就失败）。 */
function textLookupOf(base, texts) {
  if (texts === undefined) return () => undefined
  const raw = texts instanceof Map
    ? [...texts.entries()]
    : (texts !== null && typeof texts === "object" && !Array.isArray(texts) ? Object.entries(texts) : null)
  if (raw === null) {
    throw new Error('doc_check: `texts` must be a Map or a plain object keyed by document path, value = that document\'s full new text — nothing was judged.')
  }
  const table = new Map()
  for (const [k, v] of raw) {
    if (typeof k !== "string" || k.trim() === "") {
      throw new Error('doc_check: every `texts` key must be a document path — an empty or non-string key names no document; nothing was judged.')
    }
    if (typeof v !== "string") {
      throw new Error(`doc_check: \`texts\` value for ${k} is not a string — the judged input must be that document's full text; nothing was judged.`)
    }
    table.set(pathKey(resolve(base, k)), v)
  }
  return (abs) => table.get(pathKey(abs))
}

/** `zones` 归一一处（§2.10.1）：调用方交的是「档 → 区间表」，区间按**改后档**行号、闭区间；`start > end` = 宽度为零。
 *  没给 ⇒ `null`（阻断集不按区间切分，与改前逐字相同）。
 *  形态错（非 Map/对象、值不是数组、区间不是整数行号）⇒ **抛**：一个写坏的区间表会把阻断集静默算成空集。 */
function zoneTableOf(base, zones) {
  if (zones === undefined) return null
  const raw = zones instanceof Map
    ? [...zones.entries()]
    : (zones !== null && typeof zones === "object" && !Array.isArray(zones) ? Object.entries(zones) : null)
  if (raw === null) {
    throw new Error('doc_check: `zones` must be a Map or a plain object keyed by document path, value = an array of { start, end } — nothing was judged.')
  }
  const table = new Map()
  for (const [k, v] of raw) {
    if (!Array.isArray(v)) {
      throw new Error(`doc_check: \`zones\` value for ${k} is not an array of zones — pass [{ start, end }]; nothing was judged.`)
    }
    const list = []
    for (const z of v) {
      const start = Number(z?.start)
      const end = Number(z?.end)
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < 0) {
        throw new Error(`doc_check: a \`zones\` entry for ${k} is not a line range — every zone is { start, end } with 1-based integers (start > end = zero width); nothing was judged.`)
      }
      list.push({ start, end })
    }
    table.set(pathKey(resolve(base, k)), list)
  }
  return table
}

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

/** 无声明根的 `gate` 返回形（§2.4）：**零命中、零 `✗` 行**——判不了就是一次都没判，不得出成「有的判过了」。
 *  形状与正常返回同键（消费面零改）：调用方读 `report` 首行拿到 `ERROR（无法定根 N 档）`。 */
function noRootOutcome(items) {
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
    stockHits: [],
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

/** 花括号组形命中的那一格（抽取面那一支）：报面**同时**点名原 token 与缺的那个展开名——
 *  只报展开名，读者拿到的是一个他档里从没写过的名字；只报原 token，他看不出该改哪一处。其余命中类不带这一格。 */
const expandedNote = (h) => (typeof h.expanded === "string" && h.expanded !== "" ? `（花括号展开名 \`${h.expanded}\`）` : "")

/** `档缺` 命中行的追加提示（§2.6：缺的那一段 + 盘上同名 + 声明仓两格——候选只提示，不改判态）。 */
const missingHint = (lay, h) => {
  const seg = typeof h.missing === "string" && h.missing !== "" ? `缺「${h.missing}」` : ""
  const same = Array.isArray(h.sameName) && h.sameName.length > 0 ? `盘上同名：${h.sameName.map((p) => lay.shown(p)).join(" ∥ ")}` : ""
  // 第 6′ 步 ≥2 命中的候选（§2.6）：与「盘上同名」分列——两张表各答一件事，并进一列读者分不清是哪种候选
  const suffix = Array.isArray(h.suffixCandidates) && h.suffixCandidates.length > 0
    ? `后缀命中 ${h.suffixCandidates.length} 处：${h.suffixCandidates.map((p) => lay.shown(p)).join(" ∥ ")}`
    : ""
  const parts = [seg, same, suffix].filter(Boolean)
  // 已声明而根在机却缺档 ⇒ 点名声明仓与「根在盘」这个事实（两件事：声明无罪、目标真的不在）
  if (typeof h.declaredRepo === "string" && h.declaredRepo !== "") {
    parts.push(`声明仓 ${h.declaredRepo}（声明根 ${lay.shown(h.declaredRoot)}，本机在盘：${h.rootOnDisk === true ? "在" : "不在"}）`)
  }
  // 未声明形的同级目录候选（仅当首段确实是本机同级目录名——空集不写这句，否则仓内普通拼错会被读成跨仓）
  if (Array.isArray(h.siblingRepos) && h.siblingRepos.length > 0) {
    parts.push(`本机同级目录：${h.siblingRepos.join(" ∥ ")}；该名未在 index.publicRepos 声明`)
  }
  return parts.length > 0 ? `（${parts.join("；")}）` : ""
}

/** 锚命中的类名词（报面标签——类名由引擎定，本档只配显示形；四属同一条判据、同计「锚 N 条」）。 */
const ANCHOR_LABELS = { 档缺: "锚·档缺", 节缺: "锚·节缺", 引缺: "锚·引缺", 环引: "锚·环引" }

/** 锚命中行（报面单源——四命中类同形，按 `clazz` 分词）：`档缺` 追加缺哪一段与盘上同名，
 *  `节缺` 点名目标档，`引缺` 点名引文前 40 字（读者不必回目标档自己找哪一段不对），
 *  `环引` 点名成环的仓链——环是**仓级**事实（没有行号），坐标拿声明档本身与组根（判据单源 = `docs/core/design/PATH-RESOLUTION.md` §2.7「环检」）。
 *  两处消费（`gate` 报面 ∥ 报告态报面）只调本函数；`batch-gate.mjs` 与 `doc-write-gate.mjs` 取的是本函数产出的 `✗` 行，故也吃 `expanded` 这一格。
 *  `lay` = 报面路径形（§2.3）：行首项目标签（≥2 根才打）+ 行内路径相对该档自身的根。 */
const anchorHitLine = (lay, h) => {
  const label = ANCHOR_LABELS[h.clazz] ?? `锚·${h.clazz}`
  if (h.clazz === "环引") return `${lay.tag(h.file)}✗ ${label} ${lay.shown(h.file)}（${h.root}）publicRepos 成环：${h.chain}`
  const head = `${lay.tag(h.file)}✗ ${label} ${lay.shown(h.file)}:${h.line} \`${h.token}\``
  if (h.clazz === "引缺") return `${head}（引文不在该档内：「${String(h.quote ?? "").slice(0, 40)}…」）`
  if (h.clazz === "节缺") return `${head}（目标 ${lay.shown(h.target)} 无 §${h.section}）`
  return head + expandedNote(h) + missingHint(lay, h)
}

/** `未核` 列报块（**判不了** = 声明根不在本机）——句形单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「报面」两条行：
 *  `未核 N 条（声明源缺位——列报不入闸）` + 逐声明根一行。**一个声明根一行、条数按声明根计**（不是按指针计）。
 *  两个产出方共用这一形：`trigger:"pointer"` 的逐指针（列档:行与 token）∥ `trigger:"walk"` 的环走查止步。
 *  **不进 `hits`、不动 verdict**——它是「看过了、判不了」在报面上的唯一形（口径单源 = `docs/core/design/PATH-RESOLUTION.md` §2.7）。 */
const UNVERIFIED_HEAD = (n) => `未核 ${n} 条（声明源缺位——列报不入闸）`

function unverifiedBlock(lay, list) {
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
 *  **为什么必须显式**：唯一后缀证明「能定位」，不证明「是你想指的那个」——不标，它就混进绿里（§2.8 护栏一）。
 *  `后缀索引建 N 次` 是读数不是判据：它衡量「建一次」这件事，墙钟不衡量任何事（§2.8）。 */
const SUFFIX_HEAD = (n, builds) => `后缀兜底读数：how="suffix" ${n} 处（唯一后缀命中的指针——能定位，不等于你想指的那一处；后缀索引建 ${builds} 次）`

/** 后缀兜底读数块（仅 `report` 面 · 不进 `hits`、不改 verdict）：
 *  一行读数 + 按 token 去重的清账清单（`token ⇒ 绝对路径（N 处）`）。
 *  界：按处数降序、token 字典序为次键、取前 `SUFFIX_LIST_MAX` 行，末行 `共 N 条 token · M 处`
 *  （N = 去重后的 token 数、M = 处数——两个数都由当次载荷算出，不估）。
 *  位置 = `未核` 列报之后、行号坐标清单块之前（末行仍留给 `结论：…`）。 */
function suffixBlock(hits, builds) {
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
const batchFaceLine = (n) => `批档面互引未判 ${n} 处（批档 ↔ 批档 · 只留痕，不进 hits、不改 verdict）`

/** 豁免块的句形（§2.7 报面 · **两问法同出**，不进 `hits`、不改 verdict）：N = 0 时零出 ⇒ 未登记任何豁免的仓，
 *  两面报面与改动前逐字相等（零回归）。F21 的四项一个不少：哪一条（`kind` + `text`）∥ 哪一份档（`file`）∥
 *  理由（`why`）∥ 复审（`review`）。 */
const EXEMPT_HEAD = (n) => `豁免 ${n} 条（已裁定假阳，不阻断交付）：`
const EXEMPT_INVALID_HEAD = (n) => `豁免登记无效 ${n} 条（字段缺一或形态不对，不生效；命中照拦）：`
const EXEMPT_STALE = (n) => `登记未命中 ${n} 条（原文已变或已不在判集，复核后删）`

/** 已裁定条目一行：行首项目标签（≥2 根才打）+ 判据类 + 档与行 + 命中文本 + 理由 + 复审。 */
function exemptBlock(lay, list) {
  if (!Array.isArray(list) || list.length === 0) return []
  const out = [EXEMPT_HEAD(list.length)]
  for (const e of list) {
    const at = typeof e.line === "number" ? `:${e.line}` : ""
    out.push(`  ${lay.tag(e.file)}✗ ${e.kind} ${lay.shown(e.file)}${at} ${e.exemption.text} —— ${e.exemption.why}（复审 ${e.exemption.review}）`)
  }
  return out
}

/** 无效登记一行：点名是哪一份 manifest 的第几项、差在哪一条——「登记了却不生效」必须看得见，否则作者以为已经放过。 */
function invalidExemptionBlock(lay, list) {
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
const extListLine = (n) => `扩展名清单：缺省 + 本仓 ${n} 项`

/** 「读不到」清单行的句头（报面单源 · 两问法同形）：点名哪几档未判——一个不点名的「没读成」与「干净」在报面上无法区分。 */
const unreadableHead = (n) => `读不到 ${n} 档（未判，不得读作已检）：`

/** gate 报面（固定句形——§3.20「报面（固定句形 · 交付门 gate）」）：首行 verdict = 唯一机判串。
 *  §2.3：verdict 只有一条；单根清单报面逐字不变（零回归的判据面）；≥2 根时范围行追加根清单、
 *  命中 ∥ 跳过 ∥ 读不到行带项目标签。 */
function gateReport({ lay, docsSource, checkFiles, skipped, excluded, unreadable, anchors, paragraphs, lineRefs, cycleReads = [], exempted = [], exemptInvalid = [], exemptStale = 0, stockHits = [] }) {
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
  // 豁免块（§2.7 · **两问法同出**）：位置 = 命中区之后（处置块之后）；不进 `hits`、不改 verdict。
  // N = 0 时零出 ⇒ 未登记任何豁免的仓，gate 报面与改动前逐字相等（零回归）。
  // 区外命中读数（§2.10.1）：与 `report` 面同一句形、同一位置（命中区之后、豁免块之前）；N = 0 时零出。
  if (stockHits.length) out.push(STOCK_LINE(stockHits.length))
  out.push(...exemptBlock(lay, exempted))
  out.push(...invalidExemptionBlock(lay, exemptInvalid))
  if (exemptStale > 0) out.push(EXEMPT_STALE(exemptStale))
  return out.join("\n")
}

/**
 * 跑一次文档纪律机检。
 * @param {string} root **声明根**（调用方给出的坐标系；相对 `docs` 条目按它解析，无 manifest 祖先的档也落它）。
 *   语义变了：它不再是整批共用的坐标系——每个档的判定根 = 该档自己的落点（§2.1）；
 *   缺省 ∥ 空串 ∥ 非字符串 ⇒ **整清单不判**（§2.4：`gate` 面 `ERROR（无法定根 N 档）`、`report` 面抛错）。
 * @param {{docs?:string[], mode?:'report'|'gate', docsSource?:'session'|'explicit', lines?:string[],
 *   texts?:Map<string,string>|Object<string,string>, zones?:Map<string,Array<{start:number,end:number}>>|Object<string,Array<{start:number,end:number}>>}} [o]
 *   `mode` 缺省 = `report`；`docs` = 被判档清单（相对 `root` 或绝对）——**必填**（两种问法同）：
 *   缺省 ∥ 非数组 ⇒ 报错要求显式清单（零遍历、零全域兜底）；`report` 面**空数组也报错**，`gate` 面空数组 ⇒
 *   不抛错、照出「0 档受检」实况与空范围说明，但首行判 `ERROR（0 档受检——空范围不判 PASS）`（判了 0 档读不成「全清」）；
 *   `report` 面不可判档 ⇒ 报错、整次零判定；
 *   `gate` 面不可判档 ⇒ 跳过行；`docsSource` = 范围来源标签（`session` = 本会话触达记账 ∥ `explicit` = 显式
 *   `docs`）——缺省 = `explicit`；只影响报面措辞。
 *   `lines` = 读数面清单（相对 `root` 或绝对；收任意在盘档）——**读数，不是判据**：
 *   把它给 `mode:"gate"` 是不支持的用法 ⇒ 开判之前抛错（静默忽略会让调用方以为量过）；
 *   `report` 面逐档出一行内容行数，并给源 / 单元测试档的尺寸档位标记。
 *   `texts` = **判定输入替换**（可选；键 = 档、值 = 该档本次完整新内容，相对 `root` 或绝对）：给了它，该档不再读盘，
 *   判定输入就是这份文本。它只换「读哪份字节」——三条判据 ∥ 四条抽取面 ∥ 解析序 ∥ 面判 ∥ 豁免谓词一字不改（§2.10.1 语义一）。
 *   `zones` = **归属区间表**（可选；键 = 档、值 = 该档的区间表，按改后档行号、闭区间；`start > end` = 宽度为零）：
 *   给了它，阻断集 = 命中行落在任一区内的那些；区外命中进 `stockHits`（读数桶，照列、不阻断）。
 *   它只改阻断集，不决定什么算命中（语义二）。**两个入参都缺席 ⇒ 与改前逐字相同**（交付面零回归，语义三）。
 *   某档交了 `zones` 却没有该档的区间表 ⇒ 整档即本次（fail-closed：不静默放过）；没有行号的仓级命中（`环引`）
 *   不按区间归属，照旧入闸。
 * @returns {{report:string, hits:{total:number, anchors:number, paragraph:number, lineRefs?:number}, anchorHits:Array,
 *   paragraphHits:Array, lineRefHits:Array, files:string[], checkFiles:string[], excluded:string[], paragraphMax:number,
 *   skipped:{missing:string[], notMarkdown:string[]}, unreadable:string[], lineReads:{file:string, lines:number, tier:'hard'|'soft'|null}[],
 *   lineRefs:{body:Array, fenced:Array, total:number, unreadable:string[]}, batchFaceRefs:number, projectRoots:string[],
 *   suffixHits:{file:string, line:number, token:string, abs:string}[], suffixBuilds:number,
 *   domainTables:{root:string, manifest:boolean}[], exempted:Array, exemptInvalid:Array, exemptStale:number,
 *   stockHits:Array}}
 *   `stockHits` = 区外命中（交了 `zones` 才有；与 `hits` 各自一桶——**不进 `hits`**、不改 verdict，两面报面各出一行 `STOCK_LINE`）。
 *   它的属主次序：豁免分类跑在前面（登记表的 `used` ∥ `登记未命中` 计数与四件报面都以全量命中为准），
 *   已裁定的进 `exempted`、余下的才分「区内 ∥ 区外」——两桶互斥，不重列同一条。
 *   `lineRefs` = 行号坐标的采集结果，**两个问法返回同一份**（同一次采集）。
 *   **每条命中携两格载荷**（`token` = 被拒的内容 ∥ `root` = 该命中的判定根）——拒文四件的「内容」与
 *   「解析根」两格读它（设计单源 = `docs/core/design/BATCH-RECORD.md` §4.22）；载荷不进 `hits`、不改 verdict。
 *   `projectRoots` = 参与判定的根（升序；§2.3）。**消费者只有两处**：报面的根清单行（≥2 根才出）与本批用例的断言。
 *   `cycleReads` = 判集未指向的成环事实（两问法同出读数行，不进 hits）；
 *   `domainTables` = 域表读数（§2.5：每组一根、按路径升序；`manifest` = 该根读到了 manifest）。
 *   **消费者只有两处**：`report` 面的域表读数块与本批用例的断言——不进 `hits`、不改 verdict（`gate` 面零改）。
 *   `batchFaceRefs` = 面判剔除的 token 数（批档面互引不判——读数，**不进 `hits`**、不改 verdict；只有 `report` 面报面出这一行）。
 *   `excluded` = 落在 manifest 排除面内、**未判**的档（§2.7；`checkFiles` 因此是**排除后**的清单，两者不重叠）。
 *   它既不是命中，也不是「不在盘」或「读不到」。**消费者只有两处**：报面的排除桶与用例断言。
 *   `suffixHits` = 第 6′ 步（唯一后缀兜底）解析出来的指针（逐处 `{file, line, token, abs}`——读数，**不进 `hits`**、不改 verdict；
 *   只有 `report` 面出读数块）；`suffixBuilds` = 后缀索引建表次数（同一行读数里的 `后缀索引建 N 次`）。
 *   **消费者只有两处**：`report` 面的后缀读数块与本批用例的断言——它是「这些指针为什么从 `档缺` 变绿」的唯一可查面。
 *   `exempted` = 已裁定假阳（§2.7：与 `skipped` ∥ `unreadable` ∥ `hits` 各自一桶——**不进 `hits`**、不改 verdict；
 *   两面报面各出一块）。`exemptInvalid` = 形态不对而不生效的登记条目（点名，不打断 manifest）；
 *   `exemptStale` = 这一轮一条都没对上的有效条目数（`登记未命中 N 条`）。**消费者 = 两面豁免块与用例断言。**
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
export function runDocCheck(root, { docs, mode = "report", docsSource, lines, texts, zones } = {}) {
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
  // 报告态空清单 = 报错（「没跑」不得装成「跑了且清」）；gate 面空清单不抛错——照出「0 档受检」实况 + 空范围说明，
  // 但首行判 `ERROR`：交付面「本轮一档没碰」是真实读数，照实说不等于判过（口径 = `docs/core/design/DOC-DISCIPLINE.md` §3.20）。
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
  // 两个入参在开判之前归一（形态错 ⇒ 抛，不静默降级）：`textOf` = 判定输入替换，`zoneTable` = 归属区间表。
  // 缺省那一路两个都是空形 —— `textOf` 恒 `undefined`（全读盘）、`zoneTable` = `null`（不切分阻断集）。
  const textOf = textLookupOf(base, texts)
  const zoneTable = zoneTableOf(base, zones)
  const range = resolveRange(base, docs, textOf)
  // 报告态 fail-closed：清单里有一个不可判档 ⇒ 报错点名、整次零判定——清单写错却报 0 命中就是「没跑」装成「跑了且清」。
  if (!gate && range.undecidable.length) {
    const named = range.undecidable.map((u) => `${rel(base, u.abs)}（${u.reason}）`).join(" ∥ ")
    throw new Error(`doc_check: docs names ${range.undecidable.length} document(s) that cannot be judged — no document was checked: ${named}. Fix the list and re-run; nothing is silently skipped and the check never widens beyond the list.`)
  }
  // 判集（§2.6）：排除面过滤在**分组之前**——过滤后的清单就是 `checkFiles`（三条判据与报面全吃它）。
  // `readOf` 的记忆体就是「一根一次读」的那一份：排除面与域表吃的是同一次 `readManifest`。
  const readOf = manifestReader()
  const { checkFiles, excluded } = splitExcluded(range.check, base, readOf)
  // 读数面：在判据之前算完——一个量不成的清单整次零读数（fail-closed），不产报面也不混进 hits
  const lineReads = lines === undefined ? [] : resolveLineReads(base, lines)
  const { paragraphMax, lineMax, paragraphExemptZones } = DOC_CHECK_BUILTINS
  // 判域（§2.2）：按档定根、逐组判——判法内部（抽取式 ∥ 解析序 ∥ 面判）一字不动，改的只是喂进去的根。
  // 单组不并组：结果与次序就是逐档一次的既有形（零回归 = 报面逐字相等的前提）。
  // 域表（§2.5 KD-7）：**每组只读一次 manifest**，锚判与批档基底都吃这一份（注入形——缺省自读支留给直调判法的夹具）；
  // 读不到 manifest（组根无档 ∥ 声明根是普通目录 ∥ 工作区）⇒ 空域表、向严判，不静默（读数面写明）。
  const groups = perRootGroups(checkFiles, base)
  // 生效扩展名清单（§2.6）：一根一份（与排除面 ∥ 域表同一次 `readManifest`）；逐档按自己的根取（一档一根）。
  const extsOfRoot = extsReader(readOf)
  const extsOfFile = (abs) => extsOfRoot(rootOf(abs, base))
  // 域表：每组吃 `readOf` 记忆的那一份（与排除面同一次读——一根一次，§2.5 KD-7 ∥ §2.6）。
  const domainTables = groups.map((g) => {
    const entry = readOf(g.root)
    return { root: g.root, ok: entry.ok, manifest: entry.res }
  })
  const perGroup = groups.map((g, i) => ({ root: g.root, res: checkAnchors(g.root, { files: g.files, manifest: domainTables[i].manifest, exts: extsOfRoot(g.root), textOf }) }))
  const anchors = groups.length === 1
    ? perGroup[0].res
    : mergeAnchors(perGroup, new Map(checkFiles.map((f, i) => [f, i])))
  const projectRoots = [...new Map(groups.map((g) => [pathKey(g.root), g.root])).values()].sort()
  const lay = reportLayout(base, projectRoots)
  const paragraphs = checkParagraphs({ paragraphMax, lineMax, exemptZones: paragraphExemptZones, files: checkFiles, textOf })

  // 行号坐标的**唯一采集点**：放在两支分支之前——`report` 与 `gate` 读出的是同一份结果，不各采一次
  // （同源判 = 两个问法的 `lineRefs.body` 逐字相等；一套萃取式，不是一套宽一套窄）。
  const lineRefs = collectLineRefs({ files: checkFiles, extsOf: extsOfFile, textOf })
  // 载荷格 `root`（**判据零改** · 设计单源 = `docs/core/design/BATCH-RECORD.md` §4.22「载荷两格」）：逐条命中补上
  // 「该档的判定根」——批次档门拼拒文四件时读它（引擎的 `✗` 行里根只在部分命中类出现）。与 §2.7 给
  // `paragraph.mjs` 加载荷字段 `text` 是同一处置：加一格载荷，不改抽取面、不改命中类、不改阈值、不改 verdict。
  // 就地把三份命中数组各补一次：`paragraphs` 是带 `unreadable` 属性的数组，换新数组会把那件读数丢掉。
  // `环引` 自带 `root`（= 该组根，同是该命中的判定根）⇒ 不覆盖。
  for (const h of [...anchors.hits, ...paragraphs, ...lineRefs.body]) {
    if (h.root === undefined) h.root = rootOf(h.file, base)
  }
  // 读面并集（三条判据各带清单）：同一个未读档可能出现多次（一档三面都读不到）⇒ 去重保序
  const unreadable = [...new Set([
    ...(anchors.unreadable ?? []),
    ...(paragraphs.unreadable ?? []),
    ...(lineRefs.unreadable ?? []),
  ])]
  // 逐条豁免（§2.7 · 三条判据都跑完之后、verdict 之前）：已登记的进 `exempted`（照列、不阻断），未登记留 `hits`（拦）。
  // 行号面的命中带 `clazz`（与既有 `lineRefHits` 同形），另外要交出整行原文（识别键的 `text`）。
  const split = classifyExemptions({
    anchorHits: anchors.hits,
    paragraphHits: [...paragraphs],
    lineRefHits: lineRefs.body.map((h) => ({ ...h, clazz: LINE_REF_CLASS })),
    base, roots: projectRoots, readOf,
  })
  const anchorHitsRaw = split.anchorHits
  const paragraphHitsRaw = split.paragraphHits
  const lineRefHitsRaw = split.lineRefHits
  // 判定区（§2.10.1 的 `zones`）：区内的命中 = 本次（照拦），区外的进 `stockHits` 读数桶（照列、不阻断）。
  // **属主次序 = 豁免分类跑在前面**（本次设计未定处，实现选向）：登记表的 `used` ∥ `登记未命中` 计数与四件报面
  // 都以**全量命中**为准——一条已裁定的假阳落到区外就变成「登记未命中」，而它并没有失效（§2.7）。
  // 两桶因此互斥：已裁定 > 存量，同一条不会在两处各列一次。
  // 没有行号的仓级命中（`环引`）不按区间归属：它不是档内的一行，本笔没写它也不等于它是存量（照旧入闸）。
  // 某档交了 `zones` 却没有该档的区间表 ⇒ 整档即本次（fail-closed：没交区间不等于没改）。
  const stockHits = []
  const inZone = (h) => {
    if (typeof h.line !== "number") return true
    const zs = zoneTable === null ? undefined : zoneTable.get(pathKey(h.file))
    if (zs === undefined) return true
    return zs.some((z) => h.line >= z.start && h.line <= z.end)
  }
  const partition = (list) => {
    if (zoneTable === null) return list
    const kept = []
    for (const h of list) (inZone(h) ? kept : stockHits).push(h)
    return kept
  }
  const anchorHitsKept = partition(anchorHitsRaw)
  const paragraphHitsKept = partition(paragraphHitsRaw)
  const lineRefHitsKept = partition(lineRefHitsRaw)
  // `gate` 的命中行与 `hits` 只吃未登记那批；`report` 的清账清单块仍列全量（清单 = 读数，不是判据）。
  const lineRefsKept = { ...lineRefs, body: lineRefHitsKept }
  const anchorCount = anchorHitsKept.length
  const paraCountAll = paragraphHitsKept.filter((h) => h.clazz === DOC_CLASS.para).length
  const lineCountAll = paragraphHitsKept.filter((h) => h.clazz === DOC_CLASS.line).length
  const shared = {
    anchorHits: anchorHitsKept, paragraphHits: paragraphHitsKept, files: checkFiles, checkFiles, paragraphMax,
    skipped: { missing: range.missing, notMarkdown: range.notMarkdown },
    // 排除面命中的档（**未判**族——不是命中、也不是「不在盘」/「读不到」；§2.6）。消费者 = 报面排除桶与用例断言。
    excluded,
    unreadable,
    lineReads,
    // 面判读数（批档面互引不判——**不是命中**：不进 `hits`、不改 verdict；与 `lineRefs` 同层靠读数消费面取）
    batchFaceRefs: anchors.batchRefs ?? 0,
    cycleReads: anchors.cycleReads ?? [],
    lineRefHits: lineRefHitsKept,
    lineRefs,
    // 已裁定假阳（§2.7）：与 `skipped` ∥ `unreadable` ∥ `hits` 各自一桶——消费面 = 两面豁免块与用例断言。
    // 不进 `hits`、不改 verdict；`invalid` ∥ `stale` 两个读数同层（登记失效与「一条都没对上」不是命中）。
    exempted: split.exempted,
    exemptInvalid: split.invalid,
    exemptStale: split.stale,
    // 区外命中（交了 `zones` 才有）：与 `hits` 各自一桶——不进 `hits`、不改 verdict，两面报面各出一行 `STOCK_LINE`。
    stockHits,
    // 后缀兜底（第 6′ 步）的两件读数：逐处的 `suffixHits`（不是命中）与建表次数。消费者 = `report` 面读数块与用例断言。
    suffixHits: anchors.suffixHits ?? [],
    suffixBuilds: anchors.suffixBuilds ?? 0,
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
    // 读不到列不计数但定判决词（`ERROR`）。**只数未登记的**（已裁定的进 `exempted`，§2.7 KD-X4），
    // 也**只数区内的**（区外的进 `stockHits`，§2.10.1）。
    const hits = { total: anchorCount + paragraphHitsKept.length + lineRefHitsKept.length, anchors: anchorCount, paragraph: paragraphHitsKept.length, lineRefs: lineRefHitsKept.length }
    return { ...shared, hits, report: gateReport({ lay, docsSource: source, checkFiles, skipped: shared.skipped, excluded, unreadable, anchors: { ...anchors, hits: anchorHitsKept }, paragraphs: paragraphHitsKept, lineRefs: lineRefsKept, cycleReads: anchors.cycleReads ?? [], exempted: split.exempted, exemptInvalid: split.invalid, exemptStale: split.stale, stockHits }) }
  }

  const hits = { total: anchorCount + paragraphHitsKept.length, anchors: anchorCount, paragraph: paragraphHitsKept.length }

  const out = [
    "文档纪律机检（报告态 · 非门禁）",
    `射程：${base} · 传入清单 ${checkFiles.length} 档 · 区带豁免：${paragraphExemptZones.length ? paragraphExemptZones.join(" ∥ ") : "无"}`,
    "声明：判据参数 = 工具内置常量；范围 = 传入文件（判定范围 = 解析范围）",
    `范围：传入清单 ${checkFiles.length} 档（整档入判 · 判定范围 = 解析范围）${rootsSuffix(lay)}`,
    `命中 ${hits.total} 条（锚 ${anchorCount} · ${DOC_CLASS.para} ${paraCountAll} · ${DOC_CLASS.line} ${lineCountAll}）`,
  ]
  for (const h of anchorHitsKept) out.push(anchorHitLine(lay, h))
  for (const w of paragraphHitsKept) out.push(paragraphHitLine(lay, w))
  if ((anchors.cycleReads ?? []).length) out.push(CYCLE_READ_LINE(anchors.cycleReads.length))
  // 排除桶（§2.6 · 与读面同处——两者都是「未判」）：位于命中区之后、读面行之前；不进 `hits`。
  // N = 0 时不出行 ⇒ 未声明该键的 manifest 上报面与改动前逐字相等。
  out.push(...bucketLines(lay, excluded, (n) => `排除 ${n} 档（manifest 排除面命中，未判）：`))
  // 读面：清单块之前单列一行点名（口径 = §3.20「读面」块——「没读成」不得与「干净」同形）
  out.push(...bucketLines(lay, unreadable, unreadableHead))
  // `未核` 列报：与读面同处（不当命中、也不当干净），行形单源 = `unverifiedBlock`
  out.push(...unverifiedBlock(lay, anchors.unverified))
  // 后缀兜底读数块（第 6′ 步 · 仅 `report` 面）：位置 = `未核` 之后、行数读数之前；0 处不出（没有这一支就没有可标的）
  out.push(...suffixBlock(shared.suffixHits, shared.suffixBuilds))
  // 读数块：位置 = 读面行之后、行号坐标清单块之前（末行恒是 `结论：…`；读数不抢它的位）
  if (lineReads.length) out.push(...lineReadBlock(base, lineReads))
  // 扩展名清单读数（§2.6 · 仅 `report` 面）：**只在该仓写了这一项时出**；不进 `hits`、不改 verdict；
  // 没写这一项的仓零出 ⇒ 单项目零回归面不破。N = 该仓写了几项（按字面数，不逐条点名）。
  for (const r of projectRoots) {
    const entry = readOf(r)
    const declared = entry.ok ? entry.res.manifest?.index?.docCheckExts : []
    const n = Array.isArray(declared) ? declared.length : 0
    if (n === 0) continue
    out.push(`${extListLine(n)}${projectRoots.length >= 2 ? `（${lay.name(r)}）` : ""}`)
  }
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
  // **清账清单吃全量**（含已裁定那几处）：它是读数不是判据——把已裁定的坐标从清单里抹掉，下一轮就没人知道那里还躺着一处。
  out.push(...lineRefsBlock({ base, files: checkFiles, refs: lineRefs }))
  // 区外命中读数（§2.10.1 · 仅交了 `zones` 才有行）：位置 = 命中区之后、豁免块之前，两面同形；
  // N = 0 时零出 ⇒ 未交 `zones` 的调用面（交付面）报面与改前逐字相等。
  if (stockHits.length) out.push(STOCK_LINE(stockHits.length))
  // 豁免块（§2.7 · 两问法同出）：位置 = 清账清单之后、末行 `结论：…` 之前；N = 0 时零出（零回归）。
  out.push(...exemptBlock(lay, split.exempted))
  out.push(...invalidExemptionBlock(lay, split.invalid))
  if (split.stale > 0) out.push(EXEMPT_STALE(split.stale))
  out.push(hits.total
    ? `结论：${hits.total} 条命中——报告态，不作拒执行的理由`
    : unreadable.length
      ? `结论：0 条命中（但有 ${unreadable.length} 档未判——见上方「读不到」行，不得读作已检）`
      // 「一档没判」只有读不到这一形：它不得说「均清」（那是假绿）。全清单被排除不属此列——免检放行、
      // 那几档等于通过 ⇒ 取既有均清句（§2.7 AC-X3 ①）。报告态另有不可判档时先抛错，故此处只剩「全排除」与「真干净」两读。
      // 已裁定非 0 时清句旁边要摆上它：一列已裁定条目旁边写着「均清」，读者会读成「这里什么都没有」（§2.7）。
      : `结论：0 条命中（锚 ∥ ${DOC_CLASS.para} ∥ ${DOC_CLASS.line} 均清）${split.exempted.length ? `；已裁定假阳 ${split.exempted.length} 条（见上，不阻断）` : ""}`)

  return { ...shared, hits, report: out.join("\n") }
}
