#!/usr/bin/env node
/**
 * thincoder-server.mjs — 服务入口（ops/OPS.md §4）：argv（`--config`）→ 配置加载/校验 → 开库/迁移 →
 * 首启引导（种子导入 ∥ 注册表构建——§1）→ **保留清理（用量 + 审计事件——启动一次 + 24h 周期——`metering/METERING.md` §1 ∥
 * `accounts/ACCOUNTS.md` §2.1）** → 路由注册（含系统面 ∥ 控制台数据面——`gateway/API.md` §2.3 ∥ §2.4）→ `node:http` 监听 → 就绪日志（含 `version`——§5.4(g)）；
 * **沙盒执行面装配（盒 ticker 30s ∥ DNS 闸 UDP 53——`sandbox/EXECUTION.md` §3 ∥ §6）**；SIGINT/SIGTERM ⇒
 * 优雅停机（清周期定时器（更新循环 ∥ 保留清理 ∥ 盒 ticker——§4 同法） ∥ DNS 闸解绑 ∥ 停收新连 ∥ 关库）；更新循环接线（自检/自升——§5.4(a)(c)：
 * 自升成功亦走停机路径——`signal: "self-update"`）。
 *
 * 本档 = 装配面（配置 ∥ 库 ∥ 首启引导 ∥ 各域注册行 + 系统面 + 控制台数据面）——D1 骨架 + D2 账号/计量面 + D3 聊天链
 * （bootstrap + gateway ∥ accounts ∥ metering 注册行）+ D4 webui 静态面（`public/` 直发——路由优先）+ D5 更新面。
 */
import { realpathSync } from "node:fs"
import { pathToFileURL } from "node:url"

import { loadConfig } from "../src/ops/config.mjs"
import { createLogger } from "../src/ops/log.mjs"
import { createUpdater, readPackageVersion } from "../src/ops/update.mjs"
import { openDatabase } from "../src/store/db.mjs"
import { createGatewayServer, createRouteTable } from "../src/gateway/server.mjs"
import { registerGatewayRoutes } from "../src/gateway/routes.mjs"
import { registerProviderAdminRoutes } from "../src/gateway/provider-admin.mjs"
import { registerSystemRoutes } from "../src/gateway/system.mjs"
import { registerEmbeddingAdminRoutes } from "../src/gateway/embedding-admin.mjs"
import { registerConfigAdminRoutes } from "../src/gateway/config-admin.mjs"
import { registerOverviewRoutes } from "../src/gateway/overview.mjs"
import { registerProxyAdminRoutes } from "../src/gateway/proxy-admin.mjs"
import { registerSandboxRoutes } from "../src/sandbox/routes.mjs"
import { createTerminalHub } from "../src/sandbox/terminal-routes.mjs"
import { createDnsGate } from "../src/sandbox/dns-gate.mjs"
import { createHostExec, TICK_INTERVAL_MS, tickBoxes } from "../src/sandbox/box.mjs"
import { registerRegistryCredRoutes } from "../src/sandbox/registry-cred-routes.mjs"
import { registerImageSourceRoutes } from "../src/sandbox/image-source-routes.mjs"
import { registerChatRoutes } from "../src/agent/chat-routes.mjs"
import { closeMcpConnections } from "../src/mcp/face.mjs"
import { registerMcpRoutes } from "../src/mcp/routes.mjs"
import { registerMemberFaceRoutes } from "../src/agent/member-routes.mjs"
import { registerProjectRoutes } from "../src/project/routes.mjs"
import { registerProjectAdminRoutes } from "../src/project/admin-routes.mjs"
import { registerProjectWebhookRoutes } from "../src/project/webhooks.mjs"
import { registerLedgerRoutes } from "../src/ledger/routes.mjs"
import { registerClientLedgerRoutes } from "../src/ledger/client-routes.mjs"
import { createSyncScheduler } from "../src/project/sync.mjs"
import { ensureBootstrap, findMemberByUsername } from "../src/accounts/members.mjs"
import { createLoginGuard } from "../src/accounts/login-guard.mjs"
import { pruneAuditEvents, recordAudit } from "../src/accounts/audit.mjs"
import { registerAccountRoutes } from "../src/accounts/routes.mjs"
import { registerAdminRoutes } from "../src/accounts/routes-admin.mjs"
import { registerClientRoutes } from "../src/client/routes.mjs"
import { registerMeteringRoutes } from "../src/metering/routes.mjs"
import { USAGE_PRUNE_INTERVAL_MS, pruneUsage } from "../src/metering/usage.mjs"
import { createStaticSite } from "../src/webui/static.mjs"

export const USAGE = "用法：thincoder-server --config <配置档>"

