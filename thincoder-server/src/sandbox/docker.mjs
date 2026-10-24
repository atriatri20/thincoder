/**
 * docker.mjs — Docker API 客户端（sandbox/SANDBOX.md §3 ∥ §14 KD-SV-79/80/81；台账 #1251）：
 * 地址归一**按档**（缺协议补 `http://`/`https://`、缺端口按档补 2375/2376；显式 scheme 与档相抵 ⇒ 抛——见下行 TLS 档段）∥ 版本协商（引导步 = 无前缀读数 → `max(1.44, MinAPIVersion)` ≤ `ApiVersion`
 * → 带前缀复读）∥ **调用恒带版本前缀** ∥ 超时（读类 3s ∥ 动作类 15s ∥ 拉取 10 分钟——常量；测试可注入 `fetchImpl`）∥ 错误映射。
 *
 * 本批增补（sandbox-docker-admin 批——§3 容器面补齐/镜像族 ∥ KD-SV-92/93/94）：容器详情/日志/用量/重启/强杀 + 镜像列表/拉取/删除；
 * 日志 = 非 TTY 8 字节帧头多路复用解复用（`demuxDockerLogs`——判不出 ⇒ 原样透传）+ 文本截断 256 KiB（KD-SV-93）∥
 * 拉取 = 同步 10 分钟超时 + 失败两形皆收（非 2xx ∥ 200 流内 `error`——`findStreamError`；KD-SV-94）∥ 镜像引用形校验（`parseImageRef`/`normalizeImageRef`）。
 * 本批增补（sandbox-volumes 批——§3 卷族 ∥ KD-SV-104）：卷列表（`GET /volumes`——读时读）∥ 删卷（`DELETE /volumes/<名>`——动作类 15s；名形 = 路由侧前置校验，本档直入路径段）。
 *
 * 本批增补（sandbox-exec-rebuild 批——执行面重做）：`networks`（create ∥ inspect ∥ delete——`Options` 直通）∥
 * `archive`（get ∥ put——快照/恢复流式，专用长超时）∥ `containerState`（引擎 `State` 三值——墙钟判据 ∥ 探针读数）∥ `buildImage`/`imageDetail`（底座可换派生——KD-SV-185）∥
 * 拉取 `auth` 参（`X-Registry-Auth`——KD-SV-188）。
 * **连接面 TLS 档（增补 #2——KD-SV-192…195）**：地址归一按档（`normalizeDockerAddress(raw, { tls })`——裸 host 补 scheme + 缺省端口 2375/2376；显式 scheme 与档相抵 ⇒ 抛）；
 * 两参透传（`config` ∥ `requestImpl`——与 `fetchImpl` 同形）：**明文行恒用注入 `fetchImpl`（零行为变化——不构造适配件）** ∥ TLS 行 ⇒ 材料按行解密 + `httpsFetchOf`（`docker-tls.mjs`）。
 *
 * 消费面 = 控制台节点/容器/镜像面（`routes.mjs` ∥ `container-routes.mjs` ∥ `image-routes.mjs`）与 agent 工具面（`docker-ops.mjs`）——同一套调用（用户 22:25 口径）。
 * 错误映射（`DockerError.kind`）：`unreachable`（连不上/网络败）∥ `timeout`（超预算）∥ `api`（Docker 已到达且非 2xx——携状态码与引擎原文；
 * 拉取面 200 流内错误亦归 `api`——status 记 200）；
 * 路由侧映射 = §3：不可达/超时 ⇒ 502 `upstream_error`；引擎 404/409 ⇒ 400（创建/拉取/镜像删除面）∥ 404（动作/读面，目标不存在）；余 ⇒ 502。
 */
import { connectionKindOf, httpsFetchOf, tlsMaterialsOf } from "./docker-tls.mjs"

