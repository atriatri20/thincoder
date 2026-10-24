/**
 * server.mjs — http 服务 ∥ 路由注册表 ∥ 静态面兜底 ∥ 写端点 JSON 型门 ∥ body 读限（32 MiB；快照路由 200 MiB——§2.6） ∥ 逐请求日志（含断连行）
 * ∥ 匿名入口 IP 限流判点（`limits.mjs`——路由之前；429 + `Retry-After`）
 * ∥ TLS 终止层（内置 `node:https`——证书材料读取 ∥ 重定向监听 308）
 * （gateway/API.md §1 ∥ §4；型门口径 = accounts/ACCOUNTS.md §3 ∥ metering/METERING.md §3 前言；TLS 面 = gateway/PUBLICNET.md §2）。
 *
 * 分派 = 「method + path → 处理函数」注册行制（扩展点 G1）：新端点 = 注册一行 + 新处理模块，
 * 不塞主干 if-else。处理函数签名 `(req, res, ctx)`，ctx = `{ config, log, routes, params }`。
 * 静态面（webui——`public/` 直发） = 注册路由之后的 GET/HEAD 兜底：`/v1/*` ∥ `/api/*` 不走（优先级 = API.md §1）。
 *
 */
import { readFileSync } from "node:fs"
import { createServer } from "node:http"
import { createServer as createHttpsServer } from "node:https"
import { createSecureContext } from "node:tls"

import { HttpError, sendError } from "./errors.mjs"
import { refuseUpgrade } from "./ws.mjs"
import { clientIp } from "../accounts/login-guard.mjs"

/** 请求体上限（gateway/API.md §3——413 `payload_too_large`；超限不转发）。 */
export const MAX_BODY_BYTES = 32 * 1024 * 1024


/**
 * 路由注册表（G1）：`add(method, path, handler)` 注册一行；`/段/:名` 段 = 路径参数（捕获进 `params`；
 * accounts/metering 端点表用）。resolve = 注册顺序首个匹配胜出；方法/路径未命中 ⇒ null（调用方回 404）。
 */
export function createRouteTable() {
  const entries = []
  return {
    add(method, path, handler) {
      const upper = String(method).toUpperCase()
      const key = `${upper} ${path}`
      if (entries.some((entry) => entry.key === key)) throw new Error(`路由重复注册：${key}`)
      entries.push({ key, method: upper, segments: splitPath(path), handler })
      return handler
    },
    resolve(method, pathname) {
      const segments = splitPath(pathname)
      for (const entry of entries) {
        if (entry.method !== method || entry.segments.length !== segments.length) continue
        const params = {}
        let matched = true
        for (let i = 0; i < segments.length; i++) {
          const spec = entry.segments[i]
          if (spec.startsWith(":")) params[spec.slice(1)] = segments[i]
          else if (spec !== segments[i]) { matched = false; break }
        }
        if (matched) return { handler: entry.handler, params }
      }
      return null
    },
    get size() { return entries.length },
  }
}

/** 建 http 服务（未 listen——监听归入口）。`tls` 缺省 null ⇒ `node:http`（现行为零变）；
 *  `tls = { key, cert }`（已读入内存的内容——`loadTlsMaterial` 产物）⇒ `node:https`（监听/升级/静态面同形复用）。
 *  `limits`（`limits.mjs` 产物）缺省 null ⇒ 不限；在场 ⇒ 路由之前判一次（超限 ⇒ 429 `rate_limited` + `Retry-After`，
 *  并调 `noteBurst` 落审计——同窗聚合）。
 *  逐请求一行日志（method ∥ path ∥ status ∥ ms）。
 *  `staticSite` = `createStaticSite()` 产物（webui/static.mjs）——缺省 null（纯 API 面，测试友好）。 */
