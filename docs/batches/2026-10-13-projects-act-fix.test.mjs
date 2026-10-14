/**
 * 2026-10-13 · projects-act-fix 轻通道轮 —— 批内件（红-绿对）
 *
 * 缺陷（用户 2026-10-13 22:59 报障）：`views-projects.mjs` 弹窗内动作收口断裂——
 * `act(call, message)` 以 `await call()` 调 thunk（house 约定 = `modal.mjs` submitThen 形），
 * 而全部五调用点传入的却是「已启动的 Promise」：`promise()` ⇒ TypeError（被 catch 就地吞）⇒
 * flash ∥ 重载（弹窗编辑器收起回只读）∥ onChanged（宿主列表刷新）全不执行；
 * 请求因实参求值已先行发出 ⇒ 服务端改动成功、界面无收口。
 * 症状（用户报障原文）：① 更换负责人保存后不切回只读状态 ② 关窗后列表不刷新、新负责人不入列。
 *
 * 修复 = 五调用点 thunk 化（`act(() => ctx.api(...), …)`——`views-projects.mjs:164/:193/:242/:246/:261`）。
 * 红-绿判据（本件全绿 = 修复到位）：每次动作收口 = 载荷出网 ∧ flash 达 ∧ 弹窗重渲（编辑器收起）∧ onChanged 被调。
 * 修复前跑 ⇒ 红（flash ∥ 收起 ∥ onChanged 三断言缺）；修复后跑 ⇒ 绿。
 * 跑法：cwd = 仓库根（thincoder/）—— `node --test docs/batches/2026-10-13-projects-act-fix.test.mjs`
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const PUBLIC_DIR = join(ROOT, "thincoder-server", "public")
const load = (name) => import(pathToFileURL(join(PUBLIC_DIR, name)).href)

// 桩（`dom.mjs` 顶层触 `document`——先桩后 import）
globalThis.document = { getElementById: () => null }
const [{ ZH }] = await Promise.all([load("i18n-zh.mjs")])
const PROJECTS_VIEW = await load("views-projects.mjs")

// ── 桩 DOM 夹具（沿 2026-10-12-team-projects-permissions-ui 同法——modal.mjs 壳面近形） ──

function makeNode(tag) {
  const classes = new Set()
  return {
    tag, children: [], listeners: {}, attrs: {}, parent: null,
    open: false, textContent: "", className: "", value: "", hidden: false, disabled: false, checked: false,
    classList: { add: (name) => classes.add(name), remove: (name) => classes.delete(name), contains: (name) => classes.has(name) },
    append(...items) {
      for (const item of items.flat(Infinity)) {
        if (item === null || item === undefined || item === false) continue
        if (typeof item === "object") item.parent = this
        this.children.push(item)
      }
    },
    replaceChildren(...items) { this.children = []; this.append(...items) },
    addEventListener(type, fn) { (this.listeners[type] ??= []).push(fn) },
    setAttribute(name, value) { this.attrs[name] = String(value) },
    remove() {
      if (this.parent !== null) this.parent.children = this.parent.children.filter((child) => child !== this)
      this.parent = null
    },
    focus() {},
    fire(type, event = {}) {
      const target = { preventDefault() {}, stopPropagation() {}, ...event }
      return Promise.all((this.listeners[type] ?? []).map((fn) => fn(target)))
    },
    showModal() { this.open = true },
    close() { this.open = false; for (const fn of this.listeners.close ?? []) fn({}) },
  }
}

const stubDocument = () => ({ body: makeNode("body"), createElement: (tag) => makeNode(tag), getElementById: () => null })

/** `h`（app.mjs 语义近似——本件只需 class ∥ text ∥ on 前缀事件 ∥ 受控属性 ∥ 其余 setAttribute + 子节点）。 */
function fH(tag, props = {}, ...children) {
  const node = makeNode(tag)
  for (const [key, value] of Object.entries(props)) {
    if (value === null || value === undefined || value === false) continue
    if (key === "class") node.className = String(value)
    else if (key === "text") node.textContent = String(value)
    else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2), value)
    else if (["value", "checked", "disabled", "hidden"].includes(key)) node[key] = value
    else node.setAttribute(key, value)
  }
  for (const child of children.flat(Infinity)) {
    if (child === null || child === undefined || child === false) continue
    node.append(child)
  }
  return node
}

function fFindAll(root, pred, out = []) {
  if (root !== null && typeof root === "object") {
    if (pred(root)) out.push(root)
    for (const child of root.children ?? []) fFindAll(child, pred, out)
  }
  return out
}
const fFind = (root, pred) => fFindAll(root, pred)[0] ?? null
const textOf = (node) => (typeof node === "string" ? node : [node?.textContent ?? "", ...(node?.children ?? []).map(textOf)].filter(Boolean).join(" "))
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const settle = async () => { await tick(); await tick(); await tick(); await tick() }
const modalOf = () => fFind(globalThis.document.body, (node) => node.tag === "dialog")

