/**
 * terminal-routes.mjs — 容器终端升级路（sandbox/SANDBOX.md §3「容器终端」块 ∥ §9 ∥ gateway/API.md §2.5 终端行；sandbox-container-terminal 批 · 台账 #1374）。
 *
 * 端点一枚（**非普通路由**——升级路）：`GET /api/admin/sandbox/runners/:id/containers/:containerId/terminal`（`Upgrade: websocket`）。
 * 101 前（响应沿错误形——零 `Sec-WebSocket-Accept`）：路径匹配（未匹配 ⇒ 404）⇒ `requireAdmin`（无会话 ⇒ 401 ∥ 非 admin ⇒ 403）
 * ⇒ `Origin` 同源门（异源 ⇒ 403）⇒ 节点存在（无 ⇒ 404）⇒ 握手形检（非 WS 升级 ⇒ 400）。
 * 101 后 = 会话桥：二进制帧 = pty 字节双向 ∥ 文本帧 = JSON 控制（下行 `ready`/`exit`/`error`/`pong`，上行 `resize`/`ping`）
 * ∥ 心跳（30s WS ping / 60s 判死）∥ 收口三件幂等（① 向 pty 写 `\x04` ② 关 Docker 流 ③ 关 WS：`exec_exit` ⇒ 1000 ∥ 余 ⇒ 1001）
 * ∥ 会话表（停机全收口 `server_stop`）∥ 审计两 kind（`terminal_open`（就绪时值五键）∥ `terminal_close`（reason 四值 + `durationMs`））。
 * **pty 内容零落库零日志**（终端字节不截流不落盘）。
 * **升级腿传输按行择（2026-10-14 修轮——TLS「生效面全谱」含终端族：`sandbox/SANDBOX.md` §3 连接方式块 ∥ §11 ⑤ ∥ §16 R74④）**：
 * TLS 行 ⇒ 三件材料（`docker-tls.mjs` `tlsMaterialsOf` 按行解密）逐值入 `https.request`；明文行 ⇒ 恒现状（透传既有注入；未注入 ⇒ `node:http`——零行为变化）。
 */
import { request as httpsRequest } from "node:https"

import { recordAudit } from "../accounts/audit.mjs"
import { requireAdmin } from "../accounts/session.mjs"
import { WS_CLOSE_GOING_AWAY, WS_CLOSE_NORMAL, WS_CLOSE_PROTOCOL_ERROR, createWsConnection, isWsUpgradeRequest, refuseUpgrade, writeUpgradeResponse } from "../gateway/ws.mjs"
import { DockerError, clientForRunner } from "./docker.mjs"
import { buildExecBody, closeExecSocket, containerRunning, createExecOps } from "./docker-exec.mjs"
import { connectionKindOf, tlsMaterialsOf } from "./docker-tls.mjs"
import { runnerRowOr404 } from "./registry.mjs"

export const TERMINAL_HEARTBEAT_MS = 30 * 1000 // 服务端 ping 周期（§3 KD-SV-177）
export const TERMINAL_DEAD_MS = 60 * 1000      // 判死窗（60s 无入帧 ⇒ 收口——§3）
export const TERMINAL_RESIZE_RETRY_MS = 250    // 就绪窗重试间隔（引擎 500 窗口——「就绪后施加一次」的实现成形）
export const TERMINAL_DEFAULT_COLS = 80        // 初值缺省（客户端未给——§3）
export const TERMINAL_DEFAULT_ROWS = 24
export const TERMINAL_MAX_COLS = 500           // 合法域（§3——越界/非法 ⇒ 忽略）
export const TERMINAL_MAX_ROWS = 300

/** 路径匹配（`/api/admin/sandbox/runners/:id/containers/:containerId/terminal`——八段；不匹配 ⇒ null）。 */
export function matchTerminalPath(pathname) {
  const segments = String(pathname ?? "").split("/").filter((segment) => segment !== "")
  if (segments.length !== 8) return null
  const [api, admin, sandbox, runners, runnerId, containers, containerId, terminal] = segments
  if (api !== "api" || admin !== "admin" || sandbox !== "sandbox" || runners !== "runners" || containers !== "containers" || terminal !== "terminal") return null
  try {
    return { runnerId: decodeURIComponent(runnerId), containerId: decodeURIComponent(containerId) }
  } catch {
    return { runnerId, containerId } // 畸形转义——原值入（节点/容器查无 ⇒ 404）
  }
}

