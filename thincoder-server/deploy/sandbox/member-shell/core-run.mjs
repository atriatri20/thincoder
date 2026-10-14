/**
 * core-run.mjs — 核回合驱动（member-face-chat 批 · 盒壳）
 *
 * 职责 = 把盒 env 接进核装配序、把一个回合跑成帧流（`agent/MEMBER-AGENT.md` §3.10「最小壳」）。
 * **不是第二套 agent**：循环/会话/提示词/工具一律取核件（`@thincoder/core`）——壳零 agent 循环
 * 自实现（AC-50④ 判据：import 面断言）。壳↔核 = **核既有导出件**（`sandbox/EXECUTION.md` §8
 * 会话读写面——核码零改）。
 *
 * 核件坐标（本档实际消费面——实施当刻实读）：
 *   装配 `core/agent/assemble.mjs` `assembleAgent`/`validateProvider` ∥ 回合 `core/agent.mjs`
 *   `runAgent` ∥ 会话 `core/session.mjs`（`applySession`/`saveSession`/`loadSlotFile`/`listSlots`/
 *   `newSession`/`loadManifest`/`slotPath`）∥ 偏好写面 `core/session-slot-write.mjs` `setSlotPrefs`
 *   ∥ 配置 `core/config.mjs` `loadConfig` ∥ 事件 token 剥离 `core/agent/relay-prefix.mjs`
 *   `parseRelayPath` + `core/agent/subagent-event.mjs` `parseSubagentEvent`（同 ACP 桥先例；
 *   帧词表无 subagent 框——剥离后零转发）。
 *
 * **核导入 = 动态（`loadCore`）**：本档顶层零 `@thincoder/core` 静态 import——包只在镜像内
 * （件位 `/opt/thincoder/app/node_modules/@thincoder/core`）可解析；开发机侧单元测试经
 * `createCoreRun({ core })` 注入假件（见批内测试档）。
 *
 * **盒↔核 接口假设（两处——实施批自定形，已在批档 §5 披露）**：
 *   ① 配置桥 `withBoxProvider`：核 `loadConfig()`（盒内 config.json 缺席 ⇒ 核全默认）覆写
 *      provider 面 = 盒 env 的 server 网关（单渠道；`providers[].model` 不设——渠道单值模型
 *      2026-10-09 已退场，模型身份 = 会话槽选定）；会话槽 `activeProvider` 恒 `BOX_PROVIDER`。
 *   ② 会话行形（读指令回呈）：`{ id, model, reasoning, status, excerpt, updatedAt }` ——
 *      `id` = 槽号（`.id` 复合形的服务器侧拼装归 server）；`model` = 槽 `activeModel`（成员面
 *      外标）∥ `reasoning` = 槽 `effort`（`null` = 未设）∥ `status` = `running`/`idle`（本壳在途态）
 *      ∥ `excerpt` = 首条用户消息 ≤40 字。
 */
import { existsSync } from "node:fs"
import { capText, callFrame, deltaFrame, endFrame, resultFrame, turnFrame, usageFrame, RESULT_SUMMARY_MAX } from "./protocol.mjs"

/** 盒内单渠道名（会话槽 `activeProvider` 恒此值——成员面外标 = 服务器开放清单标识）。 */
export const BOX_PROVIDER = "server"

/** 壳侧错误（kind 供结果面分类与 `end.reason` 取值——`not_found` ∥ `invalid_request` ∥ `write_failed` ∥
 *  `model_error`（模型未就绪旧值 `provider_invalid` 已归并至此——少一扩展值）∥ 其余原文）。 */
export class ShellError extends Error {
  constructor(kind, message) {
    super(message)
    this.name = "ShellError"
    this.kind = kind
  }
}

/** 复合 id / 裸号 ⇒ 槽号（`<workspaceId>:<槽号>` 容错——服务器的归属校验在其侧；盒只取尾号）。 */
export function slotOf(sessionId) {
  if (typeof sessionId === "number" && Number.isInteger(sessionId) && sessionId >= 1) return sessionId
  const m = /(?:^|:)(\d+)$/.exec(String(sessionId ?? "").trim())
  const n = m ? Number(m[1]) : NaN
  return Number.isInteger(n) && n >= 1 ? n : null
}

