# 2026-11-08 · pointer-residue-c
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 12:31「2174梳理掉吧，别挂着了，文档多分分批，并发处理」——C 簇：`docs/server/design` 15 档。
> 台账 = #2176（core · 归批）。前情 = docs/batches/2026-11-08-pointer-debt.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-08


### 来源与授权

- **来源**：用户 2026-11-08 12:34「长尾批可以开批处理吧，一样逻辑也分分批，并发上限还有，不用限制四个」——`docs/server/design` 的长尾切片，与 A–B ∥ D–J 零文件重叠。
- **授权口径**：用户 2026-11-08 13:44「跑完啊!按照要求走,老问我什么意思?让我给你开口子,把违规责任推给我?」——本批全链自动推进，不再逐事请示。
- **父侧承接**：需求档与本档 §1 ∥ §3 ∥ §4 ∥ §6 的笔在父侧；设计席只写 §2。

### 本批条目（覆盖）

| # | 条目 | 判据锚 |
|---|---|---|
| 1 | `docs/server/design` 15 档的裸文件名指针，改写成**仓根全路径**（现态件）或**不带路径的叙述形**（零命中 / 退役件） | §2.7 AC-1 |
| 2 | 多候选（同名 ≥2 件）逐处按**本句上下文**定一个目标，不猜 | §2.7 AC-1 ∥ AC-3 |
| 3 | 零命中：不以「名字像的」顶替（那比留着更难查） | §2.8 KD-C2 |
| 4 | 判不了的逐条列出（档 + 处 + 原因），清单为空也要写「无」 | §2.7 AC-3 |
| 5 | 段落面 ∥ 行号坐标面**不在本批射程**，一个字不动 | §2.7 AC-4 |

### 立项读数（**只此一处，不作判据**）

父侧 2026-11-08 13:13 全库实测，本批 15 档的形状：

```text
旧构建（无第 6′ 步后缀兜底）：锚 218 条 · 段落 4 条 · 行号坐标 0
逐档：ADMIN-AGENT 57 · PROJECT 25 · EXECUTION 20 · I18N 18 · SANDBOX 17 · WEBUI 15
      CHAT 12 · MEMBER-AGENT 10 · MCP 9 · SYSTEM 7 · TABS 7 · PROJECTS 6
      STYLE 6 · TERMINAL 5 · OPS 4
```

**这组数是立项的由来，不是验收判据**——它由旧构建量出，与 §2.7 判据面（书写形两腿扫描）不是同一把尺。**两个数不可比较，也不相减。**

**218 → 本批派工面 的改判必须留痕**（两把尺，不相减）：218 是**旧构建的锚计数**，只说明立项由来；本批派工面按**书写形两腿扫描**量出，读数与逐 token 落点见 §2.7 ∥ §2.4。改判的内容是：兜底能定位的那一批（`single` 桶）已由用户裁定**保持原写法、不欠账**，不在本批射程；本批只碰兜底解不了的 `zero` ∥ `multi` ∥ `full` 三桶。**这不是缩水，是把「形状计数」换成「判据面」**——两个数不同尺，不相减，也不拼成一个。

### 关键决策

- **KD-A｜零命中以「去指针」为主处置，不造继任者**。这批零命中绝大多数是历史上的一次性单测档名（批档收口即删是既有纪律），今天本就没有对应档。给它们编一个「继任档」= 造一份不存在的证据。
- **KD-B｜多候选写仓根全路径，不写「包内相对」**。本批是逐处人判，写全路径是唯一不依赖解析猜测的形态，且与 D4 的指针形态同源。

### 上抛（已裁）

| 项 | 裁定 | 裁于 |
|---|---|---|
| 段落 4 条不动 | AC-1 落锚面；gate 首行 `REFUSED` 是存量，不是本批交付 | 12:44 |
| 设计档不指未落盘的待建档 | 计划里的档名写成角色叙述 | 12:44 |
| 写门与报告面同尺 | 差的是**判集**（写门判改动区整段），不是尺子 | 12:44 |
| C 类收窄 | 只留已裁的那一处；16 处文件形花括号另立批（`#2191`） | 14:0x |
| `single` 判相等 | `≤ 509` 改 `= 509` | 14:0x |

## §2 批次任务与设计（eng-designer）
**状态行**：✅ 设计完成 · 2026-11-08






### 批次任务与设计（eng-designer · 本批唯一实施依据）

> **判据面 ∥ 交付门分开，两侧读数互不代证**：判据 = **静态面直读文件扫描**（§2.7 那一支，判 AC-1 / AC-2 / AC-3）；交付门 = 内置工具 `doc_check` `mode:"gate"`（判 AC-4 的段落 ∥ 行号坐标）。
> 依据 `docs/core/design/DOC-DISCIPLINE.md`「或**静态面**（源面 `grep` ∥ 直读文件 ∥ `git diff` 改动面）」——直读文件的扫描属合法判据面。
> 依据 `docs/core/design/DOC-DISCIPLINE.md`「直接 `import` 引擎函数只作临时诊断」——§2.2 那份引擎直调读数只作诊断，不作判据。
> **扫描器的候选索引取引擎同一跳过面**（dot 名 ∥ `_archive` ∥ `node_modules` ∥ `dist` ∥ `build` ∥ `coverage` ∥ `obj`）：不照这把尺，`multi` 桶会把 `.thincoder/tmp/` 下的材料化副本算成第二候选，一处裸名凭空长出两个指认对象。同一份 15 档，两把尺读 49 与 9。
> **射程 = 兜底解不了的那部分**：单候选裸名（§2.7 读数 509 处）由第 6′ 步唯一后缀兜底判绿，**一处不动**。本批只碰 `zero` ∥ `multi` ∥ `full` 三桶 = **9 个 token / 18 处**，逐 token 落点见 §2.4。

#### 2.1 本批条目与判据锚

| # | 条目 | 覆盖 | 判据锚 |
|---|---|---|---|
| 1 | 15 档书写形清到 0（三桶 `zero` ∥ `multi` ∥ `full`，共 9 个 token / 18 处） | 覆盖 | §2.7 AC-1 |
| 2 | 多候选（候选 ≥2）逐处按上下文定**一个**目标，写成仓根全路径 | 覆盖 | §2.7 AC-1（`multi` = 0）∥ §2.4 R1 |
| 3 | 零命中 ∥ 假仓根全路径：改名 ∥ 合并 ∥ 拆档 ⇒ 改指继任者；真没了 ⇒ 叙述形（不写档名） | 覆盖 | §2.7 AC-1（`zero` ∥ `full` = 0）∥ §2.4 R2–R3 |
| 4 | 判不了的逐条列出（档 · 节 · token · 为什么判不了） | 覆盖 | §2.7 AC-3 |
| 5 | 段落面（交付门现状 3 处超长段，本批零改动）· 行号坐标 0 处 | **不在本批** | §2.7 AC-4 |

#### 2.2 立项读数（父侧旧构建实测 · 不作判据）

