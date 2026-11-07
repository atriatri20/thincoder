/**
 * browser/session-state.mjs — 会话态动作（`cookies` ∥ `storage` 各三形）∥ 域过滤 ∥ 写后回读核对 ∥ 回执文法
 * （设计权威 = `docs/core/design/BROWSER-TOOL.md` §2.2 两行 ∥ §3.4 会话态面 ∥ §6 KD-27 / KD-28 / KD-29 / KD-30）。
 *
 * 两条路的语义差（KD-27）：cookie 是**浏览器级**存储（全 profile 一份）⇒ 给什么 `domain` 写什么域，跨域直写成立；
 * storage 只有页内 `window.localStorage` / `window.sessionStorage` 一条路（无 CDP 专用域）⇒ 只作用于当前页 origin，
 * 写别的源要先 `navigate`（浏览器存储本身的界，不是保守选择）。
 * 取面（KD-29）：三形全走**页面会话**的 `Network` 域——`get` = `Network.getAllCookies`（全 profile，含 httpOnly；
 * 页级 `getCookies` 只回当前页域条目，而需求要「当前会话可见的全部」）· `set` = `Network.setCookie` 逐条 ·
 * `clear` 有 `domain` 逐条 `Network.deleteCookies`、无 `domain` `Network.clearBrowserCookies`。
 * **不设取面回落**：实测（本机 Edge 147.0.3912.60）浏览器级连接上只有 Storage 域，`Network.*` 全报 `-32601`；
 * 真实分野是连接级别，回落分支护的是一个不存在的场景。
 * 成功判据（KD-30）：`Network.setCookie` 的 `success` **不是**有效性判据（`sameSite:"Bogus"` 与
 * `domain:"https://nope"` 都回 `success:true`，后者被存成域 `https`）⇒ 客户端先拦非法形，再按 `name`+`domain`
 * 回读核对：**逐字比 `value`**（请求给了 `path` 的再核 `path`）——只核 `name`+`domain` 时同名同域覆盖写会拿
 * 旧值假通过，而 AC-BT6 要的恰是「回执值与写入值逐字相等」；未落地 ∥ 值是旧值 ⇒ 明示错并点名存储里的实际
 * 内容（不谎报成功）。
 * 域匹配（§2.2「全等 ∥ 子域」）：落在**主机边界**上——纯字符串后缀会把 `127.0.0.1` 认成 `0.0.1` 的子域，
 * 而带域 `clear` 是破坏性动作，认错一次就删掉别的主机条目。IP 字面量没有子域 ⇒ 只走全等。
 * 免审（N-BT7 ∥ 用户 2026-11-06 裁）：分类在 `tools/browser.mjs` 的 `isReadonlyAction`——本档不碰门面。
 * 回执值照出、**不打码**（AC-BT6）：cookie 逐条一行、标记尾置（`; httpOnly` 等）——这一列正是 AC-BT1 的对照面。
 * 形检（§2.2 的形判规则，一条判法管**全部**声明了类型的参数）：**键不存在 = 没给**（落缺省或当前页源）；
 * **给了就必须是声明类型且形合法**，否则显式拒——`null` 也算「给了但形不对」，不是「没给」。没有第二个判法，
 * 不设「这个字段宽松一点」的例外：逐字段的句子清单下一个字段加进来就会漏（本批的 `httpOnly` ∥ `secure` ∥
 * `sameSite` ∥ `expires` ∥ `path` 就是这么漏掉的——`httpOnly:"true"` 被静默收成 `false`，得到一条不是 httpOnly
 * 的 cookie 加一张成功回执，而 AC-BT1 的主题正是 httpOnly）。
 * 「当作没给」的后果不是无害的：`domain` 非法 ⇒ `clear` 升级成全域清空 ∥ `key` 非法 ⇒ `store.clear()` 清整份
 * store；逐项 `cookies[].domain` 与顶层同一判法（`null` ∥ 非串 ∥ 空串 ∥ 带端口都拒）。`cookies set` 未给 `domain`
 * 且页面无 http(s) origin ⇒ 明示拒，不落到浏览器的原始 CDP 错。`area` 不另立形检句：它本就有值域句
 * （枚举二选一）⇒ 给了 `null` ∥ 非字符串 ∥ 空串一律落 `unknown storage area "<x>"`（`null` 渲染成 `"null"`），
 * 不静默落缺省（缺省只在「键不存在」时取）。
 * 读不出不得顶替空集合（两类面同一条）：`Network.getAllCookies` 不回数组 ∥ storage 全量面的页侧回执缺
 * `entries` ⇒ 明示错，不回 `0 cookie(s)` ∥ `0 key(s)` ∥ `0 removed`——那是一个读失败伪装成的事实。
 */

