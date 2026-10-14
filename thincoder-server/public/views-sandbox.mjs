/**
 * views-sandbox.mjs — 管理·沙盒页（webui/SANDBOX.md §2.1①——`#/admin/sandbox`）：**两标签**（console-tabs-component 批——
 * 「运行面」∥「镜像与镜像源」；公共件 = `tabs.mjs`；机制全文 = `webui/TABS.md` §2.2；子段形 `#/admin/sandbox/<tab>`）——
 * 标签① = 可用性提示 ∥ 节点表（节点行展开 ⇒ 容器区 + 卷区——懒加载；件 = `views-sandbox-containers.mjs`（sandbox-docker-admin 批外拆）∥ `views-sandbox-volumes.mjs`（sandbox-volumes 批）
 * ∥ 添加/删除节点弹窗 ∥ 托管接入（弹窗（八字段 + S5 预告知句）∥ 装机任务区（三态 + 步骤读数展开 + keep 态「撤销凭据」钮；在途 3s
 * 读时轮询、定终态停）∥ 节点行「SSH 凭据」动作（admin-chat-creds-merge 批——弹窗件 = `host-credential.mjs`（与对话页会话条钮**同件**）；KD-SV-134）
 * ∥ 节点行「连接」动作（sandbox-exec-rebuild 批 · 增补 #2——连接方式编辑；件 = `views-sandbox-connection.mjs`；行地址列附 scheme 派生徽标（http/https））
 * ∥ 添加节点弹窗连接段（同件——缺省档不携键））；标签② = 镜像卡（节点选单 ⇒ 该节点镜像表；件 = `views-sandbox-images.mjs`）+ 镜像源卡（sandbox-image-sources 批——
 * 全局面；件 = `views-sandbox-image-sources.mjs`；一键拉取 = sandbox-image-quick-pull 批——拉取成 ⇒ `onPulled` 回调重取镜像表）+ 底座卡 + 私有仓凭据卡（sandbox-exec-rebuild 批 · 修订轮——
 * 底座可换；件 = `views-sandbox-base.mjs`）。
 * 契约 = gateway/API.md §2.5；判权全在后端（服务端 403 为准）；渲染一律节点 + textContent（零拼串）；文案经 `t()` 取值（`webui/I18N.md` §2.1）；
 * 窗体助手四件住 `modal.mjs`（`showNote`/`field`/`submitThen`/`confirmModal`）。
 * 单元测试档直测面 = `renderSandbox`（桩 ctx + 假 fetch 路由表 ∥ 子段 ∥ 两面板划分）∥ `TASK_POLL_MS`/`runStateLabel` ∥ `containerStateLabel`（re-export——容器件单源）。
 */
import { mapError, t } from "./i18n.mjs"
import { confirmModal, field, openModal, showNote, submitThen } from "./modal.mjs"
import { openHostCredentialModal } from "./host-credential.mjs"
import { createTabs } from "./tabs.mjs"
import { deriveModels } from "./views-models.mjs"
import { createContainerSection, createVolumeSection } from "./views-sandbox-containers.mjs"
import { createImageSection } from "./views-sandbox-images.mjs"
import { createImageSourceSection } from "./views-sandbox-image-sources.mjs"
import { connectionSchemeOf, createConnectionSection, openConnectionModal } from "./views-sandbox-connection.mjs"
import { createBaseSection } from "./views-sandbox-base.mjs"

/** 容器态文案（re-export——单源住 `views-sandbox-containers.mjs`；沿旧导出面）。 */
export { containerStateLabel } from "./views-sandbox-containers.mjs"

/** 在途装机任务的读时轮询间隔（§2.8①——定终态停；无后台常驻定时器）。 */
export const TASK_POLL_MS = 3000

/** 装机终态集（轮询停点）：成功三形 ⇒「已就绪」∥ 余（`failed` ∥ `interrupted`）⇒「失败」；不在集内 ⇒ 在途「装机中」。 */
const RUN_READY = new Set(["ready", "done", "succeeded"])
const RUN_TERMINAL = new Set([...RUN_READY, "failed", "interrupted"])

