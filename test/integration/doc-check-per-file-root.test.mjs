/**
 * doc-check-per-file-root.test.mjs — 集成用例 36-1 ∥ 36-2（RTM CLI 端故事 36「跨项目文档清单的交付门按各档自身项目根判」；
 * 用例行原文 = `test/rtm/guard.md` 第 36 节）。
 *
 * 业务入口 = 真 `doc_check` 工具调用（`mode:"gate"` + 显式 `docs`），会话锚 = 工作区（下辖两个项目、自身无 manifest）——
 * 一次交付轮里两档同判，正是本批现场真撞过的场景（三份评审拿不到令牌 ∥ 跨仓写入同病）。
 * 断言面 = 工具回执文本：首行判决串、范围行与命中行标签（业务可观察结果），不直调引擎、不断言内部结构。
 * 36-1 夹具里两档**各带一处只在自己项目根下解析得到**的仓根相对指针 ⇒ 首行 `PASS` 依赖「每档按自身根解析」：
 *   若两档被按同一个错根判，两处指针都解析不到 ⇒ 判 `档缺` 出 `REFUSED`，本用例当场红（无指针的夹具证不到这一点）。
 * 36-2 夹具里两个项目根**同名**（各叫 `web`）⇒ 标签必取最短唯一定位后缀：取根目录名时两行都写 `[web]`，当场红。
 *
 * 机制 = `docs/core/design/DOC-CHECK.md` §2.1（`rootOf` 按档定根）∥ §2.3（≥2 根：标签取最短唯一定位后缀）∥ §6 AC-1 ∥ AC-6。
 * 夹具 = 系统临时域（`mkdtempSync`）⇒ 零落仓 + 并发免疫。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/doc-check-per-file-root.test.mjs`
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
  const root = mkdtempSync(join(tmpdir(), "pfr-integration-"))
  TMP.push(root)
  for (const [rel, body] of Object.entries(files)) {
    const p = join(root, rel)
    mkdirSync(dirname(p), { recursive: true })
    writeFileSync(p, body)
  }
  return root
}

after(() => { for (const d of TMP) removeTempDirBestEffort(d) })

test("CLI 36-1 工作区里两个项目的两档同判：首行 PASS，范围行列两个项目根", () => {
  // 两个项目各一份 manifest、各一档；会话锚 = 它们所在的工作区（自身没有 manifest）
  const ws = fixture({
    "projA/PROJECT-MANIFEST.json": "{}\n",
    "projA/docs/a.md": "# A 档\n\n指针：docs/a2.md\n",
    "projA/docs/a2.md": "# A2 档\n\n正文。\n",
    "projB/PROJECT-MANIFEST.json": "{}\n",
    "projB/docs/b.md": "# B 档\n\n指针：docs/b2.md\n",
    "projB/docs/b2.md": "# B2 档\n\n正文。\n",
  })
  const docs = [join(ws, "projA/docs/a.md"), join(ws, "projB/docs/b.md")]
  const out = docCheckTool.execute({ mode: "gate", docs }, { agent: { cwd: ws } })
  const lines = out.split("\n")
  assert.equal(lines[0], "DOC-CHECK GATE: PASS", out)
  const range = lines.find((l) => l.startsWith("范围："))
  assert.ok(range, `范围行缺失（缺行时不该以 TypeError 收场）：\n${out}`)
  assert.ok(range.includes(join(ws, "projA")) && range.includes(join(ws, "projB")), out)
  assert.equal(lines.filter((l) => l.startsWith("DOC-CHECK GATE:")).length, 1, out)
})

test("CLI 36-2 两个项目根同名（各叫 web）：每条命中行的标签互不相同", () => {
  // 两个项目根目录同名（`site-a/web` ∥ `site-b/web`），各一档、各带一处悬空指针 ⇒ 两条命中行都带头标签。
  // 标签取根目录名时两行都写 `[web]`，读者分不出是谁的账 ⇒ 本用例红；取最短唯一定位后缀才写得成 `[site-a/web]`。
  const ws = fixture({
    "site-a/web/PROJECT-MANIFEST.json": "{}\n",
    "site-a/web/docs/a.md": "# A 档\n\n指针：docs/nope-a.md\n",
    "site-b/web/PROJECT-MANIFEST.json": "{}\n",
    "site-b/web/docs/b.md": "# B 档\n\n指针：docs/nope-b.md\n",
  })
  const docs = [join(ws, "site-a/web/docs/a.md"), join(ws, "site-b/web/docs/b.md")]
  const out = docCheckTool.execute({ mode: "gate", docs }, { agent: { cwd: ws } })
  const lines = out.split("\n")
  assert.equal(lines[0], "DOC-CHECK GATE: REFUSED（锚 2 条）", out)
  const tags = lines.filter((l) => l.startsWith("[")).map((l) => l.slice(0, l.indexOf("]") + 1))
  assert.equal(tags.length, 2, out)
  // 判据 = 两条标签互不相同，且各是「本次调用的根集」里的最短唯一定位后缀
  assert.notEqual(tags[0], tags[1], out)
  assert.deepEqual([...tags].sort(), ["[site-a/web]", "[site-b/web]"], out)
  // 反例形：取根目录名时那一形（`[web]`）零出
  assert.equal(lines.some((l) => l.startsWith("[web] ")), false, out)
  assert.equal(lines.filter((l) => l.startsWith("DOC-CHECK GATE:")).length, 1, out)
})
