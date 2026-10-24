/**
 * quota.mjs — 主机侧件①：磁盘限额（sandbox/EXECUTION.md §4 ∥ KD-SV-74/163/196…200——项目配额优先 ∥ loopback 备选 ∥ 皆不可 ⇒ 建盒停）。
 *
 * 机制（探明 ⇒ 三径择一 ⇒ 读回核）：探明工作区根的文件系统与挂载选项 ⇒
 *   ① xfs（`pquota`）⇒ `xfs_quota` 项目配额（项目 id = `100000 + ws_id`——`project -s -p` + `limit -p bhard=<diskMb>m`）；
 *   ② ext4（`prjquota` 挂载）⇒ 项目标记分治（目录 = `chattr -p <id> +P` ∥ 文件 = `chattr -p <id>`——`+P` 只对目录有效） + `setquota -P`；
 *   ③ 前两径皆不可 ⇒ **loopback**（镜像文件 + `mkfs.ext4` + 挂载到工作区路径 + chown 1000:1000——备选；落法细节以真机探明为准）；
 *   ④ 三者皆不可 ⇒ **抛（建盒停）**——人话 + 处置句（节点需 xfs/ext4 项目配额或 loop 设备）。
 * 就位判据（KD-SV-196）：判「挂载身份（fs UUID）+ 能力（`project` 特性）」，非「是否挂载点」——`classifyLoopbackMount` 逐序判：
 *   未挂在工作区路径 ∥ 外来挂载（源非 `/dev/loop<n>`）∥ 盘上镜像缺失 ∥ 镜像特性可读且不含 `project` ∥ 两侧 UUID 皆可读且不等 ⇒ 非 `ready`。
 *   **安全性质**：`stale` 只在正面判明时成立——fs 读数不可得 ⇒ `ready`（零动，不得触发破坏性重建）。
 * 自愈（KD-SV-197）：非 `ready` ⇒ 卸（在挂才卸；detach 限本工作区 loop 归属）⇒ 镜像可用（具 `project`）⇒ **只重接** ∥ 镜像缺失 ∥ 正面缺 `project` ⇒ 重建。
 * 降级腿（KD-SV-198）：`ext4`+`prjquota` 径的项目标记步（`chattr`）失败 ⇒ 降 loopback 径一次（判据 = 步标签，非错误文本）；再失败 ⇒ 停。
 * 留痕（KD-SV-200）：判据 = **是否抹掉既有内容**——`mkfs` 抹掉既有镜像内容 ⇒ `recovery = "rebuild"`（裁决 `absent` ∥ `stale` 皆然）；`null` 径 = 无既有内容被抹：`absent` ∧ 重建前镜像不在（首建——无内容可抹）∥ `absent` ∧ 镜像在场且具 `project`（只挂载既有镜像，零 `mkfs`）∥ `ready`（健康径）。由返回值携；重建/重接后下游失败 ⇒ 由错误携（`err.recovery`）。
 * 销毁径卸除件（KD-SV-199）：`releaseLoopbackVolume`——卸挂载（未挂 ⇒ 零动作、不抛）+ detach 本工作区 loop（back-file 归属）；失败 ⇒ 抛。
 * 读回核：应用后读回配额读数（xfs = `report -p -b` + `xfs_info` bsize；ext4 = `repquota -P` 千字节块）；读数不符 ⇒ 抛（同停）。
 * 幂等：重复应用同结果（就绪 ⇒ 零动；project 已在 ⇒ 改限）；应用失败 ⇒ 抛（步名 + 原文；无部分成功即报）。
 * 执行面 = 注入 `exec(command, { label })`（实现 = `box.mjs` `hostExec`——SSH 逐条；假件 = 测试）。
 */
/** 项目配额 id 基址（§4——`100000 + ws_id`）。 */
export const PROJECT_ID_BASE = 100000

/** loopback 镜像文件额外余量（MiB——文件系统元数据；备径参数，非配额本体）。 */
export const LOOP_IMAGE_SLACK_MB = 64

