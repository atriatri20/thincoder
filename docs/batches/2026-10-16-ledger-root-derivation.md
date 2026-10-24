# 2026-10-16 · ledger-root-derivation
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-16 · 来源 = 用户 2026-10-16 17:59「卧槽！怎么还让我选？没有这个操作，应该是自己推导的！」+ 18:01「还一半一半，写也得一致，也得是推。」+ 18:24「我们就是明确，读写都根据同一标准推，至于怎么保证有 manifest 可推，那是另外一个命题，另外保证的。」⇒ 台账工具项目根：读写同一推导标准；保证面不入本批。。
> 台账 = #1588（LEDGER · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-16
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（fix 轮落齐 · 评审 9 条按号处置（号 1..8 落 · 9 随做）· 落点 docs/core/design/LEDGER.md）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**本批条目（覆盖）**：台账 `#1588`（LEDGER · requirement · 待讨论）——「台账工具的项目根须自动推导（不得弹候选让人选）」，用户 2026-10-16 17:59 / 18:01 / 18:24 逐字三句。范围 = **读写同一推导标准**；「怎么保证有 manifest 可推」= **另命题**（本批不设计冷启动 / 无声明 / 兜底面，连「另批」类句子也不留）。
**不在本批**：不写实现码 · 不动 `thincoder-core/**` · 不改需求档 · 不跑 `doc-check` · 不扩到本项之外（含冷启动面）。

**设计档落点** = `docs/core/design/LEDGER.md`（就地扩已有节，不另立档）：§2.1「根解析面」重写为**读写同一推导** + 新增 **§3.8**（增量记录：先例 ∥ 勘察证据 ∥ 受影响面）+ §6.1 / §7.1 / §7.2 / §8 / §9 随动。

**机制设计（七件）**：
1. **判据句（单源 · 读写同用）**：项目根 = 自「动作目标路径」（缺省 = 会话锚 `cwd`）起，沿祖先链向上（含自身）取的**最近一个「已注册」目录**。
2. **「已注册」判据（唯一 · 可观测事实）**：**档臂** = 该目录带 `PROJECT-MANIFEST.json`（档在盘）；**库臂** = **以该目录自身路径为键**的键控台账库在盘（`ledgerKey(dir)` + `ledgerDirPath()`——**不经 `ledgerDbPath`**，消自指）∧ **非 `workspace` 态**（`projectRootView`——键控库存在 ≠ 可作项目）。两臂同根——库键 = `ledgerKey(根)`，库随根走 ⇒ 不产第二答案；档臂给出根的本体（库未建也能定根），库臂给出既有账面。
3. **单源单实现** = `thincoder-core/ledger-db.mjs` 新导出 `resolveLedgerRoot(target, { descend = true }) → { root, basis } | null`。
   **消费面六**：`openLedger`（五 action 存取入口）· `ledgerDbPath`（键路径）· `findProject`（族发现 `current`——薄委托且**返回根**，**取祖先支** `descend: false`）· `ledger-read.mjs:53`（单范围根）· `cwdOf`（锚源，零改）· `ledgerChildren`（族发现 ∥ 轻通道闸候选枚举——随迁 + 谓词放宽「已注册」）。
   落点取 `ledger-db.mjs`：`ledger.mjs` 已静态依赖它、反向不成立 ⇒ 无 import 环（W8 契约②）；`ledgerChildren` / `MAX_SIBLING_SCAN` 常量随迁、`ledger.mjs` re-export 保公共面**形**零改。
4. **多解确定性规则**：① **祖先链多解**（嵌套项目）⇒ **最近者优先**（子优于根——判据句的「最近」即定；同 `MANIFEST.md` KD-M1-30 归属律）；② **容器锚**（锚自身及祖先链皆无已注册者）⇒ **向下取**锚的直接子目录中已注册者（惰性枚举 + 上限、名序升序）——**恰一 ⇒ 取之**；**≥2 ⇒ (a) 先取「有键控库」子集**（账已在盘 = 事实）**(b) 该集名序升序首者**（稳定序）；**零已注册子目录 ⇒ `null`**（无根契约 = §3.8：读面空账 ∥ 写面抛）。
5. **报明形态（机械可判）**：触发 = `basis === 'descendant'` ⇒ 工具**对象形回执携 `root`**（`add` / `update` / `close` / `count`；供值面 = 工具层调同一单源）；`basis === 'ancestor'`（锚在项目内——根由祖先链唯一给出）⇒ 回执**逐字零改**；`query` 行集形不携（可核性 = 行集本身 + `count`）。
6. **写面改法**（`ledger-db.mjs`）：**删** `openLedger` 工作区抛（`:150-153`「报明 + 列候选 + 要 `cwd=<项目根>`」）；`dir` 改走 `resolveLedgerRoot`；`ledgerDbPath` 归单源（删其内 `resolveProjectRoot ?? resolve` 自持一步）；`ledgerKey` **零改**（键式不动）；目录不存在的真错**照抛**（fail-loud，非「回头问人」）。
7. **缺省 cwd**：`cwdOf`（`ledger-tools.mjs:17`）**零改**——它是**锚源**；「锚 → 根」的推导在 `openLedger` 单点发生（缺省经同一标准）；`cwd` 参数**保留**（它是判据句的输入「动作目标路径」）。

**受影响文件与测试覆盖（终形）**（行数 = 现行 · node 实读；口径 = `DOC-DISCIPLINE.md` §3.7 条目 H）：
- 实现 6 档：`ledger-db.mjs`（175 ⇒ ~220——`resolveLedgerRoot` + 抛退场 + `ledgerDbPath` 归单源 + `ledgerChildren`/`MAX_SIBLING_SCAN` 随迁）· `ledger.mjs`（187 ⇒ ±~15）· `ledger-tools.mjs`（260 ⇒ +~8）· `ledger-read.mjs`（95 ⇒ ±2）· `ledger-cmd.mjs`（179 ⇒ **+1**——§6.1 口径 2 基准归单源；回执形零改）
- `ledger-migrate.mjs`（301 ⇒ 301——`:97` 迁移计划解析基准归单源）——**贴线判零拆分义务**（最高 ~220 ≪ 500）。
- 随动（行为零变）：`agent/light-round.mjs`（67——候选面随谓词放宽等值扩集；其 `:48` 基准句 = 协调项）。
- 用例：`thincoder-core/test/ledger-root-derivation.test.mjs`（实施轮新建 ~90–140 行——**T115–T122**；靶向单跑 `node --test test/ledger-root-derivation.test.mjs`）——**一次性验收 · 零留档**（用毕即删）。
- 文档档（两列 `—`）：`docs/core/design/LEDGER.md`（§2.1 ∥ §3.8 ∥ §6.1 ∥ §7.1 ∥ §7.2 ∥ §8 ∥ §9）· `thincoder-core/tool-docs/ledger.md`（`cwd` 描述句）。
- 零改面：`manifest-discovery.mjs`（135）· `ledger-surface.mjs`（97）· `ledgerKey` 本体。

**验收对照（逐条回指本批验收 ①–⑦）**：① 判据句 + 可观测性 = LEDGER.md §2.1「根解析面」；② 多解规则 + 报明形态 = §3.8「收敛序 / 报明形态」；③ 写面抛退场 = §3.8 消费面表 + T120；④ 缺省 cwd = §3.8 消费面表末行；⑤ 受影响面 = §3.8「受影响面」；⑥ 先例 + 公开源 = §3.8「先例行 / 勘察证据行」；⑦ 净增量下限自证 = §9「项目根推导」边界条（不承载无声明面 · 不设兜底 · 不设冷启动推演）。

**关键决策**：
- **D1**「已注册」= 档在盘 ∨ 库在盘：一条判据，不引第二标准；档臂使「库未建」也能定根（**消冷启动特判**——这是不设计兜底而成事的关键）。
- **D2** 台账面**偏离** manifest 面「不猜（禁按名序取首）」：用户逐字裁定「必须自己推、读写一致、不得把选择退回人」，且台账面比 manifest 面**多一枚可观测事实**（库在盘）可先收敛 ⇒ 名序仅作无事实可依时的末位 + **恒报明**。`MANIFEST.md` 面**不被动**。
- **D3** 落点 `ledger-db.mjs`：无 import 环，且与 `ledgerKey` / `ledgerDbPath` 同居（根推导与键同源）。

