# 2026-11-08 · tool-desc-trim
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 17:09「这谁加的?什么时候加的?…去掉!我从来没说过文档有长度限制.」· 17:11「发给模型的工具描述能写这么长?!」· 17:14「你把所有这些工具描述都梳理一下,看看到底是怎么回事.」· 17:16「开.」。
> 台账 = #2201（core · 归批）。前情 = docs/batches/2026-11-08-gate-keys-visibility.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 已定决定

- **已定决定**：文档没有长度限制——撤掉我方自造的字符帽 · 用户原话：「这谁加的?什么时候加的?你啥时候自说自话加这么个东西?去掉!我从来没说过文档有长度限制.」 · 时间：2026-11-08 17:09
- **已定决定**：工具描述按「怎么用」重写，不写实现细节 · 用户原话：「发给模型的工具描述能写这么长?!」「你把所有这些工具描述都梳理一下,看看到底是怎么回事.」 · 时间：2026-11-08 17:11 / 17:14

### 事实（父侧实读，不是转述）

**`thincoder-core/tool-docs/<name>.md` 就是真正发给模型的工具描述**，不是设计文档：
`thincoder-core/prompt-files.mjs` 的 `loadToolDoc()` 是 `readFileSync(join(TOOL_DOCS_DIR, name + '.md'), 'utf8')`，整档原样读回；各工具 `description: DESC("subagent")` 直接拿这个字符串。**没有渲染、没有摘要、没有第二份。**

**体量（文件尺，54 档）**：合计 **130,749 字符**。前五档占 59,070：
`doc_check` 14,380 ∥ `browser` 12,277 ∥ `subagent` 11,920 ∥ `batch` 11,113 ∥ `ssh` 9,380。

**内容分布（父侧扫过）**：
- 「写给人看的理由行」（为什么 / 依据 / 判例 / 来源）= **14 / 1,306 行 = 1%**——**不是设计理由混进来的问题**
- 跨档重复的长行 = 5 行 / 924 字符——**也不是重复的问题**
- **真正的问题是第三件**：大量内容是**实现细节与判据谓词**，即「实现者读的」，不是「调用者读的」。样本见 `thincoder-core/tool-docs/doc_check.md` 的「The reach is what survives extraction」「Three name families are never extracted」「a stem like `file` does not save … from being a pointer」——**那是抽取谓词的白名单，该住设计档**。

### 两处要撤的自造物

| 物 | 现文 | 处置 |
|---|---|---|
| `docs/core/design/MANIFEST.md` 的 5,000 字符自设帽 | 「设计自设更紧上限 = `thincoder-core/tool-docs/manifest.md` ≤5,000 字符」+ AC-K4 ①+ KD-M1-44 + 第 622 行那句已死的「算术闭合：现值 2,235 + ≤2,300 = ≤4,535」 | **删**。现值 5,555，那句算式差了一半 |
| 8,000「机制硬限」 | `docs/core/design/MANIFEST.md` 第 621 行 + `scripts/tool-schema-size.mjs` 的 `over8k` | **降为读数，不叫硬限**——它自称报告态、从不拦人；而实测五档早已越过它（`subagent` 19,428 ∥ `browser` 18,997 ∥ `batch` 17,966 ∥ `doc_check` 16,914 ∥ `ssh` 12,524，渲染尺）。**名叫硬限却从不拦，等于让读的人以为有人管着** |

**来历（`git log` 实读）**：`scripts/tool-schema-size.mjs` 2026-09-30 `d7f7612b` 引入；5,000 这条线 2026-10-16 `622eabdc` 首次落进设计档，2026-11-01 `a2f586a5` 又带了一次。**三次都是 agent 在批次里自加的，用户从未提过。**

### 重写口径（每档只留四样）

```
① 它是什么（一句）
② 参数什么意思（含默认值与边界）
③ 返回什么
④ 常见误用一句
```

**判据谓词 / 实现细节 / 判例 / 教训 / 设计理由一律不出现在工具描述里**——它们住在 `docs/core/design/` 对应档。**同一件事写两遍、一遍发给模型一遍给人看，正是 D2 在治的。**

**不给字符目标**：用户已否「文档长度限制」；本批产出是「逐档删了什么 / 留了什么 / 为什么」，不是砍到某个数。

### 边界

- **不改工具行为**：只动描述文本，`description` 之外的代码零改。
- **不丢调用者需要的信息**：参数默认值、边界、错误形、常见误用——**这四样删一条就是这批的失败**。
- **实现细节不是删掉就完**：它得先确认在 `docs/core/design/` 里有对应落点；**没有落点的先补设计档再删描述**，不许凭空消失。

- **已定决定**：上限那条先不动 · 用户原话：「上限那个先不去了.」 · 时间：2026-11-08 17:17

**上一条（17:09「去掉!」）作废。**本批只剩一件：**把 54 档工具描述按「怎么用」重写**。

`docs/core/design/MANIFEST.md` 的 5,000 字符自设帽 ∥ `scripts/tool-schema-size.mjs` 的 8,000「机制硬限」——**一个字不动**。

**记下这条反转的原因，免得下一个人把它当成漏项**：撤令是 17:09 下的，17:17 收回；两道令之间只隔八分钟，中间我给了它一份来历说明（两个数都是 agent 自加）——**用户看了之后决定先不动**。**这一句不是辩解，是让后来者知道「不动」是选过的，不是忘了。**

**本批不再有「自造物」这一支**：它若要处置，另立账、另定形。

### 设计席四条上抛的父侧裁决

**① 语言面：按原文语言重写，不统一。**
`thincoder-core/tool-docs/ledger.md`（全中文）∥ `team_ledger.md` 与其余 48 档英文 ∥ 五档中英混排——**本批不管语言**：用户没说过语言，**这是本批自己不该扩出来的维度**。每档按它现在的主要语言写，混排的按改动前的正文语言走。**语言统一若要，另立账、另问用户。**

**② 落点深度：按设计席给的规则执行，不给「核不到就删」留口子。**
`docs/core/design/DOC-DISCIPLINE.md` 只核到三处，`doc_check` 的三族名剥除表与指针解析四腿未逐条核——**实施轮删前逐条核，核不到就先补设计档再删**。这一条本来就是 §6.9 的落地约束，**现在要写明：核不到不是跳过，是停**。

**③ 11 缺名对：本批不做，立账。**
9 档没提到自己 schema 的 11 个顶层属性名（`read.allowExternal` ∥ `execute.filter` ∥ `batch.segment/prev` ∥ `eng.action` ∥ `goal.objective/criteria` ∥ `plan.action` ∥ `subagent.recent` ∥ `timer.message` ∥ `verify.workdir`）——**这是「调用者需要的信息现在就缺」，不是本批删出来的。**

**为什么不在本批补**：本批的动作是「删」，补是「增」，**同一批里两件事会互相掩盖**（用户要的是看看到底怎么回事，先把多出来的清掉；缺什么另算）。**A2 保持「只降不增」，一个字不改。**

**④ 30 档线索正则零命中 ≠ 已判无 I 类。**
设计席自己点了这条，采认：**判据是 §6.9 的四类，实施轮逐档逐行判**，正则只作线索。

### 一条不裁但要说的

**这批的验收不是「削到多少字符」**——用户已明确否掉长度限制。**A 面读数的意义是「一份记录」，不是「一个目标」。**谁若把它当 KPI 追，就是把这批又做成了它要治的那个形状。

- **已定决定**：工具描述统一英文 · 用户原话：「工具描述统一都是英文」 · 时间：2026-11-08 17:26

**上一条「按原文语言重写、语言统一另批」作废。**

理由不用猜，事实摆着：48 档是英文，`thincoder-core/tool-docs/ledger.md` 全中文（2,071 字符）、`team_ledger.md` 783 字符，另有五档中英混排（`batch.md` ∥ `notify_parent.md` ∥ `read_history.md` ∥ `consult_start.md` ∥ `consult_stop.md`）。

**同一批发给模型的描述，一半英文一半中文，读它的是同一个模型**——这不是风格问题，**是同一面上的两种写法**，正是本批要消的那类东西。

**所以本批加一件事**：那 7 档在重写时**一并改成英文**；其余 47 档本来就是英文，按「怎么用」削。

**中文术语怎么处理**：`档缺` ∥ `节缺` ∥ `引缺` 这类是**判据输出的字面值**，不是散文——**它们照原样保留在引号里**（模型看到回执就是这几个字，翻译了反而对不上）。散文一律英文。

### 更正：语言面不是新裁定，是既有成规——我下裁定前没查文档

**用户 17:27 指出：「这个是设计文档里早就定了的,在回答问题之前都不先查文档的吗?」——是。我先下了裁定，后查的档。**

查到的既有条（`doc_search` + 定向 `grep`，五处，都在盘）：

| 处 | 逐字 |
|---|---|
| `docs/core/design/BROWSER-TOOL.md` KD-9 | 「描述面英文、约 45 行」· 理由逐字「沿既有 tool-docs 惯例（**用户面语言 = 模型面英文**）」 |
| `docs/core/design/EDIT-HELPERS.md` | 「**语言 = 英文**：拒文在 `thincoder-core/tool-docs/edit.md` / `insert_after.md` 里被逐字引用为错误形态。两描述档是英文，拒文若是中文，模型会看到同一条消息的两种写法」 |
| `docs/core/design/DOC-DISCIPLINE.md` | 「`thincoder-core/tool-docs/doc_check.md` 同口径（**英文运行面** = 实施轮）」 |
| `docs/core/design/MANIFEST.md` | 「落地文本 = **英文同义句**——`thincoder-core/tool-docs/manifest.md` 现状全英文」 |
| `docs/core/design/TOOLS.md` | 「步骤落工具描述（**英文面**）」· 「`thincoder-core/tool-docs/ssh.md` ｜ 描述面（**英文**）」 |

**所以我 17:21 那句「按原文语言重写，不统一；用户没说过语言，这是我自己不该扩出来的维度」是错的，而且错在两头**：

① **事实错**：设计档五处早就写了「描述面英文」，我一句都没查；
② **理由错**：「用户没说过」被我用成了「怎么做都行」——**明摆着的成规在那儿，该查的是文档，不是等用户再说一遍。**

**由此多出一条真实缺陷**：`thincoder-core/tool-docs/ledger.md`（全中文，2,071 字符）与 `team_ledger.md`（783）**本身就是违这条成规的**——它们不是「风格不同」，是**长期偏离既定口径**。本批顺手收正。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（界线已落 docs/core/design/TOOLS.md §6.9（含 ④ 归 K1 与语言=英文）；54 档逐档处置、落点、验收 A1–A7、上抛 4 项在 §2）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

**范围变更（2026-11-08 17:17 用户「上限那个先不去了.」）**：§1「两处要撤的自造物」整表作废——`docs/core/design/MANIFEST.md` 的 5,000 自设帽与 `scripts/tool-schema-size.mjs` 的 8,000 读数**零改**。本批只剩 54 档工具描述按「怎么用」重写。设计档随正 = `docs/core/design/TOOLS.md` §6.9（本轮已落，未提上限一字）。

**范围追加（2026-11-08 用户「工具描述统一都是英文」）**：7 档中文 / 混排描述本批一并改成英文（名单与约束见「语言面」块）；上抛 2 随之由「待裁」转为「已裁」。

| # | 条目 | 判定线 | 指回 |
|---|---|---|---|
| 1 | 54 档工具描述只写调用者需要的四样 | 每档逐行可归入 K1–K4 之一（六要素 ④ 副作用与权限归 K1）；归 I1–I4 的行移出 | `docs/core/design/TOOLS.md` §6.9 |
| 2 | 分判界线可逐行判，不留「酌情」 | 界线 = 一句问句 + 两张类表（K1–K4 留 ∥ I1–I4 删），两刀切开最常混的两处 | 同上 |
| 3 | 实现者面内容先有落点再删 | 每一项被删的 I 类内容，其机制档在盘且含该内容的关键词；顺序 = A3 删前预检先过 | 本段「落点」表 |
| 4 | 调用者需要的信息一条不丢 | 缺名对数**不增**——基线 = A2 的改前读数，本批不新增缺名（缺口本身不属本批） | A2 |
| 5 | 不改工具行为 | `description` 之外的代码零 diff | A5 |
| 6 | 不设字符目标、不以长度为理由 | 任何验收不带字符数上限；削的理由只有「不是给调用者看的」 | 本段末「关键决策」K4 |
| 7 | 副作用与权限句一条不丢 | 8 档具名各含 ≥1 行 ④ 类线索（六要素 ④） | A6 |
| 8 | 描述面语言统一为英文 | 7 档中→英；其余 47 档英文面不加动作 | A7 |

**不在本批**：`docs/core/design/MANIFEST.md` 的**上限条目**（用户 2026-11-08 17:17 收回；该档其余表述面本轮随正，属 D11 同轮）· `scripts/tool-schema-size.mjs`（判据归本批，改动面归实施席，一并停在本批之外）· 需求档 · 提示词面。

**本批不补、交父侧立账的五类缺口（四波实施逐项点名，均经 `git show HEAD:` 实读确认为「改前即缺」或「属增」）**：

1. **参数名改前即缺**——`doc_search.query` ∥ `doc_search.limit` ∥ `consult_start.models` ∥ `task.items` ∥ `goal.objective` ∥ `goal.criteria` ∥ `read.allowExternal` ∥ `execute.filter` ∥ `eng.action` ∥ `plan.action` ∥ `timer.message` ∥ `verify.workdir` ∥ `memory.content` ∥ `memory.tags` ∥ `memory.query` ∥ `memory.limit` ∥ `ledger.cwd` ∥ `ledger.title` ∥ `ledger.req_doc` ∥ `git.workdir`；四波各自点到的其余缺名见 §5 各波「缺口」段（本段不重抄）。
2. **回执形整样缺**——`thincoder-core/tool-docs/recent_changes.md` 无回执形：实返 `Touched N file(s) this run:` + 每行绝对路径，空态 `(no files modified in this run yet)`。
3. **拒面缺**——`thincoder-core/tool-docs/eng.md` 缺 `enter` 被拒的出口（`Error: cannot enter engineering mode — <原因> (mode unchanged)`）。
4. **去重面缺**——`thincoder-core/tool-docs/skill.md` 缺同名二次 `load` 的 dedup 面（返 already loaded 而非重载）。
5. **「Never throws」宽了**——`thincoder-core/tool-docs/manifest-read.md` ∥ `thincoder-core/tool-docs/manifest.md`：`target` 必填、只读变体拒非 `read` 动作，两处都抛。

### 机制设计（单源 = 设计档，此处只指位置）

界线的本体住 `docs/core/design/TOOLS.md` §6.9，本段不复述（D2）。三句摘要（供评审定位，非权威）：

- 去留一问：**这一句会不会改变一个称职调用者发出的调用，或他读完回执后能得出的结论？**
- 两刀：缺省值算 K2、判据谓词算 I1；回执结论算 K3、算法过程算 I1。
- 先落点后删：I 类内容在 `docs/core/design/` 有机制档才删。

### 逐档处置（54 档 · 一个不落）

**读数目**：字符 = `node` 实读 `.length`（域 = `thincoder-core/tool-docs/` 全 54 档，合计 130,749）；「标记读数」= 三类线索正则（实现坐标 ∥ 理由词 ∥ 内部路径）的命中行数，**只作排序与线索，不作判据**——判据是 `docs/core/design/TOOLS.md` §6.9 的四类。下表的「删」是实施轮按界线逐行落笔的对象，不是逐字清单。

