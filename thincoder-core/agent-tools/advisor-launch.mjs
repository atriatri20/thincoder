/**
 * advisor-launch.mjs — 实例与池判定一族：哪条评审实例接这一轮、池让不让起。
 *
 * 2026-11-12 自 advisor-async.mjs 拆出（分拆方案 = `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md`
 * §10「分拆方案（`advisor-async.mjs`，本批内实施）」——该档过 500 设计器硬线，规则要求本批内拆完）。
 * 切点 = 原档「Review-instance registry」分节起、`cancelAsyncAdvisor` 之前整段。
 * 本档对**池与队列**只读（不碰队列、不碰控制器、不写池）；实例注册表按既有语义懒建与回收，故
 * `advisorRuns` ∥ `resolveAdvisorLaunch` 会写 `_advisorRuns` 与镜像字段。留下的族是「起 ∥ 停 ∥ 排 ∥ 关」写动作。
 * 依赖方向单一：本档只依赖 `carrierField` ∥ `getAsyncPool`（async-settle.mjs）∥ `docSetKey` ∥
 * `resolveReviewDocPaths` ∥ `scopeAdvisorMirror`（review-facts.mjs）∥ `randomUUID`（node:crypto）；
 * advisor-async.mjs 反向 import 本档的判定函数——两档之间是单向边。与 async-settle.mjs 之间
 * 存在**既有的**一环（该档静态 import `refillAdvisorQueue`，本档 import `carrierField` ∥ `getAsyncPool`）：
 * 拆分前是 advisor-async ↔ async-settle 的一环，拆分后同一环多经本档一格——环数不变、本笔未新增环，
 * 环上无模块级求值（两侧都只在函数体内调用）。
 * 既有 import 面零改：原档 re-export 本档的全部既有导出（同 design-token.mjs ∥ advisor-settle.mjs 的先例）。
 */
import { randomUUID } from "node:crypto"
import { docSetKey, resolveReviewDocPaths, scopeAdvisorMirror } from "./review-facts.mjs"
import { carrierField, getAsyncPool } from "./async-settle.mjs"

// ─────────────────────────────────────────────────────────────────────────────
// Review-instance registry (_advisorRuns — per-review rounds/prior/cap)
// ─────────────────────────────────────────────────────────────────────────────

/** 载体吸收后的只读读取（不创建）：父对象字段优先、缺字段回退跨 run 载体
 *  （`history` 数组——agent 逐 run 重建的形态靠它跨 run 存活）。无 ⇒ null。
 *  导出面：写动作一族（`closeOpenCodeAdvisorRuns`）要用它，故跨档可见；它不是原档的既有导出，
 *  故原档的 re-export 名单**不含**它（import 面与拆分前逐字同）。 */
export function advisorRunsRead(agent) {
  const m = carrierField(agent, "_advisorRuns")
  return m instanceof Map ? m : null
}

export function advisorRuns(agent) {
  // 实例注册表读取吸收（与 #94 载体口径同源）：既有形态（字段挂 agent）零变；
  // 注册表已挂跨 run 载体的形态直接沿用（不另建分叉）。
  const existing = advisorRunsRead(agent)
  if (existing) return existing
  // 缺省创建：落在跨 run 载体上（有 history 时）——与其余载体字段同口径。
  const holder = agent?.history ?? agent
  if (!holder) return new Map()
  if (!(holder._advisorRuns instanceof Map)) holder._advisorRuns = new Map()
  return holder._advisorRuns
}

/** The newest OPEN code instance (the thread a fix-round launch continues), or null. */
export function openCodeRun(agent) {
  const runs = advisorRunsRead(agent)
  if (!(runs instanceof Map) || runs.size === 0) return null
  for (const r of [...runs.values()].reverse()) {
    if (r.reviewType === "code" && r.open) return r
  }
  return null
}

/** The newest OPEN design instance for the given document set, or null. */
function openDesignRun(agent, key) {
  const runs = advisorRunsRead(agent)
  if (!(runs instanceof Map) || runs.size === 0) return null
  for (const r of [...runs.values()].reverse()) {
    if (r.reviewType === "design" && r.open && r.docSetKey === key) return r
  }
  return null
}

/**
 * Resolve the review instance a launch continues (AGENT-LOOP-ASYNC-POOL.md §6.10 ③ — per-review
 * rounds/prior; reviewId = designId for design reviews, a random id for code).
 *  - design: continue the OPEN instance of the same document set (fix rounds of
 *    a review thread keep its designId and its round/prior); none → new instance.
 *  - code: continue the newest OPEN code instance (guard-driven fix loops);
 *    none → new instance.
 * The legacy agent._advisorRound/_lastAdvisorOutput fields are SCOPED to the
 * instance before the launch (message building + the run.mjs cap read them) —
 * prior-less continuation degrades to round 1 semantics (fresh full review).
 * @returns {{run: object, isNew: boolean, reviewId: string, designId: string|null}}
 */
