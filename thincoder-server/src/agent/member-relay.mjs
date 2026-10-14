/**
 * member-relay.mjs — 成员面 relay（`agent/MEMBER-AGENT.md` §3.3/§3.4；KD-SV-153）：盒连接登记 ∥ 下行 SSE 队列 ∥
 * 回合状态机（工作区级在途门 ∥ 收尾三径——**内存态**）∥ 在线态（连接在 ∧ 最近一次 ping 应答 ≤3 周期）。
 *
 * 口径：**会话真源在盒内**（题一裁定）——服务器零会话落库，帧即转发即弃（本档只保在途态；重启天然清空）；
 * 下行事件 = `hello`（连上确认 + 未收尾命令重派清单）∥ `run` ∥ `abort` ∥ `pull` ∥ `cmd` ∥ `ping`（缺省 20s——设计值）；
 * 上行 = 盒侧经 `POST /api/box/*`（`box-routes.mjs`）回呈——`begin`/六帧/`end` 经 `feedTurn` 转浏览器流；
 * `commands/:cmdId/result` 经 `completeCommand` 对位（拉仓 ∥ 读/管理指令）。
 * 收尾三径（§3.4）：① `end` 帧（盒侧正常/失败/中止）；② 掉线（SSE 断 ∨ ping 应答欠 3 周期）⇒ 判 `box_lost`：
 * 浏览器流补 notice 帧 + `end { failed, box_lost }`；③ 服务端重启（在途态 = 纯内存——零行可扫；重派 = `hello.redeliver`）。
 * 审计（`member_event`——单源 = `accounts/ACCOUNTS.md` §2.1）：`chat_call`（每工具调用——`result` 帧对位 `call` 帧）∥
 * `chat_stop`（异常收尾——reason 六值：管理面五 + `box_lost`）；成事才落、秘密掩蔽后（帧面加宽掩蔽/截断口径 = 管理面同源——`cappedFrame` 单点）。
 */
import { findMemberById } from "../accounts/members.mjs"
import { recordAudit } from "../accounts/audit.mjs"
import { HttpError } from "../gateway/errors.mjs"
import { argsTextOf, capSummary, parseToolArgs, secretValuesOf } from "./chat.mjs"
import { maskSecrets } from "./tools.mjs"

/** 工作区级在途门报文（§3.4——同工作区任一会话在跑 ⇒ 发消息 400 人话）。 */
export const WORKSPACE_BUSY_MESSAGE = "该工作区正在执行另一回合——等它结束（盒 = 共享资源）"
/** 掉线收尾 notice 文案（流内唯一呈现径——重读不含，如实）。 */
export const BOX_LOST_NOTICE = "工作区连接已断开——本轮已中断（工作区恢复后可重试）"

/** SSE 帧编码（`event: <名>` + `data: <JSON>`——下行面单源）。 */
export function sseFrame(event, data) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

/**
 * relay 实例（每进程一枚——`bin` 装配；单元测试档可自建）。注入口径：`now`（时钟）∥ `pingIntervalMs`/`pongWindowMs`/
 * `cmdTimeoutMs`（节拍——测试可压缩；`cmdTimeoutMs = 0` ⇒ 读/管理指令不设超时）。
 */