| 档（全路径省略前缀 `thincoder-core/tool-docs/`） | 字符 | 标记读数 id∥path∥why∥impl | 删（类别 + 一句） | 留（调用者四样） | 落点（删前须在盘） |
|---|---|---|---|---|---|
| `thincoder-core/tool-docs/doc_check.md` | 14,380 | 0∥4∥6∥8 | I1 判据谓词（提取的三族名剥除 ∥ 占位词干表 ∥ 段长口径）＋ I2 坐标（`countContentLines` ∥ `isPromptFace` ∥ `isOperandFace` ∥ 内置常量名）＋ I3（空范围为何判 ERROR 的解释） | K1 两模式各干什么 ∥ K2 `mode`/`docs`/`target`/`lines` 的缺省与「gate 拒 `lines`」∥ K3 首行 verdict 三串 ∥ 命中行形 ∥ K4 别接成 CI 门 | `docs/core/design/DOC-DISCIPLINE.md` |
| `thincoder-core/tool-docs/browser.md` | 12,277 | 2∥0∥0∥0 | I1/I2：snapshot 元素编号与 `[new]`/`[outside]` 的生成规则、超时预算逐条、profile 目录与实例共享的实现叙述＋ I4 反爬实测教训 | K1 十六动作各一句 ∥ K2 动作参数与默认（`headless` 复用运行中实例即不生效）∥ K3 回执形与 `[page] <url>` 出处标记 ∥ K4 click 与 mouse 之别 | `docs/core/design/BROWSER-TOOL.md` |
| `thincoder-core/tool-docs/subagent.md` | 11,920 | 0∥0∥3∥6 | I3「Why delegate?」整段设计理由 ＋ I2 门的三态判据与「不回显令牌」的机制说明 ＋ I1 模式过滤的装配口径 | K2 角色枚举、任务书五参、`designToken` 何时必填、`round` ∥ K3 回执与上抛标记 ∥ K4 确认型问题不要发 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` ∥ `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` |
| `thincoder-core/tool-docs/batch.md` | 11,113 | 0∥0∥3∥2 | I1 每条拒文的触发谓词逐条（`edit` 六拒因全枚举 ∥ 状态行保护 ∥ 骨架占位）＋ I3「两条门为何只挂在 append 上」的机制解释 | K2 `action`/`segment`/`text`/`oldText`/`newText`/`value`/`note` 与「谁写哪段」∥ K3 拒了什么、`Nothing was written`、状态行关键词 ∥ K4 别写别人的段 | `docs/core/design/BATCH-RECORD.md` |
| `thincoder-core/tool-docs/ssh.md` | 9,380 | 0∥0∥0∥1 | I1 就绪判定四态与 `promptPattern` 默认识别行 ＋ I2 保存档密文 blob、`configDir` ＋ I3 判据来历 | K2 连接参数与 `promptPattern` 何时给 ∥ K3 返回文本与 `buffered` 结论 ∥ K4 文件内容零入上下文 | `docs/core/design/TOOLS.md` |
| `thincoder-core/tool-docs/manifest.md` | 5,555 | 0∥0∥0∥0 | 无 I 类标记命中；其「每键一句」是 K2（键面边界），不是实现面 | **14 个可写节点**各一句 + 三腿值形 + 整键写即拒（白名单从 `MANIFEST_SCHEMA` 派生——整键 `version` / `phase` / `codePaths` + `docRoot.*` 六 + `index.*` 五；逐键名单住 `docs/core/design/MANIFEST.md`） | 不触发 |
| `thincoder-core/tool-docs/edit.md` | 4,066 | 0∥0∥0∥0 | 无标记命中；逐行复核行号锚段是否超出「拒因 + 下一步」该有的分量 | K2 `edits[]` 形状与互斥 ∥ K3 命中次数与拒文 ∥ K4 重读再改 | 不触发（复核若命中 ⇒ `docs/core/design/EDIT-HELPERS.md`） |
| `thincoder-core/tool-docs/git.md` | 3,389 | 0∥0∥1∥1 | I2 `git -c` 覆写的用法叙述 ∥ I3 失败面的理由句 | K2 动作枚举与 `ref`/`path` 语义 ∥ K3 回执与失败形 ∥ K4 非交互标志 | 不触发 |
| `thincoder-core/tool-docs/bash.md` | 3,368 | 0∥0∥0∥1 | I1 `filter` 是正则的机制说明（保留「过滤的是输出行」这一句） | K2 `command`/`workdir`/`async`/`timeout` 与注入面权威 ∥ K3 三段包裹形 ∥ K4 别用 bash 读写文件 | 不触发 |
| `thincoder-core/tool-docs/wait_for.md` | 3,311 | 0∥0∥1∥0 | I3「discouraged」背后的理由段（保留一句「别用它等子代理」） | K2 条件形枚举 ∥ K3 满足 / 超时两句话 ∥ K4 阻塞调用不可与其它调用并批 | 不触发 |
| `thincoder-core/tool-docs/memory.md` | 3,036 | 0∥0∥0∥1 | I1 `maintain` 的 GC/压缩实现叙述（保留「confirm 才执行」） | K2 五个 action 与 `layer`/`id` 语义 ∥ K3 回执 ∥ K4 个人层与项目层别混 | 不触发 |
| `thincoder-core/tool-docs/advisor.md` | 2,626 | 0∥0∥3∥2 | I3 评审类型的取舍理由 ∥ I2 `object={type,target,status,reason,exclude}` 的注入机制叙述 | K2 三种 `type` 与 `documents`/`paths` 必填 ∥ K3 回执与批准信号 ∥ K4 设计评审要带 documents | 不触发（复核若命中 ⇒ `docs/core/design/ADVISOR-GUARDS.md`） |
| `thincoder-core/tool-docs/apply_patch.md` | 2,451 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/execute.md` | 2,152 | 1∥0∥0∥0 | 无实义命中（唯一 id 命中是 `node --test` 用法，属 K4） | 四样 | 不触发 |
| `thincoder-core/tool-docs/notify_parent.md` | 2,075 | 0∥0∥0∥1 | I1 「什么算决策级」的四类枚举（保留一句判法） | K2 `kind` 两值与 1,500 字符帽 ∥ K3 标记形 ∥ K4 确认型问题不发 | 不触发 |
| `thincoder-core/tool-docs/ledger.md` | 2,071 | 0∥0∥0∥0 | 无标记命中；中文面（见上抛 ②） | 六态与四条边的逐边枚举（K2） | 不触发 |
| `thincoder-core/tool-docs/websearch.md` | 2,009 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/insert_after.md` | 1,960 | 0∥0∥0∥2 | I1 记账面判据的措辞（保留「被拒时带路径与两条下一步」） | 四样 | 不触发（复核若命中 ⇒ `docs/core/design/INSERT-AFTER.md`） |
| `thincoder-core/tool-docs/hashline_edit.md` | 1,845 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/question.md` | 1,805 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/read_history.md` | 1,709 | 0∥0∥1∥0 | I3 检索为何不在记忆里的理由句 | 四样 | 不触发 |
| `thincoder-core/tool-docs/delete.md` | 1,693 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/timer.md` | 1,682 | 0∥0∥1∥0 | I3 交付形态的理由段（保留「到点提醒」与「用户轮不投递」两句） | K2 四种调度形与互斥 ∥ K3 回执 ∥ K4 至多 8 个在挂 | 不触发（复核若命中 ⇒ `docs/core/design/AGENT-LOOP-ASYNC-POOL.md`） |
| `thincoder-core/tool-docs/glob.md` | 1,431 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/settings.md` | 1,430 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/read.md` | 1,312 | 0∥0∥0∥0 | 无标记命中（路由段属 K4，留） | 四样 | 不触发 |
| `thincoder-core/tool-docs/verify.md` | 1,302 | 0∥0∥2∥0 | I3 「它不跑检查」的理由铺垫（保留这一句结论本身） | 四样 | 不触发（复核若命中 ⇒ `docs/core/design/VERIFY-REDESIGN.md`） |
| `thincoder-core/tool-docs/grep.md` | 1,294 | 0∥0∥0∥2 | I2 实现叙述（保留模式语法与 `glob` 排除形） | 四样 | 不触发 |
| `thincoder-core/tool-docs/process.md` | 1,260 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/context.md` | 1,245 | 0∥0∥0∥2 | I1 三操作的实现口径（保留三操作各干什么） | 四样 | 不触发（复核若命中 ⇒ `docs/core/design/CONTEXT-COMPACTION.md`） |
| `thincoder-core/tool-docs/manifest-read.md` | 1,227 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/file_ops.md` | 1,221 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/consult_start.md` | 1,154 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/read_image.md` | 1,091 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/write.md` | 1,008 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/fetch.md` | 983 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/lint.md` | 838 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/team_ledger.md` | 783 | 0∥0∥0∥0 | 无标记命中；中文面（见上抛 ②） | 四样 | 不触发 |
| `thincoder-core/tool-docs/lsp.md` | 745 | 0∥0∥0∥1 | I2 子命令实现叙述 | 四样 | 不触发 |
| `thincoder-core/tool-docs/tree.md` | 744 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/task.md` | 625 | 0∥0∥0∥1 | I2 实现叙述 | 四样 | 不触发 |
| `thincoder-core/tool-docs/ls.md` | 618 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/doc_search.md` | 513 | 0∥0∥0∥1 | I2 索引面实现叙述 | 四样 | 不触发 |
| `thincoder-core/tool-docs/goal.md` | 506 | 0∥0∥2∥0 | I3 理由句 | 四样 | 不触发 |
| `thincoder-core/tool-docs/consult_stop.md` | 504 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/skill.md` | 478 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/plan.md` | 423 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/code_search.md` | 385 | 0∥0∥0∥1 | I2 索引面实现叙述 | 四样 | 不触发 |
| `thincoder-core/tool-docs/recent_changes.md` | 358 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/repo_outline.md` | 344 | 0∥0∥0∥1 | I2 实现叙述 | 四样 | 不触发 |
| `thincoder-core/tool-docs/get_current_time.md` | 337 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/eng.md` | 294 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/main_history.md` | 241 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |
| `thincoder-core/tool-docs/peer_instances.md` | 182 | 0∥0∥0∥0 | 无标记命中 | 四样 | 不触发 |

**表的用法**：上表 30 档零标记命中（逐档判 = `node` 扫域 54 档：30 档四类全零 ∥ 24 档至少一类命中）——它说明「线索正则没在那几档上点火」，不等于「已判无 I 类」；实施轮对每一档仍按 §6.9 四类逐行判，只是预期改动小或无。**判据不是这张表，是设计档那一节**。

**语言面（7 档 · 中→英 · 2026-11-08 用户「工具描述统一都是英文」）**：这 7 档除按 §6.9 削 I 类外，另把散文改成英文。上表这 7 行的「删 / 留」内容不变，只多这一笔。

- 全中文两档：`thincoder-core/tool-docs/ledger.md` ∥ `thincoder-core/tool-docs/team_ledger.md`。
- 中英混排五档：`thincoder-core/tool-docs/batch.md` ∥ `thincoder-core/tool-docs/notify_parent.md` ∥ `thincoder-core/tool-docs/read_history.md` ∥ `thincoder-core/tool-docs/consult_start.md` ∥ `thincoder-core/tool-docs/consult_stop.md`。
- 其余 47 档本来就是英文面，按「怎么用」削即可，不加语言动作。

**别翻错的一条**：`档缺` ∥ `节缺` ∥ `引缺` 是机判输出的**字面值**，不是散文——照原样留在引号里；产品既有中文名与路径同样照原样。翻掉它们，回执就对不上（A7 判这个）。

### 落点（I 类内容的去处，删前须在盘）

| 内容族 | 机制档 | 本席核过的深度 |
|---|---|---|
| 文档纪律判据（锚 ∥ 段长 ∥ 提取三族名 ∥ 指针解析腿 ∥ gate） | `docs/core/design/DOC-DISCIPLINE.md` | 在盘；§3.18 段/行判据、§3.20 报告态 ∥ gate、剥除面谓词三处已核；三族名剥除表与解析四腿**未逐条核** |
| 浏览器交互面（动作族 ∥ 引用稳定性 ∥ 超时预算） | `docs/core/design/BROWSER-TOOL.md` | 在盘（动作族、权限门、错误面、`[page] <url>` 出处标记已在该档） |
| 派工与令牌（角色矩阵 ∥ 门三态 ∥ 槽生命周期） | `docs/core/design/AGENT-LOOP-SUBAGENT.md` ∥ `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` | 在盘（门三态的四条拒句逐字住 `docs/core/design/AGENT-LOOP-SUBAGENT.md`） |
| 批档六段（段白名单 ∥ 状态行 ∥ 收口链） | `docs/core/design/BATCH-RECORD.md` | 在盘 |
| 编辑族锚护栏（行号锚 ∥ 记账面） | `docs/core/design/EDIT-HELPERS.md` | 在盘 |
| 其余工具族（逐档处置表判「不触发」的 30 档） | **本批不预指落点档名**——实施轮逐行判若命中 I 类，先在该工具的机制档（`docs/core/design/` 下同族档；无则在该族设计档内立该工具一节）补内容，再删描述 | 未核——本批只按 A4 的回归读数看：读数不到 0 视为「没找到」，不是「没有」 |

**核不到怎么办**：落点档不含该内容 ⇒ 先把内容补进机制档，再删描述（条目 3）。不许「先删掉再补」——补不回来的时候没人知道丢了什么。

**补不动（没有可落的机制档）⇒ 停并上抛**：不自行选落点档、不先删（§1 ②「核不到不是跳过，是停」）。那 30 档若判出 I 类，走的正是这条——判它们的不是 A1 的域，是 A3 的预检。

### 受影响文件与分层结论

| 面 | 档 | 改什么 | 归谁 |
|---|---|---|---|
| 产品文本面 | `thincoder-core/tool-docs/` 全 54 档 | 按 §6.9 四类逐行删 I 类、留 K 类；其中 7 档另做中→英（见「语言面」块） | 实施轮 eng-coder |
| 设计档 | `docs/core/design/TOOLS.md` | §6.9 增「调用者面 ∥ 实现者面」＋「翻译不碰的四类」；§1 注 ∥ §6.7 `doc_check` 判据三条 ∥ §6.7 `browser` 十八动作 ∥ §6.11 档数 ∥ §6.21 ∥ §6.23 的逐字副本改指单源 | 本席，本轮已落 |
| 机制档（落点补齐 · 条件触发；后两档为**随正**） | `docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/design/BROWSER-TOOL.md` ∥ `docs/core/design/AGENT-LOOP-SUBAGENT.md` ∥ `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` ∥ `docs/core/design/BATCH-RECORD.md` ∥ `docs/core/design/EDIT-HELPERS.md` ∥ `docs/core/design/INSERT-AFTER.md` ∥ `docs/core/design/ADVISOR-GUARDS.md` ∥ `docs/core/design/VERIFY-REDESIGN.md` ∥ `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` ∥ `docs/core/design/CONTEXT-COMPACTION.md` ∥ `docs/core/design/MANIFEST.md` ∥ `docs/core/design/AGENT-LOOP-UPSTREAM.md` | 前 11 档只在 A3 预检判「落点档缺该内容」时补内容，逐项点名落 §5；**后 2 档随正**——描述面已更正的假话在这两档还停在错的那边（删错句、不新增规则）：`read` 回执行集不含 `unknownKeys`、描述档逐字副本改指单源。两档的上限条目零改 | 实施轮 eng-coder（前 11 档）∥ 本席（后 2 档，本轮已落） |
| 代码面 | — | **0**（`description` 之外零改；`scripts/tool-schema-size.mjs` 本批不动） | — |
| 测试档 | — | **0**（无可跑断言面，见下「测试计划」） | — |

**分层结论 = 无档跨分层**：档位线只量代码面；本批零代码档——54 档为描述文本，12 档为设计文本（本档 + 上表 11 档机制档）。上表 11 档已逐档 `existsSync` 实读为 true。

**测试计划**：本批零代码面 ⇒ **不产单元测试档**（没有 `node --test` 的对象）。验收 = A1–A7 的命令读数；跑法（cwd = 仓根、命令与期望）住本节验收表，读数落 §5。收口无「删测试档」一步——没有档可删。

### 验收对照（每条带红侧；读数只在命令输出里）

