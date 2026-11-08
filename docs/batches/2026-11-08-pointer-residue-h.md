# 2026-11-08 · pointer-residue-h
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-08 · 来源 = 用户 2026-11-08 12:34「长尾批可以开批处理吧，一样逻辑也分分批，并发上限还有，不用限制四个」——H 簇：`docs/server` 长尾 13 档。
> 台账 = #2181（core · 归批）。前情 = docs/batches/2026-11-08-pointer-debt.md（已收口 2026-11-08）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（13 档 26 处（锚 23 · 段落 3）按 R1–R6 分流：R1 12 · R2 5 · R3 3 · R4 3；改前读数 26 即 A1 的红侧）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 本批条目（覆盖）

| # | 条目 | 射程 | 判据锚 |
|---|---|---|---|
| 1 | R1：多候选 10 处，按上下文定一支，写仓根全路径 | 覆盖 | 本文「处置表」 |
| 2 | R2 ∥ R3 ∥ R4：非仓内名 13 处，改成叙述形 | 覆盖 | 同上 |
| 3 | 段落 3 处（`docs/server/design/webui/READINGS.md`）：拆句不改义 | 覆盖 | 「射程口径」 |
| 4 | 全量 `引缺` 仍为 5（改句打断别处逐字引文即为新红） | 覆盖 | 「判据」A2 |
| 5 | 清单外各档的段落 ∥ 行号坐标 | **不在本批** | 父侧三类判法第三条 |

**射程口径（本批唯一一处与父侧表述不同，理由在此）**：父侧三类判法写「段落 ∥ 行号不在本批射程」，父侧验收写「目标 hits 0」。两句在 `docs/server/design/webui/READINGS.md` 上相撞——那 3 条段落命中就在本批 13 档清单之内，不清则 hits 恒为 3。

本席按验收执行：**段落 3 处一并清**，清法只有拆句与起行，一字不改义。行号坐标在本清单内实读 **0 处**，无对象可清，故无冲突。

### 尺子与改前读数

会话里的 `doc_check` 是全局旧构建，读数不作判据（B 簇实测两把尺子差三倍）。本批一律取盘上引擎：

```text
node -e "import('./thincoder-core/doc-check/index.mjs').then(m=>{const r=m.runDocCheck(process.cwd(),{docs:[…这 13 档…],mode:'gate'});console.log(r.report.split('\n')[0],JSON.stringify(r.hits))})"
```

改前读数（2026-11-08 12:4x，本席实跑）= `命中 26 条（锚 23 · 文字太长，难于阅读 3 · 行太长 0）`，`hits = {"total":26,"anchors":23,"paragraph":3}`。

| 档 | 锚 | 段落 | 档 | 锚 | 段落 |
|---|---|---|---|---|---|
| `docs/server/design/gateway/API.md` | 3 | 0 | `docs/server/design/webui/MCP.md` | 2 | 0 |
| `docs/server/design/gateway/PUBLICNET.md` | 2 | 0 | `docs/server/design/webui/READINGS.md` | 2 | 3 |
| `docs/server/design/project/PROJECTS.md` | 2 | 0 | `docs/server/requirements/PROJECT.md` | 2 | 0 |
| `docs/server/design/store/STORE.md` | 2 | 0 | `docs/server/design/client/CLIENT.md` | 1 | 0 |
| `docs/server/design/webui/ADMIN.md` | 2 | 0 | `docs/server/design/ledger/LEDGER.md` | 1 | 0 |
| `docs/server/design/webui/LEDGER.md` | 2 | 0 | `docs/server/design/webui/ME.md` | 1 | 0 |
| `docs/server/design/webui/SANDBOX.md` | 1 | 0 | **合计** | **23** | **3** |

### 处置表（23 条锚，按 R1–R6 归类）

R1–R6 的原词与穷举见父侧判法；本表只填每一处落哪一条、改成什么。**行号只作定位**，实施侧以引擎报面为输入。

