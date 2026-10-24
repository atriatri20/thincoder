/**
 * credential-crypto.mjs — 凭据加密共享件（KD-SV-119；store/STORE.md §2 v13/v17 段）：
 * 数据目录派生 `dataDir` ∥ 键文件路径派生 `credentialKeyPath` ∥ 键加载/生成 `loadOrCreateCredentialKey` ∥
 * AES-256-GCM 加/解密 `encryptSecret` ∥ `decryptSecret`。
 *
 * 单一出处（消费方同址：沙盒主机凭据 ∥ 私有仓凭据 ∥ 连接材料 ∥ 成员面凭据 ∥ MCP 凭据 ∥ project 域 git 源 PAT）——防第二份路径规则（两份 `credentials.key`）。
 * 本件自沙盒任务面逐字抽出（KD-SV-119——零行为变；任务面 2026-10-14 随任务式装机退场删净，本件存续为各消费方单源）。
 * 包形 = `iv|tag|ct` base64 三段；键文件 = 32 字节随机 ∥ 首用生成 ∥ 0600 ∥ 不落库。
 */
import { chmodSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import { dirname, join } from "node:path"

/** 数据目录（keyfile ∥ known_hosts ∥ credentials.key 落点——容器重建不丢；sandbox/SANDBOX.md §3）。 */
export function dataDir(config = {}) {
  const dbPath = typeof config.db === "string" && config.db.trim() !== "" ? config.db.trim() : "data/gateway.db"
  return dirname(dbPath) === "." ? "data" : dirname(dbPath)
}

/** 凭据键文件路径（KD-SV-119 单源——= `join(<db 档所在目录 ∥ 缺省 data>, "credentials.key")`）。 */
export function credentialKeyPath(config = {}) {
  return join(dataDir(config), "credentials.key")
}

/** 凭据加密密钥（KD-SV-84）：`data/credentials.key`——32 字节随机 ∥ 首用生成 ∥ 0600 ∥ 不落库。 */
export function loadOrCreateCredentialKey(keyPath) {
  try {
    const existing = readFileSync(keyPath)
    if (existing.length >= 32) return existing.subarray(0, 32)
  } catch {
    /* 首用——下方生成 */
  }
  const key = randomBytes(32)
  mkdirSync(dirname(keyPath), { recursive: true })
  writeFileSync(keyPath, key, { mode: 0o600 })
  chmodSync(keyPath, 0o600)
  return key
}

/** AES-256-GCM 加密（出 = `iv|tag|ct` —— base64 三段——store/STORE.md §2 v13 段存储形）。 */
export function encryptSecret(plaintext, key) {
  const iv = randomBytes(12)
  const cipher = createCipheriv("aes-256-gcm", key, iv)
  const ciphertext = Buffer.concat([cipher.update(String(plaintext), "utf8"), cipher.final()])
  return [iv.toString("base64"), cipher.getAuthTag().toString("base64"), ciphertext.toString("base64")].join("|")
}

/** AES-256-GCM 解密（形不合/篡改 ⇒ 抛——调用侧转工具级错误人话；消费面 = 主机凭据 ∥ 私有仓凭据 ∥ 连接材料 ∥ 成员/MCP 凭据 ∥ project 域 git 源）。 */
export function decryptSecret(payload, key) {
  const parts = String(payload ?? "").split("|")
  if (parts.length !== 3) throw new Error("凭据密文形非法（iv|tag|ct）")
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(parts[0], "base64"))
  decipher.setAuthTag(Buffer.from(parts[1], "base64"))
  return Buffer.concat([decipher.update(Buffer.from(parts[2], "base64")), decipher.final()]).toString("utf8")
}
