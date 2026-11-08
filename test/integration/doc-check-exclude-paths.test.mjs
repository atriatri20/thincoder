/**
 * doc-check-exclude-paths.test.mjs — 集成用例 36-5（RTM CLI 端故事 36「跨项目文档清单的交付门按各档自身项目根判」；
 * 用例行原文 = `test/rtm/guard.md` 第 36 节）。
 *
 * 业务入口 = 真 `doc_check` 工具调用（`mode:"gate"` + 显式 `docs` + `target`），与 36-1 同一个入口。
 * 业务可观察结果 = 同一份带死指针的档落在 manifest 排除面内 ⇒ 交付门零命中；把它移出排除面 ⇒ 同一份档出 1 条 `档缺`。
 * 判据 = `docs/core/design/DOC-CHECK.md` §2.6（`index.docCheckExcludePaths`：排除改的是**判集**，不是判据）∥ AC-Ex1；
 * 回指 = `docs/core/requirements/DOC-CHECK.md` F3（唯一项目级声明面 = 该键）。
 *
 * 两读同一夹具、同一命令，**只换排除面**——两读首行不相等才证明过滤在起作用（改写前两读都是 `REFUSED`）。
 * 夹具 = 系统临时域（`mkdtempSync`）⇒ 零落仓 + 并发免疫。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-check-exclude-paths.test.mjs`
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

/** 夹具：`{相对路径: 内容}` ⇒ 临时域根（绝对路径）。 */
function fixture(files) {
  const root = mkdtempSync(join(tmpdir(), "dcex-integration-"))
  TMP.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

after(() => { for (const d of TMP) removeTempDirBestEffort(d) })

/** 夹具 manifest（`exclude === undefined` ⇒ 不写该键）。 */
const manifestText = (exclude) => JSON.stringify({
  version: 1,
  docRoot: { batches: "docs/batches" },
  ...(exclude === undefined ? {} : { index: { docCheckExcludePaths: exclude } }),
}, null, 2) + "\n"

test("CLI 36-5 manifest 声明排除目录：排除面内零命中，移出后同一档出 1 条档缺", () => {
  const root = fixture({
    "PROJECT-MANIFEST.json": manifestText(["docs/excluded"]),
    "docs/kept.md": "# kept\n\n正文干净，没有指针。\n",
    "docs/excluded/x.md": "# x\n\n指针：docs/nope.md\n",
  })
  const docs = ["docs/kept.md", "docs/excluded/x.md"]
  // 第一读：x.md 落在排除面内 ⇒ 交付门零命中，回执点名「未判」的那一档
  const inside = docCheckTool.execute({ mode: "gate", docs, target: root }, { agent: { cwd: root } })
  const insideLines = inside.split("\n")
  assert.equal(insideLines[0], "DOC-CHECK GATE: PASS", inside)
  assert.equal(insideLines.some((l) => l.includes("✗ ")), false, `排除档不得出命中：\n${inside}`)
  assert.ok(
    insideLines.includes("排除 1 档（manifest 排除面命中，未判）：docs/excluded/x.md"),
    `排除桶缺失或行形不符：\n${inside}`,
  )
  // 第二读：同一夹具、同一命令，只把 manifest 里该键删掉 ⇒ 同一份档照判 `档缺`
  writeFileSync(join(root, "PROJECT-MANIFEST.json"), manifestText(undefined))
  const outside = docCheckTool.execute({ mode: "gate", docs, target: root }, { agent: { cwd: root } })
  const outsideLines = outside.split("\n")
  assert.equal(outsideLines[0], "DOC-CHECK GATE: REFUSED（锚 1 条）", outside)
  const hitLines = outsideLines.filter((l) => l.includes("✗ "))
  assert.equal(hitLines.length, 1, outside)
  assert.ok(hitLines[0].includes("docs/excluded/x.md") && hitLines[0].includes("档缺"), outside)
  // 两读只差排除面：首行不相等才证明过滤在起作用
  assert.notEqual(insideLines[0], outsideLines[0])
  assert.equal(inside.split("\n").filter((l) => l.startsWith("DOC-CHECK GATE:")).length, 1, inside)
})