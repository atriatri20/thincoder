/**
 * 2026-10-19-zerowrite-criterion.test.mjs — 批内单测件（批档 = `docs/batches/2026-10-19-zerowrite-criterion.md` §2.6）：
 * 零写计数器判据物收正——去重文件数（`_touchedFiles.length`）⇒ 单调写序（`_mutationSeq`）。
 * 权威 = `docs/core/design/AGENT-LOOP-UPSTREAM.md` §6.32.2 ①（判据）∥ §6.32.6 接线①（回合环）∥ §6.32.4 B 面（读数）。
 *
 * 复跑（cwd = `d:\teamcode\thincoder`）：`node --test docs/batches/2026-10-19-zerowrite-criterion.test.mjs`
 * 生命周期：随批档留存（不进 `test/` 收集面）。
 *
 * U-7 是**静态接线断言**，不是行为级直驱——`runTurnLoop` 无模型注入缝，直驱需 loader 级桩。
 * 它挡得住：残留旧字段名 ∥ 路径数比较回潮 ∥ 判据点少一处赋值；
 * 它挡不住（未测面，明列）：赋值位置错放（环头之后 / else 支内）∥ 分支内顺序与 alert 接线 ∥ 连轮行为读数。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { wroteSince } from "../../thincoder-core/agent/helpers.mjs"
import { turnCapTrace } from "../../thincoder-core/agent-tools/checkpoint.mjs"

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..")
const src = (rel) => readFileSync(join(ROOT, rel), "utf8")
// 计数只认代码面：先剥注释再数——否则日后一句含字段名的注释会把静态断言染色成假红。
const code = (text) => text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
const count = (text, needle) => text.split(needle).length - 1

test("U-1 同文件重复编辑 ⇒ 计落笔（谓词级）", () => {
  // 旧判据物的误报来源：`_touchedFiles` 去重 ⇒ 同档重写长度恒 1；写序每次写 +1。
  const agent = { _mutationSeq: 3, _touchedFiles: ["C:/w/a.mjs"] }
  const mark = agent._mutationSeq
  for (let seq = 4; seq <= 6; seq++) {
    agent._mutationSeq = seq
    assert.equal(agent._touchedFiles.length, 1, "去重数组长度不变（旧判据物在此判零写）")
    assert.equal(wroteSince(agent, mark), true, `写序 ${seq} ≠ mark ${mark} ⇒ 计落笔`)
  }
})

test("U-2 写序不推进 ⇒ 计零落笔（谓词级）", () => {
  const agent = { _mutationSeq: 3 }
  assert.equal(wroteSince(agent, 3), false)
})

test("U-3 缺 `_mutationSeq` ⇒ 记「有落笔」不判", () => {
  // 不用 `?? 0` 兜底：未跟踪面把「未跟踪」读成「零落笔」正是本收正要消除的误报方向。
  assert.equal(wroteSince({}, 0), true)
  assert.equal(wroteSince({ _mutationSeq: undefined }, 0), true)
})

test("U-4 `_mutationSeq` 为 NaN ⇒ 记「有落笔」不判", () => {
  assert.equal(wroteSince({ _mutationSeq: NaN }, NaN), true)
  assert.equal(wroteSince({ _mutationSeq: NaN }, 0), true)
})

test("U-5 B 面读数带分母；缺任一字段不渲染该元", () => {
  const fixture = { _continueSegments: 2, _turnSeq: 97, _zeroWriteTurns: 46, _segmentTurns: 51 }
  const full = turnCapTrace({ childAgent: fixture })
  assert.equal(full, "segments 2 · accumulated 97 turns · 46 of this segment's 51 rounds produced no file write")
  // A-7 不变量（同段同源）：分子 ≤ 分母。本行只固定读数样本的算术——机制侧无代码动态计算该关系；
  // 可静态固定的结构前提（每段轮数每轮 +1 恰 1 处 · 零写自增恰 2 处）放在 U-7，动态面仍属未测。
  assert.ok(fixture._zeroWriteTurns <= fixture._segmentTurns)
  // 缺分母 ⇒ 整元不渲染（缺字段不冒充 0）
  const noDen = turnCapTrace({ childAgent: { _continueSegments: 1, _turnSeq: 12, _zeroWriteTurns: 7 } })
  assert.equal(noDen, "segments 1 · accumulated 12 turns")
  // 缺分子 ⇒ 同上
  const noNum = turnCapTrace({ childAgent: { _continueSegments: 1, _turnSeq: 12, _segmentTurns: 7 } })
  assert.equal(noNum, "segments 1 · accumulated 12 turns")
  // A-4（静态）：撞帽载荷含职责句——判什么 / 做什么
  assert.match(src("thincoder-core/agent-tools/checkpoint.mjs"), /Check for a non-writing loop before you grant or stop/)
})

test("U-6 写失败不计落笔（谓词级）：写序不推进 ⇒ false", () => {
  // 前提「结果 `Error:` 前缀 ⇒ 写序不推进」由既有门兑付（本批零改）：门在 thincoder-core/agent/dispatch-run.mjs:136
  // `if (FILE_MUTATORS.has(toolName) && !raw.startsWith("Error:"))`（routed 面 :82）；noteExecutedMutation 本身无结果入参；
  // 本例只固定谓词面：写序不动 ⇒ 判零落笔。不经 executeToolCalls（无模型注入缝），故非接线行为断言。
  assert.equal(wroteSince({ _mutationSeq: 5 }, 5), false)
})

test("U-7 回合环接线（静态断言）", () => {
  const loop = code(src("thincoder-core/agent/turn-loop.mjs"))
  // 判据点恰 2 处：轮顶结账 ∥ 撞帽收尾（同一谓词、同一写序标）
  assert.equal(count(loop, "wroteSince(agent, agent._mutSeqMark)"), 2, "判据点恰 2 处")
  // 写序标赋值恰 2 处：环外基线 ∥ 每轮前移
  assert.equal(count(loop, "agent._mutSeqMark = agent._mutationSeq"), 2, "赋值恰 2 处（漏前移 ⇒ 谓词恒判有落笔、看门狗永不触发）")
  // 字段总出现恰 4 处（2 赋值 + 2 谓词调用）——下限断言拦不住「少一处」
  assert.equal(count(loop, "_mutSeqMark"), 4, "字段出现恰 4 处")
  assert.equal(count(loop, "wroteSince("), 2, "调用恰 2 处（第三处 = 判据分叉）")
  // 旧字段 / 旧判据不得回潮
  assert.equal(count(loop, "_turnFilesMark"), 0, "旧路径数标零残留")
  assert.equal(count(loop, "agent._touchedFiles.length ==="), 0, "路径数比较零残留")
  // B 面分母接线（A-3）：环头逐轮 +1 恰 1 处 · 段起点复位恰 1 处——删任一行，7 例全绿就是假绿
  assert.equal(count(loop, "agent._segmentTurns = (agent._segmentTurns ?? 0) + 1"), 1, "段轮数环头 +1 恰 1 处")
  assert.equal(count(code(src("thincoder-core/agent/run-start.mjs")), "agent._segmentTurns = 0"), 1, "段起点复位恰 1 处")
  // A-7 可静态固定的结构前提：零写自增恰 2 处（环内结账 ∥ 撞帽收尾）——每段轮数最多计一次
  assert.equal(count(loop, "agent._zeroWriteTurns += 1"), 2, "零写自增恰 2 处")
  // 收尾行逐字（含 `maxTurns > 0 &&` 门）：回退成「不判」必须变红
  const finish = "if (maxTurns > 0 && !wroteSince(agent, agent._mutSeqMark)) agent._zeroWriteTurns += 1"
  assert.ok(src("thincoder-core/agent/turn-loop.mjs").split("\n").some((l) => l.trim() === finish), `收尾行逐字缺失：${finish}`)
  // 谓词单源：`helpers.mjs` 恰 1 处导出
  assert.equal(count(code(src("thincoder-core/agent/helpers.mjs")), "export function wroteSince("), 1, "谓词导出恰 1 处")
})