export function createGatewayServer({ config = {}, routes, log = null, staticSite = null, upgrade = null, tls = null, limits = null } = {}) {
  if (!routes) throw new Error("createGatewayServer：缺少路由表（routes = createRouteTable()）")
  const handler = (req, res) => {
    const started = Date.now()
    const pathname = safePathname(req.url)
    // 逐请求一行（D3 接线补断连面）：正常 = `finish`；中途断连 = `close`（`aborted: true`——未发响应头时
    // status 记 null；`finish` 对断连不触发，不补则该请求无行）。
    let logged = false
    const logRequest = (aborted = false) => {
      if (logged) return
      logged = true
      log?.info("request", {
        method: req.method,
        path: pathname,
        status: res.headersSent ? res.statusCode : null,
        ms: Date.now() - started,
        ...(aborted ? { aborted: true } : {}),
      })
    }
    res.on("finish", () => logRequest())
    res.on("close", () => logRequest(!res.writableEnded))
    // 匿名入口限流判点（gateway/PUBLICNET.md §2——路由之前）：IP 口径与登录防爆破同源（`clientIp` + `trustProxy`）
    if (limits !== null) {
      const ip = clientIp(req, { trustProxy: config?.trustProxy === true })
      const verdict = limits.check(req.method, pathname, ip)
      if (verdict.limited) {
        limits.noteBurst({ ip, ruleClass: verdict.ruleClass, retryAfterS: verdict.retryAfterS }) // 审计聚合行（同 IP 同窗一次）
        req.resume() // 请求体排空（POST 携体时早退——不排会被 keep-alive 直接断，客户端读不到 429 体；同 createRedirectServer）
        sendError(res, "rate_limited", `请求过于频繁（${verdict.ruleClass} 类端点限流，${verdict.retryAfterS}s 后可重试）`, { headers: { "Retry-After": String(verdict.retryAfterS) } })
        return
      }
    }
    const route = routes.resolve(req.method, pathname)
    if (!route) {
      if (servesStatic(staticSite, req, pathname) && staticSite.serve(req, res, pathname)) return
      sendError(res, "not_found", `无此路由：${req.method} ${pathname}`)
      return
    }
    if (requiresJsonWrite(req.method, pathname) && !isJsonContentType(req.headers["content-type"])) {
      if (isNdjsonStreamPath(pathname)) {
        // 路由级例外（gateway/API.md §2.12 ∥ agent/MEMBER-AGENT.md §3.3）：盒上行回合流 = 流式 NDJSON 体
        //（逐行边收边消费——`box-routes.mjs` 走 `readStreamBody`，不经通用整段 JSON 体门）。
      } else {
        sendError(res, "invalid_request_error", "写端点仅收 application/json（Content-Type 须为 application/json）")
        return
      }
    }
    const bodyLimit = MAX_BODY_BYTES
    if (exceedsBodyLimit(req, bodyLimit)) {
      sendError(res, "payload_too_large", `请求体超过上限（${bodyLimit} 字节）`)
      return
    }
    Promise.resolve()
      .then(() => route.handler(req, res, { config, log, routes, params: route.params }))
      .catch((err) => failRequest(res, err, log))
  }
  const server = tls ? createHttpsServer({ key: tls.key, cert: tls.cert }, handler) : createServer(handler)
  // 升级路挂点（sandbox-container-terminal 批；gateway/API.md §4）：`upgrade` 处理件**直挂、不套包装**——
  // `server.listeners("upgrade")` 恰一条且身份 = 传入手（装配断言逐条对得上——OPS.md §4.1 A5）；
  // 未接线 ⇒ 一律「未匹配」口径（404 后断开——错误形同上）。socket 错误面挂连接层（拒绝/断开后对端强断——零噪声；
  // 语义收口归各层）——挂在升级监听内会多一层包装、断掉身份可比性。
  server.on("upgrade", typeof upgrade === "function" ? upgrade : (req, socket) => {
    refuseUpgrade(socket, "not_found", `无此升级路由：${req?.method} ${safePathname(req?.url)}`)
  })
  server.on("connection", (socket) => {
    socket.on("error", () => { /* 对端强断——零噪声（升级 socket 同覆盖） */ })
  })
  // 空闲连接超时（2026-10-14 走查笔 5——用户「Failed to fetch」根因）：Node 默认 5s 太短——弹窗填表 >5s 后
  // 浏览器在已关闭的 keep-alive 连接上发 POST 必败（浏览器不重试 POST；GET 会静默换连接不掉线）；提到 5 分钟。
  server.keepAliveTimeout = 300000
  server.headersTimeout = 306000
  return server
}

