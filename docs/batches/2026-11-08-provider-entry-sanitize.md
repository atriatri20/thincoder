# 2026-11-08 · provider-entry-sanitize
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 21:55「斜杠命令坏了. 我用/model想切换模型,结果报这个错:[error] Cannot read properties of undefined (reading 'padEnd')」。
> 台账 = #2210（core · 归批）。前情 = docs/batches/2026-11-08-testing-io-fail-closed.md（进行中）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
### 用户原话（逐字 · 按时间）

- **21:55**「斜杠命令坏了. 我用/model想切换模型,结果报这个错:[error] Cannot read properties of undefined (reading 'padEnd')」
- **21:57**「2」·「甲」（选「逐项挑能当场做完的，一笔一笔做真的」）
- **22:00**「这个能不能改成切的时候读啊?」
- **22:00**「还不能用,还是报:[error] Cannot read properties of undefined (reading 'padEnd') ,是不是要重启以后才行啊?」

### 父侧裁定（**不是**用户原话，§2 引用时须分清）

- **「甲」（丢弃 + 告警）**：用户 21:57 裁的，是用户的话。
- **「盘面零写盘」（不留）**：**父侧裁的**——理由 = 那条可能携用户已填的 `apiKey`／`baseURL`，装载期删盘等于无撤销的数据销毁，且用户没发起任何写。**（§2 曾把这一条写成「用户裁决『不留』」，已由设计席 #128 在 §2 两处与 `docs/core/design/PROVIDER.md` 两处改为父侧裁定并附理由。）**

### 现象与根因（父侧实读复现，非推测）

**用户原话**：`/model` 报 `[error] Cannot read properties of undefined (reading 'padEnd')`。

**三段实读串起来就是完整因果链：**

**① 盘上配置有一项是无主体的空条目。**实读 `~/.thincoder/config.json` 的 `providers` 数组，20 项里第 19 项（下标 18）是 `null`（加载后为 `{}`），其余 19 项都有 `name`：

```
0 deepseek · 1 qwen · 2 qwenplan · 3 kimi-code · 4 kimi-entprprise · 5 glm · 6 zhipu-plan
7 minimax · 8 dgx-spark · 9 tokenhub · 10 ark · 11 mimo · 12 gemini · 13 openai
14 testserver · 15 team · 16 dgx-v41 · 17 opencode-go · 18 ← null · 19 dgx-glm
```

**② 加载层原样传递。**`thincoder-core/config.mjs` 的 `merged.providersList = merged.providers` 那一句（整表别名）——**无过滤、无校验**。父侧以 `loadConfig()` 复跑，`providersList` 第 18 项确实是 `{}`。

**③ UI 读 `name` 时崩。**`thincoder-cli/src/tui/model-picker.mjs` 的 `buildProviderEntries()` 里那条模板行逐字：

```js
text: `${p.name.padEnd(12)}${shown}${ctxTag}${keyStatus}${unavailable}${sessionNote}`,
```

`{}` 的 `name` 是 `undefined` ⇒ `undefined.padEnd` ⇒ 报错原文。

**⇒ 19 个正常渠道被 1 个空条目连累，整个命令不可用。**

### 这一批要定的形

**修在加载层，不是修在渲染层。**只把 UI 那行改成 `p.name ?? ""` 是创可贴：命令不崩了，无效条目仍留在 `providers` 里，下一个读它的地方继续踩。

**三条要同时成立**：
1. **无效条目（无 `name` ∥ 非对象）不进使用面**——`name` 是渠道唯一标识，无 name 的条目本就无法被引用、无法被选中、无法被发请求。
2. **丢弃要说出来**——静默丢弃用户配置等于把他的改错藏起来；下一次他找不到那个渠道会以为是别的问题。
3. **盘上那一项要不要一并清掉**——留着它，别处再读同一个数组还会踩。

**边界**：不改 provider 的既有语义（有 name 的条目一个字节不动）；**不改 `/model` 的选择、增删渠道、设键各流的交互语义**——**打开时的行为按 §6.30 明改两处**（打开即重读盘上渠道；读不到时不退旧表）。**不引入「猜一个名字」的兜底**——给无名条目编个名字，等于把一条坏配置伪装成好配置。

### 需要设计席判的一件事

**「丢弃」还是「拒载」**：整份 `providers` 里存在无效条目时，
- **甲 丢弃 + 告警**：其余渠道照常可用（用户 `/model` 能切模型），告警只点那名坏条目；
- **乙 整份拒载**：明确 fail-closed，逼用户先改档。
**甲让你现在能干活，乙让坏配置绝不被忽略。二选一，给理由**——这是本批唯一的真判断。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（第 4 轮：§6.29 补 `providerDropReason` 三问（`none found:` + 对齐/偏离）∥ 原因闭集方向改正——判定住 `providerDropReason`、谓词取其 `null` 面 ∥ 新增「整键类型错误不属本闭集、按缺省空表、该面尚无可见提示」∥ §2 文件表与三问清单补 `providerDropReason` ∥ §2 边界补非数组口径）
### 设计档落点

`docs/core/design/PROVIDER.md` §6.29「渠道条目装载过滤（无名条目不进使用面）」——本批全部机制条文与逐字文案住此处，§2 只引用不复述。

### 本批条目（覆盖）

| # | 条目 | 判据来源 |
|---|---|---|
| 1 | 无名渠道条目不进使用面（甲：丢弃 + 告警） | 用户 2026-11-08 21:57 原话「甲」 |
| 2 | 丢弃要看得见——`/model` L1 列表**首行**一行告警，由条目构建纯函数产出、用例直测 | 同上；设计 `docs/core/design/PROVIDER.md` §6.29「可见面」 |
| 3 | 有 name 的条目一个字节不动 | §1「边界」 |
| 4 | 不给无名条目编名字 | §1「边界」 |
| 5 | `defaultModel` 指着无效条目：零新增路径，复用 `providerInvalidReason` | 派单「别造第二套」 |
| 6 | 盘面处置 = 不重写被丢弃的那一条（`loadConfig` 既有的老字段迁移写回不属本批、不改） | **父侧裁定**（用户未就此表态）——坏条目可能携已填 `apiKey`／`baseURL`，装载期删盘 = 无撤销的数据销毁，且用户未发起任何写；边界读法见 `docs/core/design/PROVIDER.md` §6.29 |
| 7 | `/model` 打开即重读盘上渠道（新鲜度），会话态按 name 合并 | 用户 2026-11-08 原话「这个能不能改成切的时候读啊?」 |
| 8 | 丢弃记录不带条目内容——只写盘上下标 + 原因（密钥不进载体） | **父侧裁定**（用户未就此表态）；机制单源 = `docs/core/design/PROVIDER.md` §6.29「丢弃要看得见」 |

