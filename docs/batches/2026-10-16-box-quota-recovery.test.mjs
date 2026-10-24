/**
 * 2026-10-16-box-quota-recovery.test.mjs — 批内单测件（批档 = `docs/batches/2026-10-16-box-quota-recovery.md`，
 * §2 用例 1–14 ↔ 设计档 `sandbox/EXECUTION.md` §13 N74 ∥ B77–B83 ∥ E58–E60）。
 *
 * 被测面 = 真件（`quota.mjs` ∥ `box.mjs`）+ 假主机命令面（`exec` 逐条回放）+ 假 Docker 客户端 + 内存库
 * （`openDatabase(":memory:")`——真迁移链）。**用毕即删（零留存）**：本档随批档归档、不进 `test/` 收集面；§5 留一行读数。
 */
import { test } from "node:test"
import assert from "node:assert/strict"

const ROOT = new URL("../../", import.meta.url)
const quota = await import(new URL("thincoder-server/src/sandbox/quota.mjs", ROOT))
const box = await import(new URL("thincoder-server/src/sandbox/box.mjs", ROOT))
const { openDatabase } = await import(new URL("thincoder-server/src/store/db.mjs", ROOT))

const PATH = "/ws/12"
const IMAGE = `${PATH}.loop.img`
const PROJECT = 100012

// ── 假主机命令面（逐条回放）─────────────────────────────────────────────────

/** 规则表 ⇒ `exec`（首条命中；缺省 = exit 0 空输出）。 */
function fakeExec(rules = []) {
  const calls = []
  const spent = new Set()
  const exec = async (command, opts = {}) => {
    calls.push({ command, label: opts?.label ?? null })
    for (const rule of rules) {
      if (spent.has(rule)) continue
      const hit = typeof rule.match === "string" ? command.includes(rule.match) : rule.match.test(command)
      if (!hit) continue
      if (rule.once === true) spent.add(rule)
      return { exitCode: rule.exitCode ?? 0, stdout: rule.stdout ?? "", stderr: rule.stderr ?? "" }
    }
    return { exitCode: 0, stdout: "", stderr: "" }
  }
  return { exec, calls }
}

/** 变更性命令族（§4 健康径口径六族 + 销毁径 `rm -rf`——只读读件不计）。 */
const MUTATING = /^(umount |losetup -d |truncate -s |mkfs\.ext4 |mount -o |chown |rm -rf )/
const mutating = (calls) => calls.map((item) => item.command).filter((command) => MUTATING.test(command))

/** 挂载读数（`findmnt` 首步与就位探同一命令 ⇒ 同一答案）。 */
const findmnt = (target, source, fstype, options) => ({ match: /^findmnt /, stdout: `${target} ${source} ${fstype}   ${options}\n` })
const mounted = { match: /^mountpoint -q /, stdout: "mounted\n" }
const bare = { match: /^mountpoint -q /, stdout: "bare\n" }
const imagePresent = { match: new RegExp(`^test -f ${IMAGE.replace(".", "\\.")} `), stdout: "yes\n" }
const imageAbsent = { match: /^test -f /, stdout: "no\n" }
/** `dumpe2fs` 读数（UUID + 特性）——`target` 逐字入规则。 */
const dump = (target, uuid, features) => ({
  match: new RegExp(`^dumpe2fs -h ${target.replace(/[/.]/g, (c) => `\\${c}`)} `),
  stdout: `Filesystem UUID:          ${uuid}\nFilesystem features:      ${features}\n`,
})
const DUMP_EMPTY = { match: /^dumpe2fs -h /, exitCode: 1, stdout: "" }
const loopList = (rows) => ({ match: /^losetup -a /, stdout: rows.map(([name, back]) => `${name} ${back}\n`).join("") })
const ok = (match) => ({ match })
const chattrFails = { match: /^chattr /, exitCode: 1, stderr: "chattr: Operation not supported while setting flags on /ws/12\n" }
/** 读回核读数（`repquota` 行 = `#<id> <used> <soft> <hard> …`——`step` 的 [3] = hard 块）。 */
const repquota = { match: /^repquota -P -n /, stdout: `#${PROJECT}   0   0   4194304   0   0\n` }

// ── 假 Docker 客户端 + 内存库（`box.mjs` 链面）────────────────────────────────

