/**
 * hosts.mjs — 主机凭据面（sandbox/SANDBOX.md §3「主机凭据」∥ §14 KD-SV-133/134；admin-chat-creds-merge 批——台账 #1326）：
 * 凭据写/撤销（**形校验 + 加密 + 审计两 kind**）∥ 主机 SSH 读面（`sshHostOf`——地址归一规则取 host，不另设列）∥
 * `execOnHost`（**解密 + `ssh.mjs` 传输 + 临时私钥用毕即删**——chat `exec` 工具与将来装机共用）。
 *
 * 口径：**密列零回显**（响应/日志/审计/帧四面零秘密字段——行形只见元数据 `registry.runnerView`）；写面 = 设/改（全列覆写，缺 `sudoSecret` ⇒ 零化）；
 * 加密单源 = `store/credential-crypto.mjs`（KD-SV-84/119）；传输单源 = `sandbox/ssh.mjs`（`createSshExecutor`）；
 * 掩蔽单源 = `agent/tools.mjs` `maskSecrets`（**行凭据值入掩蔽面**——结果/摘要/subject 同链，KD-SV-136）；假件注入（`config` ∥ `execImpl` ∥ `now`）供单元测试。
 */
import { recordAudit } from "../accounts/audit.mjs"
import { maskSecrets } from "../agent/tools.mjs"
import { credentialKeyPath, dataDir, decryptSecret, encryptSecret, loadOrCreateCredentialKey } from "../store/credential-crypto.mjs"
import { normalizeDockerAddress } from "./docker.mjs"
import { SSH_COMMAND_TIMEOUT_S, createSshExecutor, removeKeyFile } from "./ssh.mjs"

/** 认证形值域（应用层校验——列无 CHECK；§3）。 */
export const HOST_AUTH_KINDS = Object.freeze(["key", "password"])

/** SSH 端口缺省（写面缺省 22——§3；行列 NULL = 未设）。 */
export const DEFAULT_SSH_PORT = 22

/** 字段上限（与任务面同量级——私钥原文/口令各 ≤ 20000 字符）。 */
const SECRET_MAX = 20000
const USER_MAX = 100

/** 凭据形校验（§12 E59：缺 `sshUser` ∥ `auth.kind` 表外 ∥ `secret` 空 ∥ `sshPort` 越界 ⇒ 抛人话；调用方转 400——**库零变**）。 */
export function parseHostCredentialInput(body = {}) {
  const raw = body !== null && typeof body === "object" && !Array.isArray(body) ? body : {}
  const sshUser = typeof raw.sshUser === "string" ? raw.sshUser.trim() : ""
  if (sshUser === "") throw new Error("sshUser 必填（SSH 登录用户）")
  if (sshUser.length > USER_MAX) throw new Error(`sshUser 超长（≤ ${USER_MAX} 字符）`)
  const auth = raw.auth !== null && typeof raw.auth === "object" && !Array.isArray(raw.auth) ? raw.auth : {}
  const authKind = typeof auth.kind === "string" ? auth.kind.trim() : ""
  if (!HOST_AUTH_KINDS.includes(authKind)) throw new Error(`auth.kind 非法：${String(auth.kind ?? "")}（key ∥ password）`)
  const secret = typeof auth.secret === "string" ? auth.secret : ""
  if (secret.trim() === "") throw new Error(authKind === "key" ? "auth.secret 必填（私钥原文）" : "auth.secret 必填（登录口令）")
  if (secret.length > SECRET_MAX) throw new Error(`auth.secret 超长（≤ ${SECRET_MAX} 字符）`)
  const given = raw.sshPort === undefined || raw.sshPort === null || raw.sshPort === "" ? DEFAULT_SSH_PORT : Number(raw.sshPort)
  if (!Number.isInteger(given) || given < 1 || given > 65535) throw new Error(`sshPort 非法：${String(raw.sshPort)}（1–65535）`)
  const sudoSecret = typeof raw.sudoSecret === "string" && raw.sudoSecret !== "" ? raw.sudoSecret : null
  if (sudoSecret !== null && sudoSecret.length > SECRET_MAX) throw new Error(`sudoSecret 超长（≤ ${SECRET_MAX} 字符）`)
  return { sshPort: given, sshUser, authKind, secret, sudoSecret }
}

/** SSH 目标主机 = 行 `address` 的 host 部分（§3——解析复用地址归一规则；不另设 `ssh_host` 列）。 */
export function sshHostOf(row) {
  return new URL(normalizeDockerAddress(row.address)).hostname
}

/** 行凭据解密（执行前读面——键文件首用生成；形不合/篡改 ⇒ 抛人话）。缺凭据 ⇒ 抛（人话指向录入弹窗——KD-SV-136）。 */
export function credentialOf(row, { config = {} } = {}) {
  if (typeof row.secret_cipher !== "string" || row.secret_cipher === "") {
    throw new Error(`主机「${row.name}」未登记 SSH 凭据——在「主机凭据」弹窗录入（沙盒页节点行 ∥ 对话页会话条钮）`)
  }
  const key = loadOrCreateCredentialKey(credentialKeyPath(config))
  try {
    return {
      secret: decryptSecret(row.secret_cipher, key),
      sudoSecret: typeof row.sudo_cipher === "string" && row.sudo_cipher !== "" ? decryptSecret(row.sudo_cipher, key) : null,
    }
  } catch (e) {
    throw new Error(`凭据解密失败：${e?.message ?? String(e)}（重新录入——主机凭据弹窗）`)
  }
}

