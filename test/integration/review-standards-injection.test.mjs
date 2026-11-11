/**
 * review-standards-injection.test.mjs —— 集成用例 24-1 / 24-2 / 24-3 / 24-4 / 24-5 / 24-6 / 24-7（RTM CLI 端故事 24「评审的
 * 方法论符合度不再恒空」；判据 ∥ 文案单源 = `docs/core/design/MANIFEST.md` §2.12「标准层声明口」）。
 *
 * 业务进入点 = 工程模式会话里对一本批档发起一次设计评审（真 `advisor` 工具的同步设计评审轨，`batchDoc` 绑定）；
 * 用户看到的是评审上下文里那一段——断言面 = 发给模型的评审消息（`## Project Standards` 段），不是内部函数返回值。
 * 组件间交互 = 项目数据档 `docRoot.standards`（**目录层**）→ `readManifest` → 层读取 → `injectProjectStandards`
 * → 评审消息组装面。
 * 模型侧 = `node:http` 本机假 OpenAI SSE 端点（回一段固定文本）+ 请求体留档；零外网、零付费端点。
 * 夹具 = 系统临时域（项目根 + 数据档 + 设计档 + 六段批档 + 临时台账库目录；零落真实用户目录）。
 *
 * **拒因优先级事实（2026-11-02 账链门落地）**：类型门 → 准入门（设计评审必携 `batchDoc`）→ 账链门（批档须挂
 * 未决台账行）→ 文档范围 → 点火。本档六例都携 `batchDoc` ⇒ 过前两门后落在账链门，而原来的夹具没有台账
 * ⇒ 会被 `batchdoc-no-ledger` 拒、一次模型请求也发不出。处置 = 夹具种一行 `在途` 账并让台账库落临时目录；
 * **`24-1` 逐字断言态 3 的用途句（现句无排序短语）**；`24-2` / `24-3` / `24-4` / `24-5` 的既有断言句不变；
 * `24-6`（层内成员递归：标准档住进子目录仍被读到）为新增。
 *
 * 复跑：`node --test test/integration/review-standards-injection.test.mjs`
 */
import { after, test } from "node:test"
import assert from "node:assert/strict"
import { createServer } from "node:http"
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, relative, resolve } from "node:path"
// 收尾尽力面单源（`docs/core/design/TESTING.md` §4.6）：清理失败不判红整档，但要可见。
import { removeTempDirBestEffort } from "../teardown.mjs"

import { advisorTool } from "../../thincoder-core/agent-tools/advisor.mjs"
import { buildAdvisorUserMessage } from "../../thincoder-core/advisor/messages.mjs"
import { injectProjectStandards, NO_STANDARDS_NOTICE, NO_DOC_MAP_NOTICE } from "../../thincoder-core/advisor/project-context.mjs"
import { providerSpec } from "../../thincoder-core/model-specs.mjs"
// 台账模块静态链入 `node:sqlite`（W8 契约）——消费侧一律动态取（先例 `test/integration/batch-close-token-consume.test.mjs`）。
const { _resetLedgerDirForTest, _setLedgerDirForTest, ledgerAdd, ledgerUpdate } = await import("../../thincoder-core/ledger.mjs")

const DESIGN_REL = "docs/core/design/DESIGN-FIXTURE.md"
const BATCH_REL = "docs/batches/fixture.md"
const STANDARDS_DIR = "docs/core/standards" // 标准层（目录层——§2.12）
const STANDARDS_FILE = `${STANDARDS_DIR}/METHODOLOGY.md`
const STANDARDS_BODY = "# 家规\n\n规则甲：写代码之前先读文档。\n"

/** 六段批档（评审的 `batchDoc` 绑定面；内容不参与本档断言）。 */
const RECORD = [
  "# 夹具批 · 标准档声明口",
  "",
  "> 编制：夹具 · 2026-11-01 · 来源 = 集成夹具。",
  "",
  "## §1 讨论（主 agent）",
  "**状态行**：🔄 进行中",
  "",
  "夹具讨论。",
  "",
  "## §2 批次任务与设计（eng-designer）",
  "**状态行**：设计完成",
  "",
  "夹具任务。",
  "",
  "## §3 设计评审（评审子代理）",
  "## §4 用户批准（主 agent）",
  "夹具批准。",
  "",
  "## §5 实施记录（eng-coder）",
  "夹具实施。",
  "",
  "## §6 验证与收口（父代理）",
  "夹具收口。",
  "",
].join("\n")

