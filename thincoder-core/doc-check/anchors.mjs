/**
 * doc-check/anchors.mjs — 文档纪律机检 · 起步判据 ①（锚）：指针抽取 + 解析序 + 节在盘判定。
 *
 * 判据句单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20 判据 ①（本节只实现，不重述口径）：
 * · 文档指针 = 档 token（含 `.md`，可带目录段）± 节指示（紧随 `§` + 编号 N / N.M / N.M.K）；
 *   **行号坐标（`:N`）不作节指示**——行号不作引用；
 * · 档不在盘 ⇒ `档缺`；带节指示 ∧ 节不在盘 ⇒ `节缺`。
 * · 依据行（`依据 <档路径>「<逐字引文>」`——口径单源 = 同档 §3.25 条目 Y）：路径面走**同一解析序**，
 *   引文面要求「目标档全文里的一段连续子串」——不是 ⇒ `引缺`。不构成标记的行不判；不新增判据条数、
 *   不新增 verdict 词（三个命中类同计「锚 N 条」）。
 *
 * 抽取面：逐行扫；fenced 块整块跳过；可执行行**只跳码段区间**（`codeSpans` 切出的那几段不抽——命令 / 搜索模式串保字面），
 *   **码段外照抽照判**。旧式整行跳过：一行里只要有一处命令形码段，同行的真指针一条不报（实读：整行 0 条；去掉码段 1 条 `档缺`）——
 *   这道豁免给自己的理由本来就限在码段之内，把码段外的散文一并放过是没有理由的那一半（口径 = 同档 §3.20「抽取面」块）。
 *   提示词面另剥 CANON 操作数（面判据 = `./paragraph.mjs` 的 `isPromptFace`——按**整 token 边界**剥除后再抽，见 `CANON_OPERANDS`）。
 * 档 token 的扩展名闭集 = `DOC_EXTS`（与 `./line-refs.mjs` 的行号面同一组）：代码路径同样入判——只认 `.md` 时
 *   悬空的代码路径一条不报，读者按指针找不到实现（§3.20「扩展名闭集」条）。
 * 读面（读不到 ≠ 干净）：判据读取面遇到「档在盘但读不到」（权限 / 文件锁 / I/O 错）⇒ 记入返回值的 `unreadable` 清单，
 *   **不静默当零命中**；引擎并集上报、`gate` 面据此判 `ERROR`（口径 = 同档 §3.20「读面」块）。
 * 解析序**两级**（算法单源 = `../path-resolve.mjs` 的统一解析层，本档只声明本面参数）：
 *   ① 仓根相对全路径 → ② 引用方档所在目录相对。零命中 ⇒ `档缺`，并**列同名候选**（「你是不是指这个」——
 *   候选只作提示，**不产命中档**：裸名仍不跨目录解析；那份同名索引只服务这条注解，判定与解析都不查它）。
 *   跨仓形（`仓名/相对路径`）⇒ **零命中**，回执记一行（声明源引用 / 须先声明——只判引用写对没有，不查存在性）。
 * 节在盘：**只读解析命中的那一档**（点查，不遍历）——目标档内存在标题行，其标题编号
 *   （标题谓词单源 = `headingMark`，取标题文本首个 `\d+(?:\.\d+)*`）= 指针节号。
 * 同轮记忆（一次调用内，跨轮缓存照禁——§3.20「缓存口径」）：解析会话一份（同名索引 + 基根发现）、
 *   解析结果按（引用方目录 ∥ token）、标题号集合按绝对路径、引文面目标档全文——四处同一窗口口径。
 * 残余登记（fail-open 方向——归评审核验面）：未闭合围栏 ⇒ 至档尾免；指针行的坐标尾不入判、同行的档 token 照判；
 *  **引文含 `」` 时只抽到第一个 `」`**（抽取段是 `[^」]`）——逐字引用一段内含「…」的句子时被验的只是前缀，
 *  错的后半段静默放行（方向是不误拦，不是不误放；这一半的最终裁定归评审核验面，同设计 §3.25「评审面」）。
 * 档名豁免（类名 ∥ 占位词干）的**判定只此一处** = 本档导出的 `docNameExemption`（判据单源 = §3.24 条目 X）：
 *   两张表保持私有、不上导出面；另两处消费面（兄弟脚本 ∥ 行号坐标清单）只拿判定、拿不到名单。
 *   **豁免只免裸名**：入参 = 写出来的那个 token（可含目录段）——带目录段的 token 一律按真路径判
 *   （§3.24「入参契约」；旧式按末段名判，真档 `tools/file.mjs` 会被当成示例整类放过）。
 * 面判（批档面互引不判 · 判据单源 = 同档 §3.29 条目 AC）：一个 token 判之前先过 `isBatchFaceRef`——
 *   引用方档与目标路径**同在**一个批档基底根下（`batchDocBases`：声明面 ∪ 缺省回退 `docs/batches`）⇒ 该 token 不判：
 *   不进 `hits`、不读目标档、不计 `unreadable`，只计 `batchRefs`。目标按**拼路径**判（不等解析结果——要治的正是
 *   目标已删那一形）。两处消费同判：锚分支 ∥ 依据行分支。
 *   方向纪律：规范档引批档**照判**——引用方不在批档根下 ⇒ 面判不成立（D4 细则二的最后一道机检）。
 */
