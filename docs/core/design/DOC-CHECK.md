# 文档检查（DOC-CHECK）· 设计

> 需求层 = `docs/core/requirements/DOC-CHECK.md`（F1–F21 / AC-1–AC-19；本批的判据条目 = **F18–F21** ∥ **AC-16–AC-19**）。本档只答「怎么建」，判据口径不重述（单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20）。
> 改动面两笔：**档名与扩展名的识别面**（§2.6）与**逐条豁免登记 · 假阳第三档**（§2.7）；三条判据的判定逻辑、命中类与 verdict 串一字不动。
> 判据仍三条（锚 ∥ 段长 ∥ 行号坐标）：段长 ∥ 行号坐标两条与引文判法未动，三条判据的阈值未动；判据口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20。

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

### 2.2 分组判（只换喂进去的根）

引擎在**分组之前**先定声明根：缺声明根 ⇒ 整清单走 §2.4 的 `ERROR`（不出现「部分组无根」）。声明根在 ⇒ 可判集 `checkFiles` 按 `rootOf` 分组，每组调一次既有 `checkAnchors(root_i, { files: group_i })`，命中按文件稳定序合并。

**另两条判据与根无关**：`checkParagraphs({ paragraphMax, lineMax, exemptZones, files: checkFiles })` 与 `collectLineRefs({ files: checkFiles })` 都不收根（读码取证）⇒ 全清单一次跑完，零改。

**为什么这样切**：分组只换喂进去的根，抽取式 ∥ 解析序 ∥ 面判这些判法内部不因分组而改（锚判据的跨仓三笔是另一笔改动）；跨项目清单在锚面等价于「两组各按自己的根判一遍」。

**弃案：把根做成 `checkAnchors` 的逐 token 参数**——那要改解析序内部（同轮记忆按根建、同名候选扫描根按根取），判法跟着动，与本档 §8 的边界相冲。

### 2.3 命中报面（跨项目清单怎么读）

- **verdict 只有一条**：一次调用一个答案。不按项目分 verdict——分节判 PASS 会让读者读到其中一节的 PASS，而另一节是 REFUSED。
- **单根清单**：**不附根行**；除本档头注列的两形（`未核 N 条` 与环引行）外，报面照旧（零回归的判据面见 §6 的 AC-2）。
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
- **为什么这是政策，不是公式的推论**：`rootOf` 的 `?? declaredBase` 只在「祖先链无 manifest」的档上落空——**一个有 manifest 祖先的档，没有声明根也本来就有根**（`owningProject` 沿祖先链取最近带 manifest 的目录，见 §2.1）。所以「整清单不判」不是公式算出来的结论，而是**刻意的一条政策**：声明根是调用的前置条件，缺它整清单不判，**即使部分档本可定根也不出半份判定**。理由两条：缺声明根时盘上的形是**整次不判**（`thincoder-core/doc-check/per-root.mjs` 的 `declaredRoot` 取 `null` ⇒ 整清单走本节），政策与它同向——把不可读的崩溃换成一个能读的拒绝；而半份判定在报面上分不出「这档干净」与「这档没判」。

### 2.5 域表：按各档所属项目根读

**判据**：一份档的指针按谁的项目声明判，它的域表就按谁的项目根读——域表与判定同一条规则、同一个根。

- **域表三项**：`docRoot` 各键（同名候选的扫描根）· `docRoot.batches`（批档基底根——决定「批档面互引」豁不豁免）· `index.publicRepos`（声明仓引用的**判据源**：那张表就是本仓出边，未声明即 `档缺`）。三项一律取自**该档所属项目根**的 `PROJECT-MANIFEST.json`。
- **`index.publicRepos` 的读取点**：值单源 = `thincoder-core/declaration.mjs` 的 `declaredPublicRoots`；解析层经 `thincoder-core/declared-repos.mjs` 的 `declaredOutEdges` 取三件（目录名 · 声明项原文 · 本机在盘）。判定面 `thincoder-core/doc-check/anchors.mjs` 不直读该键，只 import 解析层与出边投影。
- **第三项的按档根性（读码佐证）**：判法面的 `resolveDoc` 把**该档的判定根**当解析锚传进统一解析层；解析层以锚定 `start`，声明仓名集按 `start` 取；声明层的 `declaredPublicRoots` 再按入点取声明——三行盘上逐字见下方围栏。
- **声明源同时是环检的边集**：锚判据按被判档的组根走一遍出边图，每个节点读它**自己**的 manifest（兄弟仓各读各的，不借本根的声明）；无 manifest 的节点是叶仓，没有出边，走查在该节点止步。

```text
thincoder-core/doc-check/anchors.mjs · resolveDoc（base = checkAnchors 收到的判定根）
  return resolvePathTarget(base, token, { kind: "file", order: "root-first", referrer: refFile, declaredRepos: true, scanBases, session })
thincoder-core/path-resolve.mjs
  const start = resolve(anchor ?? ".")
  const declared = declaredOutEdges(start).find((e) => e.name === repo)
thincoder-core/declaration.mjs · declaredPublicRoots 的参数注
  @param {string} [cwd] 会话锚（项目根经 manifest.mjs 解析）
```

链上无声明根一环：分组后判定根 = 组根（§2.2）＝该档所属项目根，各档的 `publicRepos` 各读各的根，头句第三项由此成立；这条链原样保留。
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
- `gate` 面不出域表读数：verdict 面只放判据。既有先例同向——`lines` 读数与批档面留痕行都只在报告态出。`gate` 面本批增的是 `未核 N 条` 列报（不进 `hits`、不动 verdict）与环引命中行；阈值与其余命中行形未动。

### 2.6 档名与扩展名识别面（F18 ∥ F19）

**机制的落点只有一处**：`thincoder-core/doc-check/anchors.mjs` 导出的一组常量与一个谓词。

- **常量**：`NAME_CH` · `EXT_PART` · `TOKEN_LEFT_GUARD` · `TOKEN_RIGHT_GUARD` · `DEFAULT_DOC_EXTS`。
- **谓词**：`isDocToken(token, exts)`——清单的判定落点（见下「清单落在哪一层」）。
- **四条抽取式由常量拼出**：锚 `ANCHOR_RE` ∥ 花括号组 `BRACE_GROUP_RE` ∥ 依据行 `CITE_RE_SRC`（三条同住该档）∥ 行号面 `NAME_RE`（住 `thincoder-core/doc-check/line-refs.mjs`，本批改吃这一组）。

**一个 token 要成为候选，只有一条腿：后缀落在扩展名清单内**

| 形 | 例 | 判据 |
|---|---|---|
| 裸名 | `x.py` ∥ `JSON.parse` | 后缀在清单内才是候选 |
| 路径形 | `docs/x.py` ∥ `build/app.tar.gz` | 与裸名同一把尺——后缀在清单内才是候选 |

**判决依据** = 用户 2026-11-09 裁定原话：「统一一条腿，路径形也查清单；真文件名不在这条腿上，按真悬空处理。」

**为什么只剩一条腿**：先前那一版把路径形从清单里放出来，理由是「路径形本身就是最强证据」。实跑下来，那一支放进来的正是**版本区间与归档名**——`20.x/22.x` ∥ `tar.gz`，它们恰好都带路径分隔符。路径分隔符证明的是「这是一条路径」，不是「这是一份档」。

**为什么清单必须管住裸名**：裸名是散文里最常见的一形，而代码表达式、字段访问、版本区间全落在这一形上。它们**不是**候选——清单里没有 `parse` ∥ `env` ∥ `log` ∥ `map` ∥ `keys` 这些末段。

本批一旦放开扩展名，它们会**全部**成为候选并一律解不到 ⇒ `档缺`。现盘 `docs/core/design/CONFIG.md` 的「严格 `JSON.parse`」与 `docs/core/design/MCP.md` 的「其余 → `JSON.stringify`」就是活例子。清单是这一形唯一的过滤器。

**清单 = 项目声明面；缺省值 = 引擎常量 `DEFAULT_DOC_EXTS`**：

- 键 = `index.docCheckExts`（数组，缺省 `[]` = 用引擎常量），按**该档所属项目根**读——与域表同一条规则、同一个根（§2.5）。
- **并集不替换**：项目写的项追加在缺省值之后（与 `codeExtensions` / `docExtensions` 同族语义）。拿它当「把判集收窄」用的路走不通，也不该通——窄判集是豁免面的事（§2.7）。
- 比较不折叠点、不分大小写：`JSON` 与 `json` 同项，`.md` 与 `md` 同项（书写面允许带前导点）。
- **报面读数一行，只在该仓写了这一项时出**：`扩展名清单：缺省 + 本仓 N 项`。不进 `hits`、不改 verdict；没写这一项的仓零出 ⇒ 单项目零回归面不破。

**`DEFAULT_DOC_EXTS` 的取形六条**：

