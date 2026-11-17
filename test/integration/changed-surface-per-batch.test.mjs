/**
 * changed-surface-per-batch.test.mjs — 集成用例 `CLI 7-32` ∥ `CLI 7-34`（RTM CLI 端故事 7「收口只判本批改过的档」；
 * 判据原文 = `test/rtm/guard.md` 第 7 节那两行）。
 * 机制 = `docs/core/design/BATCH-RECORD.md` §4.18.1（本批改动面的取材：写时归属作判据一 ∥ 提交 diff 按认领收窄，
 * 认领的两源性质不同——本会话归属表是观测、盘上批档的 §2 清单是计划面）。
 *
 * 业务入口 = 真 `batch` 工具（`agent-tools/batch.mjs`）的 depth-0 `close` 轨——不直调 `assertTierPlan`：
 * 本档要的是「收口这件事」的业务可观察结果（放行 ∥ 拒绝、回执行点名了谁、§1 状态行落没落盘）。
 *
 * 场景在档内自建（三份批档、三个批起快照、同一工作树），不动同目录的共享夹具 `close-gate-fixture.mjs`——
 * 那一份按单批硬绑 `BATCH_REL`，改它等于给导出签名加默认值。本档只从它取**通用的** git 助手与台账临时域。
 * 复跑（cwd = 仓根）：`node --test test/integration/changed-surface-per-batch.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { cleanupTemp, commit, depth0, git, snapshot } from "./close-gate-fixture.mjs"
import { removeTempDirBestEffort } from "../teardown.mjs"
import { recordAttribution } from "../../thincoder-core/agent/batch-attribution.mjs"

const projects = []
after(() => {
  cleanupTemp()
  for (const p of projects) removeTempDirBestEffort(p)
})

/** 六段批档（链门 + §3 状态词臂的前置）；`rows` = §2 机读清单的行（`[仓根相对, 读数]`）；`status` = §1 状态词。 */
const recordSrc = ({ baseSha, rows, status = "进行中" }) => [
  "# 并行批 · 改动面取材",
  "",
  "## §1 讨论（主 agent）",
  `**状态行**：${status}`,
  "",
  "夹具讨论。",
  "",
  `**批起 sha = ${baseSha}**`,
  "",
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "",
  "夹具任务。",
  "",
  "**受影响文件（机读清单）**",
  "",
  "| 档 | 分拆方案 | 行数 |",
  "|---|---|---|",
  ...rows.map(([p, reading]) => `| \`${p}\` | — | ${reading} |`),
  "",
  "## §3 设计评审（评审子代理）",
  "**状态行**：评审通过",
  "",
  "夹具评审。",
  "",
  "## §4 用户批准（主 agent）",
  "夹具批准。",
  "",
  "## §5 实施记录（eng-coder）",
  "夹具实施。",
  "",
  "## §6 验证与收口（父代理）",
  "夹具收口。",
  "",
].join("\n")

const REL_A = "docs/batches/pair-a.md"
const REL_B = "docs/batches/pair-b.md"
const REL_C = "docs/batches/pair-c.md"
const write = (root, rel, text) => writeFileSync(join(root, rel), text)

/**
 * 现场：同一工作树里三份批档 = 三批并行。
 *  - A ∥ B：两批都在盘上建档（各取自己的批起快照）后各自改一档并提交；
 *  - C：**另一会话**开的那一批——它的档在盘上、仍**未收口**，且它 §2 列的档确实在它自己的批起 sha..HEAD 之内，
 *    但本会话归属表里没有它（这正是「计划面认领」那一路的唯一可读面）。
 * `attribution` = 本会话是否留下写时归属（关掉它 = 改前那一形：引擎没有这一源）。
 * `crossSession` = 是否放一份邻会话的在途批档 C。
 */
