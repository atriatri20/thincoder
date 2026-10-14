/**
 * rc-resolve.mjs — `/rc/` 解析钩子（**非用例文件** ⇒ 不入 `prepublishOnly` 链 ∥ 不入 `files` 白名单——不打包；
 * 由 `prepublishOnly` 链行以 `--import` 预载 —— `node --test` 的测试文件进程同生效）。
 * 控制台渲染面经 `/rc/**` **第二根**取核件（同源绝对路径 —— `docs/server/design/agent/ADMIN-AGENT.md` §11「复用形」；
 * 生产面 = `src/webui/static.mjs` 根表）。平 node 无该 origin ⇒ 本钩子把 `/rc/<子路径>` 解析到
 * `@thincoder/render-core` 包根（**包名解析单源** = `package.json`，与生产 `static.mjs` 的
 * `DEFAULT_RENDER_CORE_DIR` 同址同法；沿桌面 `thincoder-desktop/test/rc-resolve.mjs` 先例）——
 * 渲染档在测试与生产下走同一份核件。
 * 射程说明：测试文件自身 spawn 的第三方子进程（如 `spawnSync(process.execPath, …)`）**不**承袭本钩子。
 */
import { createRequire, registerHooks } from "node:module"
import { dirname, join } from "node:path"
import { pathToFileURL } from "node:url"

const coreRoot = dirname(createRequire(import.meta.url).resolve("@thincoder/render-core/package.json"))

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("/rc/")) {
      return { url: pathToFileURL(join(coreRoot, specifier.slice(4))).href, shortCircuit: true }
    }
    return nextResolve(specifier, context)
  },
})