/** 配置桥①：核默认配置 ⇒ 覆写 provider 面 = 盒 env（server 网关；`OPENAI_BASE_URL`/`OPENAI_API_KEY`）。 */
export function withBoxProvider(config, env) {
  const entry = {
    name: BOX_PROVIDER,
    baseURL: String(env.OPENAI_BASE_URL ?? "").replace(/\/+$/, ""),
    apiKey: env.OPENAI_API_KEY ?? "",
  }
  config.providers = [entry]
  config.providersList = config.providers
  config.provider = { ...entry } // 核 loadConfig 语义 = 独立拷贝（PROVIDER.md 既有形）
  config.defaultModel = null // 模型身份 = 会话槽选定（渠道单值模型退场）
  config.providerState = "ok"
  config.providerStateReason = null
  config.providerInvalidReason = null
  return config
}

/** 工具失败判据（镜像 `thincoder-render-core/lib.mjs` `isToolFailure`——两行同判据；
 *  渲染核不件位于盒镜像（件位契约 = 核 + 壳），故此镜像；网页侧仍以渲染核原文判定为准）。 */
export function isToolFailureText(text) {
  const t = String(text ?? "").trim()
  if (!t) return false
  if (/^Error[:：]/.test(t)) return true
  return t.split("\n").some((line) => /^\((?:exit code (\d+)|killed: (.+)|spawn failed)\)$/.test(line.trim()))
}

/** 内容取文（字符串 ∥ parts 数组——图块跳过；核槽 history 的 content 两形）。 */
function textOf(content) {
  if (typeof content === "string") return content
  if (Array.isArray(content)) {
    return content.filter((b) => b?.type === "text").map((b) => String(b.text ?? "")).join("\n")
  }
  return ""
}

/** 读史投射：核槽 `history`（人读线）⇒ 展示行集（role 四值面取三值——notice 无源不造）。
 *  `data` 按 role 同 `gateway/API.md` §2.8：assistant 携 `toolCalls` ∥ tool 携 `toolCallId`/`name`/`ok`/`summary`。 */
export function projectMessages(data) {
  const history = Array.isArray(data?.history) ? data.history : []
  const rows = []
  let seq = 0
  for (const m of history) {
    if (!m || typeof m !== "object") continue
    const role = m.role
    if (role !== "user" && role !== "assistant" && role !== "tool") continue
    seq += 1
    const content = textOf(m.content)
    let rowData = null
    if (role === "assistant" && Array.isArray(m.tool_calls) && m.tool_calls.length > 0) {
      rowData = {
        toolCalls: m.tool_calls.map((tc) => ({
          id: tc?.id ?? "",
          name: tc?.function?.name ?? "",
          args: tc?.function?.arguments ?? "",
        })),
      }
    } else if (role === "tool") {
      rowData = {
        toolCallId: m.tool_call_id ?? null,
        name: m.name ?? null,
        ok: !isToolFailureText(content),
        summary: capText(content, RESULT_SUMMARY_MAX),
      }
    }
    rows.push({ seq, role, content, data: rowData, createdAt: m.ts ?? null })
  }
  return rows
}

/** 首条真实用户消息（excerpt 源——≤40 字；无 ⇒ 空串）。`[System reminder:` 行按核读面单源
 *  `isRealUserMsg`（`thincoder-core/history-window.mjs`）同判跳过——提醒行不算首条用户消息。 */
function excerptOf(data) {
  const history = Array.isArray(data?.history) ? data.history : []
  for (const m of history) {
    if (m?.role !== "user") continue
    const text = textOf(m.content)
    if (text.startsWith("[System reminder:")) continue
    return capText(text, 40)
  }
  return ""
}

/**
 * 核回合驱动（会话读写 + 回合）。
 * @param {{env?: object, cwd?: string, core: object}} opts
 *   `core` = 核面束（生产 = `loadCore()`；测试 = 假件）——键：assembleAgent ∥ validateProvider ∥
 *   runAgent ∥ applySession ∥ saveSession ∥ loadSlotFile ∥ listSlots ∥ newSession ∥ setSlotPrefs ∥
 *   loadManifest ∥ slotPath ∥ loadConfig ∥ parseRelayPath ∥ parseSubagentEvent。
 */
