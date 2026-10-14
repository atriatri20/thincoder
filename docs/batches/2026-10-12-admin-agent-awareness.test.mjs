/**
 * 2026-10-12-admin-agent-awareness.test.mjs — thincoder-server 批内单测件（`admin-agent-awareness` 批 · 环境感知 ∥ 环境工具面 ∥
 * 工具动作审计；名随批档 · 住 `docs/batches/` · 随批留存）。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-12-admin-agent-awareness.test.mjs`
 *
 * 射程（判据源 = 批档 §2.6 五腿 ∥ `docs/server/design/agent/ADMIN-AGENT.md` §7 环境面判据行 ∥ §8 用例 N72/N73 ∥ B70/B71/E55
 * ∥ §14.1–§14.5）：
 *   腿① 四块装配在场（三活体行逐值 ∥ 尾位 ∥ 族前缀 ∥ 对位断言 = 每件注册工具名 ∈ 能力段字面 ∥ 回放零含实况行）+ 行形纯函数逐字
 *   腿② 值随实况（N73——加节点 ∥ 改档位列 ⇒ 下回合行变）+ 块级降级（B70①——现况读源抛 ⇒ 该行缺席、回合 succeeded）+ B70②③ timer
 *   腿③ 零新端点（两新档源零 `routes.add(` ∥ `chat-routes.mjs` 六端点计数不变）
 *   腿④ 工具面五族七件出场（**核真件·仓内直引**）+ `get_current_time` 真读数 + `bash` 限幅三形（B71）+ E55 三形 + 管理族既有形零变
 *   腿⑤ 审计逐字段（`subject`/`resultCode`/`truncated` ∥ 掩蔽 ∥ 逐调用一行）+ 审计页 agent 行模板三文案键（两表同步）
 * 载体 = `node --test`（假模型出口 ∥ 内存真 db ∥ **真环境工具面**——`thincoder-core/*` 仓内直引经 `deps.coreTools` 注入）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync, mkdtempSync, readFileSync } from "node:fs"
import { hostname, tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const load = (rel) => import(pathToFileURL(join(ROOT, rel)).href)

const DB = await load("thincoder-server/src/store/db.mjs")
const MEMBERS = await load("thincoder-server/src/accounts/members.mjs")
const CHAT = await load("thincoder-server/src/agent/chat.mjs")
const CHAT_ENV = await load("thincoder-server/src/agent/chat-env.mjs")
const CHAT_ENV_TOOLS = await load("thincoder-server/src/agent/chat-env-tools.mjs")
const VIEWS_AUDIT = await load("thincoder-server/public/views-audit.mjs")
const ZH_SYSTEM = (await load("thincoder-server/public/i18n-zh-system.mjs")).ZH_SYSTEM
const EN_SYSTEM = (await load("thincoder-server/public/i18n-en-system.mjs")).EN_SYSTEM

/** 核真件注入口（§14.2——**仓内直引**：`thincoder-core/*` 的 `DESC()` 按模块自身位置解析 `tool-docs/`，仓内开发机可用真件）。 */
const CORE_OPS = await load("thincoder-core/tools/ops.mjs")
const CORE_TIMER = await load("thincoder-core/agent-tools/timer.mjs")
const CORE_SEARCH = await load("thincoder-core/tools/search.mjs")
const CORE_FILE = await load("thincoder-core/tools/file.mjs")
const CORE_BASH = await load("thincoder-core/tools/bash.mjs")
const CORE_SHARED = await load("thincoder-core/tools/shared.mjs")
const CORE_TIMERS = await load("thincoder-core/agent/timers.mjs")
const CORE_HISTORY = await load("thincoder-core/agent-tools/read-history.mjs")
const CORE_TOOLS = Object.freeze({
  getCurrentTimeTool: CORE_OPS.getCurrentTimeTool,
  processTool: CORE_OPS.processTool,
  timerTool: CORE_TIMER.timerTool,
  lsTool: CORE_SEARCH.lsTool,
  readTool: CORE_FILE.readTool,
  grepTool: CORE_SEARCH.grepTool,
  bashTool: CORE_BASH.bashTool,
  readHistoryTool: CORE_HISTORY.readHistoryTool,
  toOpenAISchema: CORE_SHARED.toOpenAISchema,
  takeExpiredTimers: CORE_TIMERS.takeExpiredTimers,
  injectTimerReminders: CORE_TIMERS.injectTimerReminders,
})

