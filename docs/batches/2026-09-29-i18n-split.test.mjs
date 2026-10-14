/**
 * 2026-09-29-i18n-split · 批内件（A1–A6 机检 · settings 族出档验收）。
 * 目标 = `thincoder-desktop/renderer/i18n-settings.mjs`（第四档）承接主档 `renderer/i18n.mjs` 自有 `settings.*`
 * 键（两语）——纯搬零改 + 原位展开；主档 500 ⇒ 393。
 * **重锚（2026-10-04 · 台账 #889；2026-10-10 ‖ 2026-10-11 随正轮）——断言 = 现盘形**：批量随后续批演进——`SETTINGS_DICT` 84 ‖ `VIEWS_DICT` 150
 * ‖ 主档自有块 87×2 ‖ 主档 450（A4 阈值 `≤400 ⇒ ≤420 ⇒ ≤437 ⇒ ≤455` = 现读 + 5 余量 · KD-9）‖ `i18n-views.mjs` 416；
 * A2 基线 = 2026-10-11 全量重冻（349 条两语——首启保存面收正批随正）。
 * 判据（批档 §2.6 A1–A6）：
 *   A1 键集：三档各自两语键集相等同序 + 主档自有块键位级判读（两语各 87 ∧ 零 `settings.` 前缀键；
 *      注释 ‖ 链行文本不入判读面）+ 四档键集两两互斥（合计 = 合并表 349）。
 *   A2 值逐字：基线 `docs/batches/2026-09-29-i18n-split.baseline.json`（2026-10-11 全量重冻）对拍 —— `HOST_DICT`
 *      两语条目全量等值等序；三档条目 = 基线子序列（相对序保持）。
 *   A4 行数护栏：`i18n.mjs` ≤ 455 ∧ `i18n-settings.mjs` ≤ 300 ∧ `i18n-views.mjs` ‖ `i18n-composer.mjs` 零改（416 ‖ 92）。
 *   A5 接线：`initDict` ∕ `t` 两语命中（`settings.title`）+ 缺键回落键名（不静默吞）。
 *   A6 零越域：在飞面读数冻结（statusline 三档 264 ‖ 259 ‖ 25；设置面 9 档 = 2026-10-11 届盘实读重锚）零笔。
 * 位置 = `docs/batches/`（批内件归档位——随批留存）；
 * 运行 = 自 `thincoder/` 根：`node --test docs/batches/2026-09-29-i18n-split.test.mjs`
 *   （只引 renderer 词表档 · 零 `/rc/` ⇒ 无需 `--import ./test/rc-resolve.mjs`）。
 */
import test from "node:test"
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"

const ROOT = new URL("../../", import.meta.url)
const read = (p) => readFileSync(new URL(p, ROOT), "utf8")
const contentLines = (p) => {
  const a = read(p).split("\n")
  return a[a.length - 1] === "" ? a.length - 1 : a.length
}
const out = (label, value) => console.log(`[读数] ${label}: ${value}`)

const { HOST_DICT, initDict, t } = await import(new URL("thincoder-desktop/renderer/i18n.mjs", ROOT))
const { SETTINGS_DICT } = await import(new URL("thincoder-desktop/renderer/i18n-settings.mjs", ROOT))
const { VIEWS_DICT } = await import(new URL("thincoder-desktop/renderer/i18n-views.mjs", ROOT))
const { COMPOSER_DICT } = await import(new URL("thincoder-desktop/renderer/i18n-composer.mjs", ROOT))
const baseline = JSON.parse(read("docs/batches/2026-09-29-i18n-split.baseline.json"))

const keysOf = (dict, locale) => Object.keys(dict[locale])
const sameSeq = (x, y) => x.length === y.length && x.every((k, i) => k === y[i])
const entrySeq = (dict, locale) => Object.entries(dict[locale])
const eqSeq = (x, y) => x.length === y.length && x.every(([k, v], i) => k === y[i][0] && v === y[i][1])
const isSub = (sub, full) => {
  let i = 0
  for (const [k, v] of full) if (i < sub.length && sub[i][0] === k && sub[i][1] === v) i++
  return i === sub.length
}

// ── A1 键集 ─────────────────────────────────────────────────────────────────
const src = read("thincoder-desktop/renderer/i18n.mjs").split("\n")
const iEn = src.findIndex((l) => l === "  en: {")
const iZh = src.findIndex((l) => l === "  zh: {")
const iEnd = src.findIndex((l, i) => i > iZh && /^  \},$/.test(l))
const grabKeys = (from, to) => src.slice(from + 1, to).map((l) => l.match(/^    "([^"]+)":/)).filter(Boolean).map((m) => m[1])
const ownEn = grabKeys(iEn, iZh)
const ownZh = grabKeys(iZh, iEnd)

