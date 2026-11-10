/**
 * cross-instance-message.test.mjs — 集成用例 CLI 46-1（RTM 故事 CLI 46「跨实例发消息：一条消息送进另一实例
 * 并起一轮，回程带请求号」）。
 *
 * 判据原文 = `test/rtm/tooling.md` 故事 46 用例行 46-1；机制单源 =
 * `docs/core/design/MULTI-INSTANCE-COLLAB.md` §5（§5.3 回执 / §5.4 投递与取件 / §5.5 可达性四态 / §5.10 集成行）。
 *
 * 进入口 = **两个真 node 进程**共用同一临时 `~/.thincoder` 等价根：A 端发、B 端收（真核三档：名册 ∥ inbox ∥
 * 取件闩）。被替掉的只有**回合面与宿主定时器**——真 CLI TUI 要 TTY、要真 provider，夹具用 stdin 协议驱动
 * 「一拍 / 在飞回合开关 / 端壳就绪探针 / 开轮失败 / 假钟推进」五件（`test/integration/fixtures/cross-instance-harness.mjs`）。
 * 因此本档证明：跨进程投递落盘、取件一次性、起一轮、请求号回程、在飞回合零注入、**闩自续**、**两条可见行**、
 * **载体不就绪也出声**（端壳 `ready()` 假 ⇒ 零取件 + 受阻行 + 日志 `reason = carrier`，转真那一拍恢复取件）；
 * **不**证明真 TUI 的渲染形态与真模型如何读这条消息（那两面 = 人工走查）。
 *
 * **一拍 = 跑夹具队里的定时器回调**（不是直呼 `fire()`）⇒「闩还在不在」是跑出来的读数（`armed`）：
 * 旧形态（在飞一拍零重臂）里第 ⑤ 步会读 0，本档因此能红。
 *
 * 复跑（cwd = 仓根）：`node --test test/integration/cross-instance-message.test.mjs`
 */
import { test } from "node:test"
import assert from "node:assert/strict"
import { spawn } from "node:child_process"
import { mkdtempSync, readdirSync, readFileSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join, resolve } from "node:path"
import { createInterface } from "node:readline"
import { fileURLToPath } from "node:url"

import { INBOX_BLOCKED_MS } from "../../thincoder-core/instance-inbox-watch.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const HARNESS = join(HERE, "fixtures", "cross-instance-harness.mjs")

/** 起一个实例壳；返回 `{ ask, close, pid }`（逐行 JSON 协议，回执按到达序配对）。
 *  投递面判据只有「在册 ∧ pid 活 ∧ inbox 可写」（§5.5「本面不判身份族」）⇒ 夹具不必装成 CLI 形态：
 *  这个进程的命令行与本产品族无关，也照常收得到消息。 */
function startInstance(root) {
  const child = spawn(process.execPath, [HARNESS, root], { stdio: ["pipe", "pipe", "pipe"] })
  const rl = createInterface({ input: child.stdout })
  const queue = []
  const waiters = []
  rl.on("line", (line) => {
    const text = line.trim()
    if (!text) return
    let msg
    try { msg = JSON.parse(text) } catch { return }
    const w = waiters.shift()
    if (w) w(msg)
    else queue.push(msg)
  })
  child.stderr.on("data", (d) => { process.stderr.write(`[harness] ${d}`) })
  const next = () => (queue.length > 0 ? Promise.resolve(queue.shift()) : new Promise((r) => waiters.push(r)))
  return {
    pid: child.pid,
    ask(cmd) {
      child.stdin.write(JSON.stringify(cmd) + "\n")
      return next()
    },
    close() {
      try { child.stdin.write(JSON.stringify({ op: "exit" }) + "\n") } catch { /* 已退出 */ }
      try { child.kill() } catch { /* 已退出 */ }
    },
  }
}

/** 首个非空行 = 来源标记行。 */
function firstLine(msg) {
  return String(msg ?? "").split("\n")[0]
}

