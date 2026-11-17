# 2026-11-12 · evidence-not-pointer
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 00:30「如果是这样的话，那就是我们的检查逻辑有问题」——那条证据串写 §3 时全仓唯一后缀可解析，次日仓里多一个同名档即变 `档缺`；批档本身没变，是周围在变。
> 台账 = #2343（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-11-12
批起 sha = 48482678ab9c708d3eaf63d5d49f520d2041ae34

### 条目与授权口径（父侧）

**用户原话**（2026-11-12 00:30）：「如果是这样的话，那就是我们的检查逻辑有问题。」

**现场**：`docs/batches/2026-11-11-gate-silent-when-pass.md` §3 轮次 7 的表格里一条证据串——

```text
agent/setup.mjs
```

```
写的时候  仓里该后缀唯一 ⇒ 后缀兜底解得到 ⇒ 放行
次日      新增 thincoder-vscode/src/agent/setup.mjs ⇒ 两候选 ⇒ 变 档缺
```

**批档一个字没改，是仓在动。** 于是这条门对过程档是「只要它还开着一句，迟早必红一次」——改不完。

**这条自己就撞了同一堵墙**：本段第一次写入被门拒，正是拒在这个串上（两条 `锚·档缺`）。**判决书就是它的论据**，已记在此。

**判据错位**：现在问「这个串**此刻**解析不解析得开」；该问「**它是不是一个指针**」。

那条串在 §3 那一格里是 **`grep` 读数里的证据**，为**那次跑**负责：当时解析得开，读数就是真的；后来多一个同名档，不改变那次读数为真。

**已有先例站同一边**：`批档 ↔ 批档 互引不判`（`doc_check` 回执里那行「互引未判 N 处」）——理由同：过程档的引用不为存续负责，它随批档一起死。本条只是没走到「代码路径」这一格。

**改法（待设计）**：

```
批档（过程档）内代码路径 token  ⇒ 证据面，不判 档缺
规范档 / 设计档 / 需求档        ⇒ 照判（它们要活很久）
判据从「能不能解析」换成「这东西要不要活过这一批」
```

**边界**：不改写面（写的时候照判，写坏的当场仍拦）；只改「整档判」对过程档证据形内容的处置。

### 第二条（用户 2026-11-12 00:32）

**用户原话**：「我觉得 doc_check 的指针校验逻辑不对，不能简单的用出现同名文件就判定死指针。」

**现场（与第一条同一个地方，更明显的形态）**：唯一后缀兜底把**存在性**与**名字的唯一性**混成了一条判据——

```
零命中   ⇒ 档缺          （对：确实没有）
恰一处   ⇒ 解析成功      （对）
多候选   ⇒ 档缺          （错：它在，只是指不明）
```

那条证据串头一天唯一 ⇒ 解得到；次日仓里多一个同名档 ⇒ 两候选 ⇒ 判 `档缺`。**文件一直在，变的只是名字够不够唯一。**

**判据错位**：`档缺` 断言的是「**这个东西不存在**」；两候选断言的是「**存在，但指不明**」。两种状态共用一个词，等于把「我写得不够精确」报成「它不在」——而且报错方向朝「引用是错的」，读者会去改一条本来正确的引用。

**改法（用户 00:37 定案）**：

```
解得到一个文件（唯一或多解都算）  ⇒ 通，零输出
一个都解不到                      ⇒ 档缺，拦
```

**多解不列清单、不报数、不出任何一行。** 用户 00:37 原话：「出一行清单干嘛？看了有啥用？没用信息出来干嘛？！」——与 2026-11-11 16:37「不拦截的就不要报数……人家收到一个没意义的数据还要想半天」是同一条。

**与第一条的关系**：两条同源，都是 `档缺` 判得太宽。第一条说「证据不是指针」（不判），本条说「不唯一不是不存在」（判通且不出声）。合在同一批内设计，出同一份判据。


### 第三条：提示词追不上机检（用户 2026-11-12 00:40）

**用户原话**：「你同时也检查一下提示词，我发现机检都不判了，模型还在那儿劲劲的。」

父侧实扫 `thincoder-core/prompts/*.md`，两族残留：

**① 唯一性条款**（要删的那条规则，在提示词里还活着）

```
a bare name is fine while the name is unique
```

落点七处：`common.md` · `discipline-engineering.md` · `persona-eng-coder.md` · `persona-eng-designer.md` · `advisor-design.md` · `advisor-round2.md` · `advisor-round3.md`。

**② 围栏建议**（教模型把路径塞进围栏躲开机检）

```
Examples — sample rows, commands, paths — go in a fenced block, which the anchor
and paragraph criteria skip whole; a path left in prose or a table must be a real file
```

同一批七处。**这条是今晚两次「用围栏换绿」的师傅**——模型不是自己想出来的，是照提示词做的。

**本批范围（父侧裁定）**：两族同轮删改，判据与代码同一批落地。理由 = D11「一条规则改，它所在的每一层同一批改」；提示词是最硬的那一层，它不改，下一轮模型照旧。

**写法要求**：提示词只写机检**实际会做什么**，不写「怎么写能躲过它」；示例进围栏是排版需要，不能说成「围栏能免检」。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修轮 3：实施落地后设计档收正 4 项（§2 机读清单 ∥ DOC-CHECK §2.9.7 ∥ DOC-DISCIPLINE 两族退役句 ∥ AC-5 重述）；④ 的代码面一半（读数行措辞）归实施席）


## 本批条目（两条，同一判据的两层）

**① 多解不判红（主条）**：解析面的「解得到但不止一处」并入「解得到」——回执零输出。
**② 提示词同轮删**：两族残留按「机检不判的就不写」删除（落点实测 6 + 4）。

### 1. 机制（判据面）

- **两态**：`解得到一个文件 ⇒ 通`（一处 ∥ 多处同判，零输出）；`一个都解不到 ⇒ 档缺，拦`。`档缺` 的定义句 = 「这个 token 在本仓解析腿上一条腿都不成立、后缀全树零命中，且不在判域外」——它只断言**不存在**，不断言「指不明」。
- **多解零输出**：不列候选、不报数、不提示歧义。`suffixCandidates` 载荷、`档缺` 行上「后缀命中 N 处」那半句、候选封顶常量 `SUFFIX_CANDIDATE_MAX` 一并退役。
- **下游两条内容判据**（`节缺` ∥ `引缺`）对多解 token **不判**：它们断言的是「**那一份**档里有没有这一节 / 这一段」，目标不定就没有主语；拿代表处去判，仓里多一份同名档就会把一条正确的引文判红——同一条病。
- **射程只管文档里的指针**：参数面的 `ambiguous`（`target` 一类由人给的坐标）保留——那里选哪一个决定整次调用的坐标系。
- **与改动区那批判据（`#2339`）的交界**：那批判「哪些字节算本次」（`zones` 入参），本批判「这条 token 是不是一次真悬空」。两条串联执行：区外的 token 不入判集，区内的 token 按存在性判——**区内多解照通，区内零命中照拦**。单源 = `docs/core/design/DOC-CHECK.md` §2.10.1 ∥ `docs/core/design/PATH-RESOLUTION.md` §2.8。
- **提示词**：删「名字必须唯一」与「围栏能免检」两族，不留替代解释、不加过渡句；写法 = 机检怎么做就怎么写，机检不判的不写。

