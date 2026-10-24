/**
 * i18n-zh-mcp.mjs — 控制台文案表·中文·MCP 族（webui/MCP.md §3——KD-SV-51 拆表；server-mcp 批 · 台账 #1379）：
 * 域界 = 键二级前缀（`admin.mcp.*`）；门面 = `i18n-zh.mjs`（九部件展开合体 + `Object.freeze`——`ZH` 导出名不变）。
 * 键族 = 页题/表头五列/三钮/探活三态/空错态/增改弹窗（三传输字段 ∥ 秘密零回填提示与清除勾）/删除确认/flash 两键；键序 = 页内相对序。
 * 本档 = zh 族（唯一 CJK 载体——零 CJK 机检口径 `webui/I18N.md` §4 AC-14：扫描面按前缀排除 `i18n-zh*` ∥ `i18n-en*`）。
 */
export const ZH_MCP = Object.freeze({
  // ── 管理·MCP（页 ∥ 表 ∥ 行内读数——webui/MCP.md §2.1） ────────────────────────
  "admin.mcp.title": "MCP 服务器",
  "admin.mcp.add": "添加",
  "admin.mcp.colName": "名称",
  "admin.mcp.colTransport": "传输",
  "admin.mcp.colTarget": "目标",
  "admin.mcp.colEnabled": "启用",
  "admin.mcp.colActions": "操作",
  "admin.mcp.probe": "探活",
  "admin.mcp.edit": "改",
  "admin.mcp.remove": "删",
  "admin.mcp.empty": "添加 MCP 服务器后，管理会话将获得其工具（如 web 搜索）",
  "admin.mcp.loadFailed": "MCP 服务器清单加载失败",

  // ── 探活三态（读数形对位 CLI `/mcp test`——`mcp/MCP.md` §3.3） ─────────────────
  "admin.mcp.probeRunning": "探活中……",
  "admin.mcp.probeOk": "✓ {toolCount} 个工具，{latencyMs}ms",
  "admin.mcp.probeOkNamed": "✓ {toolCount} 个工具：{tools}，{latencyMs}ms",
  "admin.mcp.probeFail": "✗ {error}",

  // ── 增/改弹窗（同窗体两态——三传输字段组切换 ∥ 秘密零回填） ─────────────────────
  "admin.mcp.addTitle": "添加 MCP 服务器",
  "admin.mcp.editTitle": "编辑 MCP 服务器",
  "admin.mcp.name": "名称",
  "admin.mcp.namePh": "唯一名称（如 web）",
  "admin.mcp.transport": "传输方式",
  "admin.mcp.command": "命令",
  "admin.mcp.commandPh": "如 npx",
  "admin.mcp.args": "参数（每行一条）",
  "admin.mcp.env": "环境变量（KEY=VALUE，每行一条）",
  "admin.mcp.url": "地址",
  "admin.mcp.urlPh": "如 http://127.0.0.1:3000/mcp",
  "admin.mcp.wsUrlPh": "如 ws://127.0.0.1:3000/mcp",
  "admin.mcp.headers": "请求头（KEY=VALUE，每行一条）",
  "admin.mcp.token": "令牌",
  "admin.mcp.enabled": "启用",
  "admin.mcp.test": "测试",
  "admin.mcp.secretSaved": "已保存凭据——留空 = 不变",
  "admin.mcp.clearSecret": "清除已保存凭据",
  "admin.mcp.nameRequired": "名称不可为空",
  "admin.mcp.kvInvalid": "每行须为 KEY=VALUE 形",

  // ── 删除确认 ∥ flash（两键） ─────────────────────────────────────────────────
  "admin.mcp.saved": "已保存：{name}",
  "admin.mcp.deleted": "已删除：{name}",
  "admin.mcp.deleteTitle": "删除 MCP 服务器",
  "admin.mcp.deleteConfirm": "删除「{name}」后，该服务器的工具将不再对管理会话可用。",
  "admin.mcp.deleteSubmit": "删除",
})