import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { batchDocBases, baseContaining } from "../agent-tools/batch-paths.mjs"
import { docRootPaths, readManifest } from "../manifest.mjs"
import { createResolutionSession, resolvePathTarget } from "../path-resolve.mjs"
import { codeSpans, fenceMark, headingMark, isFenceClose, isExecutableLine, isPromptFace } from "./paragraph.mjs"

/** `docRoot` 各键 → 绝对根集（**只作同名候选的扫描根**，不作受理边界——受理面仍是「档在盘 / 节在盘」）。
 *  读声明面单源 = `docRootPaths`（本档零自持根判定）；无 manifest / 非法 ⇒ 空集。
 *  **注入形**：`manifest` 给了就吃它（引擎按组根已读的那份——每根一次读），缺省仍自读。 */
function docRootBaseKeys(root, manifest) {
  let man = { ok: false }
  try { man = manifest ?? readManifest(root) } catch { return [] }
  if (!man.ok) return []
  const docRoot = man.manifest?.docRoot
  if (!docRoot || typeof docRoot !== "object") return []
  const out = []
  for (const key of Object.keys(docRoot)) for (const abs of docRootPaths(docRoot[key], root)) if (!out.includes(abs)) out.push(abs)
  return out
}

/** 档 token 的**一对边界**（**一处定义、两处消费**）：左界不接 `[A-Za-z0-9_.\-\\/@<>]`（排除更长 token 的尾段）、
 *  右界不接 `[\w]`（`.md` 之后紧邻字母数字 ⇒ 非完整 token）。锚抽取（`ANCHOR_RE`）与操作数剥除
 *  （`stripCanonOperands`）同取这一对——两处各写一份边界，剥除面与抽取面就会漂：路径形操作数的末段名被当
 *  独立操作数删掉、前缀留下来不再构成 token（漏报方向；口径 = §3.20「剥除面 = 整 token 边界」）。 */
const TOKEN_LEFT_GUARD = "(?<![A-Za-z0-9_.\\-\\\\/@<>])"
const TOKEN_RIGHT_GUARD = "(?![\\w])"

/** 扩展名闭集（档名后缀族——**物理单源**）：谓词按这一组剥后缀取词干，锚抽取的档 token 也按这一组认
 *  （代码路径同判——§3.20「扩展名闭集」条），行号面（`./line-refs.mjs`）的 `NAME_RE` 从本处 import 拼出。
 *  **为何定义住本档**：依赖方向是 `line-refs.mjs` → 本档（它已有 `docNameExemption` 要拿）；
 *  反方向（本档 import 行号面）会成环，且本档的 `ANCHOR_RE` 在模块求值时就要这组枚举（环上的 TDZ）。
 *  ⇒ 位置与设计写的「单源 = 行号面的抽取式」不同：**枚举值同源，物理住所只有一个**，两者不得各持一份字面。 */
