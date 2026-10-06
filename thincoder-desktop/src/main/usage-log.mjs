/**
 * usage-log.mjs — Token 用量台账（归一化六键 · JSONL 月档 · 2026-10-06）。
 *
 * 职责（单源 · 零算法副本；**隔离形（禁令）= 策略面零 `electron` import** —— 先例 `heap-watch.mjs`，
 * 平 node 可 import 直测）：
 * ① 归一化 `normalizeUsage`：任意 provider usage → 统一五键（prompt = **含缓存**总输入 ∕ completion ∕
 *    reasoning ∕ cacheRead ∕ cacheWrite）—— 家族覆盖：
 *    - OpenAI 兼容族：`prompt_tokens`（**含** cached）∕ `prompt_tokens_details.cached_tokens` ∕ `cached_tokens`；
 *    - 智谱族：`prompt_cache_hit_tokens` ∕ `prompt_cache_miss_tokens`（hit+miss = prompt —— 核
 *      `provider/sse.mjs` 已把 OpenAI 形归到本族，hit 语义同 cacheRead）；
 *    - Anthropic 族：`input_tokens`（**不含**缓存）+ `cache_read_input_tokens` + `cache_creation_input_tokens`；
 *    缓存命中率口径 = cacheRead ∕ prompt（deepseek-harness `TurnUsagePanel` 同式 —— prompt 侧命中率）；
 *    miss 不落档 —— = prompt − cacheRead 纯推导（ZCode `model_usage` 同思路少一列）。
 * ② 台账 `appendUsageRecord`：`~/.thincoder/usage/usage-YYYY-MM.jsonl` 每请求一行（异步追加 ·
 *    **fail-soft** —— 台账任何失败只记日志，绝不影响对话链）。
 * ③ 读面聚合：`usageStats({ months })`（总数 ∕ 按天 ∕ 按模型）∥ `usageBySlot(cwd, months)`（会话行拼装 ——
 *    `sessions.mjs` 消费）。
 * ④ 保留 `pruneOldUsage`：月档保留 `KEEP_MONTHS = 6`，超期整文件删除（**日闩** —— 每日首写时点检查一次）。
 */
import { mkdirSync, readdirSync, readFileSync, statSync } from "node:fs"
import { appendFile, readFile, unlink } from "node:fs/promises"
import { join } from "node:path"
import { configDir } from "@thincoder/core/config.mjs"
import { logEvent } from "@thincoder/core/log.mjs"

/** 月档目录：`<configDir>/usage/`（configDir = `~/.thincoder` —— 核单源）。核 `configDir` 为 import 时
 *  常量（`_setConfigPathForTest` 只重定向核 `_configPath()`，不影响本面）——故自持覆写缝供直测。 */
let usageDirOverride = null
export const usageDir = () => usageDirOverride ?? join(configDir, "usage")

/** 测试缝：重定向月档目录（tmp 目录隔离直测；`null` 复位）。 */
export function _setUsageDirForTest(dir) {
  usageDirOverride = dir
}

/** 月档保留数（整文件粒度 —— 超期 `usage-YYYY-MM.jsonl` 删除）。 */
const KEEP_MONTHS = 6

/** 非负整数化（非数 ∕ 非有限 ∕ 负 ⇒ 0；小数取整 —— 计数字段恒整数）。 */
const num = (value) => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) return 0
  return Math.round(value)
}

/** 首个正值（归一化多家族字段取数 —— 前项 0 视同缺席，落后项）。 */
const firstPositive = (...values) => {
  for (const value of values) {
    const n = num(value)
    if (n > 0) return n
  }
  return 0
}

/**
 * 归一化：任意 provider usage → 统一五键。**纯函数 · 零抛**（不可归一 ⇒ `null` —— 调用方跳过该行）。
 * 语义锚点：`prompt` 恒为**含缓存**总输入 —— OpenAI ∕ 智谱族 `prompt_tokens` 原生即含；
 * Anthropic 族 `input_tokens` 不含缓存 ⇒ 补 + cacheRead + cacheWrite。
 */
