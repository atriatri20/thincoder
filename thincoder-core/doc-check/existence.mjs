/**
 * doc-check/existence.mjs — 判据 ③「悬空指针」：仓内档名在项目根下找不到，就报。
 *
 * 判据句单源 = `docs/core/design/DOC-CHECK.md` §3：**在项目根下找一次**——找到不报，找不到就报，路径原样带上。
 * 没有「腿序」、没有声明仓、没有豁免表：一句「仓内找一次」就够（§3 末段）。
 *
 * 「找到」认两形，有其一就算在：项目根下这个相对路径在盘；**或**仓内有**任一**档以这个 token 结尾。
 * **不判唯一**（用户 2026-11-12：「有就行，不要判唯一」）：仓里两份、三份同名档都算在——那是仓库的状态，
 * 不是引用的对错。判唯一会让同一条引用头一天通、次日仓里多一个同名档就变死，变的不是引用。
 *
 * 四条不报（每一条都是「不该在这里报」，不是宽容）：
 * - **仓外一律不看**（§4）：`../` 出仓 ∥ 绝对路径出仓 ∥ 别仓的档 ⇒ 跳过，一个字都不出。门不知道别的仓长什么样，
 *   报出来的都是噪音；真写错了是路径没写清，责任在人。
 * - **运行期状态目录不判**（§3 第三个例外）：`.thincoder/` 开头的 token ⇒ 跳过，一个字都不出。那是会话、记忆、
 *   临时件、运行期操作数的家，不是文档区；判它等于把工具自己的家当当成读者要翻的资料。
 *   这条跳过必须坐在**判据**这一侧：`pathIndexOf` 本来就不收 `.thincoder` 目录，索引里没有它，判据不跳就只有
 *   「找不到」这一条路可走（盘上真有的那几份由 `existsSync` 先认下），`.thincoder/advisor.md` 会被判成档缺。
 *   比对走 `pathKey`（与同档其余路径同一把尺）：`./` 前缀先剥、win32 折小写——一条前缀，不是字面串，
 *   更不是豁免表（没有文件名清单、没有逐条登记）。
 * - **在建的档不报**（§3 末段）：档名出现在某份在途批档 §2 机读清单里 ⇒ 不报——设计档写「这里要建一个档」时，
 *   那个档本来就还不存在；批档收口后清单跟着失效，同一路径立刻回到「找不到就报」。
 * - **批档整份不判悬空**（§3）：批档是**可整份删掉的执行记录**，不是导航——读者不会照着 §1–§6 去找档。
 *   它记的是「这一轮做了什么、发现了什么」，所以记录里出现一个不存在的档名是**发现**，不是指向空气；
 *   判它等于把「某份档不存在」这条发现本身拦在门外。设计档 ∥ 需求档 ∥ 标准档是给人查的，照判。
 */
import { existsSync, readFileSync, readdirSync } from "node:fs"
import { join, resolve } from "node:path"

import { machineListRowsOf, isBatchRecord, readBatchStatusLine } from "../agent-tools/batch-segment-vocab.mjs"
import { docRootPaths, readManifest } from "../manifest.mjs"
import { NAME_RE, isDocToken } from "./doc-tokens.mjs"
import { bodyLines } from "./paragraph.mjs"

/** 比较用的路径键：分隔符统一成 `/`，win32 折小写（盘上大小写不敏感）。 */
const pathKey = (p) => {
  const s = String(p ?? "").replace(/\\/g, "/").replace(/^\.\//, "")
  return process.platform === "win32" ? s.toLowerCase() : s
}

/** 仓内路径索引（**一次建成，逐 token 查表**）：元素 = 任一尾部路径段；在表里就是「在」，不记命中几处
 *  （不判唯一——见档头）。「找一次」就是这一张表——不是腿序：没有基根顺序、没有声明仓、
 *  没有引用方目录那一级。
 *  入参 `root` 须是已 `resolve` 的根（不带尾分隔符——本函数按它的长度切仓根相对路径）。
 *  读不到的子树不进索引 ⇒ 那里的档会被判档缺（误报方向，与「宁拦不放」一致）：今天不记未核标记。 */
export function pathIndexOf(root) {
  const seen = new Set()
  const walk = (dir) => {
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const e of entries) {
      if (e.name === "node_modules" || e.name === ".git" || e.name === ".thincoder") continue
      const p = join(dir, e.name)
      if (e.isDirectory()) { walk(p); continue }
      const rel = pathKey(p.slice(root.length + 1))
      const parts = rel.split("/")
      for (let i = 0; i < parts.length; i++) {
        const suf = parts.slice(i).join("/")
        seen.add(suf)
      }
    }
  }
  walk(root)
  return seen
}

