# 2026-11-08 · pointer-residue-a
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 12:31「2174梳理掉吧，别挂着了，文档多分分批，并发处理」——把 1270 条指针余量按档分簇、多批并发清账。
> 台账 = #2174（core · 归批）。前情 = docs/batches/2026-11-08-pointer-debt.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（残余轮 4 条裁定已落形；15 档锚面复跑读 = 2 条，均为不改档的登记项（③ 判不了 ∥ ④ 抽取器假阳））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| 条目 | 射程 | 判据源 |
|---|---|---|
| 台账 `#2174` 的 A 簇 | `docs/desktop/design/` 下 15 档的锚命中 | `docs/core/design/PATH-RESOLUTION.md` §2.2 ∥ §2.8 |

- 射程 = **锚**这一面。同一清单本轮实测：段落 0 处、行号坐标 0 处 —— 那两类在本批**无对象**，不是不做。
- 交付形态 = 每处命中取一条处置（下「五类判法」）；残余 = 已逐条点名的判不了清单。

**验收口径按「清到判不了为止」**：能清的必须清到 0，清不动的逐条列出（档 + 名字 + 为什么判不了），不许换成名字像的糊过去。前者与后者都是交付。

### 设计档落点

**本批不新建、不改任何设计档。** 判定规则的单源已在盘，本批不复制它：

依据 `docs/core/design/PATH-RESOLUTION.md`「6′. **唯一后缀兜底**（仅 `opts.suffixFallback` 为真，且第 4–6 步全零命中）」

依据 `docs/core/design/PATH-RESOLUTION.md`「**跳过面 = 本步自持的一处常量 `SUFFIX_SKIP_DIR_NAMES`**（`thincoder-core/path-resolve.mjs`）：dot 名 ∥ `_archive` ∥ `node_modules` ∥ `dist` ∥ `build` ∥ `coverage` ∥ `obj`」

所以本批只补一张「命中怎么处置」的执行表，**它住 §2**：处置清单是一次性的，不是长期规则；写进机制档会把那份单源变成账本。

### 命中分类（本轮读数 · 判域 = 上面 15 档）

引擎实跑（`runDocCheck`，`mode:"gate"`）：首行 `DOC-CHECK GATE: REFUSED（锚 286 条）`，`hits = {"total":286,"anchors":286,"paragraph":0,"lineRefs":0}`，逐条 `锚·档缺`。

| 档 | 命中 | 档 | 命中 |
|---|---|---|---|
| `docs/desktop/design/PACKAGING.md` | 116 | `docs/desktop/design/SESSIONS.md` | 10 |
| `docs/desktop/design/SETTINGS.md` | 37 | `docs/desktop/design/CHAT.md` | 8 |
| `docs/desktop/design/UI.md` | 26 | `docs/desktop/design/COMPOSER.md` | 8 |
| `docs/desktop/design/PROJECT.md` | 14 | `docs/desktop/design/MENU.md` | 8 |
| `docs/desktop/design/WEB-QUICKCHECK.md` | 13 | `docs/desktop/design/ACTIVITY.md` | 7 |
| `docs/desktop/design/E2E-TESTING.md` | 12 | `docs/desktop/design/PANEL-READBACK.md` | 4 |
| `docs/desktop/design/SHELL.md` | 11 | `docs/desktop/design/IPC.md` | 2 |
| `docs/desktop/design/RENDERER.md` | 10 | **合计** | **286** |

上述逐档数按 token 归并成 97 组；按引擎给的三形分类（同名候选数）：

| 形 | 处数 | 含义 |
|---|---|---|
| 多候选 | 123 | 仓内有两份以上同名档 |
| 单候选 | 22 | 全仓恰一处同名，但**写法不成立**（带相对段 ∥ 首段缺目录） |
| 零同名 | 141 | 仓内根本没有这个名字 |
| 合计 | 286 | — |

形是**读数**，不是处置：引擎按「同名候选数」分形，处置由 R 号按「这个名字是什么」定（见「裁定已落」）。

### 五类判法（D1–D5）

