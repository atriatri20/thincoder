/**
 * doc-check-linecounts.mjs — 手跑读数器（行数声明面 ∥ 内容行数）。
 * 权威设计 = `docs/core/design/DOC-DISCIPLINE.md` §7「手跑读数器」行 + §3.20「行数读数」块。
 *
 * **实现已迁核，本档只转出**：`countContentLines` 的**实现单源 = 产品档位 `thincoder-core/doc-check/index.mjs`**
 *   （`doc_check` 的 `lines` 读数面与手跑面读的是同一个函数——全仓第二份计数实现 = 0）。本档不再持函数体，只再出口。
 *   缝是**永久薄壳**，不是带到期日的兼容分支（同 `scripts/doc-check-paragraph.mjs` 的形）。
 * 住本档的 = 声明面逐对比照（`parseSectionRows` / `checkLineCounts`）：口径零改，但不再自动跑、不入引擎
 *   （`thincoder-core/**` 对 `scripts/**` 的 import 点 = 0）；「实读口径」也不在本档重述——以 `countContentLines` 为准（D2）。
 * 语义：声明（doc + section）⇒ 节域内表格行「文件 ⇒ 表值」逐对与实读内容行数比对；
 * 差异 = 报告态（不入闸——KD-2）；行式异常不静默丢（D3）。
 * 表行语法（KD-3）：表值 = 表值格（第 2 格）首个非 `≈` 加粗数字段内的全部 `\d+`；
 * `**≈N**` = 预估 ⇒ 跳过（计「预估行」）；无数字 ⇒ 跳过（计「非数行」）；配对失败 ∕ 值形态不明 ⇒ 行式异常。
 * 导出：`countContentLines`（再出口）/ `parseSectionRows` / `checkLineCounts`。
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { isTableRow } from "./doc-check-paragraph.mjs";
import { countContentLines } from "../thincoder-core/doc-check/index.mjs";

// 再出口（本行不携函数体——量法的家 = 产品档位；迁走后本档只剩这一行与一个 import）。
export { countContentLines };

/** 表格行切格：`| a | b |` ⇒ ["a", "b"]（首尾空元素剔）。 */
function cellsOf(line) {
  const raw = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  return raw.split("|").map((c) => c.trim());
}

/** 首格文件列：含 `/` 且带档扩展名的反引号码段全量。 */
function filesOf(cell) {
  const out = [];
  for (const m of cell.matchAll(/`([^`]+)`/g)) {
    const p = m[1].trim();
    if (p.includes("/") && /\.[A-Za-z0-9]+$/.test(p)) out.push(p);
  }
  return out;
}

/** 表值格判定：est（`**≈N**` 领首）∕ nonnum（无加粗数字段）∕ pair（取数）∕ error（形态异常）。 */
function valueOf(cell) {
  const bolds = [...cell.matchAll(/\*\*([^*]+)\*\*/g)].map((m) => m[1].trim());
  const digitBolds = bolds.filter((s) => /\d/.test(s));
  if (!digitBolds.length) return { kind: "nonnum" };
  if (digitBolds[0].startsWith("≈")) return { kind: "est" };
  const pick = digitBolds.find((s) => !s.startsWith("≈"));
  const nums = [...pick.matchAll(/\d+/g)].map((m) => Number(m[0]));
  return nums.length ? { kind: "pair", nums, seg: pick } : { kind: "nonnum" };
}

/**
 * 节域抽取 + 行语法（纯函数）：标题行（去 `#` + trim）逐字相等者起——至下一同级或更高级标题止。
 * 返回 { found, rows }：rows = [{ line, kind: "pair" | "est" | "nonnum" | "error", files?, nums?, reason? }]。
 * line = 原文 1-based 行号（报告 <doc>:<line> 口径）。
 */
export function parseSectionRows(text, section) {
  const lines = text.split("\n");
  const target = section.trim();
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = /^(#{1,6})\s*(.*)$/.exec(lines[i]);
    if (!m) continue;
    if (start < 0) {
      if (m[2].trim() === target) { start = i; level = m[1].length; }
      continue;
    }
    if (m[1].length <= level) return { found: true, rows: scanRange(lines, start + 1, i) };
  }
  if (start < 0) return { found: false, rows: [] };
  return { found: true, rows: scanRange(lines, start + 1, lines.length) };

  function scanRange(ls, from, to) {
    const rows = [];
    for (let i = from; i < to; i++) {
      if (!isTableRow(ls[i])) continue;
      const cells = cellsOf(ls[i]);
      if (cells.length < 2) continue;
      const files = filesOf(cells[0]);
      const v = valueOf(cells[1]);
      const line = i + 1;
      if (v.kind === "est") { rows.push({ line, kind: "est" }); continue; }
      if (v.kind === "nonnum") { rows.push({ line, kind: "nonnum" }); continue; }
      if (!files.length) { rows.push({ line, kind: "error", reason: "无档列（值存在）" }); continue; }
      if (files.length !== v.nums.length) {
        rows.push({ line, kind: "error", reason: `配对失败（档 ${files.length} ∕ 数 ${v.nums.length}）` });
        continue;
      }
      rows.push({ line, kind: "pair", files, nums: v.nums });
    }
    return rows;
  }
}

/**
 * 行数面检查（执行域 = 运行根一次）：声明逐条 ⇒ 读档 + 节域解析 + 逐对实读比对。
 * 返回 { lines, diffCount, compared, skipped:{est, nonnum} }——差异 = 报告态（调用侧不入闸）。
 */
export function checkLineCounts(decls, { root }) {
  const lines = [];
  let diffCount = 0;
  let compared = 0;
  const skipped = { est: 0, nonnum: 0 };
  for (const d of decls) {
    const doc = String(d.doc ?? "");
    const section = String(d.section ?? "");
    let text = null;
    try { text = readFileSync(resolve(root, doc), "utf8"); } catch { /* 盘无档：下行报告 */ }
    if (text === null) {
      lines.push(`报告 行数 ${doc}（声明档盘无档）`);
      diffCount += 1;
      continue;
    }
    const parsed = parseSectionRows(text, section);
    if (!parsed.found) {
      lines.push(`报告 行数 ${doc}（声明节未命中：${section}）`);
      continue;
    }
    for (const row of parsed.rows) {
      if (row.kind === "est") { skipped.est += 1; continue; }
      if (row.kind === "nonnum") { skipped.nonnum += 1; continue; }
      if (row.kind === "error") { lines.push(`报告 行数 ${doc}:${row.line}（行式异常：${row.reason}）`); continue; }
      for (let i = 0; i < row.files.length; i++) {
        const f = row.files[i];
        const n = row.nums[i];
        compared += 1;
        let real = null;
        try { real = countContentLines(readFileSync(resolve(root, f), "utf8")); } catch { /* 盘无档 */ }
        if (real === null) {
          lines.push(`报告 行数 ${doc}:${row.line} \`${f}\`（盘无档）`);
          diffCount += 1;
          continue;
        }
        if (real !== n) {
          lines.push(`报告 行数 ${doc}:${row.line} \`${f}\`（表 ${n} ⇒ 实读 ${real}，Δ${real - n > 0 ? "+" : ""}${real - n}）`);
          diffCount += 1;
        }
      }
    }
  }
  return { lines, diffCount, compared, skipped };
}
