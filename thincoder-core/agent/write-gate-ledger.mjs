/**
 * agent/write-gate-ledger.mjs — 写门**第三道门**（笔-账绑定写锁）的实现面。
 *
 * 2026-11-05 拆档族从 `agent/write-gate.mjs` 整体迁出：写锁的判据本体、拒文组装、项目根取法与
 * 入口集枚举全住本档；原档 import 回来并**原样 re-export** `ledgerBindWriteConflict`——导出名、
 * 参数表、返回值、拒文逐字不变，`dispatch.mjs` 挂点零改。
 *
 * 为什么切开：笔-账绑定（读 manifest + 开台账库，异步 IO 重）与文档面 / 写盘面判定（只看路径集，
 * 同步）是两道并列门；同档混住时改任一道都要趟过对方 300 行。
 *
 * 依赖单向：`本档 ← write-gate.mjs`（原档的 `underBase` / `batchRecordWriteConflict` 反向取
 * `gateKey` —— 故 `gateKey` 由本档导出；本档不 import 原档）。
 *
 * 判据全文与逐版沿革住原档档头（§2.3「写锁」条）——本档只承载实现，不重复那套说明。
 *
 * 2026-11-08 工作区根窄口批（设计档 §2.3.1）：目标沿祖先链取不到项目根时，判据不止「拒」一条路了——
 * 四条同时成立（目标在会话锚子树内 ∧ 锚下有带 manifest 的直接子目录 ∧ 调用方显式声明 `project` ∧
 * 声明本身解析得出根）⇒ 按声明根判号。实现面 = 本档 `workspaceRoot`；判据全文在**原档档头**那一节。
 * 会破这条界（锚开始判「判谁的账」）的形只有一种——回落；门上没有那条臂。
 */
import { existsSync } from "node:fs"
import { join, resolve } from "node:path"
// 项目根推导 + manifest 读面（写锁判据 · 2026-11-03 笔-账绑定批）：判据按**调用方声明的项目**问该根台账（§2.3）。
// `MANIFEST_REL` = 「自身即带 manifest」那一支的判据（决策 41 的 (a) 支）。
import { MANIFEST_REL, readManifest, resolveProjectRoot } from "../manifest.mjs"
// 项目梯单源（定义处 = `thincoder-core/manifest-discovery.mjs`，`thincoder-core/manifest.mjs` 只是转口）：
// 窄口条件 ③「锚下有带 manifest 的直接子目录」= `discoverProjects(锚)` 的 `kind` ∥ `matched` 两值，
// 不新写目录扫描——本档是它的第二个消费面，不是第二份判据。
import { discoverProjects } from "../manifest-discovery.mjs"
// 工具自报触达面单源谓词（写锁的路径集由判据函数自己算——§2.3；与门禁 / 变更记账同一枚谓词）。
import { toolTouchPaths } from "./helpers.mjs"

/** 比较键（绝对形态归一：`.` 段归位 + 分隔符归一 `/` + win32 大小写归一——§6.29.1 判据）。
 *  两档共用一枚：本档的取根判据（`underKey`）与原档的批次档写门（`underBase` /
 *  `batchRecordWriteConflict`）比较的是同一个坐标系——故本档导出、原档 import 回去。 */
export const gateKey = (p) => {
  const s = resolve(String(p)).replace(/\\/g, "/")
  return process.platform === "win32" ? s.toLowerCase() : s
}

// ─── 写锁（第三道门 · 2026-11-03 笔-账绑定批 · 设计档 §2.3）───────────────────────────

/** 写门入口集（设计档 §2.3）：判据 = 「凡能把字节落到项目内的工具」。十二把 = 写盘七件 +
 *  两把命令工具（`bash` ∥ `execute`）+ 两把结构化 action 工具（`manifest` ∥ `memory` 按各自的枚举判——
 *  决策 39）+ `ssh`（只有 `get` 落盘，按 action 判）。
 *  `git` **不在集内**（2026-11-05 免号批 · 决策 37 改判）：它不落新字节，提交记录的是已被本门缴过账的
 *  内容——写型与只读型在这里同判，两者都不问。
 *  `settings`（写 `~/.thincoder/config.json`）∥ `browser`（自有 profile 与截图目录）不写项目内档 ⇒ 不进。
 *  `ledger` ∥ `batch` 也不进——挂行与开档不经过写面，「没号就挂不了账」的锁死因此不存在。 */
