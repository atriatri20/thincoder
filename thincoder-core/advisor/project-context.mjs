/**
 * advisor/project-context.mjs — project-context discovery and injection for review
 * messages (Project Guide, document map, project standards, change-set context).
 *
 * Split out of messages.mjs (the split registered as D-1 in ENGINEERING-MODE.md
 * §2.26.3, trigger "thicken again" — met by this batch). messages.mjs keeps its
 * pre-split surface via re-export; this module is consumed by it only.
 *
 * Portability contract (PORTABILITY FR10/FR11 · PO-1/PO-2 · P8): every discovery
 * step here is either satisfied or DEGRADED VISIBLY. The old code probed a fixed
 * `docs/README.md` and a fixed `METHODOLOGY.md` and skipped injection silently when
 * absent — in a project with a different layout the reviewer still scored the
 * dimension it could no longer check (silent failure, the worst class: invisible
 * and unfixable by the user). Missing pieces now say so, and the reviewer is told
 * to state the limitation in its findings. The document map is derived from the
 * manifest's `docRoot` (the one place that says where the docs live); the standards face
 * is the project's OWN declaration too (`docRoot.standards` — a document LAYER: a directory
 * whose `.md` files, subdirectories included, are the standards) — the probe was retired, the declaration
 * replaced guessing — and it degrades in three machine-distinguishable states:
 * undeclared (no path), declared but unreadable (the declared path is named), and injected.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs"
import { resolve, join, relative, dirname, sep } from "node:path"
import { providerSpec } from "../config.mjs"
import { DEFAULT_MANIFEST, docRootPaths, manifestFilePath, projectRootView, readManifest } from "../manifest.mjs"
// 去重键的折大小写尺子：同仓有两份同名函数——`doc-graph.mjs` 的私有副本（未导出）与
// `doc-check/per-root.mjs` 导出的这一份；取已导出的那份（语义同形），不另造第三把。
// 为何必须折：同一目录的两种大小写写法在 win32 上是同一个目录，不折就同一份档注入两次。
import { pathKey } from "../doc-check/per-root.mjs"

/** Project guide (AGENTS.md) injection budget — decision 2026-08-08:
 *  NO fixed truncation; long-context models (1M+) get up to 5% of their context
 *  window for the doc map, small windows still get a floor so the map is always
 *  visible. The map is what tells the reviewer WHERE the requirements docs live
 *  (requirement-fit is judged against those docs, not the conversation only). */
const PROJECT_GUIDE_MIN = 8192 // chars — floor for small-window models
const PROJECT_GUIDE_FRACTION = 0.05 // 5% of the reviewer model's context window

/** Absent-AGENTS.md notice (guide is optional: the conversation carries intent). */
export const NO_GUIDE_NOTICE = "(No AGENTS.md found — neither at the working directory root nor in any review-scope subdirectory. Judge the user's requirements from the conversation background, and say so explicitly if the requirements are unclear.)"

/** Explicit degradation sentences (PORTABILITY design §4.4 — verbatim). */
export const NO_DOC_MAP_NOTICE = "(No document map found — no README.md under the declared document roots and none at their common ancestor — the Document ownership criterion is degraded: check placement against the Project Guide where present, and state the limitation in your findings.)"
export const NO_STANDARDS_NOTICE = "(No project standards document — nothing in the project declares one — judge methodology compliance from the Project Guide (when present) and the review criteria above; state the limitation in your findings.)"
export const NO_GIT_NOTICE = "(No git repository detected — change-set context is unavailable; read the review-scope files directly.)"

/**
 * 态 2 —— 声明了标准层，但一份都读不到（文案单源 = `docs/core/design/MANIFEST.md` §2.12）。
 * 与 `NO_STANDARDS_NOTICE` **不得同形**：那句说的是「没有任何东西声明」，而这里恰好是「声明了但
 * 读不到」。同形会让作者以为自己没声明过，回头去补一个其实已经有的声明——所以本句必带声明路径；
 * `reason` 五值分列，对应三类可修面（KD-M1-65）：`no such directory` 改路径 ∥ `not a directory`
 * 改形态 ∥ `no .md file` 往层里放档；`read failed: <code>` ∥ `manifest read failed: <code>` 修权限 / 修档。
 * @param {{path: string, reason: string}} p — 声明路径（绝对形）+ 读不到的原因
 * @returns {string}
 */