| # | 验收 | 跑什么 / 期望 | 红在什么读数上 |
|---|---|---|---|
| A1 | 落点在盘 | 域 = 落点列**具名**的档去重（「不触发」行不入域，其处置见落点表末行）⇒ 逐档 `existsSync` 全 true | 落点写成盘上不存在的档即红（可造：把一格换成一个不存在的档名重跑，读数须转 false） |
| A2 | 调用者参数信息不丢 | `node` 逐档比对「schema 顶层属性名 ⊆ 描述档文本」，同一命令、同一域（54 档）各跑改前 / 改后一次 ⇒ 缺名对数**不增**。**尺子 = 参数位**：只认三种形——① 行首列表项 `- <name>` ∥ ② 反引号包裹 `` `<name>` `` ∥ ③ 行首参数表行 `<name>:`；句中散文不算。基线 = 那次实跑的读数，不冻结名单（先前写的「11 对 / 9 档」漏了 `memory` 四对）。**词边界不够**：`models` ∥ `workdir` 按子串与按词边界**都** = 1（确是整词，只是活在散文里），换参数位才 = 0；绿侧对照 `ref` 10 ∥ `oldText` 2 ∥ `evidence` 5 均 ≥1，故这把尺不是恒零。**反方向（已写明的参数名一个都不许消失）已由父侧用同一把参数位尺实跑一次**，读数与复跑法见本节「A2 参数位尺 · 改前基线」。 | 改后多于改前即红；出现改前没有的名对即红；已写明的参数名消失即红 |
| A3 | 删掉的内容有落点承载（**删前预检 + 删后复核**） | 两步用同一条命令：预检 = 逐项点名清单（先落 §5）后，落点档 `grep` 该内容的关键词 ≥ 1，**全项过才许动笔**；删后 = 同一命令复跑，读数不变 | 预检任一项 0 命中 ⇒ **停**（先补机制档，K3），不许先删；删后读数少于预检即红 |
| A4 | 不新增实现者面 | `node` 逐档跑本段的三类线索正则 ⇒ 每档读数 ≤ 表内改前读数（合计 24 档有点 ∥ 30 档零点） | 任一对越过改前读数即红（线索正则只作回归读数，不作判据——漏报不清账） |
| A5 | 交付门 ∥ 零行为变更 | `doc_check(mode:"gate", docs=[…])` 范围 = 54 档 + `docs/core/design/TOOLS.md` + 受影响文件表「机制档（落点补齐）」列的具名档 ⇒ 首行 `PASS`。命令形本轮实读：`docs:["thincoder-core/tool-docs/ls.md"]` ⇒ 首行 `DOC-CHECK GATE: PASS`。`git diff --stat` 改动集 ⊆ 上述三组的并集 | 首行非 `PASS` 即红；出现三组之外的档即红（表外补档 = 未经裁定的改动面） |
| A6 | 副作用与权限句一条不丢（六要素 ④） | `node` 逐档跑 ④ 类线索正则（`destructive\|permission\|approv\|confirm\|readonly\|side effect`）：域 = 8 档具名（`git` ∥ `write` ∥ `edit` ∥ `delete` ∥ `apply_patch` ∥ `execute` ∥ `browser` ∥ `ssh`），改前逐档实读 = 1 · 1 · 1 · 2 · 1 · 1 · 2 · 1（全 ≥1 ⇒ 能红）；对照样本 `thincoder-core/tool-docs/ls.md` 同一命令 ⇒ **0**（证明这条探针印得出 0） | 任一档改后 = 0 即红（那条 ④ 句被删或被并掉） |
| A7 | 描述面语言统一为英文 | `node` 逐档数非 ASCII 字符：7 档具名改前实读 = `ledger` 1,018 ∥ `team_ledger` 399 ∥ `batch` 298 ∥ `notify_parent` 33 ∥ `read_history` 123 ∥ `consult_start` 10 ∥ `consult_stop` 5（全 >0 ⇒ 能红）；改后只许剩判据字面值 `档缺` ∥ `节缺` ∥ `引缺` 与产品既有中文专名；其余 47 档读数只降不增 | 7 档任一剥除许可集后仍余非 ASCII 即红（判法见下「A7 许可集」）；其余 47 档同判 |

### A2 参数位尺 · 改前基线（父侧 2026-11-08 实跑；读数为那次运行的输出，D12）

**跑法（可复跑，cwd = 仓根）**：对 54 档逐档取 `git show HEAD:` 与现值，两侧各抽「参数位」词——行首 `- <name>` ∥ 行首 `- **<name>**` ∥ 行首 `<name>:` ∥ 反引号包裹的标识符——求「改前落在参数位、改后在任何形里都找不到」的差集。这验的是反方向：已写明的参数名不许消失。

**读数**：差集落在 8 档，逐档回读后**全部为误报，零个真丢失的参数名**。

| 档 | 差集里的词 | 逐档实读判 |
|---|---|---|
| `thincoder-core/tool-docs/batch.md` | `actions` | 散文里的 "two actions"，不是参数名 |
| `thincoder-core/tool-docs/browser.md` | `document.cookie` ∥ `timeoutMs` ∥ `fetch` | `timeoutMs` 仍在（`wait` 那句内联）；其余是散文 |
| `thincoder-core/tool-docs/doc_check.md` | 扩展名枚举 ∥ 占位名 ∥ `countContentLines` ∥ `DOC_CHECK_BUILTINS` | 正是本批要删的 I1/I2（判据词表与内部常量） |
| `thincoder-core/tool-docs/fetch.md` | `HTTPS_PROXY` | 随那句「config 与环境变量都会施加」的假话一并删的，删对了 |
| `thincoder-core/tool-docs/ssh.md` | `id_ed25519.pub` ∥ `promptPattern` | `promptPattern` 仍在（行首 `- promptPattern:`） |
| `thincoder-core/tool-docs/subagent.md` | `status` ∥ `freeze` | `freeze` 仍在（`panel` 那句里） |
| `thincoder-core/tool-docs/task.md` | `IMPORTANT` | 散文词 |
| `thincoder-core/tool-docs/write.md` | `edit` | 散文词 |

**结论**：**改后无一个已写明的参数名消失**。尺子能红——它在 8 档上确实印出了差集，绿的是逐档判读，不是探针失灵。反方向「schema 里有、描述里没写」仍是改前即缺的那几对（`git.workdir` ∥ `consult_start.models` 等），已由父侧立账，不属本批。

**不设的验收**：不带任何字符数阈值——本批不拿长度当判据（见 K4）。A7 只数非 ASCII，不数长度。

### A7 许可集（逐条 · 机判口径）

**判法**：把下表每个字面值从档文本里**悉数剥除**（最长优先），余下的非 ASCII 计数必须 = 0。判据不是「非 ASCII 变少」，是「剩下的每一个非 ASCII 都属于这里某一条」——读者据此看出哪几个字符是产品的、哪几个是漏翻的散文。

**本轮读数**：域 = `thincoder-core/tool-docs/` 54 档，`node` 实读**互异非 ASCII 串 79 个**，全部落在下表（剥除后余 0）。读数住本段（D12）；表本身是判据的闭集。

| 组 | 是什么 | 字面值（逐条） |
|---|---|---|
| ① | 排版与符号字符 | `—` `→` `⇒` `…` `·` `§` `≤` `≥` `≠` `±` `≈` `–` `①` `②` `✓` `✗` `│` `├──` `└──` `「` `」` `“` `”` `（` `）` `：` `。` `｜` |
| ② | 台账面 | `待讨论` `待设计` `在途` `待核销` `已核销` `已废弃` `归批` `条件` `认账不排期` `台账` |
| ③ | 批档面 | `状态行` `板块` `讨论来源` `编号` `轮次` `范围` `档` `不适用` `进行中` `已收口` `重开记录` `模板占位：` `「原批` `已收口，须另起批次接手」` `结论：通过` `结论：不通过` `需修改` `（评审子代理）` `上抛·待裁` `上抛·知会` |
| ④ | 机判输出 · 回执 · 产品名 | `档缺` `节缺` `引缺` `环引` `锚` `依据` `行号坐标` `无法定根` `（命中` `条）` `处` `会诊` `••••（` |

**最长优先的理由**：`档缺` 与散文里的单字 `档` 共享字符——先剥 `档缺` / `节缺` / `引缺` / `环引`，再剥 `档`，否则单字 `档` 会吃掉判据字面值的前半，余量读数随之虚高。

### 关键决策

| # | 决策 | 理由 |
|---|---|---|
| K1 | 界线住 `docs/core/design/TOOLS.md` §6.9，不新开档 | 工具描述写作契约已在那里；第二份同样的话 = D2 要治的两份活版本 |
| K2 | 用「是否改变调用 ∥ 结论」而不是「写给谁看」当界线 | 「写给谁看」两种读法都能自圆其说，不可判；前一句逐行可答 |
| K3 | 删前先落点，落点核不到就先补 | 删掉而没有落点 = 把知识扔了，且没人会发现 |
| K4 | 不设字符目标；**不以上限当理由** | 用户 2026-11-08 17:17 收回上限那条；拿一个用户决定不动的数当削的理由，等于替它背书 |
| K5 | 线索正则只排序、不作判据 | 正则漏报与「无 I 类」在外面长得一样；判据必须是 §6.9 的四类 |
| K6 | 54 档一把尺子一次落完，不分两批 | 分两批 ⇒ 两批之间的边界靠记忆，第二批会照第一批的残样抄 |

### 集成测试设计（自 `test/RTM.md` 起答）

`none` —— **破 0 行 · 冗 0 行 · 缺 0 行**。

- **破 0**：`node` 扫 `test/RTM.md` 全文找 `描述` ∥ `description` ∥ `tool-docs` ⇒ 零命中（本轮实跑）——没有一行断言工具描述文本，本批改的是文本内容，不改任何业务可观察结果。
- **冗 0**：本批不删、不改写任何既有行。
- **缺 0**：两条入口都不成立。① 产品真需要的业务场景：没有——模型读到的仍是同一批工具、同一批参数，调用面与回执零变（A5 的零 diff 面兜住）；② 生产真出现过的问题：没有——本批起因是「描述写给了实现者」这一读者面判断（2026-11-08 17:11 用户），不是线上故障。

本批的产物是「哪几行不该在描述里」，没有业务可观察面，只可机判为文本读数（A1–A7）。

### 边界（本批不做）

- 不改工具行为、不动 schema、不动 `description` 之外的任何代码。
- 不动 `docs/core/design/MANIFEST.md` 的上限条目与 `scripts/tool-schema-size.mjs`（用户 2026-11-08 17:17 收回）。
- 不动需求档、不动提示词面（`thincoder-core/prompts/` 全档）。
- 不补 A2 的 11 缺名对（「增」不属本批）。
- 不新增机检门：A1–A7 是验收命令，`doc_check` 判据一字不动。
- 语言面只做那 7 档的中→英；其余 47 档不加语言动作，不重写文案。

### UI / 交互决策

无界面面。可感面 = 模型每轮读到的描述文本，本批的「使用者」是模型；判据落在 A1–A7 与交付门。

### 上抛项

1. 〔知会 · 范围变更〕§1「两处要撤的自造物」整表作废：`docs/core/design/MANIFEST.md` 与 `scripts/tool-schema-size.mjs` 零改，本轮设计未引上限作判据（K4）。
2. 〔知会 · 语言面 · 用户已裁〕**描述面统一英文**（用户 2026-11-08「工具描述统一都是英文」），7 档本批中→英，其余 47 档本就是英文面。约束：`档缺` ∥ `节缺` ∥ `引缺` 是机判输出的字面值，照原样保留；散文一律英文（A7 判）。
3. 〔知会 · A2 的 11 缺名对〕这是「调用者需要的信息」当前就缺的一部分（不是本批删出来的）；本批判据 = 只降不增（A2），补齐与否请与 §5 一并看。
4. 〔待裁 · 落点深度〕`docs/core/design/DOC-DISCIPLINE.md` 的落点只核到三处，三族名剥除表与指针解析四腿**未逐条核**；处置已定 = A3 删前预检过不了就**停**（不跳过、不先删），那 30 档无预指落点者同此。仍开的是「该档能不能在不补内容的情况下承载」，请裁是否容许以「停」收尾。

### 第一波回流（实施席 §5 上抛 · 本席处置）

**① `docs/core/design/TOOLS.md` §6.24 ④ 与代码相反 ⇒ 已改。**
逐字面绑 `thincoder-core/agent-tools/batch.mjs`（机读契约）。

状态行面只拒三种：锚触该段 header 区**第一条**状态行 ∥ 替换**引入**状态行 ∥ 使该区状态行**变多**；**删多余副本允许**——一个段带两份状态行时机器读成「该段未设状态」，`status` 自己会拒，这个态的修复路径正是用 `edit` 删掉多余那行。

设计档不再要求描述档与 schema 同字节：同一份内容，写法随 §6.9 走。

**② `thincoder-core/tool-docs/doc_check.md` 的两句 = 调用者面 ⇒ 写回，设计档的两次要求原样保留。**
按 §6.9 一问判：指针解析面决定调用者写全路径还是写裸名、写完会不会被判 `档缺`（K2）；批档面豁免决定批档里能不能互引、以及回执里 `批档面互引未判 N 处` 那行读数是什么意思（K2 + K3）。

故 `docs/core/design/DOC-DISCIPLINE.md` §3.27 落点 7 与 §3.29 的「模型可见契约」**不改**；本段「逐档处置」表把这两句列入删除的那一格**随之作废**。下一波由实施席写回（`thincoder-core/tool-docs/` 不归本轮）。

逐字（`git show HEAD:thincoder-core/tool-docs/doc_check.md` 实读；落点 = 该档 `Anchors —` 那条 bullet）：

```text
A pointer resolves through these legs, in this order:

- the project root (full path);
- the pointing document's own directory;
- a repo this project declares under `index.publicRepos` (first segment = that repo's directory name);
- the unique-suffix fallback, reached only when the legs above find nothing — exactly one file in the repo whose path ends with the whole token.

A bare name resolves through the last-resort unique-suffix leg: while exactly one file in the repo carries that name it resolves and passes; with two or more, or none, it is judged 档缺.
```

```text
A pointer whose referring document and whose target both sit under a `docRoot.batches` root is not judged — `report` mode counts them as a reading and they never enter a verdict; a spec document pointing at the batch face is still judged.
```

**③ A2 基线更正（见上表 A2 行）。**
「11 对 / 9 档」是本段当时点到的样本，不是全域读数——漏了 `memory` 四对，那四对改前就缺；「8 对」是第一波 14 档的改前读数。两个数属两个扫描域，都不作口径；口径 = 同一命令、同一域、改前改后各跑一次。

**散文形骗过子串判，记一笔**：`thincoder-core/tool-docs/git.md` 的 `workdir` 只出现在 `clone` 那句散文里（`in the current workdir`），参数本身没交待；实读该档 `workdir` 在参数形里零命中。这类命中在 A2 下是绿、在「参数写到了」下是假——补不补属「增」，不在本批，由父侧立账。

**④ 逐字面裁定（§5「界线裁量」④ 请裁项）。**
§6.24 ④ 的逐字要求只绑 schema。描述档写同义、且段白名单已在同档下文逐条列出时，不算漏——描述档按 §6.9 随批重写，要它与 schema 同字节，等于把描述档钉成第二份 schema，正是 D2 要治的形状。

**⑤ 顺带收正的一处码档漂移（不属本批条目，同属两份活文本说法相反）**：`docs/core/design/DOC-DISCIPLINE.md` 原写 `doc_check` 的 `target`「可选——缺省 = 会话锚」，而 schema 的 `required` 实读 = `["target"]`、描述档写「required … Omitting it is refused」⇒ 改为**必填**。

### 收尾修正（设计席 · `unknownKeys` 一档两种说法）
**范围**：`docs/core/design/MANIFEST.md` 本档内同一机制两种说法 ⇒ 统一到实态。§5 第四波「发现的漂移」点名此档，本轮落地。

**实态（代码实读）**：`readAction` 的回执行集 = `state=` / `path=` / `manifest=` / `missingKeys=` / `errors=`。
`unknownKeys` 只进 `readManifest` / `validateManifest` 的返回值，另写一条 `logEvent('manifest:unknown-keys')`；不 `console.warn`、不上界面、不进回执。

**改的六处**：`readManifest` 条目 ∥ KD-M1-36 ∥ AC-38（另收正「四嵌套层」→ `docRoot` / `index` 两层）∥ AC-38 用例列 ∥ AC-40 ∥ T63。

**残留读数**：`grep unknownKeys` 该档命中 12 处，逐处看过 ⇒ **0 处旧说法**。
同档另两处「一行告警」属退役声明档机制（`declaration:retired-file`，`console.warn` + `logEvent` 实读在盘），不是本机制，未动。

