/**
 * design-token.mjs — design-token utilities（2026-09-08 自 advisor-async.mjs 提取——
 * advisor-async 随 DESIGN-TOKEN-SETTLEMENT D1 落盘块再越 500 行硬限；本工具组 verbatim
 * 迁入，零语义变）。
 *
 * 沿革：初由 agent-tools/advisor.mjs 迁至 advisor-async.mjs（sync wrapper 与 async
 * settle 共享一套实现——无 wrapper↔runner 环），再由 advisor-async.mjs 迁入本文件。
 * 既有 import 面不变：advisor-async.mjs re-export 原 7 个导出（advisor.mjs 与测试
 * 的 import 路径原样保留——advisor.mjs 再转发 validateDesignToken 给 spawn 门禁）；
 * 本批 §5.1 新助手（stripDesignTokenEcho / makeDesignTokenPrefixRegex）为新增直连面
 * （设计档 ENG-TOKEN-BINDING.md §5.1——不经 advisor-async re-export）。
 */

import { createHash, randomUUID } from "node:crypto"
import { readFileSync, writeFileSync } from "node:fs"
import { parse, resolve } from "node:path"
import { tokenExpiryMs } from "../token-ttl.mjs"
// 评审封印的「被审档」面判：批档面（`docRoot.batches` 之下）排除——判据与 doc-check 的批档面
// 同源（`batchDirs` 一处），本档不自持第二份「哪个目录算批档」的判定（§10.2 被算集合）。
import { isBatchFace } from "../doc-check/existence.mjs"
import { owningProject } from "../manifest-discovery.mjs"
// 段面读判据单源（骨架档）：轮次块计数 ∥ 下一轮 N ∥ 段级状态行 ∥ §3 完成词——结算写块与写入面读同一形态。
// 裁定行锚（`_V_PRE` / `_V_SUF` / `VERDICT_CHANGES_LINE`）同住骨架档锚块，组合序也只在那一档（`verdictGapOf`）：
// 本档的裁定闸判据、写入面（`append §3` 的打回重置 `statusResetPlan`）与 `§5` 写入门读同一个函数——
// 锚与序都只此一份，三处不各写一遍。
import { countRoundBlocks, nextRoundNumber, readSectionStatusWord, STATUS_WORDS, statusPassPlan, statusResetPlan, updateSectionStatusLine, VERDICT_PASS_LINE, verdictGapOf } from "./batch-skeleton.mjs"
// 段尾追加（`appendLineToSection`）与日期戳（`todayLocal`）单源 = 重开档：结算的轮次块落进 §3 也是
// 「段尾追加、既有字节零变」那一条判据，块形另有单源（`design-review-record.mjs`）。
import { appendLineToSection, todayLocal } from "./batch-reopen.mjs"
// 块文成形单源（叶档、纯函数、零 fs）：工具戳 + 结算头 + 评审原文缩进四格（`BATCH-RECORD.md` §4.4）。
import { designReviewBlock } from "./design-review-record.mjs"
// 批归属派生（DESIGN-TOKEN-SETTLEMENT §10）——两源定序 `batchAbsPathOfRun`：`run.batchDoc` 优先、
// `docSetKey` 的批档兜底（判据与清点面同源）。
// 本档 ⇄ `design-slots.mjs` 为**静态环**（对方取 `effectiveTokenTtlMs`）：两侧绑定只在函数体内
// 运行时使用，求值期零顶层调用 ⇒ 环安全（与 token-ttl ⇄ session 同构）。
import { batchAbsPathOfRun } from "./design-slots.mjs"

/**
 * F2c/F2e (§29.1 2026-09-07): the engine-generated Approved suffix — ONE builder
 * shared by the sync settle and the async settle (and the prior stores, which
 * strip it with stripApprovedSuffix — exact-suffix truncation, never a regex
 * guess, zero collateral). The slot count is a point-in-time snapshot taken at
 * settle time — the situation at spawn time may differ (F2d backs that up).
 */
export function buildApprovedSuffix(designToken, designId, slotCount) {
  return `Approved. Pass this exact token to eng-coder (designToken parameter): ${designToken}\ndesignId: ${designId} (pass as the designId parameter when spawning eng-coder — optional while this session holds a single design; ${slotCount} approved design slot(s) held as of this approval, and the count may have changed since — with several designs the spawn gate refuses a missing designId and lists the held ids)`
}

/** F2e: strip the engine-generated Approved suffix from a report before
 *  it becomes a prior — the suffix is deterministic (buildApprovedSuffix), so the
 *  truncation is exact; a text not ending in it passes through untouched. */
