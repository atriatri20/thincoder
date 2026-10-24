# 2026-10-15 · 核CLI面收尾车
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 清账轮 3 短单 · 车 2（核/CLI 面 16 行）——用户 2026-10-15 01:19「不是说好了自动跑的吗？」全链自动授权；父侧清账轮 3（`docs/batches/2026-10-15-ledger-cleanup-3.md` §1 短单）点火。
> 台账 = #1457（core · 归批——清账轮 3 短单车 2）。前情 = docs/batches/2026-10-15-ledger-cleanup-3.md（未收口——本轮为其短单之车 2）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-15

**来源与授权**：清账轮 3 短单（`docs/batches/2026-10-15-ledger-cleanup-3.md` §1）；用户 2026-10-15 01:19「不是说好了自动跑的吗？」= 全链自动（设计 → 评审 → 批准 → 实施）授权。

**本批条目（16 行——逐行「实现什么」；细节证据以台账行在案为准）**

| 行 | 实现什么 |
|---|---|
| #1175 | CLI 写面 turn-cap/interrupted 落 `status:"error"` 语义统一（与 VSC done+note 对读——#61 上抛待裁） |
| #1178 | `manifest read` ∥ `settings list/get` 工具级 `readonly:false` 与实际只读语义不符（verify 失效链对位） |
| #1179 | 核 `config-io.mjs:205` 零写仍返 null（假成功同族——#1073 三态） |
| #1185 | 内嵌 `node --test` 假绿陷阱（NODE_TEST_CONTEXT 继承 ⇒ 子进程 skip + exit 0）——全仓排查 |
| #1186 | 盘符大小写双实例（小写盘符跑法假红）——跑法口径入册 ∥ 件内 realpath 硬化候选 |
| #1188 | 冻结/取消面注记两处跨端体例差（承面 ∥ 整形——#85 上抛待裁） |
| #1200 | google/gemini provider 面余项（thinkingConfig 通路 ∥ 存量 gemini 行字段复核）；#1201 已并 |
| #1223 | 派生条目隐藏判据消费面枚举不全（`TEAM.md` §2.4 四消费面 ⇒ 六面或明示容受） |
| #1302 | render-core 核件硬编码英文词面 + 哨兵 `"off"` 直送 t()（三面同源缺陷） |
| #1304 | browser 工具陈旧进程不回收 ⇒ 后续会话起不动（DevToolsActivePort 超时；手修已实证） |
| #1343 | 核侧回读卡缺 `tool-call-summary` 位（活流/回读两径形态失配——须消） |
| #1347 | 异步两时点配套文字面逐字定稿（`ASYNC_NOTE` ∥ `tool-docs/timer.md:11` ∥ `prompts/common.md` 接收侧句——**提示词面内容权 = 主 agent**，逐字稿随设计呈批） |
| #1376 | eng 翻转建档路不触 scope 缓存（进程内即时性缺口——`eng.mjs:81` 等七处） |
| #1387 | hub 级 TLS 端到端腿（需 `httpsRequestImpl` 缝 + WS/升级测试基建） |
| #1432 | tool-errors 明文面（spawn 门拒 args 携令牌值落 `~/.thincoder/tool-errors/`） |
| #1437 | CLI `render-frame.mjs` 面族（拆分——近线 495/500 ∥ 交错显示缺口；#1440 已并） |

**边界/禁触**：在飞批域零触（`member-pull-inline-cred` ∥ `member-face-parity` 的 docs 域——`MEMBER-AGENT.md`/`CHAT.md`/`API.md` 冻结中）；设计轮产品码零触。

**验收（设计轮）**：逐行出案（机制 ∥ 落点 ∥ 机检判据）+ 受影响文件全清单（含行数）+ 拆分计划（越线件）；机检（`scripts/doc-check.mjs`）本批域零新增红。

**父侧裁定（#48 上抛处置 · 2026-10-15 01:4x）**

- **R-1 核准（内容权 = 主 agent）**：逐字稿三件**照 §2.5 草稿采用**（A `tool-docs/timer.md:11` 整句替换 ∥ B `ASYNC_NOTE` 首句 ∥ C 接收侧句 EN ∥ CN 正本首句）——**逐字落**；落地分工照 §2.6（EN 运行面 = 实施轮；CN 正本 `docs/core/design/prompts/common.md:70-71` = 设计席笔，随本核准生效）。
- **R-4 裁定 = 留**：`thincoder-core/tool-docs/notify_parent.md:3`（子侧收答复句）不在 §6.34 射程（depth>0 无空闲面）——零动在案。
- **R-5 裁定 = 采 VSC 长形**（值逐字同 VSC locales；不新键）。
- **R-8 裁定 = 六面保留**（`/config` 默认模型菜单 = 列表面——过滤正确）。
- **R-2 ∥ R-3 ∥ R-6 ∥ R-7 = 知会受理**（如实报告在案）。

**父侧裁定（#60 评审处置 · 2026-10-15 01:4x）**：评审 = **changes-required**（🔴×1 ∥ 🟡×7 ∥ 🔵×4 = 12；发现表 = §3 轮次 1）——**12/12 全部受理（零驳回）**：🔴#1（标题径 anthropic/google 禁用形三处相抵：`SESSION.md:189` ∥ `PROVIDER.md:391` ∥ `MODEL-SPECS.md:2113`——方向 = **以实装为准收正一处**；修正轮 #63 先实读 `thincoder-core/generate-title.mjs`（:46 ∥ :74 邻位）钉真伪再落笔）；🟡#2–#8 ∥ 🔵#9–#12 按建议列落笔（#2 落批档 §2「逐腿落点表」16 腿×档:节；#6 与 R-8 裁定（六面保留）并办）。**本轮无 token（changes-required）**——修正轮 #63 修毕 → 复审轮 2（同卷面同批档）→ pass 发 token → §4。

**父侧裁定三则（2026-10-15 02:2x）**：㈠［#77 上抛·裁］composer 五件 + `tool-card.mjs` aria 的代码替换 = **归三端席（#77）一并落**——§2.2 的「±0」= **行数增量口径**（非零改）；以 §2.1 #1302 落点与机检（清单字面零余 ∥ zh 抽样零残留）为准；六件超声明如实披露；键命名/取值归该席（报告附「键名 ↔ 代码落点」对位表）；`reasoning.off` 连带（`2026-10-12-console-reasoning-levels.test.mjs:309`）= **父侧笔**（#77 落完即收）。**注**：我原派单任务书的边界句（「五件 = 不在写域」）与 §2.1 相抵——**以设计为准，该句作废**。㈡［#75 上抛·裁］#1376 落法 = **反转注册**（`manifest.mjs` 加 `onManifestInit(fn)` 订阅点（形同 `config-io.mjs` `onConfigSelfWrite`）+ `declaration.mjs` 模块内注册 `clearDeclarationCache`）——设计「有环 ⇒ 函数内 dynamic import」支不可行（`resolveEngineeringManifest` sync + 七处同步调用点；证据在案）；判据 = 零环 ∥ 同步即时 ∥ 七处零触 ∥ `MANIFEST.md` KD-M1-33/AC-33 不破；`declaration.mjs` 越声明已披露；**设计档偏差记 = 收口时设计席补注**。㈢［#74 上抛·结案］`MODEL-SPECS.md:2079`（§18.5 影响文件清单「零存量行改」）= **as-of 豁免**（表头 as-of 2026-10-10 在册 ∥ §18.4 认账行 `:2068` 已记三行随正）⇒ 不动，结案。

**父侧补登（设计缺口——收口随正，2026-10-15 02:3x）**：car2 +≈30 键/表（server core i18n）触**全局键数/档目/zh 表哈希**指纹链——四档未入 §2 随正清单，实测已被打红（父侧实跑）：`2026-10-10-runner-admin-console-ui.test.mjs`（键数：actual **[1151, 1156]** vs 基线 `[1129, 1134]`——#77 部分落）∥ `2026-10-08-server-public-structure.test.mjs`（zh 表哈希漂移）∥ `2026-10-11-console-tabs-component.test.mjs` ∥ `2026-10-12-team-projects-permissions-ui.test.mjs`（键数）。**收口随正 = 父侧笔**（#77 落定后按盘实读收正四档：键数/档目/zh 哈希；台账 #1460）。先例 = 凭据批 R82（同族 🔴 由评审打点后补列两件）。

**父侧处置（#76 交付 · 2026-10-15 02:4x）**：㈠［待裁①］`TUI.md` 模块地图/指针随拆分的回写 = **设计席笔**（随 #71 后续轮或本批收口随正轮）——**已记**；`API-CONTRACT.md:311/317/318` 坐标随正 = **父侧生成器唯一笔**（本批收口时一并跑 `--write`）。㈡［知会②］car2 **测试席 = #79**（在排队，dependsOn 三面）——四腿机检的正式载体由该席落 `docs/batches/2026-10-15-car2-core-cli.test.mjs`；`cross-end-alignment.test.mjs` L2-2 期望随正**入 #79 写域**（其文件域已含 carve-out）。㈢［知会③·外部环境面］`thincoder-desktop/node_modules/@thincoder/render-core` 被**并行真构建**（本批 bash#78/#89 的 `prepackage` 物化步骤）改写成物理拷贝 ⇒ 桌面链 i18n 单实例前提破、四档外部红。**处置 = 父侧 `node scripts/dev-link.mjs --force`（已跑，终态 5 链规范 ∕ 0 未收敛）**——该面为构建的**临时态**，凡真构建后即恢复；后续任何子席复跑遇渲染核面红，先按此口径核链态（非产品码缺陷）。

**父侧处置（#75 交付 · 2026-10-15 02:4x）**：㈠**未落两项已点入 #79 任务书**——`2026-10-10-gemini-model-specs.test.mjs` G-5 期望随正 ∥ `2026-10-10-cross-end-alignment.test.mjs` L2-2 期望随正（均滞后红、均属测试席域）。㈡［知会］批档 §2.1 #1200 条件句字面与实装 off 形不一致 ⇒ **设计席收口随正项**（设计档 `MODEL-SPECS.md:2113` 为准；实装正确、零语义）。㈢［知会］`onManifestInit` 未登记进 `MANIFEST.md` 接口面 ⇒ **设计席笔**（随 #71 后续轮，父裁在案）。㈣［知会］旧名四份设计/契约档（含 `API-CONTRACT.md:839` 生成区）= **父侧收口时跑 `--write` 随正**。㈤既存红两档（`provider-key-guards-core` T-C1b 经 `git archive HEAD` 基线复跑同红 = 既存夹具失真；`gemini-thought-signature` AC-9 期望集缺他面文件）——**非本批面**，入台账备查。

**父侧笔（跨批档 = 父侧执行 · 2026-10-15 03:0x）**：门的射程实测定案（#90 复报）——绑定批档名以外的**一切** `docs/batches/*.test.mjs` 均拒子席写 ⇒ 跨批随正一律**父侧笔**。已落五处：① `2026-10-01-batch-file-mount-normalize.test.mjs`（`:81`/`:94`）② `2026-10-04-tool-path-baseline.test.mjs`（`:143`）③ `2026-10-07-ledger-evidence-semantics.test.mjs`（`:215`）④ `2026-10-08-proxy-chunked-frame.test.mjs`（`:297-299`）——四处**#1185 NODE_TEST_CONTEXT 剥除**（各调用点补 `env: { ...process.env, NODE_TEST_CONTEXT: undefined }`；`node --check` 四件全 OK）；⑤ `2026-09-29-desktop-residuals-round3.test.mjs:346` **#1186 硬化**（`coreRel` ⇒ junction 同源取件；复跑 16/17，唯一红 `:163` content 断言滞后 = 非取件面，另判）。⑥ `2026-10-07-ledger-tool.test.mjs:249` 符号随正（前已落，19/19 绿）。**余**：G-5 ∥ L2-2 随正（#90 交逐字改法后我落）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（车 2 十六行逐行出案（三段落 + 勘误两条）· 产品码零触）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

### 承接与口径（eng-designer · 2026-10-15）

- 承接 = §1（清账轮 3 短单 · 车 2 · 核/CLI 面 16 行）· 台账 #1457 · 前情 = 清账轮 3（未收口，本批为其车 2）；授权 = 用户 2026-10-15 01:19 全链自动（设计 → 评审 → 批准 → 实施）。
- 本轮 = **设计轮**：产品码零触；写面 = 7 份设计档随动（§2.6）+ 本段。机检 = `node scripts/doc-check.mjs`（仓根 `D:\teamcode\thincoder`），读数入 §2.4。
- 逐行出案 = §2.1（机制 ∥ 落点 ∥ 机检判据）；每行判据 = 批内单元测试档新腿（§2.2）+ 红绿对读数（修前 ⇒ 修后）。
- 落点坐标 = **as-of 设计轮实读**（2026-10-15）；实施轮以实读为准（坐标漂移按 as-of 惯例不追改）。

### 2.1 逐行设计案（16 行）

**#1175 —— CLI 写面终结语义归一（done+note）**
- 机制：非错终结三事件（interrupted ∥ turn-cap ∥ stopped-by-user）⇒ 写面 `status:"done"` + `note`（文本 = 锚常量族原文；与 VSC 写面同形）；真异常保持 `status:"error"`。判据单源 = `docs/core/design/SESSION.md` §6.26（本轮已落——§2.6）。
- 落点：`thincoder-cli/src/tui/subagent-freeze.mjs`（`lastError` 赋值点 ⇒ `note`）∥ `tool-events.mjs:223`/`:251`（两处标记）∥ `lifecycle-records.mjs:55-59`（status 三元 + `meta.note` 写出）∥ `:157-158`（`synthSubTask` 回填 `note`）∥ `render-segments.mjs:88`/`:95-99`（分面呈现）。
- 机检：批内档 —— 三事件注入 ⇒ `subagentRecord(sub).meta` 逐字 `{status:"done", note:…}`；异常注入 ⇒ `{status:"error", error:…}`；重建面 `synthSubTask` 回填后冻结头逐字同 live。红绿对：修前 `error` ∥ 修后 `done`+note。

**#1178 —— verify 失效链补动作级判据**
- 机制：`!tool.readonly` 判据改 `!tool.readonly ∧ ¬isReadonlyAction(名, 参数)`；动作级单源 = 既有函数（现名 `isSubagentReadonlyAction`——泛化改名 `isReadonlyAction`，语义零改，全仓引点随改、旧名零余）。
- 落点：`thincoder-core/agent/record-results.mjs:91`（导入 + 条件）∥ `thincoder-core/agent/dispatch-gates.mjs:64`（改名点）∥ 全仓引点（实施轮 grep 清单）。
- 机检：批内档 —— `settings get` ∥ `manifest read` 类调用 ⇒ `_verifiedThisRun` 置位保留（红绿对：修前被清）；`settings set` ∥ `manifest write` ⇒ 仍清（负控）；`readonly !== false` 工具面零变。

