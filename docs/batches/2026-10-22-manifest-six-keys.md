# 2026-10-22 · manifest-six-keys
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-22 · 来源 = 用户令（2026-10-22 10:19-10:22）：用户 manifest 不许带产品内部键——删 promptsLanding（产品源码布局）∥ checkConfig（机检参数走内置）；八键 → 六键。
> 台账 = #1730（CORE · 归批）。前情 = docs/batches/2026-10-22-doc-search-route.md（在途）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-22
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

## 讨论记录

**用户三句（逐字）**

1. 10:19「用户仓创建出来的manifest为什么会包含这样一行：`"promptsLanding": "thincoder-core/prompts"`」
2. 10:21「**不要有这个键，这是thincoder产品内部的事儿，挂到用户那边是几个意思？**另外默认哪八键一起列出出来审核一下。」
3. 10:22「**checkconfig也去掉，现在都走内置工具了，不要留着误导。**」

**八键审核结论（父侧逐键实读）**

| 键 | 声明的是什么 | 读它的人 | 判 |
|---|---|---|---|
| `version` | manifest 档自身 schema 版本 | schema 校验 · 写门 | 留 |
| `phase` | 这个项目的阶段 | 枚举校验 · `write-gate` / `permission` / `dispatch*` | 留 |
| `docRoot` | 这个项目的文档层位置 | `declaration` · `write-gate` · `batch-*` · `advisor` · `review-facts` · doc-check | 留 |
| **`promptsLanding`** | **thincoder 产品源码布局** | **零 reader** | **删** |
| **`checkConfig`** | **doc_check 的参数（产品工具参数）** | doc-check 全族 | **删（参数内置）** |
| `codePaths` | 哪些目录段算代码面 | `conventions` · `declaration` · `verify` · `dispatch` | 留 |
| `index` | 这个项目的索引配置 | `declaration` + 文档索引 | 留 |
| `advisor` | 这个项目的评审指针 | `advisor/project-context.mjs:141` / `:170` | 留 |

**代价与迁移**：`doc_check` 现以 `checkConfig` 为唯一参数源，`gate` 模式「缺该键 ⇒ 拒跑」（`doc-check/index.mjs:167-170`）——删键必须同步把参数落代码常量，并把那条拒跑语义删掉。旧 manifest 的两键按未知键处理（`manifest-schema.mjs:92` **非拒**），下次写盘 `fillDefaults` 自然清除 ⇒ **无迁移脚本**；**不留「接受但忽略」分支**（那就是「留着误导」本身）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修轮 #78+1：checkConfig 33 行 / 39 处收口 + 解析序两级已落；doc_check 新进程 REFUSED 余 55 条全属 #1731（待裁））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批覆盖（FR42 需求 1–7 + 用户 10:24 / 10:27 两令）**

1. **键集八键 → 五键**：`version` · `phase` · `docRoot` · `codePaths` · `index`；`promptsLanding` / `checkConfig` / `advisor` 三键整键删除（用户 10:21 / 10:22 / 10:24 三令）。
2. **评审注入面由 `docRoot` 派生**：`advisor` 退场后 Document Map 走两级探测（声明根 README → 公共祖先 README → 显式降级句）；standards 注入面撤除、保留显式降级句；`declaration.mjs` 的 `advisor.*` 投影零残留。
3. **`doc_check` 只判调用方传入的文件**（用户 10:27）：删 `scanDirs` / `domain` / `roots` / `exclude`；`report` 无清单 ⇒ 可读报错；不读 manifest；参数只剩 `lineWidth` / `widthExemptZones` / `exemptions`。
4. **锚解析序收为两级**：仓根相对全路径 ∥ 引用档同目录；`§N` 判定只读命中目标档（点查，不遍历）。
5. **迁移**：三键残留 = 未知键（非拒）⇒ 下次 `write` 经 `fillDefaults` 自清；无迁移脚本、无「接受但忽略」分支。
6. **计数与文档连带**：见下方落点表。
7. **本仓 `PROJECT-MANIFEST.json` 删三键**（实施轮）。

**不在本批**：本仓 696 条裸名指针改全路径（台账 `#1731`，另批机械改名）；需求档（主 agent 笔）；产品代码（eng-coder 实施轮）。

**设计落点**

| 档 | 落点 |
|---|---|
| `docs/core/design/MANIFEST.md` | §2.11 新增（方案 / 接口契约 / 受影响文件 / KD-M1-42–46 / AC-45–50 / T79–83 / 边界）；同档五键逐处收正：§1.1 / F1 / F4 / N3 / §1.4 / §2.1#1 / §2.2 接口（MANIFEST_SCHEMA · DEFAULT_MANIFEST · 缺键粒度）/ KD-M1-36 / KD-M1-38 / §2.5 计数与零改句 / scripts 行 / §2.10 写面白名单 · 键目录（12 节点）/ AC-29 · AC-40 · AC-41 / T1 · T2 · T58 · T66 |
| `docs/core/design/DOC-DISCIPLINE.md` | §3.20 裁定 + 范围与参数面 · gate 适用面 / 取参失败 · §3.18 ② 域 / 区带 · §7 F2 / F4 · AC-M8-2 / AC-M8-6 |

**读数（设计轮实测 · 现引擎）**

- 旧口径（全声明域扫描）本仓：**327 档 ⇒ 锚 3946 条 / 行宽 875 条**——即用户所指「扫全仓导致技术待办爆炸」的量化。
- 只去 `roots`（其余声明保留）：锚 0 → **696 条唯一命中（731 次）**，分布 `docs/core/design/**`（非 TODO 档）——本仓裸名指针债。
- 只去 TODO 两名排除：+83 锚 / +62 行宽（全在 `docs/TODO-archive.md`）；只去 `widthExemptZones`：0 变化。

**验收对照（回指 FR42 ①–⑪）**

| 需求条 | 设计条 | 核法 |
|---|---|---|
| ① 五键键集 | AC-45 | `Object.keys(DEFAULT_MANIFEST)` + `MANIFEST_SCHEMA` + `nestedKeys` 两族 |
| ② init 不含三键 | T79 | 落盘档文三键零命中 |
| ③ 无 checkConfig 可跑 | AC-47 | 夹具仓 gate 出 PASS/REFUSED；源码面 `readManifest` 零命中 |
| ④ 计数连带 | 落点表 + §2.11 表 | `MANIFEST.md` 内「八键」零命中 / 「五键」在位 |
| ⑤ 工具描述 | §2.11 受影响文件表 | `tool-docs/manifest.md` / `doc_check.md` 参数说明 |
| ⑥ 无 advisor 时 map 产出或降级 | AC-48 | 三态夹具 + 本仓实跑 |
| ⑦ 无兼容分支 | AC-46 / 边界句 | 源码面 `key === "checkConfig"` 类分支零命中 |
| ⑧ advisor 读取零残留 | AC-49 | 两档 `advisor` 零命中 |
| ⑨ scanDirs 零消费 | AC-50① | 源码面 grep |
| ⑩ 不传 docs 报错 | AC-50② | 调用夹具（可读串、零遍历） |
| ⑪ 传两档只读两档 | AC-50③ | `readFileSync` 命中集断言 |

**关键决策**：KD-M1-42 三键整键退场、无替代键 · KD-M1-43 doc_check 只判传入文件（参数纯常量、不读 manifest）· KD-M1-44 docMap 由 docRoot 探测派生 / standards 撤面留降级句 · KD-M1-45 迁移无脚本 · KD-M1-46 判定范围与解析范围同一集。

**上抛项**

- [知会] 本仓 696 条裸名指针在新口径下会红 ⇒ 归台账 `#1731`；本批收口只跑本轮触达档。
- [知会] 设计档随正余项（随实施轮同拍 · 设计笔）：`docs/core/design/ENGINEERING-MODE-V2.md` 键面图与 M1/M8 行 · `docs/core/design/TOOLS.md` doc_check 行 · `DOC-DISCIPLINE.md` §3.20 旧报告样本与 §7 其余行。

**零改面**：doc-check 两条判据的度量与豁免谓词 · `docRoot` / `index` / `codePaths` 消费面 · 评审两条判据的判法 · 写门 / 二道防线 · 需求档 · 产品代码（设计轮不落笔）。

**设计 why 面（用户 2026-10-22 10:28「知其然知其所以然」）**

`MANIFEST.md` §2.11 逐条落 why，删除 / 收紧句与 why 数对齐：

| 删除 / 收紧项 | why 落点 |
|---|---|
| 范围 = 调用方给的几档 | §2.11「why·范围」——判别轮的档 = 存量债务记到本轮头上（待办爆炸成因） |
| 删 `scanDirs` / `domain` / `roots` | §2.11「why·无 scanDirs」——有默认范围就会长回来 |
| 裸名不跨目录解析 | §2.11「why·裸名」——跨目录解析要全域索引，等于请回全仓扫描 |
| `lineWidth` 300 常量 | §2.11「why·行宽」——可配即会漂；改判据 = 改代码走评审 |
| `advisor` 退场 | §2.11「why·advisor」——同一事实两处声明（D2）；standards 无约定名 ⇒ 显式降级 |
| 八键 → 五键 | §2.11「why·五键」——三键都不是用户掌握的事实 |

**验收对齐**：FR42 第 ⑫ 条（每处删除 / 收紧句带 why 子句）——设计档内计数 = 6 条删除 / 收紧项 ↔ 6 条 why（doc-check 四条 + advisor + 五键）。

**修轮记录 · State 残留收正（2026-10-22 · 父侧核验三项 + 全档扫描）**

**父侧核验三项（改后逐字）**

| # | 位（改后坐标） | 改后逐字 |
|---|---|---|
| 1 | `MANIFEST.md:57` | 「只提供机制（写默认**五键**档）」 |
| 2 | `MANIFEST.md:132`（原整条） | **已删除**——「`docRoot` ∥ `advisor.docMap` **并存**（结构不对称）…」：`advisor` 已由 FR42 退场，该条解释的是不存在的键 |
| 3 | `MANIFEST.md:273`（KD-M1-31） | 「**两族声明键并入 schema**（`codePaths` / `index.{codeExtensions,docExtensions}`）——顶层平级 + 缺省值入 `DEFAULT_MANIFEST`（`["src"]` / `[]`）；键名 / 形态逐字承前」；理由列「必要性判据 = **两族**…：分类段位 / 索引扩展名」 |

**全档扫描（`八键` / `三族` / `advisor.docMap` / `advisor.standardsDoc`）**