### 2. 现场（本批自己也撞了一次）

写本批设计档时，写入被门拒在这一形上：`agent/<name>.mjs`（拒文 `档缺 … 后缀命中 2 处：thincoder-core/agent/setup.mjs ∥ thincoder-vscode/src/agent/setup.mjs`）——**同一个 incident 在本轮当场复现**，正是 ① 要治的那一形。判据落地后该形通、零输出。

### 3. 受影响文件（机读清单）

```text
| 档 | 分拆方案 |
|---|---|
| thincoder-core/path-resolve.mjs | — |
| thincoder-core/doc-check/anchors.mjs | 越 500：两笔只搬不改的分拆已落地，拆前拆后 `doc_check` 判决逐字相等（读数见 §5） |
| thincoder-core/doc-check/doc-suffix.mjs（新增） | 第一笔分拆落点 = 后缀接线族（`recordSuffix` ∥ `quoteJudged` ∥ `sectionJudged`） |
| thincoder-core/doc-check/doc-batch-face.mjs（新增） | 第二笔分拆落点 = 批档面判族（`batchFaceContext` ∥ `baseOf` ∥ `batchFaceTargets` ∥ `isBatchFaceRef`） |
| thincoder-core/doc-check/report-blocks.mjs | — |
| thincoder-core/doc-check/index.mjs | — |
| thincoder-core/doc-check/doc-tokens.mjs | — |
| thincoder-core/tool-docs/doc_check.md | — |
| thincoder-core/prompts/common.md | — |
| thincoder-core/prompts/discipline-engineering.md | — |
| thincoder-core/prompts/persona-eng-coder.md | — |
| thincoder-core/prompts/persona-eng-designer.md | — |
| thincoder-core/prompts/advisor-design.md | — |
| thincoder-core/prompts/advisor-round2.md | — |
| thincoder-core/prompts/advisor-round3.md | — |
| test/RTM.md | — |
```

### 4. 验收（每条带红侧）

- **AC-1 多解通且零输出**：同名两份的裸名 ⇒ 零命中，回执里无候选清单、无计数行。红侧两拍：退回判 `档缺`（出命中一条）· 把候选列进回执（多一行）。
- **AC-2 零命中仍拦**：仓内零份 ⇒ `档缺` 一条（反向控制：写成「凡解不到都放行」⇒ 本格转红）。
- **AC-3 多解上的 `节缺`／`引缺` 不判**，单解照判（红侧：让多解也判 ⇒ 一条正确引文被判红）。
- **AC-4 提示词零残留**：七档内两族字符串各 0 命中；通读：这七档里没有一条是「机检不判而提示词在管」的文档写作要求。
- **AC-5 交付面零回归（分拆不变式）**：同一判据下、同一份干净清单，分拆前后各跑一次 `report` ∥ `gate` ⇒ 读数行 ∥ 命中行 ∥ 结论句 ∥ 清单位置逐字相等（不带 `texts` ∥ `zones`）。**读数行的块头措辞 = 判据名，不在回归面内**：判据已从「唯一后缀」换成「有命中即解得到」，块头随之改、不再写「唯一」；它要守的是「名字与判据同口径」，不是「与改前字节相同」。

### 5. 关键决策

| 决策 | 选了 | 否掉了什么，为什么 |
|---|---|---|
| 唯一性判据 | 存在性（解得到即通） | 保留「唯一才通」——那判的是仓里别处有没有同名档，不是引用对不对；同一条引用次日会因仓库变化转红 |
| 多解的输出 | 零行 | 列候选 ∥ 报数——用户 00:37 与 2026-11-11 16:37 两次裁定同一句：不拦的不报数 |
| 多解的 `节缺`／`引缺` | 不判 | 拿代表处判——新同名档会把正确引文判红，同一条病 |
| 证据面豁免（已撤回） | 不立——一个案子只留存在性判据一条 | 立第二条救同一个案子：存在性判据已让「多解」通，它只多开一个与 `DD-211`（悬空照判）正面对冲的口子 |
| 提示词两族 | 整句删 | 改写成「机检怎么判」——用户 00:41：别描，不该出现的删掉 |

### 6. 上抛项（父侧处置）

1. **[上抛·待裁] 需求档与设计冲突**：`docs/core/requirements/DOC-CHECK.md` F3 现文「多候选 ∥ 零命中照判 `档缺`」与「只判「全树恰一处」，不做同名回落、不产多候选受理」与用户 00:37 定案相反。需求档不在本席笔域——请父侧同轮改，否则需求层与设计层两个口径并存（D11）。
2. **[上抛·知会] 计数与实测的差**：任务书 §1 第三条记「两族各七处」；本席实扫 `thincoder-core/prompts/*.md` 得 ① 六处（`common.md` 无该行）· ② 四处（三个 advisor 档只有 ①）· 两族并集 = 七档。已按实测删，未按「七 + 七」。
3. **[上抛·待裁] 笔域口径**：本席角色档写「提示词是产品代码，不在此席笔下」；用户本轮明令这七处为设计面笔域，按用户裁定落笔。若这是长期口径，角色档那一句要改（父侧处置）。
4. **[上抛·知会] 存量登记未命中**：`report` 面出「登记未命中 1 条」——manifest 里一条豁免登记的原文已变或已不在判集。非本批引入，请父侧复核后删。
5. **[上抛·知会] 残留仍在的产品面**：`thincoder-core/tool-docs/doc_check.md` 仍写着唯一后缀判据（`with two or more, or none, it is judged 档缺`）与围栏免检层意；`thincoder-core/prompts/persona-plan.md` 有「cite real file paths」类要求。前者已进机读清单（实施轮改），后者不属本批七处，登出待父侧定。

### 7. 尺寸档位结论 + 读数

读数（`doc_check` 的 `lines` 面，交付前一次跑）：

```text
474  thincoder-core/doc-check/anchors.mjs
498  thincoder-core/path-resolve.mjs
399  thincoder-core/doc-check/index.mjs
305  thincoder-core/doc-check/report-blocks.mjs
108  thincoder-core/doc-check/doc-tokens.mjs
 59  thincoder-core/doc-check/doc-batch-face.mjs
 27  thincoder-core/doc-check/doc-suffix.mjs
合计 7 档（其他检查硬线 0 · 设计器硬线 0 · 未越线 7）
```

零档跨线：`thincoder-core/doc-check/anchors.mjs` 的两笔分拆已落地并回到线下，其余各档本就在线下。三份设计档同一次 `report` 面命中 0 条（锚 ∥ 段长 ∥ 行长均清）。

### 修轮 · 评审轮次 1 的 11 条逐条落地

判据 = 跟着盘的实况走，不跟上一轮自己写的话走。三档改完 `doc_check` gate 首行 `DOC-CHECK GATE: PASS`（3 档全清）。

