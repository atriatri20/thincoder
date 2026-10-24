# 2026-10-15 · server-mech-closeout
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 22:45「都并并批，能开的都开起来」+ 台账合并扫描（#1271 ∥ #1353 ∥ #1369 ∥ #1397 ∥ #1399 ∥ #1402 ∥ #1403 ∥ #1405 ∥ #1413 ∥ #1415 ∥ #1419 ∥ #1426——server · 归批）。
> 台账 = #1397（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**轮次开账（2026-10-15 22:4x · 主 agent）**：触发 = 用户 22:45「都并并批，能开的都开起来」。**并入（14）**：#1271 镜像 ref 点段加固 ∥ #1327 拆档预案名跨页不一 ∥ #1353 server 发布/装机自洽 ∥ #1369 gitee 两枚卫生 ∥ #1397 建盒失败审计句面 ∥ #1399 chat 落库腿 ∥ #1402 projects act 负腿 ∥ #1403 relay pending 收尾 ∥ #1405 行数越线拆案族（本批触碰档先审拆）∥ #1413 member 收口随正件（先核 #1484 重落后现值）∥ #1415 server-mcp 收口随正件（同先核）∥ #1419 核依赖声明 ∥ #1426 健康检查地址 ∥ **#1485**（exec 传输端口缺省——条件「sandbox exec 面下触碰批」本批自然满足）。**不并**：界面面 10 条 = 另批（server-console-closeout 同点）。授权 = 22:45 令；设计轮点火。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（14 条逐条四元（修法/落点/面/验收）落档；零实施；修正轮（评审 #1–#8）已收正——处置见文末块；披露与上抛见文末）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批 = server 机制/健壮面收口（14 条）**。纲 = 「设计声明面 ↔ 实现面 ↔ 行账面」三面收口：凡实测与设计/行账不符者，以当刻盘面实读为准收正（文档错 ⇒ 改文档；实现缺 ⇒ 补实现）。零新增机制。

- **覆盖条目（14）**：`#1271` `#1327` `#1353` `#1369` `#1397` `#1399` `#1402` `#1403` `#1405` `#1413` `#1415` `#1419` `#1426` `#1485`。
- **明确不在本批**：界面面 10 条（另批——沿 §1 讨论）。
- **需求档**：零回笔（无功能点/验收变更——全为声明面↔实现面收口；需求档状态句由主 agent 笔）。
- **口径声明**：本批行数 = `\n` 换行计数（各档既有口径 ±1 级差在案——`mcp/MCP.md` §10 已注「±1 之差在案，不逐行收」，本批不复核 ±1）。
- **实施轮零新语义**：本批只收口既有声明与既有实现；上抛/披露见文末。
- **本设计轮零实施**：产品码/产品文/前端 i18n = eng-coder 面；设计档随正 = 设计侧（修订轮或实施轮同拍）；本档只列落点。
- **最近先例（修正轮补——评审 #1；坐标三件 = 实现坐标 ∥ 设计节 ∥ 批——对齐 ∥ 偏离）**：
  ① **镜像族形校验**（#1271 对齐项）——实现 = `thincoder-server/src/sandbox/docker.mjs:189-201`（`parseImageRef`——拉取径；域档先例块 = `sandbox/EXECUTION.md:7`）∥ 设计 = `sandbox/SANDBOX.md` §3 镜像族块 ∥ 批 = 镜像族批（批档已清——零留存）——对齐 = 引用形校验前置（非法形 ⇒ 400 零外呼）；偏离 = 删除径增段级 `..` 拒（拉取走 query、删除走 path——注入面不同）。
  ② **审计 `_failed` 族**（#1397 对齐项）——实现 = `thincoder-server/src/sandbox/box.mjs:230`（`quota_apply_failed`）∥ `:610`（`placement_failed`）∥ 设计 = `accounts/ACCOUNTS.md` §2.1 `sandbox_event` 行 ∥ 批 = 执行面批（批档已清）——对齐 = 失败恒一行 + detail 同形（`reason` 截 300）；偏离 = 新增通用步级 kind（专用优先——② 配额步不叠通用行）。
  ③ **掉线收尾**（#1403 对齐项）——实现 = `thincoder-server/src/agent/member-relay.mjs:105-123`（`settleTurn`——掉线径）∥ 设计 = `agent/MEMBER-AGENT.md` §3.4（收尾三径）∥ 批 = 成员面批（批档已清）——对齐 = 同款 settle 形（`{ state, detail }`——零接口新增）；偏离 = 命令收尾 = server 单侧（回合有盒侧对称——命令无盒内对齐动作）。
  ④ **公开包发布**（#1353 对齐项）——实现 = `thincoder-core/package.json:34-36`（`publishConfig.access = public`——已读）∥ 设计 = 零点名（全库 grep 零命中——如实）∥ 批 = 公开包发布批（批档已清）——对齐 = `publishConfig` 同形；偏离 = render-core 首发布（core 已在册）。
  ⑤ **批形**（本批整体）——先例 = 同日收口批族（`docs/batches/2026-10-15-server-console-closeout.md`（同点另批——界面面）∥ `2026-10-15-core-misc-closeout.md`——在盘）——对齐 = 「三面收口」纲（声明面 ↔ 实现面 ↔ 行账；零新机制）；偏离 = 本批触产品码（≈10 档）——另批界面面（文件零交叉）。
  **无先例（显式）**：#1426（探针按配置取址——探针此前固定 `127.0.0.1`，同类先例零）∥ #1485（显式拒——同档「零静默推断」口径先例在场（`docker.mjs:64`/`:90`）——形态先例零）。
- **调研证据（修正轮补——评审 #2）**：查过 = ① 本仓需求/设计全库（`docs/server/requirements/PROJECT.md` ∥ `docs/server/design/**`——各条依据行坐标逐条在案）② 本仓实现面（各条实现坐标——依据行实读）③ `PROJECT-MANIFEST.json`（`index.publicRepos` 实读 = **空**）④ 参考系五仓（`D:\ref\`：kimi-code ∥ MiMo-Code ∥ opencode ∥ oh-my-pi ∥ openclaw——AGENTS.md 注「不入索引」——与本批口径面（引擎/协议/服务端机制）无相关）。**声明源面 = 无独立文档仓相关（照记）**；引擎/协议口径三条（#1271 ∥ #1485 ∥ #1426）依据 = **盘面实读**（本仓实现 + 本批实测；外部引擎文档零取用——照记）。

### 逐条设计（14 条）

| # | 一句话裁定 | 面 |
|---|---|---|
| #1271 | 镜像删除 ref 收严：拒 `..` 段（同拍改 SANDBOX.md §3 与 KD-SV-95） | 产品码 + 设计档 |
| #1327 | store 拆档声明面收正：名已单一（`schema.mjs` 全仓零命中）+ 三处值/状态随实读 | 设计档 |
| #1353 | render-core 随发布（去 `private` + `publishConfig`）＋ server 依赖改 `^0.1.0` | 产品码 + 设计档 |
| #1369 | `readJSON` 去死缺省（必传 + 卫兵）＋ `reposQuery` 去死参 | 产品码 |
| #1397 | 建盒链失败审计兑现：扩 generic `box_step_failed`（步级恒一行） | 产品码 + 设计档 + i18n |
| #1399 | 长 args 落库回归腿（零实现改） | 测试面 |
| #1402 | 项目详情败径回归腿（零实现改） | 测试面 |
| #1403 | 盒掉线 ⇒ pending 命令同款收尾（failed ⇒ UI 可重试） | 产品码 + 设计档 |
| #1405 | 8 档拆/不拆逐判 + 行账触面随正 | 设计档 |
| #1413 | 成员面余件：ACCOUNTS 写入面去「拟新增」＋ `member_event` 入审计枚举/键 | 设计档 + 产品码 |
| #1415 | STORE 列数收正 ＋ MCP PATCH 边界句 ＋ 行账基线随正 | 设计档 |
| #1419 | core 地板 `^0.10.4` ⇒ `^0.10.7` | 产品码 |
| #1426 | 健康探针按配置取址（监听侧不改） | 产品码 + 文档 |
| #1485 | exec 升级路缺端口 ⇒ 显式拒（不做 80/443 分流） | 产品码 |

---

**#1271 镜像删除 ref 点段加固**

- 依据：KD-SV-95（`sandbox/SANDBOX.md:591`——ref 引用字符集含 `/`/`:`/`@`，故走请求体）；实现 = `thincoder-server/src/sandbox/image-routes.mjs:124-130` → `normalizeImageRef`（`src/sandbox/docker.mjs:204-210`——正则 `^[A-Za-z0-9][A-Za-z0-9._:/@-]*$` 放行 `.`，故 `..` 段可直插引擎 DELETE path）。
- 裁定：**收严**——`normalizeImageRef` 增段级检查：按 `/` 拆段含 `..` ⇒ 抛（失败零外呼，路由转 400 人话）。单点 `.`、`:`、`/` 仍合法（正常形零回归）。
- 落点：`src/sandbox/docker.mjs:204-210`；同拍设计句 = `sandbox/SANDBOX.md` §3 镜像删除行 + KD-SV-95 行（补「`.`/`/` 许可、`..` 段拒」边界句）。
- 验收：单测——`..` 段形（如 `a/../b`）⇒ 400 且假引擎调用计数 = 0；正常形（`alpine:3.20` ∥ `sha256:<64hex>` ∥ `lib/img:tag`）逐值仍通。
- 披露：`parseImageRef`（拉取径——`docker.mjs:189-202`）同族**未加固**（拉取 ref 走 query 非 path）——射程外，登记不扩。

