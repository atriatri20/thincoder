/**
 * member-tools.mjs — 盒内 server 域成员件（`agent/MEMBER-AGENT.md` §3.11(7) ∥ KD-SV-222——member-face-parity 批）
 *
 * 四件（动作集 = 写面同集 KD-SV-156）= `workspace_create` ∥ `workspace_start` ∥ `workspace_stop` ∥
 * `workspace_destroy`——**server 域**（动作全在 server：行/节点/卷/快照），盒侧只造核工具形并转发。
 *
 * 判权 = **工作区 key 第三门**（KD-SV-154 射程扩——`Authorization: Bearer <OPENAI_API_KEY>`：键 → 工作区 →
 * 负责人；作用域 = 本工作区）；端形 = `/api/me/sandbox/*`（建 ∥ `…/workspaces/:id/:action`——**本工作区**用
 * 自指 id `self`（server 第三门解析；见 `member-routes.mjs`））。`destroy` 恒携 `confirm: true` 语义（工具
 * 入参要求确认——盒侧不代填）。
 *
 * 拉仓 = **既有能力登记**（盒内核 `git` 工具 + git 凭据助手——不另立工具；KD-SV-222 收正）。
 *
 * 形 = 核工具形（`{ name, description, parameters, readonly: false, execute }`——同 `mcp-tools.mjs` 桩件族）；
 * `readonly: false` ⇒ 逐调用吃核权限门挡（`thincoder-core/agent/dispatch.mjs` `executeToolCalls`——审批卡/`autoApprove`
 * 全沿核语义；零专属门）。缝 = `fetchImpl` 注入（测试假件）∥ env 基址/键 ∥ `AbortSignal.timeout`（`ctx.signal`
 * 在场 ⇒ `AbortSignal.any` 合流——中止随断连/回合传播）。
 */
export const MEMBER_TOOL_NAMES = Object.freeze(["workspace_create", "workspace_start", "workspace_stop", "workspace_destroy"])

/** 本工作区自指 id（server 第三门解析——`member-routes.mjs` `workspaceOr404`）。 */
export const SELF_WORKSPACE_ID = "self"

/** 桥调用超时（毫秒——沿 `mcp-tools.mjs`/`git-cred.mjs` 同档）。 */
export const MEMBER_TOOL_TIMEOUT_MS = 15000

/** 中止合流（`ctx.signal` ∥ 超时——两源任一 ⇒ abort；无 `ctx.signal` ⇒ 仅超时）。 */
function mergedSignal(signal, timeoutMs) {
  const timeout = AbortSignal.timeout(timeoutMs)
  return signal ? AbortSignal.any([signal, timeout]) : timeout
}

/** 动作表（名 → 端形：`path` = 相对 `/api/me/sandbox`；`params` = 工具面 JSON Schema ∥ `body` = 入参取值面）。 */
const ACTIONS = Object.freeze({
  workspace_create: {
    summary: "创建一个新的工作区（本成员名下——受工作区数量上限约束）",
    path: "/workspaces",
    parameters: {
      type: "object",
      properties: { name: { type: "string", description: "工作区名（可缺省——缺省按「工作区 N」自动命名）" } },
    },
    body: (args) => (typeof args?.name === "string" && args.name.trim() !== "" ? { name: args.name.trim() } : {}),
  },
  workspace_start: {
    summary: "启动本工作区（盒已运行 ⇒ 幂等；未放置/节点不可用 ⇒ 人话失败）",
    path: `/workspaces/${SELF_WORKSPACE_ID}/start`,
    parameters: { type: "object", properties: {} },
    body: () => ({}),
  },
  workspace_stop: {
    summary: "停止本工作区（会话随卷恒留——再启动即回）",
    path: `/workspaces/${SELF_WORKSPACE_ID}/stop`,
    parameters: { type: "object", properties: {} },
    body: () => ({}),
  },
  workspace_destroy: {
    summary: "销毁本工作区（不可逆：含卷目录与快照——须显式确认）",
    path: `/workspaces/${SELF_WORKSPACE_ID}/destroy`,
    parameters: {
      type: "object",
      properties: { confirm: { type: "boolean", description: "确认销毁（true——不可逆，含卷目录与快照）" } },
      required: ["confirm"],
    },
    body: (args) => ({ confirm: args?.confirm === true }),
  },
})

/** 响应体 ⇒ 模型可见文本（成 ⇒ 人话 + JSON 读数；败 ⇒ 抛 `Error:` —— 沿 `mcp-tools.mjs` 同判）。 */
function resultTextOf(name, data) {
  const payload = data !== null && typeof data === "object" ? data : {}
  if (payload.ok === false) throw new Error(String(payload.error?.message ?? payload.message ?? `${name} 失败`))
  const workspace = payload.workspace
  if (workspace !== null && typeof workspace === "object") {
    return `${name} 完成：工作区 id=${workspace.id ?? "?"} 名=${workspace.name ?? "?"} 状态=${workspace.boxState ?? workspace.status ?? "?"}`
  }
  return `${name} 完成：${JSON.stringify(payload)}`
}

/** 件工厂（`core-run.mjs` 消费——装配期一次；`env` = 基址/键源；`fetchImpl` = 测试缝；`log` = 失败日志面）。 */
export function createMemberTools({ env = process.env, fetchImpl = globalThis.fetch, log = null, timeoutMs = MEMBER_TOOL_TIMEOUT_MS } = {}) {
  const baseUrl = String(env.TC_SERVER_URL ?? "").replace(/\/+$/, "")
  const apiKey = String(env.OPENAI_API_KEY ?? "")

  /** 单次调用（`POST /api/me/sandbox…`）：成 ⇒ 响应体对象；HTTP 非 2xx / 形非法 / 网络 ⇒ 抛（模型见 `Error:` 人话）。 */
  async function post(path, body, ctx = {}) {
    if (baseUrl === "" || apiKey === "") throw new Error("工作区未就绪（盒缺 TC_SERVER_URL/OPENAI_API_KEY——server 域工具不可用）")
    let res
    try {
      res = await fetchImpl(`${baseUrl}/api/me/sandbox${path}`, {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify(body ?? {}),
        signal: mergedSignal(ctx?.signal ?? null, timeoutMs),
      })
    } catch (e) {
      throw new Error(`server 域工具调用失败（${path}）：${e?.message ?? String(e)}`)
    }
    let data = null
    try {
      data = await res.json()
    } catch {
      data = null // 非 JSON 体（空体/错误页）——按状态码判
    }
    if (!res?.ok) {
      const message = data?.error?.message ?? data?.message ?? `HTTP ${res?.status ?? "?"}`
      throw new Error(`server 域工具调用失败（${path}）：${message}`)
    }
    void log
    return data
  }

  return MEMBER_TOOL_NAMES.map((name) => {
    const action = ACTIONS[name]
    return {
      name,
      description: `${action.summary}（成员本人资源自管——§3.11(7)）`,
      parameters: action.parameters,
      readonly: false, // 写类恒非只读（核权限门挡同吃——审批卡/autoApprove 沿核语义）
      execute: async (args, ctx = {}) => {
        const data = await post(action.path, action.body(args), ctx)
        return resultTextOf(name, data)
      },
    }
  })
}
