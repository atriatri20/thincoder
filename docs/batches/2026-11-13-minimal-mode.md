# 2026-11-13 · minimal-mode
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（主 agent）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（实施者：主 agent ∥ coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-13 · 来源 = 用户 2026-11-13 确认：三档 minimal/normal/engineering；CLI /minimal、/normal、/eng；极简提示词与可查询知识。
> 台账 = #2393（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-13
批起 sha = b9c5dd5ff156bb9196222a67ea805714fa759ea6
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

最终状态 = 单一互斥 `mode = minimal | normal | engineering`；minimal 使用普通工作权限与精简提示词，知识按需查询。

命令语义按用户最新裁定：`/eng` = engineering ↔ normal；`/minimal` = minimal ↔ normal；`/normal` 恒 normal。三个命令只写同一枚 mode，不设第二开关。

## §2 批次任务与设计（主 agent）
**状态行**：设计完成（三档、母版知识、ACP workMode 与三端实现面已明确）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

**设计落点** = PROMPT-SYSTEM 的母版/知识/注入设计；CONFIG 的唯一 mode 与旧布尔迁移；SESSION 的槽持久化；CLI、VSC、Desktop 与 Server Web 的三档入口；ACP 保留 PLAN mode，新增 workMode。

**最近先例** = `ledgerBindWriteConflict` 的 engineering 派生判断、`applySession` 的槽恢复、`createControlsRow` 的共享控件、tool-docs 的 DESC 单源。对齐 = 不改第二套并行状态，不复制工具协议。

**勘察证据** = 三个只读调查覆盖 core 配置/会话/提示词、三端 UI/ACP、提示词内容块；外部源不相关。ACP 的 PLAN normal 与工作 normal 已确认是不同语义，必须分字段。

**核心机制**：
- `agent.mode = minimal|normal|engineering` 唯一权威；缺省 normal。旧配置/旧槽只在读取时从 engineering 布尔迁移。
- 运行期向旧消费者派生 `engineering = mode === engineering`；settings 与 UI 不写该派生布尔。
- `/eng` = engineering↔normal；`/minimal` = minimal↔normal；`/normal` 恒 normal。当前会话立即落槽，下一轮生效；全局 agent.mode 只管新会话默认。
- ACP `session/set_mode` 继续只表示 plan/normal；`sessionConfigOptions` 新增 workMode 三档，set_config_option 写当前 agent 与槽并重推。
- common.md 与 discipline-normal.md 改为同一母版：硬规则常驻，详细正文逐字迁到 prompts/knowledge，原位置留 `{{knowledge:topic}}`。full 展开，minimal 移除；缺主题 fail-loud。
- minimal 沿用普通 persona、角色档与 subagent-base，工程场景不使用极简母版；consult/advisor 独立基底不变。
- prepareRun 每轮读 mode；minimal 跳过文档、记忆、项目大纲自动注入，保留项目规则、skills 与短运行事实。
- knowledge 为只读 list/search/get，统一覆盖 prompts/knowledge 的可内联主题与 core/knowledge 的纯查询主题；search 只定位，行动前 get 全主题；三档工具面均提供，纯查询主题任何模式都不进提示词。
- 工具 schema 与其他工具描述本批保持现状，单独报告其体量。

**完整档兼容** = normal/engineering 的模型可见提示词在主题内联后保持原内容和顺序；迁移前后逐角色渲染对照，不只检查锚数量。

**集成增量** = RTM 新增 CLI 50「三档模式与极简知识查询」与 CLI 52「ACP workMode 与 PLAN 分离」。CLI 50 验证命令、恢复、下一轮提示词与知识；CLI 52 以真 ACP stdio 验证三档快照、非法零通知和 PLAN 不变。

另增 VSC 9「三档模式从控件落到会话」、Desktop 12「三档模式贯穿 slash、控件、IPC 与槽」、Server 2「Web 三档模式通过真实 PATCH 与盒内槽生效」。三者以真实控件/宿主适配链验证 setMode、槽持久化、恢复、engineering×PLAN 和非法零写；节注写明组件、断言、需求和入口。