export function createCoreRun({ env = process.env, cwd = process.env.TC_WORKSPACE_DIR ?? "/workspace", core }) {
  if (!core) throw new Error("createCoreRun: core bundle required")
  const loadConfig = () => withBoxProvider(core.loadConfig(), env)

  const sessionExists = (slot) => existsSync(core.slotPath(cwd, slot)) || Boolean(core.loadManifest(cwd)?.slots?.[slot])

  /** 槽事实（model/effort——源自槽文件本身；不可读 ⇒ null）。 */
  const slotFacts = (slot) => {
    try {
      const d = core.loadSlotFile(cwd, slot)
      if (!d) return null
      return { model: typeof d.activeModel === "string" ? d.activeModel : null, effort: Object.hasOwn(d, "effort") ? (d.effort ?? null) : null }
    } catch {
      return null
    }
  }

  /** 会话行（接口假设②）。 */
  const rowOf = (slot, { meta = null, runningSlot = null } = {}) => {
    const facts = slotFacts(slot)
    return {
      id: slot,
      model: facts?.model ?? null,
      reasoning: facts?.effort ?? null,
      status: runningSlot === slot ? "running" : "idle",
      excerpt: meta ? capText(String(meta.firstMessage ?? ""), 40) : "",
      updatedAt: meta?.updatedAt ?? null,
    }
  }

  return {
    cwd,

    /** 列表 = 核盘面实读投影（`listSlots`）。 */
    listSessions({ runningSlot = null } = {}) {
      const metas = core.listSlots(cwd) ?? []
      return metas.map((meta) => rowOf(meta.slot, { meta, runningSlot }))
    },

    /** 读史：槽文件 ⇒ { session, messages }；槽不存在 ⇒ null（入参槽号面 = `slot` 优先——服务器下行形）。 */
    readSession(sessionId, { runningSlot = null } = {}) {
      const slot = slotOf(sessionId)
      if (slot === null) return null
      const data = core.loadSlotFile(cwd, slot)
      if (!data && !sessionExists(slot)) return null
      const row = rowOf(slot, { runningSlot })
      row.excerpt = excerptOf(data)
      row.updatedAt = data?.updatedAt ?? row.updatedAt
      return { session: row, messages: projectMessages(data) }
    },

    /** 新建 = 核全新槽分配（`newSession`；模型缺省由 server 选定后随 `{ model }` 落槽）。 */
    async createSession({ model = null } = {}) {
      const slot = await core.newSession(cwd)
      if (model && !core.setSlotPrefs(cwd, slot, { provider: BOX_PROVIDER, model })) {
        throw new ShellError("write_failed", "会话模型写入失败")
      }
      return { id: slot }
    },

    /** 改（换模型/设档）：换模型 ⇒ 档位清 `null`（§3.4）；返回更新后行；槽不存在 ⇒ null。
     *  入参槽号面 = `slot`（服务器下行形——`member-routes.mjs`）∥ `sessionId`/`id` 兼容容错。
     *  **双携（model + reasoning）不由本档判**——设计侧 `gateway/API.md` 定「双携 ⇒ 400」由 server 门把守，
     *  盒侧再立第二判据 = 双源；本档按补丁序合成（`model` 先置 ⇒ `effort` 后写）。 */
    updateSession(args = {}) {
      const { model, reasoning } = args
      const slot = slotOf(args.slot ?? args.sessionId ?? args.id)
      if (slot === null || !sessionExists(slot)) return null
      const patch = {}
      if (typeof model === "string" && model !== "") {
        patch.provider = BOX_PROVIDER
        patch.model = model
        patch.effort = null
      }
      if (Object.hasOwn(args, "reasoning")) patch.effort = reasoning ?? null
      if (Object.keys(patch).length === 0) throw new ShellError("invalid_request", "至少需要一个字段（model ∥ reasoning）")
      if (!core.setSlotPrefs(cwd, slot, patch)) throw new ShellError("write_failed", "会话偏好写入失败")
      return { session: rowOf(slot) }
    },

    /**
     * 跑一回合：装配 ⇒ 施槽 ⇒ `runAgent`（帧回调 → onFrame）⇒ 落槽。
     * 返回 end 帧数据（{ status, reason?, durationMs, calls }）；`signal` 中止 ⇒ failed/aborted。
     */
    async runTurn({ sessionId, content, signal, onFrame = () => {} }) {
      const slot = slotOf(sessionId)
      if (slot === null) throw new ShellError("not_found", "会话不存在")
      const data = core.loadSlotFile(cwd, slot)
      if (!data && !sessionExists(slot)) throw new ShellError("not_found", "会话不存在")

      const agent = await core.assembleAgent({ cwd, deps: { loadConfig } })
      if (data) core.applySession(agent, data, { slot })
      agent._slot = slot // 钉槽（saveSession 认领面——沿 CLI D-3 先例）
      core.validateProvider(agent, agent.config)
      if (agent._providerInvalid) throw new ShellError("model_error", `模型未就绪：${agent._providerInvalidReason ?? "未知"}`)

      const started = Date.now()
      let calls = 0
      const callbacks = {
        onToken: (text) => {
          // 机器面剥离：relay 前缀 + `⟦ev⟧` 事件 token + `[model]` 元数据 token（同 ACP 桥判据）
          const path = core.parseRelayPath(text)
          const payload = path ? path.rest : String(text ?? "")
          if (!payload || /^\[model\]/.test(payload)) return
          if (core.parseSubagentEvent(payload)) return
          onFrame(deltaFrame(payload))
        },
        onToolCall: (name, args, id) => {
          calls += 1
          onFrame(callFrame({ id, name, args: JSON.stringify(args ?? {}) }))
        },
        onToolResult: (name, result, id) => {
          const contentText = typeof result === "string" ? result : String(result ?? "")
          onFrame(resultFrame({ id, ok: !isToolFailureText(contentText), summary: capText(contentText, RESULT_SUMMARY_MAX), content: contentText }))
        },
        onAgentTurn: (n) => onFrame(turnFrame(n)),
        onUsage: (usage) => onFrame(usageFrame(usage)),
      }

      let status = "succeeded"
      let reason
      let message
      try {
        await core.runAgent(agent, String(content ?? ""), callbacks, { signal })
      } catch (e) {
        status = "failed"
        if (signal?.aborted) {
          reason = "aborted"
          message = "已中止本回合"
        } else if (e?.name === "ContinueError") {
          reason = "budget"
          message = "本回合已超出预算（模型调用轮数上限）"
        } else {
          reason = "model_error"
          message = String(e?.message ?? e)
        }
      }
      try {
        core.saveSession(agent)
      } catch (e) {
        if (status === "succeeded") {
          status = "failed"
          reason = "save_failed"
          message = `会话保存失败：${e?.message ?? e}`
        }
      }
      return endFrame({ status, reason, message, durationMs: Date.now() - started, calls })
    },
  }
}

