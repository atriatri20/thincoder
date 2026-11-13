/**
 * session-flags.mjs — Desktop 会话旗标写面。
 *
 * `patch` 只接受 planMode/autoApprove/advisorGuard 三个布尔项与 mode 三档枚举。
 * 所有字段先验完再写；旧 engineering 布尔不是写入口。合法 mode 经 core 写入唯一槽字段。
 * 活代理随后**定向重施**（只碰本次旗标字段 —— planMode / autoApprove / advisor.guard / mode ——
 * 保留 `history` 引用与内容：在飞未落盘历史零覆盖），并以写后规范值快照回执、推送 ev:flags；
 * 无活代理 ⇒ 以槽投影 `slotFlags`（`session-slots.mjs` 规范口径）兜底出同形 flags —— 成功回执恒携 `flags`。
 */
import { loadConfig, resolveSessionWorkMode, setConfigWorkMode } from "@thincoder/core/config.mjs"
import { clearPlanMode } from "@thincoder/core/agent-tools/plan.mjs"
import { loadSlotFile } from "@thincoder/core/session.mjs"
import {
  setSlotAdvisorGuard, setSlotAutoApprove, setSlotMode, setSlotPlanMode,
} from "@thincoder/core/session-slot-write.mjs"
import { attachManifest } from "./agent-assemble.mjs"
import { slotFlags, slotOfKey } from "./session-slots.mjs"

const MODES = Object.freeze(["minimal", "normal", "engineering"])
const FLAG_KEYS = Object.freeze(["planMode", "autoApprove", "advisorGuard", "mode"])
const FLAG_WRITERS = Object.freeze({
  planMode: setSlotPlanMode,
  autoApprove: setSlotAutoApprove,
  advisorGuard: setSlotAdvisorGuard,
  mode: setSlotMode,
})

/** 非对象、空补丁、表外键或任何非法值都拒绝整笔，保证校验阶段零写。 */
function patchFailure(patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return "invalid-patch"
  const keys = Object.keys(patch)
  if (keys.length === 0 || keys.some((key) => !FLAG_KEYS.includes(key))) return "invalid-patch"
  for (const key of keys) {
    if (key === "mode") {
      if (!MODES.includes(patch.mode)) return "invalid-patch"
    } else if (typeof patch[key] !== "boolean") return "invalid-patch"
  }
  return null
}

/** 活代理**定向重施**：只把本次旗标字段施加到运行态（`patch` 在场项 —— 不整份 `loadAgentSlot`；
 *  整份重载的 `applySession` 会重钉 `agent.history = [...machineMerged]`，把在飞未落盘历史覆盖为盘上副本）。
 *  mode ⇒ 核 `setConfigWorkMode` 单点（`mode` + `engineering` 双键一致）；engineering 下顺带 `clearPlanMode`
 *  （ENG-PLAN-EXCLUSION —— 与 `applySession` 恢复点同函数，零第二口径）；planMode 只在非 engineering 施加
 *  （同笔 `mode:"engineering"` 时盘面已由 `setSlotMode` 清 PLAN，内存由 `clearPlanMode` 清 —— 零矛盾半状态）。 */
function applyFlagPatch(agent, patch) {
  agent.config ??= {}
  if ("mode" in patch) {
    setConfigWorkMode(agent.config, patch.mode)
    if (patch.mode === "engineering") clearPlanMode(agent)
  }
  if ("planMode" in patch && patch.mode !== "engineering") agent.planMode = patch.planMode
  if ("autoApprove" in patch) agent.autoApprove = patch.autoApprove
  if ("advisorGuard" in patch) {
    const current = agent.config.advisor !== null && typeof agent.config.advisor === "object" ? agent.config.advisor : {}
    agent.config.advisor = { ...current, guard: patch.advisorGuard }
  }
}

/** 无活代理时的 flags 投影 agentConfig（`slotFlags` 第二参：槽无 mode/engineering 时回落配置默认）。 */
function agentConfigOf() {
  try { return loadConfig()?.agent } catch { return undefined }
}

/** 造会话旗标写面；依赖均由宿主注入，便于平 node 测试。 */
export function createSessionFlags({ agents, projects, post, flagsOf } = {}) {
  const fail = (reason) => ({ ok: false, reason })

  function setFlags(key, patch) {
    const slot = slotOfKey(key)
    if (slot === null) return fail("bad-key")
    const bad = patchFailure(patch)
    if (bad !== null) return fail(bad)
    const cwd = projects?.currentCwd()
    if (typeof cwd !== "string" || cwd === "") return fail("slot-missing")

    // 单独开启 PLAN 时读取当前槽模式；engineering 下拒绝且整笔零写。
    // 同笔切到 engineering 则由 core 的 setSlotMode 清 PLAN，不先写矛盾的 planMode:true。
    if (patch.planMode === true && patch.mode === undefined) {
      const current = loadSlotFile(cwd, slot)
      if (!current) return fail("slot-missing")
      if (resolveSessionWorkMode(current) === "engineering") return fail("invalid-patch")
    }

    for (const field of FLAG_KEYS) {
      if (!(field in patch)) continue
      if (field === "planMode" && patch.mode === "engineering") continue
      if (!FLAG_WRITERS[field](cwd, slot, patch[field])) return fail("slot-missing")
    }

    const agent = agents?.get(String(key))
    if (agent) {
      try {
        applyFlagPatch(agent, patch)
        attachManifest(agent, { cwd })
      } catch (error) {
        console.error(`[session-flags] re-apply failed for session ${slot}: ${error?.message ?? error}`)
        return fail("apply-failed")
      }
    }

    // 活值（agent 在场 —— 宿主 `flagsOf` 单源）优先；无活代理 ⇒ 槽投影 `slotFlags` 兜底同形
    // （写后规范值 —— 成功回执恒携 `flags`，渲染面不再收到无 flags 回执）。
    let flags = typeof flagsOf === "function" ? flagsOf(String(key)) : null
    if (flags === null) {
      const data = loadSlotFile(cwd, slot)
      if (!data) return fail("slot-missing")
      flags = slotFlags(data, agentConfigOf())
    }
    post("ev:flags", { key: String(key), flags })
    return { ok: true, flags }
  }

  return { setFlags }
}