**交付门**：`doc_check(mode:"gate")` 该档 ⇒ 首行 `DOC-CHECK GATE: PASS`。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 待处置 | `docs/core/design/TOOLS.md` §6.9 开篇「必含六要素，缺一补一」含「④ 副作用与权限（破坏性 / 外发 / 需确认标注）」；K1–K4 表只映射「（= 六要素 ①③）」∥ ② ∥ ⑤ ∥ ③，⑥ 由「六要素 ⑥ 是落地约束（四端取同一份档），不是内容项——它不进描述正文。」一句结掉，④ 全节无槽位；而 §2 条目 1 判定线「每档逐行可归入 K1–K4 之一；归 I1–I4 的行移出」 ⇒ ④ 类行不可判；§2 边界只护「参数默认值、边界、错误形、常见误用——」四样，A1–A5 无一断言 ④ 类行存活 |
| 2 | 🔴 | 待处置 | §2 A5 红侧「`git diff --stat` 改动集 ⊆ 55 档」对撞 K3「删前先落点，落点核不到就先补」与落点表「**核不到怎么办**：落点档不含该内容 ⇒ 先把内容补进机制档，再删描述（条目 3）。」；且上抛 ④ 自承「三族名剥除表与指针解析四腿**未逐条核**」＝ 最可能触发的正是这条补档径；受影响文件表只列 54 档 + `docs/core/design/TOOLS.md`，未列任何机制档 ⇒ 合规径使 A5 必红 |
| 3 | 🟡 | 待处置 | §2 A3 判法 = 「落点档 `grep` 该内容的关键词 ≥ 1」，是删后对账，无删前预检项 ⇒ 不能证明「删前先落点」 |
| 4 | 🟡 | 待处置 | 落点表「其余工具族」行 = 「表内「不触发」者无 I 类需迁，不核」，与本段「30 档」注「不等于「已判无 I 类」」并存；A1 域 = 「上表落点列去重」 ⇒ 那 30 档无 `existsSync` 面、亦无成文落点档名 |
| 5 | 🟡 | 待处置 | §2 条目 4 判定线「每档提到其 schema 全部顶层属性名（读数只降不增）」与 A2 自身读数「缺名对**不增**（改前实读 = **11 对 / 9 档**」互相否证 |
| 6 | 🟡 | 待处置 | `docs/core/design/TOOLS.md` §1 注「本档只收**实现面**与工具行为契约」vs §6.9 新节（工具描述文本的内容去留）；设计未提这句、亦未给不改的理由 |
| 7 | 🟡 | 待处置 | §2 与 §6.9 均无「最近先例」行（同档 §6.28 已有「**最近先例（三问式）**」一格） |
| 8 | 🟡 | 待处置 | §2 与 §6.9 均无调研证据行（同档 §6.28 已有「**调研证据行**」一格） |
| 9 | 🟡 | 待处置 | §2 集成测试设计 = 「`none` —— 改面 = 描述文本，不改任何业务可观察结果。」理由落在允许的那一条上，但未从 `test/RTM.md` 起答，无「破 0 / 冗 0 / 缺 0」的增量句 |
| 10 | 🟡 | 待处置 | A5 依赖 `doc_check(mode:"gate")` 对 55 档出首行 PASS；`docs/core/design/TOOLS.md` §6.7 记 doc_check 为「只读 · 报告态 · 非门禁——不阻断、不置退出码」、「参数 = `target`（可选）」——unverified（工具行为不在本轮范围） |
| 11 | 🟡 | 待处置 | §2 无测试计划节；分层结论「**单元测试档随批删**」预设测试档存在，而受影响文件表无任何测试档行 ⇒ 该档不成表内行、criterion 8 的分层结论落不到它 |
| 12 | 🔵 | 待处置 | `docs/core/design/TOOLS.md` §6.11「50 档随包发布」vs 本批域 54 档——数值漂移，未说明哪一数是活值 |
| 13 | 🔵 | 待处置 | §2「第 ③ 项（撤 5,000 自设帽 ∥ 8,000 降读数）作废」的编号与本节条目表第 3 行撞车，按号引用不可解析 |

VERDICT: changes-required
计数：🔴 2 · 🟡 9 · 🔵 2

### 轮次 2（评审子代理）

| # | 原# | 严重度 | 状态 | 证据 |
|---|---|---|---|---|
| 1 | 1 | 🔴 | 已修 | `docs/core/design/TOOLS.md` §6.9 的 K1 行现为「一句：拿它做什么、不拿它做什么、动了什么——破坏性 ∥ 外发 ∥ 需先过确认门（= 六要素 ①③④）」，并新增「**④ 不另立一行，但也不是可省句**」段；§2 条目 1 判定线补「（六要素 ④ 副作用与权限归 K1）」，条目 7 + A6 给逐档读数 |
| 2 | 2 | 🔴 | 已修 | A5 范围改为「54 档 + `docs/core/design/TOOLS.md` + 受影响文件表「机制档（落点补齐）」列的具名档」，红侧改为「出现三组之外的档即红（表外补档 = 未经裁定的改动面）」；受影响文件表已列出 11 档机制档 |
| 3 | 3 | 🟡 | 已修 | A3 拆为「删前预检 + 删后复核」，红侧「预检任一项 0 命中 ⇒ **停**（先补机制档，K3），不许先删」 |
| 4 | 4 | 🟡 | 接受 | 落点表末行写死「**本批不预指落点档名**」+「**补不动（没有可落的机制档）⇒ 停并上抛**」，A1 域改「「不触发」行不入域，其处置见落点表末行」——按上轮建议的第二条分支（判出 I 类即立机制节、补不动即停）闭合，30 档不再悬空 |
| 5 | 5 | 🟡 | 已修 | 条目 4 判定线改为「缺名对数**不增**——基线 = A2 的改前读数，本批不新增缺名（缺口本身不属本批）」 |
| 6 | 6 | 🟡 | 已修 | `docs/core/design/TOOLS.md` §1 注改三面分述：「**哪些行该进描述**（内容去留界线）= 本档 §6.9」，与 §6.9 实态一致 |
| 7 | 7 | 🟡 | 已修 | §6.9 增「**最近先例（三问式）**」（existing = `docs/core/design/PROMPT-SYSTEM.md` §6.11 ∥ 对齐 ∥ 偏离） |
| 8 | 8 | 🟡 | 已修 | §6.9 增「**调研证据行**」（`index.publicRepos` 实读 = `[]` + 仓内实读五处） |
| 9 | 9 | 🟡 | 已修 | §2 改「集成测试设计（自 `test/RTM.md` 起答）」并给「破 0 行 · 冗 0 行 · 缺 0 行」+ 零命中实跑 |
| 10 | 10 | 🟡 | 已修 | `docs/core/design/TOOLS.md` §6.7 的 doc_check 行改写为「`mode:"report"` 缺省 = 报告态非门禁，`mode:"gate"` = 交付门（首行 `DOC-CHECK GATE: PASS / REFUSED / ERROR`）」，A5 附实读命令形 |
| 11 | 11 | 🟡 | 已修 | §2 增「**测试计划**」段（零代码面 ⇒ 不产单元测试档）+ 受影响文件表「测试档 — **0**」；分层结论「本档 + 上表 11 档机制档」 |
| 12 | 12 | 🔵 | 已修 | `docs/core/design/TOOLS.md` §6.11 现为「54 档随包发布」，与本批域 54 一致 |
| 13 | 13 | 🔵 | 已修 | §2 范围变更段改指「§1「两处要撤的自造物」整表作废」，不再按号引用 |
| N1 | (new) | 🟡 | 待处置 | A6 域 = 「域 = 8 档具名（`git` ∥ `write` ∥ `edit` ∥ `delete` ∥ `apply_patch` ∥ `execute` ∥ `browser` ∥ `ssh`）」，该 8 档的派生规则未写；而逐档处置表的 `thincoder-core/tool-docs/memory.md` 行自带「保留「confirm 才执行」」= ④ 类句在域外无读数 |
| N2 | (new) | 🟡 | 待处置 | A7 红侧「7 档任一改后仍含成段中文散文（非 ASCII 计数超许可集）即红」的「许可集」全节未枚举（正文只写「判据字面值 `档缺` ∥ `节缺` ∥ `引缺` 与产品既有中文专名」）⇒ 该读数不可机判 |
| N3 | (new) | 🟡 | 待处置 | `docs/core/design/TOOLS.md` §6.7「参数 = `target`（必填）∥ `docs` ∥ `lines`（gate 拒收）」与 A5「命令形本轮实读：`docs:["thincoder-core/tool-docs/ls.md"]` ⇒ 首行 `DOC-CHECK GATE: PASS`」互否——**unverified**（工具行为不在本轮评审范围） |
| N4 | (new) | 🟡 | 待处置 | A5 的 gate 域现含 12 档设计档，而设计只记了一条单档实读（同 A5 行），无该域的改前基线 ⇒ 旧有命中即红，红因与本批改动无关 |

VERDICT: pass
计数：🔴 0（上轮 2 条均已修）· 上轮 🟡 9（8 修 · 1 接受）· 上轮 🔵 2（均修）· 本轮新增 🟡 4（均非必改）

## §4 用户批准（主 agent）

### 用户批准

**两条授权令（逐字）：**

- 17:16「**开.**」——批准开批。
- 17:11「**发给模型的工具描述能写这么长?!**」与 17:14「**你把所有这些工具描述都梳理一下,看看到底是怎么回事.**」——要的是「梳理清楚」，不是「砍到一个数」。

**用户同时划下的边界（本批全程照办）：**

- 17:17「**上限那个先不去了.**」——`docs/core/design/MANIFEST.md` 的 5,000 自设帽与 `scripts/tool-schema-size.mjs` 的 8,000「硬限」**一个字没动**，见 §1。
- 17:26「**工具描述统一都是英文**」——7 档中→英进本批（实施前已并入，见 §1 与 §2 语言面）。

**设计评审**：两轮 `changes-required` → `pass`（轮 2，0 红），见 §3。**实施在已过评审的设计上进行。**

**一句照实的**：**用户批准的是「梳理并重写」这件事与「不设长度目标」这条；§2 的 A1–A7 判据来自评审，不是来自用户。**两者不混成一句。

## §5 实施记录（eng-coder）
**状态行**：实施完成（第四波 13 档：5 档动笔（清单内）+ 1 档清单外同源更正（manifest.md）+ 8 档零改；A1–A7 读数齐、交付门 PASS；三处假话更正、五类缺口、三处漂移报父侧 · 2026-11-08）



### 实施记录 · 第一波（14 档）

**口径**：判据 = `docs/core/design/TOOLS.md` §6.9（K1–K4 留 ∥ I1–I4 删 ∥ 删前先有落点）。本段记读数与逐档处置，判据不复述（D2）。本波文件清单 = spawn 声明的 14 档；其余 40 档归后续波次，本段不认领。

#### 逐档处置

| 档 | 删（I 类） | 留（K 类要点） | 落点（删前实读 ≥1 命中） |
|---|---|---|---|
| `thincoder-core/tool-docs/doc_check.md` | 三族名剥除面与占位词干表、操作数名七名块、指针解析四腿与唯一后缀腿、引文连续子串判法、`DOC_CHECK_BUILTINS` 与 `countContentLines`、空范围判 ERROR 的政策解释 | 两模式各干什么 ∥ `target`/`mode`/`docs`/`lines` 的缺省与「`gate` 拒 `lines`」∥ 三条判据实态（锚 ∥ 段判据 ∥ 行号坐标，gate 计其正文面并在首行点名 `行号坐标 N 处`）∥ 首行 verdict 三串 ∥ 三命中类字面值 ∥ 段长逐类断段清单（K2：写出形态决定命中，非 I1）∥ 别接成 CI 门 | `docs/core/design/DOC-DISCIPLINE.md` |
| `thincoder-core/tool-docs/browser.md` | profile 目录与实例共享的程序叙述、逐动作超时预算、`[new]`/`[outside]` 的几何记录叙述、cookie 回读校验内部、实践段里与 Notes 重复的两条（pacing ∥ session 假设） | 十六动作各一句与参数缺省 ∥ `headless` 复用运行中实例即不生效 ∥ 审批门清单与免审清单 ∥ `[page] <url>` 出处标记与 `Error:` 形态 ∥ click 与 mouse 之别 ∥ 反爬那句「不许盲重试，报 URL 与墙型」（K4，见「裁量」③） | `docs/core/design/BROWSER-TOOL.md` |
| `thincoder-core/tool-docs/subagent.md` | 「Why delegate?」段、模式过滤的装配口径、池与调度机制解释、任务书参数的长解释 | 九动作各干什么 ∥ 角色枚举与工程面必需项（`designToken`/`designId`/`batchDoc`/`round`）∥ 任务书五参必填与拒绝形 ∥ 回执与上抛标记 ∥ 确认型问题不要发 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` ∥ `docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` |
| `thincoder-core/tool-docs/batch.md` | `edit` 六拒因逐条枚举、状态行保护与「多状态行会提升」的机制推演、「两条门只挂 append」的解释、doc_check 判据段（与 `doc_check.md` 重复的二段） | 六动作与参数 ∥ 谁写哪段（段白名单）∥ 拒绝形与 `Nothing was written.` ∥ §3 verdict 行与轮次戳 ∥ 文档门在写前跑、`ERROR` 挡收口 ∥ 骨架占位六字面 | `docs/core/design/BATCH-RECORD.md` |
| `thincoder-core/tool-docs/ssh.md` | 就绪四门判据、凭据档密文与加密机制叙述、判据来历 | 九动作与参数缺省（`promptPattern` 何时给）∥ 状态行与 `buffered` 结论 ∥ 审批门清单 ∥ 文件内容零入上下文 ∥ 单文件/无续传边界 | `docs/core/design/TOOLS.md` |
| `thincoder-core/tool-docs/manifest.md` | `writeManifest`/`initManifest` 与 writer 内部叙述、mtime 门控机制词 | 三动作 ∥ `target` 必填与工作区拒绝形 ∥ 14 可写节点每键一句与「整键写即拒」∥ 拒绝串形 | `docs/core/design/MANIFEST.md` |
| `thincoder-core/tool-docs/edit.md` | fuzzy 匹配的 90% 阈值与「哪几种引号归一」的枚举（归一后的结论留）、行号锚的判定谓词、`edits` 的降序应用过程 | `edits[]` 形状与互斥 ∥ 命中次数与拒文 ∥ 行号漂移拒文带路径+漂移量+两条下一步 ∥ 重读再改 | `docs/core/design/EDIT-HELPERS.md` |
| `thincoder-core/tool-docs/git.md` | 失败面的理由句（一句） | 动作枚举与 `ref`/`path` 语义 ∥ 破坏性动作先快照 ∥ 失败形 ∥ 非交互标志 | 不触发（只删理由句，事实全留） |
| `thincoder-core/tool-docs/bash.md` | 无（逐行判，`filter` 段已是 K2 形） | `command`/`timeout`/`async`/`filter` 与注入面 ∥ 三段包裹形 ∥ 别用 bash 读写文件 | 不触发 |
| `thincoder-core/tool-docs/wait_for.md` | 「discouraged」背后的两段理由（与该条 K4 句重复的复述）与一段实测叙述 | 条件形枚举 ∥ 满足/超时两句话 ∥ 阻塞调用不可并批 ∥ 「别用它等子代理」这条规则本身（K4，留在描述里） | 规则留在描述内；那段实测读数落本段「读数尺」下方（D12：读数不进规范面，见「裁量」④） |
| `thincoder-core/tool-docs/memory.md` | `maintain` 的鬼行 GC/压实/备份轮转实现叙述、索引档与索引行机制 | 六动作 ∥ `layer` 语义与三态 ∥ `confirm` 才执行（干跑缺省）∥ 删除的项目层/团队层后果 ∥ 回执 | `docs/core/design/MEMORY.md` |
| `thincoder-core/tool-docs/advisor.md` | 「令牌没有批档可收口」的理由从句、`object` 注入的机制措辞 | 两 `type` 与必填项 ∥ `documents` 解析与受理形 ∥ 池上限与同范围拒绝 ∥ 回执与 `verify` | `docs/core/design/ADVISOR-GUARDS.md` |
| `thincoder-core/tool-docs/apply_patch.md` | hunk 定位的逐条谓词（压缩为一条判法） | 多文件原子性 ∥ `patch` 形与 `/dev/null` ∥ 唯一匹配与歧义拒绝 ∥ 删档不支持 | 不触发 |
| `thincoder-core/tool-docs/execute.md` | 无（唯一线索命中是 `node --test` 用法，属 K4） | `code`/`scriptFile`/`nodeArgs`/`workdir`/`filter`/`timeoutMs` ∥ 输出与失败形 ∥ 不可逆提醒 | 不触发 |

#### 验收读数（跑法与结论；数字只在命令输出里，D12）

| # | 命令（cwd = 仓根） | 读数 | 结论 |
|---|---|---|---|
| A1 | `node` 逐档 `existsSync` 落点档去重 11 档 | 全 `true` | 过 |
| A2 | `node` 逐档比对 schema 顶层属性名 ⊆ 描述档文本（多变体取并集；**扫描域 = 本波 14 档**） | 改前 8 缺名对 → 改后 6 | 不增；反而少了 `subagent.recent` / `batch.prev` 两对（见「决定披露」②）。**与 §2 的 11 对对不上账**：§2 的 11 对是全域口径、且未含 `memory.content` / `memory.tags` / `memory.query` / `memory.limit` 四对（实读 `thincoder-core/tool-docs/memory.md` 全档零命中，`thincoder-core/memory` 的 schema 四者皆是顶层属性）⇒ §2 的名单不全，本波沿用「不增」判据，未增一对 |
| A3 | 删前预检：35 项逐项在落点档 `grep` 关键词 | 35/35 ≥1 命中，零项为 0 | 全项过才动笔；删后同命令复跑读数不变 |
| A4 | `node` 逐档跑线索读数（尺子见下「读数尺」） | 合计 102 → 82，逐档无一升 | 过 |
| A5 | `doc_check(mode:"gate", docs=[14 档])` | 第 1 轮 `REFUSED（8 段）` → 第 2 轮 `REFUSED（1 段）` → 第 3 轮 `PASS` | 过（红侧三轮实读，不是只跑绿侧） |
| A6 | `node` 逐档跑 ④ 类线索（`destructive\|permission\|approv\|confirm\|readonly\|side effect`） | `git` 1 · `write` 1 · `edit` 1 · `delete` 2 · `apply_patch` 1 · `execute` 1 · `browser` 2 · `ssh` 1，逐档与改前相等；对照 `ls` = 0 | 过；`ls` 印得出 0，说明这条探针不是恒真 |
| A7 | `node` 逐档数非 ASCII | `batch` 298 → 212（余下全是判据字面值与记录结构字面值）；其余 13 档只降不增 | 部分过：A7 的 7 档里本波只有 `batch` 一档在文件清单内，另 6 档归后续波次 |

**读数尺（D15：一条读数一把尺，此处点名）**：A4 用的尺 = 每档「模块档名（`*.mjs`/`*.cjs`/`*.js`/`*.json`）∪ camelCase 标识符 ∪ 带下划线常量名」的命中行数，改前改后同一把尺、同一命令。§2 表里的「标记读数 id∥path∥why∥impl」四列未附正则原文，本波不拿它当判据（K5），只作排序线索。

**体量（读数，不是目标）**：14 档合计 89,024 → 70,967 字符。这不是验收，A1–A7 里没有一条字符阈值（K4）。

#### 决定披露

① **两档零改**：`thincoder-core/tool-docs/bash.md` ∥ `thincoder-core/tool-docs/execute.md`——逐行按 §6.9 判，每行都落在 K1–K4，没有 I 类可删。§2 对这两档的预期本来就是「改动小或无」。`git.md` 只删了一句理由句。
② **两对缺名对顺手补上**：`subagent.md` 现写到 `recent`、`batch.md` 现写到 `prev`——这两个参数本来就在那两句要改写的句子里，重写时把参数名写进句子而已，没新增描述内容。A2 是「不增」判据，本次是降，不是升。
③ **`memory.md` 的落点填了 §2 没预指的档**：§2 落点表把 memory 记作「不触发」，但该档确有 I1（`maintain` 的实现叙述）。删前实读 `docs/core/design/MEMORY.md` 有 `maintain` 16 处、`VACUUM` 14 处 ⇒ 落点在盘，按 A3 放行。**该档本波零改**——落点是读它，不是写它（`git status --porcelain` 实读：`docs/core/design/MEMORY.md` 不在改动集里，本波改动全在 `thincoder-core/tool-docs/` 之下）。

#### 界线裁量（§2「删」列不是逐字清单——四处我按 §6.9 判了「留」）

§2 自己写了「下表的「删」是实施轮按界线逐行落笔的对象，不是逐字清单」。据此四处偏 §2 的字面、按 §6.9 的界线落了：

① **`thincoder-core/tool-docs/ssh.md` 的 `promptPattern` 默认识别行**：§2 列它入删；§6.9 K2 明写「缺省时真的发生什么」属调用者面，而那句正是缺省行为（不给就按行尾 `#` `>` `$` `%` 判提示符）。留；四门就绪判据照删。
② **`thincoder-core/tool-docs/git.md` 的 `config` 一句**：§2 列「`git -c` 覆写的用法叙述」入删。删的是「覆写」这层机制说法；`config` 收什么、作用于哪些动作（给不给它）属 K2，留。
③ **`thincoder-core/tool-docs/browser.md` 的反爬段**：§2 列「I4 反爬实测教训」。该档里没有事故叙述，只有「别盲重试，报 URL 与墙型」这一条判法——按一问（会不会改变下一个调用）属 K4，留；与之重复的 pacing 与 session 两条删。
④ **`thincoder-core/tool-docs/wait_for.md` 的理由段**：删的是与该条 K4 句重复的复述加一段实测读数；规则本身留。那段读数按 D12 不进规范面，记在这里：原描述写「一次会话里两次这样的等待约 4.5 分钟、约 210 次轮询，等的是已经在路上的报告」（原文如此，不是本轮实测）。

