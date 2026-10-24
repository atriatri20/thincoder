/**
 * views-sandbox.mjs — 管理·沙盒页（webui/SANDBOX.md §2.1①——`#/admin/sandbox`）：**两标签**（console-tabs-component 批——
 * 「运行面」∥「镜像与镜像源」；公共件 = `tabs.mjs`；机制全文 = `webui/TABS.md` §2.2；子段形 `#/admin/sandbox/<tab>`）——
 * 标签① = 可用性提示 ∥ 节点表（节点行展开 ⇒ 容器区 + 卷区——懒加载；件 = `views-sandbox-containers.mjs`（sandbox-docker-admin 批外拆）∥ `views-sandbox-volumes.mjs`（sandbox-volumes 批）
 * ∥ 添加/删除节点弹窗 ∥ 节点行「SSH 凭据」动作（admin-chat-creds-merge 批——弹窗件 = `host-credential.mjs`（与对话页会话条钮**同件**）；KD-SV-134）
 * ∥ 节点行「连接」动作（sandbox-exec-rebuild 批 · 增补 #2——连接方式编辑；件 = `views-sandbox-connection.mjs`；行地址列附 scheme 派生徽标（http/https））
 * ∥ 添加节点弹窗连接段（同件——缺省档不携键））；标签② = 镜像卡（节点选单 ⇒ 该节点镜像表；件 = `views-sandbox-images.mjs`）+ 镜像源卡（sandbox-image-sources 批——
 * 全局面；件 = `views-sandbox-image-sources.mjs`；一键拉取 = sandbox-image-quick-pull 批——拉取成 ⇒ `onPulled` 回调重取镜像表）+ 底座卡 + 私有仓凭据卡（sandbox-exec-rebuild 批 · 修订轮——
 * 底座可换；件 = `views-sandbox-base.mjs`）。
 * 契约 = gateway/API.md §2.5；判权全在后端（服务端 403 为准）；渲染一律节点 + textContent（零拼串）；文案经 `t()` 取值（`webui/I18N.md` §2.1）；
 * 窗体助手四件住 `modal.mjs`（`showNote`/`field`/`submitThen`/`confirmModal`）。
 * 单元测试档直测面 = `renderSandbox`（桩 ctx + 假 fetch 路由表 ∥ 子段 ∥ 两面板划分）∥ `containerStateLabel`（re-export——容器件单源）。
 */
import { mapError, t } from "./i18n.mjs"
import { copyText } from "./dom.mjs"
import { field, openModal, showNote, submitThen } from "./modal.mjs"
import { removeRunnerGate } from "./sandbox-remove-gate.mjs"
import { openHostCredentialModal } from "./host-credential.mjs"
import { createTabs } from "./tabs.mjs"
import { createContainerSection, createVolumeSection } from "./views-sandbox-containers.mjs"
import { createImageSection } from "./views-sandbox-images.mjs"
import { createImageSourceSection } from "./views-sandbox-image-sources.mjs"
import { connectionSchemeOf, createConnectionSection, openConnectionModal } from "./views-sandbox-connection.mjs"
import { createBaseSection } from "./views-sandbox-base.mjs"

/** 容器态文案（re-export——单源住 `views-sandbox-containers.mjs`；沿旧导出面）。 */
export { containerStateLabel } from "./views-sandbox-containers.mjs"

/** 集内切换（展开/收起）。 */
function toggleIn(set, key) {
  if (set.has(key)) set.delete(key)
  else set.add(key)
}

