/**
 * path-resolve.mjs — 相对路径 → 绝对路径的**统一解析层**（一个函数、四态结果）。
 *
 * 机制单源 = `docs/core/design/PATH-RESOLUTION.md` §2（本档只实现，不重述口径）。
 * 各吃路径的面只留自己的**受理判据**（存不存在 / 是不是文档 / 能不能读 / 落不落基底内）；
 * 「一条路径指向哪里」只由本层回答。
*
 * **可选的解析会话**（`createResolutionSession` · 注入形 = `opts.session`）：调用方一次调用建一份——同一窗口内的
 * 同名索引与基根发现只做一次（判定与解析都不查它，只摊薄成本）。缺省（不注入）= 逐 token 现算，与注入前的值逐字相同。
 *
 * 叶档（KD-1）：只 import `node:*` + `manifest.mjs`（`projectRootView`：取根单源）+
 * `declared-repos.mjs`（声明出边：目录名 ∥ 声明项原文 ∥ 本机在盘的三合投影——它自己只读 `declaration.mjs`，
 * 同一份声明表不建第二份投影）。
 *
 * 四态（§2.1）：`resolved{abs}` · `ambiguous{candidates}` · `dangling{missing, sameName, level, tried}` ·
 * `unverified{declaredRepo, declaredRoot, relPath, declarationEntry}`（已声明、声明根不在本机 ⇒ 存在性判不了：
 * 列报、不入闸）。声明仓两形另给 `dangling` 带四格载荷（`declaredRepo` ∥ `declaredRoot` ∥ `rootOnDisk` ∥ `siblingRepos`）。
 * `tried` = 基根序下试过的绝对候选（面报「解析 = …」用；只作读数，不作判据）。
 * 第 6′ 步另添两格：`resolved` 带 `how:"suffix"`（唯一后缀兜底解析出的那一支——只有这一支标解析方式）、
 * `dangling` 带 `suffixCandidates`（后缀命中集，≥2 命中时；**不并进 `sameName`**，两张表各管一件事，§2.4 / §2.8）。
 * 第 6′ 步的**第二条前置** = 声明仓形不进兜底（首段命中声明仓名 ∥ 首段是本机同级目录名而未声明 ⇒ 落第 7 步）：
 * 声明面优先于猜测面——上一批的「未声明 ⇒ 阻断」与「已声明不免除存在性」都靠「不成腿」实现，本步一猜就把两条救成绿。
 */
import { existsSync, readdirSync, statSync } from "node:fs"
import { dirname, isAbsolute, join, resolve } from "node:path"

import { declaredOutEdges } from "./declared-repos.mjs"
import { projectRootView } from "./manifest.mjs"

/** 同名候选扫描界（KD-7）：每根各自起算深 ≤3、命中上限 20（只在 `dangling` 路径上跑）。 */
const SAME_NAME_MAX_DEPTH = 3
const SAME_NAME_MAX_HITS = 20
/** 同级目录枚举的**提示面**封顶（§2.7 未声明形那一条提示尾：一次 `readdir`、不递归、按名排序）。
 *  **只属提示面**：判定面（第 6′ 步前置问的「这个 token 是不是仓形」）用的同级名集**不封顶**——
 *  判定带帽 = 一条「同级目录数超过 20 就失效」的规则，而它失效的方式是**静默转绿**：第 21 名及其后的仓名
 *  不被认成仓形 ⇒ 退化成普通悬空 ⇒ 落进第 6′ 步 ⇒ 被后缀兜底救成绿（正是那一步要封的缝）。
 *  同一条道理在 `SAME_NAME_MAX_HITS` 上已出现过一次：**提示面封顶，判定面不封顶**。
 *  帽值由调用方给（`siblingDirs` ∥ `siblingRepoNames` 的 `max` 参）——两处消费、两种射程，不在函数里二选一。 */
const SIBLING_MAX = 20
/** 同名候选扫描跳过的目录名（归档区不是「你是不是指这个」的候选面）。 */
const SAME_NAME_SKIP = new Set(["_archive"])