**不在本批**：不改 `/model` 的选择 ∥ 增删渠道 ∥ 设键各流的交互语义（打开时的两处行为按 `docs/core/design/PROVIDER.md` §6.30 明改：有丢弃时多一行表头；读失败不打开列表并出一行错误）；不建配置校验体系；不做装载期回写；**整键类型错误（`providers` 非数组）不属条目闭集**——按缺省空表处理，该面尚无可见提示（`docs/core/design/PROVIDER.md` §6.29 该条，实现零改）。

**其它端**：VSC ∥ 桌面 ∥ 沙箱——若三端同经 `loadConfig` 取渠表则自动同源，**未证**（设计 `docs/core/design/PROVIDER.md` §6.29 边界同记 `unverified`）；本批不声称零端改。

### 机制设计（三处坐标）

**① 过滤点**：`thincoder-core/config.mjs` 的 `merged` 组装处，`providers:` 分支——先按判据过滤，再 `sanitizeProviderHeaders({ ...p })`。

保留判据逐字：非 null 的纯对象 ∧ `typeof p.name === "string"` ∧ `p.name !== ""`。

放在整表别名 `merged.providersList = merged.providers` 之前：下游三处（该别名 ∥ `resolveProviderPlan` ∥ `sanitizeConsultModels` 的渠道名集）读的都是这同一个数组，别名之后没有第二个汇聚点。

**② 告警**：数据层载体 `merged.providersDropped`（先例 = F-4 `consultModelsFiltered` 范式）；可见面 = 新的条目构建纯函数 `buildProviderEntries`——`dropped` 非空 ⇒ 列表**首行**一行 `type: "header"`。

函数签名、六参数契约、两行文案逐字、三问答复（`providersDropped` ∥ `providerDropReason` ∥ `isUsableProviderEntry` ∥ `reloadProviders` ∥ `buildProviderEntries`）——单源住 `docs/core/design/PROVIDER.md` §6.29「可见面」与「新名与文案」，本节不复述。

**③ 盘面**：不重写被丢弃的那条（「零写盘」只指这一条；**父侧裁定**：不留——坏条目可能携已填 `apiKey`／`baseURL`，装载期删盘 = 无撤销的数据销毁，且用户未发起任何写）。`loadConfig` 既有的老字段迁移写回不属本批，见 §6.29「零写盘」的边界。代价：盘面那条一直留着，每次开列表提示一次；清它走用户正常入口。

**`defaultModel` 面**：无名条目没有 name，引用命中不了；全表皆无效 ⇒ 过滤后渠表空 ⇒ `resolveProviderPlan` 落 `state="invalid"` + `providerStateReason` =「未配置任何 provider」（`thincoder-core/config.mjs` 既有那条路径）。零新增分支。

### 受影响文件与测试覆盖

| 档 | 改动 |
|---|---|
| `thincoder-core/config.mjs` | 一处过滤 + `providersDropped` 载体 + re-export `reloadProviders`（本体见下两行） |
| `thincoder-core/config-normalize.mjs` | 新 `providerDropReason(p)`——原因闭集四值的唯一判定；准入谓词 `isUsableProviderEntry(p)` = 其 `null` 面。只由装载调用，重读经装载共用同一次判定 |
| `thincoder-cli/src/tui/model-picker.mjs` | L1 入口重读一次；闭包内 `buildProviderEntries` 改为调新模块（本档净变化趋零）；读失败一行 |
| **新建** `thincoder-cli/src/tui/provider-entries.mjs` | `buildProviderEntries({ providers, activeProvider, activeModel, dropped, isHidden, ctxText })`——崩溃点从闭包搬进可测单元 |
| **新建** `thincoder-core/config-reload.mjs` | `reloadProviders(agent)` 本体（`thincoder-core/config.mjs` 越 500 软线后按下文候选线整段抽出；导入面由 re-export 保持） |
| **新建** `test/integration/model-picker-provider-freshness.test.mjs` | 集成两行（`CLI 39-1` ∥ `CLI 40-1`）的落点——**常驻档、收口不删** |
| `docs/core/design/PROVIDER.md` | §6.29 ∥ §6.30（已落盘） |
| `docs/core/design/CONFIG.md` | 一行单向指针指向 §6.29（归属声明，不复述判据） |
| `test/RTM.md` + `test/rtm/ends.md` | 故事索引两行（`CLI 39` ∥ `CLI 40`）+ 分册用例两行（`39-1` ∥ `40-1`，见下「集成面」） |

新建档四处（实施期落盘）：

```text
thincoder-cli/src/tui/provider-entries.mjs
thincoder-core/config-reload.mjs
test/integration/model-picker-provider-freshness.test.mjs
docs/batches/2026-11-08-provider-entry-sanitize.test.mjs
```

前两档常驻；集成用例档常驻（收口不删）；末一档是本批单测档，收口随批删除。

**层级结论**（判据 = `docs/core/requirements/METHODOLOGY.md` F3-1；数值单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.10：软线 500 主动审视 ∥ 硬限 800 必须拆）：本批无一档越硬限，无档跨层。

**读数与复量**：量法 = `doc_check(mode:"report", lines:[…])` 的「行数读数」块（`countContentLines`）。落盘首量时 `thincoder-core/config.mjs` 越 500 软线 ⇒ 按下文候选线当场抽出 `reloadProviders`；复量五档（含两档新建）读数块末行 = `越硬限 0 · 越软线 0`。数值留在命令输出（实施记录），此处只留结论与命令。

**`thincoder-core/config.mjs` 的处置 = 明确缓，不拆**：本批增量 = 一段过滤 + 一条载体 + 新导出 `reloadProviders`，集中在一个新函数体内。理由 = 增量单点、可整段抽出；硬限余量仍大。**落盘后复量一次**：若越 500 软线（主动审视），按候选线当场抽——`reloadProviders` 整段移到同目录新档，本档以 re-export 保持导入面（形态同 `config-migrate.mjs` ∥ `config-io.mjs` 两次既有拆分）；未越线则本批不动结构。

### 验收对照（每条指回本批条目）

