/**
 * session-archive.mjs — 会话归档（fork 轻量本地批 · 2026-10-06 —— ZCode 归档语义的极简移植）。
 * 归档 = **软删除**：manifest 顶层 `archived` map（`{ [slot]: archivedAtMs }`）标记，**槽文件零改动**
 * （不像 autoApprove 等开关走 `writeFlag` 整文件重写——归档是纯元数据，寄生槽文件反被 `saveSlotData`
 * 的 `slotDigest` 重写覆盖丢失 ∕ 且 `listSlots` 快路径（digest 新鲜即不读盘）读不到 ⇒ 独立顶层 map 最省）。
 * 可见性：`listSlots`（默认列表 ∕ catalog ∕ 末项门）**过滤归档槽** ⇒ 归档即从一切常规读面消失；
 * `listArchivedSlots` 专供归档视图（取消归档 ∕ 删除的数据源）。
 * 写面复用 `saveManifest` 条目级合并（`merged = {...fresh}` 起底 + `merged.archived = {...fresh, ...m}`
 * 增项 + `deletions.archived` 删项）——与 slots ∕ slotSessions 同族，多进程丢失更新窗口同律收窄。
 * 零端参 ∕ 零 marker（端无关，沿 renameSlot re-export 形）；返回 `{ ok, reason? }`（invalid-slot ∕
 * slot-missing ∕ already ∕ not-archived 四值闭集——失败可见，沿 §6.12 标题写契约同族）。
 */
import { loadManifest, saveManifest } from "./session-slots-manifest.mjs"
import { existsSync } from "node:fs"
import { slotPath } from "./session-slots.mjs"

/** 槽存在判据（归档 ∕ 取消归档准入）：manifest 有条目 ∨ 盘上有文件（§6.22 判据句 4 同律——盘上独有槽可操作）。 */
function slotExists(m, cwd, n) {
  return Boolean(m.slots?.[n]) || existsSync(slotPath(cwd, n))
}

/** 归档一个槽：置 `archived[slot] = now`（幂等——已归档 ⇒ `already` 零重写）。 */
export function archiveSlot(cwd, slot) {
  const n = Number(slot)
  if (!Number.isInteger(n) || n < 1) return { ok: false, reason: "invalid-slot" }
  const m = loadManifest(cwd)
  if (!slotExists(m, cwd, n)) return { ok: false, reason: "slot-missing" }
  if (m.archived?.[n] != null) return { ok: false, reason: "already" }
  m.archived = { ...(m.archived ?? {}), [n]: Date.now() }
  saveManifest(cwd, m)
  return { ok: true }
}

/** 取消归档：删 `archived[slot]`（未归档 ⇒ `not-archived` 零重写）；deletions 显式表删除意图。 */
export function unarchiveSlot(cwd, slot) {
  const n = Number(slot)
  if (!Number.isInteger(n) || n < 1) return { ok: false, reason: "invalid-slot" }
  const m = loadManifest(cwd)
  if (m.archived?.[n] == null) return { ok: false, reason: "not-archived" }
  saveManifest(cwd, m, { archived: [n] })
  return { ok: true }
}

/** 归档槽集合（listSlots 过滤 ∕ listArchivedSlots 消费共用）：`{ [slot]: archivedAt }` 形归一。 */
export function archivedMap(cwd) {
  const m = loadManifest(cwd)
  return m.archived && typeof m.archived === "object" ? m.archived : {}
}
