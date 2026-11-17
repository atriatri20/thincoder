/**
 * browser/pool.mjs — 共享浏览器单池（`docs/core/design/BROWSER-TOOL.md` §12）：进入形态 ∥ 持有者位 ∥
 * 用者登记 ∥ 末关。判定与生命周期都住本档，`session.mjs` 只留接线（§12「尺寸拆分计划」拆法①②）。
 *
 * 一个池、零实例维度：`<configDir>/browser/{profile, session.lock, users/, shots/}`（`browserPaths`）。
 * profile 全机唯一一份 ⇒ 登录态全机一份（F-BT6）；Chromium 的 `--user-data-dir` 是单实例目录 ⇒
 * 共一份 profile 只能有一台浏览器（§12），所以「多用者」的载体是**每实例一条标签页 + 一条登记**。
 *
 * 判序（端口先行）：先问 `profile/DevToolsActivePort` 的端口答不答，再读锁——四形两两不重（§12「四形如何不重不漏」）。
 *
 *  - **接入**：端口答通 ⇒ 开自己的标签页 + 登记（不论锁里 pid 死活、不论在不在启动窗内）。
 *  - **持有**：端口答不通 ∧ 无锁可读 ⇒ 原子领取 → 读用者登记 → 回收同 profile 孤儿 → 拉起 → 写回锁 → 登记。
 *  - **等待**：端口答不通 ∧ 锁可读 ∧ pid 活 ∧ 窗内 ⇒ 50 ms 轮询到窗尾；答通则接入，到点未通则转接管。
 *  - **接管**：端口答不通 ∧ 锁可读 ∧（pid 死 ∨ 已过窗）⇒ 读用者登记 → `rename` 摘陈旧位 → 回收 → 拉起。
 *
 * **回收的唯一门槛**：端口答不通**不**证明没人连着（挂死 ∥ 忙等时 WebSocket 未断、`failSession` 不触发）⇒
 * 回收 ∥ 拉起之前先读 `users/*.json`，有他实例活条目就不收、不拉起并明确报错（§12 同名段）。
 * **方向不对称**：探测失败 ⇒ 算活——误留只多留一台浏览器，误删会关掉别人在用的浏览器。
 *
 * 注入缝（§12 机制落点：目录 ∥ 判活 ∥ 时钟）：每个导出接 `io`，缺省回落真实现；`_deps` 供用例整体覆写。
 */
import { closeSync, mkdirSync, openSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync, writeSync } from "node:fs"
import { dirname, join } from "node:path"
import { closeTab, newTab, probeVersion } from "./cdp.mjs"
import { browserStartTimeoutMs, launchBrowser, listProfileProcs, reclaimProfileOrphans, resolveBrowser } from "./launch.mjs"

/** 「端口答不答」的探针帽（§12「接入」判据——2 s）。 */
const PROBE_CAP_MS = 2_000
/** 「等待」形态的轮询间隔（§12 四形表）。 */
const WAIT_POLL_MS = 50
/** 原子领取 ∥ 摘陈旧位失败后的重判上限（防两实例互摘空转）。 */
const CLAIM_ATTEMPTS = 5

/** pid 活性（方向不对称——只有 ESRCH 算死，无权限等一律算活）。 */
function pidAlive(pid) {
  try { process.kill(pid, 0); return true }
  catch (e) { return e?.code !== "ESRCH" }
}

/** 端口读数单源 = `profile/DevToolsActivePort`（锁里的 port 只是抄本，不参与判定）。 */
function portOnDisk(profile) {
  const raw = String(readTextReal(join(profile, "DevToolsActivePort"))).split(/\r?\n/)[0].trim()
  const port = Number(raw)
  return Number.isInteger(port) && port > 0 ? port : null
}

function readTextReal(path) {
  try { return readFileSync(path, "utf8") } catch { return "" }
}

/** 在跑那台浏览器的模式（锁无记录时的模式来源——读命令行里的 `--headless=new`；读不到 ⇒ null = 不给值）。
 *  只认**浏览器进程**那一行：helper 进程（`--type=`）也带着父进程的 `--user-data-dir`，读它们的行会报错模式。 */
