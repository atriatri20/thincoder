# 2026-11-07 · anchor-stock-clear
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-07 · 来源 = 用户 2026-11-07 12:20「讲真，存量你当时不改，后面扫全档还是会撞上」；现场 = 同一天五批撞墙（`#16` 622 条 ∥ `#19` 568 条 ∥ `#34` 61 条 ∥ 工具面批收口在即被 ~592 条拒）。
> 台账 = #2131（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-07
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

### 需求：把「存量锚债」清掉，而不是绕开

- **已定决定**：本批做**清存量**，不是继续按批收窄射程把它推给下一批。 · 用户原话：「讲真，存量你当时不改，后面扫全档还是会撞上。」 · 时间：2026-11-07 12:20

### 为什么（这是本批的立法理由，也是我上午判错的地方）

**机制事实**：写门判「改动区」（`#2121` 那批在治），但**收口门判「本批笔域集」的整档**——那是 fail-closed 的兜底，不能放宽。

**⇒ 只要批量里碰过一份带存量的档，这批就收不了口。**

**今天的五次撞墙，全是这一条**：

| 撞 | 存量 |
|---|---|
| `#16` 写不进自己的 `§5` | 622 条（6 份设计档） |
| `#19` 写不进自己的 `§5` | 568 条（11 份档） |
| `#34` 写不进自己的 `§2` | 61 条（`TESTING.md`） |
| 工具面批收口在即 | ~592 条（同 6 份） |
| 我为此收窄了三档射程 | 45 条（转出，**没还**） |

**我上午的处置是「收窄射程把这三档移出去」——那是把它推给下一批。你说得对：下一批碰这三档，照样撞。**

### 当刻读数（**开批基准 = 2026-11-07 12:20 父侧实量，`checkAnchors` 三桶分流；此后其它批清掉 7 处，当刻值见 `§2.10`**）

| 档 | 真死指针 | 裸名缺路径 |
|---|---|---|
| `docs/core/design/TOOLS.md` | 48 | 255 |
| `docs/core/design/TESTING.md` | 39 | 22 |
| `docs/core/design/CORE-UNIFICATION.md` | 18 | 153 |
| `docs/core/design/ENGINEERING-MODE-V2.md` | 18 | 60 |
| `docs/core/design/MEMORY.md` | 9 | 107 |
| `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | 0 | 91 |
| `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 2 | 74 |
| `docs/core/design/LEDGER.md` | 4 | 66 |
| `docs/core/design/BATCH-RECORD.md` | 0 | 33 |
| `docs/core/design/ADVISOR-GUARDS.md` | 2 | 17 |
| `docs/core/design/DOC-DISCIPLINE.md` | 0 | 0 |
| `docs/core/design/PROMPT-SYSTEM.md` | 0 | 0 |
| **合计** | **140** | **878** |
| **另计** | — | — |

**`引缺` 现计 0 处**——`#40` 那轮读得 2 处（`docs/core/design/DOC-DISCIPLINE.md` §3.23 两条依据行），**后由另一批改掉引文，处置对象消失**（本轮实测该档 `引缺` = 0）。本表原只列 `档缺` 两桶、漏了这一列，是 `#40` 发现的。**三桶合计 1018 处 = 真死 140 + 裸名 878 + 引缺 0。**`引缺` 同计 `gate` 命中 ⇒ **这一列必须保持为零，否则验收 3 不过**。

**全仓面**：真死指针 592 处 / 93 档；裸名缺目录段 5339 处。

### 两个桶，两种处置法（不能混）

- **裸名缺目录段（878）**：`sameName` 非空 ⇒ 目标档在盘、只是没写目录段。**处置 = 补仓根全路径**。
  - **同名候选唯一 ⇒ 机械补**（这部分可以批量做）。
  - **同名候选多个 ∥ 候选为零 ⇒ 逐处判**（判「它现在该指谁」= 语义，不许机械套）。
- **真死指针（140）**：`sameName` 空 ⇒ 目标不在盘。按 `#2109` 已定的**三形**处置：能指到现役对位物的改指 ∥ 指不到对位物的删坐标句留判据句 ∥ 坐标句夹必须保留事实的留事实去退役名。

### 验收

1. **这 12 档的真死指针 = 0**（`checkAnchors` 三桶分流，父侧复量）。
2. **这 12 档的裸名缺目录段 = 0**（同上）。
3. **12 档的 `doc_check` `gate` 首行 = `PASS`**——**这是本批存在的目的**：让碰过它们的批次能收口。
4. **零语义变更**：只做五类操作——① 补仓根全路径 ∥ ② 改指 ∥ ③ 删坐标半句 ∥ ④ 结构性移除并留搬运账 ∥ ⑤ 改叙为不构成指针的形（泛指 / 举例的 token 搬进围栏块 ∥ 换闭集占位词干 ∥ 散文改写）；**不动判据句的业务断言**。判法见 `§2.6.1`（逐处表全表 = 处置登记集，不按类别收窄）。

### 边界（不做）

- **不删任何判据句**（删的是「它在哪实现」那半句，不是判据）。
- **不动 `thincoder-core/doc-check/**` 的判据本体**（工具不为自己仓库的存量放宽判据）。
- **不全仓一次清完**：先清这 12 档（它们挡着在途批次收口）；全仓 5339 处另排。
- **不裁减 RTM 用例**（归 `#2113`）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（逐处分类 12 档 / 1018 处已落盘（序 3–1017）；当刻读数与对账见 §2.10 ∥ 结构性处置见 §2.11 ∥ 集成测试 delta 见 §2.12 ∥ 上抛项见 §2.13）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### §2.0 定向：先例 · 勘察证据

**最接近先例**：`docs/core/design/ANCHOR-DEBT-REPAIR.md`——「锚债」这一主题的当刻真相所在（族判据 ∥ 修法枚举 ∥ 归属轮 ∥ 验收）。本批**对齐它的修法枚举，偏离它的分族口径与落表位置**：

- **对齐**：修法仍是那套枚举（改指真实落点 ∥ 去路径段 ∥ 删 / 改述去锚 ∥ 占位归一）；本批 §2.2 的 R1–R4 是它在逐处表里的逐处形。**「加锚」同样否决**——本批不新造指称。
- **偏离一（分族口径）**：该档按**引擎报什么**分族（缺前缀 ∥ 多落点 ∥ 零落点）；本批按**句子在说谁**分角色（§2.2 · D1）。理由：引擎只回答「补了会不会指对」，不回答「这里该不该指」——`sameName` 非空者里混着大量泛指与举例，按引擎分会把「每个包都有一份」改写成某一份具体档。
- **偏离二（落表位置）**：该档的逐族处置表住设计档（族是长效判据）；本批的逐处表住本记录（§2.8 · D2）。理由：1018 处是逐条坐标、一轮有效；进设计档会与下一轮冲突，而设计档只留当前真相。
- **不重叠**：该档的验收判的是它自己那一批的清单差集；本批的验收是 §2.6 四条，两者不互引、不改写。

**勘察证据**（本轮实读，逐条记「查了什么 → 读到什么」）：

| 查了什么 | 读到了什么 | 结论 |
|---|---|---|
| `docs/core/design/ANCHOR-DEBT-REPAIR.md` | 锚债的族判据 ∥ 修法枚举 ∥ 到期码 ∥ 用例 U1–U11 | 相关（先例，见上） |
| `test/RTM.md` | 5 个端节 ∥ 35 个故事节 ∥ 133 行用例 | 相关（本批改的 12 档是 `doc_check` 门的判据输入，门读数即集成行的断言对象）——delta 见 §2.12 |
| `thincoder-core/doc-check/anchors.mjs` | `checkAnchors(root, {files})` 导出面 ∥ 豁免两表（类名 ∥ 占位词干）∥ 围栏整块跳过 ∥ 可执行行只跳码段区间 | 相关（量法与格内形的判据本体）——§2.5 ∥ 逐处表 A |
| `PROJECT-MANIFEST.json` | `docRoot.design` 六目录（12 档全在 `docs/core/design`）；`index.publicRepos` 为空 | 相关（12 档同域 ⇒ 无档跨 tier；无外部声明源可查） |
| `docs/core/design/DOC-DISCIPLINE.md` | 锚判据句与豁免表语义的单源 | 相关（判据面不在本批射程，零改） |

### §2.1 本批条目（覆盖 §1 的四条验收）

| 条目 | 覆盖 | 交付物 | 验收锚 |
|---|---|---|---|
| B1 全量逐处分类 | §1 验收 1、2（两桶清零的**前提**） | 12 档 1018 处，每处「角色 → 处置 → 理由一句」 | §2.4 逐档表，处数逐档合计 = §2.4 顺序表的处数 |
| B2 按处置落地修复 | §1 验收 1、2 | 12 档改后 `checkAnchors` 两桶 = 0 | 复跑 §2.5 量法，两桶读数均 0 |
| B3 交付门通过 | §1 验收 3（**本批存在的理由**） | 12 档 `doc_check` `gate` 首行 `PASS` | `doc_check(mode:"gate")`，12 档全列 |
| B4 零语义变更 | §1 验收 4 | 只做 §2.6.1 的五类允许操作，判据句的业务断言照留 | 判据句快照比对的差集 ⊆ 处置登记集（= 逐处表全表；判法见 §2.6.1） |

**B1 是 B2 的前提，不是它的记账**：每一处先有角色判定，才有处置；处置不许在无角色判定的处上就近套用。

### §2.2 分流判据：按语义角色，不按可解析性

`sameName` 只回答「补了会不会指对」，**不回答「这里该不该指」**。因此可解析性不作分流依据——**每一处判它在这一句里扮演什么**。

| 角色 | 判法（这一句在说谁） | 处置 | 可复跑判据 |
|---|---|---|---|
| **R1 具体档指称** | 句子说的是「这一份档」 | 补仓根全路径（唯一一处确定目标）；补后仍 `档缺` ⇒ 转 R4 | 补后 `checkAnchors` 该处消失 |
| **R2 泛指 ∥ 举例** | 描述的是一整类（`package.json` 之于「每个包」、`*.test.mjs` 之于命名模式、`x.mjs` 之于示例） | **改叙成不构成指针的形**：写进围栏块，或写成闭集占位词干形。**不补路径**——补成某一份具体档 = 凭空造指称 = 改语义 | 围栏块整块跳过 ⇒ 该处不再入判 |
| **R3 引文 ∥ 外部件名** | 是被引外部文本里的名字，或仓外件名（`Node.js` 这类运行时名） | **豁免、不动**（`#2128` 在办）；本批只在「不动就会挡交付门」时按 R2 改叙，并逐处记明 | 逐处「处置」列写明「R3 不动」或「R3 因门改叙」 |
| **R4 退役件** | 目标已不在盘，且句子在说「它在哪实现」 | 三形（§2.3） | 处置后该处消失，且判据句仍在档 |

**R2 的三种落法（整表入围栏块 ∥ 格内改叙 + 表下围栏块 ∥ 散文改写）单源记在逐处表 A 的定型句里**——本节只定角色，落法分形不在本节重述。

**R2 的反例写在这里，防止实施席顺着引擎语言想回「补路径」**：`docs/core/design/TESTING.md` 里「每个包都有 `package.json`」一句，补成 `thincoder-cli/package.json` 造出的是一个具体指称；原意是「所有包」。**那不是补路径，是改语义**，而且造出「看着最精确、实际最错」的句子。

**「候选唯一 ⇒ 机械补」这条口径已撤回**：它把「引擎怎么报」当成了「人想说什么」。本批**没有批量规则**，只有逐处判定。

### §2.3 退役件（R4）三形

判据单源 = `#2109` 已定：

1. **改指**：存在现役对位物 ⇒ 改成现役物的仓根全路径。
2. **删坐标句留判据句**：无对位物 ⇒ 删「它在哪实现」那半句；**判据本身照留**。
3. **留事实去退役名**：坐标句里夹着必须保留的事实 ⇒ 留事实、去掉退役名。

**三形都不许删判据句**——删的是坐标半句，不是判据。一处若判不出该用哪一形，进 §2.13 上抛，**不许就近挑一形**。

### §2.4 全量逐处分类：产出顺序与处数

**顺序按档的处数升序**（小档先落地，表形先定住，再进大档）。本表两桶列 = 建表读数（建表轮 `checkAnchors` 复跑，与 §1 读数表逐档同值）；**当刻读数与 7 处差额见 §2.10**。

| 序 | 档（仓根全路径） | 真死 | 裸名 | 引缺 | 处数 | 分类表 |
|---|---|---|---|---|---|---|
| 1 | `docs/core/design/DOC-DISCIPLINE.md` | 0 | 0 | 0 | 0 | 零处（无逐处表行；纳入判定集与复量） |
| 2 | `docs/core/design/PROMPT-SYSTEM.md` | 0 | 0 | 0 | 0 | 零处（无逐处表行） |
| 3 | `docs/core/design/ADVISOR-GUARDS.md` | 2 | 17 | 0 | 19 | 已落：序 3–21 |
| 4 | `docs/core/design/BATCH-RECORD.md` | 0 | 33 | 0 | 33 | 已落：序 22–54 |
| 5 | `docs/core/design/TESTING.md` | 39 | 22 | 0 | 61 | 已落：序 55–112 |
| 6 | `docs/core/design/LEDGER.md` | 4 | 66 | 0 | 70 | 已落：序 113–182 |
| 7 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 2 | 74 | 0 | 76 | 已落：序 183–258 |
| 8 | `docs/core/design/ENGINEERING-MODE-V2.md` | 18 | 60 | 0 | 78 | 已落：序 259–336 |
| 9 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | 0 | 91 | 0 | 91 | 已落：序 337–427 |
| 10 | `docs/core/design/MEMORY.md` | 9 | 107 | 0 | 116 | 已落：序 428–543 |
| 11 | `docs/core/design/CORE-UNIFICATION.md` | 18 | 153 | 0 | 171 | 已落：序 544–714 |
| 12 | `docs/core/design/TOOLS.md` | 48 | 255 | 0 | 303 | 已落：序 715–1017 |
| | **合计** | **140** | **878** | **0** | **1018** | |

**逐处表在哪**：三段连续，用字母号、不占主序号——序 1–5 → 逐处表 A ∥ 序 6–7 → 逐处表 B ∥ 序 8–12 → 逐处表 C。三节排在 §2.9 之后、§2.10 之前（表体量大，塞进 §2.4 与 §2.5 之间会把主序截断）；字母号让 §2.0–§2.13 一路单调，读者照这一行过去即可。

**表形（每档一节，整节写在围栏块内——被列出的 token 本身是悬空指针，落在围栏块外会在本批 §2 里造出新的 `档缺`）**：

```text
序 | 位置 | token | 出现处数 | 角色 | 处置 | 理由一句
```

「位置」列写**节号**（`§N.M`），不写行号——行号不是引用，插一行就全体移位。同一 token 在同一节的 N 处同判时合并一行记「处数 N」；**同一 token 在不同句子里角色不同时分行**，不许合并。

**称数用词**：「N 行」一律指**表行**（逐处表的一行）；源档自身的行数写作「源档 N 行」，不用一个字顶两个意思。

### §2.5 量法（可复跑 · 一处定义）

**工作目录固定 = 仓根 `D:\teamcode\thincoder`**；桶公式 = `sameName` 空 ⇒ 真死 ∥ 非空 ⇒ 裸名（`引缺` ∥ `节缺` 各自单列）。一次调用一次读数，12 档全列；**父侧复量打同一条命令，数不同先对齐再动手**。

```text
cd D:\teamcode\thincoder
node --input-type=module -e "import path from 'node:path';import {checkAnchors} from './thincoder-core/doc-check/anchors.mjs';const S=['docs/core/design/TOOLS.md','docs/core/design/TESTING.md','docs/core/design/CORE-UNIFICATION.md','docs/core/design/ENGINEERING-MODE-V2.md','docs/core/design/MEMORY.md','docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md','docs/core/design/AGENT-LOOP-SUBAGENT.md','docs/core/design/LEDGER.md','docs/core/design/BATCH-RECORD.md','docs/core/design/ADVISOR-GUARDS.md','docs/core/design/DOC-DISCIPLINE.md','docs/core/design/PROMPT-SYSTEM.md'];const Z=()=>Object.fromEntries(['dead','bare','cite','sec'].map(n=>[n,0]));const root=process.cwd();const r=checkAnchors(root,{files:S.map(d=>path.resolve(root,d))});const t={};for(const d of S)t[d]=Z();for(const h of r.hits){const k=h.file.split(path.sep).join('/').replace(root.split(path.sep).join('/')+'/','');t[k]=t[k]||Z();if(h.clazz==='档缺'){if(h.sameName&&h.sameName.length)t[k].bare++;else t[k].dead++;}else if(h.clazz==='引缺')t[k].cite++;else t[k].sec++;}console.log(JSON.stringify(t))"
```

该命令本轮实跑通过；读数见 §2.10。

### §2.6 验收对照（逐条回指 §1）

| §1 验收 | 本批条目 | 机检 | 通过条件 |
|---|---|---|---|
| 1 真死 = 0 | B2 | §2.5 量法，`sameName` 空桶 | 12 档合计 0 |
| 2 裸名 = 0 | B2 | §2.5 量法，`sameName` 非空桶 | 12 档合计 0 |
| 3 `gate` = `PASS` | B3 | `doc_check(mode:"gate", docs=[12 档])` | 首行 `DOC-CHECK GATE: PASS` |
| 4 判据句零变 | B4 | §2.6.1 的判据句快照比对 | 差集 ⊆ 处置登记集（逐处表全表） |

**验收 3 是「本批存在的理由」**：只清两桶而不过门，碰过这些档的批次照样收不了口。**`gate` 判的是整档，不是改动区**——验收 1、2 清零不等于验收 3 通过（`引缺`、段落长、行号坐标各自独立成条）。

#### §2.6.1 零语义变更的判法（允许操作五类 + 判据句快照比对）

**允许操作 = 五类**：①–④ 与 `§1` 验收 4 同一枚举；⑤ 是本批逐处表里 R2 那一类的落法，`§1` 的枚举尚无此形（待同步，见 §2.13 · U6）。每类的文本效果与对判据句的影响：

| # | 操作 | 文本效果 | 对判据句 |
|---|---|---|---|
| ① | 补仓根全路径 | 在一处 token 前插入目录段 | 不动 |
| ② | 改指 | 把一个 token 换成另一个 token（含仓根形改写） | 不动 |
| ③ | 删坐标半句 | 删「它在哪实现」那半句及其并列分隔符 | 照留 |
| ④ | 结构性移除并留搬运账 | 整行 / 整节移出，仅限 §2.11 两步法点名的纯坐标行 | 搬到单源处，不新增第二份 |
| ⑤ | 改叙为不构成指针的形 | 泛指 / 举例的 token 搬进围栏块 ∥ 换成闭集占位词干 ∥ 散文改写 | 不动（句子说的仍是同一件事，只是不再长得像路径） |

①–③ 在原位改 token，④ 动行 / 节的存废，⑤ 只改措辞的形。`§1` 验收 4 的枚举是 ①–④；⑤ 是逐处表里占大头的一类（R2 泛指 / 举例），对判据句同样零改——**两边措辞同步不在本席的笔域，见 §2.13 · U6**。

**判法 = 判据句快照比对**，三步、逐档跑：

```text
① 快照：开工前一次（基准 = 实施轮开工时的 HEAD）
② 复跑：改完后同一条命令、同一取句法
③ 判红：某档快照里有某条既不在复跑里、也不由逐处表任一行接住（对法 = 「位置」列的节号 + 句首 + token 三样对得上）
```

**处置登记集 = 逐处表全表，不是「只登 ④ 类」**：①–⑤ 每一类都在改行文本（插目录段 ∥ 换 token ∥ 删半句 ∥ 移行 ∥ 改措辞），改完之后那一行与快照逐字不同，层 1 的「复跑里还有没有这一条」对它一律答「没有」。所以登记面只能是逐处表全表；收窄到 ④ 类，其余四类每一处都会判红，而它们是 1018 处里的绝大多数——假阳性一起来，层 1 就没人看了。

**取句法**：逐行取「含闭集关键词之一」的行。关键词闭集 = `判据` ∥ `必须` ∥ `不得` ∥ `不许` ∥ `禁止` ∥ `一律` ∥ `只有` ∥ `仅当` ∥ `验收` ∥ `断言` ∥ `义务` ∥ `零`。命令见 §2.6.2。

**这条判法的边写在前面**：关键词闭集是**代理指标**，盖不住无关键词的判据句。故 B4 取三层，缺一不算过：

1. **快照比对**（机判）——防大面删句；
2. **`git diff -U0` 的删除行逐行对到逐处表**（机判）——防漏登记；
3. **评审核读**（人判）——防关键词之外的改写。

**为什么不再用「人工评审核验」单独判**：1018 处靠人眼过一遍，等于没判；快照把注意力缩到差集上，人就只看真变了的地方。

#### §2.6.2 取句命令（可直接粘）

```text
cd D:\teamcode\thincoder
node --input-type=module -e "import fs from 'node:fs';const KW=/判据|必须|不得|不许|禁止|一律|只有|仅当|验收|断言|义务|零/;const S=['docs/core/design/TOOLS.md','docs/core/design/TESTING.md','docs/core/design/CORE-UNIFICATION.md','docs/core/design/ENGINEERING-MODE-V2.md','docs/core/design/MEMORY.md','docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md','docs/core/design/AGENT-LOOP-SUBAGENT.md','docs/core/design/LEDGER.md','docs/core/design/BATCH-RECORD.md','docs/core/design/ADVISOR-GUARDS.md','docs/core/design/DOC-DISCIPLINE.md','docs/core/design/PROMPT-SYSTEM.md'];const out={};for(const d of S){out[d]=fs.readFileSync(d,'utf8').split('\n').filter(l=>KW.test(l)).map(l=>l.trim())}console.log(JSON.stringify(out))"
```

该命令本轮实跑通过（两档试跑：`docs/core/design/TOOLS.md` 源档 498 行 ∥ `docs/core/design/TESTING.md` 源档 371 行——只作「命令能跑」的读数，不作判据）。**快照落工作树外临时域，不入仓**（与脚本不落仓同一条纪律）。

### §2.7 受影响文件表（12 档，逐档）

| 档（仓根全路径） | 真死 | 裸名 | 引缺 | 分档 |
|---|---|---|---|---|
| `docs/core/design/TOOLS.md` | 48 | 255 | 0 | 纯文档面（档位判豁免） |
| `docs/core/design/TESTING.md` | 39 | 22 | 0 | 同上 |
| `docs/core/design/CORE-UNIFICATION.md` | 18 | 153 | 0 | 同上 |
| `docs/core/design/ENGINEERING-MODE-V2.md` | 18 | 60 | 0 | 同上 |
| `docs/core/design/MEMORY.md` | 9 | 107 | 0 | 同上 |
| `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | 0 | 91 | 0 | 同上 |
| `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 2 | 74 | 0 | 同上 |
| `docs/core/design/LEDGER.md` | 4 | 66 | 0 | 同上 |
| `docs/core/design/BATCH-RECORD.md` | 0 | 33 | 0 | 同上 |
| `docs/core/design/ADVISOR-GUARDS.md` | 2 | 17 | 0 | 同上 |
| `docs/core/design/DOC-DISCIPLINE.md` | 0 | 0 | 0 | 零改动（纳入判定集与复量） |
| `docs/core/design/PROMPT-SYSTEM.md` | 0 | 0 | 0 | 零改动（纳入判定集与复量） |

**分档结论一行**：12 档全为 `.md`，纯文档 ⇒ 档位判豁免；同在 `docs/core/design` 一个设计域内——**无档跨 tier，无拆分计划**。**本批不新增档**（逐处表落本记录，不落设计档）。

**D7 引用扫描读数（本轮回读）**：全仓扫「档名与 `§7` 同行、相距 ≤40 字符」的引用，指向设计档 `docs/core/design/ENGINEERING-MODE-V2.md` 的 = **0 份**；别处命中的 `§7` 全部指向需求档 `docs/core/requirements/ENGINEERING-MODE-V2.md`，与本次改动对象无关。⇒ 删节不会把改动带出这 12 档；若真出现，按 §2.8 · D8 只登记、不越域。

### §2.8 关键决策记录

**D1 分流按语义角色、不按可解析性（撤回「候选唯一 ⇒ 机械补」）**
- 撤销理由：`sameName` 只回答「补了会不会指对」，不回答「这里该不该指」；判断依据是句子在说什么，不是引擎报什么。
- 代价：1018 处逐处判，无批量捷径；换来的是不把「每个包都有 `package.json`」改写成某一份具体档。
- 被否方案：按 `sameName` 候选数分流（候选 1 ⇒ 机械补）——已由用户裁定撤回，理由是它把引擎语言当成了人想说的话。

**D2 逐处表落在批档而不落设计档**
- 理由：逐处处置是本轮过程，一轮有效；写进设计档会与下一轮冲突（设计档只留当前真相）。
- 被否方案：每档附「锚债台账」节——设计档不带历史与进度表。

**D3 「位置」列写节号不写行号**
- 理由：行号插一行即全体移位，且 `doc_check` 行号坐标本身是交付门命中项。
- 被否方案：行号定位——实施席读得准，但本记录在档后会立刻漂。

**D4 分类表写在围栏块内**
- 理由：表里被列出的 token 本身就是悬空指针；落围栏块外会在本批 §2 造出新的 `档缺`，本批自己先撞墙。
- 被否方案：散写表格式——`doc_check` 对围栏块整块跳过，对表格单元格照判。

**D5 `引缺` 同计 `gate` 命中**
- 内容：验收 3 判整档 `gate`，`引缺` 与 `档缺` 同计命中；本批 12 档 `引缺` 现读 = 0（§2.10）。
- 处置：实施中若出现，按 §2.3 三形之一处置——**按现档原文重写引文**，不动判据句。

**D6 不新增判据、不放宽判据**
- 边界硬约束：`thincoder-core/doc-check/**` 一字不改。豁免面（类名表 ∥ 占位词干表）不在本批扩表——扩表会同时放宽全仓 5339 处。R2 的「改叙」全部落在**档侧**。

**D8 引用扫描只登记、不越 12 档**
- 内容：两步法的配套要求「查全仓有无指该节的引用」改为**只登记**，不在本轮改指到 12 档之外。
- 理由：改指落到 12 档之外，改动面就与判据集脱钩——而本批的验收（§2.6 四条）只覆盖这 12 档，越域的改动没有验收面接住。
- 读数：指设计档 `docs/core/design/ENGINEERING-MODE-V2.md` `§7` 的引用 = 0 份（扫法与边界见 §2.7）。
- 被否方案：有引用就同轮一并改指——它把「本批只清 12 档」变成「清到哪算哪」。

### §2.9 边界（本批不做）

- **不删任何判据句**：删的是「它在哪实现」那半句。
- **不动 `thincoder-core/doc-check/**` 的判据本体**：含豁免表不扩（D6）。
- **不全仓一次清完**：本批只清 12 档；全仓 5339 处裸名 + 另一批真死另排。
- **不动 `docs/batches/` 面互引**：批档面互引本就面判不判（`batchDocBases`）。
- **不裁减 RTM 用例**（归 `#2113`）。
- **不新增档、不改 manifest 的 `docRoot`**。

### 逐处表 A · 序 1–5（§2.4 的续）

列 = 序 / 位置（节号 + 句首，不写行号）/ token / 处数 / 角色 / 处置 / 理由一句。「处数」逐档合计 = §2.4 顺序表处数。

**序 1 · `docs/core/design/DOC-DISCIPLINE.md`（零处，无逐处表）**

该档零处：当刻 `引缺` 读数为 0（见 §2.10），无逐处表行；该档仍纳入判定集与复量。

**序 2 · `docs/core/design/PROMPT-SYSTEM.md`（零处，无逐处表）**

该档零处：`checkAnchors` 三桶皆 0（见 §2.10 对账表），无逐处表行；同样纳入判定集与复量。