/** 凭据设/改（`PUT …/credential` 单源）：七列全写入（`state='sealed'`）+ 审计 `host_credential_set`（detail 三键——**零秘密**）。 */
export function setHostCredential(db, runner, input, { config = {}, actor = "admin", actorId = null, now = Date.now } = {}) {
  const key = loadOrCreateCredentialKey(credentialKeyPath(config))
  const updatedAt = new Date(now()).toISOString()
  db.prepare(`UPDATE sandbox_runners SET ssh_port = ?, ssh_user = ?, auth_kind = ?, secret_cipher = ?, sudo_cipher = ?,
    credential_state = 'sealed', credential_updated_at = ? WHERE id = ?`)
    .run(input.sshPort, input.sshUser, input.authKind, encryptSecret(input.secret, key), input.sudoSecret === null ? null : encryptSecret(input.sudoSecret, key), updatedAt, runner.id)
  recordAudit(db, {
    type: "sandbox_event",
    actor,
    actorId,
    target: runner.name,
    detail: { kind: "host_credential_set", runnerId: runner.id, sshUser: input.sshUser, authKind: input.authKind },
    ts: now(),
  })
  return db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(runner.id)
}

/** 凭据撤销（`DELETE …/credential` ∥ chat 径 `runners.revoke_credential` 单源）：密列零化 + `state='revoked'`；
 *  审计 `host_credential_revoke`（detail = `runnerId`）。**无凭据在留 ⇒ 抛**（路由转 400）。元数据列（用户/端口/认证形）保留——非秘密。 */
export function revokeHostCredential(db, runner, { actor = "admin", actorId = null, now = Date.now } = {}) {
  if ((runner.secret_cipher ?? null) === null && (runner.sudo_cipher ?? null) === null) throw new Error("无凭据在留（已零化 ∥ 已撤销）")
  db.prepare("UPDATE sandbox_runners SET secret_cipher = NULL, sudo_cipher = NULL, credential_state = 'revoked', credential_updated_at = ? WHERE id = ?")
    .run(new Date(now()).toISOString(), runner.id)
  recordAudit(db, { type: "sandbox_event", actor, actorId, target: runner.name, detail: { kind: "host_credential_revoke", runnerId: runner.id }, ts: now() })
  return db.prepare("SELECT * FROM sandbox_runners WHERE id = ?").get(runner.id)
}

/** 摘要截断（尾注——摘要面 ≤200 字符；**先掩蔽后截断**）。 */
function clip(text, max = 200) {
  const value = String(text ?? "").trim()
  return value.length > max ? `${value.slice(0, max)}…` : value
}

/**
 * 主机执行（§12 `exec` 行：绑定 = 主机表行；`execOnHost` = 解密 + 传输 + 临时私钥清理）。
 * 出 = `{ ok, exitCode, stdout, stderr, summary, subject }`（**命令非零退出 ⇒ `ok:true`**——退出码在结果内）；
 * 传输级失败 ⇒ 抛（`SshError`——调用侧转工具级错误人话）；**行凭据值零入四面**（stdout/stderr/summary/subject 同链掩蔽——KD-SV-136）。
 * 私钥临时档（key 认证形）用毕即删——`finally` 单点（零残留）。
 */
export async function execOnHost(row, { command, timeoutS = SSH_COMMAND_TIMEOUT_S, stdin = null } = {}, { config = {}, execImpl = null, now = Date.now } = {}) {
  const { secret, sudoSecret } = credentialOf(row, { config })
  const host = sshHostOf(row)
  const ssh = createSshExecutor({
    baseDir: dataDir(config),
    ...(execImpl === null ? {} : { execImpl }),
    keyName: `host-${row.id}-${now()}-${Math.random().toString(16).slice(2, 8)}`, // 临时私钥（每次一档——用毕即删）
  })
  try {
    const out = await ssh.exec({
      host,
      port: row.ssh_port ?? DEFAULT_SSH_PORT,
      user: row.ssh_user,
      authKind: row.auth_kind,
      secret,
      sudoSecret,
      command,
      timeoutS,
      stdin, // 命令体透传（sandbox-exec-rebuild 批：`nft -f -` ∥ `tar xzf -` 收体——盒链 ③/恢复备径用；缺省 null = 现状零变）
    })
    const secrets = [secret, sudoSecret].filter((value) => typeof value === "string" && value.length > 0)
    const stdout = maskSecrets(out.stdout, secrets)
    const stderr = maskSecrets(out.stderr, secrets)
    const summary = maskSecrets(`exit=${out.exitCode}${stdout ? `；out: ${clip(stdout)}` : ""}${stderr ? `；err: ${clip(stderr)}` : ""}`, secrets)
    return { ok: true, exitCode: out.exitCode, stdout, stderr, summary, subject: maskSecrets(command, secrets) }
  } finally {
    removeKeyFile(ssh.keyFilePath())
  }
}