/** 后缀索引跳过的目录名（§2.8 · ⑥′b）：**本步自持、不与同名候选共用**——上一张一字不动（dot 名 + `_archive`），
 *  理由 = 判据不同 ⇒ 跳过面不同：后缀索引必须跳 `node_modules` 一类（不跳则索引面是整块盘，含全部依赖树）；
 *  同名候选**故意不跳** `dist` 一类（那里那份档也是「盘上有这个名」，提示面要如实说）。dot 名由 `isSkippedSuffixDir` 判。
 *  **不含 `bin`**：`bin/thincoder.cjs` 与 `thincoder-cli/bin/thincoder.cjs` 都在盘且是指针的合法目标——
 *  把 `bin` 放进表里的后果是这两个 token 恒零后缀命中、被判成真死。 */
const SUFFIX_SKIP_DIR_NAMES = new Set(["_archive", "node_modules", "dist", "build", "coverage", "obj"])

/** 后缀命中 ≥2 时候选列的封顶（§2.1 / §2.8：与 `sameName` 的 `SAME_NAME_MAX_HITS` 同值、不同表）。 */
const SUFFIX_CANDIDATE_MAX = 20

/** 后缀索引的跳过判据（dot 名 + 上表；一处定义、索引建表时消费）。 */
const isSkippedSuffixDir = (name) => name.startsWith(".") || SUFFIX_SKIP_DIR_NAMES.has(name)

/** 路径同一性（win32 大小写不敏感——同 `batch-paths.mjs` 越基底判据口径）。 */
const pathKey = (p) => (process.platform === "win32" ? p.toLowerCase() : p)

/** 显示 / 比对用的正斜杠形（后缀判据按仓内相对写，跨平台同一形）。 */
const slashPath = (p) => String(p).replace(/\\/g, "/")

/** 现存判据（`kind` = 存在判口径；`"none"` 恒真——只做调度、不校验存在性）。 */
function existsAs(abs, kind) {
  if (kind === "none") return true
  let st = null
  try { st = statSync(abs, { throwIfNoEntry: false }) } catch { return false }
  if (!st) return false
  if (kind === "dir") return st.isDirectory()
  if (kind === "file") return st.isFile()
  return true // "any"
}

/** 去重保序（按路径同一性；基根重合时不产伪 `ambiguous`）。 */
function uniquePaths(list) {
  const seen = new Set()
  const out = []
  for (const p of list) {
    const k = pathKey(p)
    if (seen.has(k)) continue
    seen.add(k)
    out.push(p)
  }
  return out
}

/** 目录 → 直接子目录名（按名排序；`max` = 调用方给的封顶，`Infinity` = 不封顶；不可读 ⇒ 空集）。
 *  **封顶由调用方说**：提示面传 `SIBLING_MAX`、判定面传 `Infinity`——按消费场景在函数里二选一，
 *  会把两套射程藏进同一处（读这一份的人就看不出它是提示还是判定）。 */
function siblingDirs(dir, max) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return [] }
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort().slice(0, max)
}

/** 同名档扫描（**逐 token 形**：每根各自起算——递归深 ≤ `SAME_NAME_MAX_DEPTH`、命中上限 `SAME_NAME_MAX_HITS`、
 *  跳过隐藏目录与 `_archive`；宽度优先——浅处的同名档先入列）。 */
function collectSameName(root, name, out) {
  const queue = [{ dir: root, depth: 0 }]
  while (queue.length > 0 && out.length < SAME_NAME_MAX_HITS) {
    const { dir, depth } = queue.shift()
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { continue }
    for (const e of entries) {
      if (out.length >= SAME_NAME_MAX_HITS) break
      if (e.name.startsWith(".") || SAME_NAME_SKIP.has(e.name)) continue
      const abs = join(dir, e.name)
      if (e.isDirectory()) {
        if (depth + 1 <= SAME_NAME_MAX_DEPTH) queue.push({ dir: abs, depth: depth + 1 })
        continue
      }
      if (e.isFile() && e.name === name) out.push(abs)
    }
  }
}

