/**
 * quota.mjs — 主机侧件①：磁盘限额（sandbox/EXECUTION.md §4 ∥ KD-SV-74/163——项目配额优先 ∥ loopback 备选 ∥ 皆不可 ⇒ 建盒停）。
 *
 * 机制（探明 ⇒ 三径择一 ⇒ 读回核）：探明工作区根的文件系统与挂载选项 ⇒
 *   ① xfs（`pquota`）⇒ `xfs_quota` 项目配额（项目 id = `100000 + ws_id`——`project -s -p` + `limit -p bhard=<diskMb>m`）；
 *   ② ext4（`prjquota` 挂载）⇒ `chattr -R -p <id> +P`（**赋号＋继承同句**） + `setquota -P`；
 *   ③ 前两径皆不可 ⇒ **loopback**（镜像文件 + `mkfs.ext4` + 挂载到工作区路径 + chown 1000:1000——备选；落法细节以真机探明为准）；
 *   ④ 三者皆不可 ⇒ **抛（建盒停）**——人话 + 处置句（节点需 xfs/ext4 项目配额或 loop 设备）。
 * 读回核：应用后读回配额读数（xfs = `report -p -b` + `xfs_info` bsize；ext4 = `repquota -P` 千字节块）；读数不符 ⇒ 抛（同停）。
 * 幂等：重复应用同结果（project 已在 ⇒ 改限）；应用失败 ⇒ 抛（步名 + 原文；无部分成功即报）。
 * 执行面 = 注入 `exec(command, { label })`（实现 = `box.mjs` `hostExec`——SSH 逐条；假件 = 测试）。
 */
/** 项目配额 id 基址（§4——`100000 + ws_id`）。 */
export const PROJECT_ID_BASE = 100000

/** loopback 镜像文件额外余量（MiB——文件系统元数据；备径参数，非配额本体）。 */
export const LOOP_IMAGE_SLACK_MB = 64

/** 项目 id（工作区 id ⇒ 主机侧项目号）。 */
export function projectIdOf(workspaceId) {
  return PROJECT_ID_BASE + Number(workspaceId)
}

/** `findmnt -no TARGET,FSTYPE,OPTIONS -T <path>` 读数解析（出 = `{ mount, fstype, options }`；不成形 ⇒ 抛）。 */
export function parseFindmnt(text) {
  const line = String(text ?? "").trim().split("\n").map((item) => item.trim()).filter((item) => item !== "").pop() ?? ""
  const parts = line.split(/\s+/)
  if (parts.length < 2) throw new Error(`挂载读数不可解析：${JSON.stringify(String(text ?? "").slice(0, 200))}`)
  return { mount: parts[0], fstype: parts[1], options: (parts[2] ?? "").split(",").filter((item) => item !== "") }
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

/** 单步执行（非零退出 ⇒ 抛——步名 + 原文；传输级失败由 `exec` 自行抛）。 */
async function step(exec, label, command) {
  const result = await exec(command, { label })
  if (result.exitCode !== 0) throw new Error(`${label}失败（exit=${result.exitCode}）：${tail(result)}`)
  return result
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

/** ext4 项目配额径（`chattr -R +P` + `setquota -P` + `repquota` 读回核；loopback 复用本径）。 */
async function applyExt4({ exec, mount, path, projectId, diskMb, mechanism }) {
  // 赋号＋继承同句（"chattr -R +P" 裸形恒成功——只打继承标记不赋项目号 ⇒ 赋号句必须直接在场；真机实证 2026-10-14）
  await step(exec, "ext4 项目标记", `chattr -R -p ${projectId} +P ${path}`)
  const blocks = Number(diskMb) * 1024 // 千字节块（repquota/setquota 单位）
  await step(exec, "ext4 限额设置", `setquota -P ${projectId} ${blocks} ${blocks} 0 0 ${mount} 2>/dev/null || setquota -P ${projectId} ${blocks} ${blocks} 0 0 ${path}`)
  const report = await step(exec, "ext4 读回核", `repquota -P -n ${mount}`)
  const row = String(report.stdout).split("\n").map((item) => item.trim()).find((item) => item.startsWith(`#${projectId}`))
  if (!row) throw new Error(`ext4 读回核失败：项目 ${projectId} 不在 repquota 读数面（配额未生效）`)
  const hard = Number(row.split(/\s+/)[3])
  if (!withinOneBlock(hard, blocks)) throw new Error(`ext4 读回核不符：hard=${row.split(/\s+/)[3]} 千字节块 ∥ 期望 ${blocks}（配额未落地）`)
  return { mechanism, readback: { hardBlocks: hard, blockSize: 1024, expectedBlocks: blocks } }
}

/** loopback 备径（镜像文件 + `mkfs.ext4` + 挂载到工作区路径 ⇒ 复用 ext4 项目配额径）。 */
async function applyLoopback({ exec, path, projectId, diskMb }) {
  const image = `${path}.loop.img`
  const mounted = await exec(`mountpoint -q ${path} && echo mounted || echo bare`, { label: "loopback 就位探" })
  if (String(mounted.stdout).trim() !== "mounted") {
    await step(exec, "loopback 镜像创建", `truncate -s ${Number(diskMb) + LOOP_IMAGE_SLACK_MB}M ${image} 2>/dev/null || fallocate -l ${Number(diskMb) + LOOP_IMAGE_SLACK_MB}M ${image}`)
    await step(exec, "loopback 格式化", `mkfs.ext4 -q -O project,quota -F ${image}`)
    await step(exec, "loopback 挂载", `mount -o loop,prjquota ${image} ${path}`)
    await step(exec, "loopback 属主", `chown 1000:1000 ${path}`) // 新 fs 根 = root:root——挂载盖掉①的 chown（盒以 uid 1000 跑）
  }
  return applyExt4({ exec, mount: path, path, projectId, diskMb, mechanism: "loopback" })
}

/**
 * 配额就位（建盒链 ②——`sandbox/EXECUTION.md` §4）：探明 ⇒ 三径择一 ⇒ 读回核；皆不可 ⇒ 抛（建盒停）。
 * 入 = `{ exec, workspaceId, path, diskMb }`（`exec` = 注入执行器——SSH 逐条）；出 = `{ mechanism, projectId, mount, readback }`。
 */
export async function applyDiskQuota({ exec, workspaceId, path, diskMb }) {
  if (typeof path !== "string" || path.trim() === "") throw new Error("配额就位缺工作区路径（path）")
  const size = Number(diskMb)
  if (!Number.isInteger(size) || size <= 0) throw new Error(`磁盘配额非法（diskMb = ${String(diskMb)}）`)
  const projectId = projectIdOf(workspaceId)
  const probe = await step(exec, "文件系统探明", `findmnt -no TARGET,FSTYPE,OPTIONS -T ${path}`)
  const { mount, fstype, options } = parseFindmnt(probe.stdout)
  if (fstype === "xfs" && options.includes("pquota")) {
    const applied = await applyXfs({ exec, mount, path, projectId, diskMb: size })
    return { projectId, mount, ...applied }
  }
  if (fstype === "ext4" && options.includes("prjquota")) {
    const applied = await applyExt4({ exec, mount, path, projectId, diskMb: size, mechanism: "ext4-project" })
    return { projectId, mount, ...applied }
  }
  const applied = await applyLoopback({ exec, path, projectId, diskMb: size })
  return { projectId, mount, ...applied }
}
