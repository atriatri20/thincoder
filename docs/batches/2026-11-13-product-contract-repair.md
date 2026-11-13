# 2026-11-13 · product-contract-repair
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（主 agent）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（实施者：主 agent ∥ coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-13 · 来源 = 用户 2026-11-13 批准继续修复文档体系并要求使用台账与批次规则；本批承接评估中的产品端契约缺口。。
> 台账 = #2378（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-13
批起 sha = 7d745b0f5554a8763868bc23015de42af20d87d7
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

- 台账 #2378；承接 `docs/DOC-SYSTEM-ASSESSMENT.md` 中产品端和共享核契约缺口。
- 用户总授权不变：修复文档、照批次执行、不改产品代码、不补 CLI 47、不提交 git。
- 本批与 #2377 并行准备但文件域分离；core 批不写产品端文档，本批不写 core 现役边界文档。

## §2 批次任务与设计（主 agent）
**状态行**：设计完成（只恢复当前契约，不改运行行为）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 本批目标态

把产品端文档从代码导航恢复为可实现的契约，但不改变任何运行行为。

1. render-core：把 `docs/desktop/requirements/PROJECT.md` 的共享渲染核需求迁移到新同题需求档，旧位置只保留新 owner 引用；地图和 manifest 同步。设计列出公开导出、关键参数/返回值、滚动阈值、帧与会话恢复边界、composer 和 subblock 状态机；宿主保留端侧职责。
2. VSC 协议：按消息方向列出字段、必填性、载荷和错误形状；补齐当前需求中已有但设计未承接的 autoApprove 与界面需求，不能承接的冲突上抛。
3. Desktop IPC：列出实际通道、方向、载荷、回执变体、reason 闭集、审批和提问语义；提问重试以当前代码和需求为准，含混处上抛。
4. CLI ACP：补回协议支持集、resource_link 判定树、大小/字符边界、NUL/选区和固定原因标记。
5. CLI 与异步池：从当前实现核实队列容量、合并条数/字符预算和分页大小，需求写行为边界，设计写具体值与所有者。
6. 追溯：所有新增或恢复的机制只写当前事实；RTM 的具体锚修复由后续 RTM 批处理，本批不伪造覆盖。

### 最近先例

`docs/core/design/SESSION.md`「派生索引只指向既有文件」保留路径、缺口和重建边界；`docs/server/design/gateway/API.md` 用对象/规则/验证组织契约。对齐 = 字段、状态、异常、边界与验收；偏离 = 本批不新增产品机制，只记录当前实现和需求。

### 勘察证据

已读当前 `docs/render-core/design/RENDER-CORE.md`「滚动与窗口」、`docs/vsc/design/WEBVIEW-PROTOCOL.md`「消息族」、`docs/desktop/design/IPC.md`「渲染到主」和 `docs/cli/design/ACP-CLIENT.md`「配置与引用」；独立复核还与当前 git 基线对照，确认原有接口表、阈值和协议载荷被移除。实施时必须回到当前代码核实，不把旧稿直接当现状。外部公共文档：本批设计阶段未查阅，无相关来源。

实施若判断 ACP 公共协议合规性，须先查官方规范并记录来源与相关结论；否则只描述当前实现。

### 范围

本批只修上述产品端与共享核文档。core 现役边界、Server、发布/环境手册和 RTM 分册不在本批；不补测试、不改代码、不改历史批档。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| docs/render-core/requirements/RENDER-CORE.md | 新建共享核需求 owner | 实写 |
| docs/desktop/requirements/PROJECT.md | 旧共享核需求段改为新 owner 引用 | 实写 |
| docs/render-core/design/RENDER-CORE.md | 恢复公共接口和状态契约 | 实写 |
| docs/vsc/requirements/WEBVIEW.md | 核对需求标识与当前边界 | 实写 |
| docs/vsc/requirements/PROJECT.md | 核对 autoApprove 等需求 | 实写 |
| docs/vsc/design/WEBVIEW.md | 承接需求并明确端侧机制 | 实写 |
| docs/vsc/design/WEBVIEW-PROTOCOL.md | 恢复双向消息契约 | 实写 |
| docs/desktop/requirements/CHAT.md | 澄清提问重试的需求语义 | 实写 |
| docs/desktop/design/CHAT.md | 对齐实际重试路径 | 实写 |
| docs/desktop/design/IPC.md | 恢复通道、载荷和回执闭集 | 实写 |
| docs/cli/requirements/ACP-CLIENT.md | 补协议支持集与验收边界 | 实写 |
| docs/cli/design/ACP-CLIENT.md | 补判定树和固定标记 | 实写 |
| docs/cli/requirements/TUI.md | 补队列和分页行为边界 | 实写 |
| docs/cli/design/TUI.md | 对齐 TUI 当前实现 | 实写 |
| docs/core/design/AGENT-LOOP-ASYNC-POOL.md | 补队列与合并数值契约 | 实写 |
| docs/README.md | 登记 render-core 同题需求档 | 实写 |
| PROJECT-MANIFEST.json | 由主 agent 声明 render-core 需求根 | 实写 |