const LEDGER_ENTRY_TOOLS = new Set([
  "write", "edit", "insert_after", "apply_patch", "delete", "hashline_edit", "file_ops",
  "bash", "execute", "manifest", "memory", "ssh",
])
/** 结构化 action 工具的写型枚举（按值判，不解析内容——决策 37 ∥ 39 同法）。 */
const MANIFEST_WRITE_ACTIONS = new Set(["init", "write"])
/** `memory` 里**能落 project 层档**的写型 action：`put` 按 `layer`、`delete` 按 `layer` ∥ id 前缀。
 *  `clear` 只对 personal 开放（该 action 自己拒 shared 层）∥ `maintain` 无 `layer` 参数（库级维护——MEMORY.md §6.6.1）
 *  ⇒ 两者都落不到 `<项目>/.thincoder/memory/**`，故不进枚举（枚举只收真能落项目内档的值——空的覆盖项比没有更坏）。 */
const MEMORY_WRITE_ACTIONS = new Set(["put", "delete"])
/** `memory` 的落盘目标按层分：只有 `project` 层写 `<项目>/.thincoder/memory/**`（`personal` ∥ `team` 落用户数据目录）。 */
const MEMORY_PROJECT_LAYER = "project"
/** 单条删除的层由 id 前缀定（`layer` 可省——`thincoder-core/memory/memory-tool.mjs` 的 `execDeleteSingle`
 *  逐字「layer is OPTIONAL … else the id prefix routes the delete」）⇒ 前缀与 `layer` 同判：
 *  只看 `layer` 会漏掉「不带 layer、按 `project:` 前缀删 project 层档」这条写项目内字节的路。 */
const MEMORY_PROJECT_UID_PREFIX = "project:"
/** 在途行的状态词（台账六态之一）：只有它携带写权。 */
const IN_FLIGHT_STATUS = "在途"

/** 拒文（逐字 = 设计档 §2.3——机检可断言）：一条基串 + 按情形选的 `<case>` + 用法句 + 本项目在途清单 + 挂号两步。
 *  `ledger` ∥ `project` 都不进 `required`（决策 35 ∥ 42）⇒ 模型不知道有这两个参数，第一次撞的就是这条拒文，
 *  它是这条设计唯一的教学面（决策 38）：缺什么 / 要带什么（**两个输入一次点出**）/ 当下有哪些号可带，缺一不可。 */
const LEDGER_PARAM_SENTENCE = 'Pass project:<the project root that carries PROJECT-MANIFEST.json> and ledger:"#N" on this call — engineering mode binds every write to a project and to the in-flight ledger row it serves; a call that names neither is refused.'
const LEDGER_HANG_STEPS = 'If none is in flight, hang one first — neither step is a write: ① ledger({action:"add", title, kind, cwd:<project root>}) hangs the row; ② batch({action:"create", ledger:"#N", topic, source}) opens the record over it (row → 在途).'
/** 清单上限（设计档 §2.3）：在途行多时逐条列全会把教学面变成台账导出。 */
const LEDGER_LIST_LIMIT = 10

const CASE_NO_NUMBER = "no ledger number on this call"
const CASE_NO_PROJECT = "no project on this call"
/** 无项目时清单位的三种取值（见 `ledgerNoProjectRefusal`）：缺声明 ∥ 声明无效 ∥ 写盘目标不在任何项目里。
 *  三种各用自己的一句：一句里两个结论会让读拒文的人分不清该改哪一边。 */
const LIST_UNKNOWN_NO_PROJECT = "unknown — no project on this call"
const LIST_UNKNOWN_NOT_A_PROJECT = "unknown — the declared project is not a project"
const LIST_UNKNOWN_TARGET_NOT_A_PROJECT = "unknown — no project owns this write's target"
const CASE_UNREADABLE = "no ledger can be read for this project"
const caseNotRowNumber = (raw) => `ledger number ${JSON.stringify(String(raw))} is not a row number — pass "#N" or "N"`
const caseNoSuchRow = (no) => `row #${no} does not exist in this project's ledger`
const caseNotInFlight = (no, status) => `row #${no} is ${JSON.stringify(String(status))} — only a ${IN_FLIGHT_STATUS} row carries writes`
/** 声明无效（设计档 §2.3 拒文表逐字：`declared project is not a project (no PROJECT-MANIFEST.json at this path or
 *  within the session anchor): "<path>"`）—— 声明与写盘目标两种申报形共用这一句：两者都没在每个被搜过的位置
 *  找到 manifest（写盘目标沿祖先链搜得更远，那句括注仍然为真）。 */
