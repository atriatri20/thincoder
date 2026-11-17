/**
 * instance-registry.mjs — 跨实例投递面**名册**（MULTI-INSTANCE-COLLAB §5.2 · D-MI25 / D-MI28）。
 *
 * 名册 = `~/.thincoder/instances/{sessionId}.json`，内容 `{ sessionId, pid, end, cwd, startedAt, updatedAt }`；
 * 单写者 = 实例自身（end marker 同型）。**登记点 = 取件面装配处**：条目只在「本实例已装上取件闩」时写入——
 * 无取件面的会话（headless：`chat` 一次性 / ACP / 直连 `runAgent`）不入册：它取不走任何一条消息，
 * 列进名册只会骗发送方（D-MI28）。
 *
 * 为什么新建而不复用 `~/.thincoder/peers/`：peers 记录只在**写过文件**的回合落盘（§4.2 写点 = 回合级，
 * 「本回合无写入 → 不写」）⇒ 空闲实例根本不在其中，不能当名册。名册口径 =「有取件面 ⇒ 有条目」，
 * 与「写过什么」无关（D-MI25）。
 *
 * **跨仓可寻址** = 名册天然跨 cwd：`cwd` 是记录**字段**，不是目录键。`peer_instances` 的语义（同 cwd、
 * 白名单四键 `{pid, end, sessionId, slots}`）零改——两者不合并、不复述（N-MI4 白名单不动）。
 *
 * 三档共用一份注入面（§5.8）：注入对象住本档（`peerMessageSeams`），`_setPeerMessageTestImpl` 由
 * 取件闩档导出——本档为叶（零回引取件闩档），故注入态落在这里可免三档互引成环。
 */
import { existsSync, readdirSync, readFileSync, unlinkSync } from "node:fs"
import { join } from "node:path"
import { configDir } from "./config-io.mjs"
import { writeSessionFile, getSessionId, sessionEnd } from "./session-slots.mjs"
import { batchAliveAsync } from "./process-probe.mjs"
import { DESC } from "./tools/shared.mjs" // #15 描述外置：文本单点 = tool-docs/instance_list.md

/** 名册目录（缝外 = `~/.thincoder/instances`）。 */
let _dirOverride = null
export function _setInstanceDirForTest(dir) { _dirOverride = dir }
export function _resetInstanceDirForTest() { _dirOverride = null }
function instancesDir() { return _dirOverride ?? join(configDir, "instances") }

/** 三档共用注入面（§5.8）：名册 / inbox / 取件闩各取自己那几槽。
 *  四个槽 `{ nowFn, aliveFn, timer, clear }`，缺省 null = 生产实现（`Date.now` / 批量判活 / 平台定时器）。
 *  本面零命令行探测（「本面不判身份族」—— pid 只答「还在不在」）。 */
const _seams = { nowFn: null, aliveFn: null, timer: null, clear: null }
export function peerMessageSeams() { return _seams }
export function setPeerMessageSeams(next = {}) {
  for (const k of Object.keys(_seams)) _seams[k] = next[k] ?? null
}

function entryPath(sessionId) { return join(instancesDir(), `${sessionId}.json`) }

/** 读一条名册记录：缺失 / 损坏 ⇒ `null`（按缺失降级——与 manifest 同族）。 */
export function readInstanceEntry(sessionId) {
  if (typeof sessionId !== "string" || sessionId === "") return null
  const p = entryPath(sessionId)
  try {
    if (!existsSync(p)) return null
    const e = JSON.parse(readFileSync(p, "utf8"))
    if (!e || typeof e !== "object") return null
    if (typeof e.sessionId !== "string" || e.sessionId === "") return null
    if (!Number.isInteger(e.pid)) return null
    return e
  } catch { return null }
}

/** 盘上全部名册记录（`[{ path, entry }]`；损坏 / 畸形条目跳过——不删，属主下次登记覆盖）。 */
function readAllEntries() {
  let names
  try { names = readdirSync(instancesDir()) } catch { return [] }
  const out = []
  for (const name of names) {
    if (!name.endsWith(".json")) continue
    const entry = readInstanceEntry(name.slice(0, -".json".length))
    if (entry) out.push({ path: join(instancesDir(), name), entry })
  }
  return out
}

/**
 * 登记本实例（会话起点 · 幂等 upsert）：`startedAt` 保留首次登记刻（重复调用不重置），
 * `updatedAt` = 本次时刻。返回写入的记录。
 */
export function registerInstance({ cwd = null } = {}) {
  const now = (_seams.nowFn ?? Date.now)()
  const sessionId = getSessionId()
  const prev = readInstanceEntry(sessionId)
  const entry = {
    sessionId,
    pid: process.pid,
    end: sessionEnd(),
    cwd: typeof cwd === "string" ? cwd : "",
    startedAt: Number.isFinite(prev?.startedAt) ? prev.startedAt : now,
    updatedAt: now,
  }
  writeSessionFile(entryPath(sessionId), entry)
  return entry
}

/** 刷新本实例条目（回合收尾同点调用——`updatedAt` 走时）。**条目不在册 ⇒ 零动作**：
 *  入册只发生在取件面装配处（D-MI28）——收尾刷新顺手把 headless 会话拉进名册，正是「骗发送方」那条。 */
