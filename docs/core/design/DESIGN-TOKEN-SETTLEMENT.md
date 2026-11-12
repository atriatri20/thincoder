# 设计评审凭证结算（DESIGN-TOKEN-SETTLEMENT）· 工程模式凭证链板块

> 板块 = **工程模式凭证链（结算面）**——评审通过后 token 的**结算 / 持久化 / 回读 / 消费**。
> 相邻权威 = `docs/core/design/ENG-TOKEN-BINDING.md`（token 生命周期语义：TTL / 格式 / 跨模式存活——本档**不重述**，D2）· `docs/core/design/CONSULTATION.md`（评审引擎）· `docs/core/design/SESSION.md`（会话槽文件与序列化）。
> 需求侧 = `docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md`（源 = VSC 树需求档）；CLI 树需求档**未迁**（后续批）。

## 1. 定位

**结构性基线**：CLI 的 agent 对象是**进程常驻单对象**（跨回合 / 挂起复用）——因此 **无** VSC 端的死对象 bug、无挂起入场快照、无 onComplete 清零类似物。

**现行设计（D1–D3）**：槽文件 = **权威结算台账**；settle 当场落盘；门禁 miss 回读槽；单值镜像退役。

## 2. D1 —— settle 当场同步落盘

- settle 是唯一结算点 ⇒ **settle 当场把 token 字段持久化到槽文件**（不等下个回合尾 `saveSession`）。
  - 落点：`thincoder-core/agent-tools/advisor-settle.mjs` 的 `settleAdvisorRun`（结算）→ 同函数内 `persistEngTokens(agent)` 当场落盘。
  - 落盘函数：`thincoder-core/token-ttl.mjs` 的 `persistEngTokens`——复用 `engTokenSlotFields` 序列化 + session 安全写 / 轮转（`guardForeignSlotFile`，`thincoder-core/session-guard.mjs`——与 `saveSession` 同一份守卫，**勿裸写文件**）。
  - 内存 Map 仍为当前进程缓存（常驻、与槽一致）。
- **写失败语义**：settle 的槽写须同步 await——**失败即 settle 失败**（token 不注册、无 Approved 回显、可重评）：不静默吞错、不产生「内存有盘上无」态。回滚点：同档 settle 失败后的恢复段（失败恢复 settle 前的 Map）。

## 3. D2 —— spawn 门禁读权威（miss 回读槽）

- 门禁先读内存 Map；**miss 时回读槽文件权威台账**（reconcile + 判定）——覆盖「进程重启后槽有但 Map 未及回填 / 缓存与槽不一致」。TTL 过滤保留。
- 落点：`thincoder-core/agent-tools/subagent-spawn.mjs` 的 `resolveDesignSlot` · 回读函数 `thincoder-core/token-ttl.mjs` 的 `reconcileEngTokensFromSlot` · 只读原语同档的 `readEngTokensFromSlot`。

## 4. D3 —— 单值镜像退役 + dispatch 写门问活槽

- `_engDesignToken` 单值镜像**退役**：settle / restore / consume / TTL / `new` 一律不再维护它（**零写**）。
  - 序列化面只产多槽表：`thincoder-core/token-ttl.mjs` 的 `engTokenSlotFields`。
  - agent 对象**无该字段初始化**：`thincoder-core/agent.mjs`。
  - 会话复位不再清镜像：`thincoder-core/session.mjs`。
- **存量兼容**：旧会话槽文件可能残留镜像字段值——恢复时**一次性**读取迁入 Map（**唯一迁移读点**，此后不写不读）：`thincoder-core/token-ttl.mjs` 的 `restoreEngTokens`；落盘时该 legacy 字段被一并删除（同档落盘段）。
- **dispatch 写门**：资格判定改问**「任一活槽存在」**——`thincoder-core/token-ttl.mjs` 的 `anyLiveDesignSlot`，调用点 `thincoder-core/agent/dispatch.mjs`。

## 5. consume 落盘对称（交付 🔴 复活洞修复）与用例

- **复活洞**：D1 + D2 叠加后，consume-design 删内存槽 → 回合尾 save 窗口内 spawn 门禁 miss 回读 → 会从**盘上复活**已消费 token。
- **修法**：consume-design 删内存槽后**当场同步落盘删除**（写空槽）——`thincoder-core/agent-tools/design-slots.mjs` 的 `executeConsumeDesignAction`（调 `persistEngTokens`）。落盘失败 ⇒ 回滚内存槽 + 抛错可重试（不留半消费态）。
- **消耗语义**：消费后同 designId 再 spawn = `resolveDesignSlot` not found 机械拒（消费核 `thincoder-core/agent-tools/design-slots.mjs` 的 `executeConsumeDesignAction` 即此契约）。**批量清点 / 选择器面 = §9**。

**用例**（当批定向单测 `docs/batches/<batch>-<topic>.test.mjs`——收口随批删；相应集成用例尚未设立——既有缺口，另账）：

| 类 | 场景 | 期望 |
|---|---|---|
| 正常 | settle 当场落盘 → 进程 kill（不等回合尾）→ resume → spawn | 门禁从槽读到 token，通过 |
| 正常 | 缓存 miss 回读 | 内存 miss → 回读槽文件 → 命中 |
| 正常 | consume 后 kill → restart → 同 designId 再 spawn | **不复活**（旧台账已删） |
| 正常 | dispatch 写门资格判定 | 有活槽放行 / 无活槽拦 |
| 边界 | 过期 token 槽 | 恢复 / 门禁 TTL 过滤——过期拒 |
| 边界 | 残留镜像一次性迁移 | 迁入 Map，随后不再写镜像 |
| 错误 | settle 落盘失败 | settle 失败可重评，不留半结算态 |
| 错误 | consume 落盘失败 | 回滚内存槽 + 抛错可重试 |

## 6. 机制面（B 式迁移并入——现状路径）

### 6.1 实现坐标

| 面 | 落点 | 实核 |
|---|---|---|
| settle 当场落盘 | `thincoder-core/agent-tools/advisor-settle.mjs`（`settleAdvisorRun` 结算 + `persistEngTokens` 落盘） | 在位 |
| settle 失败回滚 | `thincoder-core/agent-tools/advisor-settle.mjs` 的 settle 失败恢复段 | 在位 |
| 落盘函数 + 槽台账 I/O | `thincoder-core/token-ttl.mjs` 的 `persistEngTokens` · `readEngTokensFromSlot` · `reconcileEngTokensFromSlot` · `anyLiveDesignSlot` | 在位 |
| 槽序列化 / 恢复 | `thincoder-core/token-ttl.mjs` 的 `engTokenSlotFields` · `restoreEngTokens` | 在位 |
| spawn 门禁解析 | `thincoder-core/agent-tools/subagent-spawn.mjs` 的 `resolveDesignSlot` | 在位 |
| consume 落盘对称 | `thincoder-core/agent-tools/design-slots.mjs` 的 `executeConsumeDesignAction`（落盘 + 回滚） | 在位 |
| dispatch 写门 | `thincoder-core/agent/dispatch.mjs` | 在读任一活槽 |
| 镜像零写 | `thincoder-core/agent.mjs` · `thincoder-core/session.mjs` | 无字段初始化 |
| 轮转守卫（拆分产物） | `thincoder-core/session-guard.mjs` 的 `guardForeignSlotFile` | 与 `saveSession` 共用 |
| 凭证工具组（拆分产物） | `thincoder-core/agent-tools/design-token.mjs` | 签发 / 校验 / 结算纯函数 |
| 测试 | 当批定向单测（`docs/batches/<batch>-<topic>.test.mjs`——收口随批删） | 相应集成用例尚未设立（既有缺口，另账） |

### 6.2 双端与依赖方向

- **双端**：CLI 与 VSC 各自实现、**语义同源**（同一批「结算即落盘 / 门禁读权威 / 镜像退役」三条）。CLI 无 VSC 的快照 / 清零修复面（不存在对应 bug），**不引入**。
- **已知有意差异**：两项——① **同 id 冲突裁决**（本仓 = **槽为准**〔「槽 = 权威」〕；VSC = 内存优先——`thincoder-vscode/src/agent/agent-state.mjs` 的 `reconcileEngDesignTokens`：`!map.has(id)` 才合入）——**A9 核查 = ① 不成立**（两面同具备 Map 与槽两载体，无单侧对象）⇒ 按「端差默认 = 消」转**消解路径 + 到期条件**：
  两面对齐同一裁决规则（方向 = token 结算 / 合并面设计轮裁定——候选 = 槽为准〔核现径〕∥ 内存优先〔端现径，防丢新铸〕）；**到期 = token 结算 / 合并面下次触碰**。
  **处置面**：新清点 / 批量消费面（F-SL1 / F-SL2）按「**槽为准**」（核现径）落地——裁决主项与核侧一致；**两面对齐余项**（VSC 内存优先面收正）**缓办**（零触端 reconcile 面）——待决项维持未裁，到期条件照旧（该面下次触碰）。

  ② **过期清理回写时序**（VSC = 当场权威台账回写；本形态 = 惰性〔随下次 `persistEngTokens` / `saveSession` 携带〕）——**形态（写回时序）· 语义零差**（清理对象 = 过期项——任何门禁均不授权，早清晚清不改变授权结果）⇒ 非登记项。源码注释逐字登记（`thincoder-core/token-ttl.mjs` 的过期判定段注释）。
- **依赖环（有意、安全）**：`token-ttl.mjs` 只 import 底层槽 I/O（`thincoder-core/session-slots.mjs` + `session-guard.mjs`）；`thincoder-core/session.mjs` 同时 import `token-ttl.mjs` → 静态环，与既有 session ↔ session-slots 环同构（函数声明实例化期已初始化，环安全）。

### 6.3 VSC 端结算接线

> 来源 = VSC 产品档（旧档一字未改、留参照历史）。VSC 结构性基线不同：agent 对象**每 run 重建**（`thincoder-vscode/src/agent/setup.mjs`——非 CLI 常驻单对象）⇒ 结算面多出
> 「死对象 / 快照 / 清零」三类 VSC 独有断点——D1–D6 全部落地后与 CLI **同机制语义**（settle 即落盘权威台账 / 门禁读权威 / 镜像退役）。生命周期语义 / TTL / 格式 = 核面单一权威（`docs/core/design/ENG-TOKEN-BINDING.md` §6.3——本档不重述）；原 VSC 镜像副本连同其兄弟档随 W12/W13 删除）。

