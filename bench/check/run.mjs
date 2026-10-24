#!/usr/bin/env node
/**
 * bench/check/run.mjs — 评估工具自身测试代码的统一入口。
 *
 * 用法：`node bench/check/run.mjs`（无参数；cwd 不敏感——路径按本档位置解析）。
 * 清单 = `CHECK_FILES`（15 档显式登记 · 固定顺序）；不靠目录扫描发现——扫描只作启动前反查。
 *
 * 启动前判据（任一失败 ⇒ 点名 + exit 1）：
 * ① 盘上 ⊆ 清单：递归收 `bench/check/` 下全部 `*.check.mjs`，未登记档 ⇒ 拒跑（新增一档必须登记）；
 *    软链目录 ⇒ 检出即失败（递归穿不过，属静默漏收集）。
 * ② 清单 ⊆ 盘上：清单项不在盘 ⇒ 拒跑（启动前双向点名，不依赖子进程对缺失档的报错行为）。
 * ③ 清单为空 ⇒ 拒跑（本目录是评估工具的常驻资产，变空 = 缺陷；不沿用各包 `test/run.mjs` 的空清单绿）。
 *
 * 执行 = 逐档一子进程（`spawnSync` + 单档 60 s 超时；隔离不退化）；
 * 每档 stdout / stderr 逐字回显，汇总行取各档 `bench/check: <P> passed, <F> failed` 的加总。
 * 退出码 0 = 全部档 status 0 且 ΣF = 0；各档自带临时沙箱：零网络、不写 `bench/results/`。
 */

import { existsSync, readdirSync, statSync } from "node:fs"
import { spawnSync } from "node:child_process"
import { dirname, join, relative } from "node:path"
import { fileURLToPath } from "node:url"

const CHECK_DIR = dirname(fileURLToPath(import.meta.url))
const PER_FILE_TIMEOUT_MS = 60000

/** 自检档清单（单源 · 固定顺序 = 设计映射表 1–15）。 */
const CHECK_FILES = [
  "graders.check.mjs",
  "judge.check.mjs",
  "judge-fallback.check.mjs",
  "metrics.check.mjs",
  "preflight.check.mjs",
  "probe-report.check.mjs",
  "probe.check.mjs",
  "recompute.check.mjs",
  "report-present.check.mjs",
  "report-render.check.mjs",
  "roster.check.mjs",
  "suite.check.mjs",
  "timing.check.mjs",
  "toolcall.check.mjs",
  "toolcall-report.check.mjs",
]

console.log("bench/check — 评估工具自身的测试代码（非项目测试体系：不进 CI / 发布门）")

const fail = (lines) => {
  console.error(["bench/check/run.mjs: 启动前判据未通过（拒跑）：", ...lines.map((l) => `  - ${l}`)].join("\n"))
  process.exit(1)
}

if (CHECK_FILES.length === 0) fail(["判据 ③：清单为空（bench/check 是常驻资产，空清单 = 缺陷）"])

/** 递归收盘上文件；软链目录单独列出（不穿、不静默忽略）。 */
function scan(dir) {
  const files = []
  const symlinkDirs = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isSymbolicLink()) {
      if (statSync(full).isDirectory()) symlinkDirs.push(relative(CHECK_DIR, full))
      else files.push(full)
    } else if (entry.isDirectory()) {
      const sub = scan(full)
      files.push(...sub.files)
      symlinkDirs.push(...sub.symlinkDirs)
    } else {
      files.push(full)
    }
  }
  return { files, symlinkDirs }
}

const { files: onDisk, symlinkDirs } = scan(CHECK_DIR)
const onDiskChecks = onDisk.filter((f) => f.endsWith(".check.mjs")).map((f) => relative(CHECK_DIR, f)).sort()
const listed = new Set(CHECK_FILES)

const problems = []
if (symlinkDirs.length > 0) problems.push(`软链目录（递归穿不过 ⇒ 静默漏收集）：${symlinkDirs.join(", ")}`)
const unregistered = onDiskChecks.filter((f) => !listed.has(f))
if (unregistered.length > 0) problems.push(`盘上未登记的 *.check.mjs：${unregistered.join(", ")}`)
const missing = CHECK_FILES.filter((f) => !existsSync(join(CHECK_DIR, f)))
if (missing.length > 0) problems.push(`清单项不在盘：${missing.join(", ")}`)
if (problems.length > 0) fail(problems)

const summaryOf = (stdout) => /^bench\/check: (\d+) passed, (\d+) failed$/m.exec(stdout ?? "")

let totalPassed = 0
let totalFailed = 0
const failedFiles = []
for (const name of CHECK_FILES) {
  const result = spawnSync(process.execPath, [join(CHECK_DIR, name)], { encoding: "utf8", timeout: PER_FILE_TIMEOUT_MS })
  if (result.stdout) process.stdout.write(result.stdout)
  if (result.stderr) process.stderr.write(result.stderr)
  const summary = summaryOf(result.stdout)
  if (result.error?.code === "ETIMEDOUT") failedFiles.push(`${name}（超时 >60 s）`)
  else if (result.status !== 0 || !summary) failedFiles.push(name)
  if (summary) {
    totalPassed += Number(summary[1])
    totalFailed += Number(summary[2])
  }
}

if (failedFiles.length > 0) {
  console.error(`bench/check/run.mjs: 失败档：${failedFiles.join(", ")}`)
  process.exitCode = 1
}
if (totalFailed > 0) process.exitCode = 1
const failedNote = failedFiles.length > 0 ? `, ${failedFiles.length} failed file(s)` : ""
console.log(`bench/check: ${totalPassed} passed, ${totalFailed} failed${failedNote}`)
