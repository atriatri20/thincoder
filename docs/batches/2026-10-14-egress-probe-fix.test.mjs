// 2026-10-14 · egress nft 探针 sudo 安全修复——单元腿（红绿对）
// 红（修前）：L1 探针 exit=1 ⇒ 抛（iptables 备径死码）；L2 探针命令 = 裸内建 `command -v nft`（sudo 前缀当二进制跑 ⇒ command not found）。
// 绿（修后）：L1 走 iptables 备径；L2 探针 = `sh -c 'command -v nft'`（sudo 安全）。
// 台账 #1410 ∥ 轮档 docs/batches/2026-10-14-egress-probe-fix.md
import { test } from "node:test"
import assert from "node:assert/strict"
import { pushEgressRuleset } from "../../thincoder-server/src/sandbox/egress.mjs"

function makeExec(probeResult) {
  const commands = []
  const exec = async (command, opts = {}) => {
    commands.push({ command, label: opts.label ?? "" })
    if (opts.label === "nft 探针") return probeResult
    return { exitCode: 0, stdout: "", stderr: "" }
  }
  return { exec, commands }
}

test("L1 nft 缺席（探针 exit=1）⇒ 走 iptables 备径，零抛", async () => {
  const { exec, commands } = makeExec({ exitCode: 1, stdout: "", stderr: "" })
  const mech = await pushEgressRuleset(exec, { text: "table inet tc {}", iptablesCommands: ["iptables -N TC-EGRESS", "iptables -A TC-EGRESS -j ACCEPT"] })
  assert.equal(mech, "iptables")
  assert.ok(commands.some((c) => c.command === "iptables -N TC-EGRESS"), "备径命令须执行")
})

test("L2 nft 在场 ⇒ 走 nft 径；探针命令 sudo 安全（非裸内建）", async () => {
  const { exec, commands } = makeExec({ exitCode: 0, stdout: "/usr/sbin/nft\n", stderr: "" })
  const mech = await pushEgressRuleset(exec, { text: "table inet tc {}", iptablesCommands: [] })
  assert.equal(mech, "nft")
  const probe = commands.find((c) => c.label === "nft 探针")
  assert.ok(probe, "须有探针命令")
  assert.ok(!probe.command.startsWith("command"), `探针不得以裸内建开头（sudo 前缀会当二进制跑）：${probe.command}`)
  assert.ok(probe.command.includes("command -v nft"), `探针语义不变：${probe.command}`)
})
