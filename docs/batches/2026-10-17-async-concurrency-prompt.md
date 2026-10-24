# 2026-10-17 · async-concurrency-prompt
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-17 · 来源 = 用户 2026-10-17 23:43「我们的提示词里是不是没有告诉模型 thincoder 支持异步并发？如果模型不清楚的话，就会把任务捏在手里排队，而且还会使用 wait_for 阻塞会话」；父侧实读取证：`common.md:113` 工具表把 `wait_for` 归「等待」且无禁令，全档 grep 无「不要用 wait_for 等子代理」句。
> 台账 = #1629（core · 归批）。前情 = docs/batches/2026-10-17-prompt-firing-rights.md §2（同轮 · 并行）。
## §1 讨论（主 agent）
**状态行**：已收口（CN 三档四落点 + EN 同形四落点均已落；父侧亲跑 assemblePrompt 两场景 warnings=[] 且新句在位；新文本禁词 0；评审 pass；PROMPT-SYSTEM 三件登记已补）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 2.1 本批条目（覆盖 · #1629）

| # | 落点 | 交付物 |
|---|---|---|
| 1 | `common.md`「工具路由」节内（改前 `:114` 之后 = `wait_for` 段后的空行） | `wait_for` 的使用判断：它等的是没有送达通道的状态；子代理报告相反（自己到达，等到的只是「结束了」信号）且它是阻塞调用 |
| 2 | `common.md`「工具观 · `### 并行调用原则`」（改前 `:103` 之后） | 引擎认知两句：顶层 spawn 立即返回 / 报告空闲自动到达 / 调度器按文件与 `dependsOn` 排序；派出后的两种走法 |
| 3 | `discipline-engineering.md:206` 整行替换（号 = 改前 = 现盘） | 旁注扩为可执行一句：并发是常态，攥在手里逐枚等只会把并行排成串行 |
| 4 | `persona-engineering.md`「`## 并行委派与多任务`」改前 `:213` 之后新 bullet（落笔时点 `:214`） | 父侧等待姿势：结束回合等报告；进度 status/observe；阻塞等只是占住会话 |
| 5 | `docs/core/design/PROMPT-SYSTEM.md`（机制登记面——评审 #1 裁决入批） | 三件登记（**零 `##` 块计数连带 ∥ 零标题节点连带**）：① §6 末紧凑机制块（无独立 `§6.N` 编号——沿 §6.1 紧凑登记形）② §7 D-PS41 ③ §6.1 落点登记一句 |

坐标口径：2.1 / 2.3 的「改前」号 = 本批落笔前；落笔后（本批时点）= ① 新句 `:104-105` ∥ ② 新句 `:118-119` ∥ ③ 仍 `:206` ∥ ④ `:214`。行号随时点漂移（同批在飞其它批共用同几档，其后追加行即上浮）——**定位以句为准**。

**明确不在本批**：`discipline-normal.md`（`:218-222` 已载 async 默认 / 自动到达 / 无需轮询——见 2.8 ①）；`thincoder-core/prompts/**`（英文 = 代码，实施轮 coder 落）；`common.md:73`「禁空转等待、禁轮询」（射程 = 在途提问的答复等待，语义正确且自足，本批零动）。

### 2.2 先例对齐与勘察证据行

**先例**：落点形态 = **既有节内增列 / 既有条就地改写**（`PROMPT-SYSTEM.md:155` 默认口径；同族 = 联网查证 / 上下文自掌舵落 `## 工具观` 节内，`:169-170`）；`persona-engineering.md:212`「提交即走」= 同节操作面前例，本批只补认知面与反向句；`discipline-engineering.md:206` = 既有旁注就地扩写（先例 = `PROMPT-SYSTEM.md:164`「既有条就地改写」）。**偏离**：不新增 `##` / `###` 节点（本批主题已有承载节，新增节点只增计数连带）。

**落笔时机（评审 #7）**：本批取「CN 正本 = 设计轮直落」（`PROMPT-SYSTEM.md:152` 默认）；不取 §6.25 的「双稿同轮落笔」（`PROMPT-SYSTEM.md:624`——两档都压到实施轮、先以设计围栏块送审）。选前者的依据 = 本批 CN 改动**零新增节 / 零标题节点 / 零 `##` 计数连带**（2.4 读数）⇒ 直落不改变送审对象（落地档与围栏块逐字同一份）；§6.25 的双稿同轮是为「CN 与 EN 必须同轮落笔」的批而设，本批 EN = 实施轮独立落（M9），不同轮，无同轮约束。

