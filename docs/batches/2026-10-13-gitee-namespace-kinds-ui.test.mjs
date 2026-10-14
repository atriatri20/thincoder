/**
 * 2026-10-13-gitee-namespace-kinds-ui.test.mjs — thincoder-server 批内单测件（`gitee-namespace-kinds` 批 ·
 * **E 件 = 控制台**：U1（三态选择器/范围门/跨态切换）∥ U2（编辑态回填/不符报错显示面）+ 键族 +8/表对位。
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-13-gitee-namespace-kinds-ui.test.mjs`
 *
 * 射程（判据源 = 批档 §2.2⑦ + `docs/server/design/webui/PROJECTS.md` §2.4/§4 AC-44 ⑬）：
 *   U1 = 类型选单（仅 gitee 显 ∥ options 三值+占位 ∥ 创建无默认）∥ 范围门（个人 ⇒ 隐+附注 ∥ 组织/企业 ⇒ 显且必填 ∥ 标签「组织名 / 企业名」+ 企业占位专键）
 *   ∥ 必选门两腿 ∥ 跨态切换两形（切个人 ⇒ 范围清空并提交 ∥ 切非 gitee ⇒ `scopeKind` 不携）。
 *   U2 = 编辑态逐值回填（企业/个人/github 三态）∥ 提交体携 `scopeKind` ∥ 同步结果列 `result.message` 优先于分类词。
 * 桩说明：`dom.mjs` 顶层触 `document`——先桩后 import；本档零外部网络/零真库（stub ctx 路由表）。
 */
import test from "node:test"
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

const [{ ZH }, { EN }] = await Promise.all([load("i18n-zh.mjs"), load("i18n-en.mjs")])
const [zhPart, enPart] = await Promise.all([load("i18n-zh-project.mjs"), load("i18n-en-project.mjs")])
const GIT_SOURCES_VIEW = await load("views-git-sources.mjs")

/** CJK 机检类（Han ∥ CJK 标点 ∥ 全角形——「—」「…」等中性标点不在内）。 */
const CJK = /[\u3000-\u303f\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff\uff00-\uffef]/

// ── 桩 DOM 夹具（`modal.mjs` 壳面近形；`h` 同 app 语义近似——沿 `2026-10-12-team-projects-permissions-ui.test.mjs` 同法） ──

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
const textOf = (node) => (typeof node === "string" ? node : [node?.textContent ?? "", ...(node?.children ?? []).map(textOf)].filter(Boolean).join(" "))
const tick = () => new Promise((resolve) => setTimeout(resolve, 0))
const settle = async () => { await tick(); await tick(); await tick() }

/** 桩 ctx（api 路由表 `"METHOD path"` ⇒ handler；全调用入 `calls`）。 */
function fCtx(routes = {}) {
  const calls = []
  const ctx = {
    h: fH,
    state: { member: { username: "alice", role: "admin" }, system: null },
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
    showSecret: (box, label, value) => { box.hidden = false; box.replaceChildren(fH("code", { class: "secret-value", text: value })) },
  }
  return { ctx, calls }
}

const modalOf = () => fFind(globalThis.document.body, (node) => node.tag === "dialog")
/** 源行 fixture（含 `scopeKind`——KD-SV-151 端形）。 */
const fSource = (over = {}) => ({
  id: 1, name: "src-a", platform: "github", baseURL: null, scope: "org-a", scopeKind: null,
  token: { set: true, hint: "…abcd" }, hookSecret: { set: false, hint: null },
  enabled: 1, syncMode: "poll", intervalMinutes: 60, lastSyncAt: null, lastSyncResult: {}, tokenState: "unknown", tokenCheckedAt: null, createdAt: "2026-10-12T00:00:00Z", ...over,
})