const caseNotAProject = (p) => `declared project is not a project (no PROJECT-MANIFEST.json at this path or within the session anchor): ${JSON.stringify(String(p))}`
/** 工作区根窄口的两句新拒文（设计档 §2.3.1 拒文表 ④∥⑤ 逐字）：口子没开成的时候要能读出**是哪一条没成立**——
 *  两句分开写，合成一句就会把「目标在界外」读成「锚下没子项目」，两条修法完全不同。
 *  ①②③⑥ 四支不新写：决策 41 的核心（声明缺 ∥ 声明无效 ⇒ 拒）一字没改，新口子不咬旧拒文。 */
const caseOutsideAnchor = (p) => `target is outside the session anchor's subtree — the workspace-root opening does not apply: ${JSON.stringify(String(p))}`
const caseNoSubProject = (p) => `the session anchor carries no sub-project — the workspace-root opening does not apply: ${JSON.stringify(String(p))}`

/** 当下在途行清单（决策 38 的第三件）：`#N, #M …`；无 ⇒ `none`；超上限折 `… +K more`。 */
function ledgerInFlightList(rows) {
  const nums = (Array.isArray(rows) ? rows : [])
    .filter((r) => r?.status === IN_FLIGHT_STATUS)
    .map((r) => `#${r.id}`)
  if (nums.length === 0) return "none"
  if (nums.length <= LEDGER_LIST_LIMIT) return nums.join(", ")
  return `${nums.slice(0, LEDGER_LIST_LIMIT).join(", ")}, … +${nums.length - LEDGER_LIST_LIMIT} more`
}

/** 拒文组装（可读台账形）：基串 + `<case>` + 用法句 + 在途清单 + 挂号两步。
 *  清单按「**本项目的**账」说（判据点换成声明后，号只在那一个项目的账上成立）。 */
function ledgerRefusal(caseText, rows) {
  return `write refused — ledger row not bound: ${caseText}. ${LEDGER_PARAM_SENTENCE} In-flight rows in this project's ledger right now: ${ledgerInFlightList(rows)}. ${LEDGER_HANG_STEPS}`
}

/** 拒文组装（无项目形）：没有可判的项目就没有「本项目的账」可问——清单位写 `unknown` 并点名哪一种无效，
 *  **不写 `none`**（那会把「不知道判哪个项目」说成「本项目一条在途行都没有」，模型会照它去挂号而忘了声明项目）。
 *  两种无效的项目各用自己的清单句：声明缺失 ≠ 声明了个不是项目的东西，一句里两个结论会让读拒文的人分不清。
 *  用法句仍把两个输入一起点出（R33：三件在每一支都在位）。 */
function ledgerNoProjectRefusal(caseText, listText) {
  return `write refused — ledger row not bound: ${caseText}. ${LEDGER_PARAM_SENTENCE} In-flight rows in this project's ledger right now: ${listText}. ${LEDGER_HANG_STEPS}`
}

/** 拒文组装（台账读不到形）：基串 + `<case>` + 用法句 + 挂号两步，另起一行带原始错误；
 *  **不列在途清单**——读不到就没有清单，写个 `none` 是把「读不到」说成「一条都没有」。 */
function ledgerUnreadableRefusal(caseText, error) {
  return `write refused — ledger row not bound: ${caseText}. ${LEDGER_PARAM_SENTENCE} ${LEDGER_HANG_STEPS}\n(ledger unreadable — ${error})`
}

/** 台账号解析（`#` 可省——`"#2016"` 与 `"2016"` 同判，设计档 §2.3）：三种结果
 *  `{ case: "missing" }`（未传 / 空串 / 全空白）· `{ case: "form", raw }`（剥前导 `#` 后非纯数字）· `{ no }`。 */
function parseLedgerNo(raw) {
  if (raw === undefined || raw === null) return { case: "missing" }
  const text = String(raw).trim()
  if (text === "") return { case: "missing" }
  const m = /^#?(\d+)$/.exec(text)
  if (!m) return { case: "form", raw: text }
  return { no: Number(m[1]) }
}

/** 该根台账的行集（判据的第二个输入）。两种「根」不是一回事（§2.3 的钉子）：根**不在**（声明无效）
 *  由调用方在取根那一步拒（`declared project is not a project`）；manifest **在而不可用**（读不动 / 坏 JSON）
 *  与库开不了 ⇒ 返回 `error`，一律落拒——判的是「是不是项目」，不是「项目好不好用」。 */