/** 管理·沙盒页（非壳页——卡多；console-tabs-component 批：两标签——`sub` = 地址栏子段（不认 ⇒ 首标签回落））。 */
export async function renderSandbox(ctx, mount, sub = null) {
  const { h } = ctx
  const expandedNodes = new Set() // 展开的节点 id（容器区懒加载）
  const containers = createContainerSection(ctx) // 容器区件（本批外拆——§2.8①）
  const images = createImageSection(ctx), volumes = createVolumeSection(ctx) // 镜像区件（本批外拆——§2.8①；console-tabs-component 批迁标签②）∥ 卷区件（sandbox-volumes 批——节点展开内、容器区之后）
  let runners = [] // 节点清单（**页级单源——两面板共读**；读势 = `runnersPhase`）
  let runnersPhase = "loading" // loading ∥ ready ∥ failed（读势单源——面板建时按态渲）
  let imageNodeId = null // 标签②节点选单当刻值（缺省 ⇒ 首节点；换选 ⇒ 该节点镜像表重取）
  const panels = { runners: false, images: false } // 面板建后标志（懒建——首激活建；未建 ⇒ 免渲）
  const started = { runners: false } // 数据触发（首激活面板触发读取——webui/TABS.md §2.2 读时口径）

  mount.append(h("h2", { text: t("admin.sandbox.title") }))
  const alert = h("p", { class: "hint error", hidden: true })
  const listBox = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  const nodeSelect = h("select") // 标签②节点选单（全部注册节点——在线/离线皆列）
  const imageBox = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  // 标签①运行面（卡壳保留——岔口㈡ 裁定；卡题去重：面题入标签 ⇒ h3 去）
  const runnerPanel = h("section", { class: "card" },
    h("div", { class: "info-actions" },
      h("button", { type: "button", text: t("admin.sandbox.addRunner"), onclick: () => openAddRunnerModal(ctx, { reload: loadRunners }) })),
    alert,
    listBox)
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

  /** 标签①建：触发页级读取 + 现态渲（节点表）。 */
  function buildRunnerPanel() {
    panels.runners = true
    startRunners()
    renderNodes()
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

  // 数据读取触发 = 首激活面板（buildRunnerPanel ∥ buildImagePanel——webui/TABS.md §2.2 读时口径）；本函数零直读。
}

/** 添加节点弹窗（名 + 地址 + 连接方式段（sandbox-exec-rebuild 批 · 增补 #2——连接段共用件；缺省明文 ⇒ 体不携 `connection`/`tls` 键——零行为变化）
 *  + 节点侧接线提示块（#1235 方案 A 定稿形——说明句 + 命令文本可选中；`navigator.clipboard` 在场 ⇒ 复制钮、缺 ⇒ 零钮）；
 *  提交 ⇒ 自检中态；成：关窗 + flash + 刷新；败：窗内就地人话 + 草稿不丢。 */
function openAddRunnerModal(ctx, { reload }) {
  const { h } = ctx
  const nameInput = h("input", { placeholder: t("admin.sandbox.namePh") })
  const addressInput = h("input", { placeholder: t("admin.sandbox.addressPh") })
  const connection = createConnectionSection(ctx) // 连接段（二择 + TLS 档三件——零回填）
  const wiring = nodeWiringBlock(h) // 节点侧接线提示块（#1235；与连接段并列——同窗）
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: t("admin.sandbox.addRunner") })
  const modal = openModal({
    title: t("admin.sandbox.addRunner"),
    body: h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
      field(h, "admin.sandbox.name", nameInput), field(h, "admin.sandbox.address", addressInput), connection.node, wiring, note, submitBtn),
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

/** 复制可用性门（`navigator.clipboard` 在场（安全上下文）⇒ 控件在场——判式沿 `views-me-chat.mjs` `clipboardReady` 先例）。 */
function clipboardReady() {
  return typeof navigator !== "undefined" && navigator.clipboard !== null && navigator.clipboard !== undefined && typeof navigator.clipboard.writeText === "function"
}

/** 节点侧接线提示块（#1235——说明句 + 命令文本：`<pre class="snippet">` 可选中；**复制钮按可用性门**
 *  （`navigator.clipboard` 在场 ⇒ 钮在场；缺（http 内网无安全上下文）⇒ 钮不渲染——零假控件，判式沿 `views-me-chat.mjs` `clipboardReady` 先例）；
 *  文本源 = `sandbox/SANDBOX.md` §3「节点侧前置」；TLS 档句（证书 = 用户自备）并入提示句。 */
function nodeWiringBlock(h) {
  const command = t("admin.sandbox.nodeWiringCmd")
  const pre = h("pre", { class: "snippet", text: command })
  const nodes = [h("p", { class: "hint", text: t("admin.sandbox.nodeWiringHint") }), pre]
  if (clipboardReady()) {
    const copyBtn = h("button", { type: "button", class: "tiny", text: t("common.copy") })
    copyBtn.addEventListener("click", () => { copyText(command, pre, copyBtn) })
    nodes.push(copyBtn)
  }
  return h("div", { class: "stack-box" }, ...nodes)
}

/** 删除节点弹窗：读容器清单 + 承载工作区清单（**并行**）⇒ 有容器 ⇒ 列数 + 二选一「保留 ∥ 连删」；无容器/不可达 ⇒ 单确认（不可达明示保留语义）；
 *  **有承载工作区 ⇒ 警告句（N + 名——沿服务端 400 同款措辞）+「确认丢弃」勾选（缺省不勾 ⇒ 删除钮禁、勾后启）**；
 *  **工作区清单读败 ⇒ 明示句 + 重试钮 + 删除钮先禁**（读败 ≠ 无承载——承载数未知时放行删除 = 误删仍在跑的工作区；判门单源 = `removeRunnerGate`）；
 *  提交体携 `confirm: true`（勾选时）；无承载/不可达/读败 ⇒ 体不携 `confirm`（现行两径零回归；读败下删除钮已禁，提交不可达）。 */
function openRemoveRunnerModal(ctx, { runner, reload }) {
  const { h } = ctx
  const bodyBox = h("div", {}, h("p", { class: "hint", text: t("common.loading") }))
  const note = h("p", { class: "hint error", hidden: true })
  const footBox = h("div", { class: "row-form" })
  let choice = "keep"
  let boundCount = 0 // 承载工作区数（> 0 ⇒ 需「确认丢弃」）
  let boundConfirmed = false // 「确认丢弃」勾选态（缺省不勾——删除钮禁）
  const cancelButton = () => h("button", { type: "button", class: "tiny", text: t("common.cancel"), onclick: () => modal.close() })
  const confirmBtn = h("button", { type: "button", class: "danger", text: t("admin.sandbox.remove") })
  confirmBtn.addEventListener("click", () => submit())
  const modal = openModal({ title: t("admin.sandbox.removeRunnerTitle"), body: bodyBox, footer: footBox })
  const radio = (value, labelKey) => {
    const input = h("input", { type: "radio", name: "runner-dispose", value, checked: value === choice })
    input.addEventListener("change", () => { choice = value })
    return h("label", { class: "key-clear" }, input, t(labelKey))
  }
  /** 判门入参（取数落定写值；勾选变化只改 `boundConfirmed`）——判门单源 = 纯件 `removeRunnerGate`。 */
  const gateInput = { containerReachable: true, listedCount: 0, workspacesOk: true, boundCount: 0, boundConfirmed: false }
  /** 删除钮门（纯件复算——勾选变化 ∥ 取数落定同一门）。 */
  const applyGate = () => { confirmBtn.disabled = removeRunnerGate(gateInput).confirmDisabled }

  const submit = () => submitThen(ctx, {
    note, button: confirmBtn, modal, reload,
    call: () => ctx.api(`/api/admin/sandbox/runners/${runner.id}`, { method: "DELETE", body: boundCount > 0 ? { containers: choice, confirm: true } : { containers: choice } }),
    flash: t("admin.sandbox.runnerDeleted", { name: runner.name }),
  })

  /** 两取数并行（容器清单 ∥ 承载工作区清单）——落定后一次渲（两清单同页共读）；**重试钮复调本函数**（两取数重发）。 */
  const renderRemoveRunnerBody = () => {
    bodyBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    const containersCall = ctx.api(`/api/admin/sandbox/runners/${runner.id}/containers`)
      .then((data) => ({ reachable: true, listed: data?.containers ?? [] }), () => ({ reachable: false, listed: [] }))
    // 工作区清单：`ok` 与「空表」分列——旧形失败径给 `[]`，读败与无承载同值 ⇒ 承载数未知却放行删除
    const workspacesCall = ctx.api("/api/admin/sandbox/workspaces")
      .then((data) => (Array.isArray(data?.workspaces) ? { ok: true, listed: data.workspaces } : { ok: false, listed: [] }),
        () => ({ ok: false, listed: [] }))
    return Promise.all([containersCall, workspacesCall]).then(([containerResult, workspaceResult]) => {
      const bound = workspaceResult.listed.filter((workspace) => workspace?.runnerId !== null && workspace?.runnerId !== undefined && String(workspace.runnerId) === String(runner.id))
      boundCount = bound.length
      gateInput.containerReachable = containerResult.reachable
      gateInput.listedCount = containerResult.listed.length
      gateInput.workspacesOk = workspaceResult.ok
      gateInput.boundCount = boundCount
      const gate = removeRunnerGate(gateInput)
      const rows = []
      if (containerResult.reachable !== true) {
        choice = "keep" // 不可达 ⇒ 仅 keep 可过（§2.5 删除节点行）
        rows.push(h("p", { class: "hint", text: t("admin.sandbox.runnerUnreachable") }))
      } else if (containerResult.listed.length === 0) {
        rows.push(h("p", { class: "hint", text: t("admin.sandbox.removeRunnerConfirm", { name: runner.name }) }))
      } else {
        rows.push(h("p", { class: "hint", text: t("admin.sandbox.runnerContainers", { count: containerResult.listed.length }) }),
          radio("keep", "admin.sandbox.keepContainers"), radio("remove", "admin.sandbox.removeContainers"))
      }
      if (boundCount > 0) {
        rows.push(h("p", { class: "hint", text: t("admin.sandbox.runnerWorkspaces", { count: boundCount, names: bound.map((item) => item.name).join(" ∥ ") }) }))
        const discardCheck = h("input", { type: "checkbox" })
        discardCheck.addEventListener("change", () => { boundConfirmed = discardCheck.checked; gateInput.boundConfirmed = boundConfirmed; applyGate() })
        rows.push(h("label", { class: "key-clear" }, discardCheck, t("admin.sandbox.discardWorkspaces")))
      }
      if (gate.retry) {
        // 读败 ⇒ 明示句 + 重试钮（复调本函数、两取数重发）；容器侧不可达句照渲 ⇒ 两行并存
        const retryBtn = h("button", { type: "button", class: "tiny", text: t("error.retry") })
        retryBtn.addEventListener("click", () => { renderRemoveRunnerBody() })
        rows.push(h("p", { class: "hint error", text: t(gate.hintKey) }), retryBtn)
      }
      rows.push(note)
      bodyBox.replaceChildren(...rows)
      footBox.replaceChildren(confirmBtn, cancelButton())
      applyGate()
    })
  }

  renderRemoveRunnerBody()
}
