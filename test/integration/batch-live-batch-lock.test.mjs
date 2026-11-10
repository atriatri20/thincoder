/**
 * batch-live-batch-lock.test.mjs — 集成用例 12-1 … 12-19（无 12-11——该格随 2026-11-05 `git` 免号批删除）；RTM CLI 端故事 12「写盘与跑命令都要报它替哪条
 * 台账行服务（不分面、不分类命令）」。
 *
 * 判据原文 = `test/rtm/guard.md` 故事 12；机制 = `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` §2.3；
 * 工作区根窄口（12-5 放行那一半 ∥ 12-16 两条不成之路）= 同档 §2.3.1；跨仓写权（12-17）=
 * `docs/core/design/CROSS-REPO-WRITE.md` §2.2；窄口 × 写权表（12-18）= 同档 §2.3.1 条件 ⑤；
 * 适用面 `execute`（12-19）= 同档 §2.2 判序 ② ∥ AC-12；`manifest` 整把不在入口集（决策 44）= 12-15。
 * **进入口 = 父侧工具面**（`write` / `bash` / `git` / `batch` / `ledger` 走 `executeToolCalls` 的 Phase 1
 * 真门——不直调 `ledgerBindWriteConflict`）：本档要的是「写这件事」的业务可观察结果
 * （拒 ∥ 写入、文件字节、命令是否执行、仓库有没有提交）。
 *
 * 夹具 = 仓内 `.thincoder/tmp`（在 `declarationForTarget` 的会话界内）；台账库经 `_setLedgerDirForTest`
 * 导向临时目录（不碰真实用户数据目录）。台账**按项目根隔离** ⇒ 每个夹具各有自己的账。
 * 仓建仓 / 暂存这类**夹具准备**直接走 `node:child_process`（不经被测门）。
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-live-batch-lock.test.mjs`
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { createHash } from "node:crypto"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { executeToolCalls } from "../../thincoder-core/agent/dispatch.mjs"
import { editTool, writeTool } from "../../thincoder-core/tools/file.mjs"
import { bashTool } from "../../thincoder-core/tools/bash.mjs"
import { executeTool } from "../../thincoder-core/tools/execute.mjs"
import { gitTool } from "../../thincoder-core/tools/git.mjs"
import { grepTool } from "../../thincoder-core/tools/search.mjs"
import { manifestTool } from "../../thincoder-core/agent-tools/manifest.mjs"
// 声明按档路径缓存：夹具改写 manifest 后必须清（否则测的是上一格的声明面）。
import { clearDeclarationCache } from "../../thincoder-core/conventions.mjs"
import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { ledgerTool } from "../../thincoder-core/ledger-tools.mjs"
const { _setLedgerDirForTest, _resetLedgerDirForTest, ledgerKey, ledgerAdd, ledgerUpdate, ledgerClose, ledgerQuery } =
  await import("../../thincoder-core/ledger.mjs")

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
const SCRATCH = join(ROOT, ".thincoder/tmp")
const ledgerDir = mkdtempSync(join(SCRATCH, "lock-ledger-"))
_setLedgerDirForTest(ledgerDir)
const fixtures = []
after(() => {
  _resetLedgerDirForTest()
  for (const p of fixtures) removeTempDirBestEffort(p)
  removeTempDirBestEffort(ledgerDir)
})

const UUID = "11111111-1111-1111-1111-111111111111"
/** 夹具项目：`docRoot.batches` + 产品 / 工具 / 产物四类目录骨架。 */
function makeProject(tag) {
  mkdirSync(SCRATCH, { recursive: true })
  return makeProjectAt(mkdtempSync(join(SCRATCH, `lk-${tag}-`)))
}
/** 在指定目录造一个项目（「容器根里的子项目」那一形用——`mkdir` 已存在的父目录是幂等的）。 */
function makeProjectAt(root) {
  mkdirSync(root, { recursive: true })
  fixtures.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" } }, null, 2))
  for (const d of ["docs/batches", "scripts", "thincoder-core/agent", "thincoder-vscode/test", "thincoder-cli/dist", "test/integration", "node_modules/pkg", "vendor", "dist"]) {
    mkdirSync(join(root, d), { recursive: true })
  }
  return root
}
/** depth-0 父侧 agent（`designSlot` = 造/不造活设计槽——两道门的两态）。 */
function agentOf(root, { designSlot = true } = {}) {
  const agent = { cwd: root, planMode: false, autoApprove: true, config: { agent: { engineering: true } } }
  if (designSlot) agent._engDesignTokens = new Map([["fx1", `${UUID}:${Date.now() + 3600_000}`]])
  return agent
}
function toolMapOf(root) {
  return new Map([["write", writeTool], ["edit", editTool], ["bash", bashTool], ["git", gitTool], ["grep", grepTool], ["manifest", manifestTool], ["execute", executeTool]])
}
async function run(agent, tools, name, args, depth = 0) {
  const [res] = await executeToolCalls(agent, tools, [{ name, id: "1", arguments: JSON.stringify(args) }], {}, depth)
  return res
}
const writeTo = (agent, path, content = "x\n") => run(agent, toolMapOf(agent.cwd), "write", { path, content })
const openBatch = (root, name, extra = {}) => batchTool(null).execute({ action: "create", path: `docs/batches/${name}.md`, topic: name, source: "集成夹具", ...extra }, { depth: 0, agent: agentOf(root) })
/** 挂一条在途台账行：`ledger({action:"add"})` 建行 → `batch create{ledger:"#N"}` 接管（写门拒文点名的两步路线）。 */
async function hangLiveRow(root, name) {
  const added = JSON.parse(await ledgerTool.execute({ action: "add", title: `夹具行 · ${name}`, kind: "tech_todo" }, { depth: 0, agent: agentOf(root) }))
  await openBatch(root, name, { ledger: `#${added.id}` })
  return added.id
}
/** 挂接台账行的批档夹具；核销只读行内工作证据，不读本档状态。 */
function writeClosedRecord(root, rel = "docs/batches/gate-closed.md") {
  writeFileSync(join(root, rel), [
    "# gate-closed",
    "",
    "## §1 讨论（主 agent）",
    "**状态行**：已收口 2026-11-03",
    "",
    "## §3 设计评审（评审子代理）",
    "**状态行**：评审通过",
    "",
  ].join("\n"))
  return rel
}
/** 挂一条指定状态的行（迁移表逐边推进；`在途` / `待核销` 的行要有在场指针）。 */
function rowWithStatus(root, status) {
  const task_book = writeClosedRecord(root)
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: `夹具行 ${status}`, task_book, evidence: "工作完成证据" }, boundary: root })
  const move = (to) => ledgerUpdate({ cwd: root, id, patch: { status: to }, boundary: root })
  if (status === "待讨论") return id
  if (status === "待设计") { move("待设计"); return id }
  move("在途")
  if (status === "在途") return id
  move("待核销")
  if (status === "待核销") return id
  if (status === "已核销") { ledgerClose({ cwd: root, id, status: "已核销", boundary: root, agent: {} }); return id }
  throw new Error(`rowWithStatus: unsupported ${status}`)
}
/** 仓夹具：init + 身份 + 暂存一个文件（夹具准备直走子进程）。 */
function makeRepo(root, file) {
  const git = (...args) => execFileSync("git", args, { cwd: root, stdio: "pipe" })
  if (!existsSync(join(root, ".git"))) git("init")
  git("config", "user.email", "rtm@example.test")
  git("config", "user.name", "rtm fixture")
  git("config", "commit.gpgsign", "false")
  writeFileSync(join(root, file), "one\n")
  git("add", file)
}
const hasCommit = (root) => {
  try { execFileSync("git", ["rev-parse", "--verify", "HEAD"], { cwd: root, stdio: "pipe" }); return true } catch { return false }
}
/** 字节零变的判据（AC-3 / AC-4）：拒后目标档的 sha256 不变。 */
const sha256 = (p) => createHash("sha256").update(readFileSync(p)).digest("hex")

