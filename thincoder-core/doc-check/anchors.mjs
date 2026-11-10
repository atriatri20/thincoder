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
 * 花括号组形（`<前缀>{<名1>,<名2>[,…]}<后缀>.<扩展名>`）：抽取面的一支，展开成 N 个具体档名后**逐名**走同一解析序判存在性。
 *   它治的是「门看不见」这一类：`{` `,` `}` 都不在档 token 的字符类内，一个 token 指两件的形式既不红也不绿——**它不在判面里**。
 *   判决仍走现成的 `档缺`，判决词 ∥ 解析序 ∥ 豁免谓词 ∥ 阈值四样零改（**这是抽取面的 carve-out，不是判据本体的改动**）。
 *   命中行同时点名原花括号 token 与缺的那个展开名（`expanded`）——只报展开名，读者拿到的是一个他档里从没写过的名字；
 *   只报原 token，他看不出该改哪一处。三条不展开的形（取值枚举 ∥ 模板占位 ∥ 嵌套）见 `expandBraceToken` 的头注。
 *   提示词面另剥 CANON 操作数（面判据 = `./paragraph.mjs` 的 `isPromptFace`——按**整 token 边界**剥除后再抽，见 `CANON_OPERANDS`）。
 * 档 token 的两条腿 = **生效扩展名清单**（缺省 `DEFAULT_DOC_EXTS` ∪ 该档所属项目的 `index.docCheckExts`）**∧ 形分档**
 *   （判定 = `isDocToken`，与 `./line-refs.mjs` 的行号面同一组）：带目录段的 token 一族同判（代码路径同样入判——只认 `.md`
 *   时悬空的代码路径一条不报，读者按指针找不到实现）；**裸名须后缀落在文档名族 `BARE_NAME_EXTS` 内**，代码族裸名按散文
 *   提及处置（不解析、不判）。判据句单源 = `docs/core/design/DOC-CHECK.md` §2.10.3，清单那条腿 = §2.6。
 *   名字字符类走 Unicode 字母与数字（中文档名同样入判）。
 * 读面（读不到 ≠ 干净）：判据读取面遇到「档在盘但读不到」（权限 / 文件锁 / I/O 错）⇒ 记入返回值的 `unreadable` 清单，
 *   **不静默当零命中**；引擎并集上报、`gate` 面据此判 `ERROR`（口径 = 同档 §3.20「读面」块）。
 * 解析序（算法单源 = `../path-resolve.mjs` 的统一解析层，本档只声明本面参数）：**前两级基根**＝
 *   ① 仓根相对全路径 → ② 引用方档所在目录相对。零命中 ⇒ `档缺`，并**列同名候选**（「你是不是指这个」——
 *   候选只作提示，**不产命中档**：裸名仍不跨目录解析；那份同名索引只服务这条注解，判定与解析都不查它）。
 *   **这两级之后还有两条腿**（见下两段）：声明仓腿 ∥ 唯一后缀兜底——所以「零命中」在实践中还要过那两条腿才判 `档缺`。
 *   声明仓腿（`仓名/相对路径`）：**只有本面开**（`declaredRepos`）：已声明且声明根在本机 ⇒ 于该声明根判余段
 *   （在盘 `resolved` / 缺档 `档缺`）；已声明而声明根不在本机 ⇒ `unverified`（**零命中、列报不入闸**）；
 *   未声明 ⇒ `档缺` + 同级目录候选 + 一句「该名未在 `index.publicRepos` 声明」。口径单源 = `docs/core/design/PATH-RESOLUTION.md` §2.7。
 * 唯一后缀兜底（第 6′ 步）：**也只有本面开**（`suffixFallback`）——第 4–6 步全零命中时，token 在仓内文件树里按后缀恰一处
 *   命中就判解析到那一处，并在载荷标 `how:"suffix"`（逐处进 `suffixHits`，报面据此出读数与清账清单：唯一后缀证明「能定位」，
 *   不证明「是你想指的那个」，不标它就混进绿里）；多处 ∥ 零处仍判 `档缺`（零命中仍红是这条腿的反向控制）。
 *   口径单源 = 同档 §2.8。
 * 环检（`锚·环引`）：按组根走声明出边图（`../declared-repos.mjs`），走回组根成环；仅当判集 token 归一后的首段指向环上仓时入 `hits`，否则入 `cycleReads` 读数桶；
 *   走查在「声明根不在本机」的节点止步，那些节点进 `unverified`（触发 = 环走查止步）——「没找到环」与
 *   「没看过去」因此在报面上分得开。环与 `档缺` 同计「锚 N 条」，不新增判据条数、不新增 verdict 词。
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
 * 边旁挂面（**可选入参 `onEdge`** · 机制单源 = `docs/core/design/DOC-GRAPH.md` §2.6）：同一个逐行循环里顺手把
 *   「这一处引了谁」交出去，交给 `../doc-graph.mjs` 落成边。三条契约（实现不得自行放宽）：
 *   ① 调用点钉在**全部跳过谓词之后**（围栏 ∥ 码段区间 ∥ 花括号区间 ∥ 引文占位 ∥ 档名豁免 ∥ 扩展名清单 ∥ 面判）——
 *      与 `hits` 同一批 token，边与判定因此不会各说一套；② 回调**不得抛**：本档用 `try/catch` 包住每次调用，
 *      抛了只计数（`edgeCallbackErrors`），`hits` 与其余读数零改；③ 回调只增 `edgeCallbackErrors` 返回键，
 *      判定与环引指向集合都不依赖回调是否在场。
 *   三支新 token 家族（`cites-req` ∥ `mentions-case` ∥ `cites-symbol`，取形纯函数住 `./graph-tokens.mjs`）在
 *   **同一个 `forEach` 行体里**取形、**只喂回调、不进 `hits`**——它们是「引用关系」，不是判据；
 *   跑 `doc_check` 的人不该因为多了一套图而多出命中。`cites-symbol` 的取形面就是码段本身（`codeSpans`），
 *   故 `inSpan` 对它不成立（它抽的正是那里），其余跳过谓词照过。
 *   边的三态与本档判决词同源：`resolved` ⇒ `ok`；`dangling` ∥ `ambiguous` ∥ 节不在盘 ⇒ `目标不在盘`
 *   （边指的落点不在盘：整档在、那一节不在，同一个事实的两种粒度）；`unverified` ⇒ `判不了存在性`。
 */