export const DOCKER_MIN_API_VERSION = "1.44"
export const DEFAULT_DOCKER_PORT = 2375
export const DEFAULT_DOCKER_TLS_PORT = 2376 // TLS 档缺省端口（§3 连接方式块）
export const READ_TIMEOUT_MS = 3000    // 读类（version ∥ info ∥ 列表 ∥ 详情/日志/用量——§3）
export const ACTION_TIMEOUT_MS = 15000 // 动作类（create/start/stop/delete ∥ 重启/强杀/镜像删除——§3）
export const PULL_TIMEOUT_MS = 10 * 60 * 1000 // 拉取专用（同步——KD-SV-94；沿 agent 工具面同值）
export const BUILD_TIMEOUT_MS = 10 * 60 * 1000 // 派生构建专用（同步——KD-SV-185）
export const ARCHIVE_TIMEOUT_MS = PULL_TIMEOUT_MS  // 快照/恢复存档流（KD-SV-167——沿拉取常量）
export const LOG_TAIL_DEFAULT = 200    // 日志 tail 缺省（§3）
export const LOG_TAIL_MAX = 2000       // 日志 tail 上界（§3）
export const LOG_TEXT_LIMIT_BYTES = 256 * 1024 // 日志文本截断上限（KD-SV-93）
export const IMAGE_REF_MAX = 200       // 镜像引用长度上界（拉取/删除同值——§3）
/** 日志截断尾句标记（`truncated: true` 时附于文本尾——§3 日志行）。 */
export const LOG_TRUNCATED_MARK = "\n…（日志已截断——仅显示前 256 KiB）"

/** 上游错误（kind 三分类——路由面按 §3 映射；message 恒为逐句人话）。 */
export class DockerError extends Error {
  constructor(kind, message, { status = null, apiMessage = null } = {}) {
    super(message)
    this.name = "DockerError"
    this.kind = kind // unreachable ∥ timeout ∥ api
    this.status = status // api 类 = 引擎状态码（否则 null）
    this.apiMessage = apiMessage // 引擎原文（无 ⇒ null）
  }
}

/** 版本比较（`1.44` 形——逐段数值；缺失段按 0）。出 = -1 ∥ 0 ∥ 1。 */
export function compareApiVersions(a, b) {
  const left = String(a ?? "").split(".").map((part) => Number(part) || 0)
  const right = String(b ?? "").split(".").map((part) => Number(part) || 0)
  const len = Math.max(left.length, right.length)
  for (let i = 0; i < len; i++) {
    const l = left[i] ?? 0
    const r = right[i] ?? 0
    if (l !== r) return l < r ? -1 : 1
  }
  return 0
}

/** 地址归一（§3 连接方式块——**按档补 scheme + 缺省端口**）：明文档缺协议补 `http://`、缺端口补 2375；TLS 档（`{ tls: true }`）缺协议补 `https://`、缺端口补 2376。
 *  显式 scheme 与档相抵 ⇒ 抛（零静默推断——调用方转 400 零外呼）；余形非法 ⇒ 抛。`tls` 缺省 `false` = 明文（**不携档零行为变化**——逐值同现状）。 */
export function normalizeDockerAddress(raw, { tls = false } = {}) {
  const text = typeof raw === "string" ? raw.trim() : ""
  if (text === "") throw new Error("地址不可为空")
  const explicit = /^([a-z][a-z0-9+.-]*):\/\//i.exec(text)
  let scheme = tls ? "https" : "http"
  if (explicit !== null) {
    const given = explicit[1].toLowerCase()
    if (given !== "http" && given !== "https") throw new Error(`地址仅收 http:// ∥ https://：${text}`)
    if ((given === "https") !== Boolean(tls)) {
      throw new Error(
        given === "https"
          ? `地址 scheme 与连接档相抵：显式 https:// 但档 = 明文（TLS 档须携 connection: "tls" 与三件材料）：${text}`
          : `地址 scheme 与连接档相抵：显式 http:// 但档 = TLS：${text}`,
      )
    }
    scheme = given
  }
  let url
  try {
    url = new URL(`${scheme}://${explicit === null ? text : text.slice(explicit[0].length)}`)
  } catch {
    throw new Error(`地址形非法：${text}`)
  }
  if (url.hostname === "") throw new Error(`地址缺主机名：${text}`)
  if (url.username !== "" || url.password !== "" || (url.pathname !== "" && url.pathname !== "/") || url.search !== "" || url.hash !== "") {
    throw new Error(`地址仅收 <host>:<port>（不收路径/查询/凭据——按档补全）：${text}`) // 零静默截断（与同档「零静默推断」同口径）
  }
  const port = url.port === "" ? (scheme === "https" ? DEFAULT_DOCKER_TLS_PORT : DEFAULT_DOCKER_PORT) : Number(url.port)
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error(`地址端口非法：${text}`)
  return `${scheme}://${url.hostname}:${port}`
}