**验证** = 批内单测覆盖三值/旧迁移/派生/命令矩阵/母版矩阵/知识错误面；真 CLI 覆盖 CLI 50；VSC/Desktop/render-core 覆盖三档控件、协议和持久化；core、VSIX、Desktop 包资源检查递归包含知识目录。实施验收只跑变更面，完整套件结果在收口单列。不指定真实小模型时不宣称成功率实测。

**边界** = 不自动按模型猜测模式；不改写历史请求；不把知识写进用户记忆；不新增 promptMode、/mode 或 minimal+engineering 组合。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/config-defaults.mjs | — | 100 |
| thincoder-core/config-migrate.mjs | — | 162 |
| thincoder-core/config.mjs | — | 499 |
| thincoder-core/agent-tools/settings.mjs | — | 357 |
| thincoder-core/session-lifecycle.mjs | — | 426 |
| thincoder-core/session.mjs | — | 280 |
| thincoder-core/session-slot-write.mjs | — | 279 |
| thincoder-core/token-ttl.mjs | — | 435 |
| thincoder-core/agent/setup.mjs | — | 302 |
| thincoder-core/agent/setup-reminders.mjs | — | 256 |
| thincoder-core/agent/family-tools.mjs | — | 222 |
| thincoder-core/agent-tools/eng.mjs | — | 108 |
| thincoder-core/agent-tools/subagent-spawn.mjs | — | 430 |
| thincoder-core/prompt-overlays.mjs | — | 84 |
| thincoder-core/prompt-files.mjs | — | 113 |
| thincoder-core/tools/knowledge.mjs | — | 新 |
| thincoder-core/tool-docs/knowledge.md | — | 新 |
| thincoder-core/tool-docs/settings.md | — | 18 |
| thincoder-core/prompts/common.md | — | 518 |
| thincoder-core/prompts/discipline-normal.md | — | 329 |
| thincoder-core/prompts/knowledge/doc-lookup.md | — | 新 |
| thincoder-core/prompts/knowledge/decision-quality.md | — | 新 |
| thincoder-core/prompts/knowledge/evidence-discipline.md | — | 新 |
| thincoder-core/prompts/knowledge/business-gates.md | — | 新 |
| thincoder-core/prompts/knowledge/document-writing.md | — | 新 |
| thincoder-core/prompts/knowledge/upstream-protocol.md | — | 新 |
| thincoder-core/prompts/knowledge/tool-operations.md | — | 新 |
| thincoder-core/prompts/knowledge/documentation-evaluation.md | — | 新 |
| thincoder-core/prompts/knowledge/project-records.md | — | 新 |
| thincoder-core/prompts/knowledge/product-security.md | — | 新 |
| thincoder-core/prompts/knowledge/normal-coding-workflow.md | — | 新 |
| thincoder-core/prompts/knowledge/normal-work-management.md | — | 新 |
| thincoder-core/prompts/knowledge/normal-delivery-collaboration.md | — | 新 |
| thincoder-core/knowledge/README.md | — | 新 |
| thincoder-core/knowledge/prompt-resources.md | — | 新 |
| thincoder-core/package.json | — | 55 |
| thincoder-cli/src/tui/cmd-eng.mjs | — | 107 |
| thincoder-cli/src/tui/slash-commands.mjs | — | 194 |
| thincoder-cli/src/tui/cmd-config.mjs | — | 304 |
| thincoder-cli/src/tui/cmd-new.mjs | — | 42 |
| thincoder-cli/src/cli/make-agent.mjs | — | 140 |
| thincoder-cli/src/tui/cmd-session.mjs | — | 143 |
| thincoder-cli/src/tui/status-line.mjs | — | 203 |
| thincoder-cli/src/acp/handlers-session.mjs | — | 343 |
| thincoder-cli/src/acp/handlers-slots.mjs | — | 225 |
| thincoder-render-core/composer/controls.mjs | — | 236 |
| thincoder-render-core/composer/panel.mjs | — | 484 |
| thincoder-vscode/src/agent/setup.mjs | — | 322 |
| thincoder-vscode/src/agent/agent-state.mjs | — | 168 |
| thincoder-vscode/src/agent/run-helpers.mjs | — | 92 |
| thincoder-vscode/src/agent/setup-tooltable.mjs | — | 103 |
| thincoder-vscode/src/extension/panel-session-write.mjs | — | 157 |
| thincoder-vscode/src/extension/settings.mjs | — | 444 |
| thincoder-vscode/src/extension/settings-panel-write.mjs | — | 212 |
| thincoder-vscode/src/extension/panel-messages-settings.mjs | — | 326 |
| thincoder-vscode/src/extension/panel-messages.mjs | — | 400 |
| thincoder-vscode/src/extension/panel-settings-push.mjs | — | 124 |
| thincoder-vscode/webview/index.html | — | 132 |
| thincoder-vscode/webview/input.js | — | 130 |
| thincoder-vscode/webview/state.js | — | 161 |
| thincoder-vscode/webview/mode-buttons.js | — | 18 |
| thincoder-vscode/webview/settings-agent.js | — | 206 |
| thincoder-vscode/locales/zh.json | — | 361 |
| thincoder-vscode/locales/en.json | — | 361 |
| thincoder-vscode/webview/i18n-dom.js | — | 55 |
| thincoder-vscode/scripts/check-vsix.mjs | — | 114 |
| thincoder-vscode/test/2026-11-06-vsc-turn-save-slots.test.mjs | — | 246 |
| thincoder-vscode/test/2026-11-13-vsc-work-mode.test.mjs | — | 新 |
| thincoder-vscode/test/files.mjs | — | 10 |
| thincoder-desktop/src/main/agent-assemble.mjs | — | 142 |
| thincoder-desktop/src/main/agent-host.mjs | — | 338 |
| thincoder-desktop/src/main/session-flags.mjs | — | 96 |
| thincoder-desktop/src/main/session-slots.mjs | — | 279 |
| thincoder-desktop/renderer/composer-sync.mjs | — | 343 |
| thincoder-desktop/renderer/composer-wire.mjs | — | 301 |
| thincoder-desktop/renderer/events-flags.mjs | — | 48 |
| thincoder-desktop/renderer/i18n-composer.mjs | — | 153 |
| thincoder-desktop/renderer/i18n-settings.mjs | — | 230 |
| thincoder-desktop/renderer/i18n-views.mjs | — | 436 |
| thincoder-desktop/renderer/i18n.mjs | — | 452 |
| thincoder-desktop/renderer/mount-composer.mjs | — | 301 |
| thincoder-desktop/renderer/slash-commands.mjs | — | 64 |
| thincoder-desktop/renderer/views/statusline-banner.mjs | — | 25 |
| thincoder-desktop/renderer/views/settings-agent.mjs | — | 193 |
| thincoder-desktop/scripts/check-dist.mjs | — | 422 |
| thincoder-desktop/scripts/dist-resource-face.mjs | — | 新 |
| thincoder-desktop/test/files.mjs | — | 7 |
| thincoder-desktop/test/dist-resource-face.test.mjs | — | 新 |
| thincoder-desktop/test/work-mode-main.test.mjs | — | 新 |
| thincoder-desktop/test/work-mode-renderer.test.mjs | — | 新 |
| thincoder-server/deploy/sandbox/member-shell/core-run-util.mjs | — | 179 |
| thincoder-server/deploy/sandbox/member-shell/core-run.mjs | — | 490 |
| thincoder-server/package.json | — | 32 |
| thincoder-server/public/i18n-en-core.mjs | — | 142 |
| thincoder-server/public/i18n-zh-core.mjs | — | 145 |
| thincoder-server/public/style.css | — | 445 |
| thincoder-server/public/views-chat-composer.mjs | — | 320 |
| thincoder-server/public/views-me-chat-composer.mjs | — | 456 |
| thincoder-server/public/views-me-chat.mjs | — | 499 |
| thincoder-server/src/agent/member-routes.mjs | member-session-patch.mjs 与 member-git-credentials.mjs（实施轮拆出对应路由；§5） | 557 |
| thincoder-server/src/agent/member-session-patch.mjs | — | 新 |
| thincoder-server/src/agent/member-git-credentials.mjs | — | 新 |
| thincoder-server/test/mini-dom.mjs | — | 新 |
| thincoder-server/test/work-mode.test.mjs | — | 新 |
| docs/batches/2026-11-13-minimal-mode.test.mjs | — | 新 |
| test/integration/minimal-mode.test.mjs | — | 新 |

