# 2026-11-14 · 工具描述一句话化与写门参数提权
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-14 · 来源 = 来源 = 用户 2026-11-14 05:00 裁定「甲」；依据 = 本会话 dsh 工具面比对与极简档固定开销读数。
> 台账 = #2407（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-14
批起 sha = a8eba32e4c5d9993186ca57f99848182a6413960
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 本批做什么

把工具描述常驻面重写成一句话（甲：只写这个工具干什么），其余内容（示例、分支细则、错误说明、选择规则）落到按档展开的展开面。写门参数 `ledger` ∥ `project` 的说明从 21 处参数副本抽进 system section 一次讲清。参数 schema 保留，只去纯冗余。

### 为什么

极简档工具面 60,730 字符（描述 30,461 ＋ 参数 30,269），平均每工具 2,429 字符，是同仓参照（dsh base 34 工具均 1,030）的 2.36 倍。描述占一半，大工具的描述里大量是选择规则、错误码与维护者向的设计理由。

### 已定决定

- **已定决定**：工具描述常驻面只写一行用途，不写使用边界与注意事项；边界靠调用失败与被拒来学。 · 用户原话：「甲」 · 时间：2026-11-14 05:00

### 口径变更（须同步需求档）

`docs/core/requirements/PROMPT-SYSTEM.md` §7 现写「完整档装配成与改造前逐字相同」。常驻面重写后这条不成立：完整档 = 重写的一句话 ＋ 展开面，与改造前语义等价但不是逐字相等。

### 代价

- 静默失败点（`overwrite` 默认拒绝、缺 `promptPattern` 即等到超时）不再出现在描述里，模型要靠一次失败才学会。
- 完整档同样变短，不是只改极简档。

### 验收方向

- 工具面字符读数，两档分开报
- 展开主题逐个 `knowledge get` 可取回
- 工具集合与参数 schema 键集不缩水
- 集成用例与既有回归全绿

### 不做

- 不按档裁工具集合（属产品定位，另议）
- 不改工具行为与参数语义

### 需求口径已同步（主 agent 本笔）

`docs/core/requirements/PROMPT-SYSTEM.md` §7 已改为：

> 工具 schema（参数、必填、枚举、校验）不因档位改写；工具描述分常驻面与展开面——常驻面只写用途一句话，示例、分支细则、选择规则与错误说明在展开面；完整档装配后保留全部信息（语义等价，不要求逐字复刻旧文），极简档只发常驻面、展开面经 `knowledge` 主题取回。

先前那句「完整档装配后与改造前逐字一致」由此作废。设计档 `docs/core/design/PROMPT-SYSTEM.md` §7 与之同口径，由设计席改。

### 第 1 轮评审裁决（11 项）

- **🔴#1 行数尺与拆分方案** ⇒ 修。§2 读数改用 `countContentLines`（现 510）；方案 = 把两条写门参数常量与新增 section 文本搬出 `thincoder-core/tools/shared.mjs`，使该档回到 500 线内，本批落地并记拆后读数。
- **🔴#2 集成用例无落档行** ⇒ 修。机读清单补 `test/integration/tool-description-tiers.test.mjs`；`CLI 50-5` 点名落该档。
- **🟡 九项** ⇒ 修。验收对照补判据/判者/命令/边界/错误侧；加 69 份 `tool-docs` 处置枚举源；`PROMPT-SYSTEM` §9 验证项进验收；需求 §9.1 两句一并引；其余按评审建议落。
- **上抛项撤销**：`docs/core/requirements/TOOLS.md` §1 现文已含「其中常驻面只写用途一句话，其余进展开面」，两种读法不再并存。

### 第 35 号上抛裁定（需求 §9.1 与 §7 两种读法）

取「语义等价」读法，依据是用户已定的甲案（常驻面只写一句用途）与需求 §7 新口径，后者必然改写完整档文本。

- 判据：四槽组成与顺序不变、工具集合与参数 schema 不变；常驻面按 §7 重写，不要求逐字复刻旧文。
- 已落：`docs/core/requirements/PROMPT-SYSTEM.md` §9.1 第一句改为「normal 与 engineering 的最终装配保留既有语义：四槽组成与顺序不变、工具集合与参数 schema 不变；工具描述的常驻面按 §7 重写，不要求逐字复刻旧文。」，与 §7 同口径。
- 同一节第三句「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」不动：它说的是极简装配不改写完整档，与本批不冲突。

### 第 2 轮评审通过

设计评审第 2 轮判 pass（🔴 0 · 🟡 1 可选 · 🔵 1 新增），凭证已签发，designId `ffc91199`。第 1 轮 11 项全部落实。

两处新增项当场处置，均由设计席改 §2 完成，不碰设计档（凭证字节不受影响）：

- **N1（🟡 可选）**：§2 验收对照的 §9.1 第一句行与上抛项仍写「读法待主 agent 定」「§9.1 未同步」，而需求档已按第 35 号裁定同步为「保留既有语义……」。
- **N2（🔵）**：勘察里「余 51 份无主题」与「69 份 ∥ 28 份」对不平（实余 41）；另 `prompts/knowledge/tool-operations.md` 无同名档可派生，与设计 `PROMPT-SYSTEM` §3 的标识规则不合，需写明归属。

### 实施中裁决（`ssh` 的 `project` 键）

- **事实**：`thincoder-core/tools/ssh.mjs` 的 schema 只有 `ledger`，无 `project`（第 85 行 `ledger: { type: "string", description: LEDGER_PARAM_DESC + "；仅 \`get\` 要号，\`put\` 写的是远端主机，不要" }`）。写门按 action 判号，`get` 才要，写的是远端主机，没有本地项目根可言。
- **设计档漂移**：`docs/core/design/TOOLS.md` §1.2 与批档 §2 验收对照都写「十一个入口工具带 `ledger` ∥ `project` 两键」。实为十一把带 `ledger`、十把带 `project`。
- **裁定（甲）**：给 `ssh` 加 `project` 键与否决 —— 违反「参数 schema 只清纯冗余，不动键、类型、枚举、校验」这条批准边界，且该键对远端写入没有语义。改为**设计席改字**，按真实不变量断言：十一把带 `ledger`、带定位参数的十把带 `project`、两档 `input_schema` 逐字相等、`required` 逐字不变。
- **落法**：实施席按真实不变量写 `CLI 50-5`，§5 记这条设计档漂移；设计席下一轮修 §1.2 与验收对照那句。判据强度不降——`project` 少一把是事实，不是放宽。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（两处设计档已按落地面对平，注入锚归属补进设计 PROMPT-SYSTEM §2 ∥ §8 ∥ §9；本节机读清单与验收读法按 §5 的实际改动面校准）