**上抛项**：
- [上抛·待裁] ① **随动面**（如实登记 · 两条 —— 设计档 §3.8「随动面」）：ⓐ `findProject` 判据扩「档在盘」臂 ⇒ 锚在**有档无库**项目内时，显示面由「未发现台账」变为该项目一行 `台账 <名>：需求池 0 · 技术待办 0（老化 0）`；ⓑ `ledgerChildren` 谓词放宽（库在盘 ⇒ 已注册）⇒ 族枚举集 ∥ `light-round.mjs:39` 候选面等值扩集（逐候选查行为空 ⇒ 不进闸，**行为零变**）。两条均系「读写一致」的**必然面**（写面正在同一根建库）；若用户不接受，则须改判据（回退为读写两判据）。
- [上抛·待裁] ② **需求侧对位（路由 · 不改需求档本体）**：需求档 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` 的 AC-M2-17 对位句 = **主 agent 笔**（本席零触需求档）；**对位形（逐字可抄）** = 与设计档 §8 AC-M2-17 同句同形：已注册 = `PROJECT-MANIFEST.json` 在盘 ∨ **以目录自身路径为键**的库在盘 ∧ 非工作区态；族发现 ∥ 标记面取祖先支；无根 ⇒ 读面空账 ∥ 写面抛；旧文案零命中。
- [上抛·待裁] ③ **跨档陈旧行**（范围外发现，本席未动）：`docs/core/design/MANIFEST.md` §2.5 消费点表**第 6 行**仍述台账 `openLedger`「锚为工作区 ⇒ 报明事实 + 点名项目根」（本批已按用户裁定改为「取值 + 报明」）⇒ 该行成陈旧句；**归属 = manifest 板**（`MANIFEST.md` 不属本批落点）——请主 agent 路由（改该行；行内「`ledger.mjs:96` 工作区根不充当项目」半句**仍有效**，不在改动面）。
- [上抛·待裁] ④ **末位规则确认**：收敛序的 (b)「名序升序首者」为具名末位规则（非静默）；如用户不接受，替代面 = 「停手照旧」——但那与 17:59 裁定相抵。

**§2 fix 轮（来源 = 批档 §3 轮次 1 判词 · changes-required 🔴3 🟡5 🔵1；父侧八条全接受 ⇒ 按号 1..8 落、9 随做；执行 = eng-designer；本轮不写实现码）**

| 号 | 处置 | 改动（`file:line`） |
|---|---|---|
| 1 🔴 | 族发现 ∥ 标记面**择一写死** = 取**祖先支**（`findProject` = `resolveLedgerRoot(anchor, { descend: false })` ⇒ 容器 ∥ 工作区锚给 `null` ⇒ 族求和）；AC-M2-18/19 零改 · T47–T51 期望零改 · 补 T122 | LEDGER.md §2.1 `:69`／`:70` · §3.8 消费面表 `:441` · §3.8「择一句」`:449-453` · 用例表 `:505`（T122）· §8 AC-M2-17 `:739` |
| 2 🔴 | 库臂去自指：判据改「**以该目录自身路径为键**的键控台账库在盘」（`ledgerKey(dir)` + `ledgerDirPath()`），并写死「本函数内部**不得经 `ledgerDbPath`**」 | LEDGER.md §2.1 库臂 `:65` · §3.8「无自指」`:431` · §7.1 `resolveLedgerRoot` 行 `:642` · `ledgerChildren` 行 `:643` |
| 3 🔴 | 库臂补工作区排除（`projectRootView` `workspace` ⇒ 库臂不成立），并与 §7.2 工作区根子例同判据同处单源；§2.1「不变」句改为「该锚不作根」 | LEDGER.md §2.1 库臂 `:65` · §2.1 工作区根条 `:70` · §7.2 工作区根子例 | 
| 4 🟡 | `ledgerChildren` 三处状态收敛为一句：**随迁** `ledger-db.mjs` + 谓词放宽「**已注册**」（单谓词）；区分收敛序枚举与公共面（消费面 = 族发现 ∥ 轻通道闸）；`light-round.mjs` 候选面落进随动面（行为零变） | LEDGER.md §3.8 单源句 `:432` · §3.8 消费面表 `:435`-row · §7.1 `:643` · §9 `:864` · §9 同级枚举上限 `:863` · §3.8 随动面 `:492` |
| 5 🟡 | 写门基准归位：§6.1 口径 2 改 `resolveLedgerRoot(cwd)?.root ?? resolve(cwd ?? ".")`；`:528` 补注（「本门该态不可达」）**删**；`ledger-cmd.mjs` 零改结论收正 ⇒ 移入受影响面（+1 行；**回执形仍零改**） | LEDGER.md §6.1 口径 2 `:561` · §3.8 受影响面 `:481` · §3.8 零改面 `:487` · §3.8 协调项 `:484` |
| 6 🟡 | 补「无根（`null`）契约」：读面 = 空账（`[]` / 0）；写面 = 抛（文案逐字）；`ledgerDbPath` 抛同文案／`ledger-read` 空集；旧文案退役 | LEDGER.md §3.8「无根契约」`:457-461` · §2.1 指针句 `:64` · §3.8 收敛序 `:445` · T120 `:503` |
| 7 🟡 | 补一拍回归 **T122**：容器锚（双项目夹具）下 `findProject` = `null` ∧ `discoverFamily.current` = `null` ∧ 标记 = 族求和（T47 同夹具）；工作区锚 + 幽灵库仍不立锚为根 | LEDGER.md §3.8 用例表 `:505` |
| 8 🟡 | 需求侧对位**只登记路由与对位形**（不改需求档本体）；路径收正为 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` | 本档 §2「上抛项」② `:42` |
| 9 🔵 | 判据行／AC 行「（2026-10-16 收正）」修订式标记**删**；§2 影响面**收成一份终形**（就地归并：旧影响面块 + 旧「§2 修正」块合为一，作废档数行删净） | LEDGER.md §2.1 `:62` · §8 AC-M2-17 `:739` · 本档 §2 受影响文件与测试覆盖 `:26-30`（并入后删去旧「§2 修正」四点块） |

**本轮「改动」= 文档面两档**：`docs/core/design/LEDGER.md` · 本批档 §2（影响面终形就地归并 —— **此处为直接文件归并，非 `batch append`**；理由 = 9 号要求「收成一份终形」，追加只增第三份互斥档数）。**零触** = 实现码 / `thincoder-core/**` / 产品码 / `scripts/**` / 需求档 / `tool-docs/ledger.md`；未跑 `doc-check`（在效禁令：用户 2026-10-15 12:10）。

**§2 fix 轮（来源 = 批档 §5 实施轮交付报三处设计侧缺漏 / 失准 · 父侧裁定 = 本批同拍补记；执行 = eng-designer；零触代码面）**

**三句必写**：**来源** = 本档 §5.5 上抛① + §5.2 决策透明表（`buildScan` 未列）+ §5.5「行数标注收正」「设计面表述与实盘不符」两条 + 父侧 2026-10-16 裁定（同拍补记）；**执行人** = eng-designer（设计档面笔 · 本批零触码面）；**本轮不做** = `thincoder-core/**` / 代码面 · 需求档 · `docs/core/design/LEDGER.md` 外档 · `tool-docs/ledger.md` · `doc-check`（在效禁令：用户 2026-10-15 12:10）· 号 1..3 之外。

| 号 | 处置 | 改动（`file:line`） |
|---|---|---|
| 1 | §3.8 消费面表补 `buildScan` 行（触发 = `ledgerDbPath` 无根抛 ⇒ 必随动；落点 = 推导根三字段、无根 `ledger: null`）+ 计数「六 ⇒ 七」；受影响面 `ledger.mjs` 行补点该面 | `docs/core/design/LEDGER.md` §3.8 消费面表 `:441`（新行）· `:434`（计数）· 受影响面 `:478` |
| 2 | 受影响面行数按实施后实测收正（源 / 单测档记「改前 ⇒ 改后」；文档档两列 `—`） | LEDGER.md §3.8 `:474`（表头）· `:477`–`:481`（实现 5 档）· `:490`（贴线判）· `:482`（用例行）· `:497`（用例表头） |
| 3 | 文档 / 描述面「`tool-docs/ledger.md`（`cwd` 描述句）」= 假落点 ⇒ 撤下；模型可见 `cwd` 文案单点收正为 `ledger-tools.mjs` `CWD_DESC` | LEDGER.md §3.8 `:483` |

**实测行数（node 复读 · `split('\n').length` 口径 = 本节他档同口径——`read` 工具「N lines total」同值）**：`ledger-db.mjs` 175 ⇒ **253** · `ledger.mjs` 187 ⇒ **156** · `ledger-tools.mjs` 260 ⇒ **275** · `ledger-read.mjs` 95 ⇒ **94** · `ledger-cmd.mjs` 179 ⇒ **178**；随动 `agent/light-round.mjs` 67（零变）；零改面 `manifest-discovery.mjs` 135 / `ledger-surface.mjs` 97 / `ledger-migrate.mjs` 301（零变，与设计原值相符）。贴线判 = 最高 253 ≪ 500 ⇒ 零拆分义务。

