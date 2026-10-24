/**
 * platform-client.mjs — 四平台客户端（project/PROJECTS.md §4「客户端口径」∥ gateway/API.md §2.9 拉列表/同步/体检三行；
 * team-projects-permissions 批（B2））。
 *
 * 口径（§4）：原生 fetch 零第三方 ∥ **超时 = 平台口径**（`readTimeoutOf`——gitee 20s ∥ 余平台 10s；读类跨公网预算）∥ 分页上限（仓列表 ≤300 行 ∥ 成员表 ≤2000 行——
 * `truncated` 旗如实）∥ 错误六分类（`auth` ∥ `scope_missing` ∥ `unreachable` ∥ `timeout` ∥ `http_error` ∥ `bad_response`）∥
 * **零反向出站 = 全客户端只发 GET**（AC-44⑥——零 POST/PUT/PATCH/DELETE）。
 * 三平台基址/鉴权/路径逐条 = §4；自建 = GitLab 兼容协议（源 `base_url`）。角色映射 = §4 四表（`levelOfRole`）。
 * **gitee 范围三态**（KD-SV-151——`scopeKind` 单源）：个人 ⇒ 仅 `/user/repos`（成员表 `scope_missing`）∥ 组织 ⇒ `/orgs/{scope}/…` ∥ 企业 ⇒ `/enterprises/{scope}/…`；
 * 范围径 404 ⇒ `http_error` + 核对范围类型人话（**不自动改走他径**）；成员行嵌套形（企业 `user.login`）阅读 = `rosterRowOf`。
 * 消费面 = `sync.mjs`（名册/体检）∥ `admin-routes.mjs`（拉列表）；本件为纯客户端（单元测试档以假平台直测）。
 */
import { HttpError } from "../gateway/errors.mjs"

/** 读类超时（§4 平台口径——`readTimeoutOf` 单点）：gitee 20s（实测 `/user/repos` 4.8–5.4s——10s 预算不足）∥ 余平台 10s（沿镜像源读类跨公网预算）。 */
export const GITEE_READ_TIMEOUT_MS = 20000
export const READ_TIMEOUT_MS = 10000

/** 平台读类超时解析（§4——单点；`deps.timeoutMs` 注入面恒胜——各读面 `timeoutMs ?? readTimeoutOf(platform)`）。 */
export function readTimeoutOf(platform) {
  return platform === "gitee" ? GITEE_READ_TIMEOUT_MS : READ_TIMEOUT_MS
}

/** 分页页长（四平台同值）。 */
export const PAGE_SIZE = 100

/** 分页上限（§4）：仓列表 ≤300 行 ∥ 成员表 ≤2000 行（截断 ⇒ 同步跳过删除段——KD-SV-122）。 */
export const REPO_ROW_LIMIT = 300
export const ROSTER_ROW_LIMIT = 2000

/** 错误六分类（§4）。 */
export const ERROR_KINDS = Object.freeze(["auth", "scope_missing", "unreachable", "timeout", "http_error", "bad_response"])

/** 平台侧错误（六分类——调用面转自含失败形；非本类异常 ⇒ 调用面原样抛）。 */
export class PlatformError extends Error {
  constructor(kind, message) {
    super(message)
    this.name = "PlatformError"
    this.kind = kind
  }
}

/** 三平台固定基址 ∥ 自建（`base_url`——GitLab 兼容）。 */
export function platformBase({ platform, baseURL = null } = {}) {
  if (platform === "gitee") return "https://gitee.com/api/v5"
  if (platform === "github") return "https://api.github.com"
  if (platform === "gitlab") return "https://gitlab.com"
  const base = String(baseURL ?? "").replace(/\/+$/, "")
  if (base === "") throw new PlatformError("http_error", "自建平台未配置基址——编辑源补基址")
  return base
}

/** 鉴权头（§4 逐条）：gitee `Authorization: token` ∥ github `Bearer` + `User-Agent` ∥ gitlab `PRIVATE-TOKEN`。 */
export function authHeaders(platform, token) {
  if (platform === "gitee") return { authorization: `token ${token}`, accept: "application/json" }
  if (platform === "github") return { authorization: `Bearer ${token}`, accept: "application/vnd.github+json", "user-agent": "thincoder-server" }
  return { "private-token": token, accept: "application/json" }
}

/** 单次读（GET——零反向出站）：超时/网络 ⇒ 分类；401/403 ⇒ `auth`；余非 2xx ⇒ `http_error`；非 JSON ⇒ `bad_response`。
 *  `notFoundMessage` = 404 专用人话（范围径——`§4`；缺省 null ⇒ 通用消息）。
 *  `timeoutMs` = **必传**（#1369——去死缺省 + 卫兵：缺 ∥ 非有限数 ⇒ 抛，零静默推断——未来漏传不再静默落 `READ_TIMEOUT_MS`）。 */
