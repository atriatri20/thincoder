/**
 * member-relay.mjs — 成员面 relay（`agent/MEMBER-AGENT.md` §3.3/§3.4/§3.11(2)；KD-SV-153/207/213）：盒连接登记 ∥
 * 下行 SSE 队列 ∥ 回合状态机（**会话级**在途门 ∥ 收尾三径——**内存态**）∥ 在线态（连接在 ∧ 最近一次 ping 应答 ≤3 周期）
 * ∥ ask 在途表（promptId → 回合——应答回程 = 下行 `answer`）。
 *
 * 口径：**会话真源在盒内**（题一裁定）——服务器零会话落库，帧即转发即弃（本档只保在途态：在途回合表 ∥ ask 在途表；
 * 重启天然清空）；
 * 下行事件 = `hello`（连上确认 + 未收尾命令重派清单）∥ `run` ∥ `abort`（体扩 `key`——停单件）∥ `pull` ∥ `cmd` ∥
 * `ping`（缺省 20s——设计值）∥ `answer`（ask 应答回程——member-face-parity 批）；
 * 上行 = 盒侧经 `POST /api/box/*`（`box-routes.mjs`）回呈——`begin`/帧流/`end` 经 `feedTurn` 转浏览器流；
 * `commands/:cmdId/result` 经 `completeCommand` 对位（拉仓 ∥ 读/管理指令）。
 * 收尾三径（§3.4）：① `end` 帧（盒侧正常/失败/中止）；② 掉线（SSE 断 ∨ ping 应答欠 3 周期）⇒ 判 `box_lost`：
 * 浏览器流补 notice 帧 + `end { failed, box_lost }`——**同拍未收尾命令同款收尾**（#1403 `settleCommands`）；
 * ③ 服务端重启（在途态 = 纯内存——零行可扫；重派 = `hello.redeliver`——连接替换窗残余，非主径）。
 * 兜底结算（§3.11(2)——三径同拍）：未决 ask 随回合收尾全量清表（后到应答 ⇒ 调用侧 400 零副作用）。
 * 审计（`member_event`——单源 = `accounts/ACCOUNTS.md` §2.1）：`chat_call`（每工具调用——`result` 帧对位 `call` 帧）∥
 * `chat_stop`（异常收尾——reason 六值：管理面五 + `box_lost`）；成事才落、秘密掩蔽后（帧面加宽掩蔽/截断口径 = 管理面同源——`cappedFrame` 单点）。
 */
import { findMemberById } from "../accounts/members.mjs"
import { recordAudit } from "../accounts/audit.mjs"
import { HttpError } from "../gateway/errors.mjs"
import { createRelayScope, relayEventToSubPatch } from "@thincoder/render-core/subblocks/relay.mjs"
import { argsTextOf, capSummary, parseToolArgs, secretValuesOf } from "./chat.mjs"
import { maskSecrets } from "./tools.mjs"
import { ASK_KINDS, ITEM_VERDICTS, BATCH_VERDICTS, askAnswerBodyOf } from "./ask-vocab.mjs"

/** 词表公共面重导出（同一绑定——公共面零变，非第二份；单源 = `ask-vocab.mjs`，处方同 `ledger-db.mjs:137-139`）。 */
export { ASK_KINDS, ITEM_VERDICTS, BATCH_VERDICTS, askAnswerBodyOf } from "./ask-vocab.mjs"

/** 会话级在途门报文（§3.4/KD-SV-223——**同会话**二回合 ⇒ 发消息 400 人话；跨会话并行放开）。 */
export const SESSION_BUSY_MESSAGE = "该会话正在执行另一回合"
/** 掉线收尾 notice 文案（流内唯一呈现径——重读不含，如实）。 */
export const BOX_LOST_NOTICE = "工作区连接已断开——本轮已中断（工作区恢复后可重试）"
/** 掉线命令收尾报文（#1403——命令径与回合径同款；拉取面 `reason` ∥ 指令面 400 人话同源）。 */
export const BOX_LOST_CMD_MESSAGE = "工作区连接已断开——命令未完成（工作区恢复后重试）"

/** SSE 帧编码（`event: <名>` + `data: <JSON>`——下行面单源）。 */
export function sseFrame(event, data) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

/** 会话键（回合表键——工作区 + 会话双维：跨会话并行放开，同会话单发）。 */
const turnKey = (workspaceId, sessionId) => `${Number(workspaceId)}:${String(sessionId)}`

