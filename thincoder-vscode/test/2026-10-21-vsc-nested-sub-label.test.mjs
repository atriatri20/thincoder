import { test } from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { appendAdvisorChunk } from "../../thincoder-render-core/flow/block.mjs"

/** 最小 DOM 桩：只实现本用例要读的接口（appendChild / lastElementChild / querySelector）。 */
function fakeBlock() {
  const content = {
    children: [],
    appendChild(el) { this.children.push(el); el.parentNode = this; return el },
    get lastElementChild() { return this.children[this.children.length - 1] ?? null },
    lastChild: null,
  }
  const block = {
    _subMeta: null,
    open: true,
    querySelector(sel) { return sel === ".advisor-content" ? content : null },
  }
  return { block, content }
}

function fakeEl(tag) {
  const el = {
    tagName: tag,
    className: "",
    dataset: {},
    children: [],
    textContent: "",
    appendChild(child) { this.children.push(child); return child },
    get lastChild() { return this.children[this.children.length - 1] ?? null },
  }
  el.classList = {
    contains: (c) => String(el.className).split(/\s+/).includes(c),
    add: (c) => { el.className = `${el.className} ${c}`.trim() },
  }
  return el
}

// 安装 document.createElement 桩
globalThis.document = { createElement: (tag) => fakeEl(tag) }
globalThis.document.createTextNode = (s) => ({ nodeType: 3, text: s, appendData(x) { this.text += x } })

function lineText(el) {
  return el.children.map((c) => (c.nodeType === 3 ? c.text : c.textContent)).join("") || el.textContent
}

test("N1 嵌套工具行：行首 dim 子标 `explore#1 · ` + 正文", () => {
  const { block, content } = fakeBlock()
  appendAdvisorChunk(block, "tool", "read — src/x.mjs", "explore#1", { face: "tool", tool: "read" })
  const line = content.children[0]
  assert.equal(line.className, "advisor-tool-line")
  assert.equal(line.dataset.sub, "explore#1")
  assert.equal(line.children[0].className, "advisor-sub", "行首子标是独立 span（可着色）")
  assert.equal(line.children[0].textContent, "explore#1 · ")
  assert.equal(lineText(line), "explore#1 · read — src/x.mjs")
})

test("N2 嵌套文本/思考行：同样带子标", () => {
  const { block, content } = fakeBlock()
  appendAdvisorChunk(block, "text", "正在核对文档面", "advisor#1", {})
  appendAdvisorChunk(block, "think", "先看 §5.2", "advisor#1", {})
  assert.equal(lineText(content.children[0]), "advisor#1 · 正在核对文档面")
  assert.equal(lineText(content.children[1]), "advisor#1 · 先看 §5.2")
  assert.equal(content.children[1].className.includes("advisor-think"), true)
})

test("N3 无 sub（父自己）行：零子标、零 span", () => {
  const { block, content } = fakeBlock()
  appendAdvisorChunk(block, "tool", "bash — npm test", null, { face: "tool", tool: "bash" })
  const line = content.children[0]
  assert.equal(line.children.length, 0, "无子标 ⇒ 不建 span")
  assert.equal(line.textContent, "bash — npm test")
})

test("N4 续写（toolOutput 合并）：正文并入末文本节点，子标只出现一次", () => {
  const { block, content } = fakeBlock()
  appendAdvisorChunk(block, "tool", "line1", "explore#1", { face: "toolOutput", tool: "read" })
  appendAdvisorChunk(block, "tool", "line2", "explore#1", { face: "toolOutput", tool: "read" })
  const line = content.children[0]
  assert.equal(content.children.length, 1, "合并成一行")
  assert.equal(lineText(line), "explore#1 · line1line2", "子标一份，正文 RAW 拼接")
})

test("N5 CSS：两端各有一条 .advisor-sub 规则（VSC ∥ 桌面）", () => {
  for (const p of ["../webview/chat.css", "../../thincoder-desktop/renderer/core.css"]) {
    const css = readFileSync(new URL(p, import.meta.url), "utf8")
    assert.equal(/\.advisor-sub\s*\{/.test(css), true, `${p} 含 .advisor-sub`)
  }
})
