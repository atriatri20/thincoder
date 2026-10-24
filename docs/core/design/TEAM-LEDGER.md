# Thincoder Core · 团队台账（端侧面——核工具 `team_ledger`）

> 板块 = core ∥ 本档 = 端侧团队面（团队台账——核工具 ∥ 仓标记派生 ∥ 登录态门 ∥ 三端承载分工）。
> 服务端机制单源 = `docs/server/design/ledger/LEDGER.md`（数据形/判权/端点——本档不复述）；登录态与 token 单源 = `docs/core/design/TEAM.md` §2.1/§2.6（本档不复述）。
> 最近先例 = 本机台账工具面（`thincoder-core/agent/family-tools.mjs`——`ledgerTool`/`ledgerReadTool`：五 action ∥ 深度变体）∥ 三端登录态（`docs/core/design/TEAM.md` §2.1——`teamStatus()`）；对齐 = 工具面与登录判据逐字沿先例；偏离 = 零跨账代码路径 + 仓标记自动派生（需求 ①⑤）。
> 需求单源 = `docs/server/requirements/PROJECT.md`（功能点 32 ∥ AC-32 ∥ §3 端侧同批纪律）。

## 1. 定位与边界

- **一句话**：给三端 agent 一条**读写团队台账**的工具面（`team_ledger`）——团队账 = 服务端一本（登录后可用），端侧零本地副本。
- **单源**：工具住核（`thincoder-core/team-ledger.mjs`）——三端同 import 即同得（端侧零逐端改动，§4）。
- **不承载**：控制台维护面（= `docs/server/design/webui/LEDGER.md`）∥ 本机台账（= `docs/core/design/LEDGER.md`——两账独立，零共享代码路径）。
- **纪律**：需求 §3 端侧同批——三端 + 控制台页同批落齐（本档 §4 承载分工表）。

## 2. 机制面

### 2.1 工具面（名 ∥ action ∥ 参数 ∥ 出参）

- **名**：`team_ledger`；描述文本单点 = `thincoder-core/tool-docs/team_ledger.md`（`DESC` 加载面）。
- **action**（五件）：`query` ∥ `count` ∥ `add` ∥ `update` ∥ `close`——镜像本机台账工具面（认知迁移零成本）。
- **参数**（并集 schema；按 action 收窄）：

| 参数 | 适用 action | 语义 |
|---|---|---|
| `action` | 全部 | 五值枚举 |
| `scope` | query ∥ count | `"repo"`（缺省——**当前仓**，自动派生）∥ `"team"`（全队跨仓） |
| `status` | query ∥ count | 过滤：六态之一 |
| `owner` | query ∥ count | 过滤：负责人（用户名精确匹配） |
| `title` | add（必填）∥ update | 标题（trim 非空 ∥ ≤200） |
| `detail` | add ∥ update | 正文（≤4000） |
| `owner` | add ∥ update | 负责人（缺省 = 自己——与服务端缺省同口径） |
| `status` | update ∥ close | update = 目标态（迁移表合法后继）∥ close = `已核销` ∥ `已废弃` |
| `id` | update ∥ close（必填） | 条目编号（全局） |

- **出参**：行集（`id` ∥ `repo` ∥ `status` ∥ `title` ∥ `detail` ∥ `owner` ∥ `createdBy` ∥ `createdAt` ∥ `updatedAt` ∥ `closedAt` ∥ `aged` ∥ `canWrite`）+ `total`（**零 `repoName`**——端侧仓面展示 = 归地址；显示名 = 控制台 `repos[]` 回填）；`count` = 同参取 `total`。
- **零手挑仓**（需求 ①）：无 `repo` 参数——仓恒自动带上（§2.2）。

### 2.2 仓标记派生（端侧）

- 径：会话项目根 ⇒ `git rev-parse --show-toplevel` ⇒ `git config --get remote.origin.url` ⇒ **原文**上送 ⇒ **服务端归一**（归一单源 = `project/projects.mjs` `normalizeAddress`）。
- 无 git 仓 ∥ 无 origin ⇒ 明示失败（「未检出 git 源（origin）——团队账按 git 源记账」）；零请求零写库。
- 先例（零新依赖）：核既有 git 面——`thincoder-core/git/checkpoint.mjs`（`rev-parse` 形）∥ `thincoder-core/agent/assemble.mjs:38`（`git config` 形）。