/** 弹窗内定位（按 option 值/标签文——选单位次随批变动，零按索引）。 */
const selectWith = (root, value) => fFindAll(root, (node) => node.tag === "select").find((select) => fFindAll(select, (node) => node.tag === "option").some((option) => option.value === value))
const labelWith = (root, text) => fFindAll(root, (node) => node.tag === "label").find((label) => textOf(label).includes(text))
const scopeInputOf = (editor) => fFind(editor, (node) => node.tag === "input" && [ZH["admin.gitSources.scopePh"], ZH["admin.gitSources.scopePhEnterprise"]].includes(node.attrs.placeholder))
const formOf = (editor) => fFind(editor, (node) => node.tag === "form")
/** 浏览器语义补（fake DOM）：`<select>` 无选中态 ⇒ value = 首项值（真浏览器首项即选中——创建态缺省平台 gitee ∥ 方式 poll）。 */
const selectFirst = async (select) => {
  const first = fFindAll(select, (node) => node.tag === "option")[0]
  select.value = first?.value ?? ""
  await select.fire("change")
  return select.value
}

async function openCreateModal(mount) {
  await byText(mount, ZH["admin.gitSources.addBtn"]).fire("click")
  await settle()
  return modalOf()
}

// ── ① 键族 +8/表（AC-44 ⑬——两表对位 ∥ en 零 CJK ∥ 键值逐字）─────────────────────

test("① 键族：project 两部件键集逐键对位（含插入位）∥ +8 新键在盘 ∥ en 零 CJK ∥ 键值逐字", () => {
  assert.deepEqual(Object.keys(enPart.EN_PROJECT), Object.keys(zhPart.ZH_PROJECT), "两表键集逐键对位（顺序同拍——零 `.one` 变体）")
  const NEW_KEYS = [
    "admin.gitSources.scopeKind", "admin.gitSources.scopeKind.personal", "admin.gitSources.scopeKind.org", "admin.gitSources.scopeKind.enterprise",
    "admin.gitSources.scopeKindPh", "admin.gitSources.scopeGitee", "admin.gitSources.scopePhEnterprise", "admin.gitSources.kindNotePersonal",
  ]
  for (const key of NEW_KEYS) {
    assert.ok(key in ZH && key in EN, `新键两表在盘：${key}`)
    assert.equal(CJK.test(EN[key]), false, `en 值含 CJK：${key}`)
  }
  assert.deepEqual(
    [ZH["admin.gitSources.scopeKind"], ZH["admin.gitSources.scopeKind.personal"], ZH["admin.gitSources.scopeKind.org"], ZH["admin.gitSources.scopeKind.enterprise"],
      ZH["admin.gitSources.scopeKindPh"], ZH["admin.gitSources.scopeGitee"], ZH["admin.gitSources.scopePhEnterprise"], ZH["admin.gitSources.kindNotePersonal"]],
    ["范围类型", "个人", "组织", "企业", "请选择", "组织名 / 企业名", "企业名——填后才能同步成员", "个人范围无成员表——成员同步仅组织/企业可用"],
    "zh 八键逐字",
  )
})

// ── ② U1（选择器/范围门/跨态切换）──────────────────────────────────────────────

