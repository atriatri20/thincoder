/**
 * agent/turn-task-state.mjs — 本轮运行记账与任务状态取形（设计 = `docs/core/design/CONTEXT-COMPACTION.md` §1.1；
 * 台账 #2395 落的「一轮三条消息」里，任务状态那一条在本档成形。本批从 `thincoder-core/agent/turn-projection.mjs` 拆出）。
 *
 * 本档四块：
 *  - 账本 `createTurnLedger` ∥ `noteTurnToolFacts` ∥ `noteTurnRunError`：本轮运行记账（工具调用、验证命令与结果摘要）；
 *  - 事实 `buildTurnTaskState`：状态由记账与真实落盘面组装，不由模型最终回复反推；
 *  - 状态串 `taskStateText` ∥ `TASK_STATE_MARK`：状态对象 → 线上文本；
 *  - 成败取形 `VERIFICATION_TOOLS` ∥ `verdictOf` ∥ `parseArgs` ∥ `resultSummary`：结果里的真实退出码与单行摘要。
 *
 * 与 `turn-projection.mjs` 的分工：那边是折叠 ∥ 投影 ∥ 恢复三面同尺（同一份投影函数），本档是记账与取形。
 * 为什么要拆：四块同住一档时内容行越过 500 的档位线（`docs/core/standards/CODE-TIER.md` §3），而「一轮 → 三条消息」
 * 的投影判据仍只在 `turn-projection.mjs` 一处——拆档只动文件归属，不动那条判据。
 * 依赖方向单向：`turn-projection.mjs` → 本档；本档不 import 投影面（否则两档成环，拆了等于没拆）。
 * 对外契约：搬走的符号在 `turn-projection.mjs` 原路径 re-export，既有 import 一字不改。
 *
 * 纪律：纯函数面零 IO、零抛、零全局态；不改写传入的账本对象与工具参数对象。
 */
import { isAbsolute, relative } from "node:path"
import { safeSliceUTF16 } from "../text-budget.mjs"

/** 任务状态消息的机器标记（标准 `role:"user"` + 文本行；Provider 面零未知字段）。 */
export const TASK_STATE_MARK = "[Task state]"
/** 摘要 ∥ 命令 ∥ 结果摘要的单行上限（用户请求与最终回复不在此列，原样入库）。 */
const SUMMARY_CAP = 240
const COMMAND_CAP = 200
const MAX_VERIFICATION = 6
const MAX_CHANGED_FILES = 40
const MAX_EVIDENCE = 8
const MAX_REMAINING = 8

export const str = (v) => (typeof v === "string" ? v : "")

/** 单行摘要（折叠空白——用于命令 ∥ 结果摘要）。 */
export function line(v, limit = SUMMARY_CAP) {
  const t = str(v).replace(/\s+/g, " ").trim()
  return t.length <= limit ? t : `${safeSliceUTF16(t, limit)}…`
}

/** 本轮验证面工具（CONTEXT-COMPACTION §1.1「verification 面只收真正执行过命令的工具」）。
 *  成员与「命令取形」在**这一处**定义：再加一份名单就是第二条判据，加成员时不会跟。
 *  `verify` 不在内：它不执行命令，只转述模型自述，不得冒充真实执行结果。 */
const VERIFICATION_TOOLS = {
  /** bash = 命令原文。 */
  bash: (args) => line(args.command, COMMAND_CAP),
  /** execute = 脚本 / 内联代码首行。 */
  execute: (args) => {
    const parts = []
    if (str(args.scriptFile)) parts.push(`node ${args.scriptFile}`)
    if (str(args.code)) parts.push(str(args.code).split("\n")[0])
    return line(parts.join(" · ") || "(inline execute)", COMMAND_CAP)
  },
}

/** 长文本不再截断：用户请求与最终回复原样入库（容量靠轮投影控制，不靠丢失原文）。 */
export function capText(v) {
  return str(v)
}

function parseArgs(raw) {
  if (raw && typeof raw === "object") return raw
  try {
    const v = JSON.parse(str(raw) || "{}")
    return v && typeof v === "object" ? v : {}
  } catch {
    return {}
  }
}

/** 结果摘要（首段 + 上限：「通过/失败/跳过及结果摘要」）。 */
function resultSummary(result) {
  const raw = str(result)
  if (!raw) return ""
  return line(raw)
}

/**
 * 验证结论：验证面成员都是会执行命令的工具，成败先读**结果里的真实退出码**——一条 `(exit code 1)` 的命令
 * 仍然「工具执行成功」，工具调用本身没错，是命令失败了；被杀的进程一律算失败。
 * 结果里没有退出码（输出被截断 / 不是该形）才回落到工具调用的成败。
 */