/** 协商版本（KD-SV-81）：`ver = max(1.44, MinAPIVersion)`，须 ≤ `ApiVersion`；否则抛（拒登记——零落库）。 */
export function negotiateApiVersion(readings = {}) {
  const apiVersion = typeof readings.ApiVersion === "string" ? readings.ApiVersion.trim() : ""
  const minApiVersion = typeof readings.MinAPIVersion === "string" ? readings.MinAPIVersion.trim() : ""
  if (apiVersion === "") throw new DockerError("api", "非 Docker API 响应（缺 ApiVersion——地址指向的可能不是 Docker 引擎）")
  const ver = minApiVersion !== "" && compareApiVersions(minApiVersion, DOCKER_MIN_API_VERSION) > 0 ? minApiVersion : DOCKER_MIN_API_VERSION
  if (compareApiVersions(ver, apiVersion) > 0) {
    throw new DockerError("api", `Docker API 版本不兼容：节点最低 ${minApiVersion || "?"}（协商 ${ver}）> 节点上限 ${apiVersion}`)
  }
  return ver
}

/** 自检读数归一（落 `sandbox_runners.runtime_json`——§3：Version/ApiVersion/MinAPIVersion/Os/Arch + 协商版本）。 */
function readingsOf(payload = {}, apiVer) {
  return {
    version: typeof payload.Version === "string" ? payload.Version : null,
    apiVersion: typeof payload.ApiVersion === "string" ? payload.ApiVersion : null,
    minApiVersion: typeof payload.MinAPIVersion === "string" ? payload.MinAPIVersion : null,
    apiVer,
    os: typeof payload.Os === "string" ? payload.Os : null,
    arch: typeof payload.Arch === "string" ? payload.Arch : null,
  }
}

/** 响应体文本（尽力而为——错误报文用；体已消费 ⇒ 空串）。 */
async function readText(response) {
  try {
    return typeof response.text === "function" ? await response.text() : ""
  } catch {
    return ""
  }
}

/** UTF-8 安全截断（按码点累计字节——不劈开多字节字符；出 ≤ `limitBytes` 字节）。 */
export function clipUtf8(text, limitBytes = LOG_TEXT_LIMIT_BYTES) {
  const value = typeof text === "string" ? text : String(text ?? "")
  if (Buffer.byteLength(value, "utf8") <= limitBytes) return value
  let bytes = 0
  let out = ""
  for (const char of value) {
    const size = Buffer.byteLength(char, "utf8")
    if (bytes + size > limitBytes) break
    bytes += size
    out += char
  }
  return out
}

/**
 * 非 TTY 日志流解复用（KD-SV-93）：8 字节帧头 = 流类（首字节 ∈ {0,1,2}）∥ 1–3 字节零 ∥ 帧长（大端 u32）；
 * 逐帧剥头取载荷。**判不出 ⇒ `null`（调用方原样透传——TTY 容器/非帧流）**：任一帧不合判据 ∥ 尾有残帧。
 */
