/*
 * batch-edit-spec-section.test.mjs — 集成用例 7-10（RTM CLI 端故事 7「收口只判本批改过的档」；
 * 回指 = 设计档 §4.19「规范段就地改」∥ §4.8 BR-77 · BR-78 ∥ 台账 `#1990`）。
 *
 * 业务入口 = 真 `batch` 工具的设计席 `edit` 通道（`batchTool(batchDoc)` + eng-designer 身份）——
 * 不直调内部区间函数。它答的业务问题：**在飞批档 §2 上一条已作废的判据，能就地换掉吗**
 * （本批起因 = `docs/batches/2026-11-02-review-requires-batch.md` §2 验收表留着已作废判据，
 * 实施席照表落笔会把已删的分支原样写回来）。
 *
 * 断言只看业务可观察结果：§2 里那一行被换掉、其余行逐字节不变；锚不唯一 ⇒ 拒，且档字节一字不动。
 * 复跑（cwd = 仓根）：`node --test test/integration/batch-edit-spec-section.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { batchTool } from "../../thincoder-core/agent-tools/batch.mjs"
import { batchSkeleton } from "../../thincoder-core/agent-tools/batch-skeleton.mjs"

const BATCH_REL = "docs/batches/fixture.md"
const OBSOLETE = "A11 四档六处旧说法清零（本行已裁定作废——旧说法已不存在）"
const REPLACEMENT = "A11 判据已并入 §2.3（单源 = design §4.4）"

const projects = []
after(() => {
  for (const p of projects) removeTempDirBestEffort(p)
})

/** 在飞批档夹具：项目声明 + 骨架原形批档 + 一段带「已作废判据」的 §2 段体。 */
function fixture(tag) {
  const root = mkdtempSync(join(tmpdir(), `bess-${tag}-`))
  projects.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, docRoot: { batches: "docs/batches" } }, null, 2))
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  // 骨架模板的占位行在散文里点名了这份档（口径的娘家）⇒ 夹具必须让它真在盘，否则模板自身的那处指针就是 `档缺`。
  mkdirSync(join(root, "docs/core/design"), { recursive: true })
  writeFileSync(join(root, "docs/core/design/DOC-GRAPH.md"), "# 行数档位口径\n\n## §3 行数档位口径\n\n夹具占位档（模板散文里点名它，含它所点的节）。\n")
  // 夹具写的是**自己的 §2**：模板占位先整行剔掉——占位散文里点名的真实档在临时项目里不在盘，
  // 留着它这一笔就永远是一条 `档缺`（占位不是记录，真记录里也不留占位）。
  const record = batchSkeleton({ date: "2026-11-02", topic: "fixture", source: "集成夹具", prev: "无（独立批）", baseSha: "未取到（夹具直调骨架）", ledger: "#1990", board: "core" })
    .replace("<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>",
      `验收 A10：四档六处旧说法清零。\n${OBSOLETE}\n验收 A12：收口对账两半跑过。`)
    .replace(/^<§2 模板占位：[^\n]*>\n/m, "")
  writeFileSync(join(root, BATCH_REL), record)
  // eng-designer：写 §2 的唯一身份（工程模式）——目标档 = spawn 绑定，无路径参数
  const agent = { cwd: root, _role: "eng-designer", _batchDoc: BATCH_REL, config: { agent: { engineering: true } } }
  return { root, ctx: { depth: 1, agent } }
}

const readRecord = (root) => readFileSync(join(root, BATCH_REL), "utf8")

test("CLI 7-10 正常 · 设计席把 §2 里一行已作废的判据就地换掉 ⇒ 该行被换、其余行逐字节不变（§2 状态行同笔置位）", async () => {
  const { root, ctx } = fixture("ok")
  const before = readRecord(root)
  assert.ok(before.includes(OBSOLETE), "前置：作废判据那一行在 §2 段体里")

  const receipt = await batchTool(BATCH_REL).execute(
    { action: "edit", segment: "§2", oldText: OBSOLETE, newText: REPLACEMENT },
    ctx,
  )
  const after = readRecord(root)

  // ① 回执：点名替换字符数 + 机检门已判（§4.19 回执形 ∥ 门挂在 edit 面）
  assert.match(receipt, /^batch: edited §2 of the batch record — replaced \d+ characters with \d+\./, `回执形 — ${receipt}`)
  assert.match(receipt, /\[doc-check gate\] DOC-CHECK GATE: PASS/, `门回执 — ${receipt}`)

  // ② 业务结果：那一行没了、新行在、其余行逐字节不变（旧行不残留 → 不留「两种读法」）。
  // 变动行恰两处：目标行 + §2 段级状态行——后者是写正文那一笔的被动同笔写
  // （`BATCH-RECORD.md` §4.12：§2 写正文 ⇒ 该段状态行置「设计完成」），不是第二处改写。
  assert.equal(after.includes(OBSOLETE), false, "作废判据退场（整行删掉，不留「以本节为准」指针）")
  assert.ok(after.includes(REPLACEMENT), "新判据落位")
  const b = before.split("\n")
  const a = after.split("\n")
  assert.equal(a.length, b.length, "行数不变")
  const changed = b.map((line, i) => (line === a[i] ? null : i)).filter((i) => i !== null)
  assert.deepEqual(changed.length, 2, `只有目标行与 §2 状态行变，其余行逐字节不变（变动行 = ${changed.map((i) => i + 1)}）`)
  // 变动的两行（按档内次序）：§2 段头区状态行 ∥ §2 段体里那一行作废判据
  assert.deepEqual(changed.map((i) => [b[i], a[i]]), [
    ["**状态行**：（eng-designer 写入时更新）", "**状态行**：设计完成"],
    [OBSOLETE, REPLACEMENT],
  ], "两处变动各是它该变的那一行")
})

test("CLI 7-10 错误 · 同一句在 §2 段体出现两处 ⇒ 锚不唯一，拒且档字节一字不动", async () => {
  const { root, ctx } = fixture("dup")
  const withDup = readRecord(root).replace(`验收 A12：收口对账两半跑过。`, `验收 A12：收口对账两半跑过。\n${OBSOLETE}`)
  writeFileSync(join(root, BATCH_REL), withDup)
  const before = readRecord(root)

  let message = null
  try {
    await batchTool(BATCH_REL).execute({ action: "edit", segment: "§2", oldText: OBSOLETE, newText: REPLACEMENT }, ctx)
  } catch (e) {
    message = e.message
  }
  assert.ok(message, "锚不唯一必须当场拒（放行会连另一处一起删）")
  assert.match(message, /not unique — it matches 2 places inside §2 \(lines \d+, \d+\)/, `拒串点名命中行号 — ${message}`)
  assert.equal(readRecord(root), before, "零字节落盘：档与调用前逐字相同")
})