import { readFileSync } from "node:fs"
import { dirname, join, posix, resolve } from "node:path"
import { batchDocBases, baseContaining } from "../agent-tools/batch-paths.mjs"
import { declaredCycles } from "../declared-repos.mjs"
import { MANIFEST_REL, docRootPaths, readManifest } from "../manifest.mjs"
import { createResolutionSession, resolvePathTarget } from "../path-resolve.mjs"
import { caseRefsOf, reqRefsOf, symbolRefsOf } from "./graph-tokens.mjs"
import { codeSpans, fenceMark, headingMark, isExecutableSpan, isFenceClose, isPromptFace } from "./paragraph.mjs"

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

/** 档 token 的**一对边界**（**一处定义、四处抽取式加剥除式同吃**——转导出面）：
 *  左界不接名字字符类 ∣ 路径分隔符 ∣ `@` ∣ `<>`（排除更长 token 的尾段）、右界不接字母数字
 *  （扩展名之后紧邻字母数字 ⇒ 非完整 token）。锚（`ANCHOR_RE`）∥ 花括号组 ∥ 依据行（`CITE_RE_SRC`）∥
 *  行号面（`./line-refs.mjs` 的 `NAME_RE`）与操作数剥除（`stripCanonOperands`）同取这一对。
 *  **四条抽取式与剥除式一律 `gu` 标志**：`\p{…}` 不带 `u` 是字面量 `p{…}`，整条式会静默变成另一种式；
 *  `u` 下过度的转义在模块求值时抛错（fail-loud 在载入面，比抽出错字好）。
 *  **收敛带来的一处行为差（如实）**：行号面的左界改用本对（含 `<>`）⇒ 名字前紧贴 `<` ∥ `>` 的 token 不再被抽，
 *  方向是漏报（§2.6「收敛带来的一处行为差」）。 */
export const TOKEN_LEFT_GUARD = "(?<![\\p{L}\\p{N}_.\\-\\\\/@<>])"
export const TOKEN_RIGHT_GUARD = "(?![\\p{L}\\p{N}_])"

/** 名字字符类（**一处定义，四条抽取式同吃**）：Unicode 字母与数字（含中日韩）+ 原 ASCII 符号集。
 *  空白与全角标点都不在内 ⇒ 中文句读 `。，、；：？！「」『』（）《》【】` 一律截断名字，既做不成名字的一段，
 *  也做不成扩展名的首字符（§2.6「为什么中文句读吞不进来」）。 */
export const NAME_CH = "[\\p{L}\\p{N}_.\\-]"

/** 扩展名的**形护**（判「这个后缀长得像不像后缀」；清单判「算不算本项目的档」——两道都过才是候选）：
 *  ASCII 点 + 首字符字母 + 长度 1–10 ⇒ `1.5` ∥ `v2.0` ∥ `192.168.1.1` 的候选扩展名首字符是数字，抽都抽不出来。
 *  形护进正则而不进谓词：抽出再丢会动归属窗——`1.5` 先被抽出再被丢掉，那一行里其余 token 的行号坐标归属跟着变（KD-R1）。 */
export const EXT_PART = "\\.[A-Za-z][A-Za-z0-9]{0,9}"

