/**
 * 2026-10-14-admin-chat-args-truncation-fix.test.mjs — thincoder-server 批内单测件（管理面会话工具参数截断修复 · 轻通道轮；
 * 名随批档 · 住 `docs/batches/` · 不入仓套件 · 随批留存）。判据源 = 批档 §1 ∥ 设计 `agent/ADMIN-AGENT.md` §17.3 A1 配套件③。
 * 运行（自 `thincoder/` 仓根）：`node --test docs/batches/2026-10-14-admin-chat-args-truncation-fix.test.mjs`
 *
 * 射程（腿 ↔ 判据对照）：
 *   ① 落库全文（`argsFullOf`）：>500 字 JSON ⇒ 原样可解析（JSON 有效）∥ 掩蔽保留（敏感键 ⇒ `***`）
 *   ② 帧摘要不动（`argsTextOf`）：同输入 ⇒ ≤500（帧/审计面口径零变）
 *   ③ 回放净化（`replayMessages`）：存量坏行（截断残 JSON）⇒ `"{}"` ∥ 合法行 ⇒ 逐字原样 ∥ 非串 ⇒ stringify 形
 *   ④ 记录面同拍（`recordStoreOf`）：坏行 ⇒ `"{}"`（read_history 面）
 *
 * 桩说明：零外部网络 ∥ 零真库文件（④ 用 `:memory:` + 最小表）；本档只测纯函数与库行映射。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { existsSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"

const ROOT = process.cwd()
if (!existsSync(join(ROOT, "thincoder-server"))) throw new Error(`须从仓库根（thincoder/）运行——cwd = ${ROOT}`)
const SRC = join(ROOT, "thincoder-server", "src", "agent")
const load = (name) => import(pathToFileURL(join(SRC, name)).href)

const chat = await load("chat.mjs")
const store = await load("chat-store.mjs")

const LONG_JSON = JSON.stringify({ apiKey: "sk-super-secret-value-123456", command: "node --input-type=module -e '" + "x".repeat(600) + "'" })
const BROKEN = JSON.stringify({ command: "node -e '" + "y".repeat(600) + "'" }).slice(0, 500) // 模拟旧版截断残 JSON（≤500 处断行）

const rowOf = (args, seq = 1) => ({
  seq,
  role: "assistant",
  content: "",
  data_json: JSON.stringify({ toolCalls: [{ id: "c1", name: "bash", args }] }),
  created_at: new Date().toISOString(),
})

test("① 落库全文：`argsFullOf` = 掩蔽原文（JSON 有效——不截断）", () => {
  const stored = chat.argsFullOf(LONG_JSON)
  assert.ok(stored.length > 500, `落库形应超 500（实测 ${stored.length}）`)
  const parsed = JSON.parse(stored) // 不抛 = JSON 有效（本缺陷核心判据）
  assert.equal(parsed.apiKey, "***", "敏感键掩蔽保留")
  assert.ok(parsed.command.startsWith("node --input-type=module"), "原文留存（非截断残形）")
  assert.equal(chat.argsFullOf("[{\"apiKey\":\"sk-x\"}]"), "{}", "非对象根（数组）⇒ 兜底 `{}`（评审 #122 收正）")
  assert.equal(chat.argsFullOf("{broken"), "{}", "非法 JSON ⇒ 兜底 `{}`（同判）")
})

test("② 帧摘要不动：`argsTextOf` 同输入 ⇒ ≤500（帧/审计面口径零变）", () => {
  const frameArgs = chat.argsTextOf(LONG_JSON)
  assert.ok(frameArgs.length <= 500, `帧形 ≤500（实测 ${frameArgs.length}）`)
  assert.ok(frameArgs.includes("***"), "帧形同掩蔽")
})

test("③ 回放净化：坏行 ⇒ `\"{}\"` ∥ 合法行逐字 ∥ 非串 ⇒ stringify 形", () => {
  const broken = store.replayMessages([rowOf(BROKEN)])[0].tool_calls[0].function.arguments
  assert.equal(broken, "{}", "存量坏行（截断残 JSON）⇒ 兜底 `{}`（JSON 有效）")
  const okArgs = JSON.stringify({ glob: "**/*.mjs" })
  const ok = store.replayMessages([rowOf(okArgs)])[0].tool_calls[0].function.arguments
  assert.equal(ok, okArgs, "合法行 ⇒ 原样逐字（回放逐值面零变）")
  const obj = store.replayMessages([rowOf({ a: 1 })])[0].tool_calls[0].function.arguments
  assert.equal(obj, JSON.stringify({ a: 1 }), "非串 ⇒ stringify 形（既有口径）")
})

test("④ 记录面同拍：`recordStoreOf` 坏行 ⇒ `\"{}\"`（read_history 面）", async () => {
  const { DatabaseSync } = await import("node:sqlite")
  const db = new DatabaseSync(":memory:")
  db.exec("CREATE TABLE agent_chat_messages (id INTEGER PRIMARY KEY AUTOINCREMENT, chat_id INTEGER, seq INTEGER, role TEXT, content TEXT, data_json TEXT, created_at TEXT)")
  db.prepare("INSERT INTO agent_chat_messages (chat_id, seq, role, content, data_json, created_at) VALUES (1, 1, 'assistant', '', ?, ?)")
    .run(JSON.stringify({ toolCalls: [{ id: "c1", name: "bash", args: BROKEN }] }), new Date().toISOString())
  const records = [...store.recordStoreOf(db, 1).iterate("oldest")]
  assert.equal(records[0].tool_calls[0].function.arguments, "{}", "记录面（read_history 面）同净化")
  db.close()
})