**勘察证据行**：已查 `docs/README.md`（文档地图——提示词正本 = `docs/core/design/prompts/`）· `PROMPT-SYSTEM.md`（§6.1 落点形态 ∥ §6.25 `:624` 落笔先例 ∥ §7 D-PS 表 ∥ §8.2 计数面）· `docs/core/design/prompts/` 全档 grep `wait_for`（全档唯一命中 = `common.md:113`）· `discipline-normal.md:210` ∥ `:218-222` ∥ `:250`（普通侧已有 async / 自动到达 / 无需轮询句）· `AGENT-LOOP-ASYNC-POOL.md:133`（`wait_for` 条件语义单源）· 英文面三档对应锚（`common.md:132-133` ∥ `:161` · `persona-engineering.md:202/206` · `discipline-engineering.md:197`）。仓外公开源：**无相关**（本仓文档即正本；引擎语义单源 = 仓内 `AGENT-LOOP-ASYNC-POOL.md`）。

### 2.3 机制设计（逐字文本 = 设计围栏块）

写法总则（用户 2026-10-17 23:46 原话：「我不喜欢用什么铁律/禁止/不许之类的办法，我更相信『知其然知其所以然』。」）：**事实 + 后果**，不用禁令句式；每句自带 why，读者能自己推出该不该用。

**① `common.md` — `### 并行调用原则`（`:102-103`），`:103` 之后追加 2 行**

改前（逐字，`:102-103`）：
```
### 并行调用原则
独立的读类工具调用合并到一条回复批量发出（并发执行）—— 串行逐个调用浪费回合。
```
改后（节内追加两行）：
```
**本引擎全异步高并发**：顶层 spawn 立即返回，报告在会话空闲时自动到达；文件冲突与 `dependsOn` 依赖由调度器自动排队排序。
所以派出子代理后只有两种走法：下一步要用它的报告 ⇒ 结束回合让它到达；不用 ⇒ 立刻接着做别的。把多枚 spawn 攒在手里等完一枚再派下一枚，只会比调度器已经排好的顺序更慢——中途反复查进度也一样，报告自己会到。
```

**② `common.md` — `## 工具路由` 节内，`:114` 之后追加 2 行（`wait_for` 所在条附近；号 = 改前）**

改前（逐字，`:113-114`）：
```
进程 / 时钟 / 等待用 `process` / `get_current_time` / `wait_for`（别用 `tasklist`/`ps`、`date`、`sleep` 凑）、思考预算用 `timer`（非阻塞——到期注入系统提醒，别用 `sleep` 式等待凑）、收尾门用 `verify`（你声明 verification.status，它机械把关——不替你跑检查，也别指望它跑测试）。
**原则：有专用工具就不 hand-roll bash**（`cat`→`read`、`echo >`→`write`、`sed -i`→`edit`、`grep -rn`→`grep`、`node -e`→`execute`）。
```
改后（号 = 改前：`:114` 之后追加两行；`:113-114` 原样不动；落笔后新句 = `:118-119`〔本批时点〕）：
```
**`wait_for` 用来等那些不会主动告诉你的状态**：端口打开、文件出现——这类事不会自己把消息送进你的会话，不查就不知道，阻塞着等它才划算。
异步子代理的报告相反：会话空闲时它自己到达；`wait_for` 等到的只是「它结束了」这个信号，报告内容仍要等送达。而 `wait_for` 是**阻塞**调用——拿它等报告，整个会话挂在原地，期间你什么都做不了。
```

**③ `discipline-engineering.md:206` — 整行替换**

改前（逐字）：
```
（并行委派的 token 隔离 / 调度元数据 / 提交即走 = 主 agent 角色行为。）
```
改后：
```
（并行委派的 token 隔离 / 调度元数据 / 提交即走 = 主 agent 角色行为。）**并发是常态**：顶层 spawn 立即返回、报告在会话空闲时自己到达——攥在手里逐枚等只会把并行的活排成串行；文件冲突与依赖，调度器已经替你排好。
```

**④ `persona-engineering.md` — `## 并行委派与多任务` 节，`:213` 之后新 bullet（`:214` 之前）**

改前锚（逐字，`:213` 末 ∥ `:214` 首）：
```
…超过 4 个，记账成本与串扰风险超过提速收益。
- **用户交互一次一个**（澄清、批准）——但用户回答后，你可以在一个回复里发多个评审/批准跟进。
```
插入：
```
- **父侧的等待姿势**：报告在会话空闲时自己到达——等它的动作就是结束回合；进度用 status/observe 非阻塞地瞄。用阻塞调用（`wait_for`）去等，换来的只是被占住的会话，报告该到的时候还是会到。
```

### 2.4 受影响文件与测试覆盖

| 档 | 改前（行，推算 = 改后 − 增量） | 增量 | 改后（实测） |
|---|---|---|---|
| `docs/core/design/prompts/common.md` | 218 | +4（两处各 2 行） | **222** |
| `docs/core/design/prompts/persona-engineering.md` | 228 | +1 | **229** |
| `docs/core/design/prompts/discipline-engineering.md` | 206 | ±0（整行替换） | **206** |
| `docs/core/design/PROMPT-SYSTEM.md`（登记面 · 评审 #1 入批） | 912 | +24（§6.1 一句 1 行 ∥ §6 末紧凑块 22 行〔含前导空行；块体 `:792-812`〕∥ §7 D-PS41 1 行） | **936** |
| `thincoder-core/prompts/common.md`（实施轮 · EN） | 265 | +4 左右（译文行数可 ±） | — |
| `thincoder-core/prompts/persona-engineering.md`（实施轮 · EN） | 221 | +1 | — |
| `thincoder-core/prompts/discipline-engineering.md`（实施轮 · EN） | 198 | ±0 | — |

