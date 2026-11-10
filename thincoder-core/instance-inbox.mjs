/**
 * instance-inbox.mjs — 跨实例投递面**收件箱 + 可达性判定 + 发送工具**（MULTI-INSTANCE-COLLAB §5.3–§5.5）。
 *
 * inbox = `~/.thincoder/inbox/{sessionId}/{msgId}.json`，内容 `{ msgId, text, sentAt, re?, from: { sessionId, end, cwd } }`；
 * 原子写 = `writeSessionFile`（§4.4.1 同原语）。
 *
 * **取件口径 = 一次性**：取到即 `rename` → 删除；进程重启零重放；目标在取走前死掉的残留条目由扫描按
 * `INBOX_STALE_MS` 清理并记 `logEvent`，**不重投**——这就是「不落待取队列」的落地形态。
 *
 * **可达性 = 写前一次，四态全部当场报错点名**（D-MI26，与感知面 D-MI10 方向相反）：
 * 无此会话 ∥ dead ∥ unknown ∥ inbox 不可写。**判据三条 = 名册有条目 ∧ pid 活 ∧ inbox 目录可写**；
 * 两侧误判代价不同——感知面误保留 = 多一条噪音，投递面误送达 = 用户以为送到了而没人收（正是
 * 「不静默丢」要防的）⇒ 本面只接受「确认可达」，未知不当可达。
 *
 * **本面不判身份族**（D-MI26）：消息落在 `~/.thincoder/inbox/{sessionId}/`，目标按目录名取件、不按 pid
 * 认人 ⇒ pid 认错也发不歪（不会投错会话）。身份族核查是**感知面**防误报的规则（F-MI6）——投递面
 * 没有那个失败模式，而那道关卡会把走查实例 / 非标准启动形态的合法目标挡在门外。代价面 = pid 被无关
 * 进程复用时本面判据照样通过：消息落进无人取的 inbox，条目在世判据（`sweepInbox`）让它不被按龄清掉，
 * 至多留到那个进程退出，之后按 `INBOX_STALE_MS` 清扫并记 `logEvent`（不重投）。
 *
 * `re` 只用来对账（D-MI27 / D-MI30）：本面**不保存已发请求登记表**，收到一个本端不认识的 `re` 时按普通
 * 回程消息原样注入（不改写、不报错、不丢弃——处置在取件面）。形不合（非字符串 / 空串 / 超长）拒发点名，
 * 与另两参同一口径：不静默丢弃一个坏值。
 */
import { readdirSync, renameSync, readFileSync, statSync, unlinkSync } from "node:fs"
import { join } from "node:path"
import { randomBytes } from "node:crypto"
import { configDir } from "./config-io.mjs"
import { writeSessionFile, getSessionId, sessionEnd } from "./session-slots.mjs"
import { batchAliveAsync } from "./process-probe.mjs"
import { logEvent, errText } from "./log.mjs"
import { readInstanceEntry, peerMessageSeams } from "./instance-registry.mjs"
import { DESC } from "./tools/shared.mjs" // #15 描述外置：文本单点 = tool-docs/instance_send.md

/** 残留条目上限（毫秒）：超过一天且目标**已不在世**（名册无条目 ∨ pid 明确已死）⇒ 判残留删之；
 *  目标仍活（或探测未知）⇒ 不动——条目本身就是「已投递、尚未被取」的正态，不是残留（§5.4）。 */
export const INBOX_STALE_MS = 24 * 60 * 60 * 1000

/** `re` 形态上界（字符——§5.2）。形不合即拒并点名 `re`，不与另两参两套口径。 */
export const MAX_RE_LEN = 128

/** 收件箱根目录（缝外 = `~/.thincoder/inbox`）。 */
let _dirOverride = null
export function _setInboxDirForTest(dir) { _dirOverride = dir }
export function _resetInboxDirForTest() { _dirOverride = null }
export function inboxRoot() { return _dirOverride ?? join(configDir, "inbox") }
export function inboxDir(sessionId) { return join(inboxRoot(), sessionId) }

/** 投递失败（业务失败结果——调用面须原样呈现，不得吞成空结果）：`code` = 四态之一 ∥ 入参拒绝。 */
export class InstanceSendError extends Error {
  constructor(code, message) {
    super(message)
    this.name = "InstanceSendError"
    this.code = code
  }
}

