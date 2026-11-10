/**
 * doc-anchor-graph.test.mjs — 集成用例 43-1 ∥ 43-2 ∥ 43-3 ∥ 43-4 ∥ 43-5（RTM CLI 端故事 43「文档锚点图：一条链
 * 从一个需求走到用例入口符号」；判据原文 = `test/rtm/tooling.md` 的 `## CLI 43.` 节；机制单源 =
 * `docs/core/design/DOC-GRAPH.md`）。
 *
 * 业务入口 = **真工具调用** `doc_graph`（`agent-tools/doc-graph.mjs` 的 `execute`，会话锚 = 仓根）：
 * `scan` 落边 → `chain` / `reverse` / `forward` 三种问法。断言面 = 工具回执文本（人读者看到的就是它）。
 *
 * 回执形（设计 §2.5.0 ∥ §2.5.4）：首行口径 **不带混合边总数** → 按类计数行（`cites` 与 `cites-symbol` 各占一格、
 * 三格恒印）→ 边行 → 时效格末行。43-1 ∥ 43-2 断的这两处就是那个形；43-4 ∥ 43-5 分别压自环与时效。
 *
 * 夹具纪律：台账库目录一律 `_setLedgerDirForTest(<临时域>)` 覆盖（不碰真实用户目录），`after()` 恒复原
 * ——与 `test/integration/ledger-read-cross-project.test.mjs` 同一条（只复原 `chdir` 会漏库目录）。
 * `ledger.mjs` / `doc-graph.mjs` 一律动态 import（静态链入 `node:sqlite`——W8 契约②）。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-anchor-graph.test.mjs`
 */
import { after, before, test } from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdirSync, mkdtempSync, utimesSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { removeTempDirBestEffort } from "../teardown.mjs"

const REPO = resolve(import.meta.dirname, "../..")

const ledgerDir = mkdtempSync(join(tmpdir(), "dag-int-ledger-"))
const { _setLedgerDirForTest, _resetLedgerDirForTest } = await import("../../thincoder-core/ledger.mjs")
_setLedgerDirForTest(ledgerDir)
const { docGraphTool } = await import("../../thincoder-core/agent-tools/doc-graph.mjs")

const tempRoots = [ledgerDir]
after(() => {
  _resetLedgerDirForTest()
  for (const p of tempRoots) removeTempDirBestEffort(p)
})

const ctx = { agent: { cwd: REPO } }
const call = (args) => docGraphTool.execute(args, ctx)

/** 全仓扫一次（五条用例共用；本仓的真链就是 AC-1 要复原的那条）。回执留一份给 43-1 断形。 */
let scanReceipt = ""
before(async () => {
  scanReceipt = await call({ action: "scan", target: REPO })
  // 首行只写范围与档数，**不带任何混合边总数**（AC-7）：数与分布都在紧跟的按类行里。
  // 断的是**首行**而不是整份回执：`^…$` 不带 `m` 只配一个输入，回执恒为多行（首行 ∥ 按类行 ∥ 时效格）。
  const scanHead = scanReceipt.split("\n")[0]
  assert.match(scanHead, /^全仓 · 扫 \d+ 档$/, `scan 回执首行：${scanHead}`)
})