| 条目 | 层 | 判据 | 红侧 |
|---|---|---|---|
| 1 | 单测 | 带 `null` 条目的临时 config ⇒ `providersList` 每项 name 为非空串；`providersDropped.length` = 丢弃条数 | 改前同一输入：长 2、第 2 项 `name === undefined`，`${p.name.padEnd(12)}` 抛 `Cannot read properties of undefined (reading 'padEnd')` |
| 2 | 单测 | `buildProviderEntries` 喂 `dropped: ["providers[1]: null"]` ⇒ 返回**首行** `type === "header"` 且文案逐字命中 §6.29 那条；渠道行 `provider` 全为非空串（那一屏可见面归集成 `CLI 39-1`） | 改前该函数在闭包内、不可 import（判据无从触达）；`null` 条目过装载后 `name` 为 `undefined` ⇒ `p.name.padEnd(12)` 抛错原文。`name === ""` **不崩**：`"".padEnd(12)` 返回 12 个空格，真实症状是渲染出一行无名字渠道（不崩、但不可寻址） |
| 3 | 单测 | 具名条目逐键相等（深比较改前 ∥ 改后同一输入） | 改前改后相等本身即为判据（无须红侧） |
| 4 | 单测 | 无任何由本批产出的名字：输出里无名条目 0 条，不出现补名 | — |
| 5 | 单测 | `providers = [null]` ⇒ `providerState === "invalid"` ∧ `providerStateReason` =「未配置任何 provider」 | 改前：`[{}]` ⇒ 渠表长 1 ⇒ reason 走「未配置 API 密钥」（错因） |
| 6 | 单测 | 无老字段的临时 config 装载前后字节相同（老字段迁移写回是既有行为，不属本批判据） | — |
| 7a | 单测 | `reloadProviders(agent)` 返回 `{ ok: true }`；`agent.providers` = 盘上现况；同名渠道 `_unavailable` 保留；`agent.providers` 与 `agent.config.providersList` 同一引用 | 改前：重读点不存在 |
| 7b | 单测 | 盘上把坏条目改好 ⇒ 重读后 `agent.config.providersDropped` 为空（表头消失的可见面归 `CLI 40-1`） | 改前：载体不跟新（表头读的是启动时那一份） |
| 7c | 单测 | 盘上改成非法 JSON ⇒ `{ ok: false, error }`（出错误行、列表不开的可见面归 `CLI 40-1`） | 改前：无此返回路径 |
| 8 | 单测 | `providers = [{name:"a"},{apiKey:"sk-leak",baseURL:"http://x"}]` ⇒ `providersDropped` 恰 `["providers[1]: no name"]`：记录里查无 `sk-leak` ∥ 查无 `baseURL`，原因取闭集四值之一 | 改前 `providerDropLine` 输出条目 JSON 前 60 字 ⇒ 密钥原样进载体 |

两层分工：单测档只判返回结构与数据形状，集成两行只判用户看见的那一屏——同一断言不在两层各留一份（先例 `docs/core/design/PROVIDER.md` §6.28）。

红侧命令 = `node --test docs/batches/2026-11-08-provider-entry-sanitize.test.mjs`；红侧读数在改前跑，输出留在 §5。

### 集成面（RTM delta）

读 `test/RTM.md` 现盘（故事索引里 CLI 编号至 38，无渠道列表相关故事）：

- **破行**：无——既有行无一声称渠道列表内容。
- **冗余行**：无。
- **缺行 2 行**，均来自「生产真出过的问题」（用户 `/model` 崩、盘上改完仍崩）：故事 `CLI 39 | 无名渠道条目不进使用面（/model 列表照常列出其余渠道）` ∥ 故事 `CLI 40 | 盘上改完不用重启，切渠道那一刻就是现况`。属册 = `test/rtm/ends.md`（族 `ends`），三端覆盖 = CLI 待补（本批落用例后转「有」）∥ VSC 缺 ∥ Desktop 缺。

**编号先行**：故事号 `CLI 39` ∥ `CLI 40` 先落 `test/RTM.md` 索引，用例号 `CLI 39-1` ∥ `CLI 40-1` 先落 `test/rtm/ends.md` 分册，再写用例标题（本仓行号形 = 故事-用例，先例 `test/integration/timer-reminder-glyph.test.mjs` 的 `test('CLI 33-1 …')`）。

**两行都从 `/model` 入口进**：`createModelPicker(ctx).openModelPicker()`，注入面 = 既有 ctx 的 `showPicker` ∥ `pushLine`（设计 `docs/core/design/PROVIDER.md` §6.30「集成入口」；本批不新增缝）。断言只落用户看见的那一屏，数组形状归批内单测档——两层不各留一份。

- **CLI 39-1**：临时 config = 一条 `null` 渠道 + 一条具名渠道；开 `/model` ⇒ 那一屏首行是告警行（断言到「有告警且指向 `providers[]`」为止，逐字文案归单测档），具名渠道行照常出现，全程无 `padEnd` 崩溃。
- **CLI 40-1**：盘上改完不重启再开 `/model` ⇒ 那一屏出现新渠道；坏条目改好后重开 ⇒ 表头消失；盘上写成非法 JSON ⇒ `pushLine` 出一行以 `[model] cannot re-read config:` 起头的错误，且 `showPicker` 一次未被调用（列表没开）。

业务可观察结果 = 用户打开渠道列表看到自己刚改过的渠道，且没有 error 行。

### 关键决策

**甲（丢弃 + 告警）而非乙（整份拒载）**——按派单要求回答「选甲时什么情况会让人以为配置是好的，其实不是」：

- 答案：**当告警看得见地被绕过时**。一行渠道消失、提示却只在用户不容易看见的通道里，用户会把「19 个渠道」当成全部，下次找不到那条会怀疑别处。所以甲的成立条件是告警落在用户管理渠道的地方——本批放在 `/model` L1 列表头（正是用户数渠道的那一屏），而不是 `console.warn`（盘上未见它接到 TUI 行的接线）。
- 乙的代价更大：一条坏行让 19 条可用渠道全不可用，恢复路径 = 手改文件；同档既有范式（F-4 `consultModels` 软失败化：非法条目过滤不 throw，去 startup brick）已经裁定这条路，本批对齐而非另立。

**新鲜度取「重读 + 按 name 合并 + 写回」，两种替代被淘汰**：局部表（选择面与动作面分叉）∥ 整表替换（冲掉 `_unavailable`）。理由与四步见 `docs/core/design/PROVIDER.md` §6.30。

**读失败不退旧表**：拿旧表当现况正是缺陷的形状，所以解析失败 ∥ 读不到一律报错并不开列表；档不存在则按缺省空渠表呈现——那是盘上现况。

**告警只住一处**：载体在数据层，可见面在列表头；`console.warn` 不再重复同一句话。

**提取 `buildProviderEntries` 为纯函数（评审第 1 轮裁令）**：崩溃点就在这函数体内（`p.name.padEnd`），验收不落在崩溃那一层等于没验那个 bug。形态 = 参数进来、返回值出去，L1 与用例共用同一个函数，测试不复制实现；坐标与签名 = `docs/core/design/PROVIDER.md` §6.29「可见面」。

**机判 ∥ 人工的分界写在前面**：机判覆盖函数产物（首行文案 + 渠道行 name 非空 + 不抛错）；真 TUI 屏的那一眼（配色 ∥ 宽度 ∥ 滚动）仍是人工读数，落 §5 一行——不默认。

### 上抛项

1. **其它端告警面**（§4 批准时一并裁，用户定）：本批只有 CLI 列表首行。VSC ∥ 桌面是否也出这条、是否另起批，由用户在 §4 定；那两端的准入同源与否见 `docs/core/design/PROVIDER.md` §6.29 边界那条 `unverified`。
2. **运行态半边 = 半量新鲜度，§4 必须亮给用户**：重读只换渠表与告警载体，`defaultModel` ∥ `providerState` ∥ `provider` 仍是启动时那份。用户看到的差异与自行对齐方式见 `docs/core/design/PROVIDER.md` §6.30「前置」；是否另起一批由用户在 §4 定。
3. **§1 状态行的模板占位归主 agent 收**（评审 #11）：本席无 §1 写权。