**#1327 store 拆档声明面收一声**

- 依据：`store/schema.mjs` 全仓零命中（本批实扫）⇒ 声明面名已统一（单源 = `migrations.mjs`）；残留 = 值陈旧：`store/STORE.md:692`（书「`migrations.mjs` 实读 **711**」——实读 **795/796**）∥ `sandbox/SANDBOX.md:524`（`db.mjs` **688**——实读 **36/37**，迁移段已外拆）∥ `sandbox/SANDBOX.md:533`（`migrations.mjs` ≈**470**——实读 **795/796**）。
- 裁定：**名不动（已单一）、值与状态收正**——拆档实施已完成，按「拆档实施时收一声明面」收口。
- 落点：`store/STORE.md:692` ∥ `sandbox/SANDBOX.md:524`、`:533`（状态表述「拟新增」收为已落形）。
- 验收：三处坐标复读 = 当刻实读（795/796 ∥ 36/37）；`schema.mjs` 零引用复扫 ✓。
- 披露：`:544` 行（`registry.mjs` 564 等）同族陈旧——随 #1405 表收。

**#1353 render-core 随包发布（npm 路自洽）**

- 依据（本批实证）：① `thincoder-server/package.json:17` = `"@thincoder/render-core": "file:../thincoder-render-core"`；② `npm pack` 后 tarball 原样携该 spec（实测 tar 解读）；③ **出树安装不可解析**（本机临时目录两径实测：unscoped 形 exit 0 但依赖落**空壳链接**（`node_modules/<dep>` 空目录——静默坏件）；scoped 形（近真实形 `@qa/srv-x` ⇒ `@qa/dep-x`）npm 直接报错 exit 1）；④ 两个出树消费面 = README §1 npm 路（`npm i -g @thincoder/server`）∥ 收敛径 `deploy/converge.mjs:78-79`（`npm i -g @thincoder/server@<v>`——镜像自升唯一路）；⑤ 树内构建径（`Dockerfile:5` 注 + `:20-25` 双包 pack/并装）可解析 = **同级实体在场**（file: 相对解析）——该径不动。
- 裁定：**render-core 随发布**。否决「句面收窄（宣布 npm 路不可用）」——收敛径依赖 registry 装机、收窄救不了收敛；先例 = `@thincoder/core` 公开包。
- 修法：① `thincoder-render-core/package.json:3-5` 去 `"private": true` + 增 `"publishConfig": {"access": "public"}`（沿 core 先例）；② `thincoder-server/package.json:17` 改 `"^0.1.0"`；③ 构建径复核一次（双本地 tarball + range 依赖 ⇒ 本地 tarball 满足 range、离线可装——实施轮实跑留一行读数）；④ 仓内开发面安装法随正（原「`file:` link 落 node_modules」句删）。
- 落点：两 `package.json` ∥ `Dockerfile:5`（注释句随正）、`:20-25`（构建期预装命令复核）∥ `webui/CHAT.md:28`、`:30`（`file:` 声明句 + 镜像双装句随正）∥ `ops/OPS.md` §5.1（构建期预装句复核）∥ README §1（修后「装机随包解析依赖」成立——句核读）。
- 验收：① 出树装机腿——临时 prefix `npm i -g <双 tarball>` ⇒ 前缀内 `node -e "import('@thincoder/render-core/i18n.mjs')"` 可解析（或 `npm ls` 零 stub 零报错）；② 收敛径静态复核——装机依赖表零 `file:`；③ 构建径实跑一行读数。
- 披露：`file:` 断链两现形态（静默空壳 ∥ npm 报错）实测读数在案；render-core 首发布随核心发布波（发布轮动作）。

**#1369 网关客户端两死角**

- 依据：`src/project/platform-client.mjs:62`（`readJSON` 缺省 `timeoutMs = READ_TIMEOUT_MS`（10s））——两调用点（`:94` roster ∥ `:297` checkToken）均已显式传 `readTimeoutOf(platform)` ⇒ 缺省 = 死面（未来漏传 ⇒ 静默 10s）；`reposQuery`（`:158` 起）`orgOnly` 死参（if 支恒返 `{}`）且 `scope` 参数亦未被消费（同函数死角——本批连带发现）。
- 裁定：① `readJSON` 去缺省 + 卫兵（缺 `timeoutMs` ⇒ 抛——沿「零静默」口径）；② `reposQuery` 去 `orgOnly`（含 if 支）+ 去 `scope`；调用点 `:177` 收正为 `reposQuery(platform)`。
- 落点：`src/project/platform-client.mjs`（`:62`、`:158-166`、`:177`——行以实施当刻为准）。
- 验收：单测——`readJSON` 缺参 ⇒ 抛（断言 message）∥ 两调用点全数传参（源扫）∥ 行为不破腿（gitee 20s ∥ REST 10s 口径复跑）。
- 披露：去 `scope` 系连带项（同函数死角）——若评审认超射程可退（只去 `orgOnly`）。

**#1397 建盒链失败审计（句面兑现）**

- 依据：`sandbox/EXECUTION.md:54`（建盒行「任一步失败 ⇒ 停 + 人话（步名 + 原文）+ 审计」）∥ `sandbox/EXECUTION.md:181` B67（§13 用例——例含网络 409/容器名占用且书「审计」）；实现 = `src/sandbox/box.mjs` `step()`（`:105-112`）链式包装，失败审计仅专用三 kind（`quota_apply_failed` `:230` ∥ `placement_failed` `:610` ∥ `runner_selfcheck_failed`——routes）——卷目录准备 ∥ 镜像就位 ∥ 网络 ∥ 容器 ∥ 启动诸步**零审计行**（步名以 `box.mjs` `step()` 码面为准——码编号 ①④⑤⑥⑦；egress 面已随退场删）。
- 裁定：**扩 generic kind `box_step_failed`**。否决「句面收窄」——B67 验收行即列网络/容器例且书「审计」，收窄 = 改验收面。语义 = **步级失败恒一行**（专用优先：② 配额步专用 kind 已落 ⇒ 不叠通用行；余步 ⇒ `box_step_failed`）；`placement_failed`（外环）照旧——与步级行不互斥（各携其义）。
- 修法：`createWorkspaceBox` 链级 catch（含 ① 前置形错）——`BoxStepError ∧ step ≠ ②` ⇒ `auditBox` 一行：`detail = { kind, workspaceId, runnerId, step, reason（截 300） }`。
- 落点：`src/sandbox/box.mjs`（+≈8）∥ `accounts/ACCOUNTS.md:73` 区（sandbox kind 登记增一行）∥ `public/views-audit.mjs`（`SANDBOX_KIND_KEYS` +1）∥ `i18n-{zh,en}-system.mjs`（`audit.sandboxKind.box_step_failed` +1/表——en 零 CJK）。
- 验收：单测——假引擎 网络步（码号 `⑤ 网络`）抛 ⇒ 审计行 `sandbox_event/box_step_failed`（`detail.step` 逐值 ∥ reason 原文截断）+ 响应人话不变；② 配额步失败 ⇒ 仅 `quota_apply_failed`（零重复行腿）。
- 披露：审计行量增（每失败建盒尝试一行）——接受（重试 = 用户动作，可归因）；`startWorkspaceBox`/`rotateWorkspaceBox` 链不入本句射程。

**#1399 落库长 args 回归腿**

- 依据：落库点 `src/agent/chat.mjs:631`（assistant 行 `data.toolCalls` 走 `argsFullOf` `:270`——掩蔽后全文落库）；`argsTextOf`（`:260`）截断 ≤500 系他面（摘要/审计）；净差 = 长 args（>500）在落库行可 `JSON.parse` 复原（回读面消费）。旧批单元测试档已随零留存删。
- 裁定：**补钉死腿**（零实现改——语义已在位，缺防回归钉）。
- 落点：本批单元测试档（新建）。夹具 = 真库（临时档）+ `runChatTurn`（`chat-routes.mjs:128` 同形调用）注 `deps.chat` 假模型（缝合 = `chat.mjs:550` `deps.chat ?? injectedChat`；亦可用 `setChatTestDeps` `:143`）⇒ 首轮返回一件带长 args 的工具调用（`arguments` = JSON 串 >500 长）⇒ 次轮返回终态文本。
- 验收：断言 `chat_messages` 该 assistant 行 `data.toolCalls[0].args` —— `JSON.parse` 可解 ∧ 长 >500（改回 `argsTextOf` 即红——截断形不可解/超短）。

**#1402 项目详情动作败径回归腿**

