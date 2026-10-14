# 2026-10-13 · 管理会话凭据语义=发送者（谁用谁——轻通道轮）
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-13 · 来源 = 用户 2026-10-13 16:36 走查（旧会话部分哑）+ 16:39 裁定（凭据语义 = 谁用谁）——轻通道轮开。
> 台账 = #1361（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**轻通道轮 · 管理会话凭据语义 = 发送者（谁用谁）**（round 行 = 台账 #1361——「收尾链待跑」；每笔 = 披露 ∥ 变更 ∥ 实走 ∥ 冻结；§5 = 不适用——实施面 = 父侧直笔，记 §1）

## 笔 1 · 管理会话模型出口凭据主体：会话 owner ⇒ 本回合发送者（用户 2026-10-13 16:36/16:39）

- **披露（笔前）**：本笔 = 轻通道（缺陷修复——用户走查原话「谁用用谁的凭证」为源）｜变更 = 出口凭据主体 ⇒ **本回合发送者（登录成员）**（原 = 会话 owner——设计源头偏差 `ADMIN-AGENT.md:450`「归属 = 会话 owner」）｜reach = `src/agent/{chat,chat-routes,chat-wake}.mjs` + 本轮单测档（`2026-10-13-chat-cred-sender.test.mjs`）+ 需求档 46⑤ 语义句｜回滚 = revert 单笔。
- **根因（箱上实据）**：出口装配逐请求取**会话 owner** 的 sk（`chat.mjs:511` 原 `createdBy: chat.created_by`）；owner 自新版部署后未登录 ⇒ 无 sk ⇒ 会话全哑（实测：walker 名下 1/3/4/5 哑 ∥ liwei 名下 2/6 正常——数据在档）。
- **裁定**：用户 16:39 给两形——(a) 各看各的 ∥ (b) 共见 + 谁用谁的凭据；本笔按 **(b)** 修（保现状可见性；(a) = 另改，未取）。
- **变更**：待回填（落笔后实读）。
- **实走**：待回填（单测 + .5 部署 + 箱上复测）。
- **冻结**：待回填。

**笔 1 · 回填（变更）**

- **变更（实读）**：`src/agent/chat.mjs`——`chatProviderOf`/`buildChatExit` 参数 `createdBy` ⇒ **`senderId`**（`:359/:364/:391/:392` + 出口说明注 `:354`）∥ `runChatTurn` 增 `senderId` 参（`:421`）+ 出口装配 **`senderId: senderId ?? chat.created_by ?? null`**（`:511`——唤醒轮随最近发送者、主人兜底）∥ `runChatWakeTurn` 增参 + 透传（`:656/:682`）∥ 结算钩子携发送者（`:499`）∥ 唤醒再武装携发送者（`:686`）。`src/agent/chat-routes.mjs`——`POST …/messages` 捕获登录成员（`:103` `const { member: admin } = requireAdmin(db, req)`）⇒ 回合（`:128`）+ 链尾泵（`:134`）各携 `senderId: admin.id`。`src/agent/chat-wake.mjs`——五处透传（`contextOf` `:60` ∥ `fireChatWake` `:90/:98` ∥ `armChatWake` `:105/:108` ∥ `pumpChatWake` `:119/:123/:124` ∥ `installSettleHook` `:132/:136/:137`）。
- **测试面**：新增 `docs/batches/2026-10-13-chat-cred-sender.test.mjs`（4 例：主体=发送者 ∥ 装配直驱 ∥ 缺位人话 ∥ 回落链+管道源形）∥ 两旧件断言文案随正（`2026-10-12-server-wake-face.test.mjs:462` ∥ `2026-10-13-server-core-unification.test.mjs:372`——值断言零改）。
- **需求档**：46⑤ 增「凭据主体 = 本回合发送者（谁用谁）」句 + 变更记录行（2026-10-13）。
- **提交**：`3e6682fe`「fix: admin chat model exit uses the sender&apos;s credential」（8 文件）——双推 gitee ∥ github。

**笔 1 · 回填（实走）**

- **本地**：单测件 4/4 绿（① owner 无匙 ∥ 发送者有匙 ⇒ 出口携发送者明文 ∥ ② 装配直驱假核所见=发送者 ∥ ③ 缺位人话 ∥ ④ 回落链+管道源形）；`2026-10-12-server-wake-face.test.mjs` 13/13 零回归（N78 出账 ∥ E58 失败面同绿）。
- **.5 部署全链（实跑）**：箱 `git pull --ff-only`（`b4694ec..18d6333`）⇒ 旧像打标 `thincoder-server:pre-b4694ec`（回滚锚）⇒ `docker build -f thincoder-server/Dockerfile`（新像 **`09fddc764e2e`**——首次构建上下文起在子目录报 `COPY failed`，改正到仓根重跑成功）⇒ `docker compose up -d --force-recreate` ⇒ 容器 Up ∥ `/healthz` 200（`uptime:4`）∥ 容器内实读/`chat.mjs` 携 `senderId` **10 行**（与源码逐行对应）。
- **箱上复测 = 用户实走**（待）：旧会话（walker 名下 1/3/4/5）发一语——预期能说 ∥ 记账归发送者。
- **冻结**：待（用户复测 + 收尾链后）。

**笔 1 · 补记（归档轮 #45 上抛 1 修复——同轮）**

