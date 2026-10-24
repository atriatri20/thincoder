/**
 * mcp-tools.mjs — 盒内 MCP 桩件（`mcp/MCP.md` §6.1/§6.2；批 `2026-10-15-member-face-mcp`——台账 #1379 后半）
 *
 * 三面：取表（逐回合 `GET /api/box/mcp`——读时读、零缓存）∥ 建桩（核工具形 `{ name, description, parameters, readonly: false, execute }`）
 * ∥ 防撞（合并前扫「装配后基集 ∪ 既有注入件名集」——相撞 ⇒ **该件不挂 + 日志一条**，先者留存；对齐 `mcp/face.mjs` 同判）。
 *
 * 执行侧全在 server（本档只见 名/描述/参数——表原文零再加工）；桩 `execute(args, ctx)` ⇒ `POST /api/box/mcp/call`
 * （`ctx.signal` 透传 fetch——断连中止随传；§6.2）。失败降级（取表失败 ⇒ 出空表 + 日志一条——**回合不阻断**）；
 * 盒零会话态（无连接可管、无关闭链——生命周期归 server）。
 *
 * 缝/env（沿 `git-cred.mjs` `fetchCredential` 注入缝 ∥ `main` env 取值先例）：`fetchImpl` 注入缝（缺省 = 全局 fetch——测试假件）∥ 基址与键 = env
 * （`TC_SERVER_URL` ∥ `OPENAI_API_KEY`——工作区 key）∥ 超时 = `AbortSignal.timeout`（`ctx.signal` 在场 ⇒ `AbortSignal.any` 合流）。
 */
export const MCP_TOOLS_PATH = "/api/box/mcp"
export const MCP_CALL_PATH = "/api/box/mcp/call"

/** 桥调用超时（毫秒——沿 `git-cred.mjs` 同档）。 */
export const MCP_BRIDGE_TIMEOUT_MS = 15000

/** 中止合流（`ctx.signal` ∥ 超时——两源任一 ⇒ abort；无 `ctx.signal` ⇒ 仅超时）。 */
function mergedSignal(signal, timeoutMs) {
  const timeout = AbortSignal.timeout(timeoutMs)
  return signal ? AbortSignal.any([signal, timeout]) : timeout
}

/** 取表（`GET /api/box/mcp`）：出 = 表（`{ name, description, parameters }[]`）∥ `null`（env 缺 ∥ HTTP 非 2xx ∥ 网络/中止 ∥ 形非法）。 */
export async function fetchMcpToolTable({ baseUrl, apiKey, fetchImpl = globalThis.fetch, signal = null, timeoutMs = MCP_BRIDGE_TIMEOUT_MS } = {}) {
  const base = String(baseUrl ?? "").replace(/\/+$/, "")
  if (base === "" || !apiKey) return null
  try {
    const res = await fetchImpl(`${base}${MCP_TOOLS_PATH}`, {
      headers: { authorization: `Bearer ${apiKey}` },
      signal: mergedSignal(signal, timeoutMs),
    })
    if (!res?.ok) return null
    const data = await res.json()
    return Array.isArray(data?.tools) ? data.tools : null
  } catch {
    return null // 网络/中止/形异常 ⇒ 降级（调用侧记日志——本档不抛：回合不阻断）
  }
}

/** 建桩 + 防撞：`taken` = 装配后基集名 ∪ 既有注入件名集（先者留存）；相撞 ⇒ 该件不挂 + 日志一条（零静默）。 */
export function stubTools(table, { taken = new Set(), call, log = null } = {}) {
  const stubs = []
  for (const entry of Array.isArray(table) ? table : []) {
    const name = typeof entry?.name === "string" ? entry.name : ""
    if (name === "") continue
    if (taken.has(name)) {
      log?.warn?.(`[shell] MCP 件与既有工具名相撞——该件不挂（先者留存）：${name}`)
      continue
    }
    taken.add(name)
    stubs.push({
      name,
      description: typeof entry.description === "string" ? entry.description : `MCP tool: ${name}`,
      parameters: entry.parameters !== null && typeof entry.parameters === "object" ? entry.parameters : { type: "object", properties: {} },
      readonly: false, // 恒非只读（核 §6.3：逐调用吃权限门挡——MCP 零专属门）
      execute: (args, ctx = {}) => call(name, args, ctx),
    })
  }
  return stubs
}

/** 件工厂（`core-run.mjs` 消费——逐回合 `load`）：`env` = 基址/键源；`fetchImpl` = 测试缝；`log` = 降级/防撞日志面。 */
export function createMcpTools({ env = process.env, fetchImpl = globalThis.fetch, log = null, timeoutMs = MCP_BRIDGE_TIMEOUT_MS } = {}) {
  const baseUrl = String(env.TC_SERVER_URL ?? "").replace(/\/+$/, "")
  const apiKey = String(env.OPENAI_API_KEY ?? "")

  /** 调用桥（`POST /api/box/mcp/call`）：成 ⇒ `output`（缺 ⇒ `summary` 回落）；败 ⇒ 抛（模型见 `Error:` 人话——回合不停）。
   *  注：本函数只被建桩面调（`load` 成功 ⇒ env 基址/键已在位），故无 env 缺腿。 */
  async function call(name, args, ctx = {}) {
    let res
    try {
      res = await fetchImpl(`${baseUrl}${MCP_CALL_PATH}`, {
        method: "POST",
        headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
        body: JSON.stringify({ name, args: args ?? {} }),
        signal: mergedSignal(ctx?.signal ?? null, timeoutMs),
      })
    } catch (e) {
      throw new Error(`MCP 调用失败（${name}）：${e?.message ?? String(e)}`)
    }
    if (!res?.ok) throw new Error(`MCP 调用失败（${name}）：HTTP ${res?.status ?? "?"}`)
    let data
    try {
      data = await res.json()
    } catch {
      throw new Error(`MCP 调用失败（${name}）：响应形非法（非 JSON）`)
    }
    if (data?.ok === true) return typeof data.output === "string" ? data.output : String(data.summary ?? "")
    throw new Error(String(data?.message ?? data?.summary ?? `MCP 调用失败（${name}）`))
  }

  return {
    /** 取表并建桩（逐回合调用——零缓存）：失败 ⇒ 空表 + 日志一条（回合不阻断；工具面零 MCP 件）。 */
    async load({ taken = new Set(), signal = null } = {}) {
      const table = await fetchMcpToolTable({ baseUrl, apiKey, fetchImpl, signal, timeoutMs })
      if (table === null) {
        log?.warn?.("[shell] MCP 取表失败——跳过 MCP 面（回合不阻断）")
        return []
      }
      return stubTools(table, { taken, call, log })
    },
  }
}