- **F19 点名的必须在**：`py` ∥ `csv` ∥ `txt` ∥ `sql` ∥ `xml`——AC-17 的判据钉在这几个后缀上，缺一项该条当场红。
- **改前认得的 12 项全留**：`md` ∥ `mjs` ∥ `cjs` ∥ `js` ∥ `json` ∥ `css` ∥ `html` ∥ `svg` ∥ `yml` ∥ `yaml` ∥ `sh` ∥ `ps1`。退役闭集是把它换成可配清单，不是把已经认得的后缀扔掉（扔掉即零回归面破）。
- **真实文件类型补入**：`ts` ∥ `tsx` ∥ `jsx` ∥ `vue` ∥ `rb` ∥ `go` ∥ `rs` ∥ `java` ∥ `kt` ∥ `toml` ∥ `ini` ∥ `conf` ∥ `proto` ∥ `ico` ∥ `git` ∥ `db` ∥ `pem` ∥ `pub`。**完整清单只住 `DEFAULT_DOC_EXTS` 一处**，本档不复制第二份字面。
- **代码表达式 ∥ 字段访问的末段一律不进**：`parse` ∥ `stringify` ∥ `env` ∥ `log` ∥ `map` ∥ `lock` ∥ `keys` ∥ `filter` ∥ `join` ∥ `slice` ∥ `all` ∥ `set` ∥ `get` ∥ `has` ∥ `push` ∥ `then` ∥ `catch` ∥ `timer`。
- **单字符后缀不入**（用户 2026-11-09 裁定）：`.x` 正是 `20.x/22.x` 的来源。**代价如实**：真实单字符后缀 `.c` ∥ `.h` ∥ `.r` 从此永久不成候选，方向是漏报；要判这类路径，出口是 §8 的两条既有写法（围栏块 ∥ 目录形），不是把单字符后缀请回清单。
- **归档内层不入**：`tar` ∥ `gz` ∥ `zip` ∥ `bz2` ∥ `xz` ∥ `7z` ∥ `tgz` ∥ `rar` 不单列；末段后缀取法 ⇒ `build/app.tar.gz` 的末段是 `gz`，不在清单 ⇒ **整串不当档名**。

**生效清单怎么拼 · 这两条坐在哪**：`生效清单 = DEFAULT_DOC_EXTS ∪ 该档所属项目根的 index.docCheckExts`，并集之后过一次取形过滤（单字符后缀 ∥ 归档内层一律剔除）。

- **过滤坐在清单装配处**（`runDocCheck` 拼出本次调用的清单那一步），不在谓词里：谓词 `isDocToken` 只按字面查这张已过滤的表，不另设第二支。
- **项目自己写进去的项同样被剔**：写 `x` ∥ `tar` 与不写，读数逐字相同。不另设报面句、不逐条点名。

**划界 = 「认错了东西」与「认对了、盘上没有」**：

- **不进清单的** = 认错了东西：`JSON.parse` 是代码表达式、`arr.map` 是字段访问、`20.x` 是版本号、`build/app.tar.gz` 是归档名。它们不是文档名，认了就是误报。
- **进清单的** = 认对了而盘上没有：`build/icon.ico` ∥ `cert.pem` ∥ `memory.db` ∥ `org/repo.git` ∥ 兄弟仓源码路径——它们**真的指向了盘上没有的路径**。工具把这件事说出来是它的职责，说不出才是失职。报告面因此判 `档缺`，文档侧的出口是 §8 的两条合法写法。

**形护（`EXT_PART`）与清单各管一段**：形护判「这个后缀长得像不像后缀」——`1.5` ∥ `v2.0` ∥ `192.168.1.1` 的扩展名首字符是数字，抽都抽不出来；清单判「这个后缀算不算本项目的档」。两道都过才是候选：缺形护则数字形进候选，缺清单则代码表达式进候选。

```text
NAME_CH    = \p{L}\p{N}_.\-               名字字符类：Unicode 字母与数字（含中日韩）+ 原 ASCII 符号集
EXT_PART   = \.[A-Za-z][A-Za-z0-9]{0,9}   ASCII 点 + 首字符字母 + 长度 1–10
左界       = (?<![\p{L}\p{N}_.\-\\/@<>])   不得从更长的名字 ∥ 路径中间起抽（四条同取一份定义）
右界       = (?![\p{L}\p{N}_])             扩展名后紧邻字母数字 ⇒ 不是完整 token（四条同取一份定义）
构造       = new RegExp(<式>, "gu")        \p{…} 只在 u 标志下成立；四条抽取式同加
```

**清单落在哪一层（形护进正则，清单进谓词——两条各坐一处）**：

- **形护进正则**：它是**形**，对所有 token 一个标准、可写成一条式。且抽出再丢会动归属窗——`1.5` 先被抽出再被丢掉，那一行里其余 token 的行号坐标归属跟着变。
- **清单进谓词**：它是**项目声明**，随根变、读不到写不进一条全局式；生效面也在报面可见（该仓写了清单就有那行读数）。被挡下的 token 不逐条列——数量大，列出来正是真命中被淹没的成因。
- **落点 = `isDocToken(token, exts)`**，与 `docNameExemption` **同一批调用点**：锚 ∥ 花括号 ∥ 依据行 ∥ 行号面四处，各加一次同形判断。
- **谓词只看末段后缀，不看有没有目录段**：两条形在谓词里没有分支——取 token 末段最后一个点之后的那一段查清单。

**为什么边界对也进导出面**：今天 `ANCHOR_RE` 与 `NAME_RE` 是两条各自写的正则——名字字符类两处各一份字面，左界也各一份，且两处已经不同（`TOKEN_LEFT_GUARD` 含 `<>`，`NAME_RE` 那条不含）。真正共用住的只有扩展名枚举一项。

本批把常量与边界对一并导出，四条抽取式从此只有一个定义处。依赖方向不变：`line-refs.mjs` → `anchors.mjs`，它本就 import `docNameExemption`。

**收敛带来的一处行为差（如实）**：`NAME_RE` 的左界改用 `TOKEN_LEFT_GUARD` ⇒ 名字前紧贴 `<` ∥ `>` 的 token 不再被抽。方向是漏报，且只是把两处既有写法并成一处——留两处则两处迟早各改各的。

**为什么中文句读吞不进来**（三条，逐条可判）：

- **句读不在名字字符类内**：`。，、；：？！「」『』（）《》【】` 属 `\p{P}`，不在 `\p{L}\p{N}` 之内 ⇒ 一律截断名字，既做不成名字的一段，也做不成扩展名的首字符。
- **扩展名分隔符只认 ASCII 点**：全角 `。` 与 `．` 都不是分隔符 ⇒「需求档。」「设计档，」没有扩展名 ⇒ 不构成候选（F18「裸词不得被当成档名」）。
- **左界挡住「从中间起抽」，挡不住「从头起抽一条更长的」**：名字串从中间截断那种抽法不会发生；但一段中文散文后面紧贴的档名，会**连前面那段汉字一起**成一个候选 ⇒ 解不到 ⇒ `档缺` 一条。这是**多报**，不是漏报；出口在写法面（下「紧贴中文的档名」块）。

**`u` 标志的两条附带后果（写清，不留给实现席猜）**：`\p{…}` 不带 `u` 是字面量 `p{…}`，整条抽取式会静默变成另一种式——四条必须同加 `u`；`u` 下过度的转义会在模块求值时抛错（fail-loud 在载入面，比抽出错字好）。

**紧贴中文的档名：多报一条整段 token（实测）**。散文里紧贴的档名若前面没有分隔（空白 ∥ 标点 ∥ 反引号 ∥ 行首）⇒ 该档名与前面那段汉字**一起**成一个候选，解不到 ⇒ `档缺` 一条。**方向是多报**，不是漏报——左界挡的是「从更长的串中间起抽」，挡不住「从串头起抽一条更长的」。

实测三读（夹具全程在系统临时域，零落仓；示例住围栏块，判据整块跳过）：

```text
详见在盘档.md。       候选 = 详见在盘档.md（整串，连前面的汉字）  ⇒ 档缺 1 条
详见 `见在盘档.md` 。  两侧有反引号 ⇒ 候选 = 见在盘档.md 在盘     ⇒ 零命中
详见 见在盘档.md 。    两侧有空格   ⇒ 候选 = 见在盘档.md 在盘     ⇒ 零命中
```

**写法出口（给出怎么写，不只是记一条缺陷）**：提到档名时**用反引号包住**，或**与前后汉字留一个空格**；行首起写的档名本来就零命中。

**为什么不设回退支**：本档**不猜名字从哪个汉字开始**——词法上分不开「真中文档名」与「汉字紧贴档名」，回退支一开，任何真悬空都有了一条洗白的路（与 §2.2 弃案同形）。

**仓外路径族：真悬空，照报（不是误报）**。清单把「认错了东西」那一族挡住之后，剩下一批**真的指向盘上没有的路径**的写法——构建产物（`build/icon.ico`）、运行时数据（`memory.db`）、凭据（`cert.pem`）、兄弟仓源码（`MiMo-Code/packages/opencode/src/acp/agent.ts`）、外部仓库（`org/repo.git`）。工具把「指了、盘上没有」说出来正是它的职责。

文档侧的出口是**两条既有写法**（§8）：写进围栏块（逐字证据，判据整块跳过）∥ 写成目录形（`build/`，不带后缀、不成候选）。两条都不新增机制，也不是豁免——是同一个事实换一种写得对的形。

**豁免谓词的词干判定 = `isExtension`**：末段算不算扩展名由扩展名定义判（`isExtension(ext)`），扩展名定义只此一处——豁免谓词与抽取面不得各持一份（F12 单源）。

**「词 + 点 + 字母」这一族按清单分流（如实）**：

```text
e.g ∥ i.e          .g ∥ .e 不在清单 ⇒ 本批起不再是候选（改前也不是——闭集本就不含）⇒ 零新增
Node.js ∥ Mr.Smith  Node.js 的 .js 在清单内 ⇒ 候选（改前也是候选）；Mr.Smith 的 .Smith 不在清单 ⇒ 不再是候选
```

