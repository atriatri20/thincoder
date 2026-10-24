/**
 * 2026-10-15-model-selection-pivot.test.mjs — 批内单测件（批档 = `docs/batches/2026-10-15-model-selection-pivot.md`
 * §2.24 项 7 ∥ §4 本块）：设置页「模型」段撤场 + 会话选定写回 `defaultModel` 回归锁
 * （设计单源 = `docs/desktop/design/SETTINGS.md` §1 **KD-80** ∥ §2.24）。
 *
 * 六用例（机检面 = 树面 ∥ 导出面 ∥ 源面锁）：
 *   用例 1 · 段闭集七段（`SECTIONS` 名序 + `settingsTree` 段节点锚零 `model`）
 *   用例 2 · `SCOPES` 十（`SECTIONS` 七名 + 三添加弹窗组常量）
 *   用例 3 · `MODAL_READS` 十行（逐组指名表去 `model` 行）
 *   用例 4 · 段体分派零 `model` 支（源面锁）
 *   用例 5 · 词键零残（`settings.section.model` 两语零命中 ∧ 两语键集相等）
 *   用例 6 · 写回链（会话选定 ⇒ `defaultModel` 同拍在场 ∥ 同值重选 ⇒ 零写）
 *
 * 渲染面 `/rc/*` 别名（浏览器专属，平 node 不可解析）⇒ 本测经 `registerHooks` 按仓内
 * `thincoder-render-core/` 同源解析（真档，零桩体）。
 * **用毕即删（零留存）**：本档随批档归档、不进 `test/` 收集面；§5 留一行读数。
 * 用例 2/3/4 含**源文扫描**（读档取对象字面量与分派支）：与书写形耦合——改写形即可能失效 ∥ 空判，
 * 故本档只作批内读数载体，不作长期回归面（长期面 = 真机 T-DSK71）。
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { registerHooks } from "node:module"

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, "..", "..")
const url = (rel) => pathToFileURL(join(ROOT, rel)).href
const text = (rel) => readFileSync(join(ROOT, rel), "utf8")
const readJSON = (path) => JSON.parse(readFileSync(path, "utf8"))

registerHooks({
  resolve(spec, context, next) {
    if (spec.startsWith("/rc/")) return { url: url(`thincoder-render-core/${spec.slice(4)}`), shortCircuit: true, format: "module" }
    // 裸包 `@thincoder/core/*` 与直指档路径归一到同一实路径 ⇒ 同一模块实例
    // （否则 `_setConfigPathForTest` 影响不到被测档的 `_configPath()`——测试会写进用户真档）。
    if (spec.startsWith("@thincoder/core/")) return { url: url(`thincoder-core/${spec.slice("@thincoder/core/".length)}`), shortCircuit: true, format: "module" }
    return next(spec, context)
  },
})

const VIEWS = "thincoder-desktop/renderer/views/settings.mjs"
const MOUNT = "thincoder-desktop/renderer/mount-settings.mjs"
const I18N = "thincoder-desktop/renderer/i18n-settings.mjs"

/** 描述符树段节点锚集（`data-section` —— 实读构树点 = `views/settings.mjs` `sectionNode`）。 */
function sectionAnchors(tree) {
  const out = []
  const walk = (node) => {
    if (node === null || typeof node !== "object") return
    if (node.props && node.props["data-section"] !== undefined) out.push(node.props["data-section"])
    const children = Array.isArray(node.children) ? node.children : []
    for (const child of children) walk(child)
  }
  walk(tree)
  return out
}

/** 对象字面量块切取（`const NAME = Object.freeze({` ⇒ 其 `}` 前）。 */
function objectBlock(source, declaration) {
  const at = source.indexOf(declaration)
  assert.ok(at >= 0, `未找到声明：${declaration}`)
  const open = source.indexOf("{", at)
  const close = source.indexOf("})", open)
  return source.slice(open + 1, close)
}

/** 对象字面量键序（裸名 ∥ `[CONST]` 计算键）。 */
function objectKeys(block) {
  const keys = []
  for (const line of block.split(/\r?\n/)) {
    const m = /^\s*(?:\[([A-Z_][A-Z_0-9]*)\]|([A-Za-z_][A-Za-z_0-9]*))\s*:/.exec(line)
    if (m) keys.push(m[1] ?? m[2])
  }
  return keys
}

