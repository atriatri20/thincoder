# 2026-10-14 · 模型测试工具
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-14 · 来源 = 用户 2026-10-14 00:19 提「管理面会话缺一个模型测试工具，有时候需要知道模型服务的状态和性能。」+ 00:50 两句厘定「走网关链，记账」「首字节延迟和吞吐也需要」（台账 #1390；需求档 §5 行已回笔）。
> 台账 = #1390（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：已收口 2026-10-14
<§1 模板占位：本批条目 / 关键判据 / 授权口径>
## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（设计轮落笔——机制 = agent/ADMIN-AGENT.md §12.1；KD-SV-205；R87）
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**批任务与设计（model-test-tool 批——设计轮 · eng-designer · 2026-10-14）**

注：本 §2 承 spawn 简报（批档 §1 现为骨架占位——主 agent 笔；台账 #1390；用户 00:19 提 ＋ 00:50 两句厘定「走网关链，记账」「首字节延迟和吞吐也需要」）。**产品码零触（设计轮）。**

**本批条目**（覆盖六问逐问出案——各带被否候选）：

| # | 要求项 | 设计落点 | 机检判据 |
|---|---|---|---|
| 1 | 工具形——管理面会话对「已配渠道点名」做一次真实调用 | `agent/ADMIN-AGENT.md` §12 表 ＋ §12.1①（KD-SV-205①） | 工具名集八件不变 ∥ `models` 动词 +1（`test`）∥ schema 在场 ∥ §8 N84 |
| 2 | 计量——走网关链自动记账（用户 00:50） | §12.1② | 真链用例 ⇒ `usage` 行在场（member = 发送者 ∥ key = `admin-agent`）；零新记账面 |
| 3 | 读数——状态分类 ＋ 错误原文 ＋ 耗时 ＋ 首字节延迟 ＋ 吞吐（用户 00:50） | §12.1③ | 假 SSE 流注时刻 ⇒ 五件逐值（§8 N84 ∥ B80） |
| 4 | 状态分类枚举 ＋ 工具级错误分界（未配/草稿） | §12.1③／① | §8 E62 逐形（五支 ＋ 五形） |
| 5 | 审计——既有调用行是否足够 | §12.1④ | 零新 kind/型（KD-SV-91 不扩）∥ 逐调用一行 |
| 6 | 边界——草稿试连归 AC-18 ∥ 无控制台页 ∥ 成员面不做 | §12.1⑤ | 划界句在人话 ∥ 零新端点 ∥ 零迁移 ∥ 成员面工具面零涉 |

**设计档落点**（存量档更新——单源；零新档）：`docs/server/design/agent/ADMIN-AGENT.md`（§6 本批块 ∥ §7 判据行 ∥ §8 用例 N84 ∥ B80 ∥ E62 ∥ §9 KD-SV-205 ∥ §12 表 `models` 行 ∥ **§12.1 新节** ∥ §13 R87 ∥ 变更记录）∥ 板档 `docs/server/design/PROJECT.md`（§2.1 ∥ §3 ∥ §4 ∥ §7 ∥ §9 R87 stub ∥ 变更记录）。

**机制摘要（五面）**：① 工具形 = `models` 第六动词 `test`⟮provider/model/prompt?/timeoutS?⟯——对象 = 已配渠道点名（上游名 ∥ 别名——解析 → 对外标识）；未配/草稿 ⇒ 工具级错误（划界 AC-18）。② 计量 = 单次 `POST <selfBase>/v1/chat/completions`（`stream:true`；本回合发送者 sk）经网关链全链 ⇒ usage 行自动落（零第二份）；TTFB/吞吐不落库（零迁移）。③ 读数五件 = `status`（`ok` ∥ `timeout` ∥ `http_error` ∥ `bad_response` ∥ `broken_stream`）∥ `error` 原文（帽 500 字）∥ `totalMs` ∥ `ttfbMs`（首个非空内容增量）∥ `tps`（`usage.completion_tokens` ÷ 生成窗；缺 ⇒ null）。④ 审计 = 既有 `chat_call`（零新）。⑤ 边界 = 不做草稿试连 ∥ 无控制台页 ∥ 成员面不做 ∥ 零新端点/迁移。预算 = `timeoutS` 缺省 60 ∥ 上界 600（沿 `exec` 同面先例）＋ 回合中止信号透传。

