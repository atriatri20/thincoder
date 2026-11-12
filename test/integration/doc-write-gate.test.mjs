/**
 * doc-write-gate.test.mjs — 集成用例 7-14 ∥ 7-18 ∥ 7-27 ∥ 7-28（RTM CLI 端故事 7；判据原文 = `test/rtm/guard.md` 第 7 节）。
 *
 * 机制 = `docs/core/design/DOC-CHECK.md` §5（报什么）∥ §6（写时点怎么取区间）∥ §9（写时点）；
 * 需求 = `docs/core/requirements/DOC-CHECK.md` F1 ∥ F3 ∥ F10 ∥ AC-1 ∥ AC-3 ∥ AC-13 ∥ AC-14。
 *
 * 业务入口 = 真 `edit` 工具（`tools/file.mjs`）往一篇**设计档**写一笔——不直调 `runDocWriteGate`：
 * 本例测的是「写者把坏字写进规范档、当场被拒、盘上逐字不变」这件事的业务可观察结果。
 * 交互组件 = `write-path.writeThroughPath`（`op === "write"` 调门）⟷ `doc-write-gate.runDocWriteGate`
 * （盘上现文与改后文本两份求出的区间交 `doc-check` 的三条判据：段长 ∥ 行号锚 ∥ 悬空指针——区外存量一条不出）。
 *
 * 夹具 = 系统临时域（项目根 + 自带 `PROJECT-MANIFEST.json`，`docRoot.design = docs/design`）——零落仓、可并发；
 * 面与解析基准随夹具走，不读本仓 manifest。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-write-gate.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { editTool } from "../../thincoder-core/tools/file.mjs"
import { judgeText } from "../../thincoder-core/doc-check/index.mjs"

const DOC_REL = "docs/design/fixture.md"
const REAL_REL = "docs/design/real.md" // 在盘档（改成这条之后同一笔应当落盘）
const BODY = "# 夹具设计档\n\n现有段落。\n"

const projects = []
after(() => {
  // 句柄未即释时清理会抛 ⇒ 走助手（有界重试、失败只写一行 stderr，不判红整档）。
  for (const p of projects) removeTempDirBestEffort(p)
})

/** 夹具项目根（项目声明 + 设计档目录；不落盘任何真实仓内容）。 */
function makeProject(tag) {
  const root = mkdtempSync(join(tmpdir(), `dwg-int-${tag}-`))
  projects.push(root)
  writeFileSync(
    join(root, "PROJECT-MANIFEST.json"),
    JSON.stringify({ version: 1, phase: "initial-dev", docRoot: { design: "docs/design", batches: "docs/batches" } }, null, 2),
  )
  mkdirSync(join(root, "docs/design"), { recursive: true })
  writeFileSync(join(root, REAL_REL), "# 在盘档\n\n这一档存在。\n")
  writeFileSync(join(root, DOC_REL), BODY)
  return root
}