/** 生产核面束（仅入口调用——动态 import：包只在盒镜像内可解析，见档头）。 */
export async function loadCore() {
  const [agentMod, assembleMod, sessionMod, slotWriteMod, configMod, relayMod, subagentMod] = await Promise.all([
    import("@thincoder/core/agent.mjs"),
    import("@thincoder/core/agent/assemble.mjs"),
    import("@thincoder/core/session.mjs"),
    import("@thincoder/core/session-slot-write.mjs"),
    import("@thincoder/core/config.mjs"),
    import("@thincoder/core/agent/relay-prefix.mjs"),
    import("@thincoder/core/agent/subagent-event.mjs"),
  ])
  return {
    runAgent: agentMod.runAgent,
    assembleAgent: assembleMod.assembleAgent,
    validateProvider: assembleMod.validateProvider,
    applySession: sessionMod.applySession,
    saveSession: sessionMod.saveSession,
    loadSlotFile: sessionMod.loadSlotFile,
    listSlots: sessionMod.listSlots,
    newSession: sessionMod.newSession,
    loadManifest: sessionMod.loadManifest,
    slotPath: sessionMod.slotPath,
    setSlotPrefs: slotWriteMod.setSlotPrefs,
    loadConfig: configMod.loadConfig,
    parseRelayPath: relayMod.parseRelayPath,
    parseSubagentEvent: subagentMod.parseSubagentEvent,
  }
}
