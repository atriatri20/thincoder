/**
 * views-me-chat-pull.mjs — 成员·对话页·拉取弹窗与凭据就地绑（`webui/CHAT.md` §2.2 差异③；机制 = `agent/MEMBER-AGENT.md` §3.6 + KD-SV-215）：
 * 自 `views-me-chat.mjs` 外拆（拆档缘由 = 该件越 500 软线——增行前先外拆；沿 `views-chat-messages.mjs` 先例）；面内两族：
 * ① 拉取弹窗 = 可见项目清单（`GET /api/projects?q=` 复用——含搜索）+ 目标目录 + `POST …/pulls` + 四态轮询（`queued`/`running`/`done`/`failed` 人话；
 *    失败 `detail` 原文直呈）；② 凭据就地绑（KD-SV-215）= 提交前预检（`GET /api/me/git-credentials` 清单对 host = 项目 address 首段小写）
 *    ⇒ 缺 ⇒ 窗内表单（主机只读 ∥ 用户名 ∥ 令牌）⇒ 保存（`PUT`）成功即**自动续拉**（无二次点击）；公开仓「跳过」不录直拉 ∥ 预检失败 ⇒ 降级直 POST ∥
 *    失败 `kind:"auth"` ⇒ 同窗更新（用户名按已取清单预填）∥ 项目变更（选择 ∥ 搜索重铺致所选变化）⇒ 凭据区复位（防密文绑错 host）。零新端点零新错误码（清单/存件/拉仓三既有面复用——服务端语义零改）；零客户端校验（服务端消息即人话）。
 * `views-me-chat.mjs` 面 `export … from "./views-me-chat-pull.mjs"` 兼容重导出（两纯件——既有测试面零改）。
 */
import { mapError, t } from "./i18n.mjs"
import { field, openModal, showNote } from "./modal.mjs"

/** 拉取状态轮询间隔（读时轮询——服务端 = 进程内存读数；窗口短，2s 量级足）∥ 四态文案键（§2.2 差异③「四态人话」——枚举外 ⇒ `null`＝原值兜底）。 */
export const PULL_POLL_MS = 2000
const PULL_STATE_KEYS = { queued: "me.chat.pullQueued", running: "me.chat.pullRunning", done: "me.chat.pullDone", failed: "me.chat.pullFailed" }
/** 拉取状态文案（纯函数）：四值命中 ⇒ 文案 ∥ 枚举外 ⇒ `null`（零假造）。 */
export function pullStateLabel(state) {
  const key = PULL_STATE_KEYS[state]
  return key === undefined ? null : t(key)
}

/** 拉取失败详情取文（服务端 detail = 对象 `{kind, message, dir}` ∥ 奇形直值；对象取 `message`，否则空串——设计句「服务端 detail 原文直呈」）。 */
export function pullDetailText(detail) {
  if (detail !== null && typeof detail === "object") return String(detail.message ?? "")
  return String(detail ?? "")
}

/** 主机段（凭据预检/绑定键）：项目 address 首段小写——与 `src/agent/member-pull.mjs` 的 `hostOfAddress` 同判；
 *  小写归一 = 服务端存键形（`src/agent/member-cred.mjs` `normalizeGitHost`）；首段前的 scheme 段为防御剥离（盘上 address 已由
 *  `src/project/projects.mjs` `normalizeAddress` 归一——残留 ⇒ 判错 host ⇒ 预检恒缺）。 */
export function hostOfAddress(address) {
  const text = String(address ?? "").trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, "")
  return text.split("/")[0].toLowerCase()
}

/**
 * 拉仓弹窗（相③）：项目选择/目录 ∥ 凭据区（KD-SV-215 三态：A 在册 ∥ 缺 ∥ 无效）∥ 四态轮询。
 * 凭据区字段沿用账户页卡键族（`me.gitCred.*`——同形同键）；字段内容首揭示时构建一次。
 * @param {{h: Function, api: Function, fail: Function, flash: Function}} ctx 视图上下文（`app.mjs` `viewCtx()` 形）
 * @param {{wsId: number|string}} opts 目标工作区 id（当刻会话所属——调用侧点选时解析）
 */
