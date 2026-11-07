# 文档检查（DOC-CHECK）· 设计

> 需求层 = `docs/core/requirements/DOC-CHECK.md`（F1–F17 / AC-1–AC-15；本批的判据条目 = **F17** ∥ **AC-15**）。本档只答「怎么建」，判据口径不重述（单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20）。
> 改动面 = **判域的定根与域表**：三条判据（锚 ∥ 段长 ∥ 行号坐标）与引文判法**一字不动**。

## 1. 模块目标与现状

`doc_check` 在三个强制面上判文档：设计轮交付（eng-designer）· 实施轮交付（eng-coder）· 父侧收口（`batch` 工具两机械点）。它收的清单可以跨项目，而它只拿得到一个根——那个根就成了整批的坐标系。

**定根（读码取证）**：`thincoder-core/doc-check/index.mjs` 的 `runDocCheck(root, opts)` 开头先定声明根 `const base = declaredRoot(root)`；相对条目由 `resolveRange(base, docs)` 按它解析，而每份档的判定根由 `rootOf` 单独求（§2.1）——`base` 不再是判定的坐标系，只是相对条目的解析基准与无 manifest 祖先档的落点。

一次调用横跨多个项目时，各组按自己的根判（§2.2）：一份档一个根，谁也不借谁的坐标系。声明根只在两处接手——相对条目的解析基准、祖先链至盘根无 manifest 的档的落点；缺声明根才整清单不判（§2.4）。

## 2. 判域：按档所属项目根解析

**目标态的三种入参形**（锚 = 工作区，自身无 manifest）：

| 入参 | 判据 |
|---|---|
| 缺 `target` | **拒**——报文点名 `target`，零判定 |
| `target: null` | **拒**（`null` 即缺，解析层把两者归一） |
| `target: ""` | **拒**（「给了」= 一个非空字符串） |

