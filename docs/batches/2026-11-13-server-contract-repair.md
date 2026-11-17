# 2026-11-13 · server-contract-repair
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（主 agent）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（实施者：主 agent ∥ coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-13 · 来源 = 用户 2026-11-13 批准修复文档体系；Server 业务裁定另已确定团队记忆真源与安全恢复目标。。
> 台账 = #2381（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-13
批起 sha = 6069bad39da68e2b54b1cba228b639d674565dd3
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

- 台账 #2381；承接评估中的 Server 契约缺口。
- 用户已裁定：team 记忆目标真源 = Server 数据库；当前代码未找到对应 Server 实现，代码落地登记为 #2380，不能提前写成当前实现。
- 用户已裁定：快照安全恢复目标 = 先验证/备份再清卷；代码实现登记为 #2379。当前设计只能记录实际恢复链和风险，不得把目标写成已交付。

## §2 批次任务与设计（主 agent）
**状态行**：设计完成（目标与当前实现分开，代码缺口不伪造交付）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 本批目标态

1. 团队记忆：Server 需求保留 Server 数据库目标；EVOLUTION 明确代码尚未落地；core MEMORY 区分当前 gitmem 行为与已裁定的 Server 迁移目标，不伪造已切换。
2. 沙盒状态机：从当前代码列出工作区/盒状态、合法动作、忙态与拒绝；休眠若不存在于当前实现，明确需求缺口，不编造状态。
3. 快照恢复：当前设计如实记录停→清卷→解包→启动及两径失败后的实际边界和风险；安全恢复只写为 #2379 的目标，不写成当前实现。
4. 成员 MCP：从当前桥接代码明确写类识别、Server 审批身份、权限判定、中止和拒绝回盒；缺实现时报告而非补目标机制。
5. 项目与团队账：形成同一能力矩阵，覆盖 owner/manage/readwrite/read 与 can.view/can.write、团队账迁移边和 aged 当前阈值来源。
6. Gateway：补上游非 2xx、流中 error、无 DONE 截断时的转发、客户端可见结果和 usage 最终状态。
7. 普通 key：按当前代码补签发/轮换/吊销。当前轮换是吊销该成员全部 active key 后按默认名新签一枚，非事务且不保留旧标签；WebUI 全换按钮已下架。标签保留等目标不得写成当前实现。

### 最近先例

`docs/server/design/metering/METERING.md` 的事务与「缺 usage 为 NULL，不估算」保留数据真源和失败边界；`docs/core/design/LEDGER.md` 的状态迁移表可直接形成非法迁移负例。对齐 = 对象、状态、权限、异常与审计；偏离 = 两项已裁定但未实现的代码能力只登记目标，不写成当前设计。

### 勘察证据

已读 Server 需求「团队记忆采用服务端数据库，personal/project 本地层不变」、EVOLUTION「团队记忆……按需求确认逐项设计」、core MEMORY「team：当前 gitmem 同步」。已读 `thincoder-server/src/sandbox/box.mjs` 的 `restoreWorkspace`：先读取/解压快照，随后「② 清卷」，两径解包失败抛错且无旧卷恢复。其他机制须读当前代码核实。本轮设计未查阅外部公共协议文档；当前行为修复只以仓内需求与代码为证据。实施若判断外部协议合规性，须先查官方资料并记录来源；否则明确只描述当前实现。

### 范围与依赖

本批只改文档，不实现 #2379 或 #2380，不改产品代码、不补 CLI 47、不清理历史批档。代码与需求冲突时停止该点并上抛，不把现状自动写成正确规则。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| docs/server/requirements/PROJECT.md | 保留团队记忆与安全恢复目标 | 实写 |
| docs/server/design/EVOLUTION.md | 标明 #2379/#2380 的未实现边界 | 实写 |
| docs/core/design/MEMORY.md | 区分当前 gitmem 与 Server 目标 | 实写 |
| docs/server/design/sandbox/SANDBOX.md | 补状态机和需求缺口 | 实写 |
| docs/server/design/sandbox/EXECUTION.md | 记录当前恢复风险与目标边界 | 实写 |
| docs/server/design/mcp/MCP.md | 补成员桥审批与拒绝传播 | 实写 |
| docs/server/design/agent/MEMBER-AGENT.md | 同步成员工具与审批边界 | 实写 |
| docs/server/design/project/PROJECTS.md | 补项目能力矩阵 | 实写 |
| docs/server/design/ledger/LEDGER.md | 补迁移表与 aged 阈值来源 | 实写 |
| docs/server/design/gateway/API.md | 补上游异常与记账状态 | 实写 |
| docs/server/design/accounts/ACCOUNTS.md | 补普通 key 轮换契约 | 实写 |
| docs/server/design/webui/ME.md | 同步 key 轮换入口 | 实写 |