**消费面表全表复扫（逐行核「是否走根推导」）**：七行中**五行走根推导**（`openLedger` / `ledgerDbPath` / `findProject` / `buildScan` / `ledger-read`）；另两行 = `cwdOf`（锚源，零改）∥ `ledgerChildren`（收敛序 / 族枚举件——被推导所用，自身不推导）。同层直取单源者（`ledger-cmd.mjs:73` 写门基准 · `ledger-tools.mjs:23` 报明 helper `reportedRoot`）与外部消费面（desktop `project-info.mjs` `buildScan` · VSC `ledger-surface.mjs` `discoverFamily` · CLI `read-data.mjs:102` `resolveLedgerRoot` + `ledgerDbPath`）**无第二个漏行**——`buildScan` 为唯一漏项（已补）。

**未决（上抛父侧）**：
- [上抛·待裁] 设计 §3.8「在册状态」句仍述「未落地在册（在册未落）」——实施轮已落 ⇒ 成假；号 1..3 未含 ⇒ **本席未触**（请父侧裁：收口轮翻「已落地」）。
- [上抛·知会] 行数口径差：§5.1 记 `ledger.mjs` 155；本席 fresh 复读 = **156**（差异源 = 实施轮代码评审后补注释 `ledger.mjs:71-73`「回落规则」）。本席按 156 落。
- [上抛·知会] 他块 as-of 行数（§3.5 `:213` · §3.6 `:322-330` · §3.7 `:413-419` · §7.2 `:659`）仍记 `ledger.mjs` 187 / `ledger-tools.mjs` 260 / `ledger-db.mjs` 175——本批**零触**（他增量记录 · `DOC-DISCIPLINE.md` §3.15「读数 = as-of」口径）。

**§2 fix 轮（来源 = 父侧 2026-10-16 裁定「同拍补记」——号 1 §3.8「协调项 / 零改面」对 `ledger-migrate.mjs` 的登记按现况收正 · 号 2 无根契约补 `ledger migrate` 面；执行 = eng-designer；零触代码面 / 需求档 / `doc-check`）**

**三句必写**：**来源** = 父侧裁定 + 本档 §5.6「上抛·待裁 ①/②」（`ledger-migrate.mjs:97` 已由同拍修轮 `eng-coder #24` 归单源 ⇒ §3.8 两处登记成假；无根契约未覆盖 migrate 面）；**执行人** = eng-designer（设计档面笔 · 本批零触码面）；**本轮不做** = `thincoder-core/**` / 代码面 · 需求档 · `docs/core/design/LEDGER.md` 与本档 §2 之外档 · `doc-check`（在效禁令：用户 2026-10-15 12:10）· 号 1..2 之外。

| 号 | 处置 | 改动（`file:line`） |
|---|---|---|
| 1 | `:97` 归单源 ⇒ 移出「本批不触」两清单：受影响面补该档行（301 ⇒ 301）；零改面删该档；协调项收窄为仅仍零触站点（3 处）；贴线判去「（零改）」 | `docs/core/design/LEDGER.md` §3.8 `:477`（5 档 ⇒ 6 档）· `:483`（新行）· `:488`（协调项）· `:490`（零改面）· `:492`（贴线判） |
| 2 | 无根契约补 `ledger migrate` 面一条（dry-run 照出计划 ∥ confirm 零落库） | LEDGER.md §3.8 `:463`（新行） |

**§2 终形块同号收正**（就地归并 · 与设计档逐字同形）：实现 5 档 ⇒ 6 档（补 `ledger-migrate.mjs`）· 零改面删该档 —— 本档 `:29`–`:30`（实现行拆两行以守 300 字符门）· `:34`（零改面）。

**复扫表（§3.8 内 `ledger-migrate` 全部登记逐处核 · 列残留 = 0）**：

| 处（收正后） | 现文要点 | 判 |
|---|---|---|
| §3.8 受影响面 | `ledger-migrate.mjs`（301 ⇒ 301——迁移计划解析基准（`:97`）归单源） | 真 ✓ |
| §3.8 协调项 | `ledger-migrate.mjs:258`（仍零触） | 真 ✓ |
| §3.8 贴线判 | 全列最高 = `ledger-migrate.mjs` 301 行 | 真 ✓ |
| §3.8 其余 | 「`:97`」/「入参已是根」/「（零改）」 | 零命中 ✓ |

**回读（D6 · 源面 / 静态面）**：`thincoder-core/ledger-migrate.mjs` 现 = **301** 行（`git` HEAD 同值 ⇒ 301 ⇒ 301 · ±0；改动 = 3 行原地换写：`:15` import 补 `resolveLedgerRoot` / `:95` 头注 / `:97` 表达式）；`:97` = `const projectRoot = resolveLedgerRoot(cwd)?.root ?? resolve(cwd ?? ".")`（`git diff` 实读）· `:258` = `resolveProjectRoot(a) ?? resolve(a ?? ".")`（仍旧式 ⇒ 协调项保留）· `:191` = `openLedger(plan.projectRoot, { create: true })`（confirm 经此落入无根写面抛 ⇒ 零落库）。

**未决（上抛父侧）**：
- [上抛·知会] 本档 §2 终形块 `:32`「文档档……`thincoder-core/tool-docs/ledger.md`（`cwd` 描述句）」= 上轮已判假落点（模型可见 `cwd` 文案单点 = `ledger-tools.mjs` `CWD_DESC`），该行未随删 ⇒ 残留（**不在号 1/2 面 ⇒ 本席未触**）。
- [上抛·知会] `LEDGER.md` §6.1 `:564` 指针「同日同式子站点清单 = §3.8『协调项』」——协调项收窄后仅列仍零触 3 站，已归单源的 `:97` 现列于 §3.8 受影响面 ⇒ 指向面略窄（**§6.1 不在号 1/2 面 ⇒ 本席未触**）。
- [上抛·知会] `LEDGER.md` 全文尚有 8 处 >300 字符单行（L87 343 · L634 449 · L735 424 · L741 310 · L742 337 · L745 315 · L749 320 · L752 369）——**均既有行、不在本轮触面**（本轮触面最长 228 字符）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**设计评审（独立 advisor）· 目标 = 批 2026-10-16-ledger-root-derivation（设计档 = docs/core/design/LEDGER.md §2.1 重写 + §3.8 新增）· 结论 = changes-required（🔴 ×3 · 🟡 ×5 · 🔵 ×1）**

