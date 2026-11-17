/**
 * declared-repos.mjs — **声明出边图 + 环走查**（叶档：只 import `node:*` 与 `manifest.mjs` / `declaration.mjs`）。
 *
 * 判据单源 = `docs/core/design/PATH-RESOLUTION.md` §2.7「声明仓引用」与「环检」两段（本档只实现，不重述口径）。
 * 两件事：
 *  · `declaredOutEdges(root)` = 本仓的**出边**（`index.publicRepos` 各项）——根集单源 = `declaration.mjs` 的
 *    `declaredPublicRoots`，本档只补它不出的三件：**目录名**（首段匹配用）· **声明项原文**（报面用）· **本机在盘与否**。
 *    同一份声明表逐项对位，不重建第二张表。
 *  · `declaredCycles(root)` = 沿出边 DFS 的回边走查：只报**穿过起点**的环（每个仓的门报自己的环，不为别人的环背红）。
 *    无 `PROJECT-MANIFEST.json` 的目录是**叶仓**——没有出边（规则 = `docs/core/design/PATH-RESOLUTION.md` §2.7「叶仓」）。
 *    走查撞到**声明根不在本机**的节点 ⇒ 该节点止步，并记入 `stopped`——「没找到环」与「没看过去」因此在报面上分得开。
 *
 * 不缓存（§2.7 边界：同一份声明表逐项现读——`loadProjectDeclaration` 自带按档路径的同轮缓存，那是读取面相而非本档）。
 */
import { statSync } from "node:fs"
import { basename, join, resolve } from "node:path"

import { declaredPublicRoots, loadProjectDeclaration } from "./declaration.mjs"
import { MANIFEST_REL } from "./manifest.mjs"

/** 路径同一性（`win32` 大小写不敏感——同 `path-resolve.mjs` 的基根去重口径）。 */
const pathKey = (p) => (process.platform === "win32" ? p.toLowerCase() : p)

const isDir = (p) => { try { return statSync(p).isDirectory() } catch { return false } }
const isFile = (p) => { try { return statSync(p).isFile() } catch { return false } }

/**
 * 本仓的声明出边（声明序；同名多仓各自一条，调用面取首者）。
 * @param {string} [root] 会话锚 / 项目根（项目根经 `manifest.mjs` 解析——深 cwd 等义）
 * @returns {{root:string, name:string, entry:string, onDisk:boolean, hasManifest:boolean}[]}
 *   `root` = 声明根绝对路径 · `name` = 其目录名（首段匹配用）· `entry` = `index.publicRepos` 里的声明项原文 ·
 *   `onDisk` = 该根在本机是否是目录 · `hasManifest` = 其下是否有 `PROJECT-MANIFEST.json`（决定它有没有出边）
 */
export function declaredOutEdges(root) {
  const start = resolve(root ?? ".")
  const roots = declaredPublicRoots(start)
  if (roots.length === 0) return []
  let decl = null
  try { decl = loadProjectDeclaration(start) } catch { decl = null }
  const list = Array.isArray(decl?.index?.publicRepos) ? decl.index.publicRepos : []
  const base = typeof decl?.root === "string" && decl.root !== "" ? decl.root : start
  const entryOf = new Map() // 声明根绝对路径 → 声明项原文（同一根重复声明 ⇒ 取首个）
  for (const p of list) {
    const abs = resolve(base, p)
    if (!entryOf.has(pathKey(abs))) entryOf.set(pathKey(abs), p)
  }
  return roots.map((abs) => ({
    root: abs,
    name: basename(abs),
    entry: entryOf.get(pathKey(abs)) ?? "",
    onDisk: isDir(abs),
    hasManifest: isFile(join(abs, MANIFEST_REL)),
  }))
}

/**
 * 环走查（从被判根出发，只报穿过它的环）。
 * 终止性由 `expanded` 集保证（路径同一性；`win32` 大小写不敏感）⇒ 不设深度帽。
 * @param {string} root 被判档的组根（环的起点——节点 = 仓根绝对路径）
 * @returns {{cycles:{names:string[]}[], stopped:{root:string, name:string, entry:string}[]}}
 *   `cycles` = 每条环的链（目录名全写：起点 → … → 起点）· `stopped` = 走查在「声明根不在本机」处止步的节点
 *   （报面按声明根各出一行 `未核`；去重按路径同一性）
 */
export function declaredCycles(root) {
  const start = resolve(root ?? ".")
  const startKey = pathKey(start)
  const cycles = []
  const stopped = []
  const seenCycle = new Set()
  const seenStop = new Set()
  const expanded = new Set([startKey])
  const visit = (node, names) => {
    for (const edge of declaredOutEdges(node)) {
      if (!edge.onDisk) { // 读不到对方 manifest ⇒ 该节点止步（记入列报，不静默）
        const key = pathKey(edge.root)
        if (!seenStop.has(key)) { seenStop.add(key); stopped.push({ root: edge.root, name: edge.name, entry: edge.entry }) }
        continue
      }
      const key = pathKey(edge.root)
      if (key === startKey) { // 走回起点 ⇒ 一条环（链按目录名写全）
        const chain = [...names, basename(start)]
        const id = chain.map(pathKey).join("\u0000")
        if (!seenCycle.has(id)) { seenCycle.add(id); cycles.push({ names: chain }) }
        continue
      }
      if (!edge.hasManifest) continue // 叶仓：没有出边
      if (expanded.has(key)) continue
      expanded.add(key)
      visit(edge.root, [...names, edge.name])
    }
  }
  visit(start, [basename(start)])
  return { cycles, stopped }
}