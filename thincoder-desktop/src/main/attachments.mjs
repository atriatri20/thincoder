/**
 * attachments.mjs — 回合附件主进程半（批 B ⑧ · 单源 = `docs/desktop/design/IPC.md` §2「附件注」项 1–6；
 * R5 上提舱 —— 解析 ∕ 落盘管线 ∕ 配额 ∕ 非多模态判据改核件消费，本档只留端侧处置面）：
 *  ① 受理（项 1）：`images` = **dataURL 串数组**（A1 收正形 —— VSC `msg:send.images` 同形；
 *     mime ∕ 名由核件从串推）；缺省 / 非数组 / 空数组 ⇒ **无附件径**（零落盘零注入，文本原样）。
 *  ② 落盘（项 2）：核 `savePastedImages`（`@thincoder/core/attachments.mjs`）—— 临时件
 *     `<cwd>/.thincoder/tmp/paste-<ts>-<i>.<ext>` 落盘 ⇒ 返**绝对路径数组**交核；fs 写面由本档注入
 *     （`node:fs` 同名面）。判据（栅格四型 ∕ 15MB ∕ 条 ∕ 30MB ∕ 轮 ∕ 弃项）全在核件——本档零副本。
 *  ③ 交核（项 2）：`appendImagePointer`（核 `agent/setup-reminders.mjs:248`）尾附 `[Attached images: …]`
 *     指引，模型经 `read_image` 看图；核侧非多模态**抛错**（:251）—— 故项 4 的门在交核**之前**定局
 *     ⇒ 本档出口零核错抛出。
 *  ④ 阈与弃（项 3）：单件超阈 / 合计超阈溢出 / 落盘失败弃 —— **皆不阻断发送**（核件判据）；
 *     弃项经回执 `degraded:"partial"` 浮出（零静默）。
 *  ⑤ 非视觉门（项 4 · **对齐 VSC 面** = 先落盘 + 降级跑者）：核 `isNonVisionModel(model)` 判真 ⇒ **先落盘**
 *     （降级读图需要路径）+ `degradeTurnAttachments` 跑降级（缺省跑者 = 核 `vision-reader.mjs`）——
 *     成功 = 描述注文（`[图片 <路径表> 描述: <描述>]`）注回文本 ∕ 失败 = 原文本尾追加一行说明
 *     （词键面 = **渲染面词表** `renderer/i18n.mjs` —— 与输入区提示行同词，主进程侧零第二词表）；
 *     落盘 0 件 ⇒ 旧端态（说明行 + 零路径）。
 *  ⑥ 清理（项 6）：宿主回合尾结算点调 `cleanupTurn(paths)` 清**本回合**落盘件；失败 `console.error`。
 *
 * 纪律：零 electron / 零模块态（诊断 = `console.error`）；`cwd` 由宿主注入（**非** `process.cwd()`，
 * 与装配取值面同源）；本档出口零抛（附件面不许把回合驱动带崩）。
 */
