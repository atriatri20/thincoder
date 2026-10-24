/**
 * bootstrap.mjs — 盒壳启动引导（box-shell-update 批 · `sandbox/EXECUTION.md` §8 壳更新面块）
 *
 * 引导序（§8）：① 自版本 = 树哈希（覆盖集 = 源树逐件——排除 `node_modules/**` ∥ `state.json` ∥
 * `git-credential-thincoder` 登记链接）⇒ ② 取 manifest（超时 10s——不可达/形非法 ⇒ 缓存副本 ∥ 内建）⇒
 * ③ 目标 == 自版本 ⇒ 本进程就地跑（零取件 ∥ 零换执行——链终止腿）⇒ ④ 目标在缓存槽（`state.json`
 * 一致 ∧ 复用前复验过）⇒ 换执行 ⇒ ⑤ 取工件（超时 30s）⇒ 解包暂存 ⇒ 逐件重算树哈希 == 版本 ⇒
 * 就位（`<HOME>/.tc-shell/<版本>/`：落件 + 材料化 + `state.json`）⇒ 换执行。
 *
 * 回退层序（不得 brick）：取件副本（缓存槽）⇒ 内建壳（镜像恒在 = 地板）；三失败各一步（§8）——
 * 取件不可达 ⇒ 顶上（本启动零重试）∥ 校验不过 ⇒ 丢弃暂存（缓存零变）⇒ 顶上 ∥ 换执行崩 ⇒ 回退内建
 * 一次（「跳过引导」env 旗标——终态、零递归）+ 该槽失效（清）。
 *
 * **不变式**：槽内副本（材料化后）重算树哈希 == 槽名版本 == manifest 版本——承接进程 ③ 腿命中 ⇒
 * 零自旋（启动链长 ≤1）。材料化三步皆落覆盖集外（树哈希稳定性要件）。
 *
 * 版本行 = **承接进程**启动即落一行（`versionLine`——`index.mjs` `main()` 先于核装载打印）；引导父
 * 进程不落行；`源` 判定 = 引导传递的本次落点（`TC_SHELL_SOURCE`：取件 ∥ 缓存 ∥ 内建）。
 *
 * 树哈希规则 = 本档**单源**（打包脚本 import 同一件——零漂移）：
 * `sha256(逐件「相对路径 \0 sha256(件字节) \n」按名序串接)`。
 *
 * DI 面（同壳族）：`env` ∥ `fetchImpl` ∥ `spawnImpl` ∥ `fs`（同步面）∥ `log` ∥ `shellDir` ∥
 * `rootDir` ∥ `nodeBin` ∥ `corePath`——单元测试以假件驱动（假 fetch / 假 spawn / 假 fs 根）。
 */
