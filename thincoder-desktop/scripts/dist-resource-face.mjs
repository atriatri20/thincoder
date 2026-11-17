/** dist 知识资源比对共用件：递归收集 Markdown 相对路径与内容摘要。 */
import { createHash } from "node:crypto"
import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"

export const RESOURCE_DIRS = Object.freeze(["prompts", "tool-docs", "knowledge"])
export const RESOURCE_EXPECT = Object.freeze({ prompts: 17, "tool-docs": 69 })

/** 返回相对路径到 sha256 的映射；子目录与根文件使用同一集合口径。 */
export function repoMarkdownFace(coreRoot, dir) {
  const out = new Map()
  const walk = (rel = "") => {
    for (const entry of readdirSync(join(coreRoot, dir, rel), { withFileTypes: true })) {
      const child = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) walk(child)
      else if (entry.isFile() && entry.name.endsWith(".md")) {
        out.set(child, createHash("sha256").update(readFileSync(join(coreRoot, dir, child))).digest("hex"))
      }
    }
  }
  walk()
  return out
}

/** prompts 的固定档数只算根档；其余目录按递归全集，不为知识资源写易漂移的总数。 */
export function resourceCount(dir, face) {
  const keys = [...face.keys()]
  return dir === "prompts" ? keys.filter((name) => !name.includes("/")).length : keys.length
}