/** 桩 ctx（api 路由表 `"METHOD path"` ⇒ handler；全调用入 `calls`）。 */
function fCtx(routes = {}, member = { username: "alice", role: "admin" }) {
  const calls = []
  const ctx = {
    h: fH,
    state: { member, system: null },
    api: async (path, { method = "GET", body } = {}) => {
      calls.push([method, path, body ?? null])
      const handler = routes[`${method} ${path}`]
      if (handler === undefined) throw new Error(`unexpected ${method} ${path}`)
      return handler(body)
    },
    fmtTs: (ts) => `ts:${ts}`,
    fmtValue: (value) => (value === null || value === undefined ? "—" : String(value)),
    flash: (message) => calls.push(["flash", message]),
    fail: (error) => calls.push(["fail", String(error?.message ?? error)]),
    showSecret: () => {},
    }
  return { ctx, calls }
}

/** 开弹窗前桩态：有状态假件——PATCH/POST/DELETE 生效于 `project` ∥ `members`；各 GET 返当刻读值。 */
function fState() {
  const project = { id: 1, displayName: "Repo One", address: "https://gitee.com/org/repo", source: { id: 7, name: "src-a", platform: "gitee" }, owner: "alice", level: "manage", memberCount: 2 }
  const members = [
    { username: "alice", level: "manage", origin: "manual", syncedRole: null },
    { username: "bob", level: "read", origin: "sync", syncedRole: "member" },
  ]
  const my = { level: "manage", owner: true, admin: true, can: { view: true, write: true, manageMembers: true, rename: true, editAddress: true, delete: true } }
  const routes = {
    "GET /api/projects/1": () => ({ project: { ...project }, members: members.map((m) => ({ ...m })), my }),
    "PATCH /api/projects/1": (body) => { Object.assign(project, body); return { ok: true } },
    "PATCH /api/projects/1/members/bob": (body) => { const m = members.find((x) => x.username === "bob"); if (body?.level) m.level = body.level; return { ok: true } },
    "DELETE /api/projects/1/members/bob": () => { return { ok: true } },
    "POST /api/projects/1/members": () => ({ ok: true }),
  }
  return { routes }
}

/** 负向断言小件：断言「本刻未达」——红态观察用（修复前跑出示红；修复后不再触发）。 */
const flashes = (calls) => calls.filter(([method]) => method === "flash").map(([, message]) => message)

// ── ① 更换负责人径（用户报障径——run 全链断言） ─────────────────────────────────

test("① 更换负责人：保存 ⇒ 载荷出网 ∧ flash 达 ∧ 弹窗收起回只读 ∧ onChanged 达", async () => {
  try {
    globalThis.document = stubDocument()
    const { routes } = fState()
    let onChangedCount = 0
    const { ctx, calls } = fCtx(routes)
    PROJECTS_VIEW.openProjectDetail(ctx, { projectId: 1, onChanged: () => { onChangedCount += 1 } })
    await settle()
    const dialog = modalOf()
    assert.ok(dialog !== null, "详情弹窗在册")

    // 进编辑：负责人格「更换负责人」
    const changeBtn = fFind(dialog, (node) => node.tag === "button" && node.textContent === ZH["me.projects.changeOwner"])
    assert.ok(changeBtn !== null, "「更换负责人」钮在册（admin）")
    await changeBtn.fire("click")
    const ownerDd = fFindAll(dialog, (node) => node.tag === "dd").at(-1)
    const select = fFind(ownerDd, (node) => node.tag === "select")
    assert.ok(select !== null, "编辑态：负责人选单在册")
    select.value = "bob"
    const saveBtn = fFindAll(ownerDd, (node) => node.tag === "button").find((button) => button.textContent === ZH["common.save"])
    assert.ok(saveBtn !== undefined, "编辑态：保存钮在册")
    await saveBtn.fire("click")
    await settle()

    // ① 载荷逐值出网
    assert.deepEqual(calls.find(([method]) => method === "PATCH"), ["PATCH", "/api/projects/1", { owner: "bob" }], "PATCH {owner:bob} 逐值")
    // ② flash 达（收口第一半）
    assert.ok(flashes(calls).includes(ZH["me.projects.ownerSaved"]), "flash「负责人已更新」在册")
    // ③ 弹窗重渲：编辑器收起回只读 ∧ 新读数在册（收口第二半）
    const ownerAfter = fFindAll(modalOf(), (node) => node.tag === "dd").at(-1)
    assert.equal(fFindAll(ownerAfter, (node) => node.tag === "select").length, 0, "编辑器已收起（负责人格无选单）")
    assert.equal(fFindAll(ownerAfter, (node) => node.tag === "button" && node.textContent === ZH["common.save"]).length, 0, "编辑器已收起（无保存钮）")
    assert.ok(fFind(ownerAfter, (node) => node.tag === "button" && node.textContent === ZH["me.projects.changeOwner"]) !== null, "只读态「更换负责人」钮归位")
    assert.ok(textOf(ownerAfter).includes("bob"), "重载后负责人读数 = bob")
    // ④ onChanged（宿主列表刷新口）
    assert.equal(onChangedCount, 1, "onChanged 被调一次（列表刷新）")
  } finally { delete globalThis.document }
})

