/**
 * manifest-init-default.test.mjs —— 集成用例 9-2（RTM CLI 端故事 9「项目根解析：工作区锚不就地建档」；
 * 判据 = `docs/core/design/MANIFEST.md` AC-31 ∥ §2.4.1「`codePaths` 缺省值：`["src"]` → `[]`」·
 * 声明语义 = `docs/core/design/PORTABILITY.md` §3.1）。
 *
 * 业务入口 = 真 `manifest` 工具（`agent-tools/manifest.mjs`）的 `init`——用户建档拿到的就是这份默认档。
 * 判据只留工具可观测的两项：① 档内 `codePaths` 的读数；② 同一仓里 `src/` 下文档后缀文件的分类读数
 * （分类器是纯路径谓词，读数即 `classifyPath` 的返回值，不依 fs 内容）。
 * 态归属：正常 = 建档后默认段为空、`src/**` 的文档后缀文件判文档；对照 = 显式声明 `["src"]` 后同一
 * 路径回到代码面（同值回归护：`src/x.mjs` 改前改后都判代码，不作红断言）。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { manifestTool } from "../../thincoder-core/agent-tools/manifest.mjs"
import { classifyPath, clearDeclarationCache, loadProjectDeclaration } from "../../thincoder-core/conventions.mjs"

test('CLI 9-2 默认档不带代码段：未声明 codePaths 的仓里 src 下文档判文档', { timeout: 60_000 }, async (t) => {
  const box = mkdtempSync(join(tmpdir(), "tc-int-init-default-"))
  t.after(() => {
    clearDeclarationCache()
    removeTempDirBestEffort(box)
  })
  const ctx = { agent: { cwd: box } }

  // ① 空目录建档 —— 写出的默认档里的代码段读数
  const receipt = await manifestTool.execute({ action: "init", target: box }, ctx)
  assert.match(receipt, /^manifest init: created default manifest/, `建档回执形，实际：${receipt}`)
  const file = join(box, "PROJECT-MANIFEST.json")
  assert.equal(existsSync(file), true, "默认档落在项目根")
  const written = JSON.parse(readFileSync(file, "utf8"))
  const segs = written.codePaths
  assert.ok(
    segs === undefined || (Array.isArray(segs) && segs.length === 0),
    `默认档的 codePaths 须缺键或为 []，实际：${JSON.stringify(segs)}`,
  )

  // 夹具：同一仓内的代码段布局（`src/` 段名 + 一个文档后缀档 + 一个脚本）
  mkdirSync(join(box, "src"), { recursive: true })
  writeFileSync(join(box, "src", "x.md"), "# fixture\n")
  writeFileSync(join(box, "src", "x.mjs"), "export const x = 1\n")

  // ② 未声明代码段 ⇒ 段面为空：`src` 下的文档后缀文件判文档；脚本仍判代码（兜底那一支还在）
  clearDeclarationCache()
  const undeclared = loadProjectDeclaration(box)
  assert.equal(classifyPath(join(box, "src", "x.md"), undeclared), "doc", "未声明代码段的仓里 src/x.md 判文档")
  assert.equal(classifyPath(join(box, "src", "x.mjs"), undeclared), "code", "src/x.mjs 判代码（回归护——改前改后同值）")

  // ③ 对照：显式声明 ["src"] ⇒ 同一路径回到代码面（收回路径 = 项目自己宣告布局）
  await manifestTool.execute({ action: "write", target: box, key: "codePaths", value: '["src"]' }, ctx)
  clearDeclarationCache()
  const declared = loadProjectDeclaration(box)
  assert.equal(classifyPath(join(box, "src", "x.md"), declared), "code", "声明 src 段后 src/x.md 判代码")
  assert.equal(classifyPath(join(box, "src", "x.mjs"), declared), "code", "声明 src 段后 src/x.mjs 判代码（回归护）")
})
