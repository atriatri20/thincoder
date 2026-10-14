/**
 * views-me-sandbox.mjs — 我的·工作区（webui/SANDBOX.md §2.2——`#/me/sandbox`；sandbox-outbound-member-face 批；台账 #1233①/#1234）：
 * 页题 + 表五列（名 ∥ 盒状态（运行中/已停 + 回收原因）∥ 快照数 ∥ 所属 runner ∥ 待批）+ 空态；**零写控件**
 * （成员写面随 #1216 ②——本页只读）。
 *
 * 待批发起方提示（判定单源 = `sandbox/SANDBOX.md` §8——文案 ∥ 出现/消失条件 ∥ 零静默）：`pending` 在场 ⇒ 行内可见提示
 * 「等待管理员批准：<host>…」；待批在场期间 10s 读时轮询（`PENDING_POLL_MS`）——裁定/超时 ⇒ 提示自动消失 + 停排（不残留）。
 * 缺值面不假造：非契约内 ∥ 缺位字段一律取中性占位（「—」），不代断言业务值。
 * 数据面 = `GET /api/me/sandbox/workspaces`（契约 = `gateway/API.md` §2.7——恒本人过滤在服务端；`runnerName` 未绑定 ⇒ 「未绑定」）；
 * `sandbox_unavailable`（503——无可用节点）∥ 数据面缺位（404——服务端未就绪）⇒ 页内提示（沿 admin 面口径）。
 * 渲染一律节点 + textContent（零拼串）；文案经 `t()` 取值（`webui/I18N.md` §2.1）；轮询离页/重渲自停 = 渲染代际 + 挂载点存活判（沿 `views-sandbox.mjs` 先例）。
 */
import { t } from "./i18n.mjs"

/** 待批在场期间的读时轮询间隔（§2.2——裁定/超时 ⇒ 提示消失 + 停排；零后台常驻定时器）。 */
export const PENDING_POLL_MS = 10000

/** 盒状态文案键（运行中 ∥ 已停——枚举外 ⇒ 原值兜底）。 */
const STATE_KEYS = { running: "me.sandbox.stateRunning", stopped: "me.sandbox.stateStopped" }
/** 回收原因文案键（三值——`stopReason`：空闲/TTL 墙钟/手动；枚举外 ⇒ 原值兜底）。 */
const STOP_KEYS = { idle_ttl: "me.sandbox.stopIdle", wallclock_ttl: "me.sandbox.stopWallclock", manual: "me.sandbox.stopManual" }

/** 渲染代际（重渲/离页 ⇒ 旧轮询环自停——零全局清理钩子）。 */
let pollGeneration = 0

/** 盒状态文案（纯函数——枚举外原值兜底；单测直测）。 */
export function boxStateLabel(state) {
  const key = STATE_KEYS[state]
  return key === undefined ? String(state ?? "—") : t(key)
}

/** 盒状态徽标类（运行中 ⇒ ok ∥ 已停 ⇒ off ∥ 枚举外 ⇒ 中性——零新颜色变量）。 */
export function boxStateClass(state) {
  if (state === "running") return "badge ok"
  if (state === "stopped") return "badge off"
  return "badge"
}

/** 回收原因文案（纯函数——枚举外原值兜底）。 */
export function stopReasonLabel(reason) {
  const key = STOP_KEYS[reason]
  return key === undefined ? String(reason ?? "—") : t(key)
}

/** 待批 host 单条（空 ∥ 缺 ∥ 非串 ⇒ `null`——提示行与待批列共用同一判据，两端同判）。 */
export function pendingHostOf(workspace) {
  const host = workspace?.pending?.host
  return typeof host === "string" && host !== "" ? host : null
}

/** 待批 host 清单（每工作区一条——非空者；零 pending ⇒ 空表 ⇒ 提示行隐）。 */
export function pendingHosts(workspaces) {
  return (workspaces ?? []).map((workspace) => pendingHostOf(workspace)).filter((host) => host !== null)
}

