/**
 * pull.mjs — 拉仓执行（member-face-chat 批 · 盒壳）
 *
 * 单源 = `agent/MEMBER-AGENT.md` §3.6（拉仓流程步骤 4/5）+ `gateway/API.md` §2.12（命令结果
 * `{ state, detail }` 形）。执行体 = `git clone`（盒内系统 git）；**凭据不随命令**——git 经
 * 盒内 git 凭据助手（`git-cred.mjs`，镜像期登记 `credential.helper`）按次向 server 取件
 * （KD-SV-204）；非交互（`GIT_TERMINAL_PROMPT=0`——助手无件 ⇒ 干净失败，不挂终端）。
 * clone 后 remote 地址去凭据（携带 userinfo 的 URL 归一落盘——§3.6 步骤 4）。
 *
 * 失败分类（结果面人话——分类名供 server/页面映射）：`dir_conflict`（目标目录非空——盒侧检出，
 * 沿 §3.6 步骤 2）∥ `auth`（凭据缺失/无效——指回我的·账户页绑定卡）∥ `network`（不可达/出站被拒
 * ——含 60s 待批窗超时后的连接失败）∥ `other`（原文兜底）。
 */
import { spawn } from "node:child_process"
import { mkdirSync } from "node:fs"
import { dirname, resolve, sep } from "node:path"

const OUTPUT_MAX = 8 * 1024

/** URL 去凭据（保留 host/path；非 URL 形——如 scp 式 `git@host:path`——原样）。 */
export function stripUrlCredentials(url) {
  try {
    const u = new URL(url)
    if (!u.username && !u.password) return url
    u.username = ""
    u.password = ""
    return u.toString()
  } catch {
    return url
  }
}

/** 失败分类（stderr 原文 ⇒ { kind, message } 人话；顺序 = 具体度降序）。 */
export function classifyCloneFailure(stderr) {
  const text = String(stderr ?? "")
  if (/already exists and is not an empty directory|destination path .+ already exists/i.test(text)) {
    return { kind: "dir_conflict", message: "目标目录已存在且非空——换个目录名或先清理" }
  }
  if (/Authentication failed|could not read Username|terminal prompts disabled|Invalid username or password|Permission denied \(publickey\)|access denied/i.test(text)) {
    return { kind: "auth", message: "凭据缺失或无效——请在我的·账户页绑定 Git 凭据后重试" }
  }
  if (/Could not resolve host|Failed to connect|Connection (timed out|refused|reset)|Network is unreachable|proxy/i.test(text)) {
    return { kind: "network", message: "网络不可达或出站被拒——如是新目标域，请联系管理员放行" }
  }
  const tail = text.trim().split("\n").slice(-3).join("\n")
  return { kind: "other", message: tail === "" ? "拉取失败（无输出）" : tail }
}

/** 目录缺省（防御面——服务器已组装 url+dir；此处兜 URL 尾段为仓名）。 */
export function defaultDirFromUrl(url) {
  const clean = String(url ?? "").replace(/\/+$/, "").replace(/\.git$/i, "")
  const name = clean.split(/[/:]/).pop() ?? ""
  return name.replace(/[^\w.-]+/g, "") || "repo"
}

/**
 * 拉仓执行器。
 * @param {{cwd?: string, env?: object, spawnImpl?: Function}} opts
 *   `spawnImpl(command, args, options)` = `node:child_process.spawn` 同形（测试注入假件）。
 * @returns {{runPull: (cmd: {url: string, dir?: string, signal?: AbortSignal}) => Promise<{state: string, detail: object}>}}
 */
export function createPull({ cwd = process.env.TC_WORKSPACE_DIR ?? "/workspace", env = process.env, spawnImpl = spawn } = {}) {
  /** 子进程执行（输出有界采集；signal 中止 ⇒ kill）。 */
  const run = (command, args, { cwd: runCwd, signal } = {}) =>
    new Promise((done) => {
      let child
      try {
        child = spawnImpl(command, args, {
          cwd: runCwd,
          env: { ...env, GIT_TERMINAL_PROMPT: "0" }, // 非交互——助手无件即失败，不挂终端
          stdio: ["ignore", "pipe", "pipe"],
        })
      } catch (e) {
        done({ code: -1, stdout: "", stderr: String(e?.message ?? e) })
        return
      }
      let stdout = ""
      let stderr = ""
      const collect = (into, chunk) => (into.length >= OUTPUT_MAX ? into : (into + String(chunk)).slice(0, OUTPUT_MAX))
      child.stdout?.on("data", (c) => { stdout = collect(stdout, c) })
      child.stderr?.on("data", (c) => { stderr = collect(stderr, c) })
      const onAbort = () => { try { child.kill("SIGKILL") } catch { /* 进程已退出 */ } }
      signal?.addEventListener?.("abort", onAbort, { once: true })
      const settle = (code) => {
        signal?.removeEventListener?.("abort", onAbort)
        done({ code, stdout, stderr })
      }
      child.on("error", (e) => { stderr = collect(stderr, e?.message ?? e); settle(-1) })
      child.on("close", (code) => settle(typeof code === "number" ? code : -1))
    })

  return {
    async runPull({ url, dir, signal } = {}) {
      // 目标目录围栅（服务器已限相对形——本处同判防御：绝对路径 ∥ `..` 逃逸 ⇒ 拒，不落工作区外）
      const base = resolve(cwd)
      const target = resolve(base, dir && String(dir).trim() !== "" ? dir : defaultDirFromUrl(url))
      if (target !== base && !target.startsWith(base + sep)) {
        return { state: "failed", detail: { kind: "other", message: `目标目录须在工作区内：${dir}`, dir: target } }
      }
      try {
        mkdirSync(dirname(target), { recursive: true })
      } catch { /* 父目录创建失败由 git 报错分类（不静默） */ }
      // clone 前先去凭据（§3.6 步骤 4「clone 后 remote 地址去凭据」的等价更严形——凭据文本
      // 一步不落盘；入参携 userinfo 是服务器侧异常形，防御面）
      const cleanUrl = stripUrlCredentials(url)
      const cloned = await run("git", ["clone", cleanUrl, target], { cwd, signal })
      if (cloned.code !== 0) {
        const { kind, message } = classifyCloneFailure(cloned.stderr)
        return { state: "failed", detail: { kind, message, dir: target } }
      }
      return { state: "done", detail: { dir: target } }
    },
  }
}