```text
旧构建（无第 6′ 步后缀兜底）：锚 218 条 · 段落 4 条 · 行号坐标 0
逐档：ADMIN-AGENT 57 · PROJECT 25 · EXECUTION 20 · I18N 18 · SANDBOX 17 · WEBUI 15
      CHAT 12 · MEMBER-AGENT 10 · MCP 9 · SYSTEM 7 · TABS 7 · PROJECTS 6
      STYLE 6 · TERMINAL 5 · OPS 4
```

**这份数只有一个用途**：说明「当时为什么开这一批」。它**由父侧旧构建量出**（§1 立项读数同源），不是本设计轮跑出来的，也不可复跑。

**它和今天的读数不是同一把尺**：交付门（`doc_check` `mode:"gate"`，§2.12）对同一 15 档现读 `anchors: 0`——因为第 6′ 步后缀兜底把裸名判绿。218 与 0 是**两次不同构建的两读数**，既不可比较，也不可相减。

**判据只在一处**：§2.7 那支书写形扫描器。本节的 218、§2.12 的 0（锚桶）都只是诊断留痕。

#### 2.3 设计落点

- **不新增设计档**：本批是存量 15 档的指针面收正，无新机制。指针形态的定规已住 `docs/core/design/DOC-DISCIPLINE.md`；处置口径 = 本文 §2.4（一次性、随批）。
- **最近先例**：同一条判法链的前情批（`docs/batches/2026-11-08-pointer-debt.md`，已收口）——对齐处 = 逐处人判 + 仓根全路径；偏离处 = 本批补「形态类展开」与「零命中叙述形」两条，因为前情批没有花括号缩写与批次单测档名这两类存量。
- **公共来源已查**：`doc_search` 查「指针 仓根全路径 后缀兜底」→ 命中 `docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/design/PATH-RESOLUTION.md`，两处口径与本批判法一致，无冲突。
- **声明公共来源（`index.publicRepos` = `../.thincoder` ∥ `../thincoder.com`）已查无相关**：同一查询在 `doc_search`（含这两处声明域）只回上列两档，未回任何外部件——本批只改仓内档的书写形，不涉外部系统。

#### 2.4 处置口径与完整工作清单（AC-1 的唯一判据对象）

**处置口径 = 父侧 R1–R6（逐字；本批唯一的处置口径）**

| # | 判法 |
|---|---|
| R1 | 现态指针 ⇒ 仓根全路径；多候选按上下文选一处 |
| R2 | 非仓内名 ⇒ 不带路径形态的叙述（依赖包内部件 → 包名 + 件名去扩展名；构建生成物 → 说它是什么；用户数据目录档 ∥ 运行期配置名 → 说它在哪一类） |
| R3 | 已删的测试 ∥ 探针件 ∥ 计划档 ⇒ 角色叙述，不写档名 |
| R4 | 沿革 ∥ 历史段里的旧路径 ⇒ 叙述形 |
| R5 | 站点仓件 ⇒ `thincoder.com` 已声明；写带前缀全形 |
| R6 | 按段推进：一段一起清（写门判集 = 段，一条红连坐整段） |

R1–R6 是**判法**，不是派工单：它们只对 §2.4 清单里那 9 个 token 成立。另 21 个 token 在本批 15 档里裸名出现 0 处（见本节末），**不给它们写落点**。判法 ③（段落面 ∥ 行号坐标一字不动）不落本节——它落在 §2.9 边界与 §2.7 AC-4。

**完整工作清单（9 token / 18 处 · 逐处给落点 · 即 AC-1 的判据对象）**

处数 = §2.7 扫描器逐 token 读出（同一把尺、同一 15 档）。落点 = 该 token 在本句上下文里指的那一件。**总处数 18**：`README.md` 那 1 处只在引擎谓词下才进判——本地豁免名单会把它吃掉（§2.7「判据尺 = 引擎谓词，不自建名单」）。

```text
token                                   处数 · 所在档
                                        ⇒ 落点 ∥ 依据（本轮实测）· 每个 token 的桶见下方「逐行桶」表（即上面每一行的桶列，横排改竖排）· 合计 full 7 ∥ multi 10 ∥ zero 1 = 18 = 9 个 token
bin/thincoder-server.mjs                5 · ADMIN-AGENT ×2 ∥ MEMBER-AGENT ∥ MCP ∥ OPS
                                        ⇒ thincoder-server/bin/thincoder-server.mjs ∥ 首段 bin 是仓根顶层目录，但仓根 `bin/` 里只有 thincoder.cjs、无此件（真件在 server 包内）⇒ 判 full；落点在盘
SANDBOX.md                              6 · docs/server/design/sandbox/SANDBOX.md 自指
                                        ⇒ docs/server/design/sandbox/SANDBOX.md ∥ 候选 2（另一件 webui 域）；句内所指 = 本档
chat.mjs                                1 · ADMIN-AGENT
                                        ⇒ thincoder-server/src/agent/chat.mjs ∥ 候选 2；判它的是同档那句逐字原文「`chat.mjs` 733 越 720 拆档线——微触 ≈+10（评估 = §9 KD-SV-208）」，其评估行 KD-SV-208 逐字写「736/737 越拆档线的处置 = 微触（净 ≈+10）不拆档」；两件行数实测 = 746 ∥ 206，733/736 只可能指前者
package.json                            1 · CHAT
                                        ⇒ thincoder-server/package.json ∥ 候选 6，唯本件声明 @thincoder/render-core（同档句内点名该声明）
block.mjs                               1 · CHAT
                                        ⇒ thincoder-render-core/flow/block.mjs ∥ 候选 2；同档句内点名本件的 renderBlock ∥ buildAssistantRestore ∥ withLabel
README.md                               1 · OPS
                                        ⇒ thincoder-server/README.md ∥ 候选 7；本句 = 本板 files 白名单行，同档另行列本件 259 行
test/rc-resolve.mjs                     1 · PROJECT
                                        ⇒ 桶 = full（首段 test 在仓根顶层，但仓根 `test/` 下无此件——真件在 server 包内）∥ 候选 2（server ∥ desktop 两个包各一件）⇒ 指 thincoder-server/test/rc-resolve.mjs（在盘；另件属桌面包，非本板）
thincoder-server/test/assembly.test.mjs 1 · OPS
                                        ⇒ 未在盘 ⇒ E 类叙述形 ∥ 形如仓根全路径但解析不到 ⇒ 判 full
state.json                              1 · EXECUTION
                                        ⇒ 仓内零候选 ⇒ E 类叙述形 ∥ 判 zero
```

**逐行桶（每 token 一行 · 处数 · 合计）——逐处相加 = §2.12 三桶 = AC-1 合计**

```text
full   7 = bin/thincoder-server.mjs 5 ∥ test/rc-resolve.mjs 1
          ∥ thincoder-server/test/assembly.test.mjs 1
multi 10 = SANDBOX.md 6 ∥ chat.mjs 1 ∥ package.json 1 ∥ block.mjs 1 ∥ README.md 1
zero   1 = state.json 1
合计  18 = 9 个 token
```

