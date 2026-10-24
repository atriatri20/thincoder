# 2026-10-17 · deepseek-search-fetch
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-17 · 来源 = 用户 2026-10-17 19:05「search fetch要接啊」+ 19:11「复用 DeepSeek 预置 provider、零改动自动接入」+ 19:12「行」；需求 = docs/core/requirements/TOOLS.md §4.9。
> 台账 = #1605（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口（17/17 亲跑（零真实网络）∥ NW1 无渠道逐字不变 ∥ config 524（≤528）∥ CHANGELOG 两产品 [Unreleased] 已补 ∥ 设计 7 处行号 + ⑧ 13 行读数 + ④ 零提示面已随正；槽已 consume）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**讨论收口（2026-10-17 19:14 · 主 agent）**

**需求来源** = 用户 19:05「search fetch要接啊」⇒ 核查官方 API（`api-docs.deepseek.com`：`/v1/tools/search` ∥ `/v1/tools/fetch`，2026-10-17 开放；计费按成功请求 $0.75/千次；各 5 QPS）与仓内现状（`websearch` = Tavily → Bing（`thincoder-core/tools/web.mjs:112`）；`fetch` = 本地直取（`:184`）；挡路约束 = 需求档 §4.2 F6 旧句「不设独立后端选择键」——正值其「多后端并存到来时另批设计选择面」之门）。

**用户裁决**（19:11「我觉得还是复用方便，我希望配了deepseek预置provider的用户能够零改动自动接入」+ 19:12「行」）：

1. **key 来源 = 复用 `providers[]` 里 DeepSeek 官方渠道的 apiKey**（不另设独立键）；资格 = baseURL host = `api.deepseek.com` ∧ key 非空 ⇒ 零配置自动接入。
2. **反代 / 中转渠道不自动接**（仅官方 host 自动启用；显式 baseURL 覆盖留槽位）。
3. 优先级 = search：DeepSeek → Tavily → Bing ∥ fetch：DeepSeek → 本地直取。
4. 软着陆 + 会话内熔断（401/402/403/404 熔断；408/429/5xx 退避一次）。
5. 可选逃生口 `websearch.backend` / `fetch.backend` ∈ {auto, local}（缺省 auto）。

**落点** = 需求 `docs/core/requirements/TOOLS.md` §4.9（W1–W6 ∥ NW1–NW4 ∥ 范围边界 ∥ 验收方向；F6 与 §4.4 边界同拍收正——父侧 19:14 已落）。**台账** = #1605。

**预点火合并扫描** = 同板 / 同池近邻（#1601 context 读数漂移 · #1603 VSC 过期坐标族 · #1604 server 计数漂移）均**不同面** ⇒ 零可并条目；本批独立。

**下一步** = eng-designer 开设计（`docs/core/design/TOOLS.md` 新节 + `docs/core/design/CONFIG.md` 配置键面）→ 用户点评审 → 批准后 eng-coder 实现。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成 · 2026-10-17（fix 轮：主 agent 两条语义裁定已落（CORE-UNIFICATION §2.8.1 子表在册 · 返回态四态 + 提示行按因分叉）· 待复审）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**批次任务（2026-10-17 · deepseek-search-fetch · 台账 #1605 · round = initial）**

**覆盖条目**（与需求档 §4.9 同源）：W1 零配置自动接入（`providers[]` 官方 host 探测 + 结果标 `[deepseek]`）· W2 结构化结果（summary 为主 + date ∥ authority ∥ rerank 标；`limit → count` 夹取；运算符透传；`need_content=false`）· W3 Markdown 抓取（title + content；私网 URL 零外发）· W4 软着陆（401/402/403/404 熔断；408/429/5xx 退避一次；任何腿工具调用不失败）· W5 逃生口（`websearch.backend` / `fetch.backend` ∈ {auto, local}）· W6 文档与描述面同步 · NW1 零行为回归（快照逐字）· NW2 零新依赖 · NW3 成本可见（成功一行日志，$0.75/千次口径）· NW4 隐私与配置诚实（私网零外发 ∥ key 零入结果/日志 ∥ 新键必有读取点）。

**本批不做**：代码零触（实施 = 下一环 eng-coder）· 需求档零触（§4.9 / F6 / §4.4 = 父侧已落）· `doc-check` 未跑 · 不改 Tavily ∥ Bing ∥ MCP 搜索面语义 · 端侧（CLI / VSC / 桌面 / server）零改 · 不做费用面板 / 预算闸 · 不做 `deepseek.baseURL` 覆盖键 · 不做 UI 入口（见上抛项）。

**设计档落点**：
- `docs/core/design/TOOLS.md` §6.23（新节，`:1296-1495`）——机制 / 判据 / 三表 / 用例 / 决策 / 边界（本批设计面权威）。
- `docs/core/design/CONFIG.md` §6.5（新节，`:176-189`）——`websearch.backend` ∥ `fetch.backend` 键面（D2 指针：机制全文在 TOOLS §6.23）。
- 连带收正（本批引起）：`TOOLS.md` §6.10 读取面句（`:264`——原「web.mjs 零改」已失效，D8 删净）+ D-5 补「⇒ 已落 §6.23」（`:266`）。
- 登记待实施轮收正：`SETTINGS-TOOL.md:47` 叶子计数（原文 24 陈旧；设计轮实测 35；本批 +2 键 ⇒ 37——落键后一次改到 37）。

**九项逐项表（设计验收 ①）**：

| # | 设计项 | 落点（TOOLS.md 行号） |
|---|---|---|
| 1 | 资格判据（providers[] 探测 / host 口径 / env:VAR / 多命中） | `:1314-1329` |
| 2 | 后端选择与优先级（search / fetch 链 + 两键 + fail-open） | `:1331-1341` |
| 3 | 请求 / 响应映射（count 夹取 / 渲染 / need_content / fetch Markdown / 帽） | `:1343-1353` |
| 4 | 错误 → 行为矩阵（重试 ∥ 熔断 ∥ 回落 ∥ 熔断域与生命周期） | `:1355-1371` |
| 5 | 日志行（事件名 / 字段 / 成本口径 / 熔断行） | `:1373-1378` |
| 6 | 工具描述建议文本（websearch.md ∥ fetch.md 差异句——交 coder 落） | `:1380-1399` |
| 7 | 测试计划（T1–T12 + 假 transport 缝 + 收口随批删） | `:1401-1420` |
| 8 | 受影响文件表（逐档现况行数 + Δ + 软线处置） | `:1422-1436` |
| 9 | 先例行 + 公开源核查行 | `:1302-1312` |