const mark = (kind) => `/*thincoder-browser:${kind}*/`

export const COOKIE_OPS = ["get", "set", "clear"]
export const STORAGE_OPS = ["get", "set", "clear"]
export const STORAGE_AREAS = ["localStorage", "sessionStorage"]
export const SAME_SITE_VALUES = ["Strict", "Lax", "None"]
/** 回执正文上限（N-BT3 族——同 `evaluate` / `clipboard read` 的 8000 字符）。 */
export const SESSION_STATE_MAX_CHARS = 8_000

/** 域的比对形（cookie 域带前导点 ∥ 大小写不敏感——协议里 `Domain` 的写法与 `getAllCookies` 的回读形不同）。 */
const bare = (domain) => String(domain ?? "").replace(/^\./, "").toLowerCase()

/** 主机是不是 IP 字面量（IPv4 四点形 ∥ 带冒号的 IPv6）：IP 没有子域——`0.0.1` 不是 `127.0.0.1` 的父域。 */
function isIpLiteral(host) {
  if (host.includes(":")) return true
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)
}

/** 域匹配（`get` 过滤 ∥ `clear` 作用域）：全等 ∥ 子域（cookie 的域本就含子域——`Domain=.example.test` 覆盖其下全部）。
 *  子域只在两边都是主机名时成立：`endsWith("." + w)` 保证落在标签边界上，但边界还不够——`127.0.0.1` 也以
 *  `.0.0.1` 结尾；IP 字面量没有子域关系，故两侧任一为 IP 就只剩全等。否则带域 `clear` 会删掉别的主机条目。 */
function domainMatches(cookieDomain, wanted) {
  const c = bare(cookieDomain)
  const w = bare(wanted)
  if (c === w) return true
  if (isIpLiteral(c) || isIpLiteral(w)) return false
  return c.endsWith(`.${w}`)
}

function hostOf(url) {
  try { return new URL(String(url)).hostname } catch { return "" }
}

export function unknownCookieOp(op) {
  return `unknown cookies op "${op}" — ops: ${COOKIE_OPS.join(", ")}`
}

export function unknownStorageOp(op) {
  return `unknown storage op "${op}" — ops: ${STORAGE_OPS.join(", ")}`
}

export function unknownStorageArea(area) {
  return `unknown storage area "${area}" — areas: ${STORAGE_AREAS.join(", ")}`
}

/** `sameSite` 归一（大小写不敏感 ⇒ 协议枚举名）；不在册 ⇒ null。值域 = 声明类型（string）+ 枚举二选一：
 *  **非字符串一律 null**——判形不靠 stringify（`["Lax"]` 会 stringify 成合法枚举名，那样「非字符串 ⇒ 拒」
 *  就落空；兄弟参数 `area` 已经为此收过一手）；**不 trim**——设计只给了「大小写不敏感」这一条归一，
 *  `" Lax "` 不在枚举里，多一条就是没写进设计的宽松面。 */
export function normalizeSameSite(value) {
  if (typeof value !== "string") return null
  const raw = value.toLowerCase()
  return SAME_SITE_VALUES.find((v) => v.toLowerCase() === raw) ?? null
}

