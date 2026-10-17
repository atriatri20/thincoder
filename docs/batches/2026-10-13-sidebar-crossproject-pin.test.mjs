#!/usr/bin/env node
/**
 * 2026-10-13 侧栏「右键全项目化 + 置顶」批（用户裁定 · ZCode 右键菜单 ∕ 置顶任务对位）。
 *
 * 用户裁定：「右键的逻辑扩充——现在只能在已点击的当前项目右键，需要扩充成全部都可以右键；还有置顶会话」。
 * 地基：会话动作层（`session-actions.mjs`）本就 **cwd 参数化**（档头明示「cwd 取入参」）；归档视图的
 * `delete` ∕ `unarchive` 已有跨项目 cwd 先例。本批 = 渲染面 cwd 贯通（行 → 菜单 → 动作）+ 主侧转口
 * `session:rename` ∕ `session:archive` 收 `payload.cwd`（缺省回退 currentCwd）+ 置顶（模块集 + localStorage
 * 持久 + 组内浮顶 + 菜单互斥项）。
 *
 * 机检（源面不变量）：① 行节点门放开（右键 ∕ 归档钮不再限当前项目）且携 cwd；
 * ② 菜单：置顶项（互斥词）+ 各项携 cwd ∕ 透传；③ 置顶态模块集 + 持久 + 组内浮顶排序；
 * ④ 主侧转口收 cwd；⑤ 词键两语。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("../../", import.meta.url))
const read = (rel) => readFileSync(resolve(ROOT, rel), "utf8")

test("① 行节点：右键 ∕ 归档钮全项目开放且携 cwd（⋯ 旧门退场）", () => {
  const src = read("thincoder-desktop/renderer/mount-sidebar.mjs")
  assert.ok(src.includes('cwd: opts.cwd ?? null'), "openMenuAt 携行 cwd")
  assert.ok(!/if \(!isCurrentProject \|\| typeof handlers\.onMenuOpen/.test(src), "右键旧门（限当前项目）退场")
  assert.ok(src.includes("handlers.onArchive?.(item.key, opts.cwd ?? null)"), "行内归档携 cwd（跨项目可归档）")
  const offenders = src.split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l) && l.includes('class: "sidebar-item-archive"') && l.includes("isCurrentProject"))
  assert.deepEqual(offenders, [], "归档钮不受 isCurrentProject 门限")
})

test("② 菜单：置顶互斥项 + cwd 贯通（rename ∕ archive ∕ delete ∕ 改名形）", () => {
  const src = read("thincoder-desktop/renderer/mount-sidebar.mjs")
  assert.ok(src.includes("{ key, title, x, y, cwd = null }"), "菜单载荷收 cwd")
  assert.ok(src.includes("isSlotPinned(cwd, key)"), "菜单读置顶态（互斥词）")
  assert.ok(src.includes("handlers.onTogglePin?.(cwd, key)"), "置顶切换出口")
  assert.ok(src.includes("startRename(pane, handlers, { key, title, cwd })"), "改名携 cwd")
  assert.ok(src.includes("handlers.onRename?.(key, value, cwd)"), "改名提交透传 cwd")
  assert.ok(src.includes("handlers.onArchive?.(key, cwd)"), "归档携 cwd")
  assert.ok(src.includes("confirmDelete(pane, handlers, { key, title, cwd })"), "删除携 cwd（既有先例成链）")
})

test("③ 置顶态：模块集 ∕ 持久 ∕ 组内浮顶 ∕ 行标记", () => {
  const src = read("thincoder-desktop/renderer/mount-sidebar.mjs")
  assert.ok(src.includes('const SLOT_PINNED_KEY = "thincoder.slots.pinned"'), "localStorage 键")
  assert.ok(src.includes("function isSlotPinned(cwd, slot)"), "判读函数")
  assert.ok(src.includes("function toggleSlotPinned(cwd, slot)"), "切换函数")
  assert.ok(src.includes("pinnedRows.push"), "置顶会话收集（跨项目）")
  assert.ok(src.includes('parts.unshift'), "已置顶节顶部独立陈列（用户裁定：独立于所有项目）")
  assert.ok(src.includes('isSlotPinned(project.cwd, s.slot)'), "项目组排除置顶件（移出语义，非复制）")
  assert.ok(src.includes('isSlotPinned(opts.cwd, item.key) ? " pinned"'), "行标记类")
})

test("④ 主侧转口：session:rename ∕ session:archive 收 payload.cwd（缺省回退 currentCwd）", () => {
  const src = read("thincoder-desktop/src/main/ipc.mjs")
  assert.ok(src.includes('const cwd = typeof payload?.cwd === "string" && payload.cwd !== "" ? payload.cwd : currentCwd()'), "rename 收 cwd（缺省回退 currentCwd）")
  assert.ok(src.includes("renameSession(cwd, payload?.slot, payload?.title)"), "rename 以 cwd 调动作层")
  assert.ok(/sessionArchive\(payload\)\s*\{\s*\r?\n\s*\/\/ 右键全项目化/.test(src), "archive 转口改形在场")
  assert.ok(src.includes("? payload.cwd : currentCwd(), payload?.slot)"), "archive 收 cwd（缺省回退）")
})

test("⑤ 词键：sidebar.pin ∕ sidebar.unpin 两语", () => {
  const src = read("thincoder-desktop/renderer/i18n.mjs")
  assert.ok(src.includes('"sidebar.pin": "Pin to top"'), "en")
  assert.ok(src.includes('"sidebar.pin": "置顶"'), "zh")
  assert.ok(src.includes('"sidebar.unpin": "Unpin"'), "en unpin")
  assert.ok(src.includes('"sidebar.unpin": "取消置顶"'), "zh unpin")
})
