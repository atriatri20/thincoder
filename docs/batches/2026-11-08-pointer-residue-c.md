# 2026-11-08 · pointer-residue-c
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 12:31「2174梳理掉吧，别挂着了，文档多分分批，并发处理」——C 簇：`docs/server/design` 15 档。
> 台账 = #2176（core · 归批）。前情 = docs/batches/2026-11-08-pointer-debt.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：✅ 设计完成 · 2026-11-08
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| # | 条目 | 覆盖 | 判据锚 |
|---|---|---|---|
| 1 | server 15 档锚命中 218 条清到 0 | 覆盖 | §5 AC-1 |
| 2 | 多候选（后缀候选 ≥2）逐处按上下文定**一个**目标，写成仓根全路径 | 覆盖 | 本文「判法 ①」∥ AC-2 |
| 3 | 零命中：改名 ∥ 合并 ∥ 拆档 ⇒ 改指继任者；真删 ⇒ 去指针、改写成不含路径的叙述 | 覆盖 | 本文「判法 ②」∥ AC-2 |
| 4 | 判不了的逐条列出（档 · 行 · token · 为什么判不了） | 覆盖 | AC-3 |
| 5 | 段落面（基线 4 条）· 行号坐标 0 处 | **不在本批** | 本文「判法 ③」∥ §2.7 AC-4（不新增：≤3 · 行号坐标零变） |

### 射程读数（基线；尺子 = 本仓引擎）

本批所有读数取本仓引擎，不取会话里的 `doc_check` 工具——后者是全局旧构建，不带上一批落地的第 6′ 步唯一后缀兜底。同一份 15 档清单，旧构建报 856 条、本仓引擎报 218 条：**两个数都对，差在尺子；判据只认本仓引擎**。

```text
node -e "import('./thincoder-core/doc-check/index.mjs').then(m=>{const r=m.runDocCheck(process.cwd(),{docs:['docs/server/design/...' ],mode:'gate'});console.log(r.report.split('\n')[0])})"

改前：DOC-CHECK GATE: REFUSED（锚 218 条 · 4 段文字太长，难于阅读）
逐档：ADMIN-AGENT 57 · PROJECT 25 · EXECUTION 20 · I18N 18 · SANDBOX 17 · WEBUI 15
      CHAT 12 · MEMBER-AGENT 10 · MCP 9 · SYSTEM 7 · TABS 7 · PROJECTS 6
      STYLE 6 · TERMINAL 5 · OPS 4
distinct token 85 · 后缀索引建 1 次 · 第 6′ 步已解析 634 处
```

### 三类判法（判什么、怎么处置）

**判法 ①｜多候选**——仓内有两份以上同名档。判据 = **上下文**：同节的模块归属、同句写的落点、邻行的同类项。处置 = 写成仓根全路径。

- 上下文判不了的**不许猜**：报上去，列进 AC-3 的清单。名字像不是判据。
- **同一个 token 在本批多处出现，逐处判**：`store.mjs` 在一份档里既可能指 mcp 那份、也可能指渲染端那份，两处同形不同指。

**判法 ②｜零命中**——仓内没有这份档。两问按序：

- 它还以别的名字 ∥ 位置在吗（改名、合并、拆档、迁入别的包）⇒ 改指继任者；
- 真没了 ⇒ 删掉这次提及，或改写成不含路径的叙述（写「哪个面被验过」，不写死档名）。
- **禁令**：不许换成「一个名字像的」——那是把死指针换成假指针，比留着更难查。

**判法 ③｜段落 · 行号坐标**——不在本批射程，一个字不动。它们的零变本身就是 AC-2 的一部分（证明没有顺手改）。

### 边界

- 可改：`docs/server/design/` 下本批 15 档（清单见 §2 条目表，逐档读数见上）。
- 不动：清单外的任何档（含 `docs/server/design/webui/` 下不在清单里的那几档）· 产品码 · 需求档 · 台账 · 本档 §1 §3 §4 §6。
- 同一条指针在多档各红是**正常态**：每档各自判，不跨档「顺手也改一下」。

### 验收对照