**要点回「按 §2 字面删」就说一声**——但删了 `promptPattern` 的缺省与 `config` 的作用面，调用者就只剩猜。
④ **`batch.md` 与 `docs/core/design/TOOLS.md` §6.24 ④ 的逐字要求有偏差**：该节要求描述面携带 `edit — replace one anchored range inside YOUR OWN section (§1–§6 alike; your identity decides which section) …` 一句。本波写成 `edit: replace one anchored range inside YOUR OWN section — …`（同义、少了 `(§1–§6 alike; …)` 那半句，因为段白名单已在下文逐条列出）。若那把「逐字」当机检面，这一处要对齐；请裁。

#### 发现的漂移（不在本席笔域，报父侧）

`docs/core/design/DOC-DISCIPLINE.md` 有一行写 `doc_check` 的 `target` 为「可选——缺省 = 会话锚」，而工具 schema 的 `required` 实读 = `["target"]`，描述档也写必填。两处说法相反，改设计档归 eng-designer。

#### 未做与不在本波

- 其余 40 档（含 A7 名单里的 `ledger` / `team_ledger` / `notify_parent` / `read_history` / `consult_start` / `consult_stop`）不在本波文件清单内，本波未动；A7 因此只到 1/7。
- 未新增任何机检门、未动 schema、未动 `description` 之外的代码（`git status --porcelain` 实读：本席改动全在 `thincoder-core/tool-docs/` 之下）。

#### 内部审计与评审轮次

**审计轮（explore · 读侧对设计）**：结论 `DIVERGENT`，4 项。

- ① `advisor.md` 的 `object` 注入句确实在 ⇒ 已删净（现文只留「optional; it declares what this review is about, and absent = no declaration」）。
- ② `browser.md` 的实践段里没有事故叙述，只有「别盲重试，报 URL 与墙型」这条判法 ⇒ 按一问判 K4 留，记法已改（见「界线裁量」③）。
- ③ `wait_for.md` 的落点记法已改：规则本身留在描述里（K4），删掉的是重复复述加一段读数（见「界线裁量」④）。
- ④ `docs/core/design/MEMORY.md` 被记成「本波写入」= **误读**。该档本波零改，只被读作落点（`git status --porcelain` 实读不在改动集）。
- 审计自陈的未核项 = 该装配无 `git` 工具、未能做 HEAD 对读。这一面由本席的 A2 / A4 / A6 / A7 实读补齐。

**评审轮 1（advisor · code，全域 12 档）**：结论 `changes-required` —— 🔴 2 · 🟡 4 · 🔵 6。

- 🔴 ① `batch.md` 状态行拒因写宽了（「any anchor or replacement that touches or introduces a `**状态行**：` line」），与本档第 15 行的修复路径自相矛盾，也与 schema 相反 ⇒ **已改**为「an anchor touching the section's **first** `**状态行**：` line, and any replacement that introduces a status line or leaves more of them than before. Deleting a surplus status line is allowed — that is the repair path for a section that reads as unset.」（依据 = `thincoder-core/agent-tools/batch.mjs` 的 `oldText` 描述逐字）。
- 🔴 ② `doc_check.md` 把 gate 的第三条判据降级成 report 面读数，又把「行宽」当成第三条 ⇒ **已改**为三条 = 锚 ∥ 段判据 ∥ 行号坐标，写明两模式都采集、`gate` 计其正文面、REFUSED 行点名 `行号坐标 N 处`（依据 = `thincoder-core/doc-check/index.mjs` 的「① 锚 / ② 段判据 / ③ 行号坐标」与「判据数 = **三**」，及 `if (bodyRefs) parts.push(...)`）。
- 🟡 ③ `edit.md` 残留的降序应用过程 ⇒ **已删**。
- 🟡 ④ A2 两个读数对不上账 ⇒ **已在本段 A2 行**写明扫描域与差异来源（§2 的 11 对未含 `memory` 四对）。
- 🟡 ⑤ `batch.md` 与 `docs/core/design/TOOLS.md` §6.24 ④ 的逐字要求偏差 ⇒ 见「决定披露」④，等裁。
- 🟡 ⑥ `docs/core/design/DOC-DISCIPLINE.md` §3.27 第 7 行与 §3.29 的「逐字目标形 · 落笔 = eng-coder」要求本档携带指针解析四腿句与批档面豁免句，而 §2 把这两句列入删除 ⇒ **两份活设计文本对「本档该写什么」相反**。本席不裁、按 §2 落笔（§2 后出且带用户令），请设计席收正设计档或点回。
- 🔵 ⑦ 四处未修、报父侧（都不在「只降不增」的射程内）：`thincoder-core/tool-docs/git.md` 无 `workdir` 参数说明（缺省 = 发现的项目仓根）· `thincoder-core/tool-docs/browser.md` 的 `steps` 夹取 2–50 与 `repeat` 缺省 0 未写（原档即缺）· `thincoder-core/tool-docs/wait_for.md` 的 `advisor settled` 与 `docs/core/design/TOOLS.md` §6.7「恒真 0ms 秒过」说法不一（属工具行为面）· `docs/core/design/TOOLS.md` §6.7 的 browser 行仍写「十六动作」，schema 实为 18。

**评审轮 2（advisor · code，只核 3 项修复声明）**：两个 🔴 与 🟡 ③ 均判已修，评审自己回读了 `thincoder-core/agent-tools/batch.mjs` 与 `thincoder-core/doc-check/index.mjs` 两侧。

- **仍开一项 must-fix，但不在本席笔域**：修复只落在描述档；`docs/core/design/TOOLS.md` §6.24 ④ 的 `edit` 参数说明行仍逐字要求那句已被证伪的宽拒因（同节 ⑤ E5 的场景标签同向，其拒串本轮未核 = `unverified`）⇒ 同一机制在两份活文档里说法相反。
- **建议改法**（一行表行，不动代码）：§6.24 ④ 的 `edit` 行改为「只拒：锚触该段 header 区**第一条**状态行 ∥ 替换引入状态行 ∥ 使该区状态行变多；删多余副本是允许的 = 双状态行的修复路径」，⑤ E5 标签与拒串同核。

**终态**：本波 14 档在**本席笔域内**收敛——两个 🔴 已修并复核，A1–A7 读数与交付门均过。唯一条未收口项属设计档笔域（`docs/core/design/TOOLS.md` §6.24 ④），按 D1 路由交父侧派 eng-designer，本席不动手。轮次合计：审计 1 轮 · 评审 2 轮 · 自查修正 3 轮（交付门 2 次 REFUSED → PASS，另有两处 🔴 与三处记法）。

### 实施记录 · 第二波（15 档）

**口径**：判据 = `docs/core/design/TOOLS.md` §6.9（K1–K4 留 ∥ I1–I4 删 ∥ 删前先有落点 ∥ 描述面英文）。本波文件清单 = spawn 声明的 15 档；判据不复述（D2）。第一波的 14 档已落地，本段不认领。

#### 逐档处置

| 档 | 删（I 类） | 留（K 类要点） | 落点（删前实读 ≥1 命中） |
|---|---|---|---|
| `thincoder-core/tool-docs/ledger.md` | 全中文散文（改英文）∥ `SQLite 行集`（I2 存储面）∥ `evidenceTooLong` 的 300 字阈值（I1 常量） | 六态与四条边逐边枚举 ∥ `task_book` 闸两臂 + 「不触不判」句 ∥ 五个 action 与参数缺省 ∥ `query` 行字段四读数 ∥ `count` 回执形 | `docs/core/design/LEDGER.md` |
| `thincoder-core/tool-docs/notify_parent.md` | 中英混排（改英文散文）∥ `send` 达效面的机制铺陈（压成一句） | `kind` 两值 ∥ 1,500 字符与 20 条队列上限 ∥ 两个标记字面值 ∥ 确认型问题不发（§2 留列有名，见「决定披露」②） | 不触发（无 I 类删除） |
| `thincoder-core/tool-docs/read_history.md` | 中文路由段（改英文）∥ `derived session index / session file itself` 取源叙述（I2）∥ `FTS` 词面（I2）∥ 50,000 / 200,000 双阈值（I1 常量） | 默认本会话 ∥ 过滤 AND 与 `path="all"` 的词/短语面 ∥ 回执 JSON 形与两个截断帽 ∥ `cwd:<dir>` / `all` 的覆盖边界 ∥ 七条路由 | `docs/core/design/SESSION.md` |
| `thincoder-core/tool-docs/websearch.md` | `(2026-08-31 ruling)` ×2（I4 来历）∥ 「各引擎并行」机制句（与 `engine` 参数句重复）∥ `providers[] entry with baseURL host api.deepseek.com` 探测谓词（I1）∥ `limit maps to count (1–20)`（I2 映射） | 后端链与 `websearch.backend: "local"` ∥ 五个参数与缺省（`limit` 8/20）∥ 回执形（DeepSeek 的 `date · authority · rerank`）∥ 弱引擎告警与 `fetch` 跟进 | `docs/core/design/PROXY.md` ∥ `docs/core/design/TOOLS.md` §6.23 |
| `thincoder-core/tool-docs/insert_after.md` | `it's equivalent to lines.splice(targetLine, 0, content)`（I2 算法）∥ 与首段重复的用法复述 | `after_line` / `after_regex` 二选一与「both given ⇒ after_line wins」∥ 正则须恰一行（多行报错并列行号）∥ 记账面拒文三要素 ∥ `ledger` / `project` 两参 | `docs/core/design/INSERT-AFTER.md` §2 |
| `thincoder-core/tool-docs/hashline_edit.md` | `SHA256(line_content).slice(0, 12)` 算法（I1/I2） | `old_hashes` 取法（`hashes=true`，12 位、单行/块两形）∥ 位置无关 ∥ 未命中回执带当前 hashes ∥ 替换即删的语义 ∥ 与 `insert_after` / `edit` 的分工 | `docs/core/design/HASHLINE-EDIT.md` §3 |
| `thincoder-core/tool-docs/question.md` | 无 I 类（三处「循环暂停 / 答案注入 / 回执」重复，并为一句 K3） | `question` / `options`（须纯字符串）∥ 回执与阻塞面 ∥ 一次一问 ∥ 短问题 ∥ 常规定夺回正文 ∥ `{{inject:question-ui-face}}` 原样 | 不触发 |
| `thincoder-core/tool-docs/delete.md` | 「a natural fuse」的取舍理由（I3），行为句「nothing recursive is ever removed」留下 | 跟踪档拒删与 `force` ∥ 只删空目录与 bottom-up ∥ 符号链接不跟随 ∥ 回执两形 ∥ 路由段 ∥ `ledger` / `project` | `docs/core/design/TOOLS.md` §6.21（「非空目录零通路（有意——保险丝）」） |
| `thincoder-core/tool-docs/timer.md` | `idle latch` / `step-boundary behavior` 机制词（I3） | 四式与互斥 ∥ `every` 下限 60 ∥ `at` / `daily` 过时点的行为 ∥ `cancel` / `list` ∥ 在挂 ≤ 8 ∥ 投递面（三端前台 + 挂起窗，headless 不支持 ∥ 用户轮不投递） | `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` |
| `thincoder-core/tool-docs/glob.md` | 无 I 类（`pattern` 长段按名拆成子项，逐字未删义） | 语法族与 `!` 排除形 ∥ 不支持的方言与 `glob error` 形 ∥ 跳过集 ∥ 1000 帽 ∥ 与 `grep` 的分工 | 不触发 |
| `thincoder-core/tool-docs/settings.md` | 敏感键全枚举压成「段看着像凭证（`apiKey`、`token` …）或落在 `headers` / `env` 段」（I1 词表 → K2 判法） | 三动作与 dot 路径 ∥ 落盘 + 热生效 + 跨重启 ∥ 类型校验的两种对照 ∥ `null` 清键、字符串键拒 `null` ∥ 未知键原样 ∥ 掩码回执 ∥ 审批门 | `docs/core/design/SETTINGS-TOOL.md` |
| `thincoder-core/tool-docs/read.md` | 无 I 类（重复句合并） | `path` / `filePath` 别名 ∥ `offset` / `limit`（2000）与截断标记形 ∥ `hashes` 与 `hashline_edit` 的配合 ∥ 四条路由 | 不触发 |
| `thincoder-core/tool-docs/verify.md` | 「mechanically gates」的过程措辞（I3），三出口结论留 | 不跑检查 ∥ `verification` 形与三值各自后果 ∥ `basis` 声明式、零机检 ∥ 报告附带的四件 ∥ 何时调 | `docs/core/design/VERIFY-REDESIGN.md` §1–§3 |
| `thincoder-core/tool-docs/grep.md` | 无 I 类删除（`merged / de-duplicated` 句按 §6.9 判为 K3 回执形：它决定你看到几行上下文；设计档内无落点，故留） | 七个参数与缺省 ∥ 跳过集 ∥ 200 帽 ∥ 二进制跳过 ∥ `:` / `-` 两种分隔符 ∥ 与 `glob` 的分工 | 不触发 |
| `thincoder-core/tool-docs/doc_check.md` | 无删除（本档只做 §2 回流 ② 的一笔写回，其余第一波已定） | 两模式 ∥ `target` / `mode` / `docs` / `lines` 与「`gate` 拒 `lines`」∥ 三条判据 ∥ 首行 verdict 三串 ∥ 指针解析四腿 + 裸名 + 批档面豁免 ∥ 四条误用 | 写回内容按 §2 回流 ②（落点 = 同档 `Anchors —` 条） |