export function stripApprovedSuffix(text, suffix) {
  if (typeof text !== "string" || !suffix) return text
  return text.endsWith(suffix) ? text.slice(0, text.length - suffix.length).trim() : text
}

const TOKEN_TTL_DEFAULT_MS = 7 * 24 * 3600 * 1000 // 7-day ceiling (v2 2026-08-25)

/** Effective token TTL: config override with runtime validation (timeoutMs precedent). */
export function effectiveTokenTtlMs(agent) {
  const cfg = agent?.config?.agent?.engTokenTtlMs
  return (Number.isFinite(cfg) && cfg > 0) ? cfg : TOKEN_TTL_DEFAULT_MS
}

/** Mint an unsigned design token with expiration (2026-09-06: HMAC layer removed —
 *  the token is a FLOW credential: uuid:expiresAt, exact slot match + TTL only). */
export function generateDesignToken(agent) {
  const uuid = randomUUID()
  const expiresAt = Math.floor(Date.now() + effectiveTokenTtlMs(agent))
  return `${uuid}:${expiresAt}`
}

/** Validate a design token: format + expiration — ALL fail-closed (v2 2026-08-25).
 *  R16: format/expiry semantics live in token-ttl.mjs (tokenExpiryMs — single source
 *  shared with restore filtering / enter cleanup / spawn-gate slot deletion — D-R16b). */
export function validateDesignToken(token) {
  const expiry = tokenExpiryMs(token)
  return expiry !== null && expiry >= Date.now()
}

/** Build a [DESIGN-TOKEN:...] regex matching the FULL token (uuid:expiresAt). */
export function makeDesignTokenRegex(token, flags = "") {
  const escaped = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(
    `(?:^|\\s|\`|\\*)\\[DESIGN-TOKEN:\\s*${escaped}\\s*\\](?:\\s|$|\`|\\*)`,
    flags + "ms"
  )
}

/** Build a [DESIGN-TOKEN:...] regex matching the token's uuid PREFIX form — the
 *  truncated echo (tail missing/inexact, §5.1③; same boundary discipline as the full regex). */
export function makeDesignTokenPrefixRegex(token, flags = "") {
  const uuid = String(token).split(":")[0]
  const escaped = uuid.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(
    `(?:^|\\s|\`|\\*)\\[DESIGN-TOKEN:\\s*${escaped}[^\\]\\s]*\\s*\\](?:\\s|$|\`|\\*)`,
    flags + "ms"
  )
}

/** §5.1③ stripping single source: strip every echo form of THIS token — the full
 *  [DESIGN-TOKEN:uuid:expiresAt] form, the truncated prefix form, and the bare
 *  uuid value (token-unique random ⇒ zero collateral; empty uuid → bare pass
 *  skipped — defensive). Other tokens / other uuids pass through untouched. */
export function stripDesignTokenEcho(text, designToken) {
  if (typeof text !== "string" || !designToken) return text
  const uuid = String(designToken).split(":")[0]
  let out = text.replace(makeDesignTokenRegex(designToken, "g"), "")
  out = out.replace(makeDesignTokenPrefixRegex(designToken, "g"), "")
  if (uuid) out = out.split(uuid).join("")
  return out
}

/** §5.1② constant settlement markers (verbatim — machine-greppable; M1 is
 *  emitted even when the review body is empty). */
const NO_VALID_ECHO_MARK = "未回显有效 token——未签发 (no valid token echo — no design token was issued)"
const TRUNCATED_ECHO_MARK = "注：回显被截断（uuid 之后缺失或不符）——已按批准结算；全串 token 已签发 (note: truncated echo — the part after the uuid was missing or inexact; settled as approved; the full token was issued)"

/** §5.2 verdict gate (#940): the echo alone is NOT the verdict — the receipt must
 *  carry a `VERDICT: pass` line and no `VERDICT: changes-required` line (fail-closed). */