- `chat-wake.mjs:127` 无交付再武装漏透传 `senderId`（闩上下文刷 null ⇒ 唤醒轮回落主人；探针 A/B 实证：A 现形 ⇒ `model_error` 凭据缺位 ∥ B 等价透传 ⇒ `succeeded`）⇒ 修复 = 一行透传（`:127`）+ 单测断言补齐（本轮件 ④ 增「无交付再武装携发送者」）⇒ 复跑：本轮件 **4/4** ∥ wake-face **13/13** 零回归。
- 归档轮（#45）落面 = `ADMIN-AGENT.md` ×12 ∥ `ACCOUNTS.md` ×2 ∥ `METERING.md` ×2（跨档同拍：同机制活面句一并收正）+ 批档 §2 段——D6 读回在案。
- 上抛 2（审计 actor 面沿 owner）= 已在册开放点（`ADMIN-AGENT.md` §15.3①），零触登记。

**笔 1 · 实走补记（#45 上抛 1 修复后重部署——#47）**：提交 `d934c4d4` 双推 ⇒ .5 全链重跑（旧像回滚锚 `thincoder-server:pre-18d6333` ⇒ 新像 **`0ae084ffdcbc`** ⇒ 容器重起）⇒ `/healthz` 200（`uptime:4`）。至此 .5 = 含唤醒面修复的最新码。

**笔 1 · 补记（收尾链第②段评审 #48 裁定）**

- 评审 #48 判 **changes-required**（1 条 🔴：`chat.mjs:26` 头注未随正——同机制两处异述）+ 表外两条；**发现 1 已修**：头注主体随正 =「**本回合发送者**（登录成员）的 `admin-agent` sk 明文」（一行；读回 + 语法检在案）——父侧直笔、可 revert；第 2 轮核修已点火。
- 表外 1（`2026-10-13-server-core-unification.md:164` 字面悬空 `createdBy`）⇒ 已收口冻结档，不回改（冻结纪律）——如实登记；表外 2（`console-reasoning-levels.test.mjs:109-111` 旧件预存红）⇒ 在册已知态（旧件不扫绿），零动作。
- **§3 未写入**（评审未落笔——`batchDoc` 已绑而结果未落 §3；如实）：结论代录归 §6（父侧，收口时落）。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（收尾链第①段·设计归档（该轮实现已落盘已上线））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**收尾链第①段 · 设计归档（chat-cred-sender 轻通道轮——2026-10-13 · 台账 #1361）**

**本段条目（覆盖）**：设计面凭据主体口径收正 = **本回合发送者（登录成员）——谁用谁**（用户 2026-10-13 16:39 裁）；唤醒/续跑轮随最近发送者、主人兜底（`senderId ?? chat.created_by`——上下文缺位 ⇒ 主人）。实现已落盘已上线（提交 `3e6682fe`，坐标详 §1 回填）；本段只归档设计面，不触产品码。

**设计档落点（逐处——已落盘）**：

- `docs/server/design/agent/ADMIN-AGENT.md`：§16.3 归属 = 本回合发送者（`:450`）∥ §16.2 决策（`:438`）＋ 唤醒回合同源（`:445`）∥ §15.3③ 计费归因（`:409`）∥ §16.4 出口入参（`:460`）＋ 全链出账（`:461`）∥ §5 出口两行（`:202`/`:204`）∥ §8 N78 行（`:153`）∥ §9 KD-SV-129②（`:177`）＋ KD-SV-130①（`:178`）∥ §13 R71④ 归因句（`:286`）∥ 档内变更记录行（`:552`）。
- `docs/server/design/accounts/ACCOUNTS.md` §1 管理面 sk 条（`:17`）＋ 变更记录行（`:260`）∥ `docs/server/design/metering/METERING.md` §1 出账归因句（`:16`）＋ 变更记录行（`:176`）。

**口径（单源）**：机制全文 = `ADMIN-AGENT.md` §16.2/§16.3；ACCOUNTS/METERING 两处 = 同句摘要 + 指针（跨档同拍已落——留则成三档相抵）。

**受影响文件与测试覆盖（实现面——本段零触，记实况）**：`thincoder-server/src/agent/{chat,chat-routes,chat-wake}.mjs`（本笔净 0 行——参数/透传就地改名）；测试面 = `docs/batches/2026-10-13-chat-cred-sender.test.mjs`（4 例）＋ 两兄弟件断言文案随正（值断言零改）。

**验收对照（三链同源）**：需求档 46⑤（`docs/server/requirements/PROJECT.md:288`——「凭据主体 = 本回合发送者（谁用谁）」）↔ 设计档 §16.3/§16.4（上文落点）↔ 本段——逐处同口径在册。

**关键决策**：① 唤醒/续跑轮 = 随最近发送者、主人兜底——按已实现回转链落字（`senderId ?? chat.created_by`，不新造机制句）；② 跨档同拍（ACCOUNTS/METERING 两处活面句）——同机制设计面单源。

**上抛项**：

1. **[待裁] 到期闩火唤醒轮凭据回落主人——`chat-wake.mjs:127` 泵无交付分支再武装未透传 `senderId`**（与「唤醒/续跑轮随最近发送者」口径相抵；实测探针两跑同布景：owner 零匙 ∥ 发送者有匙——A（现形）= 唤醒回合 `model_error`「管理会话模型凭据缺位」；B（等价透传）= `succeeded`；探针 = `.thincoder/tmp/wake-sender-probe.mjs`）。修法 = `:127` 一行透传（产品码——非本段笔权）。请裁：另笔修复 ∥ 记账。
2. **[知会] 审计行 actor 面仍沿会话 owner**（`thincoder-server/src/agent/chat.mjs:431` `actorNameOf(chat.created_by)`；§15.3① 开放点在案——非凭据面，本段零触，如实登记）。

## §3 设计评审（评审子代理）
## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）
## §6 验证与收口（父代理）
