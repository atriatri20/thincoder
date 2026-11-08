# 2026-11-08 · pointer-residue-g
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 12:34「长尾批可以开批处理吧，一样逻辑也分分批，并发上限还有，不用限制四个」——G 簇：`docs/core/requirements` 余 13 档。
> 台账 = #2180（core · 归批）。前情 = docs/batches/2026-11-08-pointer-debt.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（13 档 18 处按父侧九批判法 R1–R6 逐处归队（R1 8 · R2 4 · R3 2 · R4 4）；红侧 18 已实测，段落 3 条不在本批）


### 本批条目（覆盖）

| # | 条目 | 覆盖 | 判据锚 |
|---|---|---|---|
| 1 | 13 档内「盘上同名候选」命中 ⇒ 按本档上下文择一，写成仓根全路径 | 覆盖 | AC-1 ∥ 三类判法 ① |
| 2 | 13 档内「单候选 ∧ 写法不成立」命中 ⇒ 先过上下文，主语与那份档的职责对不上即判不了 | 覆盖 | AC-1 ∥ 三类判法 ② |
| 3 | 13 档内「零候选」命中 ⇒ 按**需求层判定序**三分：现态句改指现档 ∥ 需求作废随句删 ∥ 历史事实行不动只报 | 覆盖 | AC-1 ∥ AC-2 ∥ 三类判法 ③ |
| 4 | 判不了的逐条列出（档 + token + 缺哪一条信息才判得了） | 覆盖 | AC-2 |
| 5 | 段落太长 3 处 ∥ 行号坐标 0 处 | **不在本批** | 边界 |

**条目 5 的依据**：台账 `#2174` 原文把这两面另计（「另一面的存量，与指针无关；扫到时另判」），父侧本轮任务书同样点名「段落 ∥ 行号 → 不在本批射程」。两处同判 ⇒ 本批射程只到锚面。

### 开批读数（量法一条 = 本仓引擎）

命令（本批 13 档一次传入；判定集兼解析集，**逐档分开跑的数不可比**）：

```text
node -e "import('./thincoder-core/doc-check/index.mjs').then(m=>{const r=m.runDocCheck(process.cwd(),{docs:[本批 13 档],mode:'gate'});console.log(r.report.split('\n')[0]);console.log(JSON.stringify(r.hits))})"
```

读数（本席 2026-11-08 12:4x 实跑，红侧）：

```text
DOC-CHECK GATE: REFUSED（锚 18 条 · 3 段文字太长，难于阅读）
hits = {"total":21,"anchors":18,"paragraph":3,"lineRefs":0}
```

逐档（按引擎 `sameName` 列长分桶：≥2 多候选 ∥ =1 单候选 ∥ =0 零候选）：

| 档（仓根全路径） | 锚 | 多候选 | 单候选 | 零候选 |
|---|---|---|---|---|
| `docs/core/requirements/TURN-CAP-CONTINUE.md` | 3 | 1 | 2 | 0 |
| `docs/core/requirements/ADVISOR-CONVERGENCE.md` | 2 | 0 | 0 | 2 |
| `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` | 2 | 1 | 0 | 1 |
| `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-MANIFEST.md` | 2 | 1 | 0 | 1 |
| `docs/core/requirements/AGENT-PARAMS.md` | 1 | 0 | 0 | 1 |
| `docs/core/requirements/CHECKPOINT.md` | 1 | 0 | 1 | 0 |
| `docs/core/requirements/CORE-UNIFICATION.md` | 1 | 0 | 1 | 0 |
| `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-TEST-DISCIPLINE.md` | 1 | 1 | 0 | 0 |
| `docs/core/requirements/PROJECT.md` | 1 | 0 | 0 | 1 |
| `docs/core/requirements/SEND-STALL-DISTILL.md` | 1 | 0 | 1 | 0 |
| `docs/core/requirements/TOOLS.md` | 1 | 0 | 0 | 1 |
| `docs/core/requirements/TRACES.md` | 1 | 1 | 0 | 0 |
| `docs/core/requirements/TWO-REPO-MERGE.md` | 1 | 0 | 0 | 1 |
| **合计** | **18** | **5** | **5** | **8** |