**AC-1 锚命中归零（本批主判据）**：上文命令、`mode:'gate'`，15 档锚 hits = **0**。父侧 2026-11-08 裁：段落 4 条不动 ⇒ 首行仍 `REFUSED`，判据落锚面、不落首行 `PASS` 字样（见 AC-4）。

**AC-2 两类零变（证明射程没外溢）**：同一跑里段落 4 条、行号坐标 0 处与改前逐位相同；清单外档的命中数不动。

**AC-3 判不了的清单**：档 · 行 · token · 为什么判不了（候选都说不通 ∥ 继任者查不出）。清单为空也要写「空」。

**AC-4 gate 首行的口径**：AC-1 只判锚面。段落 4 条不在射程 ⇒ 即使锚归零，gate 首行仍是 `REFUSED`。**判据落在锚那一项，不落在首行的 PASS 字样上**——这条写死在 §2，避免实施侧为了 PASS 去动段落。

### 关键决策

**KD-A 零命中以「去指针」为主处置，不造继任者**

依据 = 这批零命中绝大多数是历史上的一次性单测档名（批档收口即删是既有纪律），今天本就没有对应档。给它们编一个「继任档」= 造一份不存在的证据。故：能说出「哪个面被验过」的改写成叙述，说不出的删掉提及。

**KD-B 多候选写仓根全路径，不写「包内相对」**

上一批否决「包根映射」的理由仍成立（文档按包内相对写、解析按仓根收），但那是解析面的事；本批是逐处人判，写全路径是唯一不依赖解析猜测的形态，且与 D4 的指针形态同源。

### 上抛项

**三条上抛已裁（父侧 2026-11-08 12:44）**：

- **① 段落 4 条不动**——AC-1 落「锚 0 · 段落零变」；gate 首行 `REFUSED` 是存量，不是本批交付。
- **② 设计档不许指尚未落盘的待建档**——计划里的档名写成角色叙述：保留计划、去掉路径形态。
- **③ 写门与报告面同尺**——「两把尺子」这个诊断撤掉（父侧纠正：写门直接调 `runDocCheck`，唯一后缀兜底写死开着；拒掉的 57 条是真红）。差的是**判集**：写门判改动区整段，报告面判单点。

### 六条判法（父侧定；本批唯一的处置口径）

| # | 判法 |
|---|---|
| R1 | 现态指针 ⇒ 仓根全路径；多候选按上下文选一处 |
| R2 | 非仓内名 ⇒ 不带路径形态的叙述（依赖包内部件 → 包名 + 件名去扩展名；构建生成物 → 说它是什么；用户数据目录档 ∥ 运行期配置名 → 说它在哪一类） |
| R3 | 已删的测试 ∥ 探针件 ∥ 计划档 ⇒ 角色叙述，不写档名 |
| R4 | 沿革 ∥ 历史段里的旧路径 ⇒ 叙述形 |
| R5 | 站点仓件 ⇒ `thincoder.com` 已声明；写带前缀全形 |
| R6 | 按段推进：一段一起清（写门判集 = 段，一条红连坐整段） |

### 落地约束（写门与报告面同尺；判集 = 段）

动手第一笔就撞出来的事实，改写「写全路径」这条判法的适用面：

```text
改 WEBUI.md 的一批裸名（replace_all，只碰带反引号的形）
⇒ 写门拒：DOC-CHECK GATE: REFUSED（锚 57 条），零字节落盘
   拒的不只是我改的那几个 token，是**本次改动区的整段**
   其中 nav.mjs ∥ style.css ∥ health.mjs ∥ views-*.mjs 这些
   在报告面上已被第 6′ 步（唯一后缀）判绿
```

**结论（两条，都是操作性的）**：

- **写门与报告面同尺**：两边都走唯一后缀兜底，同一份 token 集合两边都判红。差的是判集——报告面判单点，写门判**改动区整段**。所以单位是段，不是一条指针：一条红连坐整段。
- **改动区是不可分割的判面**：一行里只要还有一个裸名，这一行的任何修改都落不了盘。故本批的施工单位是**一段（一张表 ∥ 一节）**，不是一条指针。

### 判不了 / 已判出

