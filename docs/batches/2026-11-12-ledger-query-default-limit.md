# 2026-11-12 · ledger-query-default-limit
> 六段，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 每段只有一个作者：作者的段可 `append` 加内容、可就地改（`edit`）；非作者一概拒。
> 编制：主 agent · 2026-11-12 · 来源 = 用户 2026-11-12 15:16「感觉应该把台账接口改一下，不给过滤条件只显示前10行」；15:17 认可按 updated_at 倒序 + 收窄提示，并说「开工」。。
> 台账 = #2358（core · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
批起 sha = a3daddd838ea13544261c873a8851ca1585bbb20
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**要解决的问题**

`ledger({action:"query"})` 不带过滤条件时返回整本台账。本会话实测一次误拉约 262 万字符，把上下文挤掉大半，而那次要的只是几条行。

**为什么这不是「用的人没写过滤条件」**：不带条件时，读的人还没说要什么。这时全倒出来不是回答，是把「这一堆里哪几条相关」的整理工作推给了读的人。而带条件时，行数已经是人在问了——那时多几条不算负担。

- **已定决定**：不带过滤条件 ⇒ 只回前 10 行 · 按 `updated_at` 倒序 · 后面跟一句收窄提示 · 用户原话：「感觉应该把台账接口改一下，不给过滤条件只显示前10行」 · 时间：2026-11-12 15:16
- **已定决定**：排序按最近更新在前；10 行之后给一句「共 N 行，按 status ∥ kind ∥ board 收窄，或 ledger count 看总数」 · 用户原话：「你的看法对，开工」 · 时间：2026-11-12 15:17
- **边界**：带任一过滤条件（`status` ∥ `kind` ∥ `board` ∥ `trigger` ∥ `task_book`）时行为不变，不受这 10 行限制

**库内 = 已查**：查询「ledger query 默认 行数 限制」→ 命中 `thincoder-core/agent-tools/ledger.mjs`（工具面）· `thincoder-core/ledger-db.mjs`（查询实现）· `thincoder-core/tool-docs/ledger.md`（描述面）。三处都没有「不带条件时的行数上限」。

**库外 = B 类**：改动面 = 台账查询实现与工具描述；外部断言 = 零（仓内行为）。

- **改判（取代上方两条）**：改成**分页式**——每页十条，**带不带过滤条件都这样** · 用户原话：「我有点后悔了，我觉得应该改成分页式，每页十条，带不带过滤条件都这么做。万一带条件也很多呢？」 · 时间：2026-11-12 15:19

**为什么改判是对的**：先前那条「不带条件才截 10 行」假定「带条件就少」，可条件宽起来一样能上千行（`status=已核销` 就是大半个台账）。分页不依赖这个假定——多与少都由读的人翻。

**上方两条决定的处置**：「不带条件只回前 10 行」与「按 `updated_at` 倒序」中，前者作废（被分页取代），后者保留（排序总得有一个）。「10 行之后给收窄提示」改为「分页回执里带总数与翻页办法」。

