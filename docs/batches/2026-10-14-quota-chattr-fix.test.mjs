// 2026-10-14 · quota.mjs ext4 项目号赋值修复——单元腿（红绿对）
// 红（修前）：L1 「ext4 项目标记」命令 = `chattr -R +P … || chattr -R -p <id> +P …`——前半恒成功 ⇒ 赋号永不执行（真机实证：目录项目号 = 0）。
// 绿（修后）：L1 赋号句直接在场；L2 loopback 挂载后补 chown 1000:1000（①chown 被挂载盖掉）。
// 台账 #1409 ∥ 轮档 docs/batches/2026-10-14-quota-chattr-fix.md
import { test } from "node:test"
import assert from "node:assert/strict"
import { applyDiskQuota } from "../../thincoder-server/src/sandbox/quota.mjs"

function makeExec(fstypeOptions, repquotaRow = true) {
  const commands = []
  const exec = async (command, opts = {}) => {
    commands.push(command)
    const label = opts.label ?? ""
    if (label === "文件系统探明") return { exitCode: 0, stdout: `/ ${fstypeOptions}\n`, stderr: "" }
    if (label === "ext4 读回核") {
      return { exitCode: 0, stdout: repquotaRow ? `#100005 0 4194304 4194304 0 0 0 0\n` : "", stderr: "" }
    }
    if (label === "loopback 就位探") return { exitCode: 0, stdout: "bare\n", stderr: "" }
    return { exitCode: 0, stdout: "", stderr: "" }
  }
  return { exec, commands }
}

test("L1 ext4+prjquota：赋号句直接在场（无裸 chattr -R +P 主句）", async () => {
  const { exec, commands } = makeExec("ext4 rw,relatime,prjquota")
  await applyDiskQuota({ exec, workspaceId: 5, path: "/var/lib/thincoder/workspaces/5", diskMb: 4096 })
  const mark = commands.find((c) => c.includes("chattr"))
  assert.ok(mark, "须有 chattr 命令")
  assert.ok(mark.includes("chattr -R -p 100005 +P"), `赋号句须直接在场：${mark}`)
  assert.ok(!mark.startsWith("chattr -R +P"), `不得以裸 +P 作主句（恒成功 ⇒ 赋号流失）：${mark}`)
})

test("L2 loopback：挂载后补 chown 1000:1000", async () => {
  const { exec, commands } = makeExec("ext4 rw,relatime")
  await applyDiskQuota({ exec, workspaceId: 5, path: "/var/lib/thincoder/workspaces/5", diskMb: 4096 })
  assert.ok(commands.some((c) => c.includes("mount -o loop,prjquota")), "须走 loopback 挂载")
  const chownAt = commands.findIndex((c) => c.includes("chown 1000:1000"))
  assert.ok(chownAt > -1, "挂载后须补 chown 1000:1000（①chown 被挂载盖掉）")
  assert.ok(commands.findIndex((c) => c.includes("mount -o loop,prjquota")) < chownAt, "chown 须在挂载之后")
})