/** 读请求体并按 JSON 解析：超限 ⇒ `payload_too_large`（413）；非法 JSON ⇒ `invalid_request_error`（400）。
 *  边界：settle 后保留 `error` 监听（后续套接字错误不抛——空转）；同一 req 仅可调用一次。 */
export function readJsonBody(req, { limit = MAX_BODY_BYTES } = {}) {
  return new Promise((resolve, reject) => {
    if (req.readableEnded) {
      reject(new HttpError("internal_error", "请求体已耗尽（readJsonBody 仅可调用一次）"))
      return
    }
    const chunks = []
    let size = 0
    let settled = false
    const settle = (fn, value) => {
      if (settled) return
      settled = true
      req.off("data", onData)
      req.off("end", onEnd)
      fn(value)
    }
    const onData = (chunk) => {
      size += chunk.length
      if (size > limit) {
        req.resume() // 余下体丢弃（连接不悬停）——响应由分派层发
        settle(reject, new HttpError("payload_too_large", `请求体超过上限（${limit} 字节）`))
        return
      }
      chunks.push(chunk)
    }
    const onEnd = () => {
      try {
        settle(resolve, JSON.parse(Buffer.concat(chunks).toString("utf8")))
      } catch (e) {
        settle(reject, new HttpError("invalid_request_error", `body 非合法 JSON：${e.message}`))
      }
    }
    const onError = (e) => settle(reject, e)
    req.on("data", onData)
    req.on("end", onEnd)
    req.on("error", onError)
  })
}

/** 流式读请求体（不整块缓冲——快照上送用，KD-SV-77）：逐块交 `onChunk`（调用方边收边写）；超限 ⇒
 *  `payload_too_large`（413——余体丢弃、已写部分由调用方清理）；端到端字节数 ⇒ `{ bytes }`。
 *  背压 = `onChunk` 内可 `req.pause()`（本函数不代管；调用方在 drain 后 `req.resume()`）。
 *  边界同 `readJsonBody`：同一 req 仅可调用一次；settle 后 `data`/`end` 摘下（`error` 留守——套接字晚错不抛），
 *  且 `onChunk` 不再被调（settle 后的残余块直接丢弃——调用方已收手）。 */
export function readStreamBody(req, { limit = MAX_BODY_BYTES, onChunk } = {}) {
  return new Promise((resolve, reject) => {
    if (typeof onChunk !== "function") {
      reject(new HttpError("internal_error", "readStreamBody 缺 onChunk（流式落盘的写入口）"))
      return
    }
    if (req.readableEnded) {
      reject(new HttpError("internal_error", "请求体已耗尽（readStreamBody 仅可调用一次）"))
      return
    }
    let size = 0
    let settled = false
    const settle = (fn, value) => {
      if (settled) return
      settled = true
      req.off("data", onData)
      req.off("end", onEnd)
      fn(value)
    }
    const onData = (chunk) => {
      if (settled) return // 残余块不再交调用方（其写流可能已销毁——否则 = 给已销毁流写）
      size += chunk.length
      if (size > limit) {
        req.resume() // 余下体丢弃（连接不悬停）——响应由调用方发
        settle(reject, new HttpError("payload_too_large", `请求体超过上限（${limit} 字节）`))
        return
      }
      try {
        onChunk(chunk)
      } catch (e) {
        req.resume()
        settle(reject, e)
      }
    }
    const onEnd = () => settle(resolve, { bytes: size })
    const onError = (e) => settle(reject, e)
    req.on("data", onData)
    req.on("end", onEnd)
    req.on("error", onError)
  })
}

/** 读 TLS 材料（证书 ∥ 私钥 → 内存）并校验可建上下文（启动期 ∥ `SIGHUP` 轮换共用）。
 *  读不到 ∥ 非 PEM ∥ 两件不成对 ⇒ 抛（启动径 ⇒ 拒启；轮换径 ⇒ 保旧上下文继续服务）。 */
export function loadTlsMaterial({ certPath, keyPath }) {
  const key = readFileSync(keyPath)
  const cert = readFileSync(certPath)
  createSecureContext({ key, cert }) // 校验：私钥与证书须成对且为合法 PEM（失败即抛）
  return { key, cert }
}

