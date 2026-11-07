/**
 * browser-session-state.test.mjs — 集成场景 35-1 ∥ 35-2 ∥ 35-3（设计：`docs/core/design/BROWSER-TOOL.md` §14
 * 「会话态读写：cookie 含 httpOnly ∥ storage 两域自分 ∥ 六形免审」）：
 * 35-1 = AC-BT1（`cookies get` 读得到 httpOnly，而 `evaluate` 的 `document.cookie` 读不到）+ AC-BT2
 *        （当前页在 localhost，`set` 一条 `domain:"127.0.0.1"` 的条目 ⇒ 带该域 `get` 读得到，不要任何开关）
 *        + AC-BT3（带域 `clear` 后该域 `get` 回空、域外那条仍在）+ AC-BT6（回执零遮挡、值逐字相等）；
 * 35-2 = AC-BT4（两域不串档）+ AC-BT5（换行 ∥ 引号 ∥ 中文 ∥ ≥2KB 的值逐字往返）；
 * 35-3 = AC-BT7（六形免审：门面读数 `readonlyActionOf` 逐形为真 + 六形真跑）。
 *
 * 业务入口 = 真工具面 `browser`（`thincoder-core/tools/browser.mjs`）；断言只落在模型面回执文本上
 * （「回执里有没有那个令牌、值对不对」）。AC-BT1 要真浏览器的行为读——httpOnly 不进 `document.cookie`
 * 是浏览器实现，假传输证不了，所以这一格必须在门内。AC-BT7 的免审判的是「门面按动作分类」这一交互，
 * 读面 = `readonlyActionOf(tool, toolName, args)`；`browserTool.execute` 直调面绕得过门禁，所以「零审批」
 * 只能在门面上读、在动作执行面上读不出来。
 *
 * 池隔离（设计 §14 硬要求）：`HOME` ∥ `USERPROFILE` 指向临时家目录 ⇒ `browserPaths()` 落在其中，
 * 开发机上真跑着的共享浏览器不会被这些用例接入。宿主无 Chromium ⇒ skip 并打印（skip 不算绿）。
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { removeTempDirBestEffort } from "../teardown.mjs"

const HOME = mkdtempSync(join(tmpdir(), "tc-int-browser-session-state-"))
const PROFILE = join(HOME, ".thincoder", "browser", "profile")
const SAVED = { HOME: process.env.HOME, USERPROFILE: process.env.USERPROFILE }
process.env.HOME = HOME
process.env.USERPROFILE = HOME

const { browserTool } = await import("../../thincoder-core/tools/browser.mjs")
const { reclaimProfileOrphans, resolveBrowser } = await import("../../thincoder-core/browser/launch.mjs")
const { readonlyActionOf } = await import("../../thincoder-core/agent/dispatch-gates.mjs")

after(() => {
  reclaimProfileOrphans(PROFILE) // 收走用例留下的浏览器（按 --user-data-dir 匹配）
  for (const [key, value] of Object.entries(SAVED)) {
    if (value === undefined) delete process.env[key]
    else process.env[key] = value
  }
  removeTempDirBestEffort(HOME)
})

const run = (args) => browserTool.execute(args, { agent: { config: {} } })

/** 单键 storage 回执的取值：`[storage get <area> @ <origin>] "<key>" = "<JSON 值>"` ⇒ 解回原值。 */
function storageValue(receipt) {
  const text = String(receipt)
  const rest = text.slice(text.indexOf("] ") + 2)
  return JSON.parse(rest.slice(rest.indexOf(" = ") + 3))
}

const cookieLine = (receipt, name) => String(receipt).split("\n").find((line) => line.startsWith(`${name}=`)) ?? ""

function skipIfNoBrowser(t) {
  try { resolveBrowser() } catch {
    console.log("no Chromium-based browser — session-state cases skipped")
    t.skip("no Chromium-based browser")
    return true
  }
  return false
}

/** 夹具服务：首页回一条 `Set-Cookie: …; HttpOnly`（AC-BT1 的入口）。双栈监听——localhost 与 127.0.0.1 都到得了。 */
async function fixtureServer(t) {
  const server = createServer((req, res) => {
    res.writeHead(200, { "content-type": "text/html; charset=utf-8", "set-cookie": "int_sid=INT-secret; HttpOnly; Path=/" })
    res.end("<!doctype html><html><head><title>session-state fixture</title></head><body><h1>SESSION-STATE</h1></body></html>")
  })
  await new Promise((resolve) => server.listen(0, resolve))
  t.after(async () => {
    server.closeAllConnections?.()
    await new Promise((resolve) => server.close(resolve))
  })
  return `http://localhost:${server.address().port}/`
}