/** 缺省扩展名清单（**物理单源**；退役件 `DOC_EXTS` 的**改名 + 改值**——位置与消费面不变）：
 *  取形六条（§2.6）：改前认得的 12 项全留（扔掉即零回归面破）· F19 点名的五项（AC-17 钉在这几个后缀上）·
 *  真实文件类型补入 · 代码表达式 ∥ 字段访问的末段一律不进 · 单字符后缀不入（`.x` 是 `20.x/22.x` 的来源）·
 *  归档内层不入（`build/app.tar.gz` 的末段是 `gz`，不在清单 ⇒ 整串不当档名）。
 *  项目追加项 = `index.docCheckExts`（并集、只增不减）；装配处并集后过一次取形过滤，谓词只查那张已过滤的表。
 *  **为何定义住本档**：依赖方向是 `line-refs.mjs` → 本档（它已有 `docNameExemption` 要拿）；
 *  反方向（本档 import 行号面）会成环，且本档的 `ANCHOR_RE` 在模块求值时就要这份清单（环上的 TDZ）。 */
export const DEFAULT_DOC_EXTS = [
  // 改前认得的 12 项
  "md", "mjs", "cjs", "js", "json", "css", "html", "svg", "yml", "yaml", "sh", "ps1",
  // F19 点名的五项
  "py", "csv", "txt", "sql", "xml",
  // 真实文件类型补入（认对了而盘上没有 = 真悬空，照报；不与「认错了东西」混为一谈）
  "ts", "tsx", "jsx", "vue", "rb", "go", "rs", "java", "kt", "toml", "ini", "conf", "proto",
  "ico", "git", "db", "pem", "pub",
]

/** 扩展名是否落在清单内（**扩展名定义只此一处**——豁免谓词的词干判定与候选谓词同取它，§3.24 条目 X / F12 单源）：
 *  比较不折叠点、不分大小写（`JSON` 与 `json` 同项、`.md` 与 `md` 同项——书写面允许带前导点）。
 *  `exts` 缺省 = `DEFAULT_DOC_EXTS`（引擎装配好的生效清单由调用方传入）。 */
export function isExtension(ext, exts = DEFAULT_DOC_EXTS) {
  const e = String(ext ?? "").replace(/^\./, "").toLowerCase()
  if (e === "") return false
  return (exts ?? DEFAULT_DOC_EXTS).some((x) => String(x ?? "").trim().replace(/^\./, "").toLowerCase() === e)
}

/** 文档名族（**裸名可判的扩展名族** · 判据句单源 = `docs/core/design/DOC-CHECK.md` §2.10.3）：
 *  裸名（不带目录段）的 token 后缀落在这张表里才是候选；后缀只在代码族里 ⇒ 不是候选，按散文提及处置（不解析、不判）。
 *  **与生效清单不是一件事**：清单 `index.docCheckExts` 是后缀清单、不是族划分面——它追加进来的后缀在裸名位不成为候选；
 *  要按文档名族判，改这张表（走评审），不新增第二个可配面（`docs/core/design/DOC-DISCIPLINE.md` §3.20 F3「判据不分适用面」）。
 *  **带目录段的 token 不吃这张表**：路径本身给出了定位，代码族与文档名族在这一形上没有差别。 */
export const BARE_NAME_EXTS = Object.freeze(["md", "markdown"])

/** 候选谓词（**两条腿的判定落点** · 清单腿 = §2.6「清单落在哪一层」，形分档腿 = §2.10.3）：
 *  ① 后缀落在生效清单内（只看 token 末段最后一个点之后那一段，这一步不分有没有目录段）；
 *  ② 形分档：带目录段 ⇒ 候选，一族同判；裸名 ⇒ 后缀须落在文档名族 `BARE_NAME_EXTS` 内。
 *  **两条腿同坐一处**：锚 ∥ 花括号组 ∥ 依据行 ∥ 行号面四条分支都只调本谓词，不存在绕过形分档的第二条判路。
 *  清单由引擎按该档所属项目根装配好再传进来，本谓词只按字面查已过滤的表、不逐条列被挡下的 token
 *  （数量大，列出来正是真命中被淹没的成因）。 */
export function isDocToken(token, exts = DEFAULT_DOC_EXTS) {
  const raw = String(token ?? "")
  const base = raw.split("/").pop()
  const dot = base.lastIndexOf(".")
  if (dot <= 0 || dot === base.length - 1) return false
  if (!isExtension(base.slice(dot + 1), exts)) return false
  if (raw.includes("/")) return true
  return isExtension(base.slice(dot + 1), BARE_NAME_EXTS)
}

/** 文档指针 token：`(目录段/)*名<扩展名的形护>` + 可选行号坐标尾 + 可选节指示（`§` + 编号）——两界取自上面那一对；
 *  后缀算不算数由 `isDocToken` 在消费点判（形护在这里，清单在那里——两条各坐一处）。 */