两根合计各自对得上：5 + 5 + 8 = 18 = `hits.anchors`；上表「锚」列之和 = 18。逐处明细（叶围栏）：

```text
档                                 行  桶       token                                                   同名候选
ADVISOR-CONVERGENCE.md             175 零候选   test/advisor-chain-guards.test.mjs                      0
ADVISOR-CONVERGENCE.md             183 零候选   src/agent/execute-tools.mjs                             0
AGENT-PARAMS.md                     29 零候选   thincoder-core/test/config.test.mjs                     0
CHECKPOINT.md                       74 单候选   thincoder-vscode/src/tools/git.mjs                      1
CORE-UNIFICATION.md                 60 单候选   thincoder-cli/src/memory/schema.mjs                     1
ENGINEERING-MODE-V2-SPEC-LEDGER.md  41 多候选   session-slots.mjs                                       3
ENGINEERING-MODE-V2-SPEC-LEDGER.md  63 零候选   docs/TODO-archive.md                                    0
ENGINEERING-MODE-V2-SPEC-MANIFEST.md 54 零候选  .thincoder/conventions.json                             0
ENGINEERING-MODE-V2-SPEC-MANIFEST.md 63 多候选  manifest.mjs                                            2
ENGINEERING-MODE-V2-SPEC-TEST-DISCIPLINE.md 29 多候选 package.json                                     20（封顶）
PROJECT.md                         131 零候选   Node.js                                                 0
SEND-STALL-DISTILL.md               19 单候选   thincoder-vscode/src/agent/run-stages.mjs               1
TOOLS.md                           120 零候选   test/tool-descriptions.test.mjs                         0
TRACES.md                            6 多候选   thincoder-cli/docs/README.md                           20（封顶）
TURN-CAP-CONTINUE.md                18 单候选   thincoder-vscode/src/agent-tools/subagent-run.mjs       1
TURN-CAP-CONTINUE.md                22 单候选   thincoder-vscode/src/agent-tools/consult.mjs            1
TURN-CAP-CONTINUE.md                25 多候选   checkpoint.mjs                                          2
TWO-REPO-MERGE.md                   49 零候选   thincoder-cli/docs/_archive/requirements/…              0
```

行号只作定位（本段是过程面一次记录，不作判据坐标）。

### 三类判法

**① 多候选（5 处）**：候选是盘上真有的同名档，缺的是目录段。按**本档上下文**择一，写成仓根全路径。择不出来 ⇒ 转条目 4。**不许取首个**。

**② 单候选（5 处）**：全仓恰一处同名，但写法不成立（带相对段 ∥ 首段缺目录）。要过两道：① 那一份**在盘**；② 句子主语与那份档的职责对得上。第二条不成立 ⇒ 判不了。理由 = 同名不同物在本仓已成片。

**③ 零候选（8 处）**：仓内没有这个名字。需求层的判法见下节——**不套设计档那一套**。

### 需求层专有的第三形（本批的主判断）

需求档里的一句话是「用户说过要什么」，不是「代码长什么样」。所以一个指向已不存在档案的名字，处置不是先看它能不能解析，先看**这句话还成不成立**。

判据一句：**这句话是不是在讲「现在系统怎么做」？**

- **是（现态句）** ⇒ 实现搬了家就改指现档的仓根全路径。
- **不是（历史记录 ∥ 判例 ∥ 引文 ∥ 当年归属）** ⇒ **不改**。改指会把历史事实改写成现状，下一轮读者会当成今天的实现。
- **需求已经作废** ⇒ 那条随指针一起删（需求档不留历史，历史在 git）。失效表述删、不标注。

