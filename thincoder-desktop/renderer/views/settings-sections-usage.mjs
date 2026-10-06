/**
 * settings-sections-usage.mjs — 设置面「用量」段体（Token 用量统计批 · 2026-10-06 · 自立出档 ——
 * 段体先例 = `settings-sections-env.mjs`「先拆后改」同律；本档 re-export 住 `settings-sections.mjs`）。
 *
 * 面形（**二轮定形** —— 9Router 使用量页同构，用户裁定「时间切换模块免除了一个时间范围一个卡片的问题」）：
 *  ① 期档切换器（`today ∕ 24h ∕ 7d ∕ 30d ∕ all` —— 闭集同 9Router `UsageStats.PERIODS`；主进程
 *     `usage-log.mjs` `periodCutoff` 单源过滤）+ 单组指标四卡：请求总数 ∕ 输入 ∕ 缓存 ∕ 输出 ——
 *     数值千分位全数字（9Router 同形）；副行：输入 = 非缓存 ∕ 缓存 = 命中率 ∕ 输出 = 含思考。
 *  ② 按模型表 —— 模型 ∕ 请求 ∕ 输入 ∕ 输出 ∕ 缓存%（requests 降序，与回执同序）。
 *  ③ 按天表（有数日最新在前，上限 14 行）—— 日期 ∕ 请求 ∕ 输入 ∕ 输出 ∕ 缓存%。
 * 期档切换 = `handlers.onSelectPeriod`（切片先落 + force 重读 —— 聚合在主进程，客户端不可推导）；
 * 刷新 = `handlers.onRefreshUsage`。三态：`none` ∕ `loading` ⇒ 段态词承载（分派面 `sectionStateNode`，
 * 本档零节点）；`ready` ⇒ 上述面。纪律：零 DOM（描述符树）；文案一律经 `t()`；handler 缺 ⇒ 控件
 * `disabled`（诚实非死控）；零 `node:` ∕ 零裸包。紧凑显示自持（`fmtCompact` —— 跨档私有函数不可导入
 * 同先例；卡片全数字 `fmtFull` 本档自持）。
 */
import { t } from "../i18n.mjs"
import { wire } from "./chat-tool.mjs"

/** 列表切片：缺 ∕ 非数组 ⇒ 空表（零节点 —— 禁假数据）。 */
const listOf = (value) => (Array.isArray(value) ? value : [])

/** 令牌紧凑显示（1234 ⇒ 1.2k ∕ 3400000 ⇒ 3.4M；0 ∕ 非数 ⇒ null —— 表格列防撑宽）。 */
function fmtCompact(n) {
  if (!Number.isFinite(n) || n <= 0) return null
  if (n >= 1e6) return `${Math.round(n / 1e5) / 10}M`
  if (n >= 1e3) return `${Math.round(n / 100) / 10}k`
  return String(n)
}

/** 卡片全数字显示（千分位 —— 9Router 同形；0 ∕ 非数 ⇒ "0"）。 */
function fmtFull(n) {
  return Number.isFinite(n) && n > 0 ? n.toLocaleString("en-US") : "0"
}

/** 缓存命中率显示（prompt 侧 —— cacheRead ∕ prompt；prompt ∕ cacheRead 零 ∕ 非数 ⇒ null）。 */
function cacheHitPct(bucket) {
  const prompt = bucket?.prompt
  const cacheRead = bucket?.cacheRead
  if (!Number.isFinite(prompt) || prompt <= 0 || !Number.isFinite(cacheRead) || cacheRead <= 0) return null
  return `${Math.round((cacheRead / prompt) * 1000) / 10}%`
}

/** 期档闭集（值 ∶ 词键 —— 顺序即展示序；9Router PERIODS 同形，缺 60d —— 台账窗口 3 个月收窄无益）。 */
const PERIOD_TABS = Object.freeze([
  ["today", "settings.usage.period.today"],
  ["24h", "settings.usage.period.24h"],
  ["7d", "settings.usage.period.7d"],
  ["30d", "settings.usage.period.30d"],
  ["all", "settings.usage.period.all"],
])

/** 期档切换器（胶囊组 —— 9Router 顶部右侧同位；active = 实心 accent）。 */
function periodTabs(current, handlers) {
  return {
    tag: "div",
    props: { class: "usage-periods", role: "tablist", "aria-label": t("settings.usage.window") },
    children: PERIOD_TABS.map(([value, word]) => ({
      tag: "button",
      props: wire({
        class: value === current ? "usage-period active" : "usage-period",
        type: "button", "data-action": "settings:usagePeriod", "data-period": value,
        role: "tab", "aria-selected": String(value === current),
      }, typeof handlers?.onSelectPeriod === "function" ? () => handlers.onSelectPeriod(value) : undefined),
      children: [t(word)],
    })),
  }
}

/** 指标卡（标签弱色 ∕ 数值大字 ∕ 副行可选 —— 9Router 指标卡同构，左对齐沿本端成语）。 */
function metricCard(label, value, sub) {
  return {
    tag: "div",
    props: { class: "usage-card", "data-usage-card": "" },
    children: [
      { tag: "div", props: { class: "usage-card-label" }, children: [label] },
      { tag: "div", props: { class: "usage-card-value" }, children: [value] },
      ...(sub === null ? [] : [{ tag: "div", props: { class: "usage-card-sub" }, children: [sub] }]),
    ],
  }
}