| 处置 | 位（改后坐标） | 判 |
|---|---|---|
| 收正 | `:54` · `:107` | `三族声明键形态` → `两族声明键形态`（§2.1 #1 / §2.2 接口） |
| 收正 | `:120` · `:126` · `:128` · `:129` | §2.2 声明键块：标题两族；删 `advisor`（嵌套对象）整条；元素层删 `advisor.*` 句；缺键 fallback ∥ 读向投影各改两族 |
| 收正 | `:176` | 受影响文件行 30：`nestedKeys` 补 `index`（去 `advisor`）+ 两族形态判据 |
| 收正 | `:274` · `:275` | KD-M1-32 三族 → 两族（消费面去「注入」）；KD-M1-33 投影两族键 |
| 收正 | `:857` · `:858` · `:859` · `:868` | AC-31 两族落地（去 `advisor` 默认面）；AC-32 去 `advisor.*` ∥ `advisor.docMap:""`；AC-33 取两族；AC-41 去 `advisor.docMap:5` 例 |
| 收正 | `:938` · `:939` · `:940` · `:942` | T56 两族补默认（去 `advisor` 默认）；T57 去 `advisor` 两例；T58 两族默认；T60 两族零写 |
| 保留（旧档夹具） | `:780`（AC-46）· `:791`（T80） | 均写明「旧八键档 ∥ 旧档」——合法 |
| 保留（历史工作单句） | `:763` | 「键面图上位句随正（八键 → 五键）」= 改 `ENGINEERING-MODE-V2.md` 的待执行改法，非本档现态 |
| 保留（同词异义） | `:186` | 「工作区实景三族」= 测试夹具类，非 schema 键族 |
| 保留（退场陈述） | `:744` · `:783` · §2.11 全节（`:713` `:718` `:719` `:736` `:740` `:742` `:745` `:751` `:755` `:782` `:790`） | 均陈述「退场 ∥ 删除 ∥ 零命中」或模块名（`advisor.mjs` / `_advisorRuns`）——零「现 schema 含 advisor」断言 |

**读数**：`doc_check(mode:"gate", docs=[docs/core/design/MANIFEST.md, docs/core/design/DOC-DISCIPLINE.md])` ⇒ `DOC-CHECK GATE: PASS` · 0 条命中（2 档全清）。

**零改面**：§2.11 六条 why · AC-45–50 · T79–83 · 需求档 · 产品代码 · `thincoder-core/prompts/**`。

**随带发现（未动 · 待裁）**：同档 `:652` 键目录「全 **12** 可写节点」↔ `:673` AC-K2「全部 **20** 可写节点 ∥ 覆盖 = 20」——计数不一致（属 #1585 知识面块，非本批目标）；以 12 为正 ∥ 另有口径，须主 agent 裁。

**修轮记录 · 评审 #72 逐条落（设计 2026-10-22 10:36-10:50 · 改后坐标）**

**改后关键行（逐字）**