| # | 档 · 行 | 这一处是什么 | R | 改成什么 |
|---|---|---|---|---|
| 1 | `docs/server/design/client/CLIENT.md` · 45 | 某批自持、收口即删的单元测试档 | R3 | 角色叙述：不写档名 |
| 2 | `docs/server/design/gateway/API.md` · 28 | 页面壳 `app.mjs` | R1 | `thincoder-server/public/app.mjs` |
| 3 | `docs/server/design/gateway/API.md` · 376 | 装配过滤 `chat.mjs` | R1 | `thincoder-server/src/agent/chat.mjs` |
| 4 | `docs/server/design/gateway/API.md` · 500 | 本域 `proxy.mjs` | R1 | `thincoder-server/src/gateway/proxy.mjs` |
| 5 | `docs/server/design/gateway/PUBLICNET.md` · 158 | 本批自持、收口删除的单元测试档 | R3 | 角色叙述：不写档名 |
| 6 | `docs/server/design/gateway/PUBLICNET.md` · 258 | OPS 行数预算里的 `config.mjs` | R1 | `thincoder-server/src/ops/config.mjs` |
| 7 | `docs/server/design/ledger/LEDGER.md` · 104 | 通配形 `*.test.mjs` | R2 | 叙述：该域零测试档 |
| 8 | `docs/server/design/project/PROJECTS.md` · 22 | 沿革句里的沙盒任务面模块 | R4 | 叙述：「自沙盒任务面逐字抽出」 |
| 9 | `docs/server/design/project/PROJECTS.md` · 139 | 同一模块的行数预算行 | R4 | 整行删（对象已不在仓） |
| 10 | `docs/server/design/store/STORE.md` · 709 | 拆案拟建、未落的档 | R2 | 拆案保留，不写档名 |
| 11 | `docs/server/design/store/STORE.md` · 710 | 同 #8 | R4 | 叙述 |
| 12 | `docs/server/design/webui/ADMIN.md` · 153 | 页面壳 `app.mjs` | R1 | `thincoder-server/public/app.mjs` |
| 13 | `docs/server/design/webui/ADMIN.md` · 154 | 页面壳 `app.mjs` | R1 | `thincoder-server/public/app.mjs` |
| 14 | `docs/server/design/webui/LEDGER.md` · 3 | 板总览 `PROJECT.md` | R1 | `docs/server/design/PROJECT.md`（实读：§3 = 文档地图，与本行括注对上；需求层那一档无此节） |
| 15 | `docs/server/design/webui/LEDGER.md` · 56 | 花括号模板的 i18n 部件 | R1 | `thincoder-server/public/i18n-zh-ledger.mjs` ∥ `thincoder-server/public/i18n-en-ledger.mjs`（两档在盘） |
| 16 | `docs/server/design/webui/MCP.md` · 50 | 预案备查、未建的抽件 | R2 | 预案保留，不写档名 |
| 17 | `docs/server/design/webui/MCP.md` · 56 | 花括号模板的 i18n 部件 | R1 | `thincoder-server/public/i18n-zh-mcp.mjs` ∥ `thincoder-server/public/i18n-en-mcp.mjs`（两档在盘） |
| 18 | `docs/server/design/webui/ME.md` · 111 | 某批自持、收口即删的单元测试档 | R3 | 角色叙述：不写档名 |
| 19 | `docs/server/design/webui/READINGS.md` · 25 | 页面件 `dom.mjs` | R1 | `thincoder-server/public/dom.mjs` |
| 20 | `docs/server/design/webui/READINGS.md` · 34 | 页面壳 `app.mjs` | R1 | `thincoder-server/public/app.mjs` |
| 21 | `docs/server/design/webui/SANDBOX.md` · 115 | 页面壳 `app.mjs` | R1 | `thincoder-server/public/app.mjs` |
| 22 | `docs/server/requirements/PROJECT.md` · 426 | 已撤场的独立页件 | R2 | **需求面**：AC-30「独立页零承载」仍成立 ⇒ 叙述形，需求句零变 |
| 23 | `docs/server/requirements/PROJECT.md` · 455 | 盒内运行期档名 | R2 | **需求面**：AC-57 ③ 成立 ⇒ 「盒内状态档」，说明它在哪一类 |

**分型计数**：R1 = 12（#2 3 4 6 12 13 14 15 17 19 20 21）· R2 = 5（#7 10 16 22 23）· R3 = 3（#1 5 18）· R4 = 3（#8 9 11）· 合计 23。

R5（站点仓件）本清单内零对象——13 档里没有一处指向站点仓。

### 非仓内 token 原文（围栏内只作核对用，文档面按上表改）

