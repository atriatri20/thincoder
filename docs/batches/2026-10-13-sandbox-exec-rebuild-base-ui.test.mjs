/**
 * 2026-10-13-sandbox-exec-rebuild-base-ui.test.mjs — thincoder-server 批内单测件（控制台面·底座卡 + 私有仓凭据卡——
 * sandbox-exec-rebuild 批 · 修订轮增补「底座可换」· **前端舱**；名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。
 * 判据源 = `webui/SANDBOX.md` §2.1①（底座卡 ∥ 私有仓凭据卡）∥ §4 底座可换行 ∥ §3 件账（`views-sandbox-base.mjs`）∥
 * `sandbox/SANDBOX.md` §3 底座可换块 ∥ `sandbox/EXECUTION.md` §8/§13（N71/N72 ∥ B74/B75 ∥ E56/E57）∥ `gateway/API.md` §2.5 ∥ 批档 §2 §5。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-sandbox-exec-rebuild-base-ui.test.mjs`
 *
 * 射程（腿 ↔ 验收对照）：
 *   ① 底座卡渲染：说明行 ∥ 工作区表三列 ∥ 底座两态（「标准」态标 ∥ 引用）∥ 空态句
 *   ② 设底座弹窗：两径（提交 `baseImage` ∥ 「恢复标准」⇒ `null`）∥ 成 ⇒ 关窗 + flash + 重取 ∥ 败 ⇒ 窗内就地人话 + 窗不关 ∥ 空引用 ⇒ 必填门（零请求）
 *   ③ 构建钮（N71｜E56）：在飞态「构建中……」+ 钮禁用 ∥ 成 ⇒ 成功句两形（tag ∥ 缓存命中）∥ 败 ⇒ 红条 + 钮复原 ∥ 未绑节点 ⇒ 钮禁用 + 一句人话
 *   ④ 凭据卡渲染：三列 + 操作（改/删）∥ 密文零回显（响应纵携也不现）∥ 空态句
 *   ⑤ 凭据弹窗（N72）：增 ⇒ POST 三键 ∥ 改 ⇒ PATCH + **密文零回填**（非秘密列回填、秘密列恒空；留空不携 `secret` 键）∥ 删 ⇒ 确认窗 + DELETE
 *   ⑥ i18n：+32 键两表逐字 ∥ 占位符一致 ∥ en 零 CJK ∥ 键集相等 ∥ 键数 269 ∥ 消费在册
 *   ⑦ 静态面：两卡入标签②（读时口径——未激活零读）∥ 零新 `:root` 变量 ∥ 新档行数 ≤500 ∥ 零色字面量
 *
 * 桩说明：直调 `createBaseSection`（桩 ctx + 假 API 路由表；DOM 桩 = `h` 语义近似）+ 整页装配 `renderSandbox` 一腿。
 * 零网络零真浏览器（真机收口 = 父侧收口轮）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const PUBLIC_DIR = join(ROOT, "thincoder-server", "public")
const readPublic = (name) => readFileSync(join(PUBLIC_DIR, name), "utf8")
const linesOf = (name) => { const text = readPublic(name); return text.split("\n").length - (text.endsWith("\n") ? 1 : 0) }
const load = (name) => import(pathToFileURL(join(PUBLIC_DIR, name)).href)

// ── 桩 DOM（`h` 语义近似：受控属性 ∥ on* 事件 ∥ 子节点）─────────────────────────────

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
      const target = { preventDefault() {}, ...event }
      return Promise.all((this.listeners[type] ?? []).map((fn) => fn(target)))
    },
    showModal() { this.open = true },
    close() { this.open = false; for (const fn of this.listeners.close ?? []) fn({}) },
  }
}

const stubDocument = () => ({ body: makeNode("body"), createElement: (tag) => makeNode(tag), getElementById: () => null })

/** `h`（app.mjs 语义近似）：class ∥ text ∥ on 前缀事件 ∥ 受控属性 ∥ 其余 setAttribute + 子节点。 */
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
const byText = (root, text) => fFind(root, (node) => node.textContent === text)
const textOf = (node) => (node === null ? "" : (node.children ?? []).reduce((acc, child) => acc + (typeof child === "object" && child !== null ? textOf(child) : String(child)), node.textContent ?? ""))
const buttonsOf = (root) => fFindAll(root, (node) => node.tag === "button")
const rowFor = (root, name) => fFindAll(root, (node) => node.tag === "tr").find((row) => fFind(row, (cell) => cell.tag === "td" && cell.textContent === name)) ?? null
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const fill = (text, params) => String(text).replace(/\{(\w+)\}/g, (match, name) => (name in params ? String(params[name]) : match))
const placeholders = (text) => [...String(text).matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort().join(",")
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/

/** 桩 ctx（api 路由表 `"METHOD path"` ⇒ handler；全调用入 `calls`）。 */
function fCtx(routes = {}) {
  const calls = []
  const ctx = {
    h: fH,
    state: {},
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
  }
  return { ctx, calls }
}

/** 确定性失败（映射面人话——`upstream_error` 携引擎原文）。 */
const upstreamFail = (message) => () => { throw Object.assign(new Error(message), { code: "upstream_error", status: 502 }) }
const callsOf = (calls, method, path) => calls.filter(([m, p]) => m === method && p === path).length
const flashOf = (calls) => calls.filter(([tag]) => tag === "flash").map(([, message]) => message)

/** 延迟桩（在飞期观察——resolve/reject 由腿驱）。 */
function deferred() {
  let resolve
  let reject
  const promise = new Promise((res, rej) => { resolve = res; reject = rej })
  return { promise, resolve, reject }
}

const fWorkspace = (over = {}) => ({ id: 1, name: "ws-a", ownerMemberId: 1, runnerId: 1, runnerName: "box-a", boxState: "running", dirty: false, checkpointCount: 0, limits: {}, baseImage: null, ...over })
const fCredential = (over = {}) => ({ id: 5, host: "ghcr.io", username: "acme", createdAt: "2026-10-13T00:00:00.000Z", updatedAt: "2026-10-13T00:00:00.000Z", ...over })

const BASE = await load("views-sandbox-base.mjs")
const SANDBOX = await load("views-sandbox.mjs")
const { ZH_SANDBOX } = await load("i18n-zh-sandbox.mjs")
const { EN_SANDBOX } = await load("i18n-en-sandbox.mjs")
const { ZH } = await load("i18n-zh.mjs")
const SOURCE = readPublic("views-sandbox-base.mjs")
const PAGE = readPublic("views-sandbox.mjs")
const CSS = readPublic("style.css")

/** 两卡件夹具（直调 `createBaseSection`——桩 ctx + 假 API 两读）。 */
async function fMountBase({ workspaces = [fWorkspace()], credentials = [fCredential()], routes = {} } = {}) {
  globalThis.document = stubDocument()
  const { ctx, calls } = fCtx({
    "GET /api/admin/sandbox/workspaces": () => ({ workspaces }),
    "GET /api/admin/sandbox/registry-credentials": () => ({ credentials }),
    ...routes,
  })
  const section = BASE.createBaseSection(ctx)
  await tick()
  return { ctx, calls, section, modal: () => fFind(globalThis.document.body, (node) => node.tag === "dialog") }
}

// ── ① 底座卡渲染（说明行 ∥ 三列 ∥ 底座两态 ∥ 空态）───────────────────────────────

test("① 底座卡：说明行 ∥ 工作区表三列 ∥ 底座两态（「标准」态标 ∥ 引用）∥ 未绑禁用 ∥ 空态句", async () => {
  const { section } = await fMountBase({
    workspaces: [fWorkspace(), fWorkspace({ id: 2, name: "ws-b", runnerId: null, baseImage: "ghcr.io/acme/base:24" })],
  })
  const card = section.baseCard
  assert.equal(card.className, "card", "卡壳 = `.card`")
  assert.equal(fFind(card, (node) => node.tag === "h3").textContent, ZH_SANDBOX["admin.sandbox.baseTitle"], "卡题 = 盒底座镜像")
  assert.ok(textOf(card).includes(ZH_SANDBOX["admin.sandbox.baseIntro"]), "说明行在册（缺省 = 标准镜像 ∥ 派生 ∥ 生效 = 下次建盒/重建）")
  const headers = fFindAll(fFind(card, (node) => node.tag === "table"), (node) => node.tag === "th").map((cell) => cell.textContent)
  assert.deepEqual(headers, [ZH_SANDBOX["admin.sandbox.baseColWorkspace"], ZH_SANDBOX["admin.sandbox.baseColBase"], ZH_SANDBOX["admin.sandbox.colActions"]], "三列表头（工作区 ∥ 底座 ∥ 操作）")
  const bound = rowFor(card, "ws-a")
  const standard = fFind(bound, (node) => String(node.className).includes("badge"))
  assert.equal(standard.textContent, ZH_SANDBOX["admin.sandbox.baseStandard"], "未绑定底座 ⇒ 「标准」态标")
  assert.deepEqual(buttonsOf(bound).map((button) => button.textContent), [ZH_SANDBOX["admin.sandbox.baseSet"], ZH_SANDBOX["admin.sandbox.baseBuild"]], "行操作 = 设底座 + 构建（序）")
  assert.equal(buttonsOf(bound)[1].disabled, false, "已绑节点 ⇒ 构建可用")
  const unbound = rowFor(card, "ws-b")
  assert.ok(textOf(unbound).includes("ghcr.io/acme/base:24"), "自定义底座 ⇒ 引用列示")
  assert.equal(fFind(unbound, (node) => String(node.className).includes("badge")), null, "引用态非「标准」态标")
  assert.equal(buttonsOf(unbound)[1].disabled, true, "未绑节点 ⇒ 构建钮禁用")
  assert.ok(textOf(unbound).includes(ZH_SANDBOX["admin.sandbox.baseUnbound"]), "未绑 ⇒ 一句人话")
  const empty = await fMountBase({ workspaces: [] })
  assert.ok(textOf(empty.section.baseCard).includes(ZH_SANDBOX["admin.sandbox.baseEmpty"]), "空态句（暂无工作区）")
})

// ── ② 设底座弹窗（两径 ∥ 成败两径）──────────────────────────────────────────────

test("② 设底座弹窗：提交 `baseImage` ∥ 「恢复标准」⇒ `null` ∥ 成 ⇒ 关窗 + flash + 重取 ∥ 败 ⇒ 窗内就地人话 ∥ 空引用必填门", async () => {
  const mount = await fMountBase({ routes: { "PATCH /api/admin/sandbox/workspaces/1": () => ({ workspace: fWorkspace() }) } })
  await byText(mount.section.baseCard, ZH_SANDBOX["admin.sandbox.baseSet"]).fire("click")
  const dialog = mount.modal()
  assert.equal(fFind(dialog, (node) => node.tag === "h3").textContent, ZH_SANDBOX["admin.sandbox.baseSet"], "窗题 = 设底座")
  assert.ok(textOf(dialog).includes(ZH_SANDBOX["admin.sandbox.baseRefHint"]), "形提示在册（私有仓先录凭据）")
  const form = fFind(dialog, (node) => node.tag === "form")
  await form.fire("submit") // 空引用 ⇒ 必填门
  assert.equal(callsOf(mount.calls, "PATCH", "/api/admin/sandbox/workspaces/1"), 0, "空引用 ⇒ 零请求")
  const input = fFind(dialog, (node) => node.tag === "input")
  assert.equal(input.attrs.placeholder, ZH_SANDBOX["admin.sandbox.baseRefPh"], "引用输入占位")
  assert.ok(textOf(dialog).includes(fill(ZH_SANDBOX["admin.sandbox.fieldRequired"], { field: ZH_SANDBOX["admin.sandbox.baseRef"] })), "必填门人话")
  input.value = "ghcr.io/acme/base:24"
  await form.fire("submit")
  assert.deepEqual(mount.calls.find(([m]) => m === "PATCH"), ["PATCH", "/api/admin/sandbox/workspaces/1", { baseImage: "ghcr.io/acme/base:24" }], "提交体 = `{ baseImage }` 逐值")
  assert.deepEqual(flashOf(mount.calls), [fill(ZH_SANDBOX["admin.sandbox.baseSetOk"], { name: "ws-a" })], "成 ⇒ 成功句（含工作区名）")
  assert.equal(mount.modal(), null, "成 ⇒ 关窗")
  assert.equal(callsOf(mount.calls, "GET", "/api/admin/sandbox/workspaces"), 2, "成 ⇒ 重取（界面上新）")
  // 恢复标准（同窗第二径）：`baseImage: null`
  const restore = await fMountBase({ routes: { "PATCH /api/admin/sandbox/workspaces/1": () => ({ workspace: fWorkspace() }) } })
  await byText(restore.section.baseCard, ZH_SANDBOX["admin.sandbox.baseSet"]).fire("click")
  await byText(restore.modal(), ZH_SANDBOX["admin.sandbox.baseRestore"]).fire("click")
  assert.deepEqual(restore.calls.find(([m]) => m === "PATCH"), ["PATCH", "/api/admin/sandbox/workspaces/1", { baseImage: null }], "恢复标准 ⇒ `baseImage: null`")
  assert.deepEqual(flashOf(restore.calls), [fill(ZH_SANDBOX["admin.sandbox.baseRestoreOk"], { name: "ws-a" })], "恢复成功句")
  // 败径：400/502 ⇒ 窗内就地人话 + 窗不关 + 零 flash
  const bad = await fMountBase({ routes: { "PATCH /api/admin/sandbox/workspaces/1": upstreamFail("形非法：含 @") } })
  await byText(bad.section.baseCard, ZH_SANDBOX["admin.sandbox.baseSet"]).fire("click")
  const badDialog = bad.modal()
  const badInput = fFind(badDialog, (node) => node.tag === "input")
  badInput.value = "acme/base@sha256:x"
  await fFind(badDialog, (node) => node.tag === "form").fire("submit")
  assert.ok(textOf(badDialog).includes("形非法：含 @"), "败 ⇒ 窗内就地人话（服务端原文）")
  assert.equal(bad.modal() !== null, true, "败 ⇒ 窗不关（草稿不丢）")
  assert.equal(flashOf(bad.calls).length, 0, "败 ⇒ 零成功句")
})

// ── ③ 构建钮（在飞态 ∥ 成两形 ∥ 败 ⇒ 红条）─────────────────────────────────────

test("③ 构建钮：在飞态「构建中……」+ 钮禁用 ∥ 成 ⇒ 成功句两形（tag ∥ 缓存命中）∥ 败 ⇒ 红条 + 钮复原", async () => {
  const pending = deferred()
  const mount = await fMountBase({ routes: { "POST /api/admin/sandbox/workspaces/1/derive": () => pending.promise } })
  const row = rowFor(mount.section.baseCard, "ws-a")
  const buildBtn = buttonsOf(row)[1]
  const inflight = buildBtn.fire("click") // 不 await——在飞期立即观察
  assert.equal(callsOf(mount.calls, "POST", "/api/admin/sandbox/workspaces/1/derive"), 1, "点钮 ⇒ 恰一发（POST derive）")
  assert.equal(buildBtn.disabled, true, "在飞 ⇒ 钮禁用")
  assert.ok(textOf(row).includes(ZH_SANDBOX["admin.sandbox.baseBuilding"]), "在飞句「构建中……可能持续数分钟」")
  pending.resolve({ ok: true, base: "ghcr.io/acme/base:24", tag: "thincoder-sandbox:base-abc123def456", cached: false, pulled: false, ms: 1200 })
  await inflight
  await tick()
  assert.deepEqual(flashOf(mount.calls), [fill(ZH_SANDBOX["admin.sandbox.baseDerived"], { tag: "thincoder-sandbox:base-abc123def456" })], "成（新构建）⇒ 成功句含 tag")
  assert.equal(callsOf(mount.calls, "GET", "/api/admin/sandbox/workspaces"), 2, "成 ⇒ 重取")
  const cachedMount = await fMountBase({ routes: { "POST /api/admin/sandbox/workspaces/1/derive": () => ({ ok: true, tag: "thincoder-sandbox:base-abc123def456", cached: true, pulled: false, ms: 3 }) } })
  await buttonsOf(rowFor(cachedMount.section.baseCard, "ws-a"))[1].fire("click")
  assert.deepEqual(flashOf(cachedMount.calls), [fill(ZH_SANDBOX["admin.sandbox.baseDerivedCached"], { tag: "thincoder-sandbox:base-abc123def456" })], "缓存命中 ⇒ 另一形成功句")
  const bad = await fMountBase({ routes: { "POST /api/admin/sandbox/workspaces/1/derive": upstreamFail("底座镜像不在节点——先备供体镜像") } })
  const badRow = rowFor(bad.section.baseCard, "ws-a")
  await buttonsOf(badRow)[1].fire("click")
  assert.deepEqual(bad.calls.filter(([tag]) => tag === "fail").map(([, message]) => message), ["底座镜像不在节点——先备供体镜像"], "败 ⇒ 红条人话（原文透传）")
  assert.equal(buttonsOf(badRow)[1].disabled, false, "败 ⇒ 钮复原（可重试）")
  assert.equal(flashOf(bad.calls).length, 0, "败 ⇒ 零成功句")
})

// ── ④ 凭据卡渲染（三列 + 操作 ∥ 零秘密 ∥ 空态）────────────────────────────────────

test("④ 凭据卡：表三列 + 操作（改/删）∥ 密文零回显（响应携也不现）∥ 空态句", async () => {
  const { section } = await fMountBase({ credentials: [fCredential({ secret: "tok-leak-9f2" })] }) // 响应携密字段（纵服务端泄漏——页也零呈现）
  const card = section.credCard
  assert.equal(fFind(card, (node) => node.tag === "h3").textContent, ZH_SANDBOX["admin.sandbox.credTitle"], "卡题 = 私有仓凭据")
  const headers = fFindAll(fFind(card, (node) => node.tag === "table"), (node) => node.tag === "th").map((cell) => cell.textContent)
  assert.deepEqual(headers, [ZH_SANDBOX["admin.sandbox.credColHost"], ZH_SANDBOX["admin.sandbox.credColUser"], ZH_SANDBOX["admin.sandbox.credColUpdated"], ZH_SANDBOX["admin.sandbox.colActions"]], "四列表头（注册表 ∥ 用户名 ∥ 更新时间 ∥ 操作）")
  const row = rowFor(card, "ghcr.io")
  assert.ok(textOf(row).includes("acme"), "用户名列")
  assert.ok(textOf(row).includes("ts:2026-10-13T00:00:00.000Z"), "更新时间列（`fmtTs`）")
  assert.deepEqual(buttonsOf(row).map((button) => button.textContent), [ZH_SANDBOX["admin.sandbox.sourceEdit"], ZH_SANDBOX["admin.sandbox.remove"]], "行操作 = 改 ∥ 删")
  assert.equal(textOf(card).includes("tok-leak-9f2"), false, "密文零回显（响应携 `secret` 值——页整卡零呈现）")
  assert.equal(textOf(card).includes("secret"), false, "零秘密列（键名亦不现）")
  const empty = await fMountBase({ credentials: [] })
  assert.ok(textOf(empty.section.credCard).includes(ZH_SANDBOX["admin.sandbox.credEmpty"]), "空态句（暂无私有仓凭据）")
})

// ── ⑤ 凭据三径（增 ∥ 改零回填 ∥ 删确认）────────────────────────────────────────

test("⑤ 凭据三径：增 ⇒ POST 三键 ∥ 改 ⇒ PATCH + 密文零回填（留空不携 `secret`）∥ 删 ⇒ 确认窗 + DELETE", async () => {
  const mount = await fMountBase({ routes: {
    "POST /api/admin/sandbox/registry-credentials": () => ({ credential: fCredential() }),
    "PATCH /api/admin/sandbox/registry-credentials/5": () => ({ credential: fCredential() }),
    "DELETE /api/admin/sandbox/registry-credentials/5": () => ({ ok: true }),
  } })
  const card = mount.section.credCard
  await byText(card, ZH_SANDBOX["admin.sandbox.credAdd"]).fire("click")
  let dialog = mount.modal()
  assert.equal(fFind(dialog, (node) => node.tag === "h3").textContent, ZH_SANDBOX["admin.sandbox.credTitle"], "增窗题 = 私有仓凭据")
  assert.ok(textOf(dialog).includes(ZH_SANDBOX["admin.sandbox.credHostHint"]), "主机提示在册（注册表主机——非站点主机）")
  const [hostInput, userInput, secretInput] = fFindAll(dialog, (node) => ["input", "textarea"].includes(node.tag))
  assert.equal(secretInput.attrs.type, "password", "口令/令牌 = password 输入")
  await fFind(dialog, (node) => node.tag === "form").fire("submit") // 空 ⇒ 必填门
  assert.equal(callsOf(mount.calls, "POST", "/api/admin/sandbox/registry-credentials"), 0, "空表 ⇒ 零请求")
  hostInput.value = "ghcr.io"
  userInput.value = "acme"
  secretInput.value = "tok-1"
  await fFind(dialog, (node) => node.tag === "form").fire("submit")
  assert.deepEqual(mount.calls.find(([m]) => m === "POST"), ["POST", "/api/admin/sandbox/registry-credentials", { host: "ghcr.io", username: "acme", secret: "tok-1" }], "增 ⇒ POST `{ host, username, secret }`")
  assert.deepEqual(flashOf(mount.calls), [fill(ZH_SANDBOX["admin.sandbox.credSaved"], { host: "ghcr.io" })], "成 ⇒ 成功句")
  assert.equal(callsOf(mount.calls, "GET", "/api/admin/sandbox/registry-credentials"), 2, "成 ⇒ 重取")
  // 改径：非秘密列回填 ∥ 秘密列恒空（零回填）
  await byText(card, ZH_SANDBOX["admin.sandbox.sourceEdit"]).fire("click")
  dialog = mount.modal()
  const [editHost, editUser, editSecret] = fFindAll(dialog, (node) => ["input", "textarea"].includes(node.tag))
  assert.deepEqual([editHost.value, editUser.value], ["ghcr.io", "acme"], "非秘密列回填")
  assert.equal(editSecret.value, "", "密文零回填（恒空）")
  editUser.value = "acme-2"
  await fFind(dialog, (node) => node.tag === "form").fire("submit")
  assert.deepEqual(mount.calls.filter(([m]) => m === "PATCH"), [["PATCH", "/api/admin/sandbox/registry-credentials/5", { host: "ghcr.io", username: "acme-2" }]], "改 ⇒ PATCH 键级（留空 ⇒ 不携 `secret`——密文不动）")
  // 删径：确认窗（后果句）⇒ DELETE
  await byText(card, ZH_SANDBOX["admin.sandbox.remove"]).fire("click")
  dialog = mount.modal()
  assert.ok(textOf(dialog).includes(fill(ZH_SANDBOX["admin.sandbox.credDeleteConfirm"], { host: "ghcr.io" })), "删除确认后果句（只删 server 侧存留——已拉镜像不受影响）")
  await fFind(dialog, (node) => node.tag === "button" && String(node.className).includes("danger")).fire("click")
  assert.deepEqual(mount.calls.find(([m]) => m === "DELETE"), ["DELETE", "/api/admin/sandbox/registry-credentials/5", null], "删 ⇒ DELETE 路径逐值")
  assert.deepEqual(flashOf(mount.calls), [
    fill(ZH_SANDBOX["admin.sandbox.credSaved"], { host: "ghcr.io" }),
    fill(ZH_SANDBOX["admin.sandbox.credSaved"], { host: "ghcr.io" }),
    fill(ZH_SANDBOX["admin.sandbox.credDeleted"], { host: "ghcr.io" }),
  ], "增/改 ⇒ 保存句 ∥ 删 ⇒ 删除句")
})

// ── ⑥ i18n（+32 键两表逐字 ∥ 键集相等 ∥ 消费在册）───────────────────────────────

test("⑥ i18n：+32 键两表逐字 ∥ 占位符一致 ∥ en 零 CJK ∥ 键集相等 ∥ 键数 269 ∥ 消费在册", () => {
  const ZH_WANT = {
    "admin.sandbox.baseTitle": "盒底座镜像",
    "admin.sandbox.baseIntro": "缺省 = 标准镜像；自定义 ⇒ 我方组件叠加上去（派生镜像 thincoder-sandbox:base-…）；生效 = 下次建盒/重建。",
    "admin.sandbox.baseColWorkspace": "工作区",
    "admin.sandbox.baseColBase": "底座",
    "admin.sandbox.baseStandard": "标准",
    "admin.sandbox.baseSet": "设底座",
    "admin.sandbox.baseBuild": "构建",
    "admin.sandbox.baseRef": "镜像引用（名[:标签]）",
    "admin.sandbox.baseRefPh": "如 ghcr.io/acme/base:24",
    "admin.sandbox.baseRefHint": "形 = 名[:标签]（缺标签按 latest）；私有仓先录凭据。",
    "admin.sandbox.baseRestore": "恢复标准",
    "admin.sandbox.baseSetOk": "底座已设：{name}",
    "admin.sandbox.baseRestoreOk": "已恢复标准底座：{name}",
    "admin.sandbox.baseBuilding": "构建中……可能持续数分钟",
    "admin.sandbox.baseDerived": "派生镜像已构建：{tag}",
    "admin.sandbox.baseDerivedCached": "派生镜像已在节点（缓存命中）：{tag}",
    "admin.sandbox.baseUnbound": "未绑节点——先放置再构建",
    "admin.sandbox.baseEmpty": "暂无工作区",
    "admin.sandbox.credTitle": "私有仓凭据",
    "admin.sandbox.credColHost": "注册表",
    "admin.sandbox.credColUser": "用户名",
    "admin.sandbox.credColUpdated": "更新时间",
    "admin.sandbox.credAdd": "添加凭据",
    "admin.sandbox.credHost": "注册表主机",
    "admin.sandbox.credHostHint": "填注册表主机（如 docker.io），不是站点主机。",
    "admin.sandbox.credSecret": "口令/令牌",
    "admin.sandbox.credSecretPh": "只进不出——不回显",
    "admin.sandbox.credSaved": "凭据已保存：{host}",
    "admin.sandbox.credDeleteTitle": "删除凭据",
    "admin.sandbox.credDeleteConfirm": "删除注册表「{host}」的凭据？只删 server 侧存留——已拉镜像不受影响。",
    "admin.sandbox.credDeleted": "凭据已删除：{host}",
    "admin.sandbox.credEmpty": "暂无私有仓凭据",
  }
  const EN_WANT = {
    "admin.sandbox.baseTitle": "Box base image",
    "admin.sandbox.baseIntro": "Default = the standard image; custom ⇒ our components are layered on top (derived image thincoder-sandbox:base-…); takes effect on the next box build/rebuild.",
    "admin.sandbox.baseColWorkspace": "Workspace",
    "admin.sandbox.baseColBase": "Base",
    "admin.sandbox.baseStandard": "Standard",
    "admin.sandbox.baseSet": "Set base",
    "admin.sandbox.baseBuild": "Build",
    "admin.sandbox.baseRef": "Image reference (name[:tag])",
    "admin.sandbox.baseRefPh": "e.g. ghcr.io/acme/base:24",
    "admin.sandbox.baseRefHint": "Form: name[:tag] (a missing tag means latest); record registry credentials first for private registries.",
    "admin.sandbox.baseRestore": "Restore standard",
    "admin.sandbox.baseSetOk": "Base set: {name}",
    "admin.sandbox.baseRestoreOk": "Standard base restored: {name}",
    "admin.sandbox.baseBuilding": "Building… this can take minutes",
    "admin.sandbox.baseDerived": "Derived image built: {tag}",
    "admin.sandbox.baseDerivedCached": "Derived image already on the node (cache hit): {tag}",
    "admin.sandbox.baseUnbound": "Not bound to a node — place it first",
    "admin.sandbox.baseEmpty": "No workspaces",
    "admin.sandbox.credTitle": "Private registry credentials",
    "admin.sandbox.credColHost": "Registry",
    "admin.sandbox.credColUser": "Username",
    "admin.sandbox.credColUpdated": "Updated",
    "admin.sandbox.credAdd": "Add credential",
    "admin.sandbox.credHost": "Registry host",
    "admin.sandbox.credHostHint": "The registry host (e.g. docker.io), not the website host.",
    "admin.sandbox.credSecret": "Password / token",
    "admin.sandbox.credSecretPh": "Write-only — never echoed",
    "admin.sandbox.credSaved": "Credential saved: {host}",
    "admin.sandbox.credDeleteTitle": "Delete credential",
    "admin.sandbox.credDeleteConfirm": "Delete the credential for registry «{host}»? Only the server-side copy is removed — images already pulled are unaffected.",
    "admin.sandbox.credDeleted": "Credential deleted: {host}",
    "admin.sandbox.credEmpty": "No registry credentials",
  }
  assert.equal(Object.keys(ZH_WANT).length, 32, "本批底座/凭据键数 = 32（+ 连接族 17 ⇒ 表 220 ⇒ 269）")
  for (const [key, text] of Object.entries(ZH_WANT)) assert.equal(ZH_SANDBOX[key], text, `zh 逐字：${key}`)
  for (const [key, text] of Object.entries(EN_WANT)) {
    assert.equal(EN_SANDBOX[key], text, `en 逐字：${key}`)
    assert.equal(CJK.test(text), false, `en 零 CJK：${key}`)
    assert.equal(placeholders(EN_SANDBOX[key]), placeholders(ZH_SANDBOX[key]), `占位符两表一致：${key}`)
  }
  for (const key of Object.keys(ZH_WANT)) assert.equal(SOURCE.includes(key), true, `消费在册（views-sandbox-base.mjs）：${key}`)
  assert.deepEqual(Object.keys(ZH_SANDBOX).sort(), Object.keys(EN_SANDBOX).sort(), "两表键集相等（逐键同步）")
  assert.equal(Object.keys(ZH_SANDBOX).length, 269, "zh 沙盒部件键数 269（220 + 32 + 17——连接族 17 键住对档件）")
  assert.equal(Object.keys(EN_SANDBOX).length, 269, "en 沙盒部件键数 269")
})

// ── ⑦ 静态面（两卡入标签② ∥ 零读时 ∥ 零新变量 ∥ 行数/色字面量）─────────────────────

test("⑦ 静态面：两卡入标签②（读时口径——未激活零读）∥ 零新 `:root` 变量 ∥ 新档 ≤500 行 ∥ 零色字面量", async () => {
  globalThis.document = stubDocument()
  const calls = []
  const ctx = fCtx({
    "GET /api/admin/sandbox/overview": () => ({ status: "ok", runners: [] }),
    "GET /api/admin/sandbox/onboarding": () => ({ runs: [] }),
    "GET /api/admin/sandbox/image-sources": () => ({ sources: [] }),
    "GET /api/admin/sandbox/workspaces": () => ({ workspaces: [fWorkspace()] }),
    "GET /api/admin/sandbox/registry-credentials": () => ({ credentials: [fCredential()] }),
  }).ctx
  const spy = { ...ctx, api: (path, options) => { calls.push(path); return ctx.api(path, options) } }
  globalThis.history = { replaceState: () => {} }
  const mount = makeNode("section")
  await SANDBOX.renderSandbox(spy, mount)
  await tick()
  const tabButton = byText(mount, ZH_SANDBOX["admin.sandbox.tabImages"])
  assert.equal(calls.includes("/api/admin/sandbox/workspaces"), false, "未激活标签② ⇒ 零读（读时口径）")
  await tabButton.fire("click")
  await tick()
  assert.equal(calls.filter((path) => path === "/api/admin/sandbox/workspaces").length, 1, "首激活 ⇒ 底座卡读一次")
  assert.equal(calls.filter((path) => path === "/api/admin/sandbox/registry-credentials").length, 1, "首激活 ⇒ 凭据卡读一次")
  const text = textOf(mount)
  assert.ok(text.includes(ZH_SANDBOX["admin.sandbox.baseTitle"]), "底座卡在标签②面内")
  assert.ok(text.includes(ZH_SANDBOX["admin.sandbox.credTitle"]), "凭据卡在标签②面内")
  await byText(mount, ZH_SANDBOX["admin.sandbox.runnersTitle"]).fire("click") // 切回再切来 ⇒ 面板保活（零重读）
  await tabButton.fire("click")
  assert.equal(calls.filter((path) => path === "/api/admin/sandbox/workspaces").length, 1, "面板保活（重切零重读）")
  delete globalThis.history

  const clean = CSS.replace(/\/\*[\s\S]*?\*\//g, "")
  const rootVars = [...clean.match(/:root\s*\{[^{}]*\}/)[0].matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1])
  assert.equal(rootVars.length, 76, ":root 变量计数 = 实施当刻实读 76（本批零 CSS 触面——他批改 style.css 时本件随之重核）")
  assert.equal(/#[0-9a-fA-F]{3,8}\b/.test(SOURCE) || /rgba?\(/.test(SOURCE), false, "零色字面量（变量驱动——`:root` 单源）")
  assert.ok(linesOf("views-sandbox-base.mjs") <= 500, `views-sandbox-base.mjs 越 500 软线：${linesOf("views-sandbox-base.mjs")}`)
  assert.ok(linesOf("views-sandbox.mjs") <= 800, `views-sandbox.mjs 越 800 硬线：${linesOf("views-sandbox.mjs")}`)
  assert.ok(PAGE.includes("createBaseSection"), "页装配挂载点在册（views-sandbox.mjs）")
})
