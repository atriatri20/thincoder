/**
 * close-gate-fixture.mjs — `batch-close-gate.test.mjs` 的共享夹具（同一夹具形：每例各自独立起一份，用例之间不依赖执行序）。
 *
 * 为什么单独一档：用例只**调**夹具、不**定义**夹具，两者边界分得开——本档 180 行的常量 ∥ 临时项目 ∥ 真 git 仓 ∥
 * 回执读数助手从用例档整块抽到这里，用例档只改为 import 它（先例 = `test/integration/fixtures/*.mjs`）。
 * 本档**不被 runner 收集**（收集面 = `test/integration/*.test.mjs` 单层 glob，见 `test/run.mjs`），也不含任何 `test()`。
 *
 * 夹具 = 系统临时域（项目根 + 真 git 仓 + 六段批档；`mkdtempSync`——零落仓、可并发）。收口后的台账重锚
 * 经测试缝 `_setLedgerDirForTest` 导向临时目录（不碰真实用户数据目录）。
 */
import { execFileSync } from "node:child_process"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { removeTempDirBestEffort } from "../teardown.mjs"

// `ledger.mjs` 走动态导入：静态链入 `node:sqlite`（W8 契约——台账模块的消费侧一律动态取）。
const { _setLedgerDirForTest, _resetLedgerDirForTest } = await import("../../thincoder-core/ledger.mjs")

export const BATCH_REL = "docs/batches/fixture.md"
export const CLEAN_A = "docs/notes/clean-a.md"
export const CLEAN_B = "docs/notes/clean-b.md"
export const OUT_REL = "docs/notes/out-of-range.md" // 工作树内、范围外（不在触达账 ∧ 不在提交 diff）
export const DIRTY_REL = "docs/notes/dirty.md" // 笔域集内、含悬空指针
/** 夹具源档：§2 机读清单那一行指向它（在盘、远不过设计时线；`.mjs` 不进文档判集）。 */
export const PROBE_REL = "src/probe.mjs"
export const PROBE_TEXT = "// 夹具源档：§2 机读清单的那一行指向它\n"
/** 档头「一段一作者」映射（`batch` create 落骨架时写入）——收口面 `§N（作者：<角色>）` 的唯一来源。 */
export const MAPPING = "> 一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）"
/** 探针：带目录段、仓根相对、**不在批档根下**的悬空路径（7-6 / 7-8 共用）。
 *  为何不写裸名：判据只认带目录段的档名（裸名没有可找的位置、不判，`docs/core/design/DOC-CHECK.md` §3），
 *  裸名两行就守不住「命中落在批档自身 ∥ 本次写入文本」了。带目录段 ⇒ 照判 `档缺`（该行证的东西不变）。 */
export const OUTSIDE_DANGLING = "thincoder-core/tool-docs/NO-SUCH-DOC.md"
export const OWN_TEST_REL = "docs/batches/fixture.test.mjs" // 7-4：本批自己的单测档（同目录、批档名前缀）
export const OWN_VARIANT_REL = "docs/batches/fixture-extra.test.mjs" // 7-4：同前缀变体（盘上无 fixture-extra.md）

export const CLEAN = "# 干净档\n\n无指针。\n"
export const DIRTY = "# 脏档\n\n见 `docs/notes/missing-page.md`。\n" // 恰一条悬空指针

/** 台账库目录（临时域——收口重锚不落真实用户目录）。 */
export const ledgerDir = mkdtempSync(join(tmpdir(), "bcg-ledgerdir-"))
_setLedgerDirForTest(ledgerDir)

export const projects = []

/** depth-0 主 agent（`batch` 工具的 close 轨仅此身份放行）；`touched` = 父侧触达账。 */
export const parentCtx = (root, touched) => ({ depth: 0, agent: { cwd: root, _touchedFiles: touched, config: { agent: { engineering: true } } } })
/** 子代理（`eng-designer` ⇒ §2），目标是 spawn 绑定的批档（无 path 参数）；`touched` = 本席触达账。 */
export const designerCtx = (root, touched = []) => ({ depth: 1, agent: { cwd: root, _role: "eng-designer", _touchedFiles: touched, config: { agent: { engineering: true } } } })
export const depth0 = batchTool(null)
export const asDesigner = batchTool(BATCH_REL)

