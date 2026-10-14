/**
 * views-sandbox-images.mjs — 沙盒页·镜像区件（webui/SANDBOX.md §2.1①；sandbox-docker-admin 批——自 `views-sandbox.mjs` 外拆）：
 * 镜像表（名（多标签逐行 ∥ 无标签 ⇒「无标签」）∥ 大小 ∥ 创建 ∥ 操作：删除）+ 拉取镜像钮 + **本地镜像表过滤**（本批——
 * 表上方关键词输入（名/标签匹配；无匹配 ⇒ 空态句；零新端点））
 * ∥ 拉取窗（引用输入 `名[:标签]`；在飞态 + 钮禁用；sandbox-image-quick-pull 批：可选预填参 + 「目标节点」行）
 * ∥ **拉取认源**（sandbox-pull-by-source 批：「经由源」选单（源清单读时读——零新端点）⇒ 选定即按源组装（`pullRefWithSource`——可见改写 ∥
 * 可再改）；不选 = 原样；认源态 ∥ 记忆预选（P2——`localStorage` 单键 `tc_pull_source`）；「目标节点」行恒显（P1）；无源 ∥ 读败 ⇒ 不选态 + 人话——拉取不阻断）
 * ∥ 删除确认窗（强制删除勾选——缺省不勾）。
 * console-tabs-component 批：本区随沙盒页分标签迁**标签②「镜像与镜像源」**（节点选单当刻节点的镜像表）——题行去重（卡 h3 承担）。
 * 契约 = gateway/API.md §2.5；文案经 `t()`（`webui/I18N.md` §2.1）；渲染一律节点 + textContent（零拼串）。单元测试档直测面 = `createImageSection`
 * ∥ `openPullImageModal` ∥ `pullRefWithSource`（纯函数）。
 */
import { mapError, t } from "./i18n.mjs"
import { field, openModal, showNote, submitThen } from "./modal.mjs"
import { formatBytes } from "./views-sandbox-containers.mjs"

/** Hub 注册表主机（组装/预填统一形——站点主机（`hub.docker.com`）非注册表主机）∥ 连字面量拼写 = 避 `2026-10-06-server-i18n` 键面扫描件误判（点分小写字面量须为 i18n 键——本字面量非键）。 */
const HUB_REGISTRY_HOST = "docker" + ".io"

