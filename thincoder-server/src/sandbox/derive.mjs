/**
 * derive.mjs — 底座可换：派生构建（sandbox/EXECUTION.md §8 底座可换块 ∥ KD-SV-185/186/187/189/191；
 * 用户 2026-10-13 21:32「底座那个做完整功能吧」+ 22:38 裁「乙」；sandbox-exec-rebuild 批）：
 * 派生 tag 计算（内容寻址）∥ Dockerfile 生成（乙档——node 件随派生像自带：取件段 + 校验层）∥ 上下文 tar（单 Dockerfile——零源码上传）∥
 * 镜像就位四步（读底座 ⇒ 读标准镜像 ⇒ tag 探 ⇒ `POST /build`）∥ 构建流解析（`error`/`errorDetail` 两形皆收——沿 KD-SV-94）∥
 * 失败映射（400/502——E56/E57）∥ 审计 `image_derive`（**仅实构才落**——缓存命中 ∥ 失败不落）。
 *
 * 契约（消费面 = 工作区 `derive` 端点 ∥ 建盒链 ④ 镜像就位步——执行面舱调用；本档不触其文件）：
 *  - `client` = Docker 客户端（`docker.mjs`）：`imageDetail(ref)` ∥ `pullImage(image, tag, { auth })` ∥ `buildImage(tag, tar, { timeoutMs })`；
 *    `imageDetail` 404 ⇒ 抛 `DockerError(kind='api', status=404)`；`buildImage` 流内错误 ⇒ 抛 `DockerError(kind='api')`（status 记 200）。
 *  - 超时 = 构建专用 10 分钟（随 `timeoutMs` 传入——`docker.mjs` 构建面缺省同值）。
 *  - 边界（不做）：构建进度流 ∥ 构建排期/并发闸 ∥ 底座内容治理 ∥ 派生镜像跨节点分发（逐节点各自派生——tag 内容寻址保证同源）。
 */
import { createHash } from "node:crypto"
import { recordAudit } from "../accounts/audit.mjs"
import { HttpError } from "../gateway/errors.mjs"
import { DockerError, findStreamError, parseImageRef } from "./docker.mjs"

/** 派生镜像仓（tag = `thincoder-sandbox:base-<hash12>`——KD-SV-185）。 */
export const DERIVE_REPO = "thincoder-sandbox"

/** 内容寻址哈希前缀长度（hex 位——§8）。 */
export const DERIVE_HASH_LEN = 12

/** 件位契约（§8——落地 = member-face 批：核 `node_modules/@thincoder/core` ∥ 壳 `shell/**`；派生像取件自此）。 */
export const APP_DIR = "/opt/thincoder/app"

/** node 取件件位（乙档——`COPY --from=<标准镜像>` 补件；校验层与 `CMD` 同指此绝对路径，零 PATH 依赖）。 */
export const NODE_BIN = "/usr/local/bin/node"

/** 壳入口（`CMD`——§8）。 */
export const SHELL_ENTRY = `${APP_DIR}/shell/index.mjs`

/** node 主版本下限（校验层判据——KD-SV-187）。 */
export const NODE_MAJOR_MIN = 24

/** 构建专用超时（10 分钟——§8；随 `buildImage` 选项传入）。 */
export const BUILD_TIMEOUT_MS = 10 * 60 * 1000

/** 构造失败处置句（B74——层失败人话尾；机器可检短语）。 */
export const RUN_HINT = "底座需可执行 `RUN`（含 shell）且 glibc 系（musl/Alpine 不支持）"

/** 供体缺人话（B74——「先备供体镜像」；供体 = 标准镜像，本就必在节点）。 */
export const SUPPLIER_HINT = "先备供体镜像"

/** 域错（形/前提/构建流——调用面经 `deriveFailure` 转 400 人话；`DockerError` 系原样走 502）。 */
export class DeriveError extends Error {
  constructor(message) {
    super(message)
    this.name = "DeriveError"
  }
}

/** 派生 tag（KD-SV-185：`thincoder-sandbox:base-<hash12>`；hash12 = `sha256("<base 引用>|<底座镜像 Id>|<标准镜像 Id>")` 前 12 hex——内容寻址 ⇒ 缓存/重建零版本比对）。 */
export function deriveTag(baseRef, baseId, standardId) {
  const digest = createHash("sha256").update(`${baseRef}|${baseId}|${standardId}`).digest("hex")
  return `${DERIVE_REPO}:base-${digest.slice(0, DERIVE_HASH_LEN)}`
}

/** 引用安全（先于一切节点调用：空 ∥ 空白 ∥ 控制字符 ⇒ 拒——Dockerfile 注入防线；`@`/超长形 = `parseImageRef` 判）。 */
function assertRefSafe(value, field) {
  const text = typeof value === "string" ? value.trim() : ""
  if (text === "") throw new DeriveError(`${field}不可为空`)
  if (/[\s\u0000-\u001f\u007f]/.test(text)) throw new DeriveError(`${field}不可含空白/控制字符：${JSON.stringify(value)}`)
  return text
}

