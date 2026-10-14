// 2026-10-14 · docker.mjs 读类超时注入缝接线——单元腿（红绿对）
// 红（修前）：L1 `readTimeoutMs` 选项被吞——读类缺省写死常量 3000 ⇒ fetch 慢 100ms 也不超时（探针 #7 实证同因）。
// 绿（修后）：L1 读类缺省 = 选项值（50ms）⇒ 慢 fetch 抛「节点响应超时（50ms）」；L2 动作类接线守（既有）。
// 台账 #1416 ∥ 轮档 docs/batches/2026-10-14-docker-timeout-fix.md
import { test } from "node:test"
import assert from "node:assert/strict"
import { createDockerClient } from "../../thincoder-server/src/sandbox/docker.mjs"

const slowFetch = (delayMs) => (_url, init) =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(() => resolve(new Response(JSON.stringify({ Id: "x" }), { status: 200, headers: { "content-type": "application/json" } })), delayMs)
    init?.signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(Object.assign(new Error("The operation was aborted due to timeout"), { name: "TimeoutError" }))
    })
  })

test("L1 读类：readTimeoutMs 选项生效（慢 fetch ⇒ 按选项值超时）", async () => {
  const client = createDockerClient({ baseUrl: "http://10.0.0.6:2375", apiVer: "1.44", fetchImpl: slowFetch(100), readTimeoutMs: 50 })
  await assert.rejects(() => client.containerDetail("abc"), /节点响应超时（50ms）/)
})

test("L2 动作类：actionTimeoutMs 选项生效（既有接线守）", async () => {
  const client = createDockerClient({ baseUrl: "http://10.0.0.6:2375", apiVer: "1.44", fetchImpl: slowFetch(100), actionTimeoutMs: 50 })
  await assert.rejects(() => client.startContainer("abc"), /节点响应超时（50ms）/)
})
