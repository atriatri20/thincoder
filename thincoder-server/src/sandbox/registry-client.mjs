/**
 * registry-client.mjs — 远端镜像源客户端（sandbox/SANDBOX.md §3「源目录读取」∥ gateway/API.md §2.5 目录/标签两行；sandbox-image-sources 批）。
 *
 * 形态（KD-SV-97）：v2 面 = `GET <base>/v2/_catalog?n=<N>` ∥ `GET <base>/v2/<name>/tags/list?n=<N>`；Hub 面（`kind=hub`）=
 * `GET <hub>/v2/repositories/<ns>/<repo>/tags?page_size=<min(N,100)>`（**API 主机与登记址无关**；目录 ⇒ `unsupported`——Hub 官方无全站目录 API，
 * 如实报；裸名补 `library/`）；**匿名 Bearer 挑战**（401 + `WWW-Authenticate: Bearer` ⇒ 取 `realm`（+ `service`）⇒ 匿名换 token
 * （响应键 `token` ∥ `access_token`）⇒ 携 `Bearer` 复读一次；**零凭据**——私有源如实 `auth_required`）；**有界首页**（`n` 1–1000 ∥ 缺省 200
 * + `truncated`——**不翻页**）；**五分类如实报错**（`timeout` ∥ `unreachable` ∥ `auth_required` ∥ `unsupported` ∥ `bad_response`——
 * 自含状态形，沿 `/api/admin/proxy/test` 先例）。
 * 读类预算 10s（跨公网——非节点面 3s）；`fetchImpl` 注入 = 测试（缺省 = 全局 fetch——生产行为不变）。
 */
/** 读类预算（§2.5——10s；注入口径 = 注册参数 `readTimeoutMs`）。 */
export const REGISTRY_READ_TIMEOUT_MS = 10000
/** `n` 界（§3 有界首页：缺省 200 ∥ 1–1000）。 */
export const REGISTRY_N_DEFAULT = 200
export const REGISTRY_N_MAX = 1000
/** Hub 公开 API 主机（§3：与登记址无关）∥ Hub 单页上限（`page_size = min(n,100)`）。 */
export const HUB_API_BASE = "https://hub.docker.com"
export const HUB_PAGE_SIZE_MAX = 100
/** 目录读的匿名 scope（§3：目录 = `registry:catalog:*` ∥ 标签 = `repository:<name>:pull`）。 */
export const CATALOG_SCOPE = "registry:catalog:*"
/** 五分类读绪（§3——如实报；落自含状态形 `error.kind`）。 */
export const READ_ERROR_KINDS = Object.freeze(["timeout", "unreachable", "auth_required", "unsupported", "bad_response"])

/** 远端读失败（分类 = 五分类之一；消息 = 逐句人话——调用面转自含状态形，不套统一信封）。 */
export class RegistryError extends Error {
  constructor(kind, message) {
    super(message)
    this.name = "RegistryError"
    this.kind = READ_ERROR_KINDS.includes(kind) ? kind : "bad_response"
  }
}

/** `n` 判据（§3 有界：缺省 200 ∥ 1–1000；越界/非数 ⇒ 抛——调用面 400 **零外呼**）。 */
export function parseBoundedN(raw, { field = "n" } = {}) {
  if (raw === null || raw === undefined || String(raw).trim() === "") return REGISTRY_N_DEFAULT
  const text = String(raw).trim()
  if (!/^\d+$/.test(text)) throw new Error(`${field} 须为正整数（1–${REGISTRY_N_MAX}）：${raw}`)
  const value = Number(text)
  if (value < 1 || value > REGISTRY_N_MAX) throw new Error(`${field} 越界（1–${REGISTRY_N_MAX}；给定 ${value}）`)
  return value
}

/** 仓库名判据（§3：小写字母数字 + `._-/` 分隔；空 ∥ 空白 ∥ 大写 ∥ `..` ∥ 其他字符 ⇒ 拒——防路径穿越；调用面 400 零外呼）。 */
export function normalizeRepoName(raw) {
  const name = typeof raw === "string" ? raw : ""
  if (name === "") throw new Error("仓库名不可为空（name）")
  if (/\s/.test(name)) throw new Error(`仓库名不可含空白：${raw}`)
  if (name.length > 255) throw new Error(`仓库名超长（≤ 255 字符；实长 ${name.length}）`)
  if (/[A-Z]/.test(name)) throw new Error(`仓库名仅收小写（大写不收）：${name}`)
  if (name.includes("..")) throw new Error(`仓库名禁 ..（防路径穿越）：${name}`)
  if (!/^[a-z0-9](?:[a-z0-9._/-]*[a-z0-9])?$/.test(name)) throw new Error(`仓库名形非法（小写字母数字 + . _ - / 分隔）：${name}`)
  return name
}

