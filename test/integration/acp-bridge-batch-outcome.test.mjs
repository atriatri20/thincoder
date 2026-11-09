/*
 * acp-bridge-batch-outcome.test.mjs — 集成用例 CLI 41-2（RTM CLI 端故事 41「批量改多档：一条失败只废那一条，
 * 成了的不返工，回执逐条说清」）。
 *
 * 回指 = 设计档 `docs/core/design/EDIT.md` §7 集成测试设计（RTM 增量）的 `CLI 41-2` 行 ∥ §5「批量回执」∥
 * §8 D-15 ∥ D-16；需求 = `docs/core/requirements/TOOLS.md` F16 ∥ F17。
 *
 * 业务入口 = ACP 客户端（IDE）发起的一次批量编辑：走 `thincoder-cli/src/acp/bridge.mjs` 的会话入口
 * `buildAcpCallbacks` 的 `toolRouter("edit", { edits: […] })`，读写两侧都经反向 RPC（`fs/read_text_file` ∥
 * `fs/write_text_file`）打到桩对端——判的是「桥 ⟷ IDE 缓冲」两侧交互，不是桥内部函数的返回值。
 *
 * 它答的业务问题：**IDE 里一次批量改多档，一条改不成会不会把已改成的那些一起扔掉**。改前桥面是
 * 「全过才写」：任一条失败整批抛错（前缀 `edit aborted (atomic — no files written): `）、缓冲一条都不写，
 * 用户为此改成一档一调。本用例钉住那条旧行为已退场。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/acp-bridge-batch-outcome.test.mjs`
 */
import { test, after } from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { buildAcpCallbacks } from "../../thincoder-cli/src/acp/bridge.mjs"

const projects = []
after(() => {
  for (const p of projects) removeTempDirBestEffort(p)
})

/**
 * 桩对端（IDE 那一侧）：文档缓冲在内存里，两种反向 RPC 各照 ACP 协议应答
 * ——`fs/read_text_file` 回 `{ text }`、`fs/write_text_file` 把内容写回自己的缓冲。
 */
function stubIde(root) {
  const buffers = new Map()
  const writes = []
  const requests = []
  const request = async (method, params) => {
    requests.push(method)
    if (method === "fs/read_text_file") {
      const abs = join(root, params.path)
      if (!buffers.has(abs)) throw new Error(`not open in the editor: ${params.path}`)
      return { text: buffers.get(abs) }
    }
    if (method === "fs/write_text_file") {
      writes.push(params.path)
      buffers.set(join(root, params.path), params.content)
      return null
    }
    throw new Error(`unexpected reverse RPC: ${method}`)
  }
  return {
    request,
    writes,
    requests,
    open: (p, text) => buffers.set(join(root, p), text),
    text: (p) => buffers.get(join(root, p)),
  }
}

function bridgeFor(root, peer) {
  return buildAcpCallbacks({
    sessionId: "acpb-41-2",
    agent: { cwd: root },
    notify: () => {},
    request: peer.request,
    clientCaps: { fs: { readTextFile: true, writeTextFile: true } },
  })
}

test("CLI 41-2 IDE 里一次批量改多档：一条匹配不到只废那一条，其余落 IDE 缓冲、回执逐条说清", async () => {
  const root = mkdtempSync(join(tmpdir(), "acpb-41-2-"))
  projects.push(root)
  const peer = stubIde(root)
  peer.open("alpha.txt", "one\ntwo\n")
  peer.open("beta.txt", "red\ngreen\n")
  peer.open("gamma.txt", "three\n")

  const { handled, result } = await bridgeFor(root, peer).toolRouter("edit", {
    edits: [
      { path: "alpha.txt", old_string: "two", new_string: "TWO" },
      { path: "beta.txt", old_string: "this line is not in the buffer", new_string: "x" },
      { path: "gamma.txt", old_string: "three", new_string: "THREE" },
    ],
  })

  assert.equal(handled, true, "批量 edit 由桥面接管（不是回落本地写盘）")
  const receipt = result
  // 回执按调用序逐条：第 2 条报它自己，另两条是桥面自己的成功形
  assert.ok(receipt.includes("\nedits[1] — failed: old_string not found in beta.txt"), `第 2 条按原位报它自己：\n${receipt}`)
  assert.equal(receipt.split("\n").filter((l) => l.startsWith("OK: edited ")).length, 2, `其余两条成功形：\n${receipt}`)
  // IDE 缓冲：成功条已写回，失败那档逐字未动（业务结果 = 用户不必重做整批）
  assert.equal(peer.text("alpha.txt"), "one\nTWO\n")
  assert.equal(peer.text("gamma.txt"), "THREE\n")
  assert.equal(peer.text("beta.txt"), "red\ngreen\n", "失败的那一档缓冲内容未动")
  // 两侧交互：读经 fs/read_text_file、写经 fs/write_text_file，且只写回成了的那两档
  assert.ok(peer.requests.includes("fs/read_text_file"), "读走 IDE 缓冲的反向 RPC")
  assert.deepEqual([...peer.writes].sort(), ["alpha.txt", "gamma.txt"], "写回只落在成了的档上")
  assert.equal(existsSync(join(root, "alpha.txt")), false, "桥写的是 IDE 缓冲，不是盘面")
  // 末行汇总（桥面照写——它的数字全在内存里）
  assert.equal(receipt.split("\n").at(-1), "edit batch: 2/3 entries applied, 1 failed — 2 file(s) written: alpha.txt, gamma.txt")
  assert.doesNotMatch(receipt, /nothing written|no files written/, "回执只说盘上（缓冲里）实况")
})

test("CLI 41-2 IDE 里一次批量改多档：全部成功时末行给 0 failed 的计数行", async () => {
  const root = mkdtempSync(join(tmpdir(), "acpb-41-2-ok-"))
  projects.push(root)
  const peer = stubIde(root)
  peer.open("alpha.txt", "one\ntwo\n")
  peer.open("beta.txt", "red\n")

  const { result } = await bridgeFor(root, peer).toolRouter("edit", {
    edits: [
      { path: "alpha.txt", old_string: "one", new_string: "ONE" },
      { path: "alpha.txt", old_string: "two", new_string: "TWO" },
      { path: "beta.txt", old_string: "red", new_string: "RED" },
    ],
  })

  assert.equal(result.split("\n").at(-1), "edit batch: 3/3 entries applied, 0 failed — 2 file(s) written: alpha.txt, beta.txt")
  assert.equal(peer.text("alpha.txt"), "ONE\nTWO\n")
  assert.equal(peer.writes.length, 2, "同档两条只写回一次（写单位 = 档）")
})