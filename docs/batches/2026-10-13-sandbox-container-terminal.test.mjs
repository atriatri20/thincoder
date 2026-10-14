/**
 * 2026-10-13-sandbox-container-terminal.test.mjs — thincoder-server 批内单测件（`sandbox-container-terminal` 批 · 服务端面——
 * 最小 WS 服务端 ∥ Docker exec 升级传输 ∥ 终端升级路；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-sandbox-container-terminal.test.mjs`
 * 夹具（WS 客户端 ∥ 假 Docker 引擎 ∥ 进程内应用）= `2026-10-13-sandbox-container-terminal.harness.mjs`（本档 >500 软线 ⇒ 夹具外提；用例全量在本档）。
 *
 * 射程（判据源 = 批档 §2 + `docs/server/design/sandbox/SANDBOX.md` §12 用例表；腿 ↔ 用例在括号）：
 *   N83（全链逐值：握手 `Sec-WebSocket-Accept` 逐字 ∥ 建 exec 体 ∥ start 体 ∥ 上行字节 ⇒ 引擎同字节 ∥ 引擎字节 ⇒ 下行同字节 ∥
 *     首帧 resize 就绪后一次发出（`h`/`w` 逐值）∥ 引擎流结束 ⇒ exit 帧（ExitCode）⇒ close 1000 ∥ 审计两行）
 *   ∥ N84（ready 协作：ready 在首帧 resize 之后（挂起施加）∥ `{"t":"ping"}` ⇒ `{"t":"pong"}`（分片帧重组）∥ 二次 resize 逐值）
 *   ∥ N85（两会话各自独立 execId/审计对 ∥ 停机 ⇒ 全收口 `server_stop` + 表清空）
 *   ∥ B79（非运行容器 in-band `container_not_running`（零 exec 调用）∥ 就绪前 resize 挂起（零引擎调用）∥ 非法 resize 忽略零调用）
 *   ∥ B80（心跳两向：服务端 ping 不回 pong ⇒ 判死收口三件（`\x04` ∥ destroy ∥ WS close）+ 审计 `client_close`；客户端 ping ⇒ pong）
 *   ∥ B81（收口幂等：close 与引擎结束同至 ⇒ 恰一次 ∥ 建链中途断 ⇒ start 应答到达即收口（零悬挂））
 *   ∥ E61（不可达 ⇒ `engine_unreachable` ∥ 建 exec 409 ⇒ `container_not_running` ∥ 非 2xx ⇒ `exec_failed` 携 detail；
 *     各自审计 `terminal_close`（`reason='error'`）+ 表清空）
 *   ∥ E62（无 cookie 401 ∥ `user` 403 ∥ 异源 403 ∥ 未知升级路径 404 ∥ 节点不存在 404——全在 101 之前；未接线网关 ⇒ 404）
 *   ∥ E63（未掩码帧 ∥ 非法 opcode ∥ 帧超 1 MiB ∥ 文本帧非 UTF-8 ⇒ close 1002 + 审计 `error` + 表清空 ∥ 服务端不崩）
 *   ∥ 纯函数腿（`wsAcceptKey` RFC 逐字 ∥ 帧编解码（两档长度/掩码）∥ `buildExecBody`/`terminalEnv` ∥ `containerRunning` ∥
 *     `matchTerminalPath` ∥ `isSameOrigin` ∥ `parseResizeControl` ∥ `execFailureInfo`）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { createHash } from "node:crypto"

import {
  DOCKER, EXEC, REGISTRY, RawWs, TERMINAL, WS,
  clientFrame, countByte, deadBase, frameHeader, openTerminal, startApp, startFakeDocker, terminalUrl, wait, waitUntil,
} from "./2026-10-13-sandbox-container-terminal.harness.mjs"

// ── 纯函数腿（RFC 逐字 ∥ 编解码 ∥ 体构造 ∥ 门/域/映射）─────────────────────────────

test("纯函数：`wsAcceptKey` RFC 逐字 ∥ 帧编解码（掩码/两档长度/分片头）∥ 体构造/环境/运行态 ∥ 路径/同源/尺寸/失败映射", () => {
  // RFC 6455 §1.3 样例：key ⇒ accept 逐字
  assert.equal(WS.wsAcceptKey("dGhlIHNhbXBsZSBub25jZQ=="), "s3pPLMBiTxaQ9kYGzzhZRbK+xOo=", "握手接受键逐字")
  for (const [opcode, payload] of [[0x1, Buffer.from("hi")], [0x2, Buffer.alloc(200, 7)], [0x2, Buffer.alloc(70000, 9)], [0x9, Buffer.alloc(0)]]) {
    const decoded = WS.decodeFrame(WS.encodeFrame(opcode, payload))
    assert.deepEqual([decoded.ok, decoded.opcode, decoded.masked, decoded.payload.equals(payload)], [true, opcode, false, true], `编解码往返（opcode ${opcode} ∥ ${payload.length}B——两档长度）`)
  }
  assert.deepEqual(WS.decodeFrame(Buffer.from([0x81])), { ok: false, needMore: true }, "头不足 ⇒ needMore")
  assert.equal(WS.decodeFrame(Buffer.from([0xc1, 0x00])).ok, false, "RSV 置位 ⇒ 协议错形")
  const frame = clientFrame(0x1, Buffer.from("掩"))
  const round = WS.decodeFrame(frame)
  assert.deepEqual([round.ok, round.masked, round.payload.toString("utf8")], [true, true, "掩"], "掩码帧解码（客户端形）")
  assert.equal(WS.declaredFrameLength(frameHeader(0x2, 0x100001)), 0x100001, "声明长度（127 形——超限腿前置）")
  assert.deepEqual(WS.encodeCloseFrame(1002, "protocol error").subarray(0, 2), Buffer.from([0x88, 0x10]), "close 帧头（1002 + 14 字节原因）")

  assert.deepEqual(EXEC.buildExecBody({ Config: { Env: ["PATH=/usr/bin"] } }), {
    AttachStdin: true, AttachStdout: true, AttachStderr: true, Tty: true,
    Env: ["TERM=xterm-256color", "LANG=C.UTF-8"],
    Cmd: ["/bin/sh", "-c", "if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi"],
  }, "建 exec 体逐值（三旗 + Tty + Env 两键 + Cmd 常量三件）")
  assert.deepEqual(EXEC.terminalEnv({ Config: { Env: ["LANG=zh_CN.UTF-8"] } }), ["TERM=xterm-256color"], "容器自带 locale ⇒ 零覆盖")
  assert.deepEqual(EXEC.buildStartBody(), { Detach: false, Tty: true }, "start 体逐值")
  assert.equal(EXEC.containerRunning({ State: { Status: "exited" } }), false, "非 running 拒")
  assert.equal(EXEC.containerRunning({ State: { Running: true } }), true, "布尔态同源")

  assert.deepEqual(TERMINAL.matchTerminalPath("/api/admin/sandbox/runners/7/containers/abc/terminal"), { runnerId: "7", containerId: "abc" }, "路径匹配逐值")
  assert.equal(TERMINAL.matchTerminalPath("/api/admin/sandbox/runners/7/containers/abc/logs"), null, "非终端路径不匹配")
  assert.equal(TERMINAL.isSameOrigin({ headers: {} }), true, "缺 Origin ⇒ 放行（判权仍为会话）")
  assert.equal(TERMINAL.isSameOrigin({ headers: { origin: "http://a.b:1", host: "a.b:1" } }), true, "同源放行")
  assert.equal(TERMINAL.isSameOrigin({ headers: { origin: "http://evil.b", host: "a.b:1" } }), false, "异源拒")
  assert.equal(TERMINAL.isSameOrigin({ headers: { origin: "null", host: "a.b" } }), false, "Origin: null 拒")
  assert.deepEqual(TERMINAL.parseResizeControl({ cols: 80, rows: 24 }), { cols: 80, rows: 24 }, "尺寸合法域内")
  for (const bad of [{ cols: 0, rows: 24 }, { cols: 999, rows: 24 }, { cols: "80", rows: 24 }, { cols: 80.5, rows: 24 }, {}]) {
    assert.equal(TERMINAL.parseResizeControl(bad), null, `非法尺寸忽略：${JSON.stringify(bad)}`)
  }
  const unreachable = TERMINAL.execFailureInfo(new DOCKER.DockerError("unreachable", "节点不可达"))
  assert.deepEqual([unreachable.code, unreachable.detail], ["engine_unreachable", "节点不可达"], "不可达 ⇒ engine_unreachable")
  const busy = TERMINAL.execFailureInfo(new DOCKER.DockerError("api", "x", { status: 409, apiMessage: "container 4f8a is not running" }), { step: "create" })
  assert.deepEqual([busy.code, busy.detail], ["container_not_running", "container 4f8a is not running"], "建 exec 409 ⇒ container_not_running")
  const refused = TERMINAL.execFailureInfo(new DOCKER.DockerError("api", "x", { status: 500, apiMessage: "engine says no" }), { step: "create" })
  assert.deepEqual([refused.code, refused.detail], ["exec_failed", "engine says no"], "非 2xx ⇒ exec_failed 携引擎原文")
})

// ── N83 全链逐值 ───────────────────────────────────────────────────────────────

test("N83 终端会话全链：握手逐字 ∥ 建 exec 体/start 体逐值 ∥ 字节环回 ∥ resize 挂起施加 ∥ exit 帧 ⇒ close 1000 ∥ 审计两行", async () => {
  const engine = await startFakeDocker()
  const app = await startApp({ engine })
  const client = await openTerminal(app)
  try {
    assert.equal(client.status, 101, "升级 101")
    const expected = createHash("sha1").update(`${client.key}258EAFA5-E914-47DA-95CA-C5AB0DC85B11`).digest("base64")
    assert.equal(client.headers["sec-websocket-accept"], expected, "`Sec-WebSocket-Accept` 逐字")
    client.sendJson({ t: "resize", cols: 120, rows: 30 }) // 首帧 resize（就绪前挂起）
    const ready = await client.waitJson("ready")
    assert.deepEqual(ready, { t: "ready", cols: 120, rows: 30 }, "ready 在首帧 resize 之后（挂起施加）")

    assert.deepEqual(engine.state.execBodies[0], {
      AttachStdin: true, AttachStdout: true, AttachStderr: true, Tty: true,
      Env: ["TERM=xterm-256color", "LANG=C.UTF-8"],
      Cmd: ["/bin/sh", "-c", "if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi"],
    }, "建 exec 体逐值（引擎侧实收）")
    assert.deepEqual(engine.state.startBodies[0], { execId: "exec-1", body: '{"Detach":false,"Tty":true}', connection: "Upgrade", upgrade: "tcp" }, "start 体逐值 + 升级两头")
    assert.deepEqual(engine.state.resizeCalls, [{ execId: "exec-1", h: "30", w: "120" }], "首帧 resize 就绪后一次发出（h = rows ∥ w = cols）")

    client.sendBinary(Buffer.from("echo 你好\n", "utf8"))
    const back = await client.waitBinary()
    assert.deepEqual(back, Buffer.from("echo 你好\n", "utf8"), "字节环回（上行 ⇒ 引擎同字节 ⇒ 下行同字节）")
    assert.deepEqual(Buffer.concat(engine.pty.records[0].bytes), Buffer.from("echo 你好\n", "utf8"), "引擎侧收到上行同字节")

    engine.endPty()
    const exit = await client.waitJson("exit")
    assert.deepEqual(exit, { t: "exit", code: 7 }, "exit 帧携 inspect ExitCode")
    assert.equal((await client.waitClose()).code, 1000, "引擎流结束 ⇒ WS close 1000")

    const opens = app.audits("terminal_open")
    const closes = app.audits("terminal_close")
    assert.equal(opens.length, 1, "审计 open 一行")
    assert.deepEqual(Object.keys(opens[0].detail).sort(), ["cols", "containerId", "kind", "rows", "runnerId"], "`terminal_open` 键集五")
    assert.deepEqual([opens[0].detail.kind, opens[0].detail.containerId, opens[0].detail.cols, opens[0].detail.rows], ["terminal_open", "ctr-1", 120, 30], "就绪时值逐值")
    assert.equal(closes.length, 1, "审计 close 一行")
    assert.deepEqual(Object.keys(closes[0].detail).sort(), ["containerId", "durationMs", "kind", "reason", "runnerId"], "`terminal_close` 键集五")
    assert.deepEqual([closes[0].detail.reason, typeof closes[0].detail.durationMs], ["exec_exit", "number"], "`reason='exec_exit'` + `durationMs` 在场")
    assert.equal(app.hub.sessionCount, 0, "会话表清空")
  } finally {
    client.destroy()
    await app.close()
    await engine.close()
  }
})

// ── N83 补充腿：引擎首块残字节（101 与首块同段）────────────────────────────────────

test("N83 残字节腿：引擎 101 与首块同段到达（`'upgrade'` 的 `head`）⇒ 原样下行（不丢字节）", async () => {
  const engine = await startFakeDocker({ initialOutput: "root@ctr:~# " })
  const app = await startApp({ engine })
  const client = await openTerminal(app)
  try {
    const first = await client.waitBinary({ timeout: 3000 })
    assert.deepEqual(first, Buffer.from("root@ctr:~# ", "utf8"), "与 101 同段的首块原样下行（零丢字节）")
    await client.waitJson("ready") // 会话照常就绪（残字节腿不反噬）
    client.sendBinary(Buffer.from("ls\n", "utf8"))
    assert.deepEqual(await client.waitBinary(), Buffer.from("ls\n", "utf8"), "后续字节流环回照常")
  } finally {
    client.destroy()
    await app.close()
    await engine.close()
  }
})

// ── N84 ready 协作（pong ∥ 分片重组 ∥ 二次 resize）───────────────────────────────

test("N84 ready 协作：`{\"t\":\"ping\"}` ⇒ `{\"t\":\"pong\"}`（分片帧重组）∥ 就绪后 resize 逐帧直发（再发再施加）", async () => {
  const engine = await startFakeDocker()
  const app = await startApp({ engine })
  const client = await openTerminal(app)
  try {
    await client.waitJson("ready") // 未发 resize ⇒ 缺省 80×24 施加
    assert.deepEqual(engine.state.resizeCalls, [{ execId: "exec-1", h: "24", w: "80" }], "初值缺省 = 80×24（客户端未给）")

    // 分片重组：`ping` 帧切成两片（首片 opcode 1 ∥ 续片 opcode 0）
    const text = Buffer.from(JSON.stringify({ t: "ping" }), "utf8")
    client.sendRaw(Buffer.concat([clientFrame(0x1, text.subarray(0, 4), { fin: false }), clientFrame(0x0, text.subarray(4))]))
    assert.deepEqual(await client.waitJson("pong"), { t: "pong" }, "客户端 ping ⇒ pong 即时")

    client.sendJson({ t: "resize", cols: 100, rows: 40 })
    await waitUntil(() => engine.state.resizeCalls.length > 1)
    assert.deepEqual(engine.state.resizeCalls[1], { execId: "exec-1", h: "40", w: "100" }, "就绪后逐帧直发（h = rows ∥ w = cols）")
    assert.equal(app.hub.sessionCount, 1, "会话在飞（resize/ping 不反噬）")
  } finally {
    client.destroy()
    await app.close()
    await engine.close()
  }
})

// ── B79 非运行容器 ∥ 就绪前挂起 ∥ 非法忽略 ────────────────────────────────────────

test("B79 非运行容器：in-band `container_not_running`（零 exec 调用）⇒ 收口 ∥ 非法 resize 忽略（零调用 ∥ 会话不受影响）", async () => {
  const engine = await startFakeDocker({ containerJson: { State: { Status: "exited", Running: false }, Config: { Env: [] } } })
  const app = await startApp({ engine })
  const client = await openTerminal(app)
  try {
    const error = await client.waitJson("error")
    assert.deepEqual(error, { t: "error", code: "container_not_running" }, "in-band 非运行码（不开 exec）")
    assert.equal(engine.calls("/exec").length + engine.state.execBodies.length, 0, "引擎零 exec 调用")
    assert.equal((await client.waitClose()).code, 1001, "余项收口 ⇒ close 1001")
    const closes = app.audits("terminal_close")
    assert.deepEqual([closes.length, closes[0].detail.reason], [1, "error"], "审计 close（`reason='error'`）")
    assert.equal(app.hub.sessionCount, 0, "表清空")
  } finally {
    client.destroy()
    await app.close()
    await engine.close()
  }

  // 非法 resize 忽略（零引擎调用 ∥ 会话不受影响）——用另一条正常会话
  const engine2 = await startFakeDocker()
  const app2 = await startApp({ engine: engine2 })
  const client2 = await openTerminal(app2)
  try {
    await client2.waitJson("ready")
    const before = engine2.state.resizeCalls.length
    for (const bad of [{ t: "resize", cols: 0, rows: 24 }, { t: "resize", cols: "80", rows: 24 }, { t: "resize", cols: 999, rows: 24 }]) client2.sendJson(bad)
    await wait(60)
    assert.equal(engine2.state.resizeCalls.length, before, "非法 ⇒ 忽略（零引擎调用）")
    client2.sendJson({ t: "ping" })
    assert.deepEqual(await client2.waitJson("pong"), { t: "pong" }, "会话不受影响")
  } finally {
    client2.destroy()
    await app2.close()
    await engine2.close()
  }
})

test("B79 就绪前 resize ⇒ 挂起（零引擎调用——挂起施加一次）", async () => {
  const engine = await startFakeDocker({ holdRead: true }) // 容器读挂起 ⇒ 会话未就绪窗
  const app = await startApp({ engine })
  const client = await openTerminal(app)
  try {
    client.sendJson({ t: "resize", cols: 111, rows: 33 })
    await wait(80)
    assert.equal(engine.state.resizeCalls.length, 0, "就绪前 resize ⇒ 挂起（零引擎调用）")
    assert.equal(engine.state.execBodies.length, 0, "链未推进（读容器在飞）")
    engine.state.releaseRead()
    assert.deepEqual(await client.waitJson("ready"), { t: "ready", cols: 111, rows: 33 }, "就绪后按挂起值施加")
    assert.deepEqual(engine.state.resizeCalls, [{ execId: "exec-1", h: "33", w: "111" }], "挂起值一次发出（零多余调用）")
  } finally {
    client.destroy()
    await app.close()
    await engine.close()
  }
})

// ── B80 心跳两向 ──────────────────────────────────────────────────────────────

test("B80 心跳：服务端 ping 不回 pong ⇒ 判死（收口三件逐呼 + 审计 `client_close`）∥ 客户端 ping ⇒ pong（服务端应答）", async () => {
  const engine = await startFakeDocker()
  const app = await startApp({ engine, hubOptions: { heartbeatMs: 50, deadMs: 600 } })
  const silent = await openTerminal(app) // 不回 pong（裸客户端默认）
  try {
    await silent.waitJson("ready")
    const pinged = await silent.next((frame) => frame.opcode === 0x9, { timeout: 2000, label: "服务端 ping" }).then(() => true).catch(() => false)
    assert.equal(pinged, true, "服务端 WS ping 帧在场（周期配置值）")
    assert.equal((await silent.waitClose(3000)).code, 1001, "判死 ⇒ WS close 1001")
    await waitUntil(() => engine.pty.records[0]?.closed === true) // 收口②（destroy）在写回调后落——轮询代替定值睡
    assert.equal(countByte(Buffer.concat(engine.pty.records[0].bytes), 0x04), 1, "收口①：向 pty 写 `\\x04`（恰一次）")
    assert.equal(engine.pty.records[0].closed, true, "收口②：Docker 连接 destroy")
    const closes = app.audits("terminal_close")
    assert.deepEqual([closes.length, closes[0].detail.reason], [1, "client_close"], "判死归 `client_close`")
    assert.equal(app.hub.sessionCount, 0, "表清空")
  } finally {
    silent.destroy()
    await app.close()
    await engine.close()
  }

  // 心跳存活腿：客户端自动 pong ⇒ 会话不被判死
  const engine2 = await startFakeDocker()
  const app2 = await startApp({ engine: engine2, hubOptions: { heartbeatMs: 50, deadMs: 600 } })
  const alive = await openTerminal(app2, { autoPong: true })
  try {
    await alive.waitJson("ready")
    await wait(900) // 数个心跳周期（含短于判死窗的初值）
    assert.equal(app2.hub.sessionCount, 1, "自动 pong ⇒ 判死不触发")
    alive.sendJson({ t: "ping" })
    assert.deepEqual(await alive.waitJson("pong"), { t: "pong" }, "客户端文本 ping ⇒ 服务端回 pong")
  } finally {
    alive.destroy()
    await app2.close()
    await engine2.close()
  }
})

// ── B81 收口幂等 ∥ 中途断链 ────────────────────────────────────────────────────

test("B81 收口幂等：客户端 close 与引擎结束同至 ⇒ 收口一次（单审计 ∥ 单 `\\x04`）∥ 建链中途断 ⇒ start 应答到达即收口", async () => {
  const engine = await startFakeDocker()
  const app = await startApp({ engine })
  const client = await openTerminal(app)
  try {
    await client.waitJson("ready")
    client.close(1000)
    engine.endPty()
    await client.waitClose()
    await waitUntil(() => countByte(Buffer.concat(engine.pty.records[0].bytes), 0x04) === 1)
    assert.equal(app.audits("terminal_close").length, 1, "收口一次（零第二行审计）")
    assert.equal(countByte(Buffer.concat(engine.pty.records[0].bytes), 0x04), 1, "零第二次 `\\x04`")
    assert.equal(app.hub.sessionCount, 0, "表零悬挂")
  } finally {
    client.destroy()
    await app.close()
    await engine.close()
  }

  // 中途断链：start 应答未达时客户端断开 ⇒ 应答到达即收口（会话表零悬挂 ∥ exec 不残留）
  const engine2 = await startFakeDocker({ holdStart: true })
  const app2 = await startApp({ engine: engine2 })
  const mid = await openTerminal(app2)
  for (let i = 0; i < 100 && engine2.state.startBodies.length === 0; i++) await wait(10)
  assert.equal(engine2.state.startBodies.length, 1, "start 请求已发（应答被扣）")
  mid.destroy() // 建链中途断（start 应答前）
  await waitUntil(() => app2.hub.sessionCount === 0) // 断已生效（收口先于 start 应答）——零定值睡
  engine2.state.releaseStart()
  await waitUntil(() => countByte(Buffer.concat(engine2.pty.records[0]?.bytes ?? []), 0x04) === 1)
  assert.equal(app2.hub.sessionCount, 0, "断后 start 应答到达 ⇒ 立即收口（会话表零悬挂）")
  assert.equal(app2.audits("terminal_close").length, 1, "收口恰一次（审计一行）")
  assert.equal(countByte(Buffer.concat(engine2.pty.records[0]?.bytes ?? []), 0x04), 1, "start 应答到达即向 pty 写 `\\x04`（exec 不残留）")
  await app2.close()
  await engine2.close()
})

// ── E61 引擎失败三码 ──────────────────────────────────────────────────────────

test("E61 引擎失败：不可达 ⇒ `engine_unreachable` ∥ 建 exec 409 ⇒ `container_not_running` ∥ 非 2xx ⇒ `exec_failed` 携 detail（各自审计 error + 表清空）", async () => {
  const dead = await deadBase()
  const app = await startApp()
  const deadRunner = REGISTRY.insertRunner(app.db, { name: "node-dead", address: dead, runtime: { apiVer: "1.44", version: "29.1.3" } })
  const client = await RawWs.open({ port: app.port, path: `/api/admin/sandbox/runners/${deadRunner.id}/containers/ctr-1/terminal`, cookie: app.adminCookie, origin: `http://127.0.0.1:${app.port}` })
  try {
    const error = await client.waitJson("error")
    assert.equal(error.code, "engine_unreachable", "连接拒 ⇒ engine_unreachable")
    assert.equal(app.audits("terminal_close")[0].detail.reason, "error", "审计 close（error）")
    assert.equal(app.hub.sessionCount, 0, "表清空")
  } finally {
    client.destroy()
    await app.close()
  }

  for (const [execStatus, code, detailNeedle] of [[409, "container_not_running", "container 4f8a is not running"], [500, "exec_failed", "engine says no"]]) {
    const engine = await startFakeDocker({ execStatus })
    const app2 = await startApp({ engine })
    const client2 = await openTerminal(app2)
    try {
      const error = await client2.waitJson("error")
      assert.deepEqual([error.code, error.detail], [code, detailNeedle], `建 exec ${execStatus} ⇒ ${code}（携引擎原文）`)
      assert.equal(engine.state.startBodies.length, 0, "失败即收口（零 start）")
      const closes = app2.audits("terminal_close")
      assert.deepEqual([closes.length, closes[0].detail.reason], [1, "error"], "各自审计 close（error）+ 表清空")
      assert.equal(app2.hub.sessionCount, 0, "表清空")
    } finally {
      client2.destroy()
      await app2.close()
      await engine.close()
    }
  }

  // 超时子形（E61「连接拒/超时」第二形——读类扣答超时）：读类预算 = 设计 3s（`docker.mjs` `READ_TIMEOUT_MS`）
  const engine3 = await startFakeDocker({ holdRead: true })
  const app3 = await startApp({ engine: engine3 })
  const client3 = await openTerminal(app3)
  try {
    const error = await client3.waitJson("error", { timeout: 6000 })
    assert.equal(error.code, "engine_unreachable", "读类超时 ⇒ engine_unreachable")
    assert.match(String(error.detail), new RegExp(`超时（${DOCKER.READ_TIMEOUT_MS}ms）`), "detail 携读类预算读数")
    assert.equal(app3.audits("terminal_close")[0].detail.reason, "error", "审计 close（error）")
  } finally {
    client3.destroy()
    engine3.state.releaseRead() // 释放扣答（引擎侧清理）
    await app3.close()
    await engine3.close()
  }
})

// ── E62 判权/同源/404 全在 101 之前 ∥ 未接线网关 ────────────────────────────────

test("E62 升级前门：无会话 401 ∥ `user` 403 ∥ 异源 403 ∥ 未知升级路径 404 ∥ 节点不存在 404（全在 101 之前）∥ 未接线网关 ⇒ 404", async () => {
  const engine = await startFakeDocker()
  const app = await startApp({ engine })
  const legs = [
    { label: "无 cookie", cookie: null, status: 401 },
    { label: "user 会话", cookie: "user", status: 403 },
    { label: "异源 Origin", origin: "http://evil.example", status: 403 },
    { label: "未知升级路径", path: "/api/admin/sandbox/terminal", status: 404 },
    { label: "节点不存在", path: "/api/admin/sandbox/runners/9999/containers/ctr-1/terminal", status: 404 },
  ]
  try {
    for (const leg of legs) {
      const cookie = leg.cookie === null ? null : leg.cookie === "user" ? app.userCookie : app.adminCookie
      const client = await RawWs.open({ port: app.port, path: leg.path ?? terminalUrl(app), cookie, origin: leg.origin ?? `http://127.0.0.1:${app.port}` })
      try {
        assert.equal(client.status, leg.status, `${leg.label} ⇒ ${leg.status}`)
        assert.equal(client.headers["sec-websocket-accept"], undefined, `${leg.label} ⇒ 零 Sec-WebSocket-Accept（101 之前）`)
        const body = JSON.parse(client.buffer.toString("utf8") || "{}")
        if (leg.status !== 101) assert.ok(body?.error?.code, `${leg.label} ⇒ 响应沿错误形`)
      } finally {
        client.destroy()
      }
    }
    assert.equal(app.hub.sessionCount, 0, "门后零会话（全在 101 前拒）")
  } finally {
    await app.close()
    await engine.close()
  }

  // 未接线网关（无 upgrade 处理件）⇒ 一律「未匹配」404
  const bare = await startApp({ withHub: false })
  const client = await RawWs.open({ port: bare.port, path: "/api/admin/nope/terminal", cookie: bare.adminCookie })
  try {
    assert.equal(client.status, 404, "未接线网关 ⇒ 404 后断开（socket 保持 HTTP 语义）")
    assert.equal(client.headers["sec-websocket-accept"], undefined, "零 accept 头")
  } finally {
    client.destroy()
    await bare.close()
  }
})

// ── E63 协议错四形 ⇒ close 1002 ───────────────────────────────────────────────

test("E63 协议错四形：未掩码帧 ∥ 非法 opcode ∥ 帧超 1 MiB ∥ 文本帧非 UTF-8 ⇒ close 1002 + 审计 `error` + 表清空（服务端不崩）", async () => {
  const engine = await startFakeDocker()
  const app = await startApp({ engine })
  const legs = [
    { label: "未掩码帧", bytes: clientFrame(0x1, Buffer.from("{}"), { masked: false }) },
    { label: "非法 opcode", bytes: clientFrame(0x3, Buffer.from("x")) },
    { label: "帧超 1 MiB", bytes: frameHeader(0x2, 1024 * 1024 + 1) },
    { label: "文本帧非 UTF-8", bytes: clientFrame(0x1, Buffer.from([0xff, 0xfe])) },
  ]
  try {
    for (const leg of legs) {
      const client = await openTerminal(app)
      try {
        client.sendRaw(leg.bytes)
        assert.equal((await client.waitClose(3000)).code, 1002, `${leg.label} ⇒ close 1002`)
      } finally {
        client.destroy()
      }
    }
    await waitUntil(() => app.hub.sessionCount === 0)
    assert.equal(app.hub.sessionCount, 0, "表清空（畸形流零残留）")
    const closes = app.audits("terminal_close")
    assert.equal(closes.length, legs.length, "四腿各审计一行")
    assert.ok(closes.every((row) => row.detail.reason === "error"), "协议错 ⇒ `reason='error'`")
    // 服务端不崩：新会话照常可用
    const survivor = await openTerminal(app)
    try {
      await survivor.waitJson("ready")
      assert.equal(survivor.status, 101, "服务端不崩（后续照常）")
    } finally {
      survivor.destroy()
    }
  } finally {
    await app.close()
    await engine.close()
  }
})

// ── N85 两会话 ∥ 停机全收口 ────────────────────────────────────────────────────

test("N85 会话表与停机：两会话并存（同容器——各自独立 execId/审计对）⇒ 停机 ⇒ 全收口 `server_stop` + 表清空", async () => {
  const engine = await startFakeDocker()
  const app = await startApp({ engine })
  const first = await openTerminal(app)
  const second = await openTerminal(app)
  try {
    await first.waitJson("ready")
    await second.waitJson("ready")
    assert.equal(app.hub.sessionCount, 2, "两会话在飞")
    assert.deepEqual(engine.state.execIds, ["exec-1", "exec-2"], "同容器多会话 = 多 exec（各自独立）")
    assert.equal(app.audits("terminal_open").length, 2, "两 open 审计")
    assert.equal(app.hub.closeAll("server_stop"), true, "停机收口 ⇒ 表清空")
    assert.equal((await first.waitClose()).code, 1001, "停机 ⇒ WS close 1001")
    assert.equal((await second.waitClose()).code, 1001, "停机 ⇒ WS close 1001（第二会话同）")
    await waitUntil(() => engine.pty.records.every((record) => countByte(Buffer.concat(record.bytes), 0x04) === 1))
    for (const record of engine.pty.records) assert.equal(countByte(Buffer.concat(record.bytes), 0x04), 1, "各会话收口①（`\\x04` 恰一次）")
    const closes = app.audits("terminal_close")
    assert.equal(closes.length, 2, "两 close 审计")
    assert.ok(closes.every((row) => row.detail.reason === "server_stop"), "全收口 `server_stop`")
    assert.ok(closes.every((row) => Number.isFinite(row.detail.durationMs)), "两行 `durationMs` 在场")
    assert.equal(app.hub.sessionCount, 0, "会话表清空（零悬挂）")
  } finally {
    first.destroy()
    second.destroy()
    await app.close()
    await engine.close()
  }
})