- **已定决定**：需求档 AC 编号 = `AC-M2-38`，落在 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` §④ 验收表（已落笔） · 依据：该档现有编号最大 = `AC-M2-37` · 时间：2026-11-12 15:35
- **已定决定**：RTM 新故事号 = `CLI 51`（`test/RTM.md` 索引表已用 1–49；`CLI 50` 已被在途批 `2026-11-12-planned-path-exemption` 的 §2 先占，本批改号）；用例落册 = `test/rtm/batch-ledger.md`，用例档 = `test/integration/ledger-query-paging.test.mjs` · 时间：2026-11-12 15:35

**为什么由这两笔先落**：设计档的 RTM delta 行与需求回指都指着这两个号；号不先定，实施席就会自己造一个，收口时与需求档对不上。

- **改判**：需求档 AC 编号 `AC-M2-38` → **`AC-M2-39`** · 理由：`docs/core/design/LEDGER.md` §8.1 早已把 `AC-M2-38` 写作「预定批指针」（在途批 `2026-11-12-planned-path-exemption` 的号），一号两义；先占先得，本批挪号 · 时间：2026-11-12 15:57
- **已办好**：§1 上一行里的 `CLI 50` 已改为 `CLI 51`（同一时刻）；盘上 RTM 索引为 `CLI 51` / 用例 `51-1`

- **再改判**：需求档 AC 编号 `AC-M2-39` → **`AC-M2-41`** · 理由：`AC-M2-38 / 39 / 40` 三连已被设计档 §8.1 占用（预定批指针 ∥ 收口一次结算 ∥ 半状态查询面，来自已收口批 `2026-11-10-p0-2-batch-ledger-atomicity`）；本席实核两档全部 `AC-M2-*` 号（`AC-M2-1`–`40` 无空号），最小未用号 = `41`。**这次先核后改，不再凭「下一个」猜** · 时间：2026-11-12 16:00

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 4：AC 号 AC-M2-39 → AC-M2-41 已同步，落点 = 设计档 §7.2 RTM delta 服务需求格 ∥ 本段两处；二次撞号已由父侧裁定关闭；域外两档仍写 AC-M2-38，待实施席同步）

**本批条目（覆盖）**

- 台账 **#2358**（core · 归批）：`ledger({action:"query"})` 改为 **`updated_at` 倒序、每页 10 行的游标分页**，**带不带过滤条件一律分页**；回执尾行恒带「总数 + 本页位次 + 下一页游标」。
- **不在本批**（零改）：`count` 动作 · 核 `ledgerQuery` 的 SQL 与 `ORDER BY id` · 其余五个 action 的入参与回执 · 显示面 / 读导出面 / 写门。

**设计档落点**

- `docs/core/design/LEDGER.md` **§7.2 口径契约** → 新增「分页（`query` 工具面）」条目：先例行、勘察证据、三问、排序落点与 NULL 规则、游标形与拒文（含复现路径）、回执四态逐字表 + 回显段、常量单源、描述面两档、验收 ①–⑥、集成测试设计（RTM delta）。
- 同档 **§9 边界** → 新增「分页不做」一条（不新增索引 / 不改核 SQL / 不做跳页 / 不承诺翻页期快照一致）。

**判据（逐条带依据）**

1. **分页落工具面，核不动** —— 切片在 `thincoder-core/ledger-tools.mjs` 的 `query` 分支；`ledgerQuery` 仍回全量行。依据 = 全量行集有五个消费方（写门 / 开批同面判 / `buildScan` / 读导出面 / 集成用例的全量断言四档，坐标见设计档 §7.2）。核内截断 ⇒ 写门看不见第 11 行之后的在途行、静默放行——分页是上下文成本问题，不能落进业务读径。
2. **分页参数 = `cursor`（keyset），不设 `offset` / `page`** —— 台账多会话共写：`offset` 的位置是计数，一次插入或一次归档就把窗口位移一格 ⇒ 边界行读两遍、或整行跳过，两者都不报错；`cursor` 的位置是排序键空间 `<updated_at>|<id>`，插到游标之上的行不进本页、也不挪动已读位置。
3. **总数与页内容同源** —— `<N>` = 同一次读的行集长度，**不另跑 `count`**：两数出自同一条 SELECT，才不会互相打架；另跑 COUNT 会在两次读之间被别的会话写入而错位。
4. **`count` 与 `<N>` 口径不同，文案不得混用** —— `ledgerCount` 的 WHERE 恒含未决四态，`<N>` = 候选集六态全含；`count` 动作本批零改。
5. **游标形** = `"<updated_at>|<id>"`（照上一页尾行原样传入）；形不合 **拒**、不静默回首页。依据 thincoder-core/ledger-db.mjs「export const nowIso = () => new Date().toISOString()」——定宽 UTC ISO 串 ⇒ 字典序 = 时序，游标按串比较即成立。
6. **声明面须增 `cursor`**（可空 · 串）—— 不增则该键落 §3.2 的 P2 未知键拒（`additionalProperties: false` 闭合声明），调用方永远翻不了页。
7. **回执四态逐字** = 设计档 §7.2「分页」条的回执表（中页 / 末页 / 本页无行 / 首页且候选 ≤ 10），实施席不得自拟。

**受影响文件（机读清单）**

```text
| 档 | 分拆方案 |
|---|---|
| thincoder-core/ledger-tools.mjs | — |
| thincoder-core/ledger-db.mjs | — |
| thincoder-core/tool-docs/ledger.md | — |
| thincoder-core/tool-docs/ledger-read.md | — |
| docs/batches/2026-11-12-ledger-query-default-limit.test.mjs | — |
| test/integration/ledger-query-paging.test.mjs | — |
| test/RTM.md | — |
| test/rtm/batch-ledger.md | — |
```

**逐档改动与改前读数**（读数尺 = `countContentLines`（`thincoder-core/agent-tools/batch-tier-gate.mjs`：内容行数，末行换行不计）；改前读数取批起 sha `a3daddd` 的 `git show <sha>:<档>`，取不到 ⇒ `新`）

| 档 | 改动 | 改前读数 |
|---|---|---|
| `thincoder-core/ledger-tools.mjs` | `query` 分支：排序副本 → 游标定位 → 切 `QUERY_PAGE_SIZE` 行 → 拼尾行（helper 五枚：`pageSortKeyOf` / `pageSortDesc` / `parseQueryCursor` / `queryEchoOf` / `queryPageOf`）；同档声明面 `query` 增 `cursor`（可空 · 串）；游标形判在本分支（不进 §3.2 守卫——守卫只读声明） | 363 行 |
| `thincoder-core/tool-docs/ledger.md` | `query` 条改写三条（每页 10 行、不分带不带条件 / 尾行 `cursor` 原样传入 / `count` 另是一本账） | 38 行 |
| `thincoder-core/ledger-db.mjs` | 新增 `export const QUERY_PAGE_SIZE = 10`（与 `AGING_DAYS` ∥ `EVIDENCE_TOO_LONG_MAX` 同居） | 298 行 |
| `thincoder-core/tool-docs/ledger-read.md` | 与 `ledger.md` 同三条（只读变体档同文） | 29 行 |
| `test/integration/ledger-query-paging.test.mjs` | 集成用例 `CLI 51-1`（新建） | 新 |
| `test/RTM.md` | 索引表新增 `CLI 51` 一行 | 82 行 |
| `test/rtm/batch-ledger.md` | 新增故事节 `CLI 51` 与用例行 `51-1` | 144 行 |
| `docs/batches/2026-11-12-ledger-query-default-limit.test.mjs` | 本批单测（新建；收口删除） | 新 |
| `docs/core/design/LEDGER.md` | §7.2 新增「分页」条 + §9 新增「分页不做」一条 | 1793 行（本席写入后读数） |

**分级结论**：源档两档（363 ∥ 298）· 工具契约档两档（38 ∥ 29）· RTM 两档（82 ∥ 144）改前均 < 500 行 ⇒ **无一档越线，无分拆计划**；两档新建（本批单测 ∥ 集成用例）无改前读数。单函数层本笔不新增 ≥300 行函数（新增 helper 以 ≤ 60 行为设计约束，超出即拆出）。收尾读数记 §5。

**验收（回指）**

1. 设计档 §7.2「分页」条验收 ①–⑥ —— 载体 = 本批单测档 `docs/batches/2026-11-12-ledger-query-default-limit.test.mjs`；⑥（核仍全量）的失败侧 = 第 11 行之后在途行被写门静默放行。
2. 候选 > 10 行、无过滤 ⇒ 回 10 行 + 尾行；按尾行游标连翻，拼起来 = 候选全序（无重、无漏）；末页尾行为 `已到末页`。
3. 带过滤且命中 > 10 行 ⇒ 同样 10 行一页（**过滤不免截**）。
4. 游标非法 ⇒ 拒 + 文案逐字，且在开库之前失败；行集零返回。
5. `ledger count` 数值与尾行 `<N>` 各按其口径成立（未决数 ≤ `<N>`）。

**集成测试（RTM delta）**

- **无既有行被破**：实读 `test/RTM.md`，`台账|ledger` 命中 12 行，均为批档 / 门 / 跨项目读面，无一行断言台账查询的返回条数。
- **新增 1 行** = `CLI 51-1`（业务场景 = 「台账查询分页」，服务需求 = #2358 ∥ 需求档 `AC-M2-41`，入口 = 模型调 `ledger({action:"query"})`；册 = `test/rtm/batch-ledger.md`，用例档 = `test/integration/ledger-query-paging.test.mjs`）。编号已由主 agent 登记（`test/RTM.md` 索引表 `CLI 51`；`CLI 50` 归在途批 planned-path-exemption）。

**关键决策**

- 取 `cursor`、弃 `offset`：判据 2。
- 分页在工具面、不在核内：判据 1（写门静默放行是最坏后果）。
- 非法游标拒绝、不回退首页：回退把「游标打错」伪装成「已翻到头」，读的人不会再核第二遍。
- **已否决** = 核内加 `limit` 参数：要么给它一个默认值（替六个内部调用方决定），要么改八处调用点；两者都把上下文成本的决定塞进业务读径。

**边界**

- 本席只写设计档与本段；代码与工具描述由实施席落。
- 不新增索引、不改核 SQL 与 `ORDER BY id`、不做跳页、不改 `count`、不新增导出、不改显示面 / 导出面 / 写门。
- 不承诺翻页期间的快照一致：被 `update` 刷新的行 `updated_at` 变大、可能重复出现一次（按最近更新排序的固有代价，登记于设计档 §9）。

**上抛项**

- 已闭合：需求档 AC = `AC-M2-41`（`docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` §④，主 agent 落 2026-11-12 16:00）——两度挪号：`AC-M2-38` 撞设计档 §8.1「预定批指针」、`AC-M2-39` 撞 §8.1「收口一次结算」（已收口批 `2026-11-10-p0-2-batch-ledger-atomicity` 的号）；父侧实扫两档全部 `AC-M2-*`（`AC-M2-1`–`40` 无空号），取最小未用号 = 41。设计档 §7.2 与集成测试表的服务需求回指据此成立。

- **[上抛·知会] 域外两处待同步**：`test/integration/ledger-query-paging.test.mjs` 的「判据回指」注释与 `test/rtm/batch-ledger.md` 的 `CLI 51` 节注，均仍写 `AC-M2-38`（应为 `AC-M2-41`，都指本批分页）——两处不属本席写域（产品面 / 测试面），请派实施席同步。

**评审轮次 1 处置（12 条全部已落设计档 · 落点 → 改法）**

| # | 落点（设计档） | 改法 |
|---|---|---|
| 1 | §7.2「集成测试设计（RTM delta）」 | 新增本子节：被破行 = 0 · 冗余 = 0 · 缺 = 1 行；表列 = RTM 行 / 组件交互与业务可观察结果 / 服务需求 / 本仓入口 / delta；标注「编号先登记，收口前未登记 ⇒ 本行作废」 |
| 2 | §7.2「回执逐字」表 + 新条「回显段（`<过滤>`）」+ 验收 ② | 中页尾行从 `ledger({action:"query", cursor:…})` 改为 `ledger({action:"query"<过滤>, cursor:…})`；`<过滤>` = 本页生效的过滤按声明序原样回显（含 `cwd`），一枚没给则为空；验收 ② 补一拍：带过滤翻第二页仍是同一过滤集、`<N>` 恒 25、零旁过滤行，不回显即红 |
| 3 | §7.2「形判」条 + 新条「出处（复现路径）」；「本页无行」行 | 形判补判点（首个 `|` 前 = 排序键、后 = 十进制正整数）与三条复现路径（截断丢 `|` 的输入与逐字拒文，零库动作，本席未跑——首轮读数 = 本批单测同号用例）；「本页无行」第二成因并入 §9 已登记的前移代价，删去其独立处置 |
| 4 | §7.2 新条「排序落点 = 工具面」+「无时间戳行的位置」 | 明写排序在 `query` 分支对行集副本就地排、核 `ORDER BY id` 零改（带 `ledgerQuery` 逐字依据）；NULL 规则 = 排序键 `updated_at ?? created_at ?? ""`，空串恒居末位（当最旧）+ `id` 兜底，游标前段同键（带 `ledgerAdd` 两列恒置值的逐字依据 ⇒ 该形只来自存量行） |
| 5 | §7.2「常量单源」+「描述面是模型可见文案」 | 常量 `QUERY_PAGE_SIZE = 10` 落 `thincoder-core/ledger-db.mjs`（与 `AGING_DAYS` ∥ `EVIDENCE_TOO_LONG_MAX` 同居），工具面零字面量；描述面写死数字，同步判据 = 文案数字恒等 `String(QUERY_PAGE_SIZE)`，本批单测以渲染值断言 |
| 6 | §7.2「先例行（对齐 ∥ 偏离）」 | 对齐 §6.3 / AC-M2-37 的「至多 10 行 + 计数句 + 自取命令」；偏离 = 那里截拒文候选、这里截正常读回执，故这里必须多给一个游标 |
| 7 | §7.2「勘察证据」 | 实读 `test/RTM.md`（12 行 ledger 命中，无断言返回条数）· `index.publicRepos`（`../.thincoder` ∥ `../thincoder.com`，**无相关外部源**）· 仓内四档 + 本档三节 |
| 8 | §7.2「既有件三问（`cursor` 与两个派生量）」 | `cursor` 名沿用 MCP `mcp.mjs` 的 `nextCursor`；`memory/scan.mjs` 的 `cursorKey` 记 `existing but unusable`（游标只在 SQL 侧续查，核本批零改 SQL）；参数面与两个派生量 `none found`（列查过哪六枚声明） |
| 9 | §7.2 验收新增 ⑥ | 候选 > 10 行时直调 `ledgerQuery` 行数 = 全量、写门 / 开批同面判 / `buildScan` 行集与改前等值；失败侧 = 截断落核 ⇒ 第 11 行之后在途行被写门静默放行 |
| 10 | §9「项目根推导」条 | 「不新增参数面」改为「本面不新增**根推导**参数面」，并点名 `cursor` 不参与根推导（指 §7.2） |
| 11 | §7.2 新条「兄弟面（本批不分页）」 | `team_ledger` 的 `query` 走服务端 `/api/client/ledger`，另一本账 ⇒ 零改不分页；提示词侧是否依赖全量 = **unverified**（未读该消费面，不据它定口径） |
| 12 | §7.2「性能」条 + §9「分页不做」 | 性能条补：分页不降低核的逐行成本（`taskBookOnDisk` / `overdue` / `evidenceTooLong` 仍全量算），省的是模型看到的行数不是 IO；§9 边界钉死「不得据此把截断挪进核」 |

**本轮附带收正（同属 §7.2 描述面条，非新语义）**：描述面原只点名 `thincoder-core/tool-docs/ledger.md`，而只读变体另有一档 `thincoder-core/tool-docs/ledger-read.md`（子代理读的就是它，实读 `thincoder-core/ledger-tools.mjs` 的 `makeLedgerTool` 只读分支取该档）——改为**两档同文**，机读清单同上两档。

## §3 设计评审（评审子代理）
**状态行**：评审通过



### 轮次 1（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🔴 | 未处置 | §7.2「分页（`query` 工具面）」块只有验收 ①–⑤，无「集成测试设计（RTM delta）」节：无被破行 / 冗余行 / 缺行、无业务入口、无需求回指、无用例编号——对照同档 §3.10 ∥ §6.3 ∥ §10.9 ∥ §11.9 各有该表 |
| 2 | 🔴 | 未处置 | §7.2 回执逐字表「中页（有下一页）」行「下一页：ledger({action:"query", cursor:"<游标>"})」（无过滤回显）∥ 描述面「② 尾行给的 `cursor` 原样传入即翻下一页」——与验收 ②「带 `status` 过滤且命中 25 行 ⇒ 同样 10 行一页（过滤不免截）」相抵：照回执原样翻页即丢过滤，`<N>` 与首页不一致且不报错 |
| 3 | 🔴 | 未处置 | §7.2「形不合 ⇒ 拒」条 ∥ 回执表「本页无行（候选集空 ∥ 游标已在末行之后）」——两支只有理由、无读数 ∥ 无复现路径（对照本档 §3.7 出口态表「出处」列 ∥ §6.4 分支表「出处」列 ∥ §10.2「观察 / 复现」列） |
| 4 | 🟡 | 未处置 | §7.2「次序」条（`updated_at` 倒序）∥ §9「不改核 `ledgerQuery` 的 SQL 与 `ORDER BY id`（核仍全量）」——排序落点未点名；DDL「`updated_at` TEXT」可空 ∧ §7.2「行龄」条「无时间戳 → 标「年龄未知」照列」⇒ NULL 无次序 ∥ 游标规则 |
| 5 | 🟡 | 未处置 | §7.2 分页条「每次回 10 行」——裸字面量，未按 §5 `EVIDENCE_TOO_LONG_MAX` ∥ §3.7 取舍 3 `AGING_DAYS` 体例给常量单源与落点；描述面「① 每次回 10 行」的同步形未写 |
| 6 | 🟡 | 未处置 | §7.2 分页块无「先例行（对齐 ∥ 偏离）」——同档 §3.5 ∥ §3.7 ∥ §3.9 ∥ §10.1 ∥ §11.1 均带该行 |
| 7 | 🟡 | 未处置 | §7.2 分页块无「勘察证据行」（公共源档 ∥ `index.publicRepos` 读数）——同档 §3.5 ∥ §3.6 ∥ §3.9 ∥ §3.10 ∥ §6.3 ∥ §6.4 ∥ §10.1 均带 |
| 8 | 🟡 | 未处置 | 新名 `cursor` 无三问（existing ∥ none found ∥ existing but unusable）——同档 §10.1「既有件三问」∥ §11.1「门的符号面与三问」∥ §11.2「notices 与四个 reason 名的三问」体例 |
| 9 | 🟡 | 未处置 | §7.2 验收 ①–⑤ 只锁工具面分页，无「核仍全量 ∥ 写门看得见第 11 行之后」的断言——该失败形态 = §7.2「核内截断的后果」条自述 |
| 10 | 🔵 | 未处置 | §9「项目根推导」条「不新增参数面（`cwd` 保留——它是「动作目标路径」的载体）」——与 §7.2 新增的 `cursor` 参数相邻，易被读成全局禁令 |
| 11 | 🔵 | 未处置 | §7.2 分页块未提兄弟面 `thincoder-core/team-ledger.mjs` 的 query ∥ 提示词侧「查台账」消费面是否同形（未验证面） |
| 12 | 🔵 | 未处置 | §7.2「性能」条只登记 `ledgerCount` 的 O(N)；分页后 `ledgerQuery` 仍逐行算 `taskBookOnDisk` / `overdue` 全量（省上下文不省 IO）未一句写明 |

VERDICT: changes-required

计数：🔴 3 · 🟡 6 · 🔵 3（共 12 条）。

### 轮次 2（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1（旧 1） | 🔴 | 已修 | §7.2「集成测试设计（RTM delta）」节：`被破行 = 零` ∥ `缺 = 1 行` + 五列表（RTM 行 / 组件交互与业务可观察结果 / 服务需求 / 本仓入口 / delta） |
| 2（旧 2） | 🔴 | 已修 | §7.2 回执表模板 `ledger({action:"query"<过滤>, cursor:"<游标>"})` +「回显段（`<过滤>`）」条（含理由段）+ 验收 ②「尾行不回显过滤 ⇒ 本条即红」 |
| 3（旧 3） | 🔴 | 已修 | §7.2「出处（复现路径）」条（删去中段使分隔符丢失的复现）+「「本页无行」的第二个成因不是独立分支」条 |
| 4（旧 4） | 🟡 | 已修 | §7.2「排序落点 = 工具面」条（`[...rows].sort` + 核 `ORDER BY id` 零改，带依据）+「无时间戳行的位置」条（排序键 = `updated_at ?? created_at ?? ""`） |
| 5（旧 5） | 🟡 | 已修 | §7.2「常量单源」条（`QUERY_PAGE_SIZE = 10` 落 `thincoder-core/ledger-db.mjs`）+ 描述面同步判据（渲染值断言） |
| 6（旧 6） | 🟡 | 已修 | §7.2「先例行（对齐 ∥ 偏离）」条（对齐 = §6.3 截断体例 / AC-M2-37，偏离点写明） |
| 7（旧 7） | 🟡 | 已修 | §7.2「勘察证据」条（实读 `test/RTM.md` + 声明源 + 仓内四档） |
| 8（旧 8） | 🟡 | 已修 | §7.2「既有件三问（`cursor` 与两个派生量）」三形齐：`existing:` / `existing but unusable:` / `none found:` |
| 9（旧 9） | 🟡 | 已修 | §7.2 验收 ⑥「核仍全量」+ 失败侧（截断落进核 ⇒ 写门对本应拒而实际放行） |
| 10（旧 10） | 🔵 | 已修 | §9「项目根推导」条改形：`cursor` 明文排除在根推导参数面之外并指回 §7.2 |
| 11（旧 11） | 🔵 | 已修 | §7.2「兄弟面（本批不分页）」条（`team_ledger` 走服务端另一本账）+ 提示词侧消费面记为 unverified |
| 12（旧 12） | 🔵 | 已修 | §7.2／性能条「分页不降低核的逐行成本 … 不得据此把截断挪进核」+ §9 同句 |
| 13（新） | 🟡 | 未处置 | §7.2「勘察证据」条 `项目声明 `index.publicRepos` = `../.thincoder` ∥ `../thincoder.com`` 与 §3.8 勘察证据条 `index.publicRepos` = **`[]`**（实读）（§3.5 / §3.6 / §3.10 同读 `[]`）两读并存 |
| 14（新） | 🟡 | 未处置 | §3.8 用例表 PR-11 期望列 `项目内 `query` 逐字照旧` 与 §7.2 分页（10 行窗口 + 尾行）相抵 |
| 15（新） | 🟡 | 未处置 | §7.2 RTM delta 表「服务需求」格 `台账 #2358（**需求档 AC 编号待主 agent 落**——本席不改需求档）` + 「本批收口前未登记 ⇒ 本行作废」——父侧登记待办（协调项） |
| 16（新） | 🔵 | 未处置 | §7.2「描述面（两档同文）」① `每次回 `QUERY_PAGE_SIZE` 行，带不带过滤都一样` 与同节 `描述面是模型可见文案，写死「10 行」（模型读不到常量）` 两形并存；回执与拒文写 `updated_at`，而排序键可回落 `created_at` / 空串 |
| 17（新） | 🔵 | 未处置 | §7.2「回执行形」条 `行集仍是 JSON 数组（既有解析面不变），尾行是给人读的一句`——未点名该面既有消费方 |

