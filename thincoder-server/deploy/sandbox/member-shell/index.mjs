/**
 * index.mjs — 盒内成员会话壳（进程入口；`sandbox/EXECUTION.md` §8 件位契约 `CMD`）
 *
 * 职责（`agent/MEMBER-AGENT.md` §3.10）：连挂 server（下行 SSE）∥ 接指令与回合（上行 NDJSON）∥
 * 执行拉仓命令——**不是第二套 agent**（循环/会话/提示词/工具一律取核件，见 `core-run.mjs`）。
 *
 * 协议面（§3.3——逐值）：下行 `GET /api/box/events` = SSE 六事件 hello ∥ run ∥ abort ∥ pull ∥
 * cmd ∥ ping；上行 `POST /api/box/sessions/:id/turns`（NDJSON 帧流：begin ⇒ 六帧 ⇒ end）∥
 * `POST /api/box/commands/:cmdId/result`（`{ state, detail }`）∥ `POST /api/box/ping`（应答）
 * ——凭据 = 工作区 key（`OPENAI_API_KEY`，第二门 KD-SV-154）；基址 = `TC_SERVER_URL`。
 *
 * 掉线/重连（§3.4 收尾三径②——**盒侧对称**）：上行失败 ⇒ **中止本地回合**；重连 = 指数退避
 * （1s → 30s 封顶）；**重连后零对齐动作**（真源在盒内——槽文件即事实；`hello.redeliver` 的
 * 未收尾命令由 server 重派，盒侧零动作）。在途单飞 = 工作区级（服务端门之外的盒侧兜底——
 * 收到第二回合 ⇒ 立即回 failed 流）。
 *
 * 本档 = 可注入骨架（`fetchImpl`/`coreRun`/`pull`/`sleep`/`now`）——单元测试以假件驱动；
 * 生产过程装配在档尾 `main()`（仅直跑时执行）。
 */
import { realpathSync } from "node:fs"
import { pathToFileURL } from "node:url"
import { createCoreRun, loadCore, slotOf } from "./core-run.mjs"
import { createPull } from "./pull.mjs"
import { beginFrame, createSseParser, encodeFrame, endFrame } from "./protocol.mjs"

const RECONNECT_BASE_MS = 1000
const RECONNECT_MAX_MS = 30000

/** 盒内壳（可注入——测试面）。
 * @param {{env?: object, fetchImpl?: Function|null, coreRun: object, pull?: object|null, log?: object,
 *          sleep?: (ms: number) => Promise<void>, now?: () => number}} opts
 */
