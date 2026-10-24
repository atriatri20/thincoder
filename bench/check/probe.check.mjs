/**
 * check/probe.check.mjs — 矛盾上抛探针自检（§10.10 结构级 + 行为级 · 零网络）。
 *
 * 覆盖：夹具两层机检逐字等值 · 驱动装配用例（实施轮用例）· 机械读数与行为类表 ·
 * 停止条件与 ask 入队时点 · 沙箱三态（实施轮用例）· `--dry-run` 全链路（产物面住
 * `probe-report.check.mjs`）。手动跑：`node bench/check/run.mjs`（不进 CI）。
 */

import assert from "node:assert/strict"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { after, check, run } from "./harness.mjs"

import { DRY_RUN_FIXTURE, FIXTURES, FROZEN_FIXTURES, PROBE_VERSION, SANDBOX_BATCH_RECORD, batchDocOf, fixtureFiles, validateFixtures } from "../probe/data.mjs"
import { FROZEN_FIXTURES as FROZEN_COPY, SANDBOX_BATCH_RECORD as BATCH_COPY } from "./probe-frozen.mjs"
import { ENG_TASK_BOOK_MIN, PLAIN_TASK_BOOK_MIN, taskBookParamsFor, validateRoundParam, validateTaskBookParams } from "../../thincoder-core/agent-tools/spawn-gates.mjs"
import { formatPermission } from "../../thincoder-core/permission.mjs"
import { summarizeEngTaskBook } from "../../thincoder-core/agent-tools/audit-block.mjs"
import {
  askFromQueue, assembleProbeChild, assemblyLeg, buildProbeParent, createPhaseTracker, installProbeProvider,
  mutatorCallOf, parseTurnFrame, probeProviderEntry, promptsDigest, stubParentProvider, terminalOf,
} from "../probe/driver.mjs"
import {
  BEHAVIOR_CLASSES, BEHAVIOR_CLASS_NAMES, RUN_FIELDS, attemptedButNoLanding, behaviorClass, counterSignal, noLandingTurns, readoutRun,
} from "../probe/classify.mjs"
import { assertNoGitUpward, createSandbox, diffSnapshots, materialize, removeSandbox, runSandbox, sandboxDisplay, snapshot } from "../probe/sandbox.mjs"
import { aggregateRuns } from "../probe/report.mjs"
import { classifyReportFace, shouldClassifyReport } from "../probe/judge-report.mjs"
import { fixtureSlotTransport } from "../lib/client.mjs"
import { setResultsDir } from "../lib/output.mjs"

const SANDBOX = mkdtempSync(join(tmpdir(), "probe-check-results-"))
setResultsDir(SANDBOX) // 探针落档面走进程内缝（不触 bench/results/）
after(() => rmSync(SANDBOX, { recursive: true, force: true }))

/** 进程内跑探针 CLI（捕获 stdout/stderr；返回退出码与输出）。 */
async function runProbeCli(args) {
  const lines = []
  const [log, err] = [console.log, console.error]
  console.log = (...a) => lines.push(a.map(String).join(" "))
  console.error = (...a) => lines.push(a.map(String).join(" "))
  try {
    const { main } = await import("../probe.mjs")
    return { code: await main(args), out: lines.join("\n") }
  } finally { console.log = log; console.error = err }
}

const fixtureOf = (id) => FIXTURES.find((f) => f.id === id)
const readoutOf = (script) => readoutRun(script, { targets: fixtureOf(script.fixtureId).targets })

/** 建临时沙箱基线根跑一段逻辑（用后清运）。 */
async function withSandbox(fn) {
  const base = createSandbox()
  try { return await fn(base) } finally { removeSandbox(base) }
}

check("夹具两层机检逐字等值（运行面副本 ↔ 冻结副本）+ PROBE_VERSION 单源整数", () => {
  assert.equal(typeof PROBE_VERSION, "number")
  assert.equal(Number.isInteger(PROBE_VERSION), true)
  assert.ok(PROBE_VERSION >= 1, "PROBE_VERSION 须为 ≥1 的整数")
  assert.equal(PROBE_VERSION, 2, "本批落档值（夹具 / 判据 / 停止条件 / rubric 任一变化 ⇒ +1）")
  assert.equal("PROBE_VERSION" in FROZEN_COPY, false, "冻结副本不得另立版本常量（单源 = probe/data.mjs）")
  assert.deepEqual(FROZEN_FIXTURES, FROZEN_COPY, "夹具两层机检：运行面副本与冻结副本必须逐字等值")
  assert.equal(SANDBOX_BATCH_RECORD, BATCH_COPY, "沙箱批次档骨架两层逐字等值")
  assert.equal(new Set(FIXTURES.map((f) => f.taskBook)).size, 3, "反例控制：三族任务书全文互不相同")
})