test("CLI 46-1 跨实例发消息：送进另一实例并起一轮，回程带请求号，在飞回合不插队", async (t) => {
  const root = mkdtempSync(join(tmpdir(), "cic46-"))
  const a = startInstance(root)
  const b = startInstance(root)
  t.after(async () => {
    a.close()
    b.close()
    // Windows：子进程退出与文件句柄释放是异步的 ⇒ 立刻删根盘可能撞 EPERM（本批夹具新增日志面后必现）。
    // 重试几拍；真的删不掉就照旧抛出——不把失败吞成一条无证据的绿。
    for (let i = 0; i < 20; i += 1) {
      try { rmSync(root, { recursive: true, force: true }); return } catch (e) {
        if (i === 19) throw e
        await new Promise((r) => setTimeout(r, 100))
      }
    }
  })
  const inboxB = () => readdirSync(join(root, "inbox", initB.sessionId))

  const initA = await a.ask({ op: "init", cwd: "D:\\repo-a" })
  const initB = await b.ask({ op: "init", cwd: "D:\\repo-b" })
  assert.equal(initA.ok, true)
  assert.equal(initB.ok, true)
  assert.notEqual(initA.sessionId, initB.sessionId, "两实例两个会话 id")
  assert.equal(initB.armed, 1, "会话起点装上闩 = 一拍待跑")

  // ── ④ 前半：B 正在跑一轮 ⇒ A 发的消息不插进该轮 ──
  await b.ask({ op: "busy", v: true })
  const sent1 = await a.ask({ op: "send", target: initB.sessionId, text: "帮我看一下这条需求：跨实例发消息" })
  assert.equal(sent1.ok, true, JSON.stringify(sent1))
  assert.equal(sent1.receipt.status, "delivered-to-inbox")
  assert.deepEqual(sent1.receipt.target, { sessionId: initB.sessionId, end: "cli" })

  const tickBusy = await b.ask({ op: "tick" })
  assert.equal(tickBusy.turns, 0, "在飞回合零取件：该轮指令流零变化（没有新回合）")
  assert.deepEqual(tickBusy.took, [], "在飞回合零取件")
  assert.equal(tickBusy.armed, 1, "闩自续：在飞一拍之后仍有一拍待跑（旧形态 = 0——P2）")
  assert.deepEqual(inboxB(), [`${sent1.receipt.requestId}.json`], "消息留在目标 inbox，②回执 requestId = inbox 那枚 msgId")

  // ── ① 该轮结束 ⇒ 取件一次、起新一轮；消息 = role:"user"、首行带来源标记、无 re= ──
  await b.ask({ op: "busy", v: false })
  const tickIdle = await b.ask({ op: "tick" })
  assert.equal(tickIdle.turns, 1, "轮结束后起新一轮")
  assert.equal(tickIdle.took.length, 1)
  const stateB = await b.ask({ op: "state" })
  const gotB = stateB.history[0]
  assert.equal(gotB.role, "user")
  const lineB = firstLine(gotB.content)
  assert.match(lineB, /^\[cross-instance message · from cli pid=\d+ session=\S+ cwd=\S+\]$/, lineB)
  assert.equal(lineB.includes("re="), false, "首发不带 re=")
  assert.equal(gotB.content.split("\n")[1], "", "标记行后是空行")
  assert.equal(gotB.content.split("\n")[2], "帮我看一下这条需求：跨实例发消息")
  assert.deepEqual(inboxB(), [], "取件一次性——取后目录无残留")

  // ── ③ 回程 = 同一条通道上的普通消息，re = 原 requestId；落回 A 会话、标记行逐字带 re= ──
  const reply1 = await b.ask({ op: "send", target: initA.sessionId, text: "收到了，这条我来做", re: sent1.receipt.requestId })
  assert.equal(reply1.ok, true, JSON.stringify(reply1))
  assert.equal(reply1.receipt.status, "delivered-to-inbox")
  const tickA = await a.ask({ op: "tick" })
  assert.equal(tickA.turns, 1)
  const stateA = await a.ask({ op: "state" })
  const gotA = stateA.history[0]
  assert.equal(gotA.role, "user")
  const lineA = firstLine(gotA.content)
  assert.ok(lineA.endsWith(` · re=${sent1.receipt.requestId}]`), lineA)
  assert.match(lineA, /^\[cross-instance message · from cli pid=\d+ session=\S+ cwd=\S+ · re=/)

  // ── ④ 前半再走一遍（第二条）：B 又在跑一轮 ⇒ 不插队；轮结束后才起下一轮 ──
  await b.ask({ op: "busy", v: true })
  const sent2 = await a.ask({ op: "send", target: initB.sessionId, text: "第二条" })
  assert.equal(sent2.ok, true)
  const tickBusy2 = await b.ask({ op: "tick" })
  assert.deepEqual(tickBusy2.took, [], "在飞不插队")
  assert.equal(tickBusy2.turns, 1, "在飞那一轮的回合数不变")
  await b.ask({ op: "busy", v: false })
  const tickIdle2 = await b.ask({ op: "tick" })
  assert.equal(tickIdle2.turns, 2, "轮结束后才起下一轮")
  assert.equal(tickIdle2.took[0].text, "第二条")

  // ── ⑤ 自续补位：两个补位点（回合链尾 / 模态关闭）一次都不调用 —— 夹具 init 之后再没调过 `sync()` ──
  const sent3 = await a.ask({ op: "send", target: initB.sessionId, text: "第三条：上一轮中止结束之后来的" })
  assert.equal(sent3.ok, true)
  await b.ask({ op: "busy", v: true }) // 「一轮在跑」
  const tickBusy3 = await b.ask({ op: "tick" })
  assert.deepEqual(tickBusy3.took, [], "在飞零取件")
  assert.equal(tickBusy3.armed, 1, "自续：在飞一拍之后闩仍武装（撤闩 + 靠链尾重臂的旧形态这里读 0）")
  await b.ask({ op: "busy", v: false }) // 「上一轮中止结束」——零补位调用
  const tickAfterAbort = await b.ask({ op: "tick" })
  assert.equal(tickAfterAbort.turns, 3, "补位点一次都不调用 ⇒ 下一拍仍取走并起新一轮")
  assert.equal(tickAfterAbort.took[0].text, "第三条：上一轮中止结束之后来的")

  // ── ⑥ 两条新可见面：开轮失败留痕 ∥ 受阻跨阈出声（各恰好一行，逐字锚 = §5.4 两条） ──
  const sent4 = await a.ask({ op: "send", target: initB.sessionId, text: "第四条：开轮会失败" })
  assert.equal(sent4.ok, true)
  await b.ask({ op: "failTake", v: true })
  const tickLost = await b.ask({ op: "tick" })
  await b.ask({ op: "failTake", v: false })
  assert.deepEqual(
    tickLost.lines,
    [`[cross-instance message · turn failed: 1 lost (${sent4.receipt.requestId})]`],
    "开轮没成 ⇒ 恰一行丢失行（逐字锚）",
  )
  assert.equal(tickLost.turns, 3, "开轮没成 ⇒ 没起轮")
  assert.deepEqual(inboxB(), [], "消息已离盘、不重投")
  assert.equal(tickLost.armed, 1, "开轮没成 ⇒ 闩照常走下一拍")

  // ⑥-受阻：在飞 + 待取非空 + 假钟跨过 INBOX_BLOCKED_MS ⇒ 恰一行
  const sent5 = await a.ask({ op: "send", target: initB.sessionId, text: "第五条：一直受阻" })
  assert.equal(sent5.ok, true)
  await b.ask({ op: "busy", v: true })
  const blockStart = await b.ask({ op: "tick" })
  assert.deepEqual(blockStart.lines, [], "起算那一拍不跨阈 ⇒ 零行")
  const step = INBOX_BLOCKED_MS + 1
  await b.ask({ op: "advance", ms: step })
  const blocked = await b.ask({ op: "tick" })
  assert.deepEqual(
    blocked.lines,
    [`[cross-instance message · pickup blocked ${step}ms: 1 pending]`],
    "受阻跨阈 ⇒ 恰一行受阻行（逐字锚 · 不叫 stall）",
  )
  assert.deepEqual(inboxB(), [`${sent5.receipt.requestId}.json`], "受阻 ≠ 取件 ⇒ 消息仍在盘上")

  // ⑥-受阻·空则零行：先把消息取走，再受阻一阈
  await b.ask({ op: "busy", v: false })
  const drained = await b.ask({ op: "tick" })
  assert.equal(drained.turns, 4, "门一开就取走")
  assert.deepEqual(inboxB(), [], "取走后零残留")
  await b.ask({ op: "busy", v: true })
  await b.ask({ op: "tick" }) // 重新起算
  await b.ask({ op: "advance", ms: step })
  const emptyBlocked = await b.ask({ op: "tick" })
  assert.deepEqual(emptyBlocked.lines, [], "待取为空 ⇒ 零行（只记 ev:inbox-watch-blocked-empty）")
  await b.ask({ op: "busy", v: false })

  // ── ⑦ 载体不就绪也出声（D-MI34 ∥ D-MI35 · 修正轮新增）：端壳 `ready() === false` ⇒ 零取件、跨阈出受阻行、
  //      日志 `reason === "carrier"`；`ready` 转真 ⇒ 下一拍取件恰一次、起轮恰一次（闩从未撤）。
  //      失败侧 = 旧形态（核闩 getAgent 两支自静默）：零行、零事件、永不取件。 ──
  const clearBlocked = await b.ask({ op: "tick" }) // 门开一拍 ⇒ 上一段留的受阻计时归零（不从旧账续算）
  assert.deepEqual(clearBlocked.lines, [], "清账拍零行")
  const sent6 = await a.ask({ op: "send", target: initB.sessionId, text: "第六条：载体不就绪" })
  assert.equal(sent6.ok, true)
  await b.ask({ op: "ready", v: false })
  const carrierStart = await b.ask({ op: "tick" })
  assert.deepEqual(carrierStart.took, [], "载体不就绪 ⇒ 零取件")
  assert.equal(carrierStart.turns, 4, "载体不就绪 ⇒ 不起轮")
  assert.deepEqual(carrierStart.lines, [], "起算那一拍不跨阈 ⇒ 零行")
  assert.equal(carrierStart.armed, 1, "载体不就绪不撤闩：闩仍在位（旧形态不武装 ⇒ 这里读 0，连拍都没有）")
  assert.deepEqual(inboxB(), [`${sent6.receipt.requestId}.json`], "零取件 ⇒ 消息仍在盘上")
  await b.ask({ op: "advance", ms: step })
  const carrierBlocked = await b.ask({ op: "tick" })
  assert.deepEqual(
    carrierBlocked.lines,
    [`[cross-instance message · pickup blocked ${step}ms: 1 pending]`],
    "载体不就绪跨阈 ⇒ 同一条受阻行（两因共用一条逐字行 —— D-MI35）",
  )
  assert.equal(carrierBlocked.turns, 4, "受阻不取件 ⇒ 不起轮")
  assert.equal(carrierBlocked.armed, 1, "受阻一拍之后闩仍在位")
  const blockedLog = (() => {
    const dir = join(root, "logs")
    const raw = readdirSync(dir).filter((n) => n.endsWith(".log")).map((n) => readFileSync(join(dir, n), "utf8")).join("\n")
    return raw.split("\n").filter(Boolean).map((l) => { try { return JSON.parse(l) } catch { return null } })
      .filter((e) => e?.ev === "ev:inbox-watch-blocked")
  })()
  const carrierLogs = blockedLog.filter((e) => e.reason === "carrier")
  assert.equal(carrierLogs.length, 1, "不就绪跨阈：日志恰一条且 reason = carrier")
  assert.equal(carrierLogs[0].pending, 1)
  assert.equal(blockedLog.filter((e) => e.reason === "busy").length, 1, "在飞那一支的 reason = busy（同一条行、两种诊断）")
  await b.ask({ op: "ready", v: true })
  const carrierRecovered = await b.ask({ op: "tick" })
  assert.equal(carrierRecovered.turns, 5, "ready 转真 ⇒ 下一拍取件恰一次、起轮恰一次（闩从未撤）")
  assert.equal(carrierRecovered.took.length, 1)
  assert.deepEqual(carrierRecovered.lines, [], "取件成功 ⇒ 零行")
  assert.deepEqual(inboxB(), [], "取走后零残留")

  // ── 末段（异常）：目标不可达 ⇒ 当面报错点名，不落待取队列 ──
  const missing = await a.ask({ op: "send", target: "999999-1-nope", text: "x" })
  assert.equal(missing.ok, false)
  assert.equal(missing.error.code, "no-session")
  assert.match(missing.error.message, /999999-1-nope/)
  assert.match(missing.error.message, /headless/)
  const goneDir = join(root, "inbox", "999999-1-nope")
  const leftovers = (() => { try { return readdirSync(goneDir) } catch { return [] } })()
  assert.deepEqual(leftovers, [], "失败面盘上零残留（不落待取队列）")
  const raw = readFileSync(join(root, "instances", `${initA.sessionId}.json`), "utf8")
  assert.equal(JSON.parse(raw).sessionId, initA.sessionId, "名册条目仍在盘（发送失败不动名册）")
})
