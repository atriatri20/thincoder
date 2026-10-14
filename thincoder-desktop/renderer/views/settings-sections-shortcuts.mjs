/**
 * settings-sections-shortcuts.mjs — 设置页「快捷键」段体（只读参考页 · 2026-10-12 · 用户对照 ZCode
 * 「键盘快捷键」页提出）。
 *
 * 形态（ZCode `settings/ShortcutSettingsSection.tsx` 的**只读面**对位）：标题 + 搜索框 + 分组表
 * （命令 ∕ 按键绑定两列；键帽 = 逐键小片，ZCode 同形）。**不含编辑面**（ZCode 有：行内录制 ∕ 追加 ∕
 * 删除 ∕ 全部恢复默认 + 冲突检测与抢绑二次确认——本仓键位分居两层（主进程菜单加速键 + 渲染端各档
 * 硬编码 keydown），无统一键位注册表 ⇒ 可编辑化须先立「键位注册表 + 派发 + 持久化 + 冲突检测」批次；
 * 详见提交说明）。
 *
 * 名录 = **实读值**（逐条对实现档，禁臆造）：全局组 = `src/main/app-menu.mjs` 显式 accelerator +
 * Electron 角色默认键；输入区 = `thincoder-render-core/composer/panel.mjs` ∕ `atmenu.mjs`；查找 =
 * `thincoder-render-core/search.mjs`；预览 = `renderer/image-preview.mjs`；审批 = `renderer/views/approval.mjs`
 * `SHAPE_ACTIONS`；侧栏 = `renderer/mount-sidebar.mjs`；工具卡文件链接 = `renderer/views/chat-tool.mjs`。
 * 过滤 = 命令名 ∕ 键串子串（大小写不敏感）；查询态住设置切片 `settings.shortcuts.query`（重绘随动）。
 */

import { t } from "../i18n.mjs"

/** 分组名录（word = 词键；keys = 键串数组——`+` 连缀，逐键渲染为键帽）。 */
const GROUPS = Object.freeze([
  Object.freeze({
    word: "settings.shortcuts.group.global",
    rows: Object.freeze([
      { word: "settings.shortcuts.cmd.newSession", keys: ["Ctrl", "N"] },
      { word: "settings.shortcuts.cmd.openProject", keys: ["Ctrl", "O"] },
      { word: "settings.shortcuts.cmd.find", keys: ["Ctrl", "F"] },
      { word: "settings.shortcuts.cmd.reload", keys: ["Ctrl", "R"] },
      { word: "settings.shortcuts.cmd.forceReload", keys: ["Ctrl", "Shift", "R"] },
      { word: "settings.shortcuts.cmd.devtools", keys: ["Ctrl", "Shift", "I"] },
      { word: "settings.shortcuts.cmd.zoomIn", keys: ["Ctrl", "+"] },
      { word: "settings.shortcuts.cmd.zoomOut", keys: ["Ctrl", "-"] },
      { word: "settings.shortcuts.cmd.zoomReset", keys: ["Ctrl", "0"] },
      { word: "settings.shortcuts.cmd.fullscreen", keys: ["F11"] },
      { word: "settings.shortcuts.cmd.undo", keys: ["Ctrl", "Z"] },
      { word: "settings.shortcuts.cmd.redo", keys: ["Ctrl", "Shift", "Z"] },
      { word: "settings.shortcuts.cmd.cut", keys: ["Ctrl", "X"] },
      { word: "settings.shortcuts.cmd.copy", keys: ["Ctrl", "C"] },
      { word: "settings.shortcuts.cmd.paste", keys: ["Ctrl", "V"] },
      { word: "settings.shortcuts.cmd.selectAll", keys: ["Ctrl", "A"] },
    ]),
  }),
  Object.freeze({
    word: "settings.shortcuts.group.composer",
    rows: Object.freeze([
      { word: "settings.shortcuts.cmd.send", keys: ["Enter"] },
      { word: "settings.shortcuts.cmd.newline", keys: ["Shift", "Enter"] },
      { word: "settings.shortcuts.cmd.stop", keys: ["Ctrl", "C"] },
      { word: "settings.shortcuts.cmd.interrupt", keys: ["Ctrl", "I"] },
      { word: "settings.shortcuts.cmd.clearInput", keys: ["Ctrl", "U"] },
      { word: "settings.shortcuts.cmd.historyPrev", keys: ["↑"] },
      { word: "settings.shortcuts.cmd.historyNext", keys: ["↓"] },
      { word: "settings.shortcuts.cmd.atMenu", keys: ["@"] },
      { word: "settings.shortcuts.cmd.interruptConfirm", keys: ["Enter"] },
      { word: "settings.shortcuts.cmd.interruptCancel", keys: ["Esc"] },
    ]),
  }),
  Object.freeze({
    word: "settings.shortcuts.group.find",
    rows: Object.freeze([
      { word: "settings.shortcuts.cmd.findOpen", keys: ["Ctrl", "F"] },
      { word: "settings.shortcuts.cmd.findNext", keys: ["Enter"] },
      { word: "settings.shortcuts.cmd.findPrev", keys: ["Shift", "Enter"] },
      { word: "settings.shortcuts.cmd.findClose", keys: ["Esc"] },
    ]),
  }),
  Object.freeze({
    word: "settings.shortcuts.group.preview",
    rows: Object.freeze([
      { word: "settings.shortcuts.cmd.previewPrev", keys: ["←"] },
      { word: "settings.shortcuts.cmd.previewNext", keys: ["→"] },
      { word: "settings.shortcuts.cmd.previewClose", keys: ["Esc"] },
    ]),
  }),
  Object.freeze({
    word: "settings.shortcuts.group.approval",
    rows: Object.freeze([
      { word: "settings.shortcuts.cmd.approvalOnce", keys: ["1"] },
      { word: "settings.shortcuts.cmd.approvalAlways", keys: ["2"] },
      { word: "settings.shortcuts.cmd.approvalReject", keys: ["3"] },
      { word: "settings.shortcuts.cmd.approvalBatchAll", keys: ["1"] },
      { word: "settings.shortcuts.cmd.approvalBatchDeny", keys: ["2"] },
      { word: "settings.shortcuts.cmd.approvalBatchOneByOne", keys: ["3"] },
    ]),
  }),
  Object.freeze({
    word: "settings.shortcuts.group.sidebar",
    rows: Object.freeze([
      { word: "settings.shortcuts.cmd.sidebarMenuClose", keys: ["Esc"] },
      { word: "settings.shortcuts.cmd.renameSubmit", keys: ["Enter"] },
      { word: "settings.shortcuts.cmd.renameCancel", keys: ["Esc"] },
      { word: "settings.shortcuts.cmd.openFileLink", keys: ["Enter"] },
    ]),
  }),
])