/** 表行（按模型 ∕ 按天共用 —— 表头行 `head = true` 时列标承载）。 */
function tableRow(cells, head = false) {
  return {
    tag: "div",
    props: { class: head ? "usage-table-row usage-table-head" : "usage-table-row" },
    children: cells.map((cell) => ({ tag: "span", props: { class: "usage-table-cell" }, children: [cell] })),
  }
}

/** 指标四卡行（单组 —— 值全数出当前期档 `stats.total`，零客户端再聚合；思考零值不落副行 —— 零噪音）。 */
function metricCards(stats) {
  const total = stats?.total ?? {}
  const prompt = Number.isFinite(total.prompt) ? total.prompt : 0
  const cacheRead = Number.isFinite(total.cacheRead) ? total.cacheRead : 0
  const reasoning = Number.isFinite(total.reasoning) ? total.reasoning : 0
  const hit = cacheHitPct(total)
  return {
    tag: "div",
    props: { class: "usage-cards" },
    children: [
      metricCard(t("settings.usage.requestsTotal"), fmtFull(stats?.requests), null),
      metricCard(t("settings.usage.input"), fmtFull(prompt), t("settings.usage.uncached", { n: fmtFull(Math.max(0, prompt - cacheRead)) })),
      metricCard(t("settings.usage.cacheCol"), fmtFull(cacheRead), hit === null ? t("settings.usage.noCache") : t("settings.usage.cacheHit", { pct: hit })),
      metricCard(t("settings.usage.output"), fmtFull(total.completion), reasoning > 0 ? t("settings.usage.inclReasoning", { n: fmtFull(reasoning) }) : null),
    ],
  }
}

/**
 * 「用量」段体：`model` = `settings.usage` 切片（`{ state, period, stats }`）·
 * `handlers.onSelectPeriod` ∕ `handlers.onRefreshUsage` = 期档 ∕ 刷新出口。
 * `ready` 才落行（分派面同 `env` ∕ `models` 判 —— 本档零段态门重抄）。
 */
export function usageBody(section, handlers = {}) {
  const stats = section?.stats ?? null
  const period = typeof section?.period === "string" && section.period !== "" ? section.period : "today"
  const byModel = listOf(stats?.byModel)
  const byDay = listOf(stats?.byDay).slice(-14).reverse() // 有数日，最新在前（上限 14 行）
  const onRefresh = typeof handlers?.onRefreshUsage === "function" ? () => handlers.onRefreshUsage() : undefined
  return [
    {
      tag: "div",
      props: { class: "settings-field-row", "data-usage-meta": "" },
      children: [
        { tag: "span", props: { class: "settings-row-value" }, children: [t("settings.usage.window")] },
        { tag: "div", props: { class: "usage-controls" }, children: [
          periodTabs(period, handlers),
          {
            tag: "button",
            props: wire({ class: "settings-row-action", type: "button", "data-action": "settings:refreshUsage" }, onRefresh),
            children: [t("settings.usage.refresh")],
          },
        ] },
      ],
    },
    metricCards(stats),
    // ── 按模型 ──
    { tag: "div", props: { class: "settings-field-label", "data-subtitle": "by-model" }, children: [t("settings.usage.byModel")] },
    { tag: "div", props: { class: "usage-table", "data-usage-models": "" }, children: [
      tableRow([t("settings.usage.model"), t("settings.usage.requestsCol"), t("settings.usage.input"), t("settings.usage.output"), t("settings.usage.cacheCol")], true),
      ...(byModel.length === 0
        ? [tableRow([t("settings.usage.empty"), "", "", "", ""])]
        : byModel.map((row) => tableRow([
          typeof row?.model === "string" && row.model !== "" ? row.model : "?",
          String(Number.isFinite(row?.requests) ? row.requests : 0),
          fmtCompact(row?.prompt) ?? "0",
          fmtCompact(row?.completion) ?? "0",
          cacheHitPct(row) ?? "—",
        ]))),
    ] },
    // ── 按天 ──
    { tag: "div", props: { class: "settings-field-label", "data-subtitle": "by-day" }, children: [t("settings.usage.byDay")] },
    { tag: "div", props: { class: "usage-table", "data-usage-days": "" }, children: [
      tableRow([t("settings.usage.day"), t("settings.usage.requestsCol"), t("settings.usage.input"), t("settings.usage.output"), t("settings.usage.cacheCol")], true),
      ...(byDay.length === 0
        ? [tableRow([t("settings.usage.empty"), "", "", "", ""])]
        : byDay.map((row) => tableRow([
          typeof row?.day === "string" ? row.day : "?",
          String(Number.isFinite(row?.requests) ? row.requests : 0),
          fmtCompact(row?.prompt) ?? "0",
          fmtCompact(row?.completion) ?? "0",
          cacheHitPct(row) ?? "—",
        ]))),
    ] },
  ]
}