function headlessFromCmdline(profile) {
  const marker = `--user-data-dir=${profile}`
  for (const row of listProfileProcs() ?? []) {
    const cmdline = String(row?.cmdline ?? "").replace(/"/g, "")
    if (!cmdline.includes(marker) || /--type=/.test(cmdline)) continue
    return /--headless=new/.test(cmdline)
  }
  return null
}

const REAL = {
  readText: readTextReal,
  writeText: (path, text) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, text, "utf8") },
  /** 创建即领取：`wx` 成功才算获得（EEXIST ⇒ false）。「先查后建」在两实例同时首开那一窗必漏。 */
  claim: (path, text) => {
    mkdirSync(dirname(path), { recursive: true })
    const fd = openSync(path, "wx")
    try { writeSync(fd, text) } finally { closeSync(fd) }
    return true
  },
  rename: (from, to) => renameSync(from, to),
  remove: (path) => { try { rmSync(path, { force: true }) } catch { /* 已不在盘 */ } },
  listDir: (dir) => { try { return readdirSync(dir) } catch { return [] } },
  isAlive: pidAlive,
  now: () => Date.now(),
  sleep: (ms) => new Promise((resolve) => { const timer = setTimeout(resolve, ms); timer.unref?.() }),
  port: (paths) => portOnDisk(paths.profile),
  probe: (port) => probeVersion(port, { timeoutMs: PROBE_CAP_MS }),
  openTab: (port) => newTab(port),
  closeTab: (port, id) => closeTab(port, id),
  launch: ({ headless, profile }) => launchBrowser({ exe: resolveBrowser(), headless, profile }),
  reclaim: (profile) => reclaimProfileOrphans(profile),
  browserHeadless: (profile) => headlessFromCmdline(profile),
  startWindow: () => browserStartTimeoutMs(),
  pid: () => process.pid,
}

/** 用例整体覆写位（`session.mjs` 的 `_deps` 同式）；缺省空 ⇒ 回落 `REAL`。 */
export const _deps = {}

const depsOf = (io) => ({ ...REAL, ..._deps, ...io })

const userFile = (paths, pid) => join(paths.users, `${pid}.json`)

function parseJson(text) {
  try { return JSON.parse(String(text ?? "")) } catch { return null }
}

/** 持有者记录：JSON `{pid, headless, port, startedAt}`；旧形（裸 pid 一行）照读但按「已过窗」处置。 */
export function readHolder(lock, io = {}) {
  const raw = String((io.readText ?? readTextReal)(lock) ?? "").trim()
  if (!raw) return null
  const rec = parseJson(raw)
  if (rec && Number.isInteger(rec.pid) && rec.pid > 0) {
    return {
      pid: rec.pid,
      headless: typeof rec.headless === "boolean" ? rec.headless : null,
      port: Number.isInteger(rec.port) && rec.port > 0 ? rec.port : null,
      startedAt: Number.isFinite(Number(rec.startedAt)) ? Number(rec.startedAt) : 0,
    }
  }
  const legacy = Number(raw)
  return Number.isInteger(legacy) && legacy > 0 ? { pid: legacy, headless: null, port: null, startedAt: 0 } : null
}

/** 写回生效模式与端口（持有者拉起成功后）。 */
export function writeHolder(lock, record, io = {}) {
  const d = depsOf(io)
  d.writeText(lock, JSON.stringify(record))
  return record
}

/** 用者登记：`users/<pid>.json` = `{pid, tabId, joinedAt}`（单写者 = 该 pid）。 */
export function registerUser({ paths, pid, tabId }, io = {}) {
  const d = depsOf(io)
  const record = { pid, tabId: tabId ?? null, joinedAt: d.now() }
  d.writeText(userFile(paths, pid), JSON.stringify(record))
  return record
}

/** 活着的用者条目（死条目当场剔除——计数不被死条目撑着）。
 *  读不懂的条目**不删也不当死**：登记是一条小档、写侧非原子，取到半写形是可能的——
 *  按「探测失败 ⇒ 算活」同向处置（误留只多留一台浏览器，误删会关掉别人在用的浏览器），
 *  它计作一条匿名在用者（pid = null）。 */
export function liveUsers({ paths, io = {} } = {}) {
  const d = depsOf(io)
  const alive = []
  for (const name of d.listDir(paths.users) ?? []) {
    if (!String(name).endsWith(".json")) continue
    const file = join(paths.users, String(name))
    const record = parseJson(d.readText(file))
    if (!record || !Number.isInteger(record.pid)) { alive.push({ pid: null, tabId: null, joinedAt: 0, unreadable: true }); continue }
    if (d.isAlive(record.pid)) alive.push({ pid: record.pid, tabId: record.tabId ?? null, joinedAt: record.joinedAt ?? 0 })
    else d.remove(file)
  }
  return alive
}