export function createMemberRelay({ db = null, log = null, now = Date.now, pingIntervalMs = 20_000, pongWindowMs = 60_000, cmdTimeoutMs = 30_000 } = {}) {
  let seq = 0
  const boxes = new Map() // workspaceId ⇒ { workspace, res, lastPongAt, timer }
  const pending = new Map() // cmdId ⇒ { workspaceId, kind, settle }（未收尾命令——随 hello.redeliver 重派）
  const turns = new Map() // workspaceId ⇒ 在途回合（工作区级单发）
  const turnByCmd = new Map() // cmdId ⇒ 同一回合（盒上行对位）

  const nextCmdId = () => `cmd-${++seq}`
  const boxOf = (workspaceId) => boxes.get(Number(workspaceId)) ?? null

  /** 在线判据（§3.3）：连接在 ∧ 最近一次 ping 应答 ≤3 周期（60s）。 */
  function online(workspaceId) {
    const box = boxOf(workspaceId)
    return box !== null && now() - box.lastPongAt <= pongWindowMs
  }

  /** 下行（SSE 写；无连接 ∥ 写失败 ⇒ false——不抛）。 */
  function send(workspaceId, event, data) {
    const box = boxOf(workspaceId)
    if (box === null) return false
    try {
      box.res.write(sseFrame(event, data))
      return true
    } catch (e) {
      log?.warn("member_relay_write_failed", { workspaceId: Number(workspaceId), message: e?.message ?? String(e) })
      return false
    }
  }

  /** 回合收尾（单点——①`end` 帧 ∥ ②掉线补帧；幂等：已了结 ⇒ no-op）。 */
  function settleTurn(turn, { frame = null, reason = "box_lost" } = {}) {
    if (turn.settled) return
    turn.settled = true
    turns.delete(turn.workspaceId)
    turnByCmd.delete(turn.cmdId)
    if (frame !== null) {
      emit(turn, frame)
      if (frame.status !== "succeeded") auditChatStop(turn, frame.reason ?? "model_error")
    } else {
      emit(turn, { type: "notice", reason, text: reason === "box_lost" ? BOX_LOST_NOTICE : String(reason) })
      emit(turn, { type: "end", status: "failed", reason })
      auditChatStop(turn, reason)
    }
    turn.resolveDone()
  }

/** 该次调用的秘密值集（管理面 `secretValuesOf` 同源——取 `call.args` 敏感键值；`result` 帧（`summary` ∥ `content`）值掩蔽的取值面）。
 *  非 JSON 对象 ⇒ 空集（照常转发——掩蔽不阻断帧）。 */
  function callSecretsOf(argsText) {
    const parsed = parseToolArgs(String(argsText ?? ""))
    return parsed === null ? [] : secretValuesOf(parsed)
  }

/** 帧面加宽掩蔽/截断（管理面同源——转发浏览器前）：`call.args` ≤500 ∥ 结果摘要 ≤300 截断不变；
 *  **`result.summary` ∥ `result.content` = `maskSecrets` 值掩蔽**（秘密值 = 该 `call` 帧 args 敏感键值——同管理面取值面）；
 *  `content` **保全文长度**（设计截断口径只列 args ≤500 ∥ 摘要 ≤300——content 不套截断；`secrets` 缺省 = 空集 ⇒ 值原样透传）。
 *  `call.args` = `argsTextOf`（敏感键掩蔽 `maskArgs` ⇒ 截断≤500）∥ 结果摘要 = `capSummary`（掩蔽 + 截断≤300）。 */
  function cappedFrame(frame, secrets = []) {
    if (frame?.type === "call") return { ...frame, args: argsTextOf(String(frame.args ?? "")) }
    if (frame?.type === "result") return { ...frame, summary: capSummary(String(frame.summary ?? ""), secrets), content: maskSecrets(String(frame.content ?? ""), secrets) }
    return frame
  }

  function emit(turn, frame, secrets = []) {
    if (typeof turn.emit !== "function") return
    try {
      turn.emit(cappedFrame(frame, secrets))
    } catch (e) {
      log?.warn("member_relay_emit_failed", { workspaceId: turn.workspaceId, message: e?.message ?? String(e) })
    }
  }

  /** 审计：成员行（名快照——工作区负责人）。 */
  function memberOf(workspace) {
    return (db && findMemberById(db, workspace.owner_member_id)) ?? { id: null, name: "member" }
  }

  /** `member_event`/`chat_call`（每工具调用——工具名 ∥ 结果码 ∥ 摘要；秘密掩蔽后）。 */
  function auditChatCall(turn, frame, callName) {
    if (!db) return
    const member = memberOf(turn.workspace)
    recordAudit(db, {
      type: "member_event",
      actor: member.name,
      actorId: member.id,
      target: `session:${turn.sessionId}`, // 盒内槽号可读形（ACCOUNTS §2.1）
      detail: { kind: "chat_call", sessionId: `${turn.workspaceId}:${turn.sessionId}`, tool: String(callName ?? ""), resultCode: frame.ok === true ? 0 : -1, summary: frame.summary ?? "" },
      ts: now(),
    })
  }

  /** `member_event`/`chat_stop`（异常收尾——reason 六值：管理面五 + `box_lost`）。 */
  function auditChatStop(turn, reason) {
    if (!db) return
    const member = memberOf(turn.workspace)
    recordAudit(db, {
      type: "member_event",
      actor: member.name,
      actorId: member.id,
      target: `session:${turn.sessionId}`,
      detail: { kind: "chat_stop", sessionId: `${turn.workspaceId}:${turn.sessionId}`, reason: String(reason ?? "box_lost") },
      ts: now(),
    })
  }

  /** ping 节拍（每连接一枚）：应答超窗 ⇒ 在途回合按掉线径收尾（**一次**）；节拍续发不锁死（晚到应答即自愈在线态）。 */
  function tick(box) {
    if (boxOf(box.workspace.id) !== box) return
    if (now() - box.lastPongAt > pongWindowMs) {
      const turn = turns.get(box.workspace.id)
      if (turn) settleTurn(turn, { reason: "box_lost" })
    }
    send(box.workspace.id, "ping", {})
  }

  return {
    online,
    /** 回合在途：该工作区是否有在跑回合（工作区级在途门读数）。 */
    busy(workspaceId) {
      return turns.has(Number(workspaceId))
    },
    /** 盒连接登记（SSE 起——新连接顶旧连接）：开 ping 节拍 + 发 `hello`（含未收尾命令重派清单）；
     *  出 = `{ token, redeliver }`（`token` = 本连接标识——`detach` 判用：旧连接关不触新连接）。 */
    attach(workspace, res) {
      const previous = boxOf(workspace.id)
      if (previous) {
        clearInterval(previous.timer)
        try {
          previous.res.end?.()
        } catch {
          /* 旧连接收口——尽力而为 */
        }
      }
      const token = ++seq
      const box = { token, workspace, res, lastPongAt: now(), timer: null }
      boxes.set(Number(workspace.id), box)
      box.timer = setInterval(() => tick(box), pingIntervalMs)
      box.timer.unref?.()
      const redeliver = [...pending.values()].filter((entry) => entry.workspaceId === Number(workspace.id)).map((entry) => entry.cmdId)
      send(workspace.id, "hello", { serverTime: now(), redeliver })
      return { token, redeliver }
    },
    /** 盒连接断开（掉线径）：在途回合收尾（notice + `end{failed,box_lost}`）；未收尾命令保留（重连重派）。
     *  `token` 传则以本连接为准（被顶替的旧连接关闭 ⇒ 不触新连接）。 */
    detach(workspaceId, token = null) {
      const box = boxOf(workspaceId)
      if (!box) return false
      if (token !== null && box.token !== token) return false
      boxes.delete(Number(workspaceId))
      clearInterval(box.timer)
      const turn = turns.get(Number(workspaceId))
      if (turn) settleTurn(turn, { reason: "box_lost" })
      return true
    },
    /** ping 应答（`POST /api/box/ping`）：刷新在线窗。 */
    notePong(workspaceId) {
      const box = boxOf(workspaceId)
      if (!box) return false
      box.lastPongAt = now()
      return true
    },
    /** 读/管理指令下行（`cmd`）：出 = `{ cmdId, state, detail }`；超时 ∥ 盒离线 ⇒ 抛（调用侧转 409/502）。 */
    runCommand(workspaceId, kind, args = {}, { timeoutMs = cmdTimeoutMs } = {}) {
      if (!online(workspaceId)) throw new HttpError("workspace_offline", "工作区未运行或未连接")
      const cmdId = nextCmdId()
      return new Promise((resolve, reject) => {
        const timer = timeoutMs > 0 ? setTimeout(() => {
          pending.delete(cmdId)
          reject(new HttpError("upstream_error", `工作区无响应（${kind} 超时——盒未回呈）`))
        }, timeoutMs) : null
        timer?.unref?.()
        pending.set(cmdId, {
          workspaceId: Number(workspaceId),
          kind,
          settle: (value) => {
            if (timer) clearTimeout(timer)
            resolve({ cmdId, ...value })
          },
        })
        if (!send(workspaceId, "cmd", { cmdId, kind, args })) {
          pending.delete(cmdId)
          if (timer) clearTimeout(timer)
          reject(new HttpError("workspace_offline", "工作区未运行或未连接"))
        }
      })
    },
    /** 拉仓下行（`pull`——**凭据不随命令**；不设超时：克隆时长不可预期，未收尾命令随重连重派）。 */
    sendPull(workspaceId, { url, dir }) {
      if (!online(workspaceId)) throw new HttpError("workspace_offline", "工作区未运行或未连接")
      const cmdId = nextCmdId()
      return new Promise((resolve, reject) => {
        pending.set(cmdId, { workspaceId: Number(workspaceId), kind: "pull", settle: (value) => resolve({ cmdId, ...value }) })
        if (!send(workspaceId, "pull", { cmdId, url, dir })) {
          pending.delete(cmdId)
          reject(new HttpError("workspace_offline", "工作区未运行或未连接"))
        }
      })
    },
    /** 命令结果回呈（`commands/:cmdId/result`）：未知/已了结 cmdId ∥ 工作区不符 ⇒ false（调用侧 400 零副作用）。 */
    completeCommand(cmdId, { state = "done", detail = null, workspaceId = null } = {}) {
      const entry = pending.get(String(cmdId))
      if (!entry) return false
      if (workspaceId !== null && entry.workspaceId !== Number(workspaceId)) return false
      pending.delete(String(cmdId))
      entry.settle({ state, detail })
      return true
    },
    /** 发消息 = 起一回合（工作区级在途门——重复 ⇒ 抛 400 人话）；出 = `{ cmdId, done }`（done = 收尾信号）。 */
    startTurn({ workspace, sessionId, content, emit: emitFrame }) {
      if (turns.has(Number(workspace.id))) throw new HttpError("invalid_request_error", WORKSPACE_BUSY_MESSAGE)
      if (!online(workspace.id)) throw new HttpError("workspace_offline", "工作区未运行或未连接")
      const cmdId = nextCmdId()
      let resolveDone = null
      const done = new Promise((resolve) => {
        resolveDone = resolve
      })
      const turn = { cmdId, workspaceId: Number(workspace.id), workspace, sessionId: String(sessionId), emit: emitFrame, calls: new Map(), settled: false, resolveDone }
      turns.set(Number(workspace.id), turn)
      turnByCmd.set(cmdId, turn)
      if (!send(workspace.id, "run", { cmdId, sessionId: turn.sessionId, content })) {
        turns.delete(Number(workspace.id))
        turnByCmd.delete(cmdId)
        throw new HttpError("workspace_offline", "工作区未运行或未连接")
      }
      return { cmdId, done }
    },
    /** 上行对位（盒侧 `begin { cmdId }`）：未知/已了结 ⇒ null（会话 ∉ 本工作区同判——调用侧 404）。 */
    turnOf(cmdId) {
      return turnByCmd.get(String(cmdId)) ?? null
    },
    /** 会话在途回合读（工作区 + 槽号——体异常无 cmdId 可对位时的收口径）：无 ⇒ null。 */
    turnOfSession(workspaceId, sessionId) {
      const turn = turns.get(Number(workspaceId))
      return turn !== undefined && turn.sessionId === String(sessionId) ? turn : null
    },
    /** 回合帧转发（六帧词表 + `end`）：`call` 帧登记（供 `result` 帧对位——审计 ∥ `result` 帧掩蔽（`summary` ∥ `content`）取值面）；`end` ⇒ 收尾。未知 cmdId ⇒ false。 */
    feedTurn(cmdId, frame) {
      const turn = turnByCmd.get(String(cmdId))
      if (!turn) return false
      if (frame?.type === "call") turn.calls.set(String(frame.id ?? ""), { name: frame.name, secrets: callSecretsOf(frame.args) })
      if (frame?.type === "result") {
        const call = turn.calls.get(String(frame.id ?? ""))
        emit(turn, frame, call?.secrets ?? [])
        auditChatCall(turn, cappedFrame(frame, call?.secrets ?? []), call?.name)
      } else if (frame?.type === "end") {
        settleTurn(turn, { frame })
      } else {
        emit(turn, frame)
      }
      return true
    },
    /** 回合流中止（盒侧流中断——无 `end` 帧收口）：按失败收尾（如实补帧——`detail` 明写中断因）。 */
    finishTurnStream(cmdId) {
      const turn = turnByCmd.get(String(cmdId))
      if (!turn) return false
      settleTurn(turn, { frame: { type: "end", status: "failed", reason: "model_error", detail: "回合流中断（盒未回终止帧）" } })
      return true
    },
    /** 中止（`abort` 下行）：非在途 ∥ 会话不符 ⇒ false（调用侧 400 零副作用）。 */
    abortTurn(workspaceId, sessionId) {
      const turn = turns.get(Number(workspaceId))
      if (!turn || turn.sessionId !== String(sessionId)) return false
      send(workspaceId, "abort", { cmdId: turn.cmdId, sessionId: turn.sessionId })
      return true
    },
    /** 停机/测试收口：断开全部连接（清 ping 节拍；在途回合按掉线径收尾）。 */
    closeAll() {
      for (const workspaceId of [...boxes.keys()]) {
        const box = boxes.get(workspaceId)
        clearInterval(box.timer)
        boxes.delete(workspaceId)
        const turn = turns.get(workspaceId)
        if (turn) settleTurn(turn, { reason: "box_lost" })
      }
    },
  }
}