test("A1 键集：三档两语相等同序 + 主档自有块 87×2 ∧ 零 settings. 前缀 ∧ 四档互斥", () => {
  for (const [name, dict, n] of [["SETTINGS_DICT", SETTINGS_DICT, 84], ["VIEWS_DICT", VIEWS_DICT, 150], ["COMPOSER_DICT", COMPOSER_DICT, 28]]) {
    assert.ok(sameSeq(keysOf(dict, "en"), keysOf(dict, "zh")), `${name} 两语键集相等且同序`)
    assert.equal(keysOf(dict, "en").length, n, `${name} 单语键数 = ${n}`)
  }
  assert.equal(ownEn.length, 87, "自有块 en = 87 键")
  assert.equal(ownZh.length, 87, "自有块 zh = 87 键")
  assert.ok(sameSeq(ownEn, ownZh), "自有块两语同序")
  assert.equal(ownEn.filter((k) => k.startsWith("settings.")).length, 0, "自有块零 settings. 前缀键")
  const groups = { own: ownEn, settings: keysOf(SETTINGS_DICT, "en"), views: keysOf(VIEWS_DICT, "en"), composer: keysOf(COMPOSER_DICT, "en") }
  const names = Object.keys(groups)
  for (let i = 0; i < names.length; i++) {
    for (let j = i + 1; j < names.length; j++) {
      const dup = groups[names[i]].filter((k) => new Set(groups[names[j]]).has(k))
      assert.deepEqual(dup, [], `${names[i]} ∩ ${names[j]} 为空`)
    }
  }
  assert.equal(names.reduce((s, n) => s + groups[n].length, 0), Object.keys(HOST_DICT.en).length, "四档合计 = 合并表")
  out("自有块 en/zh", `${ownEn.length} / ${ownZh.length}`)
  out("四档键数", names.map((n) => `${n}=${groups[n].length}`).join(" · "))
})

// ── A2 基线对拍 ─────────────────────────────────────────────────────────────
test("A2 基线对拍：HOST_DICT 两语全量等值等序 + 三档子序列（相对序保）", () => {
  assert.ok(eqSeq(entrySeq(HOST_DICT, "en"), baseline.en), `HOST_DICT.en ${baseline.en.length} 条逐项等值等序`)
  assert.ok(eqSeq(entrySeq(HOST_DICT, "zh"), baseline.zh), `HOST_DICT.zh ${baseline.zh.length} 条逐项等值等序`)
  for (const [name, dict] of [["SETTINGS_DICT", SETTINGS_DICT], ["VIEWS_DICT", VIEWS_DICT], ["COMPOSER_DICT", COMPOSER_DICT]]) {
    assert.ok(isSub(entrySeq(dict, "en"), baseline.en), `${name}.en = 基线子序列`)
    assert.ok(isSub(entrySeq(dict, "zh"), baseline.zh), `${name}.zh = 基线子序列`)
  }
  out("基线", `en=${baseline.en.length} zh=${baseline.zh.length}（2026-10-11 重冻）`)
})

// ── A4 行数护栏 ─────────────────────────────────────────────────────────────
test("A4 行数护栏：主档 ≤455 ∧ 新档 ≤300 ∧ views ‖ composer 重锚（416 ‖ 92）", () => {
  const main = contentLines("thincoder-desktop/renderer/i18n.mjs")
  const settings = contentLines("thincoder-desktop/renderer/i18n-settings.mjs")
  assert.ok(main <= 455, `i18n.mjs = ${main} ≤ 455（现读 + 5 余量——随正重锚 2026-10-11）`)
  assert.ok(settings <= 300, `i18n-settings.mjs = ${settings} ≤ 300`)
  assert.equal(contentLines("thincoder-desktop/renderer/i18n-views.mjs"), 416, "i18n-views.mjs = 416（重锚：后续批条目增殖）")
  assert.equal(contentLines("thincoder-desktop/renderer/i18n-composer.mjs"), 92, "i18n-composer.mjs 零改（92）")
  out("行数", `i18n.mjs=${main} · i18n-settings.mjs=${settings} · views=416 · composer=92`)
})

// ── A5 接线面 ───────────────────────────────────────────────────────────────
test("A5 接线面：initDict ∕ t 两语命中 + 缺键回落键名", () => {
  assert.equal(initDict({ locale: "en" }), "en")
  assert.equal(t("settings.title"), "Settings")
  assert.equal(initDict({ locale: "zh" }), "zh")
  assert.equal(t("settings.title"), "设置")
  initDict({ locale: "en" })
  assert.equal(t("settings.__absent"), "settings.__absent", "缺键回落键名（不静默吞）")
  out("t(settings.title)", `en=${JSON.stringify(t("settings.title"))}`)
})

// ── A6 零越域（在飞面读数冻结）─────────────────────────────────────────────
const FROZEN = new Map([
  // statusline 三档（批档 §2.3 届盘读数 —— 在飞面零笔；2026-10-11 随正重锚）
  ["thincoder-desktop/renderer/views/statusline.mjs", 264],
  ["thincoder-desktop/renderer/views/statusline-segments.mjs", 259],
  ["thincoder-desktop/renderer/views/statusline-banner.mjs", 25],
  // 设置面 9 档（消费面 —— 本批只读零写；2026-10-11 届盘实读重锚）
  ["thincoder-desktop/renderer/settings-confirm.mjs", 80],
  ["thincoder-desktop/renderer/views/settings.mjs", 454],
  ["thincoder-desktop/renderer/views/settings-agent.mjs", 188],
  ["thincoder-desktop/renderer/views/settings-controls.mjs", 193],
  ["thincoder-desktop/renderer/views/settings-sections.mjs", 101],
  ["thincoder-desktop/renderer/views/settings-sections-env.mjs", 129],
  ["thincoder-desktop/renderer/views/settings-sections-mcp.mjs", 261],
  ["thincoder-desktop/renderer/views/settings-sections-tools.mjs", 208],
])
test("A6 零越域：在飞面零笔（statusline ×3 + 设置面 9 档 = 行数冻结）", () => {
  for (const [p, n] of FROZEN) assert.equal(contentLines(p), n, `${p} = ${n}（冻结）`)
  out("在飞面冻结档数", String(FROZEN.size))
})
