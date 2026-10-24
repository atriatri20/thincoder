/**
 * face.mjs — MCP 工具面装配（`mcp/MCP.md` §2.2 ∥ §4；server-mcp 批——台账 #1379）：
 * 逐回合读清单（enabled 行）⇒ 核 `connectMcpServer` 建连 ⇒ 工具并入（`{ names, schemas, invoke }`——与环境族同形；KD-SV-199 读时读）；
 * 失败降级（跳过 + 日志一条——回合不阻断）∥ 失败冷却（进程内 60s——防死服务器每回合拖慢装配至核 `INIT_TIMEOUT_MS`）∥
 * 跨面重名防御（静态两面 ∪ MCP 面既往件名集——相撞 ⇒ 该件（后到者）不挂 + 日志一条，先者留存）∥ 关闭出口（核 `removeMcpTools`/`closeAllMcp`——本档持最近工具表为靶）。
 *
 * 结果归一（沿 KD-SV-113 四字段）：`{ ok, subject, summary, output }`——`ok` = 调用完成（MCP 报错 ⇒ 核件抛 ⇒ `ok:false` + 人话 message）；
 * `subject` = 服务器名（核 `_mcpName`——审计主语）；`output` = 核件文本（模型可见形经会话面 ≤4000 字截断——单源在 `chat.mjs`）。
 * 注入缝（单元测试档；缺省 null = 生产零变）：`deps.mcpConnectImpl`（建连替身——沿 `deps.execImpl` 先例）∥ `deps.mcpProbeImpl`
 * （探活替身——消费面 = `routes.mjs`）∥ `deps.mcpCloseImpl`（关闭替身——停机收尾）。缺核 ⇒ MCP 面不挂载 + 一条警告（回合不阻断——沿 §17.3 缺核降级共轨）。
 * 零第二实现（§4）：协议握手 ∥ 三传输 ∥ 工具命名 ∥ 重连/退避 ∥ 输出截断 ∥ 结果提取全在核件；本档只做 清单行 → 核 config 形映射（`store.mjs`）＋ 工具面归一 ＋ 冷却 ＋ 重名防御。
 * **本档只消费 `deps.config`（密文列解密键文件落点）——不写库、不写审计。**
 */
import { listEnabledMcpServers, toCoreConfig } from "./store.mjs"

/** 失败冷却窗（进程内——§2.2：60s；核 `INIT_TIMEOUT_MS` = 30s ⇒ 冷却防每回合重握手）。 */
export const MCP_COOLDOWN_MS = 60_000

/** 核件模块缓存（懒载——沿 `loadCoreChat` 先例；失败缓存零重试）。 */
let coreMcpCache = null
let coreMcpError = null

/** 建连失败表（name → failedAt——进程内；重启清零，与核 `_sessions` 同判）。 */
const connectFailures = new Map()

/** 最近工具表（服务器名 → 核件工具列——关闭靶；跨回合留存：服务器被跳过/停用后其会话仍须可收口）。 */
const latestByServer = new Map()

let warnedDegraded = false

/** 核 MCP 面装载（`connectMcpServer` ∥ `probeMcpServer` ∥ `removeMcpTools` ∥ `closeAllMcp`——缺件/缺核 ⇒ 抛）。 */
export async function loadCoreMcp() {
  if (coreMcpCache !== null) return coreMcpCache
  if (coreMcpError !== null) throw coreMcpError
  try {
    const mod = await import("@thincoder/core/mcp.mjs")
    const missing = ["connectMcpServer", "probeMcpServer", "removeMcpTools", "closeAllMcp"].filter((name) => typeof mod[name] !== "function")
    if (missing.length > 0) throw new Error(`核件缺件：${missing.join(" ∥ ")}（@thincoder/core/mcp.mjs 装载不完整）`)
    coreMcpCache = mod
    return mod
  } catch (e) {
    coreMcpError = e
    throw e
  }
}

