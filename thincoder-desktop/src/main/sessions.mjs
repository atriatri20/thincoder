/**
 * sessions.mjs — 会话族读面（`docs/desktop/design/IPC.md` §2 会话族注 · `docs/desktop/design/PROJECT.md` §4.1 本档行）：
 * `sessions:list` 载荷投影 —— 核 `listSlots` 条目 → 会话控制条目（字段闭集 = `docs/desktop/design/IPC.md`:47）。
 * **零新增算法**（会话族注项 3）：不落新存储、不重算摘要、不扫目录名——读数全走端壳转口 `./session-slots.mjs`
 * 的 `listSlots`（端壳零算法副本判据照旧）。
 * 未打开项目（`cwd` 空）⇒ `{ cwd: null, rows: [] }` = **正常载荷**（非错误——渲染面读作启动态）；
 * 读取失败（核抛）⇒ 本档不吞：**抛出 ⇒ `invoke` 拒绝**（失败面口径 = `src/main/ipc.mjs:23-25` 头注同形）。
 * 本批**不认领活动槽**：`isActive` 只读（不写 manifest、不发端壳认领）。
 */
import { ledgerHealth, listSlots, listArchivedSlots } from "./session-slots.mjs"
import { usageBySlotSync } from "./usage-log.mjs" // 会话用量聚合（2026-10-06 —— 行拼 `usage` 六键）

/** 载荷行字段集（闭集 · 单源 = IPC 会话族注项 1）：`date` / `updatedDate` 是核本地化显示串、
 *  `firstMessage` 非会话控制条目所需 ⇒ **不载**（关键决策 D-4）；**R3c 增** `provider`（= 核条目 `activeProvider`
 *  —— D18 元数据族首值；核 `listSlots` 投影口径：`provider:model` 复合串（无活动模型 ⇒ 裸渠道名）· 老槽 ⇒ `""`）。 */
export const ROW_FIELDS = Object.freeze([
  "slot", "title", "createdBy", "updatedAt", "messageCount", "isActive", "provider", "firstMessage",
])

/** 核条目 → 载荷行：**只挑字段、不改写**（字段名与核投影同源 —— 零改名、零重算、零缺省回填；
 *  `provider` = 核 `activeProvider` 逐字（老槽缺键 ⇒ 核已归 `""` —— 渲染面不标注）。
 *  `firstMessage` = 显示兜底载波（2026-10-05 —— 标题空 ⇒ 渲染面以首条消息为显示标题；
 *  核投影本就携带 —— D-4 决策修订，读取零成本）。 */
function toRow(entry, usageMap) {
  // 用量拼装（2026-10-06）：本会话台账聚合（六键 + requests）——**零台账行 ⇒ 零 `usage` 键**（缺席 =
  // 未产用量 ∕ 旧会话，渲染面零节点，不假造零值）。
  const usage = usageMap?.get(String(entry.slot))
  return {
    slot: entry.slot,
    title: entry.title,
    createdBy: entry.createdBy,
    updatedAt: entry.updatedAt,
    messageCount: entry.messageCount,
    isActive: entry.isActive,
    provider: entry.activeProvider,
    firstMessage: typeof entry.firstMessage === "string" ? entry.firstMessage : "",
    ...(usage ? {
      usage: {
        requests: usage.requests,
        prompt: usage.prompt,
        completion: usage.completion,
        reasoning: usage.reasoning,
        cacheRead: usage.cacheRead,
        cacheWrite: usage.cacheWrite,
      },
    } : {}),
  }
}

/** `sessions:list` 读面：`cwd` 空 ⇒ 空载荷（未打开项目）；否则核投影逐行挑字段（行序 = 核序 = `updatedAt` 降序）。
 *  **账本异常注记**（账本可靠批 · 桌面微轮 —— 单源 = `docs/desktop/design/IPC.md` §2「会话族注」项 6）：`ledger` = 回执增字段 ·
 *  **异常才携**（缺席 = 正常——负断言）；触发 = `refused > 0 ∨ scene`（与 CLI / VSC 同口径，脱离会话计数条件）；判据单源 = 核
 *  `ledgerHealth(cwd)`（经端壳转口引核出口——零算法副本）；`reason` = `lastReason` 逐字 ∥ `"scene"`（仅损坏现场时；`refused > 0` ⇒ `lastReason` 恒非空——核同拍写，`?? "scene"` 兜底不可达）；`cwd` 空 ⇒ 不携。 */