const ANCHOR_RE = new RegExp(
  `${TOKEN_LEFT_GUARD}((?:${NAME_CH}+\\/)*${NAME_CH}+${EXT_PART})(?::\\d+(?:-\\d+)?)?(?:\\s*§\\s*(\\d+(?:\\.\\d+)*))?${TOKEN_RIGHT_GUARD}`,
  "gu",
)

/** 花括号组形的抽取式（判据见头注「花括号组形」条）：目录段照常、末段 = 前缀 `{` 成员 `,` 成员 `}` 后缀 `.` 扩展名。
 *  三支走不到的守卫**不写成判据**（写成判据就是给没人走的路修栅栏）：
 *  · 组内含 `/` ∥ `*`（取值枚举 `{ running / queued / done }`）——成员字符类（`NAME_CH`）本就不含这两个字符，匹配不上；
 *  · 成员 < 2（`${count}` ∥ `📁 {name}` 这类模板占位）——成员后的 `(?:,…)+` 必带一个逗号；
 *  · 嵌套形（`i18n-{zh,en}-{shell,me}.mjs`：后缀里再出现 `{`）——后缀位（`NAME_CH`）不含 `{`，外层匹配不成；
 *    内层组则由消费点那条「紧跟在 `}` 之后的那一组不展开」挡住（左界守卫放它过：`}` 不在排除类内）。
 *  嵌套那一形因此今天不入判、明天仍不入判——本支不假装治了它。 */
const BRACE_GROUP_RE = new RegExp(
  `${TOKEN_LEFT_GUARD}((?:${NAME_CH}+\\/)*${NAME_CH}*\\{${NAME_CH}+(?:,${NAME_CH}+)+\\}${NAME_CH}*${EXT_PART})${TOKEN_RIGHT_GUARD}`,
  "gu",
)

/** 展开：`<目录段…/>前缀{名1,名2[,…]}后缀` ⇒ N 个具体档名（目录段原样保留，只展开末段的组）。
 *  成员 < 2 ⇒ 原样返回一个 token（不是展开成 1 个——那会在报面上凭空多出一条与原文同名的命中）。 */
function expandBraceToken(token) {
  const segs = String(token).split("/")
  const base = segs.pop()
  const bi = base.indexOf("{")
  const ei = base.indexOf("}")
  if (bi < 0 || ei <= bi) return [String(token)] // 不可达（抽取式保证两符在盘）：保住纯函数前提，不在误用时造出假名
  const members = base.slice(bi + 1, ei).split(",")
  if (members.length < 2) return [String(token)] // 同上——单成员形在抽取式那层就匹配不上（`+` 后必带一个逗号）
  const prefix = base.slice(0, bi)
  const suffix = base.slice(ei + 1)
  return members.map((name) => [...segs, prefix + name + suffix].join("/"))
}

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
 *  扩展名族 = 生效扩展名清单（与行号坐标族同组，单源；后缀算不算数由 `isDocToken` 在消费点判）。
 *  **导出面说明**：源串导出只作**量法扫串的单一源**（改面单测档的「存量读数」用它，不再自建第二份字面）——
 *  生产行为不变，别处不去拼它。 */
export const CITE_RE_SRC = `依据\\s*[:：=]?\\s*\`?((?:${NAME_CH}+/)*${NAME_CH}+${EXT_PART})\`?[:：=]?「([^」]*)」`

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
 *   `"placeholder"` = 占位词干（按清单剥后缀后取词干——剥法单源 = `isExtension`；词干 ≤ 1 字符或命中占位表）；`null` = 不是豁免名
 */
