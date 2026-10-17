/**
 * ipc-registry.mjs — 通道注册表族（`docs/desktop/design/IPC.md` §2「唯一入册面」）：**六十七项** = 
 * 白名单逐项 → 处理体映射（`HANDLERS` 表）+ 注册序（`registerIpcHandlers`）——**#28 拆点出档**
 * （B1 批三新 —— 团队族 `team:status` ∥ `team:login` ∥ `team:logout`；登录面补全批一增 —— `team:verify`；转口档 `src/main/team.mjs`）
 * （批档 §2.5「通道注册表族出档」；纯搬零语义改 —— 表 ∕ 注册 ∕ 定序逐行沿出档前 `ipc.mjs`）。
 *
 * 单源与纪律（沿出档前同判）：
 * - 白名单**单源** = `src/preload/preload.cjs` 的 `CHANNELS`（批档 §2.6 D-3）：本档经 `ipc.mjs` 转口
 *   读取**并据以注册**（一条白名单项 = 一个 `ipcMain.handle` 面 ⇒ 无通道名第二副本）；白名单项无处理体
 *   ⇒ 注册期抛（fail-closed）。
 * - 处理体本体 = `ipc.mjs`（核心面）+ 转口群出档 `ipc-relays.mjs`（#685 —— 两源 import；本档只持映射 ∕ 注册序）；
 *   跨档引用面 = 两档表位处 `export { … }` 列。
 * - `channels` 读数口径 = 本次运行**实际分发集合**（顺序去重 —— 批档 §2.11 收正⑦）。
 */
import { BrowserWindow, ipcMain } from "electron"
import { imageRead } from "./attachments.mjs"
import {
  CHANNELS, ipcStats,
  readConfig, openProjectChannel, recentProjects, sessionList, sessionCatalog, sessionCreate, sessionSwitch,
  sessionRename, sessionDelete, sessionResume, approvalRespond, historyPage, msgSend, msgInterrupt,
  questionRespond, sessionPrefs, subagentStop, fileOpen, sessionFlags, atComplete, recordAppend, themeState, shellOpenPath, menuPopup, windowControl, sessionArchive, sessionUnarchive, sessionArchived, sessionOpenWindow,
  panelState,
  sessionGc, sessionIndex, usageStatsChannel, sessionExportChannel,
} from "./ipc.mjs"
/** 转口群（#685 拆档）：二十四项设置族 ∕ 索引数据面 / 台账相位 / 配置写 —— 出档 `ipc-relays.mjs`（表行逐字不动）。 */
import {
  providerListChannel, providerSaveChannel, providerRemoveChannel, providerVerifyChannel, modelListChannel,
  providerSetKeyChannel, providerDelKeyChannel, providerModelsChannel, providerSetProxyChannel, providerSetContextChannel, modelCatalogChannel,
  modelSpecChannel, modelSpecSaveChannel, modelSpecResetChannel,
  settingsAgentChannel, mcpListChannel, mcpSaveChannel, mcpRemoveChannel, configWriteChannel, ledgerReadChannel,
  batchStatusChannel, indexBuild, indexStatusChannel, settingsEnvChannel, settingsToolsChannel, mcpToolsChannel,
  mcpUpdateChannel, mcpReconnectChannel,
} from "./ipc-relays.mjs"
/** 团队族四通道处理体（B1 批；登录面补全批增 `team:verify`）：核 `thincoder-core/team.mjs` 转口 —— 出档 `src/main/team.mjs`（表行逐字为映射）。 */
import { teamLoginChannel, teamLogoutChannel, teamStatusChannel, teamVerifyChannel } from "./team.mjs"

/** 通道 → 处理体（新增行即新增白名单项，两处同时动）。 */
const HANDLERS = Object.freeze({
  "config:read": readConfig,
  "project:open": openProjectChannel,
  "project:recent": recentProjects,
  "sessions:list": sessionList,
  "sessions:catalog": sessionCatalog,
  "session:create": sessionCreate,
  "session:switch": sessionSwitch,
  "session:rename": sessionRename,
  "session:delete": sessionDelete,
  "session:archive": sessionArchive,
  "session:openWindow": sessionOpenWindow,
  "session:unarchive": sessionUnarchive,
  "sessions:archived": sessionArchived,
  "session:resume": sessionResume,
  "approval:respond": approvalRespond,
  "history:page": historyPage,
  "msg:send": msgSend,
  "msg:interrupt": msgInterrupt,
  "provider:list": providerListChannel,
  "provider:save": providerSaveChannel,
  "provider:remove": providerRemoveChannel,
  "provider:verify": providerVerifyChannel,
  "provider:setKey": providerSetKeyChannel,
  "provider:delKey": providerDelKeyChannel,
  "provider:models": providerModelsChannel,
  "provider:setProxy": providerSetProxyChannel,
  "provider:setContext": providerSetContextChannel,
  "model:list": modelListChannel,
  "model:catalog": modelCatalogChannel,
  "model:spec": modelSpecChannel,
  "model:specSave": modelSpecSaveChannel,
  "model:specReset": modelSpecResetChannel,
  "settings:agent": settingsAgentChannel,
  "mcp:list": mcpListChannel,
  "mcp:save": mcpSaveChannel,
  "mcp:remove": mcpRemoveChannel,
  "config:write": configWriteChannel,
  "ledger:read": ledgerReadChannel,
  "batch:status": batchStatusChannel,
  "question:respond": questionRespond,
  "session:prefs": sessionPrefs,
  "subagent:stop": subagentStop,
  "file:open": fileOpen,
  "image:read": imageRead,
  "shell:openPath": shellOpenPath,
  "menu:popup": menuPopup,
  "window:control": windowControl,
  "session:flags": sessionFlags,
  "at:complete": atComplete,
  "session:gc": sessionGc,
  "session:index": sessionIndex,
  "usage:stats": usageStatsChannel,
  "session:export": sessionExportChannel,
  "index:build": indexBuild,
  "index:status": indexStatusChannel,
  "settings:env": settingsEnvChannel,
  "settings:tools": settingsToolsChannel,
  "mcp:tools": mcpToolsChannel,
  "mcp:update": mcpUpdateChannel,
  "mcp:reconnect": mcpReconnectChannel,
  "record:append": recordAppend,
  "theme:state": themeState,
  "panel:state": panelState,
  "team:status": teamStatusChannel,
  "team:login": teamLoginChannel,
  "team:logout": teamLogoutChannel,
  "team:verify": teamVerifyChannel,
})

/** 按白名单逐项注册（白名单项无处理体 ⇒ 抛——装配期即知，不静默）。 */
export function registerIpcHandlers() {
  for (const channel of CHANNELS) {
    const handler = HANDLERS[channel]
    if (typeof handler !== "function") throw new Error(`[ipc] whitelisted channel without handler: ${channel}`)
    ipcMain.handle(channel, (_event, payload) => {
      if (!ipcStats.channels.includes(channel)) ipcStats.channels.push(channel)
      // 发起窗上下文（会话窗批 · 2026-10-13）：多窗口后，窗口族动作（window:control）必须作用于
      // **发起窗**而非 `activeWin`（主窗）——会话窗点 ✕ 曾关掉主窗（用户实测）。其余处理体忽略第二参。
      const senderWindow = BrowserWindow.fromWebContents(_event.sender)
      return handler(payload, { senderWindow })
    })
  }
}