- 依据：`public/views-projects.mjs:147-157`（act catch = `showNote(note, mapError(error))`）；旧测试档已随零留存删（夹具可从历史找回 = `git show c8f72e5b:docs/batches/2026-10-13-projects-act-fix.test.mjs`）。
- 裁定：补回归腿（零实现改——实现已在位）。
- 落点：本批单元测试档。夹具 = 假 ctx（`api` 桩抛 4xx）。
- 验收：4xx ⇒ note 显示 `mapError` 人话 ∥ `flash` 零调用（计数桩）∥ 编辑器行未收起（输入件仍在场）。

**#1403 盒掉线命令收尾（relay）**

- 依据：`src/agent/member-relay.mjs` `pending` Map `:77`；`detach` `:251-259`、`tick` `:207-213` 只收尾回合（`settleTurn`）**不收尾 pending 命令**；`sendPull` 无超时 ⇒ 掉线后拉取记录长悬（UI 恒「进行中」至 server 重启）；`runCommand` 有 30s 超时（长悬有界但断线不即败）。settle 形 = `{ state, detail }`（消费 = `member-pull.mjs:78` ∥ `member-routes.mjs:112-119` `valueOf`——`failed` ⇒ 携 `detail.message` 抛人话）。
- 裁定：**掉线两径对 pending 命令同款收尾**（对齐回合径）。`settleCommands(workspaceId, reason)`：逐 pending（该工作区）`delete` + `settle({ state: "failed", detail: { message: BOX_LOST_CMD_MESSAGE } })`；message 常量 = 「工作区连接已断开——命令未完成（工作区恢复后重试）」；三处调用（`detach` `:251-259` ∥ `tick` 三周期失效支 `:207-213` ∥ `closeAll` 停机收口 `:410-417`——回合收尾之后同拍）。消费面：拉取径 = 记录置 `failed` + `detail.message` ⇒ 四态轮询呈败可重试；指令径 = `valueOf` 抛 400 人话（沿盒侧失败同码——零 `valueOf` 改）。
- 落点：`src/agent/member-relay.mjs`（助手 + 三调用点 + 档头注释 `:12-13`「② 掉线」句随正）∥ `agent/MEMBER-AGENT.md` §3.4（收尾三径——命令收尾入句）∥ §3.3 表 `:105` `hello` 行（「未收尾命令重派清单」收窄注——`redeliver` = 连接替换窗残余，非主径）∥ §2 KD-SV-153 行 `:36`（「（含未收尾命令重派）」同注）∥ §3.4 `:139` ③ 行（同注）。
- 验收：单测（假盒桩）——挂一件拉取（假盒不回呈）⇒ 断连 ⇒ 记录 `failed` + `detail.message` ∧ 审计 `member_event/pull`（`ok:false`，`reason` = message）∥ 指令 pending ⇒ 断连 ⇒ 调用方 400 人话（零 30s 挂等）∥ 回连后 `hello.redeliver` 不含已收尾件 ∥ `closeAll`（停机/测试收口）⇒ 未收尾件同款收尾（记录 `failed` + message；pending 清空）。
- 披露：① 瞬断代价——掉线即败（在跑长克隆判败；重试可能撞「目录已存在」）——沿回合径同款语义，接受；② `hello.redeliver` 机制保留（连接替换窗残余——不在本批删）。

**#1405 行数越线复核（8 档逐判 + 行账触面随正）**

- 依据：本批实读（`\n` 计数 ∥ split）：`chat.mjs` **736/737** ∥ `migrations.mjs` **795/796** ∥ `views-sandbox.mjs` **295/296** ∥ `views-me-chat.mjs` **499/500** ∥ `registry.mjs` **419/420** ∥ member-shell `core-run.mjs` **654/655** ∥ `member-routes.mjs` **557/558**；另 `box.mjs` **619/620**（本批触碰档）。台账旧读数（737/520/…）系 10-14 各批收缩前所记——盘面已变。
- 裁定（逐档）：
  - `chat.mjs` = **不拆**（KD-SV-208 微触不拆在案——`agent/ADMIN-AGENT.md:147`；本批零源码触；触发 = 下一触碰批实落净增 >15 ⇒ 先拆后落；拆案对象 = 唤醒径外提）。
  - `migrations.mjs` = **拆（必）**——距 800 硬限仅 4-5 行、>700 外拆线越；**本批零触不执行**；窗口 = 下一迁移触碰批动工第一步；拆案候选 = DDL 常量段（v1–v24 字符串块）外提，`MIGRATIONS` 链与回填留档（纯搬移零语义——沿 `db.mjs` ⇒ `migrations.mjs` 先例）。
  - `views-sandbox.mjs` = **不拆**（越线已消——托管接入块退场精简至 295）。
  - `views-me-chat.mjs` = **不拆**（拆案已执行——四件 + 拉取件在盘；499/500 贴线未越）。
  - `registry.mjs` = **不拆**（死件删净——419）。
  - `core-run.mjs` = **不拆于本批**（零触；654——结构决策随下触碰批审）。
  - `member-routes.mjs` = **不拆于本批**（零触；557——同前）。
  - `box.mjs` = **不拆**（本批变更 = 链级 catch 加性 ≈+8；拆案对象（快照/恢复族外提）与本次零交集——沿「单批不混装结构重构」口径；触发 = 下一触碰批）。
  - 本批其余触碰档（`member-relay` 419 ∥ `docker-exec` 185 ∥ `views-projects` 415 ∥ `platform-client` 312）皆 <500——免拆审。
- 落点（随正）：`sandbox/EXECUTION.md:219`（chat.mjs 692⇒736/737；`:218` = chat-tools 行）∥ `:229-230` 行数读数行（egress/dns-gate 行 = 退场删；box 667⇒619/620；db 300⇒36/37；migrations 710⇒795/796；chat-tools 504⇒562/563；routes 413⇒304/305；registry 419 ✓ ∥ docker 422 ✓ ∥ image-routes 144 ✓ ∥ quota 118⇒120/121 ∥ derive 243 ✓ ∥ 其余行实施轮全表复读一次）∥ `webui/SANDBOX.md:82`（views-sandbox 502⇒295；`:101` 拆分预案句随解）∥ `sandbox/SANDBOX.md:537`（「第二项首选执行」计划措辞 ⇒ 已完成形——`workspace-routes.mjs` 已落）∥ `sandbox/SANDBOX.md:539-544`（registry 销案值 ≈380⇒419；`routes`/`registry` 行值收正——304/305 ∥ 419/420）∥ `sandbox/SANDBOX.md:512`、`:513`、`:530`（§13 表行随正——`routes.mjs` ≈395⇒**304/305** ∥ `registry.mjs` ≈410⇒**419/420** ∥ `box.mjs` ≈567⇒**619/620**；当刻复读）∥ `mcp/MCP.md:203`、`:225`（migrations ≈731⇒795/796 + 硬限余量句收正）。
- 验收：各坐标复读与实读对表；拆/不拆判逐档在案（本档即判）。
- 披露：台账旧读数多系收缩前（views-sandbox 520 ⇒ 实读 295）——本批只收触面坐标，全库行账大扫不做。

**#1413 成员面回填余件（四件合并）**

- 依据（逐件实读）：① **ACCOUNTS 写入点**——`accounts/ACCOUNTS.md:78` `member_event` 行写入面尚书「拟新增」（`member-routes` ∥ `member-relay` ∥ `member-pull` ∥ `member-cred` 四件均已落）⇒ **未正**；② **`member_event` 渲染缺件**——`public/views-audit.mjs:16-33` `AUDIT_TYPES` 16 型在册、**缺 `member_event`**（型面 17 型）；i18n 两 system 表 `audit.type.member_event` **键缺失**（`i18n-{zh,en}-system.mjs:140` 注释自陈「待落」）⇒ **未正**；③ **序数表述残留**——现盘扫描（MEMBER 面四档 + ACCOUNTS + WEBUI：「第X个/项/批/枚/条」∥「序数」）零命中可指认对象；同形候选一处 = `SANDBOX.md:537`「第二项首选执行」（已执行——随 #1405 收正）；④ **views-audit 计数**——`views-audit.mjs:5` 注释「型面十七型——全型收编；本表十六型在册」与实况对不上（本表 16 且缺员）⇒ **未正**。
- 裁定：① 写入面四件去「拟新增」（已落形）；② 补 `AUDIT_TYPES` 增 `["member_event", "audit.type.member_event"]` + 两 system 表补键（zh/en 同步）+ `:5` 注释收正（十七型全收编——随 ④ 同拍）；③ 现盘无残留可收——「已正者销」；候选一处随 #1405 收；④ 同 ②。
- 落点：`accounts/ACCOUNTS.md:78` ∥ `public/views-audit.mjs:5`、`:16-33` ∥ `public/i18n-zh-system.mjs`、`i18n-en-system.mjs`（`:140` 区）。
- 验收：审计页类型下拉含 `member_event`（17 型全员）∥ `audit.type.member_event` 两表在盘（en 零 CJK）∥ ACCOUNTS 写入面零「拟新增」残留（grep 判据）。
- 披露：`member_event` 行 detail 渲染 = 通用模板兜底（多为「—」）——专属模板（kind 六值文案 ∥ tool/summary 行）**未设计不落**（另议）；③ 对象线索仅存合并标题（批档已删不可考）——如评审另有原始线索请指认。