export const DOC_EXTS = ["md", "mjs", "cjs", "js", "json", "css", "html", "svg", "yml", "yaml", "sh", "ps1"]

/** 文档指针 token：`(目录段/)*名.<闭集内一个后缀>` + 可选行号坐标尾 + 可选节指示（`§` + 编号）——两界取自上面那一对。 */
const ANCHOR_RE = new RegExp(
  `${TOKEN_LEFT_GUARD}((?:[A-Za-z0-9_.\\-]+\\/)*[A-Za-z0-9_.\\-]+\\.(?:${DOC_EXTS.join("|")}))(?::\\d+(?:-\\d+)?)?(?:\\s*§\\s*(\\d+(?:\\.\\d+)*))?${TOKEN_RIGHT_GUARD}`,
  "g",
)

/** 约定文件名（**类名**——文档在描述「会读哪些文件」、黑名单名字、`files` 字段值、测试数据）：不抽。
 *  依据 = 这些名字在仓根 / 兄弟目录不一定存在，它们指的不是「某个仓内档」。 */
const FILENAME_CLASSES = new Set([
  "agents.md", "claude.md", "skill.md", "project_rules.md",
  "changelog.md", "agent.md", "advisor.md", "todo.md", "todo-archive.md",
])

/** 占位符词干（示例写法 / 反例样本——`X.md` / `file.md` / `docs/batches/x.md` 类）：不抽。 */
const PLACEHOLDER_STEMS = new Set([
  "x", "a", "b", "file", "out", "foo", "bar", "example", "sample", "name", "path",
])

/** 依据行标记（口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.25 条目 Y「写法」表）：
 *  `依据` + 可选分隔符（`:` ∥ `：` ∥ `=`）+ 档路径（可带反引号）+ `「引文」`。
 *  「相邻」行 = 路径 token 与 `「` 之间**只允许分隔符与反引号**——夹进别的字符（散文词 ∥ 标点 ∥ 空白）
 *  就**不构成标记**，不判：讲写法的档里本就有「`依据` = 判据契约（…）＋用户裁定「…」」这类散文句，
 *  松判会把它们读成标记形，而批档恒在收口判域，一次假命中就拦一次合法收口。
 *  （`依据` 与路径之间、以及那个分隔符是否带空白不限——那一段不是判据要防的那一处。）
 *  扩展名族 = `DOC_EXTS`（与行号坐标族同组，单源）。
 *  **导出面说明**：源串导出只作**量法扫串的单一源**（改面单测档的「存量读数」用它，不再自建第二份字面）——
 *  生产行为不变，别处不去拼它。 */
export const CITE_RE_SRC = `依据\\s*[:：=]?\\s*\`?((?:[A-Za-z0-9_.\\-]+/)*[A-Za-z0-9_.\\-]+\\.(?:${DOC_EXTS.join("|")}))\`?[:：=]?「([^」]*)」`

/** 读档（**读面单源**：读不成 ⇒ 记入 `unreadable` 清单、返回空串——「没读成」不得与「干净」同形，
 *  口径 = 同档 §3.20「读面」块）；`unreadable` 缺省 ⇒ 不记（调用方还没接这一面）。 */
function readText(abs, unreadable) {
  try { return readFileSync(abs, "utf8") } catch {
    if (Array.isArray(unreadable) && !unreadable.includes(abs)) unreadable.push(abs)
    return ""
  }
}

/** 引文面的目标档读法（**同档一次读、同轮缓存**；CRLF→LF 归一——比较基准的形态单源）。 */
function citedTextReader(unreadable) {
  const cache = new Map()
  return (abs) => {
    if (!cache.has(abs)) cache.set(abs, readText(abs, unreadable).replace(/\r\n/g, "\n"))
    return cache.get(abs)
  }
}