依据 = 父侧本轮任务书逐字：「需求档里的话是「用户说过要什么」，不是「代码长什么样」…**这种不该改成新路径——那会把历史事实改写成现状**」。

**为什么这一形单列**：引擎不区分「指针」与「记着当年在哪的记录」，两者同形；而处置相反。按「让它变绿」去改这一类，是把文档改对了判据、改错了事实。

**已读盘的三处归类（本席实读原句，不推演）**：

- `docs/core/requirements/AGENT-PARAMS.md` 那一行自述「已随 2026-09-28 测试树全清退场，留名存档」——**它自己说了这是存档记录**，属「不改」，改指即删掉它自己在说的事。
- `docs/core/requirements/CORE-UNIFICATION.md` 那一行是**判例事实**（「当年 CLI 记忆面用 sqlite」），分叉早已按 A12 归一到核；属「不改或改叙述」，不改指现档。
- `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` 那一处是**边界句里点的一条项目文档约定**，不是指给谁看的指针；属「判不了 ⇒ 报」。

其余 15 处本席未逐句实读 ⇒ 实施侧按上面的判定序逐条定，**判不出的进清单，不硬凑**。

### 设计档落点

**本批不新建、不改任何设计档。** 判定规则的机制单源已在盘（`docs/core/design/PATH-RESOLUTION.md` 的解析链与第 6′ 步），本批不复制它；需求层那一条判法住 `docs/core/design/DOC-DISCIPLINE.md` 的档名纪律。**处置清单是一次性执行表，住 §2**——写进机制档会把那份单源降级成账本。

### 受影响文件与测试覆盖

改面 = 上表 13 档，全部在需求层 `docs/core/requirements/`；**零新增档、零删除档**。

**档位结论：无跨档、无越线。** 全 doc 面，不碰产品码 ∥ 设计档 ∥ 台账 ∥ `PROJECT-MANIFEST.json` ∥ 测试档；13 档行数均未越线（文档不计行预算）。

本批无运行面改动 ⇒ **无单元测试档**；验收 = 引擎读数（命令见上），读数进 §5。

### 验收对照（每条带命令；红侧已实测）

| # | 判据 | 判法 | 红侧（当刻实测） |
|---|---|---|---|
| AC-1 | 13 档 `hits.anchors` = 判不了清单条数（能清的全清到 0） | 同一条命令、同一份 13 档清单、同一支引擎一次跑 | 18（已实测） |
| AC-2 | 判不了清单逐条入 §5：档 + token + 缺哪一条信息 | 清单与残余 `anchorHits` 按「档 + token」配对 | 清单空 · 残余 18 |
| AC-3 | 零语义变更：只改指针形态；作废行的删除逐条在册（原句 ⇒ 处置） | 逐处「原文 → 改后」入 §5 | 未改 → 平凡成立 |
| AC-4 | 段落桶零变（3）· 行号坐标零变（0） | 同一次跑的两个计数器 | 3 · 0 |
| AC-5 | 判据可失败 | 红侧读数即上表 AC-1 那一条，改后必须与之不同 | 已取到 18 |
| AC-6 | 本记录自身过门 | `batch` 工具的 doc-check 回执首行 `DOC-CHECK GATE: PASS` | 追加时回执 |

**AC-1 为什么不能写成「`hits.total` = 0」**：本批 13 档里有 3 条段落命中属条目 5（不在本批），所以 `hits.total` 落地后读 **3**、gate 首行仍 `REFUSED`。把判据写成 `total` 归零 = 一条本批注定判不过的判据。**锚面归零才是本批的交付面**，段落那 3 条留在 `#2174` 的另一面上。

### 集成测试设计（RTM 差量）

本批零代码面、零业务可观察结果变更 ⇒ `test/RTM.md` **行零改**：无行被破坏、无行冗余、无行缺失。两个用例来源（业务场景 ∥ 生产问题）都不成立，故不新增集成用例，亦无单元测试档。

### 关键决策

