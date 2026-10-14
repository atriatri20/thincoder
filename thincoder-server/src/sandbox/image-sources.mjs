/**
 * image-sources.mjs — 镜像源清单模型（sandbox/SANDBOX.md §3 镜像源族 ∥ gateway/API.md §2.5 镜像源七行；sandbox-image-sources 批——台账 #1274）。
 *
 * 语义（§3——KD-SV-96）：源清单 = **server 全局**（非按节点——目录读取发生在 server）；持久 = `image_sources`（v15——`store/STORE.md` §2 v15 段）；
 * **拉取消费面 = 显式选源**（源不写节点 dockerd 配置 ∥ 系统零隐式注入（引用组装仅随选定态） ∥ 零自动选源）；**名 ∥ 址各自唯一**（库两 UNIQUE + 本档人话报错）；
 * 址归一 = `[http(s)://]主机[:端口]`（缺 scheme ⇒ 补 `https://`；含路径/查询/空白/凭据 ⇒ 拒）；`kind` = **按地址派生**
 * （`hub` ⇔ 主机 ∈ Hub 四别名 ∥ `hub-mirror` ⇔ 主机 ∈ Hub 镜像两主机；余 ⇒ `v2`）——派生不入库（单源 = `address`，零漂移；`hub-mirror` 消费面 = 拉取组装裸名补 `library/`——走查轮 2026-10-11 甲）。
 * 预选七条 = server 端静态表（沿 provider 预设先例 KD-SV-17——随设计轮维护，非用户可改面）。
 * 端点面 = `image-source-routes.mjs`；本档纯函数面（形校验 ∥ kind 派生 ∥ 预选表）= 单元测试档直测。
 */
import { HttpError } from "../gateway/errors.mjs"

/** 源名上限（§3 形：≤ 40 字符——首尾空白 trim 后计）。 */
export const SOURCE_NAME_MAX = 40

/** Hub 四别名（§3：`kind = hub` 判据——主机命中即 Hub 面；与登记址端口无关）。 */
export const HUB_HOSTS = Object.freeze(["docker.io", "index.docker.io", "registry-1.docker.io", "hub.docker.com"])

/** Hub 镜像主机（`kind = hub-mirror` 判据——走查轮 2026-10-11 甲）：预设两条「Docker Hub 镜像（…）」之址；裸名补 `library/` 与 Hub 面同规则。
 *  实走实证（`.5`→`.6`，user walkthrough）：daocloud 裸名 `alpine` manifest 过、blob 段挂（`unexpected status`）；`library/alpine` 同源 10.7s 拉成——原注「1ms.run 裸名原样可用」只对 1ms.run 成立（源差）。 */
export const MIRROR_HOSTS = Object.freeze(["docker.m.daocloud.io", "docker.1ms.run"])

/** 常用源预选七条（§3——用户 09:19 口径：Docker Hub ∥ ghcr.io ∥ quay.io ∥ 阿里云 ACR ∥ 华为云 SWR ∥ Docker Hub 镜像（DaoCloud）∥ Docker Hub 镜像（1ms.run））。
 *  第 7 条（1ms.run）= 2026-10-11 实走补——用户实走发现实测可用源缺表；实拉实证 `.6` 200·10.4s·119MB（七条——见批档 `docs/batches/2026-10-11-light-walkthrough-fixes.md`）。
 *  表单只回填名 + 址两字段（零隐藏语义）；此为 server 端单源——控制台下拉逐条消费。 */
export const SOURCE_PRESETS = Object.freeze([
  Object.freeze({ name: "Docker Hub", address: "https://docker.io" }),
  Object.freeze({ name: "GitHub Container Registry", address: "https://ghcr.io" }),
  Object.freeze({ name: "Quay", address: "https://quay.io" }),
  Object.freeze({ name: "阿里云 ACR", address: "https://registry.cn-hangzhou.aliyuncs.com" }),
  Object.freeze({ name: "华为云 SWR", address: "https://swr.cn-north-4.myhuaweicloud.com" }),
  Object.freeze({ name: "Docker Hub 镜像（DaoCloud）", address: "https://docker.m.daocloud.io" }),
  Object.freeze({ name: "Docker Hub 镜像（1ms.run）", address: "https://docker.1ms.run" }),
])

/** 源名归一（§3 形：trim 非空 ∥ ≤ 40 字符）；不合 ⇒ 抛（调用面转 400）。 */
export function normalizeSourceName(raw) {
  const name = typeof raw === "string" ? raw.trim() : ""
  if (name === "") throw new Error("源名不可为空")
  if (name.length > SOURCE_NAME_MAX) throw new Error(`源名超长（≤ ${SOURCE_NAME_MAX} 字符；实长 ${name.length}）`)
  return name
}