VERDICT: pass

计数：🔴 0 · 🟡 3 · 🔵 2（旧 12 项全数已修；新 5 项均非阻塞）

### 轮次 3（评审子代理）

| # | 严重度 | 状态 | 证据（指针） |
|---|---|---|---|
| 1 | 🟡 | 未处置 | §7.2「出处（复现路径）」条仍写「本席未跑（该分支未实施，无读数）」——而盘上 `thincoder-core/ledger-tools.mjs` 已有 `parseQueryCursor` ∥ `queryPageOf` ∥ `QUERY_ECHO_KEYS`，本档 §5「验证读数」记两档 8 pass；同一条分页块亦无「在册状态」行（同档 §3.3 ∥ §3.7 ∥ §6.1 ∥ §8.1 各带） |
| 2 | 🟡 | 未处置 | 设计 §7.2 RTM delta「服务需求」格 = `AC-M2-41`；`test/rtm/batch-ledger.md` 的 `## CLI 51.` 节注与 `test/integration/ledger-query-paging.test.mjs` 头注仍写「§④ `AC-M2-38`」 |
| 3 | 🟡 | 未处置 | 需求档 `AC-M2-41` 判据「回执尾行恒带「总数 + 本页位次 + 下一页命令」」 vs 设计 §7.2 回执表「本页无行」形 = `共 <N> 行 · 本页无行`（无位次、无下一页命令），末页形亦无下一页命令 |
| 4 | 🟡 | 未处置 | 八处指针句「声明源见 §1「声明源（全档单读）」⇒ **无仓外声明源可查**」 vs §1「`index.publicRepos` = `../.thincoder` ∥ `../thincoder.com`（实读 · 2026-11-12 15:58）」；§7.2 勘察证据用的是「无相关外部源」这一正确形 |
| 5 | 🟡 | 未处置 | 设计 §8 验收表与 §8.1 均无 `AC-M2-41` 行——该 AC 全档只在 §7.2 RTM delta 的「服务需求」格出现一次 |
| 6 | 🔵 | 未处置 | §7.2「无时间戳行的位置」的 `?? ""` 段只给推理（「该形只可能来自迁移进来的存量行」），无读数、无复现 |
| 7 | 🔵 | 未处置 | §7.2「回执逐字」与 cursor 拒文写 `updated_at`，排序键可回落 `created_at` ∥ 空串（轮次 2 第 16 条已登记，本轮原样保留；R3 不复议） |

