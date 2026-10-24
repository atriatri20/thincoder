/**
 * ssh-askpass.mjs — SSH 口令助手（独立进程入口；设计 = `docs/core/design/TOOLS.md` §6.22 ② · D-TO18）。
 *
 * 调用面 = ssh 经包装档（`<node> <本档> %*`）执行本档：argv[1] = 提示语本体
 * （上游 `readpass.c` `ssh_askpass()`：`execlp(askpass, askpass, msg, NULL)`）。
 * 输出面 = stdout **仅一行**（ssh 读首行作答复；`readpass.c` 取到首个 \r|\n 即止）。
 * 秘密来源 = 环境变量 `TC_SSH_SECRET`（ssh 子进程环境——不入 argv / ps；§6.22 ②「秘密传递」行）。
 * 零日志 / 零落盘 / 零回显——本档只写 stdout，不碰任何持久面。
 *
 * 答复判定（三分支，逐条有据）：
 * 1. `SSH_ASKPASS_PROMPT === "confirm"` ⇒ `yes`——上游 `readpass.c` 的 `RP_ASK_PERMISSION`
 *    径（如 `AddKeysToAgent=ask` 的 `ask_permission()`）；设计 §6.22 ② 同句。
 * 2. 有秘密且提示语是主机确认句 ⇒ `yes`——**host-key 确认径不设该环境提示**
 *    （`sshconnect.c` `confirm()` 走 `read_passphrase(msg, RP_ECHO)`，非 `RP_ASK_PERMISSION`
 *    ⇒ 无 hint），故以提示语首行判定（确认句首行 = `The authenticity of host …`）。
 * 3. 有秘密 ⇒ 秘密本体（password ∥ keyboard-interactive 两径同走 `read_passphrase`）。
 *    无秘密 ⇒ `yes`——无秘密的场合 = 预探连（`NumberOfPasswordPrompts=0`），此刻**只可能**
 *    收到确认类提问：password ∥ keyboard-interactive 被该选项短路（`sshconnect2.c`
 *    `userauth_passwd` / `userauth_kbdint` 两处同判 `attempt++ >= number_of_password_prompts`）、
 *    私钥口令提示亦被短路（`load_identity_file` 循环 `i <= number_of_password_prompts`）。
 */
const SECRET_ENV = "TC_SSH_SECRET"
/** 主机确认句判据（首行；Windows `.cmd` 中介可能截断 argv——首行判据对截断不敏感）。 */
const HOST_CONFIRM_RE = /authenticity of host|continue connecting/i

const prompt = String(process.argv[2] ?? "")
const hint = String(process.env.SSH_ASKPASS_PROMPT ?? "")
const secret = process.env[SECRET_ENV]

let answer
if (hint === "confirm" || (secret && HOST_CONFIRM_RE.test(prompt))) answer = "yes"
else if (secret) answer = secret
else answer = "yes"

process.stdout.write(`${answer}\n`)