/**
 * 档名豁免判定（**唯一一处** · 判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.24 条目 X）：
 * 三处消费同一个谓词——锚判（本档）∥ `scripts/prompt-refs-check.mjs`（J1 ∥ J3 命中过滤）∥ 行号坐标清单（`./line-refs.mjs`）。
 * **入参 = 写出来的那个 token**（可含目录段），大小写不敏感。**豁免只免裸名**：带目录段的 token 一律按真路径判
 * （`docs/batches/x.md` 不是示例；`tools/file.mjs` 是真档，不能因末段名 `file` 落占位表而整类放过）——
 * 旧式按末段名判（消费面各自 `basename`）就是「真档被当示例」那条漏报的口子。
 * @param {string} token 写出来的档 token（裸名 ∥ `目录段/名`）
 * @returns {null|"filename-class"|"placeholder"} `"filename-class"` = 约定的类名（整名判，不剥后缀）；
 *   `"placeholder"` = 占位词干（按闭集剥后缀后取词干，词干 ≤ 1 字符或命中占位表）；`null` = 不是豁免名
 */
export function docNameExemption(token) {
  const bn = String(token ?? "").replace(/\\/g, "/").toLowerCase()
  if (bn.includes("/")) return null // 带目录段 ⇒ 按真路径判（豁免只免裸名）
  if (FILENAME_CLASSES.has(bn)) return "filename-class"
  const dot = bn.lastIndexOf(".")
  const ext = dot > 0 ? bn.slice(dot + 1) : ""
  const stem = DOC_EXTS.includes(ext) ? bn.slice(0, dot) : bn
  if (stem.length <= 1 || PLACEHOLDER_STEMS.has(stem)) return "placeholder"
  return null
}

/** CANON 操作数族（**规范豁免串** · 判据单源 = `docs/core/design/PROMPT-SYSTEM.md` §6.6「判保留面」）：
 *  七个名字在模型面是**模型要写出来 / 读写的文件名**（行为操作数 · 路径操作数），不是「去读这个档」的指针——
 *  换个目录解析必然 `档缺`。**只对提示词面剥**（面判据 = `isPromptFace`，单源住 `./paragraph.mjs`）：`docs/` 面不会因本条多放行一个名——
 *  `README.md` / `MANIFEST.md` / `RTM.md` / `.thincoder/advisor.md` 在那里仍按指针判（其余三名早已走 `FILENAME_CLASSES` 类名免，
 *  非本条引入；末名带目录段 ⇒ 类名免够不到它——免的是裸名，口径 = `docs/core/design/DOC-DISCIPLINE.md` §3.24「入参契约」）。
 *  **一处定义、两处消费**：`scripts/prompt-refs-check.mjs` 的 J3 豁免从本档 import 本表与剥除函数（不复制）；
 *  反方向零 import——判据链自持 = `docs/core/design/DOC-DISCIPLINE.md` A-DD29 ⑤（`thincoder-core/**` 对
 *  `scripts/**` 的 import 点 = 0）。闭集外的同形 token（非操作数）照报。 */
export const CANON_OPERANDS = [
  "AGENTS.md", "SKILL.md", "README.md", "MANIFEST.md",
  ".thincoder/advisor.md", "project_rules.md",
  "RTM.md",
]

/** 操作数剥除：提示词面逐行先删 `CANON_OPERANDS` 的**整 token** 再抽（与 `scripts/prompt-refs-check.mjs` 的 J3 豁免同式）。
 *  **剥除面 = 整 token 边界**（与锚抽取共用同一对边界）：只有左右界都成立的操作数名才被吞——名字只是更长 token
 *  的尾段（`test/RTM.md` 里的末段名）⇒ **不剥**，该指针照常抽出、照常判存在性。
 *  改前是子串整串删除（`out.split(s).join("")`）：路径前缀留下、末段名被吃，剩下的半截不构成 token，
 *  该指针在提示词面**不被判**（漏报方向）。 */