**#1415 设计档估值/边界三件 + 行账基线**

- 依据：① `store/STORE.md:686`（及 `:646`）「表列面**十行** + `name` 唯一 + `transport` CHECK」vs v24 DDL **十一列**实读（`id,name,transport,command,args_json,url,ws_url,secret_cipher,enabled,created_at,updated_at`）⇒ **未正**；② `mcp/MCP.md`:197、:222、:224（§10）三新档估值 **339 ∥ 196 ∥ 137** 与本批实读一致（338/339 ∥ 195/196 ∥ 136/137——±1 级差在案）⇒ **已正**（销）；③ `mcp/MCP.md:51`/`:63` PATCH 边界句——实现语义（`src/mcp/store.mjs:247-248`「敏感三键：缺席 = 不变 ∥ 显式 `null` = 清 ∥ **空串/空对象 = 不变**——清空唯一入口 = `null`；providers『空串 = 清』先例**不沿用**——防静默清凭据」）未书入设计句 ⇒ **未正**；④ 行账基线——`sandbox/EXECUTION.md` §14 行数读数行（随 #1405 落点）∥ `gateway/API.md:344-364` §4 表（forward 208⇒**241** ∥ embedding-admin ≈118⇒**112** ∥ ws ≈260⇒**311** ∥ providers ≈208⇒**253** ∥ system 57⇒**61** ∥ errors ≈70⇒**66** ∥ server ≈255⇒**274** ∥ provider-admin ≈362⇒**365** ∥ routes ≈117⇒**114** ∥ reasoning-levels 88⇒**87** ∥ proxy 267 ✓ ∥ sse-tap 90 ✓ ∥ ratelimit 64 ✓ ∥ config-admin 182 ✓ ∥ proxy-admin 81 ✓ ∥ overview 27 ✓；小计 ≈2454 ⇒ 逐行实读和 ≈**2595**）∥ `agent/ADMIN-AGENT.md:32`/`:147`（chat.mjs 读数 ⇒ 736/737——「内容行」口径注句随实读）。
- 裁定：① 十行 ⇒ **十一行**（两处）；② 销（已正）；③ 设计句补三态全形（§3.1 + §3.2 PATCH 行 + 先例不沿用注——防控制台空串提交静默清凭据）；④ 行账按实读收正（API.md §4 全表 + 小计；EXECUTION §14 触面行——实施轮以当刻复读为准）。
- 落点：`store/STORE.md:646`、`:686` ∥ `mcp/MCP.md:51`、`:63` ∥ `gateway/API.md:344-364` ∥ `sandbox/EXECUTION.md:218-230` ∥ `agent/ADMIN-AGENT.md:32,147`。
- 验收：STORE 两处「十一列」与 DDL 实读对表（`pragma_table_info` 口径）；MCP PATCH 句 ⊇ 三态（缺席/空串/空对象 ⇒ 不变 ∥ `null` ⇒ 清 ∥ 先例不沿用）；API.md §4 逐值与实读对表（±1 注在案）；chat.mjs 口径注句与实读 736/737 一致。

**#1419 核版本地板随正**

- 依据：`thincoder-server/package.json:16` `"@thincoder/core": "^0.10.4"`；核现值 **0.10.7**（CLI 面已 `^0.10.7`）——caret 容差内，纯声明随正。
- 裁定：改 `^0.10.7`（零行为变化——安装面同解析 0.10.x 最新）。
- 落点：`thincoder-server/package.json:16`。
- 验收：字段实读 = `^0.10.7`；与 #1353 ③ 同一次实跑复核。

**#1426 健康探针地址随配置**

- 依据：`Dockerfile:34-38` HEALTHCHECK 固定 `127.0.0.1:8787`；实部署 = 监听 **10.0.0.5:8787**（宿主面监听证据——回环不绑）⇒ 探针恒 `unhealthy`（标注态——不触发重起，但监控面失真）；设计句 `ops/OPS.md:239`（§5.9）「容器路 host 取 0.0.0.0——**探针依赖之**」与实部署形态相抵。
- 裁定：**探针按配置取址**（读 `/app/config/config.json` 的 `host`/`port`；`host` = `0.0.0.0`∥空 ⇒ 探 `127.0.0.1`）。**监听侧不改**——`host` = 「内网接口地址」系字段定义（`ops/OPS.md:29`——`0.0.0.0` 启动警告）+ 实部署已按此配置；改 `0.0.0.0` = 扩暴露面且与部署意图相抵（「监听改回 0.0.0.0」支**否决**）。
- 落点：`Dockerfile:34-38`（HEALTHCHECK 命令）+ `:2-5` 区注释随正；`ops/OPS.md:239`（§5.9 句 ⇒ 「探针按配置 host/port 取值，不再依赖 host 取 0.0.0.0」）；`README.md:246`、`:251`（§12——探活 curl 例改 `<host>:<port>` 形；「端口改 ⇒ 同步改 HEALTHCHECK」句改「探针自动随配置」）。
- 验收：容器内实测（或等价本地假件）——`host=10.0.0.5` 形 ⇒ 探针按 `10.0.0.5:8787` 打（fetch 目标逐值断言）∥ `host=0.0.0.0` ⇒ `127.0.0.1` ∥ `port` 非缺省 ⇒ 目标端口随。
- 披露：探针 = 标注态（不触发重起——README §12 既有句不变）；修的是读数真值，非重起策略。

**#1485 exec 升级路端口死角**

- 依据：`src/sandbox/docker-exec.mjs:99-103`（`const port = url.port === "" ? 80 : Number(url.port)`）；`client.baseUrl` 出自 `normalizeDockerAddress`（`docker.mjs:63-95`）——**保证恒携端口**（缺省补 2375/2376，返回 `<scheme>://<host>:<port>`）⇒ `80` 分流 = **不可达死角**（形变即静默错址）；TLS 行另经 `execUpgradeTransportFor`（`terminal-routes.mjs:85-92`、`:329`）——本函数 = 明文径。
- 裁定：**显式拒**——baseUrl 缺端口 ∥ 非 `http:` ⇒ 抛人话（沿同档「零静默推断」口径——`docker.mjs:64`/`:90`）。**否决「按协议分流 443/80」**：https 分流仍以明文 TCP 打 TLS 口（错形）；TLS 径已分置另一传输。
- 落点：`src/sandbox/docker-exec.mjs:99-103` 区（行以实施当刻为准）。
- 验收：单测两腿——正常 baseUrl（`http://h:2375`）⇒ 目标 host/port 逐值；缺端口感造（`http://h`）⇒ 抛（不静默 80）。

---

### 受影响文件清单（实施面）

**产品码（eng-coder 面——含产品文/前端 i18n）**：

| 档 | 变更 | 条目 |
|---|---|---|
| `thincoder-server/src/sandbox/docker.mjs` | +≈3（ref 段级检查） | #1271 |
| `thincoder-server/src/sandbox/box.mjs` | +≈8（链级 catch） | #1397 |
| `thincoder-server/src/sandbox/docker-exec.mjs` | ±3（显式拒） | #1485 |
| `thincoder-server/src/agent/member-relay.mjs` | +≈15（助手 + 三调用点 + 注释） | #1403 |
| `thincoder-server/src/project/platform-client.mjs` | ±6（去缺省 + 卫兵 + 去死参 + 调用点） | #1369 |
| `thincoder-server/package.json` | 两行（`:16` core 地板 ∥ `:17` render-core 形） | #1419 ∥ #1353 |
| `thincoder-render-core/package.json` | 去 `private` + `publishConfig` | #1353 |
| `thincoder-server/public/views-audit.mjs` | 现读 **245/246** ⇒ +2（枚举 + 注释） | #1413 ∥ #1397 |
| `thincoder-server/public/i18n-zh-system.mjs` / `i18n-en-system.mjs` | 现读 **215/216 ∥ 215/216** ⇒ 各 +2 键（`audit.type.member_event` ∥ `audit.sandboxKind.box_step_failed`） | #1413 ∥ #1397 |
| `thincoder-server/Dockerfile` | 现读 **40/41** ⇒ ≈±5（HEALTHCHECK 命令 ∥ 头注随正） | #1426 ∥ #1353 |
| `thincoder-server/README.md` | §1 核读（±0 或微改）∥ §12 两行 | #1353 ∥ #1426 |

**测试面**：本批单元测试档 ×1（新建——`docs/batches/2026-10-15-server-mech-closeout.test.mjs`（批档同目录——同日先例 = `2026-10-15-inject-project-rules-switch.test.mjs`）；0 ⇒ ≈**300**（估）行；含 #1271 ∥ #1369 ∥ #1397 ∥ #1399 ∥ #1402 ∥ #1403 ∥ #1485 腿；**零留存**——批末删档、§5 留一行读数）。
**测试链随正：不涉**（核 #1413/#1397 的 +2 键/表 ∥ `AUDIT_TYPES`/`SANDBOX_KIND_KEYS` +1）——① R82/R89 名录链五件当刻不在盘（`docs/batches/` 全域实扫唯单测档一件；历史副本仅在 `.thincoder/tmp/`——非维护链）② 在盘测试件实扫零命中本批断言面（`SANDBOX_KIND_KEYS`/`AUDIT_TYPES`/`i18n-{zh,en}-system`——命中全在 tmp 副本 ∥ 产品码 ∥ 设计档）——沿 R72/R89 先例形明记。

