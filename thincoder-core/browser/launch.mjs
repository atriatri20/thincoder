/**
 * browser/launch.mjs — 浏览器发现 ∥ profile 锁 ∥ 启动 ∥ 杀树（BROWSER-TOOL.md §4）。
 *
 * 候选表与启动参数沿 `scripts/console-walkthrough.mjs`（Edge 先于 Chrome）∥ 同档启动参数段
 * （`--headless=new` ∥ `--remote-debugging-port=0` ∥ `stdio:"ignore"` ∥ POSIX `detached`）——
 * 本档不 import 该脚本，只内化其形。
 * profile = `~/.thincoder/browser/profile`（`configDir` 同源——`config-io.mjs`）= **持久且全机唯一一份**
 * （F-BT6）。profile 的**归属与生命周期全在 `pool.mjs`**（共享池、四形判定、首开末关——BROWSER-TOOL.md §12）：
 * 本档只给路径 ∥ 启动 ∥ 回收 ∥ 杀树，不持持有者位的领取与释放（旧 `acquireProfileLock` ∥
 * `releaseProfileLock` 两导出已退场——互斥拒文与共享池方向相反）。
 *
 * 注入缝（N-BT6）：`resolveBrowser({platform, env, pathExists, which})` ∥ `reclaimProfileOrphans(profile, io)`
 * ∥ `launchBrowser({exe, profile, timeoutMs, sleep})`——缺省回落真实现，单元测试零真实文件系统。
 */
import { execFileSync, spawn } from "node:child_process"
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs"
import { dirname, join } from "node:path"
import { configDir } from "../config-io.mjs"

/** 平台候选表（edge 先于 chrome——walkthrough 实证表）。 */
export const CANDIDATES = {
  edge: {
    win32: ["C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe", "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"],
    darwin: ["/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"],
    linux: ["microsoft-edge", "microsoft-edge-stable"],
  },
  chrome: {
    win32: ["C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe", "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"],
    darwin: ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"],
    linux: ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"],
  },
}

/** 全候选落空（N-BT5）——装配期不剔除工具，首用显式报此句（§2.6）。 */
export const BROWSER_NOT_FOUND = "no Chromium-based browser found (Edge/Chrome) — install one or set BROWSER_PATH"
export const START_TIMEOUT_MS = 25_000 // 缺省启动窗（重负载 Windows 实测 13–17s，留 ≈8s 余量）
const START_TIMEOUT_MIN_MS = 2_000 // 下限：防「瞬间判失败」
const START_TIMEOUT_MAX_MS = 30_000 // 上限：首动作总墙钟 = 启动窗 + 动作预算（§2.9 两段各自有帽——KD-25）

/** env 覆盖 `BROWSER_START_TIMEOUT_MS`（§2.4 取值口径 · KD-25）：`Number.isFinite(v) && v > 0` 才采纳，
 *  随后夹进 `[2_000, 30_000]`（`"1500"` ⇒ 2000、`"40000"` ⇒ 30000）；非数值 ∥ 空串 ∥ `0` ∥ 负值 ⇒ 回落缺省 25s。 */
export function browserStartTimeoutMs(env = process.env) {
  const wanted = Number(env?.BROWSER_START_TIMEOUT_MS)
  if (!Number.isFinite(wanted) || wanted <= 0) return START_TIMEOUT_MS
  return Math.min(START_TIMEOUT_MAX_MS, Math.max(START_TIMEOUT_MIN_MS, wanted))
}

const defaultPathExists = (p) => existsSync(p)
function defaultWhich(name) {
  try { return execFileSync("which", [name], { stdio: ["ignore", "pipe", "ignore"] }).toString().trim() || null }
  catch { return null }
}