<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

<§2 模板占位：机读清单 = 标题行「**受影响文件（机读清单）**」+ 围栏内三列表（表头 | 档 | 分拆方案 | 行数 |、分隔行 |---|---|---|、一行一档，只列代码档（源 ∥ 单测））；第二列：越设计时线的档写正向形方案（点名带目录段的档 + 本批落步 `实施轮` ∥ `§5`），未越线写 —；第三列：该档在批起快照上的内容行数（量法 = `countContentLines`），快照里没有这一档写 `新`；示例行 = | thincoder-core/agent-tools/batch-tier-gate.mjs | — | 新 |>

### 本批条目（覆盖）

| 台账 | 条目 | 覆盖面 |
|---|---|---|
| #2407 | 工具描述一句话化 | 每份 `tool-docs/<档名>.md` 常驻面只剩一句用途（随它留下的端侧运行期注入锚不算细则）；其余整段搬进 `prompts/knowledge/tool-<档名>.md`；每档一条处置记录 |
| #2407 | 写门参数说明提权 | `ledger` ∥ `project` 的说明从逐工具的参数副本收到两行身份句，完整口径只在工程纪律段讲一次；两键与 `required` 不动 |

边界（本批不做）：不按档裁工具集合；不改工具行为与参数语义；不改 schema 的参数、必填、枚举与校验。

### 设计档落点

- `docs/core/design/PROMPT-SYSTEM.md` §2（常驻面判据、动作细则归属、端侧运行期注入锚的归属、锚回填逐字与语义等价的分界）。
- `docs/core/design/PROMPT-SYSTEM.md` §7（按档装配的最终措辞）、§8（内容归属两行）、§9（验证项）。
- `docs/core/design/TOOLS.md` §1.1（端面行级剔除改到装配之后）、新增 §1.2（写门参数的说明面）、§8（三条验证）。

### 勘察与数据事实

库内 = 已查：
- `tool-docs` 全量 69 份（node 读目录枚举，逐份处置，不按名单抽样）：27 份已带 `{{knowledge:tool-<档名>}}` 锚并有同名主题，42 份既无主题也无锚
- 已有锚的 27 份不因有锚免判：25 份在锚前仍有多于一行非空正文（`batch.md` 39 ∥ `ssh.md` 30 ∥ `bash.md` 14，量法 = node 读档按行切，数锚字面前的全部非空行，含 `{{inject:…}}` 那一行）
- `prompts/knowledge/tool-*.md` 28 份（同一枚举）：27 份与 `tool-docs/<档名>.md` 同名配对，余 1 份 `tool-operations.md` 无同名档可派生——它不是任何工具描述的展开面，是 `thincoder-core/prompts/common.md` 的 `{{knowledge:tool-operations}}` 锚所内联的提示词主题（内容是跨工具的检索优先级、核验时机与工具路由），归属提示词母版，不在本批 69 份处置枚举内，本批不处置也不改名。设计 `PROMPT-SYSTEM.md` §3 的标识规则（「工具描述展开面的主题标识 = `tool-<工具描述档名>`」）只管由 `tool-docs` 派生的展开面，本档不由任何档派生，故不落在这条规则下。
- `thincoder-core/tools/shared.mjs` 的两条写门身份句常量与其导入面，八处：`memory-tool.mjs` ∥ `bash.mjs` ∥ `execute.mjs` ∥ `file.mjs` ∥ `ops.mjs` ∥ `patch.mjs` ∥ `ssh.mjs` ∥ `thincoder-vscode/src/tools/shell.mjs`
- `expandToolDescription` / `toOpenAISchema` 的装配链

同一次勘察还读了：
- `write-gate-ledger.mjs` 的 `LEDGER_ENTRY_TOOLS`（十一把入口工具）与拒文常量
- `test/rtm/tooling.md` 的 CLI 50 节（50-4 判据 ③ 现文与节注四态）
- `test/integration/tool-description-tiers.test.mjs`
- 需求 `TOOLS.md` §1 与 `PROMPT-SYSTEM.md` §7 ∥ §9.1

公开源档 = 已查：仓内 `doc_search`「工具描述常驻面 展开面 一句话 按档装配」→ 命中本仓两份设计档与需求档，无外部规范源。
- 仓外声明的两个公开仓逐档枚举文件名：`../.thincoder` 39 份 `.md`（文件名命中 3 份，均为 memory 记录，非规范档）、`../thincoder.com` 8 份 `.md`（命中 0）
- 相关 = 无外部先例可对齐

最近先例 = `docs/batches/2026-11-14-tool-docs-master-split.md`（#2406，已收口）：
- 其口径 = 「本批只搬不删，不裁撤任何句子」＋「完整档装配时展开，渲染与改造前逐字一致」
- 被复用的机制 = `expandToolDescription` 薄壳转交 `thincoder-core/prompt-files.mjs` 的 `expandKnowledgeTopics`
- 本批对齐前一条：内容只搬不删、锚文法与展开器一个字不动、参数 schema 不动
- 本批偏离后一条：完整档不再逐字等于拆前旧文。偏离只有一条理由 = 用户 2026-11-14 05:00 裁定「甲：只写这个工具干什么」；常驻面的文字因此被重写，细则段落整段进展开面，没有句子被删掉

新名三问：
- ① 展开面主题标识 —— existing: `thincoder-core/prompts/knowledge/tool-bash.md` 等 28 份现存主题 · name: "tool-<档名>"（档名里的 `_` 换 `-`；单源 = 设计 `PROMPT-SYSTEM.md` §3）· consumers: `expandKnowledgeTopics` ∥ `loadKnowledgeTopic` ∥ `knowledge get`。本批新增的展开面沿用同一标识形，新增份数由逐档处置结果决定（上界 = 现无主题的 42 份），不新造命名。
- ② `ledger` ∥ `project` 两行身份句 —— existing: `thincoder-core/tools/shared.mjs` 的 `LEDGER_PARAM_DESC` ∥ `PROJECT_PARAM_DESC`（键与参数名早已存在，改的只是说明文字）· name: "ledger" ∥ "project" · consumers: 上述八处导入档与十一把入口工具的 schema