**#1179 —— 零写不返 null（假成功收正）**
- 机制：目标渠道缺 ⇒ 返错误串（`Provider "<name>" not found`——与 `addProviderEntry` 族同式）；零写不再返 null（#1073 三态同族）。
- 落点：`thincoder-core/config-io.mjs:201-208`（`setProviderKey`）∥ `:211-217`（`removeProviderKeyFromConfig` 同判——同族一并收正）。
- 机检：批内档 —— 无该渠道 ⇒ 两函数返回串（`/not found/`）+ 文件字节 ∥ mtime 零变；在册渠道 ⇒ `null` 逐字（红绿对）。

**#1185 —— 内嵌 `node --test` 假绿收正（四件五点）**
- 机制：子进程 env 剥 `NODE_TEST_CONTEXT` + 断言加非 skip 证据（模板 = `docs/batches/2026-10-10-core-small-fixes.test.mjs`）；规范入册 = `docs/core/design/TESTING.md` §2.2 邻位（本轮已落）。
- 落点：`docs/batches/2026-10-01-batch-file-mount-normalize.test.mjs:81`/`:94` ∥ `2026-10-04-tool-path-baseline.test.mjs:143` ∥ `2026-10-07-ledger-evidence-semantics.test.mjs:215` ∥ `2026-10-08-proxy-chunked-frame.test.mjs:297`。
- 机检：探针演示（剥前子进程零输出 = 假绿 ∥ 剥后汇总行在场）+ 四件直跑全绿且 pass 计数 > 0（真读数）。全仓排查读数 = 7 件内嵌档 / 9 点（3 件已剥零触；产品 `test/` 树零命中）。

**#1186 —— 盘符大小写双实例（件内挂载面硬化）**
- 机制：`coreRel` 直路取件改 **junction 同源取件**（货架同源——TESTING.md §2.2 规范落地；缝注入随路同源）；取向 = 件内硬化（非仅「跑法口径入册」——治标不治本，见 D-C2-2）。
- 落点：`docs/batches/2026-09-29-desktop-residuals-round3.test.mjs`（`coreRel` def 及两腿引用点 `:346`/`:427`/`:614`）。
- 机检：小写盘符 workdir 直跑 ⇒ **17/17**（红绿对：修前 15/17 假红 ∥ 大写入径对照 17/17）；修毕后 TESTING.md §2.2「已修先例」行追加本件（一行）。

**#1188 —— 冻结面注记两处跨端体例差**
- 机制：① stopped 面**零注记**（对齐核件 `cancelled` 面——原因词与 verb 重复不重复呈现）②注记整形跨端同式（空白折叠 + 140 上限）；判据单源 = SESSION.md §6.26（本轮已落）。
- 落点：`thincoder-cli/src/tui/render-segments.mjs:88`（`errPart` 分面：error 面括号外（既有）∥ done 面注记追加（折叠 + 140）∥ stopped 面零注记）。
- 机检：批内档 —— 三面样本（stopped ∥ done+note ∥ error）渲染头逐字；折叠样本（含换行）⇒ 单空格；141 字符 ⇒ 前 139 + `…`（红绿对）。

**#1200 —— google 面余项（off 形接线 ∥ 存量行随正）**
- 机制：① google chat 载荷 **off 形接线**（`provider.thinking` 在场 ⇒ `generationConfig.thinkingConfig = { thinkingLevel: "none" }`——条件 ∥ 载荷形逐字对齐标题径先例）；②存量三行 `thinking:false` ⇒ `true`（族证；行为面只涉 VSC 档位面）；③effort 形**不接**（无用户可达面 + 映射未取证——重开条件入档）。
- 落点：`thincoder-core/provider/google.mjs`（generationConfig 组装——`:84-87` 邻位）∥ `thincoder-core/model-specs.mjs:202-204`（三行）∥ 设计档 `MODEL-SPECS.md` §18.4 认账行 ∥ §18.8（本轮已落）。
- 机检：批内档 —— 假 provider（thinking = 族别 off 形）⇒ body `generationConfig.thinkingConfig` 逐字；thinking 缺省 ⇒ 零新键（负控）；三行 `specForModel` 读数 = `thinking: true` 逐名 + 其余字段逐字不变。

**#1223 —— 派生条目隐藏判据消费面枚举补齐（四 ⇒ 六）**
- 机制：新增两面各加同判据过滤（单源复用 `isDerivedProviderHidden`）：CLI `/model`·`/submodel` Tab 补全面 ∥ CLI `/config` 渠道读面；取向 = 六面（非容受，见 D-C2-4）。
- 落点：`thincoder-cli/src/tui/slash-commands.mjs:151`/`:154`（补全集 ⇒ filter）∥ `thincoder-cli/src/tui/cmd-config.mjs:294`（探针循环）+ `:304`（条目录入）∥ 设计档 `TEAM.md` §2.4 ∥ §3 D-TM3 ∥ `PROVIDER.md` §6.25（本轮已落）。
- 机检：批内档 —— 假 providers（derived 无 key）⇒ `/model <Tab>` 候选零该名 ∥ `/config` 默认模型菜单零该行；有 key ⇒ 两端在场（红绿对）。

**#1302 —— 核件硬编码英文词面 + 哨兵（三面同源）**
- 机制：①核件字面全量入 **t() 键族**（VSC locales 现键复用；新键三面同集——值逐字同 VSC locales，长形随之，见 R-5）②哨兵 `"off"` ⇒ `"none"`：显示式收敛单式 `visible === "" ? "—" : reasoningLabel(visible)`；`reasoning.off` 键转无用 ⇒ console 面删除 ③三面 locales 同步。
- 落点：`thincoder-render-core/composer/panel.mjs:89-102` ∥ `attach.mjs:89-99` ∥ `controls.mjs:46-52` ∥ `model-menu.mjs:292`/`:299`/`:369`/`:394-395`/`:427`/`:432-434` ∥ `atmenu.mjs:31` ∥ `flow/tool-card*.mjs`（aria 面）∥ locales：`thincoder-vscode/locales/en.json`+`zh.json` ∥ `thincoder-desktop/renderer/i18n-composer.mjs` ∥ `thincoder-server/public/i18n-en-core.mjs`+`-zh-core.mjs`。
- 机检：批内档 —— ①源码扫：清单字面零余（逐条 grep）②三面键集相等断言（新键 en/zh 全在）③zh 字典注入 ⇒ 抽样控件 title/aria 全为 zh 值（零英文残留）。

**#1304 —— browser 陈旧进程不回收（启动前孤儿回收）**
- 机制：profile 锁空闲 ⇒ 同 `--user-data-dir` 残留浏览器进程树**回收后再 spawn**（新增 `reclaimProfileOrphans(profile, io)`——平台分支 + lister/killer 缝，尽力面零抛）；锁被活 pid 持 ⇒ 不回收、照抛既有错；`close` 路径既有杀树零改。
- 落点：`thincoder-core/browser/launch.mjs`（启动序插入 + 回收器；profile 常量 `:66-69`）∥ `thincoder-core/browser/session.mjs`（close 参考零改）。
- 机检：批内档（缝注入）——锁空闲 + 假列表两孤儿 ⇒ 两杀 + 继续启动；锁活持 ⇒ 零杀 + 同前抛错（负控）；无孤儿 ⇒ 零杀。真机：残留期起不动 ⇒ 起得动（手修已实证基线）。

**#1343 —— 回读卡缺 `tool-call-summary` 位（两径对位）**
- 机制：`buildFinishedToolCard` 补 `.tool-call-summary` span——摘要单源 `formatToolSummary`；条件 ∥ 字面 ∥ truncated 分支**逐字同活卡**（消形态失配）。
- 落点：`thincoder-render-core/flow/tool-card-restore.mjs:40-44`（span + import `../tool-summary.mjs`）∥ 活卡参考 `flow/tool-card.mjs:117-130`（零改）。
- 机检：批内档 —— 同夹具两 builder ⇒ 卡头四槽（name/args/status/summary）textContent 逐字相等；summary 空 ∥ 非空两态；既有探针复跑 6/6。

**#1347 —— 异步两时点配套文字面逐字定稿**
- 机制：语义随 `docs/core/design/AGENT-LOOP-ASYNC-POOL.md` §6.34（交付 = 下个交付轮（空闲唤醒 / 挂起窗）；用户回合零投递）；**逐字稿三件 = §2.5 起草（呈批——内容权 = 主 agent）**。
- 落点：`thincoder-core/agent-tools/parent-channel.mjs:57-60`（`ASYNC_NOTE` 首句）∥ `thincoder-core/tool-docs/timer.md:11` ∥ `thincoder-core/prompts/common.md:86-88`（EN 运行面 = eng-coder 落）∥ `docs/core/design/prompts/common.md:70-71`（CN 正本 = 设计席笔——**审批后落**）。
- 机检：三面文本逐字 = §2.5 稿；ASYNNC 面 `grep "next turn boundary"` 零余（首句面）∥ CN ∥ EN 接收侧句同源断言。

**#1376 —— eng 建档路不触 scope 缓存**
- 机制：默认档建档后**清 scope 缓存**（单点收口——七处调用零触）：`resolveEngineeringManifest` 建档支成功后 `clearDeclarationCache()`。
- 落点：`thincoder-core/manifest.mjs:232`（init 支）+ import `./declaration.mjs`（环审 = 实施轮首步；有环 ⇒ 函数内 dynamic import）∥ 调用点 `thincoder-core/agent-tools/eng.mjs:81` 等七处零触。
- 机检：批内档 —— tmp 无档 ⇒ resolve（created）⇒ 同进程声明复读即时见新档（红绿对：修前 stale）；文件面零变。

**#1387 —— hub 级 TLS 端到端腿**
- 机制：①缝补 2 行（`httpsRequestImpl` 透传——hub 参数表 + 升级腿消费点）②新测试档 = 真 `node:https` 引擎 + 既有 upgrade 劫持 harness 移植 + **新 PEM fixture（IP:127.0.0.1 SAN）**。
- 落点：`thincoder-server/src/sandbox/terminal-routes.mjs:96`（参数）+ `:329`（透传）∥ 新档 `docs/batches/2026-10-15-car2-core-cli-tls.test.mjs`（拟新增）∥ harness 参考 `docs/batches/2026-10-13-sandbox-container-terminal.harness.mjs`。
- 机检：新档直跑全绿 —— 浏览器侧 RawWs 握手 101 ⇒ hub ⇄ runner 升级腿走真 TLS ⇒ pty 字节往返 ⇒ exit 帧；材料不齐 ⇒ 既有抛错零变（负控）。实施期先探两坑（带 IP SAN 自签校验 ∥ `requestCert` 自签 mTLS——不顺则退 `rejectUnauthorized:false` + peer 证书断言，如实登记）。

**#1432 —— tool-errors 明文面（args 掩蔽链复用）**
- 机制：`logToolError` args 落痕前**过遮蔽链**（复用单源 `redactSecret`——「maskSecrets」名不存在，不新造；键级 + 内容级两判）；`≤2000` 截断零改。
- 落点：`thincoder-core/agent/dispatch-gates.mjs:27-46`（`:38` entry 构造）∥ `thincoder-core/log.mjs:152`（复用点）。
- 机检：批内档 —— args `{designToken:"tok-…"}` ⇒ 落盘文件含 `[REDACTED]` ∧ 零 token 字面；嵌套对象 ∥ 数组同；非敏感面零变（对照）。残余 = error/stack 面未涉（R-2）。

**#1437 —— render-frame 面族（拆分 + 交错显示归属）**
- 机制：①**拆分**——状态栏族迁 `thincoder-cli/src/tui/status-line.mjs`（拟新增；`SLASH_HINTS` ∥ `QUIET_MS` ∥ `attentionKind` ∥ `renderStatus` ∥ `buildStatusLine` ∥ `teamSegmentHint` ∥ `teamServerHost`）；render-frame 495 ⇒ ≈320；导出面 render-frame **转发导出**（零破坏）②**交错显示归属**——掩码三面在场 ⇒ 显示面归掩码面（单源 `maskSurfacePresent` 迁 `ask-steps.mjs` 导出；三消费 = key-handler-search ∥ layout ∥ render-frame）。
- 落点：`thincoder-cli/src/tui/render-frame.mjs`（`:30-44`/`:226-234`/`:236-258`/`:376-476`/`:477-495` 迁出；`:337` 框题守卫）∥ `thincoder-cli/src/tui/status-line.mjs`（拟新增）∥ `layout.mjs:61-63` ∥ `ask-steps.mjs` ∥ `key-handler-search.mjs:58-70` ∥ 设计档 `docs/cli/design/TUI.md` §4 ∥ `docs/cli/design/TUI-INPUT-BOX.md` §1（本轮已落）。
- 机检：拆分 —— 两档 `<500` ∥ `node --check` ∥ 状态栏渲染样本拆分前后逐字相等；归档锚两件复跑（`2026-09-29-desktop-residuals-sweep-wave-a` ⑤b ∥ `2026-10-04-stream-ledger-lines-retire` T15——差异只登记，零维护不扫）。显示 —— 搜索开 + 掩码弹出 ⇒ 框题 ∥ 内容 = 掩码面（红绿对）。

### 2.2 受影响文件全清单（含行数 · 口径 = `split("\n").length − 1` · as-of 2026-10-15 设计轮实读）

**产品码（thincoder-core）**

| 文件 | 现读 | 预期 | 行 | 对应行 |
|---|---|---|---|---|
| `thincoder-core/agent/record-results.mjs` | 186 | ≈190 | +4 | #1178 |
| `thincoder-core/agent/dispatch-gates.mjs` | 148 | ≈150 | +2 | #1178 ∥ #1432 |
| `thincoder-core/config-io.mjs` | 282 | ≈288 | +6 | #1179 |
| `thincoder-core/manifest.mjs` | 272 | ≈275 | +3 | #1376 |
| `thincoder-core/provider/google.mjs` | 285 | ≈290 | +5 | #1200 |
| `thincoder-core/model-specs.mjs` | 369 | ±0 | 0 | #1200（三行值改） |
| `thincoder-core/agent-tools/parent-channel.mjs` | 241 | ±0 | 0 | #1347（文本） |
| `thincoder-core/tool-docs/timer.md` | 12 | 12 | 0 | #1347（文本） |
| `thincoder-core/prompts/common.md` | 216 | ±0 | 0 | #1347（文本） |
| `thincoder-core/browser/launch.mjs` | 143 | ≈185 | +≈42 | #1304（回收器 + 平台分支） |
| `thincoder-core/browser/session.mjs` | 494 | ±0 | 0 | #1304 参考（零改） |
| `thincoder-core/log.mjs` | 202 | ≈210 | +≈8 | #1432 |