**最近先例（对齐 ∥ 偏离）**：

- **对齐 `thincoder-core/doc-check/anchors.mjs` 的边界对**（既有私有件 `TOKEN_LEFT_GUARD` ∥ `TOKEN_RIGHT_GUARD`，现由锚抽取式消费）：本批把同一对边界转导出面、四条抽取式同吃一份——照既有写法，不新造第二个定义处。
- **对齐 `index` 族的扩展名键**（`index.codeExtensions` ∥ `index.docExtensions`）：`index.docCheckExts` 照抄同族三件事——`index` 子键 ∥ 数组 ∥ 与缺省并集只增不减。
- **偏离：扩展名定义从闭集改成「清单 + 谓词」两段**。偏离理由 = 能力面失败，不是口味——闭集认不出 `.py` 一类真后缀（F19 要的正是这一类），而放开成「任意点 + 字母」会把 `JSON.parse` ∥ `20.x` 淹进候选（F18 的误报为零当场破）；闭集与全放开之间，只剩「可配清单 + 形护」这一条能同时满足两条需求。

**扩展名枚举退役的 D14 清扫**（口径 = `docs/core/design/DOC-DISCIPLINE.md` §1 D14）：

- **族怎么认**：这一族 = doc-check 的扩展名枚举——**无前导点、数组形**（`["md", "mjs", …]`），消费面 = 抽取面四条 + 豁免谓词的词干判定。
- **域**：跟踪面的 `*.md` 与 `*.mjs`，扣 `docs/batches/**`（一次性记录面，随批删）与 `_archive/**`。
- **同名不同族，域内排除**：`thincoder-core/index-discover.mjs`（带点 `Set`，索引面档发现）· `thincoder-core/memory/schema.mjs` 与其再出口 `thincoder-core/memory.mjs`（带点 `Set`，记忆面）。它们与退役件只是同名，扫进去就是误伤。
- **逐处三类处置**：`delete`（句已读不成）∥ `re-point`（改指 `DEFAULT_DOC_EXTS` ∥ `isExtension`）∥ `转台账`（写权不在本批的档，登记一行并把到期条件写进证据）。
- **预期残留数住批档 §2**（D12：规范面不载绝对读数）；收口判据 = 实测命中 = 批档 §2 预先写下的那个数，差一条即未闭。

**先例三问**：

- **在哪**：`thincoder-core/doc-check/anchors.mjs` 的 `TOKEN_LEFT_GUARD` ∥ `TOKEN_RIGHT_GUARD` ∥ `ANCHOR_RE`（三个既有件，本批改值不改位）。
- **叫什么**：`NAME_CH` ∥ `EXT_PART` ∥ `isExtension` ∥ `isDocToken`（四个新名，三问见 §5）；`DEFAULT_DOC_EXTS` = **改前那份扩展名枚举的新名**（改名，不是新造；位置与消费面不变）；`TOKEN_LEFT_GUARD` ∥ `TOKEN_RIGHT_GUARD`（既有私有件，本批改值不改位、转导出面）。
- **谁在用**：`thincoder-core/doc-check/anchors.mjs`（锚 ∥ 花括号组 ∥ 依据行）∥ `thincoder-core/doc-check/line-refs.mjs`（`NAME_RE` 与另三条同吃这一组）∥ `docNameExemption` 的词干判定 ∥ 引擎把清单传给判法面。

**公共源勘查**（范围 = 本仓 + manifest 声明的两个公共仓 `index.publicRepos`：`../thincoder.com` ∥ `../.thincoder`；检索面 = 档名抽取式 ∥ Unicode 字符类 ∥ 豁免登记）：

- **本仓相关 3 处**：`docs/core/design/DOC-DISCIPLINE.md` §3.20（抽取式口径单源）∥ 同档 §3.23（行号面抽取式）∥ `docs/core/design/PATH-RESOLUTION.md`（解析序）。
- **两个公共仓无一相关**：源码面零命中；`.thincoder` 侧只命中一份 tmp 问题单。

**数据事实核对**：本面**有数据断言要读盘**——「新式在现盘 `docs/**` 上新增多少候选、其中多少解不到」只能实跑得出，读码得不出。取法 = 对 `docs/**` 逐行按新抽取式抽 token（围栏块整块跳过）并与旧式 token 集作差，再逐条判存在性。本档只留关系句：清单把代码表达式族清零 ∥ 路径形留下的散文路径族清单收不窄；读数随交付报出。

### 2.7 逐条豁免登记与假阳第三档（F20 ∥ F21）

**声明面**：`PROJECT-MANIFEST.json` 的 `index.docCheckExemptions`（数组，缺省 `[]`）。**按档所属项目根读**——与域表同一条规则、同一个根、同一次 `readManifest`（§2.5），所以一个仓的登记不会替另一个仓放行。键位与名先例 = `index.excludePaths`（`docs/core/design/MANIFEST.md` §2.2）：同 `index` 族、同一份归一，差别只在谁吃这张表。

**一个条目长什么样**（写法例）：

```json
{ "index": { "docCheckExemptions": [
  { "file": "docs/core/design/X.md",
    "kind": "锚·档缺",
    "text": "docs/planned/NEW.md",
    "why": "规则要求计划新建件先写路径（裁定依据 = 用户 2026-11-09 15:15）",
    "review": "2027-01-31" }
] } }
```

**五个字段，缺一无效应**：`file`（项目根相对路径）∥ `kind`（判据类，闭集见下表）∥ `text`（命中文本，见下表）∥ `why`（为什么不算违规——裁定依据）∥ `review`（何时复审）。

- **缺一个 ∥ 形态不对 ⇒ 该条不生效**（命中照拦），并在报面点名。
- **条目形态在消费点判，不进 `validateManifest` 的 `errors`**：一个写坏的条目不该把整份 manifest 打掉——manifest 不可用 ⇒ 域表空集 ⇒ 批档面互引不豁免，代价见本节末第三弃案。

**命中怎么被稳定识别**（本节判据）：**`file` + `kind` + `text` 三合一全等**。不用行号——插一行整片失效，豁免就成了一次性的。

| `kind` | 命中来源 | `text` 取什么 |
|---|---|---|
| `锚·档缺` | 锚面解不到 | 被抽出的那个 token 原文（含目录段，逐字） |
| `锚·节缺` | 目标档无该节 | `<token>§<节号>` |
| `锚·引缺` | 引文不是目标档里的连续子串 | `<token>「<引文>」`（引文逐字，不折叠空白） |
| `段·文字太长，难于阅读` | 段长判据 | 该段整段原文（首尾去空白，内部逐字） |
| `行·行太长` | 行长判据 | 该行整行原文（首尾去空白） |
| `行号坐标` | 行号坐标判据 | 该处所在行的整行原文（首尾去空白） |

- **`file` 比法**走 `pathKey`（与 §2.6 的 `pathKey` 同一条平台规则）；`kind` ∥ `text` 逐字比，**零折算**——不折空白、不换全半角、不换算大小写。折算一次，`text` 就只须「大致对」，判据随之失效（口径同 F13 的引文面）。
- **命中文本被改过 ⇒ 登记失配 ⇒ 照拦**（fail-closed）：裁定是对那一段文字的裁定，原文一变，被裁定过的那处就不存在了。
- **`环引` 不可登记**：它是仓级命中（无行号、无档内文本），假环意味着 `index.publicRepos` 的声明本身错了——那是改声明，不是登记一个假阳。

**三条判据同判，判法本体零改**：`exempted` 的分类在**装配处**做（`thincoder-core/doc-check/index.mjs` 的 `runDocCheck`），在 `perRootGroups` ∥ 三条判据都跑完之后。`thincoder-core/doc-check/anchors.mjs` ∥ `paragraph.mjs` ∥ `line-refs.mjs` 三档因此**不认登记**——它们只产命中，分类在装配处做。本批在这三档的改动只有抽取面（§2.6）与 `paragraph.mjs` 的载荷字段 `text`（§4），判据本体零改。

- **为什么不在判法里做**：段长 ∥ 行号坐标两条也产命中，登记面必须对三条同判；放进锚判法就只覆盖一条。
- **怎么找自己那根的表**：逐条命中按该条自己的 `file` 求 `rootOf(该档, 声明根)`，取该根的登记表——`readOf` 的记忆体，与域表**同一次读**（§2.5 KD-7）。
- **verdict 只吃未豁免的那批**：`hits` 三数（锚 ∥ 段 ∥ 行号坐标）与 `hits.total` 只数未登记的条目；`exempted` 另成一桶（与 `unverified` ∥ `unreadable` 同层：读数，不进 `hits`、不改 verdict）。
- **写前门同吃，这不是新机制**：`thincoder-core/tools/doc-write-gate.mjs` 走同一个引擎 ⇒ 引擎返回什么它就认什么。效果 = 一段正文若必须写一个尚不存在的路径，登记后仍可编辑；不登记则每一笔写都拒（F14 的死锁面）。

**报面（两问法同出 · 不进 `hits`、不改 verdict）**：

```text
豁免 3 条（已裁定假阳，不阻断交付）：
  [projA] ✗ 锚·档缺 docs/design/X.md:12 docs/planned/NEW.md —— 规则要求先写路径（复审 2027-01-31）
```

