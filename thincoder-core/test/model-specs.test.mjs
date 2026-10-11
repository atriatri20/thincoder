/**
 * model-specs.test.mjs — 模型规格面（命名空间剥离泛化 + 用户覆写表 + 生效序）。
 *
 * 背景（2026-10-10）：反代 ∕ 聚合网关给模型名加**路由前缀**（`cn:` / `global:` / `a/b/c`），
 * 原 `lookupSpec` 只剥「第一个 `/` 前段一次」⇒ 全部落 DEFAULT_SPEC（128K/32K/无思考）。
 * 本档锁：①边界剥离真值表（含反例——不许误命中）；②覆写表清洗与命中（精确 ∕ 前缀 ∕ 边界）；
 * ③生效序（DEFAULT < 表命中 < modelOverrides < providers[].context）；④既有契约零回归。
 *
 * 跑法（仓根）：node --test thincoder-core/test/model-specs.test.mjs（或 `npm test` 全绿门禁）。
 */
import test from "node:test"
import assert from "node:assert/strict"

import {
  specForModel, specMatch, providerSpec, setModelOverrides, getModelOverrides, effortDefaultFor,
} from "../model-specs.mjs"
import { isNonVisionModel } from "../attachments.mjs"

/** 每用例前清空覆写表（模块级单写者——用例间不得互相污染）。 */
const clearOverrides = () => setModelOverrides({})

test("L1 · 冒号 ∕ 斜杠 ∕ 多段前缀剥离命中内置表（用户真实模型 ID 真值表）", () => {
  clearOverrides()
  const cases = [
    // [模型 ID, 期望 context]
    ["cn:deepseek-v4-flash", 1_000_000],
    ["cn:deepseek-v4-pro", 1_000_000],
    ["cn:deepseek-v4.1-flash", 1_000_000],
    ["cn:glm-5.2", 1_000_000],
    ["cn:glm-5.3", 1_000_000],
    ["cn:glm-5.3-flash", 1_000_000],
    ["cn:hy3", 256_000],
    ["global:deepseek-v4.1-flash", 1_000_000],
    ["global:glm-5.3", 1_000_000],
    ["global:gpt-5.6-sol", 1_050_000],
    ["global:hy3", 256_000],
    ["cl/cline-free/deepseek-v4.1-flash", 1_000_000], // 多段：剥到第三段才命中
    ["cbcn/glm-5.3", 1_000_000], // 单斜杠（既有行为——零回归）
    ["workbuddy:global:deepseek-v4.1-flash", 1_000_000], // 双前缀
  ]
  for (const [id, context] of cases) {
    const r = specMatch(id)
    assert.equal(r.matched, true, `${id} 应命中内置表`)
    assert.equal(r.source, "builtin", `${id} 来源 = 内置表`)
    assert.equal(r.spec.context, context, `${id} context`)
  }
})

test("L1 · 反例：前缀之外不得误命中（未登记名一律落 DEFAULT_SPEC）", () => {
  clearOverrides()
  for (const id of ["cn:auto", "work", "space-bunny", "qfmodel", "my-glm-5.3-proxy", "step-5-preview"]) {
    const r = specMatch(id)
    assert.equal(r.matched, false, `${id} 不得命中（冒号 ∕ 斜杠边界后无已知名前缀）`)
    assert.equal(r.source, "default", `${id} 来源 = 兜底`)
    assert.deepEqual(r.spec, { context: 128_000, maxOutput: 32_000 }, `${id} = DEFAULT_SPEC`)
  }
})

test("L1 · 剥离只在边界进行：`glm-5.3` 中间不切（`xglm-5.3` 不得命中）", () => {
  clearOverrides()
  assert.equal(specMatch("xglm-5.3").matched, false, "任意位置子串匹配 = 误命中面过大，不做")
  assert.equal(specMatch("glm-5.3").matched, true, "裸名照常命中")
})

test("L2 · 覆写表：精确键 ∕ 前缀键 ∕ 边界剥离三径命中，清洗丢弃非法叶", () => {
  setModelOverrides({
    "global:gpt-5.4": { context: 1_000_000, maxOutput: 128_000, thinking: false, bogus: 1 },
    "cn:": { reasoningEffortEnum: ["low", "high", "max"], reasoningEffortDefault: "high", thinking: true, thinkApi: "effort" },
    "qfmodel": { context: 256_000 },
    "": { context: 1 }, // 空键 ⇒ 丢弃
    "bad": { context: -5, maxOutput: "x" }, // 全叶非法 ⇒ 整条丢弃
  })
  const gpt = specMatch("global:gpt-5.4")
  assert.equal(gpt.source, "override")
  assert.equal(gpt.spec.context, 1_000_000)
  assert.equal(gpt.spec.maxOutput, 128_000)
  assert.equal(gpt.spec.thinking, false)
  assert.equal("bogus" in gpt.spec, false, "白名单外字段不得入表")

  const auto = specMatch("cn:auto") // 前缀键 `cn:` 覆盖该渠道全部模型（含表内未登记名）
  assert.equal(auto.source, "override")
  assert.deepEqual(auto.spec.reasoningEffortEnum, ["low", "high", "max"])
  assert.equal(auto.spec.thinking, true)
  assert.equal(auto.spec.context, 128_000, "覆写未写 context ⇒ 沿用 DEFAULT_SPEC")

  const viaBoundary = specMatch("qdcn/qfmodel") // 边界剥离后命中键 `qfmodel`
  assert.equal(viaBoundary.source, "override")
  assert.equal(viaBoundary.spec.context, 256_000)

  assert.equal(getModelOverrides()[""] ?? null, null, "空键不入表")
  assert.equal(getModelOverrides().bad ?? null, null, "全叶非法条目不入表")
})