本轮另核（均通过，不列项）：

- 需求档 §④ `AC-M2-41` 在盘，全 `AC-M2-*` 号实核 1–40 无空号 ⇒ 41 为最小未用号。
- `index.publicRepos` 实读 = `../.thincoder` ∥ `../thincoder.com`，与 §1 单读句一致；八处旧句已改指针，全档仅 §1 携值。
- 回显序 `QUERY_ECHO_KEYS` = `status` / `kind` / `board` / `trigger` / `task_book` / `cwd`，与盘上常量逐项一致。
- `test/RTM.md` 索引表 `CLI 51` 已登记（册 `batch-ledger`）· `test/rtm/batch-ledger.md` 行 `51-1` 在盘 · 用例标题同号。
- §2 两档读数已补（`ledger-db.mjs` 298 ∥ 新建档 `新`）；分级结论「无一档越线，无分拆计划」与实测相符（`ledger-tools.mjs` 417 ∥ `ledger-db.mjs` 305 ∥ 集成档 120，均 ≤ 500）。
- `doc_check(mode:"report")` 于 `docs/core/design/LEDGER.md` = PASS（无行号锚、无悬空指针、无超长段）。

VERDICT: pass

计数：🔴 0 · 🟡 5 · 🔵 2（共 7 条）

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
**状态行**：实施完成 2026-11-12