| # | 发现 | 处置（落点 + 改法） |
|---|---|---|
| 🔴1 | `suffixCandidates` 一处退役、三处还活着 | **改** `docs/core/design/PATH-RESOLUTION.md`：§2.1 `dangling` 载荷行删掉「`suffixCandidates`（仅第 6′ 步 ≥2 那一支…）」；§2.4 末尾删「第 6′ 步 ≥2 那一支的候选走 `suffixCandidates`」那句；AC-19 删「`suffixCandidates` 为空」；§3 的文档同步行随整节改建。现全档只剩 §2.8 那一条活着的说法（含 `SUFFIX_CANDIDATE_MAX` 退役），`grep` 复核 = 1 处命中 |
| 🔴2 | 档位结论与实量相反 | **改** 同档 §3，**时态收正、方案不动**：`doc-check/index.mjs` 与 `agent-tools/subagent-spawn.mjs` 从「本批分拆」改成**已落地**（五族 ∥ 两族的目标档都在盘，两档都已回到线下）；真越线只留 `doc-check/anchors.mjs` 一档。读数由 `lines` 面重取：越线 1 档（设计器硬线），其余各档未越线 |
| 🔴3 | AC-7 与 §9 打对台 | **改** 同档：AC-7 改成与 §9 同一份事实；§9 重写为盘上现状——**改 2 行（29-3 ∥ 29-6）· 增 1 行（29-9）· 冗余 0**。`29-4` 与 `37-1` … `37-4` 的行与用例都已在盘，从「改 ∥ 增」里退出，改为「已落地不再列」 |
| 🔴4 | 设计档里的「受影响文件清单」整节 | **删** 同档 §3 整节（新增 ∥ 改（源码） · 测试 · 文档 四张清单），只留档位结论；该表归本段（`docs/core/design/DOC-DISCIPLINE.md` §3.7 条目 H） |
| 🟡5 | §9 的 29-3 期望值与 §2.8 相反 | **改** 同档 §9 表：29-3 的跑面写明 = `doc_check` 一跑 `gate` + 一跑 `report`；期望值按新判据给——夹具改成全仓零后缀命中 ⇒ `档缺` 一条 + 同名提示，「后缀命中 N 处」括注退役；「同名两处 ⇒ 通、零输出」搬进 29-6 的 `gate` 面 |
| 🟡6 | §3 新增 ∥ 改重复、已在盘的档列在「新增」 | **随 🔴4 消解**：整节删除，机读清单只剩本段这一张表 |
| 🟡7 | AC-14 与 AC-16 对台 | **改** 同档 AC-14 ∥ AC-16：两条都点名面——`gate` 面回执零输出（不列候选、不报数）；`report` 面出后缀读数行与按 token 去重的清单（N = 已解析的命中处数，不是候选清单） |
| 🟡8 | 全文零处引 `requirements/DOC-CHECK.md` | **改** 同档 §5 对回口径：加第二处来源 = 需求档 `F3`（后缀兜底：解得到即通、一处与多处同判、零命中才 `档缺`）∥ `F22`（相对形腿序）∥ `F23`（域外不判）；AC-14 ∥ AC-16 的对回列改指 `F3` |
| 🟡9 | `DOC-CHECK` §9.2 与同档 §9 矛盾 | **改** `docs/core/design/DOC-CHECK.md` §9.2：改成「这两笔在那一册无行可改；该册本批另有改动 = 解析面那一笔的 29-3 ∥ 29-4 ∥ 29-6，逐行单源 = `docs/core/design/PATH-RESOLUTION.md` §9」 |
| 🟡10 | 新名三问缺行 | **改** 同档 §2.8 末：补四个名字的三问表——`SUFFIX_SKIP_DIR_NAMES` ∥ `suffixLookup` ∥ `isDeclaredRepoForm` ∥ `siblingRepoNames`，四条均 `existing: thincoder-core/path-resolve.mjs`（实读该档 45 / 246 / 299 / 290 行），消费面逐条写明 |
| 🔵11 | 环检边规则两处各写一份 | **改** `docs/core/design/DOC-CHECK.md` §2.5：该行改成指针——节点 ∥ 边 ∥ 叶仓 ∥ 只报穿过起点的环四条单源 = `docs/core/design/PATH-RESOLUTION.md` §2.7，本节不复制第二份 |

### 本段两处陈旧句收正

- **尺寸档位结论的读数刷新**（本节 §7 的读数块旧值来自上一轮）：重取（`doc_check` 的 `lines` 面，12 档）——`doc-check/anchors.mjs` 越设计器硬线（唯一一档）；`path-resolve.mjs` ∥ `doc-check/index.mjs` ∥ `agent-tools/subagent-spawn.mjs` ∥ `doc-check/report-blocks.mjs` 及其余各档全部未越线；五档 ∥ 两档的分拆目标档均已在盘。
- **上抛项 1 关闭**：`docs/core/requirements/DOC-CHECK.md` 的 F3 现文已是「一处或多处同判，**不输出候选清单**」∥「零命中才判 `档缺`」，与设计面同一口径，需求 ∥ 设计两个口径并存的问题消失。

### 上抛项（父侧处置）

1. **[已裁 2026-11-12] 证据面与 `DD-211` 相抵 ⇒ 撤证据面，`DD-211` 原样不动**：存在性判据（多解即通）已让立题那一形通过；第二条救它的规则只多开一个与 `DD-211` 正面对冲的口子。落地见下方「修轮 2」。
2. **[已裁 2026-11-12] 29-9 立**：入口 = 生产真出现过（本批立题那一次 incident）；断言按撤掉证据面后的判据改写（多解即通 ∥ 零命中拒），单源 = `docs/core/design/PATH-RESOLUTION.md` §9 的 29-9 行。
3. **[上抛·知会] 存量登记未命中 1 条**：每次 `report` 都出这一行——manifest 里一条豁免登记的原文已变或已不在判集。非本批引入，请父侧复核后删。
4. **[上抛·知会] 笔域口径**：本轮改了 `docs/core/design/PATH-RESOLUTION.md` ∥ `docs/core/design/DOC-CHECK.md`（均在声明清单内），未动 `docs/core/design/DOC-DISCIPLINE.md`。
5. **[上抛·知会] 指令与盘不符一处**：父侧点名「`index.mjs` ∥ `subagent-spawn.mjs` 那两句」；实读 `docs/core/design/DOC-CHECK.md` 全文对 `subagent-spawn` 零命中——该档只有 `index.mjs` ∥ `anchors.mjs` 两句，已按实况收正。`subagent-spawn.mjs` 的落地态住 `docs/core/design/PATH-RESOLUTION.md` §3，本轮实读已是「已落地」，零改。

### 修轮 2 · 父侧三条裁定落地（2026-11-12）

| # | 裁定 | 落点与改法 |
|---|---|---|
| 1 | 删 §2.11.5 证据面（含 AC-E13 ∥ AC-E14） | **删** `docs/core/design/DOC-CHECK.md` §2.11.5 整节与 AC-E13 ∥ AC-E14；原节末「与改动区那条判据的交界」一句保留、改写为本档 §2.11 面下一条——判据指向改成 §2.10.1 ∥ §2.11.2 ∥ `docs/core/design/PATH-RESOLUTION.md` §2.8，不再引已删节 |
| 2 | 收正 §2.9.7 时态 | **改**同档 §2.9.7：`index.mjs` 那句换成「五族分拆已落地」并列五个落点档；`anchors.mjs` 那句改成「仍越 500（504）· 识别面一族已落地 `doc-tokens.mjs` · 余下的分拆未落」。读数单源 = 本段 §7 的读数块（`lines` 面重取），此处不重复绝对值 |
| 3 | 引用 §2.11.5 处一并收正（`DD-211` 本体不碰） | **改**三处：同档「为什么文档名族裸名照判」的判据指针改指 `docs/core/design/PATH-RESOLUTION.md` §2.8；`docs/core/design/PATH-RESOLUTION.md` §3 的分拆族名去掉证据面半句；同档 §9 的 29-9 行断言与单源列整体改写。`grep` 复核 = `docs/core/design/DOC-DISCIPLINE.md` 对 `2.11.5` ∥ `AC-E13` ∥ `AC-E14` 零命中，`DD-211` 零改动 |