/** 主机串带端口（`<host>:<port>`）：判法 = **只含一个冒号且冒号后是纯数字**。IPv6 字面量本身有多个冒号（`::1`），
 *  按「含冒号」一刀切会把「IP 字面量只走全等」那条的合法形一起拒掉；而 `<host>:<port>` 恰是单冒号 + 纯数字尾巴。 */
function hostWithPort(host) {
  const parts = host.split(":")
  return parts.length === 2 && /^\d+$/.test(parts[1])
}

/** 裸主机名检（§2.2：含 `://` ∥ 含 `/` ∥ 含空白 ∥ 带端口 ⇒ 拒）。浏览器不拒这类输入——它把 `domain:"https://nope"`
 *  存成域 `https`（KD-30 的实测来历），所以这一拦只能由客户端做。端口那一条的理由是**静默零比报错坏**：cookie
 *  的域只记主机、端口从不入域，而 `localhost:3000` 是本地 dev 抄域名最自然的写法——放行它，`get` ∥ `clear`
 *  都在零匹配上安静地回 `0 cookie(s)` ∥ `0 removed`，读起来像「那个域本来就没有」。 */
function badBareHost(domain) {
  if (typeof domain !== "string") return true
  return domain.trim() === "" || /:\/\//.test(domain) || domain.includes("/") || /\s/.test(domain) || hostWithPort(domain)
}

/** `domain` 形检（§2.2 · U86 ∥ U93）：给了但不是**非空裸主机串**（非串 ∥ 空串 ∥ 带 scheme ∥ 带 path ∥ 含空白
 *  ∥ 带端口）⇒ 明示拒。顶层与逐项**同一个判法**（`badBareHost` 单源）：只拦「空串 ∥ 非串」的话，顶层这一支会把
 *  `domain:"https://nope"` 静默落成一次空过滤——`[cookies clear] 0 removed (domain "https://nope")`
 *  读起来像「那个域已经干净」，实际一条都没动（与 U80 逐项那一格同一个形）；`localhost:3000` 同形（U93）。
 *  文案单源——工具面（`tools/browser.mjs` 的 `validateArgs`）与动作面共用这一句。 */
export function cookieDomainError(domain) {
  if (!badBareHost(domain)) return null
  return 'cookies "domain" must be a non-empty host string (omit it to address every domain)'
}

/** `key` 形检（§2.2 · U86）：给了但不是字符串 ⇒ 明示拒。空串是合法键名，不拒。 */
export function storageKeyError(key) {
  if (typeof key === "string") return null
  return 'storage "key" must be a string (omit it to address every key)'
}

/** `domain` 归一到过滤面：**未给** ⇒ null（不设过滤）；**给了** ⇒ 形检，形不对就明示拒——不静默当作没给
 *  （U86：`clear` 会把一个畸形输入兑现成全域清空）。 */
function domainFilter(domain) {
  if (domain === undefined) return null
  const invalid = cookieDomainError(domain)
  if (invalid) throw new Error(invalid)
  return domain
}

/** `cookies set` 的逐项校验（§2.2 的形判规则 + 字段实例表；返回因由消息或 null——工具面与动作面共用同一处
 *  文案，D2 单一权威）。判法只有一条：键不存在 = 没给；给了就必须是声明类型且形合法，否则显式拒；`null`
 *  也算「给了但形不对」。逐项字段不各写一套判法——字段加进来就漏，规则不漏。 */
