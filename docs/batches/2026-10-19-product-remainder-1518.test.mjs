// 批内单元测试档（用后即删——§5 留读数行；零留存）
// 断言 = 批档 §2.7 A4 ∥ §2.8 C1（`#1518` 登出成拍推送 V1/V2/V3/D1）∥ §2.7 A3（`#1528` 键位形）
// 装载面：`vscode` 宿主模块桩 ∥ `./team.mjs` 团队面桩（回执可控、零网络）∥ `/rc/` 解析钩
// —— 三者皆 `module.registerHooks` 进程内钩，零仓内落盘（先例 = 批内 vscode 桩件）。
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { createRequire, registerHooks } from "node:module"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const reqOf = (pkg) => createRequire(pathToFileURL(join(ROOT, pkg)))
const mod = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

// ── 三桩（载入面）───────────────────────────────────────────────────────────
const VSCODE_STUB_URL = "data:text/javascript," + encodeURIComponent(`
const mk = () => new Proxy(function vscodeStub() {}, {
  get: (t, p) => (p === Symbol.toPrimitive || p === "then" ? undefined : mk()),
  set: (t, p, v) => { try { Object.defineProperty(t, p, { value: v, writable: true, configurable: true, enumerable: true }) } catch { /* 只读宿主面 */ } return true },
  apply: () => mk(),
  construct: () => mk(),
});
export const window = mk(); export const workspace = mk(); export const commands = mk(); export const env = mk(); export const languages = mk();
export const Uri = mk(); export const Range = mk(); export const Position = mk(); export const ThemeColor = mk();
export const StatusBarAlignment = mk(); export const Disposable = mk(); export const EventEmitter = class { constructor() { this.event = () => ({ dispose() {} }) } fire() {} dispose() {} };
export default { window, workspace, commands, env, languages, Uri };
`)
const TEAM_STUB_URL = "data:text/javascript," + encodeURIComponent(`
export function teamStatus() { return globalThis.__team1518?.status ?? { loggedIn: false, server: null, member: null, label: null } }
export function teamVerify() { return Promise.resolve({ state: "valid" }) }
export function teamLogin() { return Promise.resolve({ ok: false, reason: "network" }) }
export function teamLogout() { return Promise.resolve(globalThis.__team1518?.logout ?? { ok: true, revokeDelivered: true }) }
export function teamRotate() { return Promise.resolve({ ok: false, reason: "network" }) }
`)
const rcRoot = dirname(reqOf("thincoder-render-core/package.json").resolve("@thincoder/render-core/package.json"))
registerHooks({
  resolve(specifier, context, next) {
    if (specifier === "vscode") return { url: VSCODE_STUB_URL, shortCircuit: true }
    if (specifier === "./team.mjs") return { url: TEAM_STUB_URL, shortCircuit: true }
    if (specifier.startsWith("/rc/")) return { url: pathToFileURL(join(rcRoot, specifier.slice(4))).href, shortCircuit: true }
    return next(specifier, context)
  },
})

// 配置缝必须取 **VSC 侧** 的核副本（`thincoder-vscode/node_modules/@thincoder/core` 是实体目录，
// 与 `thincoder-core/` 是两个模块实例——设错副本 = 真配置照读）。
const CIO = await import(pathToFileURL(reqOf("thincoder-vscode/package.json").resolve("@thincoder/core/config-io.mjs")).href)
const settings = await mod("thincoder-vscode/src/extension/settings.mjs")
const pms = await mod("thincoder-vscode/src/extension/panel-messages-settings.mjs")
const teamSurface = await mod("thincoder-vscode/src/extension/team-surface.mjs")
const mountTeam = await mod("thincoder-desktop/renderer/mount-team.mjs")

const tmpDir = mkdtempSync(join(tmpdir(), "pr1518-"))
after(() => { CIO._resetConfigPathForTest?.(); rmSync(tmpDir, { recursive: true, force: true }) })
let cfgSeq = 0
/** 临时 config 落盘并指向（内容按用例给；`{}` ⇒ `providerState.state === "invalid"`——早退径入口）。 */
function seedConfig(obj) {
  const path = join(tmpDir, `config-${++cfgSeq}.json`)
  writeFileSync(path, JSON.stringify(obj) + "\n")
  CIO._setConfigPathForTest(path)
  return path
}
const wsOf = (seed) => ({ get: (k) => (k === "thincoder.modelPrefs" ? seed : undefined), update() {} })
const viewOf = (pushes) => ({ webview: { postMessage: (m) => pushes.push(m) } })

// ── V1 · webview 消息径（`handleTeamLogout`）────────────────────────────────
test("V1 登出成拍：handleTeamLogout ⇒ _pushSettings 恰 1 次 ∧ models 消息 ≥ 1（空表）", async () => {
  seedConfig({})
  globalThis.__team1518 = {
    status: { loggedIn: true, server: "http://127.0.0.1:9", member: { username: "alice", name: "alice" }, label: "cli@test" },
    logout: { ok: true, revokeDelivered: true },
  }
  const pushes = []
  const calls = { status: 0, settings: 0 }
  const view = viewOf(pushes)
  const panel = {
    _panel: view,
    _pushStatus() { calls.status++; return settings.pushStatus(view) },
    _pushSettings() { calls.settings++; return settings.fullStatus(view, wsOf(undefined)) },
  }
  await pms.handleTeamLogout(panel)
  assert.equal(calls.settings, 1, "登出成拍 ⇒ _pushSettings 恰 1 次")
  const models = pushes.filter((m) => m.type === "models")
  assert.equal(models.length, 1, "models 消息恰 1 条（早退径同步落）")
  assert.deepEqual(models[0].models, [], "空表 = 已到且空")
})

