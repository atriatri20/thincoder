/**
 * limits.mjs — 匿名入口 IP 限流（gateway/PUBLICNET.md §2 ∥ KD-PN-4）：
 * 固定窗 60 s、粒度 = IP × 端点类（`auth` = 登录面 ∥ `public` = 验签前可达的公开接收面）。
 *
 * 计数引擎 = 既有 `gateway/ratelimit.mjs`（`createRateLimiter` ∥ `RATE_LIMIT_WINDOW_MS` ∥ `windowIndexOf`）——
 * 全服只此一套固定窗计数与一个窗长常量，不另写第二套（阈值两档仍进配置——KD-PN-7）。
 * 本档只补引擎没有的三件事：端点类匹配 ∥ 触限聚合回调（同 IP 同窗同类只回调一次）∥ 桶内存有界。
 *
 * 桶内存有界：匿名 IP 空间无界，引擎的桶 Map 不主动回收 ⇒ 本档按窗重建引擎（窗号变 ⇒ 新引擎、旧桶随旧引擎丢弃）；
 * 固定窗语义下上一窗的计数本就作废，重建与引擎内部的「窗号不符即重置」等价。
 */
import { RATE_LIMIT_WINDOW_MS, createRateLimiter, windowIndexOf } from "./ratelimit.mjs"

/** 端点类清单（规则表的手写单源 = `rateLimitRules`；`public` 的路径以 `project/webhooks.mjs` 注册行为准）。 */
export const RATE_LIMIT_CLASSES = Object.freeze(["auth", "public"])

/** 类 → 方法 + 路径清单（`:名` 段 = 通配一段——路径参数位）。 */
export const RATE_LIMIT_PATHS = Object.freeze({
  auth: Object.freeze([
    Object.freeze({ method: "POST", path: "/api/login" }),
    Object.freeze({ method: "POST", path: "/api/client/login" }),
  ]),
  public: Object.freeze([Object.freeze({ method: "POST", path: "/api/hooks/git-sources/:id" })]),
})

/** 路径形匹配（`/a/:id` 对 `/a/7` 成立；段数须相等；`:名` 段匹配任意非空段）。 */
export function pathMatches(pattern, pathname) {
  const spec = String(pattern).split("/").filter((segment) => segment !== "")
  const actual = String(pathname).split("/").filter((segment) => segment !== "")
  if (spec.length !== actual.length) return false
  return spec.every((segment, i) => (segment.startsWith(":") ? actual[i] !== "" : segment === actual[i]))
}

/** 规则表（阈值来自配置 `rateLimits` 两键；装配面 = `bin/thincoder-server.mjs`）。 */
export function rateLimitRules({ authPerMin, publicPerMin } = {}) {
  const perMinOf = { auth: authPerMin, public: publicPerMin }
  return RATE_LIMIT_CLASSES.map((ruleClass) => ({
    class: ruleClass,
    perMin: perMinOf[ruleClass],
    methods: RATE_LIMIT_PATHS[ruleClass].map((entry) => entry.method),
    paths: RATE_LIMIT_PATHS[ruleClass].map((entry) => entry.path),
  }))
}

/**
 * 建 IP 限流器（进程内存单实例——装配入口建；单元测试可注 `now`）。
 * `check(method, pathname, ip)` ⇒ `{ limited: false }` ∥ `{ limited: true, retryAfterS, ruleClass }`；
 * `noteBurst({ ip, ruleClass, retryAfterS })` = 判点在超限分支调用：同 IP 同窗同类只回调一次 `onBurst`
 * （回调载荷 = `{ ip, ruleClass, count, windowMs, retryAfterS }`——`count` = 该类的每分钟阈值，即触限时窗内计数）。
 */
export function createIpLimiter({ rules = [], now = Date.now, onBurst = () => {} } = {}) {
  let engine = null
  let engineWindow = null
  const bursts = new Set() // `${class}|${ip}|${窗号}`——同窗聚合去重

  /** 当前窗的引擎（窗号变 ⇒ 新引擎；旧窗桶作废——固定窗语义，内存只承载当前窗）。 */
  const engineNow = () => {
    const index = windowIndexOf(now(), RATE_LIMIT_WINDOW_MS)
    if (engine === null || engineWindow !== index) {
      engine = createRateLimiter({ windowMs: RATE_LIMIT_WINDOW_MS, now })
      engineWindow = index
      bursts.clear()
    }
    return { engine, index }
  }

  /** 命中哪条规则（方法 + 路径双判；阈值非正整数 ⇒ 该类不限）。 */
  const ruleFor = (method, pathname) => {
    const upper = String(method ?? "").toUpperCase()
    for (const rule of rules) {
      if (!Number.isInteger(rule.perMin) || rule.perMin < 1) continue
      if (!rule.methods.includes(upper)) continue
      if (rule.paths.some((pattern) => pathMatches(pattern, pathname))) return rule
    }
    return null
  }

  return {
    check(method, pathname, ip) {
      const rule = ruleFor(method, pathname)
      if (rule === null) return { limited: false }
      const verdict = engineNow().engine.check(rule.class, String(ip ?? ""), { rpm: rule.perMin })
      if (!verdict.limited) return { limited: false }
      return { limited: true, retryAfterS: verdict.retryAfterS, ruleClass: rule.class }
    },
    noteBurst({ ip = "", ruleClass = "", retryAfterS = 1 } = {}) {
      const { index } = engineNow()
      const key = `${ruleClass}|${ip}|${index}`
      if (bursts.has(key)) return false
      bursts.add(key)
      const rule = rules.find((item) => item.class === ruleClass)
      onBurst({ ip, ruleClass, count: rule?.perMin ?? null, windowMs: RATE_LIMIT_WINDOW_MS, retryAfterS })
      return true
    },
  }
}
