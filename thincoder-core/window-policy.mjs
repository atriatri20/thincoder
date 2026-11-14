/**
 * window-policy.mjs — 窗口策略面（有效窗口 ∥ 两个预算出口 ∥ 压缩线派生）。
 *
 * 迁出：`config.mjs` 的预算族（`COMPACT_RATIO` ∥ `outputReserve` ∥ `usableWindow` ∥ `requestBudget` ∥
 * `resolveCompactThreshold`）整族迁入本档；`config.mjs` 经 `export … from` 转口保既有导入面（先例 =
 * `model-specs.mjs` 自 `config.mjs` 抽出的同形）。迁出块逐字，算式零改。
 * 新增：`TINY_WINDOW_CAP` ∥ `effectiveWindow` ∥ `policyBudget`——窗口只有一个事实来源（`providerSpec`
 * 的五级链，`PROVIDER.md` §6.15），策略出口只有 `effectiveWindow` 一个（`CONTEXT-COMPACTION.md` §2.1 / §2.2）。
 *
 * 为什么要单出一层：策略值只从 `workMode` 现算，**不落在 provider ∥ config 对象上**——派生字段会被落盘 ∥
 * 跨会话带走，「切出 tiny 即解除」就只能靠下一次装配才成立，而它必须在下一处读数上就生效。
 * 缺参即拒（§2.3）：`workMode` 无默认值，值不在 `WORK_MODES` 里就在函数入口拒绝并点名参数——默认值会把
 * 「忘传」静默成一条不下上限的窗口，压缩线随之上移，人要等到账单才发现。
 *
 * 依赖面 = `model-specs.mjs`（`providerSpec` ∥ `providerSpecResolution`）+ `config-migrate.mjs`
 * （`WORK_MODES`）——**零 import 环**（本档不 import `config.mjs`，只被它转口）。
 */
import { providerSpec, providerSpecResolution } from "./model-specs.mjs"
import { WORK_MODES } from "./config-migrate.mjs"

/** tiny 档的有效窗口上限（token）：`CONTEXT-COMPACTION.md` §2.1 的策略值。数值在本档只出现这一处。 */
export const TINY_WINDOW_CAP = 262144

/** 模式入参的准入判据（§2.3 缺参即拒）：无默认值。合法值域单源 = `WORK_MODES`（不在此重列字面）。 */
function assertWorkMode(workMode, fnName) {
  if (!WORK_MODES.includes(workMode)) {
    throw new Error(`${fnName}: workMode is required and must be one of ${WORK_MODES.join(" / ")} — got ${JSON.stringify(workMode)}`)
  }
}

/** 策略收敛的唯一算式（§2.1）：tiny 取 min(模型窗口, TINY_WINDOW_CAP)；其余档逐位返回模型窗口。
 *  `effectiveWindow` 与 `policyBudget` 同调本函数——两处各写一遍就是一个政策两个实现。 */
function capWindow(modelWindow, workMode) {
  return workMode === "tiny" ? Math.min(modelWindow, TINY_WINDOW_CAP) : modelWindow
}

/**
 * 有效窗口（§2.1）：本 run 参与预算算式和一切上下文百分比分母的输入窗口。它由模型的真实窗口经工作模式
 * 策略收敛得到，是**策略值**，不是模型事实——模型事实仍只由 `providerSpec` 回答，本档不改它。
 * 窗口派生的一切读数（threshold ∥ limit ∥ 尾部两式 ∥ 百分比分母）全从本函数取，端侧不另立算式。
 * @param {object} provider 在用渠道条目（含 model）
 * @param {"tiny"|"normal"|"engineering"} workMode 必填，无缺省
 */
export function effectiveWindow(provider, workMode) {
  assertWorkMode(workMode, "effectiveWindow")
  return capWindow(providerSpec(provider).context, workMode)
}

// ─── 预算族（自 `config.mjs` 迁出，算式逐字）───────────────────────────────────