**计数口径**：行 = **末行非空行号**（`read` 显示的末行号；文末换行符 / 空行不计）——三档同口径。改后列 = 本轮现盘实测（common **222** ∥ persona **229** ∥ discipline **206**——与父侧现盘实读逐档同值）；改前列 = 改后 − 增量（原生读数本轮未重测，标「推算」）。读数时点 = 本批 CN 落笔后（与父侧现盘实读同刻）。同批在飞其它批共用同几档——其后现盘行数会随其落地而变动（增量归各自批次），本表只记本批落笔时点读数；定位以**句**为准。

**测试覆盖**：本批 = 提示词文本（`.md` 结构尺度，无源码 / 测试档），无单测；验证 = 结构读数（`##` 计数 ∥ 行宽 ∥ 回读）+ 收尾一次性比对（落地档 ↔ 本档围栏块，逐行）。EN 面按 M9 精确翻译（非 cp），四轴对拍随实施轮。

**落地状态**：CN 三档 = 本设计轮直落（已落；回读读数 = 上表改后列 **222** ∥ **229** ∥ **206**；`##` 计数 **19 ∥ 17 ∥ 10** 改前 = 改后，`###` 5 ∥ 0 ∥ 7 同——本轮逐档实测）；`PROMPT-SYSTEM.md` 登记三件 = 本轮已落（§6.1 `:172` ∥ 紧凑块 `:792-812` ∥ D-PS41 `:858`；`##` **9** 改前 = 改后——标题零新增）；EN 三档 = 实施轮。

### 2.5 验收对照

| AC（任务书） | 落点 | 判据 |
|---|---|---|
| ① 四条改动各「file:line + 改前/改后原文」 | 2.3 ①–④ + 实施回读 | 原文在本档；改后逐处回读（D6） |
| ② 三档 `##` 数改前 = 改后 | common **19** ∥ persona **17** ∥ discipline **10** | 改后逐档 grep 同值（本批零新增标题节点） |
| ③ 自证：`wait_for` 相关句能回答「能不能用它等子代理」 | 2.3 ②；单源 = `AGENT-LOOP-ASYNC-POOL.md:133`（`wait_for` 条件语义——settle 信号） | 读句可得：等报告无收益（阻塞 + 报告本来会到 + 只拿到 settle 信号）；它的用场 = 无送达通道的状态——实施轮可按单源现场核 |
| ④ 行宽 ≤300 | 新增 5 行 + 1 行整行替换（共 6 行新文本） | 实测最长 122 字符（逐行读数） |
| ⑤ 交付表 | 实施报告 | 五行 |
| ⑥（父侧改派 23:46）无禁令句、每句携 why | 2.3 全部 | 新句不含「不许 / 禁止 / 不要用」祈使；每条断言带因果 |
| ⑦（评审 #1 入批）`PROMPT-SYSTEM.md` 三件登记齐 | 2.1 行 5 · `PROMPT-SYSTEM.md` §6.1 `:172` ∥ 紧凑块 `:792-812` ∥ D-PS41 `:858` | 逐处回读在位；三处均载「零 `##` 块计数连带 ∥ 零标题节点连带」；该档 `##` 数改前 = 改后（9 → 9） |

### 2.6 英文待同步行清单（供 eng-coder）

| # | 档 | 锚（现盘） | 动作 |
|---|---|---|---|
| 1 | `thincoder-core/prompts/common.md` | `### 并行调用原则` `:132-133`（`:133` 之后） | 译 2.3 ① 两行 |
| 2 | `thincoder-core/prompts/common.md` | 工具表 `:141-168` 之后、`**Destructive-command red lines**`（`:170`）之前 | 译 2.3 ② 两行（EN 为表形：段落落表后，不入表） |
| 3 | `thincoder-core/prompts/discipline-engineering.md` | `:197` | 整行替换为 2.3 ③ 译文 |
| 4 | `thincoder-core/prompts/persona-engineering.md` | `## Parallel dispatch & multi-task` 节内，`:206` bullet 之后、`:207` 前 | 译 2.3 ④ 一行 |

**译法锚**：顶层 spawn = top-level spawn · 立即返回 = returns immediately · 会话空闲时自动到达 = arrives on its own when the session is idle · 调度器 = scheduler · 阻塞调用 = blocking call · 没有送达通道的状态 = states with no delivery channel · 占住的会话 = a session parked in place。

### 2.7 关键决策（含被否方案）