/** 底座绑定解析（建盒链 ④ / derive 端点共用决策点）：出 = 自定义底座引用 ∥ `null`（NULL/空 ⇒ 标准镜像 `settings.image`——缺省零行为变化）。 */
export function customBaseOf(workspace) {
  const value = typeof workspace?.base_image === "string" ? workspace.base_image.trim() : ""
  return value === "" ? null : value
}

/**
 * 派生 Dockerfile（KD-SV-187 乙档——三段）：`FROM <底座引用>` ∥ node 取件段（件自标准镜像）∥ 校验层（取件件可执行 ∧ 主版本 ≥24——
 * 层失败 = musl/Alpine 取件不可执行 ∥ 无 shell 基底）∥ 件位段 ∥ `USER 1000:1000` ∥ `WORKDIR /workspace` ∥ `CMD`（与校验层同指取件件）。
 */
export function deriveDockerfile({ baseRef, standardImage }) {
  const base = assertRefSafe(baseRef, "底座引用")
  const supplier = assertRefSafe(standardImage, "标准镜像引用")
  const lines = [
    `FROM ${base}`,
    `COPY --from=${supplier} ${NODE_BIN} ${NODE_BIN}`,
    `RUN test -x ${NODE_BIN} && ${NODE_BIN} -e "process.exit(Number(process.versions.node.split('.')[0]) >= ${NODE_MAJOR_MIN} ? 0 : 1)"`,
    `COPY --from=${supplier} ${APP_DIR} ${APP_DIR}`,
    "USER 1000:1000",
    "WORKDIR /workspace",
    `CMD ["${NODE_BIN}","${SHELL_ENTRY}"]`,
  ]
  return `${lines.join("\n")}\n`
}

/** tar 数位段（八进制 + 尾 NUL——ustar）。 */
function octalField(value, length) {
  return `${Math.max(0, Math.floor(value)).toString(8).padStart(length - 1, "0")}\0`
}

/** ustar 头块（Go `archive/tar` 口径：magic `ustar\0` ∥ version `00` ∥ 校验和 = 6 位八进制 + NUL + 空格——引擎侧解包件同形）。 */
function tarHeader(name, size, mtime) {
  const block = Buffer.alloc(512)
  block.write(name, 0, 100, "utf8")
  block.write("0000644\0", 100, 8, "utf8")
  block.write("0000000\0", 108, 8, "utf8")
  block.write("0000000\0", 116, 8, "utf8")
  block.write(octalField(size, 12), 124, 12, "utf8")
  block.write(octalField(mtime, 12), 136, 12, "utf8")
  block.write("        ", 148, 8, "utf8") // 校验和区位（先空格——逐字节和后回填）
  block.write("0", 156, 1, "utf8") // typeflag = 普通文件
  block.write("ustar\0", 257, 6, "utf8")
  block.write("00", 263, 2, "utf8")
  let sum = 0
  for (const byte of block) sum += byte
  block.write(`${sum.toString(8).padStart(6, "0")}\0 `, 148, 8, "utf8")
  return block
}

/** 构建上下文 = 单 Dockerfile tar（KD-SV-185：零源码上传 ∥ 零第二件）。出 = Buffer（内容 512 对齐 + 两 512 零块收尾）。 */
export function dockerfileTar(dockerfile, { mtime = 0 } = {}) {
  const content = Buffer.from(String(dockerfile), "utf8")
  const padding = Buffer.alloc((512 - (content.length % 512)) % 512)
  return Buffer.concat([tarHeader("Dockerfile", content.length, mtime), content, padding, Buffer.alloc(1024)])
}

/** 镜像详情读（「不在店」⇒ `null`——404 语义化；余错误原样抛）。 */
async function imageOrNull(client, ref) {
  try {
    return await client.imageDetail(ref)
  } catch (e) {
    if (e instanceof DockerError && e.kind === "api" && e.status === 404) return null
    throw e
  }
}

/** 镜像 Id 读数（`GET /images/<ref>/json` 的 `Id`——内容寻址输入；缺 ⇒ 抛——不静默）。 */
function imageIdOf(read, ref) {
  const id = read?.json?.Id ?? read?.json?.ID ?? null
  if (typeof id !== "string" || id === "") throw new DeriveError(`镜像读数缺 Id（${ref}）——节点镜像店响应异常`)
  return id
}

/** 构建失败人话（步名 + 日志尾 + 处置句——B74/E57）。 */
function buildDenied(logTail) {
  return new DeriveError(`派生构建失败（节点侧构建流）：${logTail}——${RUN_HINT}`)
}

/**
 * 镜像就位四步（§8——KD-SV-185/186；双消费面共用：工作区 `derive` 端点 ∥ 建盒链 ④）：
 * ① 读底座（404 ⇒ 拉取——`registryAuth` 命中凭据 ⇒ 携 `X-Registry-Auth`）⇒ ② 读标准镜像（供体；404 ⇒ 停 + 人话「先备供体镜像」）⇒
 * ③ 派生 tag 探（在场 ⇒ 采用——零构建，重试幂等）⇒ ④ `POST /build`（体 = 单 Dockerfile tar；流内 `error` 两形皆收）。
 * 出 = `{ base, tag, cached, pulled }`；`audit` 传入 ∧ 实构成功 ⇒ 落 `image_derive`（缓存命中 ∥ 失败不落）。
 * 失败 = `DeriveError`（域人话 400 系）∥ `DockerError`（引擎系——`deriveFailure` 映射 400/502）。
 */