- **已判出**（原判不了，现按证据定）：`docs/server/design/webui/CHAT.md` 的 `attach.mjs` ⇒ `thincoder-render-core/composer/attach.mjs`。依据 = 该件导出 `withAttachedFiles` 与三限常量（`TEXT_MAX_BYTES` ∥ `TEXT_TURN_MAX_FILES` ∥ `TEXT_TURN_MAX_BYTES`），与文中「核 `attach.mjs` 三限 + `withAttachedFiles`」逐字对上；桌面渲染件不具此导出面。
- **形态类**（花括号缩写，如 `i18n-{zh,en}-me.mjs`）：文件都在盘，写门只认展开形 ⇒ 展开成两个具体档名（父侧已认）。
- **计划档**（OPS 的装配断言档 ∥ MCP 的弹窗体预案 ∥ ADMIN 的三处拆档名）：按父侧裁 ② 写角色叙述——保留计划、去掉路径形态。

### 批次任务与设计（eng-designer · 本批唯一实施依据）

> 尺子 = 本仓引擎 `thincoder-core/doc-check/index.mjs`（`runDocCheck`）；本批读数只取 §2.2 那一份，别处不取数。
> 父侧本轮已验：写门与报告面同尺（两侧都走唯一后缀兜底），**只清真红**（多候选 ∥ 零命中）；已由兜底判绿的裸名不在射程。

#### 2.1 本批条目与判据锚

| # | 条目 | 覆盖 | 判据锚 |
|---|---|---|---|
| 1 | server 15 档锚命中 218 条清到 0 | 覆盖 | §2.7 AC-1 |
| 2 | 多候选（后缀候选 ≥2）逐处按上下文定**一个**目标，写成仓根全路径 | 覆盖 | §2.7 AC-2 ∥ §1 判法 ① |
| 3 | 零命中：改名 ∥ 合并 ∥ 拆档 ⇒ 改指继任者；真没了 ⇒ 叙述形（不写档名） | 覆盖 | §2.7 AC-2 ∥ §1 判法 ② |
| 4 | 判不了的逐条列出（档 · 节 · token · 为什么判不了） | 覆盖 | §2.7 AC-3 |
| 5 | 段落面（基线 4 条）· 行号坐标 0 处 | **不在本批** | §2.7 AC-4（不新增：≤3 · 行号坐标零变） |

#### 2.2 射程读数（改前基线 · 尺子 = 本仓引擎）

```text
node -e "import('./thincoder-core/doc-check/index.mjs').then(m=>{const r=m.runDocCheck(process.cwd(),{docs:<15 档清单>,mode:'gate'});console.log(r.report.split('\n')[0],JSON.stringify(r.hits),r.suffixHits.length,r.suffixBuilds)})"

本设计轮实跑：DOC-CHECK GATE: REFUSED（锚 218 条 · 4 段文字太长，难于阅读）
hits = {total:222, anchors:218, paragraph:4, lineRefs:0}
后缀兜底 634 处 · 后缀索引建 1 次
逐档：ADMIN-AGENT 57 · PROJECT 25 · EXECUTION 20 · I18N 18 · SANDBOX 17 · WEBUI 15
      CHAT 12 · MEMBER-AGENT 10 · MCP 9 · SYSTEM 7 · TABS 7 · PROJECTS 6
      STYLE 6 · TERMINAL 5 · OPS 4
distinct token 85
```

#### 2.3 设计落点

- **不新增设计档**：本批是存量 15 档的指针面收正，无新机制。指针形态的定规已住 `docs/core/design/DOC-DISCIPLINE.md`；处置口径 = 本文 §2.4（一次性、随批）。
- **最近先例**：同一条判法链的前情批（`docs/batches/2026-11-08-pointer-debt.md`，已收口）——对齐处 = 逐处人判 + 仓根全路径；偏离处 = 本批补「形态类展开」与「零命中叙述形」两条，因为前情批没有花括号缩写与批次单测档名这两类存量。
- **公共来源已查**：`doc_search` 查「指针 仓根全路径 后缀兜底」→ 命中 `docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/design/PATH-RESOLUTION.md`，两处口径与本批判法一致，无冲突。

#### 2.4 处置表（实施单一依据 · 逐 token）

**A 类｜webui 域裸名 ⇒ 默认 `thincoder-server/public/<名>`**（父侧本轮令；控制台 = server 自有静态面）。A 类是**默认**，句子自带归属的**按上下文覆盖**，并写明这一处为什么覆盖：