另：关键决策记录 `:1438-1449` · 用例表（正常/边界/错误）`:1451-1465` · 验收回指（W1–W6 ∥ NW1–NW4 → 判据句）`:1467-1480` · 边界 `:1482-1490` · UI/交互决策 `:1490` · 报告发现 `:1492-1495`。

**三表摘录（设计验收 ②）**：

① 映射（`:1345-1349`）：search `{query, count = clamp(limit,1,50), need_content:false}` → 每条 `[deepseek] title` ⏎ url ⏎ `date · authority · rerank` ⏎ `summary`（summary 空 ⇒ snippet；authority -1 省略）；fetch `{url}` → `[deepseek] <title>` ⏎ 空行 ⏎ Markdown（200K 帽）。

② 错误矩阵（`:1357-1367`）：400/413/其它 4xx ⇒ 不重试不熔断回落；401/402/403/404 ⇒ 熔断 + 回落；408/429/5xx ⇒ 固定 500 ms 重试一次后回落；网络错误/超时/JSON 畸形 ⇒ 回落；200 空结果（search ∥ fetch 空 content）⇒ 回落；已熔断 ⇒ 零请求直回落；`local` ⇒ 直回落；私网 URL ⇒ 发请求前抛现错。

③ 受影响文件（`:1424-1434`）：web-deepseek.mjs 新 ≈180 · web.mjs 227 → +≈45 · config.mjs 516 → +≈8（软线已超，拆分候选归另批）· tool-docs/websearch.md 16 → +≈4 · tool-docs/fetch.md 12 → +≈3 · 单测新 ≈240（收口删）· TOOLS.md 1311 → +≈200 · CONFIG.md 186 → +≈14 · SETTINGS-TOOL.md 130 → ±1（实施轮）。

**关键决策**（详见 `:1438-1449`）：D-WB1 key 复用 `providers[]`（用户裁定，不设独立键）· D-WB2 端点 = 固定常量（`baseURL` 只供资格判定）· D-WB3 熔断单域按 `ctx.agent` 身份（代价在册：fetch 404 连带停 search——按 W4 判据接受）· D-WB4 空结果回落（同 Tavily 判据）· D-WB5 退避固定 500 ms 单次 · D-WB6 fetch 内容面零提示行 · D-WB7 `local` 不扩枚举 · D-WB8 本批零 UI 入口。

**验收对照（本轮交付 · 派发 5 条）**：
① 九项逐项表 = 上表（节号 + 行号）；② 三表齐 = 上三摘录，全文在 TOOLS §6.23；③ 复扫读数（新键三面）：设计档两键在册（TOOLS §6.23 ∥ CONFIG §6.5）· DEFAULTS 与消费点 = **实施轮落**（设计轮代码零触，不声称绿）；④ `git status` 实读 = 除声明三档（TOOLS.md / CONFIG.md / 本批档）零新增触（SETTINGS-TOOL.md 本轮未改——收正点归实施轮）；⑤ 新增非表格行无 >300 字符（扫描读数 = 0）。

**上抛项**：
- `[上抛·待裁]` **UI 入口**：两逃生口键本批无面板 / TUI 入口（D-WB8——缺省 `auto` 已满足零配置目标）；如用户要求可见开关 ⇒ 另批（端侧笔）。
- `[上抛·知会]` `SETTINGS-TOOL.md:47` 叶子计数陈旧（24 vs 实测 35；本批 +2 ⇒ 37）——收正点 = 实施轮落键后。
- `[上抛·知会]` `thincoder-core/tool-docs/fetch.md:11`「~50000 chars」与 `MAX_OUTPUT_CHARS` 200K 不符——非本批面（英文运行期面），登记不动。

**设计修轮记录（2026-10-17 · round = fix · 评审 §3 十三条逐条处置）**

- **处置**：#1–#11、#13 采纳并落设计档；#12 驳回（Not an issue——需求 W3 已定 404 入熔断，代价既在 D-WB3 在册：**需求面已定**，不改）。
- **落点**：`docs/core/design/TOOLS.md` §6.23（① ∥ ② ∥ ③ ∥ ⑥ ∥ ⑦ ∥ ⑧ ∥ ⑨ ∥ 用例表 ∥ W2 ∥ W5 ∥ NW4 ∥ 边界 ∥ 报告发现）+ §6.7 要旨行；`docs/core/design/SETTINGS-TOOL.md` §2.4（预载叶子数删）∥ §2.8（载体键面补 `fetch`）。
- **关键改法**：count 口径 = `limit`（工具面上限 20 保留——`web.mjs:105` ∥ schema 零改；`limit:99` ⇒ 20）；VSC 装配补 `fetch` 键两行（`setup.mjs` ∥ `agent-state.mjs`）+ 端侧用例 T15，桌面 / server 读取路径写明（整建点 `unverified`）；`authority:-1` 出处已补（官方 Search API Reference「0 to 4 (-1 means unknown)」——需求侧「上游事实」行回填归主 agent）；测试缝折回成对两半（无第三缝）；README 键面两行 + 两产品 CHANGELOG 入受影响表与 W5；config.mjs 拆分挂结构维护台账（父侧建条目）+ 实施后 ≤ 528 读数判据。
- **本轮不做**：代码零触（实施 = eng-coder）· 需求档零触 · `doc-check` 未跑。
- **登记（知会）**：上文本段 initial 轮所载预载数（24 / 35 / 37）与「端侧零改」句已失效——设计档现值 = 唯一权威（D8：设计档已删净；本段为过程档案，不改写上文）。

**设计修轮记录（2026-10-17 · round = fix · 设计评审 #78 轮次 2（pass · 🔴0 · 🟡5 · 🔵9 = 14）逐条处置）**