export function demuxDockerLogs(buffer) {
  const raw = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer ?? [])
  if (raw.length === 0) return raw
  const parts = []
  let offset = 0
  while (offset < raw.length) {
    if (offset + 8 > raw.length) return null
    const streamType = raw[offset]
    if (streamType > 2) return null
    if (raw[offset + 1] !== 0 || raw[offset + 2] !== 0 || raw[offset + 3] !== 0) return null
    const size = raw.readUInt32BE(offset + 4)
    if (size > raw.length - offset - 8) return null
    parts.push(raw.subarray(offset + 8, offset + 8 + size))
    offset += 8 + size
  }
  return Buffer.concat(parts)
}

/** 拉取流内错误扫描（KD-SV-94——200 流内 `error`/`errorDetail`）：逐行 JSON 解析（整段单 JSON 兜底）；出 = 引擎原文 ∥ `null`（无错）。 */
export function findStreamError(text) {
  const raw = typeof text === "string" ? text : ""
  const probe = (line) => {
    const trimmed = line.trim()
    if (trimmed === "") return null
    try {
      const parsed = JSON.parse(trimmed)
      const message = parsed?.errorDetail?.message ?? parsed?.error
      return typeof message === "string" && message !== "" ? message : null
    } catch {
      return null // 非 JSON 行（进度文本）跳过
    }
  }
  for (const line of raw.split(/\r?\n/)) {
    const message = probe(line)
    if (message !== null) return message
  }
  return probe(raw)
}

/** 拉取形（§3：`名[:标签]`——标签 = 末个 `/` 之后的末个 `:` 起；缺省 `latest`；含 `@`（digest）⇒ 拒）。 */
export function parseImageRef(raw) {
  const text = typeof raw === "string" ? raw.trim() : ""
  if (text === "") throw new Error("镜像不可为空（形 = 名[:标签]）")
  if (text.length > IMAGE_REF_MAX) throw new Error(`镜像名超长（≤ ${IMAGE_REF_MAX} 字符；实长 ${text.length}）`)
  if (text.includes("@")) throw new Error(`不收 digest 形（含 @）：${text}——请用 名[:标签] 形`)
  const colon = text.lastIndexOf(":")
  if (colon > text.lastIndexOf("/")) {
    const tag = text.slice(colon + 1)
    if (tag === "") throw new Error(`标签不可为空（形 = 名[:标签]）：${text}`)
    return { image: text.slice(0, colon), tag }
  }
  return { image: text, tag: "latest" }
}

/** 删除形（§3 KD-SV-95：`ref` = 镜像 id 或 `名:标签`——字符集 `[A-Za-z0-9][A-Za-z0-9._:/@-]*`，禁空白/`?`/`#`/`%`；含 `/`/`:` 故走请求体）。
 *  **段级边界（#1271）**：单点 `.`、`/`、`:` 许可（正常形零回归）；按 `/` 拆段含 `..` ⇒ 抛（`ref` 直入引擎删除路径——失败零外呼，路由转 400 人话）。
 *  拉取径 `parseImageRef` 同族**未加固**（走 query 非 path——射程外）。 */
export function normalizeImageRef(raw) {
  const text = typeof raw === "string" ? raw.trim() : ""
  if (text === "") throw new Error("镜像引用不可为空（ref = 镜像 id 或 名:标签）")
  if (text.length > IMAGE_REF_MAX) throw new Error(`镜像引用超长（≤ ${IMAGE_REF_MAX} 字符；实长 ${text.length}）`)
  if (!/^[A-Za-z0-9][A-Za-z0-9._:/@-]*$/.test(text)) throw new Error(`镜像引用形非法（禁空白 ∥ ? ∥ # ∥ % ∥ 首字符须字母/数字）：${text}`)
  if (text.split("/").includes("..")) throw new Error(`镜像引用禁 .. 段（形 = 镜像 id 或 名:标签）：${text}`)
  return text
}

/** 引擎错误原文（Docker 错误报文形 `{ message }`；非 JSON ⇒ 原文截断）。 */
function apiMessageOf(text) {
  try {
    const parsed = JSON.parse(text)
    if (parsed !== null && typeof parsed === "object" && typeof parsed.message === "string") return parsed.message
  } catch {
    /* 非 JSON —— 原文兜底 */
  }
  return typeof text === "string" ? text.trim().slice(0, 300) : ""
}

