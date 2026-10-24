/**
 * settings-sections-team.mjs — 团队段体族（B1 批 · 2026-10-10 · 台账 #1212；**登录面补全批收正** —— 台账 #1231；
 *   **team-token-rotation 批增段「轮换」控件** —— 台账 #1238）：
 *   `teamAdminBody` = 设置面「团队」段体（**管理面** —— 详情三行 server ∥ member ∥ label，**零登/退控件**）；
 *   `teamBody` = 登/退面段体（**状态段就地面板**消费 —— 单一实现；未登录 = 表单 ∥ 已失效 = 失效行 + 重登面 ∥ 已登录 = 状态行 + 退出钮）；
 *   `fieldPair` ∥ `noticeNode` 入导出面（首启向导团队表单复用 —— 三字段 ∥ 结果行单一 owner）。
 *
 * 面形（单源 = `docs/desktop/design/SETTINGS.md` §2.22 ∥ `docs/core/design/TEAM.md` §2.5 ∥ §2.6）：
 *   未登录（`loggedIn` 假）= 表单（服务器地址 ∥ 用户名 ∥ 密码 三字段 + 登录钮）+ 提示行「未登录——登录后可用」；
 *   已失效（`loggedIn` 真 ∧ `verify === "invalid"`）= 失效行（核字典键 `status.team.invalid` —— 经核字典投影直取，零副本）+ 重登面（同表单 —— 预填留存值）；
 *   已登录 = 状态行三读（服务器地址 ∥ 成员 ∥ 端标签）+ 「轮换」控件（确认一步——确认/取消两键就地）+ 「退出登录」钮；
 *   段内结果行（**当刻一次性**——`team:status` 复读不携提示字段）：登录失败五句（逐字同句）∥ 同名冲突 ∥ 吊销未达 ∥ 轮换成句
 *   （「已轮换——本机已改用新 token」）—— 该两包逐字同句。
 * 草稿保真（#604 口径）：地址 ∥ 用户名携 `data-draft`（重建保真）；**密码恒不保真**（不申报 ⇒ 重建即清空——安全面有意）。
 * 纪律：零 DOM（描述符树）· 文案一律经 `t()`、零字形字面 · 零 `node:` ∕ 零裸包 ∕ 零 `store.mjs` import。
 */
import { t } from "../i18n.mjs"
import { wire } from "./chat-tool.mjs"

/** 非空串归一：非串 / 空串 ⇒ `null`（缺值零节点 —— 禁假造）。 */
const str = (value) => (typeof value === "string" && value !== "" ? value : null)

/** 成员读数（`member` 切片 `{ username, name }`）：显示名优先、回落用户名；两缺 ⇒ `null`（零假读数）。 */
function memberOf(member) {
  return str(member?.name) ?? str(member?.username)
}

/** 团队失败码 → 词键（**五值闭集**——单源 = `docs/core/design/TEAM.md` §2.5）；表外 ⇒ 原样直传（零吞 —— 沿失败面词表通则）。 */
const TEAM_REASON_WORD = Object.freeze({
  network: "settings.team.reason.network",
  credentials: "settings.team.reason.credentials",
  rate_limited: "settings.team.reason.rateLimited",
  write_failed: "settings.team.reason.writeFailed",
  invalid: "settings.team.reason.invalid",
})

/** 段内结果行文字（`notice` 切片四形；缺 ∥ 形不合 ⇒ `null` ⇒ 零节点）：失败句 ∥ 同名冲突 ∥ 吊销未达 ∥ 轮换成句。 */
function noticeWord(notice) {
  if (notice === null || typeof notice !== "object") return null
  if (notice.kind === "manualConflict") return t("settings.team.notice.manualNameConflict")
  if (notice.kind === "revokeFailed") return t("settings.team.notice.revokeNotDelivered")
  if (notice.kind === "rotateDone") return t("settings.team.rotateDone")
  if (notice.kind === "failure") {
    const code = str(notice.reason)
    if (code === null) return null
    return Object.hasOwn(TEAM_REASON_WORD, code) ? t(TEAM_REASON_WORD[code]) : code
  }
  return null
}