/** 同名档扫描（**一次建一份形**：一个根走一遍树、记下**全部**档名的前 `SAME_NAME_MAX_HITS` 个命中）。
 *  界 ∥ 序 ∥ 跳过面与 `collectSameName` **连字同源**（同深度界、同命中界、同 BFS 宽优先）：
 *  所以「某名的前 20 个」在两形下逐位相等——扫描一次建成，不再每 token 一遍树。 */
function collectNamesOnce(root) {
  const byName = new Map()
  const queue = [{ dir: root, depth: 0 }]
  while (queue.length > 0) {
    const { dir, depth } = queue.shift()
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { continue }
    for (const e of entries) {
      if (e.name.startsWith(".") || SAME_NAME_SKIP.has(e.name)) continue
      const abs = join(dir, e.name)
      if (e.isDirectory()) {
        if (depth + 1 <= SAME_NAME_MAX_DEPTH) queue.push({ dir: abs, depth: depth + 1 })
        continue
      }
      if (!e.isFile()) continue
      const list = byName.get(e.name)
      if (list) { if (list.length < SAME_NAME_MAX_HITS) list.push(abs) }
      else byName.set(e.name, [abs])
    }
  }
  return byName
}

/** 后缀索引（**§2.8 的判定面 · 全树一遍**）：域根下每个档名 → 绝对路径[]。**不限深度、不设命中帽**——
 *  本步的判据恰是「全树恰一」，一加帽就会把第 N 个同名档藏起来、两名判成假唯一（KD-B / KD-15）。
 *  源 = 文件系统遍历，否决 `git ls-files`：那答的是「跟踪了吗」，本步判据问的是「在盘吗」——
 *  在盘未跟踪的档它会漏（假红），工作树已删未暂存的它照列（假绿），且判据跑在提交之前。
 *  域 = 项目根（不含声明仓根：声明表是跨仓的唯一入口，索引覆盖它这条腿就成了第二个入口）。
 *  跳过面 = `isSkippedSuffixDir`（本步自持，**不与同名候选共用**——见常量的理由）。 */
function collectSuffixIndex(domainRoot) {
  const byName = new Map()
  const stack = [domainRoot]
  while (stack.length > 0) {
    const dir = stack.pop()
    let entries
    try { entries = readdirSync(dir, { withFileTypes: true }) } catch { continue }
    for (const e of entries) {
      if (isSkippedSuffixDir(e.name)) continue
      const abs = join(dir, e.name)
      if (e.isDirectory()) { stack.push(abs); continue }
      if (!e.isFile()) continue
      const list = byName.get(e.name)
      if (list) list.push(abs)
      else byName.set(e.name, [abs])
    }
  }
  return byName
}

/** ⑥′c 的过滤（**一处定义**：会话查表与不传会话的现算同取这一份）：索引键 = token 末段，
 *  命中集取「路径 == token ∥ 路径以 `/` + token 结尾」（路径相对域根、按正斜杠形比对）。
 *  **域根前缀不匹配的条目一律不计**（索引恒由同一域根建，这条支正常走不到；走得到说明索引与域根不同源，
 *  那时按「不命中」处理——判据面缺省方向是 fail-closed，不把域外路径当成候选）。 */
function filterSuffixHits(byName, domainRoot, token) {
  const name = token.split("/").filter(Boolean).pop() ?? ""
  const base = slashPath(domainRoot).replace(/\/+$/, "") + "/"
  const out = []
  for (const abs of byName.get(name) ?? []) {
    const s = slashPath(abs)
    if (!s.startsWith(base)) continue
    const rel = s.slice(base.length)
    if (rel === token || rel.endsWith("/" + token)) out.push(abs)
  }
  return out
}

/** 同名候选的两个来源（**产出者只此一处**——都在本层）：缺省 = 逐 token 走查（现状）；
 *  传入 `session`（见 `createResolutionSession`）⇒ 查表。两形的候选集逐字相等。 */
function collectSameNameAll(roots, name) {
  const out = []
  for (const root of roots) collectSameName(root, name, out)
  return out
}