### 逐项验收

| 项 | 正常与边界 | 失败面 |
|---|---|---|
| 团队记忆 | 目标、当前实现和 #2380 代码缺口三者不混淆 | 把 Server 数据库写成已落地即不通过 |
| 沙盒 | 状态集、合法迁移和拒绝与当前代码一致 | 仍存在「按当前状态门」而无状态表即不通过 |
| 快照恢复 | 当前风险可读，安全目标明确指向 #2379 | 把先备份写成当前实现即不通过 |
| 成员 MCP | 写类、审批身份、拒绝和中止能从文档形成负例 | 权限边界仍只写「按写类」即不通过 |
| 项目/团队账 | 同一能力矩阵覆盖 UI、项目和团队账；迁移和 aged 有值或 owner | 角色映射或迁移边缺失即不通过 |
| Gateway | 非 2xx、流中错误、截断均有客户端结果与 usage 终态 | 任一异常仍无记账语义即不通过 |
| 普通 key | 当前全换、非事务、默认名、旧标签不保留及 UI 下架均写明；目标缺口另列 | 把原子性或标签保留写成已交付，或仍只有验证标题即不通过 |
| 机械检查 | 改动文档 `doc_check report` PASS，引用人工复核 | 未处置命中或死引用即不通过 |

本批不改变业务行为，无集成用例增量。涉及未实现目标的内容仅作需求与边界记录，不作为产品测试通过证明。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🟡 | 待处置 | §2「最近先例」：`docs/server/design/METERING.md` 的事务与「缺 usage 为 NULL，不估算」保留数据真源和失败边界；该路径与文档地图登记的 metering 子目录不一致 |
| 2 | 🟡 | 待处置 | §2「勘察证据」：外部协议如用于判断须记录来源；否则明确未使用。此句仅约定后续记录方式，未给出本轮公共/外部来源的实际勘察结果 |

VERDICT: pass

 counts：🔴 0 · 🟡 2 · 🔵 0

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔵 | 待处置 | §3「轮次 1」两项发现仍标为「待处置」，但 §2「最近先例」已改为 `docs/server/design/metering/METERING.md`，§2「勘察证据」已写明「本轮设计未查阅外部公共协议文档」；实质内容已修，状态未结算 |

VERDICT: pass

counts：🔴 0 · 🟡 0 · 🔵 1

## §4 用户批准（主 agent）

- 2026-11-13：用户批准修复文档体系；另明确团队记忆真源为 Server 数据库，快照安全恢复需先验证/备份再清卷并另开代码批。

## §5 实施记录（实施者：主 agent ∥ coder）

### 实施内容

本批只改文档，未改产品代码或测试。十二份文档分别落实团队记忆目标边界、沙盒状态与恢复风险、成员 MCP 审批/拒绝/中止、项目与团队账矩阵、Gateway 异常终态、普通 key 全换及 WebUI 无入口。

| 验收项 | 实施结果 |
|---|---|
| 团队记忆 | 需求保留 Server 数据库目标；EVOLUTION 与 core MEMORY 明写当前 gitmem 和 #2380 缺口 |
| 沙盒 | SANDBOX 给出 running/stopped 读态、动作迁移表、503/502/400/404 拒绝及无休眠边界 |
| 快照恢复 | EXECUTION 写明读取/解压、停、清卷、两径解包、启动顺序和无旧卷恢复风险；#2379 单列为目标 |
| 成员 MCP | MCP 与 MEMBER-AGENT 写明恒写类、盒内核审批、Server 应答身份校验、拒绝零桥调用及中止链 |
| 项目/团队账 | PROJECTS 给出 admin/owner/manage/readwrite/read/非成员矩阵；LEDGER 给出有效迁移边、终态门和 aged 阈值 |
| Gateway | API 给出非 2xx、流内 error、无 DONE、传输异常、断连的客户端结果和 usage 终态 |
| 普通 key | ACCOUNTS 与 ME 写明全换、非事务、默认名、旧标签不保留、同一 memberId、旧 key 失效和 UI 下架 |