/** argv 解析：`--config <档>` 必填（并列形式 `--config=<档>`）；未知参数 ⇒ 抛。 */
export function parseArgs(argv) {
  let configPath = null
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === "--config") configPath = argv[++i] ?? null
    else if (arg.startsWith("--config=")) configPath = arg.slice("--config=".length)
    else throw new Error(`未知参数：${arg}\n${USAGE}`)
  }
  if (!configPath) throw new Error(`缺少 --config\n${USAGE}`)
  return { configPath }
}

/** 优雅停机：停收新连（空闲连接即断）⇒ 在途请求完成后关库；`graceMs` 超时 ⇒ 强制断连（防流式长连无限拖停）。 */
export function closeApp({ server, db, log, graceMs = 10000 }) {
  return new Promise((resolve) => {
    let timer = null
    server.close(() => {
      if (timer) clearTimeout(timer)
      try {
        db.close()
      } catch (e) {
        log?.warn("db_close_failed", { message: e.message })
      }
      resolve()
    })
    server.closeIdleConnections()
    timer = setTimeout(() => {
      log?.warn("shutdown_forced", { graceMs })
      server.closeAllConnections()
    }, graceMs)
    timer.unref()
  })
}

/** 入口主流程：装配 → 监听 → 信号接线 + 更新循环；启动失败 ⇒ 明确报错 + 非零退出（fail-closed）。
 *  `update` = 更新器覆盖参数（单元测试档替身——缺省 `{}` ⇒ 生产行为不变；§5.4(c) 注入口径）。 */