| 面 | VSC 落点（实核 · W16 接线面收正） |
|---|---|
| settle 当场同步落盘（D1——去 fire-and-forget） | **W12 已迁核**——现体 = 核 `thincoder-core/agent-tools/advisor-settle.mjs`（`settleAdvisorRun`：当场落盘 + 失败回滚）+ 核 `thincoder-core/token-ttl.mjs` 的 `persistEngTokens`；端侧 advisor-async 档的 settle 段已删 |
| token 入槽 + Approved 后缀（echo 即裁决） | **W12 已迁核**——现体 = 核 `thincoder-core/agent-tools/design-token.mjs` 的 `buildApprovedSuffix` · `settleDesignReview`；原 `advisor-async.mjs` 的同两处已删 |
| 门禁读权威（miss 回读槽——D4） | 现体 = 核 `thincoder-core/agent-tools/subagent-spawn.mjs` 的 `resolveDesignSlot`（内存 miss 回读槽 reconcile + TTL 过滤保留；仅过期拒才删槽） |
| 写侧保留槽 + union 合并（D2 + D6——忙时不清 settle 落盘项） | **W11 转口核**——端壳 `thincoder-vscode/src/extension/session-slot-write.mjs`（`engTokensMergeForSave` = 核 `mergeEngTokensForSave` re-export）→ 核 `thincoder-core/session-slot-write.mjs`（并集 + 同 key 新铸者胜） |
| 会话内回合从槽新读（D3——快照已删） | 端壳 hydrate 面：`thincoder-vscode/src/agent/setup.mjs`（`hydrateRun` 每轮 `loadSlot` → `applySlotSessionState`）+ `thincoder-vscode/src/agent/agent-state.mjs` 的 `reconcileEngDesignTokens`（槽源合入——同 id 冲突**内存优先**〔状态词 = §6.2 ①〕；内存项永不清空——「槽 = 权威」仅指门禁读源 = D-S3） |
| 单值镜像退役（D5） | `_engDesignToken` 单值镜像**零运行时读写**（dispatch 写门资格问「任一活槽存在」——核 `resolveDesignSlot`，住 `thincoder-core/agent-tools/subagent-spawn.mjs`）；仅 `thincoder-vscode/src/agent/agent-state.mjs` 的一次性迁移读段（legacy 残留——`ENG-TOKEN-BINDING.md` §6.3 已列） |
| 消费落盘对称（consume 后不复活） | **W12/W13 已迁核**——现体 = 核 `thincoder-core/agent-tools/design-slots.mjs` 的 `executeConsumeDesignAction`（删内存槽 + `persistEngTokens` 当场同步落盘 + 失败回滚） |
| 测试覆盖 | 当批定向单测（`docs/batches/<batch>-<topic>.test.mjs`——settle 落盘 / union 忙时 / restore / consume 不复活；收口随批删）。相应集成用例尚未设立（既有缺口，另账） |

**VSC 侧差异**：① `engTokensMergeForSave` 同 key 冲突「**expiresAt 大者胜**（新 mint）」——**已消解**（W11 转口后同一实现：端壳 = 核 `mergeEngTokensForSave` re-export；

  「新铸者胜」与「expiresAt 大者胜」= 同一规则——核档 `thincoder-core/session-slot-write.mjs`）；② `reconcileEngTokensFromSlot` 同 id 冲突以槽为准（VSC 版内存优先）——**消解路径 + 到期条件在册**（A9 核查与处置 = §6.2 ①）。

## 7. 并入的关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-S1 | **settle 即落盘**（不等回合尾） | settle 是唯一结算点——窗口内被杀即丢凭证 |
| D-S2 | 落盘失败 = **settle 失败** | 宁可结算失败可重评，也不留「内存有盘上无」半结算态 |
| D-S3 | 门禁 **miss 回读槽**（槽 = 权威） | 重启后 Map 未回填时不能凭缓存 miss 就拒 |
| D-S4 | 单值镜像**退役**（零写 + 仅一次性迁移读） | 两套真相必然分叉 |
| D-S5 | dispatch 写门改问**任一活槽** | 与 spawn 门同源（同一 reconcile） |
| D-S6 | consume 删槽**当场落盘** | 不落盘则 D1+D2 叠加出复活洞 |

## 8. 评审凭证（v2——M6 增量）

**定位**：评审通过 ≠ 授权落地——通过只发「凭证」（designId + token），实现方拿凭证解锁写码；链收口后**同 designId 再 spawn = 机械拒**（链终消费）。v1 已完整实现凭证生命周期（签发 → TTL → 消费 → 移除），**v2 继承零改**；评审对象受理面 = 项目内现存 `.md`（判据单源 = `docs/core/design/ADVISOR-GUARDS.md` §12）。

**五功能点**：

| # | 功能点 | 方案 |
|---|---|---|
| F1 | 评审通过 → 签发 designToken | **继承 v1**（`generateDesignToken` + `settleDesignReview` → designId+token）；签发条件另含 §3 落地门（判据单源 = `docs/core/design/ADVISOR-GUARDS.md` §1.1——本档不复述，D2） |
| F2 | 链终消费制 | **继承 v1**（`consume-design` → `resolveDesignSlot` + `removeDesignTokenSlot`——消费后同 designId 再 spawn = `designId not found` 机械拒；重复消费幂等 no-op） |
| F3 | 评审对象来源 = 项目内现存 `.md` | 解析 / 受理 / 拒发文案的判据单源 = `docs/core/design/ADVISOR-GUARDS.md` §12（本档不复述，D2）；实现宿主 = `resolveReviewDocPaths`（`review-facts.mjs`；不 import `dispatch.mjs`——簇间回边环风险）。实施 = eng-coder 轮 |
| F4 | 凭证值不落文档 | token / designId **值**永不落档（只记 `review passed`）——`sanitizeText`/`CRED_RE` 机械剥除已实证（继承） |
| F5 | 六 kind 不签发 | 非全绿（含 🔴）→ 不签发 token（fail-closed，继承） |

**验收（回指 AC-M6）**：

| # | 判据 |
|---|---|
| AC-M6-1 | 评审通过（全绿）→ 签发 token + 槽登记；绑 `batchDoc` 的评审另须过 §3 落地门（单源 = `docs/core/design/ADVISOR-GUARDS.md` §1.1）——未过 ⇒ 不签发 |
| AC-M6-2 | 链终消费后同 designId 再 spawn → 拒 |
| AC-M6-3 | 受理面 = 项目内现存 `.md`（判据单源 = `docs/core/design/ADVISOR-GUARDS.md` §12）；源码硬编码 `docs/` → 零命中 |
| AC-M6-4 | token / designId 值不落文档（只记 `review passed`） |
| AC-M6-5 | 六 kind 非全绿（含 🔴）→ 不签发 token |

**边界（本增量不做）**：不做评审判据本身（advisor 内部——继承）；不做凭证格式改造（`uuid:expiresAt` 继承 v1，不重设 HMAC/签名层）。

## 9. 槽位清点（令牌直读）与批量消费

**背景**：链终消费（§5 / §8 F2）只有逐枚通道、无清点面——已批准未消费槽只能从门禁拒文（`designId not found … held design ids`）反查。已闭链批的活 token 滞留 = 复用漏洞 ⇒ 本节补**清点面**与**批量消费**；**token 的身份 / 值形 / TTL 语义零改**（settle 增写批次旁列 = §10；#868 可靠性面另论）。

**在位 / 增量分界**：F-SL1 清点面 ∥ F-SL2 批量消费 = 在位零改（清点核 `design-slots.mjs` 的 `executeDesignSlotsAction` ∥ 消费核 `executeConsumeDesignAction`）；本节增量 = 清点行恒携 `designToken` + 删 reveal ∥ 掩蔽 ∥ 一次一槽（删除面见下）。

**F-SL1 清点面（`subagent` action:`design-slots`——只读）**：

- **动作面**：`subagent` 工具只读 action `design-slots`（第九动作——动作表 = `AGENT-LOOP-SUBAGENT.md` §6.7.2）；工程模式父侧（depth-0）限定（与 consume-design 同门）；分类 = 只读（planMode 放行 / 免审批 / digest 放行——同 `status` / `observe`）。
- **数据源**：槽文件权威表（`readEngTokensFromSlot`——无 TTL 过滤原样）∪ 内存 Map（并集去重，冲突以槽为准——D-S3 同源）；**零写**（不 reconcile 回写、不落盘）。
- **列表面（逐槽一行；龄升序——最老在前）**：`designId`（全串）∥ 状态（`live` / `expired`——`tokenExpired` 单源）∥ 时龄 `ageDays`（= now − (expiresAt − `effectiveTokenTtlMs`) 派生；TTL 配置曾改时为近似——如实注）∥ `expiresAt`（精确）∥ 批 ∥ `designToken`（末位——见「令牌直读」）；尾行 = 计数行（总数 ∥ live ∥ expired）。
- **「批」列来源**：槽文件批次旁列（§10——settle 时按评审实例的批档绑定落盘：`run.batchDoc` 优先、`docSetKey` 的 `batches/` 段档兜底）优先；旁列缺失（旁列启用前签发的旧槽）⇒ 会话内评审实例注册表（`_advisorRuns`）按 designId 命中 run（同一 designId 多 run 时取哪一枚 = §10「清点面的取源序」），走**同一派生**（`batchAbsPathOfRun`）取批档绝对路径再取 basename；两者皆不可得 ⇒ `—`。
- **输出形**：行文本（紧凑——同 consume 面风格）；字段 / 序 / 降级标记 = 契约，行内措辞 = 实现面。

**F-SL1 令牌直读（token 不藏）——需求 F-SL3**：

- **决策与理由**：清点行**恒携** `designToken` 全串值——用户 2026-10-17 裁定「没必要把 token 藏起来，agent 要就告诉他」。理由：值不列时 agent 取用仍要绕回台账找回，而分层取用（开关 / 值形态取舍 / 单槽限）只增机制、不减取用成本 ⇒ 收为一条行契约：照列（用户同日 19:22 同裁「不希望让机制进一步复杂化」）。
- **最相近先例**：同节 F-SL1 清点面（同一行契约 ∥ 同一并集视图 `unionSlots` ∥ 同一 fail-closed 拒形）；实现坐标（现行）= `thincoder-core/agent-tools/design-slots.mjs` 的 `executeDesignSlotsAction`（清点核）∥ 同档的行拼装段；先例批号 = 未在档内可考；对齐 = 令牌列 = 行契约的末位字段，不新立参数 / 动作 / 存储；偏差 = 无。
- **公开源核查**：`index.publicRepos` 的实读与结论单源 = §10.1 那条（本节不另记读数）；核内最近先例 = `consume-design` 回执（照列 designId，无值形态取舍）——「按形态取舍后恒显」查无既有先例，以用户裁定为准。
- **参数面**：唯一参数 `designId`（可选——过滤到单槽；trim 后精确匹配；空串视同缺省；未知 ⇒ 拒 + 列在场 id）。
- **畸形口径**：槽值不可解析（`tokenExpiryMs` = null）⇒ `designToken=—`，`ageDays` / `expiresAt` 同 `—`；过期槽**照列值**——`status=expired` 已标态，且过期 token 在任何门禁都过不了，值本身不构成授权。
- **日志互作（在案——工具输出恒含令牌，日志面单点剥离）**：工具结果前 200 字符经 `agent/dispatch-run.mjs` 的 `tool:done` 事件 `head` 字段落盘；`thincoder-core/log.mjs` `SECRET_FORM` 含 token 值形（`[0-9a-f]{8}-…-[0-9a-f]{12}:\d{10,16}`）⇒ `sanitizeString` 在形态前截断，字段名黑名单含 `designtoken`。**日志面零改**；令牌列置行尾 ⇒ 截断只吃掉值本身，其余列在日志里仍完整。
- **日志面已知代价（如实登记）**：多槽清单在日志 `head` 只保留首行（token 之后内容被截断）——日志面不再保有清单完整性；令牌值本身仍不入日志。
- **边界**：零写（不 reconcile 回写、不落盘——`unionSlots` 同源）；不改 spawn 门显式令牌语义（见下「自动解析取舍」）；不动 TTL / 消费机制；端面（VSC / 桌面）零改（只读动作级分类已覆盖）；跨重启可用（并集视图含槽文件）。
- **边界注（列值来源 ↔ spawn 门分叉——登记备查、非阻断）**：列值来源 = 槽为准（`unionSlots`），spawn 门 = 内存优先、miss 回读槽（§3 D2——`thincoder-core/agent-tools/subagent-spawn.mjs` 的门禁读源段）——同 id 两载体分叉时（低可达——常态同步）列出的值可能被门「严格相等」校验拒；不改两侧判序。

