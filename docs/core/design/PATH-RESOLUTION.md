# PATH-RESOLUTION · 路径解析统一层

> 板块 = core/design。本档 = 「相对路径 → 绝对路径」的机制单源。
> 七个吃路径的面各自只保留**受理判据**（存不存在 / 是不是文档 / 能不能读 / 落不落基底内）；「一条路径指向哪里」只由本层回答。
> 代码落点：`thincoder-core/path-resolve.mjs`（叶档：只 import `node:*` + `thincoder-core/declared-repos.mjs`（`declaredOutEdges`：声明出边的三合投影）+ `thincoder-core/manifest.mjs`（`projectRootView`））。

## 1. 方案与理由

**模块目标**：让所有吃路径的工具参数走同一条解析层，把一条相对路径判成四态之一——解析出唯一落点 / 判不出唯一（列候选、停下）/ 解析无果（报缺哪一段）/ 存在性判不了（声明仓的声明根不在本机，列报、不入闸）。

### 1.1 要解的病

七个面各持一份「根判定」：有的按会话锚、有的按 manifest 声明、有的按仓根、有的没有基根。于是同一条相对路径在 A 面解析通过、在 B 面判缺，而各面给出的拒因词也各说一套。

病根不是用法，是**没有共用解析层**：同一件事七个写点 ⇒ 同一句输入七种答案，且没有一处能对齐。

### 1.2 最近先例

- `existing: thincoder-core/doc-check/anchors.mjs`（私有函数 `resolveDoc`）· 形 = **两级解析序**：① 项目根相对（`resolve(base, token)`）→ ② 引用方档所在目录相对（`resolve(dirname(refFile), token)`）；零命中 ⇒ 判缺。
  **对齐 = 零偏离**：本层的基根次序逐字沿用这两级、同序（KD-2）。偏离只在三处——① 本层把结果判态化（四态）；② 允许调用面追加自声明的基底当第三级；③ `referrer` 缺位时兜到会话锚当第二级（先例无此兜底——不兜则第二级在「手上没有引用方档」的面整段消失，而七面里多数调用点正是这一形）。
- `existing: thincoder-core/declaration.mjs` · name: `declaredPublicRoots` ∥ `resolveDeclaredRef` · consumers: 台账 `task_book` 指针写门 ∥ 迁移旗 ∥ `thincoder-core/declared-repos.mjs`（本层与环检共用的声明出边投影）。
  形 = 声明公共仓的绝对根集由 `declaredPublicRoots` 单点给出，「首段命中声明仓目录名 ⇒ 于该声明根解析余段」。
  **对齐 = 零偏离**：本层的声明仓腿走的就是这条腿——同一份仓名集（`declaredPublicRoots` 各根的 `basename`，不重建第二份声明表）、同一个首段匹配、同一条解析序。
  偏离只剩一格，且是这一层必须自己答的那一格：声明根**不在本机**时存在性判不了，落 `unverified` 列报，而不是判缺（§2.7）。
- **投影单源**：仓名集 ∥ 声明项原文 ∥ 声明根在盘三件的投影只写一份 = `thincoder-core/declared-repos.mjs` 的 `declaredOutEdges`；解析腿与环走查都调它。
- `existing but unusable: thincoder-core/agent-tools/batch-paths.mjs` · 形 = 候选序 cwd → 项目根 → 声明基底，加锚定防嵌套与落基底内判据。
  **不可复用之处**：它一半是**落位判据**（新档须落基底内、不许二次拼接、fail-closed 上抛）。那是「准不准落这儿」，与本层的「指向哪儿」是两个问题；合进来会让 create 的拒写语义渗进读面。
  **复用面**：它的候选序形状是本层基根序的来源之一；落位判据原地留存（见 §7 边界）。

### 1.3 调研证据

- `doc_search` 与设计档目录全 grep「路径解析 / 解析层 / 基根」：命中的都是各面自己的路径条款——批次档的相对路径解析序（`docs/core/design/BATCH-RECORD.md` §4.15）、评审文档受理（`docs/core/design/ADVISOR-GUARDS.md` §12）、docRoot 解析管线（`docs/core/design/MANIFEST.md`）。**没有任何一档描述统一层**。
  判读：这是**新建机制**，不是收正既有机制——所以没有「既有档就地改」的落点，新建本档；既有各面各改一句为引本层（§3）。
- 声明源的读取面单点：该键在 `thincoder-core/agent-tools/manifest.mjs` 里只有一条工具描述串（`key` 参数的说明），而在 `thincoder-core/declaration.mjs` 里由 `declaredPublicRoots` 读成绝对根集；出边三件由 `thincoder-core/declared-repos.mjs` 在其上投影一次。
  判读：「能引谁」与「判据认谁」是同一份值——声明表由 `declaredPublicRoots` 单点读出，锚判据经本层消费它（§2.7），不存在第二个声明面。
- 公开源仓勘察：公开源声明面 = `PROJECT-MANIFEST.json` 的 `index.publicRepos`（现值以该档为准，本档不抄值）；声明项指向工作区工具目录，不是公共文档仓——本机制的既有设计档只在 `docs/core/design/**` 内，库外无相关先例可引。

## 2. 接口契约

### 2.1 一个函数，四态结果

```
resolvePathTarget(anchor, given, opts) → Result
```

| opts | 形 | 用途 |
|---|---|---|
| `referrer` | `string`（绝对路径，可选） | 谁在指这份档（在飞批次档 / 评审 batchDoc / 被检文档）——只取它的目录当「所指目录」基根 |
| `bases` | `string[]`（可选） | 本面声明的**第三级解析基底**（`docRoot.batches` …）——命中即 `resolved`，不改前两级的次序 |
| `scanBases` | `string[]`（可选） | **只喂同名候选的扫描根**（`docRoot` 各键）——不参与解析、不产 `resolved`；面要的是「你是不是指这个」而不是放宽受理时传它 |
| `kind` | `"file"` \| `"dir"` \| `"any"` \| `"none"` | 存在判口径，缺省 `"file"` |
| `order` | `"root-first"`（缺省）\| `"near-first"` | 前两级基根的次序：项目根先 ∥ 所指目录先（逐面声明，KD-2 / KD-3） |
| `declaredRepos` | `boolean`（缺省 `false`） | 声明仓腿：开 ⇒ 首段命中声明仓目录名时于该声明根解析余段（只有文档锚面传它，KD-10） |