/** 浏览器可执行文件解析：`BROWSER_PATH`（exe 路径 ∥ 名字）→ 候选表 edge → chrome；全空 ⇒ 抛钉死句。 */
export function resolveBrowser({ platform = process.platform, env = process.env, pathExists = defaultPathExists, which = defaultWhich } = {}) {
  const lookup = (candidate) => (candidate.includes("/") || candidate.includes("\\")
    ? (pathExists(candidate) ? candidate : null)
    : which(candidate))
  const override = String(env?.BROWSER_PATH ?? "").trim()
  if (override) {
    const byName = CANDIDATES[override.toLowerCase()]
    for (const candidate of byName ? byName[platform] ?? [] : [override]) {
      const found = lookup(candidate)
      if (found) return found
    }
    // 覆盖值不可用 ⇒ 落回候选表（不静默吞：表亦空时抛钉死句——「设置 BROWSER_PATH」指引仍成立）
  }
  for (const family of Object.values(CANDIDATES)) {
    for (const candidate of family[platform] ?? []) {
      const found = lookup(candidate)
      if (found) return found
    }
  }
  throw new Error(BROWSER_NOT_FOUND)
}

/** 本工具的持久化面（共享池目录：profile ∥ 持有者登记 ∥ 用者登记 ∥ 截图）。
 *  布局不变量：`session.lock` 与 `profile` **同父目录**（孤儿回收从 `dirname(profile)` 取锁）；`users/` 同层。 */
export function browserPaths(base = configDir) {
  const root = join(base, "browser")
  return { root, profile: join(root, "profile"), lock: join(root, "session.lock"), users: join(root, "users"), shots: join(root, "shots") }
}

function defaultPidAlive(pid) {
  try { process.kill(pid, 0); return true }
  catch (e) { return e?.code !== "ESRCH" } // 只有「不存在」算死；无权限等同「不确定」⇒ 算活（保守）
}

/** 同 profile 残留进程列表（平台分支——一次 exec 取全表；失败 ⇒ []——尽力面零抛）：win32 = 一次
 *  Get-CimInstance（PowerShell——wmic 已从新系统移除）；POSIX = 一次 ps（自持列表面：既有
 *  `process-probe-exec.mjs` 那条链按已知 pid 查 cmdline，本面是反查——零第三方依赖）。
 *  导出面 = 两个消费者：孤儿回收（下面）与「锁无记录时的模式来源」（`pool.mjs` 读命令行里的 `--headless=new`）。 */
export function listProfileProcs(platform = process.platform) {
  try {
    if (platform === "win32") {
      const out = execFileSync("powershell.exe",
        ["-NoProfile", "-NonInteractive", "-Command",
          "Get-CimInstance Win32_Process | Select-Object ProcessId,CommandLine | ConvertTo-Json -Compress"],
        { encoding: "utf8", timeout: 15_000, stdio: ["ignore", "pipe", "ignore"] })
      const rows = JSON.parse(out.trim() || "[]")
      return (Array.isArray(rows) ? rows : [rows]).filter((r) => r && Number.isInteger(r.ProcessId)).map((r) => ({ pid: Number(r.ProcessId), cmdline: r.CommandLine ?? "" }))
    }
    const out = execFileSync("ps", ["-eo", "pid=,args="], { encoding: "utf8", timeout: 15_000, stdio: ["ignore", "pipe", "ignore"] })
    return out.split(/\r?\n/).map((l) => l.match(/^\s*(\d+)\s+(.*)$/)).filter(Boolean).map((m) => ({ pid: Number(m[1]), cmdline: m[2] }))
  } catch { return [] }
}

/** 同 `--user-data-dir` 残留浏览器进程树回收（#1304——**调用时机由 `pool.mjs` 按「回收的唯一门槛」把守**，
 *  本档只给执行体：端口答不通**不**证明没人连着（挂死 ∥ 忙等时连接未断），所以不收不看用者登记就收，
 *  会在别人还连着时把浏览器收掉——故本函数不再由 `launchBrowser` 内部调用（BROWSER-TOOL.md §12）。
 *  `io` = 注入缝（`platform` ∥ `readText`/`isAlive`/`pid` ∥ `list` ⇒ [{pid, cmdline}] ∥ `kill(pid)`）；
 *  平台分支 + 尽力面零抛（列表 ∥ 单杀失败均不阻断启动）；默认杀器 = `killBrowser`（pid 形）。 */