**`test/` 起首那处为何在 `full`**：它的首段 `test` 本身就是仓根顶层目录（仓根有 `test/` 一层），不属于「首段非顶层 ∥ 滚出判域」那一类；判它的是后半句——仓根相对与引用方目录相对两级都解析不到，故落 `full`。引擎同判红：该 token 解析得 `dangling`，后缀候选 2 件（server ∥ desktop 两个包各一件同名件），兜底无唯一解 ⇒ 按 R1 写仓根全路径。

**E 类｜零命中 ∥ 伪全路径 ⇒ 叙述形（不写档名，不造继任者）**

按角色换叙述，句意保留。本批两处逐处落法：

```text
OPS 的装配断言测试位        ⇒ 「装配断言测试位（计划位，未在盘）」
EXECUTION 的槽内状态件      ⇒ 「槽内状态件（运行期生成，随槽）」
批次单测档（收口即删）      ⇒ 「本批单测档（批次面，收口即删）」（本批无在判处，规则留给同类存量）
计划档 ∥ 预案 ∥ 待建档      ⇒ 「拆档预案（对象角色，未在盘）」（同上）
非仓内档名                  ⇒ 「描述符树（属性对象）」一类角色叙述（同上）
```

**C 类｜花括号形 = 本批只一处（父侧裁）**

```text
docs/server/design/webui/SYSTEM.md 的 i18n-{zh,en}-system.mjs
  ⇒ thincoder-server/public/i18n-zh-system.mjs ∥ thincoder-server/public/i18n-en-system.mjs
```

**其余 16 处文件形花括号不在本批判域**——AC-1 的扫描器看不见花括号形，做没做读数都是 0，故那些处随 `#2191` 另立一批、带自己的尺子。C 类这一处的机检 = 字面扫描：15 档围栏外 `i18n-{` 出现次数 = 0。

**处置面外 token（本轮实测，裸名处数全为 0——不进本批）**

```text
app.mjs 0 · dom.mjs 0 · i18n.mjs 0 · index.html 0 · run.mjs 0 · providers.mjs 0
proxy.mjs 0 · ssh.mjs 0 · quota.mjs 0 · routes.mjs 0 · store.mjs 0 · secret-prompt.mjs 0
protocol.mjs 0 · presets.mjs 0 · attachments.mjs 0 · context.mjs 0 · config.mjs 0
team.mjs 0 · index.mjs 0 · attach.mjs 0 · PROJECT.md 0
```

这 21 个 token 的候选都在盘（1–12 处不等），但**本批 15 档里没有一处以裸名引用它们**。给零处的 token 写落点，写下的就是一条没有对象的令——照它做与不做，读数都不变，下次谁也不知道做没做。

**候选集是读数，不是印象**：处数与候选数都由扫描器同名索引给出（本轮实测：`chat.mjs` 2 ∥ `package.json` 6 ∥ `block.mjs` 2 ∥ `README.md` 7 ∥ `routes.mjs` 8 ∥ `index.mjs` 8 ∥ `run.mjs` 12）。选定后写进档的是仓根全路径——**写错即被 `full` 桶判红**，散文式判断没有蒙混的余地。



#### 2.6 受影响文件与测试覆盖

- **改动面 = 15 档**（清单见本次 spawn 声明；全部在 `docs/server/design/` 下）。
- **零源码、零产品码、零需求档、零台账、零 RTM。**
- **tier 结论：无跨档**。逐档同批改完，不新增档，不拆档；`.md` 无尺寸档位义务。
- **验收载体 = §2.7 的两支机检**（书写形扫描判 AC-1 ∥ 内置 `doc_check` 判 AC-4）。本批无代码面 ⇒ 无单元测试档；不新增集成用例（理由 = §2.10）。

#### 2.7 验收对照（机检）

**AC-1（主判据）· 书写形扫描（静态面 · 直读文件 · 一把尺）**

- 判什么：15 档正文（围栏外）里**指针形态**的档名 token，按候选索引分三桶——`zero`（在盘零候选）∥ `multi`（候选 ≥2）∥ `full`（形如仓根全路径、但仓根 ∥ 引用方目录两级之内解析不到——判的是**书写形**，不是引擎红绿：引擎的后缀兜底可能猜中它，猜中也不改它的书写形错）。
- `single`（候选恰一）只记不判：第 6′ 步兜底能解析，动它就是外溢（AC-2）。
- 非指针三类不计入：`*` 起首的 glob、以 `.` ∥ `-` 起首的名字片段、围栏内的示例与读数。
- **判据 = `zero` = 0 ∧ `multi` = 0 ∧ `full` = 0**。

**读数（同一扫描器 ∥ 同一 15 档 · 本轮实跑）**

```text
桶            含材料化副本（旧索引）   引擎跳过面（判据尺）   判据
zero                         7                    1         = 0
multi                       49                   10         = 0
full                         7                    7         = 0
single                     469                  509         = 509
在判合计                    63                   18         = 0
```

两把尺差的 45 处 = `.thincoder/tmp/` 下的材料化副本与名字片段：前者引擎索引面不看，后者不是指针。

**判据尺 = 引擎谓词，不自建名单**

- **一张本地豁免名单就是一处买来的绿**。脚本若自带 `EXEMPT`（把 `README.md` ∥ `RTM.md` 一类按惯例名放行），那是**与谓词同义的本地名单**，规范档明禁在消费面重建。
  引擎的 `docNameExemption` 只在提示词面免这七个名，在 `docs/` 面它们照按指针判。
  代价当场可见：`README.md` 在 15 档里裸名出现 1 处、盘上 7 个候选——被名单吃掉，`multi` 就少读 1 处。
- **扩展名族与豁免谓词同取引擎单源**：`import { DOC_EXTS, docNameExemption }`，消费面不持第二份。

**对照样本（每条腿都亲眼见它红）**

