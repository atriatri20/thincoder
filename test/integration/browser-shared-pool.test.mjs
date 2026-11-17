/**
 * browser-shared-pool.test.mjs — 集成场景 34-1–34-3（设计：`docs/core/design/BROWSER-TOOL.md` §12 ∥ §12.1
 * 「多实例共用一个浏览器」）：
 * 34-1 同时两实例只拉起一台浏览器 ∥ 34-2 后到实例要另一个模式 ⇒ 沿用并告知 ∥ 34-3 先关者只说留下、最后关者才关。
 *
 * 业务入口 = 真工具面 `browser`（`thincoder-core/tools/browser.mjs`）；断言只落在模型面回执文本与
 * 进程表读数（「能不能同时用」「关掉之后浏览器还在不在」）。
 *
 * 隔离（设计 §12.1 硬要求）：`HOME` ∥ `USERPROFILE` 指向临时家目录 ⇒ `browserPaths()` 落在其中，
 * 开发机上真跑着的共享浏览器不会被这些用例接入。子实例 = 真 `node` 子进程（每个进程就是一个实例），
 * 命令经 stdin 逐条下发、回执经 stdout 逐行回传——两实例要**同时活着**才谈得上用者计数。
 *
 * 进程计数口径 = 「共享浏览器几台」= 命令行含 `--user-data-dir=<profile>` 且**不含 `--type=`** 的进程数
 * （helper 进程会带着父进程的开关，按裸开关计数会把一台浏览器数成十几台——实测登记在批档 §5）。
 * 宿主无 Chromium ⇒ skip 并打印（skip 不算绿，沿设计 §7 S7 先例）。
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { createServer } from "node:http"
import { mkdtempSync, readFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { removeTempDirBestEffort } from "../teardown.mjs"

const HOME = mkdtempSync(join(tmpdir(), "tc-int-browser-pool-"))
const PROFILE = join(HOME, ".thincoder", "browser", "profile")
const CORE = join(import.meta.dirname, "..", "..", "thincoder-core")

const SAVED = { HOME: process.env.HOME, USERPROFILE: process.env.USERPROFILE }
process.env.HOME = HOME
process.env.USERPROFILE = HOME

const { browserPaths, listProfileProcs, reclaimProfileOrphans, resolveBrowser } = await import("../../thincoder-core/browser/launch.mjs")

after(() => {
  reclaimProfileOrphans(PROFILE) // 收走用例留下的浏览器（按 --user-data-dir 匹配）
  for (const [key, value] of Object.entries(SAVED)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  removeTempDirBestEffort(HOME)
})

/** 子实例：一个真 node 进程 = 一个实例；命令经 stdin 下发，回执逐行回传。 */
const CHILD = `
const { createInterface } = await import("node:readline")
const { browserTool } = await import(process.env.BROWSER_MODULE)
const ctx = { agent: { config: {} } }
const rl = createInterface({ input: process.stdin })
for await (const line of rl) {
  let out
  try {
    out = { receipt: await browserTool.execute(JSON.parse(line), ctx) }
  } catch (e) {
    out = { error: String(e?.message ?? e) }
  }
  process.stdout.write(JSON.stringify(out) + "\\n")
}
`

class Instance {
  constructor() {
    this.child = spawn(process.execPath, ["--input-type=module", "-e", CHILD], {
      env: { ...process.env, HOME, USERPROFILE: HOME, BROWSER_MODULE: pathToFileURL(join(CORE, "tools", "browser.mjs")).href },
      stdio: ["pipe", "pipe", "pipe"],
    })
    this.buffer = ""
    this.pending = []
    this.stderr = ""
    this.child.stderr.on("data", (chunk) => { this.stderr += String(chunk) })
    this.child.stdout.on("data", (chunk) => {
      this.buffer += String(chunk)
      let index
      while ((index = this.buffer.indexOf("\n")) >= 0) {
        const line = this.buffer.slice(0, index)
        this.buffer = this.buffer.slice(index + 1)
        const resolve = this.pending.shift()
        if (resolve) resolve(JSON.parse(line))
      }
    })
  }

  run(command) {
    const next = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error(`child instance did not answer within 120s (stderr: ${this.stderr.slice(-500)})`)), 120_000)
      this.pending.push((value) => { clearTimeout(timer); resolve(value) })
    })
    this.child.stdin.write(`${JSON.stringify(command)}\n`)
    return next
  }

  kill() {
    try { this.child.kill() } catch { /* 已退出 */ }
  }
}

/** 「共享浏览器几台」——含本 profile 的开关键、不是 helper（`--type=`）。 */
function browserCount() {
  const marker = `--user-data-dir=${PROFILE}`
  return listProfileProcs().filter((row) => {
    const cmdline = String(row?.cmdline ?? "").replace(/"/g, "")
    return cmdline.includes(marker) && !/--type=/.test(cmdline)
  }).length
}

const waitFor = async (predicate, ms) => {
  const deadline = Date.now() + ms
  while (Date.now() < deadline) {
    if (await predicate()) return true
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return false
}

function skipIfNoBrowser(t) {
  try { resolveBrowser() } catch {
    console.log("no Chromium-based browser — shared-pool cases skipped")
    t.skip("no Chromium-based browser")
    return true
  }
  return false
}

async function fixtureServer(t) {
  const server = createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" })
    res.end("<!doctype html><html><head><title>shared-pool fixture</title></head><body><h1>MANGO-POOL</h1><a href=\"/next\">next</a></body></html>")
  })
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve))
  t.after(async () => {
    server.closeAllConnections?.()
    await new Promise((resolve) => server.close(resolve))
  })
  return `http://127.0.0.1:${server.address().port}/`
}