export const STANDARDS_UNREADABLE_NOTICE = ({ path, reason }) =>
  `(Project standards declared at ${path} in the manifest, but unreadable — ${reason};\n` +
  "the methodology-compliance criterion is unchecked.\n" +
  "Fix the path or the file — do NOT declare it again. State the limitation in your findings.)"

/**
 * 半读句 —— 一个层里（或声明的多个目录里）有几份读不到（态 3 的下半——零静默：余项既不注入也不报
 * = 静默丢声明，与需求档 §5.1 验收 ③「任何一面都不得静默跳过」相抵；设计 = `MANIFEST.md` §2.12
 * KD-M1-65 的原因分列）。
 * @param {{unreadable: string[]}} p — 逐份 `"<路径>: <原因>"`（路径绝对形）
 * @returns {string}
 */
export const STANDARDS_PARTIAL_NOTICE = ({ unreadable }) =>
  `(Of the standards declared in the manifest, these could not be read — ${unreadable.join("; ")};\n` +
  "the standard set above is INCOMPLETE. Fix them — do NOT declare them again. State the limitation in your findings.)"

/**
 * Discover the project root for the review — user decision 2026-08-08:
 * the project root is a SUBDIRECTORY of the working directory, never an
 * ancestor above it. Priority:
 *   1. Walk UP from each review-scope file's directory, bounded by cwd —
 *      the NEAREST AGENTS.md inside the workspace wins. In a monorepo this is
 *      the subproject's own doc map even when cwd itself has an AGENTS.md
 *      (a workspace-level meta map must not shadow the subproject guide).
 *   2. No scope files / nothing found → cwd (single project; the walk's
 *      last step naturally lands on cwd's own AGENTS.md when it exists).
 * @param {string} cwd — the agent's working directory (workspace root)
 * @param {string[]} scopeFiles — cwd-relative review-scope paths (may be empty)
 * @returns {string|null} absolute project root with an AGENTS.md, or null
 */
export function findGuideRoot(cwd, scopeFiles) {
  // Normalize separators before comparing: input paths may use either
  // convention (join() → "\\" on Windows; tool args / tests → "/"). Mixed
  // styles made isInside(cwd + sep) miss legitimately nested paths.
  const norm = (p) => p.replaceAll("\\", "/")
  const isInside = (dir) => {
    const d = norm(dir)
    const c = norm(cwd)
    return d === c || d.startsWith(c + "/")
  }
  for (const f of scopeFiles) {
    let dir = dirname(resolve(cwd, f))
    while (isInside(dir) && dir !== dirname(dir)) {
      if (existsSync(join(dir, "AGENTS.md"))) return dir
      dir = dirname(dir)
    }
  }
  // No scope files, or none found in the walk — cwd itself (its AGENTS.md is
  // checked as the walk's final step for scope files; for empty scopes, check
  // it explicitly so a bare cwd project still gets its guide).
  if (existsSync(join(cwd, "AGENTS.md"))) return cwd
  return null
}

/**
 * 评审注入面的**项目根**推导（标准层与文档地图共用；判据 = `docs/core/design/MANIFEST.md`
 * §2.12「判据」块的 `base` 行）。`findGuideRoot` 答的是另一问（最近的 `AGENTS.md`），不在此函数的
 * 射程内。三段，按序、任一命中即止：
 *   ① 评审范围项的归属项目根 —— 逐项 `resolve(cwd, item)` → `projectRootView(item)`，首个 `state === "ok"` 的
 *      `root`；序 = 喂给 `findGuideRoot` 的同一个序（`[...pathList, ...docList]`）。判据用「数据档归属」而
 *      不用「最近的 `AGENTS.md`」——本键的基数必须是项目根（`docRoot` 的值一律相对项目根解析）。
 *   ② 会话锚自身的归属项目根 —— `projectRootView(cwd).root`，仅 `state === "ok"` 时；`workspace` 不向下取
 *      子项目（KD-M1-30），故工作区锚不会被猜成某个子项目。
 *   ③ 两腿皆空 ⇒ `null` —— 调用方落 `agent.cwd`（既有缺省；本函数不给项目指南的根，那仍归 `findGuideRoot`）。
 * **护栏**：①② 的每一次 `projectRootView` 调用各自包 `try`（抛 ⇒ 跳过该项 / 该腿，其余照走；两腿全空 ⇒ ③）。
 * 依据 `thincoder-core/manifest-discovery.mjs` 的契约行「I/O 异常照原样上抛」——`owningProject` 取根那一环
 * 无护栏，同档明写调用点要自己包护栏；而注入器自己的 `try` 只包 `readManifest`，腿 ② 一抛就穿过去。
 * **第三参零缺省**：`scopeFiles` 不是数组即当场拒（`undefined` 与 `null` 同拒），拒因点名该参数与收到的值；
 * **不归一成 `[]`**——「忘了传」与「范围为空」语义相反（前者是调用方写错，后者是一次真空范围的评审）。
 * @param {string} cwd — 会话锚（绝对路径）
 * @param {string[]} scopeFiles — 评审范围路径（cwd 相对或绝对；**无缺省**，空评审传 `[]`）
 * @returns {string|null} 被评审范围的归属项目根（绝对路径）；无项目可指 ⇒ null
 */