**D1 多候选（124 处）**：按上下文选定一处，写成**仓根全路径**。候选由引擎报面给，但「哪个对」只有句子知道；判不出来 ⇒ 进判不了清单，不许取首个。

**D2 单候选（21 处）**：写法不成立而全仓恰一处同名 ⇒ 写成那一处的仓根全路径。
**但须过上下文**：句子主语与那份档的职责对不上 ⇒ 判不了。理由：同名不同物是本仓踩过的坑（`config.mjs` ∥ `store.mjs` ∥ `i18n.mjs` 各有数份），「只有一份」不构成「就是它」。

**D3 零同名 · 仓内有继任者**（改名 ∥ 拆档 ∥ 合并）：改指继任者。两道前置 —— ① 继任者**在盘**（改前先确认，不靠记忆）；② 能说出「哪一句证明它接了这一支」。缺任一道 ⇒ 判不了。

**D4 零同名 · 已退役**：删掉这次提及，或改写成不含路径的叙述。
**禁止**留「原先那支已退役」一类历史句 —— 失效表述要删不要标（D8：残留会被下一轮当活指令读）。

**D5 零同名 · 本来就不是仓内档（本轮不动，逐条列出，等上抛 1）**
这一类不是「路径写错了」，补前缀永远补不成绿：依赖包内部件与构建生成物落在跳过面里，站点件落在未声明的同级仓里。代表形（本节只给「形」；每一条具体归哪类由实施侧按后文判定序逐条核实）：

```text
依赖包内部件：FpmTarget.js ∥ PublishManager.js ∥ platformPackager.js ∥ errorMessages.js
构建生成物：latest.yml ∥ latest-linux.yml ∥ app-update.yml ∥ scheme.json
收口已删的单元测试 ∥ 探针件：first-run-smoke.test.mjs ∥ -probe2.mjs ∥ -e4js-live-readings.json
站点仓件：desktop.html ∥ deploy-oss.mjs ∥ gen-changelog.mjs ∥ favicon.svg
```

**D6 声明形（3 处，全部在 PACKAGING）**：首段 `thincoder.com` 是未声明的同级目录 ⇒ 与上抛 2 一并裁，本批不动。

### 零同名三类的判定序（D3 ∥ D4 ∥ D5）

同一处零同名命中，按序问三句，**先命中先定**：

1. **这东西现在还在仓里吗？** 在（改名 ∥ 拆档 ∥ 合并后的继任者）⇒ D3。判据 = 能在盘上指出那份档，并说出句子与它的关系。
2. **它曾经在、现在退了吗？**（功能撤场 ∥ 档已删 ∥ 批内一次性件删档）⇒ D4。
3. **它从来就不是本仓的档吗？**（依赖包内部件 ∥ 构建生成物 ∥ 站点仓件 ∥ 收口即删的单元测试与探针件）⇒ D5，只列不改。

三问都答「不确定」⇒ 进判不了清单，写**档 + 名字 + 卡在哪一问**。

**排期提醒**：`docs/desktop/design/PACKAGING.md` 单档 119 处，大头是 D5 ∥ D6 —— 那两类等上抛裁定。先做其余 14 档的 D1 ∥ D2，别把一轮耗在等裁定的档上。

### 受影响文件与测试覆盖

- 改面 = 上表 15 档，全部在 `docRoot.design` 的 desktop 面；**零新增档、零删除档**。
- 分层结论：**无跨界**（全 doc 面；不碰产品码、测试档、需求档、manifest、台账）。
- 本批无运行面改动 ⇒ 无单元测试档；验收 = 引擎跑法（下节命令），读数留 §5。

### 验收对照（每条带命令）

判据统一用**本仓引擎**跑。写门与引擎是同一套判据（写门调的就是 `runDocCheck`，`suffixFallback` 恒开）⇒ **写门拒的都是真红**（多候选 ∥ 零命中），不存在「判绿了又被拒」；它另一句成立：推进单位 = **段**（R6）。会话内 `doc_check` 是旧构建，其读数不作判据。

三类连坐，处置时必须一起看：