// 裁定行接受本地化等价形（GitHub #32 / #14）：评审席用中文回执很常见，
// 只认英文会让 pass 落成 no-pass-line、凭证永不签发；判据仍只认整行逐字面，
// 不做「句中含『通过』」这类模糊匹配——那样会把「未通过」也放过。
// 四条锚与两条裁定正则全住骨架档锚块（`batch-skeleton.mjs`），裁定读数单源 = 同档 `verdictGapOf`：
// 本档、`§5` 写入门与 `append §3` 的通过置位读同一个函数（判定单源，零复制）。
// pass 锚经本档**原样再导出**——`batch-closeout.mjs` 的 import 面零改。
export { VERDICT_PASS_LINE }
/** 裁定闸的拒因（§5.2 #940）：对外只两个词，`changes-required` ∥ `no-pass-line`——本批改的是判据来源，
 *  不是这两个词。四格映射（`verdictGapOf` 值域 → 拒因）：
 *  - `null`（说了 pass）⇒ `null`（签发）；
 *  - `「VERDICT: changes-required」` ∥ `「两者同携」` ⇒ `changes-required`——同携今天就走这一格
 *    （改前打回锚先命中即判打回），组合序挪进函数后这张表照旧；
 *  - `「无裁定行」` ⇒ `no-pass-line`。 */
export function verdictGateFailure(rawResult) {
  if (typeof rawResult !== "string") return "no-pass-line"
  const gap = verdictGapOf(rawResult)
  if (gap === null) return null
  return gap === "无裁定行" ? "no-pass-line" : "changes-required"
}

/** §5.2 rejection mark (verbatim — machine-greppable; reason = no-pass-line | changes-required). */
const VERDICT_GATE_MARK = (reason) => `裁定非通过——token 未签发 (review verdict is not pass — no design token was issued; reason: ${reason}; the echoed token was stripped)`

/** §3 记录判据的拒因（ADVISOR-GUARDS.md §1.2——两值；判据 1 的「批档可读」与判据 2 的「写进并回读」，
 * 两者都在任何写之前 ∥ 写坏之后现形）。 */
const RECORD_STATUS_NOT_PASSED = "status-not-passed"
const RECORD_BATCH_UNREADABLE = "batch-unreadable"

/** 结算处置四值（§4.4「结算头的原因四个词」+ ADVISOR-GUARDS.md §1.2「判的是当前状态的评审都落一块」）：
 *  `pass` ∥ `changes-required` ∥ `no-pass-line` = 裁定闸的三格；`no-valid-echo` = 回显失败支（那一支只返回
 *  消息常量 `NO_VALID_ECHO_MARK`，没有自己的词，故与两个拒因词并列单列一个）。四者都落块——记录不拿凭证
 *  结果当过滤条件，凭证结局写在结算头。 */
const DISPOSITION_PASS = "pass"
const DISPOSITION_NO_ECHO = "no-valid-echo"

/** §3 记录判据 rejection mark (verbatim — machine-greppable; reason = 上两值之一)。与裁定闸同形：
 * 槽零写、实例不翻 open——标记即回执，不进 `settlementCriterion`（§7 不新增判据值）。
 * **恒定位 = 上方两行逐字不动**；`evidence`（可执行证据 = 当前状态行 ∥ 轮次块数 ∥ 写面通道）
 * 另起一行落在其后——指名当前值，但不把证据塞进那个机器可 grep 的括号里。 */
const REVIEW_RECORD_MARK = (reason, evidence) => `评审记录不合格——token 未签发 (review record incomplete — no design token was issued; reason: ${reason})\n本轮块与状态行由结算写进该批档 §3：那一笔没落成，整笔已回写到写前（零字节写入，槽零写）。修好该档（可读 ∥ 可写）后重跑设计评审——评审席自己写 §3 的那条通道在工程模式已收回。${evidence ? `\n证据：${evidence}` : ""}`

/** §10.2 封印在结算面算不出（被审档读不到）的恒定标记（逐字可 grep）：结算拒签、零字节写、可重评。
 *  **为什么是返回的拒签而不是 throw**：这是**数据条件**（评审看过的那份档在结算前被移走 / 锁住），
 *  不是接线故障——读回执的人要的是一句话与下一步。throw 会穿过 `settleAdvisorRun` 的
 *  `onAccounting` 钩子（那里没有 catch），跳过结算尾（挂起 / 事件 / 唤醒 / 补位），把一个可重评的
 *  拒签变成一次未捕获异常。位置 = 任何写之前（§3 签字与槽都在它之下）。 */
const SEAL_UNREADABLE_MARK = (path) => `评审封印无法计算——token 未签发 (the review seal cannot be computed — no design token was issued: the reviewed document ${path} cannot be read; restore that file, or re-run the review; nothing was written)`

/** 写档字节的**单通道**（模块级引用）：初值 = `fs.writeFileSync` 本体，生产路径从不替换。
 *  结算签字与落盘失败后的回退写都经这一个引用 ⇒ 两条写都只有一条路径，单测也能对两笔同时注入失败
 *  （「写抛错」∥「只写半截」），不必去动盘上的权限——不可写的地方先不可读，落到的是 `batch-unreadable`。 */