export function reclaimProfileOrphans(profile, io = {}) {
  try {
    const platform = io.platform ?? process.platform
    const readText = io.readText ?? ((p) => { try { return readFileSync(p, "utf8") } catch { return "" } })
    const isAlive = io.isAlive ?? defaultPidAlive
    const pid = io.pid ?? process.pid
    const held = Number(String(readText(join(dirname(profile), "session.lock")) ?? "").trim())
    // 此守卫只认旧形（裸 pid 一行）；今锁写的是 JSON（`pool.mjs` 的持有者登记），`Number(...)` 对它为 NaN ⇒ 本行恒不成立。
    // 「回收前先读用者登记」的门槛在 `pool.mjs`，本行留作旧锁形态的兼容面（BROWSER-TOOL.md §12 要求函数体零改）。
    if (Number.isInteger(held) && held > 0 && held !== pid && isAlive(held)) return
    const list = io.list ?? (() => listProfileProcs(platform))
    const kill = io.kill ?? ((target) => killBrowser({ pid: target, kill: (signal) => process.kill(target, signal) }, { platform }))
    const marker = `--user-data-dir=${profile}`
    for (const row of list() ?? []) {
      const target = Number(row?.pid)
      if (!Number.isInteger(target) || target <= 0 || target === pid) continue
      if (!String(row?.cmdline ?? "").replace(/"/g, "").includes(marker)) continue
      try { kill(target) } catch { /* 单条失败不阻断其余 */ }
    }
  } catch { /* 回收失败不阻断启动（尽力面零抛） */ }
}

/**
 * 启动浏览器（spawn + `DevToolsActivePort` 轮询 ≤ 启动窗）。
 * 启动窗 = `timeoutMs` 显式入参 ＞ env `BROWSER_START_TIMEOUT_MS` ＞ 缺省 25s（`browserStartTimeoutMs`）。
 * 持久 profile ⇒ 启动前清陈旧端口文件（否则旧值被当本次读数——发现即失效）。
 * 同 profile 的残留进程回收**不在本函数内**：调用方（`pool.mjs`）先过「回收的唯一门槛」再回收，
 * 本函数只负责 spawn 与等 `DevToolsActivePort`。
 * @returns {Promise<{child: import("node:child_process").ChildProcess, port: number, profile: string}>}
 */
export async function launchBrowser({ exe, headless = true, profile, timeoutMs = browserStartTimeoutMs(), sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  const args = [
    ...(headless ? ["--headless=new"] : []),
    "--disable-gpu", "--no-first-run", "--hide-scrollbars",
    `--user-data-dir=${profile}`, "--remote-debugging-port=0",
    "--window-size=1440,900", "about:blank",
  ]
  mkdirSync(profile, { recursive: true })
  const portFile = join(profile, "DevToolsActivePort")
  rmSync(portFile, { force: true })
  const child = spawn(exe, args, { stdio: "ignore", detached: process.platform !== "win32" })
  let spawnError = null
  child.on("error", (e) => { spawnError = e }) // 捕获（否则 unhandled 'error' 事件崩进程）；下面显式上报
  const deadline = Date.now() + timeoutMs
  while (!existsSync(portFile)) {
    if (spawnError) { killBrowser(child); throw new Error(`browser failed to start: ${spawnError.message} (${exe})`) }
    if (child.exitCode !== null || Date.now() >= deadline) {
      killBrowser(child)
      throw new Error(`browser failed to start: DevToolsActivePort not written within ${Math.round(timeoutMs / 1000)}s (${exe})`)
    }
    await sleep(50)
  }
  const port = Number(String(readFileSync(portFile, "utf8")).split("\n")[0])
  if (!Number.isInteger(port) || port <= 0) {
    killBrowser(child)
    throw new Error(`browser failed to start: DevToolsActivePort is malformed (${exe})`)
  }
  return { child, port, profile }
}

/** 杀整棵进程树（win32 `taskkill /T /F`；POSIX 组杀 + 单杀兜底——walkthrough 同式）。 */
export function killBrowser(child, { platform = process.platform, exec = execFileSync } = {}) {
  if (!child || typeof child.pid !== "number") return
  if (platform === "win32") {
    try { exec("taskkill", ["/PID", String(child.pid), "/T", "/F"], { stdio: "ignore" }) } catch { /* 已退出 */ }
    return
  }
  try { process.kill(-child.pid, "SIGKILL") }
  catch { try { child.kill("SIGKILL") } catch { /* 已退出 */ } }
}