function verdictOf(result, ok) {
  const text = str(result)
  const exit = /\(exit code (-?\d+)\)/.exec(text)
  if (exit) return Number(exit[1]) === 0
  if (/\(killed: /.test(text)) return false
  return ok === true
}

// ────────────────────────────── 账本（运行记账） ──────────────────────────────

/**
 * 建立本轮事实账本。`autoTurn`（含上行 / 定时唤醒轮）不伪造用户请求——设计 §1.1：系统轮没有
 * 用户请求，机读线不得凭空多出一条。
 * @param {{ input?: unknown, autoTurn?: boolean, goal?: object|null }} spec
 */
export function createTurnLedger({ input, autoTurn = false, goal = null } = {}) {
  const request = capText(input) || null
  return {
    userRequest: autoTurn === true ? null : request,
    autoTurn: autoTurn === true,
    objective: request || capText(goal?.objective) || null,
    verification: [],
    toolCalls: 0,
    /** 本轮内被观察到的异常原因（续跑链保留；异常轮不登记，故只作 blockedBy 的次选来源）。 */
    error: null,
  }
}

/**
 * 记一条工具事实（`recordToolResults` 的唯一调用点）。只记**运行记账**面：
 * 验证类工具的调用参数与结果摘要——变更文件面取 `agent._touchedFiles`（真实落盘归集，
 * 含子代理 `mergeChildMutations` 合入项），不在此另立第二份清单。
 */
export function noteTurnToolFacts(ledger, { toolCall, result, ok } = {}) {
  if (!ledger || typeof ledger !== "object") return ledger
  ledger.toolCalls = (ledger.toolCalls ?? 0) + 1
  const name = str(toolCall?.name)
  if (!Object.hasOwn(VERIFICATION_TOOLS, name)) return ledger
  ledger.verification.push({
    tool: name,
    command: VERIFICATION_TOOLS[name](parseArgs(toolCall?.arguments)),
    ok: verdictOf(result, ok),
    summary: resultSummary(result),
  })
  if (ledger.verification.length > MAX_VERIFICATION) ledger.verification.shift()
  return ledger
}

/** 异常面记账（`runAgent` 的 catch）：本轮异常原因留给同一账本（续跑沿用）。 */
export function noteTurnRunError(ledger, error) {
  if (!ledger || typeof ledger !== "object") return ledger
  const message = line(error?.message ?? error, SUMMARY_CAP)
  if (message) ledger.error = message
  return ledger
}

// ────────────────────────────── 事实（taskState） ──────────────────────────────

/** 文档面：`_touchedFiles` 里落在调用方声明的文档根下的那些（设计 §1.1 表行「同一落盘面按调用方声明的
 *  文档根过滤；只给位置，不摘录理由」）。`null` = 未声明文档根 ⇒ 该字段不出现——空数组与「本轮没改文档」
 *  同形，读的人分不出是没改还是没声明根，所以缺省不写字段。文档根本身由调用方解析（本档零 IO，不自读 manifest）。 */
function changedDocsOf(touchedFiles, docRoots, cwd) {
  // 分隔符归一再比（`_touchedFiles` 是平台原生绝对路径，manifest 的根也经 `resolve` 归一）；win32 再折大小写
  // ——同族判据同口径（`agent/write-face.mjs` 的 `faceKey`、`doc-check/existence.mjs` 的 `pathKey`）：
  // 磁盘不区分大小写，拍定字符串区分会静默漏项。
  const norm = (p) => {
    const s = p.split("\\").join("/")
    return process.platform === "win32" ? s.toLowerCase() : s
  }
  const roots = (Array.isArray(docRoots) ? docRoots : [])
    .filter((p) => typeof p === "string" && p)
    .map((p) => norm(p).replace(/\/+$/, ""))
  if (roots.length === 0) return null
  const out = []
  for (const p of Array.isArray(touchedFiles) ? touchedFiles : []) {
    if (typeof p !== "string" || !p) continue
    const shown = norm(p)
    if (!roots.some((root) => shown === root || shown.startsWith(`${root}/`))) continue
    const rel = changedPathsOf([p], cwd)[0]
    if (rel && !out.includes(rel)) out.push(rel)
    if (out.length >= MAX_CHANGED_FILES) break
  }
  return out
}

/** 真实落盘面：绝对路径 → cwd 相对（分隔符归一 `/`）；cwd 外保留绝对路径。 */
function changedPathsOf(touchedFiles, cwd) {
  const out = []
  for (const p of Array.isArray(touchedFiles) ? touchedFiles : []) {
    if (typeof p !== "string" || !p) continue
    const shown = cwd ? relative(cwd, p) : p
    const value = (shown && !shown.startsWith("..") && !isAbsolute(shown)) ? shown.split("\\").join("/") : p.split("\\").join("/")
    if (!out.includes(value)) out.push(value)
    if (out.length >= MAX_CHANGED_FILES) break
  }
  return out
}

function remainingOf(tasks, goal) {
  const out = []
  for (const t of Array.isArray(tasks) ? tasks : []) {
    const status = str(t?.status) || "pending"
    if (status === "done") continue
    const title = line(t?.title ?? t?.content ?? t, 120)
    if (title) out.push(`${title} (${status})`)
    if (out.length >= MAX_REMAINING) break
  }
  if (goal && goal.status === "active" && str(goal.objective)) {
    const objective = line(goal.objective, 120)
    if (objective && !out.includes(objective)) out.push(`goal (active): ${objective}`)
  }
  return out.slice(0, MAX_REMAINING)
}

function blockedOf(goal, ledger) {
  if (goal && goal.status === "blocked") {
    const reason = line(goal._blockTally?.reason ?? goal.blockedReason ?? "", SUMMARY_CAP)
    return reason ? `goal blocked: ${reason}` : "goal marked blocked"
  }
  // 异常轮不登记（设计 §2）——账本里的异常只在同一链后续正常收尾时充作阻塞来源。
  return ledger?.error ? `run error: ${ledger.error}` : null
}

function evidenceOf({ slotFile, batchDoc, logsPath, changedFiles }) {
  const out = []
  const push = (v) => {
    const value = str(v)
    if (value && !out.includes(value) && out.length < MAX_EVIDENCE) out.push(value)
  }
  push(slotFile)
  push(batchDoc)
  push(logsPath)
  for (const f of changedFiles) push(f)
  return out
}

/**
 * 组装本轮任务状态（设计 §1.1 表逐字段；事实来自运行记账，不由最终回复反推）。
 * 无工具活动的简单问答 ⇒ `null`（设计：「没有工具活动的简单问答允许 taskState 为空」）。
 *
 * @param {object} ledger — `createTurnLedger` 产物
 * @param {object} facts — `{ status, goal, tasks, touchedFiles, docRoots, cwd, slotFile, batchDoc, logsPath }`
 * @returns {object|null}
 */
export function buildTurnTaskState(ledger, {
  status = "completed", goal = null, tasks = [], touchedFiles = [], docRoots = [], cwd = null,
  slotFile = null, batchDoc = null, logsPath = null,
} = {}) {
  if (!ledger || typeof ledger !== "object") return null
  const changedFiles = changedPathsOf(touchedFiles, cwd)
  const toolCalls = ledger.toolCalls ?? 0
  if (toolCalls === 0 && changedFiles.length === 0 && (ledger.verification?.length ?? 0) === 0) return null
  const changedDocs = changedDocsOf(touchedFiles, docRoots, cwd)
  const state = {
    objective: ledger.objective ? ledger.objective : null,
    status,
    changedFiles,
    verification: (ledger.verification ?? []).map((v) => ({ ...v })),
    evidence: evidenceOf({ slotFile, batchDoc, logsPath, changedFiles }),
    remaining: remainingOf(tasks, goal),
    blockedBy: blockedOf(goal, ledger),
  }
  if (changedDocs) state.changedDocs = changedDocs
  return state
}

/** 任务状态的线上文本（标准 role/content 的 content 面；空状态 ⇒ `null` 不产消息）。 */
export function taskStateText(taskState) {
  if (!taskState || typeof taskState !== "object") return null
  const rows = []
  if (taskState.objective) rows.push(`objective: ${taskState.objective}`)
  if (taskState.status) rows.push(`status: ${taskState.status}`)
  if (taskState.changedFiles?.length) rows.push(`changedFiles: ${taskState.changedFiles.join(", ")}`)
  if (taskState.changedDocs?.length) rows.push(`changedDocs: ${taskState.changedDocs.join(", ")}`)
  for (const v of taskState.verification ?? []) {
    const verdict = v.ok ? "ok" : "failed"
    rows.push(`verification: ${v.tool} \`${v.command}\` → ${verdict}${v.summary ? ` — ${v.summary}` : ""}`)
  }
  if (taskState.evidence?.length) rows.push(`evidence: ${taskState.evidence.join(" · ")}`)
  if (taskState.remaining?.length) rows.push(`remaining: ${taskState.remaining.join("; ")}`)
  if (taskState.blockedBy) rows.push(`blockedBy: ${taskState.blockedBy}`)
  if (rows.length === 0) return null
  return `${TASK_STATE_MARK}\n${rows.join("\n")}`
}
