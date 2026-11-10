/**
 * 2026-11-11-p2-3-gate-anchor-single-source.test.mjs — 本批改面单元测试档（用毕即删，与批档同名同目录）。
 *
 * 覆盖 = `docs/core/design/DOC-CHECK.md` §2.10.6 的 AC-G1–AC-G14（本批三条门缺陷 + 判定单源）。
 * 核法（cwd = 仓根）：`node --test docs/batches/2026-11-11-p2-3-gate-anchor-single-source.test.mjs`
 * 夹具全落系统临时域（零落仓 + 并发免疫）。
 *
 * **每条都带红侧**：红侧的写法 = 把「实现对了才成立」的那一面换成「实现写宽了就会读到的那一面」，
 * 并断言两者结论相反——所以任何一条红侧都能当场变红，而不是一句描述。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, sep } from "node:path"
import { fileURLToPath } from "node:url"
import { execFileSync } from "node:child_process"

import { BARE_NAME_EXTS, DEFAULT_DOC_EXTS, isDocToken, isExtension } from "../../thincoder-core/doc-check/anchors.mjs"
import { runDocCheck } from "../../thincoder-core/doc-check/index.mjs"
import { judgeZones, runDocWriteGate } from "../../thincoder-core/tools/doc-write-gate.mjs"
import { editTool } from "../../thincoder-core/tools/file.mjs"
import { runBatchGate } from "../../thincoder-core/agent-tools/batch-gate.mjs"
import { batchSkeleton } from "../../thincoder-core/agent-tools/batch-skeleton.mjs"

const REPO = fileURLToPath(new URL("../../", import.meta.url))
const TMP = []
const mktmp = (tag) => {
  const d = mkdtempSync(join(tmpdir(), `p23-${tag}-`))
  TMP.push(d)
  return d
}
process.on("exit", () => {
  for (const d of TMP) {
    try { rmSync(d, { recursive: true, force: true }) } catch { /* 清理失败不改判定 */ }
  }
})

/** 夹具项目：manifest（`design` = `docs/design`，`batches` = `docs/batches`）+ 逐档内容（父目录自动建）。 */
function project(tag, files, { exts, exemptions } = {}) {
  const root = mktmp(tag)
  const index = {}
  if (exts) index.docCheckExts = exts
  if (exemptions) index.docCheckExemptions = exemptions
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), `${JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design", batches: "docs/batches" }, index }, null, 2)}\n`)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

const hitLines = (report) => report.split("\n").filter((l) => l.startsWith("✗ "))
const first = (report) => report.split("\n")[0]

// ── 第一组 · 形分档（AC-G1 – AC-G4）────────────────────────────────────────────────

test("AC-G1 裸名代码族不判 / 红侧：清单这条腿单独看会把它当候选", () => {
  const root = project("g1", { "docs/design/a.md": "# 甲\n\n代码表达式 JSON.parse 与裸写的 x.py 都不是指针。\n" })
  const gate = runDocCheck(root, { mode: "gate", docs: ["docs/design/a.md"] })
  assert.equal(first(gate.report), "DOC-CHECK GATE: PASS", gate.report)
  // 红侧：清单这条腿（只看后缀）对这一形是**通过**的 ⇒ 少一道形分档就出 `档缺`
  assert.equal(isExtension("py", DEFAULT_DOC_EXTS), true, "清单里确有 py")
  assert.equal(isDocToken("x.py"), false, "裸写的代码族档名不是候选（形分档挡下）")
})

test("AC-G2 带目录段的代码族照判 / 红侧：同一族的裸名零命中（判的是形，不是族）", () => {
  const root = project("g2", { "docs/design/a.md": "# 甲\n\n见 docs/x.py 一处。\n" })
  const gate = runDocCheck(root, { mode: "gate", docs: ["docs/design/a.md"] })
  assert.equal(first(gate.report), "DOC-CHECK GATE: REFUSED（锚 1 条）", gate.report)
  assert.equal(hitLines(gate.report).some((l) => l.includes("docs/x.py")), true, gate.report)
  const bare = project("g2b", { "docs/design/a.md": "# 甲\n\n见 x.py 一处。\n" })
  assert.equal(first(runDocCheck(bare, { mode: "gate", docs: ["docs/design/a.md"] }).report), "DOC-CHECK GATE: PASS")
})