**描述面 / 提示面（建议文本——落笔归各面笔主，D1）**：

| 面 | 建议文本 |
|---|---|
| `thincoder-core/tool-docs/subagent.md` 的 design-slots 条目 | `- action:'design-slots' (engineering mode, parent side): READ-ONLY inventory of this session's approved design token slots — one line per slot (designId, live\|expired, ageDays, expiresAt, batch, designToken), oldest first, ending with a total/live/expired count line. Nothing is written. Use it to see what still holds a slot before consuming; the expired / olderThanDays selectors act on the same set.` |
| 同档 design-slots 条目的后两行（并两行为一） | `  Every row carries its designToken value (expired ones included — status marks them; a malformed record shows designToken=—). Pass designId to filter to a single slot (trimmed exact match; unknown = refused with the held id list; empty string = no filter). Take designId + designToken verbatim onto the eng-coder spawn — the gate checks exact equality.` |
| `thincoder-core/agent-tools/subagent.mjs` 的 `designId` 描述 | `role='eng-coder'`: the designId echoed with the approved token — required to pick between concurrent designs (optional for one). `action:'consume-design'`: the single-slot selector (required to pick between several; the gate refuses to guess); see designIds / expired / olderThanDays for batch consumption. `action:'design-slots'`: filter the inventory to one slot (trimmed exact match; an empty string means no filter; an unknown id is refused with the held id list).` |
| 英文运行期 `thincoder-core/prompts/persona-engineering.md` 的 `**In-flight token recovery**` 条 | `- **In-flight token recovery**: a token (or its designId) dropped from your context — compaction, restart — is not lost: the slot ledger keeps every issued token. `subagent` `action:'design-slots'` lists every slot with its full `designToken` on the row (expired slots included — status marks them; a malformed record shows `designToken=—`; pass designId to filter to one slot). Pass both values verbatim on the eng-coder spawn (the gate checks exact equality) — recovery changes no discipline: tokens stay short-lived runtime state, consumed at chain terminal.` |
| 动作表 `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.7.2 的 design-slots 行 | 参数列 `designId?`；返回列 = 槽位清单（designId ∥ live/expired ∥ 时龄 ∥ `expiresAt` ∥ 批 ∥ `designToken`——龄升序）+ 计数尾行；`designId` 过滤 ⇒ 单槽行 + 计数尾行（注 `(filtered by designId)`）；token 恒列（过期照列；畸形 ⇒ `—`）；两值原样入 eng-coder spawn。阻塞列照旧（同步 · 父侧 · 工程模式 · 只读） |

**取用程序（用法——运行态；值不落文档、不贴用户面）**：

1. 清点：`subagent` `action:'design-slots'`——行内即含 `designToken`，按「批」列 / `designId` 认出目标槽；
2. 派发：`designId` + `designToken` **原样**入 eng-coder spawn（门禁严格相等）；
3. 纪律照旧：及时使用 / 链终 `consume-design`（§5 ∥ §8 F2——本节零改；**直读 ≠ 囤积许可**）；**「设计令牌不许放到过期」**（用户 2026-10-13 裁）——令牌 = 短命运行态：签发即尽快派单落地、链收口即消费；放任过期 ⇒ 该枚授权作废（门禁照拒、须重走评审），未消费活槽滞留 = 复用漏洞。

**自动解析取舍（designId-only spawn 为何不做）**：**不做**（现状显式门 = 默认保持）。理由：token 值 = 凭据；**designId 非凭据**（清点面 / 拒文均照列）——门内按 designId 自动取槽 = 把授权退化为「知道 id 即可写码」，「评审通过 → 签发凭证 → 显式持凭证」链条在门面断掉。
直读消除的是**「取不回」**，不是**「不用取」**——取用成本由清点行消解（一次只读调用即见全串），门的显式性保留；如有反证（自动解析仍能保住凭证语义）⇒ 出案另裁（动门 = 凭证语义变更，须全链设计 + 用户裁）。

**F-SL2 批量消费（`consume-design` 选择器扩展）**：

- **选择器（恰一）**：`designId`（单枚）∥ `designIds: string[]`（显式清单——非空）∥ `expired: true`（全部过期项）∥ `olderThanDays: number`（`ageDays > N`）。多选择器同给 / 选择器缺失且多槽 ⇒ 拒（fail-closed——不猜）。
- **语义**：按选择器解析目标集 → 逐枚移出（内存 + 权威表口径，`removeDesignTokenSlot` 同款 token 值守护）→ **单次 `persistEngTokens` 落盘**（§5 D-S6 单点）；落盘失败 ⇒ 内存快照整体回滚 + 抛（不留半消费态）。未知 / 已消费 id = 逐枚 no-op 提示（幂等——§5 语义不变）。
- **落盘携带（如实）**：persist 写内存 Map（现行序列化形）⇒ 过期项随本次落盘一并出清（D2 惰性清理既有语义——非本节引入）。
- **回执**：逐枚行 + 计数行（`consumed N`）；单枚形态回执 = 现行逐字不变。
- **同 id 再 spawn 机械拒**（§8 F2）与多槽隔离（消费 A 不动 B）**不变**。
- **边界（不做）**：不做 `all` 无选择器形态；`consume-design` 不加按批选择器（批归属的消费 = §10 收口自动消费）；**token 值形 ∥ TTL ∥ 单枚语义零改**。

**落点（现行 → 改后）**：

| 面 | 落点 | 现行 | 改后 |
|---|---|---|---|
| 清点 / 消费核 | `thincoder-core/agent-tools/design-slots.mjs` | 现行落点：`executeDesignSlotsAction` ∥ `executeConsumeDesignAction` ∥ `unionSlots` ∥ `batchOf` ∥ `basenameOfPath` ∥ 行拼装段（单行 `map`，行末恒携 `designToken`）；reveal 面 `grep` 零命中（U-SL14 机检在册） | 清点 / 消费 / 并集零改（批列来源见 §10）；本节改动已落地——无待改项 |
| 动作分派 + 参数 schema | `thincoder-core/agent-tools/subagent.mjs` | 九动作分派段 · `designId` 参数 · `reveal` schema 键 · 档头回收句 | 分派零改；`reveal` 键删行 · 档头回收句删行 · `designId` 描述删末句（删除面 D9–D11） |
| 分类面 | `thincoder-core/agent/dispatch-gates.mjs` | `design-slots` ∈ `isSubagentReadonlyAction` | ±0（参数面变化不动只读分类） |
| 描述面 | `thincoder-core/tool-docs/subagent.md` | design-slots 条目 | 逐字 = 「描述面 / 提示面」表 tool-docs 两行建议文本（后两行并一；首行的行契约补 `designToken`） |
| 端面 | `thincoder-vscode/src/agent/tool-table.mjs` | `vscSubagentFace` readonly 谓词 | ±0 |
| 动作表 | `docs/core/design/AGENT-LOOP-SUBAGENT.md` §6.7.2 | design-slots 行 | 逐字 = 「描述面 / 提示面」表动作表行建议文本（参数列 `designId?`；返回列含 `expiresAt`） |
| 英文运行期面 | `thincoder-core/prompts/persona-engineering.md` | 同源句 = 上行 `**In-flight token recovery**` 条 | 逐字 = 同表英文运行期面行建议文本 |


**删除面（改前 → 改后——删净为机制本体；落定后由 U-SL14 机检）**：

| # | 文件 / 坐标（改前） | 改前（实读） | 改后 |
|---|---|---|---|
| D1 | `thincoder-core/agent-tools/design-slots.mjs` 的 reveal 参数判定段 | `const revealArg = args?.reveal` + 非 boolean 拒值分支（`reveal must be a boolean …`） | 删净（无 reveal 参数面） |
| D2 | 同档的 reveal 前置条件判定段 | `reveal:true` 缺 `designId` ⇒ 拒「one slot at a time (no bulk dump)」（一次一槽） | 删净（`designId` 过滤不附前置条件） |
| D3 | 同档的 reveal 分支开关 | `const reveal = revealArg === true`（分支开关） | 删净 |
| D4 | 同档的 `flatMap` 三分支 | `flatMap` 三分支：`!reveal` 原行 ∥ `liveSlot` 揭值 + `RECOVERY_LINE` ∥ 掩蔽行（`masked; passes no gate`） | 收为单行 `map`：`base` + ` designToken=${e.expiresAt === null ? "—" : e.token}`（恒携；畸形 ⇒ `—`） |
| D5 | 同档的 `RECOVERY_LINE` 常量 | `RECOVERY_LINE` 常量（「pass designId + designToken verbatim …」取用提示行） | 删净（取用归描述面单点——KD-SL7） |
| D6 | 同档的 `liveSlot` 掩蔽判据 | `liveSlot` 掩蔽判据（`e.expiresAt !== null && !e.expired`）+ 注 | 删净（值恒列，态由 `status` 表达——无「揭值 / 掩蔽」二分） |
| D7 | 同档的参数面注释 | 参数面注释（`reveal` 仅 boolean ∥ 一次一槽） | 删净；`designId` 过滤注释保留 |
| D8 | 同档的档头 ∥ 函数注「回收读口」段 | 档头 / 函数注的「回收读口」段（reveal 揭值 ∥ 掩蔽） | 收正为「`designId` 过滤单槽；缺省 = 现行清点面逐字零变；零写」 |
| D9 | `thincoder-core/agent-tools/subagent.mjs` 的 `reveal` schema 键 | `reveal` schema 键（`true = reveal … one slot at a time … masked`） | 删净（参数 schema 无 `reveal` 键） |
| D10 | 同档的档头回收句 | 档头「design-slots 回收读口——`designId` 过滤 + `reveal:true` 单槽揭值」句 | 删行（历史归 git——D8） |
| D11 | 同档的 `designId` 描述 | `designId` 描述末句「— REQUIRED with reveal:true」 | 删末句（描述 = 「描述面 / 提示面」表 `subagent.mjs` 的 `designId` 描述行建议文本） |

测试宿主口径：单元测试档随批档存放（`docs/batches/<batch>-<topic>.test.mjs`），收口删、零留存；U-SL1–U-SL9（清点 / 消费回归）+ U-SL10–U-SL13（直读面）+ U-SL14（删除面机检）同宿一档。