1. **验收判「锚 0」，不判 `hits.total` 0**：段落属另一面，`total` 仍非 0、首行仍 `REFUSED` 是正常收口形。
2. **改路径须同核节号**：原 token 带 `§N` 的，换了路径不换节号 ⇒ `档缺` 变 `节缺`，读数不动、类别换了。
3. **同句的现状断言一起处置**：路径不在盘时，旁边那句断言可能已假——留着一句假断言比留一条红锚更坏。

| # | 判据 | 命令 | 改前读数（红侧） | 目标 |
|---|---|---|---|---|
| AC-1 | 15 档锚面归零或等于判不了清单条数 | 引擎 `mode:"gate"`，清单 = 15 档 | `REFUSED（锚 286 条）` | `hits.anchors` = 判不了条数 |
| AC-2 | 逐档单调下降，无新增命中（含 `节缺` 类） | 同上；两侧按「档 + 名字 + 类」集合比对 | 286 | 改后集合 ⊆ 改前集合 |
| AC-3 | **只改坐标不改语义**（限 R1 类） | `git diff` 15 档；每条改动行两侧按引擎抽取正则剥掉文件 token 后**逐字相等** | 未改 → 无 diff（平凡成立） | 全部相等；一条不等即不通过 |
| AC-3′ | R2 ∥ R3 ∥ R4 ∥ R5 的改动**逐对在册**（这几类改的是句子，不是坐标） | §5 记「原句 ⇒ 改后句」+ 依据 ∥ 删除理由 | 清单空 | 逐条在册；缺一条即不通过 |
| AC-4 | 判不了清单与残余逐条对齐 | 上表 + 残余锚清单，按「档 + 名字」配对 | 清单空、残余 286 | 两集合相等 |
| AC-5 | 判据可失败（自检） | 同一条命令在改前树跑 | 已实测：286 ∥ `REFUSED` | 改后必须与之不同 |

AC-5 为什么单列：一条在改前改后同读数的命令，量的是它自己的写法，不量这批债 —— 改前那读数已经跑出来了，改后相同即命令判域错。

### 关键决策

**KD-1 处置按「这条命中在说什么」分流，不按「怎么让它变绿」分流。**
被否：一律补仓根全路径。理由 = 对 D5 类**不可达**（跳过面把依赖树与构建产物排除在兜底索引之外，补了也只在本机碰巧绿）。

**KD-2 单候选不自动认。**
被否：「只有一份，就是它」。本仓同名不同物已成片，认错即把文档指到别的模块上，比留着红更坏。

**KD-3 退役件删除，不标注。**
被否：改写为「已退役」。失效表述留在规范面会被当活指令读；历史属 git。

**KD-4 执行表住 §2，不进机制档。**
被否：并入 `docs/core/design/PATH-RESOLUTION.md`。那是机制单源，装一次性清单会把它降级成账本。

**KD-5 不新开设计档。**
被否：为清账单开一份。它没有机制可写，开出第二处「指针怎么写」的说明就与 §2.8 争单源。

### 边界

- 可以改：上表 15 档。
- 不动：别的档 ∥ 产品码 ∥ 需求档 ∥ 台账 ∥ `PROJECT-MANIFEST.json` ∥ 本档 §1 §3 §4 §6。
- 不做：段落 ∥ 行号坐标两面（本批零对象）。
- 不做：任何一句的含义改动（AC-3 机检兜着）。

### 裁定已落（R1–R6 · 用户 2026-11-08 12:4x · 九批共用）

上抛两件均已裁：① 非仓内名的写法 ⇒ R2 ∥ R3 ∥ R4；② 站点仓件 ⇒ `PROJECT-MANIFEST.json` 的 `index.publicRepos` 已显式声明（现值含 `../thincoder.com`）⇒ 走 R5。

| 号 | 类 | 落形 |
|---|---|---|
| R1 | 现态指针（仓内确有该档） | **仓根全路径**；多候选按上下文选一处 |
| R2 | 非仓内名：依赖包内部件 ∥ 构建生成物 ∥ 用户数据目录档 ∥ 运行期配置名 | 不带路径形态的叙述 |
| R3 | 已删的单元测试 ∥ 探针件（收口即删） | 角色叙述，不写档名 |
| R4 | 沿革 ∥ 历史段里的旧路径 | 叙述形（状态档不留历史） |
| R5 | 站点仓件 | 带前缀全形（声明后即可解析）；不带前缀的页名必须补前缀 |
| R6 | 推进单位 = **段** | 段里一条红 ⇒ 该段任何修改都落不了盘 ⇒ 整段一起清 |