**按同一条判据扫时态**（「还有没有一句在说本批要做什么而其实已经做完了」）：`docs/core/design/DOC-CHECK.md` 另有四处同病——§2.9.x 的「不拆别的档」句、接缝句、三问表的 `NAME_CH` 与 `DEFAULT_DOC_EXTS` 两行——均改为「已落地 / 已在 `doc-tokens.mjs`」。`docs/core/design/PATH-RESOLUTION.md` §3 那两句（五族 ∥ 两族）本轮实读已是「已落地」，零改。

**同一 incident 本轮当场复现**：把立题那一形（带目录段、仓内两份同名档）原样写进 29-9 行时，写入被门拒（`锚·档缺` + 同名两处）——**判据尚未落地，门仍按旧口径拒**。故 29-9 行改成不带该字面 token 的描述式；这也正是本批要治的那一形：判据落地后同句通、零输出。

### 修轮 3 · 实施落地后设计档收正（D17 首个真实用例）

判据 = 盘上的现况，不跟落地前的计划句走。三档改完 `doc_check` gate 首行 `DOC-CHECK GATE: PASS`（3 档全清）。

| # | 项 | 改前 | 改后 |
|---|---|---|---|
| ① | 本段 §3 机读清单 | `anchors.mjs` 一行写「越 500（504）· 把「多解归并装配」一族搬去 `doc-suffix.mjs`，本批落步 实施轮」——`doc-batch-face.mjs` 无行，族名与本批判据下实落的内容对不上 | `anchors.mjs` 一行改「两笔只搬不改的分拆已落地，拆前拆后 `doc_check` 判决逐字相等（读数见 §5）」；新增两行：`doc-suffix.mjs` = 后缀接线族（`recordSuffix` ∥ `quoteJudged` ∥ `sectionJudged`）、`doc-batch-face.mjs` = 批档面判族（`batchFaceContext` ∥ `baseOf` ∥ `batchFaceTargets` ∥ `isBatchFaceRef`） |
| ② | `docs/core/design/DOC-CHECK.md` §2.9.7 | 「`anchors.mjs` 仍越 500 设计器硬线（504）· 余下的分拆未落」 | 「三族分拆已落地、已回到线下」：补后缀接线族 ∥ 批档面判族两条子项，落点围栏补两行；本段 §7 读数块按 `lines` 面重取，设计器硬线 0 档 |
| ③ | `docs/core/design/DOC-DISCIPLINE.md` | 两族退役句仍在档：§3.27 的落点句仍写「唯一才通 · 同名档上盘即转红」，§3.28 仍写「围栏块被判据整块跳过」并挂六档落点表 | §3.27 落点句改成产品面已在盘的那一句（`Doc names: any form that resolves.`），「三串齐（含 `same name`）」改「两串齐」，`A-DD42` ②④ ∥ `DD-194` 同步；§3.28 落点面改「零载体」+ 两条机制事实，六档落点表退场，`A-DD43` ①④ ∥ `DD-205` 改成「六档两串各 0」 |
| ④ | 本段 §4 的 AC-5 与本批判据名 | 「同一份干净清单跑 `report` ∥ `gate`，报面与改前逐字相等」——读数行的块头是**判据名**，判据换了而名字不换，读者照旧名字理解新行为；实施席因此判它破 AC-5 而不改（§5 上抛 4） | 拆成两半：**分拆不变式**（同一判据下、同一份干净清单，分拆前后读数行 ∥ 命中行 ∥ 结论句 ∥ 清单位置逐字相等）+ **判据名随判据**（块头措辞不在回归面内，不得再写「唯一」） |

**④ 的裁决依据**：AC-5 要证的是「这次重构没改输出」，块头措辞属判据名——判据从「唯一后缀」换成「有命中即解得到」，名字留着旧的就是错的。两条打架是因为原句把「判据名」与「判据输出」混成了一条。

**④ 未落的那一半**：读数行那句话住产品面（`thincoder-core/doc-check/report-blocks.mjs` 的 `SUFFIX_HEAD`），本席不碰代码——改写归实施席，判据由本节 AC-5 的新表述让路。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

评审对象 = PATH-RESOLUTION.md（本批设计档）＋ DOC-CHECK.md ∥ DOC-DISCIPLINE.md ∥ requirements/DOC-CHECK.md ∥ 五份提示词；判据 = `## Project Standards`（METHODOLOGY）＋ 设计评审 13 维。

| # | severity | status | evidence |
|---|---|---|---|
| 1 | 🔴 | 未处置 | PATH-RESOLUTION §3「受影响文件清单」 vs DOC-DISCIPLINE §3.7 条目 H「该表归**批档 §2**，状态档一格不留」；Standards F-R24a「设计档不设」；discipline-engineering 四步流程 step 2「full affected-file list」 |
| 2 | 🔴 | 未处置 | §3 贴线判「**越 800 硬线**，必须拆」∥「**越 500 设计器硬线**，分拆方案见本节末条」 vs `doc_check` report `lines` 读数：`doc-check/index.mjs` 399 · `agent-tools/subagent-spawn.mjs` 428 |
| 3 | 🔴 | 未处置 | §2.8「`suffixCandidates` 载荷与「后缀命中 N 处」那半句一并退役」 vs §2.1 `dangling` 载荷行∥ §3「`dangling` 增 `suffixCandidates` 渲染」∥ AC-19「`suffixCandidates` 为空」 |
| 4 | 🔴 | 未处置 | AC-7「29-1 ∥ 29-2 ∥ 29-3 零改零红」 vs §9「**29-3 改写**」；§9 计数行「**改 2 行（29-4 ∥ 29-5）**」 |
| 5 | 🟡 | 未处置 | §9「断言由「零命中仍档缺」收紧为「后缀命中 2 处仍档缺」」 vs §2.8「**仍算解得到：通且零输出**」 |
| 6 | 🟡 | 未处置 | §3 新增「- `thincoder-core/path-resolve.mjs`（本层本体）」 vs 同节 改「`thincoder-core/path-resolve.mjs` — 第 6′ 步」；`declared-repos.mjs` ∥ `cross-repo-refs.test.mjs` 已在盘 |
| 7 | 🟡 | 未处置 | AC-14「回执零输出（不列候选、不报数、不出行）」 vs AC-16「`report` 面出后缀兜底读数行与按 token 去重的清单」 |
| 8 | 🟡 | 未处置 | PATH-RESOLUTION 全文零 `requirements/DOC-CHECK.md` 引用；requirements F22「单源 = `docs/core/design/PATH-RESOLUTION.md` 的腿序表」 |
| 9 | 🟡 | 未处置 | DOC-CHECK §9.2「`test/rtm/paths.md` 因而**不在本批改动面内**」 vs PATH-RESOLUTION §9「改 2 行（29-4 ∥ 29-5）」 |
| 10 | 🟡 | 未处置 | §2.8「`SUFFIX_SKIP_DIR_NAMES`」∥§2.7「`isDeclaredRepoForm`」无三问行；同批 DOC-CHECK §2.9.1.1「新名三问」表在位 |
| 11 | 🔵 | 未处置 | §2.7「边 = 该根的 `declaredPublicRoots`」 vs DOC-CHECK §2.5「声明源同时是环检的边集」 |

