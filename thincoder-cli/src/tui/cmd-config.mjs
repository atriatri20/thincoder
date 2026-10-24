import { ansi, C } from "./ansi.mjs"
import { embeddingPatch, poolCur, compactThresholdSuffix, compactThresholdHint } from "./config-helpers.mjs"
// 四子菜单（代理 ∥ 会诊池 ∥ 并发池 ∥ 默认模型）已迁 `cmd-config-menus.mjs`（§6.16.9 —— C2）
import { createProxyMenu, createConsultMenu, createPoolMenu, createDefaultModelMenu } from "./cmd-config-menus.mjs"

/** /config command: view and set agent/embedding/proxy config. */
export async function handleConfigCommand(ctx, args = []) {
  const { agent, pushLine, pushLabel, showPicker, askQuestion, persistRaw, maskKey, pickModelForSlot } = ctx
  const { configPath, DEFAULTS } = await import("@thincoder/core/config.mjs")
  let ac = agent.config?.agent ?? {}
  let ec = agent.config?.embedding ?? {}
  let tc = agent.config?.traces ?? {}
  let dc = agent.config?.diagnostics ?? {}

  // agent.config.proxy 已被 loadConfig 归一化为 { uri, web } | undefined
  function proxySummary() {
    const pc = agent.config?.proxy
    if (!pc) return "not configured"
    return `${pc.uri} web:${pc.web ? "on" : "off"}`
  }

  async function setEmbedKey() {
    const embKey = await askQuestion("Enter embedding API key (default: SiliconFlow bge-m3):")
    if (!embKey) return false
    // D-F5b 语义先盘后存（embeddingPatch 在磁盘 fresh raw 上合并——冲突放弃不留 ghost）
    await persistRaw((raw) => { raw.embedding = embeddingPatch(raw, embKey, DEFAULTS.embedding) })
    agent.config.embedding ??= {}
    agent.config.embedding.apiKey = embKey
    if (agent.memory) {
      const { createEmbedder } = await import("@thincoder/core/embedding.mjs")
      agent.memory.embedder = createEmbedder(agent.config.embedding)
    }
    pushLabel("❯ Config", ansi.bold + C.tool)
    pushLine("Embedding key saved, vector search enabled", C.tool)
    return true
  }

  /** 保存后的公共重载：loadConfig → injectProxy → 恢复运行时 provider 选择。
   *  MODEL-MERGE-SESSION 三支改写（cfg 无 active*）：运行时由「会话槽复合仍在 providers 中 →
   *  保持槽值」或「config defaultModel（新会话起点）」决定（渠道条目不携模型——2026-10-09 清除批）。 */
  async function reloadConfig() {
    const { loadConfig } = await import("@thincoder/core/config.mjs")
    const { injectProxy } = await import("@thincoder/core/proxy.mjs")
    const cfg = loadConfig()
    injectProxy(cfg.providersList, cfg)
    const sessionName = agent.activeProvider
    const sessionModel = agent.activeModel
    agent.providers = cfg.providersList
    agent.config = cfg
    agent.config.agent ??= {}
    const keep = sessionName ? cfg.providersList.find((p) => p.name === sessionName) : null
    if (keep) {
      // 会话 provider 仍存在 → 会话复合优先（槽值——不看 cfg 默认；模型空时落默认复合；
      // 渠道侧无模型可回落——单值退场 2026-10-09 清除批：缺 ⇒ 明示未设置）
      const dm = cfg.provider.name ? cfg.provider : null
      const model = sessionModel ?? (dm && dm.name === sessionName ? dm.model : "")
      agent.activeProvider = keep.name
      agent.activeModel = model || null
      agent.provider = { ...keep }
      agent.provider.model = model
    } else {
      // 会话 provider 没了（D-S3 静默保留处置）/尚未选 → 采纳 config defaultModel 运行时
      agent.activeProvider = cfg.provider.name ?? ""
      agent.activeModel = cfg.provider.model ?? null
      agent.provider = cfg.provider.name ? { ...cfg.provider } : {}
    }
    // 运行时重建后同步注入结果（cfg.provider 系 loadConfig 内建——injectProxy 后建）
    agent.provider.proxyUri = cfg.providersList.find((p) => p.name === agent.activeProvider)?.proxyUri
    // §6.17：auto 派生值永不回写 agent.compactThreshold——只刷新显示面 compactThresholdResolved
    // （每 run 的判定阈值由 setup.mjs 现算，本处只管 /config 显示面与显式键隔离）
    if (agent.config?.agent?.compactThresholdAuto) {
      const { resolveCompactThreshold } = await import("@thincoder/core/config.mjs")
      agent.config.agent.compactThresholdResolved = resolveCompactThreshold(null, agent.provider).value
    }
  }

  /** 保存 config（mutate 改 raw）→ reloadConfig（provider 代理无需重启即生效）。
   *  D-F5b：磁盘新鲜读 → mutate → 写前 mtime 门控（writeConfigAtomic——冲突放弃 +
   *  .bak 留现场）；冲突时先 reloadConfig 采纳磁盘新值再 throw——调用方 try/catch
   *  统一展示 "Save failed: config changed on disk concurrently — retry"。
   *  写链走 ctx.persistRaw（与 TUI 其余 config 写点同源——createConfigHelpers 的
   *  configPath 测试注入缝随之生效；生产 = 同一 writeConfigAtomic 调用）。 */
  async function saveProxy(mutate) {
    let failure = null
    try { await persistRaw(mutate) } catch (e) { failure = e }
    await reloadConfig()
    if (failure) throw failure
  }

  // ── 四子菜单（代理 ∥ 会诊池 ∥ 并发池 ∥ 默认模型）已迁 `cmd-config-menus.mjs`（§6.16.9 —— C2）：
  // 工厂形接收 ctx 袋——saveProxy 在本处已建好，四个菜单各建一次、主循环复用（行为零变）──
  const menuCtx = { agent, DEFAULTS, showPicker, askQuestion, pushLine, pushLabel, saveProxy, pickModelForSlot }
  const proxyMenu = createProxyMenu(menuCtx)
  const consultMenu = createConsultMenu(menuCtx)
  const poolMenu = createPoolMenu(menuCtx)
  const defaultModelMenu = createDefaultModelMenu(menuCtx)

  // Direct args: /config embedkey
  const sub = args[0]?.toLowerCase()
  if (sub === "embedkey") {
    await setEmbedKey()
    return
  }
  if (sub) { pushLine("Usage: /config [embedkey]", C.error); return }

  // ── Main config loop ──
  let running = true
  let mainIdx = 0 // 记住上次选中位置，改完一项回主菜单时恢复
  while (running) {
    // 每轮刷新——保存分支经 reloadConfig 替换了 agent.config 对象——回菜单显示新值
    ac = agent.config?.agent ?? {}
    ec = agent.config?.embedding ?? {}
    tc = agent.config?.traces ?? {}
    dc = agent.config?.diagnostics ?? {}
    const consultCount = (ac.consultModels ?? []).length
    const pl = ac.poolLimits ?? {}
    const cur = poolCur(pl, DEFAULTS)
    // §6.17 显示面（一处助手，四处共用）：数值 = compactThresholdResolved（缺场 ⇒ `(unavailable)`——
    // 链尾不产数、不回落任何默认数——回落 100000 会造一条 10% 假线；该支不可达，纯护栏）；
    // auto 旗 ⇒ 缀 ` (auto)`。写入数值 = 固定为显式阈值（保存回显明示）。
    const ctResolved = ac.compactThresholdResolved
    const ctDisplay = ctResolved === undefined ? "(unavailable)" : String(ctResolved)
    const ctSuffix = compactThresholdSuffix(ac.compactThresholdAuto)
    const mainEntries = [
      { type: "header", text: `proxy=${proxySummary()} | maxTurns=${ac.maxTurns ?? 200} | compactThreshold=${ctDisplay}${ctSuffix} | verifyGuard=${ac.verifyGuard === true ? "on" : "off"} | consult=${consultCount} model(s) | embedding=${agent.memory?.embedder ? "on" : "off"} | traces=${tc.enabled === false ? "off" : "on"}` },
      { type: "item", text: `agent.maxTurns = ${ac.maxTurns ?? 200}`, action: "agent.maxTurns" },
      { type: "item", text: `agent.subagentTurns = ${ac.subagentTurns ?? 100}`, action: "agent.subagentTurns" },
      { type: "item", text: `并发池 agent.poolLimits = engCoder ${cur("engCoder")} / other ${cur("other")} / advisor ${cur("advisor")}（async 分域上限）`, action: "pool" },
      { type: "item", text: `agent.compactThreshold = ${ctDisplay}${ctSuffix}`, action: "agent.compactThreshold" },
      { type: "item", text: `config.defaultModel = ${agent.config?.defaultModel ?? "(未设置 — 新会话起点)"}`, action: "defaultModel" },
      { type: "item", text: `agent.verifyGuard = ${ac.verifyGuard === true ? "on" : "off"}`, action: "agent.verifyGuard" },
      { type: "item", text: `traces.enabled = ${tc.enabled === false ? "off" : "on"}（轨迹存档——发布默认关——隐私）`, action: "traces.enabled" },
      { type: "item", text: `traces.retentionHours = ${tc.retentionHours ?? 24} h（超期文件启动时清理）`, action: "traces.retentionHours" },
      { type: "item", text: `diagnostics.heapSnapshot = ${dc.heapSnapshot === true ? "on" : "off"}（堆快照采集——默认关——桌面会话即时生效）`, action: "diagnostics.heapSnapshot" },
      { type: "item", text: `agent.injectProjectRules = ${ac.injectProjectRules !== false ? "on" : "off"}（项目指令注入——AGENTS.md / project_rules.md——默认开）`, action: "agent.injectProjectRules" },
      { type: "item", text: `agent.injectDocs = ${ac.injectDocs !== false ? "on" : "off"}（文档注入——相关文档自动检索——默认开）`, action: "agent.injectDocs" },
      { type: "item", text: `agent.injectMemories = ${ac.injectMemories !== false ? "on" : "off"}（记忆注入——往期相关记忆召回——默认开）`, action: "agent.injectMemories" },
      { type: "item", text: `agent.consultModels = ${consultCount} model(s)${consultCount ? ` (${(ac.consultModels ?? []).map((m) => m.provider + ":" + m.model).join(", ")})` : ""}`, action: "consult" },
      { type: "item", text: `agent.consultTurns = ${ac.consultTurns ?? 40}`, action: "agent.consultTurns" },
      { type: "item", text: `agent.consultTimeoutMs = ${Math.round((ac.consultTimeoutMs ?? 600000) / 60000)} min`, action: "agent.consultTimeoutMs" },
      { type: "item", text: "Set embedding API key", action: "embedkey" },
      { type: "item", text: `proxy = ${proxySummary()}`, action: "proxy" },
      { type: "item", text: "View full config", action: "view" },
    ]

    const choice = await showPicker("Config", mainEntries, { defaultIndex: mainIdx })
    if (!choice) { running = false; continue } // Esc
    mainIdx = Math.max(0, mainEntries.filter((e) => e.type === "item").indexOf(choice))

    if (choice.action === "view") {
      pushLabel("❯ Config", ansi.bold + C.tool)
      pushLine(`Session model: ${agent.activeProvider ? `${agent.activeProvider}:${agent.activeModel ?? ""}` : "(none)"}`, C.dim)
      pushLine(`defaultModel (config): ${agent.config?.defaultModel ?? "(not set — 新会话起点)"}`, C.dim)
      pushLine(`Key:    ${maskKey(agent.provider.apiKey)}`, C.dim)
      pushLine(`agent.maxTurns: ${ac.maxTurns ?? 200}`, C.dim)
      pushLine(`agent.subagentTurns: ${ac.subagentTurns ?? 100}`, C.dim)
      pushLine(`agent.compactThreshold: ${ctDisplay}${ctSuffix}`, C.dim)
      pushLine(`agent.verifyGuard: ${ac.verifyGuard === true ? "on" : "off"}`, C.dim)
      pushLine(`traces.enabled: ${tc.enabled === false ? "off" : "on"}（默认 off——发布隐私——本地分析可开）`, C.dim)
      pushLine(`traces.retentionHours: ${tc.retentionHours ?? 24}（超期文件启动清理——D-TR10）`, C.dim)
      pushLine(`diagnostics.heapSnapshot: ${dc.heapSnapshot === true ? "on" : "off"}（堆快照采集——默认关——桌面会话即时生效）`, C.dim)
      pushLine(`agent.injectProjectRules: ${ac.injectProjectRules !== false ? "on" : "off"}（项目指令注入——AGENTS.md / project_rules.md——默认开）`, C.dim)
      pushLine(`agent.injectDocs: ${ac.injectDocs !== false ? "on" : "off"}（文档注入——相关文档自动检索——默认开）`, C.dim)
      pushLine(`agent.injectMemories: ${ac.injectMemories !== false ? "on" : "off"}（记忆注入——往期相关记忆召回——默认开）`, C.dim)
      pushLine(`agent.consultModels: ${(ac.consultModels ?? []).map((m) => `${m.provider}:${m.model}${m.effort ? ` (${m.effort})` : ""}`).join(", ") || "(none)"}`, C.dim)
      pushLine(`agent.poolLimits: { engCoder: ${cur("engCoder")}, other: ${cur("other")}, advisor: ${cur("advisor")} }（async 分域上限——默认 4/4/4——agent.poolLimits 可配）`, C.dim)
      pushLine(`agent.consultTurns: ${ac.consultTurns ?? 40}`, C.dim)
      pushLine(`agent.consultTimeoutMs: ${Math.round((ac.consultTimeoutMs ?? 600000) / 60000)} min`, C.dim)
      pushLine(`embedding: ${agent.memory?.embedder ? `enabled (${ec.model ?? ""})` : "disabled (FTS only)"}`, C.dim)
      pushLine(`proxy: ${proxySummary()}`, C.dim)
      pushLine(`Config file: ${configPath}`, C.dim)
      continue // 回主菜单（Esc 退出）
    }

    if (choice.action === "proxy") {
      await proxyMenu()
      continue
    }

    if (choice.action === "consult") {
      await consultMenu()
      continue
    }

    if (choice.action === "pool") {
      await poolMenu()
      continue
    }

    if (choice.action === "defaultModel") {
      await defaultModelMenu()
      continue
    }

    if (choice.action === "embedkey") {
      await setEmbedKey() // 保存成功/取消都回主菜单（Esc 退出）
      continue
    }

    if (choice.action === "agent.verifyGuard") {
      const newVal = ac.verifyGuard !== true
      try {
        await saveProxy((raw) => {
          raw.agent ??= {}
          raw.agent.verifyGuard = newVal
        })
        pushLabel("❯ Config", ansi.bold + C.tool)
        pushLine(`agent.verifyGuard = ${newVal ? "on" : "off"}`, C.tool)
      } catch (error) { pushLine(`Save failed: ${error.message}`, C.error) }
      continue // 回主菜单（Esc 退出）
    }

    if (choice.action === "traces.enabled") {
      const newVal = tc.enabled === false // 显式写布尔（默认 off——DEFAULTS 合并后必有值）
      try {
        await saveProxy((raw) => {
          raw.traces = { ...(raw.traces ?? {}), enabled: newVal }
        })
        pushLabel("❯ Config", ansi.bold + C.tool)
        pushLine(`traces.enabled = ${newVal ? "on" : "off"}${newVal ? "（轨迹落盘 ~/.thincoder/traces/——保留 " + (tc.retentionHours ?? 24) + "h）" : ""}`, C.tool)
      } catch (error) { pushLine(`Save failed: ${error.message}`, C.error) }
      continue // 回主菜单（Esc 退出）
    }

    if (choice.action === "diagnostics.heapSnapshot") {
      const newVal = dc.heapSnapshot !== true // 显式写布尔（默认关——fail-closed 显示判定同向）
      try {
        await saveProxy((raw) => {
          raw.diagnostics = { ...(raw.diagnostics ?? {}), heapSnapshot: newVal }
        })
        pushLabel("❯ Config", ansi.bold + C.tool)
        pushLine(`diagnostics.heapSnapshot = ${newVal ? "on" : "off"}（桌面会话即时生效 ∕ 本进程下次启动）`, C.tool)
      } catch (error) { pushLine(`Save failed: ${error.message}`, C.error) }
      continue // 回主菜单（Esc 退出）
    }

    if (choice.action === "agent.injectProjectRules" || choice.action === "agent.injectDocs" || choice.action === "agent.injectMemories") {
      // 注入开关（PROMPT-SYSTEM.md §6.24 §6.27 · 台账 #1420 #1465）：判据 `!== false`（缺省 = 开）——三键共用一支；
      // 保存经 saveProxy（写盘 + reloadConfig 即热——下一次提示词组装生效，无「重启」注）。
      const key = choice.action.slice("agent.".length)
      const newVal = ac[key] === false // 现为关 ⇒ 写 true；现为开（含缺省）⇒ 写 false
      try {
        await saveProxy((raw) => {
          raw.agent ??= {}
          raw.agent[key] = newVal
        })
        pushLabel("❯ Config", ansi.bold + C.tool)
        pushLine(`${choice.action} = ${newVal ? "on" : "off"}（即热——下一次提示词组装生效）`, C.tool)
      } catch (error) { pushLine(`Save failed: ${error.message}`, C.error) }
      continue // 回主菜单（Esc 退出）
    }

    // Embedding model is fixed (BAAI/bge-m3, SiliconFlow) — no picker; it's over-engineering
    // to expose model choice when the vector index format assumes one embedding space.

    // Numeric config items
    const label = choice.action
    const isTimeout = label === "agent.consultTimeoutMs"
    const isCompact = label === "agent.compactThreshold"
    const current = label === "agent.maxTurns" ? (ac.maxTurns ?? 200)
      : label === "agent.subagentTurns" ? (ac.subagentTurns ?? 100)
      // §6.17 编辑初值 = 同一数值（resolved 缺场 ⇒ 留空——不预填任何默认数）
      : label === "agent.compactThreshold" ? (ctResolved ?? "")
      : label === "agent.consultTurns" ? (ac.consultTurns ?? 40)
      : label === "traces.retentionHours" ? (tc.retentionHours ?? 24)
      : isTimeout ? Math.round((ac.consultTimeoutMs ?? 600000) / 60000)
      : ""
    // §6.17 提问行后缀（两档互斥文案）：compact 项按 auto 旗二选一，非 compact 项传 null ⇒ 空串
    // （台账 `#1679`——auto 档学「数值会锁死派生线」、显式档学「怎么回 auto」）。
    const hint = compactThresholdHint(isCompact ? ac.compactThresholdAuto === true : null)
    const val = await askQuestion(`${label} (current: ${current}${isTimeout ? " min" : ""}${hint}):`)
    if (!val) continue
    // §6.17 写回面：输入 auto（大小写不敏感、去首尾空白）⇒ 删键回 auto（仅 `agent.compactThreshold`
    // 认该形；其余数值项照旧走数值判，空输入仍 = 取消）。
    if (isCompact && String(val).trim().toLowerCase() === "auto") {
      try {
        await saveProxy((raw) => { if (raw.agent) delete raw.agent.compactThreshold })
        pushLabel("❯ Config", ansi.bold + C.tool)
        pushLine("agent.compactThreshold = (auto)（键已删除——压缩线按在用模型的窗口每轮现算）", C.tool)
      } catch (error) { pushLine(`Save failed: ${error.message}`, C.error) }
      continue
    }
    try {
      const num = Number(val)
      if (isNaN(num)) {
        // 报错行射程：`auto` 子句仅 `agent.compactThreshold` 一项，其余数值项文案不变（R13）
        pushLine(isCompact ? `Value must be a number (or "auto" to clear the explicit override)` : "Value must be a number", C.error)
        continue
      }
      const stored = isTimeout ? Math.round(num * 60000) : num
      await saveProxy((raw) => {
        const keys = label.split(".")
        let obj = raw
        for (let i = 0; i < keys.length - 1; i++) { obj[keys[i]] ??= {}; obj = obj[keys[i]] }
        obj[keys[keys.length - 1]] = stored
      })
      pushLabel("❯ Config", ansi.bold + C.tool)
      pushLine(`${label} = ${isTimeout ? `${val} min (${stored} ms)` : val}`, C.tool)
      if (isCompact) pushLine("显式阈值——auto 派生线不再生效（压缩线改按该显式值判定）", C.dim)
      pushLine("(restart to apply)", C.dim)
    } catch (error) { pushLine(`Save failed: ${error.message}`, C.error) }
    // 回主菜单（Esc 退出）——数值输入 Enter 空值也已 continue 于此
  }
}