async function readJSON(url, { headers, fetchImpl = fetch, timeoutMs, notFoundMessage = null } = {}) {
  if (typeof timeoutMs !== "number" || !Number.isFinite(timeoutMs)) {
    throw new Error(`readJSON：缺 timeoutMs（读类超时须显式传——零静默推断；实收 ${timeoutMs}）`)
  }
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    let res
    try {
      res = await fetchImpl(url, { method: "GET", headers, signal: controller.signal })
    } catch (e) {
      if (e?.name === "AbortError" || controller.signal.aborted) throw new PlatformError("timeout", `请求超时（${timeoutMs}ms）`)
      throw new PlatformError("unreachable", `不可达：${e?.message ?? String(e)}`)
    }
    if (res.status === 401 || res.status === 403) throw new PlatformError("auth", `凭据被拒（HTTP ${res.status}）`)
    if (!res.ok) {
      if (res.status === 404 && notFoundMessage !== null) throw new PlatformError("http_error", notFoundMessage)
      throw new PlatformError("http_error", `上游返回 HTTP ${res.status}`)
    }
    try {
      return await res.json()
    } catch (e) {
      throw new PlatformError("bad_response", `响应非合法 JSON：${e?.message ?? e}`)
    }
  } finally {
    clearTimeout(timer)
  }
}

/** 分页读（`per_page`/`page` 两参恒携）：`parse` = 页体 → 行数组（形不合 ⇒ `bad_response`）；出 = `{ rows, truncated }`。 */
async function readPages({ base, path, query = {}, headers, fetchImpl, timeoutMs, notFoundMessage = null, limit, parse }) {
  const rows = []
  let truncated = false
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ per_page: String(PAGE_SIZE), page: String(page), ...query })
    const payload = await readJSON(`${base}${path}?${params.toString()}`, { headers, fetchImpl, timeoutMs, notFoundMessage })
    const pageRows = parse(payload)
    rows.push(...pageRows.slice(0, Math.max(0, limit - rows.length)))
    if (pageRows.length < PAGE_SIZE) break // 末页（不满一页 ⇒ 无下一页）
    if (rows.length >= limit) {
      truncated = true
      break
    }
  }
  return { rows, truncated }
}

/** 页体须为数组（四平台读面同形）。 */
function asArray(payload, what) {
  if (!Array.isArray(payload)) throw new PlatformError("bad_response", `${what}响应形不合（非数组）`)
  return payload
}

/** 仓地址字段逐平台（§4——https 克隆形优先；归一同键由 project 域落）。 */
function repoAddressOf(platform, raw) {
  if (platform === "gitee") return raw.html_url ?? raw.ssh_url ?? null
  if (platform === "github") return raw.clone_url ?? raw.html_url ?? raw.ssh_url ?? null
  return raw.http_url_to_repo ?? raw.web_url ?? raw.ssh_url_to_repo ?? null
}

/** 仓全名逐平台。 */
function repoNamespaceOf(platform, raw) {
  if (platform === "gitee") return raw.full_name ?? raw.path ?? null
  if (platform === "github") return raw.full_name ?? null
  return raw.path_with_namespace ?? null
}

/** 仓行归一（出 = `{ fullName, address, private }`；缺址 ⇒ `bad_response`——形不合如实报，不静默丢行）。 */
export function repoRowOf(platform, raw) {
  if (raw === null || typeof raw !== "object") throw new PlatformError("bad_response", "仓行形不合（非对象）")
  const address = repoAddressOf(platform, raw)
  if (typeof address !== "string" || address.trim() === "") throw new PlatformError("bad_response", "仓行缺地址字段")
  const fullName = repoNamespaceOf(platform, raw)
  return {
    fullName: typeof fullName === "string" && fullName !== "" ? fullName : address,
    address,
    private: platform === "gitlab" || platform === "selfhosted" ? raw.visibility === "private" : raw.private === true,
  }
}

/** 仓列表路径（§4 逐条）。 */
function reposPath(platform) {
  if (platform === "gitee") return "/user/repos"
  if (platform === "github") return "/user/repos"
  return "/api/v4/projects"
}

/** gitee 范围段（§4 三态：企业 ⇒ `enterprises` ∥ 组织/缺省（防御）⇒ `orgs`）。 */
function giteeScopeSegment(scopeKind) {
  return scopeKind === "enterprise" ? "enterprises" : "orgs"
}