/** loop 设备名形（`/dev/loop<n>`——自愈与卸除件只对外来源为 loop 者 detach）。 */
const LOOP_DEVICE_RE = /^\/dev\/loop\d+$/

/** ext4 项目标记步标签（单一源——降级腿守卫按步标签判，与 `applyExt4` 同句）。 */
const EXT4_PROJECT_STEP = "ext4 项目标记"

/** 项目 id（工作区 id ⇒ 主机侧项目号）。 */
export function projectIdOf(workspaceId) {
  return PROJECT_ID_BASE + Number(workspaceId)
}

/** `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T <path>` 读数解析（出 = `{ mount, source, fstype, options }`——旗形逐位；不成形 ⇒ 抛）。 */
export function parseFindmnt(text) {
  const line = String(text ?? "").trim().split("\n").map((item) => item.trim()).filter((item) => item !== "").pop() ?? ""
  const parts = line.split(/\s+/)
  if (parts.length < 3) throw new Error(`挂载读数不可解析：${JSON.stringify(String(text ?? "").slice(0, 200))}`)
  return { mount: parts[0], source: parts[1], fstype: parts[2], options: (parts[3] ?? "").split(",").filter((item) => item !== "") }
}

/** `losetup -a -O NAME,BACK-FILE -n` 读数解析（出 = `[{ name, backFile }]`；空行 ∥ 不成形行跳过——真机形 2026-10-16 核过）。 */
export function parseLoopdevices(text) {
  const rows = []
  for (const raw of String(text ?? "").split("\n")) {
    const line = raw.trim()
    if (line === "") continue
    const split = line.match(/^(\S+)\s+(.+)$/)
    if (split === null) continue
    rows.push({ name: split[1], backFile: split[2].trim() })
  }
  return rows
}

/** 读数可用（非空白字符串；其余 = 不可得）。 */
function readable(value) {
  return typeof value === "string" && value.trim() !== ""
}

/** 镜像 fs 特性含 `project`（特性串 = 空白分隔词表；不可得 ⇒ false）。 */
function hasProjectFeature(features) {
  return readable(features) && String(features).split(/\s+/).includes("project")
}

/**
 * loopback 就位判据（KD-SV-196——纯函；逐序判，次序即判序）：
 *   ① 未挂在工作区路径上 ⇒ `absent`；② 挂载源非 `/dev/loop<n>`（外来挂载）⇒ `stale`；③ 盘上镜像不在（旧 inode 挂载）⇒ `stale`；
 *   ④ 镜像特性可读且不含 `project` ⇒ `stale`（`chattr` EOPNOTSUPP 之源）；⑤ 挂载侧与镜像侧 fs UUID 皆可读且不等 ⇒ `stale`；
 *   ⑥ 其余（fs 读数不可得）⇒ `ready`（**零动**——读数不可得不得触发破坏性重建）。
 * 入 = `{ path, mountTarget, source, mountUuid, imageExists, imageUuid, imageFeatures }`（挂载侧 `mountTarget`/`source` 恒可读——探件为严格读）。
 */
export function classifyLoopbackMount({ path, mountTarget = null, source = null, mountUuid = null, imageExists = false, imageUuid = null, imageFeatures = null } = {}) {
  if (String(mountTarget ?? "") !== String(path ?? "")) return "absent"
  if (!LOOP_DEVICE_RE.test(String(source ?? ""))) return "stale"
  if (imageExists !== true) return "stale"
  if (readable(imageFeatures) && !hasProjectFeature(imageFeatures)) return "stale"
  if (readable(mountUuid) && readable(imageUuid) && String(mountUuid) !== String(imageUuid)) return "stale"
  return "ready"
}

/** 块数期望（读回核——单位 = 该文件系统块大小；`diskMb` MiB ⇒ 块数）。 */
export function expectedBlocks(diskMb, blockSize) {
  return Math.ceil((Number(diskMb) * 1024 * 1024) / Number(blockSize))
}