test("U1 建源弹窗三态：仅 gitee 显 ∥ 创建无默认 + 必选门 ∥ 范围门（个人隐+附注 ∥ 组织/企业显且必填）∥ 跨态切换两形", async () => {
  try {
    globalThis.document = stubDocument()
    const { ctx, calls } = fCtx({
      "GET /api/admin/git-sources": () => ({ sources: [] }),
      "POST /api/admin/git-sources": () => ({ ok: true }),
    })
    const mount = makeNode("section")
    await GIT_SOURCES_VIEW.renderGitSources(ctx, mount)
    await settle()
    const editor = await openCreateModal(mount)

    const kindSelect = selectWith(editor, "personal")
    const platformSelect = selectWith(editor, "selfhosted")
    const modeSelect = selectWith(editor, "poll")
    const kindField = labelWith(editor, ZH["admin.gitSources.scopeKind"])
    const scopeInput = scopeInputOf(editor)
    const scopeField = scopeInput.parent
    const kindNote = fFind(editor, (node) => node.tag === "p" && node.textContent === ZH["admin.gitSources.kindNotePersonal"])
    const submit = fFindAll(editor, (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.gitSources.addBtn"])
    const form = formOf(editor)

    // 浏览器语义补（fake DOM）：创建态缺省平台 = gitee（首项）∥ 方式 = poll（首项）
    await selectFirst(platformSelect)
    await selectFirst(modeSelect)
    assert.equal(platformSelect.value, "gitee", "创建态缺省平台 = 首项 gitee")
    const nameInput = fFind(editor, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.gitSources.namePh"])
    const patInput = fFind(editor, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.gitSources.patPh"])
    nameInput.value = "组织源"
    patInput.value = "pat-1"

    assert.deepEqual(fFindAll(kindSelect, (node) => node.tag === "option").map((option) => [option.value, option.textContent]),
      [["", ZH["admin.gitSources.scopeKindPh"]], ["personal", ZH["admin.gitSources.scopeKind.personal"]], ["org", ZH["admin.gitSources.scopeKind.org"]], ["enterprise", ZH["admin.gitSources.scopeKind.enterprise"]]],
      "类型选单三值 + 占位（逐值）")
    assert.equal(kindSelect.value, "", "创建态无默认（占位「请选择」选中）")
    assert.equal(kindField.hidden, false, "缺省平台 gitee ⇒ 类型选单显")
    assert.equal(scopeField.hidden, true, "未选类型 ⇒ 范围输入隐")
    assert.equal(kindNote.hidden, true, "非个人 ⇒ 附注隐")

    // 必选门①：类型未选 ⇒ 零 POST + 人话
    await form.fire("submit")
    await settle()
    assert.equal(calls.filter(([method]) => method === "POST").length, 0, "缺类型 ⇒ 零提交")
    assert.ok(textOf(editor).includes(ZH["admin.gitSources.required"].replace("{field}", ZH["admin.gitSources.scopeKind"])), "必选门人话：范围类型")

    // 组织/企业 ⇒ 范围显 + 必填 + 标签与占位专键
    kindSelect.value = "org"
    await kindSelect.fire("change")
    assert.equal(scopeField.hidden, false, "组织 ⇒ 范围显")
    assert.equal(scopeField.children[0].textContent, ZH["admin.gitSources.scopeGitee"], "label「组织名 / 企业名」")
    await form.fire("submit")
    await settle()
    assert.equal(calls.filter(([method]) => method === "POST").length, 0, "组织缺范围 ⇒ 零提交")
    assert.ok(textOf(editor).includes(ZH["admin.gitSources.required"].replace("{field}", ZH["admin.gitSources.scopeGitee"])), "必填门人话：组织名 / 企业名")
    kindSelect.value = "enterprise"
    await kindSelect.fire("change")
    assert.equal(scopeInput.placeholder, ZH["admin.gitSources.scopePhEnterprise"], "企业 ⇒ 占位专键")
    assert.equal(scopeField.hidden, false, "企业 ⇒ 范围显")

    // 跨态切换①：组织/企业 ⇒ 个人 ⇒ 范围输入清空（提交 = 清除形）
    scopeInput.value = "acme"
    kindSelect.value = "personal"
    await kindSelect.fire("change")
    assert.equal(scopeInput.value, "", "切「个人」⇒ 范围输入清空")
    assert.equal(scopeField.hidden, true, "个人 ⇒ 范围隐")
    assert.equal(kindNote.hidden, false, "个人 ⇒ 附注行显（无成员表）")

    // 跨态切换②：切非 gitee ⇒ 类型选单隐 + 范围输入共用回显 + 提交不携 scopeKind
    platformSelect.value = "github"
    await platformSelect.fire("change")
    assert.equal(kindField.hidden, true, "非 gitee ⇒ 类型选单隐")
    assert.equal(scopeField.hidden, false, "非 gitee ⇒ 范围输入（组织/组）显")
    assert.equal(scopeField.children[0].textContent, ZH["admin.gitSources.scope"], "非 gitee ⇒ 标签回「组织 / 组」")
    assert.equal(scopeInput.placeholder, ZH["admin.gitSources.scopePh"], "非 gitee ⇒ 占位回组织/组")
    assert.equal(kindNote.hidden, true, "附注随类型隐")

    // 提交体：正例两形（gitee 三值携带 ∥ 非 gitee 不携）
    platformSelect.value = "gitee"
    await platformSelect.fire("change")
    kindSelect.value = "org"
    await kindSelect.fire("change")
    scopeInput.value = "acme"
    await form.fire("submit")
    await settle()
    assert.deepEqual(calls.filter(([method, path]) => method === "POST" && path === "/api/admin/git-sources").at(-1),
      ["POST", "/api/admin/git-sources", { name: "组织源", platform: "gitee", baseURL: null, scope: "acme", enabled: 1, syncMode: "poll", intervalMinutes: 60, scopeKind: "org", token: "pat-1" }],
      "gitee 组织提交体逐值")

    const editor2 = await openCreateModal(mount)
    const platform2 = selectWith(editor2, "selfhosted")
    const kind2 = selectWith(editor2, "personal")
    const scope2 = scopeInputOf(editor2)
    const form2 = formOf(editor2)
    await selectFirst(platform2)
    await selectFirst(selectWith(editor2, "poll"))
    fFind(editor2, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.gitSources.namePh"]).value = "个人源"
    fFind(editor2, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.gitSources.patPh"]).value = "pat-2"
    kind2.value = "personal"
    await kind2.fire("change")
    scope2.value = "should-be-cleared"
    await kind2.fire("change")
    await form2.fire("submit")
    await settle()
    const personalBody = calls.filter(([method, path]) => method === "POST" && path === "/api/admin/git-sources").at(-1)[2]
    assert.deepEqual([personalBody.scopeKind, personalBody.scope], ["personal", null], "个人提交体：类型在场 ∥ 范围 = 清除形（null）")

    const editor3 = await openCreateModal(mount)
    const platform3 = selectWith(editor3, "selfhosted")
    const kind3 = selectWith(editor3, "personal")
    const scope3 = scopeInputOf(editor3)
    const form3 = formOf(editor3)
    await selectFirst(platform3)
    await selectFirst(selectWith(editor3, "poll"))
    fFind(editor3, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.gitSources.namePh"]).value = "github 源"
    fFind(editor3, (node) => node.tag === "input" && node.attrs.placeholder === ZH["admin.gitSources.patPh"]).value = "pat-3"
    kind3.value = "org" // 残留选值（切非 gitee 后隐藏）
    await kind3.fire("change")
    scope3.value = "acme"
    platform3.value = "github"
    await platform3.fire("change")
    await form3.fire("submit")
    await settle()
    const githubBody = calls.filter(([method, path]) => method === "POST" && path === "/api/admin/git-sources").at(-1)[2]
    assert.deepEqual([githubBody.platform, "scopeKind" in githubBody, githubBody.scope], ["github", false, "acme"], "切非 gitee ⇒ `scopeKind` 不携（清空形——不撞「仅 gitee 适用」400）")
  } finally { delete globalThis.document }
})

// ── ③ U2（编辑态回填/不符报错显示面）────────────────────────────────────────────

test("U2 编辑态回填：企业/个人/github 三态逐值 ∥ 提交体携 `scopeKind` ∥ 结果列 `result.message` 优先于分类词", async () => {
  try {
    globalThis.document = stubDocument()
    const mismatch = "「shanghai-xinbo」在企业端点不存在——请核对范围类型/编辑源改选"
    const { ctx, calls } = fCtx({
      "GET /api/admin/git-sources": () => ({ sources: [
        fSource({ id: 1, name: "企业源", platform: "gitee", scope: "shanghai-xinbo", scopeKind: "enterprise" }),
        fSource({ id: 2, name: "个人源", platform: "gitee", scope: null, scopeKind: "personal" }),
        fSource({ id: 3, name: "github 源", platform: "github", scope: "acme", scopeKind: null }),
        fSource({ id: 4, name: "不符源", platform: "gitee", scope: "ent-x", scopeKind: "enterprise", lastSyncAt: "2026-10-13T10:00:00Z", lastSyncResult: { ok: false, kind: "http_error", message: mismatch, counts: {} } }),
        fSource({ id: 5, name: "无原文源", lastSyncAt: "2026-10-13T10:00:00Z", lastSyncResult: { ok: false, kind: "auth", counts: {} } }),
      ] }),
      "PATCH /api/admin/git-sources/1": () => ({ ok: true }),
    })
    const mount = makeNode("section")
    await GIT_SOURCES_VIEW.renderGitSources(ctx, mount)
    await settle()

    // 不符报错显示面：`result.message` 优先于分类词（服务端原文可达）
    assert.ok(textOf(mount).includes(mismatch), "失败面服务端原文就地呈")
    assert.ok(textOf(mount).includes(ZH["admin.gitSources.resultFail"]) && textOf(mount).includes(ZH["admin.gitSources.errKind.auth"]), "无原文 ⇒ 分类人话兜底")

    const rows = fFindAll(mount, (node) => node.tag === "tr").slice(1) // 首个为表头行
    const editOf = (index) => fFindAll(rows[index], (node) => node.tag === "button").find((button) => button.textContent === ZH["admin.gitSources.edit"])

    // 企业源 ⇒ 逐值回填（类型/范围/label/占位）+ 提交体携 `scopeKind`
    await editOf(0).fire("click")
    await settle()
    const editor = modalOf()
    const kindSelect = selectWith(editor, "personal")
    const kindField = labelWith(editor, ZH["admin.gitSources.scopeKind"])
    const scopeInput = scopeInputOf(editor)
    assert.deepEqual([kindField.hidden, kindSelect.value], [false, "enterprise"], "企业源：类型显 + 逐值回填")
    assert.deepEqual([scopeInput.parent.hidden, scopeInput.value, scopeInput.parent.children[0].textContent, scopeInput.placeholder],
      [false, "shanghai-xinbo", ZH["admin.gitSources.scopeGitee"], ZH["admin.gitSources.scopePhEnterprise"]], "企业源：范围回填 + 登记口径（label/占位）")
    scopeInput.value = "ent-y"
    await formOf(editor).fire("submit")
    await settle()
    const patch = calls.filter(([method, path]) => method === "PATCH" && path === "/api/admin/git-sources/1").at(-1)[2]
    assert.deepEqual([patch.scopeKind, patch.scope, patch.platform], ["enterprise", "ent-y", "gitee"], "编辑提交体携类型 + 新范围")

    // 个人源 ⇒ 范围隐 + 附注显（无成员表）
    await editOf(1).fire("click")
    await settle()
    const editor2 = modalOf()
    const kind2 = selectWith(editor2, "personal")
    assert.deepEqual([kind2.value, labelWith(editor2, ZH["admin.gitSources.scopeKind"]).hidden], ["personal", false], "个人源：类型显 + 回填")
    assert.deepEqual([scopeInputOf(editor2).parent.hidden, scopeInputOf(editor2).value], [true, ""], "个人源：范围隐 + 空值")
    assert.equal(fFind(editor2, (node) => node.tag === "p" && node.textContent === ZH["admin.gitSources.kindNotePersonal"]).hidden, false, "个人源：附注行显")

    // github 源 ⇒ 类型选单隐（非 gitee）+ 范围共用显（照旧可选）
    await editOf(2).fire("click")
    await settle()
    const editor3 = modalOf()
    assert.deepEqual([labelWith(editor3, ZH["admin.gitSources.scopeKind"]).hidden, selectWith(editor3, "personal").value], [true, ""], "github 源：类型选单隐 + 值空")
    assert.deepEqual([scopeInputOf(editor3).parent.hidden, scopeInputOf(editor3).value], [false, "acme"], "github 源：范围显 + 回填（非 gitee 零改）")
    assert.equal(scopeInputOf(editor3).parent.children[0].textContent, ZH["admin.gitSources.scope"], "非 gitee ⇒ 标签「组织 / 组」")
  } finally { delete globalThis.document }
})
