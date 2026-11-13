/**
 * member-git-credentials.mjs — 成员面 git 凭据三端点（`gateway/API.md` §2.11 ∥ `agent/MEMBER-AGENT.md` §3.6 ∥ KD-SV-204；
 * member-face 二轮结构拆分——自 `member-routes.mjs` 拆出（越 500 行拆案），端点形与错误门逐字沿族）。
 *
 * 三端点：
 *  ① `GET /api/me/git-credentials`——清单（本人 host 序，零秘密）；
 *  ② `PUT /api/me/git-credentials`——绑定/更新（形非法 ⇒ 400 库零变）；
 *  ③ `DELETE /api/me/git-credentials/:host`——撤销（无该行 ⇒ 404 库零变）。
 *
 * 判权/错误形 = 沿族（本人过滤）；行存取 = `member-cred.mjs`（加密 CRUD——密列零回显 ∥ 审计
 * `credential_set`/`credential_revoke`）。
 * **零 import 环**：族内公共助手（`requireMember`）由注册侧经 `helpers` 传入（`member-routes.mjs`——拆档零第二实现）。
 */
import { HttpError, sendJson } from "../gateway/errors.mjs"
import { readJsonBody } from "../gateway/server.mjs"
import { listMemberCredentials, revokeMemberCredential, setMemberCredential } from "./member-cred.mjs"

/** 注册 git 凭据三端点（`member-routes.mjs` 调；`helpers` = 族内公共助手束）。 */
export function registerMemberGitCredentialRoutes(routes, { db, config = {}, now = Date.now, helpers } = {}) {
  if (!db) throw new Error("registerMemberGitCredentialRoutes：缺少 db")
  const { requireMember } = helpers ?? {}
  if (typeof requireMember !== "function") {
    throw new Error("registerMemberGitCredentialRoutes：缺少 helpers（requireMember）")
  }

  // ── 凭据清单（§3.6——本人 host 序；零秘密）──────────────────────────────────
  routes.add("GET", "/api/me/git-credentials", (req, res) => {
    const member = requireMember(db, req)
    sendJson(res, 200, { credentials: listMemberCredentials(db, member.id) })
  })

  // ── 绑定/更新（形非法 ⇒ 400 库零变；成事 ⇒ 审计 `credential_set`）────────────
  routes.add("PUT", "/api/me/git-credentials", async (req, res) => {
    const member = requireMember(db, req)
    const body = await readJsonBody(req)
    let credential
    try {
      credential = setMemberCredential(db, { member, host: body?.host, username: body?.username, secret: body?.secret, config, now })
    } catch (e) {
      throw new HttpError("invalid_request_error", e.message) // 形非法 ⇒ 400 库零变
    }
    sendJson(res, 200, { credential })
  })

  // ── 撤销（无该行 ⇒ 404 库零变；成事 ⇒ 审计 `credential_revoke`）──────────────
  routes.add("DELETE", "/api/me/git-credentials/:host", (req, res, ctx) => {
    const member = requireMember(db, req)
    let view
    try {
      view = revokeMemberCredential(db, { member, host: ctx.params.host, now })
    } catch (e) {
      if (e instanceof HttpError) throw e
      throw new HttpError("invalid_request_error", e.message)
    }
    void view
    sendJson(res, 200, { ok: true })
  })
}
