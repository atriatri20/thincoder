/**
 * agent-tools/batch-ledger-bind.mjs — 建档 = 建台账行，另含「给现役档补挂一行」（两个入口，同一件事的两次落笔；
 * 从 `batch-lifecycle.mjs` 拆出，2026-10-27；2026-11-05 增 `attach`）。
 *
 * 两个入口共用同一条五步事务形态（单源 = `ledgerBindBatch`），差在步 3 写什么：`create` 写整本骨架（`wx`），
 * `attach` 只改**已有档头那一行**（§4.21.3——重开后的档承接新事时，`create` 走不通、已核销行没有回退边）。
 *
 * 权威规格 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.4（建档）+ `docs/core/design/BATCH-RECORD.md` §4.21.3（补挂）。
 * 用户裁定（2026-10-27 11:40）：
 * 「如果已有台账，可以在创建时把台帐号传进去，没有就要创建台账。」——建档与台账登记不再是两步靠自觉，
 * 是同一个动作的两次落笔：`batch({action:"create"})` 一次调用，档与行同时成立，否则两边都不成立。
 *
 * **步序不能换**（§2.4，第 3 轮评审的 🔴）：
 *   `BEGIN IMMEDIATE` → （新建）INSERT 一行 `待讨论`（无指针、`trigger` 不填）→ `writeRecord(#N)` 写批档
 *   （`wx` 独占创建）→ `applyRowUpdateTx` 迁 `在途` + 写 `task_book`（过写门）→ `COMMIT`。
 *   写门两形都判「解析出的档在盘」（在册旧形 ∥ 新形臂②）——先写指针、后落档，会被自己的门当场拒。
 *   `在途` 行的 DDL 咬合 CHECK（`docs/core/design/LEDGER.md` §2.2）又封死「先 INSERT `在途`、后落档」，
 *   所以第一笔只能是一条不带指针的 `待讨论`，`待讨论 → 在途` 因此是**必经一步**。
 *
 * 失败清理只删**本笔所建**的档：步 3 是 `wx` 独占创建，撞已有同名档时抛 EEXIST，无条件 unlink 会删掉
 * 别人的档（第 4 轮评审 🟡2）。`created` 旗由写回调置位，清理只认它。
 *
 * 依赖单向（KD-4）：`skeleton ← closeout ← bind ← reopen ← lifecycle`——本档不 import lifecycle。
 */
import { existsSync, mkdirSync, readFileSync, statSync, unlinkSync, writeFileSync } from "node:fs"
import { dirname, relative } from "node:path"

import { appendLedgerNoToHeader, batchSkeleton, readBatchStatusLine } from "./batch-skeleton.mjs"
import { resolveBatchCreatePath } from "./batch-paths.mjs"

/** 可读文件判据（存在且为文件——目录/缺失同判不可读；与主档同名 helper 同型——KD-4 单向依赖下各自持有，
 *  三行谓词不构成第二权威源）。 */
function readableFile(abs) {
  try { return existsSync(abs) && statSync(abs).isFile() } catch { return false }
}

/** main-agent-only 门（BR-19/BR-24）：create 仅 depth-0 放行（eng 子代理 / 评审皆拒）。 */
function assertMainAgentOnly(ctx, action, review) {
  if (review || ctx?.depth !== 0) {
    throw new Error(`batch: ${action} is main-agent-only — ${action} manages the record lifecycle and is depth-0 only (eng sub-agents and design reviews are refused).`)
  }
}

/** 档头可选参归一（`board`）：trim ∥ 单行（拒句逐字）∥ 空串 ≡ 未给（null）。两个开户动作（create ∥ attach）
 *  共用一份——同一件事不各写一个串；串内不点名动作（点名就把两个动作又分开写两份了）。 */
function normalizeBoard(raw) {
  const v = typeof raw === "string" ? raw.trim() : ""
  if (!v) return null
  if (/\r?\n/.test(v)) {
    throw new Error("batch: board must be a single line — a multi-line value would break the header's 台账 line. Nothing was written.")
  }
  return v
}