import { dirname, join } from "node:path"
import { mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { downgradeNonVisionImages, isNonVisionModel, savePastedImages } from "@thincoder/core/attachments.mjs"
import { appendImagePointer } from "@thincoder/core/agent/setup-reminders.mjs"
import { normalizeLocale } from "@thincoder/core/i18n.mjs"
import { runVisionReader } from "@thincoder/core/vision-reader.mjs"
// 词面单源：渲染面词表（词键面 = 渲染面词表 —— 与输入区提示行同词；零第二词表）。
import { FALLBACK_LOCALE, HOST_DICT } from "../../renderer/i18n.mjs"

/** 非视觉说明词键（渲染面词表同名键 —— 回执码 `non-vision` 那一行的词）。 */
export const NON_VISION_KEY = "composer.attach.nonvision"

/** fs 写面注入（核 `savePastedImages` 缝 —— `node:fs` 同名面；本档唯一 fs 写接线点）。 */
const FS_SEAM = { mkdirSync, writeFileSync }

/** 词面读数（项 4）：语言经**核归一**（`zh-CN` ⇒ `zh`；缺 / 空 / 未知 ⇒ 缺省）—— 与 `config:read` 出口
 *  同源；解析序 = 当前语言 → 缺省语言 → 键名自身（与渲染面 `t()` 同终态：缺键可见，不静默变空串）。 */
function noticeText(locale) {
  const table = HOST_DICT[normalizeLocale(locale)] ?? HOST_DICT[FALLBACK_LOCALE] ?? {}
  const hit = table[NON_VISION_KEY] ?? HOST_DICT[FALLBACK_LOCALE]?.[NON_VISION_KEY]
  return typeof hit === "string" ? hit : NON_VISION_KEY
}

/** 尾附一行（正文空 ⇒ 说明独占 —— 先例同形 = VSC `image-handler.mjs:126`）。 */
function appendLine(text, line) {
  return text.trim() ? `${text}\n\n${line}` : line
}

/**
 * 回合装配（宿主 `msg:send` 起跑前调 —— **出口零抛**）⇒ `{ text, paths, dropped, degraded }`：
 *  `text` = 交核的文本（可能带尾附指引 / 非视觉说明）· `paths` = 本回合落盘件（交宿主供回合尾清理）·
 *  `dropped` = 未落盘件数（核件判据 —— 降级面据此定 `"partial"`）·
 *  `degraded` = `null`（全收 / 无附件 ∥ 降级成功且零弃）∥ `"non-vision"`（项 4：**待降级**；落盘 0 件时
 *  即终态——说明行已尾附）∥ `"partial"`（项 3 —— **含全弃**）。
 *  判决序：无附件（项 1）→ 非视觉（项 4：**先落盘**——降级读图需要路径；有件 ⇒ 原文本出档，注文 ∕ 说明行
 *  归 `degradeTurnAttachments` 定局）→ 受理与阈（项 2/3，核件）。
 */
export function prepareTurnAttachments(text, images, { cwd, model, locale } = {}) {
  const body = typeof text === "string" ? text : ""
  const list = Array.isArray(images) ? images : []
  if (list.length === 0) return { text: body, paths: [], dropped: 0, degraded: null }
  if (isNonVisionModel(model)) {
    // 项 4（W2 判决序改写）：非视觉径**先落盘**（降级读图需要路径）——注文 ∕ 说明行由降级面在交付前定局。
    const { paths, dropped } = savePastedImages(list, cwd, { fs: FS_SEAM })
    if (paths.length === 0) return { text: appendLine(body, noticeText(locale)), paths: [], dropped, degraded: "non-vision" } // 旧端态（零路径 ⇒ 说明行终态）
    return { text: body, paths, dropped, degraded: "non-vision" } // 待降级（有件 ⇒ 原文本出档）
  }
  const { paths, dropped } = savePastedImages(list, cwd, { fs: FS_SEAM })
  const msg = { role: "user", content: body }
  if (paths.length > 0) appendImagePointer(msg, paths, model, { depth: 0 }) // 判据与核同函数同输入 ⇒ 零分歧
  return { text: msg.content, paths, dropped, degraded: dropped > 0 ? "partial" : null }
}

/**
 * 非视觉降级（项 4 主体 · 交付面前置 —— W2）：`paths` 空 ∥ 多模态 ⇒ **原样返**（零动作）；非视觉 ∧ 有件 ⇒
 * 核 `downgradeNonVisionImages`（`images: paths`）——成功 ⇒ 描述注文 + `degraded = dropped > 0 ? "partial"
 * : null`；失败 ⇒ 原文本 + 说明行 + `degraded:"non-vision"`（旧端态）。
 *  读图跑者缝 = `visionReader` ∥ 缺省核 `runVisionReader`（`providerName` = `parentAgent.provider?.name` ——
 *  与主面同源）；`signal` = 回合占位信号（降级窗内 `interrupt` ⇒ 读图 fail-fast）。**异步 · 出口零抛**：
 *  读图异常 ∥ 超时 ∥ 缝违 ⇒ 失败径（原样兜底 + 说明行，不静默丢）。paths 清理归属 = 回合尾
 *  `turn-face.mjs` `cleanupTurn`（本面只读不回收）。
 */
export async function degradeTurnAttachments(attached, { model, cwd, parentAgent, locale, visionReader = null, signal = null } = {}) {
  const paths = Array.isArray(attached?.paths) ? attached.paths : []
  if (paths.length === 0 || !isNonVisionModel(model)) return attached // 零图 ∕ 多模态 ⇒ 原样（指针径不变）
  const body = typeof attached?.text === "string" ? attached.text : ""
  const reader = typeof visionReader === "function"
    ? visionReader
    : ({ paths: files, signal: stop }) => runVisionReader({ paths: files, providerName: parentAgent?.provider?.name, cwd, parentAgent, signal: stop })
  try {
    const out = await downgradeNonVisionImages({ text: body, images: paths, model, visionReader: reader, signal })
    if (out.downgraded === true) return { text: out.text, paths, degraded: attached?.dropped > 0 ? "partial" : null } // 注文注回（弃项并存 ⇒ partial）
  } catch { /* 出口零抛：降级面异常 ⇒ 失败径（原样兜底 + 说明行 —— 不静默丢） */ }
  return { text: appendLine(body, noticeText(locale)), paths, degraded: "non-vision" } // 失败径（旧端态文本）
}

/** 图文消息显示窗（2026-10-10 · 用户对照 ZCode「图文消息」提出）：贴图落盘件**不再回合尾即删**，
 *  保留 30 天供对话内缩略图渲染（`renderer/chat-images.mjs` 经 `image:read` 读回）；过期由本清理的
 *  目录扫面回收（每次 cleanup 调用顺带扫 `paste-*`，节奏 = 每回合一次）。 */
const IMAGE_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

/** 回合尾清理（项 6 —— 宿主三径结算点调）：**过期才删**（2026-10-10 前为逐件即删——图文消息批改为
 *  留存窗语义）；本回合在册件 + 目录内 `paste-*` 旧件同扫（他回合件可能在内 ⇒ 只扫 `paste-` 命名）；
 *  `force` 吞「已不在」，余失败 `console.error`（容忍——不阻断结算）。不删目录。 */
export function cleanupTurn(paths) {
  const now = Date.now()
  const expired = (file) => {
    try { return now - statSync(file).mtimeMs > IMAGE_RETENTION_MS }
    catch { return true /* 已不在 ⇒ 视同过期（删除零害） */ }
  }
  const dirs = new Set()
  if (Array.isArray(paths)) {
    for (const file of paths) {
      if (typeof file !== "string" || file === "") continue
      dirs.add(dirname(file))
      if (expired(file)) {
        try { rmSync(file, { force: true }) }
        catch (error) { console.error(`[attachments] temp cleanup failed: ${file}`, error) }
      }
    }
  }
  for (const dir of dirs) {
    let entries
    try { entries = readdirSync(dir) } catch { continue }
    for (const name of entries) {
      if (!/^paste-/.test(name)) continue
      const file = join(dir, name)
      if (expired(file)) {
        try { rmSync(file, { force: true }) }
        catch { /* 竞态删除 ⇒ 零动作 */ }
      }
    }
  }
}

/** `image:read(payload)` ⇒ `{ ok, dataUrl }` ∥ `{ ok:false, reason }`——对话内图文消息的**特权读图口**
 *  （渲染端无本地文件读取面 ⇒ 经本通道把落盘贴图读成 dataURL 供缩略图渲染；ZCode `readAttachment`
 *  的对位——彼处返回 bytes ∕ 本地协议 URL，此处 dataURL 同效）。
 *  受限面：路径必须落在 `.thincoder` 下 ∧ 基名 `paste-` 打头（会话附件面；渲染端不可凭它读任意本地文件）。 */
export function imageRead(payload) {
  const file = String(payload?.path ?? "")
  if (!file.includes(".thincoder") || !/[/\\]paste-[^/\\]*$/.test(file)) return { ok: false, reason: "invalid-path" }
  try {
    const ext = file.split(".").pop()?.toLowerCase() ?? ""
    const mime = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", gif: "image/gif", webp: "image/webp" }[ext]
    if (mime === undefined) return { ok: false, reason: "invalid-type" }
    return { ok: true, dataUrl: `data:${mime};base64,${readFileSync(file).toString("base64")}` }
  } catch { return { ok: false, reason: "gone" } }
}
