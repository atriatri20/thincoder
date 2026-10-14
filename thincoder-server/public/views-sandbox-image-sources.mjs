/**
 * views-sandbox-image-sources.mjs — 沙盒页·镜像源卡件（webui/SANDBOX.md §2.1①；sandbox-image-sources 批——台账 #1274；
 * 一键拉取 = sandbox-image-quick-pull 批——台账 #1276）：
 * 源表（名 ∥ 地址 ∥ 面型提示（Hub 面/标准 v2——按 `kind` 派生）∥ 操作：目录/改/删）+「添加源」钮
 * ∥ 增/改弹窗（常用源预选下拉七条（选中回填名 + 址，可再改）+ 名/址两输入）∥ 删除确认（后果句——非原生 confirm）
 * ∥ 目录浏览窗（懒取：仓库列表（过滤输入 + 截断提示 + 空态句）⇒ 点行取标签列表（过滤输入）；Hub 源 ⇒ 仓库面改走
 * 「按镜像名查标签」单输入（目录面 `unsupported` 人话呈）；五分类读绪各一键文案——窗内就地呈，不关窗）
 * ∥ 一键拉取（行尾「拉取」钮 ⇒ 节点选单（开窗读一次概览——无节点/全离线 ⇒ 禁用 + 一句人话）⇒ 既有拉取窗（预填
 * `<主机>[:<端口>]/<仓库>:<标签>` + 「目标节点」行；预填可改；携源 ⇒ 窗内「经由源」选单认源态——sandbox-pull-by-source 批）⇒ 既有拉取径——零新端点 ∥ 零新 kind）。
 * 契约 = gateway/API.md §2.5 镜像源七行；文案经 `t()`（`webui/I18N.md` §2.1）；渲染一律节点 + textContent（零拼串）；零新端点。
 * 单元测试档直测面 = `createImageSourceSection` ∥ `sourceKindLabel` ∥ `readKindLabel` ∥ `pullRefFor`（纯函数）。
 */
import { mapError, t } from "./i18n.mjs"
import { confirmModal, field, openModal, showNote, submitThen } from "./modal.mjs"
import { hubLibraryName, openPullImageModal, sourceHost } from "./views-sandbox-images.mjs"

/** 面型文案键（`kind` ⇒ 表键；枚举外 ⇒ 标准 v2 兜底——服务端三值：hub ∥ hub-mirror ∥ v2）。 */
const SOURCE_KIND_KEYS = { hub: "admin.sandbox.sourceKindHub", "hub-mirror": "admin.sandbox.sourceKindHubMirror", v2: "admin.sandbox.sourceKindV2" }

/** 读绪五分类文案键（服务端 `error.kind` ⇒ 表键；枚举外 ⇒ 原文兜底）。 */
const READ_KIND_KEYS = {
  timeout: "admin.sandbox.readKindTimeout",
  unreachable: "admin.sandbox.readKindUnreachable",
  auth_required: "admin.sandbox.readKindAuthRequired",
  unsupported: "admin.sandbox.readKindUnsupported",
  bad_response: "admin.sandbox.readKindBadResponse",
}

/** 面型文案（纯函数——单元测试档直测）。 */
export function sourceKindLabel(kind) {
  return t(SOURCE_KIND_KEYS[kind] ?? SOURCE_KIND_KEYS.v2)
}

/** 读绪文案（纯函数——五分类；枚举外 ⇒ 原文兜底）。 */
export function readKindLabel(kind) {
  const key = READ_KIND_KEYS[kind]
  return key === undefined ? String(kind ?? "—") : t(key)
}

/** 预填引用（纯函数——单元测试档直测）：`<主机>[:<端口>]/<仓库>:<标签>`——地址去 scheme ∥ 含端口逐值；
 *  Hub 面主机统一 `docker.io` + 裸名补 `library/`（沿读取面惯例）；仓库行（无 `tag`）⇒ `:latest` 显式。
 *  主机/补名两规则 = `views-sandbox-images.mjs` 同名导出（组装 `pullRefWithSource` 复用同源——零第二份值规则）。 */
export function pullRefFor(source, { repo, tag = null }) {
  const name = hubLibraryName(source, repo)
  return `${sourceHost(source)}/${name}:${tag === null || tag === undefined || tag === "" ? "latest" : String(tag)}`
}

