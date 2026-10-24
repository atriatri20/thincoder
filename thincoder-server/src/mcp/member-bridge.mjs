/**
 * member-bridge.mjs — 成员面 MCP 桥（`mcp/MCP.md` §6.2 ∥ `gateway/API.md` §2.12；批 `2026-10-15-member-face-mcp`——台账 #1379 后半）：
 * 盒族两端点——`GET /api/box/mcp`（工具表：名/描述/参数——**零秘密**）∥ `POST /api/box/mcp/call`（体 `{ name, args }` ⇒ 调用结果）。
 *
 * 执行侧 = `face.mjs` 单源（`createMcpToolFace`——连接/命名/冷却/重名防御全在件；**两请求各建面一次**：核 `_sessions` 幂等
 * ⇒ 存活命中直取缓存工具）；本档只做 表形映射（面 schema ⇒ 三字段）＋ 中止接线（请求断连 ⇒ AbortController ⇒ `invoke` 的
 * `ctx.signal` ⇒ 核件 `sendWithSignal`）。秘密零出服务器（密文列解出只在 server 侧建连用——响应体只携名/描述/参数）。
 *
 * 判权/体读沿族：工作区 key 门（第二门——`boxWorkspaceOf`）由注册侧注入（零循环依赖）；`readJsonBody` 同源。
 * 错误面：面装配失败（缺核等）⇒ 抛（gateway ⇒ 500；盒侧降级 = 跳过 MCP 面 + 日志一条——§6.1）；
 * 调用级失败（未知件 ∥ 冷却中 ∥ 核件抛）⇒ 200 自含 `ok:false`（沿探活先例——`ok:false` 仍 200）。
 */
import { sendJson } from "../gateway/errors.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { createMcpToolFace } from "./face.mjs"

/** 工具表（面 schema ⇒ `{ name, description, parameters }` 三字段直取——§6.2 零秘密形）。 */
function toolTableOf(face) {
  if (face === null) return []
  return face.schemas.map(({ function: fn }) => ({ name: fn.name, description: fn.description, parameters: fn.parameters }))
}

/** 面装配（两处理器共用；`deps.config` = 密文列解密键文件落点——`face.mjs` 单源入参；`deps` 余键 = 单元测试缝）。 */
function faceOf({ db, config, deps, log, now }) {
  return createMcpToolFace({ db, deps: { ...deps, config }, log, now })
}

/** 响应（断连后零写——沿 `chat-routes.mjs` 同判：对已断连接写响应零意义，且防套接字晚错反噬回合）。 */
function respond(res, payload) {
  if (res.writableEnded || res.destroyed) return false
  return sendJson(res, 200, payload)
}

/** 工具表处理器（`GET /api/box/mcp`——盒逐回合取表；清单空 ∥ 全部冷却跳过 ⇒ `{ tools: [] }`）。 */
export function boxMcpListHandler({ db, config = {}, deps = {}, log = null, now = Date.now, workspaceOf } = {}) {
  if (!db) throw new Error("boxMcpListHandler：缺少 db")
  if (typeof workspaceOf !== "function") throw new Error("boxMcpListHandler：缺少 workspaceOf（工作区 key 门）")
  return async (req, res) => {
    workspaceOf(db, req) // 第二门（工作区 key——族同门；吊销/非工作区键 ⇒ 401）
    respond(res, { tools: toolTableOf(await faceOf({ db, config, deps, log, now })) })
  }
}

/** 调用处理器（`POST /api/box/mcp/call`——`{ name, args }` ⇒ `{ ok, subject, summary, output?, message? }`；`args` 原文转核件）。
 *  请求断连 ⇒ 中止上游（AbortController ⇒ `invoke` 的 `ctx.signal` 透传核件；响应已发完的 close 不触）。 */
export function boxMcpCallHandler({ db, config = {}, deps = {}, log = null, now = Date.now, workspaceOf } = {}) {
  if (!db) throw new Error("boxMcpCallHandler：缺少 db")
  if (typeof workspaceOf !== "function") throw new Error("boxMcpCallHandler：缺少 workspaceOf（工作区 key 门）")
  return async (req, res) => {
    workspaceOf(db, req)
    const body = await readJsonBody(req)
    const name = typeof body?.name === "string" ? body.name : ""
    const controller = new AbortController()
    const onClose = () => {
      if (!res.writableEnded) controller.abort() // 半途断连 ⇒ 中止上游（零静默：上游结果不落任何面）
    }
    res.on("close", onClose)
    try {
      const face = await faceOf({ db, config, deps, log, now })
      if (face === null) {
        const message = `MCP 工具不可用（无启用服务器或全部冷却中）：${name}`
        respond(res, { ok: false, subject: "", summary: message, message })
        return
      }
      respond(res, await face.invoke(name, body?.args ?? {}, { signal: controller.signal }))
    } finally {
      res.off("close", onClose)
    }
  }
}
