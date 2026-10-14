#!/usr/bin/env node
/**
 * 2026-10-12 菜单加速键回归闸——`thincoder-desktop/src/main/window.mjs` `refreshMenu`。
 *
 * 病灶（用户反馈「快捷键有问题」+ 真机实测）：原实现 `Menu.setApplicationMenu(buildMenu())` 之后紧跟
 * `activeWin.setMenu(null)`（注释误记「加速键恒活」）。Windows/Linux 上**应用菜单就是窗口菜单** ⇒
 * `setMenu(null)` 把窗口菜单整只摘掉 ⇒ 全部菜单加速键失效：
 *   实测 Ctrl+N 不建会话 ∕ Ctrl+R 不重载（页面标记存活）——而渲染端自绑的 Ctrl+F 照常（判别式确证）。
 * 正解 = 保留菜单、只藏条：`setMenuBarVisibility(false)`（且**不开** `autoHideMenuBar`——否则按 Alt 会
 * 弹出原生条压住 HTML Header）。修复后实测：Ctrl+N 建会话 ✓ ∕ Ctrl+R 重载 ✓ ∕ Ctrl+Shift+= ∕ Ctrl+- ∕
 * Ctrl+0 缩放三态 ✓ ∕ F11 全屏切换 ✓。
 *
 * 本档机检两条：① 源面不变量（禁 `setMenu(null)`；须 `setMenuBarVisibility(false)` + 菜单挂载在场）；
 * ② 三枚显式加速键在场（Ctrl+N ∕ Ctrl+O ∕ Ctrl+F —— 防误删）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = fileURLToPath(new URL("../../", import.meta.url))
const read = (rel) => readFileSync(resolve(ROOT, rel), "utf8")

test("window.mjs：菜单只藏条不摘菜单（禁 setMenu(null) —— 加速键宿主）", () => {
  const src = read("thincoder-desktop/src/main/window.mjs")
  assert.equal(src.includes("Menu.setApplicationMenu(buildMenu())"), true, "菜单挂载在场")
  assert.equal(src.includes("setMenuBarVisibility(false)"), true, "藏条 = setMenuBarVisibility(false)")
  // 判据 = 可执行行（注释里记着坑名不算违规——按行剥注释前缀后判）
  const offenders = src
    .split("\n")
    .map((line, i) => [i + 1, line])
    .filter(([, line]) => !/^\s*(\/\/|\*|\/\*)/.test(line) && /\.setMenu\(\s*null\s*\)/.test(line))
  assert.deepEqual(offenders, [], "零 `setMenu(null)` 调用行（摘菜单 = 加速键全灭）")
  assert.equal(/autoHideMenuBar\s*[:=]\s*true/.test(src), false, "不开 autoHideMenuBar（防 Alt 弹原生条压 Header）")
})

test("app-menu.mjs：三枚显式加速键在场（Ctrl+N ∕ Ctrl+O ∕ Ctrl+F）", () => {
  const src = read("thincoder-desktop/src/main/app-menu.mjs")
  for (const acc of ["CmdOrCtrl+N", "CmdOrCtrl+O", "CmdOrCtrl+F"]) {
    assert.equal(src.includes(`accelerator: "${acc}"`), true, `${acc} 在位`)
  }
})