**设计档随正（本批落点——设计侧/实施轮同拍）**：`store/STORE.md` ∥ `sandbox/SANDBOX.md` ∥ `sandbox/EXECUTION.md` ∥ `mcp/MCP.md` ∥ `gateway/API.md` ∥ `agent/ADMIN-AGENT.md` ∥ `agent/MEMBER-AGENT.md` ∥ `accounts/ACCOUNTS.md` ∥ `ops/OPS.md` ∥ `webui/CHAT.md` ∥ `webui/SANDBOX.md`；`webui/WEBUI.md`（§1 两计数复核——实读 `public/` 全 72 ∥ `*.mjs` 69，与在册 65∥67/68 对不上，实施轮定口径后逐值落——报告项）。

### 关键决策记录

| # | 决策 | 理由（含否决项） |
|---|---|---|
| D1 | #1397 选「扩 kind」 | B67 验收行即书网络/容器例「+ 审计」——收窄 = 改验收面（否决） |
| D2 | #1426 选「探针随配置」 | `host`=内网接口系 README 明文口径 + 实部署形态；「监听改 0.0.0.0」= 扩暴露面（否决） |
| D3 | #1353 选「render-core 随发布」 | 收敛径 registry 依赖（converge.mjs:78-79）+ 两出树消费面实测不可解析；句面收窄救不了收敛（否决） |
| D4 | #1485 选「显式拒」 | 80 分行不可达（归一保证恒携端口）；协议分流 443/80 = 明文打 TLS 口（否决） |
| D5 | #1403 收尾形 = `{state:"failed", detail:{message}}` | 沿既有 settle/`valueOf` 单源——零接口新增、零 error 码改 |
| D6 | #1405 拆/不拆逐判 | 见 #1405 行（chat/migrations/views-sandbox/views-me-chat/registry/core-run/member-routes/box 八档逐判） |
| D7 | 行数口径 = `\n` 换行计数 | 各档 ±1 级差在案（MCP.md §10 注）——本批不复核 ±1 |

### 披露与上抛

- **FYI**：#1413③「序数表述残留」对象不可考（批档已删；现盘扫描零命中）——同形候选一处随 #1405 收；如评审另有原始线索请指认。
- **FYI**：#1413 `member_event` detail 专属渲染模板未设计不落（通用模板兜底）——是否属「渲染缺件」射程由评审裁。
- **披露**：#1353 `file:` 断链两现形态（静默空壳 ∥ npm 报错）实测读数在案；render-core 首发布 = 发布轮动作。
- **披露**：探针修 = 读数真值（标注态不变）；审计行量增（#1397）接受。
- **临时材料**：本设计轮 npm 实测残留于 `.thincoder/tmp/npmtest/`（临时区——自清/父侧清）。
- 若审计行量增或 `file:` 断链披露需另立设计（如 `redeliver` 机制删除、member detail 模板），先立设计再实施——不混入本批。

**修正轮处置（评审 #1–#8 · 2026-10-15 23:5x——号 → 改动；行号 = 修正轮当刻）**：

| 号 | 处置 | 改动 |
|---|---|---|
| 1 | 「最近先例」块补（五坐标逐项：① 镜像形校验 ∥ ② 审计 `_failed` 族 ∥ ③ 掉线收尾 ∥ ④ 公开包发布 ∥ ⑤ 批形 + 「无先例」两条显式） | 本档 §2 :23–:29（新增） |
| 2 | 「调研证据」块补（含「无相关」照记：`index.publicRepos` 实读 = 空 ∥ 参考系五仓无相关） | 本档 §2 :30（新增） |
| 3 | #1403 三件：`两调用点` ⇒ `三调用点`；句坐标校正（§3.6 不实句删——改指 §3.3 `:105` ∥ §2 `:36` ∥ §3.4 `:139`）；验收补 `closeAll` 腿；表行同拍 | 本档 §2 :113 ∥ :114 ∥ :182 |
| 4 | 同族「拟新增」随正（**就地**——理由：已落文件与标记直接相抵 = 一致性面；同族已由 #1327/#1413① 裁「已落形」收正——本项零新语义随伸） | `accounts/ACCOUNTS.md:70`（6 处）、`:73`（2 处）∥ `sandbox/SANDBOX.md:22`（1 处）∥ `sandbox/EXECUTION.md:145`、`:204`、`:205`、`:206`、`:207`、`:208`、`:209`、`:213`、`:222`、`:247`（10 处） |
| 5 | §13 表行随正（并入 #1405 落点） | `sandbox/SANDBOX.md:512`（≈395⇒**304/305**）∥ `:513`（≈410⇒**419/420**）∥ `:530`（≈567⇒**619/620**）；本档 §2 :130 |
| 6 | 受影响文件表现读补列 | 本档 §2 :186（views-audit **245/246**）∥ :187（i18n **215/216 ∥ 215/216**）∥ :188（Dockerfile **40/41**）∥ :191（新测档 0 ⇒ ≈**300** 估） |
| 7 | 测试链随正：**不涉**——明记（链五件不在盘；在盘测试件零命中本批断言面） | 本档 §2 :191–:192 |
| 8 | `7 档` ⇒ `8 档`（对齐实判八条） | 本档 §2 :44 ∥ :117 |

- **#4 族余量（未列点——披露，未随正）**：`sandbox/SANDBOX.md:223`、`:224`、`:527`、`:528`、`:531`、`:532`、`:552`、`:554` ∥ `accounts/ACCOUNTS.md:77`、`:79`——同形「拟新增」标记（`:533`/`:78` 已随 #1327/#1413① 落点在册）。如评审认须并收 ⇒ 请指认（或另批全库「拟新增」收正）。
- **号外随正（同族一致性面——报告同录）**：本档 §2 :191 测试档落点路径 `thincoder-server/test/` ⇒ `docs/batches/`（同日先例 = `2026-10-15-inject-project-rules-switch.test.mjs` 等批内件皆批档同目录；`thincoder-server/test/` 现仅夹具助手 `rc-resolve.mjs`）。
- **修正轮复读读数（当刻——双口径 = `\n` 计数 ∥ split）**：`routes.mjs` 304/305 ∥ `registry.mjs` 419/420 ∥ `box.mjs` 619/620 ∥ `views-audit.mjs` 245/246 ∥ `Dockerfile` 40/41 ∥ `i18n-{zh,en}-system.mjs` 215/216。

**修正轮处置（实施轮 #54 实读 · 2026-10-16——号 → 实读／更正；行号 = 当刻；遵批档 append-only——原行不改）**：

- **① premise 更正（#1485——本档 §2 `:166-167`）**：原书「TLS 径已分置另一传输——本函数 = 明文径」／「baseUrl 非 `http:` ⇒ 抛」= **与盘面相抵**，作废。**实况**：TLS 腿 == 本函数——`terminal-routes.mjs:313`（`client: clientForRunner(runner, {…})`）⇒ `:329`（`execUpgradeTransportFor(runner, {…})`）⇒ `:330`（`session.execOps = createExecOps({ client: session.client, …(upgradeTransport ? { httpRequestImpl: upgradeTransport } : {}) })`）；`terminal-routes.mjs:85-88`（`execUpgradeTransportFor` 返 `(options) => httpsRequestImpl({ ...options, ca, cert, key })`——只换请求实现，URL 不改）；`docker-exec.mjs:175-186`（单传输：`createExecOps` ⇒ `startExecTransport`，唯 `httpRequestImpl` 有别）。TLS 档 `baseUrl` 恒 `https://`（`docker.mjs:92-94`（`${scheme}://${host}:${port}`——tls ⇒ scheme=`https`）∥ `routes.mjs:121`（`address: check.baseUrl`））⇒ **协议不拒**（拒则 TLS 档容器终端恒败 `engine_unreachable`——与 `sandbox/SANDBOX.md:287`「生效面 = 控制面全谱（…容器/镜像/卷/终端族…）」相抵）。**更正后 = #1485 仅「缺端口 ⇒ 显式拒」**（`docker-exec.mjs:98-101` 现读 = 端口支路独存，零 `url.protocol` 判）。
- **② 验收腿（#1485——本档 §2 `:169`）**：现读 = 「单测两腿——正常 baseUrl（`http://h:2375`）⇒ 目标 host/port 逐值；缺端口感造（`http://h`）⇒ 抛（不静默 80）」——**已无「非 http ⇒ 拒」腿**，与实况一致 ⇒ **零改动**。
- **③ 设计档句（`sandbox/SANDBOX.md:527`）**：现读 = 「**归一地址缺端口明拒**——TLS 腿 = 同函数另一传输，不按 URL scheme 判传输」——**已仅端口**（零「协议明拒」形），与实况一致 ⇒ **零改动**。
- **读数行（当刻）**：`terminal-routes.mjs:329-330` ∥ `docker-exec.mjs:98-101` ∥ `docker.mjs:92-94` ∥ `routes.mjs:121`。
- **派发坐标更正**：派发所指 `docker-exec.mjs:88`（`httpsRequestImpl({ ...options, ca, cert, key })`）实为 `terminal-routes.mjs:88`；`docker-exec.mjs:88` 现读 = `let url`。
- **披露（非本笔三处——请裁／另议）**：① `docker-exec.mjs:75` 头注「地址缺端口 ∥ 非 `http:` 明文径 ⇒ `unreachable`」= 旧形残留（产品码面；`docker-exec.mjs` 属实施轮 `files` 域，本笔零触）；② `sandbox/SANDBOX.md:223`「`docker-exec.mjs`（拟新增）」= 已落档同形残留（#1405／#1413 族余量）；③ 本档 `:203` D4 理由句「协议分流 443/80 = 明文打 TLS 口（否决）」承同一旧前提；④ 行数读数：`docker-exec.mjs` 当刻 **192/193**（`\n`／split）vs `SANDBOX.md:527` 书 195/196——差在案待核。

