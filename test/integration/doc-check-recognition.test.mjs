/**
 * doc-check-recognition.test.mjs — 集成用例 44-1 ∥ 44-2（RTM CLI 端故事 44「交付门认得中文档名与真后缀，代码表达式与版本号不误报」；
 * 用例行原文 = `test/rtm/guard.md` 第 44 节）。
 *
 * 业务入口 = 真 `doc_check` 工具调用（`mode:"gate"` / `mode:"report"` + 显式 `docs` + `target`）。
 * 业务可观察结果 = 七段：① 中文悬空名判红、中文在盘档与普通中文词零命中；② 真后缀判红；③ 伪后缀 ∥ 数字形 ∥
 * 代码表达式 ∥ 版本区间 ∥ 归档名全零命中；④ 项目增补的后缀只在它自己那个仓生效（裸名位不成候选——增补项是后缀清单，
 * 不是族划分面，§2.10.3）；⑤ `report` 的清单读数只在该仓出；
 * ⑥ 项目把清单收窄成 `md` 时缺省项照旧生效（并集不替换）；⑦ 中文散文紧贴的形**多报一条整段 token**（该形的实测方向），
 * 两条写法出口（反引号包住 ∥ 与前后汉字留一个空格）回到零命中。
 * 判据 = `docs/core/design/DOC-CHECK.md` §2.6（名字字符类 ∥ 扩展名形护 ∥ 生效清单 = 缺省 ∪ 项目项，装配处过滤）
 * ∥ §6 AC-R1–AC-R4；回指 = `docs/core/requirements/DOC-CHECK.md` F18 ∥ AC-16 ∥ F19 ∥ AC-17。
 *
 * 夹具 = 系统临时域（`mkdtempSync`）⇒ 零落仓 + 并发免疫。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-check-recognition.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { docCheckTool } from "../../thincoder-core/agent-tools/doc-check.mjs"

const TMP = []
after(() => { for (const d of TMP) removeTempDirBestEffort(d) })

/** 夹具：`{相对路径: 内容}` ⇒ 临时域根（绝对路径）。 */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "dcrc-integration-"))
  TMP.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

/** 夹具 manifest；`exts === undefined` ⇒ 不写该键（= 只用缺省清单）。 */
const manifestText = (exts) => JSON.stringify({
  version: 1,
  docRoot: { batches: "docs/batches" },
  ...(exts === undefined ? {} : { index: { docCheckExts: exts } }),
}, null, 2) + "\n"

const hitLines = (report) => report.split("\n").filter((l) => l.includes("✗ "))