const OPERAND_STRIP_RES = CANON_OPERANDS.map((name) => new RegExp(
  `${TOKEN_LEFT_GUARD}${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${TOKEN_RIGHT_GUARD}`,
  "g",
))

export function stripCanonOperands(line) {
  let out = String(line)
  for (const re of OPERAND_STRIP_RES) out = out.replace(re, "")
  return out
}

/** 操作数豁免的**作用面** = 提示词面（`thincoder-core/prompts/**`）——**只此一面**：`docs/` 面同名 token 仍按指针判
 *  （`README.md` / `MANIFEST.md` / `RTM.md` / `.thincoder/advisor.md` 在那里照按指针判——解析不到即 `档缺`；其余三名走既有的
 *  `FILENAME_CLASSES` 类名免，非本条引入）。
 *  这是锚判自己的面判据——与段判据零共享开关：段判据按传入档全量判（提示词面照判——逐行裸判，无面级豁免）。 */
// 提示词面判据单源 = `./paragraph.mjs` 的 `isPromptFace`（§3.18 ②——形态与旧 `OPERAND_FACE` 逐字同）。
const isOperandFace = isPromptFace

/** 标题编号（标题文本里的首个 `\d+(?:\.\d+)*`）；非标题行 ⇒ null。
 *  标题谓词单源 = `./paragraph.mjs` 的 `headingMark`（本档不再自持一份「什么算标题」的正则）。 */
function headingNumber(line) {
  const h = headingMark(line)
  if (!h) return null
  const n = /\d+(?:\.\d+)*/.exec(h.text)
  return n ? n[0] : null
}

/** 节在盘：目标档内任一标题行的编号 = 指针节号（字符串逐字等值——两处同归一形）。
 *  **同档一次读**：标题号集合按绝对路径记在 `cache` 里（一次调用内同一档只读一次——与引文面 `citedTextReader`
 *  同一窗口口径：文件不变，记与不记逐字同值；跨轮缓存照禁）。**读不到 ⇒ 记 unreadable**（不当「无该节」：
 *  把「没读成」报成 `节缺` 是指错方向），集合仍为空。 */
function sectionOnDisk(path, num, cache, unreadable) {
  let set = cache.get(path)
  if (!set) {
    set = new Set()
    for (const l of readText(path, unreadable).split("\n")) {
      const n = headingNumber(l)
      if (n !== null) set.add(n)
    }
    cache.set(path, set)
  }
  return set.has(num)
}

/** 批档面（面判）上下文：基底根单源 = `batchDocBases`（声明面 ∪ 缺省回退 `docs/batches`，恒非空）。
 *  读不到声明面 ∥ 该根不在盘都不抛错——空面只会让引用**照判**（fail-closed 方向，不静默放宽）。
 *  一次调用建一份：基底根不随 token 变，逐 token 读 manifest 是白读。
 *  **注入形**：`manifest` 给了 ⇒ 传进 `batchDocBases`（引擎按组根已读的那份，每根一次读）——
 *  它同时判「工作区并合」那支：组根恒是项目根 ∥ 声明根，注入即短路 workspaceCandidates 的重扫。 */
function batchFaceContext(root, manifest) {
  let bases
  try { bases = batchDocBases(root, { manifest }) } catch { bases = [] }
  return { root, bases: Array.isArray(bases) ? bases : [] }
}

/** `abs` 落在的那个基底根（不落任何基底根 ⇒ null）——判定单源 = `../agent-tools/batch-paths.mjs` 的
 *  `baseContaining`（与 create 面的越基底判据同一实现，本档不另持一份）。 */
const baseOf = (bases, abs) => baseContaining(abs, bases)