export function findProjectContextRoot(cwd, scopeFiles) {
  if (!Array.isArray(scopeFiles)) {
    const got = scopeFiles === undefined ? "undefined" : scopeFiles === null ? "null" : typeof scopeFiles
    throw new TypeError(`findProjectContextRoot: scopeFiles must be an array (got ${got}) — pass the review scope as a list of paths, or [] for an empty one`)
  }
  for (const f of scopeFiles) {
    try {
      const view = projectRootView(resolve(cwd, f))
      if (view.state === "ok") return view.root
    } catch (e) {
      // 该项解析抛（参数值异常 ∥ 权限 ∥ 链接环）⇒ 只跳过这一项，其余照走。
      // 留一行告警：空吞会让「走了 ③」与「范围项本就无项目」在盘上不可分（同档另两处降级同形）。
      console.warn(`[advisor] project-context root probe failed at ${String(f)} (cwd ${cwd}): ${e?.code ?? e?.message ?? "unknown"}`)
    }
  }
  try {
    const view = projectRootView(cwd)
    if (view.state === "ok") return view.root
  } catch (e) {
    // 同 ①：护栏住推导函数，不中断评审消息组装；告警让这一步可追。
    console.warn(`[advisor] project-context root probe failed at cwd ${cwd}: ${e?.code ?? e?.message ?? "unknown"}`)
  }
  return null
}

/**
 * Inject the project guide (AGENTS.md) into the review message. AGENTS.md is the
 * project's doc map — it defines the structure and where requirements/design
 * documents live. The reviewer must see it FIRST: requirement-fit is judged
 * against the documents it points to, with the conversation background as a
 * supplement. Absent AGENTS.md degrades honestly (no pretending there is a map).
 * @param {Object} agent — the parent agent
 * @param {string[]} parts — message parts (mutated)
 * @param {string[]} [scopeFiles] — cwd-relative review-scope paths for project-root discovery
 * @returns {string|null} the discovered project root (abs), or null when no guide
 */
export function injectProjectGuide(agent, parts, scopeFiles = []) {
  parts.push("## Project Guide (AGENTS.md)")
  const root = findGuideRoot(agent.cwd, scopeFiles)
  const path = root ? join(root, "AGENTS.md") : null
  let text
  if (!path) {
    parts.push(NO_GUIDE_NOTICE)
    parts.push("")
    return null // no guide — requirement-fit falls back to the conversation
  }
  try {
    text = readFileSync(path, "utf8")
  } catch (e) {
    if (e.code !== "ENOENT") {
      // File exists but is unreadable (EACCES etc.) — log, don't masquerade as "not found".
      console.warn(`[advisor] AGENTS.md unreadable at ${path}: ${e.message}`)
    }
    parts.push(NO_GUIDE_NOTICE)
    parts.push("")
    return null // no guide — requirement-fit falls back to the conversation
  }
  // readFileSync succeeded — compute the budget OUTSIDE the try so a spec
  // lookup failure can never masquerade as "no AGENTS.md".
  // providerSpec: the project-guide budget follows the provider-level context
  // override (`ADVISOR-GUARDS.md §8` — advisor messages budget is context-based).
  // 字段名归一：解析后的 provider 挂点两端其一（`provider` 本体字段 / `_provider` 运载字段）
  // ——取在场者，两形态同语义（都指本回合生效的 provider 对象）。
  const resolvedProvider = agent.provider ?? agent._provider
  const ctx = providerSpec(resolvedProvider).context
  const cap = Math.max(PROJECT_GUIDE_MIN, Math.floor(ctx * PROJECT_GUIDE_FRACTION))
  const shown = text.length <= cap
    ? text
    : [...text].slice(0, cap).join("") + `\n\n…(truncated at ${cap} chars — read the full file if you need more)` // codepoint-safe slice: no broken surrogate pairs at the boundary
  parts.push(`<!-- Project root: ${relative(agent.cwd, path).split(sep).join("/")} (inferred from the review scope under ${agent.cwd}) -->`)
  parts.push("This file defines the project's structure and where its requirements/design documents live. Read the documents it points to — the user's requirements live THERE, not only in the conversation background.")
  parts.push("")
  parts.push(shown)
  parts.push("")
  return root // guide injected — requirement-fit criteria apply (truthy root)
}

