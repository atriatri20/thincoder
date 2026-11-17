/**
 * agent/batch-attribution.mjs — 归属表：记录 / 查询 / 合入三个纯函数（本档零 fs、零 import）。
 *
 * 承载的东西 = 档位臂取材面的**判据一**（语义单源 = `docs/core/design/BATCH-RECORD.md` §4.18.1）：
 * 写的那一刻「这笔写服务哪一批」已知（`agent._batchDoc`——子代理由 spawn 绑定，见 `subagent-spawn.mjs`），
 * 记账时把它连同路径一起写下；收口取「归属含本档」的那些路径。
 *
 * 为什么不加进 `agent._touchedFiles`：那个数组的读者有 `recent_changes`、`verify`、子代理调度、审计块四处，
 * 改它的形状要同轮改四处；而归属只是多一列事实，于是另记一张表、`_touchedFiles` 的形状一字不动。
 *
 * 键 = 批档绝对路径（收口比对的正是批档本身；号→档还要多一次映射，而一笔写只知道它服务的批）。
 * 值 = 该批改过的绝对路径集。
 *
 * 路径只做**存放**，不在这里归一：比较口径（win32 折小写、分隔符归一）归收口面那一次比对，本档不持第二把尺。
 */

/** 表的取法：`agent._batchAttribution` 是 Map 就用它，否则当场建一张（首笔记账与后续读取同一形）。 */
function tableOf(agent) {
  if (!agent || typeof agent !== "object") return null
  if (agent._batchAttribution instanceof Map) return agent._batchAttribution
  const table = new Map()
  agent._batchAttribution = table
  return table
}

/** 批档键（只有非空串才算一个批；`null` ∥ 空串 = 这笔写没有绑定批档）。 */
const batchKeyOf = (batchDoc) => (typeof batchDoc === "string" && batchDoc.trim() !== "" ? batchDoc.trim() : null)

/**
 * 记账：把 `paths` 记到 `batchDoc` 名下（一档一批一条，重复记账幂等）。
 * 没有绑定批档的写**不入表**——收口面对没有归属的路径按本批判（fail-closed），这里不替它猜一个批。
 * @param {object} agent — 记账的载体（`agent._batchAttribution` 挂在它上面）
 * @param {string[]} paths — 这笔写落下的绝对路径
 * @param {string|null} batchDoc — 这笔写服务的批档（`agent._batchDoc`）
 * @returns {boolean} 真有新路径入表 ⇒ `true`
 */
export function recordAttribution(agent, paths, batchDoc) {
  const batch = batchKeyOf(batchDoc)
  if (batch === null) return false
  const list = Array.isArray(paths) ? paths : []
  if (list.length === 0) return false
  const table = tableOf(agent)
  if (!table) return false
  let set = table.get(batch)
  if (!(set instanceof Set)) {
    set = new Set()
    table.set(batch, set)
  }
  let added = false
  for (const p of list) {
    if (typeof p !== "string" || p === "" || set.has(p)) continue
    set.add(p)
    added = true
  }
  return added
}

/**
 * 查询：`batchDoc` 这一批的路径集（**副本**——调用方排序 ∥ 过滤都不改表本体）。
 * @param {object} agent — 载体
 * @param {string} batchDoc — 批档（绝对路径）
 * @returns {string[]} 该批的路径（无记录 ⇒ 空集，不是 `null`：空集与「这一批一笔没记」同判）
 */
export function attributedTo(agent, batchDoc) {
  const batch = batchKeyOf(batchDoc)
  const table = agent?._batchAttribution
  if (batch === null || !(table instanceof Map)) return []
  const set = table.get(batch)
  return set instanceof Set ? [...set] : []
}

/**
 * 合入：子代理的归属表并回父侧（并集；子代理记在它自己的 `agent` 上，父侧不靠路径再猜）。
 * @param {object} parent — 父侧载体（并进去的一方）
 * @param {object} child — 子代理载体（被并的一方；没有表 ⇒ 什么都不做）
 * @returns {boolean} 真并入了新路径 ⇒ `true`
 */
export function mergeAttribution(parent, child) {
  const src = child?._batchAttribution
  if (!(src instanceof Map) || src.size === 0) return false
  let merged = false
  for (const [batch, paths] of src) {
    const list = paths instanceof Set ? [...paths] : []
    if (recordAttribution(parent, list, batch)) merged = true
  }
  return merged
}
