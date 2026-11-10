/**
 * doc-check-brace-group.test.mjs — 集成用例 38-1（RTM CLI 端故事 38「交付门看得见花括号组形：解不到就判红，
 * 命中点名原 token 与缺的展开名」；用例行原文 = `test/rtm/guard.md` 第 38 节）。
 *
 * 业务入口 = 真 `doc_check` 工具调用（`mode:"gate"` + 显式 `docs`），断言面 = 工具回执文本：首行判决串与命中行
 * （业务可观察结果），不直调引擎、不断言内部结构。
 * 门要治的形 = 一个花括号组形 token 同时指 N 个档：`{` `,` `}` 都不在档 token 的字符类内 ⇒ 整个形不在判面里，
 *   既不红也不绿。展开成具体名后逐名判存在性，「解不到就是错的」那条判据照旧生效——不新增第二条规则。
 * 三半同跑：红半（两展开名都不在盘）∥ 绿半（两展开名都在盘）∥ 反证（组内含 `/`：取值枚举不是文件名列举）。
 *
 * 机制 = `docs/core/design/DOC-DISCIPLINE.md` §3.27 条目 AA 的边界句 ∥ §5 `A-DD42` ⑤
 *   （判据本体 = 解析序 ∥ 判决词 ∥ 豁免谓词 ∥ 阈值四样零改，花括号组展开是抽取面新加的一支）。
 * 夹具 = 系统临时域（`mkdtempSync`）⇒ 零落仓 + 并发免疫；临时域在仓外 ⇒ 第 6′ 步唯一后缀兜底也找不到仓内同名档
 *   （否则「不在盘」这一半在仓内会假绿）。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-check-brace-group.test.mjs`
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
  const root = mkdtempSync(join(tmpdir(), "brace-group-"))
  TMP.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

/** 跑一次交付门（本用例唯一的进入口）。 */
function gate(root, docRel) {
  return docCheckTool.execute({ mode: "gate", docs: [join(root, docRel)], target: root }, { agent: { cwd: root } })
}

after(() => { for (const d of TMP) removeTempDirBestEffort(d) })

test("CLI 38-1 花括号组形：解不到判红并点名缺的展开名 ∥ 都在盘判绿 ∥ 取值枚举不展开", () => {
  // ── 红半：两个展开名都不在盘 ⇒ 一处写成两件，逐条点名（原 token + 缺的那个名字）
  //    组形写成**带目录段**的形：形分档下裸写的代码族档名不是候选（判据 = `docs/core/design/DOC-CHECK.md` §2.10.3），
  //    而本用例要断的是「花括号组展开后逐名判存在性」这件事。
  const red = fixture({ "d.md": "# 设计档\n\n门面 `tools/i18n-{zh,en}-core.mjs` 一处。\n" })
  const redOut = gate(red, "d.md")
  const redLines = redOut.split("\n")
  assert.equal(redLines[0], "DOC-CHECK GATE: REFUSED（锚 2 条）", redOut)
  const redHits = redLines.filter((l) => l.startsWith("✗ "))
  assert.equal(redHits.length, 2, redOut)
  // 两条命中行都要同时点名原 token 与缺的那个展开名——只报其一，读的人要么看不出该改哪一行，要么拿到一个从没写过的名字
  for (const [line, missing] of [[redHits[0], "tools/i18n-zh-core.mjs"], [redHits[1], "tools/i18n-en-core.mjs"]]) {
    assert.ok(line.includes("tools/i18n-{zh,en}-core.mjs"), redOut)
    assert.ok(line.includes(missing), redOut)
  }

  // ── 绿半：同一行、两展开名都落到盘 ⇒ 解得到 ⇒ 放行（写法不限，解得出就是对的）
  const green = fixture({
    "d.md": "# 设计档\n\n门面 `tools/i18n-{zh,en}-core.mjs` 一处。\n",
    "tools/i18n-zh-core.mjs": "export default {}\n",
    "tools/i18n-en-core.mjs": "export default {}\n",
  })
  const greenOut = gate(green, "d.md")
  assert.equal(greenOut.split("\n")[0], "DOC-CHECK GATE: PASS", greenOut)
  assert.ok(greenOut.includes("结论：0 段有问题"), greenOut)

  // ── 反证：组内带 `/` 的不是文件名列举 ⇒ 不展开（展开会凭空造出两个不存在的名字）
  //    两形都跑：① 本批现场的取值枚举原文（带空格，无扩展名）② 带扩展名且无空格的那一形
  //    ——② 才是真正钉住「组内含 `/`」的那一半：若成员字符类有一天放宽到收 `/`，② 当场出两条命中，① 不会。
  const enumLike = fixture({ "d.md": "# 设计档\n\n状态 `{ running / queued / done }` 三态，形如 `x-{a/b,c}.md`。\n" })
  const enumOut = gate(enumLike, "d.md")
  assert.equal(enumOut.split("\n")[0], "DOC-CHECK GATE: PASS", enumOut)
  assert.equal(enumOut.split("\n").filter((l) => l.startsWith("✗ ")).length, 0, enumOut)
})