/** 缺核退化警告（模块级旗——一进程一条；出 = 本条是否发出；用法同 `noteEnvToolsDegraded` 先例）。 */
export function noteMcpDegraded(log = null, error = null) {
  if (warnedDegraded === true) return false
  warnedDegraded = true
  log?.warn?.("chat_mcp_core_missing", {
    cause: error === null ? null : String(error?.message ?? error),
    message: "MCP 面不可用：@thincoder/core 未装载——MCP 面不挂载（管理会话照跑；生产镜像内核为声明依赖）",
  })
  return true
}

/** 冷却判（窗内 ⇒ true——该服务器零连接尝试）。 */
export function isMcpCoolingDown(name, stamp) {
  const failedAt = connectFailures.get(name)
  return typeof failedAt === "number" && stamp - failedAt < MCP_COOLDOWN_MS
}

/** 清冷却（建连成功 ∥ 探活成功——§2.2）。 */
export function clearMcpCooldown(name) {
  connectFailures.delete(name)
}

/** 核件工具 → OpenAI schema（三字段直取——名/描述/参数原文；`readonly` 等核件面不随 schema 出）。 */
function schemaOf(tool) {
  return {
    type: "function",
    function: {
      name: tool.name,
      description: typeof tool.description === "string" ? tool.description : `MCP tool: ${tool.name}`,
      parameters: tool.parameters !== null && typeof tool.parameters === "object" ? tool.parameters : { type: "object", properties: {} },
    },
  }
}

/**
 * 工具面装配（§2.2 面形）：`deps` = 注入面（三缝 + `config`）；`reservedNames` = 合并前静态两面名集（管理 ∥ 环境——重名防御基线）。
 * 出 = `{ names, schemas, invoke }` ∥ `null`（清单空 ∥ 全部被冷却跳过——不挂载）；核件缺 ⇒ 抛（调用侧降级为不挂载 + 警告）。
 * `invoke(name, args, ctx)` 不抛（未知件 ∥ 核件抛错 ⇒ `{ ok:false, … }`——回合不停；`ctx.signal` 透传核件）。
 */
export async function createMcpToolFace({ db, deps = {}, log = null, now = Date.now, reservedNames = [] } = {}) {
  if (!db) throw new Error("createMcpToolFace：缺少 db（openDatabase 产物）")
  const rows = listEnabledMcpServers(db)
  if (rows.length === 0) return null
  const connect = deps.mcpConnectImpl ?? (await loadCoreMcp()).connectMcpServer
  const stamp = now()
  const due = rows.filter((row) => !isMcpCoolingDown(row.name, stamp)) // 冷却窗内：零连接尝试
  const settled = await Promise.allSettled(due.map(async (row) => connect(toCoreConfig(row, { config: deps.config ?? {} }))))
  const taken = new Set(reservedNames) // 重名防御基线（静态两面 ∪ MCP 面既往件名集——先者留存）
  const names = []
  const schemas = []
  const byName = new Map()
  settled.forEach((result, index) => {
    const row = due[index]
    if (result.status === "rejected") {
      connectFailures.set(row.name, now()) // 冷却起点（该回合起算）
      log?.warn("mcp_connect_failed", { server: row.name, message: result.reason?.message ?? String(result.reason) })
      return
    }
    clearMcpCooldown(row.name)
    const coreTools = Array.isArray(result.value) ? result.value : []
    latestByServer.set(row.name, coreTools) // 关闭靶（本服务器最新一批——含因重名未挂者）
    for (const tool of coreTools) {
      const name = typeof tool?.name === "string" ? tool.name : ""
      if (name === "") continue
      if (taken.has(name)) {
        log?.warn("mcp_tool_name_collision", { server: row.name, tool: name, message: `MCP 工具名相撞——该件不挂（先者留存）：${name}` })
        continue
      }
      taken.add(name)
      names.push(name)
      schemas.push(schemaOf(tool))
      byName.set(name, { tool, server: typeof tool._mcpName === "string" && tool._mcpName !== "" ? tool._mcpName : row.name })
    }
  })
  if (names.length === 0) return null
  /** 工具调用入口（不抛——见档头）。 */
  async function invoke(name, args = {}, ctx = {}) {
    const entry = byName.get(name)
    if (!entry) {
      const message = `未知 MCP 工具：${String(name)}`
      return { ok: false, subject: "", summary: message, message }
    }
    try {
      const params = args !== null && typeof args === "object" && !Array.isArray(args) ? args : {}
      const output = await entry.tool.execute(params, { signal: ctx?.signal })
      return { ok: true, subject: entry.server, summary: `MCP 调用完成（${entry.server}）`, output: typeof output === "string" ? output : JSON.stringify(output ?? null) }
    } catch (e) {
      const message = `MCP 调用失败（${entry.server}）：${e?.message ?? String(e)}`
      return { ok: false, subject: entry.server, summary: message, message } // 工具级错误回灌（回合不停）
    }
  }
  /** 判类维（KD-SV-225——MCP 件恒写类：核件 `readonly:false`，逐件同成员面——`true` = 读类 ∥ `false` = 写类）。 */
  function readonlyOf() {
    return false
  }

  return { names, schemas, readonlyOf, invoke }
}