- **范围**：采纳清单 = 12 条（评审编号 #1–#9、#11–#13）；零触 = #10（需求档清册——需求档笔归主 agent）∥ #14（叶子数待填值——实施轮按 `flatten` 本体实测回填）。
- **条号 → 档:行 → 一句**（行号 = 本轮改后实读）：
  1. #2 跑法 → `TOOLS.md:1443-1444` — ⑦ 补 `node --test docs/batches/2026-10-17-deepseek-search-fetch.test.mjs`（先例 `2026-10-17-ssh-credential-save.test.mjs:4`）+ 判据 = 该命令 + `npm test`（`thincoder-cli/package.json:37`；收集面 `thincoder-cli/test/run.mjs:3`、树外档拒 `:38`）。
  2. #3 VSC 键面 → `SETTINGS-TOOL.md:79-80` — 载体键集补 `hooks`（`agent-state.mjs:102` 实建）；坐标 `:96-107` → `:98-111`。
  3. #4 谓词引文 → `SETTINGS-TOOL.md:38` ∥ `:40` — 词表句字面改实装形（左界 `(^|[._-]|[a-z0-9])`；`settings.mjs:22`）；族句 → `settings.mjs:24`。
  4. #5 接口契约 → `TOOLS.md:1384-1393` — 新「接口契约（工具面 · 实现面）」块：导出名 / 签名 / 三态返回（ok · failed · unavailable）/ 跳过信号 / 提示行返回路径；`backendMode` 裁定 = **定义不删**（`CONFIG.md:182-183` 同名同签名）。
  5. #1 登记面 → `CORE-UNIFICATION.md:556`（520 · 越 500 软线 · 挂结构维护台账 `#1612` + 实施后 ≤528 读数判据）+ `CONFIG.md:73`（越软线——拆分计划挂结构维护台账 #1612）。
  6. #6 Δ 偏低 → `TOOLS.md:1454`（+≈3，`cfgFetch` 声明 ∥ try 内赋值 ∥ bag 条目）+ `:1464` ∥ `:1517`（「两行」→「`setup.mjs` 三处 + `agent-state.mjs` 一处」）；同句族收正 `:1310` ∥ `:1477` ∥ `:1510`。
  7. #7 鉴权头 → `TOOLS.md:1354` — `Authorization: Bearer <apiKey>`（先例 `web.mjs:59`）；钉死，非 `unverified`。
  8. #8 用例边界 → `TOOLS.md:1489`（`fetch.backend:"local"` 格）+ `:1439` T16（提示行文案断言）+ `:1495`（用例表提示行格）+ `:1375`（`<tavily|bing>` = 实际承接腿名）。
  9. #9 坐标重锚 → `SETTINGS-TOOL.md` 逐处：`:22` ∥ `:24` ∥ `:40` ∥ `:49` ∥ `:76` ∥ `:87-95` ∥ `:99` ∥ `:162` ∥ `:216-228` ∥ `:210` ∥ `:283-288` ∥ `:235`；同节实读顺带 `:263` ∥ `:210-213` ∥ `:224` ∥ `:226` ∥ `:297`。
  10. #11 先例批 → `TOOLS.md:1312` — 「Tavily 引入批号未在档内可考（`docs/batches/` 实扫零对应批档）」（禁编造）。
  11. #12 描述预算 → `TOOLS.md:1416` — 实算 +≈630 字符（websearch +≈423 ∥ fetch +≈208）；两档现值 1,535 ∥ 731 ⇒ 落笔后 ≈1,958 ∥ ≈939，不越 8,000 帽（`PROMPT-SYSTEM.md:317`）；报告态 `node scripts/tool-schema-size.mjs`。
  12. #13 CONFIG 句 → `CONFIG.md:189` — 「不设顶层 `deepseek` 段；`websearch.deepseek.baseURL` 槽位保留（另批）」。
- **顺带（一致性面，逐条报）**：§6.23 ⑧ config.mjs 行「父侧建条目」→「台账 `#1612`」（`TOOLS.md:1451`）；⑧ 测试行 T1–T15 → T1–T16（`:1459`）。
- **读数 ① 行宽**：非表格 >300 = 0（TOOLS.md 最大 299 ∥ CONFIG.md 283 ∥ SETTINGS-TOOL.md 243 ∥ CORE-UNIFICATION.md 286）。
- **读数 ② 回读 ∥ ③ git status**：回读 = 逐处 diff 上下文核对（D6，五档全回读）；本批声明 = 四设计档 + 本批档；余为他批在途（ssh-credential-save ∥ admin-approval-cards ∥ box-shell-update ∥ sandbox-quota-chattr ∥ token-visibility-simplify ∥ server 面 ∥ 需求档 `requirements/TOOLS.md` 等），如实分离。
- **口径校准（报）**：派发载「`thincoder-core/test/run.mjs:3` / `:39`」——`npm test`（`thincoder-cli/package.json:37`）实指 runner = `thincoder-cli/test/run.mjs`（收集面 `:3`、树外档拒 `:38`）；`thincoder-core/test/run.mjs` 为单层 glob（`:3`，拒 `:36-37`）。设计档按 CLI runner 写。
- **本轮不做**：代码零触 · 需求档零触 · `doc-check` 未跑 · 判定语义零改（count 口径 ∥ 熔断集 ∥ 只读三件套原样）。

**设计修轮记录（2026-10-17 · round = fix · 主 agent 两条语义裁定落地 · 台账 #1605）**

- **来源**：主 agent 2026-10-17 19:54 裁决（对设计侧两条上抛的处置，非新需求）——① `CORE-UNIFICATION.md:550` 规则句零改、`:576-577` 子表补 `config.mjs` 一行；② 空结果自 `failed` 拆出 ⇒ 四态 `ok` ∥ `empty` ∥ `failed` ∥ `unavailable` + 提示行按因分叉 + T16 拆两格。
- **条号 → 档:行 → 一句**：
  1. 裁定 ① 主体 → `CORE-UNIFICATION.md:578` — 子表补 `config.mjs` 行：**520**（`wc -l` 实读——越 500 软线）· 拆分 = `DEFAULTS` 段 ∥ 归一 helpers 外提（挂结构维护台账 `#1612`）· 判据 = 实施后 ≤ 528 读数 + 拆分轮起轮时按盘重判。
  2. 裁定 ① 连带 → `CORE-UNIFICATION.md:551` — 「子表空壳」→「子表 1 行」（结构现读随子表行数同拍，D3）。
  3. 裁定 ② 契约 → `TOOLS.md:1393` — 返回形四态：`{ status: "empty" }`（后端成功、零结果——search 零条 ∥ fetch 空 `content`）· `failed`（尝试后失败 ∥ 已熔断）· `unavailable`（无合格渠道、零网络调用）保持。
  4. 裁定 ② 矩阵 → `TOOLS.md:1373` — ④ 补「返回态映射」行：失败类（含已熔断）⇒ `failed`；两行 `200` 空结果 ⇒ `empty`；无渠道 ⇒ `unavailable`；成功 ⇒ `ok`。
  5. 裁定 ② 提示句 → `TOOLS.md:1376-1377` — `failed` ⇒ 现文案 `(deepseek backend unavailable — results from <tavily|bing>)`；`empty` ⇒ `(deepseek returned no results — results from <tavily|bing>)`；fetch 两态零提示（D-WB6）；无渠道 ∥ `local` 零提示（零回归）。
  6. 裁定 ② 返回路径 → `TOOLS.md:1395` — 提示行返回路径 = `empty` ∥ `failed` 走回落链，文案引 ④（不复制文本）；`unavailable` 零提示。
  7. 裁定 ② 用例 → `TOOLS.md:1441-1442` — T16 = 失败形（`failed`，现文案）；T17 = 空结果形（`empty`，新文案 ∧ 不含 unavailable 文案；fetch 空 `content` 回落本地零提示）。
  8. 同族连带 → `TOOLS.md:1352`（fetch 映射行标返回态 `empty`）· `:1463`（单测 T1–T17）· `:1477`（D-WB4 记 `empty` 与 `failed` 分列）· `:1495-1496`（用例表补 search 空结果 ∥ fetch 空 `content` 两格）。
