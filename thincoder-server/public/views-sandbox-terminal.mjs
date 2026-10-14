/**
 * views-sandbox-terminal.mjs — 终端窗·控制台消费件（`webui/SANDBOX.md` §2.1①「终端」∥ `webui/TERMINAL.md` §2.1/§2.6——
 * 终端核三件本期唯一落地点；sandbox-container-terminal 批——台账 #1374）：
 * 壳 = `modal.mjs`（大窗类 `.terminal-modal`）∥ 终端面 = 终端核渲染（`terminal-core.mjs` + 拆出 `terminal-vt.mjs`/`terminal-codec.mjs` ∥
 * `terminal-render.mjs` ∥ `terminal-link.mjs`——实施实读越 500 软线按职责拆，`webui/TERMINAL.md` §3）∥
 * 状态行四态（连接中 ∥ 已连接 `{cols}×{rows}` ∥ 已断开 ∥ 会话已结束（退出码 `{code}`））∥ 脚区「重新连接」钮（断开态显——
 * 重连 = 新会话）∥ 窗内说明行（Esc 不关窗/断开语义）∥ i18n `admin.sandbox.terminal*` ∥ 关窗 ⇒ 会话收口（客户端关 WS——
 * 服务端三件归其收口，`sandbox/SANDBOX.md` §3）∥ **Esc 不关窗**（`dialog` `cancel` 事件 `preventDefault`——唯一与弹窗族
 * 偏离点，理由在册：终端要用 Esc）∥ 同容器窗单例（再点 ⇒ 复用当前窗）。
 * 入口 = 容器行第七钮（门 = 运行中；行闩——`views-sandbox-containers.mjs`）；in-band 四码 ⇒ 窗内人话（不关窗）。
 */
import { t } from "./i18n.mjs"
import { openModal } from "./modal.mjs"
import { createTerminal } from "./terminal-core.mjs"
import { createTerminalView } from "./terminal-render.mjs"
import { createTerminalLink } from "./terminal-link.mjs"

/** 初值尺寸（服务端初值同值——就绪前的那一枚 `resize` 由服务端挂起、就绪后施加；`sandbox/SANDBOX.md` §3 尺寸口径）。 */
const DEFAULT_COLS = 80
const DEFAULT_ROWS = 24

/** in-band 四码 ⇒ 文案键（`sandbox/SANDBOX.md` §3；未知码 ⇒ 原码兜底——零新语义）。 */
const ERROR_KEYS = {
  container_not_running: "admin.sandbox.terminalErrNotRunning",
  engine_unreachable: "admin.sandbox.terminalErrUnreachable",
  exec_failed: "admin.sandbox.terminalErrExecFailed",
  session_closed: "admin.sandbox.terminalErrClosed",
}

/** 同容器窗单例槽（再点 ⇒ 复用当前窗；在场会话归本槽持有）。 */
let active = null

/** WS 端点（`gateway/API.md` §2.5 末行——同源升级路；随页面协议取 ws/wss）。 */
function terminalUrl(runner, container) {
  const url = new URL(`/api/admin/sandbox/runners/${runner.id}/containers/${container.id}/terminal`, globalThis.location?.href ?? "http://localhost/")
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:"
  return url.href
}

/**
 * 开终端窗（容器行第七钮——`ctx` 视图上下文；`runner`/`container` = 容器行两件）⇒ 窗句柄。
 * 关窗（任意路径：× ∥ 「关闭」∥ 路由切换清单例）⇒ 会话收口；`Esc` 被 `cancel` 面拦下（不关窗）。
 */
export function openTerminalModal(ctx, { runner, container }) {
  const { h } = ctx
  if (active !== null && active.runnerId === runner.id && active.containerId === container.id) {
    active.view.focus() // 同容器窗单例：复用当前窗
    return active.modal
  }

  const host = h("div") // 终端面（渲染件加 `.terminal-surface`——尺寸可测的挂载元素）
  const status = h("p", { class: "terminal-status", text: t("admin.sandbox.terminalConnecting") })
  const note = h("p", { class: "hint", text: t("admin.sandbox.terminalNote") })
  const reconnect = h("button", { type: "button", class: "tiny", hidden: true, text: t("admin.sandbox.terminalReconnect"), onclick: () => restart() })
  const modal = openModal({
    title: t("admin.sandbox.terminalTitle", { name: container.name }),
    body: h("div", {}, host, status, note),
    footer: h("div", { class: "row-form" }, reconnect, h("button", { type: "button", class: "tiny", text: t("common.close"), onclick: () => modal.close() })),
    onClose: () => teardown(),
  })
  modal.root.classList.add("terminal-modal") // 大窗类（§2.1①——壳归 `modal.mjs`，类随本件）
  modal.root.addEventListener("cancel", (event) => event.preventDefault()) // Esc 不关窗（终端要用 Esc——唯一偏离点）

  const term = createTerminal({ cols: DEFAULT_COLS, rows: DEFAULT_ROWS })
  const view = createTerminalView({
    host,
    term,
    onData: (bytes) => link?.send(bytes),
    onResize: (cols, rows) => link?.resize(cols, rows),
  })
  const slot = { runnerId: runner.id, containerId: container.id, modal, view }
  active = slot
  let link = null
  let ended = false // 会话已结束（退出码已到——状态行优先于「已断开」）
  let errorText = null // in-band 错误人话（窗内呈——不关窗）

  /** 建会话（首开与重连同径——重连 = 新会话，无重放）。 */
  function start() {
    ended = false
    errorText = null
    status.textContent = t("admin.sandbox.terminalConnecting")
    reconnect.hidden = true
    link = createTerminalLink({
      url: terminalUrl(runner, container),
      term,
      onData: () => { view.toBottom(); view.wake() },
      onReady: ({ cols, rows }) => { status.textContent = t("admin.sandbox.terminalConnected", { cols, rows }) },
      onExit: ({ code }) => {
        ended = true
        status.textContent = t("admin.sandbox.terminalExit", { code: code === null || code === undefined ? "—" : code })
        reconnect.hidden = false
        view.focus()
      },
      onError: ({ code }) => { errorText = ERROR_KEYS[code] !== undefined ? t(ERROR_KEYS[code]) : String(code ?? "") },
      onClose: () => {
        if (!ended) status.textContent = errorText === null ? t("admin.sandbox.terminalDisconnected") : `${t("admin.sandbox.terminalDisconnected")} · ${errorText}`
        reconnect.hidden = false
        view.focus()
      },
    })
    view.layout(true) // 首布局（`force`——每链首帧 `resize` 必发；建链期 ⇒ 挂起，`onopen` 首帧即发）
    view.focus()
  }

  /** 重连（新会话——旧会话先收口，屏清空）。 */
  function restart() {
    if (link !== null) link.close()
    link = null
    term.reset()
    view.wake()
    start()
  }

  /** 关窗收口（一次——`modal.mjs` 任意关闭路径同链）。 */
  function teardown() {
    if (active === slot) active = null
    if (link !== null) link.close()
    link = null
    view.dispose()
  }

  start()
  return modal
}