已核通过项：设计档在位（§2.1/§3.8）· 先例行（先例坐标 + 对齐/偏离 + 无先例宣告）齐备（LEDGER.md:439-443）· 勘察证据行齐备（LEDGER.md:445-446，含「无仓外声明源可查」照记）· 受影响面行数标注齐备且抽检相符（ledger-db.mjs 175 ✓ · ledger.mjs 187 ✓ · ledger-tools.mjs 260 ✓ · ledger-cmd.mjs 179 ✓ · ledger-read.mjs 95 ✓ · ledger-surface.mjs 97 ✓ · manifest-discovery.mjs 135 ✓）⇒ 贴线判（最高 ~205 ≪ 500）成立 · 上抛③ 所述 MANIFEST.md §2.5 第 6 行（实读 :324）陈旧句核对属实。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Requirements / Feasibility | 🔴 | `findProject` 改「薄委托 `resolveLedgerRoot`（**返回根**——消「根报成锚」旧差）」（LEDGER.md:431）⇒ 容器/工作区锚也取「向下收敛」支，`discoverFamily` 的 `current`（ledger.mjs:94-101）由 `null` 变某子项目 ⇒ L1 标记由族求和变「仅当前项目」（LEDGER.md:621「`current` 在场 ⇒ 仅当前项目」），与在册 AC-M2-18（LEDGER.md:707「容器根锚（族 ≥1 已读项目）⇒ 标记 = 族内已读项目两池分列求和」）及在位用例 T47（LEDGER.md:772）相抵；而 §2.1:66 自称「⇒ 族发现面按容器形（零改）」、§9:835 自称「不改明细行集口径（`当前 ∪ 可动作`——§7.2）」，登记的随动面只有「有档无库」一条（LEDGER.md:461）。本仓锚 `d:\teamcode` 实读无 `PROJECT-MANIFEST.json`（`thincoder/` ∥ `thincoder.com/` 各一枚）⇒ 依新判据该锚落容器锚支，不再 `current = null`。 | 在设计内定死该面：或写成一节随动面并把 §7.2 标记范围 + AC-M2-18 对位一并改；或不取——写明族发现/标记面的取根不含向下分支（容器形锚在 `findProject` 返回 `null`），并补「容器锚（双项目夹具）标记仍为族求和」回归用例。 |
| 2 | Feasibility | 🔴 | 库臂判据自指：「已注册」第二臂 =「该目录**在用户数据目录有键控台账库**（`ledgerDbPath(dir)` 在盘）」（LEDGER.md:63 ∥ batch:19），而同设计把 `ledgerDbPath(cwd)` 改「走 `resolveLedgerRoot`（单源）」（LEDGER.md:430 ∥ batch:23「`ledgerDbPath` 归单源（删其内 `resolveProjectRoot ?? resolve` 自持一步）」）⇒ `resolveLedgerRoot(dir) → ledgerDbPath(dir) → resolveLedgerRoot(dir)` 循环，按文面不可实现（同款既有调用见 ledger.mjs:80）。 | 该臂改写为「以**候选目录自身路径**生成的键控库在盘」（键单源 = `ledgerKey(dir)` + `ledgerDirPath()`），并写明 `resolveLedgerRoot` 内部不得再经 `ledgerDbPath`。 |
| 3 | Document ownership / Requirements | 🔴 | 库臂把「工作区锚带存量键控库」重新立为根：判据无工作区排除（LEDGER.md:63）⇒ 该锚在祖先链即命中、返回锚自身（`basis = ancestor`）；而设计删去 `openLedger` 工作区抛（LEDGER.md:429「走 `resolveLedgerRoot`；**该抛退场**」）⇒ 写面落在该锚键控库。与在册面正相反：「**不充当台账项目**（键控库存在 ≠ 可作项目）」（LEDGER.md:623）· AC-M2-19（LEDGER.md:708，用例号待定），而 §2.1:66 自称「「工作区根不充当项目」不变」；同句括注「锚自身及祖先链皆无已注册者」恰把此类锚排除在本条之外。 | 判据补工作区（`projectRootView` `workspace`）排除句——与 §7.2 工作区根子例同一判据同处单源；并把 §2.1:66「不变」句与该排除句对齐（同一机制只留一处表述）。 |
| 4 | Clarity / Doc-state | 🟡 | `ledgerChildren` 状态三处互斥：§3.8:425「`ledgerChildren` / `MAX_SIBLING_SCAN` 常量随迁、`ledger.mjs` re-export 保公共面零改」∥ §7.1:610「\| `ledgerChildren(dir)`（**新增**） \| 目录下**已注册台账**的直接子目录」∥ §9:831「不改族发现同级枚举判据（`ledgerChildren` 零改——`agent/light-round.mjs` 候选枚举同源）」。且 §3.8:435 收敛序枚举要求「已注册者」（档 ∨ 库），现函数只认库（ledger.mjs:80）——若公共 `ledgerChildren` 随谓词放宽，其消费面 `agent/light-round.mjs:39` 候选枚举随之变而未登记。 | 三处收敛为一句：写明是否随迁、谓词是否放宽，并区分「收敛序内部枚举」与「公共 `ledgerChildren`（消费面 = 族发现 ∥ 轻通道闸）」；放宽则把 light-round 候选面同时落进受影响面。 |
| 5 | Requirements / Scope | 🟡 | 写门指针基准未入单源：基准 = `resolveProjectRoot(cwd) ?? resolve(cwd ?? ".")`（ledger-cmd.mjs:74），该档整体列零改（LEDGER.md:457「`thincoder-core/ledger-cmd.mjs`（179——回执形零改，`root` 由工具层合成）」）。本批退役工作区抛后该态在写门由不可达变可达 ⇒ 锚（工作区）与库根（子项目）不一致 ⇒ §6.1 口径 2「解析基准 = `resolveProjectRoot(cwd) ?? resolve(cwd ?? ".")`」「「同源」关系不变」与补注「工作区锚（`workspace`）⇒ 上游 `openLedger` 先报明（本门该态不可达——2026-10-15 收正）」（LEDGER.md:527-528）两句同批成假；§6.1 未入本批文档面（LEDGER.md:456 列 §2.1 ∥ §3.8 ∥ §7.1 ∥ §7.2 ∥ §8 ∥ §9「本档 §2.1 ∥ §3.8 ∥ §7.1 ∥ §7.2 ∥ §8 ∥ §9」）。 | 登记为协调项并定归属面（指针基准属 #1550 面 ∥ 本批收口）：至少写明退役该抛后 §6.1 口径 2 取哪一表达式、补注（LEDGER.md:528）删/改，避免「同一根两处描述」并存。 |
| 6 | Clarity / Acceptance | 🟡 | `resolveLedgerRoot → null` 的消费面行为未定义：判据只有祖先链命中与容器锚收敛两支，收敛序只写「恰一 / ≥2」（LEDGER.md:435），零已注册者无落句；旧抛已删（LEDGER.md:429），T120 只断言「工作区锚下 `add` / `query` **零命中**旧文案」（LEDGER.md:470）⇒ `null` 时读写面回执/文案无从断言。 | 补一句 `null` 的消费面处置（读面回什么、写面抛或明示、文案是否复用既有族）——兜底本体（怎么保证有档可推）可仍留范围外，只需定返回值契约使 T120 可判。 |
| 7 | Acceptance criteria | 🟡 | T115–T121（LEDGER.md:465-471）无一条覆盖「容器/工作区锚的族发现与标记不受影响」——恰是第 1、3 条的承载面（在位 T47–T51 / AC-M2-18 ∥ AC-M2-19 是否仍过未列）。 | 加一拍回归：容器锚（双项目夹具）下 `marker` / `discoverFamily` 结果与改前逐字同（若契约有意变更则改期望值并同步 §7.2 + AC）。 |
| 8 | Methodology / Doc-state | 🟡 | 需求档对位未落（已登记为上抛②，batch:41）：需求档 AC-M2-17 仍为旧行为，设计档 AC-M2-17 已就地改（LEDGER.md:706）⇒ 跨档滞后（R7b 设计档优先，不阻断，但落批前须有对位句）。 | 按已登记上抛②路由，把需求档 AC-M2-17 对位句随本批落齐（设计与需求同句同形）。 |
| 9 | Doc hygiene | 🔵 | 规范性面（判据行 / AC 行）留修订式标记「（2026-10-16 收正）」（LEDGER.md:62 · :706）；batch §2 内影响面仍留被同节修正作废的档数（batch:27「`ledger-cmd.mjs`（179 ⇒ +~8）」等，修正见 batch:47-48）。 | 无信息量的「（收正）」类标记可删（历史归记录面）；§2 影响面收成一份终形，避免读到两份互斥档数。 |

计数：🔴 3 · 🟡 5 · 🔵 1（共 9 条）。

VERDICT: changes-required

### 轮次 2（评审子代理）