- **口径判读（报 · 请示）**：裁决句「`failed`/`unavailable` ⇒ 现文案」中 `unavailable` 现义 = 无合格渠道（`TOOLS.md:1394`），今日零提示；若给文案则破 NW1「无渠道逐字不变」（`requirements/TOOLS.md:240`）与同节零回归句 ⇒ 本轮落成 `unavailable` 零提示（沿用既有），`failed`（含已熔断）⇒ 现文案。若裁决意为 `unavailable` 亦带文案 ⇒ 需同拍改 NW1 快照语义（需求档笔在主 agent），请裁。
- **读数**：非表格 >300 = 0（TOOLS.md 最大 299 · CORE-UNIFICATION.md 286 · CONFIG.md 283 · SETTINGS-TOOL.md 243）；四态同源四处 = 矩阵 `:1373` ∥ 契约 `:1393` ∥ 提示句 `:1376-1377` ∥ T16/T17 `:1441-1442`（无第二套词）；回读 = 两档逐处上下文核对（D6）。
- **本轮不做**：代码零触 · 需求档零触 · `failed` 既有回落语义一字未动（熔断集 ∥ 重试 ∥ 回落链 ∥ 计数口径原样）· 只读三件套零触。
- **发现（非阻断，未改）**：`CORE-UNIFICATION.md:551` 前段「13 档表 + 拆分计划子表 9 档」与 `:552`「子表行 23」为陈旧枚举（子表现 1 行）——非本批面，报告主 agent 处置。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

## 设计评审（TOOLS.md §6.23 ∥ CONFIG.md §6.5 · DeepSeek 搜索/抓取后端）