- **「缺 `target` ⇒ 拒」**：三形同一判（缺 ∥ `null` ∥ 空串），AC-11 上锁，零判定。
- **`null` 即缺的依据**：解析层把 `undefined` 与 `null` 当同一件事（`thincoder-core/path-resolve.mjs`「if (given === undefined || given === null) {」）——工具面不再为 `null` 单设一支（§5 KD-10）。
- **读数口径（知会，不设机制）**：判定行为以**新进程直调盘上模块**的读数为准——会话进程可能加载旧模块，在那里读到的「恒拒」是载体的事，不是判据。本档不设检测、不自愈：那会造出第二套判据。

### 2.1 根的定法

```text
rootOf(abs) = owningProject(abs, parse(abs).root) ?? declaredBase
```

- **取根判据本体** = `owningProject(target, boundary)`：`thincoder-core/manifest.mjs` 导出（实现在 `thincoder-core/manifest-discovery.mjs`）。全仓单源，台账库键、批档路径、评审受理同用它。
- **界 = 该档所在盘的盘根** `parse(abs).root`（F17 同条「界 = 该档所在盘的盘根（与项目根视图同一个界）」，与 `projectRootView` 里 `owningProject(target, parse(target).root)` 是同一个界）。
- **`declaredBase`** = 声明根（工具面收到的 `target` 解析后的绝对路径——`target` 必填；会话锚只作相对形 `target` 的基根）：它在「该档祖先链至盘根无 manifest」时接手。**判据只有一条**：有声明根 ⇒ 用它；没有声明根 ⇒ 显式报错。「声明根自身是不是项目」**不参与判断**。
- **不取「清单首档定根」**：一份档的根管不了另一份，跨项目清单必然错一半。**不拿会话锚当整批的公共坐标系**：拿它盖住整批才是要治的形——根由调用方指名（`target` 必填），或由档自身所属项目给出；一份档一个根才是本批要的形。声明根**可以**是会话锚（调用方显式把它当 `target` 传入，见上一条 `declaredBase`）；「拿它当声明根」与「拿它盖住整批」是两件事。

**为什么界不能填声明根**：`owningProject` 先判界，档在界外即判无归属——填声明根会把跨项目的档一律推出界。依据 `thincoder-core/manifest-discovery.mjs`「if (!isInsideOrEqual(dir, edge)) return null」。现场：`target = thincoder`、清单含 `thincoder.com` 的档 ⇒ 界外 ⇒ 落声明根 ⇒ 正是本批要修的 `档缺`。

| `rootOf` 的哪一支 | 依据（现场读数 ∥ 依据行） |
|---|---|
| `owningProject` 命中 | 先例：`thincoder-core/agent-tools/batch-gate.mjs` 的 `evaluate` 内 `const root = owningProject(selfAbs, base) ?? batchProjectRoot(base)`——批档门按档定根，已跑在生产 |
| 落 `declaredBase` | F17：依据 `docs/core/requirements/DOC-CHECK.md`「有声明根 ⇒ 用它（含夹具临时域，那是调用方声明的坐标系）；连声明根都没有 ⇒ 显式报错」。夹具面另有豁免通路：测试钩子顶在前面时，依据 `thincoder-core/manifest-discovery.mjs`「if (_projectRootOverride) return resolve(_projectRootOverride)」——一档一根退化为单根，与今日逐字同 |
| 无声明根 ⇒ 显式 `ERROR` | 依据 `docs/core/requirements/DOC-CHECK.md`「连声明根都没有 ⇒ 显式报错」——该式落在 `thincoder-core/doc-check/index.mjs` 的 `runDocCheck` 定根前置：`declaredRoot(root)` 取 `null` ⇒ 整清单走 §2.4，`gate` 面出一首行 `ERROR`、`report` 面抛可读错，两条都不静默跳过任何档 |

**数据事实核对**：本档唯一的数据断言 = 工作区锚下不止一个项目。取证 = 新进程直调 `projectRootView` 的读数（本档不预载候选数，读数随交付报出）。其余断言全部由读码得。

### 2.2 分组判（判定内容不动的做法）

引擎在**分组之前**先定声明根：缺声明根 ⇒ 整清单走 §2.4 的 `ERROR`（不出现「部分组无根」）。声明根在 ⇒ 可判集 `checkFiles` 按 `rootOf` 分组，每组调一次既有 `checkAnchors(root_i, { files: group_i })`，命中按文件稳定序合并。

**另两条判据与根无关**：`checkParagraphs({ paragraphMax, lineMax, exemptZones, files: checkFiles })` 与 `collectLineRefs({ files: checkFiles })` 都不收根（读码取证）⇒ 全清单一次跑完，零改。

**为什么这样切**：抽取式 ∥ 解析序 ∥ 面判这些判法内部一字不动，改的只是喂进去的根；跨项目清单在锚面等价于「两组各按自己的根判一遍」。

**弃案：把根做成 `checkAnchors` 的逐 token 参数**——那要改解析序内部（同轮记忆按根建、同名候选扫描根按根取），判法跟着动，与本批边界「判定内容不碰」相冲。

### 2.3 命中报面（跨项目清单怎么读）

- **verdict 只有一条**：一次调用一个答案。不按项目分 verdict——分节判 PASS 会让读者读到其中一节的 PASS，而另一节是 REFUSED。
- **单根清单**：报面逐字不变，**不附根行**（这是零回归的判据面，见 §6 的 AC-2）。
- **≥2 根**：范围行追加根清单；每条命中 ∥ 跳过 ∥ 读不到行前置 `[<项目名>]`，行内路径**相对该档自身的根**显示。读回执的人据此分清是谁的账。
- **项目名 = 本次调用里能唯一定位该根的最短路径后缀**（段间以 `/` 分隔）：末尾一段在本次的根之间不重复 ⇒ 就是根目录名；重名（两个项目各有一个 `web`）⇒ 往前多取一段，直到各根互不相同，如 `[a/web]` ∥ `[b/web]`。**唯一定位的判据面 = 本次调用的根集**，不是全机路径——标签的职责是让读者分清是谁的账，两个同名根同时出现时必须分得开。

### 2.4 定不出根 ⇒ 显式 `ERROR`

- **触发条件只有一个**：调用方没有声明根（`root` 入参缺省 ∥ 空串 ∥ 非字符串）。**「声明根自身不是项目」不是触发条件**——普通目录、多项目工作区都能当声明根，照它判。
- **两层分界**：「调用方给了 `target`」（非空字符串，§5 KD-10）与「歧义」都判在**工具面入参**那一层；工具面交给引擎的 `root` 永远是**解析后的非空根**（`target` 缺 ∥ `null` ∥ 空串 ⇒ 工具面拒，见 §2 三种入参形；锚缺位 + 相对形 `target` ⇒ 拒、点名锚）。`§2.4` 只管**引擎入参**——直调引擎、`root` 给不出非空值才触发，两层不混。
- **报面形**（`gate` 面）：

```text
DOC-CHECK GATE: ERROR（无法定根 N 档）
本次没有声明根：声明根是这条判据的调用前置，缺它整清单不判（不出半份判定）
<档> —— 原因：<下表那一式>
```

- **逐档原因句：两式 + 相对条目一支**（按该档自己的读数取式，逐字照抄）：

| 该档的情形 | `<档>` 怎么显示 | 原因句（逐字） |
|---|---|---|
| 绝对路径条目，祖先链有 manifest | 条目原文 | `本次没有声明根，整清单不判——本档本可归 <该根>` |
| 绝对路径条目，祖先链至盘根无 manifest | 条目原文 | `祖先链至盘根无 PROJECT-MANIFEST.json，且本次没有声明根` |
| 相对路径条目（无根即无法定位） | 条目原文 | `本次没有声明根，整清单不判——本档是相对路径条目，无根无法定位` |

- **报文不得断言盘上为假的事**：只有该档祖先链**真的**没有 manifest，才许说「无 `PROJECT-MANIFEST.json`」；本可由 manifest 定根的档一律走第一式。三式都不提 `<base>`。
- **N 怎么数**：N = 清单独特条目数——去重键只认**可证明同一**的两类：绝对条目按归一后的绝对路径（Windows 大小写不敏感）、相对条目按原文。**相对条目与绝对条目之间不合并**：无声明根时没有基准能把两者归一到同一路径，拿 cwd 去归一就是本批禁的猜根。同一份档写成相对 ∥ 绝对两种形时至多数成 2——报面说的是「本次点名的条目数」，不冒充「实际档数」。
- 无声明根时**判不了「在盘 ∥ `.md`」**——这两个谓词要绝对路径，而相对条目的绝对路径正是声明根给的 ⇒ 报面不得写成「可判档数」。
- **行内路径**：无声明根 ⇒ 没有可相对的根，`<档>` 按**条目原文**显示，不套 `rel(base, …)`。
- `report` 面同样抛错（现状 report 面对不可判档就是抛错、整次零判定，同口径）。
- **不跳过、不出半份判定**：该面**零 `✗` 命中行**。判不了就是一次都没判，不得出成「有的判过了」。
- **为什么这是政策，不是公式的推论**：`rootOf` 的 `?? declaredBase` 只在「祖先链无 manifest」的档上落空——**一个有 manifest 祖先的档，没有声明根也本来就有根**（`owningProject` 沿祖先链取最近带 manifest 的目录，见 §2.1）。所以「整清单不判」不是公式算出来的结论，而是**刻意的一条政策**：声明根是调用的前置条件，缺它整清单不判，**即使部分档本可定根也不出半份判定**。理由两条：缺声明根时盘上的形是**整次不判**（`thincoder-core/doc-check/index.mjs` 的 `declaredRoot` 取 `null` ⇒ 整清单走本节），政策与它同向——把不可读的崩溃换成一个能读的拒绝；而半份判定在报面上分不出「这档干净」与「这档没判」。

### 2.5 域表：按各档所属项目根读

**判据**：一份档的指针按谁的项目声明判，它的域表就按谁的项目根读——域表与判定同一条规则、同一个根。

- **域表三项**：`docRoot` 各键（同名候选的扫描根）· `docRoot.batches`（批档基底根——决定「批档面互引」豁不豁免）· `index.publicRepos`（跨仓引用读数的声明源）。三项一律取自**该档所属项目根**的 `PROJECT-MANIFEST.json`。
- **`index.publicRepos` 的读取点**：`thincoder-core/declaration.mjs` 的 `declaredPublicRoots`（声明值单源），判法面经 `thincoder-core/path-resolve.mjs` 的统一解析层消费——依据 `thincoder-core/path-resolve.mjs`「`declaredPublicRoots`：声明仓根集单源」。判定面 `thincoder-core/doc-check/anchors.mjs` 只 import 该解析层、不直读该键，故该键不在四份改动档的读取面上，§4 的「零改」行不动。
- **第三项的按档根性（读码佐证）**：判法面的 `resolveDoc` 把**该档的判定根**当解析锚传进统一解析层；解析层以锚定 `start`，跨仓声明名集按 `start` 取；声明层的 `declaredPublicRoots` 再按入点取声明——三行盘上逐字见下方围栏。

```text
thincoder-core/doc-check/anchors.mjs · resolveDoc（base = checkAnchors 收到的判定根）
  return resolvePathTarget(base, token, { kind: "file", order: "root-first", referrer: refFile, crossRepo: "visible", scanBases, session })
thincoder-core/path-resolve.mjs
  const start = resolve(anchor ?? ".")
  const declaredNames = new Set(declaredPublicRoots(start).map((r) => basename(r)))
thincoder-core/declaration.mjs · declaredPublicRoots 的参数注
  @param {string} [cwd] 会话锚（项目根经 manifest.mjs 解析）
```

链上无声明根一环：分组后判定根 = 组根（§2.2）＝该档所属项目根，各档的 `publicRepos` 各读各的根，头句第三项由此成立；本批四档零改，这条链原样保留。
- **落地形 = 组根**：`perRootGroups` 每组的 `root` 已经是该组各档的项目根，组内**只读一次** manifest（§3 的 `manifest` 注入），锚判与批档基底都吃这一份。
- **不并成并集**：各组各读各的，A 组的扫描根绝不进 B 组的候选集。并集只在「拿一个根盖整批」的旧形下才需要，而那个形本档已否（§2.1）。
- **无 manifest 的组**：该档祖先链无 manifest ⇒ 组根 = 声明根；声明根也没有 manifest（普通目录 ∥ 工作区）⇒ **域表为空集**。空集两向都是 fail-closed：批档面互引**不豁免**（token 照判，目标缺了就是 `档缺`）· 同名候选零提示（只影响提示，读数面）。**空集不会让门误判 `PASS`**——它只会让门更严。
- **不继承批档面的工作区并合**：`thincoder-core/agent-tools/batch-paths.mjs` 的 `batchDocBases` 在入参是工作区时会把下辖各项目的基底并起来；那一支服务批档自己的路径判定，本判据不吃它——传进去的根恒是组根。

**读数口径**：域表的读取必须能从报面上看出来——一个决定落地后看不出它做了什么，下次出问题就只能靠猜。

- 引擎返回 `domainTables: { root, manifest }[]`（每组一根、按路径升序；`manifest` = 该根读到了 manifest）。
- `report` 面出一块（位置 = 读面行之后、行数读数块之前；**不进 `hits`、不动 verdict、不改 `结论：` 行的位**）：

```text
域表读数：2 根（读 manifest 2 · 无 manifest 0）
  D:\teamcode\thincoder        读 manifest
  D:\teamcode\thincoder.com    读 manifest
```

- **出场条件**：只在「本次读到域表的根集 ≠ {声明根}」**或任一根无 manifest** 时出（7-13 的「无 manifest」行只有靠这半句才出得来）。单项目锚下根集恰是声明根且该根有 manifest ⇒ 两支皆假 ⇒ 零出，单项目零回归的判据面（AC-2）不破。
- 无 manifest 的根，该行写 `无 PROJECT-MANIFEST.json —— 域表为空（批档面互引照判 · 同名候选零提示）`：降级可见，不静默。
- `gate` 面零改：verdict 面只放判据。既有先例同向——`lines` 读数与批档面留痕行都只在报告态出。

## 3. 接口契约

| 面 | 形状 | 变 ∥ 不变 |
|---|---|---|
| 引擎入口 | `runDocCheck(root, { docs, mode, docsSource, lines })` | **签名不变**；`root` 语义 = 声明根，不再是整批坐标系；缺省 ∥ 空串 ∥ 非字符串 ⇒ §2.4 的 `ERROR` |
| 引擎内部 | `perRootGroups(files, declaredBase)` → `{ root, files }[]`；每组一次 `readManifest(root)` | 取根 = `owningProject(abs, parse(abs).root) ?? declaredBase`；**每根一次读**（§2.5、§5 KD-7） |
| 判法入口 | `checkAnchors(root, { files, manifest? })` | 新增可选 `manifest`：给了就吃它（引擎已读的那份），缺省仍自读——直调判法本体的夹具（AC-5 的对照面）零改 |
| 基底根 | `batchDocBases(cwd, { manifest? })`（`thincoder-core/agent-tools/batch-paths.mjs`） | 同上注入形；批档工具面既有调用零改 |
| 引擎返回 | `projectRoots: string[]`（参与判定的根，升序）＋ `domainTables: { root, manifest }[]` | `projectRoots` 的消费者 = 报面根清单行（§2.3）与用例断言；`domainTables` 的消费者 = §2.5 的域表读数块与用例断言。`hits` 三数口径、`anchorHits` ∥ `paragraphHits` ∥ `lineRefHits` 形状不变 |
| 工具面 | `thincoder-core/agent-tools/doc-check.mjs` | **改两处**：① `target` 必填——缺 ∥ `null` ∥ 空串 ⇒ 拒、报文点名 `target`、零判定（schema 加 `required: ["target"]`）；② `ambiguous` 那处守卫的「给了」判据 = **一个非空字符串**（§5 KD-10），该守卫必须与解析层同一条线——依据 `thincoder-core/path-resolve.mjs`「if (given === undefined || given === null) {」。`view.state === "workspace"` 提前返回**已不在盘上**（盘上照判），不重建。锚只作相对形 `target` 的基根 |
| 判定面 | `thincoder-core/doc-check/anchors.mjs` | 只改域表的**读取来源**（吃注入的 `manifest`）：判据内容、命中类与命中行形一字不动 |
| 判定面 | `thincoder-core/doc-check/paragraph.mjs` ∥ `line-refs.mjs` | **零改**（期望 `git diff` 空；真要改就停手报回来） |

数据流：`docs` 条目 →（**无声明根 ⇒ 停在这里，走 §2.4 的 `ERROR`**）→ `resolve(declaredBase, d)` 得绝对路径（路径解析基准**不变**，相对条目仍按声明根解析）→ 可判性判定（在盘 ∥ `.md`，**不变**）→ 按 `rootOf` 分组 → 逐组 `checkAnchors` → 合并命中 → 报面（单根无标 ∥ 多根打标）。

**判据句合规**：分组与定根住在 `thincoder-core/doc-check/index.mjs`，判据面零改 ⇒ `anchors.domain` ∥ `anchors.roots` 仍零存在，「不做全仓扫描」那条判据句照旧成立（回指 `docs/core/requirements/DOC-CHECK.md` 的边界段判据句）。

## 4. 受影响文件与档层结论

| 文件 | 改动 |
|---|---|
| `thincoder-core/doc-check/index.mjs` | 每组一次 `readManifest` 并注入判法；返回 `domainTables`；`report` 面域表读数块（§2.5） |
| `thincoder-core/doc-check/anchors.mjs` | 域表改吃注入的 `manifest`（`docRootBaseKeys` ∥ `batchFaceContext` 两处）——判据内容零改 |
| `thincoder-core/agent-tools/batch-paths.mjs` | `batchDocBases` 增可选 `manifest` 注入（缺省自读，既有调用零改） |
| `thincoder-core/agent-tools/doc-check.mjs` | 改两处：① `target` 必填——缺 ∥ `null` ∥ 空串 ⇒ 拒、点名 `target`（缺省支删除）；schema 加 `required: ["target"]`；② `ambiguous` 守卫的「给了 `target`」判据 = 非空字符串（§3 ∥ §5 KD-10 ∥ AC-11）。工作区锚的提前返回已不在盘上，不重建 |
| `thincoder-core/tool-docs/doc_check.md` | 零改：`target` 段已写「每档按自己的项目根判」 |

以下落地件由实施轮创建（`test/**` 不在本席笔域）：

```text
docs/batches/2026-11-07-doccheck-workspace-anchor.test.mjs   本批单元测试档（用毕即删）
thincoder-core/doc-check/per-root.mjs                     仅当 index.mjs 越硬限时的拆出档（落引擎同目录，判据面不搬）
test/RTM.md                                               故事索引表加一行
test/rtm/guard.md                                         册内用例行
test/integration/**                                       集成用例文件（编号按 §9 落地）
```

**档层结论：四份改动档一份越软线、三份未越线，无一越硬限**。判据 = `doc_check({mode:"report", lines:[…]})` 的档位标记（读数存批档，本档不预载数值），逐档一句：
- `thincoder-core/agent-tools/doc-check.mjs`——未越线（无标记）。
- `thincoder-core/doc-check/index.mjs`——标 `soft`，越软线、未越硬限。
- `thincoder-core/doc-check/anchors.mjs`——未越线（无标记）。
- `thincoder-core/agent-tools/batch-paths.mjs`——未越线（无标记）。
- 本批单元测试档——实施轮创建后随同一次读数取档位；越硬限即拆，不越硬限不拆。

**软线的审视结论**：软线的语义是「主动审视」，不是「拆」。可拆的接缝已在盘上——定根 ∥ 分组 ∥ 报面布局这一族（`rootOf` ∥ `perRootGroups` ∥ `reportLayout` ∥ `bucketLines` ∥ `rootsSuffix` ∥ `noRootItems`）与判据本体之间只靠 `runDocCheck` 串联，整族可搬进落地件清单里那个拆出档，`thincoder-core/doc-check/index.mjs` 只留 import。

**本批不拆**：未越硬限；而拆档会把本批改动面从「定根一处」扩成「两个文件的边界重构」，与 §8「不改判定内容」的窄边相冲。越硬限时按上面这条接缝拆。

**本批不新增源档**：只有实施后越硬限才拆，拆出档落**引擎同目录**（见上方落地件清单），判据面留原档。

## 5. 关键决策记录

**先例三问**（同一关切在别处已解过一次）：

- **在哪**：`thincoder-core/agent-tools/batch-gate.mjs` 的 `evaluate` 内 `const root = owningProject(selfAbs, base) ?? batchProjectRoot(base)`。
- **叫什么**：取根判据 = `owningProject`（`thincoder-core/manifest.mjs` 导出）；兜底那臂 = `batchProjectRoot`（`thincoder-core/agent-tools/batch-paths.mjs`）。
- **谁在用**（仓根全路径）：`thincoder-core/agent-tools/batch-gate.mjs` · `thincoder-core/agent-tools/batch-paths.mjs` · `thincoder-core/agent-tools/review-facts.mjs` · `thincoder-core/ledger-db.mjs` · `thincoder-core/declaration.mjs` · `thincoder-core/path-resolve.mjs`。

**本批新引入的六个名字，逐个三问**（`none found` 的读法 = `grep` 于 `thincoder-core/**` 零命中；取根家族既有名 = `owningProject` ∥ `projectRootView` ∥ `resolveProjectRoot`，逐个比对过不撞名）：

| 新名字 | 在哪 | 叫什么 | 谁在用 |
|---|---|---|---|
| `rootOf` | `none found`——仓内零命中，本批首建，住 `thincoder-core/doc-check/index.mjs` | 本档命名（取根式，非导出函数） | §2.1 ∥ §2.2 ∥ §3 的数据流 |
| `perRootGroups` | `none found`——零命中，本批新建于 `thincoder-core/doc-check/index.mjs` | 本档命名 | 引擎入口一处调用（§2.2） |
| `projectRoots` | 返回键零命中；既有返回面（`hits` ∥ `lineRefs` ∥ `lineReads` ∥ `batchFaceRefs` …）不撞名 | 本档命名 | 报面根清单行 ∥ §7 用例断言（仅此两处） |
| 多根标签 `[<项目名>]` | `none found`——报面没有逐行项目标签的先例；相邻先例 = 工具面的 `候选：A ∥ B` 行 | 取它的分隔符，不取它的位置 | §2.3 报面 §6 AC-6 |
| `ERROR（无法定根 N 档）` | 先例在盘：`thincoder-core/doc-check/index.mjs` 的 `verdict()` 「读不到 N 档」一支 | **对齐**——同句形同位置（首行） | §2.4 ∥ §6 AC-3 |
| `domainTables` | 返回键零命中——`grep` 于 `thincoder-core/**` 零命中；既有返回面（`projectRoots` ∥ `hits` ∥ `lineRefs` ∥ `lineReads` ∥ `batchFaceRefs` …）不撞名 | 本档命名（§2.5 的读数口径：每组一根、按路径升序） | 报面域表读数块 ∥ §6 AC-10 ∥ §7 用例 7-11 |

- **判据本体复用**：`owningProject` 就是取根判据本体，直接复用。
- **兜底臂不复用**：`?? batchProjectRoot(base)` 把「找不到归属」直接落成会话根，本批不照抄。
- **不许顶上来的是「猜的根」**：cwd ∥ 某个祖先项目 ∥ 清单首项的根，这三种都不是调用方给的。
- **声明根不是猜的根**：它是调用方给出的坐标系，用它 = 执行那条声明。
- **为什么两者分得开**：猜的根与声明根不同源，出事时没有任何一行能指出「这个根是谁给的」；所以本批只认声明根。

**勘察记录（公共源档）**：

- **外仓参考系声明**：`PROJECT-MANIFEST.json` 的 `index.publicRepos` = 空（本项目未声明外仓参考系）。
- **仓内已查三处**：`docs/core/design/PATH-RESOLUTION.md` §2.1（统一解析层四态 ∥ `referrer` 参数）· `docs/core/design/DOC-DISCIPLINE.md` §3.20（判据口径单源）· `test/RTM.md` 故事索引表。
- **仓内结果**：相关 2 处——前者给出「解析判不出唯一即停」，后者给出报面句形；无一处给出「按档定根」的做法 ⇒ 本批新建，取根复用 `owningProject`。
- **`referrer` 不改用**：它取**所指目录**当基根，本批要的是**项目根**（token 按项目根相对写），不是同一个量。
- **独立参考系**（本机 `D:\ref\` 下五仓：kimi-code ∥ MiMo-Code ∥ opencode ∥ oh-my-pi ∥ openclaw）已逐仓查：检索面 = `doc-check` ∥ `文档检查` ∥ `owningProject` ∥ `per-file root` ∥ `multi-project` 五串。
- **独立参考系结论：无一相关**。命中分三类——Gradle LSP 根探测（opencode ∥ MiMo-Code 的 `lsp/server.ts`）· Vitest 分片与 JSON 报告（openclaw 测试面）· 一处「5-minute doc check」是调试技能的口头清单。无一仓实现「按档定根」的文档检查 ⇒ 无跨仓先例可对齐。

| # | 决策 | 弃案 | 理由 |
|---|---|---|---|
| KD-1 | 根按档求，`owningProject` 加盘根界 | 必传 `target` 让人挑根 | 跨项目清单是常态（工作区锚），每批都要人挑就是把机制债摊给调用方 |
| KD-2 | 分组调既有 `checkAnchors` | 把根做成判法内部逐 token 参数 | 判法内部一字不动是本批边界；分组后等价性可直接用单组夹具对照 |
| KD-3 | verdict 一条 | 按项目分节各出 verdict | 分节会让读者读到一节 PASS 而另一节 REFUSED |
| KD-4 | 无主档落 `declaredBase` | 要求声明根自身必须是项目 | 夹具档住系统临时域、那里没有 manifest：要求「声明根是项目」会把既有单元测试面全打死，救它的唯一办法是再开一档豁免——那是在判据上挖洞。「谁声明的、用谁的」不挖洞 |
| KD-5 | 无声明根 ⇒ `ERROR` 点名，零命中；即使部分档本可由 manifest 定根，也不出半份判定 | 跳过该档继续判 | 跳过 = 把「判不了」洗成「判过了」；出半份判定同样读不出来。它是**政策**、不是公式推论——理由与报文口径见 §2.4 |
| KD-6 | 多根时行内路径相对自身根 + 项目标签 | 统一相对声明根 | 统一相对声明根会写出 `../thincoder.com/docs/…`，读回执的人分不清这是谁的账 |
| KD-7 | **域表按各档自身项目根读**（用户 2026-11-07 裁定）：组根一次 `readManifest`，三项都从该根取 | 按声明根读一次、工作区下空集降级 | 批档面互引豁不豁免是**判据面**：拿声明根的域表判别项目的 `docs/batches`，合法互引会被判成 `档缺`；而「一个根盖整批」与 §2.1 否掉的是同一条 |
| KD-8 | 域表读数只在 `report` 面出，且只在「本次读到域表的根集 ≠ {声明根}」**或任一根无 manifest** 时出——出场条件两支与 §2.5 逐字同源 | 两个问法都出 ∥ 恒出 | 恒出会破单项目零回归（AC-2）；`gate` 面只放判据（先例：`lines` 读数 ∥ 批档面留痕行都只在报告态） |
| KD-9 | 各组扫描根不并成多根候选池 | 各根域表合成一个池 | 合并后 A 档的同名候选会出现在 B 档的回执里，读者分不清是谁的候选；并集只在「一个根盖整批」的旧形下才需要 |
| KD-10 | **「调用方给了 `target`」= 一个非空字符串**；「歧义」判在解析结果上 | 判「键存在」（`args?.target !== undefined`） | 解析层自己就把两者当一件事——依据 `thincoder-core/path-resolve.mjs`「if (given === undefined || given === null) {」：`null` 与缺键同归「参数缺省」一支。工具面的守卫判「键存在」，于是在工作区锚下把 `null` 当成「给了」而进拒支——两处判据不同源，差在可空参数上。而歧义是**解析结果的性质**，不是入参形状的性质——判「有没有」与判「是什么」在可空参数上不是一回事。本条守卫的红点两处：`null` 形（守卫写回「键存在」⇒ `null` 落兜底支 ⇒ 缺参拒文缺失、与 `{}` 那一问报文不同 ⇒ 红）与非空 `target` 解析为多项目工作区 ⇒ 仍拒（守卫整条删去 ⇒ §7 的 7-15 变绿 ⇒ 红） |

## 6. 验收标准（回指需求条目）

| # | 判据（可跑） | 回指 |
|---|---|---|
| AC-1 | 跨项目清单出 `PASS`：临时域造两个各带 `PROJECT-MANIFEST.json` 的项目，各放一档、档内指针完整 ⇒ `doc_check({mode:"gate", docs:[两档]})` 首行 `DOC-CHECK GATE: PASS` | F17（一档一根）∥ AC-15 ① |
| AC-2 | 单项目零回归：`target` = 本仓根（∥ 锚即本仓）时，本仓固定三档的 `report` 面与基线（改码前同一命令的报面整段，存批档实施记录）**逐字相等**（差 0），且域表读数行零出 | AC-15 ② |
| AC-3 | 无声明根 ⇒ `ERROR`：直接调引擎、`root` 缺省 ∥ 空串 ⇒ 首行 `DOC-CHECK GATE: ERROR（无法定根 N 档）`，逐档点名该档与原因，原因句按 §2.4 的表逐档取式；**假话零出**——清单里若有档带 manifest 祖先，该档行零含「无 `PROJECT-MANIFEST.json`」 | F17（解析不到根 ⇒ 显式报错）∥ AC-15 ③ |
| AC-4 | 不出一半：无声明根时报面**零 `✗` 命中行**，且每档都被点名（N = 清单独特条目数——见 §2.4）——「判不了」不出成「有的判过了」 | F17（不许静默跳过该档） |
| AC-5 | 判定内容零改：同一批夹具（含跨项目清单）上，引擎整次调用的 `hits` 三桶（锚 ∥ 段长 ∥ 行号坐标）与**逐档直调判法本体**的合并值逐项相等——逐档值 = `checkAnchors(rootOf(该档), { files: [该档] })` 的锚数 + `checkParagraphs` 的段数 + `collectLineRefs` 的正文面数。它判的是判定结果，不是文件动没动：分组只换喂进去的根 | AC-15 ⑥ |
| AC-6 | 报面分段：跨项目清单的每条命中行带 `[<项目名>]`（项目名按 §2.3 取最短唯一定位后缀，同名根必须分得开）且行内路径相对其自身根；单根清单零标签、无根行 | AC-15 ⑤ |
| AC-7 | 一条 verdict：跨项目清单里一档命中 ⇒ 首行只有一条 `REFUSED`，全文 `DOC-CHECK GATE:` 出现一次 | AC-15 ④ |
| AC-8 | 工作区锚照判 = **等价性**：同一清单、同一内容，**每根一问**——夹具工作区下两个项目根（A ∥ B）各跑一次：`target` = **A 的项目根**一问 ∥ `target` = **B 的项目根**一问，两问**首行判决词相同、`hits` 三桶（锚 ∥ 段长 ∥ 行号坐标）逐项相等**。X 由档自己定（干净 ⇒ `PASS`；有真命中 ⇒ `REFUSED（…）`），本条不指定 X。判法：夹具 = 工作区 + 两项目各一档，条目用**绝对路径**（本条判的是定根，不是相对条目的解析基准）→ 两轮（两档皆干净 ∥ 一档带真悬空指针），每轮两问（A 根 ∥ B 根）；坏法 = 恢复 `view.state === "workspace"` 提前返回 ⇒ 「`target` = A 的项目根」那一问变 `ERROR`、与 B 根那一问不等 ⇒ 红 | F17 ∥ §2.4 |
| AC-9 | 域表按档根（两向）：B 项目档里的 `docs/batches/<x>.md` 指向 B 自己的批档 ⇒ 面判豁免、零 `档缺`；A 项目档里同一 token 面 A 无此路径 ⇒ 照判 `档缺`。判法：把域表改回从声明根读一次，B 那处会变 `档缺` ⇒ 红 | §2.5 ∥ F17 |
| AC-10 | 域表读数可见：跨项目清单的 `report` 面出「域表读数：N 根」，逐根一行、无 manifest 的根写明空域表；同一命令 `gate` 面该行零出；单项目锚下 `gate` ∥ `report` 两面均零出。判法：删读数块 ⇒ 行缺 ⇒ 红 | §2.5 读数口径 |
| AC-11 | 缺 `target` ∥ `target: null` 两问皆拒：同一清单、同一会话锚（工作区），`{}` 与 `{target: null}` 两次调用**首行判决词相同、报文同**——两队都是 `ERROR`、都点名 `target`、零判定（`hits` 三桶双空）。判法：夹具同 AC-8，两轮（干净 ∥ 有真命中），档面结论不进本条；**坏法** = 守卫写回 `args?.target !== undefined` ⇒ `null` 那一问落兜底支、报文与 `{}` 那一问不同 ⇒ 红——红点写在**不变式**上（两问报文相同被破） | §5 KD-10 ∥ F17 |

**零回归怎么量**：基线与新行为都比同一份命令输出（`report` 面报面整段），不是比「我记得原来是这样」；基线必须在改码**之前**取并随本批实施记录存档，改后逐字比。**两次读数都取新进程直调盘上模块**（§2 读数口径）——两个载体各量一次，比出来的差不说明任何事。

## 7. 用例表

| # | 类 | 输入 | 期望 |
|---|---|---|---|
| 7-1 | 正常 | 两个项目各一档，跨项目清单，指针完整 | 首行 `PASS`；范围行列出两个根；`projectRoots` 两根升序 |
| 7-2 | 正常 | 单项目清单（本仓三档） | 报面与基线逐字相等；`projectRoots` 长度 1 |
| 7-3 | 正常 | 单项目清单，某档含真悬空指针 | `REFUSED`，命中行形与今日一致（无标签） |
| 7-4 | 边界 | 跨项目清单，A 档命中、B 档干净 | `REFUSED`；命中行带 `[A]`；无第二条 verdict |
| 7-5 | 边界 | 无主档 + 声明根是普通目录（夹具场景） | 照判、不报错（声明根接手），与今日一致 |
| 7-6 | 边界 | 清单里两份档同属一项目 | 一根一组，标签零出（≥2 根才打标） |
| 7-7 | 错误 | `root` 入参缺省 ∥ 空串；清单三条：有 manifest 祖先的档 ∥ 无 manifest 祖先的档 ∥ 一条相对条目 | 首行 `ERROR（无法定根 N 档）` + 逐档点名，原因句按 §2.4 逐档取式（有 manifest 祖先那一档零含「无 `PROJECT-MANIFEST.json`」）；零 `✗` 行 |
| 7-8 | 边界 | 无主档 + 声明根是多项目工作区 | 照判、不报错——声明根不因自身不是项目而被拒 |
| 7-9 | 错误 | `docs` 里一档不在盘 | 维持既有行为：report 抛错点名、gate 出跳过行（本批不改） |
| 7-10 | 边界 | 两个项目的根目录**同名**（各有 `web`），跨项目清单里一档命中 | 标签取最短唯一定位后缀、两根互不相同（`[a/web]` ∥ `[b/web]`）；无同名时仍是一段（`[projB]`） |
| 7-11 | 正常 | 会话锚 = 工作区（无 manifest）、`target` = 该工作区的绝对路径、清单跨两项目（两档皆干净） | 各有其根、首行 `PASS`，与 `target` = 项目根 那一问同结论（AC-8）；`report` 面出域表读数 N=2；`gate` 面无该行 |
| 7-12 | 边界 | 跨项目清单，B 档引 B 自己的批档（只在 B 的 `docRoot.batches` 下成立） | 该 token 面判豁免、零 `档缺`；A 档同形 token 面 A 无此路径 ⇒ `档缺` |
| 7-13 | 错误 | 清单里一档的祖先链无 manifest、声明根是普通目录 | 域表为空集：批档面互引照判、同名候选零提示；读数行写明「无 `PROJECT-MANIFEST.json`」——零 `PASS` 假绿 |
| 7-14 | 边界 | 同一清单、锚 = 工作区，`{}` 与 `{target: null}` 各跑一次 | 两问皆拒：首行 `ERROR`、报文含 `target`、零 `✗` 命中行、`hits` 三桶双空（AC-11） |
| 7-15 | 错误 | 会话锚 = 工作区；调用方给了**非空字符串** `target`，解析结果 = 多项目工作区 | 首行 `ERROR`（工具面拒——「给了」判在入参形状、歧义判在解析结果，§2.4 两层分界的工具面那一层）；守卫整条删去 ⇒ 本用例变绿 ⇒ 红（回指 §5 KD-10 ∥ §3 工具面行） |

## 8. 边界（本批不做）

- **不改判定内容**：锚 ∥ 段长 ∥ 行号坐标 ∥ 引文判法一字不动；三条判据的阈值与报面句形不变。
- **不放松错判**：没有声明根就是 `ERROR`，不跳过该档、不出半份判定。
- **不做全仓扫描**：清单仍是唯一范围来源；按档定根不等于按目录找档。
- **不按项目分 verdict**：一次调用一个答案。
- **不合并各组扫描根**：每组只吃自己那根的域表（§2.5 KD-9）；域表为空集时向严判，不向宽判。
- **不改解析层四态语义**：`thincoder-core/path-resolve.mjs` 的 `ambiguous` 判据归 `docs/core/design/PATH-RESOLUTION.md`；本档只规定工具面**何时拒**（`target` 缺 ∥ `null` ∥ 空串 ⇒ 拒；非空 `target` 解析为多项目工作区 ⇒ 另拒）。
- **`gate` 面零改**：域表读数不进 verdict、不改首行与命中行形。
- **需求档本批不再改**：`docs/core/requirements/DOC-CHECK.md` 已含 F17 ∥ AC-15。

### 登记项（同病但本批只登记、不越界改）

1. **收口门的兜底臂**：`thincoder-core/agent-tools/batch-gate.mjs` 已按档定根（`owningProject(selfAbs, base)`），但 `?? batchProjectRoot(base)` 在无主时落会话根——与 KD-4 同形，却少一道「这份根是谁给的」的区分。复现路径：锚为工作区、`selfAbs` 属另一个项目 ⇒ 兜底根与档的根不同，报面路径随之相对错根显示。本批不改。
2. **写前门的根入参**：`thincoder-core/tools/doc-write-gate.mjs` 把 `projectRoot` 传进 `runDocCheck`，片档落在目标档同目录。该根是不是目标档的所属项目根，本席未取证；若同病，本批登记、另轮处置。

## 9. 集成测试设计（RTM 增量）

读 `test/RTM.md` 故事索引表与分册结构后按增量作答：

- **改写的断言 = 1**：`test/rtm/paths.md` 的 29-2 行原断言「工作区锚下 `doc_check({mode:"gate"})` 不带 `target` ⇒ 首行 `ERROR（多项目工作区：请指名 target）`」——盘上真值是照判，该断言本就为假。`target` 必填后，该行的文档门那一笔改成「拒 + 报文点名 `target`」（与工具面同句）；「工作区作声明根照判」那一面移入 `test/rtm/guard.md` 的 `36-1`。
- **冗余行 = 0**。
- **缺的行 = 1 → 已落为 `36-3`**：故事 36（跨项目文档清单的交付门按各档自身项目根判）下的「域表按档根」行 = `test/rtm/guard.md` 的 `36-3`（B 档同基底互引豁免 ∥ A 档同 token 照判 `档缺`）；业务入口与 `36-1` 同一个入口（会话锚 = 工作区，下辖两个项目、自身无 manifest）；回指本档 **§2.5** ∥ **AC-9**。
- **AC-8 的干净轮由既有 `36-1` 覆盖**——本批不重复加行。
- **AC-11 不另立集成行**：它与 AC-8 是同一条交互（工具面 ⟷ 引擎 ⟷ 定根）、同一夹具，差别只在入参形；缺参面由 `test/rtm/paths.md` 的 `29-2` 那一笔断（拒 + 报文点名 `target`）。

域表按档根行的**交互** = 引擎分组 → 域表按组根读 → 面判豁免；**业务可观察结果** = 该档零 `档缺` 命中。文件落 `test/integration/**`，与用例代码同目录；`test/**` 不属本席笔域，落地归实施轮。