async function ledgerRowsOf(root) {
  try {
    const man = readManifest(root)
    if (!man?.ok) {
      const detail = (man?.errors ?? []).filter((s) => typeof s === "string" && s).join("；")
      return { rows: [], error: detail || String(man?.reason ?? "manifest unusable") }
    }
  } catch (e) {
    return { rows: [], error: String(e?.message ?? e) }
  }
  try {
    // W8 契约②：node:sqlite 链只经动态 import 进入（勿升静态）。
    // `boundary` 必传、传的就是刚算出的那个根：`openLedger` 首行即 `resolve(boundary)`，
    // 缺省直接抛 ⇒ 每一笔写都被判成「台账读不到」（§2.3 读法）。
    const { ledgerQuery } = await import("../ledger.mjs")
    const rows = ledgerQuery({ cwd: root, boundary: root })
    return { rows: Array.isArray(rows) ? rows : [], error: null }
  } catch (e) {
    return { rows: [], error: String(e?.message ?? e) } // fail-closed：读不到不等于放行
  }
}

/**
 * 判据函数（**模块内，不导出**——唯一消费方是本门的判据本体；导出去就是下一个零消费符号）：
 * 已算出的项目根 → 该根台账的行集 → 按 `id` 找本笔报的那一行（设计档 §2.3「读法」）。
 *
 * **判据点不再是「目标自身推根」**（2026-11-03 项目声明面批 · 决策 40）：项目由调用方声明，本函数只负责
 * 「拿一个已成立的项目根 + 一个号」这一半；「根从哪来」由 `ledgerGateTargets` + `resolveDeclaredRoot` 回答。
 * 判据点不存在（不在任何项目里）现在由调用方落 `declared project is not a project`，不再是「门不管」。
 *
 * **不为门新增按 id 的列过滤**（§2.3）：`ledgerQuery` 现有过滤键只有 `status` / `kind` / `board` /
 * `trigger` / `task_book`，行集取全量后按 `id` 找——同一笔写的多根按 `root` 缓存，一次写只读一遍账。
 *
 * @param {string} root — 已成立的判据点（项目根绝对路径）
 * @param {number|null} ledgerNo — 本笔报的行号（缺号 / 非行号形时传 null）
 * @param {Map<string, object>|null} [cache] — 同一笔写的根 → 行集（多目标同项目时只问一次台账）
 * @returns {Promise<{row: object|null, rows: object[], error: string|null}>}
 *   `row` = 找到的那一行（查不到 ⇒ null）；`error` = 读不到时的原始错误（fail-closed 拒文点名它）
 */
async function ledgerRowAt(root, ledgerNo, cache = null) {
  let base = cache instanceof Map ? cache.get(root) : null
  if (!base) {
    base = await ledgerRowsOf(root)
    if (cache instanceof Map) cache.set(root, base)
  }
  if (base.error) return { row: null, rows: [], error: base.error }
  const row = ledgerNo === null ? null : base.rows.find((r) => Number(r?.id) === ledgerNo) ?? null
  return { row, rows: base.rows, error: null }
}

/** 声明项目的取根（设计档 §2.3「两个分支的落法」/ §5 R31）——**界 = 相关性判据，不是单向的「不许越界」**：
 *  (b) 支 = 既有单源 `resolveLedgerRoot(声明, agent.cwd)`：起点在会话锚之内 ⇒ 沿祖先链上溯到最近带 manifest 的目录；
 *  (b) 取不到再走 (a) 支 = 声明路径**自身即带 manifest**且会话锚在它之下 ⇒ 根 = 声明路径（`basis = self`，不上溯）。
 *  **为什么 (a) 支要门自己判一次**：`resolveLedgerRoot` 的上溯界就是会话锚，起点落在界之上时它取不到根；
 *  而「会话 cwd 在项目子目录」正是项目指南记录的启动形（`cd thincoder/thincoder-cli && node bin/thincoder.cjs`）——
 *  不认这一支，那种会话里 `bash` ∥ `memory` 声明根也被拒、声明子目录也被拒 = 无解。
 *  两支都取不到（不存在 ∥ 平级目录 ∥ 不含锚的更远祖先 ∥ 界内上溯无 manifest）⇒ null（拒，点名该路径）。
 *  **会话锚在这两支里都不是「判哪个项目」的答案**（决策 41）：它只用来定界与判相关性。
 * @param {string} declared — 调用方给的项目声明（绝对 ∥ 相对；相对按会话 cwd 解析）
 * @param {string} cwd — 会话锚
 * @returns {Promise<{root: string, basis: "self"|"ancestor"}|null>} */
