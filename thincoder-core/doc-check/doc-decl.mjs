/**
 * doc-check/doc-decl.mjs — **声明读取与判集过滤**族：一根一次读 `manifest`、排除面过滤、生效扩展名清单。
 *
 * 机制单源 = `docs/core/design/DOC-CHECK.md` §2.6（排除面 ∥ 扩展名清单）；本档只实现，不重述口径。
 * **为什么单独立档**：这一族只回答「这次判哪些档、按哪张清单判」，与判据本体（锚 ∥ 段 ∥ 行号坐标）之间
 * 只靠 `runDocCheck` 串联——排除面与清单都只是判集的输入，所以能整族搬走而不动判法一字
 * （分拆落点与验收 = 同档 §2.9.7）。
 *
 * 三件同源是这一族存在的理由：**排除面 ∥ 生效扩展名清单 ∥ 域表**读的是**同一份**声明，
 * 所以「一根一次读」的记忆体由调用方建、逐族注入——分两次读会让三者成为三个可分离的事实。
 */
import { normalizePathList } from "../declaration.mjs"
import { readManifest } from "../manifest.mjs"
import { DEFAULT_DOC_EXTS } from "./doc-tokens.mjs"
import { pathKey, rel, rootOf } from "./per-root.mjs"

/** **一根一次读**（§2.6 装配处）：按根记忆 `readManifest`——排除面的过滤与吃 `domainTables` 的是**同一次读**。
 *  两次读会让「排除面读到了什么」与「域表读到了什么」成为两个可分离的事实，而它们本就该是同一份声明。
 *  读不到 ∥ 读错 ⇒ `{ ok: false }`（向严：域表降级、排除面按空集，照判）。
 *  @returns {(root:string) => {ok:boolean, res:object}} */
export function manifestReader() {
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
export function excludeFaceOf(entry) {
  return entry.ok ? normalizePathList(entry.res.manifest?.index?.docCheckExcludePaths).map(pathKey) : []
}

/** 判集过滤（§2.6 生效坐标 · **分组之前**）：逐档按**该档自己的根**取其排除面，落在里面 ⇒ 不进可判集、记 `excluded`。
 *  命中语义 = 恰等 ∨ 后随 `/`（归一已吃掉尾斜杠，目录与单个档同写一式）；比较走 `pathKey`——
 *  Windows 上大小写写错的排除项会静默不生效，那正是本节要消的静默漏。
 *  口径写死一条路：过滤后的清单就是 `checkFiles`，**不另设 `judgedFiles` 这第二个名字**——否则
 *  「范围」行的档数 ∥ 「0 档受检」那一支 ∥ `hits` 口径各要重新指定吃谁，实现席只能猜。 */
export function splitExcluded(files, declaredBase, readOf) {
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
export function extsReader(readOf) {
  const memo = new Map()
  return (root) => {
    const key = pathKey(root)
    let list = memo.get(key)
    if (list === undefined) { list = effectiveExtsOf(readOf(root)); memo.set(key, list) }
    return list
  }
}