test("AC-G3 文档名族裸名照判（唯一即过） / 红侧：同一形解不到就照红", () => {
  const ok = project("g3", {
    "docs/design/a.md": "# 甲\n\n见 在盘档.md 一处。\n",
    "docs/在盘档.md": "# 在盘的中文档\n",
  })
  assert.equal(first(runDocCheck(ok, { mode: "gate", docs: ["docs/design/a.md"] }).report), "DOC-CHECK GATE: PASS")
  assert.equal(isDocToken("在盘档.md"), true, "文档名族裸名是候选")
  const miss = project("g3b", { "docs/design/a.md": "# 甲\n\n见 不在盘档.md 一处。\n" })
  assert.equal(first(runDocCheck(miss, { mode: "gate", docs: ["docs/design/a.md"] }).report), "DOC-CHECK GATE: REFUSED（锚 1 条）")
})

test("AC-G4 真歧义裸名照红 / 红侧：把文档名族裸名也放过 ⇒ 本例零命中", () => {
  const root = project("g4", {
    "docs/design/a.md": "# 甲\n\n见 同名档.md 一处。\n",
    "docs/design/x/同名档.md": "# 一份\n",
    "docs/design/y/同名档.md": "# 两份\n",
  })
  const gate = runDocCheck(root, { mode: "gate", docs: ["docs/design/a.md"] })
  assert.equal(first(gate.report), "DOC-CHECK GATE: REFUSED（锚 1 条）", gate.report)
  assert.equal(hitLines(gate.report).some((l) => l.includes("同名档.md")), true, gate.report)
  // 红侧：BARE_NAME_EXTS 若把 md 拿掉（= 文档名族裸名也一并放过），本例与 AC-G3 同时失真
  assert.deepEqual([...BARE_NAME_EXTS], ["md", "markdown"], "文档名族取值")
  assert.equal(isDocToken("同名档.md"), true)
})

// ── 第二组 · 豁免三处同判（AC-G5 – AC-G7）────────────────────────────────────────

const DOC_REL = "docs/design/a.md"
const ANCHOR_TEXT = "见 docs/design/nope.md 一处。"
const docBody = () => `# 甲\n\n${ANCHOR_TEXT}\n`
const registration = (file) => [{ file, kind: "锚·档缺", text: "docs/design/nope.md", why: "夹具：口径三处同判", review: "本批用例" }]
const writeOnce = (root) => runDocWriteGate({ abs: join(root, DOC_REL), content: `# 甲\n\n${ANCHOR_TEXT}\n新增一行。\n`, root })

test("AC-G5 写前门认登记（身份 = 目标档） / 红侧：登记的 file 不是目标档 ⇒ 照拒", async () => {
  const root = project("g5", { [DOC_REL]: docBody() }, { exemptions: registration(DOC_REL) })
  const gate = runDocCheck(root, { mode: "gate", docs: [DOC_REL] })
  assert.equal(first(gate.report), "DOC-CHECK GATE: PASS", gate.report)
  assert.match(gate.report, /豁免 1 条（已裁定假阳，不阻断交付）：/, gate.report)
  const res = await writeOnce(root)
  assert.equal(res.judged, true, "写前门已判")
  assert.equal(res.hits, 0, "登记过的命中不在写前门的阻断集里")
  // 业务结果：同一笔走**真写点**（`edit` 工具 ⇒ `writeThroughPath` 调门）⇒ 放行且字节落盘
  await editTool.execute({ path: DOC_REL, old_string: ANCHOR_TEXT, new_string: `${ANCHOR_TEXT}新增一行。` }, { cwd: root })
  assert.match(readFileSync(join(root, DOC_REL), "utf8"), /新增一行。/, "登记过的命中不阻写，目标档已落盘")
  // 红侧：登记那一格的 `file` 写成片段档名（改前的身份）⇒ 识别键对不上 ⇒ 写前门照拒、字节不变
  const wrong = project("g5b", { [DOC_REL]: docBody() }, { exemptions: registration(".docgate-x-1.md") })
  const bytes = readFileSync(join(wrong, DOC_REL), "utf8")
  await assert.rejects(() => editTool.execute({ path: DOC_REL, old_string: ANCHOR_TEXT, new_string: `${ANCHOR_TEXT}新增一行。` }, { cwd: wrong }), /DOC-CHECK GATE: REFUSED/)
  assert.equal(readFileSync(join(wrong, DOC_REL), "utf8"), bytes, "拒写 ⇒ 零字节")
})