- `docs/server/design/webui/CHAT.md` §2.1「基准 = VSC `thincoder-vscode/webview/index.html` 三段 + 内核两件」⇒ 保留 VSC 全路径，不落 A 类。理由 = 该句自指 VSC 的 `index.html`（句内已写宿主归属），按 A 类写成 `thincoder-server/public/index.html` 派出一条错指。

| token | 目标 |
|---|---|
| app.mjs | `thincoder-server/public/app.mjs` |
| dom.mjs | `thincoder-server/public/dom.mjs` |
| i18n.mjs | `thincoder-server/public/i18n.mjs` |
| index.html | `thincoder-server/public/index.html` |

**B 类｜服务端域裸名 ⇒ 按所在域的件**

| token | 目标 | 依据 |
|---|---|---|
| chat.mjs | `thincoder-server/src/agent/chat.mjs` | 上下文 = agent 域聊天驱动 |
| run.mjs | `thincoder-server/src/agent/run.mjs` | 上下文 = 任务出口件 |
| providers.mjs | `thincoder-server/src/gateway/providers.mjs` | 上下文 = 服务端 provider 面 |
| proxy.mjs | `thincoder-server/src/gateway/proxy.mjs` | 上下文 = 代理页与网关传输 |
| ssh.mjs | `thincoder-server/src/sandbox/ssh.mjs` | 依据 `docs/server/design/agent/ADMIN-AGENT.md`「`createSshExecutor`（同件）」 |
| quota.mjs | `thincoder-server/src/sandbox/quota.mjs` | 上下文 = sandbox 域档内的执行配额面 |
| routes.mjs（sandbox 域档） | `thincoder-server/src/sandbox/routes.mjs` | 同节模块归属 |
| routes.mjs（agent ∥ MCP 域档） | `thincoder-server/src/mcp/routes.mjs` | 依据 `docs/server/design/agent/ADMIN-AGENT.md`「复用 `mcp/` 域件零第二实现」 |
| store.mjs | `thincoder-server/src/mcp/store.mjs` | 同上（MCP 域件） |
| secret-prompt.mjs | `thincoder-desktop/renderer/secret-prompt.mjs` | 上下文 = 桌面同族件 |
| protocol.mjs | `thincoder-server/deploy/sandbox/member-shell/protocol.mjs` | 上下文 = 盒壳帧面单源 |
| presets.mjs | `thincoder-server/src/ops/presets.mjs` | 上下文 = 运维预设面 |
| rc-resolve.mjs | `thincoder-server/test/rc-resolve.mjs` | 上下文 = 服务端测试面 |
| package.json | `thincoder-server/package.json` | 上下文 = 本板包体声明 |
| attachments.mjs | `thincoder-core/attachments.mjs` | 依据 `docs/server/design/agent/ADMIN-AGENT.md`「`@thincoder/core/attachments.mjs`」 |
| context.mjs | `thincoder-core/context.mjs` | 上下文 = 核压缩面载入 |
| config.mjs | `thincoder-core/config.mjs` | 依据 `docs/server/design/agent/ADMIN-AGENT.md`「`@thincoder/core/config.mjs` `resolveCompactThreshold`」 |
| team.mjs | `thincoder-core/team.mjs` | 依据 `docs/server/design/PROJECT.md`「核内 = 客户端登录侧（`thincoder-core/team.mjs`）」 |
| index.mjs（EXECUTION） | `thincoder-server/deploy/sandbox/member-shell/index.mjs` | 上下文 = 盒壳引导序入口 |

**C 类｜形态类 ⇒ 展开成具体档名，不留花括号 ∥ 省略号 ∥ glob**

```text
i18n-{zh,en}-<域>.mjs        ⇒ thincoder-server/public/i18n-zh-<域>.mjs ∥ thincoder-server/public/i18n-en-<域>.mjs
                               域集 = me ∥ core ∥ sandbox ∥ project ∥ ledger ∥ mcp ∥ system（逐处按所在档判）
…-<批名>.test.mjs（省略号形） ⇒ 不展开（档已不存）⇒ 走 E 类叙述形
```

**D 类｜两条已判出的单点**