/** `docRoot` probe order: the face a reviewer needs first (design) → down to the batch records. */
const DOC_ROOT_ORDER = ["design", "requirements", "specs", "modules", "batches"]

/** Declared document roots as ABSOLUTE paths, in declaration order (`null` / missing face ⇒ no root). */
function declaredDocRoots(base) {
  const read = readManifest(base)
  const docRoot = (read.ok && read.manifest ? read.manifest : DEFAULT_MANIFEST).docRoot ?? {}
  const out = []
  for (const key of DOC_ROOT_ORDER) {
    for (const p of docRootPaths(docRoot[key], base)) if (!out.includes(p)) out.push(p)
  }
  return out
}

/** Common ancestor of every root (segment-wise — `docs/design` and `docs/designX` are not siblings).
 *  A lone drive root is no map home ⇒ null. */
function commonAncestor(paths) {
  if (paths.length === 0) return null
  const split = (p) => p.split(/[\\/]+/)
  let acc = split(paths[0])
  for (const p of paths.slice(1)) {
    const segs = split(p)
    let i = 0
    while (i < acc.length && i < segs.length && acc[i] === segs[i]) i++
    acc = acc.slice(0, i)
  }
  if (acc.length === 0) return null
  const joined = acc.join(sep)
  return /^[A-Za-z]:$/.test(joined) ? null : joined
}

/**
 * Discover the document map from the manifest's `docRoot` — a pure fs probe, no index generation
 * (the map is a hand-maintained register; a generated one would be a second index, and a second
 * index is exactly the duplicate pointer the retired declaration face used to create).
 * Ladder: ① `README.md` under each declared doc root (declaration order) ② `README.md` at the common
 * ancestor of every declared root. Neither ⇒ null (caller injects `NO_DOC_MAP_NOTICE` — no silent skip).
 * @param {string} base project root (or any dir inside it — `docRoot` resolves against the project root)
 * @returns {string|null} absolute path of the map file, or null when degraded
 */
export function findDocumentMap(base) {
  const roots = declaredDocRoots(base)
  for (const r of roots) {
    const p = join(r, "README.md")
    if (existsSync(p)) return p
  }
  const ancestor = commonAncestor(roots)
  if (!ancestor) return null
  const p = join(ancestor, "README.md")
  return existsSync(p) ? p : null
}

/**
 * Inject the project document map (PO-1), derived from `docRoot`. Degrades visibly: the reviewer
 * must know the Document-ownership criterion is unchecked — never a silent skip.
 * @param {Object} agent — the parent agent
 * @param {string[]} parts — message parts (mutated)
 * @param {string[]} scopeFiles — 评审范围路径；base = 它们的归属项目根（`findProjectContextRoot`，与标准层同一条
 *   推导；无根 ⇒ `agent.cwd`）。**无缺省**——非数组由该函数当场拒，拒因点名参数与收到的值。
 * @returns {string|null} the injected map path, or null when degraded
 */
export function injectDocumentMap(agent, parts, scopeFiles) {
  const base = findProjectContextRoot(agent.cwd, scopeFiles) ?? agent.cwd
  const mapPath = findDocumentMap(base)
  parts.push("## Document Map")
  let text = null
  if (mapPath) {
    try {
      text = readFileSync(mapPath, "utf8")
    } catch (e) {
      console.warn(`[advisor] document map unreadable at ${mapPath}: ${e.message}`)
    }
  }
  if (text === null) {
    parts.push(NO_DOC_MAP_NOTICE) // degraded — visible by contract
    parts.push("")
    return null
  }
  parts.push("The document map below registers which document files exist per section. Use it for the Document ownership criterion: a change for an existing section must amend that section's document, not create a new file.")
  parts.push(text)
  parts.push("")
  return mapPath
}