计数：🔴 4 · 🟡 6 · 🔵 1（合计 11）。

VERDICT: changes-required

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据 |
|---|---|---|---|
| 1 | 🔴 | 已修 | 需求头行 ∥ F3 ∥ §3 边界 =「闸的拦截闭集 = `档缺` ∥ `引缺` ∥ `节缺` ∥ `段落长` ∥ `行太长`」；设计 §2.9.1 推论 4 同；DOC-DISCIPLINE「裁定面」`REFUSED（按类分列：锚 A 条 · P 段文字太长，难于阅读 · L 行太长）` |
| 2 | 🟡 | 未修 | §2.10.1「引擎入口加两个**可选**入参」 vs §3「`runDocCheck(root, { docs, mode, docsSource, lines })`｜**签名不变**」 |
| 3 | 🟡 | 已修 | PATH-RESOLUTION §3 表 3 行 +「其余本批改动档（源码 ∥ 用例）都在两条硬线之下，不带方案。」；现量 322 / 428 / 499 / 311 / 310 均 ≤500，唯一越线档 504 带方案 |
| 4 | 🟡 | 已修 | PATH-RESOLUTION §3「尺寸档位结论」＋「哪些档算本批改动面：归批档 §2，本档一格不留」 |
| 5 | 🟡 | 未修 | DOC-CHECK「| # | 决策 | 弃案 | 理由 |」∥「| 决策 | 选了 | 否掉了什么，为什么 |」；PATH-RESOLUTION KD-3「被否：全区 `root-first`…」 |
| 6 | 🟡 | 未修 | DOC-CHECK §2.9.7「超 300 的函数怎么处置 = 与越线档同一条：随分拆档一起排队，本批不另动结构。」 |
| 7 | 🟡 | 未修 | §9.2「识别面与豁免面（行已在盘）」＋「新增 = **2**（`44-1` ∥ `45-1`」 vs §9.1「**冗余 0**：`36-x` ∥ `44-1` ∥ `45-1`」 |
| 8 | 🟡 | 未修 | §9.1 改写表头「| 行 | 为什么变 | 改成什么 |」 |
| 9 | 🟡 | 未修 | §2.11.1「`./` ∥ `../` 开头的 token，在既有两级**之前**多一级」＋ AC-E11 ∥ AC-E12 ∥ AC-E12b |
| 10 | 🟡 | 未修 | 档头「需求层 = `docs/core/requirements/DOC-CHECK.md`（F1–F23 / AC-1–AC-19）」；`FILENAME_CLASSES` ∥ `PLACEHOLDER_STEMS` ∥ `prompt-refs-check` 零命中 |
| 11 | 🟡 | 未修 | §2.9.1.1 三问表止于「`环引读数行` 的字面 …」行 |
| 12 | 🟡 | 未修 | requirements F12「（实测 10 条命中里 6 条属于这一类）」· AC-5「现状实测：修引擎后 158 → 0（2026-10-18 16:27）」 |
| 13 | 🔵 | 已修 | DOC-CHECK §2.9.7「五族分拆已落地」∥「仍越 500 设计器硬线（504）…余下的分拆未落」 |
| 14 | 🔵 | 已裁（非本批） | 本段上抛项 3「存量登记未命中 1 条…非本批引入」；本轮 report 仍出「登记未命中 1 条（原文已变或已不在判集，复核后删）」 |
| 15 | 🔵 | 未核 | `test/RTM.md` ∥ `test/rtm/*.md` 在评审范围外；§9.2 引「`test/rtm/paths.md` 的 29-2 行**盘上已是新口径**」未核 |
| 16 | 🟡 | 新增 | requirements F3 行名仍「**判据 = `档缺` 与 `引缺` 两类**」，同行内容已改五类闭集 |
| 17 | 🔵 | 新增 | DOC-CHECK §2.9.7「`test/integration/batch-close-gate.test.mjs` 越 500 设计器硬线 ⇒ 切「夹具与 git 语料」一族搬去新档」——现量 636，同节另两条已改「已落地」时态 |

计数：已核 15 条（已修 4 · 已裁 1 · 未修 10）· 新增 2 条（🟡 1 · 🔵 1）· 未决 🔴 0。
四档 `doc_check` report 命中 0 条（锚 ∥ 段 ∥ 行均清）。

VERDICT: pass

### 轮次 3（评审子代理）

| # | severity | status | evidence |
|---|---|---|---|
| 1 | 🟡 | 未处置 | `doc-batch-face.mjs` 头注「判据本体仍住 `./anchors.mjs`」 vs `anchors.mjs` 头注「实现族（基底根 ∥ 拼路径 ∥ 谓词）**定义面 = `./doc-batch-face.mjs`**」∥ 同档 `isBatchFaceRef` 文档块「（**唯一一处** · 判据单源 = `docs/core/design/DOC-DISCIPLINE.md` §3.29 条目 AC）」 |
| 2 | 🟡 | 未处置 | `anchors.mjs` 头注「（`节缺` ∥ `引缺` 对它不判）而**报面零输出**」 vs 同档 `recordSuffix(suffixHits, r, { file: f, line: i + 1, token })` 在多解分支之前调用；集成用例 29-6 在多解夹具的 `report` 面断「后缀兜底读数：how="suffix" 1 处」 |
| 3 | 🟡 | 未处置 | `docs/core/design/DOC-CHECK.md` §2.9.7「仍越 500 设计器硬线（504）」∥「余下的分拆未落」 vs `anchors.mjs` 本批落地后实读 473 行，余下两族已搬进 `doc-suffix.mjs` ∥ `doc-batch-face.mjs` |
| 4 | 🟡 | 未处置 | 批档 §2 机读清单只写「把「多解归并装配」一族搬去 thincoder-core/doc-check/doc-suffix.mjs」；`doc-batch-face.mjs` 在 `docs/**` 零命中 vs `docs/core/design/PATH-RESOLUTION.md` §3「新档名与族清单住批档 §2 的机读清单」 |
| 5 | 🔵 | 未处置 | `report-blocks.mjs` 的 `SUFFIX_HEAD`「唯一后缀命中的指针——能定位，不等于你想指的那一处」——多解指针同进本块，判据已无「唯一」 |
| 6 | 🔵 | 未处置 | `tool-docs/doc_check.md`「A bare name resolves through that same suffix leg」 vs 同档「A bare name whose suffix is only a code extension is prose mention - not resolved, not judged」；「either way the pointer resolves and passes, and neither prints anything」 vs `report` 面后缀读数块 |
| 7 | 🔵 | 未处置 | `anchors.mjs` 的 `引缺` 分支「if (quoteJudged(r) && !citedTextOf(r.abs).includes(quote))」——读不到的目标档（`readText` 返回空串）照样出 `引缺`，与同档 `sectionUnjudged` 的处置不对称（存量，非本批引入） |

计数：🔴 0 · 🟡 4 · 🔵 3（合计 7）。
VERDICT: pass