const openInstances = (t, count) => {
  const nets = Array.from({ length: count }, () => {
    const instance = new Instance()
    t.after(() => instance.kill())
    return instance
  })
  return nets
}

test('CLI 34-1 同时两实例：只拉起一台浏览器，两边都拿到会话', { timeout: 240_000 }, async (t) => {
  if (skipIfNoBrowser(t)) return
  const url = await fixtureServer(t)
  const [a, b] = openInstances(t, 2)

  const [first, second] = await Promise.all([a.run({ action: "navigate", url }), b.run({ action: "navigate", url })])

  for (const [name, out] of [["A", first], ["B", second]]) {
    assert.ok(out.receipt, `${name} 实例应拿到回执，实际：${JSON.stringify(out)}`)
    assert.match(out.receipt, /^\[navigate\]/, `${name} 实例回执应以 [navigate] 起头，实际：${out.receipt}`)
    assert.match(out.receipt, /\[page\] .* — "shared-pool fixture"/, `${name} 实例应拿到页摘，实际：${out.receipt}`)
  }
  assert.equal(browserCount(), 1, "两实例同时可用的前提 = 全机一台共享浏览器（拉起两台就是「第二个用不了」）")

  await Promise.all([a.run({ action: "close" }), b.run({ action: "close" })])
})

test('CLI 34-2 后到实例要另一个模式：不报错、沿用生效值并在回执里告知', { timeout: 240_000 }, async (t) => {
  if (skipIfNoBrowser(t)) return
  const url = await fixtureServer(t)
  const [a, b] = openInstances(t, 2)

  const first = await a.run({ action: "navigate", url }) // 首开：缺省无头（不弹窗）
  assert.match(first.receipt ?? "", /^\[navigate\]/, `首实例应拿到会话，实际：${JSON.stringify(first)}`)

  const second = await b.run({ action: "navigate", url, headless: false }) // 后到者要的是另一个模式
  assert.ok(second.receipt, `后到实例应拿到回执（不报错），实际：${JSON.stringify(second)}`)
  assert.match(second.receipt, /^\[navigate\]/, `后到实例拿到的是会话，不是错误，实际：${second.receipt}`)
  assert.match(
    second.receipt,
    /\[note: the shared browser is running headless=true \(started by pid \d+\) — the mode is set by the first instance; it switches only after every instance has released it\]/,
    `后到实例必须被告知沿用的是哪个模式（不得静默），实际：${second.receipt}`,
  )
  assert.doesNotMatch(second.receipt, /session is already running/, "旧拒文退场（AC-M5 的同源面）")

  await Promise.all([a.run({ action: "close" }), b.run({ action: "close" })])
})

test('CLI 34-3 末关两形：先关者只说留下（浏览器还在），最后关者才关', { timeout: 240_000 }, async (t) => {
  if (skipIfNoBrowser(t)) return
  const url = await fixtureServer(t)
  const [a, b] = openInstances(t, 2)

  await Promise.all([a.run({ action: "navigate", url }), b.run({ action: "navigate", url })])
  assert.equal(browserCount(), 1)

  const first = await a.run({ action: "close" })
  assert.match(
    first.receipt ?? "",
    /^\[close\] released the shared browser \(1 other instance\(s\) still using it — the browser is left running\)/,
    `先关者回执要明说还有一家在用，实际：${first.receipt}`,
  )
  await new Promise((resolve) => setTimeout(resolve, 500))
  assert.equal(browserCount(), 1, "还有人用着 ⇒ 浏览器不得被关掉（关别人的浏览器是硬边界）")

  const last = await b.run({ action: "close" })
  assert.match(last.receipt ?? "", /^\[close\] shared browser closed \(last user\)/, `最后关者回执 = 真关，实际：${last.receipt}`)
  assert.ok(await waitFor(() => browserCount() === 0, 15_000), "末关之后浏览器进程应当消失")
  const lockGone = await waitFor(() => { try { readFileSync(browserPaths().lock); return false } catch { return true } }, 5_000)
  assert.ok(lockGone, "末关删锁：session.lock 不得残留（留着会挡住下一个实例）")

  // AC-M6 后半：紧接一个新实例，它的首动作直接拿到会话（不撞等待窗——锁残留的后果就是白等一个启动窗）
  const [c] = openInstances(t, 1)
  const startedAt = Date.now()
  const next = await c.run({ action: "navigate", url })
  const elapsed = Date.now() - startedAt
  assert.match(next.receipt ?? "", /^\[navigate\]/, `末关之后的新实例应直接拿到会话，实际：${JSON.stringify(next)}`)
  assert.doesNotMatch(next.receipt ?? "", /browser failed to start|hold live registrations/, `不得报起不来或其他家挡路，实际：${next.receipt}`)
  assert.ok(elapsed < 25_000, `不得白等一个启动窗（实测 ${elapsed}ms）`)
  await c.run({ action: "close" })
})