| state | 载荷 | 含义 |
|---|---|---|
| `resolved` | `abs: string` | 判出唯一落点 |
| `ambiguous` | `candidates: string[]` | 判不出唯一 ⇒ **停下要人挑**（不猜） |
| `dangling` | `missing` · `sameName` · `level`（`base` \| `path`）· `tried`；跨仓两形另带 `declaredRepo` · `declaredRoot` · `rootOnDisk` · `siblingRepos` | 解析无果 ⇒ 报**缺的那一段** + 列同名候选；`level` 说明缺在基根还是缺在路径段；`tried` = 基根序下试过的绝对候选（**只作读数、不入判据**——既有拒文里带解析后绝对路径的面从这里取，例如评审面 `resolved` 字段） |
| `unverified` | `declaredRepo` · `declaredRoot` · `relPath` · `declarationEntry` | 已声明、仓名与形态都合规，但**声明根不在本机** ⇒ 存在性判不了：列报、不入闸（§2.7、KD-9） |

**四态各自的分支依据**（每一支都必须能填出这一格；填不出就删掉这一支）：

| state | 依据（现场读数 / 可复现路径） |
|---|---|
| `resolved` | 今天能成的那些调用本来就是这一支：`batch append` 传完整仓根相对路径、`doc_check docs:[...]` 传全路径——都当场判对 |
| `ambiguous` | 会话锚 = 上级目录（下辖多个项目）：`ledger count` 不带 `cwd` ⇒「未找到项目根」；`doc_check` 不带 `target` ⇒ `ERROR（多项目工作区）`。两条是同一个病：判不出唯一根 |
| `dangling` | `batch append` 传裸档名 ⇒ 门判档缺、整段零字节落盘（2026-11-02 立题当日四次实撞的最后一次） |
| `unverified` | `docs/core/requirements/PROMPT-SYSTEM.md` ⑤ 的「未核」格：已声明 ∧ 声明根不在本机 ⇒ 列报不入闸。理由只有一条——clone 位置因人而异，存在性跨机器不成立（§2.7） |

### 2.2 判定算法