口径：评审对象 = `docs/core/design/TOOLS.md` §6.23 + `docs/core/design/CONFIG.md` §6.5（含 `docs/core/requirements/TOOLS.md` §4.9 对读）；未跑 `git diff`；行数 / 坐标抽核 = 实读源码（criterion 8 要求）。项目标准档未声明（无 project standards / document map）⇒ 方法论按 AGENTS.md + 仓内 DOC-DISCIPLINE 实读判定；地图实读 AGENTS.md 指向的 `thincoder/docs/README.md`（文件级）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / Acceptance | 🔴 | `count` 夹取值与现实现冲突：③ 定 `count = clamp(limit, 1, 50)`（`limit` 缺省 8）（TOOLS.md:1347），T5 / W2 判据句钉 `limit:99` ⇒ 50（TOOLS.md:1411、TOOLS.md:1472）；但 `websearch.execute` 在进链前已把 limit 夹到 20（`thincoder-core/tools/web.mjs:105` `const limit = Math.min(args.limit ?? 8, 20)`），schema 描述（web.mjs:96）与描述档（tool-docs/websearch.md:5）均写 "Max results (default 8, max 20)"，而 ② 声明三支零改（TOOLS.md:1338）、⑥ 声明"增量差异句；其余文字零动"（TOOLS.md:1382）却又新增 "limit maps to count (1–50)"（TOOLS.md:1390）⇒ 判据句要么不可达（取夹后值 = 20），要么必须改全后端夹取面与模型可见上限（未入受影响文件） | 在 ③ 写明 count 的输入 = `args.limit` 原值（独立 clamp 1–50，不动既有 20 夹取），并把 schema `limit` 描述与 websearch.md 该行的改法补进 ⑥ / 受影响文件；或把上限下调到 20 并同改 T5 / W2——三处数字同源 |
| 2 | Feasibility / Requirements | 🔴 | `fetch.backend` 在 VSC 无读取点：消费点声明为 `fetch.execute`（CONFIG.md:183），而 VSC 的 `agent.config` 由固定键集整建（`thincoder-vscode/src/agent/agent-state.mjs:103` `proxy: cfg.proxy, shell: cfg.shell, providersList: cfg.providersList, websearch: cfg.websearch,`），键集来自 cfgBag（`thincoder-vscode/src/agent/setup.mjs:186`，无 `fetch` 键）；SETTINGS-TOOL.md:79 亦自述 VSC 载体键面 = `{advisor, agent, proxy, shell, providersList, websearch, traces}` ⇒ `fetch.backend:"local"` 在 VSC 恒读 undefined（恒 auto），逃生口 W5 该端失效；且 settings 工具可写该键却永不被读（违 NW4 / §4.3 N8「申报键必有读取点」）；⑧「端侧（CLI / VSC / 桌面 / server）零改」（TOOLS.md:1436）因此不成立 | 二选一并写死：(a) 端侧把 `fetch` 键补进 bag（受影响文件补 setup.mjs / agent-state.mjs + 端侧用例）；(b) 把该键挂到已有 `websearch` 载体下或改由核直读磁盘（写明读取点）；同时按实际改法收窄"端侧零改"句 |
| 3 | Requirements (unverified upstream fact) | 🟡 | ③ / T6 钉 `authority = -1`（未知）⇒ 省略（TOOLS.md:1348、TOOLS.md:1412），但需求档「上游事实」只记 authority 0–4（requirements/TOOLS.md:218），-1 无出处 ⇒ 未取证的上游行为进了判据句 | 把 `authority:-1` 出处补进需求档「上游事实」行（或先例行）；无出处则删该分支与 T6 相应半句 |
| 4 | Clarity / correctness | 🟡 | ① 末尾称派生渠道「同判据自然合格（host 相同），零特判」（TOOLS.md:1329），但 `PROVIDER.md` §6.25:575 的派生条目形 = `baseURL:"<server>/v1"`（团队服务器，非官方 host）⇒ 按判据 #3 应判不合格；与本档「key 只发官方 host」立场亦相抵 | 改为「派生条目不特判——host 非 api.deepseek.com 者自然不合格」，或写明真会出现官方 host 派生条目的来源与 key 语义 |
| 5 | Doc contradiction (mechanism count) | 🟡 | 报告发现钉「本批两键落 `DEFAULTS` 后 `flatten(DEFAULTS)` 实测应为 **37**」（TOOLS.md:1494），与 SETTINGS-TOOL.md:47「`flatten(DEFAULTS)` 共 24 叶子」矛盾；按现 DEFAULTS（config.mjs:33-105）+ flatten 语义（settings.mjs:200-207，空对象 / 空数组不产行）手数 = **31** 叶子 ⇒ 落两键 33：两处数字均与实测不符 | 落键后按 flatten 本体复测一次，实测值同拍写入 SETTINGS-TOOL.md 与本节（删预载的 37 / 24）；若 37 属 `flatten(loadConfig())` 口径，句内点明口径 |
| 6 | Document ownership (cross-section lag) | 🟡 | TOOLS.md §6.7 逐工具要旨行仍是旧描述「**websearch / fetch**：网络边界见 §6.4；fetch 失败错误含 proxy 提示。」（TOOLS.md:240），未随后端链同拍；§6.10 已改指 §6.23（TOOLS.md:264）⇒ 同档两处对同一工具的描述不同步（W6 文档同步面） | §6.7 该行补后端链指针（或改述为"后端优先级见 §6.23"） |
| 7 | Requirements coverage (user key face) | 🟡 | 两新键是用户面开关（W5），但 ⑧ 受影响文件表只有源码 / 工具描述档 / 设计档（TOOLS.md:1424-1434），无 `thincoder-cli/README.md` 键面与 CHANGELOG——而本档自定配置契约落地物 = 「两产品 `CHANGELOG.md` + `thincoder-cli/README.md` 键面」（CONFIG.md:65），README Configuration 段现有 `websearch` 键面（thincoder-cli/README.md:177-180）无 backend 键 ⇒ 用户无从发现逃生口 | 把 README 键面两行 + CHANGELOG 条目列进受影响文件与 W5 判据，或明确"用户面文档另批"并给出可发现路径 |
| 8 | Methodology (test-seam discipline) | 🟡 | ⑦ 在成对 setter 之外多出 `_resetDeepseekStateForTest()`（清熔断 WeakSet，TOOLS.md:1403）——CONFIG.md §6.2 ③ 要求 `_set` / `_reset` 成对且「**命名 / 成对例外 = 逐行标于名录**」（CONFIG.md:108），本节声明"③ 缝（CONFIG.md §6.2）"却未登记该例外 | 把清态折进 `_resetDeepseekTransportForTest`（复位即清熔断），或在 CONFIG.md §6.2 名录按行登记该例外 |
| 9 | Affected-file annotations (spot-check) | 🔵 | 「现况 = 实读行数」与盘上不符：config.mjs 520（表 516，TOOLS.md:1428）· tool-docs/websearch.md 17（表 16）· tool-docs/fetch.md 13（表 12）· SETTINGS-TOOL.md 131（表 130）；坐标 `thincoder-core/config.mjs:431`（TOOLS.md:1328）实为 `:434`（`merged.providersList = merged.providers`） | 实施轮前按盘重读并回填行数与坐标（config.mjs 已越 500 软线，读数直接驱动结构档判定） |
| 10 | Structure tier | 🔵 | config.mjs 已 520 > 500 软线，本节只名候选拆面并推给结构维护另批（TOOLS.md:1428「拆分候选在册（DEFAULTS 段 ∥ 归一 helpers 外提），归结构维护另批；本批零重构」）；本批 Δ 后约 528 ⇒ 越线扩大且本节无拆分计划（无目标档 / 无判据） | 拆分计划写进本批或挂台账条目（给条目号）；至少把"实施后 ≤ 528"落成读数判据 |
| 11 | Acceptance (edge / error coverage) | 🔵 | ④ 矩阵含「网络错误 ∥ 客户端超时（15 s）∥ JSON 畸形」（TOOLS.md:1362），T8 只覆盖网络错误（TOOLS.md:1414）；NW4 判据句含「日志 / 结果 `sk-` 字面零命中」（TOOLS.md:1480）但 ⑦ 无用例断言；熔断跨工具传染（D-WB3 代价）亦无用例 | T8 补超时 / 畸形 JSON 两格；加"日志与结果文本无 `sk-`"与"fetch 腿 401 后 search 腿零请求"两格 |
| 12 | Scope / design choice | 🔵 | fetch 的 404 被并入会话级熔断（TOOLS.md:1444「一次 fetch 404（无可提取内容）会连带停用本会话 search」），而需求 W3 把 404 当"无可提取内容"的正常回落条件（requirements/TOOLS.md:231）——单域熔断把普通抓取失败升级为整会话搜索停用 | 矩阵里把 fetch 的 404 排除出熔断触发（只回落），或保留现状并把代价同步记进需求档（现仅设计侧在册） |
| 13 | Clarity / output consistency | 🔵 | ③ 的 search 渲染以 `[deepseek] <title>` 起（TOOLS.md:1348），Tavily / Bing 既有渲染带序号 `${i + 1}. [tavily]`（thincoder-core/tools/web.mjs:114）⇒ 同工具三腿行形不一致，模型按序号回指会断 | ③ 明确是否带序号（带则与既有两腿对齐；不带则写明"刻意去序号"及理由） |

**Counts**：🔴 2 · 🟡 6 · 🔵 5（共 13）。

VERDICT: changes-required

VERDICT 依据：#1（`limit` 夹取与 W2/T5 判据句不可同时成立）与 #2（`fetch.backend` 在 VSC 无读取点、逃生口 W5 失效且"端侧零改"不成立）为阻塞项。

### 轮次 2（评审子代理）

## 设计评审 · 轮次 2（fix 轮 #75 后复审）