/** 消息 id 形态：`<epochMs>-<pid>-<rand6>`（= 回执 `requestId`，同一枚 id 不造第二枚）。 */
function makeMsgId(now) {
  return `${now}-${process.pid}-${randomBytes(3).toString("hex")}`
}

/** 目标可达性四态判定（§5.5 表）——**写前一次**；通过即返回名册条目，否则抛 `InstanceSendError`。
 *  本面判到「在册 ∧ pid 活」为止（第三条 `inbox 目录可写` 由写面自己判——写到那一步才知道）；
 *  **零命令行探测**（§5.5「本面不判身份族」）：pid 只答「还在不在」，不答「是不是我们」。 */
async function assertReachable(sessionId) {
  const entry = readInstanceEntry(sessionId)
  if (!entry) {
    throw new InstanceSendError("no-session",
      `instance_send: no session "${sessionId}" — no instance is registered under that id. `
      + "A session only registers when it has a pickup face; a headless session (one-shot chat / ACP / direct runAgent) never does, so it cannot receive messages. "
      + "Pick another sessionId from instance_list.")
  }
  const seams = peerMessageSeams()
  const aliveFn = seams.aliveFn ?? batchAliveAsync
  const aliveSet = await aliveFn([entry.pid])
  if (!(aliveSet instanceof Set)) {
    throw new InstanceSendError("unknown",
      `instance_send: cannot confirm target "${sessionId}" (pid ${entry.pid}) is reachable — the liveness probe failed. `
      + "An unverified target does not count as reachable (nothing was sent). Pick another sessionId or retry.")
  }
  if (!aliveSet.has(entry.pid)) {
    throw new InstanceSendError("dead",
      `instance_send: target "${sessionId}" (pid ${entry.pid}) has exited — the message was not sent. Pick another sessionId from instance_list.`)
  }
  return entry
}

/**
 * 发送一条跨实例消息（非阻塞 · D-MI27）：可达性判定 + inbox 原子写即返回，不等对端读、不等对端答。
 * @param {{ sessionId: string, text: string, re?: string }} args  — `sessionId` / `text` 无缺省值（缺参即拒并点名参数）
 * @param {{ cwd?: string }} [opts]
 * @returns {Promise<{ requestId: string, target: { sessionId: string, end: string|null }, status: "delivered-to-inbox" }>}
 * @throws {InstanceSendError} 入参拒绝 ∥ 四态之一（业务失败结果，点名目标与原因）
 */
export async function sendMessage({ sessionId, text, re } = {}, { cwd = null } = {}) {
  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new InstanceSendError("bad-params", "instance_send: missing parameter `sessionId` — pass the target session id (see instance_list). No default is applied.")
  }
  if (typeof text !== "string" || text === "") {
    throw new InstanceSendError("bad-params", "instance_send: missing parameter `text` — pass the message body. No default is applied.")
  }
  if (re !== undefined && re !== null) {
    if (typeof re !== "string" || re === "" || re.length > MAX_RE_LEN) {
      throw new InstanceSendError("bad-params",
        `instance_send: parameter \`re\` is malformed — expected a non-empty string of at most ${MAX_RE_LEN} chars (omit it for a first message). Nothing was sent.`)
    }
  }
  const entry = await assertReachable(sessionId)
  const now = (peerMessageSeams().nowFn ?? Date.now)()
  const msgId = makeMsgId(now)
  const payload = {
    msgId,
    text,
    sentAt: now,
    ...(typeof re === "string" ? { re } : {}),
    from: { sessionId: getSessionId(), end: sessionEnd(), cwd: typeof cwd === "string" ? cwd : "" },
  }
  try {
    writeSessionFile(join(inboxDir(sessionId), `${msgId}.json`), payload)
  } catch (e) {
    throw new InstanceSendError("inbox-unwritable",
      `instance_send: target "${sessionId}" inbox is not writable — ${errText(e, 200)}. Nothing was sent. `
      + "Pick another sessionId from instance_list.")
  }
  return { requestId: msgId, target: { sessionId, end: entry.end ?? null }, status: "delivered-to-inbox" }
}

/**
 * 取件（**一次性**）：本会话 inbox 下全部 `*.json` 逐条 `rename` → 读 → 删；返回消息数组（按 id 时序）。
 * `rename` 是取件权的唯一闸（并发两取件只有一个 rename 成功）⇒ 进程重启零重放、二次取件零命中。
 * 损坏条目：删 + `logEvent`（不重投、不阻塞后续条目）。
 */