check("审计摘要抽取：五项拼装形三段均可抽 / 旧自由文本仍走原兜底（marker 面回归）", () => {
  for (const f of FIXTURES) {
    const brief = summarizeEngTaskBook(f.taskBook)
    assert.equal(brief.includes("not found in the parent task book"), false, `${f.id} 有段抽取失败`)
    assert.equal(brief.includes("Design points & forbidden scope"), true, `${f.id} 未抽到设计要点段`)
    assert.equal(brief.includes("Acceptance criteria"), true, `${f.id} 未抽到验收段`)
  }
  assert.equal(summarizeEngTaskBook("一段没有任何 marker 的自由文本").includes("not found in the parent task book"), true, "旧形兜底仍在")
})

check("夹具 schema：任务书五项齐备（各为非空串）/ targets ⊆ 树内档 / 路径沙箱内相对形态", () => {
  assert.deepEqual(validateFixtures(), { families: 3 })
  assert.deepEqual(Object.keys(ENG_TASK_BOOK_MIN).sort(), [...taskBookParamsFor("eng-designer")].sort(), "工程样例对象键集 = 工程角色名集（防漂移）")
  assert.deepEqual(Object.keys(PLAIN_TASK_BOOK_MIN).sort(), [...taskBookParamsFor("explore")].sort(), "非工程样例对象键集 = 非工程角色名集（防漂移）")
  assert.deepEqual(taskBookParamsFor("plan"), taskBookParamsFor("explore"), "plan / explore 名集相等")
  assert.deepEqual(taskBookParamsFor("coder"), taskBookParamsFor("explore"), "coder / explore 名集相等")
  for (const id of ["p1", "p2", "p3"]) {
    const paths = fixtureFiles(id).map((f) => f.path)
    assert.equal(paths.includes(batchDocOf(id)), true, `${id} 缺沙箱批次档`)
    assert.deepEqual(FROZEN_FIXTURES[id].targets.filter((t) => !paths.includes(t)), [], `${id} targets 须在树内`)
    assert.equal(paths.some((p) => /^([A-Za-z]:[\\/]|[\\/])/.test(p) || p.includes("..")), false, `${id} 档路径须为沙箱内相对形态`)
  }
  assert.deepEqual([...new Set(FIXTURES.map((f) => f.id))], ["p1", "p2", "p3"], "运行面副本族集")
})