/** `ledger` 参解析：缺省 / 空 ⇒ `null`（新建一行）；否则取行号（`#1830` ∥ `1830` ∥ 数字）。 */
function parseLedgerNo(raw) {
  const v = typeof raw === "string" ? raw.trim() : raw
  if (v == null || v === "") return null
  const m = /^#?\s*(\d+)$/.exec(String(v).trim())
  if (!m) {
    throw new Error(`batch: ledger must be a ledger entry number (e.g. "#1830") — got ${JSON.stringify(raw)}. Pass an existing number, or omit ledger — with no unsettled row on the same face that opens a new row; otherwise pass newDebt:"<why this is a new debt>". Nothing was written.`)
  }
  return Number(m[1])
}

/** `newDebt` 参归一（设计档 §6.3「参数面」）：trim；空串 / 全空白 ⇒ `null`（按未给判——没声明新事）。 */
function normalizeNewDebt(raw) {
  const v = typeof raw === "string" ? raw.trim() : ""
  return v || null
}

/** 同面判回执增量（设计档 §6.3「回执增量（成功路径）」逐字）：面名 + 本面未决数 + 他面未决读数。
 *  `n = 0` 半幅也打（免得把「本面无候选」读成「池子空」——他面读数同列）；接手路径无此段（该径零判）。
 *  `declared` 缺省 ⇒ `—`（本仓「无值」的既有形，同档头 `台账 = #N（… · —）`）。 */
function sameFaceReceiptLine(check) {
  if (!check) return ""
  return `\nsame-face check: face = ${check.face ?? "no board"} · unsettled on this face = ${check.n} (n = 0 ⇒ nothing to take over; n > 0 ⇒ declared a new debt: ${check.declared ?? "—"}) · unsettled on other faces = ${check.m} (a reading; never blocks).`
}

/**
 * create——建档（§4.11 + §2.4，仅 depth-0）：六段骨架一次预齐，台账行同拍成立。
 * 不传 `ledger` ⇒ 新建一行（`在途` · `kind` = `board` 给则 `requirement` 否则 `tech_todo` · `title` = `topic` ·
 * `task_book` = 本档相对指针 · `trigger` = 归批）——**同面（本笔 `board`）无未决行时如此；有则须 `newDebt:"<一句理由>"`，
 * 两者皆无 ⇒ 拒并列候选**（设计档 `docs/core/design/LEDGER.md` §6.3）；传 `#N` ⇒ 接管该行（`待讨论` / `待设计` → `在途`；
 * `在途` 且指针指回本档 ⇒ 零台账写；其余 ⇒ 三形拒文，见 §2.4）。
 * 档头 `台账` 行由**真实行号**填（`board` 未给 ⇒ 括注 `—`，不拒）。
 * @returns {Promise<string>} 成功消息（含落盘绝对路径、行号与同面判读数）
 */