test('CLI 35-1 cookies 读得到 httpOnly 令牌（文档 cookie 读不到）；跨域直写给什么域写什么域', { timeout: 240_000 }, async (t) => {
  if (skipIfNoBrowser(t)) return
  const url = await fixtureServer(t)
  t.after(async () => { await run({ action: "close" }) })

  const nav = await run({ action: "navigate", url })
  assert.match(String(nav), /^\[navigate\]/, `导航应拿到回执，实际：${nav}`)

  // ① AC-BT1：同一登录态下，两个动作各读一次，比对名字集
  const all = await run({ action: "cookies", op: "get" })
  assert.match(String(all).split("\n")[0], /^\[cookies get\] \d+ cookie\(s\)/, `get 首行文法，实际：${all}`)
  const sid = cookieLine(all, "int_sid")
  assert.ok(sid.includes("int_sid=INT-secret"), `httpOnly 那条要在 cookies get 里（值照出、不打码），实际：${all}`)
  assert.ok(sid.includes("; httpOnly"), `该条要带 ; httpOnly 标记 —— 这一列正是 AC-BT1 的对照面，实际：${sid}`)

  const docCookie = await run({ action: "evaluate", expression: "document.cookie" })
  assert.ok(
    !String(docCookie).includes("int_sid"),
    `document.cookie 读不到 httpOnly 那一条 —— 没有这条对照，就分不清「真 cookie 面」与「给 document.cookie 套了个壳」，实际：${docCookie}`,
  )

  // ② AC-BT2：当前页仍在 localhost，给 127.0.0.1 写一条（无开关、无审批），再带该域读回来
  const set = await run({ action: "cookies", op: "set", cookies: [{ name: "int_cross", value: "cross-v", domain: "127.0.0.1" }] })
  assert.match(
    String(set),
    /^\[cookies set\] 1 cookie\(s\): int_cross@\.?127\.0\.0\.1\(\/\)/,
    `跨域写要落地并点名该域（回读核对通过才列进回执），实际：${set}`,
  )
  const cross = await run({ action: "cookies", op: "get", domain: "127.0.0.1" })
  assert.ok(cookieLine(cross, "int_cross").includes("int_cross=cross-v"), `切到该域读得到那条，实际：${cross}`)
  assert.ok(String(cross).split("\n")[0].includes('[domain "127.0.0.1"]'), `带域过滤的首行要点名该域，实际：${cross}`)

  const hostOnly = await run({ action: "cookies", op: "get", domain: "localhost" })
  assert.ok(!String(hostOnly).includes("int_cross"), `域过滤不该把别的域的条目带出来，实际：${hostOnly}`)

  // ③ AC-BT3：写 → 清 → 读回空；清的是该域不是全清
  const cleared = await run({ action: "cookies", op: "clear", domain: "127.0.0.1" })
  assert.match(String(cleared), /^\[cookies clear\] \d+ removed \(domain "127\.0\.0\.1"\)$/, `clear 回执，实际：${cleared}`)
  const afterClear = await run({ action: "cookies", op: "get", domain: "127.0.0.1" })
  assert.equal(String(afterClear), '[cookies get] 0 cookie(s) [domain "127.0.0.1"]', `清后该域 get 回空，实际：${afterClear}`)
  const kept = await run({ action: "cookies", op: "get", domain: "localhost" })
  assert.ok(cookieLine(kept, "int_sid").includes("int_sid=INT-secret"), `域外那条仍在——清的是该域不是全清，实际：${kept}`)

  // ④ AC-BT6：四段回执零遮挡，且 httpOnly 那条的值与夹具设的逐字相等
  for (const [label, receipt] of Object.entries({ get: all, set, cross, clear: cleared })) {
    assert.doesNotMatch(String(receipt), /\*{4}|•{4}/, `${label} 回执零遮挡（AC-BT6），实际：${receipt}`)
  }
  const sidPair = String(all).split("\n").find((line) => line.startsWith("int_sid="))
  assert.equal(sidPair?.split(";")[0], "int_sid=INT-secret", `回执值与夹具设的逐字相等（值照出），实际：${sidPair}`)
})