```text
#1  docs/batches/2026-10-15-team-token-rotation.test.mjs      收口即删的单元测试档
#5  thincoder-server/test/publicnet.test.mjs                  本批自持、收口删除
#7  *.test.mjs                                                通配形（该域零档）
#8  thincoder-server/src/sandbox/onboarding.mjs               沙盒任务面，2026-10-14 退场删净
#10 migrations-ddl.mjs                                        拆案拟建、未落
#16 views-mcp-modals.mjs                                      抽档预案备查、未建
#18 2026-10-07-console-layout.test.mjs                        收口即删的单元测试档
#22 views-proxy.mjs                                           独立页已撤场
#23 state.json                                                成员盒运行期档名
```

围栏内这九条**一条也不写回文档面**——上表「改成什么」那一列就是替代形。

### 两处本簇特有的坑

**① 同名档三组，每个 token 只能落一处**：`PROJECT.md`（`design/` ∥ `requirements/`）· `LEDGER.md`（`design/` 与 `design/webui/`）· `MCP.md`（`design/mcp/` 与 `design/webui/`）。本批只撞上 `PROJECT.md` 一组（#14），按 §3 的实读落 `docs/server/design/PROJECT.md`。

其余两组在本清单内**零命中**——不是判过，是没撞上；撞上时同样逐句判。

**② 需求层那一档不是「改新路径」**：`docs/server/requirements/PROJECT.md` 的两处处置问的是「这条需求还成不成立」。两条都成立（AC-30 独立页零承载、AC-57 盒内可查壳版本），变的只是实现坐标，故只换写法，需求句一字不动。

### 受影响文件与分层结论

- 改面 = 上表 13 档，全在 `docRoot.design` ∥ `docRoot.requirements` 的 server 面；**零新增档、零删除档**（#9 删的是一行，不是一档）。
- **分层结论：无跨界**——不碰产品码、测试档、`PROJECT-MANIFEST.json`、台账、本档 §1 §3 §4 §6。
- 本批无运行面改动 ⇒ 无单元测试档；验收 = 引擎跑法（上「尺子」那条命令），读数留 §5。

### 判据（本批交付门）

| # | 判据 | 命令 | 改前读数（红侧） | 目标 |
|---|---|---|---|---|
| A1 | 13 档 `hits.total` = 0 | 「尺子」那条 `mode:"gate"` | `26`（锚 23 · 段落 3） | `0` |
| A2 | 全量 `引缺` 仍为 5（别处逐字引本批句子的没被改断） | 同引擎 `mode:"report"`，`docs/**` | 5 | 5 |
| A3 | 每条处置与上表逐条对齐；判不了的逐条报到 | 报告 + 残余 hits 清单 | 清单空、残余 26 | 两集合相等（目标 = 双方皆空） |

**红侧已在盘**：A1 的改前读数 26 就是它的红侧，同一命令、同一清单，无需另造变异。A2 的红侧 = 改断任一被引句后复跑，`引缺` > 5。

### 关键决策

**KD-1 处置按「这条命中在说什么」分流，不按「怎么让它变绿」分流。** 被否：一律补仓根全路径——对非仓内名不可达，补了只在本机碰巧绿。

**KD-2 多候选不自动取首个。** 被否：「候选第一个就是它」。`app.mjs` 一份在桌面渲染层、一份在服务端静态面，认错即把服务端文档指到桌面端。

**KD-3 处置句里不写「已废弃 ∥ 已退役」一类历史话。** 失效表述删掉、不标注——留在规范面下一轮会被当活指令读。

**KD-4 未建件只留拆案，不写档名。** 被否：把拟建的档名写进设计档并留在红面上等它被建。

**KD-5 段落按验收清、按拆句清。** 被否：按「不在射程」不碰——那它与 A1 相撞，A1 恒不能闭。

### 边界

- 可以改：上表 13 档。
- 不动：别的档（尤其 `docs/server/design/webui/` 下不在清单的那几档）· 产品码 · 需求档里那两条以外的句子 · 台账 · 本档 §1 §3 §4 §6。
- 不做：清单外各档的段落 ∥ 行号坐标两面。

### 上抛项

**1〔知会〕运行期档名在现行判据面上没有合规写法**（#23 一类：真档名、但不在仓内，无仓根路径可写）。本批按 R2 改成叙述形，未猜路径。B 簇已就同类问题立了〔待裁〕，本批不重复上抛，处置随那一条的裁定回收。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
