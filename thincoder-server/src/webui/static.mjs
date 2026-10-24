/**
 * static.mjs — 前端静态面直发（webui/WEBUI.md §1）：**双根**直发——`public/` 本根 + `/rc/*` → `@thincoder/render-core`
 * 包目录（console-chat-align 批——KD-SV-101；根表 ∥ 前缀序 ∥ 各根逃逸门逐式） ∥ mime 表（`.mjs` ⇒ text/javascript） ∥
 * 防路径穿越 ∥ `Cache-Control: no-cache`（内部工具——改版即见）。
 *
 * 分派优先级归服务层（gateway/server.mjs）：注册路由（`/v1/*` ∥ `/api/*`）先命中；本档只收
 * 「路由未命中且方法为 GET/HEAD」的请求——命中 ⇒ 200 直发并返回 true；未命中 ∥ 路径非法 ⇒ false（调用方按 404 收口）。
 * 第二根同构于桌面 `app://` 双根（`thincoder-desktop/src/main/protocol.mjs` 的 `ROOTS` 根表同形）：缺核包 ⇒ 装载期 fail-loud
 * （包名解析单源 = `package.json`——沿桌面 `CORE_ROOT` 先例；不静默白屏）；运行期 `/rc/*` 无档 ⇒ false（调用方 404——不吞）。
 */
import { createReadStream, statSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, extname, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

/** 静态根缺省 = 本包 `public/`（本档住 `src/webui/` ⇒ `../../public/`）。 */
export const DEFAULT_PUBLIC_DIR = fileURLToPath(new URL("../../public/", import.meta.url))

/** 第二根 · 核包根：按包名解析（仓内开发面 = `npm install` 落 node_modules 链接；镜像 = 双装）；缺包 ⇒ 装载期 fail-loud。 */
export const DEFAULT_RENDER_CORE_DIR = dirname(createRequire(import.meta.url).resolve("@thincoder/render-core/package.json"))

/** 扩展名 → Content-Type（未列 ⇒ `application/octet-stream`）。 */
const MIME = {
  ".html": "text/html; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
}

export function contentTypeFor(file) {
  return MIME[extname(file).toLowerCase()] ?? "application/octet-stream"
}

/** 请求路径 → 静态档相对路径（`/` ⇒ `index.html`）；穿越段（`..` ∥ `.` ∥ 空段） ∥ 反斜杠 ∥ NUL ⇒ null。 */
export function resolveStaticPath(pathname) {
  let decoded
  try {
    decoded = decodeURIComponent(String(pathname))
  } catch {
    return null // 非法百分号编码
  }
  if (decoded.includes("\0") || decoded.includes("\\")) return null
  const clean = decoded === "/" ? "index.html" : decoded.replace(/^\/+/, "")
  const segments = clean.split("/")
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) return null
  return segments.join(sep)
}

/** 供给根表（显式登记 · 前缀序：`/rc/` 先于 `/` 兜底根；各根同走逃逸门——逐根判据同式）。 */
export function staticRoots({ root = DEFAULT_PUBLIC_DIR, renderCoreRoot = DEFAULT_RENDER_CORE_DIR } = {}) {
  return [
    { prefix: "/rc/", dir: resolve(renderCoreRoot) },
    { prefix: "/", dir: resolve(root) },
  ]
}

/** 请求路径 → 供给目标（根表前缀序——先匹配者胜；`/` = 兜底根）：命中 ⇒ `{ dir, relative }`；
 *  未命中 ∥ 路径非法 ⇒ null（调用方 404——**不越根兜底**：`/rc/*` 未命中不回落 `public/`）。
 *  `relative` 经 `resolveStaticPath` 同一穿越裁决（各根同门——沿现单根判据逐式施加）。 */
export function resolveStaticTarget(pathname, roots) {
  let decoded
  try {
    decoded = decodeURIComponent(String(pathname))
  } catch {
    return null
  }
  for (const { prefix, dir } of roots) {
    if (prefix !== "/" && !decoded.startsWith(prefix)) continue
    const tail = prefix === "/" ? decoded : decoded.slice(prefix.length)
    const relative = resolveStaticPath(tail === "" && prefix !== "/" ? "/" : tail) // `/rc/`（目录形）⇒ 根内 `index.html` 径
    return relative === null ? null : { dir, relative }
  }
  return null
}

/** 静态面句柄：`serve(req, res, pathname)` 命中 ⇒ 200 直发（true）；未命中 ⇒ false（不写响应）。 */
export function createStaticSite({ root = DEFAULT_PUBLIC_DIR, renderCoreRoot = DEFAULT_RENDER_CORE_DIR } = {}) {
  const roots = staticRoots({ root, renderCoreRoot })
  return {
    root: roots[roots.length - 1].dir,
    roots,
    serve(req, res, pathname) {
      const target = resolveStaticTarget(pathname, roots)
      if (target === null) return false
      const file = resolve(target.dir, target.relative)
      if (!file.startsWith(target.dir + sep)) return false // 防穿越双保险（逐根同式——resolveStaticPath 之外）
      let stat
      try {
        stat = statSync(file)
      } catch {
        return false // 不存在 ∥ 不可读 ⇒ 404（调用方）
      }
      if (!stat.isFile()) return false
      res.writeHead(200, {
        "Content-Type": contentTypeFor(file),
        "Content-Length": stat.size,
        "Cache-Control": "no-cache",
      })
      if (req.method === "HEAD") {
        res.end() // HEAD：头齐体免（Content-Length 已声明）
        return true
      }
      const stream = createReadStream(file)
      stream.on("error", () => res.destroy())
      stream.pipe(res)
      return true
    },
  }
}