/** 范围径 404 人话（§4 gitee——不静默改走他径；出站零另一径请求）。 */
function giteeScopeNotFound(scopeKind, scope) {
  const what = scopeKind === "enterprise" ? "企业" : "组织"
  return `「${scope}」在${what}端点不存在——请核对范围类型/编辑源改选`
}

/** 仓列表入参（§4）：github = `affiliation` ∥ gitlab/自建 = `membership=true` ∥ gitee = 无。
 *  （#1369：原两个死面已去——一个死布尔参（if 支恒返 `{}`）∥ 一个未被函数体消费的参。） */
function reposQuery(platform) {
  if (platform === "github") return { affiliation: "owner,collaborator,organization_member" }
  if (platform === "gitlab" || platform === "selfhosted") return { membership: "true" }
  return {}
}

/**
 * 仓列表（§4）：account 可见仓（个人 + 组织）；`scope` 在场 ⇒ 并组织/企业仓（去重——gitee/github 两平台）。
 * gitee 三态（KD-SV-151）：`scopeKind='personal'` ⇒ 仅主径 ∥ `'org'` ⇒ `/orgs/…` ∥ `'enterprise'` ⇒ `/enterprises/…`（缺（防御）⇒ 沿现行组织径）。
 * 出 = `{ repos: [{ fullName, address, private }], truncated }`；错 ⇒ `PlatformError`（六分类；范围径 404 ⇒ 核对范围类型人话）。
 */
export async function listRepos({ platform, baseURL = null, token, scope = null, scopeKind = null, fetchImpl = fetch, timeoutMs = null } = {}) {
  const base = platformBase({ platform, baseURL })
  const headers = authHeaders(platform, token)
  const timeout = timeoutMs ?? readTimeoutOf(platform)
  const main = await readPages({
    base,
    path: reposPath(platform),
    query: reposQuery(platform),
    headers,
    fetchImpl,
    timeoutMs: timeout,
    limit: REPO_ROW_LIMIT,
    parse: (payload) => asArray(payload, "仓列表").map((raw) => repoRowOf(platform, raw)),
  })
  const rows = [...main.rows]
  let truncated = main.truncated
  const withScope = scope && (platform === "github" || (platform === "gitee" && scopeKind !== "personal"))
  if (withScope) {
    const segment = platform === "gitee" ? giteeScopeSegment(scopeKind) : "orgs"
    const org = await readPages({
      base,
      path: `/${segment}/${encodeURIComponent(scope)}/repos`,
      query: {},
      headers,
      fetchImpl,
      timeoutMs: timeout,
      notFoundMessage: platform === "gitee" ? giteeScopeNotFound(scopeKind, scope) : null,
      limit: REPO_ROW_LIMIT,
      parse: (payload) => asArray(payload, "组织仓列表").map((raw) => repoRowOf(platform, raw)),
    })
    const seen = new Set(rows.map((row) => row.fullName.toLowerCase()))
    for (const row of org.rows) {
      if (seen.has(row.fullName.toLowerCase())) continue
      seen.add(row.fullName.toLowerCase())
      rows.push(row)
    }
    truncated = truncated || org.truncated
  }
  if (rows.length > REPO_ROW_LIMIT) { rows.length = REPO_ROW_LIMIT; truncated = true } // 合并径（主 + 组织）同守 300 行上限——旗如实
  return { repos: rows, truncated }
}

/** 平台角色 ⇒ 三档（§4 四表）：gitlab/自建按 `access_level`（10/20 ⇒ 只读 ∥ 30 ⇒ 读写 ∥ 40/50 ⇒ 管理）；gitee/github 按 `admin` 标记。 */
export function levelOfRole(platform, role) {
  if (platform === "gitlab" || platform === "selfhosted") {
    const n = Number(role)
    if (!Number.isFinite(n)) return "read"
    if (n >= 40) return "manage"
    if (n >= 30) return "readwrite"
    return "read"
  }
  return role === "admin" ? "manage" : "read"
}

/** 名册行归一（出 = `{ username, role, level }`；缺用户名 ⇒ `bad_response`）。
 *  gitee：顶层 `login`/`username` 先行（组织行零变）∥ 企业嵌套 `user.login`/`user.username`（KD-SV-151）。 */
function rosterRowOf(platform, raw) {
  if (raw === null || typeof raw !== "object") throw new PlatformError("bad_response", "成员行形不合（非对象）")
  const username = platform === "gitee"
    ? raw.login ?? raw.username ?? raw.user?.login ?? raw.user?.username
    : raw.username ?? raw.login
  if (typeof username !== "string" || username.trim() === "") throw new PlatformError("bad_response", "成员行缺用户名")
  if (platform === "gitlab" || platform === "selfhosted") {
    const role = Number(raw.access_level)
    return { username, role, level: levelOfRole(platform, role) }
  }
  // gitee：组织/企业管理员标记「响应在场时」（§4——缺 ⇒ 只读底线）；github：role 参数两级取（调用侧传 role）
  const isAdmin = platform === "gitee" ? raw.is_admin === true || raw.admin === true || raw.role === "admin" : raw.__role === "admin"
  return { username, role: isAdmin ? "admin" : "member", level: levelOfRole(platform, isAdmin ? "admin" : "member") }
}