test("AC-G6 撤销即回拦 / 红侧：留着登记时同一笔放行（本组两半互为红侧）", async () => {
  const noReg = project("g6", { [DOC_REL]: docBody() })
  const gate = runDocCheck(noReg, { mode: "gate", docs: [DOC_REL] })
  assert.equal(first(gate.report), "DOC-CHECK GATE: REFUSED（锚 1 条）", gate.report)
  await assert.rejects(() => writeOnce(noReg), /DOC-CHECK GATE: REFUSED/, "无登记 ⇒ 写前门照拒（与交付面同上同下）")
  const reg = project("g6b", { [DOC_REL]: docBody() }, { exemptions: registration(DOC_REL) })
  assert.equal((await writeOnce(reg)).hits, 0, "同一夹具只差一条登记 ⇒ 放行")
})

test("AC-G7 三处一个键 / 红侧：一张登记表只在一面生效就分叉", async () => {
  const batchRel = "docs/batches/fixture.md"
  const record = batchSkeleton({ date: "2026-11-11", topic: "p23", source: "用例", prev: "无", baseSha: "未取到", ledger: "#2313", board: "core" })
  const placeholder = "<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>"
  const citation = "依据 docs/design/nope.md「夹具引文」"
  const withRef = record.replace(placeholder, citation)
  const faces = (root) => ({
    delivery: runDocCheck(root, { mode: "gate", docs: [batchRel], texts: new Map([[join(root, batchRel), withRef]]) }),
    write: runDocWriteGate({ abs: join(root, batchRel), content: withRef, root }),
    edit: runBatchGate({ abs: join(root, batchRel), cwd: root, agent: { cwd: root, _touchedFiles: [] }, scope: "writer", pending: { section: "2", body: citation, recordView: withRef } }),
  })

  // 未登记：三面同时拒（拒词同一个判决词族）
  const plain = project("g7", { [batchRel]: record })
  const f1 = faces(plain)
  assert.equal(first(f1.delivery.report), "DOC-CHECK GATE: REFUSED（锚 1 条）", f1.delivery.report)
  await assert.rejects(() => f1.write, /DOC-CHECK GATE: REFUSED（锚 1 条）/, "写前门同拒")
  assert.equal(f1.edit.state, "refused", f1.edit.report)
  assert.match(f1.edit.first, /^DOC-CHECK GATE: REFUSED/, f1.edit.first)

  // 红侧：同一条登记写进 manifest ⇒ 三面判决**同时**翻转（一面自取一份表就只会翻一面）
  const reg = project("g7b", { [batchRel]: record }, { exemptions: [{ file: batchRel, kind: "锚·档缺", text: "docs/design/nope.md", why: "夹具", review: "本批用例" }] })
  const f2 = faces(reg)
  assert.equal(first(f2.delivery.report), "DOC-CHECK GATE: PASS", f2.delivery.report)
  assert.equal((await f2.write).hits, 0, "写前门同判放行")
  assert.equal(f2.edit.state, "pass", `edit 面同判：${f2.edit.report}`)
})

// ── 第三组 · 改动区并集（AC-G8 – AC-G10）────────────────────────────────────────

test("AC-G8 多点写入不被包络绑架 / 红侧：区间表退回首末包络 ⇒ 被中间那处存量绑架", async () => {
  const body = [
    "# 甲", "",                                   // 1–2
    "第一段：本笔改这一行。",                       // 3  ← 改动
    "", "中间段一。", "",                          // 4–6
    "存量段：见 docs/gone.md 一处。",               // 7  ← 存量（离两处改动都 > 2 行）
    "", "中间段二。", "",                          // 8–10
    "第三段：本笔也改这一行。",                     // 11 ← 改动
    "",
  ].join("\n")
  const root = project("g8", { [DOC_REL]: body })
  const content = body.replace("第一段：本笔改这一行。", "第一段：本笔改这一行（改）。").replace("第三段：本笔也改这一行。", "第三段：本笔也改这一行（改）。")
  const res = await runDocWriteGate({ abs: join(root, DOC_REL), content, root })
  assert.equal(res.hits, 0, "两处都干净 ⇒ 放行")
  assert.equal(res.zones, 2, "两处改动各成一个判定区")
  // 红侧：把判定区喂成首末包络（改前那一形）⇒ 同一笔被中间那处存量锚拒掉
  const lines = content.split("\n")
  const envelope = judgeZones(lines, [{ start: 3, end: 11 }])
  const enveloped = runDocCheck(root, { mode: "gate", docs: [DOC_REL], texts: new Map([[join(root, DOC_REL), content]]), zones: new Map([[join(root, DOC_REL), envelope]]) })
  assert.equal(first(enveloped.report), "DOC-CHECK GATE: REFUSED（锚 1 条）", enveloped.report)
})