const otherUsers = (paths, self, d) => liveUsers({ paths, io: d }).filter((user) => user.pid !== self)

/** 门槛命中时的显式失败（§12「被挡住时的出路」：让那些实例 close ∥ 退出后重试，不静默重试）。 */
function blockedError({ port, others }) {
  const where = port ? ` on port ${port}` : ""
  return new Error(`the shared browser is unreachable${where} and ${others} other instance(s) hold live registrations — not reclaiming`)
}

/** 模式沿用注记（§12「模式」条）：只在**要的事与生效值不一致**时发（同值 ⇒ 零注记，§2.4）。 */
export function modeNote({ wanted, actual, starterPid = null }) {
  const tail = "the mode is set by the first instance; it switches only after every instance has released it"
  if (typeof actual === "boolean") {
    if (wanted === actual) return null
    const starter = Number.isInteger(starterPid) && starterPid > 0 ? ` (started by pid ${starterPid})` : ""
    return `[note: the shared browser is running headless=${actual}${starter} — ${tail}]`
  }
  // 生效模式读不到（锁无记录 ∧ 命令行也读不到）⇒ 只报关系、不报值
  return `[note: the shared browser is already running — ${tail}]`
}

/** 开自己的标签页 + 登记（接入 ∥ 持有 ∥ 接管三条路共用）。 */
async function openOwnTab({ paths, d, self, port, child }) {
  const tab = await d.openTab(port)
  registerUser({ paths, pid: self, tabId: tab.id }, d)
  return { port, tabId: tab.id, wsUrl: tab.wsUrl, child: child ?? null }
}

/** 接入：端口答通 ⇒ 开自己的标签页，不拉起、不动锁。 */
async function joinShared({ paths, d, self, port, wantedHeadless }) {
  const holder = readHolder(paths.lock, d)
  const actual = holder && typeof holder.headless === "boolean" ? holder.headless : d.browserHeadless(paths.profile)
  const joined = await openOwnTab({ paths, d, self, port })
  return { ...joined, headless: actual, starterPid: holder?.pid ?? null, note: modeNote({ wanted: wantedHeadless, actual, starterPid: holder?.pid ?? null }) }
}

/** 原子领取 → 读用者登记（门槛）→ 回收 → 拉起 → 写回 → 开自己的标签页。竞争失败 ⇒ null（外层重判）。
 *  领取成功后的两条放弃腿都要摘掉自己刚建的位：留着会让后来的实例读到「pid 活」而白等一个启动窗。 */
async function claimSlot({ paths, d, self, wantedHeadless }) {
  const startedAt = d.now()
  if (!d.claim(paths.lock, JSON.stringify({ pid: self, headless: null, port: null, startedAt }))) return null
  const held = otherUsers(paths, self, d)
  if (held.length) {
    d.remove(paths.lock)
    throw blockedError({ port: d.port(paths), others: held.length })
  }
  d.reclaim(paths.profile)
  let launched
  try {
    launched = await d.launch({ headless: wantedHeadless, profile: paths.profile })
  } catch (e) {
    d.remove(paths.lock)
    throw e
  }
  writeHolder(paths.lock, { pid: self, headless: wantedHeadless, port: launched.port, startedAt }, d)
  const joined = await openOwnTab({ paths, d, self, port: launched.port, child: launched.child })
  return { ...joined, headless: wantedHeadless, starterPid: self, note: null }
}

/** 接管：门槛 → `rename` 摘陈旧位（原子——两方同时摘只有一个成功）→ 领取并拉起。 */
async function takeOver({ paths, d, self, wantedHeadless, holder }) {
  const held = otherUsers(paths, self, d)
  if (held.length) throw blockedError({ port: d.port(paths), others: held.length })
  const stale = `${paths.lock}.stale-${holder.pid}`
  try { d.rename(paths.lock, stale) } catch { return null } // 已被别人摘走 ⇒ 重判
  d.remove(stale)
  return claimSlot({ paths, d, self, wantedHeadless })
}