export function resolveAdvisorLaunch(agent, reviewType, { documents = null } = {}) {
  const runs = advisorRuns(agent)
  let run = null
  if (reviewType === "design") {
    const key = docSetKey(documents, agent.cwd)
    run = openDesignRun(agent, key)
    if (!run) {
      const reviewId = randomUUID()
      // F2h (§29.1 2026-09-07): a same-scope re-review reuses the session's
      // designId for this doc-set (any prior instance of the scope — open OR
      // closed — the newest wins). A passed re-review overwrites the slot under
      // the same id (no slot residue — T14: the old token is then rejected at
      // the gate); old slots die at TTL only, kept as the fail-safe fallback.
      const prior = [...runs.values()].reverse().find((r) => r.reviewType === "design" && r.docSetKey === key)
      // #863 实例回收（§6.10）：同 docSetKey 保最新一条 closed（= prior——F2h 只取 newest，语义零变）；
      // 余者去重回收（实例随删释放——closed 零消费面）。
      for (const r of [...runs.values()]) {
        if (r !== prior && r.reviewType === "design" && !r.open && r.docSetKey === key) runs.delete(r.reviewId)
      }
      run = {
        reviewId, reviewType, designId: prior?.designId ?? reviewId,
        round: 0, priorOutput: null, stale: false, open: true, docSetKey: key,
        // 被审文档集的**受理绝对路径**（单源 = `resolveReviewDocPaths`——与受理面同一把尺）：
        // §10.2 封印按这一组算。`docSetKey` 是实例键（`normAbs` 的 cwd 拼法），cwd 非项目根时
        // 它与受理路径不是同一组——拿实例键当封印清单会把封印盖到另一条路径上。
        docAbs: [...resolveReviewDocPaths(documents, agent.cwd).resolved.values()],
      }
      runs.set(reviewId, run)
    }
  } else {
    run = openCodeRun(agent)
    if (!run) {
      // #863 实例回收（§6.10）：新 code 实例创建 ⇒ closed 实例清除（openCodeRun 仅取 open——零消费）。
      for (const r of [...runs.values()]) {
        if (r.reviewType === "code" && !r.open) runs.delete(r.reviewId)
      }
      const reviewId = randomUUID()
      run = {
        reviewId, reviewType, designId: null,
        round: 0, priorOutput: null, stale: false, open: true, docSetKey: null,
      }
      runs.set(reviewId, run)
    }
  }
  // Scope the mirror fields to THIS instance (message builder + run.mjs cap +
  // displays; #949 ① — the queued-launch window is re-secured at entry.start).
  scopeAdvisorMirror(agent, run)
  return { run, isNew: run.round === 0 && !run.priorOutput, reviewId: run.reviewId, designId: run.designId }
}

/** Guard round — the OPEN CODE instance only (2026-09-07 §8 F2): the design-written
 *  mirror never gates the code guard — no open code instance → 0. */
export function effectiveAdvisorRound(agent) {
  return openCodeRun(agent)?.round ?? 0
}

// ─────────────────────────────────────────────────────────────────────────────
// Async pool (agent._asyncAdvisors — pool 上限 F-1/F-2:常量 = 运行时回退权威(2 → 4),
// config.mjs DEFAULTS.agent.poolLimits.advisor = config 层镜像——耦合锁 config-pool
// .test.mjs 逐键断言——勿单侧改默认)
// ─────────────────────────────────────────────────────────────────────────────

export const ADVISOR_POOL_LIMIT = 4

/** AGENT-LOOP-ASYNC-POOL.md §6.10 advisor 池生效上限（纯——读 agent.poolLimits.advisor——合法 ≥1 整数生效——
 *  非法/缺省回退 ADVISOR_POOL_LIMIT——与 subagent 域 resolvePoolLimits 独立不共享
 *  （subagent 两键表不含本键——键表语义不同——POOL-CONFIG-UNIFIED F-2））。 */
export function resolveAdvisorPoolLimit(raw) {
  const v = raw?.advisor
  return Number.isInteger(v) && v >= 1 ? v : ADVISOR_POOL_LIMIT
}

/** launch 判定点每次读 agent.config（/config 热应用——变更即生效下个 launch——文案
 *  如实报本值）。 */
export function advisorPoolLimitFor(agent) {
  return resolveAdvisorPoolLimit(agent?.config?.agent?.poolLimits)
}
/** §6.10 同 scope 守卫（F-5——用户裁①）：同 reviewType+scope 有 running 评审 → true
 *  （拒——running 并行多实例歧义放大——settled 续跑语义不变）。design scope = 文档集键
 *  （docSetKey）；code = 单 code 线程（记录不记路径键——与 openCodeRun 语义一致）。
 *  与池容量守卫独立：容量 = 全局 ≤N——scope = 同 scope ≤1——两关都过才启动。 */
export function runningAdvisorOfScope(agent, reviewType, docSetKey) {
  const pool = getAsyncPool(agent, "advisor")
  if (!(pool instanceof Map)) return false
  for (const e of pool.values()) {
    if (e.status !== "running" || e.reviewType !== reviewType) continue
    if (reviewType === "design" && e.run?.docSetKey !== docSetKey) continue
    return true
  }
  return false
}

export function runningAdvisorCount(agent) {
  return [...(getAsyncPool(agent, "advisor")?.values() ?? [])].filter((e) => e.status === "running").length
}

/** Any in-flight (non-done) async advisor review? — the completion guard skips
 *  its push-back while a review is pending (T-24b4: 未决不算未评审). */
export function advisorReviewPending(agent) {
  return [...(getAsyncPool(agent, "advisor")?.values() ?? [])].some((e) => !e.done)
}