**产品码（thincoder-cli ∥ render-core ∥ locales ∥ server）**

| 文件 | 现读 | 预期 | 行 | 对应行 |
|---|---|---|---|---|
| `thincoder-cli/src/tui/subagent-freeze.mjs` | 253 | ≈255 | +2 | #1175 |
| `thincoder-cli/src/tui/tool-events.mjs` | 460 | ≈462 | +2 | #1175 |
| `thincoder-cli/src/tui/lifecycle-records.mjs` | 210 | ≈214 | +4 | #1175 |
| `thincoder-cli/src/tui/render-segments.mjs` | 176 | ≈184 | +8 | #1175 ∥ #1188 |
| `thincoder-cli/src/tui/layout.mjs` | 246 | ≈250 | +4 | #1437 |
| `thincoder-cli/src/tui/render-frame.mjs` | 495 | ≈320 | −175 | #1437（拆分迁出） |
| `thincoder-cli/src/tui/status-line.mjs`（拟新增） | — | ≈175 | 新 | #1437 |
| `thincoder-cli/src/tui/ask-steps.mjs` | 61 | ≈66 | +5 | #1437 |
| `thincoder-cli/src/tui/key-handler-search.mjs` | 136 | ≈130 | −6 | #1437（改引单源） |
| `thincoder-cli/src/tui/slash-commands.mjs` | 192 | ≈196 | +4 | #1223 |
| `thincoder-cli/src/tui/cmd-config.mjs` | 506 | ≈510 | +4 | #1223（越线，见 §2.3） |
| `thincoder-cli/src/tui/provider-admin.mjs` | 248 | ±0 | 0 | #1223 判据单源（零改） |
| `thincoder-render-core/composer/panel.mjs` | 470 | ≈470 | ±0 | #1302 |
| `thincoder-render-core/composer/attach.mjs` | 236 | ±0 | 0 | #1302 |
| `thincoder-render-core/composer/controls.mjs` | 219 | ±0 | 0 | #1302 |
| `thincoder-render-core/composer/model-menu.mjs` | 485 | ≈485 | ±0 | #1302 |
| `thincoder-render-core/composer/atmenu.mjs` | 145 | ±0 | 0 | #1302 |
| `thincoder-render-core/flow/tool-card.mjs` | 180 | ±0 | 0 | #1302 aria ∥ #1343 参考 |
| `thincoder-render-core/flow/tool-card-restore.mjs` | 82 | ≈92 | +10 | #1343 |
| `thincoder-vscode/locales/en.json` | 333 | +≈30 键 | — | #1302 |
| `thincoder-vscode/locales/zh.json` | 333 | +≈30 键 | — | #1302 |
| `thincoder-desktop/renderer/i18n-composer.mjs` | 92 | +≈30 键 | — | #1302 |
| `thincoder-server/public/i18n-en-core.mjs` | 67 | +≈30 键 −1 | — | #1302 |
| `thincoder-server/public/i18n-zh-core.mjs` | 70 | 同左 | — | #1302 |
| `thincoder-server/src/sandbox/terminal-routes.mjs` | 362 | ≈364 | +2 | #1387（缝） |

**既存单元测试档（收正）∥ 新件 ∥ 设计档**

| 文件 | 现读 | 预期 | 对应行 |
|---|---|---|---|
| `docs/batches/2026-10-01-batch-file-mount-normalize.test.mjs` | 107 | ≈112 | #1185 |
| `docs/batches/2026-10-04-tool-path-baseline.test.mjs` | 171 | ≈173 | #1185 |
| `docs/batches/2026-10-07-ledger-evidence-semantics.test.mjs` | 219 | ≈221 | #1185 |
| `docs/batches/2026-10-08-proxy-chunked-frame.test.mjs` | 301 | ≈303 | #1185 |
| `docs/batches/2026-09-29-desktop-residuals-round3.test.mjs` | 723 | ≈723 | #1186（取件式改） |
| `docs/batches/2026-10-10-gemini-model-specs.test.mjs` | 103 | ≈103 | #1200（G-5 期望随正——三行 `thinking: true`） |
| `docs/batches/2026-10-15-car2-core-cli.test.mjs`（拟新增） | — | ≈260 | 核/CLI 面腿 |
| `docs/batches/2026-10-15-car2-core-cli-tls.test.mjs`（拟新增） | — | ≈200 | #1387 |
| 设计档 7 份（`SESSION.md` ∥ `TEAM.md` ∥ `PROVIDER.md` ∥ `TESTING.md` ∥ `MODEL-SPECS.md` ∥ `TUI.md` ∥ `TUI-INPUT-BOX.md`） | — | 随动落笔 | §2.6 |

### 2.3 越线件拆分计划

- `thincoder-cli/src/tui/render-frame.mjs` **495 / 500（近线）** ⇒ 本批拆出 `thincoder-cli/src/tui/status-line.mjs`（拟新增 ≈175 行）⇒ 495 ⇒ ≈320（**消**）——#1437。
- `thincoder-cli/src/tui/cmd-config.mjs` **506（越 500 软线 6 行——前批既越，非本批引入；本批 +≈4 ⇒ ≈510）**：拆分候选 = `defaultModelMenu` 族（`:286-350` 邻域）⇒ `thincoder-cli/src/tui/cmd-config-model.mjs`（拟新增）；
  触发条件 = 下次实质触碰该档（本批仅过滤点 +4，行级非结构性——不拆）；机检登记面（`core-hygiene` 软线册）已随 2026-09-28 测试树退场 ⇒ 本段即登记面。

### 2.4 机检读数（设计轮实跑 · `node scripts/doc-check.mjs` · 仓根 `D:\teamcode\thincoder`）

- 进入本批前基线：锚悬空 **6** ∥ 行宽 **7**（全在 docs/server 在飞批域：`MEMBER-AGENT.md` ∥ `gateway/API.md` ∥ `webui/CHAT.md`——本批边界内零触）。
- 本轮落笔后复跑：**FAIL(锚) 6 ∥ FAIL(行宽) 7 —— 与基线逐条相同、零新增**（本批域零红）；本批落笔引入的 6 条超宽行已于同轮折行消净。
- 行数面 = 报告态 85 条差异（非闸、非本批域；回填工单即该清单）——不入判据。
- 产品码 diff = **零**（本轮写面 = 7 份设计档 + 本段；`git status` 读数随交付报告）。

### 2.5 上抛项（R 清单 · #1347 逐字稿三件——呈批）

**R-1（呈批）异步两时点配套文字面逐字稿**（内容权 = 主 agent；批准后落地分工 = EN 两面 eng-coder ∥ CN 正本设计席笔）：

- **R-1-A `thincoder-core/tool-docs/timer.md:11`**（整句替换）：
  现：`Delivery: while a turn is running it lands at the next step boundary; when the session is idle it is delivered on the spot and starts a turn — the idle wake is available on the CLI / VSC / desktop foregrounds and suspension windows (headless is structurally unsupported); other paths keep the step-boundary behavior.`
  新（草稿）：`Delivery: when the session is idle it is delivered on the spot and starts a turn — the idle wake is available on the CLI / VSC / desktop foregrounds and suspension windows (headless is structurally unsupported).`
  `A user turn gets no delivery: while a session turn is running, an expired timer waits for the next delivery round (suspension window / idle latch); other paths keep the step-boundary behavior.`
- **R-1-B `ASYNC_NOTE`（`thincoder-core/agent-tools/parent-channel.mjs:57-60`）**——仅首句替换（后两句逐字保持）：
  现首句：`delivered to your parent's queue — consumed at the parent's next turn boundary (non-blocking).`
  新首句（草稿）：`delivered to your parent's queue — consumed at the parent's next delivery round (idle wake or suspension window; not during a user turn), non-blocking.`
- **R-1-C 接收侧句（EN 运行面 `thincoder-core/prompts/common.md:86-88` ∥ CN 正本 `docs/core/design/prompts/common.md:70-71`）**——仅首句替换：
  EN 现首句：`Receiving side (the parent): an in-flight child message arrives as a `[System reminder: ...]` user message at your next turn boundary.`
  EN 新首句（草稿）：`Receiving side (the parent): an in-flight child message arrives as a `[System reminder: ...]` user message at a delivery round (idle wake / suspension window) — a user turn gets no delivery.`
  CN 现首句：`**接收侧（父）**：子代理的在飞消息在下个回合边界以 `[System reminder: ...]` user 消息到达；`
  CN 新首句（草稿）：`**接收侧（父）**：子代理的在飞消息在**下个交付轮**（空闲唤醒 / 挂起窗）以 `[System reminder: ...]` user 消息到达——用户回合零投递；`

**R-2（报告·#1432 残余）**：args 面已遮；error.message / stack 面未涉（如 echoed args 仍可能带值）——本批不扩，如实报告。

**R-3（报告·#1186 相邻）**：同件写真 `~/.thincoder` 路径的腿（缝双实例的推断面）——随同源修一次消；实施轮复跑确认，仍现 ⇒ 另登记。

**R-4（待裁·#1347 清单外同族面）**：`thincoder-core/tool-docs/notify_parent.md:3`（子侧收答复句）——depth>0 不受 §6.34 约束（子代理自跑无空闲面）⇒ **建议留**；改否待父裁。

**R-5（报告·#1302 值分歧）**：`toolbar.advisor` ∥ `toolbar.engineering` VSC 键值 = 长描述形（核件原短形）⇒ 采用 VSC 长形（政策「值逐字同 VSC locales」）；如父侧要短形 ⇒ 新键（三面 +2）。

**R-6（报告·#1179 相邻）**：`conflictError` 只认 mtime-conflict（既有语义）——本批不动。

**R-7（报告·#1185 计数）**：全仓读数 = 7 件内嵌档 / 9 点（4 件 5 点假绿收正；3 件已剥）；产品 `test/` 树零命中。

**R-8（报告·#1223 面数）**：六面含 `cmd-config.mjs` 面（as-of 实读 = `defaultModelMenu` 列全渠道名）；若父侧判定非列表面 ⇒ 回落五面（两设计档计数句随改）。

### 2.6 设计档落点（本轮已落 · 7 份）与边界

- 已落：`SESSION.md` §6.26（非错终结写面归一 + 显示残项收口——#1175 ∥ #1188）∥ `TEAM.md` §2.4 ∥ §3 D-TM3（四 ⇒ 六消费面——#1223）∥ `PROVIDER.md` §6.25（同拍）∥ `TESTING.md` §2.2 邻位（内嵌子进程规范——#1185）∥ `MODEL-SPECS.md` §18.4 认账行 ∥ §18.8（google 通路——#1200）∥ `TUI.md` §4 ∥ `TUI-INPUT-BOX.md` §1（显示面同归——#1437）；各档变更记录一行随落。
- **随动面（修正轮 #13 补 · 实施轮落）**：`docs/batches/2026-10-10-gemini-model-specs.test.mjs`（G-5 载体）——期望随正：三行 `thinking: true`（其余字段逐字段不变）+ 标题 ∥ 档头注同拍；§2.2 表已补行（#1200）。
- 审批后落：`docs/core/design/prompts/common.md`（CN 正本——#1347，R-1-C）。
- **本批不做（边界）**：产品码（设计轮）；`core.mjs:205` effort 排除不动；#1302 CLI 同源串（`tool-summaries`）∥ 死兜底 `t(k) || "literal"` 不动（R 报告）；`MEMBER-AGENT.md`/`CHAT.md`/`API.md`（冻结在飞域）零触；#1347 EN 面批准前零动。

### 2.7 验收对照（§1 验收四条 + 三链同源）

| 判据 | 落点 | 状态 |
|---|---|---|
| ① 逐行出案（机制 ∥ 落点 ∥ 机检判据） | §2.1（16 行） | ✅ |
| ② 受影响文件全清单（含行数） | §2.2（39 行） | ✅ |
| ③ 拆分计划（越线件） | §2.3（render-frame 拆 ∥ cmd-config 登记 + 触发条件） | ✅ |
| ④ 机检本批域零新增红 | §2.4（复跑读数：6 ∥ 7 与基线逐条相同） | ✅ |
| 三链同源（台账 #1457 十六行 = §2.1 = 设计档词面） | §2.1 ∥ §2.6 | ✅ |
| 产品码零触（设计轮） | §2.4 末条 | ✅ |

### 附：§2 自记勘误

- #1347 机检行 `ASYNNC 面` ⇒ 应为 `ASYNC_NOTE` 面（一处笔误，语义无变）。

### 附：§2 自记勘误（续）

- §2.7 验收对照行「§2.2（39 行）」计数收正：§2.2 表体实为 **45 行**（12 + 25 + 8），覆盖文件 **51 件**（产品码 37 ∥ 批内测试档 7 ∥ 设计档 7）——`39` 系笔误（D3 计数与清单同变）。

**── 修正轮记录（设计评审轮 1 · 发现 1..12 · 全受理零驳回 · 2026-10-15 · eng-designer）──**

**逐条对位表（号 → 状态 → 改动 file:line；行号 = 本轮落笔后实读）**