/** 消息里的路径书写（\ → /）：与 `injectProjectGuide` 的根注记同款（`relative(...).split(sep).join("/")`），
 *  且让「声明路径字面」在消息里可 grep（`docs/nope` 而非 `docs\nope`）。读盘仍用原样路径。 */
const displayPath = (p) => String(p).replaceAll("\\", "/")
/**
 * 标准层成员收集（模块私有——遍历 ∥ 序 ∥ 去重的单源；判据 ∥ 序 = `docs/core/design/MANIFEST.md` §2.12「接口契约」）。
 *
 * 递归：只下潜 `ent.isDirectory()`；**符号链接一律不跟**（`ent.isSymbolicLink()` 跳过，既不判文件也不下潜）——
 * 环保险只落在这条上：无深度帽（会静默漏档）、无跳过表 ∥ 无条数帽（那两者属索引面策略，搬进来同样静默漏档）。
 * 成员按**名字**认 `.md`（大小写不敏）；**文件侧**不按 dirent 类型预筛（目录必下潜、链接必跳）：读得成 = 可读，读不成 = 不可读（带该档自己的原因）。
 * 序 = 成员**收完后对整集排一次**：目录序（声明序）→ 层根相对路径（`/` 归一）码点序——不是逐层下潜各按名序
 * （递归后裸文件名不再唯一；两种读法只在「子目录名是层根档名的前缀」时给出相反的序）。
 * 嵌套根（一根本身在另一根之内）⇒ 同一份档按**解析后的绝对档路径**去重、保留首次出现（首次出现的层根定排序键）；
 * 去重键在 **win32 折小写**（尺子 = `pathKey`——同一目录的两种写法是同一个目录）；折小写**只作用于去重键**，
 * 排序键与定位注仍用盘上的原字符串。
 * 不去重则同一份档进两次正文、吃两份预算。
 * @param {string[]} dirs — 声明目录的绝对路径（声明序；`docRootPaths` 已去重）
 * @returns {{readable: {path: string, text: string}[], unreadable: {path: string, reason: string}[]}}
 */
function collectStandardDocs(dirs) {
  const members = [] // { path, dirIndex, rel, text }——收完统一排序
  const unreadable = []
  dirs.forEach((dir, dirIndex) => {
    // 逐目录四臂（判据 = §2.12「判据」块，逐臂对应）：路径不存在 ∥ stat 抛 ∥ 不是目录 ∥ 列不出来。
    if (!existsSync(dir)) { unreadable.push({ path: dir, reason: "no such directory" }); return }
    let st
    try {
      st = statSync(dir)
    } catch (e) {
      unreadable.push({ path: dir, reason: `read failed: ${e?.code ?? "unknown"}` })
      return
    }
    if (!st.isDirectory()) { unreadable.push({ path: dir, reason: "not a directory" }); return }
    let mdSeen = 0 // 整棵子树见过的 `.md` 名字数（零 ⇒ `no .md file`；被去重的那份也算见过——子树不是空的）
    let listFailed = false // 有目录列不出来 ⇒ 子树内容未观察完，"零 `.md`" 就是一句没人观察到的事实
    const stack = [[dir, ""]] // 显式栈：深处照样走（不限深度）；项 = [绝对路径, 层根相对前缀]
    while (stack.length > 0) {
      const [here, prefix] = stack.pop()
      let entries
      try {
        entries = readdirSync(here, { withFileTypes: true })
      } catch (e) {
        // 任一下潜目录列不出来 ⇒ 该目录进不可读集、其余照走（与层根同一臂，不另立原因词）。
        unreadable.push({ path: here, reason: `read failed: ${e?.code ?? "unknown"}` })
        listFailed = true
        continue
      }
      for (const ent of entries) {
        if (ent.isSymbolicLink()) continue // 一律不跟：既不判文件也不下潜（环保险）
        const rel = prefix ? `${prefix}/${ent.name}` : ent.name
        if (ent.isDirectory()) { stack.push([join(here, ent.name), rel]); continue }
        if (!/\.md$/i.test(ent.name)) continue
        mdSeen++
        const p = join(here, ent.name)
        try {
          members.push({ path: p, dirIndex, rel, text: readFileSync(p, "utf8") })
        } catch (e) {
          unreadable.push({ path: p, reason: `read failed: ${e?.code ?? "unknown"}` })
        }
      }
    }
    // 全子树零 `.md` ⇒ 该层根不可读（态 2 的第三因：声明对了、层里没档）。
    // 但「列不出来」与「层里没档」是两类可修面（KD-M1-65）：目录列不完时子树内容未知，
    // 再补一句 `no .md file` 就是拿没人观察到的事实指错方向（作者会去放档，该修的是权限）。
    if (mdSeen === 0 && !listFailed) unreadable.push({ path: dir, reason: "no .md file" })
  })
  // 整集排一次：目录序 → 层根相对路径码点序（`a < b` 比较，不用 localeCompare——跨机器同序）
  members.sort((a, b) => (a.dirIndex !== b.dirIndex ? a.dirIndex - b.dirIndex : a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0))
  const seen = new Set()
  const readable = []
  for (const m of members) {
    const key = pathKey(resolve(m.path).replaceAll("\\", "/")) // 嵌套根 ∥ 同目录大小写两种写法：同一份档（win32 折小写）
    if (seen.has(key)) continue // 保留首次出现（先出现的层根排在前面 ⇒ 排序键取它的层根）
    seen.add(key)
    readable.push({ path: m.path, text: m.text })
  }
  return { readable, unreadable }
}