export function normalizeUsage(raw) {
  if (raw === null || typeof raw !== "object") return null
  const completion = firstPositive(raw.completion_tokens, raw.output_tokens)
  const reasoning = firstPositive(raw.completion_tokens_details?.reasoning_tokens, raw.reasoning_tokens)
  let cacheRead = firstPositive(
    raw.prompt_cache_hit_tokens,
    raw.prompt_tokens_details?.cached_tokens,
    raw.cached_tokens,
    raw.cache_read_input_tokens,
  )
  let cacheWrite = firstPositive(raw.cache_creation_input_tokens)
  let prompt = firstPositive(raw.prompt_tokens)
  if (prompt === 0) {
    // Anthropic 形：input_tokens 不含缓存 —— 总输入 = 裸输入 + 缓存读 + 缓存写。
    prompt = firstPositive(raw.input_tokens) + cacheRead + cacheWrite
  }
  if (prompt === 0 && completion === 0) return null
  // 防御：异常服务端 cacheRead 超出 prompt ⇒ 钳到 prompt（命中率不越界）。
  if (cacheRead > prompt) {
    cacheWrite = 0
    cacheRead = prompt
  }
  return { prompt, completion, reasoning, cacheRead, cacheWrite }
}

/** 本地时区月键（`YYYY-MM` —— 月档文件名与归组单源）。 */
const monthKeyOf = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

/** 本地时区日键（`YYYY-MM-DD` —— byDay 分桶单源）。 */
const dayKeyOf = (date) => `${monthKeyOf(date)}-${String(date.getDate()).padStart(2, "0")}`

/** 月档路径（键 → 文件）。 */
const monthFile = (monthKey) => join(usageDir(), `usage-${monthKey}.jsonl`)

/** prune 日闩（进程内 —— 每日首写时点触发一次过期清档）。 */
let lastPruneDay = ""

/** 台账行追加（异步 · fail-soft）：**入参 = 桥面原始 `usage`**（`onUsage` 回调直通 —— 归一化在本面单源完成，
 *  不可归一 ⇒ `false` 跳行）；目录懒建 ∕ 单行 JSON ∕ 失败只记日志（绝不影响对话链）。零抛。 */
export function appendUsageRecord({ cwd = null, slot = null, provider = null, model = null, usage } = {}) {
  const row = normalizeUsage(usage)
  if (row === null) return false
  try {
    const now = new Date()
    const monthKey = monthKeyOf(now)
    const line = JSON.stringify({ v: 1, ts: now.toISOString(), cwd, slot, provider, model, ...row }) + "\n"
    mkdirSync(usageDir(), { recursive: true })
    appendFile(monthFile(monthKey), line, "utf8").catch((error) => {
      logEvent(`[usage-log] append failed: ${error?.message ?? error}`)
    }).finally(() => {
      monthCache.delete(monthKey) // 落盘后失效当月读缓存 —— sync 读面下次必重读
    })
    if (dayKeyOf(now) !== lastPruneDay) {
      lastPruneDay = dayKeyOf(now)
      pruneOldUsage().catch((error) => {
        logEvent(`[usage-log] prune failed: ${error?.message ?? error}`)
      })
    }
    return true
  } catch (error) {
    logEvent(`[usage-log] append failed: ${error?.message ?? error}`)
    return false
  }
}

/** 过期清档：列目录删 `KEEP_MONTHS` 外的 `usage-*.jsonl`（按月键字典序 —— 与时间序同构）。返回删除数。 */
export async function pruneOldUsage() {
  let names
  try {
    names = readdirSync(usageDir())
  } catch {
    return 0
  }
  const cutoff = (() => {
    const d = new Date()
    d.setMonth(d.getMonth() - KEEP_MONTHS)
    return monthKeyOf(d)
  })()
  let removed = 0
  for (const name of names) {
    const match = /^usage-(\d{4}-\d{2})\.jsonl$/.exec(name)
    if (match && match[1] < cutoff) {
      await unlink(join(usageDir(), name)).catch(() => {})
      removed += 1
    }
  }
  return removed
}