1. **归一与缺省分野**：字符串取 `trim`，`\` 归成 `/`。两形分开判，结果态不同：
   - **参数缺省（`undefined`）≠ 空串**：缺省 ⇒ 没有路径可判，跳过第 1–3 步，直接按第 4 步查锚根——判得出唯一根 ⇒ 以其为基根续判；判不出 ⇒ `ambiguous{candidates}`（§2.3 有候选）∥ `dangling{level:"base"}`（零候选）。真实现场即这一支：`ledger count` 不带 `cwd` ⇒「未找到项目根」；`doc_check` 不带 `target` ⇒ `ERROR（多项目工作区）`。
   - **空串 / 非字符串** ⇒ `dangling`（`level:"path"`，`missing` = 该参数本身）。
2. **绝对路径**：直接 `resolved(abs)`，零基根走查（各面受理判据照旧）。依据：现场没有一例是绝对路径出错，改这一形是零收益的回归面。
3. **`kind: "none"`**：取候选序首个为 `resolved`，恒不产 `ambiguous` / `dangling` / `unverified`。依据 = `files` 只做调度、不校验存在性（§7 边界），现存行为即如此。
4. **基根序**（缺哪级就跳过；`order` 决定前两级的先后）：
   - `root-first`（缺省）：① `resolveProjectRoot(anchor)` → ② `referrer` 的目录（无 `referrer` ⇒ 会话锚 `anchor`）→ ③ `opts.bases` 逐项。
   - `near-first`：① `referrer` 的目录（无 `referrer` ⇒ 会话锚）→ ② 项目根 → ③ `opts.bases` 逐项。
   - 解析不出项目根时分两形：`workspace` ⇒ 项目根这一级不成立，直接走 §2.3（判 `ambiguous`）；`none` ⇒ 项目根这一级**以会话锚充作**，两级照常走查（锚是手上唯一的基根，§2.3 有依据）。
   - `scanBases` 不进这一步——它只在第 7 步的 `dangling` 上供同名候选（§2.4）。
5. **判态**（前两级择一 · 第三级判多）：前两级基根（第 4 步 ①②，按 `order`）**首命中即 `resolved`**——按序逐级 `existsAs`，第一份现存者胜出，后一级不再看；第三级 `bases` 逐个取现存候选——恰一 ⇒ `resolved`，≥二 ⇒ `ambiguous`（全部列出，按基根序列候选）。
   - 依据 = KD-2 的那句理由「顺序只在两个基根各有一份同名且都存在的档时才有可观察差异」：次序要可观察，只能靠首命中择一；前两级判多则 `order` 无从生效，AC-11 的两条断言也不成立。
6. **声明仓腿**（仅 `opts.declaredRepos` 为真、输入**多段**、且第 4–5 步零命中）：首段命中声明仓目录名 ⇒ 于该声明根解析余段，根不在本机 ⇒ `unverified`。见 §2.7。
7. **零命中且未命中声明仓名** ⇒ `dangling`（`level` = 缺在基根还是缺在路径段）。

### 2.3 多仓根：判不出唯一 ⇒ 停下（不猜）

`projectRootView(anchor).state === "workspace"`（下辖有已注册项目，1 ∥ ≥2 同判）⇒ 项目根这一级不成立 ⇒ 候选 = 下辖项目全列（按名排序）——候选报的是「可以选哪几个根」，不是「哪几个命中了」；零落点也**仍判 `ambiguous`**。

即使只有一个项目命中同名档，也判 `ambiguous`。依据 = 2026-10-25 用户裁定「为啥要试探？不能要求写对吗？」——层里替人挑，就是把被否掉的试探请回来。

`state === "none"`（空目录 / 锚自身为裸仓、下辖无已注册项目）分两支，按手上有没有路径：**参数缺省**（没有路径可判）⇒ 无候选 ⇒ `dangling`，`level:"base"`，文案报「无项目根」+ 期望形（§2.2 第 1 步）；**带相对路径** ⇒ 项目根这一级以会话锚充作，两级照常走查（§2.2 第 4 步）。

后一支的依据是现场必判：文档门要判传入清单，而集成行 26-1 / 26-2 跑在无清单文件的临时域上（`test/integration/doc-check-line-refs.test.mjs` 夹具根 = `mkdtempSync(join(tmpdir(), "lr-integration-"))`，夹具只写列出的那几个档、不写清单档）——`none` 一律 `dangling` 会让这两行立刻转红。

### 2.4 同名候选（`dangling` 时报「你是不是指这个」）

`sameName` = 在**两层基根（§2.2 第 4 步的 ①②，按 `order` 取序）+ `opts.bases` + `opts.scanBases` 各根**下按 basename 找同名档：**每根各自起算**递归深度 ≤ 3、命中上限 20、跳过隐藏目录与 `_archive`。

扫描根取这三类，是因为 `dangling` 恰在两层基根全不中之后才成立（第 5–7 步）——病发现场就在这两层里，候选也只能在同一批根里找得出来；不传 `bases` / `scanBases` 的面照样有前两层，候选不会落空。

「每根各自起算」是 `scanBases` 的用处所在：以 `docRoot.design` 为扫描根起算深 ≤3 能到 `docs/core/design/modules/<域>/` 下一层的档；同一份档从项目根起算要下探五层（`docs` / `core` / `design` / `modules` / `<域>`），项目根那一遍扫不到它。

只在 `dangling` 路径上跑——成功路径零扫描，所以这份成本买不到延迟。依据 = 裸档名判档缺时，人拿到的是「档缺」，得自己翻目录找；本条把「翻目录」这一步替人做掉（用例表末几行）。

### 2.5 接线表：七面各调本层，各留受理判据

| 面 | 代码落点 | `kind` / `order` / `declaredRepos` | 基底（逐面写死）：`bases` = 第三级解析基底 · `scanBases` = 只喂同名候选 | 三态处置 | 该面不变的业务语义 |
|---|---|---|---|---|---|
| 批次档读面（append / status / close / spawn 门 / 评审门） | `thincoder-core/agent-tools/batch-paths.mjs` → `resolveBatchReadPath` | `file` / `near-first` / 不传 | `docRoot.batches` 声明面（读面无 manifest ⇒ 无这一级；取面分野 = `docs/core/design/BATCH-RECORD.md` §4.15 条 1） | 解析出 ⇒ 用；多候选 ⇒ 拒 + 列候选；无果 ⇒ 既有文案 + 追加同名候选 | 参数在 + 路径可读 |
| 批次档 create | 同上 → `resolveBatchCreatePath` | `none` / `near-first` / 不传 | `docRoot.batches` 声明面 + 缺省回退（`batchDocBases`，恒非空） | 候选序改由本层给；落位判据（落基底内 / 锚定防嵌套 / 多落点拒）原地留存 | 新档须落声明基底内（fail-closed） |
| 评审席 `documents` / 顾问 `documents` | `thincoder-core/agent-tools/review-facts.mjs` → `resolveReviewDocPaths` | `file` / `root-first` / 不传 | `bases` = 无；`scanBases` = `docRoot` 各键——该面今天不按 docRoot 解析（`resolveReviewDocPaths` 的解析基面只有会话项目根），补一个解析基底就是放宽两门已跑的受理面 | 解析出 ⇒ 进受理；多候选 ⇒ 拒 `reason=ambiguous-path` + 候选；`dangling.level="base"` ⇒ 拒 `reason=dangling-path`；`dangling.level="path"` ⇒ 拒 `reason=not-doc-file`（受理判据判决，零变） | 必须现存 `.md`、必须在项目内 |
| 子代理 `files`（spawn 门） | `thincoder-core/agent-tools/subagent-spawn.mjs` | `none` / `near-first` / 不传 | 无（`kind:"none"` 恒不产 `dangling`，无同名候选可言） | 恒解析出（只调度） | 不校验存在性 |
| 台账 `cwd`（读 / 写两面） | `thincoder-core/ledger-db.mjs` → `resolveLedgerRoot` / `ledgerDbPath` | `dir` / `root-first` / 不传 | 无（根由第 4 步锚查给，候选 = 下辖项目，不靠基底） | 解析出 ⇒ 用；多候选 ⇒ 报明候选（今天 =「未找到项目根」）；无根仍抛 | 台账库仍按项目根键控；台账指针的跨仓硬拒零改（KD-10） |
| `doc_check target` | `thincoder-core/agent-tools/doc-check.mjs` | `dir` / `root-first` / 不传 | 无（同上） | 解析出 ⇒ 用；多候选 ⇒ 报明候选（今天已是这一形，KD-5） | 判据参数仍为内置常量 |
| `doc_check` 锚（文档指针解析） | `thincoder-core/doc-check/anchors.mjs` → `resolveDoc` | `file` / `root-first` / `declaredRepos` | `bases` = 无；`scanBases` = `docRoot` 各键——`resolveDoc` 的两级序只有项目根与引用方目录，解析面零变 | 两级序改由本层提供；`dangling` ⇒ `档缺` + 同名候选提示；`unverified` ⇒ **不入 `hits`**、报面单列（§2.6）；组根成环 ⇒ `锚·环引` | 判据仍是「档在盘 / 节在盘」——仓内那一段；跨仓指针同样判节号 |

**声明仓腿只在表末那一行开**（文档锚面，§2.7）。其余面不传 `declaredRepos`，仓外路径照旧判缺——裁定的是「只有文档交付物要认声明表」，不是全区放宽（KD-10）。

### 2.6 报明文口径

四类结果的文案形状统一成同一句话骨架，语种随各面既有面（本层只给骨架与字段，不锁语种）：

- `resolved`：不报（静默用）。
- `ambiguous`：`<参数面>：<输入> 解析到 N 个候选，判不出唯一（fail-closed）——<候选全列>；请显式给路径`。
- `dangling`：`<参数面>：<输入> 找不到——缺「<第一不存在段>」`；`sameName` 非空时追加 `；盘上同名：<列表>`；`level:"base"` 时改报「无项目根」+ 期望形；既有拒文带解析后绝对路径的面（如评审面的 `resolved` 字段）取 `tried[0]` 渲染那个读数，`tried` 空则不渲染。
- `dangling` 未声明形：`<参数面>：<输入> 引用外部仓「<repo>」——该名未在 index.publicRepos 声明；本机同级目录：<列表>`（阻断；列表只作提示，不产受理）。
- `unverified`：`<参数面>：<输入> 的声明根 <declaredRoot> 本机不存在（仓 <declaredRepo>，声明项 = <declarationEntry>）——未核，不入闸`。报面按**声明根**聚合：一个声明根一行、条数按声明根计（不是按指针计）。

既有文案逐字保留在骨架之前，新信息追加在后——除了 §2.5 表里点名改词汇的两处（评审面 reason、台账无根文案），其余面报错文本零删改。

### 2.7 声明仓引用：仓名来自声明表，存在性能判就判

**判据一句话**：文档指针可以指向本仓，也可以指向 `index.publicRepos` 声明过的仓——**声明是唯一入口**。

三种结局：声明了而本机能判存在性就照判（缺档即红）；判不了就列报（`未核`，不入闸）；没声明就拒（`档缺`，入闸）。

**需求同源**：`docs/core/requirements/PROMPT-SYSTEM.md` §2.3 的 ⑤ 三态与 ⑤-补，本层一对一落地。

| 需求态 | 本层判态 | 触发 | 报面 | 闸 |
|---|---|---|---|---|
| 核〔已声明 ∧ 目标可解析〕 | `resolved` | 首段命中声明仓名 ∧ 声明根在本机 ∧ 余段在盘 | 静默（与仓内指针同形） | 过 |
| 未核〔已声明 ∧ 声明根不在本机〕 | `unverified` | 首段命中声明仓名 ∧ 声明根不在本机 | 逐声明根一行 + `未核 N 条`（§2.6） | 不阻断 |
| 红〔未声明〕 | `dangling` | 首段是仓形（多段）但不在声明表 | `档缺` + 「未在 `index.publicRepos` 声明」+ 同级候选 | `REFUSED` |
| 红〔已声明 ∧ 根在机 ∧ 目标不可解析〕 | `dangling` | 声明根在机 ∧ 余段不在盘 | `档缺` + 声明仓与 `rootOnDisk` | `REFUSED` |
| 红〔形态不合法〕 | `dangling` | 余段为空 / 含 `..` 越出仓根 / 绝对形 | `档缺`（形态写错仍阻断，KD-11） | `REFUSED` |

**写法** = `仓名/相对路径`，仓名 = `index.publicRepos` 声明项的目录名（`basename(声明项)`），不是磁盘位置。

识别判据（第 6 步逐条）：

- **声明仓名集** = `declaredPublicRoots(anchor)` 各根的 `basename`，按**声明序**匹配首段；同名多仓取声明序首者（与 `resolveDeclaredRef` 同序，无第二规则）。
- **余段**须非空、不含 `..` ∥ `.` 段、非绝对形；不合法 ⇒ 不成腿 ⇒ 落 `dangling`（形态是作者能写对的事，写错仍阻断）。
- **命中后先判声明根本机在不在**，两格分开落：
  - **不在本机** ⇒ `unverified`：仓名合规、形态合规，只是本机没有那个仓根 ⇒ 列报、不阻断；余段与节号都不判（判不了）。
    载荷四格 `declaredRepo` ∥ `declaredRoot` ∥ `relPath` ∥ `declarationEntry` 全进报面——读者据此分得清「没声明」「声明了但本机没 clone」「声明了、clone 了、档不在」三件事。
  - **在本机** ⇒ 于该声明根解析余段，按 `kind` 判存在性：在盘 ⇒ `resolved`；不在盘 ⇒ `dangling`（红）。下游「节在盘」照旧判——跨仓指针从此也管节号。
- **未声明形**：首段 = 项目根的**同级目录**名（一次 `readdir`，不递归；命中上限 20、按名排序）⇒ `dangling` + `siblingRepos` = 同级目录名。那是「你是不是指这个」的提示，与 `sameName` 同性质，只提示、不产受理（KD-6）。

**环检**（`锚·环引`）：落点在锚判据内、按被判档的组根各走一遍。

- 节点 = 仓根绝对路径；边 = 该根的 `declaredPublicRoots`，**只保留自身带 `PROJECT-MANIFEST.json` 的目录**——无 manifest 的仓是叶仓，没有出边。
- 从被判根出发 DFS，visited 集按路径同一性（`win32` 大小写不敏感）保证终止，故不设深度帽；走回起点 ⇒ 一条 `锚·环引`，链按目录名写全。
- 只报**穿过起点**的环——每个仓的门报自己的环，不为别人的环背红（KD-14）。
- 走查撞到声明根不在本机的节点 ⇒ 它的边集为空（读不到对方 manifest）⇒ 该节点止步，并按 §2.6 的 `未核` 行形写明「环走查止步」——「没找到环」与「没看过去」在报面上因此分得开。
- `锚·环引` 与 `锚·档缺` 同计 `锚 N 条`，gate 首行照旧 `REFUSED`，不新增判决词。

**叶仓**：无 `PROJECT-MANIFEST.json` 的目录没有出边，只能被别人声明与引用；被声明之后它的档照常可解析（`resolved`）——不替它建档，也不要求它回指（KD-7）。

`docs/core/design/LEDGER-SELF-CONTAINED.md` 对台账指针的跨仓硬判**不动**：那是事故换来的 fail-closed（别条产品线的债登进本仓台账、随主线推到公开远端）。文档面判「这一处引用合不合声明」，台账面判「这笔债归谁」——两面判的不是一件事。

## 3. 受影响文件清单

新增：

- `thincoder-core/path-resolve.mjs`（本层本体）

```text
thincoder-core/declared-repos.mjs                     声明出边图 + 环走查（叶档：只 import node:* 与 manifest.mjs / declaration.mjs）
docs/batches/2026-11-08-cross-repo-refs.test.mjs       本批单元测试档（收口删）
test/integration/cross-repo-refs.test.mjs              集成用例（故事 CLI 37，实施轮建档）
```

改（源码）：

- `thincoder-core/agent-tools/batch-paths.mjs` — 候选序改调本层；落位判据留存；JSDoc 去掉退役的选项名（实参面零改）
- `thincoder-core/agent-tools/review-facts.mjs` — `resolveReviewDocPaths` 改调本层；reason 词汇增 `ambiguous-path` / `dangling-path`；删掉传进本层的退役选项（行为零变）
- `thincoder-core/agent-tools/advisor.mjs` — reason 透传文案（实施时核词汇表是否硬编码，硬编码则同步）
- `thincoder-core/agent-tools/doc-check.mjs` — `target` 三态；工作区分支改调本层
- `thincoder-core/doc-check/anchors.mjs` — `resolveDoc` 改调本层，传 `declaredRepos`；`unverified` 收集（**不入 `hits`** ⇒ 不改 verdict）；按组根接环检、产 `锚·环引`；`档缺` 载荷透传
- `thincoder-core/doc-check/index.mjs` — `unverified` 的并集 ∥ 条数行 ∥ 逐声明根行（与 `unreadable` 块同处）＋ `锚·档缺` 行的 `missing` / `sameName` / `declaredRepo` / `siblingRepos` 括注 ＋ `锚·环引` 类名
- `thincoder-core/agent-tools/batch-gate.mjs` — `ANCHOR_CLASSES` 增 `环引`：`锚·环引` 与其余三属同计 `锚 N 条`，批档门的拒串不把它切成段类
- `thincoder-core/tools/doc-write-gate.mjs` — 拒串映射增仓级命中一分支：`环引` 没有行号，取引擎那一行原文，不把 `null` 当行号写进写者眼前
- `thincoder-core/ledger-db.mjs` — `noRootMessage` 改由本层候选驱动
- `thincoder-core/agent-tools/subagent-scheduler.mjs` — `files` 的实际解析落点（`kind:"none"` 只做调度）；门在 spawn 侧，解析在调度侧——绝对形不得提前交给 spawn 的判据
- `thincoder-core/agent-tools/subagent-spawn.mjs` — `files` 拒文追加同名候选（`danglingSameNameHint`）；三条门判据仍吃原始声明形状

测试：

- 集成：`test/integration/path-resolution.test.mjs` 的 29-4 ∥ 29-5 改写；故事 CLI 37 的新用例档见上方围栏（实施轮建档）

文档：

- `docs/core/design/PATH-RESOLUTION.md`（本档）
- `docs/core/design/BATCH-RECORD.md` §4.15 — 候选序引本层 §2.2，本面只留自己的参数与落位判据（无算法复写）
- `docs/core/design/ADVISOR-GUARDS.md` §12 — 解析面归口（本面不传 `declaredRepos`）＋ reason 词汇表同步
- `docs/core/design/DOC-DISCIPLINE.md` §3.20 ∥ §4.2.2 — 锚判据的报面与解析序单源，实现改了报文就同步它
- `docs/core/design/DOC-CHECK.md` §2.5 — 域表三项里声明源那一项的用途（判据源，不是读数源）
- `docs/core/design/MANIFEST.md` §2.2 — `publicRepos` 的出边表语义
- `docs/core/design/LEDGER.md` — 无根报明面改由本层候选驱动

**层级结论**：无档跨层。全部改动落在 `thincoder-core/**` 与仓库根 `test/**`，没有一端（cli / vsc / desktop / server）与核心之间的分层迁移，也没有跨层共享的接口形状变化。

**贴线判（500 软线）：零拆分义务**——本批改动面无档越线；两个既有档越线、**不在本批改动面**（`thincoder-core/agent-tools/batch-skeleton.mjs` ∥ `thincoder-core/agent-tools/batch.mjs`），已登记台账待下一批接笔。

拆边界 = 「骨架常量与判定字面」对「工具 action 分发与 schema」——拆开后前者只留常量与纯判定、后者只留 action 分派。

本批不拆（改它们不是本批的任务），**登记下一批接笔**（台账另开一行，挂 `条件`）。

## 4. 关键决策记录

**KD-1 新建叶档，不并入声明面读取档。**

理由：`thincoder-core/manifest.mjs` 是**声明面读取**（读档、校验、docRoot 展开）；本层是**消费面算法**（候选、判态、报明）。合成一档会让「读声明」与「判落点」共用一个写面。

依赖方向沿用 `thincoder-core/agent-tools/batch-paths.mjs` 的现成纪律：叶档只 import `node:*` 与两个读面档——`thincoder-core/manifest.mjs`（`projectRootView`）与 `thincoder-core/declared-repos.mjs`（`declaredOutEdges`）。

声明面那一档由 `thincoder-core/declared-repos.mjs` 直引（`declaredPublicRoots` / `loadProjectDeclaration`）——`thincoder-core/manifest.mjs` 的转口只含 `thincoder-core/manifest-discovery.mjs` / `thincoder-core/manifest-schema.mjs` 两族，不过 `declaredPublicRoots`，经它转口写的 import 在加载期就抛。

三合投影只写一份：解析腿与环走查都要「目录名 ∥ 声明项原文 ∥ 本机在盘」三件，各写一遍就是同一机制的第二个实现——故投影的单源 = `thincoder-core/declared-repos.mjs`，本层与环检都调它。

**KD-2 基根次序 = 项目根 → 所指目录（零偏离）。**

依据（用户 2026-11-02 17:07 裁定 ②）：顺序只在「两个基根各有一个同名且都存在的档」时才有可观察差异，而翻转它会**悄悄改变既有锚的判定结果**——用户的第一条要求是「安全的方式」，改一道已经在跑的门语义不是安全。

因此本层缺省 `order = "root-first"`，与 `resolveDoc` 现序逐字同序。**哪个面确有需要，由该面自己声明例外，不全区翻**（例外形 = `order: "near-first"`，见 KD-3）。

**KD-3 批档面声明例外 `order: "near-first"`（cwd / 会话锚先、项目根后）。**

依据：`thincoder-core/agent-tools/batch-paths.mjs` 的四形矩阵已在跑，`docs/core/design/BATCH-RECORD.md` §4.15 的落位判据依赖 cwd 先（cwd = 基底父目录 + `batches/` 下一层靠第一级命中）。

翻成 `root-first` 会让 create 落到项目根下的 `batches/` 目录——那是改一门已在跑的行为，不是统一层的收益。

被否：全区 `root-first`（会改 create 落点）· 全区 `near-first`（与 KD-2 相反）。例外面 = §2.5 表前两行 + `files` 行，逐行声明。

**KD-4 工作区锚恒判 `ambiguous`，哪怕只有一个项目命中。**

依据：用户 2026-11-02 裁定 ①「多仓根默认 = 安全方式：不猜，解析不出唯一目标 ⇒ 列候选、停下要人挑」+ 2026-10-25 裁定「不能要求写对吗？」（否掉的就是层内试探）。

被否：`owningProject` 兜底挑一个——那正是七个面各挑各的来历。

**KD-5 `doc_check target` 的工作区分支已经是本层要的形**（报明候选 + 拒跑），本层只把它的候选枚举换到层里，文案不动。它是七个面里唯一「已经做对」的一面，被当作 KD-4 的实现先例。

**KD-6 不新增工具、不改任何工具入参名与形状、不加重试。**

依据：本机制的边界——统一的是「怎么把路径变成绝对路径」，不是「各面判不判存在」。

**KD-7 同名候选扫描有界（深 ≤3、命中 ≤20、仅 `dangling` 路径）。**

被否：建全域目录索引。`thincoder-core/doc-check/anchors.mjs` 已经为同一个理由否过一次——「为认出一个裸名而重建索引，等于把全仓扫描请回来」。

**KD-8 拒因词汇契约变更（`no-project-root` → `ambiguous-path` / `dangling-path`）。**

依据：用户 2026-11-02 裁定 ②「必须统一」——两个面各说一套词就是不统一。这是**已评审契约的变更**，故显式登记：

| 旧词 | 新词 | 何时 |
|---|---|---|
| `no-project-root` | `ambiguous-path` | 相对形 ∧ 会话锚 = 工作区（下辖 ≥1 项目），判不出唯一根 |
| `no-project-root` | `dangling-path` | 相对形 ∧ 无项目根且零候选（`none` 态 / 解析无果 `level:"base"`） |

- **受影响面**：`thincoder-core/agent-tools/review-facts.mjs`（判据与 reason 值）· `thincoder-core/agent-tools/advisor.mjs`（拒发文案透传）· `docs/core/design/ADVISOR-GUARDS.md` §12（分支 2 判据行 / 拒因值集 / A-AG19）· 集成行 6-4 / 6-5 的断言（`reason=no-project-root` 改 `reason=ambiguous-path`）。
- **不变**：`criterion=scope-not-doc` 恒定；`outside-project` / `not-doc-file` 两值零变，语义零变（`not-doc-file` 仍管「有基根、档不存在或非 `.md`」）。

**KD-9 声明仓腿并回普通解析：未声明即 `dangling`，存在性按「声明根在不在本机」分两格。**

依据：`docs/core/requirements/PROMPT-SYSTEM.md` §2.3 的 ⑤ 三态（核 ∥ 未核 ∥ 红）与 ⑤-补。根在本机 ⇒ 存在性可核，缺档照判；根不在本机 ⇒ 存在性跨机器不成立，落 `unverified` 列报而不入闸。

被否三案：① **一律红**——等于让「本机没 clone」冒充「路径写错」，两件事共用一句话，读者会去修错地方；② **一律放行**——把「不查存在性」从后门请回来，一条拼错的路径在别人机器上静默通过；③ **另立一个结果态说「这是跨仓引用」**——它出的是读数、判据面零命中，正是要退役的那一层分叉。

**KD-10 `declaredRepos` 只在文档锚面开，台账面与其余面不放宽。**

依据：台账指针的跨仓硬判是事故换来的 fail-closed（`docs/core/design/LEDGER-SELF-CONTAINED.md` §3 L4），**文档交付物放宽、台账面不放宽**，两面判的不是一件事。

实现形 = `opts.declaredRepos` 逐面声明（§2.5 表），缺省 `false` ⇒ 不放宽的面行为零变。

**KD-11 仓内缺档仍阻断；声明仓形只认 `仓名/相对路径`，形态写错仍阻断。**

依据：裸档名 / 拼错是作者能写对的事——把它们一起放宽，等于让「档在盘」这条判据对仓内也失效。未声明形靠「同级目录名」认出，只作**读数候选**，不作判据。

**KD-12 被否：只统一错误文案，不统一解析。** 七个面仍各判各的，同一个路径照旧在两个面得到两个答案。

**KD-13 被否：把七面改成「多试几个基根、试不出就随便取一个」。** 那是今天的现状，被用户裁定 ① 否掉。

**KD-14 环检落进锚判据、按组根各走一遍，且只报穿过起点的环。**

依据：`doc_check` 的 `gate` 是全项目唯一「拒了就不用交付」的门；放到门外的脚本里就是一条没人会跑的第二道门。

判据数 = 三 是闭集，加第四条要动 verdict 分词与全档口径；而环回答的仍是「指针指向哪里」，归锚判据不牵动判决词。

只报穿过起点的环的理由：仓自足——A 的门不该为 B 与 C 之间的环背红。

## 5. 验收判据（对回需求）

**对回口径**：本表「对回」列一律指 `docs/core/requirements/PROMPT-SYSTEM.md` §2.3 的跨仓引用块——`⑤` 三态 ∥ `⑤-补` 的四条（形态 / 仓名 / 方向 / 叶仓）。

| # | 判据（机检口径） | 对回 |
|---|---|---|
| AC-1 | 单元测试覆盖四态：`resolved` 出绝对路径 / `ambiguous` 出候选数组 / `dangling` 出 `missing` + `sameName` + `level` / `unverified` 出 `declaredRepo` + `declaredRoot` + `relPath` + `declarationEntry` | ⑤ 三态 |
| AC-2 | 会话锚 = 工作区（下辖 ≥2 项目）+ 相对路径 ⇒ `ambiguous`，候选 = 下辖项目全列且按名排序；单项目命中同名档时同样 `ambiguous` | ⑤ 核态的前提 |
| AC-3 | 唯一项目根 + 裸档名（档在 `docRoot.batches` 下）⇒ `resolved`，不再判档缺 | 仓内解析 |
| AC-4 | `dangling` 时 `missing` = 第一个不存在的路径段；`sameName` 列出两层基根（项目根 / 所指目录，按 `order`）+ `bases` + `scanBases` 各根下的同名档，每根各自起算深 ≤3（无则空数组）；`scanBases` 命中不改判态（不产 `resolved`） | 仓内解析 |
| AC-5 | 七面全部经本层，且「自持候选序」归零：① 七面各自的解析入口都调 `resolvePathTarget`（逐面列读数 = 文件 + 引入行）；② `thincoder-core/**` 内除本层外无「多基根候选序 + 首命中择一」的实现点——口径命令 `rg -n --glob '*.mjs' -e 'for \(const \\w+ of (bases\|roots\|candidates)' -e '\\.find\([^)]*existsSync' thincoder-core` ⇒ 除本层零命中（无 `rg` 时同形 `grep -RInE`），命中处逐条核读并列入读数。**只读 `projectRootView` / `resolveProjectRoot` / `docRootPaths` / `declaredPublicRoots` 不算自持根判定**（取根单源就在这几处，改它们才叫搬根判定） | 机制面 |
| AC-6 | 业务语义零变：`files` 不校验存在性 / `documents` 须现存 `.md` / `batchDoc` 须可读 / create 仍判落基底内 —— 四条各有断言 | 边界 |
| AC-7 | 集成面：`test/integration/review-doc-scope.test.mjs` 6-4 / 6-5 改写后转绿；§9 的 29-1 ∥ 29-2 ∥ 29-3 零改零红，29-4 ∥ 29-5 改写后转绿 | 集成面 |
| AC-8 | 本轮所写各档逐档过 `doc_check` gate、零新增命中：本档 ∥ `docs/core/design/ADVISOR-GUARDS.md` ∥ `docs/core/design/LEDGER.md`；**已合档只复核引证**：`docs/core/design/BATCH-RECORD.md` §4.15 仍写「候选序算法单源 = `docs/core/design/PATH-RESOLUTION.md` §2.2」且本面无算法复写。`thincoder-core/ledger-db.mjs` 的 `noRootMessage` 函数体内 `projectRootView` 零命中——候选尾改由本层 `ambiguous.candidates` 拼入，本面不自行枚举 | 机制面 |
| AC-9 | **声明的两格各有断言**：① 已声明 ∧ 声明根在盘 ∧ 档缺 ⇒ `dangling`（红，`锚·档缺` 一条、首行 `REFUSED`）；② 已声明 ∧ 声明根不在本机 ⇒ `unverified`，零 `锚` 命中、首行 `PASS`；删掉该声明再跑同一指针 ⇒ `锚·档缺` + `REFUSED`——两跑并置，「判不了」与「没看」才分得开 | ⑤ 核 ∥ 未核 ∥ 红 |
| AC-10 | **未声明形**：首段 = 未声明的同级目录 ⇒ `dangling`，括注含同级候选与「未在 `index.publicRepos` 声明」；同一输入在台账面 / 批档面仍判缺（`declaredRepos` 缺省生效），且台账跨仓指针照旧硬拒（一条拒写断言） | ⑤-补 仓名未声明 ⇒ 阻断 |
| AC-11 | 基根序：两个基根各有一份同名现存档 ⇒ 文档锚面取**项目根**那份（`root-first`）、批档面取**近基根**那份（`near-first`）——两条断言各一 | 机制面 |
| AC-12 | 形态错仍阻断：`仓名/../越界` · `仓名/`（余段空）· 未声明且首段非同级目录 ⇒ 均 `dangling`，无一落 `unverified` | ⑤-补 形态不合法 ⇒ 阻断 |
| AC-13 | **方向与叶仓**：A ↔ B 互为声明 ⇒ 判 A 的档时 `锚·环引` 一条（链 `A → B → A`）、首行 `REFUSED`；A → B → C 无环 ⇒ 零 `环引`；A 声明无 manifest 的 C、指针指 C 内的在盘档 ⇒ `resolved`、零命中、首行 `PASS` | ⑤-补 方向 ∥ 叶仓 |

**跑法**：改面单测档见 §3 围栏里那份批档同名档——本批断言全在此档（集成半在收口行报，不写全量套跑）。

## 6. 用例表

夹具代号（下文一律用代号，不写全路径）：

```text
A 仓：项目根，有 manifest，声明 ../B
B 仓：有 manifest，出边为空
C 仓：与 A 同级，无 manifest，未声明
四形：已声明在盘档 ∥ 已声明缺档 ∥ 未声明仓名的档 ∥ 形态非法（../越界 · 余段空 · 绝对形）
```

| 类 | 输入 | 期望 |
|---|---|---|
| 正常 | 唯一项目根 · 仓根相对全路径 | `resolved` = 该档绝对路径 |
| 正常 | 唯一项目根 · 裸名（档在 `docRoot.batches` 下） | `resolved`（第三级基底命中） |
| 正常 | `referrer` = 同目录一份档 · 裸名（项目根下无同名档） | `resolved` = 同目录那份（`root-first`：项目根零命中后第二级命中） |
| 正常 | 绝对路径 | `resolved` = 原值，零基根走查 |
| 正常 | `kind:"none"` + 不存在的目标 | `resolved`（首个候选），零 `dangling` |
| 正常 | A 声明 B · 指针指 B 内的在盘档 | `resolved`，零命中、首行 `PASS` |
| 正常 | A 声明 B · 指针带 B 侧存在的节号 | `resolved`，零命中 |
| 正常 | A 声明 C（C 无 manifest）· 指针指 C 内的在盘档 | `resolved`，零命中、首行 `PASS`（叶仓能被声明、被引用） |
| 边界 | 工作区锚 · 相对路径 | `ambiguous`，候选 = 下辖项目（按名排序） |
| 边界 | 两个声明基底各有一份同路径现存档 | `ambiguous`，两份全列 |
| 边界 | 工作区锚 · 只有一个项目下有该档 | 仍 `ambiguous`（KD-4） |
| 边界 | 项目根与所指目录各有一份同名现存档 · `order:"root-first"` | `resolved` = 项目根那份（KD-2） |
| 边界 | 同一输入 · `order:"near-first"` | `resolved` = 所指目录那份（KD-3 例外面） |
| 边界 | A 声明 B · 根在盘 · 指针指 B 内的缺档 | `dangling`（红），载荷 `declaredRepo` = B、`rootOnDisk` = true |
| 边界 | A 声明 B · 声明根整份不在本机 | `unverified`，载荷含 `declaredRoot` ∥ `declarationEntry`；零命中、不入闸 |
| 边界 | A 声明 B · B 不在本机 · 环走查从 A 出发 | 走查止于 B；报面出 `未核 1 条` 与该根一行（`触发 = 环走查止步`） |
| 边界 | 声明两个目录名同为 B 的仓 | 取声明序首者（与 `resolveDeclaredRef` 同序，无第二规则） |
| 边界 | 未声明仓名 · 首段是本机同级目录 C | `dangling`，`siblingRepos` 含 C |
| 边界 | 未声明仓名 · 首段非同级目录 | `dangling`，`siblingRepos` 为空 |
| 边界 | A ↔ B 互声明 | `锚·环引`（判 A 的档时报 A 这一侧） |
| 边界 | A → B · B 无 manifest | 零 `环引`、零抛错（叶仓） |
| 错误 | 形态非法三形（见夹具代号） | `dangling`（阻断） |
| 错误 | 唯一项目根 · 裸名，两层基根与各基底均无同名档 | `dangling`，`missing` = 该名，`sameName` = `[]` |
| 错误 | 裸名两层基根零命中、项目根下某子目录有同名档 | 仍 `dangling` + `sameName` 列它（裸名不成仓形，KD-11） |
| 错误 | 首段等于仓内真目录名（如 `docs`）而仓内无该档 | `dangling`，不按仓名解 |
| 错误 | 空串 / 非字符串 | `dangling`，`missing` = 该参数本身 |
| 错误 | 路径含 `..` 越出项目根 | 本层照解析；越界由各面受理判据判（`outside-project` 不变） |

## 7. 边界（不做什么）

- **只答「指向哪儿」**：判态由本层给，受理判据留在各面。声明仓腿是唯一跨出本仓的入口，它的判据停在三处——声明表里有没有这个名字、声明根在不在本机、余段在不在盘（§2.7）。该档案的内容质量、目录结构一律不判。
- **不改工具入参**：参数名、形状、缺省值一律不动；不新增工具、不加重试。
- **不动 `thincoder-core/agent-tools/batch-paths.mjs` 的四形矩阵落位判据**：落基底内、锚定防嵌套、多落点拒写，三项原地留存。
- **不改台账库键、不放宽台账指针的跨仓硬判**：台账仍按项目根键控；L4 判「债归谁」，与文档面判的不是一件事（KD-10）。
- **不改评审 / 顾问 `documents` 的受理面**：项目内现存 `.md` 零变；该面不传 `declaredRepos`。两个文档面只传 `scanBases`（同名候选提示）、不传 `bases`——给它们加解析基底会把裸档名变成受理通过，那是放宽两门已跑的门。
- **不给叶仓造 manifest**：`thinworker` ∥ `thincoder-issues` 保持无 manifest，规则写在 §2.7，不替它们建档。
- **不做双向同步 / 镜像**：引用方向是单向出边，不要求对方回指。
- **不跨仓写**：跨仓任务各仓自己的会话、自己的批次档；本层不提供跨仓落点。
- **不建目录索引、不缓存**：同名候选扫描有界（KD-7）；未声明形的同级目录列举 = 一次 `readdir`，不递归、不落缓存。

## 8. 界面 / 交互决策

本机制无 UI。人机交互面 = 报明文（§2.6），四形已全部定形，无 `open` 项：

- 多候选：列全 + 一句「请显式给路径」，人一步就能挑。
- 缺档：先报缺哪一段，再列同名候选——人不用自己翻目录。
- 跨仓三形：已声明且根在盘 ⇒ 静默（与仓内指针同形）；已声明而根不在本机 ⇒ 一行 `未核`（点名声明根与声明项，不入闸）；未声明 ⇒ `档缺` 行 + 同级候选 + 一句「未在 `index.publicRepos` 声明」。
- 解析成功：静默，不占一次回执。

## 9. 集成测试设计（`test/RTM.md` 增量）

读 `test/RTM.md` 与 `test/rtm/paths.md` 后按增量答：**改 2 行（29-4 ∥ 29-5）· 增 1 故事 4 行（CLI 37）· 冗余 0**。

| 处置 | 行 | 入口 | 交互的组件 | 断言的可观察结果 | 对回 |
|---|---|---|---|---|---|
| 改 | 29-4 | 一次文档门 `gate` 跑 | 文档交付门 × 声明出边 × 统一解析层 | 已声明在盘档 ⇒ 零命中、首行 `PASS`；带错节号 ⇒ `锚·节缺`；未声明仓名 ⇒ `锚·档缺` + 同级候选注解 | ⑤ 三态 |
| 改 | 29-5 | 同上 | 文档门 × 台账面 | 文档面形态错 ⇒ `锚·档缺`（零改）；台账面同形 `task_book` ⇒ 硬拒（零改） | ⑤-补 形态 ∥ 台账硬判 |
| 新增 | 37-1 | 一次文档门 `gate` 跑 | 文档交付门 × 声明出边 | A 声明 B 且 B 在本机：指在盘档 ⇒ `PASS`；指缺档 ⇒ `锚·档缺`、首行 `REFUSED`——声明不免除存在性，**但只在根在盘这一格** | ⑤ 核 ∥ 红 |
| 新增 | 37-2 | 同上 | 文档交付门 × 声明出边 × 同级目录 | 未声明仓名 ⇒ `锚·档缺` +「未在 `index.publicRepos` 声明」+ 同级候选；同输入改台账面仍硬拒（可见差） | ⑤-补 仓名未声明 |
| 新增 | 37-3 | 同上 | 文档交付门 × 出边图 | A ↔ B 互声明 ⇒ `锚·环引`、首行 `REFUSED`；B 无 manifest 当被声明 ⇒ 零 `环引`，且 B 内的在盘档可解析为 `resolved` | ⑤-补 方向 ∥ 叶仓 |
| 新增 | 37-4 | 同上 | 文档交付门 × 声明出边 × 本机缺仓 | A 声明 B 而 B 不在本机：报面出 `未核 1 条` + 该根一行（`触发 = 指针 ∥ 环走查止步`）、首行 `PASS`；同一指针删掉声明再跑 ⇒ `锚·档缺` + `REFUSED` | ⑤ 未核 |

- 故事号 = `CLI 37`（索引表现有行到 `CLI 36`）；属册 = `paths`（同族：路径与引用解析），不新开分册。
- 用例号在此定死：行内号 `37-1` … `37-4`，测试标题逐字 = `test('CLI 37-1 …')`——`CLI` 前缀是编号的一部分，与既有 `test('CLI 29-4 …')` 同形，丢了它故事就对不上索引表。
- 29-1 ∥ 29-2 ∥ 29-3 零改；6-1 / 6-2 / 6-3 不受影响（在项目根内解析，本层不改这一格；6-3 的 `outside-project` 判据零变）。
- 冗余：无。本次不删任何既有行。
- 行号落在 `test/RTM.md` 的动作归实施轮（RTM 与集成用例同处维护）；本档只定号与断言口径。