test('CLI 35-2 localStorage ∥ sessionStorage 各写各读、值逐字往返（换行 ∥ 引号 ∥ 中文 ∥ ≥2KB）', { timeout: 240_000 }, async (t) => {
  if (skipIfNoBrowser(t)) return
  const url = await fixtureServer(t)
  t.after(async () => { await run({ action: "close" }) })

  const nav = await run({ action: "navigate", url })
  assert.match(String(nav), /^\[navigate\]/, `导航应拿到回执，实际：${nav}`)
  const origin = new URL(url).origin
  const longValue = `第一行\n第二行 "双引号" '单引号' ${"y".repeat(2048)}`
  assert.ok(longValue.length >= 2048, "值必须 ≥2KB（AC-BT5）")

  const setLocal = await run({ action: "storage", op: "set", area: "localStorage", key: "int_key", value: longValue })
  assert.equal(String(setLocal), `[storage set localStorage @ ${origin}] "int_key" ← ${longValue.length} chars`, "set 回执只报字符数")
  const setSession = await run({ action: "storage", op: "set", area: "sessionStorage", key: "int_key", value: "session-v" })
  assert.equal(String(setSession), `[storage set sessionStorage @ ${origin}] "int_key" ← 9 chars`, "同一键在另一域独立写")

  const local = await run({ action: "storage", op: "get", area: "localStorage", key: "int_key" })
  assert.equal(storageValue(local), longValue, `localStorage 的值逐字往返（JSON 转义面无损），实际：${local}`)
  const session = await run({ action: "storage", op: "get", area: "sessionStorage", key: "int_key" })
  assert.equal(storageValue(session), "session-v", `两域各回自己的值、互不串档（AC-BT4），实际：${session}`)

  // AC-BT4 的反向判据：只往一域写键，另一域 `get` 该键回空
  await run({ action: "storage", op: "set", area: "localStorage", key: "int_only_local", value: "L" })
  const bleed = await run({ action: "storage", op: "get", area: "sessionStorage", key: "int_only_local" })
  assert.equal(String(bleed), `[storage get sessionStorage @ ${origin}] "int_only_local" — not set`, `两域不串档，实际：${bleed}`)

  const listing = await run({ action: "storage", op: "get", area: "localStorage" })
  assert.match(String(listing).split("\n")[0], new RegExp(`^\\[storage get localStorage @ ${origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\] 2 key\\(s\\)`),
    `全量回执计数，实际：${listing}`)
})

test('CLI 35-3 六个会话态动作免审：门面逐形为真 + 六形真跑（AC-BT7）', { timeout: 240_000 }, async (t) => {
  if (skipIfNoBrowser(t)) return
  const url = await fixtureServer(t)
  t.after(async () => { await run({ action: "close" }) })

  const nav = await run({ action: "navigate", url })
  assert.match(String(nav), /^\[navigate\]/, `导航应拿到回执，实际：${nav}`)
  const origin = new URL(url).origin

  // ① 门面读数（dispatch 的公共输入）：六形逐条为真 ⇒ 门闭态走免审短路、零审批请求
  for (const args of [
    { action: "cookies", op: "get" },
    { action: "cookies", op: "set", cookies: [{ name: "int_gate", value: "gate-v", domain: "127.0.0.1" }] },
    { action: "cookies", op: "clear", domain: "127.0.0.1" },
    { action: "storage", op: "get" },
    { action: "storage", op: "set", area: "localStorage", key: "int_gate", value: "gate-v" },
    { action: "storage", op: "clear", area: "localStorage", key: "int_gate" },
  ]) {
    assert.equal(readonlyActionOf(browserTool, "browser", args), true,
      `${args.action} ${args.op} 在门面上是免审的（N-BT7——用户 2026-11-06 逐字裁掉的那条）`)
  }

  // ② 六形真跑：每一步的结果都读得回来（不是纸面分类）
  const got0 = await run({ action: "cookies", op: "get" })
  assert.match(String(got0).split("\n")[0], /^\[cookies get\] \d+ cookie\(s\)/, `cookies get 真跑，实际：${got0}`)

  const setCookie = await run({ action: "cookies", op: "set", cookies: [{ name: "int_gate", value: "gate-v", domain: "127.0.0.1" }] })
  assert.match(String(setCookie), /^\[cookies set\] 1 cookie\(s\): int_gate@\.?127\.0\.0\.1\(\/\)$/, `cookies set 落地，实际：${setCookie}`)
  const readCookie = await run({ action: "cookies", op: "get", domain: "127.0.0.1" })
  assert.ok(cookieLine(readCookie, "int_gate").includes("int_gate=gate-v"), `set 回读得到（值照出），实际：${readCookie}`)

  const clearCookie = await run({ action: "cookies", op: "clear", domain: "127.0.0.1" })
  assert.match(String(clearCookie), /^\[cookies clear\] \d+ removed \(domain "127\.0\.0\.1"\)$/, `cookies clear 真跑，实际：${clearCookie}`)
  assert.equal(String(await run({ action: "cookies", op: "get", domain: "127.0.0.1" })),
    '[cookies get] 0 cookie(s) [domain "127.0.0.1"]', "cookies clear 清完回空")

  const setStorage = await run({ action: "storage", op: "set", area: "localStorage", key: "int_gate", value: "gate-v" })
  assert.equal(String(setStorage), `[storage set localStorage @ ${origin}] "int_gate" ← 6 chars`, `storage set 真跑，实际：${setStorage}`)
  assert.equal(storageValue(await run({ action: "storage", op: "get", area: "localStorage", key: "int_gate" })), "gate-v",
    "storage set 回读得到")

  const clearStorage = await run({ action: "storage", op: "clear", area: "localStorage", key: "int_gate" })
  assert.equal(String(clearStorage), `[storage clear localStorage @ ${origin}] "int_gate" removed`, `storage clear 真跑，实际：${clearStorage}`)
  assert.equal(String(await run({ action: "storage", op: "get", area: "localStorage", key: "int_gate" })),
    `[storage get localStorage @ ${origin}] "int_gate" — not set`, "storage clear 清完回 not set")
})