// Window utilization ratio (CONTEXT-COMPACTION.md §6.2 / D-CC30 / §6.17 / D-CC32): auto threshold =
// min(usableWindow(window, reserve), ⌊window × COMPACT_RATIO⌋) — reserve is the output budget
// ACTUALLY sent as max_tokens (uncapped; §6.17 requestBudget is the single source). Rows with
// reserve < 40% of the window land on the ratio term (line = 60.0% of the window); larger
// reservations pull the line down to window − reserve — overflow-free outranks the ratio (the two
// are mathematically exclusive once reserve ≥ 40%, §6.2). Headroom above the line absorbs injected
// context (directory tree, git context, outline, project instructions, memory/doc search — 30–50K).
const COMPACT_RATIO = 0.6

/** Output reservation counted against the window: the value ACTUALLY sent as max_tokens —
 *  explicit `provider.maxTokens` when set (the transport faces send it verbatim), else the spec
 *  `maxOutput`, else 0. NOT capped: the old 25% cap reopened a residual band between the counted
 *  reservation and the real output budget — messages could cross the true window while still below
 *  the compaction line (2026-10-18 overflow 400: budget counted 250_000, 393_216 actually sent).
 *  Single source = §6.17 requestBudget; this is its reserve face (advisor budget reuses it). */
export function outputReserve(provider, spec) {
  const explicit = provider?.maxTokens
  return Number.isFinite(explicit) && explicit > 0 ? explicit : spec?.maxOutput ?? 0
}

/** Usable input window = window − output reservation. Degenerate guard: a reservation
 *  ≥ the window is non-physical (no input could ever fit — e.g. `doubao-seed-2-1-turbo-260628`:
 *  256_000 window / 256_000 `maxOutput` (官方口径) ∥ the test harness&apos;s 1K window vs the
 *  default spec); collapsing the budget to 0 would be instant `context_limit` death — the very
 *  failure the reservation fold exists to prevent. Fall back to half the window.
 *  (2026-10-06——收口核验捕获：advisor-loop-split B5a 红。） */
export function usableWindow(context, reserve) {
  const ctx = context ?? 0
  const usable = ctx - reserve
  return usable > 0 ? usable : Math.floor(ctx / 2)
}

/** The one budget formula (§2.2) — window is the ONLY input that differs between the two exits.
 *  Fields:
 *  - window / windowSource: the input window this budget was computed on, plus its source name
 *    (closed set { modelContext | provider-override | list | spec | default }, passed through
 *    verbatim — no class merging).
 *  - maxTokens / maxTokensSource: the value THIS transport writes into the request body —
 *    anthropic always sends it (explicit ?? spec.maxOutput); the other three faces send only an
 *    explicit provider.maxTokens, absent ⇒ undefined / "absent". Never a guard criterion
 *    (undefined ⇒ NaN — §6.17 guard); the guard reads limit instead.
 *  - reserve: maxTokens ?? spec.maxOutput — uncapped, always a number.
 *  - usable: usableWindow(window, reserve) (degenerate half-window guard).
 *  - threshold: min(usable, ⌊window × COMPACT_RATIO⌋) — the compaction trigger line.
 *  - limit: window − reserve — hard prompt ceiling; the guard's ONLY numeric criterion field
 *    (always a number; negative = any prompt overflows). `absent` rows (the transport sends no
 *    max_tokens) take the floor max(window − reserve, threshold): only the degenerate
 *    reserve ≥ window rows move (bare value 0 ⇒ every prompt would be rejected), and for
 *    reserve < window threshold ≤ usable = window − reserve makes the floor a no-op. */