/**
 * relay 实例（每进程一枚——`bin` 装配；单元测试档可自建）。注入口径：`now`（时钟）∥ `pingIntervalMs`/`pongWindowMs`/
 * `cmdTimeoutMs`（节拍——测试可压缩；`cmdTimeoutMs = 0` ⇒ 读/管理指令不设超时）。
 */
export function createMemberRelay({ db = null, log = null, now = Date.now, pingIntervalMs = 20_000, pongWindowMs = 60_000, cmdTimeoutMs = 30_000 } = {}) {
  let seq = 0
  const boxes = new Map() // workspaceId ⇒ { workspace, res, lastPongAt, timer }
  const pending = new Map() // cmdId ⇒ { workspaceId, kind, settle }（未收尾命令——随 hello.redeliver 重派）
  const turns = new Map() // 会话键（`<workspaceId>:<sessionId>`）⇒ 在途回合（会话级单发）
  const turnByCmd = new Map() // cmdId ⇒ 同一回合（盒上行对位）
  const asks = new Map() // promptId ⇒ { turn, kind }（ask 在途表——应答回程对位）

  const nextCmdId = () => `cmd-${++seq}`
  const boxOf = (workspaceId) => boxes.get(Number(workspaceId)) ?? null
  const turnsOf = (workspaceId) => [...turns.values()].filter((turn) => turn.workspaceId === Number(workspaceId))

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

  /** 回合收尾（单点——①`end` 帧 ∥ ②掉线补帧；幂等：已了结 ⇒ no-op）。未决 ask 随收尾清表（§3.11(2) 兜底）。 */
  function settleTurn(turn, { frame = null, reason = "box_lost" } = {}) {
    if (turn.settled) return
    turn.settled = true
    turns.delete(turnKey(turn.workspaceId, turn.sessionId))
    turnByCmd.delete(turn.cmdId)
    for (const promptId of turn.asks) asks.delete(promptId)
    turn.asks.clear()
    turn.keys.clear()
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

  /** 命令收尾（#1403——掉线两径 + 停机收口对 pending 命令同款收尾，沿回合径）：逐 pending（该工作区）`delete` +
   *  `settle({ state: "failed", detail: { message: BOX_LOST_CMD_MESSAGE } })` ⇒ 拉取径 = 记录 `failed`（四态轮询呈败可重试）
   *  ∥ 指令径 = `valueOf` 抛 400 人话（零 30s 挂等）；`redeliver` 清单随 pending 清空而自不含。 */
  function settleCommands(workspaceId) {
    const wanted = Number(workspaceId)
    for (const [cmdId, entry] of [...pending]) {
      if (entry.workspaceId !== wanted) continue
      pending.delete(cmdId)
      entry.settle({ state: "failed", detail: { message: BOX_LOST_CMD_MESSAGE } })
    }
  }

  /** 该次调用的秘密值集（管理面 `secretValuesOf` 同源——取 `call.args` 敏感键值；`result` 帧（`summary` ∥ `content`）值掩蔽的取值面）。
   *  非 JSON 对象 ⇒ 空集（照常转发——掩蔽不阻断帧）。 */
  function callSecretsOf(argsText) {
    const parsed = parseToolArgs(String(argsText ?? ""))
    return parsed === null ? [] : secretValuesOf(parsed)
  }

  /** 帧面加宽掩蔽/截断（管理面同源——转发浏览器前）：`call.args`/`ask.args` ≤500 ∥ 结果摘要 ≤300 截断不变；
   *  **`result.summary` ∥ `result.content` = `maskSecrets` 值掩蔽**（秘密值 = 该 `call` 帧 args 敏感键值——同管理面取值面）；
   *  `content` **保全文长度**（设计截断口径只列 args ≤500 ∥ 摘要 ≤300——content 不套截断；`secrets` 缺省 = 空集 ⇒ 值原样透传）。
   *  `ask` 帧 = 同源单点：`permission.args` 走 `argsTextOf`（敏感键掩蔽 ⇒ 截断≤500）；秘密面载荷零值（构造面即描述面）。 */
  function cappedFrame(frame, secrets = []) {
    if (frame?.type === "call") return { ...frame, args: argsTextOf(String(frame.args ?? "")) }
    if (frame?.type === "ask") {
      const out = { ...frame }
      if (out.kind === "permission" && out.args !== undefined) out.args = argsTextOf(String(out.args ?? ""))
      return out
    }
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

  /** 子代理键活性投影（`sub` 帧事件面——`abort { key }` 的「在跑 key」判据）：归约单源 = 核件
   *  `relayEventToSubPatch`（文法/终态词全在件——服务端零第二表达式）；出生/排队/轮次 ⇒ 在跑，终态三值 ⇒ 出表。 */
  function trackSubFrame(turn, frame) {
    if (frame?.ev !== true) return
    let patch = null
    try {
      patch = relayEventToSubPatch(String(frame.token ?? ""), turn.scope, { now })
    } catch (e) {
      log?.warn("member_relay_sub_patch_failed", { workspaceId: turn.workspaceId, message: e?.message ?? String(e) })
      return
    }
    if (!patch) return
    const key = `${patch.role}#${patch.id}`
    if (patch.status === "done" || patch.status === "settled" || patch.status === "cancelled") turn.keys.delete(key)
    else turn.keys.add(key)
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

  /** ping 节拍（每连接一枚）：应答超窗 ⇒ 该工作区在途回合全按掉线径收尾（**一次**）；节拍续发不锁死（晚到应答即自愈在线态）。 */
  function tick(box) {
    if (boxOf(box.workspace.id) !== box) return
    if (now() - box.lastPongAt > pongWindowMs) {
      for (const turn of turnsOf(box.workspace.id)) settleTurn(turn, { reason: "box_lost" })
      settleCommands(box.workspace.id)
    }
    send(box.workspace.id, "ping", {})
  }

  return {
    online,
    /** 回合在途读数：`sessionId` 在场 ⇒ **该会话**是否有在跑回合（在途门取数面——KD-SV-223「同会话第二回合」）；
     *  缺省 ⇒ 该工作区是否有任一会话在跑（列表/状态读数面）。 */
    busy(workspaceId, sessionId = null) {
      if (sessionId !== null && sessionId !== undefined) return turns.has(turnKey(workspaceId, sessionId))
      return turnsOf(workspaceId).length > 0
    },
    /** 在决 ask 读数（会话行 `awaitingApproval` 源——member-face-parity 批：列表合并时注入）。 */
    pendingAskOf(workspaceId, sessionId) {
      const turn = turns.get(turnKey(workspaceId, sessionId))
      return turn !== undefined && turn.asks.size > 0
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
    /** 盒连接断开（掉线径）：该工作区在途回合全收尾（notice + `end{failed,box_lost}`）＋ **同拍未收尾命令同款收尾**（#1403）。
     *  `token` 传则以本连接为准（被顶替的旧连接关闭 ⇒ 不触新连接）。 */
    detach(workspaceId, token = null) {
      const box = boxOf(workspaceId)
      if (!box) return false
      if (token !== null && box.token !== token) return false
      boxes.delete(Number(workspaceId))
      clearInterval(box.timer)
      for (const turn of turnsOf(workspaceId)) settleTurn(turn, { reason: "box_lost" })
      settleCommands(workspaceId)
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
    /** 拉仓下行（`pull`——**凭据不随命令**；不设超时：克隆时长不可预期；掉线 ⇒ 同款收尾（#1403——不再长悬）。 */
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
    /** 发消息 = 起一回合（**会话级**在途门——同会话重复 ⇒ 抛 400 人话；跨会话并行放开）；出 = `{ cmdId, done }`。 */
    startTurn({ workspace, sessionId, content, images = [], emit: emitFrame }) {
      const key = turnKey(workspace.id, sessionId)
      if (turns.has(key)) throw new HttpError("invalid_request_error", SESSION_BUSY_MESSAGE)
      if (!online(workspace.id)) throw new HttpError("workspace_offline", "工作区未运行或未连接")
      const cmdId = nextCmdId()
      let resolveDone = null
      const done = new Promise((resolve) => {
        resolveDone = resolve
      })
      const turn = {
        cmdId, workspaceId: Number(workspace.id), workspace, sessionId: String(sessionId), emit: emitFrame,
        calls: new Map(), asks: new Set(), keys: new Set(), scope: createRelayScope(), settled: false, resolveDone,
      }
      turns.set(key, turn)
      turnByCmd.set(cmdId, turn)
      const payload = { cmdId, sessionId: turn.sessionId, content }
      if (Array.isArray(images) && images.length > 0) payload.images = images // 图片通道（§3.11(6)——流前门已过门）
      if (!send(workspace.id, "run", payload)) {
        turns.delete(key)
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
      return turns.get(turnKey(workspaceId, sessionId)) ?? null
    },
    /** 回合帧转发（帧表增补七型 + `end`）：`call` 帧登记（供 `result` 帧对位——审计 ∥ 掩蔽取值面）∥ `sub` 帧
     *  键活性投影（`abort{key}` 判据）∥ `ask` 帧登记在途表（应答回程对位）∥ `end` ⇒ 收尾。未知 cmdId ⇒ false。 */
    feedTurn(cmdId, frame) {
      const turn = turnByCmd.get(String(cmdId))
      if (!turn) return false
      if (frame?.type === "call") turn.calls.set(String(frame.id ?? ""), { name: frame.name, secrets: callSecretsOf(frame.args) })
      if (frame?.type === "sub") {
        trackSubFrame(turn, frame)
        emit(turn, frame)
      } else if (frame?.type === "ask") {
        const promptId = String(frame.promptId ?? "")
        const kind = String(frame.kind ?? "")
        if (promptId === "" || !ASK_KINDS.includes(kind)) {
          log?.warn("member_relay_ask_malformed", { workspaceId: turn.workspaceId, sessionId: turn.sessionId, promptId, kind })
        } else {
          asks.set(promptId, { turn, kind })
          turn.asks.add(promptId)
        }
        emit(turn, frame)
      } else if (frame?.type === "result") {
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
    /** ask 应答（浏览器 ⇒ `POST …/asks/:promptId` ⇒ 下行 `answer`）：命中在途 ask ∧ 体与 kind 相符 ⇒ 下行 + 清表项（真）；
     *  未知/已了结（回合收尾 ∥ 后到）∥ 体不合 ⇒ 假（调用侧 400 零副作用；在途表零改）。 */
    answerAsk(workspaceId, sessionId, promptId, payload = {}) {
      const entry = asks.get(String(promptId))
      if (!entry) return false
      const turn = entry.turn
      if (turn.settled || turn.workspaceId !== Number(workspaceId) || turn.sessionId !== String(sessionId)) return false
      const body = askAnswerBodyOf(entry.kind, payload)
      if (body === null) return false
      asks.delete(String(promptId))
      turn.asks.delete(String(promptId))
      return send(workspaceId, "answer", { promptId: String(promptId), kind: entry.kind, ...body })
    },
    /** 回合流中止（盒侧流中断——无 `end` 帧收口）：按失败收尾（如实补帧——`detail` 明写中断因）。 */
    finishTurnStream(cmdId) {
      const turn = turnByCmd.get(String(cmdId))
      if (!turn) return false
      settleTurn(turn, { frame: { type: "end", status: "failed", reason: "model_error", detail: "回合流中断（盒未回终止帧）" } })
      return true
    },
    /** 中止（`abort` 下行）：非在途 ∥ 会话不符 ⇒ false（调用侧 400 零副作用）。
     *  `key` 在场 = **停单件**（`<role>#<id>`——子代理块 ⏹）：该键不在跑 ⇒ false（调用侧 400 零副作用，不终回合）。 */
    abortTurn(workspaceId, sessionId, { key = null } = {}) {
      const turn = turns.get(turnKey(workspaceId, sessionId))
      if (!turn) return false
      if (key !== null && key !== undefined) {
        const text = String(key)
        if (!turn.keys.has(text)) return false
        return send(workspaceId, "abort", { cmdId: turn.cmdId, sessionId: turn.sessionId, key: text })
      }
      send(workspaceId, "abort", { cmdId: turn.cmdId, sessionId: turn.sessionId })
      return true
    },
    /** 停机/测试收口：断开全部连接（清 ping 节拍；在途回合按掉线径收尾）＋ 未收尾命令同款收尾（#1403——pending 清空）。 */
    closeAll() {
      const cmdWorkspaces = [...new Set([...pending.values()].map((entry) => entry.workspaceId))]
      for (const workspaceId of [...boxes.keys()]) {
        const box = boxes.get(workspaceId)
        clearInterval(box.timer)
        boxes.delete(workspaceId)
        for (const turn of turnsOf(workspaceId)) settleTurn(turn, { reason: "box_lost" })
      }
      for (const workspaceId of cmdWorkspaces) settleCommands(workspaceId)
    },
  }
}