async function resolveDeclaredRoot(declared, cwd) {
  const start = resolve(cwd, String(declared))
  // 声明路径不存在 ⇒ 拒（§5 R31 四态第一态）：不加这一行，`owningProject` 会从一条不存在的路径上溯，
  // 把拼错的声明归到会话自己那个项目上——那正是本批要关掉的「会话锚当判据点」（决策 41）。
  if (!existsSync(start)) return null
  // W8 契约②：node:sqlite 链只经动态 import 进入（`resolveLedgerRoot` 与 `ledgerQuery` 同住该链；模块已缓存）。
  const { resolveLedgerRoot } = await import("../ledger.mjs")
  const owned = resolveLedgerRoot(start, cwd)
  if (owned) return { root: owned.root, basis: owned.basis }
  if (existsSync(join(start, MANIFEST_REL)) && underKey(start, cwd)) return { root: start, basis: "self" }
  return null
}

/** `child` 是否等于 `root` 或在其子树内（比较键 = `gateKey`：绝对化 + `/` 归一 + win32 大小写归一）。 */
function underKey(root, child) {
  const r = gateKey(root)
  const c = gateKey(child)
  return c === r || c.startsWith(r.endsWith("/") ? r : r + "/")
}

/**
 * 工作区根窄口（设计档 §2.3.1 · 用户 2026-11-08 00:13 裁 B 形）：**目标取不到项目根时，换一个判据点。**
 *
 * 入参 = 目标绝对路径（已判过 `resolveProjectRoot` = null）+ 会话锚 + 调用方声明；出 = `{root}` 或 `{refusal}`。
 * 判序按设计档那三步，**声明先于界**：声明本身不是项目时，谈「目标在不在锚子树内」没意义——先修声明。
 *   ① 声明解析（`resolveDeclaredRoot`，既有零改）：路径不存在 ∥ 不是项目 ∥ 与锚无关键 ⇒ 落 `declared project is not a project`（旧串）
 *   ② 目标在会话锚子树内（`underKey`，既有零改）⇒ 不成立落「锚外」那句（新串）
 *   ③ 锚下有带 manifest 的直接子目录（`discoverProjects` 的 `kind` ∥ `matched`）⇒ 不成立落「锚下无子项目」那句（新串）
 * 四条全中 ⇒ 判据点 = 声明解析出的项目根，号照原样判（号那半一字未改）。
 *
 * **锚在这里是界，不是账**：它只回答「目标在不在我这一层工作区」，不回答「判谁的账」——账仍由声明给（决策 41
 * 的核心），所以没有声明这一支连口子都不进（条件 ④ 不成立）。
 *
 * 代价照写：路径比较沿用 `gateKey` 一枚坐标（不解析符号链接）——目标经锚内链接指向锚外时仍按字面路径算在界内。
 * 另立一套 realpath 坐标系就会出现「路径判据说在界内、声明判据说在界外」。
 *
 * @param {string} target — 本笔写的目标绝对路径（已确认取不到项目根）
 * @param {string} anchor — 会话锚（= `agent.cwd` 的 resolve 形）
 * @param {string} declared — 调用方给的 `project`（非空；条件 ④ 不成立时本函数不被调用）
 * @returns {Promise<{root: string}|{refusal: {caseText: string, listText: string}}>}
 *   `refusal` 的两个字段直接喂 `ledgerNoProjectRefusal`（`<case>` + 清单单位成对出）
 */
async function workspaceRoot(target, anchor, declared) {
  const resolved = await resolveDeclaredRoot(declared, anchor)
  if (!resolved) {
    return { refusal: { caseText: caseNotAProject(declared), listText: LIST_UNKNOWN_NOT_A_PROJECT } }
  }
  if (!underKey(anchor, target)) {
    return { refusal: { caseText: caseOutsideAnchor(target), listText: LIST_UNKNOWN_TARGET_NOT_A_PROJECT } }
  }
  const found = discoverProjects(anchor)
  if (!(found.kind === "workspace" && found.matched === "manifest")) {
    return { refusal: { caseText: caseNoSubProject(target), listText: LIST_UNKNOWN_TARGET_NOT_A_PROJECT } }
  }
  return { root: resolved.root }
}

