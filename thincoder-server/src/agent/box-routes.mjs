/**
 * box-routes.mjs — 盒接入面（`gateway/API.md` §2.12 ∥ `agent/MEMBER-AGENT.md` §3.3；KD-SV-153/154）：盒**出向**五端点
 * ——`GET /api/box/events`（SSE 下行）∥ `POST /api/box/sessions/:id/turns`（流式 NDJSON 体——纯转发）∥
 * `POST /api/box/commands/:cmdId/result`（命令结果）∥ `POST /api/box/ping`（保活应答 ⇒ 204）∥ `POST /api/box/credential`（git 凭据取件）。
 *
 * 判权 = **每工作区 key**（`Authorization: Bearer`——与 `/v1` 同校验单源 `verifyKey`；键 → `sandbox_workspaces.key_id` 行 →
 * 工作区 + 负责人；吊销 ⇒ 401 即断）。**连接发起方恒为盒**（server 零拨盒路径——AC-50③ 判据）。
 * 体读：`turns` = 流式逐行（路由级例外——`server.mjs` 随正；不经通用整段 JSON 体门）；`call.args`/结果摘要转发前
 * 按管理面同源常量截断（≤500 ∥ ≤300——`member-relay.mjs`）。密值零回显零日志（凭据取件）。
 */
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { readJsonBody, readStreamBody } from "../gateway/server.mjs"
import { verifyKey } from "../accounts/keys.mjs"
import { credentialForHost } from "./member-cred.mjs"

/** 工作区 key 判权（第二门——`/api/box/*`）：键 → 工作区行（吊销 ⇒ 401 即断；非工作区键同判无效）。 */
export function boxWorkspaceOf(db, req) {
  const match = /^Bearer\s+(.+)$/i.exec(String(req.headers.authorization ?? ""))
  const auth = match ? verifyKey(db, match[1].trim()) : null
  if (!auth) throw new HttpError("invalid_api_key", "无效的工作区 key（Authorization: Bearer <工作区 key>）")
  const workspace = db.prepare("SELECT * FROM sandbox_workspaces WHERE key_id = ?").get(auth.keyId)
  if (!workspace) throw new HttpError("invalid_api_key", "无效的工作区 key（非工作区凭据）")
  return workspace
}

/** 会话引用解析（`:id` = 复合形 `<workspaceId>:<槽号>` ∥ 裸槽号两形）：会话 ∉ 本工作区 ⇒ null（调用侧 404）。 */
export function sessionRefOf(raw, workspace) {
  const text = String(raw ?? "")
  const cut = text.indexOf(":")
  if (cut < 0) return text === "" ? null : { slot: text } // 裸槽号（盒自持 id 空间——服务器零语义）
  const workspaceId = Number(text.slice(0, cut))
  const slot = text.slice(cut + 1)
  if (workspaceId !== Number(workspace.id) || slot === "") return null
  return { slot }
}

/** NDJSON 逐行拆帧器（流式体——跨块残行缓冲）：`push(chunk)` ⇒ 本轮完整行数组 ∥ `flush()` ⇒ 末行（无换行）。 */
export function createLineReader() {
  let buffer = ""
  return {
    push(chunk) {
      buffer += chunk.toString("utf8")
      const lines = []
      let index
      while ((index = buffer.indexOf("\n")) >= 0) {
        lines.push(buffer.slice(0, index))
        buffer = buffer.slice(index + 1)
      }
      return lines
    },
    flush() {
      const rest = buffer
      buffer = ""
      return rest
    },
  }
}

