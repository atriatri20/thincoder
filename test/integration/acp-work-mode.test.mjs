/**
 * acp-work-mode.test.mjs — ACP workMode 真实 stdio 业务入口集成用例（批次 #2393）。
 *
 * 被测面 = 真 CLI 子进程 `node bin/thincoder.mjs acp`（本仓 CLI 里唯一同时具备
 * 「会话流」「多轮」「进程重开 + 历史从盘回放」的用户入口），本档扮演 ACP 客户端
 * （NDJSON JSON-RPC）。夹具 = `fixtures/acp-cli.mjs`（起子进程 + 发请求 + 收更新）。
 *
 * workMode 三档（tiny/normal/engineering）与 PLAN mode 是**两个正交字段**：
 * `sessionConfigOptions` 顺序 = model → thinking → mode（PLAN）→ workMode；本档断言
 * ① session/new 按 config `agent.mode` 返回三档 workMode 且不碰 PLAN；
 * ② set_config_option 切 tiny/engineering 写当前 agent 与会话槽并全量重推；
 * ③ 非法 workMode 零状态变、零通知；
 * ④ load/resume 从槽恢复 workMode；
 * ⑤ PLAN（id=mode）字段不被 workMode 切换污染（仅 engineering 按既有规则清 PLAN）。
 *
 * 本档零真实模型回合——只起 ACP、不 prompt；模型侧仍配本地脚本化假 Anthropic 端点
 * （零外网），provider 可解析即可过认证门。断言只落在业务可观察结果：configOptions
 * 的 id=workMode / id=mode 现值、config_option_update 通知数、错误码。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { removeTempDirBestEffort } from "../teardown.mjs"
import { fakeAnthropic } from "./fixtures/anthropic-endpoint.mjs"
import { startCli } from "./fixtures/acp-cli.mjs"

const SCENE_TIMEOUT_MS = 240_000
const WORK_MODES = ["tiny", "normal", "engineering"]

/** configOptions 里 id=workMode 的现值（新/load/resume/通知共用同一投影）。 */
const workModeOf = (configOptions) => configOptions?.find((o) => o.id === "workMode")?.currentValue

/** configOptions 里 id=mode 的 PLAN 现值。 */
const planModeOf = (configOptions) => configOptions?.find((o) => o.id === "mode")?.currentValue

/** 全量 config_option_update 通知（clients 夹具的 updates() 已剥到 update 载荷）。 */
const configOptionUpdates = (cli) => cli.updates().filter((u) => u.sessionUpdate === "config_option_update")

/** initialize + session/new，返回 { sessionId, configOptions }（session/new 的活值）。 */
async function openSession(cli, cwd) {
  const init = await cli.request("initialize", { protocolVersion: 1, clientCapabilities: {} })
  assert.equal(init.error, undefined, `initialize 被拒：${JSON.stringify(init.error)}`)
  const created = await cli.request("session/new", { cwd, mcpServers: [] })
  assert.equal(created.error, undefined, `session/new 被拒：${JSON.stringify(created.error)}｜stderr: ${cli.stderr.slice(-1500)}`)
  return { sessionId: String(created.result.sessionId), configOptions: created.result.configOptions }
}

/** 一次集成场景的隔离现场：假家目录（config + sessions）、临时项目目录、假 Anthropic 端点。
 *  `mode` = config `agent.mode`（session/new 的初始 workMode）。 */
async function scene(t, { mode = "normal" } = {}) {
  const home = mkdtempSync(join(tmpdir(), "tc-int-workmode-home-"))
  const cwd = mkdtempSync(join(tmpdir(), "tc-int-workmode-proj-"))
  const endpoint = await fakeAnthropic()
  const children = []
  t.after(async () => {
    for (const cli of children) await cli.stop()
    await endpoint.close()
    removeTempDirBestEffort(home)
    removeTempDirBestEffort(cwd)
  })
  // 合法 manifest：engineering 档经 resolveEngineeringManifest 需要（writer:'main'）。
  mkdirSync(join(cwd, "docs", "batches"), { recursive: true })
  writeFileSync(join(cwd, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { batches: "docs/batches" } }))
  mkdirSync(join(home, ".thincoder"), { recursive: true })
  writeFileSync(join(home, ".thincoder", "config.json"), JSON.stringify({
    defaultModel: "fake-anthropic:claude-fake-1",
    agent: { mode },
    providers: [{ name: "fake-anthropic", baseURL: `http://127.0.0.1:${endpoint.port}/v1`, format: "anthropic", apiKey: "test-key" }],
  }, null, 2))
  const launch = () => {
    const cli = startCli({ home, cwd })
    children.push(cli)
    return cli
  }
  return { cwd, launch }
}

test("session/new returns the configured workMode for all three values and never pollutes PLAN", { timeout: SCENE_TIMEOUT_MS }, async (t) => {
  for (const mode of WORK_MODES) {
    const s = await scene(t, { mode })
    const cli = s.launch()
    const { configOptions } = await openSession(cli, s.cwd)
    const options = configOptions.map((o) => o.id)
    assert.deepEqual(options, ["model", "thinking", "mode", "workMode"], `configOptions 序（${mode}）：${JSON.stringify(options)}`)
    assert.equal(workModeOf(configOptions), mode, `session/new 应返回初始 workMode=${mode}`)
    assert.equal(planModeOf(configOptions), "normal", `${mode} workMode 不设 PLAN`)
    const workModeOption = configOptions.find((o) => o.id === "workMode")
    assert.deepEqual(workModeOption.options.map((o) => o.value), WORK_MODES, "workMode options 恒为三档")
    await cli.stop()
  }
})