/**
 * Docker API 客户端（`baseUrl` = 归一地址；`apiVer` = 协商版本——`null` 时仅 `version()` 可调（引导步））。
 * 注入口径（单元测试档/agent 假件）：`fetchImpl`（缺省 = 全局 fetch）∥ 三超时可覆盖（读/动作/拉取）。
 */
export function createDockerClient({ baseUrl, apiVer = null, fetchImpl = fetch, readTimeoutMs = READ_TIMEOUT_MS, actionTimeoutMs = ACTION_TIMEOUT_MS, pullTimeoutMs = PULL_TIMEOUT_MS, buildTimeoutMs = BUILD_TIMEOUT_MS, archiveTimeoutMs = ARCHIVE_TIMEOUT_MS } = {}) {
  if (typeof baseUrl !== "string" || baseUrl === "") throw new Error("createDockerClient：缺 baseUrl")
  const prefix = () => {
    if (apiVer === null || apiVer === undefined || apiVer === "") throw new DockerError("api", "调用缺 API 版本前缀（须先经登记自检协商——KD-SV-81）")
    return `/v${apiVer}`
  }

  /** 单请求（超时 → kind 分类；非 2xx ⇒ `DockerError("api")`——304 属成功面，调用方自判）。
   *  `rawBody` = 字节体（archive put ∥ build——原样写）；`body` = JSON 体；两参互斥（rawBody 优先）。 */
  async function request(method, path, { body = null, rawBody = null, headers = undefined, timeoutMs = readTimeoutMs } = {}) {
    const url = `${baseUrl}${path}`
    const signal = AbortSignal.timeout(timeoutMs)
    let init = { method, signal }
    if (rawBody !== null) init = { ...init, headers: headers ?? {}, body: rawBody }
    else if (body !== null) init = { ...init, headers: headers ?? { "content-type": "application/json" }, body: JSON.stringify(body) }
    else if (headers !== undefined) init = { ...init, headers }
    let response
    try {
      response = await fetchImpl(url, init)
    } catch (e) {
      const kind = signal.aborted ? "timeout" : "unreachable"
      const message = kind === "timeout" ? `节点响应超时（${timeoutMs}ms）：${url}` : `节点不可达：${url}（${e?.message ?? e}）`
      throw new DockerError(kind, message)
    }
    const text = await readText(response)
    let json = null
    try {
      json = text === "" ? null : JSON.parse(text)
    } catch {
      json = null
    }
    if (response.status >= 400) {
      const apiMessage = apiMessageOf(text)
      throw new DockerError("api", `Docker API ${response.status}：${apiMessage || "(无报文)"}`, { status: response.status, apiMessage })
    }
    return { status: response.status, json, text }
  }

  /** 单请求·字节体（日志面——帧头/载荷逐字节保形，不先转字串；错误映射同 `request`）。 */
  async function requestBytes(method, path, { timeoutMs = readTimeoutMs } = {}) {
    const url = `${baseUrl}${path}`
    const signal = AbortSignal.timeout(timeoutMs)
    let response
    try {
      response = await fetchImpl(url, { method, signal })
    } catch (e) {
      const kind = signal.aborted ? "timeout" : "unreachable"
      const message = kind === "timeout" ? `节点响应超时（${timeoutMs}ms）：${url}` : `节点不可达：${url}（${e?.message ?? e}）`
      throw new DockerError(kind, message)
    }
    const buffer = Buffer.from(await response.arrayBuffer())
    if (response.status >= 400) {
      const apiMessage = apiMessageOf(buffer.toString("utf8"))
      throw new DockerError("api", `Docker API ${response.status}：${apiMessage || "(无报文)"}`, { status: response.status, apiMessage })
    }
    return { status: response.status, buffer }
  }

  return {
    baseUrl,
    apiVer,
    /** 版本读数（引导步无前缀 ∥ 常规带前缀——KD-SV-81）。 */
    version: () => request("GET", `${apiVer ? `/v${apiVer}` : ""}/version`),
    /** 节点读数（运行面探活——§3）。 */
    info: () => request("GET", `${prefix()}/info`),
    /** 容器列表（读时读——KD-SV-79；`all=1` 含未运行）。 */
    containers: () => request("GET", `${prefix()}/containers/json?all=1`),
    /** 容器态读数（引擎态三值——EXECUTION §2.1：墙钟判据 `StartedAt` ∥ 探针执行器 `ExitCode`；不在 ⇒ 引擎 404 ⇒ `api` 类可辨）。 */
    containerState: async (id) => {
      const res = await request("GET", `${prefix()}/containers/${encodeURIComponent(id)}/json`)
      const state = res.json?.State ?? {}
      return {
        ...res,
        state: {
          status: state.Status ?? null,
          running: state.Running === true,
          startedAt: state.StartedAt ?? null,
          finishedAt: state.FinishedAt ?? null,
          exitCode: Number.isInteger(state.ExitCode) ? state.ExitCode : null,
        },
      }
    },
    /** 网络（§3 底座）：建 ∥ 查 ∥ 删（建/删 = 动作类 15s）。 */
    createNetwork: (body) => request("POST", `${prefix()}/networks/create`, { body, timeoutMs: actionTimeoutMs }),
    inspectNetwork: (id) => request("GET", `${prefix()}/networks/${encodeURIComponent(id)}`),
    deleteNetwork: (id) => request("DELETE", `${prefix()}/networks/${encodeURIComponent(id)}`, { timeoutMs: actionTimeoutMs }),
    /** 存档流（快照/恢复——EXECUTION §3：取件 `GET …/archive?path=` ∥ 放件 `PUT …/archive?path=`；专用长超时，字节体原样）。 */
    archiveGet: (id, path) =>
      requestBytes("GET", `${prefix()}/containers/${encodeURIComponent(id)}/archive?path=${encodeURIComponent(path)}`, { timeoutMs: archiveTimeoutMs }),
    archivePut: (id, path, tar) =>
      request("PUT", `${prefix()}/containers/${encodeURIComponent(id)}/archive?path=${encodeURIComponent(path)}`, {
        rawBody: tar,
        headers: { "content-type": "application/x-tar" },
        timeoutMs: archiveTimeoutMs,
      }),
    /** 建容器（§3：`POST containers/create?name=<名>`——动作类超时）。 */
    createContainer: (name, body) => request("POST", `${prefix()}/containers/create?name=${encodeURIComponent(name)}`, { body, timeoutMs: actionTimeoutMs }),
    startContainer: (id) => request("POST", `${prefix()}/containers/${encodeURIComponent(id)}/start`, { timeoutMs: actionTimeoutMs }),
    stopContainer: (id) => request("POST", `${prefix()}/containers/${encodeURIComponent(id)}/stop`, { timeoutMs: actionTimeoutMs }),
    deleteContainer: (id, { force = true } = {}) =>
      request("DELETE", `${prefix()}/containers/${encodeURIComponent(id)}${force ? "?force=1" : ""}`, { timeoutMs: actionTimeoutMs }),
    /** 容器详情（读时读 inspect——KD-SV-92；`size=1` 兼用量面磁盘读数）。 */
    containerDetail: (id, { size = false } = {}) => request("GET", `${prefix()}/containers/${encodeURIComponent(id)}/json${size ? "?size=1" : ""}`),
    /** 容器日志（读类；KD-SV-93）：携 `timestamps=1`（行首引擎时标——日志窗单时间线与操作记录并流的排序单源）⇒ 解复用（判不出 ⇒ 原样）⇒ 文本截断 256 KiB（截断 ⇒ 尾句标记）。 */
    containerLogs: async (id, tail = LOG_TAIL_DEFAULT) => {
      const { buffer } = await requestBytes("GET", `${prefix()}/containers/${encodeURIComponent(id)}/logs?stdout=1&stderr=1&timestamps=1&tail=${encodeURIComponent(tail)}`)
      const payload = demuxDockerLogs(buffer) ?? buffer // 判不出 ⇒ 原样透传（TTY 容器）
      const text = payload.toString("utf8")
      if (Buffer.byteLength(text, "utf8") <= LOG_TEXT_LIMIT_BYTES) return { logs: text, truncated: false }
      return { logs: `${clipUtf8(text, LOG_TEXT_LIMIT_BYTES)}${LOG_TRUNCATED_MARK}`, truncated: true }
    },
    /** 重启（动作类——§3）。 */
    containerRestart: (id) => request("POST", `${prefix()}/containers/${encodeURIComponent(id)}/restart`, { timeoutMs: actionTimeoutMs }),
    /** 强杀（SIGKILL——信号可选不做；§3）。 */
    containerKill: (id) => request("POST", `${prefix()}/containers/${encodeURIComponent(id)}/kill`, { timeoutMs: actionTimeoutMs }),
    /** 用量读数（CPU/内存——读类；KD-SV-92；磁盘读数 = `containerDetail(id, { size: true })`）。 */
    containerStats: (id) => request("GET", `${prefix()}/containers/${encodeURIComponent(id)}/stats?stream=false&one-shot=true`),
    /** 镜像列表（读类——§3）。 */
    images: () => request("GET", `${prefix()}/images/json`),
    /** 拉取（同步——专用 10 分钟超时；KD-SV-94）：非 2xx ⇒ `request` 抛 api；200 流内 `error` ⇒ 同形抛（status 记 200）。
     *  `auth` = `X-Registry-Auth` 值（注册表凭据命中时携——KD-SV-188；缺省 `null` ⇒ 匿名，现状零改）。 */
    pullImage: async (fromImage, tag, { auth = null } = {}) => {
      const response = await request("POST", `${prefix()}/images/create?fromImage=${encodeURIComponent(fromImage)}&tag=${encodeURIComponent(tag)}`, {
        timeoutMs: pullTimeoutMs,
        ...(auth === null || auth === "" ? {} : { headers: { "x-registry-auth": auth } }),
      })
      const streamError = findStreamError(response.text)
      if (streamError !== null) throw new DockerError("api", `引擎拉取失败：${streamError}`, { status: 200, apiMessage: streamError })
      return response
    },
    /** 镜像详情（读类——`GET /images/<ref>/json`；`Id`/`RepoTags` 读面——EXECUTION §8 镜像就位：底座读/派生 tag 探/标准镜像 Id）。 */
    imageDetail: (ref) => request("GET", `${prefix()}/images/${normalizeImageRef(ref)}/json`),
    /** 构建（§8 派生构建流——`POST /build?t=<tag>`；体 = 单 Dockerfile tar；同步 10 分钟专用超时；流内 `error`/`errorDetail` 两形同收——沿 KD-SV-94）。 */
    buildImage: async (tag, context, { timeoutMs = buildTimeoutMs } = {}) => {
      const response = await request("POST", `${prefix()}/build?t=${encodeURIComponent(tag)}`, {
        rawBody: context,
        headers: { "content-type": "application/x-tar" },
        timeoutMs,
      })
      const streamError = findStreamError(response.text)
      if (streamError !== null) throw new DockerError("api", `引擎构建失败：${streamError}`, { status: 200, apiMessage: streamError })
      return response
    },
    /** 删除镜像（动作类；`ref` 含 `/`/`:` ⇒ 不经 `encodeURIComponent` 直入路径段——字符集已拒 `?`/`#`/`%`/空白；§3 KD-SV-95）。 */
    removeImage: (ref, { force = false } = {}) => request("DELETE", `${prefix()}/images/${ref}?force=${force ? 1 : 0}`, { timeoutMs: actionTimeoutMs }),
    /** 卷列表（读类——§3 卷族；`Volumes` 缺/null ⇒ 路由侧 `[]`）。 */
    volumes: () => request("GET", `${prefix()}/volumes`),
    /** 删卷（动作类；名形已由路由前置校验——`[A-Za-z0-9_.-]` 字符集直入路径段；§3 KD-SV-104）。 */
    removeVolume: (name) => request("DELETE", `${prefix()}/volumes/${name}`, { timeoutMs: actionTimeoutMs }),
    /** 原动词面（agent `docker` 工具——images ∥ pull ∥ logs ⋯；§3 工具表）。 */
    raw: (method, path, { body = null, timeoutMs = actionTimeoutMs } = {}) => request(method, `${prefix()}${path}`, { body, timeoutMs }),
  }
}