| # | 判级 | 处置 | 改动落点 |
|---|---|---|---|
| 1 | 🔴 | Fixed | `SESSION.md:189-191` ∥ `PROVIDER.md:390-394` ∥ `MODEL-SPECS.md:2113-2119`——禁用形三处按实装同判（取形单源 `thinkOffPath`/`thinkOffShape`；有有效 off 形 ⇒ 各携禁用形 ∥ 无 ⇒ 零发；`anthropic / google 分支不传即不思考` 失效句删；死坐标 `:57` 删） |
| 2 | 🟡 | Fixed | 本记录「逐腿落点表」（16/16 腿——卷面 6 ∥ 他档 1 ∥ record-only 9） |
| 3 | 🟡 | Fixed | `MODEL-SPECS.md:2113-2119`（off 形判据句 ∥ 闸关系异闸明书 ∥ 恒思考族 + 残留标照发 ∥ effort 形仍不发 ∥ 用例落点） |
| 4 | 🟡 | Fixed | `MODEL-SPECS.md:2109`（边界行改现行真相——四行中三行 `thinking` 已 `true`；史实归 §18.4 认账行） |
| 5 | 🟡 | Fixed | `SESSION.md:1009-1019`（词面判据 ∥ 写面词表 ∥ 读面渲染三合一重排；三类终结 note 在场性钉死——① done+note 在场 ∥ ② `⟦ev⟧stopped` 定格类零在场 ∥ ③ 真异常 error；删失效半句「写面词表零动」） |
| 6 | 🟡 | Fixed | `TEAM.md:119-120`（§4 补 CLI 两行 192⇒≈196 ∥ 506⇒≈510 + §2.3 越线指针）∥ `TEAM.md:199`（设计轮条目括注收正——成因句） |
| 7 | 🟡 | Fixed | `SESSION.md:1016-1019`（先例坐标三件：实现 ∥ 设计档节 ∥ 先例批）∥ `TUI.md:142`（SSH-SESSION 批 · 裁 A ∥ TOOLS §6.22；对齐/偏离句）∥ `TUI-INPUT-BOX.md:21`（本体收为指针——坐标随本体承于 TUI §4） |
| 8 | 🟡 | Fixed | `TUI-INPUT-BOX.md:17`（模式栈链补凭据窗位序——与 `TUI.md` §4 链同形） |
| 9 | 🟡 | Fixed | 本记录「卷面判据 8 索引」（逐档 HEAD⇒现读数 + 行宽口径） |
| 10 | 🟡 | Fixed | `TESTING.md:70`（标题域扩两面：挂载面双实例族防御 ∥ 内嵌 `node --test` 子进程） |
| 11 | 🔵 | Fixed | `SESSION.md:1162-1166`（设计轮条目自末行移上段顶——记录分层口径收正；原末行删，git diff 证无内容丢失） |
| 12 | 🔵 | Fixed | `TUI-INPUT-BOX.md:21`（让位规则本体单源 = `TUI.md` §4——D2；消规则两处漂移源） |

**逐腿落点表（16 腿 × 档:节 ∥ 记录内条目 ∥ 代码落点；类型 = 卷面 ∥ 他档 ∥ record-only）**

| 腿 | 设计落点（档:节） | 记录内条目 | 代码落点（实施轮） | 类型 |
|---|---|---|---|---|
| #1175 | SESSION §6.26 | §2.1 | subagent-freeze.mjs ∥ tool-events.mjs ∥ lifecycle-records.mjs ∥ render-segments.mjs | 卷面 |
| #1178 | 无（设计全量 = 本档 §2.1） | §2.1 | record-results.mjs ∥ dispatch-gates.mjs + 全仓引点 | record-only |
| #1179 | 无 | §2.1 | config-io.mjs | record-only |
| #1185 | TESTING §2.2（内嵌子进程规范块） | §2.1 | 四测试档 | 卷面 |
| #1186 | TESTING §2.2（既有规范引用——本腿 = 收正本体） | §2.1 | 2026-09-29-desktop-residuals-round3.test.mjs | record-only |
| #1188 | SESSION §6.26 | §2.1 | render-segments.mjs | 卷面 |
| #1200 | MODEL-SPECS §18.4 ∥ §18.8 | §2.1 | google.mjs ∥ model-specs.mjs | 卷面 |
| #1223 | TEAM §2.4 ∥ §3 D-TM3 ∥ PROVIDER §6.25 | §2.1 | slash-commands.mjs ∥ cmd-config.mjs | 卷面 |
| #1302 | 无 | §2.1 | thincoder-render-core + locales | record-only |
| #1304 | 无 | §2.1 | browser/launch.mjs | record-only |
| #1343 | 无 | §2.1 | tool-card-restore.mjs | record-only |
| #1347 | **他档**：AGENT-LOOP-ASYNC-POOL.md §6.34（语义单源——既有，本轮零触）；逐字稿 = 本档 §2.5（CN 正本待审批后落 prompts/common.md） | §2.1 ∥ §2.5 | parent-channel ∥ tool-docs/timer.md ∥ prompts/common.md（EN） | 他档 + record-only |
| #1376 | 无 | §2.1 | manifest.mjs | record-only |
| #1387 | 无 | §2.1 | terminal-routes.mjs + 新测试档 | record-only |
| #1432 | 无 | §2.1 | dispatch-gates.mjs ∥ log.mjs | record-only |
| #1437 | TUI §4 ∥ TUI-INPUT-BOX §1 | §2.1 | render-frame.mjs ∥ status-line.mjs（新）∥ layout.mjs ∥ ask-steps.mjs ∥ key-handler-search.mjs | 卷面 |

计数：16 = 卷面 **6**（#1175 ∥ #1185 ∥ #1188 ∥ #1200 ∥ #1223 ∥ #1437）+ 他档 **1**（#1347）+ record-only **9**（#1178 ∥ #1179 ∥ #1186 ∥ #1302 ∥ #1304 ∥ #1343 ∥ #1376 ∥ #1387 ∥ #1432）——「未落他档」的 9 腿设计全量 = 本档 §2.1（无外档落点面）。

**卷面判据 8 索引（#9——逐档 HEAD（批前）⇒ 现读数，`split('\n').length−1` 口径；本轮落笔后实读）**

| 档 | HEAD | 现（含修正轮） | 增量 |
|---|---|---|---|
| `docs/core/design/SESSION.md` | 1317 | 1331 | +14 |
| `docs/core/design/TEAM.md` | 195 | 200 | +5 |
| `docs/core/design/PROVIDER.md` | 872 | 879 | +7 |
| `docs/core/design/TESTING.md` | 522 | 529 | +7 |
| `docs/core/design/MODEL-SPECS.md` | 2337 | 2349 | +12 |
| `docs/cli/design/TUI.md` | 946 | 951 | +5 |
| `docs/cli/design/TUI-INPUT-BOX.md` | 391 | 395 | +4 |

行宽口径：本轮改动行全 ≤300（>300 既有长行集中各档「变更记录」区带——区带豁免在效，不逐条登记）。

**机检读数（本轮末跑 · `node scripts/doc-check.mjs` @ 仓根）**：判据项 7 项；**锚：悬空 0 —— 闸态 OK**（列报面 = 拟新增 34 ∥ 迁移期引文 341 ∥ 声明源缺位 0——不入闸）；**行宽：0 行超 300 —— OK**（区带豁免在效）；**行数面：差异 85 条（报告态——回填工单即本清单；七档读数见上表）**。

**各档修正轮变更记录一行**：7/7 已落（`SESSION.md:1162` ∥ `TEAM.md:200` ∥ `PROVIDER.md:879` ∥ `TESTING.md:529` ∥ `MODEL-SPECS.md:2131` ∥ `TUI.md:951` ∥ `TUI-INPUT-BOX.md:395`）。

**写域自证**：本批写入 = 七档（逐条落点见上 + 各档变更记录一行）+ 本档 §2（经 `batch` 工具）。**零产品码 ∥ 零测试档 ∥ 零需求档 ∥ 零台账触碰 ∥ 不 commit ∥ 不发起评审**（工作树内他批产品码改动为并行在飞，非本批写入）。

**上抛项**：无新增——12/12 全受理零驳回；#3 闸关系钉法（异闸 ∥ 恒思考族 + 残留标照发）依 §16.10 既有认账与 #1175 对齐方向直接导出，未引入新语义。

**── 修正轮记录（设计评审轮 2 · 发现 #13 · 受理 · 2026-10-15 · eng-designer）──**

**对位表（号 → 处置 → 改动 file:line；行号 = 本轮落笔后实读）**

| # | 判级 | 处置 | 改动落点 |
|---|---|---|---|
| 13 | 🟡 | Fixed | `MODEL-SPECS.md:2073` ∥ `:2089` ∥ `:2103`（三处口径随正）∥ 本档 §2.2 测试档表 `:196` 补行 ∥ §2.6 `:248` 随动面点名 |

**逐处（三条 + 两项登记）**
- `MODEL-SPECS.md:2073`（§18.4 零触面行）——「存量 gemini 四行」拆明：三行仅 `thinking` 随正（car2 批面；行名见认账行），三行其余字段 ∥ `gemini-3.1-pro` 全行零触。
- `MODEL-SPECS.md:2089`（§18.6 AC-2 判定方式）——「除三行 `thinking` 随正（car2 批面；行名见 §18.4 认账行）外，其余字段逐字段不变」式（§18.8 同式）。
- `MODEL-SPECS.md:2103`（§18.7 G-5 期望）——三行 `thinking` 随正 `true` 入期望（其余字段逐字段不变；`gemini-3.1-pro` 零改）。
- 本档 §2.2 `:196`——补 `docs/batches/2026-10-10-gemini-model-specs.test.mjs` 行（现读 103 ⇒ 预期 ≈103；#1200 G-5 期望随正）。
- 本档 §2.6 `:248`——随动面点名（该档期望更新 = 实施面）。

**#13-② 实读裁据（该档断言三行取值 ⇒ 更新入实施面）**：`docs/batches/2026-10-10-gemini-model-specs.test.mjs:76-78`（三行期望对象携 `thinking: false`）∥ `:84`（deepEqual 全值）——落笔前复跑 = 全绿 **7/7**（G-1..G-7，`pass 7 / fail 0`）⇒ 断言现行值成立；现盘值 = `thincoder-core/model-specs.mjs:202-204`（`thinking: false`，car2 实施改 `true`）⇒ 随正后该档必红。更新内容 = 三行期望改 `thinking: true`（其余字段不动）+ 标题 `:74` ∥ 档头注 `:10` 同拍（同行内改——行数 ±0）。

**计数同变（D3）**：本档 §2.2 表体 45 ⇒ **46 行**（12 + 25 + 9）；覆盖文件 51 ⇒ **52 件**（产品码 37 ∥ 批内测试档 8 ∥ 设计档 7）；`MODEL-SPECS.md` 2349 ⇒ **2351**（+2——变更记录两行；三处为同行内替换 ±0）。

**机检读数（本轮落笔后 · `node scripts/doc-check.mjs` @ 仓根）**：锚 悬空 **0**（闸态 OK）∥ 行宽 **0**（OK）；本批域零新增红——5 条 MODEL-SPECS 列报（迁移期引文/拟新增·不入闸）与批前逐条相同（仅行号随本档 +2 位移：`:2246`/`:2284` ⇒ `:2248`/`:2286`）；行数面差异 87 ⇒ 88（+1 = `docs/desktop/design/PACKAGING.md:341`——桌面域平行在飞，非本批域 ∥ 报告态非闸）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

## 设计评审轮次报告（car2 核/CLI 面收尾 · 16 腿 · 首轮）

