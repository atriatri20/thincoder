/**
 * views-chat-cards.mjs — 管理·对话页·审批卡族（`webui/CHAT.md` §2.1 审批卡面条；机制 = `agent/ADMIN-AGENT.md` §11.5 ∥ KD-SV-224–227）：
 * 两 kind（`permission` ∥ `batch`）⇒ 核卡件适配（`renderApprovalCard` ∥ `renderBatchApprovalCard`——卡体/词面单源 = 渲染核）
 * ＋ 应答单点（`POST /api/admin/agent/chats/:id/asks/:promptId`，体 `{ verdict }`；词表映射 `verdictOfEmit` 自成员面卡件导入——零第二份）。
 * 卡挂消息流尾（`.chat-thread`——与成员面同形）；应答**非乐观**：失败 ⇒ 就地人话 + 卡面重挂（桌面同规）。
 * 收尾：回合 `end` / 切会话 ⇒ 残留卡全摘（服务端同拍拒值结算）；重读装配 ⇒ 在决卡 `remount` 区尾（表不变——旧卡不失答）。
 * 键族零增（核卡面键 = core 两表已册）。
 */
import { renderApprovalCard, renderBatchApprovalCard } from "/rc/cards/permission.mjs"
import { verdictOfEmit } from "./views-me-chat-cards.mjs"

/**
 * 卡族工厂。`deps`：`thread()` ⇒ 挂载容器（`.chat-thread`）· `sessionId()` ⇒ 当刻会话 id · `respond(path, body)` ⇒ 应答直取（页面注入）·
 * `onFail(error)` ⇒ 就地人话 · `onAnswered()` ⇒ 应答成功回调（回焦输入区）。返回 `{ append(frame), clear(), remount() }`。
 */
export function createAskCards(ctx, deps = {}) {
  const live = new Map() // promptId ⇒ { node }（在决卡表——重挂/清卡取数面）

  /** 卡挂载（消息流尾 + `scrollIntoView`）。 */
  function attach(node, frame) {
    live.set(String(frame?.promptId ?? ""), { node })
    deps.thread?.()?.append(node)
    node.scrollIntoView?.({ block: "nearest" })
  }

  /** 应答（单点）：先摘卡 ⇒ `POST …/asks/:promptId`；失败 ⇒ 人话 + 卡面重挂（非乐观——桌面同规）。 */
  function respond(frame, node, body) {
    const sessionId = deps.sessionId?.() ?? null
    const promptId = frame?.promptId
    live.delete(String(promptId ?? ""))
    node.remove()
    if (sessionId === null || promptId === undefined || promptId === null) return
    void Promise.resolve(deps.respond?.(`/api/admin/agent/chats/${encodeURIComponent(sessionId)}/asks/${encodeURIComponent(String(promptId))}`, body))
      .then(() => deps.onAnswered?.())
      .catch((error) => { deps.onFail?.(error); attach(node, frame) })
  }

  /** `ask` 帧 ⇒ 卡（两 kind）∥ 表外 kind ⇒ 零投（收窄：question/secret 管理面无源——§11.5）。 */
  function append(frame) {
    const kind = String(frame?.kind ?? "")
    if (kind === "permission") {
      const node = renderApprovalCard({ promptId: frame.promptId, tool: String(frame.tool ?? ""), args: typeof frame.args === "string" ? frame.args : "" }, {
        emit: (type, payload) => {
          const verdict = verdictOfEmit(type, payload)
          if (verdict !== null) respond(frame, node, { verdict })
        },
      })
      attach(node, frame)
      return
    }
    if (kind === "batch") {
      const tools = (Array.isArray(frame.tools) ? frame.tools : []).map((name) => (typeof name === "string" ? { name } : name))
      const node = renderBatchApprovalCard({ promptId: frame.promptId, count: frame.count, tools }, {
        emit: (type, payload) => {
          const verdict = verdictOfEmit(type, payload)
          if (verdict !== null) respond(frame, node, { verdict })
        },
      })
      attach(node, frame)
    }
  }

  return {
    append,
    /** 收尾清卡（`end`/切会话——服务端同拍拒值结算）：全摘 + 清表。 */
    clear() {
      for (const { node } of live.values()) node.remove()
      live.clear()
    },
    /** 重读径重挂（回读装配 `replaceChildren` 摘走卡体但表不变 ⇒ 旧卡失答；此处把表内卡重挂区尾）。 */
    remount() {
      for (const { node } of live.values()) if (node.parentNode === null) deps.thread?.()?.append(node)
    },
  }
}
