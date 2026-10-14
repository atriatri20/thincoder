/**
 * i18n-zh.mjs — 控制台文案表·中文（webui/I18N.md §2.1——KD-SV-26 ∥ 聚合门面 KD-SV-51——2026-10-08 结构轮拆表 ∥ 2026-10-11 沙盒族再拆（#1270）∥ 2026-10-12 项目族新增（B2）∥ 2026-10-13 台账族新增（team-ledger 批）∥ 2026-10-13 MCP 族新增（server-mcp 批））：九部件
 * 展开合体 + `Object.freeze`——`ZH` 导出名不变（`i18n.mjs` 与门禁断言件取件面零改）；部件 = `i18n-zh-{shell,me,admin,sandbox,system,core,project,ledger,mcp}.mjs`
 * （域界 = 键首段前缀——`.one` 变体随基键；`admin.sandbox.*`/`me.projects.*`/`admin.projects.*`/`admin.gitSources.*`/`me.ledger.*` 族域界 = 键二级前缀（#1270 ∥ B2 ∥ team-ledger 批）；core = 核件发射键面（console-chat-align 批）；键序 = 原档相对序）。本档 = zh 族（唯一 CJK 载体——零 CJK 机检口径 §6 AC-14：
 * 扫描面按前缀排除 `i18n-zh*` ∥ `i18n-en*`）。
 */
import { ZH_SHELL } from "./i18n-zh-shell.mjs"
import { ZH_ME } from "./i18n-zh-me.mjs"
import { ZH_ADMIN } from "./i18n-zh-admin.mjs"
import { ZH_SANDBOX } from "./i18n-zh-sandbox.mjs"
import { ZH_SYSTEM } from "./i18n-zh-system.mjs"
import { ZH_CORE } from "./i18n-zh-core.mjs"
import { ZH_PROJECT } from "./i18n-zh-project.mjs"
import { ZH_LEDGER } from "./i18n-zh-ledger.mjs"
import { ZH_MCP } from "./i18n-zh-mcp.mjs"

export const ZH = Object.freeze({ ...ZH_SHELL, ...ZH_ME, ...ZH_ADMIN, ...ZH_SANDBOX, ...ZH_SYSTEM, ...ZH_CORE, ...ZH_PROJECT, ...ZH_LEDGER, ...ZH_MCP })
