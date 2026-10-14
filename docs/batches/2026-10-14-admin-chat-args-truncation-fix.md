# 2026-10-14 · 管理面会话工具参数截断修复
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-14 · 来源 = 用户 2026-10-14 01:15 报障「管理面会话对 qwen3.7 等几个千问系模型的支持似乎有问题……但是调用同样 qwen provider 提供的 deepseek-v4.1-flash 就可以」+ 01:18「修」；根因实读 = 工具参数落库被截断成坏 JSON（**修复前** `chat.mjs:587` 用帧口径 `argsTextOf` 写库；改后落库点 = `:596`——新增 `argsFullOf` 块下移）⇒ 回放撞 dashscope 严校验 400（详见 §1）。
> 台账 = #1396（server · 归批）。前情 = 无（独立批——轻通道轮）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-14
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**2026-10-14 · 管理面会话工具参数截断修复（轻通道轮）**

- **来源**：用户 01:15 报障（原话：「管理面会话对qwen3.7等几个千问系模型的支持似乎有问题，会话直接报"模型调用失败——本轮已收尾"，但是调用同样qwen provider提供的deepseek-v4.1-flash就可以。」）+ 01:18「修」。
- **诊断（真机取证——全部实读）**：① .5 日志 17:08:03Z ∥ 17:08:39Z 两次 `POST /v1/chat/completions → 400`；② 上游 400 原文（库内 notice 行）= `InternalError.Algo.InvalidParameter: The "function.arguments" parameter of the code model must be in JSON format.`；③ 扫 chat 6 全量 61 个工具调用 = **14 个 `args` 在整 500 字符处截断**（`Unterminated string in JSON at position 500`——全是长 bash 脚本）；④ 根因 = `chat.mjs` 落库时用帧口径 `argsTextOf`（掩蔽后 `capText ≤500`）⇒ 残 JSON 入 `data_json` ⇒ 回放面（`chat-store.mjs` `messageOfRow`/`recordOfRow`）原样回灌为 `function.arguments` ⇒ dashscope 严校验 400（deepseek 宽容照吃 ⇒ 表症「qwen 不支持」）。
- **裁定**：缺陷修（实现与「回放逐字一致」口径相抵——`≤500` 为 `call` 帧/审计面口径，误用于落库面）。轻通道走；掩蔽保留（秘密零落库）。
- **变更（父侧直笔——可 revert）**：① `chat.mjs` 增 `argsFullOf`（掩蔽、JSON 有效、不截断）+ 落库点改用它 + 帧点改取 `argsTextOf`（帧面 ≤500 零变）；② `chat-store.mjs` 增 `replayArgsOf`（净化：非 JSON 串 ⇒ `"{}"`；合法逐字；非串 ⇒ `JSON.stringify`）+ `messageOfRow`/`recordOfRow` 两调用点；③ 设计句 = `agent/ADMIN-AGENT.md` §17.3 A1 配套件 ③ + 变更记录行。
- **红/绿对照**：红 = 现码实跑（落库形 500 ⇒ JSON.parse FAIL at 500 ∥ 回放 emit 500 ⇒ 同 FAIL——与 .5 同症）；绿 = 批内件 `2026-10-14-admin-chat-args-truncation-fix.test.mjs` **4/4 pass**（落库全文 ∥ 帧摘要不动 ∥ 回放净化 ∥ 记录面同拍）。
- **存量坏行**：不做数据迁移——部署后回放面自动净化（坏 ⇒ `{}`）。
- **收尾链**：设计句 ✓ → 独立评审 + 用户批准 + 结算 = 收口波之后（随 .5 部署 + 真机复测 qwen3.7-flash 一并走）。

## §2 批次任务与设计（eng-designer）
**状态行**：（eng-designer 写入时更新）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>
## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）

**批准（用户 · 2026-10-14 01:36——原话「全收口」）**