/** 近 N 月月键列表（含当月，升序）。 */
const recentMonths = (months) => {
  const list = []
  const d = new Date()
  for (let i = months - 1; i >= 0; i -= 1) {
    const t = new Date(d.getFullYear(), d.getMonth() - i, 1)
    list.push(monthKeyOf(t))
  }
  return list
}

/** 读月档记录（缺文件 ⇒ 空数组；坏行跳过 —— 台账读取零抛）。 */
async function readMonth(monthKey) {
  let text
  try {
    text = await readFile(monthFile(monthKey), "utf8")
  } catch {
    return []
  }
  return parseMonthLines(text)
}

/** 空桶（聚合累加器 —— 五键 + 请求数）。 */
const emptyBucket = () => ({ requests: 0, prompt: 0, completion: 0, reasoning: 0, cacheRead: 0, cacheWrite: 0 })

/** 桶累加（原地）。 */
const addInto = (bucket, rec) => {
  bucket.requests += 1
  bucket.prompt += num(rec.prompt)
  bucket.completion += num(rec.completion)
  bucket.reasoning += num(rec.reasoning)
  bucket.cacheRead += num(rec.cacheRead)
  bucket.cacheWrite += num(rec.cacheWrite)
  return bucket
}

/** 五键求和压缩（丢弃 requests —— 展示层 recompose）。 */
const sumTokens = (bucket) => ({
  prompt: bucket.prompt,
  completion: bucket.completion,
  reasoning: bucket.reasoning,
  cacheRead: bucket.cacheRead,
  cacheWrite: bucket.cacheWrite,
})

/** 缓存命中率（prompt 侧 —— cacheRead ∕ prompt；prompt 0 ⇒ `null` = 不显示）。 */
export const cacheHitPctOf = (bucket) => {
  if (typeof bucket !== "object" || bucket === null) return null
  const prompt = num(bucket.prompt)
  const cacheRead = num(bucket.cacheRead)
  if (prompt <= 0 || cacheRead <= 0) return null
  return Math.round((cacheRead / prompt) * 1000) / 10
}

/**
 * 全局用量统计读面：`{ months }` → `{ ok, generatedAt, total, byDay, byModel }`。
 * - `total` = 五键 + requests（窗口内全部）；
 * - `byDay` = 本地时区按天分桶升序，桶附 `models`（日 × 模型 token 面零假造：模型缺省行归 `"?"`）；
 * - `byModel` = 按模型汇总降序（requests ∕ 五键 ∕ lastTs）。
 */
export async function usageStats({ months = 3 } = {}) {
  const window = Math.min(Math.max(Number(months) || 3, 1), KEEP_MONTHS)
  const records = []
  for (const monthKey of recentMonths(window)) records.push(...(await readMonth(monthKey)))
  const total = emptyBucket()
  const byDay = new Map()
  const byModel = new Map()
  for (const rec of records) {
    addInto(total, rec)
    const day = dayKeyOf(new Date(typeof rec.ts === "string" ? Date.parse(rec.ts) : Date.now()))
    addInto(byDay.get(day) ?? byDay.set(day, emptyBucket()).get(day), rec)
    const model = typeof rec.model === "string" && rec.model !== "" ? rec.model : "?"
    const mBucket = byModel.get(model) ?? byModel.set(model, { ...emptyBucket(), lastTs: null }).get(model)
    addInto(mBucket, rec)
    if (typeof rec.ts === "string" && (mBucket.lastTs === null || rec.ts > mBucket.lastTs)) mBucket.lastTs = rec.ts
  }
  const days = [...byDay.entries()].sort(([a], [b]) => (a < b ? -1 : 1))
  const models = [...byModel.entries()].sort(([, x], [, y]) => y.requests - x.requests)
  return {
    ok: true,
    generatedAt: new Date().toISOString(),
    total: sumTokens(total),
    requests: total.requests,
    byDay: days.map(([day, bucket]) => ({ day, ...sumTokens(bucket), requests: bucket.requests })),
    byModel: models.map(([model, bucket]) => ({ model, ...sumTokens(bucket), requests: bucket.requests, lastTs: bucket.lastTs })),
  }
}