**轮 2 复评（只验前一轮表：🔴 3 · 🟡 5 · 🔵 1）——结论 = pass（3🔴 全 Fixed · 🟡 4/5/6/7 Fixed · 🟡 8 Accepted · 🔵 9 Fixed；新 🔵 ×1 不阻断）**

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | LEDGER.md | 🔴 | Fixed | 族发现 ∥ 标记面**择一写死取祖先支**：`:69` 「**族发现 ∥ 标记面取「祖先支」**：`findProject` 走同一单源、**不带向下分支**（`descend: false`）」· `:440` 消费面表「薄委托 `resolveLedgerRoot(anchor, { descend: false })`（**取祖先支**——返回根、消「根报成锚」旧差；容器 ∥ 工作区锚 ⇒ `null`——见「择一」句）」· `:449` 择一句 + 被否支理由 · `:455` / `:477` · §7.1`:641/644` · §7.2`:655/656` 同步；§8 AC-M2-18 ∥ AC-M2-19 `:740-741` 逐字零改；补在位回归 `:505`（T122）。 |
| 2 | 2 | LEDGER.md | 🔴 | Fixed | 库臂**去自指**：`:65` 「**库臂**：**以该目录自身路径为键的键控台账库在盘**（键 = `ledgerKey(dir)`、库位 = `ledgerDirPath()`——**不得经 `ledgerDbPath`**，见 §3.8「无自指」句）」· `:431` 「**无自指**：本函数内部的「库在盘」判据只用 `ledgerKey(dir)` + `ledgerDirPath()` 拼得之库，**不得经 `ledgerDbPath`**（后者归本单源——互指即环，按文面不可实现）」· `:642/643` 导出契约同句。 |
| 3 | 3 | LEDGER.md | 🔴 | Fixed | 库臂**补工作区排除**：`:65` 「**排除工作区态**：该目录 `projectRootView` `workspace` ⇒ 库臂不成立（键控库存在 ≠ 可作项目——与 §7.2 工作区根子例**同判据同处单源**）」· `:70`「该锚不作根（库臂排除）」· §7.2`:656` 子例 · T122 后半拍 `:505`（幽灵库不立锚为根）。工作区判据核对无误 = manifest-discovery.mjs:114「`workspace`（锚自身无档 ∧ 下辖 **≥2** 项目 ⇒ `root` null + 下辖项目全列**按名排序**——工作区」。 |
| 4 | 4 | LEDGER.md | 🟡 | Fixed | `ledgerChildren` 三处状态收敛为**一句**（随迁 + 单谓词）：§3.8`:432`「`ledgerChildren` / `MAX_SIBLING_SCAN` 常量**随迁**本档、其谓词放宽为「**已注册**」」· §7.1`:643`「（**随迁**——自 `ledger.mjs` 迁入本档）| 目录下**已注册**（档 ∨ 库）的直接子目录」· §9`:863/865`「**族发现同级枚举 = 「已注册」单谓词**（`ledgerChildren` 随迁 `ledger-db.mjs`、谓词放宽」；消费面 `agent/light-round.mjs` 入随动面 `:483` ∥ `:494`（谓词放宽 ⇒ L2 行集零变、闸行为零变）。 |
| 5 | 5 | LEDGER.md | 🟡 | Fixed | 写门基准归单源：§6.1 口径 2 `:561`「2. **解析基准 = `resolveLedgerRoot(cwd)?.root ?? resolve(cwd ?? ".")`**」+「与库根**同源**——工作区抛退役后不存在「锚与根不一致」的例外态」；旧「（本门该态不可达——2026-10-15 收正）」补注已删；`ledger-cmd.mjs` 由零改面移入受影响面 `:480`「（**179**——§6.1 口径 2 基准表达式归单源 ⇒ **+1 行**；**回执形零改**——`root` 由工具层合成）」；其余同子表达式站点登记协调项 `:484-486`。 |
| 6 | 6 | LEDGER.md | 🟡 | Fixed | 无根契约补全（可判）：`:457`「祖先链无已注册者 ∧（`descend: true` 时）直接子目录亦无已注册者 ⇒ `resolveLedgerRoot` 返回 `null`」· `:459` 读面空账 · `:460` 写面抛 + 文案逐字 · `:461` `ledgerDbPath` 同文案 ∥ `ledger-read` 空集 · `:462` 旧文案退役；T120 `:503` 含 null 读写两拍 + 旧文案零命中。 |
| 7 | 7 | LEDGER.md | 🟡 | Fixed | 补一拍**容器/工作区锚回归**：`:505` T122（`findProject(锚)` = `null` ∧ `discoverFamily(锚).current` = `null` ∧ 标记 = 族求和——T47 同夹具；工作区锚 + 幽灵库仍不立锚为根）；用例面扩为 T115–T122（`:481`）。 |
| 8 | 8 | 2026-10-16-ledger-root-derivation.md | 🟡 | Accepted | 需求档对位 = **只登记路由与对位形**（非零理由）：`:44`「**需求侧对位（路由 · 不改需求档本体）**：需求档 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` 的 AC-M2-17 对位句 = **主 agent 笔**」——理由成立（本批「不在本批」含「不改需求档」；设计席零触；按 R7b 设计层优先，跨档滞后不阻断；父侧已接受 `:48`）。 |
| 9 | 9 | LEDGER.md / 本档 §2 | 🔵 | Fixed | 修订式标记**已删**（`:62`「**根解析面（读写同一推导）**：**项目根 = 自「动作目标路径」…」、§8 AC-M2-17 `:739` 均无「（收正）」）；§2 影响面**收成一份终形** `:28-33`（实现 5 档终值 ~220 一致，无互斥档数）。 |
| 10 | (new) | LEDGER.md | 🔵 | New | 协调项计数与列举不符：`:484`「同子表达式站点（三处）：」而 `:485`「`thincoder-core/ledger-migrate.mjs:97` / `:258` · `thincoder-core/ledger-variant-notice.mjs:42` · `thincoder-core/agent/light-round.mjs:48`」= 4 处 file:line（3 档 4 站点）——计数收正即可（不阻断）。 |

计数：🔴 0（原 3 全 Fixed）· 🟡 4 Fixed / 1 Accepted · 🔵 1 Fixed + 1 New（不计阻断）。
VERDICT: pass

### 轮次 3（评审子代理）

**轮 3 复评（重发 · 只验前一轮表 = §3 轮次 2 表：🔴3 🟡5 🔵1 + 新 🔵1）——结论 = pass（3🔴 全 Fixed 复验通过 · 🟡4/5/6/7 Fixed · 🟡8 Accepted · 🔵9 Fixed · 🔵10 Unfixed〔不阻断〕）**

本轮每条坐标均先与当轮实读盘面逐字核对（LEDGER.md 全文 + 本档 §2 全文）；判据只认静态/源面（未跑 doc-check——在效禁令）。

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | LEDGER.md | 🔴 | Fixed | 族发现 ∥ 标记面择一取祖先支：`:69`「**族发现 ∥ 标记面取「祖先支」**：`findProject` 走同一单源、**不带向下分支**（`descend: false`）」· `:440`「薄委托 `resolveLedgerRoot(anchor, { descend: false })`（**取祖先支**——返回根、消「根报成锚」旧差；容器 ∥ 工作区锚 ⇒ `null`——见「择一」句）」· `:449` 择一句 + 被否支（「标记退化为单项目」）+ 受影响清单（AC-M2-18 ∥ AC-M2-19 零改、T47–T51 期望零改）· `:455` descend 面两问 · §7.1`:641`／`:644` · §7.2`:655`／`:656` · §8 AC-M2-17 `:739` 同步；补回归 `:505`（T122）。 |
| 2 | 2 | LEDGER.md | 🔴 | Fixed | 库臂去自指：`:65`「**库臂**：**以该目录自身路径为键的键控台账库在盘**（键 = `ledgerKey(dir)`、库位 = `ledgerDirPath()`——**不得经 `ledgerDbPath`**，见 §3.8「无自指」句）；**排除工作区态**：该目录 `projectRootView` `workspace` ⇒ 库臂不成立」· `:431`「**无自指**：本函数内部的「库在盘」判据只用 `ledgerKey(dir)` + `ledgerDirPath()` 拼得之库，**不得经 `ledgerDbPath`**（后者归本单源——互指即环，按文面不可实现）」· `:642` 导出契约同句。循环定义已消。 |
| 3 | 3 | LEDGER.md | 🔴 | Fixed | 库臂补工作区排除 + 与 §7.2 同判据：`:65`（同条尾句）· `:70`「⇒ **该锚不作根**（库臂排除——键控库存在 ≠ 可作项目）；族发现面按容器形（**零改**）；**写面的落根 = §3.8 收敛序**（**不落锚**）」· §7.2`:656` 工作区根子例（判据单源 = §2.1 库臂排除）· T122 后半拍 `:505`（幽灵库不立锚为根）。在册面 AC-M2-19 `:741` 逐字未动。 |
| 4 | 4 | LEDGER.md | 🟡 | Fixed | `ledgerChildren` 三处状态收敛为「随迁 + 单谓词」一句：§3.8`:432`「`ledgerChildren` / `MAX_SIBLING_SCAN` 常量**随迁**本档、其谓词放宽为「**已注册**」（§2.1 判据——**单谓词**」· §3.8`:443` 消费面表 row · §7.1`:643`「（**随迁**——自 `ledger.mjs` 迁入本档）」+「谓词 = §2.1「已注册」单谓词」· §9`:865`「**族发现同级枚举 = 「已注册」单谓词**（`ledgerChildren` 随迁 `ledger-db.mjs`、谓词放宽」∥ §9`:863` 同级枚举上限同句；消费面 `agent/light-round.mjs` 入随动面 `:483` ∥ `:494`（L2 行集零变 ∥ 不进闸——行为零变，登记齐）。 |
| 5 | 5 | LEDGER.md | 🟡 | Fixed | 写门基准归单源：§6.1 口径 2 `:561`「2. **解析基准 = `resolveLedgerRoot(cwd)?.root ?? resolve(cwd ?? ".")`**（**= 根推导单源的同一子表达式**——§2.1 / §3.8；解析基准本身不归一）」+「工作区锚 ∥ 容器锚下基准 = 推导所得项目根（与库根**同源**——工作区抛退役后不存在「锚与根不一致」的例外态；同日同式子站点清单 = §3.8「协调项」）」；旧「该态不可达」补注已删（全档 grep「2026-10-15 收正」零命中）；`ledger-cmd.mjs` 由零改面移入受影响面 `:480`「§6.1 口径 2 基准表达式归单源 ⇒ **+1 行**；**回执形零改**——`root` 由工具层合成」（零改面 `:487` 已不含该档）；其余同子表达式站点登记协调项 `:484-486`。 |
| 6 | 6 | LEDGER.md | 🟡 | Fixed | 无根契约补全（可判）：`:457`「祖先链无已注册者 ∧（`descend: true` 时）直接子目录亦无已注册者 ⇒ `resolveLedgerRoot` 返回 `null`」· `:459` 读面空账（`ledgerQuery` = `[]`、`ledgerCount` = 0）· `:460` 写面抛 + 文案逐字 · `:461`「无根 ⇒ 前者抛**同一**文案（键需根）、后者回 `projects: []`（空集）——**不落兜底根**」· `:462` 旧文案退役 · §3.8 收敛序 `:445` 零已注册子目录 ⇒ `null` · T120 `:503`「**无根（`null`）**：写面 `add` 抛新文案（逐字、零落盘零建库）∧ 读面 `query` = `[]` / `count` = 0」。 |
| 7 | 7 | LEDGER.md | 🟡 | Fixed | 补一拍回归 T122：`:505`「T122 回归：容器锚（双项目夹具）下族发现 ∥ 标记与改前逐字同——`findProject(锚)` = `null` ∧ `discoverFamily(锚).current` = `null` ∧ 标记 = 族内两池分列求和（T47 同夹具同断言）」+ 工作区锚幽灵库半拍；用例面 `:481` 扩为 T115–T122。 |
| 8 | 8 | 本档 | 🟡 | Accepted | 需求档对位 = 只登记路由与对位形（有理由的非修）：`:44`「**需求侧对位（路由 · 不改需求档本体）**：需求档 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` 的 AC-M2-17 对位句 = **主 agent 笔**」+ 对位形逐字 + `:48`「父侧八条全接受」+ `:59` 号 8 处置行。理由成立：本批不在册清单 `:13` 含「不改需求档」⇒ 设计席零触；路径已收正；按 R7b 设计层优先，跨档滞后不阻断。 |
| 9 | 9 | LEDGER.md / 本档 §2 | 🔵 | Fixed | 修订式标记已删：`:62` 判据句现为「**项目根 = 自「动作目标路径」（缺省 = 会话锚 `cwd`）起，沿祖先链向上（含自身）取的最近一个「已注册」目录**」（无标记）· §8 AC-M2-17 `:739` 同无标记；本档 §2 影响面收成一份终形 `:28-33`（`:29`「`ledger-cmd.mjs`（179 ⇒ **+1**——§6.1 口径 2 基准归单源；回执形零改）」与设计档 `:476`／`:480` 一致，无互斥档数）。 |
| 10 | 10 | LEDGER.md | 🔵 | Unfixed | 协调项计数与列举不符（零理由未修 · **不阻断**）：`:484`「台账面其余「解析基准 = `resolveProjectRoot(cwd) ?? resolve(cwd ?? ".")`」同子表达式站点（三处）：」而 `:485`「`thincoder-core/ledger-migrate.mjs:97` / `:258` · `thincoder-core/ledger-variant-notice.mjs:42` · `thincoder-core/agent/light-round.mjs:48`」= 4 处 file:line（3 档 4 站点）——计数收正即可，处置（随该档下次触碰同源化）不受影响。 |