test("CLI 7-14 错误 · 设计档直写盘带悬空档名 ⇒ 拒写、目标档逐字不变；改成在盘全路径后同一笔落盘", async () => {
  const root = makeProject("r714")
  const before = readFileSync(join(root, DOC_REL), "utf8")
  const ctx = { cwd: root }

  // ① 写一笔含悬空档名的段落 ⇒ 拒写（坏字当场进不了盘）
  await assert.rejects(
    () => editTool.execute({ path: DOC_REL, old_string: "现有段落。", new_string: `现有段落，另见 \`docs/design/nope.md\`。` }, ctx),
    (e) => {
      assert.match(e.message, /^doc_write_gate: 文档机检门拒写/, `拒串首行 = 写门报位：${e.message}`)
      assert.match(e.message, /DOC-CHECK GATE: REFUSED/, `拒串携引擎 verdict 词：${e.message}`)
      assert.match(e.message, /docs\/design\/fixture\.md docs\/design\/nope\.md 这个档不存在/, `命中行落回目标档：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root, DOC_REL), "utf8"), before, "拒写 ⇒ 目标档字节逐字不变（零字节落盘）")

  // ② 改成在盘全路径 ⇒ 同一笔落盘成功（门不是「一律拦」，判的还是这段字）
  const receipt = await editTool.execute({ path: DOC_REL, old_string: "现有段落。", new_string: `现有段落，另见 \`${REAL_REL}\`。` }, ctx)
  assert.match(receipt, /Edited docs\/design\/fixture\.md/, `落盘回执：${receipt}`)
  const after = readFileSync(join(root, DOC_REL), "utf8")
  assert.match(after, new RegExp(`另见 \`${REAL_REL}\``), "改对之后已落盘")
  assert.equal(after.slice(0, after.indexOf("现有段落")), before.slice(0, before.indexOf("现有段落")), "目标段之前逐字不变")
})

test("CLI 7-18 边界 · 只动围栏块内一个空行 ⇒ 判面 = 那一行、块内示例路径不入判", async () => {
  const root = makeProject("r718")
  const fenced = "# 围栏夹具\n\n```text\ndocs/design/example-only.md\n\n```\n"
  writeFileSync(join(root, DOC_REL), fenced)
  const receipt = await editTool.execute({
    path: DOC_REL,
    old_string: "```text\ndocs/design/example-only.md\n\n```",
    new_string: "```text\ndocs/design/example-only.md\n```",
  }, { cwd: root })
  assert.match(receipt, /Edited docs\/design\/fixture\.md/, receipt)
  assert.equal(readFileSync(join(root, DOC_REL), "utf8"), fenced.replace("example-only.md\n\n```", "example-only.md\n```"))
})

// 7-27：写门判**这一笔改的行**（F10 ∥ AC-13）——同一份档上，区外存量三样一条都不出；改到存量段里 ⇒ 照拒。
const STOCK_PARA = "长".repeat(348) + "尾部" // 350 字：只有段在区内才量
const STOCK_ANCHOR = "见 docs/batches/fixture.md:12 的判据。"
const STOCK_DANGLING = "夹具见 `docs/design/nope.md` 的说明。"
const SAFE_LINE = "本笔只改这一行。"
const stockDoc = () => ["# 存量三样夹具", "", STOCK_PARA, "", STOCK_ANCHOR, "", STOCK_DANGLING, "", SAFE_LINE, ""].join("\n")

test("CLI 7-27 边界 · 区外存量三样一条不出（照落盘）∥ 改到那段 350 字的段内一行 ⇒ 拒写、点名该段", async () => {
  const root = makeProject("r727")
  // 行号锚那一行点名的档真在盘 ⇒ 存量的三条命中是一段太长 ∥ 行号锚 ∥ 悬空，不混进第二条悬空。
  mkdirSync(join(root, "docs/batches"), { recursive: true })
  writeFileSync(join(root, "docs/batches/fixture.md"), "# 锚点档\n\n甚而。\n")
  const abs = join(root, DOC_REL)
  const before = stockDoc()
  writeFileSync(abs, before)
  const ctx = { cwd: root }

  // 夹具自检（红侧的可观测形）：这份档按整份判就是三条命中——写门若仍交 `null`，下面那两笔都会被它拦下。
  const whole = judgeText(before, { file: abs, root, region: null })
  assert.equal(whole.length, 3, `夹具自带存量三样（整份判 ⇒ 三条命中）：${whole.map((h) => h.kind).join(",")}`)

  // 甲：只改一行无关文字 ⇒ 区内没有那三样 ⇒ 落盘、零命中
  const receipt = await editTool.execute({ path: DOC_REL, old_string: SAFE_LINE, new_string: "本笔改过这一行。" }, ctx)
  assert.match(receipt, /Edited docs\/design\/fixture\.md/, `区外存量不拦这一笔：${receipt}`)
  assert.doesNotMatch(receipt, /REFUSED/, `落盘回执不带拒串：${receipt}`)
  assert.equal(readFileSync(abs, "utf8"), before.replace(SAFE_LINE, "本笔改过这一行。"), "只有那一行变了")

  // 乙：改到那段 350 字的段内某一行 ⇒ 整段量、拒写、点名该段；区外那两条一个字都不出
  const bytes = readFileSync(abs, "utf8")
  await assert.rejects(
    () => editTool.execute({ path: DOC_REL, old_string: "尾部", new_string: "末段" }, ctx),
    (e) => {
      assert.match(e.message, /第 \d+ 段 350 字，超过 300/, `区内段照量、按段扩：${e.message}`)
      assert.doesNotMatch(e.message, /nope\.md/, `区外那条悬空一个字都不出：${e.message}`)
      assert.doesNotMatch(e.message, /用行号做锚/, `区外那条行号锚也不出：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(abs, "utf8"), bytes, "拒写 ⇒ 上一笔落盘后的字节逐字不变")
})

// 7-28：纯删的缝合（F10 ∥ AC-14）——`gaps` 只喂段长；把那个返回值丢掉，这一行就断不出来。
const MERGE_A = "甲".repeat(160)
const MERGE_B = "乙".repeat(160)
const mergeDoc = () => ["# 纯删夹具", "", MERGE_A, "", MERGE_B, ""].join("\n")

test("CLI 7-28 边界 · 删掉两段之间的空行使两段接成 320 字的一段 ⇒ 拒写、点名该段；同一笔里同时把其中一段删短 ⇒ 零输出", async () => {
  const root = makeProject("r728")
  const abs = join(root, DOC_REL)
  writeFileSync(abs, mergeDoc())
  const ctx = { cwd: root }

  // 甲：只删那个空行 ⇒ 两段接成 320 字的一段 ⇒ 拒写（这一段是本笔造成的，段长认缝）
  const before = readFileSync(abs, "utf8")
  await assert.rejects(
    () => editTool.execute({ path: DOC_REL, old_string: `${MERGE_A}\n\n${MERGE_B}`, new_string: `${MERGE_A}\n${MERGE_B}` }, ctx),
    (e) => {
      assert.match(e.message, /第 \d+ 段 320 字，超过 300/, `缝合接出来的段照量：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(abs, "utf8"), before, "拒写 ⇒ 零字节")

  // 乙：同一笔里把甲段删短到 100 字 ⇒ 接起来 260 字、不超阈值 ⇒ 零输出、落盘
  const receipt = await editTool.execute({
    path: DOC_REL,
    old_string: `${MERGE_A}\n\n${MERGE_B}`,
    new_string: `${"甲".repeat(100)}\n${MERGE_B}`,
  }, ctx)
  assert.match(receipt, /Edited docs\/design\/fixture\.md/, `接出来不超 ⇒ 落盘：${receipt}`)
  assert.equal(
    readFileSync(join(root, DOC_REL), "utf8"),
    mergeDoc().replace(`${MERGE_A}\n\n${MERGE_B}`, `${"甲".repeat(100)}\n${MERGE_B}`),
    "两段接成一段、只有甲段变短",
  )
})