/**
 * 解析会话（**调用方一次建一份** · 注入形）：三件同轮记忆，缺省（不传）⇒ 逐 token 现算（现状，零回归）。
 *
 * ① `lookup(roots, name)` = 同名候选索引：按根惰性建、一份覆盖全部档名 ⇒ 同一根只走一遍树
 *    （候选集与 `collectSameName` 逐 token 形**逐字相等**，同界同序——见 `collectNamesOnce`）。
 *    射程：只服务 `档缺` 注解的「盘上同名」提示——判定（档在不在盘）与解析序都不查它
 *    （口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20「索引的射程」）。
 * ② `rootView(anchor)` = 基根发现结果的同轮记忆（`projectRootView` 每次调用要扫两层目录）——
 *    一次调用里目录不会变，记与不记逐字同值；**跨轮缓存照禁**（口径 = §3.20「缓存口径」）。
 *    它的必要性 = 同一判据的另一半：不记的话基根发现仍在每个悬空 token 上重跑一遍，走查次数依旧随 token 数走。
 * ③ `suffixLookup(domainRoot, token)` = 后缀索引（§2.8 · 第 6′ 步的**判定面**）：按域根惰性建一份、全树一遍；
 *    射程与①相反——①只作提示、不产 `resolved`，③是判定（恰一命中就产 `resolved{how:"suffix"}`）。
 *    **两张表各走一遍树是有意的**：①按三层基根各自起算（含项目根之外的根、深 ≤3、封顶 20），
 *    ③按项目根全树一遍；共用要先裁两套不同的根集与深度帽，而①只在 `dangling` 路径上跑、③惰性建。
 *    `suffixBuilds()` = 建表次数（读数 `后缀索引建 N 次`）：一次调用里同域根恒 1——
 *    它衡量的正是「建一次」这件事，墙钟不是判据。**读数口径 = 按域根各一份**：多根清单跑（一次 `doc_check`
 *    按项目根分组、每组一份会话）里 N = 走到第 6′ 步的根数，不是恒 1——N 恒 1 说的是单根跑那一形。
 * @returns {{rootView:(anchor:string)=>object, lookup:(roots:string[], name:string)=>string[],
 *   suffixLookup:(domainRoot:string, token:string)=>string[], suffixBuilds:()=>number}}
 *   `lookup` = 按根集序拼合、总量封顶 `SAME_NAME_MAX_HITS`（与走查形同口径；去重仍由调用方的 `uniquePaths` 做）
 *   `suffixLookup` = ⑥′c 过滤后的命中集（未排序、未封顶——分支判据与封顶在调用方那一步）
 */
export function createResolutionSession() {
  const perRoot = new Map() // root → Map(档名 → 绝对路径[])（每名 ≤ SAME_NAME_MAX_HITS，BFS 序）
  const rootViews = new Map() // anchor → projectRootView 结果
  const suffixIndexes = new Map() // 域根 → Map(档名 → 绝对路径[])（全树、无帽）
  let suffixBuilt = 0 // 建表次数（读数面读数，不入判据）
  const indexOf = (root) => {
    let byName = perRoot.get(root)
    if (!byName) { byName = collectNamesOnce(root); perRoot.set(root, byName) }
    return byName
  }
  const suffixIndexOf = (domainRoot) => {
    const key = pathKey(domainRoot)
    let byName = suffixIndexes.get(key)
    if (!byName) { byName = collectSuffixIndex(domainRoot); suffixIndexes.set(key, byName); suffixBuilt++ }
    return byName
  }
  return {
    rootView(anchor) {
      let view = rootViews.get(anchor)
      if (view === undefined) { view = projectRootView(anchor); rootViews.set(anchor, view) }
      return view
    },
    lookup(roots, name) {
      const hits = []
      for (const root of roots) {
        const list = indexOf(root).get(name)
        if (!list) continue
        for (const abs of list) {
          if (hits.length >= SAME_NAME_MAX_HITS) break
          hits.push(abs)
        }
        if (hits.length >= SAME_NAME_MAX_HITS) break
      }
      return hits
    },
    suffixLookup(domainRoot, token) {
      return filterSuffixHits(suffixIndexOf(domainRoot), domainRoot, token)
    },
    suffixBuilds() {
      return suffixBuilt
    },
  }
}