/** 读绪块（五分类标签 + 服务端人话；转读失败（我们的 API 抛）⇒ `mapError` 人话）。 */
function readErrorNode(ctx, error) {
  const { h } = ctx
  const nodes = [h("p", { class: "hint error", text: error?.kind === undefined ? mapError(error) : readKindLabel(error.kind) })]
  if (typeof error?.message === "string" && error.message !== "") nodes.push(h("p", { class: "hint", text: error.message }))
  return h("div", { class: "stack-box" }, ...nodes)
}

/** 镜像源卡件（缓存自持；动作后重取 = 界面上新）。出 = `{ card }`（页面挂载点）；`onPulled` = 页注入回调（一键拉取成 ⇒ 该节点镜像表重取——装配点 `views-sandbox.mjs`）。 */
export function createImageSourceSection(ctx, { onPulled = null } = {}) {
  const { h } = ctx
  let sources = []
  const box = h("div", { class: "table-slot" }, h("p", { class: "hint", text: t("common.loading") }))
  const card = h("section", { class: "card" },
    h("h3", { text: t("admin.sandbox.sourcesTitle") }),
    h("div", { class: "info-actions" },
      h("button", { type: "button", text: t("admin.sandbox.sourceAdd"), onclick: () => openSourceModal(ctx, { reload: load }) })),
    box)

  async function load() {
    box.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
    try {
      const data = await ctx.api("/api/admin/sandbox/image-sources")
      sources = Array.isArray(data?.sources) ? data.sources : []
      render()
    } catch (error) {
      box.replaceChildren(h("p", { class: "hint error", text: mapError(error) }))
    }
  }

  function render() {
    if (sources.length === 0) {
      box.replaceChildren(h("p", { class: "hint", text: t("admin.sandbox.sourcesEmpty") }))
      return
    }
    const headers = [t("admin.sandbox.name"), t("admin.sandbox.address"), t("admin.sandbox.sourceKind"), t("admin.sandbox.colActions")]
    const rows = sources.map((source) => h("tr", {},
      h("td", { text: source.name }),
      h("td", { text: source.address }),
      h("td", { text: sourceKindLabel(source.kind) }),
      h("td", {},
        h("button", { type: "button", class: "tiny", text: t("admin.sandbox.sourceCatalogBtn"), onclick: () => openCatalogModal(ctx, { source, onPulled }) }),
        h("button", { type: "button", class: "tiny", text: t("admin.sandbox.sourceEdit"), onclick: () => openSourceModal(ctx, { source, reload: load }) }),
        h("button", { type: "button", class: "tiny", text: t("admin.sandbox.remove"), onclick: () => openSourceDeleteModal(ctx, { source, reload: load }) }))))
    box.replaceChildren(h("div", { class: "table-wrap" },
      h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...rows))))
  }

  load()
  return { card }
}

