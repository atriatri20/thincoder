/**
 * doc-check-targets.mjs — M8 采集面（在册判据域）。
 * 权威设计 = M8 机检引擎模块设计（ENGINEERING-MODE-V2-MODULE-MACHINE-CHECK）§2.2
 * 在册判据域：代码面标识符（collectCodeTokens——根树全深走，产品树与核树两制并容）·
 * 用例标题（collectCaseTitles——域根下全部 `test` 树（collectTestTrees）顶层 test(/slow( 首参字面量）。
 * 源域采集不住本档（2026-10-22 FR42：声明面（扫描目录 / 豁免段）随声明面整支退场——扫描根由引擎入口显式给出）。
 * 导出：collectTestTrees / collectCaseTitles / collectCodeTokens。
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "build", "coverage", ".turbo", ".thincoder"]);

/** 读一个字面量串（" / ' / ` 起始；未闭合 → null）。 */
function readLiteral(text, i) {
  const q = text[i];
  if (q !== '"' && q !== "'" && q !== "`") return null;
  let out = "";
  for (let k = i + 1; k < text.length; k++) {
    const c = text[k];
    if (c === "\\") { out += text[k + 1] ?? ""; k++; continue; }
    if (c === q) return out;
    if (c === "\n" && q !== "`") return null;
    out += c;
  }
  return null;
}

/** test 树发现（§4.2.2 · 用例定义面单源）：域根全深走、目录名 `test` 判（非 `<域根>/test` 单点）。 */
export function collectTestTrees(root) {
  const out = [];
  const walk = (dir) => {
    let names = [];
    try { names = readdirSync(dir); } catch { return; }
    for (const n of names) {
      if (SKIP_DIRS.has(n) || n.startsWith("dist-")) continue;
      const p = join(dir, n);
      let st;
      try { st = statSync(p); } catch { continue; }
      if (!st.isDirectory()) continue;
      if (n === "test") out.push(p);
      walk(p);
    }
  };
  walk(root);
  return out;
}

/** A1 目标域：域根下全部 test 树的用例注册调用（顶层 test( / slow(）首参字面量 = 用例标题集。 */
export function collectCaseTitles(root) {
  const titles = [];
  const walk = (dir) => {
    let names = [];
    try { names = readdirSync(dir); } catch { return; }
    for (const n of names) {
      if (SKIP_DIRS.has(n) || n.startsWith("dist-")) continue;
      const p = join(dir, n);
      let st;
      try { st = statSync(p); } catch { continue; }
      if (st.isDirectory()) walk(p);
      else if (/\.(?:mjs|js|cjs)$/.test(n)) {
        let text = "";
        try { text = readFileSync(p, "utf8"); } catch { continue; }
        for (const m of text.matchAll(/(?<![A-Za-z0-9_$])(?:test|slow)\s*\(/g)) {
          const lit = readLiteral(text, m.index + m[0].length);
          if (lit) titles.push(lit);
        }
      }
    }
  };
  for (const tree of collectTestTrees(root)) walk(tree);
  return titles;
}

/** 代码面标识符集（A2 在册判据：词界命中 ⇔ 标识符集含该名）：根树全深走（SKIP_DIRS 排除）。 */
export function collectCodeTokens(root) {
  const set = new Set();
  const add = (p) => {
    let text = "";
    try { text = readFileSync(p, "utf8") } catch { return; }
    for (const m of text.matchAll(/[A-Za-z_$][A-Za-z0-9_$]*/g)) set.add(m[0]);
  };
  const walk = (dir) => {
    let names = [];
    try { names = readdirSync(dir); } catch { return; }
    for (const n of names) {
      if (SKIP_DIRS.has(n) || n.startsWith("dist-")) continue;
      const p = join(dir, n);
      let st;
      try { st = statSync(p); } catch { continue; }
      if (st.isDirectory()) walk(p);
      else if (/\.(?:mjs|js|cjs|json)$/.test(n)) add(p);
    }
  };
  walk(root);
  return set;
}