/** 假 OpenAI SSE 端点：一个完整文本回合，请求体留档（先例 `test/integration/review-doc-scope.test.mjs:28-52`）。 */
function fakeProvider(text = "No findings — clean pass.") {
  const requests = []
  const server = createServer((req, res) => {
    let raw = ""
    req.on("data", (chunk) => { raw += chunk })
    req.on("end", () => {
      requests.push({ url: req.url, body: raw })
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" })
      res.flushHeaders?.()
      res.write(`data: ${JSON.stringify({ id: "chatcmpl-fake", object: "chat.completion.chunk", choices: [{ index: 0, delta: { content: text }, finish_reason: null }] })}\n\n`)
      res.write(`data: ${JSON.stringify({ id: "chatcmpl-fake", object: "chat.completion.chunk", choices: [{ index: 0, delta: {}, finish_reason: "stop" }] })}\n\n`)
      res.write("data: [DONE]\n\n")
      res.end()
    })
  })
  const ready = new Promise((done) => server.listen(0, "127.0.0.1", () => done(server.address().port)))
  return ready.then((port) => ({
    port,
    requests,
    close: () => new Promise((done) => {
      server.closeAllConnections?.()
      server.close(() => done())
    }),
  }))
}

const roots = []
// 台账缝：账链门要读台账——夹具的账种在临时目录，不碰真实用户目录。
const ledgerDir = mkdtempSync(join(tmpdir(), "rsi-ledger-"))
_setLedgerDirForTest(ledgerDir)
after(() => {
  _resetLedgerDirForTest()
  for (const p of roots) removeTempDirBestEffort(p)
  removeTempDirBestEffort(ledgerDir)
})

/** 种一行指着夹具批档的未决台账行（**只走写面，不直写 SQL**——`在途` 必挂 `task_book` 的 CHECK 是被测前提的一半）：
 *  `ledgerAdd` 落 `待讨论`（它自己开库）→ `ledgerUpdate` 迁 `在途` + 写仓根相对指针。 */
function seedPendingRow(root) {
  const rel = relative(root, join(root, BATCH_REL)).replace(/\\/g, "/")
  const id = ledgerAdd({ cwd: root, row: { kind: "tech_todo", title: "夹具批 · 标准档声明口" }, boundary: root })
  ledgerUpdate({ cwd: root, id, patch: { status: "在途", task_book: rel }, boundary: root })
}

/** 在给定目录里铺一个项目（数据档由调用方写）：设计档 + 批档 + 标准层目录。 */
function projectFiles(root) {
  mkdirSync(dirname(join(root, DESIGN_REL)), { recursive: true })
  mkdirSync(dirname(join(root, BATCH_REL)), { recursive: true })
  mkdirSync(join(root, STANDARDS_DIR), { recursive: true })
  writeFileSync(join(root, DESIGN_REL), "# 设计夹具\n\n夹具正文。\n")
  writeFileSync(join(root, BATCH_REL), RECORD)
}

/** 夹具项目根：数据档 + 设计档 + 批档 + 标准层目录（层内放什么由各格自己决定）。 */
function fixture(tag) {
  const root = mkdtempSync(join(tmpdir(), `rsi-${tag}-`))
  roots.push(root)
  projectFiles(root)
  return root
}

/** 往标准层放一份档（层内成员 = 该目录**及其全部子目录**的 `.md`——递归，不限深度；目录按需建）。 */
function writeStandard(root, rel, body) {
  mkdirSync(dirname(join(root, rel)), { recursive: true })
  writeFileSync(join(root, rel), body)
}

/** 数据档：`standards` 传 `undefined` ⇒ **该键缺**（未声明格）；传值 ⇒ 声明该值。 */
function writeManifest(root, standards) {
  const docRoot = {
    requirements: "docs/core/requirements",
    specs: "docs/core/specs",
    design: "docs/core/design",
    modules: "docs/core/modules",
    batches: "docs/batches",
  }
  if (standards !== undefined) docRoot.standards = standards
  writeFileSync(
    join(root, "PROJECT-MANIFEST.json"),
    JSON.stringify({ version: 1, phase: "initial-dev", docRoot, codePaths: ["src"], index: { codeExtensions: [], docExtensions: [], excludePaths: [], publicRepos: [] } }, null, 2),
  )
}