/** 关闭靶快照（核 `agent` 参形——持 `tools` 数组的对象；核 `removeMcpTools`/`closeAllMcp` 单源入参）。 */
function closeTarget() {
  return { tools: [...latestByServer.values()].flat() }
}

/** 单服务器会话关闭（删行/停用 ⇒ `routes.mjs` 调用；核 `removeMcpTools`——零自造关闭链）。
 *  关闭靶 = 该服务器件表（**先取靶后清表**——取靶依赖 `latestByServer`，清表先于取靶 = 靶空 ⇒ 会话不关）；
 *  `deps.mcpRemoveImpl` = 单服务器关闭替身缝（单元测试档——断言靶含目标件；缺省 = 核真件）。
 *  核件缺 ∥ 无该服务器工具（含**零工具服务器**——核件关闭判据 `_mcpName` 需有件命中）⇒ 零动作（`false`——
 *  零工具服务器的会话收口面 = 已知边界，见交付报告与 §5 披露）。 */
export async function closeMcpServer(serverName, { deps = {}, log = null } = {}) {
  const name = typeof serverName === "string" ? serverName : ""
  if (name === "") return false
  const tools = latestByServer.get(name) ?? null
  latestByServer.delete(name)
  connectFailures.delete(name)
  if (tools === null || tools.length === 0) return false
  let remove = deps.mcpRemoveImpl ?? null
  if (remove === null) {
    let mod = coreMcpCache
    if (mod === null) {
      try {
        mod = await loadCoreMcp()
      } catch (e) {
        log?.warn("mcp_close_core_missing", { server: name, message: e?.message ?? String(e) })
        return false
      }
    }
    remove = mod.removeMcpTools
  }
  try {
    remove({ tools: [...tools] }, name) // 靶 = 该服务器件表（已快照）——核件逐件 `_mcpName === name` 关会话
    return true
  } catch (e) {
    log?.warn("mcp_close_failed", { server: name, message: e?.message ?? String(e) })
    return false
  }
}

/** 停机收尾（`bin/thincoder-server.mjs` 停机路径调用——stdio 子进程（POSIX `detached`）不随父进程自然退出，须显式杀树；
 *  核 `closeAllMcp`——`deps.mcpCloseImpl` 替身缝（单元测试档；缺省 = 真件）；核件缺 ∥ 无工具 ⇒ 零动作（`false`）。 */
export function closeMcpConnections({ deps = {}, log = null } = {}) {
  const target = closeTarget()
  latestByServer.clear()
  connectFailures.clear()
  const impl = deps.mcpCloseImpl ?? coreMcpCache?.closeAllMcp ?? null
  if (impl === null) return false
  try {
    impl(target)
    return true
  } catch (e) {
    log?.warn("mcp_close_failed", { message: e?.message ?? String(e) })
    return false
  }
}