export async function createBatchRecord({ args, ctx, review, cwd, bases, onWritten }) {
  assertMainAgentOnly(ctx, "create", review)
  const raw = typeof args?.path === "string" ? args.path.trim() : ""
  if (!raw) {
    throw new Error("batch: create requires path — the new batch record's location (a .md path under the batch base roots, relative or absolute). Nothing was written.")
  }
  if (!/\.md$/.test(raw)) {
    throw new Error(`batch: create path must end in .md — got ${JSON.stringify(raw)} (fail-closed: non-markdown targets are refused). Nothing was written.`)
  }
  const primary = bases?.[0]
  if (!primary) {
    throw new Error("batch: no batch-record base root is available — fix PROJECT-MANIFEST.json docRoot.batches (or its default) before creating a record. Nothing was written.")
  }
  const abs = resolveBatchCreatePath(cwd, raw, bases)
  if (readableFile(abs)) {
    throw new Error(`batch: create target already exists — refusing to overwrite an existing batch record (fail-closed, BR-20): ${raw}`)
  }
  const topic = typeof args?.topic === "string" && args.topic.trim() ? args.topic.trim() : null
  if (!topic) {
    throw new Error("batch: create requires topic — the batch subject word shared by the record header (档名与档头共用——keep the file name aligned with it). Nothing was written.")
  }
  const source = typeof args?.source === "string" ? args.source.trim() : ""
  if (!source) {
    throw new Error("batch: create requires source — the record's origin line (来源 = …). Pass where this batch came from (the request / discussion that started it); it lands in the header's 编制 line. Nothing was written.")
  }
  if (/\r?\n/.test(source)) {
    throw new Error("batch: create source must be a single line — a multi-line source would break the header's 编制 line. Nothing was written.")
  }
  const board = normalizeBoard(args?.board)
  const ledgerNo = parseLedgerNo(args?.ledger)
  const newDebt = normalizeNewDebt(args?.newDebt)
  const date = typeof args?.date === "string" && args.date.trim() ? args.date.trim() : todayLocalIso()
  // F11-B：prev 幂等 strip——调用方自带「前情 = 」前缀（单或重复）一并剥净；默认值形态「零变」。
  const prevRaw = typeof args?.prev === "string" ? args.prev.trim() : ""
  const prev = prevRaw ? (prevRaw.replace(/^(?:前情\s*[=：:]\s*)+/g, "").trim() || "无（独立批）") : "无（独立批）"
  // 模式位执行期实读（§4.16——骨架取形时点 = 建档即固；翻转不回写既有骨架）
  const mode = ctx?.agent?.config?.agent?.engineering ? "engineering" : "normal"
  const anchor = cwd ?? ctx?.agent?.cwd
  const created = { flag: false }

  // 台账链只经动态 import（ledger-db.mjs 静态引 node:sqlite ⇒ 消费侧静态 import 破 W8 契约②）
  const { ledgerBindBatch, resolveLedgerRoot } = await import("../ledger.mjs")
  const root = resolveLedgerRoot(dirname(abs), anchor)?.root ?? null
  if (!root) {
    throw new Error(`batch: the new record's project root cannot be derived — the ledger row cannot be opened without it (fail-closed). Path: ${abs}. Nothing was written.`)
  }
  const taskBook = relative(root, abs).replace(/\\/g, "/")
  // executor = 本会话（AC-M2-7「进入在途的迁移带 executor = 会话 sessionId」）——与 `ledger-tools.mjs` 同一取值面
  let executorSessionId = null
  try { executorSessionId = (await import("../session-slots.mjs")).getSessionId() } catch { executorSessionId = null }
  mkdirSync(dirname(abs), { recursive: true })
  const writeRecord = (id) => {
    try {
      writeFileSync(abs, batchSkeleton({ date, topic, source, prev, ledger: `#${id}`, board, mode }), { flag: "wx" })
    } catch (e) {
      if (e?.code === "EEXIST") {
        throw new Error(`batch: create target already exists — refusing to overwrite an existing batch record (fail-closed, BR-20): ${raw}`)
      }
      throw e
    }
    created.flag = true
    if (ctx?.agent) ctx.agent._batchWrites = (ctx.agent._batchWrites ?? 0) + 1 // §6.6 `wrote` 判据（建档写盘成功才增）
    onWritten?.(ctx?.agent ?? {}, abs)
  }

  let result
  try {
    result = await ledgerBindBatch({
      cwd: root,
      ledgerNo,
      newDebt,
      targetAbs: abs,
      taskBook,
      title: topic,
      kind: board ? "requirement" : "tech_todo",
      board,
      boundary: anchor,
      executorSessionId,
      agent: ctx?.agent ?? {},
    }, writeRecord)
  } catch (e) {
    // 失败清理只删本笔所建的档（`created` 旗——撞同名档时我们什么都没建，不得 unlink 别人的档）
    let residue = ""
    if (created.flag) {
      try { unlinkSync(abs) } catch (unlinkErr) { residue = ` 档残留 ${abs}（清理失败：${unlinkErr?.message ?? unlinkErr}）` }
    }
    const rollbackNote = e?.ledgerRollbackFailed ? "台账回滚失败——行可能残留，收口前请人工核对。" : ""
    const note = `${rollbackNote}${residue}`
    if (!note) throw e
    const wrapped = new Error(`${e?.message ?? e}${note ? `\n（${note}）` : ""}`)
    throw wrapped
  }
  const took = result.tookOver === "new" ? "opened" : result.tookOver === "live" ? "taken over (already live — zero ledger write)" : "taken over"
  return `batch: created ${abs} — six-section skeleton written (§1 status line carries the gate-legal 「进行中」 placeholder); ledger row #${result.id} ${took} in the same call (row status = 在途 · task_book = ${taskBook} · trigger = 归批). header 台账 line filled (#${result.id} · ${board ?? "—"}).${sameFaceReceiptLine(result.sameFace)}`
}