/** 目标路径候选（**先拼后判**，不等解析结果——目标已删时等 `resolved.abs` 就永远走不到面判）：
 *  `..` / `.` 与 `\` 先归一；① `<项目根>/<token>` 对任何 token 都拼；
 *  ② `<引用方档所在目录>/<token>` **只对不带目录段的裸名成立**——带目录段的 token 拼上引用方目录
 *  恒落在批档根下，面判会变成「批档指到哪都不算」（越界照判与集成行 `7-6` 的改写同时落空）。 */
function batchFaceTargets(root, refAbs, token) {
  const norm = String(token).replace(/\\/g, "/").split("/").filter((s) => s !== "" && s !== ".").join("/")
  const targets = [resolve(root, norm)]
  if (!norm.includes("/")) targets.push(resolve(dirname(refAbs), norm))
  return targets
}

/**
 * 面判谓词（**唯一一处** · 判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.29 条目 AC）：
 * 引用方档在同一批档基底根下 ∧ 目标路径也在同一基底根下 ⇒ **该 token 不判**（不进 `hits`、不读目标档、
 * 不计 `unreadable`，只计 `batchRefs`）。**方向纪律照判**：规范档引批档时引用方不在批档根下 ⇒ 恒 false。
 * @param {string} refAbs 引用方档绝对路径
 * @param {string} token 写出来的档 token（裸名 ∥ `目录段/名`）
 * @param {{root:string, bases:string[]}} face `batchFaceContext` 的返回值（一次调用建一份）
 * @returns {boolean} 面判成立 ⇒ 调用方跳过该 token（不解析、不判）
 */
export function isBatchFaceRef(refAbs, token, face) {
  if (!refAbs || !face || !Array.isArray(face.bases) || face.bases.length === 0) return false
  // 判据句要求的是「**同一**批档基底根」：先定引用方落在哪一根，再要求目标也落**这一根**（两端各落各根不算）
  const refBase = baseOf(face.bases, refAbs)
  if (refBase === null) return false // 引用方不在批档面 ⇒ 面判不成立（规范档引批档照判）
  return batchFaceTargets(face.root, refAbs, token).some((t) => baseOf(face.bases, t) === refBase)
}

/** 档解析（判据 ① 的解析序两级——**算法单源 = 统一解析层** `../path-resolve.mjs`：本面只声明
 *  `kind:"file"` / `order:"root-first"`（与既有两级序逐字同序）/ `crossRepo:"visible"`（文档锚面是
 *  唯一开跨仓读数的面），`bases` = 无、`scanBases` = `docRoot` 各键（只喂同名候选提示），
 *  `session` = 本次调用建的那份解析会话（同名候选查表 ∥ 基根发现同轮记忆——成本不随悬空 token 数增长）。
 *  行号坐标尾（`:N`）不参与档解析——抽取面已剥离坐标尾与节指示，token = 档路径（后缀在闭集内）。
 *  `num` = 指针节号（`§` 后编号；无节指示 ⇒ null）——仅用于判定节在盘，不参与档解析。
 *  @returns {{state:string, ...}} 层的四态结果 */
function resolveDoc(token, refFile, base, scanBases, session) {
  return resolvePathTarget(base, token, { kind: "file", order: "root-first", referrer: refFile, crossRepo: "visible", scanBases, session })
}

/** 解析结果的**同轮记忆**（键 = 引用方目录 ∥ token）：解析只依赖「基根 + 引用方目录 + token」——同一目录下
 *  同一 token 再判一次是同一答案，而这次调用里文件不会变（跨轮缓存照禁，口径 = §3.20「缓存口径」）。 */
function docResolver(base, scanBases, session) {
  const cache = new Map()
  return (token, refFile) => {
    const key = `${dirname(refFile)}\u0000${token}`
    let r = cache.get(key)
    if (r === undefined) {
      r = resolveDoc(token, refFile, base, scanBases, session)
      cache.set(key, r)
    }
    return r
  }
}