// ── ② 同族四径：改名 ∥ 改档 ∥ 移除成员 ∥ 加成员——各收口全达 ────────────────────────

test("② 同族四径：改名 ∥ 改档 ∥ 移除成员 ∥ 加成员——各收口全达", async () => {
  try {
    globalThis.document = stubDocument()
    const { routes } = fState()
    let onChangedCount = 0
    const { ctx, calls } = fCtx(routes)
    PROJECTS_VIEW.openProjectDetail(ctx, { projectId: 1, onChanged: () => { onChangedCount += 1 } })
    await settle()

    // 改名径（editInPlace——与改地址同站点）
    let dialog = modalOf()
    await fFind(dialog, (node) => node.tag === "button" && node.textContent === ZH["me.projects.rename"]).fire("click")
    const nameDd = fFindAll(dialog, (node) => node.tag === "dd")[0]
    const nameInput = fFind(nameDd, (node) => node.tag === "input")
    nameInput.value = "Repo Prime"
    await fFindAll(nameDd, (node) => node.tag === "button").find((button) => button.textContent === ZH["common.save"]).fire("click")
    await settle()
    assert.deepEqual(calls.filter(([method]) => method === "PATCH").at(-1), ["PATCH", "/api/projects/1", { displayName: "Repo Prime" }], "改名 PATCH 逐值")
    assert.ok(flashes(calls).includes(ZH["me.projects.renamed"]), "改名 flash 在册")
    assert.equal(onChangedCount, 1, "改名 onChanged 达")
    assert.equal(fFindAll(fFindAll(modalOf(), (node) => node.tag === "dd")[0], (node) => node.tag === "input").length, 0, "改名编辑器已收起")

    // 改档径（成员行选单 change）
    dialog = modalOf()
    const bobRow = fFindAll(dialog, (node) => node.tag === "tr").find((row) => textOf(row).includes("bob"))
    const levelSelect = fFind(bobRow, (node) => node.tag === "select")
    levelSelect.value = "readwrite"
    await levelSelect.fire("change")
    await settle()
    assert.deepEqual(calls.filter(([method]) => method === "PATCH").at(-1), ["PATCH", "/api/projects/1/members/bob", { level: "readwrite" }], "改档 PATCH 逐值")
    assert.ok(flashes(calls).some((message) => message.includes("bob")), "改档 flash 在册（携用户名）")
    assert.equal(onChangedCount, 2, "改档 onChanged 达")

    // 移除成员径
    dialog = modalOf()
    const bobRow2 = fFindAll(dialog, (node) => node.tag === "tr").find((row) => textOf(row).includes("bob"))
    await fFind(bobRow2, (node) => node.tag === "button" && node.textContent === ZH["me.projects.memberRemove"]).fire("click")
    await settle()
    assert.deepEqual(calls.filter(([method]) => method === "DELETE").at(-1), ["DELETE", "/api/projects/1/members/bob", null], "移除 DELETE 逐值")
    assert.ok(flashes(calls).some((message) => message.includes("bob")), "移除 flash 在册（携用户名）")
    assert.equal(onChangedCount, 3, "移除 onChanged 达")

    // 加成员径
    dialog = modalOf()
    const addInput = fFind(dialog, (node) => node.tag === "input" && node.attrs.placeholder === ZH["me.projects.memberPh"])
    assert.ok(addInput !== null, "加成员输入在册")
    addInput.value = "carol"
    const addRow = fFindAll(dialog, (node) => node.tag === "div" && node.className === "row-form").find((row) => fFind(row, (node) => node.tag === "input") === addInput)
    const addSelect = fFind(addRow, (node) => node.tag === "select")
    addSelect.value = "read" // 桩无真实选单缺省态——显式置「只读」底线档（真 DOM = 首项缺省）
    await fFind(addRow, (node) => node.tag === "button" && node.textContent === ZH["me.projects.memberAdd"]).fire("click")
    await settle()
    assert.deepEqual(calls.filter(([method]) => method === "POST").at(-1), ["POST", "/api/projects/1/members", { username: "carol", level: "read" }], "加成员 POST 逐值")
    assert.ok(flashes(calls).some((message) => message.includes("carol")), "加成员 flash 在册（携用户名）")
    assert.equal(onChangedCount, 4, "加成员 onChanged 达")
  } finally { delete globalThis.document }
})