**序 3 · `docs/core/design/ADVISOR-GUARDS.md`（19 处 / 表行 19）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
3 | §1.1「断言位置 = 槽写之前」 | design-token.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/design-token.mjs | 句说「判据在那一份档的 boundBatch 行」= 具体档
4 | §1.1「异常不许在结算面被接住后继续」 | advisor-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/advisor-settle.mjs | 句指结算调用点所在档
5 | §1.1「异步轨的后果 = 进程退出」 | advisor-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/advisor-async.mjs | 句指 settleAsyncEntry 所在的异步轨档
6 | §1.1「异步轨的后果 = 进程退出」 | async-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/async-settle.mjs | 同一句里点名 onAccounting 的另一份档，各自具体
7 | §1.1「异步轨的后果 = 进程退出」 | advisor-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/advisor-settle.mjs | 同上；同句两处同名，两处都补（不合并成一处）
8 | §1.1「§3 状态行 = 评审通过」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 句指 readSectionStatusWord 与 STATUS_WORDS 所在档
9 | §1.1「同步轨与异步轨同调此函数」 | advisor.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/advisor.mjs | 句说「结算调用点」= 编排面；agent-tools 那份是工具壳
10 | §1.1「同步轨与异步轨同调此函数」 | advisor-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/advisor-settle.mjs | 句指 settleDesignReview( 调用所在档
11 | §1.1「词表不补 changes-required 字面」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 句指词表注释所在档
12 | §1.2「边界：不改 batch.mjs 的段白名单」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 句指段白名单实现档
13 | §1.2「段级状态行不携带「哪一轮写的」」 | batch-closeout.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-closeout.mjs | 句指打回重置的落盘档
14 | §2「另立新档的理由 = node:sqlite 只能动态引」 | ../ledger.mjs | 1 | R1 | 改为仓根形 → thincoder-core/ledger.mjs | `../` 是相对写法，补成仓根形后不依赖引用方目录
15 | §10「A-AG15 调用面零残留」 | advisor.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/advisor.mjs | 该行讲 advisorTool.execute( 与声明面 ⇒ 工具实现档
16 | §10「A-AG23 门的前置」 | advisor-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/advisor-settle.mjs | 该行讲 settleDesignReview 的 throw 面
17 | §10「A-AG23 门的前置」 | advisor-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/advisor-async.mjs | 该行点名异步轨同一条结算链
18 | §10「A-AG23 门的前置」 | async-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/async-settle.mjs | 同上，另一份具体档
19 | §10「A-AG23 门的前置」 | advisor-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/advisor-settle.mjs | 同上（该行同名三处，三处各判）
20 | §12「6-3 临时根 outside/x.md」 | outside/x.md | 1 | R2 举例 | 改叙：整行用例形写进围栏块（该 token 不再入判） | 临时根用例的构造路径，盘上永不存在是设计意图；补路径 = 造一个假指称
21 | §12「6-4 临时根：无 manifest、无 .git」 | docs/a.md | 1 | R2 举例 | 改叙：同上，用例形写进围栏块 | 同上；`documents = ["docs/a.md"]` 是构造入参，不是仓内档
```

**序 4 · `docs/core/design/BATCH-RECORD.md`（33 处 / 表行 33）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
22 | §2「路径解析 | 相对路径解析序」 | batch-paths.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-paths.mjs | 句说解析序单源 = 这一份档
23 | §4.8「BR-92 | 依据格写 batch-skeleton.mjs 后接冒号行号」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 句举「反例写法」里的那份档名，指称仍是具体档
24 | §4.9「落点接线（N3 可迁移）」 | batch-paths.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-paths.mjs | 句说解析序单源
25 | §4.10「骨架（create 模板的行为规格 …」 | agent-tools/batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 已有 `agent-tools/` 段，缺仓根段
26 | §4.10「骨架（create 模板的行为规格 …」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 句说该档持 schema ∕ 分发
27 | §4.15「契约（本面参数与落位判据单源」 | agent-tools/batch-paths.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-paths.mjs | 同 25，缺仓根段
28 | §4.15「「项目根」取根单源 = resolveProjectRoot」 | manifest.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/manifest.mjs | 句说该档是转口（owningProject 经它取根）
29 | §4.16「描述面处置（模型可见文案 …」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 句指描述属性所在档
30 | §4.16「描述面处置（模型可见文案 …」 | subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 同一句并列的第二份档，各自具体
31 | §4.17「其余：…（337 行）」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 句说该档动态 import ledger
32 | §4.17「其余：…（337 行）」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 同上，被 import 的那一份
33 | §4.17「贴线判（500 软线 / 800 硬限）」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 句报该档行数读数
34 | §4.18「判据口径单源：sectionContentState」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 句说判据字面与骨架共址
35 | §4.18「实现坐标 = …batch-closeout.mjs」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 句说段空判据由该档单一承担
36 | §4.18「零改面：STATUS_WORDS 字面 …」 | batch-read.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-read.mjs | 句列零改面里的读面档
37 | §4.18「贴线判 …最高实现档 = 506 行」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 句报最高实现档读数
38 | §4.18「贴线判 …（与 config.mjs 同口径）」 | config.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/config.mjs | 「同口径」指仓内贴线判的同一实现档，不是 server 侧 ops
39 | §4.19「锚越段界 | 最小两步复现」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 句说 edit 动作分发表的所在档
40 | §4.19「锚越段界 | 最小两步复现」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 句指 depth-0 挂载面所在档
41 | §4.19「骨架保护的既有缺口」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 句说该档的段头判据正则
42 | §4.21.3「consumers: depth-0 主 agent」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 句指 depth-0 挂载面
43 | §4.21.3「四枚新拒串常量」 | batch-record-write.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-record-write.mjs | 句说常量与既有拒串同址
44 | §4.21.3「四枚新拒串常量」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 同一句并列的另一份档
45 | §4.21.4「描述面（模型可见文案）」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 句指参数 description 所在档
46 | §4.21.4「零改面：STATUS_WORDS 字面」 | batch-read.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-read.mjs | 句列零改面里的读面档
47 | §4.21.4「文件档（500 软线 / 拆分触发 650）」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 句报该档行数读数
48 | §4.21.4「文件档（500 软线 / 拆分触发 650）」 | batch-record-write.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-record-write.mjs | 同上，逐档各一行
49 | §4.21.4「文件档（500 软线 / 拆分触发 650）」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 同上，逐档各一行
50 | §4.21.4「文件档（500 软线 / 拆分触发 650）」 | batch-segment-vocab.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-segment-vocab.mjs | 同上，逐档各一行
51 | §4.21.4「文件档（500 软线 / 拆分触发 650）」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 同上，逐档各一行
52 | §4.21.4「文件档（500 软线 / 拆分触发 650）」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 同一行第二次出现，独立计一处（行数不计重）
53 | §4.21.4「文件档（500 软线 / 拆分触发 650）」 | batch-ledger-bind.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-ledger-bind.mjs | 同上，逐档各一行
54 | §7「D-BR22 | 批次档相对路径」 | batch-paths.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-paths.mjs | 句说四处调用点共用这一份解析器
```

**序 4 表尾核对（D3 计数纪律）**：33 表行覆盖 33 处（行内处数逐行 = 1）＝ §2.4 顺序表该档处数。

**序 5 · `docs/core/design/TESTING.md`（61 处 / 58 行）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
55 | §2.2「单元测试档（批次目录 *.test.mjs）」 | .test.mjs | 1 | R2 泛指 | glob 移入围栏块，散文留「单元测试档」字样 | 说的是命名模式，不是仓内某一份档
56 | §2.3「cli | 收集面反查」 | .test.mjs | 1 | R2 泛指 | 同 55：glob 入围栏块 | 判据是「树下的单元档都在该在的位置」，一整类
57 | §2.3「core | 收集面反查」 | .test.mjs | 1 | R2 泛指 | 同 55：glob 入围栏块 | 同上，另一包的同一类判据
58 | §2.3「vscode ∥ desktop | 各自收集面自检」 | test/files.mjs | 1 | R1（候选 2） | 补成两份并列 → thincoder-vscode/test/files.mjs ∥ thincoder-desktop/test/files.mjs | 句里的「各自」明说两向各持一份清单
59 | §2.3「vscode ∥ desktop | 各自收集面自检」 | .test.mjs | 1 | R2 泛指 | 同 55：glob 入围栏块 | 「未登记的单元档」是类别
60 | §2.3「认账 ≠ 库存」 | .test.mjs | 2 | R2 泛指 | 两处 glob 同句，一并入围栏块 | 句说「清单只指批内件」，是类别不是某一份
61 | §2.4「① 收口门只读批档所在目录」 | .test.mjs | 1 | R2 泛指 | 同上：glob 入围栏块 | 句说「后缀为 .test.mjs 的文件」，是类别
62 | §2.4「render-core 单层 glob 收顶层」 | .test.mjs | 1 | R2 泛指 | 同上：glob 入围栏块 | 句说的是收集面能收哪一类
63 | §3.5「1. 候选集 = D 下后缀为 .test.mjs 的文件」 | .test.mjs | 1 | R2 泛指 | 同上：glob 入围栏块 | 判据按后缀定类，不指具体档
64 | §3.5「K-1 判据独立于 doc-check 门」 | batch-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-gate.mjs | 句指 evaluate() 所在的那一份档
65 | §3.5「先例对齐：同门前例」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 句指 assertCloseoutChainComplete 所在档
66 | §3.5「U-1 错误 | 夹具批档 x.md + 同目录 x.test.mjs」 | x.test.mjs | 2 | R2 举例 | 夹具名入围栏块（用例表仍可读） | 用例构造的夹具名，盘上不存在是设计前提
67 | §3.5「U-2 正常 | 删 x.test.mjs 后同跑 close」 | x.test.mjs | 1 | R2 举例 | 同 66：入围栏块 | 同上，同一夹具的另一用例
68 | §3.5「U-3 边界（最长前缀）」 | x-2.test.mjs | 1 | R2 举例 | 同 66：入围栏块 | 构造「stem x ∥ x-2」的夹具名
69 | §3.5「U-4 边界（同前缀后缀变体）」 | x-extra.test.mjs | 1 | R2 举例 | 同 66：入围栏块 | 构造后缀变体的夹具名
70 | §3.5「U-5 错误（第二路）」 | x.test.mjs | 1 | R2 举例 | 同 66：入围栏块 | 与 U-1 同夹具，走 status 第二路
71 | §3.5「U-6 边界（无主档）」 | y.test.mjs | 1 | R2 举例 | 同 66：入围栏块 | 构造「无主档」的夹具名
72 | §3.5「同门波及的既有行」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说夹具「不留单元件」，是类别
73 | §4.3「目标集合」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句定义目标集合 = 一类档
74 | §4.3「不变量 | 收集面反查」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说不变量按类判
75 | §4.6「射程 = 全部集成用例档」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说「全部」，即类别
76 | §4.7「① 假设备 pty | ssh 会话」 | ssh-device-readability.test.mjs | 1 | R1 | 补仓根 → test/integration/ssh-device-readability.test.mjs | 句指 withSession 所在的那一份用例档
77 | §4.7「T-2 | 边界 | 单文件路径」 | tester-role.test.mjs | 1 | R1 | 补仓根 → test/integration/tester-role.test.mjs | 句指该用例档的夹具桩
78 | §4.7「test/integration/*.test.mjs（rmSync 命中档全数）」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说「命中档全数」，是集合
79 | §5.1「三端共用」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句定收集面 = 一层目录下的一类档
80 | §6.1「C2 | 非测试文件边界」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档」，原件入围栏块 | 句说「仓内一切非测试文件」，补成某一份 = 造具体指称
81 | §7「TS-2 | 边界 | 盘上未登记的 *.test.mjs」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说「未登记的那一类」
82 | §10「定位：v1 测试门禁 = 三层」 | slow-gate.mjs | 1 | R4 退役件 | 形 2：删坐标半句，保留「慢测层归册机制」判据句 | 该档已随 F3 砍慢测层删除（全仓零同名档）
83 | §10「F1 | 统一 test 命令」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句定义目标集合的类
84 | §10「F3 | 砍慢测层归册」 | slow.mjs | 1 | R1（候选 3） | 补成三份并列 → thincoder-cli/test/slow.mjs ∥ thincoder-core/test/slow.mjs ∥ thincoder-vscode/test/slow.mjs | 该句说「保留为纯别名」，三包各一份
85 | §10「AC-M10-2 | 无多套脚本残留」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档」，原件入围栏块 | 句断言「各包 scripts」，是整类
86 | §10.1「单元测试反向自检」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说「盘上未登记的那一类」
87 | §10.1「夹具档纳入理由」 | files.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/test/files.mjs | 该节讲 VSC 清单的纳入理由，取 VSC 那一份
88 | §10.2「④-2 | 新增自检 SC-1」 | .test.mjs | 2 | R2 泛指 | 同句两处 glob 一并入围栏块 | 判据按类反查收集面
89 | §10.2「1. 域 = test/ 树下全部」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句定义「域」= 一类档
90 | §10.2「4. 白名单 = 无按档豁免名单」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说「域只含这一类」
91 | §10.2「4. 白名单 = 无按档豁免名单」 | smoke-settings.mjs | 1 | R2 举例 | 示例名入围栏块（「等」字保留） | 句举 smoke 档的例子，不是指某一份
92 | §10.2「4. 白名单 = 无按档豁免名单」 | .fixture.mjs | 1 | R2 泛指 | glob 入围栏块 | 同句里 fixture 档的命名模式
93 | §10.2「5. 文案（AC 断言对象）」 | test/foo.test.mjs | 1 | R2 举例 | 例子入围栏块 | 句明写「（例 …）」，是文案样例
94 | §10.2「5. 文案（AC 断言对象）」 | run.mjs | 1 | R2 泛指 | 改叙为「该包 runner 脚本自身的 root」，三份仓根路径列入围栏块 | 句说「基准 = 自身 root」，各包各有一份
95 | §10.3「SC-3 | 清单在盘」 | run.mjs | 1 | R1 | 补仓根 → thincoder-vscode/test/run.mjs | 句明写「vsc `run.mjs` 原文」
96 | §10.3「SC-4 | 零混入」 | run.mjs | 1 | R1 | 补仓根 → thincoder-vscode/test/run.mjs | 同上，同一份 vsc runner
97 | §10.3「KD-2 cli 顶层单元收集面删除」 | run.mjs | 1 | R1 | 补仓根 → thincoder-cli/test/run.mjs | 句实读「thincoder-cli/test/ 现盘 = run.mjs + slow.mjs」
98 | §10.3「KD-2 cli 顶层单元收集面删除」 | slow.mjs | 1 | R1 | 补仓根 → thincoder-cli/test/slow.mjs | 同一句实读的另一份档
99 | §10.3「KD-2 cli 顶层单元收集面删除」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说「零顶层单元档」，是类别
100 | §10.3「KD-3 错位档 fail-closed」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说「落在别处的单元档」这一类
101 | §10.3「KD-5 slow.mjs 零改」 | slow.mjs | 1 | R1（候选 3） | 补成三份并列（同 84） | 句说纯别名保留，三包各一份
102 | §10.3「KD-5 slow.mjs 零改」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句说「批档内单元件零引用」，是类别
103 | §10.3「KD-5 slow.mjs 零改」 | slow.mjs | 1 | R1（候选 3） | 补成三份并列（同 101），该行第二处独立计 | 同句第二次出现，独立计一处
104 | §10.3「另一实例 = check-syntax 消费者」 | check-syntax.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/scripts/check-syntax.mjs | 该行以 vscode 那份为「另一实例」，主实例取 core
105 | §10.3「A-SL1 | 仓根 runner 目标集合」 | .test.mjs | 1 | R2 泛指 | glob 入围栏块 | 句定义目标集合的类
106 | §10.3「A-SL5 | 核反查」 | thincoder-core/test/__probe.test.mjs | 1 | R2 举例 | 临时落档名入围栏块 | 句说「临时落 … ⇒ exit 1」，该档按设计只临时存在
107 | §10.3「U-5 | 错误 | 夹具」 | test/x.test.mjs | 1 | R2 举例 | 夹具名入围栏块 | 构造「单元档错位」的夹具
108 | §10.3「收口路径（可执行）」 | test/files.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/test/files.mjs | 句明写「VSC `test/files.mjs`」
109 | §10.3「收口路径（可执行）」 | test/integration/files.mjs | 1 | R1（候选 2） | 补仓根 → test/integration/files.mjs | 句并列的第二份清单，仓根集成面
110 | §10.3「收口路径（可执行）」 | test/files.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/test/files.mjs，该行第二次出现独立计 | 同句第二次出现，独立计一处
111 | §12.7「不动 15 例断言本体」 | package.json | 1 | R2 泛指 | 改叙为「仓根清单档」，原件入围栏块 | 句说「不建仓根 package.json」——**该档按设计不该存在**，补路径 = 造出不存在的指称
112 | §12.8「他档（设计席笔）」 | test/integration/files.mjs | 1 | R1（候选 2） | 补仓根 → test/integration/files.mjs | 句说「归位到仓根」，指仓根集成面那份
```

**序 5 表尾核对**：58 行覆盖 61 处（行内处数合计 61 = §2.4 顺序表该档处数）。

**R2 的处置形在此档已定型**（后续各档同形，不再重述理由模板）：glob ∥ 示例名 ∥ 夹具名一律**移入围栏块**——围栏块整块跳过，该 token 不再入判；散文保留原句语义，**不补路径**。**唯一例外**是 `package.json` 这类「各包各有一份」的泛指：改叙为「各包清单档」，并在围栏块内列出真路径（读者要查时仍有坐标）。

**格内形（token 落在表格单元格里）——R2 的第三类落法，此前未定义，此处定型。** 格内处集中在 `docs/core/design/TESTING.md` 的用例表 ∥ 失效清单表（即逐处表序 55–112 群）。落法三分：

1. **整表是清单**（除格内 token 外没有判据内容）⇒ **整表移入围栏块**（表变代码块），表前散文保留原句。逐处表「处置」列写「整表入围栏块」。
2. **表里夹着判据**（用例表的「怎么做 ∥ 怎么算通过」列是判据）⇒ **表不动，只把该格改成不含 token 的散文**：如夹具格原写「夹具单元档 `x.test.mjs`」，改成「夹具单元档（命名模式见表下围栏块）」，真清单在表下**一段围栏块**里逐条列。逐处表「处置」列写「格内改叙 + 表下围栏块」。
3. **同列全是举例 / 夹具名**（`docs/core/design/TESTING.md` 用例表整列即此形）⇒ 按第 2 形逐格改叙，**不回退整表**——判据列必须留在表里。

**三形的共界**：都不改判据文字，只改「这一格怎么写那个名字」；写成围栏块后读者仍查得到真清单，写成散文的格子保留了「这是一类、不是这一份」的原意。

### 逐处表 B · 序 6–7（§2.4 的续）

**序 6 · `docs/core/design/LEDGER.md`（70 处 / 70 行）**

一处一行，不合并同名：同名两处若在两句里各说各的实现点，合并就把「每一处一句话」变成「一句盖两处」。

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
113 | 抬头（§1 之前）「落点：…」 | ledger-cmd.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-cmd.mjs | 落点行点名该档持「命令族 + 工具定义」
114 | 抬头（§1 之前）「落点：…」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 同句并列第二份：族发现 / scan 组装 / 判活解析 + re-export 单源
115 | 抬头（§1 之前）「落点：…」 | ledger-surface.mjs | 1 | R1（候选 3） | 补成三份并列 → thincoder-core/ledger-surface.mjs ∥ thincoder-cli/src/tui/ledger-surface.mjs ∥ thincoder-vscode/src/extension/ledger-surface.mjs | 句明写「×3（核机制 + CLI / VSC 端胶水）」，三份各是具体档
116 | §2「表 schema（… DDL 常量」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 句说 DDL 常量 ∥ openLedger 幂等执行住这一份
117 | §2.1「键式（单源 = … ledgerKey(root)」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 句指 ledgerKey 单源所在档
118 | §2.1「归一步 = … normalizeCwd」 | session-slots.mjs | 1 | R1 | 补仓根 → thincoder-core/session-slots.mjs | normalizeCwd 实读在该档（盘符统一大写那一步）
119 | §2.1「根解析面（读写同一推导）」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 句说判据本体 = 该档的 owningProject
120 | §2.1「路径串等值比较边界（三处）」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 第一处讲 scopeMarkerOf 范围滤取的实现点
121 | §2.1「路径串等值比较边界（三处）」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 同句第二处讲 discoverFamily 的 p.root 比较，独立计一处
122 | §2.1「…（核与 VSC 两份）的 s.root」 | ledger-surface.mjs | 1 | R1（候选 3） | 补成两份 → thincoder-core/ledger-surface.mjs ∥ thincoder-vscode/src/extension/ledger-surface.mjs | 句明写「核与 VSC 两份」，两向各持一份
123 | §2.2「命令面（核内实现…」 | ledger-migrate.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-migrate.mjs | 句说命令面的核内实现在这一份
124 | §2.2「变体键枚举法…先例 =」 | session-migrate.mjs | 1 | R1 | 补仓根 → thincoder-core/session-migrate.mjs | 「盘符两形都试」的先例实读就在该档
125 | §2.2「连接设 PRAGMA busy_timeout」 | memory/schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 已有 `memory/` 段、缺仓根段；同值先例在该档
126 | §2.2「边界：…不动其他用户态面」 | ledger-notify.json | 1 | R3 因门改叙 | 散文改「台账通知档」，原件名移入围栏块 | 用户数据目录的历史残档名，仓内零同名档——它不是仓内指针，但悬着会挡交付门
127 | §3.1「sessionId = 调用会话…」 | session-slots.mjs | 1 | R1 | 补仓根 → thincoder-core/session-slots.mjs | getSessionId 由该档转出（实读 export { getSessionId }）
128 | §3.4「读面：query 行集自然携带」 | ledger-migrate.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-migrate.mjs | DATA_COLUMNS 13 列的单源在该档
129 | §3.4「schema 版本：LEDGER_SCHEMA_VERSION」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 升号那行常量注在该档
130 | §3.5「拆分触发 = 该档过 650 行」 | config.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/config.mjs | 「同口径」指仓内贴线判的同一实现档，不是 server 侧 ops
131 | §3.5「两口径管辖面…只对…生效」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 650 触发只对这一份档生效
132 | §3.7「count 的消费面（…ACP read-data」 | read-data.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/acp/read-data.mjs | 全仓唯一同名档在 CLI 的 ACP 面
133 | §3.7「3. 阈值不可配…AGING_DAYS」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 30 天常量单源在该档
134 | §3.7「逐行计算字段…实现坐标」 | ledger-cmd.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-cmd.mjs | ledgerQuery 的 aged 计算点在该档
135 | §3.7「显示面位扩…实现坐标」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | formatDetailLine 实读在该档
136 | §3.8「依据①：取根面在…」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 句说 projectRootView 显式传界
137 | §3.8「依据①：取根面在…」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 同句第二处讲 owningProject 写 const edge = resolve(boundary)，独立计
138 | §3.8「依据①：取根面在…」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 同句并列：resolveLedgerRoot 同写、缺省已删
139 | §3.8「界比较按段归一」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | isInsideOrEqual 的宿主档
140 | §3.8「发现兜底不受界…」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 句说 discoverProjects 只扫起点直接子目录（零上溯）
141 | §3.8「读面 ∥ 在飞扫描 ∥ 写门基底集」 | batch-paths.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-paths.mjs | workspaceCandidates 的宿主档
142 | §3.8「档臂：目录带 PROJECT-MANIFEST.json」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 句说实读该档的 owningProject 档臂
143 | §3.8 入口表「owningProject(target, boundary)」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 表列判据本体（唯一）所在档
144 | §3.8 入口表「projectRootView(target)」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 表列三态报明的实现档
145 | §3.8 入口表「resolveProjectRoot(cwd)」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 薄委托的实现同在该档
146 | §3.8 入口表「resolveLedgerRoot(target, boundary)」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 形状包装 { root, basis } 的实现档
147 | §3.8 入口表「findProject(anchor)」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 形状包装 { root, ledger } 的实现档
148 | §3.8 入口表「findGuideRoot(cwd, scopeFiles)」 | advisor/project-context.mjs | 1 | R1 | 补仓根 → thincoder-core/advisor/project-context.mjs | 已有 `advisor/` 段、缺仓根段；该函数实读在此
149 | §3.8「cwd 入参语义…实读…五处调用」 | ledger-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-tools.mjs | startOf 的五个调用点在该档
150 | §3.8「指针值 → 起点…指针段号剥离」 | ledger-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-tools.mjs | 段号剥离的实现段同在该档
151 | §3.8「指针值 → 起点…写入门判据」 | ledger-cmd.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-cmd.mjs | assertTaskBookGate / assertBatchArg 在该档
152 | §3.8「写面…实读…无根报错段」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 无根拒文逐字出自该档
153 | §3.8「工具面（模型可见）…抛面」 | ledger-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-tools.mjs | assertLedgerStart 的宿主档
154 | §3.8「工具面…文案单源」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 同句：无根文案单源在该档
155 | §3.8「① 评审文档范围」 | review-facts.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/review-facts.mjs | resolveReviewDocPaths 链首的宿主档
156 | §3.8「② 批档面」 | batch-paths.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-paths.mjs | 同档另一条判据：workspaceCandidates 用于多根锚
157 | §3.8「④ 批档正常路径」 | batch-paths.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-paths.mjs | 同档：命中下辖项目的正常路径实读
158 | §3.8 RTM 表「6-3 绝对形」 | review-facts.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/review-facts.mjs | 句说绝对形判在该档
159 | §3.10「4. …一律动态 import」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 被动态 import 以避开 node:sqlite 静态链的那一份
160 | §5 表「归档｜软删除…为历史档不再追加」 | docs/TODO-archive.md | 1 | R4 退役件 | 形 3：留事实去退役名 →「历史归档面不再追加」 | 目标档不在盘（`docs/` 下只余 TODO.md）；括号里那条事实与退役名无关，照留
161 | §5 表「归属与落笔」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | depthOnly 分支的宿主档
162 | §5 表「evidence 文字太长」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | EVIDENCE_TOO_LONG_MAX 与 AGING_DAYS 同居该档
163 | §6.1「覆盖的写入口…re-export」 | ledger-cmd.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-cmd.mjs | 三写命令导出面的对端档
164 | §6.2「落点 = 行 resume_when…13 列」 | ledger-migrate.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-migrate.mjs | 13 列导出面的实读在该档
165 | §6.3「门住核内…await import(」 | ../ledger.mjs | 1 | R1 | 改为仓根形 → thincoder-core/ledger.mjs | `../` 是相对写法、依赖引用方目录；仓根形不依赖（同序 14 处置）
166 | §7.1 表「resolveLedgerRoot（新增）」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 句说形状包装该档的 owningProject、零第二上溯
167 | §7.1 表「ledgerChildren(dir)（随迁）」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 随迁的来源档
168 | §7.1 表「ledgerChildren(dir)（随迁）」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 同格第二处讲 re-export 的公共面形，独立计一处
169 | §7.1「这条义务代码侧已是机械保证」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 句说 owningProject 写 const edge = resolve(boundary)
170 | §7.1「这条义务代码侧已是机械保证」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 同句并列：resolveLedgerRoot 同写
171 | §7.3.1「executor → pid 解析」 | peer-instances.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/peer-instances.mjs | groupSlotSessions 实读在该档；VSC 那份无此函数
172 | §7.3.1「1. 一次批量…导出」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | resolveExecutorStates 的导出面在该档
173 | §7.3.1「2. TTL 缓存…PEER_PROBE_TTL_MS」 | peer-instances.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/peer-instances.mjs | 5s 常量 PEER_PROBE_TTL_MS 只在该档
174 | §8 表「AC-M2-37 开批同面判」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 判点 = ledgerBindBatch 体内，在该档
175 | §8 表「AC-M2-37 开批同面判」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 同格第二处讲零写二件的开户写形，独立计一处
176 | §8「共同件：临时项目树」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 句说动态 import 该档以破 node:sqlite 静态引
177 | §9「不做…项目归档档搬迁」 | docs/TODO-archive.md | 1 | R4 退役件 | 形 3：保留「不做项目归档档搬迁」、去退役名 →「历史归档档」 | 目标档不在盘；边界句本身留着，去掉的只是退役名
178 | §9「不新增台账展示面形态」 | ledger-surface.mjs | 1 | R1（候选 3） | 补成三份并列（同 115） | 句明写「×3 保留」，三份各是具体档
179 | §9「不写实现代码」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 句说该档 = eng-coder 写域
180 | §9「族发现同级枚举 = 已注册单谓词」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | ledgerChildren 随迁的目标档
181 | §9「不动 manifest 面其余判据」 | manifest-discovery.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-discovery.mjs | 句说本批只改该档的 projectRootView 取根臂
182 | §9「库键与迁移（§2.1 / §2.2）」 | ledger-notify.json | 1 | R3 因门改叙 | 同 126：散文改「台账通知档」，原件名移入围栏块 | 同一用户态残档名在边界清单里第二次出现，独立计一处
```

**序 6 表尾核对**：70 行覆盖 70 处（行内处数逐行 = 1，合计 70 = §2.4 顺序表该档处数；处数不合并，理由见本节开头一句）。

**序 7 · `docs/core/design/AGENT-LOOP-SUBAGENT.md`（76 处 / 76 行）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
183 | §6.7.2「STOPPED_MARK（定义 = …」 | spawn-child.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/spawn-child.mjs | 句说 STOPPED_MARK 的定义与再导出都在该档
184 | §6.7.2「⟦ev⟧ 事件 token 文法机读单源」 | spawn-child.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/spawn-child.mjs | 同节另一句：哨兵再导出面在该档、既有 import 面零改
185 | §6.21.3「零改面：取号公式」 | subagent-scheduler.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-scheduler.mjs | 取号公式落那一份档，改不得
186 | §6.21.5「D-SUB-ID2（令牌 = 同步配对语义）」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 令牌生命周期的发送侧在该档
187 | §6.21.5「D-SUB-ID2（令牌 = 同步配对语义）」 | subagent-run.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-run.mjs | 同句的同步消费侧，「无 await 间隙」指这两档之间
188 | §6.21.7 表「A2 断言在位可机检」 | subagent-run.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-run.mjs | A2 的三个消费点之一在該档
189 | §6.21.7 表「A2 断言在位可机检」 | escalate-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/escalate-async.mjs | 同格列举的第二个消费点
190 | §6.21.7 表「A2 断言在位可机检」 | advisor-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/advisor-async.mjs | 同格列举的第三个消费点
191 | §6.21.7 表「A4 范围守恒」 | subagent-scheduler.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-scheduler.mjs | 机检要求 diff 不触该档的取号公式行
192 | §6.22「最近先例：§6.23 工具描述与门同源族」 | subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 先例 = 该档描述句随门改口那一处
193 | §6.22「工具与门面：…」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | 改动面清单里门谓词所在的那份档
194 | §6.22「工具与门面：…」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 同清单第三份：spawn 装配面
195 | §6.22「工具与门面：…」 | audit-block.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/audit-block.mjs | 同清单第四份：审计块构造
196 | §6.22.1「门的取参面 = 工具入参原对象」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | 句说各谓词以 const a = args ?? {} 同形取参
197 | §6.22.1「拒收文案（逐字模板…」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | 句明写实现单源 = 该档
198 | §6.22.8「拒收名单含 context…」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | rejectEngFreeTextParams 谓词的宿主档
199 | §6.23.3 表「agent/family-tools.mjs」 | agent/family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 已有 `agent/` 段、缺仓根段；表左格的 enum 行在该档
200 | §6.23.3 表「agent-tools/subagent.mjs」 | agent-tools/subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 已有 `agent-tools/` 段、缺仓根段；round schema 行在该档
201 | §6.23.3 表「agent-tools/subagent.mjs」 | ./spawn-gates.mjs | 1 | R1 | 改为仓根形 → thincoder-core/agent-tools/spawn-gates.mjs | `./` 是相对写法，仓根形不依赖引用方目录
202 | §6.23.3「零改面：…suffix 句」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 零改面的 suffix 句落在该档
203 | §6.23.3「零改面：…ROLES 白名单」 | subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | ROLES 白名单与 plan 必须仍在，指该档
204 | §6.23.5「KD-M5-9（round 真单源）」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | round 的唯一字面量保留在该档
205 | §6.24「修法（枚举）：setup-tooltable.mjs…」 | setup-tooltable.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/setup-tooltable.mjs | 端侧工程分支 enum 的宿主档（全仓唯一同名档在 VSC）
206 | §6.24「边界（本节不做）…不动深度门语义」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 句说端侧深度门要与该档保持同构
207 | §6.25「① executeStatusAction 函数首行」 | subagent-actions.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-actions.mjs | 该函数首行改前 = ctx.agent 取值点在该档
208 | §6.25「② pruneQueue」 | async-discard.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/async-discard.mjs | pruneQueue 的宿主档
209 | §6.25「② pruneQueue…随既有 import 行补入」 | ./async-settle.mjs | 1 | R1 | 改为仓根形 → thincoder-core/agent-tools/async-settle.mjs | `./` 相对写法；carrierField 从该档 import 行补入
210 | §6.25「③ writeTombstone（改后）」 | async-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/async-settle.mjs | writeTombstone 的宿主档
211 | §6.25 表「V2 边界（VSC 对侧）」 | panel-messages-turn.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/panel-messages-turn.mjs | 句说绑定目标 = 该档绑定分支的 history 形参
212 | §6.25 表「A1b 拒返回形」 | subagent-actions-query.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-actions-query.mjs | 两处拒形态的引例在该档
213 | §6.25「不执行…拆分」 | subagent-actions.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-actions.mjs | 只登记不执行拆分的那一份档
214 | §6.26 表「D23-3 审计块构造器外提」 | audit-block.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/audit-block.mjs | 外提的目标档就是这一份
215 | §6.28「保缝面…① configureBatchSegment」 | setup-tooltable.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/setup-tooltable.mjs | 记账缝契约名落该端档
216 | §6.28「D-3…required:[\"action\"]」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 参数 required 与 action 分发在该档
217 | §6.28「D-4 注释面 = 4 处」 | setup-tooltable.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/setup-tooltable.mjs | 注释面四处里端侧那一处
218 | §6.28「② batch-segment.mjs 连字符路径」 | batch-segment.mjs | 1 | R4 退役件 | 形 2：删坐标半句，条目留「连字符路径」一项 | 盘上零同名档（batch-segment* 只余 vocab，且全仓 grep「连字符」= 0 命中）⇒ 无现役对位物可改指
219 | §6.30「KD-TF1 描述句与门一致」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | 句说值集单源 D2 = 该档的 ROUND_VALUES
220 | §6.58.1「占用：条目的 _batchDoc」 | subagent-scheduler.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-scheduler.mjs | 句说 fileKey 同键比较的先例在该档
221 | §6.58.1「为什么必须按 status 过滤」 | async-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/async-settle.mjs | 留池 done-in-pool 的 settle 处置在该档
222 | §6.58.2「既有件三问…describeBlockers」 | subagent-scheduler.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-scheduler.mjs | describeBlockers 的宿主档（同族冲突判定）
223 | §6.58.2「门的先后：guard 在条目入池之前」 | subagent-run.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-run.mjs | 条目入池那一步在该档，guard 须在其前
224 | §6.58.2「被检面双路、占用面单路」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | buildSpawnChild 的注释所载就在该档
225 | §6.58.3「KD-BG1（判据 = 并发，不读 round）」 | subagent-run.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-run.mjs | 句说池条目字面量在该档、现无 _round 字段
226 | §6.59.1「existing but unusable…readonlyToolNames 只收 readonly 旗标」 | helpers.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/agent/helpers.mjs | readonlyToolNames 实读在该档（另两份同名档无此函数）
227 | §6.59.1「…执行面的 readonly 均为 false」 | tools/execute.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/execute.mjs | 执行面 readonly=false 的两份之一
228 | §6.59.1「…（`tools/execute.mjs` ∥ `tools/bash.mjs`）」 | tools/bash.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/bash.mjs | 同句并列的第二个执行面档
229 | §6.59.2「其后调用的 excludeSubagentTools(tools)」 | helpers.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/agent/helpers.mjs | excludeSubagentTools 的宿主档
230 | §6.59.2「…① 排 question / ssh（SUBAGENT_TOOL_EXCLUSIONS…）」 | helpers.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/agent/helpers.mjs | 同句第二处：排除集常量在该档
231 | §6.59.2「…② 对 bash / browser 删掉 async 参」 | helpers.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/agent/helpers.mjs | 同句第三处：删 async 参的实现也在该档
232 | §6.59.2「⑤ 段级工具段…depth>0 角色段不加新分支」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | depth>0 角色段与兜底段的宿主档
233 | §6.59.2「角色面…逐字对核」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | subagentRoles 与两侧 enum 的核侧宿主档
234 | §6.59.2「端侧只读集怎么取…TRIMMED 核 =」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 核侧 TRIMMED 字面量住该档，端侧不得 import
235 | §6.59.2「不新增池键…要动 config.mjs 默认值」 | config.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/config.mjs | 池位默认值与校验的核配置档，不是 server 侧 ops
236 | §6.59.3 表「同档 §6.22.8 P16 ∥ P17」 | subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 任务书错误文案的角色集订正在该档
237 | §6.59.3 表「同档 §6.22.8 P16 ∥ P17」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | 同格第二处：designPoints 指路句在该档
238 | §6.59.3 表「同档 §6.23.3 的…模式过滤行」 | subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 模式过滤行在该档，本轮增 tester
239 | §6.59.3 表「…∥ family-tools.mjs 工程 enum 行」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 工程 enum 行在该档，同轮增 tester
240 | §6.59.3 表「注释面四处…spawn-gates.mjs 两处」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | 注释面四处里该档占两处，此处计第一处
241 | §6.59.3 表「注释面四处…subagent-spawn.mjs」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 注释面第三处（spawn 装配面）
242 | §6.59.3 表「注释面四处…subagent-async.mjs」 | subagent-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-async.mjs | 注释面第四处（异步入池面）
243 | §6.59.3 表「test/RTM.md + test/integration/*.test.mjs」 | .test.mjs | 1 | R2 泛指 | glob 移入围栏块，散文留「集成用例档」 | 说的是集成用例档一整类，不是仓内某一份
244 | §6.59.3「无拆分计划…五个代码档」 | subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 五个代码档之一（角色白名单面）
245 | §6.59.3「无拆分计划…五个代码档」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 五个代码档之二（族装配面）
246 | §6.59.3「无拆分计划…五个代码档」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 五个代码档之三（装配面）
247 | §6.59.3「无拆分计划…五个代码档」 | prompt-overlays.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-overlays.mjs | 五个代码档之四（提示词覆盖面）
248 | §6.59.3「无拆分计划…端侧 tool-table.mjs」 | tool-table.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/tool-table.mjs | 五个代码档之五 = 端侧工具表（句明写「端侧」）
249 | §6.59.3「无拆分计划…两处注释面档」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | 两处注释面档之一（同句第二处出现，独立计）
250 | §6.59.3「无拆分计划…两处注释面档」 | subagent-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-async.mjs | 两处注释面档之二
251 | §6.59.4 表「D-TT2 池位落 other」 | config.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/config.mjs | 新增键要动的默认值与 resolvePoolLimits 校验在该档
252 | §6.59.5 表「AC-TT2 按公式取快照比集合」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 核侧工具名集合的分支在该档
253 | §6.59.5 表「AC-TT2 按公式取快照比集合」 | tool-table.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/tool-table.mjs | 同格：端侧分支在该档（两端名集不等即不通过）
254 | §6.59.6 表「错误｜子代理派 role:tester」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 子通道 role enum 的白名单在该档
255 | §6.59.6 表「错误｜任务书缺 acceptance」 | spawn-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/spawn-gates.mjs | 缺项拒文的点名实现在该档
256 | §6.59.9 表「30-1 角色白名单」 | subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 集成行左端 = 角色白名单所在档
257 | §6.59.9 表「30-1…核 subagent-spawn.mjs」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 集成行中段 = 核侧工具面过滤所在档
258 | §6.59.9 表「30-1…提示词装配」 | prompt-overlays.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-overlays.mjs | 集成行后段 = 提示词装配所在档
```

**序 7 表尾核对**：76 行覆盖 76 处（行内处数逐行 = 1，合计 76 = §2.4 顺序表该档处数）。

### 逐处表 C · 序 8–12（§2.4 的续）

**序 8 · `docs/core/design/ENGINEERING-MODE-V2.md`（78 处 / 78 行）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
259 | §2.2 M2 行「核列：…（77 行·修改）」 | ledger-surface.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/ledger-surface.mjs | 该格是核机制面那一份（77 行读数与它对应）
260 | §2.2 M2 行「CLI/VSC 端…（70/119 行）」 | ledger-surface.mjs | 1 | R1（候选 3） | 补成两份 → thincoder-cli/src/tui/ledger-surface.mjs ∥ thincoder-vscode/src/extension/ledger-surface.mjs | 句明写「CLI/VSC 端」且给 70/119 两读数，两向各一份
261 | §2.2 M4 行「新档 write-gate.mjs」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 新档落核内 agent 面，句说它持 resolveReviewTargetPaths + 冻结窗口判据组装
262 | §2.2 M4 行「VSC tool-gates.mjs（165 行·修改）」 | tool-gates.mjs | 1 | R4 退役件 | U3-① 整行删（只删该格坐标） | 全仓零同名档；该格只有行数与「修改」，M4 判据住同行判据格，不随它消失
263 | §2.2 M5 行「subagent-scheduler.mjs（428 行·修改）」 | subagent-scheduler.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-scheduler.mjs | 句标它 428 行且是拆分候选，指核侧调度档
264 | §2.2 M6 行「token-ttl.mjs（286 行·零改（继承））」 | token-ttl.mjs | 1 | R1 | 补仓根 → thincoder-core/token-ttl.mjs | 继承零改的那份 TTL 档在核根
265 | §2.2 M6 行「agent-tools/design-token.mjs（118 行）」 | agent-tools/design-token.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/design-token.mjs | 已有 `agent-tools/` 段、缺仓根段
266 | §2.2 M10 行「产品 package.json（修改）」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档」，原件入围栏块 | 句说的是「产品」那一类清单档，补成某一份 = 造具体指称
267 | §2.2 M11 行「核 agent/family-tools.mjs（174 行）」 | agent/family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 已有 `agent/` 段、缺仓根段；174 行读数与它对应
268 | §2.2 M11 行「agent-tools/eng.mjs（102 行）」 | agent-tools/eng.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/eng.mjs | 已有 `agent-tools/` 段、缺仓根段
269 | §2.2 M11 行「session-lifecycle.mjs（305 行）」 | session-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/session-lifecycle.mjs | 槽恢复面清零的落点在核根这一份
270 | §2.2「非死文件纯清理——仍挂载核侧工具表」 | thincoder-core/tools/checklist.mjs | 1 | R4 退役件 | U3-① 删坐标半句；余句是过程陈述、随坐标一并删 | 已有仓根全路径仍零命中 ⇒ 该档已不在盘，整句讲的是它当时还没死
271 | §2.2「非死文件纯清理」（同句第二份） | checklist-sync.mjs | 1 | R4 退役件 | U3-① 删坐标半句（与 270 同句同删） | 同上；全仓零同名档
272 | §2.2「…上下文注入仍在（核 …·VSC context-injections.mjs）」 | context-injections.mjs | 1 | R4 退役件 | U3-① 删坐标半句 | 全仓零同名档；「上下文注入仍在」这半句的对象已不在盘
273 | §2.2「并有死指针（task.mjs · memory-tool.mjs）」 | task.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/task.mjs | 句把它当具体档点名；补后仍指得对（详见 §2.10 的读数提请）
274 | §2.2「并有死指针（… · memory-tool.mjs）」 | memory-tool.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/memory/memory-tool.mjs | 指 memory 工具的核内实现；端侧那份是壳
275 | §2.2「…与 subagent-scheduler.mjs 门禁族」 | subagent-scheduler.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-scheduler.mjs | 句说门禁族住这一份
276 | §2.2 M1 行「新增 manifest.mjs」 | manifest.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/manifest.mjs | M1 = 项目清单模块本体；agent-tools 那份是工具壳
277 | §2.2 M1 行「修改 src/cli/make-agent.mjs」 | src/cli/make-agent.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/cli/make-agent.mjs | 装配层读/初始化 manifest 的端侧入口
278 | §2.2 M2 行（M3 列）「修改 ledger.mjs」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 台账核单源那一份
279 | §2.2 M2 行（M3 列）「+ ledger-surface.mjs」 | ledger-surface.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/ledger-surface.mjs | 该格是核侧列，端侧两份在同行另格已另判（序 260）
280 | §2.2 M2 行「命令注册 …+ family-tools.mjs」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 命令注册面在族装配档
281 | §2.2 M4 行「修改 agent/dispatch.mjs」 | agent/dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 已有 `agent/` 段、缺仓根段；token 门落点
282 | §2.2 M4 行（M7 列）「src/agent/tool-gates.mjs（165 行—VSC 独立同语义镜像）」 | src/agent/tool-gates.mjs | 1 | R4 退役件 | U3-① 删该格坐标 | 全仓零同名档；镜像档已不在盘，同行 M4 判据格照留
283 | §2.2 M5 行「修改 subagent-spawn.mjs」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 委派装配面在核侧
284 | §2.2 M5 行「+ subagent-scheduler.mjs」 | subagent-scheduler.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-scheduler.mjs | 同格第二份档：调度面
285 | §2.2 M6 行「修改 advisor.mjs（274 行）」 | advisor.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/advisor.mjs | 句说评审对象来源读 docRoot = 编排面那一份（agent-tools 那份是工具壳）
286 | §2.2 M6 行「+ token-ttl.mjs」 | token-ttl.mjs | 1 | R1 | 补仓根 → thincoder-core/token-ttl.mjs | 同格第二份：TTL 判据档
287 | §2.2 M6 行「+ agent-tools/design-token.mjs」 | agent-tools/design-token.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/design-token.mjs | 同格第三份：designToken 工具面
288 | §2.2 M6 行（M7 列）「tool-gates.mjs 已 import validateDesignToken 自核」 | tool-gates.mjs | 1 | R4 退役件 | U3-① 删该格坐标 | 全仓零同名档；该格讲的是镜像档自核这一事实，对象已不在盘
289 | §2.2 M10 表（M1 列）「修改 package.json + test/」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档」，原件入围栏块 | 逐列各写一次「本包清单档改」，不是某一份具体档
290 | §2.2 M10 表（M3 列）「修改 package.json + test/」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档」，原件入围栏块 | 同表第二列的同一类档，独立计一处
291 | §2.2 M10 表（M7 列）「修改 package.json + test/」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档」，原件入围栏块 | 同表第三列的同一类档，独立计一处
292 | §2.2 M11 表（M1 列）「修改 family-tools.mjs」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 同表核侧列的族装配档
293 | §2.2 M11 表（M1 列）「· plan.mjs」 | plan.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/plan.mjs | M11 = plan 面排除，改的是核侧 plan 工具（desktop 那份是视图）
294 | §2.2 M11 表（M1 列）「· eng.mjs」 | eng.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/eng.mjs | 翻态工具在核侧
295 | §2.2 M11 表（M1 列）「· session-lifecycle.mjs」 | session-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/session-lifecycle.mjs | 槽恢复面清零的落点
296 | §2.2 M11 表（M3 列）「修改 cmd-plan.mjs」 | cmd-plan.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/cmd-plan.mjs | `/plan` 命令面的 CLI 实现档
297 | §2.2 M11 表（M3 列）「· cmd-eng.mjs」 | cmd-eng.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/cmd-eng.mjs | `/eng` 命令面的 CLI 实现档
298 | §2.2 M11 表（M3 列）「· handlers-session.mjs」 | handlers-session.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/acp/handlers-session.mjs | ACP 入口 applyConfigOption 的宿主档
299 | §2.2 M11 表（M7 列）「src/agent/agent-state.mjs」 | src/agent/agent-state.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/agent-state.mjs | 端侧工程真值镜像所在档
300 | §2.2 M11 表（M7 列）「src/extension/chat-panel.mjs」 | src/extension/chat-panel.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/chat-panel.mjs | `_setPlanMode` 的宿主档
301 | §2.2 M11 表（M7 列）「panel-messages-settings.mjs」 | panel-messages-settings.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/panel-messages-settings.mjs | 设置面翻转点的宿主档
302 | §2.2 M11 表（M7 列）「panel-messages.mjs」 | panel-messages.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/panel-messages.mjs | 面板消息面（与 settings 那份是两份档）
303 | §2.2 M11 表（M7 列）「panel-session.mjs」 | panel-session.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/panel-session.mjs | 会话面板面
304 | §2.2 M11 表（M7 列）「image-handler.mjs」 | image-handler.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/image-handler.mjs | 图像入口面（plan 载体提示要过它）
305 | §2.2 M11 表（M7 列）「webview/mode-buttons.js」 | webview/mode-buttons.js | 1 | R1 | 补仓根 → thincoder-vscode/webview/mode-buttons.js | 已有 `webview/` 段、缺仓根段；模式按钮载体
306 | §2.2 M11 表（M7 列）「locales/en.json」 | locales/en.json | 1 | R1 | 补仓根 → thincoder-vscode/locales/en.json | 已有 `locales/` 段、缺仓根段；英文键面
307 | §2.2 M11 表（M7 列）「locales/zh.json」 | locales/zh.json | 1 | R1 | 补仓根 → thincoder-vscode/locales/zh.json | 同列第二份 locale，两文同步
308 | §3 表「机械面｜token 门」 | dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 句说 M4 门的落点就是这一份
309 | §7 表「② 命令面｜/plan（…） · ACP 两入口」 | handlers-session.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/acp/handlers-session.mjs | ACP applyConfigOption 的 mode 分支在该档
310 | §7 表「② 命令面｜VSC 面板开关（chat-panel.mjs _setPlanMode）」 | chat-panel.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/chat-panel.mjs | `_setPlanMode` 实读在该档
311 | §7「depth>0 子代理…role enum 已无 plan」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 角色面 role enum 的宿主档
312 | §7「depth>0 子代理…spawn 门机械拒 role=plan」 | agent-tools/subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 已有 `agent-tools/` 段、缺仓根段；门段在 spawn 工具
313 | §7「该面工程真值回落 config.json 镜像」 | config.json | 1 | R3 因门改叙 | 散文改「用户配置文件」，原件名移入围栏块 | 句指用户态配置，不是仓内某一份清单；悬着会挡交付门
314 | §7「在飞回合翻转窗…chat-panel.mjs 的 _setPlanMode」 | chat-panel.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/chat-panel.mjs | 同节第二处提翻转点，仍在同一份端档
315 | §7 表「核 agent/family-tools.mjs｜174 行」 | agent/family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 表左列即件名；174 行读数与它对应
316 | §7 表「核 agent/family-tools.mjs｜解构形态零改（源扫描依赖）」 | test/tool-registry.test.mjs | 1 | R4 退役件 | 形 2：删括注坐标（该用例名），「解构形态零改」照留 | 全仓零命中；该用例已随收口删除，规则半句不依赖它
317 | §7 表「核 agent-tools/eng.mjs｜102 行」 | agent-tools/eng.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/eng.mjs | 已有 `agent-tools/` 段、缺仓根段
318 | §7 表「核 session-lifecycle.mjs｜305 行」 | session-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/session-lifecycle.mjs | 槽恢复面清零的落点
319 | §7 表「VSC locales/en.json · zh.json」 | zh.json | 1 | R1 | 补仓根 → thincoder-vscode/locales/zh.json | 同格前半已写全路径，后半缺仓根与目录段
320 | §7 表「核 test/family-tools.test.mjs｜131｜固定段断言」 | test/family-tools.test.mjs | 1 | R4 退役件 | U3-② 改形 2：删坐标句，断言不搬（单源 = §2.3 E7 ① 判据列「工程模式装配名集不含 plan ∧ 不含 task」） | 用例档已随收口删除；该格是断言不是坐标 ⇒ 断言不随坐标消失
321 | §7 表「CLI test/cmd-plan.test.mjs｜新建｜/plan 工程拒绝 + 普通模式回归」 | test/cmd-plan.test.mjs | 1 | R4 退役件 | U3-② 改形 2：删坐标句，断言不搬（单源 = §2.3 E7 ② 判据列「拒绝后 planMode 不变 + 提示可见」） | 同上；断言是「命令面必须拒」，属规则面
322 | §7 表「CLI test/cmd-eng.test.mjs｜124｜清零断言」 | test/cmd-eng.test.mjs | 1 | R4 退役件 | U3-② 改形 2：删坐标句，断言不搬（单源 = §2.3 E7 ③ 判据列「工程模式真值 ⇒ planMode 恒 false（内存 + 槽位）」） | 同上；断言指向翻态后的清零规则
323 | §7 表「CLI test/acp-contract.test.mjs｜363」 | test/acp-contract.test.mjs | 1 | R4 退役件 | U3-② 改形 2：删坐标句，断言不搬（单源 = §2.3 E7 ② 判据列 + 同节 ACP 两入口行的错误响应列） | 同上；断言指向 ACP 拒绝形态
324 | §7 表「CLI test/session-store.test.mjs｜389」 | test/session-store.test.mjs | 1 | R4 退役件 | U3-② 改形 2：删坐标句，断言不搬（单源 = §2.3 E7 ③「恢复面槽值一并收正」+ §3.2 T13 判据列） | 同上；断言就是槽恢复的判据本体
325 | §7 表「VSC test/agent-lifecycle-singleton.test.mjs｜491」 | test/agent-lifecycle-singleton.test.mjs | 1 | R4 退役件 | U3-② 改形 2：删坐标句，断言不搬（单源同上一行：§2.3 E7 ③ + §3.2 T13——端侧槽位同一判据） | 同上；端侧槽位清零的判据
326 | §7 表「VSC test/chat-panel-messages.test.mjs｜462」 | test/chat-panel-messages.test.mjs | 1 | R4 退役件 | U3-② 改形 2：删坐标句，断言不搬（单源 = §2.3 的 VSC 面板开关行判据列「不写槽 + 回推 active:false 回弹」） | 同上；「不写槽 + 回弹」是可见行为判据
327 | §7 表「VSC test/integration/host-shape-spawn.test.mjs｜208｜T5 fixture 两条工程行…」 | test/integration/host-shape-spawn.test.mjs | 1 | R4 退役件 | U3-① 整行删 | 该格整句是「这批怎么改用例」的过程指令（删一行增一行），无模块规则可搬
328 | §7 表「VSC test/status-line.test.mjs｜157｜plan 按钮 disabled + title 断言」 | test/status-line.test.mjs | 1 | R4 退役件 | U3-② 改形 2：删坐标句，断言不搬（单源 = §2.3 的 VSC 面板开关行判据列「plan 按钮 disabled + title」+ §3.1 AC13） | 同上；按钮禁用是用户可见判据（happy-dom 夹具步不搬）
329 | §7「…（happy-dom 真 chat.js 驱动全量 id fixture）」 | chat.js | 1 | R1 | 补仓根 → thincoder-vscode/webview/chat.js | 同句并列的载体档，指真 webview 脚本
330 | §7「拆后估算：setup.mjs ≈432 · setup-tooltable.mjs ≈325」 | setup.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/agent/setup.mjs | 同句配对的是 setup-tooltable（端侧独有）⇒ 这一对都在端侧
331 | §7「拆后估算：… · setup-tooltable.mjs ≈325」 | setup-tooltable.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/setup-tooltable.mjs | 全仓唯一同名档在 VSC
332 | §7「③ ENG_ON_REMINDER（agent/helpers.mjs）无 plan 字样」 | agent/helpers.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/helpers.mjs | 已有 `agent/` 段、缺仓根段；该常量实读在此
333 | §2.4 表「M6 → M4｜读｜resolveReviewTargetPaths」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | M4 拆出的单一权威源，M6 复用它
334 | §2.4 表「M11 → planMode 消费面｜VSC 载体面」 | thincoder-vscode/src/agent/tool-gates.mjs | 1 | R4 退役件 | U3-① 删该格坐标 | 已有仓根全路径仍零命中 ⇒ 该档已不在盘；不变量句（planMode 恒 false）照留
335 | §2.6 表「KD9 裁剪落点 = 核单源 family-tools.mjs」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 句明写「核单源」，端壳不二次过滤
336 | §3.2 表「T14…（除所列矩阵镜像收正——host-shape-spawn.test.mjs T5…外）」 | host-shape-spawn.test.mjs | 1 | R4 退役件 | 形 2：删坐标半句与随之空掉的括注，「四条路径全带宽不变」判据照留 | 全仓零命中；该用例已随收口删除，判据句不依赖它
```

**序 8 表尾核对**：78 行覆盖 78 处（行内处数逐行 = 1，合计 78 = §2.4 顺序表该档处数）。

**「断言」类 8 行（序 320–326 ∥ 328）按裁决改形 2**：该断言的单源在本档规则节（§2.3 E7 判据列 ∥ §3.1 AC13 ∥ §3.2 T10–T13），**不搬**——只删坐标句，不在同档造第二份规则。同节剩一处 U3-① 整行删（序 327）。

**序 9 · `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md`（91 处 / 91 行）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
337 | §2.1 表「产品面｜其余一切路径…含 package-lock.json」 | package-lock.json | 1 | R2 泛指 | 改叙为「各包 lockfile」，原件入围栏块 | 句列举的是「产品面含哪些路径类」，各包各有一份锁，不是某一份
338 | §2.1「产品文本面 = 四产品包的外向文本（README.md · package.json · 发布清单）」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档」，原件入围栏块 | 句说的是四个产品包各持一份的那类档
339 | §2.1「一个消费面换判源：agent/dispatch.mjs 的设计门」 | agent/dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 已有 `agent/` 段、缺仓根段；设计门落点
340 | §2.3「write-gate.mjs 导出 ledgerBindWriteConflict」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 写锁判据体与拒文同住这一份
341 | §2.3「…与既有两道并列挂 dispatch.mjs Phase 1」 | dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 三道门并列挂在同一 Phase 1
342 | §2.3「取「抄齐」，不取「明示偏离」」 | dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 句说两处经 tool.isReadonlyAction 判，在该档
343 | §2.3 表「settings｜用户数据目录的 config.json」 | config.json | 1 | R3 因门改叙 | 散文改「用户配置文件」，原件名移入围栏块 | 用户数据目录的配置档，仓内那份不是它
344 | §2.3 表「settings｜…逐字 set memory.team in ~/.thincoder/config.json」 | config.json | 1 | R3 因门改叙 | 逐字引文整行移入围栏块，散文写「同一路径的旁证」 | 同一行的第二处；这处是逐字引文，改写引文就不是逐字了
345 | §2.3「write-gate.mjs 对 faceDetail 的 import 因此成为零消费」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 句说该档的 import 一并删
346 | §2.4「1. ledger-cmd.mjs 新导出 ledgerBindBatch」 | ledger-cmd.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-cmd.mjs | 开事务的写点落在台账命令档
347 | §2.5「锚形只此一份…（design-token.mjs 已 import 骨架档）」 | design-token.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/design-token.mjs | 句说它已 import 骨架档、不成环
348 | §2.6 表「写锁（笔-账绑定）｜write-gate.mjs ledgerBindWriteConflict」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 表格行的判据体所在档
349 | §2.6 表「写锁…挂 dispatch.mjs Phase 1」 | dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 同格：挂载点是该档的 Phase 1
350 | §2.6 表「核销门③｜ledger-close-proof.mjs assertCloseOutProof」 | ledger-close-proof.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-close-proof.mjs | 该函数与它读的档面事实同住这一份
351 | §2.6.1「既有件三问…design-token.mjs 的 verdictGateFailure」 | design-token.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/design-token.mjs | 句说该面第二份实现就在这一档
352 | §2.9「面判定的机器单源 = agent/write-face.mjs」 | agent/write-face.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-face.mjs | 已有 `agent/` 段、缺仓根段；面判定单源
353 | §2.10「write-face.mjs 直接判两值」 | write-face.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-face.mjs | 同档裸名形，补后与 352 同指
354 | §2.10「名单只剩一份…唯一消费面就是面判（agent/write-face.mjs 的 import）」 | agent/write-face.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-face.mjs | 句说 BUILD_ARTIFACTS 的唯一消费面在该档
355 | §2.10「不做什么：conventions.mjs / classifyPath / isCodePath 本体零改」 | conventions.mjs | 1 | R1 | 补仓根 → thincoder-core/conventions.mjs | 零改面的本体所在档
356 | §2.10「六个消费面逐个点过：agent/dispatch.mjs（换判源）」 | agent/dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 六个消费面里的换判源那一处
357 | §2.10「…agent-tools/verify.mjs」 | agent-tools/verify.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/verify.mjs | 六个消费面之二（语义零改）
358 | §2.10「…agent-tools/advisor-settle.mjs」 | agent-tools/advisor-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/advisor-settle.mjs | 六个消费面之三（语义零改）
359 | §2.10「…advisor/repos.mjs（两处）」 | advisor/repos.mjs | 1 | R1 | 补仓根 → thincoder-core/advisor/repos.mjs | 六个消费面之四（两处调用，同一份档）
360 | §2.10「…agent-tools/declaration.mjs（此五处语义零改）」 | agent-tools/declaration.mjs | 1 | R1 | 改为仓根形 → thincoder-core/declaration.mjs | 写出来的目录段与实盘不符（该档在核根不在 agent-tools），按实盘改
361 | §2.12 表「3｜thincoder-core/tools/tree.mjs｜SKIP_DIRS（未导出）」 | tree.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/tree.mjs | 同格前半已写全路径，后半裸名同指
362 | §2.12 表「4｜thincoder-core/memory/schema.mjs｜…（memory/file-walk.mjs 的 isSkippedRelPath）」 | memory/file-walk.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-walk.mjs | 折叠 + 前缀判定的宿主档
363 | §2.12「只合并名单，不合并判定形状…skip-dirs.mjs 只给名单」 | skip-dirs.mjs | 1 | R1 | 补仓根 → thincoder-core/skip-dirs.mjs | 新叶档，名单单源
364 | §2.12 表「memory/schema.mjs｜删三处定义」 | memory/schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 已有 `memory/` 段、缺仓根段
365 | §2.12 表「…（memory.mjs 的导出面逐字零变）」 | memory.mjs | 1 | R1 | 补仓根 → thincoder-core/memory.mjs | 同名 re-export 的对外面在那份档
366 | §2.12 表「index-discover.mjs｜删本地 const」 | index-discover.mjs | 1 | R1 | 补仓根 → thincoder-core/index-discover.mjs | 索引发现面所在档
367 | §2.12 表「tools/shared.mjs｜删 IGNORED_DIRS」 | tools/shared.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/shared.mjs | 已有 `tools/` 段、缺仓根段；IGNORED_DIRS 的宿主
368 | §2.12 表「…search.mjs 三处改引 SKIP_DIRS」 | search.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/search.mjs | 句说的是核侧搜索工具的三处引用（另有 desktop / render-core 两份同名档，不是它）
369 | §2.12 表「tree.mjs｜删本地 const（未导出）」 | tree.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/tree.mjs | 同表另一行，同一份档的另一处改动
370 | §2.12 表「agent/write-face.mjs｜面判两值」 | agent/write-face.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-face.mjs | 同表：面判两值的落点
371 | §2.12「为什么落叶档不落 conventions.mjs」 | conventions.mjs | 1 | R1 | 补仓根 → thincoder-core/conventions.mjs | 句说它依赖链被拖着走、不能当叶档
372 | §2.12「…memory/schema.mjs 引 node:sqlite ∥ node:fs ∥ ../fts-text.mjs」 | memory/schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 句举它证明不是零依赖
373 | §2.12「…引 ../fts-text.mjs」 | ../fts-text.mjs | 1 | R1 | 改为仓根形 → thincoder-core/fts-text.mjs | `../` 相对写法，仓根形不依赖引用方目录
374 | §2.12「…conventions.mjs 的依赖链已被 declaration.mjs → manifest.mjs 拖着走」 | conventions.mjs | 1 | R1 | 补仓根 → thincoder-core/conventions.mjs | 同句第二处 conventions.mjs（被拖那一端）
375 | §2.12「…被 declaration.mjs → manifest.mjs 拖着走」 | declaration.mjs | 1 | R1 | 补仓根 → thincoder-core/declaration.mjs | 依赖链中段所在档
376 | §2.12「…被 declaration.mjs → manifest.mjs 拖着走」 | manifest.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/manifest.mjs | 依赖链末端 = 清单模块本体（工具壳不在这条 import 链上）
377 | §2.13「台账写点单源 = ledger-cmd.mjs 新导出 ledgerReclaimBatch」 | ledger-cmd.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-cmd.mjs | 与 ledgerReanchorBatch 同档同形的写点
378 | §2.13「ledger.mjs 公共面同步再导出」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 公共面同步再导出的那份档
379 | §3 表「thincoder-core/agent-tools/batch-skeleton.mjs｜已越软线」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 同格前半已写全路径；拆单结论指这一份
380 | §3 表「thincoder-core/tools/git.mjs｜…（它是 write-gate.mjs 的 import）」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 句说 readonlyActionOf 由该档 import
381 | §3 表「thincoder-core/agent/write-gate.mjs｜已越 500 软线」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 同格前半已写全路径；本批不拆的结论指这一份
382 | §3 表「tools/file.mjs ∥ patch.mjs ∥ ops.mjs ∥ bash.mjs ∥ execute.mjs」 | patch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/patch.mjs | 同格首份已写全路径，其余裸名同目录
383 | §3 表「…∥ ops.mjs ∥ …」 | ops.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/ops.mjs | 同格并列的第三份工具档
384 | §3 表「…∥ bash.mjs ∥ …」 | bash.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/bash.mjs | 同格并列的第四份工具档
385 | §3 表「…∥ execute.mjs ∥ …」 | execute.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/execute.mjs | 同格并列的第五份工具档
386 | §3 表「…execute.mjs 另加 project」 | execute.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/execute.mjs | 同句第二处（project 参数那一笔），独立计
387 | §3 表「…git.mjs ∥ manifest.mjs ∥ memory-tool.mjs」 | git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 句说这一组带 project 参数，git 工具那份
388 | §3 表「…∥ manifest.mjs ∥ …」 | manifest.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/manifest.mjs | 这一组是工具档（带 parameters），清单库本体不在其中
389 | §3 表「…∥ memory-tool.mjs ∥ ssh.mjs」 | memory-tool.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/memory/memory-tool.mjs | 工具实现在 memory 子目录；端侧那份是壳
390 | §3 表「…∥ ssh.mjs」 | ssh.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/tools/ssh.mjs | 核侧工具档；server 那份是沙箱实现
391 | §3「拆分预算（batch-lifecycle.mjs 越 500 行软线）」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 拆分预算的主体档
392 | §3 表「迁出 → batch-ledger-bind.mjs（新）」 | batch-ledger-bind.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-ledger-bind.mjs | 新建档落批档工具面
393 | §3 表「迁出 → batch-closeout.mjs（新）」 | batch-closeout.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-closeout.mjs | 链门与机检门调点的新家
394 | §3 表「迁出 → batch-reopen.mjs（新）」 | batch-reopen.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-reopen.mjs | 重开回收调点的新家
395 | §3「⇒ batch-lifecycle.mjs 回到 500 行软线以内」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 切三刀后的落点读数指这一份
396 | §3 表「1｜面判与名单｜skip-dirs.mjs(新)」 | skip-dirs.mjs | 1 | R1 | 补仓根 → thincoder-core/skip-dirs.mjs | 入舱①的名单叶档
397 | §3 表「1｜…agent/write-face.mjs(新)」 | agent/write-face.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-face.mjs | 入舱①的面判底座
398 | §3 表「1｜…index-discover.mjs」 | index-discover.mjs | 1 | R1 | 补仓根 → thincoder-core/index-discover.mjs | 入舱①的名单消费面
399 | §3 表「1｜…tools/shared.mjs」 | tools/shared.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/shared.mjs | 入舱①的 IGNORED_DIRS 删点
400 | §3 表「1｜…tools/search.mjs」 | tools/search.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/search.mjs | 入舱①的三处改引面
401 | §3 表「1｜…tools/tree.mjs」 | tools/tree.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/tree.mjs | 入舱①的本地 const 删点
402 | §3 表「1｜…memory/schema.mjs」 | memory/schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 入舱①的三处定义删点
403 | §3 表「2｜台账面｜ledger-db.mjs」 | ledger-db.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-db.mjs | 入舱②的库面档
404 | §3 表「2｜…ledger-cmd.mjs」 | ledger-cmd.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-cmd.mjs | 入舱②的命令族档
405 | §3 表「2｜…ledger.mjs」 | ledger.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger.mjs | 入舱②的公共面档
406 | §3 表「2｜…ledger-close-proof.mjs」 | ledger-close-proof.mjs | 1 | R1 | 补仓根 → thincoder-core/ledger-close-proof.mjs | 入舱②的核销门档
407 | §3 表「3｜批档工具面｜batch-skeleton.mjs」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 入舱③的骨架档
408 | §3 表「3｜…batch.mjs」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 入舱③的工具入口档
409 | §3 表「3｜…design-token.mjs」 | design-token.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/design-token.mjs | 入舱③的设计令牌档
410 | §3 表「3｜…batch-ledger-bind.mjs(新)」 | batch-ledger-bind.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-ledger-bind.mjs | 入舱③的新档（同 392）
411 | §3 表「3｜…batch-closeout.mjs(新)」 | batch-closeout.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-closeout.mjs | 入舱③的新档（同 393）
412 | §3 表「3｜…batch-reopen.mjs(新)」 | batch-reopen.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-reopen.mjs | 入舱③的新档（同 394）
413 | §3 表「3｜…batch-lifecycle.mjs」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 入舱③的切分主体
414 | §3 表「4｜写锁接线｜agent/write-gate.mjs」 | agent/write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 入舱④的写锁档
415 | §3 表「4｜…agent/dispatch.mjs」 | agent/dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 入舱④的挂载点档
416 | §4「14. 排除名单落零依赖叶档…tools/* 引 conventions.mjs」 | conventions.mjs | 1 | R1 | 补仓根 → thincoder-core/conventions.mjs | 句说引它会拖进声明装载链
417 | §4「14. …被拒 = 放 conventions.mjs 常量区」 | conventions.mjs | 1 | R1 | 补仓根 → thincoder-core/conventions.mjs | 同条第二处：被拒方案的落点，独立计
418 | §4「26. 两锚的中文分支同判…design-token.mjs 的 verdictGateFailure」 | design-token.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/design-token.mjs | 句说该函数本批改调 verdictGapOf
419 | §5 表「R14 排除名单单源｜skip-dirs.mjs 一处定义」 | skip-dirs.mjs | 1 | R1 | 补仓根 → thincoder-core/skip-dirs.mjs | R14 判据的落点档
420 | §7「不动写面既有两道…（dispatch.mjs 的写锁段）」 | dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 三道并列门共用该档的写锁段
421 | §7「不动 conventions.mjs / classifyPath / isCodePath 本体」 | conventions.mjs | 1 | R1 | 补仓根 → thincoder-core/conventions.mjs | 边界条目点名的本体档
422 | §7「…agent/dispatch.mjs 换判源」 | agent/dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 同条第二处：换判源那一份
423 | §7「不删 manifest codePaths 键、不改 manifest-schema.mjs」 | manifest-schema.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-schema.mjs | 清单 schema 的宿主档
424 | §9「实施轮扇面…已知命中 = batch-live-batch-lock.test.mjs」 | batch-live-batch-lock.test.mjs | 1 | R1 | 补仓根 → test/integration/batch-live-batch-lock.test.mjs | 集成用例档，盘上在 test/integration 下
425 | §9「…与 batch-gates-reanchor.test.mjs（14-6）」 | batch-gates-reanchor.test.mjs | 1 | R1 | 补仓根 → test/integration/batch-gates-reanchor.test.mjs | 同句第二份集成用例档
426 | §9 表「12-15｜manifest 工具 ↔ 笔-账绑定判定」 | manifest.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/manifest.mjs | 行主体是 manifest 工具（init 的取根豁免支）
427 | §9「破的行 = 0…现行 write-gate.mjs 对取不到根一律拒」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 句读的是该档现行拒面
```

**序 9 表尾核对**：91 行覆盖 91 处（行内处数逐行 = 1，合计 91 = §2.4 顺序表该档处数）。

**序 10 · `docs/core/design/MEMORY.md`（116 处 / 116 行）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
428 | §1 表「记忆库｜…· memory-tool.mjs」 | memory-tool.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/memory/memory-tool.mjs | 同格已写 thincoder-core/memory.mjs，右列指向核内工具面
429 | §1 表「工具面｜src/memory/docs.mjs 的 memoryTools」 | src/memory/docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 已有 `src/memory/` 段、缺仓根段；memoryTools 在此
430 | §1 表「索引｜src/memory/code-index.mjs」 | src/memory/code-index.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-index.mjs | 代码索引实现在 memory 子目录
431 | §1 表「索引｜… · code-sync.mjs」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 同格并列的同步档
432 | §1 表「索引｜… ↔ src/indexer.mjs」 | src/indexer.mjs | 1 | R4 退役件 | 形 2：删该侧件名与路径，改叙为「VSC 侧索引面」并写明核内两份分担（代码索引面 ∥ 同步面） | 全仓零命中；被并面两份，改指任一份 = 把「一侧对一份」写成「一侧对半份」
433 | §1 表「索引｜… · index-bin.mjs」 | index-bin.mjs | 1 | R1 | 补仓根 → thincoder-core/index-bin.mjs | 索引二进制入口在核根
434 | §1 表「索引｜… · index-discover.mjs」 | index-discover.mjs | 1 | R1 | 补仓根 → thincoder-core/index-discover.mjs | 走查规则档在核根
435 | §1 表「索引｜… · tools/code.mjs（端壳改指面）」 | tools/code.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/tools/code.mjs | 句自注「= 端壳改指面」⇒ 指 VSC 那份端壳
436 | §1 表「索引｜…核面现体 … file-walk.mjs」 | file-walk.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-walk.mjs | 句说核面现体在 memory 子目录
437 | §1 表「索引｜… tools/code.mjs = 端壳改指面」 | tools/code.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/tools/code.mjs | 同格第二处，句内自注「端壳」，独立计
438 | §1 表「嵌入｜src/embedding.mjs」 | src/embedding.mjs | 1 | R1 | 补仓根 → thincoder-core/embedding.mjs | 嵌入实现在核根
439 | §1 表「team 层同步｜src/git/gitmem.mjs」 | src/git/gitmem.mjs | 1 | R1 | 补仓根 → thincoder-core/git/gitmem.mjs | git 同步面在核 git 子目录
440 | §1 表「子命令面｜src/cli/memory-command.mjs」 | src/cli/memory-command.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/cli/memory-command.mjs | 子命令面住 CLI 包
441 | §2.1 表「75｜embedding.mjs（席位件名）」 | embedding.mjs | 1 | R1 | 补仓根 → thincoder-core/embedding.mjs | 席位件名 = 合并后的核内那一份
442 | §2.1 表「75｜…分叉 ＝ VSC 缺 60s 超时（src/embedding.mjs）」 | src/embedding.mjs | 1 | R1 | 补仓根 → thincoder-core/embedding.mjs | 已有 `src/` 段缺仓根段；同格第二处
443 | §2.1 表「82｜memory.mjs（席位件名）」 | memory.mjs | 1 | R1 | 补仓根 → thincoder-core/memory.mjs | 席位 = 合并后的核内转口档
444 | §2.1 表「82｜…CLI 21 行转口 + src/memory/** 8 档」 | memory.mjs | 1 | R1 | 补仓根 → thincoder-core/memory.mjs | 同格第二处讲 CLI 侧的转口形，同一份档
445 | §2.1 表「82｜…↔ VSC memory.mjs + memory-tool.mjs」 | memory-tool.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/memory-tool.mjs | 句明写「VSC」⇒ 端侧那份（盘上在盘）
446 | §2.1 表「82｜…FTS5 src/memory/schema.mjs」 | src/memory/schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 已有 `src/memory/` 段、缺仓根段
447 | §2.1 表「82｜…↔ VSC memory.mjs」 | src/memory.mjs | 1 | R1 | 补仓根 → thincoder-core/memory.mjs | 已有 `src/` 段缺仓根段；与 443 同指
448 | §2.2 表「133｜…+ memory-tool.mjs」 | memory-tool.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/memory/memory-tool.mjs | 同格左端已写 thincoder-core/memory.mjs ⇒ 核内工具面
449 | §2.2 表「133｜…FTS5 src/memory/schema.mjs」 | src/memory/schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 分叉论证里的库结构档
450 | §2.2 表「134｜src/memory/docs.mjs（memoryTools）」 | src/memory/docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 工具面住所档
451 | §2.2 表「134｜…工具面住 memory/docs.mjs 的 memoryTools」 | memory/docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 同格第二处，叙述拆档位置
452 | §2.2 表「135｜src/cli/memory-command.mjs」 | src/cli/memory-command.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/cli/memory-command.mjs | CLI shell 子命令面
453 | §2.2 表「136｜src/memory/code-index.mjs」 | src/memory/code-index.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-index.mjs | 代码索引面
454 | §2.2 表「136｜… + code-sync.mjs」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 同格并列的同步档
455 | §2.2 表「136｜…↔ src/indexer.mjs」 | src/indexer.mjs | 1 | R4 退役件 | 形 2：同 432（删该侧件名与路径，改叙为描述并写明核内两份分担） | 同 432：全仓零命中，被并面两份
456 | §2.2 表「136｜…VSC .thincoder/index/{manifest.json,vectors.bin}」 | manifest.json | 1 | R3 因门改叙 | 散文改「索引清单文件」，原件名移入围栏块 | 端侧索引数据目录里的文件格式件，仓内那份同名档不是它
457 | §2.2 表「137｜（CLI 无切分档）↔ src/index-bin.mjs」 | src/index-bin.mjs | 1 | R1 | 补仓根 → thincoder-core/index-bin.mjs | 已有 `src/` 段缺仓根段
458 | §2.2 表「137｜… · index-discover.mjs」 | index-discover.mjs | 1 | R1 | 补仓根 → thincoder-core/index-discover.mjs | 走查规则档
459 | §2.2 表「137｜…VSC thincoder-vscode/src/index-discover.mjs 自述 CLI-aligned」 | thincoder-vscode/src/index-discover.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/index-discover.mjs | 端侧那份已不在盘；同名活档只有核侧一份，改指不改语义
460 | §2.2 表「168｜src/git/gitmem.mjs」 | src/git/gitmem.mjs | 1 | R1 | 补仓根 → thincoder-core/git/gitmem.mjs | team 层 git 同步面
461 | §2.3 表「VSC tools/code.mjs ↔ CLI memory/docs.mjs 的 codeSearchTool」 | memory/docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 句说端壳随 #82 归到这份工具面档
462 | §3.1 表「A1｜memory.mjs（席位 #82）」 | memory.mjs | 1 | R1 | 补仓根 → thincoder-core/memory.mjs | 归一后的核内单源档
463 | §3.1 表「A1｜…实为 CLI src/memory/** 8 档」 | memory.mjs | 1 | R1 | 补仓根 → thincoder-core/memory.mjs | 同格第二处，讲 CLI 侧那一组八档的入口
464 | §3.1 表「A1｜…↔ VSC memory.mjs + memory-tool.mjs」 | memory-tool.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/memory-tool.mjs | 句明写「VSC」⇒ 端侧那份
465 | §3.1 表「A1｜…FTS5（src/memory/schema.mjs）」 | src/memory/schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 库结构档
466 | §4 表「11｜VSC .thincoder/index/{manifest.json,vectors.bin}」 | manifest.json | 1 | R3 因门改叙 | 散文改「索引清单文件」，原件名移入围栏块 | 旧索引文件格式，已入册为「不再写、零迁移」
467 | §4.1 表「2｜VSC personal = 仓内目录（thincoder-vscode/src/memory.mjs）」 | thincoder-vscode/src/memory.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/memory.mjs | 端侧那份已不在盘（合并入核）；同名活档只核侧一份
468 | §4.1 表「2｜CLI personal = …（thincoder-cli/src/config.mjs）」 | thincoder-cli/src/config.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config.mjs | CLI 配置模块已在核根；CLI 包内无此档
469 | §6.3「code_chunks（memory/code-sync.mjs）」 | memory/code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 已有 `memory/` 段、缺仓根段
470 | §6.3「doc_chunks（memory/docs.mjs）」 | memory/docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 同句第二份 embedding 输入面
471 | §6.4「单文件增量…（record-results.mjs 的 FILE_MUTATORS 钩子）」 | record-results.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/record-results.mjs | 钩子住 agent 面
472 | §6.4「doc 索引同步（docs.mjs 的 docSync）」 | docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | docSync 的宿主档（memory 子目录）
473 | §6.5「启动…startup.mjs 启动时 gitSync」 | startup.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/startup.mjs | 启动面住 CLI tui
474 | §6.9「护栏 = isMemoryFaceEnabled()（extension.mjs）前置」 | extension.mjs | 1 | R1 | 补仓根 → thincoder-vscode/extension.mjs | VSC 扩展入口档
475 | §6.10「改前（scan.mjs 的统一追加段）」 | scan.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/scan.mjs | 检索扫描面在 memory 子目录
476 | §6.10「两表 PK 列逐列 NOT NULL（schema.mjs 的 entries 建表段）」 | schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 建表段所在档
477 | §6.11「端装配文件零改…不触 make-agent.mjs」 | make-agent.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/cli/make-agent.mjs | CLI 装配入口
478 | §6.11「…/ embed-config.mjs 等端装配文件」 | embed-config.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/embed-config.mjs | VSC 端嵌入配置装配档
479 | §6.13「面表…（memory/schema.mjs 的触发器段）」 | memory/schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | FTS 触发器段所在档
480 | §6.14「声明键…schema ∕ 校验 = manifest-schema.mjs」 | manifest-schema.mjs | 1 | R1 | 补仓根 → thincoder-core/manifest-schema.mjs | 清单 schema 的宿主档
481 | §6.14「…投影出口 = conventions.mjs loadPro…」 | conventions.mjs | 1 | R1 | 补仓根 → thincoder-core/conventions.mjs | 投影出口函数所在档
482 | §6.14 表「B1｜每回合 docSearch 向量扫描（agent/setup.mjs → memory/docs.mjs）」 | memory/docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 句说扫描落在 docSearch 那份档
483 | §6.14 表「B2｜…（core.mjs · code-sync.mjs · docs.mjs）」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 回填探针的代码侧
484 | §6.14 表「B2｜…同一行第三份 docs.mjs」 | docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 同格并列的 doc 侧，独立计
485 | §6.14 表「B5｜每写一次 reindexFile（agent/record-results.mjs）」 | agent/record-results.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/record-results.mjs | 已有 `agent/` 段、缺仓根段
486 | §6.14 表「B6｜…（CLI tui/startup.mjs ∥ 桌面 … ∥ VSC panel-index.mjs）」 | tui/startup.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/startup.mjs | 已有 `tui/` 段、缺仓根与包段
487 | §6.14 表「B6｜…VSC panel-index.mjs」 | panel-index.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/panel-index.mjs | 端侧索引面板档
488 | §6.14 表「B6｜…（code-sync.mjs ∕ docs.mjs 的收尾段）」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 收尾 stale 删除循环所在档
489 | §6.14 表「B6｜…同上 ∕ docs.mjs」 | docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 同格第二份档
490 | §6.14 表「B6｜改：收尾循环加让出（memory/sync-tail.mjs）」 | memory/sync-tail.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sync-tail.mjs | 让出原语与收尾同源档
491 | §6.14 表「B6｜…（code-sync.mjs 收尾段第二处）」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 同格第二处，独立计
492 | §6.14 表「B6｜…（docs.mjs 收尾段第二处）」 | docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 同格第三处，独立计
493 | §6.14 表「B7｜读面内嵌写（core.mjs ∕ code-sync.mjs ∕ docs.mjs）」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 失效写面的代码侧
494 | §6.14 表「B7｜…同格第四节 docs.mjs」 | docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 同格并列的 doc 侧
495 | §6.14 表「B8｜createMemory 开库（memory/schema.mjs 的开库段）」 | memory/schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 开库段所在档
496 | §6.14「机制现体 = memory/sync-tail.mjs 的 createRowBudget」 | memory/sync-tail.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sync-tail.mjs | WARN ∕ CAP 单源档
497 | §6.14「…消费 = code-sync.mjs ∕ docs.mjs」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 同句第一消费面
498 | §6.14「…消费 ∕ docs.mjs」 | docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 同句第二消费面
499 | §6.14「枚举对账…（file-walk.mjs 的点段规则）」 | file-walk.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-walk.mjs | 点段规则所在档
500 | §6.14「…既有调用点零改；schema.mjs …」 | schema.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/schema.mjs | 名表常量块的宿主档
501 | §6.14「三路同谓词…walk 双守卫（file-walk.mjs）」 | file-walk.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-walk.mjs | walk 双守卫的所在档
502 | §6.14「三路同谓词…git 列面（file-list.mjs）」 | file-list.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-list.mjs | git 列面所在档
503 | §6.14「三路同谓词…gitSync diff 缝（code-sync.mjs）」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | diff 缝的所在档
504 | §6.14「三路同谓词…单文件缝（code-sync.mjs 的 reindexFile 缝）」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 同句第二处：reindexFile 缝，独立计
505 | §6.14「② 同步收尾自然收敛…sync-tail.mjs 的 sweepStaleRows」 | sync-tail.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sync-tail.mjs | sweepStaleRows 的宿主档
506 | §6.14「判假围栏名不入表；tools/tree.mjs ∥ index-discover.mjs」 | tools/tree.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/tree.mjs | 各自独立面的工具档
507 | §6.14「…∥ index-discover.mjs ∥ 桌面 at-complete.mjs」 | index-discover.mjs | 1 | R1 | 补仓根 → thincoder-core/index-discover.mjs | 同句第二份独立面
508 | §6.14「…桌面 at-complete.mjs」 | at-complete.mjs | 1 | R1 | 补仓根 → thincoder-desktop/src/main/at-complete.mjs | 桌面侧补全面所在档
509 | §6.14「④ 显示面随动…（setup.mjs 读常量）」 | setup.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent/setup.mjs | 同句后半明写 thincoder-core/agent/setup.mjs，两处同指
510 | §6.14「…B4 文件行上界同源（repomap.mjs LIMIT WARN+1）」 | repomap.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/tools/repomap.mjs | B4 读的是核侧索引树工具
511 | §6.14「L-④…（cmd-reindex.mjs 触发面）」 | cmd-reindex.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/cmd-reindex.mjs | `/reindex` 触发面住 CLI tui
512 | §6.14 表「探针 ∕ 树态｜sweep.mjs probeOriginPath」 | sweep.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sweep.mjs | 鬼行探针的宿主档
513 | §6.14 表「备份｜sweep.mjs takeBackup」 | sweep.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sweep.mjs | 备份判据同在该档
514 | §6.14 表「计数｜sweep.mjs originCounts」 | sweep.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sweep.mjs | 写后回读基准同在该档
515 | §6.14「落点 = ② 桌面新档 memory-maintenance.mjs」 | memory-maintenance.mjs | 1 | R1 | 补仓根 → thincoder-desktop/src/main/memory-maintenance.mjs | 惰性转口新档落桌面主进程
516 | §6.14「落点定死…（file-list.mjs git 列面 ∥ walk 剪枝）」 | file-list.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-list.mjs | 面① 接线的第一处
517 | §6.14「…· code-sync.mjs 的 diff 缝」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 面① 接线的 diff 缝
518 | §6.14「…· code-sync.mjs 的 reindexFile 缝（同句第二处）」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 同句第二处，独立计
519 | §6.14「+ 收尾保护位（sync-tail.mjs 的 sweepStaleRows）」 | sync-tail.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sync-tail.mjs | 保护位实现所在档
520 | §6.14「③ 若落文件列面默认（file-list.mjs 面）」 | file-list.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-list.mjs | 被否落点的档名，仍指同一份
521 | §6.14「声明值…declaration.mjs 投影新增 batchRecords」 | declaration.mjs | 1 | R1 | 补仓根 → thincoder-core/declaration.mjs | 声明投影的宿主档
522 | §6.14「正例：docs/batches/x.md ∥ docs/batches」 | docs/batches/x.md | 1 | R2 举例 | 正例整行移入围栏块 | 判假围栏谓词的正例样例（占位词干 x 带目录段），盘上无此档是构造意图
523 | §6.14「正例：… ∥ a/docs/batches/b.md」 | a/docs/batches/b.md | 1 | R2 举例 | 同 522：正例入围栏块 | 同一谓词的另一条正例，构造路径
524 | §6.14「判假围栏：docs/batchesx/x.md」 | docs/batchesx/x.md | 1 | R2 举例 | 判假样例入围栏块 | 构造「同名前缀但不是该段」的反例
525 | §6.14「判假围栏：… docs/batch/x.md」 | docs/batch/x.md | 1 | R2 举例 | 判假样例入围栏块 | 构造「少一个字母」的反例
526 | §6.14「判假围栏：… doc/batches/x.md」 | doc/batches/x.md | 1 | R2 举例 | 判假样例入围栏块 | 构造「单数形」的反例
527 | §6.14「判假围栏：… docsX/batches/x.md」 | docsX/batches/x.md | 1 | R2 举例 | 判假样例入围栏块 | 构造「大小写变体」的反例
528 | §6.14「判假围栏：… batches/x.md（约定段单段）」 | batches/x.md | 1 | R2 举例 | 判假样例入围栏块 | 构造「缺约定段」的反例
529 | §6.14「可见面退场…（memory/docs.mjs docSearch）」 | memory/docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 检索函数 docSearch 的宿主档
530 | §6.14「…∥ memory/code-search.mjs codeSearch」 | memory/code-search.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-search.mjs | 同句第二检索函数所在档
531 | §6.14「写入面（收录）① listProjectFiles（memory/file-list.mjs）」 | memory/file-list.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-list.mjs | git 列面所在档
532 | §6.14「…② gitSync diff 缝（code-sync.mjs）」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | diff 缝
533 | §6.14「…③ reindexFile 单文件缝（code-sync.mjs）第二处」 | code-sync.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-sync.mjs | 同句第二处，独立计
534 | §6.14「walk 径口径…MAX_WALK_FILES 只计收纳文件——file-walk.mjs」 | file-walk.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-walk.mjs | 预算计数的宿主档
535 | §6.14「挂接 = file-walk.mjs 新增可选 isInScope」 | file-walk.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/file-walk.mjs | 同段第二处：新增可选参的挂接点，独立计
536 | §6.14「读面（存量行退场）…docSearch（docs.mjs）」 | docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 准入位第一处
537 | §6.14「…codeSearch（code-search.mjs）」 | code-search.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/code-search.mjs | 准入位第二处
538 | §6.14「收尾保护位（sync-tail.mjs 的 sweepStaleRows）」 | sync-tail.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sync-tail.mjs | 范围外短路的实现点
539 | §6.14「理由：同步收尾删除无备份（sync-tail.mjs 的 sweepStaleRows）」 | sync-tail.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sync-tail.mjs | 同档另一处引用，独立计
540 | §7 表「D-MEM8｜展开器住新模块 expand-home.mjs」 | expand-home.mjs | 1 | R1 | 补仓根 → thincoder-core/expand-home.mjs | 新模块落核根
541 | §7 表「D-MEM8｜config.mjs 已近硬限」 | config.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/config.mjs | 句说它近硬限并已有拆分档 = 核配置档
542 | §7 表「D-MEM33｜自愈轮（maintain.mjs maintainMemory）」 | maintain.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/maintain.mjs | 单引擎单入口的宿主档
543 | §7 表「D-MEM42｜…（sync-tail.mjs 的 sweepStaleRows）」 | sync-tail.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/sync-tail.mjs | 同档在决策表里的第三次引用，独立计
```

**序 10 表尾核对**：116 行覆盖 116 处（行内处数逐行 = 1，合计 116 = §2.4 顺序表该档处数）。

**序 11 · `docs/core/design/CORE-UNIFICATION.md`（171 处 · 第 1 段 序 544–633，90 行）**

本档的两类多出形，先写在这里，实施席照此判：

- **端侧段路径已死、核侧同名活档在盘** ⇒ `R4 形 1 改指`（改到核侧那一份），**不补成端侧路径**——那一份不在盘。
- **端侧独有件、且全仓零同名活档** ⇒ `R4 形 2`（删该清单项），**不猜「它并进了哪」**。

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
544 | §2.1 B3「VSC 产物 = 扩展根内运行期文件…main: ./extension.mjs」 | ./extension.mjs | 1 | R1 | 改为仓根形 → thincoder-vscode/extension.mjs | `./` 相对写法依赖引用方目录；仓根形不依赖
545 | §2.1 B4「槽位加载面…CLI thincoder-cli/src/prompt-overlays.mjs」 | thincoder-cli/src/prompt-overlays.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/prompt-overlays.mjs | CLI 包内无此档；同名活档只在核根
546 | §2.1 B4「…VSC thincoder-vscode/src/prompt-overlays.mjs」 | thincoder-vscode/src/prompt-overlays.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/prompt-overlays.mjs | 端侧那份不在盘（提示面归核）；核侧同名档在盘
547 | §2.1 B9「VSC 对侧住不同相对路径 thincoder-vscode/src/agent-tools/async-discard.mjs」 | thincoder-vscode/src/agent-tools/async-discard.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/agent-tools/async-discard.mjs | 端侧那一份不在盘；核侧同名档在盘
548 | §2.1 B12「仓根无 package.json、无根 lock」 | package.json | 1 | R2 泛指 | 改叙为「仓根无清单档」，原件入围栏块 | 这句断言的是「仓根没有」，补成某一份等于把否定句变成指称
549 | §2.1 B12「两产品各有 package-lock.json」 | package-lock.json | 1 | R2 泛指 | 改叙为「两产品各持一份 lock」，原件入围栏块 | 说的是两个产品包各一份，不是某一份
550 | §2.1 B16「配置：CLI thincoder-cli/src/config.mjs（496 行）」 | thincoder-cli/src/config.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config.mjs | CLI 包内无此档；配置模块已归核
551 | §2.1 B16「…+ config-migrate.mjs（70）」 | config-migrate.mjs | 1 | R1 | 补仓根 → thincoder-core/config-migrate.mjs | CLI 侧那一组的档都在核根，迁移件同
552 | §2.1 B16「↔ VSC thincoder-vscode/src/config.mjs（190）」 | thincoder-vscode/src/config.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config.mjs | 端侧那份不在盘；同名活档在核根
553 | §2.1 B16「…+ config-io.mjs（470）」 | config-io.mjs | 1 | R1 | 补仓根 → thincoder-core/config-io.mjs | 读写 IO 件在核根
554 | §2.1 B16「…+ config-migrate.mjs（185）」 | config-migrate.mjs | 1 | R1 | 补仓根 → thincoder-core/config-migrate.mjs | 同句第二处（端侧读数 185），同一份档
555 | §2.1 B16「…+ config-presets.mjs（40）」 | config-presets.mjs | 1 | R1 | 补仓根 → thincoder-core/config-presets.mjs | 预设件在核根
556 | §2.1 B16「…+ config-consult.mjs（78）」 | config-consult.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名活档，且无同名对位物可改指
557 | §2.1 B16「…+ config-mcp.mjs（71）」 | config-mcp.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/config-mcp.mjs | 端侧 MCP 配置件仍在盘（端特有面）
558 | §2.1 B16「…+ embed-config.mjs（51）」 | embed-config.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/embed-config.mjs | 端侧嵌入配置件在盘
559 | §2.1 B16「…+ extension/config-watch.mjs（77）」 | extension/config-watch.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/config-watch.mjs | 已有 `extension/` 段、缺仓根与 `src` 段
560 | §2.1 B16「会话管理：CLI … session-slots.mjs（492）」 | session-slots.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/session-slots.mjs | CLI 组这一份；端侧另有同名档，在 VSC 组另判
561 | §2.1 B16「… session-store.mjs（441）」 | session-store.mjs | 1 | R1 | 补仓根 → thincoder-core/session-store.mjs | 会话存储在核根
562 | §2.1 B16「… session-gc.mjs（221）」 | session-gc.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/session-gc.mjs | CLI 组那一份（221 行读数与它对）
563 | §2.1 B16「… session-segments.mjs（100）」 | session-segments.mjs | 1 | R1 | 补仓根 → thincoder-core/session-segments.mjs | 段切分件在核根
564 | §2.1 B16「… session-guard.mjs（59）」 | session-guard.mjs | 1 | R1 | 补仓根 → thincoder-core/session-guard.mjs | 守卫件在核根
565 | §2.1 B16「… session-migrate.mjs（47）」 | session-migrate.mjs | 1 | R1 | 补仓根 → thincoder-core/session-migrate.mjs | 迁移件在核根
566 | §2.1 B16「… session-rename.mjs（38）」 | session-rename.mjs | 1 | R1 | 补仓根 → thincoder-core/session-rename.mjs | 改名件在核根
567 | §2.1 B16「↔ VSC src/extension/session-io.mjs（436）」 | src/extension/session-io.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/session-io.mjs | 已有 `src/extension/` 段、缺仓根段
568 | §2.1 B16「…+ session-slots.mjs（399）」 | session-slots.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-vscode/src/extension/session-slots.mjs | 这一处在 VSC 组（399 行读数与端侧那份对）
569 | §2.1 B16「…+ panel-session.mjs（338）」 | panel-session.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/panel-session.mjs | 端侧面板件
570 | §2.1 B16「…+ session-slot-write.mjs（178）」 | session-slot-write.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/extension/session-slot-write.mjs | VSC 组的槽写件
571 | §2.1 B16「…+ session-gc.mjs（142）」 | session-gc.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/extension/session-gc.mjs | 同句第二处（142 行）指端侧那份
572 | §2.1 B16「记忆：↔ VSC src/memory.mjs（273）」 | src/memory.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/memory.mjs | VSC 那份不在盘（记忆面归一入核）；同名活档在核根
573 | §2.1 B16「…+ memory-tool.mjs（386）」 | memory-tool.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/memory-tool.mjs | 端侧工具面那份在盘
574 | §2.1 B18「仅 CLI 6（bash.mjs …）」 | bash.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/bash.mjs | 清单名现在住在核 tools 面
575 | §2.1 B18「仅 CLI 6（… checklist-sync.mjs …）」 | checklist-sync.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名活档；清单项只承担「它是哪一份」的坐标
576 | §2.1 B18「仅 CLI 6（… edit-batch.mjs …）」 | edit-batch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/edit-batch.mjs | 批编辑工具在核 tools 面
577 | §2.1 B18「仅 CLI 6（… glob-dialect.mjs …）」 | glob-dialect.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/glob-dialect.mjs | 方言校验件在核 tools 面
578 | §2.1 B18「仅 CLI 6（… patch.mjs …）」 | patch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/patch.mjs | 补丁工具在核 tools 面
579 | §2.1 B18「仅 CLI 6（… repomap.mjs）」 | repomap.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/tools/repomap.mjs | 这一处在「仅 CLI」组，指核侧那份工具
580 | §2.1 B18「仅 VSC 12（checkpoint.mjs …）」 | checkpoint.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/agent-tools/checkpoint.mjs | 端侧那份不在盘；同名工具活档在核 agent-tools
581 | §2.1 B18「仅 VSC 12（… code.mjs …）」 | code.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/tools/code.mjs | 句说「仅 VSC」⇒ 端侧那份（在盘）
582 | §2.1 B18「仅 VSC 12（… context.mjs …）」 | context.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-vscode/src/tools/ide.mjs | §2.13.4 ④ 明写「ide.mjs 已落——自 context.mjs 改名」
583 | §2.1 B18「仅 VSC 12（… edit-fuzzy-match.mjs …）」 | edit-fuzzy-match.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名活档
584 | §2.1 B18「仅 VSC 12（… edit-line-params.mjs …）」 | edit-line-params.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名活档
585 | §2.1 B18「仅 VSC 12（… file-edit.mjs …）」 | file-edit.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名活档
586 | §2.1 B18「仅 VSC 12（… focus.mjs …）」 | focus.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/focus.mjs | 端侧焦点工具在盘
587 | §2.1 B18「仅 VSC 12（… hashline-edit.mjs …）」 | hashline-edit.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名活档
588 | §2.1 B18「仅 VSC 12（… more-file.mjs …）」 | more-file.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名活档
589 | §2.1 B18「仅 VSC 12（… read_image.mjs …）」 | read_image.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名档；工具重命名后无同名件
590 | §2.1 B18「仅 VSC 12（… shell.mjs …）」 | shell.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/shell.mjs | 端侧 shell 工具在盘
591 | §2.1 B18「仅 VSC 12（… wait_for.mjs）」 | wait_for.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名活档
592 | §2.1 B18「…相似度最高仅 0.256（patch.mjs ↔ …）」 | patch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/patch.mjs | 相似度对照里的左项（同 578 那份档）
593 | §2.1 B18「…↔ more-file.mjs）」 | more-file.mjs | 1 | R4 退役件 | 形 2：删该对照项 | 全仓零同名活档；对照里的右项无档可指
594 | §2.1 B20「CLI thincoder-cli/src/memory/schema.mjs 的建表与 FTS5 段」 | thincoder-cli/src/memory/schema.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/memory/schema.mjs | CLI 包内无 memory 子目录；同名活档在核
595 | §2.1 B20「VSC thincoder-vscode/src/memory.mjs」 | thincoder-vscode/src/memory.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/memory.mjs | 端侧那份不在盘
596 | §2.1 B20「…+ memory-tool.mjs 零 sqlite 用法」 | memory-tool.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/memory-tool.mjs | 句说的是 VSC 侧的零 sqlite 用法
597 | §2.1 B20「同路径对 memory.mjs j = 0.0093」 | memory.mjs | 1 | R1 | 补仓根 → thincoder-core/memory.mjs | 同路径对的核侧那一份
598 | §2.1 B20「源 = …「Source Code: sqlite.js Added in: v22.5.0」」 | sqlite.js | 1 | R3 因门改叙 | 逐字引文整段移入围栏块 | Node 官网页里的源码件名，不是仓内档；悬着挡门
599 | §2.1 B20「VS Code 1.85.0 的 package.json 实证」 | package.json | 1 | R3 因门改叙 | 散文改「VS Code 自身的清单档」，原件入围栏块 | 引的是上游仓库的清单档，仓内那份不是它
600 | §2.2「已撤面…core-link.mjs（落 scripts/）」 | core-link.mjs | 1 | R4 退役件 | 形 2：删该坐标项，「整条垫片面不存在」判据留 | 该件按裁定「不得产生」，补路径等于给它一个存在形式
601 | §2.2「已撤面…package.mjs（落 thincoder-vscode/scripts/）」 | package.mjs | 1 | R4 退役件 | 形 2：删该坐标项 | 同上；零命中且不得产生
602 | §2.2「已撤面…仓根 workspace package.json」 | package.json | 1 | R2 泛指 | 改叙为「仓根 workspace 清单档」，原件入围栏块 | 说的是「仓根那一层不应有」，不是某一份
603 | §2.2「解析面 = 核内 prompt-files.mjs」 | prompt-files.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-files.mjs | 提示词解析面的核内单源
604 | §2.2.1「源码双证（npm 内建源 libnpmpublish 的 publish.js——非本仓档）」 | publish.js | 1 | R3 因门改叙 | 散文保留「非本仓档」判定，件名入围栏块 | 上游 npm 源内件名；本档自己已注明非本仓档
605 | §2.2.1 R6「ERROR invalid relative path: extension/../package.json」 | extension/../package.json | 1 | R3 因门改叙 | 报错原文整段移入围栏块 | 这是 vsce 的报错字面，不是仓内路径
606 | §2.2.1 R7「产物条目内含 extension/node_modules/@thincoder/core/{package.json,…}」 | package.json | 1 | R3 因门改叙 | 产物条目串整段移入围栏块 | npm 包产物内的条目名，本仓无此路径
607 | §2.2.1 R7「…{package.json,index.mjs,util.mjs}」 | index.mjs | 1 | R3 因门改叙 | 同 606：产物条目串入围栏块 | 同上；包内入口名
608 | §2.2.1 R7「…index.mjs,util.mjs}」 | util.mjs | 1 | R3 因门改叙 | 同 606 | 同上；包内工具名
609 | §2.2.1 R8「① devDependencies 一并进 vsix」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档的 devDependencies」，原件入围栏块 | 讲的是「清单档里 devDependencies 的去留」，不是某一份
610 | §2.2.1 R8「…③ junction 缺 --follow-symlinks（package-lock.json 面）」 | package-lock.json | 1 | R2 泛指 | 改叙为「各包 lock」，原件入围栏块 | 同段讲的是 lock 与链接形态
611 | §2.3.3「槽位加载面（prompt-overlays.mjs）…各改一行级指向」 | prompt-overlays.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-overlays.mjs | 槽位加载面已归核
612 | §2.4「单端列表必须逐档实读：CLI session-gc.mjs（根）」 | session-gc.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/session-gc.mjs | 句自注「（根）」= 核根那一份
613 | §2.5 表 180「CLI tui/**（67 档）+ tui.mjs」 | tui.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui.mjs | CLI 入口档在 src 下
614 | §2.5 表 181「CLI acp.mjs + acp/**（3 档）」 | acp.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/acp.mjs | ACP 客户端档在 src 下
615 | §2.5 表 182「CLI 其余单端杂项（completions.mjs …）」 | completions.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/completions.mjs | 补全面在 CLI src
616 | §2.5 表 182「…（crash-reports.mjs …）」 | crash-reports.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/crash-reports.mjs | 崩溃报告面在 CLI src
617 | §2.5 表 182「…（heap-watch.mjs …）」 | heap-watch.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-cli/src/heap-watch.mjs | 这一行在「CLI 单端杂项」组 ⇒ CLI 那份
618 | §2.5 表 182「…（upgrade.mjs …）」 | upgrade.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/upgrade.mjs | 自升级面在 CLI src
619 | §2.5 表 182「…（distill.mjs）」 | distill.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/distill.mjs | 蒸馏入口在 CLI src
620 | §2.5 注①「顶层 thincoder-cli/src/markdown.mjs（…）——共享逻辑 ⇒ 归核内」 | thincoder-cli/src/markdown.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/markdown.mjs | CLI src 下无此档（逻辑面已归核）；同段自己写了核侧路径
621 | §2.5 注①「…被核内 memory/core.mjs · memory/delete.mjs · rules.mjs 消费」 | memory/delete.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/delete.mjs | 已有 `memory/` 段、缺仓根段
622 | §2.5 注①「…· rules.mjs 消费」 | rules.mjs | 1 | R1 | 补仓根 → thincoder-core/rules.mjs | 规则面在核根
623 | §2.5 注③「session.mjs re-export 保调用方单一路径」 | session.mjs | 1 | R1（候选 4） | 补仓根 → thincoder-core/session.mjs | 讲的是核内会话档的 re-export（另三份同名档是 acp / browser / server 面）
624 | §2.5「渲染面总则…（markdown 面）」 | markdown.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-cli/src/tui/markdown.mjs | 本则讲渲染面两侧各实现；这一处指 TUI 行内渲染那份
625 | §2.5「同名≠同物判据纪律…`markdown.mjs` ✗ 属歧义」 | markdown.mjs | 1 | R2 举例 | 反例写法入围栏块（表格仍可读） | 这一处本身就是「裸名的坏写法」示例，补路径等于把反例改成正例
626 | §2.5 表 180「CLI tui/** + tui.mjs｜68」 | tui.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui.mjs | 裁决表里的同一份入口档
627 | §2.5 表 181「CLI acp.mjs + acp/**｜4」 | acp.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/acp.mjs | 裁决表里的 ACP 档
628 | §2.5 表「CLI 顶层对位档（… advisor.mjs）」 | advisor.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/advisor.mjs | 对位档清单在核面 ⇒ 指编排面那份
629 | §2.5 表「CLI 顶层 markdown.mjs（共享逻辑面）｜归核」 | markdown.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/markdown.mjs | 该格自注「S1 已落 thincoder-core/markdown.mjs」
630 | §2.5 表「CLI mcp/**｜… mcp.mjs → 107 同路径对」 | mcp.mjs | 1 | R1 | 补仓根 → thincoder-core/mcp.mjs | MCP 面在核根
631 | §2.5 表「CLI memory/**｜… memory.mjs → 107 同路径对」 | memory.mjs | 1 | R1 | 补仓根 → thincoder-core/memory.mjs | 记忆面转口在核根
632 | §2.5 表「VSC 顶层单端（… · tools.mjs）｜14」 | tools.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名端侧档；清单项只承担坐标，删项不留规则
633 | §2.5「结论：…归核（markdown.mjs——见上表）」 | markdown.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/markdown.mjs | 结论句点名的归核档
```

**序 11 第 1 段表尾核对**：90 行覆盖 90 处（行内处数逐行 = 1，本段合计 90）。

**序 11 · `docs/core/design/CORE-UNIFICATION.md`（第 2 段 序 634–714，81 行）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
634 | §2.5「④ 桶合计…tui/** + tui.mjs 68」 | tui.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui.mjs | 桶计数里点名的同一份入口档
635 | §2.5「④ 桶合计…acp.mjs + acp/** 4」 | acp.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/acp.mjs | 同句第二份端特有档
636 | §2.5「顶层杂项…VSC tools 的 2 = ide.mjs」 | ide.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/ide.mjs | 端侧 IDE 桥工具在盘
637 | §2.5「…VSC tools 的 2 = … focus.mjs」 | focus.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/focus.mjs | 同句第二份端侧工具
638 | §2.5「边界纪律…归核 1——markdown.mjs」 | markdown.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/markdown.mjs | 该句点名的归核档（同表已写核侧全路径）
639 | §2.5.1 表「甲｜A1–A3｜记忆面（memory.mjs）」 | memory.mjs | 1 | R1 | 补仓根 → thincoder-core/memory.mjs | 记忆面归一后的核内转口
640 | §2.5.1 表「甲｜A4–A5｜config.mjs」 | config.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/config.mjs | 配置模块归核后的那一份
641 | §2.5.1 表「甲｜A7…｜agent.mjs」 | agent.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent.mjs | 同格其余项都在核面 ⇒ 指核侧编排档
642 | §2.6.1「产品 package.json 声明真 semver 范围」 | package.json | 1 | R2 泛指 | 改叙为「各产品包清单档」，原件入围栏块 | 说的是产品包的清单声明这一类
643 | §2.6.1 表 L2「产品 package-lock.json 内 link:true 命中数 = 0」 | package-lock.json | 1 | R2 泛指 | 改叙为「各产品包 lock」，原件入围栏块 | 收口判据按包逐份查，不是某一份
644 | §2.7 表 D-C10「libnpmpublish 的 publish.js 抛 EPRIVATE」 | publish.js | 1 | R3 因门改叙 | 散文保留判定，件名入围栏块 | 上游 npm 源内件名
645 | §2.7 表 D-C12「VSC = publish-all.mjs 段 1 之前」 | publish-all.mjs | 1 | R1 | 补仓根 → thincoder-vscode/scripts/publish-all.mjs | 发布脚本在 VSC scripts 面
646 | §2.7 表 D-C13「解析面 = 核内单一模块 prompt-files.mjs」 | prompt-files.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-files.mjs | 提示词解析单源
647 | §2.11 表 A8「抬高 VSC 引擎下限（engines.vscode 声明）」 | package.json | 1 | R1（候选 20） | 补仓根 → thincoder-vscode/package.json | 引擎下限字段落在 VSC 包自己的清单档
648 | §2.11 表 A8「node:sqlite Added in v22.5.0 … Node.js」 | Node.js | 1 | R3 因门改叙 | 散文改「Node 运行时」，原件名入围栏块 | 运行时名不是仓内档；悬着挡门
649 | §2.12.1 表「配置格式…thincoder-vscode/src/config-io.mjs」 | thincoder-vscode/src/config-io.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config-io.mjs | 端侧那份不在盘；配置读写已归核
650 | §2.12.1 表「…thincoder-cli/src/config-migrate.mjs」 | thincoder-cli/src/config-migrate.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config-migrate.mjs | CLI 包内无此档
651 | §2.12.1 表「…thincoder-vscode/src/config-migrate.mjs」 | thincoder-vscode/src/config-migrate.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config-migrate.mjs | 同格第二处（VSC 侧迁移件），同一份核档
652 | §2.12.1 表「…thincoder-vscode/src/config-io.mjs（第二处）」 | thincoder-vscode/src/config-io.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config-io.mjs | 同格第二次出现，独立计
653 | §2.12.1 表「…thincoder-vscode/src/config-io.mjs（第三处）」 | thincoder-vscode/src/config-io.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config-io.mjs | 同格第三次出现，独立计
654 | §2.12.1 表「输出文案…VSC = thincoder-vscode/locales/zh.json 面」 | zh.json | 1 | R1 | 补仓根 → thincoder-vscode/locales/zh.json | 已有 `locales/` 段、缺仓根段
655 | §2.12.1 表「事件语义…hooks 四事件（thincoder-cli/src/hooks.mjs）」 | thincoder-cli/src/hooks.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/hooks.mjs | CLI src 下无此档；hooks 面已归核
656 | §2.12.2 表 4「agent.engineering 的写盘范围（VSC 双写共享 config.json）」 | config.json | 1 | R3 因门改叙 | 散文改「用户配置文件」，原件入围栏块 | 用户数据目录的配置档
657 | §2.12.2 表 11「VSC .thincoder/index/{manifest.json,vectors.bin} 文件」 | manifest.json | 1 | R3 因门改叙 | 散文改「索引清单文件」，原件入围栏块 | 已退役的索引文件格式件，不是仓内档
658 | §2.12.3 表 2「VSC personal = 仓内目录（thincoder-vscode/src/memory.mjs）」 | thincoder-vscode/src/memory.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/memory.mjs | 端侧那份不在盘（同 §4.1 那处处置）
659 | §2.12.3 表 2「CLI personal = …（thincoder-cli/src/config.mjs）」 | thincoder-cli/src/config.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config.mjs | CLI 包内无此档
660 | §2.12.3 表 3「…thincoder-cli/src/session-migrate.mjs」 | thincoder-cli/src/session-migrate.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/session-migrate.mjs | CLI 包内无此档；迁移件在核根
661 | §2.13.1 表「替换执行 = 核内单点（prompt-files.mjs 原语）」 | prompt-files.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-files.mjs | 注入原语的核内单点
662 | §2.13.2「端侧注入表（两端 src/prompt-injections.mjs）」 | src/prompt-injections.mjs | 1 | R1（候选 3） | 补成两份 → thincoder-cli/src/prompt-injections.mjs ∥ thincoder-vscode/src/prompt-injections.mjs | 句明写「两端」，桌面那份不在此列
663 | §2.13.3 表「seams.describeArgs｜advisor/loop.mjs」 | advisor/loop.mjs | 1 | R1 | 补仓根 → thincoder-core/advisor/loop.mjs | 缝位声明在核 advisor 面
664 | §2.13.3 表「ctx.onQuestion｜…→ agent/dispatch.mjs」 | agent/dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 已有 `agent/` 段、缺仓根段；CLI 现形经它分发
665 | §2.13.3 表「ctx.onPermissionRequest｜agent-tools/consult.mjs」 | agent-tools/consult.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/consult.mjs | 缺通道即静默 false 的四个消费点之一
666 | §2.13.3 表「…｜agent-tools/escalate-async.mjs」 | agent-tools/escalate-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/escalate-async.mjs | 同格第二个消费点
667 | §2.13.3 表「…｜agent-tools/subagent-actions.mjs」 | agent-tools/subagent-actions.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-actions.mjs | 同格第三个消费点
668 | §2.13.3 表「…｜agent-tools/subagent-spawn.mjs」 | agent-tools/subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 同格第四个消费点（手动档子代写路径）
669 | §2.13.3 表「…｜VSC 现形 thincoder-vscode/src/agent/execute-tools.mjs」 | thincoder-vscode/src/agent/execute-tools.mjs | 1 | R4 退役件 | 形 2：删该坐标项 | 全仓零同名档；该格其余说明（缺通道即静默 false）照留
670 | §2.13.3 表「…｜CLI 现形 → agent/dispatch.mjs（第二处）」 | agent/dispatch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch.mjs | 同格第二次出现，独立计
671 | §2.13.3 表「ctx.callbacks.onToken｜agent/spawn-child.mjs」 | agent/spawn-child.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/spawn-child.mjs | 包装转发点在核 agent 面
672 | §2.13.3 表「…｜agent-tools/async-settle.mjs（发射点）」 | agent-tools/async-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/async-settle.mjs | stopped / settled / done 的发射点
673 | §2.13.3 表「opts.schema｜…thincoder-vscode/src/config-io.mjs」 | thincoder-vscode/src/config-io.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config-io.mjs | 端侧那份不在盘（同 649）
674 | §2.13.3 表「config-migrate 注入参数｜核内 config.mjs」 | config.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/config.mjs | 该格自注「核内」「非端侧注入」
675 | §2.13.3「configureTreeResolve（tools/tree.mjs）」 | tools/tree.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/tree.mjs | 已有 `tools/` 段、缺仓根段
676 | §2.13.3「configureProcessTreeKill（tools/execute.mjs）」 | tools/execute.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/execute.mjs | 同句并列的第二份注入桩
677 | §2.13.3「configureGitApproval（tools/git.mjs）」 | tools/git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 审批门桩所在档
678 | §2.13.3「configureLspHost（tools/lsp.mjs）」 | tools/lsp.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/lsp.mjs | 语言服务宿主桩
679 | §2.13.3「configureEditReceipt（tools/edit-diff.mjs）」 | tools/edit-diff.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/edit-diff.mjs | 回执形态桩
680 | §2.13.3「configureSkillLoader（agent-tools/skill.mjs）」 | agent-tools/skill.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/skill.mjs | 技能加载桩
681 | §2.13.3「configureEngMirror（agent-tools/eng.mjs）」 | agent-tools/eng.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/eng.mjs | 工程镜像桩
682 | §2.13.3「configureVerifyDiagnostics（agent-tools/verify.mjs）」 | agent-tools/verify.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/verify.mjs | 诊断段桩
683 | §2.13.4 表 #98「agent-tools/async-settle.mjs（VSC interrupt 豁免面）」 | agent-tools/async-settle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/async-settle.mjs | 缝位表的行主体，核内已闭合
684 | §2.13.4 表 #99「agent-tools/subagent.mjs（VSC 无 panel 动作）」 | agent-tools/subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 核内含 panel 的那份工具档
685 | §2.13.4 表 #99「…需工具登记面剔除缝（agent-tools/subagent.mjs）」 | agent-tools/subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 同格第二次出现，独立计
686 | §2.13.4 表 #175「auto-think.mjs ↔ VSC 推理档位面」 | auto-think.mjs | 1 | R1 | 补仓根 → thincoder-core/auto-think.mjs | 核内自动难度分级件
687 | §2.13.4 表 #143「端侧派生面消费 = thincoder-vscode/src/config.mjs」 | thincoder-vscode/src/config.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/config.mjs | 端侧那份不在盘
688 | §2.13.4 表 #56「tools/tree.mjs cwd 归一开关」 | tools/tree.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/tree.mjs | 缝位表行主体（同 675 那份）
689 | §2.13.4 表 #57「tools/execute.mjs 树杀能力」 | tools/execute.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/execute.mjs | 超时 / abort 唯一杀点所在档
690 | §2.13.4 表 #59「tools/git.mjs 审批门」 | tools/git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | gate 非空即拒执行的实现档
691 | §2.13.4 表 #61「tools/linter.mjs 可中断执行」 | tools/linter.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/linter.mjs | 检查器经 runCommand 的执行面
692 | §2.13.4 表 #66「tools/lsp.mjs 宿主语言服务径」 | tools/lsp.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/lsp.mjs | 回核内 JSON-RPC 径的实现档
693 | §2.13.4 表 #68「tools/file.mjs 编辑器编辑径」 | tools/file.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/file.mjs | 写路径主档
694 | §2.13.4 表 #68「…tools/write-path.mjs——8 写点全经注入面」 | tools/write-path.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/write-path.mjs | 写面单点注入档
695 | §2.13.4 表 #69「tools/edit-diff.mjs 回执形态」 | tools/edit-diff.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/edit-diff.mjs | 单 / 数组形态共用的回执档
696 | §2.13.4 表 #91「agent-tools/eng.mjs 持久化镜像」 | agent-tools/eng.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/eng.mjs | 状态翻转后调用的实现档
697 | §2.13.4 表 #96「agent-tools/verify.mjs 编辑器诊断段」 | agent-tools/verify.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/verify.mjs | 双面（信息段 + 执行方式）的实现档
698 | §2.13.4 表 #170「skills.mjs fs 面」 | skills.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/skills.mjs | 该格自注核内 skills.mjs；端侧那份是技能面板面
699 | §2.13.4 表 #172「peer-instances.mjs 端判别面」 | peer-instances.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/peer-instances.mjs | 该格自注「核内硬编码 cmdline 判别」
700 | §2.13.4 ④「…VSC tools/ide.mjs（已落——自 context.mjs 改名）」 | context.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-vscode/src/tools/ide.mjs | 括号里自己写了改名事实；旧名不在盘
701 | §2.13.4 ④「…VSC tools/focus.mjs」 | tools/focus.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/focus.mjs | 端特有面（无注入位）的登记项
702 | §2.13.5 表「注入面｜工具写面单点 tools/write-path.mjs」 | tools/write-path.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/write-path.mjs | 8 写点全改调的单点
703 | §2.13.5 表「验收｜…白名单 tools/write-path.mjs」 | tools/write-path.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/write-path.mjs | 机检白名单里的那份档
704 | §2.13.5 表「验收｜…已登记豁免 tools/checklist-sync.mjs」 | tools/checklist-sync.mjs | 1 | R4 退役件 | 形 2：删该豁免项 | 全仓零命中；豁免条目指向已不在盘的档
705 | §2.13.6「替换机制 = 核内缝（prompt-files.mjs 原语…）」 | prompt-files.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-files.mjs | 注入原语所在档
706 | §2.13.6「#68 / #63（写路径）（tools/write-path.mjs）」 | tools/write-path.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/write-path.mjs | 写路径条的落点档
707 | §2.13.6「④ 执行面第二道门不变（tools/file.mjs 能力拒绝）」 | tools/file.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/file.mjs | 能力拒绝所在档
708 | §2.13.7「写 API 命中集合 = 白名单 tools/write-path.mjs」 | tools/write-path.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/write-path.mjs | 命中集合的白名单档
709 | §2.13.7「…+ 已登记豁免 tools/checklist-sync.mjs」 | tools/checklist-sync.mjs | 1 | R4 退役件 | 形 2：删该豁免项 | 同 704；该节另一处，独立计
710 | §2.13.7「落地形态：tools/write-path.mjs 单点」 | tools/write-path.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/write-path.mjs | 落地形态的单点档
711 | §2.13.8「替换执行 = 核内单点（prompt-files.mjs 注入原语）」 | prompt-files.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-files.mjs | 候选 1 选中形态的落点档
712 | §2.13.8 表 1「核内缝：prompt-files.mjs 增注入原语」 | prompt-files.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-files.mjs | 表内第一处
713 | §2.13.8 表 1「…四装配面调用期应用」 | prompt-files.mjs | 1 | R1 | 补仓根 → thincoder-core/prompt-files.mjs | 同格第二次出现，独立计
714 | §2.13.8 表 3「两调用点（…· advisor/loop.mjs）同经此函数」 | advisor/loop.mjs | 1 | R1 | 补仓根 → thincoder-core/advisor/loop.mjs | 工具描述面第二个调用点所在档
```

**序 11 表尾核对**：两段合计 171 行覆盖 171 处（90 + 81；行内处数逐行 = 1，合计 171 = §2.4 顺序表该档处数）。

**序 12 · `docs/core/design/TOOLS.md`（303 处 · 第 1 段 序 715–814，100 行）**

本档同一套判法，先写在这里：`src/tools/X` ∥ `src/agent-tools/X` 是端侧旧路径，**同名活档在核面** ⇒ 补仓根（核侧）；**端侧独有、全仓零同名** ⇒ `R4 形 2`；句内自注「现体 = 某核档」⇒ `R4 形 1` 改指那一条。

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
715 | 抬头（§1 之前）「核 agent.mjs 主循环面已分档」 | agent.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent.mjs | 句说它是 105 行编排面 = 核侧那份
716 | 抬头「…agent/run-start.mjs」 | agent/run-start.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/run-start.mjs | 已有 `agent/` 段、缺仓根段；分档后的起段
717 | 抬头「…agent/turn-loop.mjs」 | agent/turn-loop.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/turn-loop.mjs | 回合循环分档件
718 | 抬头「…agent/chat-call.mjs」 | agent/chat-call.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/chat-call.mjs | 模型调用分档件
719 | 抬头「…agent.mjs = 105 行编排面」 | agent.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent.mjs | 同句第二处，独立计
720 | §1 表「注册表｜src/agent-tools.mjs」 | src/agent-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools.mjs | 已有 `src/` 段、缺仓根段；登记册在核根
721 | §1 表「注册表｜…+ src/cli/make-agent.mjs」 | src/cli/make-agent.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/cli/make-agent.mjs | 装配入口在 CLI 包
722 | §2.2 #52「…按端注入（VSC …src/tools/question.mjs）」 | src/tools/question.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/question.mjs | 该格讲 CLR 侧措辞归一，工具本体在核 tools 面
723 | §2.2 #53「VSC 宿主真终端（src/tools/shell.mjs）」 | src/tools/shell.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/shell.mjs | 句点 VSC ⇒ 端侧那份在盘
724 | §2.2 #53「…CLI 文本（src/tools/bash.mjs）」 | src/tools/bash.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/bash.mjs | bash 工具本体在核 tools 面
725 | §2.2 #54「CLI 有上下文档（src/tools/search.mjs）」 | src/tools/search.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/search.mjs | 句点 CLI ⇒ 核那份
726 | §2.2 #54「…同句第二处搜档」 | src/tools/search.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/search.mjs | 同句第二次出现，独立计
727 | §2.2 #55「两端同档 src/tools/linter.mjs」 | src/tools/linter.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/linter.mjs | 句说「两端同档」，现体只有核一份
728 | §2.2 #56「tools/tree.mjs｜同路径」 | tools/tree.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/tree.mjs | 已写全核侧路径于处置格；本处为件名格
729 | §2.2 #57「tools/execute.mjs｜同路径」 | tools/execute.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/execute.mjs | 执行工具本体
730 | §2.2 #57「…（src/tools/execute.mjs）」 | src/tools/execute.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/execute.mjs | 端侧旧路径，同名活档在核
731 | §2.2 #57「…同句第二处 execute」 | src/tools/execute.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/execute.mjs | 同句第二次出现，独立计
732 | §2.2 #58「tools/web.mjs 同一条款」 | tools/web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 抓取工具本体
733 | §2.2 #58「…抓取实现分叉（src/tools/web.mjs）」 | src/tools/web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 端侧旧路径
734 | §2.2 #58「…同句第二处 web」 | src/tools/web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 同句第二次出现，独立计
735 | §2.2 #59「tools/git.mjs｜同路径」 | tools/git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | git 工具本体
736 | §2.2 #59「VSC 多只读判定（src/tools/git.mjs）」 | src/tools/git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 端侧旧路径，同名活档在核
737 | §2.2 #59「…同句第二处 git」 | src/tools/git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 同句第二次出现，独立计
738 | §2.2 #60「tools/checklist.mjs｜同路径」 | tools/checklist.mjs | 1 | R4 退役件 | 形 2：删该行件名半句（该工具已废除） | 全仓零同名档；§9 已裁定 checklist 工具废除
739 | §2.2 #60「…ID 预留含已归档子 ID（src/tools/checklist.mjs）」 | src/tools/checklist.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 同上；该句讲的是被废除件的行为
740 | §2.2 #60「…同句第二处 checklist」 | src/tools/checklist.mjs | 1 | R4 退役件 | 形 2：删该坐标（独立计） | 同句第二次出现
741 | §2.2 #61「tools/linter.mjs｜同路径」 | tools/linter.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/linter.mjs | 检查器工具本体
742 | §2.2 #61「…（src/tools/linter.mjs）」 | src/tools/linter.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/linter.mjs | 端侧旧路径
743 | §2.2 #61「…同句第二处 linter」 | src/tools/linter.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/linter.mjs | 同句第二次出现，独立计
744 | §2.2 #62「tools/ops.mjs｜同路径」 | tools/ops.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/ops.mjs | wait_for 并回后的单档
745 | §2.2 #62「（VSC 拆到 wait_for.mjs）」 | wait_for.mjs | 1 | R4 退役件 | 形 2：删该括注坐标 | 全仓零同名档；该件已并回 ops 单档
746 | §2.2 #64「tools/question.mjs｜同路径」 | tools/question.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/question.mjs | 提问工具本体（另两份是视图与卡片）
747 | §2.2 #64「…VSC QuickPick / InputBox（src/tools/question.mjs）」 | src/tools/question.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/question.mjs | 端侧旧路径，同名活档在核
748 | §2.2 #64「…同句第二处 question」 | src/tools/question.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/question.mjs | 同句第二次出现，独立计
749 | §2.2 #65「tools/search.mjs｜同路径」 | tools/search.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/search.mjs | 搜索工具本体
750 | §2.2 #65「CLI 含 ls（src/tools/search.mjs）」 | src/tools/search.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/search.mjs | 端侧旧路径
751 | §2.2 #65「…导出面切分（more-file.mjs）」 | more-file.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 全仓零同名档
752 | §2.2 #66「tools/lsp.mjs｜同路径」 | tools/lsp.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/lsp.mjs | LSP 工具本体
753 | §2.2 #66「…自起服务器（src/tools/lsp.mjs）」 | src/tools/lsp.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/lsp.mjs | 端侧旧路径
754 | §2.2 #66「…同句第二处 lsp」 | src/tools/lsp.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/lsp.mjs | 同句第二次出现，独立计
755 | §2.2 #67「tools/web.mjs｜同路径」 | tools/web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 同 732 的件名格，独立计
756 | §2.2 #67「…跟随重定向（src/tools/web.mjs）」 | src/tools/web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 端侧旧路径
757 | §2.2 #67「…同句第二处 web」 | src/tools/web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 同句第二次出现，独立计
758 | §2.2 #68「tools/file.mjs｜同路径」 | tools/file.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/file.mjs | 文件工具本体
759 | §2.2 #68「…（src/tools/file.mjs）」 | src/tools/file.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/file.mjs | 端侧旧路径
760 | §2.2 #68「…（src/tools/file-edit.mjs）」 | src/tools/file-edit.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 全仓零同名档（编辑面并入核 file 档）
761 | §2.2 #68「…（src/tools/more-file.mjs）」 | src/tools/more-file.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 全仓零同名档
762 | §2.2 #69「tools/edit-diff.mjs｜同路径」 | tools/edit-diff.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/edit-diff.mjs | 回执 / 匹配内核件
763 | §2.2 #70「…CLI 侧消费方拼装面（src/cli/make-agent.mjs）」 | src/cli/make-agent.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/cli/make-agent.mjs | 装配层在 CLI 包
764 | §2.2 #70「…VSC（src/index.mjs）」 | src/index.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/index.mjs | 句说 VSC 注册位置 = 端侧工具表入口，实读在 src/tools/index.mjs
765 | §2.2 #83「agent-tools.mjs｜同路径」 | agent-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools.mjs | 统一登记册在核根
766 | §2.2 #84「batch-segment.mjs｜同路径」 | batch-segment.mjs | 1 | R4 退役件 | 形 2：删该行件名半句 | 全仓零同名档（同族改名件是 vocab，非同一份）
767 | §2.2 #84「…VSC 把写过的批次档计入本轮变更（batch-segment.mjs）」 | batch-segment.mjs | 1 | R4 退役件 | 形 2：删该坐标（独立计） | 同句第二次出现
768 | §2.2 #85「agent-tools/plan.mjs｜同路径」 | agent-tools/plan.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/plan.mjs | 核侧 plan 工具（desktop 那份是视图）
769 | §2.2 #85「…CLI 现会误入（src/agent-tools/plan.mjs）」 | src/agent-tools/plan.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/plan.mjs | 端侧旧路径
770 | §2.2 #86「agent-tools/timer.mjs｜同路径」 | agent-tools/timer.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/timer.mjs | 定时器工具本体
771 | §2.2 #86「seconds 必须为有限正数（src/agent-tools/timer.mjs）」 | src/agent-tools/timer.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/timer.mjs | 端侧旧路径
772 | §2.2 #86「…同句第二处 timer」 | src/agent-tools/timer.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/timer.mjs | 同句第二次出现，独立计
773 | §2.2 #88「agent-tools/skill.mjs｜同路径」 | agent-tools/skill.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/skill.mjs | 技能工具本体
774 | §2.2 #88「loader 路径（../skills.mjs）」 | ../skills.mjs | 1 | R1 | 改为仓根形 → thincoder-core/skills.mjs | `../` 相对写法依赖引用方目录
775 | §2.2 #88「…VSC（../extension/skills.mjs）」 | ../extension/skills.mjs | 1 | R1 | 改为仓根形 → thincoder-vscode/src/extension/skills.mjs | 相对写法不入判；仓根形指出端侧那份
776 | §2.2 #90「agent-tools/task.mjs｜同路径」 | agent-tools/task.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/task.mjs | 任务工具本体
777 | §2.2 #90「空标题过滤（src/agent-tools/task.mjs）」 | src/agent-tools/task.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/task.mjs | 端侧旧路径
778 | §2.2 #90「…同句第二处 task」 | src/agent-tools/task.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/task.mjs | 同句第二次出现，独立计
779 | §2.2 #91「agent-tools/eng.mjs｜同路径」 | agent-tools/eng.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/eng.mjs | 翻态工具本体
780 | §2.2 #92「agent-tools/digest-budget.mjs｜同路径」 | agent-tools/digest-budget.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/digest-budget.mjs | 摘要预算工具本体
781 | §2.2 #92「…落盘位置（src/agent-tools/digest-budget.mjs）」 | src/agent-tools/digest-budget.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/digest-budget.mjs | 端侧旧路径
782 | §2.2 #96「agent-tools/verify.mjs｜同路径」 | agent-tools/verify.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/verify.mjs | 校验工具本体
783 | §2.2 #96「…（src/agent-tools/verify.mjs）」 | src/agent-tools/verify.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/verify.mjs | 端侧旧路径
784 | §2.2 #97「agent-tools/goal.mjs｜同路径」 | agent-tools/goal.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/goal.mjs | 目标工具本体（desktop 那份是视图）
785 | §2.2 #97「…depth-0 独立裁判（src/agent-tools/goal.mjs）」 | src/agent-tools/goal.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/goal.mjs | 端侧旧路径
786 | §2.2 #97「…同句第二处 goal」 | src/agent-tools/goal.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/goal.mjs | 同句第二次出现，独立计
787 | §2.3「CLI tools/bash.mjs ↔ VSC tools/shell.mjs」 | tools/bash.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/bash.mjs | 对位表的左项（同一 bash 工具）
788 | §2.3「↔ VSC tools/shell.mjs（同一 bash 工具）」 | tools/shell.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/shell.mjs | 对位表的右项在端侧
789 | §2.3「CLI tools/checklist-sync.mjs｜核内并发写同步机」 | tools/checklist-sync.mjs | 1 | R4 退役件 | 形 2：删该行件名半句 | 全仓零同名档；该工具族已废除
790 | §2.3「…VSC 内联于 checklist.mjs」 | checklist.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 同上；被废除件的端侧内联位置
791 | §2.3「CLI tools/edit-batch.mjs｜核内 edit 数组形态」 | tools/edit-batch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/edit-batch.mjs | 批编辑实现件
792 | §2.3「…VSC 住 edit-line-params.mjs」 | edit-line-params.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 全仓零同名档
793 | §2.3「…/ file-edit.mjs」 | file-edit.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 全仓零同名档
794 | §2.3「CLI tools/glob-dialect.mjs｜核内 glob 方言」 | tools/glob-dialect.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/glob-dialect.mjs | 方言校验实现件
795 | §2.3「…VSC 住 search.mjs」 | search.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/tools/search.mjs | 端侧那份不在盘；同名活档在核（该节讲归位后的单份）
796 | §2.3「…/ more-file.mjs」 | more-file.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 全仓零同名档
797 | §2.3「CLI tools/patch.mjs｜核内 apply_patch / delete 实现」 | tools/patch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/patch.mjs | 补丁工具本体
798 | §2.3「…（VSC 住 file-edit.mjs）」 | file-edit.mjs | 1 | R4 退役件 | 形 2：删该坐标（独立计） | 同段第二次出现
799 | §2.3「↔ VSC repomap.mjs（同一 repo 大纲）」 | repomap.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/repomap.mjs | 句点 VSC ⇒ 端侧那份在盘
800 | §2.3「VSC tools/checkpoint.mjs ↔ CLI git/checkpoint.mjs」 | tools/checkpoint.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/git/checkpoint.mjs | 端侧那份不在盘；句内自注「现体 = 核 git/checkpoint.mjs」
801 | §2.3「↔ CLI git/checkpoint.mjs（现体 = 核…）」 | git/checkpoint.mjs | 1 | R1 | 补仓根 → thincoder-core/git/checkpoint.mjs | 已有 `git/` 段、缺仓根段
802 | §2.3「VSC tools/code.mjs ↔ CLI memory/docs.mjs 的 codeSearchTool」 | memory/docs.mjs | 1 | R1 | 补仓根 → thincoder-core/memory/docs.mjs | 已有 `memory/` 段、缺仓根段
803 | §2.3「VSC tools/edit-fuzzy-match.mjs · …」 | tools/edit-fuzzy-match.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名档
804 | §2.3「…· edit-line-params.mjs」 | edit-line-params.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名档
805 | §2.3「…· file-edit.mjs」 | file-edit.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名档
806 | §2.3「…· more-file.mjs」 | more-file.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名档
807 | §2.3「…· hashline-edit.mjs」 | hashline-edit.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名档
808 | §2.3「核内切分 ⇒ edit-diff.mjs」 | edit-diff.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/edit-diff.mjs | 切分后的核内实现件
809 | §2.3「…edit-batch.mjs」 | edit-batch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/edit-batch.mjs | 同句第二份核内件
810 | §2.3「…patch.mjs」 | patch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/patch.mjs | 同句第三份核内件
811 | §2.3「…search.mjs」 | search.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/search.mjs | 同句第四份核内件（desktop / render-core 两份同名档不在此列）
812 | §2.3「VSC tools/focus.mjs｜④ 端特有段」 | tools/focus.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/focus.mjs | 宿主能力面，端侧那份在盘
813 | §2.3「VSC tools/read_image.mjs（现体 = 核 tools/file.mjs）」 | tools/read_image.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/tools/file.mjs | 句内自注现体在核 file 档
814 | §2.3「…（CLI 住 tools/file.mjs）」 | tools/file.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/file.mjs | 同句点名的核侧实现档
```

**序 12 第 1 段表尾核对**：100 行覆盖 100 处（行内处数逐行 = 1，本段合计 100）。

**序 12 · `docs/core/design/TOOLS.md`（第 2 段 序 815–914，100 行）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
815 | §2.3「VSC tools/shell.mjs｜↔ CLI tools/bash.mjs」 | tools/shell.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/shell.mjs | 对位表的右项（端侧在盘）
816 | §2.3「↔ CLI tools/bash.mjs（同首行）」 | tools/bash.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/bash.mjs | 同句左项 = 核侧 bash 工具
817 | §2.3「VSC tools/wait_for.mjs（现体 = 核 ops.mjs）」 | tools/wait_for.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/tools/ops.mjs | 句内自注现体在核 ops 档
818 | §2.3「…（CLI 并回 tools/ops.mjs）」 | tools/ops.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/ops.mjs | 同句点名的核侧单档
819 | §3.1 A6「agent-tools/eng.mjs（#91）」 | agent-tools/eng.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/eng.mjs | 裁决表行主体
820 | §3.1 A6「…（cmd-eng.mjs 自述 (session)）」 | cmd-eng.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/cmd-eng.mjs | `/eng` 命令面在 CLI tui
821 | §3.1 A8「tools/web.mjs + tool-docs/websearch.md（#67）」 | tools/web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 抓取工具本体
822 | §3.1 A8「…fetch 跟随一次重定向（src/tools/web.mjs）」 | src/tools/web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 端侧旧路径
823 | §3.1 A9「tools/lsp.mjs（#66）」 | tools/lsp.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/lsp.mjs | LSP 工具本体
824 | §3.1 A10「tools/file.mjs（#68）」 | tools/file.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/file.mjs | 文件工具本体
825 | §3.1 A10「…VSC（file-edit.mjs）」 | file-edit.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 全仓零同名档
826 | §3.1 A10「…（more-file.mjs）」 | more-file.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 全仓零同名档
827 | §3.1 A11「tools/grep.md + tools/search.mjs（#54 / #65）」 | tools/grep.md | 1 | R1 | 补仓根 → thincoder-core/tool-docs/grep.md | 写的是 tools/ 段，实址在 tool-docs（描述面）
828 | §3.1 A11「…tools/search.mjs」 | tools/search.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/search.mjs | 搜索工具本体
829 | §3.1 A11「…上下文档（search.mjs）」 | search.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/search.mjs | 句说 CLI 侧有上下文档 ⇒ 核那份
830 | §3.1 A11「…ls 在 more-file.mjs」 | more-file.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 全仓零同名档
831 | §3.1 A13「agent-tools/task.mjs（#90）」 | agent-tools/task.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/task.mjs | 裁决表行主体
832 | §3.2 B1「agent-tools/timer.mjs（#86）」 | agent-tools/timer.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/timer.mjs | 缺陷表行主体（seconds 校验）
833 | §3.2 B2「agent-tools/plan.mjs（#85）」 | agent-tools/plan.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent-tools/plan.mjs | 未知 action 处置的核侧实现
834 | §6.11「现体 = 核 tools/{file.mjs, …}」 | edit-diff.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/edit-diff.mjs | 花括号列举里的第一份核内件
835 | §6.11「…, edit-batch.mjs, …」 | edit-batch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/edit-batch.mjs | 同列举第二份
836 | §6.11「…, patch.mjs}」 | patch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/patch.mjs | 同列举第三份
837 | §6.11「权限审批面…（permission-gate.mjs / batchPermissionGate）」 | permission-gate.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/permission-gate.mjs | 端侧审批门档在盘
838 | §6.12 表 5「十处读动作调用点（git.mjs / git-ext.mjs）」 | git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 读动作调用点的第一份档
839 | §6.12 表 5「…/ git-ext.mjs」 | git-ext.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-ext.mjs | 同格第二份档
840 | §6.12 表 1「git.mjs（diff ∥ log ∥ show …）」 | git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 七处读动作的宿主档
841 | §6.12 表 2「git.mjs（status——经 runGitRaw）」 | git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 同表另一行（修复目标点），独立计
842 | §6.12 表 3「git-ext.mjs（remote list ∥ worktree list ∥ blame）」 | git-ext.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-ext.mjs | 三处读动作的宿主档
843 | §6.12 表 4「git-checkpoint.mjs（lazyClearIfCommitted）」 | git-checkpoint.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-checkpoint.mjs | 已 try/catch 的那一份
844 | §6.12 表 5「thincoder-vscode/src/tools/ide.mjs（自 context.mjs 改名）的 changesSection」 | context.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-vscode/src/tools/ide.mjs | 括号里自注改名事实；旧名不在盘
845 | §6.12「不改 advisor/repos.mjs 的独立 git 读取面」 | advisor/repos.mjs | 1 | R1 | 补仓根 → thincoder-core/advisor/repos.mjs | 独立读取面的宿主档
846 | §6.13「源逻辑现址…经 manifest.mjs 转口」 | manifest.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/manifest.mjs | 句说它是转口 = 核清单模块本体
847 | §6.13 表 1「…（经 manifest.mjs 转口）→ { kind, root, candidates }」 | manifest.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/manifest.mjs | 同节第二处转口引用，独立计
848 | §6.13 表 3「…（git.mjs 一带：workdir 归一之后）」 | git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | execute() 头部的单点所在档
849 | §6.13 表 3「…（git-ext.mjs / git-checkpoint.mjs）覆盖」 | git-ext.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-ext.mjs | 同格覆盖面之一
850 | §6.13 表 3「…/ git-checkpoint.mjs」 | git-checkpoint.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-checkpoint.mjs | 同格覆盖面之二
851 | §6.13 表 3「…（git.mjs 第二处）」 | git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 同格第二次出现，独立计
852 | §6.13 表 3「…（git-ext.mjs 第二处）」 | git-ext.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-ext.mjs | 同格第二次出现，独立计
853 | §6.13 表 3「…（git-checkpoint.mjs 第二处）」 | git-checkpoint.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-checkpoint.mjs | 同格第二次出现，独立计
854 | §6.13 表 1「…（git.mjs if (args.workdir)）」 | git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 真值判定点所在档
855 | §6.13「同族先例 = git-checkpoint.mjs 的 [snapshot …] 前缀行」 | git-checkpoint.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-checkpoint.mjs | 前缀行先例所在档
856 | §6.13 表 1「thincoder-core/manifest-discovery.mjs（经 manifest.mjs 转口）」 | manifest.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/manifest.mjs | 同节第三处转口引用，独立计
857 | §6.13 A20「discoverRepos 自 ../manifest.mjs import 命中」 | ../manifest.mjs | 1 | R1 | 改为仓根形 → thincoder-core/manifest.mjs | 相对写法依赖引用方目录
858 | §6.13「thincoder-core/test/ 现盘 = run.mjs / slow.mjs」 | run.mjs | 1 | R1（候选多） | 补仓根 → thincoder-core/test/run.mjs | 句已限定核 test 目录；该目录现盘确有 run.mjs
859 | §6.13「…/ slow.mjs」 | slow.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/test/slow.mjs | 同句第二份核 test 档
860 | §6.14「注入面 spawnGit（…）缝住 git-run.mjs」 | git-run.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-run.mjs | 起跑原语的宿主档
861 | §6.14「超时错误文案单源 = git-run.mjs 的 gitTimeoutNote」 | git-run.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-run.mjs | 同档另一处引用，独立计
862 | §6.14「机械 await 46 处（git.mjs 30 …）」 | git.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git.mjs | 30 处 await 的宿主档
863 | §6.14「…（git-ext.mjs …）」 | git-ext.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-ext.mjs | 同句第二份核档
864 | §6.14「…（git-checkpoint.mjs …）」 | git-checkpoint.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-checkpoint.mjs | 同句第三份核档
865 | §6.14 A28「五档源码 + git-run.mjs」 | git-run.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-run.mjs | 结构机判的目标档
866 | §6.14 A28「…（gitDif… 命中零）」 | git-run.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/git-run.mjs | 同格第二次出现，独立计
867 | §6.14 A28「…五档（shared / git / … / patch）」 | bash.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/bash.mjs | 同句并列的第五档旁证（bash 面 execFileSync 命中零）
868 | §6.14「表外复核五位中 gitDiffOne / patch.mjs 两处落」 | patch.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/patch.mjs | 转 spawnGit 的两处之一
869 | §6.14「余三位（git/checkpoint.mjs / advisor/repos.mjs / bash.mjs）」 | advisor/repos.mjs | 1 | R1 | 补仓根 → thincoder-core/advisor/repos.mjs | 零改三份之二
870 | §6.14「余三位（… / bash.mjs）」 | bash.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/bash.mjs | 零改三份之三
871 | §6.15「唯一装配消费点…（VSC setup-tooltable.mjs 同调）」 | setup-tooltable.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/setup-tooltable.mjs | 端侧工具表装配档在盘
872 | §6.15「工程分支现体 …（family-tools.mjs）」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 家族矩阵单源档
873 | §6.15「…普通分支 = [taskTool, planTool, …]（family-tools.mjs 第二处）」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 同句第二次出现，独立计
874 | §6.15「催更门连带：agent/completion.mjs pending 列表」 | agent/completion.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/completion.mjs | 已有 `agent/` 段、缺仓根段
875 | §6.15「…VSC 侧同判面 = 独立副本（thincoder-vscode/src/agent/run-stages.mjs）」 | thincoder-vscode/src/agent/run-stages.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/agent/run-stages.mjs | 端侧该档实读不在盘；同名活档只在核
876 | §6.15.1「装配层…（plan 不入表，family-tools.mjs）」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 固定段分流所在档
877 | §6.15.1「…普通段逐字零变（family-tools.mjs 第二处）」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 同句第二次出现，独立计
878 | §6.15.1「execute 层（兜底门）｜task.mjs execute 开头机械拒」 | task.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/task.mjs | 兜底门落点档
879 | §6.15.1「escalate 先例（subagent-actions.mjs）」 | subagent-actions.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-actions.mjs | 机械防线的先例档
880 | §6.15.1「错误句文案形态对齐 escalate 先例（subagent-actions.mjs）」 | subagent-actions.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-actions.mjs | 同档第二处引用，独立计
881 | §6.15.1「催更门连带：completion.mjs 门条件补 !engineering」 | completion.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/completion.mjs | 门条件所在档
882 | §6.15.1「VSC 副本同位同步——thincoder-vscode/src/agent/run-stages.mjs pending 分支」 | thincoder-vscode/src/agent/run-stages.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/agent/run-stages.mjs | 端侧该档不在盘（同 875）
883 | §6.15.1「…_tasks 活体链 = agent-state.mjs」 | agent-state.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/agent-state.mjs | 端侧活体链档在盘
884 | §6.15.2「词表 = STATUS_WORDS[seg]（family-tools…）」 | family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | schema enum 与词表对照面
885 | §6.15.2「…静态写死四段并集（batch-lifecycle.mjs）」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 段词表消费面档
886 | §6.15.2「落盘位置 = 骨架编制行（batch-skeleton.mjs）」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 骨架模板所在档
887 | §6.15.2「…单行约束（batch-lifecycle.mjs）」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 同段第二份档
888 | §6.15.2「判据 = 骨架死占位枚举单源（新常量住 batch-skeleton.mjs）」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 常量与模板同档
889 | §6.15.2「batch-lifecycle.mjs ≈322——跨过 300 软线」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 行数读数的宿主档
890 | §6.15.2「拆分计划 = 拆出候选位①为姊妹档 batch-lifecycle-create.mjs」 | batch-lifecycle-create.mjs | 1 | R2 举例 | 计划档名移入围栏块，散文写「候选姊妹档」 | 这是拆分计划的候选名（盘上尚未产出），补路径等于造一个不存在的指称
891 | §6.15.2「…（余量预计 ≈267）（session-lifecycle.mjs …）」 | session-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/session-lifecycle.mjs | 同格并列的核内档
892 | §6.15.2「…process-probe.mjs …」 | process-probe.mjs | 1 | R1 | 补仓根 → thincoder-core/process-probe.mjs | 进程探测档在核根
893 | §6.15.2「batch.mjs ≈424（>300 既有登记档）」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 行数读数与拆分位的宿主档
894 | §6.15.2「守卫面 = 双源结构（核 agent/completion.mjs）」 | agent/completion.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/completion.mjs | 催更门守卫的核侧副本
895 | §6.15.2「…VSC 副本 thincoder-vscode/src/agent/run-stages.mjs」 | thincoder-vscode/src/agent/run-stages.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/agent/run-stages.mjs | 端侧该档不在盘（同 875）
896 | §6.15.2「VSC 副本 verify guard 分支（thincoder-vscode/src/agent/run-stages.mjs）」 | thincoder-vscode/src/agent/run-stages.mjs | 1 | R4 退役件 | 形 1 改指 → thincoder-core/agent/run-stages.mjs | 同档第三处引用，独立计
897 | §6.15.3 表「VSC turn-domains.mjs｜组合点选基座」 | turn-domains.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/turn-domains.mjs | 端侧组合点档在盘
898 | §6.15.3 表「VSC setup-reminders.mjs｜W15 转口表」 | setup-reminders.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/agent/setup-reminders.mjs | 句点 VSC 转口表 ⇒ 端侧那份
899 | §6.15.3 表「DOM-C2｜核选串结构机检｜agent.mjs 源文本」 | agent.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/agent.mjs | 机检读的是核编排档源文本
900 | §6.15.3 表「DOM-V3｜turn-domains.mjs 零核基座文本字面」 | turn-domains.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/turn-domains.mjs | 端侧结构机检的目标档
901 | §6.15.3 表「…setup-reminders.mjs 含新名」 | setup-reminders.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/agent/setup-reminders.mjs | 同格第二份（端侧转口表）
902 | §6.15.3「压缩后重注入面（context.mjs）」 | context.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/context.mjs | 重注入面在核根 context 档
903 | §6.15.3「…与 verify.mjs 回声（已判非指挥语）」 | verify.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/verify.mjs | 回声面在 verify 工具档
904 | §6.16「单源落点…thincoder-core/agent.mjs 的两处」 | ../agent.mjs | 1 | R1 | 改为仓根形 → thincoder-core/agent.mjs | 相对写法依赖引用方目录
905 | §6.17 表 7「thincoder-vscode/src/agent/tool-gates.mjs（l3TouchedPaths 定义）」 | thincoder-vscode/src/agent/tool-gates.mjs | 1 | R4 退役件 | 形 2：整行删 | 端侧该档实读不在盘；整行内容 = 这批怎么改它
906 | §6.17 表 8「thincoder-vscode/src/agent/execute-tools.mjs（_touchedFiles 记账）」 | thincoder-vscode/src/agent/execute-tools.mjs | 1 | R4 退役件 | 形 2：整行删 | 同上（零同名活档）
907 | §6.17 表 9「thincoder-vscode/src/agent/tool-gates.mjs（工程设计闸）」 | thincoder-vscode/src/agent/tool-gates.mjs | 1 | R4 退役件 | 形 2：整行删 | 同 905（同表另一行）
908 | §6.17 表 10「thincoder-vscode/src/agent/rules-face.mjs（作用域规则 JIT）」 | thincoder-vscode/src/agent/rules-face.mjs | 1 | R4 退役件 | 形 2：整行删 | 零同名活档
909 | §6.17「核 peer-domains.mjs 的 file_ops 双算特例分支」 | peer-domains.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/peer-domains.mjs | 句点「核」⇒ 核根那份
910 | §6.17「…与端 tool-gates.mjs 的 l3TouchedPaths 本地分支双删」 | tool-gates.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 端侧该档不在盘；双删的另一半已是空指
911 | §6.17「端 l3TouchedPaths 的 toolName 参数随删——两个调用点（…tool-gates.mjs）」 | thincoder-vscode/src/agent/tool-gates.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 同档在这里第二次出现，独立计
912 | §6.17「…· thincoder-vscode/src/agent/execute-tools.mjs）同步改签名」 | thincoder-vscode/src/agent/execute-tools.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 零同名活档
913 | §6.17「② 端 #10 thincoder-vscode/src/agent/rules-face.mjs（作用域规则 JIT）」 | thincoder-vscode/src/agent/rules-face.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 同档另一处，独立计
914 | §6.17 表「端消费｜thincoder-vscode/src/agent/tool-gates.mjs · …execute-tools.mjs · …rules-face.mjs」 | thincoder-vscode/src/agent/tool-gates.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 三份端侧档全不在盘；该格只列消费面坐标
```

**序 12 第 2 段表尾核对**：100 行覆盖 100 处（行内处数逐行 = 1，本段合计 100）。

**序 12 · `docs/core/design/TOOLS.md`（第 3 段 序 915–1017，103 行）**

```text
序 | 位置 | token | 处数 | 角色 | 处置 | 理由一句
915 | §6.17 表「端消费｜…execute-tools.mjs …」 | thincoder-vscode/src/agent/execute-tools.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 全仓零同名档；该格只列消费面坐标
916 | §6.17 表「端消费｜… · thincoder-vscode/src/agent/rules-face.mjs」 | thincoder-vscode/src/agent/rules-face.mjs | 1 | R4 退役件 | 形 2：删该清单项 | 同上
917 | §6.18「清扫…TUI 自重启 wrapped-spawn.mjs——宿主恒 node」 | wrapped-spawn.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/wrapped-spawn.mjs | TUI 自重启档在 CLI tui
918 | §6.20「骨架面（batch-skeleton.mjs batchSkeleton(...)）」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 骨架产出函数的宿主档
919 | §6.20「回执面（batch-lifecycle.mjs create 回执）」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | 回执文案所在档
920 | §6.20「调用点两处（batch.mjs append 挂点）」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | append 挂点所在档
921 | §6.20「…∥ batch-lifecycle.mjs status 挂点」 | batch-lifecycle.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-lifecycle.mjs | status 挂点所在档
922 | §6.20「骨架↔三结构行不变量…（同址 batch-skeleton.mjs）」 | batch-skeleton.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch-skeleton.mjs | 占位字面与模板同址
923 | §17「capWindow｜谁 = ssh-session.mjs 的 7 处返回点」 | ssh-session.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-session.mjs | 7 处返回点的宿主档
924 | §17「…（ssh-transport.mjs 的 capText 只保尾）」 | ssh-transport.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transport.mjs | 同名异义 capText 所在档
925 | §17「…与 text-budget.mjs 同名异义」 | text-budget.mjs | 1 | R1 | 补仓根 → thincoder-core/text-budget.mjs | 截断本体在核根
926 | §17「注记文案｜占位约定同 text-budget.mjs fillMarker」 | text-budget.mjs | 1 | R1 | 补仓根 → thincoder-core/text-budget.mjs | fillMarker 所在档（同 925）
927 | §17 表「包装档｜…tools/node-child.mjs」 | tools/node-child.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/node-child.mjs | 子进程包装档在核 tools 面
928 | §17 表「池｜…单点（照 bash-async.mjs 池先例）」 | bash-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/bash-async.mjs | 池先例档
929 | §17 表「关闭｜…杀进程树（tools/process-tree.mjs 单源）」 | tools/process-tree.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/process-tree.mjs | 杀树单源档
930 | §17 表「会话中止｜挂点 = agent-tools/async-discard.mjs 收尾族」 | agent-tools/async-discard.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/async-discard.mjs | 收尾族所在档
931 | §17「截断本体…ssh-transport.mjs 那个只保尾的同名 capText 随之删除」 | ssh-transport.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transport.mjs | 被删副本所在档
932 | §17「落点（三端各一）…CLI = tool-events.mjs 回调」 | tool-events.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/tool-events.mjs | CLI 回调面在 tui
933 | §17「…TUI 模态面（掩码回显复用 ask-steps.mjs maskEcho）」 | ask-steps.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/ask-steps.mjs | maskEcho 先例所在档
934 | §17「…∥ VSC = panel-callbacks.mjs …」 | panel-callbacks.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/extension/panel-callbacks.mjs | 端侧回调档在盘
935 | §17「…∥ 桌面 = agent-bridge.mjs …」 | agent-bridge.mjs | 1 | R1 | 补仓根 → thincoder-desktop/src/main/agent-bridge.mjs | 桌面桥档在盘
936 | §17「掩码守卫…单源 = ask-steps.mjs askMaskActive」 | ask-steps.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/ask-steps.mjs | 掩码面判据所在档（同 933）
937 | §17「无 UI 场合…照 question.mjs 无 UI 抛例」 | question.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/tools/question.mjs | 无 UI 抛例在核提问工具档
938 | §17「⑨ 非密字段预填档…configDir/ssh-hosts.json」 | configDir/ssh-hosts.json | 1 | R3 因门改叙 | 散文写「用户域私档」，原件名入围栏块 | 行内自注「私档——仓库零落点」⇒ 仓内永不存在，补路径 = 造假指称
939 | §17「档：configDir/ssh-credentials.json（私档）」 | configDir/ssh-credentials.json | 1 | R3 因门改叙 | 同上：散文写「用户域私档」，原件名入围栏块 | 同上；用户域档，仓内零落点
940 | §17 表「失败分类族｜ssh-transport.mjs 的 classifyFailure」 | ssh-transport.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transport.mjs | 分类族实现档
941 | §17 表「…由 ssh-transfer.mjs 另两类」 | ssh-transfer.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transfer.mjs | 传输面两类所在档
942 | §17 表「ssh-transfer.mjs｜住 thincoder-core/agent-tools/」 | ssh-transfer.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transfer.mjs | 表内自注住所目录，补后一致
943 | §17 表「…名逐字 ssh-transfer.mjs（仓内零同名）」 | ssh-transfer.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transfer.mjs | 同格第二次出现，独立计
944 | §17 表「…谁 = thincoder-core/tools/ssh.mjs 的 put / get 两分支」 | ssh-transport.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transport.mjs | 同表另一行的对照档（传输面）
945 | §17 表「resolveSessionSecret｜住 ssh-session.mjs」 | ssh-session.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-session.mjs | 被提取函数所在档
946 | §17「① 传输面既有实现：ssh-transport.mjs 的 buildSshEnv」 | ssh-transport.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transport.mjs | 三处既有实现的宿主档
947 | §17「③ 工具面现状：tools/ssh.mjs 的 SSH_ACTIONS 十动作」 | tools/ssh.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/tools/ssh.mjs | 工具面在核 tools（server 那份是沙箱）
948 | §17「localPath 的 ~ 按 expandHome 展开…（config.mjs 面）」 | config.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/config.mjs | 配置模块在核根（server 侧 ops 那份不是它）
949 | §17「这条腿要写全…ssh-session.mjs 逐字 spawn(entry.user, ...)」 | ssh-session.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-session.mjs | 逐字读的证据所在档
950 | §17「② 入口集（write-gate.mjs）」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 写门入口集所在档
951 | §17「③ 要号判据（write-gate.mjs 的 ledgerGateApplies）」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 判据函数所在档（同 950）
952 | §17「所照先例：ssh-transport.mjs 的 _setSshBinaryForTest」 | ssh-transport.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transport.mjs | 测试态缝先例所在档
953 | §17 表「thincoder-core/tools/ssh.mjs｜SSH_ACTIONS 八 → 十（取自 ../expand-home.mjs）」 | ../expand-home.mjs | 1 | R1 | 改为仓根形 → thincoder-core/expand-home.mjs | 相对写法依赖引用方目录
954 | §17 表「thincoder-core/agent-tools/ssh-transfer.mjs｜新档（… ../expand-home.mjs）」 | ../expand-home.mjs | 1 | R1 | 改为仓根形 → thincoder-core/expand-home.mjs | 同表另一行的同一 import 面
955 | §17 表「thincoder-core/agent-tools/ssh-session.mjs｜提取 resolveSessionSecret」 | ssh-transfer.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transfer.mjs | 同表并列的新档名（行内自注全路径）
956 | §17 表「thincoder-core/agent-tools/ssh-transport.mjs｜加一行 import（取自 ../expand-home.mjs）」 | ../expand-home.mjs | 1 | R1 | 改为仓根形 → thincoder-core/expand-home.mjs | 句说取自叶子档，相对写法改仓根形
957 | §17 表「docs/batches/2026-11-04-ssh-file-transfer.test.mjs｜本批单元测试档（随批删）」 | docs/batches/2026-11-04-ssh-file-transfer.test.mjs | 1 | R4 退役件 | 形 2：删该行坐标（「随批删」口径已由 TESTING.md 单源承载） | 该档按随批删纪律已删；句内自己写了这一点
958 | §17「档位结论…write-gate.mjs（522 行，已在软线之上）」 | write-gate.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/write-gate.mjs | 跨软线档的行数读数在该档
959 | §17「…ssh-session.mjs 改后 496 行」 | ssh-session.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-session.mjs | 同句第二份档
960 | §17「…ssh-transfer.mjs 新档」 | ssh-transfer.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-transfer.mjs | 同句第三份档
961 | §17「UI / 交互决策…审批文案（permission.mjs 一行）」 | permission.mjs | 1 | R1（候选 3） | 补仓根 → thincoder-core/permission.mjs | 审批文案在核权限档（另两份是端壳与卡片）
962 | §17 表「工具本体…（isReadonlyAction(args) ⇒ agent/dispatch-gates.mjs）」 | agent/dispatch-gates.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/dispatch-gates.mjs | 已读该档的只读判据面
963 | §17 表「传输机制｜…（池查询由 ssh-session.mjs 出口供）」 | ssh-session.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/ssh-session.mjs | 会话池出口所在档
964 | §1 NS1「package.json 运行时依赖零新增」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档」，原件入围栏块 | 收口判据是「所有打包都不新增运行时依赖」
965 | §1 NS4「全量扫描…ssh-credentials.json ⇒ 明文 0 命中」 | ssh-credentials.json | 1 | R3 因门改叙 | 散文写「凭据私档」，原件名入围栏块 | 用户域私档，仓内零落点
966 | 同期表「同族池机制…bash-async.mjs ∥ browser-async.mjs」 | bash-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/bash-async.mjs | 后台池族第一份
967 | 同期表「…∥ browser-async.mjs」 | browser-async.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/browser-async.mjs | 后台池族第二份
968 | 同期表「凭据零回显纪律…CLI 端掩码步（ask-steps.mjs 掩码步零留存）」 | ask-steps.mjs | 1 | R1 | 补仓根 → thincoder-cli/src/tui/ask-steps.mjs | 掩码步实现档
969 | 同期表「端面｜端侧仅 VSC 装配补 fetch 键（setup.mjs 三处）」 | setup.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/agent/setup.mjs | 句点 VSC 装配 ⇒ 端侧那份
970 | 同期表「…+ agent-state.mjs 一处」 | agent-state.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/agent-state.mjs | 端侧状态档
971 | 爬虫节「桌面 / server…agent-host.mjs」 | agent-host.mjs | 1 | R1 | 补仓根 → thincoder-desktop/src/main/agent-host.mjs | 桌面宿主档在盘
972 | websearch 节「Tavily / Bing / 本地直取三支零改（web.mjs）」 | web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 抓取工具本体
973 | websearch 节「args.engine ∥ args.page 不绕过（web.mjs 先于 engine 分支）」 | web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 同节第二处
974 | websearch 节表「search｜…上限 20 由 web.mjs 夹定」 | web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 上限夹定所在档
975 | websearch 节表「search 渲染｜…（web.mjs）」 | web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 渲染字符串所在档
976 | websearch 节表「…（tools/shared.mjs）」 | tools/shared.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/tools/shared.mjs | 共享常量档在核 tools
977 | 日志节「key ∥ query ∥ url 零入日志（log.mjs 字段黑名单）」 | log.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/log.mjs | 日志档在核根（server 侧 ops 那份不是它）
978 | websearch 表「跳过信号｜web.mjs」 | web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 表内实现列
979 | websearch 表「提示行返回路径｜web.mjs」 | web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 同表另一行
980 | 测试缝「web-deepseek.mjs 导出 _setDeepseekTransportForTest」 | web-deepseek.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web-deepseek.mjs | DeepSeek 腿实现档
981 | 「端侧 = VSC 装配补 fetch 键：setup.mjs 三处」 | setup.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/agent/setup.mjs | 句点 VSC 装配
982 | 「…+ agent-state.mjs 一处」 | agent-state.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/agent-state.mjs | 同句第二份端侧档
983 | websearch 表「D-WB4｜空结果 ⇒ 回落（web.mjs）」 | web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 判据对照的实现列
984 | websearch 表「D-WB8｜…端侧 = VSC 装配补键：setup.mjs 三处」 | setup.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/agent/setup.mjs | 同表另一行的端侧装配
985 | websearch 表「…+ agent-state.mjs 一处」 | agent-state.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/agent-state.mjs | 同表第二份端侧档
986 | §1 NW2「零 package.json 改」 | package.json | 1 | R2 泛指 | 改叙为「各包清单档」，原件入围栏块 | 判据 = 全仓清单档零改
987 | §1 NW2「…web-deepseek.mjs 仅 import node: / 内部模块」 | web-deepseek.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web-deepseek.mjs | 零第三方依赖判据的主体档
988 | §1 NW4「…读取点 = web.mjs（核）」 | web.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/web.mjs | 句自注「（核）」
989 | §1 NW4「…+ agent.config.fetch（VSC 装配：setup.mjs 三处）」 | setup.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/agent/setup.mjs | 同格端侧装配档
990 | §1 NW4「…agent-state.mjs 一处」 | agent-state.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/agent-state.mjs | 同格第二份端侧档
991 | 「不跨端各写一份…（setup.mjs 三处）」 | setup.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-vscode/src/agent/setup.mjs | 边界条目的端侧装配档
992 | 「…+ agent-state.mjs 一处」 | agent-state.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/agent/agent-state.mjs | 同句第二份端侧档
993 | 「fetch.md 与 truncate 实帽（200K，tools/shared.mjs MAX_OUTPUT_CHARS）不符」 | tools/shared.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/tools/shared.mjs | 常量所在核档
994 | §34「落点：web-backend-404 用例…单层集成用例收集面」 | .test.mjs | 1 | R2 泛指 | glob 移入围栏块，散文留「集成用例档」 | 说的是收集面的一整类档
995 | §6.24「① 三处 schema description 换写（agent-tools/batch.mjs）」 | agent-tools/batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 描述面所在档
996 | §6.24「④ edit 动作的描述面（batch.mjs 的 action 枚举行）」 | batch.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/batch.mjs | 同节第二处（action 枚举）
997 | §6.25「实现仍住 subagent-spawn.mjs」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 三态拆分的实现档
998 | §6.25「勘察证据行…该档所引 subagent-spawn.mjs」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 零改结论引的另一档坐标
999 | §6.25「…（design-slots.mjs 零触）」 | design-slots.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/design-slots.mjs | 设计槽档零触
1000 | §6.25「测试 import 面 = import { … } from ../../thincoder-core/agent-tools/subagent-spawn.mjs」 | ../../thincoder-core/agent-tools/subagent-spawn.mjs | 1 | R1 | 改为仓根形 → thincoder-core/agent-tools/subagent-spawn.mjs | `../../` 相对写法依赖引用方目录
1001 | §6.25「helper 落位…（subagent-spawn.mjs 内）」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 落位点所在档
1002 | §6.25「边界（本节不做）…depth>0 子通道 schema 裁剪零改（agent/family-tools.mjs）」 | agent/family-tools.mjs | 1 | R1 | 补仓根 → thincoder-core/agent/family-tools.mjs | 子通道 schema 裁剪所在档
1003 | §6.25「外部档案处置…所引 subagent-spawn.mjs 的对应行不漂移」 | subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 坐标不漂移判据的主体档
1004 | §6.25 表「舱 A·文本面｜agent-tools/subagent.mjs」 | agent-tools/subagent.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent.mjs | 文本面（描述）所在档
1005 | §6.25 表「舱 B·代码 + 测试面｜agent-tools/subagent-spawn.mjs」 | agent-tools/subagent-spawn.mjs | 1 | R1 | 补仓根 → thincoder-core/agent-tools/subagent-spawn.mjs | 面表里的代码面档
1006 | §6.28「VSC 的 bash 不走核 bashTool（import { bashTool } from \"./shell.mjs\"）」 | ./shell.mjs | 1 | R1 | 改为仓根形 → thincoder-vscode/src/tools/shell.mjs | `./` 相对写法依赖引用方目录
1007 | §6.28「grep 是核内单一实现…VSC tools/index.mjs 直接 re-export」 | tools/index.mjs | 1 | R1 | 补仓根 → thincoder-vscode/src/tools/index.mjs | 句点 VSC ⇒ 端侧工具表入口
1008 | §6.28「负例（最要紧）：行首是长得像路径、但盘上不存在的 token」 | config/x.yml | 1 | R2 举例 | 负例整段移入围栏块（含「冒号行号」那半句） | 该例的成立前提就是「盘上不存在」；补路径等于毁掉这个负例
1009 | §6.28「Windows 三形…必须显式把首段 ^/([A-Za-z])/ 映射（docs/batches/x.md）」 | docs/batches/x.md | 1 | R2 举例 | 例名入围栏块 | 构造样例路径，盘上无此档是意图
1010 | §6.28「五处共用同一份文案…不进 shared.mjs」 | shared.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/tools/shared.mjs | 句说它不该收这份判据（核通用表）
1011 | §6.28「VSC 端取同一 helper 的位置照 shell.mjs 的既有前例写」 | shared.mjs | 1 | R1（候选 2） | 补仓根 → thincoder-core/tools/shared.mjs | 同段第二处（通用表）
1012 | §6.28「…（该档已从 @thincoder/core/tools/process-tree.mjs 取 helper）」 | process-tree.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/process-tree.mjs | 杀树档由端侧引用的同一份
1013 | §6.28「同步 ∥ 后台两面…同步径在 bash.mjs 的 applyLineFilter 之后」 | bash.mjs | 1 | R1 | 补仓根 → thincoder-core/tools/bash.mjs | 打标顺序的宿主档
1014 | §9「定位：checklist 工具（tools/checklist.mjs …）废除」 | tools/checklist.mjs | 1 | R4 退役件 | 形 2：删该行件名半句（废除结论句照留） | 全仓零同名档；该句本身写的就是废除
1015 | §9「…+ CLI tools/checklist-sync.mjs）废除」 | tools/checklist-sync.mjs | 1 | R4 退役件 | 形 2：删该件名半句 | 同上；同句第二份档
1016 | §9 表「工具本体｜thincoder-core/tools/checklist.mjs + …删除」 | thincoder-core/tools/checklist.mjs | 1 | R4 退役件 | 形 2：删该坐标（删除指令随档一并消失） | 已有仓根全路径仍零命中 ⇒ 已删；该行讲的就是删它
1017 | §9 表「…+ CLI tools/checklist-sync.mjs 删除」 | tools/checklist-sync.mjs | 1 | R4 退役件 | 形 2：删该坐标 | 同表第二份档
```

**序 12 表尾核对**：三段合计 303 行覆盖 303 处（100 + 100 + 103；行内处数逐行 = 1，合计 303 = §2.4 顺序表该档处数）。

### §2.10 进度、对账与当刻读数

**逐处表已全部落盘**：12 档 / 1015 行 / 1018 处。序号 3–1017 连续、无重号、无内空；序 1 ∥ 序 2 是零处档，没有逐处表行——起号从 3 起是有意的。

```text
档（仓根全路径）                                行    处数   命中（建表读数）
docs/core/design/DOC-DISCIPLINE.md               0     0      0
docs/core/design/PROMPT-SYSTEM.md                0     0      0
docs/core/design/ADVISOR-GUARDS.md              19    19     19
docs/core/design/BATCH-RECORD.md                33    33     33
docs/core/design/TESTING.md                     58    61     61
docs/core/design/LEDGER.md                      70    70     70
docs/core/design/AGENT-LOOP-SUBAGENT.md         76    76     76
docs/core/design/ENGINEERING-MODE-V2.md         78    78     78
docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md   91    91     91
docs/core/design/MEMORY.md                     116   116    116
docs/core/design/CORE-UNIFICATION.md           171   171    171
docs/core/design/TOOLS.md                      303   303    303
                                         合计 1015  1018   1018
```

三列各说什么：「行」= 表行数；「处数」= 行内处数合计；「命中」= 建表时 `checkAnchors` 该档命中数。判分只认 **处数 = 命中**——两列本可不等，同 token 同判处合并一行记是常态。

本批只有 `docs/core/design/TESTING.md` 不等（58 行 / 61 处：序 60 ∥ 66 ∥ 88 三行的处数为 2）。**12 档逐档处数 = 命中，全等。**

**当刻读数（本轮回读，量法 = §2.5）**：真死 138 ∥ 裸名 873 ∥ `引缺` 0 ∥ `节缺` 0 = 合计 **1011**。

**与建表读数的差 = 7 处，全部落在 `docs/core/design/TESTING.md`**（39 / 22 → 37 / 17）。token 级差（围栏内列出，token 本身是悬空指针）：

```text
.test.mjs 26→24   package.json 3→2   run.mjs 4→2   check-syntax.mjs 1→0   test/integration/files.mjs 2→1
```

含义：该档在两次读数之间被改过，或建表读数取的是一份略早的文本。两种情形都可修，且都不影响验收——验收 1 ∥ 2 判的是收口读数 0 / 0。处置归实施席，登记见 §2.13 · U5。

**U4 端侧索引器退役（形 2 已落）**：删该侧件名与路径，改叙为「VSC 侧索引面由核内两份分担」，落两处：序 432 ∥ 序 455。核内那两份的坐标留在此处供查：

```text
代码索引面 thincoder-core/memory/code-index.mjs     同步面 thincoder-core/memory/code-sync.mjs
```

理由：端侧那份已退役，改指任一核内份 = 把「一侧对一份」写成「一侧对半份」，凭空空造一个不完整的对位物。能力仍在，留下的该是「谁提供什么能力」，不是「它住在哪个文件」。

### §2.11 结构性处置：U3 两步法与 D7

**U3「退役档当整行主体」**：`docs/core/design/ENGINEERING-MODE-V2.md` 该档 §7 的受影响文件表，整节主体是单元测试档名；实读全仓零命中——单元件按「用后即删」在各自收口时已删。这类行走两步：

1. **第一步 · 纯坐标行整行删**：该行除档名外只剩行数 / 新建 / 修改 / 改动指令 ⇒ 整行删。行里没有规则，删它不改任何「该怎样」。
2. **第二步 · 带断言的行先查同档是否已有单源**：有单源 ⇒ 按形 2 只删坐标句、**断言不搬**（不造第二份规则）；无单源 ⇒ 原句折进模块条目并留搬运清单。

**落到逐处表**：两步靠「处置」列的两个词区分，评审照词分辨。

```text
处置 = 「U3-① 整行删」   该行除档名外只剩行数 / 新建 / 修改 / 改动指令 ⇒ 整行删
处置 = 「U3-② 改形 2：删坐标句，断言不搬（单源 = <本档规则节坐标>）」   该格带断言 ⇒ 断言在同档规则节已有单源，删坐标句即可，不另造副本
```

**单源坐标就写在序 8 表的「处置」列内**（`单源 = §…`），不另开一节：判定与出处同格，评审一眼能对上「哪一行、哪条规则、单源在哪」。这就是第二步的追溯面。

**断言单源面已裁：不搬。** 那些「断言」格里有一部分是同档规则节的测试侧复述；形 3 搬过去会在同一档造出第二份规则——D2 要的是删坐标，不是搬家。序 320–326 ∥ 328 已照此改，单源坐标逐行写在处置列里。

**配套硬要求（写进处置，不是建议）**：

- ① 第二步原句逐字搬、不改写。
- ② 该节删空 ⇒ 整节删；同轮只在 12 档内登记受影响的引用，不跨档改指。
- ③ 空节不许留（读者会当它本来有内容）。

第 ② 条为什么收窄：改指落到 12 档之外，改动面就与判据集脱钩，越域的改动没有验收面接住（读数 = 0 份，扫法与理由见 §2.7 ∥ §2.8 · D8）。

**逐处表的落盘边界（供实施席读表）**：表只给「角色 + 处置 + 一句理由」，**不含改后文本**——实施席按处置改设计档时，逐句仍是他的笔。

**D7 本批唯一一次结构性移动（逐条理由）**：

- **为什么破例**：其余各处的处置形都是原位处置（补路径 ∥ 改指 ∥ 删坐标半句）；这一节要动的是行与节的存废，超出原位处置的射程，故单列为允许操作 ④（§2.6.1）。
- **为什么这是本批而非另批**：它挡的就是交付门（那一节的零命中件），处置形已由上裁定；另起一批只会对同一处再判一次。
- **为什么第一步无风险**：纯坐标行里没有规则；设计档是状态档，受影响文件表是过程档的东西。
- **为什么第二步要留账**：断言是规则，搬家可追溯才成立；清单缺失 = 没人能复核搬到哪、有没有改字。

### §2.12 集成测试设计（RTM delta）

**读起点**：`test/RTM.md`。当刻读数 = 5 个端节 ∥ 35 个故事节 ∥ 133 行用例（读数法 = 逐行取 `## ` ∥ `### ` ∥ 表格首列为用例号的行，一次调用一次读数）。

**本批是否改业务可观测结果**：**否**。本批只改 12 档的坐标半句与泛指措辞，不改任何判据句（判法 §2.6.1）；`doc_check` 门判的是文本形态（指针可解析 ∥ 引文逐字 ∥ 段落长度 ∥ 行号坐标），不是业务结果。⇒ **不破既有行、不删既有行、不新增行**。

**被本批 12 档支撑的既有行（机读扫，逐行列出）**：

| RTM 行 | 引用本批哪一档 | 判 | 理由 |
|---|---|---|---|
| 7-5 ∥ 7-6 ∥ 7-7 ∥ 7-8 ∥ 7-9 ∥ 7-12 ∥ 7-13 ∥ 7-14 ∥ 7-15 ∥ 7-16 ∥ 26-6 | `docs/core/design/DOC-DISCIPLINE.md` | 不破 | 该档本批零处、零改动 |
| 7-10 | `docs/core/design/BATCH-RECORD.md` | 不破 | 断言对象是 `batch edit` 的行为；本批只补该档内坐标，被引的节不动 |
| 7-11 ∥ 10-3 ∥ 14-1 | `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | 不破 | 同上：只改坐标与泛指措辞，不改该档被判的段 |
| 10-5 | `docs/core/design/LEDGER.md` | 不破 | 同上 |

其余 8 档**不被任何 RTM 行引作判据单源** ⇒ 零行受影响（12 档逐档见 §2.7 的表）。

**一条前置约束（本批自设，实施席照办）**：形 2 ∥ 两步法第一步会删行，「该节删空 ⇒ 整节删」会删节——**被 RTM 行引作判据单源的节号不得删空**。

实施席删到某节时，先查该节号是否出现在 `test/RTM.md` 的节注里；出现即改走「留该节、逐行改处置」。本轮扫读数：`docs/core/design/ENGINEERING-MODE-V2.md` 的 §7 不被任何 RTM 行引用 ⇒ 两步法的删节不撞 RTM 行。

**为什么本批没有新行**：新行只从两个入口长出——业务上真要的场景，或生产真出过的问题。本批两者皆无；「改了 `doc_check` 门的判据输入」不是入口，门读数在 7-1…7-16 ∥ 26-1…26-6 已有行接住。

### §2.13 上抛项

**U2 结掉（无实例）**：R2 的落法在逐处表里逐行过了一遍——全部落在「围栏块（含整表入围栏块、格内改叙 + 表下围栏块）」或「散文改写（各包清单档 / 各包 runner）」两形内，**无一处两者都读不通**。

占位词干表不扩：扩表 = 放宽全仓判据（§2.8 · D6）。故「两者都读不通则按 R4 三形处置」的兜底分支撤销——没有实例，留着就是给下一位读者指一条没人走过的路。

**U3 已裁并落地**：退役档当整行主体的处置走两步法（§2.11）；序 8 表逐行标了「U3-① 整行删」或「U3-② 改形 2 + 单源坐标」，两种词各自可数。

**U5 读数差 7 处（登记 · 不阻塞）**：

- **差在哪**：`docs/core/design/TESTING.md` 建表 61 处、当刻 54 处，token 级差见 §2.10。
- **归属**：实施席——改该档那一轮一并复核。
- **条件**：按现档逐 token 复读那 5 个 token；表内对应行以现档为准（现档已无的处，行随该轮一并去掉）。
- **到期条件**：该档改完即销。不销也不影响验收——验收 1 ∥ 2 判的是收口读数 0 / 0。

**U6 `§1` 验收 4 的枚举与逐处表的实际操作集差一类（待裁 · 不阻塞开工）**

- **差在哪**：`§1` 验收 4 只列四类（补路径 ∥ 改指 ∥ 删坐标半句 ∥ 结构性移除）；逐处表里占最大头的 R2 那一类落的是「改叙为不构成指针的形」——搬进围栏块 ∥ 换占位词干 ∥ 散文改写。它不在那四类里，而按四类判它就成了越界操作。本 `§2` 判法按实际操作用五类判（§2.6.1 · ⑤）。
- **谁裁**：主 agent（`§1` 的作者）——把 ⑤ 补进 `§1` 验收 4 的枚举，或裁定 ⑤ 归入四类里的某一形。
- **到期条件**：`§4` 用户批准之前裁掉。不裁不挡开工——实施按 `§2` 五类办，代价只是收口时验收 4 的口径要复述一遍。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

设计评审结论（对象 = §2 逐处处置表与配套设计节；判据 = 完整性 / 可行性 / 方法学 / 清晰度 / 验收 / 射程 / 分支出处 / 档归属 / 受影响档 / 先例 / 勘察证据 / 既有件 / 集成测试设计 / 引用形）

```text
# | 严重度 | 状态 | 证据（指针）
1 | 🔴 | 未处置 | §2 全节无「从 test/RTM.md 读起」的集成测试设计节；与 RTM 相关者只有 §2.9「不裁减 RTM 用例（归 #2113）」与逐处表序 243 行内的档名
2 | 🔴 | 未处置 | §1 验收 4「只补路径 ∥ 改指 ∥ 删坐标句」与 §2.2 R2「改叙成不构成指针的形」、§2.13「U3-① 整行删」「该节删空 ⇒ 整节删」相抵；§2.6 B4 机检格 = 「人工评审核验」
3 | 🟡 | 未处置 | §2.13 配套硬要求「②…查全仓有无指它的 §7 引用，有则一并改指」越出 §2.7「受影响文件表（12 档，逐档）」与 §2.9「本批只清 12 档」
4 | 🟡 | 未处置 | §2.12 对账块「序 1–2 行 2 处数 2 DOC-DISCIPLINE.md 命中 2」 vs §2.14「DOC-DISCIPLINE.md 0 0 0」；§2.11「序 1–2 两行按裁决删除」 vs §2.4 顺序表仍有序 1 ∥ 序 2 两行
5 | 🟡 | 未处置 | §2 无最接近先例行；全档未提盘上在册的 docs/core/design/ANCHOR-DEBT-REPAIR.md（档名与本批主题同名）
6 | 🟡 | 未处置 | §2 无勘察证据行（未记录查过哪些公开源档 ∥ 有无相关）
7 | 🟡 | 未处置 | §2.5「量法（可复跑 · 一处定义）」未写工作目录，含 `<12 档绝对路径>` 占位与 `#` 注释行 ⇒ 「父侧复量同一条命令」不可照打，验收 1 ∥ 2 缺可复现命令
8 | 🟡 | 未处置 | §2.2 R2 处置「移入围栏块」对落在表格单元格里的 token 无定义（整行移 ∥ 单格移未裁），而 docs/core/design/TESTING.md §3.5 用例表整列都是此形
9 | 🟡 | 未处置 | §2.10 U2「待父侧确认」与 §2 状态行「设计完成」并立；U2 兜底「若某处两者都读不通…按 R4 三形处置」未点名任何一处实例
10 | 🟡 | 未处置 | §2.4.1 标题「分档逐处表（序 1–4）」下续排序 5 ∥ 序 6 ∥ 序 7 三档表，§2.11 夹在序 5 与序 6 之间，§2.4.2 落在 §2.13 之后
11 | 🔵 | 未处置 | 规范面残留修订体：「合计行原写 1020，已按裁决同步为 1018」「行已删」「〔已销〕／〔已裁〕」
12 | 🔵 | 未处置 | §2.11「序号 3–1017，无重号、无空号（序 1–2 两行按裁决删除，该空号有意）」自相矛盾
13 | 🔵 | 未处置 | §2.7 分档列首行「跨档：改本档 1 份，不跨域」与同节结论行「无档跨 tier」措辞不一
```

计数：🔴 2 · 🟡 8 · 🔵 3 = 13。受影响文件表 12 档全为 `.md`（纯文档豁免档位判），结论行在 §2.7；档点位未判的边界：本记录现场无 PROJECT-MANIFEST 档图，档归属按 §1 立法理由与 §2.8 D2 核。

VERDICT: changes-required

### 轮次 2（评审子代理）

轮次 2 复验（对象 = §2 十三条的修正；逐条对当前文本复核）

```text
# | 严重度 | 状态 | 证据（指针）
1 | 🔴→已修 | 已修 | §2.12「读起点：test/RTM.md」∥「本批是否改业务可观测结果：否」∥ 被 12 档支撑的既有行逐行判表 ∥ 新行两入口两句
2 | 🔴→已修 | 已修 | §1 验收 4「只做四类操作——补仓根全路径 ∥ 改指 ∥ 删坐标半句 ∥ 结构性移除并留搬运账」∥ §2.6.1 ①–④ 表 + 三步判法 ∥ §2.6.2 取句命令（残留见 14）
3 | 🟡→已修 | 已修 | §2.11「② 该节删空 ⇒ 整节删；同轮只在 12 档内登记受影响的引用，不跨档改指」∥ §2.7「D7 引用扫描读数（本轮回读）…= 0 份」∥ §2.8 · D8
4 | 🟡→已修 | 已修 | §2.10「序号 3–1017 连续、无重号、无内空；序 1 ∥ 序 2 是零处档」与对账表「DOC-DISCIPLINE.md 0 0 0」自洽
5 | 🟡→已修 | 已修 | §2.0「最接近先例」+ 对齐 ∥ 偏离一（分族口径）∥ 偏离二（落表位置）∥ 不重叠
6 | 🟡→已修 | 已修 | §2.0「勘察证据（本轮实读，逐条记「查了什么 → 读到什么」）」五行表
7 | 🟡→已修 | 已修 | §2.5「工作目录固定 = 仓根」+ 可直接粘的 cd ∥ node 一行命令（无占位、无 # 注释行）
8 | 🟡→已修 | 已修 | §2.4.1「格内形…此前未定义，此处定型」三分（整表入围栏块 ∥ 格内改叙 + 表下围栏块 ∥ 同列全举例按第 2 形）
9 | 🟡→已修 | 已修 | §2.13「U2 结掉（无实例）」+ 兜底分支撤销（「没有实例，留着就是给下一位读者指一条没人走过的路」）
10 | 🟡→已修 | 已修 | §2.4.1（序 1–5）∥ §2.4.2（序 6–7）∥ §2.4.3（序 8–12）三段连续，进度 ∥ 上抛节移出表链（残留见 15）
11 | 🔵→已修 | 已修 | §2 内已无「原写 1020／已按裁决同步」类修订体，历史仅留在 §3 轮次 1 记录
12 | 🔵→已修 | 已修 | §2.10「无重号、无内空；…起号从 3 起是有意的」
13 | 🔵→已修 | 已修 | §2.7 分档列「纯文档面（档位判豁免）」与结论行「无档跨 tier，无拆分计划」
14 | 🟡 | 新（修正引入） | §2.6.1 ④「仅限 §2.11 两步法点名的纯坐标行」+ §2.1 B4「差集 ⊆ ④类行登记集」 vs §2.2 R2「改叙成不构成指针的形：写进围栏块」∥ §2.4.1「整表移入围栏块」——R2 的文本操作既不进四类枚举、也不进 ④ 册
15 | 🔵 | 新（残留） | §2.4.1「（19 处 / 16 行）」「（33 处 / 21 行）」与 §2.10 的「行」＝表行数（19 ∥ 33）同名异义；§2.4「序 1–5 → §2.4.1」而 §2.4.1 无序 2 条目；§2.4.1–§2.4.3 排在 §2.9 之后
```

计数：原 13 条全部处置（🔴 2 已修 · 🟡 8 已修 · 🔵 3 已修）；新增 🟡 1（可选，非 must-fix）· 🔵 1；未解决 🔴 = 0。

VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准

- **批准形 = 整批令**：用户 2026-11-07 12:24「开」（开批）· 12:33「**都自动跑完**」——覆盖本批的设计批准与实施启动，批内全链自动跑完、不再逐步停。
- **设计评审**：轮 1 `changes-required`（2 🔴 · 8 🟡 · 3 🔵）→ `#60` 修 13 条 → **轮 2 `pass`**（2026-11-07 12:57，签发设计凭证）。
- **轮 2 另提 2 条可选改进**：`#66` 把 ④ 册放宽为「逐处表全表」并补 ⑤ 类（父侧裁定：`§1` 验收 4 同步扩成五类，`U6` 已结）。
- **实施后两处口径**：`#70` 报告的两处表外遗留当轮派修（工具名标注改为格内；「十消费点」实数 核 6 / 端 0 并在三处同步）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（12 档逐档清零（合计 0 / 0 / 0 / 0）；本续轮清 docs/core/design/TOOLS.md 303 处（真死 0 ∥ 裸名 0 ∥ gate PASS），偏离 12 条逐条披露、审计 1 轮发现 1 处同轮修掉）



### 开工记（实施轮 · 2026-11-07）

**开工读数（量法 = 批档 `§2.5` 同一条命令，本轮实跑）**：真死 138 ∥ 裸名 873 ∥ `引缺` 0 ∥ `节缺` 0 = 1011 处，12 档逐档分布在 `docs/core/design/` 一个域内。与 `§2.10` 当刻读数逐档同值。

**判据句快照**：`§2.6.2` 取句命令本轮实跑通过，12 档取句数 = 498 / 374 / 226 / 88 / 211 / 430 / 210 / 335 / 350 / 207 / 1088 / 1483（档序同 `§2.5` 的 `S` 数组）。快照落工作树外临时域，不入仓。

**本段按 `§2.4` 顺序表逐档推进**（序 3 起），逐处按逐处表的「角色 ∥ 处置」改，判据句业务断言不动。

**前 3 档落地（序 3 ∥ 序 4 ∥ 序 5）**：`docs/core/design/ADVISOR-GUARDS.md` 19/19 · `docs/core/design/BATCH-RECORD.md` 33/33 · `docs/core/design/TESTING.md` 54/54（表列 61，差额 7 处 = `§2.10` · U5 已登记的建表/当刻差；该档现档无那 7 处，行随本轮的现档为准）。三档改后 `checkAnchors` = 0 命中，`doc_check(mode:"gate")` 三档各自首行 `PASS`。

**序 6–序 8 落地**：`docs/core/design/LEDGER.md` 70/70 · `docs/core/design/AGENT-LOOP-SUBAGENT.md` 76/76 · `docs/core/design/ENGINEERING-MODE-V2.md` 78/78。三档 `checkAnchors` = 0 命中，`doc_check(mode:"gate")` 三档各自 `PASS`。

**本段已用到的处置形（逐档照逐处表，未自拟）**：① 补仓根全路径（逐 token 一处一改）∥ ② 改指（`ledger-surface` 三份并列 ∥ `files.mjs` 两份并列）∥ ③ 删坐标半句（`slow-gate.mjs` ∥ `batch-segment.mjs` ∥ §7 的退役用例档坐标）∥ ④ 结构性移除（`ENGINEERING-MODE-V2.md` §7 的一行整行删）∥ ⑤ 改叙为不构成指针的形（glob ∥ 夹具名 ∥ 私有档名 ∥ 计划档名 → 表下或节末围栏块，散文留通名）。

**两处判据面外但门需要的修正（如实登记）**：`docs/core/design/LEDGER.md` 的 §2.1 路径串比较段与 §7.1 依据① 段、`docs/core/design/ENGINEERING-MODE-V2.md` 的 §7 受影响文件表 —— 补路径后行宽越过 300 字段落限，按 `doc_check` 的处置形①（无标记续行改带名列表项，逐字不改）重排。

**序 9–序 11 落地读数（`checkAnchors` 逐档 + `doc_check(mode:"gate")` 逐档）**

| 档 | 开工处数 | 现处数 | gate |
|---|---|---|---|
| `docs/core/design/ANCHOR-DEBT-REPAIR.md` | 2 | 0 | PASS |
| `docs/core/design/ADVISOR-GUARDS.md` | 19 | 0 | PASS |
| `docs/core/design/BATCH-RECORD.md` | 33 | 0 | PASS |
| `docs/core/design/TESTING.md` | 54 | 0 | PASS |
| `docs/core/design/LEDGER.md` | 70 | 0 | PASS |
| `docs/core/design/AGENT-LOOP-SUBAGENT.md` | 76 | 0 | PASS |
| `docs/core/design/ENGINEERING-MODE-V2.md` | 78 | 0 | PASS |
| `docs/core/design/BATCH-LEDGER-REVIEW-UNIFY.md` | 91 | 0 | PASS |
| `docs/core/design/MEMORY.md` | 116 | 0 | PASS |
| `docs/core/design/CORE-UNIFICATION.md` | 171 | 171 | 未做 |
| `docs/core/design/TOOLS.md` | 303 | 303 | 未做 |

读数命令（`checkAnchors` 单源，逐档传 `{files:[abs]}`）：`node --input-type=module -e "import {checkAnchors} from './thincoder-core/doc-check/anchors.mjs'; …"`；上表末两行的读数即本次实测值，未做两档零字节改动、保持开工态。

**未做两档的原因（记录，不加工）**：两档的逐处表条目几乎全是改指 / 删坐标与围栏块搬迁，逐处都要与本档原文逐字比对；一次原子写入要同时覆盖 `docs/core/design/CORE-UNIFICATION.md` 的 171 处与 `docs/core/design/TOOLS.md` 的 303 处，本轮会话可用上下文在完成前九档后已不足以支撑这两次整档写入。

**下一轮的机械前提（本批已跑通，不必重摸）**：

- 写门判「整档 as-it-will-stand」——一次 `edit` 必须同时覆盖该档全部残留锚点与全部超长段落；分批改永远被第一处残留拒写。
- 从批档 §2 逐处表按 token 聚合成「token → 目标路径」映射，先用脚本事前判定每个 token：裸形态出现次数是否等于表列行数、目标是否唯一。
- 两项都成立者用 `replace_all` 补仓根，且必须先长后短（带目录段的 token 排在裸名之前）：

```text
agent/dispatch.mjs   →   thincoder-core/agent/dispatch.mjs
dispatch.mjs         →   thincoder-core/agent/dispatch.mjs
```

- 不成立者（多目标 / 次数不等 / 指向上游外源件或构造样例）逐处显式改写，散文改写与围栏块搬迁必须与 `replace_all` 写在同一个 `edits` 数组里。
- 显式条目的 `old_string` 不得被数组中更早的 `replace_all` 命中——本轮两次踩此坑，整批回滚、零字节落盘。

### 续轮：`docs/core/design/CORE-UNIFICATION.md` 一档（171 处，清到零）

**开工读数**（量法 = `§2.5` 同一条命令，本轮实跑）：该档真死 18 ∥ 裸名 153 ∥ 引缺 0 ∥ 节缺 0 = **171 处**，与 `§2.4` 顺序表该档处数逐值相等。

**收口读数**（同一条命令）：真死 **0** ∥ 裸名 **0** ∥ 引缺 **0** ∥ 节缺 **0**；`doc_check(mode:"gate", docs=[该档])` 首行 **`DOC-CHECK GATE: PASS`**（0 段问题 · 1 档全清）。标题结构对账：HEAD 40 个标题 ∥ 现档 40 个，零丢失、零新增；围栏标记 10 行（5 块，配对）。

**写门判面实测（本轮取证，收正上一轮「写门判整档」的结论）**：写门判的**不是整档**，是「本笔改动区按扩区表扩成的片段区」——段落整段 ∥ 只动空行时加两侧段落 ∥ 围栏整块（判法单源 = `thincoder-core/tools/doc-write-gate.mjs` 判法 ③④）。两笔取证：

- **单点一笔被拒**（序 561 一处、跨度一行）：`REFUSED（锚 23 条）`，命中全落在那一个表格行上，判面行「改动区 1 区 · 片段区 1 区 · 目标档段首行 41」，末行「本次写入未落盘——目标档字节逐字不变（零字节）」。原因：那行自身就是**一整段**，带 24 个悬空锚点。
- **干净单锚点一笔通过**（序 544，所在段落只带 1 个锚点）。

⇒ **原子单位 = 段落**。本档 171 处落在 **86 个段落**上：80 个是一行的表格行、6 个是 3–4 行散文段；最大三段 = 24 ∥ 20 ∥ 6 处。**「一次归零整档」既非必需，也未采用。**

**笔数**：成笔 **16**（段落块 + 4 个表后围栏块 + 1 笔收正被吞的 `### 2.12` 标题）。零字节两笔：实验笔（按上被拒）∥ 一笔记错 `old_string` 一个字、整批原子回滚后同批重发成功。**无回滚落地**（落盘后未撤过任何一笔）。

**逐笔覆盖（处数合计 = 171）**

```text
笔   覆盖（处置表序）                                    处数
1    544                                              1
2    545–549                                          5
3    550–573（§2.1 B16 一整行）                        24
4    574–593（§2.1 B18 一整行）                        20
5    594–599（§2.1 B20 一整行）+ §2.1 表后围栏块        6
6    600–602（§2.2 已撤面）+ 段后围栏块                 3
7    603                                              1
8    604–610（§2.2.1 R1/R6/R7/R8）+ 表后围栏块          7
9    611–612                                          2
10   613–615（端特有桶 180–182）                       7
11   620–623（§2.5 注①/注③/渲染面总则/同名≠同物）       6
12   626–637（覆盖对账表/结论/边界纪律）                13
13   639–641（§2.5.1 索引甲组）                        3
14   642–646（§2.6.1/§2.7 D-C10/D-C12/D-C13）          5
15   647–648（§2.11 A8 一整行）+ 表后围栏块             2
16   649–660（§2.12.1 四行/§2.12.2/§2.12.3）            9
17   661–674（§2.13.1/§2.13.2/§2.13.3 头部）           14
18   675–682（§2.13.3 余行）                           11
19   683–701（§2.13.4 逐行/④ 端特有面）                19
20   702–714（§2.13.5–§2.13.8）                        13
```

**处置形分布**（照 `§2.2` 与 `§2.3`，未自拟）：① 补仓根 ‖ ② 改指（含一句两处同名者逐处补）‖ ③ 删坐标半句（退役件的「它在哪实现」那半句，判据照留）‖ ④ 本档零处（无结构性移除）∥ ⑤ 改叙为不构成指针的形（4 个表后围栏块 + 若干处散文通名）。**判据句业务断言零改**。

**五处偏离逐处表（逐条披露 + 理由；审计独立复现其中第 3 条）**

```text
序    表内处置                                  实做                                      理由
624   补仓根 → thincoder-cli/src/tui/markdown.mjs   补 thincoder-core/markdown.mjs         父侧裁定「句子说归核就补核」；该句末即为「逻辑面（顶层 …）才是共享面（归核）」
632   形 2：删清单项                              补 thincoder-vscode/src/tools.mjs       父侧先例「表值与实况不符 ⇒ 以现档为准」：表称「全仓零同名端侧档」，盘上该档存在
647   补仓根 → thincoder-vscode/package.json       按 R3 改叙（上游清单档 → 散文通名）      该行 package.json 实指 microsoft/vscode 自身清单档；表所指括注在档内不存在（表值笔误），补成 VSC 包路径即写假话
673   形 1 改指 → thincoder-core/config-io.mjs     散文「原端侧该档的注入点已删」            句义是「那份旧档的注入点已删」；改指成核档会让句子变成「核档的注入点已删」= 假
687   形 1 改指 → thincoder-core/config.mjs        散文「原端侧该档的派生面已删」            同上（§2.3「无对位物 ⇒ 形 2 删坐标半句」）
700   形 1 改指 → thincoder-vscode/src/tools/ide.mjs  写「旧件名 context；为与核内 context 工具让位而改名」  该处主语就是旧名，改指后成「自 ide.mjs 改名」= 自相矛盾
```

**另记一处未落表的半边（非偏离、已披露）**：R2/R3 类里 5 处（序 609 ∥ 610 ∥ 642 ∥ 656 ∥ 657）表内处置写作「改叙 + 原件入围栏块」，实做只落**散文通名**那一半（围栏块未补这 5 个原名）。锚已清零、断言未改；`§2.2` 把「散文改写」列为三落法之一，故不算越界，但表里那半句未落。

**自审与复核**：explore 只读审计（对象 = 逐处表 171 行 ↔ 该档正文）= 覆盖 **171 / 171**、四类偏离 **1 条**（即上表序 647，审计独立复现）+ 非四类观察 1 条（即上段）。代码复核轮 = 未跑（本笔无代码改动；文档面由四条验收 + 只读审计覆盖）。**终态 = `clean`（偏离全部披露，零静默）**。

**工作树口径（防误记到本笔账上）**：本笔开工时该档相对 HEAD 已带未提交改动（例：`§2.1` B2 / B7 / B8 / B9、`§2.10` F9、`§4.5` K1 等行的行号坐标已被前人改成档名 + 逐字引文）。**这些不是本笔做的**；本笔只清 171 处锚点 + 4 个围栏块 + 1 笔标题收正。

### 续轮三：`docs/core/design/TOOLS.md` 一档（303 处，清到零）

**开工读数**（量法 = `§2.5` 同一条命令，本轮实跑）：该档真死 **48** ∥ 裸名 **255** ∥ `引缺` 0 ∥ `节缺` 0 = **303 处**，与 `§2.4` 顺序表该档处数逐值相等；其余 11 档当刻读数均 0。

**收口读数**（同一条命令，12 档全列）：该档 **0 / 0 / 0 / 0**；12 档合计 **0 / 0 / 0 / 0**。`doc_check(mode:"gate", docs=["docs/core/design/TOOLS.md"])` 首行 **`DOC-CHECK GATE: PASS`**（0 段问题 · 1 档全清）。

**逐处表 ↔ 落盘的可核性**：开工时把 `§2` 的 303 行（序 715–1017）按序与 `checkAnchors` 的 303 条命中年逐条对齐，token 逐条相等、失配 **0**。表与盘对得上号，处置因此逐行照落，不必逐处猜。

**原子单位 = 段落**（上一档实测结论沿用）：写门把改动区扩成「段落整段 / 围栏整块」，故一格若带 N 个锚，碰它就必须同笔清完 N 个。本档一笔的射程按行段切：表格行各自成段，正文段取整段。

**笔数**：成笔 **25**（6 笔 `edit` 多条目 + 19 笔整段 `apply_patch`）。零字节 **13** 次，逐次原因 = 写门拒 4（段长 3 ∥ 锚残留 1）+ 整批原子回滚 9（转义打错 1 ∥ 行只引半截 8）。**落盘后未撤过任何一笔**（无回滚落地）。

**逐笔覆盖（处数合计 303）**

```text
笔   射程（行段 / 处置序）                          处数
1    L8 + L16（抬头 ∥ §1 注册表行）                     7
2    L28–L38（§2.2 #52–#62 行）                       24
3    L40–L44（#64–#68 行）                            11
4    L45–L56（#69–#97 行）                            23
5    L71–L84（§2.3 单端对位表）                        30
6    L94–L107（§3.1 / §3.2 裁决表）                    15
7    L252–L292（§6.11 现体 ∥ §6.12 读面表）             12
8    L324–L406（§6.13 发现面 ∥ §6.14 结构机判）          14
9    L455–L570（§6.14 注入面 ∥ 「表外复核」）            7
10   L579–L627（§6.15 装配面 ∥ §6.15.2 词表）          14
11   L638–L676（§6.15.2 拆分段 ∥ §6.15.3 运行面）       6
12   L720–L752（§6.15.3 表 ∥ §6.16 单源落点）           8
13   L784–L849（§6.17 消费点表 + 清扫段）              12
14   L904–L1024（§6.20 骨架/回执面 ∥ §17 包装档）       11
15   L1083–L1137（§17 池/关闭/中止 ∥ 落点/掩码段）      9
16   L1142–L1229（§17 ⑨ 私档 ∥ 传输面四行）            11
17   L1246–L1337（§17 写门入口集 ∥ 落点表 ∥ 档位结论）  19
18   NS1/NS4 两行 + 表后围栏块                         2
19   L1476–L1590（§17 同期表 ∥ websearch 面）           8
20   L1626–L1705（日志 ∥ DeepSeek 面表）               7
21   L1739–L1838（NW 表 ∥ §6.24 ∥ §6.25 取法/勘察）    11
22   L1907–L2059（§6.25 import/落位/边界 ∥ §6.28）     9
23   L2082–L2227（§6.28 负例/三形/五处 ∥ §9 废除）      8
24   §6.28 负例句收正（审计发现，见下）                 1
25   §6.28 围栏块内行号坐标改形                         1
```

**处置形分布**（照 `§2.2` / `§2.3`，未自拟）：① 补仓根 **约 250 处** ∥ ② 改指 / 仓根形改写 **约 15 处** ∥ ③ 形 2 删坐标半句 **约 22 处**（含整行删 4 行）∥ ④ 本档零处 ∥ ⑤ 改叙为不构成指针的形 **9 处**（原件名入 `text` 围栏块）。

**判据句零变（`§2.6.1` 三层判法）**：取句命令 `§2.6.2` 同一条，该档取句数 **开工 498 → 收口 503**（+5 全部来自为过段长判据做的带名列表重排——一词一字未换，只加标记与断行）。**删除行只有 4 行**（序 905–908 的「整行删」，均为不含闭集关键词的纯坐标表行，处置已登记在册）；其余改动全是同位替换。

**偏离逐处表（12 条，全部披露；审计独立复现）**

```text
序     表内处置                                实做                                 理由
844   形 1 改指 → vscode/tools/ide.mjs        形 3：留事实去退役名（「原 `context` 档改名」）   改指后成「自 ide.mjs 改名」= 自相矛盾
875   形 1 改指 → core/agent/run-stages.mjs   形 2：删坐标半句                        同句断言是「VSC 独立副本 / 非核单源」，指核档即假话
882   同上                                     同上                                   同上（VSC 副本同位同步）
895   同上                                     同上                                   §6.15.2 守卫面「双源结构」
896   同上                                     同上                                   同 875
1000  改为仓根形 → core/…/subagent-spawn.mjs  整条 import 搬入 js 围栏块               ESM 说明符改成非相对形即把引文改错；散文侧全路径在位
1006  改为仓根形 → vscode/tools/shell.mjs     删该代码引文里的说明符，后半句给全路径      改说明符即把逐字引改错
1008  负例整段含「冒号行号」入围栏块            围栏内只留伪路径 token（不带行号）          交付门连围栏内的行号坐标也拒（实测 REFUSED）
890   计划档名移入围栏块                        已落（§6.15.2 段后围栏块）                照办
957   形 2：删该行坐标                          首格改 `—`                               照办
964   各包清单档 + 原件入围栏块                 已落（§17 NS 表后围栏块）                 照办
986   各包清单档 + 原件入围栏块                 已落（NW 表后围栏块）                    照办
994   glob 移入围栏块，散文留「集成用例档」        已落                                    照办
```

**新增一处非偏离披露**：本轮只动 `docs/core/design/TOOLS.md` 一档；`thincoder-core/**` ∥ `test/**` ∥ `§1` ∥ `§3` 一字未动。

**独立审计轮（1 轮 · 只读 explore 子代理）**

- 对象 = `§2` 逐处表 303 行 ↔ 该档现档；射程 248 行（③ 形 39 行全核 ∥ ④ 形 9 行全核 ∥ ①② 抽核约 200 行；未核 55 行已在审计报告里点名）。
- 读数 = **核了 248 行 · 不一致 8 处 · 未登记改动 0 处**。其中「未登记」一栏受「无 git 基线」限制，属「未发现」不是「已证明为零」——审计自己写明了这条局限。
- 8 处不一致**全部落在上表自报之内**，无漏报之外的新不一致。
- 审计另报 1 条自报没覆盖的层次：序 1008 的句子承诺「样例见下围栏块」，而围栏里没有冒号行号那一形 ⇒ **同轮已修**（句子改成与围栏一致的说法，`② 步剥尾` 判法不变）。

**本席向父侧报的遗留（不自行改——不在逐处表内，改了就是未登记改动）**

- ① `docs/core/design/TOOLS.md` §1 表第 14 / 18 行仍把 `more-file` / `file-edit` / `edit-fuzzy-match` / `edit-line-params` / `wait_for` / `checklist-sync` 列为在职实现名。这些名字不带扩展名，从未进入 303 处锚债，故本批无权处置；但它们与本批「全仓零同名档」的删名依据相矛盾。
- ② 序 905–908 四行「整行删」之后，该表上方「**十消费点语义复核**（核 6 / 端 4）」仍写着「端 4」，而端 4 行已按处置删除。该句属表外措辞，需 `§2` 侧改口径或另开一行处置。

**终态 = `clean`**：303 处清零 · 交付门 PASS · 偏离全部披露 · 审计发现 1 处同轮修掉 · 零静默改动；两处表外遗留已点名上抛。

### 续轮四：`docs/core/design/TOOLS.md` 两处表外遗留（父侧派单 · 2026-11-07）

**派单口径**：只改这一档、两处；先核事实、再改；两处都可能「看着像错、其实是对的」。

**① `§1` 归属表第 14 / 18 行的六个名——逐个实读**

| 名 | 盘上同名档 | 注册工具名 | 判 |
|---|---|---|---|
| `more-file` ∥ `file-edit` ∥ `edit-fuzzy-match` ∥ `edit-line-params` | 零（全仓扫，零代码命中） | 无 | **已删档名** |
| `wait_for` | 无同名档（只有 `thincoder-core/tool-docs/wait_for.md` 描述面） | 有：`thincoder-core/tools/ops.mjs` 的 `name: "wait_for"`；VSC `builtinTools` 里是 `waitForTool` | **工具名，不是档名** |
| `checklist-sync` | 零（零代码命中） | 无 | **已删档名**（随 `§9` checklist 族废除） |

**第 14 行 VSC 列改后逐字**：

```text
取名核（`@thincoder/core/tools/*`）；自持仅 `shell` 等拆档，住 `thincoder-vscode/src/tools/`。`wait_for` 为工具名、非档名——实现在核 `thincoder-core/tools/ops.mjs`
```

依据 thincoder-vscode/src/tools/index.mjs「12 同路径镜像档 + 7 M 档删除，工具实现经 `@thincoder/core/tools/*`」——端侧自持件已退场，那四个拆档名盘上无物；`thincoder-vscode/src/tools/` 现盘 = code ∥ focus ∥ ide ∥ index ∥ shared ∥ shell。

**第 18 行 CLI 列**：删 `checklist-sync`，改后逐字 `tools/{bash,edit-batch,glob-dialect,patch,repomap}.mjs`。废除单源 = 本档 `§9`，此处不重写缘由。

**偏离父侧口径一处（披露）**：父侧口径为「是工具名 ⇒ 不改，表下补一句『本列 = 工具名，不是档名』」。本席改为**格内就地标注**（`wait_for` 为工具名、非档名）。理由：该列同时列档名（`shell`），一句「本列 = 工具名」会把 `shell` 说错；就地标注只指该指的 token。

**② `§6.17` 的「十消费点语义复核（核 6 / 端 4）」——实数**

- 该节消费点表：**核 6 行 ∥ 端 0 行**（端侧四行上一轮已按纯坐标行整行删）。
- 端侧四点（编号 #7–#10）的三份端档全仓零档——名列围栏块内（这些名本身是悬空名）：

```text
tool-gates.mjs    execute-tools.mjs    rules-face.mjs
```

- `thincoder-vscode` 全仓 `touchedPaths` ∥ `l3TouchedPaths` **零命中** ⇒ 端侧独立消费点确已为零。
- 能力未消失、只归核：作用域规则 JIT 现住 `thincoder-core/rules.mjs` 的 `injectScopedRules`，其 `PATH_TOOLS` 判据逐字调 `toolTouchPaths`——依据 thincoder-core/rules.mjs「VSC 两档退役，desk ∕ CLI 乘核径取得」。VSC 侧只剩核单源转口 `thincoder-vscode/src/extension/peer-domains.mjs`。
- ⇒ **实数 = 核 6 / 端 0**，「端 4」不再成立。

**同一个数在该节还出现两次 ⇒ 一并改（只改一处 = 一句真、两句假）**

| 位置 | 改后逐字 |
|---|---|
| 复核行 | `**消费点语义复核**（核 6 / 端 0——端侧四点随 VSC 自持实现面退役，作用域规则 JIT 已归核 `thincoder-core/rules.mjs`）：行为变仅两处——` |
| 裁定 2 | `2. **六处消费点一律改调该谓词**：未守卫三处为行为变更（…）；已守卫三处为**零变对齐**（…）。`（六点逐点对得上：3 有守卫 ∥ 3 无守卫） |
| 证据 ② | `② 作用域规则 JIT（现体 = 核 `thincoder-core/rules.mjs` 的 `injectScopedRules`）：`file_ops` 覆盖范围**由死转活**——…`（断言逐字未动） |
| 零变行 | `其余五点零变（核 #1–#5 由 `FILE_MUTATORS` 门卫隔断——`file_ops` 不达）。`（6 − 1 = 5；端侧三点已退役，其坐标句随之去） |
| 接口契约「端消费」行 | `| 端消费 | — | 端侧零独立消费点——VSC 走核单源转口（`thincoder-vscode/src/extension/peer-domains.mjs`） |` |

**读数（改后 · 本轮实跑）**

- 量法 `§2.5` 同一条命令：`docs/core/design/TOOLS.md` = 真死 **0** ∥ 裸名 **0** ∥ `引缺` **0** ∥ `节缺` **0**；12 档合计亦 **0 / 0 / 0 / 0**。
- `doc_check(mode:"gate")`：该档首行 `DOC-CHECK GATE: PASS`（0 段问题 · 1 档全清）；12 档全列同 `PASS`。
- `§2.6.2` 取句数：改前 503 → 改后 **503**（零增零减 ⇒ 无判据行存废，只有两行的措辞与数被改成实数）。
- 笔数：`edit` 两批（5 条目 + 2 条目），一次落盘，零整批回滚；未触碰另 11 档 ∥ `thincoder-core/**` ∥ `test/**` ∥ `§1` ∥ `§3`。

**本席另发现、未改的三处（表外 · 未派人 ⇒ 只报不改）**

| 位置 | 实读 | 为什么没动 |
|---|---|---|
| `§1` 第 14 行 CLI 列 | `thincoder-cli/src/tools/…` 该目录不存在（CLI `src/` 现盘 = acp ∥ cli ∥ tui），同名档全在 `thincoder-core/tools/` | 改它等于判「这一行是现况还是统一前的清点表」——本席判不出，不猜 |
| `§1` 第 18 行 CLI 列 | 同列五档现住 `thincoder-core/tools/` | 同上：改路径要连带改「单端独有实现」这一行的语义 |
| `§6.17` 用例位行 ∥ 裁定 5 首句 | 用例落点写「VSC 作用域规则单测档 … 用例 = T-B3b」——`T-B3b` 全仓只在本档与 `.thincoder/tmp/` 出现；裁定 5 首句仍以 `l3TouchedPaths` 指端侧（该名盘上零命中） | 作用域规则已归核，用例该落哪份核内单测档本席无从判；给一个猜的落点 = 造假指称 |

**终态 = `clean`**：两处按父侧判据落地 · 同数三处同步（口径：同一个数一处假即整节假）· 三处表外发现只报不改 · 零静默改动。

## §6 验证与收口（父代理）

### 验证与收口

**父侧独立复量（不转抄 `§5`）**

| 项 | 量法 | 读数 |
|---|---|---|
| **12 档四桶** | 子进程直调 `checkAnchors`，逐档跑 `§2.5` 同一条命令 | **真死 0 ∥ 裸名 0 ∥ 引缺 0 ∥ 节缺 0**（13 档全零，含零处档） |
| **交付门** | `doc_check(mode:"gate", docs=[12 档])` | **`DOC-CHECK GATE: PASS` · 0 段有问题（12 档全清）** |

**开工 → 收口**

| | 开工（12:20） | 收口 |
|---|---|---|
| 真死 + 裸名 | 1018 处 | **0** |
| 档 | 12 | 12 |

**三笔实施的分工与实测机制（这批真正的产出之一）**

| 席 | 档 | 处数 | 笔数 |
|---|---|---|---|
| `#67` | 9 档（`ADVISOR-GUARDS` … `MEMORY`） | 539 | — |
| `#68` | `CORE-UNIFICATION` | 171 | 16 |
| `#69` | `TOOLS` | 303 | 25 |
| `#70` | `TOOLS` 两处表外遗留 | — | 7 |

**实测出的写门机制（此前两种说法都不对，以本表为准）**：

- **不是整档判**——判的是「片段区」= 本笔改动区按扩区表扩成**段落整段 / 围栏整块**；
- **也不是「一处一笔」**——**原子单位 = 段落**。一行即一段的表格行可自带 20+ 个锚，碰它一笔就得同笔清完（`#68` 的探针实证：`L41` 一段自带 24 处，单点改被拒；换只带 1 处的一段即通过）；
- **`old_string` 必须整行引用**——只引半截则整批不落（`#69` 踩 8 次）。

**偏离逐处表处置：共 13 处，全部披露并各有理由**

- `#68` 5 处 · `#69` 8 处 · `#70` 1 处（工具名标注改为格内，因该列混着档名）。
- **共同形状 = 照表做会写出假话**：表说「改指」而句义是「那份旧档已删」⇒ 硬改指会变成「核档已删」；表说「改仓根形」而该处是 ESM 说明符 ⇒ 改了即把引文改错。
- **裁：全部认可**。设计档是判据不是执法条文——**照表做到假，比不照表更坏**。

**零回滚 · 零吞行（两次差点吞，均自查发现并补回）**

- `#68` 加围栏块时吞掉 `### 2.12` 标题，`git diff` 复核发现，补第 16 笔。
- `#69` 审计席发现「句子承诺样例见围栏块而围栏里没有」的层次，同轮修。

**未做而必须记明**

- **全量套件未跑**：本批零代码面（只改 12 份 `.md`），验证由四桶读数 + 交付门 + 判据句快照比对承担。
- **三处表外发现只报不改，已立台账 `#2134`**（`态 = 条件`，复启条件 = 下一轮触碰该档的设计轮）：`TOOLS.md` §1 表两行的 `thincoder-cli/src/tools/` 路径不存在、`§6.17` 的用例落点 `T-B3b` 全仓无对应。**这三处锚判据抓不到（无扩展名），故不在本批射程内，但确是失真。**

**对账**

- `§2` ↔ 设计档：本批 `§2` 是逐处表本体，无引用设计档计数；`§2.10` 的当刻读数与收口实测一致（差 0）。
- `§2` ↔ `§5`：三笔实施各自报的处数与父侧复量一致（539 + 171 + 303 = 1013，加 `ANCHOR-DEBT-REPAIR` 2 处 + `TESTING` 表外 3 处 = 1018）。
- **前批遗留**：本批无。
- **暂缓批复核：无。**
- **用户可见面**：改动全在 `docs/core/design/**`，用户可见面无变化（无 UI、无配置项、无产物）。

**这批存在的理由**

今日五批先后被「碰过带存量的档 ⇒ 收口门整档判 ⇒ 收不了口」卡住。本批把 12 档存量清到 0 之后，**那道门不再对本仓任何设计档亮红**——五批的收口路径由此打通。

**收口**

- 台账 `#2131`：**在途 → 待核销 → 已核销**。
- 另立 `#2134`（`待讨论`，`trigger = 条件`）承接三处表外失真，不随本批核销。