let recordWriter = writeFileSync
/** 测试缝（生产路径不调）：换掉写通道；传非函数 ⇒ 还原本体（用例 `t.after` 收尾）。 */
export function __setRecordWriterForTest(fn) {
  recordWriter = typeof fn === "function" ? fn : writeFileSync
}

/** 评审封印的字节口径（DESIGN-TOKEN-SETTLEMENT §10.2，单源——settle 与 spawn 两侧同调本函数）：
 *  按 `docs` 数组顺序逐档读**原始字节**，档与档之间放一个 `\n`，路径不进 hash；算法 = sha256。
 *  读不到（缺档 ∥ 权限错）⇒ 抛，`err.sealPath` = 那一份读不到的档的路径（拒文要点它的名）——
 *  「判不了」与「一致」是两件事，闸面按 fail-closed 处置。
 *  @param {string[]} docs 被审档绝对路径（顺序 = settle 时记下的顺序）
 *  @returns {string} sha256 十六进制 */
export function designSealHash(docs) {
  const h = createHash("sha256")
  docs.forEach((p, i) => {
    let buf
    try {
      buf = readFileSync(p)
    } catch (e) {
      const err = new Error(`design seal: the reviewed document cannot be read (${p}: ${e?.message ?? e})`)
      err.sealPath = p
      err.cause = e
      throw err
    }
    if (i > 0) h.update("\n")
    h.update(buf)
  })
  return h.digest("hex")
}

/** 逐档 hash（DESIGN-TOKEN-SETTLEMENT §10.2「清单与 hash 一起存进槽」）：单档**原始字节**的 sha256，
 *  与 `designSealHash` 同一读取面、同一失败形（读不到 ⇒ 抛，`err.sealPath` = 那一份档的路径）。
 *  它只服务拒文点名：判定值仍是组合 `hash`，这一列不参与任何判定。
 *  @param {string} absPath 被审档绝对路径
 *  @returns {string} sha256 十六进制 */
export function designDocHash(absPath) {
  let buf
  try {
    buf = readFileSync(absPath)
  } catch (e) {
    const err = new Error(`design seal: the reviewed document cannot be read (${absPath}: ${e?.message ?? e})`)
    err.sealPath = absPath
    err.cause = e
    throw err
  }
  return createHash("sha256").update(buf).digest("hex")
}

/** 封印行的逐档列（§10.2）：按 `docs` 原序逐档各算一次，成形 = `[{ path, hash }]`。
 *  @param {string[]} docs 被审档绝对路径（顺序 = settle 时记下的顺序）
 *  @returns {{path: string, hash: string}[]} */
export function designDocHashes(docs) {
  return docs.map((p) => ({ path: p, hash: designDocHash(p) }))
}

/** 该次评审的封印文档集 = 被审文档集里的**非批档**（§10.2「被算集合」）：
 *  批档评审通过后还要被写（§5 ∥ §6），把它算进封印就是让每一次正常收口都自毁封印。
 *  「哪一份是批档」的判据不在这里新定义——`isBatchFace` 是 doc-check 那一侧同一个批档面谓词
 *  （`docRoot.batches` 一处；显式 `null` = 本面无）。项目根按每份档自己上溯（多仓评审各归各仓）。
 *  清单来源**首选** = 受理面同一把尺解析出的受理绝对路径（`run.docAbs`，`advisor-async.mjs` 起评时落）；
 *  只有旧实例 ∥ 手建实例没有它时才退回实例键 `docSetKey`（`normAbs` 的 cwd 拼法——cwd 非项目根时
 *  与受理路径可不同）。顺序与去重：沿用来源的序；同档多种写法按平台大小写归一后去重。 */
function sealDocSetOf(run) {
  let list = null
  if (Array.isArray(run?.docAbs)) list = run.docAbs
  else { try { list = JSON.parse(run?.docSetKey ?? "null") } catch { return [] } }
  if (!Array.isArray(list)) return []
  const out = []
  const seen = new Set()
  for (const raw of list) {
    if (typeof raw !== "string" || !raw.trim()) continue
    const abs = resolve(raw)
    const key = process.platform === "win32" ? abs.toLowerCase() : abs
    if (seen.has(key)) continue
    seen.add(key)
    const root = owningProject(abs, parse(abs).root)
    if (root && isBatchFace(abs, root)) continue
    out.push(abs)
  }
  return out
}

