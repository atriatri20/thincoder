/** Minimal DOM fixture for Server composer tests. It implements only the DOM face used during construction and control events. */

class ClassList {
  constructor(el) { this.el = el }
  values() { return this.el.className.split(/\s+/).filter(Boolean) }
  write(values) { this.el.className = [...new Set(values)].join(" ") }
  add(...names) { this.write([...this.values(), ...names]) }
  remove(...names) { this.write(this.values().filter((name) => !names.includes(name))) }
  contains(name) { return this.values().includes(name) }
  toggle(name, force) {
    const on = force === undefined ? !this.contains(name) : force === true
    if (on) this.add(name)
    else this.remove(name)
    return on
  }
}

function matches(el, selector) {
  if (selector.startsWith("#")) return el.id === selector.slice(1)
  if (selector.startsWith(".")) return el.classList.contains(selector.slice(1))
  const attr = /^([a-z]+)\[([\w-]+)="([^"]*)"\]$/.exec(selector)
  if (attr) return el.tagName === attr[1].toUpperCase() && el.getAttribute(attr[2]) === attr[3]
  return el.tagName === selector.toUpperCase()
}

function walk(node, visit) {
  for (const child of node.children ?? []) {
    if (child.tagName && visit(child)) return child
    const found = walk(child, visit)
    if (found) return found
  }
  return null
}

class Element {
  constructor(tag, ownerDocument) {
    this.tagName = String(tag).toUpperCase()
    this.ownerDocument = ownerDocument
    this.children = []
    this.parentNode = null
    this.style = {}
    this.attributes = {}
    this.listeners = new Map()
    this.classList = new ClassList(this)
    this.id = ""
    this.className = ""
    this.textContent = ""
    this.innerHTML = ""
    this.value = ""
    this.disabled = false
    this.hidden = false
    this.dataset = {}
  }
  append(...nodes) {
    for (const raw of nodes) {
      const node = typeof raw === "string" ? this.ownerDocument.createTextNode(raw) : raw
      node.parentNode = this
      this.children.push(node)
    }
  }
  appendChild(node) { this.append(node); return node }
  prepend(node) { node.parentNode = this; this.children.unshift(node) }
  insertBefore(node, before) {
    const index = this.children.indexOf(before)
    node.parentNode = this
    if (index < 0) this.children.push(node)
    else this.children.splice(index, 0, node)
    return node
  }
  replaceChildren(...nodes) { this.children = []; this.append(...nodes) }
  remove() {
    if (!this.parentNode) return
    const index = this.parentNode.children.indexOf(this)
    if (index >= 0) this.parentNode.children.splice(index, 1)
    this.parentNode = null
  }
  setAttribute(name, value) { this.attributes[name] = String(value) }
  getAttribute(name) { return this.attributes[name] ?? null }
  removeAttribute(name) { delete this.attributes[name] }
  addEventListener(type, handler) {
    const list = this.listeners.get(type) ?? []
    list.push(handler)
    this.listeners.set(type, list)
  }
  removeEventListener(type, handler) {
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter((item) => item !== handler))
  }
  dispatch(type, init = {}) {
    const event = {
      type, target: this, currentTarget: this, key: "", isComposing: false,
      preventDefault() { this.defaultPrevented = true }, stopPropagation() { this.propagationStopped = true },
      ...init,
    }
    for (const handler of this.listeners.get(type) ?? []) handler(event)
    return event
  }
  click() { if (!this.disabled) this.dispatch("click") }
  focus() { this.ownerDocument.activeElement = this }
  querySelector(selector) { return walk(this, (el) => matches(el, selector)) }
  querySelectorAll(selector) {
    const out = []
    walk(this, (el) => { if (matches(el, selector)) out.push(el); return false })
    return out
  }
  closest(selector) {
    let node = this
    while (node?.tagName) {
      if (matches(node, selector)) return node
      node = node.parentNode
    }
    return null
  }
  get options() { return this.children.filter((child) => child.tagName === "OPTION") }
  get firstChild() { return this.children[0] ?? null }
  get nextSibling() {
    if (!this.parentNode) return null
    const index = this.parentNode.children.indexOf(this)
    return this.parentNode.children[index + 1] ?? null
  }
  get isConnected() {
    let node = this
    while (node) {
      if (node === this.ownerDocument) return true
      node = node.parentNode
    }
    return false
  }
  getBoundingClientRect() { return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 } }
  scrollIntoView() {}
}

class Document {
  constructor() {
    this.children = []
    this.documentElement = new Element("html", this)
    this.head = new Element("head", this)
    this.body = new Element("body", this)
    this.documentElement.append(this.head, this.body)
    this.documentElement.parentNode = this
    this.listeners = new Map()
    this.activeElement = null
  }
  createElement(tag) { return new Element(tag, this) }
  createTextNode(text) { return { textContent: String(text), children: [], parentNode: null } }
  querySelector(selector) { return walk(this, (el) => matches(el, selector)) }
  querySelectorAll(selector) {
    const out = []
    walk(this, (el) => { if (matches(el, selector)) out.push(el); return false })
    return out
  }
  addEventListener(type, handler) {
    const list = this.listeners.get(type) ?? []
    list.push(handler)
    this.listeners.set(type, list)
  }
  removeEventListener(type, handler) {
    this.listeners.set(type, (this.listeners.get(type) ?? []).filter((item) => item !== handler))
  }
}

export function installMiniDom() {
  const document = new Document()
  globalThis.document = document
  globalThis.window = { innerWidth: 1280, innerHeight: 720 }
  globalThis.requestAnimationFrame = (fn) => { fn(); return 1 }
  globalThis.cancelAnimationFrame = () => {}
  return document
}

/** Server view helper, kept structurally identical to public/dom.mjs h(). */
export function h(tag, props = {}, ...children) {
  const node = document.createElement(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue
    if (key === "class") node.className = value
    else if (key === "text") node.textContent = String(value)
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value)
    else if (["value", "checked", "disabled", "hidden"].includes(key)) node[key] = value
    else node.setAttribute(key, value)
  }
  node.append(...children.flat(Infinity).filter((child) => child !== null && child !== undefined && child !== false))
  return node
}