/** 传输选择（单点——§2.1）：明文行 ⇒ 注入 `fetchImpl`（**零涉**——不构造适配件）∥ TLS 行 ⇒ 材料按行解密 + `httpsFetchOf(tls, { requestImpl })`。 */
export function transportForRunner(row, { fetchImpl = fetch, config = {}, requestImpl = null } = {}) {
  if (connectionKindOf(row?.address) !== "tls") return fetchImpl
  return httpsFetchOf(tlsMaterialsOf(row, { config }), { requestImpl })
}

/** 节点行 → 客户端（`runtime_json.apiVer` = 登记时协商版本——KD-SV-81）。
 *  两参透传（与 `fetchImpl` 同形）：`config`（材料解密所需）∥ `requestImpl`（`node:https` 假件缝）——全链：路由族/盒链/管理面 chat `docker` 工具。 */
export function clientForRunner(row, { fetchImpl = fetch, config = {}, requestImpl = null, readTimeoutMs = READ_TIMEOUT_MS, actionTimeoutMs = ACTION_TIMEOUT_MS, pullTimeoutMs = PULL_TIMEOUT_MS, buildTimeoutMs = BUILD_TIMEOUT_MS, archiveTimeoutMs = ARCHIVE_TIMEOUT_MS } = {}) {
  let apiVer = null
  try {
    apiVer = JSON.parse(row?.runtime_json ?? "{}")?.apiVer ?? null
  } catch {
    apiVer = null
  }
  return createDockerClient({
    baseUrl: row.address,
    apiVer,
    fetchImpl: transportForRunner(row, { fetchImpl, config, requestImpl }),
    readTimeoutMs,
    actionTimeoutMs,
    pullTimeoutMs,
    buildTimeoutMs,
    archiveTimeoutMs,
  })
}