export function cookieSetError(cookies) {
  if (!Array.isArray(cookies) || cookies.length === 0) return "cookies set requires cookies"
  for (const item of cookies) {
    if (!item || typeof item !== "object" || Array.isArray(item)) return "cookies set requires name and value on every cookie"
    // 键缺失与「给了但类型不对」分两句（§2.2 字段表）：前者说的是缺什么，后者点名是哪个字段的形不对。
    if (item.name === undefined || item.value === undefined) return "cookies set requires name and value on every cookie"
    if (typeof item.name !== "string") return 'cookies set "name" must be a string'
    if (item.name === "") return "cookies set requires name and value on every cookie"
    if (typeof item.value !== "string") return 'cookies set "value" must be a string'
    // 逐项与顶层同一个判法（§2.2 · U86）：`null` ∥ 非字符串 ∥ 空串一律拒，只有「键不存在」才算没给。
    // 逐项放行 `null` 会让同一个参数两级两套语义，读者只能靠猜。
    if (item.domain !== undefined && badBareHost(item.domain)) {
      return `cookies set "${item.name}" domain must be a bare host such as "example.test" (no scheme, no path, no port)`
    }
    // `path` 按协议就是绝对路径：以 `/` 开头才算形合法——`""` 既不是合法 path，也不是「没给」。
    if (item.path !== undefined && (typeof item.path !== "string" || !item.path.startsWith("/"))) {
      return 'cookies set "path" must be a string starting with "/"'
    }
    // `expires` 声明类型 = number（Unix 秒），**不收字符串、不做 `Number()` 强转**：`Number("")` 是 `0`，
    // 一个空串会被写成一条**立即过期**的 cookie（等于删），而错要等到回读面才露头。校验的责任是在写之前
    // 拦住，不是让回读去发现。
    if (item.expires !== undefined && !Number.isFinite(item.expires)) {
      return 'cookies set "expires" must be Unix seconds (omit it for a session cookie)'
    }
    // `httpOnly` ∥ `secure` 收非布尔的后果最重：`"true"` 会被静默收成 `false`，得到一条**不是 httpOnly** 的
    // cookie 加一张成功回执——而 AC-BT1 的整个主题就是 httpOnly。
    if (item.httpOnly !== undefined && typeof item.httpOnly !== "boolean") {
      return 'cookies set "httpOnly" must be a boolean (omit it for false)'
    }
    if (item.secure !== undefined && typeof item.secure !== "boolean") {
      return 'cookies set "secure" must be a boolean (omit it for false)'
    }
    // `sameSite` 去掉了 `""` 与 `null` 的豁免：同一个「给了但形不对」，`domain` 拒、它不拒就是两级两判。
    // 非字符串那一支由 `normalizeSameSite` 自己挡（它只收 string，且不做任何 stringify）——判形单源。
    if (item.sameSite !== undefined && normalizeSameSite(item.sameSite) === null) {
      return 'cookies set "sameSite" must be Strict, Lax or None'
    }
  }
  return null
}

/** 一条 cookie 的行形（§2.2）：`name=value; domain=<d>; path=<p>[; expires=<ISO>][; httpOnly][; secure][; sameSite=<S>]`。 */
function cookieLine(cookie) {
  const parts = [`${cookie.name}=${cookie.value}`, `domain=${cookie.domain}`, `path=${cookie.path || "/"}`]
  const expires = Number(cookie.expires)
  if (Number.isFinite(expires) && expires > 0) parts.push(`expires=${new Date(expires * 1000).toISOString()}`)
  if (cookie.httpOnly) parts.push("httpOnly")
  if (cookie.secure) parts.push("secure")
  if (cookie.sameSite) parts.push(`sameSite=${cookie.sameSite}`)
  return parts.join("; ")
}

/** 正文截断（§2.2 两行自有标记形）：`[truncated: showing <k> of <N> — <提示>]`。 */
function capBody(header, lines, note) {
  let body = ""
  let shown = 0
  for (const line of lines) {
    const next = body === "" ? line : `${body}\n${line}`
    if (next.length > SESSION_STATE_MAX_CHARS) break
    body = next
    shown += 1
  }
  const text = body === "" ? header : `${header}\n${body}`
  if (shown < lines.length) return `${text}\n[truncated: showing ${shown} of ${lines.length} — ${note}]`
  return text
}

