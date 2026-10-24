#!/usr/bin/env node
/**
 * 2026-10-13 侧栏会话行「行内操作钮 = 仅归档」批（用户裁定 · ZCode `TaskListItem` 同形）。
 *
 * 用户：「会话右键你这个已经做了是吧，那就把会话操作的按钮只保留归档功能……他鼠标放到那里是会隐藏时间，
 * 切换归档按钮的」。语义：行内钮只留归档（重命名 ∕ 删除仍走右键菜单）；悬停 ⇒ **时间让位、归档钮就位**
 * （同排同宽切换，零布局跳动）。
 *
 * 机检（源面不变量）：① 行内钮 = `sidebar-item-archive`（`data-action` 面经 handlers.onArchive），
 * `sidebar-item-more`（⋯ 全功能钮）零残留；② CSS 两条悬停规则在场（时间隐藏 ∕ 钮显现）；③ 归档词键在场。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("../../", import.meta.url))
const read = (rel) => readFileSync(resolve(ROOT, rel), "utf8")

test("① 行内钮 = 归档（⋯ 全功能钮退场；右键菜单保留）", () => {
  const src = read("thincoder-desktop/renderer/mount-sidebar.mjs")
  assert.ok(src.includes("sidebar-item-archive"), "归档钮在场")
  assert.ok(src.includes('t("sidebar.archive")'), "可及名 ∕ title = 归档词键")
  assert.ok(src.includes("handlers.onArchive?.(item.key, opts.cwd ?? null)"), "点击接 onArchive（与右键菜单同出口）")
  // ⋯ 钮退场（判据 = 可执行行，注释里记沿革不算）
  const offenders = src.split("\n").filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l) && l.includes("sidebar-item-more"))
  assert.deepEqual(offenders, [], "零 `sidebar-item-more` 残留")
  assert.ok(src.includes("onContextMenu"), "右键菜单仍在（重命名 ∕ 归档 ∕ 删除三出口）")
})

test("② CSS：悬停时间让位 ∕ 归档钮就位（同排切换）", () => {
  const css = read("thincoder-desktop/renderer/beauty.css")
  assert.ok(/\.sidebar-item:hover\s+\.sidebar-item-time\s*\{\s*display:\s*none/.test(css), "悬停隐藏时间")
  assert.ok(/\.sidebar-item:hover\s+\.sidebar-item-archive[\s\S]{0,80}opacity:\s*1/.test(css), "悬停显现归档钮")
  assert.ok(/\.sidebar-item-archive::before\s*\{\s*content:/.test(css), "字形住 CSS content（零字形字面）")
})

test("③ 词键：sidebar.archive 两语在场", () => {
  const i18n = read("thincoder-desktop/renderer/i18n.mjs")
  assert.ok(i18n.includes('"sidebar.archive": "Archive"'), "en")
  assert.ok(i18n.includes('"sidebar.archive": "归档"'), "zh")
})