1. **写法 = 因果句，不用禁令**（用户 23:46 原话，覆盖原任务书「禁令句」口径）。被否：禁令句（无 why，换场面即失效）· 工具手册式罗列 `wait_for` 参数（工具描述面单源，D2）。
2. **引擎认知落 `### 并行调用原则`**（common.md 唯一并行相关节；既有节内增列 = 零 `##` 计数连带）。被否：新增 `##` 节（公共层节表锁定 + 计数连带，先例 `PROMPT-SYSTEM.md:155`）∥ 新增 `###` 子节（主题已有承载节，新增节点只增连带）。
3. **认知面 ∥ 操作面分工**：common 讲「引擎有并发 + 派出后的走法」；`persona-engineering.md:212` 保留「提交即走 + 池上限」操作面——措辞不重复，不改 `:212` 原句。
4. **persona 补反向一条 = 同节新 bullet**（`:213` 后），不复述 `:212` 原句。
5. **discipline 旁注就地扩写**（整行替换，±0 行）——沿「既有条就地改写」先例。
6. **`wait_for` 的用场只列「端口打开、文件出现」**，未列「后台任务结束」——理由见 2.8 ④（与工具实况不符）。
7. **同一事实在三层各点一次 = 关键锚点重复（保留重复、补理由——评审 #3 处置，正文重复句不改）**：① common 全场景（公共层恒第二位——两模式 + 全部子代理共读）∥ ③ 工程纪律层（该模式下怎么干活——纪律层读者不重读公共层也须自足）∥ ④ 角色等待姿势（父侧写权独属行为——在派单现场取用）。依据 = 锚点重复先例（D-PS7「本地只加出口边界句 + 最短动作锚」，承编写纪律「关键锚点重复」）+ 各层需能独立阅读（删任一层，该层读者即缺句）。

### 2.8 发现（逐条上报）

① **任务书已知事实⑤部分不成立**：普通模式已载并发常识——`discipline-normal.md:218-222`「顶层子代理 spawn 默认 async…结果自动到达，无需轮询…status 非阻塞瞄进度」∥ `:210`「async 默认——若下一步依赖报告，结束回合让它到达」∥ `:250`（escalate 同形）。真缺口 = ①「全异步高并发」的引擎认知（原只在 `persona-engineering.md:212` 操作面隐含）② `wait_for` 的使用判断（全档仅 `common.md:113` 提名字，零说明）。**需求不变**（用户问题成立：工程角色 + 子代理读不到）；设计据此把 common 句限定为「认知 + 判断」，不重复普通侧操作细节。

② **`PROMPT-SYSTEM.md` 未登记 ⇒ 已收（评审 #1 ⇒ 父侧裁入批）**：提示词批惯例 = §6 机制块 + §7 D-PS 行 + §6.1 落点登记。本批已补三件（§6 末紧凑机制块 ∥ §7 D-PS41 ∥ §6.1 一句——见 2.1 行 5 / 2.4 该档行）；设计理由不再只住批次档（批次档可删而理由仍在）。

③ **同文件串行**：`persona-engineering.md` 同批在飞 #1624（`:5-13` / `:52-53`）。本批落点 `:214` 与其**不重叠、语义无冲突**；两批实现同文件 ⇒ 需串行（`files` 重叠由调度器排队）。不构成停手条件。

④ **父侧口径收窄（后台任务结束）**：`bash` 工具说明——后台任务「the result arrives as a digest when the process exits」⇒ 拿 `wait_for` 等 bash 任务同样只是占住会话（结果会自己送达）。故落文本只列**无送达通道**的状态（端口 / 文件）；「后台任务结束」不收。

⑤ **工具面 nuance（知会）**：`wait_for` 工具说明把「an async subagent/consult still settling」列为适用面；本批句不否定该能力，只讲代价（阻塞会话；只拿到 settle 信号，报告仍走送达）。工具描述面 = 主 agent 内容权，若后续要统一口径另笔议。

### 2.9 修正轮（设计评审 §3 · 评审 #1–#7 · 父侧全收）

| 号 | 处置 | 落点 |
|---|---|---|
| 1 | `PROMPT-SYSTEM.md` 三件登记已落（§6.1 一句 ∥ §6 末紧凑机制块 ∥ §7 D-PS41，均记「零 `##` 块计数连带 ∥ 零标题节点连带」） | `PROMPT-SYSTEM.md:172` ∥ `:792-812` ∥ `:858` |
| 2 | AC ① 三条 → **四条**（与 2.3 ①–④ 对齐） | 本档 §2.5 |
| 3 | 重复保留 + 补理由（关键锚点重复 D-PS7 + 各层可独立阅读）；正文重复句零改 | 本档 §2.7 项 7 |
| 4 | 2.4 改后列重测 + 表头注计数口径（末行非空行号：**222 ∥ 229 ∥ 206**） | 本档 §2.4 |
| 5 | 坐标标清「号 = 改前 / 现盘」（2.1 落点列 + 2.3 ②） | 本档 §2.1 / §2.3 ② |
| 6 | AC ③ 判据列补单源坐标 `AGENT-LOOP-ASYNC-POOL.md:133` | 本档 §2.5 |
| 7 | 2.2 补落笔时机对照（`:152` 默认 vs §6.25 `:624` 双稿同轮）+ 选边理由 | 本档 §2.2 |