/** 本地今天（YYYY-MM-DD）——create 的缺省 date。 */
function todayLocalIso() {
  const d = new Date()
  const p = (n) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

// ─── attach——给现役档补挂台账行（§4.21.3 · 仅 depth-0）──────────────────────────────────

/** 门态拒串（attach 前置 = 目标档门态 `进行中`）：已收口 ⇒ 两条路（先重开再 attach ∥ 另起新批）；
 *  §1 段头区不可解析 ⇒ fail-closed 同判（与其余写门一条口径——修 = 普通文档写）。 */
const attachClosedError = () => "batch: attach refused — the record is frozen (§1 status line carries 「已收口」). Two ways on: reopen it first (batch status §1 → 进行中 with note = the reason, which appends the reopen record) and then attach; or start a new batch record (create) instead. Nothing was written."
const attachUnresolvedError = () => "batch: attach refused — the record has no readable §1 status line inside its section header zone (zero lines or two or more; fail-closed, the same judgement every other write gate makes). Repair the §1 zone with an ordinary document write so it holds exactly one status line, then attach. Nothing was written."
/** 开新行缺标题拒串（`title` 只在**开新行**时必填——接管既有行的标题已在行上）。 */
const attachTitleError = () => "batch: attach needs title when it opens a new ledger row — the row's title says what this new debt is: a reopened record takes on a new piece of work, and reusing the batch's own subject would make the ledger read it as a second copy of the original debt. Pass title:\"<one line>\", or take over an existing unsettled row with ledger:\"#<id>\". Nothing was written."

/**
 * attach——给**已存在**的现役批档补挂台账行（设计档 §4.21.3；仅 depth-0，与 `create` / `close` 同一道身份判据）。
 * 场景：档重开（§4.18-B）后承接一件新事——`create` 只对新档开放（目标已存在 ⇒ 拒），已核销行没有回退边 ⇒
 * 今天只剩「另起一本新档」或「跑完一整轮而不记任何债」，两种都把重开的意义抽掉。
 *
 * 五步事务形态与 `create` 同一条（事务与同面判的单源 = `ledgerBindBatch`——本档只提供回调）：
 * `BEGIN IMMEDIATE` → （新建）INSERT 一行 `待讨论` → **回调写档头台账行**（步 3 与 create 的差别只在这里：
 * 它改的是已有档头一行，不是整本档的模板）→ 迁 `在途` + 写 `task_book` → `COMMIT`。
 *
 * 两条与 create 不同的判据：
 *  - **不挂 F11-C 死占位门**（J1 的例外）：档头仍带 `#<编号>` 占位的档，`edit` 被件① 挡着，而这本档在台账侧
 *    已经是真档——`attach` 正是把死占位换成真编号的那条通道，⇒ 它必须放行并**填掉**占位，填完 `edit` 随之打开。
 *  - **不动已核销行**（J4）：只开新行或接管未决行；核销过的行没有回退边（`ledgerBindBatch` 已拒归档 / 待核销行）。
 *
 * 幂等：行号已在档头列表 ⇒ 零写 + 回执点名「已在列表」——为的是同一个回调在 `ledgerBindBatch` 的
 * 「行已 live、零台账写」分支上也安全（重放 `attach{ledger:"#N"}` 落到的就是那条）。
 * 拒面（全 fail-closed：档零字节 / 台账零写）：门态非 `进行中` · 档头 `台账` 行缺失 · 本面有未决行而无 `newDebt` ·
 * 开新行而缺 `title` · 台账库不可达 ∥ 事务失败（回滚语义沿用 `create`）。
 * @returns {Promise<string>} 成功消息（含行号、改写后的档头行与同面判读数）
 */
export async function attachBatchRecord({ args, ctx, review, cwd, pickTarget, onWritten }) {
  assertMainAgentOnly(ctx, "attach", review)
  const abs = pickTarget(args?.path)
  const src = readFileSync(abs, "utf8")
  const gate = readBatchStatusLine(src)
  if (gate === "closed") throw new Error(attachClosedError())
  if (gate === "unknown") throw new Error(attachUnresolvedError())
  const board = normalizeBoard(args?.board)
  const ledgerNo = parseLedgerNo(args?.ledger)
  const newDebt = normalizeNewDebt(args?.newDebt)
  const title = typeof args?.title === "string" && args.title.trim() ? args.title.trim() : null
  if (title && /\r?\n/.test(title)) {
    throw new Error("batch: attach title must be a single line — the row title is one line, and a multi-line value would break the receipt and the ledger listing. Nothing was written.")
  }
  if (ledgerNo == null && !title) throw new Error(attachTitleError())
  const anchor = cwd ?? ctx?.agent?.cwd
  const { ledgerBindBatch, resolveLedgerRoot } = await import("../ledger.mjs")
  const root = resolveLedgerRoot(dirname(abs), anchor)?.root ?? null
  if (!root) {
    throw new Error(`batch: the record's project root cannot be derived — the ledger row cannot be opened without it (fail-closed). Path: ${abs}. Nothing was written.`)
  }
  const taskBook = relative(root, abs).replace(/\\/g, "/")
  // executor = 本会话（AC-M2-7，与 create 同一取值面）
  let executorSessionId = null
  try { executorSessionId = (await import("../session-slots.mjs")).getSessionId() } catch { executorSessionId = null }
  const header = { id: null, line: null, already: false }
  /** 步 3（回调）：把真实行号补进档头 `台账` 行。已在列表 ⇒ 零写（幂等）；写盘成功才记 `_batchWrites`。 */
  const writeHeader = (id) => {
    const current = readFileSync(abs, "utf8")
    const edited = appendLedgerNoToHeader(current, id)
    header.id = id
    header.line = edited.line
    if (edited.already) { header.already = true; return }
    writeFileSync(abs, edited.src)
    if (ctx?.agent) ctx.agent._batchWrites = (ctx.agent._batchWrites ?? 0) + 1 // §6.6 `wrote` 判据（写盘成功才增）
    onWritten?.(ctx?.agent ?? {}, abs)
  }
  const result = await ledgerBindBatch({
    cwd: root,
    ledgerNo,
    newDebt,
    targetAbs: abs,
    taskBook,
    title: title ?? "",
    kind: board ? "requirement" : "tech_todo",
    board,
    boundary: anchor,
    executorSessionId,
    agent: ctx?.agent ?? {},
  }, writeHeader)
  const head = header.already
    ? `batch: ledger row #${result.id} is already in the header 台账 line of ${abs} — zero write (idempotent: the row is live and already listed; nothing changed).`
    : `batch: attached ledger row #${result.id} to ${abs} — header 台账 line is now \`${header.line}\` (row status = 在途 · task_book = ${taskBook} · trigger = 归批).`
  return `${head}${sameFaceReceiptLine(result.sameFace)}`
}