### 交付概要（逐条对 §2）

| # | 条目 | 状态 | 落点 |
|---|---|---|---|
| 1 | `ledger({action:"query"})` = `updated_at` 倒序、每页 `QUERY_PAGE_SIZE`（=10）的游标分页，带不带过滤一律分页 | ✅ 完成 | `thincoder-core/ledger-tools.mjs` 的 `query` 分支 |
| 2 | 回执尾行恒带「总数 + 本页位次 + 下一页命令」，且命令回显本页生效的过滤 + 游标 | ✅ 完成 | 同档 `queryPageOf` ∥ `queryEchoOf` |
| 3 | 游标形 `"<排序键>|<id>"`；形不合 ⇒ 拒（文案逐字）、判于开库之前、不静默回首页 | ✅ 完成 | 同档 `parseQueryCursor` |
| 4 | 常量单源 `QUERY_PAGE_SIZE = 10` 落 `ledger-db.mjs`，工具面零字面量 | ✅ 完成 | `thincoder-core/ledger-db.mjs` |
| 5 | 声明面两变体增 `cursor`（可空 · 串） | ✅ 完成 | `ACTION_SPECS.query` ∥ `UNION_PARAMETERS` |
| 6 | 描述面两档同文（每页 10 行 · 尾行整条照抄 · `count` 另是一本账） | ✅ 完成 | `tool-docs/ledger.md` ∥ `tool-docs/ledger-read.md` |
| 7 | 分页不落核：`ledgerQuery` 仍回全量、SQL 与 `ORDER BY id` 零改 | ✅ 完成 | `ledger-cmd.mjs` 本批零改 |
| 8 | 需求 / RTM 登记：`AC-M2-41` ∥ `CLI 51` / `51-1` | ✅ 完成 | 需求档由主 agent 落；RTM 索引与分册由本席落 |
| 9 | 集成用例 `CLI 51-1`（正常 ∥ 边界 ∥ 错误） | ✅ 完成 | `test/integration/ledger-query-paging.test.mjs` |