口径：对象 = `docs/core/design/TOOLS.md` §6.23 ∥ `docs/core/design/CONFIG.md` §6.5 ∥ `docs/core/design/SETTINGS-TOOL.md`（两处）∥ 对读 `docs/core/requirements/TOOLS.md` §4.9；未跑 `git diff`。项目标准档未声明 ⇒ 方法论按 AGENTS.md + 仓内 `docs/core/design/DOC-DISCIPLINE.md` 实读判定；文档地图实读 `thincoder/docs/README.md`（AGENTS.md 指向）用于归属判定。

**轮次 1 十三条复核**：11 条已落（#1 count 口径 / #2 VSC `fetch` 读取点 / #3 authority −1 出处 / #4 派生渠道 / #5 叶子数去数字 / #6 §6.7 同拍 / #7 README+CHANGELOG / #8 缝成对两半 / #9 行数与坐标 / #11 T8+T13+T14 / #13 序号）；#12 驳回且理由成立（requirements/TOOLS.md:232 的 W4 明列 404 入熔断）；#10 部分（见本轮 #1）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Affected-file tier / Doc ownership | 🟡 | `config.mjs` 已 520 > 500 软线、本批后 ≈528，但设计只给 `拆分挂结构维护台账（父侧建条目）`（TOOLS.md:1432）——无拆分计划；且所指登记面与本子系统自述相抵：`CONFIG.md:73` 声明拆分计划住 `CORE-UNIFICATION.md` §2.8.1（`（带拆分计划）`），该小节规则 = `新超线档须入表 + 拆分计划——防回潮`（CORE-UNIFICATION.md:550），其行仍记 `**466**（`wc -l` 实读——终态）` · `—（软线内）`（CORE-UNIFICATION.md:556） | 二选一写死：入 §2.8.1 子表给真拆分计划（目标分档 + 判据），或声明结构台账取代 §2.8.1 并同批收正 `CONFIG.md:73` 与 466 陈旧行；「≤ 528 读数判据」当下限，不当计划 |
| 2 | Acceptance（判据可验证） | 🟡 | 批内单测住 `docs/batches/`（TOOLS.md:1424），`npm test` 不收集——收集面 = `test/*.test.mjs` + `test/integration/*.test.mjs`（test/run.mjs:3；入口 `"test": "node test/run.mjs"` thincoder-cli/package.json:37），树外档被收集自检拒（test/run.mjs:39）；⑦ 未给跑法，故需求验收方向 ⑦ `npm test` 绿（requirements/TOOLS.md:253）无法证明 T1–T15 跑过 | ⑦ 补跑法（形 = `node --test docs/batches/2026-10-17-deepseek-search-fetch.test.mjs`，先例见 docs/batches/2026-10-17-ssh-credential-save.test.mjs:4），并把本批判据 = 该命令 + `npm test` |
| 3 | Doc state（本轮所改行） | 🟡 | SETTINGS-TOOL.md §2.8 把 VSC 载体键面写成穷举——`VSC 载体键面 = `{advisor, agent, proxy, shell, providersList, websearch, fetch, traces}``（SETTINGS-TOOL.md:79）——实建对象另有 `hooks: cfg.hooks ?? null`（agent-state.mjs:102）；本批正改此行（补 fetch）⇒ 漏项随改存活；坐标 `:96-107` 亦陈旧（实块 = :98-111） | 补 `fetch` 同拍补 `hooks`，并重锚坐标到 :98-111 |
| 4 | Doc state（节内自相抵） | 🟡 | SETTINGS-TOOL.md §2.4 引的谓词字面缺 D-ST17 段内扩展——`（`:15`）：`/(^|[._-])(api[_-]?key|…|credential)($|[._-])/i``（SETTINGS-TOOL.md:38）——而同节声明 `⇒ 谓词扩**段内边界**`（SETTINGS-TOOL.md:42）与 D-ST17，实装左界含 `[a-z0-9]`（settings.mjs:22）；照引文实现即丢 `refreshToken` / `clientSecret` 遮罩 | 字面改成实装形（或删字面，留本节散文 + `settings.mjs` 锚） |
| 5 | Clarity（可实现性） | 🟡 | §6.23 未定 `web-deepseek.mjs` 接口（导出名 / 签名 / 「无后端 · 失败 · 成功」返回形），而 CONFIG 钉了一个 §6.23 未声明的符号：`websearch.execute` → `web-deepseek.mjs` `backendMode`（CONFIG.md:182） | 补「接口契约」短块（先例 = TOOLS.md:1111 §6.22），覆盖导出面、链头所需的跳过信号、回落提示行的返回路径 |
| 6 | Affected-file annotations | 🔵 | VSC 载体 Δ 偏低：TOOLS.md:1435 记 setup.mjs `+≈1`，但按其自述 `cfgTraces` 形（setup.mjs:123 `let cfgTraces = { ...DEFAULTS.traces }` · :158 `cfgTraces = { ...DEFAULTS.traces, ...(raw.traces ?? {}) }` · :186 bag 条目）需 ≥3 处 + agent-state.mjs 1 处 ⇒ `端侧 = VSC 装配补 fetch 键两行`（TOOLS.md:1445）读低 | 改 Δ ≈3，并把「两行」改述为「setup.mjs 三处 + agent-state.mjs 一处」 |
| 7 | Clarity（上游事实） | 🔵 | DeepSeek 鉴权头形从未钉死：③ 只给请求体（TOOLS.md:1348-1350），需求「上游事实」只记 `认证 = 既有 DeepSeek API key`（requirements/TOOLS.md:219） | 钉头形或标 `unverified`；先例形态 = web.mjs:59 |
| 8 | Acceptance（边界覆盖） | 🔵 | 用例表 / T 表覆盖 `websearch.backend:"local"`，未覆盖 `fetch.backend:"local"`（W5 第二键）；模型可见的新回落提示行（TOOLS.md:1372）无断言 | 补 `fetch.backend:"local"` 边界格 + 提示行文案断言格 |
| 9 | Doc state（数字漂移） | 🔵 | SETTINGS-TOOL.md 坐标族系统性陈旧（实读对照）：`:15`→:22 · `:16`→:24 · `:29`→:40 · `:38`→:49 · `:61`→:76 · `:72-81`→:87-95 · `:88`→:99 · `:146`→:162 · `:188-198`→:216-228 · `:187`→:210 · `:260-261`→:283-288 · `:231`→:235 | 触碰 §2.4 / §2.5 / §2.6 / §2.8 / §5 时一次重锚 |
| 10 | Doc state（需求档清册） | 🔵 | 需求档自述仍称 §4.7 是唯一新增子节——`**§4.7 = 新增能力条目**——非并入，见该节`（requirements/TOOLS.md:8）∥ `**§4.7 = 新增**`（requirements/TOOLS.md:44）——而 §4.8 ∥ §4.9 同为新增能力条目（requirements/TOOLS.md:215 已列 §4.8 S 系平列） | 两处表头句改为现行清册（§4.7 U ∥ §4.8 S ∥ §4.9 W/NW） |
| 11 | Methodology（先例行） | 🔵 | 先例行有实现坐标 ∥ 对位设计小节（§6.10 D-5），无先例批次坐标 | 补批次坐标，或写明无适用批次 |
| 12 | Requirements（F15 面） | 🔵 | ⑥ 增模型可见描述文本，未记描述预算面（单档 ≤ 8,000 字符；报告态机检 `node scripts/tool-schema-size.mjs`——PROMPT-SYSTEM.md:317 · :320）；两档读数远低于帽，影响为零，但 F15 可追溯性缺一句 | 补一行预算读数说明（≈ +N 字符 / 不越帽 / 报告态） |
| 13 | Document precision | 🔵 | CONFIG 键面边界 `不设 `deepseek.*` 独立段`（CONFIG.md:189）比需求保留的槽位读得更宽——`显式 `websearch.deepseek.baseURL` 覆盖 = 留槽位`（requirements/TOOLS.md:249）；§6.23 写得准（TOOLS.md:1494），CONFIG 未 | CONFIG 句收窄为「不设顶层 `deepseek` 段；`websearch.deepseek.baseURL` 槽位保留（另批）」 |
| 14 | Doc hygiene（待填值） | 🔵 | SETTINGS-TOOL.md §2.4 规范面现值是承诺而非事实——`flatten(DEFAULTS)` 叶子数 = 本批两键落键后按 `flatten` 本体实测回填（SETTINGS-TOOL.md:47）；三档交叉依赖该行 | 实施轮按已声明路径一次写入；「无属主 / 无日期的占位」即本次替换掉的失效形 |