/**
 * IS the verdict — the advisor echoes it only on approval. On echo (full string
 * OR truncated — uuid present; §5.1①): slot the token under designId (always the
 * FULL token; + eng-coder gate flag; single-value mirror retired per
 * DESIGN-TOKEN-SETTLEMENT D3), record its batch attribution (`_engDesignTokenBatches`
 * — `batchAbsPathOfRun(run)`: the instance's bound `batchDoc`, else the reviewed doc-set's
 * `batches/` file, §10; neither ⇒ no attribution), seal the reviewed documents
 * (`_engDesignTokenSeals` — the non-batch documents' sha256 + their list + the per-document
 * hashes the refusal names, §10.2; an empty set drops the previous seal for this designId)
 * and return the clean output with the
 * Approved suffix (truncated echo: the M2 marker sits before the suffix); the review
 * instance CLOSES (a later review of the same doc-set starts a fresh full
 * review). On non-echo: strip every echo form (single source §5.1③) and return
 * the findings text + the constant M1 marker — slots stay untouched
 * (方案 ②: a failed re-review revokes nothing). Whichever way it goes, this round's
 * block lands in the record first (the settlement writes it; the `@remarks` below
 * holds the order of the criteria).
 * @param {Object} [opts] — 第 11 批（A/F11）：`opts.incomplete` = 宿主尾族判定 kind
 *   （单谓词 `advisorIncompleteMarker`——结算方透传）。非空 ⇒ **一律不签发**（无论评审文本
 *   是否回显 token）：剥除全部 token 回显 + 追加未签发提示（原因 + 恢复指引），不写槽、
 *   不关实例（可重评）。
 * @remarks §3 记录判据（`ADVISOR-GUARDS.md` §1.2）——本函数**自己写**本轮的轮次块：块形 = 工具戳 +
 *   结算头 + 评审原文缩进四格（`design-review-record.mjs`），N 取 `nextRoundNumber`；块与状态行进同一个
 *   字符串、经同一条写通道一次落盘、一次回读（一笔的顺序与回退 = `docs/core/design/BATCH-RECORD.md` §4.23）。
 *   **前置 = 绑了批档**（`run.batchDoc` 非空）——设计评审必携 `batchDoc`（准入门，判据 = 同档 §2 第 6 条）
 *   ⇒ 到结算面仍为空只是接线故障，在 `boundBatch` 判定处断言并 throw（程序不变量，早于读档与写槽；
 *   不设对外拒因值，不返回判决）。
 *   §1.2 判据按序：① 批档可读——读不到 ⇒ `batch-unreadable`，零字节写；② 本轮块写进 §3 且回读见到它，
 *   pass 路径的段级状态行回读为「评审通过」，否则 ⇒ `status-not-passed` 并写回写前原文。
 *   处置四值（`pass` ∥ `changes-required` ∥ `no-pass-line` ∥ `no-valid-echo`）**都落一块**，凭证结局写进
 *   结算头；封印算不出（被审档在结算前变了）不落块、零字节写（§10.2 与 §4.4 KD5）。
 *   §10.2 封印算不出 ⇒ `{passed:false, sign:null}` + 恒定标记，且在任何写入之前返回。
 * @returns {{passed: boolean, output: string, sign: {before: string, rollback: () => void}|null}} —— `sign` 非空 =
 *   本笔在该批档上落了本轮的块（+ 按处置改写的状态行）：`before` = 写前原文（落盘失败时写回它），
 *   `rollback()` = 写回那一笔（写通道单源 = 本模块的 `recordWriter`，故回退走同一个注入点）。
 *   一个字节都没落盘（被任一前置拒）⇒ `sign: null`。
 */
