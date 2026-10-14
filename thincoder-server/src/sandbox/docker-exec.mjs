/**
 * docker-exec.mjs — Docker exec 升级传输（sandbox/SANDBOX.md §3「容器终端」块 ∥ §14 KD-SV-175/178；sandbox-container-terminal 批 · 台账 #1374）。
 *
 * 会话链三步之②③ = 建 exec（`POST containers/<id>/exec`——`Attach*` 三旗 ∥ `Tty` ∥ `Env` 两键 ∥ `Cmd` 常量）
 * ⇒ 升级 start（`POST exec/<id>/start` 携 `Connection: Upgrade` + `Upgrade: tcp`——**`node:http` 劫持**：
 * 不带 `Upgrade` 只能收输出、stdin 无法流式（请求体不 end 则无响应头）⇒ `fetch` 面不可达）⇒ `101` + 裸双工 socket。
 * 另面 = resize（就绪前 ⇒ 引擎 500 `timeout waiting for exec session ready`——挂起/重试归调用方）∥ inspect（退出码读数）
 * ∥ 收口（向 pty 写 `\x04`（EOF）⇒ destroy——实测：EOF 使交互壳在提示符处即退；半关/直接销毁都不断进程）。
 * 超时档同族（读类 3s ∥ 动作类 15s——verb 分档：GET 读 ∥ POST 动作）。
 * 建 exec/resize/inspect 走既有 Docker 客户端（`docker.mjs` 动词面——零触本档）；本档净增 = 升级 start ∥ 收口 ∥ 体构造三件。
 */
import { request as httpRequest } from "node:http"

import { ACTION_TIMEOUT_MS, DockerError, READ_TIMEOUT_MS } from "./docker.mjs"

/** pty EOF 字节（收口第一件——写 `\x04`；KD-SV-178）。 */
export const EXEC_EOF = Buffer.from([0x04])

/** 会话命令常量（② 建 exec 体：`bash` 优选 ∥ `sh` 兜底——常量三件）。 */
export const EXEC_CMD = ["/bin/sh", "-c", "if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi"]

/** 环境注入（KD-SV-179）：`TERM` 恒注 ∥ `LANG` 条件注（容器自带 locale ⇒ 零覆盖）。 */
export const TERM_ENV = "TERM=xterm-256color"
export const LANG_ENV = "LANG=C.UTF-8"

/** locale 判据：`Config.Env` 已含 `LANG`/`LC_ALL` ⇒ 不注入（避免覆盖容器自带意图）。 */
export function hasLocale(envList) {
  const list = Array.isArray(envList) ? envList : []
  return list.some((entry) => typeof entry === "string" && (entry.startsWith("LANG=") || entry.startsWith("LC_ALL=")))
}

/** 环境两键（`Env` 数组——N83 逐值断言面）。 */
export function terminalEnv(containerJson = {}) {
  const env = [TERM_ENV]
  if (!hasLocale(containerJson?.Config?.Env)) env.push(LANG_ENV)
  return env
}

/** 建 exec 体（② ——三旗 + `Tty` + `Env` + `Cmd`；逐值断言面 = N83）。 */
export function buildExecBody(containerJson = {}) {
  return {
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Env: terminalEnv(containerJson),
    Cmd: EXEC_CMD,
  }
}

/** start 体（③ ——`{ Detach: false, Tty: true }` 逐值）。 */
export function buildStartBody() {
  return { Detach: false, Tty: true }
}

/** 容器运行态判据（① 读容器：非 running ⇒ 建会话即拒——in-band `container_not_running`）。 */
export function containerRunning(containerJson = {}) {
  const state = containerJson?.State ?? {}
  return state.Status === "running" || state.Running === true // 引擎两字段同源（文本态 ∥ 布尔态任一）
}

/** 引擎错误原文（Docker 错误报文形 `{ message }`；非 JSON ⇒ 原文截断——同 `docker.mjs` 口径）。 */
function engineMessage(text) {
  try {
    const parsed = JSON.parse(text)
    if (parsed !== null && typeof parsed === "object" && typeof parsed.message === "string") return parsed.message
  } catch {
    /* 非 JSON —— 原文兜底 */
  }
  return typeof text === "string" ? text.trim().slice(0, 300) : ""
}

/**
 * 升级 start（③ ——`node:http` 劫持）：出 = `{ socket, head }`（101 + 裸双工）。
 * 失败：连不上 ⇒ `unreachable` ∥ 超时 ⇒ `timeout` ∥ 非 101（引擎拒）⇒ `api`（携状态码与引擎原文）。
 * `httpRequestImpl` = 注入口（单元测试档——缺省 `node:http` `request`；生产行为不变）。
 */