// ── cookies（浏览器级面——三形全走页面会话的 Network 域，§2.2 ∥ KD-27 / KD-29）────────────────

async function allCookies(h) {
  const res = await h.call("Network.getAllCookies")
  // 回执畸形 ⇒ 明示错：把「没读到」报成「本来就没有」会让 `get` 回 `0 cookie(s)`、无 `domain` 的 `clear` 回
  // `0 removed`——一个读失败被伪装成一个关于 cookie store 的事实（空集合不得顶替读不出）。
  if (!Array.isArray(res?.cookies)) throw h.pageError("cookies failed — the browser returned no cookie list (Network.getAllCookies)")
  return res.cookies
}

async function cookiesGet(filter, h) {
  const all = await allCookies(h)
  const picked = filter ? all.filter((cookie) => domainMatches(cookie.domain, filter)) : all
  const header = `[cookies get] ${picked.length} cookie(s)${filter ? ` [domain "${filter}"]` : ""}`
  return capBody(header, picked.map(cookieLine), "pass domain to narrow")
}

/** 未落地句（§2.2 · KD-30 两形）：找不到同名同域条目 ⇒ 点名实际落点；条目在但值/path 不符 ⇒ 点名存储里的值。 */
function describeUnlanded(u) {
  if (u.held !== undefined) {
    const tail = u.heldPath ? ` at path "${u.heldPath}"` : ""
    return `cookies set "${u.name}" @ ${u.domain} did not land — the browser holds "${u.held}"${tail}`
  }
  if (u.actual) return `cookies set "${u.name}" @ ${u.domain} did not land — the browser stored ${u.name}@${u.actual}`
  return `cookies set "${u.name}" @ ${u.domain} did not land`
}

/** `set`：逐条写 → 按 `name`+`domain` 回读核对（逐字比 `value`，给了 `path` 再核 `path`——KD-30）→
 *  只列核对通过的条目；有一条未落地 ⇒ 先报错、再点名（未落地的项 + 已落地的条数）。
 *  **不做回滚**——cookie store 无事务，删掉已落地的条目反而伪造一个干净态。 */