/** §2 机读清单块（三列形 = 本批起的形；`reading === null` ⇒ 两格旧形——7-19 前半要的就是「那一行没有第三列」）。 */
function machineListBlock(reading) {
  if (reading === null) {
    return ["**受影响文件（机读清单）**", "", "| 档 | 分拆方案 |", "|---|---|", `| \`${PROBE_REL}\` | — |`, ""]
  }
  return ["**受影响文件（机读清单）**", "", "| 档 | 分拆方案 | 行数 |", "|---|---|---|", `| \`${PROBE_REL}\` | — | ${reading} |`, ""]
}

/** 六段批档全文（`sha` ⇒ §1 落 `批起 sha = <sha>` 记入行；`sec1` = §1 正文；`sec5` = §5 正文；
 *  `reading` = §2 机读清单那一行第三列（缺省 = 快照上那一档的真读数 `1`；`null` ⇒ 两格旧形）；
 *  §2/§3/§4/§6 各有内容——close 的链门前置）。 */
export const record = (sha, { sec1 = "夹具讨论。", sec5 = "夹具实施。", reading = "1" } = {}) => [
  "# 夹具批 · 收口门范围",
  "",
  MAPPING,
  "> 编制：夹具 · 2026-10-25 · 来源 = 集成夹具。",
  "> 台账 = #1（夹具）。前情 = 无（独立批）。",
  "",
  "## §1 讨论（主 agent）",
  "**状态行**：🔄 进行中",
  "",
  sec1,
  "",
  `**批起 sha = ${sha}**`,
  "",
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "",
  "夹具任务。",
  "",
  // 收口前置门（档位臂）的前提：§2 必带机读清单，且列进去的档须在盘；那一行的第三列是**批起快照上**的读数
  // （本夹具的批起 sha 是一份祖先提交 ⇒ 收口臂按它取内容）。
  ...machineListBlock(reading),
  "## §3 设计评审（评审子代理）",
  "**状态行**：评审通过",
  "",
  "夹具评审。",
  "",
  "## §4 用户批准（主 agent）",
  "夹具批准。",
  "",
  "## §5 实施记录（eng-coder）",
  sec5,
  "",
  "## §6 验证与收口（父代理）",
  "夹具收口。",
  "",
].join("\n")

/** 夹具项目根（项目声明 + 批档/文档目录；不落盘任何真实仓内容）。 */
export function makeProject(tag) {
  const root = mkdtempSync(join(tmpdir(), `bcg-${tag}-`))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev" }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "docs/notes"), { recursive: true })
  // 夹具源档：§2 机读清单那一行指向它（真实在盘、远不过设计时线；`.mjs` 不进文档判集）。
  mkdirSync(join(root, "src"), { recursive: true })
  writeFileSync(join(root, PROBE_REL), PROBE_TEXT)
  return root
}

/**
 * 真 git 仓：空基提交 → 取**批起快照**（建档那一刻工作树的形状）→ 写批档（§1 记入基 sha）+ 本批两档 → 提交。
 * 于是提交 diff 腿恒 = 批档 ＋ `CLEAN_A` ＋ `CLEAN_B`（取材面含批档自身；收口判域里它被移出——
 * `docs/core/design/DOC-CHECK.md` §9）；触达账按例各自给
 * （7-1 一档 · 7-2 两档 · 7-3 两干净档＋脏档 · 7-6 零档）。
 *
 * `pre` = 建档**之前**就在盘、也进快照的档（`[rel, text][]`；7-24 / 7-25 的夹具设计档就住这里）——
 * 只有它们在快照里，本批对它们的那一笔修改才有「变更区」可言。
 */
export function gitRepo(root, { sec1, sec5, reading, pre = [] } = {}) {
  git(root, "init", "-q")
  for (const [rel, text] of pre) {
    mkdirSync(join(root, rel.split("/").slice(0, -1).join("/")), { recursive: true })
    writeFileSync(join(root, rel), text)
  }
  commit(root, "base")
  const sha = snapshot(root)
  writeFileSync(join(root, BATCH_REL), record(sha, { sec1, sec5, reading }))
  writeFileSync(join(root, CLEAN_A), CLEAN)
  writeFileSync(join(root, CLEAN_B), CLEAN)
  commit(root, "本批两档 + 批档")
  return sha
}