/** 增/改弹窗（预选下拉 + 名/址两输入；改 = 预填现值；提交 ⇒ 关窗 + flash + 重取；败 ⇒ 窗内就地人话 + 草稿不丢）。 */
function openSourceModal(ctx, { source = null, reload }) {
  const { h } = ctx
  const editing = source !== null && source !== undefined
  let presets = []
  const presetSelect = h("select", {}, h("option", { value: "", text: t("admin.sandbox.sourcePresetPh") }))
  const nameInput = h("input", { placeholder: t("admin.sandbox.namePh") })
  const addressInput = h("input", { placeholder: t("admin.sandbox.sourceAddressPh") })
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: editing ? t("common.save") : t("admin.sandbox.sourceAdd") })
  const modal = openModal({
    title: t(editing ? "admin.sandbox.sourceEdit" : "admin.sandbox.sourceAdd"),
    body: h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
      field(h, "admin.sandbox.sourcePreset", presetSelect),
      field(h, "admin.sandbox.name", nameInput),
      field(h, "admin.sandbox.address", addressInput),
      note, submitBtn),
  })
  if (editing) {
    nameInput.value = source.name
    addressInput.value = source.address
  }

  // 预选六条（静态表——服务端单源；选中 ⇒ 回填名 + 址，可再改）；取数失败 ⇒ 仅占位项（不反噬窗）
  ctx.api("/api/admin/sandbox/image-sources/presets").then((data) => {
    presets = Array.isArray(data?.presets) ? data.presets : []
    presetSelect.append(...presets.map((preset) => h("option", { value: preset.address, text: preset.name })))
  }).catch(() => {})
  presetSelect.addEventListener("change", () => {
    const hit = presets.find((preset) => preset.address === presetSelect.value)
    if (hit === undefined) return
    nameInput.value = hit.name
    addressInput.value = hit.address
  })

  async function submit(event) {
    event.preventDefault()
    note.hidden = true
    const name = nameInput.value.trim()
    const address = addressInput.value.trim()
    if (name === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.name") }))
    if (address === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.address") }))
    submitBtn.disabled = true
    try {
      if (editing) {
        await ctx.api(`/api/admin/sandbox/image-sources/${source.id}`, { method: "PATCH", body: { name, address } })
        ctx.flash(t("admin.sandbox.sourceUpdated", { name }))
      } else {
        await ctx.api("/api/admin/sandbox/image-sources", { method: "POST", body: { name, address } })
        ctx.flash(t("admin.sandbox.sourceAdded", { name }))
      }
      modal.close()
      await reload()
    } catch (error) {
      submitBtn.disabled = false
      showNote(note, mapError(error)) // 400 逐形人话；草稿不丢（输入不清）
    }
  }
}

/** 删除源确认（后果句：只删清单行，不动镜像；非原生 `confirm`）。 */
function openSourceDeleteModal(ctx, { source, reload }) {
  const { modal, note, confirmBtn } = confirmModal(ctx, {
    title: "admin.sandbox.sourceDeleteTitle",
    bodyText: "admin.sandbox.sourceDeleteConfirm",
    bodyParams: { name: source.name },
    confirmText: t("admin.sandbox.remove"),
    submit: () => submitThen(ctx, {
      note, button: confirmBtn, modal, reload,
      call: () => ctx.api(`/api/admin/sandbox/image-sources/${source.id}`, { method: "DELETE" }),
      flash: t("admin.sandbox.sourceDeleted", { name: source.name }),
    }),
  })
}

/** 目录浏览窗（懒取：仓库列表 ⇒ 点行取标签；Hub 源 ⇒ 仓库面改走「按镜像名查标签」单输入；两处过滤输入；五分类读绪窗内就地呈）。
 *  一键拉取（sandbox-image-quick-pull 批）：行尾「拉取」钮（可用态 = 开窗读一次概览——读时读）⇒ 节点选单 ⇒ 既有拉取窗预填。 */
function openCatalogModal(ctx, { source, onPulled = null }) {
  const { h } = ctx
  const hub = source?.kind === "hub"
  const repoCol = h("div", { class: "stack-box" }, h("h4", { text: t("admin.sandbox.catalogReposTitle") }))
  const tagCol = h("div", { class: "stack-box" }, h("h4", { text: t("admin.sandbox.catalogTagsTitle") }))
  const pull = { enabled: false, runners: [] } // 可用态（概览读到前 ⇒ 禁用——fail-safe）
  const pullNote = h("p", { class: "hint error", hidden: true })
  const repainters = []
  let tagRepo = "" // 标签列表当前所取仓库名（标签行预填用——Hub 面补 library/ 归 `pullRefFor`）
  openModal({
    title: t("admin.sandbox.catalogTitle", { name: source.name }),
    body: h("div", {}, pullNote, h("div", { class: "browse-grid" }, repoCol, tagCol)),
  })
  const catalogUrl = `/api/admin/sandbox/image-sources/${source.id}/catalog`
  const tags = makeList({ emptyKey: "admin.sandbox.catalogTagsEmpty", idleText: t("admin.sandbox.catalogTagHint"), onPull: (tag) => pickNode({ repo: tagRepo, tag }) })
  repainters.push(tags.repaint)
  tagCol.append(tags.node)

  // 可用态 = 目录窗打开读一次概览（读时读——零新端点）：≥1 在线 ⇒ 可用；无节点 ∥ 全离线 ⇒ 禁用 + 一句人话；读败 ⇒ 禁用 + 人话
  ctx.api("/api/admin/sandbox/overview").then((data) => {
    const runners = Array.isArray(data?.runners) ? data.runners : []
    const online = runners.filter((runner) => runner.online === true)
    if (online.length > 0) setPull({ enabled: true, runners: online })
    else setPull({ enabled: false, reason: t(runners.length === 0 ? "admin.sandbox.noNodes" : "admin.sandbox.allOffline") })
  }).catch((error) => setPull({ enabled: false, reason: mapError(error) }))

  /** 可用态落定（提示行 + 两列钮态随动重渲）。 */
  function setPull(next) {
    Object.assign(pull, next)
    pullNote.hidden = pull.enabled
    if (!pull.enabled) pullNote.textContent = pull.reason
    for (const repaint of repainters) repaint()
  }

  /** 拉取链（一键拉取）：节点选单（在线节点）⇒ 既有拉取窗（引用预填 + 目标节点行；预填可改）。 */
  function pickNode({ repo, tag }) {
    openNodePicker(ctx, {
      runners: pull.runners,
      onPick: (runner) => openPullImageModal(ctx, { runner, prefill: pullRefFor(source, { repo, tag }), source, reload: () => onPulled?.(runner) }),
    })
  }

  /** 读一次标签（v2 = 点行所取仓库名 ∥ Hub = 单输入名；败 ⇒ 五分类读绪就地呈）。 */
  async function loadTags(name) {
    tags.load()
    try {
      const data = await ctx.api(`/api/admin/sandbox/image-sources/${source.id}/tags?name=${encodeURIComponent(name)}`)
      if (data?.ok === true) {
        tagRepo = name
        tags.set(data.tags ?? [], { truncated: data.truncated })
      } else {
        tags.fail(data?.error ?? {})
      }
    } catch (error) {
      tags.fail(error)
    }
  }

  if (hub) {
    // 仓库面改走「按镜像名查标签」单输入；目录面 `unsupported` 人话呈（服务端如实报——Hub 无全站目录 API）
    const nameInput = h("input", { placeholder: t("admin.sandbox.catalogNamePh") })
    const note = h("p", { class: "hint error", hidden: true })
    const submitBtn = h("button", { type: "submit", text: t("admin.sandbox.catalogRead") })
    const catalogBox = h("div", { class: "stack-box" })
    repoCol.append(h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
      field(h, "admin.sandbox.catalogHubName", nameInput), submitBtn, note), catalogBox)
    ctx.api(catalogUrl).then((data) => {
      if (data?.ok === false) catalogBox.replaceChildren(readErrorNode(ctx, data.error ?? {}))
    }).catch((error) => catalogBox.replaceChildren(readErrorNode(ctx, error)))

    async function submit(event) {
      event.preventDefault()
      note.hidden = true
      const name = nameInput.value.trim()
      if (name === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.catalogHubName") }))
      await loadTags(name)
    }
  } else {
    const repos = makeList({ emptyKey: "admin.sandbox.catalogReposEmpty", onPick: (name) => loadTags(name), onPull: (repo) => pickNode({ repo, tag: null }) })
    repainters.push(repos.repaint)
    repoCol.append(repos.node)
    const loadRepos = async () => {
      repos.load()
      try {
        const data = await ctx.api(catalogUrl)
        if (data?.ok === true) repos.set(data.repositories ?? [], { truncated: data.truncated })
        else repos.fail(data?.error ?? {})
      } catch (error) {
        repos.fail(error)
      }
    }
    loadRepos()
  }

  /** 过滤列表块（两列各一枚）：过滤输入 + 行表（已载集合纯前端过滤——零新端点）；截断提示/空态/无匹配就地呈。
   *  `onPick` 在场 ⇒ 行可点（`row-clickable`——键盘同径）；`onPull` 在场 ⇒ 行尾「拉取」钮（一键拉取径）；
   *  `idleText` = 首屏待命句（缺省 = 加载中）。 */
  function makeList({ emptyKey, onPick = null, idleText = null, onPull = null }) {
    const filterInput = h("input", { placeholder: t("admin.sandbox.catalogFilterPh") })
    const truncatedHint = h("p", { class: "hint", text: t("admin.sandbox.catalogTruncated"), hidden: true })
    const bodyBox = h("div", { class: "table-slot" })
    const node = h("div", { class: "stack-box" }, h("div", { class: "filter-row" }, filterInput), truncatedHint, bodyBox)
    let items = []
    let phase = "idle" // 读绪相位（idle 首屏待命 ∥ loading ∥ ready ∥ failed）——重渲仅在 ready（不顶掉待命/加载/读绪面）

    /** 行尾「拉取」钮（可用态禁用；钮内点击/键事件不触发行选取——`stopPropagation` 先行）。 */
    function pullButton(item) {
      const button = h("button", { type: "button", class: "tiny", text: t("admin.sandbox.catalogPull"), onclick: (event) => {
        event.stopPropagation()
        if (!pull.enabled) return // 禁用兜底（平台不派发禁用钮点击——双保险）
        onPull(item)
      } })
      // 行级 keydown（Enter/Space ⇒ 行选取）会吞钮激活 ⇒ 钮内键事件不外传（键盘同径 = 钮自身 activation）
      button.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") event.stopPropagation() })
      button.disabled = !pull.enabled
      return button
    }

    function rowsOf(shown) {
      return shown.map((item) => {
        const cells = [h("td", { text: item })]
        if (onPull !== null) cells.push(h("td", {}, pullButton(item)))
        const tr = h("tr", onPick === null ? {} : { class: "row-clickable", tabindex: "0" }, ...cells)
        if (onPick !== null) {
          tr.addEventListener("click", () => onPick(item))
          tr.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); onPick(item) } })
        }
        return tr
      })
    }

    function render() {
      const keyword = filterInput.value.trim().toLowerCase()
      const shown = items.filter((item) => keyword === "" || String(item).toLowerCase().includes(keyword))
      if (items.length === 0) bodyBox.replaceChildren(h("p", { class: "hint", text: t(emptyKey) }))
      else if (shown.length === 0) bodyBox.replaceChildren(h("p", { class: "hint", text: t("admin.sandbox.catalogNoMatch") }))
      else bodyBox.replaceChildren(h("div", { class: "table-wrap" }, h("table", {}, h("tbody", {}, ...rowsOf(shown)))))
    }
    filterInput.addEventListener("input", render)
    bodyBox.replaceChildren(h("p", { class: "hint", text: idleText ?? t("common.loading") }))

    return {
      node,
      /** 读起点（清截断提示 + 加载态）。 */
      load() {
        phase = "loading"
        truncatedHint.hidden = true
        bodyBox.replaceChildren(h("p", { class: "hint", text: t("common.loading") }))
      },
      /** 读败（五分类读绪 ∥ 转读失败——窗内就地呈，不关窗）。 */
      fail(error) {
        phase = "failed"
        truncatedHint.hidden = true
        bodyBox.replaceChildren(readErrorNode(ctx, error))
      },
      /** 读成（集合 + 截断标记；过滤词复位）。 */
      set(next, { truncated = false } = {}) {
        phase = "ready"
        items = Array.isArray(next) ? next : []
        truncatedHint.hidden = truncated !== true
        filterInput.value = ""
        render()
      },
      /** 可用态落定重渲（钮禁用态随动——仅读成面重渲，首屏待命/加载/读绪面不顶掉）。 */
      repaint() {
        if (phase !== "ready") return
        render()
      },
    }
  }
}

/** 节点选单（在线节点行——名 + 地址；可点行 ∥ 键盘同径；题「拉取到节点」）⇒ 选 ⇒ 既有拉取窗（单例：开新先关旧——目录窗随之关）。 */
function openNodePicker(ctx, { runners, onPick }) {
  const { h } = ctx
  const rows = runners.map((runner) => {
    const tr = h("tr", { class: "row-clickable", tabindex: "0" }, h("td", { text: runner.name }), h("td", { text: runner.address }))
    const pick = () => onPick(runner)
    tr.addEventListener("click", pick)
    tr.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); pick() } })
    return tr
  })
  openModal({ title: t("admin.sandbox.pullPickNodeTitle"), body: h("div", {}, h("div", { class: "table-wrap" }, h("table", {}, h("tbody", {}, ...rows)))) })
}