let seq = 0
/** 一次设计评审（工程模式 + `batchDoc` 绑定）：返回评审消息全文（模型收到的请求体）与工具回执。 */
async function designReview(t, root) {
  seedPendingRow(root) // 账链门前提：本档挂着一行未决账（数据档写完才种——根解析要项目声明档）
  const endpoint = await fakeProvider()
  t.after(() => endpoint.close())
  const entry = { name: "fake", baseURL: `http://127.0.0.1:${endpoint.port}`, apiKey: "test-key" }
  const agent = {
    cwd: root,
    provider: { ...entry, model: "gpt-4o" },
    config: {
      defaultModel: "fake:gpt-4o",
      providers: [entry],
      providersList: [entry],
      agent: { engineering: true, advisor: { provider: "fake", guard: false } },
      advisor: { provider: "fake", guard: false },
      traces: { enabled: false },
    },
  }
  const receipt = String(await advisorTool.execute(
    { type: "design", async: false, documents: [DESIGN_REL], batchDoc: BATCH_REL },
    { agent, _toolCallId: `rsi-${++seq}` },
  ))
  assert.equal(endpoint.requests.length, 1, "一次评审 = 一次模型请求（评审真的跑到了消息组装面）")
  return { agent, receipt, body: endpoint.requests[0].body }
}

/** 从评审消息里切出 `## Project Standards` 段（段尾 = 装配序中恒定的下一个段头）。
 *  不能用「下一个 `## `」兜底切：层内标准档自带二级标题（真实标准档常见）会被误当成段尾，
 *  断言随正文内容而红/绿（`advisor/messages.mjs` 的装配序：Standards → Document Map → Instructions）。
 *  **段头按「行首 + 段名」认**（请求体里是转义换行 `\\n`）：系统提示词（`advisor-design.md` 的
 *  Review Criteria）也按名点这一段，只搜裸段名会先命中那句引用、把切段起点挪进系统提示词。 */
function standardsSection(body) {
  const head = "\\n## Project Standards"
  const start = body.indexOf(head)
  assert.ok(start >= 0, "评审消息含 Project Standards 段")
  const rest = body.slice(start + head.length)
  const ends = ["\\n## Document Map", "\\n## Instructions"]
    .map((m) => rest.indexOf(m))
    .filter((i) => i >= 0)
  const end = ends.length ? Math.min(...ends) : -1
  return (end < 0 ? rest : rest.slice(0, end)).replaceAll("\\n", "\n").trim()
}

test("CLI 24-1 声明了标准层 ⇒ 评审上下文拿到层内该档的正文与定位注", { timeout: 120_000 }, async (t) => {
  const root = fixture("241")
  writeStandard(root, STANDARDS_FILE, STANDARDS_BODY)
  writeManifest(root, STANDARDS_DIR)
  const { body } = await designReview(t, root)
  const section = standardsSection(body)
  const cap = Math.max(8192, Math.floor(providerSpec({ model: "gpt-4o" }).context * 0.05))
  const absFile = resolve(root, STANDARDS_FILE).replace(/\\/g, "/")

  assert.ok(STANDARDS_BODY.length < cap, `夹具前置：正文 ${STANDARDS_BODY.length} < 预算帽 ${cap}（句子不被截断污染）`)
  assert.ok(section.includes("The documents below are the project's standards — the `.md` files of the declared standards layer. Judge methodology compliance against them."), `用途句在场：${section}`)
  assert.ok(section.includes(`<!-- standards file: ${absFile} -->`), `该档绝对路径定位注在场：${section}`)
  assert.ok(section.includes("规则甲：写代码之前先读文档。"), `该档正文首行在场：${section}`)
  assert.ok(!section.includes(NO_STANDARDS_NOTICE), "态 3 不带降级句（拿到了正文就不是降级）")

  // 行 24-1 的第二半「返该档绝对路径」：注入面的回执（同一夹具、同一数据档；第三参无缺省 —— 空范围传 `[]`）。
  const parts = []
  const ret = injectProjectStandards({ cwd: root, provider: { model: "gpt-4o" } }, parts, [])
  assert.equal(ret, resolve(root, STANDARDS_FILE), "返该档绝对路径")
})