/** 「等待」：窗内轮询端口；答通 ⇒ 返回端口；窗尾 ∥ 持有者已死 ⇒ null（下一轮落「接管」）。 */
async function waitForPort({ paths, d, holder }) {
  const deadline = holder.startedAt + d.startWindow()
  while (d.now() < deadline) {
    await d.sleep(WAIT_POLL_MS)
    const port = d.port(paths)
    if (port && (await d.probe(port))) return port
    if (!d.isAlive(holder.pid)) return null
  }
  return null
}

/**
 * 共享池唯一入口（§12）：判序端口先行，四形取一。
 * @returns {Promise<{port: number, tabId: string|null, wsUrl: string, child: object|null,
 *   headless: boolean|null, starterPid: number|null, note: string|null}>} `child` 只有拉起者非空；
 *   `note` = 模式沿用注记（无则 null）。
 */
export async function attachOrLaunch({ paths, wantedHeadless = true, io = {} } = {}) {
  const d = depsOf(io)
  const self = d.pid()
  for (let attempt = 0; attempt < CLAIM_ATTEMPTS; attempt++) {
    const port = d.port(paths)
    if (port && (await d.probe(port))) return joinShared({ paths, d, self, port, wantedHeadless })
    const holder = readHolder(paths.lock, d)
    if (!holder) {
      const slot = await claimSlot({ paths, d, self, wantedHeadless })
      if (slot) return slot
      continue
    }
    const inWindow = d.now() - holder.startedAt <= d.startWindow()
    if (d.isAlive(holder.pid) && inWindow) {
      const ready = await waitForPort({ paths, d, holder })
      if (ready) return joinShared({ paths, d, self, port: ready, wantedHeadless })
      // 到点仍未答通 ⇒ 直接转「接管」（§12 四形表）；接管抢输（陈旧位已被别人摘走）⇒ 重判
      const slot = await takeOver({ paths, d, self, wantedHeadless, holder })
      if (slot) return slot
      continue
    }
    const slot = await takeOver({ paths, d, self, wantedHeadless, holder })
    if (slot) return slot
  }
  throw new Error("the shared browser pool did not settle (repeated claim races) — run the action again")
}

/**
 * 摘自己 + 末关（§12）：删自己的条目 → 重扫并再核一次活性 → 无活条目才关浏览器 → 删锁。
 * 自己的标签页随后关（「摘自己」的后一半）：**先判末关再关标签页**——关标签页会撕掉本进程的 CDP 连接，
 * 而末关的 `Browser.close` 正是走这条连接发的；先关标签页，最后一位用者的关浏览器会发不出去，
 * 回执说「closed」而浏览器还在跑（验收 AC-M3 要的是进程真的消失）。
 * @param closeBrowser 关浏览器本体（由 `session.mjs` 注入：`Browser.close` → 等自退 → 拉起者才有杀树）；
 *   仍有活条目时**不调用**它。
 * @returns {Promise<{others: number, lastUser: boolean, browserClosed: boolean}>}
 */
export async function releaseUser({ paths, tabId = null, closeBrowser = null, io = {} } = {}) {
  const d = depsOf(io)
  const self = d.pid()
  const port = d.port(paths)
  const closeOwnTab = async () => { if (port && tabId) await d.closeTab(port, tabId) }
  d.remove(userFile(paths, self))
  const others = otherUsers(paths, self, d).length
  if (others > 0) {
    await closeOwnTab() // 仍有人用 ⇒ 只关自己的标签页，浏览器留着（关别人的浏览器是硬边界）
    return { others, lastUser: false, browserClosed: false }
  }
  // 没接过浏览器本体（无会话）⇒ 不碰锁：另一实例可能正在首开中（锁里此刻记的是它）
  if (!closeBrowser) { await closeOwnTab(); return { others: 0, lastUser: true, browserClosed: false } }
  let browserClosed = false
  try { await closeBrowser(); browserClosed = true } catch { browserClosed = false }
  if (!browserClosed) await closeOwnTab()
  if (browserClosed) d.remove(paths.lock) // 末关删锁：关成功后锁里记的持有者 pid 照旧活着，留着会挡住下一个实例
  return { others: 0, lastUser: true, browserClosed }
}

/** 同步摘自己（进程退出钩子 ∥ `failSession`：两处都不能等异步面）。返回还活着几家。 */
export function releaseUserSync({ paths, io = {} } = {}) {
  const d = depsOf(io)
  const self = d.pid()
  d.remove(userFile(paths, self))
  return { others: otherUsers(paths, self, d).length }
}