**受影响文件**（实读 as-of 2026-10-14；全表 = `agent/ADMIN-AGENT.md` §6 本批块）：

- `thincoder-server/src/agent/model-test.mjs`（拟新增）——≈150（执行器：探针请求 ∥ 流扫描 ∥ 读数归一）
- `thincoder-server/src/agent/chat-tools.mjs`——504 ⇒ ≈535（动词 +1 ＋ schema ＋ 接线）
- `thincoder-server/src/agent/chat.mjs`——692 ⇒ ≈697（装配缝两参：`loopbackFor` ＋ `modelTestFetch`）
- `thincoder-server/src/gateway/forward.mjs`——208 ⇒ ≈238（`readBodyExcerpt` 提取导出——两调用点单源）
- `thincoder-server/src/gateway/embedding-admin.mjs`——140 ⇒ ≈114（本档 `textExcerpt` 副本删——改引共享件）
- `thincoder-server/src/agent/chat-env.mjs`——96 ±0（能力段零触）∥ `bin/thincoder-server.mjs` 244 ±0 ∥ `package.json` ±0
- 单元测试档 `docs/batches/2026-10-14-model-test-tool.test.mjs`（拟新增）——≈300（**不入任何门**）

**验收对照（三链同源）**：需求档 `docs/server/requirements/PROJECT.md` §5 #1390（`:541-543`）＝ 本批条目 1–6 ＝ 设计档 §7 本批行 ①–⑥ ＝ 单元测试档用例（N84 ∥ B80 ∥ E62）。

**功能点 55 ∥ AC-55 拟稿（需求档回笔建议——主 agent 笔；R87①）**：

- **功能点 55（模型测试——管理面会话）**：管理面会话可对**已配渠道点名**（provider ＋ 模型名/别名）发起一次**真实调用**（经本 server 网关链 loopback），并取得**读数五件**——状态分类（正常 ∥ 超时 ∥ 网关/上游错误 ∥ 响应不可用 ∥ 流中断）、错误原文、总耗时、首字节延迟（首个内容增量时刻）、吞吐（tokens/s）。调用**照常记账**（usage 行——归因 = 本回合发送者 × 管理面 key）并计配额/限流；测试消耗真 token。
- **AC-55**（各条机检）：
  ① 工具在场：`models` 动词含 `test`；工具名集八件不变。
  ② 通路：请求形 = `POST <selfBase>/v1/chat/completions`（`stream:true`——本回合发送者 sk）；真链用例 ⇒ `usage` 行在场。
  ③ 读数：五件逐值（假 SSE 流注时刻）——含 usage 缺位 ⇒ 吞吐 null（不估）。
  ④ 分类：五支逐形（假出口逐形）＋ 未配/草稿 ⇒ 工具级错误（零外呼）。
  ⑤ 审计：`chat_call` 逐调用一行；零新审计型/kind。
  ⑥ 结构：零新端点 ∥ 零迁移 ∥ 能力段（`chat-env.mjs`）零触 ∥ 成员面零涉。

**关键决策**：KD-SV-205（全形 ＋ 被否候选五条 = `agent/ADMIN-AGENT.md` §9——进程内直调 `forward` ∥ 核 `chat()` 客户端 ∥ 裸探上游 ∥ 新审计 kind ∥ 新端点）。

**上抛/余项**（全文 = `agent/ADMIN-AGENT.md` §13 R87）：① 需求档回笔建议（功能点 55 ∥ AC-55 拟入册——主 agent 笔）∥ ② 随正件 = **零**（无门禁链；单元测试档 1 档随批）∥ ③ 披露五条（测试耗真 token ∥ 读数含链全链耗时 ∥ 网关自产/上游透传不可区分 ∥ 无控制台对位面 ∥ SSE 流形假设）∥ ④ 部署收尾（父侧：镜像重建 ＋ 会话实走）。

