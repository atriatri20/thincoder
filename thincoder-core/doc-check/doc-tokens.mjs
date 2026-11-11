/**
 * doc-check/doc-tokens.mjs — **识别面一族**：档名 / 扩展名的常量、谓词与三条抽取式的拼装。
 *
 * 机制单源 = `docs/core/design/DOC-CHECK.md` §2.6（判据句与取形六条住那一节，本档只实现，不重述）。
 * **为什么单独立档**：这一族是「哪些 token 算候选」的唯一落点，判据面（解析序 ∥ 节在盘 ∥ 环走查 ∥ 豁免谓词）
 * 住 `./anchors.mjs`；两族之间只通过本档的导出相接，所以它能整族搬走而不动判法一字。
 * `anchors.mjs` 再导出本档的导出面 ⇒ 既有消费面（`./line-refs.mjs` ∥ `./graph-tokens.mjs` ∥
 * `thincoder-core/doc-check/index.mjs` ∥ `scripts/prompt-refs-check.mjs`）的 import 行零改。
 *
 * 叶档：只 import `node:*`（无内部依赖——`ANCHOR_RE` 在模块求值时就要这份常量，反向 import 会成环）。
 */
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
 *  项目追加项 = `index.docCheckExts`（并集、只增不减）；装配处并集后过一次取形过滤，谓词只查那张已过滤的表。 */
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
export const ANCHOR_RE = new RegExp(
  `${TOKEN_LEFT_GUARD}((?:${NAME_CH}+\\/)*${NAME_CH}+${EXT_PART})(?::\\d+(?:-\\d+)?)?(?:\\s*§\\s*(\\d+(?:\\.\\d+)*))?${TOKEN_RIGHT_GUARD}`,
  "gu",
)

/** 花括号组形的抽取式（判据见 `./anchors.mjs` 头注「花括号组形」条）：目录段照常、末段 = 前缀 `{` 成员 `,` 成员 `}` 后缀 `.` 扩展名。
 *  三支走不到的守卫**不写成判据**（写成判据就是给没人走的路修栅栏）：
 *  · 组内含 `/` ∥ `*`（取值枚举 `{ running / queued / done }`）——成员字符类（`NAME_CH`）本就不含这两个字符，匹配不上；
 *  · 成员 < 2（`${count}` ∥ `📁 {name}` 这类模板占位）——成员后的 `(?:,…)+` 必带一个逗号；
 *  · 嵌套形（`i18n-{zh,en}-{shell,me}.mjs`：后缀里再出现 `{`）——后缀位（`NAME_CH`）不含 `{`，外层匹配不成；
 *    内层组则由消费点那条「紧跟在 `}` 之后的那一组不展开」挡住（左界守卫放它过：`}` 不在排除类内）。
 *  嵌套那一形因此今天不入判、明天仍不入判——本支不假装治了它。 */
export const BRACE_GROUP_RE = new RegExp(
  `${TOKEN_LEFT_GUARD}((?:${NAME_CH}+\\/)*${NAME_CH}*\\{${NAME_CH}+(?:,${NAME_CH}+)+\\}${NAME_CH}*${EXT_PART})${TOKEN_RIGHT_GUARD}`,
  "gu",
)

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