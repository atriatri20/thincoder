/**
 * member-pull.mjs — 拉仓（`agent/MEMBER-AGENT.md` §3.6 ∥ KD-SV-155；端点 = `gateway/API.md` §2.11）：
 * 项目/源解析（可见性门复用 `project/projects.mjs`——非成员/非负责人 ⇒ 404 不辨）∥ 命令组装（url + dir——**凭据不随命令**）∥
 * 结果对位（进程内存读数：`queued` ⇒ `running` ⇒ `done`/`failed`；服务端重启 ⇒ 未知 ⇒ 「结果未知——重试」）。
 *
 * 口径：目标目录缺省 = 仓名（`/workspace/<名>`——目录冲突 = **盒侧检出**（`git clone` 失败分类经结果面回呈），请求期不预检）；
 * 盒内 git 凭据助手按次向 server 取件（`POST /api/box/credential`——工作区 key 判权；用毕即清 = 盒侧纪律），
 * 拉仓成/败 ⇒ 审计 `member_event`/`pull`（target = `workspace:<id>` 可读形；detail 零秘密）。
 * 命令下行 = relay `pull` 事件（`{ cmdId, url, dir }`）；未收尾命令随 `hello.redeliver` 重派（连接重入——内存态）。
 */
import { recordAudit } from "../accounts/audit.mjs"
import { HttpError } from "../gateway/errors.mjs"
import { projectOr404 } from "../project/projects.mjs"

/** 目标目录上限（相对形——`/workspace/<dir>`）。 */
const PULL_DIR_MAX = 200

/** 仓名（缺省目标目录）：归一地址末段（`projects.address` 已去 `.git` 尾——`project/PROJECTS.md` §5 跨形单键）。 */
export function defaultPullDir(address) {
  const text = String(address ?? "").replace(/\/+$/, "")
  const last = text.split("/").filter((part) => part !== "").pop() ?? ""
  return last === "" ? "repo" : last
}

/** 目标目录归一：空 ⇒ 缺省（仓名）；拒绝对路径 ∥ `..` 段 ∥ 反斜杠 ∥ `~`；≤ 200 字符。 */
export function normalizePullDir(raw, fallback) {
  if (raw === undefined || raw === null || (typeof raw === "string" && raw.trim() === "")) return fallback
  const text = typeof raw === "string" ? raw.trim().replace(/\/+$/, "") : ""
  if (text === "") return fallback
  if (text.startsWith("/") || text.startsWith("~")) throw new Error(`目标目录须为工作区内相对路径：${text}`)
  if (text.includes("\\")) throw new Error(`目标目录不可含反斜杠：${text}`)
  if (text.split("/").some((part) => part === "..")) throw new Error(`目标目录不可含 .. 段：${text}`)
  if (text.length > PULL_DIR_MAX) throw new Error(`目标目录超长（≤ ${PULL_DIR_MAX} 字符；实长 ${text.length}）`)
  return text
}

/** 克隆地址（归一地址 ⇒ https 形）：`<地址>.git`（github/gitee/gitlab/自建同式——凭据 = 成员本人经盒内助手按次取件）。 */
export function cloneUrlOf(address) {
  return `https://${String(address).replace(/^https?:\/\//, "")}.git`
}

/** 主机段（凭据取件键——地址 `host[:port]/path` 首段）。 */
export function hostOfAddress(address) {
  return String(address).split("/")[0]
}

/**
 * 拉取登记册（**进程内存**——重启即清：未知 pullId ⇒ `failed` + 「结果未知——重试」句，如实）。
 * `start` = 组装 + 下行 `pull`（盒离线 ⇒ 409——调用侧先行门）；结果经 `commands/:cmdId/result` 回呈对位。
 */
export function createPullRegistry({ relay, db, log = null, now = Date.now } = {}) {
  if (!relay) throw new Error("createPullRegistry：缺少 relay（盒下行面）")
  let seq = 0
  const pulls = new Map() // pullId ⇒ { workspaceId, state, detail }
  return {
    /** 发起一次拉仓：出 = `{ pullId, state }`（`queued` ⇒ 下行后 `running`）；失败（组链异常）⇒ 抛。 */
    start({ member, workspace, project, dir }) {
      const url = cloneUrlOf(project.address)
      const target = normalizePullDir(dir, defaultPullDir(project.address))
      const pullId = `pull-${++seq}`
      const record = { pullId, workspaceId: workspace.id, state: "queued", detail: null }
      pulls.set(pullId, record)
      const done = relay.sendPull(workspace.id, { url, dir: target }) // 凭据不随命令（盒内助手按次自取）
      record.state = "running"
      const finish = (state, detail) => {
        if (record.state === "done" || record.state === "failed") return
        record.state = state
        record.detail = detail ?? null
        recordAudit(db, {
          type: "member_event",
          actor: member.name, // 名快照
          actorId: member.id,
          target: `workspace:${workspace.id}`,
          detail: { kind: "pull", projectId: project.id, dir: target, ok: state === "done", ...(state === "done" ? {} : { reason: String(detail?.message ?? detail ?? "失败") }) },
          ts: now(),
        })
      }
      done.then(({ state, detail }) => finish(state === "failed" ? "failed" : "done", detail))
        .catch((e) => {
          log?.warn("member_pull_failed", { workspaceId: workspace.id, pullId, message: e?.message ?? String(e) })
          finish("failed", { message: e?.message ?? String(e) })
        })
      return { pullId, state: record.state }
    },
    /** 状态读数（本人工作区已先行判权）：未知 pullId（含服务端重启后）∥ **工作区不符** ⇒ `failed` + 「结果未知——重试」
     *  （跨工作区/跨成员同判——不辨，绝零枚举面）。 */
    stateOf(pullId, { workspaceId = null } = {}) {
      const record = pulls.get(String(pullId))
      if (!record) return { state: "failed", detail: "结果未知——重试" }
      if (workspaceId !== null && record.workspaceId !== Number(workspaceId)) return { state: "failed", detail: "结果未知——重试" }
      return { state: record.state, detail: record.detail }
    },
  }
}

/** 可见项目解析（404 不辨——消息与项目面同口径；`projectOr404` 抛出即此）。 */
export function pullProjectOf(db, member, projectId) {
  const { row, caps } = projectOr404(db, member, projectId)
  if (!caps.can.view) throw new HttpError("not_found", "项目不存在或不可见") // 双保险（projectOr404 同判）
  if (typeof row.address !== "string" || row.address.trim() === "") {
    throw new HttpError("invalid_request_error", `项目「${row.display_name ?? row.id}」地址缺失——先补全项目地址再拉取`)
  }
  return row
}
