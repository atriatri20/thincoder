/**
 * window-policy.mjs — 窗口策略面（有效窗口 ∥ 两个预算出口 ∥ 压缩线派生）。
 *
 * 迁出：`config.mjs` 的预算族（`outputReserve` ∥ `usableWindow` ∥ `requestBudget` ∥
 * `resolveCompactThreshold`）整族迁入本档；`config.mjs` 经 `export … from` 转口保既有导入面（先例 =
 * `model-specs.mjs` 自 `config.mjs` 抽出的同形）。
 * 新增：`TINY_WINDOW_CAP` ∥ `effectiveWindow` ∥ `policyBudget`——窗口只有一个事实来源（`providerSpec`
 * 的五级链，`PROVIDER.md` §6.15），策略出口只有 `effectiveWindow` 一个（`CONTEXT-COMPACTION.md` §2.1 / §2.2）。
 *
 * 为什么要单出一层：策略值只从 `workMode` 现算，**不落在 provider ∥ config 对象上**——派生字段会被落盘 ∥
 * 跨会话带走，「切出 tiny 即解除」就只能靠下一次装配才成立，而它必须在下一处读数上就生效。
 * 缺参即拒（§2.3）：`workMode` 无默认值，值不在 `WORK_MODES` 里就在函数入口拒绝并点名参数——默认值会把
 * 「忘传」静默成一条不下上限的窗口，压缩线随之上移，人要等到账单才发现。
 *
 * 派生链（§2.2）：`window` 是唯一输入。`reserve` 与窗口无关；`limit = window − reserve`；`threshold =
 * min(limit − INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)`。三个量对窗口的斜率分别是 0 ∥ 1 ∥ 1，封顶段上
 * `threshold` 的斜率转 0 ⇒ 窗口增大时两线都不减小（恒定不算减小）。
 * 算式里没有比例项，也没有静默兜底：派生不成立就在装载期抛（§2.4）。
 *
 * 依赖面 = `model-specs.mjs`（`providerSpec` ∥ `providerSpecResolution`）+ `config-migrate.mjs`
 * （`WORK_MODES`）——**零 import 环**（本档不 import `config.mjs`，只被它转口）。
 */
import { providerSpec, providerSpecResolution } from "./model-specs.mjs"
import { WORK_MODES } from "./config-migrate.mjs"

/** tiny 档的有效窗口上限（token）：`CONTEXT-COMPACTION.md` §2.1 的策略值。数值在本档只出现这一处。 */
export const TINY_WINDOW_CAP = 262144

/** 压缩线上方留给注入上下文的余量（`CONTEXT-COMPACTION.md` §2.2）。
 *  Headroom above the line absorbs injected context (directory tree, git context, outline, project instructions,
 *  memory/doc search — 30–50K). 这些量按会话注入、**不随窗口缩放**：1M 窗口上与 320K 窗口上它们占同样多的条目，
 *  所以正确的刻度是绝对量，不是窗口比例。
 *  取上界 50000 的理由不对称：估小一档的后果是注入把 prompt 顶过硬上限而压缩线帮不上（守卫报 `context_overflow`），
 *  估大一档只多付一次早压。 */
export const INJECT_HEADROOM_TOKENS = 50000

/** 压缩线的绝对上限（`CONTEXT-COMPACTION.md` §2.2）：`threshold` 不越过这个数，窗口再大也一样。
 *  理由是用户的现场观测：上下文越长部分模型的注意力越衰减，1M 窗口的模型也只要求用到 256K。这是观测事实，
 *  不是估算，也不是可以按模型重推的推断，所以它是一个显式常量而不是派生值。
 *  它封的是**压缩线**：`TINY_WINDOW_CAP`（同值 262144）封的是**窗口**——同值不同物，改一个不动另一个。
 *  只夹 `threshold`，不夹 `limit`：`limit` 是物理线（窗口减预留），把它压到之下会在真实越窗之前就报错。 */
export const RETAIN_CAP_TOKENS = 262144

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

// ─── 预算族（自 `config.mjs` 迁出；算式 = §2.2 的四行）────────────────────────

// absent 档的服务端默认输出（`CONTEXT-COMPACTION.md` §2.2.1）。三个数的唯一出处 =
// https://api-docs.deepseek.com/zh-cn/api/create-chat-completion 的 `max_tokens` 段：
// 「限制一次请求中模型生成 completion 的最大 token 数。取值范围为 1 到 384K（393216）。未设置时，非思考模式
// 默认 8K，思考模式默认 64K（`reasoning_effort` 为 `max` 时为 128K）。」
// 要改这三个数，先改那条文档事实——它们不是我们的旋钮，是服务端收到请求后自己会生成多少。
const DEFAULT_OUTPUT_PLAIN = 8_192
const DEFAULT_OUTPUT_THINKING = 65_536
const DEFAULT_OUTPUT_MAX_EFFORT = 131_072

/**
 * Output reservation counted against the window (`CONTEXT-COMPACTION.md` §2.2.1): what THIS request
 * actually takes out of the window for output.
 * - explicit `provider.maxTokens` ⇒ that value verbatim (the transport sends it as max_tokens).
 * - `format === "anthropic"` ⇒ `spec.maxOutput` (that face always sends max_tokens ⇒ spec 档).
 * - absent 档（transport sends no max_tokens）⇒ `min(spec.maxOutput, 服务端默认输出)`: the server reserves
 *   its own default, not the model's capability ceiling.
 * explicit 档与 spec 档**不封顶**：那两档的 reserve 就是实发输出预算，封顶等于把真实输出挤进输入里
 * （教训见 2026-10-18 overflow 400：`budget counted 250_000, 393_216 actually sent`）。
 * 分支只有这一处：`budgetOf` 照本函数的返回值取数，不另判一次档。
 */