export function takeInbox(sessionId = getSessionId()) {
  const dir = inboxDir(sessionId)
  let names
  try { names = readdirSync(dir) } catch { return [] } // 目录未生 ⇒ 零件
  const taken = []
  for (const name of names.filter((n) => n.endsWith(".json")).sort()) {
    const src = join(dir, name)
    const dst = `${src}.taken`
    try { renameSync(src, dst) } catch { continue } // 已被取走 ⇒ 跳过（一次性，不重取）
    let msg = null
    try { msg = JSON.parse(readFileSync(dst, "utf8")) } catch { msg = null }
    try { unlinkSync(dst) } catch { /* 删除失败：下次扫描按残留清理 */ }
    if (msg && typeof msg === "object" && typeof msg.text === "string") taken.push(msg)
    else logEvent("ev:inbox-bad", { session: sessionId, file: name })
  }
  return taken
}

/**
 * 残留清理（§5.4 / §5.6 失败可见）：遍历 inbox 根下各会话目录，删掉**超过 `INBOX_STALE_MS` 且目标已不在世**
 * 的条目并记 `logEvent`（不静默）。在世判据 = 名册有条目 ∧ pid 未明确为死；探测未知 ⇒ 保留（D-MI10 方向）。
 * 返回删除条数。调用点 = 取件面装配处（会话起点一次——不每秒扫根）。
 */
export async function sweepInbox() {
  const now = (peerMessageSeams().nowFn ?? Date.now)()
  let dirs
  try { dirs = readdirSync(inboxRoot(), { withFileTypes: true }) } catch { return 0 }
  const stale = []
  for (const d of dirs) {
    if (!d.isDirectory()) continue
    const dir = join(inboxRoot(), d.name)
    let names
    try { names = readdirSync(dir) } catch { continue }
    for (const name of names) {
      if (!name.endsWith(".json") && !name.endsWith(".taken")) continue // `.taken` = 取件删除失败留下的残留
      const p = join(dir, name)
      try {
        if (now - statSync(p).mtimeMs <= INBOX_STALE_MS) continue
      } catch { continue }
      stale.push({ sessionId: d.name, path: p })
    }
  }
  if (stale.length === 0) return 0
  const ids = [...new Set(stale.map((s) => s.sessionId))]
  const entries = new Map(ids.map((id) => [id, readInstanceEntry(id)]))
  const pids = [...new Set(ids.map((id) => entries.get(id)?.pid).filter((p) => Number.isInteger(p)))]
  const seams = peerMessageSeams()
  const aliveSet = pids.length > 0 ? await (seams.aliveFn ?? batchAliveAsync)(pids) : new Set()
  let removed = 0
  for (const s of stale) {
    const entry = entries.get(s.sessionId)
    const gone = !entry || (aliveSet instanceof Set && !aliveSet.has(entry.pid))
    if (!gone) continue // 在世 / 未知 ⇒ 保留（条目 = 已投递未取，不是残留）
    try {
      unlinkSync(s.path)
      removed += 1
      logEvent("ev:inbox-stale", { session: s.sessionId, file: s.path.slice(inboxRoot().length + 1) })
    } catch { /* 竞态（属主刚取走）⇒ 零动作 */ }
  }
  return removed
}

/** 写面工具（§5.2）：参数 `{ sessionId, text, re? }`——无缺省值；四态失败抛 `InstanceSendError`
 *  （dispatch 收成 `Error: …`、`ok:false`——业务失败可见，不吞成空结果）。 */
export const instanceSendTool = {
  name: "instance_send",
  description: DESC("instance_send"),
  parameters: {
    type: "object",
    properties: {
      sessionId: { type: "string", description: "Target session id from instance_list (no default — the call is refused without it)." },
      text: { type: "string", description: "The message body to deliver into that instance's session (no default)." },
      re: { type: "string", description: "Optional requestId this message answers (from the receipt of the original send). Form: non-empty string, at most 128 chars. Omit for a first message." },
    },
    required: ["sessionId", "text"],
  },
  readonly: false,
  async execute(args, ctx) {
    const receipt = await sendMessage(
      { sessionId: args?.sessionId, text: args?.text, re: args?.re },
      { cwd: ctx?.cwd },
    )
    return JSON.stringify(receipt, null, 2)
  },
}
