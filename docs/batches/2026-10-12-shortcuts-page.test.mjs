#!/usr/bin/env node
/**
 * 2026-10-12 设置页「快捷键」段（只读参考页）——`renderer/views/settings-sections-shortcuts.mjs`。
 *
 * 形态对位 ZCode `settings/ShortcutSettingsSection.tsx` 的**只读面**：标题 + 搜索框 + 分组表（命令 ∕
 * 按键两列，键帽逐键小片）。**编辑面未做**（ZCode 有行内录制 ∕ 追加 ∕ 删除 ∕ 全部恢复默认 + 冲突检测与
 * 抢绑——本仓键位分居两层〔主进程菜单加速键 + 渲染端各档 keydown〕，无统一键位注册表）。
 *
 * 用例：① 段体形（标题 ∕ 搜索框 ∕ 分组 ∕ 行 ∕ 键帽）；② 过滤三态（命令名 ∕ 命令 id ∕ 键串）；
 *  ③ 空态；④ 导航段登记 + 段体分派在场（防「加了段体忘了接线」）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import "../../thincoder-desktop/test/rc-resolve.mjs" // `/rc/` 解析钩子（须先于任何 /rc/ 取件注册）

const ROOT = fileURLToPath(new URL("../../", import.meta.url))
const mod = (rel) => import(pathToFileURL(resolve(ROOT, rel)).href)

const i18n = await mod("thincoder-desktop/renderer/i18n.mjs")
i18n.initDict({ locale: "zh", host: i18n.HOST_DICT.zh }) // 词面到场（中文命令名判据）

const { shortcutsBody } = await mod("thincoder-desktop/renderer/views/settings-sections-shortcuts.mjs")
const settings = await mod("thincoder-desktop/renderer/views/settings.mjs")

const flatten = (nodes) => {
  const out = []
  const walk = (node) => {
    if (node === null || node === undefined) return
    out.push(node)
    for (const child of node.children ?? []) walk(child)
  }
  for (const node of nodes) walk(node)
  return out
}

test("① 段体形：标题 ∕ 搜索框 ∕ 分组 ∕ 行 ∕ 键帽", () => {
  const nodes = shortcutsBody({}, {})
  const flat = flatten(nodes)
  const cls = (name) => flat.filter((n) => n?.props?.class === name)
  assert.equal(cls("shortcut-title").length, 1, "标题在场")
  assert.equal(cls("shortcut-search-input").length, 1, "搜索框在场")
  assert.ok(cls("shortcut-group").length >= 5, `分组 >= 5（实读 ${cls("shortcut-group").length}）`)
  assert.ok(cls("shortcut-row").length >= 30, `行 >= 30（实读 ${cls("shortcut-row").length}）`)
  assert.ok(cls("shortcut-key").length >= 60, `键帽 >= 60（实读 ${cls("shortcut-key").length}）`)
  assert.equal(cls("shortcut-row-keys").length, cls("shortcut-row").length, "每行都有按键列")
})

test("② 过滤三态：命令名（中文）∕ 命令 id（英文）∕ 键串", () => {
  const rows = (model) => flatten(shortcutsBody(model, {})).filter((n) => n?.props?.class === "shortcut-row").length
  const total = rows({})
  assert.equal(rows({ query: "zoom" }), 3, "英文 id 命中（放大 ∕ 缩小 ∕ 恢复缩放）")
  assert.equal(rows({ query: "放大" }), 1, "中文命令名命中")
  assert.equal(rows({ query: "ctrl+i" }), 1, "键串命中（Ctrl+I）")
  assert.equal(rows({ query: "shift+enter" }), 2, "键串命中（换行 ∕ 上一个匹配）")
  assert.equal(rows({ query: "ZZZ" }), 0, "无匹配 ⇒ 零行")
  assert.ok(total > 30, "空查询 = 全量")
})

test("③ 空态：无匹配出词条", () => {
  const flat = flatten(shortcutsBody({ query: "zzz-nothing" }, {}))
  assert.equal(flat.filter((n) => n?.props?.class === "shortcut-empty").length, 1, "空态在场")
})

test("④ 接线：导航段登记 + 段体分派在场（防「加段体忘接线」）", () => {
  const names = settings.NAV_SECTIONS.map((s) => s.name)
  assert.ok(names.includes("shortcuts"), `NAV_SECTIONS 含 shortcuts（实读 ${names.join(",")}）`)
  const entry = settings.NAV_SECTIONS.find((s) => s.name === "shortcuts")
  assert.equal(entry.word, "settings.section.shortcuts", "段名词键")
  const model = settings.settingsModel({ settings: { shortcuts: { query: "zoom" } } })
  assert.equal(model.shortcuts.query, "zoom", "模型切片透传查询词（显式字典坑：缺键 = 搜索静默失效）")
})
