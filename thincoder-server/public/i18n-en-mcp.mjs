/**
 * i18n-en-mcp.mjs — 控制台文案表·English·MCP 族（webui/MCP.md §3——KD-SV-51 拆表；server-mcp 批 · 台账 #1379）：
 * 域界 = 键二级前缀（`admin.mcp.*`）；门面 = `i18n-en.mjs`（九部件展开合体 + `Object.freeze`——`EN` 导出名不变）。
 * 键族 = 页题/表头五列/三钮/探活三态/空错态/增改弹窗（三传输字段 ∥ 秘密零回填提示与清除勾）/删除确认/flash 两键；键序 = 页内相对序。
 * 本档 = en 族（零 CJK——零 CJK 机检口径 `webui/I18N.md` §4 AC-14：扫描面按前缀排除 `i18n-zh*` ∥ `i18n-en*`）。
 */
export const EN_MCP = Object.freeze({
  // ── Admin · MCP (page / table / inline readout — webui/MCP.md §2.1) ──────────
  "admin.mcp.title": "MCP servers",
  "admin.mcp.add": "Add",
  "admin.mcp.colName": "Name",
  "admin.mcp.colTransport": "Transport",
  "admin.mcp.colTarget": "Target",
  "admin.mcp.colEnabled": "Enabled",
  "admin.mcp.colActions": "Actions",
  "admin.mcp.probe": "Probe",
  "admin.mcp.edit": "Edit",
  "admin.mcp.remove": "Delete",
  "admin.mcp.empty": "Add an MCP server to give the admin chat its tools (e.g. web search).",
  "admin.mcp.loadFailed": "Failed to load MCP servers",

  // ── Probe three states (readout mirrors CLI `/mcp test` — mcp/MCP.md §3.3) ───
  "admin.mcp.probeRunning": "Probing…",
  "admin.mcp.probeOk": "✓ {toolCount} tools, {latencyMs}ms",
  "admin.mcp.probeOkNamed": "✓ {toolCount} tools: {tools}, {latencyMs}ms",
  "admin.mcp.probeFail": "✗ {error}",

  // ── Add / edit modal (one form, two states — transport field groups switch) ──
  "admin.mcp.addTitle": "Add MCP server",
  "admin.mcp.editTitle": "Edit MCP server",
  "admin.mcp.name": "Name",
  "admin.mcp.namePh": "Unique name (e.g. web)",
  "admin.mcp.transport": "Transport",
  "admin.mcp.command": "Command",
  "admin.mcp.commandPh": "e.g. npx",
  "admin.mcp.args": "Arguments (one per line)",
  "admin.mcp.env": "Environment (KEY=VALUE, one per line)",
  "admin.mcp.url": "Address",
  "admin.mcp.urlPh": "e.g. http://127.0.0.1:3000/mcp",
  "admin.mcp.wsUrlPh": "e.g. ws://127.0.0.1:3000/mcp",
  "admin.mcp.headers": "Headers (KEY=VALUE, one per line)",
  "admin.mcp.token": "Token",
  "admin.mcp.enabled": "Enabled",
  "admin.mcp.test": "Test",
  "admin.mcp.secretSaved": "Credentials saved — leave blank to keep",
  "admin.mcp.clearSecret": "Clear saved credentials",
  "admin.mcp.nameRequired": "Name is required",
  "admin.mcp.kvInvalid": "Each line must be KEY=VALUE",

  // ── Delete confirm / flash (two keys) ────────────────────────────────────────
  "admin.mcp.saved": "Saved: {name}",
  "admin.mcp.deleted": "Deleted: {name}",
  "admin.mcp.deleteTitle": "Delete MCP server",
  "admin.mcp.deleteConfirm": "After deleting \"{name}\", its tools will no longer be available to the admin chat.",
  "admin.mcp.deleteSubmit": "Delete",
})
