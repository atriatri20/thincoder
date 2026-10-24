/**
 * bench/check/harness.mjs — 评估工具自身测试代码的执行引擎（自写 · 零框架依赖）。
 *
 * 语义：
 * - `check(name, fn)` 只登记，不执行；`run()` 按登记顺序串行 await 每一条。
 * - 单条失败 = 打印异常原文（`err?.stack ?? String(err)`）后继续下一条。
 * - 计数 = 自有 `total` / `passed` / `failed` 三变量；收尾校验 `total === passed + failed`。
 * - 逐条 `ok <i> - <name>`；汇总 `bench/check: <P> passed, <F> failed` 恒为本档 stdout 末行。
 * - `after(fn)` = 清理队列：收尾按登记顺序 await，异常吞掉（打印一行），不改主结果与退出码。
 * - 失败 > 0 ⇒ `process.exitCode = 1`；漏调 `run()` ⇒ `beforeExit` 报错 + exitCode 1。
 * - 执行期间持一个 ref'd 保活句柄：被测代码可能 await 只由 unref'd 定时器（如 `AbortSignal.timeout`）
 *   驱动的 promise；不保活则事件循环提前清空（unsettled top-level await）。收尾清除。
 */

const queue = []
const cleanups = []
let total = 0
let executed = false

export function check(name, fn) {
  total += 1
  queue.push({ index: total, name, fn })
}

export function after(fn) {
  cleanups.push(fn)
}

export async function run() {
  if (executed) return
  executed = true
  const keepAlive = setInterval(() => {}, 1 << 30)
  let passed = 0
  let failed = 0
  try {
    for (const item of queue) {
      try {
        await item.fn()
        passed += 1
        console.log(`ok ${item.index} - ${item.name}`)
      } catch (err) {
        failed += 1
        console.error(`FAIL ${item.index} - ${item.name}`)
        console.error(err?.stack ?? String(err))
      }
    }
    for (const fn of cleanups) {
      try {
        await fn()
      } catch (err) {
        console.error(`after 清理异常（不影响主结果）：${err?.message ?? String(err)}`)
      }
    }
  } finally {
    clearInterval(keepAlive)
  }
  if (total !== passed + failed) {
    console.error("bench/check: 计数自校验失败（total≠passed+failed）")
    process.exitCode = 1
  }
  console.log(`bench/check: ${passed} passed, ${failed} failed`)
  if (failed > 0) process.exitCode = 1
}

process.on("beforeExit", () => {
  if (!executed && queue.length > 0) {
    console.error(`bench/check: 用例未执行（漏调 run()）：登记 ${queue.length} 条，执行 0 条`)
    process.exitCode = 1
  }
})