/** 注册盒接入面（五端点）。注入口径 = `deps`（单元测试档替身——透传无用项为零）；`relay` = `member-relay.mjs` 实例。 */
export function registerBoxRoutes(routes, { db, config = {}, log = null, relay, now = Date.now, deps = {} } = {}) {
  if (!db) throw new Error("registerBoxRoutes：缺少 db")
  if (!relay) throw new Error("registerBoxRoutes：缺少 relay（createMemberRelay 产物）")

  // 下行 SSE（盒发起、单连接——新连接顶旧连接）：`hello` ⇒ `run`/`abort`/`pull`/`cmd`/`ping` 事件流。
  routes.add("GET", "/api/box/events", (req, res) => {
    const workspace = boxWorkspaceOf(db, req)
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-store",
      Connection: "keep-alive",
    })
    res.on("error", () => { /* 断连不炸——掉线径收尾 */ })
    const attached = relay.attach(workspace, res)
    res.on("close", () => relay.detach(workspace.id, attached.token)) // 本连接关 ⇒ 掉线径（令牌判——不触新连接）
  })

  // 上行：回合流（流式 NDJSON 体：`begin { cmdId }` ⇒ 六帧词表 ⇒ `end`——**纯转发零落库**）。
  routes.add("POST", "/api/box/sessions/:id/turns", async (req, res, ctx) => {
    const workspace = boxWorkspaceOf(db, req)
    const target = sessionRefOf(ctx.params.id, workspace)
    if (target === null) throw new HttpError("not_found", `会话不属于本工作区：${ctx.params.id}`)
    const reader = createLineReader()
    let turn = null
    let began = false
    let claimed = false // 体自称了回合（即便对位失败）——拒绝径不回收在途态（零副作用）
    const handleLine = (line) => {
      if (line.trim() === "") return
      let frame
      try {
        frame = JSON.parse(line)
      } catch {
        throw new HttpError("invalid_request_error", `turns 体非合法 NDJSON：${line.slice(0, 120)}`)
      }
      if (!began) {
        if (frame?.type !== "begin") throw new HttpError("invalid_request_error", "turns 体首帧须为 begin（`{ \"type\": \"begin\", \"cmdId\": … }`）")
        began = true
        claimed = true
        const found = relay.turnOf(frame.cmdId)
        if (!found || found.workspaceId !== Number(workspace.id) || String(found.sessionId) !== String(target.slot)) {
          throw new HttpError("not_found", `回合不在途（cmdId 未知 ∥ 会话不符）：${String(frame.cmdId)}`)
        }
        turn = found
        return
      }
      relay.feedTurn(turn.cmdId, frame) // 已了结 ⇒ 余帧忽略（零副作用）
    }
    let failure = null
    try {
      await readStreamBody(req, {
        onChunk: (chunk) => {
          for (const line of reader.push(chunk)) handleLine(line)
        },
      })
      const rest = reader.flush()
      if (rest.trim() !== "") handleLine(rest)
      if (!began) throw new HttpError("invalid_request_error", "turns 体缺 begin 帧")
    } catch (e) {
      failure = e // 体异常不得洩在途态（回合登记不回收 ⇒ 工作区级门恒闭）——统一由 finally 收口
    } finally {
      // 体从未自称回合（首帧缺 begin / 行非 JSON）⇒ 按工作区 + 槽号取在途回合收口（在途态残留 = 工作区级门恒闭）；
      // `begin` 对位失败径（`:98`）则零副作用——不回收（未知 cmdId / 会话不符 = 拒绝该流，不动在途回合）
      const active = turn ?? (claimed ? null : relay.turnOfSession(workspace.id, target.slot))
      if (active !== null) relay.finishTurnStream(active.cmdId) // 无 `end` 帧收口 ⇒ 按失败收尾（如实补帧——幂等）
    }
    if (failure !== null) throw failure
    sendJson(res, 200, { ok: true })
  })

  // 上行：命令结果（拉仓成/败；读/管理指令回呈——`detail` 形按 kind）：未知/已了结 ⇒ 400 零副作用。
  routes.add("POST", "/api/box/commands/:cmdId/result", async (req, res, ctx) => {
    const workspace = boxWorkspaceOf(db, req)
    const body = await readJsonBody(req)
    const accepted = relay.completeCommand(ctx.params.cmdId, {
      state: typeof body?.state === "string" && body.state !== "" ? body.state : "done",
      detail: body?.detail ?? null,
      workspaceId: Number(workspace.id),
    })
    if (!accepted) throw new HttpError("invalid_request_error", `未知或已了结的 cmdId：${ctx.params.cmdId}`)
    sendJson(res, 200, { ok: true })
  })

  // 上行：保活应答（收 `ping` 即回）：体 `{ t }` ⇒ 204（值回显窗——在线判据取数面）。
  routes.add("POST", "/api/box/ping", async (req, res) => {
    const workspace = boxWorkspaceOf(db, req)
    await readJsonBody(req).catch(() => ({})) // 体值只用于回显窗判定（本面无回显）——形不卡保活
    relay.notePong(workspace.id)
    res.writeHead(204)
    res.end()
  })

  // 上行：git 凭据取件（盒内助手按次调用——`{ host }` ⇒ `{ username, password }`；密值零回显零日志）。
  routes.add("POST", "/api/box/credential", async (req, res) => {
    const workspace = boxWorkspaceOf(db, req)
    const body = await readJsonBody(req)
    let found
    try {
      found = credentialForHost(db, { memberId: workspace.owner_member_id, host: body?.host, config })
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message) // 形非法 ∥ 密文不可解 ⇒ 400 人话（零静默回落）
    }
    if (found === null) {
      throw new HttpError("not_found", "未绑定该主机的 git 凭据——请在「我的 · 账户」页绑定（绑定一次复用）")
    }
    sendJson(res, 200, found)
  })
}