**用例（单元测试档）**：
U-SL1 清点全列（live/expired 双态 + 龄序）∥ U-SL2 批列派生（run 命中 ⇒ basename；缺失 ⇒ `—`）∥ U-SL3 `designIds` 批量（含未知 id no-op 幂等）∥ U-SL4 expired / olderThanDays 选择器。
U-SL5 多选择器 / 空清单 ⇒ 拒 ∥ U-SL6 落盘失败 ⇒ 整体回滚（持久化注入错）∥ U-SL7 消费后同 id spawn 机械拒（不复活——槽文件已删）∥ U-SL8 多槽隔离（消费 A 不动 B）∥ U-SL9 工程模式门外拒。

**直读面 / 删除面用例（需求 F-SL3 回指）**：

| # | 类 | 输入 | 期望 |
|---|---|---|---|
| U-SL10 | 正常 | 无参 ∥ `designId` 过滤 ∥ `designId:''` | 三态逐槽行均含 `designToken=<全串>`（live ∥ expired 同显）；过滤态尾行注 `(filtered by designId)` |
| U-SL11 | 边界 | 槽值不可解析（非 `uuid:epoch` 形） | 该行 `designToken=—`（`ageDays` / `expiresAt` 同 `—`）；其余槽照常出值 |
| U-SL12 | 错误 | `designId` 不在并集视图 | 拒；错误串列在场 designId 全集（空账本 ⇒ `(none)`） |
| U-SL13 | 边界 | `logEvent` + 测试缝：`head` 含 token 值形串 | 落盘内容在值形前截断——日志零 token 值（`thincoder-core/log.mjs` `SECRET_FORM` 在案，零改） |
| U-SL14 | 机检（删除面） | 实现落定后的两档全文 | 两档 `grep -c reveal` = **0**（`grep -c reveal thincoder-core/agent-tools/design-slots.mjs` ⇒ `0`；`grep -c reveal thincoder-core/agent-tools/subagent.mjs` ⇒ `0`）∧ 参数 schema 无 `reveal` 键（同上 = 0 即证）；仓库根跑 |

**关键决策**：

| KD | 决策 |
|---|---|
| KD-SL1 | 清点 = 新只读 action（`design-slots`） |
| KD-SL2 | 「批」列 = 槽文件批次旁列（§10）优先、`_advisorRuns.docSetKey` 反查兜底 |
| KD-SL3 | 批量选择器恰一 / fail-closed |
| KD-SL4 | 消费 = 单 persist / 整体回滚 |
| KD-SL5 | 清点行**恒携** `designToken`（直读；畸形 ⇒ `—`；过期照列）——不设取用开关 ∥ 不按值形态取舍 ∥ 不限单槽（用户 2026-10-17 裁「没必要把 token 藏起来，agent 要就告诉他」） |
| KD-SL6 | 令牌列置行尾——日志 `head` 在值形处截断 ⇒ 其余列在日志里仍完整、令牌值不入日志；多槽清单在日志只余首行（已知代价） |
| KD-SL7 | 取用提示不入槽行输出（用法归描述面单点——D2） |

## 10. 凭证带批次与收口自动消费

**机制现状（本节 = 目标态）**：每个 design 槽在 settle 时记下它属于哪一份批次档；批档的收口（`close` ∥ `status` 写 §1「已收口」两条通路）在写状态行之前，把该批名下的全部槽消费掉。

**为什么**：dispatch 写门的判据是「存在任一活槽」（`thincoder-core/token-ttl.mjs` 的 `anyLiveDesignSlot`），而槽只在收尾被 `consume-design` 消费——模型不执行这条纪律，槽便跨批滞留，门对之后任何一批都等同于不存在。两条合起来成立：带批次让「消费谁」唯一确定，收口自动消费让「有活槽」在任一时点 ≈「有未收口的批」。因此 `thincoder-core/agent/dispatch.mjs` 的写门判据**不动**。

**批次标识的来源（settle 时刻，零新输入）**：两源定序，实现单点 = `batchAbsPathOfRun(run)`（`thincoder-core/agent-tools/design-slots.mjs`）。

1. **`run.batchDoc`（优先）**：评审实例的批档绑定——`batchDoc` 参数经 `resolveBatchDocPath` 解析出的绝对路径，由 `thincoder-core/agent-tools/advisor.mjs` 落在 `resolved.run.batchDoc`。这是调用方对「本次评审属于哪一批」的**显式声明**。
2. **`run.docSetKey` 的 `batches/` 段档（兜底）**：`batchAbsPath`（同档）取派生——被审文档集（`thincoder-core/agent-tools/review-facts.mjs` 的 `docSetKey`；`normAbs` 归一后的绝对路径集 JSON）里恰含一份批档时用它；含两份不同批档 ⇒ 归属不唯一 ⇒ 不猜（`null`）。
3. 两源皆无 ⇒ 归属 = 无（不猜）。

**定序理由（分支各带出处）**：① 主源的存在事实 = 工程模式父侧的常规调用形（`batchDoc` 显式传、`documents` 只放设计档——工程模式评审派发的常规调用形）；② 兜底源的存在事实 = 把批档写进 `documents` 而不传 `batchDoc` 的调用形，既有用例 U-BG1 ∥ U-BG8 ∥ RTM 10-1 走的就是它。两源同时有值时**不构成取舍**：`batchDoc` 在手就不查兜底（派生不改写声明）。

**为什么不是「把 `batchDoc` 并进 `documents` 再算 `docSetKey`」（被拒方案）**：`docSetKey` 同时是**评审实例键**——三处消费：

- 同 scope 复用（`thincoder-core/agent-tools/advisor-async.mjs`）；
- 同 scope 在跑判定（同档 `runningAdvisorOfScope`）；
- 陈旧与 D5 冻结窗口的 scope 来源。

批档一旦入集，同一份设计档在两个批里的评审就成了两个 scope：新批的修轮另起实例（轮次 / prior 复位）、在跑判定失效（可并发两份同档评审）、冻结窗口的判据范围被悄悄改写。

`docSetKey` 的含义是「被审文档集」——批档是被审对象的归属，不是被审对象。

**写面（settle 同拍，`thincoder-core/agent-tools/design-token.mjs`）**：派生（`batchAbsPathOfRun(run)`——两源定序见上）有值 ⇒ 写该 designId 的旁列行；派生为无 ⇒ **删**该 designId 的既有旁列行。分支出处 = 同一 designId 的复评：评审实例关后（同档 `run.open = false`）再用不同 `documents` 评审同一 designId，旧归属若不删，新槽会继承上一轮的批次 ⇒ 收口消费掉本不该消费的授权。

**分支出处（「不含批档 ⇒ 归属 = 无」）**：该降级今天已在生产走——清点面 `batchOf`（`thincoder-core/agent-tools/design-slots.mjs`）对无批档的 run 返回 `—`，需求 F-SL1 边界逐字登记（`docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md` 的 F-SL1 边界条）。

**清点面的取源序（登记——不留给实现注释）**：全序（旁列优先 → 注册表 → `—`，含降级三层）单源 = 同档 F-SL1「批」列来源行。本节只登记该序在清点侧的一步细则：注册表路径**逆序取最近一个能派生出批档的** run——派生函数与 settle 写旁列**同一枚** `batchAbsPathOfRun`（清点面不能拿另一个派生去读同一个事实）。

复现：以单份设计档为 `documents` 跑一次设计评审，`subagent` `action:'design-slots'` 该槽行 `batch=—`。

**存储形**：槽文件新增**旁列** `engDesignTokenBatches: {designId: <批档绝对路径>}`，与 `engDesignTokens` 并列；token 值形 `<uuid>:<expiryMs>` **零改**（`tokenExpiryMs` 的「恰两段」判定、签发 / 校验 / 门禁严格相等 / 日志 `SECRET_FORM` 均不受影响）。内存侧 `agent._engDesignTokenBatches`（Map，designId → 批档绝对路径），与 `_engDesignTokens` 同拍读写。

**保存 / 合并路径（旁列必须对位的三处）**：序列化 = `engTokenSlotFields`（`thincoder-core/token-ttl.mjs`）增一字段 ⇒ `saveSession`（`thincoder-core/session.mjs` 的展开点）自动携带。

落盘 = `persistEngTokens`（`token-ttl.mjs`——`engTokenSlotFields` 取字段后逐字段复制，旁列行同处落盘）；保存并集 = `mergeEngTokenBatchesForSave`（`thincoder-core/session-slot-write.mjs`）。

并集规则：沿用 `mergeEngTokensForSave` 的「槽独有项保留」半边；同 key 冲突**以新写者胜**——旁列值是路径，无 mint 时刻可比，不比 `expiresAt`。恢复面 `restoreEngTokens`（同档）同拍读入旁列。

**写面如实登记**：

- `mergeEngTokenBatchesForSave`（`thincoder-core/session-slot-write.mjs`）与既有 `mergeEngTokensForSave`（同档）**同形**——纯函数；核侧 `thincoder-core/session.mjs` 为整档覆盖写，两函数在核内均无调用点。
- 既有的 tokens 版只有端面一个消费者（`thincoder-vscode/src/extension/panel-session-write.mjs`）；旁列版端面尚未接线。
- ⇒ A6（U-BG10）只验纯函数面：「核内保存会不会写丢归属」在本形态下不发生（`thincoder-core/session.mjs` 那个展开点就是内存快照，旁列随 `engTokenSlotFields` 一并入档）。两个并集函数是端面 / 防御面预留，与本批要消的窗口无因果关系。

**射程划分（旁列 ≠「不为恢复便利扩展机制」）**：需求档 §5 末条已明写「**批归属的旁列（F-D7）∥ 评审封印的旁列（F-D9）不属本条射程**」（`docs/core/requirements/DESIGN-TOKEN-SETTLEMENT.md` §5 末条）——两条旁列承载的是判据（「这笔改动属于哪一批」∥「评审看过的是哪一版」），不是恢复（不为把过期 ∥ 已消费凭证捞回来）。该裁定的正文单源在需求档，本节不复述（D2）。

**缺失时仍是如实降级**：旁列读不到（旁列启用前签发的旧槽）⇒ 清点「批」列照旧 `—`（F-SL1 既有降级）、收口不消费该槽并如实点名计数（下「无归属槽」）——单一降级层级，不新增态。

**收口自动消费（单源，两通路同调）**：`consumeBatchDesignTokens(agent, abs)` 落 `thincoder-core/agent-tools/batch-lifecycle.mjs`；本体四步 = ①非工程模式 ⇒ no-op；②反查 = 内存 Map ∪ 旁列读入，取该 `abs` 名下的 designId 集。

③空集 ⇒ no-op；④调既有 `executeConsumeDesignAction({ designIds }, { agent })`（`thincoder-core/agent-tools/design-slots.mjs` 的 `executeConsumeDesignAction`）——单次落盘 + 内存整体回滚 + 逐枚回执全复用，不新写落盘 / 回滚逻辑（KD-BG6）。