计数：🔴 0（原 3 条全 Fixed）· 🟡 4 Fixed / 1 Accepted · 🔵 1 Fixed + 1 Unfixed（不阻断）。
旁核（本轮实读）：受影响面各行数标注齐备且与设计档一致（`ledger-db.mjs` 175 ⇒ ~220 · `ledger.mjs` 187 · `ledger-tools.mjs` 260 · `ledger-read.mjs` 95 · `ledger-cmd.mjs` 179 ⇒ +1 · 零改面 `manifest-discovery.mjs` 135 / `ledger-surface.mjs` 97 / `ledger-migrate.mjs` 301）；先例行（`:464-468`）∥ 勘察证据行（`:470-471`）齐备。
VERDICT: pass

## §4 用户批准（主 agent）

**用户批准（2026-10-16 19:18）**：用户逐字「**批**」——批准本批设计（判据句「读写同一推导」· 「已注册」双臂 ∧ 非工作区态 · 族发现取祖先支 · 无根契约 · 5 档实现面），授权进入实施。

**批准前置**：设计评审 `#16`（轮 1）changes-required（🔴3 🟡5 🔵1）⇒ 修正轮 `#18` 全落 ✓ ⇒ 轮 2/轮 3 复评（`#20`/`#21`）**pass** ✓（令牌签发于轮 3 ✓）。

**批准时点**：实施**先于**本批准记录落盘（`eng-coder #22` 报告 19:34 · 本节 19:52 补记）——父侧 19:18 已给「批」+「自动跑到收工」令，实施在其后发动；本节为**事后如实记录**，非事前授权（如有争议以用户 19:18 原话为准）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（含 fix 轮三号同拍修（3 实现档 + 一次性单测档已删）；内部发散审计 1 轮 + 代码评审 2 轮，终态 clean）


### §5.1 交付摘要（执行人 = eng-coder · 2026-10-16）

**单源**（判据句 = 设计档 `LEDGER.md` §2.1 / §3.8）：`thincoder-core/ledger-db.mjs` 新导出 `resolveLedgerRoot(target, { descend = true }) → { root, basis } | null`（判据句实现 `:100`；「已注册」两臂 = 档臂 ∧（库臂 ∧ 非工作区态）`:56-60`；库臂经内部 `keyedDbFile` = `ledgerKey(dir)` + `ledgerDirPath()` 拼得，**不经 `ledgerDbPath`** ⇒ 无自指环）。

**消费面**：`openLedger`（工作区抛退场 · 写面抛 / 读面空账 · 目录不存在真错先抛，`ledger-db.mjs:230` 起）· `ledgerDbPath`（归单源 + 无根同一文案，`:128`）· `findProject`（薄委托 `resolveLedgerRoot(anchor, { descend: false })` ⇒ 容器 ∥ 工作区锚返回 `null`，`ledger.mjs:49`）· `ledger-read.mjs:52`（单范围根走单源；无根 ⇒ `projects: []`）· `cwdOf` **零改**（锚源）· `ledgerChildren` / `MAX_SIBLING_SCAN` **随迁** + 谓词放宽「已注册」（`ledger-db.mjs:64/:69`），`ledger.mjs:150` re-export 保公共面**形**零改。

**报明形态**：`basis === 'descendant'` ⇒ `add` / `update` / `close` / `count` 对象形回执携 `root`（`ledger-tools.mjs:23` helper `reportedRoot`，供值面 = 核同一单源）；`basis === 'ancestor'` ⇒ 回执逐字零改；`query` 行集形不携。§6.1 口径 2 基准归单源（`ledger-cmd.mjs:73` = `resolveLedgerRoot(cwd)?.root ?? resolve(cwd ?? ".")`）；`cwd` 描述句换写（`ledger-tools.mjs:92` `CWD_DESC`）。

**文件与行数（node 实读 · 改前 ⇒ 改后）**：`ledger-db.mjs` 175 ⇒ **253** · `ledger.mjs` 187 ⇒ **155** · `ledger-tools.mjs` 260 ⇒ **275** · `ledger-read.mjs` 95 ⇒ **94** · `ledger-cmd.mjs` 179 ⇒ **178** ⇒ 全列最高 275 ≪ 500 顾问线 ⇒ **零拆分义务**保持（触面单行最长 278 字符 < 300）。

### §5.2 决策透明表