import { spawn } from "node:child_process"
import { createHash } from "node:crypto"
import * as nodeFs from "node:fs"
import { constants as osConstants } from "node:os"
import { delimiter, dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

/** 壳树根 = 本档所在目录（内建 = `/opt/thincoder/app/shell`；取件副本 = 槽目录）。 */
export const SHELL_DIR = dirname(fileURLToPath(import.meta.url))
/** 引导父进程 → 承接进程的落点传递（`fetch` ∥ `cache`；缺省/未知 ⇒ `builtin`）。 */
export const SOURCE_ENV = "TC_SHELL_SOURCE"
/** 跳过引导（回退内建径——终态、零递归）。 */
export const SKIP_ENV = "TC_SHELL_SKIP_BOOTSTRAP"
/** 核件位传递（槽内壳再取件时仍链回**镜像**件位——零第二核源；本进程解析后向子进程透传）。 */
export const CORE_ENV = "TC_SHELL_CORE"
/** 内建壳树位传递（崩回退目标恒为**镜像内建**——槽内壳发起的换执行崩亦同；本进程解析后向子进程透传）。 */
export const BUILTIN_ENV = "TC_SHELL_BUILTIN"
/** 槽内状态件（覆盖集外——材料化产物）。 */
export const STATE_FILE = "state.json"
/** git 凭据助手登记名（源树无此名——槽内登记链接；覆盖集外）。 */
export const HELPER_NAME = "git-credential-thincoder"

const SOURCE_LABELS = Object.freeze({ fetch: "取件", cache: "缓存", builtin: "内建" })
const ROOT_EXCLUDES = new Set([STATE_FILE, HELPER_NAME])
const NODE_MODULES = "node_modules"
const VERSION_RE = /^[0-9a-f]{64}$/
const MANIFEST_TIMEOUT_MS = 10_000
const ARTIFACT_TIMEOUT_MS = 30_000
const BLOCK = 512
/** 暂存目录名（解包 + 校验 + 材料化 → 原子改名入槽）。 */
const STAGING_NAME = "staging"

/** 覆盖集判据（§8：材料化产物在覆盖集外）：`node_modules/**` ∥ 根级 `state.json` ∥ 登记链接。 */
function isExcluded(rel) {
  if (ROOT_EXCLUDES.has(rel)) return true
  return rel === NODE_MODULES || rel.startsWith(`${NODE_MODULES}/`)
}

/** 覆盖集逐件（相对路径，`/` 分隔，名序）——目录/符号链接不入集。 */
export function listTree(root, { fs: fsImpl = nodeFs } = {}) {
  const files = []
  const walk = (rel) => {
    let names
    try {
      names = fsImpl.readdirSync(rel === "" ? root : join(root, rel))
    } catch {
      return
    }
    for (const name of names) {
      const childRel = rel === "" ? name : `${rel}/${name}`
      if (isExcluded(childRel)) continue
      let stat
      try {
        stat = fsImpl.lstatSync(join(root, childRel))
      } catch {
        continue
      }
      if (stat.isDirectory()) walk(childRel)
      else if (stat.isFile()) files.push(childRel)
    }
  }
  walk("")
  return files.sort()
}

/** 树哈希（规则单源——打包脚本与盒侧同一件）：逐件按名序串接「相对路径 \0 sha256(件字节) \n」。 */
export function hashEntries(entries) {
  const digest = createHash("sha256")
  const sorted = [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  for (const entry of sorted) {
    if (isExcluded(entry.path)) continue
    digest.update(`${entry.path}\0`)
    digest.update(createHash("sha256").update(entry.data).digest("hex"))
    digest.update("\n")
  }
  return digest.digest("hex")
}

/** 目录树哈希（覆盖集口径）。 */
export function treeHash(root, { fs: fsImpl = nodeFs } = {}) {
  return hashEntries(listTree(root, { fs: fsImpl }).map((rel) => ({ path: rel, data: fsImpl.readFileSync(join(root, rel)) })))
}

/** ustar 头（普通文件；件名 ≤100 字节——壳树件名远短于此）。 */
function tarHeader(path, size) {
  if (Buffer.byteLength(path) > 100) throw new Error(`tar: 件名超 100 字节（${path}）`)
  const buf = Buffer.alloc(BLOCK)
  const put = (offset, length, text) => buf.write(text, offset, length, "utf8")
  put(0, 100, path)
  put(100, 8, "0000644\0")
  put(108, 8, "0000000\0")
  put(116, 8, "0000000\0")
  put(124, 12, `${size.toString(8).padStart(11, "0")}\0`)
  put(136, 12, "00000000000\0")
  buf[156] = 0x30 // typeflag `0` = 普通文件
  put(257, 6, "ustar\0")
  put(263, 2, "00")
  put(148, 8, "        ")
  let sum = 0
  for (const byte of buf) sum += byte
  put(148, 8, `${sum.toString(8).padStart(6, "0")}\0 `)
  return buf
}

/** tar 写（不压缩——§8 件名 = 版本全哈希；落件序 = 名序）。 */
export function packTar(entries) {
  const blocks = []
  const sorted = [...entries].sort((a, b) => (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))
  for (const entry of sorted) {
    const data = Buffer.isBuffer(entry.data) ? entry.data : Buffer.from(entry.data)
    blocks.push(tarHeader(entry.path, data.length), data)
    const pad = (BLOCK - (data.length % BLOCK)) % BLOCK
    if (pad > 0) blocks.push(Buffer.alloc(pad))
  }
  blocks.push(Buffer.alloc(BLOCK * 2))
  return Buffer.concat(blocks)
}

function cstr(buf, offset, length) {
  const slice = buf.subarray(offset, offset + length)
  const end = slice.indexOf(0)
  return slice.subarray(0, end === -1 ? slice.length : end).toString("utf8")
}

/** tar 读（只收普通文件——目录/其他类型跳过；尺寸/截断非法 ⇒ 抛）。 */
export function readTar(buffer) {
  const entries = []
  let offset = 0
  while (offset + BLOCK <= buffer.length) {
    const header = buffer.subarray(offset, offset + BLOCK)
    if (header.every((byte) => byte === 0)) break
    const name = cstr(header, 0, 100)
    const prefix = cstr(header, 345, 155)
    const size = Number.parseInt(cstr(header, 124, 12).trim() || "0", 8)
    if (!Number.isFinite(size) || size < 0) throw new Error("tar: 尺寸字段非法")
    const type = String.fromCharCode(header[156] ?? 0x30)
    offset += BLOCK
    const body = buffer.subarray(offset, offset + size)
    if (body.length !== size) throw new Error("tar: 数据截断")
    offset += Math.ceil(size / BLOCK) * BLOCK
    if (type === "0" || type === "\0") entries.push({ path: prefix === "" ? name : `${prefix}/${name}`, data: Buffer.from(body) })
  }
  return entries
}

/** 件名围栅（绝对路径 ∥ `..` 逃逸 ∥ 反斜杠 ∥ NUL ⇒ 非法——工件不得写出槽外）。 */
function safeRelative(path) {
  const rel = String(path ?? "")
  if (rel === "" || rel.startsWith("/") || rel.includes("\\") || rel.includes("\0")) return null
  const segments = rel.split("/")
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) return null
  return segments.join("/")
}

function writeTree(fsImpl, root, entries) {
  for (const entry of entries) {
    const rel = safeRelative(entry.path)
    if (rel === null) throw new Error(`tar: 件名非法（${entry.path}）`)
    if (isExcluded(rel)) continue // 覆盖集外件不落盘（工件只承载源树逐件）
    const target = join(root, rel)
    fsImpl.mkdirSync(dirname(target), { recursive: true })
    fsImpl.writeFileSync(target, entry.data)
  }
}

/** 材料化三步（皆落覆盖集外——树哈希稳定性要件）：登记链接 + 执行位 ∥ 核链回镜像件位 ∥ 状态件。 */
function materialize(fsImpl, dir, version, corePath) {
  fsImpl.chmodSync(join(dir, "git-cred.mjs"), 0o755)
  fsImpl.symlinkSync("git-cred.mjs", join(dir, HELPER_NAME))
  const coreDir = join(dir, NODE_MODULES, "@thincoder")
  fsImpl.mkdirSync(coreDir, { recursive: true })
  fsImpl.symlinkSync(corePath, join(coreDir, "core"))
  fsImpl.writeFileSync(join(dir, STATE_FILE), `${JSON.stringify({ version, materialized: true })}\n`)
}

function dropSlot(fsImpl, dir) {
  try {
    fsImpl.rmSync(dir, { recursive: true, force: true })
  } catch {
    /* 清理尽力——残留槽下次复验不过即清 */
  }
}

/** `state.json` 一致 = 可解析 ∧ `version` == 槽名版本（多键忽略）。 */
function slotVersion(fsImpl, dir) {
  try {
    const state = JSON.parse(String(fsImpl.readFileSync(join(dir, STATE_FILE))))
    return typeof state?.version === "string" ? state.version : null
  } catch {
    return null
  }
}

/** 复用前复验 = 一致 ∧ 重算树哈希（覆盖集口径）== 槽名版本——复验不过 ⇒ 槽失效（清、不复用）。 */
function validSlot(fsImpl, root, version) {
  const dir = join(root, version)
  if (!fsImpl.existsSync(dir)) return false
  let hash = null
  if (slotVersion(fsImpl, dir) === version) {
    try {
      hash = treeHash(dir, { fs: fsImpl })
    } catch {
      hash = null
    }
  }
  if (hash === version) return true
  dropSlot(fsImpl, dir)
  return false
}

function slotsNewestFirst(fsImpl, root) {
  let names
  try {
    names = fsImpl.readdirSync(root)
  } catch {
    return []
  }
  return names
    .filter((name) => VERSION_RE.test(name))
    .map((name) => {
      let at = 0
      try {
        at = fsImpl.lstatSync(join(root, name)).mtimeMs ?? 0
      } catch {
        /* 读数不可得 ⇒ 序尾 */
      }
      return { name, at }
    })
    .sort((a, b) => b.at - a.at)
    .map((slot) => slot.name)
}

function latestValidSlot(fsImpl, root) {
  for (const version of slotsNewestFirst(fsImpl, root)) {
    if (validSlot(fsImpl, root, version)) return version
  }
  return null
}

async function fetchManifest(base, fetchImpl) {
  if (base === "") return null
  try {
    const res = await fetchImpl(`${base}/box-shell/manifest.json`, { signal: AbortSignal.timeout(MANIFEST_TIMEOUT_MS) })
    if (!res?.ok) return null
    const data = await res.json()
    const version = String(data?.version ?? "")
    return VERSION_RE.test(version) ? version : null // 形非法 = 不可达类
  } catch {
    return null
  }
}

async function fetchArtifact(base, version, fetchImpl) {
  if (base === "") return null
  try {
    const res = await fetchImpl(`${base}/box-shell/${version}.tar`, { signal: AbortSignal.timeout(ARTIFACT_TIMEOUT_MS) })
    if (!res?.ok) return null
    const bytes = Buffer.from(await res.arrayBuffer())
    return bytes.length > 0 ? bytes : null
  } catch {
    return null
  }
}

function childExitCode({ code, signal }) {
  if (typeof code === "number") return code
  if (signal) return 128 + (osConstants.signals?.[signal] ?? 0)
  return 1
}

/** 换执行子进程：stdio ∥ env 透传 ∥ SIGTERM/SIGINT 转发（收终止信号记旗标——崩回退判据）。 */
function runChild({ bin, entry, env, spawnImpl }) {
  return new Promise((done) => {
    let child = null
    let terminated = false
    let settled = false
    const forward = (signal) => {
      terminated = true
      try {
        child.kill(signal)
      } catch {
        /* 子已退出 */
      }
    }
    const onTerm = () => forward("SIGTERM")
    const onInt = () => forward("SIGINT")
    const finish = (code, signal) => {
      if (settled) return
      settled = true
      process.removeListener("SIGTERM", onTerm)
      process.removeListener("SIGINT", onInt)
      done({ code, signal, terminated })
    }
    try {
      child = spawnImpl(bin, [entry], { stdio: "inherit", env, cwd: process.cwd() })
    } catch {
      done({ code: -1, signal: null, terminated: false })
      return
    }
    process.on("SIGTERM", onTerm)
    process.on("SIGINT", onInt)
    child.on("error", () => finish(-1, null))
    child.on("close", (code, signal) => finish(code, signal))
  })
}

/** 版本行（承接进程落——先于核装载；`源` = 引导传递的本次落点）。 */
export function versionLine({ version, source }) {
  const key = String(source ?? "")
  const label = Object.hasOwn(SOURCE_LABELS, key) ? SOURCE_LABELS[key] : SOURCE_LABELS.builtin
  return `[shell] 壳版本 ${String(version ?? "").slice(0, 12)}（源=${label}）`
}

function sourceOf(env) {
  const raw = String(env?.[SOURCE_ENV] ?? "")
  return Object.hasOwn(SOURCE_LABELS, raw) ? raw : "builtin"
}

/** 引导主序（返回 `{ mode: "run", … }` = 本进程就地跑；`{ mode: "parent", exitCode }` = 已换执行并回传）。 */
export async function runBootstrap({
  env = process.env,
  shellDir = SHELL_DIR,
  rootDir = null,
  fetchImpl = (url, init) => globalThis.fetch(url, init),
  spawnImpl = spawn,
  fs: fsImpl = nodeFs,
  log = console,
  nodeBin = process.execPath,
  corePath = null,
} = {}) {
  const root = rootDir ?? join(env.HOME || env.USERPROFILE || ".", ".tc-shell")
  const core = corePath ?? env[CORE_ENV] ?? resolve(shellDir, "..", NODE_MODULES, "@thincoder", "core")
  const builtinDir = env[BUILTIN_ENV] || shellDir
  const passed = sourceOf(env)
  const inPlace = (version, source) => ({ mode: "run", version, hash12: String(version).slice(0, 12), source, sourceLabel: SOURCE_LABELS[source] })

  let selfVersion
  try {
    selfVersion = treeHash(shellDir, { fs: fsImpl })
  } catch (e) {
    log.warn?.(`[shell] 引导：自版本不可得（${e?.message ?? e}）——就地跑内建壳`)
    return inPlace("unknown", "builtin") // 显式占位——版本行保持可解析/可 grep（不落空 hash12）
  }
  if (env[SKIP_ENV]) return inPlace(selfVersion, "builtin") // 回退内建径：终态、零递归

  const reExec = async (slotDir, source) => {
    const childEnv = { ...env, [SOURCE_ENV]: source, [CORE_ENV]: core, [BUILTIN_ENV]: builtinDir, PATH: [slotDir, env.PATH].filter(Boolean).join(delimiter) }
    const result = await runChild({ bin: nodeBin, entry: join(slotDir, "index.mjs"), env: childEnv, spawnImpl })
    if (result.code === 0 || result.terminated) return { mode: "parent", exitCode: childExitCode(result) }
    log.warn?.(`[shell] 引导：换执行子进程非零退出（${result.code ?? result.signal}）——回退内建壳一次`)
    dropSlot(fsImpl, slotDir) // 该槽失效（清）——防下次启动复用坏槽
    const fallback = await runChild({ bin: nodeBin, entry: join(builtinDir, "index.mjs"), env: { ...env, [SKIP_ENV]: "1", [SOURCE_ENV]: "builtin" }, spawnImpl })
    return { mode: "parent", exitCode: childExitCode(fallback) }
  }

  const base = String(env.TC_SERVER_URL ?? "").replace(/\/+$/, "")

  const install = async (version) => {
    const staging = join(root, STAGING_NAME)
    dropSlot(fsImpl, staging)
    try {
      fsImpl.mkdirSync(staging, { recursive: true })
      const bytes = await fetchArtifact(base, version, fetchImpl)
      if (bytes === null) return false
      writeTree(fsImpl, staging, readTar(bytes))
      if (treeHash(staging, { fs: fsImpl }) !== version) return false // ② 校验不过 ⇒ 丢弃暂存（缓存零变）
      materialize(fsImpl, staging, version, core)
      const slotDir = join(root, version)
      dropSlot(fsImpl, slotDir)
      fsImpl.renameSync(staging, slotDir)
      const selfSlot = shellDir.startsWith(`${root}/`) || shellDir.startsWith(`${root}\\`) ? shellDir.slice(root.length + 1).split(/[\\/]/)[0] : null
      for (const name of slotsNewestFirst(fsImpl, root)) {
        if (name !== version && name !== selfSlot) dropSlot(fsImpl, join(root, name)) // 清理留当刻与自跑目录
      }
      return true
    } catch (e) {
      log.warn?.(`[shell] 引导：取件/校验失败（${e?.message ?? e}）——按缓存/内建顶上`)
      return false
    } finally {
      dropSlot(fsImpl, staging)
    }
  }

  const manifest = await fetchManifest(base, fetchImpl)
  if (manifest === selfVersion) return inPlace(selfVersion, passed) // ③ 链终止腿（零取件 ∥ 零换执行）
  if (manifest !== null) {
    if (validSlot(fsImpl, root, manifest)) return reExec(join(root, manifest), "cache") // ④
    if (await install(manifest)) return reExec(join(root, manifest), "fetch") // ⑤
  }
  const cached = latestValidSlot(fsImpl, root)
  if (cached !== null && cached !== selfVersion) return reExec(join(root, cached), "cache")
  return inPlace(selfVersion, passed) // 回退层序末级 = 内建（镜像恒在 = 地板）
}