- **读形（收口面严格 ∥ 清点面宽容）**：旁列读的单源 = `readEngTokenBatchesFromSlot(agent, { strict })`（`thincoder-core/token-ttl.mjs`；槽号解析在该函数 `try` 之外）。判据两级：内层按 `readFileSync` 的 `err.code` 分判——`ENOENT` ⇒「没有」（内层返回 `null`），其余 I/O 错原样上抛、交外层；外层按读形处置——宽容形返回 `null`（清点面，`unionBatches` 的缺省形 `thincoder-core/agent-tools/design-slots.mjs` 照旧如实降级 `—`），严格形抛（携槽文件路径 + 底层消息；`unionBatches(agent, { strict: true })` 由 `consumeBatchDesignTokens`（`thincoder-core/agent-tools/batch-lifecycle.mjs`）传入）。`JSON.parse` 失败落外层，按同一分形处置。
- **「没有」的三种输入**（两形同 ⇒ 空集，走「③空集 ⇒ no-op」）：无槽号 ∥ 槽文件不存在（`ENOENT`）∥ 文件可读但无 `engDesignTokenBatches` 字段。**不用 `existsSync` 兜底**——它把权限错也吞成「不存在」，正是收口面必须拒的那一类。
- **读不到的处置**：上述三种以外的 I/O 错（`EACCES` ∥ `EISDIR` ∥ `EIO`…）∥ 解析失败 ⇒ 严格形抛 ⇒ **close 被拒**、档零字节变、可重试。分界理由：「读不到」与「没有」是两件事——宽容形对两者返回同一个 `null`，把前者当后者，收口就落成「已收口而凭证仍在」，正是 F-D8 要消的窗口；失败面按「无法判定归属 = 无法证明清账」处理（FAIL-CLOSED 方向只更严）。
- **槽号解析层同判（manifest 层）**：`_slot` 未钉时，槽号来自 manifest 的 `active`（`currentSlotNoReadOnly`，`thincoder-core/token-ttl.mjs`；其内调 `loadManifest`）。这一层若走宽容形，manifest 不可读就被读成「无槽号」⇒ 严格形返回空集、close 照常落「已收口而凭证仍在」，与旁列同一个洞。故同判：**manifest 文件不存在（`ENOENT`）⇒ 无槽号（合法缺省）；manifest 在盘但读失败 ∥ 解析失败 ⇒ 抛**（`loadManifest` 的 `catch` 在 `thincoder-core/session-slots-manifest.mjs`）。
- **manifest 严格形的落法** = `loadManifest(cwd, { strict = false } = {})`：与 `readEngTokenBatchesFromSlot` 同一两形先例（同一读函数、同一判据、缺省宽容）——strict 形 `ENOENT` ⇒ 默认空账本，其余错 ⇒ 抛（携 manifest 路径 + 底层消息）。**被拒的另一条路** = 在 `token-ttl.mjs` 里另写一个只读 `.active` 的严格读函数：那会把「没有 vs 读不到」判据落到第三处（`loadManifest` 宽容形 ∥ 旁列读 ∥ manifest 严格读），三处必漂，且 manifest 形状出现第二个读者。
- **manifest 层边界与代价**：文件可读而 `active` 缺席 ∥ 非整数 ⇒ 无槽号（合法缺省——「读到了，说没有」）。代价 = `loadManifest` 从一个读法变两形，后续调用点须自选——规则 = 展示 / 尽力面用缺省宽容形，收口门面用 strict；现行全部调用点缺省零改。新面登记 = `thincoder-core/session-slots-manifest.mjs`（新增档；体量由 `doc_check` 的 `lines` 读数面取）。
- **落地状态**：两形已落——`loadManifest(cwd, { strict })`（`thincoder-core/session-slots-manifest.mjs`）∥ `currentSlotNoReadOnly(agent, { strict })` 透传（`thincoder-core/token-ttl.mjs`）。`close` ∥ `status §1→已收口` 两通路经 `unionBatches(agent, { strict: true })` 一路到底：manifest 在盘但读失败 ∥ 解析失败 ⇒ 两通路被拒、档零字节变、可重试。
- **未单独设例的一类（如实登记）**：manifest 位的非 `ENOENT` I/O 错（`EACCES` ∥ `EISDIR`）没有独立用例——同一条判别式（`err.code === "ENOENT"`）在槽文件位已有 `EISDIR` 证据（U-BG11 支二），manifest 位再补一支只是同一判据的第二处取样，不增加信息。manifest 位的「没有 vs 读不到」由 U-BG14 ∥ U-BG15 守；`active: null`（非整数支）同属此列——与「缺席」同一表达式（`thincoder-core/token-ttl.mjs` 的 `Number.isInteger` 支），不单独设例。