/** git 封装（`core.quotepath=false` 与受测实现同款——不关此开关时非 ASCII 档名会被引号转义，静默掉出清单）。 */
export const git = (cwd, ...argv) => execFileSync("git", [
  "-C", cwd, "-c", "user.email=fixture@example.test", "-c", "user.name=fixture",
  "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", "-c", "core.quotepath=false", ...argv,
], { encoding: "utf8" })
/** 同一条 git 腿 + 显式环境（快照那一跑要 `GIT_INDEX_FILE` 指向仓外的临时索引）。 */
const gitEnv = (cwd, env, ...argv) => execFileSync("git", [
  "-C", cwd, "-c", "user.email=fixture@example.test", "-c", "user.name=fixture",
  "-c", "commit.gpgsign=false", "-c", "core.autocrlf=false", "-c", "core.quotepath=false", ...argv,
], { encoding: "utf8", env: { ...process.env, ...env } })

/**
 * 批起快照（跑法单源 = `docs/core/design/DOC-CHECK.md` §8「快照怎么取」）：临时索引 `read-tree HEAD` → `add -A`
 * → `write-tree` → `commit-tree -p HEAD`。产物是**旁支**提交（不是 HEAD 的祖先）——收口门据此结构地认出
 * 「这是快照」而不是旧形批；临时索引住仓外，否则 `add -A` 会把索引自身收进树里。
 */
export function snapshot(root) {
  const dir = mkdtempSync(join(tmpdir(), "bcg-index-"))
  try {
    const env = { GIT_INDEX_FILE: join(dir, "index") }
    gitEnv(root, env, "read-tree", "HEAD")
    gitEnv(root, env, "add", "-A")
    const tree = gitEnv(root, env, "write-tree").trim()
    return gitEnv(root, env, "commit-tree", tree, "-p", "HEAD", "-m", "batch-start snapshot").trim()
  } finally {
    removeTempDirBestEffort(dir)
  }
}
export const commit = (cwd, message) => { git(cwd, "add", "-A"); git(cwd, "commit", "-q", "-m", message) }
export const rev = (cwd) => git(cwd, "rev-parse", "HEAD").trim()

/** 提交 diff 腿实读（本批 `.md` 全部——**含批档自身**：取材面不滤它，收口判域才滤）。 */
export const diffDocs = (root, sha) => git(root, "diff", "--name-only", sha, "HEAD")
  .split("\n").map((s) => s.trim())
  .filter((f) => f.endsWith(".md"))
  .sort()

/** 回执里的 **gate 段首行**（`[doc-check gate] <verdict> · 范围 N 档`）——RTM 那句「回执首行
 *  `DOC-CHECK GATE: …`」指的是本段首行，不是整条 close 回执的首行（后者是 `batch: §1 status line → …` 状态句）。 */
export const gateLineOf = (receipt) => {
  const line = receipt.split("\n").find((l) => l.startsWith("[doc-check gate] "))
  if (!line) throw new Error(`回执应携 gate 行，实际回执：${receipt}`)
  return line
}

/** §1 状态行原文（拒收口 ⇒ 逐字不变；放行 ⇒ 已收口）。 */
export const statusLineOf = (root) => readFileSync(join(root, BATCH_REL), "utf8").split("\n").find((l) => l.startsWith("**状态行**："))

/** 例前置：提交 diff 腿实读 = 批档自身 + 本批两档（否则「范围 N 档」只是空转读数——收口判域再减批档自身一档）。 */
export function assertBatchCommitted(root, sha) {
  assert.deepEqual(diffDocs(root, sha), [BATCH_REL, CLEAN_A, CLEAN_B], "提交 diff 腿应恰含批档自身 + 本批两档")
}

/** 收尾：台账缝复位 + 临时项目逐个尽力删（临时仓带 `.git`，句柄未即释时清理会抛 ⇒ 走助手）。 */
export function cleanupTemp() {
  _resetLedgerDirForTest()
  for (const p of projects) removeTempDirBestEffort(p)
  removeTempDirBestEffort(ledgerDir)
}
