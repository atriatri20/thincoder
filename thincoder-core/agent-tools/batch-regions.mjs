/**
 * agent-tools/batch-regions.mjs — 批档门的两条 git 腿：收口面「本批笔域集」的档清单，与本批变更区。
 *
 * 判据句单源 = `docs/core/design/DOC-CHECK.md` §6：收口那一刻只判**本批变更区**——区内照判三件、区外一个字都不出。
 * 本档出三样东西，三样都是「哪些档 / 哪几行」这一侧的事实，判定归引擎：
 *   `committedDocs`——本批提交 diff 腿的**档清单**（笔域集的取材面）。
 *   `changedRegionsOf`——本批变更区（`git diff -U0 <批起 sha>` 的变更行），判域的行级事实。
 *   `stageDocs`——收口门自己那一笔 `git add`（§6「收口门自己把要判的档 `git add` 掉」）：写索引；取区不写索引。
 */
import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { relative, resolve } from "node:path"

/** 读档（读不到 ⇒ 空串：归属标注取不到就只出 `§N`，不猜）。 */
export function safeRead(abs) {
  try { return readFileSync(abs, "utf8") } catch { return "" }
}

/**
 * 改动面比对的基准（**结构判据，不是约定**）：批起快照是 `commit-tree -p HEAD` 造出来的**旁支**提交，
 * 永远不是 HEAD 的祖先；而快照机制上线前的批，记入行写的就是当时的 HEAD，后来每一笔提交都是它的后代。
 *   `git merge-base --is-ancestor <sha> HEAD` 退 0 ⇒ 旧形批（sha = 当时的 HEAD）⇒ 原样用 `<sha>`
 *   （含 `<sha>` 就是当前 HEAD 的情形：空 diff，与改前一致）
 *   退非 0 且 `<sha>^` 解得开 ⇒ 它是快照 ⇒ 取**第一父**（= 建档时的 HEAD）
 *   退非 0 且 `<sha>^` 解不开 ⇒ 照旧交 `<sha>` 原值（跑不出 ⇒ `ok: false` + 空集，不新造第四种退法）
 * 为什么不用「固定提交信息」识别：那是一条要靠人记的约定，谁改了那句话就断，而断了是**静默变宽**。
 */
function diffBaseOf(run, top, sha) {
  try {
    run(top, ["merge-base", "--is-ancestor", sha, "HEAD"])
    return sha // 退 0 = 祖先（含相等）⇒ 旧形批
  } catch {
    // 非祖先：要么是快照的旁支提交，要么是一个根本解不开的 sha——靠 `<sha>^` 分得开
  }
  try {
    run(top, ["rev-parse", "--verify", `${sha}^^{commit}`])
    return `${sha}^`
  } catch {
    return sha
  }
}

/** git 封装（`-c core.quotepath=false`：不关此开关时含非 ASCII 字节的路径整串被引号转义，下流判据会判假）。 */
const gitAt = (cwd, argv) => execFileSync(
  "git", ["-C", cwd, "-c", "core.quotepath=false", ...argv],
  { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 8000 },
)

/**
 * 本批提交 diff 腿（`git diff --name-only <base> HEAD`——只取清单，判定归引擎）：路径以**仓根**
 * （`rev-parse --show-toplevel`）为基还原——项目根住大仓子目录时条目不丢（清单相对仓根）。
 * `<base>` = `diffBaseOf` 判出的基准：旧形批 = 记入行的 sha；快照批 = 快照的**第一父**（建档时的 HEAD）。
 * 两个 sha 各管一头：读数基线取快照（设计席看到的那棵树），而「本批改过哪些档」只能从建档时的 HEAD 算起。
 * 跑不出（非仓 / sha 不可解析）⇒ `ok: false` + 空集（调用面按「基 sha 未定」明示，不静默）。
 */
export function committedDocs(root, sha) {
  const run = gitAt
  try {
    const top = run(root, ["rev-parse", "--show-toplevel"]).trim() || root
    const files = run(top, ["diff", "--name-only", diffBaseOf(run, top, sha), "HEAD"]).split(/\r?\n/).filter(Boolean)
    return { ok: true, base: top, files }
  } catch {
    return { ok: false, base: root, files: [] }
  }
}

/**
 * `git diff -U0` 的解析面：只认 hunk 头 `@@ -a,b +c,d @@`，按**新侧**取行。
 *   `d > 0` ⇒ 改后文本的 `c … c+d-1` 这几行就是变更行（纯新增 ⇒ 整份新档的每一行）。
 *   `d = 0` ⇒ 纯删：改后文本里没有可指的行，落成**零宽区间**——缝前那一行的行号 `c`（`0` = 档头）。
 * @returns {{rows:number[], gaps:number[]}} `rows` = 变更行（1-based）、`gaps` = 纯删的缝
 */
function regionsOfDiff(diffText) {
  const rows = []
  const gaps = []
  const re = /^@@ -\d+(?:,\d+)? \+(\d+)(?:,(\d+))? @@/gm
  let m
  const src = String(diffText ?? "")
  while ((m = re.exec(src)) !== null) {
    const start = Number(m[1])
    const count = m[2] === undefined ? 1 : Number(m[2])
    if (count > 0) for (let i = 0; i < count; i += 1) rows.push(start + i)
    else gaps.push(start)
  }
  return { rows, gaps }
}