/** 源地址归一（§3 形：`[http(s)://]主机[:端口]`——缺 scheme 补 `https://`；含路径/查询/空白 ⇒ 拒）。出 = `http(s)://主机[:端口]`（无路径/查询）。 */
export function normalizeSourceAddress(raw) {
  const text = typeof raw === "string" ? raw : ""
  if (text.trim() === "") throw new Error("源地址不可为空")
  if (/\s/.test(text)) throw new Error(`源地址不可含空白：${text}`)
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text}`
  let url
  try {
    url = new URL(withScheme)
  } catch {
    throw new Error(`源地址形非法：${text}（形 = [http(s)://]主机[:端口]）`)
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error(`源地址仅收 http(s)：${text}`)
  if (url.hostname === "") throw new Error(`源地址缺主机名：${text}`)
  if (url.pathname !== "" && url.pathname !== "/") throw new Error(`源地址不可含路径：${text}`)
  if (url.search !== "" || url.hash !== "") throw new Error(`源地址不可含查询：${text}`)
  if (url.username !== "" || url.password !== "") throw new Error(`源地址不可含凭据（零凭据面；形 = [http(s)://]主机[:端口]）：${text}`)
  return `${url.protocol}//${url.host}`
}

/** `kind` 派生（§3：Hub 四别名 ⇒ `hub` ∥ Hub 镜像两主机 ⇒ `hub-mirror`；余 ⇒ `v2`——派生不入库，单源 = `address`）。 */
export function sourceKind(address) {
  try {
    const host = new URL(String(address)).hostname
    if (HUB_HOSTS.includes(host)) return "hub"
    return MIRROR_HOSTS.includes(host) ? "hub-mirror" : "v2"
  } catch {
    return "v2" // 形已在写面拦；存量/异常值按标准 v2 面如实读（远端裁决）
  }
}

/** 源读数行（§2.5 列形：`{ id, name, address, kind, createdAt }`——`kind` 派生、不入库）。 */
export function sourceView(row) {
  return { id: row.id, name: row.name, address: row.address, kind: sourceKind(row.address), createdAt: row.created_at }
}

/** 源表行（id 序——列表面）。 */
export function listSources(db) {
  return db.prepare("SELECT * FROM image_sources ORDER BY id").all().map(sourceView)
}

/** 源行 or 404（`not_found`）。 */
export function sourceRowOr404(db, id) {
  const row = db.prepare("SELECT * FROM image_sources WHERE id = ?").get(Number(id))
  if (!row) throw new HttpError("not_found", `镜像源不存在：${id}`)
  return row
}

/** 唯一约束冲突 ⇒ 人话（§3 名 ∥ 址各自唯一）；余 ⇒ 原样抛。 */
function uniqueOrRethrow(e, { name, address }) {
  const message = String(e?.message ?? "")
  if (/UNIQUE constraint failed: image_sources\.name/.test(message)) {
    throw new Error(`源名已存在：${name}（名 ∥ 址各自唯一——换一个名字）`)
  }
  if (/UNIQUE constraint failed: image_sources\.address/.test(message)) {
    throw new Error(`源地址已存在：${address}（名 ∥ 址各自唯一——同一源登记一次即可）`)
  }
  throw e
}

/** 增源（形/唯一 ⇒ 抛——调用面 400 库零变；成 ⇒ 行）。 */
export function insertSource(db, { name, address, createdBy = null, now = Date.now() } = {}) {
  const resolvedName = normalizeSourceName(name)
  const resolvedAddress = normalizeSourceAddress(address)
  try {
    const info = db
      .prepare("INSERT INTO image_sources (name, address, created_at, created_by) VALUES (?, ?, ?, ?)")
      .run(resolvedName, resolvedAddress, new Date(now).toISOString(), createdBy)
    return db.prepare("SELECT * FROM image_sources WHERE id = ?").get(Number(info.lastInsertRowid))
  } catch (e) {
    uniqueOrRethrow(e, { name: resolvedName, address: resolvedAddress })
  }
}

/** 改源（键级——出现键 = 应用；至少一键（空提交 ⇒ 抛）；不存在 ⇒ 404；撞名/撞址 ⇒ 抛——库零变；成 ⇒ 行）。 */
export function updateSource(db, id, patch = {}) {
  const row = sourceRowOr404(db, id)
  const body = patch !== null && typeof patch === "object" ? patch : {}
  const hasName = Object.hasOwn(body, "name")
  const hasAddress = Object.hasOwn(body, "address")
  if (!hasName && !hasAddress) throw new Error("改源须携 name ∥ address 至少一键（键级——出现键 = 应用）")
  const nextName = hasName ? normalizeSourceName(body.name) : row.name
  const nextAddress = hasAddress ? normalizeSourceAddress(body.address) : row.address
  try {
    db.prepare("UPDATE image_sources SET name = ?, address = ? WHERE id = ?").run(nextName, nextAddress, row.id)
  } catch (e) {
    uniqueOrRethrow(e, { name: nextName, address: nextAddress })
  }
  return db.prepare("SELECT * FROM image_sources WHERE id = ?").get(row.id)
}

/** 删源（不存在 ⇒ 404；成 ⇒ 被删行——审计 detail 取 name 原文）。 */
export function deleteSource(db, id) {
  const row = sourceRowOr404(db, id)
  db.prepare("DELETE FROM image_sources WHERE id = ?").run(row.id)
  return row
}
