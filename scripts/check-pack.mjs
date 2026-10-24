#!/usr/bin/env node
/**
 * check-pack.mjs — 打包面引用闭包断言（#1363）+ registry 内容面复验式（#1222）。
 *
 * 权威设计 = `docs/batches/2026-10-15-car5-release.md` §2（逐行规格 ∥ AC-1–AC-4）；接线 = `docs/RELEASE.md` §5.0 P2 核行 ∥ CLI 行 ∥ P4 ④（--registry）∥ P6 清单一条。
 * 父侧直接执行（工程工具面）· 单提交可 revert。
 *
 * 机制（一）：`npm pack --dry-run --json` 取 `files[]` 路径集 P；逐档扫 pack 内脚本（`.mjs` ∥ `.cjs` ∥ `.js`）：
 *   静态 `import` ∥ `export … from` ∥ 裸 `import "x"` ∥ 字面 `import("x")` ⇒ 相对说明符（`./` `../`）解析为包内路径，判 ∈ P；
 *   越出包根 = 错误；非字面动态 import = 警告行（不入闸）；裸说明符（`node:` ∥ `@thincoder/*` ∥ 第三方）= 跳过（外来面）。
 *   另判 根 `.mjs` 集 = 源树根集（不等即红）。
 * 判据（exit 0/1）：闭包缺口 0 ∧ 越界 0 ∧ 根集相等。
 *
 * 机制（二 · `--registry <号>`，缺省号 = 源版本）：本地 pack integrity 与 registry `dist.integrity` 相等 ∧ 路径集相等；
 *   不等 ⇒ 红 + 逐路径差（本地独有 ∥ registry 独有）。判读窗：发布窗内树冻结 ⇒ 相等为判据；窗外（在飞树）跑 = 预期漂移读数（非判据）。
 *
 * 用法：node scripts/check-pack.mjs <包目录> [--registry [号]]
 *   例：node scripts/check-pack.mjs thincoder-core
 *       node scripts/check-pack.mjs thincoder-cli
 *       node scripts/check-pack.mjs thincoder-core --registry 0.10.7
 * 零依赖（`node:` 系统模块 only）。
 */
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const SPEC_STATIC_FROM = /\bfrom\s*["']([^"']+)["']/g;
const SPEC_STATIC_BARE = /\bimport\s*["']([^"']+)["']/g;
const SPEC_DYNAMIC_LITERAL = /\bimport\(\s*["']([^"']+)["']\s*\)/g;
const SPEC_DYNAMIC_OTHER = /\bimport\(/g;
const SCRIPT_EXT = /\.(?:mjs|cjs|js)$/;
/** 开发者根档规约（`files` 面按设计不入包——如 CLI `test-startup.mjs` 黑屏复现器）：`test-*` ∥ `smoke-*` ∥ `*.test`。 */
const DEV_ROOT = /^(?:test-|smoke-).*\.mjs$|\.test\.mjs$/;

function usage() {
  console.error("用法：node scripts/check-pack.mjs <包目录> [--registry [号]]");
  console.error("  例：node scripts/check-pack.mjs thincoder-core  ∥  … thincoder-core --registry 0.10.7");
}

function packJson(cwd) {
  const raw = execSync("npm pack --dry-run --json", { cwd, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 });
  return JSON.parse(raw)[0];
}

/** 逐档提取说明符：静态 from ∥ 裸 import ∥ 字面动态；返回 {相对 ∥ 裸 ∥ 告警}。 */
function extractSpecifiers(source) {
  const rel = [];
  const bare = [];
  let dynamicNonLiteral = 0;
  for (const [i, line] of source.split("\n").entries()) {
    const trimmed = line.trim();
    if (trimmed.startsWith("//") || trimmed.startsWith("*")) continue;
    const seen = new Set();
    for (const re of [SPEC_STATIC_FROM, SPEC_STATIC_BARE, SPEC_DYNAMIC_LITERAL]) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line)) !== null) {
        if (seen.has(m[1])) continue;
        seen.add(m[1]);
        (m[1].startsWith(".") ? rel : bare).push({ spec: m[1], line: i + 1 });
      }
    }
    SPEC_DYNAMIC_OTHER.lastIndex = 0;
    if (SPEC_DYNAMIC_OTHER.test(line) && !SPEC_DYNAMIC_LITERAL.test(line)) dynamicNonLiteral += 1;
  }
  return { rel, bare, dynamicNonLiteral };
}

