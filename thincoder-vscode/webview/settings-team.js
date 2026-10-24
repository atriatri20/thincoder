/**
 * settings-team.js — 团队卡（第 6 卡——B1 批 · 台账 #1212；登录面补全批收正——卡 = 管理面 · 台账 #1231）。
 *
 * 端面契约 = `docs/vsc/design/SETTINGS.md` §2.20（条 6 收正：登录表单与退出钮自卡内退场——登/退 =
 * 首启板团队卡 ∥ 状态栏团队 item + 命令 `thincoder.team`；「轮换」控件 = team-token-rotation 批增——已登录
 * 在场，确认一步（确认/取消两键就地）+ 结果行）；机制单源 =
 * `docs/core/design/TEAM.md` §2（本档不复制——D2）。端侧零自写盘（写面全走宿主 → 核 `team.mjs`）；
 * 状态缓存 = 模块内单一变量（快照经 `teamStatus` 推送落——单一状态源 = config.json，面板整体重建制不变）。
 *
 * 卡面（管理面）= 端标签 + 详情（server ∥ member ∥ label）+ 「轮换」控件（已登录）+ 未登录句；**零登/退控件**。读面
 * `{ loggedIn, server, member, label }` 形零改（`verify` 态住宿主 item——零出站）；写面消息面
 * （`teamLogin` ∥ `teamLogout` ∥ `teamRotate`）。
 * 回执两消费位保留 = 一次性提示行（提示 = 登录/退出当刻事件；本卡屏外的登/退面 = 首启板 ∥ 命令流，
 * 消息到场时就地显）；两词表**导出**（单一 owner——首启板团队表单复用同两表——零第二副本）。
 */
import { escHtml } from "./ui.js"
import { t } from "./i18n.js"

/** 最近一次团队态快照（`teamStatus` 推送载荷——`{ loggedIn, server, member, label }`）。 */
let _teamStatus = null

/** 轮换确认态（卡内一次性两键——确认 ∥ 取消；确认/取消 ∥ 态快照变更 ⇒ 复位）。 */
let _rotateConfirming = false

/** 失败理由域（码 → 词键——五值闭集单源 = `TEAM.md` §2.5「失败理由域」；码不携文）。 */
const FAIL_WORD = Object.freeze({
  network: "settings.team.fail.network",
  credentials: "settings.team.fail.credentials",
  rate_limited: "settings.team.fail.rateLimited",
  write_failed: "settings.team.fail.writeFailed",
  invalid: "settings.team.fail.invalid",
})

/** 一次性提示码 → 词键（`notice = "manual-name-conflict"`——登录当刻就地提示）。 */
const NOTICE_WORD = Object.freeze({
  "manual-name-conflict": "settings.team.notice.manualNameConflict",
})

/** 词化：表内出词；表外原样直传（含原始码串）；缺 ∥ 空 ⇒ null（零节点）。 */
function wordOf(table, code) {
  if (code === null || code === undefined || code === "") return null
  const key = Object.hasOwn(table, code) ? table[code] : null
  return key === null ? String(code) : t(key)
}

/** 失败句出词（导出——首启板团队表单同表复用；表外码原样直传）。 */
export function teamFailWord(reason) {
  return wordOf(FAIL_WORD, reason)
}

/** 一次性提示句出词（导出——首启板团队表单同表复用）。 */
export function teamNoticeWord(code) {
  return wordOf(NOTICE_WORD, code)
}

/** 成员显示名（`member.name ?? member.username`——设计字面同序；两缺 ⇒ 「—」）。 */
function memberText(member) {
  if (!member || typeof member !== "object") return "—"
  return member.name ?? member.username ?? "—"
}

/** 团队卡 HTML（管理面）：已登录 = 端标签 + 详情（server ∥ member ∥ label）三读数；未登录 = 未登录句；
 *  零登/退控件（登/退 = 首启板团队卡 ∥ 状态栏 item + 命令 `thincoder.team`）。 */
export function teamCardHtml() {
  const st = _teamStatus || {}
  let html = `<section id="team-card" class="settings-card"><h4 class="settings-card-title">${t("settings.teamSection")}</h4><div class="settings-card-body">`
  if (st.loggedIn === true) {
    html += `<div class="team-admin-row"><span class="team-admin-label">${t("settings.team.server")}</span><span class="team-admin-value">${escHtml(st.server || "—")}</span></div>`
    html += `<div class="team-admin-row"><span class="team-admin-label">${t("settings.team.memberLabel")}</span><span class="team-admin-value">${escHtml(memberText(st.member))}</span></div>`
    html += `<div class="team-admin-row"><span class="team-admin-label">${t("settings.team.labelLabel")}</span><span class="team-admin-value">${escHtml(st.label || "—")}</span></div>`
    if (_rotateConfirming) {
      html += `<div class="team-rotate-confirm" style="font-size:12px;opacity:0.85;padding:2px 0" data-team-rotate-confirm>${escHtml(t("settings.team.rotateConfirm"))}</div>`
      html += `<div class="team-rotate-actions"><button class="key-btn" type="button" onclick="window._teamRotateConfirm()">${t("settings.team.rotate")}</button>`
      html += `<button class="key-btn" type="button" onclick="window._teamRotateCancel()">${t("settings.cancel")}</button></div>`
    } else {
      html += `<div class="team-rotate-actions"><button class="key-btn" type="button" data-team-rotate onclick="window._teamRotateStart()">${t("settings.team.rotate")}</button></div>`
    }
  } else {
    html += `<div id="team-hint" style="font-size:12px;opacity:0.7;padding:2px 0">${t("settings.team.notLoggedIn")}</div>`
  }
  html += `<div id="team-notice" style="font-size:12px;opacity:0.85;padding:2px 0;display:none"></div>`
  html += `</div></section>`
  return html
}