async function cookiesSet(args, h) {
  const invalid = cookieSetError(args.cookies)
  if (invalid) throw new Error(invalid)
  const info = await h.pageInfo()
  // 未给 `domain` 的条目要落到当前页源 ⇒ 页面没有 http(s) origin（`about:blank` ∥ `data:`）时无源可落：
  // 明示拒（与 `storage` 首条件同族——同类面不能一边有明示句、一边漏原始错），且在**写之前**拒。
  // 给了 `domain` 的条目不受此限：跨域直写是 F-BT20 的本体，页面在哪无关。
  // 形检已过 ⇒ 只有「键不存在」算没给（`null` ∥ 空串在 `cookieSetError` 里已拒——逐项与顶层同一判法）。
  const needsOrigin = args.cookies.some((item) => item.domain === undefined)
  if (needsOrigin && !httpOriginOrNull(info.url)) {
    throw h.pageError(`cookies set requires domain or an http(s) page origin — current page is "${info.url}"`)
  }
  const wanted = args.cookies.map((item) => {
    const domain = item.domain === undefined ? hostOf(info.url) : item.domain
    return { item, domain, key: bare(domain) }
  })
  for (const { item } of wanted) {
    const params = { name: item.name, value: item.value }
    // 跨域直写（F-BT20）：给什么 `domain` 写什么域——原样交给浏览器，不设开关、不设审批门
    if (item.domain !== undefined) params.domain = item.domain
    else params.url = info.url // 未给 domain ⇒ 落到当前页源
    // 形检已过（§2.2 形判规则）⇒ 逐字段**原样**交给浏览器：不再有「收成 false」∥ `Number()` 强转这类静默转换，
    // 校验与传值两处同看一个值，才不会出现「校验看的是 A、传给浏览器的却是 B」。
    if (item.path !== undefined) params.path = item.path
    if (item.httpOnly !== undefined) params.httpOnly = item.httpOnly
    if (item.secure !== undefined) params.secure = item.secure
    const sameSite = normalizeSameSite(item.sameSite)
    if (sameSite) params.sameSite = sameSite
    if (item.expires !== undefined) params.expires = item.expires
    await h.call("Network.setCookie", params)
  }
  const landed = await allCookies(h)
  const verified = []
  const unlanded = []
  for (const { item, domain, key } of wanted) {
    // 回读核对（KD-30）：按 `name`+`domain` 定位后**逐字比 `value`**（请求给了 `path` 的再核 `path`）。
    // 只核 `name`+`domain` 不够：同名同域覆盖写时旧条目就在那儿，回读会假通过。
    const candidates = landed.filter((cookie) => cookie.name === item.name && bare(cookie.domain) === key)
    const pathGiven = item.path !== undefined
    const hit = candidates.find((cookie) => cookie.value === item.value && (!pathGiven || (cookie.path || "/") === item.path))
    if (hit) { verified.push(hit); continue }
    if (candidates.length > 0) {
      // 条目在、值（或 path）不是写入值 ⇒ 点名存储里的实际内容（头 80 字符，与错误句族同额度）
      const shown = candidates.find((cookie) => pathGiven && (cookie.path || "/") === item.path) ?? candidates[0]
      const shownPath = shown.path || "/"
      unlanded.push({
        name: item.name,
        domain,
        held: String(shown.value ?? "").slice(0, 80),
        heldPath: pathGiven && shownPath !== item.path ? shownPath : null,
      })
      continue
    }
    const elsewhere = landed.find((cookie) => cookie.name === item.name) // 落点与请求不符（KD-30 的实测形态）
    unlanded.push({ name: item.name, domain, actual: elsewhere?.domain ?? null })
  }
  if (unlanded.length > 0) {
    const first = unlanded[0]
    const lines = [describeUnlanded(first)]
    if (unlanded.length > 1) lines.push(`unlanded: ${unlanded.map((u) => `${u.name}@${u.domain}`).join(", ")}`)
    lines.push(`${verified.length} of ${wanted.length} cookie(s) landed — no rollback (the cookie store has no transactions)`)
    throw h.pageError(lines.join("\n"))
  }
  const listed = verified.map((cookie) => `${cookie.name}@${cookie.domain}(${cookie.path || "/"})`)
  return `[cookies set] ${listed.length} cookie(s): ${listed.join(", ")}`
}

/** `clear`：有 `domain` 逐条删（只删该域及其子域）；无 `domain` 清空整份共享 profile（§3.4 的硬后果——
 *  他实例的登录态一并消失，这是 F-BT20「按 domain ∥ 全部」的直接后果，不另设确认门）。 */
async function cookiesClear(filter, h) {
  const all = await allCookies(h)
  if (!filter) {
    await h.call("Network.clearBrowserCookies")
    return `[cookies clear] ${all.length} removed (all domains)`
  }
  const picked = all.filter((cookie) => domainMatches(cookie.domain, filter))
  for (const cookie of picked) {
    await h.call("Network.deleteCookies", { name: cookie.name, domain: cookie.domain, path: cookie.path })
  }
  return `[cookies clear] ${picked.length} removed (domain "${filter}")`
}

/** cookies（§2.2）：op ∈ get / set / clear。不受 `browser.allowDomains` 收束（KD-28：它是浏览器级面，
 *  用当前页或目标域去检都等于给跨域写新增一道门——F-BT20 明令不设）。 */