/** 第一个不存在的路径段（`dangling.missing` 的取值单源——AC-4）。 */
function firstMissing(base, segs) {
  let cur = base
  for (const s of segs) {
    cur = join(cur, s)
    if (!existsSync(cur)) return s
  }
  return segs[segs.length - 1] ?? ""
}

/** 首段是否命中声明仓名（声明的唯一入口 = 声明表；命中 ⇒ 返回那条边，未命中 ⇒ `undefined`）。
 *  **一处定义**：第 6 步的声明仓腿与第 6′ 步的前置入口（`isDeclaredRepoForm`）同取这一份——
 *  同一匹配式写两遍，一处改另一处会静默不同步（`declaredOutEdges` 自己是投影单源，重读有同轮缓存）。 */
function declaredEdgeFor(start, repo) {
  return declaredOutEdges(start).find((e) => e.name === repo)
}

/** 本机同级目录名（§2.7 未声明形：父目录一次 `readdir`、不递归、按名排序）；`max` 由调用方给——
 *  声明仓腿的**提示尾**传 `SIBLING_MAX`（列几个候选够了），第 6′ 步的**前置**传 `Infinity`（判定面不封顶）。
 *  父目录 = 项目根的父目录；解析不出项目根 ⇒ 会话锚的父目录。**一处定义**——两个消费者同取这一份，不各算一遍。 */
function siblingRepoNames(start, view, max) {
  const parent = view.state === "ok" ? dirname(view.root) : dirname(start)
  return siblingDirs(parent, max)
}

/** 声明仓形（§2.2 第 6′ 步的第二条前置／§2.8「声明仓形不进兜底」）——两形都算：
 *  ① 首段命中声明仓名（根在盘 ∥ 不在盘）∥ ② 首段是本机同级目录名而未声明。
 *  **两形都不进第 6′ 步**（落第 7 步判 `档缺`）：声明面优先于猜测面——上一批的「未声明 ⇒ 阻断」与
 *  「已声明不免除存在性」都靠「不成腿」实现，而第 6′ 步正是链上会猜的那一步，只要它还在猜，两条就被救成绿。 */
function isDeclaredRepoForm(start, pathText, view) {
  const segs = pathText.split("/").filter(Boolean)
  if (segs.length < 2) return false // 裸名单段不成仓形（KD-11）
  const repo = segs[0]
  if (declaredEdgeFor(start, repo)) return true
  // 第二支是**判定**，同级名集不封顶（`Infinity`）：这次问的是「是不是仓形」，不是「要不要列给你看」——
  // 一封顶，第 21 名及其后的仓名就答「不是仓形」⇒ 落进第 6′ 步被兜底救绿（静默转绿，不报错）。
  return siblingRepoNames(start, view, Infinity).includes(repo)
}

/** 声明仓腿（§2.7，只在 `declaredRepos` 为真 ∧ 输入多段 ∧ 第 4–5 步零命中时调）——三种结局：
 *  · 首段命中声明仓目录名（声明序首者）∧ **声明根在本机** ⇒ 于该声明根判余段存在性：在盘 `resolved`，不在盘 `dangling`（红）；
 *  · 命中 ∧ **声明根不在本机** ⇒ `unverified`（仓名与形态都合规，只是存在性跨机器不成立——列报、不入闸）；
 *  · 未命中 ⇒ 不成腿（落 `dangling`；首段是本机同级目录名时把同级目录带上作提示，与 `sameName` 同性质）。
 *  形态不合法（含 `..` / `.` 段 / 余段空）⇒ 不成腿（形态是作者能写对的事，写错仍阻断，KD-11）。 */