评审第 2 轮 15 条（2 红 8 黄 5 蓝）已逐条处置：两条红 = 集成两行改从 `openModelPicker()` 进、形状断言退回单测层 ∥ 参数契约改为「三项真必填 + 三项合法无值」。第 1 轮两条红同已落，不再上抛。
## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

评审第 2 轮（全量三档实读：批档 §1/§2 ∥ `docs/core/design/PROVIDER.md` §6.29 ∥ §6.30 ∥ `docs/core/design/CONFIG.md` §6.2）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 未解决 | §2「集成面」CLI 39「调 `buildProviderEntries`」+ §6.29「单元 ∥ 集成用例 import 同一个函数并喂这几项」；§6.30「不 throw——出词归调用方」 |
| 2 | 🔴 | 未解决 | §6.29「六个参数全部必填、无缺省」∥ 同节「传 `agent.config?.providersDropped`」；§6.22「③ 无 ⇒ `null`（合法」；先例「if (cmClean.dropped.length) merged.agent.consultModelsFiltered」 |
| 3 | 🟡 | 待处置 | CONFIG.md §6.2「老字段迁移写回 / 告警可能出现」∥ §2 条目 6「装载期零写盘」∥ §6.30 四步「读盘（`loadConfig`）」 |
| 4 | 🟡 | 待处置 | §2「零端改（经同一 `loadConfig` 自动同源）」∥ §6.29「unverified 是否都经同一 `loadConfig` 取渠表」 |
| 5 | 🟡 | 待处置 | §2「不改 `/model` 的交互」∥ 同表条目 7「`/model` 打开即重读盘上渠道」+ 7c「列表不开」；§6.29「不改 `/model` 交互：只多一行表头」 |
| 6 | 🟡 | 待处置 | §2「`test('CLI 39 …')`」∥ §6.17 RTM 行「`23-1`」；§2「属册 `ends`」∥ 表内「`test/rtm/<族>.md`」 |
| 7 | 🟡 | 待处置 | §6.30 全文无「先例（closest-precedent）」∥ 无「survey-evidence」行（对照 §6.29 两行俱在） |
| 8 | 🟡 | 待处置 | §6.30「`[model] cannot re-read config: <message> (file: <path>)`」——§6.29「新名与文案（三问答复）」只覆盖 `providersDropped` / `isUsableProviderEntry` / `reloadProviders` / 表头两行 |
| 9 | 🟡 | 待处置 | §2「层级结论」只有结论、无判据命令；`thincoder-core/config.mjs` 实测 463 行（自量）+ 本批新增过滤/载体/新导出 ⇒ 500 软线风险未评 |
| 10 | 🟡 | 待处置 | §6.30「红侧 2（读失败）：盘上改为一段非法 JSON 后开列表」——只有构造复现，无数据读数 ∥ 日志 ∥ 用户原话；「列表不开」的取舍未论证 |
| 11 | 🔵 | 已登记 | §1「**状态行**：🔄 进行中（…）」模板占位（§2 上抛项 3 已派） |
| 12 | 🔵 | 待处置 | §6.29 三问行 `reloadProviders` 填的是先例行（`reloadMcpFromDisk`），未答本名是否已在盘；被上提的 `buildProviderEntries`（既有名、原住 `model-picker.mjs`）无三问行 |
| 13 | 🔵 | 待处置 | §6.29「用 `_setConfigPathForTest`（`thincoder-core/config.mjs` 再出口的测试缝）」，未提配对 `_reset<名>ForTest`（CONFIG.md §6.2 通道③ 成对规则） |
| 14 | 🔵 | 待处置 | §6.30「列表是新的、运行态是旧的」——本批交付半量新鲜度，留给 §4 用户批准时明示 |
| 15 | 🔵 | 评审受限 | 无项目标准档、无文档地图：methodology ∥ document-ownership 两维按 Project Guide + 评审判据判，非按档判 |

计数：🔴 2 · 🟡 8 · 🔵 5（共 15 条）。两条红 = 集成行仍未驱动 `/model` 入口（且与单元验收重复持有同一断言）∥ 六参数「全必填、缺则报参数名」与本档自定的调用点（`agent.config?.providersDropped`、§6.22 合法 `model: null`）互相矛盾。§6.29 ∥ §6.30 的先例/核查/三问、CONFIG.md 单向指针、RTM delta 起始读（破行/冗余/缺行）已核在案，不另记。

结论：不通过。

VERDICT: changes-required

### 轮次 2（评审子代理）

第 2 轮核验（全量三档实读：批档 §1/§2 ∥ `docs/core/design/PROVIDER.md` §6.29 ∥ §6.30 ∥ `docs/core/design/CONFIG.md` §6.2）。前 15 条结论：13 条已修、2 条按理由关（均 🔵）。新记 2 条 🟡。

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | §2「两行都从 `/model` 入口进」+「断言只落用户看见的那一屏，数组形状归批内单测档」；§6.29「集成两行不进这一层」 |
| 2 | 🔴 | 已修 | §6.29「边界真必填的只有三项」∥「三者在函数内按 `?? []` ∥ `?? null` 归一」 |
| 3 | 🟡 | 已修 | §6.29「「零写盘」的边界（不涵盖既有迁移写回）」∥「不重写被丢弃的那条 `providers[]` 条目」；CONFIG.md「运行中重读沿用本装载面」 |
| 4 | 🟡 | 已修 | §2「若三端同经 `loadConfig` 取渠表则自动同源，**未证**」 |
| 5 | 🟡 | 已修 | §6.29「打开时的行为按 §6.30 明改两处——多一行表头（仅当有丢弃）∥ 读失败时不打开列表并出一行错误」 |
| 6 | 🟡 | 已修 | §2「用例号 `CLI 39-1` ∥ `CLI 40-1` 先落 `test/rtm/ends.md` 分册」（分册名在盘未核：`test/rtm/ends.md` 出评审面） |
| 7 | 🟡 | 已修 | §6.30「先例（closest-precedent）：对位 = `thincoder-cli/src/tui/cmd-mcp.mjs`」+「结论 = 外部 **none relevant**，本仓先例如上」 |
| 8 | 🟡 | 已修 | §6.29「`[model] cannot re-read config: …` — `existing:`」三问行已补 |
| 9 | 🟡 | 已修 | §2「本次读数块末行 = `越硬限 0 · 越软线 0`」+「落盘后复量一次：若越 500 软线（主动审视），按候选线当场抽」 |
| 10 | 🟡 | 已修 | §6.30「场景来源：本批服务的正是「运行中手改 config.json」」+「为什么拒开，而不是「开空表 + 错误行」」 |
| 11 | 🔵 | 关（有理） | §1「状态行：🔄 进行中（…）」仍在；§2「§1 状态行的模板占位归主 agent 收（评审 #11）：本席无 §1 写权」——非本席写权，已上抛 |
| 12 | 🔵 | 已修 | §6.29「`reloadProviders` — `none found:`：全仓 `.mjs` 扫 `reloadProviders` 零命中」；`buildProviderEntries` 亦有「`existing:`」行 |
| 13 | 🔵 | 已修 | §6.29「测试缝 = `thincoder-core/config-io.mjs` 那一对 `_setConfigPathForTest(p)` / `_resetConfigPathForTest()`」 |
| 14 | 🔵 | 已修 | §2「运行态半边 = 半量新鲜度，§4 必须亮给用户」 |
| 15 | 🔵 | 关（受限） | 无项目标准档、无文档地图：methodology ∥ ownership 两维仍按 Project Guide + 评审判据判 |
| 16 | 🟡 | 新 | §2「两处新建档路径（实施期落盘）」只列 `provider-entries.mjs` ∥ 批内单测档——两条集成行（`CLI 39-1` ∥ `CLI 40-1`）无落点档名 |
| 17 | 🟡 | 新 | §2 验收对照第 2 行红侧「同输入喂 `providers: [{name:"a"},{name:""}]` ⇒ `p.name.padEnd` 抛」——`"".padEnd(12)` 不抛 |

