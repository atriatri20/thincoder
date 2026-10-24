/**
 * desktop 走查修复轮 · 单元测试档（用后即删 · 零留存——§5 留一行读数）。
 *
 * 面：词面重派生（挂载先于词表 ⇒ 创建期取词回落键名；`applyWords` = 重派生单源补面）。
 * 红面 = 词表未置时创建（现场复现：attach/abort 文本 = 键名）；
 * 绿面 = 置词 + `applyWords()` ⇒ 词面全量 = zh 值（title ∥ aria-label ∥ textContent 三层）。
 *
 * 跑法（cwd = `thincoder/`）：`node --test docs/batches/2026-10-15-desktop-walkthrough-fixes.test.mjs`
 * stub DOM = 沿 `.thincoder/tmp/car2-aria-zh-probe.mjs` 先例（核件真跑，非模拟）。
 */
import { test } from "node:test"
import assert from "node:assert/strict"

// ── stub DOM（沿 car2-aria 探针逐字形）────────────────────────────────
function makeNode(tag) {
  const classes = new Set()
  return {
    tag, children: [], listeners: {}, attrs: {}, parent: null, style: {}, dataset: {},
    open: false, textContent: "", className: "", value: "", hidden: false, disabled: false,
    scrollTop: 0, scrollHeight: 0, clientHeight: 0, _html: "",
    get innerHTML() { return this._html },
    set innerHTML(value) { this._html = String(value) },
    get firstChild() { return this.children[0] ?? null },
    get childNodes() { return [...this.children] },
    get ownerDocument() { return globalThis.document },
    classList: {
      add: (...names) => names.forEach((name) => classes.add(name)),
      remove: (...names) => names.forEach((name) => classes.delete(name)),
      contains: (name) => classes.has(name),
      toggle: (name) => { if (classes.has(name)) { classes.delete(name); return false } classes.add(name); return true },
    },
    append(...items) { for (const item of items.flat(Infinity)) { if (item === null || item === undefined || item === false) continue; if (typeof item === "object") item.parent = this; this.children.push(item) } },
    appendChild(item) { this.append(item); return item },
    removeChild(item) { this.children = this.children.filter((child) => child !== item); item.parent = null; return item },
    replaceChildren(...items) { this.children = []; this.append(...items) },
    querySelector(selector) { return findAll(this, (node) => node.className.split(/\s+/).includes(selector.slice(1)))[0] ?? null },
    querySelectorAll(selector) { return findAll(this, (node) => node.className.split(/\s+/).includes(selector.slice(1))) },
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn) },
    setAttribute(name, value) { this.attrs[name] = String(value) },
    getAttribute(name) { return this.attrs[name] ?? null },
    remove() { if (this.parent !== null) this.parent.children = this.parent.children.filter((child) => child !== this); this.parent = null },
    focus() {}, blur() {},
    fire(type, event = {}) { const target = { preventDefault() {}, ...event }; return Promise.all((this.listeners[type] ?? []).map((fn) => fn(target))) },
    showModal() { this.open = true }, close() { this.open = false },
  }
}
function findAll(node, pred, out = []) {
  if (node !== null && typeof node === "object" && node.tag !== undefined) {
    if (pred(node)) out.push(node)
    for (const child of node.children ?? []) findAll(child, pred, out)
  }
  return out
}
const makeDocument = () => {
  const scrolling = makeNode("html")
  return {
    body: makeNode("body"), head: makeNode("head"), scrollingElement: scrolling, documentElement: scrolling,
    createElement: (tag) => makeNode(tag), createTextNode: (text) => { const node = makeNode("#text"); node.textContent = String(text); return node },
    getElementById: () => null, querySelector: () => null, querySelectorAll: () => [],
    addEventListener: () => {}, removeEventListener: () => {},
  }
}
globalThis.document = makeDocument()
globalThis.window = { innerWidth: 1200, innerHeight: 800, addEventListener() {}, removeEventListener() {}, document: globalThis.document }
globalThis.requestAnimationFrame = () => 0
globalThis.cancelAnimationFrame = () => {}
globalThis.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} }