R2 ∥ R3 ∥ R4 ∥ R5 的落形示例（形，不是判据）：

```text
R2 依赖包内部件  ⇒ 「electron-builder 的 FpmTarget」                 （件名去扩展名，前置包名）
R2 构建生成物    ⇒ 「构建生成的 latest 索引」                        （说它是什么）
R2 用户数据目录档 ⇒ 「用户配置档」                                    （说它在哪一类）
R2 运行期配置名  ⇒ 「项目根的 MCP 配置文件」                          （不写档名）
R3 已删测试 ∥ 探针 ⇒ 「该批的单元测试档」∥「该批的真机探针」          （角色，不写档名）
R5 站点仓件      ⇒ thincoder.com/www/desktop.html                     （带前缀全形）
```

**两条禁止**（用户逐字）：不许换成「一个名字像的」；不许写「已废弃 ∥ 已退役」历史句——失效表述直接删，不标注。

**执行面分派**：`docs/desktop/design/PACKAGING.md` 的 116 处按 R2 ∥ R5 做（大头是构建生成物、依赖包内部件、站点页集）；其余 14 档 145 处按 R1 做。

**判不了清单**：本刻空——逐条处置尚未开始。判不了的一律按「档 + 名字 + 卡在哪一问」逐条补记，不许留空项冒充清完。

### 写门判面实测（本刻 · 与上文口径不一致 · 待裁）

同一档两跑，读数不同：

```text
引擎跑 15 档（suffixFallback 开）  ⇒ docs/desktop/design/MENU.md = 8 条锚
对该档发起一笔整段写入（未落盘）   ⇒ 写门判改动区 = REFUSED（锚 39 条）
```

写门那 39 条里含**恰一处在盘**的名字，拒文自承「盘上同名：…」：

```text
menu-actions.mjs ×8 ∥ renderer/theme.mjs ×18 ∥ ipc-registry.mjs ×4 ∥ theme.mjs ∥ context-menu.mjs
src/main/context-menu.mjs ×2 ∥ settings-modal.mjs ×2 ∥ preload.cjs ×2 ∥ window.mjs
```

⇒ **写门判面 = 不带后缀兜底的裸名面**；上文 286 是引擎**带兜底**的读数。两者不是同一把尺，故：

1. 本批真实目标 = **写门判面的裸名全部写成仓根全路径**（含引擎判绿、写门判红的那些），不是「把 286 处变绿」。
2. 逐档真量须按写门口径复量后再排期——`MENU.md` 实测 8 ⇒ 39（5 倍量），全批规模远大于本表。
3. 在裁定前，逐档写入按 R6「整段一起清」推进：该段在写门口径下的裸名一并不留。

依据：本刻对 `docs/desktop/design/MENU.md` 的整段写入被写门拒（零字节落盘），拒文逐条如上；同刻引擎跑同档 8 条。

### 第 2 轮 · 尺子归一 + 已落与余量（本刻）

**尺子（唯一判据，取代上文所有读数口径）**

依据 `docs/core/design/DOC-DISCIPLINE.md`「验收取内置工具 `doc_check`（同一引擎 `runDocCheck`），或**静态面**（源面 `grep` ∥ 直读文件 ∥ `git diff` 改动面）。直接 `import` 引擎函数只作临时诊断，**其读数不得作为判据**。」

⇒ 本批验收读数一律取内置 `doc_check`（`mode:"gate"`），docs = 下列 15 档，逐档路径写全以便照抄复跑：