export function refreshInstance({ cwd = null } = {}) {
  const sessionId = getSessionId()
  const prev = readInstanceEntry(sessionId)
  if (!prev) return null
  const entry = {
    ...prev,
    end: sessionEnd(),
    cwd: typeof cwd === "string" ? cwd : (prev.cwd ?? ""),
    updatedAt: (_seams.nowFn ?? Date.now)(),
  }
  writeSessionFile(entryPath(sessionId), entry)
  return entry
}

/** 删本实例条目（正常退出 / 面板销毁）。缺失 ⇒ 幂等零动作。 */
export function unregisterInstance(sessionId = getSessionId()) {
  try { unlinkSync(entryPath(sessionId)); return true } catch { return false }
}

/**
 * 机器级**可投递**实例清单（`instance_list` 的数据面 · self 已排除）。**纯只读**——本面不删任何条目
 * （`instance_list` 是 `readonly: true` 的免审批读面；一个声明只读的工具不得删别人盘上的文件）。
 * 死条目清理住 `sweepInstances()`（会话起点一次，由取件面装配处调）。
 *
 * 判活一次批量（D-MI3 成本纪律：≤1 批量判活，零逐 pid exec）。本面**零命令行探测**（不判身份族）。
 * 两态处理：
 * - **判活探测失败**（`null` = 未知）⇒ 不列（未知 ≠ 活）；
 * - **pid 明确不在** ⇒ 不列。
 * **不判身份族**（D-MI26）：列面与发面同一把尺的射程 =「在册 ∧ pid 活」——一处藏一处收会变成
 * 「列表藏起来的目标、发送面其实收得」，拒收就落在了读面；`inbox 目录可写` 不在列面判（列面试写
 * 就是写——一个 `readonly: true` 的免审批读面不写盘）。
 */
export async function listLiveInstances() {
  const self = getSessionId()
  const others = readAllEntries().filter((e) => e.entry.sessionId !== self)
  if (others.length === 0) return []
  const aliveFn = _seams.aliveFn ?? batchAliveAsync
  const aliveSet = await aliveFn([...new Set(others.map((e) => e.entry.pid))])
  if (!(aliveSet instanceof Set)) return [] // 探测失败 ⇒ 零可投递（不列幽灵）
  const out = []
  for (const e of others) {
    if (!aliveSet.has(e.entry.pid)) continue // pid 明确不在 ⇒ 不可投递
    out.push({ sessionId: e.entry.sessionId, end: e.entry.end ?? null, cwd: e.entry.cwd ?? "", pid: e.entry.pid })
  }
  out.sort((a, b) => a.pid - b.pid || (a.sessionId < b.sessionId ? -1 : a.sessionId > b.sessionId ? 1 : 0))
  return out
}

/** 名册条目超龄上界（毫秒）：判活结果**明确为死** ∧ 条目本身已超此龄 ⇒ 判残留（见 `sweepInstances`）。
 *  单纯「超龄」不是残留判据：一个空闲但活着的实例可能长期不刷 `updatedAt` —— 与 D-MI10 同向保守。 */
export const INSTANCE_STALE_MS = 24 * 60 * 60 * 1000

/**
 * 名册死条目清扫（**写面**——会话起点一次，由取件面装配处调；`instance_list` 零删）。
 * 只有两条件同时成立才删：①判活**明确**为死（探测失败 / 未知 ⇒ 保留）；②条目超 `INSTANCE_STALE_MS`。
 * 第二条是给「探测成功但漏读一个 pid」这条已知失败面留的余地——误删一个活实例的条目会让它此后
 * 被按「无此会话」拒收，直到重启（入册只在装配处一次，`refreshInstance` 不重建），代价不对称。
 * 返回删除条数。
 */
export async function sweepInstances() {
  const self = getSessionId()
  const now = (_seams.nowFn ?? Date.now)()
  const entries = readAllEntries().filter((e) => e.entry.sessionId !== self)
  if (entries.length === 0) return 0
  const aliveFn = _seams.aliveFn ?? batchAliveAsync
  const aliveSet = await aliveFn([...new Set(entries.map((e) => e.entry.pid))])
  if (!(aliveSet instanceof Set)) return 0 // 未知 ≠ 死（D-MI10）
  let removed = 0
  for (const e of entries) {
    if (aliveSet.has(e.entry.pid)) continue
    const updatedAt = Number.isFinite(e.entry.updatedAt) ? e.entry.updatedAt : 0
    if (now - updatedAt <= INSTANCE_STALE_MS) continue // 明确死但未超龄 ⇒ 先留着（宁可多留一回合）
    try { unlinkSync(e.path); removed += 1 } catch { /* 竞态（属主刚删）⇒ 零动作 */ }
  }
  return removed
}

/** 只读工具面（§5.2）：机器级可投递实例——字段四键 `{ sessionId, end, cwd, pid }`，self 已排除。
 *  description 文本单点 = `tool-docs/instance_list.md`（DESC 加载；缺档即抛——契约 9）。 */
export const instanceListTool = {
  name: "instance_list",
  description: DESC("instance_list"),
  parameters: { type: "object", properties: {} },
  readonly: true,
  async execute() {
    return JSON.stringify(await listLiveInstances(), null, 2)
  },
}