/** 卡内提示行（一次性提示 ∥ 失败出词；空 ⇒ 隐藏）。 */
function setTeamNotice(text) {
  const el = document.getElementById("team-notice")
  if (!el) return
  if (text === null || text === undefined || text === "") {
    el.textContent = ""
    el.style.display = "none"
    return
  }
  el.textContent = String(text)
  el.style.display = "block"
}

/** `teamStatus` 推送消费（§2.20 读面）：存快照 + 变更拍且面板开而在位 ⇒ 就地重绘（两态切换 ∥
 *  读数行刷新）；同值快照（打开/保存拍快照族重发）⇒ 零重绘（沿 `updateProviderStatus` 变更门同判
 *  ——免无谓 DOM 重建 ∥ 免碰未聚焦在编值）。 */
export function updateTeamStatus(payload) {
  const next = {
    loggedIn: payload?.loggedIn === true,
    server: payload?.server ?? null,
    member: payload?.member ?? null,
    label: payload?.label ?? null,
  }
  const changed = JSON.stringify(_teamStatus) !== JSON.stringify(next)
  _teamStatus = next
  if (!changed) return
  _rotateConfirming = false // 态快照变更 ⇒ 确认段复位（一次性面态）
  rerenderTeamCard()
}

/** 就地重绘（两态切换 ∥ 读数刷新）。输入聚焦中 ⇒ 本拍只存快照不重绘（用户输入优先于推送——
 *  沿 U-S10 ∥ §2.18 在编守卫同判）。面板未开 ⇒ 零动作（下次建面渲染）。 */
function rerenderTeamCard() {
  const card = document.getElementById("team-card")
  if (!card) return
  const panel = document.getElementById("settings-panel")
  if (!panel || panel.style.display !== "flex") return
  const active = document.activeElement
  if (active && active.tagName === "INPUT" && card.contains(active)) return
  card.outerHTML = teamCardHtml()
}

/** `teamLoginResult` 回执消费：成 + `notice` ⇒ 同名冲突句（登录当刻就地提示）；败 ⇒ 失败出词（四句）。 */
export function onTeamLoginResult(result) {
  if (result?.ok === true) {
    setTeamNotice(result.notice ? teamNoticeWord(result.notice) : null)
    return
  }
  setTeamNotice(teamFailWord(result?.reason))
}

/** `teamLogoutResult` 回执消费：`revokeDelivered === false` ⇒「服务端吊销未达」（退出当刻就地提示）；
 *  败 ⇒ 失败出词。 */
export function onTeamLogoutResult(result) {
  if (result?.ok === true) {
    setTeamNotice(result.revokeDelivered === false ? t("settings.team.notice.revokeUndelivered") : null)
    return
  }
  setTeamNotice(teamFailWord(result?.reason))
}

/** 轮换确认段入口（卡内就地两键——确认/取消；非原生弹窗）。 */
export function teamRotateStart() {
  _rotateConfirming = true
  rerenderTeamCard()
}

/** 取消（零动作——零发值）。 */
export function teamRotateCancel() {
  _rotateConfirming = false
  rerenderTeamCard()
}

/** 确认：确认段先退场（一次性面态），再发 `teamRotate` 上行（回执 = `onTeamRotateResult` 落地）。 */
export function teamRotateConfirm() {
  _rotateConfirming = false
  rerenderTeamCard()
  window._vscode?.postMessage({ type: "teamRotate" })
}

/** `teamRotateResult` 回执消费：成 ⇒ 成句（「已轮换——本机已改用新 token」）；败 ⇒ 失败出词（含 `invalid`
 *  ⇒「已失效——重新登录」）。 */
export function onTeamRotateResult(result) {
  if (result?.ok === true) {
    setTeamNotice(t("settings.team.rotateDone"))
    return
  }
  setTeamNotice(teamFailWord(result?.reason))
}

// 卡内控件 inline onclick 入口（窗口面——沿 `settings-providers.js` `_editKey` 同制；非 DOM 面零挂）。
if (typeof window !== "undefined") {
  window._teamRotateStart = teamRotateStart
  window._teamRotateCancel = teamRotateCancel
  window._teamRotateConfirm = teamRotateConfirm
}