/** 本笔的判据点（设计档 §2.3「判据点怎么来」· 决策 40）：**只有两个来源，都来自调用方**——
 *  ① 该工具自带的定位参数：写盘七件的目标路径（`toolTouchPaths`）· `execute.workdir` · `manifest.target`；
 *  ② 新参数 `project`（项目根绝对路径，纯声明）。**定位参数优先**，`project` 只在定位参数缺位时被读。
 *  **会话锚不作判据点**（决策 41）：`bash` ∥ `memory` 没有定位参数，缺 `project` 即拒；
 *  `execute` ∥ `manifest` 缺定位参数时同样不回落到 cwd。
 *  三种结果：`{ paths }`（按路径所属项目判）· `{ declared }`（按声明取根）· `{ none: true }`（无判据点 ⇒ 拒）；
 *  写盘工具连路径都没有 ⇒ null（工具自己拒，本门不问）。
 *
 *  **写盘七件额外带 `fallbackDeclared`（2026-11-08 窄口批 · 设计档 §2.3.1）**：它们的定位参数是一个个目标，
 *  「取不取得得到根」要逐目标才知道（本函数不算），所以声明只随行不生效——某目标取不到根时它在判序里补位，
 *  取得到根时它不参与（定位参数优先）。用另一个键名而不是复用 `{ declared }`：两个分支的判据不同（那里是
 *  「只有声明」，这里是「声明挂在路径后面」），同名会让分支判断分不开。 */
function ledgerGateTargets(agent, toolName, tool, args) {
  const cwd = resolve(agent?.cwd ?? ".")
  const asAbs = (p) => (typeof p === "string" && p.trim() ? resolve(cwd, p) : null)
  const declared = typeof args?.project === "string" && args.project.trim() ? args.project.trim() : null
  const onlyDeclared = () => (declared ? { declared } : { none: true })
  if (toolName === "bash" || toolName === "memory") return onlyDeclared()
  if (toolName === "execute") {
    const wd = asAbs(args?.workdir)
    return wd ? { paths: [wd] } : onlyDeclared()
  }
  if (toolName === "manifest") {
    const t = asAbs(args?.target)
    return t ? { paths: [t] } : onlyDeclared()
  }
  const paths = toolTouchPaths(tool, args)
    .filter((p) => typeof p === "string" && p.trim())
    .map((p) => resolve(cwd, p))
  return paths.length === 0 ? null : { paths, fallbackDeclared: declared }
}

/** 本笔是否需要号（工具自己的枚举判写型——不解析命令字面，决策 36 的禁令不碰）：
 *  `manifest` 的 `init` ∥ `write` 都要号——
 *  `init` 的豁免是条件形（决策 43：目标沿祖先链取不到项目根时在取根步跳过本门），不是摘出要号集；
 *  `memory` 只对落 project 层档的写型 action 要号（`layer:"project"` ∥ 单条删除的 `project:` 前缀——
 *  后者不带 `layer` 也能删 project 层档，只看 `layer` 就漏了那条路）；`ssh` 只对 `get` 要号（`put` 写的是
 *  远端主机，其余动作不写项目内档——缺此分支则整个会话面都要号，把会话面整条打死）。
 *  `git` 没有分支（它不在入口集——写型与只读同为不要号，故无需按 action 分判）。 */
function ledgerGateApplies(toolName, tool, args) {
  if (toolName === "manifest") return MANIFEST_WRITE_ACTIONS.has(String(args?.action ?? ""))
  if (toolName === "memory") return memoryTargetsProjectLayer(args)
  if (toolName === "ssh") return String(args?.action ?? "") === "get"
  return true
}

/** `memory` 这一笔是否落 project 层：`layer:"project"`，或单条删除的 id 前缀 = `project:`（`layer` 省略时
 *  工具按前缀路由到 project 层）。两个输入都是工具自己的枚举 ∥ 约定，不解析笔记内容（决策 36 的禁令不碰）。
 *  显式给了别的层 ⇒ 不过本门（工具自己按该层处置——前缀不符它会拒）。 */
function memoryTargetsProjectLayer(args) {
  const action = String(args?.action ?? "")
  if (!MEMORY_WRITE_ACTIONS.has(action)) return false
  const layer = String(args?.layer ?? "").trim()
  if (layer === MEMORY_PROJECT_LAYER) return true
  if (layer !== "") return false
  const id = args?.id
  return typeof id === "string" && id.startsWith(MEMORY_PROJECT_UID_PREFIX)
}