**Counts**：🔴 0 · 🟡 5 · 🔵 9（共 14）。

VERDICT: pass

VERDICT 依据：无 🔴——13 条修正的实质面（count 口径同源 / VSC `fetch` 读取点 / 补键端侧两处 / authority −1 出处 / README+CHANGELOG / 缝成对）均已落且内部一致；余项为债类登记面、坐标漂移与判据可跑性收口，均不阻塞实施。

## §4 用户批准（主 agent）

**用户批准（2026-10-17 19:12 / 19:29）**：用户逐字「行」（接 DeepSeek Search & Fetch）+「都在，都自动跑，你要扩大」⇒ 本批批准 + 全链自动（设计 → 评审 → 实施 → 收口）。

## §5 实施记录（eng-coder）
**状态行**：✅ 实施完成 · 2026-10-17（代码面 clean；CHANGELOG 两档 + 设计档三处收正待父侧）



**实施记录（2026-10-17 · eng-coder · round = initial）**

**落点逐档（file:line = 终态实读；行数口径 = 末行行号）**

| 档 | 改动 | 终态读数 |
|---|---|---|
| `thincoder-core/tools/web-deepseek.mjs`（新） | 资格探测 / 四态返回 / 熔断 / 退避重试 / 响应映射 / 日志 / 测试缝两半 | 173 行 |
| `thincoder-core/tools/web.mjs` | 链头接线（search ∥ fetch）+ 回落提示行（按因分叉，仅 search） | 227 → 253 行（+26） |
| `thincoder-core/config.mjs` | `DEFAULTS` 两键（`websearch.backend` ∥ `fetch.backend`，缺省 `auto`） | 520 → 524 行（+4；≤ 528 判据成立） |
| `thincoder-core/tool-docs/websearch.md` | 首行改述 + Notes 两句（后端优先级 ∥ 运算符） | 17 → 19 行（1,523 → 2,008 字符） |
| `thincoder-core/tool-docs/fetch.md` | 首行改述 + Notes 一句（`fetch.backend`） | 13 → 14 行（729 → 981 字符） |
| `thincoder-vscode/src/agent/setup.mjs` | `cfgFetch` 三处（声明 ∥ try 内赋值 ∥ cfgBag 条目） | 320 → 323 行（+3） |
| `thincoder-vscode/src/agent/agent-state.mjs` | `agent.config.fetch` 整建键（缺省回落 `DEFAULTS.fetch`） | 159 → 160 行（+1） |
| `thincoder-cli/README.md` | Configuration 示例两行（`websearch.backend` ∥ `fetch` 段） | 584 → 586 行（+2） |
| `docs/batches/2026-10-17-deepseek-search-fetch.test.mjs`（新） | T1–T17（含零回归快照 ∥ 两态提示文案 ∥ 熔断跨工具 ∥ VSC 装配 ∥ 129 字符边界） | 398 行（收口删） |

**关键实现口径（与设计逐条对位）**

- 资格五条 AND：`providersList ?? providers`；`https:` + 小写去尾点 host = `api.deepseek.com` + 端口 ∈ {空, `443`}；key 经 `resolveProviderSecrets` + trim；解析抛错 ⇒ 该条不合格（不抛）；多命中取首条。
- 端点 = 固定常量（`baseURL` 只判资格）；头 = `Authorization: Bearer <apiKey>` + JSON。
- 四态纯值：`ok` / `empty`（200 零条 ∥ fetch 空 `content`）/ `failed`（尝试后失败 ∥ 已熔断）/ `unavailable`（无渠道、零网络调用）；无 throw 出口。
- 错误矩阵：401/402/403/404 熔断（模块级 WeakSet 按 `ctx.agent` 身份；无 agent 不持久化）+ 回落；408/429/5xx 固定 500 ms 单次重试；其它 4xx / 网络 / 超时 / JSON 畸形直落；已熔断零请求；非 2xx 响应体先 cancel 再返回。
- 提示行（仅 search）：`failed` ⇒ `(deepseek backend unavailable — results from <leg>)`；`empty` ⇒ `(deepseek returned no results — results from <leg>)`；`unavailable` ∥ `local` ∥ fetch 两态 ⇒ 零提示；query > 128 字符不发（边界格已钉）。
- 日志：成功恰一行 `ev:"web:deepseek"` `{tool,n,ms,cost}`（`cost = n>0 ? 0.00075 : 0`）；熔断行 `{tool,status,tripped:true,ms}`；key / query / url 零入。
- 安全：私网 / 元数据 URL 在 `web.mjs` SSRF 门（发请求前）拒发；`web-deepseek` 内第二道门（直调亦然）；`need_content` 恒 false。
- 测试缝：`_setDeepseekTransportForTest` / `_resetDeepseekTransportForTest`（复位即清熔断）；无第三缝。