export function openPullModal(ctx, { wsId }) {
  const { h } = ctx
  const search = h("input", { type: "search", placeholder: t("me.chat.pullSearchPh") })
  const select = h("select", {}, h("option", { value: "", text: t("common.loading") }))
  const dirInput = h("input", { type: "text", placeholder: t("me.chat.pullDirPh") })
  // ── 凭据区（缺/无效两态揭示——主机只读 = 项目 host；用户名/令牌 = `me.gitCred.*` 键族复用；零客户端校验）──
  //    字段首揭示时构建一次（未揭示的窗内不留隐藏字段——取数面 = 输入序不变：项目 ∥ 目录）
  const credBox = h("div", { class: "stack", hidden: true })
  const credNeed = h("p", { class: "hint" })
  const hostInput = h("input", { type: "text", readonly: "readonly" })
  const userInput = h("input", { type: "text", placeholder: t("me.gitCred.userPh") })
  const secretInput = h("input", { type: "password", autocomplete: "new-password", placeholder: t("me.gitCred.secretPh") })
  let credBuilt = false
  const note = h("p", { class: "hint error", hidden: true })
  const submitBtn = h("button", { type: "submit", text: t("me.chat.pullSubmit") })
  const skipBtn = h("button", { type: "button", class: "tiny", text: t("me.chat.pullCredSkip"), hidden: true, onclick: () => { void skip() } })
  const retryBtn = h("button", { type: "button", class: "tiny", text: t("me.chat.retry"), hidden: true, onclick: () => { void onSubmit() } })
  let projects = []
  let closed = false
  let timer = null
  let phase = "A" // A（凭据在册/未判定——现状径）∥ "missing"（缺——表单揭示）∥ "invalid"（auth 失败——表单复现）
  let host = "" // 当刻项目 host（表单只读展示 ∥ `PUT` 字段——提交时捕获）
  let credentials = null // 最近一次清单读数（预检结果——用户名预填源；未取 ⇒ null）
  const form = h("form", { class: "provider-form stacked", novalidate: true, onsubmit: (event) => { event.preventDefault(); void onSubmit() } },
    field(h, "me.chat.pullProject", search, select),
    field(h, "me.chat.pullDir", dirInput),
    credBox,
    note,
    h("div", { class: "row-form" }, submitBtn, skipBtn, retryBtn))
  const modal = openModal({
    title: t("me.chat.pull"),
    body: h("div", {}, form),
    onClose: () => { closed = true; if (timer !== null) clearTimeout(timer) },
  })
  submitBtn.disabled = true

  /** 凭据区复位（项目选择变更 ⇒ 复位态 A + 清用户/密字段——防密文绑错 host；零网络零 `PUT`）。 */
  function resetCred() {
    phase = "A"
    host = ""
    credentials = null
    hostInput.value = ""
    userInput.value = ""
    secretInput.value = ""
    credNeed.textContent = ""
    credBox.hidden = true
    skipBtn.hidden = true
    retryBtn.hidden = true
    note.hidden = true
    submitBtn.textContent = t("me.chat.pullSubmit")
  }
  /** 凭据区揭示（缺/无效两态）：主机只读 = 项目 host ∥ 用户名按已取清单预填 ∥ 跳过（缺）∥ 重试（无效）各就其位。 */
  function revealCred(nextPhase, username) {
    if (!credBuilt) {
      credBuilt = true
      credBox.append(
        credNeed,
        field(h, "me.gitCred.hostLabel", hostInput),
        field(h, "me.gitCred.userLabel", userInput),
        field(h, "me.gitCred.secretLabel", secretInput),
        h("p", { class: "hint", text: t("me.gitCred.secretHint") }),
      )
    }
    phase = nextPhase
    hostInput.value = host
    userInput.value = username ?? ""
    secretInput.value = ""
    credNeed.textContent = t("me.chat.pullCredNeed", { host })
    credBox.hidden = false
    skipBtn.hidden = nextPhase !== "missing"
    retryBtn.hidden = nextPhase !== "invalid"
    submitBtn.textContent = t("me.chat.pullCredSave")
    userInput.focus()
  }
  /** 已取清单内当刻 host 的用户名（预填源——无该行 ∥ 未取 ⇒ 空串）。 */
  function prefillUsername() {
    if (!Array.isArray(credentials)) return ""
    const row = credentials.find((item) => String(item?.host ?? "").toLowerCase() === host)
    return row === undefined ? "" : String(row.username ?? "")
  }
  /** 预检（提交前——`GET /api/me/git-credentials` 清单对 host）：出 = 真（凭据在册——直进拉取）∥ 假（缺——表单已揭示，本径零 POST）；
   *  预检失败（网络/服务）⇒ 真（降级直进——服务端兜底语义零改）。 */
  async function precheck() {
    const asked = host // 在飞期选择变更（复位清 host）⇒ 回执弃置（零揭示——复位态 A 已由 change 径落定）
    try {
      const data = await ctx.api("/api/me/git-credentials")
      if (closed) return false
      credentials = Array.isArray(data?.credentials) ? data.credentials : []
      if (host !== asked) return false
      if (credentials.some((item) => String(item?.host ?? "").toLowerCase() === host)) return true
      revealCred("missing", "")
      return false
    } catch { return true }
  }
  /** 拉取执行（续拉 ∥ 跳过共径）：`POST …/pulls` ⇒ 四态轮询（同参 = 提交捕获——无二次点击）。 */
  async function pullNow(target, dir) {
    submitBtn.disabled = true
    try {
      const data = await ctx.api(`/api/me/sandbox/workspaces/${wsId}/pulls`, { method: "POST", body: dir === "" ? { projectId: target.id } : { projectId: target.id, dir } })
      if (closed) return
      if (data?.pullId === undefined || data?.pullId === null) { submitBtn.disabled = false; showNote(note, t("me.chat.pullFailed")); return }
      showNote(note, t("me.chat.pullQueued"), false)
      void poll(data.pullId)
    } catch (error) { if (closed) return; submitBtn.disabled = false; showNote(note, mapError(error)) }
  }
  /** 提交入口（form submit ∥ 重试钮同链）：捕获 target+dir ⇒ A 相先预检（缺 ⇒ 揭示态，本径零 POST）⇒ 缺/无效相先保存（`PUT` 恰一）⇒ 自动续拉。 */
  async function onSubmit() {
    if (submitBtn.disabled) return // 在飞守卫（提交/跳过/重试三径同门——双击零双发）
    note.hidden = true
    const target = projects[Number(select.value)]
    if (target === undefined) return
    const dir = dirInput.value.trim()
    // 目标变更守卫：搜索重铺清单（随打随读）后当刻所选可能已换宿主 —— 与揭示期捕获的 host 不符 ⇒ 复位态 A 重走预检
    // （同 ⑦ 理由：防密文绑错 host——录下的令牌绝不落到非当刻所选项目的 host 上）
    if ((phase === "missing" || phase === "invalid") && hostOfAddress(target.address) !== host) resetCred()
    if (phase === "A") {
      host = hostOfAddress(target.address)
      submitBtn.disabled = true
      const hasCredential = await precheck()
      if (closed) return
      if (!hasCredential) { submitBtn.disabled = false; return } // 表单已揭示——待填录（表单期零网络调用）
    }
    if (phase === "missing" || phase === "invalid") {
      submitBtn.disabled = true
      try {
        const data = await ctx.api("/api/me/git-credentials", { method: "PUT", body: { host, username: userInput.value.trim(), secret: secretInput.value } })
        if (closed) return
        const row = data?.credential ?? null
        if (row !== null) credentials = [...(Array.isArray(credentials) ? credentials.filter((item) => String(item?.host ?? "").toLowerCase() !== host) : []), row]
      } catch (error) { if (closed) return; submitBtn.disabled = false; showNote(note, mapError(error)); return } // 形非法 ⇒ 400 人话（零客户端校验）
    }
    await pullNow(target, dir)
  }
  /** 跳过（缺凭据相——公开仓）：不录直拉（零 `PUT`）。 */
  async function skip() {
    if (submitBtn.disabled) return // 在飞守卫（同 `onSubmit`——跳过钮双击零双发）
    note.hidden = true
    const target = projects[Number(select.value)]
    if (target === undefined) return
    await pullNow(target, dirInput.value.trim())
  }
  /** 状态轮询（读时——服务端进程内存读数）：`done` ⇒ 闭窗 + flash ∥ `failed` ⇒ 人话 + `kind:"auth"` ⇒ 同窗更新（用户名预填）。 */
  async function poll(pullId) {
    if (closed) return
    try {
      const data = await ctx.api(`/api/me/sandbox/workspaces/${wsId}/pulls/${pullId}`)
      if (closed) return
      const state = String(data?.state ?? "")
      const detailText = pullDetailText(data?.detail)
      if (state === "done") { modal.close(); ctx.flash(detailText === "" ? t("me.chat.pullDone") : `${t("me.chat.pullDone")}: ${detailText}`); return }
      if (state === "failed") {
        showNote(note, detailText === "" ? t("me.chat.pullFailed") : `${t("me.chat.pullFailed")}: ${detailText}`)
        submitBtn.disabled = false
        if (data?.detail !== null && typeof data?.detail === "object" && data.detail.kind === "auth") revealCred("invalid", prefillUsername())
        return
      }
      showNote(note, pullStateLabel(state) ?? (detailText === "" ? state : detailText), false)
      timer = setTimeout(() => { timer = null; void poll(pullId) }, PULL_POLL_MS)
    } catch (error) { if (closed) return; ctx.fail(error); showNote(note, mapError(error)); submitBtn.disabled = false }
  }
  /** 项目清单取数（搜索随打随读——窗口小；空清单 ⇒ 提示项 + 提交门）∥ 选择变更 ⇒ 凭据区复位（防密文绑错 host）。 */
  async function loadProjects(q) {
    try {
      const data = await ctx.api(`/api/projects?q=${encodeURIComponent(q)}`)
      if (closed) return
      projects = Array.isArray(data?.projects) ? data.projects : []
      select.replaceChildren(...(projects.length === 0
        ? [h("option", { value: "", text: t("me.chat.noProjects") })]
        : projects.map((project, index) => h("option", { value: String(index), text: String(project?.displayName ?? project?.address ?? "—") }))))
      submitBtn.disabled = projects.length === 0
    } catch (error) { if (closed) return; ctx.fail(error); showNote(note, mapError(error)) }
  }

  select.addEventListener("change", () => { resetCred() })
  search.addEventListener("input", () => { void loadProjects(search.value) })
  void loadProjects("")
}