// ── V2 · 命令径（`team-surface` `logoutFlow`）──────────────────────────────
test("V2 登出流：runTeamCommand 走 logoutFlow ⇒ _pushSettings 恰 1 次", async () => {
  seedConfig({})
  globalThis.__team1518 = {
    status: { loggedIn: true, server: "http://127.0.0.1:9", member: { username: "alice", name: "alice" }, label: "cli@test" },
    logout: { ok: true, revokeDelivered: true },
  }
  const calls = { status: 0, settings: 0 }
  const chatPanel = { _panel: viewOf([]), _pushStatus() { calls.status++ }, _pushSettings() { calls.settings++ } }
  await teamSurface.initTeamSurface(chatPanel)
  await teamSurface.runTeamCommand()
  assert.equal(calls.settings, 1, "退出流成拍 ⇒ _pushSettings 恰 1 次（登录径同形）")
})

// ── V3 · 早退径（`fullStatus` invalid 态）──────────────────────────────────
test("V3 早退径 · 空 prefs：models 恰 1 次 ∧ 载荷 {models:[],prefs:{}} ∧ 簿记 [] ∥ null", async () => {
  seedConfig({})
  // 先以非空 prefs 拍一次（证明簿记确实被本径覆写，而非残留上一拍 —— 否则 `null` 断言可空过）
  await settings.fullStatus(viewOf([]), wsOf({ provider: "anthropic", model: "claude-x" }))
  assert.equal(settings.lastPushedPrefs(), "anthropic:claude-x", "前置：非空 prefs 拍已记簿记")

  const pushes = []
  const ws = wsOf(undefined)
  await settings.fullStatus(viewOf(pushes), ws)
  const models = pushes.filter((m) => m.type === "models")
  assert.equal(models.length, 1, "models 消息恰 1 次")
  assert.deepEqual(models[0].models, [], "载荷 models 深等于 []")
  assert.deepEqual(models[0].prefs, {}, "载荷 prefs 深等于 {}（workspaceState 兜底）")
  assert.deepEqual(settings.lastModelsPayload(), [], "lastModelsPayload() 深等于 []")
  assert.equal(settings.lastPushedPrefs(), null, "lastPushedPrefs() === null（无复合 ⇒ 判零源为 null）")
})

test("V3 早退径 · 非空 prefs：载荷 prefs 深等复合 ∧ lastPushedPrefs() === \"provider:model\"", async () => {
  seedConfig({})
  const pushes = []
  await settings.fullStatus(viewOf(pushes), wsOf({ provider: "anthropic", model: "claude-x" }))
  const models = pushes.filter((m) => m.type === "models")
  assert.equal(models.length, 1, "models 消息恰 1 次")
  assert.deepEqual(models[0].models, [], "载荷 models 深等于 []")
  assert.deepEqual(models[0].prefs, { provider: "anthropic", model: "claude-x" }, "载荷 prefs 深等于会话槽复合（同源同拍）")
  assert.equal(settings.lastPushedPrefs(), "anthropic:claude-x", "簿记 = 本次下发复合（推了就得记）")
  assert.deepEqual(settings.lastModelsPayload(), [], "lastModelsPayload() 深等于 []")
})

// ── D1 · 桌面（`mount-team` `logout`）──────────────────────────────────────
test("D1 桌面登出成径：logout ⇒ onProvidersChanged 恰 1 次（loadProviders 同拍 1 次）", async () => {
  let state = { settings: { team: { state: "ready", loggedIn: true, server: "http://127.0.0.1:9", member: null, label: null, verify: "valid", notice: null } } }
  const calls = { loadProviders: 0, providersChanged: 0 }
  let resolveChanged = () => {}
  const changed = new Promise((resolve) => { resolveChanged = resolve })
  const store = { get: () => state, subscribe: () => () => {} }
  const setSettings = (patch) => { state = { ...state, settings: { ...state.settings, ...patch } } }
  const ask = async (channel) => (channel === "team:logout"
    ? { ok: true, revokeDelivered: true }
    : { ok: true, loggedIn: false, server: null, member: null, label: null })
  const team = mountTeam.createTeam({
    ask, store, setSettings,
    loadProviders: async () => { calls.loadProviders++ },
    onProvidersChanged: () => { calls.providersChanged++; resolveChanged() },
    invalidateDrafts: () => {},
  })
  team.handlers.onTeamLogout()
  // 确定等到成拍（不数轮询拍数；超时仅作失败护栏）
  await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("onProvidersChanged 未在 5s 内被调")), 5000)
    changed.then(() => { clearTimeout(timer); resolve() }, reject)
  })
  assert.equal(calls.loadProviders, 1, "复读两调用点之一：loadProviders 恰 1 次")
  assert.equal(calls.providersChanged, 1, "登出成 ⇒ onProvidersChanged 恰 1 次")
})

// ── `#1528` · 键位形（结构判据；全文计数删后 = 2，`§2.7 A3` 明写该形不作判据——不写断言）──
test("#1528 死键删除：settings.mjs 键位形 `defaultModel:` 零命中", () => {
  const src = readFileSync(join(ROOT, "thincoder-vscode/src/extension/settings.mjs"), "utf8")
  const keyHits = src.split("\n").filter((line) => /^\s*defaultModel:/.test(line))
  assert.equal(keyHits.length, 0, "键位形零命中")
})