function budgetOf(provider, spec, window, windowSource) {
  const explicitRaw = Number(provider?.maxTokens)
  const explicit = Number.isFinite(explicitRaw) && explicitRaw > 0 ? explicitRaw : undefined
  const anthropicAlwaysSends = provider?.format === "anthropic"
  const maxTokens = explicit ?? (anthropicAlwaysSends ? spec?.maxOutput ?? 0 : undefined)
  const maxTokensSource = explicit != null ? "explicit" : anthropicAlwaysSends ? "spec" : "absent"
  const reserve = maxTokens ?? spec?.maxOutput ?? 0
  const usable = usableWindow(window, reserve)
  const threshold = Math.min(usable, Math.floor(window * COMPACT_RATIO))
  const bare = window - reserve
  return {
    window, windowSource, maxTokens, maxTokensSource, reserve, usable, threshold,
    // §6.17 地板：absent 档 reserve 可能 ≥ window（退化行，bare ≤ 0）——裸式下任何 prompt 都判真、
    // 该档永久发不出去；地板把它抬到 ≤ ⌊w/2⌋。非 absent 档逐位不变（仍是 bare）。
    limit: maxTokensSource === "absent" ? Math.max(bare, threshold) : bare,
  }
}

/** Request budget — the MODEL-window exit (§2.2). Single source for the actually-sent max_tokens
 *  (CONTEXT-COMPACTION.md §6.17 / D-CC32). Four consumer faces read it here for that one purpose:
 *  the four transport faces (`provider/core.mjs` OpenAI-compatible ∥ `provider/anthropic.mjs`
 *  Messages ∥ `provider/google.mjs` generateContent ∥ `provider/responses-request.mjs` Responses)
 *  read ONLY maxTokens — max_tokens is the output contract, untouched by any input-window policy.
 *  Everything that measures the INPUT window reads `policyBudget` instead (§2.2).
 *  窗口来源 = 五级链的同一次遍历出口（§6.15）——L1 / L3 命中也会如实报来源，不再二值猜。
 *  调用方传 spec（core.mjs 已算过 providerSpec）时窗口值用它，来源仍读 resolution（恒等映射，不并类）。 */
export function requestBudget(provider, spec) {
  const resolution = providerSpecResolution(provider)
  const resolved = spec ?? resolution.spec
  return budgetOf(provider, resolved, resolved?.context ?? 0, resolution.source)
}

/** Policy budget — the EFFECTIVE-window exit (§2.2): what the compaction threshold, the stats face
 *  and the pre-send guard read (window ∥ usable ∥ threshold ∥ limit).
 *  `maxTokens ∥ maxTokensSource ∥ reserve ∥ windowSource` 逐位转交 `requestBudget`（同一算式、同一次五级链
 *  遍历），不另算；与它不同的只有窗口那一边 = `effectiveWindow`。`windowSource` 说的是**模型窗口**的来源名，
 *  在 tiny 档下窗口已被策略收敛到 `TINY_WINDOW_CAP`——照抄而不另起一个来源名，是 §2.2 的裁定。
 * @param {object} provider 在用渠道条目
 * @param {object} [spec] 调用方已算过的 providerSpec（省一次查表；来源仍读五级链）
 * @param {"tiny"|"normal"|"engineering"} workMode 必填，无缺省
 */
export function policyBudget(provider, spec, workMode) {
  assertWorkMode(workMode, "policyBudget")
  const resolution = providerSpecResolution(provider)
  const resolved = spec ?? resolution.spec
  return budgetOf(provider, resolved, capWindow(resolved?.context ?? 0, workMode), resolution.source)
}

/** Derive compaction threshold; explicit is the value explicitly set in config file (takes priority),
 *  otherwise auto = policyBudget().threshold (§6.17 single source — min(usable, ⌊window × 0.6⌋),
 *  reserve uncapped — over the EFFECTIVE window, §2.1). Second param accepts EITHER a model name
 *  string (pure spec lookup — compat shape, no caller passes a string today) OR a provider object
 *  (providerSpec — the providers[].context override in K units is honored, PROVIDER.md §15 T-C2).
 *  `workMode` is checked at the entrance even when `explicit` is present: the value domain has one
 *  gate, and a caller that forgot the mode is wrong whichever branch it lands on. */
export function resolveCompactThreshold(explicit, modelOrProvider, workMode) {
  assertWorkMode(workMode, "resolveCompactThreshold")
  if (explicit != null) return { value: explicit, auto: false }
  const provider = typeof modelOrProvider === "string" ? { model: modelOrProvider } : (modelOrProvider ?? {})
  return { value: policyBudget(provider, undefined, workMode).threshold, auto: true }
}
