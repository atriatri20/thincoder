/** 批档（2026-10-24 · 认领判活快路径批）：用户实测「多余会话 + 被其他进程使用」——强杀实例
 *  （taskkill -F 无优雅释放）的死属主认领在本机永不清：`tasklist` 全量枚举 >15s（AV 拦截 ∕ 进程数大）
 *  ⇒ 2s 预算恒超时 ⇒ 探测 null ⇒ 属主全 unknown 保守保留 ⇒ 每次启动「被占」→ 次存 fork 派生空壳槽堆积
 *  （karin 项目实积 5 个 338B 空壳）。
 * 修 = Windows 判活改 `process.kill(pid, 0)`（OpenProcess 探针——零 exec ∕ 逐 pid 精确：
 *  ESRCH 死 权威 ∥ EPERM 活〔他户〕）；Unix `ps` 路径逐字保留（上游语义）。
 * 件面：`batchAlive` ∕ `batchAliveAsync`（process-probe-exec）∥ `isProcessAlive`（process-probe）。
 * 本档四腿：真子进程判活 ∕ 死 pid 判死 ∕ batchAlive 三态 ∕ cleanDeadOwners 集成（死清 ∕ 活留）。 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { batchAlive } from "../../thincoder-core/process-probe-exec.mjs"
import { isProcessAlive } from "../../thincoder-core/process-probe.mjs"
import { cleanDeadOwners } from "../../thincoder-core/session-slot-claims.mjs"
import { probeOwnersSync } from "../../thincoder-core/process-probe.mjs"

const wait = (ms) => new Promise((r) => setTimeout(r, ms))

test("① 真子进程：活（signal 0）→ 退出后死（权威 ESRCH 路径）", async () => {
  const child = spawn(process.execPath, ["-e", "setInterval(()=>{},1<<30)"], { stdio: "ignore" })
  await wait(400) // 产程起跑
  assert.equal(isProcessAlive(child.pid), true, "活子进程 = 活")
  const set = batchAlive([child.pid])
  assert.ok(set instanceof Set && set.has(child.pid), "batchAlive 收活 pid")
  child.kill("SIGKILL")
  await wait(600) // 退出收敛（Windows 句柄释放）
  assert.equal(isProcessAlive(child.pid), false, "退出后 = 死（零 exec 快路径——慢机 tasklist 恒超时的原病灶）")
  const set2 = batchAlive([child.pid])
  assert.ok(set2 instanceof Set && !set2.has(child.pid), "batchAlive 判死")
})

test("② 不存在 pid：死（非 unknown）", () => {
  // Windows pid 域上界外的值——必不存在（ESRCH 权威，非超时 unknown）
  assert.equal(isProcessAlive(4194304), false)
  const set = batchAlive([4194304])
  assert.ok(set instanceof Set && set.size === 0, "空集 = 全死（非 null = 探测失败）")
})

test("③ 空 pid 集：空集（零探测早退——上游语义保持）", () => {
  assert.deepEqual([...batchAlive([])], [])
})

test("④ cleanDeadOwners 集成：死属主清 ∕ 活属主留（真进程 pid）", async () => {
  const child = spawn(process.execPath, ["-e", "setInterval(()=>{},1<<30)"], { stdio: "ignore" })
  await wait(400)
  const deadOwner = `4194304-1792800000000-x`
  const liveOwner = `${child.pid}-1792800000000-y`
  const m = { slotSessions: { 1: deadOwner, 2: liveOwner }, slots: {} }
  const bundle = probeOwnersSync([4194304, child.pid])
  const deletions = cleanDeadOwners(m, bundle)?.() ?? null
  assert.deepEqual(deletions, { slotSessions: ["1"] }, "死属主槽 1 可删；活属主槽 2 保留")
  child.kill("SIGKILL")
})
