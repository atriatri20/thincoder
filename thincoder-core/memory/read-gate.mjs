/**
 * memory/read-gate.mjs — 读面准入闸（§6.14 面①∪面⑥∪面⑦；2026-10-19 批 K · 台账 #1372 抽件）。
 *
 * 判据单源：`memory/docs.mjs` ∥ `memory/code-search.mjs` 原先各持一份**逐字相同**的 `rowHidden`
 * （排除谓词 ∪ 声明范围门）——两份判据迟早会不一致，而它们判的是同一件事：这行要不要藏。
 *
 * 判据序 = `isExcludedRelPath(path, decl, origin)` ∪ `!isInDeclaredScope(path, scope, origin)`。
 * 两缓存（项目声明 ∥ 声明索引范围）为工厂闭包私有 Map，逐 origin 预载一次；
 * 实例粒度 = 每次检索调用建一次 ⇒ 与抽出前的函数作用域缓存同寿命，行为零变。
 */
import { loadProjectDeclaration, isExcludedRelPath, declaredIndexScope, isInDeclaredScope } from "../conventions.mjs"

/** 建一个读面准入闸：返回 `{ rowHidden(origin, path) → boolean }`（true = 该行不进结果集）。 */
export function createReadGate() {
  const declCache = new Map() // origin → 项目声明（`loadProjectDeclaration` 回执）
  const scopeCache = new Map() // origin → 声明索引范围（`declaredIndexScope` 回执）
  const rowHidden = (origin, path) => {
    const d = declCache.get(origin) ?? loadProjectDeclaration(origin)
    declCache.set(origin, d)
    if (isExcludedRelPath(path, d, origin)) return true
    let scope = scopeCache.get(origin)
    if (scope === undefined) { scope = declaredIndexScope(origin); scopeCache.set(origin, scope) }
    return !isInDeclaredScope(path, scope, origin)
  }
  return { rowHidden }
}