```text
docs/desktop/design/ACTIVITY.md      docs/desktop/design/SESSIONS.md
docs/desktop/design/CHAT.md          docs/desktop/design/SETTINGS.md
docs/desktop/design/COMPOSER.md      docs/desktop/design/SHELL.md
docs/desktop/design/E2E-TESTING.md   docs/desktop/design/UI.md
docs/desktop/design/IPC.md           docs/desktop/design/WEB-QUICKCHECK.md
docs/desktop/design/MENU.md          docs/desktop/design/RENDERER.md
docs/desktop/design/PACKAGING.md     docs/desktop/design/PANEL-READBACK.md
docs/desktop/design/PROJECT.md
```

**上一轮那条「写门判面 ≠ 引擎判面」的待裁 = 已闭（同尺）**：重启前会话进程加载的是改动前的引擎镜像；重启后写门与内置工具同一版。实测：`docs/desktop/design/PACKAGING.md` 两处读数同为 116（改前），不再有第二把尺。**该待裁三件（谁裁 · 何种条件 · 到期）无需再补——它不是待裁，是旧镜像的读数事故。**

**本轮读数（内置 `doc_check` gate，同一命令）**

| 时点 | 首行 | 余红档 |
|---|---|---|
| 开工（未改） | `DOC-CHECK GATE: REFUSED（锚 286 条）` | 15 档 |
| 三档落地后 | `DOC-CHECK GATE: REFUSED（锚 126 条）` | 12 档 |

**已清到 0（写门与内置工具同判）**：`docs/desktop/design/ACTIVITY.md` · `docs/desktop/design/PACKAGING.md` · `docs/desktop/design/SETTINGS.md` · `docs/desktop/design/UI.md`（末档落地后未复量，下轮首件事 = 复量取首行）。

**余量分布（按上表 126 条读数；按名字族归并，不逐条抄）**

| 名字族 | 落形（R 号） | 涉及档 |
|---|---|---|
| 仓内多候选码件（`app.mjs` ∥ `store.mjs` ∥ `chat.css` ∥ `settings.css` ∥ `index.html` ∥ `projects.mjs` ∥ `session-io.mjs` ∥ `run.mjs` ∥ `files.mjs` …） | R1 仓根全路径 | 其余 11 档 |
| 收口即删的单元 / 集成测试档与探针件 | R3 角色叙述 | `docs/desktop/design/PROJECT.md` · `docs/desktop/design/E2E-TESTING.md` · `docs/desktop/design/SHELL.md` · `docs/desktop/design/WEB-QUICKCHECK.md` |
| 用户配置档 ∥ 运行期配置名 | R2 叙述形 | `docs/desktop/design/E2E-TESTING.md` · `docs/desktop/design/PROJECT.md` |

**判不了清单（逐条：档 + 名字 + 卡在哪一问）——本刻三条**

| 档 | 名字 | 卡在哪一问 |
|---|---|---|
| `docs/desktop/design/SHELL.md` | `chat-digest.mjs` | 第 1 问（在仓否）：盘上同名零命中，而消化行族现有档名为 `docs/desktop/design/ACTIVITY.md` 与 `docs/desktop/design/RENDERER.md` 所记的另一名，无法在盘上指认「就是它」 |
| `docs/desktop/design/PROJECT.md` | `views-harness.mjs` | 第 2 问（曾在此、现退否）：整仓零同名，且无一句能证明它被谁接走 |
| `docs/desktop/design/WEB-QUICKCHECK.md` | `2Fprotocol.mjs` | 第 1 问：残缺 token（疑为 URL 转义残留），无从判定它原指哪一件 |

**最近先例**：同形处置 = `docs/desktop/design/SETTINGS.md` §1 **KD-68**（同一句里「文件名 shorthand」一律展开为仓根全路径，`-sections-mcp.mjs` 一族照此落形）；对齐本批五类判法，偏离面 = 零。

**调研证据**：查过 `docs/core/design/PATH-RESOLUTION.md`（解析链与唯一后缀兜底）· `docs/core/design/DOC-DISCIPLINE.md`（求值口径）· `docs/desktop/design/` 15 档自身的档树表；相关 = 前两档，取用面已在上面两段引文点名。另查 `docs/core/design/TESTING.md`（单元测试档收口即删）——与本批 R3 同源。