/** 重定向 `Location`：主机与端口只取配置（`tls.publicHost` ∥ `tls.publicPort`——`443` 省略端口位），
 *  请求 `Host` 头不参与（读头 = 开出站外重定向面）；路径 = 请求目标解析后的 pathname + query
 *  （绝对形请求目标的主机部分同样丢弃——不拼入原始串）。 */
export function redirectLocation(tls, url) {
  let path = "/"
  try {
    const parsed = new URL(typeof url === "string" && url !== "" ? url : "/", "http://redirect.invalid")
    path = `${parsed.pathname}${parsed.search}`
  } catch {
    path = "/" // 畸形目标 ⇒ 回落根路径（不炸）
  }
  const port = tls.publicPort === 443 ? "" : `:${tls.publicPort}`
  return `https://${tls.publicHost}${port}${path}`
}

/** HTTP→HTTPS 重定向监听（任何请求 ⇒ `308` + `Location`；请求体丢弃、不挂路由表）。
 *  用 `308` 不用 `301`：`301` 允许客户端把 POST 改写成 GET（浏览器历史行为），webui 登录表单与 API 直连都需要方法保形。 */
export function createRedirectServer({ tls }) {
  return createServer((req, res) => {
    req.resume() // 请求体丢弃（连接不悬停——本面不读体）
    res.writeHead(308, { Location: redirectLocation(tls, req.url) })
    res.end()
  })
}

/** 处理函数异常收口：HttpError ⇒ 表内错误形（附加头随 `HttpError.headers`——`Retry-After`）；其余 ⇒ 500 `internal_error`（记日志）。 */
function failRequest(res, err, log) {
  if (res.headersSent || res.writableEnded) {
    res.destroy()
    return
  }
  if (err instanceof HttpError) {
    sendError(res, err.code, err.message, { headers: err.headers }) // 如 429 限流的 `Retry-After`（KD-SV-35）
    return
  }
  log?.error("handler_error", { message: err?.message ?? String(err) })
  sendError(res, "internal_error", "服务内部错误")
}

/** `Content-Length` 预检（流式体由 `readJsonBody`/`readStreamBody` 兜底；限值 = `MAX_BODY_BYTES`）。 */
function exceedsBodyLimit(req, limit) {
  const length = Number(req.headers["content-length"])
  return Number.isFinite(length) && length > limit
}

/** 静态面候选：GET/HEAD 且非服务面路径（`/v1/*` ∥ `/api/*` 永不走静态面——gateway/API.md §1 优先级）。 */
function servesStatic(staticSite, req, pathname) {
  if (!staticSite) return false
  if (req.method !== "GET" && req.method !== "HEAD") return false
  return !isServicePath(pathname)
}

/** 服务面路径判据（OpenAI 面 ∥ 账号/计量面——静态面互斥）。 */
function isServicePath(pathname) {
  return pathname === "/v1" || pathname.startsWith("/v1/") || pathname === "/api" || pathname.startsWith("/api/")
}

/** `/api/*` 写端点（非 GET/HEAD）仅收 `application/json`（accounts/ACCOUNTS.md §3 ∥ metering/METERING.md §3）——
 *  跨站防护第二道（配合 `SameSite=Strict`）：非 JSON 体属跨站可直发形，一律 400。
 */
function requiresJsonWrite(method, pathname) {
  return pathname.startsWith("/api/") && method !== "GET" && method !== "HEAD"
}

/** Content-Type 判据：`application/json`（允许 `; charset=…` 参数）。 */
function isJsonContentType(value) {
  if (typeof value !== "string") return false
  return value.split(";")[0].trim().toLowerCase() === "application/json"
}

/** NDJSON 流式写面（路由级例外——盒上行回合流）：`POST /api/box/sessions/:id/turns`（gateway/API.md §2.12）。 */
function isNdjsonStreamPath(pathname) {
  return /^\/api\/box\/sessions\/[^/]+\/turns$/.test(pathname)
}

function normalizePath(pathname) {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname
}

/** 请求 URL → 路径名（畸形 URL 不炸进程——按根路径走 404）。 */
function safePathname(url) {
  try {
    return normalizePath(new URL(url, "http://localhost").pathname)
  } catch {
    return "/"
  }
}

function splitPath(path) {
  return String(path).split("/").filter((segment) => segment !== "")
}