/** 结果行（段内就地 —— 当刻一次性事件；`data-team-notice` = 机检锚）。**入导出面**（首启向导团队表单消费——单一实现）。 */
export function noticeNode(notice) {
  const word = noticeWord(notice)
  if (word === null) return null
  return { tag: "div", props: { class: "settings-notice", "data-team-notice": notice.kind }, children: [word] }
}

/** 字段两片（标词 + 输入）：`id` ∥ `name` 同源；`draft` 真 ⇒ 携 `data-draft`（#604 捕获域——密码不申报）。
 *  **入导出面**（首启向导团队表单复用——单一 owner）。 */
export function fieldPair(id, name, type, labelWord, value, draft) {
  return [
    { tag: "label", props: { class: "settings-field-label", for: id }, children: [t(labelWord)] },
    { tag: "input", props: { class: "settings-field", id, name, type, ...(draft ? { "data-draft": "" } : {}), value } },
  ]
}

/** 未登录面：登录表单（地址 ∥ 用户名 ∥ 密码 + 登录钮）+ 提示行「未登录——登录后可用」（逐字同句——`TEAM.md` §2.5）。
 *  表单作用域 `data-draft-scope = team`（写成功径失效声明自表单携 —— 单源在视图）。
 *  `hint` 假（**已失效**面）⇒ 提示行退场（该面状态行 = 失效行 —— 两行不同时在场，免「未登录」与「已失效」矛盾）；表单本身零改。 */
function loginFormNode(section, handlers, hint = true) {
  const onLogin = typeof handlers?.onTeamLogin === "function" ? handlers.onTeamLogin : undefined
  return [
    {
      tag: "form",
      props: { class: "settings-form", "data-form": "team", "data-draft-scope": "team" },
      children: [
        ...fieldPair("team-server", "server", "text", "settings.team.serverLabel", str(section?.server) ?? "", true),
        { tag: "div", props: { class: "settings-empty", "data-team-server-hint": "" }, children: [t("settings.team.serverHint")] },
        ...fieldPair("team-username", "username", "text", "settings.team.usernameLabel", str(section?.member?.username) ?? "", true),
        // 密码恒不保真（#604 口径）：不携 `data-draft` ⇒ 重建即清空（安全面有意）。
        ...fieldPair("team-password", "password", "password", "settings.team.passwordLabel", "", false),
        {
          tag: "button",
          props: wire({ class: "settings-submit", type: "button", "data-action": "settings:teamLogin" }, onLogin),
          children: [t("settings.team.login")],
        },
      ],
    },
    ...(hint ? [{ tag: "div", props: { class: "settings-empty", "data-team-hint": "" }, children: [t("settings.team.loggedOut")] }] : []),
  ]
}

/** 状态行读（只读行 —— 名 + 值；值缺 ⇒ 零节点——禁空行）。 */
function statusRowNode(anchor, labelWord, value) {
  if (value === null) return null
  return {
    tag: "div",
    props: { class: "settings-row", "data-read": anchor },
    children: [
      { tag: "span", props: { class: "settings-row-name" }, children: [t(labelWord)] },
      { tag: "span", props: { class: "settings-row-value" }, children: [value] },
    ],
  }
}

/** 已登录面：状态行三读（server ∥ 成员 ∥ 端标签）+ 「退出登录」钮。 */
function statusNode(section, handlers) {
  const onLogout = typeof handlers?.onTeamLogout === "function" ? handlers.onTeamLogout : undefined
  return [
    statusRowNode("team-server", "settings.team.serverLabel", str(section?.server)),
    statusRowNode("team-member", "settings.team.memberLabel", memberOf(section?.member)),
    statusRowNode("team-label", "settings.team.labelLabel", str(section?.label)),
    {
      tag: "button",
      props: wire({ class: "settings-submit", type: "button", "data-action": "settings:teamLogout" }, onLogout),
      children: [t("settings.team.logout")],
    },
  ]
}