数据事实：无。本批判据全在 code 与 docs 文本内，不依赖任何数据读数。

库外 = B 类：改动面 = tool-docs 母版、prompts 文本、schema 参数说明常量、VSC 装饰层、一份集成用例与其夹具；外部断言 = 零。

### 机制设计

**一、常驻面一句话化。** 每份 `thincoder-core/tool-docs/<档名>.md` 只留一句用途（这个工具干什么）。动作细则、分支、错误形、选择规则、示例、背景解释整段搬进 `thincoder-core/prompts/knowledge/tool-<档名>.md`，原位置换成 `{{knowledge:tool-<档名>}}` 独占一行的锚。锚文法与展开器一个字不动：`expandToolDescription` 仍转交 `prompt-files.mjs` 的 `expandKnowledgeTopics`。

端侧运行期注入锚（`{{inject:…}}`）随常驻面留下：它注的是执行器行、提问 UI 面这类运行期事实，不是这个工具干什么的细则；搬进展开面，极简档就丢一行，那是行为改动。

判据是内容：凡出现细则的档必拆；只剩一句用途的档整档留常驻面，并写下这条处置。每份描述都要有一条处置记录，不按名单抽样。

动作名搬走不构成能力回退：schema 的 `action` 枚举不随档位改写，极简档仍看得见一个工具能做什么。每个动作的调用期契约在展开面，一次 `knowledge get` 取回。

**二、端面行级剔除挪到装配之后。** `thincoder-vscode/src/agent/tool-table.mjs` 现状剔的是母版行 `- action:'panel'`；锚展开在 `toOpenAISchema` 里、在它之后，所以它看不到展开面的内容。

本批 `thincoder-core/tool-docs/subagent.md` 的该行按内容归属进展开面，剔除点必须同时改到拼装完成的描述上。不改则完整档把那行放回，VSC 描述带上端面没有的动作。

**三、写门参数说明提权。** 三个 schema 常量（`LEDGER_PARAM_DESC`、`LEDGER_PARAM_DESC_MEMORY`、`PROJECT_PARAM_DESC`；文本单点搬到 `thincoder-core/tools/write-gate-params.mjs`，`thincoder-core/tools/shared.mjs` 只转出同一常量）与 tool-docs 里的散文副本，合并成两行身份句：`ledger` = 本笔服务的在途行号，`project` = 带 `PROJECT-MANIFEST.json` 的项目根。

三处每工具差异留在参数行内，它们改的是「这一笔该传什么」：

- `memory` 只有落 project 层的写型 action 要号；
- `ssh` 只有 `get` 要号；
- `project` 是纯声明，不改执行目录。

收进共享说明就只能再长出一张每工具表，副本换个形状回来。

完整口径（哪一档生效、哪些工具必带、缺什么怎么被拒）只在 `thincoder-core/prompts/discipline-engineering.md` 新增的写门参数一节讲一次。

参数行不重述它：每个入口工具各带一份近乎逐字的副本，改一处口径要改每一处，漏一处就是两套规则在跑。

口径不进公共段：minimal 档不加载工程纪律、写门也不生效，公共段会为一条用不上的规则付常驻开销。反过来参数行必须自带身份，因为极简档里没有工程纪律段可看。

### 受影响文件（机读清单）

