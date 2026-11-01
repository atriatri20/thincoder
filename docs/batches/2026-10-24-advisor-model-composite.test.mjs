/** 批档（2026-10-24 · advisor 复合串 400 批）：advisor ∕ 子代理的 model 面历史有**渠道自指复合串落盘形**
 *  （`"GLM:glm-5.3-flash"` ∕ `"workbuddy:global:deepseek-v4.1-flash"` ∕ `"ds:deepseek-chat"`——设置写径 ∕
 *  AI 配置径）——裸串直通 wire ⇒ 网关白名单无此形态（3006 model not allowed ∕ 400；用户实测三串全中，
 *  w2p 侧流水 `workbuddy:global:…` ×400 直证）。
 *  修 = `stripProviderPrefix(model, providerName)`（核 model-ref 单源）：首段 = 已解析渠名（大小写不敏感）
 *  ⇒ 剥离；接线三处 = `resolveAdvisorProvider`（两分支）∥ `resolveChildProvider`（consult ∕ escalate ∕
 *  spawn ∕ vision 四链汇点）∥ 设置面（modelsFace 显示 ∕ advisorSpecModel 取形）。
 *  他渠前缀（跨渠误配）不在此消解——该走解析报错，不静默改写。 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { stripProviderPrefix } from "../../thincoder-core/model-ref.mjs"
import { resolveChildProvider } from "../../thincoder-core/agent-tools/subagent-async.mjs"

test("① stripProviderPrefix：自指剥 ∕ 他渠不剥 ∕ 无冒号原样 ∕ 大小写不敏感", () => {
  assert.equal(stripProviderPrefix("GLM:glm-5.3-flash", "GLM"), "glm-5.3-flash")
  assert.equal(stripProviderPrefix("glm-5.3-flash", "GLM"), "glm-5.3-flash")
  assert.equal(stripProviderPrefix("workbuddy:global:deepseek-v4.1-flash", "workbuddy"), "global:deepseek-v4.1-flash")
  assert.equal(stripProviderPrefix("ds:deepseek-chat", "ds"), "deepseek-chat")
  assert.equal(stripProviderPrefix("other:deepseek-chat", "ds"), "other:deepseek-chat", "他渠前缀不剥（跨渠误配走解析报错）")
  assert.equal(stripProviderPrefix("bare-model", "ds"), "bare-model")
  assert.equal(stripProviderPrefix("", "ds"), "")
  assert.equal(stripProviderPrefix("GLM:glm", ""), "GLM:glm", "渠名空 ⇒ 不剥")
})

const parentWith = (providers) => ({
  provider: { name: "main", baseURL: "http://x/v1", apiKey: "k", model: "m0" },
  config: { providersList: providers },
})

test("② resolveChildProvider：复合套复合（consult 入参形）剥自指段", () => {
  const providers = [
    { name: "GLM", baseURL: "http://g:8080/v1", apiKey: "k" },
    { name: "workbuddy", baseURL: "http://w:7863/v1", apiKey: "k" },
  ]
  // consult 入参 = `${m.provider}:${m.model}`，m.model 自身复合 ⇒ 双渠名叠加
  const r1 = resolveChildProvider(parentWith(providers), "GLM:GLM:glm-5.3-flash")
  assert.equal(r1.model, "glm-5.3-flash", "GLM:GLM:glm-5.3-flash → glm-5.3-flash（wire 形）")
  const r2 = resolveChildProvider(parentWith(providers), "workbuddy:workbuddy:global:deepseek-v4.1-flash")
  assert.equal(r2.model, "global:deepseek-v4.1-flash", "realm 前缀保留（w2p 协议域）")
  assert.equal(r2.baseURL, "http://w:7863/v1")
})

test("③ resolveChildProvider：真渠内冒号模型名（ollama 形）不误剥", () => {
  const providers = [{ name: "ollama", baseURL: "http://o/v1", apiKey: "k" }]
  const r = resolveChildProvider(parentWith(providers), "ollama:llama3:70b")
  assert.equal(r.model, "llama3:70b", "渠内冒号保留（M4 语义）")
})

test("④ 未知渠仍报错（跨渠误配不静默改写）", () => {
  const providers = [{ name: "GLM", baseURL: "http://g/v1", apiKey: "k" }]
  assert.throws(() => resolveChildProvider(parentWith(providers), "nosuch:m"), /unknown provider/)
})

test("⑤ 五级链 ∕ 覆写层级序（0.10.12 合并批——L1 modelContext > L2 渠旧键 > 覆写 > L3 list > spec ∕ default）", async () => {
  const { setModelOverrides, providerSpecResolution } = await import("../../thincoder-core/model-specs.mjs")
  setModelOverrides({ "global:deepseek-v4.1-flash": { context: 1000000, maxOutput: 384000, thinking: true } })
  const a = providerSpecResolution({ name: "GLM", model: "global:deepseek-v4.1-flash", baseURL: "http://x/v1" })
  assert.equal(a.source, "override")
  assert.equal(a.spec.context, 1000000)
  const b = providerSpecResolution({ name: "GLM", model: "global:deepseek-v4.1-flash", modelContext: { "global:deepseek-v4.1-flash": 2000 }, baseURL: "http://x/v1" })
  assert.equal(b.source, "modelContext")
  assert.equal(b.spec.context, 2048000)
  const c = providerSpecResolution({ name: "GLM", model: "global:deepseek-v4.1-flash", context: 500, baseURL: "http://x/v1" })
  assert.equal(c.source, "provider-override")
  assert.equal(c.spec.context, 512000)
})