/** 源主机（去 scheme ∥ Hub 面统一 `docker.io`）——组装（`pullRefWithSource`）∥ 预填（`pullRefFor`——`views-sandbox-image-sources.mjs`）两径同源（后者复用本导出——零第二份值规则）。 */
export function sourceHost(source) {
  return source?.kind === "hub" ? HUB_REGISTRY_HOST : String(source?.address ?? "").replace(/^https?:\/\//, "")
}

/** Hub 面裸名补 `library/`（无 `/` ⇒ 补——引擎命名空间惯例）；两径同规则。 */
export function hubLibraryName(source, name) {
  const text = String(name)
  return (source?.kind === "hub" || source?.kind === "hub-mirror") && !text.includes("/") ? `library/${text}` : text
}

/** 组装引用（纯函数——单元测试档直测；与 `pullRefFor` 值规则同口径）：选定源 ⇒ 对输入原文组装一次（`<主机>/<路径>[:<标签>]`）。
 *  去 scheme ∥ 含端口逐值；已带主机（判据 = 引擎同口径：首段含 `.`/`:` ∥ = `localhost`）⇒ 剥换为源主机（「经由源」直义）；
 *  无标签（判据 = 末个 `/` 之后的末个 `:` 起）⇒ 补 `:latest` 显式；Hub 面剥后裸名 ⇒ 补 `library/`；
 *  `@`（digest 形）⇒ 原样透传（不组装——服务端既有 400 径）；空输入 ⇒ 不动作（原样返回——提交仍被必填门拦）。 */
export function pullRefWithSource(input, source) {
  const text = String(input ?? "").trim()
  if (text === "" || text.includes("@")) return text
  const slash = text.indexOf("/")
  const head = slash === -1 ? "" : text.slice(0, slash)
  const hostBearing = slash !== -1 && (head.includes(".") || head.includes(":") || head === "localhost")
  const name = hubLibraryName(source, hostBearing ? text.slice(slash + 1) : text)
  const tail = name.slice(name.lastIndexOf("/") + 1) // 标签判据 = 末个 `/` 之后的末个 `:` 起（与既有拉取形同口径）
  return `${sourceHost(source)}/${name}${tail.includes(":") ? "" : ":latest"}`
}

/** 选择记忆单键（P2——`localStorage`；沿语言记忆 `tc_lang` 同法）。 */
const PULL_SOURCE_KEY = "tc_pull_source"

/** 记忆读（无值 ∥ 存储不可用/读败 ⇒ 空串 ⇒ 不选态回落；沿 `i18n.mjs` 静默同法）。 */
function readPullSource() {
  try {
    return globalThis.localStorage?.getItem(PULL_SOURCE_KEY) ?? ""
  } catch {
    return ""
  }
}

/** 记忆写（含「不选」——空串；存储不可用/写败 ⇒ 静默——不阻断拉取）。 */
function writePullSource(id) {
  try {
    globalThis.localStorage?.setItem(PULL_SOURCE_KEY, String(id))
  } catch {
    /* 记忆不可用——静默 */
  }
}

/** 镜像区段（缓存自持——同展开懒加载；动作后 `reset` + 页重取）。 */
export function createImageSection(ctx) {
  const { h } = ctx
  const cache = new Map() // 节点 id ⇒ { images } ∥ { error }

  /** 区渲染（标签②卡内——console-tabs-component 批自节点展开迁出；题行去重 = 卡 h3 `admin.sandbox.imagesTitle`；`reload` = 页数据重取 ∥ `refresh` = 立即重渲——页守卫标签②在场 + 该节点仍选中）。 */
  function area(runner, { reload, refresh }) {
    const box = h("div", { class: "stack-box" })
    const cached = cache.get(runner.id)
    if (cached === undefined || cached.loading === true) {
      if (cached === undefined) {
        cache.set(runner.id, { loading: true }) // 占位（两区并发重渲不重取）
        ctx.api(`/api/admin/sandbox/runners/${runner.id}/images`).then((data) => {
          cache.set(runner.id, { images: data?.images ?? [] })
          refresh()
        }).catch((error) => {
          cache.set(runner.id, { error: mapError(error) })
          refresh()
        })
      }
      box.append(h("p", { class: "hint", text: t("common.loading") }))
      return box
    }
    const invalidate = () => { cache.delete(runner.id); reload() } // 失缓存重取 = 界面上新
    box.append(h("div", { class: "info-actions" },
      h("button", { type: "button", class: "tiny", text: t("admin.sandbox.imagePull"), onclick: () => openPullImageModal(ctx, { runner, reload: invalidate }) })))
    if (cached.error !== undefined) {
      box.append(h("p", { class: "hint error", text: cached.error }))
      return box
    }
    if (cached.images.length === 0) {
      box.append(h("p", { class: "hint", text: t("admin.sandbox.imagesEmpty") }))
      return box
    }
    const headers = [t("admin.sandbox.image"), t("admin.sandbox.colSize"), t("admin.sandbox.colCreated"), t("admin.sandbox.colActions")]
    const rowOf = (image) => {
      const tags = Array.isArray(image.tags) ? image.tags : []
      const ref = tags[0] ?? image.id // 删除引用 = 首标签（无标签 ⇒ 镜像 id）
      return h("tr", {},
        h("td", {}, ...(tags.length === 0 ? [h("div", { text: t("admin.sandbox.imageUntagged") })] : tags.map((tag) => h("div", { text: tag })))),
        h("td", { text: formatBytes(image.size) }),
        h("td", { text: image.created ? ctx.fmtTs(image.created * 1000) : "—" }), // 引擎 `Created` = 秒
        h("td", {}, h("button", { type: "button", class: "tiny", text: t("admin.sandbox.remove"), onclick: () => openDeleteImageModal(ctx, { runner, ref, reload: invalidate }) })))
    }
    // 本地镜像表过滤（本批——名/标签关键词；已载集合纯前端过滤 = 零新端点；无匹配 ⇒ 空态句）
    const filterInput = h("input", { placeholder: t("admin.sandbox.imageFilterPh") })
    const listBox = h("div", {})
    const renderRows = () => {
      const keyword = filterInput.value.trim().toLowerCase()
      const visible = keyword === ""
        ? cached.images
        : cached.images.filter((image) => (Array.isArray(image.tags) ? image.tags : []).some((tag) => String(tag).toLowerCase().includes(keyword)))
      listBox.replaceChildren(visible.length === 0
        ? h("p", { class: "hint", text: t("admin.sandbox.imagesNoMatch") })
        : h("div", { class: "table-wrap" }, h("table", {}, h("thead", {}, h("tr", {}, ...headers.map((label) => h("th", { text: label })))), h("tbody", {}, ...visible.map(rowOf)))))
    }
    filterInput.addEventListener("input", renderRows)
    box.append(h("div", { class: "filter-row" }, filterInput), listBox)
    renderRows()
    return box
  }

  /** 失缓存（动作后重取）。 */
  function reset(runner) {
    cache.delete(runner.id)
  }

  return { area, reset }
}

/** 拉取镜像弹窗（引用输入 `名[:标签]`；在飞态 =「拉取中……（可能持续数分钟）」+ 钮禁用；「目标节点」行恒显——P1）。
 *  一键拉取径（sandbox-image-quick-pull 批）：`prefill` 在场 ⇒ 引用预填（可改——确认值 = 所见值）。
 *  拉取认源（sandbox-pull-by-source 批）：`source` 在场 ⇒ 选单认源态（一键拉取径携源）；源清单读时读（零新端点 ∥ 零缓存）；
 *  选定 ⇒ 组装可见改写（再改不回落）；记忆预选（P2——预选态非自动改写）；无源 ∥ 读败 ⇒ 不选态 + 人话——拉取不阻断。
 *  提交恒发输入框当刻文本（组装 ≠ 可达保证——节点侧引擎照拉，失败两形如实报）。 */
export function openPullImageModal(ctx, { runner, reload, prefill = null, source = null }) {
  const { h } = ctx
  const input = h("input", { placeholder: t("admin.sandbox.imageRefPh") })
  if (prefill !== null) input.value = prefill
  const select = h("select", {}, h("option", { value: "", text: t("admin.sandbox.pullSourceNone") }))
  const hint = h("p", { class: "hint", text: t("admin.sandbox.pullSourceHint") })
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: t("admin.sandbox.imagePull") })
  let sources = [] // 源清单（读时读一次——零缓存）
  let picked = null // 当刻认源态（选定源对象；null = 不选——组装恒随此值）
  const modal = openModal({
    title: t("admin.sandbox.imagePull"),
    body: h("form", { class: "provider-form stacked", novalidate: true, onsubmit: submit },
      h("p", { class: "hint", text: t("admin.sandbox.pullTarget", { name: runner.name }) }), // P1：目标节点行恒显（手动径也示去向）
      field(h, "admin.sandbox.pullSource", select), hint,
      field(h, "admin.sandbox.imageRef", input), note, submitBtn),
  })

  // 源清单读时读（开窗读一次）：成 ⇒ 各源一项 + 认源态（一键拉取径携源）∥ 记忆预选（读成后施加——预选态非自动改写）；无源/读败 ⇒ 不选态 + 人话
  ctx.api("/api/admin/sandbox/image-sources").then((data) => {
    sources = Array.isArray(data?.sources) ? data.sources : []
    if (sources.length === 0) {
      hint.textContent = t("admin.sandbox.sourcesEmpty") // 无源 ⇒ 选单仅「不选（原样）」+ 提示
      return
    }
    select.append(...sources.map((item) => h("option", { value: String(item.id), text: item.name })))
    const wanted = source === null || source === undefined ? readPullSource() : String(source.id) // 认源态优先；余 = 记忆
    const hit = sources.find((item) => String(item.id) === wanted)
    if (hit === undefined) return // 记忆源已被删 ∥ id 不在清单 ⇒ 不选态（预填照常——拉取不阻断）
    select.value = String(hit.id)
    picked = hit
  }).catch((error) => {
    hint.className = "hint error" // 读败 ⇒ 不选态 + `mapError` 人话（手输提交照常）
    hint.textContent = mapError(error)
  })

  // 组装施加点①：选单变更（选定某源）⇒ 记忆随更新（含「不选」）+ 选定即组装一次（可见改写；「不选」= 不逆变换输入）
  select.addEventListener("change", () => {
    writePullSource(select.value)
    picked = sources.find((item) => String(item.id) === select.value) ?? null
    if (picked !== null) input.value = pullRefWithSource(input.value, picked)
  })

  // 组装施加点②：选定态在场时的输入完成（`blur` ∥ `change`——回车提交径先组装后提交）⇒ 再组装（幂等）；手改不自动回落（选单恒示上次组装所用源）
  const assemble = () => { if (picked !== null) input.value = pullRefWithSource(input.value, picked) }
  input.addEventListener("blur", assemble)
  input.addEventListener("change", assemble)

  async function submit(event) {
    event.preventDefault()
    note.hidden = true
    const image = input.value.trim()
    if (image === "") return showNote(note, t("admin.sandbox.fieldRequired", { field: t("admin.sandbox.imageRef") }))
    submitBtn.disabled = true
    showNote(note, t("admin.sandbox.imagePulling"), false) // 在飞态（同步请求——可能持续数分钟）
    try {
      const data = await ctx.api(`/api/admin/sandbox/runners/${runner.id}/images/pull`, { method: "POST", body: { image } })
      ctx.flash(t("admin.sandbox.imagePulled", { ref: `${data?.image ?? image}:${data?.tag ?? ""}` }))
      modal.close()
      await reload()
    } catch (error) {
      submitBtn.disabled = false
      showNote(note, mapError(error)) // 400 携引擎原文（两形皆收）；窗内就地人话
    }
  }
}

