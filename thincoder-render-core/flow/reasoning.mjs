/**
 * reasoning.mjs — 推理块构件面（核化 `webview/streaming.js` `onReasoning` 的 DOM 面——
 * 判定表 §3 行 47「拆」；`ctx` 指针 / 子回合边界判据 / rAF 调度留端 = `flow/stream.mjs`）。
 */
import { md } from "../md.mjs"
import { t as coreT } from "../i18n.mjs"

/** 推理块（`details.reasoning-block` + summary + `.reasoning-content`；**默认展开**——2026-10-19 用户裁定：折叠态
 *  看不出模型在跑还是在卡（推翻 #875 · 2026-10-04「默认折叠」——该号仅作 as-of 出处）；手动折叠仍可只看摘要；恢复径 `flow/block.mjs` `buildAssistantRestore` 同拍携 `open`）。
 *  `model.text` 在场 ⇒ 经核 md 渲染进内容区；缺省 = 空块（live 流式面——
 *  内容由 `flow/stream.mjs` 的重渲器逐帧写入）。返回 `{ el, content }`。 */
export function renderReasoning(model = {}, deps = {}) {
  const t = deps.t ?? coreT
  const details = document.createElement("details")
  details.className = "reasoning-block"
  details.open = true
  const summary = document.createElement("summary")
  summary.textContent = t("status.thinking") + "..."
  details.appendChild(summary)
  const content = document.createElement("div")
  content.className = "reasoning-content"
  if (typeof model.text === "string" && model.text) content.innerHTML = md(model.text)
  details.appendChild(content)
  return { el: details, content }
}