function scene(tag, { attribution = true, crossSession = true, neighborRows = ["src/beta.mjs", "1"] } = {}) {
  const root = mkdtempSync(join(tmpdir(), `csurf-int-${tag}-`))
  projects.push(root)
  mkdirSync(join(root, "docs", "batches"), { recursive: true })
  mkdirSync(join(root, "src"), { recursive: true })
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev" }, null, 2))
  write(root, "src/alpha.mjs", "// alpha v1\n")
  write(root, "src/beta.mjs", "// beta v1\n")
  git(root, "init", "-q")
  commit(root, "base")

  const shaA = snapshot(root)
  write(root, REL_A, recordSrc({ baseSha: shaA, rows: [["src/alpha.mjs", "1"]] }))
  const shaB = snapshot(root)
  write(root, REL_B, recordSrc({ baseSha: shaB, rows: [neighborRows] }))
  if (crossSession) {
    const shaC = snapshot(root)
    write(root, REL_C, recordSrc({ baseSha: shaC, rows: [["src/gamma.mjs", "新"]] }))
  }
  // 两批各自改一档并提交（同一工作树、依先后落盘——现场就是「后开的批先提交」那一形）。
  write(root, "src/alpha.mjs", "// alpha v2\n")
  commit(root, "A: 改 alpha")
  write(root, "src/beta.mjs", "// beta v2\n")
  commit(root, "B: 改 beta")
  if (crossSession) {
    write(root, "src/gamma.mjs", "// gamma v1\n") // C 的那一档：只有它自己的批档列了它
    commit(root, "C: 新增 gamma")
  }

  const agent = { cwd: root, _touchedFiles: [], config: { agent: { engineering: true } } }
  // 写时归属（记账面 = `record-results.mjs`／`turn-loop.mjs` 的同一次调用）：A 写 alpha、B 写 beta。
  // **由用例注入**：本仓 depth-0 主 agent 不带 `_batchDoc`（绑定只在 spawn 上，见 `subagent-spawn.mjs`），
  // 生产的 depth-0 记账面产不出这两条——这里注入的是生产里由绑定子代理记账、再经 `mergeChildMutations` 并回父侧
  // 的那张表（同一导出面 `recordAttribution`，同一形状）。C 属**另一会话**——本会话归属表对它零记录，
  // 这一支正是「计划面」要兜的那一类。
  if (attribution) {
    recordAttribution(agent, [join(root, "src/alpha.mjs")], join(root, REL_A))
    recordAttribution(agent, [join(root, "src/beta.mjs")], join(root, REL_B))
  }
  return { root, agent }
}

/** 收口一笔（真 `batch` 工具；触达账 = 本批自己写的那一档）。 */
const close = (root, agent, rel, touched) => {
  agent._touchedFiles = touched
  return depth0.execute(
    { action: "close", path: rel, completed: [], closeEvidence: "夹具收口证据" },
    { depth: 0, agent, cwd: root },
  )
}

test('CLI 7-32 正常 · 两批同工作树并行：各自收口只判本批改动面，邻批码档只进回执行', async () => {
  const { root, agent } = scene("both")
  const alpha = join(root, "src/alpha.mjs")
  const beta = join(root, "src/beta.mjs")

  // ① 先收 A（此时 B 仍在途）：A 的判域只有 alpha；beta 归 B、gamma 归在途的 C ⇒ 都只进回执行。
  const first = await close(root, agent, REL_A, [alpha])
  assert.match(first, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `A 收口放行：${first}`)
  assert.match(first, /\[doc-check gate\] DOC-CHECK GATE: PASS/, `A 的机检门放行：${first}`)
  assert.match(first, /\[changed surface\] 只报不判：2 档/, `A 的回执行点名两档邻批：${first}`)
  assert.match(first, /src\/beta\.mjs/, `观测源：B 那一档被认领：${first}`)
  assert.match(first, /src\/gamma\.mjs/, `计划源：另一会话在途批 C 那一档被认领：${first}`)
  assert.doesNotMatch(first, /src\/alpha\.mjs — /, `本批那一档照判、不缺点行：${first}`)

  // ② 再收 B（此时 A **已收口**）：B 的判域只有 beta；alpha 的归属仍在归属表里 ⇒ 仍只进回执行。
  const second = await close(root, agent, REL_B, [beta])
  assert.match(second, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `B 收口放行：${second}`)
  assert.match(second, /\[changed surface\] 只报不判：2 档/, `B 的回执行点名两档邻批：${second}`)
  assert.match(second, /src\/alpha\.mjs/, `已收口的邻批仍靠归属表认领：${second}`)

  // ③ 两批都落了盘：§1 状态行各自「已收口」（收口不是只出了一张回执）。
  for (const rel of [REL_A, REL_B]) {
    const line = readFileSync(join(root, rel), "utf8").split("\n").find((l) => l.startsWith("**状态行**："))
    assert.match(line, /已收口/, `${rel} 的 §1 状态行已写「已收口」`)
  }
  // ④ 后半（同一编号的第二半）：另起一份夹具，两源都认领不到 beta —— 本会话没有写时归属，邻批 B 的 §2 列的是
  // 它没提交过的 zeta.mjs（观测不成立）⇒ 按「拿不准就往判的方向倒」照判 ⇒ 收口被拒、拒文点名该档。
  const red = scene("red", { attribution: false, crossSession: false, neighborRows: ["src/zeta.mjs", "新"] })
  const redAlpha = join(red.root, "src/alpha.mjs")
  const before = readFileSync(join(red.root, REL_A), "utf8")
  await assert.rejects(() => close(red.root, red.agent, REL_A, [redAlpha]), (e) => {
    assert.match(e.message, /tier-reading gate/, `拒文点名门位：${e.message}`)
    assert.match(e.message, /src\/beta\.mjs/, `拒文点名邻批那一档（仓根相对）：${e.message}`)
    assert.match(e.message, /Nothing was written\./, `拒文收尾句：${e.message}`)
    return true
  })
  // 拒收口 ⇒ 档字节逐字不变：§1 状态行仍「进行中」。
  assert.equal(readFileSync(join(red.root, REL_A), "utf8"), before, "被拒的收口没有落盘")
})