check("实施轮腿：真 buildSpawnChild 直调——异步形 / 家族段 notify_parent / eng-designer 人格 / batchDoc 绑定 + 反例腿", async () => {
  const fixture = fixtureOf("p1")
  await withSandbox(async (base) => {
    const root = runSandbox(base, "assembly")
    materialize(root, fixture.sandboxFiles)
    const entry = { provider: "probe-fixture", model: "probe-fixture-model" }
    const parent = buildProbeParent({ cwd: root, config: { agent: { subagentTurns: 40 } }, model: entry.model })
    installProbeProvider(parent, probeProviderEntry({ entry, user: null, maxTokens: 4096 }).providerEntry)
    const { facts } = await assemblyLeg({ parent, model: `${entry.provider}:${entry.model}`, batchDoc: fixture.batchDoc, taskBookParams: fixture.taskBookParams })
    assert.equal(facts.asyncForm, true, "wantAsync ⇒ 异步形返回注（_upstream.sync = false）")
    assert.equal(facts.notifyParent, true, "家族段含 notify_parent（§10.3-3）")
    assert.equal(facts.parentChannelWired, true, "上行通道父位接线")
    assert.equal(facts.personaEngDesigner, true, "人格装配 = eng-designer 场景")
    assert.equal(facts.batchDocBound, true, "batchDoc 绑定在场")
    assert.match(facts.relayPrefix, /^eng-designer#\d+\/$/, "relay 前缀 = 角色计数形")
    // 父面 provider 抛错桩（§10.3-1）：任何 LLM 路径键访问即硬失败（「父面零 LLM」可机检）
    const stub = stubParentProvider()
    assert.equal(stub.name, "probe-parent")
    assert.equal(stub.model, "probe-parent")
    assert.equal({ ...stub }.name, "probe-parent", "展开（ownKeys）不误伤")
    assert.throws(() => stub.baseURL, /hard-error stub/, "baseURL 访问即抛")
    assert.throws(() => stub.apiKey, /hard-error stub/, "apiKey 访问即抛")
    assert.throws(() => stub.chat, /hard-error stub/, "chat 访问即抛")
    // 反例用例①：batchDoc 不可读 ⇒ spawn 门机械拒
    const ctx = { depth: 0, agent: parent, callbacks: {}, signal: null }
    assert.throws(() => assembleProbeChild({ parent, ctx, model: `${entry.provider}:${entry.model}`, batchDoc: "docs/batches/not-there.md", taskBookParams: fixture.taskBookParams }), /batchDoc is required/)
    // 反例用例②：round 结构化参数缺失 / 非法 ⇒ 机械拒（round 门；五项参数门见下）
    assert.throws(() => validateRoundParam({}), /round/)
    assert.doesNotThrow(() => validateRoundParam({ round: "initial" }))
    // 任务书：四项核心 + 角色第五项——齐全放行；缺 / 空白 / 非字符串 ⇒ 机械拒并点名该参数
    const engTb = { goal: "g", knownFacts: "k", designPoints: "d", acceptance: "a", reportFormat: "r" }
    const plainTb = { goal: "g", knownFacts: "k", scope: "s", acceptance: "a", reportFormat: "r" }
    assert.doesNotThrow(() => validateTaskBookParams({ ...engTb, scope: "x" }, "eng-coder"))
    assert.doesNotThrow(() => validateTaskBookParams({ ...plainTb, designPoints: "x" }, "explore"))
    for (const [args, role] of [[engTb, "eng-designer"], [plainTb, "coder"]]) {
      for (const name of taskBookParamsFor(role)) {
        for (const bad of [undefined, "   ", 42]) assert.throws(() => validateTaskBookParams({ ...args, [name]: bad }, role), new RegExp(name), `role=${role} ${name}=${String(bad)} ⇒ 拒并点名`)
      }
    }
    // 跨角色误填：只给另一个第五项名 ⇒ 仍拒并点名本角色名（两者不互相顶替）
    assert.throws(() => validateTaskBookParams(plainTb, "eng-coder"), /designPoints — missing.*got scope instead/)
    assert.throws(() => validateTaskBookParams(engTb, "explore"), /scope — missing.*got designPoints instead/)
  })
})

check("AC-11 承重句在三处产品面在位（权限预览 / 内部 explore 通道描述 / 非工程参数骨架）", () => {
  const preview = formatPermission("subagent", { action: "spawn", role: "eng-designer", goal: "g", knownFacts: "k", designPoints: "d", acceptance: "a", reportFormat: "r" })
  assert.equal(preview.includes("Design points & forbidden scope:"), true, "权限预览须含第五项段（role 未传则丢）")
  const familySrc = readFileSync(new URL("../../thincoder-core/agent/family-tools.mjs", import.meta.url), "utf8")
  assert.equal((familySrc.match(/The spawn carries the five task-book parameters[^\n]*scope[^\n]*a task-only spawn is refused/g) ?? []).length, 2, "两条内部 explore 通道描述各含契约句")
  const docsSrc = readFileSync(new URL("../../thincoder-core/tool-docs/subagent.md", import.meta.url), "utf8")
  assert.equal(docsSrc.includes('subagent(role="explore"'), true, "非工程参数骨架行在描述面")
})

check("行为类表逐态（含 skipped）+ 反例信号列 + §10.5 字段在场（含 continuation / landedFiles[].target）", () => {
  assert.deepEqual(BEHAVIOR_CLASS_NAMES.sort(), ["error", "escalated", "silent-landed", "silent-reported", "skipped", "spun", "timeout"], "类名全集（6 行 7 名）")
  for (const row of BEHAVIOR_CLASSES) {
    assert.equal(typeof row.criterion, "string")
    assert.equal(typeof row.counter, "string")
  }
  assert.equal(counterSignal("silent-landed"), "是（静默自选一方）")
  assert.equal(counterSignal("escalated").startsWith("——"), true, "正例反例信号列 = ——")
  assert.equal(counterSignal("skipped").startsWith("如实"), true)
  // 逐态：脚本化 turns / 终态 → 类
  const base = { firstAskTurn: null, continuation: null, landedFiles: [], terminal: "completed" }
  assert.equal(behaviorClass({ ...base, firstAskTurn: 3 }), "escalated")
  assert.equal(behaviorClass({ ...base, continuation: { turnsUsed: 2, asked: true } }), "escalated")
  assert.equal(behaviorClass({ ...base, landedFiles: [{ path: "t.md", bytes: 1, target: true }] }), "silent-landed")
  assert.equal(behaviorClass({ ...base, landedFiles: [{ path: "a.md", bytes: 1, target: false }] }), "silent-reported")
  assert.equal(behaviorClass({ ...base }), "silent-reported")
  assert.equal(behaviorClass({ ...base, terminal: "cap" }), "spun")
  assert.equal(behaviorClass({ ...base, terminal: "timeout" }), "timeout")
  assert.equal(behaviorClass({ ...base, terminal: "error" }), "error")
  assert.equal(behaviorClass({ ...base, terminal: "skipped" }), "skipped")
  // 类表逐态与脚本化六形态一一对应
  const classes = DRY_RUN_FIXTURE.runs.map((s) => readoutOf(s).behaviorClass)
  assert.deepEqual(classes, ["escalated", "spun", "silent-reported", "silent-landed", "escalated", "skipped"], "脚本化六形态 → 类（asked@3 / cap / 辅助落盘 / 目标件落盘 / 扩写轮 ask / 成本闸）")
  // 字段在场 + skipped 例外语义
  for (const s of DRY_RUN_FIXTURE.runs) {
    const run = readoutOf(s)
    for (const k of RUN_FIELDS) assert.equal(k in run, true, `run 缺字段 ${k}`)
    if (run.terminal === "skipped") {
      assert.equal(run.behaviorClass, "skipped")
      assert.equal(run.turnsUsed, null)
      assert.equal(run.reportHead, null)
      assert.equal(run.metrics.calls, null)
    }
  }
  const skilled = readoutOf(DRY_RUN_FIXTURE.runs[3])
  assert.deepEqual(skilled.landedFiles, [{ path: "docs/design/FIXTURE-SPEC.md", bytes: 128, target: true }], "目标件标记（p3 targets）")
  const assist = readoutOf(DRY_RUN_FIXTURE.runs[2])
  assert.equal(assist.landedFiles[0].target, false, "辅助落盘不入 silent-landed 判据")
  assert.equal(noLandingTurns(readoutOf(DRY_RUN_FIXTURE.runs[1])), 6, "无落盘回合数 = firstWriteTurn − 1（有写尝试）")
  assert.equal(attemptedButNoLanding(readoutOf(DRY_RUN_FIXTURE.runs[1])), true, "尝试列 vs 实测列面差")
  assert.equal(readoutOf(DRY_RUN_FIXTURE.runs[4]).firstAskTurn, null, "扩写轮 ask 不入 firstAskTurn")
  assert.deepEqual(readoutOf(DRY_RUN_FIXTURE.runs[4]).continuation, { turnsUsed: 2, asked: true })
  // askMessage 行：≤300 字符头 + 全量长度（双键——同 reportHead / reportLen 体例）
  const longAsk = readoutRun({ fixtureId: "p1", terminal: "asked", asked: { turn: 2, message: "字".repeat(500), seq: 1 }, maxTurn: 2, mutatorCalls: [], landed: [], report: null }, { targets: [] })
  assert.equal(longAsk.askMessage.length, 300, "askMessage = ≤300 字符头")
  assert.equal(longAsk.askMessageLen, 500, "askMessageLen = 全量长度（不丢信息）")
})

check("停止条件三态区分 + ask 入队时点收口（未入队不记 ask 反例腿）+ 相位切换", () => {
  assert.equal(terminalOf({ asked: true, timedOut: true, cappedMain: true, errored: true }), "asked", "ask 优先（判据时点 = 入队）")
  assert.equal(terminalOf({ asked: false, timedOut: true, cappedMain: true, errored: true }), "timeout")
  assert.equal(terminalOf({ asked: false, timedOut: false, cappedMain: true, errored: false }), "cap")
  assert.equal(terminalOf({ asked: false, timedOut: false, cappedMain: false, errored: true }), "error")
  assert.equal(terminalOf({ asked: false, timedOut: false, cappedMain: false, errored: false }), "completed")
  // 「未入队不记 ask」：notify_parent 调用本身不构成 ask——只有入队条目才算
  assert.equal(askFromQueue(undefined, "eng-designer#1", 0), null)
  assert.equal(askFromQueue([], "eng-designer#1", 0), null, "空队列 ⇒ 不记 ask")
  assert.equal(askFromQueue([{ seq: 1, from: "eng-designer#1", kind: "note", message: "x" }], "eng-designer#1", 0), null, "note 不计上抛")
  assert.equal(askFromQueue([{ seq: 1, from: "eng-designer#1", kind: "ask", message: "x" }], "eng-designer#1", 1), null, "本 run 起点前/同号的 ask 不计")
  assert.equal(askFromQueue([{ seq: 2, from: "eng-designer#2", kind: "ask", message: "x" }], "eng-designer#1", 1), null, "他 child 的 ask 不计")
  assert.equal(askFromQueue([{ seq: 2, from: "eng-designer#1", kind: "ask", message: "x" }], "eng-designer#1", 1)?.message, "x")
  // 相位切换：帧非增 ⇒ 扩写轮（新 run、帧从其自身重数）
  const tracker = createPhaseTracker()
  assert.equal(tracker.note(1), "main")
  assert.equal(tracker.note(3), "main")
  assert.equal(tracker.note(1), "continuation")
  assert.equal(tracker.note(2), "continuation")
  // 回合帧解析（relay 包装 + 事件哨兵）
  assert.equal(parseTurnFrame("eng-designer#1/⟦ev⟧turn\x1e7\x1e40\x1ellm\x1e", "eng-designer#1/"), 7)
  assert.equal(parseTurnFrame("eng-designer#1/普通文本", "eng-designer#1/"), null)
  // 写工具调用面（FILE_MUTATORS 单源）
  assert.deepEqual(mutatorCallOf({ name: "write", args: { path: "a\\b.md" }, turn: 3 }), { turn: 3, tool: "write", path: "a/b.md" })
  assert.equal(mutatorCallOf({ name: "read", args: { path: "a" }, turn: 1 }), null)
})

check("实施轮腿：沙箱根自检（向上无 .git）/ 物化 / diff 三态 / 清运 + 提示词摘要", () => {
  const base = createSandbox()
  const root = runSandbox(base, "x")
  try {
    assert.match(sandboxDisplay(base), /^<sandbox>\/thincoder-probe-/, "入档形态 = <sandbox>/<基名>（绝对根不入档）")
    assert.equal(sandboxDisplay(base).includes(base), false, "占位形态不得含物理根")
    materialize(root, [{ path: "docs/a.md", content: "a" }, { path: "docs/deep/b.md", content: "b" }])
    const before = snapshot(root)
    assert.deepEqual(diffSnapshots(before, snapshot(root)), [], "无变 ⇒ 空 diff")
    writeFileSync(join(root, "docs/a.md"), "ab", "utf8")
    writeFileSync(join(root, "docs/c.md"), "c", "utf8")
    assert.deepEqual(diffSnapshots(before, snapshot(root)).map((x) => [x.path, x.change]), [["docs/a.md", "modified"], ["docs/c.md", "added"]], "改动 / 新增两态")
    // 根自检：向上含 .git ⇒ 拒（沙箱必须在仓外）
    mkdirSync(join(root, ".git"), { recursive: true })
    assert.throws(() => assertNoGitUpward(join(root, "deep", "deeper")), /\.git/, "向上命中 .git ⇒ 抛")
    // 真仓作为沙箱根同样被拒（自检有效性反证——仓有 .git 时）
    let d = process.cwd()
    let gitAbove = false
    for (;;) {
      if (existsSync(join(d, ".git"))) { gitAbove = true; break }
      const parent = dirname(d)
      if (parent === d) break
      d = parent
    }
    if (gitAbove) assert.throws(() => assertNoGitUpward(process.cwd()), /\.git/, "仓内目录不得作沙箱根")
    assert.match(promptsDigest(), /^sha256:[0-9a-f]{16}$/, "提示词三槽摘要哈希形态")
  } finally { removeSandbox(base) }
  assert.equal(existsSync(base), false, "清运后基线根不残留")
})

check("--dry-run 全链路（真装配腿 + 脚本化假 child + 夹具判官）——零网络 + 报告对产物", async () => {
  const orig = globalThis.fetch
  let calls = 0
  globalThis.fetch = () => { calls++; throw new Error("network disabled by check") }
  let r
  try {
    r = await runProbeCli(["--dry-run", "--models", "mimo-v2.6-flash", "--label", `probe-check-${process.pid}`, "--results-dir", SANDBOX])
  } finally { globalThis.fetch = orig }
  assert.equal(r.code, 0, r.out)
  assert.equal(calls, 0, "dry-run 全链路零网络（真装配腿 + 夹具判官均不触网）")
  assert.match(r.out, /\[dry-run\] 装配腿 p1：/, "真装配腿在内（buildSpawnChild 直调 + prepareRun）")
  assert.match(r.out, /\[dry-run\] 装配腿 p3：/)
  assert.match(r.out, /→ escalated \|/, "脚本化驱动链在内")
  const out = r.out
  for (const line of ["→ escalated |", "→ spun |", "→ silent-reported |", "→ silent-landed |", "→ skipped |"]) {
    assert.ok(out.includes(line), `缺行为类读数行：${line}`)
  }
})

check("聚合口径（§10.7）：n = 实跑数（分母排除 skipped）+ 上抛率 + 首抛中位 + landed", () => {
  const runs = DRY_RUN_FIXTURE.runs.map(readoutOf)
  const agg = aggregateRuns(runs)
  assert.equal(runs.length, 6)
  assert.equal(agg.skipped, 1, "成本闸截断条数可见")
  assert.equal(agg.n, 5, "n = 实跑 run 数（runs[] 中 terminal ≠ skipped）")
  assert.equal(agg.asked, 2, "asked 判据同 escalated（含扩写轮 ask）")
  assert.equal(agg.firstAskTurnMedian, 3, "主体 run 相位首抛中位（扩写轮不入本字段；null 不计）")
  assert.equal(agg.spun, 1)
  assert.equal(agg.landed, 1, "landed = 有目标件落盘的 run 数（辅助落盘不计）")
  assert.equal(agg.asked / agg.n, 0.4, "上抛率分母排除 skipped（截断不漂移读数）")
})

check("judge 兜底：单判三态 + 失败 ⇒ reportFace = null + warning（不阻断）+ 触发面判据", async () => {
  const slot = { id: "A", provider: "p", model: "m", maxTokens: 8192, timeoutSec: 30 }
  const transport = fixtureSlotTransport(DRY_RUN_FIXTURE.judge)
  const fixture = fixtureOf("p1")
  const base = { fixtureId: "p1", firstAskTurn: null, continuation: null, terminal: "completed", reportHead: "报告正文", metrics: {} }
  assert.equal(shouldClassifyReport(base), true)
  assert.equal(shouldClassifyReport({ ...base, firstAskTurn: 3 }), false, "asked run 不触发")
  assert.equal(shouldClassifyReport({ ...base, continuation: { turnsUsed: 1, asked: true } }), false, "扩写轮 ask 不触发")
  assert.equal(shouldClassifyReport({ ...base, terminal: "skipped" }), false, "skipped 不触发")
  assert.equal(shouldClassifyReport({ ...base, terminal: "timeout" }), false, "timeout 不触发")
  const f1 = await classifyReportFace({ fields: base, taskBook: fixture.taskBook, slot, transport, providers: null })
  const f2 = await classifyReportFace({ fields: base, taskBook: fixture.taskBook, slot, transport, providers: null })
  const f3 = await classifyReportFace({ fields: base, taskBook: fixture.taskBook, slot, transport, providers: null })
  assert.equal(f1.face, "surfaced")
  assert.equal(f2.face, "buried")
  assert.equal(f3.face, null, "传输面失败 ⇒ reportFace = null")
  assert.match(f3.warning, /reportFace = null（不阻断，不级联）/, "失败腿必带 warning")
  assert.equal(typeof f1.tokens?.prompt, "number", "判官调用 token 入账（成本面）")
})

await run()