**修正轮处置（设计侧随正 · 2026-10-16——号 → 改动；行号 = 当刻；append-only——原行不改）**：

**与更正相抵处以本段为准**（本段更正下列 §2 旧读数／旧理由句；被更正之行原位保留，仅作更正前样貌）。

- **① 行数读数（`sandbox/SANDBOX.md:527`）**：`docker-exec.mjs` **195/196 ⇒ 192/193**（当刻 `\n`／split 双口径实读；差因 = #1485 协议支路按父裁删除后档面收缩——本档 §2 `:236` 更正段已记）。
- **② 「拟新增」残留（`sandbox/SANDBOX.md:223`）**：`docker-exec.mjs`（拟新增）⇒（已落）——档已在盘（192/193）。同族余量（`SANDBOX.md:224`／`:528`／`:531`／`:532`／`:552`／`:554` ∥ `ACCOUNTS.md:77`／`:79`）不在本笔——见本档 §2 `:230` 披露行。
- **③ D4 理由句（本档 §2 `:203`）**：原书「协议分流 443/80 = 明文打 TLS 口（否决）」承 #1485 旧 premise（「TLS 腿 = 另置传输」）——实况 = **无协议分流**：TLS 腿走**同一函数**（同一 `createExecOps`／`startExecTransport`，仅注入 `httpRequestImpl`）。更正后理由 = 「归一保证恒携端口 ⇒ 缺端口 = 不可达死角，缺端口明拒；协议分流无立足（TLS 腿同函数另一传输——不按 URL scheme 判）」。
- **④ 声明收窄（「零 registry 依赖／离线可装」过宽——评审 🟡 遗留①）**：
  - `thincoder-server/Dockerfile:3`／`:5`／`:20`：原书「零 registry 依赖 ∥ 离线可装 ∥ 离线可构建」⇒ 实况 = 构建上下文仅含 `thincoder-server` ∥ `thincoder-render-core` 双包（`:21-22`）；`@thincoder/core`（`package.json:16`）不在上下文 ⇒ `npm i -g <两 tgz>`（`:25`）随包解析须 registry（`@thincoder/render-core` 的 `^0.1.0` 由本地 tgz 满足）⇒ **构建非离线**。
  - `thincoder-server/README.md:17`／`:93`：「离线可构建」同收窄（`@thincoder/core` 须 registry——非离线）。
  - 运行时 registry 依赖 = `@thincoder/core` ∥ `@thincoder/render-core`（`thincoder-server/package.json:15-18`）。

**读数随正（§2 读数行 ↔ 交付实读——`\n`／split 双口径；相抵处以本行为准）**：

| §2 行 | 原书 | 交付实读 |
|---|---|---|
| `:119`／`:232`（box.mjs） | 619/620 | **639/640** |
| `:180`（box.mjs delta） | +≈8 | +20 |
| `:129`（docker-exec.mjs） | 185 | **192/193** |
| `:181`（docker-exec.mjs delta） | ±3 | +7 |
| `:129`（member-relay.mjs） | 419 | **438/439** |
| `:182`（member-relay.mjs delta） | +≈15 | +19 |
| `:129`（platform-client.mjs） | 312 | **316/317** |
| `:183`（platform-client.mjs delta） | ±6 | +4 |
| `:186`／`:232`（views-audit.mjs） | 245/246 | **271/272** |
| `:187`／`:232`（i18n-{zh,en}-system.mjs） | 215/216 ∥ 215/216 | **221/222 ∥ 221/222** |
| `:188`／`:232`（Dockerfile） | 40/41 | **41/42** |

- **披露（非本笔——请裁／另议）**：本档 §2 `:119`／`:123` 书 `views-sandbox.mjs` **295/296**（「越线已消」判据），当刻实读 **342/343**——该档非本批触碰件（疑姊妹批／后批变更），不在本笔射程；如认须收 ⇒ 请指认归属批。
- **披露（偏差）**：派发所拟准句「运行时依赖 registry 三件（`electron-updater` ∥ `@thincoder/core` ∥ `@thincoder/render-core`）」——`electron-updater` 系 desktop 面运行期依赖（`thincoder-desktop/package.json:22`），与 `thincoder-server` 无关（`@thincoder/core` 零 `dependencies`）⇒ 本笔按 server 面实况落「`@thincoder/core` ∥ `@thincoder/render-core`」两件，未列 `electron-updater`。

**修正轮处置（fix 轮 · OPS.md 构建句收窄 + 读数表补 · 2026-10-16——号 → 改动；行号 = 当刻；append-only——原行不改）**：

**与更正相抵处以本段为准**（本段收窄 §5.1 两处构建期过宽句，并补读数表一行）。

- **① `ops/OPS.md` 构建期预装句收窄（同机制同过宽句——与 `thincoder-server/Dockerfile:3`/`:5`/`:20` ∥ `README.md:17` 同口径）**：
  - `ops/OPS.md:122-123`（§5.1）原书「**构建零 registry 依赖**（发布前亦可构建验证）」⇒ 收窄为「**构建须 registry**（`@thincoder/core` 不在上下文 ⇒ `npm i -g` 随包解析须 registry——`@thincoder/render-core` 的 `^0.1.0` 由本地 tgz 满足；**构建非离线**）」。
  - `ops/OPS.md:227`（§5.7 Docker 路 ②）原书「构建期预装上下文包体（**离线可构建**）」⇒ 收窄为「构建期预装上下文包体（`@thincoder/core` 不在上下文 ⇒ `npm i -g` 须 registry——构建非离线）」。
  - 口径依据：构建上下文仅含双包（仓根——`thincoder-server` ∥ `thincoder-render-core`）；`@thincoder/core` 不在上下文 ⇒ `npm i -g <两 tgz>` 须 registry。**运行期离线不受影响**——镜像预装版在盘 ⇒ `TC_SERVER_VERSION` 空 = 零网络运行，§5.1 `:123`/`compose` `:137`/`:186`/KD-SV-18 `:309` 各处「离线可运行」句原样成立（该处为运行期性质，非构建期——不在收窄射程）。

**读数表补行（§2 读数随正——续前表；与更正相抵处以本段为准）**：

| §2 行 | 原书 | 当刻实读 |
|---|---|---|
| `:119`／`:123`（views-sandbox.mjs） | 295/296 | **342/343** |