| test/integration/acp-work-mode.test.mjs | — | 新 |

| test/integration/vsc-work-mode.test.mjs | — | 新 |
| test/integration/desktop-work-mode.test.mjs | — | 新 |
| test/integration/server-work-mode.test.mjs | — | 新 |

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | §2「集成增量」只写「RTM 新增 CLI 50」及 CLI 50-1/50-2；但 VSC WEBVIEW F-W24、Desktop CHAT D5、Server CHAT「输入与状态」和 ACP「会话身份与配置」均新增宿主可见三档入口，未命名这些入口的 RTM 集成增量。 |
| 2 | 🟡 | 建议澄清 | PROMPT-SYSTEM 设计「极简槽」写「极简子代理沿用各自身份档与 subagent-base」，同档「内容归属」又单列「极简 subagent-base」；批档 §2 写「minimal 沿用普通 persona、角色档与 subagent-base」，未明确子代理基底是完整复用还是极简展开。 |

VERDICT: changes-required
计数：🔴 1，🟡 1，🔵 0。

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | 首轮宿主集成项仍未形成合规 RTM 证据：`test/RTM.md` 写明「本表只登记仓根 `test/integration/**` 的集成用例，批次单元测试不进入本表」，但 `test/rtm/ends.md` 的 VSC 9、Desktop 12、Server 2 分别把 `thincoder-vscode/test/2026-11-13-vsc-work-mode.test.mjs`、`thincoder-desktop/test/work-mode-main.test.mjs`、`thincoder-server/test/work-mode.test.mjs` 登为证据；批档 §2 机读清单也只新增 CLI 50 与 CLI 52 的仓根集成档。索引还同时写「Desktop 当前没有盘上的集成用例」和 Desktop 12「有」。 |
| 2 | 🟡 | 建议澄清 | `test/rtm/tooling.md` CLI 52 节注指向 ACP-CLIENT「配置选项与写路径」，实际 owning section 是「会话身份与配置」；`test/rtm/ends.md` VSC 9 节注指向 WEBVIEW「模型与恢复」，三档机制实际写在「AUTO 与会话模式」。 |
| 3 | 🔵 | 已解决 | PROMPT-SYSTEM 设计「内容归属」明确 subagent-base 是「各极简与完整子代理共同使用的完整角色边界、范围和报告义务」，与「极简子代理沿用各自身份档与 subagent-base」一致；首轮子代理基底歧义已消除。 |