test("CLI 43-1 正常 · 扫本仓后 chain 以 req:F16 起 depth 6：第 1 跳含设计档与批档、宽度截断自述行逐层都在；五跳的每条边由无上限直查断", async () => {
  // ①′ 回执形（AC-7 ∥ AC-9）：按类计数行紧跟首行（每类三格，`cites` 与 `cites-symbol` 不共格），时效格在末行
  const scanLines = scanReceipt.split("\n")
  assert.match(scanLines[1] ?? "", /^按类：/, `按类计数行须紧跟首行：${scanLines.slice(0, 3).join(" | ")}`)
  // 列出的每一类自己带三格（三格恒印、零也印），且 `cites` 与 `cites-symbol` 各占一格
  const cells = scanLines[1].replace(/^按类：/, "").split(" · ")
  for (const c of cells) {
    assert.match(c, /^\S+ \d+ 条（已验存在 \d+ ∥ 目标不在盘 \d+ ∥ 判不了存在性 \d+）$/, `每一类自己带三格：${c}`)
  }
  assert.ok(cells.some((c) => /^cites \d+ 条/.test(c)), `cites 自占一格：${scanLines[1]}`)
  assert.ok(cells.some((c) => /^cites-symbol \d+ 条/.test(c)), `cites-symbol 另占一格、不并入 cites：${scanLines[1]}`)
  assert.match(scanLines.at(-1), /^图建于 .+ · 此后 \d+ 档变更 · \d+ 档已不在盘$/, `末行须是时效格：${scanLines.at(-1)}`)

  const chain = await call({ action: "chain", target: REPO, node: "req:F16", depth: 6 })
  const lines = chain.split("\n")
  assert.match(lines[0], /^走查起点 req:F16 · 深度 6 跳 · 命中 \d+ 条边 \/ \d+ 个节点 · kind = 全部十类：/, `首行口径：${lines[0]}`)

  const isEdge = (l) => / (?:--[a-z-]+-->|<--[a-z-]+-- )/.test(l) && !l.trimEnd().endsWith("」")
  // ① 第 1 跳是小层（写过 `F16` 的那几份档）：设计档与批档都在层里
  const h1 = lines.indexOf("第1跳")
  assert.ok(h1 > 0, `须印第1跳层头：${lines.slice(0, 3).join(" | ")}`)
  const h1End = lines.findIndex((l, i) => i > h1 && (/^第\d+跳$/.test(l) || l.startsWith("本层并列 ") || l.startsWith("已截断")))
  const hop1 = lines.slice(h1 + 1, h1End < 0 ? undefined : h1End)
  assert.ok(hop1.some((l) => isEdge(l) && l.includes("doc:docs/core/design/EDIT.md <--cites-req-- req:F16")), "第 1 跳须含设计档")
  assert.ok(hop1.some((l) => isEdge(l) && l.includes("docs/batches/2026-11-09-edit-batch-atomic-receipt.md <--cites-req-- req:F16")), "第 1 跳须含批档")

  // ② 宽度截断自述行：哪一层截就在哪一层说（M = 该层真实条数、上限 200、点名闭集内该层真有的 kind）
  //    不硬断「恰好三层」——那会把本用例绑在今天的图宽上（文档增删一改就假红）；每条自述行自己押完。
  const capLines = lines.filter((l) => l.startsWith("本层并列 ") || l.startsWith("本层无可收窄的 kind"))
  assert.ok(capLines.length >= 1, `本仓枢纽节点上必有层触上限（否则这条断言跑的是空对象）：${lines[0]}`)
  for (const l of capLines) {
    // 两种自述行各断各的：整层只有投影类边时没有可收窄的 kind，那一行不是「本层并列」形
    if (l.startsWith("本层无可收窄的 kind")) {
      assert.equal(l, "本层无可收窄的 kind（截断部分只有投影类边）", `不可收窄那一行的形：${l}`)
      continue
    }
    const m = /^本层并列 (\d+) 条，此处印前 (\d+) 条；收窄办法 = kind=(.+?)（第 (\d+) 跳）$/.exec(l)
    assert.ok(m, `自述行的形：${l}`)
    const width = Number(m[1])
    const cap = Number(m[2])
    const hop = Number(m[4])
    assert.ok(width > cap, `M 是该层真实条数、须大于印出条数：${l}`)
    assert.equal(cap, 200, `上限 = LAYER_CAP：${l}`)
    // 上限真的生效：该层只印了 200 条边行（不是只在自述行里报个数）
    const hopIdx = lines.indexOf(`第${hop}跳`)
    assert.ok(hopIdx > 0, `须有第${hop}跳层头`)
    assert.equal(lines.slice(hopIdx + 1, lines.indexOf(l)).filter(isEdge).length, cap, `第 ${hop} 跳须印满前 ${cap} 条`)
    // 点名的 kind 必须在闭集内（点名闭集外的值 = 把读者送进拒文）
    for (const k of m[3].split(",")) assert.ok(["cites", "cites-req", "mentions-case", "case-file", "cites-symbol", "imports"].includes(k), `点名的 kind 须在闭集内：${l}`)
  }

  // ③ 五跳的每条边逐条直查：`chain` 在枢纽节点上收敛不到 200、远端节点看不进一条回执（已知限界，见批档 §5），
  //    而单节点直查无上限——那条关系在不在，就该这样问（设计 §2.5.3 末条）。
  const fw = (node) => call({ action: "forward", target: REPO, node })
  const rev = await call({ action: "reverse", target: REPO, node: "req:F16" })
  assert.ok(rev.includes("doc:docs/core/design/EDIT.md --cites-req--> req:F16"), "第 1 跳：设计档 --cites-req--> req:F16")
  const batch = await fw("doc:docs/batches/2026-11-09-edit-batch-atomic-receipt.md")
  assert.ok(batch.includes("--cites--> doc:docs/core/design/EDIT.md"), "第 2 跳：批档 --cites--> 设计档")
  assert.ok(batch.includes("--mentions-case--> case:CLI 41-1"), "第 3 跳：批档 --mentions-case--> case:CLI 41-1")
  const edit = await fw("doc:docs/core/design/EDIT.md")
  assert.ok(edit.includes("--cites-symbol--> symbol:editTool"), "设计档 --cites-symbol--> symbol:editTool（不经过用例的短路）")
  const cs = await fw("case:CLI 41-1")
  assert.ok(cs.includes("--case-file--> doc:test/integration/edit-batch-entry-outcome.test.mjs"), "第 4 跳：用例号 --case-file--> 它的用例档")
  const file = await fw("doc:test/integration/edit-batch-entry-outcome.test.mjs")
  assert.ok(file.includes("--imports--> symbol:editTool"), "第 5 跳：落在 import 面符号 editTool 上")

  // ④ 每边带出处（F4）
  for (const [label, text] of [["reverse(req:F16)", rev], ["forward(批档)", batch], ["forward(设计档)", edit], ["forward(case:CLI 41-1)", cs], ["forward(用例档)", file]]) {
    const xs = text.split("\n")
    let n = 0
    for (let i = 0; i < xs.length; i++) {
      if (!isEdge(xs[i])) continue
      n++
      assert.match(xs[i + 1] ?? "", / @ \d+ 「/, `${label}：边行缺出处：${xs[i]}`)
    }
    assert.ok(n > 0, `${label}：回执里须有边行`)
  }
})