读数（本轮实测）：`PROMPT-SYSTEM.md` `##` **9 → 9**（零新增节，标题零新增）；末行 **936**；三档 CN 末行 **222 ∥ 229 ∥ 206**（本批落笔后；`##` 19 ∥ 17 ∥ 10、`###` 5 ∥ 0 ∥ 7 同；他批随后追加行不归本批——见 §2.4 注）。三档 CN 提示词正文零改（#3 裁保留）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership / Methodology | 🟡 | 本批改了提示词三档，但拥有「提示词机制登记面」的 `PROMPT-SYSTEM.md` 没有对应 §6.N 机制块 + §7 D-PS 行 + §6.1 落点登记（`docs/batches/2026-10-17-async-concurrency-prompt.md:132` 自陈「**`PROMPT-SYSTEM.md` 未登记**」）；该档 §6.1（`:155` 起）逐条登记着每一笔提示词改动，缺登记则本批的落点选择理由只住批次档 —— 而 `docs/core/design/prompts/common.md:188` 明确「若删光所有批次档会丢东西，那东西就住错了档」。 | 在本批内补登三件（§6.N 机制块 ∥ §7 D-PS 行 ∥ §6.1 落点条目，记「零 `##` 块计数连带 / 零标题节点连带」）；若本批射程确实不含该档，则改为带 `trigger` 的台账条入账，使其留在可见待办面而非停留于本批 §2.8 散文。 |
| 2 | Acceptance criteria | 🟡 | `docs/batches/2026-10-17-async-concurrency-prompt.md:101` 写「① 三条改动各「file:line + 改前/改后原文」… 2.3 ①–④」，而 2.3 载的是四笔改动（`:33` ∥ `:46` ∥ `:59` ∥ `:70`）——AC 的计数与列表不同改，违反 D3（`docs/core/design/prompts/discipline-engineering.md:190`）；按字面「三条」，改动 ④ 可合法地逃出回读核对。 | 把 AC ① 的条数改为与 2.3 的四个落点一致（或明确「四条」含 persona 那笔），使回读核对逐笔可核。 |
| 3 | Scope / Duplication | 🟡 | 同一组事实在三档里各写一遍，且三档回贴同一上下文：① 新句「**本引擎全异步高并发**：顶层 spawn 立即返回，报告在会话空闲时自动到达…文件冲突与 `dependsOn` 依赖由调度器自动排队排序」（`:42`）∥ ③ 新句「**并发是常态**：顶层 spawn 立即返回、报告在会话空闲时自己到达…文件冲突与依赖，调度器已经替你排好」（`:67`）∥ ④ 新 bullet「**父侧的等待姿势**：报告在会话空闲时自己到达」（`:79`）。因 common 恒第二位全场景装配（`PROMPT-SYSTEM.md:178`），工程主会话与子代理读一遍 common 即已收到全部事实，③④ 的这两半是纯重述；而设计 2.7 只论证了 common ↔ `persona-engineering.md:212` 不重复，未给 ③④ 的重述任何理由 —— 与自有纪律相抵（`common.md:154`「**单一权威源——一个机制只在一处详述，他处引用；重复叙述即缺陷。**」· `discipline-engineering.md:189`）。 | 二选一写进 2.7：① 明确这是「关键锚点重复」（D-PS7 已立先例），并说明为何此事实值得在三个装配层各点一次；② 把 ③ 收到它独有的操作层增量上，认知面只留 ①。 |
| 4 | Clarity / Numeric drift | 🔵 | 2.4「改后（实测）」列与实际不符：表记 common **221**（`:86`），现盘末行在 `docs/core/design/prompts/common.md:222`；表记 persona **230**（`:87`），现盘末行在 `docs/core/design/prompts/persona-engineering.md:229`；discipline 206 ✓。三档读数找不出同一计数口径，故 `:95`「回读读数 = 上表改后列」不可复现（同行 `##` 19 ∥ 17 ∥ 10 与 `###` 5 ∥ 0 ∥ 7 已逐档 grep 复核，全对）。 | 重测该列并在表头写明计数口径（是否含末行空行 / 用何种读数），使 `:95` 的回读声明可复核。 |
| 5 | Clarity | 🔵 | 2.3 ② 的坐标混用两个编号系：` :53` 写「改后（`:114` 之后追加两行；`:113-114` 原样不动）」用的是改前号（现盘 `wait_for` 段在 `:115-116`、新句在 `:118-119`）；2.1 落点列更把 `:16` 记作「`wait_for` 条后（`:114` 之后）」，而改前 `:114` 是「原则：有专用工具就不 hand-roll bash」那条。 | 在该行注明「号 = 改前（本批 ① 落笔前）」或改挂现盘号，免实施轮按号施落时错位。 |
| 6 | Requirements coverage / Clarity | 🔵 | ② 的承重事实「`wait_for` 等到的只是「它结束了」这个信号，报告内容仍要等送达」的单源是 `AGENT-LOOP-ASYNC-POOL.md:133` —— 不在本次评审范围，本轮只能标 `unverified`；同时设计自陈工具说明把「an async subagent/consult still settling」列为适用面（`:138`）并有意不动。该偏离已如实披露，可接受，但验收面无一处把它挂到可复核坐标上。 | 在 AC ③ 的判据列补该单源坐标（`AGENT-LOOP-ASYNC-POOL.md:133`），使「只拿到 settle 信号」这句在实施轮可当场核。 |
| 7 | Methodology (closest precedent) | 🔵 | 2.2 先例行（`:25`）只对齐「落点形态」这一个维度；落笔时点选了「CN 本设计轮直落」（`:95`，合 `PROMPT-SYSTEM.md:152` 默认），但同档存在一条反向先例并写明理由——`PROMPT-SYSTEM.md:622`「**因由 = 双稿同轮落笔**：逐字稿先以设计围栏块为送审对象过评审与批准，两档随后同轮落笔」（§6.25）。两条先例并存而设计未说选边理由。 | 在 2.2 补一句：说明本批取「设计轮直落」而非 §6.25 的「双稿实施轮」的依据（零 `##` / 零计数连带时，直落不产生评审对象变更）。 |

