/**
 * settings-sections-usage.mjs — 设置面「用量」段体（Token 用量统计批 · 2026-10-06 · 自立出档 ——
 * 段体先例 = `settings-sections-env.mjs`「先拆后改」同律；本档 re-export 住 `settings-sections.mjs`）。
 *
 * 面形（档位二 · 参考 ZCode AppUsagePanel 摘要 + deepseek-harness `TurnUsagePanel` 命中率口径）：
 *  ① 摘要四卡（今日 ∕ 近 7 天 ∕ 近 30 天 ∕ 全部〔3 个月台账窗〕）—— 卡 = 标签 + ↑输入 ↓输出 +
 *     副行（缓存命中率 · 请求次数）；命中率 = cacheRead ∕ prompt（prompt 侧 —— 与状态行 hit/(hit+miss)
 *     同值同构，归一层 miss = prompt − cacheRead 纯推导）；零缓存读数 ⇒ 「无缓存」词（不假造 0%）。
 *  ② 按模型表 —— 模型 ∕ 请求 ∕ ↑ ∕ ↓ ∕ 缓存%（requests 降序，与 `usage:stats` 回执同序）。
 *  ③ 按天表（近 14 个有数日，最新在前）—— 日期 ∕ 请求 ∕ ↑ ∕ ↓ ∕ 缓存%。
 * 三态：`none` ∕ `loading` ⇒ 段态词承载（分派面 `sectionStateNode`，本档零节点）；`ready` ⇒ 上述面。
 * 纪律：零 DOM（描述符树）；文案一律经 `t()`；`handlers.onRefreshUsage` 缺 ⇒ 刷新钮 `disabled`
 * （诚实非死控）；零 `node:` ∕ 零裸包。数字紧凑显示自持（`fmtCompact` —— `session-control.mjs` ∕
 * `mount-sidebar.mjs` 同形第三份：跨档私有函数不可导入，零第二判据成本，仅显示形）。
 */
import { t } from "../i18n.mjs"
import { wire } from "./chat-tool.mjs"

/** 列表切片：缺 ∕ 非数组 ⇒ 空表（零节点 —— 禁假数据）。 */
const listOf = (value) => (Array.isArray(value) ? value : [])

/** 令牌紧凑显示（1234 ⇒ 1.2k ∕ 3400000 ⇒ 3.4M；0 ∕ 非数 ⇒ null —— 卡面零假造）。 */
function fmtCompact(n) {
  if (!Number.isFinite(n) || n <= 0) return null
  if (n >= 1e6) return `${Math.round(n / 1e5) / 10}M`
  if (n >= 1e3) return `${Math.round(n / 100) / 10}k`
  return String(n)
}

/** 缓存命中率显示（prompt 侧 —— cacheRead ∕ prompt；prompt ∕ cacheRead 零 ∕ 非数 ⇒ null）。 */
function cacheHitPct(bucket) {
  const prompt = bucket?.prompt
  const cacheRead = bucket?.cacheRead
  if (!Number.isFinite(prompt) || prompt <= 0 || !Number.isFinite(cacheRead) || cacheRead <= 0) return null
  return `${Math.round((cacheRead / prompt) * 1000) / 10}%`
}

/** 本地时区日键（窗口聚合对比单源 —— 主进程 `usage-log.mjs` `dayKeyOf` 同式独立实现）。 */
const dayKeyOf = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

/** 窗口聚合（`byDay` 升序行 → 桶求和）：`days = null` ⇒ 全量（total 已聚合，本面零重算走 total）。 */
function sumWindow(byDay, days) {
  if (days === null) return null
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - (days - 1))
  const key = dayKeyOf(cutoff)
  const sum = { prompt: 0, completion: 0, reasoning: 0, cacheRead: 0, requests: 0 }
  for (const row of byDay) {
    if (typeof row?.day !== "string" || row.day < key) continue
    sum.prompt += Number.isFinite(row.prompt) ? row.prompt : 0
    sum.completion += Number.isFinite(row.completion) ? row.completion : 0
    sum.reasoning += Number.isFinite(row.reasoning) ? row.reasoning : 0
    sum.cacheRead += Number.isFinite(row.cacheRead) ? row.cacheRead : 0
    sum.requests += Number.isFinite(row.requests) ? row.requests : 0
  }
  return sum
}

/** 单卡节点（标签 + ↑↓ 主行 + 缓存%·请求数副行）。 */
function summaryCard(label, bucket, requests) {
  const hit = cacheHitPct(bucket)
  return {
    tag: "div",
    props: { class: "usage-card", "data-usage-card": "" },
    children: [
      { tag: "div", props: { class: "usage-card-label" }, children: [label] },
      { tag: "div", props: { class: "usage-card-tokens" }, children: [
        t("rail.session.usage", { input: fmtCompact(bucket?.prompt) ?? "0", output: fmtCompact(bucket?.completion) ?? "0" }),
      ] },
      { tag: "div", props: { class: "usage-card-sub" }, children: [
        hit === null ? t("settings.usage.noCache") : t("settings.usage.cacheHit", { pct: hit }),
        ` · `,
        t("settings.usage.requests", { n: Number.isFinite(requests) ? requests : 0 }),
      ] },
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

/** 摘要四卡行。 */
function summaryCards(stats) {
  const byDay = listOf(stats?.byDay)
  const total = stats?.total ?? {}
  return {
    tag: "div",
    props: { class: "usage-cards" },
    children: [
      summaryCard(t("settings.usage.today"), sumWindow(byDay, 1), sumWindow(byDay, 1)?.requests),
      summaryCard(t("settings.usage.days7"), sumWindow(byDay, 7), sumWindow(byDay, 7)?.requests),
      summaryCard(t("settings.usage.days30"), sumWindow(byDay, 30), sumWindow(byDay, 30)?.requests),
      summaryCard(t("settings.usage.all"), total, stats?.requests),
    ],
  }
}

/**
 * 「用量」段体：`model` = `settings.usage` 切片（`{ state, stats }`）· `handlers.onRefreshUsage` = 刷新出口。
 * `ready` 才落行（分派面同 `env` ∕ `models` 判 —— 本档零段态门重抄）。
 */
export function usageBody(section, handlers = {}) {
  const stats = section?.stats ?? null
  const byModel = listOf(stats?.byModel)
  const byDay = listOf(stats?.byDay).slice(-14).reverse() // 近 14 个有数日，最新在前
  const onRefresh = typeof handlers?.onRefreshUsage === "function" ? () => handlers.onRefreshUsage() : undefined
  return [
    {
      tag: "div",
      props: { class: "settings-field-row", "data-usage-meta": "" },
      children: [
        { tag: "span", props: { class: "settings-row-value" }, children: [t("settings.usage.window")] },
        {
          tag: "button",
          props: wire({ class: "settings-row-action", type: "button", "data-action": "settings:refreshUsage" }, onRefresh),
          children: [t("settings.usage.refresh")],
        },
      ],
    },
    summaryCards(stats),
    // ── 按模型 ──
    { tag: "div", props: { class: "settings-field-label", "data-subtitle": "by-model" }, children: [t("settings.usage.byModel")] },
    { tag: "div", props: { class: "usage-table", "data-usage-models": "" }, children: [
      tableRow([t("settings.usage.model"), t("settings.usage.requestsCol"), "↑", "↓", t("settings.usage.cacheCol")], true),
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
      tableRow([t("settings.usage.day"), t("settings.usage.requestsCol"), "↑", "↓", t("settings.usage.cacheCol")], true),
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