/** 名册路径（§4 逐条——gitee 三态：`orgs`/`enterprises` 两径同形）。 */
function rosterPath(platform, scope, { scopeKind = null } = {}) {
  const org = encodeURIComponent(scope)
  if (platform === "gitee") return `/${giteeScopeSegment(scopeKind)}/${org}/members`
  if (platform === "github") return `/orgs/${org}/members`
  return `/api/v4/groups/${org}/members/all`
}

/**
 * 成员名册（§4）：scope 缺 ⇒ `scope_missing`（「未配置组织/组——填后才能同步成员」）；
 *  gitee 个人范围 ⇒ 同分类（「个人范围无成员表」——KD-SV-151；三态不适用面）；
 *  github = 两级取（成员 = 只读底线 ∥ `role=admin` 集 = 管理）；出 = `{ members: [{ username, role, level }], truncated }`。
 */
export async function fetchRoster({ platform, baseURL = null, token, scope = null, scopeKind = null, fetchImpl = fetch, timeoutMs = null } = {}) {
  if (platform === "gitee" && scopeKind === "personal") {
    throw new PlatformError("scope_missing", "个人范围无成员表——成员同步仅组织/企业可用")
  }
  if (scope === null || String(scope).trim() === "") {
    throw new PlatformError("scope_missing", "未配置组织/组——填后才能同步成员")
  }
  const base = platformBase({ platform, baseURL })
  const headers = authHeaders(platform, token)
  const timeout = timeoutMs ?? readTimeoutOf(platform)
  const parse = (payload) => asArray(payload, "成员名册").map((raw) => rosterRowOf(platform, raw))
  const main = await readPages({
    base,
    path: rosterPath(platform, scope, { scopeKind }),
    headers,
    fetchImpl,
    timeoutMs: timeout,
    notFoundMessage: platform === "gitee" ? giteeScopeNotFound(scopeKind, scope) : null,
    limit: ROSTER_ROW_LIMIT,
    parse,
  })
  if (platform !== "github") return { members: main.rows, truncated: main.truncated }
  const admins = await readPages({
    base,
    path: rosterPath(platform, scope),
    query: { role: "admin" },
    headers,
    fetchImpl,
    timeoutMs: timeout,
    limit: ROSTER_ROW_LIMIT,
    parse: (payload) => asArray(payload, "管理员名册").map((raw) => rosterRowOf(platform, { ...raw, __role: "admin" })),
  })
  const byName = new Map()
  for (const member of main.rows) byName.set(member.username.toLowerCase(), member)
  for (const admin of admins.rows) byName.set(admin.username.toLowerCase(), admin) // 管理员集胜（§4 两级取）
  return { members: [...byName.values()], truncated: main.truncated || admins.truncated }
}

/** PAT 体检（§4：gitee/github = `GET /user`；gitlab/自建 = `GET /api/v4/user`）；成 ⇒ `{ ok: true, account }`。 */
export async function checkToken({ platform, baseURL = null, token, fetchImpl = fetch, timeoutMs = null } = {}) {
  const base = platformBase({ platform, baseURL })
  const headers = authHeaders(platform, token)
  const path = platform === "gitlab" || platform === "selfhosted" ? "/api/v4/user" : "/user"
  const payload = await readJSON(`${base}${path}`, { headers, fetchImpl, timeoutMs: timeoutMs ?? readTimeoutOf(platform) })
  if (payload === null || typeof payload !== "object") throw new PlatformError("bad_response", "体检响应形不合（非对象）")
  const account = payload.login ?? payload.username ?? null
  return { ok: true, account: typeof account === "string" ? account : null }
}

/** 自含失败形（§2.9 三读动作：败 ⇒ `{ ok:false, error:{kind,message}, ms }`——不成统一信封）。 */
export function failureBody(e, startedMs, now = Date.now()) {
  if (e instanceof PlatformError) return { ok: false, error: { kind: e.kind, message: e.message }, ms: now - startedMs }
  throw e // 非分类错（bug）不假装分类——上抛 500
}

/** 路由面形错 ⇒ 400（`HttpError` 原样过）。 */
export function asHttpError(e) {
  return e instanceof HttpError ? e : new HttpError("invalid_request_error", e.message)
}
