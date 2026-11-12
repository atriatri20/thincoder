/**
 * 2026-11-11-designer-tier-rule.test.mjs — 本批批内单测档（落点 B 红侧：触发物三行判据的四支 + 方案的两种
 * 逃生口形态 + 删档不拒）。名随批档 · 住批次目录 · 不进仓套件 · 收口前删除（读数一行留批档 §5）。
 * 复跑：仓库根 `node --test docs/batches/2026-11-11-designer-tier-rule.test.mjs`
 *
 * 判据直调 `assertTierPlan(src, root, changed)`——一段 §2 文本 + 仓根 + 一份改动面，不造真批档。
 *  ① 只改文档、无越线档 ⇒ 过（连 §2 都不解析）
 *  ② 改源码但都不越线 ⇒ 过
 *  ③ 越线 + 有方案 ⇒ 过      ← 「门会放行」的那一支：没有它，只会交出永远拒的门
 *  ④ 越线 + 无方案 ⇒ 拒，点名「哪档 / 多少行 / 要写什么」
 *  ⑤ 删掉的档（不在盘）⇒ 不拒——盘上没有长度可量，不是「干净的档」，是「没有这一档」
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(resolve(ROOT, "thincoder-core/agent-tools/batch-tier-gate.mjs"))) {
  throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
}
const mod = (rel) => import(pathToFileURL(resolve(ROOT, rel)).href)
const { assertTierPlan } = await mod("thincoder-core/agent-tools/batch-tier-gate.mjs")
const { countContentLines } = await mod("thincoder-core/doc-check/line-reads.mjs")

// 夹具：仓里实存、当前确实越设计时线（500）的源档。前提先量一次——夹具退化时报错要能读懂。
const OVER = "thincoder-core/agent-tools/advisor-async.mjs"
const OVER_LEN = countContentLines(readFileSync(resolve(ROOT, OVER), "utf8"))
assert.ok(OVER_LEN > 500, `夹具前提：${OVER} 当前 ${OVER_LEN} 行，须 > 500（否则本例测不到越线面）`)
// 同批的「不越线源档」：本臂自己的档（远低于 500）。
const UNDER = "thincoder-core/agent-tools/batch-tier-gate.mjs"
const OVER_ABS = resolve(ROOT, OVER) // 触达账条目是绝对路径——既测相对、也测绝对

/** §2 片段：机读清单块（表放围栏内 = §2 惯例）。`rows` = `[档, 分拆方案]`。 */
const sectionTwo = (rows) => [
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "**受影响文件（机读清单）**",
  "",
  "```text",
  "| 档 | 分拆方案 |",
  "|---|---|",
  ...rows.map(([p, plan]) => `| ${p} | ${plan} |`),
  "```",
].join("\n")

/** 跑一次并取拒文（`null` = 未抛）。 */
function refusalOf(fn) {
  try { fn(); return null } catch (e) { return e?.message ?? String(e) }
}

test("① 只改文档、无越线档 ⇒ 过（§2 里连块都没有也照过）", () => {
  const docOnly = ["docs/batches/2026-11-11-designer-tier-rule.md", "D:\\x\\docs\\other.md"]
  assert.equal(refusalOf(() => assertTierPlan("## §2 批次任务与设计（eng-designer）\n只有散文。", ROOT, docOnly)), null)
})

test("② 改源码但都不越线 ⇒ 过", () => {
  const src = "## §2 批次任务与设计（eng-designer）\n只有散文。"
  assert.equal(refusalOf(() => assertTierPlan(src, ROOT, [resolve(ROOT, UNDER), "thincoder-core/agent-tools/batch-skeleton.mjs"])), null)
})

test("③ 越线 + 方案点名目标 + 本批落步 ⇒ 过（门会放行）", () => {
  const plan = `把轮询段拆到 \`thincoder-core/agent-tools/advisor-async-poll.mjs\`，本批实施轮落成`
  const src = sectionTwo([[OVER, plan]])
  assert.equal(refusalOf(() => assertTierPlan(src, ROOT, [OVER_ABS])), null)
})

test("④-1 越线、§2 清单里没有这一档 ⇒ 拒，点名「哪档 / 多少行 / 要写什么」", () => {
  const msg = refusalOf(() => assertTierPlan("## §2 批次任务与设计（eng-designer）\n只有散文。", ROOT, [OVER_ABS]))
  assert.ok(msg, "越线而清单里没有它的方案行 ⇒ 须拒")
  assert.ok(msg.includes(OVER), `拒文须点名该档；实得：${msg}`)
  assert.ok(msg.includes(String(OVER_LEN)), `拒文须带该档读数（${OVER_LEN}）；实得：${msg}`)
  assert.ok(msg.includes("没有这一档的方案行"), `拒因须落在「没有这一档的方案行」；实得：${msg}`)
  assert.ok(msg.includes("要写什么"), `拒文须说要写什么；实得：${msg}`)
})

test("④-2 越线、该行方案只有 — ⇒ 拒（视同未填）", () => {
  const msg = refusalOf(() => assertTierPlan(sectionTwo([[OVER, "—"]]), ROOT, [OVER_ABS]))
  assert.ok(msg && msg.includes("方案为空"), `拒因须落在「方案为空」；实得：${msg}`)
})

test("④-3 越线、方案 = 「另起一批拆」⇒ 拒（点名不了目标）", () => {
  const msg = refusalOf(() => assertTierPlan(sectionTwo([[OVER, "另起一批拆"]]), ROOT, [OVER_ABS]))
  assert.ok(msg && msg.includes("缺目标档 token"), `拒因须落在「缺目标档 token」；实得：${msg}`)
})

test("④-4 越线、方案点名了目标却把落地推给下一批 ⇒ 拒（缺本批落步）", () => {
  const plan = `把轮询段拆到 \`thincoder-core/agent-tools/advisor-async-poll.mjs\`，留到下批再落`
  const msg = refusalOf(() => assertTierPlan(sectionTwo([[OVER, plan]]), ROOT, [OVER_ABS]))
  assert.ok(msg && msg.includes("缺本批落步"), `拒因须落在「缺本批落步」；实得：${msg}`)
})

test("⑤ 本批删掉的源档（不在盘）⇒ 不拒——盘上没有长度可量", () => {
  const gone = "thincoder-core/agent-tools/__tier-gate-deleted-probe.mjs"
  assert.equal(refusalOf(() => assertTierPlan("## §2 批次任务与设计（eng-designer）\n只有散文。", ROOT, [gone])), null)
})