/** 段「轮换」控件 ∥ 确认一步（就地两键——非原生弹窗）：`section.notice.kind === "rotateConfirm"` ⇒ 确认段
 *  （确认句 + 「轮换」/「取消」两键）；否则 = 「轮换」入口件（`handlers.onTeamRotateStart` 开确认）。 */
function rotateControlNode(section, handlers) {
  if (section?.notice?.kind === "rotateConfirm") {
    const onYes = typeof handlers?.onTeamRotateConfirm === "function" ? handlers.onTeamRotateConfirm : undefined
    const onNo = typeof handlers?.onTeamRotateCancel === "function" ? handlers.onTeamRotateCancel : undefined
    return [
      { tag: "div", props: { class: "settings-notice", "data-team-rotate-confirm": "" }, children: [t("settings.team.rotateConfirm")] },
      { tag: "button", props: wire({ class: "settings-submit", type: "button", "data-action": "settings:teamRotateConfirm" }, onYes), children: [t("settings.team.rotate")] },
      { tag: "button", props: wire({ class: "settings-submit", type: "button", "data-action": "settings:teamRotateCancel" }, onNo), children: [t("question.cancel")] },
    ]
  }
  const onStart = typeof handlers?.onTeamRotateStart === "function" ? handlers.onTeamRotateStart : undefined
  return [{ tag: "button", props: wire({ class: "settings-submit", type: "button", "data-action": "settings:teamRotate" }, onStart), children: [t("settings.team.rotate")] }]
}

/** 管理面段体（**登录入口补全批收正** —— 卡降：label ∥ 详情；零登/退控件：登/退 = 状态段就地面板 ∥ 首启两路；
 *  段态门归分派面）：结果行 + 详情三行 = server ∥ member ∥ label（末行词键 `settings.team.labelLabel`）+
 *  「轮换」控件（已登录在场——team-token-rotation 批）。
 *  值缺 ⇒ 该行零节点（禁假造——沿 `statusRowNode` 同判；未登录 ∥ 从未登录 ⇒ 零空壳）。 */
export function teamAdminBody(section, handlers = {}) {
  return [
    noticeNode(section?.notice ?? null),
    statusRowNode("team-server", "settings.team.serverLabel", str(section?.server)),
    statusRowNode("team-member", "settings.team.memberLabel", memberOf(section?.member)),
    statusRowNode("team-label", "settings.team.labelLabel", str(section?.label)),
    ...(section?.loggedIn === true ? rotateControlNode(section, handlers) : []),
  ]
}

/** 失效行（**已失效**——引导重登：「已失效——重新登录」逐字 = 核字典键经投影直取，零副本）；`data-team-invalid` = 机检锚。 */
function invalidNode() {
  return { tag: "div", props: { class: "settings-notice", "data-team-invalid": "" }, children: [t("status.team.invalid")] }
}

/** 登/退面段体（面板消费 —— 单一实现；段态门归分派面）：结果行 + 失效行（已失效）+ 未登录 ∥ 已登录两面。
 *  **已失效（`verify === "invalid"`）⇒ 失效行 + 重登面**（表单 —— server ∥ 用户名预填自留存值；`TEAM.md` §2.6 引导重登）。 */
export function teamBody(section, handlers = {}) {
  const invalid = section?.verify === "invalid"
  const loginFace = section?.loggedIn !== true || invalid
  return [
    noticeNode(section?.notice ?? null),
    ...(invalid ? [invalidNode()] : []),
    ...(loginFace ? loginFormNode(section, handlers, !invalid) : statusNode(section, handlers)),
  ]
}