### 决策披露

- **回显序**：尾行按设计档 §7.2「回显段」枚举的 `status` / `kind` / `board` / `trigger` / `task_book` / `cwd` 输出，而 `ACTION_SPECS.query` 的声明序是 `cwd` 打头——两者不齐源自设计句「序同声明序」，见「落地核对」第 2 条。
- **`<预览>`** = 复用本档既有 `argPreview`（`JSON.stringify` + 超 80 字符加 `…`），与 P1–P5 拒文同形，不自拟第二套预览。
- **游标形判的 `typeof !== "string"` 一支**：声明面 `type: "string"` 已由守卫在上游拒，此支为 helper 自洽保险，拒文与形判同句（同一枚 `bad()`）。
- **排序键可回落 `created_at` / 空串，而尾行与拒文逐字写 `updated_at`**：按设计档「回执逐字」表原样照写（评审轮次 2 第 16 条已登记为 🔵，本批不改逐字）。
- **页号 `<P>`** = `floor(位次起/QUERY_PAGE_SIZE) + 1`：keyset 下正常翻页恒整页对齐，非对齐只出现在「形对而值错」的游标上（设计档 §9 已登记为不判的边界）。
- **游标之上的游标语义**：`cursor` 的排序键大于全域时回首页（一页照切），小于全域时回「本页无行」——两个方向都由同一条谓词得出，未加分叉。
- **单测档** `docs/batches/2026-11-12-ledger-query-default-limit.test.mjs` 按 §2「收口删除」保留在盘，删除动作归 §6 收口。