计数：🔴 0 · 🟡 2（均非 must-fix）· 🔵 0 新。无未解决红；两条新黄不阻塞。

结论：通过。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

**授权来源**：用户 21:55 报「`/model` 崩」→ 21:57「甲」（逐项做真的）→ 22:00「这个能不能改成切的时候读啊?」。**本批就是执行这三句**：修崩 + 打开即读盘。

**批准范围**：`/model` 崩溃修复 ∥ 打开即重读。**设计细节的批准来自评审（#131 `pass`），不是来自用户**——两者不混成一句。

### 必须让用户知情的一件事（实施席 #132 上抛）

**本批只换了「列表」这一半，运行态还是启动时那份。**

```
列表    = 新读的（删掉的渠道会从列表里消失）
运行态  = 旧的（agent.provider ∥ providerState ∥ defaultModel 仍是启动解析的）
⇒ 用户删掉一个渠道：列表里没了，请求仍走它
```

**这是我受批范围之外的另一半**（替换 `agent.provider` 会动进行中的请求面，不宜同批暗改）。**它的去向由用户定**：另起一批补运行态，还是先这样用着。

## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-11-08



### 实施摘要

修在装载层，不修在渲染层。

一条无 `name` 的渠道条目在装载点被丢弃并记一句话；`/model` 列表首行说出「有条目被跳过、要改 `providers[]`」。

`/model` 打开即重读盘上渠道：盘上改完不必重启。

改动面（6 档，其中 2 档新建）：

- `thincoder-core/config-normalize.mjs` — 新导出准入谓词 `isUsableProviderEntry(p)`（判据单源）。
- `thincoder-core/config.mjs` — `loadConfig` 的 `providers:` 分支在整表别名之前按判据过滤；丢弃记录挂 `merged.providersDropped`（`string[]`，一条一句）；再出口 `reloadProviders`。
- `thincoder-core/config-reload.mjs` — **新建**（越出 §2 文件表，理由见「决定披露」第 1 项）：`reloadProviders(agent)` 本体。
- `thincoder-cli/src/tui/provider-entries.mjs` — **新建**：`buildProviderEntries({ providers, activeProvider, activeModel, dropped, isHidden, ctxText })`，崩溃点 `${p.name.padEnd(12)}` 只住此函数体。
- `thincoder-cli/src/tui/model-picker.mjs` — `openModelPicker()` 首句重读；失败推一行 `[model] cannot re-read config: …` 且不开列表；闭包内旧 `buildProviderEntries` 删除。
- 用例两档：`docs/batches/2026-11-08-provider-entry-sanitize.test.mjs`（批内，收口删）∥ `test/integration/model-picker-provider-freshness.test.mjs`（常驻，两行 `CLI 39-1` ∥ `CLI 40-1`）。
- RTM delta：`test/RTM.md` 索引两行；`test/rtm/ends.md` 两个故事节 + 两条用例行。

### §2 验收对照（逐条）

| 条目 | 状态 | 证据（用例 ∥ 坐标） |
|---|---|---|
| 1 无名条目不进使用面 | ✅ | 批内单测「条目 1 装载过滤」「条目 1 拒绝侧」；`isUsableProviderEntry` + `config.mjs` 过滤支 |
| 2 丢弃看得到（首行告警） | ✅ | 批内单测「条目 2 丢弃告警是列表首行」「条目 2 无丢弃时首行即渠道行」「条目 2 参数契约」 |
| 3 具名条目一个字节不动 | ✅ | 批内单测「条目 3 具名条目逐键相等」——逐键值 + **键面与键序**都断言 |
| 4 不给无名条目编名字 | ✅ | 批内单测「条目 4 不产名字」：输出渠表恰 `["ok"]`，零补名 |
| 5 `defaultModel` 面零新增路径 | ✅ | 批内单测「条目 5 全表皆无效」：`providerState = invalid` ∧ reason =「未配置任何 provider」 |
| 6 盘面 = 不重写被丢弃那条 | ✅ | 批内单测「条目 6 装载前后盘上字节相同」 |
| 7 打开即重读 | ✅ | `test/integration/model-picker-provider-freshness.test.mjs` 的 `CLI 40-1` 第 ② 步 |
| 7a 重读成功面 | ✅ | 批内单测「条目 7a」：盘上现况 ∥ `_unavailable` 按 name 保留 ∥ 三个读点同一数组 |
| 7b 载体跟新 | ✅ | 批内单测「条目 7b」（清掉方向）+「条目 7b 反向」（置位方向，评审补） |
| 7c 读失败 = 报错不退化 | ✅ | 批内单测「条目 7c」+ 集成 `CLI 40-1` 第 ③ 步（`showPicker` 零调用） |
| 集成 `CLI 39-1` | ✅ | 同档：首行告警且指向 `providers[]`、渠道行照常、无 `padEnd` 崩错 |
| 集成 `CLI 40-1` | ✅ | 同档：新渠道出现 ∥ 表头消失 ∥ 读失败拒开 |

### 红侧读数（改前真跑，输出原样）

① 装载面（临时 config = 一条具名 + 一条 `null`）：

```text
providersList.length = 2
providersList[1] = {}
providersList[1].name = undefined
template THREW: TypeError: Cannot read properties of undefined (reading 'padEnd')
empty-string padEnd = "            " — no throw
providersDropped in loadConfig result: undefined
```

② 用户入口面（`createModelPicker(ctx).openModelPicker()`，同一份临时 config）：

```text
openModelPicker THREW: TypeError: Cannot read properties of undefined (reading 'padEnd')
screens opened = 0
```

③ 改前符号与全无效档：

```text
typeof reloadProviders (exported by config.mjs) = undefined
typeof isUsableProviderEntry (config-normalize.mjs) = undefined
thincoder-cli/src/tui/provider-entries.mjs exists = false
[null] ⇒ providersList = [{}] length = 1
[null] ⇒ providerState = invalid / providerStateReason = 未配置 API 密钥（providers[].apiKey）——请先配置渠道密钥
```