/** 键帽串（逐键小片；`+` 键自身显示为 +）。 */
function keycaps(keys) {
  const chips = []
  for (const key of keys) {
    chips.push({ tag: "kbd", props: { class: "shortcut-key" }, children: [key] })
    if (key !== keys[keys.length - 1]) chips.push({ tag: "span", props: { class: "shortcut-plus" }, children: ["+"] })
  }
  return chips
}

/** 行命中（命令名 ∕ 命令 id ∕ 键串子串——大小写不敏感）。命令 id 参与匹配 = ZCode 同式
 *  （`ShortcutSettingsSection` `entry.id.toLowerCase().includes(keyword)`）——中文界面下搜
 *  `zoom` ∕ `preview` 等英文词同样命中（词键尾段即英文命令名）。 */
function hit(word, keys, query) {
  if (query === "") return true
  const label = t(word).toLowerCase()
  const combo = keys.join("+").toLowerCase()
  return label.includes(query) || combo.includes(query) || word.toLowerCase().includes(query)
}

/**
 * 段体（伪段 · 零切片状态词；查询态 = `model.query`）。
 * @param {{ query?: string }} model — 段模型（`query` = 搜索词）
 * @param {{ onShortcutQuery?: (value: string) => void }} handlers
 */
export function shortcutsBody(model = {}, handlers = {}) {
  const query = typeof model.query === "string" ? model.query.trim().toLowerCase() : ""
  const onInput = typeof handlers.onShortcutQuery === "function" ? handlers.onShortcutQuery : null
  const groups = []
  for (const group of GROUPS) {
    const rows = group.rows.filter((row) => hit(row.word, row.keys, query))
    if (rows.length === 0) continue
    groups.push({
      tag: "div",
      props: { class: "shortcut-group" },
      children: [
        { tag: "div", props: { class: "shortcut-group-head" }, children: [t(group.word)] },
        ...rows.map((row) => ({
          tag: "div",
          props: { class: "shortcut-row" },
          children: [
            { tag: "div", props: { class: "shortcut-row-name" }, children: [t(row.word)] },
            { tag: "div", props: { class: "shortcut-row-keys" }, children: keycaps(row.keys) },
          ],
        })),
      ],
    })
  }
  const body = groups.length > 0
    ? groups
    : [{ tag: "div", props: { class: "shortcut-empty" }, children: [t("settings.shortcuts.empty")] }]
  return [
    { tag: "h2", props: { class: "shortcut-title" }, children: [t("settings.shortcuts.title")] },
    {
      tag: "div",
      props: { class: "shortcut-search" },
      children: [
        {
          tag: "input",
          props: {
            type: "search",
            class: "shortcut-search-input",
            "data-shortcut-search": "",
            placeholder: t("settings.shortcuts.search"),
            "aria-label": t("settings.shortcuts.search"),
            value: typeof model.query === "string" ? model.query : "",
            ...(onInput === null ? {} : { onInput: (event) => onInput(String(event?.target?.value ?? "")) }),
          },
          children: [],
        },
      ],
    },
    ...body,
  ]
}