### 代码证据

- 团队记忆：`thincoder-core/agent/assemble.mjs` 的 `assembleAgent` 对 team 调 `ensureClone(team)` 后同步本地目录；`thincoder-core/memory/memory-tool.mjs` 的 `execPut` 在写 team markdown 后调 `commitAndPush`。`thincoder-server/src` 检索 team memory/gitmem 未找到 Server 团队记忆实现。
- 沙盒：`thincoder-server/src/sandbox/box.mjs` 的 `readBoxStatesOf` 只映射 running/stopped；`restoreWorkspace` 在「② 清卷」执行 `rm -rf ${path}/*`，随后 archive/SSH 两径解包，无旧卷备份或回滚。`workspace-routes.mjs` 的 `WORKSPACE_ACTIONS` 只有 start/stop/destroy/rotate-key/restore。
- 成员 MCP：`deploy/sandbox/member-shell/mcp-tools.mjs` 的 `stubTools` 固定 `readonly:false`；`src/mcp/member-bridge.mjs` 的 `boxMcpCallHandler` 只做工作区 key 门、face.invoke 和 AbortController 接线。`src/agent/member-asks.mjs` 的应答路由经 `requireMember` 与 `workspaceOr404` 校验本人工作区。
- 拒绝边界：`thincoder-core/agent/dispatch-run.mjs` 的 `runPreparedItem` 在 denied 分支直接返回 `Error: permission denied by user`，不触发 onToolResult；因此拒绝不产生桥 result 帧或 member_event/chat_call 结果行。
- 项目与团队账：`src/project/projects.mjs` 的 `capabilitiesOf` 是六键矩阵单源；`src/ledger/items.mjs` 的 `ALLOWED_MIGRATIONS`、`ARCHIVED_STATUSES`、`AGING_DAYS=30` 和 `agedOf` 分别提供迁移、终态门与老化依据。
- Gateway：`src/gateway/forward.mjs` 的 `forwardRequest` 以 HTTP `<400` 为 ok，HTTP `>=400` 为 error；流正常 EOF 不检查 DONE，中继异常在已发头时 destroy，客户端断连记 aborted；token 缺值传 NULL。
- 普通 key：`src/accounts/keys.mjs` 的 `rotateKey` 先吊销该成员全部 active key，再调 `issueKey` 使用默认名，无事务。`public/views-me.mjs` 明写「轮换（全换）按钮下架」，页面只接签发与逐把吊销。

### 验证与未做项

- 对十二份改动文档执行 `doc_check`，`mode=report`，结果为 `DOC-CHECK GATE: PASS`；修订 MCP 拒绝边界和沙盒状态表后再次全量执行，仍为 PASS。
- 已逐档回读目标、当前实现、异常终态与缺口。本批是文档修复，未运行产品测试，也不以此声明产品行为通过测试。
- 未实现 #2379 安全恢复、#2380 Server 团队记忆、休眠能力和普通 key 原子/保名轮换；这些均保持为代码缺口。本批未改 §1/§2/§3/§4/§6，未改产品端、RELEASE、RTM 或历史批档。

- 主 agent 已逐份复读十二份交付文档，确认目标/当前实现/代码缺口分开；十二档 `doc_check report` PASS。
- 本批新登记实现缺口：#2383 沙盒休眠/唤醒；#2384 普通 key 原子轮换并保留标签。MCP 是否增加 Server 侧独立审批或拒绝结果帧属于后续产品裁定，未擅自立为缺陷。

## §6 验证与收口（父代理）

- 主 agent 逐份复读十二份 Server/core 交付；当前实现、已裁定目标和代码缺口分开，状态机、权限、MCP、Gateway 与 key 契约可形成负例。
- 十二份改动文档 `doc_check report` PASS；独立复核 #22 通过，无未解决红项。
- 本批新债 2 条：#2383 沙盒休眠/唤醒，#2384 普通 key 原子轮换并保留标签；另有本工作启动前已登记的代码需求 #2379/#2380。
- 未运行产品测试、Server 真机或 runner 验收；本批只改文档，不声明行为测试通过。