**与设计的偏差（逐条披露）**

1. **提示行前提收窄**：实装 = 「回落腿真出结果才加提示行」（回落结果为空 ⇒ 零提示）；设计 ④ 零提示面未枚举该态。理由 = 文案模板要求 `<tavily|bing>` 为实际承接腿名，无承接腿即无文案可填。该态已在 T16 钉死。设计侧补句归父侧。
2. **`web.mjs` Δ 低于设计预期**：实 Δ = +26（设计 ⑧ 记 +≈45）——重活在新档（173 行），非缺失行为。
3. **描述档首行保留原「用途句」**：设计 ⑥ 给的新句逐字落地；原首行用途句（websearch「Use for looking up…」/ fetch「Use after websearch…」）按同节「其余文字零动」保留——两档字符数因此比设计预算各多 ≈50 / ≈42。
4. **CHANGELOG 两档未写**：任务书明令 CHANGELOG = 父侧维护面、不在写域；建议条目已随交付报告给出（评审列为 must-fix，处置权在父侧）。

**读数**

- 单测：`node --test docs/batches/2026-10-17-deepseek-search-fetch.test.mjs` ⇒ tests 17 / pass 17 / fail 0（≈3.7 s）。
- 语法：6 个改动 `.mjs` + 测试档 `node --check` 全过。
- `npm test`：`thincoder-cli` ∥ `thincoder-core` ∥ `thincoder-vscode` 三处实跑 = 「test manifest is empty — zero tests = green」（2026-09-28 全清重置后的诚实空绿）；本批无集成套件可跑。
- 规模：`flatten(DEFAULTS)` 叶子 31 → 33（`websearch.backend` ∥ `fetch.backend`）。
- 描述预算：`node scripts/tool-schema-size.mjs` ⇒ 52 档 / 137,236 字符；两档远低于单档 8,000 帽（2,008 ∥ 981）。
- 端侧探针：`loadConfig()` 带官方 DeepSeek 渠道 ⇒ `websearch.backend = auto` ∥ `fetch.backend = auto`；`backendMode` 三值（缺省 auto / `local` ⇒ local / 拼写错 ⇒ auto）。

**审计与评审轮次（内部）**

- explore 分叉审计（第 1 轮）：4 条（🟡2 / 🔵2）——① SETTINGS-TOOL.md 叶子数回填（设计档，父侧笔）② 提示行「回落腿须有结果」设计未声明（= 偏差 1）③ §5 未写（本轮已补）④ 设计 §6.23 的 `web.mjs:NN` 坐标随链头插入后移（设计档归父侧）。
- 自修（第 1 轮）：修 `merged` 回落分支真缺陷——回落腿零结果时不再拼提示行（加 `merged.length > 0` 守卫），T16 补该边界格。
- advisor 代码评审（第 1 轮）：VERDICT = changes-required。采纳并自修 1 条（🔵 非 2xx 响应体未释放 ⇒ `postOnce` 失败分支先 `cancel` body）；保留 1 条并说明（🔵 提示行在 `truncate` 后拼接——保提示行可见优先于 ~60 字符超帽）；must-fix 1 条 = CHANGELOG 两档（写域外，父侧落笔）；余为设计档 / 批档记录项（父侧笔）。
- 终态：**clean（代码面）**；未决项 = CHANGELOG 落笔（父侧）+ 设计档三处收正（叶子数 33 ∥ 零提示面补格 ∥ `web.mjs:NN` 重锚）。

## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-17 20:1x）**

**验证读数（父侧亲跑，非采信）**：

- `node --test docs/batches/2026-10-17-deepseek-search-fetch.test.mjs` ⇒ **tests 17 · pass 17 · fail 0**（≈3.7 s，全程零真实网络）。
- 落地读数：`web.mjs` 227 → **253**（+26）· `web-deepseek.mjs` **173**（新）· `config.mjs` 520 → **524**（+4，≤528 判据成立）· `setup.mjs` 320 → 323（+3）· `agent-state.mjs` 159 → 160（+1）· 两描述档 17 → 19 ∥ 13 → 14 · `README` 584 → 586 · 测试档 **398**。
- 规模：`flatten(DEFAULTS)` 叶子 **31 → 33**（+2 键）；描述预算：两档 2,008 ∥ 981 字符（远低于单档 8,000 帽）。

**上抛处置（`#85` 五条）**：

| # | 项 | 处置 |
|---|---|---|
| 1 | CHANGELOG 两档落笔（advisor must-fix） | **已落** ✓ —— 两产品各新增 `## [Unreleased]` + `### Added` 一条（形同核 CHANGELOG 体例）；`928 → 933` ∥ `1073 → 1078`（+5 实读） |
| 2 | 设计档漂移：`SETTINGS-TOOL.md:47` 叶子数 / `:79` 坐标 | **已收正** ✓ —— 叶子 = **33**（实测）；坐标 `:98-111` → `:98-112` |
| 3 | 设计 §6.23 的 `web.mjs` 行号随链头整体后移 | **已收正 7 处** ✓ —— `:105→:111`（limit 夹取）· `:112→:118` · `:113→:119` · `:114→:120` · `:49-71→:55-77` · `:49-87/:116-138/:196-226 → :55-93/:122-144/:216-250` · SSRF 门 `:197-198→:216-217` · Bearer 先例 `:59→:65`（父侧机械执行 · 可回退） |
| 4 | ④ 零提示面未枚举「回落腿零结果」 | **已补** ✓ —— `:1377` 增「search 回落腿**零结果**（`tavily` ∥ `bing` 也没搜到——无承接腿可名）⇒ 零提示」 |
| 5 | ⑧ Δ 偏高（`web.mjs` +45→+26 ∥ `config.mjs` +8→+4 等） | **已回填** ✓ —— ⑧ 表 13 行读数全部改为实测（含 `TOOLS.md` 1549 / `CONFIG.md` 202 / `SETTINGS-TOOL.md` 131） |

**收口**：代码面 = 完成（17/17 · 零真实网络 · 无渠道逐字不变 T11 在册）；设计槽 `74ab521b` 已 consume；台账 `#1605` 核销。