### 2.3 登录态门（三态出词）

- 判据 = `teamStatus().loggedIn`（`team.token` 在场——`docs/core/design/TEAM.md` §2.1 权威源）；未登录 ⇒ **零网络调用** + 明示「未登录——团队账不可用（本机台账照常）；请先登录」。
- 服务端 401（token 失效/被吊销）⇒ 「登录已失效——请重新登录」；端侧零清盘（沿 `teamVerify` 三值口径）。
- 网络不可达 ⇒ 「服务器不可达——团队账不可用（零离线缓存）」；**零缓存回读**（重试不落旧值）。

### 2.4 传输

- 沿 `teamVerify` 现形（`thincoder-core/team.mjs`）：直接 `fetch`（`<server>/api/client/ledger*`）+ `Authorization: Bearer <team.token>` + 超时 `TEAM_FETCH_TIMEOUT_MS`；**零第三方 ∥ 零持久化**（工具面无写盘面）。

### 2.5 工具变体（深度门）

- depth 0 = 全量五 action（含写面）；子代理（depth > 0）= **只读变体**（`query`/`count`——写三 action schema 级不可达）。
- 沿本机台账 `ledgerTool`/`ledgerReadTool` 先例（`thincoder-core/agent/family-tools.mjs:145` ∥ `:176-180`）；写面机械不可达 = 权限面第一道。

## 3. 关键决策记录（本档）

| # | 决策 | 理由 |
|---|---|---|
| D-TL1 | 端侧承载 = **核工具 `team_ledger`**（三端共享单源）——三端零逐端改动 | 端侧同批纪律（需求 §3）由**核单源**结构性保障：三端同引 `@thincoder/core`（`thincoder-cli/package.json:23` ∥ `thincoder-vscode/package.json:33` ∥ `thincoder-desktop/package.json:20`），家族段由核 `prepareRun` 追加（`thincoder-vscode/src/agent/tool-table.mjs:8-9`）——「先行后补」结构上不可能 |
| D-TL2 | 工具面**零跨账代码路径**（零 import 本机台账模块） | 上送 = agent 两步显式动作（读本机账 ⇒ 写团队账）——「禁混同」（需求 ⑤）由结构保障而非约定；import 面机检可判 |
| D-TL3 | 仓标记 = **会话项目根自动派生**（`rev-parse --show-toplevel` + `config --get remote.origin.url`）∥ 原文上送 ∥ 服务端归一 | 需求 ①「写时自动带上，不手挑」；端侧零归一实现 ⇒ 归一单源（两处不可能漂移） |
| D-TL4 | 登录态门 = `teamStatus().loggedIn`（`team.token` 在场）——未登录零网络 + 明示 | 登录态单源（TEAM.md §2.1）——工具不自建第二判据；「未登录 ⇒ 团队各面不启用」在工具面的落点 |
| D-TL5 | 子代理面 = **只读变体**（写三 action schema 级不可达） | 沿本机台账先例；子代理写共享账 = 噪声面（无归属边界） |
| D-TL6 | **不做逐端独立面板**（CLI 状态行 ∥ VSC 面板 ∥ 桌面卡片）；人机面 = agent 对话 + 控制台页 | 能力面（读写团队账）经核工具在三端**同批到齐**（无「先行后补」）；需求 ⑥ 的承载面裁量 = 控制台维护面（列表/筛选/四动作）；逐端面板 = 三处 UI + 三套交互（成本×3，需求未点名） |

## 4. 三端承载分工（需求 §3 纪律对位）

| 端 | 承载面 | 落地工作 | 同批判据 |
|---|---|---|---|
| CLI | agent 工具面（`team_ledger`——经核家族段装配）；人机面 = 对话 | **零端侧改动**（核单源） | 工具在装配表（`family-tools.mjs` depth-0 段） |
| VSC | 同上（家族段由核 `prepareRun` 追加——端侧零自持表项） | **零端侧改动** | 同上 |
| 桌面 | 同上 | **零端侧改动** | 同上 |
| 控制台 | `#/me/ledger` 页（列表/筛选/新建/编辑/收口/撤回） | 新页（= `docs/server/design/webui/LEDGER.md`） | 页面在册 + 键族在册 |