test("CLI 24-2 声明指向不存在的目录 ⇒ 态 2 句点名路径与原因，且与 24-3 的句子不等", { timeout: 120_000 }, async (t) => {
  const root = fixture("242")
  writeStandard(root, STANDARDS_FILE, STANDARDS_BODY) // 层在盘，但声明的是另一个（不存在的）目录
  writeManifest(root, "docs/nope")
  const { body } = await designReview(t, root)
  const section = standardsSection(body)

  assert.ok(section.includes("declared at"), `态 2 句点明「声明了」：${section}`)
  assert.ok(section.includes("docs/nope"), `含声明路径字面：${section}`)
  assert.ok(section.includes("no such directory"), "原因 = 目录不存在")
  assert.ok(!section.includes("规则甲"), `零正文注入（在盘那份档不因声明错而顶替）：${section}`)
  assert.ok(!section.includes(NO_STANDARDS_NOTICE), "与「未声明」句不同形（防作者回头补一个已有的声明）")
  assert.notEqual(section, NO_STANDARDS_NOTICE, "且与 24-3 的句子不等")
})

test("CLI 24-3 删掉该键 ⇒ 态 1 句；零正文、零路径字面、零 declared", { timeout: 120_000 }, async (t) => {
  const root = fixture("243")
  writeStandard(root, STANDARDS_FILE, STANDARDS_BODY) // 标准层在盘，但 manifest 未声明（负向锁：不探测）
  writeManifest(root, undefined) // 键缺 = 未声明
  const { body } = await designReview(t, root)
  const section = standardsSection(body)

  assert.equal(section, NO_STANDARDS_NOTICE, `注入面出现 NO_STANDARDS_NOTICE：${section}`)
  assert.ok(!section.includes("规则甲"), "零正文")
  assert.ok(!section.includes("docs/"), "零路径字面")
  assert.ok(!/declared/i.test(section), "零 declared")
})

test("CLI 24-4 层内两份档 ⇒ 两份正文都在，注入序 = 层根相对路径码点序（同目录即名序，a.md 在前）", { timeout: 120_000 }, async (t) => {
  const root = fixture("244")
  writeStandard(root, `${STANDARDS_DIR}/b.md`, "# 乙档\n\n## 附则\n\n条款乙：先写设计再写码。\n") // 档内自带二级标题：段尾不得被它骗走
  writeStandard(root, `${STANDARDS_DIR}/a.md`, "# 甲档\n\n条款甲：先读需求再动手。\n")
  writeManifest(root, STANDARDS_DIR)
  const { body } = await designReview(t, root)
  const section = standardsSection(body)

  assert.ok(section.includes("条款甲：先读需求再动手。"), `a.md 正文在场：${section}`)
  assert.ok(section.includes("条款乙：先写设计再写码。"), `b.md 正文在场：${section}`)
  assert.ok(section.indexOf("条款甲") < section.indexOf("条款乙"), `注入序 = 层根相对路径码点序（同目录即名序，a 在 b 前）：${section}`)
  assert.ok(section.includes("<!-- standards file: ") && section.split("<!-- standards file: ").length === 3, "两份档各有定位注")
  assert.ok(!section.includes(NO_STANDARDS_NOTICE), "态 3 不带降级句")
})

test("CLI 24-5 声明值是个文件（旧值形）⇒ 态 2 句含 not a directory；零正文；评审照常收尾", { timeout: 120_000 }, async (t) => {
  const root = fixture("245")
  writeStandard(root, STANDARDS_FILE, STANDARDS_BODY)
  writeManifest(root, STANDARDS_FILE) // 旧值形：键值直接写一份档的路径
  const { receipt, body } = await designReview(t, root) // 走到这里 = 评审没抛（照常收尾）
  const section = standardsSection(body)

  assert.ok(section.includes("declared at"), `态 2 句点明「声明了」：${section}`)
  assert.ok(section.includes("not a directory"), `原因 = 不是目录：${section}`)
  assert.ok(section.includes("METHODOLOGY.md"), `含声明路径字面：${section}`)
  assert.ok(!section.includes("规则甲"), `零正文注入：${section}`)
  assert.ok(!section.includes("undefined"), `句内零 undefined：${section}`)
  assert.ok(receipt.length > 0, "评审工具回执非空（组装完成）")
})