**范围限制（评审自陈）**：评审上下文未提供文档地图与项目标准档 —— 判据 7（文档归属）按 `PROMPT-SYSTEM.md` §1/§2.2/§6.1 的注册面与 Project Guide 判；`thincoder-core/prompts/**`（EN 面）与 `AGENT-LOOP-ASYNC-POOL.md` / `discipline-normal.md` / `wait_for` 工具说明均不在评审范围，「无相关 / 已核对」类自证本轮不可复核。

**范围外记事（不记严重度）**：实施轮 EN 落点的四处坐标（2.6 表 `:112-115`）在 `thincoder-core/prompts/*`，本评审不可达，未核。

VERDICT: pass
计数：🔴 0 · 🟡 3 · 🔵 4（共 7 条）

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-10-18（四处 EN 落点已落 · 审计 CLEAN · 评审 pass · fix round 0）



### 5.1 交付摘要

四处 EN 落点按设计 §2.3 ①②③④ 精确翻译落盘（译法锚 §2.6 七项全用）；三档 `##`/`###` 计数改前 = 改后；冒烟 `assemblePrompt('engineering')` warnings 0、新句全部在装配结果内。落笔前逐处重读 CN 现文（#114 落定后的现文与设计围栏块逐字一致，无漂移）。未碰 CN 设计档 / 需求档 / `PROMPT-SYSTEM.md`。

### 5.2 改动表（file:line = 落笔后现盘）

| # | 档 | 落点 | 改后英文原文（逐行） | numstat |
|---|---|---|---|---|
| ① | `thincoder-core/prompts/common.md` | `:134-135`（`### 并行调用原则` 节内，原 `:133` 句之后） | `:134` **This engine is fully asynchronous and highly concurrent**: a top-level spawn returns immediately, and its report arrives on its own when the session is idle; file conflicts and `dependsOn` dependencies are queued and ordered automatically by the scheduler.<br>`:135` So after dispatching a subagent there are only two moves: if you need its report for the next step ⇒ end the turn and let it arrive; if not ⇒ go on with other work at once. Holding several spawns in hand and waiting for one to finish before dispatching the next only ends up slower than the order the scheduler has already laid out — the same goes for repeatedly checking progress midway: the report arrives on its own. | +2 −0 |
| ② | `thincoder-core/prompts/common.md` | `:172-173`（工具表之后、`**Destructive-command red lines**:` 之前；表外段落，不入表） | `:172` **`wait_for` is for states that will not announce themselves**: a port opening, a file appearing — such things have no delivery channel into your session; without a query you would not know, so a blocking wait on them pays off.<br>`:173` An async subagent's report is the opposite: it arrives on its own when the session is idle; what `wait_for` gets is only the "it has settled" signal — the report's content still waits for delivery. And `wait_for` is a **blocking** call — using it to wait for a report leaves the whole session parked in place, with nothing you can do during that time. | +3 −0（2 句 + 1 段落分隔空行） |
| ③ | `thincoder-core/prompts/discipline-engineering.md` | `:197`（整行替换） | (Parallel-delegation token isolation / scheduling metadata / submit-and-go = main-agent role behavior.) **Concurrency is the norm**: a top-level spawn returns immediately, and its report arrives on its own when the session is idle — holding spawns in hand and waiting one by one only lines parallel work up as serial; file conflicts and dependencies are already ordered for you by the scheduler. | +1 −1 |
| ④ | `thincoder-core/prompts/persona-engineering.md` | `:211`（`## Parallel dispatch & multi-task` 节内，`Declare spawn scheduling metadata` 条之后、`Submit and go` 条之前） | - **The parent's waiting posture**: the report arrives on its own when the session is idle — the act of waiting for it is ending the turn; peek at progress non-blockingly with status/observe. Waiting with a blocking call (`wait_for`) buys you only a session parked in place — the report still arrives when it is due. | +1 −0 |