/** 判序第三步：按号找行、判 `status`（号四情形——缺 ∥ 非行号形 ∥ 不在盘 ∥ 非在途）。
 *  `at.error` 非空 = 该根台账读不到 ⇒ 拒（真业务门：读不到不等于放行）。 */
function ledgerRowRefusal(parsed, at) {
  if (at.error) return ledgerUnreadableRefusal(CASE_UNREADABLE, at.error)
  if (parsed.case === "missing") return ledgerRefusal(CASE_NO_NUMBER, at.rows)
  if (parsed.case === "form") return ledgerRefusal(caseNotRowNumber(parsed.raw), at.rows)
  if (!at.row) return ledgerRefusal(caseNoSuchRow(parsed.no), at.rows)
  if (at.row.status !== IN_FLIGHT_STATUS) return ledgerRefusal(caseNotInFlight(parsed.no, at.row.status), at.rows)
  return null
}

/**
 * 写锁判据组装（**第三道门**——与跨批档写 / D5 冻结窗并列挂 `dispatch.mjs` Phase 1）：
 * 辖内任何写盘 ∥ 跑命令 ∧ 本笔**同时给出项目与号**而号不是该项目台账里的 `在途` 行 ⇒ 冲突；否则 null。
 *
 * **判据只有一条，零上位条件**（§2.3）：不判批档状态、不判指针互指。多一个合取项，就会在某个真实场景
 * 变成「机制走不通」的证据，接着被用来把整套机制废掉。
 *
 * **为什么是笔-账绑定**：写盘工具的参数原本只有路径与内容，门只能问「这个仓有没有在途行」——一条在途行
 * 于是放行该根下任何一笔写，它拦不住「有账但在做别的事」。判据换成「这笔写替哪条账服务」，门才第一次
 * 看得见写者报的是哪条账（决策 34；形状 = 用户 2026-11-03 02:02 裁的「甲 · 逐笔带号」——轮内绑定会把
 * 几件异步在做的事压成一条账）。
 *
 * **`bash` ∥ `execute` 与写盘工具同一判据**（决策 36）：命令行内容无法可靠静态分类（`node -e` /
 * `npm run <脚本>` / 参数拼接都能落盘），按字面分类本身就是第二个洞。代价 = 工程模式下父侧任何
 * `bash` ∥ `execute` 都要有在途行（含 `npm test` / `git status`），正路 = 先挂行再干活。
 *
 * **面不参与放行**：文档面、项目状态档、产品代码面、产品测试面读同一条判据。
 * 挂门范围（工程模式 ∧ `depth = 0`）说的是「谁被这条门问到」，不是判据的合取项。
 *
 * **判据点 = 调用方声明的项目**（2026-11-03 项目声明面批 · 决策 40）：会话锚可以是容器根 / 工作区根，
 * 拿它当判据点时那种形态下本门永不设防（实机：2026-11-03 02:53 重启后 `bash` 不带号照放行）。
 * 现在只有两个来源、都来自调用方：① 工具自带的定位参数；② `project`（项目根绝对路径）。
 * **会话锚不作判据点**（决策 41）：声明缺位 ⇒ `no project on this call`；声明无关键或取不到根 ⇒
 * `declared project is not a project`——没有「推不出 ⇒ 门不管」那条臂。
 *
 * **窄口（2026-11-08 工作区根批 · 设计档 §2.3.1）**：写盘七件的目标取不到项目根时，四条同时成立（目标在
 * 会话锚子树内 ∧ 锚下有带 manifest 的直接子目录 ∧ 本笔显式声明了 `project` ∧ 声明解析得出根）⇒ 判据点
 * 换成声明根。**锚在这里仍是界**：它回答「目标在不在我这一层工作区」，不回答「判谁的账」——所以没有声明
 * 这一支连口子都不进；也没有任何「不声明就放过」的默认。
 *
 * 与既有「工程模式父侧门」（同 Phase 1 的设计门，非读取路径按面判拒）是**两件事**：前门问「设计做没做」，
 * 本锁问「这笔写替哪条在途行服务」。所以并列、不替换。
 *
 * **业务门语义**：台账读不到（库不可开 / 根推得出而 manifest 不可用）⇒ **拒**，拒文另起
 * `(ledger unreadable — <原错>)` 一行——读不到不等于放行。
 * **只在工程模式生效**（开关 = `agent.config?.agent?.engineering`，与设计门同一枚）；普通模式按
 * `docs/core/requirements/NORMAL-MODE.md` 的「纪律自持」不动。
 *
 * @param {Object} agent — 会话 agent（读 `config.agent.engineering` / `cwd`）
 * @param {number} depth — 执行深度（只在 depth 0 生效；子代理走既有 token 门，本门不核它）
 * @param {Object} tool — 工具对象（`toolTouchPaths` 的钩子源——写盘七件的目标路径从它取）
 * @param {string} toolName — 工具名（= `toolCall.name`；决定入口集与各工具的判法）
 * @param {Object} args — 本次调用入参（判据点、`args.project` ∥ `args.ledger` 都由本函数自己取）
 * @returns {Promise<{target: string, message: string}|null>} 命中 = 拒文 + 首个被拒目标；否则 null
 */
