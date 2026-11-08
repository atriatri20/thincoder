# 2026-11-08 · pointer-residue-i
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 12:34「长尾批可以开批处理吧，一样逻辑也分分批，并发上限还有，不用限制四个」——I 簇：`docs/cli` 长尾 + `docs/desktop/requirements` 9 档。
> 台账 = #2182（core · 归批）。前情 = docs/batches/2026-11-08-pointer-debt.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（9 档 14 处锚命中按 R1–R6 逐处归位（R1 7 · R2 3 · R3 2 · R5 1）；AC-1 目标 = 0，红侧 14 已实测）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| # | 条目 | 覆盖 | 判据锚 |
|---|---|---|---|
| 1 | 9 档锚命中清到 0 | 覆盖 | AC-1 |
| 2 | 按父侧统一判法 R1–R6 逐处归类处置 | 覆盖 | AC-2 · 下表 |
| 3 | 判不了的逐条列：档 · token · 为什么 · **缺哪条信息才判得了** | 覆盖 | AC-2 |
| 4 | 段落 ∥ 行号坐标 | **不在本批**（实测 0 处，不是不做） | 「边界」 |

### 开批读数（量法一条：本仓引擎）

```text
node -e "import('./thincoder-core/doc-check/index.mjs').then(m=>{const r=m.runDocCheck(process.cwd(),{docs:[…本批 9 档…],mode:'report'});console.log(JSON.stringify(r.hits))})"
⇒ {"total":14,"anchors":14,"paragraph":0}      lineRefs = 0
```

| 档 | 命中 | 档 | 命中 |
|---|---|---|---|
| `docs/cli/design/ACP-PROTOCOL-COMPLIANCE.md` | 2 | `docs/cli/requirements/TUI.md` | 1 |
| `docs/cli/design/CRASH-REPORTS.md` | 2 | `docs/desktop/requirements/PACKAGING.md` | 4 |
| `docs/cli/design/CLI-DEBT.md` | 1 | `docs/desktop/requirements/MENU.md` | 1 |
| `docs/cli/design/TUI-COMMANDS.md` | 1 | `docs/cli/requirements/ACP-CLIENT.md` | 1 |
| `docs/cli/requirements/READ-DATA-INTERFACE.md` | 1 | **合计** | **14** |

**两把尺子，判据只认本仓引擎**：同一份 9 档清单，会话内的 `doc_check` 读 **55**、本仓引擎读 **14**。

后者带上批落地的唯一后缀兜底腿，前者是全局旧构建。两个数都是本席当刻实跑，差在尺子不在档。

### 判法（R1–R6 · 父侧统一判法，九批共用）

| 类 | 判法 | 本批命中 |
|---|---|---|
| R1 | 现态指针 ⇒ 仓根全路径 | 7 |
| R2 | 非仓内名（含外部仓件、构建生成物、举例）⇒ 不带路径形态的叙述 | 4 |
| R3 | 已删的测试 ∥ 探针件 ⇒ 角色叙述，不写档名 | 2 |
| R4 | 沿革 ∥ 历史段里的旧路径 ⇒ 叙述形（状态档不留历史） | 0 |
| R5 | 站点仓件 ⇒ 写带前缀全形 | 1 |
| R6 | 按段推进（段里剩一条红，整笔拒） | 施工律 |

**R5 的实测补充（本席当刻跑过）**：`thincoder.com` 已在 `index.publicRepos` 声明且声明根在盘；但带前缀只在**该仓真有这份件**时转绿。

实测：站点仓只有 `thincoder.com/www/download.html` 一处命中本批三件；两个 feed 描述件在站点仓**没有**（盘上仅本机构建产物），故这两处归 R2，不硬写带前缀形——那会造出指向不存在件的指针。

**需求层五处的分岔**：这句话在讲「现在怎么做」⇒ R1 改指现档；讲的是当年那件事 ⇒ R4 叙述形，**别改路径**；判不了 ⇒ 报。

### 逐处处置（本席已逐处判到，交实施席核）

