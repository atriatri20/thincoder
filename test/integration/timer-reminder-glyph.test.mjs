/**
 * timer-reminder-glyph.test.mjs — 集成场景 33-1（RTM `test/RTM.md` 故事 33）：
 * timer 到期行进入 CLI 会话流时，前缀段读到的是可见文字，不是缺字形的图标字符
 * （Linux 终端缺 U+23F0 字形 ⇒ 豆腐块；判据 = 不改字体、不猜终端能力，只让该行不携缺字形字符）。
 *
 * 被评的交互 = 核注入单点（`thincoder-core/agent/timers.mjs` 的 `injectTimerReminders`）
 *            ⟷ CLI 会话流镜像分支（`thincoder-cli/src/tui/tool-events.mjs` 的回合尾镜像）。
 * 进入口 = 用户在 CLI 会话里挂一个 timer 等它到期：本例以模块直驱（假 `state` + 真核注入串 +
 *          真镜像分支 + 真 `timer` 工具产出缺省消息），不起真终端、不起真时钟。
 *
 * 修前红：改前注入行 = `[System reminder: ⏰ timer — …]` ⇒ 前缀段含 U+23F0，`/^[\x20-\x7E]+$/` 判红。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { deliverExpiredTimers } from "../../thincoder-core/agent/timers.mjs"
import { timerTool } from "../../thincoder-core/agent-tools/timer.mjs"
import { buildToolCallbacks } from "../../thincoder-cli/src/tui/tool-events.mjs"

const ASCII_ONLY = /^[\x20-\x7E]+$/

test('CLI 33-1 timer 到期行在会话流里的前缀段全为可读 ASCII：挂一个 timer 等它到期，读会话流那一行', () => {
  const now = Date.now()
  const agent = { history: [], _pendingTimers: [], config: {}, _advisorRound: 0 }
  // 真工具设一个 1s 一次性 timer（不传 message ⇒ 走缺省消息，字形问题在缺省消息上也出现过）
  timerTool.execute({ seconds: 1 }, { agent, now })

  // 真核到期面：出列 ⇒ 注入单点落历史（CLI 回合尾读的就是 history 末条）
  const lines = deliverExpiredTimers(agent, { now: now + 60_000 })
  assert.equal(lines.length, 1, `一个到期 timer 恰交付一行，实际：${JSON.stringify(lines)}`)

  // 真镜像分支：假 state（空推理 / 空流式）+ 捕获 pushLine
  const pushed = []
  const state = { lines: [], reasoning: "", streaming: "", tasks: [] }
  const { callbacks } = buildToolCallbacks({
    agent,
    state,
    pushLine: (text) => pushed.push(text),
    render: () => {},
    scheduleRender: () => {},
    ensureAssistantLabel: () => {},
    saveSessionImpl: () => {},
  })
  callbacks.onTurnEnd()

  assert.equal(pushed.length, 1, `会话流恰收到一行，实际：${JSON.stringify(pushed)}`)
  const shown = pushed[0]
  assert.ok(shown.startsWith("[System reminder: timer — "), `镜像行逐字起头 = 核注入单点，实际：${shown}`)

  const prefix = shown.slice(0, shown.indexOf("timer —"))
  assert.match(prefix, ASCII_ONLY, `前缀段至 \`timer —\` 之前不得携非 ASCII 字符（缺字形的图标字符零命中），实际前缀：${JSON.stringify(prefix)}`)
  assert.ok(!shown.includes("\u23f0"), `整行不得含 U+23F0，实际：${JSON.stringify(shown)}`)
  // 缺省消息同样在流里（不传 message 的两个落点都查过，这里钉住缺省支）
  assert.match(shown, /Time's up \(1s\)/, `缺省到期消息随行可见，实际：${shown}`)
})