export function createShell({
  env = process.env,
  fetchImpl = null,
  coreRun,
  pull = null,
  log = console,
  sleep = (ms) => new Promise((done) => setTimeout(done, ms)),
  now = Date.now,
} = {}) {
  if (!coreRun) throw new Error("createShell: coreRun required")
  const fetchFn = fetchImpl ?? ((url, init) => globalThis.fetch(url, init))
  const baseUrl = String(env.TC_SERVER_URL ?? "").replace(/\/+$/, "")
  const apiKey = String(env.OPENAI_API_KEY ?? "")
  const pullExec = pull ?? createPull({ cwd: coreRun.cwd, env })

  const state = {
    stopped: false,
    shutdown: new AbortController(),
    running: null, // { cmdId, sessionId, controller }——工作区级在途（单飞）
    connections: 0,
    events: 0,
    reconnects: 0,
  }
  const runningSlot = () => (state.running ? slotOf(state.running.sessionId) : null)
  const warn = (message) => { try { log.warn?.(message) } catch { /* 日志面尽力 */ } }

  // ========== 上行 ==========

  async function postJson(path, body) {
    const res = await fetchFn(`${baseUrl}${path}`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
      body: JSON.stringify(body ?? {}),
    })
    // 响应码留痕（零重试——只为可诊断：未知/已了结 cmdId ⇒ 400 零副作用，ping 同形）
    if (!res?.ok) warn(`[shell] 上行 ${path} 非 2xx（HTTP ${res?.status ?? "?"}）——按零重试处置`)
    return res
  }

  async function postCommandResult(cmdId, resultState, detail) {
    if (!cmdId) return
    try {
      await postJson(`/api/box/commands/${encodeURIComponent(cmdId)}/result`, { state: resultState, detail: detail ?? null })
    } catch (e) {
      warn(`[shell] 命令结果回呈失败（${cmdId}）：${e?.message ?? e}`)
    }
  }

  /** ping 应答（§3.3 上行表——在线判据取数面；失败即忽略，重连面兜底）。 */
  async function postPing() {
    try {
      await postJson("/api/box/ping", { t: now() })
    } catch (e) {
      warn(`[shell] ping 应答失败：${e?.message ?? e}`)
    }
  }

  /** 回合上行流：`begin` 即发；上行失败 ⇒ 中止本地回合（掉线对称面）。 */
  function openTurnStream(sessionId, cmdId, controller) {
    const encoder = new TextEncoder()
    let ctrl = null
    let broken = null
    const markBroken = (reason) => {
      if (broken) return
      broken = reason instanceof Error ? reason : new Error(String(reason ?? "上行失败"))
      try { controller.abort(broken) } catch { /* 回合已结 */ }
    }
    const body = new ReadableStream({
      start(c) {
        ctrl = c
        c.enqueue(encoder.encode(encodeFrame(beginFrame(cmdId))))
      },
      cancel: (reason) => markBroken(reason),
    })
    const request = fetchFn(`${baseUrl}/api/box/sessions/${encodeURIComponent(sessionId)}/turns`, {
      method: "POST",
      headers: { authorization: `Bearer ${apiKey}`, "content-type": "application/x-ndjson" },
      body,
      duplex: "half", // 流式请求体（undici 要求；服务端 = 路由级流式体读）
      signal: state.shutdown.signal,
    }).then(
      (res) => {
        if (!res?.ok) markBroken(new Error(`turns HTTP ${res?.status ?? "?"}`))
        return res
      },
      (e) => {
        markBroken(e)
        return null
      },
    )
    return {
      ready: request,
      frame(frame) {
        if (broken) return
        try {
          ctrl.enqueue(encoder.encode(encodeFrame(frame)))
        } catch (e) {
          markBroken(e)
        }
      },
      close() {
        try {
          if (broken) ctrl.error(broken)
          else ctrl.close()
        } catch { /* 流已结 */ }
      },
      get broken() {
        return broken
      },
    }
  }

  // ========== 下行处理 ==========

  async function handleRun(evt) {
    const { cmdId, sessionId, content } = evt
    if (state.running) {
      // 盒侧防御（工作区级单飞——服务端在途门之外的兜底）：立即回失败流，不排第二回合
      const sink = openTurnStream(sessionId, cmdId, new AbortController())
      sink.frame(endFrame({ status: "failed", reason: "busy", message: "该工作区正在执行另一回合" }))
      sink.close()
      await sink.ready
      return
    }
    const controller = new AbortController()
    const sink = openTurnStream(sessionId, cmdId, controller)
    state.running = { cmdId, sessionId, controller }
    try {
      const end = await coreRun.runTurn({
        sessionId,
        content,
        signal: controller.signal,
        onFrame: (frame) => sink.frame(frame),
      })
      sink.frame(end)
    } catch (e) {
      sink.frame(endFrame({ status: "failed", reason: e?.kind ?? "internal", message: String(e?.message ?? e) }))
    } finally {
      sink.close()
      state.running = null
      await sink.ready
    }
  }

  /** 中止事件：只中止在途回合（**零结果回呈**——abort 事件携的 `cmdId` 是**回合** cmdId，不在 server `pending` 表；
   *  终态回呈 = 该回合流的 `end { failed, aborted }`——`MEMBER-AGENT.md` §3.4）。 */
  function handleAbort(evt) {
    const { sessionId } = evt
    const running = state.running
    const aborted = Boolean(running && (sessionId === undefined || String(running.sessionId) === String(sessionId)))
    if (aborted) {
      try { running.controller.abort() } catch { /* 回合已结 */ }
    } else {
      warn(`[shell] abort 无对位在途回合（sessionId=${sessionId}）——零动作`)
    }
  }

  async function handlePull(evt) {
    const { cmdId, url, dir } = evt
    try {
      const result = await pullExec.runPull({ url, dir, signal: state.shutdown.signal })
      await postCommandResult(cmdId, result.state, result.detail)
    } catch (e) {
      await postCommandResult(cmdId, "failed", { kind: "internal", message: String(e?.message ?? e) })
    }
  }

  async function handleCmd(evt) {
    const { cmdId, kind } = evt
    const args = evt.args && typeof evt.args === "object" ? evt.args : {}
    try {
      if (kind === "sessions.list") {
        await postCommandResult(cmdId, "done", { sessions: coreRun.listSessions({ runningSlot: runningSlot() }) })
      } else if (kind === "session.read") {
        const out = coreRun.readSession(args.slot ?? args.sessionId ?? args.id, { runningSlot: runningSlot() })
        if (!out) await postCommandResult(cmdId, "failed", { notFound: true, kind: "not_found", message: "会话不存在" })
        else await postCommandResult(cmdId, "done", out)
      } else if (kind === "session.create") {
        await postCommandResult(cmdId, "done", await coreRun.createSession({ model: args.model ?? null }))
      } else if (kind === "session.update") {
        const out = coreRun.updateSession(args)
        if (!out) await postCommandResult(cmdId, "failed", { notFound: true, kind: "not_found", message: "会话不存在" })
        else await postCommandResult(cmdId, "done", out)
      } else {
        await postCommandResult(cmdId, "failed", { kind: "invalid_request", message: `未知指令：${kind}` })
      }
    } catch (e) {
      await postCommandResult(cmdId, "failed", { kind: e?.kind ?? "internal", message: String(e?.message ?? e) })
    }
  }

  function dispatch(evt) {
    state.events += 1
    const name = evt?.event
    const data = evt?.data && typeof evt.data === "object" ? evt.data : {}
    if (name === "ping") void postPing()
    else if (name === "hello") {
      // 未收尾命令重派清单 = server 内存态；重派由其自行发事件——盒侧零动作（重连零对齐）
      log.info?.(`[shell] hello——重派清单 ${Array.isArray(data.redeliver) ? data.redeliver.length : 0} 条`)
    } else if (name === "run") void handleRun(data)
    else if (name === "abort") handleAbort(data)
    else if (name === "pull") void handlePull(data)
    else if (name === "cmd") void handleCmd(data)
    else warn(`[shell] 未知事件：${name}`)
  }

  /** 消费一条 SSE 响应（读到流尽头即返回；出错抛出交给重连面）。 */
  async function consumeSse(res) {
    const parser = createSseParser()
    const decoder = new TextDecoder()
    const reader = res.body.getReader()
    try {
      for (;;) {
        const { done, value } = await reader.read()
        if (done || state.stopped) break
        for (const evt of parser.push(decoder.decode(value, { stream: true }))) dispatch(evt)
      }
      for (const evt of parser.push(decoder.decode())) dispatch(evt) // 多字节尾字符收尾（流止于字符中段时）
      for (const evt of parser.flush()) dispatch(evt)
    } finally {
      try { await reader.cancel() } catch { /* 流已关 */ }
    }
  }

  async function connectLoop() {
    let backoff = RECONNECT_BASE_MS
    while (!state.stopped) {
      let connected = false
      try {
        const res = await fetchFn(`${baseUrl}/api/box/events`, {
          headers: { authorization: `Bearer ${apiKey}`, accept: "text/event-stream" },
          signal: state.shutdown.signal,
        })
        if (!res?.ok) throw new Error(`events HTTP ${res?.status ?? "?"}`)
        connected = true
        backoff = RECONNECT_BASE_MS
        state.connections += 1
        log.info?.("[shell] 已连接 server（SSE）")
        await consumeSse(res)
      } catch (e) {
        if (!state.stopped) warn(`[shell] SSE 连接错误：${e?.message ?? e}`)
      }
      if (state.stopped) break
      if (connected) state.reconnects += 1
      // 断开即退避（正常断开与其后每次同径）：退避指数增长 1s → 30s 封顶（档头口径——
      // 防「接受即断」的对端把重连打成无增长快环）
      const wait = backoff
      backoff = Math.min(backoff * 2, RECONNECT_MAX_MS)
      await sleep(wait)
    }
  }

  return {
    state,
    start: connectLoop,
    async stop() {
      if (state.stopped) return
      state.stopped = true
      try { state.shutdown.abort() } catch { /* 已中止 */ }
      if (state.running) {
        try { state.running.controller.abort() } catch { /* 回合已结 */ }
      }
    },
  }
}

// ========== 生产过程装配（仅直跑——`node /opt/thincoder/app/shell/index.mjs`）==========

async function main() {
  const env = process.env
  const missing = ["TC_SERVER_URL", "OPENAI_API_KEY", "OPENAI_BASE_URL"].filter((key) => !env[key])
  if (missing.length > 0) {
    console.error(`[shell] 缺少环境变量：${missing.join(" ∥ ")}——盒未就绪，退出`)
    process.exitCode = 1
    return
  }
  const core = await loadCore()
  const shell = createShell({ env, coreRun: createCoreRun({ env, core }) })
  const shutdown = () => {
    void shell.stop()
  }
  process.on("SIGTERM", shutdown)
  process.on("SIGINT", shutdown)
  await shell.start()
}

// 入口判据：`argv[1]` 先经 realpath 解析再比（KD-SV-53 / #1114 已锁形式——同 `git-cred.mjs`；
// 经符号链接/垫片启动时未解析变体恒假 ⇒ 静默退出 0，盒永不连挂）。
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  await main()
}
