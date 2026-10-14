#!/usr/bin/env node
/**
 * 2026-10-11-server-doc-split.test.mjs — server-doc-split 批（域内拆分）批内件 —— 「拆而不破」机器守卫 · 五腿。
 *
 * 来源：批档 `docs/batches/2026-10-11-server-doc-split.md` §2.12-3（五腿定形——必交；修订 = §2.13-9 ∥ §2.13-10）∥ 波 0 钉死表 `.thincoder/tmp/2026-10-11-server-doc-split/wave0-naildown.md`（迁出坐标与归属）。
 * 运行：`node --test docs/batches/2026-10-11-server-doc-split.test.mjs`（cwd = 仓根；本件自 import.meta.url 取根，不依赖 cwd）。
 *
 * 五腿：
 *   ① 档目链单源 —— 链值声明全树恰一处（`webui/WEBUI.md` §1）；AC 判据行不复述链值。
 *   ② 保位 stub 完整性 —— 输入面 = 钉死表迁出坐标 ∪ 引用清单域外坐标（域内 ∥ 跨板 ∥ 产品码头注 ∥ 记录面批档）；
 *      旧坐标逐条解析到壳面 stub（§2.x 节级/子项级逐坐标 ∥ 壳面 `webui/*.md` 指针逐条 → 目标节在；§1–§8 段级）+ 板档 §4/§6 stub 与历史段；
 *      输出 = 未命中清单，空则绿。
 *   ③ AC/KD 号连续（Δ 口径）—— 号集与基线逐号相等（新增缺口 0 ∥ 新增重复 0）；KD 作废留空档
 *      （KD-SV-64/65/66/75/77）为合法例外（在盘口径 = `design/PROJECT.md` 变更记录——作废留空背书句在盘；内容形断言，不锚行号）。
 *      AC-29④ 跨档两行（写面 ∥ 记账面——域分工互补）= 迁移前既有（git `5d812754^` 实读）——基线，非新增。
 *      超基线号（现读 KD-SV-102–105 ∥ AC-40——当日他批入册；开集，随时点增补）= 增量注册，非缺口（号数不设上限——Δ 只计缺口/重复）。
 *   ④ 文内 § 引用解析 —— 迁移后各档：带档名限定引用（`webui/*.md` §N）∥ 「本档 §X」自引 ∥
 *      裸 § 引用（自引 ∪ 同行路径 ∪ 旧坐标兜底）。
 *   ⑤ 全域裸 `SANDBOX.md` 引用新增 = 0（Δ 对基线；基线两处——OPS.md ∥ 需求档——实读已收正归零）。
 *
 * 扫描面（口径同 `scripts/doc-check.mjs`）：`docs` 全库 − `_archive`/`batches`；**记录面不扫**
 * （变更记录 ∥ 历史段；批档仅在腿② 的引用面显式入扫）。产品码 ∥ 跨板档 ∥ 记录面批档只读。
 *
 * 不能机检的项（如实列，不硬造）：纯散文裸 § 引用在单行多档语境下不能唯一归属（腿④-C 取「自引 ∪ 同行路径」宽口径判可达）；
 *   腿④-B/C 面 = 10 档 webui 活面（拆分九档 + 当日他批入册 `webui/TABS.md`）；其余档裸自引未纳——见报告存疑。
 * 壳面 §5/§6/§7 行级 stub 的「存在性」（某文件行/AC 行/KD 行被整行删——无指针可解 ⇒ 不在机检面；现盘逐行在，实读）。
 * 基线（迁移前既有——Δ 口径之锚；实读 git `5d812754^` 逐条核过，只列报不追改）：AC-29④ 跨档两行（`accounts/ACCOUNTS.md` 写面 ∥
 *   `metering/METERING.md` 记账面——域分工互补）∥ `2026-10-06-console-modals.md` 引 `design/PROJECT.md` §6 注③（编号迁移前即缺——记录面零追改）。
 * 本件只读——零写盘。
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..").replace(/\\/g, "/");
const WEBUI = "docs/server/design/webui/WEBUI.md";
const PROJ = "docs/server/design/PROJECT.md";
const REQ = "docs/server/requirements/PROJECT.md";
// 面档集（腿④-B/C 面）：拆分九档 + 当日他批入册第 10 面档 `webui/TABS.md`（console-tabs-component 批——实扫含，Δ 口径照）
const FACE_DOCS = ["WEBUI", "I18N", "STYLE", "SYSTEM", "READINGS", "ME", "ADMIN", "SANDBOX", "CHAT", "TABS"].map((n) => `docs/server/design/webui/${n}.md`);

// ---------- 通用读取 ----------
const read = (rel) => readFileSync(join(ROOT, rel), "utf8");
const exists = (rel) => existsSync(join(ROOT, rel));

/** 目录递归（rel 路径，正斜杠；跳过 _archive/.git/node_modules）。 */
function walk(rel, skipNames = ["_archive", ".git", "node_modules"]) {
  const base = join(ROOT, rel);
  const out = [];
  const skip = new Set(skipNames);
  const rec = (dir) => {
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (skip.has(e.name)) continue;
      const p = join(dir, e.name);
      if (e.isDirectory()) rec(p);
      else out.push(p.replace(/\\/g, "/").slice(ROOT.length + 1));
    }
  };
  if (existsSync(base)) rec(base);
  return out;
}