```text
档                     行    token                      类   处置
ACP-PROTOCOL-COMPLIANCE 93  session-slots.mjs          R1   thincoder-core/session-slots.mjs（deleteSlot 单点在核，实读导出）
ACP-PROTOCOL-COMPLIANCE 124 docs/a.md                  R2   举例形：改写成「文档路径 + 片段」的叙述，不补真路径
CRASH-REPORTS           15  heap-watch.mjs             R1   thincoder-cli/src/heap-watch.mjs
CRASH-REPORTS           31  r25-oom.mjs                R3   角色叙述：「OOM 复现夹具的无参调用」
CLI-DEBT                44  memory-sweep-cli.test.mjs  R3   角色叙述，保住「宿主测试档不在盘」这个事实
TUI-COMMANDS            19  provider-admin.mjs          R1   thincoder-cli/src/tui/provider-admin.mjs（同档下一行已写全路径）
ACP-CLIENT              20  schema.json                 R2   外部仓件：改叙述（该仓 schema/v1 目下的协议 schema）
READ-DATA-INTERFACE     18  LEDGER.md                   R1   docs/core/design/LEDGER.md（同行另一处已写全路径）
TUI                     38  SESSION.md                  R1   docs/core/requirements/SESSION.md（F-S7 需求体在该档 §4.4）
PACKAGING               12  latest.yml                  R2   构建生成物：改叙述（更新描述件，发布窗生成）
PACKAGING               13  download.html               R5   thincoder.com/www/download.html（实测在盘）
PACKAGING               13  package.json                R1   thincoder-desktop/package.json
PACKAGING               14  latest-linux.yml            R2   构建生成物：改叙述（Linux 更新描述件）
MENU                    10  projects.mjs                R1   thincoder-desktop/src/main/projects.mjs（同行 menu-words.mjs 已被后缀兜底判绿）
```

**归类合计**：R1 7 + R2 3 + R3 2 + R5 1 = 13。14 处已逐处归位，无判不了项。

### 受影响文件与测试覆盖

- 改面 = 上表 9 档，全部落在 `docRoot.design` 与 `docRoot.requirements` 两面；**零新增档、零删除档**。
- 分层结论：**无跨界**——不碰产品码、测试档、`PROJECT-MANIFEST.json`、台账。
- 本批零运行面改动 ⇒ 无单元测试档；验收 = 引擎读数（命令见上）。

### 验收对照（逐条机检 · 判据回指条目）

| # | 判据 | 判法 | 红侧读数（当刻实测） |
|---|---|---|---|
| AC-1 | 9 档 `hits.anchors` = **0** | 与开批同一条命令、同一清单、同一支引擎一次跑 | 14（已取到） |
| AC-2 | 判不了的逐条入 §5：档 · token · 为什么 · 缺哪条信息才判得了；为空也写「空」 | 清单条数与 AC-1 的读数相等 | 清单空、残余 14 |
| AC-3 | 零语义变更：R1/R5 只改坐标；R2/R3 去指针后仍说同一件事 | 逐处「原句 ⇒ 改后句」入 §5，成对可读 | 未改 |
| AC-4 | 射程未外溢：段落 0 条、行号坐标 0 处与改前逐位相同 | 同一次跑里读 `paragraph` / `lineRefs` | 0 / 0 |

**AC-1 的红侧已当场取到**（14），改后必须读 0——同一支引擎、同一份清单，差不是尺子造成的。

### 集成测试设计（RTM 差量）

本批零代码面、零业务可观察结果变更 ⇒ `test/RTM.md` **零改**：无行被破坏、无行冗余、无行缺失。

两个用例来源（业务场景 ∥ 生产问题）都不成立，故不新增集成用例，亦无单元测试档。

### 关键决策

**KD-1 尺子 = 本仓引擎，不取会话内 `doc_check`。**两数实测 14 ∥ 55；取旧构建当基线，会把已绿的 41 处写成待办。

**KD-2 R1 不自动认「只有一份像的」。**同名不同物本仓已成片；认错即把文档指到别的模块上，比留着红更坏。

**KD-3 R3 以「去档名、留角色」处置，不造继任者。**被否：给它编一个新路径。这批多是收口即删的夹具与测试档，造继任者 = 造一份不存在的证据。

**KD-4 R5 只在件真在该仓时成立。**被否：一律写站点前缀。实测两个 feed 件在站点仓没有，硬写就是新造死指针。被否的第二条：写成 `thincoder-desktop/dist/…`——那是本机构建产物，指错对象。

**KD-5 不新开设计档。**判定规则的单源已在盘（`docs/core/design/DOC-DISCIPLINE.md` 与 `docs/core/design/PATH-RESOLUTION.md`）；执行清单一次性，只住本段。

### 边界

- **可改**：上表 9 档（4 设计 + 5 需求），且只改指针形态。
- **不动**：9 档之外的任何档 · 产品码 · 测试档 · 台账 · `PROJECT-MANIFEST.json` · 本档 §1 §3 §4 §6。
- **不做**：段落 ∥ 行号坐标两面（本批零对象）。
- **不自裁**：跨仓声明（manifest 面属主 agent）；本批只按已声明的出边写形。

### 上抛项

**1〔知会〕R5 的适用面比字面窄。**站点仓已声明，但带前缀只在件真在盘时转绿；本批实测该仓只有 `thincoder.com/www/download.html`，两个 feed 描述件不在该仓。故 R5 本批落 1 处、R2 落 2 处，依据是实测不是偏好。

**2〔知会〕写门与报告面同一条尺子，单位是「段」。**施工律 = R6：段里剩一条红，整笔拒。故遇连坐拒先清该段再落，不逐条硬顶。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