#### 验收读数（跑法与结论；数字只在命令输出里，D12）

| # | 命令（cwd = 仓根） | 读数 | 结论 |
|---|---|---|---|
| A1 | `node` 逐档 `existsSync` 落点档去重 11 档 | 全 `true` | 过 |
| A2 | `node` 逐档比对 schema 顶层属性名 ⊆ 描述档文本（多变体取并集；域 = 本波 15 档；改前取 `git show HEAD:` 实读，不用记忆） | 缺名对 **6 → 6**，无一对新增缺失；缺的仍是 `ledger.cwd` / `ledger.title` / `ledger.req_doc` / `timer.message` / `read.allowExternal` / `verify.workdir` | 过（不增）；六个缺口经 HEAD 实读确认为改前即缺，按 §2「增不属本批」不补，报父侧立账 |
| A3 | 删前预检：逐项在落点档 `grep` 关键词；删后同命令复跑 | 13 组关键词全 ≥1 命中（`SQLite` 21 ∥ `EVIDENCE_TOO_LONG_MAX` 7 ∥ `splice` 1 ∥ `slice(0, 12)` 1 ∥ `FTS` 12 ∥ 50,000/200,000 2 ∥ `api.deepseek.com` 7 ∥ `保险丝` 1 ∥ step-boundary 18 ∥ `sensitive/apiKey` ≤3 ∥ `session index` 18 ∥ 机械裁定 17）；删后读数不变 | 全项过才动笔 |
| A4 | `node` 逐档跑线索读数（两把尺见下「A4 双尺」） | 实现坐标**出现次数**合计 26 → 25，逐档无一升；**行数**尺只有 `ledger` 3 → 5 上浮 | 过（出现次数尺）；行数尺的 +2 是拆段所致，见下 |
| A5 | `doc_check(mode:"gate", docs=[15 档])` | 第 1 轮 `REFUSED（6 段）` → 第 2 轮 `REFUSED（6 段，改后复测）` → 第 3 轮 `PASS` | 过（红侧两轮实读） |
| A6 | `node` 逐档跑 ④ 类线索（`destructive\|permission\|approv\|confirm\|readonly\|side effect`），域 = 8 档具名 | `git` 1→1 · `write` 1→1 · `edit` 1→1 · `delete` 2→2 · `apply_patch` 1→1 · `execute` 1→1 · `browser` 2→2 · `ssh` 1→1；对照 `ls` = 0 | 过（本波只动 `delete`，读数相等；对照印得出 0，探针非恒真） |
| A7 | `node` 逐档数非 ASCII | `ledger` 1,018→**174** ∥ `notify_parent` 33→**20** ∥ `read_history` 123→**8**；其余 12 档只降不增（`doc_check` 138→44 含第一波） | 过；余下非 ASCII 全是机判字面值（六态 ∥ `归批`/`条件`/`认账不排期` ∥ `old｜new` ∥ `[上抛·待裁]`/`[上抛·知会]` ∥ `••••（masked）` ∥ `档缺`/`节缺`/`引缺`/`行号坐标 N 处`/`无法定根`/`命中 K 条`），无成段中文散文 |

**A4 双尺（D15：一条读数一把尺，此处点名）**

- **出现次数尺** = 每档「模块档名（`*.mjs`/`*.cjs`/`*.js`/`*.json`）∪ camelCase 标识符 ∪ 带下划线常量名」的出现次数；改前 = `git show HEAD:` 同一命令实读。读数 26 → 25，逐档不升。
- **行数尺** = 上述三类命中的**行**数。`ledger` 3 → 5 上浮：把一整条 500 字长句拆成具名子项后，同一批标识符分散到五行，**内容零增**。
- 两尺打架的地方值得记一笔：拆段正是段判据的修法，行数尺把同一笔修改记成实现面上浮。判据以出现次数尺为准，行数尺读数一并留档。

**体量（读数，不是目标）**：15 档合计 37,998 → 32,034 字符（`doc_check` 一档占 14,380 → 5,694）。这不是验收，A1–A7 里没有一条字符阈值（K4）。

#### 决定披露

① **`doc_check.md` 的两段写回按 §2 回流 ② 落笔，标点用 ASCII 连字符**：设计席给的逐字含三处 em dash，本档沿用第一波已定的 ASCII 连字符（否则本档非 ASCII 读数上浮 +3，而它属「其余 47 档只降不增」）。**词句逐字未改**，改的只是破折号字形；第一轮评审指出的 `counts it … and they`（原句为 `counts them`）已改回逐字。

② **`notify_parent.md` 补了一句「确认型问题不发」**：§2 逐档处置表的留列逐字写着「K4 确认型问题不发」，而 `git show HEAD:` 实读该档无此句（同表其余留项均在）。按「§2 的留列 = 设计声明的目标态」补一句，属落实设计，不是新增文案；若父侧判它属「增」，删掉这一句即可，其余不留痕。

③ **`ledger.md` 的 `close` 写明 `status` 必填**：HEAD 原文只写「evidence … 缺省 = 判行值」，未交代 `status`；而 schema 实读 `required: ["status"]`、枚举 `{已核销, 已废弃}`，携 `batch` 时才可省。重写时按 schema 写准——这是把先前的漏项写对，不是新增机制。

④ **三档零 I 类删除**：`thincoder-core/tool-docs/question.md` ∥ `thincoder-core/tool-docs/glob.md` ∥ `thincoder-core/tool-docs/read.md`——逐行按 §6.9 判，每行都落在 K1–K4；`grep.md` 亦无删除（见下表）。§2 对这四档的预期本就是「改动小或无」。

#### 界线裁量（§2 的「删」列不是逐字清单——五处按 §6.9 判了「留」）

① **`thincoder-core/tool-docs/grep.md` 的 `overlapping context ranges … merged and de-duplicated`**：§2 列「I2 实现叙述」入删。按一问判：它决定你看到几行上下文（两次靠近的命中不会把上下文印两遍）= K3 回执形，不是内部坐标。

② **同上句的落点核查**：设计档内 `grep` 上下文行只有 §6.28 的「上下文行同标」一面，无该句落点（`docs/core/design/` 全域扫「去重 ∥ 合并 + 上下文行」零命中）。**落点核不到 ⇒ 不删**（§1 ②「核不到不是跳过，是停」），留在原处并记在本段。

③ **`thincoder-core/tool-docs/settings.md` 的敏感键词表**：§2 未点名，但按 §6.9 它属 I1（黑名单）。处理成「段看着像凭证（`apiKey`、`token` …）」——**保留判法、压掉全枚举**：调用者要判的是「我这一笔会不会被掩码」，全枚举不是他要背的表。落点 `docs/core/design/SETTINGS-TOOL.md`（含 `MASKED` 与键表）。

④ **`thincoder-core/tool-docs/websearch.md` 的 `(2026-08-31 ruling)`**：删的是日期这一层过程来历（D8：来历住 git，规范面不留日期戳）；**规则本身（config.json 代理不自动施加）不动**，落点 `docs/core/design/PROXY.md` 两处实读在盘。**日期字面在 `docs/core/design/` 全域零命中**——它本来就没有落点，属「不该在描述里的那半句」。

⑤ **`thincoder-core/tool-docs/timer.md` 的 `idle latch` / `step-boundary` 与 `ledger.md` 的 `超 300 字即算命中`**：删的都是机制词与阈值常量（I1/I3）；调用者结论（三端前台可用 ∥ headless 不支持 ∥ 用户轮不投递 ∥ 读数非门）一字不动。落点 `docs/core/design/AGENT-LOOP-ASYNC-POOL.md`（step-boundary 18 ∥ suspension 70）与 `docs/core/design/LEDGER.md`（逐字 `EVIDENCE_TOO_LONG_MAX = 300`）。

#### 发现的漂移（不在本席笔域，报父侧）

**`docs/core/design/TOOLS.md` 内有两处把改前的工具描述逐字复制成「文本面」块**，本波改写后与盘上现状不一致：

- §6.21 的 fenced 块标题写「`thincoder-core/tool-docs/delete.md`——全文改后逐字」，内容仍是旧文。
- §6.23 的同形块含旧 `websearch` 句「Backend priority: … or `limit maps to count (1–20)`」与旧首行。
- 同类一处：`docs/core/design/AGENT-LOOP-UPSTREAM.md` 的 `notify_parent`「建议逐字」块（标题即写「建议」，权威性弱于前两处）。

设计档归 eng-designer（D1），本席按「不动语义」只报不改。建议处置：三处块改为指向 `thincoder-core/tool-docs/` 的单源（D2：同一件事写两遍，第二遍必然漂），而不是逐字同步——否则每次改描述都要再来一遍。

#### 内部审计与评审轮次

**审计轮（explore · 读侧对设计）**：结论 `DIVERGENT`，0 blocker · 1 major · 4 minor。

- major（`read_history` 的「semantics per parameter」指不到本档哪儿）与另 3 项 minor（`ledger.add` 未点名 `title` / `question.options` 的 4 项上限 / `timer.message`）——**四项经 `git show HEAD:` 实读确认为改前即缺**（HEAD 版全文无 `title`/`req_doc`/`cwd`、无 options 上限、无 `message`），按 §2「增不属本批」不补，逐项报父侧立账。
- `notify_parent` 的「K4 确认型问题不发」——**采认并已补**（见决定披露 ②）。
- 审计自陈的未核项 = 该装配无 `git` 工具、仅有 2026-09 旧快照可读。这一面由本席的 HEAD 实读补齐（A2 / A4 / A7 全部以 `git show HEAD:` 为改前基线）。

**评审轮 1（advisor · code，15 档全域）**：结论 `pass` —— 🔴 0 · 🟡 4 · 🔵 1（另一条 🟡 属 §5 未落盘的协调项，本段即其处置）。

- 🟡 `ledger.md` 的 `close` 漏核销机检三件前置 ∥ 🟡 `ledger.add` 未点名必填 `title` ∥ 🟡 `doc_check.md` 的「Three hit classes」与代码四类（`环引` 同计「锚 N 条」）不符 → 三项均**HEAD 实读为改前即缺**，按本批边界不补、报父侧；**不改描述**。
- 🟡 `docs/core/design/TOOLS.md` §6.7 的 `doc_check` 要旨仍写「判据三条（锚 ∥ 段长 ∥ 行宽）」，与代码「判据三条 = 锚 ∥ 段判据 ∥ 行号坐标」相反 → 设计档笔域，转父侧派 eng-designer（见「发现的漂移」）。
- 🔵 `doc_check.md` 写回句数不一致 → **已改**为 §2 回流 ② 的逐字（`counts them`）。

**自查修正轮**：段判据 2 轮（6 段 → 0 段；把长句续行拆成具名子项）、`close` 的 `status` 与 `task_book` 闸两臂对码 1 轮、写回逐字对齐 1 轮。

**终态**：本波 15 档在**本席笔域内收敛**——A1–A7 读数齐、交付门 `PASS`、审计与评审的笔域内项全部处置。余下四项（`ledger` 三缺名 + `close` 前置、`question` 上限、`timer.message`、`doc_check` 的 `环引`）**全部经 HEAD 实读确认为「改前即缺」**，属 §2 明写的「增不属本批」，已逐项列入本段供父侧立账；另两项设计档漂移归 eng-designer。轮次合计：审计 1 轮 · 评审 1 轮 · 自查修正 4 轮。

**doc_check**：`DOC-CHECK GATE: PASS`（15 档，改后复跑两次）。

### 实施记录 · 第三波（13 档首改 + `thincoder-core/tool-docs/doc_check.md` 一笔更正）

**口径**：判据 = `docs/core/design/TOOLS.md` §6.9——K1–K4 留 ∥ I1–I4 删 ∥ 删前先有落点 ∥ 描述面英文 ∥ 第三刀「取值面 ∥ 取值算法」。本波文件清单 = spawn 声明的 14 档；前两波 29 档已落地，本段不认领。判据不复述（D2）。

#### 逐档处置