### 逐项验收

| 项 | 正常与边界 | 失败面 |
|---|---|---|
| render-core | 公开接口、阈值、状态和宿主职责可从文档形成实现与负例 | 仍只有概念清单或把字段规范交给源码即不通过 |
| VSC | 每族消息的方向、字段和错误形状可读；autoApprove 等需求有设计 owner | 存在只列消息名、需求无承接或失效需求编号即不通过 |
| Desktop | 通道、载荷、回执和 reason 闭集一致；提问重试语义唯一 | 任一公开通道仍无法独立验收即不通过 |
| ACP | 支持集、URI/UNC/选区/NUL/大小边界和固定原因标记完整 | 仍写「按当前判定树」而无判定树即不通过 |
| TUI/异步池 | 容量、合并和分页的具体值与代码一致，需求/设计分工清楚 | 数值缺失或与实现不一致即不通过 |
| 机械与引用 | 改动文档 `doc_check report` PASS，章节引用人工复核有效 | 任一未处置命中或死章节引用即不通过 |

复核章节：render-core 读「模块职责」「滚动与窗口」「Composer 与活动块」「验证」及新需求档；VSC 读「消息族」「验证」与 WEBVIEW 的承接节；Desktop 读「渲染到主」「回执与队列」；ACP 读「协议与生命周期」「配置与引用」；TUI 读「队列、timer 与恢复」「会话与滚动」及异步池「用户排队输入」。

本批只改变文档，不改变业务可观察结果或协议行为，因此没有集成测试用例增量。代码阅读用于核实契约，不作为产品测试通过证明。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 开放 | 批档 §2「本批目标态」的「建立同题需求档」与「受影响文件（机读清单）」的「新建共享核需求 owner」；`docs/README.md` §8 的「`desktop/requirements/PROJECT.md` 的共享渲染核需求」 |
| 2 | 🟡 | 开放 | 批档 §2「勘察证据」的「外部公共 ACP 文档如用于协议行为判断，须记录具体来源；否则明确未使用。」 |
| 3 | 🟡 | 开放 | 批档 §2「逐项验收」 |

VERDICT: pass

计数：🔴 0 · 🟡 3 · 🔵 0。

### 轮次 2（评审子代理）

本轮按复核对象声明检查产品端协议、共享核接口、数值契约及批档验收一致性。§2 六项落点均有对应需求与设计承接；VSC/Desktop 历史页 200、TUI 首页 200/旧页 20、队列 8、合并 8 条/2000 字符的归属与数值一致；提问同卡同 promptId 重试与错误横幅重发路径无混用。16 份现役文档的 `doc_check report` 实测 PASS。无新增发现。

VERDICT: pass

计数：🔴 0 · 🟡 0 · 🔵 0。

## §4 用户批准（主 agent）

- 2026-11-13：用户批准继续修复文档体系并要求使用台账和批次规则。本批是评估报告中产品端契约缺口的独立实施批。

## §5 实施记录（实施者：主 agent ∥ coder）
**状态行**：实施完成（文档契约修复与 doc_check report 复核完成；产品测试不在本批范围）



### 实施记录 · 产品端文档契约修复