export async function ensureDerivedImage(client, { baseRef, standardImage, registryAuth = null, audit = null, now = Date.now } = {}) {
  if (typeof client?.imageDetail !== "function" || typeof client?.pullImage !== "function" || typeof client?.buildImage !== "function") {
    throw new Error("ensureDerivedImage：缺 docker 客户端（imageDetail ∥ pullImage ∥ buildImage）")
  }
  const base = assertRefSafe(baseRef, "底座引用")
  const supplier = assertRefSafe(standardImage, "标准镜像引用")
  let parsed
  try {
    parsed = parseImageRef(base) // 形校验先于一切节点调用（B75——`@`/空/超长 ⇒ 抛，零外呼）
  } catch (e) {
    throw new DeriveError(e.message)
  }

  // ① 读底座（404 ⇒ 拉取——命中私有仓凭据 ⇒ 携 X-Registry-Auth；未命中 ⇒ 匿名）
  let baseRead = await imageOrNull(client, base)
  let pulled = false
  if (baseRead === null) {
    try {
      await client.pullImage(parsed.image, parsed.tag, { auth: registryAuth })
    } catch (e) {
      if (e instanceof DockerError && e.kind === "api") {
        throw new DeriveError(`底座拉取失败：${e.apiMessage || e.message}——凭据不符？（「私有仓凭据」卡核对对应注册表凭据后重试）`)
      }
      throw e
    }
    pulled = true
    baseRead = await imageOrNull(client, base)
    if (baseRead === null) throw new DeriveError(`底座拉取完成但节点镜像店仍读不到：${base}（引擎侧异常——重试派生）`)
  }
  const baseId = imageIdOf(baseRead, base)

  // ② 读标准镜像（供体 = 标准镜像——node 件与件位件皆取自此像；缺失 ⇒ 停）
  const standardRead = await imageOrNull(client, supplier)
  if (standardRead === null) throw new DeriveError(`供体镜像不在节点：${supplier}——${SUPPLIER_HINT}（标准镜像即派生供体）`)
  const standardId = imageIdOf(standardRead, supplier)

  // ③ 派生 tag 探（在场 ⇒ 采用——零构建；Id 变 ⇒ tag 变 ⇒ 重建触发）
  const tag = deriveTag(base, baseId, standardId)
  if ((await imageOrNull(client, tag)) !== null) return { base, tag, cached: true, pulled }

  // ④ 构建（体 = 单 Dockerfile tar；流内 error/errorDetail 两形皆收——沿 KD-SV-94）
  const dockerfile = deriveDockerfile({ baseRef: base, standardImage: supplier })
  let response
  try {
    response = await client.buildImage(tag, dockerfileTar(dockerfile), { timeoutMs: BUILD_TIMEOUT_MS })
  } catch (e) {
    if (e instanceof DockerError && e.kind === "api") throw buildDenied(e.apiMessage || e.message)
    throw e
  }
  const streamError = findStreamError(typeof response?.text === "string" ? response.text : "")
  if (streamError !== null) throw buildDenied(streamError)

  if (audit?.db) {
    recordAudit(audit.db, {
      type: "sandbox_event",
      actor: audit.actor ?? "admin",
      actorId: audit.actorId ?? null,
      target: audit.target ?? base,
      detail: {
        kind: "image_derive",
        runnerId: audit.runnerId ?? null,
        workspaceId: audit.workspaceId ?? null,
        base,
        tag,
        cached: false,
        pulled,
      },
      ts: now(),
    })
  }
  return { base, tag, cached: false, pulled }
}

/**
 * 失败映射（E56/E57——调用面 `catch (e) { throw deriveFailure(e) }`）：
 * `DeriveError`（形/前提/构建流——人话已含日志尾/处置句）⇒ 400；`HttpError` 原样过；
 * `DockerError`：不可达 ⇒ 502；超时 ⇒ 502 + 如实句（引擎侧可能仍在跑——重试幂等）；余 `api` ⇒ 400（携引擎原文）；
 * 非预期 ⇒ 502（沿 `container-routes.mjs` `dockerFailure` 兜底同形——不把服务端异常报成客户端错）。
 */
export function deriveFailure(e) {
  if (e instanceof HttpError) return e
  if (e instanceof DeriveError) return new HttpError("invalid_request_error", e.message)
  if (e instanceof DockerError) {
    if (e.kind === "unreachable") return new HttpError("upstream_error", e.message)
    if (e.kind === "timeout") {
      return new HttpError("upstream_error", `${e.message}——如实：引擎侧可能仍在跑；重试幂等（派生 tag 在场即采用）`)
    }
    return new HttpError("invalid_request_error", `引擎拒绝：${e.apiMessage || e.message}`)
  }
  return new HttpError("upstream_error", e?.message ?? String(e))
}