export function startExecTransport({ client, execId, body = buildStartBody(), httpRequestImpl = httpRequest, timeoutMs = ACTION_TIMEOUT_MS } = {}) {
  return new Promise((resolve, reject) => {
    let settled = false
    let timer = null
    const finish = (fn, value) => {
      if (settled) return
      settled = true
      if (timer) clearTimeout(timer)
      fn(value)
    }
    let url
    try {
      url = new URL(client.baseUrl)
    } catch {
      reject(new DockerError("unreachable", `节点地址非法：${client?.baseUrl}`))
      return
    }
    const payload = JSON.stringify(body)
    const path = `/v${client.apiVer}/exec/${encodeURIComponent(execId)}/start`
    let req
    try {
      req = httpRequestImpl({
        host: url.hostname,
        port: url.port === "" ? 80 : Number(url.port),
        method: "POST",
        path,
        headers: {
          "content-type": "application/json",
          "content-length": Buffer.byteLength(payload),
          connection: "Upgrade",
          upgrade: "tcp",
        },
      })
    } catch (e) {
      finish(reject, new DockerError("unreachable", `升级连接建立失败：${e?.message ?? e}`))
      return
    }
    timer = setTimeout(() => {
      try { req.destroy() } catch { /* 已断 */ }
      finish(reject, new DockerError("timeout", `exec 升级超时（${timeoutMs}ms）：${path}`))
    }, timeoutMs)
    req.on("upgrade", (res, socket, head) => {
      if (res.statusCode !== 101) {
        try { socket.destroy() } catch { /* 已断 */ }
        finish(reject, new DockerError("api", `exec 升级被拒（${res.statusCode}）`, { status: res.statusCode }))
        return
      }
      finish(resolve, { socket, head })
    })
    req.on("response", (res) => {
      const chunks = []
      res.on("data", (chunk) => chunks.push(chunk))
      res.on("end", () => {
        const apiMessage = engineMessage(Buffer.concat(chunks).toString("utf8"))
        finish(reject, new DockerError("api", `Docker API ${res.statusCode}：${apiMessage || "(无报文)"}`, { status: res.statusCode, apiMessage }))
      })
      res.on("error", (e) => finish(reject, new DockerError("api", `exec 升级响应读败：${e?.message ?? e}`, { status: res.statusCode })))
    })
    req.on("error", (e) => finish(reject, new DockerError("unreachable", `节点不可达（exec 升级）：${e?.message ?? e}`)))
    try {
      req.end(payload) // 体必 end（不 end 则引擎无响应头——③ 实测口径）
    } catch (e) {
      finish(reject, new DockerError("unreachable", `升级请求发送失败：${e?.message ?? e}`))
    }
  })
}

/**
 * 收口两件（KD-SV-178）：① 向 pty 写 `\x04`（EOF——交互壳即退）② destroy（关 Docker 侧连接）。
 * 幂等（socket 已毁 ⇒ false）；写后销毁以 flush 回调为序（对端不读 ⇒ 1s 兜底——不悬停）。
 */
export function closeExecSocket(socket) {
  if (!socket || socket.destroyed) return false
  const destroy = () => {
    try { socket.destroy() } catch { /* 已断 */ }
  }
  try {
    socket.write(EXEC_EOF, destroy)
    const guard = setTimeout(destroy, 1000)
    guard.unref?.()
  } catch {
    destroy()
  }
  return true
}

/**
 * exec 操作集（对既有 Docker 客户端——`client.raw` 动词面 + `client.baseUrl`/`client.apiVer`）。
 * 注入口径（单元测试档）：`httpRequestImpl`（升级劫持面——缺省 `node:http` `request`）。
 */
export function createExecOps({ client, httpRequestImpl = httpRequest, actionTimeoutMs = ACTION_TIMEOUT_MS, readTimeoutMs = READ_TIMEOUT_MS } = {}) {
  if (!client) throw new Error("createExecOps：缺少 Docker 客户端（clientForRunner 产物）")
  return {
    /** ② 建 exec ⇒ execId（201；引擎拒 ⇒ `DockerError('api')`——409 = 窗口期容器被停）。 */
    async create(containerId, body) {
      const response = await client.raw("POST", `/containers/${encodeURIComponent(containerId)}/exec`, { body, timeoutMs: actionTimeoutMs })
      const execId = response.json?.Id ?? null
      if (typeof execId !== "string" || execId === "") throw new DockerError("api", "引擎建 exec 响应缺 Id", { status: response.status })
      return execId
    },
    /** ③ 升级 start ⇒ `{ socket, head }`（101 + 裸双工）。 */
    start: (execId) => startExecTransport({ client, execId, httpRequestImpl, timeoutMs: actionTimeoutMs }),
    /** 尺寸（动作类——`h` = rows ∥ `w` = cols；就绪前 ⇒ 引擎 500，重试归调用方）。 */
    resize: (execId, { rows, cols }) => client.raw("POST", `/exec/${encodeURIComponent(execId)}/resize?h=${rows}&w=${cols}`, { timeoutMs: actionTimeoutMs }),
    /** 退出码读数（读类——引擎流结束后；`ExitCode` 缺 ⇒ null）。 */
    inspect: (execId) => client.raw("GET", `/exec/${encodeURIComponent(execId)}/json`, { timeoutMs: readTimeoutMs }),
  }
}
