/**
 * provider-entries.mjs — `/model` L1 列表行的构建纯函数（`docs/core/design/PROVIDER.md` §6.29「可见面」）。
 *
 * 为什么单独成档：崩溃点就在这个函数体里——`${p.name.padEnd(12)}`。装载层漏进一条无 `name` 的
 * 条目（`{ ...null }` 得 `{}`）时，`undefined.padEnd` 抛
 * `Cannot read properties of undefined (reading 'padEnd')`，一条空条目让整条渠道列表不可用。
 * 验收不落在崩溃那一层等于没验那个 bug，所以它从 `model-picker.mjs` 的闭包搬出来，让用例能
 * import 直接喂参数——L1 与用例共用同一个函数，测试不复制实现。
 *
 * 零 TUI 运行时依赖：`isHidden` ∥ `ctxText` 由参数进来（实现住 `provider-admin.mjs`），本档不
 * import `render.mjs` ∥ picker 绑定 ⇒ 用例无需终端。
 *
 * 渲染层不加 `?? ""` 之类的防御：防御留在渲染处会把坏条目重新藏起来——准入过滤是全仓唯一入口
 * （`thincoder-core/config.mjs` 的装载过滤 ∥ `reloadProviders`）。
 */

/** 告警行文案（逐字，`docs/core/design/PROVIDER.md` §6.29「新名与文案」）：列表首行，指向要改的那一处。 */
function droppedHeaderText(count) {
  return count === 1
    ? '⚠ 1 provider entry skipped — no "name" (fix providers[] in config.json)'
    : `⚠ ${count} provider entries skipped — no "name" (fix providers[] in config.json)`
}

/**
 * buildProviderEntries({ providers, activeProvider, activeModel, dropped, isHidden, ctxText }) → entries[]
 *
 * 参数契约：
 * - 六个键调用方必须写全，不得省略任一键；**真必填只有三项**——`providers`（数组）·
 *   `isHidden`（函数 `(provider) => boolean`）· `ctxText`（函数 `(provider) => string`，取该渠道
 *   已声明的上下文回显）。缺一项或类型不符 ⇒ 抛 `TypeError` 点名该参数。
 * - 另三项的「无」是合法值域，不抛：`activeProvider` = `string | null`、`activeModel` =
 *   `string | null`（会话槽无值即 `null`），函数内按 `?? null` 归一；`dropped` = `string[] |
 *   undefined`（载体只在有丢弃时才存在，缺即无丢弃、与 `[]` 同义），按 `?? []` 归一。
 *
 * 返回：L1 的 `entries[]`。`dropped` 非空 ⇒ **首行**一条 `type:"header"` 告警，其后渠道行与
 * `Management` 管理项；`dropped` 为空 ⇒ 首行即渠道行。
 *
 * 渠道行形状与搬迁前逐键一致（`type` / `text` / `action` / `provider` / `marker` / `note`）——
 * 有 name 的条目一个字节不动；无名条目不进表（装载层已滤掉），也绝不在这里补一个名字。
 */
export function buildProviderEntries({
  providers: rawProviders,
  activeProvider: rawActiveProvider,
  activeModel: rawActiveModel,
  dropped: rawDropped,
  isHidden,
  ctxText,
} = {}) {
  if (!Array.isArray(rawProviders)) {
    throw new TypeError(`buildProviderEntries: "providers" must be an array (got ${rawProviders === null ? "null" : typeof rawProviders})`)
  }
  if (typeof isHidden !== "function") {
    throw new TypeError(`buildProviderEntries: "isHidden" must be a function (provider) => boolean (got ${typeof isHidden})`)
  }
  if (typeof ctxText !== "function") {
    throw new TypeError(`buildProviderEntries: "ctxText" must be a function (provider) => string (got ${typeof ctxText})`)
  }
  const activeProvider = rawActiveProvider ?? null
  const activeModel = rawActiveModel ?? null
  const dropped = rawDropped ?? []

  const entries = []
  if (dropped.length) entries.push({ type: "header", text: droppedHeaderText(dropped.length) })

  const providers = rawProviders.filter((p) => !isHidden(p)) // 派生无 key ⇒ 隐藏（TEAM.md §2.4——模型候选面）
  for (const p of providers) {
    const active = p.name === activeProvider
    const shown = active && activeModel ? ` ${activeModel}` : ""
    const marker = active ? "●" : ""
    // A1（第 20 批 §12.5）：渠道警示（(no key) / (不可用)）在 text 里，与既有状态标
    // （(ctx …) / ← session）同簇；note 收窄为 baseURL（补充信息——超宽随行右截断可接受）。
    const sessionNote = active ? " ← session" : ""
    const keyStatus = p.apiKey ? "" : " (no key)"
    const unavailable = p._unavailable ? " (不可用)" : ""
    const ctxTag = ` (ctx ${ctxText(p)})`
    entries.push({
      type: "item",
      text: `${p.name.padEnd(12)}${shown}${ctxTag}${keyStatus}${unavailable}${sessionNote}`,
      action: "open-models",
      provider: p.name,
      marker,
      note: p.baseURL,
    })
  }

  entries.push({ type: "header", text: "Management" })
  entries.push({ type: "item", text: "Add provider…", action: "add" })
  if (providers.length > 1) entries.push({ type: "item", text: "Remove provider…", action: "remove" })
  entries.push({ type: "item", text: "Set / change API key…", action: "key" })
  entries.push({ type: "item", text: "Set context window (K)…", action: "model-context" })
  return entries
}