/** 同源门（§3——`Origin` 在场须与 `Host` 同源；缺 `Origin`（非浏览器客户端）⇒ 放行——判权仍为会话）。 */
export function isSameOrigin(req) {
  const origin = req?.headers?.origin
  if (typeof origin !== "string" || origin.trim() === "") return true
  const host = String(req?.headers?.host ?? "")
  if (host === "") return false
  try {
    return new URL(origin).host === host
  } catch {
    return false // `null` ∥ 畸形 Origin ⇒ 拒
  }
}

/** `resize` 帧值域（§3：cols 1–500 ∥ rows 1–300；越界/非法 ⇒ null——忽略，不当帧、不发 resize）。 */
export function parseResizeControl(message) {
  const cols = message?.cols
  const rows = message?.rows
  const ok = Number.isInteger(cols) && Number.isInteger(rows) && cols >= 1 && cols <= TERMINAL_MAX_COLS && rows >= 1 && rows <= TERMINAL_MAX_ROWS
  return ok ? { cols, rows } : null
}

/** 引擎失败 → in-band 码（本舱发射三码；四码之 `session_closed` = 前端兜底词汇、零发射——§3「断开只由 WS close 表达」；`detail` = 引擎原文）。步别：create 的 409（窗口期容器被停）∥ read 的 404（容器没了）⇒ `container_not_running`。 */
export function execFailureInfo(e, { step = "create" } = {}) {
  if (e instanceof DockerError) {
    if (e.kind === "unreachable" || e.kind === "timeout") return { code: "engine_unreachable", detail: e.message }
    if ((step === "create" && e.status === 409) || (step === "read" && e.status === 404)) {
      return { code: "container_not_running", detail: e.apiMessage ?? e.message }
    }
    return { code: "exec_failed", detail: e.apiMessage ?? e.message }
  }
  return { code: "engine_unreachable", detail: e?.message ?? String(e) }
}

/**
 * exec 升级腿传输按行择（材料感知——TLS「生效面全谱」含终端族：`sandbox/SANDBOX.md` §3 连接方式块 ∥ §11 ⑤）：
 * 明文行 ⇒ 透传既有 `httpRequestImpl`（未注入 ⇒ `undefined`——`startExecTransport` 缺省 `node:http` `request`，逐值同现状）；
 * TLS 行 ⇒ 三件材料（`tlsMaterialsOf` 按行解密——复用 `docker-tls.mjs` 装具，零第二套 crypto 路径）逐值入 `https.request` 选项
 * （选项字段与 `httpsFetchOf` 同拍——材料面增项须两处同拍）。
 * `httpsRequestImpl` = 假件缝（单元测试档注入 `https.request` 替身；缺省 `node:https` 本尊）。
 */
export function execUpgradeTransportFor(runner, { config = {}, httpRequestImpl = undefined, httpsRequestImpl = httpsRequest } = {}) {
  if (connectionKindOf(runner?.address) !== "tls") return httpRequestImpl
  const tls = tlsMaterialsOf(runner, { config })
  return (options) => httpsRequestImpl({ ...options, ca: tls.ca, cert: tls.cert, key: tls.key })
}

/**
 * 终端 hub（装配件——`bin` 创建并经 `gateway` `upgrade` 挂点接线；`closeAll` = 停机全收口）。
 * 注入口径（单元测试档）：`now`（时钟）∥ `fetchImpl`（Docker HTTP）∥ `httpRequestImpl`（升级劫持——明文行注入缝；TLS 行 = `execUpgradeTransportFor` 材料化）∥ `httpsRequestImpl`（TLS 升级腿假件缝——缺省 `node:https` 本尊）∥
 * `heartbeatMs`/`deadMs`/`resizeRetryMs`（心跳/判死/就绪重试——生产缺省 = §3 值）。
 */