test("CLI 43-2 正常 · reverse 查 EDIT.md §5：需求档与批档两条引用方都在，各带出处", async () => {
  const rev = await call({ action: "reverse", target: REPO, node: "doc:docs/core/design/EDIT.md#5" })
  const lines = rev.split("\n")
  // 首行断到 `kind = 全部十类：` 为止（入边条数那个混合总数已从首行去掉——AC-7）
  assert.match(lines[0], /^doc_graph\(reverse\) · 起点 doc:docs\/core\/design\/EDIT\.md#5 · kind = 全部十类：/)
  assert.ok(!/条边|\d+ 条/.test(lines[0]), `首行不得带混合条数：${lines[0]}`)
  // 按类计数行紧跟首行，`cites` 自己一格（本条问的就是档引用那条链）
  assert.match(lines[1] ?? "", /^按类：/, `按类计数行须紧跟首行：${lines.slice(0, 3).join(" | ")}`)
  assert.match(lines[1], /cites \d+ 条（已验存在 \d+ ∥ 目标不在盘 \d+ ∥ 判不了存在性 \d+）/, `cites 一格带三格：${lines[1]}`)

  const reqIdx = lines.findIndex((l) => l.startsWith("doc:docs/core/requirements/TOOLS.md --cites-->"))
  assert.notEqual(reqIdx, -1, `需求档那条须在：${lines.slice(1, 5).join("\n")}`)
  assert.match(lines[reqIdx + 1], /「.*F16/, "需求档那条的出处原句须带 F16")
  const batchIdx = lines.findIndex((l) => l.startsWith("doc:docs/batches/2026-11-09-edit-batch-atomic-receipt.md --cites-->"))
  assert.notEqual(batchIdx, -1, "批档那条须在")
  assert.match(lines[batchIdx + 1], / @ \d+ 「/, "批档那条也须带出处")
})

test("CLI 43-3 边界 · 目标档移走后重扫：该边仍列出且标「目标不在盘」", async () => {
  const root = mkdtempSync(join(tmpdir(), "dag-int-fx-"))
  tempRoots.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design" } }, null, 2))
  mkdirSync(join(root, "docs/design"), { recursive: true })
  writeFileSync(join(root, "docs/design/CITE.md"), "# CITE\n\n判据 = `GONE.md §2` 那一条。\n")
  writeFileSync(join(root, "docs/design/GONE.md"), "# GONE\n\n## 2. 第二节\n\n正文。\n")

  const fx = { agent: { cwd: root } }
  await docGraphTool.execute({ action: "scan", target: root }, fx)
  const before = await docGraphTool.execute({ action: "forward", target: root, node: "doc:docs/design/CITE.md" }, fx)
  assert.ok(before.includes("doc:docs/design/GONE.md#2 · ok"), `首次扫须判 ok：${before}`)

  removeTempDirBestEffort(join(root, "docs/design/GONE.md"))
  assert.equal(existsSync(join(root, "docs/design/GONE.md")), false, "夹具自证：目标档已移走")
  await docGraphTool.execute({ action: "scan", target: root }, fx)
  const after = await docGraphTool.execute({ action: "forward", target: root, node: "doc:docs/design/CITE.md" }, fx)
  const line = after.split("\n").find((l) => l.includes("--cites-->") && l.includes("GONE.md#2"))
  assert.ok(line, `移走目标档后该边仍须列出：${after}`)
  assert.ok(line.includes("· 目标不在盘"), `该边须标「目标不在盘」：${line}`)
})

test("CLI 43-4 边界 · 自环不入边：引自身整档那一行不成边，引自身 §5 那一行照常落边并印出", async () => {
  const root = mkdtempSync(join(tmpdir(), "dag-int-self-"))
  tempRoots.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design" } }, null, 2))
  mkdirSync(join(root, "docs/design"), { recursive: true })
  writeFileSync(join(root, "docs/design/SELF.md"), [
    "# SELF",
    "",
    "## 5. 第五节",
    "",
    "本档 docs/design/SELF.md 引自身整档。",
    "本节 docs/design/SELF.md §5 指向自身那一节。",
    "",
  ].join("\n"))

  const fx = { agent: { cwd: root } }
  const scan = await docGraphTool.execute({ action: "scan", target: root }, fx)
  // 夹具自证：两条写法相近的行只落下一条边（自指那条没进表）——否则下面的断言跑的是空对象
  assert.ok(scan.includes("cites 1 条（已验存在 1 ∥ 目标不在盘 0 ∥ 判不了存在性 0）"), `夹具只落一条 cites：${scan}`)

  const fw = await docGraphTool.execute({ action: "forward", target: root, node: "doc:docs/design/SELF.md" }, fx)
  const rows = fw.split("\n").map((l) => /^(doc:\S+) --[a-z-]+--> (\S+?)(?: · .*)?$/.exec(l)).filter(Boolean)
  assert.ok(rows.length > 0, `forward 须有边行：${fw}`)
  assert.equal(rows.filter((m) => m[1] === m[2]).length, 0, `forward 里不得有 src 与 dst 逐字相同的行：${fw}`)
  assert.ok(fw.includes("doc:docs/design/SELF.md --cites--> doc:docs/design/SELF.md#5"), `引自身某一节照常印出：${fw}`)
})

test("CLI 43-5 正常 · 时效格：扫后写「此后 0 档变更」，改一档后写「此后 ≥1 档变更」", async () => {
  const root = mkdtempSync(join(tmpdir(), "dag-int-fresh-"))
  tempRoots.push(root)
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design" } }, null, 2))
  mkdirSync(join(root, "docs/design"), { recursive: true })
  const a = join(root, "docs/design/A.md")
  const b = join(root, "docs/design/B.md")
  writeFileSync(b, "# B\n\n## 1. 第一节\n\n正文。\n")
  writeFileSync(a, "# A\n\n判据 = docs/design/B.md §1 那一条。\n")
  // 把 mtime 钉到过去：时效格断的是**严格大于**，同一次落盘写出的档不该被算成「扫完又改过」
  const past = new Date(Date.now() - 60_000)
  utimesSync(a, past, past)
  utimesSync(b, past, past)

  const fx = { agent: { cwd: root } }
  const scan = await docGraphTool.execute({ action: "scan", target: root }, fx)
  const first = scan.split("\n").at(-1)
  assert.match(first, /^图建于 .+（\d+ 档同批） · 此后 0 档变更 · \d+ 档已不在盘$/, `首份回执的时效格：${first}`)

  const later = new Date(Date.now() + 5_000)
  utimesSync(a, later, later)
  const read = await docGraphTool.execute({ action: "forward", target: root, node: "doc:docs/design/A.md" }, fx)
  const last = read.split("\n").at(-1)
  assert.match(last, /^图建于 .+ · 此后 [1-9]\d* 档变更 · \d+ 档已不在盘$/, `改过一档后须 ≥1 档变更：${last}`)
})