VERDICT: changes-required
计数：🔴 1，🟡 1，🔵 1。

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | 根集成证据路径已改对，但覆盖矩阵仍错配：`test/RTM.md`「故事索引表」的列序是「CLI | VSC | Desktop」，Desktop 12 行却为「| Desktop 12 | 三档模式贯穿 slash、控件、IPC 与槽 | ends | 缺 | 有 | 缺 |」，Server 2 行为「| Server 2 | Web 三档模式通过真实 PATCH 与盒内槽生效 | ends | 缺 | 缺 | 有 |」。这与 `test/rtm/ends.md` 各自的 `test/integration/desktop-work-mode.test.mjs`、`test/integration/server-work-mode.test.mjs` 业务入口不一致，首轮覆盖状态问题未完全收口。 |
| 2 | 🟡 | 已解决 | `test/rtm/tooling.md` CLI 52 节注现为「回指 = `docs/cli/design/ACP-CLIENT.md`「会话身份与配置」」；`test/rtm/ends.md` VSC 9 节注现为「机制 = `docs/vsc/design/WEBVIEW.md`「AUTO 与会话模式」∥ `WEBVIEW-PROTOCOL.md`」，两处均与 owning section 相符。 |
| 3 | 🔵 | 已解决 | PROMPT-SYSTEM 设计「内容归属」仍明确 subagent-base 是「各极简与完整子代理共同使用的完整角色边界、范围和报告义务」，与「极简子代理沿用各自身份档与 subagent-base」一致。 |

