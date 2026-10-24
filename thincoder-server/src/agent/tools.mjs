/**
 * tools.mjs — 掩蔽单源（`maskSecrets`——agent/ADMIN-AGENT.md §6 ∥ §12（`exec` 掩蔽 = `maskSecrets` + 行凭据值——KD-SV-136）∥
 * sandbox/SANDBOX.md §3 主机凭据块；admin-agent-chat 批提取——台账 #1254）：
 * 秘密值永不入审计/日志/回显/帧——消费面 = chat 面（`chat.mjs` ∥ `member-relay.mjs`）∥ 主机凭据面（`sandbox/hosts.mjs`）。
 *
 * 任务面五工具（`exec`/`docker`/`register`/`verify`/`report` + 步骤骨架 `STEP_IDS`）已随任务式装机退场删净（2026-10-14）：
 * 装机/主机运维 = 管理面 chat 内动作（KD-SV-135——chat 工具面八件，单源 = `chat-tools.mjs`）。
 */

/** 掩蔽（秘密永不入审计/日志/回显——短值（< 4 字符）不掩：防误伤普通文本；长值全文替换为 `***`）。 */
export function maskSecrets(text, secrets = []) {
  let out = typeof text === "string" ? text : text === null || text === undefined ? "" : String(text)
  for (const secret of secrets) {
    if (typeof secret !== "string" || secret.length < 4) continue
    out = out.split(secret).join("***")
  }
  return out
}