export function docNameExemption(token) {
  const bn = String(token ?? "").replace(/\\/g, "/").toLowerCase()
  if (bn.includes("/")) return null // 带目录段 ⇒ 按真路径判（豁免只免裸名）
  if (FILENAME_CLASSES.has(bn)) return "filename-class"
  const dot = bn.lastIndexOf(".")
  const ext = dot > 0 ? bn.slice(dot + 1) : ""
  const stem = isExtension(ext) ? bn.slice(0, dot) : bn
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
  "gu",
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
 *  **同档一次读**：标题「编号 → 标题文本」映射按绝对路径记在 `cache` 里（一次调用内同一档只读一次——与引文面
 *  `citedTextReader` 同一窗口口径：文件不变，记与不记逐字同值；跨轮缓存照禁）。存文本是为边的 `dst_label`
 *  （节号漂了还认得出）——判定只读 `has`，映射的其余部分不参与判据。
 *  **读不到 ⇒ 记 unreadable**（不当「无该节」：把「没读成」报成 `节缺` 是指错方向），映射仍为空。 */
function sectionOnDisk(path, num, cache, unreadable) {
  let map = cache.get(path)
  if (!map) {
    map = new Map()
    for (const l of readText(path, unreadable).split("\n")) {
      const n = headingNumber(l)
      if (n !== null && !map.has(n)) map.set(n, (headingMark(l)?.text ?? "").trim())
    }
    cache.set(path, map)
  }
  return map.has(num)
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
 *  `kind:"file"` / `order:"root-first"`（与既有两级序逐字同序）/ `declaredRepos`（文档锚面是
 *  唯一开声明仓腿的面）/ `suffixFallback`（文档锚面同时是唯一开第 6′ 步的面，§2.8），
 *  `bases` = 无、`scanBases` = `docRoot` 各键（只喂同名候选提示），
 *  `session` = 本次调用建的那份解析会话（同名候选查表 ∥ 基根发现同轮记忆 ∥ 后缀索引——成本不随悬空 token 数增长）。
 *  行号坐标尾（`:N`）不参与档解析——抽取面已剥离坐标尾与节指示，token = 档路径（后缀在清单内）。
 *  `num` = 指针节号（`§` 后编号；无节指示 ⇒ null）——仅用于判定节在盘，不参与档解析。
 *  @returns {{state:string, ...}} 层的四态结果 */
function resolveDoc(token, refFile, base, scanBases, session) {
  return resolvePathTarget(base, token, { kind: "file", order: "root-first", referrer: refFile, declaredRepos: true, suffixFallback: true, scanBases, session })
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
 * @param {{files?:string[], manifest?:{ok:boolean, manifest?:object|null}, exts?:string[], textOf?:(abs:string)=>string|undefined, onEdge?:Function}} o `files` = **判定集兼解析集**（调用方传入的档清单——判定范围 = 解析范围，
 *   无目录遍历、无全域索引：清单外的档既不判也不参与解析）；
 *   `manifest` = **可选注入**——引擎按本根已读的那份（每根一次读，§2.5 KD-7），给了就吃它、
 *   缺省仍自读（直调判法本体的夹具零改）；它同时供 `docRoot` 扫描根与批档基底两处（判定面零改）；
 *   `exts` = **生效扩展名清单**（引擎按该根装配好的那张：缺省 ∪ 项目追加项，已过一次取形过滤，§2.6）——
 *   缺省 ∥ 空数组 ⇒ `DEFAULT_DOC_EXTS`（空清单会让全部 token 静默不成候选，那是假绿的方向，不接）；
 *   `textOf` = **判定输入替换**（`docs/core/design/DOC-CHECK.md` §2.10.1）：给这一档返回文本就不读盘，返回 `undefined`
 *   走既有读盘路。它只换「读哪份字节」，抽取面 ∥ 解析序 ∥ 命中类 ∥ 豁免谓词一字不改；
 *   它**不**替换被引目标档的读法（引文面 ∥ 节在盘仍读盘——那些读的是**别的**档）；
 *   `onEdge` = **可选回调**（边旁挂面，口径见头注）：每次一个 token 走完全部跳过谓词后调用一次，载荷 =
 *   `{kind, file, line, token, section, state, abs, sectionLabel, text}`（只读副本——拿不到 `hits`，改了也没人读）。
 *   缺席 ⇒ 返回对象不多一个键、判定面与读数面零改。
 * @returns {{hits:Array, unverified:Array, unreadable:string[], batchRefs:number, suffixHits:Array, suffixBuilds:number,
 *   edgeCallbackErrors?:number}} hits = 命中（`档缺` / `节缺` / `引缺` / `环引`——`档缺` 携 `sameName` 同名候选与声明仓四格，
 *   `引缺` 携 `quote` 引文原文与 `target` 命中的档，`环引` 携 `root` 与 `chain`）；
 *   `unverified` = "判得了仓名、判不了存在性"的列报（声明根不在本机——**零命中、不入闸**；两个产出方：
 *   `trigger:"pointer"` 的逐指针行 ∥ `trigger:"walk"` 的环走查止步节点——按声明根汇总在引擎面做）；
 *   `unreadable` = 在盘但读不到的档（判定集内 ∥ 判据要读的目标）——**不当命中、也不当干净**，由引擎并集上报；
 *   `batchRefs` = 面判剔除的 token 数（批档面互引不判——**不是命中**，不进 `hits`、不改 verdict）；
 *   `suffixHits` = 第 6′ 步解析出来的指针（逐处 `{file, line, token, abs}`）——**读数，不是命中**：同一条指针
 *   本来判 `档缺`，现在解析出了；它不是新增 ∥ 删掉的命中，而是「本来就该解析、只是写法与解析面不匹配」那一批的账；
 *   `suffixBuilds` = 后缀索引建表次数（读数 `后缀索引建 N 次`；同一次调用里恒 1）；
 *   `cycleReads` = 判集未指向的成环事实（只读数、不入 hits）；
 *   `edgeCallbackErrors` = 回调抛异常的次数（**只在给了 `onEdge` 时出现**）。
 *   回调抛了不算判据失败：`hits` 与其余读数零改，那一处边由调用方按读数自处（`doc_graph` 回执末行印数）。
 */
export function checkAnchors(root, { files = [], manifest, exts, textOf, onEdge } = {}) {
  const base = resolve(root)
  // 生效扩展名清单（§2.6）：引擎按本根装配好传进来（并集 + 取形过滤已做过）；直调判法本体的夹具不传 ⇒ 缺省清单。
  // **空数组不是「什么都判不了」**：它是上游装配失败的一种形态，那样会让全部 token 静默不成候选（假绿）——向严回缺省。
  const extList = Array.isArray(exts) && exts.length > 0 ? exts : DEFAULT_DOC_EXTS
  const scanBases = docRootBaseKeys(base, manifest)
  const hits = []
  const unverified = []
  const unreadable = [] // 读面（读不到 ≠ 干净）：档在盘但读不到 ⇒ 入此清单
  const suffixHits = [] // 第 6′ 步解析出来的指针（逐处；`report` 面据此出读数行与按 token 去重的清账清单）
  const citedTextOf = citedTextReader(unreadable) // 引文面：目标档全文（同档一次读、同轮缓存）
  const session = createResolutionSession() // 解析会话：一次调用建一份（同名候选查表 ∥ 基根发现同轮记忆）
  const resolveToken = docResolver(base, scanBases, session) // 解析面同轮记忆（引用方目录 ∥ token）
  const face = batchFaceContext(base, manifest) // 面判上下文（批档基底根）——一次调用建一份（吃注入的 manifest）
  let batchRefs = 0 // 面判剔除的 token 数（读数：不进 `hits`、不改 verdict；`report` 面据此出一行留痕）
  const sectionCache = new Map() // 节在盘：标题号 → 标题文本（按绝对路径记忆，同档一次读；文本供边的 `dst_label`）
  // 环引入闸只问判集实际抽到的 token；`onEdge` 缺席时这张集合照记。
  const citedTokens = new Set()
  let edgeCallbackErrors = 0
  const emit = (edge) => {
    if (edge.kind === "cites") citedTokens.add(edge.token)
    if (typeof onEdge !== "function") return
    try { onEdge(edge) } catch { edgeCallbackErrors++ }
  }
  // 环走查仍按组根执行；成环事实先入读数桶，待判集扫描完后按指向决定是否入 hits。
  const cycles = declaredCycles(base)
  const cycleReads = []
  for (const s of cycles.stopped) unverified.push({ declaredRepo: s.name, declaredRoot: s.root, declarationEntry: s.entry, trigger: "walk" })
  /** `档缺` 两处产出点共用一形（路径线 ∥ 依据行——同一 token 不得两套载荷）。 */
  const danglingHit = (file, line, token, r) => ({
    file, line, token, clazz: "档缺",
    missing: r.state === "dangling" ? r.missing : "",
    sameName: r.state === "dangling" ? r.sameName : [],
    ...(r.state === "dangling"
      ? { suffixCandidates: r.suffixCandidates, declaredRepo: r.declaredRepo, declaredRoot: r.declaredRoot, rootOnDisk: r.rootOnDisk, siblingRepos: r.siblingRepos }
      : {}),
  })
  for (const f of files) {
    // 读面：给了这一档的文本就不读盘（判定输入替换，`docs/core/design/DOC-CHECK.md` §2.10.1）；没给 ⇒ 既有读盘路。
    const given = typeof textOf === "function" ? textOf(f) : undefined
    const text = given !== undefined ? given : readText(f, unreadable) // 读不到 ⇒ 入 unreadable，不再静默当零命中
    const re = new RegExp(ANCHOR_RE.source, "gu") // 每档一份实例（零共享 lastIndex 状态）
    const citeRe = new RegExp(CITE_RE_SRC, "gu") // 同上（引文标记面）
    const braceRe = new RegExp(BRACE_GROUP_RE.source, "gu") // 同上（花括号组形）
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
      const spans = codeSpans(scan).filter(isExecutableSpan)
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
          // 清单谓词（§2.6）：后缀不在生效清单内 ⇒ 不是候选（与锚 ∥ 花括号 ∥ 行号面四处同形判断）
          if (!isDocToken(token, extList)) continue
          const start = c.index + c[0].indexOf(token)
          cited.push({ start, end: start + token.length })
          // 面判（批档面互引不判）：与锚分支同判——同一 token 不得一面判一面不判。区间已占 ⇒ 锚面不再重报。
          if (isBatchFaceRef(f, token, face)) { batchRefs++; continue }
          const r = resolveToken(token, f)
          if (r.state === "unverified") {
            unverified.push({ file: f, line: i + 1, token, trigger: "pointer", ...r }) // 判不了存在性：列报，不入闸（同锚面）
            emit({ kind: "cites", file: f, line: i + 1, token, section: null, state: "判不了存在性", abs: null, sectionLabel: null, text: l })
            continue
          }
          if (r.state !== "resolved") { // 路径先判存在性——两因不混（路径错 ⇒ `档缺`，引文错 ⇒ `引缺`）
            hits.push(danglingHit(f, i + 1, token, r))
            // 边照落（AC-6）：目标不在盘也是一个事实，静默丢弃正好丢掉「这档没了但还有人在引它」那个信号。
            emit({ kind: "cites", file: f, line: i + 1, token, section: null, state: "目标不在盘", abs: null, sectionLabel: null, text: l })
            continue
          }
          if (r.how === "suffix") suffixHits.push({ file: f, line: i + 1, token, abs: r.abs })
          emit({ kind: "cites", file: f, line: i + 1, token, section: null, state: "ok", abs: r.abs, sectionLabel: null, text: l })
          // 引文面：只判「是不是该档里的一段连续子串」——不折叠空白、不换全半角、不换算大小写（§3.25 边界）
          if (!citedTextOf(r.abs).includes(quote)) hits.push({ file: f, line: i + 1, token, clazz: "引缺", quote, target: r.abs })
        }
      }
      // ── 花括号组形：先占区间、再逐名解析（抽取面的一支）。
      //    **为什么先占区间**：组的尾段会自成一条 token——`i18n-{zh,en}-core.mjs` 的 `-core.mjs` 左界是 `}`，
      //    而 `}` 不在左界守卫的排除类内 ⇒ 锚面会把那个尾段当成一个独立指针，一处写成两件报出两条，
      //    其中一条的名字读者从没写过（且即使展开名全在盘，那一处仍会因尾段而判红）。组占的区间因此交给本支，锚面不再重报。
      const braceGroups = []
      let braceMatch
      while ((braceMatch = braceRe.exec(scan)) !== null) {
        if (inSpan(braceMatch.index)) continue // 码段内的组形不抽（与锚面同面）
        if (scan[braceMatch.index - 1] === "}") continue // 嵌套形的内层组：外面还有一层，展开也定位不到（见抽取式头注）
        braceGroups.push({ token: braceMatch[1], start: braceMatch.index, end: braceMatch.index + braceMatch[0].length })
      }
      const inBrace = (at) => braceGroups.some((g) => at >= g.start && at < g.end)
      let m
      while ((m = re.exec(scan)) !== null) {
        if (inSpan(m.index)) continue // 码段内的 token 不抽（命令 / 搜索模式串保字面）
        if (inBrace(m.index)) continue // 花括号组的尾段不归锚面（上面已占区间——一处写成两件只算一处）
        const token = m[1]
        if (cited.some((c) => m.index >= c.start && m.index < c.end)) continue // 该 token 归引文判（上面已判，不重报）
        const num = m[2] ?? null
        // 类名 ∥ 占位符两免：抽取面不把它们当指针（判据 = DOC-DISCIPLINE §3.24 条目 X——
        // 判定只此一处，兄弟脚本与行号坐标清单消费同一谓词；**入参是 token 本身**，带目录段者不豁免）
        if (docNameExemption(token) !== null) continue
        // 清单谓词（§2.6）：形护过了还要过这一道——`JSON.parse` ∥ `20.x` 这类裸名在清单外 ⇒ 不是候选
        if (!isDocToken(token, extList)) continue
        // 面判（批档面互引不判 · §3.29 条目 AC）：引用方与目标同在批档基底根下 ⇒ 不解析、不判，只计数。
        if (isBatchFaceRef(f, token, face)) { batchRefs++; continue }
        const r = resolveToken(token, f)
        if (r.state === "unverified") {
          unverified.push({ file: f, line: i + 1, token, trigger: "pointer", ...r }) // 判不了存在性：列报，不入闸
          emit({ kind: "cites", file: f, line: i + 1, token, section: num, state: "判不了存在性", abs: null, sectionLabel: null, text: l })
          continue
        }
        if (r.state !== "resolved") {
          hits.push(danglingHit(f, i + 1, token, r))
          emit({ kind: "cites", file: f, line: i + 1, token, section: num, state: "目标不在盘", abs: null, sectionLabel: null, text: l })
          continue
        }
        if (r.how === "suffix") suffixHits.push({ file: f, line: i + 1, token, abs: r.abs })
        const sectionPresent = num === null || sectionOnDisk(r.abs, num, sectionCache, unreadable)
        if (!sectionPresent) hits.push({ file: f, line: i + 1, token, clazz: "节缺", section: num, target: r.abs })
        // 边照落：`节缺` 的落点也「不在盘」——整档在、那一节不在，是同一个事实的另一种粒度（头注三态）。
        emit({
          kind: "cites", file: f, line: i + 1, token, section: num,
          state: sectionPresent ? "ok" : "目标不在盘",
          abs: r.abs,
          sectionLabel: num === null ? null : (sectionCache.get(r.abs)?.get(num) ?? null),
          text: l,
        })
      }
      // 花括号组形逐名判（区间已在上方占下）：展开成具体名后走**同一**解析序（复用 `resolveToken`，不新增第二套解析）；
      // 每个解不到的展开名出一条 `档缺`，携 `expanded`——报面据此同时点名原 token 与缺的那个名字。
      // 判决词 ∥ 解析序 ∥ 豁免谓词 ∥ 阈值四样零改：本支只让抽取面看见一个此前看不见的形。
      for (const group of braceGroups) {
        // 组形的后缀与展开名同一段（末段之后那一段）⇒ 组 token 过一次谓词就够；不过就不展开（与锚面同尺）。
        if (!isDocToken(group.token, extList)) continue
        for (const name of expandBraceToken(group.token)) {
          if (docNameExemption(name) !== null) continue // 类名 ∥ 占位两免与锚面同判（同一 token 不得两套口径）
          if (isBatchFaceRef(f, name, face)) { batchRefs++; continue } // 面判同判（与锚 ∥ 依据两条分支同一谓词）
          const r = resolveToken(name, f)
          if (r.state === "unverified") {
            unverified.push({ file: f, line: i + 1, token: group.token, trigger: "pointer", ...r })
            emit({ kind: "cites", file: f, line: i + 1, token: group.token, expanded: name, section: null, state: "判不了存在性", abs: null, sectionLabel: null, text: l })
            continue
          }
          // 第 6′ 步解出来的也记读数：与锚分支同一口径（**不标就混进绿里**）——`i18n-{zh,en}-core.mjs` 这类真实形
          // 展开后往往只剩后缀腿可解，不记的话同一 token 写成裸名有清账行、写成组形却是无读数的一格绿。
          if (r.how === "suffix") suffixHits.push({ file: f, line: i + 1, token: group.token, abs: r.abs })
          if (r.state !== "resolved") hits.push({ ...danglingHit(f, i + 1, group.token, r), expanded: name })
          emit({
            kind: "cites", file: f, line: i + 1, token: group.token, expanded: name, section: null,
            state: r.state === "resolved" ? "ok" : "目标不在盘",
            abs: r.state === "resolved" ? r.abs : null,
            sectionLabel: null,
            text: l,
          })
        }
      }
      // ── 三支新 token 家族（`cites-req` ∥ `mentions-case` ∥ `cites-symbol`）：**只喂回调、不进 `hits`**。
      //    取形纯函数住 `./graph-tokens.mjs`（不在这里写第二份正则）；解析面不参与——这三族的 `state`
      //    一律「判不了存在性」（符号不是档、用例号要另一张清单、需求编号全仓唯一假设），不冒充 `ok`。
      //    位置 = 全部跳过谓词之后（围栏已 return、码段区间与花括号区间已算好）：`F16` ∥ `CLI 41-1` 写在
      //    表格行 ∥ 散文行的反引号里照抽（可执行行只跳码段区间那一条对它同样成立）；
      //    `cites-symbol` 例外——它的取形面**就是码段本身**，故不吃 `inSpan`。
      for (const t of reqRefsOf(scan)) {
        if (inSpan(t.start)) continue
        emit({ kind: "cites-req", file: f, line: i + 1, token: t.token, section: null, state: "判不了存在性", abs: null, sectionLabel: null, text: l })
      }
      for (const t of caseRefsOf(scan)) {
        if (inSpan(t.start)) continue
        emit({ kind: "mentions-case", file: f, line: i + 1, token: t.token, section: null, state: "判不了存在性", abs: null, sectionLabel: null, text: l })
      }
      for (const t of symbolRefsOf(scan)) {
        emit({ kind: "cites-symbol", file: f, line: i + 1, token: t.token, section: null, state: "判不了存在性", abs: null, sectionLabel: null, text: l })
      }
    })
  }
  const firstRepoSegment = (token) => {
    const normalized = posix.normalize(String(token).replace(/\\/g, "/")).replace(/^(?:\.\.?\/)+/, "")
    return normalized.split("/")[0]
  }
  for (const c of cycles.cycles) {
    const hit = { file: join(base, MANIFEST_REL), line: null, clazz: "环引", root: base, chain: c.names.join(" → ") }
    const names = new Set(c.names)
    if ([...citedTokens].some((token) => names.has(firstRepoSegment(token)))) hits.push(hit)
    else cycleReads.push(hit)
  }
  const out = { hits, unverified, unreadable, batchRefs, suffixHits, suffixBuilds: session.suffixBuilds(), cycleReads }
  return typeof onEdge === "function" ? { ...out, edgeCallbackErrors } : out
}