async function actCookies(args, ctx, h) {
  const op = String(args.op ?? "")
  if (!COOKIE_OPS.includes(op)) throw new Error(unknownCookieOp(op))
  // 形检在前（`domain` 未给 ⇒ null；给了但形不对 ⇒ 明示拒，不升到全域清空——U86）——在开会话、发命令之前。
  // `set` 的逐项形检同样提到会话之前（与 `domain` 同拍）：非法 payload 不该先把浏览器拉起来再拒；
  // `cookiesSet` 里那道保留作第二道（沿 `validateArgs` ∥ `domainFilter` 的既有双道纪律）。
  const filter = domainFilter(args.domain)
  if (op === "set") {
    const invalid = cookieSetError(args.cookies)
    if (invalid) throw new Error(invalid)
  }
  await h.ensureSession(args)
  if (op === "get") return cookiesGet(filter, h)
  if (op === "set") return cookiesSet(args, h)
  return cookiesClear(filter, h)
}

// ── storage（页级面——页内 window.localStorage ∥ sessionStorage，§2.2 ∥ KD-27）────────────────

/** 页侧 store 引用（两域各是一个独立作用域对象——不串档由浏览器保证，本档按 `area` 二选一取）。 */
const storeRef = (area) => `window[${JSON.stringify(area)}]`

/** 页侧读表达式：单键 ⇒ `{ok, found, value}`；全量 ⇒ `{ok, entries: [[k, v], …]}`。 */
function storageGetExpression(area, key, single) {
  const body = single
    ? `var v = store.getItem(${JSON.stringify(key)})
    return { ok: true, found: v !== null, value: v }`
    : `var entries = []
    for (var i = 0; i < store.length; i++) { var k = store.key(i); entries.push([k, store.getItem(k)]) }
    return { ok: true, entries: entries }`
  return `${mark("storage-get")}(function () {
  var store = ${storeRef(area)}
  if (!store) return { ok: false }
  ${body.replace(/\n/g, "\n  ")}
})()`
}

/** 页侧写表达式：`setItem` 收字符串；值以 JSON 字面量嵌入 ⇒ 换行 ∥ 引号 ∥ 中文 ∥ 长串都无损（AC-BT5）。 */
function storageSetExpression(area, key, value) {
  return `${mark("storage-set")}(function () {
  var store = ${storeRef(area)}
  if (!store) return { ok: false }
  store.setItem(${JSON.stringify(key)}, ${JSON.stringify(value)})
  return { ok: true }
})()`
}

/** 页侧清表达式：单键 ⇒ `removeItem`（removed = 0/1）；全清 ⇒ `clear()`（removed = 原键数）。 */
function storageClearExpression(area, key, single) {
  const body = single
    ? `var had = store.getItem(${JSON.stringify(key)}) !== null
    store.removeItem(${JSON.stringify(key)})
    return { ok: true, removed: had ? 1 : 0 }`
    : `var n = store.length
    store.clear()
    return { ok: true, removed: n }`
  return `${mark("storage-clear")}(function () {
  var store = ${storeRef(area)}
  if (!store) return { ok: false }
  ${body.replace(/\n/g, "\n  ")}
})()`
}

/** 页 origin 的读法（`cookies set` 的源前提 ∥ `storage` 的可用前提共用一处）：无真实 origin
 *  （`about:blank` ∥ `data:` ∥ 不可解析）⇒ null。 */
function httpOriginOrNull(url) {
  let origin = null
  try { origin = new URL(String(url)).origin } catch { origin = null }
  return origin && origin !== "null" ? origin : null
}

/** 当前页 origin（回执头与 storage 的可用前提）；无真实页 origin（`about:blank` ∥ `data:`）⇒ 明示拒
 *  （`window.localStorage` 在这两类页上不可用）。句形刻意复刻 `clipboard.mjs` 的 `pageOrigin`（设计 §13
 *  「同款句形」）而不导出复用——动作模块间不互相 import（DAG 单向，§5）。 */
function httpOrigin(h, info) {
  const origin = httpOriginOrNull(info.url)
  if (!origin) {
    throw h.pageError(`storage requires an http/https page origin — current page is "${info.url}"`)
  }
  return origin
}