test("AC-G9 区间内的存量照拦 / 红侧：区外照放 ⇒ 本次债被放过", async () => {
  // 存量锚落在某处改动的 ±2 行内 ⇒ 它就在「本笔触碰的那一段」里
  const body = ["# 甲", "", "第一段：本笔改这一行。", "见 docs/gone.md 一处。", "", "第三段。", ""].join("\n")
  const root = project("g9", { [DOC_REL]: body })
  const content = body.replace("第一段：本笔改这一行。", "第一段：本笔改这一行（改）。")
  await assert.rejects(() => runDocWriteGate({ abs: join(root, DOC_REL), content, root }), /DOC-CHECK GATE: REFUSED（锚 1 条）/, "区间内的存量锚照拦")
  assert.equal(readFileSync(join(root, DOC_REL), "utf8"), body, "拒写 ⇒ 零字节")
  // 红侧：把区外判成零命中的那一条 —— 同一份文本、判定区只留别处 ⇒ 命中落进存量读数
  const out = runDocCheck(root, { mode: "gate", docs: [DOC_REL], texts: new Map([[join(root, DOC_REL), content]]), zones: new Map([[join(root, DOC_REL), [{ start: 1, end: 2 }]]]) })
  assert.equal(first(out.report), "DOC-CHECK GATE: PASS", out.report)
  assert.equal(out.stockHits.length, 1, "区外那一条进存量桶（照列、不阻断）")
})

test("AC-G10 纯删行 / 红侧：把纯删支写成整档判 ⇒ 邻段存量把整笔拒掉", async () => {
  const body = [
    "# 甲", "",                                    // 1–2
    "存量段：见 docs/gone.md 一处。",                // 3  ← 存量，离本笔 > 2 行
    "", "甲段一。", "乙段二。",                     // 4–6
    "要被删掉的一行。",                             // 7  ← 纯删（宽度为零的定位点）
    "丙段三。", "丁段四。", "",                     // 8–10
    "尾段。", "",
  ].join("\n")
  const root = project("g10", { [DOC_REL]: body })
  const content = body.replace("要被删掉的一行。\n", "")
  const res = await runDocWriteGate({ abs: join(root, DOC_REL), content, root })
  assert.equal(res.hits, 0, "纯删行归本笔，邻段存量不连坐")
  // 红侧：同一笔的判定区若写成整档 ⇒ 那处存量锚立刻阻断
  const whole = runDocCheck(root, { mode: "gate", docs: [DOC_REL], texts: new Map([[join(root, DOC_REL), content]]), zones: new Map([[join(root, DOC_REL), [{ start: 1, end: content.split("\n").length }]]]) })
  assert.equal(first(whole.report), "DOC-CHECK GATE: REFUSED（锚 1 条）", whole.report)
})

// ── 第四组 · 单源与零回归（AC-G11 – AC-G14）─────────────────────────────────────