## §4 用户批准（主 agent）

### 用户批准（2026-11-12 01:43）

用户原话：「继续收口。」

**批准对象**：本批实施结果（判据从「全仓唯一才通」换成「解得到一个文件就通，一个都解不到才判档案缺」；多解 `resolved{multi:true}`、回执零输出；`suffixCandidates` ∥ `SUFFIX_CANDIDATE_MAX` ∥ 「后缀命中 N 处」三件退役；`anchors.mjs` 越线两笔只搬不改的分拆）。

**批准前的读数**（父侧复跑，非转述）：
- 批内单测 4/4 · 集成 `path-resolution` 9/9 · 邻近面 53/53
- `doc_check` gate（本批四档设计面）首行 `DOC-CHECK GATE: PASS`，0 段问题
- 新源档已入库 `a3daddd8`（991 行，9 档），自此有基线可 diff

**随批准的披露**：`report-blocks.mjs` 在本批期间被一次外部写入弄坏（`Set-Content` 编码崩坏），由实施席按上下文重建恢复；行数 ∥ 语法 ∥ 测试 ∥ 语料对账四项已核，「未改行逐字节相同」无原件可比 ⇒ **不可证**。事故与根因记 §5 修轮 4，不当正常交付计。

## §5 实施记录（eng-coder）
**状态行**：实施完成（判据落地 + 两笔只搬不改的分拆 + 红侧两条变异实跑；代码评审 pass，自修 3 条已改完复跑）



### 交付摘要（实施轮 · eng-coder）

判据落地：后缀兜底从「全仓恰一处才通」改成「**有命中即 `resolved{how:"suffix"}`**」（多处再带 `multi:true`，`abs` 取路径序第一处；一处与多处同判、零输出），**零命中才 `档缺`**。多解对 `节缺` ∥ `引缺` 不判。三件退役：`dangling.suffixCandidates` 载荷 ∥ `SUFFIX_CANDIDATE_MAX` 常量 ∥ `档缺` 行上「后缀命中 N 处」半句。

### 需求点对账（§2 四条 + §4 五条 AC + §9 三行）

| 需求点 | 状态 | 落点 / 读数 |
|---|---|---|
| ① 多解不判红（主条）：解得到但不止一处并入「解得到」，回执零输出 | ✅ | `thincoder-core/path-resolve.mjs` 的 `suffixLeg`：`if (hits.length === 0) return null` 后 `return { state: "resolved", abs: ordered[0], how: "suffix", ...(hits.length > 1 ? { multi: true } : {}) }`；`thincoder-core/doc-check/anchors.mjs` 的 `danglingHit` 不再带该字段 |
| ② 提示词同轮删两族 | ✅（核过，未重做） | `thincoder-core/prompts/` 两族字面各 0 命中（任务书说明设计席已删）；同一句在 `docs/core/design/DOC-DISCIPLINE.md` 仍在 ⇒ 不在本席笔域，见上抛项 3 |
| AC-1 多解通且零输出（无候选清单、无计数行） | ✅ | 集成 29-6 ②；批内单测 R1 ∥ R2 |
| AC-2 零命中仍拦 | ✅ | 集成 29-6 ③；批内单测 R2 那一格（夹具内的临时档名，仓内不存在） |
| AC-3 多解上的 `节缺` ∥ `引缺` 不判、单解照判 | ✅ | 新增 `thincoder-core/doc-check/doc-suffix.mjs` 的 `quoteJudged` ∥ `sectionJudged`；批内单测 R5（单解两条照出，`REFUSED（锚 2 条）`） |
| AC-4 提示词零残留 | ✅（机检半）· 通读半见上抛项 3 | 七档两族 0 命中；规范档层的残句非本席笔域 |
| AC-5 交付面零回归 | ✅ | 两跑等式两则（见「读数」第 5 项） |
| §9 行 29-3（改） | ✅ | `test/rtm/paths.md` 与 `test/integration/path-resolution.test.mjs`（夹具 = 同名档只在跳过面目录 `dist` 下 ⇒ 零后缀命中 + 同名提示照出） |
| §9 行 29-6（改） | ✅ | 三册夹具：恰一处 ⇒ 读数 1 处 · 同名两份 ⇒ `PASS` 且回执零输出 · 零命中 ⇒ `REFUSED（锚 1 条）` |
| §9 行 29-9（增） | ✅ | 批档写门两跑并置：多解代码路径写入落盘、回执零附加行；同形零命中 ⇒ `锚·档缺` + 拒写、档字节不变 |

### 读数（命令 + 结果）

1. `node --test docs/batches/2026-11-12-evidence-not-pointer.test.mjs` ⇒ tests 4 · pass 4 · fail 0（R1 层直调 ∥ R2 文档门 ∥ R3 批档写门 ∥ R5 两条内容判据）。
2. `node --test test/integration/path-resolution.test.mjs` ⇒ tests 9 · pass 9 · fail 0（29-1 … 29-9）。
3. 邻近面：`test/integration/doc-check-per-file-root.test.mjs` ⇒ 3/3；`test/integration/cross-repo-refs.test.mjs` ⇒ 4/4。
4. **红侧实跑（两条变异，各打各的行，跑后复原、源档 sha 逐字相同）**：
   - M1「`>= 1` 退回 `=== 1`」（旧「唯一」判据）⇒ 批内单测 R1 ∥ R2 ∥ R3 ∥ R5 全红；集成 29-6 ∥ 29-9 红；
   - M2「零命中 ⇒ `resolved`」（什么都放行）⇒ 批内单测 R1 ∥ R2 ∥ R3 红（R5 绿）；集成 29-3 ∥ 29-6 ∥ 29-8 ∥ 29-9 红。
   两条互不替代：M1 打不到零命中侧，M2 打不到多解侧。
5. **AC-5 两跑等式**：
   - 判据面：同一份干净清单 4 档（`docs/core/design/BATCH-RECORD.md` ∥ `test/rtm/paths.md` ∥ `docs/core/design/DOC-DISCIPLINE.md` ∥ `docs/core/requirements/DOC-CHECK.md`，报面出 5 处后缀读数）在旧判据（M1）与新判据下各跑一次 ⇒ `report` ∥ `gate` 逐字相等（sha256 前 12 位 `3e65726a0929` ∥ `fe154f5892d6`）。
   - 分拆面：354 档清单（`docs/` 全树 + `test/RTM.md` + `test/rtm/` 分册）在同一份文档内容上分拆前后各跑一次 ⇒ `report` ∥ `gate` 逐字相等（`12e0899b1b52` ∥ `7d1cc1569d7e`）。**复跑此刻差 5 行**（`后缀兜底读数 1458 → 1460 处` · `批档面互引 2351 → 2355 处` · 清单末位一行换手）：来源 = `docs/core/standards/METHODOLOGY.md` 于 01:15:10 被另一席改写 ⇒ 判集内容变了，不是判据变了。
6. 尺寸（`doc_check` 的 `lines` 面）：`thincoder-core/doc-check/anchors.mjs` **509 → 473**（线下）；新增 `doc-suffix.mjs` 27 ∥ `doc-batch-face.mjs` 58（均线下）；本批其余改动档未越线。
7. `doc_check` gate（本席写的两档 `.md`：`test/rtm/paths.md` ∥ `thincoder-core/tool-docs/doc_check.md`）首行 `DOC-CHECK GATE: PASS`（2 档全清）。