**本批边界（不变）**：只改上述 15 档的坐标与由此失效的句子；不碰产品码 ∥ 需求档 ∥ 台账 ∥ 清单外的档 ∥ 本档 §1 §3 §4 §6。

### 第 3 轮 · 第二程（余 11 档）落盘与残余（本刻）

**尺子不变**：内置 `doc_check`（`mode:"gate"`），docs = 第 2 轮那 11 档，路径写全照抄复跑。

**读数（同一命令 · 本程两跑）**

| 时点 | 首行 | 余红 |
|---|---|---|
| 本程开工（复量——上一程末档落地后未复量的那一跑） | `DOC-CHECK GATE: REFUSED（锚 84 条）` | 9 档 |
| 本程落盘后 | `DOC-CHECK GATE: REFUSED（锚 4 条）` | 3 档 |

**已到 0（8 档）**：

- `docs/desktop/design/E2E-TESTING.md` · `docs/desktop/design/IPC.md`
- `docs/desktop/design/MENU.md` · `docs/desktop/design/PANEL-READBACK.md`
- `docs/desktop/design/RENDERER.md` · `docs/desktop/design/SESSIONS.md`
- `docs/desktop/design/CHAT.md` · `docs/desktop/design/COMPOSER.md`（此二档本程开工即 0，复量证实）

**残余（4 条 · 逐条：档 + 名字 + 卡在哪 + 还缺哪条信息）**

| 档 | 名字 | 卡点 | 缺什么才判得了 |
|---|---|---|---|
| `docs/desktop/design/SHELL.md` | `chat-digest.mjs` | 第 1 问（在仓否）：整仓零同名 | 需有人确认该批是否另有一份 `chat-digest.mjs`；盘上现役是 `thincoder-desktop/renderer/views/chat-digest-rows.mjs`，与句中「全族三段迁入」不是同一件 |
| `docs/desktop/design/PROJECT.md` | `views-harness.mjs` | 第 2 问（曾在此、现退否）：整仓零同名 | 需一句「它被谁接走 ∥ 被删」。盘上无同名档，也无一句指认 |
| `docs/desktop/design/WEB-QUICKCHECK.md` | `2Fprotocol.mjs` | 不是残缺指针，是**抽取器切出的尾段** | 原字面 = `..%2Fsrc%2Fmain%2Fprotocol.mjs`（WQ-2 的逃逸探针输入，非档指针）。要判得先裁：探针字面是否原样保留，或改抽取器对百分号编码字面的处理——**引擎面，不在本批写域** |
| `docs/desktop/design/PROJECT.md` | `settings.css` | **判得出**（= `thincoder-desktop/renderer/settings.css`）但**落不了盘** | 与上一行同址（同一句的枚举里）。写门按整区判，任何触该处的写入都被 `views-harness.mjs` 拒 |

**上面第四条卡点的读数（实测 · 单点写入该处）**

```text
对该处一笔单点写入（只把 settings.css 展开为仓根全路径）：
DOC-CHECK GATE: REFUSED（锚 1 条）
✗ 锚·档缺 docs/desktop/design/PROJECT.md:378 `views-harness.mjs`（缺「views-harness.mjs」）
判面：改动区 1 区 · 片段区 1 区 · 目标档段首行 378
本次写入未落盘——目标档字节逐字不变（零字节）。
```

⇒ 该句两条 token 互锁：`views-harness.mjs` 不裁，`settings.css` 就清不动。成因 = R6（推进单位 = 段）与「判不了的留着」两条落在同一句时的相互作用。

**本程的非坐标改动（AC-3′ 在册 · 一段）**

`docs/desktop/design/SHELL.md` §4 首段原为单段长句（`node` 逐字符计数 = 293）。把 `thincoder-desktop/src/main/session-io.mjs` 展开成仓根全路径后越 300 字段落线，写门按段落判拒（`1 段文字太长`，零字节落盘）。处置 = 原地拆两段、一段一断言、逐字未改；前段收在「端差在册）」句号处，后段自「本端 …主责」起。语义零改，只动断点。

**判据可失败（AC-5 · 本程读数）**