| # | 位（改后） | 改后关键句 |
|---|---|---|
| 1 🔴 | `MANIFEST.md:817` | R4 段（原 `:798`）整段删除；只留「**本仓债**：新解析序（仓根相对全路径 ∥ 引用档同目录）落地后，本仓 696 条裸名指针…会变 `档缺`」 |
| 2 🔴 | `MANIFEST.md:812` | T82 输入改「清单含不在盘的档」——预期「明确报错点名该档（不静默跳过、不降级为全域）；其余档读盘计数 = 0」；manifest 不再是输入 |
| 3 🔴 | `MANIFEST.md:802` | AC-50② = 「不给 `docs` ⇒ **明确报错要求显式清单（零遍历、零全域兜底）**，`docs: []` 同报错」——与 `DOC-CHECK.md:49` AC-8 同字（需求档未动） |
| 4 🔴 | `MANIFEST.md:787-791` | §2.11 五条改 **KD-M1-46…50**；`KD-M1-45` 的引用（`:700`）仍指 §2.10 原义，零改 |
| 5 🔴 | `MANIFEST.md:756-781` | 受影响文件表重写：22 行、两列「现值（实测行）」「增量（≤±N）」；`scripts/doc-check*.mjs` 拆 5 行（91 / 356 / 140 / 128 / 6，后两档零改）；`declaration.mjs` 378 行 + ≥300 软线判定；AC-45–51 测试档逐档登记 |
| 6 🔴 | `MANIFEST.md:778` | `ENGINEERING-MODE-V2.md` 编辑点补 §2.3 E4 机检段（`:282`）· §2.6 KD2（`:474`）· §3.1 AC6（`:498`）· §3.2 T3（`:514`）+ 同核 `:104-109` / `:121` / `:126-147` / `:150-151` / `:153` / `:219-220` / `:438` / `:447` |
| 7 🟡 | `MANIFEST.md:742-743` | 先例行：实现坐标 `agent-tools/manifest.mjs` ∥ 档内 §2.10 ∥ 迁移语义 = AC-6；对齐 / 偏离各一句；先例批坐标不住本档（状态档不引一次性载体） |
| 8 🟡 | `MANIFEST.md:744-746` | 勘察行：doc-check 三档 / `tool-docs/doc_check.md` / 需求 `DOC-CHECK.md` 实读结论 + `D:\ref\` 未勘察 |
| 9 🟡 | `MANIFEST.md:727` · `:456` · `:770` · `:802` · `DOC-DISCIPLINE.md:2260` | 单名 = **`DOC_CHECK_BUILTINS`**（接口段 / §2.2 消费面行 / 受影响文件行 / AC-50 / AC-M8-6 五处同字；`DOC_CHECK_PARAMS` 全文零命中） |
| 10 🟡 | `MANIFEST.md:793-802` · `:889` | AC-45–51 明写「并列附表」+ 回指列（FR42 ①–⑪ 坐标 = `requirements/ENGINEERING-MODE-V2.md:891` §13.20；`DOC-CHECK.md` F3/F8/F10）+ 测试档列；§3.1 表尾增索引行 |
| 11 🟡 | `MANIFEST.md:887` | AC-43 ①「四族整键写」改「**两族整键写（`docRoot` / `index`）**」；受影响文件表第 22 行登记「本档 §2.11 + §3.1 AC-43 / §3.2 随正」；KD-M1-38「全键族」核 = 已与 12 节点一致，零改 |
| 12 🟡 | `MANIFEST.md:779-780` | 两行登记：`DOC-DISCIPLINE.md`（2262 行·§3.20 参数面已随正 + AC-M8-6 本笔已落）· `PORTABILITY.md`（299 行·§3.1 三族→两族，随实施轮同拍） |
| 13 🟡 | `MANIFEST.md:760`（行 8）· `:682` · `:693` · `:696` | 计数算式 = 整键 3 + `docRoot.*` 5 + `index.*` 4 = **12**（现 20 = 上式 + `promptsLanding` 1 + `checkConfig.*` 5 + `advisor.*` 2）；`14 节点` 旧值删除，§2.10 两处标「20 → 12」 |
| 14 🟡 | `MANIFEST.md:728` | 定性句：「两项空列表 = 常量自身的排除类 / 区带类默认值且恒空…没有『登记后放过』的写入口 ⇒ 与需求边界『不引入豁免清单』不冲突」 |
| 15 🟡 | `MANIFEST.md:725-726` | gate 范围写全：子代理 = 触达记账；父侧 = 触达记账 ∪ 本批提交 diff（`git diff <批起 sha> --name-only -- docs`）；工具内不设默认范围 |
| 16 🟡 | `MANIFEST.md:733` · `:803` | F8 面零改句 + **AC-51**（引擎版本一致性 ERROR + report 陈旧注记逐字保留） |
| 17 🔵 | `MANIFEST.md:758` | `manifest-schema.mjs` 现值统一 **181**（实测；`:192` 的 178 与 `:231` 的 166 属旧批读数，本批只认 181） |
| 18 🔵 | `prompts/persona-engineering.md` | 三键名扫描（`promptsLanding` / `checkConfig` / `advisor`）：前两名**零命中**；`advisor` 命中 14 处全为角色名（非 manifest 键）⇒ 不补入受影响文件表 |

**读数（本笔实测）**：`doc_check(mode:"gate", docs=[MANIFEST.md, DOC-DISCIPLINE.md])` ⇒ `DOC-CHECK GATE: PASS` · 0 条命中。行数实测（`\n` 计数）：`manifest-schema.mjs` 181 · `doc-check/index.mjs` 240 · `anchors.mjs` 171 · `width.mjs` 132 · `project-context.mjs` 197 · `declaration.mjs` 378 · `agent-tools/manifest.mjs` 200 · `tool-docs/manifest.md` 28（4,608 字符）· `doc_check.md` 58 · `scripts/doc-check.mjs` 91 · `doc-check-anchors.mjs` 356 · `doc-check-linecounts.mjs` 140 · `doc-check-targets.mjs` 128 · `doc-check-width.mjs` 6 · `doc-check-scope.test.mjs` 83 · `PROJECT-MANIFEST.json` 67 · `ENGINEERING-MODE-V2.md` 524 · `DOC-DISCIPLINE.md` 2262 · `PORTABILITY.md` 299 · `MANIFEST.md` 976。残留扫描：`DOC_CHECK_PARAMS` / `R4` / `14 节点` 全文零命中；`scanDirs` / `roots` 仅存于「零消费 / 零存在」判据句与 `advisor.mjs` 的 `roots.some`（异义，非 manifest 参数）。

**决策号重编（随 #4）**：本段上文「关键决策」行的号码 `KD-M1-42…46` 现为 `KD-M1-46…50`（语义零改）；与 §2.10 的 42–45 不再重号。

**零改面**：§2.11 六条 why（`why·五键` 行仅在其后补先例/勘察两段）· 三键退场表 · 迁移语义 · `advisor` 派生两级探测 · 需求档（`DOC-CHECK.md` 父侧已改 AC-8，本笔只读）· 产品代码 · `thincoder-core/prompts/**`。

**随正余项（[上抛·知会]）**：`ENGINEERING-MODE-V2.md` 八处键面句（受影响文件表第 19 行）与 `PORTABILITY.md` §3.1（第 21 行）住设计笔，待父侧排入同一实施窗口；`DOC-DISCIPLINE.md` §7 其余行核同拍。

**坐标更正（同笔·读回实测）**：#13 的受影响文件表**行 8** = `MANIFEST.md:767`（表头 = `:758` ∥ 行 1 = `:760`）；🔵17 的 `manifest-schema.mjs` 现值行 = `MANIFEST.md:760`（现值 181）。上文两处 `:760` / `:758` 以此为准。

**修轮记录 · 评审 #74 轮次 2 四件逐条落（2026-10-22 · 改后坐标）**

| # | 处置 | 改后坐标 ∥ 改后关键句 |
|---|---|---|
| 1 🔴 | 受影响文件行补 §1.3 N3 + §2.2 M9 两行，各给改后句；M1 / M8 目标显式写出 | `MANIFEST.md:778`（行 19）增：「§1.3 N3（`:34`）「声明面（manifest `docRoot` + `checkConfig`）承载」→「声明面（manifest `docRoot`）承载」· §2.2 M9 行（`:72`）「运行期加载面——M9 落点读 manifest `promptsLanding`」→「运行期加载——落点 = 产品源码内固定路径，不读 manifest」」；M1 行（`:64`）键枚举 → 五键 · M8 行（`:71`）「声明面（manifest `checkConfig`）」→「参数内置常量」 |
| 2 🟡 | 回指条号落回真实项：表头坐标改 需求 1–7（`:908-916`）· 验收 ①–⑧（`:920-927`）；AC 回指列逐条改写；§3.1 索引行同步；`⑨–⑪` / `①–⑪` 全文零残留（读回 grep 零命中） | `MANIFEST.md:794` · `:798`–`:803` · `:892`。逐条：AC-45 = 需求 4 · 验收 ①–② ∥ AC-46 = 需求 6 ∥ AC-47 = 需求 5 · 验收 ④ / `DOC-CHECK.md` F3 ∥ AC-48 = 需求 3 · 验收 ⑦ ∥ AC-49 = 需求 3 ∥ AC-50 = 需求 2 · 验收 ③ / F10 · AC-8 ∥ AC-51 零改（`DOC-CHECK.md` F8）。表后补「未入本表的需求项（回指补全）」（`:806`）：需求 7 / 验收 ⑤·⑥·⑧ 各给核法落点 |
| 3 🔵 | `manifest-schema.mjs` 现值收一 = **181**（`\n` 计数实测 · 2026-10-22）：§2.11 行 1 原即 181（零改）；§2.2 行 48 的 178 → 181；Δ 注的 166 标为「预算基数」并补现测 181（166 + 16 = 上限 182，181 在限内） | `MANIFEST.md:760` · `:192` · `:231` |
| 4 🔵 | persona 档入受影响文件表（新增行 23·零改）：三键名实读 = `promptsLanding` 0 · `checkConfig` 0 · `advisor` 12 处全为角色名 ∥ 评审流程词（无 `advisor.docMap` / `advisor.standardsDoc` 形态）⇒ 零改；现值 248 行 | `MANIFEST.md:782` |

**条号更正（同笔）**：本段上文 `:61` 标题「回指 FR42 ①–⑪」与 `:99`「FR42 第 ⑫ 条」不成立——需求 §13.20 实有 **需求 1–7** 与 **验收 ①–⑧**，无 ⑨–⑫。本段 `:63-75` 表的 ⑨–⑪ 三行分别 = 需求 2 的三条核法（`scanDirs` 零消费 ∥ 不传 `docs` 报错 ∥ 传两档只读两档）；「why 子句」那条的来源 = 用户 10:28 原话（非 FR42 条）。权威映射以设计档 `MANIFEST.md` §2.11 回指列现行值为准。

**验收⑤ 口径（父侧已改需求 `docs/core/requirements/ENGINEERING-MODE-V2.md:924`）**：本档「八键」零命中只判**现态表述**；AC-46 / T80 的「旧八键档」= 旧档夹具描述，不计——已在受影响文件行 22（`MANIFEST.md:781`）注明。

**读数**：`doc_check(mode:"gate", target="D:\teamcode\thincoder", docs=["docs/core/design/MANIFEST.md"])` ⇒ 见下笔实测行。

**零改面**：§2.11 六条 why · 三键退场表 · 迁移语义 · AC-45–51 核法 · 需求档 · 产品代码 · `thincoder-core/prompts/**`。

**同笔补（回指全覆盖）**：AC-45 回指再补「需求 1」（`promptsLanding` 从键集消失 = 需求 1 的机判落点）——`MANIFEST.md:798` 现读「FR42 需求 1 · 需求 4 · 验收 ①–②」。至此，需求 1–7 与验收 ①–⑦ 各有回指行（验收 ⑧ = 本仓债句，见 `:806` 未入表行）。

**修轮记录 · 设计档随正四件（2026-10-22 · 设计席 · 执行依据 = 本档受影响文件表行 19 / 20 / 21 + 父侧本轮 AC-50② 分面裁定）**

**机械侧已实读（文档随正 = 向实现对齐）**：`thincoder-core/doc-check/index.mjs:69` 与 `thincoder-core/agent-tools/batch-gate.mjs:155` 空清单即产 `DOC-CHECK GATE: PASS（0 档）`；`thincoder-core/doc-check/index.mjs:118` 注释「报告态空清单 = 报错」；`thincoder-core/test/doc-check-scope.test.mjs:76-78` 断言 gate 空清单首行逐字。`DEFAULT_MANIFEST` 实读五键、`index` 四子键（`manifest-schema.mjs:30-43`）⇒ 设计档键面句按此收正。

| # | 档 | 落点（改后坐标） | 改后关键句 |
|---|---|---|---|
| 1 | `docs/core/design/MANIFEST.md` | `:725` | `report` 面：不给 ∥ `[]` ∥ 非数组 ∥ 含非字符串条目 ⇒ **一律报错**（零遍历、零全域兜底）——`report` 面没有「空清单」读法 |
| 1 | 同上 | `:726` | `gate` 面：空清单 = **合法态** ⇒ 首行 `DOC-CHECK GATE: PASS（0 档）`，输出行**必带「0 档受检」**（防「跳过」被读成「已检」） |
| 1 | 同上 | `:727` | why：零档没有可扫的东西 ⇒ 无「偷偷扫全仓」兜底风险；纯代码轮次触达档 = 0 是常态，gate 报错会把正常态变故障 |
| 1 | 同上 | `:804`（AC-50②） | **两面分明**：`report` 面四形 ⇒ 报错；`gate` 面空清单 ⇒ `PASS（0 档）` + 「0 档受检」 |
| 2 | `docs/core/design/ENGINEERING-MODE-V2.md` | `:34` | N3：声明面（manifest `docRoot`）承载 |
| 2 | 同上 | `:64` / `:71` / `:72` | M1 五键（后两键 = 声明两族）· M8 参数内置常量 · M9 运行期加载 = 产品源码内固定路径、不读 manifest |
| 2 | 同上 | `:104-109` / `:121` / `:126-138` | 依赖图 / 三账分工 / JSON 例 —— 被读面 `docRoot` / `phase` / `codePaths` / `index`；JSON 块收为五键 |
| 2 | 同上 | `:141-142` / `:144` | 键注释：提示词落点与机检参数**都不入 manifest**；两族声明键形态（`codePaths` / `index.*`） |
| 2 | 同上 | `:210-211` | E2：机检范围 = 传入清单、提示词落点 = 固定路径——两者不从 manifest 取 |
| 2 | 同上 | `:273` | E4：判据参数 = 内置常量 `DOC_CHECK_BUILTINS`，范围 = 传入清单，不扫目录、不读 manifest |
| 2 | 同上 | `:320` / `:429` / `:438` | 声明两族键 · 接口表被读面四键 · M8 → M1 只读 `docRoot` |
| 2 | 同上 | `:465` / `:467` | KD2 = 机检参数内置常量 · KD4 = 单引擎 + 内置参数 |
| 2 | 同上 | `:486` / `:489` / `:505` | AC3 五键 · AC6 单引擎 + 常量 · T3 读数不随 manifest 变 |
| 3 | `docs/core/design/PORTABILITY.md` | `:31` / `:45` / `:52` | §2 装载载体 / §3.1 标题 / 声明族表 = **两族**（`codePaths` / `index.*`）；`advisor` 族行整行删 |
| 3 | 同上 | `:55-56` | 文档地图由 `docRoot` 派生（两级探测：声明根 README → 公共祖先 README → 降级句）；归一去指针 trim |
| 3 | 同上 | `:68` / `:73` / `:77-78` | 投影两族键 · 默认声明由两族默认值构造 · 声明对象形状 `{ declared, codePaths, index, root }` |
| 3 | 同上 | `:123-124` / `:146` | 降级契约：两级探测皆无 / 恒降级（无声明面）· VSC 声明面两族 |
| 3 | 同上 | `:219` / `:222` / `:230` / `:231` / `:233` / `:243` / `:251` | D2 / D5 / D13 / D14 / D16 / 测试载体句 / T-32 —— `advisor` 键断言全数退场；T-32 改指 `MANIFEST.md` AC-48 / T83 |
| 4 | `docs/core/design/DOC-DISCIPLINE.md` | `:2204` | F3：三套源域 → 判定范围 = 调用方传入清单；三套行宽判据 → 单常量 |
| 4 | 同上 | `:2207-2215` | §7 F2 表：**声明面键集（7 项）→ 常量面（3 项）**；`scanDirs` / `anchors.*` 整体退场句 |
| 4 | 同上 | `:2234-2240` | 域取向：域 = 传入清单（`--root` 只定解析基准）；两面空清单分明 |
| 4 | 同上 | `:2253`（AC-M8-2） | 参数 = 内置常量；空清单两面分明——`report` ⇒ 报错 ∥ `gate` ⇒ `PASS（0 档）` + 「0 档受检」 |
| 4 | 同上 | `:905` / `:992` / `:1117` / `:1122` / `:1125` / `:1172` | 指向 §7 表的两处指针随正 · 范围句 · 空范围行加「0 档受检」· ERROR 三因 → **两因** · 适用面两面分明 |

**读数**：`doc_check(mode:"gate", target="D:\\teamcode\\thincoder", docs=[ENGINEERING-MODE-V2.md, PORTABILITY.md, DOC-DISCIPLINE.md, MANIFEST.md])` ⇒ `DOC-CHECK GATE: PASS` · **0 条命中**（4 档全清）。键面残留扫描（本笔读回）：`ENGINEERING-MODE-V2.md` 的 `checkConfig` / `promptsLanding` / `三族` / `八键` = **0 命中**；`PORTABILITY.md` 的 `三族` / `doctor.docMap` 形态 = **0 命中**（余 `advisor.standardsDoc` 1 处 = 「已退场」陈述句，合法）。

**未落 · 上抛待裁（超本笔编辑点，属语义面）**：`DOC-DISCIPLINE.md` 仍有 `checkConfig` **31 行**——分布 §3.1（`:339`）· §3.15（`:760`）· §3.16（`:802`）· §3.19（`:905` `:914` `:933` `:940-942` `:971` `:973` `:982`）· §3.20（`:1006` `:1034` `:1038-1039` `:1083-1084` `:1301-1302` `:1367` `:1373` `:1484` `:1548` `:1558`）· §4.2（`:1841`）· §5（`:2013` `:2031` `:2045` `:2054` `:2066` `:2088`）。其中 §3.20 解析序 ⑤（`anchors.roots`，`:1005-1006` + A-DD32 六条）与 `:1119`「全域文件名索引」与新两级解析序相反——属机制面删除，需父侧裁定另批（本笔按「§7 余行」射程不动）。

**零改面**：§2.11 六条 why · 三键退场表 · 迁移语义 · AC-45/46/47/48/49/51 核法 · 需求档 · 产品代码 · `thincoder-core/prompts/**`。

**同笔更正**：上段「读数」行「`PORTABILITY.md` 的 `三族` / `doctor.docMap` 形态 = **0 命中**」中的 `doctor.docMap` = 笔误，应为 `advisor.docMap`（读回实测：`PORTABILITY.md` 的 `三族` / `advisor.docMap` 键形态各 0 命中；余 `advisor.standardsDoc` 1 处 = 「已退场」陈述句）。
**末笔读数**：`DOC-DISCIPLINE.md:1122` 空范围行补「0 档受检」后，`batch` append 触发的 gate = `DOC-CHECK GATE: PASS · 范围 4 档`（四档终态全清）。

**修轮记录 · `checkConfig` 清单收口 + 解析序两级（2026-10-22 · 设计席 · 父侧派单逐条）**

**射程**：`DOC-DISCIPLINE.md` 的 `checkConfig` 全量命中 + 三处机制面。**实读 = 33 行 / 39 处**（父侧清单列 32 个坐标；差 = `:930`（R-8 行）未列）。零改：§7 已改五处 · `MANIFEST.md` · 产品代码 · 提示词 · 需求档 · 其它设计档。

**三处机制面（改后逐字）**

1. `:1007`（原 `:1005-1006` 解析序 ⑤）：「**档在盘（解析序 · 两级）**：① 仓根相对**全路径** → ② **引用方档所在目录**相对（档相对引用）→ 均未命中 ⇒ `档缺`。**`§N` 节判定只读解析命中的目标档**（点查，不遍历）；裸名不跨目录解析——不建全域文件名索引、不回落 basename（需求 F3）。」
2. `:2015-2022` A-DD32 六条（对象 = 传入清单 + 两级解析 + 点查）：① 正常两级解析零 `档缺`（DD-100）② 裸名跨目录 ⇒ `档缺`（不建索引、不判多义，DD-101/102/103）③ 全路径缺档 `档缺` / 目标无该节 `节缺`（DD-104）④ 节判定 = 点查（只读命中目标档，DD-105）⑤ 读取面 = 传入清单 + 引用目标（`readFileSync` 命中集 ⊆ 传入档 ∪ 引用目标，AC-50③ 同判）⑥ 消费面唯一（`scripts/doc-check-anchors.mjs` 自有解析序、不参与 verdict）。
3. `:1071`（原 `:1119`）：「**解析面不缩**：锚的解析基线 = **传入档 + 其引用目标**（两级解析、点查——**不建全域索引**；节判定按需读命中目标档）——范围只收窄**被判档**，不收窄解析；否则改过的档以全路径 ∥ 同目录引用未改的档会假报 `档缺`（假阳即机制失效）。」

**逐行处置（33 行 · 行号 = 改前；类别：① 参数来源 → 内置常量 · ② 范围 → 传入清单 · ③ 历史行 + 退场注 · 机制 = 机制面删 / 重写）**

| 行 | 类 | 改后关键句 |
|---|---|---|
| `:339` | ② | 后二者**不在传入清单内**（判定范围 = 调用方传入的文件清单，不扫目录） |
| `:760` | ① | 常量位 `DOC_CHECK_BUILTINS.widthExemptZones`（加名 = 改常量 + 设计 + 评审） |
| `:802` | ② | O-6 ① 判定面 = 传入清单（无目录扫描、无声明面）；新档入清单即受判 |
| `:905` | ③ | 行数声明面（原 `checkConfig.lineCounts`——整键已由 FR42 退场，现无该键） |
| `:914` | ③ | 零改面：manifest 其余声明键（`checkConfig` 整键已退场） |
| `:930` | ③ | R-8 改后：去该分句（整键已退场——无「余键」可留） |
| `:933` | ③ | R-11 改后：随键退场收口 |
| `:940` | ③ | R-12 改后：各落点随整键删除 |
| `:941` | ③ | R-13 改后：同 R-12 同拍 + 整键退场 |
| `:942` | ③ | R-14 改后：值表自持句（整键已退场） |
| `:971` | ② | 射程 = 值位表 ∥ 同形域表（去 `checkConfig.lineCounts` 指称） |
| `:973` | ③ | 随动已收口：原指称随键退场成死指针 ⇒ 已收正；整键已退场 |
| `:982` | ③ | DD-70：五键在 ⇒ `ok:true`；加回旧键 ⇒ 落 `unknownKeys` ∧ 源面零消费 |
| `:1006` | 机制 | 解析序 ⑤ 整块删（含拼接 / 根序 / 根缺位 / 值形 / 消费面 / 插位 / 由来）→ 两级 |
| `:1034` `:1038` `:1039` | 机制 | 声明面块删（roots 取值 / 声明笔 / schema 登记）→ 一句「解析面（实装口径）」 |
| `:1083` `:1084` | 机制 | roots 受影响文件表整表删 → 「受影响面（实现面）」一句 |
| `:1301` | ①② | gate 报面样本：N 档 · 阈值 `DOC_CHECK_BUILTINS.lineWidth`（内置常量） |
| `:1302` | ①② | 判据行：参数 = 内置常量；解析序两级 |
| `:1367` | ① | DD-90 ERROR 两因 = 多项目工作区 ∥ 引擎已更新 |
| `:1373` | ① | DD-96：manifest 不可读（JSON 非法）⇒ ERROR ⇒ close 拒 |
| `:1484` | ② | §4.2.2 解析序两级 + 声明源候选保留 |
| `:1548` | ② | 判定范围 = 传入清单（无目录扫描、无声明面） |
| `:1558` | ② | 两树不在判定面（不在清单内 ⇒ 不判，非豁免） |
| `:1841` | ② | A-DD11 射程 = 两树不在传入清单 |
| `:2013` | ① | A-DD23③ 常量面生效（`DOC_CHECK_BUILTINS.widthExemptZones`） |
| `:2031` | ② | A-DD27② 域 = 传入清单（`_archive` / `batches` 不入清单即不判） |
| `:2045` | ①② | A-DD27 码块删（原读 manifest `checkConfig`）→ 常量 / 传入清单说明 |
| `:2054` | ③ | A-DD28②：直读 manifest ⇒ **无 `checkConfig` 键** |
| `:2066` | ① | A-DD29④ 常量面生效（`DOC_CHECK_BUILTINS.lineWidth`） |
| `:2088` | ① | A-DD31⑤：manifest 不可读（JSON 非法）⇒ ERROR ⇒ close 拒 |

**连带删除面（⑤ 的依存块——留着即尸块）**：「触发面与复跑判据」（300 档缺 / 6061 覆盖读数）→ 换「本仓债（#1731）」一句；「声明面 + 同类先例 + 为何另立声明根」整块；§3.20 受影响文件表（roots 实施面 9 行）；「节缺的同板块回退（③b）」（依赖 ④ basename 索引）→「节缺不回退」；两免条「产品码 `.md` 由解析序 ⑤ 接住」→ 全路径；DD-82 多义句、DD-100–DD-105、`:1315` 验收指针随正。

**F10/F2 相反句收口（验收 ③ 直接要求）**：§3.20「报告态档集」`不给 ⇒ 全域` → **一律报错（零遍历）**；六态语义矩阵；不可判档三因 → 二因（删「不在声明域」）；报错串形改条件清单（英文文案随实施轮，不代写）；实现落点 / 受影响面 / DD-106–DD-113 重写；gate 范围句去「∩ 声明域」；批档不入范围句改「不入传入清单」；A-DD34 重写；DD-83 / DD-89 / DD-90 / DD-96 随正；`:1436`（§4.2.2 解析序）· `:1441`（同名口径）· `:1500`（SCAN_DIRS 现态）· `:1510` 随正。

**读数（新进程产品引擎 · 本笔实测）**

- `checkConfig`：33 行 / 39 处 → **11 行 / 24 处**，全部落两类：**已退场陈述 5 行**（`:905` `:914` `:975` `:984` `:1976`）· **历史表行 + 块级退场注 6 行**（`:919` 注 + `:932` `:935` `:942` `:943` `:944`）。
- `anchors.roots`：14 → **4**（`:919` 退场注 · `:927` R-3 · `:933` R-9 · `:2134` §7 退场句）。
- `全域文件名索引`：1 → 1（仅 `不建全域文件名索引`——父侧指定措辞）；`scanDirs` 7 处全为退场 / 否定句。
- 文件行数：2260 → **2180**。
- `doc_check`（新进程 `runDocCheck` · `docs=[DOC-DISCIPLINE.md]` · gate）⇒ **`DOC-CHECK GATE: REFUSED（命中 55 条）`**——锚 55 · 行宽 0；另：本轮新增 5 处锚命中已清（`:1204` `tool-docs/…` · `:1036` `TUI.md`×2 · `:1307`/`:1308` `common.md`）。
- 会话内 `doc_check` 工具仍为旧引擎缓存（读 manifest `checkConfig` ⇒ 取参 ERROR）——取值只认新进程读数（F8）。

**上抛**

- [上抛·待裁] 验收 ⑤ `doc_check PASS` 本批拿不到：余 55 条锚命中全属台账 `#1731`（本仓 696 裸名指针机械改名批；落点 = 本档头部与 §1–§4 既有相对指针 + `:944` R-14 现文摘引）。本席未动（另批射程）。请裁：本档就地改全路径（≈55 处机械改，属 #1731 预支）∥ 接受 REFUSED + 归 #1731。
- [上抛·知会] 会话内 `doc_check` 工具读的是 FR42 前旧引擎（manifest 取参 ERROR）；实施已落（`DOC_CHECK_BUILTINS` 在位、`readManifest` 零命中）——**需重启会话后工具面才与新引擎一致**。

**修轮记录 · 设计档与实施事实对齐三件（2026-10-22 · 设计席 · 依据 = §5.3 第 1 条 / §5.4 / §5.1 + 本轮亲测）**

本轮机械侧实读：`scripts/doc-check-targets.mjs` 128 → 97（`collectSourceDomain` / `walkMd` / `LEDGER_NAMES` 三处已删，git diff 实读）· `scripts/doc-check-anchors.mjs:215` = `walk(baseAbs).filter(...)` 整树枚举仍在 · 源码面 `scanDirs` 零命中 · 行长 `\n` 计数：manifest-schema 153 · doc-check/index 172 · anchors 106 · width 87 · project-context 222 · declaration 371 · scripts-anchors 296 · targets 97 · linecounts 140 · MANIFEST.md 981。

| # | 面 | 改后坐标 | 改后关键句 |
|---|---|---|---|
| 1 | R1 行 13「零改」 | `MANIFEST.md:774` | 「linecounts：头注一句随正（不读参数面）· targets：**删死码三处**（`collectSourceDomain` / `walkMd` / `LEDGER_NAMES`）——原「零改」不成立：该档是 `scanDirs` 最后一位消费者，AC-50① 要求零消费 ⇒ 必须删（128 → 97）」；增量 = 「实测 0（头注一句换写）· −31（原写 0）」 |
| 2 | R2 全域扫描口径 | `MANIFEST.md:733`–`:734` | 原「`scripts/doc-check*.mjs` 三档同步退场全域扫描」整句删除，选「口径收窄」：`:733`「**引擎面不再有全域扫描支**：`report` 模式不给清单即报错（零遍历、零兜底）；`gate` 模式范围 = 调用方传入并集」+ `:734` 新行「**脚本面现状**：…仍以显式 `--root` 为域整树枚举 `.md`（`scripts/doc-check-anchors.mjs:215` 的 `walk`）——该枚举仍在盘，不在…口径内」 |
| 3 | R3 行长预算 | `MANIFEST.md:758`（前言）+ 表行 1–6 / 11 / 13 / 14 | 增量列 = 「实测 Δ（预算；超预算写明理由）」：−28（帽 −18，超 10）· −68（帽 −70，帽内）· −65（帽 −40，超 25）· −45（帽 −20，超 25）· +25（帽 ±12，超 13）· −7（帽 ±6，超 1）· scripts-anchors −60（帽 −60，帽内；落 296 已下 300 软线，拆分候选不成立）· targets −31（原写 0）· 测试档 +25（帽 ±20，超 5） |

**与 §5.4 读数的偏差（本轮亲测为准）**：`doc-check/index.mjs` 实读 **172**（§5.4 记 160 ⇒ 偏差 −80；实为 −68，帽内）· `doc-check-scope.test.mjs` 实读 **108**（§5.1 记 103 ⇒ 实 +25，超帽 5）· `scripts/doc-check-anchors.mjs` 实读为 356 → 296 = **−60**（§5.4 记 −50，算术不符）。

**读数**：新引擎 `runDocCheck('<仓根>', {docs:['docs/core/design/MANIFEST.md'], mode:'gate'})` ⇒ `DOC-CHECK GATE: REFUSED（命中 21 条）`——全为锚·档缺，位于未触达行（`:329`–`:894`）= `#1731` 裸名债；**本轮新增/改动行命中 0**（首跑 22 条含本笔行 `:733` 超宽 346 字符 ⇒ 已拆两行后复跑归零）。会话内 `doc_check` 工具 = 进程启动时加载的旧引擎（`checkConfig` 已删 ⇒ 首行 ERROR），读数不可作交付判据。

**零改**：产品代码 · 需求档 · 其它档 · §2.11 六条 why · 三键退场表 · 迁移语义 · AC 核法。

**随带观察（未改 · 待裁）**：表行 20 `DOC-DISCIPLINE.md` 现值记 2262，盘上实读 2188（Δ −74，预算 ≤±4 被越）——归属不明（可能他批 ∥ 设计轮随正余项并发），本笔不动该行。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**评审对象**：MANIFEST.md §2.11（FR42 五键 · 三键退场 · doc_check 点查 · advisor 由 docRoot 派生 · 迁移语义）；范围 = MANIFEST.md / DOC-CHECK.md / ENGINEERING-MODE-V2.md 三档全文。
**计数**：🔴 6 · 🟡 10 · 🔵 2（共 18 条）。

| # | 类别 | 严重度 | 问题 | 建议 |
|---|---|---|---|---|
| 1 | 需求覆盖 / 文档归属 | 🔴 | doc-check 参数面两套互斥描述同住 §2.11：`MANIFEST.md:726`「无 `scanDirs` / `domain` / `roots` / `exclude`」 vs `MANIFEST.md:798`「`scanDirs` = 盘上存在的 docRoot 目录集；`domain` = 其公共父目录；`roots` = 同 `scanDirs`」；AC-50 又称「① 代码内 `scanDirs` 零消费」（`MANIFEST.md:784`）。后者同时与需求判据句 `DOC-CHECK.md:32`「`scanDirs` 零消费、`anchors.domain` / `anchors.roots` 零存在」及 `MANIFEST.md:324`（显式 `--root` 必带 · 零发现）冲突。 | 只留一套：按用户 10:27 令与需求判据句删 R4 末段与 KD-M1-46 的 `roots` 分支；若确需 docRoot 派生，则反向修需求判据句并在 §2.11 明写替代了哪条旧口径。 |
| 2 | 验收一致性 | 🔴 | T82 与「doc_check 不读 manifest」互斥：`MANIFEST.md:793`「gate 首行 `ERROR`；报告态抛错（既有行为）」以「夹具删 manifest」为输入，而 `MANIFEST.md:729`「`doc_check` 不再读 manifest（连「manifest 不可读 ⇒ ERROR」也删）」、AC-47 断言 `readManifest` 零命中（`MANIFEST.md:781`）。 | 二选一并改另一方：维持「不读 manifest」则 T82 换错误面（如传入档不存在）或整行删除并在 AC 表登记退场。 |
| 3 | 需求覆盖 / 文档归属 | 🔴 | `DOC-CHECK.md` 自相矛盾：F10「未给 ⇒ 明确报错要求显式清单」（`DOC-CHECK.md:27`）+ §3 判据句（`:32`）vs AC-8「不给 `docs` ⇒ 全域行为与今日**逐字一致**」（`DOC-CHECK.md:49`），且 AC-8 保留已不存在的「越域档」概念。 | 按 10:27 令改 AC-8：未给 `docs` ⇒ 明确报错（零遍历），删「全域行为逐字一致」与「越域档」。 |
| 4 | 清晰性 / 可追溯 | 🔴 | 决策编号重号：`MANIFEST.md:693`–`:696` 已定义 KD-M1-42（分层载荷）…KD-M1-45（对齐 settings）；`MANIFEST.md:769`–`:773` 用同批编号定义另一批决策。现存引用 `MANIFEST.md:700`「（KD-M1-45）」指前者，重号后所指不可判。 | §2.11 五条决策改用未占用新号（已用到 KD-M1-41 / §2.10 用到 42–45），并复查找 KD-M1-4x 的全部引用。 |
| 5 | 受影响文件行数标注 | 🔴 | §2.11 受影响文件表（`MANIFEST.md:749`–`:763`）无增量列；13 行中 7 行现值写「实读」（`MANIFEST.md:756` / `:760`）；`scripts/doc-check*.mjs` 一行吞多档；`declaration.mjs` 按本节自述 `:320` 计已 ≥320 行（`MANIFEST.md:745`）却无现值 / 无增量 / 无 >300 软线判定；AC-45–50 所需测试档仅登记一档。 | 补「现值（实测）+ 增量（≤±N）」两列；拆通配符行；为 ≥300 行档补软线判定与触发；逐档登记测试档。 |
| 6 | 需求覆盖 / 文档归属 | 🔴 | 上位设计档改后仍相反且不在编辑点清单：`ENGINEERING-MODE-V2.md:282`「判据（扫描域 / 行宽阈值 / 锚域 / 豁免）全部从 manifest `checkConfig` 读取（声明面）」、`:474`、`:498`、`:514` 均与内置常量相反；而 `MANIFEST.md:763` 只列「架构 §2.2 / §2.3 E1 / §2.4 表 / §3.1 AC3 / 键面图上位句随正」——E4 / §2.6 KD2 / AC6 / §3.2 T3 不在其中（`MANIFEST.md:3` 明写该档为模块划分权威源）。 | 把 E4 机检段、KD2、AC6、T3 加入编辑点，或登记其替代句；同核 `:104`–`:109` / `:121` / `:150`–`:153` / `:219`–`:220` / `:438` / `:447`。 |
| 7 | 方法论 / 先例 | 🟡 | §2.11 无 closest-precedent 行（同档 §2.10 已给该行形：`MANIFEST.md:700`）。 | 补先例坐标行（实现坐标 ∥ 档内节 ∥ 先例批）+ 对齐 / 偏离理由；无先例则明写「无先例」。 |
| 8 | 方法论 / 勘察 | 🟡 | §2.11 无 survey-evidence 行（形见 `MANIFEST.md:701`）；缺行与「未勘察」不可分。 | 补勘察行（公共源 ∥ 结论，含「无相关」）与未查范围。 |
| 9 | 清晰性 | 🟡 | 同一常量三名：`DOC_CHECK_BUILTINS`（`MANIFEST.md:726`）∥ `DOC_CHECK_PARAMS`（`MANIFEST.md:752` / `:760` / `:456`）；AC-50 未点名。 | 定名单一符号，四处同字。 |
| 10 | 可追溯 / 验收 | 🟡 | AC-45–50 写在 §2.11（`MANIFEST.md:775`「接 §3.1 序号」）未并入 §3.1，且无「回指规格」列；FR42 在三档内无坐标（`MANIFEST.md:352` 只挂指针，另两档 `FR42` 零命中）。 | 并入 §3.1 / §3.2 或明写并列附表；补回指列与 FR42 档案行坐标。 |
| 11 | 文档状态一致性 | 🟡 | AC-43 仍写「**四族整键写（`docRoot` 等父键传整个对象）⇒ 拒**」（`MANIFEST.md:870`），而 AC-41 已写「两族整键写」（`MANIFEST.md:868`）、§2.11 写「收为 `docRoot` / `index` 两族」（`MANIFEST.md:721`）；§2.11 受影响文件表未含本档。 | 表内增「本档 §3.1 AC-43 / §3.2 随正」行并把「四族」改「两族」；核 KD-M1-38「全键族」表述。 |
| 12 | 文档归属 | 🟡 | 变更触及两处单源档而未列入：判据口径单源 `docs/core/design/DOC-DISCIPLINE.md` §3.20（`DOC-CHECK.md:4`，被 `MANIFEST.md:727` 改解析序）；声明语义单源 `docs/core/design/PORTABILITY.md` §3.1（`MANIFEST.md:43` / `:355`，三族变两族）。（两档内容本次未读——评审范围外。） | 补两行或明写归后续批并给登记坐标。 |
| 13 | 数字漂移 | 🟡 | 键目录节点数三处不等：`MANIFEST.md:758`（14 → 12）∥ `MANIFEST.md:673`（12 可写节点）∥ `MANIFEST.md:682`（全 20 节点）；计数口径未给。 | 给一次计数算式（整键 3 + docRoot 5 + index 4 = 12），并收正 §2.10 两处或标明旧值。 |
| 14 | 需求覆盖 | 🟡 | 内置参数集含 `exemptions: []` / `widthExemptZones: []`（`MANIFEST.md:726`），与需求边界「**不引入豁免清单**」（`DOC-CHECK.md:36`）关系未定性。 | 参数段加一句定性（空列表 ≠ 可登记豁免），或删该成员只留谓词。 |
| 15 | 范围 | 🟡 | gate 范围写成「本会话触达记账」（`MANIFEST.md:725`），漏需求 F2/F9 的父侧并集（`DOC-CHECK.md:19` / `:26` 触达 ∪ 本批提交 diff）。 | 写全两来源，或明确并集由 batch 工具侧传入、工具内不设默认。 |
| 16 | 验收覆盖 | 🟡 | 需求 F8（引擎版本一致性 ERROR + 陈旧注记，`DOC-CHECK.md:25`）在 §2.11 报面随正段（`:730`）与 AC-45–50 中无对应项；需求 §4 亦无 F8 的 AC 行。 | 报面段与 AC 表各加一条，或明写「F8 面零改」。 |
| 17 | 数字漂移 | 🔵 | `manifest-schema.mjs` 现值三处不等：`MANIFEST.md:751`（181）∥ `:192`（178）∥ `:231`（166 ⇒ ≤182）。 | 实施前按实测统一，只留一处权威读数。 |
| 18 | 受影响文件（unverified） | 🔵 | §2.10 记载的提示词落点 `thincoder-core/prompts/persona-engineering.md`（`MANIFEST.md:683`）未列入 §2.11 表；该档是否含三键字面未读（评审范围外）——unverified。 | 开工前做一次三键名扫描，命中则补进表。 |

**VERDICT: changes-required**（🔴 6 条未解：参数面两套互斥口径 / T82 与 AC-47 互斥 / 需求 AC-8 与 F10 互斥 / KD 编号重号 / 受影响文件表缺增量与实测 / 上位档相反口径未入编辑点）
**计数**：🔴 6 · 🟡 10 · 🔵 2

### 轮次 2（评审子代理）

## 轮次 2 复核（#73 · MANIFEST.md §2.11 修正轮）

复核面：`docs/core/design/MANIFEST.md`（全档）+ `docs/core/requirements/DOC-CHECK.md`（全档）+ `docs/core/requirements/ENGINEERING-MODE-V2.md`（§13.20）+ `docs/core/design/ENGINEERING-MODE-V2.md`（受影响文件行覆盖核）。上一轮 18 条逐条核对。

| # | 原# | 文件 | 严重度 | 状态 | 依据（本轮实读） |
|---|-----|------|--------|------|------|
| 1 | 1 | MANIFEST.md | — | Fixed | R4 段已删；`:727` 「**无 `scanDirs` / `domain` / `roots` / `exclude`**——不扫目录、不建全域索引」，与 `:802` AC-50①、`DOC-CHECK.md:32` 判据句一致 |
| 2 | 2 | MANIFEST.md | — | Fixed | T82 改为「错误：清单含不在盘的档」（`:812`）；`:731` 「`doc_check` 不再读 manifest（连「manifest 不可读 ⇒ ERROR」也删）」 |
| 3 | 3 | DOC-CHECK.md | — | Fixed | AC-8 改为「**不给 `docs` ⇒ 明确报错要求显式清单（零遍历、零全域兜底）**」（`:49`）；「越域档」已去 |
| 4 | 4 | MANIFEST.md | — | Fixed | 决策重编为 KD-M1-46–50（`:787`–`:791`），与 §2.10 的 KD-M1-42–45 无重号 |
| 5 | 5 | MANIFEST.md | — | Fixed | 受影响文件表带「现值（实测行）/ 增量（≤±N）」两列（`:758`）；22 行无「实读」；通配符行拆为 `:769`–`:772` 四行；`declaration.mjs` 378 + ≥300 软线判定（`:765`）；测试档登记 4 档（`:773`–`:776`） |
| 6 | 6 | ENGINEERING-MODE-V2.md（design） | 🔴 | Unfixed | 12/14 处已入编辑点，**两处仍缺**：`:34` 「声明面（manifest `docRoot` + `checkConfig`）承载」、`:72` 「运行期加载面——M9 落点读 manifest `promptsLanding`」；受影响文件行 `MANIFEST.md:778` 只列「§2.1 依赖图 / §2.3 E1 / E2 / E4 / §2.4 接口表 / §2.6 KD2 / §3.1 AC3·AC6 / §3.2 T3」+「M1/M8 行」，不含 §1.3 N3 与 M9 行 |
| 7 | 7 | MANIFEST.md | — | Fixed | 先例行在位（`:742`，「**先例**：① 实现坐标 … ∥ ② 档内节 … ∥ ③ 迁移语义 …」+ 对齐/偏离句 `:743`） |
| 8 | 8 | MANIFEST.md | — | Fixed | 勘察行在位（`:744`–`:746`，含「**勘察行（查过的公共源 ∥ 结论）**」与未勘察声明） |
| 9 | 9 | MANIFEST.md | — | Fixed | 常量名单一：`:727` / `:761` / `:769` / `:771` / `:788` 及 §2.7 `:456` 均 `DOC_CHECK_BUILTINS` |
| 10 | 10 | MANIFEST.md | 🟡 | Unfixed | 索引行（`:889`）与回指列（`:795`）已补，坐标已给；但回指条号悬空：`:793` 「回指 FR42 ①–⑪」、`:802` 「FR42 ⑨–⑪」——`docs/core/requirements/ENGINEERING-MODE-V2.md` 内 `FR42` 只出现在 `:891` 标题，§13.20 验收仅 ①–⑧（`:920`–`:927` 末项「⑧ 本仓 696 条裸名指针改全路径后 gate 全绿」），⑨–⑪ 无所指 |
| 11 | 11 | MANIFEST.md | — | Fixed | AC-43 已改「**两族整键写（`docRoot` / `index` 父键传整个对象）⇒ 拒**」（`:887`）；本档入受影响文件行 22（`:781`） |
| 12 | 12 | MANIFEST.md | — | Fixed | DOC-DISCIPLINE.md §3.20（`:779`，2262 / ≤±4）与 PORTABILITY.md §3.1 三族→两族（`:780`，299 / ≤±4）已入表 |
| 13 | 13 | MANIFEST.md | — | Fixed | 节点数口径收一：`:767` 「20 → 12 节点——算式：整键 3 + `docRoot.*` 5 + `index.*` 4 = 12」，与 `:682`、`:673` 同算式 |
| 14 | 14 | MANIFEST.md | — | Fixed | `:728` 明写两项空列表恒空且无登记写入口，「与需求边界「不引入豁免清单」不冲突（空列表 ≠ 可登记豁免）」；KD-M1-50 同口径（`:791`） |
| 15 | 15 | MANIFEST.md | — | Fixed | `:726` 「`gate` 模式范围两来源（并集，由调用方传入）」，含父侧「触达记账 ∪ 本批提交 diff」 |
| 16 | 16 | MANIFEST.md | — | Fixed | `:733` 「**F8 面零改**」+ AC-51（`:803`）逐字保留引擎版本一致性 ERROR 与陈旧注记 |
| 17 | 17 | MANIFEST.md | 🔵 | Unfixed | 现值仍三处不等：§2.11 `:760` 181 ∥ §2.2 行 48 `:192` 「**178**」∥ §2.2 Δ 注 `:231` 「`manifest-schema.mjs` ≤ +16（166 ⇒ ≤182）」——178 与 166 自相矛盾 |
| 18 | 18 | MANIFEST.md | 🔵 | Unfixed | `persona-engineering.md` 仍未入 §2.11 受影响文件表（`:758`–`:781` 22 行无该档）；缓解口径 = §2.10 AC-K3「② 节内**零键名命中**（`:674`）」——但该档本次未读，是否含三键字面 unverified |
| 19 | new | MANIFEST.md | 🔵 | New | AC-46 / T80 用「旧八键档」措辞（`:798` 「夹具：旧八键档 → 读 → 写一已知键 → 回读档文」、`:810`），与需求 §13.20 验收⑤「`MANIFEST.md` 内「八键」零命中、「五键」在位」（`:924`）机判口径冲突——本档现仍 2 处命中「八键」，验收⑤按字面会红 |

计数：Fixed 14 · Unfixed 4（🔴1 / 🟡1 / 🔵2）· New 1（🔵）。上一轮 6 条 🔴 中 5 条已修实，第 6 条（权威档编辑点覆盖）残留 2 行未列。新增无 🔴。

VERDICT: changes-required

### 轮次 3（评审子代理）

## 轮次 3 复核（#75 四件落地）

复核面（本轮实读）：`docs/core/design/MANIFEST.md`（§2.2 `:175-249` · §2.10 `:660-704` · §2.11 `:705-820` · §3.1 `:822-895` · §3.2 `:896-980`）· `docs/core/requirements/DOC-CHECK.md`（全档）· `docs/core/requirements/ENGINEERING-MODE-V2.md`（§13.20 `:891-927`）· `docs/core/design/ENGINEERING-MODE-V2.md`（`:25-84`）。上一轮 4 件 + 1 条新问题全部闭合，无新增 🔴。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 6 | docs/core/design/MANIFEST.md | 🔴 | Fixed | 行 19（`:778`）已把两处缺项写入编辑点并给出改后文案：「§1.3 N3（`:34`）「声明面（manifest `docRoot` + `checkConfig`）承载」→「声明面（manifest `docRoot`）承载」· §2.2 M9 行（`:72`）」；实读 `docs/core/design/ENGINEERING-MODE-V2.md:34` = 「声明面（manifest `docRoot` + `checkConfig`）承载」、`:72` = 「运行期加载面——M9 落点读 manifest `promptsLanding`」，与行 19 引用的现值逐字一致；M1（`:64`）/ M8（`:71`）亦在列 |
| 2 | 10 | docs/core/design/MANIFEST.md | 🟡 | Fixed | 回指条号已改真号：`:794` 「**需求 1–7**（`:908-916`）· **验收 ①–⑧**（`:920-927`）」，行区间经需求档实读核对（需求 1 `:908` … 需求 7 `:916`；验收 ① `:920` … ⑧ `:927`「⑧ 本仓 696 条裸名指针改全路径后 gate 全绿」）；AC-45–AC-51 各行回指逐条落在实有项（需求 1/4/6/5/3/2 ∥ 验收 ①②④⑦③），`:806` 补齐需求 7 ∥ 验收 ⑤⑥⑧ 去向；§3.1 索引行 `:892` 同口径。⑨–⑪ 悬空已消除 |
| 3 | 17 | docs/core/design/MANIFEST.md | 🔵 | Fixed | 三处现值收一：§2.11 `:760`「| 181 | ≤ −18（结构不变） |」∥ §2.2 行 48 `:192`「**181**（2026-10-22 实测）」∥ Δ 注 `:231`「≤ +16（预算基数 166 ⇒ 上限 182；**现测 181**）」——166 已标为预算基数、181 为现测，算式自洽 |
| 4 | 18 | docs/core/design/MANIFEST.md | 🔵 | Fixed | persona 行已登记为零改并附实读证据：`:782`「**零改**——三键名实读（2026-10-22）：`promptsLanding` · `checkConfig` 各 0 命中」（现值 248 · 增量 0）；证据本体（persona 档内容）不在本轮评审面 ⇒ 未独立复核 |
| 5 | 19 | docs/core/design/MANIFEST.md | 🔵 | Fixed | 验收⑤ 已限定为现态表述：需求 `:924`「⑤ `MANIFEST.md` 内「八键」作为**现态表述**零命中（旧档夹具描述不计——如「旧格式档」类措辞）、「五键」在位」；设计侧 `:781`「**验收⑤ 口径注**：现态「八键」零命中只判**现态表述**；AC-46 / T80 的「旧八键档」= 旧档夹具描述，不计」+ `:806` 同口径 ⇒ 机判与夹具措辞不再冲突 |

计数：**Fixed 5 · Unfixed 0 · New 0**（轮次 2 已闭合的 14 条 = 1–5 / 7–9 / 11–16，按轮次 3 声明不重开；本轮通读 §2.11 / §3.1 所见与其结论一致）。上一轮唯一 🔴（Orig# 6）已修实。

VERDICT: pass

## §4 用户批准（主 agent）

**批准依据**：用户 2026-10-22 10:21「**不要有这个键，这是thincoder产品内部的事儿，挂到用户那边是几个意思？**」→ 10:22「**checkconfig也去掉，现在都走内置工具了，不要留着误导。**」→ 10:24「**advisor为什么要另外指一套文档指针？这个也很不对啊！docRoot不都指定过了吗？advisor这个键也没必要。**」→ 10:27「**改成用新的内建的doc_check工具只查指定文件**，你他妈的还留着一个门？要求强制全查？！」。

- 链路：设计 `#68` → 评审 `#72` / `#74` 两轮 changes-required → 修正 `#73` / `#75` → `#76` **pass** → 实施 `#77` → 设计档随正 `#78` / `#79` / `#80`。
- 无 🔴 遗留；无跳步。用户的四句都是「删」，本批交付形态 = 八键 → 五键 + `doc_check` 只判传入档。

## §5 实施记录（eng-coder）

**状态行**：实施完成 2026-10-22

### 5.1 落点（按受影响文件表逐行）

| 行 | 档 | 动作 | 读数 |
|---|---|---|---|
| 1 | `thincoder-core/manifest-schema.mjs` | 删三键默认值 · `nestedKeys` 两族 · 删 `advisor` 校验支 · 头注 / `fillDefaults` 注释随正 | 181 → 153 行 · `DEFAULT_MANIFEST` 五键 |
| 2 | `thincoder-core/doc-check/index.mjs` | 新 `DOC_CHECK_BUILTINS` · `configError` / `gateParamError` / `readManifest` 退场 · 范围 = 传入清单 | 240 → 160 行 · `readManifest` 零命中 |
| 3 | `thincoder-core/doc-check/anchors.mjs` | 解析序收两级 · 删域根 / 声明根 / basename 索引 / ③b 回退 | 171 → 106 行 |
| 4 | `thincoder-core/doc-check/width.mjs` | `scanDomain` / `discoverDomains` / `walkMd` 退场 · 判定 = 传入集 | 132 → 87 行 |
| 5 | `thincoder-core/advisor/project-context.mjs` | docMap 由 `docRoot` 派生两级 · standards 面撤除保留降级句 · 头注 | 197 → 222 行 · +25（见 5.4） |
| 6 | `thincoder-core/declaration.mjs` | 投影面停读 `advisor.*` · `declared` 去掉两项 · 退役档告警句随正 | 378 → 371 行 |
| 7 | `thincoder-core/agent-tools/manifest.mjs` | 白名单 12 节点句 · 两族整对象拒面 · 描述行 / 拒文案随正 | 200 → 199 行 |
| 8 | `thincoder-core/tool-docs/manifest.md` | 键目录 20 → 12 节点（3+5+4）· 首行键面句 · 写面两族 | 28 → 29 行 |
| 9 | `thincoder-core/tool-docs/doc_check.md` | 参数段改内置常量 · 删 `checkConfig` 说法 · 范围 = 传入档 | 58 → 54 行 |
| 10 | `scripts/doc-check.mjs` | 参数源 = `DOC_CHECK_BUILTINS` · 删 manifest 读取 · 删 `discoverDomains` | 91 → 77 行 |
| 11 | `scripts/doc-check-anchors.mjs` | 解析序两级 · 声明根 / 域根 / basename 兜底退场 · `scanDocAnchors` 退场 | 356 → 296 行 |
| 12 | `scripts/doc-check-width.mjs` | 缝面改再出口 `DOC_CHECK_BUILTINS` + 谓词（`scanDomain` / `discoverDomains` 不再出口） | 6 → 8 行（+2） |
| 13 | `scripts/doc-check-linecounts.mjs` · `scripts/doc-check-targets.mjs` | 表写零改；实际见 5.3 第 1 条（targets 删死码）· linecounts 仅头注一句随正 | linecounts 141 · targets 128 → 97 |
| 14 | `thincoder-core/test/doc-check-scope.test.mjs` | 夹具去 `checkConfig` · 补 AC-50② / 空清单「0 档受检」用例 | 83 → 103 行 |
| 15 | `thincoder-core/test/manifest-five-keys.test.mjs` | 新增：AC-45 / AC-46 | 新增 65 行 |
| 16 | `thincoder-core/test/doc-check-builtins.test.mjs` | 新增：AC-47 / AC-50 / AC-51 | 新增 186 行 |
| 17 | `thincoder-core/test/advisor-project-context.test.mjs` | 新增：AC-48 / AC-49 | 新增 81 行 |
| 23 | `thincoder-core/prompts/persona-engineering.md` | **零改**（mtime 未动；三键在此档零命中，与设计实读一致） | 248 行 |
| 18 | `PROJECT-MANIFEST.json` | **本批未改**（主 agent 唯一写面） | — |

### 5.2 自检读数（逐条 = 命令 ∥ 结果）

**AC-45**（默认档恰五键 / schema 同集 / `nestedKeys` 两族）：`test/manifest-five-keys.test.mjs` 机判 `Object.keys` + 两族子键枚举 + 退场键 `in` 判 → 绿。
**AC-46**（旧档三键残留）：夹具旧档 → `readManifest` `ok:true` · `unknownKeys` 恰三 · 返回 manifest 无三键 → `writeManifest` 一轮 → 档文五键、三名零命中 → 绿。
**AC-47**（无 `checkConfig` 照常判）：五键夹具上 `gate` 出 `PASS` / `REFUSED（命中 1 条）`，报面无 ERROR / 缺参数行；源码面 `doc-check/{index,anchors,width,version}.mjs` 与 `agent-tools/doc-check.mjs` 的 `readManifest` 零命中 → 绿。
**AC-48**（docMap 派生三态）：① 声明根 README → 注入该档；② 仅公共祖先 README → 注入 `docs/README.md`；③ 皆无 → `NO_DOC_MAP_NOTICE`；本仓实跑落 `docs/README.md` → 绿。
**AC-49**（`advisor.*` 分支零残留）：`advisor/project-context.mjs` ∥ `declaration.mjs` 的 `docMap` / `standardsDoc` / `?.advisor` / `conv.advisor` 零命中 → 绿。
**AC-50①**（`scanDirs` / `anchors.domain` / `anchors.roots` 零消费）：六棵源码树（`thincoder-core` · `scripts` · `thincoder-cli` · 两端 `src` · `thincoder-render-core`）逐档扫 → 零命中。
**AC-50②**（不给 `docs` 报错）：引擎两种问法都抛「`docs` is required」；`report` 面 `[]` 抛「docs is empty」；非字符串条目抛「entries [i] are not paths」；工具面同口径（`DS-204` / `DS-209`）→ 绿。
**AC-50③**（两档只判两档 + 目标点查）：`files === checkFiles` 恰清单两档；哨兵档不入判（报面零出现）；`§N` 目标档读盘证 = 节缺 ↔ 绿翻转（`DS-202` / `DS-207` 邻证：裸名跨目录 ⇒ 档缺）→ 绿。
**AC-51**（F8 面零改）：`doc-check/version.mjs` 零改；六档清单逐字断言 · stale ⇒ gate 首行 ERROR · report 注记前置且原报面逐字 · 工具 gate 分支「版本校验先于引擎」→ 绿。

**夹具 `init` 五键**：`initManifest` 写源 = `DEFAULT_MANIFEST` ⇒ 落盘恰 `version` / `phase` / `docRoot` / `codePaths` / `index`；三退场键零出现（AC-45 用例的键集断言直接覆盖写源）。
**`doc_check` 三态**：`report` 传入两档 → `PASS` 面无 verdict；`gate` 传入 → `PASS` / `REFUSED（命中 K 条）`；空清单 → `PASS（0 档）` + `0 档受检`（见 5.3 第 4 条的口径裁定）。
**全仓零消费**：见 AC-50①；`.thincoder/tmp/**` 的一次性探针仍含旧参数名（临时区，非产品面，未清）。
**测试**：`cd thincoder-core && node test/run.mjs` → `tests 35 · pass 35 · fail 0`（本轮前 4 档，现 35 档全绿）。
**机检**：`node scripts/prompt-refs-check.mjs` → `提示词面 69 档 · 代码面 463 档 · 命中 0` / `OK(prompt-refs): J1/J2/J3 三式零命中`。
**工具描述门**：`doc_check` gate 判 `thincoder-core/tool-docs/manifest.md` + `thincoder-core/tool-docs/doc_check.md` → `PASS`（0 条命中）。

### 5.3 表外改动披露（逐条 + 理由；均为「真实交付所必需」）

1. `scripts/doc-check-targets.mjs`：删 `collectSourceDomain` / `LEDGER_NAMES` / `walkMd`（128 → 97 行）。理由 = AC-50① 的「`scanDirs` 零消费」是全仓源码面判据，而这三个符号是该面最后一位消费者；留着即判据不成立。设计表第 13 行「零改」的前提（不在判据链上）与事实不符——由本批实测更正，设计档归设计席。
2. `thincoder-core/agent-tools/doc-check.mjs`：参数段与 `docs` 契约随正 · 删 `runDocCheck(root)` 无清单路径 · 补「非字符串条目不吞」。理由 = 工具 schema 是模型可见文本，留着「省略 ⇒ 全域」就是留一条假指引；且 AC-50② 的工具面要同口径。
3. `thincoder-cli/scripts/doc-impact.mjs`：反查目录改本仓常量 `DOC_DIRS`、删 `readManifest`。理由 = 它运行时读 `checkConfig.scanDirs`，键一删即 `TypeError` 崩；不修则本批交付带一个必崩脚本。
4. `thincoder-core/agent-tools/batch-gate.mjs`：删死分支（`res.error`，引擎只抛不返）· 两处注释随正（判据参数 = 内置常量；批档排除理由）。理由 = 死分支读起来像第二套错误协议；注释与原行为相悖。
5. `thincoder-core/manifest.mjs` · `advisor/messages.mjs` · `scripts/doc-check-linecounts.mjs`：头注 / 体注各一句随正（`checkConfig` 不再是声明面、standards 走降级句、行数面不吃 manifest 参数）。理由 = 这批句与本批改后的代码直接相悖，属交付引入的漂移。
6. `thincoder-core/test/doc-check-3b.test.mjs`：**删除**。理由 = 它测的是「③b 同板块回退」，本批按设计把该回退整支退场（裸名不跨目录解析），用例的对象已不存在；留着会 import 已删的 `scanDomain` 而红。

### 5.4 行长预算读数（对设计表「增量 ≤±N」的实测偏差）

| 档 | 设计现值 | 实测 | 偏差 | 说明 |
|---|---|---|---|---|
| `manifest-schema.mjs` | 181 | 153 | −28（帽 −18） | 除表列三处外，还删了随 `checkConfig.anchors.roots` 一并退场的 `anchorRootError`（其唯一消费面是本批删掉的两处） |
| `doc-check/index.mjs` | 240 | 160 | −80（帽 −70） | 删面比估计多：`configError` / `gateParamError` / `readManifest` / `resolveRange` 的域求交 / `undecidableReason` 三因 |
| `doc-check/anchors.mjs` | 171 | 106 | −65（帽 −40） | 域名索引 + ③b 回退 + 声明根归类三块整体退场 |
| `doc-check/width.mjs` | 132 | 87 | −45（帽 −20） | `discoverDomains` / `scanDomain` / `walkMd` 三件退场 |
| `advisor/project-context.mjs` | 197 | 222 | +25（帽 ±12） | 派生梯需要三个新单元（声明根枚举 / 公共祖先 / 纯函数 `findDocumentMap`——后者是 AC-48「纯函数三态」的落点） |
| `declaration.mjs` | 378 | 371 | −7（帽 ±6） | 差 1 行 |
| `scripts/doc-check-anchors.mjs` | 356 | 296 | −50（帽 −60，帽内） | — |
| `scripts/doc-check-targets.mjs` | 128 | 97 | −31（表写零改） | 见 5.3 第 1 条 |

### 5.5 评审轮次与终态

- **内部偏差审计（explore · 1 轮）**：报 8 条。已修 4 条（M8 引擎的 basename 兜底 = 第三级解析，删；`docs` 条目静默丢弃，改抛；三处陈注随正；「0 档受检」字样）。转裁定 1 条（gate 空清单，主 agent 已回 A）。按读数披露 3 条（表外档 / 预算 / AC-50③ 读盘计数不可装）。
- **代码评审（advisor · 2 轮）**：第 1 轮 `pass`（无 🔴；🟡 4 条均 report-only / 可选；🔵 6 条）；第 2 轮（只核修复声明）`pass`，并新增 2 条 🔵（session 支措辞错格、`manifest.mjs` 体注「八键」）——两条已在同轮修掉并由 `DS-206` / 头注锁住。
- **终态**：`clean`（无未处置的 must-fix；余项 = 设计档归设计席的两条协调项 + 三条可选改进，均在交付报告点明）。
- **AC-50② 口径（主 agent 裁定 A）**：`report` 面不给 ∥ `[]` ∥ 非数组 ∥ 非字符串条目 ⇒ 一律报错；`gate` 面空清单 ⇒ `PASS（0 档）` + **明写「0 档受检」**（不得读成「已检」）。两侧读数分别由 `DS-204` / `DS-206` 锁；设计档该条口径由设计席补，实施轮不改设计档。

**补记（收口读数）**：会话内 `doc_check` 工具跑的是进程启动时加载的旧引擎（报面仍是「声明域」与 `checkConfig` 口径）⇒ 其读数不可作交付判据；交付门读数改由工作树的交付版引擎跑出。
**补记（交付门）**：`thincoder-core/tool-docs/manifest.md` + `thincoder-core/tool-docs/doc_check.md` ⇒ `DOC-CHECK GATE: PASS`（0 条）。本批档整档判 ⇒ `REFUSED（命中 145 条）`，其中 **§5 内 0 条**（唯一 2 条已同轮改为全路径）；余 145 条全在 §1–§4（裸名指针——只写档名不写路径——+ 超宽行），非本席笔域 ⇒ 上抛父侧转派。

## §6 验证与收口（父代理）

## 验证与收口

**链路**：设计 `#68` → 评审 `#72`（changes-required 🔴6 🟡10 🔵2）→ 修正 `#73` → 复核 `#74`（changes-required：残余 🔴1 🟡1 🔵2 + 新增 🔵1）→ 修正 `#75` → 复核 `#76` **pass** → 实施 `#77` → 设计档随正 `#78` / `#79` / `#80`。

**父侧复跑（2026-10-22 11:32 · 会话重启后新引擎）**

| 判据 | 读数 | 判定 |
|---|---|---|
| `manifest read` | `state=ok` · 键集 = `version` / `phase` / `docRoot` / `codePaths` / `index`（**五键**；三退场键零出现） | ✅ |
| `doc_check` gate（六档） | **PASS** · 0 命中 · 报面已为「阈值 300 字符（**工具内置常量**）」「**判定范围 = 解析范围 = 传入档**」 | ✅ |
| 代码侧 AC-45–AC-51 | 全绿（实施席 `#77` 读数：五键键集 · 旧档迁移 · 无 `checkConfig` 照常判 · 文档地图三态 · `advisor.*` 零残留 · `scanDirs` 零消费 · 空清单两面分明 · 引擎版本 ERROR） | ✅ |
| 测试 | `node test/run.mjs` ⇒ **35 pass / 0 fail** | ✅ |
| `prompt-refs-check` | 命中 **0** | ✅ |

**收口轮处置（父侧 · 机械形修正，可回退 checkpoint `mviyrzpf-tx9c`）**

1. **本仓 manifest 删三键**（`PROJECT-MANIFEST.json` = 主 agent 唯一写面）：`promptsLanding` / `checkConfig` / `advisor` 删除，键序保持五键。
2. **机械指针补全（`#1731` 预支 · 只限本轮触达六档）**：141 行 / 57 个 token 由裸名/相对形补成仓根相对全路径（`design/X.md` → `docs/core/design/X.md`；`common.md` → `thincoder-core/prompts/common.md`）；`_archive` 副本全部排除；歧义一律留判不自选。**为什么在本批做**：`batch close` 的门判本轮触达档整档，留着裸名就关不掉门——这不是顺手还债，是关门的必要条件。
3. **三处语义残留**：`:944` 桌面域三 token 补全 · `:904` 旧 `docs/README.md` 探测句改为 `docRoot` 两级派生（`advisor` 键已退场）· 「TUI 档 §15.x 族」拆开邻接（该行本身是「某串零命中」的验收句，被引擎误当指针）。
4. **计数更正**：`MANIFEST.md` 表行 20 `DOC-DISCIPLINE.md` 现值 2262 → **2180**（实测；成因 = `#79` 语义收口 + 指针补全）。

**设计席回报的两条上抛（已处置）**：`#79` 的「55 条 REFUSED 就地改 ∥ 归 `#1731`」⇒ 就地改（见处置 2，父侧代做）；`#80` 的「行 20 现值 2262 vs 实读」⇒ 已按实测收正（见处置 4）。

**已知边界（记录，不改）**：`scripts/doc-check*.mjs` 仍以显式 `--root` 为域整树枚举 `.md`（`scripts/doc-check-anchors.mjs:215`）——设计档 `#80` 已如实登记为「脚本面现状」，引擎面不再有全域扫描支；该枚举的去留 = 另裁。

**收口清单**：`doc_check` PASS（六档）· 暂缓批复核无 · 前批遗留无 · 用户文档面同步：`PROJECT-MANIFEST.json` 五键（已落）· 台账 `#1730` → **已核销** · 令牌链终消费 · 新债：`#1729`（`publicRepos` 待裁）· `#1731` 余量（全仓裸名指针，六档之外）。
