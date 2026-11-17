/**
 * suspension-resident.mjs — 挂起窗的**驻留条目面**（自 `suspension-drive.mjs` 拆出 —— 该档
 * `createSuspensionDrive` 越函数硬线，按 `docs/desktop/design/ACTIVITY.md` §2.1 表落形；
 * 批档 = `docs/batches/2026-11-14-suspension-drive-split.md` §2）。
 *
 * **管什么**：驻留条目的读面与四个出口 —— 起跑快照 `pendingSnapshot` · 补发 `done` `reemitDone`
 * （含 consult 子块展开）· 自愈扫读 `sweepDigestedStuck` · 退出残余注入 `injectResidual`；
 * 另有读面 `resident(agent)`（驻留条目枚举 —— 扫读判据 ∥ `freezeAll` 取快照 ∥ `abort` 落冻结快照
 * 三处共用这一处）。
 * **不管什么**：不判**何时**补发 —— 时机在三处，由别的档触发（窗内回合档的起跑支 ∥ 建窗档登记的两枚核件钩子
 * `reclaim` ∥ `freezeAll`），本档只做第三处「自愈扫读」自己的触发面；不碰窗表、输入队列与闩面（零第二写者）。
 *
 * 零宿主依赖（`post` = 出站面注入；`panelLive` = 渲染面实况缓存模块级单例）⇒ 平 node 直测；零文案。
 */
import { panelLive } from "./panel-live.mjs"

/** 驻留面工厂：`post(channel, payload)` = 出站面（补发 `ev:subagent { status:"done" }` 的唯一出口）。
 *  返回 `{ pendingSnapshot, reemitDone, sweepDigestedStuck, injectResidual, resident }`。 */
export function createResidentFace({ post } = {}) {
  if (typeof post !== "function") throw new Error("[suspension-resident] post required (out-bound channel)")

  /** 驻留条目（回收 ∕ 冻结的补发对象）：两池 + pending 单容器（载体字段面 = 核单源，零第二口径）。 */
  function resident(agent) {
    const out = []
    for (const field of ["_asyncSubagents", "_asyncAdvisors"]) {
      const map = agent?.[field]
      if (map instanceof Map) out.push(...map.values())
    }
    out.push(...(agent?._pendingAsyncResults ?? []))
    return out
  }

  /** 起跑快照（本批 2026-10-01 —— 起跑窗**主面**）：起跑刻 pending 单容器（= 本轮将消费的驻留条目；
   *  D2 核单源 `_pendingAsyncResults`）——浅拷快照（补发期间容器可能被回合注入器消费）。 */
  function pendingSnapshot(agent) {
    return Array.isArray(agent?._pendingAsyncResults) ? [...agent._pendingAsyncResults] : []
  }

  /** 逐条补发 `done`（`settled` 等待消化块 ⇒ 归档入流；块回收与池空解耦——不等池空）。载荷形 = VSC 收回面同款。
   *  **会话本体零渲染行（consult）——不跳过**：按会话条目 `childIds` 逐子块补发（块键形 `consult#<N>`，
   *  consult 同族收齐批 · 台账 #748——三路径同件：起跑支 ∥ `reclaim` ∥ `freezeAll`；VSC 对位物 `remitConsultChildBlocks`（两径共用）同判）。
   *  「仍在 pending」在 reclaim 径由 `consumed` 差集**结构性满足**（回收到者 = 已离容器者）。 */
  function reemitDone(key, entries) {
    for (const e of entries) {
      if (!e || e.id === undefined || e.id === null) continue
      console.error(`[suspension-drive] reemit-done ${key} ${e.role ?? "subagent"}#${e.id}`) // 诊断痕（2026-10-06——#76 digested-stuck 事故；起跑补发∥reclaim∥freezeAll∥自愈扫 四径共用本点）
      if (e.role === "consult") {
        // #748：会话本体无行——逐子块展开（无块子块不入表 ⇒ 表空 = 零发）；本体 id 零补发
        for (const cid of e.childIds ?? []) post("ev:subagent", { key, role: "consult", id: cid, status: "done" })
        continue
      }
      post("ev:subagent", { key, role: e.role ?? "subagent", id: e.id, status: "done" })
    }
  }

  /** 已消化驻留块自动回收（2026-10-06——#76 digested-stuck 事故；形状 = 手动 freeze 谓词（`renderSubagentPanel`）
   *  的 beat 级自动化）：渲染面报块中 `awaitingDigest ∧ frozen ∧ 非 consult` ∧ 核侧不在驻留（两池 + pending 皆无）
   *  ⇒ 判定「已消化驻留」（done 帧曾丢——帧面零持久痕为该事故的读面缺口）⇒ 补发 done（幂等：重复发射由渲染面归档闸消化）。
   *  谓词逐 beat 现算 = 零新存储（符「位置零存储」裁）；效果 = 分钟级自愈，不再等池空 freezeAll ∥ 手动 freeze。 */
  function sweepDigestedStuck(key, agent) {
    const blocks = panelLive.get(key)?.blocks
    if (!Array.isArray(blocks)) return
    const live = resident(agent)
    const hits = []
    for (const b of blocks) {
      if (!b || b.awaitingDigest !== true || b.frozen !== true || b.role === "consult") continue
      const m = /^sub:([A-Za-z][\w-]*)#(\d+)$/.exec(String(b.key ?? ""))
      if (!m) continue
      const role = m[1]
      const id = Number(m[2])
      if (live.some((e) => e && e.role === role && e.id === id)) continue // 仍在池 ∥ 报告未达 ⇒ 不动（手动 freeze 同判）
      hits.push({ role, id })
    }
    if (hits.length > 0) {
      console.error(`[suspension-drive] sweep-digested-stuck ${key} → ${hits.map((h) => `${h.role}#${h.id}`).join(",")}`)
      reemitDone(key, hits)
    }
  }

  /** 退出残余注入（idle 清场 —— 结果零丢失）：核统一注入器按 role 分发（与 `finishSuspension` 的注入面契约同源）。
   *  动态 import（核链重 —— 先例 = 扩展端 `suspension.mjs`；装配期零代价）。 */
  async function injectResidual(agent, item) {
    if (item?.role === "consult") {
      const { injectConsultResult } = await import("@thincoder/core/agent-tools/consult.mjs")
      await injectConsultResult(agent, item)
      return
    }
    const { injectAsyncResult } = await import("@thincoder/core/agent-tools/subagent.mjs")
    await injectAsyncResult(agent, item)
  }

  return { pendingSnapshot, reemitDone, sweepDigestedStuck, injectResidual, resident }
}