function declaredRepoLeg(start, pathText, kind, view) {
  const segs = pathText.split("/").filter(Boolean)
  if (segs.length < 2) return null
  if (segs.some((s) => s === ".." || s === ".")) return null
  const repo = segs[0]
  const relPath = segs.slice(1).join("/")
  if (!relPath) return null
  const declared = declaredEdgeFor(start, repo)
  if (!declared) { // 未声明形：首段确实是本机同级目录名时才算「跨仓形」，同级目录只作提示、不产受理
    const siblings = siblingRepoNames(start, view, SIBLING_MAX) // 提示尾：封顶在此
    return { extras: { siblingRepos: siblings.includes(repo) ? siblings : [] } }
  }
  if (!declared.onDisk) { // 已声明 ∧ 声明根不在本机 ⇒ 存在性判不了
    return { state: "unverified", declaredRepo: repo, declaredRoot: declared.root, relPath, declarationEntry: declared.entry }
  }
  const abs = resolve(declared.root, relPath)
  if (existsAs(abs, kind)) return { state: "resolved", abs }
  return {
    extras: { declaredRepo: repo, declaredRoot: declared.root, rootOnDisk: true },
    missing: firstMissing(declared.root, relPath.split("/").filter(Boolean)),
  }
}

/** 前两级基根（§2.2 第 4 步——缺哪级就跳过）：`root-first` = 项目根 → 所指目录；
 *  `near-first` = 所指目录 → 项目根。「所指目录」= `referrer` 的目录，无 `referrer` ⇒ 会话锚
 *  （§1.2 偏离 ③——不兜则第二级在「手上没有引用方档」的面整段消失）。
 *  解析不出项目根时：`workspace` = 这一级不成立（§2.3 判 `ambiguous`）；`none` = 会话锚即该级
 *  （`batchProjectRoot` / `docRootBase` 的既有兜底同式——锚自己就是手上唯一的基根）。 */
function coreLegs(start, view, referrer, order) {
  const refDir = referrer ? dirname(referrer) : start
  const rootLeg = view.state === "ok" ? view.root : view.state === "none" ? start : null
  const legs = order === "near-first" ? [refDir, rootLeg] : [rootLeg, refDir]
  return uniquePaths(legs.filter((p) => typeof p === "string" && p !== ""))
}

/** 第 6′ 步（§2.2 6′；本体单源 = §2.8）：唯一后缀兜底——**只有文档锚面开**（`opts.suffixFallback`）。
 *  三种结局：恰一命中 ⇒ `resolved{abs, how:"suffix"}`；≥2 ⇒ 候选（按路径排序、封顶 `SUFFIX_CANDIDATE_MAX`，
 *  由调用方并进 `dangling.suffixCandidates`，**不并进 `sameName`**）；0 ⇒ 不成腿（落第 7 步，仍判 `档缺`）。
 *  前置不成立（绝对形 ∥ 段内带 `..` ∥ `.` ∥ 以 `/` 结尾）⇒ 不成腿：形态是作者能写对的事，写错仍阻断（KD-11）。
 *  前置之二 = 声明仓形（首段命中声明仓名 ∥ 首段是本机同级目录名而未声明）⇒ 同样不成腿——
 *  判定住 `isDeclaredRepoForm`，由调用方在本函数之前判（本步只负责兜底，不判声明面）。
 *  索引域 = 项目根（无项目根 ⇒ 会话锚即该级，同 `coreLegs` 的 `none` 支——夹具根没有 manifest 也照走）。 */
function suffixLeg(start, view, pathText, session) {
  const segs = pathText.split("/").filter(Boolean)
  if (segs.length === 0 || isAbsolute(pathText) || pathText.endsWith("/")) return null
  if (segs.some((s) => s === ".." || s === ".")) return null
  const domainRoot = view.state === "ok" ? view.root : start
  const hits = session
    ? session.suffixLookup(domainRoot, pathText)
    : filterSuffixHits(collectSuffixIndex(domainRoot), domainRoot, pathText)
  if (hits.length === 1) return { state: "resolved", abs: hits[0], how: "suffix" }
  if (hits.length > 1) return { state: "dangling", suffixCandidates: hits.slice().sort().slice(0, SUFFIX_CANDIDATE_MAX) }
  return null
}