**KD-1 判据的尺子 = 本仓引擎**（`thincoder-core/doc-check/index.mjs`），不是会话内的 `doc_check`——后者是全局旧构建，没有第 6′ 步。两把尺子的数不可比：拿旧构建的数当基线，会把已经绿的写成待办。本席只跑本仓引擎，会话内那支在本批 13 档上的读数**未取，不作判据**。

**KD-2 语义优先于变绿。** 被否：「凡是红的都补成能解析的全路径」。对「需求已作废」「历史记录」两类，补路径是给一条死需求续命。

**KD-3 单候选不自动认。** 被否：「全仓只有一份，就是它」。本仓同名不同物已成片，认错即把需求指到别的模块上，比留着红更坏。

**KD-4 执行表住 §2，不进机制档、不新开设计档。** 被否：把 18 条处置写进 `docs/core/design/PATH-RESOLUTION.md` 或另开一档。那是机制单源，装一次性清单会被下一批当现行规则读。

**KD-5 非仓内名的写法已由父侧统一裁定（R2 ∥ R5），本批照 R 行，不再挂着。** 依赖包内部件 ∥ 构建产物 ∥ 用户目录档 ∥ 运行期配置名 ∥ 专名 ⇒ **不带路径形态的叙述**（R2）；已删的测试 ∥ 探针件 ⇒ **角色叙述、不写档名**（R3）；站点仓件 `thincoder.com` 已声明 ⇒ 带前缀全形（R5）。被否：「把名字补成一条能解析的路径」——对上述几类补不成绿，只会把「写错了」固化成「指过了」。

### 边界

- **可以改**：上表 13 档。
- **不许动**：别的档 ∥ 产品码 ∥ 设计档 ∥ 台账 ∥ `PROJECT-MANIFEST.json` ∥ 本档 `§1` `§3` `§4` `§5` `§6`。
- **不做**：段落 ∥ 行号坐标两面（条目 5）。
- **不做**：`index.publicRepos` 的任何声明（manifest 面属主 agent）——撞到真跨仓指针时改叙述或报，不替它声明。

### 上抛项

**1〔知会〕gate 首行在本批落地后仍是 `REFUSED`**：段落 3 条属 `#2174` 的另一面。父侧给的「目标 hits 0」在本批只能到「锚 0」；要把首行变绿，需另开一轮动段落面（2 档、3 处，最长一处 532 字）。

**2〔已裁 · R2〕专名被当作档案名。** `docs/core/requirements/PROJECT.md` 的 `Node.js` 是运行时专名，引擎按扩展名把它当文件 token 判 `档缺`。父侧 2026-11-08 九批统一判法 R2 已定 ⇒ 写成不带路径形态的叙述（运行时名，不带扩展名）。本行原为待裁项，现已闭合。

**3〔知会〕同族 A–I 并发**：各簇读数只对本簇清单成立，拼不成整仓读数；本批 18 条与同族任何一批都不重叠。

### R1–R6 归队（九批共用判法；本批 18 处逐处落一行）

判法来源 = 父侧 2026-11-08 九批统一判法。写门与报告面是同一支尺子（都调 `runDocCheck`，`suffixFallback` 写死开着），但**单位是「段」**：段里剩一条红，整笔拒。需求层的判据仍是那一句——**这句话在讲「现在系统怎么做」吗？**

- **R1** 现态指针 ⇒ 仓根全路径
- **R2** 非仓内名 ⇒ 不带路径形态的叙述（用户目录档 ∥ 运行期配置名 ⇒ 说它在哪一类）
- **R3** 已删的测试 ∥ 探针件 ⇒ 角色叙述，不写档名
- **R4** 沿革 ∥ 历史段里的旧路径 ⇒ 叙述形（状态档不留历史）
- **R5** 站点仓件 ⇒ `thincoder.com` 已声明，写带前缀全形
- **R6** 按段推进

逐处归类（叶围栏；「依据」列是本席实读原句后写的决定句，不是推演）：

