#!/usr/bin/env node
/**
 * pack-box-shell.mjs — 壳工件打包（box-shell-update 批 · `sandbox/EXECUTION.md` §8 壳更新面块 · KD-SV-230）
 *
 * 发布侧一件：源树（`deploy/sandbox/member-shell/**`——内建 COPY 的同一源）⇒ 树哈希（版本）⇒ tar ⇒ 落
 * server 静态面 `public/box-shell/`（manifest.json + `<版本>.tar`）。`package.json` `prepack` 挂钩调用。
 *
 * 单源纪律：树哈希规则与覆盖集**不在本档复写**——`import` 盒侧 `bootstrap.mjs` 同一件（零漂移）；
 * 覆盖集 = 源树逐件（排除 `node_modules/**` ∥ `state.json` ∥ `git-credential-thincoder` 登记链接）。
 *
 * 打包自检：写盘后**回读** tar ⇒ 逐件重算树哈希 == 版本（不符 ⇒ 抛——工件与 manifest 不得漂移）。
 * 留 3 件（回退窗）：按 mtime 取新三（新件恒保），余者删。构建产物不进 git（`.gitignore`）。
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import { hashEntries, listTree, packTar, readTar, treeHash } from "./sandbox/member-shell/bootstrap.mjs"

const HERE = dirname(fileURLToPath(import.meta.url))
const SERVER_ROOT = resolve(HERE, "..")
const SOURCE_DIR = join(HERE, "sandbox", "member-shell")
const OUT_DIR = join(SERVER_ROOT, "public", "box-shell")
const KEEP = 3
const ARTIFACT_RE = /^[0-9a-f]{64}\.tar$/

/** 清旧件（留当刻 + 新三——回退窗）。 */
function prune(dir, version) {
  const kept = new Set([`${version}.tar`])
  const files = readdirSync(dir)
    .filter((name) => ARTIFACT_RE.test(name))
    .map((name) => ({ name, at: statSync(join(dir, name)).mtimeMs }))
    .sort((a, b) => b.at - a.at)
  for (const file of files) {
    if (kept.size >= KEEP) break
    kept.add(file.name)
  }
  const removed = []
  for (const file of files) {
    if (kept.has(file.name)) continue
    rmSync(join(dir, file.name), { force: true })
    removed.push(file.name)
  }
  return removed
}

/** 打包一件（返回读数；自检不符 ⇒ 抛）。 */
export function packBoxShell({ source = SOURCE_DIR, out = OUT_DIR, log = console } = {}) {
  const version = treeHash(source)
  const entries = listTree(source).map((rel) => ({ path: rel, data: readFileSync(join(source, rel)) }))
  const tar = packTar(entries)
  mkdirSync(out, { recursive: true })
  const file = join(out, `${version}.tar`)
  writeFileSync(file, tar)

  const back = hashEntries(readTar(readFileSync(file))) // 回读复算（tar 信封不参与——逐件口径同上）
  if (back !== version) {
    rmSync(file, { force: true }) // 自检不过 ⇒ 件不落定（manifest 未写，静态面无「manifest → 未过验件」组合）
    throw new Error(`打包自检失败：回读树哈希 ${back} ≠ 版本 ${version}（工件未落定）`)
  }
  writeFileSync(join(out, "manifest.json"), `${JSON.stringify({ version })}\n`)

  const removed = prune(out, version)
  const result = { version, hash12: version.slice(0, 12), file, entries: entries.length, bytes: tar.length, removed }
  log.info?.(`[box-shell] 打包完成 ${result.hash12}（${result.entries} 件，${result.bytes} 字节${removed.length > 0 ? `；清旧 ${removed.length}` : ""}）⇒ ${file}`)
  return result
}

// 入口判据：`argv[1]` 先经 realpath 解析再比（KD-SV-53 / #1114 已锁形式；同 `git-cred.mjs`）。
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  if (!existsSync(SOURCE_DIR)) throw new Error(`源树不存在：${SOURCE_DIR}`)
  packBoxShell()
}