test("CLI 12-1 台账有在途行、本笔不传 ledger ⇒ 拒（§2.3 串 + 用法句 + 一次建批指引），文件零改", async () => {
  const root = makeProject("12-1")
  const live = await hangLiveRow(root, "12-1-batch")
  const target = join(root, "thincoder-core/agent/x.mjs")
  const res = await writeTo(agentOf(root), target)
  assert.equal(res.ok, false)
  assert.match(res.result, /write refused — ledger row not bound: no ledger number on this call\./)
  assert.ok(res.result.includes('Pass project:'), "拒文点出项目输入（唯一教学面）")
  assert.ok(res.result.includes('ledger:"#N"'), "拒文点出台账号输入（两个输入一次点出）")
  assert.ok(res.result.includes(`In-flight rows in this project's ledger right now: #${live}`), "拒文列出本项目的可带号")
  // B3（TOOLS.md §6.29 B3）：建批指引首选 `batch create` 一次建成——目标形逐字，且不再诱导两步往返
  assert.ok(res.result.includes("If none is in flight, open the batch first — batch({action:\"create\", path:\"<repo>/docs/batches/<batch>-<topic>.md\", topic, source, board}) creates the row and record in one call."),
    "拒文给一次建批的路径（path / topic / source / board 四件都在）")
  assert.ok(res.result.includes('To take over an existing row, query its number first and pass ledger:"#N".'), "接管既有行才先查号")
  assert.ok(res.result.includes('If the same face has unsettled rows, pass newDebt:"<why this is a new debt>" or take one over with ledger:"#N".'), "同面未决行的两条出路都在")
  assert.ok(!res.result.includes('ledger({action:"add", title, kind, cwd:'), "拒文不再把 ledger add 列为第一步（旧两步指引已退场）")
  assert.equal(existsSync(target), false, "文件零改")
})

test("CLI 12-2 带 ledger:\"#A\" 与 ledger:\"A\" 两形写同一目标 ⇒ 都照写（# 可省，两形同判）", async () => {
  const root = makeProject("12-2")
  const live = await hangLiveRow(root, "12-2-batch")
  const agent = agentOf(root)
  const doc = join(root, "docs/batches/note.md") // docRoot 内：面不参与判据
  const first = await run(agent, toolMapOf(root), "write", { path: doc, content: "# note\n", ledger: `#${live}` })
  assert.equal(first.ok, true, first.result)
  assert.equal(readFileSync(doc, "utf8"), "# note\n")
  const second = await run(agent, toolMapOf(root), "write", { path: doc, content: "# note 2\n", ledger: `${live}` })
  assert.equal(second.ok, true, second.result)
  assert.equal(readFileSync(doc, "utf8"), "# note 2\n", "同一号两形同判")
})