/** storage（§2.2）：op ∈ get / set / clear × area ∈ localStorage ∥ sessionStorage（缺省 localStorage）。
 *  受 `browser.allowDomains` 收束（KD-28：页内动作，与 click / type / evaluate 同面）。 */
async function actStorage(args, ctx, h) {
  const op = String(args.op ?? "")
  if (!STORAGE_OPS.includes(op)) throw new Error(unknownStorageOp(op))
  // 「键不存在」才取缺省（§2.2）：给了 `null` ∥ 非字符串 ∥ 空串 ⇒ 值域句（`null` 渲染成 `"null"`）。
  // `?? "localStorage"` 会把一个形不对的输入静默兑现成缺省域——与 `domain` ∥ `key` 同一类：行为不能照走。
  const given = args.area !== undefined
  const area = given ? String(args.area) : "localStorage"
  // 判形不靠 stringify（§2.2「非字符串 ⇒ 拒」）：`String()` 只用来渲染错误句——`["localStorage"]` 也
  // stringify 成合法域名，那样这一条就落空了；兄弟参数 `domain` ∥ `key` 的形检同样只认 `typeof`。
  if (given && typeof args.area !== "string") throw new Error(unknownStorageArea(area))
  if (!STORAGE_AREAS.includes(area)) throw new Error(unknownStorageArea(area))
  const single = typeof args.key === "string"
  if (op === "set" && (!single || typeof args.value !== "string")) throw new Error("storage set requires key and value")
  // 给了 `key` 但不是字符串 ⇒ 明示拒：当作没给会让 `clear` 落到 `store.clear()`（清整份 store——U86）。
  if (args.key !== undefined) {
    const invalidKey = storageKeyError(args.key)
    if (invalidKey) throw new Error(invalidKey)
  }
  await h.ensureSession(args)
  const info = await h.pageInfo()
  h.assertHostAllowed(info.url, ctx)
  const origin = httpOrigin(h, info)
  const head = `[storage ${op} ${area} @ ${origin}]`
  if (op === "get") {
    const res = await h.evalRaw(storageGetExpression(area, args.key, single))
    if (!res?.ok) throw h.pageError(`storage ${op} failed — ${area} is unavailable on the current page`)
    if (single) {
      const label = JSON.stringify(args.key)
      if (!res.found) return `${head} ${label} — not set`
      return `${head} ${label} = ${JSON.stringify(String(res.value ?? ""))}`
    }
    // 全量面回执畸形 ⇒ 明示错（§2.2 storage 侧同句形）：页侧没给出键表就把「没读到」报成 `0 key(s)`，等于把一个
    // 读失败伪装成一个关于 storage 的事实——与 cookies 取面同一条理由（空集合不得顶替读不出）。
    if (!Array.isArray(res.entries)) throw h.pageError(`storage failed — the page returned no key list (${area})`)
    const entries = Array.from(res.entries, (pair) => [String(pair?.[0] ?? ""), String(pair?.[1] ?? "")])
    const lines = entries.map(([k, v]) => `${k} = ${JSON.stringify(v)}`)
    return capBody(`${head} ${entries.length} key(s)`, lines, "pass key to narrow")
  }
  if (op === "set") {
    const res = await h.evalRaw(storageSetExpression(area, args.key, args.value))
    if (!res?.ok) throw h.pageError(`storage set failed — ${area} is unavailable on the current page`)
    return `${head} ${JSON.stringify(args.key)} ← ${args.value.length} chars`
  }
  const res = await h.evalRaw(storageClearExpression(area, args.key, single))
  if (!res?.ok) throw h.pageError(`storage clear failed — ${area} is unavailable on the current page`)
  if (single) return `${head} ${JSON.stringify(args.key)} removed`
  return `${head} ${Number(res.removed) || 0} key(s) removed`
}

/** 会话态分发表（会话档并入总表——§13「对齐（形）」）。 */
export const SESSION_STATE_ACTIONS = { cookies: actCookies, storage: actStorage }