/** 读回核容差（±1 块——配额按块取整）。 */
function withinOneBlock(actual, expected) {
  return Number.isFinite(actual) && Math.abs(actual - expected) <= 1
}

/** 命令尾注（stderr 原文——人话面留诊断；截断 ≤200 字符）。 */
function tail(result) {
  const text = `${String(result?.stderr ?? "")}\n${String(result?.stdout ?? "")}`.trim()
  return text === "" ? "(无输出)" : text.slice(-200)
}

/** 单步执行（非零退出 ⇒ 抛——步名 + 原文；`stepLabel` = 步名（降级腿守卫判据）；传输级失败由 `exec` 自行抛）。 */
async function step(exec, label, command) {
  const result = await exec(command, { label })
  if (result.exitCode !== 0) {
    const error = new Error(`${label}失败（exit=${result.exitCode}）：${tail(result)}`)
    error.stepLabel = label
    throw error
  }
  return result
}

/** `dumpe2fs -h` 读数（fs UUID ∥ 特性；读数不可得 ⇒ 双 null——`stale` 只在正面判明时成立）。 */
async function readFs(exec, target, label) {
  const out = await exec(`dumpe2fs -h ${target} 2>/dev/null`, { label })
  const line = (prefix) => String(out.stdout ?? "").split("\n").map((item) => item.trim()).find((item) => item.startsWith(prefix)) ?? ""
  const value = (prefix) => {
    const hit = line(prefix)
    const text = hit === "" ? "" : hit.slice(hit.indexOf(":") + 1).trim()
    return readable(text) ? text : null
  }
  return { uuid: value("Filesystem UUID:"), features: value("Filesystem features:") }
}

/** loopback 就位探（只读读件——KD-SV-196 读件表；挂载侧 `findmnt` 为严格读 ⇒ 出参恒可读）。 */
async function probeLoopback(exec, path) {
  const image = `${path}.loop.img`
  const mountedOut = await exec(`mountpoint -q ${path} && echo mounted || echo bare`, { label: "loopback 就位探" })
  const mounted = String(mountedOut.stdout ?? "").trim() === "mounted"
  const read = await step(exec, "loopback 挂载读数", `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T ${path}`)
  const { mount: mountTarget, source } = parseFindmnt(read.stdout)
  const imageOut = await exec(`test -f ${image} && echo yes || echo no`, { label: "loopback 镜像探" })
  const imageExists = String(imageOut.stdout ?? "").trim() === "yes"
  const imageFs = imageExists ? await readFs(exec, image, "loopback 镜像读数") : { uuid: null, features: null }
  const mountFs = LOOP_DEVICE_RE.test(String(source ?? "")) ? await readFs(exec, source, "loopback 挂载侧读数") : { uuid: null, features: null }
  return {
    mountTarget,
    source,
    mounted,
    imageExists,
    imageUuid: imageFs.uuid,
    imageFeatures: imageFs.features,
    mountUuid: mountFs.uuid,
  }
}

/** 归属判据（KD-3/KD-SV-199）：back-file 剥 ` (deleted)` 尾缀后等于本工作区镜像路径。 */
function backFileOfRow(backFile) {
  return String(backFile ?? "").replace(/\s*\(deleted\)$/, "").trim()
}

/** detach 本工作区 loop（`only` 传设备名 ⇒ 只认该件——自愈；缺省 ⇒ 全部归属件——卸除件）；失败 ⇒ 抛（他人镜像零动）。 */
async function detachOwnedLoops(exec, path, { only = null } = {}) {
  const image = `${path}.loop.img`
  const listed = await step(exec, "loopback 设备读数", `losetup -a -O NAME,BACK-FILE -n`)
  const owned = parseLoopdevices(listed.stdout).filter((row) => backFileOfRow(row.backFile) === image)
  const targets = only === null ? owned : owned.filter((row) => row.name === only)
  for (const row of targets) await step(exec, "loopback 设备释放", `losetup -d ${row.name}`)
  return targets
}