export function outputReserve(provider, spec) {
  // 与 `budgetOf` 同一归一（`Number(...)` + 有限正数判）：两处各写一种取值判，explicit 档的 reserve
  // 就会与实际发出的 maxTokens 分成两个数。
  const rawExplicit = Number(provider?.maxTokens)
  const explicit = Number.isFinite(rawExplicit) && rawExplicit > 0 ? rawExplicit : undefined
  if (explicit !== undefined) return explicit
  const maxOutput = spec?.maxOutput ?? 0
  if (provider?.format === "anthropic") return maxOutput
  const defaultOutput = provider?.reasoningEffort === "max"
    ? DEFAULT_OUTPUT_MAX_EFFORT
    : (spec?.thinking ? DEFAULT_OUTPUT_THINKING : DEFAULT_OUTPUT_PLAIN)
  return Math.min(maxOutput, defaultOutput)
}

/**
 * Usable input window = window − output reservation (§2.2 的 `limit`)。判据单点（§2.4）：
 * `reserve ≥ window` 时派生链没有解——没有任何输入装得下，`limit ≤ 0`、`threshold < 0`。
 * 这一格不静默兜底：配置不成立就在装载期抛，报文点三个数（window ∥ reserve ∥ 差值）与三条出路。
 * 留到发送期才报的后果是报文说 `context_overflow`、指向会话内容，而真实原因是配置矛盾。
 */
export function usableWindow(context, reserve) {
  const ctx = context ?? 0
  const usable = ctx - reserve
  if (usable <= 0) {
    throw new Error(
      `usableWindow: the output reservation ${reserve} leaves no input window — window ${ctx} − reserve ${reserve} = ${usable}. ` +
      `No prompt can fit this configuration: raise the window (providers[].modelContext / a larger-context model), ` +
      `lower provider.maxTokens, or use a model whose maxOutput is smaller than its window.`,
    )
  }
  return usable
}

/**
 * The one budget formula (§2.2) — window is the ONLY input that differs between the two exits.
 * Fields:
 *  - window / windowSource: the input window this budget was computed on, plus its source name
 *    (closed set { modelContext | provider-override | list | spec | default }, passed through
 *    verbatim — no class merging).
 *  - maxTokens / maxTokensSource: the value THIS transport writes into the request body —
 *    anthropic always sends it (explicit ?? spec.maxOutput); the other three faces send only an
 *    explicit provider.maxTokens, absent ⇒ undefined / "absent". Never a guard criterion
 *    (undefined ⇒ NaN — §6.17 guard); the guard reads limit instead.
 *  - reserve: what the request actually takes out of the window for output (see `outputReserve`).
 *  - limit: window − reserve — the input ceiling the server accepts (prompt + reserved output ≤ window).
 *  - threshold: min(limit − INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS) — the compaction trigger line.
 *    The cap clamps the LINE only, never `limit`: the guard line must stay below the physical one, or a
 *    request that fits would be refused before it ever overflows.
 * 派生不成立（reserve ≥ window、threshold ≤ 0）都在这里抛（§2.4）：守卫面因此永远拿到一个正数 `limit`。
 */
function budgetOf(provider, spec, window, windowSource) {
  const explicitRaw = Number(provider?.maxTokens)
  const explicit = Number.isFinite(explicitRaw) && explicitRaw > 0 ? explicitRaw : undefined
  const anthropicAlwaysSends = provider?.format === "anthropic"
  const maxTokens = explicit ?? (anthropicAlwaysSends ? spec?.maxOutput ?? 0 : undefined)
  const maxTokensSource = explicit != null ? "explicit" : anthropicAlwaysSends ? "spec" : "absent"
  const reserve = outputReserve(provider, spec)
  const limit = usableWindow(window, reserve)
  // 封顶只夹压缩线（§2.2）：RETAIN_CAP_TOKENS 是正数 ⇒ 下面的非正判据只可能出自第一个臂。
  const threshold = Math.min(limit - INJECT_HEADROOM_TOKENS, RETAIN_CAP_TOKENS)
  if (threshold <= 0) {
    throw new Error(
      `budgetOf: the compaction line does not exist — window ${window} − reserve ${reserve} = ${limit} input tokens, ` +
      `but the injected context needs ${INJECT_HEADROOM_TOKENS} of headroom above the line. ` +
      `The window fits the output reservation and not the injection: raise the window or lower provider.maxTokens.`,
    )
  }
  return { window, windowSource, maxTokens, maxTokensSource, reserve, limit, threshold }
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
 *  and the pre-send guard read (window ∥ limit ∥ threshold).
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
 *  otherwise auto = policyBudget().threshold (§6.17 single source — min(limit − INJECT_HEADROOM_TOKENS,
 *  RETAIN_CAP_TOKENS), over the EFFECTIVE window, §2.1). Second param accepts EITHER a model name string (pure spec lookup —
 *  compat shape, no caller passes a string today) OR a provider object (providerSpec — the
 *  providers[].context override in K units is honored, PROVIDER.md §15 T-C2).
 *  `workMode` is checked at the entrance even when `explicit` is present: the value domain has one
 *  gate, and a caller that forgot the mode is wrong whichever branch it lands on. */
export function resolveCompactThreshold(explicit, modelOrProvider, workMode) {
  assertWorkMode(workMode, "resolveCompactThreshold")
  if (explicit != null) return { value: explicit, auto: false }
  const provider = typeof modelOrProvider === "string" ? { model: modelOrProvider } : (modelOrProvider ?? {})
  return { value: policyBudget(provider, undefined, workMode).threshold, auto: true }
}
