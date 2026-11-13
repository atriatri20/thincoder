/** Session work-mode commands. /eng toggles engineering↔normal; /minimal toggles
 * minimal↔normal; /normal always selects normal. All three write the same slot field. */
import { ansi, C } from "./ansi.mjs"
import { activeSlot } from "@thincoder/core/session.mjs"
import { setSlotMode } from "@thincoder/core/session-slot-write.mjs"
import { purgeExpiredDesignTokens } from "@thincoder/core/token-ttl.mjs"
import { resolveEngineeringManifest } from "@thincoder/core/manifest.mjs"
import { resolveWorkMode, setConfigWorkMode } from "@thincoder/core/config.mjs"
import { ENG_OFF_REMINDER } from "@thincoder/core/agent.mjs"
import { clearPlanMode } from "@thincoder/core/agent-tools/plan.mjs"

async function selectWorkMode(ctx, target, command) {
  const { agent, pushLine, pushLabel } = ctx
  agent.config.agent ??= {}
  const previous = resolveWorkMode(agent.config.agent)
  const enteringEngineering = target === "engineering" && previous !== "engineering"
  const leavingEngineering = previous === "engineering" && target !== "engineering"

  // Preserve the existing engineering entry gate: refusal leaves mode, tokens, PLAN and slot intact.
  let engineeringManifest
  if (enteringEngineering) {
    const r = resolveEngineeringManifest(agent.cwd, { writer: "main" })
    if (!r.ok && r.code !== "workspace") {
      pushLine(`Engineering mode not enabled — ${r.message} (mode unchanged)`, C.warn)
      return
    }
    engineeringManifest = r.ok ? r.manifest : null
  }

  // Persist first: a rejected write leaves the current in-memory mode unchanged and reports failure.
  const slot = agent._slot ?? activeSlot(agent.cwd)
  if (!setSlotMode(agent.cwd, slot, target)) {
    pushLine(`Work mode unchanged — could not write session slot ${slot}`, C.error)
    return
  }
  if (enteringEngineering) agent.manifest = engineeringManifest
  setConfigWorkMode(agent.config, target)
  const planReset = target === "engineering" ? clearPlanMode(agent) : false
  if (previous !== target && (enteringEngineering || leavingEngineering)) agent._advisorRuns = new Map()
  if (leavingEngineering) {
    agent._advisorRound = 0
    agent._touchedFiles = []
    agent._pendingReminders ??= []
    agent._pendingReminders.push(ENG_OFF_REMINDER)
  }
  const clearedExpired = enteringEngineering ? purgeExpiredDesignTokens(agent) : 0
  agent._lastEngState = target === "engineering"

  pushLabel(`❯ ${command}`, ansi.bold + C.tool)
  pushLine(`Work mode: ${target} (session; next run)`, C.tool)
  if (target === "engineering") {
    pushLine("  → design-before-code enforced (design review + user approval before code)", C.dim)
    if (planReset) pushLine("  → plan mode reset (engineering mode excludes plan mode)", C.dim)
    if (clearedExpired > 0) {
      pushLine(`  → cleared ${clearedExpired} expired design token${clearedExpired === 1 ? "" : "s"}; valid tokens from prior reviews stay usable`, C.dim)
    }
  }
}

export async function handleEngCommand(ctx) {
  const current = resolveWorkMode(ctx.agent.config?.agent)
  await selectWorkMode(ctx, current === "engineering" ? "normal" : "engineering", "/eng")
}

export async function handleMinimalCommand(ctx) {
  const current = resolveWorkMode(ctx.agent.config?.agent)
  await selectWorkMode(ctx, current === "minimal" ? "normal" : "minimal", "/minimal")
}

export async function handleNormalCommand(ctx) {
  await selectWorkMode(ctx, "normal", "/normal")
}