/**
 * 锚判据主行程：传入档逐档逐行抽取 + 解析 + 节在盘判定。
 * @param {string} root 项目根（解析序 ① 的基准）
 * @param {{files?:string[], manifest?:{ok:boolean, manifest?:object|null}}} o `files` = **判定集兼解析集**（调用方传入的档清单——判定范围 = 解析范围，
 *   无目录遍历、无全域索引：清单外的档既不判也不参与解析）；
 *   `manifest` = **可选注入**——引擎按本根已读的那份（每根一次读，§2.5 KD-7），给了就吃它、
 *   缺省仍自读（直调判法本体的夹具零改）；它同时供 `docRoot` 扫描根与批档基底两处（判定面零改）
 * @returns {{hits:Array, crossRepo:Array, unreadable:string[], batchRefs:number}} hits = 命中（`档缺` / `节缺` / `引缺`——`档缺` 携 `sameName` 同名候选，
 *   `引缺` 携 `quote` 引文原文与 `target` 命中的档）；
 *   `crossRepo` = 跨仓引用读数（零命中、只入回执——§2.6 一行）；
 *   `unreadable` = 在盘但读不到的档（判定集内 ∥ 判据要读的目标）——**不当命中、也不当干净**，由引擎并集上报；
 *   `batchRefs` = 面判剔除的 token 数（批档面互引不判——**不是命中**，不进 `hits`、不改 verdict）
 */