| 项 | 决策 | 依据 / 裁定 |
|---|---|---|
| `buildScan` 取根（设计 §3.8 消费面表**未列**该面） | `root` / `name` / `ledger` 一律取 `resolveLedgerRoot(anchor)` 推导根；无根 ⇒ `ledger: null`（不落兜底根）、`root` 回落锚（该 scan 不进族枚举） | 不改则 `ledgerDbPath` 新增的「无根即抛」必经 `ledger.mjs:98` ⇒ 活调用面（desktop `project-info.mjs:45 ledgerRead`）抛错回归 ⇒ **无可行回退支**；父侧 2026-10-16 裁定 = 设计缺列的**必然随动**（接受 ✓），设计侧补记 = 设计席笔 |
| 无根检查次序 | `existsSync(start)` **先于**推导 | 保「目录不存在的真错照抛」文案与语义逐字零改（T120 ③） |
| T120「工作区锚」子例 | 初版夹具实为项目锚 ⇒ 改为自身无档 ∧ 下辖 ≥2 项目（真 workspace），并断言 `projectRootView(...).state === 'workspace'` | 内部审计发现（LOW）⇒ 用例须真走到旧抛面 |
| 用例档寿命 | 跑完即删（零留档） | 设计档 §3.8「一次性验收 · 零留档（用毕即删）」+ 需求侧「①落手 = 写、跑与删——验证完成后即删」 |

### §5.3 验收读数

- **靶向单跑**（验收 ②）：`cd thincoder/thincoder-core && node --test test/ledger-root-derivation.test.mjs` ⇒ **tests 8 · pass 8 · fail 0 · duration_ms 367**。逐条（验收 ①）：T115 嵌套两档 ⇒ 取最近者（子优于根）✓ · T116 读写同值（`findProject().root` = `resolveLedgerRoot().root`，`findProject().ledger` = `ledgerDbPath(anchor)`）✓ · T117 容器锚（双已注册子目录、恰一有库）⇒ 取有库者 + `add` 不抛且回执 `root` = 该子根 + 不落锚（锚键库不存在）✓ · T118 有库者 ≥2 ⇒ 名序首者 + 回执携 `root`（报明）✓ · T119 恰一已注册子目录 ⇒ 取之（且 `findProject` 不向下 = `null`）✓ · T120 旧文案（`请显式给出项目根` / `下辖` / `cwd=`）在工作区锚 ∥ 容器锚下**零命中**；无根（`null`）写面 `add` 抛新文案**逐字**且零落盘零建库、读面 `query` = `[]` / `count` = 0 / `ledgerDbPath` 同文案 / `ledgerExport` = `{projects: []}`；目录不存在真错照抛 ✓ · T121 自明路径五 action 回执逐字零改（无 `root` 键）+ `ledgerKey` 键值恒等 ✓ · T122 容器锚下 `findProject` = `null` ∧ `discoverFamily.current` = `null` ∧ 标记 = 族内两池分列求和（`台账 3·1`）+ 工作区锚幽灵库不立锚为根（`findProject` 仍 `null`）∧ 写面不落锚（落收敛序之根）∧ 幽灵库零写 ✓。
- **仓门读数**：`cd thincoder/thincoder-core && node test/run.mjs` ⇒ **tests 8 · pass 8 · fail 0**（同一档，删档前读数）。
- **真机（只读）冒烟 · 本仓锚**：`resolveLedgerRoot(d:\teamcode)` = `d:\teamcode\thincoder`（`basis = descendant`）· `findProject(d:\teamcode)` = `null` · `discoverFamily(d:\teamcode).current` = `null` · 族 = `[thincoder, thincoder.com]` · `ledgerChildren(d:\teamcode)` 同集 · `ledgerQuery(thincoder)` = 1588 行 · `ledgerCount` = 108 · `ledgerExport(family)` = [thincoder 1588 行, thincoder.com 5 行] ⇒ 与设计随动面 ①/② 所述口径一致。
- **改动档语法**：`node --check` × 5 ⇒ 全过。
- **一次性单元测试档** = `thincoder-core/test/ledger-root-derivation.test.mjs`（新建 205 行 · T115–T122，夹具 = `os.tmpdir()` 临时树 + `_setLedgerDirForTest` 注入库目录 ⇒ 真实用户目录零触碰）——**已删（零留档 · 用毕即删）**；读数即上行两行。

### §5.4 审计与代码评审轮次与终态

| 轮 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部发散审计（explore） | `DEVIATIONS`（2 条 LOW）：① `buildScan` 取根未入设计消费面表 ② T120 工作区子例实为项目锚 | ① 已上抛父侧并获裁定（接受，设计侧补记）；② 已修（夹具改真 workspace + 断言） |
| 1 | 内部代码评审（advisor · type=code） | **VERDICT: pass** —— 🔴 0 · 🟡 3 · 🔵 3 | 🟡 三条均非 must-fix（① migrate 计划基准与实开库在容器 ∥ 工作区锚下可分叉 = 协调项登记不足 ② `light-round.mjs:42` 注释随本批成假 = 跨档陈述滞后 ③ `read-data.mjs:100` 取 `ledgerDbPath` 未登记消费面）⇒ 表外档，本批不改、随报告路由；🔵 ② 已修（`ledger.mjs:71-73` 注释补回落规则），🔵 ①③ 随交付报告 / 收口行数收正 |

**fix round**：1 次自修（T120 夹具 + `buildScan` 注释），未用满 5 轮额度。**终态 = clean**。

### §5.5 未做 / 偏离登记

- **本轮不做**：兑现面 / 冷启动 / 「怎么保证有 manifest 可推」（用户明示 = 另命题）· 协调项三档（`ledger-migrate.mjs` / `ledger-variant-notice.mjs` / `agent/light-round.mjs`）**零触** · 表外档零触 · `docs/**` 零触 · 未跑 `doc-check`（用户 2026-10-15 12:10 在效禁令）。
- **设计面表述与实盘不符（登记路由）**：设计档「文档 / 描述面」列 `thincoder-core/tool-docs/ledger.md`（`cwd` 描述句）——实读该档 6 行仅 action 要点，**无 cwd 句**；模型可见 cwd 文案实际单点 = `ledger-tools.mjs:92` `CWD_DESC`（已按新推导换写）⇒ 该文档面零动作。
- **行数标注收正（待收口）**：设计档 §3.8 受影响面「`ledger-db.mjs` ⇒ 预计 +~45 ⇒ ~220」「`ledger.mjs` ⇒ 预计 ±~15」与实读 253 / -32 有差；贴线判不变。
- **[上抛·待裁] ①** 「`buildScan` 取根」= 设计缺列的必然随动：请父侧在设计档 §3.8 消费面表 + `ledger.mjs` 受影响行补记（**设计席笔**；本批 `docs/**` 零触）。
- **[上抛·待裁] ②** 评审 🟡①（migrate 面计划基准 `resolveProjectRoot(cwd) ?? resolve(cwd ?? ".")` 与实开库在容器 ∥ 工作区锚下可分叉，报表 / 备份档与实际写入档不一致）归属 = 父侧协调项路由（三档本批不触，故未改码）。
- **[上抛·知会] ③** 两条随本批产生的跨档陈述滞后 / 未登记消费面：`agent/light-round.mjs:42` 注释「`openLedger` 工作区报明拒 = AC-M2-17」已成假；`thincoder-cli/src/acp/read-data.mjs:100` 直取 `ledgerDbPath(cwd)`（新抛面下该拍 `check()` 拒绝被调用点 `.catch(() => {})` 吞掉 ⇒ 该观察域 `ledger/changed` 静默失效）。

### §5.6 fix 轮（来源 = 父侧对上一轮交付报告三条上抛的裁定 · 2026-10-16 · 执行 = eng-coder）

**裁定**：号 1 / 2 / 3 **本批同拍修**（「本批新开的坑不许推给以后顺手」；号 3 属静默失效 ⇒ 必当场收）。范围 = **点修**（按号 1..3 逐个落，不做全量复查、不扩到 3 号之外）。

**逐号改动（号 → 改动 `file:line`）**：

| 号 | 改动 | `file:line` |
|---|---|---|
| 1 | 迁移计划基准归根推导单源（与实开库 `openLedger` 同源）：`resolveProjectRoot(cwd) ?? resolve(cwd ?? ".")` ⇒ `resolveLedgerRoot(cwd)?.root ?? resolve(cwd ?? ".")`；同档 import 补 `resolveLedgerRoot`；头注随改 | `thincoder-core/ledger-migrate.mjs:97`（+ `:95` 注释 · `:15` import） |
| 2 | 注释收正为现役语义：「`openLedger` 工作区报明拒 = AC-M2-17」⇒「该态判据 = 根推导单源『已注册』的库臂排除（键控库在盘 ≠ 可作项目）」 | `thincoder-core/agent/light-round.mjs:42` |
| 3 | 观察域根改走判据单源且不再抛：`fileSig(ledgerDbPath(cwd))` ⇒ `root = resolveLedgerRoot(cwd)?.root` + `root ? fileSig(ledgerDbPath(root)) : "0"` | `thincoder-cli/src/acp/read-data.mjs:100-103` |