/** 渲染代际（重渲/离页 ⇒ 旧轮询环自停——零全局清理钩子）。 */
let pollGeneration = 0

/** 装机态文案（三态——§2.8①：装机中 ∥ 已就绪 ∥ 失败；枚举外视为在途）。 */
export function runStateLabel(status) {
  if (RUN_READY.has(status)) return t("admin.sandbox.stateReady")
  if (RUN_TERMINAL.has(status)) return t("admin.sandbox.stateFailed")
  return t("admin.sandbox.stateInstalling")
}

/** 装机态徽标类（三态同源：成功 ⇒ ok ∥ 终态失败 ⇒ off ∥ 在途 ⇒ 中性）。 */
function runStateClass(status) {
  if (RUN_READY.has(status)) return "badge ok"
  if (RUN_TERMINAL.has(status)) return "badge off"
  return "badge"
}

/** 集内切换（展开/收起）。 */
function toggleIn(set, key) {
  if (set.has(key)) set.delete(key)
  else set.add(key)
}

/** 步骤读数行（对象 ⇒ `键：值` 逐键 ∥ 数组 ⇒ 逐项 ∥ 字符串 ⇒ 原样；空值略过——服务端读数形：`{ host, sshUser, result, summary, reason, … }`）。 */
function readingLines(readings) {
  if (typeof readings === "string") return readings === "" ? [] : [readings]
  if (Array.isArray(readings)) return readings.filter((item) => item !== null && item !== undefined && item !== "").map((item) => (typeof item === "object" ? JSON.stringify(item) : String(item)))
  if (readings === null || readings === undefined || typeof readings !== "object") return []
  return Object.entries(readings).filter(([, value]) => value !== null && value !== undefined && value !== "").map(([key, value]) => `${key}: ${typeof value === "object" ? JSON.stringify(value) : String(value)}`)
}

/** 步骤项（步骤名取读：`id` ⇒ `name`/`step` ⇒ 字符串原样；`note` 附着；读数 = 子清单）。 */
function stepItem(h, entry) {
  const name = typeof entry === "string" ? entry : String(entry?.id ?? entry?.name ?? entry?.step ?? "—")
  const lines = readingLines(entry?.readings)
  return h("li", {}, typeof entry?.note === "string" && entry.note !== "" ? `${name} — ${entry.note}` : name, ...(lines.length === 0 ? [] : [h("ul", {}, ...lines.map((line) => h("li", { class: "hint", text: line })))]))
}

