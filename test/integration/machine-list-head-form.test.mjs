/**
 * machine-list-head-form.test.mjs — 集成用例 7-31（RTM CLI 端故事 7「收口只判本批改过的档」；
 * 判据原文 = `test/rtm/guard.md` 第 7 节）。
 * 机制 = `docs/core/design/DOC-CHECK.md` §8.1（机读清单块头两形：行首粗体 ∥ 同名小标题行）∥ §8.4（清单读不出行时的拒文）。
 *
 * 业务入口 = 真 `batch` 工具（`agent-tools/batch.mjs`）的 depth-0 `close` 轨——不直调 `assertTierPlan`：
 * 本档要的是「收口这件事」的业务可观察结果（放行 ∥ 拒绝、§1 状态行落没落盘）。
 * 断言面 = 工具回执文本 + §1 状态行落盘字节（档全文逐字比较）。
 *
 * 共享夹具住同目录 `test/integration/close-gate-fixture.mjs`——用例只调夹具、不定义夹具。
 * 复跑（cwd = 仓根）：`node --test test/integration/machine-list-head-form.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import {
  BATCH_REL, PROBE_REL, assertBatchCommitted, cleanupTemp, commit, depth0, gateLineOf, gitRepo, makeProject, parentCtx,
  record, statusLineOf,
} from "./close-gate-fixture.mjs"

after(cleanupTemp)

/** 夹具 §2 的机读清单块头（粗体形）——前半后半都只换这一行，其下三列表一字不改。 */
const MACHINE_LIST_BOLD_HEAD = "**受影响文件（机读清单）**"
/** 前半：同名小标题形（块头两形之一）。 */
const headingFormList = (sha) => record(sha).replace(MACHINE_LIST_BOLD_HEAD, "### 受影响文件（机读清单）")
/** 后半：提它而不是开这一块——落在两形之外。 */
const offFormList = (sha) => record(sha).replace(MACHINE_LIST_BOLD_HEAD, "### 受影响文件（机读清单）的写法")
test('CLI 7-31 边界 · §2 清单写成小标题形 ⇒ 收口放行 ∥ 块头落在两形之外 ⇒ 拒文点名可接受形、不逐档报缺行', async () => {
  const close = (root) => depth0.execute(
    { action: "close", path: BATCH_REL, completed: [], closeEvidence: "夹具收口证据" },
    parentCtx(root, [join(root, PROBE_REL)]),
  )

  // 前半：同一张表、只换块头形 ⇒ 清单读得出行、读数照核 ⇒ 放行（改前这一形读成零行，收口被拒且说「漏写了行」）
  const root = makeProject("r731")
  const sha = gitRepo(root)
  writeFileSync(join(root, BATCH_REL), headingFormList(sha))
  commit(root, "§2 机读清单改写成同名小标题形")
  assertBatchCommitted(root, sha)

  const receipt = await close(root)
  assert.match(gateLineOf(receipt), /^\[doc-check gate\] DOC-CHECK GATE: PASS/, `小标题形清单 ⇒ 收口放行：${receipt}`)
  assert.match(receipt, /^batch: §1 status line → 「已收口 \d{4}-\d{2}-\d{2}」/, `收口落盘：${receipt}`)
  assert.doesNotMatch(receipt, /清单里没有这一档的行/, `清单读得出行 ⇒ 不出缺行句：${receipt}`)
  assert.match(statusLineOf(root), /已收口/, "§1 状态行已写「已收口」")

  // 后半：块头落在两形之外（那一行在提这个名字，不是在开这一块）⇒ 清单零行 + 档里有块名 ⇒ 一条专门拒文
  const root2 = makeProject("r731b")
  const sha2 = gitRepo(root2)
  writeFileSync(join(root2, BATCH_REL), offFormList(sha2))
  commit(root2, "§2 机读清单块头写成提及形")
  assertBatchCommitted(root2, sha2)
  const before = readFileSync(join(root2, BATCH_REL), "utf8")

  await assert.rejects(
    () => close(root2),
    (e) => {
      assert.match(e.message, /tier-reading gate/, `拒文点名门位：${e.message}`)
      assert.match(e.message, /读不出行/, `拒文说清是「读不出行」而不是缺行：${e.message}`)
      assert.ok(e.message.includes(MACHINE_LIST_BOLD_HEAD), `拒文点名粗体形：${e.message}`)
      assert.ok(e.message.includes("### 受影响文件（机读清单）"), `拒文点名小标题形：${e.message}`)
      assert.match(e.message, /2–3 列/, `拒文点名列数判据：${e.message}`)
      assert.match(e.message, /连续/, `拒文点名表行须连续：${e.message}`)
      assert.ok(e.message.includes(PROBE_REL), `拒文点名本批在盘码档：${e.message}`)
      assert.doesNotMatch(e.message, /清单里没有这一档的行/, `不再逐档报缺行：${e.message}`)
      assert.match(e.message, /Nothing was written\./, `拒文收尾句：${e.message}`)
      return true
    },
  )
  assert.equal(readFileSync(join(root2, BATCH_REL), "utf8"), before, "拒收口 ⇒ 档全文逐字不变（§1 状态行字节不变）")
  assert.match(statusLineOf(root2), /进行中/, "§1 状态行仍「进行中」")
})