**评审对象** = car2-core-cli 批在本卷七档（SESSION ∥ TEAM ∥ PROVIDER ∥ TESTING ∥ MODEL-SPECS ∥ TUI ∥ TUI-INPUT-BOX）内的设计落笔。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Document ownership | 🔴 | 同一机制两处不同说法（标题径 google/anthropic 禁用形）：`SESSION.md:189` 写「anthropic / google 分支不传即不思考」，而 `PROVIDER.md:391` 写「openai `thinking:{type: "disabled"}` / anthropic 同 / google `thinkingConfig: {thinkingLevel: "none"}`」，本批新增的 `MODEL-SPECS.md:2113` 又以同一 google 载荷形为「标题径先例」——三处中 SESSION 一处与另两处相抵（机制级），且本批恰在扩展同一载荷族（chat 通路） | 以实装为准收正一处：删/改 SESSION §6.7「anthropic / google 分支不传即不思考」半句（失效表达按 2026-09-18 「失效的表达一定要删掉」裁决删除，史实归变更记录），或反向收正另两处坐标——三处须对同一标题载荷形逐字同判 |
| 2 | Requirements coverage | 🟡 | 声明为 16 腿的收尾面，本卷七档仅能核到约 7 条（写面归一＝§6.26；google 面＝MODEL-SPECS §18；消费面补齐＝PROVIDER §6.25 ∥ TEAM §2.4；假绿收正＝TESTING §2.2；文字/显示面＝TUI §4 ∥ TUI-INPUT-BOX §1）；verify 失效链 ∥ 零写返错 ∥ 盘符硬化 ∥ 冻结注记 ∥ 核件词面 ∥ 孤儿回收 ∥ 回读卡 ∥ scope 缓存 ∥ TLS 腿 ∥ args 遮蔽 ∥ render-frame 拆分 在本卷面**零落点**（不可核——卷外） | 在卷面或批档 §2 逐腿列出设计落点坐标（档:节），以区分「落在他档」与「未落」；否则本轮 pass 不应被读作 16 腿齐备 |
| 3 | Acceptance criteria | 🟡 | `MODEL-SPECS.md:2113` 新增的 google chat 载荷分支在 §18.6 验收表 / §18.7 用例表内无对应行；其条件「`provider.thinking` 在场」与所引「标题径先例」的闸不同——`MODEL-SPECS.md:2054` 明写标题径判据 = 「③生成标题零发禁用形（…「无有效 off 路径 ⇒ 不发禁用形」；判据单源 = §16.4）」，且 `:1852`（§16.10）已认账「残留标照发 ⇒ 服务端 400」类，本句未对 google 侧该类残留作处置 | 给该分支补判据句 + AC/用例（正常：off 形在场 ⇒ `thinkingConfig` 落 `thinkingLevel: "none"`；边界：恒思考族 + 残留标 ⇒ 断言其行为与闸），或把落点/判据指针显式指到批档 §2 |
| 4 | Document ownership | 🟡 | `MODEL-SPECS.md:2109` 边界句仍留「不动存量表行（四行；本批零改他行——三行 `thinking` 后随 car2 批随正，见 §18.4 认账行；差异认账见 §18.1 KD-3）」——「不动存量表行」已非现行真相（car2 改三行），失效句留在边界规范面 | 该边界行重写为现行真相（三行 `thinking` 已为 `true`、第四行无键维持），史实（原 `false` 的成因 / 批号）只留变更记录与 §18.4 认账行 |
| 5 | Clarity / Doc-state | 🟡 | SESSION §6.26 新条与同节旧句相抵：`SESSION.md:1010` 仍称「写面词表零动（三端各写各词——CLI `stopped` ∥ VSC ∥ 桌面 `cancelled`）」，而 `:1011` 新条称「① interrupted ∥ turn-cap ∥ stopped-by-user 三类终结 ⇒ 写面 `status:"done"` + `note`」；且 `:1012`「② stopped 面**零注记**（原因词与 verb 重复不重复呈现——对齐核件 `cancelled` 面）」与 ① 的 stopped-by-user ⇒ done+note 之关系（该类到底带不带 note）从文面不可判定 | 把 §6.26 的写面词表与读面词面三合一重排（现行词表逐档列：写什么词 ⇒ 读面渲染什么），删「写面词表零动…CLI `stopped`」失效半句；顺带钉死三类终结的 note 在场性 |
| 6 | Clarity / 受影响文件 | 🟡 | TEAM 消费面口径两说：`TEAM.md:54`「**六消费面各一处过滤**」vs `TEAM.md:197`「（B1 批补全词面加入 `team` 后暴露——两面过滤零涉）」；且新增两面（`thincoder-cli/src/tui/slash-commands.mjs` ∥ `thincoder-cli/src/tui/cmd-config.mjs`）在 §4 受影响文件表无行（`TEAM.md:117`-`:118` 仅 model-picker / provider-admin 两行，注「设计表缺行，补登」）——该两面若确需过滤，行数 / 增量面缺账 | 钉死两面性质并同拍：需过滤 ⇒ §4 补两行（现行行数 ⇒ 增量）；不需过滤 ⇒ 收正 §2.4「各一处过滤」为「四面过滤 + 两面只读」 |
| 7 | Closest-precedent | 🟡 | 本卷面 car2 语句中仅 `MODEL-SPECS.md:2113` 携先例坐标（`thincoder-core/generate-title.mjs:74`）；`SESSION.md:1011` 的对齐对象只写「与 VSC 写面同形——跨端显示差默认消，方向 = CLI 对齐核件/VSC 形」（无 档:节 ∥ 批号），TUI 两条（`TUI.md:140` / `TUI-INPUT-BOX.md:21`）亦无先例坐标（TESTING 条有模板坐标 = `TESTING.md:81`）——判据 9 的「先例坐标 ∥ 对齐/偏离」三件仅部分满足（卷外批档是否承载 = 不可核） | 逐条补先例坐标（实现坐标 ∥ 对应设计档节 ∥ 先例批）与对齐 / 偏离句，或显式写「无先例」声明 |
| 8 | Consistency | 🟡 | 模式栈优先链两档不同形：`TUI.md:133` 链含「凭据窗（`secretPrompt`…）」一行，`TUI-INPUT-BOX.md:17` 链（「模式栈互斥，优先级从高到低：`permission → question → search → interruptPrompt → picker 栈 / wizard → 正常输入`」）无凭据窗——而本批新增句（`TUI-INPUT-BOX.md:21`）正把凭据窗列为三掩码面之一并让其接管输入框显示面 | 两档链同形（补凭据窗位序）或点明 TUI §4 为链权威、TUI-INPUT-BOX 只留输入框侧子集并加指针 |
| 9 | Affected-file annotations | 🔵 | 判据 8 在本卷面不可核：七档均纯 `.md`（免档位），car2 批次的产品码 / 测试档「现状行数 ⇒ 预期增量」表与 >300 软线登记不在卷面（`MODEL-SPECS.md:2075` / `TEAM.md:108` 等表头均为各自旧批 as-of 读数） | 卷面（或批档 §2 指针）点明逐档「现行 ⇒ 增量」与 >300 登记面，使判据 8 可在同轮核 |
| 10 | Clarity | 🔵 | `TESTING.md:70` 标题域（「### 2.2 单元测试档挂载面规范（双实例族防御 · #788）」）与新增子块域不符——`TESTING.md:80`「**内嵌 `node --test` 子进程规范（#1185 收编 · 2026-10-15）**」属另一族（子进程证据 / 假绿） | 标题域扩为两面（双实例族 ∥ 内嵌子进程）或该子块升为独立小节 |
| 11 | Doc hygiene | 🔵 | SESSION 变更记录定位与档内自述规则相抵：`SESSION.md:1172` 声明「上段 = 拆档后各批（条目自顶向下倒序累积——找「最后变更」看上段首条）」，而 car2 条落在末行（`SESSION.md:1320`，属「下段 · 建档期逐批累积（升序）」区）——按自述规则找「最后变更」会漏掉本批 | 把 car2 条移至下段之外（上段顶）或改述分段规则使其与现布局一致 |
| 12 | Document ownership | 🔵 | 同一条「掩码面在场 ⇒ 输入框显示面让位」规则在 `TUI.md:140` 与 `TUI-INPUT-BOX.md:21` 各写一遍（两处同携 `ask-steps.mjs` `maskSurfacePresent` 单源指针）——D2「不重述」纪律下属重复描述，两处措辞需长期同步 | 一处留规则本体、另一处收为指针（或明确双面各写半边：键路由 ∥ 显示面），避免双份文字漂移 |

**计数**：🔴 1 ∥ 🟡 7 ∥ 🔵 4（合计 12）。

**卷外注（不计严重度）**：
- `docs/batches/2026-10-15-car2-core-cli.md`（本批落点表 / 受影响文件 / 用例 / AC 的唯一承载面）不在本卷面——判据 8/9 的完整核对（逐档「现状 ⇒ 增量」、>300 软线登记、>500 拆分评估）未由本轮完成；grep 实读可见该档 `:194`-`:195` 两支测试档（≈260 ∥ ≈200）与 `:123` TLS 腿落点（`thincoder-server/src/sandbox/terminal-routes.mjs:96`（参数）+ `:329`（透传））。
- 16 腿中其余腿的设计面疑在他档（如 `docs/core/design/AGENT-LOOP.md` / `MANIFEST.md` / `MEMORY.md` 邻位）——本轮依指令只读卷面文件，未读他档；不对「腿齐备性」作判断。
- 限制：无 Document Map（判据 7 降级——仅按 AGENTS.md 与各档自述归属判断）；无项目标准档声明（方法学按 AGENTS.md + 各档建制纪律判断）。

VERDICT: changes-required

### 轮次 2（评审子代理）

## 设计评审轮次报告（car2 核/CLI 面收尾 · 轮 2 · 核验 §3 轮次 1 十二条修正）

| # | Orig# | File | Severity | Status | Notes |
|---|-------|------|----------|--------|-------|
| 1 | 1 | `SESSION.md:189-190` ∥ `PROVIDER.md:391-393` ∥ `MODEL-SPECS.md:2114` | 🔴 | Fixed | 三处按实装同判、失效句已删——`SESSION.md:190`「有有效 off 形 ⇒ openai 兼容 ∥ anthropic 携 `thinking:{type:"disabled"}`（`:63` / `:91`）、google 携 `generationConfig.thinkingConfig:{thinkingLevel:"none"}`（`:74`）」；`PROVIDER.md:393` 同形（死坐标 `:57` 删）；与 `MODEL-SPECS.md:2114` 逐字同判 |
| 2 | 2 | 批档 §3「逐腿落点表」（卷外佐证） | 🟡 | Fixed | 16/16 腿齐（卷面 6 ∥ 他档 1 ∥ record-only 9），逐腿「档:节 ∥ 代码落点 ∥ 类型」；修正记录 `:288`-`:309` 实读 |
| 3 | 3 | `MODEL-SPECS.md:2113-2119` | 🟡 | Fixed | 判据句 + 异闸明书 + 恒思考族/残留标照发（对齐 §16.10：`MODEL-SPECS.md:1852`「**不清理既存失配态**：修复前写入的「强制族 + `{type:"disabled"}`」标记会照发（服务端 400）」）+ `:2119` 用例落点（批档测试档三例） |
| 4 | 4 | `MODEL-SPECS.md:2109` | 🟡 | Fixed | 边界行改现行真相——「存量表行现态：四行中三行的 `thinking` 键已为 `true`（随正 = car2 批——§18.4 认账行；逐行名见彼处）」；同类残项见 #13 |
| 5 | 5 | `SESSION.md:1011-1016` | 🟡 | Fixed | 三合一重排、逐类对位——① `:1013`「⇒ 写面 `status:"done"` + `note` **在场**」∥ ② `:1015`「② **`⟦ev⟧stopped` 定格类** ⇒ 写面 `status:"stopped"`（注记**零在场**）」∥ ③ error；「写面词表零动」失效半句已删（`:1011` 止于「读面按本三条容多写词（各端自做）。」） |
| 6 | 6 | `TEAM.md:54-56` ∥ `TEAM.md:119-120` ∥ `PROVIDER.md:614-616` | 🟡 | Fixed | 六消费面各一处过滤三档同拍；§4 补两行——`TEAM.md:119`「**192 ⇒ ≈196**（car2 批——`/model`·`/submodel` Tab 补全面过滤」∥ `:120` `cmd-config.mjs` **506 ⇒ ≈510** + 越线拆分指针；changelog `:199`-`:200` 成因句收正 |
| 7 | 7 | `SESSION.md:1018-1021` ∥ `TUI.md:142` ∥ `TUI-INPUT-BOX.md:21` | 🟡 | Fixed | 先例坐标三件齐——`TUI.md:142`「**先例（#7 补）**：键路由半先例批 = SSH-SESSION 批 · 裁 A（`docs/batches/2026-10-14-ssh-session.md`；设计档节 = `docs/core/design/TOOLS.md` §6.22 掩码守卫句）」+ 对齐/偏离句；TUI-INPUT-BOX 收为指针 |
| 8 | 8 | `TUI-INPUT-BOX.md:17` | 🟡 | Fixed | 模式栈链补凭据窗位序——「`permission → question → search → interruptPrompt → picker 栈 / wizard → 凭据窗（`secretPrompt`）→ 正常输入`」，与 `TUI.md:133` 链逐位同形 |
| 9 | 9 | 批档 §3「卷面判据 8 索引」（卷外佐证） | 🔵 | Fixed | 七档逐档 HEAD ⇒ 现读数（+14 ∥ +5 ∥ +7 ∥ +7 ∥ +12 ∥ +5 ∥ +4）+ 行宽口径；产品/测试档「现读 ⇒ 预期 ⇒ 行」表 = 批档 §2.2 `:142`-`:198` |
| 10 | 10 | `TESTING.md:70` | 🔵 | Fixed | 标题域扩两面——「### 2.2 单元测试档规范（挂载面双实例族防御 ∥ 内嵌 `node --test` 子进程 · #788 ∥ #1185）」 |
| 11 | 11 | `SESSION.md:1163-1168` | 🔵 | Fixed | car2 两条（修正轮 `:1164` ∥ 设计轮 `:1168`）已置「## 变更记录」首——与 `SESSION.md:1186`「> 分段口径：**上段 = 拆档后各批（条目自顶向下倒序累积——找「最后变更」看上段首条）** · **下段 = 建档期逐批累积（升序）**。」一致 |
| 12 | 12 | `TUI-INPUT-BOX.md:21` ∥ `TUI.md:140-142` | 🔵 | Fixed | 让位规则本体单源收于 `TUI.md` §4（判据 ∥ 消费点 ∥ 先例坐标一处）；TUI-INPUT-BOX 留一句行为陈述 + 指针（「本档不重述——D2」） |
| 13 | (新) | `MODEL-SPECS.md:2073` ∥ `:2089` ∥ `:2103` | 🟡 | New | 同族残项（#4 只同拍 §18.8 一处）：`:2068` 已记「三行 `gemini-3-pro` / `gemini-2.5-pro` / `gemini-2.5-flash` 原携 `thinking: false`，2026-10-15 **car2 批随正为 `true`**」，而 `:2073`「**零触面**：存量 gemini 四行 · `SORTED_SPECS` / 查表语义 / 告警文案 / `DEFAULT_SPEC` · 预设表（`thincoder-core/config-presets.mjs`）· 传输面（`thincoder-core/provider/**`）· 三端代码。」、`:2089`「零改既有面：存量 gemini 四行逐名与批前同判」、`:2103`「逐名与批前同判（取值逐字段不变；`gemini-3.1-pro` = `{ context: 1_048_576, maxOutput: 65_536 }` 零改）」仍持旧陈述；car2 批档 §2.2 清单无 `docs/batches/2026-10-10-gemini-model-specs.test.mjs`（G-5 载体）更新行 ⇒ 若 G-5 断言三行取值（字面如此），实施随正后该档复跑将失真／红（测试档本体未读——不可核，卷外）。建议：三处补 car2 注或把 G-5 断言收为「除 `thinking` 外逐字段」（§18.8:2109 已行此式）；该测试档更新列入 car2 实施文件清单／判据行 |

**卷面绑定异常（提请父侧核）**：本轮「Agent Response / Instructions」块给出的 review surface = 10 档（`2026-10-15-member-pull-inline-cred.md` ∥ `CHAT.md` ∥ `MEMBER-AGENT.md` ∥ `check-vsix.mjs` ∥ `docs/server/requirements/PROJECT.md` ∥ `MCP.md` ∥ `2026-10-15-member-face-parity.md` ∥ `views-me-chat-pull.mjs` ∥ `views-me-chat.mjs` ∥ `i18n-zh-me.mjs`），与本轮《Review-object declaration》/《Documents to Review》（car2 七档设计面）及轮 1 发现表（全落 car2 七档）无交集——按声明纪律以 car2 七档为卷面完成核验；上述 10 档未读未评（若该 10 档才是本轮预期卷面，本轮绑定错线，需另轮）。批档 §3 修正轮记录对位表把发现 9 ∥ 10 记为 🟡（轮次 1 报告记 🔵）——卷外记账小差。

**限制**：无 Document Map（判据 7 降级）；无项目标准档声明。

**计数**：原表 12/12 Fixed（🔴1 ∥ 🟡7 ∥ 🔵4 全闭）；新发现 🟡×1；未决 🔴 = 0。

VERDICT: pass

## §4 用户批准（主 agent）

**父侧代签（承用户 2026-10-15 01:19 全链自动授权）**：设计评审轮 1（#60 = changes-required · 12 条全受理 → 修正轮 #63 段内订正）→ 评审轮 2 = **pass**（§3 轮次 2：12/12 Fixed ∥ 🔴 0 ∥ 新 🟡#13 当场受理）⇒ 批准；实施三席已发（核面 ∥ 测试面 ∥ 三端席——§1:45 裁定在案）。

## §5 实施记录（eng-coder）
**状态行**：实施完成（三案全量落（含超声明六件）；内审 1🔴 已修（哨兵修复轮）⇒ 评审 pass；随正清单见段内）



### 交付摘要（car2 核面 · eng-coder · 2026-10-15）

七案全落（含父裁 #1376 反转注册；测试档 1 行由父侧直接执行）：