### 决策披露

| 事项 | 选择 | 理由 / 代价 |
|---|---|---|
| 越线分拆的族与档名 | `doc-suffix.mjs` 落「后缀接线族」（记账 ∥ 两条内容判据的多解处置）；第二笔按 §2「搬完仍越线 ⇒ 同批再拆一次」把批档面判族整族搬去 `doc-batch-face.mjs` | §2 点名的「多解归并装配」族在本批判据落地后已不存在（正是被退役的那一段）；单搬它掉不到线下，故同批再拆一次。代价 = §2 机读清单只登记了第一笔 ⇒ 上抛项 1 |
| 报面读数行头仍写「唯一后缀命中的指针」 | 不改 | §4 AC-5 要求 `report` 面与改前逐字相等，改这一句即破 AC-5；代价 = 多解指针同进该读数块时那半句照旧说「唯一」⇒ 上抛项 4 |
| `test/rtm/paths.md` 29-4 行 | 一字未动 | 设计 §9 明文「`29-4` … 本批一字不动」；该行的机制名残留 ⇒ 上抛项 5 |
| 29-3 的「零后缀命中」怎么造 | 同名档只放跳过面目录 `dist` 下（后缀索引跳它、同名提示不跳） | 设计 §9 只要求「零后缀命中 + 同名提示」并列；`dist` 正是两张表跳过面不同的那一点，一格里同时守住「提示照出」与「兜底不救」 |
| 多解载荷 `multi` 对档图的影响 | 边照落代表处（`abs` = 路径序第一处），多解 + 节指示时边态记「判不了存在性」 | 设计 §2.8「档图面取代表处」；节没判过就不能记 `ok`，也不能冒充「目标不在盘」 |

### 笔域外改动（以清单外身份披露，均随附理由）

| 档 | 为什么 | 背书 |
|---|---|---|
| `thincoder-core/doc-check/doc-suffix.mjs`（新增） | 第一笔分拆落点 | §2 机读清单点名 |
| `thincoder-core/doc-check/doc-batch-face.mjs`（新增） | 第二笔分拆（同批再拆一次） | §2 同一条的「搬完仍越线 ⇒ 同批再拆一次」 |
| `test/rtm/paths.md` | 29-3 ∥ 29-6 改、29-9 增，另收正故事目的行与节注行 | 设计 §9 点名的行落点（§2 清单写的是 `test/RTM.md`，该档只是故事索引，本批改的是分册行） |
| `docs/batches/2026-11-12-evidence-not-pointer.test.mjs`（新增） | 批内单测档，收口删除 | 收口纪律（测试纪律「名随批档」） |

§2 清单内**未动**的档与理由：`doc-check/index.mjs` ∥ `doc-check/doc-tokens.mjs` 不消费退役字段（`grep` 0 命中），判据改动不触其面；七个 `prompts` 档两族已 0 命中；`test/RTM.md` 只有故事索引行（`| CLI 29 | 路径解析统一层 | paths |`），无个案行可改。

### 审计与评审轮次 · 终态

- **内部发散审计**（explore，1 轮）：需求点全部覆盖；提出偏差点 7 条（与评审同源）。
- **代码评审**（advisor `type:"code"`，1 轮，记 §3 轮次 3）：VERDICT `pass`；🔴 0 · 🟡 4 · 🔵 3。
- **自修轮 1**（3 条，均在本席笔域，已改完并复跑）：① `doc-batch-face.mjs` 头注「判据本体仍住 `./anchors.mjs`」→ 改成「实现族整族住本档，应用点 = `anchors.mjs` 三条抽取分支」；② `anchors.mjs` 头注「而**报面零输出**」→ 限定成「`gate` 面零输出，`report` 面只入后缀读数块」；③ `tool-docs/doc_check.md` 两句收窄（裸名限定为文档名族；「neither prints anything」限定为 `gate` 面）。修后：批内单测 4/4 ∥ 集成 9/9 ∥ gate PASS。
- **未处置（转父侧 / 存量）**：§3 轮次 3 第 3 条（`DOC-CHECK.md` §2.9.7 时态）∥ 第 4 条（§2 清单缺 `doc-batch-face.mjs`）∥ 第 5 条（读数行「唯一」）∥ 第 7 条（`引缺` 对读不到的目标档照出，存量、非本批引入）。
- **终态：clean**——无未决 🔴；4 条 🟡 中 2 条已在本席笔域修完，余 2 条落在状态档 / 记录面，已上抛。

### 上抛项

1. **[上抛·待裁]** §2 机读清单缺 `thincoder-core/doc-check/doc-batch-face.mjs` 一行；且首笔分拆的族名（「多解归并装配」）在本批判据下已不存在，实落为「后缀接线族」。§2 是设计席笔域。
2. **[上抛·待裁]** `docs/core/design/DOC-CHECK.md` §2.9.7 仍写「仍越 500 设计器硬线（504）」∥「余下的分拆未落」——本批落地后 `anchors.mjs` = 473。
3. **[上抛·知会]** `docs/core/design/DOC-DISCIPLINE.md` 仍逐字带本轮退役的两族句（唯一性条款 ∥ 「围栏能免检」），两份提示词面已清。
4. **[上抛·知会]** `report-blocks.mjs` 的 `SUFFIX_HEAD` 仍写「唯一后缀命中的指针」——改它破 AC-5，故未改。
5. **[上抛·知会]** `test/rtm/paths.md` 29-4 行仍写「域外连唯一后缀兜底都不进」——机制名未跟本批改；设计 §9 明说该行不动。
6. **[上抛·知会]** 存量：`引缺` 对「在盘但读不到」的目标档仍出行（同行的 `节缺` 已按「未判」处置），非本批引入。

### 修轮 4 · AC-5 ④ 的代码面一半：读数行块头 = 判据名

**判据现文核对（动手前先核 §2 ∥ §4 的 AC-5）**：依据 `docs/batches/2026-11-12-evidence-not-pointer.md`「**AC-5 交付面零回归（分拆不变式）**：同一判据下、同一份干净清单，分拆前后各跑一次 `report` ∥ `gate` ⇒ 读数行 ∥ 命中行 ∥ 结论句 ∥ 清单位置逐字相等（不带 `texts` ∥ `zones`）。**读数行的块头措辞 = 判据名，不在回归面内**：判据已从「唯一后缀」换成「有命中即解得到」，块头随之改、不再写「唯一」」——父侧转述与现文一致，故本轮改它不破 AC-5。

**改了什么**（一个字符串 + 同族两处注释里的同一句）

- `thincoder-core/doc-check/report-blocks.mjs` 的 `SUFFIX_HEAD`：`唯一后缀命中的指针` → `后缀兜底命中的指针`。行为、判据、块内其余字面（`how="suffix" N 处` ∥ `能定位，不等于你想指的那一处` ∥ `后缀索引建 N 次`）一字未动。
- 同档 155 行注释的「唯一后缀证明「能定位」」→「后缀兜底证明「能定位」」：同一句判据陈述，与设计 §2.8 护栏一的原句、与 `doc-suffix.mjs` ∥ `anchors.mjs` 同族已收正的写法对齐。
- `thincoder-core/doc-check/index.mjs` 头注同一句（同改法）——清单外改动，见下表。

