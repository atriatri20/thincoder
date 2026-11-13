import { listKnowledgeTopics, loadKnowledgeTopic } from "../prompt-files.mjs"
import { DESC } from "./shared.mjs"

const SEARCH_SNIPPET_CHARS = 240
const SEARCH_SNIPPETS_PER_TOPIC = 3

function topicSnippets(id, title, content, query) {
  const needle = query.toLowerCase()
  const matches = []
  const haystack = content.toLowerCase()
  let from = 0
  while (matches.length < SEARCH_SNIPPETS_PER_TOPIC) {
    const at = haystack.indexOf(needle, from)
    if (at < 0) break
    const start = Math.max(0, at - Math.floor(SEARCH_SNIPPET_CHARS / 2))
    const end = Math.min(content.length, at + query.length + Math.floor(SEARCH_SNIPPET_CHARS / 2))
    matches.push(content.slice(start, end))
    from = at + query.length
  }
  if (matches.length || id.includes(needle) || title.toLowerCase().includes(needle)) {
    return { id, title, matches }
  }
  return null
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
      const results = listKnowledgeTopics().flatMap(({ id, title }) => {
        const hit = topicSnippets(id, title, loadKnowledgeTopic(id), query)
        return hit ? [hit] : []
      })
      if (results.length === 0) return `No knowledge topics matched ${JSON.stringify(query)}.`
      return JSON.stringify(results, null, 2)
    }
    throw new Error(`knowledge: action must be one of list/search/get — got ${JSON.stringify(action)}`)
  },
}