- `docs/server/design/webui/CHAT.md` 的 `attach.mjs` ⇒ `thincoder-render-core/composer/attach.mjs`。
  依据 `thincoder-render-core/composer/attach.mjs`「export function withAttachedFiles(text, files) {」与同档三限常量 `TEXT_MAX_BYTES` ∥ `TEXT_TURN_MAX_FILES` ∥ `TEXT_TURN_MAX_BYTES`；
  桌面件 `thincoder-desktop/renderer/attach.mjs` 不具该导出面。本设计轮已复跑该判据，成立。
- `docs/server/design/webui/PROJECTS.md` 与 `docs/server/design/webui/SYSTEM.md` 的 `PROJECT.md` 指针 ⇒ `docs/server/design/PROJECT.md`；
  其中 SYSTEM 档指的「需求档 PROJECT」⇒ `docs/server/requirements/PROJECT.md`。

**E 类｜零命中 ⇒ 叙述形（不写档名，不造继任者）**

按角色分四小类，实施侧逐处换成角色叙述，句意保留：

```text
批次单测档（收口即删）        ⇒ 「本批单测档（批次面，收口即删）」——含 2026-*.test.mjs ∥ …-<批名>.test.mjs ∥ docs/batches/*.test.mjs
计划档 / 预案 / 待建档        ⇒ 「拆档预案（对象角色，未在盘）」——含拆档预案件、弹窗体预案件、装配断言计划档、
                                计划新增的代理页件
运行期数据档                  ⇒ 「槽内状态件（运行期生成，随槽）」——含槽内状态档名
角色件（非仓内档名）          ⇒ 「描述符树（属性对象）」等角色叙述——含桌面描述符树件名、任务面装配件
```

#### 2.5 判法④｜路径旁那句现状断言一起判

改指后，同一句里的读数 ∥ 断言须与新目标同指。撞上不同指的地方 ⇒ **报，不改数**（`§5` 记一行「档 · 节 · 断言 · 差在哪」），因为改数 = 改事实，那是另一笔。

#### 2.6 受影响文件与测试覆盖

- **改动面 = 15 档**（清单见本次 spawn 声明；全部在 `docs/server/design/` 下）。
- **零源码、零产品码、零需求档、零台账、零 RTM。**
- **tier 结论：无跨档**。逐档同批改完，不新增档，不拆档；`.md` 无尺寸档位义务。
- **验收载体 = 本仓引擎读数**（命令与阈值见 §2.7）。本批无代码面 ⇒ 无单元测试档；不新增集成用例（理由 = §2.10）。

#### 2.7 验收对照（机检）

```text
node -e "import('./thincoder-core/doc-check/index.mjs').then(m=>{const r=m.runDocCheck(process.cwd(),{docs:<15 档清单>,mode:'gate'});console.log(r.hits.anchors,r.hits.paragraph,r.hits.lineRefs,r.report.split('\n')[0])})"
```

- **AC-1（主判据）**：`hits.anchors === 0`。判据落锚那一项，不落首行 `PASS` 字样（段落桶仍有存量，见 AC-4）。
- **AC-2**：`hits.anchors === 0` 即两类全覆盖——多候选已定一（全路径形，不再走后缀兜底），零命中已换叙述形。
  另两项零变：清单外档不在本次 `docs` 里，天然不入判；`suffixHits` 只降不增（改前改后同为 634）。
- **AC-3**：判不了清单 = **空**。实施侧若撞出新的一处 ⇒ 记 `§5`（档 · 节 · token · 为何判不了）并入报告，**不许猜**。
- **AC-4（段落面；父侧 2026-11-08 裁改判据）**：`hits.paragraph ≤ 3`（基线 4——不新增）∧ `hits.lineRefs === 0`（与改前同）。
  段落桶 4 → 3 是落笔的通行代价（拆 `docs/server/design/webui/SYSTEM.md` 键族登记块以解锚），**不是本批的段落面工作**；余下三条超长段一处不动。

#### 2.8 关键决策

- **KD-C1｜webui 域裸名一律落 `thincoder-server/public/`**。理由 = 控制台静态面单源；父侧本轮令；与指针形态纪律同源。
- **KD-C2｜零命中一律叙述形，不造继任者**。沿 §1 KD-A：给已删的批次单测档编一个「继任档」= 造不存在的证据。
- **KD-C3｜形态类一律展开成具体档名或降为叙述**。花括号 ∥ 省略号 ∥ glob 都不是可解析指针，留一个就永远红。
- **KD-C4｜`attach.mjs` 的判据 = 导出面**，不用「名字像」。见 §2.4 D 类，已复跑成立。
- **KD-C5｜按节推进**。写门的判集 = 改动区整段，一条红连坐整段 ⇒ 施工单位是节，不是单条指针。
- **被否**：①「包内相对 + 包根映射」——前情批已否；解析面已有兜底，再引入第二套映射 = 两个真相。
  ②「红 token 一律写成 `@thincoder/<包>/<件>`」——包内路径不是仓根路径，机检不认。

#### 2.9 边界

- 不动：清单外任何档 · 产品码 · 需求档 · 台账 · 本档 §1 §3 §4 §6 · 余下超长段 · 行号坐标。
- 不写「已废弃 ∥ 已退役」历史句；改指后旧路径形态就地删净，不留对照。
- 同一条指针在多档各红 = 正常态：逐档各自判，不跨档顺手改。

#### 2.10 集成测试设计（RTM 增量）

`test/RTM.md` 无行要改：本批零代码改动，不动任何业务可观察结果，既有行断言的交互不受影响。不新增行——两条入口皆不成立：无新业务场景，无生产问题。收口行按「无集成面改动」报。

#### 2.11 上抛项

**无未决上抛；两条已裁（父侧 2026-11-08）**：

- `attach.mjs` ⇒ 按导出面取 `thincoder-render-core/composer/attach.mjs`，不进 AC-3（依据见 §2.4 D 类）。
- AC-1 ∥ AC-4 的互斥 ⇒ 取乙：拆 `docs/server/design/webui/SYSTEM.md` 键族登记块落笔、锚落 0，AC-4 改判「不新增（≤3）」。理由 = 交付面不让位于副作用面；AC-4 的段数变化是落笔的通行代价。

#### 2.12 实施轮落点与验收复跑（2026-11-08）

**验收命令（正文可跑，无省略形）**：内置工具 `doc_check`，`mode:"gate"`，`target:"D:\teamcode\thincoder"`，`docs` = 下列 15 档逐档：

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

**三次读数（同一把尺 = 内置工具 · 同一 15 档清单）**：原始基线 `锚 218 条 · 4 段文字太长` ⇒ 本设计轮复跑 `锚 1 条 · 4 段文字太长` ⇒ 本批落笔后 `锚 0 条 · 3 段文字太长`（`suffixHits` 634 恒定 · 后缀索引建 1 次）。

**AC-1 已落 0**：余的那一条 = `docs/server/design/webui/SYSTEM.md` §3 键族登记块里的 `i18n-{zh,en}-system.mjs`。按父侧裁（取乙）处置：该块拆成四个带名列表项（`proxy.*` 十五键按「代理行 ∥ 测试块 ∥ 读数与校验」分组，`admin.providers.useProxy` 单列一组），指针展开为 `thincoder-server/public/i18n-zh-system.mjs` ∥ `thincoder-server/public/i18n-en-system.mjs`。

**AC-4 改判成立（段落桶 4 → 3）**：三条超长段一处未动 —— `docs/server/design/webui/PROJECTS.md` §2.4 ∥ `docs/server/design/webui/SYSTEM.md` §2.1 ∥ `docs/server/design/webui/SYSTEM.md` §3；行号坐标零变（0）。段落桶减少的 1 条 = 拆段落笔的通行代价，不是本批的段落面工作。

**AC-3 清单**：空 —— 曾判不了的一处（`docs/server/design/webui/SYSTEM.md` 的 `i18n-{zh,en}-system.mjs`）已按上裁落盘；全程未出新判不了项。

#### 2.13 流程事实（落笔时序 ∥ 笔权）

- 落笔时序 = 父侧派单所定（「先写 §2，再逐档落」）；偏差属实，归因父侧。
- 需求档 ∥ 设计档笔权按 D1；本批 15 档的指针修形由父侧采认承接（内容零语义变更，读数在 `§6` 记）。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