export async function run(argv = process.argv.slice(2), log = createLogger(), { update = {} } = {}) {
  let db = null
  let app = null
  let updater = null
  let pruneTimer = null
  let projectSync = null
  let terminalHub = null
  let dnsGate = null
  let boxTicker = null
  let stopping = false
  /** 优雅停机：清周期定时器（更新循环 ∥ 保留清理同法——§4；自升成功亦走本路径）⇒ 停收新连 ⇒ 关库。 */
  const stop = (signal) => {
    if (stopping) return
    stopping = true
    updater?.stop()
    if (pruneTimer) {
      clearInterval(pruneTimer)
      pruneTimer = null
    }
    if (boxTicker) {
      clearInterval(boxTicker)
      boxTicker = null
    }
    projectSync?.stop()
    terminalHub?.closeAll("server_stop") // 终端在飞会话全收口（升级 socket 不走 HTTP 层自动断——§3 停机行）
    dnsGate?.stop() // UDP 53 解绑（`sandbox/EXECUTION.md` §6——持答随停丢弃，客户端重问即重判）
    closeMcpConnections({ log }) // MCP 面收口（§2.2——stdio 子进程（POSIX detached）不随父进程自然退出，须显式杀树；核件缺 ⇒ 零会话可关）
    log.info("shutdown", { signal })
    closeApp({ ...app, log }).then(() => {
      log.info("stopped")
      process.exitCode = 0
    })
  }
  try {
    const { configPath } = parseArgs(argv)
    const { config, warnings, configPath: configFile } = loadConfig(configPath)
    for (const warning of warnings) log.warn("config_warning", { message: warning })
    db = openDatabase(config.db)
    const bootstrap = await ensureBootstrap(db, config.bootstrap) // 首启引导（KD-SV-15——幂等）
    if (bootstrap.action === "created") log.info("bootstrap_admin_created", { username: bootstrap.username })
    else if (bootstrap.action === "warning") {
      log.warn("bootstrap_warning", {
        reason: bootstrap.reason,
        message: bootstrap.message ?? "零 admin 且未配置 bootstrap——可用 CLI「member add <name> --role admin」补建",
      })
    }
    // 保留清理（启动一次 + 24h 周期；定时器 unref——不阻停机）：用量（METERING §1）+ 审计事件（ACCOUNTS §2.1——同窗同清）
    pruneUsage(db, { retentionDays: config.usageRetentionDays })
    pruneAuditEvents(db, { retentionDays: config.usageRetentionDays })
    pruneTimer = setInterval(() => {
      try {
        pruneUsage(db, { retentionDays: config.usageRetentionDays })
      } catch (e) {
        log.warn("usage_prune_failed", { message: e.message }) // 周期清理失败不反噬服务（启动一次 = fail-closed）
      }
      try {
        pruneAuditEvents(db, { retentionDays: config.usageRetentionDays })
      } catch (e) {
        log.warn("audit_prune_failed", { message: e.message }) // 同口径（独立捕获——互不拖累）
      }
    }, USAGE_PRUNE_INTERVAL_MS)
    pruneTimer.unref?.()
    const version = readPackageVersion() // 前缀内实际安装版本（升级核对 = 重起读 ready 行——§5.4(g)；系统面同源）
    // 登录防爆破（ACCOUNTS §2——自助/管理两注册面共用同一实例）；锁触发 ⇒ 经 onLock 回调落审计（§2.1——装配接线 = 本处）
    const loginGuard = createLoginGuard({
      log,
      onLock: (info) => recordAudit(db, {
        type: "login_locked",
        actor: info.username, // 提交用户名（名快照——§2.1 表）
        actorId: findMemberByUsername(db, info.username)?.id ?? null, // 成员存在 ⇒ 其 id（同 login_failure 口径）
        target: "",
        targetId: null,
        detail: { ip: info.ip, dimension: info.dimension, retryAfterS: info.retryAfterS },
      }),
    })
    const routes = createRouteTable()
    // D3 面：/v1/chat/completions ∥ /v1/models（团队 key 鉴权）；provider 运行时引导（种子导入 → 构建——OPS §1）
    const providerRuntime = registerGatewayRoutes(routes, { db, config, log })
    registerProviderAdminRoutes(routes, { db, config, runtime: providerRuntime, log }) // provider 管理面（同实例——换表两族同见）
    registerAccountRoutes(routes, { db, guard: loginGuard }) // D2 面：login ∥ logout ∥ me ∥ me/password ∥ me/keys/rotate
    registerAdminRoutes(routes, { db, guard: loginGuard })   // D2 面：members 列表/建 ∥ 吊销 ∥ 重置
    registerClientRoutes(routes, { db, guard: loginGuard })  // client 域（B1 批）：/api/client/login ∥ logout ∥ me（token 即成员 key——KD-SV-61/62）
    registerMeteringRoutes(routes, { db }) // D2 面：用量查询 ∥ 设额度
    // 系统面（gateway/API.md §2.3——首版完备化①③）：/healthz 探活 ∥ /api/system（惰性状态访问器——更新器在其后创建；embedding.model = 运行时 accessor`engineModel()`——#1152 ∥ 地址不下发）
    registerSystemRoutes(routes, { db, version, getUpdateStatus: () => updater?.getStatus() ?? null, embedding: config.embedding, providerRuntime }) // #1152：embedding 缺配判据 = 运行时 accessor（`engineModel()`——与派发面同源；`embedding` 段 = 替身回落）
    // 控制台数据面（gateway/API.md §2.4——功能点 15①③）：/api/overview（总览——与报表同源）∥ /api/admin/embedding（+test——配置真值 ∥ 探活/试跑）
    registerOverviewRoutes(routes, { db })
    registerEmbeddingAdminRoutes(routes, { db, config, log })
    registerConfigAdminRoutes(routes, { db, configPath: configFile, log }) // 配置面（§2.4——文件面读写；生效 = 重启——KD-SV-56）
    registerProxyAdminRoutes(routes, { db, log }) // 代理连通测试（§2.4——真打 ∥ 自含形；零落库零计费——KD-SV-60）
    // 沙盒面（§2.5/§2.6——server-exec-sandbox 批）：控制台 ∥ 成员面 + runner 通道（无 runner ⇒ 仅沙盒功能面不可用——KD-SV-71）
    // DNS 闸（sandbox/EXECUTION.md §6——server 进程内 UDP 53 应答器）：建盒网段登记 + 待批裁定回填（经路由族注入）；起停随 server 生命周期
    const hostExec = createHostExec({ config }) // 节点主机命令面（DNS 放行前的同步补下发——SSH 逐条；与路由族各自实例同法）
    dnsGate = createDnsGate({ db, config, log, execOf: (row) => hostExec.execOf(row) })
    registerSandboxRoutes(routes, { db, config, log, deps: { dnsGate } })
    registerRegistryCredRoutes(routes, { db, config }) // 私有仓凭据四端点（gateway/API.md §2.5 凭据四行——底座可换增补；KD-SV-188）
    registerImageSourceRoutes(routes, { db }) // 镜像源族（gateway/API.md §2.5 镜像源七行——sandbox-image-sources 批）
    // 管理面 chat 出口自环取数（§16.2——管理会话出口 = 本进程网关链 loopback）：惰性读监听地址（listen 后才有值；
    // 列名 = `selfBaseUrl`——取数器返回 `server.address()` 原形，通配/环回换算归 `chat.mjs` `selfBaseOf`）
    let serverRef = null
    registerMcpRoutes(routes, { db, config, log }) // MCP 管理面（gateway/API.md §2.13——server-mcp 批）：清单四端点 + 探活（自含状态）；工具面挂载 = 管理会话（§2.2）
    registerChatRoutes(routes, { db, log, deps: { runtime: providerRuntime, config, guard: loginGuard, selfBaseUrl: () => serverRef?.address() ?? null } }) // 管理面 agent 会话面（gateway/API.md §2.8——六端点 + 重启恢复钩）
    registerMemberFaceRoutes(routes, { db, config, log }) // 成员面 chat（gateway/API.md §2.11/§2.12——member-face-chat 批）：成员会话中转（relay 内存态）+ 工作区写面 + git 凭据 + 盒接入面
    // 项目面（gateway/API.md §2.9——team-projects-permissions 批）：成员面六 ∥ 管理面十 ∥ 接收面一（公开——验签门）；
    // 调度器单例（三径共锁——手动 ∥ 定时 ∥ 事件；周期 60s）
    projectSync = createSyncScheduler({ db, config, log })
    registerProjectRoutes(routes, { db })
    registerProjectAdminRoutes(routes, { db, config, log, scheduler: projectSync })
    registerProjectWebhookRoutes(routes, { db, config, log, scheduler: projectSync })
    projectSync.start()
    // 团队台账域（gateway/API.md §2.10——team-ledger 批）：控制台四行（会话 + 能力矩阵）∥ 端侧四行（Bearer）——同一域模块的薄适配两面
    registerLedgerRoutes(routes, { db })
    registerClientLedgerRoutes(routes, { db })
    // D4 面：webui 静态面（`public/` 直发——注册路由优先；`/v1/*` ∥ `/api/*` 不走静态面）
    // 容器终端升级路（gateway/API.md §2.5 终端行 ∥ sandbox/SANDBOX.md §3——sandbox-container-terminal 批）：hub 持有在飞会话 + upgrade 挂点接线
    terminalHub = createTerminalHub({ db, config, log }) // config = 连接材料解密所需（TLS 档节点——`sandbox/SANDBOX.md` §3「生效面全谱」含终端；缺它 ⇒ 解密退相对路径）
    const server = createGatewayServer({ config, routes, log, staticSite: createStaticSite(), upgrade: terminalHub.handleUpgrade })
    serverRef = server // 自环取数接点（§16.2——路由注册时惰性闭包，此处落真值）
    app = { server, db }
    await new Promise((resolve, reject) => {
      server.once("error", reject)
      server.listen(config.port, config.host, resolve)
    })
    log.info("ready", { host: config.host, port: config.port, db: config.db, routes: routes.size, version })
    // 盒 ticker（sandbox/EXECUTION.md §3——30s 节拍：空闲/墙钟停 + 周期快照；unref——不阻停机）
    boxTicker = setInterval(() => void tickBoxes(db, { config, log, host: hostExec }).catch((e) => log.warn("box_tick_failed", { message: e?.message ?? String(e) })), TICK_INTERVAL_MS) // host 注入 = 临时集到点重算（§6 ④ 步）与停/快照链 host 侧件所需（缺它 ⇒ `execOf` 恒 null——生产未接线）
    boxTicker.unref?.()
    // DNS 闸启动（§6——UDP 53）：绑定失败 ⇒ error 事件如实落日志（不吞）；闸非强制点（强制点 = nft）⇒ 不阻服务
    dnsGate.start().once("error", (e) => log.error("dns_gate_bind_failed", { port: dnsGate.port, code: e?.code ?? null, message: e?.message ?? String(e) }))
    updater = createUpdater({ config, log, version, onSelfUpdate: () => stop("self-update"), ...update })
    updater.start() // 启动即检一次 + 周期（档位 = config.autoUpdate——false ⇒ 零检查）
  } catch (e) {
    try {
      app?.server?.close() // 监听已起（后置装配失败）⇒ 一并回收——防「能收连接但库已关」半挂态
    } catch {
      /* 启动失败路径的清理——原始错误优先 */
    }
    if (boxTicker) {
      clearInterval(boxTicker)
      boxTicker = null
    }
    dnsGate?.stop() // UDP 53 解绑（已起者）——防启动中途失败后套接字句柄挂住进程
    try {
      db?.close()
    } catch {
      /* 启动失败路径的清理——原始错误优先 */
    }
    log.error("startup_failed", { message: e.message })
    process.exitCode = 1
    return
  }
  process.on("SIGINT", () => stop("SIGINT"))
  process.on("SIGTERM", () => stop("SIGTERM"))
}

// 入口判据：argv[1] 先经 realpath 解析再比——npm 全局装（POSIX）bin = 符号链接形：argv[1] 非真身路径，不解析 ⇒ 判据恒假 ⇒ 静默退出 0；不可解析 ⇒ 抛（显式，不静默）。
if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) await run()