/** xfs 项目配额径（`project -s -p` 建绑 + `limit -p bhard` 设限 + 读回核）。 */
async function applyXfs({ exec, mount, path, projectId, diskMb }) {
  await step(exec, "xfs 项目绑定", `xfs_quota -x -c "project -s -p ${path} ${projectId}" ${mount}`)
  await step(exec, "xfs 限额设置", `xfs_quota -x -c "limit -p bhard=${diskMb}m ${projectId}" ${mount}`)
  const report = await step(exec, "xfs 读回核（report）", `xfs_quota -x -c "report -p -b -n" ${mount}`)
  const info = await step(exec, "xfs 读回核（bsize）", `xfs_info ${mount} 2>/dev/null | tr ' ' '\\n' | grep '^bsize=' | head -n 1`)
  const bsize = Number(String(info.stdout).replace(/[^0-9]/g, ""))
  if (!Number.isFinite(bsize) || bsize <= 0) throw new Error(`xfs 读回核失败：块大小读数不可解析（${String(info.stdout).slice(0, 80)}）`)
  const row = String(report.stdout).split("\n").map((item) => item.trim()).find((item) => item.startsWith(String(projectId)))
  if (!row) throw new Error(`xfs 读回核失败：项目 ${projectId} 不在 report 读数面（配额未生效）`)
  const columns = row.split(/\s+/)
  const hard = Number(columns[3])
  const expected = expectedBlocks(diskMb, bsize)
  if (!withinOneBlock(hard, expected)) throw new Error(`xfs 读回核不符：hard=${columns[3]} 块 ∥ 期望 ≈${expected} 块（bsize=${bsize}；配额未落地）`)
  return { mechanism: "xfs-project", readback: { hardBlocks: hard, blockSize: bsize, expectedBlocks: expected } }
}

/** ext4 项目配额径（项目标记分治（目录＋`+P`／文件只赋号） + `setquota -P` + `repquota` 读回核；loopback 复用本径）。 */
async function applyExt4({ exec, mount, path, projectId, diskMb, mechanism }) {
  // 赋号不得丢——裸 `+P` 只打继承标记、不赋项目号；`+P` 只对目录有效（落文件恒拒 `Operation not supported`——真机实测 2026-10-17）⇒ 目录/文件分治（精确句 = `sandbox/EXECUTION.md` §4）
  // 提权口径（真机实测 2026-10-17）：host 命令面只在**首条命令**前加 `sudo -S`（`box.mjs` `call`）——`&&`／`||` 串联时后继命令落回普通用户
  // ⇒ 文件半句无 root 赋号必 `EPERM`（`Operation not permitted while setting flags`）。故分治两句各自成步；`||` 兜底同理改 try/catch。
  await step(exec, EXT4_PROJECT_STEP, `find ${path} -type d -exec chattr -p ${projectId} +P {} +`)
  await step(exec, EXT4_PROJECT_STEP, `find ${path} -type f -exec chattr -p ${projectId} {} +`)
  const blocks = Number(diskMb) * 1024 // 千字节块（repquota/setquota 单位）
  try {
    await step(exec, "ext4 限额设置", `setquota -P ${projectId} ${blocks} ${blocks} 0 0 ${mount}`)
  } catch {
    await step(exec, "ext4 限额设置", `setquota -P ${projectId} ${blocks} ${blocks} 0 0 ${path}`)
  }
  const report = await step(exec, "ext4 读回核", `repquota -P -n ${mount}`)
  const row = String(report.stdout).split("\n").map((item) => item.trim()).find((item) => item.startsWith(`#${projectId}`))
  if (!row) throw new Error(`ext4 读回核失败：项目 ${projectId} 不在 repquota 读数面（配额未生效）`)
  const hard = Number(row.split(/\s+/)[3])
  if (!withinOneBlock(hard, blocks)) throw new Error(`ext4 读回核不符：hard=${row.split(/\s+/)[3]} 千字节块 ∥ 期望 ${blocks}（配额未落地）`)
  return { mechanism, readback: { hardBlocks: hard, blockSize: 1024, expectedBlocks: blocks } }
}