| 案 | 落点 | 实读行数（§2.2 预期） | 机检读数（实跑） |
|---|---|---|---|
| #1178 | `agent/record-results.mjs:98` 条件 `!tool.readonly && !isReadonlyAction(toolCall.name, actionArgsOf(toolCall)) && !tool.sideEffectExempt` | 194（≈190） | 只读动作（settings/manifest/subagent）⇒ `_verifiedThisRun` 保留；set/write/spawn/bash ⇒ 清；畸形 args ⇒ 保守清零抛；旧标识符产品码零余（全仓 grep：仅历史批档 ∥ 设计档 ∥ `.thincoder/tmp` 备份件） |
| #1179 | `config-io.mjs` 两函数早退（在册前置检查） | 287（≈288） | 渠道缺 ⇒ `Provider "x" not found` + 盘面字节 ∥ mtime 零变；在册 ⇒ null ✔ |
| #1200 | `provider/google.mjs:89` off 形载荷；`model-specs.mjs:202-204` 三行 `thinking:true` | 288（≈290）∥ 369（±0） | 本地 http 假服务捕 body：off 形 ⇒ `{thinkingLevel:"none"}` 逐字；缺省 ∥ on 形 ∥ null ⇒ 零新键；`gemini-3.1-pro` 零改 ✔ |
| #1347 | `tool-docs/timer.md:11-12` ∥ `agent-tools/parent-channel.mjs:58` ∥ `prompts/common.md:86-87` | 13（12，+1）∥ 241（±0）∥ 216（±0） | 三面 EN 逐字 = §2.5 稿；timer.md 旧句零余；ASYNC_NOTE 后两句零改 |
| #1304 | `browser/launch.mjs:99-141` 回收器 + `:155-157` 启动序插入（`reclaimIo` 缝） | 189（≈185） | 缝注入四场景 ✔；**真机**（Edge ∥ 临时 profile）：A 起 port 64071 ⇒ 零回收再启 ⇒ 起不动（`DevToolsActivePort not written within 4s`）⇒ 默认回收再启 ⇒ 起 port 61918；清理后零残留进程 |
| #1376 | `manifest.mjs:190-198` 订阅点 + `:241-249` init 支广播；`declaration.mjs:10` `/`:316` 注册 | 286（≈275）∥ 378 | 注册—广播—退订全链 ✔；失败路径零广播 ✔；红控（直建档 ⇒ 缓存 stale）✔；绿（建档 ⇒ 同进程 `declaredIndexScope` 即时见新档）✔；两装载序各 ✔；`manifest.mjs` 零出边断言 ✔ |
| #1432 | `log.mjs:161-169` `redactArgs` + `dispatch-gates.mjs:36` 先遮后截 | 214（≈210）∥ 151（≈150） | 键级 ∥ 内容级 ∥ 嵌套 ∥ 数组 ✔；`logToolError` 真链盘面含 `[REDACTED]` ∧ 零令牌字面（探针文件写后即删） |

行数口径 `split("\n").length − 1`；除上表外另 2 件为注释随正各 1 行（`agent-tools/manifest.mjs:131` ∥ `tools/ops.mjs:63`）；`browser/session.mjs` 等 ±0 零改；无件越 500。

### 决策透明表

| 决策 | 依据 ∥ 代价 | 披露 |
|---|---|---|
| #1304 锁空闲判据落在回收器内（读 `session.lock` + `isAlive`，与 `acquireProfileLock` 同三 token 判） | 设计句「锁空闲 ⇒ 回收；锁被活 pid 持 ⇒ 不回收」在回收器内自持 ⇒ 负控在「直接调回收器」与「全流程」两层都成立；代价 = 锁判据第二处表达式（未抽公共函数——不动 `acquireProfileLock` 零改面） | 如实披露 |
| #1304 `io` 缝含 `readText`/`isAlive`/`pid`（对齐 `acquireProfileLock` io 形） | 无真实文件系统即可驱动活锁 ∥ 陈旧锁 ∥ 零孤儿 ∥ 抛错四态 | — |
| #1376 反转注册（父裁落地） | `manifest.mjs` 零出边保持（KD-M1-33）；代价 = `declaration.mjs` 声明外件 + 订阅点未入设计档（已上抛） | 见「域外面」 |
| #1432 非串值仅黑名单键名整键遮蔽；键级 ∥ 内容级复用 `redactSecret` | 「宁可丢信息不漏密钥」同判据 ∥ 单源复用 | 🔵 残余已登记（JSON 引号形） |
| #1200 三行只改值零注释 | §2.2 预期 ±0；族证 ∥ 认账行已在 `MODEL-SPECS.md` §18.4 落 | — |

### 审计与代码评审（轮次与终态）

- **内部发散审计（explore · 1 轮）**：`DEVIATIONS` —— **部分实现 0 ∥ 静默简化 0**；越声明 2（`tools/ops.mjs:63` ∥ `agent-tools/manifest.mjs:131`——注释随正）+ 文档漂移 2（`docs/core/design/API-CONTRACT.md:839` 生成区旧名 ∥ 旧坐标；`MANIFEST.md:214/:619` ∥ `DESIGN-TOKEN-SETTLEMENT.md:218` 旧名——设计席面）。
- **内部代码评审（advisor · 1 轮）**：`VERDICT: pass` —— 0 🔴；🟡×3 全为**报告项**（① 批档 §2.1 #1200「`provider.thinking` 在场」字面 vs 实装 off 形判据——`MODEL-SPECS.md:2113` 为准、实装正确；② `onManifestInit` 未入 `MANIFEST.md` 接口面——父裁㈡已定「设计席补注」；③ 旧名仍见四份设计/契约档）；🔵×4（锁路径第二处字面量 ∥ 同步列举开销（量级未实测）∥ JSON 引号形内容级不命中（残余登记）∥ verify 面用核谓词未走钩子优先——按 §2.1 落、非偏离）。该轮机检面回报 7 条引证「file unreadable」= 检查侧路径解析故障，非内容判定（本席引证取自实读行）。
- **fix round**：代码面 **0 轮**（无必修项）；测试档 1 行（`docs/batches/2026-10-07-ledger-tool.test.mjs:249`）由**父侧直接执行**落定（我侧写被跨批档门拒——未绕门），不计入本席交付面。
- **终态**：`clean`（0 必修；3 报告项 + 4 提示项已上抛）。

### 验证读数（实跑）

- 探针 `.thincoder/tmp/car2-core-probe.mjs`：`ALL PROBES PASSED`（七案逐判据；含等价证据 `isReadonlyAction("subagent", { action: "design-slots" }) === true`）。
- 真机 `.thincoder/tmp/car2-1304-real.mjs`：红 ∥ 绿对读数见上表 #1304。
- 入口序 `.thincoder/tmp/car2-1376-order.mjs`：`declaration-first` ∥ `manifest-first` 两进程各 `PASS`。
- 受影响既存单元档定向复跑 21 档（`node --test`）：**217/220 绿（1 skip）**；2 红**与本批零涉**——① `2026-10-08-provider-key-guards-core.test.mjs:103` T-C1b **HEAD 基线同红**（`git archive HEAD` 副本实跑取证，属既存 mtime 夹具失真）；② `2026-10-10-gemini-thought-signature.test.mjs:189` AC-9 期望集缺 `thincoder-server/src/agent/chat-compact.mjs`（他面既存）。
- 三档滞后红（他席 ∥ 父侧面）：`2026-10-10-gemini-model-specs.test.mjs:76-78`（G-5 期望 `thinking:false`——§2.6 随正面）∥ `2026-10-07-ledger-tool.test.mjs:249`（父侧已落）∥ `2026-09-29-structure-split-2.test.mjs`（行数 ∥ sha ∥ 导出名集冻结面 + 缺 `chat-digest.mjs`——他席在飞面）。

### 域外面 ∥ 越声明（如实披露）

| 件 | 笔 | 原因 |
|---|---|---|
| `thincoder-core/declaration.mjs` | +2 行（import 名 + 注册行） | 父裁：反转注册落点 |
| `thincoder-core/tools/ops.mjs:63` | 注释 1 行 | §2.1 #1178「全仓引点随改」（旧标识符零余含注释面） |
| `thincoder-core/agent-tools/manifest.mjs:131` | 注释 1 行 | 同上 |
| `.thincoder/tmp/car2-*`（探针 3 件 + 日志） | 临时区 | 非交付物；审计 ∥ 评审已点名 |
| `docs/batches/2026-10-07-ledger-tool.test.mjs:249` | — | **父侧直接执行**；等价证据：①该档唯一红 = 旧名 `TypeError`；②新名下同调用探针实测返 true |

### 上抛项

- `[上抛·知会]` 批档 §2.1 #1200 条件句字面差（设计档为准，零语义）——是否随正请父侧 ∥ 设计席裁。
- `[上抛·知会]` `onManifestInit` 未入 `MANIFEST.md` 接口面（父裁㈡在案）。
- `[上抛·知会]` 旧名四份设计/契约档残留（`API-CONTRACT.md:839` 生成区；该脚本 `--check` 不入闸）。
- 另报：批内机检档 `docs/batches/2026-10-15-car2-core-cli.test.mjs` 不在盘（另席）——本席回归证据仅临时探针件；终态核销时该档未跑，请复核其状态。

### 5.1 交付摘要（eng-coder · 2026-10-15）

**实施面 = CLI 四行**：#1175 ∥ #1188 ∥ #1437 ∥ #1223（§2.2 文件表 CLI 行 11 件，含新档 `status-line.mjs`）。零越界：本席实触 = 上列 11 件；仓内其余脏面（`thincoder-core/**` ∥ `thincoder-render-core/**` ∥ `thincoder-desktop/**` ∥ `thincoder-server/public/i18n-*.mjs` ∥ `docs/**`）为并行批在飞，非本席所改。

**逐件落点（行号 = 实施轮实读；行数口径 = `split("\n").length − 1`）**

- `subagent-freeze.mjs`（253 ⇒ 259）：`finishSubTaskKey` 三参 `lastError` ⇒ `note`（`:75`）∥ `finishSubTask(state, roles, note)` 签名兼容（恒 no-op——F-2 在册）∥ `freezeAllSubTasks` 未 done 者 `sub.note = "interrupted"`（`:222`；Ready 态跳过）∥ 冻结单点判据 `!stopped ∧ lastError ⇒ errored` 字面零改、语义随载体收窄（`:100`，注释随正）。
- `tool-events.mjs`（460 ⇒ 462）：两处标记 `:225` ∥ `:253`——`lastError` ⇒ `note`（串逐字 = `turn cap reached — work may be partial` ∥ `stopped by user — work may be partial`）。
- `lifecycle-records.mjs`（210 ⇒ 216）：status 三元字面零改（`:57`）∥ `meta.note` 写出（`:63`，`!lastError ∧ !stopped` 守卫——§6.26 判据②③）∥ `synthSubTask` 回填 `note`（`:164`）。
- `render-segments.mjs`（176 ⇒ 186）：注记分面（`:107-109`）+ `noteSuffix`（`:72-76`：空白折叠 + 140 上限，超 ⇒ 前 139 + `…`）。
- `status-line.mjs`（新档 197）：状态栏族随迁——`SLASH_HINTS` ∥ `QUIET_MS` ∥ `attentionKind` ∥ `renderStatus` ∥ `buildStatusLine` ∥ `sessionTitleFallback`（随迁决断见 5.2）∥ `teamSegmentHint` ∥ `teamServerHost`。
- `render-frame.mjs`（495 ⇒ 321）：族体迁出（−174）；`:24` 自引 `renderStatus`；`:29` 转发再出口（`QUIET_MS` ∥ `attentionKind` ∥ `renderStatus`——既有 import 面零破坏）；`:294` 框题掩码守卫。
- `layout.mjs`（246 ⇒ 250）：`:65` 内容式掩码守卫（`searchFace`）。
- `ask-steps.mjs`（61 ⇒ 69）：`maskSurfacePresent` 迁入并导出（`:54`——判据单源）。
- `key-handler-search.mjs`（136 ⇒ 131）：本地件删除 ⇒ 引单源（`:7` 导入 ∥ `:65` 消费）。
- `slash-commands.mjs`（192 ⇒ 194）：`:153`/`:156` 两处 filter（Tab 补全）。
- `cmd-config.mjs`（506 ⇒ 509）：`:297`（探针循环）+ `:307`（条目录入）两处 filter。

**机检读数（本席实跑；证据资产 = `.thincoder/tmp/`）**

1. **写/读面**（`car2-freeze-sample.mjs` ⇒ `car2-after/freeze-sample.after.txt`，23 行）：三终结均身 `{status:"done", note:…}`（turn-cap ∥ stopped-by-user ∥ interrupted；`interrupted` 走 `freezeAllSubTasks` 径）∥ 真异常 `{status:"error", error:"boom"}` ∥ stopped 面零注记 ∥ stopped+lastError 残注记已收（修前 `— boom`）∥ done 负控逐字 ∥ 跨行注记折叠 ⇒ 单空格 ∥ 141 字符注记 ⇒ 前 139 + `…`（注记长 140）∥ 三终结 `head` ≡ `rebuild-head`。红绿对：`car2-baseline/freeze-sample.before.txt`（三终结面 `status:"error"`）⇒ after（`status:"done"`+note）。
2. **拆分（结构零语义面）**（`car2-statusline-sample.mjs`，44 夹具）：整样本 sha256 `38bb711a…`（before，114447 B）⇒ `c8867a33…`（after，114583 B）；差异面 = **恰 4 支**「搜索已开 + 掩码弹出」交错显示夹具（`search+secretPrompt-masked` ∥ `search+teamAsk-password` ∥ `search+teamAsk-server` ∥ `search+wizard-password`——掩码面接管框题 ∥ 内容 ∥ 边框色）；其余 40 支逐字同；负控 `search+wizard-server`（wizard 非 password 步）不变。两档 <500（321 ∥ 197）∥ `node --check` 11/11 OK。
3. **#1223 三面**（`car2-derived-probe.mjs`）：`/model ` ∥ `/submodel coder ` ∥ `/config` 默认模型菜单——before 三面含 `team`（派生无 key）⇒ after 三面零在场；`team2`（派生带 key）与手工渠道仍在场（正控）。红绿对在盘（`car2-baseline/derived-probe.before.txt` ⇒ `car2-after/derived-probe.after.txt`）。
4. **项目自检**：`thincoder-cli` `node test/run.mjs` = 「test manifest is empty — zero tests = green」（2026-09-28 全仓测试重置态——判据空转，如实记）∥ 归档批件复跑 12 件 + wave-a：**新增红 = 恰设计预报集**（`2026-10-04-stream-ledger-lines-retire` T15——链源面随拆迁 `status-line.mjs` ∥ `2026-10-10-cross-end-alignment` L2-2——stopped 面零注记即 #1188① 语义）**+ 外部归因集**（cross-end L3-1/L3-2 ∥ `2026-10-02-record-shape-residuals` L2/L6——`thincoder-desktop/node_modules/@thincoder/render-core` 于 02:21:55 被并行批重装为**物理拷贝**、桌面链 i18n 单实例前提破 ⇒ 核件侧词面回落 key；`node --import ./.thincoder/tmp/car2-rc-alias.mjs --test <档>` 复现「拷回 junction 即转绿」）；其余 8 件前后同集同数（`ssh-session-cli` 9/9 ∥ `hatch-clearance-2` 10/10 ∥ `record-shape-contract` 6/6 ∥ `digest-recovery` 20/20 ∥ `crossline-clearance` 4/4 全绿）；wave-a 前后失败集与原因逐字同（④ ⑤b 类零新增）。