/**
 * 一条路径 → 四态之一（判据正文 = `docs/core/design/PATH-RESOLUTION.md` §2.2）。
 * @param {string} anchor 会话锚（相对路径的最终兜底基根；`projectRootView` 的查询起点）
 * @param {string|undefined|null} given 参数原值（`undefined` = 参数缺省——与空串分野，§2.2 第 1 步）
 * @param {{referrer?:string, bases?:string[], scanBases?:string[],
 *   kind?:"file"|"dir"|"any"|"none", order?:"root-first"|"near-first",
 *   declaredRepos?:boolean, suffixFallback?:boolean,
 *   session?:{rootView:Function, lookup:Function, suffixLookup:Function, suffixBuilds:Function}}} [opts]
 *   `declaredRepos`（缺省 `false`）= 开声明仓腿：首段命中声明仓目录名时于该声明根解析余段。
 *   **只有文档锚面传它**（`docs/core/design/PATH-RESOLUTION.md` §2.5 表末行）——其余面不传，仓外路径照旧判缺。
 *   `suffixFallback`（缺省 `false`）= 开第 6′ 步（唯一后缀兜底，§2.8）：**同样只有文档锚面传它**——
 *   其余六面的受理判据各自写死，兜底会放宽它们的受理面（KD-15，与 `declaredRepos` 同形）。
 *   `session` **缺省 = 逐 token 现算（现状，零回归）**；给了 ⇒ 基根发现取它的同轮记忆、第 7 步的同名候选查它的表、
 *   第 6′ 步的后缀索引查它的表（`createResolutionSession` 建的那份；判定与解析不查名前索引——它的射程只有注解面）
 * @returns {{state:"resolved", abs:string, how?:"suffix"}
 *   | {state:"ambiguous", candidates:string[]}
 *   | {state:"dangling", missing:string, sameName:string[], level:"base"|"path", tried:string[],
 *       suffixCandidates?:string[],
 *       declaredRepo?:string, declaredRoot?:string, rootOnDisk?:boolean, siblingRepos?:string[]}
 *   | {state:"unverified", declaredRepo:string, declaredRoot:string, relPath:string, declarationEntry:string}}
 *   `how:"suffix"` 只在第 6′ 步那一支出现——其余来源静默（§2.6）；`suffixCandidates` 只在第 6′ 步 ≥2 命中时出现。
 */