第三列 = 该档在批起快照 a8eba32 上的内容行数，量法 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs` 的定义），node 一次跑完，不混用非空行或编辑器行号。

**受影响文件（机读清单）**

| 档 | 分拆方案 | 行数 |
|---|---|---|
| thincoder-core/tools/shared.mjs | 越设计时线（500）⇒ 三条写门身份句常量 `LEDGER_PARAM_DESC` ∥ `LEDGER_PARAM_DESC_MEMORY` ∥ `PROJECT_PARAM_DESC` 连同其说明注释整块搬到 `thincoder-core/tools/write-gate-params.mjs`；`thincoder-core/tools/shared.mjs` 只留一行 `export … from "./write-gate-params.mjs"` 转出，八处导入档的导入面零改。落步 = 实施轮（§5），拆后读数记 §5 | 510 |
| thincoder-core/tools/write-gate-params.mjs | — | 新 |
| thincoder-vscode/src/agent/tool-table.mjs | — | 207 |
| test/integration/tool-description-tiers.test.mjs | — | 174 |
| test/integration/fixtures/anthropic-endpoint.mjs | — | 142 |
| docs/batches/2026-11-14-tool-desc-concise.test.mjs | — | 新 |

清单外的文本面（`.md`，不计量）：`tool-docs/*.md` 全量、`prompts/knowledge/tool-*.md`、`prompts/discipline-engineering.md`。

清单外的两条事实：

- 核验面读过、本批未改的代码档：`thincoder-core/tools/ssh.mjs`、`thincoder-core/memory/memory-tool.mjs`、`thincoder-core/agent-tools/batch.mjs`。三档的改动点由常量与 `tool-docs` 文本单点承担，再改它们就是第二份副本；不入清单，因为它们不在本批的改动面上。
- `test/integration/fixtures/anthropic-endpoint.mjs` 入清单的理由：该夹具按块解码 UTF-8，跨块的多字节字符被撕成 U+FFFD（大体量必现），`CLI 50-5` 断言两档 `input_schema` 逐字相等时读出的会是夹具噪声。改成合并 Buffer 后一次解码，那条判据才在测它要测的东西。

### 验收对照（对需求逐条）

判据一栏写的是可判的一句话；判者 = 谁来读；命令 ∥ 读法一栏写机器侧唯一入口或人读的判据；边界与错误侧写清这条判据不覆盖什么、什么情况判红。

| 需求句 | 判据 | 判者 | 命令 ∥ 读法 | 边界 ∥ 错误侧 |
|---|---|---|---|---|
| `PROMPT-SYSTEM.md` §7「常驻面只写用途一句话，示例、分支细则、选择规则与错误说明在展开面」 | 每份常驻面 = 一句用途 ＋（必要时）随它留下的端侧运行期注入锚 ＋ 独占一行的展开面锚，此外一条细则不留；有展开面的档，其主题在盘 | 评审席逐份读 `thincoder-core/tool-docs/`（枚举源 = 该目录全量 `.md`，69 份，不抽样） | 读法 = 逐份读目录比这四条；机器读数 = §5 记的那次单测运行（批档同名单测按测试纪律收口即删，不倒查盘上档） | 边界 = 判内容不判长度，长而只有一行的描述照样留着；注入锚是运行期事实，不算细则（设计 §2）；错误侧 = 该拆却整档留着 ∥ 常驻面留着细则 ⇒ 判红 |
| 需求 `TOOLS.md` §1「其中常驻面只写用途一句话，其余进展开面」 | 同上，另加一条：同一句话不与展开面正文重复（`tool-docs` 里没有一条细则被留在常驻面） | 同上 | 同上 | 边界 = 完整描述仍要覆盖需求 §1 那句「用途、参数、路由、副作用、错误和限制」——由常驻面 ＋ 展开面合计承担 |
| 设计 `PROMPT-SYSTEM.md` §9「每份工具描述都有处置记录（拆出展开面 ∥ 整档保留）」 | 枚举源每份都能判出处置类别（拆出 ∥ 整档保留），且条数 = 枚举源份数 | 评审席 + 父代理读 §5 | 读法 = 逐份读目录归类：带展开面锚 = 拆出，无锚且只剩一句用途 = 整档保留；§5 决策披露表记本次 69 份全判「拆」 | 错误侧 = 一份既无锚又留着细则 = 少一份处置，缺判 |
| `PROMPT-SYSTEM.md` §7「工具 schema（参数、必填、枚举、校验）不因档位改写」 | 十一把入口工具仍带 `ledger`，其中带本地定位参数的十把仍带 `project`（`ssh` 只带 `ledger`），`required` 逐字不变；极简档与完整档请求体的每份工具 `input_schema` 逐字相等（含 `action` 枚举取值） | 评审席 + 集成用例 `CLI 50-5` | `node --test test/integration/tool-description-tiers.test.mjs` | 边界 = 只改 `description` 文本，不碰键、类型、枚举、校验；错误侧 = 任一键消失 ∥ `required` 变 ∥ 枚举被裁 ⇒ 红 |
| `PROMPT-SYSTEM.md` §7「完整档装配后保留全部信息（语义等价，不要求逐字复刻旧文）」 | 完整档描述 = 常驻面 ＋ 展开面正文在锚处拼合，且展开面正文逐字等于 `prompts/knowledge/tool-<档名>.md` 全文；信息不缺项（动作、分支、错误形、选择规则都在展开面里） | 集成用例 `CLI 50-4` ③（逐份拼合由评审席读 `prompts/knowledge/tool-*.md` 与常驻面比对） | 同上 | 边界 = 判据是「锚处拼合 ＋ 展开面逐字回填」，不与批起快照的旧文比对（设计 §2）；错误侧 = 锚字面残留 ∥ 拼合缺段 ⇒ 红 |
| `PROMPT-SYSTEM.md` §7「极简档只发常驻面、展开面经 `knowledge` 主题取回」 | 极简档描述无锚字面、无展开面正文；`knowledge get tool-<档名>` 取回的正文逐字等于展开面原文 | 集成用例 `CLI 50-4` ①② | 同上 | 边界 = 尾空行不判（设计 §7）；错误侧 = 取回文本与主题文件不等 ⇒ 红 |
| 设计 `PROMPT-SYSTEM.md` §2「动作名搬走不构成能力回退」 | 极简档请求体里每个工具的 `action` 枚举与完整档逐字相等 ⇒ 极简档仍看得见一个工具能做什么 | 集成用例 `CLI 50-4` ⑥（本批新增的判据） | 同上 | 边界 = 判 schema 面，不判展开面取回；错误侧 = 枚举少于完整档 ⇒ 红（这条就是「能力回退」的判据） |
| `PROMPT-SYSTEM.md` §9.1「完整档工具描述和 consult/advisor 独立基底不被极简装配改写」 | 极简会话内 consult 的 `doc_check` 描述取完整档，同会话主链仍取极简档 | 集成用例 `CLI 50-4` ④ | 同上 | 边界 = 本批不动装配点，只动被装配的文本 |
| `PROMPT-SYSTEM.md` §9.1 第一句「normal 与 engineering 的最终装配保留既有语义：四槽组成与顺序不变、工具集合与参数 schema 不变；工具描述的常驻面按 §7 重写，不要求逐字复刻旧文」 | 两档请求体的槽组成与顺序仍是 persona ∥ common ∥ discipline ∥ subagent-base，工具集合与每份 `input_schema` 逐字不变；常驻面按 §7 重写即合规，不与批起快照旧文比对 | 集成用例 `CLI 50-4` ⑥ ＋ 评审席读 §5 的四项读数 | `node --test test/integration/tool-description-tiers.test.mjs` | 边界 = 该句口径由 §1「第 35 号上抛裁定」按语义等价读法定下；错误侧 = 槽位缺一个 ∥ 顺序变 ∥ 工具集合或 schema 缩水 ⇒ 红；常驻面文本变化本身不判红 |
| `PROMPT-SYSTEM.md` §7「体量分系统提示词、工具声明、自动注入、完整请求四项分别测量，不互相冒充」 | §5 报四个数（改动前后各一）：系统提示词（本批新增工程纪律段的写门参数一节会动这一项）、工具声明（两档分开）、自动注入、完整请求 | 父代理读 §5 的四个读数 | `node` 逐档读字符数，两档各量一次 | 边界 = 不以字符数冒充 token；错误侧 = 只报工具声明一项 = 缺项 |
| `PROMPT-SYSTEM.md` §4「不确定工具约定先查 knowledge」 | 极简档里每个动作的调用期契约都能经 `knowledge get` 取回（逐份遍历，不抽样） | 评审席逐份 `knowledge get` ＋ 集成用例 `CLI 50-4` ② | 同上 | 边界 = 只验可取回，不验模型是否去取 |
| `TOOLS.md` §1 通用契约「注册表可枚举，schema、描述、执行门和角色可见性一致」｜设计 `TOOLS.md` §1.2 写门参数面 | 两键说明只剩一行身份句；完整口径（哪一档生效 ∥ 哪些工具必带 ∥ 缺什么怎么被拒）在 `thincoder-core/prompts/discipline-engineering.md` 只出现一处 | 集成用例 `CLI 50-5` ＋ 评审席读该段 | 同上 | 错误侧 = 身份句又长出每工具副本 ∥ 口径出现两处 ⇒ 红 |

### 集成 delta（对 `test/RTM.md`）

- 改写 `CLI 50-4 极简档看不到展开面、get 取回同一份正文、完整档由常驻面与展开面拼成、极简会话里的 consult 取完整档`（`test/integration/tool-description-tiers.test.mjs`）。判据 ③ = 完整档 bash 描述 = 常驻面 ＋ 展开面正文在锚处拼合，且展开面正文逐字等于 `prompts/knowledge/tool-bash.md` 全文；①②④⑤ 保留；判据 ⑥ 新增 = 极简档与完整档请求体的每份工具 `input_schema` 逐字相等（含 `action` 枚举取值）。
- 新增 `CLI 50-5 写门参数面：两键仍在、说明只剩一行身份句、完整口径只在工程纪律段出现一处`，落 `test/integration/tool-description-tiers.test.mjs`（已入机读清单）。业务入口 = 真 CLI 工程会话经 `/eng` 落槽后发一轮本地脚本化模型请求，读回请求体工具面与 system 段；需求锚 = `PROMPT-SYSTEM.md` §7「工具 schema（参数、必填、枚举、校验）不因档位改写」＋ `TOOLS.md` §1 通用契约；判据 = 十一把入口工具仍带 `ledger`、其中带本地定位参数的十把仍带 `project`（`ssh` 只带 `ledger`），`required` 逐字不变；两键 `description` 只剩一行身份句、工程会话 system 段里写门口径只出现一处。
- `test/rtm/tooling.md` 的 CLI 50 节落点三处：① 表格在 `50-4` 行之后追加 `50-5` 行；② 节注「四态 = 50-1 正常 · 50-2 正常 · 50-3 边界 · 50-4 正常」改为五态并追加 `· 50-5 正常`；③ `50-4` 行的「怎么算通过」③ 按上一条改写，并补 ⑥。
- 不删除任何既有用例。编号由主 agent 先落 `test/RTM.md` 与 `test/rtm/tooling.md`，用例标题照该编号逐字写。

### 关键决策

- **常驻面按内容判，不按长度判**：一句话用途之外的任何细则都搬走。理由 = 用户裁定「甲：只写这个工具干什么」；按长度判会留下大段选择规则正好卡在阈值下。
- **动作细则归展开面**：靠 schema 的 `action` 枚举兜住「能做什么」，细则一次 `knowledge get` 取回。理由 = 需求 §7 已定常驻面只写用途，枚举不随档位改写，能力不丢。
- **端侧运行期注入锚留在常驻面**：`{{inject:…}}` 注的是执行器行、提问 UI 面这类运行期事实。理由 = 常驻面的判据是「细则不留」，注入锚不是这个工具干什么的细则；把它搬进展开面，极简档就丢掉那一行，那是行为改动，超出本批批准边界。这条已写进设计 `PROMPT-SYSTEM.md` §2 ∥ §8 ∥ §9。
- **写门口径的唯一处放工程纪律段，不放公共段**：写门只在工程模式生效；公共段三档都加载，为一条用不上的规则付 minimal 的常驻开销。
- **每工具差异留在参数行内**：收进共享说明就要再写一张每工具表，副本换个形状回来。
- **写门参数面按真实不变量断言**：十一把带 `ledger`，带本地定位参数的十把带 `project`，`ssh` 只带 `ledger`——它写的是远端主机，本机项目根对这笔写入没有语义。补上 `project` 会动参数 schema 的键集，超出批准边界（只清纯冗余）；判据强度不降，`CLI 50-5` 照这条断言。设计档 `docs/core/design/TOOLS.md` §1.2 ∥ §8 同笔改成这条不变量。
- **§1.1 的剔除表达式按现文改写**：`thincoder-vscode/src/agent/tool-table.mjs` 的该表达式已不存在，现为 `stripPanelActionLines`，经 `toOpenAISchema` 的 `descriptionPostProcess` 钩子作用在装配完的描述上；设计档 §1.1 原写整条 `description: tool.description.split(…)` 表达式，与盘上不符，改为点名符号。

### 上抛项

无。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §2 机读清单行 `thincoder-core/tools/shared.mjs | — | 472` ＋ 同段自述量法「内容行数 = 非空行，node 逐行扫」；`CODE-TIER` §7「代码和测试文件的内容行数只由 `countContentLines` 计算」「不得混用手数、编辑器行号或另一脚本作为同一门槛的判据」；`batch-tier-gate.mjs` 的 `countContentLines` 只按换行切分并弹掉一个末尾空段 ⇒ 该档 = 510（全文 511 行、38 行为空，472 恰是非空行数），已越设计时 500 线而分拆方案列为 `—` |
| 2 | 🔴 | 未处置 | §2 集成 delta「改写 `CLI 50-4`（`test/integration/tool-description-tiers.test.mjs`）」与「新增 `CLI 50-5`」——新用例无落档；机读清单六行（五源档 ＋ 批档同名单测档）无任何 `test/integration/**` 行；收口门拒文形 = 「§2 清单里没有这一档的行」 |
| 3 | 🟡 | 建议补 | §2「上抛项」以待裁口气引 `docs/core/requirements/TOOLS.md`（并以行号作锚）：该档 §1 通用契约同句已续「；其中常驻面只写用途一句话，其余进展开面（按档装配的口径见 `PROMPT-SYSTEM.md` §7）」，所称两种读法已不成立 |
| 4 | 🟡 | 建议补 | §2 无最近先例行；被复用机制 = `expandToolDescription` 薄壳转交 `expandKnowledgeTopics`，最近同主题批 = `2026-11-14-tool-docs-master-split`（其口径为「只搬不删」＋完整档逐字一致），本批重写常驻面是对该先例的实质偏离，缺口径未给对齐 ∥ 偏离理由 |
| 5 | 🟡 | 建议补 | §2「库外 = B 类：…外部断言 = 零。」只答外部断言有无，未记公开源档（含独立档仓）是否勘察、是否有相关项 |
| 6 | 🟡 | 建议补 | 新名三问缺：新增主题 id `tool-<档名>`（现存 28 份之外再增）与 `ledger` ∥ `project` 两行身份句，均无 `existing: …` ∥ `none found: …` ∥ `existing but unusable: …` 答案 |
| 7 | 🟡 | 建议补 | 集成 delta 只给「改写 `CLI 50-4`」「新增 `CLI 50-5`」：两条都无用例标题，`CLI 50-5` 无业务入口与需求锚，未写 `test/rtm/tooling.md` CLI 50 节的行位与节注态数落点 |
| 8 | 🟡 | 建议补 | §2「验收对照（对需求逐条）」全为「需求句 → 机制设计」映射，无判据、无判者、无命令，无边界与错误侧；「每份描述都要有一条处置记录」无枚举源（`tool-docs` 全量），设计 `PROMPT-SYSTEM` §9「每份工具描述都有处置记录（拆出展开面 ∥ 整档保留）」未进可判验收 |
| 9 | 🟡 | 建议补 | §2 验收对照把「体量四项分别测量」挂在 `§9.3`——该句实在 requirements `PROMPT-SYSTEM` §7「体量分系统提示词、工具声明、自动注入、完整请求四项分别测量，不互相冒充」；且只报工具声明一项，本批新增工程纪律段会改系统提示词项 |
| 10 | 🟡 | 建议补 | §2 引 requirements `PROMPT-SYSTEM` §9.1 只取「完整档工具描述不被极简装配改写」并结论「本批不碰」，跳过同节「normal 与 engineering 的最终装配内容和既有语义一致。」——本批重写常驻面即改完整档文本（§1「代价」自述「完整档同样变短，不是只改极简档」） |
| 11 | 🟡 | 建议补 | 设计 `PROMPT-SYSTEM` §2「动作名搬走不构成能力回退：schema 的 `action` 枚举不因档位改写，极简档仍看得见一个工具能做什么」是本批核心辩护，§2 验收无一条验证它 |

已实读核对、成立的（不进结论表）：设计档落点与现文一致（`PROMPT-SYSTEM` §2 一句用途判据、§7 按档装配、§8 两行归属、§9 验证；`TOOLS` §1.1 剔除点移到装配后、§1.2 写门参数面、§8 三条验证）；设计档不含受影响文件表 ∥ 施工账（F2-4 成立）；写门两键与 `required` 不动、口径只在工程纪律段讲一次、不进公共段，与 `PROMPT-SYSTEM` 设计 §4「minimal…不启用工程设计令牌或工程写门」同口径；`docs/core/requirements/PROMPT-SYSTEM.md` §7 已改为分档口径，与 §1 引文逐字一致。

VERDICT: changes-required
计数：🔴 2，🟡 9。

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 已修 | 机读清单 `thincoder-core/tools/shared.mjs` 行：第三列 510、第二列正向形方案点名 `thincoder-core/tools/write-gate-params.mjs` 与落步「实施轮（§5），拆后读数记 §5」；段首量法改为「量法 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs` 的定义），node 一次跑完，不混用非空行或编辑器行号」；新增档行 `thincoder-core/tools/write-gate-params.mjs` |
| 2 | 🔴 | 已修 | 机读清单新增行 `test/integration/tool-description-tiers.test.mjs`（174）；集成 delta「落 `test/integration/tool-description-tiers.test.mjs`（已入机读清单）」 |
| 3 | 🟡 | 已修 | §1「上抛项撤销」记 `docs/core/requirements/TOOLS.md` §1 现文已含常驻面一句；§2 上抛项只剩 §9.1 一条，且不再以行号作锚 |
| 4 | 🟡 | 已修 | §2「最近先例 = `docs/batches/2026-11-14-tool-docs-master-split.md`」给口径、被复用机制、对齐一条、偏离一条与唯一理由 |
| 5 | 🟡 | 已修 | §2「公开源档 = 已查」记 `doc_search` 与两个仓外仓逐档枚举，结论「相关 = 无外部先例可对齐」 |
| 6 | 🟡 | 已修 | §2「新名三问」① 主题标识（existing 28 份 · name · consumers）② 两行身份句（existing 常量 · name · consumers） |
| 7 | 🟡 | 已修 | 集成 delta 给两条用例标题、`CLI 50-5` 业务入口 ∥ 需求锚 ∥ 判据，`test/rtm/tooling.md` 三处落点与节注态数 |
| 8 | 🟡 | 已修 | §2 验收对照改为五列（判据 ∥ 判者 ∥ 命令 ∥ 边界 ∥ 错误侧），枚举源 = `thincoder-core/tool-docs/` 全量 69 份，设计 `PROMPT-SYSTEM` §9 处置记录项成行 |
| 9 | 🟡 | 已修 | 体量四项行改挂 `PROMPT-SYSTEM.md` §7，判据要求 §5 报四个读数 |
| 10 | 🟡 | 已修 | §9.1 两句分行引用（第三句一行、第一句一行） |
| 11 | 🟡 | 已修 | 新增行「设计 `PROMPT-SYSTEM.md` §2「动作名搬走不构成能力回退」」，判据 = 极简档与完整档 `action` 枚举逐字相等，判者 = `CLI 50-4` ⑥ |
| N1 | 🟡（可选） | 新增 | 验收对照 §9.1 第一句行仍写「见上抛项：本批改完整档可见文本，该句的读法待主 agent 定」与「读法落定前本条不判红，也不自判绿」；上抛项仍写「§1 已同步 §7，§9.1 未同步。」——需求档现文已是「normal 与 engineering 的最终装配保留既有语义：四槽组成与顺序不变、工具集合与参数 schema 不变；工具描述的常驻面按 §7 重写，不要求逐字复刻旧文。」，该上抛已由 §1「第 35 号上抛裁定」落定 |
| N2 | 🔵 | 新增 | §2 勘察「`tool-docs` 全量 69 份」与「`prompts/knowledge/tool-*.md` 28 份（同一枚举；余 51 份无主题，本批逐份处置）」：28 ＋ 51 ≠ 69（盘上 69 份 `tool-docs`、28 份 `tool-*` 主题，余应为 41）；且 `prompts/knowledge/tool-operations.md` 无同名档可派生，与设计 `PROMPT-SYSTEM` §3「主题标识 = `tool-<工具描述档名>`」不合，处置枚举须先对平 |

VERDICT: pass
计数：🔴 0，🟡 1（可选），🔵 1。

## §4 用户批准（主 agent）

**批准**：用户 2026-11-14 给出开工词「开工」，并在同轮就常驻面粒度选甲（只写一句用途）。用户 2026-11-14 04:5x 指示「后续自动跑」，本批实施、验证、收口按此链自动推进，不再逐步回问。

**本批边界（用户已定）**：描述常驻面只写一句用途；示例、分支细则、错误形、选择规则进展开面；`ledger` ∥ `project` 两键说明提到工程纪律段讲一次，参数本身留在 schema；参数 schema 只清纯冗余，不动键、类型、枚举、校验。改名为 `tiny` 与 256K 上限两项不进本批，另记台账 #2410 ∥ #2411。

**主 agent 的一处裁定（非用户原话）**：需求 `PROMPT-SYSTEM.md` §9.1 取「语义等价」读法——四槽组成与顺序不变、工具集合与参数 schema 不变，常驻面按 §7 重写不要求逐字复刻。理由：甲案下完整档文本必然变，若仍要求逐字一致则与本批前提互斥。

## §5 实施记录（eng-coder）

### 交付摘要

台账 #2407 两条条目一次落地：工具描述常驻面一句话化（69 份逐份处置，无抽样），写门两参说明提权为身份句、完整口径收进工程纪律段一处；另附设计 TOOLS §1.1 要求的端面 panel 行剔除点移到装配之后。工具集合、参数键、`required`、枚举与校验零改动。

### 决策披露表

| # | 判断 | 理由 |
|---|---|---|
| D1 | 69 份全判「拆」，无一份「整档保留」 | 判据是内容：每份在用途句之外仍带参数、路由、返回形或限制；其中 42 份连锚都没有（27 份原有锚） |
| D2 | 既有 27 份主题：搬来的细则插在主题顶部，原主题正文仍在其后 | 完整档阅读序与拆分前一致；锚文法与展开器一个字未动 |
| D3 | 写门两键的每工具散文副本按「合并」处置，不进展开面 | 设计 TOOLS §1.2：身份句入 `tools/write-gate-params.mjs`、完整口径入工程纪律段一处、三处每工具差异留参数行 |
| D4 | 新增 42 份展开面主题，标识形 `tool-<档名>`（`_` → `-`） | 设计 PROMPT-SYSTEM §3 已有标识规则，不新造命名 |
| D5 | 端面剔除改用 `toOpenAISchema` 的可选钩子 `descriptionPostProcess`（core `tools/shared.mjs` 落点、VSC 声明剔除函数） | 设计 TOOLS §1.1 要求剔除跑在装配之后；装饰期拿不到档位，`toOpenAISchema` 是唯一知道档位的点。该行按内容归属已进展开面，装配前剔它看不到那一行 |
| D6 | `ssh` 不带 `project` 键：写门判据按「十一把带 `ledger`、带本地定位参数的十把带 `project`」断言 | 父侧 2026-11-14 05:2x 裁决：加键违反「参数 schema 不动键」这条批准边界；`ssh` 写门只按 `get` 判，`project` 对远端写入无语义 |
| D7 | 修了 `test/integration/fixtures/anthropic-endpoint.mjs` 的逐块解码缺陷 | 该档 `raw += chunk` 逐块按 UTF-8 解码，跨块的多字节字符被撕成 U+FFFD（>90KB 体必现），50-5 断言两档 schema 逐字相等时读出来的差是夹具造成的假红。改为合并 Buffer 后一次解码，936KB 体仍逐字相等 |
| D8 | `tool-docs` 里两枚 `{{inject:…}}` 锚（`bash` ∥ `question`）留在常驻面 | 注入值是端侧运行期事实（执行器行、提问 UI 面）；搬进展开面会让极简档丢掉这一行，属未授权的行为改 |
| D9 | 机读清单两档未改：`thincoder-core/tools/ssh.mjs`（`ledger` 后缀走常量）∥ `thincoder-core/agent-tools/batch.mjs`（描述经 `DESC()` 取 `tool-docs/batch*.md`） | 两档的口径已由常量与文本档单点承担，再改它们就是第二份副本。另：spawn 文件表写的 `thincoder-core/tools/batch.mjs` 不存在，实档是 `agent-tools/batch.mjs`（§2 机读清单写的即实档） |

### 体量读数（设计 PROMPT-SYSTEM §7 四项分列，不互相冒充）

命令：`node --input-type=module -e "…"`（剧本：`assembleBuiltinTools` ＋ `assembleFamilyTools` 逐档 `toOpenAISchema` 后量 `len(JSON.stringify(schema))`；系统提示词与完整请求走假 Anthropic 端点抓请求体，cwd = 仓根；快照侧 = `git show a8eba32:thincoder-core/tool-docs/<档>`，按同一锚文法同法展开）

| 项 | 极简档 | normal | engineering |
|---|---|---|---|
| 系统提示词 | 20,352（本批未动 ⇒ 前后同值） | 112,028（同值） | 206,611 → 208,771（+2,160 = 写门参数一节） |
| 工具声明 | 141,265 → 71,955（−69,310，−49.0%） | 206,732 → 201,604（−5,128） | 205,288 → 200,155（−5,133） |
| 自动注入 | 7,767（本批未碰注入面） | 4,478（同值） | 6,107（同值，工程会话多一段注入） |
| 完整请求 | 169,839 → 100,529 | 324,507 → 319,379 | 424,584 → 417,291 |

完整档那 −5,128 不是丢内容：差的是两键散文副本（十一把 × 近逐字副本）与 `PROJECT_PARAM_DESC` 收短，见设计 PROMPT-SYSTEM §7「schema 不因档位改写」与 TOOLS §1.2。

### 常驻面 ∥ 展开面读数

命令：`node -e`（逐档 `readFileSync(...).length` 求和；快照侧 `git show a8eba32:…`）

- 常驻面 `thincoder-core/tool-docs/*.md`（69 份合计字符）：90,555 → 7,388（−91.8%）
- 展开面 `thincoder-core/prompts/knowledge/tool-*.md`：27 份 85,758 → 70 份 164,900（本批新建 42 份；余 1 份 `tool-operations` 是 `prompts/common.md` 的提示词主题，不属本批 69 份处置枚举，未动）
- 工程纪律段 `thincoder-core/prompts/discipline-engineering.md`：63,471 → 65,632（+2,161）
- 项目自带尺子 `node scripts/tool-schema-size.mjs`：55 具 75,188 字符 = 基线 103,529 的 72.6%

### 设计时线（拆后行数）

命令：`countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs` 的定义）

- `thincoder-core/tools/shared.mjs` 510 → 497（≤ 500，本批拆出即达标）
- 新建 `thincoder-core/tools/write-gate-params.mjs` 31

### 验证读数

| 命令 | 结果 |
|---|---|
| `node --test docs/batches/2026-11-14-tool-desc-concise.test.mjs` | 6 用例全绿（常驻面一句话逐份 ∥ 锚独占一行 ∥ 展开面可召回与逐字拼合 ∥ 处置记录 69 条 ∥ 写门身份句与口径一处 ∥ mode 必填 ∥ 装配后剔除） |
| `node --test test/integration/tool-description-tiers.test.mjs` | 2 用例全绿（`CLI 50-4` ①②③④⑤⑥、`CLI 50-5`） |
| `node --test test/integration/minimal-mode.test.mjs` | 3 用例全绿（`CLI 50-1` ∥ `50-2` ∥ `50-3` 零回归） |
| `node --test test/integration/review-doc-scope.test.mjs` | 5 用例全绿 |
| `doc_check(mode:"gate")` | `DOC-CHECK GATE: PASS`（本轮写的全部 `.md`） |

### 落地核对（设计档漂移，交设计席）

- `docs/core/design/TOOLS.md` §1.2 首段「写门挂在十一个入口工具上（`write` / `edit` / `insert_after` / `apply_patch` / `delete` / `hashline_edit` / `file_ops` / `bash` / `execute` / `memory` / `ssh`），它们的 schema 各带 `ledger` ∥ `project` 两个键，`required` 不因档位或工具变化。」——实为十一把带 `ledger`、十把带 `project`（`ssh` 只带 `ledger`，写门按 action 判 `get`）。批次 §2 验收对照同句同源，故 50-5 按真实不变量判。
- `docs/core/design/TOOLS.md` §1.1「`thincoder-vscode/src/agent/tool-table.mjs` 的 `description: tool.description.split("\n").filter((l) => !l.startsWith("- action:'panel'")).join("\n")` 剔的是 `toOpenAISchema` 装配完的那份描述。」——该表达式已不存在：同一档案里成为 `stripPanelActionLines`，经 `toOpenAISchema` 的 `descriptionPostProcess` 钩子作用在装配完的描述上（行为与该句一致，字面不同）。

### 台账

本批无新债。一处设计档漂移转设计席（见上），一条范围内观察转 Leads：`scripts/prompt-refs-check.mjs` 报 12 处既有悬空引用（`persona-engineering.md` ∥ `batch-supersede.mjs` ∥ `batch-tier-gate.mjs` ∥ `subagent-design-token.mjs` ∥ `ledger-close-proof.mjs`），均在本次改动面之外。

### 审计 / 评审轮次与终态

- 内部发散审计（explore audit）：0 轮。
- 内部 code review（advisor）：0 轮。
- 自修轮次：3（批量作业中断续跑不计数；实际修复 = `String.replace` 的 `$` 展开假拼合、夹具逐块解码、`tool-knowledge.md` 段落超 300 字）。
- 终态：`clean`（自评）。父侧 2026-11-14 05:32 指示收尾、不再开评审轮，独立评审由父侧收口时定。

## §6 验证与收口（父代理）

### 验证（父侧本轮实跑）

| 面 | 命令 | 结果 |
|---|---|---|
| 批内单测 | `node --test docs/batches/2026-11-14-tool-desc-concise.test.mjs` | 6 pass / 0 fail |
| 本批集成 + 回归 | `node --test test/integration/tool-description-tiers.test.mjs test/integration/minimal-mode.test.mjs` | 11 pass / 0 fail |
| 全量集成 | `node --test test/integration/*.test.mjs` | 214 例 / 212 绿 / 2 红 |
| 文档门 | `doc_check(mode:"gate")` | PASS |

两红均非本批回归。

- `CLI 43-1`：`docs/core/design/DOC-GRAPH.md` 重写遗留，既有（台账 #2404）。
- `CLI 34-1`：`browser-shared-pool.test.mjs` 期望 `[close] shared browser closed (last user)`，实得 `[close] released the shared browser (last user) — the browser is still running…`；本批未碰 `browser/` 下任何档。

### 档位与体量读数

`countContentLines` 口径：`thincoder-core/tools/shared.mjs` 497（≤ 500）· 新建 `write-gate-params.mjs` 31 · `prompts/discipline-engineering.md` 491 · `vscode/src/agent/tool-table.mjs` 216。无越线档。

体量（compact `JSON.stringify`，25 个内置工具）：极简档 63,170 → **32,774**（−48.1%）；完整档 91,003 → **84,963**（−6.6%，差的是两键散文副本，不是内容）。常驻面 `tool-docs/*.md` 合计 90,555 → **7,388** 字符（−91.8%）；展开面 70 份 `prompts/knowledge/tool-*.md` 合计 164,901 字符。

**尺的说明**：§5 记的 141,265 → 71,955 用的是 pretty-print JSON（含缩进），比例一致（−49.0% vs −48.1%）、绝对值不同尺。本节与历史读数统一用 compact 形态，复跑命令 = 对 `builtinTools` 逐档 `toOpenAISchema(tool, mode)` 后 `JSON.stringify` 取长。

### 落地核对

- 常驻面一句用途：69 份 `tool-docs` 各 2–3 个非空行（一句 ＋ 锚），无一份例外；69 份各恰 1 个 `{{knowledge:tool-*}}` 锚，异常 0。
- 完整档内容保全：`CLI 50-4` ③ 守「锚处逐字拼合」，两档 `input_schema` 逐字相等由 ⑥ 守。
- 写门两键：`write-gate-params.mjs` 里 `LEDGER_PARAM_DESC` 一行、`PROJECT_PARAM_DESC` 一句；完整口径只在 `prompts/discipline-engineering.md` 的「Write-gate parameters」一节出现一次。
- 设计档漂移已改：`docs/core/design/TOOLS.md` 原写「十一把各带 `ledger` ∥ `project` 两键」，落地实为十一把带 `ledger`、十把带 `project`（`ssh` 无 `project`）。设计席本轮改为「十一把的 schema 都带 `ledger`，其中带本地定位参数的十把另带 `project`」，验证条同步。

### 台账与债务

本批覆盖行 `#2407` 随本笔结算。**本批无新债。**

### Leads（范围外，未记账）

- `CLI 34-1`：`test/integration/browser-shared-pool.test.mjs` 的关闭回执期望与浏览器工具实际报文不符，复现 = `node --test test/integration/browser-shared-pool.test.mjs`。
- `scripts/prompt-refs-check.mjs` 报 12 处既有悬空引用（`persona-engineering.md`、`batch-tier-gate.mjs` 等），均在本批改动面之外。