/** 活面行（记录面不扫）：标题命中「变更记录 ∥ 历史段 ∥ 历史沿革」即截断（标题去首部编号后比对）。 */
function liveLines(rel) {
  const ls = read(rel).split("\n");
  for (let i = 0; i < ls.length; i++) {
    const m = /^(#{1,6})\s+(.*)$/.exec(ls[i]);
    if (!m) continue;
    const t = m[2].trim().replace(/^\d+(?:\.\d+)*[.、]?\s*/, "");
    if (/^(变更记录|历史段|历史沿革)/.test(t)) return ls.slice(0, i);
  }
  return ls;
}

// ---------- 文档节注册（§N.M + 子项①–⑨） ----------
const regCache = new Map();
function reg(rel) {
  if (regCache.has(rel)) return regCache.get(rel);
  const heads = new Set(), sub = new Map();
  let cur = null;
  for (const l of read(rel).split("\n")) {
    const h = /^(#{1,6})\s+(\d+(?:\.\d+)*)[.、]?\s+\S/.exec(l);
    if (h) { heads.add(h[2]); cur = h[2]; continue; }
    const s = l.replace(/^[\s>*-]+/, "").replace(/^\*\*/, "");
    const c = /^([①-⑨])[\s*]|^([①-⑨])$/.exec(s);
    if (c && cur) {
      const k = c[1] ?? c[2];
      if (!sub.has(cur)) sub.set(cur, new Set());
      sub.get(cur).add(k);
    }
  }
  const out = { heads, sub };
  regCache.set(rel, out);
  return out;
}

/** 解析坐标（"2.1①" ∥ "2" ∥ "2:13"）到档内节——命中 = 节标题在 ∧ 子项（若有）在。 */
function resolveDoc(rel, coord) {
  const c = String(coord).replace(/\.$/, "");
  if (/^\d+:\d+/.test(c)) return exists(REQ) && read(REQ).includes("§" + c) ? { ok: true } : { ok: false, why: `需求档无 §${c}` };
  const m = /^(\d+(?:\.\d+)*)([①-⑨]*)$/.exec(c);
  if (!m) return { ok: false, why: `坐标形 §${c}` };
  if (!exists(rel)) return { ok: false, why: `目标档不在盘 ${rel}` };
  const r = reg(rel);
  if (!r.heads.has(m[1])) return { ok: false, why: `档内无 §${m[1]}` };
  if (m[2]) {
    const set = r.sub.get(m[1]);
    for (const ch of m[2]) if (!set || !set.has(ch)) return { ok: false, why: `§${m[1]} 无子项 ${ch}` };
  }
  return { ok: true };
}

// ---------- 壳面 WEBUI.md（保位 stub 面）解析 ----------
const STUB_SECTIONS = ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6", "2.7", "2.8", "2.9", "2.10"];
function webuiSection(num) {
  const ls = read(WEBUI).split("\n");
  let start = -1, level = 0, end = ls.length;
  for (let i = 0; i < ls.length; i++) {
    const m = /^(#{2,3})\s+(\d+(?:\.\d+)*)[.、]?\s+\S/.exec(ls[i]);
    if (m && m[2] === num && start < 0) { start = i; level = m[1].length; continue; }
    if (start >= 0) {
      const mm = /^(#{1,6})\s/.exec(ls[i]);
      if (mm && mm[1].length <= level) { end = i; break; }
    }
  }
  if (start < 0) return null;
  return { start: start + 1, end, body: ls.slice(start + 1, end).join("\n") };
}

/** 旧坐标（`webui/WEBUI.md` §X）解析：保留节（§1–§8 顶层）命中标题；迁出节（§2.1–§2.10）命中 stub（含指针）；子项优先命中子项 stub 行。 */
function resolveOldWebui(coord) {
  const c = String(coord).replace(/\.$/, "");
  if (c === "2.x" || c === "2.x①") {
    for (const s of STUB_SECTIONS) {
      const r = resolveOldWebui(s);
      if (!r.ok) return { ok: false, why: `§2.x 展开：§${s} 未解析（${r.why}）` };
    }
    return { ok: true };
  }
  const m = /^(\d+(?:\.\d+)?)([①-⑦])?$/.exec(c);
  if (!m) return { ok: false, why: `坐标形 §${c}` };
  const [, sec, sub] = m;
  if (STUB_SECTIONS.includes(sec)) {
    const s = webuiSection(sec);
    if (!s) return { ok: false, why: `壳面无 §${sec}` };
    const hasPtr = (t) => /⇒|见/.test(t) && /`webui\/[A-Za-z]+\.md`/.test(t);
    if (sub) {
      const line = s.body.split("\n").find((l) => new RegExp(`^(\\*\\*)?${sub}\\s`).test(l) && /`webui\/[A-Za-z]+\.md`/.test(l));
      if (line) return { ok: true };
      return hasPtr(s.body)
        ? { ok: true }
        : { ok: false, why: `§${sec}${sub} 无子项 stub 且节级 stub 缺指针` };
    }
    return hasPtr(s.body) ? { ok: true } : { ok: false, why: `§${sec} stub 缺指针` };
  }
  const s = webuiSection(sec);
  return s ? { ok: true } : { ok: false, why: `壳面无 §${sec}` };
}

// ---------- 扫描面 ----------
const GATE = walk("docs", ["_archive", "batches"]);            // 门扫描面（同 doc-check：docs − _archive/batches）
const SERVER_LIVE = walk("docs/server", ["_archive", ".git", "node_modules"]); // 域内全（design + requirements）
const fmt = (arr) => arr.length ? arr.map((x) => `  - ${x}`).join("\n") : "  （空）";

// ================================================================
// 腿① 档目链单源
// ================================================================
test("腿① 档目链单源", () => {
  // A —— 链值声明（含链值本体）全树恰一处，且落在 `webui/WEBUI.md` §1
  const decls = [];
  for (const f of GATE) {
    liveLines(f).forEach((l, i) => {
      if (/档目链（UI 代码档/.test(l) && /单源 = 本节/.test(l)) decls.push(`${f}:${i + 1}`);
    });
  }
  assert.equal(decls.length, 1, `档目链单源声明应恰一处，实际 ${decls.length} 处：\n${fmt(decls)}`);
  assert.equal(decls[0].split(":")[0], WEBUI, `档目链单源声明应在 ${WEBUI}，实际 ${decls[0]}`);
  const s1 = webuiSection("1");
  assert.ok(s1 && s1.body.includes("单源 = 本节"), "§1 内单源声明不在（§1 节体未命中）");

  // B —— AC 判据行不复述链值（提「档目」的行不得携「数字 ∥ 数字」链值形）
  const bad = [];
  for (const f of GATE) {
    liveLines(f).forEach((l, i) => {
      if (!/^\|\s*AC-\d/.test(l)) return;
      if (!/(^|[^带])档目/.test(l)) return; // 「带档目录」类词非档目义——剔除
      if (/\d+\s*∥\s*\d+/.test(l)) bad.push(`${f}:${i + 1}（AC 行携档目链值）`);
    });
  }
  assert.deepEqual(bad, [], `AC 判据行不得携档目链值（单源 = ${WEBUI} §1）——未命中：\n${fmt(bad)}`);

  // C —— §5 冻结注在盘（口径留痕：域合计行冻结为历史——链值随冻结行豁免）
  assert.ok(read(WEBUI).includes("冻结为历史"), "§5 域合计「冻结为历史」注不在盘——链值豁免口径失据");
  console.log(`腿① 单源声明 1 处（${decls[0]}）· AC 行链值 0 · 冻结注在盘`);
});

// ================================================================
// 腿② 保位 stub 完整性
// ================================================================
test("腿② 保位 stub 完整性（钉死表迁出坐标 ∪ 引用清单域外坐标）", () => {
  const miss = [];

  // 1) 钉死表迁出坐标 → 壳面 stub（逐坐标：旧 § → 目标面档 §；钉死表 §1/§6 实读）
  const STUB_MAP = [
    ["2.1", "webui/SYSTEM.md", "2.1"],
    ["2.2", "webui/I18N.md", "2.1"],
    ["2.3①", "webui/READINGS.md", "2.1①"], ["2.3②", "webui/READINGS.md", "2.1②"], ["2.3③", "webui/READINGS.md", "2.1③"],
    ["2.3④", "webui/READINGS.md", "2.1④"], ["2.3⑤", "webui/READINGS.md", "2.1⑤"], ["2.3⑥", "webui/ME.md", "2.1"],
    ["2.3⑦", "webui/ME.md", "2.2"],
    ["2.4①", "webui/ADMIN.md", "2.1①"], ["2.4②", "webui/ADMIN.md", "2.1②"],
    ["2.4③", "webui/ADMIN.md", "2.1③"], ["2.4④", "webui/ADMIN.md", "2.1④"],
    ["2.5", "webui/STYLE.md", "2.1"],
    ["2.6", "webui/STYLE.md", "2.2"],
    ["2.7", "webui/SYSTEM.md", "2.2"],
    ["2.8", "webui/SANDBOX.md", "2.1"], ["2.8①", "webui/SANDBOX.md", "2.1①"],
    ["2.9", "webui/SANDBOX.md", "2.2"],
    ["2.10", "webui/CHAT.md", "2.1"],
  ];
  for (const [oldCoord, targetDoc, targetSec] of STUB_MAP) {
    const secNum = /^(\d+\.\d+)/.exec(oldCoord)[1];
    const sub = oldCoord.slice(secNum.length);
    const s = webuiSection(secNum);
    if (!s) { miss.push(`壳面无迁出节 §${secNum}（坐标 §${oldCoord}）`); continue; }
    const lineHit = (l, mark) => { // 子项 stub 行：去行首标记（─ ∥ - ∥ **，含「**②**」闭式）后以子项号起 ∨ 后随空白/星/括号/冒号
      const t = l.replace(/^[\s>*-]+/, "").replace(/^\*\*/, "");
      return t.startsWith(mark) && /^[\s*（(：:]/.test(t.slice(mark.length)) && l.includes(targetDoc);
    };
    const hit = sub ? s.body.split("\n").some((l) => lineHit(l, sub)) : s.body.includes(targetDoc);
    if (!hit) miss.push(`§${oldCoord} → ${targetDoc} stub 行缺（指针未命中）`);
    const r = resolveDoc(`docs/server/design/${targetDoc}`, targetSec);
    if (!r.ok) miss.push(`§${oldCoord} → ${targetDoc} §${targetSec} 目标节不解析（${r.why}）`);
  }

  // 2) 壳面内全部面档指针（§1 导航 ∥ §2.x stub ∥ §5 文件行 ∥ §6 AC 行 ∥ §7 KD 行 ∥ §8 段级）→ 目标节在
  liveLines(WEBUI).forEach((l, i) => {
    const re = /`(webui\/[A-Za-z-]+\.md)`\s*§([\d.]+[①-⑨]*)/g;
    let m;
    while ((m = re.exec(l))) {
      const r = resolveDoc(`docs/server/design/${m[1]}`, m[2]);
      if (!r.ok) miss.push(`${WEBUI}:${i + 1} → ${m[1]} §${m[2]} 不解析（${r.why}）`);
    }
  });

  // 3) 板档 §4/§6 stub + 历史段（内容感知：裸 §N → live 节；注№ → 历史段·原 §6 块）
  const ptxt = read(PROJ);
  if (!ptxt.includes("迁移前 §4（原 101 行决策索引）⇒")) miss.push("板档 live §4 缺「迁移前 §4」stub 注");
  if (!ptxt.includes("迁移前 §6（原总账 + 注①–⑳）⇒")) miss.push("板档 live §6 缺「迁移前 §6」stub 注");
  if (!/^### 原 §4·决策索引/m.test(ptxt)) miss.push("板档历史段缺「原 §4·决策索引」块");
  if (!/^### 原 §6·总账/m.test(ptxt)) miss.push("板档历史段缺「原 §6·总账」块");
  const pLines = ptxt.split("\n");
  const liveHeads = new Set();
  for (const l of pLines) {
    const m = /^(#{2,3})\s+(\d+(?:\.\d+)*)[.、]?\s+\S/.exec(l);
    if (m) liveHeads.add(m[2]);
  }
  const block6 = pLines.slice(pLines.findIndex((l) => /原 §6·总账/.test(l))).join("\n");
  // §9 单域保位 stub（R50–R57）→ 目标档节在 ∧ 含同号标记
  const stubRows = [["R50", "client/CLIENT.md", "8"], ["R51", "sandbox/SANDBOX.md", "16"], ["R52", "sandbox/SANDBOX.md", "16"],
    ["R53", "sandbox/SANDBOX.md", "16"], ["R54", "agent/ADMIN-AGENT.md", "13"], ["R55", "sandbox/SANDBOX.md", "16"],
    ["R56", "sandbox/SANDBOX.md", "16"], ["R57", "sandbox/SANDBOX.md", "16"]];
  for (const [rn, doc, sec] of stubRows) {
    const row = pLines.find((l) => new RegExp(`^\\|\\s*${rn}\\s*\\|`).test(l));
    if (!row || !row.includes(doc)) { miss.push(`板档 §9 ${rn} stub 行缺（或未指 ${doc}）`); continue; }
    const r = resolveDoc(`docs/server/design/${doc}`, sec);
    if (!r.ok) { miss.push(`板档 §9 ${rn} → ${doc} §${sec} 不解析（${r.why}）`); continue; }
    if (!read(`docs/server/design/${doc}`).includes(rn)) miss.push(`板档 §9 ${rn} → ${doc} §${sec} 内无 ${rn} 标记`);
  }

  // 4) 引用清单域外坐标（动态实扫）——
  //    faces：域内全 ∥ 跨板 TEAM.md ∥ 产品码头注（public + src）∥ 记录面批档（全量，命中的才解析）
  const batchDocs = walk("docs/batches", [".git", "_archive"]).filter((f) => f.endsWith(".md")); // 记录面 = 批档 .md（跳归档；本件自身不入扫）
  const faces = [...SERVER_LIVE, "docs/core/design/TEAM.md", ...walk("thincoder-server/public"), ...walk("thincoder-server/src"), ...batchDocs];
  const KNOWN_UNRESOLVED = []; // 见下：唯一基线条目（迁移前即缺——记录面零追改）单列
  let webuiCites = 0;
  let projCites = 0;
  const faceOf = (f) => f.startsWith("docs/server/") ? "域内" : f === "docs/core/design/TEAM.md" ? "跨板" : f.startsWith("thincoder-server/") ? "产品码" : "批档";
  const faceCite = { 域内: 0, 跨板: 0, 产品码: 0, 批档: 0 };
  const serverBatchSet = new Set(batchDocs.filter((f) => read(f).includes("webui/WEBUI.md")));
  for (const f of faces) {
    let txt;
    try { txt = read(f); } catch { continue; }
    // 4a) `webui/WEBUI.md` §X（旧坐标零死）
    txt.split("\n").forEach((l, i) => {
      const re = /webui\/WEBUI\.md`?\s*(§[\d.x]+[①-⑦]?)/g;
      let m;
      while ((m = re.exec(l))) {
        webuiCites++;
        faceCite[faceOf(f)]++;
        const r = resolveOldWebui(m[1].slice(1));
        if (!r.ok) miss.push(`${f}:${i + 1} 旧坐标 ${m[1]} 不解析（${r.why}）`);
      }
    });
    // 4b) server 本仓 `design/PROJECT.md` §X（引用面 = 域内全 + 引 WEBUI 的批档集）
    if (f.startsWith("docs/server/") || serverBatchSet.has(f)) {
      txt.split("\n").forEach((l, i) => {
        const re = /(?<![\w-]\/)(?:docs\/server\/)?`design\/PROJECT\.md`\s*(§[\d.]+(?:\s*[／/]\s*§?[\d.]+)*)/g;
        let m;
        while ((m = re.exec(l))) {
          const span = l.slice(m.index, m.index + m[0].length + 16);
          for (const sec of m[1].replace(/§/g, "").split(/[／/]/).map((x) => x.trim()).filter(Boolean)) {
            projCites++;
            if (!liveHeads.has(sec)) miss.push(`${f}:${i + 1} 板档 §${sec} 不解析（live 节缺）`);
          }
          const notes = span.match(/注\s*([①-⑳]+)/g) ?? [];
          for (const nblk of notes) {
            for (const ch of nblk.match(/[①-⑳]/g) ?? []) { // 圈号非 \d——逐圈号取值（勿用正则 \\D 过滤）
              projCites++;
              if (!block6.includes(`注${ch}`)) {
                // 注③：编号缺——迁移前即缺（git 5d812754^ 实读同缺；记录面零追改零）——基线已知，单列
                if (ch === "③" && f === "docs/batches/2026-10-06-console-modals.md") { KNOWN_UNRESOLVED.push(`${f}:${i + 1} 板档 §6 注③（迁移前即缺——基线已知）`); continue; }
                miss.push(`${f}:${i + 1} 板档 §6 注${ch} 不解析（历史段块缺）`);
              }
            }
          }
        }
      });
    }
  }

  // 输入面非空核（防「面塌缩静默绿」——目录/档不在盘 ⇒ walk 空/读败被吞 ⇒ 曾零覆盖）
  for (const [face, n] of Object.entries(faceCite)) {
    if (n === 0) miss.push(`引用面「${face}」零命中——输入面塌缩（档/目录不在盘？设计 §2.12-3 明列该面）`);
  }

  const listing = `未命中清单（${miss.length}）：\n${fmt(miss)}\n基线已知（${KNOWN_UNRESOLVED.length}）：\n${fmt(KNOWN_UNRESOLVED)}`;
  assert.deepEqual(miss, [], `保位 stub 完整性：未命中清单应空——${listing}`);
  console.log(`腿② stub 映射 ${STUB_MAP.length} 坐标 · 旧坐标引用 ${webuiCites} 处（域内 ${faceCite["域内"]} ∥ 跨板 ${faceCite["跨板"]} ∥ 产品码 ${faceCite["产品码"]} ∥ 批档 ${faceCite["批档"]}）· 板档引用 ${projCites} 处 · 未命中 0 · 基线已知 ${KNOWN_UNRESOLVED.length}`);
});

// ================================================================
// 腿③ AC/KD 号连续（Δ 口径）
// ================================================================
test("腿③ AC/KD 号连续（Δ 口径）", () => {
  const kd = new Set();
  const kdDef = new Map();
  const ac = new Set();
  const acPerFile = new Map();     // "file 号/子项" → 行号集
  const acCrossFile = new Map();   // "号+子项"（子项非空）→ 出处集
  for (const f of SERVER_LIVE) {
    liveLines(f).forEach((l, i) => {
      let m;
      const kdRe = /KD-SV-(\d+)/g;
      while ((m = kdRe.exec(l))) kd.add(+m[1]);
      const dm = /^\|\s*KD-SV-(\d+)\s*\|\s*(.*)$/.exec(l);
      if (dm && !/^⇒/.test(dm[2].trim())) kdDef.set(+dm[1], (kdDef.get(+dm[1]) ?? 0) + 1); // 全形定义行（stub 行「⇒ …」不计）
      const acRe = /AC-(\d+)/g;
      while ((m = acRe.exec(l))) ac.add(+m[1]);
      const am = /^\|\s*AC-(\d+)([①-⑳]*)\s*[（(]?/.exec(l);
      if (am) {
        const cell1 = l.split("|")[1] ?? "";
        const cell2 = (l.split("|")[2] ?? "").trim();
        if (!/（续/.test(cell1) && !/^(⇒|→)/.test(cell2)) { // 活跃判据行（续行/stub 行除外）
          const k = `${f} ${am[1]}/${am[2] ?? ""}`;
          if (!acPerFile.has(k)) acPerFile.set(k, []);
          acPerFile.get(k).push(i + 1);
          if (am[2]) {
            const ck = `${am[1]}${am[2]}`;
            if (!acCrossFile.has(ck)) acCrossFile.set(ck, []);
            acCrossFile.get(ck).push(`${f}:${i + 1}`);
          }
        }
      }
    });
  }
  // 在盘口径（变更记录——作废留空背书句；内容形断言，不锚行号）
  const ptxt = read(PROJ);
  assert.ok(ptxt.includes("KD-SV-64/65/66/75/77") && ptxt.includes("作废"), "KD 作废留空口径句不在盘（变更记录）——Δ 口径失据");
  assert.ok(ptxt.includes("编号留空档"), "「编号留空档——历史 = 变更记录」句不在盘（变更记录）——Δ 口径失据");

  // KD：连续（1..101 除作废档）+ 作废档无定义行（未复活）+ 定义行逐号 ≤1
  const VOID = [64, 65, 66, 75, 77];
  const kdGaps = [];
  for (let n = 1; n <= 101; n++) if (!kd.has(n) && !VOID.includes(n)) kdGaps.push(n);
  assert.deepEqual(kdGaps, [], `KD 号集缺口（应仅作废档空）——新增缺口：${kdGaps.join(", ")}`);
  const revived = VOID.filter((n) => kdDef.has(n));
  assert.deepEqual(revived, [], `作废留空档不得有全形定义行（复活）：${revived.join(", ")}`);
  const kdDups = [...kdDef.entries()].filter(([, c]) => c > 1).map(([n, c]) => `KD-SV-${n}×${c}`);
  assert.deepEqual(kdDups, [], `KD 全形定义行应逐号 ≤1（单一权威源）——重复：${kdDups.join(" ")}`);

  // AC：连续（1..39——实读 2026-10-11 基线，含 AC-39 当日入册）+ 无重复（活跃行：档内（号+子项）唯一 ∥ 跨档（号+子项≠空）唯一）
  const acGaps = [];
  for (let n = 1; n <= 39; n++) if (!ac.has(n)) acGaps.push(n);
  assert.deepEqual(acGaps, [], `AC 号集缺口——新增缺口：${acGaps.join(", ")}`);
  const acFileDups = [...acPerFile.entries()].filter(([, v]) => v.length > 1).map(([k, v]) => `${k} @ ${v.join(",")}`);
  assert.deepEqual(acFileDups, [], `AC 档内（号+子项）活跃行应唯一——重复：\n${fmt(acFileDups)}`);
  // 跨档（号+子项）重复 = Δ：对基线集合（新增重复 0——设计 §2.12-2）；基线条目逐条附据（git `5d812754^` 实读为同对）
  const AC_CROSS_BASELINE = new Set([
    "29④@docs/server/design/accounts/ACCOUNTS.md",   // 写面键形/键面随动判据（迁移前既有）
    "29④@docs/server/design/metering/METERING.md",   // 记账面判据（迁移前既有）
  ]);
  const acCrossNew = [];
  for (const [k, v] of acCrossFile) {
    if (v.length <= 1) continue;
    if (!v.every((x) => AC_CROSS_BASELINE.has(`${k}@${x.split(":")[0]}`))) acCrossNew.push(`AC-${k}: ${v.join(" ")}`);
  }
  assert.deepEqual(acCrossNew, [], `AC 跨档（号+子项）活跃行：新增重复应 0（Δ 口径）——未命中：\n${fmt(acCrossNew)}`);
  const extra = [...kd].filter((n) => n > 101).sort((a, b) => a - b); // 超基线增量注册（非缺口——Δ 只计缺口/重复）
  const extraAc = [...ac].filter((n) => n > 39).sort((a, b) => a - b);
  console.log(`腿③ KD 号 1..101 − 作废 ${VOID.length} = 96 全在（定义行 ${kdDef.size}）· 超基线增量 ${extra.length}（${extra.map((n) => `KD-SV-${n}`).join(" ∥ ") || "无"}）· AC 号 1..39 全在 · 超基线增量 ${extraAc.length}（${extraAc.map((n) => `AC-${n}`).join(" ∥ ") || "无"}·实读）· 新增缺口/重复 0 · 跨档互补对 1（基线 AC-29④）`);
});

// ================================================================
// 腿④ 文内 § 引用解析
// ================================================================
test("腿④ 文内 § 引用解析（迁移后各档）", () => {
  const miss = [];
  const designLive = [...walk("docs/server/design"), REQ];

  // A —— 带档名限定引用（`webui/*.md` §N——跨档改指面）：目标档 §N 在
  let aN = 0;
  for (const f of designLive) {
    liveLines(f).forEach((l, i) => {
      const re = /`(webui\/[A-Za-z-]+\.md)`\s*§([\d.x]+[①-⑨]*)/g;
      let m;
      while ((m = re.exec(l))) {
        aN++;
        if (m[2] === "2.x") continue;
        const r = resolveDoc(`docs/server/design/${m[1]}`, m[2]);
        if (!r.ok) miss.push(`A ${f}:${i + 1} → ${m[1]} §${m[2]} 不解析（${r.why}）`);
      }
    });
  }

  // B —— 「本档 §X」自引（面档集活面）：档内 §X 在
  let bN = 0;
  for (const f of FACE_DOCS) {
    liveLines(f).forEach((l, i) => {
      const re = /本档\s*§([\d.]+[①-⑨]*)/g;
      let m;
      while ((m = re.exec(l))) {
        bN++;
        const r = resolveDoc(f, m[1]);
        if (!r.ok) miss.push(`B ${f}:${i + 1} 本档 §${m[1]} 不解析（${r.why}）`);
      }
    });
  }

  // C —— 裸 § 引用（宽口径判可达）：自引 ∨ 同行前文路径 ∨ 旧坐标兜底（§2.x → 壳面 stub）
  let cN = 0;
  const EXTERNAL = /(需求|批档|README|板档|域档|面档|设计档|文档|无)\s*$/;
  for (const f of FACE_DOCS) {
    liveLines(f).forEach((l, i) => {
      const pathsBefore = [];
      const re = /`([^`]+\.md)`|§([\d.x:]+[①-⑨]*)/g;
      let m;
      while ((m = re.exec(l))) {
        if (m[1]) { pathsBefore.push(m[1]); continue; }
        const before = l.slice(0, m.index);
        if ((before.match(/`/g) ?? []).length % 2 === 1) continue;      // 码段内
        if (/`[^`]*\.md`\s*$/.test(before.replace(/[（(]\s*$/, ""))) continue; // 紧邻档名限定（A 面）
        if (/本档\s*$/.test(before)) continue;                          // 本档自引（B 面）
        if (EXTERNAL.test(before)) continue;                            // 散文外部限定（需求/批档/README…）
        if (m[2] === "2.x") continue;
        cN++;
        if (resolveDoc(f, m[2]).ok) continue;
        if (/^\d+:\d+/.test(m[2])) continue;
        let ok = false;
        for (const p of pathsBefore) {
          const t = p.startsWith("docs/") ? p : `docs/server/design/${p}`;
          if (!exists(t)) continue;
          if (resolveDoc(t, m[2]).ok) { ok = true; break; }
        }
        if (!ok && /^2\./.test(m[2]) && resolveOldWebui(m[2]).ok) ok = true; // 旧坐标兜底
        if (!ok) miss.push(`C ${f}:${i + 1} 裸 §${m[2]} 不可达（自引 ∥ 同行路径 ∥ 旧坐标 均未命中）`);
      }
    });
  }

  assert.deepEqual(miss, [], `文内 § 引用解析：未命中应空——未命中：\n${fmt(miss)}`);
  console.log(`腿④ 限定引用 ${aN} · 本档自引 ${bN} · 裸引 ${cN} · 未命中 0`);
});

// ================================================================
// 腿⑤ 全域裸 `SANDBOX.md` 引用新增 = 0（Δ 口径）
// ================================================================
test("腿⑤ 全域裸 SANDBOX.md 引用新增 = 0（Δ 口径）", () => {
  // 扫描面 = 域内活面（docs/server/**）∪ 门扫描面（docs − _archive/batches）；记录面不扫。
  // Δ 基线（设计 §2.13-9 两处——实读已收正）：OPS.md:273 ⇒ `sandbox/SANDBOX.md` §13 ∥ requirements:508 ⇒ `sandbox/SANDBOX.md` §5（设计登记坐标；现读 :275 ∥ :516）。
  // 裸形判据 = 无路径前缀（前邻非 [\w./-]）——含引号形「`SANDBOX.md`」（基线两处即该形；形型不可分辨则同形回归不红——审计修正）；路径形 `webui/SANDBOX.md` ∥ `sandbox/SANDBOX.md` 前邻「/」不计。
  const hits = [];
  for (const f of GATE) {
    liveLines(f).forEach((l, i) => {
      const re = /(?<![\w.\/-])SANDBOX\.md/g;
      let m;
      while ((m = re.exec(l))) hits.push(`${f}:${i + 1}（裸形——应带路径）`);
    });
  }
  assert.deepEqual(hits, [], `裸 \`SANDBOX.md\` 引用新增应 0（对基线）——命中：\n${fmt(hits)}`);
  console.log(`腿⑤ 裸 SANDBOX.md 0 处（扫描 ${GATE.length} 档活面）`);
});