test("CLI 44-1 识别面：中文档名判得出、普通中文词与代码表达式零误报、项目增补后缀只在本仓生效", () => {
  const ws = fixture({
    "projA/PROJECT-MANIFEST.json": manifestText(["tsv", "md"]),
    "projA/docs/a.md": [
      "# 甲档",
      "",
      "普通中文词：需求档、设计档、依据设计档。",
      "中文悬空名：不存在的中文名文档.md",
      "中文在盘档：docs/子目录/设计.md",
      "真后缀：docs/x.py",
      "伪后缀：docs/notes.xyz",
      "数字形：1.5 与 v2.0 与 192.168.1.1",
      "代码表达式：JSON.parse 与 console.log 与 process.env",
      "版本区间：20.x/22.x",
      "归档名：build/app.tar.gz",
      "增补后缀：docs/x.tsv（带目录段的形；裸写的 `x.tsv` 不成候选——形分档只看文档名族）",
      "裸名增补后缀：x.tsv",
      "",
    ].join("\n"),
    "projA/docs/子目录/设计.md": "# 在盘的中文档\n\n干净，没有指针。\n",
    "projA/docs/在盘档.md": "# 另一个在盘的中文档\n\n干净，没有指针。\n",
    "projB/PROJECT-MANIFEST.json": manifestText(undefined),
    "projB/docs/b.md": "# 乙档\n\n增补后缀 token：docs/x.tsv\n",
  })
  const docs = [join(ws, "projA/docs/a.md"), join(ws, "projB/docs/b.md")]
  const run = (mode) => docCheckTool.execute({ mode, docs, target: ws }, { agent: { cwd: ws } })

  const g1 = run("gate")
  const first1 = g1.split("\n")[0]
  assert.equal(first1.startsWith("DOC-CHECK GATE: REFUSED"), true, g1)
  const hits1 = hitLines(g1)
  const names = hits1.map((l) => l.replace(/^\[[^\]]+\] /, ""))

  // ① 中文悬空名判红；中文在盘档 ∥ 普通中文词零命中
  assert.equal(names.some((l) => l.includes("锚·档缺") && l.includes("不存在的中文名文档.md")), true, `中文悬空名未判出：\n${g1}`)
  assert.equal(g1.includes("docs/子目录/设计.md"), false, `中文在盘档不得出现：\n${g1}`)
  for (const word of ["需求档", "设计档、", "依据设计档"]) {
    assert.equal(hits1.some((l) => l.includes(word)), false, `普通中文词被认成档名：\n${g1}`)
  }
  // ② 真后缀判红（缺省清单内）
  assert.equal(names.some((l) => l.includes("锚·档缺") && l.includes("docs/x.py")), true, `真后缀未判出：\n${g1}`)
  // ③ 伪后缀 ∥ 数字形 ∥ 代码表达式 ∥ 版本区间 ∥ 归档名全零命中（不成候选）
  for (const token of ["notes.xyz", "1.5", "v2.0", "192.168.1.1", "JSON.parse", "console.log", "process.env", "20.x/22.x", "build/app.tar.gz"]) {
    assert.equal(hits1.some((l) => l.includes(token)), false, `${token} 不得成为候选：\n${g1}`)
  }
  // ④ 增补后缀只在本仓生效：甲判红、乙零命中
  const aHits = hits1.filter((l) => l.startsWith("[projA]"))
  const bHits = hits1.filter((l) => l.startsWith("[projB]"))
  assert.equal(aHits.some((l) => l.includes("x.tsv")), true, `甲的增补后缀未判出：\n${g1}`)
  assert.equal(bHits.some((l) => l.includes("x.tsv")), false, `乙不该吃到甲的后缀：\n${g1}`)

  // ⑤ 清单读数只在写了这一项的仓出（甲 2 项、乙零出）
  const rep = run("report")
  const extLines = rep.split("\n").filter((l) => l.includes("扩展名清单：缺省 + 本仓"))
  assert.equal(extLines.length, 1, `清单读数行数不符：\n${rep}`)
  assert.equal(extLines[0].includes("本仓 2 项"), true, rep)
  assert.equal(extLines[0].includes("projA"), true, `读数行未点名写的那个仓：\n${rep}`)

  // ⑥ 并集不替换：把甲的键收成 md 一项，缺省清单里的真后缀照旧判红
  writeFileSync(join(ws, "projA/PROJECT-MANIFEST.json"), manifestText(["md"]))
  const g2 = run("gate")
  assert.equal(g2.split("\n")[0].startsWith("DOC-CHECK GATE: REFUSED"), true, g2)
  assert.equal(hitLines(g2).some((l) => l.includes("docs/x.py")), true, `收窄清单后缺省项失效（并集被当成替换）：\n${g2}`)
  // 全文只有一条 verdict
  assert.equal((g1.match(/DOC-CHECK GATE:/g) ?? []).length, 1, g1)

  // ⑦ 中文散文紧贴的形：**多报一条长 token**（整段被判档缺）——这是该形的实测方向；两条写法出口回到零命中
  const glued = join(ws, "projA/docs/g.md")
  writeFileSync(glued, "# g\n\n见在盘档.md 前面的中文没有分隔。\n")
  const gGlued = docCheckTool.execute({ mode: "gate", docs: ["docs/g.md"], target: join(ws, "projA") }, { agent: { cwd: join(ws, "projA") } })
  const gluedHits = hitLines(gGlued)
  assert.equal(gluedHits.length, 1, `紧贴形应多报一条：\n${gGlued}`)
  assert.equal(gluedHits[0].includes("见在盘档.md"), true, `报的应是整段 token：\n${gGlued}`)
  // 写法出口两条：反引号包住 ∥ 与前后汉字留一个空格 ⇒ 同一指针零命中
  for (const body of ["# g\n\n见 `在盘档.md` 前面的中文有反引号分隔。\n", "# g\n\n见 在盘档.md 前面的中文有空格分隔。\n"]) {
    writeFileSync(glued, body)
    const gEscaped = docCheckTool.execute({ mode: "gate", docs: ["docs/g.md"], target: join(ws, "projA") }, { agent: { cwd: join(ws, "projA") } })
    assert.equal(gEscaped.split("\n")[0], "DOC-CHECK GATE: PASS", `写法出口未回到零命中：\n${gEscaped}`)
  }
})

test("CLI 44-2 边界 · 同行命令码段不连坐散文路径码段；无命令段时同一路径照判", () => {
  const root = fixture({
    "PROJECT-MANIFEST.json": manifestText(undefined),
    "docs/design/mixed.md": "# mixed\n\n执行 `node script.mjs` 后见 `docs/design/missing.md`。",
  })
  const run = () => docCheckTool.execute({ mode: "gate", docs: ["docs/design/mixed.md"], target: root }, { agent: { cwd: root } })
  const mixed = run()
  assert.equal(mixed.split("\n")[0], "DOC-CHECK GATE: REFUSED（锚 1 条）", mixed)
  assert.equal(hitLines(mixed).filter((l) => l.includes("docs/design/missing.md")).length, 1, mixed)
  assert.equal(hitLines(mixed).some((l) => l.includes("script.mjs")), false, mixed)

  writeFileSync(join(root, "docs/design/mixed.md"), "# mixed\n\n见 `docs/design/missing.md`。")
  const plain = run()
  assert.equal(plain.split("\n")[0], "DOC-CHECK GATE: REFUSED（锚 1 条）", plain)
  assert.equal(hitLines(plain).filter((l) => l.includes("docs/design/missing.md")).length, 1, plain)
})