- **调用点（两处，均在写状态行之前）**：`close` 通路 = `closeBatchRecord`（`batch-lifecycle.mjs`）内——文档机检门（`REFUSED` ∥ `ERROR` ⇒ throw）之后、该批槽消费之后、`updateSectionStatusLine(src, 1, …)` 之前；`status` 通路 = `statusBatchRecord` 内——机检门之后、该批槽消费之后、`updateSectionStatusLine(src, seg, …)` 之前。
- **与文档机检门的先后**：门是两个函数体内部的语句、先于写盘 ⇒ 消费位 = 「全部拒因之后、写盘之前」。这与既有 `reanchorOnClose`（写盘之后）相反——位次本身就是本节的机制（KD-BG3）。
- **匹配**：旁列值与 `abs` 两侧都是 `node:path` 解析后的绝对路径；比较前分隔符归一，`win32` 下不区分大小写。
- **分支出处（匹配归一）**：`docSetKey` 的 `normAbs`（`review-facts.mjs`）对绝对输入**原样保留**、不归一分隔符，而 `documents` 同时受理项目根相对形与绝对形（`test/RTM.md` 6-1 ∥ 6-3 的入口写法）⇒ 同一批档在 `docSetKey` 里可带 `/` 或 `\`；Windows 路径大小写不敏感是宿主事实，不是猜测。
- **目标集**：该批名下全部槽（评审槽与修轮槽各按自己 designId 归属同一批档）。
- **失败**：消费核抛（内存已整体回滚）⇒ 原样上抛、**close 被拒**（回执点名原因；档零字节变、可重试）。理由：「已收口而凭证仍在」正是本节要消掉的窗口，把它降级成一句回执 = 把结构保证退回纪律。
- **幂等 / 无匹配**：无匹配 ⇒ no-op。分支出处 = 重开后再 close 走这条（重开通路把 §1 写回「进行中」，`batch-lifecycle.mjs` 的重开段；再 close 时该批槽已被上一轮消费）。
- **普通模式**：no-op，不报错。分支出处 = `batch` 的 close 面向两模式（模式位执行期实读，`batch-lifecycle.mjs`）；普通模式批无设计槽——槽只在工程模式评审 settle 时铸（同门判据 `design-slots.mjs`）。
- **回执**：单列 `[design tokens]` 一行（消费枚数 ∥ 留槽无归属枚数点名）；标签形与既有 `[ledger reanchor]`（`batch-lifecycle.mjs`）∥ `[doc-check gate]`（`batch-gate.mjs`）一致（换行 + 方括号前缀）。

**无归属槽（两类，敞口如实划界）**：①旁列启用前签发的旧槽；②上线后文档集不含批档的评审铸出的槽——谁铸出 = 任何 `documents` 不带批档的设计评审（评审受理面只判「项目内现存 `.md`」，`review-facts.mjs`，没有「必带批档」的强制面）。

后果：闸被这类槽撑开至其 TTL（`TOKEN_TTL_DEFAULT_MS` = 7 天，`thincoder-core/agent-tools/design-token.mjs`）。观测量 = `subagent` `action:'design-slots'` 输出里 `batch=—` 的行数（一行一槽，可直接数）。收口不消费它们，回执点名计数。

**因此「活槽 ≈ 有未收口的批」是近似**：偏差 = 上述无归属槽，上限 = 7 天 TTL。旧槽的处置：不消费、不迁移、不猜归属——批归属猜错，消费掉的是别批的授权（业务结果被改），比留下一个可解释的滞留槽更坏；回执如实点名其数量，用 `consume-design expired:true` 清。这是**如实降级**，不是兜底放行——「哪些槽被消费」的判据与实际结果完全一致。

**已知限制（接受的风险，非遗漏）**：收口面同一拍两种读形——旁列走严格形，token 侧仍走宽容形（`unionSlots` → `readEngTokensFromSlot`，`thincoder-core/token-ttl.mjs` 的读槽形段；消费核 `executeConsumeDesignAction` 同源取用）。

触发 = 槽文件在两次相邻读之间转为不可读（并发改权限 ∥ 外部替换）；影响 = 旁列读成功而槽表读回空 ⇒ 回执「消费 0 枚」而槽仍在盘、写门继续放行至 TTL；不误消费它批、不回滚、不落「已收口而槽被删」。接受理由 = 非确定性竞态窗口（需外部在两次相邻读之间动手），同拍单读须同时改造消费核的槽读取形——超出本节（KD-BG9）。


**最相近先例**：同批族 F-SL1 清点面（`thincoder-core/agent-tools/design-slots.mjs` 的 `executeDesignSlotsAction` 起）——对齐 = 同一批归属派生、同一槽文件权威台账、同一「落盘失败 ⇒ 内存回滚 + 抛」形（同档的消费核段）；偏差 = ①归属从显示用升为持久化 + 消费判据 ②新增一次 settle 期写（旁列）。偏差理由：显示面跨重启降级为 `—` 是既知代价，消费判据不能建立在「不可得即 `—`」上——判据要确定性，故须持久化。

**公开源核查**：读数单源 = §10.1（本节不另记）；核内最近先例 = 上述 F-SL1 批列派生 + F-D6 链终消费。

**新名字的三问答案**（落地名一律沿既有件，无一件新造形态）：

| 名字 | 三问答案 |
|---|---|
| `engDesignTokenBatches` | `existing: thincoder-core/token-ttl.mjs engTokenSlotFields · name: "engDesignTokens" · consumers: thincoder-core/session.mjs saveSession ∥ token-ttl.mjs persistEngTokens` ⇒ 对齐（同族槽字段、同序列化点）；偏差 = 新增一个键（无既有键承载批次） |
| `_engDesignTokenBatches` | `existing: token-ttl.mjs agent._engDesignTokens（Map，同拍读写）· consumers: token-ttl.mjs ∥ design-slots.mjs unionSlots` ⇒ 对齐（同 Map 形态、同生命周期）；偏差 = 新增一张表 |
| `readEngTokenBatchesFromSlot` | `existing but unusable: token-ttl.mjs readEngTokensFromSlot · failed on: 字段名硬编码（只返回 data.engDesignTokens，不读旁列）` ⇒ 偏差 = 同形兄弟函数，同一轻读形（无 TTL 过滤、不改盘） |
| `consumeBatchDesignTokens` | `existing: thincoder-core/agent-tools/design-slots.mjs executeConsumeDesignAction · designIds 选择器已存在` ⇒ 复用（KD-BG6）；本名只剩「按批反查 designId 集」的薄壳 |
| 回执标签 `[design tokens]` | `existing: batch-lifecycle.mjs [ledger reanchor] ∥ batch-gate.mjs [doc-check gate]`（换行 + 方括号前缀段）⇒ 对齐同形；偏差 = 新前缀（无既有段承载凭证消费） |
| `batchAbsPathOfRun` | `existing but unusable: thincoder-core/agent-tools/design-slots.mjs batchAbsPath（只认 docSetKey 一个源）· failed on: 不读 run.batchDoc——本笔要的是两源定序，单参单源的函数表达不了` ⇒ 同形外壳（同一返回形：绝对路径 ∥ `null`；同一 `lastIndexOf("batches")` 判据），入参从 `docSetKey` 扩为 run |
| `unionBatches` | `existing: thincoder-core/agent-tools/design-slots.mjs（本名即其定义）· consumers: 同档 batchOf ∥ batch-lifecycle.mjs consumeBatchDesignTokens` ⇒ 无新名（本笔只透传 `{ strict }`） |
| `mergeEngTokenBatchesForSave` | `existing: thincoder-core/session-slot-write.mjs（本名即其定义）· consumers: 核内零调用点（端面未接线，见「写面如实登记」）` ⇒ 无新名 |
| `engDesignTokenSeals` | `existing: thincoder-core/token-ttl.mjs engTokenSlotFields · name: "engDesignTokenBatches" · consumers: thincoder-core/session.mjs saveSession ∥ token-ttl.mjs persistEngTokens` ⇒ 对齐（同族槽字段、同一序列化点）；偏差 = 新增一个键（无既有键承载封印） |
| `readEngTokenSealsFromSlot` | `existing but unusable: thincoder-core/token-ttl.mjs readEngTokenBatchesFromSlot · failed on: 字段名硬编码（只返回 data.engDesignTokenBatches，不读封印）` ⇒ 同形兄弟函数（同一两形读法：宽容返回 `null` ∥ 严格抛） |
| `mergeEngTokenSealsForSave` | `existing: thincoder-core/session-slot-write.mjs mergeEngTokenBatchesForSave · consumers: 核内零调用点（端面未接线）` ⇒ 对齐同形（纯函数、槽独有项保留、同 key 新写者胜） |
| `designSealHash` | `existing but unusable: thincoder-core/agent-tools/subagent-run.mjs taskSeal · failed on: 只接一个串、sha256 截断到 12 位——封印要接档数组（逐档原始字节 + `\n` 分隔、路径不进 hash、全长 digest）` ⇒ 一处定义、两处同调（settle 算 ∥ 闸面复算），不新造第二套字节法 |
| `docHashes` | `existing: thincoder-core/agent-tools/design-token.mjs` 的 settle 面已存同一份清单（`engDesignTokenSeals[designId].docs`）· consumers: 闸面复算（`gateDesignToken` 第 ⑥ 步）∥ 拒文点名 | ⇒ **不是新清单**，是同一份 `docs` 的逐档 hash 旁列：同一清单、同一读点、同一字节口径（逐档原始字节全长 sha256）。它是**报面字段，不参与判定**——判定值仍是 `hash`（K4 口径） |
| 闸面批归属步（`gateDesignToken` 第 ⑤ 步） | `existing: thincoder-core/agent-tools/subagent-design-token.mjs gateDesignToken 的四步核 · consumers: thincoder-core/agent-tools/subagent-spawn.mjs 的 buildSpawnChild` ⇒ 在既有门里加一步，不新造入口；偏差 = 门由「只判凭证」扩为「凭证 + 归属 + 封印」 |

**集成测试设计（从 `test/RTM.md` 起读）**：本改动改的是「收口」这一业务动作的可观测结果——收口成功即该批凭证不再放行写产品码；收口被拒即凭证仍活、状态行未变。逐故事结论：

| 面 | 结论 |
|---|---|
| 护行（既有用例断言的业务结果被改写） | 10-1：入口形由「`documents` 带批档」改为**生产形「`batchDoc` 带批档」**——原写法只验证了兜底派生，正好绕开了本批要消的缺陷；断言（`[design tokens]` 消费 1 枚 · 后续 spawn 被拒 · 槽不在）逐字不变。故事 7 的夹具是普通模式项目、无设计槽 ⇒ 消费步 no-op，三条断言不变；故事 8 ∥ 9 ∥ 14 不经此派生。 |
| 冗余行 | 无。 |
| 缺失行 | 两处：故事 10 新行 **10-4**「清点「批」列显名」（业务可观测结果 = 父侧靠 `design-slots` 认槽归属——今天 24 枚全 `—`）与 **10-5**「闸面两向各拒一次」（业务可观测结果 = 批不符与封印不符各得一条拒文，改回原字节后放行）；manifest 层严格读不新增行（原因同下）。 |

| 编号 | 怎么做 | 怎么算通过（业务可观测） | 交互组件 | 进入口 | 回指 |
|---|---|---|---|---|---|
| 10-1 | 工程模式夹具里，让一次设计评审以 `batchDoc` 带上批档（签发一个槽），再调 `batch close` 收该批。**夹具须让该评审把 §3 写进批档**（轮次块 + 状态行 = `评审通过`）——否则 §3 落地门（单源 = `docs/core/design/ADVISOR-GUARDS.md` §1.1）挡住签发，本行断言不可达 | close 回执含 `[design tokens]` 且点名消费 1 枚；随后同 designId 的 eng-coder spawn 被机械拒；`design-slots` 里该槽不在 | `batch-lifecycle.mjs` 收口通路 ↔ `design-slots.mjs` 消费核 ↔ 槽文件 I/O | 父侧经 `batch` 工具收口（工程模式） | F-D7 ∥ F-D8 |
| 10-4 | 工程模式夹具里以 `batchDoc` 带批档跑一次设计评审（签发一个槽），再调 `subagent` `action:'design-slots'`（夹具同上：该评审须把 §3 写进批档） | 该槽行 `batch=<批档 basename>`（不是 `—`）；其余列零变 | `thincoder-core/agent-tools/advisor.mjs` 实例绑定 ↔ `design-token.mjs` settle 旁列 ↔ `design-slots.mjs` 清点行 | 父侧调 `design-slots`（工程模式） | F-SL1 ∥ F-D7 |
| 10-2 | 同一夹具，把 `persistEngTokens` 注入为抛错后再 close | close 被拒且回执点名消费失败；§1 状态行字节不变；槽仍在盘（内存已回滚） | 同上 | 同上 | F-D8 |
| 10-5 | 工程模式夹具：`batchDoc` = A 批跑一次评审签一枚槽，再用同一枚令牌派 `batchDoc` = B 批的 eng-coder；第二半：评审后改一个被审档即派单，再改回原字节派一次（夹具须含 §3 落地，同 10-1） | 第一次 spawn 被拒，拒文 = batch-mismatch 逐字（两个批档都点名）；第二次被拒，拒文含**变了的那几份档路径**、多份按 `docs` 原序（逐字单源 = `docs/core/design/TOOLS.md` §6.25 ③）；改回原字节那次放行。夹具须让封印由**本版**签出（封印行带 `docHashes`）——旧封印行是无路径形，属另一条分支，不在本行断言面 | `subagent-design-token.mjs` 的 `gateDesignToken` ↔ 槽文件两条旁列 ↔ 被审档读盘 | 父侧经 `subagent` 派 eng-coder（工程模式） | F-D7 ∥ F-D9 |

**既有行不被封印改写（一句回答）**：10-1 ∥ 10-4 ∥ 10-2 三行的夹具在评审之后写的是**批档**（§3 轮次块 ∥ §5 ∥ §6），而封印的被算集合排除 `docRoot.batches` 之下的档 ⇒ 三次收口都不改封印，三行断言零改。

落点：两行编号与文字落 `test/RTM.md`、用例落 `test/integration/batch-close-token-consume.test.mjs`（实现轮由 eng-coder 落，见下表）。

行数与坐标 = 本轮实读（行号口径 = 末行行号）；实施轮的行号随动——判据以内容机检为准（U-BG9 ∥ U-SL14 同口径），行号只用于定位。

**档位登记（本批九档；判据 = `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」①）**：

- **改代码前未过 500（五档）** ⇒ 按 ① 不提分拆：`token-ttl.mjs` ∥ `design-slots.mjs` ∥ `thincoder-core/session-slot-write.mjs` ∥ `design-token.mjs` ∥ `thincoder-core/agent-tools/subagent-design-token.mjs`（§10.1 ⑤ ∥ §10.2 ⑥ 的落点档）。
- **新增档（两档）** ⇒ 无「改前」，按 ① 判落盘长度：`thincoder-core/session-slots-manifest.mjs`（未过 500 ⇒ 不提分拆）· `advisor-launch.mjs`（`advisor-async.mjs` 的分拆产物，同目录，见下）。
- **改代码前已过 500（两档）**：`batch-lifecycle.mjs`（分拆已执行，见下）· `advisor-async.mjs`（本批碰了它 ⇒ 分拆在本批内实施，见下）。

各代码档的原始行数按 D12 住批档 §2 的档位登记段：本节只写关系，登记里写成数就成了下一个人要回来核的过期账。

**分拆方案的执行结果（`batch-lifecycle.mjs`）**：

- **已拆出**：收口面四道判据与回执 → `thincoder-core/agent-tools/batch-closeout.mjs`。该档头注逐字：「收口面的四道判据与回执（从 `batch-lifecycle.mjs` 拆出，2026-10-27）」。
- **仍留原档**：`closeBatchRecord` ∥ `statusBatchRecord` ∥ `reanchorOnClose` 与段写面；读档 / 解析工具住 `thincoder-core/agent-tools/batch-read.mjs`。
- **现行档位**：该档已落到 500 之下（读数按 D12 住批档，本节只写关系）⇒ 按 §3 ① 后续批不提分拆。

**该档此后的义务**：

- 设计轮：改前未过 500 ⇒ 按 `docs/core/design/DOC-GRAPH.md` §3「行数档位口径」① 不提分拆。
- 收口面：在 800 之下 ⇒ 按同节 ② 不提拆分要求。

**分拆方案（`advisor-async.mjs`，本批内实施）**：

- **拆出哪一族**：**实例与池判定**（对池与队列只读）——实例注册表读（`advisorRunsRead` · `advisorRuns` · `openCodeRun` · `openDesignRun`）、launch 实例解析（`resolveAdvisorLaunch` · `effectiveAdvisorRound`）、池上限与同 scope 守卫（`ADVISOR_POOL_LIMIT` · `resolveAdvisorPoolLimit` · `advisorPoolLimitFor` · `runningAdvisorOfScope` · `runningAdvisorCount` · `advisorReviewPending`）→ 新档 `advisor-launch.mjs`（与 `advisor-async.mjs` 同目录）。
- **切在哪**：原档「Review-instance registry」分节起、到 `cancelAsyncAdvisor` 之前的整段；`cancelAsyncAdvisor` 及其后（relay · 出队 ∥ 刷新 ∥ 补位 · `launchAsyncAdvisor` · `closeOpenCodeAdvisorRuns`）留在原档。
- **为什么切在这里**：
  - **① 两族的读写面不交叉**：拆出的一族只回答「哪条实例接这一轮、池让不让起」，全是只读判定，不碰队列、不碰控制器、不写池；留下的一族是「起 ∥ 停 ∥ 排 ∥ 关」的写动作。
  - **② 依赖方向单一**：拆出族只依赖六项——`carrierField` ∥ `getAsyncPool`（`async-settle.mjs`）∥ `docSetKey` ∥ `resolveReviewDocPaths` ∥ `scopeAdvisorMirror`（`review-facts.mjs`）∥ `randomUUID`（`node:crypto`）；原档反向 import 它的判定函数，两档之间是单向边。
  - **②-1 那一环是既有的，不是本次新增的**：与 `async-settle.mjs` 之间的一环是拆分前既有的（该档静态 import `refillAdvisorQueue`，拆出族 import `carrierField` ∥ `getAsyncPool`）——拆分后同一环多经 `advisor-launch.mjs` 一格，环数不变、本次未新增环，环上无模块级求值（两侧都只在函数体内调用）。
  - **③ 拆出段的体量**：拆出段占原档三成左右，原档剩下的写动作一族落到 500 之下。
  - **④ 既有 import 面零改**：原档按本档既有两次拆分的同一先例（`design-token.mjs` ∥ `advisor-settle.mjs` 的 re-export 块）继续 re-export 拆出族的导出：`thincoder-core/agent/completion.mjs` 的 `advisorReviewPending` ∥ `effectiveAdvisorRound`、`advisor.mjs` 的整组导出、测试面，都仍从 `advisor-async.mjs` 取。