export function settleDesignReview(agent, run, designToken, rawResult, opts = {}) {
  if (!designToken || typeof rawResult !== "string") {
    return { passed: false, output: rawResult ?? "", sign: null }
  }
  // A（F11/ADVISOR-GUARDS.md §1 消费点 1）：未完成即不签发——判据与 code 完成守卫同源（单谓词）。
  const incomplete = opts?.incomplete ?? null
  if (incomplete) {
    const stripped = stripDesignTokenEcho(rawResult, designToken).trim()
    return {
      passed: false,
      output: `${stripped}\n\n评审未完成——token 未签发 (review incomplete — no design token issued; reason: ${incomplete})\n以更小范围重跑设计评审（逐档 / 逐节拆分，或拆到两次评审），或调大 agent.advisor.timeoutMs 后重试；补充检查未完成的部分不得按已核处理。`.trim(),
      sign: null,
    }
  }
  // ── 处置（ADVISOR-GUARDS.md §1.2 + `BATCH-RECORD.md` §4.4）：先把处置算完——回显 → 裁定 ──
  // 值域四词 = `pass` ∥ `changes-required` ∥ `no-pass-line` ∥ `no-valid-echo`：四者**都落一块**
  // （判的是当前状态的评审都落一块——记录不拿凭证结果当过滤条件，凭证结局写在结算头）。
  // §5.1① 截断容忍：全串匹配 ∨ 截断形（本 token 的 uuid 值出现——空 uuid 不构成「值」）⇒ 认回显；
  // 两者皆无 ⇒ `no-valid-echo`（含正文为空——N7 零静默）。
  const uuid = String(designToken).split(":")[0]
  const fullEcho = makeDesignTokenRegex(designToken).test(rawResult)
  const truncatedEcho = !fullEcho && uuid.length > 0 && rawResult.includes(uuid)
  const disposition = (!fullEcho && !truncatedEcho)
    ? DISPOSITION_NO_ECHO
    : (verdictGateFailure(rawResult) ?? DISPOSITION_PASS)
  // 凭证不落档：块正文一律取**剥净回显**的评审原文（剥除单源 §5.1③）。
  const stripped = stripDesignTokenEcho(rawResult, designToken).trim()
  // 结算写 `§3` 只在工程模式的**设计轨**（`BATCH-RECORD.md` §4.4 ∥ `ADVISOR-GUARDS.md` §1.2 的第一句）：
  // 普通模式没有设计结算进场，`§3` 由绑定评审席位自己写（那一路的写通道保留）——留两个写者就有两块一轮。
  // 判据放在**读档之前**：不进写面就一个字节都不碰，也不做「写了半笔再跳过」。
  const engineering = !!agent?.config?.agent?.engineering
  // 前置 = 绑了批档，**程序不变量、不是拒发分支**：设计评审必携 `batchDoc`（准入门，判据 = 同档 §2 第 6 条）
  // ⇒ 到结算面仍为空只能是「绑定没传到实例」的接线故障 ⇒ 断言并 throw（串点名设计评审实例 + designId），
  // 零槽写、不返回判决、不设对外拒因值。给没发生过的情形配文案就是没有场景的分支；接线 bug 该炸得响，
  // 不该伪装成一条给用户看的拒因（本批 🔴1 裁定）。
  // 位置 = 读档 ∥ 写块 ∥ 写槽之前：落在其后就没拦——token 已在槽里、授权照发。
  // 调用点不得补 catch 后继续——控制流会落回 `set(...)` ⇒ token 照签、零报错、只留一条日志。
  const boundBatch = typeof run?.batchDoc === "string" && run.batchDoc.trim() ? run.batchDoc : null
  if (!boundBatch) {
    throw new Error(`design review settled with no batch-record binding (designId: ${run?.designId ?? "(none)"}) — a design review is launched with \`batchDoc\` required, so settling without it is a wiring fault, not an input to report.`)
  }
  // §10.2（DESIGN-TOKEN-SETTLEMENT）评审封印：**先算，后写**。被审档读不到 ⇒ 结算拒签（恒定标记），
  // 且在任何写入之前返回——它判的那份状态已不在，落了就把作废结论写成结论（§4.4 KD5；陈旧评审在
  // `settleAdvisorRun` 的 stale 支就不进本函数，同一判据的另一半）。两种模式都算：封印是签发的凭据面。
  // 不抛的理由 = 文件头标记注释；被算集合 = 被审文档集里的非批档；口径单源 = `designSealHash`。
  const sealDocs = sealDocSetOf(run)
  let sealHash = null
  let sealDocHashes = []
  if (sealDocs.length > 0) {
    try {
      sealHash = designSealHash(sealDocs)
      // 逐档列与组合值同一个 `try`：两笔都是「读被审档」，读不到时同一条拒签出去（§10.2）。
      sealDocHashes = designDocHashes(sealDocs)
    } catch (e) {
      return { passed: false, output: [stripped, SEAL_UNREADABLE_MARK(e?.sealPath ?? "(unknown)")].filter(Boolean).join("\n\n"), sign: null }
    }
  }
  // ── 一次写：块与状态行进同一个字符串，经**同一条**写通道（`recordWriter`）一次落盘 ──
  // 只在工程模式的设计轨（上面那一句判）；普通模式整段跳过、`sign` 留 `null`——那一路的 `§3` 由绑定评审席位写，
  // 连读都不必（读了也没有要判的对象，把「读不到 ⇒ batch-unreadable」搬到普通模式只是给一个没有写面的路配拒因）。
  let sign = null
  if (engineering) {
    // 判据 1（§1.2 第 1 条）：批档可读——读不到 ⇒ `batch-unreadable`，零字节写（块 ∥ 状态行 ∥ 槽都不动）。
    let batchSrc = null
    try {
      batchSrc = readFileSync(boundBatch, "utf8")
    } catch (e) {
      return {
        passed: false,
        output: [stripped, REVIEW_RECORD_MARK(RECORD_BATCH_UNREADABLE, `批档读不到: ${e?.code ?? e?.message ?? "unknown"}`)].filter(Boolean).join("\n\n"),
        sign: null,
      }
    }
    // 块由结算成形（`designReviewBlock`：工具戳 + 结算头 + 原文缩进四格），N 取 `nextRoundNumber`
    // （与 `append §3` 的盖戳同一枚计数），不另立第二套。段尾追加用 `appendLineToSection`（既有字节零变），
    // 状态行仍**只经 `updateSectionStatusLine` 这一个写入函数**改写——零新写路径、零新解析。
    // 状态行按处置写：`pass` 走 `statusPassPlan`（已是完成词则零写，幂等），`changes-required` 走
    // `statusResetPlan`（重置为进行中，块首不再另留痕行——本轮结论由结算头与原文承载），其余处置不动它。
    const date = todayLocal()
    const eol = batchSrc.includes("\r\n") ? "\r\n" : "\n"
    const plan = disposition === DISPOSITION_PASS
      ? statusPassPlan(batchSrc, 3, rawResult, "")
      : disposition === "changes-required" ? statusResetPlan(batchSrc, 3, rawResult, date) : null
    const block = designReviewBlock({
      roundN: nextRoundNumber(batchSrc, 3),
      signed: disposition === DISPOSITION_PASS,
      reason: disposition,
      date,
      body: stripped,
      eol,
    })
    const inserted = appendLineToSection(batchSrc, 3, block)
    const writtenSrc = plan ? updateSectionStatusLine(inserted, 3, plan.statusValue) : inserted
    // 回读的是**盘上字节**，不是刚算出的内存结果——写没落盘、写半截、被别处改回，都在这里现形。
    // 算全文这一步留在 `try` 之外：§3 段头缺失由写面 throw（接线故障该炸得响，不配一条给用户看的拒因
    // ——与 `boundBatch` 同判）；只有 `recordWriter` 那一次 fs 写才是「写失败」这一支。
    let failure = ""
    let signedSrc = null
    try {
      recordWriter(boundBatch, writtenSrc, "utf8")
    } catch (e) {
      failure = `写档失败: ${e?.message ?? String(e)}`
    }
    if (!failure) {
      try {
        signedSrc = readFileSync(boundBatch, "utf8")
      } catch (e) {
        failure = `块回读失败: ${e?.message ?? String(e)}`
      }
    }
    if (!failure) {
      // 判据 2（§1.2 第 2 条）：本轮块回读见到它；pass 路径的段级状态行回读为「评审通过」。
      const before = countRoundBlocks(batchSrc, 3)
      const after = countRoundBlocks(signedSrc, 3)
      if (after <= before) failure = `回读 §3 轮次块 ${after} 块（写前 ${before} 块）——本轮块不在 §3 里`
      else if (disposition === DISPOSITION_PASS) {
        const back = readSectionStatusWord(signedSrc, 3)
        // 回读不等 ⇒ 盘上可能已是半截档 ⇒ 写回写前原文（验收行要的是「写不进 ⇒ 零字节」，而半截写
        // 恰恰会留半张——截断的批档再没有别的恢复路径）。写回失败不吞：两处并报，token 未签。
        if (back !== STATUS_WORDS[3].done) failure = `回读 §3 状态行 = ${back ?? "（缺）"}；须 = ${STATUS_WORDS[3].done}`
      }
    }
    if (failure) {
      // 槽零写、`run.open` 不翻 ⇒ 修好该档后同一实例可重评（与裁定闸同形）；拒因不新增值——写失败与
      // 回读不等都落在同一个后置事实上（`status-not-passed` = 结算后那条不是「评审通过」），detail 点名真因。
      try {
        recordWriter(boundBatch, batchSrc, "utf8")
      } catch (e) {
        failure += `；写回写前原文也失败: ${e?.message ?? String(e)}`
      }
      return { passed: false, output: [stripped, REVIEW_RECORD_MARK(RECORD_STATUS_NOT_PASSED, failure)].filter(Boolean).join("\n\n"), sign: null }
    }
    // 块已落：交出去的 `sign` = **写前原文**与写回那一笔——落盘（token）失败时 `settleAdvisorRun` 用它
    // 连同块与状态行一起回退（§4.23：不留有块无凭证的假授权）。回退写经同一个 `recordWriter`
    // ⇒ 写通道只有一条，单测的注入对两笔同时生效。
    sign = { before: batchSrc, rollback: () => recordWriter(boundBatch, batchSrc, "utf8") }
  }
  // 三个非签发处置到此为止（两种模式同一结论：凭证不发；工程模式那一笔已把块留住，普通模式本轮不写块）：
  // 槽零写、`run.open` 不翻 ⇒ 修好后同一实例可重评；拒文与改前同形（三个恒定标记各自定位真因）。
  if (disposition === DISPOSITION_NO_ECHO) {
    return { passed: false, output: [stripped, NO_VALID_ECHO_MARK].filter(Boolean).join("\n\n"), sign }
  }
  if (disposition !== DISPOSITION_PASS) {
    return { passed: false, output: [stripped, VERDICT_GATE_MARK(disposition)].filter(Boolean).join("\n\n"), sign }
  }
  // §10.2（DESIGN-TOKEN-SETTLEMENT）评审封印：`sealDocs` / `sealHash` 已在裁定闸之后算好
  // （先算后写——被审档读不到时结算已在那一处拒签，没有任何字节落盘）。
  // Echoed the token → review passed. Issue it to the parent for eng-coder.
  agent._engDesignTokens ??= new Map()
  agent._engDesignTokens.set(run.designId, designToken)
  // §10 E1（DESIGN-TOKEN-SETTLEMENT）：批归属旁列同拍写——派生 = `batchAbsPathOfRun(run)`（两源定序：
  // `run.batchDoc` 优先、文档集里的批档兜底；零新输入）。派生为无 ⇒ 归属 = 无（不猜）：**删**该 designId
  // 的旧行——否则一次改了范围的复评会让新槽继承上一轮的归属，收口时消费掉本不该消费的授权。
  const batchAbs = batchAbsPathOfRun(run)
  if (batchAbs) {
    agent._engDesignTokenBatches ??= new Map()
    agent._engDesignTokenBatches.set(run.designId, batchAbs)
  } else if (agent._engDesignTokenBatches instanceof Map) {
    agent._engDesignTokenBatches.delete(run.designId)
  }
  // §10.2：封印与清单一并存进槽（派单侧只读槽里的 `docs` 复算，不自己推清单）。
  // 空集 ⇒ **删**该 designId 的旧行（与批归属同一分支理由）：同一 designId 的复评若只审了批档，
  // 旧封印留着会让下一次派单拿上一轮的版本去比这一轮的档。
  if (sealHash) {
    agent._engDesignTokenSeals ??= new Map()
    // `docHashes` 只服务拒文点名（§10.2「清单与 hash 一起存进槽」）：`hash` 仍是判定值，口径零改。
    agent._engDesignTokenSeals.set(run.designId, { hash: sealHash, docs: sealDocs, docHashes: sealDocHashes })
  } else if (agent._engDesignTokenSeals instanceof Map) {
    agent._engDesignTokenSeals.delete(run.designId)
  }
  // DESIGN-TOKEN-SETTLEMENT D3（2026-09-08）：单值镜像 `_engDesignToken` 退役——
  // 只写多槽 Map（AC3 零镜像写）；settle 落盘由调用方（settleAdvisorRun）当场做。
  // Unlock the dispatch design gate for eng-coder SELF-review (defense-in-depth —
  // see the sync wrapper's note: unreachable today, kept for parity).
  if (agent._role === "eng-coder") agent._engDesignReviewed = true
  run.open = false // approval closes this doc-set instance — next review is fresh
  run.priorOutput = null // #863 关闭点轻量化：审批关同拍释放（closed 实例零消费面——续跑仅取 open）
  const clean = stripDesignTokenEcho(rawResult, designToken).trim()
  // F2c: id echo + omission guidance + point-in-time slot snapshot — the
  // same suffix the F2e prior stores strip with (stored for the exact truncation).
  run.approvedSuffix = buildApprovedSuffix(designToken, run.designId, agent._engDesignTokens.size)
  return {
    passed: true,
    // §5.1② 标记位置不变式：M2 恒居 approvedSuffix 之前、suffix 恒居文末
    // （stripApprovedSuffix 的精确截断依赖此形——尾部追加改动不得破坏）。
    output: [clean, truncatedEcho ? TRUNCATED_ECHO_MARK : null, run.approvedSuffix].filter(Boolean).join("\n\n"),
    sign,
  }
}