- 该档非本批触碰件（姊妹批／后批变更），已在前一更正段披露（本档 §2 `:271`「非本笔——请裁／另议」），本行入读数随正；口径 = `\n`／split 双口径（本笔当刻复读 = `\n` 342 ∥ split 343）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**设计评审（对象 = server mech 收口批 §2；对象状态 = 设计完成、零实施；射程 = 本批档 + 六档设计档）**

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | 评审项·最近先例 | 🟡 | 本批档无「最近先例」行（三坐标 + 对齐/偏离）；域档同侪均有（`thincoder/docs/server/design/agent/MEMBER-AGENT.md:5`「最近先例（五坐标）」∥ `thincoder/docs/server/design/sandbox/EXECUTION.md:6`「最近先例（实现坐标 ∥ 设计节）」）；批内仅散见（`thincoder/docs/batches/2026-10-15-server-mech-closeout.md:64`「先例 = `@thincoder/core` 公开包」），「无先例」处无显式声明 | 补一条最近先例行（先例实现坐标 ∥ 设计节 ∥ 批 + 对齐点/偏离点与理由）；无先例项显式声明「无先例」 |
| 2 | 评审项·调研证据 | 🟡 | 无「调研证据」行——公有源文档核查清单 ∥ 相关性结论全缺；涉引擎/协议口径条（#1271 ∥ #1485 ∥ #1426）依据全为盘面实读 | 补调研证据行；无相关亦须明记（不得静默跳过） |
| 3 | Clarity（#1403） | 🟡 | `…closeout.md:104` 裁定列「三处调用」并点名 `detach`/`tick`/`closeAll` vs `:105`/`:174`「（助手 + 两调用点 + 档头注释」；`:105` 指「§3.6 拉仓行（「未收尾命令随重派」句随正为「掉线即收尾」）」——`MEMBER-AGENT.md` §3.6 无该句（近句 = `:36`「（含未收尾命令重派）」∥ `:105`「未收尾命令重派清单」），且 `:105` 实属 §3.3 被标「§3.4 表」；验收无 `closeAll` 腿 | 调用点数/节号/句子坐标三处对齐；`closeAll` 入裁定则验收补腿，或明确不从 |
| 4 | Doc-state（「拟新增」残留） | 🟡 | #1413① 只收 `thincoder/docs/server/design/accounts/ACCOUNTS.md:78`：同档 `:70` 仍书「（拟新增——执行面：工作区/盒/快照面）」（box.mjs）vs `thincoder/docs/server/design/sandbox/SANDBOX.md:530`「`thincoder-server/src/sandbox/box.mjs`（已落）」——直接相抵（`derive`/`workspace-routes`/`terminal-routes`/`docker-tls` 同形）；#1327 只收 `SANDBOX.md:533`，同档 `:22`「迁移段外提 `src/store/migrations.mjs`（拟新增）」同形；`thincoder/docs/server/design/sandbox/EXECUTION.md:145`「拆案（已实施）」与「（拟新增」同句自相抵、`:247` 同（`§14` 表 `:204` 等同上） | 同族残留并入落点或列入披露，随「已落/已实施」同拍收正 |
| 5 | Doc-state（读数行） | 🟡 | #1405 落点 = `SANDBOX.md:539-544`（routes/registry 行值 ⇒ 304/305 ∥ 419/420），同节 §13 表行未列：`:512`（routes.mjs ≈395）∥ `:513`（registry.mjs ≈410）∥ `:530`（box.mjs ≈567）——收后同节并存两组读数 | 落点扩及 §13 表同族行（或按口径声明明示不收并注记） |
| 6 | 受影响文件注记 | 🟡 | 文件表未带 `public/views-audit.mjs`（+2）∥ `Dockerfile`（HEALTHCHECK + 注释）现读数与新建测试档规模估计（他项齐：box 619/620 ∥ member-relay 419 ∥ docker-exec 185 ∥ platform-client 312 ∥ docker 422；两 i18n 表计数在 `SANDBOX.md:648` R72 行在案） | 补三档现读数/预计 delta 与测试档规模估计 |
| 7 | 受影响文件注记（测试随正） | 🟡 | #1413/#1397 增 i18n 键（+2/表）并改 `AUDIT_TYPES`/`SANDBOX_KIND_KEYS`，未列既有测试随正件——前批同类均列（`SANDBOX.md:648`「两 i18n system 表 +2 键/表」；`MEMBER-AGENT.md:434`「键数就地收正 + 指纹 sha256 重算」）；当刻测试链在盘状态 = 射程外（未验） | 核键数/档目断言件，随正件补入文件表或明记「不涉」 |
| 8 | Clarity（计数） | 🔵 | 「7 档」vs 实判八档：`:36`/`:109`「7 档」vs `:196` D6「八档逐判」（正文八条逐档） | 数字对齐（7+1 或 8） |

已核（不加分）：#1327 三坐标（`STORE.md:692` ∥ `SANDBOX.md:524`/`:533`）与实读值互证；#1415①（`STORE.md:646`/`:686` vs v24 DDL 十一列）实抵；#1413①（`ACCOUNTS.md:78` 四处「拟新增」）实抵；#1397 依据（`EXECUTION.md:54`/`:181`）实抵；#1405 读数档内互证（`MEMBER-AGENT.md:361` 499 ∥ `:349` 557 ∥ `:356` 654 ∥ `EXECUTION.md:230` 419）；#1485 依据与 `SANDBOX.md:52`/`EXECUTION.md:35` 归一保证互证。

计数：🔴 0 ∥ 🟡 7 ∥ 🔵 1
VERDICT: pass

## §4 用户批准（主 agent）

**用户批准**：2026-10-15 23:54「**批**」（11 批队列放行——本批实施轮 `eng-coder#54` 在其列）。**实施面** = 台账 14 行（#1271 镜像 ref 段级加固 ∥ #1327 拆档预案名跨页 ∥ #1353 发布/装机自洽 ∥ #1369 gitee 两枚卫生 ∥ #1397 建盒失败审计句面 ∥ #1399 chat 落库腿 ∥ #1402 项目详情败径 ∥ #1403 relay pending 收尾 ∥ #1405 行数越线拆案族 ∥ #1413 member 收口随正 ∥ #1415 server-mcp 收口随正 ∥ #1419 核依赖声明 ∥ #1426 健康检查地址 ∥ #1485 exec 升级路端口死角）；23 路径 + 11 设计档随正。**面外**：产品文案/设计随正若干 ⇒ 归他批或已随正。

## §5 实施记录（eng-coder）
**状态行**：实施完成（14 条全落 · 单测 10/10 绿后已删档 · 偏离审计+代码评审各 1 轮终态 clean（2 项遗留非本批面））



### §5 实施记录（eng-coder）

**交付摘要**：14 条全落（`#1271` `#1327` `#1353` `#1369` `#1397` `#1399` `#1402` `#1403` `#1405` `#1413` `#1415` `#1419` `#1426` `#1485`）。

**产品码**（当刻盘面，未提交）
- `thincoder-server/src/sandbox/docker.mjs`（#1271）：`normalizeImageRef` 增段级检查（按 `/` 拆段含 `..` ⇒ 抛）+ JSDoc 边界句；路由面 400 与「形错先于外呼」由既有调用链自动成立（单测 T2 实证零引擎外呼）。
- `thincoder-server/src/sandbox/box.mjs`（#1397）：抽 `createBoxChain`（链本体零改），`createWorkspaceBox` 加链级 try/catch ⇒ `BoxStepError ∧ step !== "② 配额就位"` 落一行 `sandbox_event/box_step_failed`（`detail = { kind, workspaceId, runnerId, step, reason（截 300） }`，`target = workspace.name`）；错误原样透传（响应人话零变）；② 配额步走专用 `quota_apply_failed`（不叠通用行）。
- `thincoder-server/src/sandbox/docker-exec.mjs`（#1485）：归一地址缺端口 ⇒ 显式拒（去 80 兜底）；**协议支路已删**（见 D-1）。
- `thincoder-server/src/agent/member-relay.mjs`（#1403）：导出 `BOX_LOST_CMD_MESSAGE` + 私有 `settleCommands(workspaceId)`；三调用点 = `tick`（三周期判掉线）∥ `detach` ∥ `closeAll`（停机）——拉取件落 `member_event`（`kind:"pull"`、`ok:false`、`reason` = 同常量），指令件回呈同形（消费面 `valueOf` 零改）。
- `thincoder-server/src/project/platform-client.mjs`（#1369）：`readJSON` 去 `timeoutMs` 死缺省 + 非有限数卫兵；`reposQuery(platform)` 去死参/死支路（两调用点同拍）。
- `thincoder-server/package.json`（#1419 ∥ #1353）：`@thincoder/core ^0.10.7` ∥ `@thincoder/render-core ^0.1.0`（原 `file:../thincoder-render-core`）；`thincoder-render-core/package.json`（#1353）：去 `private` + 增 `publishConfig.access=public`。
- `thincoder-server/Dockerfile`（#1426）：HEALTHCHECK 按 `/app/config/config.json` 的 `host`/`port` 取址（`0.0.0.0` ∥ 空 ∥ 档缺 ⇒ `127.0.0.1`；`port` 缺 ⇒ 8787；非对象 JSON 亦兜住）+ 头注随正。
- `thincoder-server/public/views-audit.mjs` ∥ `i18n-zh-system.mjs` ∥ `i18n-en-system.mjs`（#1413①② ∥ #1397）：`AUDIT_TYPES` 增 `member_event`（全 17 型）∥ `SANDBOX_KIND_KEYS` 增 `box_step_failed`；两 i18n 表各 +2 键。
- `thincoder-server/README.md`（#1426）；`thincoder-server/package.json` ∥ `Dockerfile` 头注同拍。

**设计档随正（本批落点）**：`sandbox/SANDBOX.md` ∥ `sandbox/EXECUTION.md` ∥ `store/STORE.md` ∥ `mcp/MCP.md` ∥ `gateway/API.md` ∥ `agent/ADMIN-AGENT.md` ∥ `agent/MEMBER-AGENT.md` ∥ `accounts/ACCOUNTS.md` ∥ `ops/OPS.md` ∥ `webui/CHAT.md` ∥ `webui/WEBUI.md`；域外一档 `PROJECT.md`（见 D-3）。

**批内单测档**：`docs/batches/2026-10-15-server-mech-closeout.test.mjs`（10 腿，T1–T10）——跑绿后**已删（零留存）**。

**读数行**：`node --test docs/batches/2026-10-15-server-mech-closeout.test.mjs`（cwd = 仓根 `thincoder/`）⇒ `tests 10 ∥ pass 10 ∥ fail 0`（末轮 = 协议支路删除 + T7 重写后）。旁证读数：#1353 双 tgz 装机 `npm i -g --prefix <tmp> <两 tgz>` ⇒ exit 0「added 3 packages」零 stub（`npm ls -g --depth=0` 零报错）；#1426 假件四态逐值（`10.0.0.5:8787` ∥ `0.0.0.0:9000` ⇒ `127.0.0.1:9000` ∥ 档缺 ⇒ `127.0.0.1:8787` ∥ 非对象 JSON ⇒ `127.0.0.1:8787`）。**集成面：本批零新增集成用例（父侧收口跑为唯一集成跑）。**