const PASSWORD = "password-123"
const MODEL = "fake/fake-model"
const SERVER_VERSION = JSON.parse(readFileSync(join(ROOT, "thincoder-server", "package.json"), "utf8")).version
const TZ = Intl.DateTimeFormat().resolvedOptions().timeZone
const PREFIX = CHAT_ENV.ENV_LINE_PREFIX
const ADMIN_TOOL_NAMES = ["members", "providers", "models", "usage", "audit", "runners", "docker", "exec"] // exec = admin-chat-creds-merge 批入册（2026-10-13）
const SYSTEM_RE = /^\[System reminder: /
const tempRoot = mkdtempSync(join(tmpdir(), "tc-env-"))

/** 能力段分词（对位断言用——非词字符为界；`bash`/`read` 等工具名须以独立 token 出现）。 */
function tokensOf(text) {
  return new Set(String(text).split(/[^\w]+/).filter((token) => token !== ""))
}

// ── 假件：假模型出口 ∥ 夹具行 ──────────────────────────────────────────────────

/** 假模型：脚本回合（`{ deltas?, content?, toolCalls? }`——`deltas` 经 `onToken` 逐段上流；用尽 ⇒ 恒用末回合）。 */
function scriptedChat(turns) {
  const state = { i: 0, calls: [] }
  const chat = async ({ messages, tools, onToken }) => {
    state.calls.push({ messages: JSON.parse(JSON.stringify(messages)), tools: JSON.parse(JSON.stringify(tools ?? [])) })
    const spec = typeof turns[Math.min(state.i, turns.length - 1)] === "function" ? await turns[Math.min(state.i, turns.length - 1)]() : turns[Math.min(state.i, turns.length - 1)]
    state.i += 1
    if (spec?.deltas) for (const piece of spec.deltas) onToken?.(piece)
    return { content: spec?.content ?? "", toolCalls: spec?.toolCalls ?? [] }
  }
  return { chat, state }
}

const toolTurn = (calls) => ({ content: "", toolCalls: calls.map((call, index) => ({ id: `call-${index}-${call.name}`, name: call.name, arguments: JSON.stringify(call.args) })) })

function seedProviderRow(db, { name = "fake", models = ["fake-model"] } = {}) {
  const now = new Date().toISOString()
  db.prepare("INSERT INTO providers (name, base_url, api_key, models_json, created_at, updated_at) VALUES (?,?,?,?,?,?)").run(
    name,
    "http://127.0.0.1:9/v1",
    "sk-test",
    JSON.stringify(models),
    now,
    now,
  )
}

function seedRunnerRow(db, { name, status }) {
  db.prepare("INSERT INTO sandbox_runners (name, address, status, runtime_json, created_at) VALUES (?,?,?,?,?)").run(
    name,
    `http://127.0.0.1:9/${name}`,
    status,
    "{}",
    new Date().toISOString(),
  )
}

/**
 * 环境面夹具（§2.6 载体）：内存真 db（一 admin 成员 ∥ 一 provider 一模型 ∥ 两节点 active/disabled）∥ 假模型出口 ∥ 真环境工具面。
 * `send` = 直驱 `runChatTurn`（判权/端点面 = 前批判据，不入本件）；出 = `{ result, state, messages, frames }`。
 */
async function envFixture({ db: injected = null, seed = true, cwd = null } = {}) {
  const db = injected ?? DB.openDatabase(":memory:")
  if (seed) {
    await MEMBERS.createMember(db, { username: "admin", role: "admin", password: PASSWORD })
    seedProviderRow(db)
    seedRunnerRow(db, { name: "r-active", status: "active" })
    seedRunnerRow(db, { name: "r-disabled", status: "disabled" })
  }
  const member = db.prepare("SELECT * FROM members WHERE username = 'admin'").get()
  const chat = CHAT.createChat(db, { model: MODEL, createdBy: member?.id ?? null })
  const dir = cwd ?? mkdtempSync(join(tempRoot, "cwd-"))
  const frames = []
  return {
    db,
    chat,
    cwd: dir,
    frames,
    messages: () => db.prepare("SELECT * FROM agent_chat_messages WHERE chat_id = ? ORDER BY seq").all(chat.id),
    agentEvents: (kind = null) =>
      db
        .prepare("SELECT * FROM audit_events WHERE type = 'agent_event' ORDER BY id")
        .all()
        .filter((row) => kind === null || JSON.parse(row.detail ?? "{}").kind === kind),
    async send(content, { turns = [{ content: "好" }], now = Date.now } = {}) {
      const scripted = scriptedChat(turns)
      CHAT.claimChatTurn(db, chat.id, { now })
      const result = await CHAT.runChatTurn({
        db,
        chatId: chat.id,
        content,
        emit: (frame) => frames.push(frame),
        now,
        deps: { chat: scripted.chat, coreTools: CORE_TOOLS, cwd: dir, config: {} },
      })
      return { result, state: scripted.state, messages: scripted.state.calls[0]?.messages ?? [], frames }
    },
  }
}

/** 回合模型入参里的实况行（族前缀筛选——尾位段）。 */
const envLinesOf = (messages) => messages.map((row) => row.content).filter((text) => SYSTEM_RE.test(String(text)))
const lineWith = (messages, needle) => envLinesOf(messages).find((text) => String(text).includes(needle)) ?? null
const toolRowOf = (rows, name) => rows.filter((row) => row.role === "tool" && JSON.parse(row.data_json ?? "{}").name === name)

// ── 腿①：四块装配在场（N72——逐值 ∥ 尾位 ∥ 族前缀 ∥ 对位 ∥ 回放零含）────────────────

test("腿① 四块装配在场（N72）：简报 = 基础段 + 能力段 ∥ 三活体行逐值 ∥ 尾位 ∥ 族前缀 ∥ 对位 ∥ 回放零含实况行", async () => {
  const fx = await envFixture()
  const NOW = Date.parse("2026-10-12T10:20:30.000Z")
  const { result, state, messages } = await fx.send("现在几点？你管着几个节点？", { turns: [{ content: "在" }], now: () => NOW })
  assert.equal(result.status, "succeeded", `回合应成功——实读 ${result.status}（${result.reason ?? ""}）`)

  // ④ 能力与边界 = 简报静态段（`CHAT_LIMITS_BLOCK`）+ 活体面（`tools.schemas`）
  assert.equal(messages[0].role, "system")
  assert.equal(messages[0].content, CHAT.CHAT_SYSTEM_BRIEF)
  assert.ok(messages[0].content.includes(CHAT_ENV.CHAT_LIMITS_BLOCK), "简报应含能力与边界段")
  assert.ok(CHAT_ENV.CHAT_LIMITS_BLOCK.includes("120000") && !CHAT_ENV.CHAT_LIMITS_BLOCK.includes("600000"), "能力段应含缺省值且不再含已撤上限")

  // 尾位三行（历史与本轮之后——沿核 setup 前缀缓存理由）
  const tail = messages.slice(-3)
  assert.deepEqual(tail.map((row) => row.role), ["user", "user", "user"], "实况行 = user 行（核同判）")
  const lines = tail.map((row) => row.content)
  for (const line of lines) {
    assert.match(line, SYSTEM_RE, `族前缀缺位：${line}`)
    assert.ok(line.endsWith("]."), `行尾形应为 ].：${line}`)
  }
  assert.equal(messages[messages.length - 4].content, "现在几点？你管着几个节点？", "实况行应尾插于本轮消息之后")

  // ① 时空行（注入 now 逐值——本地时间 sv-SE ∥ IANA 时区）
  assert.equal(lines[0], `${PREFIX}current time is ${new Date(NOW).toLocaleString("sv-SE")} (local; timezone ${TZ})].`)

  // ② 所在/身份行（逐值）
  const id = lines[1]
  assert.ok(id.includes(`env: thincoder-server ${SERVER_VERSION}（`), `版本应取 package.json 单源：${id}`)
  assert.match(id, /（(容器|systemd 服务|独立进程)）/, "部署身份应在三判据值域内")
  assert.ok(id.includes(`host: ${hostname()}`), `主机名单源：${id}`)
  assert.ok(id.includes(`platform: ${process.platform} ${process.arch}`), `平台/架构：${id}`)
  assert.ok(id.includes(`node: ${process.version}`), `node 版本：${id}`)
  assert.ok(id.includes(`pid: ${process.pid}`), `pid：${id}`)
  assert.ok(id.includes(`cwd: ${fx.cwd}`), `cwd = 注入基（deps.cwd）：${id}`)
  assert.ok(id.includes(`model: ${MODEL}`), `会话模型：${id}`)
  assert.ok(id.includes("reasoning: 未设"), `档位未设 ⇒ 未设：${id}`)

  // ③ 所管现况行（reads 逐值——一成员 ∥ 一 provider 一模型 ∥ 两节点 active 1/disabled 1）
  assert.equal(lines[2], `${PREFIX}管理面现况：注册节点 2（active 1 ∥ disabled 1）∥ 服务模型 1 ∥ 成员 1].`)

  // 对位断言：每件注册工具名 ∈ 能力段字面（活体面 = 当回合 schemas）
  const registered = state.calls[0].tools.map((schema) => schema.function.name)
  assert.equal(registered.length, ADMIN_TOOL_NAMES.length + CHAT_ENV_TOOLS.ENV_TOOL_NAMES.length)
  const tokens = tokensOf(CHAT_ENV.CHAT_LIMITS_BLOCK)
  for (const name of registered) assert.ok(tokens.has(name), `能力段应列注册工具名：${name}`)
  for (const name of [...ADMIN_TOOL_NAMES, ...CHAT_ENV_TOOLS.ENV_TOOL_NAMES]) assert.ok(registered.includes(name), `工具面缺件：${name}`)

  // 瞬态不落库（回放零含实况行）
  assert.ok(fx.messages().every((row) => !SYSTEM_RE.test(String(row.content))), "实况行不得落库（瞬态）")
})

test("腿① 行形纯函数逐字：deployIdentity 三判据（含探针非抛）∥ timeLine/identityLine/stateLine 逐字", () => {
  assert.equal(CHAT_ENV.deployIdentity({}, { exists: () => true }), "容器")
  assert.equal(CHAT_ENV.deployIdentity({ INVOCATION_ID: "abc-123" }, { exists: () => false }), "systemd 服务")
  assert.equal(CHAT_ENV.deployIdentity({ INVOCATION_ID: "   " }, { exists: () => false }), "独立进程")
  assert.equal(CHAT_ENV.deployIdentity({}, { exists: () => false }), "独立进程")
  assert.equal(
    CHAT_ENV.deployIdentity({}, { exists: () => { throw new Error("探针炸") } }),
    "独立进程",
    "探针异常 ⇒ 按独立进程落值（非抛——降级唯块级）",
  )
  assert.equal(CHAT_ENV.timeLine({ now: () => Date.parse("2026-10-12T10:20:30.000Z") }), `${PREFIX}current time is ${new Date(Date.parse("2026-10-12T10:20:30.000Z")).toLocaleString("sv-SE")} (local; timezone ${TZ})].`)
  assert.equal(
    CHAT_ENV.identityLine({ version: "1.2.3", deploy: "容器", host: "h1", platform: "linux", arch: "x64", node: "v24.0.0", pid: 42, cwd: "/srv", model: "p/m", reasoning: null }),
    `${PREFIX}env: thincoder-server 1.2.3（容器）∥ host: h1 ∥ platform: linux x64 ∥ node: v24.0.0 ∥ pid: 42 ∥ cwd: /srv ∥ model: p/m ∥ reasoning: 未设].`,
  )
  assert.equal(
    CHAT_ENV.stateLine({ runners: [{ status: "active" }, { status: "disabled" }, { status: "active" }], providers: [{ models: ["a", "b"] }, { models: [] }], members: [1, 2] }),
    `${PREFIX}管理面现况：注册节点 3（active 2 ∥ disabled 1）∥ 服务模型 2 ∥ 成员 2].`,
  )
  assert.equal(CHAT_ENV.buildEnvLines({ db: null, model: null, cwd: "/srv", now: () => Date.parse("2026-10-12T10:20:30.000Z") }).length, 2, "第三块读源缺位 ⇒ 该块降级（其余两块在场）")
})

// ── 腿②：值随实况（N73）∥ 块级降级（B70①）∥ timer 两窗（B70②③）──────────────────

test("腿② 值随实况（N73）：加一节点 ∥ 档位列改 ⇒ 下回合行变（同会话连发两条）", async () => {
  const fx = await envFixture()
  const first = await fx.send("一", { turns: [{ content: "好" }] })
  assert.equal(lineWith(first.messages, "管理面现况"), `${PREFIX}管理面现况：注册节点 2（active 1 ∥ disabled 1）∥ 服务模型 1 ∥ 成员 1].`)
  assert.ok(lineWith(first.messages, "env: thincoder-server").includes("reasoning: 未设"))

  seedRunnerRow(fx.db, { name: "r-new", status: "active" }) // 读源变更（库写——非缓存）
  fx.db.prepare("UPDATE agent_chats SET reasoning = ? WHERE id = ?").run("high", fx.chat.id)

  const second = await fx.send("二", { turns: [{ content: "好" }] })
  assert.equal(lineWith(second.messages, "管理面现况"), `${PREFIX}管理面现况：注册节点 3（active 2 ∥ disabled 1）∥ 服务模型 1 ∥ 成员 1].`)
  assert.ok(lineWith(second.messages, "env: thincoder-server").includes("reasoning: high"), "档位列改 ⇒ 下回合行随实况")
})

test("腿② 块级降级（B70①）：现况读源抛 ⇒ 该行整行略去 ∥ 其余两行在场 ∥ 回合照样 succeeded", async () => {
  const raw = DB.openDatabase(":memory:")
  await MEMBERS.createMember(raw, { username: "admin", role: "admin", password: PASSWORD })
  seedProviderRow(raw)
  raw.prepare("ALTER TABLE sandbox_runners RENAME TO sandbox_runners_off").run() // 读源抛（真读径——非替身）
  const fx = await envFixture({ db: raw, seed: false })
  const { result, messages, frames } = await fx.send("现况读得到吗？", { turns: [{ content: "在" }] })

  assert.equal(result.status, "succeeded", "降级不得阻断回合")
  assert.ok(frames.some((frame) => frame.type === "end" && frame.status === "succeeded"), "帧面应如实落 succeeded")
  const lines = envLinesOf(messages)
  assert.equal(lines.length, 2, `降级 = 整行略去（余两行在场）——实读 ${lines.length}`)
  assert.ok(!lines.some((line) => line.includes("管理面现况")), "失败块不得半真值上屏")
  assert.ok(lines.some((line) => line.includes("env: thincoder-server")))
  assert.ok(lines.some((line) => line.includes("current time is")))
})

test("腿② timer（B70②③）：未到期零行 ∥ 到期不进用户回合（投递归唤醒面——本夹具零落库）", async () => {
  const fx = await envFixture()
  const set = await fx.send("设个 1 秒提醒", {
    turns: [toolTurn([{ name: "timer", args: { seconds: 1, message: "看日志" } }]), { content: "定了" }],
  })
  assert.equal(CHAT_ENV_TOOLS.pendingTimerCount(fx.chat.id), 1, "在途 timer 应挂会话垫片")
  assert.ok(!envLinesOf(set.messages).some((line) => line.includes("⏰ timer")), "设的当回合不出提醒行")

  const early = await fx.send("在？", { turns: [{ content: "在" }] })
  assert.ok(!envLinesOf(early.messages).some((line) => line.includes("⏰ timer")), "未到期 ⇒ 零 timer 行（在途保留）")

  CHAT_ENV_TOOLS.timerPadOf(fx.chat.id)._pendingTimers[0].expiresAt = Date.now() - 1 // 确定性到期（免墙钟 flake——到期判决 = 核件 `takeExpiredTimers`）
  const due = await fx.send("再看", { turns: [{ content: "好" }] })
  const timerLines = envLinesOf(due.messages).filter((line) => line.includes("⏰ timer"))
  assert.equal(timerLines.length, 0, "到期件不在用户回合投（投递归空闲自唤醒面——2026-10-13 唤醒批；行文逐字 = 唤醒批件）")
  assert.equal(CHAT_ENV_TOOLS.pendingTimerCount(fx.chat.id), 1, "本夹具无唤醒泵 ⇒ 到期件留垫片（等待唤醒面出列）")

  const again = await fx.send("还有吗？", { turns: [{ content: "没了" }] })
  assert.ok(!envLinesOf(again.messages).some((line) => line.includes("⏰ timer")), "用户回合零 timer 行（投递归空闲自唤醒面）")
  const landed = fx.messages().filter((row) => String(row.content).includes("⏰ timer"))
  assert.equal(landed.length, 0, "本夹具无唤醒泵 ⇒ 零落库（落库/唤醒深腿 = 唤醒批批内件）")
})

// ── 腿③：零新端点 ─────────────────────────────────────────────────────────────

test("腿③ 零新端点：两新档源零 `routes.add(` ∥ `chat-routes.mjs` 六端点计数不变", () => {
  for (const rel of ["thincoder-server/src/agent/chat-env.mjs", "thincoder-server/src/agent/chat-env-tools.mjs"]) {
    const src = readFileSync(join(ROOT, rel), "utf8")
    assert.equal((src.match(/routes\.add\(/g) ?? []).length, 0, `${rel} 不应新增端点`)
    assert.ok(!/register\w*Routes/.test(src), `${rel} 不应注册路由表`)
    assert.ok(!src.includes("gateway/server"), `${rel} 不应触网关装配`)
  }
  const routes = readFileSync(join(ROOT, "thincoder-server/src/agent/chat-routes.mjs"), "utf8")
  assert.equal((routes.match(/routes\.add\(/g) ?? []).length, 6, "会话面六端点（本批零增——§11）")
  assert.equal(CHAT.CHAT_SUBJECT_MAX, 2000, "审计 subject 上限常量在册")
})

// ── 腿④：工具面五族七件 ∥ get_current_time 真读数 ∥ 限幅三形 ∥ E55 ──────────────

test("腿④ 六族八件出场（核真件）：names/schemas/描述三面同源 ∥ 六族覆盖全八件", async () => {
  const env = await CHAT_ENV_TOOLS.createEnvTools({ coreTools: CORE_TOOLS })
  assert.deepEqual([...env.names], ["get_current_time", "process", "timer", "ls", "read", "grep", "bash", "read_history"])
  assert.equal(env.schemas.length, 8)
  for (const schema of env.schemas) {
    assert.equal(schema.type, "function")
    assert.ok(typeof schema.function.description === "string" && schema.function.description.length > 40, `描述应取核件原文：${schema.function.name}`)
    assert.equal(schema.function.parameters.type, "object", `schema 形应与核件同源：${schema.function.name}`)
  }
  assert.equal(CHAT_ENV_TOOLS.ENV_TOOL_FAMILIES.length, 6, "六族")
  assert.deepEqual(
    CHAT_ENV_TOOLS.ENV_TOOL_FAMILIES.flatMap((family) => family.tools).sort(),
    [...CHAT_ENV_TOOLS.ENV_TOOL_NAMES].sort(),
    "六族应恰好覆盖八件（无重无漏）",
  )
  assert.equal(CHAT_ENV_TOOLS.ENV_BASH_TIMEOUT_DEFAULT_MS, 120000)
  assert.equal(CHAT_ENV_TOOLS.ENV_BASH_TIMEOUT_MAX_MS, undefined, "自造超时上限常量已撤（用户 2026-10-12 15:00）")

  // 端池参数处置（§14.2/§16.1）——运行期拒、零静默钳制；async 已改受理（2026-10-13 唤醒批——旧显式拒撤）
  const acceptedAsync = await env.invoke("bash", { command: "echo x", async: true }, { cwd: tempRoot })
  assert.ok(!/async 不可用/.test(acceptedAsync.message ?? ""), "async 受理（深腿 = 唤醒批批内件）")
  const refusedTimeout = await env.invoke("bash", { command: "echo x", timeout: 0 }, { cwd: tempRoot })
  assert.equal(refusedTimeout.ok, false)
  assert.match(refusedTimeout.message, /非法/)
  const bigTimeout = await env.invoke("bash", { command: "echo big-ok", timeout: 700000 }, { cwd: tempRoot })
  assert.equal(bigTimeout.ok, true, "超时无上限：700000 ms 被受理（自造上限已撤）")
  const hugeTimeout = await env.invoke("bash", { command: "echo x", timeout: 3000000000 }, { cwd: tempRoot })
  assert.equal(hugeTimeout.ok, false, "逾 Node 计时器量程（2^31−1） ⇒ 显式拒（非静默秒杀——实测该值会被归 1ms）")
  const unknown = await env.invoke("nope", {}, {})
  assert.equal(unknown.ok, false)
  assert.match(unknown.message, /未知环境工具/)
})

test("腿④ get_current_time 真读数 ∥ bash 限幅三形 ∥ cwd 生效 ∥ E55 三形（一回合十调用）", async () => {
  const fx = await envFixture()
  const CMD_CWD = 'node -e "console.log(process.cwd())"'
  const CMD_BIG = 'node -e "process.stdout.write(String.fromCharCode(121).repeat(5000))"'
  const CMD_EXIT3 = 'node -e "process.exit(3)"'
  const SECRET = "sk-live-super-secret-9"
  const MISSING = join(fx.cwd, "nope-xyz.txt")
  const { result, messages, frames } = await fx.send(
    "跑一遍环境工具",
    { turns: [toolTurn([
      { name: "get_current_time", args: {} },
      { name: "bash", args: { command: CMD_CWD } },
      { name: "bash", args: { command: CMD_BIG } },
      { name: "bash", args: { command: CMD_EXIT3 } },
      { name: "bash", args: { command: `echo ${SECRET}`, apiKey: SECRET } },
      { name: "bash", args: { command: "echo x", timeout: 0 } },
      { name: "bash", args: { command: "echo x", async: true } },
      { name: "read", args: { path: MISSING } },
      { name: "grep", args: { pattern: "[" } },
      { name: "runners", args: { op: "list" } },
    ]), { content: "跑完了" }] },
  )
  assert.equal(result.status, "succeeded", `工具错误不得停回合——实读 ${result.status}（${result.reason ?? ""}）`)
  const rows = fx.messages()
  const nowRow = toolRowOf(rows, "get_current_time")[0]
  assert.match(nowRow.content, /^Date: .+/m, `真读数（首行 Date:）：${nowRow.content.slice(0, 80)}`)
  assert.ok(nowRow.content.includes("Timezone: "), "真读数应含时区行")
  assert.ok(!nowRow.content.startsWith("{"), "模型可见形 = 核件文本原文（非 JSON 壳）")

  const cwdRow = toolRowOf(rows, "bash")[0]
  assert.ok(cwdRow.content.includes(fx.cwd), `cwd 限幅应生效（deps.cwd）：${cwdRow.content.slice(0, 120)}`)
  const bigRow = toolRowOf(rows, "bash")[1]
  assert.ok(bigRow.content.length <= CHAT.CHAT_TOOL_CONTENT_MAX, `落库形 ≤4000 字：实读 ${bigRow.content.length}`)
  assert.match(bigRow.content, /…（截断——实长 \d+）/, "逾限应带注记")
  const exit3Row = toolRowOf(rows, "bash")[2]
  assert.match(exit3Row.content, /\(exit code 3\)/, "非零退出 = 调用完成（退出码在输出文本内）")
  assert.equal(JSON.parse(exit3Row.data_json).ok, true, "非零退出 ⇒ ok:true（不解析退出码）")
  for (const [index, needle] of [[4, /非法/]]) {
    const row = toolRowOf(rows, "bash")[index]
    assert.match(row.content, needle, "端池参数 ⇒ 工具级错误人话回灌")
    assert.equal(JSON.parse(row.data_json).ok, false)
  }
  assert.ok(!/async 不可用/.test(toolRowOf(rows, "bash")[5].content), "async 受理（回执形——深腿见唤醒批件；2026-10-13）")
  const readRow = toolRowOf(rows, "read")[0]
  assert.equal(JSON.parse(readRow.data_json).ok, false)
  assert.ok(!readRow.content.startsWith("{"), "错误形回灌 = 人话 message（非 JSON 壳）")
  const grepRow = toolRowOf(rows, "grep")[0]
  assert.equal(JSON.parse(grepRow.data_json).ok, false)
  assert.match(grepRow.content, /not a valid regex/)
  const adminRow = toolRowOf(rows, "runners")[0]
  assert.ok(adminRow.content.startsWith("{"), "管理族既有形零变（结构化结果）")
  assert.equal(JSON.parse(adminRow.data_json).ok, true)
})

// ── 腿⑤：审计逐字段 + 页面模板 ────────────────────────────────────────────────

test("腿⑤ 工具动作审计（KD-SV-114）：逐调用一行 ∥ subject/resultCode/truncated 逐字段 ∥ 掩蔽 ∥ 管理族 subject=null", async () => {
  const fx = await envFixture()
  const CMD_CWD = 'node -e "console.log(process.cwd())"'
  const CMD_BIG = 'node -e "process.stdout.write(String.fromCharCode(121).repeat(5000))"'
  const SECRET = "sk-live-super-secret-9"
  const MISSING = join(fx.cwd, "nope-xyz.txt")
  const CALLS = [
    { name: "get_current_time", args: {} },
    { name: "bash", args: { command: CMD_CWD } },
    { name: "bash", args: { command: CMD_BIG } },
    { name: "bash", args: { command: `echo ${SECRET}`, apiKey: SECRET } },
    { name: "read", args: { path: MISSING } },
    { name: "grep", args: { pattern: "[" } },
    { name: "runners", args: { op: "list" } },
  ]
  await fx.send("跑一遍", { turns: [toolTurn(CALLS), { content: "好了" }] })

  const rows = fx.agentEvents("chat_call")
  assert.equal(rows.length, CALLS.length, "逐调用一行（读动作同落——KD-SV-91）")
  const details = rows.map((row) => JSON.parse(row.detail))
  for (const detail of details) {
    assert.ok(Object.hasOwn(detail, "subject"), "detail 应固定携 subject 键")
    assert.ok(Object.hasOwn(detail, "truncated"), "detail 应固定携 truncated 键")
    assert.equal(typeof detail.truncated, "boolean")
    assert.ok(typeof detail.summary === "string" && detail.summary !== "", "摘要单调（人话）")
    assert.ok(typeof detail.call === "string" && detail.call !== "")
    assert.equal(detail.chatId, fx.chat.id)
  }

  const nowDetail = details.find((detail) => detail.tool === "get_current_time")
  assert.equal(nowDetail.resultCode, 0)
  assert.equal(nowDetail.truncated, false)
  assert.match(nowDetail.summary, /^Date: /, "摘要取核件返回首行")
  assert.ok(nowDetail.subject === null || nowDetail.subject === "", "无主事词件 ⇒ subject 空")

  const bashDetails = details.filter((detail) => detail.tool === "bash")
  assert.equal(bashDetails.length, 3)
  assert.equal(bashDetails.find((detail) => detail.subject === CMD_CWD).resultCode, 0, "subject = 命令原文")
  const truncated = bashDetails.find((detail) => detail.truncated === true)
  assert.equal(truncated.subject, CMD_BIG, "截断位落该行的 subject")
  assert.match(truncated.summary, /^\(exit code 0\)$/)
  const masked = bashDetails.find((detail) => String(detail.subject).includes("***"))
  assert.ok(masked, "命令行含会话面敏感值 ⇒ subject 过掩蔽（同 `call` 链）")
  assert.ok(!String(masked.subject).includes(SECRET), "敏感值不得入审计")

  const readDetail = details.find((detail) => detail.tool === "read")
  assert.equal(readDetail.subject, MISSING, "读文件 ⇒ subject = 路径原文")
  assert.equal(readDetail.resultCode, -1, "失败 ⇒ resultCode -1（页面「失败」）")
  const grepDetail = details.find((detail) => detail.tool === "grep")
  assert.equal(grepDetail.subject, "[", "subject = 正则原文")
  const adminDetail = details.find((detail) => detail.tool === "runners")
  assert.equal(adminDetail.subject, null, "管理族零主事词 ⇒ null（既有行形不变）")
  assert.equal(adminDetail.resultCode, 0)
})

test("腿⑤ 审计页 agent 行模板：三文案键在场（两表同步 ∥ en 零 CJK）∥ 逐形渲染 ∥ 真数据行非裸 JSON", () => {
  assert.equal(typeof VIEWS_AUDIT.agentDetailText, "function")
  assert.equal(VIEWS_AUDIT.agentDetailText({ tool: "bash", subject: "ls -la", resultCode: 0, truncated: false, summary: "(exit code 0)" }), "bash · ls -la · 完成 · (exit code 0)")
  assert.equal(VIEWS_AUDIT.agentDetailText({ tool: "bash", subject: "ls -la", resultCode: -1, truncated: true, summary: "炸了" }), "bash · ls -la · 失败 · 结果截断 · 炸了")
  assert.equal(VIEWS_AUDIT.agentDetailText({ tool: "get_current_time", subject: null, resultCode: 0, truncated: false, summary: "Date: now" }), "get_current_time · 完成 · Date: now")
  assert.equal(VIEWS_AUDIT.agentDetailText({ kind: "chat_start", chatId: 1 }), "—", "零字段行 ⇒ —（模板不渲裸 JSON）")

  for (const [table, name] of [[ZH_SYSTEM, "zh"], [EN_SYSTEM, "en"]]) {
    for (const key of ["audit.agentOk", "audit.agentFail", "audit.agentTruncated"]) {
      assert.ok(typeof table[key] === "string" && table[key] !== "", `${name} 表缺键：${key}`)
    }
  }
  assert.equal(ZH_SYSTEM["audit.agentOk"], "完成") // 取值 = 设计键族登记单源（`docs/server/design/webui/SYSTEM.md` §3）
  assert.equal(ZH_SYSTEM["audit.agentFail"], "失败")
  assert.equal(ZH_SYSTEM["audit.agentTruncated"], "结果截断")
  assert.equal(EN_SYSTEM["audit.agentOk"], "Done")
  assert.equal(EN_SYSTEM["audit.agentFail"], "Failed")
  assert.equal(EN_SYSTEM["audit.agentTruncated"], "Result truncated")
  assert.ok(!/[\u4e00-\u9fff]/.test(`${EN_SYSTEM["audit.agentOk"]}${EN_SYSTEM["audit.agentFail"]}${EN_SYSTEM["audit.agentTruncated"]}`), "en 表零 CJK")
})