- 独立评审 #122 = **pass**（0🔴 ∥ 3🟡 ∥ 5🔵）；逐条裁定已落 §6（Fixed 4 ∥ Not an issue 2 ∥ Deferred 2〔#1399/#1400 在册〕）。
- 收正件复跑 **4/4 绿** ∥ .5 部署读数（`healthz:200` ∥ 容器内 `null-branch in box: true`）。
- **本档随本段冻结**（已收口）。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

**收口（父侧 · 2026-10-14 01:4x）**

## 一、独立评审（收尾链 · 评审子代理 #122）

- **VERDICT：pass**（0🔴 ∥ 3🟡 可选 ∥ 5🔵）；范围 = `chat.mjs` ∥ `chat-store.mjs` ∥ 批内件 ∥ 本档 ∥ `ADMIN-AGENT.md` A1③。
- **逐条裁定**：#1（文件 702 行 >500 软线）⇒ **Not an issue**（720 拆档裁定在册——R3 不重开；已登记，见 #6）；#2（落库点接线无腿钉）⇒ **Deferred**（挂 #1399——下一批触碰 chat.mjs 者随拍；纯函数四腿 + 回放不变式已覆盖当前风险面）；#3（非对象根/非法入参：掩蔽不生效且全文留存）⇒ **Fixed**（`argsFullOf` 兜底 `"{}"`——`chat.mjs:264-269`；批内件 +2 腿）；#4（回放非串支输出可标量）⇒ **Not an issue**（技术反证：stringify 支保遗留非串行 ↔ 标量恒 JSON 有效 ⇒ 不撞 400；现盘写入面恒字符串 ⇒ 不可达）；#5（坐标漂移 587/596）⇒ **Fixed**（本档 :3 加「修复前/改后」限定）；#6（§6 行账未回填）⇒ **Deferred**（随下一批落地回填同拍——MCP 批预算已含 chat.mjs 行刷新）；#7（段面未收口）⇒ **本 §6 + 结算落**；#8（体量披露缺口）⇒ **Fixed**（A1③ 补披露句：落库/详情 `args` 无 500 上限；帧/审计面仍 ≤500）。
- **范围外注记**：a) `views-chat-messages.mjs:91` 回读工具卡参数恒空（与本次修复无因果）⇒ 挂 **#1400**；b) `chat-compact.mjs:137` 注释陈化（修后 chat 面传掩蔽原文）⇒ **Fixed**（随正已落——`chat-compact.mjs:137`）。

## 二、落件与实跑

- 修复主件 = `chat.mjs` `argsFullOf`（掩蔽原文、JSON 有效、不截断）∥ `chat-store.mjs` `replayArgsOf`（回放净化：非 JSON ⇒ `"{}"`，合法逐字）；评审收正 = 非对象根兜底 + `chat-compact.mjs` 注释随正 + A1③ 两句补。
- **批内件 4/4 绿**（含新增两腿：非对象根（数组）⇒ `"{}"` ∥ 非法 JSON ⇒ `"{}"`）。
- **提交**：`f3c65902`（主修 + 守卫重锚）∥ `8c6f0724`（评审收正）；gitee + github 双推 ✓。
- **部署**：.5 重建（`docker build -f thincoder-server/Dockerfile` ⇒ 像 `d8124c49d81e`）⇒ healthz **200** ∥ 容器内实读 `null-branch in box: true`（评审收正件在箱）。
- **红/绿对**：红 = 现码实跑（落库形 500 处 `Unterminated string` FAIL——与 .5 200 现场同症）；绿 = 4/4（上表）。
- **存量坏行**：零迁移——部署后回放面自动净化（坏 ⇒ `{}`）；用户面复测 = 任意 qwen3.7 系会话发一条（待用户走查）。

## 三、段面（轻通道轮契约）

- **§2 / §5 = 不适用**（轻通道轮——设计形式化落 `ADMIN-AGENT.md` §17.3 A1③；实施面 = §1 直笔，全链 1 手）。
- **§4 用户批准** = 结算时落；§1 状态行随整档 close 翻「已收口」。