/** 管理·沙盒页（非壳页——卡多；console-tabs-component 批：两标签——`sub` = 地址栏子段（不认 ⇒ 首标签回落））。 */
export async function renderSandbox(ctx, mount, sub = null) {
  const { h } = ctx
  const generation = ++pollGeneration
  const expandedNodes = new Set() // 展开的节点 id（容器区懒加载）
  const expandedTasks = new Set() // 展开的装机任务 id
  const detailCache = new Map() // 任务 id ⇒ { step, steps }（步骤读数在详情面——列表携步骤无读数，§2.5）
  const containers = createContainerSection(ctx) // 容器区件（本批外拆——§2.8①）
  const images = createImageSection(ctx), volumes = createVolumeSection(ctx) // 镜像区件（本批外拆——§2.8①；console-tabs-component 批迁标签②）∥ 卷区件（sandbox-volumes 批——节点展开内、容器区之后）
  let runners = [] // 节点清单（**页级单源——两面板共读**；读势 = `runnersPhase`）
  let runs = []
  let pollTimer = null
  let runnersPhase = "loading" // loading ∥ ready ∥ failed（读势单源——面板建时按态渲）
  let tasksPhase = "loading"
  let imageNodeId = null // 标签②节点选单当刻值（缺省 ⇒ 首节点；换选 ⇒ 该节点镜像表重取）
  const panels = { runners: false, images: false } // 面板建后标志（懒建——首激活建；未建 ⇒ 免渲）
  const started = { runners: false, tasks: false } // 数据触发（首激活面板触发读取——webui/TABS.md §2.2 读时口径）

  /** 离页/重渲即停的存活判据（挂载点被换 ⇒ 停机；桩环境（无 isConnected）⇒ 视为存活）。 */
  const alive = () => generation === pollGeneration && mount.isConnected !== false

  mount.append(h("h2", { text: t("admin.sandbox.title") }))
  const alert = h("p", { class: "hint error", hidden: true })
  const listBox = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  const taskBox = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  const nodeSelect = h("select") // 标签②节点选单（全部注册节点——在线/离线皆列）
  const imageBox = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  // 标签①运行面（卡壳保留——岔口㈡ 裁定；卡题去重：面题入标签 ⇒ h3 去；h4 装机任务保留）
  const runnerPanel = h("section", { class: "card" },
    h("div", { class: "info-actions" },
      h("button", { type: "button", text: t("admin.sandbox.addRunner"), onclick: () => openAddRunnerModal(ctx, { reload: loadRunners }) }),
      h("button", { type: "button", class: "tiny", text: t("admin.sandbox.onboardingBtn"), onclick: () => openOnboardingModal(ctx, { reload: loadTasks }) })),
    alert,
    listBox,
    h("h4", { text: t("admin.sandbox.tasksTitle") }),
    taskBox)
  // 标签②镜像与镜像源（镜像卡 h3 = imagesTitle——区题行已去重；镜像源卡随建随读）
  const imagePanel = h("div", {},
    h("section", { class: "card" }, h("h3", { text: t("admin.sandbox.imagesTitle") }), field(h, "admin.sandbox.imageNode", nodeSelect), imageBox))
  nodeSelect.addEventListener("change", () => {
    imageNodeId = nodeSelect.value
    const runner = imageRunner()
    if (runner !== null) images.reset(runner) // 换选 ⇒ 该节点镜像表重取（失缓存）
    renderImages()
  })

  const tabs = createTabs(ctx, {
    tabs: [
      { id: "runners", labelKey: "admin.sandbox.runnersTitle", build: buildRunnerPanel },
      { id: "images", labelKey: "admin.sandbox.tabImages", build: buildImagePanel },
    ],
    initial: sub,
    onChange: (id) => { history.replaceState(null, "", `#/admin/sandbox/${id}`) }, // 地址栏径（不触发 hashchange——零重渲）
  })
  mount.append(tabs.root)

  // ── 标签建（懒——首激活一次；数据随建读）──────────────────────────────────────

  /** 标签①建：触发页级读取 + 现态渲（节点表 ∥ 装机任务）。 */
  function buildRunnerPanel() {
    panels.runners = true
    startRunners()
    startTasks()
    renderNodes()
    renderTasks()
    return runnerPanel
  }

  /** 标签②建：镜像源卡随建（夹带读）+ 节点选单 ∥ 镜像区现态渲。 */
  function buildImagePanel() {
    panels.images = true
    startRunners() // 节点清单 = 页级单源（先到者触发——只取一次）
    imagePanel.append(createImageSourceSection(ctx, { onPulled: (runner) => { images.reset(runner); loadRunners() } }).card) // 镜像源卡（全局面，非按节点）；一键拉取成 ⇒ 该节点镜像表重取
    const base = createBaseSection(ctx) // 底座卡 + 私有仓凭据卡（sandbox-exec-rebuild 批 · 修订轮——两卡入标签②，件内自取数）
    imagePanel.append(base.baseCard, base.credCard)
    renderNodeSelect()
    renderImages()
    return imagePanel
  }

  /** 节点清单读触发（首激活面板触发——两面板共用一次）。 */
  function startRunners() {
    if (started.runners) return
    started.runners = true
    loadRunners()
  }

  /** 装机任务读触发（标签①首激活）。 */
  function startTasks() {
    if (started.tasks) return
    started.tasks = true
    loadTasks()
  }

  // ── 运行面（节点表 ∥ 可用性提示——读时探活，§2.5）────────────────────────────

  async function loadRunners() {
    try {
      const data = await ctx.api("/api/admin/sandbox/overview")
      runners = data?.runners ?? []
      runnersPhase = "ready"
      // 不整页禁用：无节点 ∥ 全离线 ⇒ 提示条 + 原因（互延读：后端总态 ∪ 行态自推——行态即真相）
      const unavailable = data?.status === "unavailable" || runners.every((runner) => runner.online !== true)
      alert.hidden = !unavailable
      alert.textContent = unavailable ? t(runners.length === 0 ? "admin.sandbox.noNodes" : "admin.sandbox.allOffline") : ""
      renderNodes()
      renderNodeSelect() // 标签②选单 = 节点清单同源（两面板共读）
      renderImages()
    } catch (error) {
      ctx.fail(error)
      runnersPhase = "failed"
      renderNodes()
    }
  }

  /** 节点表现态渲染（读势三态：loading ∥ failed ∥ ready——面板未建 ⇒ 免渲，建时自渲）。 */
  function renderNodes() {
    if (!panels.runners) return
    if (runnersPhase === "loading") {
      listBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
      return
    }
    if (runnersPhase === "failed") {
      listBox.replaceChildren(h("p", { class: "hint error", text: t("admin.sandbox.loadFailed") }))
      return
    }
    listBox.replaceChildren(runners.length === 0 ? h("p", { class: "hint", text: t("admin.sandbox.empty") }) : nodesTable())
  }

  /** 节点表（离线行 = 红标 —— `error` 态类；容器计数 `{running}/{total}`，离线读数不外推 ⇒ 「—」）。 */
  function nodesTable() {
    const headers = [t("admin.sandbox.name"), t("admin.sandbox.address"), t("admin.sandbox.colOnline"), t("admin.sandbox.colVersion"), t("admin.sandbox.colContainers"), t("admin.sandbox.colActions")]
    const body = []
    for (const runner of runners) {
      const online = runner.online === true
      const counts = runner.containers === null || runner.containers === undefined ? "—" : `${runner.containers.running}/${runner.containers.total}`
      const toggle = () => { toggleIn(expandedNodes, runner.id); if (!expandedNodes.has(runner.id)) volumes.reset(runner); renderNodes() } // 收起 ⇒ 卷区失缓存（再展开重取可重试——B65）
      body.push(h("tr", { class: online ? "" : "error" }, h("td", { text: runner.name }),
        h("td", {}, h("span", { text: runner.address }), h("span", { class: "badge", text: connectionSchemeOf(runner.address) })), // 连接读数：地址 scheme 派生（http/https 徽标）
        h("td", {}, h("span", { class: online ? "badge ok" : "badge off", text: t(online ? "admin.sandbox.online" : "admin.sandbox.offline") })),
        h("td", { text: ctx.fmtValue(runner.version) }),
        h("td", { text: counts }),
        h("td", {},
          h("button", { type: "button", class: "tiny", text: t(expandedNodes.has(runner.id) ? "admin.sandbox.collapse" : "admin.sandbox.expand"), onclick: toggle }),
          h("button", { type: "button", class: "tiny", text: t("admin.sandbox.hostCredBtn"), onclick: () => openHostCredentialModal(ctx, { runner, onSaved: loadRunners }) }), // 主机凭据（弹窗件两页共用——KD-SV-134）
          h("button", { type: "button", class: "tiny", text: t("admin.sandbox.connBtn"), onclick: () => openConnectionModal(ctx, { runner, reload: loadRunners }) }), // 连接方式（sandbox-exec-rebuild 批 · 增补 #2——与 SSH 凭据并列）
          h("button", { type: "button", class: "tiny", text: t("admin.sandbox.remove"), onclick: () => openRemoveRunnerModal(ctx, { runner, reload: loadRunners }) }))))
      if (expandedNodes.has(runner.id)) body.push(h("tr", { class: "detail-row" }, h("td", { colspan: String(headers.length) },
        h("div", { class: "stack-box" }, containerArea(runner), volumes.area(runner, { reload: loadRunners, refresh: refreshOf(runner) }))))) // 展开体 = 容器区 + 卷区（sandbox-volumes 批）
    }
    return h("div", { class: "table-wrap" },
      h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...body)))
  }

  /** 容器区（懒加载——件 = `views-sandbox-containers.mjs`；动作后件内失缓存重取）。 */
  function containerArea(runner) {
    return containers.area(runner, { reload: () => { volumes.reset(runner); return loadRunners() }, refresh: refreshOf(runner) })
  }

  /** 容器区数据落定后的立即重渲（页守卫展开态——收起后落定不外渲）。 */
  function refreshOf(runner) {
    return () => { if (expandedNodes.has(runner.id)) renderNodes() }
  }

  /** 标签②节点选单（全部注册节点——在线/离线皆列；缺省 ∥ 已失效 ⇒ 首节点）。 */
  function renderNodeSelect() {
    if (!panels.images) return
    nodeSelect.replaceChildren(...runners.map((runner) => h("option", { value: String(runner.id), text: runner.name })))
    const runner = imageRunner()
    nodeSelect.value = runner === null ? "" : String(runner.id)
  }

  /** 标签②当刻节点（字段值命中 ⇒ 该节点 ∥ 缺省/已失效 ⇒ 首节点 ∥ 无节点 ⇒ null）。 */
  function imageRunner() {
    return runners.find((runner) => String(runner.id) === String(imageNodeId)) ?? runners[0] ?? null
  }

  /** 镜像区（标签②卡内——懒加载件 = `views-sandbox-images.mjs`；读势三态与节点表同口径：在途 ⇒ loading ∥ 败 ⇒ 人话 ∥ 无节点 ⇒ 空态句）。 */
  function renderImages() {
    if (!panels.images) return
    if (runnersPhase === "loading") {
      imageBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
      return
    }
    if (runnersPhase === "failed") {
      imageBox.replaceChildren(h("p", { class: "hint error", text: t("admin.sandbox.loadFailed") }))
      return
    }
    const runner = imageRunner()
    if (runner === null) {
      imageBox.replaceChildren(h("p", { class: "hint", text: t("admin.sandbox.empty") }))
      return
    }
    imageBox.replaceChildren(images.area(runner, { reload: loadRunners, refresh: refreshImages(runner) }))
  }

  /** 镜像区数据落定后的立即重渲（标签②在场且该节点仍为选单当刻值 ⇒ 重渲）。 */
  function refreshImages(runner) {
    return () => {
      const current = imageRunner()
      if (panels.images && current !== null && String(current.id) === String(runner.id)) renderImages()
    }
  }

  // ── 装机任务区（三态 + 步骤读数展开；在途 3s 读时轮询、定终态停）──────────────

  async function loadTasks() {
    if (!alive()) return
    try {
      const data = await ctx.api("/api/admin/sandbox/onboarding")
      runs = data?.runs ?? []
      tasksPhase = "ready"
      renderTasks()
    } catch (error) {
      ctx.fail(error)
      tasksPhase = "failed"
      renderTasks()
    }
    if (runs.some((run) => !RUN_TERMINAL.has(run.status))) schedule() // 定终态停
  }

  /** 排下一轮（单链——在途才排；离页/重渲即停）。 */
  function schedule() {
    if (!alive() || pollTimer !== null) return
    pollTimer = setTimeout(() => { pollTimer = null; loadTasks() }, TASK_POLL_MS)
  }

  function renderTasks() {
    if (!panels.runners) return // 面板未建 ⇒ 免渲（建时自渲）
    if (tasksPhase === "loading") {
      taskBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
      return
    }
    if (tasksPhase === "failed") {
      taskBox.replaceChildren(h("p", { class: "hint error", text: t("admin.sandbox.loadFailed") }))
      return
    }
    if (runs.length === 0) {
      taskBox.replaceChildren(h("p", { class: "hint", text: t("admin.sandbox.tasksEmpty") }))
      return
    }
    const headers = [t("admin.sandbox.onboardingHost"), t("admin.sandbox.colState"), t("admin.sandbox.colStep"), t("admin.sandbox.colTime")]
    const body = []
    for (const run of runs) {
      const toggle = () => { toggleIn(expandedTasks, run.id); renderTasks() }
      const tr = h("tr", { class: "row-clickable", tabindex: "0" },
        h("td", { text: run.host }),
        h("td", {}, h("span", { class: runStateClass(run.status), text: runStateLabel(run.status) })),
        h("td", { text: run.step ?? "—" }),
        h("td", { text: run.startedAt ? ctx.fmtTs(run.startedAt) : "—" }))
      tr.addEventListener("click", toggle)
      tr.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); toggle() } })
      body.push(tr)
      if (expandedTasks.has(run.id)) body.push(h("tr", { class: "detail-row" }, h("td", { colspan: String(headers.length) }, taskDetail(run))))
    }
    taskBox.replaceChildren(h("div", { class: "table-wrap" },
      h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...body))))
  }

  /** 展开体：失败 ⇒ 停在哪步；步骤清单 + 读数（详情面懒取）；keep 态 ⇒ 撤销凭据钮（二次确认）。 */
  function taskDetail(run) {
    const nodes = []
    if (RUN_TERMINAL.has(run.status) && !RUN_READY.has(run.status)) {
      nodes.push(h("p", { class: "hint error", text: t("admin.sandbox.stopAt", { step: run.step ?? "—" }) }))
    }
    const cached = detailCache.get(run.id)
    if (cached === undefined || cached.step !== run.step) { // 列表不外携读数 ⇒ 展开取详情一次（步变重取）
      detailCache.set(run.id, { step: run.step, steps: null })
      ctx.api(`/api/admin/sandbox/onboarding/${run.id}`).then((data) => {
        detailCache.set(run.id, { step: run.step, steps: data?.run?.steps ?? [] })
        if (expandedTasks.has(run.id)) renderTasks()
      }).catch((error) => { detailCache.set(run.id, { step: run.step, steps: [] }); if (expandedTasks.has(run.id)) { ctx.fail(error); renderTasks() } })
    }
    const steps = detailCache.get(run.id)?.steps ?? null
    if (steps === null) nodes.push(h("p", { class: "hint", text: t("common.loading") }))
    else if (steps.length > 0) nodes.push(h("ul", { class: "step-list" }, ...steps.map((entry) => stepItem(h, entry))))
    if (run.credential?.mode === "keep" && run.credential?.state !== "revoked") nodes.push(h("div", { class: "info-actions" }, h("button", { type: "button", class: "tiny", text: t("admin.sandbox.revoke"), onclick: () => openRevokeModal(ctx, { run, reload: loadTasks }) })))
    return h("div", { class: "stack-box" }, ...nodes)
  }

  // 数据读取触发 = 首激活面板（buildRunnerPanel ∥ buildImagePanel——webui/TABS.md §2.2 读时口径）；本函数零直读。
}