④ 批内单测档改前跑（模块尚不存在）：

```text
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'D:\teamcode\thincoder\thincoder-cli\src\tui\provider-entries.mjs'
tests 1 · pass 0 · fail 1
```

⑤ 集成两行改前跑（三档源文件临时退回 HEAD，用最终版用例档跑，跑完即回填）：

```text
CLI 39-1 … TypeError: Cannot read properties of undefined (reading 'padEnd')
          at buildProviderEntries (file:…/thincoder-cli/src/tui/model-picker.mjs)
CLI 40-1 … TypeError: Cannot read properties of undefined (reading 'padEnd')
tests 2 · pass 0 · fail 2
```

### 绿侧读数（改后）

```text
node --test docs/batches/2026-11-08-provider-entry-sanitize.test.mjs
  tests 13 · pass 13 · fail 0

node --test test/integration/model-picker-provider-freshness.test.mjs
  tests 2 · pass 2 · fail 0
```

行数读数（量法 = `doc_check` 的「行数读数」块，`countContentLines`）：

六档 — `thincoder-core/config.mjs` 496 · `thincoder-core/config-reload.mjs` 59 · `thincoder-core/config-normalize.mjs` 123 · `thincoder-cli/src/tui/model-picker.mjs` 310 · `thincoder-cli/src/tui/provider-entries.mjs` 92 · 批内单测档 213；末行 `越硬限 0 · 越软线 0`。

落盘首量时 `thincoder-core/config.mjs` = 543（越 500 软线）⇒ 按 §2 指的候选线当场抽出 `reloadProviders`，复量落到 496。

全量集成套（本席旁证，非交付门）：

```text
node test/run.mjs
  tests 175 · pass 170 · fail 5 · cancelled 0
  失败档 = anthropic-tool-roundtrip.test.mjs（3 条）∥ browser-shared-pool.test.mjs（2 条）
```

两条都不在本批改动面。

`browser-shared-pool` 的失败原文是 `browser failed to start: DevToolsActivePort not written within 25s`——本机 Edge 起不来的环境面。

`anthropic-tool-roundtrip` 的失败原文是 `context overflow: prompt ~97931 tokens … window 128000 (limit 96000)`。

把 `thincoder-core/config.mjs` ∥ `thincoder-core/config-normalize.mjs` 退回 HEAD 单跑一次，复现同一句（`pass 0 · fail 1`）⇒ 改前即在红。

真 TUI 那一眼（配色 ∥ 宽度 ∥ 滚动）：**本席未取**——本环境无 TTY，未以真屏目视 ⇒ `unverified`。

可机读的代用读数：告警行 71 字（含前导空格 72），样例渠道行 31 字；`pickers.mjs` 的 header 分支渲染为 ` ${e.text}`、bold + tool 色，80 列下不截断。

### 决定披露（越出字面或越出文件表的地方，逐条给理由）

| # | 项 | 理由与依据 |
|---|---|---|
| 1 | 新建 `thincoder-core/config-reload.mjs`（不在 §2 文件表） | §2 逐字预授权：「按候选线当场抽——`reloadProviders` 整段移到同目录新档，本档以 re-export 保持导入面」。触发条件实测成立（543 > 500 软线）。导入面零改：`config.mjs` 再出口 `reloadProviders` |
| 2 | 新建 `test/integration/model-picker-provider-freshness.test.mjs`（§2 未给落点） | 父侧令：§2 只写了 RTM 索引与分册，两条集成行无落点档；按常驻档落 `test/integration/`，**不是**批内单测档——后者收口要删，用例落进去就没了 |
| 3 | `ctxText` 实现为**函数** `(provider) => string`，§6.29 参数契约字面写「（字符串）」 | §6.29 自身两处互斥：同节「L1 调用点」逐字要求传 `declaredContextText`（函数），且每行需各自的 ctx 回显，一个字符串无法产出多行不同文本。取函数形；类型不符仍按契约抛 `TypeError` 点名 `ctxText`。设计档不是本席的笔 ⇒ 漂移见「设计档漂移」第 2 条 |
| 4 | 重读**不**重复应用准入谓词 | 重读经 `loadConfig` 拿到已过滤的表与丢弃载体：判据仍只有一份实现、零第二份丢弃记录。§6.30 写「调用点两处」，此处落在「装载一处、重读经装载共用」，行为等价 |
| 5 | 一处注释缩进用 node 脚本修补 | `edit` ∥ `hashline_edit` 会去掉替换内容首行的前导空格，`apply_patch` 在本会话解析不到相对路径；只动缩进，语义零改 |
| 6 | `agent.config.providersDropped = dropped.length ? dropped : undefined` | 保留键、值为 `undefined` 而非删键：消费面 `agent.config?.providersDropped` 行为等价（假值 = 无丢弃），此处取「同键、同形」写法 |

### 父侧点名两处评审 🟡 的处置

**① 集成用例落点**：`test/integration/model-picker-provider-freshness.test.mjs`（常驻档，收口不删）。

用例标题 `'CLI 39-1 …'` ∥ `'CLI 40-1 …'`（全编号，含端名）。

批内单测档是另一个档——`docs/batches/2026-11-08-provider-entry-sanitize.test.mjs`，收口随批删除，读数留本节。

**② 「喂 `{name:""}` ⇒ `padEnd` 抛」不成立**：实跑 `"".padEnd(12)` 返回 12 个空格、**不抛**。

只有 `undefined` ∥ `null` 才抛 `Cannot read properties of undefined (reading 'padEnd')`。

空串的真实症状 = 渲染出一行无名字渠道（`provider === ""` 的行照常可选中），不是崩。

红侧成立的那条是 `null` 条目（`{ ...null }` 得 `{}` ⇒ `name` 为 `undefined`）；本节「红侧读数」①②⑤ 即其现场。

§2 验收表 2 红侧那句的更正记在这里——§2 不是本席的笔。

### 内部审计与代码评审（轮次与终态）

- **发散审计（explore，只读）· 第 1 轮**：结论 `aligned` — 红 0 ∥ 黄 4 ∥ 蓝 4。
- 黄四条 = 设计档坐标滞后（§6.30 仍指 `thincoder-core/config.mjs`）· §6.29 的 `ctxText` 类型冲突 · 集成档不在 §2 文件表 · 本节原为空（即本节）。
- **代码评审（advisor，type=code）· 第 1 轮**：`VERDICT: pass`，红 0；两条 🟡 = 半量新鲜度须在 §4 对用户明示（归父侧）∥ 丢弃摘要可能带 `apiKey`（建议设计侧收紧）；提示项 = 错误行坐标取模块常量 ∥ 置位方向无用例 ∥ 软线余量薄。
- **自修第 1 轮**：采纳两条提示——批内单测「条目 3」加键序断言、新增「条目 7b 反向」钉住载体置位支；复跑 13/13 绿。
- **终态**：`clean`（红 0；未采纳项在「决定披露」逐条给理由，或属父侧/设计席的笔）。