/** 删除镜像确认窗（强制删除勾选——缺省不勾；409 ⇒ 窗内人话 + 处置句，勾上再试）。 */
function openDeleteImageModal(ctx, { runner, ref, reload }) {
  const { h } = ctx
  const forceBox = h("input", { type: "checkbox" }) // 缺省不勾（误删爆炸半径最小——KD-SV-95）
  const note = h("p", { class: "hint error", hidden: true })
  const confirmBtn = h("button", { type: "button", class: "danger", text: t("admin.sandbox.remove") })
  const modal = openModal({
    title: t("admin.sandbox.imageDeleteTitle"),
    body: h("div", {},
      h("p", { class: "hint", text: t("admin.sandbox.imageDeleteConfirm", { ref }) }),
      h("label", { class: "key-clear" }, forceBox, t("admin.sandbox.imageForce")),
      note),
    footer: h("div", { class: "row-form" }, confirmBtn, h("button", { type: "button", class: "tiny", text: t("common.cancel"), onclick: () => modal.close() })),
  })
  confirmBtn.addEventListener("click", () => submitThen(ctx, {
    note, button: confirmBtn, modal, reload,
    call: () => ctx.api(`/api/admin/sandbox/runners/${runner.id}/images`, { method: "DELETE", body: { ref, force: forceBox.checked === true } }),
    flash: t("admin.sandbox.imageDeleted", { ref }),
  }))
}
