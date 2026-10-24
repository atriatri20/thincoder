/**
 * admin-tools.mjs — MCP 管面工具执行器（`agent/ADMIN-AGENT.md` §12.2 ∥ KD-SV-206/207；server-mcp-admin-tools 批——台账 #1425）：
 * 管理面**第九件工具 `mcp`**（五动词 `list ∥ add ∥ update ∥ remove ∥ probe`）——管理动作经会话内工具完成（「把智谱的 web 搜索接上」）；
 * 执行器独立成档（沿 `agent/docker-ops.mjs`/`agent/model-test.mjs` 先例）；并面点 = `agent/chat.mjs` `buildChatToolFace`
 * （第四面：`mergeToolFaces(chatTools, [envTools, mcpFace, mcpAdmin])`；面名 `mcp` 入 MCP 用面重名防御基线）。
 *
 * 复用面（零第二实现——§12.2② 引件表）：`store.mjs`（`listMcpServers` ∥ `insertMcpServer` ∥ `updateMcpServer` ∥ `removeMcpServer` ∥
 * `resolveProbeConfig` ∥ `mcpServerView`）＋ `face.mjs`（`closeMcpServer` ∥ `loadCoreMcp` ∥ `clearMcpCooldown`）——
 * 形校验 ∥ 编辑三态（缺席 = 不变 ∥ 显式 `null` = 清 ∥ 敏感键空串 = 不变）∥ 密文列 ∥ 探活体解析全转 store 单源；
 * 本档零自造 SQL ∥ 零第二加密 ∥ 零第二探活协议。**同形重复（不可共享——如实登记）**：探活调用 ＋ 读数归一
 * （`routes.mjs` 探活端点内联）与 `mcp_event` detail 三写入点（`routes.mjs` 增/改/删三端点的 `recordAudit` 内联、无导出）按本档**同形自建**
 * ——不抽共享件（抽件须动 routes，与 `routes.mjs` 零改声明相抵）。
 * 寻址（§12.2①）：`update` = `id`（`name` 键 = 改名——providers.update 同形）；`remove`/`probe` = `id ∥ name` 两形
 * （按名解析 = `listMcpServers` 视图按 `name` 取 `id`，其后全走既有导出）；未命中 ⇒ 工具级错误人话「先 mcp.list 查在册」。
 *
 * 凭据（§12.2③——只写零回显）：`token`/`headers`/`env` 可入参、永不回显（结果 = 视图——`hasSecrets` 布尔；`update` 出 `keys` 只键名）；
 * 本档零携值日志点（如记：只名/形）；掩蔽 = 键名表 `SENSITIVE_KEYS`（`chat.mjs`——`token` 等列名键 ⇒ `args` 落库/帧面 `***`）；
 * `headers`/`env` 袋内**非列名键**值 = 掩蔽面残余（本批零改掩蔽链——披露全文 = §12.2③）。
 * 审计（§12.2⑤——KD-SV-207①）：写动作（`add`/`update`/`remove`）⇒ `mcp_event` 三 kind 照落（detail 逐值同 `routes.mjs` 形——
 * `{kind,id,name,transport}` ∥ `{kind,id,name,keys}` ∥ `{kind,id,name}`；actor/actorId = 会话 actor）＋ 驱动层 `chat_call` 逐调用（**两行**）；
 * `list`/`probe` ⇒ 仅 `chat_call`（探活零落库零审计——沿 `routes.mjs` 口径）；`chat_call.subject` = null（本档结果零携 `subject`——管理族既有口径）。
 * 注入缝（§12.2②——键面与 routes/face 同源）：`deps.mcpProbeImpl`（探活替身——`routes.mjs` 同键）∥ `deps.mcpRemoveImpl`
 * （关会话替身——`face.mjs` 同键）；`?? null` 缺省 = 真件回落、生产零变。
 */
import { recordAudit } from "../accounts/audit.mjs"
import { clearMcpCooldown, closeMcpServer, loadCoreMcp } from "./face.mjs"
import { MCP_TRANSPORTS, insertMcpServer, listMcpServers, mcpServerView, removeMcpServer, resolveProbeConfig, updateMcpServer } from "./store.mjs"