test("用例 1 · 段闭集七段（`SECTIONS` 名序 ∧ 树面段节点锚零 `model`）", async () => {
  const { SECTIONS, settingsModel, settingsTree } = await import(url(VIEWS))
  assert.deepEqual(SECTIONS.map((section) => section.name), ["providers", "agent", "mcp", "env", "tools", "models", "team"])
  const anchors = sectionAnchors(settingsTree(settingsModel({ settings: { open: true }, locale: "en" }), {}))
  assert.deepEqual(anchors, ["providers", "agent", "mcp", "env", "tools", "models", "team"])
  assert.ok(!anchors.includes("model"), "`[data-section=\"model\"]` 节点应在场判失败")
})

test("用例 2 · `SCOPES` 十（`SECTIONS` 七名 + 三添加弹窗组常量）", async () => {
  const { SECTIONS } = await import(url(VIEWS))
  const line = text(MOUNT).split(/\r?\n/).find((row) => row.includes("const SCOPES = "))
  assert.ok(line !== undefined, "未找到 `SCOPES` 声明")
  const constants = [...line.matchAll(/\b([A-Z][A-Z_0-9]*_MODAL_GROUP)\b/g)].map((m) => m[1]).sort()
  assert.deepEqual(constants, ["ADD_MODAL_GROUP", "CONSULT_ADD_MODAL_GROUP", "MCP_FORM_MODAL_GROUP"])
  assert.equal(SECTIONS.length + constants.length, 10)
})

test("用例 3 · `MODAL_READS` 十行（逐组指名表去 `model` 行）", () => {
  const keys = objectKeys(objectBlock(text(MOUNT), "const MODAL_READS = "))
  assert.equal(keys.length, 10, `MODAL_READS 行数应十：${keys.join(",")}`)
  assert.ok(!keys.includes("model"), "`MODAL_READS` 残留 `model` 行")
  assert.deepEqual(keys.filter((key) => /^[a-z]+$/.test(key)), ["providers", "agent", "mcp", "env", "tools", "models", "team"])
})

test("用例 4 · 段体分派零 `model` 支（源面锁）", () => {
  const source = text(VIEWS)
  assert.ok(!/\bmodelBody\b/.test(source), "`modelBody` 残引")
  assert.ok(!/name\s*===\s*"model"/.test(source), "`model` 分派支残存")
  assert.ok(!/settings\.section\.model(?!\w)/.test(source), "`model` 段名词键残存")
})

test("用例 5 · 词键零残（两语零命中 ∧ 两语键集相等）", async () => {
  const { SETTINGS_DICT } = await import(url(I18N))
  const en = Object.keys(SETTINGS_DICT.en)
  const zh = Object.keys(SETTINGS_DICT.zh)
  assert.ok(!en.includes("settings.section.model"), "en 残留 `settings.section.model`")
  assert.ok(!zh.includes("settings.section.model"), "zh 残留 `settings.section.model`")
  assert.deepEqual(en, zh)
})

test("用例 6 · 写回链（会话选定 ⇒ `defaultModel` 同拍在场 ∥ 同值重选 ⇒ 零写）", async () => {
  const { _setConfigPathForTest, _resetConfigPathForTest, _configPath } = await import(url("thincoder-core/config-io.mjs"))
  const { carryoverDefaultModel } = await import(url("thincoder-desktop/src/main/settings.mjs"))
  // 触发支接线锁（源面）：会话选定 ⇒ 写回单点（链零动 = 本批边界；真机面 = T-DSK71 ②③）
  assert.ok(/carryoverDefaultModel\(patch\.provider, patch\.model\)/.test(text("thincoder-desktop/src/main/agent-host.mjs")), "会话选定 ⇒ 写回单点接线缺失")
  const path = join(mkdtempSync(join(tmpdir(), "model-pivot-")), "config.json")
  writeFileSync(path, JSON.stringify({ providers: [] }, null, 2))
  _setConfigPathForTest(path)
  assert.equal(_configPath(), path, "测试缝未生效——禁止触真档")
  try {
    const first = carryoverDefaultModel("deepseek", "chat")
    assert.equal(first.ok, true)
    assert.ok("providerState" in first, "写入发生应携 `providerState`")
    assert.equal(readJSON(path).defaultModel, "deepseek:chat", "选定后同拍在场")
    const same = carryoverDefaultModel("deepseek", "chat")
    assert.equal(same.ok, true)
    assert.ok(!("providerState" in same), "同值重选应零写（无 `providerState` 键）")
    const next = carryoverDefaultModel("deepseek", "chat-2") // 正控：异值 ⇒ 再写（证上条非空判）
    assert.ok("providerState" in next, "异值应再写")
    assert.equal(readJSON(path).defaultModel, "deepseek:chat-2")
  } finally {
    _resetConfigPathForTest()
  }
})