function fakeClient() {
  const state = { network: false, container: null }
  return {
    async containers() {
      return { json: state.container === null ? [] : [{ Names: ["/tc-ws-12"], Id: state.container, State: "running" }] }
    },
    async containerState() {
      return { state: { running: true, startedAt: new Date(0).toISOString() } }
    },
    async inspectNetwork() {
      if (!state.network) {
        const error = new Error("network not found")
        error.status = 404
        throw error
      }
      return { Id: "net-1" }
    },
    async createNetwork() {
      state.network = true
      return { json: {} }
    },
    async deleteNetwork() {
      state.network = false
      return { json: {} }
    },
    async createContainer() {
      state.container = "c1"
      return { json: { Id: "c1" } }
    },
    async startContainer() {
      return { json: {} }
    },
    async deleteContainer() {
      state.container = null
      return { json: {} }
    },
  }
}

function memoryDb() {
  const db = openDatabase(":memory:")
  db.prepare("INSERT INTO sandbox_settings (k, v) VALUES (?, ?)").run("workspaceRoot", JSON.stringify("/ws"))
  return db
}

const WORKSPACE = { id: 12, name: "sandbox:12", key_plain: "sk-ws-12", limits_json: null }
const RUNNER = { id: 3, name: "sh-mgr" }
/** 审计行（`kind` ∥ `recovery`）——时序 = 插入序。 */
const auditKinds = (db) =>
  db.prepare("SELECT json_extract(detail, '$.kind') AS kind, json_extract(detail, '$.recovery') AS recovery FROM audit_events ORDER BY id").all()
const boxDeps = (rules) => {
  const host = fakeExec(rules)
  const client = fakeClient()
  return {
    host: { run: (runner, command) => host.exec(command), call: (runner, command) => host.exec(command), execOf: () => host.exec },
    clientForRunner: () => client,
    calls: host.calls,
    now: () => 1,
  }
}

// ── 用例 1（判据七例——纯函）────────────────────────────────────────────────

test("用例 1：classifyLoopbackMount 逐序判（七例）", () => {
  const base = { path: PATH, mountTarget: PATH, source: "/dev/loop32", mountUuid: "u-old", imageExists: true, imageUuid: "u-new", imageFeatures: "has_journal extent quota project" }
  assert.equal(quota.classifyLoopbackMount({ ...base, mountTarget: "/ws" }), "absent") // ① 未挂在工作区路径
  assert.equal(quota.classifyLoopbackMount({ ...base, source: "/dev/sdb1" }), "stale") // ② 外来挂载
  assert.equal(quota.classifyLoopbackMount({ ...base, imageExists: false }), "stale") // ③ 盘上镜像不在
  assert.equal(quota.classifyLoopbackMount({ ...base, imageFeatures: "has_journal extent quota" }), "stale") // ④ 镜像缺 project
  assert.equal(quota.classifyLoopbackMount(base), "stale") // ⑤ UUID 不等
  assert.equal(quota.classifyLoopbackMount({ ...base, mountUuid: null, imageUuid: null, imageFeatures: null }), "ready") // ⑥ 读数不可得
  assert.equal(quota.classifyLoopbackMount({ ...base, mountUuid: "u-same", imageUuid: "u-same" }), "ready") // ⑦ 就绪
  assert.deepEqual(quota.parseLoopdevices("/dev/loop32 /ws/12.loop.img\n/dev/loop29  /ws/2.loop.img (deleted)\n"), [
    { name: "/dev/loop32", backFile: "/ws/12.loop.img" },
    { name: "/dev/loop29", backFile: "/ws/2.loop.img (deleted)" },
  ])
  assert.deepEqual(quota.parseFindmnt(`${PATH} /dev/loop32 ext4   rw,relatime,prjquota\n`), { mount: PATH, source: "/dev/loop32", fstype: "ext4", options: ["rw", "relatime", "prjquota"] })
})

// ── 用例 2（B77 陈旧挂载 ⇒ 只重接）─────────────────────────────────────────