### 设计档漂移（归设计席/父侧，本席只报不改）

1. `docs/core/design/PROVIDER.md` §6.30 逐字「重读本体住 `thincoder-core/config.mjs` 的新导出 `reloadProviders(agent)`」——本体已按 §2 预授权抽出到 `thincoder-core/config-reload.mjs`；「本体住」应改为新档位置，`config.mjs` 只留再出口。`test/rtm/ends.md` 节注已按现盘写。
2. 同档 §6.29 参数契约「`ctxText`（字符串）」与同节「L1 调用点」传 `declaredContextText` 互斥；实现取函数形（披露第 3 项），条文应改为函数 `(provider) => string`。
3. 同档 §6.29 的丢弃记录形（`providers[18]: null`）在坏条目携 `apiKey` 时会把密钥写进数据层载体。当前唯一消费面只读条数，屏上暂无泄漏；建议设计侧补一句遮罩口径。
4. §2 受影响文件表缺两条集成行的落点档（父侧已点名，本条第 1 项处置见上）。

### 补充轮 · 载体去条目内容（设计席 #133 收紧口径）

**问题**：`providersDropped` 是数据层载体（会进日志 ∥ 报错 ∥ 别人的调试输出），而旧 `providerDropLine` 取条目 JSON 前 60 字——「有 `apiKey` 却缺 `name`」的条目把 `sk-…` 原样写进了载体。判据只需要「第几条坏了、坏在哪」，条目内容对它零价值。

**改了三处（均在本席文件表内）**：

| 档 | 改动 |
|---|---|
| `thincoder-core/config-normalize.mjs` | 新导出 `providerDropReason(p)`：返回闭集四值之一，可进使用面返回 `null`；`isUsableProviderEntry(p)` 改为 `providerDropReason(p) === null`。一份判定、两个面 |
| `thincoder-core/config.mjs` | `providerDropLine(index, reason)` 只拼「盘上下标 + 原因」，任何分支不再 `JSON.stringify` 条目；丢弃记录改无条件赋值（载体不许由盘上同名键直通） |
| `docs/batches/2026-11-08-provider-entry-sanitize.test.mjs` | 条目 1 两处断言改「下标 + 原因」；六形逐条闭集断言；**新增条目 8**（密钥不进载体，装载 ∥ 重读两条路）；闭集自检改为对实现输出取样 |

**红侧读数（改前真跑，输出原样）**——探针 = 临时 config 喂 `{ name: "a", baseURL: … }` + `{ apiKey: "sk-leak", baseURL: "http://x" }`，`_setConfigPathForTest` 指过去后 `loadConfig()`：

```text
providersDropped = ["providers[1]: {\"apiKey\":\"sk-leak\",\"baseURL\":\"http://x\"}"]
carrier includes sk-leak = true
carrier includes baseURL = true
typeof providerDropReason export = undefined
```

同一次改前，批内单测档（已是最终形态）跑红：

```text
SyntaxError: The requested module '../../thincoder-core/config-normalize.mjs' does not provide an export named 'providerDropReason'
tests 1 · pass 0 · fail 1
```

**绿侧读数（改后，同上探针与同两档用例）**：

```text
providersDropped = ["providers[1]: no name"]
carrier includes sk-leak = false
carrier includes baseURL = false
closed-set records = ["providers[0]: null","providers[1]: not an object","providers[2]: not an object","providers[3]: no name","providers[4]: empty name"]
```

```text
node --test docs/batches/2026-11-08-provider-entry-sanitize.test.mjs
  tests 14 · pass 14 · fail 0

node --test test/integration/model-picker-provider-freshness.test.mjs
  tests 2 · pass 2 · fail 0
```

集成两行仍绿即「重读 ∥ 告警面没被这次改坏」的读数：`CLI 39-1` 判首行告警且指向 `providers[]`，`CLI 40-1` 判新渠道出现、表头消失、读失败拒开。两条断言只落那一屏，未随记录形改动移位。

**载体改为无条件赋值的读数（只有改后这一半，如实标注）**：盘上同时写 `providersDropped` 同名键、且零丢弃 ⇒

```text
no-drop + forged disk key ⇒ providersDropped = undefined
```

改前那形是条件赋值（`if (droppedProviders.length) merged.providersDropped = droppedProviders`），与 `...config` 摊平叠加会把盘上手写值收进载体；这一侧**未跑**，依据是旧那一行的字面，不是读数。

**行数读数**（量法 = `doc_check` 的「行数读数」块，`countContentLines`）：`thincoder-core/config.mjs` 499 · `thincoder-core/config-normalize.mjs` 135 · 批内单测档 279；末行 `越硬限 0 · 越软线 0`。

本席首轮改动曾把 `thincoder-core/config.mjs` 推到 501（越 500 软线）⇒ 未抽新档，按同内容更紧的写法收回 499：合并一行 import、压缩两处注释。可整段抽出的候选仍是 `reloadProviders`，已在上一轮抽出，本档增量只剩过滤旁的一行载体与一处签名。

### 内部审计与代码评审（本轮）

- **发散审计（explore，只读）· 第 1 轮 · 终态 `aligned`**：红 0 ∥ 黄 1 ∥ 蓝 4。
  - 黄 = 新导出 `providerDropReason` 未进 `docs/core/design/PROVIDER.md` §6.29「新名与文案」与批档 §2 文件表（见下「设计档漂移」第 1 条）。
  - 蓝四条 = 同一条目对同一纯函数求值两次 ∥ 设计档未写「原因函数为源、准入谓词为其 `null` 面」的分层 ∥ 批档 §5 旧文与现盘不符 ∥ 相邻面 `agent.consultModels` 仍取 JSON（不同载体，未动）。
- **代码评审（advisor，type=code）· 第 1 轮 · `VERDICT: pass`**：红 0 ∥ 黄 2（均非 must-fix）∥ 蓝 4。
  - 黄①：整键形态的坏 `providers`（非数组）落空表且无丢弃记录——**设计悬空，归设计席/父侧裁**，本席不擅加闭集第五值（见下「待裁」）。
  - 黄②：本轮收紧的真红侧未落进 §5 的旧读数——本节「红侧读数」即其补录。
  - 蓝四条已逐条处置：闭集自检空转（改为对实现输出取样）∥ 头注释把「共用」写成「也消费」（两处依实改）∥ 载体条件赋值可被盘上同名键直通（改无条件赋值）∥ 谓词每条目求值两次（**未采纳**，理由见下）。
- **自修第 1 轮**：采纳上列三条蓝 + 红侧补录；复跑 14/14 ∥ 2/2 绿。
- **终态**：`clean`（红 0；未采纳项在本节给理由）。

