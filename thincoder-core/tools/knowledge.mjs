import { listKnowledgeTopics, loadKnowledgeTopic, readKnowledgeEntries } from "../prompt-files.mjs"
import { DESC } from "./shared.mjs"

const SEARCH_SNIPPETS_PER_TOPIC = 3
/** 单主题定位片段的字长上限（导出给用例判同一组数）。 */
export const SEARCH_SNIPPET_CHARS = 240
/** 单次 search 的成本门：主题数与紧凑 JSON 字符数，先到者截断（导出给集成用例判同一组上限）。 */
export const SEARCH_MAX_TOPICS = 10
export const SEARCH_MAX_CHARS = 6000

/**
 * 高频虚词：分词、转小写、去重之后、计分之前去掉，大小写不敏感。
 * 它治的是排序噪声而不是体积（体积已由两个上限兜住）——`the` 命中几乎全部主题，会把 `evidence`
 * 这种真信号顶出有界结果。中文不另做分词：按空白切，中文整句本就是一个词，虚词过滤对它无效，
 * 中文查询靠主题首行的 `aliases:` 别名命中。
 */
const SEARCH_STOPWORDS = new Set([
  // 英文约二十个
  "the", "a", "an", "of", "to", "in", "on", "at", "is", "are", "was", "were", "be", "been",
  "for", "and", "or", "not", "with", "by", "from", "this", "that", "it", "as",
  // 中文约二十个
  "的", "了", "在", "是", "和", "与", "或", "就", "也", "都", "而", "及", "其", "之", "于", "对", "从", "把", "被", "让",
])

/**
 * 查询 → 参与计分的词。按空白切、转小写、去重、去停用词，最后排序（查询词序因而影响不了
 * 片段集合与名次）。过滤后一个词都不剩 ⇒ 显式失败并点名 `query`：全虚词查询（`the`、`a of the`）
 * 走的就是这一支，不退化成一句「没有匹配」——两者在模型看来长得一模一样。
 */
function tokenizeQuery(query) {
  const tokens = [...new Set(query.toLowerCase().split(/\s+/).filter(Boolean))]
  const meaningful = tokens.filter((token) => !SEARCH_STOPWORDS.has(token)).sort()
  if (meaningful.length === 0) {
    throw new Error("knowledge search: query has no searchable word after stopword filtering — replace it with a concrete noun, or call list for every topic id")
  }
  return meaningful
}

/**
 * 按一个主题条目计分。检索面 = 标识 ∥ 标题 ∥ 别名 ∥ 正文，任一词命中即入选（OR）。
 * 标题级命中数 = 命中的**不同词数**（标识、标题、别名都算标题级：别名就是为引路而写的，命中它与
 * 命中标题是同一个信号）；总命中数 = 各词在正文里的出现次数之和（标题就在正文里，只数一次）。
 * 同一主题内多个词命中同一段时只取一次，不重复计入字符预算；一段至多 `SEARCH_SNIPPET_CHARS` 字符。
 * 两键都为 0 返回 null（只命中别名的主题也入选——中文查询走的就是那一支）。
 * 命中偏移在小写串上算、从原串上切：两者只在「小写不改变长度」的字符上对齐（盘上主题是 ASCII 与中文）。
 * 不做 Unicode 归一，所以会改变长度的字符（如 `İ`）会让片段错位——今日盘面无此类字符。
 */
function scoreTopic(entry, tokens) {
  const titleSurface = [entry.id, entry.title, ...entry.aliases].join("\n").toLowerCase()
  const body = entry.content.toLowerCase()
  const matches = []
  const spans = []
  let titleHits = 0
  let totalHits = 0
  for (const token of tokens) {
    let bodyHits = 0
    for (let at = body.indexOf(token); at >= 0; at = body.indexOf(token, at + token.length)) {
      bodyHits += 1
      if (matches.length >= SEARCH_SNIPPETS_PER_TOPIC) continue
      // 先钉住词的结尾，再往前留至多一段——长词也整词落在片段里，且片段长度不越 SEARCH_SNIPPET_CHARS
      const end = Math.min(entry.content.length, at + token.length + Math.floor(SEARCH_SNIPPET_CHARS / 2))
      const start = Math.max(0, end - SEARCH_SNIPPET_CHARS)
      if (spans.some(([from, to]) => start < to && from < end)) continue
      spans.push([start, end])
      matches.push(entry.content.slice(start, end))
    }
    totalHits += bodyHits
    if (titleSurface.includes(token)) titleHits += 1
  }
  if (titleHits === 0 && totalHits === 0) return null
  return { id: entry.id, title: entry.title, matches, titleHits, totalHits }
}

/**
 * 定序并按两个上限收集：标题级命中数 → 总命中数 → 标识升序；下一个主题会越过主题数或字符数
 * 任一上限时不再加入。字符数按整份返回的紧凑 JSON 计量（含外层字段），且用**此刻就要交付的那个**
 * `truncated` 值计量：`true` 比 `false` 少一个字符，用错一侧就会让实际交付比计量值多一个字符、真的
 * 越过上限。截断如实披露（`matched` / `shown` / `truncated`）：只给 10 条而无一字说明，会被读成
 * 「只有 10 条命中」，上限就从成本门变成了相关性判断。
 */
function boundedHits(hits) {
  const matched = hits.length
  const ordered = [...hits].sort((a, b) => b.titleHits - a.titleHits || b.totalHits - a.totalHits || a.id.localeCompare(b.id))
  const results = []
  for (const hit of ordered) {
    if (results.length >= SEARCH_MAX_TOPICS) break
    const candidate = { id: hit.id, title: hit.title, matches: hit.matches }
    // 加完这一条后是否还有命中被落下，就是交付时的 truncated 值——按它计量才与实际返回同长
    const truncated = results.length + 1 < matched
    const size = JSON.stringify({ matched, shown: results.length + 1, truncated, results: [...results, candidate] }).length
    if (size > SEARCH_MAX_CHARS) break
    results.push(candidate)
  }
  return { matched, shown: results.length, truncated: results.length < matched, results }
}

export const knowledgeTool = {
  name: "knowledge",
  description: DESC("knowledge"),
  parameters: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["list", "search", "get"], description: "list topic ids and titles; search only locates topics; get reads one complete topic" },
      query: { type: "string", description: "search keyword" },
      topic: { type: "string", description: "exact topic identifier for get" },
    },
    required: ["action"],
  },
  readonly: true,
  async execute(args) {
    const action = args?.action
    if (action === "list") {
      return listKnowledgeTopics().map(({ id, title }) => `${id} — ${title}`).join("\n")
    }
    if (action === "get") {
      if (typeof args.topic !== "string" || !args.topic.trim()) throw new Error("knowledge get: topic is required")
      return loadKnowledgeTopic(args.topic)
    }
    if (action === "search") {
      if (typeof args.query !== "string" || !args.query.trim()) throw new Error("knowledge search: query is required")
      const query = args.query.trim()
      const tokens = tokenizeQuery(query)
      const hits = readKnowledgeEntries().map((entry) => scoreTopic(entry, tokens)).filter(Boolean)
      if (hits.length === 0) {
        return `No knowledge topics matched ${JSON.stringify(query)}. Try one English keyword, or call list to see every topic id.`
      }
      return JSON.stringify(boundedHits(hits))
    }
    throw new Error(`knowledge: action must be one of list/search/get — got ${JSON.stringify(action)}`)
  },
}
