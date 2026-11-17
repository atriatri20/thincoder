/**
 * test/teardown.mjs — 集成用例收尾的共用助手（纪律单源 = `docs/core/design/TESTING.md` §4.6）。
 *
 * 集成用例自己搭的隔离面（临时 HOME ∥ 临时目录 ∥ 端口 ∥ 子进程）收尾按**尽力面**处理：
 * 清理成败不改业务结果（业务结果 = 该用例的断言过没过），因此清理失败**不判红整档**；
 * 但它必须**可见**——失败向 stderr 写一行，点名绝对路径与错误码，不抛。
 *
 * 为什么必须尽力面：并行负载下浏览器 ∥ 子进程仍占着临时目录（Windows 上表现为 `EPERM`），
 * 裸调 `rmSync` 会把当次全绿的用例档判红——判据与被判对象对不上。
 *
 * 路径中性：同一助手既删目录也删单个夹具文件（`recursive` 对单文件同样成立），
 * 故参数名 ∥ JSDoc ∥ 失败行都不说「目录」——拿它删单文件时，失败句若说「目录」就是一句错话。
 */
import { rmSync } from "node:fs"
import { resolve } from "node:path"

/**
 * 删一个临时路径（目录 ∥ 单个夹具文件），失败只报一行、不抛。
 * @param {string} p 目标路径（临时 HOME ∥ 临时目录 ∥ 夹具文件——绝对化后点名）
 * @param {{ rm?: Function, log?: (line: string) => void }} [opts]
 *   `rm` = 删除实现（缺省 `node:fs` 的 `rmSync`）；`log` = 可见面（缺省写 stderr，逐行以 `\n` 收尾）。
 *   两处都是注入缝：缺省即生产行为，无模块级全局态，故无复原步。
 * @returns {boolean} 清掉 ⇒ `true`；仍失败 ⇒ `false`（已写一行可见读数）
 */
export function removeTempDirBestEffort(p, opts = {}) {
  const rm = opts.rm ?? rmSync
  const log = opts.log ?? ((line) => process.stderr.write(line + "\n"))
  const abs = resolve(p)
  try {
    rm(p, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 })
    return true
  } catch (e) {
    log(`[teardown] temp path not removed: ${abs} (${e?.code ?? e?.message ?? "unknown"})`)
    return false
  }
}