/** 月档读缓存（`usageBySlotSync` 专用 —— sessions:list 每刷新全读两月文件太频；键 = 月键，
 *  值 = `{ mtimeMs, records }`；mtime 变 ⇒ 重读。append 落盘后由写面失效当月键。） */
const monthCache = new Map()

/** 月档行解析（async ∕ sync 两读面共用单源 —— 坏行跳过不抛）。 */
const parseMonthLines = (text) => {
  const records = []
  for (const line of text.split("\n")) {
    if (line === "") continue
    try {
      const rec = JSON.parse(line)
      if (rec !== null && typeof rec === "object") records.push(rec)
    } catch {
      // 坏行（断电截断等）—— 跳过不中断聚合。
    }
  }
  return records
}

/**
 * 会话用量读面 · **同步形**（`sessions:list` 行拼装 —— 2026-10-06；listSessions 本身同步，异步面会牵动
 * 调用链签名 ⇒ 本面走 readFileSync + mtime 缓存）：`{ cwd, months = 2 }` → `Map(slot → 桶)`。
 * cwd 严格等值比对（斜杠方向不一致即不同 cwd —— 与槽 manifest 哈希同坑，调用方传主进程当前 cwd 原串）。
 */
export function usageBySlotSync({ cwd, months = 2 } = {}) {
  const map = new Map()
  if (typeof cwd !== "string" || cwd === "") return map
  const window = Math.min(Math.max(Number(months) || 2, 1), KEEP_MONTHS)
  for (const monthKey of recentMonths(window)) {
    let records
    const file = monthFile(monthKey)
    let mtimeMs = 0
    try {
      mtimeMs = statSync(file).mtimeMs
    } catch {
      monthCache.delete(monthKey)
      continue
    }
    const hit = monthCache.get(monthKey)
    if (hit && hit.mtimeMs === mtimeMs) {
      records = hit.records
    } else {
      try {
        records = parseMonthLines(readFileSync(file, "utf8"))
      } catch {
        records = []
      }
      monthCache.set(monthKey, { mtimeMs, records })
    }
    for (const rec of records) {
      if (rec.cwd !== cwd || typeof rec.slot !== "string" || rec.slot === "") continue
      const bucket = map.get(rec.slot) ?? map.set(rec.slot, emptyBucket()).get(rec.slot)
      addInto(bucket, rec)
    }
  }
  return map
}

/**
 * 会话用量读面（`sessions:list` 行拼装 —— 2026-10-06）：`{ cwd, months = 2 }` →
 * `Map(slot → 五键 + requests)`（仅本项目的槽键；跨项目零假造 —— cwd 严格等值比对，与槽 manifest
 * 哈希同坑规避：斜杠方向不一致即不同 cwd，调用方传主进程当前 cwd 原串）。
 */
export async function usageBySlot({ cwd, months = 2 } = {}) {
  const map = new Map()
  if (typeof cwd !== "string" || cwd === "") return map
  const window = Math.min(Math.max(Number(months) || 2, 1), KEEP_MONTHS)
  for (const monthKey of recentMonths(window)) {
    for (const rec of await readMonth(monthKey)) {
      if (rec.cwd !== cwd || typeof rec.slot !== "string" || rec.slot === "") continue
      const bucket = map.get(rec.slot) ?? map.set(rec.slot, emptyBucket()).get(rec.slot)
      addInto(bucket, rec)
    }
  }
  return map
}