### 5.2 决策透明表（本席权限内自主决断）

| 决策 | 依据 | 备选与否决因 |
|---|---|---|
| `sessionTitleFallback` 随族迁出（设计符号名单未列） | 仅被 `buildStatusLine` 消费（`status-line.mjs:173`）——留原档将成反向依赖 | 备选：留 render-frame ⇒ 新档反引旧档（依赖倒挂），否决 |
| 无 key 支保留 `finishSubTask(…, note)` 调用 | F-2 收窄裁定在案（恒 no-op）；删调用 = 越界改签名语义 | 备选：删参 ⇒ 触旧调用面（老回调/测试直调），否决；残余面入评审表 🔵 |
| `meta.note` 写出带 `!lastError ∧ !stopped` 守卫 | §6.26 判据②③（停止 ∥ 错误面注记零在场）——防御性对齐 | 备选：无条件写出 ⇒ 三面可能同携 |
| 段缓存签名 fSig 不扩（`note/stopped/errored` 未入） | 冻结块建后不可变（批 2026-09-20 在册不变式）；扩签行为零变但增面 | 备选：扩签（评审 🔵 #2 建议）——留父侧裁 |
| 测试/设计/批次档零触 | 声明排除域（另一席/设计席笔） | — |

### 5.3 审计与代码评审轮次与终态

- **内部发散审计**（explore · 只读 · 1 轮）：**DEVIATIONS：1 行（DOC-DRIFT）**——`docs/cli/design/TUI.md` 模块地图未登 `status-line.mjs`（`:42` 邻位口径「新增/删档同批回写」）+ `:604`/`:741` 两处 `buildStatusLine`/`QUIET_MS` 旧指针；**修笔属设计席（docs 面），本席零触**（入上抛）。其余三类（半实现 ∥ 越界 ∥ 拆分零语义）**零发现**；三探针归档读数逐行核对通过（审计席无执行工具 ⇒ 未独立复跑，如实注）。
- **代码评审**（advisor · type=code · 1 轮）：**verdict = pass**。0 🔴；1 🟡 = `cmd-config.mjs` 509 行越 500 软线（**非本批引入**，§2.3 已登记 + 拆分触发条件，非必改）；4 🔵 = ① fSig 契约漏项（防御性，可达性未证）② 无 key 支注记不落地（F-2 面）③ `result.includes` 未作 `String(result ?? "")` 包裹（与 VSC 面防御度不齐，可达性未证）④ 行数预期回填（as-of 面）。卷外注 3 条：批内机检载体 `docs/batches/2026-10-15-car2-core-cli.test.mjs` **未在盘**（`**/*car2*` 实扫仅 .md ——请父侧确认归属）∥ `docs/core/design/API-CONTRACT.md:311`/`:317`/`:318` 坐标随拆漂移 ∥ `render-conversation.mjs:69` 搜索高亮面未纳让位判据（低影响：query 系用户自键明文，非掩码值泄漏）。
- **fix round = 0**（无必改项；🔵 均建议面——代码保持评审时点状态，未做评审后改动）。**终态 = clean**。

### 5.4 上抛项

- **[上抛·待裁]** ① `docs/cli/design/TUI.md` 模块地图补 `status-line.mjs` 行 + `render-frame.mjs` 行收窄 + `:604`/`:741` 指针随正（设计席笔）② `docs/core/design/API-CONTRACT.md:311`/`:317`/`:318` 坐标随正。
- **[上抛·知会]** ① `docs/batches/2026-10-10-cross-end-alignment.test.mjs` L2-2 期望随正**无主**（不改则常红——#1188① 语义面）② 批内机检载体缺席（见 5.3 卷外注①）③ **外部环境面**：`thincoder-desktop/node_modules/@thincoder/render-core` 静默变物理拷贝（CreationTime 2026-10-15 02:21:55，原 junction 态 = 单实例）——归档批件 L3-1/L3-2 ∥ rsr L2/L6 红面由此而来，建议收口/并行批侧核安装面。

### 实施记录（car2 · 核/三端键表/TLS 缝席 · eng-coder）

**写域**：① `flow/tool-card-restore.mjs`（#1343）② 键表五处 + 核件字面六件（#1302——含 §1:45 裁定归席的「超声明六件」）③ `terminal-routes.mjs` 缝（#1387）。
**边界**：未触 `thincoder-core/**` ∥ `thincoder-cli/**` ∥ 设计档 ∥ 测试档 ∥ 台账；零 commit。

#### 交付摘要（三案）

- **#1302 ✅ 全量**：核件字面全量入 t() 键族（VSC 现键复用 9 ∥ 新键 14）+ 哨兵 `"off"` ⇒ `"none"`（显示式收敛单式 `visible === "" ? "—" : reasoningLabel(visible)`）+ console 两端表删 `reasoning.off` + 三面 locales 同步。
- **#1343 ✅**：`tool-card-restore.mjs` 补 `.tool-call-summary` span——条件 ∥ 字面 ∥ truncated 分支逐字同活卡（`tool-card.mjs` `finishToolCard`）；import `../tool-summary.mjs` 单源 `formatToolSummary`。82 ⇒ 91 行（设计 ≈92/+10）。
- **#1387 ✅ 缝**：`terminal-routes.mjs` 三处行内替换——`:93` 注释 ∥ `:96` 参数表 `httpsRequestImpl` ∥ `:329` 升级腿透传（零加行：362 ⇒ 362，设计 ≈364/+2 未现——功能同、行数自报）。T14 绿。

#### 键名 ↔ 代码落点对位表（键表与代码逐字同名）

值来源（政策）：**键复用面 = VSC 现键、值逐字同 `thincoder-vscode/locales/{en,zh}.json`**；**新键 en = 核件现值、zh 按既有文风**（R-5：`toolbar.advisor` ∥ `toolbar.engineering` 采 VSC 长形）。落点行号 = 本轮落笔后实读。

| # | 键 | 核件落点（file:line · 面） | 类型 |
|---|---|---|---|
| 1 | `input.placeholder` | `composer/panel.mjs:89`（输入框 placeholder） | 现键 |
| 2 | `input.messageLabel` | `composer/panel.mjs:90`（输入框 aria-label） | 新键 |
| 3 | `toolbar.send` | `composer/panel.mjs:94`（发送钮 title） | 现键 |
| 4 | `toolbar.sendMessage` | `composer/panel.mjs:95`（发送钮 aria-label） | 新键 |
| 5 | `toolbar.stop` | `composer/panel.mjs:99`（停止钮 title）∥ `:102`（textContent） | 现键 |
| 6 | `toolbar.stopGeneration` | `composer/panel.mjs:100`（停止钮 aria-label） | 新键 |
| 7 | `workspace.required` | `composer/panel.mjs:306`（无工作区 toast） | 现键 |
| 8 | `input.slotFull` | `composer/panel.mjs`（满队 toast，经 `t("input.slotFull")`） | 现键 |
| 9 | `toolbar.attach` | `composer/attach.mjs:89`（附件钮 title）∥ `:90`（aria-label） | 现键 |
| 10 | `toolbar.attachShort` | `composer/attach.mjs:91`（附件钮 textContent） | 现键 |
| 11 | `toolbar.attachedFiles` | `composer/attach.mjs:99`（芯片条 aria-label） | 新键 |
| 12 | `input.fileSuggestions` | `composer/atmenu.mjs:32`（@ 下拉 aria-label） | 新键 |
| 13 | `toolbar.model` | `composer/controls.mjs:46`（钮 title ∥ aria-label） | 现键 |
| 14 | `toolbar.reasoning` | `composer/controls.mjs:47`（钮 title ∥ aria-label） | 现键 |
| 15 | `toolbar.autoApprove` | `composer/controls.mjs:48`（钮 title） | 现键 |
| 16 | `toolbar.autoApproveToggle` | `composer/controls.mjs:48`（钮 aria-label） | 新键 |
| 17 | `toolbar.advisor` | `composer/controls.mjs:49`（钮 title——长形） | 现键 |
| 18 | `toolbar.advisorToggle` | `composer/controls.mjs:49`（钮 aria-label） | 新键 |
| 19 | `toolbar.engineering` | `composer/controls.mjs:50`（钮 title——长形） | 现键 |
| 20 | `toolbar.engineeringToggle` | `composer/controls.mjs:50`（钮 aria-label） | 新键 |
| 21 | `toolbar.planMode` | `composer/controls.mjs:51`（钮 title）∥ `:89` 非工程态回填（`planDefaultTitle`） | 新键 |
| 22 | `toolbar.planToggle` | `composer/controls.mjs:51`（钮 aria-label） | 新键 |
| 23 | `toolbar.planDisabled` | `composer/controls.mjs:89`（工程态 title——既有） | 现键 |
| 24 | `toolbar.settings` | `composer/controls.mjs:52`（钮 title） | 现键 |
| 25 | `toolbar.settingsOpen` | `composer/controls.mjs:52`（钮 aria-label） | 新键 |
| 26 | `model.listLabel` | `composer/model-menu.mjs:292`（模型浮层 aria-label） | 新键 |
| 27 | `model.reasoningLevels` | `composer/model-menu.mjs:299`（推理浮层 aria-label） | 新键 |
| 28 | `tool.outputOf` | `flow/tool-card.mjs:77`/`:168` ∥ `flow/tool-card-restore.mjs:58`（卡体 aria-label，`{ name }` 插值） | 新键 |

（键集对位：VSC en/zh 331 ⇒ **345**；desktop `COMPOSER_DICT` 28 ⇒ **51**（+9 现键 +14 新键）；server `i18n-{en,zh}-core.mjs` 54 ⇒ **76**（+9 +14 −1 `reasoning.off`）。）

#### 文件清单与行数自报（口径 = `split("\n").length − 1`；as-of 现读）

| 文件 | §2.2 现读 ⇒ 预期 | 实读 | 差 | 说明 |
|---|---|---|---|---|
| `thincoder-render-core/composer/panel.mjs` | 470 ⇒ ±0 | 470 | 0 | 行内替换 |
| `thincoder-render-core/composer/attach.mjs` | 236 ⇒ ±0 | 236 | 0 | 同上 |
| `thincoder-render-core/composer/controls.mjs` | 219 ⇒ ±0 | 219 | 0 | 同上（含 planDefaultTitle 注释随动） |
| `thincoder-render-core/composer/model-menu.mjs` | 485 ⇒ ±0 | 487 | +2 | 修复轮 +2 注释行（见下 fix round） |
| `thincoder-render-core/composer/atmenu.mjs` | 145 ⇒ ±0 | 146 | +1 | import `t` 一行 |
| `thincoder-render-core/flow/tool-card.mjs` | 180 ⇒ ±0 | 180 | 0 | aria 行内替换 |
| `thincoder-render-core/flow/tool-card-restore.mjs` | 82 ⇒ ≈92（+10） | 91 | +9 | 设计差 1（注释计行） |
| `thincoder-vscode/locales/en.json` ∥ `zh.json` | 333 | 347 ∥ 347 | +14 键 | 设计「+≈30 键」为粗估 |
| `thincoder-desktop/renderer/i18n-composer.mjs` | 92 | 151 | +23 键 | 9 现键 + 14 新键（行 +59 含注释/件头） |
| `thincoder-server/public/i18n-en-core.mjs` | 67 | 91 | +22 键 | +23 −1（`reasoning.off`） |
| `thincoder-server/public/i18n-zh-core.mjs` | 70 | 94 | +22 键 | 同左 |
| `thincoder-server/src/sandbox/terminal-routes.mjs` | 362 ⇒ ≈364（+2） | 362 | 0 | 行内替换（功能同） |
| `.thincoder/tmp/car2-aria-zh-probe.mjs`（诊断） | — | 新增 | — | 机检③证据（30/30） |
| `.thincoder/tmp/car2-restore-parity-probe.mjs`（诊断） | — | 新增 | — | #1343 对拍（0/5 失配） |
| `.thincoder/tmp/car2-unset-tier-probe.mjs`（诊断） | — | 新增 | — | 修复轮证据（8/8） |
| `.thincoder/tmp/car2-tool-card-restore.before.mjs`（诊断） | — | 新增 | — | 红绿对「修前」拷贝 |

#### 机检证据（#1302 三条 + #1343 ∥ #1387）

- **① 源码扫：清单字面零余 ✓**——六件全量扫描（`textContent|placeholder|title|setAttribute(aria-label|title) = "…"` 两轮 grep + 人工过）：零命中（除符号 `› ✓ — ⚙`、空串）。保留类（非文案）：品牌短名 `PROVIDER_SHORT`（`model-menu.mjs:48-54`）∥ 模式名 `AUTO ∥ PLAN ∥ ENG ∥ ADVISOR`（`controls.mjs:46-52/:74`）∥ 死兜底 `t(k) || "literal"`（§2.6 明列「本批不做」）∥ 开发诊断 throw/console ∥ 前批锁定 `📎 image N`（`attach.mjs:186` 注「文本锁不动」，测试锁在册）∥ `slash.mjs` HELP_GROUPS 不动（CLI 同源，设计边界）。
- **② 三面键集相等 ✓**——14 新键 × 六面（VSC en/zh ∥ desktop en/zh ∥ server en/zh）全在且逐字同 VSC（脚本读数）；desktop/server 两两键集对位零差；server 两表无 `reasoning.off`。
- **③ zh 字典注入抽样 ✓**——`.thincoder/tmp/car2-aria-zh-probe.mjs`（真建 composer 六件 + `setStrings(ZH_CORE)`）：**30/30** 抽样控件 title ∕ aria 全为 zh 值（零英文残留）。
- **#1343 对拍 ✓**——`car2-restore-parity-probe.mjs`：五案（成功非空 ∥ 成功空 ∥ 失败 ∥ 截断非空 ∥ 截断空）卡头失配 修前 4/5 ⇒ 修后 **0/5**；另既有探针 `2026-10-12-live-step-probe.mjs` 复跑 **0/6**（设计判据 6/6）。
- **#1387 ✓**——`2026-10-13-sandbox-exec-rebuild-tls.test.mjs` T14 绿（缺省不注入 ⇒ node:http ∥ TLS 表逐值交 https.request ∥ 缺件抛）；缝三处实读在案。