export function createTerminalHub({ db, log = null, now = Date.now, fetchImpl = fetch, config = {}, requestImpl = null, httpRequestImpl, httpsRequestImpl, heartbeatMs = TERMINAL_HEARTBEAT_MS, deadMs = TERMINAL_DEAD_MS, resizeRetryMs = TERMINAL_RESIZE_RETRY_MS, readTimeoutMs, actionTimeoutMs } = {}) {
  if (!db) throw new Error("createTerminalHub：缺少 db（openDatabase 产物）")
  const sessions = new Map()
  let seq = 0

  const audit = (session, detail) =>
    recordAudit(db, { type: "sandbox_event", actor: session.admin.name, actorId: session.admin.id, target: session.runner.name, detail, ts: now() })

  /** 收口（三件 + 审计 close——**幂等，一次**）：① 向 pty 写 `\x04` ② 关 Docker 流 ③ 关 WS（`exec_exit` ⇒ 1000 ∥ 余 ⇒ 1001）⇒ 表清。 */
  function finishSession(session, reason) {
    if (session.closed) return false
    session.closed = true
    if (session.heartbeat) { clearInterval(session.heartbeat); session.heartbeat = null }
    if (session.resizeTimer) { clearTimeout(session.resizeTimer); session.resizeTimer = null }
    if (session.execSocket) { closeExecSocket(session.execSocket); session.execSocket = null }
    session.conn?.close(reason === "exec_exit" ? WS_CLOSE_NORMAL : WS_CLOSE_GOING_AWAY)
    sessions.delete(session.id)
    audit(session, { kind: "terminal_close", runnerId: session.runnerId, containerId: session.containerId, reason, durationMs: now() - session.startedAt })
    return true
  }

  /** in-band 错误（本舱发射三码——下行 `{"t":"error","code","detail?"}`）⇒ 收口（`reason='error'`）。 */
  function failSession(session, info) {
    if (session.closed) return
    session.conn?.text(JSON.stringify({ t: "error", code: info.code, ...(info.detail ? { detail: info.detail } : {}) }))
    finishSession(session, "error")
  }

  /** 应用层协议错（文本帧非 JSON）⇒ close 1002 + 收口（`reason='error'`——E63 同形）。 */
  function protocolFail(session, reason) {
    if (session.closed) return
    session.conn?.close(WS_CLOSE_PROTOCOL_ERROR, reason)
    finishSession(session, "error")
  }

  /** 上行文本帧（JSON 控制——`ping` ⇒ `pong`；`resize` 就绪前挂起 ∥ 就绪后逐帧直发；余 ⇒ 忽略）。 */
  function handleControl(session, text) {
    if (session.closed) return
    let message
    try {
      message = JSON.parse(text)
    } catch {
      return protocolFail(session, "bad_control_json")
    }
    if (message === null || typeof message !== "object") return protocolFail(session, "bad_control_json")
    if (message.t === "ping") {
      session.conn?.text(JSON.stringify({ t: "pong" }))
      return
    }
    if (message.t === "resize") {
      const value = parseResizeControl(message)
      if (value === null) return // 非法 ⇒ 忽略（零引擎调用——会话不受影响）
      if (!session.ready || !session.execId) {
        session.pendingResize = value // 就绪前 ⇒ 挂起（零引擎调用——就绪后施加一次）
        return
      }
      sendResize(session, value) // 就绪后 ⇒ 逐帧直发
      return
    }
    // 未知控制型 ⇒ 忽略（前向兼容——非协议错）
  }

  /** 心跳（KD-SV-177）：30s WS ping；60s 无 pong 且无上行帧 ⇒ 判死（收口 `client_close`）。 */
  function startHeartbeat(session) {
    if (!(heartbeatMs > 0)) return
    session.heartbeat = setInterval(() => {
      if (session.closed) return
      if (now() - session.lastUpstreamAt >= deadMs) {
        finishSession(session, "client_close")
        return
      }
      session.conn?.ping()
    }, heartbeatMs)
    session.heartbeat.unref?.()
  }

  /** 就绪后尺寸直发（§3：逐帧直发——尽力而为，失败不反噬会话；`applied` = 最近一次施加值）。 */
  function sendResize(session, value) {
    session.applied = value
    session.execOps.resize(session.execId, value).catch(() => { /* 吞：尺寸面不阻断会话 */ })
  }

  /** 就绪协作（§3 尺寸）：挂起值（缺省 80×24）⇒ 就绪后施加一次 ⇒ `ready` 帧 + 审计 `terminal_open`；
   *  引擎 500 窗口 ⇒ 重试；施加窗内到达的新值（`pendingResize` 变过）⇒ 就绪后补发一次（否则该值被吞——尺寸不齐）。 */
  function applyInitialResize(session) {
    if (session.closed || session.ready || !session.execId) return
    const value = session.pendingResize ?? { cols: TERMINAL_DEFAULT_COLS, rows: TERMINAL_DEFAULT_ROWS }
    session.execOps.resize(session.execId, value).then(
      () => {
        if (session.closed) return
        session.ready = true
        session.applied = value
        session.conn?.text(JSON.stringify({ t: "ready", cols: value.cols, rows: value.rows }))
        audit(session, { kind: "terminal_open", runnerId: session.runnerId, containerId: session.containerId, cols: value.cols, rows: value.rows })
        const pending = session.pendingResize
        if (pending && (pending.cols !== value.cols || pending.rows !== value.rows)) sendResize(session, pending)
      },
      () => {
        if (session.closed) return
        // 就绪窗（引擎 `timeout waiting for exec session ready` 500——start 后即刻调用亦可能撞）⇒ 再试；挂起值保持
        session.resizeTimer = setTimeout(() => {
          session.resizeTimer = null
          applyInitialResize(session)
        }, resizeRetryMs)
        session.resizeTimer.unref?.()
      },
    )
  }

  /** 引擎流结束 ⇒ 读 inspect `ExitCode`（读败 ⇒ null——照发）⇒ 下行 `exit` 帧 ⇒ 收口（`reason='exec_exit'`）。 */
  function onEngineEnd(session) {
    if (session.closed || session.engineDone) return
    session.engineDone = true
    session.execOps.inspect(session.execId).then(
      (response) => {
        if (session.closed) return
        const code = response?.json?.ExitCode ?? null
        session.conn?.text(JSON.stringify({ t: "exit", code }))
        finishSession(session, "exec_exit")
      },
      () => {
        if (session.closed) return
        session.conn?.text(JSON.stringify({ t: "exit", code: null }))
        finishSession(session, "exec_exit")
      },
    )
  }

  /** 引擎 socket 接线：下行 = 引擎字节原样；结束/断链 ⇒ 收口；随后起心跳 + 就绪施加。 */
  function attachEngine(session, transport) {
    const socket = transport.socket
    session.execSocket = socket
    socket.on("data", (chunk) => { session.conn?.binary(chunk) }) // pty 字节零加工
    socket.on("error", () => { onEngineEnd(session) })
    socket.on("end", () => { onEngineEnd(session) })
    socket.on("close", () => { onEngineEnd(session) })
    if (transport.head?.length) session.conn?.binary(transport.head) // 与 101 同段到达的引擎首块（`'upgrade'` 的 head——不喂即丢：容器首屏提示符/启动横幅）
    startHeartbeat(session)
    applyInitialResize(session)
  }

  /** 会话链三步（① 读容器 ⇒ ② 建 exec ⇒ ③ 升级 start——全走引擎；失败 ⇒ in-band 四码 + 收口）。 */
  async function runChain(session) {
    let detail
    try {
      detail = (await session.client.containerDetail(session.containerId)).json ?? {}
    } catch (e) {
      return failSession(session, execFailureInfo(e, { step: "read" }))
    }
    if (session.closed) return
    if (!containerRunning(detail)) return failSession(session, { code: "container_not_running" }) // 非 running ⇒ 不开 exec（零 exec 调用）
    let execId
    try {
      execId = await session.execOps.create(session.containerId, buildExecBody(detail))
    } catch (e) {
      return failSession(session, execFailureInfo(e, { step: "create" }))
    }
    if (session.closed) return
    session.execId = execId
    let transport
    try {
      transport = await session.execOps.start(execId)
    } catch (e) {
      return failSession(session, execFailureInfo(e, { step: "start" }))
    }
    if (session.closed) {
      closeExecSocket(transport.socket) // 客户端中途断 ⇒ start 应答到达即收口（exec 不残留——B81）
      return
    }
    attachEngine(session, transport)
  }

  /** 升级入口（`gateway` `upgrade` 挂点全量交本件——路径匹配/判权/404 归内）。 */
  function handleUpgrade(req, socket, head) {
    const pathname = (() => {
      try {
        const raw = new URL(req?.url ?? "/", "http://localhost").pathname
        return raw.length > 1 && raw.endsWith("/") ? raw.slice(0, -1) : raw
      } catch {
        return "/"
      }
    })()
    const match = matchTerminalPath(pathname)
    if (!match) {
      refuseUpgrade(socket, "not_found", `无此升级路由：${req?.method} ${pathname}`) // E62 未匹配 ⇒ 404（101 前）
      return
    }
    let admin
    try {
      admin = requireAdmin(db, req).member // 无会话 ⇒ 401 ∥ 非 admin ⇒ 403（101 前）
    } catch (e) {
      refuseUpgrade(socket, e.code, e.message)
      return
    }
    if (!isSameOrigin(req)) {
      refuseUpgrade(socket, "forbidden", "跨源握手被拒（Origin 与 Host 不同源）")
      return
    }
    let runner
    try {
      runner = runnerRowOr404(db, match.runnerId) // 节点不存在 ⇒ 404（101 前）
    } catch (e) {
      refuseUpgrade(socket, e.code, e.message)
      return
    }
    if (!isWsUpgradeRequest(req)) {
      refuseUpgrade(socket, "invalid_request_error", "非 WebSocket 升级请求（缺 Upgrade: websocket ∥ Sec-WebSocket-Key）")
      return
    }
    writeUpgradeResponse(socket, req.headers["sec-websocket-key"])
    // ── 101 后：会话入表（升级 socket 生命周期由此持有——不依赖 HTTP 层）──
    const session = {
      id: ++seq,
      runner,
      runnerId: runner.id,
      containerId: match.containerId,
      admin,
      client: clientForRunner(runner, { fetchImpl, config, requestImpl, ...(readTimeoutMs ? { readTimeoutMs } : {}), ...(actionTimeoutMs ? { actionTimeoutMs } : {}) }),
      execOps: null,
      conn: null,
      execSocket: null,
      execId: null,
      startedAt: now(),
      lastUpstreamAt: now(),
      ready: false,
      engineDone: false,
      closed: false,
      pendingResize: null,
      applied: null,
      heartbeat: null,
      resizeTimer: null,
    }
    // 升级腿传输按行择（TLS 行 ⇒ 材料感知 `https.request`；明文行 ⇒ 既有注入/缺省 `node:http`——零行为变化）
    const upgradeTransport = execUpgradeTransportFor(runner, { config, httpRequestImpl, httpsRequestImpl })
    session.execOps = createExecOps({ client: session.client, ...(upgradeTransport ? { httpRequestImpl: upgradeTransport } : {}), ...(readTimeoutMs ? { readTimeoutMs } : {}), ...(actionTimeoutMs ? { actionTimeoutMs } : {}) })
    sessions.set(session.id, session)
    const conn = createWsConnection(socket, {
      onText: (text) => handleControl(session, text),
      onBinary: (payload) => {
        if (session.closed || !session.execSocket) return // 上行 pty 字节（引擎未就绪 ⇒ 丢——连接态由 ready 帧表达）
        try { session.execSocket.write(payload) } catch { /* 已断——收口走引擎事件 */ }
      },
      onActivity: () => { session.lastUpstreamAt = now() },
      onClose: (info) => {
        // 远端关 ∥ 协议错（conn 已 close 1002）∥ 套接字断：协议错归 error，余归 client_close
        finishSession(session, info?.protocolError ? "error" : "client_close")
      },
    })
    session.conn = conn
    conn.feed(head) // 握手残字节（可能已含首帧——回调已接线）
    runChain(session).catch((e) => {
      log?.error("terminal_chain_error", { message: e?.message ?? String(e) }) // 链外异常兜底（零悬挂）
      finishSession(session, "error")
    })
  }

  return {
    /** 升级入口（**对外暴露形**——装配面直挂后 `listeners("upgrade")[0] === 本件`，身份可比）：
     *  同步抛兜底（记日志 + 断链）——直挂不再经网关包装，本件自持这层保护，钩子异常不落进程。 */
    handleUpgrade: (req, socket, head) => {
      try {
        handleUpgrade(req, socket, head)
      } catch (e) {
        log?.error("upgrade_handler_error", { message: e?.message ?? String(e) })
        // 孤儿会话收口：内层在 `sessions.set` 之后才建 conn——同步抛可留下无 conn 的行（单线程无并发构建）。
        // 自带 try/catch：收口路径会写审计（`finishSession` → `recordAudit`），库已关时可能再抛——不得逃进事件发射栈。
        try {
          for (const session of [...sessions.values()]) if (session.conn === null) finishSession(session, "error")
        } catch (cleanupError) {
          log?.error("upgrade_handler_cleanup_failed", { message: cleanupError?.message ?? String(cleanupError) })
        }
        try { socket.destroy() } catch { /* 已断 */ }
      }
    },
    /** 停机全收口（`reason='server_stop'`——N85）：在飞会话逐一收口 ⇒ 表清空。 */
    closeAll(reason = "server_stop") {
      for (const session of [...sessions.values()]) finishSession(session, reason)
      return sessions.size === 0
    },
    get sessionCount() { return sessions.size },
    get sessionIds() { return [...sessions.keys()] },
  }
}