// ─── CLI 7-34：已收口批的区间上界 ────────────────────────────────────────────────────────

const CLOSED_A = "docs/batches/closed-a.md" // 已收口批（区间内 = alpha、区间之后 = delta）
const CLOSED_B = "docs/batches/closed-b.md" // 区间内那一档的收口方
const CLOSED_D = "docs/batches/closed-d.md" // 区间外那一档的收口方

/**
 * 现场：同一工作树里 A 已收口，它的 §2 列了 alpha 与 delta 两档；只有 alpha 在 A 自己的区间
 * （批起 → A 的最后一次提交 = 收口提交）内被提交，delta 在那之后才提交。A 的收口只改盘上那份档、
 * 不提交——上界仍指它自己的收口提交（钉死的上界不许长到 HEAD）。
 */
function closedScene(tag) {
  const root = mkdtempSync(join(tmpdir(), `csurf-closed-${tag}-`))
  projects.push(root)
  mkdirSync(join(root, "docs", "batches"), { recursive: true })
  mkdirSync(join(root, "docs", "notes"), { recursive: true })
  mkdirSync(join(root, "src"), { recursive: true })
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev" }, null, 2))
  write(root, "docs/notes/readme.md", "# notes\n")
  write(root, "src/alpha.mjs", "// alpha v1\n")
  write(root, "src/delta.mjs", "// delta v1\n")
  git(root, "init", "-q")
  commit(root, "base")

  const shaA = snapshot(root)
  const rowsA = [["src/alpha.mjs", "1"], ["src/delta.mjs", "1"]]
  write(root, CLOSED_A, recordSrc({ baseSha: shaA, rows: rowsA }))
  write(root, "src/alpha.mjs", "// alpha v2\n")
  commit(root, "A: 改 alpha 并提交批档") // A 的最后一次提交（正常路径上的收口提交）
  write(root, "src/delta.mjs", "// delta v2\n")
  commit(root, "later: 改 delta") // 落在 A 的区间之后
  write(root, CLOSED_A, recordSrc({ baseSha: shaA, rows: rowsA, status: "已收口" }))

  // B：本次要收口的批——它的 §2 **没列** alpha（若被照判就会因缺读数被拒），批起快照取在全部提交之后。
  const shaB = snapshot(root)
  write(root, CLOSED_B, recordSrc({ baseSha: shaB, rows: [["docs/notes/readme.md", "1"]] }))
  const agent = { cwd: root, _touchedFiles: [], config: { agent: { engineering: true } } }
  return { root, agent }
}

test('CLI 7-34 边界 · 已收口批的 §2 清单按它自己的收口提交认领（区间内只报不判、区间外照判）', async () => {
  const { root, agent } = closedScene("self")
  const alpha = join(root, "src/alpha.mjs")
  const delta = join(root, "src/delta.mjs")

  // ① 区间内：A 已收口，alpha 在 A 自己的区间之内 ⇒ 认领成立 ⇒ 只进回执行（B 的 §2 没列它，照判就会拒）。
  const first = await close(root, agent, CLOSED_B, [alpha])
  assert.match(first, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `B 收口放行：${first}`)
  assert.match(first, /\[doc-check gate\] DOC-CHECK GATE: PASS/, `B 的机检门放行：${first}`)
  assert.match(first, /\[changed surface\] 只报不判：1 档/, `回执行点名一档被已收口批认领：${first}`)
  assert.match(first, /src\/alpha\.mjs/, `区间内那一档被认领：${first}`)
  assert.doesNotMatch(first, /src\/delta\.mjs/, `区间外那一档不被它认领（也不在本批改动面里）：${first}`)
  const bLine = readFileSync(join(root, CLOSED_B), "utf8").split("\n").find((l) => l.startsWith("**状态行**："))
  assert.match(bLine, /已收口/, "B 的 §1 状态行已写「已收口」")

  // ② 区间外：delta 也写在 A 的 §2 里，但它在 A 的收口提交之后才提交 ⇒ 不在 A 的区间内 ⇒ 不被认领、照本批判；
  //    D 的 §2 没列它而它在盘 ⇒ 档位臂拒收口并点名该档（正是「上界钉死之后认领退回确实改过的档」那一面）。
  const shaD = snapshot(root)
  write(root, CLOSED_D, recordSrc({ baseSha: shaD, rows: [["docs/notes/readme.md", "1"]] }))
  const before = readFileSync(join(root, CLOSED_D), "utf8")
  await assert.rejects(() => close(root, agent, CLOSED_D, [delta]), (e) => {
    assert.match(e.message, /tier-reading gate/, `拒文点名门位：${e.message}`)
    assert.match(e.message, /src\/delta\.mjs/, `区间外那一档被照判（点名该档）：${e.message}`)
    assert.match(e.message, /Nothing was written\./, `拒文收尾句：${e.message}`)
    return true
  })
  assert.equal(readFileSync(join(root, CLOSED_D), "utf8"), before, "被拒的收口没有落盘")
})