- **F21 的四项一个不少**：哪一条（`kind` + `text`）∥ 哪一份档（`file`）∥ 理由（`why`）∥ 复审（`review`）。
- **N = 0 时不出块**：未登记任何豁免的仓，两面报面与改动前逐字相等（零回归）。
- **失配登记照出**：`登记未命中 N 条（原文已变或已不在判集，复核后删）`——登记跟着一条消失的命中活下来，就是下一轮没人敢删的残骸。
- **`report` 末行的清句要带上它**：未登记的命中为 0 而 `exempted` 非 0 ⇒ `结论：0 条命中（… 均清）；已裁定假阳 N 条（见上，不阻断）`——「均清」旁边摆着一列已裁定条目，不读成「这里什么都没有」。

**三个声明面并存，各管一件事**（F3 · 2026-11-09 裁定）：

| 面 | 键 | 管什么 | 行为 |
|---|---|---|---|
| 扩展名面 | `index.docCheckExts` | **哪些 token 算档名候选** | 后缀在清单内才是候选，裸名与路径形同一把尺（§2.6） |
| 排除面 | `index.docCheckExcludePaths` | **入不入判** | 落进去的档不入判、不出命中；全落进去则 `PASS`（**本批不改**） |
| 豁免面 | `index.docCheckExemptions` | **拦不拦** | 档照判；已登记的命中照列、不阻断 |

- **一句话分清**：排除是「**不看**该档」，豁免是「**看了、已裁定、不拦**」。两者不能互相替代——排除把一片区域变盲区，登记是对一条已看过的命中下结论。
- **判决依据** = 用户 2026-11-09 15:36「维持免检放行不动」＋ 15:38「允许把一片故意变成盲区是我们提供的功能，用不用是他们的选择」。
- **这是明示的取舍**：把一片区域交给排除面，就是选择不去看那片区域；工具照做，**不替使用方决定该不该这么做**。
- **本批的引擎改动因此是加法**：判集过滤器 `splitExcluded` ∥ `excluded` 桶 ∥ `exemptedAll` 三处**一律保留**；新加的是装配处的豁免分类（本节上一段）与 `exempted` 桶。
- **排除面的报面形零改**：`排除 N 档（manifest 排除面命中，未判）` 行 ∥ 全排除时的首行 `PASS` ∥ `范围` 行括注——三处逐字保留。
- **一面不替另一面下结论**：全排除 ⇒ 0 档受检的 `PASS` 是排除面的正确行为；有档受检而另有登记 ⇒ 豁免块列出、首行按**未登记**那批定。

**先例三问**：

- **在哪**：`index` 族（`index.excludePaths` ∥ `index.publicRepos` 同族），读取点 = `thincoder-core/manifest.mjs` 的 `readManifest`。
- **叫什么**：`docCheckExemptions`（键名自带消费面，与旧排除键同式命名）。
- **谁在用**：装配处一处读（引擎）∥ `thincoder-core/tool-docs/manifest.md` 的键面说明 ∥ 报面豁免块。

**公共源勘查**：同 §2.6 那一次勘查（本仓相关 3 处、两个公共仓无一相关）——豁免登记的形在公开源里没有可对齐的先例，本面按 F20 ∥ F21 的字段自建。

**数据事实核对**：本面**无需读盘**——新键本批才设计，盘上不可能已有登记。旧键的现存值仍参与判定（首表的排除面），但它本批不改，也不进本节任何判据。

#### 关键决策

| # | 决策 | 弃案 | 理由 |
|---|---|---|---|
| KD-R1 | 名字字符类 = `\p{L}\p{N}_.\-`，扩展名式 = `\.[A-Za-z][A-Za-z0-9]{0,9}`，两条护栏都写进正则 | 抽出 token 再用谓词过滤 | 四条抽取式共用一份（写谓词要写四份）；且抽出再丢会动归属窗与区间占位，计数面跟着漂 |
| KD-R2 | 左界排除整个名字类（不是「只排除 ASCII 部分」） | 仅排除 ASCII，让中文串可从中截断 | 先截断再猜起点，等于给「真悬空」开一条洗白的路；代价是紧贴散文的档名与前面那段汉字成一个 token ⇒ 一条 `档缺`（多报），出口在写法面（反引号 ∥ 空格） |
| KD-R3 | 扩展名分隔符只认 ASCII 点 | 同时认全角 `．` ∥ `。` | 全角点是中文句读最常见的形，认它等于把「需求档。」读成档名；而盘上档名的分隔符从不是全角 |
| KD-R4 | 豁免谓词的词干判定改吃 `isExtension` | 保留扩展名闭集只给谓词用 | 一份扩展名定义两处消费（抽取面 ∥ 豁免面）必漂，F12 要的正是单源 |
| KD-X1 | 登记存 `index.docCheckExemptions`（manifest） | 独立 JSON ∥ 文档表格 | 独立 JSON = 多一次读 + 多一个「哪个根下有这份档」的约定，`readManifest` 已按根读过；文档表格 = 把机检判据挂在散文列序上，加一列判据就变 |
| KD-X2 | 识别键 = `file` + `kind` + `text` 三合一，不用行号 | 档 + 命中文本 | 同一处文本在两条判据下是两件事（`docs/core/design/DOC-CHECK.md` 既可能 `档缺` 也可能 `节缺`），缺 `kind` 会让一条登记默默免掉另一条 |
| KD-X3 | 条目形态在消费点判，不进 `validateManifest` | 进 `errors`（与 `index.excludePaths` 同款） | 一个写坏的条目不该把整份 manifest 打掉——manifest 不可用 ⇒ 域表空集 ⇒ 批档面互引不豁免 ⇒ 邻仓批档引用一律 `档缺` |
| KD-X4 | 排在 verdict 之前分类：`hits` 只数未登记的 | 登记条目留在 `hits` 里另标 | 消费面（批档门 ∥ 收口 ∥ 写前门）全读 `hits.total`，留在里面就要每处各学一遍「已裁定的不算」——一处漏学就是一次误拦 |
| KD-X5 | **三键并存**：`index.docCheckExcludePaths` 原样保留、行为不变；新增 `index.docCheckExemptions`（拦不拦）与 `index.docCheckExts`（哪些 token 算档名）。引擎侧 `splitExcluded` ∥ `excluded` 桶 ∥ `exemptedAll` 三处零改 | 删旧键 ∥ 留键禁用途 ∥ 出现即报错 | 用户 2026-11-09 15:35/15:36 裁定：删键不在我们工具里，在**使用方**自己的 manifest 行；免检放行维持不动。工具提供排除能力就要照做，用不用是使用方的选择 |

#### 受影响文件与档层结论

**单源 = §4**：文档级受影响文件面（逐档改动 + 档层结论 + 档层读数的取法）住本档 §4 那张表，本节不另立一张。

**本节只落判据面的两条**：抽取面吃哪一组常量（§2.6），豁免面在装配处分类、`hits` 只数未登记的（§2.7）。

#### 验收（回指本批条目）

本批用例住 `docs/batches/<本批批档同名>.test.mjs`，逐条核法 = `node --test docs/batches/<本批批档同名>.test.mjs`（用毕即删）。

- **AC-R1（非 ASCII 档名判得出 · F18 ∥ AC-16①）**：三例夹具——指向不存在的中文档 ∥ 中文目录下的档 ∥ 纯中文件——在 `report` 面各出一条 `档缺`。判法：把名字字符类换回 `[A-Za-z0-9_.\-]` ⇒ 三例全绿、本条红。
- **AC-R2（普通中文词误报为零 · F18 ∥ AC-16②）**：一份正常中文正文（含「需求档」「设计档」「依据设计档」一类普通词与中文标点）跑 `report` ⇒ 命中 0 条。判法：把扩展名式放宽成「任意点 + 任意字符」⇒ 该份正文出现命中、本条红——这条是「误报为零比判得出更难」的读面。
- **AC-R3（扩展名不闭集 · 数字不成候选 · 两形同一把尺 · F19 ∥ AC-17）**：指向不存在的 `.py` ∥ `.csv` ∥ `.txt` 各一处 ⇒ 三例全红；同一份正文里 `1.5` ∥ `v2.0` ∥ `192.168.1.1` ⇒ 零候选；路径形而后缀不在清单（`docs/notes.xyz` ∥ `20.x/22.x` ∥ `build/app.tar.gz`）⇒ 同样零候选。判法：扩展名式去掉「首字符字母」那一半 ⇒ 数字形变候选、本条红；闭集写回 ⇒ `.py` 那例转绿、本条红；**把「路径形不看清单」写回** ⇒ 那三例成候选、本条红。
- **AC-R4（清单可配：按档根读 · 并集不替换 · 读数行 · F19）**：夹具两项目甲（`index.docCheckExts` 写一个缺省清单里没有的真后缀，如 `tsv`）与乙（不写该键）。甲档引不存在的 `x.tsv` ⇒ `档缺`一条；乙档引同一 token ⇒ **零命中**（清单按档所属项目根读，甲写的不替乙生效）；同一夹具把甲的键改成 `["md"]` ⇒ 指向不存在的 `.py` 仍判 `档缺`（并集：缺省项照旧生效）；再把甲的键加上取形外的两项 `x` ∥ `tar` ⇒ 甲档引 `a.x` ∥ `build/app.tar` 仍**零命中**（装配处剔掉，写了与不写同读数）。`report` 面：甲出`扩展名清单：缺省 + 本仓 N 项`一行，乙零出。判法：并集改成替换 ⇒ `.py` 那例转绿、本条红；清单按声明根读一次 ⇒ 乙档的 `x.tsv` 成候选、本条红；把取形过滤挪进谓词之后（或整条不过滤）⇒ `a.x` ∥ `build/app.tar` 成候选、本条红。