VERDICT: changes-required
计数：🔴 1，🟡 1，🔵 1。

### 轮次 4（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已解决 | `test/RTM.md`「故事索引表」列序为「CLI | VSC | Desktop」；Desktop 12 行现为「| Desktop 12 | 三档模式贯穿 slash、控件、IPC 与槽 | ends | 缺 | 缺 | 有 |」，Server 2 行现为「| Server 2 | Web 三档模式通过真实 PATCH 与盒内槽生效 | ends | 缺 | 缺 | 缺 |」，覆盖列错位已修正。 |
| 2 | 🔴 | 已解决 | `test/rtm/ends.md` 的 VSC 9、Desktop 12、Server 2 证据分别为 `test/integration/vsc-work-mode.test.mjs`、`test/integration/desktop-work-mode.test.mjs`、`test/integration/server-work-mode.test.mjs`，均属索引声明的仓根集成范围。 |
| 3 | 🟡 | 已解决 | `test/rtm/tooling.md` CLI 52 节注指向 ACP-CLIENT「会话身份与配置」；`test/rtm/ends.md` VSC 9 节注指向 WEBVIEW「AUTO 与会话模式」，均与对应设计档现有 owning section 相符。 |
| 4 | 🔵 | 已解决 | `docs/core/design/PROMPT-SYSTEM.md`「内容归属」明确 subagent-base 为「各极简与完整子代理共同使用的完整角色边界、范围和报告义务」，与「极简槽」的子代理表述一致。 |

VERDICT: pass
计数：未解决 🔴 0，🟡 0，🔵 0。

## §4 用户批准（主 agent）

用户确认三档 minimal/normal/engineering、单源知识查询、/minimal 与 /eng 各自返回 normal 的切换语义，并在完整方案后回复「可以」。

## §5 实施记录（实施者：主 agent ∥ coder）
**状态行**：实施完成（三档、知识、全宿主与定点缺陷修复均完成）



实现 = 单一 `agent.mode=minimal|normal|engineering`，旧 engineering 仅读取迁移，运行期派生兼容。CLI `/eng`、`/minimal`、`/normal` 按确认矩阵切换并落槽；VSC/Desktop/Server 使用共享三档 MODE，ACP 以 workMode 独立于 PLAN。

提示词 = common 与 discipline-normal 使用同一母版，full 展开知识锚、minimal 移除；普通/工程完整渲染与迁移前逐字一致。knowledge 三档主子代理均可用，list/search/get 覆盖 prompts/knowledge 与纯查询 knowledge，主题冲突和未知主题显式失败。minimal 停止文档/记忆/大纲自动注入，项目规则保留。

宿主 = VSC、Desktop、Server 的控件、IPC/PATCH、槽恢复和 PLAN 互斥均已落地。另修复无活代理 flags 回执、在飞 history 保留、写失败回滚、Server renderBar 同步、忙期 PATCH 保存覆盖及旗标写顺序。Server 会话 PATCH 与 git 凭据路由拆出后 member-routes.mjs 为 488 内容行。

验证 = 批内 13/13；CLI 50 2/2；ACP CLI 52 4/4；VSC 47/47；render-core 6/6；Desktop 14/14；Server 11/11；VSC/Desktop/Server 根集成各 2/2。完整 normal 主提示词 112028 字符，minimal 20352 字符；未做真实小模型成功率实测。

## §6 验证与收口（父代理）

验收 = 变更面测试全部通过，批内单测按规则清理。CLI 50、CLI 52、VSC 9、Desktop 12、Server 2 均使用仓根集成证据；VSC/Desktop/Server 包内回归与共享控件回归通过。lint、资源包检查和受影响文档 doc_check 通过。

独立评审 = core 与 VSC 实施评审通过；Desktop 三项状态修复定点复核通过；Server 三项一致性修复定点复核通过。设计评审经宿主集成、证据路径、节名与覆盖列修正后 `VERDICT: pass`。

完整回归 = 仓根 `node test/run.mjs` 已执行；本批新增用例通过，仓内仍存在 CLI 1、CLI 43 等范围外既有失败，不宣称完整套件全绿。未使用真实小上下文模型做任务成功率实测，本批无新债。