### 改动面

| 档 | 改动 |
|---|---|
| `thincoder-core/ledger-db.mjs` | 新增 `export const QUERY_PAGE_SIZE = 10`（与 `AGING_DAYS` ∥ `EVIDENCE_TOO_LONG_MAX` 同居） |
| `thincoder-core/ledger-tools.mjs` | 分页 helper 五枚（`pageSortKeyOf` / `pageSortDesc` / `parseQueryCursor` / `queryEchoOf` / `queryPageOf`）；`query` 分支改为「形判 → 核取全量 → 副本排序切片 → 拼尾行」；`ACTION_SPECS.query` 与 `UNION_PARAMETERS` 各增 `cursor` |
| `thincoder-core/tool-docs/ledger.md` | `query` 条：每页 10 行（带不带过滤都一样）+ 尾行整条照抄 + `count` 另是一本账；并删去旧句「default every row」（本批落地后为假） |
| `thincoder-core/tool-docs/ledger-read.md` | 同上三条（只读档同文） |
| `test/integration/ledger-query-paging.test.mjs` | 新建：集成用例 `CLI 51-1` |
| `test/RTM.md` | 索引表新增 `CLI 51` 一行（属册 batch-ledger · CLI = `有`） |
| `test/rtm/batch-ledger.md` | 新增故事节 `## CLI 51.` 与用例行 `51-1` |
| `docs/batches/2026-11-12-ledger-query-default-limit.test.mjs` | 新建：本批单测（收口删除） |

**越出我这份 spawn 声明清单的改动（两处，均已在上面表内）**

1. `docs/batches/2026-11-12-ledger-query-default-limit.test.mjs` —— 在 §2 机读清单里，不在 spawn 的声明文件清单里；本批单测的法定位置就是批档同目录同名档（测试纪律）。
2. `test/RTM.md` 的表格排版 —— 索引表 CLI 行与 VSC 行之间原有一空行，把同一张五列表断成两张、`VSC 1` / `VSC 2` 落到表外（同档实读所见）；本席删掉该空行，零语义、零行内容改动，理由 = 同档所改即所修。

### 验证读数（命令 + 结果）

- `node --test docs/batches/2026-11-12-ledger-query-default-limit.test.mjs` → 7 tests / 7 pass（设计档验收 ①–⑥ + 声明面与描述面同步）
- `node --test test/integration/ledger-query-paging.test.mjs` → 1 test / 1 pass（`CLI 51-1`）
- 两档合并跑 → 8 tests / 8 pass
- 回归面：`node --test test/integration/tool-role-fitting.test.mjs test/integration/ledger-read-cross-project.test.mjs test/integration/ledger-close-proof.test.mjs test/integration/path-resolution.test.mjs` → 13 / 13 pass；`node --test test/integration/batch-ledger-bind.test.mjs test/integration/doc-anchor-graph.test.mjs test/integration/doc-write-gate.test.mjs` → 13 / 13 pass
- `doc_check(mode:"gate")` 于两档描述面 + 两档 RTM → `DOC-CHECK GATE: PASS`
- 单测读数行（收口删除后留这一行）：跑上列两档单测/集成档，8 pass；改动面 = 工具面分页 + 核常量 + 两档描述面 + RTM 两行。