test("CLI 12-3 已核销 ∥ 不存在 ∥ 待讨论 三个号各写一笔 ⇒ 三拒，拒文分别点名，文件零改", async () => {
  const root = makeProject("12-3")
  const agent = agentOf(root)
  const target = join(root, "thincoder-core/agent/s.mjs")
  const archived = rowWithStatus(root, "已核销")
  const pending = rowWithStatus(root, "待讨论")
  const cases = [
    [archived, /is "已核销" — only a 在途 row carries writes/],
    [999999, /row #999999 does not exist in this project's ledger/],
    [pending, /is "待讨论" — only a 在途 row carries writes/],
  ]
  for (const [id, pattern] of cases) {
    const res = await run(agent, toolMapOf(root), "write", { path: target, content: "x\n", ledger: `#${id}` })
    assert.equal(res.ok, false, `#${id}`)
    assert.match(res.result, pattern, `#${id}`)
    assert.equal(existsSync(target), false, `#${id}：文件零改`)
  }
})

test("CLI 12-4 台账库不可读 ∥ 项目根 manifest 坏 JSON ⇒ 两态都拒，拒文带原始错误", async () => {
  const broken = makeProject("12-4a")
  mkdirSync(join(ledgerDir, `${ledgerKey(broken)}.db`), { recursive: true }) // 库位是目录 ⇒ 打不开
  const t1 = join(broken, "thincoder-core/agent/z.mjs")
  const res = await run(agentOf(broken), toolMapOf(broken), "write", { path: t1, content: "x\n", ledger: "#1" })
  assert.equal(res.ok, false)
  assert.match(res.result, /ledger row not bound/)
  assert.match(res.result, /\(ledger unreadable — /)
  assert.equal(existsSync(t1), false, "文件零改")

  // 第二态：根推得出而 manifest 不可用（坏 JSON）——不是出辖（出辖 = 祖先链推不出 manifest），照拒
  const bad = makeProject("12-4b")
  writeFileSync(join(bad, "PROJECT-MANIFEST.json"), '{ "version": 1,')
  const t2 = join(bad, "thincoder-core/agent/w.mjs")
  const res2 = await run(agentOf(bad), toolMapOf(bad), "write", { path: t2, content: "x\n", ledger: "#1" })
  assert.equal(res2.ok, false, "有根但不可用 ≠ 没根：照拒")
  assert.match(res2.result, /\(ledger unreadable — /)
  assert.equal(existsSync(t2), false, "文件零改")
})

test("CLI 12-5 项目之外没有判据点 ⇒ 拒；工作区根无声明 ⇒ 拒；带子项目声明 + 在途号 ⇒ 放行；仓内缺号 ⇒ 拒；project 指容器根 ⇒ 同拒", async () => {
  const root = makeProject("12-5")
  const outside = mkdtempSync(join(tmpdir(), "wg-out-")) // 仓外临时目录：祖先链无 manifest
  fixtures.push(outside)
  const agent = agentOf(root)
  const outFile = join(outside, "x.mjs")
  const out = await writeTo(agent, outFile, "export const ok = 1\n")
  assert.equal(out.ok, false, "项目之外没有判据点")
  assert.match(out.result, /declared project is not a project/)
  assert.equal(existsSync(outFile), false, "文件零改")
  const insideTarget = join(root, "test/integration/x.test.mjs")
  const res = await writeTo(agent, insideTarget)
  assert.equal(res.ok, false, "同一会话写仓内目标：没有号 ⇒ 拒")
  assert.match(res.result, /no ledger number on this call/)
  assert.equal(existsSync(insideTarget), false, "文件零改")
  // 容器根（夹具项目的父目录，自身无 manifest）作为声明 ⇒ 同拒：不是项目与不是这个项目是两种拒
  const containerRoot = dirname(root)
  const viaBash = await run(agent, toolMapOf(root), "bash", { command: "echo hi", project: containerRoot, ledger: "#1" })
  assert.equal(viaBash.ok, false)
  assert.match(viaBash.result, /declared project is not a project/)
  assert.doesNotMatch(viaBash.result, /\bhi\b/, "命令零执行")

  // 工作区根窄口（设计档 §2.3.1）：锚 = 自身无 manifest 的工作区根，其下一个带 manifest 的子项目
  const ws = mkdtempSync(join(tmpdir(), "wg-ws-12-5-"))
  fixtures.push(ws)
  const sub = makeProjectAt(join(ws, "sub"))
  const wsAgent = agentOf(ws)
  const rootFile = join(ws, "AGENTS.md")
  const bare = await run(wsAgent, toolMapOf(ws), "write", { path: rootFile, content: "# ws\n" })
  assert.equal(bare.ok, false, "工作区根目标无声明 ⇒ 拒（声明是口的必要条件）")
  assert.match(bare.result, /declared project is not a project/)
  assert.match(bare.result, /unknown — no project owns this write's target/, "清单单位不写 none")
  assert.equal(existsSync(rootFile), false, "文件零改")

  const wsRow = rowWithStatus(sub, "在途")
  const opened = await run(wsAgent, toolMapOf(ws), "write", { path: rootFile, content: "# ws\n", project: sub, ledger: `#${wsRow}` })
  assert.equal(opened.ok, true, opened.result)
  assert.equal(readFileSync(rootFile, "utf8"), "# ws\n", "字节落盘：锚子树内 ∧ 锚下有子项目 ∧ 显式声明三条同时成立")
})

test("CLI 12-16 窄口的两条不成之路：目标在锚外 ∥ 锚下无子项目 ⇒ 各落自己那句拒", async () => {
  // ① 目标在锚外：声明合法（锚下确有带 manifest 的子项目），但目标不在锚子树内
  const ws = mkdtempSync(join(tmpdir(), "wg-12-16a-"))
  fixtures.push(ws)
  const sub = makeProjectAt(join(ws, "sub"))
  const live = rowWithStatus(sub, "在途")
  const outside = mkdtempSync(join(tmpdir(), "wg-12-16-out-"))
  fixtures.push(outside)
  const outFile = join(outside, "y.md")
  const resA = await run(agentOf(ws), toolMapOf(ws), "write", { path: outFile, content: "x\n", project: sub, ledger: `#${live}` })
  assert.equal(resA.ok, false, "锚外目标：窄口不开")
  assert.match(resA.result, /target is outside the session anchor's subtree — the workspace-root opening does not apply/)
  assert.match(resA.result, /unknown — no project owns this write's target/, "清单单位指目标，不指号")
  assert.doesNotMatch(resA.result, /declared project is not a project/, "两支互不顶替：声明本身是合法的")
  assert.equal(existsSync(outFile), false, "文件零改")

  // ② 锚下无带 manifest 的直接子目录（只有裸 git 子目录 + 其下一个深层项目）
  const ws2 = mkdtempSync(join(tmpdir(), "wg-12-16b-"))
  fixtures.push(ws2)
  mkdirSync(join(ws2, "bare-git", ".git"), { recursive: true })
  const deep = makeProjectAt(join(ws2, "bare-git", "deep"))
  const live2 = rowWithStatus(deep, "在途")
  const wsFile = join(ws2, "AGENTS.md")
  const resB = await run(agentOf(ws2), toolMapOf(ws2), "write", { path: wsFile, content: "x\n", project: deep, ledger: `#${live2}` })
  assert.equal(resB.ok, false, "锚下无带 manifest 的直接子目录：窄口不开")
  assert.match(resB.result, /the session anchor carries no sub-project — the workspace-root opening does not apply/)
  assert.match(resB.result, /unknown — no project owns this write's target/)
  assert.equal(existsSync(wsFile), false, "文件零改")
})

test("CLI 12-17 跨仓目标：写方 writableRepos 表内 ⇒ 用本仓在途号放行、本仓台账零变、目标仓账零写；表外 ⇒ 拒并点名 writableRepos", async () => {
  mkdirSync(SCRATCH, { recursive: true })
  const container = mkdtempSync(join(SCRATCH, "lk-cross-12-17-"))
  fixtures.push(container)
  const w = makeProjectAt(join(container, "W")) // 写方 = 会话锚
  const b = makeProjectAt(join(container, "B")) // 目标：另一个项目（自带 manifest，`R ≠ W`）
  /** 写方的 manifest：`writableRepos` 按本格要测的那一面写；改写后清声明缓存（声明按档路径缓存）。 */
  const declareWritable = (list) => {
    writeFileSync(join(w, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" }, index: { writableRepos: list } }, null, 2))
    clearDeclarationCache()
  }
  const agent = agentOf(w)
  const tools = toolMapOf(w)
  const live = rowWithStatus(w, "在途")
  const beforeW = JSON.stringify(ledgerQuery({ cwd: w, boundary: w }))
  const beforeB = JSON.stringify(ledgerQuery({ cwd: b, boundary: b }))

  // 表内：目标属另一个项目，号仍是本仓在途行 ⇒ 放行（判据点换成写方，字节落盘）
  declareWritable(["../B"])
  const target = join(b, "src/x.mjs")
  const ok = await run(agent, tools, "write", { path: target, content: "export const x = 1\n", project: w, ledger: `#${live}` })
  assert.equal(ok.ok, true, ok.result)
  assert.equal(readFileSync(target, "utf8"), "export const x = 1\n", "字节落盘")
  assert.equal(JSON.stringify(ledgerQuery({ cwd: w, boundary: w })), beforeW, "本仓台账零变（行仍 在途）")
  assert.equal(JSON.stringify(ledgerQuery({ cwd: b, boundary: b })), beforeB, "目标仓账零写")

  // AC-3 第二半：表内 + 号换成 W 的无写权态行 ⇒ 拒、点名状态词、目标字节零变（sha256）
  const landed = sha256(target)
  const archived = rowWithStatus(w, "已核销")
  const notInFlight = await run(agent, tools, "write", { path: target, content: "export const x = 3\n", project: w, ledger: `#${archived}` })
  assert.equal(notInFlight.ok, false, "口子不豁免号：表内但号非在途 ⇒ 拒")
  assert.match(notInFlight.result, /is "已核销" — only a 在途 row carries writes/, "先修号：点名状态词")
  assert.equal(sha256(target), landed, "目标字节零变（sha256）")

  // 表外：同一目标、同一条本仓在途号，声明表不含它 ⇒ 拒，新串点名 writableRepos 与目标
  declareWritable(["../plain"])
  const before = sha256(target)
  const deniedSame = await run(agent, tools, "write", { path: target, content: "export const x = 2\n", project: w, ledger: `#${live}` })
  assert.equal(deniedSame.ok, false, "同一目标表外也照拒")
  assert.equal(sha256(target), before, "目标字节零变（sha256）")
  const outside = join(b, "src/y.mjs")
  const denied = await run(agent, tools, "write", { path: outside, content: "y\n", project: w, ledger: `#${live}` })
  assert.equal(denied.ok, false, "表外照拒")
  assert.match(denied.result, /target belongs to another project and index\.writableRepos of the declared project does not declare it/)
  assert.ok(denied.result.includes(JSON.stringify(outside)), "拒文点名目标")
  assert.match(denied.result, /unknown — the declared project does not own this write's target/, "清单单位指声明与目标，不指号")
  assert.equal(existsSync(outside), false, "文件零改")

  // 负向锁：同夹具不带 project ⇒ 与本批前逐字同（号在目标项目的账上判）
  declareWritable(["../B"])
  const noProject = await run(agent, tools, "write", { path: join(b, "src/z.mjs"), content: "z\n", ledger: `#${live}` })
  assert.equal(noProject.ok, false)
  assert.match(noProject.result, /does not exist in this project's ledger/, "不声明写方 ⇒ 走现行路")
  assert.doesNotMatch(noProject.result, /index\.writableRepos/, "旧串一字不改")
  assert.equal(existsSync(join(b, "src/z.mjs")), false, "文件零改")

  // AC-10 那一格（KD-X8）：目标仓 B 的账上挂一条与 W 在途行**同号**的在途行 ⇒ 仍拒。判序 ② 先于号判、
  // B 的账根本不读；改前这一笔会回落到 B 的账上、查到同号在途即放行——两读不同，差的就是那一条回落臂。
  declareWritable(["../plain"])
  const sameNumberInB = rowWithStatus(b, "在途")
  assert.equal(sameNumberInB, live, "夹具：两本账各有同号在途行（台账号按项目各自编号）")
  const sameNumber = await run(agent, tools, "write", { path: join(b, "src/w.mjs"), content: "w\n", project: w, ledger: `#${live}` })
  assert.equal(sameNumber.ok, false, "目标仓账上有同号在途行也不授权（重号不算声明）")
  assert.match(sameNumber.result, /target belongs to another project and index\.writableRepos of the declared project does not declare it/)
  assert.match(sameNumber.result, /unknown — the declared project does not own this write's target/)
  assert.equal(existsSync(join(b, "src/w.mjs")), false, "文件零改")
})

test("CLI 12-18 窄口 × 写权表：表空 ⇒ 放行（现状）；表非空而不含目标 ⇒ 拒并点名 writableRepos；表含目标 ⇒ 放行（判序 ①）", async () => {
  // 锚 = 工作区根（自身无 manifest、下有带 manifest 的子项目 W）；目标 = 锚根一份非项目档 ⇒ 取不到项目根
  const ws = mkdtempSync(join(tmpdir(), "wg-12-18-"))
  fixtures.push(ws)
  const w = makeProjectAt(join(ws, "W"))
  mkdirSync(join(ws, "elsewhere"), { recursive: true })
  const agent = agentOf(ws)
  const tools = toolMapOf(ws)
  const live = rowWithStatus(w, "在途")
  const declareWritable = (list) => {
    writeFileSync(join(w, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" }, index: { writableRepos: list } }, null, 2))
    clearDeclarationCache()
  }

  // ① 表为空（未声明）⇒ 窄口维持现状：放行、字节落盘（2026-11-08 那一格不动）
  const first = join(ws, "ws-empty.md")
  const opened = await run(agent, tools, "write", { path: first, content: "empty-table\n", project: w, ledger: `#${live}` })
  assert.equal(opened.ok, true, opened.result)
  assert.equal(readFileSync(first, "utf8"), "empty-table\n", "表为空 ⇒ 窄口照开")

  // ② 表非空而不含该目标 ⇒ 本格不开，落窄口自己那一句（与「属另一个项目」那句分开写）
  declareWritable(["../elsewhere"])
  const second = join(ws, "ws-outside.md")
  const blocked = await run(agent, tools, "write", { path: second, content: "outside\n", project: w, ledger: `#${live}` })
  assert.equal(blocked.ok, false, "表非空 ⇒ 窄口不开")
  assert.match(blocked.result, /target is not covered by index\.writableRepos of the declared project — the workspace-root opening does not apply/)
  assert.ok(blocked.result.includes(JSON.stringify(second)), "拒文点名目标")
  assert.match(blocked.result, /unknown — no project owns this write's target/, "问题在目标与声明，不在号")
  assert.doesNotMatch(blocked.result, /target belongs to another project/, "这一支 R 不存在，不冒用第一句")
  assert.equal(existsSync(second), false, "文件零改")

  // ③ 把锚根目录写进表 ⇒ 放行（放行由判序 ① 决定：表内目标不经窄口）
  declareWritable([".."])
  const third = join(ws, "ws-inside.md")
  const reopened = await run(agent, tools, "write", { path: third, content: "inside\n", project: w, ledger: `#${live}` })
  assert.equal(reopened.ok, true, reopened.result)
  assert.equal(readFileSync(third, "utf8"), "inside\n", "表含目标 ⇒ 字节落盘")
})

test("CLI 12-19 适用面：execute 的 workdir 指向表外另一项目 ⇒ 拒且零副作用；写进表内 ⇒ 放行", async () => {
  mkdirSync(SCRATCH, { recursive: true })
  const container = mkdtempSync(join(SCRATCH, "lk-apply-12-19-"))
  fixtures.push(container)
  const w = makeProjectAt(join(container, "W")) // 写方 = 会话锚
  const r = makeProjectAt(join(container, "R")) // 目标：另一个项目
  mkdirSync(join(container, "plain"), { recursive: true })
  const declareWritable = (list) => {
    writeFileSync(join(w, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" }, index: { writableRepos: list } }, null, 2))
    clearDeclarationCache()
  }
  const agent = agentOf(w)
  const tools = toolMapOf(w)
  const live = rowWithStatus(w, "在途")
  const sameNumberInR = rowWithStatus(r, "在途")
  assert.equal(sameNumberInR, live, "夹具：目标仓账上挂着与写方同号的在途行（回落臂要的正是它）")
  const marker = join(r, "ran.txt")
  const script = `const fs = await import("node:fs"); fs.writeFileSync(${JSON.stringify(marker)}, "ran")`
  const rManifestBefore = sha256(join(r, "PROJECT-MANIFEST.json"))

  // 表非空而不含 R ⇒ 拒：脚本零执行（改前这一笔按 R 的账判 ⇒ 同号在途即放行）
  declareWritable(["../plain"])
  const execDenied = await run(agent, tools, "execute", { code: script, workdir: r, project: w, ledger: `#${live}` })
  assert.equal(execDenied.ok, false, "execute 的 workdir 属表外另一项目 ⇒ 拒")
  assert.match(execDenied.result, /target belongs to another project and index\.writableRepos of the declared project does not declare it/)
  assert.equal(existsSync(marker), false, "脚本零执行")
  assert.equal(sha256(join(r, "PROJECT-MANIFEST.json")), rManifestBefore, "目标目录零副作用（R 的 manifest 字节零改，sha256）")

  // 把 R 写进表 ⇒ 同一笔放行（判序 ①：号仍在写方账上判）
  declareWritable(["../R"])
  const execOk = await run(agent, tools, "execute", { code: script, workdir: r, project: w, ledger: `#${live}` })
  assert.equal(execOk.ok, true, execOk.result)
  assert.equal(existsSync(marker), true, "表内 ⇒ 脚本执行")
})

test("CLI 12-6 搜索 / 索引面接名单单源：vendor · node_modules · dist 内的文件不再命中", async () => {
  const root = makeProject("12-6")
  const marker = "NEEDLE_MARKER_X9"
  writeFileSync(join(root, "vendor/needle.mjs"), `// ${marker}\n`)
  writeFileSync(join(root, "node_modules/pkg/needle.mjs"), `// ${marker}\n`)
  writeFileSync(join(root, "dist/needle.mjs"), `// ${marker}\n`)
  const ctx = { agent: { cwd: root }, cwd: root }
  const pruned = await grepTool.execute({ pattern: marker, path: root }, ctx)
  assert.equal(pruned, "(no matches)", "名单合并后 vendor / node_modules / dist 都被剪")
  writeFileSync(join(root, "visible.txt"), `${marker}\n`) // 对照面：普通文件照常可搜
  const hit = await grepTool.execute({ pattern: marker, path: root }, ctx)
  assert.match(hit, /visible\.txt/)
  assert.doesNotMatch(hit, /needle\.mjs/)
})

test("CLI 12-7 bash：无在途行跑 git status ⇒ 拒、命令零执行；挂行后带号跑同一条 ⇒ 执行并回输出", async () => {
  const root = makeProject("12-7")
  makeRepo(root, "keep.txt")
  const agent = agentOf(root)
  const denied = await run(agent, toolMapOf(root), "bash", { command: "git status", project: root })
  assert.equal(denied.ok, false, "只读命令与写命令同判——不按命令内容分类")
  assert.match(denied.result, /no ledger number on this call/)
  assert.doesNotMatch(denied.result, /On branch|No commits yet/, "命令零执行、无输出")

  const live = rowWithStatus(root, "在途")
  const ok = await run(agent, toolMapOf(root), "bash", { command: "git status", project: root, ledger: `#${live}` })
  assert.equal(ok.ok, true, ok.result)
  assert.match(ok.result, /On branch|No commits yet/, "带号即执行并回输出")
})

test("CLI 12-8 子代理（depth > 0）不带号 ∥ 带号写同一目标 ⇒ 本门不拒（号来自绑定批档档头）", async () => {
  const root = makeProject("12-8")
  const child = {
    cwd: root, planMode: false, autoApprove: true, config: { agent: { engineering: true } },
    _role: "eng-coder", _engDesignReviewed: true, _engTaskAuthorized: true,
  }
  const noNumber = join(root, "thincoder-core/agent/k1.mjs")
  const first = await run(child, toolMapOf(root), "write", { path: noNumber, content: "x\n" }, 1)
  assert.equal(first.ok, true, `子代理不带号：本门不核（拒因若现只来自它自己的 token 门）— ${first.result}`)
  const withNumber = join(root, "thincoder-core/agent/k2.mjs")
  const second = await run(child, toolMapOf(root), "write", { path: withNumber, content: "x\n", ledger: "#999999" }, 1)
  assert.equal(second.ok, true, "子代理带一个不存在的号：本门也不核")
})

test("CLI 12-9 git 整把不在写门：台账无在途行 add + commit 照常生效；同一会话里写盘工具缺号仍拒", async () => {
  const root = makeProject("12-9")
  makeRepo(root, "a.txt")
  const agent = agentOf(root)
  assert.equal(ledgerQuery({ cwd: root, boundary: root }).length, 0, "夹具：台账里确实没有任何行")

  const added = await run(agent, toolMapOf(root), "git", { action: "add", path: "a.txt" })
  assert.equal(added.ok, true, added.result)
  const committed = await run(agent, toolMapOf(root), "git", { action: "commit", message: "rtm probe", path: "a.txt" })
  assert.equal(committed.ok, true, committed.result)
  assert.equal(hasCommit(root), true, "提交生效")
  const log = await run(agent, toolMapOf(root), "git", { action: "log", count: 5 })
  assert.match(log.result, /rtm probe/, "git log 出现该 message")

  const target = join(root, "thincoder-core/agent/x.mjs")
  const denied = await writeTo(agent, target)
  assert.equal(denied.ok, false, "同一会话：写盘工具缺号仍拒（门没被拆）")
  assert.match(denied.result, /no ledger number on this call/)
  assert.equal(existsSync(target), false, "文件零改")
})

test("CLI 12-10 名单只判审批，与写门无关：台账无在途行跑 git status ⇒ 照跑回输出", async () => {
  const root = makeProject("12-10")
  makeRepo(root, "a.txt")
  const status = await run(agentOf(root), toolMapOf(root), "git", { action: "status" })
  assert.equal(status.ok, true, status.result)
  assert.match(status.result, /Staged \(1\)/, "名单只判审批，与写门无关")
  assert.equal(ledgerQuery({ cwd: root, boundary: root }).length, 0, "本夹具台账里确实没有任何行")
})

test("CLI 12-12 会话 cwd = 容器根：不带 project ⇒ 拒、命令零执行；带 project 仍缺号 ⇒ 拒；带 project + 在途号 ⇒ 执行", async () => {
  mkdirSync(SCRATCH, { recursive: true })
  const container = mkdtempSync(join(SCRATCH, "lk-container-12-12-"))
  fixtures.push(container)
  makeRepo(container, "keep.txt") // 让 `git status` 在容器根有可跑的面（不含 manifest——容器根本不是项目）
  const proj = makeProjectAt(join(container, "proj"))
  const agent = agentOf(container)
  const tools = toolMapOf(container)

  const noProject = await run(agent, tools, "bash", { command: "git status" })
  assert.equal(noProject.ok, false, "bash 没有定位参数 ⇒ 判据点只能靠声明（会话锚只定界，不判账）")
  assert.match(noProject.result, /no project on this call/)
  assert.match(noProject.result, /Pass project:/, "拒文点出项目输入")
  assert.match(noProject.result, /ledger:"#N"/, "拒文点出台账号输入")
  assert.match(noProject.result, /In-flight rows in this project's ledger right now: unknown/, "无项目时清单位不写 none（那是另一句话）")
  assert.doesNotMatch(noProject.result, /On branch/, "命令零执行")

  const noNumber = await run(agent, tools, "bash", { command: "git status", project: proj })
  assert.equal(noNumber.ok, false, "声明补位后仍缺号")
  assert.match(noNumber.result, /no ledger number on this call/)

  const live = rowWithStatus(proj, "在途")
  const exec = await run(agent, tools, "bash", { command: "git status", project: proj, ledger: `#${live}` })
  assert.equal(exec.ok, true, exec.result)
  assert.match(exec.result, /On branch/, "执行并回输出")

  // `memory` 落 project 层：不带 project ⇒ 拒（execute 不被调用——stub 只用于撞门）
  const memoryStub = { name: "memory", parameters: { type: "object", properties: { action: { type: "string" } }, required: ["action"] }, readonly: false, async execute() { throw new Error("gate did not deny — memory execute must not run") } }
  const memoryTools = new Map([["memory", memoryStub]])
  const memoryDenied = await run(agent, memoryTools, "memory", { action: "put", layer: "project", title: "t", content: "c" })
  assert.equal(memoryDenied.ok, false)
  assert.match(memoryDenied.result, /no project on this call/)
  assert.equal(existsSync(join(proj, ".thincoder/memory")), false, "项目内 memory 目录零写")
})

test("CLI 12-13 项目声明与台账对不上：声明容器根 ⇒ 不是项目；声明 A、号取自 B ⇒ 号不在这个项目的账上", async () => {
  mkdirSync(SCRATCH, { recursive: true })
  const container = mkdtempSync(join(SCRATCH, "lk-container-12-13-"))
  fixtures.push(container)
  const projA = makeProjectAt(join(container, "A"))
  const projB = makeProjectAt(join(container, "B"))
  const agent = agentOf(container)
  const tools = toolMapOf(container)

  const liveA = rowWithStatus(projA, "在途")
  const notAProject = await run(agent, tools, "bash", { command: "echo hi", project: container, ledger: `#${liveA}` })
  assert.equal(notAProject.ok, false)
  assert.match(notAProject.result, /declared project is not a project/, "容器根自身无 manifest ⇒ 不是项目")
  assert.match(notAProject.result, /Pass project:/, "拒文同时点出 project")
  assert.match(notAProject.result, /ledger:"#N"/, "拒文同时点出 ledger")
  assert.doesNotMatch(notAProject.result, /\bhi\b/, "命令零执行")

  // 台账按项目根分库 ⇒ 两边各自从 #1 起算；先把 B 的号推到 A 的号之外，测的才是「号不在这个账上」
  for (let i = 0; i < 5; i++) ledgerAdd({ cwd: projB, row: { kind: "tech_todo", title: `垫号 ${i}` }, boundary: projB })
  const liveBFar = rowWithStatus(projB, "在途")
  assert.notEqual(liveBFar, liveA, "夹具：两个号不同（否则测的是同一个号）")
  const wrongLedger = await run(agent, tools, "bash", { command: "echo hi", project: projA, ledger: `#${liveBFar}` })
  assert.equal(wrongLedger.ok, false)
  assert.match(wrongLedger.result, /does not exist in this project's ledger/, "号只在其所属项目的账上成立")
  assert.match(wrongLedger.result, /Pass project:/)
})

test("CLI 12-14 会话 cwd = 项目子目录：声明项目根 + 在途号 ⇒ 放行（声明根含会话锚）；不带 project ⇒ 拒", async () => {
  mkdirSync(SCRATCH, { recursive: true })
  const proj = makeProjectAt(mkdtempSync(join(SCRATCH, "lk-sub-12-14-")))
  makeRepo(proj, "keep.txt")
  const sub = join(proj, "thincoder-cli") // 启动形：cd thincoder/thincoder-cli && node bin/thincoder.cjs
  const agent = agentOf(sub)
  const tools = toolMapOf(sub)
  const live = rowWithStatus(proj, "在途")

  const ok = await run(agent, tools, "bash", { command: "git status", project: proj, ledger: `#${live}` })
  assert.equal(ok.ok, true, ok.result)
  assert.match(ok.result, /On branch/, "声明根含会话锚 ⇒ (a) 支放行，命令执行并回输出")

  const noProject = await run(agent, tools, "bash", { command: "git status", ledger: `#${live}` })
  assert.equal(noProject.ok, false, "同一会话不带 project ⇒ 拒（会话锚不充当判据点）")
  assert.match(noProject.result, /no project on this call/)
  assert.doesNotMatch(noProject.result, /On branch/, "命令零执行")
})

test("CLI 12-15 manifest 整把不在写门（决策 44）：台账无在途行时 write ∥ init ∥ read 都不带项目不带号照跑；同一时刻 write ∥ edit 一份文档不带号仍拒；带一个已从 schema 删的 ledger 与不带同判", async () => {
  const root = makeProject("12-15")
  const agent = agentOf(root)
  const tools = toolMapOf(root)
  const manPath = join(root, "PROJECT-MANIFEST.json")

  // 格 1：write 不带项目不带号 ⇒ 落盘成功、manifest 可读回新值（台账无在途行——本门不再问号）
  const wrote = await run(agent, tools, "manifest", { action: "write", target: root, key: "phase", value: "production" })
  assert.equal(wrote.ok, true, `台账无在途行时 manifest write 照跑：${wrote.result}`)
  assert.match(String(wrote.result), /manifest write: set phase = "production"/)
  assert.equal(JSON.parse(readFileSync(manPath, "utf8")).phase, "production", "PROJECT-MANIFEST.json 可读回新值")

  // 格 2：带一个已从 schema 删的 ledger ⇒ 与不带逐字同判（未声明的键没有一处读它）
  const withLedger = await run(agent, tools, "manifest", { action: "write", target: root, key: "phase", value: "production", ledger: "#999999" })
  assert.equal(withLedger.ok, wrote.ok, "带号与不带同判（ok 相同）")
  assert.equal(String(withLedger.result), String(wrote.result), "与不带逐字同判——不以「真能落盘」作判据（那测的是运行时对未声明键的处置）")

  // 格 3：同一时刻写 ∥ 改一份文档不带号 ⇒ 仍拒（"write" ∥ "edit" 两形同判——只开了这一口）
  const doc = join(root, "docs/batches/note.md")
  const docDenied = await run(agent, tools, "write", { path: doc, content: "# note\n" })
  assert.equal(docDenied.ok, false, "写文档不带号仍拒——写门没被拆")
  assert.match(String(docDenied.result), /no ledger number on this call/)
  assert.equal(existsSync(doc), false, "文件零改")
  writeFileSync(doc, "# note\n") // 夹具直接落一份现成档（不经被测门），让 `edit` 有可改的锚
  const editDenied = await run(agent, tools, "edit", { path: doc, old_string: "# note", new_string: "# note 2" })
  assert.equal(editDenied.ok, false, "改文档不带号仍拒（同一判据不分工具）")
  assert.match(String(editDenied.result), /no ledger number on this call/)
  assert.equal(readFileSync(doc, "utf8"), "# note\n", "字节零改")

  // 格 4：read 照跑；init 在祖先链无 manifest 的新目录照跑落盘（原「取根豁免」随出集退场）
  const read = await run(agent, tools, "manifest", { action: "read", target: root })
  assert.equal(read.ok, true, read.result)
  assert.match(String(read.result), /^state=ok/)
  const outside = mkdtempSync(join(tmpdir(), "lk-init-12-15-out-"))
  fixtures.push(outside)
  const bare = await run(agent, tools, "manifest", { action: "init", target: outside })
  assert.equal(bare.ok, true, "台账无在途行的自举 init ⇒ 照跑（本门不问）", bare.result)
  assert.equal(existsSync(join(outside, "PROJECT-MANIFEST.json")), true, "PROJECT-MANIFEST.json 落盘在 target")
})