/**
 * Inject the project standards section (PO-2 · 判据 ∥ 文案单源 = `docs/core/design/MANIFEST.md` §2.12).
 *
 * 标准层（`docRoot.standards`）= 一个**文档层（目录）**，不是一份档：层内成员 = 该目录**及其全部子目录**下的 `.md`
 * （大小写不敏感），按**层根相对路径**码点序；符号链接一律不跟（KD-M1-63）。
 *
 * 三态（**可机判互异**，本面立身之本 = 用声明、不猜固定名）：
 *   态 1 未声明 —— `docRoot.standards` 缺键 / `null` / 一个目录都没得来 ⇒ `NO_STANDARDS_NOTICE`
 *        （零路径字面、零 `declared`）。
 *   态 2 声明了但读不到 —— 逐目录 / 逐档都不可读 ⇒ `STANDARDS_UNREADABLE_NOTICE`（点名该**目录或该档**的
 *        绝对路径 + 原因）。绝不与态 1 同形。原因取值域 = `no such directory` ∥ `not a directory` ∥
 *        `no .md file` ∥ `read failed: <code>` ∥ `manifest read failed: <code>`——三类可修面不同
 *        （改路径 ∥ 改形态 ∥ 往层里放档；KD-M1-65）。
 *   态 3 读到 —— 逐档「定位注 + 正文」（目录序 + 层根相对路径码点序）；部分读不到时正文在前、半读句逐项点名不可读者。
 *
 * 取值源 = `read.ok && read.manifest ? read.manifest : DEFAULT_MANIFEST`（同 `declaredDocRoots` 先例，
 * 不另立第二套判定）⇒ 整档缺失 / 非法一律 `std === null` ⇒ 态 1；`dirs.length === 0 ⇒ 态 1` 是硬不
 * 变量——态 2 句永不含 `undefined` 路径。数据档本身读抛（非 ENOENT）收为态 2 族，不中断消息组装。
 *
 * @param {Object} agent — the parent agent（`cwd` / provider 取上下文窗口）
 * @param {string[]} parts — message parts (mutated)
 * @param {string[]} scopeFiles — 评审范围路径；base = 它们的归属项目根（`findProjectContextRoot`；无根 ⇒
 *   `agent.cwd`）。与 `injectDocumentMap` 同一 base、同一条推导。**无缺省**——非数组由该函数当场拒，拒因点名
 *   参数与收到的值。
 * @returns {string|string[]|null} 注入的标准档绝对路径（单份 = 串，多份 = 数组）；降级 ⇒ null
 */