test("L2 · 覆写优先于内置表命中，但不改内置表本身", () => {
  setModelOverrides({ "glm-5.3": { context: 42 } })
  assert.equal(specForModel("glm-5.3").context, 42, "覆写盖内置行")
  assert.equal(specForModel("glm-5.3").maxOutput, 128_000, "未写叶沿用内置行")
  clearOverrides()
  assert.equal(specForModel("glm-5.3").context, 1_000_000, "清覆写后回内置值（无残留）")
})

test("L3 · effortDefaultFor：内置前缀表 + 覆写优先 + 边界剥离", () => {
  clearOverrides()
  assert.equal(effortDefaultFor("cn:deepseek-v4-flash"), "high")
  assert.equal(effortDefaultFor("global:deepseek-v4.1-flash"), "high", "`.1` 名独立行（族默认档同 high）")
  assert.equal(effortDefaultFor("global:glm-5.3"), "max")
  assert.equal(effortDefaultFor("cn:space-bunny"), undefined, "表内无该前缀 ⇒ undefined（不取枚举首项回落）")
  setModelOverrides({ "cn:auto": { reasoningEffortDefault: "low" } })
  assert.equal(effortDefaultFor("cn:auto"), "low", "覆写优先（精确键）")
  setModelOverrides({ "cn:": { reasoningEffortDefault: "low" } })
  assert.equal(effortDefaultFor("cn:auto"), "low", "前缀键覆盖渠道内全部模型")
  assert.equal(effortDefaultFor("cn:deepseek-v4-flash"), "low", "前缀键盖过内置前缀表")
  clearOverrides()
})

test("生效序：DEFAULT_SPEC < 内置表 < modelOverrides < providers[].context", () => {
  setModelOverrides({ "cn:glm-5.3": { context: 500_000 } })
  assert.equal(specForModel("cn:glm-5.3").context, 500_000, "覆写盖内置")
  assert.equal(providerSpec({ model: "cn:glm-5.3", context: 64 }).context, 65_536, "渠道级最具体（K 单位 ×1024）")
  clearOverrides()
})

test("L2 · multimodal 叶翻转（文本 ∕ 多模态区分——附件门 ∕ 读图工具的判据单源）", () => {
  setModelOverrides({ "qdcn/qfmodel": { multimodal: true }, "glm-5.3": { multimodal: false } })
  assert.equal(specForModel("qdcn/qfmodel").multimodal, true, "未知模型（DEFAULT_SPEC）显式开")
  assert.equal(specForModel("glm-5.3").multimodal, false, "内置行未声明 ⇒ 显式关")
  assert.equal(specForModel("deepseek-v4.1-flash").multimodal, true, "内置行已声明者零改")
  assert.equal(isNonVisionModel("qdcn/qfmodel"), false, "附件门随覆写翻转（挂图可随发）")
  clearOverrides()
  assert.equal(isNonVisionModel("qdcn/qfmodel"), true, "清覆写 ⇒ 回落非多模态（DEFAULT_SPEC）")
})

test("既有契约零回归：非串 ∕ 空串 ∕ DEFAULT_SPEC 形状 ∕ providerSpec 基线", () => {
  clearOverrides()
  assert.deepEqual(specForModel(42), { context: 128_000, maxOutput: 32_000 }, "非串 ⇒ DEFAULT_SPEC")
  assert.deepEqual(specForModel(""), { context: 128_000, maxOutput: 32_000 }, "空串 ⇒ DEFAULT_SPEC")
  assert.equal(providerSpec({ model: true }).context, 128_000, "非串 model ⇒ 默认规格")
  assert.equal(providerSpec({ model: "glm-4.6" }).context, 128_000, "命名三面串值基线")
  assert.deepEqual(specForModel(42), { context: 128_000, maxOutput: 32_000 }, "DEFAULT_SPEC 未被覆写污染")
})

test("cherry-pick 锁：gemini 3.7 ∕ 3.8 flash 行（上游 #1198 · 1M ∕ 64K ∕ 恒思考）", () => {
  clearOverrides()
  for (const id of ["gemini-3.8-flash", "gemini-3.7-flash", "global:gemini-3.8-flash"]) {
    const r = specMatch(id)
    assert.equal(r.matched, true, `${id} 应命中内置表`)
    assert.equal(r.spec.context, 1_048_576, `${id} context`)
    assert.equal(r.spec.maxOutput, 65_536, `${id} maxOutput`)
    assert.equal(r.spec.thinkAlwaysOn, true, `${id} 思考恒开（无 off 路径）`)
    assert.equal(r.spec.multimodal, true, `${id} 图像面`)
  }
  // 表缺口在册：上游 #1198 只补 3.7 ∕ 3.8 两行 ⇒ `gemini-3.5-flash` 仍落 DEFAULT_SPEC（用户可经
  // `modelOverrides` 自救——模型参数能力的用例）。
  assert.equal(specMatch("gemini-3.5-flash").matched, false, "3.5-flash 仍是表缺口（未随上游补行）")
})