export async function ledgerBindWriteConflict(agent, depth, tool, toolName, args) {
  if (!agent?.config?.agent?.engineering) return null // 普通模式零改（纪律自持）
  if (!(depth === 0)) return null // 子代理走既有 token 门
  const name = String(toolName ?? tool?.name ?? "")
  if (!LEDGER_ENTRY_TOOLS.has(name)) return null // 入口集之外 ⇒ 本门不问
  if (!ledgerGateApplies(name, tool, args)) return null // 只读 action ∥ 不写项目内档的枚举值 ⇒ 不要号
  const claim = ledgerGateTargets(agent, name, tool, args)
  if (!claim) return null // 没有可判的目标（写盘工具缺 path 由工具自己拒）
  const parsed = parseLedgerNo(args?.ledger)
  const cwd = resolve(agent?.cwd ?? ".")

  // ① 判序第一步：解析项目声明（缺 ⇒ `no project on this call`）——判据点不存在时，号对不对无从谈起。
  if (claim.none) return { target: cwd, message: ledgerNoProjectRefusal(CASE_NO_PROJECT, LIST_UNKNOWN_NO_PROJECT) }

  const cache = new Map()
  if (claim.declared !== undefined) {
    // ② 声明形式：界 = 相关性判据（(b) 支上溯 ∥ (a) 支自身带 manifest）；两支都取不到 ⇒ 拒。
    const resolved = await resolveDeclaredRoot(claim.declared, cwd)
    if (!resolved) {
      return { target: claim.declared, message: ledgerNoProjectRefusal(caseNotAProject(claim.declared), LIST_UNKNOWN_NOT_A_PROJECT) }
    }
    const at = await ledgerRowAt(resolved.root, parsed.no ?? null, cache)
    const message = ledgerRowRefusal(parsed, at)
    return message ? { target: resolved.root, message } : null
  }

  // ③ 定位参数形式：每个目标按自己的祖先链取根（一笔写跨两个项目 ⇒ 号要在每个项目的账上各查到）。
  // `init` 的取根豁免（决策 43 · 条件形）：目标沿祖先链取不到项目根 ⇒ 不进本门（无账可问）；
  // 取得到根（含既有项目内的子目录自举）⇒ 照判要号，目标自身已有 manifest 时门过后由工具自身拒。
  // 取不到根 ∧ 有声明 ⇒ 先试窄口（设计档 §2.3.1）；无声明 ⇒ 既有那句拒（决策 41 的核心未动）。
  // 豁免位次仍在窄口之前：`init` 的合法落点就是「尚无 manifest 的目录」，窄口不为它开新臂。
  for (const p of claim.paths) {
    const root = resolveProjectRoot(p)
    if (!root) {
      if (String(args?.action ?? "") === "init") return null
      if (!claim.fallbackDeclared) {
        return { target: p, message: ledgerNoProjectRefusal(caseNotAProject(p), LIST_UNKNOWN_TARGET_NOT_A_PROJECT) }
      }
      const opening = await workspaceRoot(p, cwd, claim.fallbackDeclared)
      if (opening.refusal) {
        return { target: p, message: ledgerNoProjectRefusal(opening.refusal.caseText, opening.refusal.listText) }
      }
      const opened = await ledgerRowAt(opening.root, parsed.no ?? null, cache)
      const openedMessage = ledgerRowRefusal(parsed, opened)
      if (openedMessage) return { target: p, message: openedMessage }
      continue
    }
    const at = await ledgerRowAt(root, parsed.no ?? null, cache)
    const message = ledgerRowRefusal(parsed, at)
    if (message) return { target: p, message }
  }
  return null
}