**决策透明表**
| # | 决策 | 依据 |
|---|---|---|
| D-1 | #1485 **删协议支路**（保留缺端口拒） | 设计 premise「TLS 径已分置另一传输」与实读相抵：`terminal-routes.mjs:329-330` 把 TLS 传输注入**同一** `startExecTransport`（该档 `:88` `httpsRequestImpl` 包装只换请求实现、不改 URL），TLS 节点 `baseUrl` 恒 `https://`（`routes.mjs:121` ＋ `docker.mjs:94`）⇒ 协议支路把**已交付的 TLS 档容器终端**打成恒败（`engine_unreachable`），并与 `SANDBOX.md:287` 生效面句相抵。已发 ask（`[上抛·待裁]`），**父侧裁 (a)：勿复原、照删**；设计侧 premise 句 ∥ 验收腿 ∥ `SANDBOX.md:527` = 父侧另派设计轮 |
| D-2 | `SANDBOX.md:527` 一句随删同拍收正（「归一地址端口/协议明拒」⇒「缺端口明拒——TLS 腿 = 同函数另一传输」） | 同 D-1；该句系本轮随正时我写入，删码即失真——已落（若与设计轮笔触相抵，以设计轮为准） |
| D-3 | 域外改 `PROJECT.md:77`/`:79`（render-core `file:` 形句 ⇒ registry 版本声明形 `^0.1.0`） | #1353 使该句失真（`file:` 已去 ∥ `private` 已撤）；属同机制失真面。**设计档清单外，已披露** |
| D-4 | `SANDBOX.md` §13 表 ∥ `EXECUTION.md` §14 表**全表复读**（逐值以盘面实读） | #1405 明令「其余行实施轮全表复读一次」；口径 = `\n` 换行计数/总行 双值（沿表内既有 `304/305` 同形） |
| D-5 | 姊妹批让行：`webui/SANDBOX.md:82`/`:101` **不落** | 父侧 00:15 裁决（归姊妹批；最终值父侧统一核正） |

**审计与代码评审轮次与终态**
| 轮次 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部偏离审计（explore，只读） | 3 偏离 + 1 清单外 | ① `ACCOUNTS.md:80` `member_event` 行 4 处「拟新增」⇒ 已收正；② `CHAT.md:30` Dockerfile 实读串值（46/47 系 `deploy/sandbox/Dockerfile` 值；`thincoder-server/Dockerfile` 真值 41/42）⇒ 已收正；③ 清单外 `PROJECT.md` ⇒ 披露（D-3）；④ 另补 `MEMBER-AGENT.md:105`/`:139` 残余径注句 |
| 2 | 独立代码评审（advisor，type=code） | **changes-required**（1 🔴 ∥ 3 🟡 ∥ 3 🔵） | 🔴 = D-1（已修）；🟡 = T7 验收腿钉错前提（已重写）∥ Dockerfile+README「零 registry 依赖/离线可装」过宽（**未改**——设计侧声明口径，父侧事项）∥ `box.mjs` 639 越 500 建议线（批内已裁不拆，承接批待定）；🔵 = 批档三处读数待收口 ∥ T8 墙钟脆性 ∥ 审计页不渲 `step`/`reason`（与既有族同形，仅记） |
| 终态 | —— | **clean（本批范围）∥ 2 项遗留（均非本批面）** | 遗留①=「零 registry 依赖/离线可装」句（`@thincoder/core` 不在构建上下文、须 registry）；遗留②=`box.mjs` 越线承接批归属 ∥ 批档读数收正 = 父侧事项 |

**fix round**：3 轮（① 首轮 10/10 绿 → ② 偏离审计后 4 处修 → ③ 评审 🔴/🟡 修 + T7 重写 ⇒ 10/10 绿）；每轮仅跑本批单测档，未动它批档。

### §5 补记（fix 轮 · 2026-10-16 00:5x——#1485 头注旧形收正）

**笔 1**：`thincoder-server/src/sandbox/docker-exec.mjs:75`（头注）——旧形「地址缺端口 ∥ 非 `http:` 明文径 ⇒ `unreachable`」⇒ 现形「地址缺端口 ⇒ `unreachable`（#1485——显式拒，零静默兜底；**不按 URL scheme 判传输**——TLS 腿 = 同函数另一请求实现） ∥ 连不上 ⇒ `unreachable` ∥ 超时 ⇒ `timeout` ∥ 非 101（引擎拒）⇒ `api`」。依据 = 实现面 `:98-101` 现为端口支路独存（协议支路已随 D-1 父裁删除）；`SANDBOX.md:527` 生效面句已为同形（缺端口明拒 ∥ 不按 scheme 判传输）。零逻辑改、零其余注释改、零 `box.mjs` 触、零设计档触。

**读数行**：① `node --check thincoder-server/src/sandbox/docker-exec.mjs` ⇒ Syntax OK；② 全档 `url.protocol` 扫描 ⇒ 零命中（`grep` 零匹配 + node 逐行扫 `[]`）；③ 行数 = **192/193**（`\n` 计数 192 ∥ split 193）——与 `SANDBOX.md:527` 在册值一致；④ 批内件：无（注释笔零测试件，无删档动作）。

## §6 验证与收口（父代理）

**收口（父侧 · 2026-10-16）**

**① 验证读数（本批验证行）**：`node --test docs/batches/2026-10-15-server-mech-closeout.test.mjs`（cwd = 仓根）⇒ **tests 10 ∥ pass 10 ∥ fail 0**（末轮 = #1485 协议支路按裁删除 + T7 重写后；**该档已随 #54 收口用毕即删** ✓）；八个改动 `.mjs` `node --check` 全 OK；HEALTHCHECK 假件四态（`10.0.0.5:8787` ∥ `0.0.0.0:9000⇒127.0.0.1:9000` ∥ 档缺⇒`127.0.0.1:8787` ∥ 非对象 JSON⇒同上）✓；装机实证 `npm pack` 双包 ⇒ `npm i -g --prefix <tmp>` exit 0「added 3 packages」零 stub ✓；设计档锚点 13 档逐锚在位 ✓。**内部**：偏离审计 1 轮零偏离 ∥ 独立代码评审 1 轮 `changes-required` → 修 → 复查面全绿 ∥ fix 3 轮；终态 **`clean`**。**集成测试** = 未跑（本仓仓根无集成档——如实记「未集成验」）。

**② 集成场景影响**：无（机制/审计/文案/构建面——无业务场景增删）。

**③ 核销结算**：台账 14 行（#1271/#1327/#1353/#1369/#1397/#1399/#1402/#1403/#1405/#1413/#1415/#1419/#1426/#1485）逐行核销。

**④ 暂缓批复核**：无。

**⑤ 结算同步清单**：角色表 ✓ ∥ 状态行 ✓ ∥ 计数（14 行）✓ ∥ 指针 → 本档 ✓ ∥ 待办勾销 ✓ ∥ 前批遗留交叉核（`webui/SANDBOX.md:82/:101` 两行 = 兄弟批争点 ⇒ 让行、最终值父侧另核，已入册 #1510）✓。

**⑥ 落点 L11 空挂说明（承 #79 上抛·知会）**：设计 §2 落点表 L11 所钉「既有单测件 421 行（假件 `findmnt` 读数行补 `SOURCE`）」在**实施当刻已不在盘**——该档随 #54 收口按「单测件用毕即删」删除（设计/评审读到它时仍在）。⇒ **L11 无可改对象**：本批零改、不新建（新建 = 他批件，越界）；`parseFindmnt` 增 `SOURCE` 列**零回归风险**（唯一在盘消费者为该已删件）。**该空挂已由 #79 如实上抛**，非缺陷、非漏做。

**⑦ 收口轮补正（三笔 fix 轮 · 父侧派发）**：#80（`SANDBOX.md:527` `docker-exec.mjs` **195/196 ⇒ 192/193** ∥ `:223`「拟新增」⇒「已落」∥ 批档 §2 D4 旧前提更正段 ∥ `Dockerfile:3/:5/:20` + `README:17/:93`「零 registry 依赖／离线可装」**收窄**为「核心包不在上下文 ⇒ 须 registry ⇒ 构建非离线」∥ 批档 §2 读数随正表 11 行）∥ #81（`docker-exec.mjs:75` 头注旧形 ⇒ 现形；`url.protocol` 全档零命中；行数双口径 192/193）∥ #84（`ops/OPS.md:123`/`:227` 同机制同过宽句按同口径收窄；批档读数表 append `views-sandbox.mjs` **342/343**）。三笔皆**收口前落定**（不开冻结窗后修）。

**⑧ 父侧披露（可 revert）**：① 批档读数表 11 行 + `views-sandbox.mjs` 342/343 = **报告态读数**（`checkLineCounts` 类）非判据，随各批落地持续漂移；② 本批 §1 未另书直笔说明（无父侧直笔产品码改动——三笔补正均走设计轮）。

**⑨ 结算行**：台账 14 行 → 已核销（逐行 evidence 见台账）。