/**
 * loopback 备径（就位探 ⇒ 判据 ⇒ 非 `ready` ⇒ 卸 + 重接/重建 ⇒ 复用 ext4 项目配额径）。
 * `recovery`（KD-SV-200）：判据 = **是否抹掉既有内容**（`verdict === "stale" || !missing`）——`mkfs` 抹掉既有镜像内容 ⇒ `"rebuild"`（`stale` 两态 ∥ `absent` ∧ 重建前镜像在场）；只重接 ⇒ `"reconnect"`（保盘上镜像内容）；
 * `null` 径 = 无既有内容被抹：`absent` ∧ 重建前镜像不在（首建——无内容可抹）∥ `absent` ∧ 镜像在场且具 `project`（只挂载既有镜像，零 `mkfs`）∥ `ready`（健康径——零痕）。**第三态**（镜像在场 ∧ 特性读数不可得 ∧ 判据②/⑤ 判 `stale`）⇒ **只重接**——
 * 读数不可得**不得**触发破坏性重建（KD-SV-196 安全性质）；镜像若确缺 `project` ⇒ 下游 ext4 项目标记步失败原样上抛（可见，不静默抹盘）。
 * 留痕绑**物理动作完成点**：`mkfs` 成 ⇒ `"rebuild"`、重接挂成 ⇒ `"reconnect"`——其后任一步（挂载/属主/ext4 径/读回核）失败 ⇒ 挂 `err.recovery`（重建不因后续失败丢痕）。
 */
async function applyLoopback({ exec, path, projectId, diskMb }) {
  const image = `${path}.loop.img`
  const probe = await probeLoopback(exec, path)
  const verdict = classifyLoopbackMount({ path, ...probe })
  let recovery = null
  if (verdict !== "ready") {
    if (probe.mounted) await step(exec, "loopback 卸挂载", `umount ${path}`) // 在挂才卸
    if (LOOP_DEVICE_RE.test(String(probe.source ?? ""))) await detachOwnedLoops(exec, path, { only: probe.source }) // 外来挂载 ⇒ 零 detach
    // 重建限定两态（KD-SV-197/KD-2）：镜像缺失 ∥ 正面缺 `project`；其余（含「特性读数不可得」）⇒ 只重接（不得以读不到触发抹盘）
    const missing = probe.imageExists !== true
    const lackingProject = readable(probe.imageFeatures) && !hasProjectFeature(probe.imageFeatures)
    if (missing || lackingProject) {
      const imageSize = `${Number(diskMb) + LOOP_IMAGE_SLACK_MB}M`
      try {
        await step(exec, "loopback 镜像创建", `truncate -s ${imageSize} ${image}`)
      } catch {
        await step(exec, "loopback 镜像创建", `fallocate -l ${imageSize} ${image}`)
      }
      await step(exec, "loopback 格式化", `mkfs.ext4 -q -O project,quota -F ${image}`)
      if (verdict === "stale" || !missing) recovery = "rebuild" // 抹掉既有内容 ⇒ 留痕（KD-SV-200：`stale` 两态 ∥ `absent` ∧ 重建前镜像在场；`null` 径 = 无抹：`absent` ∧ 重建前镜像不在（首建）∥ `absent` ∧ 镜像在场且具 `project`（只挂载、零 `mkfs`）∥ `ready`）
    }
  }
  try {
    if (verdict !== "ready") {
      await step(exec, "loopback 挂载", `mount -o loop,prjquota ${image} ${path}`)
      if (recovery === null && verdict === "stale") recovery = "reconnect" // 重接完成 ⇒ 留痕
      await step(exec, "loopback 属主", `chown 1000:1000 ${path}`) // 新 fs 根 = root:root——挂载盖掉①的 chown（盒以 uid 1000 跑）
    }
    const applied = await applyExt4({ exec, mount: path, path, projectId, diskMb, mechanism: "loopback" })
    return { ...applied, recovery }
  } catch (e) {
    if (recovery !== null && e !== null && typeof e === "object") e.recovery = recovery
    throw e
  }
}