/**
 * 收口门自己那一笔 `git add`（判据句单源 = `docs/core/design/DOC-CHECK.md` §6）：门要判的档先进索引，再取变更区。
 *
 * 为什么门自己动手：索引外的档 `git diff <sha>` 看不见（未跟踪档整份不出现；「快照里有、索引里没有」的档反被
 * 报成整份删除）——两种看不清都不是「这一档没改」。而收口那一刻没人替它 add，所以门自己把该加的加上：
 * 新档进了索引，`git diff -U0 <批起 sha>` 对它天然出「整份新增」，整份就是变更区，三件照判。
 *
 * **按路径限定，不 `git add -A`**：别人的半成品不进索引。某一档加不进去（`.gitignore` 挡住 ∥ `index.lock` 被占 ∥ 非 git 目录）
 * ⇒ 跳过去：它仍在索引外 ⇒ `git diff` 看不见它 ⇒ 变更区落空 ⇒ **零输出**（§6 对「判不出变更区」的同一个处置，
 * 不造拒绝、不造点名）。这一支与「误报」的取舍同向：判不准的就不判，代价照实认在 §5 的落地核对里。
 * 这里不替它造一个区间，也不把它报成「已判」。
 *
 * 执行点只有收口门两处（`batch-gate.mjs` 的 `evaluate` 收口臂 ∥ `doc_check` 的 `gate` mode）；
 * `report` 面与写门不 add（`report` 是诊断面、判整份；写门判的是手上正在写的文本）。
 *
 * @param {string} root 项目根（git 命令的起点；仓根由 `rev-parse --show-toplevel` 还原）
 * @param {string[]} files 要加的档（绝对路径，或相对 `root` 的路径）
 * @returns {string[]} 真加进去的档（仓根相对形；供调用面自检，判域与报面都不读它）
 */
export function stageDocs(root, files) {
  let top
  try { top = gitAt(root, ["rev-parse", "--show-toplevel"]).trim() || root } catch { return [] }
  const staged = []
  for (const f of Array.isArray(files) ? files : []) {
    const abs = resolve(root, String(f))
    const rel = relative(top, abs).replace(/\\/g, "/")
    if (rel === "" || rel.startsWith("../")) continue // 仓外（不是这一批的档）
    try { gitAt(top, ["add", "--", rel]); staged.push(rel) } catch { /* 加不进去（`.gitignore` ∥ 非 git）⇒ 交给取区那一腿照实出结果 */ }
  }
  return staged
}

/**
 * 本批变更区（判据句单源 = `docs/core/design/DOC-CHECK.md` §6）：**建档之后这份档动过的那几行**。
 *
 * 取法 = `git diff -U0 <批起 sha> -- <该档>`，`<批起 sha>` 对比**现工作树**（不对比 HEAD）：提交没提交都在里面。
 * 三条落空同处置（`ok: false` + 空表）——调用面据此让每一档都没有要判的行、一个字都不出：
 *   ① 记入行取不到 sha（`null`）∥ 那个对象读不到；② 非 git 目录；③ **旧形批**：
 *   `merge-base --is-ancestor <sha> HEAD` 成立 ⇒ 记入行是一份旧 HEAD 提交，它的树里没有当时的未提交改动，
 *   差值会把「批起时就带在身上的改动」算成本批的 ⇒ 判不出来（§6「② 的失败面」）。
 *
 * **本档只算区间、不问索引、也不执行 add**（§6）：写索引那一笔在调用方（`stageDocs`，收口门两处各调一次），
 * 所以这里不带「不在索引就跳过」那一支——带了它，收口门 add 完照样被跳过，等于没加。
 *
 * 键 = `resolve(<档>)`（消费面按同一形取键，两侧都用绝对路径归一后的串）；只收有变更的档——
 * 没有变更行就没有条目，消费面据此判「这一档没有要判的行」。
 *
 * @param {string} root 项目根（git 命令的起点；仓根由 `rev-parse --show-toplevel` 还原）
 * @param {string|null} sha 批起 sha（调用方从批档 §1 的记入行取，取法单源 = `batch-gate.mjs` 的 `baseShaOf`）
 * @param {string[]} files 候选档（绝对路径，或相对 `root` 的路径）
 * @returns {{ok:boolean, base:string, regions:Map<string,{rows:number[],gaps:number[]}>}}
 */
export function changedRegionsOf(root, sha, files) {
  const regions = new Map()
  if (typeof sha !== "string" || !/^[0-9a-f]{40,64}$/i.test(sha)) return { ok: false, base: root, regions }
  let top
  try {
    top = gitAt(root, ["rev-parse", "--show-toplevel"]).trim() || root
    gitAt(top, ["rev-parse", "--verify", `${sha}^{commit}`])
  } catch {
    return { ok: false, base: root, regions } // 非 git 目录 ∥ 那个对象读不到
  }
  try {
    gitAt(top, ["merge-base", "--is-ancestor", sha, "HEAD"])
    return { ok: false, base: top, regions } // 旧形批：基线是旧 HEAD 提交 ⇒ 变更区判不出来
  } catch {
    // 非祖先 = 快照的旁支提交（或一个解不开的 sha，上一行 `rev-parse --verify` 已挡）⇒ 照判
  }
  for (const f of Array.isArray(files) ? files : []) {
    const abs = resolve(root, String(f))
    const rel = relative(top, abs).replace(/\\/g, "/")
    if (rel === "" || rel.startsWith("../")) continue // 仓外（不是这一批的档）
    let diff
    try { diff = gitAt(top, ["diff", "-U0", sha, "--", rel]) } catch { continue } // 这一档取不到 ⇒ 它没有要判的行
    const r = regionsOfDiff(diff)
    if (r.rows.length > 0 || r.gaps.length > 0) regions.set(resolve(abs), r)
  }
  return { ok: true, base: top, regions }
}