test("CLI 24-6 标准档住进子目录 ⇒ 评审上下文照样拿到（层内成员递归），注入序 = 层根相对路径码点序", { timeout: 120_000 }, async (t) => {
  const root = fixture("246")
  writeStandard(root, `${STANDARDS_DIR}/zhi.md`, "# 层根档\n\n条款根：先读需求再动手。\n")
  writeStandard(root, `${STANDARDS_DIR}/sub/nei.md`, "# 子目录档\n\n条款内：先写设计再写码。\n")
  writeManifest(root, STANDARDS_DIR)
  const { body } = await designReview(t, root)
  const section = standardsSection(body)
  const absRoot = resolve(root, `${STANDARDS_DIR}/zhi.md`).replace(/\\/g, "/")
  const absSub = resolve(root, `${STANDARDS_DIR}/sub/nei.md`).replace(/\\/g, "/")

  assert.ok(section.includes("条款内：先写设计再写码。"), `子目录里的档正文在场（递归）：${section}`)
  assert.ok(section.includes(`<!-- standards file: ${absSub} -->`), `该档绝对路径定位注在场：${section}`)
  assert.ok(section.includes(`<!-- standards file: ${absRoot} -->`), `层根档的定位注也在场：${section}`)
  assert.ok(section.indexOf("条款内") < section.indexOf("条款根"), `注入序 = 层根相对路径码点序（sub/nei.md 在 zhi.md 前）：${section}`)
  assert.ok(!section.includes(NO_STANDARDS_NOTICE), "态 3 不带降级句")
})

/** 从消息里切出某一段（段尾 = 装配序里紧随其后的段头之一）；**真换行**——本用例吃的是
 *  `buildAdvisorUserMessage` 的直接产物，不是 JSON 请求体（24-1…24-6 吃请求体，故各自转义）。 */
function sliceSection(text, head, nextHeads) {
  const start = text.indexOf(head)
  assert.ok(start >= 0, `评审消息含「${head}」段`)
  const rest = text.slice(start + head.length)
  const ends = nextHeads.map((h) => rest.indexOf(h)).filter((i) => i >= 0)
  return (ends.length ? rest.slice(0, Math.min(...ends)) : rest).trim()
}

test("CLI 24-7 会话锚 = 工作区根（无数据档）⇒ 标准层与文档地图都按被评审项目的项目根注入", { timeout: 120_000 }, async () => {
  // 夹具 = 锚（有 AGENTS.md、无 PROJECT-MANIFEST.json）+ 其下一个子项目（数据档声明 docRoot.standards，
  // 子项目内有 docs/README.md）；设计档与批档都在子项目内。用户的实际用法正是这一种。
  const anchor = mkdtempSync(join(tmpdir(), "rsi-247-"))
  roots.push(anchor)
  writeFileSync(join(anchor, "AGENTS.md"), "# 工作区指南\n\n工作区级说明。\n")
  const project = join(anchor, "proj")
  mkdirSync(project, { recursive: true })
  projectFiles(project)
  writeStandard(project, STANDARDS_FILE, STANDARDS_BODY)
  writeManifest(project, STANDARDS_DIR)
  const MAP_BODY = "# 文档地图\n\n地图正文：各节归属见下。\n"
  writeFileSync(join(project, "docs", "README.md"), MAP_BODY)

  // 从消息组装面进（不是 advisor 工具入口）：被测交互 = 数据档 → 层读取 → 注入 → 评审消息；
  // 工具入口的类型 / 准入（batchDoc）/ 账链三道门不是被测面（工作区锚下 `documents` 还会先被范围门拒）。
  const agent = { cwd: anchor, provider: { model: "gpt-4o" }, config: { agent: { engineering: true } }, history: [] }
  const body = buildAdvisorUserMessage(agent, null, "design", null, [relative(anchor, join(project, DESIGN_REL)).replace(/\\/g, "/")])
  const absStd = resolve(project, STANDARDS_FILE).replace(/\\/g, "/")

  // 一段夹具、两段断言：一条根推导喂两个消费者。
  const std = sliceSection(body, "## Project Standards", ["## Document Map", "## Instructions"])
  assert.ok(std.includes(`<!-- standards file: ${absStd} -->`), `标准档绝对路径定位注在场（base = 子项目根）：${std}`)
  assert.ok(std.includes("规则甲：写代码之前先读文档。"), `标准档正文在场：${std}`)
  assert.ok(!std.includes(NO_STANDARDS_NOTICE), "态 3 不带「没有任何东西声明」那句降级语")

  const map = sliceSection(body, "## Document Map", ["## Instructions"])
  assert.ok(map.includes(MAP_BODY.trim()), `子项目 docs/README.md 正文在场（同一 base）：${map}`)
  assert.ok(!map.includes(NO_DOC_MAP_NOTICE), "地图不降级")
})