/** 降级腿（KD-SV-198——守卫 = 仅 `ext4-project` 径的该次调用降；降级后 loopback 径再失败 ⇒ 停，零第二次降级）。
 *  披露：降级落 loopback ⇒ 新 fs 盖住工作区路径 ⇒ 原目录内容从盒视角不可达。 */
async function demoteToLoopback({ exec, path, projectId, diskMb }) {
  try {
    const applied = await applyLoopback({ exec, path, projectId, diskMb })
    return { ...applied, recovery: "demote" }
  } catch (e) {
    if (e !== null && typeof e === "object") e.recovery = "demote"
    throw e
  }
}

/**
 * 配额就位（建盒链 ②——`sandbox/EXECUTION.md` §4）：探明 ⇒ 三径择一 ⇒ 读回核；皆不可 ⇒ 抛（建盒停）。
 * 入 = `{ exec, workspaceId, path, diskMb }`（`exec` = 注入执行器——SSH 逐条）；出 = `{ mechanism, projectId, mount, readback, recovery }`。
 */
export async function applyDiskQuota({ exec, workspaceId, path, diskMb }) {
  if (typeof path !== "string" || path.trim() === "") throw new Error("配额就位缺工作区路径（path）")
  const size = Number(diskMb)
  if (!Number.isInteger(size) || size <= 0) throw new Error(`磁盘配额非法（diskMb = ${String(diskMb)}）`)
  const projectId = projectIdOf(workspaceId)
  const probe = await step(exec, "文件系统探明", `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T ${path}`)
  const { mount, fstype, options } = parseFindmnt(probe.stdout)
  if (fstype === "xfs" && options.includes("pquota")) {
    const applied = await applyXfs({ exec, mount, path, projectId, diskMb: size })
    return { projectId, mount, ...applied, recovery: null }
  }
  if (fstype === "ext4" && options.includes("prjquota")) {
    try {
      const applied = await applyExt4({ exec, mount, path, projectId, diskMb: size, mechanism: "ext4-project" })
      return { projectId, mount, ...applied, recovery: null }
    } catch (e) {
      if (e?.stepLabel !== EXT4_PROJECT_STEP) throw e // 判据 = 步标签（非错误文本——locale 不稳）
      const applied = await demoteToLoopback({ exec, path, projectId, diskMb: size })
      return { projectId, mount, ...applied }
    }
  }
  const applied = await applyLoopback({ exec, path, projectId, diskMb: size })
  return { projectId, mount, ...applied }
}

/**
 * 销毁径卸除件（KD-SV-199——`box.mjs` 销毁卷清理步调用）：① 在挂则 `umount`（**未挂 ⇒ 零动作、不抛**——xfs/ext4 径常态）
 * ② detach 本工作区 loop（归属判据 = back-file 剥 ` (deleted)` 等于 `<path>.loop.img`——他工作区 ∥ 外来挂载零 detach）；
 * 失败 ⇒ 抛（停 + 行留 + 重试续链）。目录与镜像的删除 = 调用侧同口径 fail-closed。
 * 入 = `{ exec, path }`；出 = `{ unloaded, detached }`（`detached` = 已释放的设备名表）。
 */
export async function releaseLoopbackVolume({ exec, path }) {
  const mountedOut = await exec(`mountpoint -q ${path} && echo mounted || echo bare`, { label: "loopback 卷清理探" })
  let unloaded = false
  if (String(mountedOut.stdout ?? "").trim() === "mounted") {
    await step(exec, "loopback 卷卸载", `umount ${path}`)
    unloaded = true
  }
  const released = await detachOwnedLoops(exec, path)
  return { unloaded, detached: released.map((row) => row.name) }
}