test("AC-G11 判定一处实现 / 红侧：探测器在确实在调的档上会命中", () => {
  const read = (rel) => readFileSync(join(REPO, rel), "utf8")
  for (const rel of ["thincoder-core/tools/doc-write-gate.mjs", "thincoder-core/agent-tools/batch-gate.mjs"]) {
    const src = read(rel)
    assert.match(src, /runDocCheck\(/, `${rel} 走引擎入口`)
    assert.doesNotMatch(src, /checkAnchors\(/, `${rel} 不得自带锚判`)
    assert.doesNotMatch(src, /resolvePathTarget\(/, `${rel} 不得自带解析序`)
  }
  // 红侧：同一对谓词在**确实在调**的档上命中 ⇒ 探测器本身能红
  assert.match(read("thincoder-core/doc-check/index.mjs"), /checkAnchors\(/, "引擎档含 checkAnchors")
})

test("AC-G12 交付面零回归 / 红侧：texts 缺省写成空串 ⇒ 报面漂", () => {
  const root = project("g12", { [DOC_REL]: docBody() })
  const plain = runDocCheck(root, { docs: [DOC_REL] })
  const same = runDocCheck(root, { docs: [DOC_REL], texts: new Map(), zones: new Map() })
  assert.equal(same.report, plain.report, "两个入参缺省的形与不给同形")
  assert.equal(same.stockHits.length, 0, "没交 zones ⇒ 没有存量桶")
  // 红侧：把该档的文本当成空串交进去 ⇒ 命中消失、报面与不给逐字不同
  const blank = runDocCheck(root, { docs: [DOC_REL], texts: new Map([[join(root, DOC_REL), ""]]) })
  assert.notEqual(blank.report, plain.report, "空串是「空档」不是「不覆盖」")
  assert.equal(blank.hits.total, 0, "空档零命中")
})

test("AC-G13 片段档退役不留残 / 红侧：同一扫描器在盘上有东西可找", () => {
  const names = ["DOCGATE_PREFIX", "writeFragment", "alignZonesToFences", "fenceBlocks", "zoneOf", ".docgate-"]
  // 域 = **跟踪面**（`git ls-files`；与 §2.10.2「域 = 跟踪面的 `*.mjs` ∥ `*.md`」同一条口径）扣 `docs/batches/**`
  const tracked = execFileSync("git", ["-C", REPO, "ls-files"], { encoding: "utf8" }).split("\n").filter(Boolean)
  const inDomain = tracked.filter((f) => /\.(mjs|md)$/.test(f) && !f.startsWith("docs/batches/"))
  const hits = []
  const counts = {}
  for (const rel of inDomain) {
    const src = readFileSync(join(REPO, rel), "utf8")
    for (const n of names) {
      // `zoneOf` 作子串会撞 `getTimezoneOffset`（另有其名）：按整词筛；其余按出现次数计
      const re = n === "zoneOf" ? /(^|[^A-Za-z])zoneOf([^A-Za-z]|$)/g : new RegExp(n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")
      const c = (src.match(re) ?? []).length
      if (!c) continue
      hits.push({ file: rel, name: n })
      counts[rel] = counts[rel] ?? {}
      counts[rel][n] = c
    }
  }
  // ① 代码面（一切 `*.mjs`）零残留 —— 这一半是本批的实现面，必须是 0
  assert.deepEqual(hits.filter((h) => h.file.endsWith(".mjs")), [], `代码面残留：\n${JSON.stringify(hits, null, 2)}`)
  // ② 文档面（`*.md`）：**逐档逐名次数钉死**，不是「按档名放行」。
  //    次数一变（多写一句残留）用例立刻红；次数变少也红（那是文档所有者修了，本档该把期望值收小）。
  //    两类条目的身份写在注释里，读者一眼分得清哪些是**定义性点名**、哪些是**待修残留**：
  //    · `docs/core/design/DOC-CHECK.md` —— §2.10.2 定义这个簇（不点名字就写不出清扫口径）⇒ 定义性点名，须保留；
  //    · `docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/design/EDIT.md` 的 `.docgate-` —— **待修残留**：
  //      片段档一族已退役、写前门不再落碎片档，那几处仍把它写成现行行为。文档所有者的笔，已随交付报告上抛；
  //      修掉后这几格归 0，本用例随即变红，逼着把期望值收回到「只剩定义性点名」。
  assert.deepEqual(counts, {
    "docs/core/design/DOC-CHECK.md": { DOCGATE_PREFIX: 2, writeFragment: 2, alignZonesToFences: 2, fenceBlocks: 1, zoneOf: 1, ".docgate-": 3 },
    "docs/core/design/DOC-DISCIPLINE.md": { ".docgate-": 3 },
    "docs/core/design/EDIT.md": { ".docgate-": 2 },
  }, `文档面残留的逐档次数变了：\n${JSON.stringify(counts, null, 2)}`)
  // 红侧：扫一个确实还在盘的字面 ⇒ 扫描器能命中（不是恒空的扫描）
  assert.ok(readFileSync(join(REPO, "thincoder-core/doc-check/index.mjs"), "utf8").includes("DOC_CHECK_BUILTINS"))
})

test("AC-G14 形分档落到行号面 / 红侧：正反两例互为红侧", () => {
  const root = project("g14", {
    "docs/x.py": "print('fixture')\n", // 在盘 ⇒ 正例只剩行号那一类命中，锚不掺进来
    "docs/design/path.md": "# 甲\n\n见 docs/x.py:12 一处。\n",
    "docs/design/bare.md": "# 乙\n\n见 x.py:12 一处。\n",
  })
  const positive = runDocCheck(root, { mode: "gate", docs: ["docs/design/path.md"] })
  assert.equal(first(positive.report), "DOC-CHECK GATE: REFUSED（行号坐标 1 处）", positive.report)
  assert.equal(positive.hits.lineRefs, 1)
  const negative = runDocCheck(root, { mode: "gate", docs: ["docs/design/bare.md"] })
  assert.equal(first(negative.report), "DOC-CHECK GATE: PASS", negative.report)
  assert.equal(negative.hits.lineRefs, 0, "裸写的代码族档名在形分档挡下 ⇒ 行号面同吃这一谓词")
})

const readdirSafe = (p) => {
  try { return readdirSync(p) } catch { return [] }
}
void sep
