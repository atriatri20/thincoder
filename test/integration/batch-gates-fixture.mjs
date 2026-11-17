/**
 * batch-gates-fixture.mjs — `batch-gates-reanchor.test.mjs` ∥ `batch-gates-ledger.test.mjs` 的共享夹具
 * （同一夹具形：每例各自独立起一份，用例之间不依赖执行序）。
 *
 * 为什么单独一档：拆档只搬用例与夹具，`CLI 14-N` 的号、断言与夹具入参一字不改。两档各自 `import` 本档、
 * 互不 `import`；各档在自己的进程里跑，`ledgerDir` 因此各建一份，互不串。
 * 本档**不被 runner 收集**（收集面 = `test/integration/*.test.mjs` 单层 glob，见 `test/run.mjs`），也不含任何 `test()`。
 *
 * 切点 = **这个决定由谁做**：批档状态门做的八例留 `batch-gates-reanchor.test.mjs`，台账行迁移规则做的六例
 * 迁 `batch-gates-ledger.test.mjs`；两边都用的夹具住本档，只在台账侧用的（写入工具映射、台账持锁注入）留在台账侧。
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
// `ledger.mjs` 走动态导入：静态链入 `node:sqlite`（W8 契约——台账模块的消费侧一律动态取）。
import { removeTempDirBestEffort } from "../teardown.mjs"
const { _setLedgerDirForTest, _resetLedgerDirForTest, ledgerAdd, ledgerQuery, ledgerUpdate } = await import("../../thincoder-core/ledger.mjs")

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..")
export const SCRATCH = join(ROOT, ".thincoder/tmp")
export { ledgerAdd, ledgerUpdate }

/** 台账库目录（临时域——收口重锚不落真实用户目录）。 */
mkdirSync(SCRATCH, { recursive: true })
export const ledgerDir = mkdtempSync(join(SCRATCH, "gates-ledger-"))
_setLedgerDirForTest(ledgerDir)

export const fixtures = []

/** 收尾：台账缝复位 + 临时项目逐个尽力删（`docs/core/design/TESTING.md` §4.6：清理失败不判红整档，但要可见）。 */
export function cleanupTemp() {
  _resetLedgerDirForTest()
  for (const p of fixtures) removeTempDirBestEffort(p)
  removeTempDirBestEffort(ledgerDir)
}

export const REC = "docs/batches/g.md"
export const UUID = "22222222-2222-2222-2222-222222222222"
export function makeProject(tag) {
  mkdirSync(SCRATCH, { recursive: true })
  const root = mkdtempSync(join(SCRATCH, `gt-${tag}-`))
  fixtures.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" } }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  mkdirSync(join(root, "thincoder-core"), { recursive: true })
  // 骨架模板的 §2 占位行点了一份真档（示例行）⇒ 夹具里让它真在盘：档名解得到，哪一面都不因它出一条悬空命中。
  mkdirSync(join(root, "thincoder-core/agent-tools"), { recursive: true })
  writeFileSync(join(root, "thincoder-core/agent-tools/batch-tier-gate.mjs"), "// 夹具：骨架模板示例行点名的档\n")
  return root
}
export const agentOf = (root, { designSlot = false } = {}) => {
  const agent = { cwd: root, config: { agent: { engineering: true } } }
  if (designSlot) { agent.planMode = false; agent.autoApprove = true; agent._engDesignTokens = new Map([["fx", `${UUID}:${Date.now() + 3600_000}`]]) }
  return agent
}
export const ctx0 = (root) => ({ depth: 0, agent: agentOf(root) })
export const parent = batchTool(null)
export const rowsOf = (root) => ledgerQuery({ cwd: root, boundary: root })
export const recOf = (root) => join(root, REC)
export const workOf = (root) => rowsOf(root).find((r) => r.task_book === REC && r.status === "在途")
/** 建一档并填 §2 / §3 段体 / §4 / §6（§3 结论由各例处置）。 */
export async function freshRecord(tag, { s3Body = true } = {}) {
  const root = makeProject(tag)
  await parent.execute({ action: "create", path: REC, topic: "g", source: "集成夹具" }, ctx0(root))
  let src = readFileSync(recOf(root), "utf8")
    .replace("## §2 批次任务与设计（eng-designer）", "## §2 批次任务与设计（eng-designer）\n\nbody")
    .replace(/## §4 用户批准（[^）]*）/, "## §4 用户批准（主 agent）\n\nbody")
    .replace("## §6 验证与收口（父代理）", "## §6 验证与收口（父代理）\n\nbody")
  if (s3Body) src = src.replace("## §3 设计评审（评审子代理）", "## §3 设计评审（评审子代理）\n\n轮次 1 的发现与结论。")
  writeFileSync(recOf(root), src)
  return root
}
/** 评审实例的 batch 工具（14-1 ∥ 14-8 用它写 `§3`）：夹具走**工程模式代码轨**——那一路没有设计结算
 *  可代写块，故 `§3` 通道与「随裁定行置位」都保留（`BATCH-RECORD.md` §4.3 ∥ §4.4）；工程设计轨的
 *  `§3` 对一切工具通道只读，夹具不能落在那条路上。 */
export const review = (root) => batchTool(REC, { review: true, reviewType: "code" })
/** 手工把一条新行推进到 `待核销`（收口后行已是归档终态 ⇒ 这是造「待核销」夹具的唯一合法路）。 */
export const pushToSettling = (root, title) => {
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title, task_book: REC, trigger: "归批", evidence: "工作证据" }, boundary: root })
  for (const s of ["待设计", "在途", "待核销"]) ledgerUpdate({ cwd: root, id, patch: { status: s }, boundary: root })
  return id
}