同一条命令两跑：改前 `REFUSED（锚 84 条）`，改后 `REFUSED（锚 4 条）`。读数不同 ⇒ 该命令判的是这批债，不是它自己的写法。

**调研证据（本程新增 · 盘上实读）**

- `thincoder-desktop/renderer/views/session-control.mjs` 的 `sessionModel` 内写 `msgs: Number.isFinite(row?.messageCount) ? row.messageCount : null`，档头写「元数据三值各自缺席（非串 ∥ 空串 ∥ 非数）⇒ 该值零节点」——`D23` 行与 `docs/desktop/design/E2E-TESTING.md` 的 KD-7 注那两处，原指一份已不在盘的渲染面档名，继任者确指本档（读出来的，非猜名）。
- `thincoder-desktop/test/` 现盘 = `files.mjs` ∥ `rc-resolve.mjs` ∥ `run.mjs`，无 `integration/` 目录 ⇒ 集成 ∥ 单元测试档名的 R3 处置有据：那一族档确实不在盘上。

**最近先例**（不变）= `docs/desktop/design/SETTINGS.md` §1 **KD-68**；偏离面 = 零（拆段一处按写门要求处置，已在上方单列）。

### 残余轮处置（用户 2026-11-08 裁定 · 本批最后一程）

**取数（一把尺）**：内置 `doc_check`，`mode:"report"`，清单 = 本批 15 档。

- 开工读 = `命中 286 条（锚 286 · 段落 0 · 行号坐标 0）`。
- 改后读 = `命中 2 条（锚 2）`——即下面 ③ ∥ ④ 两条「不改文档」的登记项。
- 同一刻仓内九批并发清账：其余 13 档由别批落盘，故改后读数只剩本三档；两次读数是同一条命令、同一清单。

#### 四条裁定落形

| # | 档 | 对象 | 处置 | 落形 |
|---|---|---|---|---|
| ① | `docs/desktop/design/PROJECT.md` | 视图夹具件（见下块） | **R3 角色叙述** | 「该批的视图夹具」 |
| ② | `docs/desktop/design/PROJECT.md` | 设置面样式件（见下块） | **R1 仓根全路径** | 见下块 |
| ③ | `docs/desktop/design/SHELL.md` | 摘要族件（见下块） | **判不了**（三件见后） | 原句不动 |
| ④ | `docs/desktop/design/WEB-QUICKCHECK.md` | 逃逸探针伪 token（见下块） | **抽取器假阳**：登记，档改 0 字 | 原句不动 |

① ∥ ② 同处一句，按写门「整区判」一次写；逐字（原句 ⇒ 改后句）：

```text
原：其余新档（主进程四源档 · `settings.css` · 视图三档 · `views-harness.mjs`）行数面 = 各域文件账（分支清单随动 = 码面池）。
改：其余新档（主进程四源档 · `thincoder-desktop/renderer/settings.css` · 视图三档 · 该批的视图夹具）行数面 = 各域文件账（分支清单随动 = 码面池）。
```

- ① 判据 = 整仓零同名（该件盘上零处）+ 无继任句 ⇒ 对象已无 ⇒ R3；R3 不要求指认继承者。
- ② 判据 = 盘上两处同名，桌面设置面语境 ⇒ 取桌面渲染面那一份（R1 多候选按上下文选）。

#### ③ 判不了 · 三件齐

- **谁裁**：父侧 ∥ 用户（本轮已裁「保持判不了，别猜」）。
- **条件**：确认「全族三段迁入」那一批是否另有一份副本——盘上现役的摘要行族件与「全族三段迁入」不是同一件。
- **到期**：本批收口前。

原句一字不动；该 token 仍在读数里，是登记项不是新命中。

#### ④ 抽取器假阳 · 三件齐

- **谁裁**：父侧（抽取器修正立账；用户本轮「这类不改文档，改抽取器，我会立账」）。
- **条件**：抽取器对 URL 编码段（`%2F`）不再切出档名；同族假阳 = D 簇里产品名被当档名那一类。
- **到期**：抽取器修正批落地前，本档只登记不改字。

登记形（档 + token + 原字面）：