/** 批档目录（在途批档的家与批档面）：manifest 声明了 `docRoot.batches` 就用它；显式 `null` = 本面无 ⇒ 空集；其余（缺键 ∥ 读不到 ∥ 空数组）按本仓约定 `docs/batches`。 */
export function batchDirs(root) {
  try {
    const man = readManifest(root)
    if (man?.ok) {
      const declared = man.manifest?.docRoot?.batches
      // 显式 `null` = 「本面无」（KD-M1-37 的合法哨兵）⇒ 本项目没有批档面，也不回落到约定目录。
      if (declared === null) return []
      const paths = docRootPaths(declared, root)
      if (Array.isArray(paths) && paths.length) return paths
    }
  } catch { /* 读不到声明面 ⇒ 走约定目录：判据不因声明面坏掉而停机 */ }
  return [join(root, "docs", "batches")]
}

/**
 * 这份档是不是**批档面**（落在 `batchDirs` 的任一根之下，子目录也算）：是 ⇒ 整份不判悬空（§3）。
 * 「批档根」与「在途批档的家」同取 `batchDirs` 一处——两个面各自的根若各算一份，同一个目录会在
 * 判据面与非判据面之间摇摆（多仓 / 自定义 `docRoot.batches` 时先摆）。
 * 面别只决定悬空判不判：段长 ∥ 行号坐标两判据对批档照旧生效。
 * @param {string} abs 被判档的绝对路径
 * @param {string} root 项目根
 * @returns {boolean}
 */
export function isBatchFace(abs, root) {
  const key = pathKey(resolve(abs))
  return batchDirs(resolve(root)).some((dir) => {
    const d = pathKey(dir)
    return key === d || key.startsWith(`${d}/`)
  })
}

/**
 * 在途批档 §2 机读清单的并集（**批量一次算，逐 token 查表**——不按 token 去扫目录）。
 * 「在途」= 批档 §1 状态行不是 `已收口`：豁免期正好等于那一批的生命期，不需要谁去维护它。
 * @param {string} root 项目根
 * @returns {Set<string>} 归一后的仓根相对路径
 */
export function plannedPathsOf(root) {
  const out = new Set()
  for (const dir of batchDirs(root)) {
    let names
    try { names = readdirSync(dir) } catch { continue }
    for (const name of names) {
      if (!name.toLowerCase().endsWith(".md")) continue
      let src
      try { src = readFileSync(join(dir, name), "utf8") } catch { continue }
      if (!isBatchRecord(src)) continue
      if (readBatchStatusLine(src) === "closed") continue
      for (const row of machineListRowsOf(src)) out.add(pathKey(row.path))
    }
  }
  return out
}

/** 该 token 是不是「别仓的档」：首段在项目根的**同级**下，且那里有 `PROJECT-MANIFEST.json`（另一个项目）。 */
function siblingProjectForm(token, root) {
  const first = String(token).split("/")[0]
  if (!first || first === "." || first === "..") return false
  return existsSync(join(root, "..", first, "PROJECT-MANIFEST.json"))
}

/**
 * 判据 ③：逐行找仓内档名，在项目根下找一次。
 * 候选 = **带目录段的档名**（`docs/x/y.md` 这种写法）：裸名没有可找的位置，判它只会把
 * 「本文档的邻居」全算成悬空（本仓设计档互引就是这么写的）。候选恒带目录段 ⇒ 档名豁免谓词在这一面
 * 不适用（`docNames` 对含 `/` 的 token 恒返回 null，豁免只免裸名）。
 * @param {string} text 档全文（调用方读好的，本档不读盘）
 * @param {{root:string, planned?:Set<string>, indexPath?:Set<string>}} o `root` = 项目根；
 *   `planned` = 在途批档清单并集；`indexPath` = 已建好的仓内路径索引（同一根跑多档时复用）
 * @returns {{line:number, token:string}[]}
 */
export function existenceHits(text, { root, planned = new Set(), indexPath = null } = {}) {
  const base = resolve(root)
  let index = indexPath
  const out = []
  for (const { no, text: l } of bodyLines(text)) {
    const re = new RegExp(NAME_RE.source, "gu")
    let m
    while ((m = re.exec(l)) !== null) {
      const token = m[1]
      if (!token.includes("/")) continue // 裸名：没有可找的位置，不判
      if (!isDocToken(token)) continue // 后缀不在档名清单内 ⇒ 不是档
      if (token.startsWith("../") || token.startsWith("/")) continue // 出仓形：不看
      if (pathKey(token).startsWith(".thincoder/")) continue // 运行期状态目录：不是文档区，一个字都不出（判据侧跳，不靠索引侧；`./` 与 win32 大小写同 `pathKey` 归一）
      if (existsSync(join(base, token))) continue // 找到 ⇒ 不报
      if (planned.has(pathKey(token))) continue // 在途批档 §2 清单上 ⇒ 在建，不报
      if (index === null) index = pathIndexOf(base)
      if (index.has(pathKey(token))) continue // 仓内有任一档以它结尾 ⇒ 在，不报（不判唯一）
      if (siblingProjectForm(token, base)) continue // 别仓的档：不看
      out.push({ line: no, token })
    }
  }
  return out
}