- 范围：完成 §2 的 render-core、VSC、Desktop、ACP、TUI/异步池六项文档修复；未改产品代码、测试、RTM 或其他 core 文档，未提交 git。
- render-core：新建 `docs/render-core/requirements/RENDER-CORE.md` 作为共享需求唯一 owner，`docs/desktop/requirements/PROJECT.md` 改为引用，`docs/README.md` 登记；`docs/render-core/design/RENDER-CORE.md` 按当前公开导出补齐参数、返回值、状态机、异常和数值。
- VSC：`docs/vsc/design/WEBVIEW-PROTOCOL.md` 按双向列出实际消息、载荷和错误形状；`docs/vsc/design/WEBVIEW.md` 新增「AUTO 与会话模式」，承接默认关闭、会话槽、live 读取、mid-turn 和 continue 例外；`docs/vsc/requirements/WEBVIEW.md` 补滚动、分页、队列、窗口数值，`docs/vsc/requirements/PROJECT.md` 指向该 owner。
- Desktop：`docs/desktop/design/IPC.md` 恢复 EVENT_CHANNELS、CHANNELS/HANDLERS 全表、回执变体和 reason；有限值逐项列闭集，底层错误原文明确标开放串。`docs/desktop/requirements/CHAT.md` 与 `docs/desktop/design/CHAT.md` 明确提问回执 ok 才摘卡，失败保留同卡/id/草稿并重调 question:respond，错误横幅重发是独立路径。
- ACP：`docs/cli/requirements/ACP-CLIENT.md` 列当前入站方法、通知和反向 RPC 支持集；`docs/cli/design/ACP-CLIENT.md` 补传输/能力/会话/事件形状及 resource_link 十五步判定树、11 个固定原因标记和成功围栏。未使用外部公共文档，不作额外公共协议合规裁决。
- TUI/异步池：`docs/cli/requirements/TUI.md` 写行为边界，`docs/cli/design/TUI.md` 记录 core queued.mjs 的队列 8、合并 8 条/2000 字符及 TUI startup.mjs 的首页 200/旧页 20；`docs/core/design/AGENT-LOOP-ASYNC-POOL.md` 承接队列常量、格式化预算、斜杠/超长/携图退化规则。

代码证据：

- render-core：scroll-loop、history-window、session-window、composer 与公开导出。
- VSC：`chat-messages.js`、`panel-messages*.mjs`、`panel-session.mjs`、`panel-settings-push.mjs`、`permission-gate.mjs`。
- Desktop：`preload.cjs`、`ipc-registry.mjs`、`ipc.mjs`、`ipc-relays.mjs`、`suspensions.mjs`、`mount-cards.mjs` 及设置/MCP/会话处理体。
- ACP：`transport.mjs`、`client-caps.mjs`、`handlers-*.mjs`、`bridge.mjs`、`resource-link.mjs`、`ext.mjs`、`read-data.mjs`。
- 队列与分页：core `queued.mjs` 与 TUI `startup.mjs`。

改动文件：

| 文件 |
|---|
| `docs/render-core/requirements/RENDER-CORE.md` |
| `docs/render-core/design/RENDER-CORE.md` |
| `docs/desktop/requirements/PROJECT.md` |
| `docs/vsc/requirements/WEBVIEW.md` |
| `docs/vsc/requirements/PROJECT.md` |
| `docs/vsc/design/WEBVIEW.md` |
| `docs/vsc/design/WEBVIEW-PROTOCOL.md` |
| `docs/desktop/requirements/CHAT.md` |
| `docs/desktop/design/CHAT.md` |
| `docs/desktop/design/IPC.md` |
| `docs/cli/requirements/ACP-CLIENT.md` |
| `docs/cli/design/ACP-CLIENT.md` |
| `docs/cli/requirements/TUI.md` |
| `docs/cli/design/TUI.md` |
| `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` |
| `docs/README.md` |

另改本批档 §5，无清单外文件改动。

验证：对上述 16 个文档执行 `doc_check({mode:"report", target:"D:\\teamcode\\thincoder", docs:[…]})`，最终输出 `DOC-CHECK GATE: PASS`。人工复核新章节「AUTO 与会话模式」「队列与历史数值」「协议与生命周期」「配置与引用」及跨档引用有效。

Markdown 无适用 lint；本批只改文档，未运行也不宣称产品测试通过。`PROJECT-MANIFEST.json` 的 render-core 需求根声明由主 agent 按批档完成，本实施席未改 manifest。无未处置上抛项。

## §6 验证与收口（父代理）

- 主 agent 逐份复读十六份产品端交付；需求 owner、公开导出、协议字段、状态机、阈值、异常和验证章节符合 §2。
- 十六份文档 `doc_check report` PASS；独立复核 #24 全清，无未解决发现。
- 本批无新债。未运行产品测试或真机验收；本批只改文档，不改变产品行为。