/** 路径差集（纯函数——批内件 T6 腿直调；本地独有 ∥ registry 独有）。 */
export function diffPaths(localPaths, remotePaths) {
  const remoteSet = new Set(remotePaths);
  const localSet = new Set(localPaths);
  return {
    localOnly: localPaths.filter((p) => !remoteSet.has(p)),
    registryOnly: remotePaths.filter((p) => !localSet.has(p)),
  };
}

function main() {
  const args = process.argv.slice(2);
  const pkgArg = args.find((a) => !a.startsWith("--") && args[args.indexOf(a) - 1] !== "--registry");
  if (!pkgArg) { usage(); process.exit(2); }
  const regIdx = args.indexOf("--registry");
  const regNext = regIdx >= 0 ? args[regIdx + 1] : null;
  const useRegistry = regIdx >= 0;
  const registryVerArg = useRegistry && regNext && !regNext.startsWith("--") ? regNext : null;

  const pkgDir = resolve(process.cwd(), pkgArg);
  const pkgJson = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  const local = packJson(pkgDir);
  const packPaths = local.files.map((f) => f.path);
  const P = new Set(packPaths);

  // ① 闭包扫描
  const gaps = [];
  const escapes = [];
  const warnings = [];
  let scanned = 0;
  let importCount = 0;
  let relCount = 0;
  for (const p of packPaths) {
    if (!SCRIPT_EXT.test(p)) continue;
    scanned += 1;
    let source;
    try { source = readFileSync(join(pkgDir, ...p.split("/")), "utf8"); } catch { warnings.push(`${p} —— 盘上不可读（pack 列报 ≠ 盘面）`); continue; }
    const { rel, bare, dynamicNonLiteral } = extractSpecifiers(source);
    importCount += rel.length + bare.length;
    relCount += rel.length;
    for (const { spec, line } of rel) {
      const resolved = posix.normalize(posix.join(posix.dirname(p), spec));
      if (resolved.startsWith("..")) { escapes.push(`${p}:${line} ⇒ ${spec}（越出包根）`); continue; }
      if (!P.has(resolved)) gaps.push(`${p}:${line} ⇒ ${spec}（解析 = ${resolved}，不在 pack 集）`);
    }
    if (dynamicNonLiteral > 0) warnings.push(`${p} —— 非字面动态 import ×${dynamicNonLiteral}（不入闸）`);
  }

  // ② 根 .mjs 集 = 源树根集（dev 根档规约除外——双侧同剔）
  const diskRootsAll = readdirSync(pkgDir).filter((f) => f.endsWith(".mjs") && statSync(join(pkgDir, f)).isFile()).sort();
  const devRoots = diskRootsAll.filter((f) => DEV_ROOT.test(f));
  const diskRoots = diskRootsAll.filter((f) => !DEV_ROOT.test(f));
  const packRoots = packPaths.filter((p) => p.endsWith(".mjs") && !p.includes("/") && !DEV_ROOT.test(p)).sort();
  const diskSet = new Set(diskRoots);
  const packSet = new Set(packRoots);
  const rootMissing = diskRoots.filter((f) => !packSet.has(f));
  const rootExtra = packRoots.filter((f) => !diskSet.has(f));
  const rootOk = rootMissing.length === 0 && rootExtra.length === 0;

  // ③ 读数行 + 明细
  const okBase = gaps.length === 0 && escapes.length === 0 && rootOk;
  console.log(`读数 ${local.name}@${local.version} ∥ pack 件 ${packPaths.length} ∥ 扫档 ${scanned} ∥ import ${importCount}（相对 ${relCount}）∥ 缺口 ${gaps.length} ∥ 越界 ${escapes.length} ∥ 告警 ${warnings.length} ∥ 根集 ${packRoots.length}/${diskRoots.length}${devRoots.length ? ` ∥ dev 根档 ${devRoots.length}（不入包规约）` : ""}`);
  for (const g of gaps.slice(0, 50)) console.log(`  缺口 ${g}`);
  if (gaps.length > 50) console.log(`  …缺口余 ${gaps.length - 50} 条`);
  for (const e of escapes.slice(0, 50)) console.log(`  越界 ${e}`);
  for (const w of warnings.slice(0, 20)) console.log(`  告警 ${w}`);
  if (warnings.length > 20) console.log(`  …告警余 ${warnings.length - 20} 条`);
  if (!rootOk) {
    for (const f of rootMissing.slice(0, 20)) console.log(`  根集缺 ${f}（源树有 ∥ pack 无）`);
    for (const f of rootExtra.slice(0, 20)) console.log(`  根集多 ${f}（pack 有 ∥ 源树无）`);
  }

  if (!useRegistry) {
    console.log(okBase ? "OK(check-pack): 闭包缺口 0 ∥ 越界 0 ∥ 根集相等" : "FAIL(check-pack): 见上（缺口 ∥ 越界 ∥ 根集）");
    process.exit(okBase ? 0 : 1);
  }

  // ④ registry 复验式（--registry）
  const ver = registryVerArg ?? pkgJson.version;
  const spec = `${pkgJson.name}@${ver}`;
  let remote;
  let remoteIntegrity = null;
  try {
    const tmp = mkdtempSync(join(tmpdir(), "check-pack-"));
    try {
      remote = JSON.parse(execSync(`npm pack ${spec} --dry-run --json`, { cwd: tmp, encoding: "utf8", maxBuffer: 128 * 1024 * 1024 }))[0];
      remoteIntegrity = execSync(`npm view ${spec} dist.integrity`, { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 }).trim();
    } finally { rmSync(tmp, { recursive: true, force: true }); }
  } catch (err) {
    console.log(`FAIL(check-pack --registry): ${spec} 取件失败 —— ${String(err.message).split("\n")[0]}`);
    process.exit(2);
  }
  const remotePaths = remote.files.map((f) => f.path);
  const { localOnly, registryOnly } = diffPaths(packPaths, remotePaths);
  const integrityEqual = local.integrity === remoteIntegrity;
  const setsEqual = localOnly.length === 0 && registryOnly.length === 0;
  console.log(`读数 ${spec} ∥ 本地 integrity ${integrityEqual ? "=" : "≠"} registry dist.integrity ∥ 路径集 ${setsEqual ? "=" : "≠"}（本地 ${packPaths.length} ∥ registry ${remotePaths.length}）`);
  if (!integrityEqual) console.log(`  本地 ${local.integrity}\n  registry ${remoteIntegrity}`);
  for (const p of localOnly.slice(0, 50)) console.log(`  本地独有 ${p}`);
  if (localOnly.length > 50) console.log(`  …本地独有余 ${localOnly.length - 50} 条`);
  for (const p of registryOnly.slice(0, 50)) console.log(`  registry 独有 ${p}`);
  if (registryOnly.length > 50) console.log(`  …registry 独有余 ${registryOnly.length - 50} 条`);
  const okReg = integrityEqual && setsEqual;
  console.log(okReg ? "OK(check-pack --registry): 内容面相等（发布窗内判据）" : "FAIL(check-pack --registry): 内容面不等（窗外 = 预期漂移读数 ∥ 窗内 = 红）");
  process.exit(okReg ? 0 : 1);
}

if (process.argv[1] !== undefined && fileURLToPath(import.meta.url) === resolve(process.argv[1])) main();