export function checkAnchors(root, { files = [], manifest } = {}) {
  const base = resolve(root)
  const scanBases = docRootBaseKeys(base, manifest)
  const hits = []
  const crossRepo = []
  const unreadable = [] // 读面（读不到 ≠ 干净）：档在盘但读不到 ⇒ 入此清单
  const citedTextOf = citedTextReader(unreadable) // 引文面：目标档全文（同档一次读、同轮缓存）
  const session = createResolutionSession() // 解析会话：一次调用建一份（同名候选查表 ∥ 基根发现同轮记忆）
  const resolveToken = docResolver(base, scanBases, session) // 解析面同轮记忆（引用方目录 ∥ token）
  const face = batchFaceContext(base, manifest) // 面判上下文（批档基底根）——一次调用建一份（吃注入的 manifest）
  let batchRefs = 0 // 面判剔除的 token 数（读数：不进 `hits`、不改 verdict；`report` 面据此出一行留痕）
  const sectionCache = new Map() // 节在盘：标题号集合按绝对路径记忆（同档一次读）
  for (const f of files) {
    const text = readText(f, unreadable) // 读不到 ⇒ 入 unreadable，不再静默当零命中
    const re = new RegExp(ANCHOR_RE.source, "g") // 每档一份实例（零共享 lastIndex 状态）
    const citeRe = new RegExp(CITE_RE_SRC, "g") // 同上（引文标记面）
    const stripOperands = isOperandFace(f) // 只有提示词面剥（面判据 = `isPromptFace`）
    let fence = null // 围栏标记（` ∥ ~）；null = 不在块内
    text.split("\n").forEach((l, i) => {
      const mark = fenceMark(l)
      if (mark !== null) { // 围栏块整块跳过：起于围栏行、止于同形围栏行（未闭合 ⇒ 至档尾免）
        if (fence === null) fence = mark
        else if (isFenceClose(mark, fence)) fence = null
        return
      }
      if (fence !== null) return
      // 可执行行**只跳码段区间**：码段内的 token 不抽（命令 / 搜索模式串保字面），码段外照抽照判。
      // 旧式 `if (isExecutableLine(l)) return` —— 一行里有一处命令形码段，同行的真指针一条不报（漏报方向）。
      const scan = stripOperands ? stripCanonOperands(l) : l // 提示词面：操作数先剥再抽；文档面 = 原行
      // **区间与位置取同一个字符串**：剥除会删字符、位置整体前移，拿原行的区间去比剥除后的下标，码段之后的
      // 真指针会被当成「在码段内」而不抽（漏报），反方向则把命令字面量当指针（假阳）。⇒ 一律按 `scan` 切。
      const spans = isExecutableLine(scan) ? codeSpans(scan) : []
      const inSpan = (at) => spans.some((s) => at >= s.start && at < s.end)
      // ── 依据行（§3.25 条目 Y）：一行多处各自判；路径 token 的区间要记下来——锚抽取得跳过它，
      //    否则一个解析不到的档路径会被两条判法各报一次（同一处缺陷两条命中）。
      //    **标记先成立才占区间**：空引文 ∥ 豁免名两条不构成「引文判的标记」——它们的 token
      //    仍归锚面照常判（既有类零改）：空引文那行里的悬空档名照旧 `档缺`，不会凭空消失。
      const cited = []
      if (scan.includes("依据")) {
        let c
        while ((c = citeRe.exec(scan)) !== null) {
          if (inSpan(c.index)) continue // 标记落在码段内（命令保字面——与锚面同面）
          const token = c[1]
          const quote = c[2].trim()
          if (quote === "") continue // `「」` 空引文不构成标记（§3.25 边界：没有第二分支）
          // 豁免名（类名 ∥ 占位）在锚面不抽 ⇒ 引文面同判：同一 token 不得两套口径（§3.24 条目 X / F12 单源）
          if (docNameExemption(token) !== null) continue
          const start = c.index + c[0].indexOf(token)
          cited.push({ start, end: start + token.length })
          // 面判（批档面互引不判）：与锚分支同判——同一 token 不得一面判一面不判。区间已占 ⇒ 锚面不再重报。
          if (isBatchFaceRef(f, token, face)) { batchRefs++; continue }
          const r = resolveToken(token, f)
          if (r.state === "crossRepo") { crossRepo.push({ file: f, line: i + 1, token, ...r }); continue } // 跨仓：零命中，回执一行（同锚面）
          if (r.state !== "resolved") { // 路径先判存在性——两因不混（路径错 ⇒ `档缺`，引文错 ⇒ `引缺`）
            hits.push({ file: f, line: i + 1, token, clazz: "档缺", missing: r.state === "dangling" ? r.missing : "", sameName: r.state === "dangling" ? r.sameName : [] })
            continue
          }
          // 引文面：只判「是不是该档里的一段连续子串」——不折叠空白、不换全半角、不换算大小写（§3.25 边界）
          if (!citedTextOf(r.abs).includes(quote)) hits.push({ file: f, line: i + 1, token, clazz: "引缺", quote, target: r.abs })
        }
      }
      let m
      while ((m = re.exec(scan)) !== null) {
        if (inSpan(m.index)) continue // 码段内的 token 不抽（命令 / 搜索模式串保字面）
        const token = m[1]
        if (cited.some((c) => m.index >= c.start && m.index < c.end)) continue // 该 token 归引文判（上面已判，不重报）
        const num = m[2] ?? null
        // 类名 ∥ 占位符两免：抽取面不把它们当指针（判据 = DOC-DISCIPLINE §3.24 条目 X——
        // 判定只此一处，兄弟脚本与行号坐标清单消费同一谓词；**入参是 token 本身**，带目录段者不豁免）
        if (docNameExemption(token) !== null) continue
        // 面判（批档面互引不判 · §3.29 条目 AC）：引用方与目标同在批档基底根下 ⇒ 不解析、不判，只计数。
        if (isBatchFaceRef(f, token, face)) { batchRefs++; continue }
        const r = resolveToken(token, f)
        if (r.state === "crossRepo") { crossRepo.push({ file: f, line: i + 1, token, ...r }); continue } // 跨仓：零命中，回执一行
        if (r.state !== "resolved") {
          hits.push({ file: f, line: i + 1, token, clazz: "档缺", missing: r.state === "dangling" ? r.missing : "", sameName: r.state === "dangling" ? r.sameName : [] })
          continue
        }
        if (num !== null && !sectionOnDisk(r.abs, num, sectionCache, unreadable)) hits.push({ file: f, line: i + 1, token, clazz: "节缺", section: num, target: r.abs })
      }
    })
  }
  return { hits, crossRepo, unreadable, batchRefs }
}