/** Bearer 挑战解析（§3：取 `realm`（+ `service`/`scope`）；不可解析 ⇒ null——调用面落 `auth_required`）。 */
export function parseBearerChallenge(header) {
  const text = typeof header === "string" ? header.trim() : ""
  if (!/^bearer\b/i.test(text)) return null
  const params = {}
  for (const match of text.matchAll(/([A-Za-z]+)\s*=\s*"([^"]*)"/g)) params[match[1].toLowerCase()] = match[2]
  for (const match of text.matchAll(/([A-Za-z]+)\s*=\s*([^",\s]+)/g)) {
    const key = match[1].toLowerCase()
    if (params[key] === undefined) params[key] = match[2]
  }
  if (typeof params.realm !== "string" || params.realm === "") return null
  return { realm: params.realm, service: params.service ?? null, scope: params.scope ?? null }
}

/** Hub 仓库路径（§3：裸名补 `library/`——Hub 命名空间惯例；已含 `/` ⇒ 原样）。 */
export function hubRepoPath(name) {
  const raw = String(name ?? "")
  return raw.includes("/") ? raw : `library/${raw}`
}

/** `truncated` 判据（§3：v2 = `Link: …rel="next"` 在场 ⇒ 远端还有下一页）。 */
export function hasNextLink(response) {
  const link = response?.headers?.get?.("link") ?? null
  return typeof link === "string" && /rel\s*=\s*"?next"?/i.test(link)
}

/** 响应体小结（人话报错用——压平空白 + 截 ≤ 120 字）。 */
function bodySnippet(text) {
  const flat = String(text ?? "").replace(/\s+/g, " ").trim()
  return flat.length > 120 ? `${flat.slice(0, 120)}…` : flat
}

/** 响应体释放（只取分类/头时——拆流释放连接，零挂起；释放失败无面）。 */
function release(response) {
  try {
    Promise.resolve(response?.body?.cancel?.()).catch(() => {})
  } catch {
    /* 释放尽力而为——分类读数已得 */
  }
}

/** 单次 GET（超预算 ⇒ `timeout` ∥ 连不上 ⇒ `unreachable`——分类判据 = `signal.aborted`）。 */
async function fetchOnce(url, { fetchImpl, timeoutMs, headers = null }) {
  const signal = AbortSignal.timeout(timeoutMs)
  try {
    return await fetchImpl(url, { method: "GET", signal, ...(headers === null ? {} : { headers }) })
  } catch (e) {
    const kind = signal.aborted ? "timeout" : "unreachable"
    const message = kind === "timeout" ? `源响应超时（${timeoutMs}ms）：${url}` : `源不可达：${url}（${e?.message ?? e}）`
    throw new RegistryError(kind, message)
  }
}

/** 体 ⇒ JSON（200 非 JSON/解析败 ⇒ `bad_response`——B56 形）。 */
async function readJson(response, url) {
  let text
  try {
    text = await response.text()
  } catch (e) {
    throw new RegistryError("bad_response", `源响应体读取失败：${e?.message ?? e}（${url}）`)
  }
  try {
    return JSON.parse(text)
  } catch {
    throw new RegistryError("bad_response", `源响应非 JSON（HTTP ${response.status}——${url}）：${bodySnippet(text)}`)
  }
}

/** 非 2xx 分类（§3）：401/403 ⇒ `auth_required` ∥ 405/501 ⇒ `unsupported` ∥ 余 ⇒ `bad_response`（消息携状态与人话）。 */
function statusError(response, url) {
  const status = response.status
  if (status === 401 || status === 403) return new RegistryError("auth_required", `源要求认证（HTTP ${status}——零凭据面）：${url}`)
  if (status === 405 || status === 501) return new RegistryError("unsupported", `远端不支持该接口（HTTP ${status}）：${url}`)
  return new RegistryError("bad_response", `远端响应异常（HTTP ${status}）：${url}`)
}

/** 匿名换 token（§3：`realm?service=&scope=` ⇒ 响应键 `token` ∥ `access_token`；端点非 2xx/无 token ⇒ `auth_required`）。 */
async function requestToken({ challenge, scope, fetchImpl, timeoutMs }) {
  const params = new URLSearchParams()
  if (typeof challenge.service === "string" && challenge.service !== "") params.set("service", challenge.service)
  if (typeof scope === "string" && scope !== "") params.set("scope", scope)
  const query = params.toString()
  const url = query === "" ? challenge.realm : `${challenge.realm}${challenge.realm.includes("?") ? "&" : "?"}${query}`
  const response = await fetchOnce(url, { fetchImpl, timeoutMs })
  let json = null
  try {
    json = JSON.parse(await response.text())
  } catch {
    json = null
  }
  if (response.status < 200 || response.status >= 300) {
    throw new RegistryError("auth_required", `token 端点拒发（HTTP ${response.status}）：${url}`)
  }
  const token = typeof json?.token === "string" && json.token !== "" ? json.token : (typeof json?.access_token === "string" ? json.access_token : "")
  if (token === "") throw new RegistryError("auth_required", `token 端点未回 token/access_token：${url}`)
  return token
}

/** 带认证的单次读（§3：401 + 挑战可解析 ⇒ 换 token ⇒ 携 `Bearer` 复读一次；不可解析/复读仍 401 ⇒ `auth_required`）。 */
async function readWithAuth({ url, fetchImpl, timeoutMs, scope }) {
  const first = await fetchOnce(url, { fetchImpl, timeoutMs })
  if (first.status !== 401) return first
  const challenge = parseBearerChallenge(first.headers.get("www-authenticate"))
  release(first)
  if (challenge === null) throw new RegistryError("auth_required", `源要求认证且挑战不可解析（WWW-Authenticate 缺失/非法）：${url}`)
  const token = await requestToken({ challenge, scope, fetchImpl, timeoutMs })
  const second = await fetchOnce(url, { fetchImpl, timeoutMs, headers: { authorization: `Bearer ${token}` } })
  if (second.status === 401) {
    release(second)
    throw new RegistryError("auth_required", `匿名 Bearer 换取后仍 401——需认证（私有源；本批零凭据面）：${url}`)
  }
  return second
}

/** v2 目录读（§3：`GET <base>/v2/_catalog?n=<n>`；成 = `{ repositories, truncated }`）。 */
export async function readCatalog({ base, n = REGISTRY_N_DEFAULT, fetchImpl = fetch, timeoutMs = REGISTRY_READ_TIMEOUT_MS } = {}) {
  const url = `${base}/v2/_catalog?n=${n}`
  const response = await readWithAuth({ url, fetchImpl, timeoutMs, scope: CATALOG_SCOPE })
  if (response.status < 200 || response.status >= 300) {
    const error = statusError(response, url)
    release(response)
    throw error
  }
  const json = await readJson(response, url)
  if (!Array.isArray(json?.repositories)) throw new RegistryError("bad_response", `远端 _catalog 形不符（repositories 非数组）：${url}`)
  return { repositories: json.repositories.filter((item) => typeof item === "string"), truncated: hasNextLink(response) }
}

/** v2 标签读（§3：`GET <base>/v2/<name>/tags/list?n=<n>`；`tags` 缺/null ⇒ 空表——如实；成 = `{ tags, truncated }`）。 */
export async function readTags({ base, name, n = REGISTRY_N_DEFAULT, fetchImpl = fetch, timeoutMs = REGISTRY_READ_TIMEOUT_MS } = {}) {
  const url = `${base}/v2/${name}/tags/list?n=${n}`
  const response = await readWithAuth({ url, fetchImpl, timeoutMs, scope: `repository:${name}:pull` })
  if (response.status < 200 || response.status >= 300) {
    const error = statusError(response, url)
    release(response)
    throw error
  }
  const json = await readJson(response, url)
  const tags = json?.tags
  if (tags !== null && tags !== undefined && !Array.isArray(tags)) throw new RegistryError("bad_response", `远端 tags/list 形不符（tags 非数组）：${url}`)
  return { tags: Array.isArray(tags) ? tags.filter((item) => typeof item === "string") : [], truncated: hasNextLink(response) }
}

/** Hub 标签读（§3：裸名补 `library/`；`page_size = min(n,100)`；`truncated` = `next` 非空）。 */
export async function readHubTags({ name, n = REGISTRY_N_DEFAULT, fetchImpl = fetch, timeoutMs = REGISTRY_READ_TIMEOUT_MS } = {}) {
  const repo = hubRepoPath(name)
  const url = `${HUB_API_BASE}/v2/repositories/${repo}/tags?page_size=${Math.min(n, HUB_PAGE_SIZE_MAX)}`
  const response = await fetchOnce(url, { fetchImpl, timeoutMs })
  if (response.status < 200 || response.status >= 300) {
    const error = statusError(response, url)
    release(response)
    throw error
  }
  const json = await readJson(response, url)
  if (!Array.isArray(json?.results)) throw new RegistryError("bad_response", `Hub 响应形不符（results 非数组）：${url}`)
  const tags = json.results.map((item) => item?.name).filter((item) => typeof item === "string")
  return { tags, truncated: typeof json?.next === "string" && json.next !== "" }
}

/** 目录读面分派（§3）：`kind=hub` ⇒ `unsupported`（Hub 官方无全站目录 API——**零外呼**）；余 ⇒ v2 读。 */
export async function readCatalogFor({ kind, base, n = REGISTRY_N_DEFAULT, fetchImpl = fetch, timeoutMs = REGISTRY_READ_TIMEOUT_MS } = {}) {
  if (kind === "hub") throw new RegistryError("unsupported", "Hub 无全站目录 API（官方关闭）——改用「按镜像名查标签」（Hub 面）")
  return readCatalog({ base, n, fetchImpl, timeoutMs })
}

/** 标签读面分派（§3）：`kind=hub` ⇒ Hub 公开 API（登记址无关）；余 ⇒ v2 读。 */
export async function readTagsFor({ kind, base, name, n = REGISTRY_N_DEFAULT, fetchImpl = fetch, timeoutMs = REGISTRY_READ_TIMEOUT_MS } = {}) {
  if (kind === "hub") return readHubTags({ name, n, fetchImpl, timeoutMs })
  return readTags({ base, name, n, fetchImpl, timeoutMs })
}