**用例（当批单测 U-BG 组）**：

| # | 类 | 输入 | 期望 |
|---|---|---|---|
| U-BG1 | 正常 | settle 一份文档集含批档的评审 | 旁列出现 `{designId: <批档绝对路径>}`；token 值形不变（仍 `uuid:epoch`） |
| U-BG2 | 正常 | close 该批 | 该批全部槽移出槽文件；回执点名消费枚数；§1 → 「已收口」 |
| U-BG3 | 边界 | 同批两枚槽（评审 + 修轮） | 一次 close 全消费；它批槽零动 |
| U-BG4 | 边界 | 旧槽（无旁列）在场 | close **不消费**它；回执点名「N 枚无归属」；槽仍在盘 |
| U-BG5 | 错误 | `persistEngTokens` 注入失败 | close 被拒（§1 状态行字节不变）；内存槽回滚、可重试 |
| U-BG6 | 边界 | `status` §1 → 已收口（第二通路） | 与 close 同效消费 |
| U-BG7 | 边界 | 普通模式批档收口 | no-op，不报错 |
| U-BG8 | 边界 | 评审文档集不含批档（且 `run.batchDoc` = 空） | 旁列无该条目；清点「批」列 = `—`（不猜） |
| U-BG16 | 正常（生产形） | settle 一份 `run.batchDoc` = 批档绝对路径、`docSetKey` = 设计档集的评审 | 旁列 = 该批档绝对路径；清点「批」列 = 该档 basename（不再是 `—`） |
| U-BG17 | 错误（闸面批不符） | 槽的批归属 = A 批，spawn 的 `batchDoc` = B 批，令牌正确 | 拒；拒文逐字 = batch-mismatch 句（两个批档路径都点名）；槽未删 |
| U-BG18 | 正常（闸面批相符） | 槽的批归属 = A 批，spawn 的 `batchDoc` = A 批，令牌正确，封印未变 | 放行；返回槽内令牌 |
| U-BG19 | 正常（封印未动） | 评审后未改任何被审档即派单 | 重算的 sha256 = 记下的值 ⇒ 放行 |
| U-BG20 | 错误（封印不符） | 评审后改被审档一个字节即派单 | 拒；拒文逐字 = seal-mismatch 句；改回原字节后再派单放行（红侧对照） |
| U-BG21 | 边界（旧槽无值） | 槽无批归属旁列 ∥ 无封印值，令牌正确 | 两步都跳过（不拦）；返回槽内令牌 |
| U-BG22 | 错误（封印不可读） | 槽有封印值，清单里一份被审档从盘上删掉（缺档 ∥ 权限错）后派单 | 拒；拒文逐字 = seal-unreadable 句（含那份额档的路径）；不落进「无值 ⇒ 不拦」；按原字节放回那份档后再派单 ⇒ 放行 |
| U-BG9 | 机检（内容判据） | 四段判据文本：`dispatch.mjs` 放行条件句 ∥ `anyLiveDesignSlot` 判据体 ∥ `TOKEN_TTL_DEFAULT_MS` 行 ∥ `consume-design` 选择器句 | 四段逐字等于改动前快照（期望串写死在测试里；不靠 git） |
| U-BG10 | 边界（合并 · 纯函数面） | 合并函数五条断言：来参未携该字段 ∥ 来参空快照 ∥ 并集 ∥ 同 key 冲突 ∥ 两端皆空（槽侧已有 `{A: 批1}`） | 槽独有项保留（`{A: 批1}` 仍在）∥ 同 key 新写者胜 ∥ 两端皆空 ⇒ `null`——核内保存面不经过该函数（见「写面如实登记」） |
| U-BG11 | 错误（读不到） | 两支：① 槽文件截断（`JSON.parse` 失败）∥ ② 槽位换成目录（`EISDIR`，非 `ENOENT`）后 close 该批 | close 被拒并点名读失败（支二另断言拒因不含 `ENOENT`——非 ENOENT 的 I/O 错不得判成「不存在」）；§1 状态行字节不变；槽文件字节不变（零消费）；恢复可读后同一 close 成功 |
| U-BG12 | 边界（「没有」） | 干净会话：无槽文件 | close 照常收口；回执「消费 0 枚 · 留槽无归属 0 枚」；不铸槽文件 |
| U-BG13 | 边界（旧槽形） | 槽文件在盘、有槽表、无 `engDesignTokenBatches` 字段 | 空集不抛；消费 0 枚 · 留槽无归属 1 枚；旧槽零消费；不凭空铸旁列 |
| U-BG14 | 错误（manifest 层读不到） | 两支（`_slot` 未钉）：① manifest 在盘但截断 ② 干净会话：manifest 不存在（从未创建） | ① close 被拒、§1 字节不变、零消费、修复后同一 close 成功 ② 无槽号 = 合法缺省 ⇒ close 照常收口（「没有」≠「读不到」） |
| U-BG15 | 边界（manifest 读到了、说没有） | manifest 在盘且合法，但 `active` 缺席（`_slot` 未钉） | close 照常收口（不抛）· 零消费（无槽号 ⇒ 该批槽集为空）· 回执点名「消费 0 枚」· manifest 不被本通路改写（`batch-lifecycle.mjs` 内 `saveManifest` 零命中）· 探针反向验证：`thincoder-core/token-ttl.mjs` 的 `Number.isInteger` 支改成 `1` ∥ `0` ∥ `2` ∥「缺 `active` 即抛」四种错法各使本例如红（还原后绿） |

**夹具前置**：`U-BG16` 的夹具须含 §3 落地（轮次块 + 状态行 = `评审通过`）——§3 落地门（单源 = `docs/core/design/ADVISOR-GUARDS.md` §1.1）在 `run.batchDoc` 非空时生效，未落地则 settle 不签发、本行断言不可达。

**验收（回指批次档 §2 条目）**：

- A1 = U-BG1 + U-BG8（归属持久化、跨重启可读）
- A2 = U-BG2 + U-BG3 + U-BG6（两通路都消费本批全部槽，他批零动）
- A3 = U-BG4（旧槽不误伤、不猜、回执可见）
- A4 = U-BG5 + U-BG11 + U-BG12 + U-BG13 + U-BG14 + U-BG15（读形两向都对：读不到 ⇒ close 不落、档零字节变；「没有」⇒ 照常收口；manifest 层同判——文件不存在 ∥ `active` 缺席）
- A5 = U-BG9（放行条件句 ∥ 活槽判据体 ∥ TTL 常量 ∥ `consume-design` 选择器句逐字零变）
- A6 = U-BG10（并集规则的纯函数面；核内保存面未接该函数——见「写面如实登记」）
- A7 = U-BG16（生产调用形下旁列有值、清点「批」列不再是 `—`）+ U-BG8（无归属不猜）
- A8 = U-BG17 + U-BG18 + U-BG19 + U-BG20 + U-BG21 + U-BG22（闸面：批不符 ⇒ 拒；批相符 ⇒ 放行；封印未动 ⇒ 放行；封印动一个字节 ⇒ 拒；旧槽无值 ⇒ 跳过；封印不可读 ⇒ 拒）

**验证命令**：`node --test test/integration/batch-close-token-consume.test.mjs`（A8 的六条用例住该档，父侧收口时一并跑）。

**关键决策记录**：

| KD | 决策 | 被拒方案与理由 |
|---|---|---|
| KD-BG1 | 批次进**槽记录旁列** | ① token 值形三段——`tokenExpiryMs` 判「恰两段」，三段即 null ⇒ 全部槽失效、门永久关闭，且波及签发 / 校验 / 门禁相等 / 清点 / 日志形 / 提示词 ② 只存内存注册表——重开 / 重进后降级为 `—`，消费判据失去确定性 |
| KD-BG2 | 批标识 = **批档绝对路径** | basename——同名批档跨目录 / 跨仓误配；绝对路径在 `docSetKey` 里本就有 |
| KD-BG3 | 消费位 = **写状态行之前**，失败拒 close | 写后消费 + 回执报警——把「已收口而凭证仍在」变成可能的终态，正是本节要消的窗口 |
| KD-BG4 | 旧槽**不猜归属**、不迁移 | 按 designId 反查批档——该映射在盘不存在；猜错即消费别批授权 |
| KD-BG5 | `consume-design` 不加按批选择器 | 批归属消费 = 收口自动动作；再加手动入口只增面 |
| KD-BG6 | 收口消费**复用** `executeConsumeDesignAction({designIds})` | 在 `batch-lifecycle.mjs` 里另写落盘 + 回滚——同一份「单次 persist / 整体回滚 / 逐枚回执」逻辑写第二遍，两处必漂 |
| KD-BG7 | 旁列走**保存并集**（槽独有项保留） | 旁列按普通字段整覆盖——忙时保存即写丢归属 ⇒ 收口 no-op ⇒ 凭证留存（U-BG10 就是这条的反例面） |
| KD-BG8 | manifest 层按同一「没有 vs 读不到」判据分判，严格形落在 `loadManifest(cwd, { strict })` | 在 `token-ttl.mjs` 另写只读 `.active` 的严格读函数——判据落第三处、manifest 形状出现第二读者，三处必漂 |
| KD-BG9 | 同拍两读形（旁列严格 ∥ token 侧宽容）**不收敛**，按已知限制登记 | 同拍单读——须改造消费核 `executeConsumeDesignAction` 的槽读取形（超出本节）；触发条件是非确定性竞态（外部在两次相邻读之间改文件可读性） |
| KD-BG10 | 批归属派生 = **`run.batchDoc` 优先、`docSetKey` 兜底**（`batchAbsPathOfRun`） | ① 并进 `documents` 再算 `docSetKey`——实例键 / 在跑判定 / 冻结窗口的 scope 全被批档污染（否决）；② 只用 `run.batchDoc`、删掉兜底——把既有「批档写进 `documents`」的调用形（U-BG1 ∥ U-BG8 ∥ RTM 10-1）降成无归属，本批外零收益、却让一条已验收的路径变差 |
| KD-BG11 | 闸面批归属 = 比 spawn 的 `batchDoc` 绝对路径，槽侧走**严格读** | ① 比 `docSetKey`——它不含批档（KD-BG10 已拒）；② 槽侧宽容读——读不到被读成「旁列无值 ⇒ 不拦」，正是本步要堵的那条放行 |
| KD-BG12 | 评审封印 = settle 固化被审档 sha256（排除批档），派单复算 | ① 只验凭证——凭证签发后被审档仍可改，门照样放行（评审 #58 后的实况）；② 比 mtime ∥ 大小——两者都是近似值，改一个字节可以不动量级 |