export function listSessions(cwd) {
  if (typeof cwd !== "string" || cwd === "") return { cwd: null, rows: [] }
  const usageMap = usageBySlotSync({ cwd })
  const receipt = { cwd, rows: listSlots(cwd).map((entry) => toRow(entry, usageMap)) }
  const health = ledgerHealth(cwd)
  if (health.refused > 0 || health.scene) {
    receipt.ledger = { refused: health.refused, reason: health.lastReason ?? "scene", scene: health.scene }
  }
  return receipt
}

/** `sessions:archived` 读面（fork · 2026-10-06 · 二调 —— **跨项目归档** ∕ ZCode 归档列表同形）：
 *  载荷 `{ cwds }`（当前项目 + 最近项目全集，与 catalog 同源喂入）⇒ 逐项目核 `listArchivedSlots`
 *  投影，每行**附 `cwd`（所属项目路径）+ `project`（项目名 = 尾段）**——归档视图行显归属。
 *  全局按 `archivedAt` 降序（最近归档在前，跨项目混排）。单项目读失败 ⇒ 该项目零行（fail-soft）。
 *  只读零写。 */
export function archivedSessions(cwds) {
  const list = Array.isArray(cwds) ? cwds.filter((cwd) => typeof cwd === "string" && cwd !== "") : []
  const rows = []
  for (const cwd of list) {
    try {
      const usageMap = usageBySlotSync({ cwd })
      const name = cwd.split(/[\/]/).filter(Boolean).pop() ?? cwd
      for (const entry of listArchivedSlots(cwd)) {
        rows.push({ ...toRow(entry, usageMap), archivedAt: entry.archivedAt, cwd, project: name })
      }
    } catch { /* 单盘坏档不拖垮全表 */ }
  }
  rows.sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0) || b.slot - a.slot)
  return { ok: true, rows }
}

/** `sessions:catalog` 读面（**项目目录** · 2026-10-05 —— 侧边栏项目组展开的数据面）：
 *  载荷 `{ cwds: string[] }` ⇒ 逐项目核 `listSlots(cwd)` 轻投影（清单 manifest 读——**只读链零写**，
 *  懒核实 = 纯内存登记 + 延迟拍，非本档承担）；回执逐项目 `{ cwd, sessions: [{slot, title, firstMessage,
 *  updatedAt, isActive, messageCount}] }`（**无 title 兜底**——显示链归渲染面 `displayTitleOf` 同一判据）。
 *  单项目读失败 ⇒ 该项目 `sessions: []`（fail-soft——目录面不因单盘坏档全灭）。消费面 = `renderer/mount-sidebar.mjs`
 *  项目组展开（wire 经 store `catalog` 切片）。 */
export function catalogSessions(cwds) {
  const list = Array.isArray(cwds) ? cwds.filter((cwd) => typeof cwd === "string" && cwd !== "") : []
  return {
    ok: true,
    projects: list.map((cwd) => {
      try {
        // 用量拼装（2026-10-06 —— 与 listSessions 同源 `usageBySlotSync`；逐项目一次聚合）。
        const usageMap = usageBySlotSync({ cwd })
        return {
          cwd,
          sessions: listSlots(cwd).map((entry) => {
            const usage = usageMap.get(String(entry.slot))
            return {
              slot: entry.slot,
              isActive: entry.isActive,
              title: typeof entry.title === "string" ? entry.title : "",
              firstMessage: typeof entry.firstMessage === "string" ? entry.firstMessage : "",
              updatedAt: entry.updatedAt ?? entry.timestamp ?? 0,
              ...(usage ? {
                usage: {
                  requests: usage.requests,
                  prompt: usage.prompt,
                  completion: usage.completion,
                  reasoning: usage.reasoning,
                  cacheRead: usage.cacheRead,
                  cacheWrite: usage.cacheWrite,
                },
              } : {}),
            }
          }),
        }
      } catch {
        return { cwd, sessions: [] }
      }
    }),
  }
}