/** 数据面缺位 ∥ 不可用判据（503 `sandbox_unavailable` ∥ 404 —— server 面尚未落该端点）：两态同页内提示。 */
function dataFaceMissing(error) {
  return error?.code === "sandbox_unavailable" || error?.status === 404
}

/** 我的·工作区页（非壳页——数据量小；`SHELL_PAGES` 不动）。 */
export async function renderMeSandbox(ctx, mount) {
  const { h } = ctx
  const generation = ++pollGeneration
  const alertBox = h("div", { hidden: true })
  const tableBox = h("div", {}, h("p", { class: "hint", text: t("common.loading") }))
  let pollTimer = null

  /** 离页/重渲即停的存活判据（挂载点被换 ⇒ 停机；桩环境（无 isConnected）⇒ 视为存活）。 */
  const alive = () => generation === pollGeneration && mount.isConnected !== false

  /** 待批行（逐 pending 一条——一行可见提示；零 pending ⇒ 容器隐——不得静默）。 */
  const renderPending = (workspaces) => {
    const hosts = pendingHosts(workspaces)
    alertBox.replaceChildren(...hosts.map((host) => h("p", { class: "pending-line", text: t("me.sandbox.pending", { host }) })))
    alertBox.hidden = hosts.length === 0
  }

  /** 表五列（名 ∥ 盒状态 + 回收原因 ∥ 快照数 ∥ 所属 runner（未绑定 ⇒ 表句）∥ 待批）∥ 空态。 */
  const renderTable = (workspaces) => {
    tableBox.replaceChildren(workspaces.length === 0
      ? h("p", { class: "hint", text: t("me.sandbox.empty") })
      : ctx.table(
          [t("me.sandbox.colName"), t("me.sandbox.colState"), t("me.sandbox.colCheckpoints"), t("me.sandbox.colRunner"), t("me.sandbox.colPending")],
          workspaces.map((workspace) => {
            const host = pendingHostOf(workspace)
            return [
              String(workspace?.name ?? "—"),
              [h("span", { class: boxStateClass(workspace?.boxState), text: boxStateLabel(workspace?.boxState) }),
                workspace?.stopReason === null || workspace?.stopReason === undefined ? null : h("span", { class: "hint", text: stopReasonLabel(workspace.stopReason) })],
              String(workspace?.checkpointCount ?? "—"),
              workspace?.runnerName === null || workspace?.runnerName === undefined || workspace.runnerName === "" ? t("me.sandbox.unbound") : String(workspace.runnerName),
              host === null ? "—" : h("span", { class: "badge warn", text: host }),
            ]
          })))
  }

  /** 排下一轮（单链——待批在场才排；裁定/超时/离页 ⇒ 停）。 */
  const schedule = () => {
    if (!alive() || pollTimer !== null) return
    pollTimer = setTimeout(() => { pollTimer = null; load() }, PENDING_POLL_MS)
  }

  /** 取数 + 渲染（成 ⇒ 表/空态 + 提示行随 pending 在场/消失；败 ⇒ 页内提示 + `ctx.fail` 收口）。 */
  const load = async () => {
    if (!alive()) return
    try {
      const data = await ctx.api("/api/me/sandbox/workspaces")
      const workspaces = data?.workspaces ?? []
      renderPending(workspaces)
      renderTable(workspaces)
      if (pendingHosts(workspaces).length > 0) schedule()
    } catch (error) {
      ctx.fail(error)
      alertBox.replaceChildren()
      alertBox.hidden = true
      tableBox.replaceChildren(h("p", { class: "hint error", text: t(dataFaceMissing(error) ? "me.sandbox.unavailable" : "me.sandbox.loadFailed") }))
    }
  }

  mount.append(h("h2", { text: t("me.sandbox.title") }), h("section", { class: "card" }, alertBox, tableBox))
  await load()
}
