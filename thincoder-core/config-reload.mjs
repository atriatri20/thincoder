/**
 * config-reload.mjs — 运行中重读盘上渠道表（`docs/core/design/PROVIDER.md` §6.30）。
 *
 * 从 `thincoder-core/config.mjs` 抽出：该档落盘后越过 `docs/core/design/DOC-DISCIPLINE.md` §3.10 的
 * 500 行主动审视线，抽法沿 §6.30 指的候选线——`reloadProviders` 整段移出，`config.mjs` 以
 * re-export 保持导入面（形态同 `config-migrate.mjs` ∥ `config-io.mjs` 两次既有拆分）。
 *
 * 环：本档 import `config.mjs` 的 `loadConfig` ∥ `proxy.mjs` 的 `injectProxy`，而两者都反向指向
 * `config.mjs`——两处都只在调用期取活绑定，模块求值期不触碰，故环安全（同 `proxy.mjs` 既有形态）。
 */
import { loadConfig } from "./config.mjs"
import { injectProxy } from "./proxy.mjs"

/**
 * 运行中重读盘上渠道表——`/model` 打开边界调用：「切的时候读」，不必重启。四步：
 *  ① 读盘（`loadConfig`，含它自带的老字段迁移写回——既有行为，本批不新增写盘）；
 *  ② 准入判据由装载路径本身施加（`isUsableProviderEntry`，见 `thincoder-core/config-normalize.mjs`）；
 *     本档不重复应用谓词、也不造第二份丢弃记录——判据单源、丢弃载体单源都在装载那一步；
 *  ③ `injectProxy` 按当前 `config.proxy` 重算派生值 `proxyUri`；
 *  ④ 按 name 把会话态的 `_unavailable` 从旧表带到新表，再把**同一数组**赋给三个读点。
 *
 * **同一数组同赋值**：启动时 `agent.config.providersList` 与 `agent.config.providers` 本就是
 * `loadConfig` 里那个数组（整表别名）；只换一边就分叉——`thincoder-core/advisor/run.mjs` ∥
 * `thincoder-core/agent-tools/subagent-async.mjs` 读的是 `providersList` 那一侧。
 *
 * **读失败 ⇒ `{ ok:false, error }`，绝不 throw、绝不退回旧表**：拿旧表当现况正是本缺陷的形状
 * （盘上改了不生效，就是因为读的不是盘），所以调用方必须拒开列表并报错，内存态保持原样。
 *
 * 不动面（半量新鲜度，§6.30「前置」）：`defaultModel` ∥ `agent.provider` ∥ `providerState` 仍是
 * 启动时 `resolveProviderPlan` 解析的那份——替换运行态属运行面变更，不在本批暗改。
 *
 * @param agent 会话 agent（读 `agent.providers` 取会话态，写 `agent.providers` ∥ `agent.config.*`）
 * @returns {{ ok: boolean, dropped: string[], error?: string }} dropped = 本次丢弃记录（一句一条）
 */
export function reloadProviders(agent) {
  let fresh
  try {
    fresh = loadConfig()
  } catch (error) {
    return { ok: false, error: error?.message ?? String(error), dropped: [] }
  }
  const dropped = Array.isArray(fresh.providersDropped) ? fresh.providersDropped : []
  const providers = fresh.providersList
  // 会话态按 name 合并且只带 truthy 标记：`_unavailable` 是探针写在内存里的
  // （`thincoder-cli/src/tui/provider-admin.mjs`），盘上没有它，整表替换会把它冲掉——用户会看到
  // 刚标过不可用的渠道又变回可用。
  const previous = new Map((Array.isArray(agent.providers) ? agent.providers : []).filter((p) => p?.name).map((p) => [p.name, p]))
  for (const provider of providers) {
    if (previous.get(provider.name)?._unavailable) provider._unavailable = true
  }
  injectProxy(providers, fresh)
  agent.providers = providers
  agent.config ??= {}
  agent.config.providersList = providers
  agent.config.providers = providers
  // 载体跟新：盘上改好了就没有丢弃 ⇒ 清掉（`/model` 表头据此消失）；同一键、同形（string[]）。
  agent.config.providersDropped = dropped.length ? dropped : undefined
  return { ok: true, dropped }
}