### 5.3 中英对位表（一句对一句）

| # | CN（`docs/core/design/prompts/`） | EN 落点 | 锚 |
|---|---|---|---|
| ①-a | `common.md:105` 本引擎全异步高并发：顶层 spawn 立即返回，报告在会话空闲时自动到达；文件冲突与 `dependsOn` 依赖由调度器自动排队排序。 | `common.md:134` | top-level spawn · returns immediately · arrives on its own when the session is idle · scheduler |
| ①-b | `common.md:106` 前半：所以派出子代理后只有两种走法：下一步要用它的报告 ⇒ 结束回合让它到达；不用 ⇒ 立刻接着做别的。 | `common.md:135` 前半 | — |
| ①-c | `common.md:106` 后半：把多枚 spawn 攒在手里等完一枚再派下一枚，只会比调度器已经排好的顺序更慢——中途反复查进度也一样，报告自己会到。 | `common.md:135` 后半 | scheduler |
| ②-a | `common.md:119` `wait_for` 用来等那些不会主动告诉你的状态：端口打开、文件出现——这类事不会自己把消息送进你的会话，不查就不知道，阻塞着等它才划算。 | `common.md:172` | states with no delivery channel |
| ②-b | `common.md:120` 前半：异步子代理的报告相反：会话空闲时它自己到达；`wait_for` 等到的只是「它结束了」这个信号，报告内容仍要等送达。 | `common.md:173` 前半 | arrives on its own when the session is idle |
| ②-c | `common.md:120` 后半：而 `wait_for` 是阻塞调用——拿它等报告，整个会话挂在原地，期间你什么都做不了。 | `common.md:173` 后半 | blocking call · a session parked in place |
| ③-a | `discipline-engineering.md:206` 前半：（并行委派的 token 隔离 / 调度元数据 / 提交即走 = 主 agent 角色行为。） | `discipline-engineering.md:197` 前半 | 括注原样保留 |
| ③-b | `discipline-engineering.md:206` 后半：并发是常态：顶层 spawn 立即返回、报告在会话空闲时自己到达——攥在手里逐枚等只会把并行的活排成串行；文件冲突与依赖，调度器已经替你排好。 | `discipline-engineering.md:197` 后半 | top-level spawn · returns immediately · arrives on its own when the session is idle · scheduler |
| ④-a | `persona-engineering.md:217` 前半：父侧的等待姿势：报告在会话空闲时自己到达——等它的动作就是结束回合；进度用 status/observe 非阻塞地瞄。 | `persona-engineering.md:211` 前半 | arrives on its own when the session is idle |
| ④-b | `persona-engineering.md:217` 后半：用阻塞调用（`wait_for`）去等，换来的只是被占住的会话，报告该到的时候还是会到。 | `persona-engineering.md:211` 后半 | blocking call · a session parked in place |

### 5.4 自证读数

**改前 / 改后**（口径：`totalSplit` = 按换行切分长度；`lastNonEmpty` = 末行非空行号）：

| 档 | totalSplit | lastNonEmpty | `##` | `###` |
|---|---|---|---|---|
| `thincoder-core/prompts/common.md` | 265 → 270（+5） | 264 → 269 | 19 → 19 | 5 → 5 |
| `thincoder-core/prompts/discipline-engineering.md` | 198 → 198（±0） | 197 → 197 | 10 → 10 | 7 → 7 |
| `thincoder-core/prompts/persona-engineering.md` | 226 → 227（+1） | 225 → 226 | 17 → 17 | 0 → 0 |

**冒烟**（`import('./thincoder-core/prompt-overlays.mjs')` → `assemblePrompt`）：

- `engineering`：prompt 长度 117722 · warnings **0** · 六项检查全 true（engine 两句 / wait_for 两句 / concurrencyNorm / posture）。
- `eng-coder`、`eng-designer`：warnings 0 · common 四项 + ③ true · ④ posture false（persona-engineering 不入其装配——符合场景表）。
- `normal`：warnings 0 · common 四项 true · ③/④ false（工程纪律 / 工程人格不入普通模式——符合场景表）。

**git diff --numstat（本轮 delta，非他批在飞改动）**：

- `common.md` **+5 −0**：①2 行 + ②2 句 + 1 段落分隔空行（与 CN 同形：CN 该处亦为「空行 + 2 行 + 空行」）。
- `discipline-engineering.md` **+1 −1**（整行替换）。
- `persona-engineering.md` **+1 −0**：该档总 diff 为 `+8 −2`，其中 `+7 −2` = 他批在飞改动（顶部 go-ahead 段与两处行替换），非本批；本批仅 `:211` 一行。
- 预期外文件 **0**。

**工程门**：`cd thincoder-core && npm test` → `ℹ test manifest is empty — zero tests = green (2026-09-28 full reset).`（exit 0）。本批无单测档（提示词文本批），验证 = 结构读数 + 冒烟 + numstat。

### 5.5 决策透明表 / 差异登记（四轴对拍）