**失败侧读数（证明这些断言会红）**：本批首跑单测时 4 条红，原因 = 实现写 `第 1 页（…） · 下一页`、设计表逐字是 `（…）· 下一页`（多一个空格）；改实现后转绿。同一次运行把工具面 10 行与核 `ledgerQuery` 28 行在「验收 ⑥」里并排量出来——两个数出自同一夹具，10 不是夹具的必然值。

**回执样例（夹具实跑，逐字）**

`共 25 行 · 第 1 页（第 1–10 行，按 updated_at 倒序）· 下一页：ledger({action:"query", status:"在途", cursor:"…|16"})`

### 修订 / 评审轮次与终态

| 轮 | 类型 | 结果 |
|---|---|---|
| 审计轮 1 | 内部 explore 背离审计（对齐 §2 + 设计档 §7.2/§9/§2 判据 1–7） | `VERDICT: divergences`：1 条 —— `tool-docs/ledger.md` 旧句「default every row」与本批新句相抵（本批后该句为假）。已改，闭合 |
| 自修轮 1 | 同上 | 描述面改为「with none given, every row is eligible」；另清掉单测里一行无意义断言。单测与集成档复跑 8 / 8 pass |
| 代码评审轮 1 | advisor `type="code"`（`batchDoc` 绑定本档） | `VERDICT: pass` —— 🔴 0 · 🟡 5 · 🔵 2。笔内闭合两条：集成用例补游标负例（AC-M2-41 的「截断 ⇒ 拒」原只有收口即删的单测载体）、`51-1` 的「异常」格由 `—` 改 `无`；余下交给父侧：§2 缺两档读数（`ledger-db.mjs` ∥ 新集成档；新建档那格写「不存在」不合法，应为 `新`）· 设计档两处待办句 · §4/§6 记录 |
| 终态 | — | `clean`（代码面与我的写域内无未闭合发现；余项均在他人段或父侧收口面） |

### 落地核对（设计档句与本批落地不符处，逐条原文）

1. `docs/core/design/LEDGER.md` §7.2「集成测试设计（RTM delta）」表「服务需求」格 —— 原文「台账 #2358（**需求档 AC 编号待主 agent 落**——本席不改需求档）」与「本批收口前未登记 ⇒ 本行作废」：编号已登记（需求档 `AC-M2-41` · `test/RTM.md` 的 `CLI 51` · 本册 `51-1`），该句已不成立。
2. `docs/core/design/LEDGER.md` §7.2「回显段」条 —— 原文「（`status` / `kind` / `board` / `trigger` / `task_book` / `cwd`，序同声明序）」：`ACTION_SPECS.query` 的声明序是 `cwd` 打头，落地按前半句的枚举序回显 ⇒「序同声明序」不成立（回显值的集合与可照抄性不受影响）。
3. `docs/core/design/LEDGER.md` §7.2「勘察证据」条 —— 原文「项目声明 `index.publicRepos` = `../.thincoder` ∥ `../thincoder.com`」与 §3.5 ∥ §3.6 ∥ §3.8 ∥ §10.1 ∥ §11.1 的「`index.publicRepos` = `[]`」两读并存；实读 `PROJECT-MANIFEST.json` 的 `"publicRepos": [ "../.thincoder", "../thincoder.com" ]` ⇒ §7.2 是新读。此条非本批落地造成（存量两读），一并交设计席一次收正。

### 未做 / 交父侧

- §2「逐档改动与改前读数」表缺两档读数（`thincoder-core/ledger-db.mjs` ∥ `test/integration/ledger-query-paging.test.mjs`），且新建档那格写「不存在」（规则值形只认数字 ∥ `新`）——设计席段，本席不改。
- 提示词侧是否有消费面依赖「`query` 回全量」= **unverified**（设计档已登记；本批未读该消费面，不据它定口径）。
- 单测档删除、§4 批准、§6 收口与集成集合窗口计数 = 父侧动作。
- **本批无新债**。

### 补轮（评审 #35 唯一一条：AC 回指同步）

- 改前 → 改后（两处注释，逐字）：
  - `test/integration/ledger-query-paging.test.mjs` 头注整行：改前 = 「 * 判据回指 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` §④ `AC-M2-38`。」；改后同句末号 = `AC-M2-41`。
  - `test/rtm/batch-ledger.md` 的 CLI 51 节注片段：改前 = 「> 节注：回指 = `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md` §④ `AC-M2-38`；机制」；改后同片段内 = `AC-M2-41`（片段止于「机制」，全句更长，此处只引改动所在的一段）。
- 同号在本段三处一并改正（本席笔内已成的死指针）：交付概要第 8 行 · 代码评审轮 1 记录 · 落地核对第 1 条。
- 零代码逻辑改动：两档改的都是注释文字，分页实现未动。
- 依据 `docs/core/requirements/ENGINEERING-MODE-V2-SPEC-LEDGER.md`「AC-M2-41 | `query` 分页：每页 10 条」（分页那条 AC 终定 41；`AC-M2-38` 同档已被设计档 §8.1「预定批指针」占用，两号各指一事）。

**本轮读数**：`node --test test/integration/ledger-query-paging.test.mjs` → 1 test / 1 pass；`doc_check(mode:"gate")` 于 `test/rtm/batch-ledger.md` → `DOC-CHECK GATE: PASS`。

## §6 验证与收口（父代理）