**AC-X1（登记后不阻断且仍列出 · F21 ∥ AC-19①）**：一条真悬空指针登记为假阳 ⇒ `gate` 首行 `PASS`，且回执出豁免块，四个字段齐全（`kind` + `text` ∥ `file` ∥ `why` ∥ `review`）。判法：把登记表读成空 ⇒ 首行变 `REFUSED`、豁免块零出、本条红。
- **AC-X2（撤销后重新计入 · F21 ∥ AC-19②）**：删掉那条登记再跑 ⇒ 同一处回到 `REFUSED（锚 1 条）`，豁免块零出。判法：把登记做成「一经命中永久放行」的缓存 ⇒ 本条红。
- **AC-X3（两面并存，各管一件事 · F20 ∥ AC-18）**：三组夹具。① 某档被目录排除 ⇒ 不入判、零命中、回执出 `排除 N 档（manifest 排除面命中，未判）`；② 同一档不排除、某条命中已登记 ⇒ 该档照判、豁免块列出该条、首行 `PASS`；③ 两面对同一档同时作用 ⇒ **排除优先**，该档不出现在受检清单里、也不出现在豁免块里。判法：删掉 `splitExcluded` ⇒ ① 红（该档的命中冒出来）；删掉豁免分类 ⇒ ② 红（首行 `REFUSED`）。
- **AC-X4（识别键不用行号）**：同一登记，先把命中所在一行之上插入一行空行 ⇒ 仍豁免（首行 `PASS` + 豁免块在）；再把该段 ∥ 该行文字改一个字 ⇒ 转回 `REFUSED`，且回执出 `登记未命中 N 条`。判法：把识别键换成 `file` + 行号 ⇒ 前半变 `REFUSED`、本条红。
- **AC-X5（零登记零变化）**：manifest 无 `docCheckExemptions` 键 ⇒ 两面报面与改动前逐字相等，豁免块与失配行零出。

#### 用例表

| 类 | 输入 | 期望 |
|---|---|---|
| 正常 | 夹具档引一个中文名档（在盘）∥ 一个中文名档（不在盘） | 在盘那处零命中；不在盘那处 `档缺` 一条，命中行点名该中文名 |
| 正常 | 正常中文正文，含「需求档」「设计档」「依据设计档」与中文标点 | 零命中（AC-R2） |
| 正常 | 夹具档引 `x.py` ∥ `y.csv` ∥ `z.txt`，三者不在盘 | 三条 `档缺`（AC-R3） |
| 边界 | 同一份正文含 `1.5` ∥ `v2.0` ∥ `192.168.1.1` ∥ `e.g` ∥ `JSON.parse` ∥ `process.env` ∥ `20.x/22.x` ∥ `build/app.tar.gz` | 数字形不成候选（形护：扩展名首字符是数字）× 单字符后缀不在清单；`e.g` ∥ `i.e` 不成候选（`.g` ∥ `.e` 不在清单）；代码表达式一族不成候选（裸名、后缀在禁入族）；版本区间与归档名不成候选（路径形同样查清单：`x` 单字符、`gz` 归档内层）⇒ 全零命中 |
| 正常 | 夹具档引 `docs/z.py` 与裸名 `y.csv`（`.py` ∥ `.csv` 均在缺省清单内） | 两条形**同一把尺**：各判出存在性（F18「或含路径分隔符」那一半仍成立——路径形只要后缀在清单内就是候选） |
| 边界 | 路径形且后缀不在清单：`docs/notes.xyz` ∥ `20.x/22.x` ∥ `build/app.tar.gz` | 不成候选、零命中——路径分隔符本身不是候选资格 |
| 边界 | 中文散文紧贴一个在盘的中文档名（前面无分隔） | 整串成一个候选（前面那段汉字 + 档名）⇒ 解不到 ⇒ **`档缺` 一条（多报整段 token）**；同例改成反引号包住 ∥ 与前后汉字留一个空格 ⇒ 各零命中（两种写法出口由此钉住） |
| 正常 | 一条真悬空登记为假阳，跑 `gate` | 首行 `PASS`；豁免块一行，`kind` ∥ `text` ∥ `file` ∥ `why` ∥ `review` 齐全（AC-X1） |
| 边界 | 同一夹具删掉登记再跑 | 首行 `REFUSED（锚 1 条）`；豁免块零出（AC-X2） |
| 边界 | 登记后在命中所在一行之上插一行空行 | 仍 `PASS` + 豁免块在（AC-X4 前半） |
| 错误 | 登记后把该档里那段文字改一个字 | 转 `REFUSED`，且出 `登记未命中 N 条`（AC-X4 后半） |
| 错误 | 登记条目缺 `why` ∥ `review`，或 `kind` 不在闭集 | 该条不生效、照拦，报面点名；manifest `ok` 仍为真（KD-X3） |
| 边界 | 同一档既落在排除目录内、又有一条命中被登记 | 排除优先：该档不入判、零命中，豁免块不出该条（AC-X3 ③） |
| 边界 | manifest 无 `docCheckExemptions` | 两面报面与改动前逐字相等，豁免块与失配行零出（AC-X5） |

#### 边界（本批不做）

- **不改三条判据本体**：阈值 ∥ 命中类 ∥ verdict 词 ∥ 抽取式的解析序一律不碰；本批动的是**抽取面的字符类与扩展名式**、以及**豁免面**。
- **不动 `doc_check` 的调用面**：batch 工具机械点 ∥ 收口面 ∥ 端壳用法零改；`exempted` 是引擎返回值多一桶，消费面读 `hits` 的口径不变。
- **不猜名字的起点**：中文散文紧贴的档名会连前面的汉字成一个 token、判一条 `档缺`（多报方向；写法出口 = 反引号 ∥ 空格）；不设「从哪个汉字开始」的回退支。
- **不给登记设机检权限面**：机检判不出「这个裁定是不是真的裁定过」，`why` 的真伪归评审；本批只保证「登记了就可见、撤销了就回来」。
- **不把豁免做成按类**：`kind` 是判据类、`text` 是逐处文本，两者都不接受通配 ∥ 前缀 ∥ 目录（F20 的立条边界）。
- **不加新工具、不引 SQLite**：登记住 manifest 一个数组，零新存储；端壳静态闭包零 `node:sqlite`（W8 契约②）因此不涉及。

### 2.8 `doc_check` 读 manifest 哪几处（单源）

**这是唯一清单**：另两处（`docs/core/design/DOC-DISCIPLINE.md` §3.20 ∥ `docs/core/design/MANIFEST.md` §2.2）只留指针，不重述条目。

**五处，都是声明面，都不是判据参数**：

| # | 键 | 改的是什么 | 读点 |
|---|---|---|---|
| 1 | `docRoot`（各文档根 + `batches`） | **域怎么定**——同名候选的扫描根 ∥ 批档基底根 | 按组根一次 `readManifest`，注入判法面与批档基底（§2.5） |
| 2 | `index.publicRepos` | **域怎么定**——声明仓 = 出边表 = 环检边集 | 同一份 manifest；解析层经 `thincoder-core/declared-repos.mjs` 的 `declaredOutEdges` 取三件（§2.5） |
| 3 | `index.docCheckExcludePaths` | **入不入判** | 判集过滤 `splitExcluded`（§2.7） |
| 4 | `index.docCheckExts` | **哪些 token 算档名候选** | 清单透传给判法面的 `isDocToken`（§2.6） |
| 5 | `index.docCheckExemptions` | **拦不拦** | 装配处分类：`hits` 与 `exempted` 两桶（§2.7） |

- **判据参数一处不读**：阈值与豁免谓词恒为内置常量 `DOC_CHECK_BUILTINS`——「不读 manifest」只对**参数面**成立，对上表五处不成立。
- **一处读不到 = 那一处降级**：manifest 缺 ∥ 非法 ⇒ 域表空集、清单回缺省、排除与豁免皆空（降级口径同 §2.5：空集不向宽判），判据照跑——不是整次不判。

## 3. 接口契约