**未采纳「一次取值两用」的理由**：设计档 `docs/core/design/PROVIDER.md` §6.29 把装载期判据按名写死——「判据单源 = `isUsableProviderEntry`，只由装载调用一次」。改成只调 `providerDropReason` 会让那句条文当场变假，并把 `isUsableProviderEntry` 变成仅测试引用的公共导出；两条路都只是一份实现。取「两条路各调一次同一纯函数」：判据名留在装载点、原因仍只有一个来源、条文逐字成立。代价 = 每条目多一次 O(1) 纯函数调用（20 条量级，装载期一次）。

### 设计档漂移（归设计席/父侧，本席只报不改）

1. `docs/core/design/PROVIDER.md` §6.29「新名与文案（三问答复）」与批档 §2 受影响文件表都只写了 `isUsableProviderEntry`；盘上多了一枚 `providerDropReason`（判据本体，谓词是它的 `null` 面）。建议设计席补一行三问：`none found:`（全仓 `.mjs` 扫 `providerDropReason` 零命中）+ 「本体为源、`isUsableProviderEntry` = 其 `null` 判定」。
2. 同节「原因取闭集四种，与 `isUsableProviderEntry` 的失败分支一一对应」如今字面为真但方向相反：失败分支住在 `providerDropReason`，谓词没有分支。建议改成「原因闭集住 `providerDropReason`，准入谓词取其 `null` 面」。

### 待裁（本席不擅改，交父侧/设计席）

**整键形态的坏 `providers` 不进闭集、也不留丢弃记录**：装载只分两支——数组按条目判据逐条过滤，否则（对象 ∥ 字符串 ∥ 数字）直接空表，载体不存在；`/model` 因此无表头，`providerStateReason` 落「未配置任何 provider」。用户把 `providers` 写成对象时看不到「类型写错了」。`thincoder-core/team.mjs` 有同形先例（非数组按空表）。两种收法：设计档明写「非数组不属本闭集、按缺省空表处理」（一句话封口，实现零改），或闭集补第五值并在装载处落一条记录（要改设计 + 加用例）。

## §6 验证与收口（父代理）

### 验证与收口

**交付物**：`/model` 崩溃修复（无 `name` 的渠道条目不进使用面）+ 打开即重读盘上渠道。落点九档，其中 `thincoder-core/config-reload.mjs` ∥ `thincoder-cli/src/tui/provider-entries.mjs` ∥ 批内单测档 ∥ `test/integration/model-picker-provider-freshness.test.mjs` 为新建。

**父侧复核（本轮实跑）**：

```
node --test docs/batches/2026-11-08-provider-entry-sanitize.test.mjs          ⇒ 14 / 14 pass
node --test test/integration/model-picker-provider-freshness.test.mjs         ⇒ 2 / 2 pass
doc_check(mode:"gate", docs=[PROVIDER.md, CONFIG.md, 本批档])                 ⇒ DOC-CHECK GATE: PASS
行数读数（countContentLines）config.mjs 499 ∥ config-normalize.mjs 135 ∥ config-reload.mjs 59
                              model-picker.mjs 311 ∥ provider-entries.mjs 92  ⇒ 越硬限 0 · 越软线 0
```

**红侧三读数（真跑，非推断）**：
- 原崩溃：临时 config 一条具名 + 一条 `null` ⇒ `providersList[1].name = undefined` ⇒ `Cannot read properties of undefined (reading 'padEnd')`；`openModelPicker()` 同抛且零屏打开。
- 密钥面：改前 `providersDropped = ["providers[1]: {\"apiKey\":\"sk-leak\",\"baseURL\":\"http://x\"}"]`、载体含 `sk-leak` 与 `baseURL`；改后 `["providers[1]: no name"]`、两者皆无。
- 集成两行：在退回 HEAD 的三档源文件上跑 ⇒ `tests 2 · pass 0 · fail 2`，两条都红在崩溃行。

**全量集成套旁证**：`tests 175 · pass 170 · fail 5`，五条全在 `anthropic-tool-roundtrip.test.mjs`（3）与 `browser-shared-pool.test.mjs`（2）。前者已把两档源文件退回 HEAD 单跑复现同一句 ⇒ **改前即红**；后者是 `DevToolsActivePort not written`（本机 Edge 环境面）。**均不在本批改动面。**

### 收口时仍开着的四条（不阻收口，逐条落点）

| # | 内容 | 去向 |
|---|---|---|
| 1 | **半量新鲜度**：重读只换列表，`agent.provider` ∥ `providerState` ∥ `defaultModel` 仍是启动那份 ⇒ 删掉渠道后列表没了、请求仍走它 | **§4 已亮给用户**，去留由用户定 |
| 2 | **整键类型错误无可见面**：`providers` 写成对象 ⇒ 空表 + reason「未配置任何 provider」，用户看不到"类型写错了" | 设计档已写明"该面尚无任何可见提示"；**另记账** |
| 3 | **真 TUI 目视未取**：本环境无 TTY，配色 ∥ 宽度 ∥ 滚动未以真屏看过（`unverified`）。代用读数：告警行 71 字、样例渠道行 31 字，80 列下不截断 | 用户下一次开 `/model` 时的那一眼即读数 |
| 4 | `config.mjs` 499 行，距 500 软线 1 行 | 再有任何增量即按 §2 候选线当场抽，不等到越线 |

### 收口对账

- **§2 ↔ 设计档**：三处漂移（`config-reload.mjs` 坐标 ∥ `ctxText` 函数形 ∥ 原因函数方向）已由设计席 #133 ∥ #135 收；`providerDropReason` 已进三问与文件表。
- **§2 ↔ §5**：一致。**一处须说明**：§2 验收 2 的红侧原写「喂 `{name:""}` ⇒ `padEnd` 抛」，实施席实跑证伪（`"".padEnd(12)` 返回 12 空格、不抛），**§2 已改成真实症状**（空串渲染出一行无名字渠道，不崩但不可寻址）。
- **前批遗留**：无。`前情 = ledger-disposal（进行中）`，两批改动面零交集。
- **修正轮落地前置**：设计侧五轮（#121 初版 ∥ #123 ∥ #125 ∥ #129 ∥ #131 评审，`#127` ∥ `#130` ∥ `#133` ∥ `#135` 修正）与实施侧两轮（#132 ∥ #134）均落地验过，门 PASS。
- **暂缓批复核**：无。
- **用户面同步**：`/model` 行为变化两处已写进 §4 —— 打开即重读；读失败不出列表并出一行错误。**用户重启后可自验。**
- **台账**：`#2210` 本条；脱出两条 —— 半量新鲜度（运行态半边）∥ 整键类型错误无可见提示。

### 声明

**本批有集成验证**：`test/integration/model-picker-provider-freshness.test.mjs` 两行（`CLI 39-1` ∥ `CLI 40-1`，常驻档、收口不删），全绿。集成集现状 = 17 档 / 175 例，落在 ≈50–100 的窗口之上（**既有存量，非本批所致**）。

**单元测试档随批删**：`docs/batches/2026-11-08-provider-entry-sanitize.test.mjs`（14 例）在收口时删除，`§5` 留读数行。