/**
 * 连通自检（§3 引导步 → 协商 → 复读）：① 无前缀 `GET <base>/version` 取读数 ⇒ ② 协商（不兼容 ⇒ 抛）⇒ ③ 带前缀复读全量。
 * 出 = `{ baseUrl, apiVer, readings }`（readings 逐值落 `runtime_json`）；失败 ⇒ `DockerError`（调用方转 502 + 零落库 + 审计行）。
 * `tls` = 三件材料（TLS 档——`{ ca, cert, key }`，未落库前的自检径；缺省 `null` = 明文，传输 = 注入 `fetchImpl`——零行为变化）。
 */
export async function selfCheckDocker({ address, fetchImpl = fetch, config = {}, requestImpl = null, tls = null, readTimeoutMs = READ_TIMEOUT_MS } = {}) {
  const baseUrl = normalizeDockerAddress(address, { tls: tls !== null })
  const transport = tls === null ? fetchImpl : httpsFetchOf(tls, { requestImpl })
  const guide = createDockerClient({ baseUrl, apiVer: null, fetchImpl: transport, readTimeoutMs })
  const first = await guide.version() // ① 引导步（无前缀）
  const apiVer = negotiateApiVersion(first.json ?? {}) // ② 协商
  const client = createDockerClient({ baseUrl, apiVer, fetchImpl: transport, readTimeoutMs })
  const full = await client.version() // ③ 复读（带前缀）
  return { baseUrl, apiVer, readings: readingsOf(full.json ?? first.json ?? {}, apiVer) }
}