```text
multi 正样本：`chat.mjs`（ADMIN-AGENT）                        ⇒ multi 1
multi 对照  ：「`thincoder-server/src/agent/chat.mjs`」同处      ⇒ 各桶 0（绿）
multi 正样本：`README.md`（OPS——旧名单吃掉、谓词判定）          ⇒ multi 1
zero  正样本：`state.json`（EXECUTION，仓内无此档）             ⇒ zero 1
full  正样本：`bin/thincoder-server.mjs`（5 处）                ⇒ full 5
full  对照  ：「`thincoder-server/bin/thincoder-server.mjs`」    ⇒ full 0（绿）
片段  对照  ：`docs/batches/*.test.mjs`（glob 字面）            ⇒ 不计入（0）
```

**AC-1 现状 = 红（18 处 · 9 个 token）**：清单见 §2.4。实施轮逐 token 落，落完复跑同一支扫描器读 `zero` ∥ `multi` ∥ `full` 三桶全 0。

**扫描器（判据本体 · 可复跑）**：以 `execute` 跑下列脚本，`DOCS` 取 §2.6 那 15 档；输出四个数与三桶 token 清单。

```js
import fs from 'node:fs'; import path from 'node:path';
import { DOC_EXTS, docNameExemption } from 'file:///D:/teamcode/thincoder/thincoder-core/doc-check/anchors.mjs';
const ROOT = 'D:/teamcode/thincoder';
const DOCS = ['docs/server/design/agent/ADMIN-AGENT.md','docs/server/design/agent/MEMBER-AGENT.md','docs/server/design/PROJECT.md','docs/server/design/sandbox/EXECUTION.md','docs/server/design/sandbox/SANDBOX.md','docs/server/design/webui/I18N.md','docs/server/design/webui/WEBUI.md','docs/server/design/webui/CHAT.md','docs/server/design/mcp/MCP.md','docs/server/design/webui/SYSTEM.md','docs/server/design/webui/TABS.md','docs/server/design/webui/PROJECTS.md','docs/server/design/webui/STYLE.md','docs/server/design/webui/TERMINAL.md','docs/server/design/ops/OPS.md'];
const EXT = DOC_EXTS.join('|');
const SKIPDIR = new Set(['node_modules','dist','build','.turbo','coverage','obj','_archive']);
const all = [];

// dot 名（.thincoder ∥ .git 等）由 walk 跳过——与引擎后缀索引的跳过面同源
(function walk(d){
  for (const e of fs.readdirSync(d,{withFileTypes:true})) {
    if (SKIPDIR.has(e.name) || e.name.startsWith('.')) continue;
    const p = d+'/'+e.name;
    e.isDirectory() ? walk(p) : all.push(p);
  }
})(ROOT);
const byName = new Map();
for (const f of all) { const b = f.slice(f.lastIndexOf('/')+1); byName.set(b, (byName.get(b)||[]).concat(f)); }
const tops = new Set(fs.readdirSync(ROOT,{withFileTypes:true}).filter(e=>e.isDirectory()).map(e=>e.name));
const noFence = (t) => { let f = false; return t.split('\n').filter(l => /^\s*```/.test(l) ? (f = !f, false) : !f).join('\n'); };
const RE = new RegExp('[A-Za-z0-9_.\\-/]*[A-Za-z0-9_\\-]\\.(?:' + EXT + ')(?![A-Za-z0-9_])','g');
const agg = { zero:{}, single:{}, multi:{}, full:{} };
for (const d of DOCS) {
  const t = noFence(fs.readFileSync(path.join(ROOT,d),'utf8')); let m;
  while ((m = RE.exec(t))) {
    const tok = m[0], prev = m.index ? t[m.index-1] : '';
    if (tok.includes('/')) {
      if (!tops.has(tok.split('/')[0])) continue;
      if (fs.existsSync(path.join(ROOT,tok)) || fs.existsSync(path.join(ROOT,path.dirname(d),tok))) continue;
      agg.full[tok] = (agg.full[tok]||0)+1;
    } else {
      if (prev === '*' || /^[.\-]/.test(tok)) continue; // glob 前缀 ∥ 名字片段不是指针
      if (/[A-Za-z0-9_.\-/]/.test(prev)) continue;
      if (docNameExemption(tok) !== null) continue;    // 豁免谓词 = 引擎单源，不自建名单
      const n = (byName.get(tok)||[]).length, k = n===0?'zero':n===1?'single':'multi';
      agg[k][tok] = (agg[k][tok]||0)+1;
    }
  }
}
const sum = o => Object.values(o).reduce((a,b)=>a+b,0);
console.log({ zero:sum(agg.zero), single:sum(agg.single), multi:sum(agg.multi), full:sum(agg.full) });
console.log('zero', JSON.stringify(agg.zero)); console.log('multi', JSON.stringify(agg.multi)); console.log('full', JSON.stringify(agg.full));
```

**AC-2（射程不外溢）**：两条同轮读。

① **`single` 判逐位相等**（现状 509，交付后 `= 509`）。这一族 = 兜底能定位、按用户裁定不改的那批；**任何变动都是越界**——改成全路径会让它下降，`≤` 判不出下降，等于给越界留一条不报的路。判据要能失败，就得判相等。

② **改动文件集合 ⊆ §2.6 那 15 档**。基线 = 本设计轮实读的 `93199fe0`（`git rev-parse HEAD`），判定命令：

```text
git diff --name-only 93199fe0 -- docs/server/design/
```

输出集合逐档比对 15 档清单，多出一档即红；同时 `git diff --name-only 93199fe0 -- thincoder-core thincoder-server thincoder-render-core` 须为空（零产品码）。「清单外档不在 `DOCS` 里」不作判据——那是同一句话自证，证明不了没改别的档。

**AC-3（判不了清单）**：见 §2.11。实施侧撞出新的一处 ⇒ 记 `§5`（档 · 节 · token · 为何判不了）并入报告，**不许猜**。

**AC-4（段落面 · 交付门 · 内置 `doc_check`）**：判 `hits.paragraph ≤ 3` ∧ `hits.lineRefs === 0`，并对段落面**零改动**——交付后两数逐位等于改前读数。

- 现存 3 处超长段：`docs/server/design/webui/PROJECTS.md` 1 处 ∥ `docs/server/design/webui/SYSTEM.md` 2 处。一处不动。
- §1 的「段落 4 条」是立项读数；本批改前实测 3，差的 1 条落在本批射程之外，不是本批所为。
- 判据因此锚在「`≤ 3` ∧ 本批零改动」。不锚「= 4」——那要减段落才成立，是另一笔工作。

#### 2.8 关键决策

- **KD-C1｜本批只动兜底解不了的那 18 处**。射程 = §2.4 清单，逐处人判。webui 域那条「一律落 `thincoder-server/public/`」的默认令随 A 类撤表一并撤——它在今天的 15 档里没有对象（`app.mjs` ∥ `dom.mjs` ∥ `i18n.mjs` ∥ `index.html` 裸名各 0 处）。
  **与 KD-15 的关系（写明，否则读作顶撞）**：KD-15 否掉的是「守现规则、逐处改全路径」这一**全量**替代——`docs/core/design/PATH-RESOLUTION.md`「文档变长变难读」。本批不动那 509 处，KD-15 的保护面原样保留，改的只是兜底解不了的 18 处；口径 = 同档「解析面认包内相对写法，不改那批文档」——「那批」= 兜底能解析的那批。
  **KD-15 管解析面**（解析器认包内相对写法，兜底照旧开），**本条管书写面**（在判处写仓根全路径）。两面各管一层，不互为例外。
- **KD-C2｜零命中一律叙述形，不造继任者**。沿 §1 KD-A：给已删的批次单测档编一个「继任档」= 造不存在的证据。
- **KD-C3｜花括号形本批只一处**。`docs/server/design/webui/SYSTEM.md` 的 `i18n-{zh,en}-system.mjs` 展开成两件具体档名（§2.4 C 类）。
  **其余 16 处不在本批判域**（`#2191`）：AC-1 的扫描器看不见花括号形，做没做读数都是 0——一条令配不上一把尺，等于没有令。
- **KD-C4｜`attach.mjs` 的判据 = 导出面**，不用「名字像」：取 `thincoder-render-core/composer/attach.mjs`（该件导出 `withAttachedFiles` 与三限常量；桌面件不具该导出面）。
  **本批 15 档里该 token 裸名出现 0 处** ⇒ 无在判处；本条留作它再出现时的口径，不进 AC-1 判集。
- **KD-C5｜按节推进**。写门的判集 = 改动区整段，一条红连坐整段 ⇒ 施工单位是节，不是单条指针。
- **被否**：①「包内相对 + 包根映射」——前情批已否；解析面已有兜底，再引入第二套映射 = 两个真相。
  ②「红 token 一律写成 `@thincoder/<包>/<件>`」——包内路径不是仓根路径，机检不认。

#### 2.9 边界

- 不动：清单外任何档 · 产品码 · 需求档 · 台账 · 本档 §1 §3 §4 §6 · 余下超长段 · 行号坐标。
- 不写「已废弃 ∥ 已退役」历史句；改指后旧路径形态就地删净，不留对照。
- 同一条指针在多档各红 = 正常态：逐档各自判，不跨档顺手改。

#### 2.10 集成测试设计（RTM 增量）

`test/RTM.md` 无行要改，不新增行。读数由下列命令产出（本轮实跑）：

```text
node -e "const fs=require('fs');const t=fs.readFileSync('test/RTM.md','utf8').split('\n');console.log('## =',t.filter(l=>/^##\s/.test(l)).length,'rows =',t.filter(l=>/^\s*\|/.test(l)).length,'AC rows =',t.filter(l=>/^\s*\|/.test(l)&&/AC-\d/.test(l)).length)"
⇒ ## = 3 · rows = 49 · AC rows = 0
```

三个 `##` 业务节 = 故事索引表 ∥ 异常与更正 ∥ 签署面。**零行断言本批这 18 处指针的书写形**，也零行断言业务可观察结果——本批不碰产品码、不碰运行时行为。两条入口皆不成立：无新业务场景，无生产问题。收口行按「无集成面改动」报。

#### 2.11 上抛项

**无未决上抛；两条已裁（父侧 2026-11-08）**：

- `attach.mjs` ⇒ 按导出面取 `thincoder-render-core/composer/attach.mjs`，不进 AC-3（依据 = §2.8 KD-C4）。该 token 本批零裸名出现，故无在判处。
- AC-1 ∥ AC-4 的互斥 ⇒ 取乙：交付面不让位于副作用面。段落面现状 = 3 处超长段，本批**零改动**；AC-4 判「`paragraph ≤ 3` ∧ `lineRefs = 0` ∧ 本批零改动」，余下 3 处一处不动。

#### 2.12 交付门读数与判据读数（各判一面，互不代证）

**两支尺各判各的**：AC-1（书写形）由 §2.7 那支扫描器判；AC-4（段落 ∥ 行号坐标）由内置 `doc_check` 判。**同一组读数不会同时判两条 AC**：交付门那组读数**就是** AC-4 的判据——把它标成诊断，AC-4 就没人判了。

**门禁尺（内置工具 `doc_check` · 只作交付门）**：`mode:"gate"`，`target:"D:\teamcode\thincoder"`，`docs` = 下列 15 档逐档。只记段落 ∥ 行号坐标两桶；**锚桶在此尺下恒 0，与做没做无关**（§2.2 已说明）。

```text
docs/server/design/agent/ADMIN-AGENT.md
docs/server/design/agent/MEMBER-AGENT.md
docs/server/design/PROJECT.md
docs/server/design/sandbox/EXECUTION.md
docs/server/design/sandbox/SANDBOX.md
docs/server/design/webui/I18N.md
docs/server/design/webui/WEBUI.md
docs/server/design/webui/CHAT.md
docs/server/design/mcp/MCP.md
docs/server/design/webui/SYSTEM.md
docs/server/design/webui/TABS.md
docs/server/design/webui/PROJECTS.md
docs/server/design/webui/STYLE.md
docs/server/design/webui/TERMINAL.md
docs/server/design/ops/OPS.md
```

**交付门读数（同一把尺 · 同一 15 档）**：`doc_check` `mode:"gate"` 首行 = `DOC-CHECK GATE: REFUSED（3 段文字太长，难于阅读）`，`hits = { anchors: 0, paragraph: 3, lineRefs: 0 }`。

- 锚桶读 0 与做没做无关：兜底把裸名判绿（§2.2 已说明）。它不作本批判据。
- 段落桶 3 = AC-4 的判面，本批零改动；首行 `REFUSED` 是存量，不是本批交付。

**判据读数（AC-1 的尺 · §2.7 扫描器）**：`zero` 1 ∥ `multi` 10 ∥ `full` 7 = **18 处 / 9 个 token 在判** ⇒ AC-1 现状为红；实施轮落完，三桶读全 0。

**段落面（AC-4）**：`hits.paragraph = 3 ≤ 3` ∧ `lineRefs = 0`，成立。那 3 处超长段在 `docs/server/design/webui/PROJECTS.md` 与 `docs/server/design/webui/SYSTEM.md`，本批一处未动。

**AC-3 清单**：空 —— 曾判不了的一处（`docs/server/design/webui/SYSTEM.md` 的 `i18n-{zh,en}-system.mjs`）已按上裁处置；全程未出新判不了项。

**落盘读数归 §5**：本节不记「哪些改动已落地」。本批 15 档的指针修形以 §5 的实施记录为准，验收以 §6 为准。

#### 2.13 本节不记实施

实施读数归 §5，验证归 §6。本节只写本批的条目、判法、射程与判据：落盘时序、提交号与偏差归因属过程面，不在设计段落笔。

#### 2.14 落实记录（2026-11-08 · 18 处 + C 类 1 处已落盘）

- **改动面 = 9 档**（⊆ §2.6 的 15 档）：`docs/server/design/PROJECT.md` ∥ `docs/server/design/agent/ADMIN-AGENT.md` ∥ `docs/server/design/agent/MEMBER-AGENT.md` ∥ `docs/server/design/mcp/MCP.md` ∥ `docs/server/design/ops/OPS.md` ∥ `docs/server/design/sandbox/EXECUTION.md` ∥ `docs/server/design/sandbox/SANDBOX.md` ∥ `docs/server/design/webui/CHAT.md` ∥ `docs/server/design/webui/SYSTEM.md`。
- **逐处「原句 ⇒ 改后」归报告**（每处一行，随本轮回报给出），本节只留读数与偏差。

**三组读数（本轮实跑 · 命令与输出同轮）**

```text
§2.7 扫描器（同一脚本、同一 15 档）
  改前 {zero:1, single:509, multi:10, full:7}  ⇒  改后 {zero:0, single:509, multi:0, full:0}
git diff --name-only 93199fe0 -- docs/server/design/   ⇒ 上列 9 档（无一在 15 档之外）
git diff --name-only 93199fe0 -- thincoder-core thincoder-server thincoder-render-core  ⇒ 空
doc_check gate（15 档）：REFUSED（3 段文字太长）· paragraph 3 ∥ lineRefs 0 ∥ anchors 0
```

- **AC-1 成立**：`zero` ∥ `multi` ∥ `full` 三桶全 0，在判 18 处清零。
- **AC-2 ① 成立**：`single` = 509，与改前逐位相等（未动）。
- **AC-2 ② 成立**：改动集 ⊆ 15 档；三个产品码包零改动。
- **AC-4 成立**：`paragraph` 3 ∥ `lineRefs` 0，与改前同数；三处超长段仍在 `docs/server/design/webui/PROJECTS.md` 与 `docs/server/design/webui/SYSTEM.md`，未做任何段落面处置。

**偏差两项（须父侧裁，均在报告中标出）**

- **落点偏离 §2.4 一行**：`docs/server/design/PROJECT.md` R58 行那处裸名（句内以「沿桌面」限定指桌面那件）实际落 `thincoder-desktop/test/rc-resolve.mjs`；§2.4 该行写的是 `thincoder-server/test/rc-resolve.mjs`。两件皆在盘，判据面读不出差别——写成 server 会让该句自指「新建件沿自己先例」。此处按句意落，未改 §2.4 表。
- **C 类机检口径按 §2.4 现文不可能成立**，读数如下（均属 §4 划定 `#2191` 面、不在本批判域）：

```text
仍存 `i18n-{` 形 10 处：i18n-{zh,en}.mjs 3 ∥ i18n-{zh,en}-core.mjs 2 ∥ i18n-{zh,en}-admin 3
                        ∥ i18n-{zh,en}-me 1 ∥ 多域名一件
已裁那一处 `i18n-{zh,en}-system`：读数 = 0
```

**§2.4 两处依据列的实测更正（落点不变，理由换真）**

- `package.json`：§2.4 称 server 包「唯此件声明 `@thincoder/render-core`」——实测 `thincoder-desktop` ∥ `thincoder-vscode` ∥ `thincoder-render-core` 三处亦声明。落点仍为 `thincoder-server/package.json`，成立理由是句内讲的是该页所属包体。
- `block.mjs`：§2.4 并列的三个符号里 `withLabel` 不在 `thincoder-render-core/flow/block.mjs` 导出面；`renderBlock` 与 `buildAssistantRestore` 在，落点成立。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

### 设计评审 · 结论表

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | §2.7 AC-4「`hits.paragraph ≤ 3`（基线 4——不新增）」——「不新增」与「≤3」互斥，只可由减少满足，而同条又写「不是本批的段落面工作」；§1「段落 4 条不动」仍是活句 |
| 2 | 🔴 | 未解决 | 尺子：§2 头「本批读数只取 §2.2 那一份，别处不取数」vs §2.12「内置工具 `doc_check`」；`docs/core/design/DOC-DISCIPLINE.md` §2 求值口径「直接 `import` 引擎函数只作临时诊断」+「其读数不得作为判据」 |
| 3 | 🔴 | 未解决 | §2.12 标题「实施轮落点与验收复跑（2026-11-08）」+「已按上裁落盘」；§2.13「偏差属实，归因父侧」；§5 空 |
| 4 | 🟡 | 未解决 | §2.7 AC-2「清单外档不在本次 `docs` 里，天然不入判」+「`suffixHits` 只降不增（改前改后同为 634）」 |
| 5 | 🟡 | 未解决 | KD-C1「webui 域裸名一律落 `thincoder-server/public/`」vs §2 头「已由兜底判绿的裸名不在射程」；`docs/core/design/PATH-RESOLUTION.md` KD-15「文档变长变难读」否决的正是该形 |
| 6 | 🟡 | 未解决 | §2.4「处置表（实施单一依据 · 逐 token）」实列 24 条 vs §2.2「distinct token 85」——余 61 条无逐 token 落点 |
| 7 | 🟡 | 未解决 | §2.4 B 类依据列「上下文 = agent 域聊天驱动」形——判据靠散文，未见在盘读数 |
| 8 | 🔵 | 未解决 | §2.10「本批零代码改动，不动任何业务可观察结果」——零增量结论成立，但无 `test/RTM.md` 行级读数 |

计数：🔴 3 · 🟡 4 · 🔵 1（🔴 阻断，不得放行）

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未解决 | 同尺同档两读：§2.2「锚 218 条 · 4 段文字太长，难于阅读」vs §2.12「同一把尺 · 同一 15 档」下的「anchors: 0, paragraph: 3」；§2.2 的命令取本仓引擎，却把 218 称「旧构建无第 6′ 步后缀兜底时的形状计数」——两说不能并存 |
| 2 | 🔴 | 未解决 | 要求面不可核：§1 只剩「<§1 模板占位：本批条目 / 关键判据 / 授权口径>」；§2.7 引「§1 的「段落 4 条」是立项读数」、§2.8 引「沿 §1 KD-A」，档内无源；§2.4「下表是**全部在判处**」的 8 档不含 WEBUI（旧读数 15），条目 1 与要求面对不上 |
| 3 | 🔴 | 未解决 | 工作清单与 B 表互抵：§2.4 B 表给那条 MCP 域件落点（盘上同名两件），「完整工作清单」17 处里该 token 无一处，而同节只认「上表三处多候选」——要么清单不全（AC-1 判不到 0），要么 B 表那行是没量的令 |
| 4 | 🔴 | 未解决 | §2.5「撞上不同指的地方 ⇒ **报，不改数**」：17 处落点已逐处定，无一处的邻句断言被点名，也无复现命令——分支守的是没发生过的场 |
| 5 | 🟡 | 未解决 | §2.4 的 A/B/C 表给出约 22 个 token 落点，与 §2.7 AC-2「兜底判绿的裸名动了就是外溢」相抵；无一句写明规则表只对改动区段内的裸名生效 |
| 6 | ✅ | 已解决 | §2.4 工作清单那两行已给落点与依据（「六个包体候选中唯此一件声明」∥「「四件」里三件由本件导出」） |
| 7 | 🟡 | 未解决 | B 表依据列仍是散文（「上下文 = agent 域聊天驱动」形）；域路由件盘上同名 8 处，B 表只列 2 处 |
| 8 | 🟡 | 未解决 | §2.7 AC-2 的「`git diff --name-only <本批基线> -- docs/`」基线从未定义 |
| 9 | 🟡 | 未解决 | §2.12 标题「交付门读数与判据读数（诊断 · 不作判据）」与 AC-4 由该组读数判、§2 头「（判 AC-4 的段落 ∥ 行号坐标）」互抵 |
| 10 | 🟡 | 未解决 | §2 状态行「✅ 设计完成」下仍留「<§2 模板占位：」行；§1 状态行留「（…）」 |
| 11 | 🟡 | 未解决 | §2.7 判据脚本自建 `const EXEMPT` 名单——规范档「无与谓词同义的本地名单（占位词干表 ∥ 类名表都不许在消费面重建）」 |
| 12 | 🔵 | 未解决 | §2.3 勘察行只记仓内检索，未记独立公共来源是否有相关物 |
| 13 | 🔵 | 未解决 | §2.10 的 RTM 行读数本轮只验档在盘、内容未复核 |
| 14 | 🔴 | 新增 | §4 已裁「把 C 类收窄到已裁的那一处」——§2.4 C 类仍写「域集 = me ∥ core ∥ sandbox ∥ project ∥ ledger ∥ mcp ∥ system」，§2.8 KD-C3 仍「形态类一律展开成具体档名」，C 类一条未收窄 |
| 15 | 🔴 | 新增 | §4 已裁「`≤ 509` 改 `= 509`」——§2.7 AC-2 仍「交付后 ≤ 509」，§2.7 读数表仍「只记（只降不升）」 |

计数：🔴 6 · 🟡 6 · 🔵 2（另 1 行已验证解决）

VERDICT: changes-required

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | ✅ | 已解决 | §2.2「它**由父侧旧构建量出**（§1 立项读数同源），不是本设计轮跑出来的，也不可复跑」+「218 与 0 是**两次不同构建的两读数**」——218 的来历与 0 的来历已分写 |
| 2 | ✅ | 已解决 | §1 条目 5 条 · KD-A · 上抛 5 项均在册；§2.7「§1 的「段落 4 条」是立项读数」与 §2.8「沿 §1 KD-A」两处引用均有源 |
| 3 | 🔴 | 未解决 | 同一份 18 处分桶两说：§2.12「`zero` 1 ∥ `multi` 10 ∥ `full` 7 = **18 处 / 9 个 token 在判**」；§2.4 清单逐处相加 = multi 11（含域测试件那 1 处）、full 6——full 少记 1 处，清单里没有它的落点 |
| 4 | ✅ | 已解决 | §2.5 整节已删（§4「判法④那一支现在整节删除」），编号空档保留、不顺移 |
| 5 | ✅ | 已解决 | §2.4「R1–R6 是**判法**，不是派工单：它们只对 §2.4 清单里那 9 个 token 成立」 |
| 6 | ✅ | 已解决 | 清单两行已给落点与依据（「候选 6，唯本件声明」∥「同档句内点名本件的 renderBlock ∥ buildAssistantRestore ∥ withLabel」） |
| 7 | 🟡 | 未解决 | 域路由件的候选数已记入「候选集是读数，不是印象」那一行；但多候选那一行的依据仍是散文：「句内 = agent 域聊天驱动」 |
| 8 | ✅ | 已解决 | §2.7 AC-2「基线 = 本设计轮实读的 `93199fe0`（`git rev-parse HEAD`）」+ 两条判定命令在册 |
| 9 | ✅ | 已解决 | §2.12 标题「交付门读数与判据读数（各判一面，互不代证）」+「把它标成诊断，AC-4 就没人判了」 |
| 10 | ✅ | 已解决 | §2 状态行下已无模板占位行；§1 状态行已无「（…）」 |
| 11 | ✅ | 已解决 | 判据脚本改走 `docNameExemption(tok) !== null` 一腿，消费面无本地豁免名单；§2.7「判据尺 = 引擎谓词，不自建名单」 |
| 12 | ✅ | 已解决 | §2.3「声明公共来源…已查无相关」在册 |
| 13 | ✅ | 已解决 | §2.10 载读数命令与输出（「## = 3 · rows = 49 · AC rows = 0」） |
| 14 | ✅ | 已解决 | §2.4「C 类｜花括号形 = 本批只一处（父侧裁）」，其余 16 处「不在本批判域」；§2.8 KD-C3 同拍 |
| 15 | ✅ | 已解决 | §2.7 AC-2「**`single` 判逐位相等**（现状 509，交付后 `= 509`）」，读数表同行 `= 509` |

计数：🔴 1 · 🟡 1 · 已解决 13

VERDICT: changes-required

### 轮次 4（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | ✅ | 已解决 | §2.2「它**由父侧旧构建量出**（§1 立项读数同源），不是本设计轮跑出来的，也不可复跑」+「218 与 0 是**两次不同构建的两读数**，既不可比较，也不相减」；引擎直调读数已被 §2 头降为「只作诊断，不作判据」 |
| 2 | ✅ | 已解决 | §1 条目 5 条 · KD-A ∥ KD-B · 上抛 5 项均在册；§2.7「§1 的「段落 4 条」是立项读数」与 §2.8「沿 §1 KD-A」两处引用均有源；收窄口径写进要求面（上抛表「C 类收窄」∥「`single` 判相等」） |
| 3 | ✅ | 已解决 | §2.4 新增「逐行桶」块，把同一份 18 处拆成 `full` 7 ∥ `multi` 10 ∥ `zero` 1、合计 18 = 9 个 token；§2.12「判据读数（AC-1 的尺 · §2.7 扫描器）：`zero` 1 ∥ `multi` 10 ∥ `full` 7 = **18 处 / 9 个 token 在判**」与之逐处相加相等；`test/` 起首那处为何落 `full` 另有一段单列理由 |
| 4 | ✅ | 已解决 | §2 内 2.1–2.4 之后直接 2.6（§2.5 整节删除）；§4「§3 前两轮的评审表逐行指着 §2.5 判过（判法④那一支现在整节删除）」+「空档留着，§2.6–§2.13 不顺移」 |
| 5 | ✅ | 已解决 | §2.4「R1–R6 是**判法**，不是派工单：它们只对 §2.4 清单里那 9 个 token 成立。另 21 个 token 在本批 15 档里裸名出现 0 处，**不给它们写落点**」 |
| 6 | ✅ | 已解决 | §2.4 两行落点与依据在册（「候选 6，唯本件声明」∥「同档句内点名本件的 renderBlock ∥ buildAssistantRestore ∥ withLabel」） |
| 7 | ✅ | 已解决 | 散文依据已换成逐字原文 + 实测：「判它的是同档那句逐字原文…其评估行 KD-SV-208 逐字写…；两件行数实测 = 746 ∥ 206」；域路由件的候选数亦记入「候选集是读数，不是印象」一行 |
| 8 | ✅ | 已解决 | §2.7 AC-2「基线 = 本设计轮实读的 `93199fe0`（`git rev-parse HEAD`）」+ 两条判定命令在册，并写明「清单外档不在 `DOCS` 里」不作判据 |
| 9 | ✅ | 已解决 | §2.12 标题「交付门读数与判据读数（各判一面，互不代证）」+「把它标成诊断，AC-4 就没人判了」 |
| 10 | ✅ | 已解决 | §2 状态行下无模板占位行（下一块即「### 批次任务与设计」）；§1 状态行末尾是实文括注，无「（…）」 |
| 11 | ✅ | 已解决 | 判据脚本「if (docNameExemption(tok) !== null) continue;    // 豁免谓词 = 引擎单源，不自建名单」；§2.7「判据尺 = 引擎谓词，不自建名单」并把该处写成一条判据 |
| 12 | ✅ | 已解决 | §2.3「声明公共来源（`index.publicRepos` …）已查无相关」在册 |
| 13 | ✅ | 已解决 | §2.10 载读数命令与输出「⇒ ## = 3 · rows = 49 · AC rows = 0」 |
| 14 | ✅ | 已解决 | §2.4「C 类｜花括号形 = 本批只一处（父侧裁）」+「其余 16 处文件形花括号不在本批判域」；§2.8 KD-C3 同拍 |
| 15 | ✅ | 已解决 | §2.7 AC-2「**`single` 判逐位相等**（现状 509，交付后 `= 509`）」+ 读数表同行 `= 509` |

计数：🔴 0 · 🟡 0 · 🔵 0 · 已解决 15（15 条全部复核，无遗留）

VERDICT: pass

## §4 用户批准（主 agent）

- **批准**：用户 2026-11-08 13:44 原话「跑完啊!按照要求走,老问我什么意思?让我给你开口子,把违规责任推给我?」——按 §2 执行、按 §3 结论交付。

### 上抛：形态面（花括号）有令无尺 = 收窄令，另立账

**裁定：把 C 类收窄到已裁的那一处；16 处文件形花括号另立一批，带自己的尺子。**

理由不是「16 处麻烦」，是**一条令配不上一把尺，就等于没有令**：

- 现在 §2.4 C 类写「展开成具体档名」，而 AC-1 的扫描器看不见花括号形——**做没做，读数都是 0**。这正是本批前面几轮反复栽的那个坑（判据看不见，绿就是买来的）。
- 两条出路我都否掉一半：**加一条 `braceForm` 读数**要同时把 16 处纳入派工——那是扩范围，得有一轮自己的设计与评审；**令照留、尺不加**则是留一条没人量的令——下次谁照它做、做没做，一样没人知道。
- 所以：**C 类当场收窄**（只保留已裁的那一处），**16 处进账**，下一批带尺子来。

**已立账**：`#2191`（16 处文件形花括号 token，`trigger = 归批`），清单与读数由设计席本轮实测给出，父侧照抄入账。

### 上抛：`single` 应判逐位相等 = 采纳

**裁定：`≤ 509` 改 `= 509`。**

`single` 是「兜底能定位、按用户裁定不改」的那一族。**这一族任何变动都是越界**——改成全路径会让它下降，`≤` 判不出来，等于给越界留了一条不报的路。**判据要能失败，就得判相等。**

同改 §2.7 读数表那一行（量法同一句），一处改齐，别只改一半。

### 上抛：判集 17 → 18 处 = 接受，且 §1 已改

**裁定：18 处就是本批派工面，不再追 17。**

审计追踪：删掉 §2.7 脚本里那张自建 `EXEMPT` 名单（评审判红第 11 条）之后，引擎的 `docNameExemption` 在 `docs/` 面**不免** `README.md`，于是 `OPS.md` 里那一处裸名（候选 7 件）现形。**这是退掉一处买来的绿，不是扩范围。**

- **回到 17 的唯一办法是把那张本地名单装回去**——那正是判红的东西。**不接受。**
- **§1 那行已由父侧改写**：原先「剩余的 17 处才是本批派工面」被替换成「本批派工面按书写形两腿扫描量出，读数见 §2.7、落点见 §2.4」——**不再写死任何数**，因为数属于判据面，写进要求面就会随判据漂。

### 上抛：§2.5 编号空档 = 保留，不顺移

**裁定：空档留着，§2.6–§2.13 不顺移。**

理由不是省事：**§3 前两轮的评审表逐行指着 §2.5 判过**（判法④那一支现在整节删除）。顺移会把这些证据指针**改指到别的内容上**——评审记录指向的对象变了，那份记录就不再是它当时判过的东西。

**编号空档是诚实的残迹，顺移是伪造的对齐。**§2 内已无任何引用落向 §2.5，机检 `dangling refs = none`。

## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）

### 父侧复量（三组，逐组独立跑）

| 组 | 命令 | 读数 |
|---|---|---|
| 判据尺 | §2.7 那支扫描器原样（脚本未改、token 集未改、桶定义未改） | 改前 `{zero:1, single:509, multi:10, full:7}` ⇒ 改后 `{zero:0, single:509, multi:0, full:0}` |
| 射程 | `git diff --name-only 93199fe0 -- docs/server/design/` | 9 档，无一在 §2.6 那 15 档之外 |
| 零产品码 | `git diff --name-only 93199fe0 -- thincoder-core thincoder-server thincoder-render-core` | 空 |
| 交付门 | `doc_check` `mode:"gate"`（15 档） | `anchors 0 ∥ paragraph 3 ∥ lineRefs 0` —— 与改前同数同位，本批一处未处置 |

**AC-1 成立**：三桶归零。**AC-2 ① 成立**：`single` 逐位相等 509——那批按用户裁定保持原写法、一个字没动。**AC-2 ② 成立**：改动集合 ⊆ 15 档，产品码三树零改动。**AC-4 成立**：段落面 ∥ 行号坐标面与改前逐位相同。

### 两处父侧裁决（落实轮上抛）

**裁 1：`docs/server/design/PROJECT.md` 那一处按句意落桌面那件，采纳设计席的读法。**

原句是「缝件新建 = …（…——沿桌面 … 先例）」，**裸名前面有「沿桌面」四个字做限定**，指的是桌面那一件；写成 server 的会读成「新建件沿自己的先例」，句意反了。两件都在盘，判据面读不出差别——**这正是「判据只判解不解得出、不判指的是哪一件」的正面例证**，所以这一处靠人判。

**§2 ↔ §5 对账**：§2.4 表里该行记的落点是 server，与落地不同。**记在此处，不改 §2**——该段冻结在评审时的那一版，回改会让 §3 的证据指针改指。差异成立且已裁，这是对账允许的第二种结局。

**裁 2：C 类的机检判据改为「已裁那一处 = 0」，不判全域。**

原判据「15 档围栏外 `i18n-{` = 0」按现口径**不可能成立**：读数 10 处，全部是 §4 划给 `#2191` 的 16 处（`i18n-{zh,en}` 3 ∥ `-core` 2 ∥ `-admin` 3 ∥ `-me` 1 ∥ 多域名 1）。已裁的那一处（`i18n-{zh,en}-system`）读数 = 0。

**一条永远红的判据等于没有判据**——本批已经因这个形状栽过一次（花括号移出时说过同一句话）。故按「只判本批射程内那一处」改。

### §2.4 两条依据的更正（落点不变，设计席自报）

- `package.json` 那行的「唯此件声明」不实——桌面 ∥ VSC ∥ render-core 三处也声明；落点仍取 server 的（句内讲的是该页所属包体），**理由换真**。
- `block.mjs` 那行里 `withLabel` 不在该件导出面；`renderBlock` 与 `buildAssistantRestore` 在，落点成立——**导出面证不了的那一个符号已从依据里去掉**。

### 台账

`#2176`（core · 归批）→ 核销；证据 = 本节三组读数。`#2190`（TIMEOUT-DIGEST 两处裸名拖出 token 集）∥ `#2191`（花括号 16 处）按原条件留在池里，本批不处置。

### 前批遗留 ∥ 暂缓批

前批 `docs/batches/2026-11-08-pointer-debt.md` 已收口。暂缓批复核：无。

### 单元测试档 ∥ 集成测试差量

纯 `.md` 改动：无单元测试档；集成测试差量 = 破 0 ∥ 冗余 0 ∥ 新增 0（本批不改任何业务可观察结果）。

### 门检

本节落笔回执：`DOC-CHECK GATE: PASS`。