**边界（不做）**：不改 `thincoder-core/agent/dispatch.mjs` 的放行条件 · 不改 `anyLiveDesignSlot` 判据语义 · 不改 TTL · 不放宽「无凭证 ⇒ 拒」（只可能更严） · 不改 `consume-design` 语义 · 不跨会话槽消费（只消费本会话槽内该批的槽，别会话凭证靠 TTL） · 不做时间戳等其它字段扩展（§10.1–§10.2 的两条旁列在内，其它字段扩展在外） · 不加「工程模式评审必带批档」的强制面（无归属槽的敞口按上文如实划界）。

### 10.1 闸面批归属（eng-coder spawn）

**比较对象 = 本次 spawn 的 `batchDoc` 参数解析后的绝对路径**：`thincoder-core/agent-tools/subagent-spawn.mjs` 的 `buildSpawnChild` 里 batchDoc 门已把它解析成 `batchDocAbs`，而该门先于 token 门。

**入参面**：`gateDesignToken(parent, args, { batchDocAbs })`——第三参就是上面那个已解析的值（解析单源 = `buildSpawnChild` 的 batchDoc 门，本步不再解析 `args.batchDoc`）。⑥ 封印步不添入参：它读的是槽里的 `docs`。

**没有「本次 spawn 缺 `batchDoc`」这一支**——eng-coder 缺它时更早的门就拒了。旁列无值是**槽**的属性（旧槽 ∥ 该次评审不带批档），不是派单参数的属性；两件事不能混成一条「缺席怎么办」。

**读形 = 严格形**：`readEngTokenBatchesFromSlot(agent, { strict: true })`（`thincoder-core/token-ttl.mjs`）。槽文件读不到（非 `ENOENT` 的 I/O 错 ∥ 解析失败）⇒ 抛，携槽文件路径 + 底层消息；**不落进「旁列无值 ⇒ 不拦」**——那一支只认「读到了、没有这个 designId 的行」。

**判定**：旁列有值 ∧ 归一后 ≠ 本次 `batchDoc` 绝对路径 ⇒ 拒。拒文单源 = `docs/core/design/TOOLS.md` §6.25 ③ 的 batch-mismatch 行，逐字：

```text
designToken batch mismatch — the eng-coder spawn is refused: this token was issued for <bound batch>, but this spawn implements <given batch>. Use the token from this batch's design review.
```

旁列无值（旁列启用前的旧槽 ∥ 该次评审不带批档）⇒ 不拦。归一 = §9 那条既有匹配规则（两侧 `node:path` 解析后绝对路径、分隔符归一、`win32` 不区分大小写）。

**落点 = `gateDesignToken` 的第 ⑤ 步**（`thincoder-core/agent-tools/subagent-design-token.mjs`）：四步既有核之后、`return issuedToken` 之前。四步核 = `resolveDesignSlot`（两条 designId 诊断）→ 参数在场 `missing` → 值相等 `mismatch` → `validateDesignToken` 的 `expired` ∥ `invalid`。

**为什么排在封印之前**：归属不符时不必逐档读盘算 hash，先判便宜的那条。判据顺序单源 = `docs/core/design/TOOLS.md` §6.25 ③ 的顺序行。

**分支出处（复现路径 · 复现驱动的防御）**：以 `batchDoc` = A 批跑一次设计评审铸一枚槽，再用同一枚令牌派 `batchDoc` = B 批的 eng-coder——四步核全过、派单放行；本步拒的就是这一面。未留下「归属与派单批不同」的会话实况记录，故本条按复现路径立、不按实况立。

**最相近先例**：`existing: docs/core/design/DESIGN-TOKEN-SETTLEMENT.md` §9 F-SL1 清点面（同一槽文件、同一并集视图、同一 `batchAbsPathOfRun` 派生）。对齐 = 同一旁列、同一归一判据；偏差 = 读形从缺省宽容升为严格。偏差理由 = 清点面缺值只错标一列，闸面缺值等于放行一枚可能属于别批的令牌。

**公开源核查**：`PROJECT-MANIFEST.json` 的 `index.publicRepos` = `["../.thincoder","../thincoder.com"]`（本轮实读）；两处都无令牌门 ∥ 槽文件契约 ⇒ 无外部源可查（结论 = 无相关）。

### 10.2 评审封印

**被算集合 = 该次评审 `documents` 里的非批档**：`docRoot.batches` 之下的档排除。理由 = 批档在评审通过后还要被写（§5 实施记录 ∥ §6 收口），把它算进封印就是让每一次正常收口都自毁封印。

**这组路径按受理面那把尺解析**：`documents` 走 `thincoder-core/agent-tools/review-facts.mjs` 的 `resolveReviewDocPaths(documents, agent.cwd)`，结果随实例落 `run.docAbs`，封印计算与派单复算都读这一组。实例键 `docSetKey` 只对旧实例（无 `docAbs`）兜底——它走 cwd 拼法，cwd 非项目根时与受理路径不是同一组。

**清单与 hash 一起存进槽**：`engDesignTokenSeals[designId] = { hash, docs: [绝对路径…], docHashes: [{ path, hash }] }`。派单侧**只读槽里的 `docs` 复算，不自己推清单**——自己推等于允许两处各自定义「被审档」是什么。`docHashes` 按同一字节口径逐档各算一次，只服务拒文点名；判定值仍是 `hash`。

**字节口径**：按 `docs` 数组顺序，逐档读原始字节，档与档之间放一个 `\n` 分隔；路径不进 hash。算法 = `node:crypto` 的 `createHash("sha256")`。

**落点（七处）**：

| 面 | 落点 |
|---|---|
| settle 算封印 | `thincoder-core/agent-tools/design-token.mjs` 的 `settleDesignReview`——与写批归属旁列同拍 |
| 派单复算 | `thincoder-core/agent-tools/subagent-design-token.mjs` 的 `gateDesignToken` **第 ⑥ 步**（批归属之后） |
| 读形 | `thincoder-core/token-ttl.mjs` 的 `readEngTokenSealsFromSlot(agent, { strict: true })`——与 `readEngTokenBatchesFromSlot` 同形兄弟；闸面严格形，槽文件读不到 ⇒ 抛 |
| 序列化字段 | 同档的 `engTokenSlotFields` 增 `engDesignTokenSeals` |
| 落盘 | 同档的 `persistEngTokens`（逐字段复制，旁列同处落盘） |
| 合并 | `thincoder-core/session-slot-write.mjs` 的 `mergeEngTokenSealsForSave`，紧邻 `mergeEngTokenBatchesForSave`；同 key 冲突 = **新写者胜** |
| 恢复 | `thincoder-core/token-ttl.mjs` 的 `restoreEngTokens` 同拍读入 |

**判定**：有封印值 ∧ 重算的 sha256 ≠ 记下的值 ⇒ 拒。拒文单源 = `docs/core/design/TOOLS.md` §6.25 ③。

**拒文点名变了的那几份档**：重算不一致时逐档比对 `docHashes`，命中了差异的路径按 `docs` 原顺序写进拒文，逐字：

```text
designToken seal mismatch — the reviewed documents changed after the review passed: <path>[, <path>…] — re-run the review, or revert those files to the version the review approved.
```

**没有 `docHashes` 的封印行（本改动之前写下的）⇒ 拒文保留无路径形**，逐字：

```text
designToken seal mismatch — the reviewed documents changed after the review passed (this seal records no per-document hashes, so no path can be named) — re-run the review, or revert the change.
```

这一支的业务结果与有逐档 hash 时相同（照旧拒），少的是报面的一个名字；现算一份今天的 hash 去当名字，点的是评审没看过的那一份，比不给名字坏。

**三参形（拒文构造器 · 本档定义，别处只指过来）**：`designTokenRefusal(kind, designId, scope)`。第三参 `scope` 只装「报面要点的名字」，不参与任何判定。

**必传，不设默认值**：无名字可点的态传 `{}`；缺参在构造器入口拒，并点名 `scope`——缺省值会默默代调用方决定“没有名字”，而错位的判决三条层下去了才看得出来。

四个带名字的态各自入参：`mismatch` ⇒ `designId` 走第二参、`scope` 传 `{}` · `batch-mismatch` ⇒ `{ boundBatch, givenBatch }` 两个绝对路径 · `seal-mismatch` ⇒ `{ changed: [<可变路径…>] }`（按 `docs` 原序；空数组 ⇒ 无路径形，用于没有 `docHashes` 的旧封印行）· `seal-unreadable` ⇒ `{ path }`。

**状态名是报面标签，`kind` 收的是代码字面量**：`mismatch` ⇒ `"mismatch"` · `batch-mismatch` ⇒ `"batch"` · `seal-mismatch` ⇒ `"seal"` · `seal-unreadable` ⇒ `"seal-unreadable"`。照状态名传 `"seal-mismatch"` 落不到点名那条分支（构造器未识别的 `kind` 一律走 `invalid` 的拒文），对应关系因此写在这里。

签名与入参名只在本段写一次（`docs/core/design/TOOLS.md` §6.25 ④ 与 `docs/core/design/PROMPT-SYSTEM.md` §6.100 都指回本段）；要加一个新名字，先在这里加一行再落地。

无封印值（旧槽）⇒ 不拦。**被审档缺档 ∥ 不可读 ⇒ 拒**（fail-closed——判不了就不放行），拒文逐字：

```text
designToken seal unreadable — the eng-coder spawn is refused: the reviewed document <path> cannot be read, so the seal cannot be checked. Restore that file, or re-run the review, and spawn again.
```

**settle 面算不出 ⇒ 拒签，不 throw**：`settleDesignReview` 读被审档失败时返回 `{passed:false, sign:null}`，并在**任何写之前**返回（槽与 §3 签字都不动）。标记句单源 = `thincoder-core/agent-tools/design-token.mjs` 的 `SEAL_UNREADABLE_MARK`。

**为什么拒签而不是 throw**：这是数据条件（评审看过的档在结算前被移走 ∥ 锁住），读回执的人要的是一句可重评的拒文。throw 会穿过 `settleAdvisorRun` 的 `onAccounting`（该调用串无 catch），跳过结算尾（挂起 ∥ 事件 ∥ 唤醒 ∥ 补位）——可重评的拒签会变成未捕获异常。

**闸面不随此改**：闸面读不到被审档仍抛（§10.2 落点表的「读形」行），因为那里没有可回的结算面。

**分支出处（本次会话实况）**：评审 #58 过后改过被审档再派单——当时四步核全过、放行。本步治的是「凭证有效、评审看过的那一版已经不是这一版」那一面。

**最相近先例**：**未勘察到同形先例**——仓内没有第二处「评审时固化被审档、派单时复算」的读数。仍做的理由 = 四步核只验凭证本身，凭证签发之后被审档还能改，而「评审看过的是哪一版」在盘上没有第二个出处；代价 = 每份被审档在 settle 与每次派单各读一遍（档集小，纯读）。

**公开源核查**：同 §10.1 一条——`index.publicRepos` 两处都无相关契约。

token 值形零改——仍 `<uuid>:<expiryMs>` 两段（三段会让全部槽失效）。