| 面 | 形状 | 变 ∥ 不变 |
|---|---|---|
| 引擎入口 | `runDocCheck(root, { docs, mode, docsSource, lines })` | **签名不变**；`root` 语义 = 声明根，不再是整批坐标系；缺省 ∥ 空串 ∥ 非字符串 ⇒ §2.4 的 `ERROR` |
| 引擎内部 | `perRootGroups(files, declaredBase)` → `{ root, files }[]`；每组一次 `readManifest(root)` | 取根 = `owningProject(abs, parse(abs).root) ?? declaredBase`；**每根一次读**（§2.5、§5 KD-7） |
| 判法入口 | `checkAnchors(root, { files, manifest? })` | 新增可选 `manifest`：给了就吃它（引擎已读的那份），缺省仍自读——直调判法本体的夹具（AC-5 的对照面）零改 |
| 基底根 | `batchDocBases(cwd, { manifest? })`（`thincoder-core/agent-tools/batch-paths.mjs`） | 同上注入形；批档工具面既有调用零改 |
| 引擎返回 | `projectRoots: string[]`（参与判定的根，升序）＋ `domainTables: { root, manifest }[]` ＋ 锚面的 `unverified` 桶 ＋ 判集一个名字 `checkFiles: string[]`（= 本次判集，仍等于 `range.check` 去掉排除面命中的那批）＋ 豁免桶 `exempted: []`（已裁定假阳，与 `skipped` ∥ `unreadable` ∥ `hits` 各自一桶；消费者 = 两面豁免块与 AC-X1 ∥ AC-X4）＋ 清单透传（该根的 `index.docCheckExts` 交给判法面） | `projectRoots` 的消费者 = 报面根清单行（§2.3）与用例断言；`domainTables` 的消费者 = §2.5 的域表读数块与用例断言；`unverified` 的消费者 = `未核 N 条` 列报（不进 `hits`、不动 verdict）。`hits` 三数口径、`anchorHits` ∥ `paragraphHits` ∥ `lineRefHits` 形状不变 |
| 工具面 | `thincoder-core/agent-tools/doc-check.mjs` | **改两处**：① `target` 必填——缺 ∥ `null` ∥ 空串 ⇒ 拒、报文点名 `target`、零判定（schema 加 `required: ["target"]`）；② `ambiguous` 那处守卫的「给了」判据 = **一个非空字符串**（§5 KD-10），该守卫必须与解析层同一条线——依据 `thincoder-core/path-resolve.mjs`「if (given === undefined || given === null) {」。`view.state === "workspace"` 提前返回**已不在盘上**（盘上照判），不重建。锚只作相对形 `target` 的基根 |
| 判定面 | `thincoder-core/doc-check/anchors.mjs` | 域表吃注入的 `manifest`（读取来源一处）；锚判据另有跨仓三笔——`resolveDoc` 传 `declaredRepos` · 走查声明出边图出 `锚·环引`（仓级命中、无行号）· 两处收集点收 `未核` 且不入 `hits`；判据口径单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.20 |
| 判定面 | `thincoder-core/doc-check/paragraph.mjs` ∥ `line-refs.mjs` | `paragraph.mjs` **只加载荷字段 `text`**（段 = 该段整段原文 ∥ 行 = 该行整行原文）：§2.7 的 kind 表要求这两类命中的 `text` 是原文，不给就登记不了（F20）；判据与命中类零改。`line-refs.mjs` 不在此列：`NAME_RE` 的字符类、扩展名式与边界对随 §2.6 同轮换——本档自写的第二份字面整条删除（判据本体零改） |

数据流：`docs` 条目 →（**无声明根 ⇒ 停在这里，走 §2.4 的 `ERROR`**）→ `resolve(declaredBase, d)` 得绝对路径（路径解析基准**不变**，相对条目仍按声明根解析）→ 可判性判定（在盘 ∥ `.md`，**不变**）→ 按 `rootOf` 分组 → 逐组 `checkAnchors` → 合并命中 → 报面（单根无标 ∥ 多根打标）。

**判据句合规**：分组与定根住在 `thincoder-core/doc-check/per-root.mjs`；锚判据的跨仓三笔只沿 `index.publicRepos` 给出的边读（`thincoder-core/declared-repos.mjs` 的 `declaredCycles` 不遍走目录）⇒ `anchors.domain` ∥ `anchors.roots` 仍零存在，「不做全仓扫描」那条判据句照旧成立（回指 `docs/core/requirements/DOC-CHECK.md` 的边界段判据句）。

## 4. 受影响文件与档层结论

| 文件 | 改动 |
|---|---|
| `thincoder-core/doc-check/index.mjs` | ① 每组一次 `readManifest` 并注入判法；返回 `domainTables`；`report` 面域表读数块（§2.5）。② **保留**：`excludeFaceOf` ∥ `splitExcluded` ∥ `excluded` 桶 ∥ `exemptedAll` 及其三处读它 ∥ 排除桶行——**排除面行为本批零改**（§2.7）。**增**：清单传递（把该根的 `index.docCheckExts` 交给判法面）、装配处的豁免分类（按 `rootOf` 取该根登记表，走 `readOf` 同一次读）、返回 `exempted` 桶、两面豁免块、`report` 末行带已裁定数（§2.7） |
| `thincoder-core/doc-check/anchors.mjs` | ① 域表吃注入的 `manifest`（`docRootBaseKeys` ∥ `batchFaceContext` 两处）；判据面另有跨仓规则三笔（`resolveDoc` 传 `declaredRepos` · 环检出 `锚·环引` · 两处收集点收 `未核` 且不入 `hits`）——判据口径单源见 `docs/core/design/DOC-DISCIPLINE.md` §3.20。② 扩展名枚举换作 `DEFAULT_DOC_EXTS` ∥ `NAME_CH` ∥ `EXT_PART` ∥ `isExtension` ∥ `isDocToken`，**边界对转导出面**；三条抽取式改由这一组常量拼出并加 `u`；`docNameExemption` 的词干判定改吃 `isExtension`；四个豁免调用点各加一次 `isDocToken`（§2.6） |
| `thincoder-core/doc-check/line-refs.mjs` | `NAME_RE` 改由同一组常量拼出（**含边界对**——本档自写的第二份字符类与第二份左界整条删除）并加 `u`；import 面换成新常量；`nameSpans` 的豁免调用点同加 `isDocToken`（§2.6） |
| `thincoder-core/agent-tools/batch-paths.mjs` | `batchDocBases` 增可选 `manifest` 注入（缺省自读，既有调用零改） |
| `thincoder-core/agent-tools/doc-check.mjs` | 改两处：① `target` 必填——缺 ∥ `null` ∥ 空串 ⇒ 拒、点名 `target`（缺省支删除）；schema 加 `required: ["target"]`；② `ambiguous` 守卫的「给了 `target`」判据 = 非空字符串（§3 ∥ §5 KD-10 ∥ AC-11）。工作区锚的提前返回已不在盘上，不重建 |
| `thincoder-core/manifest-schema.mjs` | `DEFAULT_MANIFEST.index` **保留 `docCheckExcludePaths`**（含它那条数组层判据），**新增** `docCheckExts: []` 与 `docCheckExemptions: []`。两键的校验面分开写：`docCheckExts` **进元素层**（与 `codeExtensions` ∥ `docExtensions` 同款——元素须为非空字符串，非串 ∥ 空串进 `errors`）；`docCheckExemptions` **两层都不入选校验**（条目形态在消费点判，KD-X3）；数组层两键都 `[]` 合法。节点数因此 14 → 16 |
| `thincoder-core/declaration.mjs` | **零改**——`splitExcluded` 保留，它的 `normalizePathList` 消费面也保留 |
| `thincoder-core/tools/doc-write-gate.mjs` | **零改**——它所依赖的排除面本批不动 |
| `thincoder-core/tool-docs/doc_check.md` | 解析序句已换三行终稿；**保留**两处旧排除键的免责式说明（首行 `PASS` 那两句）；**增**豁免登记与第三档说明、清单可配一句 |
| `thincoder-core/tool-docs/manifest.md` | 键面**新增两行**（`docCheckExemptions` ∥ `docCheckExts`），旧键行逐字保留；可写节点数句 14 → 16；两键的说明句写「两形同一把尺，后缀在清单内才是候选」；全文压回 5,000 字符以内（删重复叙述，不删键面说明） |
| `docs/core/design/MANIFEST.md` | §2.2 键面**恢复旧键**并新增两键（`docCheckExemptions` ∥ `docCheckExts`）· 元素层句保留旧键点名 · `DEFAULT_MANIFEST` 两处字面（§2.2 ∥ §2.11）· §2.10 键目录补两行 · 节点数 14 → 16 五处对齐（§2.10 领句 ∥ §2.11 白名单 ∥ AC-K2 ∥ KD-M1-42 ∥ KD-M1-45）· AC-47 口径 · **四处改成本轮口径（裸名与路径形同一把尺）**（§2.2 键面条目 ∥ §2.10 键目录 ∥ §2.11 读声明面 ∥ AC-47）· **「读 manifest 四处」两处措辞改为指本档 §2.8（五处）**（§2.11 读声明面句 ∥ AC-47） |
| `docs/core/design/DOC-DISCIPLINE.md` | 五节分列：**§3.20**——「适用面」段把三件事分开写（**判定范围**只落传入文件 ∥ **扫描域**不从 manifest 拿 ∥ **声明面**只改判什么・拦不拦；逐行清单只留指针到 `docs/core/design/DOC-CHECK.md` §2.8），该节其余各处把扩展名的写法换成清单（`DEFAULT_DOC_EXTS` ∪ 该项目 `index.docCheckExts`，两条形同一把尺）。**§3.21** 条目 T Ⅲ 与抽取单源句。**§3.23**（行号坐标条目的新增件条目）判据句。**§3.24**（档名豁免条目）两处——共用扩展名定义 ∥ 按清单剥后缀的词干判定改吃 `isExtension`。**§5 用例表**（`DD-146` ∥ `DD-181`）同换口径 |
| `docs/core/design/DOC-GRAPH.md` | **一处改指（D14）**：§1「起点事实」那处逐字依据（退役常量的声明行）改指活的扩展名清单（依据 `docs/core/design/DOC-CHECK.md` §2.6），否则实施轮改完该句即成 `引缺` |
| `test/rtm/guard.md` ∥ `test/RTM.md` | **36-5 保留**（排除面行为未变），节注里指 `docs/core/design/DOC-CHECK.md` §2.6（排除目录）的那一笔改指 §2.7；故事 `CLI 44` ∥ `CLI 45` 与行 `44-1` ∥ `45-1`（§9） |
| `test/integration/doc-check-exclude-paths.test.mjs` | **保留**——它断的免检放行仍在 |

以下落地件由实施轮创建（`test/**` 不在本席笔域）：

```text
docs/batches/2026-11-09-doc-check-recognition.test.mjs   本批单元测试档（用毕即删）
test/rtm/guard.md                                        44-1 ∥ 45-1 两行与节注
test/integration/**                                      集成用例文件（编号按 §9 落地）
```

**档层结论：本面源档九份，读数已全部取齐——越硬限 0 份、越软线 1 份。** 判据 = `doc_check({mode:"report", lines:[…]})` 的档位标记（读数存批档，本档不预载数值），逐档一句：
- `thincoder-core/doc-check/index.mjs`——标 `soft`，越软线、未越硬限。
- `thincoder-core/doc-check/anchors.mjs` ∥ `thincoder-core/doc-check/line-refs.mjs` ∥ `thincoder-core/doc-check/per-root.mjs` ∥ `thincoder-core/manifest-schema.mjs` ∥ `thincoder-core/declaration.mjs` ∥ `thincoder-core/tools/doc-write-gate.mjs` ∥ `thincoder-core/agent-tools/doc-check.mjs` ∥ `thincoder-core/agent-tools/batch-paths.mjs`——未越线（无标记）。
- 本批单元测试档——实施轮创建后随同一次读数取档位；越硬限即拆，不越硬限不拆。
- **拆分结论**：无一份越硬限 ⇒ 本批不拆。非源码面（两份 tool-docs、两份设计档、测试件）无档位义务。

**接缝与现状**：软线的语义是「主动审视」，不是「拆」。定根 ∥ 分组 ∥ 报面布局这一族（`rootOf` ∥ `perRootGroups` ∥ `reportLayout` ∥ `bucketLines` ∥ `rootsSuffix` ∥ `noRootItems`）与判据本体之间只靠 `runDocCheck` 串联，所以它已整族住在 `thincoder-core/doc-check/per-root.mjs`，`thincoder-core/doc-check/index.mjs` 只留 import 与装配件。

**拆分已落在这条接缝上**：`thincoder-core/doc-check/index.mjs` 越过 800 硬限后，上面那一族整族搬到 `thincoder-core/doc-check/per-root.mjs`；原档只留装配件与判据面，两档都在线内。

**新增源档一份**：拆出档落**引擎同目录**（见上方落地件清单），判据面留原档。

## 5. 关键决策记录

**先例三问**（同一关切在别处已解过一次）：

- **在哪**：`thincoder-core/agent-tools/batch-gate.mjs` 的 `evaluate` 内 `const root = owningProject(selfAbs, base) ?? batchProjectRoot(base)`。
- **叫什么**：取根判据 = `owningProject`（`thincoder-core/manifest.mjs` 导出）；兜底那臂 = `batchProjectRoot`（`thincoder-core/agent-tools/batch-paths.mjs`）。
- **谁在用**（仓根全路径）：`thincoder-core/agent-tools/batch-gate.mjs` · `thincoder-core/agent-tools/batch-paths.mjs` · `thincoder-core/agent-tools/review-facts.mjs` · `thincoder-core/ledger-db.mjs` · `thincoder-core/declaration.mjs` · `thincoder-core/path-resolve.mjs`。

**新引入的名字，逐个三问**（`none found` 的读法 = `grep` 于 `thincoder-core/**` 零命中；取根家族既有名 = `owningProject` ∥ `projectRootView` ∥ `resolveProjectRoot`，逐个比对过不撞名）：

| 新名字 | 在哪 | 叫什么 | 谁在用 |
|---|---|---|---|
| `rootOf` | `none found`——仓内零命中，本批首建，住 `thincoder-core/doc-check/per-root.mjs` | 本档命名（取根式；拆档后由该档导出供装配件调用） | §2.1 ∥ §2.2 ∥ §3 的数据流 |
| `perRootGroups` | `none found`——零命中，本批新建于 `thincoder-core/doc-check/per-root.mjs` | 本档命名 | 引擎入口一处调用（§2.2） |
| `projectRoots` | 返回键零命中；既有返回面（`hits` ∥ `lineRefs` ∥ `lineReads` ∥ `batchFaceRefs` …）不撞名 | 本档命名 | 报面根清单行 ∥ §7 用例断言（仅此两处） |
| 多根标签 `[<项目名>]` | `none found`——报面没有逐行项目标签的先例；相邻先例 = 工具面的 `候选：A ∥ B` 行 | 取它的分隔符，不取它的位置 | §2.3 报面 §6 AC-6 |
| `ERROR（无法定根 N 档）` | 先例在盘：`thincoder-core/doc-check/index.mjs` 的 `verdict()` 「读不到 N 档」一支 | **对齐**——同句形同位置（首行） | §2.4 ∥ §6 AC-3 |
| `domainTables` | 返回键零命中——`grep` 于 `thincoder-core/**` 零命中；既有返回面（`projectRoots` ∥ `hits` ∥ `lineRefs` ∥ `lineReads` ∥ `batchFaceRefs` …）不撞名 | 本档命名（§2.5 的读数口径：每组一根、按路径升序） | 报面域表读数块 ∥ §6 AC-10 ∥ §7 用例 7-11 |
| `NAME_CH` ∥ `EXT_PART` ∥ `isExtension` ∥ `isDocToken` | `none found: thincoder-core/**`（四个新名零命中；相邻既有件 = 扩展名定义与两条抽取式，本批改值不改位） | 本档命名 | 四条抽取式 ∥ 四处豁免调用点 ∥ 引擎的清单透传（§2.6） |
| `DEFAULT_DOC_EXTS` | `existing: thincoder-core/doc-check/anchors.mjs`（同位置、同消费面；改前那份扩展名枚举本批改名并改值） | **改名**，不新造 | 清单装配处（§2.6）∥ 四条抽取式 ∥ 豁免谓词的词干判定 |
| `index.docCheckExemptions` | 先例在盘：`index.excludePaths`（同族） | **对齐**——键名自带消费面 | 装配处分类（§2.7） |
| `index.docCheckExts` | 先例在盘：`index.codeExtensions` ∥ `index.docExtensions`（同族 · 同 `index` 子键 · 同并集不替换语义） | **对齐**——键名自带消费面，语义照抄同族 | 引擎的清单透传（§2.6）∥ `report` 面读数行 |
| `exempted`（读数 ∥ 桶） | 同层既有名 = `unverified` ∥ `unreadable` | 本档命名 | 两面豁免块 ∥ AC-X1 |
| 桶标签 `豁免 N 条（已裁定假阳，不阻断交付）：` | `bucketLines` 的「跳过 N 档…」 | **对齐** | 两面（§2.7） |

- **判据本体复用**：`owningProject` 就是取根判据本体，直接复用。
- **兜底臂不复用**：`?? batchProjectRoot(base)` 把「找不到归属」直接落成会话根，本批不照抄。
- **不许顶上来的是「猜的根」**：cwd ∥ 某个祖先项目 ∥ 清单首项的根，这三种都不是调用方给的。
- **声明根不是猜的根**：它是调用方给出的坐标系，用它 = 执行那条声明。
- **为什么两者分得开**：猜的根与声明根不同源，出事时没有任何一行能指出「这个根是谁给的」；所以本批只认声明根。

**勘察记录（公共源档）**：

- **外仓参考系声明**：`PROJECT-MANIFEST.json` 的 `index.publicRepos` 是本仓出边表（域表第三项 ∥ 环检边集），取值以该档为准、本档不复述。
- **仓内已查三处**：`docs/core/design/PATH-RESOLUTION.md` §2.1（统一解析层四态 ∥ `referrer` 参数）· `docs/core/design/DOC-DISCIPLINE.md` §3.20（判据口径单源）· `test/RTM.md` 故事索引表。
- **仓内结果**：相关 2 处——前者给出「解析判不出唯一即停」，后者给出报面句形；无一处给出「按档定根」的做法 ⇒ 本批新建，取根复用 `owningProject`。
- **`referrer` 不改用**：它取**所指目录**当基根，本批要的是**项目根**（token 按项目根相对写），不是同一个量。
- **独立参考系**（本机 `D:\ref\` 下五仓：kimi-code ∥ MiMo-Code ∥ opencode ∥ oh-my-pi ∥ openclaw）已逐仓查：检索面 = `doc-check` ∥ `文档检查` ∥ `owningProject` ∥ `per-file root` ∥ `multi-project` 五串。
- **独立参考系结论：无一相关**。命中分三类——Gradle LSP 根探测（opencode ∥ MiMo-Code 的 `lsp/server.ts`）· Vitest 分片与 JSON 报告（openclaw 测试面）· 一处「5-minute doc check」是调试技能的口头清单。无一仓实现「按档定根」的文档检查 ⇒ 无跨仓先例可对齐。

| # | 决策 | 弃案 | 理由 |
|---|---|---|---|
| KD-1 | 根按档求，`owningProject` 加盘根界 | 必传 `target` 让人挑根 | 跨项目清单是常态（工作区锚），每批都要人挑就是把机制债摊给调用方 |
| KD-2 | 分组调既有 `checkAnchors` | 把根做成判法内部逐 token 参数 | 根留在判法之外，分组只换喂进去的那一个参数；等价性可直接用单组夹具对照 |
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
| AC-5 | 分组不改变判定结果：同一批夹具（含跨项目清单）上，引擎整次调用的 `hits` 三桶（锚 ∥ 段长 ∥ 行号坐标）与**逐档直调判法本体**的合并值逐项相等——逐档值 = `checkAnchors(rootOf(该档), { files: [该档] })` 的锚数 + `checkParagraphs` 的段数 + `collectLineRefs` 的正文面数。它判的是判定结果，不是文件动没动：分组只换喂进去的根 | AC-15 ⑥ |
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

- **不改既有判据正文与阈值**：段长 ∥ 行号坐标两条判据、引文判法、三条判据的阈值均未动。**锚面本批动的是抽取面**：名字字符类 ∥ 扩展名式 ∥ 清单谓词（§2.6），四条抽取式（含行号面 `NAME_RE`）同源换一次；解析序 ∥ 命中类 ∥ verdict 串 ∥ 豁免谓词的判定逻辑零改。
- **仓外路径族 = 真悬空，照报**：清单把「认错了东西」那一族（代码表达式 ∥ 版本区间 ∥ 归档名）挡住之后，散文里指向**仓外产物**的路径仍会判 `档缺`——那是**真阳**（认对了、盘上没有），不是误报（§2.6）。
- **文档侧的两条合法写法（既有，不新增机制）**：① **写进围栏块**——围栏是逐字证据，锚 ∥ 引文 ∥ 行号 ∥ 段长四类判据整块跳过；② **写成目录形**（`build/`，不带后缀）——后缀不在清单，不成候选。两条都不是豁免：换的是写法，不是判据。
- **不替现盘文档改字**：本批交付的是能力；现盘那批真悬空按清账处置——台账登记（哪些族 ∥ 怎么清），另轮清。
- **不放松错判**：没有声明根就是 `ERROR`，不跳过该档、不出半份判定。
- **不做全仓扫描**：清单仍是唯一范围来源；按档定根不等于按目录找档。
- **不按项目分 verdict**：一次调用一个答案。
- **不合并各组扫描根**：每组只吃自己那根的域表（§2.5 KD-9）；域表为空集时向严判，不向宽判。
- **四态的判据不归本档**：`thincoder-core/path-resolve.mjs` 的四态（`ambiguous` 与第四态 `unverified`）归 `docs/core/design/PATH-RESOLUTION.md`；本档只规定工具面**何时拒**（`target` 缺 ∥ `null` ∥ 空串 ⇒ 拒；非空 `target` 解析为多项目工作区 ⇒ 另拒）。
- **`gate` 面只增列报与环引行**：域表读数不进 verdict、不改首行；`gate` 面增的是 `未核 N 条` 列报（不入 `hits`）与环引命中行。
- **需求档本批不再改（判域面）**：`docs/core/requirements/DOC-CHECK.md` 已含 F17 ∥ AC-15。
- **豁免只能逐条具名**：目录 ∥ 路径前缀 ∥ 通配不进**豁免面**的登记（§2.7）；判集的收窄由排除面管（`index.docCheckExcludePaths`，本批不改）。

### 登记项（同病但本批只登记、不越界改）

1. **收口门的兜底臂**：`thincoder-core/agent-tools/batch-gate.mjs` 已按档定根（`owningProject(selfAbs, base)`），但 `?? batchProjectRoot(base)` 在无主时落会话根——与 KD-4 同形，却少一道「这份根是谁给的」的区分。复现路径：锚为工作区、`selfAbs` 属另一个项目 ⇒ 兜底根与档的根不同，报面路径随之相对错根显示。本批不改。
2. **写前门的根入参**：`thincoder-core/tools/doc-write-gate.mjs` 把 `projectRoot` 传进 `runDocCheck`，片档落在目标档同目录。该根是不是目标档的所属项目根，本席未取证；若同病，本批登记、另轮处置。

## 9. 集成测试设计（RTM 增量）

读 `test/RTM.md` 故事索引表与分册结构后按增量作答：

**计数一行（下面逐条说的就是这四项）**：改写 = **0** ∥ 冗余 = **0** ∥ 缺 = **1**（已落为 `test/rtm/guard.md` 的 `36-3`，盘上已有）∥ 本批新增 = **2 行**（`44-1` ∥ `45-1`，配故事 `CLI 44` ∥ `CLI 45`）。

**`CLI 43` 不归本批**：`docs/core/design/DOC-GRAPH.md` §9 已把 `CLI 43` 定为「文档锚点图」的故事（该设计先于本批定号、现在盘等评审）⇒ 本批从 `CLI 44` 续。

- **改写的断言 = 0**：`test/rtm/paths.md` 的 29-2 行**盘上已是新口径**（该行现文：「文档门面拒 + 报文点名 `target`（`target` 必填后不再走歧义支——首行不是 `DOC-CHECK GATE: ERROR（多项目工作区：请指名 target）`）」）⇒ 无行可改，`test/rtm/paths.md` 因而不进 §4 的受影响文件表。
- **冗余行 = 0**。
- **本批（识别面）增量 = 1 行，号 = `44-1`**（族 = `guard`，住 `test/rtm/guard.md`；故事号 `CLI 44`）。四件：
  - **交互** = 文本 → 抽取面（名字字符类 ∥ 扩展名式）→ 清单谓词（裸名与路径形同一把尺）→ 解析序 → 命中数。
  - **业务可观察结果** = 中文档名解不到判红；普通中文词零命中；`.py` 一类扩展名判红；`1.5` 一类零候选；`JSON.parse` 一类代码表达式零候选（后缀在禁入族）；`20.x/22.x` ∥ `build/app.tar.gz` 零候选（路径形同样查清单）。
  - **业务入口** = 用户收口时读 `doc_check({mode:"gate", docs, target})` 的首行与命中区。
  - **回指业务需求** = `docs/core/requirements/DOC-CHECK.md` F18 ∥ F19 ∥ 本档 §2.6 ∥ AC-R1–AC-R3。
- **本批（豁免面）增量 = 1 行，号 = `45-1`**（同族同档；故事号 `CLI 45`）。四件：
  - **交互** = manifest 的 `index.docCheckExemptions` → 装配处分类 → `hits` 与 `exempted` 两桶 → 首行判决词。
  - **业务可观察结果** = 登记后首行 `PASS` 且逐条列出；撤销后回 `REFUSED`；排除面与豁免面对同一档同时作用时排除优先。
  - **业务入口** = 同上一个入口（与 `44-1` 同一次调用面）。
  - **回指业务需求** = 同档 F20 ∥ F21 ∥ 本档 §2.7 ∥ AC-X1–AC-X4。
- 用例档落 `test/integration/` 目录下（`test/**` 不属本席笔域，文件名与落地归实施轮）。
- **新桶会不会撞既有行**：不撞。`36-4` 断的是四条空范围入口照出 `范围为空：…` 说明行——四条都不涉排除面，新句只在排除分支出；`36-1` ∥ `36-2` ∥ `36-3` 断首行 ∥ 标签 ∥ 命中归属，而排除桶 N=0 时不出行。
- **缺的行 = 1 → 已落为 `36-3`**：故事 36（跨项目文档清单的交付门按各档自身项目根判）下的「域表按档根」行 = `test/rtm/guard.md` 的 `36-3`（B 档同基底互引豁免 ∥ A 档同 token 照判 `档缺`）；业务入口与 `36-1` 同一个入口（会话锚 = 工作区，下辖两个项目、自身无 manifest）；回指本档 **§2.5** ∥ **AC-9**。
- **AC-8 的干净轮由既有 `36-1` 覆盖**——本批不重复加行。
- **AC-11 不另立集成行**：它与 AC-8 是同一条交互（工具面 ⟷ 引擎 ⟷ 定根）、同一夹具，差别只在入参形；缺参面由 `test/rtm/paths.md` 的 `29-2` 那一笔断（拒 + 报文点名 `target`）。
- **36-5 保留，只改节注的指路**：它的三读全钉在「排除面命中 ⇒ 不入判」上，而那行为本批**未改**（§2.7 首表）⇒ 该行照旧成立。要改的是节注里「判据 = … §2.6（排除目录：判集过滤 ∥ 全排除 = 免检放行）」那一笔——排除面的判据已移到 **§2.7**，留在 §2.6 就指错地方。
- **新增两行、两个故事**：`test/rtm/guard.md` 的 `44-1`（识别面）∥ `45-1`（豁免面）；故事索引表加 `CLI 44` ∥ `CLI 45`。`CLI 40` ∥ `CLI 41` 已被 `ends` ∥ `tooling` 占（用例行 `40-1` ∥ `41-1` 也在盘）；`CLI 43` 归 `docs/core/design/DOC-GRAPH.md` §9 ⇒ 本批新号从 `CLI 42` 之后第一个空号 `CLI 44` 起。
- **`36-4` 不受影响**：四条空范围入口的清单本身不成立，与被裁定的假阳不是一件事。

域表按档根行的**交互** = 引擎分组 → 域表按组根读 → 面判豁免；**业务可观察结果** = 该档零 `档缺` 命中。文件落 `test/integration/**`，与用例代码同目录；`test/**` 不属本席笔域，落地归实施轮。