| # | 决策 / 差异 | 依据 | 处置 |
|---|---|---|---|
| 1 | ② 段落带 1 个分隔空行（+3 而非 +2） | 与 CN 同形（`:118` 空行 → 新 2 行 → `:121` 空行 → `:122` 红线）；设计 §2.4 EN 行数口径为「±」 | 已落 |
| 2 | ④ 的 EN 节内次序与 CN 不同：EN 在 `Declare spawn scheduling metadata` 与 `Submit and go` 之间；CN 在「提交即走」之后（`persona-engineering.md:217`） | 本轮任务书「已知事实」明示 EN 落点 = 两 bullet 之间（设计 §2.6 第 4 行指定锚的语义化表述）；设计行号锚 `:206`/`:207` 现盘不可解析（`:207` = 节标题本身），按「定位以句为准」取句锚 | 语义无差、节位相同；差异登记于此，备后续轮核 |
| 3 | 译法锚七项 | 设计 §2.6 | 逐项在位：top-level spawn · returns immediately · arrives on its own when the session is idle · scheduler · blocking call · states with no delivery channel · a session parked in place |
| 4 | 因果句形 | 设计 §2.3 写法总则（用户 23:46 原话） | 新文本零 never / must not / do not 祈使禁令；事实 → 后果 → 所以怎么做随 CN 保留 |
| 5 | 提示词面无文档引用 | 公共层纪律（提示词面禁带引用） | 新文本零档名 / 节号 / 「见 X」指路 |

### 5.6 审计与代码评审轮次与终态

| 轮 | 类型 | 结论 |
|---|---|---|
| 1 | 内部差异审计（explore，只读） | **CLEAN**（PARTIAL / SILENT-SIMPLIFICATION / DOC-DRIFT / OUT-OF-LIST 四类均 0） |
| 1 | 内部代码评审（advisor，type=code） | **pass**（🔴 0 · 🟡 1 · 🔵 1） |
| fix round | — | **0 轮**：🟡 1 = 上述 5.5 差异，按评审建议②「登记」处置（非改码）；🔵 1 = 批档 EN 行号锚陈旧，读数已按现盘重测入 5.4 |

终态：**clean**（审计 CLEAN + 评审 pass + 0 修正轮）。

补注：评审引用的两条 `PROMPT-SYSTEM.md` 坐标被宿主机检标为「与现盘不符」（0/2 命中）——其结论不依赖该两处坐标：④ 次序差异由两档现文直读证实；EN 行宽不判缺陷与本批 AC ④ 只约束 CN 六行新文本一致。

### 5.7 复跑命令

```
cd thincoder-core && npm test
git --no-pager diff --numstat -- thincoder-core/prompts/common.md thincoder-core/prompts/discipline-engineering.md thincoder-core/prompts/persona-engineering.md
```

冒烟：在 `execute` 内 `const {assemblePrompt} = await import('./thincoder-core/prompt-overlays.mjs')`，取 `assemblePrompt('engineering')` 读 `prompt.length` 与 `warnings.length`。

## §6 验证与收口（父代理）

**验证与收口（父侧 · 2026-10-18 00:1x）**

**实施**：`eng-designer#101`（CN 三档四落点）+ `#110`（评审 7 条修正）+ `eng-coder#115`（EN 同形落地）。

**父侧亲跑读数**：

| 档 | 落点 | 读数 |
|---|---|---|
| `thincoder-core/prompts/common.md` | `:134-135`（引擎认知两行）· `:172-173`（`wait_for` 判断两行） | 在位，逐字核对 |
| `thincoder-core/prompts/discipline-engineering.md` | `:197`（整行） | 在位 |
| `thincoder-core/prompts/persona-engineering.md` | `:211`（父侧等待姿势） | 在位 |
| 禁词自检 | 六行新文本内 `never/must not/do not/forbidden/prohibited` | **0** |
| 冒烟 | `assemblePrompt` 两场景 | `engineering` len **117722** warnings **[]** · `normal` len **78466** warnings **[]**；两句均在 prompt 内 |

**关键判据**：这四行是**因果体**——引擎是什么样 → 所以怎么做 → 反着做为什么更慢。`wait_for` 那句尤其重要：它没禁「用 `wait_for` 等子代理」，而是讲清代价（阻塞 + 只拿到 settle 信号，报告仍走送达）。

**内部评审**：`#115` 自跑 advisor（type=code）**pass**（🔴 0 / 🟡 1 / 🔵 1）；🟡 = EN ④ 与 CN 节内次序不同（按任务书指定的 EN 两个 bullet 之间落位），已登记 §5.5；🔵 = §2.6 的 EN 行号锚陈旧（实施按句锚定位，现盘读数已入 §5.4）。

**登记面**：`PROMPT-SYSTEM.md:172`（§6.1 落点）∥ `:792-812`（紧凑机制块）∥ `:858`（D-PS41）——`##` 9=9、`###` 38=38（零标题新增）。

**收口**：`#1629` 核销；本档冻结。