**验收读数**

1. `node --test docs/batches/2026-11-12-evidence-not-pointer.test.mjs` ⇒ tests 4 · pass 4 · fail 0。
2. `node --test test/integration/path-resolution.test.mjs` ⇒ tests 9 · pass 9 · fail 0。
3. 邻近面 17 档（`doc-check-*` 十档 ∥ `doc-write-gate` ∥ `batch-close-gate` ∥ `batch-touched-region-gate` ∥ `cross-repo-refs` ∥ `tester-role`）⇒ tests 53 · pass 53 · fail 0。
4. **红侧（实跑，改回旧串后复原）**：把 `SUFFIX_HEAD` 退回「唯一后缀命中的指针」⇒ 批内单测 R2 转红。拒文 = `AssertionError: 块头不得再写「唯一」——多解与单解同判，说「唯一」就是把旧判据名摆在新行为上`，`operator: 'doesNotMatch'`。复原后 4/4 绿。
5. **全仓 354 档语料读数**（`docs/` 全树 + `test/RTM.md` + `test/rtm/`）：`report` 面后缀读数行 =
   `后缀兜底读数：how="suffix" 1463 处（后缀兜底命中的指针——能定位，不等于你想指的那一处；后缀索引建 1 次）`，末行 `共 436 条 token · 1463 处`；`批档面互引未判 2358 处`；`gate` 首行 `DOC-CHECK GATE: REFUSED（锚 134 条 · 行号坐标 98 处）`，命中行与引擎计数对齐（锚 134 ∥ 行号坐标 98 逐条出行）。读数 1460 → 1463 与 2355 → 2358 的漂移来自另一席继续写 `docs/**`，不是判据变。
6. `doc_check` gate（本席笔域）：本轮零 `.md` 写入 ⇒ 首行 `DOC-CHECK GATE: ERROR（0 档受检——空范围不判 PASS）`——空范围不判 PASS 是既有机径，不是被拒。补跑本批两档 `.md`（`test/rtm/paths.md` ∥ `thincoder-core/tool-docs/doc_check.md`，只读、非本轮笔域）⇒ 首行 `DOC-CHECK GATE: PASS`，另带存量行 `登记未命中 1 条`。
7. `grep` 复核旧串：`唯一后缀命中的指针` 在产品面与规范面 0 命中；余下 4 处 = 批档 §3 轮次 3 第 5 条 ∥ §5 两行旧记述 ∥ 批内单测注释里描述红侧那一句。

**事故与恢复（如实记）**

- **发生了什么**：第 4 项红侧第一次是用 PowerShell 改写 `report-blocks.mjs` 做的。`Set-Content -Encoding utf8` 把整档的 UTF-8 与换行一起弄坏——305 行塌成 250 行、中文段成乱码。
- **为什么没有机械恢复**：该档是本批新增档、未入 git；`checkpoint` 也无快照（`No snapshot copies … found`）。
- **怎么恢复的**：按本轮开头那次完整 `read`（305 行，逐字在本轮上下文内）整档重写，只带本轮那两处改动。
- **恢复后能证明的**：`node --check` 通过；行数 305 = 原档；五个地标行号与原读逐一对上（`CYCLE_READ_LINE` 17 · `PARA_DISPOSE` 36 · `SUFFIX_LIST_MAX` 152 · `SUFFIX_HEAD` 157 · `gateReport` 223）；17 档集成 53/53 绿；354 档语料的块形与计数与引擎自算的 `hits` / `lineRefHits` 逐项对账（锚 134 · 行号坐标 98）。
- **不能证明的**：未改各行与改前逐字节相同——原件已无副本可对。上面用的是结构与行为两面对账，不是字节对账。
- **根因**：把写盘交给了 `bash`（`Set-Content`）。红侧改跑 `edit` 工具后两次往返均正常。

**笔域外改动（清单外身份，随附理由）**

| 档 | 为什么 | 背书 |
|---|---|---|
| `thincoder-core/doc-check/index.mjs` | 头注里同一句判据陈述（「唯一后缀证明「能定位」」）在判据换掉后是错的；改注释、零行为 | D11「一条规则改，它所在的每一层同一批改」；同族 `anchors.mjs` ∥ `doc-suffix.mjs` 已收正，仅此一处落后 |
| `docs/batches/2026-11-12-evidence-not-pointer.test.mjs` | 加一条反向断言（`report` 面不得再出现「唯一」）+ 红侧注释 | 本批批内单测档，收口删除；原有用例只断读数行前缀、不断块头措辞，加这一条才让本次改动有可失败面 |

**上抛项（父侧处置）**

1. **[上抛·知会] 上一轮 §5 上抛项 4 关闭**：`SUFFIX_HEAD` 的「唯一」已在本轮改掉；AC-5 的分拆不变式不受影响（块头措辞不在回归面内）。
2. **[上抛·知会] 同族还剩两处「唯一」未动，均非本席笔域**：① `docs/core/design/PATH-RESOLUTION.md` §2.2 第 6′ 步的腿名仍写「**唯一后缀兜底**」，而同档 §2.8 标题已写「后缀兜底：解得到就通」——腿名与判据名两个说法并存；② `test/rtm/paths.md` 29-4 行仍写「域外连唯一后缀兜底都不进」（设计 §9 明说该行本批不动）。
3. **[上抛·知会] 事故披露**：见上「事故与恢复」。本席判无需另开台账（修复已核）；若要留痕，`evidence` 可引本段。

## §6 验证与收口（父代理）

### 验证与收口（父侧）

**① 收口前机检**：`doc_check(mode:"gate", docs:[DOC-CHECK.md ∥ PATH-RESOLUTION.md ∥ DOC-DISCIPLINE.md ∥ requirements/DOC-CHECK.md])` ⇒ 首行 `DOC-CHECK GATE: PASS`，0 段问题（围栏内行号坐标 1 处为快照位置、不入判）。

**② 父侧复跑读数**（不复述实施席的数）：

```
node --test docs/batches/2026-11-12-evidence-not-pointer.test.mjs   pass 4  fail 0
node --test test/integration/path-resolution.test.mjs               pass 9  fail 0
anchors.mjs 474 行（拆前 509）· doc-suffix.mjs 27 · doc-batch-face.mjs 59
```

**③ 设计档回写核对（D17 的首次实跑）**：实施席交的四条清单已由设计席回写轮落完 —— §2 机读清单补两行、`DOC-CHECK.md` §2.9.7 时态收正（504 ⇒ 474）、`DOC-DISCIPLINE.md` §3.27 ∥ §3.28 两族退役句换掉、`SUFFIX_HEAD` 旧名改掉并连带收正 `A-DD42` ③ 这条与新判据相反的 AC。**三面对读通过**。

**④ 台账**：`#2343` 由 `batch close` 同笔结算（在途 → 待核销 → 已核销），不单独 `ledger close`。

**⑤ 本批新债**：零。四条上抛全部当场处置，无一条转入台账。

**⑥ 遗留披露**：`report-blocks.mjs` 的重建不可逐字节自证（事故记 §5）；`登记未命中 1 条` 属存量、非本批引入。

**⑦ 收口判据**：判据已落代码、集成行 `29-3` ∥ `29-6` ∥ `29-9` 立、设计面四档机检全清、新源档已入基线 —— 四条齐。