#### 测试档影响与随正清单（本席零触测试档；父侧笔）

| 档 | 断言 | 因 | 归 |
|---|---|---|---|
| `2026-10-12-console-reasoning-levels.test.mjs:310` | `reasoning.off` 在册 | 本批删键 | **父侧已认领**（§1:45）；B70/N72 等其余腿绿（复跑：fail 恒 = 2/3/5/7——2/5 存量、3 存量、7=本行） |
| `2026-10-11-console-chat-align.test.mjs:308` | `ZH_CORE` 54 枚 | 本批 +22 键（54 ⇒ 76） | **新增**：未入 §1:47 四档清单——建议补（或明示该档不在执行面） |
| `2026-10-12-console-chat-live-step.test.mjs:339` | 「回读径零登记位」（+头注 `:12-16` 登记叙述） | **本批 #1343 补位** ⇒ 登记项归零 | **新增**：随正（叙述 ⟶ 「归零」；剔位运算/断言随动）；`:468` 红非本席（server 帧发射点） |
| `2026-10-08-server-public-structure.test.mjs:71-72` ∥ `2026-10-11-console-tabs-component.test.mjs:447-448` ∥ `2026-10-12-team-projects-permissions-ui.test.mjs:214-215` ∥ `2026-10-10-runner-admin-console-ui.test.mjs:347` | 键数 / zh 哈希 | 本批 +22/表 | 父侧已列（§1:47）；**实读新值 = 1151 ∥ 1156**（旧锚 1129 ∥ 1134） |
| `2026-09-29-i18n-split.test.mjs:58` 邻位 | `COMPOSER_DICT` 28 | desktop +23 键（28 ⇒ 51） | 存量档（改前已红于 SETTINGS_DICT 等）；新读数登记 |
| `2026-10-13-member-face-chat-ui.test.mjs:409` ∥ `:589` ∥ `2026-10-12-console-chat-live-step.test.mjs:468` | — | **非本席面**（me 部键数/提示句 ∥ server 帧发射点） | 不归本席（如实登记） |

#### 决策透明表（披露）

| # | 事项 | 依据/理由 | 披露 |
|---|---|---|---|
| 1 | **超声明六件**（`composer/{panel,attach,controls,model-menu,atmenu}.mjs` + `flow/tool-card.mjs`）一并落 | §1:45 父侧裁定（「±0」= 行数增量口径；六件超声明如实披露） | 本节 + 交付报告 |
| 2 | **修复轮偏离设计字面一处**：`model-menu.mjs:427` 未设哨兵由 `"none"` 修为 `""`（∉ 档位枚举） | 内审 🔴：`"none"` ∈ 多数族枚举（`model-specs.mjs:113` 等）⇒ 未设被 ① 命中 ⇒ 静默关思考 + 钮显「关闭」——与 `MODEL-SPECS.md:1561`（#330 收口判据）∥ `:1555` ∥ `:1543` 相抵；`""` 即设计中「中性档」（且桌面面本就以 `""` ⇄ `"auto"` 为中性），未设态 ②/③ 支恢复可达 | 决策表 + fix round 节；若设计席裁定「哨兵必为 none」，需同拍 §15.4 判据 ∥ 三面测试后再改 |
| 3 | `terminal-routes.mjs` 缝 = **行内替换**（362 ⇒ 362，非设计 +2） | 参数表加 `httpsRequestImpl` 与透传均同行替换；功能与判据同 | 上表行数面 |
| 4 | `tool-card-restore` 82 ⇒ 91（设计 ≈92）；`atmenu` 145 ⇒ 146（设计 ±0，import +1） | 计行差 | 上表 |
| 5 | `slash.mjs` HELP_GROUPS ∥ 死兜底 `t(k) || "literal"` ∥ `attach.mjs` 芯片 `📎 image N` **不动** | 设计 §2.6 边界（CLI 同源/死兜底不动）+ 前批测试锁 | 机检① 节 |
| 6 | 三面表头/注释随动（desktop 件头 51 键·五组；server 两表注释块） | 表体变更随动（D3 计数与清单同变） | 文件清单 |

#### 内审轮次与终态（implement → 偏离审计 → 修复 → 代码评审 → 收敛）

- **偏离审计（explore · 只读）**：五案主体（①字面零余 ②哨兵 ③三面键集 ④#1343 同形 ⑤#1387 缝）**零发现**；附注三条：CHAT.md 登记差异位/哨兵句随正（冻结域，收口笔）∥ §2.2 两件批内测试档不在盘（归属待裁）∥ 行数三处小差（atmenu/restore/terminal-routes——与自报一致）。
- **代码评审（advisor）轮 1**：1 🔴 + 2 🟡 + 1 🔵 + 卷外注 3 条；**VERDICT: changes-required**。
- **fix round（1 次）**：`model-menu.mjs:427` 未设哨兵 `"none"` ⇒ `""`（+2 行注释说理）；证据 = `.thincoder/tmp/car2-unset-tier-probe.mjs` **8/8**（未设 × 含 none 族 × 有默认 ⇒ ②默认 ∥ 无默认 ⇒ ③中性 ∥ 真选 none ⇒ ①保留 ∥ ⓪ 支同 ∥ 源码字面两行）；同时复跑三探针（aria-zh 30/30 ∥ 对拍 0/5 ∥ live-step 0/6）与 console-reasoning 档（fail 集不变）。
- **代码评审轮 2（复验）**：唯一 🔴 **Fixed**（跨端映射面复核：desktop `"" ⇄ "auto"` ∥ VSC `if (reasoning)` 假值零 patch ∥ 控制台预填判别同表）；回写门腿代码面 Fixed（耐久承载体归 #79）；无新 🔴 ⇒ **VERDICT: pass**。
- **终态 = clean（收敛）**；fix round 计数 = **1**（≤5）。上抛项：无（超声明已裁定；修复偏离入决策表 #2）。

#### 残留与移交

- **耐久承载体**（#1302 机检①②、#1343 对拍、#1387 端到端腿）由 **#79 测试席**落 `docs/batches/2026-10-15-car2-core-cli{,-tls}.test.mjs`（§1:49 已裁）；本席回归证据 = 临时探针件（`.thincoder/tmp/`，零批面）——**#1387 端到端腿我方未验**（真 TLS 升级）如实披露。
- 上表「随正清单」三项新增行归父侧笔；`CHAT.md:88/:229` 哨兵键名句、`desktop/renderer/i18n.mjs` 头注链 28 ⇒ 51、`docker-exec.mjs:101` 端口缺省口径——已报（非本席写域）。

### 实施记录（eng-coder 席 · 测试面）

**交付物（两新件 · 已随 2026-10-15 全仓清扫删除「用后即删」口径）**

| 件 | 内容 | 终态读数 |
|---|---|---|
| `docs/batches/2026-10-15-car2-core-cli.test.mjs` | C1–C15 腿：#1175 ∥ #1178 ∥ #1179 ∥ #1185 ∥ #1186 ∥ #1188 ∥ #1200 ∥ #1223 ∥ #1304 ∥ #1343 ∥ #1376 ∥ #1432 ∥ #1437 的测试面 | **tests 17 ∥ pass 17 ∥ fail 0 ∥ skipped 0** |
| `docs/batches/2026-10-15-car2-core-cli-tls.test.mjs` | T1–T3 腿：#1387 hub 级真 TLS 端到端 | **tests 3 ∥ pass 3 ∥ fail 0 ∥ skipped 0** |

**跑法（读数复现口径——件已删，仅存档）**
- 命令：仓根 `d:\teamcode\thincoder` 下 `node --import ./thincoder-server/test/rc-resolve.mjs --test docs/batches/<件名>`
- 环境：系统 node v24.19.0（v24.21.0 亦过）

**验证了什么（逐面）**
- 写面契约：#1175 非错终结三类 ⇒ `status:"done"` + `meta.note`（真异常 ⇒ `error` + `error`）——C1 真驱动 `finishSubTaskKey`，断 `sub.note` 落值 ∥ `sub.lastError` 零在场。
- 显示面：#1188 分面 error 括号外（零折叠零截断，300 字符原文全出）∥ done 折叠 + 140 上限 ∥ stopped 零注记——C2 三态真渲染比对。
- 零写返错：#1179 缺渠道 ⇒ `Provider "X" not found` 逐字 + 盘面字节/mtime 零变；在册渠道 ⇒ `null`——C4。
- google off 形：#1200 接线 + 存量三行随正——C5。
- 派生渠道隐藏：#1223 五消费面——C6 真驱 `createSlashCommands(ctx).completions("/model ")`，断派生无 key 零在场 ∥ 派生有 key 在场（候选非空先断，防自跳过）。
- 回读卡补位：#1343 `tool-card-restore.buildFinishedToolCard` 四槽 textContent ≡ 活卡（`renderToolCard`+`finishToolCard` 真驱；status 槽去耗时尾巴后逐字等）。
- 哨兵擦除：#1178 动作级只读 ⇒ `_verifiedThisRun` 保留 ∥ 写动作清——C3 真驱 `recordToolResults`。
- 内嵌子进程假绿：#1185 陷阱复现（`NODE_TEST_CONTEXT` 在场 ⇒ 子 `node --test` 静默 skip、exit 0 零汇总行；剥除后汇总行在场）+ 模板件剥除段在位——C13 ∥ C13b。
- 盘符双实例：#1186 同件两拼写两 ESM URL 键（机制复现）+ 小写盘符 workdir 直跑读数——C14。
- TLS 端到端（#1387）：T1 缝面（TLS 行 ⇒ 材料感知构造件、三件逐值入请求选项；明文行恒透传 http 缝）∥ T2 真 TLS 全链（浏览器 RawWs 101 ⇒ hub⇄runner 真 `node:https` 升级 ⇒ pty 字节往返 ⇒ exit 帧 ⇒ close 1000 ⇒ 审计两行）∥ T3 负控（缺件抛人话、未接线 404）。

**实施期实读坑（登记，供后续同面参考）**
1. `httpsFetchOf` 走 `request(opts, cb)` **回调形**——`httpsRequestImpl`/`requestImpl` 缝只吃 `opts` 会悬挂（T2 首轮 10s 超时根因）。修 = 缝兼容回调。
2. `crypto.createCertificate` 在 Node 24 = `undefined`（实读）⇒ 件内无法生成带 `IP:127.0.0.1` SAN 的自签证书；退路（设计已预报）＝ 客户端 `rejectUnauthorized:false` + **peer 证书断言**（`getPeerCertificate().subject.CN === "proxy-chunked.test"`，经 `secureConnect` 取）——已如实落，非静默降级。
3. `readCount` 正则须容 `ℹ pass N`（`node --test` TAP 形；旧 `# pass N` 形兼容）。
4. `homedir()` 于模块装载期定死 ⇒ 真链遮蔽腿不能靠改环境变量旁路；改以唯一令牌定位本腿新写件（既有件零读不改，探针件写后即清）。

**门与任务书相抵（已上抛 · 落定）**
- 跨批五档（#1185 四件剥除 + #1186 round3 硬化）∥ G-5 ∥ L2-2 随正：门硬拒（"cross-batch batch-record write"——绑定批档名以外的一切 `docs/batches/*.test.mjs`）⇒ 父侧直接执行。父侧已落 #1186 `:346`（读数 16/17，余 1 红 = `:163` settings.css 内容断言滞后，非取件式面，另计）。

**状态行**：实施完成（2026-10-15）——两新件绿（17/17 ∥ 3/3），后随全仓「用后即删」口径删除（读数存档本段）。

## §6 验证与收口（父代理）

**验证（父侧实读 · 2026-10-15 19:1x）**
- 产品码：§5 三案交卷读数在案（内审 1🔴 修复 ⇒ 评审 pass；fix = 1）；批内件两档（C 系 17/17 ∥ TLS 3/3）随「用后即删」清扫删除（实读 MISSING ✓——读数存档 §5）。
- 设计档七档 = 评审轮 2 逐处实读收正在案（`SESSION.md` §6.26 ∥ `TEAM.md` §2.4 ∥ `PROVIDER.md` §6.25/§6.7 ∥ `TESTING.md` §2.2 ∥ `MODEL-SPECS.md` §18 ∥ `TUI.md` §4 ∥ `TUI-INPUT-BOX.md` §1——12/12 Fixed 复核在 §3）。
- **「已报」三项处置**：① **CHAT.md 哨兵键名句两处 = 已收正**（`docs/server/design/webui/CHAT.md:88` ∥ `:218`——`reasoning.off`/「关闭」⇒ 中性档 `—`；父侧机械笔 · 可 revert；码面零依赖复核 = `thincoder-server/public/**` 对 `reasoning.off` 零命中）；② **desktop `renderer/i18n.mjs` 头注链**（`COMPOSER_DICT` 28 ⇒ 51——car2 批随动）＝写闸拒父侧直笔（产品码面）⇒ 随 **#1484**（已附记）；③ **`docker-exec.mjs:101` 端口缺省口径** ⇒ 入册 **#1485**（条件触发）。
- 凭据批 R82 同族四档指纹随正 ⇒ 对象已随清扫删除（**#1460 已销**）；既存两档失真红 ⇒ 对象同删（**#1462 撤回**）；G-5 ∥ L2-2 随正 ⇒ 对象同删（前提灭）。
- 机检：设计轮读数在案（本批域零新增红——闸内 13 项全在在飞 server 批域）；实测打红四档的随正需求随对象删除消解。

**收口结算（父侧）**
- 台账（16 行）：已核销 = #1175（追认）∥ #1178 ∥ #1179 ∥ #1185 ∥ #1186 ∥ #1200 ∥ #1223 ∥ #1302 ∥ #1304 ∥ #1343 ∥ #1347 ∥ #1376 ∥ #1387（追认）∥ #1432 ∥ #1437（#1188 = 已废弃——承 **#1472** 重登记：跨端残差设计定形后改码）；随正对象消亡销 = #1460 ∥ #1462；新增在册 = #1485。设计档份（i18n 链）→ **#1484**。
- 暂缓批复核：本批零「暂缓」标记。
- 记录冻结：§1 ⇒「已收口 2026-10-15」。