export function injectProjectStandards(agent, parts, scopeFiles) {
  // base 先算：第三参不合契约时在改动 parts 之前就抛（消息里不留半段）。
  const base = findProjectContextRoot(agent.cwd, scopeFiles) ?? agent.cwd
  parts.push("## Project Standards")

  // 数据档本身读抛（权限 / 目录等——`readManifest` fail-closed 上抛）：收为态 2 族，不冒 `undefined`。
  let read
  try {
    read = readManifest(base)
  } catch (e) {
    parts.push(STANDARDS_UNREADABLE_NOTICE({ path: displayPath(manifestFilePath(base)), reason: `manifest read failed: ${e?.code ?? "unknown"}` }))
    parts.push("")
    return null
  }

  const std = (read.ok && read.manifest ? read.manifest : DEFAULT_MANIFEST).docRoot.standards
  // 态 1（两入口）：未声明（缺键 / null / undefined）∥ 声明了但一个合法目录都没得来。
  // 后者是硬不变量：宁可判「未声明」，也绝不发一句带 `undefined` 的「declared at …」。
  const dirs = std == null ? [] : docRootPaths(std, base)
  if (dirs.length === 0) {
    parts.push(NO_STANDARDS_NOTICE) // degraded — visible by contract
    parts.push("")
    return null
  }

  // 遍历 ∥ 排序 ∥ 嵌套去重全在 `collectStandardDocs`（本函数只留三态组装与预算——可读单元不变）。
  const { readable, unreadable } = collectStandardDocs(dirs)
  // 态 2：声明了，一份都读不到（句中路径 = 不可读集第一项——目录项与文件项同形）。
  if (readable.length === 0) {
    parts.push(STANDARDS_UNREADABLE_NOTICE({ path: displayPath(unreadable[0].path), reason: unreadable[0].reason }))
    parts.push("")
    return null
  }

  // 态 3：正文（一个层的全部档共用一次注入的同一预算——按**注入序**（目录序 → 层根相对路径码点序）拼接后一次截断）。
  // 逐档定位注先行（评审要知道读的是哪一份），多档多行、与正文同序。
  parts.push("The documents below are the project's standards — the `.md` files of the declared standards layer. Judge methodology compliance against them.")
  parts.push("")
  const blocks = readable.map((r) => ({ path: r.path, text: `<!-- standards file: ${displayPath(r.path)} -->\n${r.text}` }))
  const body = blocks.map((b) => b.text).join("\n\n")
  // 预算算式复用同两条常量、**逐注入独立计算**（不与指南共享池——两面语义不同，不该互相记账）。
  // providerSpec 取值在 body 之外算：上下文规格查不到也不得伪装成「没有标准档」。
  const resolvedProvider = agent.provider ?? agent._provider
  const ctx = providerSpec(resolvedProvider).context
  const cap = Math.max(PROJECT_GUIDE_MIN, Math.floor(ctx * PROJECT_GUIDE_FRACTION))
  let shown = body
  // 计量与切片**同一单位**（码点）：两条口径混用会让含星平面字符（emoji / 生僻字）的标准档在
  // 「其实全给了」时也报 PARTIAL、并给出 truncated at N of M 的假读数（M 是 UTF-16 长度）。
  const chars = [...body]
  if (chars.length > cap) {
    // 被截断的那一份（拼接期已有逐份偏移；偏移同以码点计）——恢复指针必须指向它，否则评审拿着残缺规矩判。
    let offset = 0
    let cut = blocks[blocks.length - 1].path
    for (const b of blocks) {
      const len = [...b.text].length
      if (cap < offset + len) { cut = b.path; break }
      offset += len + 2 // +2 = 拼接分隔符 "\n\n"
    }
    // 截断的风险不在大小，在**静默**：指南截断丢的是指针，标准层截断丢的是判据本身。
    shown = chars.slice(0, cap).join("") + `\n\n…(truncated at ${cap} of ${chars.length} chars — the standard set is PARTIAL;\nread the full file — ${displayPath(cut)} — for the rest)`
  }
  parts.push(shown)
  // 半读句：正文在前，缺口逐项点名（零静默——KD-M1-65）。
  if (unreadable.length > 0) {
    parts.push(STANDARDS_PARTIAL_NOTICE({ unreadable: unreadable.map((u) => `${displayPath(u.path)}: ${u.reason}`) }))
  }
  parts.push("")
  return readable.length === 1 ? readable[0].path : readable.map((r) => r.path)
}