const CORE = new URL("../../thincoder-render-core/", import.meta.url).href
const { setStrings } = await import(CORE + "i18n.mjs")
const { createComposerPanel } = await import(CORE + "composer/panel.mjs")
const { COMPOSER_DICT } = await import(new URL("../../thincoder-desktop/renderer/i18n-composer.mjs", import.meta.url).href)

const byId = (root, id) => findAll(root, (node) => node.id === id)[0] ?? null
const build = () => {
  const root = makeNode("div")
  const panel = createComposerPanel({ root, post: () => {}, state: {}, hooks: {} })
  return { root, panel }
}

// ── 红面：词表未置（= desktop 挂载先于词表的面）⇒ 创建期词面回落键名（现场复现）──
test("红面：空词表下创建 ⇒ attach/abort 文本 = 键名（根因复现）", () => {
  setStrings({})
  const { root } = build()
  assert.equal(byId(root, "attach-btn").textContent, "toolbar.attachShort")
  assert.equal(byId(root, "attach-btn").title, "toolbar.attach")
  assert.equal(byId(root, "abort-btn").textContent, "toolbar.stop")
  assert.equal(byId(root, "abort-btn").title, "toolbar.stop")
  assert.equal(byId(root, "input").placeholder, "input.placeholder")
})

// ── 绿面：置词 + `applyWords()` ⇒ 词面全量重派生（title ∥ aria-label ∥ textContent）──
test("绿面：置词 + applyWords ⇒ 词面全量 = zh 值", () => {
  const zh = COMPOSER_DICT.zh
  const { root, panel } = build()
  assert.equal(typeof panel.applyWords, "function", "applyWords 在场（本修新增面）")
  setStrings(zh)
  panel.applyWords()
  const prop = (id, key, field) => {
    assert.ok(typeof zh[key] === "string", `词表携 ${key}`)
    assert.equal(byId(root, id)[field], zh[key], `${id}.${field} = ${key}`)
  }
  const aria = (id, key) => {
    assert.ok(typeof zh[key] === "string", `词表携 ${key}`)
    assert.equal(byId(root, id).attrs["aria-label"], zh[key], `${id}[aria-label] = ${key}`)
  }
  // panel 面
  prop("input", "input.placeholder", "placeholder")
  aria("input", "input.messageLabel")
  prop("send-btn", "toolbar.send", "title")
  aria("send-btn", "toolbar.sendMessage")
  prop("abort-btn", "toolbar.stop", "title")
  aria("abort-btn", "toolbar.stopGeneration")
  prop("abort-btn", "toolbar.stop", "textContent")
  // attach 面
  prop("attach-btn", "toolbar.attach", "title")
  aria("attach-btn", "toolbar.attach")
  prop("attach-btn", "toolbar.attachShort", "textContent")
  aria("paste-badge", "toolbar.attachedFiles")
  // atmenu 面
  aria("at-dropdown", "input.fileSuggestions")
  // controls 七钮
  prop("model-btn", "toolbar.model", "title")
  aria("model-btn", "toolbar.model")
  prop("reasoning-btn", "toolbar.reasoning", "title")
  prop("auto-btn", "toolbar.autoApprove", "title")
  aria("auto-btn", "toolbar.autoApproveToggle")
  prop("advisor-btn", "toolbar.advisor", "title")
  prop("eng-btn", "toolbar.engineering", "title")
  prop("plan-btn", "toolbar.planMode", "title")
  prop("settings-btn", "toolbar.settings", "title")
  aria("settings-btn", "toolbar.settingsOpen")
  // model-menu 两浮层
  aria("model-dropdown", "model.listLabel")
  aria("reasoning-dropdown", "model.reasoningLevels")
})

// ── 幂等：重复 applyWords 零差（随动重派生可安全重入）──
test("幂等：两遍 applyWords 值恒等", () => {
  const zh = COMPOSER_DICT.zh
  const { root, panel } = build()
  setStrings(zh)
  panel.applyWords()
  const first = byId(root, "attach-btn").textContent
  panel.applyWords()
  assert.equal(byId(root, "attach-btn").textContent, first)
})
