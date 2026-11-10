/**
 * doc-check/per-root.mjs — 判域族：定根 ∥ 分组 ∥ 报面路径形 ∥ 无声明根的逐档点名。
 *
 * **为什么单独立档**：机制接缝单源 = `docs/core/design/DOC-CHECK.md` §4。这一族与判据本体（`./anchors.mjs` ∥
 * `./paragraph.mjs` ∥ `./line-refs.mjs`，以及引擎里的命中行与读数块）之间只靠 `runDocCheck` 串联，
 * 判法内部不因分组而改（§2.2）——所以它能整族搬走，**判据面留原档**。`./index.mjs` 越过 800 行硬限后
 * （档位读数口径 = `docs/core/design/DOC-DISCIPLINE.md` §3.10：越硬限 = 必须拆），本档就是那条接缝的落地件。
 *
 * 分工：`declaredRoot` = 声明根（§2.4）· `rootOf` 按档定根（§2.1）· `perRootGroups` 按根分组（§2.2）·
 * `reportLayout` ∥ `rootsSuffix` ∥ `bucketLines` 报面路径形与清单行（§2.3）· `noRootItems` 无声明根时的逐档点名。
 * 路径原语 `rel` ∥ `pathKey` 随族同来：它们是这一族与 §2.6 判集过滤共用的最小面，各写一份必然漂。
 */
import { basename, isAbsolute, parse, relative, resolve } from "node:path"
// 取根判据本体（转口单源 = `thincoder-core/manifest.mjs`；判据式见 `rootOf`）。
import { owningProject } from "../manifest.mjs"

/** 相对路径显示形（正斜杠——跨平台同形）。 */
export const rel = (root, p) => relative(root, p).replace(/\\/g, "/")

/** 平台路径键（Windows 大小写不敏感——清单去重 ∥ 报面标签唯一性 ∥ 排除面比较同取这一处）。 */
export const pathKey = (p) => (process.platform === "win32" ? p.toLowerCase() : p)

/** 声明根（§2.4）：`root` 入参 = **调用方给出的坐标系**。缺省 ∥ 空串 ∥ 非字符串 ⇒ `null`。
 *  **「声明根自身是不是项目」不参与判断**——普通目录、多项目工作区都能当声明根，照它判。
 *  空串判缺省，不是「当前目录」：落进程 cwd 等于替调用方猜一个根——那正是 §2.4 禁的形（缺声明根 ⇒ 整清单不判）。 */
export function declaredRoot(root) {
  if (typeof root !== "string" || root.trim() === "") return null
  return resolve(root)
}

/** 取根式（§2.1 · 判据本体 = `owningProject`，全仓单源）：该档落点的项目根；祖先链至盘根无 manifest ⇒ 声明根。
 *  **界必须是盘根**：界填声明根时，跨项目的档在第一步就判出界、再落回声明根——那正是 F17 要修的 `档缺`。 */
export function rootOf(abs, declaredBase) {
  return owningProject(abs, parse(abs).root) ?? declaredBase
}

/** 按根分组（§2.2）：可判集 → `{ root, files }[]`（首现序）。每组调一次既有 `checkAnchors`——判法内部一字不动。 */
export function perRootGroups(files, declaredBase) {
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
export function reportLayout(declaredBase, projectRoots) {
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
export const rootsSuffix = (lay) => (lay.multi ? `（根 ${lay.roots.length} 个：${lay.roots.join(" ∥ ")}）` : "")

/** 一类清单行（排除 ∥ 跳过 ∥ 读不到）的报面：单根一行到底、零标签；≥2 根按根拆行、行首项目标签。
 *  多根时一行一根——一行里挂两个项目标签，读者读不出哪个路径属哪个项目。 */
export function bucketLines(lay, absList, label) {
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

/** 无声明根那一行的头句（§2.4 逐字）——政策，不是公式的推论。 */
export const NO_ROOT_HEAD = "本次没有声明根：声明根是这条判据的调用前置，缺它整清单不判（不出半份判定）"

/** 无声明根的**逐档点名**（§2.4 · 三式逐字照抄，不合并成一句）：
 *  ① 绝对路径条目、祖先链有 manifest ⇒ 说「本档本可归 `<该根>`」；
 *  ② 绝对路径条目、祖先链至盘根无 manifest ⇒ 说「祖先链至盘根无 PROJECT-MANIFEST.json」；
 *  ③ 相对路径条目 ⇒ 说「无根无法定位」。
 *  **报文不得断言盘上为假的事**：只有祖先链**真的**没有 manifest 才走第二式——本可定根的档走第一式。
 *  `<档>` 一律按**条目原文**显示：无声明根就没有可相对的根，不套 `rel(…)`。N = 去重后的档条目数。 */
export function noRootItems(docs) {
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