- **「同批」的含义**：能力面（三端读写团队账）一次性到齐（核单源）；维护面（控制台页）同批落齐——**无端侧滞后项**。
- **不做面**：逐端独立面板/状态行/命令行族（不在本档；如用户点名 ⇒ 三端同批另开批）。

## 5. 受影响文件与行数预算

| 档 | 行数 | 职责 |
|---|---|---|
| `thincoder-core/team-ledger.mjs` | **282** | 工具声明 + 五 action 执行器 + 仓派生 + 登录态门 + 请求 |
| `thincoder-core/tool-docs/team_ledger.md` | **9** | 工具描述文本单点（`DESC` 加载面） |
| `thincoder-core/agent/family-tools.mjs` | **198**（+动态 import ∥ depth-0 段 + `teamLedgerTool` ∥ 子代理段 + `teamLedgerReadTool`——沿 `ledgerTool`/`ledgerReadTool` 同位） | 家族段装配 |
| `thincoder-core/team.mjs` | **224**（传输 / 登录态现形复用） | 登录态/token 单源 |

- 三端（CLI ∥ VSC ∥ 桌面）**零改动**（D-TL1）；服务端侧裁剪随动 = `docs/server/design/ledger/LEDGER.md` §9。
- 单元测试档 = 本册件（与 server 面同档——§7 用例指入）。

## 6. 验收判据（AC-32 端侧面对位）

| 需求 AC | 设计级判据 | 载体 |
|---|---|---|
| AC-32①（未登录 ⇒ 团队账不可用 ∥ 个人账照常） | 未登录 ⇒ `team_ledger` 明示不可用 + 零网络（假 fetch 断言零调用）；同会话本机账（`ledger`）照常 | 单元测试档 |
| AC-32②（登录后三端可见——写时自动带仓标记） | 工具五 action 在册（depth-0）∥ 仓自动派生（假 git 面注入 ⇒ 原文上送）∥ 行形四件在列（未决/在途/老化/归属） | 单元测试档 |
| AC-32⑤（无离线缓存） | 工具面零写盘（无缓存文件/无落盘路径）；不可达 ⇒ 明示失败 + 重试零旧值 | 单元测试档 |
| AC-32⑥（显式上送 ∥ 零自动映射） | `team-ledger.mjs` 零 import 本机台账模块（机检 import 面）；上送 = 两步工具动作（零专用导入路径） | 单元测试档 |
| 需求 §3（端侧同批） | 三端零改动 + 核单源到齐（§4 分工表）；端侧实走 = 收口轮（三端任一实走：登录 ⇒ 问 agent 团队台账 ⇒ 建一条 ⇒ 控制台可见） | 单元测试档 + 收口轮（三端实走） |

## 7. 用例（端侧面——并入批内单元测试档）

| # | 用例 | 判据 |
|---|---|---|
| N1 | 未登录 ⇒ `query`/`add` | 明示人话；零 fetch 调用 |
| N2 | 登录后 `add`（假 git 面：仓 A） | 请求体 `repo` = origin 原文；响应落行回显 |
| N3 | `query` 缺省 scope ∥ `scope:"team"` | 请求参 `repo` = 派生值 / 不带 repo；行集逐值 |
| B1 | 无 origin ∥ 非 git 仓 | 明示失败；零请求 |
| B2 | 401 响应 | 出词「登录已失效」；零写盘 |
| B3 | fetch 抛（不可达） | 出词「服务器不可达」；零缓存 |
| E1 | 子代理深度 ⇒ 工具面 | 只读变体（`query`/`count`）；写三 action 不在 schema |

## 8. 边界（本档不做）

- 不做逐端独立面板/状态行/命令行族（D-TL6）；不做端侧缓存/离线队列/自动重发；不做自动上送/映射/同步（需求 ⑤ 明禁）。
- 不承载控制台面（server 侧）∥ 不触本机台账模块 ∥ 不改 `team.mjs` 登录/凭据面。
- 不做服务端 admin agent 的团队账工具（服务端零团队登录——其裁剪面随动 = `docs/server/design/ledger/LEDGER.md` §9）。