test("用例 2：陈旧挂载 ⇒ 卸 + detach + 只重接（无 mkfs；recovery = reconnect）", async () => {
  const host = fakeExec([
    findmnt(PATH, "/dev/loop32", "ext4", "rw,relatime"),
    mounted,
    imagePresent,
    dump(IMAGE, "u-new", "has_journal extent quota project"),
    dump("/dev/loop32", "u-old", "has_journal extent quota"),
    ok(/^umount /),
    loopList([["/dev/loop32", IMAGE]]),
    ok(/^losetup -d /),
    ok(/^mount -o loop,prjquota /),
    ok(/^chown /),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const applied = await quota.applyDiskQuota({ exec: host.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(applied.recovery, "reconnect")
  assert.deepEqual(mutating(host.calls), [
    `umount ${PATH}`,
    "losetup -d /dev/loop32",
    `mount -o loop,prjquota ${IMAGE} ${PATH}`,
    `chown 1000:1000 ${PATH}`,
  ])
  assert.ok(!host.calls.some((item) => item.command.startsWith("mkfs.ext4")))
  assert.equal(applied.mechanism, "loopback")
})

// ── 用例 3（B78 镜像失能 ⇒ 重建）───────────────────────────────────────────

test("用例 3：镜像缺 project ⇒ 重建（mkfs 在场；recovery = rebuild）", async () => {
  const host = fakeExec([
    findmnt(PATH, "/dev/loop32", "ext4", "rw,relatime"),
    mounted,
    imagePresent,
    dump(IMAGE, "u-old", "has_journal extent quota"),
    dump("/dev/loop32", "u-old", "has_journal extent quota"),
    loopList([["/dev/loop32", IMAGE]]),
    ok(/^umount /),
    ok(/^losetup -d /),
    ok(/^mkfs\.ext4 /),
    ok(/^mount -o /),
    ok(/^chown /),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const applied = await quota.applyDiskQuota({ exec: host.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(applied.recovery, "rebuild")
  assert.ok(host.calls.some((item) => item.command === `mkfs.ext4 -q -O project,quota -F ${IMAGE}`))
})

test("用例 3 修正（fix 轮）：镜像在场 ∧ 特性读数不可得 ⇒ 只重接（零 mkfs；recovery = reconnect）", async () => {
  const host = fakeExec([
    findmnt(PATH, "/dev/sdb1", "ext4", "rw,relatime"),
    mounted,
    imagePresent,
    DUMP_EMPTY,
    ok(/^umount /),
    ok(/^mount -o loop,prjquota /),
    ok(/^chown /),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const applied = await quota.applyDiskQuota({ exec: host.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(applied.recovery, "reconnect")
  assert.ok(!host.calls.some((item) => item.command.startsWith("truncate") || item.command.startsWith("mkfs")))
  assert.deepEqual(mutating(host.calls), [`umount ${PATH}`, `mount -o loop,prjquota ${IMAGE} ${PATH}`, `chown 1000:1000 ${PATH}`])
})

// ── 用例 4（B79 两腿：就绪 ∥ 读数不可得 ⇒ 零动）──────────────────────────────

test("用例 4：就绪 ⇒ 零变更性命令（recovery = null）", async () => {
  const host = fakeExec([
    findmnt(PATH, "/dev/loop32", "ext4", "rw,relatime"),
    mounted,
    imagePresent,
    dump(IMAGE, "u-same", "has_journal extent quota project"),
    dump("/dev/loop32", "u-same", "has_journal extent quota project"),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const applied = await quota.applyDiskQuota({ exec: host.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(applied.recovery, null)
  assert.deepEqual(mutating(host.calls), [])
})

test("用例 4：fs 读数不可得（dumpe2fs 空输出）⇒ 零动（安全性质）", async () => {
  const host = fakeExec([
    findmnt(PATH, "/dev/loop32", "ext4", "rw,relatime"),
    mounted,
    imagePresent,
    DUMP_EMPTY,
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const applied = await quota.applyDiskQuota({ exec: host.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(applied.recovery, null)
  assert.deepEqual(mutating(host.calls), [])
  assert.ok(!host.calls.some((item) => item.command.startsWith("losetup")))
})

// ── 用例 5 + 6（N74 健康径三腿——序列逐条同现状）─────────────────────────────

test("用例 5：裸路径 + 镜像不在 ⇒ truncate → mkfs → mount → chown（recovery = null）", async () => {
  const host = fakeExec([
    findmnt("/", "/dev/vda3", "ext4", "rw,relatime"),
    bare,
    imageAbsent,
    ok(/^truncate -s /),
    ok(/^mkfs\.ext4 /),
    ok(/^mount -o loop,prjquota /),
    ok(/^chown /),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const applied = await quota.applyDiskQuota({ exec: host.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(applied.recovery, null)
  assert.deepEqual(mutating(host.calls), [
    `truncate -s 4160M ${IMAGE} 2>/dev/null || fallocate -l 4160M ${IMAGE}`,
    `mkfs.ext4 -q -O project,quota -F ${IMAGE}`,
    `mount -o loop,prjquota ${IMAGE} ${PATH}`,
    `chown 1000:1000 ${PATH}`,
  ])
})

test("用例 6：xfs 腿 ∥ ext4 腿 ⇒ 序列逐条同现状（recovery = null）", async () => {
  const xfs = fakeExec([
    findmnt(PATH, "/dev/sdb1", "xfs", "rw,relatime,pquota"),
    { match: /^xfs_quota -x -c "report /, stdout: `${PROJECT}   0   1048576   1048576   0   0\n` },
    { match: /^xfs_info /, stdout: "bsize=4096\n" },
    ok(/^xfs_quota /),
  ])
  const x = await quota.applyDiskQuota({ exec: xfs.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(x.mechanism, "xfs-project")
  assert.equal(x.recovery, null)
  assert.deepEqual(mutating(xfs.calls), [])

  const ext4 = fakeExec([
    findmnt(PATH, "/dev/vda3", "ext4", "rw,relatime,prjquota"),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const e = await quota.applyDiskQuota({ exec: ext4.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(e.mechanism, "ext4-project")
  assert.equal(e.recovery, null)
  assert.deepEqual(mutating(ext4.calls), [])
})

test("用例 5/6（盒级）：健康径零 quota_recovered 行 + 链走通", async () => {
  const db = memoryDb()
  const deps = boxDeps([
    findmnt(PATH, "/dev/vda3", "ext4", "rw,relatime,prjquota"),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const created = await box.createWorkspaceBox(db, WORKSPACE, RUNNER, deps)
  assert.equal(created.path, PATH)
  assert.deepEqual(
    auditKinds(db).map((row) => row.kind),
    ["workspace_create"],
  )
  db.close()
})

// ── 用例 7（B80 降级腿）+ 用例 13（E60 再失败 ⇒ 停）───────────────────────────

test("用例 7：ext4 径项目标记失败 ⇒ 降 loopback 径（recovery = demote）", async () => {
  const host = fakeExec([
    findmnt("/ws", "/dev/sdb1", "ext4", "rw,relatime,prjquota"),
    bare,
    imageAbsent,
    { match: /^chattr /, exitCode: 1, stderr: "chattr: Operation not supported\n", once: true },
    ok(/^truncate -s /),
    ok(/^mkfs\.ext4 /),
    ok(/^mount -o loop,prjquota /),
    ok(/^chown /),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const applied = await quota.applyDiskQuota({ exec: host.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(applied.recovery, "demote")
  assert.equal(applied.mechanism, "loopback")
  assert.deepEqual(mutating(host.calls), [
    `truncate -s 4160M ${IMAGE} 2>/dev/null || fallocate -l 4160M ${IMAGE}`,
    `mkfs.ext4 -q -O project,quota -F ${IMAGE}`,
    `mount -o loop,prjquota ${IMAGE} ${PATH}`,
    `chown 1000:1000 ${PATH}`,
  ])
})

test("用例 13：降级后 loopback 径项目标记再失败 ⇒ 停（零第二次降级；两行在场）", async () => {
  const db = memoryDb()
  const deps = boxDeps([
    findmnt("/ws", "/dev/sdb1", "ext4", "rw,relatime,prjquota"),
    bare,
    imageAbsent,
    chattrFails,
    ok(/^truncate -s /),
    ok(/^mkfs\.ext4 /),
    ok(/^mount -o loop,prjquota /),
    ok(/^chown /),
  ])
  await assert.rejects(() => box.createWorkspaceBox(db, WORKSPACE, RUNNER, deps), /② 配额就位失败/)
  const kinds = auditKinds(db)
  assert.deepEqual(kinds.map((row) => row.kind), ["quota_recovered", "quota_apply_failed"])
  assert.equal(kinds[0].recovery, "demote")
  assert.equal(deps.calls.filter((item) => item.command.startsWith("chattr ")).length, 2)
  assert.equal(deps.calls.filter((item) => item.command.startsWith("mkfs.ext4")).length, 1)
  db.close()
})

// ── 用例 10（B81 外来挂载 ⇒ 只卸挂载、零 detach）─────────────────────────────

test("用例 10：外来挂载（源非 loop）⇒ umount + 重接（零 losetup -d）", async () => {
  const host = fakeExec([
    findmnt(PATH, "/dev/sdb1", "ext4", "rw,relatime"),
    mounted,
    imagePresent,
    dump(IMAGE, "u-new", "has_journal extent quota project"),
    ok(/^umount /),
    ok(/^mount -o loop,prjquota /),
    ok(/^chown /),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const applied = await quota.applyDiskQuota({ exec: host.exec, workspaceId: 12, path: PATH, diskMb: 4096 })
  assert.equal(applied.recovery, "reconnect")
  assert.ok(!host.calls.some((item) => item.command.startsWith("losetup")))
  assert.deepEqual(mutating(host.calls), [`umount ${PATH}`, `mount -o loop,prjquota ${IMAGE} ${PATH}`, `chown 1000:1000 ${PATH}`])
})

// ── 用例 11（E59 重建后下游失败 ⇒ 不丢痕）───────────────────────────────────

test("用例 11：陈旧 ⇒ 重建后项目标记失败 ⇒ quota_recovered(rebuild) + quota_apply_failed 双行", async () => {
  const db = memoryDb()
  const deps = boxDeps([
    findmnt(PATH, "/dev/loop40", "ext4", "rw,relatime"),
    mounted,
    imagePresent,
    dump(IMAGE, "u-old", "has_journal extent quota"),
    loopList([["/dev/loop40", IMAGE]]),
    ok(/^umount /),
    ok(/^losetup -d /),
    ok(/^truncate -s /),
    ok(/^mkfs\.ext4 /),
    ok(/^mount -o loop,prjquota /),
    ok(/^chown /),
    chattrFails,
  ])
  await assert.rejects(() => box.createWorkspaceBox(db, WORKSPACE, RUNNER, deps), /② 配额就位失败/)
  const kinds = auditKinds(db)
  assert.deepEqual(kinds.map((row) => row.kind), ["quota_recovered", "quota_apply_failed"])
  assert.equal(kinds[0].recovery, "rebuild")
  db.close()
})

test("用例 11 补（评审 fix 轮）：重建后挂载步失败 ⇒ quota_recovered(rebuild) 仍落行 + quota_apply_failed", async () => {
  const db = memoryDb()
  const deps = boxDeps([
    findmnt(PATH, "/dev/loop40", "ext4", "rw,relatime"),
    mounted,
    imagePresent,
    dump(IMAGE, "u-old", "has_journal extent quota"),
    loopList([["/dev/loop40", IMAGE]]),
    ok(/^umount /),
    ok(/^losetup -d /),
    ok(/^truncate -s /),
    ok(/^mkfs\.ext4 /),
    { match: /^mount -o loop,prjquota /, exitCode: 1, stderr: "mount: wrong fs type, bad option\n" },
  ])
  await assert.rejects(() => box.createWorkspaceBox(db, WORKSPACE, RUNNER, deps), /② 配额就位失败/)
  const kinds = auditKinds(db)
  assert.deepEqual(kinds.map((row) => row.kind), ["quota_recovered", "quota_apply_failed"])
  assert.equal(kinds[0].recovery, "rebuild")
  db.close()
})

// ── 用例 8（E58 释放腿）+ 用例 9 ∥ 12（销毁两腿）────────────────────────────

test("用例 8：releaseLoopbackVolume ⇒ umount + detach 本工作区两条（不含他人）", async () => {
  const host = fakeExec([
    mounted,
    ok(/^umount /),
    loopList([
      ["/dev/loop32", IMAGE],
      ["/dev/loop29", `${IMAGE} (deleted)`],
      ["/dev/loop40", "/ws/13.loop.img"],
    ]),
    ok(/^losetup -d /),
  ])
  const released = await quota.releaseLoopbackVolume({ exec: host.exec, path: PATH })
  assert.deepEqual(released, { unloaded: true, detached: ["/dev/loop32", "/dev/loop29"] })
  assert.deepEqual(mutating(host.calls), [`umount ${PATH}`, "losetup -d /dev/loop32", "losetup -d /dev/loop29"])
})

test("用例 9：销毁（在挂）⇒ 卸除件 + rm -rf 两项；审计在", async () => {
  const db = memoryDb()
  const deps = boxDeps([
    mounted,
    ok(/^umount /),
    loopList([["/dev/loop32", IMAGE]]),
    ok(/^losetup -d /),
    ok(/^rm -rf /),
  ])
  const result = await box.destroyWorkspaceBox(db, WORKSPACE, RUNNER, deps, { deleteVolume: true })
  assert.deepEqual(result, { destroyed: true, deleteVolume: true, snapshots: 0 })
  assert.deepEqual(mutating(deps.calls), [`umount ${PATH}`, "losetup -d /dev/loop32", `rm -rf ${PATH} ${IMAGE}`])
  assert.deepEqual(
    auditKinds(db).map((row) => row.kind),
    ["workspace_destroy", "box_destroy"],
  )
  db.close()
})

test("用例 12：销毁 + 路径未挂 ⇒ 零 umount/零 losetup -d（不抛）+ rm -rf 两项", async () => {
  const db = memoryDb()
  const deps = boxDeps([bare, loopList([]), ok(/^rm -rf /)])
  const result = await box.destroyWorkspaceBox(db, WORKSPACE, RUNNER, deps, { deleteVolume: true })
  assert.equal(result.destroyed, true)
  assert.deepEqual(mutating(deps.calls), [`rm -rf ${PATH} ${IMAGE}`])
  assert.deepEqual(
    auditKinds(db).map((row) => row.kind),
    ["workspace_destroy", "box_destroy"],
  )
  db.close()
})

// ── 用例 14（B83 裸路径 + 镜像在场缺 project ⇒ 抹既有镜像 + 留痕）──────────────

test("用例 14：裸路径 + 镜像在场缺 project ⇒ 抹既有镜像（truncate → mkfs → mount → chown）；quota_recovered(rebuild) 在场", async () => {
  const db = memoryDb()
  const deps = boxDeps([
    findmnt("/", "/dev/vda3", "ext4", "rw,relatime"),
    bare,
    imagePresent,
    dump(IMAGE, "u-old", "has_journal extent quota"),
    ok(/^truncate -s /),
    ok(/^mkfs\.ext4 /),
    ok(/^mount -o loop,prjquota /),
    ok(/^chown /),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const created = await box.createWorkspaceBox(db, WORKSPACE, RUNNER, deps)
  assert.equal(created.path, PATH)
  const kinds = auditKinds(db)
  assert.deepEqual(kinds.map((row) => row.kind), ["quota_recovered", "workspace_create"]) // 抹掉既有内容 ⇒ 行必落
  assert.equal(kinds[0].recovery, "rebuild")
  const cmds = deps.calls.map((item) => item.command)
  const at = cmds.indexOf(`truncate -s 4160M ${IMAGE} 2>/dev/null || fallocate -l 4160M ${IMAGE}`)
  assert.deepEqual(cmds.slice(at, at + 3), [
    `truncate -s 4160M ${IMAGE} 2>/dev/null || fallocate -l 4160M ${IMAGE}`,
    `mkfs.ext4 -q -O project,quota -F ${IMAGE}`,
    `mount -o loop,prjquota ${IMAGE} ${PATH}`,
  ])
  assert.ok(cmds.includes(`chown 1000:1000 ${PATH}`))
  assert.ok(cmds.indexOf(`chattr -R -p ${PROJECT} +P ${PATH}`) > at) // 序列续走 ext4 项目标记步（B83 期望序列尾）
  assert.ok(!cmds.some((command) => command.startsWith("umount") || command.startsWith("losetup"))) // 裸路径 ⇒ 零卸除
  db.close()
})

test("用例 14 附（判据四径第三径）：stale ∧ 重建前镜像不在 ⇒ rebuild + quota_recovered 行在场", async () => {
  const db = memoryDb()
  const deps = boxDeps([
    findmnt(PATH, "/dev/loop40", "ext4", "rw,relatime"),
    mounted,
    imageAbsent,
    loopList([["/dev/loop40", IMAGE]]),
    ok(/^umount /),
    ok(/^losetup -d /),
    ok(/^truncate -s /),
    ok(/^mkfs\.ext4 /),
    ok(/^mount -o loop,prjquota /),
    ok(/^chown /),
    ok(/^chattr /),
    ok(/^setquota /),
    repquota,
  ])
  const created = await box.createWorkspaceBox(db, WORKSPACE, RUNNER, deps)
  assert.equal(created.path, PATH)
  const kinds = auditKinds(db)
  assert.deepEqual(kinds.map((row) => row.kind), ["quota_recovered", "workspace_create"]) // 镜不在亦抹旧内容 ⇒ 行必落
  assert.equal(kinds[0].recovery, "rebuild")
  assert.ok(deps.calls.some((item) => item.command === `mkfs.ext4 -q -O project,quota -F ${IMAGE}`))
  db.close()
})