```text
#  档:行                                桶  判  依据（句子在讲什么 ⇒ 处置）
1  ADVISOR-CONVERGENCE.md:175            零  R3  「可机判」行把行为断言挂在一个已删用例档上 ⇒ 角色叙述，不写档名
2  ADVISOR-CONVERGENCE.md:183            零  R4  VSC 端差登记里的「实现点」已无同名档（该端 agent 目录现持 7 档）⇒ 叙述形
3  AGENT-PARAMS.md:29                    零  R4  句子自述「已清退场，留名存档」⇒ 去掉路径形态，保留存档叙述
4  CHECKPOINT.md:74                      单  R1  现态「坐标（实核）」句 ⇒ 改指核那份；括注「本端装配面保留」同处处置
5  CORE-UNIFICATION.md:60                单  R4  「完整判例」里的当年事实 ⇒ 叙述形，不改指现档
6  ENGINEERING-MODE-V2-SPEC-LEDGER.md:41 多  R1  跨端键契约的归一步 ⇒ 核那份（VSC 那份是同名实现面，不作目标）
7  ENGINEERING-MODE-V2-SPEC-LEDGER.md:63 零  R2  边界句点的一条文档约定名 ⇒ 叙述形
8  ENGINEERING-MODE-V2-SPEC-MANIFEST.md:54 零 R2  退役的用户目录运行期配置名 ⇒ 说它在哪一类
9  ENGINEERING-MODE-V2-SPEC-MANIFEST.md:63 多 R1 「本条读写校验器」⇒ 核那份（两份都导出校验符号；句子指校验器，不是工具面）
10 ENGINEERING-MODE-V2-SPEC-TEST-DISCIPLINE.md:29 多 R2 指「每包各一份的同一类档」，不是指某一份 ⇒ 类名叙述
11 PROJECT.md:131                        零  R2  运行时专名 ⇒ 不带扩展名的叙述
12 SEND-STALL-DISTILL.md:19              单  R1  现态发射点 ⇒ 改指现体；若该发射符号在盘已无同名实现 ⇒ 降 R4
13 TOOLS.md:120                          零  R3  测试件已删 ⇒ 角色叙述，不写档名
14 TRACES.md:6                          多  R1  现态「规则原文见…」⇒ 改指地图档（现盘上带「产品地图」字样的是 docs 根那份）
15 TURN-CAP-CONTINUE.md:18              单  R1  VSC 端该档不在盘（agent-tools 目录现持 1 档）⇒ 改指核那份
16 TURN-CAP-CONTINUE.md:22              单  R1  同上（会诊队列）⇒ 改指核那份
17 TURN-CAP-CONTINUE.md:25              多  R1  撞帽检查点接线 ⇒ 核 agent-tools 那份（另一份是 git 快照，职责不同）
18 TWO-REPO-MERGE.md:49                  零  R4  「条款住址」沿革句（那份归档档已不在盘）⇒ 叙述形
```

**归类合计**：R1 **8** · R2 **4** · R3 **2** · R4 **4** = **18** = `hits.anchors`。R5 ∥ R6 本批零对象（无站点仓件；按段推进是执行节奏，不是处置类别）。

**两处派生要求**（不做则读数不动或换了类别）：

- **R1 改指时，同处的节号要一起核**（#14）：只换路径不换节号，会把 `档缺` 换成 `节缺`——读数不动，类别换了，一段里剩一条红照样整笔拒。
- **R1 改指时，同句的现状断言要一起处置**（#4）：括注断言「本端装配面保留」而该端那份档不在盘，路径改对了、这句仍是假现状。断言留不留，按「它今天还成立吗」定，不按「改起来麻不麻烦」定。

**R4 的边界**（本批最容易走偏的一处）：「改成叙述形」= 把那句仍然成立的话说清楚，**不是**把历史记成现状，也**不是**留「已废弃 / 已退役」一句。需求档不留历史，历史在 git；叙述形写的是**今天仍然成立的那件事**。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