/** 工具名（第九件——面名入 MCP 用面重名防御基线 `reservedNames`）。 */
export const MCP_ADMIN_TOOL_NAMES = Object.freeze(["mcp"])

/** 动词五（命名沿 providers 族；`probe` = 与端点 `POST /probe` ∥ 核 `probeMcpServer` 同词单源）。 */
export const MCP_ADMIN_OPS = Object.freeze(["list", "add", "update", "remove", "probe"])

/** 判类维（KD-SV-225——`mcp.list` 免（读类）；余四动词问（写类）；工具面单源）。 */
export function readonlyOf(name, args = {}) {
  return name === "mcp" && String(args?.op ?? "") === "list"
}

/** 十字段（`store.mjs` 单源——本档只做取舍搬运，零再校验）。 */
const MCP_FIELDS = Object.freeze(["name", "transport", "command", "args", "url", "wsUrl", "headers", "token", "env", "enabled"])

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

/**
 * 装配 `mcp` 工具（§12.2①）：`deps` = 注入面（`config` = 密文列解密键文件落点〔`credential-crypto` 单源〕＋ 两替身缝——见档头）；
 * `actor`/`actorId` = 会话 actor（`mcp_event` 归因——与 `chat_call` 同源）；`now` = 注入钟（store 时间戳 ∥ 审计 `ts`）。
 * `invoke(name, args, ctx)` 不抛（未知工具 ∥ 动词/形错/未命中 ⇒ `{ ok:false, message }`——工具级错误回灌模型自纠，回合不停）。
 */