```text
档       = docs/desktop/design/WEB-QUICKCHECK.md
token    = 2Fprotocol.mjs
原字面   = ..%2Fsrc%2Fmain%2Fprotocol.mjs   （WQ-2 逃逸探针输入；改了这条用例就失效）
```

#### 同轮一并清掉的 12 条（读数里未裁的族，按同族判词处置）

开工那 14 条本三档命中的其余 12 条，判词与用户本轮 ① 同族，故一并清在本轮：

- **R1 仓根全路径 5 处**：KD-53 先例件、边界行工程件、会话族三联（`session-io` ∥ `session-slots` ∥ `projects`——均取桌面主进程目录）。
- **R2 不带路径的叙述形 1 处**：项目根的 MCP 配置文件（运行期配置名，不写档名）。
- **R3 角色叙述 6 处**：已删单元测试四件（视图面 ∥ 确认面 ∥ 提问面 ∥ 锁面）+ 花括号写法切出的残片一件 + 一处整档名指向已删用例。

处置理由：四件用例档盘上零处（`glob` 查桌面测试目录无匹配），且不在继任名单；残片由抽取器切分产生；整档名那一处所指的用例档同样已删。

#### 复跑读数（改后 · 15 档）

```text
命中 2 条（锚 2 · 段落 0 · 行号坐标 0）
✗ SHELL.md:233          chat-digest.mjs      （③ 登记）
✗ WEB-QUICKCHECK.md:161 2Fprotocol.mjs       （④ 登记）
```

本三档中 PROJECT.md = 0 条；SHELL.md = 1 条（③）；WEB-QUICKCHECK.md = 1 条（④）。其余 13 档 = 0 条（同一次运行）。

#### 未裁 12 条的逐对在册（原句 ⇒ 改后句）

与本轮四条同理：改的是坐标与点名形，句子结构 ∥ 断言内容零动。

```text
R1  KD-53  （先例 = KD-35 `notify.mjs`）
        ⇒   （先例 = KD-35 `thincoder-desktop/src/main/notify.mjs`）
R2  KD-70  ；`.mcp.json` ∥ 连接 ∥ 管理面语义零触；
        ⇒   ；项目根的 MCP 配置文件 ∥ 连接 ∥ 管理面语义零触；
R1  边界行  ∥ `projects.mjs` ∥ 核 ∥ `thincoder-render-core`
        ⇒   ∥ `thincoder-desktop/src/main/projects.mjs` ∥ 核 ∥ `thincoder-render-core`
R1  会话族  （`session-io.mjs` ∥ `session-slots.mjs` ∥ `session-maintenance.mjs` ∥ `session-actions.mjs` ∥ `sessions.mjs` ∥ `projects.mjs`）
        ⇒   首件 · 次件 · 末件改仓根全路径，中间三件原样（后缀唯一，读数不报）
R3  用例面 落 `thincoder-desktop/test/views-chrome.test.mjs`
        ⇒   落该批的单元测试档
R3  用例面 `thincoder-desktop/test/{views-question,views-tabbar-close}.test.mjs`
        ⇒   该批的两档单元测试
R3  用例面 `thincoder-desktop/test/views-tabbar-close.test.mjs`（确认面族 U55 自 `views-tabbar` 拆出）· `thincoder-desktop/test/views-question.test.mjs`
        ⇒   该批拆出的确认面单元测试档（确认面族 U55 自 `views-tabbar` 拆出）· 该批新增的提问面单元测试档
R3  用例面 = `thincoder-desktop/test/views-tabbar-close.test.mjs`（页随动**五例**
        ⇒   = 该批拆出的确认面单元测试档（页随动**五例**
R3  用例面 + `thincoder-desktop/test/views-locks.test.mjs` 原址补例
        ⇒   + 该批的锁面单元测试档 原址补例
```

依据：四档用例档在桌面测试目录零匹配（`glob` 查 `views-chrome` ∥ `views-tabbar-close` ∥ `views-question` ∥ `views-locks` 的 `.test.mjs` 全无返回），且与用户本轮 ① 同族——整仓零同名 + 无继任句 ⇒ 对象已无 ⇒ R3。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