| 档 | 删（I 类） | 留（K 类要点） | 落点（删前实读 ≥1 命中） |
|---|---|---|---|
| consult_start.md | config 面机制叙述压成一句（`agent.consultModels` 装配口径） | K1 多模型独立并行 ∥ 非阻塞返回 consult id ∥ K3 判决文本自动到达（不轮询）∥ K4 停用即无摘要 ∥ K2 brief 三件 + 不贴原始日志 | `docs/core/design/CONSULTATION.md` |
| consult_stop.md | 无（逐行判全 K1/K3） | 中止未结算的 ∥ 已完成的不可撤 ∥ 回执两形 | 不触发 |
| read_image.md | I2 `base64-encoded` 载体叙述 ∥ I1/I4 四家视觉 API 名单与 400 毒化史 ∥ I3「spec-driven，not a hardcoded list」 | K1 看图的唯一通路 ∥ K2 `path` 必填、四格式、15MB 帽 ∥ K3 svg 返文本、bmp 拒并转 PNG ∥ K1 模型须支持图像输入 | `docs/core/design/PROVIDER.md` ∥ `docs/core/design/MODEL-SPECS.md` ∥ `docs/core/design/TOOLS.md` |
| write.md | 重复的「This overwrites the entire file — use edit」并入首条（K 行合并，非 I 删） | K1 全文覆盖 + 原子性 + 建父目录 + 写前确认 ∥ K2 `path`/`content` ∥ K3 回执三件 | 不触发 |
| fetch.md | I4 `(2026-08-31 ruling)` 日期来历 ∥ 一条与参数句自相矛盾的假话（见决定披露 ①） | K1 私网/元数据在外发前拒绝 ∥ K2 url 形 + `proxy` 逐次、不读 config 与环境 ∥ K3 DeepSeek/本地两形、一次重定向、15 秒、200000 帽 ∥ K2 `fetch.backend` | `docs/core/design/PROXY.md` |
| lint.md | I3「catches parse errors in milliseconds」 | K2 两参（`path` 缺省 = 最近改动档 ∥ `full` 缺省 false）+ 逐语言前置（TypeScript 工程档 ∥ Cargo 清单）∥ K3 五种回执形 ∥ K4 写完即 fast、交付前 full | `docs/core/design/TOOLS.md` §10.2 lint 行 |
| team_ledger.md | I2 传输面词（HTTP `400` ∥ `PATCH`）∥ 全中文散文改英文（用户 2026-11-08「工具描述统一都是英文」） | K1 服务端一本、与本机账独立、零离线副本 ∥ K2 五动作与参数边界（≤200 ∥ ≤4000 ∥ owner 缺省自己）∥ K2 六态迁移表逐边 ∥ K3 三态登录门 | `docs/core/design/TEAM-LEDGER.md` ∥ `docs/core/design/LEDGER.md` |
| lsp.md | 无（§2 记「I2 子命令实现叙述」，本档无实现坐标） | 五子命令各干什么 ∥ 四参数 ∥ 回执一句 | 不触发 |
| tree.md | 三处重复的回执叙述合并为一（K 行合并） | K1 跳过集 + 用途 ∥ K2 `path`/`depth`（缺省 3、max 6）∥ K3 目录先、双方排序、200 帽、树形字符 ∥ K4 与 ls/glob 分工 | 不触发 |
| task.md | K3 残句「(or the new item's ID on add)」（无 add 动作）∥ 不实措辞「silently dropped」 | K1 每次整表替换 ∥ K1 工程模式不可用（新增一句，见决定披露 ④）∥ K2 三态 + `title` 必填 ∥ K3 回执行 | `thincoder-core/agent-tools/task.mjs` ∥ `thincoder-core/agent/family-tools.mjs` |
| ls.md | 无（全 K） | 清单形 ∥ 两参 ∥ 500 帽 ∥ 与 glob 分工 | 不触发 |
| doc_search.md | 无（§2 记「I2 索引面实现叙述」，本档无） | 检索面 ∥ 回执五件 ∥ 两条路由 | 不触发 |
| goal.md | 无（§2 记「I3 理由句」，本档「machine-checkable proof, not vague effort」判 K2——见界线裁量 ②） | 四 action 与各自前置 ∥ 回执行 | 不触发 |
| doc_check.md | 一笔**更正**（非删减）：三条命中类 → 四条，补 `环引`，四类同计一个 `锚` 总数 | 两模式 ∥ 四参 ∥ 三条判据 ∥ 首行 verdict 三串 ∥ 四条误用 | 代码面（见决定披露 ②） |

#### 验收读数（cwd = 仓根；数字只在命令输出里，D12）

| # | 命令 | 读数 | 结论 |
|---|---|---|---|
| A1 | `node` 逐档 `existsSync` 落点档（本波用到 8 档去重） | 全 `true` | 过 |
| A2 | `node` 逐档比对「schema 顶层属性名 ⊆ 描述档文本」，改前 = `git show HEAD:` 实读，域 = 13 档 | 缺名对 **4 → 4**（`doc_search.query` ∥ `doc_search.limit` ∥ `goal.objective` ∥ `goal.criteria`），无一对新增 | 过（不增），但本读数不可单独作「参数写到了」的证据（见「缺口」第 2 条） |
| A3 | 删前预检：逐项在落点档 `grep` 关键词（13 项），删后同命令复跑 | 13/13 ≥1 命中（`base64` 5 ∥ `multimodal` 46 ∥ `read_image` 5 ∥ `svg` 1 ∥ `不自动施加` 2 ∥ `D-PX2` 1 ∥ `--check` 4 ∥ `team_ledger` 8 ∥ `待核销` 65 ∥ `已核销` 47 ∥ `consultModels` 4 ∥ `环引` 4 ∥ `ANCHOR_LABELS` 2）；删后不变 | 全项过才动笔 |
| A4 | `node` 逐档跑线索读数（尺 = 模块档名 ∪ camelCase ∪ 带下划线常量名的**出现次数**） | 合计 **12 → 8**，逐档无一升 | 过 |
| A5 | `doc_check(mode:"gate", docs=[14 档])` | 第 1 轮 `REFUSED（锚 1 条 · 2 段太长）` → 修正后 `PASS`（收正 4 处后再跑，仍 `PASS`） | 过（红侧实读，不是只跑绿侧） |
| A6 | `node` 逐档跑 ④ 类线索，域 = 本波含具名档者 | `write` 1→1 · `goal` 1→1；对照 `ls` = 0 | 过；探针印得出 0，非恒真（`write` 的绿由词形「confirm」挣得，见「缺口」第 4 条） |
| A7 | `node` 逐档数非 ASCII | `consult_start` 10→4 ∥ `team_ledger` 399→91 ∥ 其余 11 档只降不增（`doc_check` 44→44：新加的 2 个非 ASCII 是判据字面值 `环引`，由同段两处 em dash 换 ASCII 抵平） | 过 |

**体量（读数，不是目标）**：14 档 `git show HEAD:` 合计 24,492 → 16,804 字符；其中 `doc_check.md` 前两波已降到 5,694，本波 +149（更正）。**这不是验收**——A1–A7 无一条字符阈值（K4）。

#### 决定披露

① **`fetch.md` 删掉一条假话**：原文「Proxy support: set `"proxy": … in config.json or `HTTPS_PROXY` env var」与它上方两行的参数句（「config.json proxy is NOT auto-applied」）互相矛盾。实读 `thincoder-core/tools/web.mjs` 的 `const proxyUri = args.proxy ?? null` 与 `thincoder-core/tools/web-deepseek.mjs` 的同一形；`HTTPS_PROXY` 只出现在 `thincoder-core/proxy-target.mjs` 的 `resolveProxyConfig`，其活消费面 = `/config` 的 Test connection 探针（`docs/core/design/PROXY.md` 逐字）。改后写「config.json 与环境变量都不施加」，与代码一致。

② **`doc_check.md` 三→四 = 父侧点名的更正，改前错、改后与代码一致**：依据 `thincoder-core/doc-check/index.mjs` 的 `ANCHOR_LABELS = { 档缺: "锚·档缺", 节缺: "锚·节缺", 引缺: "锚·引缺", 环引: "锚·环引" }` 与 `thincoder-core/doc-check/anchors.mjs` 的「环与 `档缺` 同计「锚 N 条」，不新增判据条数、不新增 verdict 词」。`环引` 是仓级事实（无行号，报在声明档本身）。

③ **`tree.md` 的 `bin` 删掉**：`thincoder-core/skip-dirs.mjs` 逐字「`bin` **不列**：`thincoder-cli/bin/` 有 2 个 `.mjs` 是 CLI 入口、产品代码」。改前错、改后与单源一致。

④ **`task.md` 新增一句「Engineering mode: `task` is unavailable」**：父侧点名它是 K1（决定你能不能用），而 `git show HEAD:` 实读该档**无此句**。依据 = `thincoder-core/agent-tools/task.mjs` 的 execute 层拒 + `thincoder-core/agent/family-tools.mjs`「工程模式固定段 = plan / task 皆不入表」。按第二波 `notify_parent` 同款处置（落实设计，非新增文案）；若父侧判属「增」，删这一句即可。

⑤ **`write.md` 的 `project` 句：不选边，删掉取值形那半句**：HEAD 写「absolute path」，schema 单源 `PROJECT_PARAM_DESC`（`thincoder-core/tools/shared.mjs`）写「绝对路径，或相对会话 cwd」——两句在同一请求里同时给模型。本席无法从实现面证伪任一侧，故删掉取值形那半句（schema 已给），只留「项目根 = 带 `PROJECT-MANIFEST.json` 的目录」与触发条件。

⑥ **`task.md` 两处不实措辞收正**：「(or the new item's ID on add)」——本工具无 add 动作；「silently dropped」——实为带警告（`task.mjs` 的 `warningText` 拼进回执）。两处都是 HEAD 的错，改后与代码一致。

⑦ **`team_ledger.md` 迁移表按 `ALLOWED_MIGRATIONS` 补齐两条边**（`待讨论→在途` ∥ `待核销→在途`），并删掉「已归档不可改」（该 gate 不存在；`已核销→已废弃` 是合法边）。依据 = `thincoder-core/ledger-db.mjs` 的表逐字 + `docs/server/design/ledger/LEDGER.md` 的 KD-SV-141「状态机 ∥ 老化判据 = 沿本机台账逐字」。

#### 界线裁量

① **`task.md` 的 status 别名枚举保留**：它是 I1（白名单），但 A3 预检 `STATUS_ALIASES` ∥ `synonym` 在 `docs/core/design/` 全域零命中 ⇒ 落点核不到 ⇒ 不删（§1 ②「核不到不是跳过，是停」）。

② **`goal.md` 的「a machine-checkable proof, not vague effort」判 K2**：它是 `criteria` 的合格形（值不合形时拒），不是设计取舍；该档其余各行全 K。

③ **五档零改**：`consult_stop.md` ∥ `lsp.md` ∥ `ls.md` ∥ `doc_search.md` ∥ `goal.md`——逐行按 §6.9 判，每行都落在 K1–K4，无 I 类可删；与 §2「改动小或无」的预期一致。

#### 缺口（改前即缺 / 属「增」，本波未补）

1. **参数名改前即缺**（`git show HEAD:` 实读）：`doc_search.query` ∥ `doc_search.limit` ∥ `consult_start.models` ∥ `task.items` ∥ `goal.objective` ∥ `goal.criteria`。按 §2「增不属本批」未补，供父侧立账。
2. **A2 的子串盲区**：`consult_start.md` 含 `consultModels`，`models` 是其子串 ⇒ 机械扫描必然绿而参数并未写到。与 §2 已记的 `git.workdir` 同一形；改判法归父侧，本波不动。
3. **两处改前即缺的行为边界**：`read_image` 的 svg 截断（`MAX_SVG_CHARS`）与 `fetch` 的 `[fetch hint: …]` 收尾句。
4. **A6 在 `write.md` 的绿由词形「confirm」挣得**：「confirm you intend to rewrite it entirely」说的是模型自己的意图，不是 ④ 的确认门；真正承载 ④ 的是「overwrites the existing file」。读数相等不红，但探针与判句不同义，记一笔供父侧决定是否收紧 A6。

#### 内部审计与评审轮次

**审计轮（explore · 读侧对设计）**：`DIVERGENT`——1 major · 7 minor · 1 unverified；并自陈两项未核（该装配无 `git`/`bash`，改前基线核不到、`git status` 跑不了）。逐条处置：

- major：`task.md` 的「send every item you still want」为假（done 项只留最近 3 条、全表 20 帽）⇒ **已改**。
- minor 4 条已改：`tree.md` 的 `bin` ∥ `read_image.md` 的理由从句 ∥ `team_ledger.md` 迁移表 ∥ `doc_check.md` 的判据句。
- minor 2 条经 HEAD 实读判为改前即缺（`doc_search` 参数、`task.items`）⇒ 入「缺口」第 1 条。
- minor 1 条（§5 缺本波记录）⇒ 即本段。

**评审轮 1（advisor · code，14 档全域）**：`changes-required`，必改 3 · 建议 2 · 蓝 2。逐条处置：

- ① `consult_start.models` ∥ ② `doc_search` 参数 ∥ ⑤ `task.items`：经 `git show HEAD:` 实读**改前即缺**、非本波删出 ⇒ 按 §2「增不属本批」不补，入「缺口」第 1 条。
- ③ `write.md` 的 `project` 取值面矛盾：**已处置**（决定披露 ⑤）。
- ④「`write.md` 新增 `ledger`/`project` 两段 = 增」：**该项不成立**——`git show HEAD:thincoder-core/tool-docs/write.md` 实读两段均在，本波一字未改；评审所据的 `.wt-head-probe` 快照不等于 HEAD。
- ⑥ §5 缺本波记录 = 本段；⑦⑧ 已入「缺口」。

**自查修正轮**：段判据 1 轮（2 段 → 0 段）· 锚 `档缺` 1 轮（`lint.md` 的 `tsconfig.json` 被当指针，改写为「a TypeScript project config」）· A4/A7 抵平 1 轮（`doc_check` 的 `index.publicRepos` 与 em dash）· 审计与评审后收正 1 轮（4 处）。

**终态**：本波 14 档在**本席笔域内收敛**——A1–A7 读数齐、交付门 `PASS`（首轮 `REFUSED` 的红侧实读在案）、审计与评审的笔域内项全部处置。余下 4 类缺口均已点名，属改前即缺或「增」。轮次合计：审计 1 轮 · 评审 1 轮 · 自查修正 4 轮。

**doc_check**：`DOC-CHECK GATE: PASS`（14 档，改后连跑两次）。

**补记（缺口第 5 条）**：`task` 的截断口径改前即缺——`thincoder-core/agent-tools/task.mjs` 的 `[...pending, ...recentDone].slice(0, 20)` 与 done 只留最近 3 条；HEAD 与本波都未写进描述（属「增」，未补）。本波只删掉「send every item you still want」这句假话，截断本身仍是调用者看不见的行为，供父侧立账。

### 实施记录 · 第四波（13 档 · 收尾）

**口径**：判据 = `docs/core/design/TOOLS.md` §6.9（K1–K4 留 ∥ I1–I4 删 ∥ 删前先有落点 ∥ 描述面英文）。本波文件清单 = spawn 声明的 13 档；前三波已落地 43 档次（41 档 + `doc_check` 三次进场），本段不认领。判据不复述（D2）。
**本波形状**：13 档 182–1,260 字符（改前合计 7,995），属「逐行判后改动小」的一波：**5 档动笔（清单内）+ 1 档清单外同源更正**，8 档零改。

#### 逐档处置

| 档（前缀 `thincoder-core/tool-docs/`） | 删（I 类 ∥ 更正） | 留（K 类要点） | 落点（删前实读 ≥1 命中） |
|---|---|---|---|
| `thincoder-core/tool-docs/context.md` | I3 压缩链接线（「on the same chain as automatic compaction: same summary chain, same panel, same failure chain」）；K3 措辞「The receipt carries this session's record path」改成两分支都成立的结论句 | K1/K2 三动作各自的副作用差别（`compact` 改上下文 ∥ `prune` 丢内容不丢配对、可重跑）∥ `focus` 1–3 句 + 自动附任务/目标 ∥ 下一安全点、绝不半途切 ∥ 连续三次失败 ⇒ 确定性截断（后果句）∥ 错误形 | `docs/core/design/CONTEXT-COMPACTION.md`（预检 104 ∥ 22 ∥ 8） |
| `thincoder-core/tool-docs/process.md` | 无 I 类删除；回执一处更正（memory 列只在 Windows 有） | K2 四参（`action` 缺省 `list`；`pid` / `id` 二选一）∥ K3 list 逐行形、kill 一句确认 ∥ K1④ kill 破坏性 + 审批门 + 幂等 ∥ K4 路由 | 不触发 |
| `thincoder-core/tool-docs/manifest-read.md` | 假话一处（`unknownKeys` 行从不存在），非 I 类 | K1 权限差别（子代理变体只有 `read`，建档/改写归主 agent）∥ K2 `target` 必填与工作区拒绝形 ∥ K3 五态锚 + `missingKeys`/`errors` 两行 + 「不抛」 | 代码面（无 I 类迁移） |
| `thincoder-core/tool-docs/file_ops.md` | 假话一处（回执写 `->`，实为箭头）；与 schema 相反的取值形半句（`absolute path of`）删（D2：schema 已给） | K1/K2 三动作 + 三必填参 ∥ K1④ `dest` 覆盖、审批门 ∥ K4 建目录走 `write` / `bash mkdir` ∥ K3 回执一句或 `Error:` | 不触发（单源 = `thincoder-core/tools/shared.mjs`） |
| `thincoder-core/tool-docs/recent_changes.md` | 假话一处（追踪集漏 `apply_patch` / `hashline_edit`）；另按段判据拆成具名子项（逐字未删义） | K1 追踪集（= `FILE_MUTATORS` 六件）∥ K4 与本 run / `git status` 的区别、与 `read_history` 的分工 | 代码面 `thincoder-core/agent/helpers.mjs` |
| `thincoder-core/tool-docs/manifest.md`（清单外，见披露 ④） | 同一句 `unknownKeys` 假话 + 同一句 `project` 取值形 | 三动作逐条、14 节点每键一句、拒绝串形 | 代码面 `thincoder-core/agent-tools/manifest.mjs` |
| 零改 8 档：`thincoder-core/tool-docs/skill.md` ∥ `thincoder-core/tool-docs/plan.md` ∥ `thincoder-core/tool-docs/code_search.md` ∥ `thincoder-core/tool-docs/repo_outline.md` ∥ `thincoder-core/tool-docs/get_current_time.md` ∥ `thincoder-core/tool-docs/eng.md` ∥ `thincoder-core/tool-docs/main_history.md` ∥ `thincoder-core/tool-docs/peer_instances.md` | 逐行判后无 I 类可删 | 各自四样齐（`eng` 的状态机语义 ∥ `plan` 的只读面与批准链 ∥ `main_history` 的 60k 帽与裁剪注 ∥ `peer_instances` 四键回执与「不含自身」） | 不触发 |

#### 验收读数（cwd = 仓根；改前一律 `git show HEAD:` 实读，不用工作树快照）

| # | 命令 | 读数 | 结论 |
|---|---|---|---|
| A1 | `node` 逐档 `existsSync` 本波具名落点 | `docs/core/design/CONTEXT-COMPACTION.md` = true | 过 |
| A2 | `node` 逐档比对 schema 顶层属性名 ⊆ 描述档（域 = 13 档） | 缺名对 **5 → 5**（`plan.action` ∥ `code_search.query` ∥ `code_search.limit` ∥ `eng.action` ∥ `main_history.limit`），无一对新增 | 过（不增） |
| A3 | 删前预检 + 删后同命令复跑（3 组关键词） | 104 ∥ 22 ∥ 8 → 删后 **104 ∥ 22 ∥ 8**（不变） | 全项过才动笔 |
| A4 | `node` 逐档跑线索尺（模块档名 ∪ camelCase ∪ 带下划线常量名的出现次数） | 合计 **8 → 7**，逐档无一升（`manifest-read` 6→5 来自删 `unknownKeys`） | 过 |
| A5 | `doc_check(mode:"gate", docs=[13 档 + `thincoder-core/tool-docs/manifest.md`])` | 首轮 **`REFUSED（1 段文字太长）`**（改写后的 `recent_changes.md` 首段撞段判据）→ 拆成具名子项 → `PASS`（连跑三次） | 过（红侧实读在案） |
| A6 | `node` 逐档跑 ④ 类线索，域 = 8 档具名 + 对照 `ls` | `git` 1 · `write` 1 · `edit` 1 · `delete` 2 · `apply_patch` 1 · `execute` 1 · `browser` 2 · `ssh` 1；对照 `ls` = 0 | 过，但本波对这 8 档零改 ⇒ 构造即绿，不作本波证据（披露 ⑤） |
| A7 | `node` 逐档数非 ASCII（域 = 13 档） | `context` 8→7 ∥ `recent_changes` 1→0 ∥ 其余 11 档相等；无一升 | 过（本波无中文散文，语言面动作在前两波已落） |

**体量（读数，不是目标）**：13 档 7,995 → 8,106 字符，**本波净增**（`process` +30 ∥ `recent_changes` +54 ∥ `file_ops` +58 ∥ `context` −17）。A1–A7 无一条字符阈值（K4），净增不违约。

#### 决定披露

① **三处改前就是假话，已更正**：
- `unknownKeys` 行从不存在——`thincoder-core/agent-tools/manifest.mjs` 的 `readAction` 只 push `manifest=` / `missingKeys=` / `errors=`；`unknownKeys` 全仓只在 `validateManifest` 返回值与 `logEvent("manifest:unknown-keys", …)` 出现，任何回执都不印它（`**/*.mjs` 递归实扫；`*.mjs` 不递归会假报零命中——本席先踩过这一脚）。
- 回执分隔符：码面是 `` return `${verb} ${source} → ${dest}` ``（U+2192），档面原写 `->`。改为描述式「separated by an arrow」（引 `→` 会让本档非 ASCII +1 撞 A7，见评审蓝项）。
- `recent_changes` 追踪集：单源 = `FILE_MUTATORS = new Set(["write", "edit", "insert_after", "apply_patch", "delete", "hashline_edit"])`，原档只写四件，漏 `apply_patch` / `hashline_edit`。
② **`process` 的 list 回执**：原写「name / PID / memory」，而 `listPosix` 的 `mem` 恒空串——memory 只在 Windows 有。改为「one line per process (name / PID, plus memory on Windows)」。
③ **`process` 的 `(taskkill /T /F on win32; POSIX group kill)` 判 K3 保留**：评审判它是 I2（OS 调用 = 怎么走到那个答案）。驳回依据 = 回执本身逐字印这句（`ops.mjs` 的 `` `killed process tree ${Number(pid)} (taskkill /T /F on win32; POSIX group kill)` ``）⇒ 描述与回执一致，属回执形；又 A4 的尺看不见 OS 命令词，绿不等于已判无 I2，故记在案而非照删。
④ **清单外改动 1 档：`thincoder-core/tool-docs/manifest.md`**。理由：`unknownKeys` 与 `project` 取值形两句与本波 `manifest-read.md` 是**同一句的两次出现**，只改一份就留一份假话（D2 要治的正是这个）。该档属 §2 的 54 档产品文本面、在 A5 改动集内，但不在本 spawn 的 13 档清单里——照实披露。
⑤ **A6 在本波构造即绿**：其域 = 8 档具名，本波一档未动；只作回归确认（`ls` = 0 证明探针非恒真），不算本波证据。
⑥ **`project` 取值形按第三波 `write.md` 先例处置**：schema 单源 `PROJECT_PARAM_DESC` 逐字「（绝对路径，或相对会话 cwd）」，档面写「absolute path」——两份活文本在同一请求里发给模型、说法相反（评审 🟡）。处置 = 删档面取值形半句（schema 已给），`file_ops.md` / `manifest.md` 一并对齐。

#### 缺口（改前即缺 ∥ 属「增」，本波未补，供父侧立账）

1. 参数名改前即缺（A2 的 5 对）：`plan.action` ∥ `code_search.query` ∥ `code_search.limit` ∥ `eng.action` ∥ `main_history.limit`。
2. `thincoder-core/tool-docs/recent_changes.md` 的 **K3 整样缺**：实返 `Touched N file(s) this run:` + 每行绝对路径，空态 `(no files modified in this run yet)`；描述里一个字的回执形都没有（评审 🟡）。
3. `thincoder-core/tool-docs/eng.md` 缺**拒面**：`enter` 可被拒（`Error: cannot enter engineering mode — <原因> (mode unchanged)`），档面只写「Returns the mode state」。
4. `thincoder-core/tool-docs/skill.md` 缺 **dedup 面**：同名 skill 二次 `load` 返「already loaded … Do not reload it」而非重载。
5. `thincoder-core/tool-docs/manifest-read.md` / `manifest.md` 的「Never throws」宽了：`target` 必填、只读变体拒非 `read` 动作，两处都抛（评审蓝项，未改：改前即有、两档同句，改动面留父侧裁）。

#### 发现的漂移（不在本席笔域，报父侧）

- **`docs/core/design/MANIFEST.md` 三处仍写 `unknownKeys` 行**，与本波已更正的描述面和代码相反（该档 `read` 动作条目、逐字文本面块、T63 用例行）。归 eng-designer。
- **`thincoder-core/manifest.mjs` 的一行注释**写「只写诊断日志，`manifest read` 时才出现在结果里」——与 `thincoder-core/agent-tools/manifest.mjs` 的 `readAction` 相反（它不印）。代码面，不属本批改动面。
- **`docs/batches/2026-11-08-tool-desc-trim.md` §2 的 `manifest.md` 行**写「全 12 键各一句」，而盘上档面与代码都是 **14 个可写节点**（§5 第一波已写对）。按号引用不可解析，归设计席。

#### 内部审计与评审轮次

**审计轮（explore · 读侧对设计）**：`DIVERGENT`——0 blocker · 1 major · 3 minor。
- major：`docs/core/design/MANIFEST.md` 三处 `unknownKeys` 与代码相反 ⇒ 采认，入「发现的漂移」。
- minor ① `process.md` 的 OS 调用括号 = I2 ⇒ **驳回并记录**（披露 ③）。
- minor ② `file_ops.md` 回执分隔符被描述而非逐字引 ⇒ 采认，已改为「separated by an arrow」；「引 `→` + 把产品字面值排除出 A7」属判据面，留父侧。
- minor ③ 口径「13 档 / 6 档动笔」把清单外的 `manifest.md` 算进去了 ⇒ 采认，本段口径改为「5 档清单内 + 1 档清单外」。
- 审计自陈未核 = 无 `git` / `bash`，HEAD 对读核不到。该面由本席 `git show HEAD:` 基线补齐（A2 / A4 / A7 的改前值全部取 HEAD）。

**评审轮 1（advisor · code，6 档全域）**：`pass` —— 🔴 0 · 🟡 3 · 🔵 5。
- 🟡 `file_ops.md` / `manifest.md` 的 `project` 取值形与 schema 相反 ⇒ **已改**（披露 ⑥）。
- 🟡 `context.md` 的「The receipt carries this session's record path」只在槽绑定支成立（未绑定支给的是 `read_history path="cwd:…"` 发现形）⇒ **已改**为两分支都成立的「The receipt tells you where the full record is, with the `read_history` call that retrieves it」。
- 🟡 `recent_changes.md` 缺 K3 ⇒ 采认，属「增」未补，入「缺口」第 2 条。
- 🔵 `manifest-read.md` / `manifest.md` 的「Never throws」⇒ 入「缺口」第 5 条（未改）。
- 🔵 `process.md` 的 `pid` / `id` 类型未写、`bash#N` 记法与 number schema 不一 ⇒ 入「缺口」（未改，属「增」）。
- 🔵 `process.md` 的 OS 调用 = I2 残留 ⇒ **驳回**（披露 ③）。
- 🔵 §2 的「12 键」⇒ 「发现的漂移」第 3 条。
- 🔵 `file_ops.md` 分隔符按描述给 ⇒ 同 minor ②（判据面留父侧）。

**自查修正轮**：段判据 2 轮（`recent_changes.md` 一整段拆成首句 + 三条 + 路由句，`REFUSED` → `PASS`）；`file_ops.md` 的 em dash 撞 A7 +1 ⇒ 换 ASCII 标点 1 轮；`project` 取值形两档对齐 1 轮。

**终态**：本波 13 档在**本席笔域内收敛**——13 档逐行判完（5 档动笔 ∥ 8 档零改），清单外 1 档同源更正并披露；A1–A7 读数齐、交付门 `PASS`；审计与评审的笔域内项全部处置。余下 5 类缺口均为「改前即缺」或「增」，3 处设计/代码面漂移归父侧路由。轮次合计：审计 1 轮 · 评审 1 轮 · 自查修正 3 轮。

**doc_check**：`DOC-CHECK GATE: PASS`（14 档，改后复跑三次；首轮 `REFUSED` 的红侧实读在案）。

## §6 验证与收口（父代理）

### 验证与收口

**范围（54 档，四波交付）**：39 档实改 ∥ 15 档逐行判后零改。

**零改不是没干活**：`bash` ∥ `execute` ∥ `consult_stop` ∥ `lsp` ∥ `ls` ∥ `doc_search` ∥ `goal` ∥ `skill` ∥ `plan` ∥ `code_search` ∥ `repo_outline` ∥ `get_current_time` ∥ `eng` ∥ `main_history` ∥ `peer_instances` —— 逐行按 §6.9 判过，K1–K4 齐、无 I 类可删。

**体量（读数，不是目标）**：`130,749 → 117,513` 字符，净减 13,236（-10.1%）。

**这个数不能当成效读**：`ledger` 2,071 → 4,429、`team_ledger` 783 → 1,913 是**中文改英文**；中文一字≈一 token，英文≈四字符一 token，**字符涨而 token 降**。本批全程无字符阈值。

**父侧终验（本轮实跑）**：

```
doc_check(mode:"gate", docs=[TOOLS ∥ MANIFEST ∥ DOC-DISCIPLINE ∥ AGENT-LOOP-UPSTREAM ∥ 本批档])
  ⇒ DOC-CHECK GATE: PASS   0 段有问题（5 档全清）

node scripts/prompt-refs-check.mjs
  ⇒ OK(prompt-refs): J1/J2/J3 三式零命中（提示词面 71 档 · 代码面 489 档 · 命中 0）

越界检查：git status 中 thincoder-core 面除 tool-docs/ 外零改动
```

**A2 参数位尺（父侧补跑）**：54 档逐档取 `git show HEAD:` 与现值，抽四种参数位形，求「改前有、改后任何形都没有」的差集 ⇒ 8 档有差集，**逐档实读全部误报、零真丢失**。详见 §2「A2 参数位尺 · 改前基线」。

### 本批真正的产出：11 处「写的是假话」

**这不是长度问题，是错。**逐条都在四波报告里带代码实读。

| 档 | 改前写的 | 实际 |
|---|---|---|
| `thincoder-core/tool-docs/doc_check.md` | 「Three hit classes」 | 四类（漏 `环引`，四类同计「锚 N 条」） |
| `thincoder-core/tool-docs/fetch.md` | config 代理 ∥ `HTTPS_PROXY` 会施加 | `web.mjs` 实读 `args.proxy ?? null`，两者都不施加 |
| `thincoder-core/tool-docs/tree.md` | 跳过 `bin` | `skip-dirs.mjs` 逐字「`bin` 不列」 |
| `thincoder-core/tool-docs/recent_changes.md` | 追踪四件 | `FILE_MUTATORS` 六件 |
| `thincoder-core/tool-docs/file_ops.md` | 回执 `->` | 码面 `→`（U+2192） |
| `thincoder-core/tool-docs/process.md` | `list` 有 memory 列 | POSIX 恒空 |
| `thincoder-core/tool-docs/manifest.md` ∥ `manifest-read.md` | `unknownKeys` 行会印 | 只在返回值与诊断日志 |
| `thincoder-core/tool-docs/team_ledger.md` | 迁移表 | 少两条边、多一个不存在的「已归档不可改」门 |
| `thincoder-core/tool-docs/task.md` | 残句「(or the new item's ID on add)」 | 无 `add` 动作 |
| `thincoder-core/tool-docs/write.md` | `project` 句 | 与 schema 相反 |

### 设计档随正（6 份，全部由 eng-designer 落）

- `docs/core/design/TOOLS.md`：§6.7 `doc_check` 判据三条四类 ∥ `browser` 十六→十八动作 ∥ §6.9 第三刀「取值面 ∥ 取值算法」∥ §6.21 §6.23 逐字副本改指单源 ∥ §6.24 ④ 按代码实态并删历史半句
- `docs/core/design/MANIFEST.md`：`unknownKeys` 说法统一到实态（6 处）∥ 「12 键」→ 14 个可写节点 ∥ 「四嵌套层」→ 两层
- `docs/core/design/DOC-DISCIPLINE.md`：`target` 可选 → 必填
- `docs/core/design/AGENT-LOOP-UPSTREAM.md`：`notify_parent` 逐字块改指单源
- 本批档 §2：A2 参数位尺 ∥ A7 许可集逐条 ∥ A6 ④ 类句

### 两把尺子被换掉（本批的方法学产出）

**A2 的尺**：子串 → 「参数位」（行首 `- name` ∥ 反引号 ∥ 行首 `name:`；句中散文不算）。

**词边界是错的**：设计席实跑红侧证明 `models` ∥ `workdir` 在散文里就是整词，`\b` 判不出来。**问题不是子串，是位置。**

**A7 的判法**：从「非 ASCII 只降不增」改成「许可集剥除后必须余 0」。**目的一致、判法相反**。

原判法会把产品回执字面值（`→` ∥ `••••（` ∥ 树形 `├──`）当成违例，逼实施席把真实字符写成描述式。**A7 治的是「散文该英文」，不是「机器输出该英文」。**

### 收口对账

- **§2 ↔ 设计档**：判据单源 = `docs/core/design/TOOLS.md` §6.9；§2 只引 §6.9 与 A1–A7，不重述读数。
- **§2 ↔ §5**：四波 §5 的读数与父侧复核一致；`A2` 已按新尺补跑并记进 §2。
- **前批遗留**：无。`前情 = answer-check-docs（已收口 2026-11-08）`，两批改动面零交集。
- **修正轮落地前置**：设计侧 5 轮均已落地验过，门 `PASS` 后才进本段——#103 十三条 ∥ #111 三处设计档打架 ∥ #117 A2 尺与 A7 集与三档随正 ∥ #118 历史残留与 A2 基线 ∥ #119 MANIFEST 自相矛盾。
- **暂缓批复核**：无。
- **用户面同步**：**无界面**。工具描述是发给模型的文本；用户看到的是工具行为不变——`description` 之外的代码零 diff。
- **台账**：`#2201` 本条。脱出三条本批不做的（`#2202` ∥ `#2204` ∥ `#2205`，均为「描述面漏写，改前即缺」）。另有一条代码面残留待立账：`thincoder-core/manifest.mjs` 的 `warnUnknownKeys` 上方注释与 `readAction` 相反。

### 声明

**本批未获集成测试验证**：`thincoder-core` 无集成集（`node test/run.mjs` 原话「no integration test set … This run proves nothing」）。本批无单测档（只改文本），**唯一把关是上面三条命令 + 四波的 A1–A7 读数**。

**不做**：`#2202` ∥ `#2204` ∥ `#2205` —— 补描述面缺的参数名与回执形。**本批动作是「删」，补是「增」，同批两件事互相掩盖。**§2 已逐条点名。
