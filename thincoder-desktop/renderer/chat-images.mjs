/**
 * chat-images.mjs — 用户消息**图文**缩略图（2026-10-10 · 用户对照 ZCode「图文消息」提出）。
 *
 * 数据流：贴图经主侧落盘（`src/main/attachments.mjs` `savePastedImages` → `.thincoder/tmp/paste-*.png`），
 * 用户消息文本尾附指引行 **`[Attached images: <路径 ∣ 路径>] — use the read_image tool …`**（核
 * `setup-reminders.mjs appendImagePointer`）。本档两件事：
 *  ① **块面**：`imageStripNode(paths)` = 缩略图条描述树（用户块构造时内联——见 `views/chat-tree.mjs`
 *     用户块分支；ZCode 同位 = `ConversationRowView` 附件预览）；
 *  ② **增量回填**：`attachChatImages()` = 全局观察者（`reasoning-times.mjs` 同款接线）——凡
 *     `.block-images img[data-path]:not([data-loaded])` 经窄桥 `image:read` 读 dataURL 回填（模块级
 *     Map 缓存——同路径跨重绘只读一次盘）；读失败（超 30 天清理窗 ∕ 档已被清）⇒ `data-gone` 占位。
 *
 * 生命周期：贴图落盘件留存 30 天（`attachments.mjs` `IMAGE_RETENTION_MS` 留存窗——原为回合尾即删），
 * 过期缩略图退化为占位（诚实面——不假造图）。
 * 纪律：零 `node:` ∕ 零裸包；IPC 只经窄桥 `window.thincoder.invoke`（渲染端唯一 IPC 门）。
 */

/** 路径 → dataURL 缓存（模块级——同路径跨重绘 ∕ 跨块只读一次盘）。 */
import { t } from "./i18n.mjs"

const cache = new Map()

/** 从用户消息文本提取附件图路径；无指引行 ⇒ `null`。 */
export function attachedImagePathsOf(text) {
  const raw = typeof text === "string" ? text : ""
  const m = raw.match(/\[Attached images: ([^\]]+)\]/)
  if (m === null) return null
  const paths = m[1].split(" | ").map((s) => s.trim()).filter((s) => s !== "")
  return paths.length > 0 ? paths : null
}

/** 从用户消息文本剥指引行（显示面不带机器注记——ZCode 气泡同口径）。 */
export function stripImagePointer(text) {
  return typeof text === "string" ? text.replace(/\n?\[Attached images: [^\]]+\][^\n]*/g, "").trimEnd() : text
}

/** 缩略图条描述树（`paths` = 指引行提取的落盘路径串列；空 ⇒ 零节点）。 */
export function imageStripNode(paths) {
  const list = Array.isArray(paths) ? paths.filter((p) => typeof p === "string" && p !== "") : []
  if (list.length === 0) return null
  return {
    tag: "div",
    props: { class: "block-images" },
    children: list.map((p) => {
      const cached = cache.get(p)
      return {
        tag: "img",
        props: {
          class: "block-image",
          ...(cached === undefined ? { "data-pending": "" } : { src: cached, "data-loaded": "" }),
          "data-path": p,
          alt: "",
          draggable: false,
        },
        children: [],
      }
    }),
  }
}

/** 增量回填（全局观察者驱动——`attachChatImages()` 装配一次）：域内未回填件逐个经窄桥读 dataURL。 */
function fillWithin(root) {
  const bridge = globalThis.thincoder
  if (bridge === null || bridge === undefined || typeof bridge.invoke !== "function") return
  for (const img of Array.from(root.querySelectorAll(".block-images img[data-pending]"))) {
    const path = img.getAttribute("data-path") ?? ""
    img.removeAttribute("data-pending")
    const cached = cache.get(path)
    if (cached !== undefined) {
      img.src = cached
      img.setAttribute("data-loaded", "")
      continue
    }
    bridge
      .invoke("image:read", { path })
      .then((receipt) => {
        if (receipt?.ok === true && typeof receipt.dataUrl === "string") {
          cache.set(path, receipt.dataUrl)
          img.src = receipt.dataUrl
          img.setAttribute("data-loaded", "")
        } else {
          img.setAttribute("data-gone", t("chat.imageGone"))
          img.removeAttribute("data-path")
        }
      })
      .catch(() => img.setAttribute("data-gone", t("chat.imageGone")))
  }
}

/** 装配（一次性 —— `renderer/app.mjs` 消费；`reasoning-times.mjs` 同款全局观察者接线）：
 *  body 级 MutationObserver + 首涂 —— 对话流（含虚拟化 ∕ 增量挂载）里新出现的缩略图自动回填。 */
export function attachChatImages() {
  if (typeof document === "undefined" || typeof document.body?.addEventListener !== "function") return
  const fill = () => fillWithin(document.body)
  new MutationObserver(fill).observe(document.body, { childList: true, subtree: true })
  fill()
  globalThis.addEventListener?.("resize", fill)
}