**机械检查**：`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——读数随交付报告（同轮）；基线 = 悬空 27 ∥ 行宽 2（存量——非本批）。

**设计评审轮 1 修正（fix 轮——2026-10-14 · eng-designer；承 §3 轮次 1 · 评审 #129——VERDICT = pass；🟡×4 ∥ 🔵×5 九条逐号落 ＋「③补」一条（评审后自发现收正——父侧 2026-10-14 裁 (a)））**

| # | 发现 | 处置 → 改动 file:line |
|---|---|---|
| 1 🟡 | `ok` 定义与 B80③ 相抵；「首内容增量前中断」无支可归 | `ADMIN-AGENT.md` §12.1③ `:279`（`ok` 收正 = 2xx ＋ 流正常终结——零内容增量亦归；`broken_stream` 补「首内容增量前中断亦归——零部分读数」）∥ §7 ④ `:85` ∥ §8 B80 ⑤ `:132` |
| 2 🟡 | 新动词入参校验腿缺；`exec` 先例指针失当 | §8 E62 续格 ⑥ `:133`（`prompt` 逾 2000 字 ∥ `timeoutS` 非正/非数/越界 ⇒ 工具级错误人话——零外呼 ∥ 库零变）∥ §7 ⑤ `:85` ∥ `:265`／`:266` 先例指针收窄（值域形；界值依据 = 设计轮定——自明）∥ §9 KD-SV-205④ `:162` |
| 3 🟡 | R87① 状态/坐标滞后 | §12.1 标题 `:255` ＋ §13 R87① `:307` = 已入册（2026-10-14）＋坐标改指实位（需求档 §2 `:372–379` ∥ 验收表 `:446` ∥ §5 `:550–552`）；板档 `design/PROJECT.md` `:181` ∥ `:326` 同拍 |
| 4 🟡 | 缺「最近先例」行 | §12.1 `:260` 增「最近先例（对齐 ∥ 偏离）」（先例三源——exec ∥ 诊断三件 ∥ §16.2 loopback；偏离 = 经链记账/计配额——理由收拢自 KD-SV-205 理由栏） |
| 5 🔵 | 结果键在场语义未钉 | §12.1③ `:283` 「键在场形」逐支钉死（不适用 ⇒ 缺席；有源缺值 ⇒ null）∥ §8 N84 `:131` 同拍 |
| 6 🔵 | `chatProviderOf` ∥ `buildChatExit` 关系未明 | §12.1② `:272` 件关系句（`chatProviderOf` = 描述子取件/内层 = 本动词复用层；`buildChatExit` = 装配外层；自持单请求不经核 `chat`） |
| 7 🔵 | 确定性机制未明 | §12.1③ `:284` 确定性行（注入钟——`now()` 注入口沿 §14.1 取值源①；逐值相等断言）∥ §7 ③ `:85` 同拍 |
| 8 🔵 | 体量档复查（余量） | 无本批动作（余量注记——原样） |
| 9 🔵 | gateway 域随正指针缺 | §6 本批块 `:63` 添「两件行账随正 ⇒ `gateway/API.md` §4（gateway 域单源）」 |
| ③补 | 评审后自发现：E62 预期列 ① 归类与 §12.1① ∥ §7⑤ ∥ AC-55④ 三方相抵 | §8 E62 `:133` 预期列收正（②③ = 读数面；①④⑤⑥ = 工具级错误人话；「各落 `chat_call` 行」尾注保留）；父侧 2026-10-14 裁 (a) |

**机检**：`node scripts/doc-check.mjs --root D:\teamcode\thincoder`——改前 悬空 33 ∥ 行宽 1（`ADMIN-AGENT.md:531`——存量）；改后 悬空 33（同集——本批面零新增；存量 `chat.mjs:596` 项随笔位移 :571 ⇒ :579）∥ 行宽 1（同一条——位移至 `:537`；存量）。**零新语义（评审发现 ＋ 父侧裁决直接导出项；②界值依据句 ∥ ⑤逐支二择句 = 评审「依据宜自明 ∥ 二择一钉死」之实施句——已披露）；零代码/测试；产品码零触（设计轮）。**各档变更记录已落（`agent/ADMIN-AGENT.md` ∥ `design/PROJECT.md`）。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

本轮（设计评审·首轮）——评审面限制：无文档地图（ownership 检查降级）；无项目标准档申报；源文件不在评审范围（行数标注未对盘——`unverified`）。

| # | Category | Severity | Issue | Suggestion |
|---|----------|----------|-------|------------|
| 1 | Acceptance | 🟡 | `status` 闭集定义与 B80③ 判例相抵：`ADMIN-AGENT.md:275` 定义 `ok`（2xx ＋ 首内容增量到 ＋ 流正常终结），而 `ADMIN-AGENT.md:132` B80③ 判「③ 空答（零内容增量）⇒ `status:"ok"` ＋ `ttfbMs:null`」——按定义此形无支可归（`bad_response` 限「非 SSE 形 ∥ 解析不出事件」）；同族空档 = 「首内容增量前流中断」（`broken_stream` 定义限「首内容增量后传输中断——携部分读数」，`ADMIN-AGENT.md:275`） | 收正 `ok` 定义（如「2xx ＋ 流正常终结（零内容增量亦归 ok ⇒ `ttfbMs:null`）」）并写明「首内容增量前中断」的归类；§7③/§8（B80）同拍 |
| 2 | Acceptance | 🟡 | 新动词入参校验腿未落：`prompt` 逾 2000 字与 `timeoutS` 非正/非数/越界的拒绝处置与用例两处皆缺（§7 ①–⑥ 无「参数校验」腿；E62 五支不含）。既有口径对照 = `ADMIN-AGENT.md:73`「管理面八件逐件（§12——假件下断言动词面与参数校验）」∥ exec 同族先例 = `ADMIN-AGENT.md:126`（E61「`timeoutS` 非法」）∥ `ADMIN-AGENT.md:249`（「越界 ⇒ 工具级错误人话」）；本档 `ADMIN-AGENT.md:263` 只给值域（「正数秒；缺省 **60** ∥ 上界 **600**——沿 `exec` 同面先例」），未给拒绝形 | 补一腿（工具级错误人话 ∥ 零外呼 ∥ 库零变）：并入 E62 或新用例一格；同时把 `exec` 先例指针收窄（该先例上界 = 86 400 且依据 = Node 计时器量程——本工具 600 的依据宜自明） |
| 3 | Doc-state | 🟡 | R87① 坐标与状态滞后：`ADMIN-AGENT.md:301` 仍载「§5 #1390 行（`:541-543`）→ **功能点 55 ∥ AC-55 拟入册**」，但 `:541-543` 现指「团队项目与权限」块；回笔已落——`requirements/PROJECT.md:775`「模型测试工具入册（功能点 55 + AC-55）」＋ 功能点 55 = §2（`requirements/PROJECT.md:372` 起）∥ `requirements/PROJECT.md:446`「AC-55 | 功能点 55（模型测试工具——管理面会话）」∥ `requirements/PROJECT.md:550`「功能点 55 ∥ AC-55；设计完成待评审」；板档同滞 = `design/PROJECT.md:181`「AC-55 拟入册——`agent/ADMIN-AGENT.md` §13 R87①」 | 收正为「已入册（2026-10-14）」并把坐标改指实际行（§2:372–379 ∥ 验收表:446 ∥ §5:550–552）；同形先例 = server-mcp fix 轮 `design/PROJECT.md:775`「（拟入册 ⇒ **已入册**）」；§12.1 标题（`ADMIN-AGENT.md:255`）「功能点 55 ∥ AC-55 拟入册」同拍 |
| 4 | Methodology（最近先例） | 🟡 | 缺「最近先例」行（先例件/批坐标 ＋ 对齐 ∥ 偏离理由收拢一处）：现为散点引用（`ADMIN-AGENT.md:263`「沿 `exec` 同面先例」∥ `ADMIN-AGENT.md:271`「沿 KD-SV-107 口径」）；同族先例形 = `ADMIN-AGENT.md:488`「**最近先例**（对齐 ∥ 偏离）：先例 = 件级核件复用既有形」 | 补一行「最近先例（对齐 ∥ 偏离）」：先例 = 同面动词扩展（`exec`）× 控制台三件诊断（向量探活/代理连通/MCP 探活——零落库零计费）× loopback 出口（§16.2）；**偏离** = 本工具经网关链记账并计配额/限流（先例面零计费）——理由（用户 00:50 裁 ∥ 账只能对在网关链）现散见 `ADMIN-AGENT.md:162` KD-SV-205 理由栏，收拢即足 |
| 5 | Clarity | 🔵 | 结果键在场语义未钉：ok 支结果（`ADMIN-AGENT.md:131`「结果 = `{ ok:true, status:"ok", model, totalMs, ttfbMs（首个内容增量时刻）, tps（completion ÷ 生成窗）, tokens, outputChars }`」）无 `error` 键；`ADMIN-AGENT.md:278`「附 = `tokens`（上游 usage 三值原值）∥ `outputChars`（产出字符数）∥ `httpStatus`／`phase`（各按支）」未给逐支在场/缺席表 | 逐支钉键在场形（缺席 ∥ null 二择一），沿 `ADMIN-AGENT.md:219`「既有消费零破——`end` 增可字段」先例；机检（§7③「读数五件逐值」）随拍 |
| 6 | Clarity | 🔵 | 装配件名两处不一致：§12.1②/KD-SV-205② 称 `chatProviderOf`（`ADMIN-AGENT.md:268`「出口装配**同源** = `chatProviderOf`（§16.2/§16.3——sk = 本回合发送者的 `admin-agent` 明文；谁用谁）」）；§16.2 的装配件名为 `buildChatExit`（`ADMIN-AGENT.md:453`「**装配**（`buildChatExit`——`thincoder-server/src/agent/chat.mjs`）」）——二者关系未明 | 一句明示二者关系（同一装配的内外两层 ∥ 以 §16.2 单源为准复用哪一缝），防实施铺错缝 |
| 7 | Determinism（R4） | 🔵 | `totalMs`/`ttfbMs`/`tps` 的机检依托 wall-clock 与假流注入时刻（`ADMIN-AGENT.md:85`「读数五件逐值（假 SSE 流注入时刻」），确定性机制未明 | 明示确定性机制（注入钟 ∥ 容差断言口径），防抖动用例 |
| 8 | Tier/余量 | 🔵 | 体量档复查：`ADMIN-AGENT.md:62`「`thincoder-server/src/agent/chat-tools.mjs` 实读 **504** ⇒ ≈535」——>500 软线（既有处置在档 = `ADMIN-AGENT.md:35`「判 = 维持 + 上限 700」，本批未越）；`chat.mjs` 692 ⇒ ≈697（`ADMIN-AGENT.md:57`「未越 720 拆档线」——余 23；在途 server-mcp 批 `ADMIN-AGENT.md:59`「`chat.mjs` 692 ⇒ ≈704」若先落 ⇒ 余 ≈11） | 无本批动作；落地按实读复核两条触发线（700 ∥ 720） |
| 9 | Doc ownership（跨域） | 🔵 | 本批改 gateway 域两件（`ADMIN-AGENT.md:63`「`thincoder-server/src/gateway/forward.mjs` 实读 **208** ⇒ ≈238」∥「`embedding-admin.mjs` 实读 **140** ⇒ ≈114」），而 gateway 域档单/计数单源 = `design/PROJECT.md:29`「档单/计数 = `gateway/API.md` §4——单源」；本批同源随动只列板档（`ADMIN-AGENT.md:573`「同源随动 = 板档 `design/PROJECT.md`（§2.1 ∥ §3 ∥ §4 ∥ §7 ∥ §9 ∥ 变更记录）」） | 在 §6 本批块或 R87② 添跨域随正指针（gateway 域两行行数 ⇒ `gateway/API.md` §4），或明写「界外件行账他轮随正」；本评审无文档地图——ownership 检查已降级 |

计数：🔴 0 ∥ 🟡 4 ∥ 🔵 5（共 9 项，均不阻塞）。

VERDICT: pass

## §4 用户批准（主 agent）

**批准（用户 · 2026-10-14 01:39「能点火的都点火自动跑吧」——本批链在自动跑授权内）**

- 评审 #129 = **pass**（0🔴 ∥ 4🟡 ∥ 5🔵）；九条发现 + ③补（父侧裁 (a)）经点修轮 #135 逐号落定，父侧核读九处实位（§2 fix 块 / §3 评审表在册）。
- 机检：悬空 **33**（同集——本批两档件零新增）∥ 行宽 = 存量一条（父侧笔迹，同轮折行收正）。
- 实施轮即派（本批链 = 自动跑授权内；凭据不入档）。

**用户批准（2026-10-14）**：随版放行——用户 09:02「发版」+ 09:05「含」。交付 11/11 绿（父侧复跑在案）∥ 审验终态 clean。

## §5 实施记录（eng-coder）

**状态行**：实施完成（六件落地 ∥ 单测 11/11 全绿 ∥ 发散审计轮 2 clean ∥ 代码评审轮 1 pass；随正/上抛三条见段内）

### 交付摘要（逐条对 §2 验收）

- **落地六件**：`thincoder-server/src/agent/model-test.mjs`（新建——执行器：探针请求 ∥ SSE 扫描 ∥ 读数归一）∥ `thincoder-server/src/agent/chat-tools.mjs`（`models` 第六动词 `test`：`probePromptOf`/`testTimeoutOf` 入参校验 ∥ `externalModelOf` ∥ schema ∥ `invoke(name,args,ctx)`）∥ `thincoder-server/src/agent/chat.mjs`（装配缝：`senderId`/`now`/`loopbackFor`＋`modelTestFetch` 注入；工具面合并两族同携 ctx）∥ `thincoder-server/src/gateway/forward.mjs`（共享件 `RESPONSE_EXCERPT_READ_CAP` ＋ `readBodyExcerpt`）∥ `thincoder-server/src/gateway/embedding-admin.mjs`（本地 `textExcerpt` 删净、改引共享件；`EMBEDDING_EXCERPT_READ_CAP` 留作别名导出——旧档引用面不破）∥ `docs/batches/2026-10-14-model-test-tool.test.mjs`（批内单测 11 腿）。
- **机制落地**：单请求探针经网关链 loopback（`POST <selfBase>/v1/chat/completions`，`stream:true`，本回合发送者 sk 明文）⇒ 记账/配额/限流照常（usage 行自动落——真链腿实测）∥ 五读数闭集 ＋ 键在场形（条件键 = `httpStatus` 仅 `http_error` ∥ `phase` 仅 `timeout` ∥ `error` 仅 `http_error`/`bad_response`）∥ 五支分类（相位判据 = 首个**非空**内容增量）∥ 审计 = 既有 `chat_call`（`subject` = 外标；三 kind 不扩）∥ 零新端点 ∥ 零迁移 ∥ 能力段零触 ∥ 成员面零涉。
- **逐值读数（注入钟 ∥ 假自环出口）**：N84 = `{ok:true, status:"ok", model:"fake/fake-model", totalMs:250, ttfbMs:100, tps:40, tokens:{promptTokens:11, completionTokens:6, totalTokens:17}, outputChars:3}`；B80①–⑤ ∥ E62①–⑥ ∥ 回合中止逐支钉死（11 腿全绿）。

### 逐件实读（落地后行账）

| 件 | 设计估 | 落地实读 |
|---|---|---|
| `thincoder-server/src/agent/model-test.mjs`（新） | ≈150 | **223** |
| `thincoder-server/src/agent/chat-tools.mjs` | ≈535 | **562** |
| `thincoder-server/src/agent/chat.mjs` | ≈697 | **732**（含 `server-mcp` 在飞批同文件合并 ≈+25——本批净 ≈+6） |
| `thincoder-server/src/gateway/forward.mjs` | ≈238 | **241** |
| `thincoder-server/src/gateway/embedding-admin.mjs` | ≈114 | **112** |
| `docs/batches/2026-10-14-model-test-tool.test.mjs`（新） | ≈300 | **596** |

### 决策透明表

| # | 决策 | 依据 ∥ 备选 | 披露面 |
|---|---|---|---|
| 1 | `tps` 生成窗 ≤ 0（亚毫秒完成）⇒ `null` | 除零无义；不估口径沿 §12.1③「usage 缺 ⇒ null」——设计未及此边角 | 码注 ＋ 本档；无断言依赖（假钟窗恒 >0） |
| 2 | 回合中止（非超时）⇒ 抛工具级错误 ＋ 探针即断 | §12.1② 只写「中止即断开探针」；读数形 = 实现选择，沿既有 `status:"failed"` ＋ `reason` 人话 ＋ notice `reason:"aborted"`（先例 = server-wake-face 批测试 :303–309） | 码注 ＋ 测试腿「回合中止」 |
| 3 | `error` 逾限截断加注 = 总长含注记 ≤ 500（495 ＋ 「…（截断）」5 字） | 口径沿 `chat.mjs:239` 「上限含注记」先例（§12.1③「帽 500 字——逾限截断加注」两种读法皆合——取与先例一致者） | 码注 ＋ 三条测试断言 |
| 4 | 摘录读帽按**字节**（同源常量 `RESPONSE_EXCERPT_READ_CAP` = 8 KiB） | 设计句「有界读 8 KiB」为字节口径；初版按字符计（审计发现）⇒ 收正为 `value.byteLength` | 码注 ＋ 早退腿断言 |
| 5 | 管理族 `invoke` 第三参 `ctx` 贯通（本批新增） | §12.1② 要求 `ctx.signal` 通到本动词；`mergeToolFaces` 原只给环境族携 ctx ⇒ 改为两族同携 | 码注 ＋ 回合中止腿（端到端证） |
| 6 | 自环基址/sk 缺位 ⇒ 工具级错误人话（不抛穿回合） | E62④；与 `exec` 同面「工具级错误」先例一致 | 测试腿 ④⑤ |

### 审计与代码评审（轮次 ∥ 终态）

- **发散审计轮 1**（只读子代理）：`VERDICT: divergent（2 条）`——① PARTIAL：`error` 逾限截断加注缺（已修＋补腿，见 fix 轮 1）∥ ② DOC-DRIFT：`docs/server/design/gateway/API.md` §4 两件行账随正未落（跨域设计档——**父侧随正件**，本批零写权，已披露）。
- **发散审计轮 2**（只核 fix）：`VERDICT: clean`（四类偏差零命中；修后语义/三径覆盖/注记先例一致性逐条过）。
- **代码评审轮 1**（advisor · code · 对象 = 已实现）：`VERDICT: pass`（0🔴 ∥ 3🟡 ∥ 5🔵）；逐号处置——行 1（`chat.mjs` 越 720 拆档触发线）= 经自核归属 `server-mcp` 在飞批合并、**上抛父侧**裁（本批净 ≈+6）∥ 行 2（`chat-tools.mjs` 562 > 500 软线）= 在档判「维持 ＋ 上限 700」内（< 700，无需动作）∥ 行 3（本档 §5 空）= 本轮已落（即本段）∥ 行 4（单测档 596 vs 估 ≈300）= 行账如实回填＋维持（先例 = 旧单测档 716 行）∥ 行 5/6/7 三项 🔵 已收正（字节口径 ∥ BOM 注释 ∥ 缺缝文案尾句）∥ 行 8（摘要 `tps` 浮点原值展示）= 保留（设计未钉格式；读数键原值如实——如收正由设计面另裁）。
- **评审后微修**（文案/注释面零行为变更，越评审快照）：读帽字节化 ＋ BOM 注释收正 ＋ E62⑤ 文案尾句收正；复跑 11/11 全绿。

### fix 轮（本批轮内）

1. `error` 逾限截断加注（审计轮 1 ①）：`excerptOf` 改尾注口径；`http_error`/`bad_response` 两径改走 `readBodyExcerpt(response, 帽 + 1)` 判逾限；新增腿「`error` 帽 500 字」四处断言。
2. 覆盖面补强（自发现）：逾读帽早退腿 ∥ 回合中止腿（`ctx.signal` 透传——评审期同文件被他批重写，本腿兼作合并面回归）。

### 复跑读数（命令 ＋ 结果）

- `node --test docs/batches/2026-10-14-model-test-tool.test.mjs` ⇒ **11 pass ∥ 0 fail**（含真链腿：usage 行在场 ∥ member = 发送者 ∥ key = `admin-agent`）。
- `node --check`（六件）⇒ 全绿。
- 旧档回归复跑（非门禁面）：`2026-10-10-server-small-fixes.test.mjs` 腿 C 有界读 = 共享件改引后仍绿（腿 A i18n 计数为存量/他批）∥ `2026-10-11-admin-agent-chat.test.mjs` **19/19** ∥ `2026-10-13-server-core-unification.test.mjs` **10/10** ∥ `2026-10-11-admin-agent-chat-tools.test.mjs` 名集/动词断言 = 旧快照（七件 ⇒ 八件、`models` 五动词 ⇒ 六——本批零新红）。
- `node scripts/doc-check.mjs --root D:\teamcode\thincoder`：悬空 **33**（同集——本批两档件零新增；检索面 `model-test|chat-tools|embedding-admin|forward.mjs` 零命中）∥ 行宽 OK（源域 .md 无 >300 字单行）∥ 行数面 = 报告态（多批存量）。

### 未做 ∥ 上抛

- **[上抛·待裁]** `chat.mjs` 现读 732 越在档 720 拆档触发线（`ADMIN-AGENT.md:57`「越线即执行 = 唤醒径整段抽 `chat-wake-turn.mjs`」）——越线主因 = `server-mcp` 批同文件合并（≈+25），本批净 ≈+6 ⇒ 执行拆档 ∥ 收正触发线口径，请父侧裁。
- **[上抛·知会]** `gateway/API.md` §4 两件行账随正（forward.mjs 208 ⇒ **241** ∥ embedding-admin.mjs ≈118 ⇒ **112**）∥ `docs/core/design/API-CONTRACT.md` 生成区坐标重跑（生成器唯一笔）—— 皆跨域设计档，父侧落。
- **[上抛·知会]** 设计 §6 行账基线滞后（`chat.mjs` 692 ⇒ 732 等六行）——随正件，父侧/设计面落。
- **他批在飞同文件合并**（零冲突）：`chat.mjs` 现含 `server-mcp` 批改动（`mcp/face.mjs` 并面 ∥ `mergeToolFaces` 泛化为多面路由）；本批语义被其保留（文本族同携 ctx），合并态下本批 11 腿全绿——**交付快照 = 合并态**（评审轮 1 快照早于此合并）。

## §6 验证与收口（父代理）

**验证与收口（2026-10-14 · 父侧）**：① 验证 = `2026-10-14-model-test-tool.test.mjs` 11/11 复跑在案 ∥ `node --check` 六档全绿 ∥ 跨批 ctx 相抵已补回（`chat.mjs:334`，与 server-mcp 批同轮）；② 结算同步 = 披露随正（chat.mjs 733 越线归 #1405 族 ∥ 跨域行账归 #1415）；③ 台账 = #1390 → 核销（本闭）；④ 收口 = 本记录冻结。