/** 添加节点弹窗（名 + 地址 + 连接方式段（sandbox-exec-rebuild 批 · 增补 #2——连接段共用件；缺省明文 ⇒ 体不携 `connection`/`tls` 键——零行为变化））；
 *  提交 ⇒ 自检中态；成：关窗 + flash + 刷新；败：窗内就地人话 + 草稿不丢。 */
function openAddRunnerModal(ctx, { reload }) {
  const { h } = ctx
  const nameInput = h("input", { placeholder: t("admin.sandbox.namePh") })
  const addressInput = h("input", { placeholder: t("admin.sandbox.addressPh") })
  const connection = createConnectionSection(ctx) // 连接段（二择 + TLS 档三件——零回填）
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: t("admin.sandbox.addRunner") })
  const modal = openModal({
    title: t("admin.sandbox.addRunner"),
    body: h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
      field(h, "admin.sandbox.name", nameInput), field(h, "admin.sandbox.address", addressInput), connection.node, note, submitBtn),
  })

  async function submit(event) {
    event.preventDefault()
    note.hidden = true
    const name = nameInput.value.trim()
    const address = addressInput.value.trim()
    if (name === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.name") }))
    if (address === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.address") }))
    const body = { name, address }
    if (connection.kind() === "tls") { // TLS 档：体增 `connection`/`tls`（缺件 ⇒ 窗内必填人话——服务端亦校验）；缺省档不携键
      const missing = connection.missingKey()
      if (missing !== null) return showNote(note, t("admin.sandbox.fieldRequired", { field: t(missing) }))
      body.connection = "tls"
      body.tls = connection.materials()
    }
    submitBtn.disabled = true
    showNote(note, t("admin.sandbox.checking"), false) // 自检中态（服务端连通自检——按档走；§2.5 添加节点行）
    try {
      await ctx.api("/api/admin/sandbox/runners", { method: "POST", body })
      ctx.flash(t("admin.sandbox.added", { name }))
      modal.close()
      await reload()
    } catch (error) {
      submitBtn.disabled = false
      showNote(note, mapError(error)) // 窗内就地人话（502 携引擎原文）；草稿不丢（输入不清）
    }
  }
}

/** 删除节点弹窗：读容器清单 ⇒ 有容器 ⇒ 列数 + 二选一「保留 ∥ 连删」；无容器/不可达 ⇒ 单确认（不可达明示保留语义）。 */
function openRemoveRunnerModal(ctx, { runner, reload }) {
  const { h } = ctx
  const bodyBox = h("div", {}, h("p", { class: "hint", text: t("common.loading") }))
  const note = h("p", { class: "hint error", hidden: true })
  const footBox = h("div", { class: "row-form" })
  let choice = "keep"
  const cancelButton = () => h("button", { type: "button", class: "tiny", text: t("common.cancel"), onclick: () => modal.close() })
  const confirmBtn = h("button", { type: "button", class: "danger", text: t("admin.sandbox.remove") })
  confirmBtn.addEventListener("click", () => submit())
  const modal = openModal({ title: t("admin.sandbox.removeRunnerTitle"), body: bodyBox, footer: footBox })
  const radio = (value, labelKey) => {
    const input = h("input", { type: "radio", name: "runner-dispose", value, checked: value === choice })
    input.addEventListener("change", () => { choice = value })
    return h("label", { class: "key-clear" }, input, t(labelKey))
  }

  const submit = () => submitThen(ctx, {
    note, button: confirmBtn, modal, reload,
    call: () => ctx.api(`/api/admin/sandbox/runners/${runner.id}`, { method: "DELETE", body: { containers: choice } }),
    flash: t("admin.sandbox.runnerDeleted", { name: runner.name }),
  })

  ctx.api(`/api/admin/sandbox/runners/${runner.id}/containers`).then((data) => {
    const listed = data?.containers ?? []
    bodyBox.replaceChildren(...(listed.length === 0
      ? [h("p", { class: "hint", text: t("admin.sandbox.removeRunnerConfirm", { name: runner.name }) }), note]
      : [h("p", { class: "hint", text: t("admin.sandbox.runnerContainers", { count: listed.length }) }), radio("keep", "admin.sandbox.keepContainers"), radio("remove", "admin.sandbox.removeContainers"), note]))
    footBox.replaceChildren(confirmBtn, cancelButton())
  }).catch(() => {
    choice = "keep" // 不可达 ⇒ 仅 keep 可过（§2.5 删除节点行）
    bodyBox.replaceChildren(h("p", { class: "hint", text: t("admin.sandbox.runnerUnreachable") }), note)
    footBox.replaceChildren(confirmBtn, cancelButton())
  })
}

/** 托管接入弹窗（八字段——地址/端口/用户/认证 + 秘密/sudo 口令/名称/模型/凭据处置 + S5 窗内预告知句）；
 *  模型下拉源 = provider 注册表现有模型（`/api/admin/providers` 展平）；提交 ⇒ 闭窗 + 装机任务在列；败 ⇒ 窗内人话。 */
function openOnboardingModal(ctx, { reload }) {
  const { h } = ctx
  const hostInput = h("input", { placeholder: t("admin.sandbox.onboardingHostPh") })
  const portInput = h("input", { type: "number", min: "1", step: "1", value: "22" })
  const userInput = h("input")
  const kindSelect = h("select", {}, h("option", { value: "key", text: t("admin.sandbox.authKey") }), h("option", { value: "password", text: t("admin.sandbox.authPassword") }))
  const secretTitle = h("span", { text: t("admin.sandbox.secretKey") })
  const secretInput = h("textarea", { rows: "3", autocomplete: "off", placeholder: t("admin.sandbox.secretPh") })
  const secretField = h("label", {}, secretTitle, secretInput)
  const sudoInput = h("input", { type: "password", autocomplete: "off" })
  const nameInput = h("input")
  const modelSelect = h("select", {}, h("option", { value: "", text: t("admin.sandbox.modelPick") }))
  const modeSelect = h("select", {}, h("option", { value: "burn", text: t("admin.sandbox.credBurn") }), h("option", { value: "keep", text: t("admin.sandbox.credKeep") }))
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: t("admin.sandbox.onboardingStart") })
  kindSelect.addEventListener("change", () => {
    secretTitle.textContent = t(kindSelect.value === "key" ? "admin.sandbox.secretKey" : "admin.sandbox.secretPassword")
  })

  const modal = openModal({
    title: t("admin.sandbox.onboardingBtn"),
    body: h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
      field(h, "admin.sandbox.onboardingHost", hostInput),
      field(h, "admin.sandbox.onboardingPort", portInput),
      field(h, "admin.sandbox.onboardingUser", userInput),
      field(h, "admin.sandbox.authKind", kindSelect),
      secretField,
      field(h, "admin.sandbox.sudoSecret", sudoInput),
      field(h, "admin.sandbox.onboardingName", nameInput),
      field(h, "admin.sandbox.model", modelSelect),
      field(h, "admin.sandbox.credentialMode", modeSelect),
      h("p", { class: "hint", text: t("admin.sandbox.s5Notice") }),
      note,
      submitBtn),
  })

  // 模型下拉源（provider 注册表现有模型——零新端点）；空/失败 ⇒ 提示项 + 提交门（前端先行）
  ctx.api("/api/admin/providers").then((data) => {
    const models = deriveModels(data?.providers ?? [])
    modelSelect.replaceChildren(...(models.length === 0 ? [h("option", { value: "", text: t("admin.sandbox.noModels") })] : [h("option", { value: "", text: t("admin.sandbox.modelPick") }), ...models.map((row) => h("option", { value: row.id, text: row.id }))]))
  }).catch(() => modelSelect.replaceChildren(h("option", { value: "", text: t("admin.sandbox.noModels") })))

  async function submit(event) {
    event.preventDefault()
    note.hidden = true
    const host = hostInput.value.trim()
    const sshUser = userInput.value.trim()
    const secret = secretInput.value
    const model = modelSelect.value
    if (host === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.onboardingHost") }))
    if (sshUser === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.onboardingUser") }))
    if (secret === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.secretKey") }))
    if (model === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.model") }))
    const body = { host, sshUser, auth: { kind: kindSelect.value, secret }, model, credentialMode: modeSelect.value }
    const port = portInput.value.trim()
    if (port !== "") body.sshPort = Number(port) // 缺省 22 由服务端兜（空 ⇒ 省略键）
    if (sudoInput.value !== "") body.sudoSecret = sudoInput.value // 可选——缺省先试免密
    const name = nameInput.value.trim()
    if (name !== "") body.name = name // 可选——缺省取探测主机名
    submitBtn.disabled = true
    showNote(note, t("admin.sandbox.submitting"), false)
    try {
      await ctx.api("/api/admin/sandbox/onboarding", { method: "POST", body })
      ctx.flash(t("admin.sandbox.onboardingStarted"))
      modal.close()
      await reload()
    } catch (error) {
      submitBtn.disabled = false
      showNote(note, mapError(error)) // 400 逐字段人话（零落库）
    }
  }
}

/** 撤销凭据弹窗（keep 态——二次确认；只清服务器侧存留）。 */
function openRevokeModal(ctx, { run, reload }) {
  const { modal, note, confirmBtn } = confirmModal(ctx, { title: "admin.sandbox.revoke", bodyText: "admin.sandbox.revokeConfirm", confirmText: t("admin.sandbox.revoke"), submit: () => submit() })
  const submit = () => submitThen(ctx, {
    note, button: confirmBtn, modal, reload,
    call: () => ctx.api(`/api/admin/sandbox/onboarding/${run.id}/credential`, { method: "DELETE" }),
    flash: t("admin.sandbox.revoked"),
  })
}