**自证（现文一行，逐号）**：
- 号 1：`ledger-migrate.mjs:97` = `const projectRoot = resolveLedgerRoot(cwd)?.root ?? resolve(cwd ?? ".")`（逐字 = 写门口径 2 同式子表达式 `ledger-cmd.mjs:73`）。
- 号 2：`light-round.mjs:42` = `// 该态判据 = 根推导单源「已注册」的库臂排除（键控库在盘 ≠ 可作项目）——既定观察态，非读错）。`（全档 `openLedger` / `AC-M2-17` / `报明` 零命中）。
- 号 3：`read-data.mjs:102-103` = `const root = ledgerDb.resolveLedgerRoot(cwd)?.root` / `const ledgerSig = root ? fileSig(ledgerDb.ledgerDbPath(root)) : "0"` ⇒ 无根该拍不再抛（不再被 `:118` `.catch(() => {})` 吞掉）；有根时 `ledgerDbPath(root)` 内部必取祖先臂 ⇒ 无抛面残留。

**单测（靶向 · 一次性 · 已删）**：`cd thincoder/thincoder-core && node --test test/ledger-root-derivation.test.mjs` ⇒ tests 3 · pass 3 · fail 0 · duration_ms ≈ 306；仓门 `node test/run.mjs` ⇒ tests 3 · pass 3 · fail 0。用例 = T-M1（号 1：容器锚 + 下辖 ≥2 带档子项目 ⇒ 计划基准 = 推导根，且按计划目标真开库后 `plan.targetPath` 在盘）· T-M3a（号 3：无根锚下 `check()` 不抛 + 第二拍同）· T-M3b（号 3：库一旦在盘 ⇒ `ledger/changed` 上报）。号 2 为纯注释 ⇒ 无对应用例（自证 = 现文一行）。
**判别力实测**：临时退回旧表达式后 T-M1 必红（`plan.projectRoot` = 锚 vs = `aaa`）、T-M3a 必红（`check()` 抛「未能推导项目根」），随后复绿 ⇒ 用例真走改动路径，非假绿。
**改动档语法**：`node --check` ×4 全过。

**决策透明表（本轮）**：

| 项 | 决策 | 依据 |
|---|---|---|
| 号 3「无静默吞错」落法 | 消灭触发源（无根 ⇒ 指纹恒 `"0"`，不抛），不删 `.catch`、不向定时器面加机制 | 父侧口径「要么正常上报、要么显式可见地报不可用」取「正常上报」支；`:118` 吞错点本体属既有面、非本号对象；「不加机制 / 不扩参数面」是禁令 |
| 号 3 无根时指纹取 `"0"`（不自拼 cwd 键库路径） | 无根 ⇒ 该域无台账库 | 设计「无根契约：读面 = 空账」+ `ledgerDbPath`「键需根、不产第二答案」⇒ 消费面不自造第二路径 |
| 号 1 兜底支（`?? resolve(cwd ?? ".")`）保留 | 表达式逐字随设计 §6.1 口径 2 | 父侧验收 ① 要求逐字同式；无根锚下 dry-run 照出计划、confirm 必拒（fail-closed）属设计未覆盖面 ⇒ 登记路由（未决②） |
| 单测档建 / 跑 / 删 | 上一轮该档已删 ⇒ 本轮按靶向重建 3 用例，跑完即删（零留档） | 父侧「只补与 1..3 号对应用例（靶向；零留档 · 用毕即删）」+ 设计 §3.8「一次性验收 · 零留档」 |

**审计与代码评审轮次与终态**：

| 轮 | 类型 | 结论 | 处置 |
|---|---|---|---|
| 1 | 内部发散审计（explore · read-only） | `clean`（四类偏差均无）+ 3 咨询项 | A（`:118` `.catch` 留存）= 本号对象外（未决③）· B（设计档 §3.8 协调项 / 零改面仍列 `ledger-migrate.mjs:97` 与 `ledger-migrate.mjs`）⇒ 未决① · C（`LEDGER.md` mtime 晚于本轮改动）⇒ 未决④ |
| 1 | 内部代码评审（advisor · type=code） | `pass` | 🟡 1（单测号 1 用例无判别力）+ 🔵 3（read-data 注释越述 · 单测头注模块实例断言未验证 · migrate 无根兜底支） |
| fix round | 自修 1 次（未用满 5 轮）：单测夹具改 ≥2 带档子项目 + 补「真开库」一拍；`read-data.mjs:101` 注释收正；单测头注改条件句 | — |
| 2 | 内部代码评审（advisor · type=code · 只核前一轮 4 条） | `pass`（3 条 Fixed + 1 条 Accepted；无新 🔴 / 无 must-fix 🟡） | 全部闭合 |

**终态 = clean**。

**本轮不做（显式）**：全量复查 ✗ · 3 号之外的档 ✗（`thincoder-core/ledger-variant-notice.mjs:42` · `agent/light-round.mjs:48` · `thincoder-core/ledger-migrate.mjs:258` 三个同式子站点仍零触）· `docs/**` ✗ · `doc-check` ✗（在效禁令：用户 2026-10-15 12:10）· 加机制 / 扩参数面 ✗ · 需求档 ✗。

- **[上抛·待裁] ①（设计档陈旧句 · 路由）**：`docs/core/design/LEDGER.md` §3.8「协调项」仍列 `thincoder-core/ledger-migrate.mjs:97` 为「本批不触」，「零改面」仍列 `ledger-migrate.mjs`（理由「`openLedger(plan.projectRoot)` 入参已是根」）——号 1 已改 `:97`（该句所述恰是已修的分叉源）⇒ 两句成陈旧句，归属 = 设计席笔。
- **[上抛·待裁] ②（设计未覆盖面 · 路由）**：无根（`null`）锚下 `ledger migrate` dry-run 照出计划（`Target:` = 锚自身键库）而 confirm 必拒；设计「无根契约」只列 `openLedger` / `ledgerDbPath` / `ledger-read`，未覆盖 migrate 面 ⇒ 请设计席补一句（或判「本面 dry-run 同拒」）。
- **[上抛·知会] ③**：`read-data.mjs:118` 的 `.catch(() => {})` 逐字未改——本号触发源已消；该拍其余失败（如 `listBatchRecords` 抛）仍静默，属既有面、非本号对象。
- **[上抛·知会] ④**：`docs/core/design/LEDGER.md` 的 mtime 晚于本轮四档改动，内容零反射本轮三点（含上轮 §5 上抛① 的 `buildScan` 补记）⇒ 判为另一会话（设计席）所写，本会话未触碰 `docs/**`；归因无法用静态读单方闭合，请父侧一笔确认。

## §6 验证与收口（父代理）

## 验证与收口（台账批 2026-10-16）

**交付判定**：实现已落并验证 ✓ —— `eng-coder #22`（5 档 + `buildScan` 必然随动）+ `eng-coder #24`（三处同拍修）+ `eng-designer #25`/`#26`（设计侧补记）。

| 面 | 读数（源面 / 静态面） |
|---|---|
| 单测（一次性 · 已删） | `cd thincoder/thincoder-core && node --test test/ledger-root-derivation.test.mjs` ⇒ **8/8** ✓（T115–T122）+ fix 轮 **3/3** ✓（含**判别力实测**：退回旧式必红 ⇒ 真绿 ✓） |
| 真机冒烟（只读） | `resolveLedgerRoot(d:\teamcode)` = `thincoder`（`descendant`）· `findProject` = `null` · 族 = `[thincoder, thincoder.com]` · `ledgerQuery` = 1588 行 / `ledgerCount` = 108 ✓ |
| 语法面 | 全部改动档 `node --check` 过 ✓ |
| 零误伤 | 改动集 ⊆ 设计 §3.8 受影响面表 ✓（含本批收正后的 6 档 + 缝档归属 = 父侧笔面） |

**收口核对**：① 台账行 `#1588`（两步核销 ✓）；② 指针resolven ✓（本档 §2 = 设计档 §3.8 单源）；③ 暂缓批复核：无；④ 冻结档残留扫描：无（本批非冻结档）。

**未决（指针化，不散在正文）**：① `#1589`（`read-data.mjs:118` 静默吞错收窄——既有面 ✓ 已登台账 ✓）；② 协调项 3 站（`ledger-migrate.mjs:258` · `ledger-variant-notice.mjs:42` · `light-round.mjs:48`）随各自下次触碰同源化 ✓（设计 §3.8「协调项」为单源）；③ `LEDGER.md` 8 处 >300 存量行（既有 · 另轮清账）。