test("set_config_option switches workMode tiny→engineering with full notification, slot persistence and PLAN exclusion", { timeout: SCENE_TIMEOUT_MS }, async (t) => {
  const s = await scene(t)
  const cli = s.launch()
  const { sessionId, configOptions: initialOptions } = await openSession(cli, s.cwd)
  assert.equal(workModeOf(initialOptions), "normal")

  // 先开 PLAN，再切 workMode=tiny：tiny 不碰 PLAN（id=mode 保持 plan）。
  const plan = await cli.request("session/set_mode", { sessionId, mode: "plan" })
  assert.equal(plan.error, undefined, `set_mode plan 被拒：${JSON.stringify(plan.error)}`)

  const tiny = await cli.request("session/set_config_option", { sessionId, configId: "workMode", value: "tiny" })
  assert.equal(tiny.error, undefined, `workMode=tiny 被拒：${JSON.stringify(tiny.error)}`)
  assert.equal(workModeOf(tiny.result.configOptions), "tiny")
  assert.equal(planModeOf(tiny.result.configOptions), "plan", "workMode=tiny 不污染 PLAN")

  let updates = configOptionUpdates(cli)
  assert.equal(updates.length, 1, "切 tiny 应发一次 config_option_update")
  assert.equal(workModeOf(updates[0].configOptions), "tiny", "通知携带全量 configOptions（workMode=tiny）")
  assert.equal(planModeOf(updates[0].configOptions), "plan", "通知里的 PLAN 保持 plan")

  // 切 engineering：按既有规则清 PLAN（mode=plan → normal）。
  const eng = await cli.request("session/set_config_option", { sessionId, configId: "workMode", value: "engineering" })
  assert.equal(eng.error, undefined, `workMode=engineering 被拒：${JSON.stringify(eng.error)}｜stderr: ${cli.stderr.slice(-1500)}`)
  assert.equal(workModeOf(eng.result.configOptions), "engineering")
  assert.equal(planModeOf(eng.result.configOptions), "normal", "engineering 清 PLAN")

  updates = configOptionUpdates(cli)
  assert.equal(updates.length, 2, "切 engineering 再发一次 config_option_update")
  assert.equal(workModeOf(updates[1].configOptions), "engineering")

  // load/resume 从槽恢复 engineering（同进程钉回原槽，槽上 mode 已由 set_config_option 落盘）。
  const loaded = await cli.request("session/load", { sessionId })
  assert.equal(loaded.error, undefined, `load 被拒：${JSON.stringify(loaded.error)}｜stderr: ${cli.stderr.slice(-1500)}`)
  assert.equal(workModeOf(loaded.result.configOptions), "engineering", "load 从槽恢复 workMode=engineering")
  assert.equal(planModeOf(loaded.result.configOptions), "normal")

  const resumed = await cli.request("session/resume", { sessionId })
  assert.equal(resumed.error, undefined, `resume 被拒：${JSON.stringify(resumed.error)}｜stderr: ${cli.stderr.slice(-1500)}`)
  assert.equal(workModeOf(resumed.result.configOptions), "engineering", "resume 从槽恢复 workMode=engineering")
})

test("invalid workMode rejects with -32602, zero state change and zero notification", { timeout: SCENE_TIMEOUT_MS }, async (t) => {
  const s = await scene(t)
  const cli = s.launch()
  const { sessionId } = await openSession(cli, s.cwd)
  const before = configOptionUpdates(cli).length

  const invalid = await cli.request("session/set_config_option", { sessionId, configId: "workMode", value: "bad" })
  assert.equal(invalid.error?.code, -32602, `非法 workMode 应返 -32602：${JSON.stringify(invalid)}`)
  assert.match(invalid.error.message, /workMode must be one of tiny\/normal\/engineering/)

  assert.equal(configOptionUpdates(cli).length, before, "非法值零通知")

  // 零状态变：从盘上 load 回来的 workMode 仍是初始 normal。
  const loaded = await cli.request("session/load", { sessionId })
  assert.equal(loaded.error, undefined, `load 被拒：${JSON.stringify(loaded.error)}`)
  assert.equal(workModeOf(loaded.result.configOptions), "normal", "非法值不改槽")
})

test("workMode persists to the slot across process restart and restore keeps PLAN independent", { timeout: SCENE_TIMEOUT_MS }, async (t) => {
  const s = await scene(t)
  const first = s.launch()
  const { sessionId } = await openSession(first, s.cwd)

  const tiny = await first.request("session/set_config_option", { sessionId, configId: "workMode", value: "tiny" })
  assert.equal(tiny.error, undefined, `workMode=tiny 被拒：${JSON.stringify(tiny.error)}`)
  assert.equal(workModeOf(tiny.result.configOptions), "tiny")
  assert.equal(planModeOf(tiny.result.configOptions), "normal", "tiny 不设 PLAN")
  await first.stop() // 会话已在 set_config_option 时落盘

  const second = s.launch()
  const loaded = await second.request("session/load", { sessionId })
  assert.equal(loaded.error, undefined, `重开后 load 被拒：${JSON.stringify(loaded.error)}｜stderr: ${second.stderr.slice(-2000)}`)
  assert.equal(workModeOf(loaded.result.configOptions), "tiny", "跨进程 load 恢复 workMode=tiny")
  assert.equal(planModeOf(loaded.result.configOptions), "normal", "workMode 恢复不污染 PLAN")

  const resumed = await second.request("session/resume", { sessionId })
  assert.equal(resumed.error, undefined, `重开后 resume 被拒：${JSON.stringify(resumed.error)}｜stderr: ${second.stderr.slice(-2000)}`)
  assert.equal(workModeOf(resumed.result.configOptions), "tiny", "跨进程 resume 恢复 workMode=tiny")
})
