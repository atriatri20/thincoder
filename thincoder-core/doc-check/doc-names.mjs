/**
 * doc-check/doc-names.mjs — **档名豁免与 CANON 操作数**族：哪些「看起来像档名」的名字**不算指针**。
 *
 * 判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.24 条目 X（档名豁免）∥ `docs/core/design/PROMPT-SYSTEM.md` §6.6
 * 「判保留面」（操作数）；本档只实现，不重述口径。
 * **为什么单独立档**：这一族与识别面（`./doc-tokens.mjs` 的「哪些 token 算候选」）是同一层的两条腿——
 * 一条说「这个后缀算本项目的档」，另一条说「这个名字不是指针」；判定件（解析序 ∥ 节在盘 ∥ 环走查）不因它而变。
 * `./anchors.mjs` 再导出本档 ⇒ `./line-refs.mjs` 与 `scripts/prompt-refs-check.mjs` 的 import 行零改。
 */
import { TOKEN_LEFT_GUARD, TOKEN_RIGHT_GUARD, isExtension } from "./doc-tokens.mjs"

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

/**
 * 档名豁免判定（**唯一一处** · 判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.24 条目 X）：
 * 三处消费同一个谓词——锚判（`./anchors.mjs`）∥ `scripts/prompt-refs-check.mjs`（J1 ∥ J3 命中过滤）∥ 行号坐标清单（`./line-refs.mjs`）。
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