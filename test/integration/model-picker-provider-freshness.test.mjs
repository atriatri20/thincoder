/**
 * model-picker-provider-freshness.test.mjs — 集成用例 `CLI 39-1` ∥ `CLI 40-1`（RTM 故事 39 ∥ 40，
 * 分册 `test/rtm/ends.md`）。
 *
 * 用户痛点（本批服务的正是它）：`/model` 报 `Cannot read properties of undefined (reading 'padEnd')`
 * ——盘上一条无 `name` 的渠道条目被原样传进列表构建，19 个正常渠道被 1 条空条目连累；以及「盘上改完
 * 必须重启才生效」。机制条文 = `docs/core/design/PROVIDER.md` §6.29 ∥ §6.30。
 *
 * 被评的交互 = `createModelPicker(ctx).openModelPicker()`（L1 入口）⟷ 盘上 config.json。
 * 进入口 = 用户打开 `/model`；注入面 = 既有 ctx 的 `showPicker` ∥ `pushLine`（不新增缝）。
 * 断言只落用户看见的那一屏（列表行文与推出来的行）；数组形状归本批单元测试档——两层不各留一份。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { tmpdir } from "node:os"

import { loadConfig, _setConfigPathForTest, _resetConfigPathForTest } from "../../thincoder-core/config.mjs"
import { createModelPicker } from "../../thincoder-cli/src/tui/model-picker.mjs"

const NAMED_A = { name: "a", apiKey: "k", baseURL: "http://127.0.0.1:1" }
const NAMED_B = { name: "b", apiKey: "k", baseURL: "http://127.0.0.1:2" }

/** 一次 `/model` 打开：起一个真 picker，并把用户看见的那一屏与推出来的行捕获下来。 */
function openPicker(agent) {
  const screens = []
  const pushed = []
  const ctx = {
    agent,
    state: { picker: null, lines: [] },
    pushLine: (text) => pushed.push(text),
    showPicker: (title, entries) => {
      screens.push({ title, entries })
      return Promise.resolve(null) // 用户按 Esc：停在 L1 即返回
    },
    closePicker: () => {},
    renderPickerLines: () => {},
    persistRaw: async () => {},
    askQuestion: async () => "",
    maskKey: (k) => k,
    confirmDelete: async () => false,
    ansi: {},
    C: { error: "", tool: "", dim: "" },
  }
  return { picker: createModelPicker(ctx), screens, pushed }
}

/** 盘上写一份 config + 起一个装好的 agent（生产装配同形：agent.config = loadConfig()）。
 *  缝 `_setConfigPathForTest` 必须活到本用例结束（`/model` 打开时会重读盘——重读读的就是这条缝），
 *  收尾复位的活归调用方的 `t.after`（CONFIG.md §6.2 通道③ 成对规则）。 */
function boot(raw) {
  const dir = mkdtempSync(join(tmpdir(), "thincoder-model-picker-"))
  const configPath = join(dir, "config.json")
  writeFileSync(configPath, JSON.stringify(raw))
  _setConfigPathForTest(configPath)
  const cfg = loadConfig()
  const agent = { providers: cfg.providersList, config: cfg, activeProvider: "a", activeModel: null, cwd: dir }
  return { configPath, agent }
}

/** showPicker 捕获的条目里，用户能选的渠道行。 */
const channelRows = (screen) => screen.entries.filter((e) => e.action === "open-models").map((e) => e.provider)

test('CLI 39-1 盘上有一条无名渠道条目时，/model 照常打开：首行是告警（指向 providers[]），其余渠道照常列出，无 padEnd 崩溃', async (t) => {
  t.after(() => _resetConfigPathForTest())
  const { agent } = boot({ providers: [NAMED_A, null] })
  const { picker, screens, pushed } = openPicker(agent)

  await picker.openModelPicker()

  assert.equal(screens.length, 1, `列表开了一次，实际：${screens.length}`)
  const screen = screens[0]
  assert.equal(screen.entries[0].type, "header", `那一屏首行是告警行，实际首行：${JSON.stringify(screen.entries[0])}`)
  assert.match(screen.entries[0].text, /skipped/, `首行读作「有条目被跳过」：${screen.entries[0].text}`)
  assert.match(screen.entries[0].text, /providers\[\]/, `告警指向要改的那一处 providers[]：${screen.entries[0].text}`)
  assert.deepEqual(channelRows(screen), ["a"], `具名渠道照常出现（丢弃不连累其余渠道），实际：${JSON.stringify(channelRows(screen))}`)
  assert.deepEqual(pushed.filter((l) => /Cannot read properties of undefined|padEnd/.test(l)), [], `无一屏崩错推到会话流，实际：${JSON.stringify(pushed)}`)
})

test('CLI 40-1 盘上改完不用重启：重开 /model 就见新渠道；坏条目改好后表头消失；盘面读不出时报错且列表不开', async (t) => {
  t.after(() => _resetConfigPathForTest())
  const { configPath, agent } = boot({ providers: [NAMED_A, null] })

  // ① 启动那一屏：坏条目在，表头在
  const first = openPicker(agent)
  await first.picker.openModelPicker()
  assert.equal(first.screens[0].entries[0].type, "header", `启动时首行是告警行，实际：${JSON.stringify(first.screens[0].entries[0])}`)
  assert.deepEqual(channelRows(first.screens[0]), ["a"], "启动时只有盘上那条具名渠道")

  // ② 不重启、盘上把坏条目改成一条真渠道 ⇒ 重开就见它，表头消失
  writeFileSync(configPath, JSON.stringify({ providers: [NAMED_A, NAMED_B] }))
  const second = openPicker(agent)
  await second.picker.openModelPicker()
  assert.deepEqual(channelRows(second.screens[0]), ["a", "b"], `刚改过的渠道出现在列表里，实际：${JSON.stringify(channelRows(second.screens[0]))}`)
  assert.equal(second.screens[0].entries[0].type, "item", `坏条目改好后表头消失（首行回到渠道行），实际：${JSON.stringify(second.screens[0].entries[0])}`)

  // ③ 盘上写成非法 JSON ⇒ 出一行错误、列表不开（拿旧表当现况正是本缺陷的形状，故拒开）
  writeFileSync(configPath, '{ "providers": [ broken')
  const third = openPicker(agent)
  await third.picker.openModelPicker()
  assert.equal(third.screens.length, 0, `列表不开，实际开了 ${third.screens.length} 屏`)
  assert.equal(third.pushed.length, 1, `恰一行错误推到会话流，实际：${JSON.stringify(third.pushed)}`)
  assert.ok(
    third.pushed[0].startsWith("[model] cannot re-read config:"),
    `错误行以 [model] cannot re-read config: 起头，实际：${third.pushed[0]}`,
  )
})