export function createMcpAdminTools({ db, deps = {}, log = null, now = Date.now, actor = "admin", actorId = null } = {}) {
  if (!db) throw new Error("createMcpAdminTools：缺少 db（openDatabase 产物）")
  const config = deps.config ?? {}

  /** `mcp_event` 落行（三 kind——detail 逐值同 routes 形；零秘密：`keys` 只键名）。 */
  const auditMcpEvent = (detail) => recordAudit(db, { type: "mcp_event", actor, actorId, detail, ts: now() })

  /** 寻址（§12.2①——`id ∥ name` 两形 ⇒ id；按名解析 = 视图按 `name` 取 `id`〔零自造 SQL〕；未命中 ⇒ 工具级错误人话）。 */
  function resolveServerId(args) {
    const rawId = args.id
    if (rawId !== undefined && rawId !== null && rawId !== "") {
      const id = Number(rawId)
      if (!Number.isInteger(id)) throw new Error(`id 非法：${JSON.stringify(rawId)}（服务器 id = 数字；先 mcp.list 查在册）`)
      return id
    }
    const rawName = args.name
    if (rawName !== undefined && rawName !== null && String(rawName).trim() !== "") {
      const target = String(rawName).trim()
      const hit = listMcpServers(db).find((row) => row.name === target)
      if (!hit) throw new Error(`MCP 服务器不存在：${target}（先 mcp.list 查在册）`)
      return hit.id
    }
    throw new Error("须携 id 或 name（先 mcp.list 查在册）")
  }

  /** 字段取舍（十字段——值原样转 `store.mjs`；本档零再校验——形错/重名 ⇒ store 人话）。 */
  function pickFields(args) {
    const patch = {}
    for (const key of MCP_FIELDS) if (Object.hasOwn(args, key)) patch[key] = args[key]
    return patch
  }

  /** 删/停用 ⇒ 关会话（同 `routes.mjs` 生命周期——靶在 `face.mjs`；`deps.mcpRemoveImpl` 替身缝同键透传）。 */
  async function closeServer(name) {
    return await closeMcpServer(name, { deps, log })
  }

  // ── 五动词（§12.2①）──────────────────────────────────────────────────────────

  /** 清单（库序——视图零秘密：`hasSecrets` 布尔为唯一信号）。 */
  function listOp() {
    const servers = listMcpServers(db)
    return { ok: true, summary: `MCP 服务器 ${servers.length} 台（启用 ${servers.filter((row) => row.enabled).length}）`, servers }
  }

  /** 新增（形非法/重名 ⇒ store 人话 ⇒ 工具级错误、库零变；成 ⇒ 结果四键 + `mcp_event` `server_add`）。 */
  function addOp(args) {
    const view = mcpServerView(insertMcpServer(db, { ...pickFields(args), now, config }))
    auditMcpEvent({ kind: "server_add", id: view.id, name: view.name, transport: view.transport })
    return {
      ok: true,
      summary: `已新增 MCP 服务器 ${view.name}（#${view.id}——${view.transport}）`,
      id: view.id,
      name: view.name,
      transport: view.transport,
      hasSecrets: view.hasSecrets,
    }
  }

  /** 改（`id` 必填——`name` 键 = 改名；字段级三态/传输切换全在 store；停用 ⇒ 关闭该服务器会话）。 */
  async function updateOp(args) {
    if (args.id === undefined || args.id === null || args.id === "") {
      throw new Error("update 须携 id（id = 在册行；改名经 name 键——按名寻址不可改名；先 mcp.list 查在册）")
    }
    const { row, keys } = updateMcpServer(db, resolveServerId(args), pickFields(args), { now, config })
    if (keys.includes("enabled") && row.enabled === 0) await closeServer(row.name) // 停用 ⇒ 关会话（判定同 routes）
    const view = mcpServerView(row)
    auditMcpEvent({ kind: "server_update", id: view.id, name: view.name, keys }) // `keys` = 变更键名（值永不入）
    return {
      ok: true,
      summary: `已更新 MCP 服务器 ${view.name}（#${view.id}——变更键：${keys.length === 0 ? "无" : keys.join(" ∥ ")}）`,
      id: view.id,
      name: view.name,
      keys,
    }
  }

  /** 删（硬删——providers 先例；成 ⇒ 关闭该服务器会话 + `mcp_event` `server_remove`）。 */
  async function removeOp(args) {
    const row = removeMcpServer(db, resolveServerId(args))
    await closeServer(row.name)
    auditMcpEvent({ kind: "server_remove", id: row.id, name: row.name })
    return { ok: true, summary: `已删除 MCP 服务器 ${row.name}（#${row.id}）`, id: row.id, name: row.name }
  }

  /** 探活读数归一（§12.2①——成 ⇒ 清冷却；零副作用：不动库 ∥ 零 `mcp_event`；**读数恒 `ok:true`**——探活不可达 = 读数 ≠ 工具失败，沿 `models.test` 同判）。 */
  function probeResult(name, outcome) {
    const result = isPlainObject(outcome) ? outcome : {}
    if (result.ok === true) {
      if (typeof name === "string") clearMcpCooldown(name) // 探活成功 ⇒ 清冷却（§2.2——同 routes）
      const toolCount = Number.isInteger(result.toolCount) ? result.toolCount : 0
      const latencyMs = Number.isFinite(result.latencyMs) ? result.latencyMs : 0
      return { ok: true, summary: `探活成功：${name}——工具 ${toolCount} 个（${latencyMs} ms）`, probe: { ok: true, toolCount, latencyMs } }
    }
    const error = typeof result.error === "string" && result.error !== "" ? result.error : String(result.error ?? "探活失败")
    return { ok: true, summary: `探活失败：${name}——${error}`, probe: { ok: false, error } }
  }

  /** 探活（对象 = 库内行——草稿试连 = 控制台新建窗面；核件装载同 routes 口径——缺核 ⇒ 自含错误）。 */
  async function probeOp(args) {
    const probeConfig = resolveProbeConfig(db, { id: resolveServerId(args) }, { config })
    let impl = deps.mcpProbeImpl ?? null
    if (impl === null) {
      try {
        impl = (await loadCoreMcp()).probeMcpServer
      } catch (e) {
        log?.warn?.("mcp_probe_core_missing", { message: e?.message ?? String(e) }) // 零携值（只 message——沿 routes 同键）
        impl = null
      }
    }
    if (impl === null) {
      return probeResult(probeConfig.name, { ok: false, error: "MCP 探活不可用：@thincoder/core 未装载（核件缺失——生产镜像内核为声明依赖）" })
    }
    let outcome
    try {
      outcome = await impl(probeConfig)
    } catch (e) {
      outcome = { ok: false, error: e?.message ?? String(e) } // 替身/意外抛错 ⇒ 自含读数（200 同判）
    }
    return probeResult(probeConfig.name, outcome)
  }

  /** 工具调用入口（不抛——未知工具/动词/形错/未命中 ⇒ `{ ok:false, message }`；回合不停）。 */
  async function invoke(name, args = {}) {
    try {
      if (name !== "mcp") return { ok: false, message: `未知工具：${String(name)}（${MCP_ADMIN_TOOL_NAMES.join(" ∥ ")}）` }
      const params = isPlainObject(args) ? args : {}
      const op = params.op === undefined || params.op === null || params.op === "" ? null : String(params.op)
      if (op === null) return { ok: false, message: `缺 op（mcp 的动词：${MCP_ADMIN_OPS.join(" ∥ ")}）` }
      if (op === "list") return listOp()
      if (op === "add") return addOp(params)
      if (op === "update") return await updateOp(params)
      if (op === "remove") return await removeOp(params)
      if (op === "probe") return await probeOp(params)
      return { ok: false, message: `未知 mcp 动词：${String(op)}（${MCP_ADMIN_OPS.join(" ∥ ")}）` }
    } catch (e) {
      return { ok: false, message: e?.message ?? String(e) } // 工具级错误人话（回灌模型自纠）
    }
  }

  /** schema（§12.2④——两义同叙：可管清单 ∥ 已配服务器工具随回合可用；含凭据指引句「只入库、永不回显；优先 ${env:VAR}」）。 */
  const schema = {
    type: "function",
    function: {
      name: "mcp",
      description: [
        `MCP 服务器清单管理（控制台 MCP 页同函数——保存即生效）。动词：${MCP_ADMIN_OPS.join(" ∥ ")}。`,
        `list 出清单（零凭据——只 hasSecrets 布尔）；add ⟮name,transport,command?/args? ∥ url? ∥ wsUrl?,headers?,token?,env?,enabled?⟯；`,
        `update ⟮id + 字段级：字段缺席 = 不变 ∥ 显式 null = 清 ∥ 敏感键空串 = 不变⟧（改名经 name——须携 id）；删/停用会关闭该服务器会话；`,
        `remove ⟮id ∥ name⟧；probe ⟮id ∥ name⟧ 对库内行探活（零副作用——不进会话 ∥ 不动库；草稿试连请用控制台 MCP 页）。`,
        `已配置且启用的服务器：其工具随回合并入工具面，可直接调用。`,
        `凭据（token ∥ headers ∥ env）：只入库、永不回显——优先用 \${env:VAR} 引用环境变量；未命中/形错 ⇒ 报错（先 mcp.list 查在册）。`,
      ].join(""),
      parameters: {
        type: "object",
        properties: {
          op: { type: "string", enum: MCP_ADMIN_OPS, description: "动词" },
          id: { type: "number", description: "服务器 id（update 必填；remove ∥ probe 可选——与 name 二择一）" },
          name: { type: "string", description: "服务器名（add：名（全服唯一）；update：改名〔须携 id〕；remove ∥ probe：按名寻址；list 无涉）" },
          transport: { type: "string", enum: MCP_TRANSPORTS, description: "传输（add 必填 ∥ update 可切换——本传输必填项须补齐：stdio=command ∥ http=url ∥ ws=wsUrl）" },
          command: { type: "string", description: "stdio：可执行命令" },
          args: { type: "array", items: { type: "string" }, description: "stdio：命令参数" },
          url: { type: "string", description: "http：端点地址" },
          wsUrl: { type: "string", description: "ws：端点地址" },
          headers: { type: "object", description: "http ∥ ws：请求头（凭据只入库、永不回显）" },
          token: { type: "string", description: "http ∥ ws：Bearer 令牌（只入库、永不回显；优先 ${env:VAR} 引用）" },
          env: { type: "object", description: "stdio：环境变量（只入库、永不回显）" },
          enabled: { type: "boolean", description: "启用位（缺省 true；改 false 会关闭该服务器会话）" },
        },
        required: ["op"],
      },
    },
  }

  return { names: MCP_ADMIN_TOOL_NAMES, ops: MCP_ADMIN_OPS, schemas: [schema], readonlyOf, invoke }
}