export function resolvePathTarget(anchor, given, opts = {}) {
  const o = opts ?? {}
  const start = resolve(anchor ?? ".")
  const kind = o.kind === "dir" || o.kind === "any" || o.kind === "none" ? o.kind : "file"
  const order = o.order === "near-first" ? "near-first" : "root-first"
  const wantDeclaredRepos = o.declaredRepos === true
  const wantSuffixFallback = o.suffixFallback === true
  const referrer = typeof o.referrer === "string" && o.referrer.trim() !== "" ? resolve(o.referrer) : null
  const bases = (Array.isArray(o.bases) ? o.bases : []).filter((b) => typeof b === "string" && b.trim() !== "")
  const scanBases = (Array.isArray(o.scanBases) ? o.scanBases : []).filter((b) => typeof b === "string" && b.trim() !== "")
  const view = o.session ? o.session.rootView(start) : projectRootView(start)

  // ── 第 1 步：参数缺省（undefined）≠ 空串 —— 没有路径可判，只查锚根
  if (given === undefined || given === null) {
    if (view.state === "ok") return { state: "resolved", abs: view.root }
    if (view.state === "workspace") return { state: "ambiguous", candidates: [...view.candidates] }
    return { state: "dangling", missing: "", sameName: [], level: "base", tried: [] }
  }
  const raw = typeof given === "string" ? given.trim() : ""
  if (raw === "") return { state: "dangling", missing: typeof given === "string" ? given : String(given), sameName: [], level: "path", tried: [] }
  const pathText = raw.replace(/\\/g, "/")

  // ── 第 2 步：绝对路径 —— 照用，零基根走查（各面受理判据照旧）
  if (isAbsolute(pathText)) return { state: "resolved", abs: resolve(pathText) }

  const segs = pathText.split("/").filter(Boolean)
  const legs = coreLegs(start, view, referrer, order)
  // 第三级基底：与前两级重合者不重复（重合即同一基根，不是第二个落点）
  const baseRoots3 = uniquePaths(bases).filter((b) => !legs.some((l) => pathKey(l) === pathKey(b)))
  const roots = [...legs, ...baseRoots3]

  // ── 第 3 步：kind:"none" —— 只做调度、不校验存在性：候选序首个即 resolved，恒不产其余三态
  if (kind === "none") return { state: "resolved", abs: resolve(roots[0] ?? start, pathText) }

  // ── 第 4 步（续）：工作区锚 —— 项目根这一级不成立 ⇒ 不猜（§2.3：列下辖项目、停下要人挑）
  if (view.state === "workspace") return { state: "ambiguous", candidates: [...view.candidates] }

  // ── 第 5 步：判态 —— 前两级按 `order` **首命中即 resolved**；第三级 `bases` 内多份现存 ⇒ `ambiguous` 全列。
  //    依据：KD-2 / KD-3 的「翻转次序会改变判定结果」+ AC-11 两条断言（两个基根各有一份同名现存档 ⇒
  //    锚面取项目根那份、批档面取近基根那份）——只有首命中择一才成立（§2.2 第 5 步「≥二 ⇒ ambiguous」
  //    在两级基根上与 AC-11 不能同时成立，取验收判据这一面）。
  const tried = uniquePaths(roots.map((b) => resolve(b, pathText)))
  for (const leg of legs) {
    const abs = resolve(leg, pathText)
    if (existsAs(abs, kind)) return { state: "resolved", abs }
  }
  const baseHits = uniquePaths(baseRoots3.map((b) => resolve(b, pathText)).filter((abs) => existsAs(abs, kind)))
  if (baseHits.length === 1) return { state: "resolved", abs: baseHits[0] }
  if (baseHits.length > 1) return { state: "ambiguous", candidates: baseHits }

  // ── 第 6 步：声明仓腿（仅文档锚面开；仓内缺档仍阻断）
  let repoLeg = null
  if (wantDeclaredRepos) {
    repoLeg = declaredRepoLeg(start, pathText, kind, view)
    if (repoLeg?.state === "resolved") return { state: "resolved", abs: repoLeg.abs }
    if (repoLeg?.state === "unverified") return repoLeg
  }

  // ── 第 6′ 步：唯一后缀兜底（仅文档锚面开；§2.2 6′／§2.8）——恰一命中即解析，并在载荷上标出解析方式。
  //    「能定位」不等于「是你想指的那个」：所以这一支不静默（`how:"suffix"` 逐处进载荷，报面据此出读数与清账清单）。
  //    前置之二 = 声明仓形不进兜底（`isDeclaredRepoForm`）：首段是仓名 ⇒ 落第 7 步，声明面优先于猜测面。
  let suffixCandidates = null
  if (wantSuffixFallback && !isDeclaredRepoForm(start, pathText, view)) {
    const leg = suffixLeg(start, view, pathText, o.session)
    if (leg?.state === "resolved") return leg
    if (leg?.suffixCandidates) suffixCandidates = leg.suffixCandidates
  }

  // ── 第 7 步：dangling —— 报缺的那一段 + 列同名候选（两层基根 + bases + scanBases 各根，每根各自起算）
  const name = segs[segs.length - 1] ?? pathText
  const scanRoots = uniquePaths([...roots, ...scanBases])
  // 两个来源、**产出者只此一处**：缺省 = 逐 token 走查；给了 `session` ⇒ 查表（它一次建一份、覆盖全部档名）。
  const hits = o.session ? o.session.lookup(scanRoots, name) : collectSameNameAll(scanRoots, name)
  const sameName = uniquePaths(hits)
  return {
    state: "dangling",
    missing: repoLeg?.missing ?? firstMissing(roots[0] ?? start, segs),
    sameName,
    level: "path",
    tried,
    ...(suffixCandidates ? { suffixCandidates } : {}),
    ...(repoLeg?.extras ?? {}),
  }
}

/** `dangling` 的「盘上同名」提示尾（空数组 ⇒ 空串）。面拼在既有文案之后（§2.6：既有文案逐字保留在前）。 */
export function danglingSameNameHint(result) {
  const list = result?.state === "dangling" && Array.isArray(result.sameName) ? result.sameName : []
  return list.length > 0 ? `盘上同名：${list.join(" ∥ ")}` : ""
}
