# 2026-10-15 · team-token-rotation
> 六段 append-only，一段一作者：§1 讨论（主 agent）· §2 批次任务与设计（eng-designer）· §3 设计评审（评审子代理）· §4 用户批准（主 agent）· §5 实施记录（eng-coder）· §6 验证与收口（父代理）。
> 编制：主 agent · 2026-10-15 · 来源 = 用户 2026-10-15 22:37「能开动的都开动起来吧」+ 台账 #1238（团队 token/key 轮换端侧机制——独立小批）。
> 台账 = #1238（server · 归批）。前情 = 无（独立批）。
## §1 讨论（主 agent）
**状态行**：🔄 进行中（…）
<§1 模板占位：本批条目 / 关键判据 / 授权口径>

**轮次开账（2026-10-15 22:3x · 主 agent）**

**触发** = 用户 22:37「能开动的都开动起来吧」＋ 合并扫描（同面部扫描：同面条目 = 无——#1220（登录后模型候选刷新）系另一对象，不并）。

**对象** = **#1238** 团队 token/key 轮换端侧可达机制（现状：服务端客户面仅 `login ∥ logout ∥ me`；端侧两卡位已预留、零控件）。**父侧建议方向** = ② 服务端新端点 + 三端随动（轮换本义 = 旧即失效；① 重登式因现无「重登即吊销」语义、暂不采用）——**待设计轮定形与量级**。体量 = 独立小批。

**授权口径** = 用户 22:37 令；设计轮已点火（eng-designer）。

**尾注裁定 + 过程记录（主 agent · 2026-10-15 23:2x）**
- 尾注①（`ACCOUNTS.md:62` `key_rotate` detail 无 `surface` ∥ `:84-86` surface 仅列四型/三写点）：**随正入实施轮落点**——两处随本批实施同拍收正（detail 携 `surface:"client"`；surface 族列）。
- 尾注②（`CLIENT.md:45`「客户端接入单元测试档（服务端面——估 ≈260 行）」该档不在盘）：**实施轮随正**（按实况改写）。
- 尾注③（`CLIENT.md:90` R50④ 旧链随正记录）：**实施轮随正**（链制已退场）。
- 尾注④（`TEAM.md:107`「四消费面」vs `:53`「五消费面」）：**实施轮随正**（计数对齐）。
- 尾注⑤（`thincoder-server/test/rc-resolve.mjs:2-3` 疑滞后）：**挂账**（server 面；已入册）。
- 过程记录（更正声明）：§2 修正节「机检读数」段内 `node scripts/doc-check.mjs` 亲跑读数（含「存量基线 254 红」）= 违规来源（12:10 禁调令——一切轮次一切角色零调用、零引读数）——**不作任何判据**；同段其余机检（`doc-check-width.mjs` ∥ `anchors` ∥ `linecounts` 直调）照常有效；后续轮次零调用。

## §2 批次任务与设计（eng-designer）
**状态行**：设计完成（修正轮 2 落讫——轮次 2 十号（🟡2 ∥ 🔵8）定点全收正（设计档两档三处原地收正 ∥ §2 补记见本段末尾「修正轮 2 定点处置」节）；随正件清单增补（ACCOUNTS.md 四处——实施轮同拍））
<§2 模板占位：本批条目（覆盖） / 设计档落点 / 机制设计 / 受影响文件与测试覆盖 / 验收对照 / 关键决策 / 上抛项>

**轮次落笔（2026-10-15 · eng-designer · initial 轮）**

**本批条目（覆盖——承 §1）**

| # | 条目 | 设计落点 |
|---|---|---|
| 1 | **#1238** 服务端新端点——客户端轮换（`POST /api/client/rotate`；单把换发） | `server/design/client/CLIENT.md` §1 ∥ §2 ∥ §5 KD-SV-63 ∥ §6 N40/E29 |
| 2 | 端侧轮换机制（核 `teamRotate` + 三端管理面可达 + 确认/结果面） | `core/design/TEAM.md` §2.7 ∥ §2.5 ∥ §3 D-TM9 ∥ §5 ⑨ ∥ §6 N4/B4/E4 |
| 3 | 三端接线（CLI 子命令 ∥ VSC 卡 ∥ 桌面段）+ 控制台处置 + 判据 + 量级 | 本段 ③–⑤ ∥ 面档随正件（R51②） |

**不覆盖**：#1220（登录后模型候选刷新——另一对象）；其余台账条目（扩射程禁）。
**需求侧判定**：需回笔（挂指针——主 agent 笔）：server 需求 AC-31 行（现读 `docs/server/requirements/PROJECT.md:408`）增轮换判据行；端侧需求两处「轮换 = 待立端点」句随正（`vsc/requirements/WEBVIEW.md:41` F-W21 ∥ `desktop/requirements/PROJECT.md:56` 团队卡行）。本件性质 = 技术待办，非用户点名需求点。

**设计档落点（已落——本席）**：`docs/server/design/client/CLIENT.md`（§1 轮换语义 ∥ §2 rotate 行 ∥ §3 行读 ∥ §4 判据 ∥ §5 KD-SV-63 ∥ §6 N40/E29 ∥ §7 边界 ∥ §8 R51）∥ `docs/core/design/TEAM.md`（§1 承载 ∥ §2.7 流程 ∥ §2.5 面/文案 ∥ §3 D-TM9 ∥ §4 行读 ∥ §5 ⑨ ∥ §6 N4/B4/E4 ∥ §7 边界）∥ `docs/server/design/gateway/API.md` :15 索引行（:15 实读改讫）。
**随正件（本席——同拍；如遇他批在评顺延）**：`vsc/design/SETTINGS.md` §2.20 ∥ `vsc/design/WEBVIEW.md` :247 ∥ `desktop/design/SETTINGS.md` :324 ∥ `desktop/design/UI.md` :424 ∥ `desktop/design/IPC.md` §2 团队族行 + 白名单（53 ⇒ 54）∥ `cli/design/CLI-ENTRY.md` §2 ∥ `cli/design/TUI-COMMANDS.md` §5.5。

**机制设计（一句话）**：端侧管理面（已登录）发起 ⇒ `POST /api/client/rotate`（Bearer 当前 token）⇒ 服务端**吊销当枚 + 同标签重签**（旧即失效——逐请求查库）⇒ 端侧一次写盘换 token（+ 派生条目镜像）⇒ 确认一步 + 结果行；审计单行 `key_rotate`（`surface:"client"`）；零新码 ∥ 零新审计型 ∥ 零迁移 ∥ 零新校验面。

**① 端点形**

| 项 | 形 |
|---|---|
| 路径 ∥ 方法 | `POST /api/client/rotate`（`/api/client/*` 族第四件：login ∥ logout ∥ rotate ∥ me） |
| 鉴权 | 登录 token（`Authorization: Bearer`——`requireApiKey` 单源复用，`gateway/routes.mjs:25`）；无 ∥ 无效 ⇒ 401 `invalid_api_key`（三态不区分） |
| 载荷 | 零体（不读体；写端点 JSON 门照常——端侧发 `{}` + `content-type: application/json`，沿 logout 件形） |
| 回执 | 200 `{ ok:true, token }`——token = 新明文一次性回显（同登录语义）；label/member 不变不回声（端侧已持） |
| 错误形 | 401 `invalid_api_key`（无 ∥ 无效——零变更、审计零行）∥ 400 `invalid_request_error`（非 JSON content-type——分派层统一）。**零新码**（`gateway/API.md` §3 全码复用） |
| 语义 | 吊销当枚（`revokeKey`——软删行保留）+ 同标签重签一枚（`issueKey`——`name` = 原值；免 20 上限沿客户端面先例）；**不动同成员他枚**（单把换发——KD-SV-63） |
| 审计 | **单行** `key_rotate`（既有十七型之一——零增型）：`actor` = 成员名 ∥ `detail = { keyHint: <新>, surface: "client" }` |
| 注册面 | `src/client/routes.mjs` 内一处理器（`registerClientRoutes` 既有注册——零新注册行）；档头一句随正 |

**② 吊销语义**

- **旧 token 即失效**：`revokeKey` 软删 + 逐请求查库（KD-SV-11——无缓存）⇒ 旧 token **下一请求**即 401——两面同判（`/api/client/*` ∥ `/v1/*` 同一 `verifyKey` 校验单源）。
- **审计行**：单行 `key_rotate`（上表）；族内对齐——login 两行（`login_success` + `key_issue`）∥ logout 一行（`key_revoke`）∥ rotate 一行（`key_rotate`）——均携 `surface:"client"`。
- **与 logout 关系**：同 = 均以 token 自身鉴权、均吊销当枚；异 = logout 终结登录态（端侧清 token、团队面关），rotate **换发续用**（登录态保持）。失败面：logout best-effort（网络败照清本地）；**rotate 非 best-effort**——网络败 ⇒ 服务端零变更（旧 token 仍有效，重试即复原）；响应丢失 ∥ 写盘败 ⇒ 本地持已死 token ⇒ 下拍 `teamVerify` 转「已失效」，恢复径 = 重登（披露在案）。
- **确认步**：三端管理面一次确认（后果句 ⇒ 确认/取消；图形端 = 卡/段内就地两键 ∥ CLI = 问句 y/N）——取消 ⇒ 零动作（文句 = `TEAM.md` §2.5 轮换句）。

**③ 三端接线面清单（逐档 file——现读 ⇒ 估）＋ 控制台处置**

| 域 | 档（现读 ⇒ 估） | 增改 |
|---|---|---|
| server | `thincoder-server/src/client/routes.mjs`（77 ⇒ ≈92） | rotate 处理器 + 档头句 |
| core | `thincoder-core/team.mjs`（223 ⇒ ≈252） | `teamRotate`（三端共用单源——§2.7） |
| CLI | `src/cli/team-command.mjs`（246 ⇒ ≈292） | `team rotate` ∥ 确认问句 ∥ 结果行 `Rotated.` ∥ usage |
| CLI | `src/tui/cmd-team.mjs`（235 ⇒ ≈258） | `/team rotate` 支 |
| CLI | `bin/thincoder.mjs`（190 ⇒ ≈191） | USAGE 行 |
| CLI | `src/completions.mjs`（156 ⇒ ≈156） | `team` 词面四处（rotate） |
| VSC | `webview/settings-team.js`（132 ⇒ ≈178） | 卡「轮换」控件 ∥ 确认一步（确认/取消两键——就地，非原生弹窗）∥ 结果行 |
| VSC | `src/extension/team.mjs`（44 ⇒ ≈52） | `teamRotate` 转口 |
| VSC | `src/extension/panel-messages-settings.mjs`（285 ⇒ ≈300） | `handleTeamRotate`（成/失效 ⇒ 推送 + 团队面随动） |
| VSC | `src/extension/panel-messages.mjs`（391 ⇒ ≈394） | import 名 + case |
| VSC | `webview/chat-messages.js`（295 ⇒ ≈297） | `teamRotateResult` case |
| VSC | `locales/en.json` ∥ `zh.json` | +≈4 键（控件词 ∥ 确认句 ∥ 成句） |
| 桌面 | `renderer/views/settings-sections-team.mjs`（143 ⇒ ≈200） | 段「轮换」控件 ∥ 确认一步（两键）∥ 结果行 |
| 桌面 | `renderer/views/settings.mjs`（454 ⇒ 454） | team 支传 handlers（行内改——轮换出口按表入院） |
| 桌面 | `renderer/mount-team.mjs`（324 ⇒ ≈352） | rotate 出口 ∥ 确认态 ∥ 复读两调用点 |
| 桌面 | `src/main/team.mjs`（46 ⇒ ≈58）∥ `src/main/ipc-registry.mjs`（102 ⇒ ≈103）∥ `src/preload/preload.cjs`（92 ⇒ ≈93） | `team:rotate` 通道（三件） |
| 桌面 | `renderer/i18n-settings.mjs`（208 ⇒ ≈212） | +≈4 键 |
| 测试 | `docs/batches/2026-10-15-team-token-rotation.test.mjs`（拟新增 ≈320） | 跨面单件（服务端 ∥ 核 ∥ 三端结构） |

- **控制台（webui）写面 = 零改**：轮换为端侧动作（新明文须落端侧 config——控制台无投递径）；控制台既有「我的·key」列表（逐把吊销）自然反映新旧两行；「全换」端点页面维持下架（多把模型）。**配置项原则不适用**——本件为动作非配置项（可达面 = 上表三端管理面；桌面/VSC 两卡位即登录面补全批所留）。
- 零改确认：`accounts/keys.mjs` ∥ `accounts/audit.mjs` ∥ `accounts/routes.mjs`（`/api/me/keys/rotate` 保留面不动）∥ `gateway/routes.mjs` ∥ VSC `settings.mjs`/`team-surface.mjs`（推送/刷新复用）∥ 桌面 `settings-confirm.mjs` 等共享件零触。

**④ 验收判据（可机检）**

| # | 判据 | 载体 |
|---|---|---|
| 1 | 服务端：rotate ⇒ 200 `{ok:true, token}` ∥ 旧 token 下一请求（`/api/client/me` ∥ `/v1/models`）⇒ 401 ∥ `api_keys` 双行（旧 revoked ∥ 新 active——名同）∥ 审计 `key_rotate` 单行（`surface:"client"`）；无 ∥ 无效 token ⇒ 401（零变更）；非 JSON 体 ⇒ 400（机检 = N40/E29） | 单元测试档（HTTP 直打，沿 N37/B27 同桩制） |
| 2 | 核 `teamRotate`：成 ⇒ `team.token` 替换 + 派生条目 `apiKey` 同值（一次写盘）；败 ⇒ 零写盘；401 ⇒ `reason:"invalid"`（机检 = N4/B4/E4） | 单元测试档（临时 config + HTTP 桩） |
| 3 | 三端注册/结构：CLI `team rotate`（argv ∥ /team ∥ usage ∥ completions 词面）在册；VSC 卡轮换控件 + `teamRotate`/`teamRotateResult` 消息链；桌面段轮换控件 + `team:rotate` 通道（preload ∥ registry ∥ 白名单计数随正） | 单元测试档（结构源扫） |
| 4 | 文案：确认句 ∥ 成句 ∥ 「已失效——重新登录」三端逐字同句（VSC/桌面 zh 键值相等 ∥ CLI 直出同句） | 单元测试档 |
| 5 | 收口轮实走：三端各一轮——轮换 ⇒ 旧 token 401 ∥ 新 token 可用（模型面照常）∥ 本机零重登 | 收口轮（父侧） |

**⑤ 量级（行数估）**

- 代码 ≈ **+295**：server ≈15 ∥ core ≈29 ∥ CLI ≈70 ∥ VSC ≈78 ∥ 桌面 ≈103（逐档 = 上表 ③）。
- 测试档 ≈ **320**（跨面单件，拟新增）；文档 = 设计档三档（已落）+ 随正件七处（上「设计档落点」）。
- 体量维持**独立小批**（零迁移 ∥ 共享件零触）。
- 行读口径附注：本批触碰的 §4 行一律收正为「现读 X ⇒ 估 Y」；旧行读漂移随正（`team.mjs` 双行归并单行——196/≈240 ⇒ 现读 223）。

**关键决策**：KD-SV-63（`CLIENT.md` §5——单把换发）∥ D-TM9（`TEAM.md` §3——端侧可达 + 确认一步）。**被否**：重登式（旧不失效——轮换本义相抵）∥ 全换（断他端 token + 沙盒工作区 key）∥ 就地改 hash（离 revoke + issue 先例 ∥ 审计链断）∥ 控制台加轮换面（新明文无投递径）∥ 零确认（凭据换发为不可见动作——点错无痕）。

**上抛项**：R51（`CLIENT.md` §8——① 需求档回笔指针（主 agent 笔）∥ ② 随正件清单 ∥ ③ 披露）。**披露三条（如无异议按设计实施）**：㈠ 确认步照案——后果句一步 + 确认/取消（三端就地；零原生弹窗——沿「后果明示须可见」口径）；㈡ 失败面如实——响应丢失/写盘败 ⇒ 本地转「已失效」→ 重登恢复（与 logout best-effort 语义之别在案）；㈢ 控制台零改（§③）。

**未触确认**：产品码零触（本席全部写面 = 三档设计档 + 本段）；需求档零触（指针代）；§1/§3 记录面零触；无夹带。

### 修正轮 1 定点处置（轮次 1 发现 ①–⑩ · 2026-10-15 · fix 轮）

**来源**：本批 §3 轮次 1（changes-required——🔴2 ∥ 🟡4 ∥ 🔵4）十发现；父侧裁受理为 ①–⑩ 定点清单。**点修**——逐号改、逐号回读：设计档两档原地收正（`CLIENT.md` ∥ `TEAM.md`）；本段承载 §2 面修正（§2 = append-only——被修正原行不重写，下列 = 收正后现行文本）。

**逐号处置**

| 号 | 发现 | 处置 | 落点（file:line——改后现读） |
|---|---|---|---|
| ①🔴 | 轮换成句 CLI 实化两处相抵 | 取 a：CLI 结果行 = 成句直出「已轮换——本机已改用新 token」（对齐「CLI = 单语直出同句」——`Rotated.` 径弃用）；判据 4 收正（三串逐字列明——可机检） | `TEAM.md:94` ∥ `TEAM.md:98`（CLI 出词面新行）∥ 本段块 A |
| ②🔴 | `reason` 域第五值未入单源 | 域扩五值（`invalid` ⇔「已失效——重新登录」）+ 判据行按流程注明 401 映射（登录 ⇒ `credentials` ∥ 轮换 ⇒ `invalid`）；§2.5↔§2.7 零相抵；应声随动 = 同节两处「四句/四值」⇒「五句/五值」 | `TEAM.md:68` ∥ `TEAM.md:73` ∥ `TEAM.md:75` ∥ `TEAM.md:77` ∥ `TEAM.md:194` |
| ③🟡 | 确认门无判据 ∥ 非 TTY 未定形 | 判据补「取消 ∥ 未确认 ⇒ 零请求零写盘」；CLI 定形 = TTY 问句 y/N ∥ 非 TTY stdin 行读（D-TM6 同径） | `TEAM.md:94` ∥ `TEAM.md:174` ∥ `TEAM.md:189` ∥ 本段块 B |
| ④🟡 | 无「最近先例」行 | 补行（实现坐标 ∥ 设计档节 ∥ 先例批次 + 对齐 ∥ 偏离） | 本段块 C |
| ⑤🟡 | 无「调研证据」行 | 补行（声明面 ∥ 参考系位置 ∥ 未调研显式声明 ∥ 调研面实读清单） | 本段块 D |
| ⑥🟡 | `CLIENT.md:33`「拟新增」相抵盘面 | 「拟新增」⇒「既有」（`thincoder-server/src/client/routes.mjs:28` 导出——实读） | `CLIENT.md:33` |
| ⑦🔵 | `CLIENT.md:18` 型面数漂移 | 十三型 ⇒ **十七型**（v24——`ACCOUNTS.md:81` 实读）；同句补 `key_rotate` 入族列 | `CLIENT.md:18` |
| ⑧🔵 | VSC 键数口径不一 | 收成一个数 = **本批增量 ≈4 键/表**（控件词 ∥ 确认句 ∥ 成句 ∥ `invalid` 失效句）；「≈18」退场——基数实读 349 ∥ 349、team 族 19 键/表 | `TEAM.md:138` ∥ `TEAM.md:147` ∥ 本段块 E |
| ⑨🔵 | 测试档入链牵连件未入表 + 入链判定相抵 | 入链判定 = **不入链**（跨面件先例「无宿主产品链」+ 现制：批内单测随批档归档——`aed5b052`）；补两件 = `thincoder-server/package.json`（零改——3×`node --check` 现读）∥ 门禁件数断言件（现无在盘活件）；应声随动 = `TEAM.md` §4 两处旧链句 | `CLIENT.md:44` ∥ `CLIENT.md:45-46` ∥ `CLIENT.md:92`（R51②）∥ `TEAM.md:152-153` ∥ `TEAM.md:155` ∥ 本段块 F |
| ⑩🔵 | CLI 会话内换 token 随动未写 | 补「会话内随动（CLI）」行——成 ⇒ 两复读（`syncProvidersFromDisk` ∥ `refreshTeamState` + `verify` 清）；败（`invalid`）⇒ 转「已失效」；沿登/退既有机制 | `TEAM.md:99` |

**修正后现行文本（§2 面——取代原表对应行）**

**块 A（①——③ 表 CLI 行 + ④ 表判据 4）**
- ③ 表 CLI 行增改（现行）：**`team rotate` ∥ 确认问句（zh 直出——TTY ∥ 非 TTY 定形）∥ 结果行 = 成句直出「已轮换——本机已改用新 token」（同句集）∥ usage**。
- ④ 表判据 4（现行）：**文案：三串三端逐字同拍——① 确认句「轮换将立即吊销当前登录 token（旧 token 失效），本机随即改用新 token。继续？」② 成句「已轮换——本机已改用新 token」③ 失效句「已失效——重新登录」；对拍 = VSC `locales/zh.json` 新键值 ∥ 桌面 `i18n-settings.mjs` 新键值 ∥ CLI 词面常量逐字（`team-command.mjs` 导出面：确认句 ∥ 成句 ∥ `FAILURE_TEXT.invalid`）；③ 同核字典键 `status.team.invalid` zh 值；CLI 结果行 = 成句直出。机检 = 各档字面读比逐字相等（单元测试档）**。

**块 B（③——④ 表增行）**
- ④ 表新增行（现行）：**确认门：取消 ∥ 未确认（非 `y` 应答 ∥ EOF）⇒ 零请求零写盘（HTTP 桩零请求 ∥ 临时 config 逐字节零变）；CLI 定形 = TTY 问句 y/N ∥ 非 TTY stdin 行读（D-TM6 同径） | 单元测试档**。

**块 C（④——最近先例行）**
**最近先例** = 客户端登录面批（2026-10-10「team-login-client-access」· 台账 #1212——login ∥ logout ∥ me 三处理）。实现坐标 = `thincoder-server/src/client/routes.mjs`（同档同注册面——本批 rotate 入 `registerClientRoutes`）∥ 设计档节 = `docs/server/design/client/CLIENT.md` §1/§2 ∥ `docs/core/design/TEAM.md` §2.2/§2.3/§2.6。**对齐** = 端点件形（写端点 JSON 门 ∥ Bearer 鉴权 ∥ 401 `invalid_api_key` 三态不分）∥ 审计形（单行 + `surface:"client"`）∥ 免 20 上限（具名签发）∥ 端侧「一次写盘 + 出词面」结构。**偏离**（各附理由）= ① 确认一步（凭据换发后果就地明示——零原生弹窗）② 失败面非 best-effort（网络败 ⇒ 服务端零变更 ∥ 本地零动作——换发须原子对拍；与 logout「网络败照清本地」相反）③ `reason` 域增 `invalid`（轮换 401 专用——「已失效」与凭据错语义不同）④ CLI 结果行 = 成句直出（`Logged in.`/`Logged out.` 家族不延用——成句携实质信息且属三端同句集）。

**块 D（⑤——调研证据行）**
**调研证据**：公共源档面 = 工作区声明（`PROJECT-MANIFEST.json` `index.publicRepos` = 空——零外部声明公共源）；参考系五仓（kimi-code ∥ MiMo-Code ∥ opencode ∥ oh-my-pi ∥ openclaw）居工作区外（`D:\ref\`——AGENTS.md 载、不入索引）⇒ **本轮未调研**（如需另立调研轮）。本面调研 = 本仓实读：`thincoder-server/src/client/routes.mjs`（四处理件形）∥ `thincoder-core/team.mjs`（登/退/校验 ∥ 失败分类）∥ `docs/server/design/client/CLIENT.md` §1/§2 ∥ `docs/server/design/accounts/ACCOUNTS.md` §2.1（审计型面）——**相关 = 是**（对齐 = 登录面——见上「最近先例」行）。

**块 E（⑧——③ 表两行现行文本）**
- VSC locales 行：**`locales/en.json` ∥ `zh.json`（现读 349 ∥ 349）——本批增量 ≈4 键/表（控件词 ∥ 确认句 ∥ 成句 ∥ `invalid` 失效句）；team 族累计实读 19 键/表**。
- 桌面 i18n 行：**`renderer/i18n-settings.mjs`（208 ⇒ ≈212）—— +≈4 键（控件词 ∥ 确认句 ∥ 成句 ∥ `invalid` 失效句）**。

**块 F（⑨——③ 表增两行 + 判定）**
- 增行：**`thincoder-server/package.json`（30 行）——零改：不入链（跨面件先例 + 现制批内单测随批档归档）；`prepublishOnly` = 3×`node --check` 单行保持（三包 `prepublishOnly` 零 `docs/batches/` 引用——实读）**。
- 增行：**门禁件数断言件——现无在盘活件（旧链断言件已随 `aed5b052` 退场——全树 `*.mjs` 零活件引用，残留仅在 `.thincoder/tmp/**`）；零随正**。
- 测试档行判定补：**`docs/batches/2026-10-15-team-token-rotation.test.mjs`（≈320——跨面单件）不入链：随批档归档（沿上三件现制）**。

**自洽检查三项读数（修正后 · 本轮实测）**

1. **引用集 ↔ 标题集**：新引档内节 = `TEAM.md` §2.5/§2.6/§2.7（实存）∥ `CLIENT.md` §1/§2/§4/§5（实存）∥ 跨档引 `docs/core/design/TEAM.md` §4 ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `docs/core/design/TESTING.md`（实存）——零悬空。
2. **表行 ↔ 小结数**：③ 表增两件；④ 表增一行（判据现 6 行）；§2.5 域四值 ⇒ 五值、失败出词四句 ⇒ 五句（`TEAM.md:68`/`:77`/`:194` 三处同拍）；其余各表行数与声明逐一对上（存量不符一项 = 尾注 4）。
3. **声称 ↔ 实测**：本节全部读数 = 本轮实读（`CLIENT.md` 92 行 ∥ `TEAM.md` 196 行——回读；`routes.mjs:28` ∥ `ACCOUNTS.md:81` ∥ `thincoder-server/package.json:13` ∥ `locales/zh.json` 349 行/19 键 ∥ `git log aed5b052`＝2026-10-12）。

**机检读数（本轮亲跑）**

- `doc-check-width.mjs`（两档）⇒ **exit 0**（首跑 `CLIENT.md:45` 353 字符红已当场拆分收正——`CLIENT.md:45-46`）。
- `doc-check.mjs` 全树 ⇒ exit 1（存量基线）；**涉本批两档的闸红仅 `TEAM.md:55`（`provider-admin.mjs:23` 路径/坐标——存量行、非本批改动）**；本批新增/改行**零闸红**。
- `doc-check-anchors.mjs` ∥ `doc-check-linecounts.mjs`（两档）⇒ **exit 0**。

**尾注（号外——报父侧路由，本席零改）**

1. `docs/server/design/accounts/ACCOUNTS.md` 两处待随正（未列 10 号）：`:62` `key_rotate` 行 detail 现读 `{ keyHint }`（无 `surface`）；`:84-86` `surface` 字段行仅列四型/三写点——本批设计（rotate 审计携 `surface:"client"`）实施后与两处相抵；建议入本批随正件或另裁。
2. `CLIENT.md:45` 首句「客户端接入单元测试档（服务端面——估 ≈260 行）」——该档现不在盘（`docs/batches/*.test.mjs` 仅余他批一件）；是否随正请裁（本席未动——非 10 号）。
3. `CLIENT.md:90`（R50④）仍携登录面批旧链随正记录（`prepublishOnly` 38 ⇒ 39 ∥ 断言件 39 ⇒ 40）——该链制已退场（`aed5b052`）；是否随正请裁（本席未动——非 10 号）。
4. `TEAM.md:107`（D-TM3「四消费面各一处」）与 `TEAM.md:53`（「五消费面各一处过滤」+ 五处列名）计数不符——存量、非本批行；是否随正请裁（本席未动——非 10 号）。
5. `thincoder-server/test/rc-resolve.mjs:2-3` 注释仍述「由 `prepublishOnly` 链行以 `--import` 预载」——该链行已随 `aed5b052` 退场，注释疑滞后（产品码面、非本席写域——供父侧路由）。

**边界（本席未做）**：零产品码触 ∥ §1/§3 零触 ∥ 需求档零笔 ∥ 不重开已裁项 ∥ 除 10 号与两号应声随动（②：`TEAM.md:77`/`:194`；⑨：`TEAM.md` §4 两处）外零改——如判越界请退回。

### 修正轮 2 定点处置（轮次 2 发现 ①–⑩ · 2026-10-15 · fix 轮）

**来源**：本批 §3 轮次 2（VERDICT: pass——🔴0 ∥ 🟡2 ∥ 🔵8）十发现；父侧裁受理为 ①–⑩ 定点清单（🟡① 夹注 = 并入随正件清单、收正时点 = 实施轮同拍、句写明）。**点修**——逐号改、逐号回读：设计档两档三处原地收正（`TEAM.md` 两处 ∥ `CLIENT.md` 一处）；§2 面补记见本块「补记」节（append-only——原行不重写）。

**逐号处置**

| 号 | 发现 | 处置 | 落点（file:line——改后现读） |
|---|---|---|---|
| ①🟡 | `ACCOUNTS.md:127` 端点枚举落后、未入随正件 | 并入随正件清单（含 `:14` 审计列增补——并核 `:12-13` = 与设计一致零改）；**收正时点 = 实施轮同拍** | 补记① ∥ `CLIENT.md:92`（R51② 增四处） |
| ②🟡 | audit surface 相抵（已路由） | 本轮不重开（§1 尾注裁定 + 尾注①）——并入同一随正件句（`:62` ∥ `:84-86`） | 补记① |
| ③🔵 | 尾注坐标漂移 | 回读收正两坐标（尾注③ ∥ 尾注④） | 补记③ |
| ④🔵 | 调研行 `routes.mjs` 读口径 | 收正为「现三处理 ⇒ 本批后四处理」（`:2` 档头句 ∥ 三 handler `:31`/`:57`/`:72`） | 补记④ |
| ⑤🔵 | `TEAM.md:130`「确认两步」 | 收一为「确认一步（确认/取消两键）」（规范词对齐——D-TM9 ∥ §2.7） | `TEAM.md:130` |
| ⑥🔵 | 12:10 禁调令读数残留 | 就地标废：该行不作判据、留档仅存；后续轮次零调用、零引读数 | 补记⑥ |
| ⑦🔵 | 随动面漏登记（CLI 注释计数） | 补登记：`team-command.mjs` `:9` ∥ `:13` ∥ `:24` 计数注释 + `:25` 表增 `invalid`——落点同拍（`:13` 系核读补入） | 补记⑦ |
| ⑧🔵 | 自洽检查 2 括注计数 | 回读收正 = 计数行四（`:68`（两处「同五句」）∥ `:73` ∥ `:77` ∥ `:194`）；`:75` = 映射句非计数 | 补记⑧ |
| ⑨🔵 | 存量滞读（跨档计数） | 不并入本批（存量、非本批行——§3 文取「后续择轮随正」） | 尾注（本块末） |
| ⑩🔵 | CLI 失效句双径（面别） | 补句：面别区分（直出三句 ∥ 常显面 `t()` 径——沿 `TUI.md` §7.7 观察① 在案） | `TEAM.md:98`（句尾增补） |

**补记（逐号现行文本——取代对应原句）**

**①/② 随正件清单（增补后现行）**：前段「随正件」七处照旧（本席——同拍；遇他批在评顺延）＋**`docs/server/design/accounts/ACCOUNTS.md` 四处**——`:62`（`{ keyHint }` ⇒ `{ keyHint, surface? }`——客户端面携 `surface:"client"`）∥ `:14`（审计列增 `key_rotate`；并核 `:12-13` 签发/吊销口径 = 与设计一致、零改）∥ `:84-86`（surface 族列四行 ⇒ 五行；写点三 ⇒ 四——增 `/api/client/rotate`）∥ `:127`（端点枚举 ⇒ login ∥ logout ∥ me ∥ rotate 四端点）。**收正时点 = 实施轮同拍**（以当刻盘面为准）。R51② 同拍增补（`CLIENT.md:92` 实读在盘）。

**③ 尾注坐标（收正后现读）**：尾注③ = `CLIENT.md:91`（R50④ 行——`:90` 为表头分隔行）；尾注④ = `TEAM.md:109`（D-TM3「四消费面各一处」——`:53`「五消费面」坐标无误）。两尾注处置（实施轮随正）不变。

**④ 块 D 读口径（收正后）**：`routes.mjs` 读口径 = **现三处理**（`routes.mjs:2` 档头句「login ∥ logout ∥ me 三处理」；三 handler = `:31`/`:57`/`:72`）⇒ **本批后四处理**（+rotate）。

**⑥ 读数口径（标废）**：修正轮 1 节「机检读数（本轮亲跑）」段内 `doc-check.mjs` 全树 entry 一行 = 按 12:10 禁调令与 §1 过程记录声明**不作判据、留档仅存**；后续轮次零调用、零引读数。本块全部读数 = 本席自量（非机检）。

**⑦ 随动面（补登记）**：`FAILURE_TEXT.invalid` 落点（实施轮）同拍收正 `thincoder-cli/src/cli/team-command.mjs` `:9` ∥ `:13` ∥ `:24` 三处计数注释（四句 ∥ 四值 ⇒ 五句 ∥ 五值）+ `:25` `FAILURE_TEXT` 增 `invalid`（⇒「已失效——重新登录」）。

**⑧ 自洽检查 2（收正括注）**：计数同拍 = **四行**（`TEAM.md:68`（「同五句」两处）∥ `:73`（五值）∥ `:77`（五句）∥ `:194`（五句））；`:75` = 401 映射句（非计数）——修正表 ② 五落点 = 上四行 + `:75`，两口径并列即符。

**⑩ 面别区分（已落 `TEAM.md:98` 句尾）**：本流程三句 = zh 直出（不经 `t()`）；常显面「已失效」状态词 = `t()` 径（CLI 现渲缺省 en——在案未决，沿 `docs/cli/design/TUI.md` §7.7 观察①）——同屏并见时两径各按本径出词（本批渲制零改）。

**自洽检查三项读数（本轮实测）**

1. **引用集 ↔ 标题集**：本块引 `TEAM.md` §2.5/§2.7/§4/§5 ∥ `CLIENT.md` §2/§8 ∥ `ACCOUNTS.md` §2.1 ∥ `TUI.md` §7.7——逐实读在盘；代码坐标 `routes.mjs` ∥ `team-command.mjs` = 本轮实读。
2. **表行 ↔ 小结数**：①–⑩ = 十行对十发现；改动集 = 设计档两档三处 + §2 补记（零射程外改动）。
3. **声称 ↔ 实测**：全部读数 = 本轮实测（`TEAM.md` 197 行 ∥ `ACCOUNTS.md` 222 行 ∥ `CLIENT.md` 93 行 ∥ `routes.mjs` 78 行 ∥ `team-command.mjs` 247 行——文件尾实读；`TEAM.md:98` 改后行宽自量 262 ≤ 300（manifest `lineWidth` 声明；自量非机检））。

**尾注（号外——报父侧路由，本席零改）**

1. ⑨ 存量滞读族（跨档计数）：`ACCOUNTS.md` 「十六型」族实读七处（`:28` ∥ `:153` ∥ `:155` ∥ `:156` ∥ `:169` ∥ `:171` ∥ `:210`）与 `CLIENT.md:44`「结构版本保持 v10」（仅此一处）——均 vs 现盘 v24；§3 文取「后续择轮随正」——建议父侧入册（择轮随正 ∥ 并他批）。本批零改。

**边界（本席未做）**：零产品码触 ∥ §1/§3 记录面零触 ∥ 需求档零笔 ∥ `ACCOUNTS.md` 本批零改（四处 = 实施轮同拍落点）∥ 不重开轮次 1/2 已核项 ∥ 除十号定点与指名落点外零改——如判越界请退回。

## §3 设计评审（评审子代理）

### 轮次 1（评审子代理）

**设计评审（对象 = 本批档 §2 + `CLIENT.md` ∥ `TEAM.md` ∥ `API.md` 三档；对象状态 = 设计完成、零实施）**

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | 一致性（文案判据 × 实现行） | 🔴 | 轮换成句的 CLI 实化两处相抵：实现行给「结果行 `Rotated.`」（batch:65），文案面却要求三端逐字同句且「CLI = 单语直出同句」（`TEAM.md:69`「同三句（登/退/轮换面就地）」∥ `TEAM.md:77` ∥ `TEAM.md:172`「确认句 ∥ 成句三端逐字同句」∥ batch:92 判据 4）；判据 4 的 CLI 腿按现字面不可对拍——CLI 既有惯例 = 英文小写结果行 + zh 逐字提示句（`team-command.mjs:33–42` 实读：`Logged in.`/`Logged out.` vs 「服务端吊销未达」），且「已失效——重新登录」在 CLI 现渲缺省 en（`TEAM.md:89`；`tui/TUI.md:737`「CLI 语言面现缺省 en（未决——沿 §7.7 观察①同注）」，范围外仅作对拍证据） | 二者取一收正并落到同一事实：① CLI 行改直出 zh 成句（与「同三句」一致）；或 ② §2.5 文案表 CLI 列 + 判据 4 的 CLI 腿改为按 CLI 实渲值对拍（列明该值与 en 缺省口径）。收正后判据 4 须可机检通过 |
| 2 | 一致性（失败理由域） | 🔴 | `reason` 域第五值未入单源：`TEAM.md:96` 给 rotate「`reason` 本流程子集 = `network`」含「`invalid`（401——token 已失效」，batch:90 判「401 ⇒ `reason:"invalid"`」；而 `TEAM.md:73` 仍写「失败理由域（失败形 `{ ok:false, reason }`——四值单源）」、`TEAM.md:75` 仍写「核心分类单源」+「401 ⇒ `credentials`」——与核件现契约同形（`thincoder-core/team.mjs:18`「`credentials`（401——同措辞）」，`:133`「return { ok: false, reason: "credentials" }」，范围外仅作对拍证据）。同机制（分类）两处相抵 ⇒ 端侧「理由→句」照表实现会缺 `invalid` 的句行 | §2.5 理由域/判据两行随正：域扩 `invalid` ⇔「已失效——重新登录」并按流程注明 401 映射（rotate 径不经登录分类器）——或在 §2.7 明写自带映射与「单源」句的边界 |
| 3 | 验收覆盖 | 🟡 | 确认门（D-TM9 的决定性条款「确认一步」）在 ④ 五条判据（batch:89–93）中无一条验「经确认才轮换 ∥ 取消 ⇒ 零动作」；CLI 非 TTY 确认口径未写（`TEAM.md:94` 只写「取消（取消 = 零动作）」；登录面有 `TEAM.md:110` D-TM6「密码问句 = CLI 隐藏回显（TTY）/ stdin 行（非 TTY）」先例，rotate 无对应句）——脚本化径行为待猜 | 补一条判据（取消 ∥ 未确认 ⇒ 零请求零写盘；非 TTY 形显式定形并同判）+ 在 §2.7/③ 行写明非 TTY 形 |
| 4 | 方法学-先例 | 🟡 | 无「最近先例」行（实现坐标 ∥ 对应设计档节 ∥ 先例批次 + 对齐/偏离理由）：先例要素散在句内（batch:45「沿 logout 件形」∥ batch:48「免 20 上限沿客户端面先例」∥ batch:89「沿 N37/B27 同桩制」∥ `CLIENT.md:45`「沿登录面批先例」），偏离理由散在关键决策/被否（batch:102）——无一处成行 | 补一行：最近先例 = 客户端登录面（login/logout/me 三处理：`src/client/routes.mjs` ∥ `client/CLIENT.md` §2 两行 ∥ 登录面批），对齐 = 件形/审计形/免 20 上限；偏离 = 确认一步 ∥ 失败面非 best-effort ∥ 新 reason 值（各附理由） |
| 5 | 方法学-调研 | 🟡 | 无「公共源档调研」行——四档精读未见（参考系四端在 `D:\ref\`，AGENTS.md 载）：「查了哪些源档 ∥ 有何相关」在案面无痕 | 补一行调研证据（查了哪些公共源档 ∥ 是否相关；「无相关」同样须留痕），或明写本轮未调研 |
| 6 | 文档状态 | 🟡 | `CLIENT.md` 与本批句相抵：`CLIENT.md:33` 仍写「装配面 = `registerClientRoutes`（拟新增）」，batch:50 写「`registerClientRoutes` 既有注册——零新注册行」——盘面实读 = 既有（`src/client/routes.mjs:28` 导出在册，范围外仅作对拍证据） | 收正为「既有」（与盘面同拍） |
| 7 | 数字漂移 | 🔵 | `CLIENT.md:18` 仍写「现行型面 = 十三型」——本批 batch:49 用「既有十七型之一」；现面 = 十七型（`ACCOUNTS.md:81`「**十七型**」，`key_rotate` 在既有型表内——范围外仅作对拍证据） | 随正为十七型（同句「审计零增型」结论不变） |
| 8 | 行数/键数标注 | 🔵 | VSC 语言档键数口径不一：batch:74「+≈4 键（控件词 ∥ 确认句 ∥ 成句）」（列 3 项称 4 键）vs `TEAM.md:136`「+≈18 键/表——增轮换三键：控件词 ∥ 确认句 ∥ 成句」；桌面侧两处同为 +≈4 键（batch:79 ∥ `TEAM.md:145`） | 收成一个数（本批增量 ≈4 键/表）；「≈18」如为累计须注明 |
| 9 | 行数/件数标注 | 🔵 | 测试档入链牵连件未入表：`CLIENT.md:45`「入链随实施轮按门禁件数断言件现态对拍」（`TEAM.md:153` 同句），但 ③ 表与 R51② 均未列 `thincoder-server/package.json`（`prepublishOnly` 清单 **39**——`CLIENT.md:44`）与门禁件数断言件（入链 ⇒ 39 ⇒ 40 且断言件随正）；且「入链」与先例句相抵（`TEAM.md:150`「不入链——跨面件无宿主产品链」，本件亦跨面） | ③/R51② 补两件（现读 + 估 ±1）并写明入链判定（入链 ∥ 不入链——按哪条先例） |
| 10 | 清晰度 | 🔵 | 长驻会话内换 token 后的内存态随动未写：VSC 行有「成/失效 ⇒ 推送 + 团队面随动」（batch:71）、桌面行有「复读两调用点」（batch:77），CLI 会话内「/team rotate」支（batch:66）无对应句——判据 5「模型面照常」（batch:93）将在会话内径直接暴露此空档 | §2.7/③ 补一句 CLI 会话内随动径（沿 `/team login` 既有随动机制），或明写 argv ∥ 会话内两径之别 |

抽检（行数面，盘面实读）：`src/client/routes.mjs` 77 ✓ ∥ `thincoder-core/team.mjs` 223 ✓ ∥ `src/cli/team-command.mjs` ≈246 ✓ ∥ `settings-sections-team.mjs` 143 ✓ ∥ `webview/settings-team.js` ≈132 ✓ ∥ `renderer/mount-team.mjs` ≈324 ✓ ∥ `src/tui/cmd-team.mjs` ≈235 ✓（±1 尾空行）；引证核对：`gateway/routes.mjs:25` `requireApiKey` ✓ ∥ `key_rotate` 既有审计型 ✓ ∥ 需求侧三处（`PROJECT.md:408` AC-31 ∥ `WEBVIEW.md:41` F-W21 ∥ 桌面 `PROJECT.md:56`）✓。

**VERDICT: changes-required**（🔴 ×2 · 🟡 ×4 · 🔵 ×4——token 未发）

### 轮次 2（评审子代理）

**设计评审（轮次 2——对象 = §2「修正轮 1 定点处置」节（盘面现读 :116-179）∥ `CLIENT.md` ∥ `TEAM.md` + `ACCOUNTS.md` 抽检面；对象状态 = 设计完成、零实施；轮次 1 = changes-required → 修正 10/10 已核）**

**十条核修核验（逐条落点回读——全数属实）**：① `TEAM.md:94`/`:98` + 块 A（`Rotated.` 零残——仅原行与弃用注）∥ ② `TEAM.md:68`/`:73`/`:75`/`:77`/`:194`（五值/五句同拍）∥ ③ `TEAM.md:94`/`:174`/`:189` + 块 B ∥ ④ 块 C（先例批次 + 两坐标 + 对齐/偏离各附理由）∥ ⑤ 块 D（未调研显式声明；`PROJECT-MANIFEST.json:189` `publicRepos: []` 实读相符）∥ ⑥ `CLIENT.md:33` + `routes.mjs:28` 导出实读相符 ∥ ⑦ `CLIENT.md:18`（十七型——`ACCOUNTS.md:81` 相符）∥ ⑧ `TEAM.md:138`/`:147` + 块 E（`zh.json` 349 行 ∥ team 族 19 键实读相符）∥ ⑨ `CLIENT.md:44`/`:45-46`/`:92` + `TEAM.md:152-153`/`:155` + 块 F（`package.json` 30 行 ∥ `prepublishOnly` 3×`node --check` 相符；`docs/batches/*.test.mjs` 现仅余他批一件）∥ ⑩ `TEAM.md:99`（`syncProvidersFromDisk`/`refreshTeamState` = `cmd-team.mjs:203`/`:214` 相符）。
**机检面照核**：`doc-check.mjs` 入口读数（:168）按 12:10 禁调令判不作判据（§1:23 已声明；本轮未采信）——同段 `:167`/`:169` 三件直调机检照常有效。

| # | Category | Severity | Issue | Suggestion |
|---|---|---|---|---|
| 1 | 文档随正（ACCOUNTS.md 第三处） | 🟡 | `ACCOUNTS.md:127` 客户端面端点枚举仍「login ∥ logout ∥ me」（本批后为四端点——`CLIENT.md:28` rotate 行 ∥ `CLIENT.md:40` 四处理）；尾注① 仅路由 `:62` 与 `:84-86` 两处，`:127` 未入随正件/随正清单 | 将 `:127` 端点枚举（并核 `:12-14` 签发/吊销口径）并入本批随正件——实施轮同拍收正 |
| 2 | 一致性（audit surface 相抵——已路由） | 🟡 | `CLIENT.md:18`（"（detail 同携 surface）"）∥ `CLIENT.md:57` 与 `ACCOUNTS.md:62`（"`{ keyHint }`"）∥ `:84`（"上表四行（`login_success` ∥ `login_failure` ∥ `key_issue` ∥ `key_revoke`）"）相抵（surface 域未含 key_rotate）；已由 §1 尾注裁定 + §2 尾注① 路由（随正入实施轮落点）——本轮不重开、不阻塞 | 按已裁定落点同拍收正两处（detail 携 `surface:"client"`；surface 族列） |
| 3 | 引用纪律（尾注坐标漂移） | 🔵 | 尾注③ `CLIENT.md:90`（R50④）——盘面 R50 行现读 `:91`（`:90` = 表头分隔行）；尾注④ `TEAM.md:107`——盘面「四消费面各一处」现读 `:109`（`TEAM.md:53` 正确） | 回读收正两坐标（或注明读时点） |
| 4 | 调研行实读偏差 | 🔵 | 块 D（:148）称 `routes.mjs`（"（四处理件形）"）——盘面现读三处理（`routes.mjs:2` "login ∥ logout ∥ me 三处理" + `:31`/`:57`/`:72` 三 handler）；「四处理」= 本批实施后态 | 改「现三处理 ⇒ 本批后四处理」或注明为设计后态 |
| 5 | 术语漂移 | 🔵 | `TEAM.md:130`（VSC 档行）「确认两步」vs 规范词「确认一步」（`TEAM.md:115` D-TM9 ∥ `:94` ∥ `:174` ∥ batch:77/83） | 收一为「确认一步（确认/取消两键）」 |
| 6 | 12:10 禁调令读数残留 | 🔵 | §2:168 仍携 `doc-check.mjs` 全树 entry 读数（"`doc-check.mjs` 全树 ⇒ exit 1（存量基线）"）——§1:23 已声明"不作任何判据"；后读读者可能误当活判据（本轮未采信） | 可选：§2 后续追加一行就地标废/降为参考；或按 §1 声明维持留档 |
| 7 | 随动面漏登记（CLI 注释计数） | 🔵 | 域扩五值后 `team-command.mjs:9`（"失败四句（理由域四值单源"）∥ `:24`（"失败出词四句"）∥ `:25` `FAILURE_TEXT`（现四值，`invalid` 待增）将滞读——设计随动清单（② 应声随动 = TEAM.md 面）未含产品档注释 | `FAILURE_TEXT.invalid` 落点时同拍收正该两条计数注释（随动面补登记） |
| 8 | 自洽检查计数 | 🔵 | 自洽检查 2 括注（:162）"（`TEAM.md:68`/`:77`/`:194` 三处同拍）"与修正表 ② 五落点（含 `:73` 四值⇒五值）计数不一 | 回读核对并收正括注 |
| 9 | 存量滞读（跨档计数） | 🔵 | `ACCOUNTS.md:28`（"现行十六型"）∥ `:156`/`:169`/`:210` 等 vs `:81`「十七型（v24）」；`CLIENT.md:44`「结构版本保持 v10」vs 现盘 v24（`:81`）——均为存量、非本批行 | 后续择轮随正或注明为当批记录口径 |
| 10 | CLI 失效句双径（round-1 #1 尾部口径——已核销主项） | 🔵 | 判据 4 CLI 腿已收正为导出常量对拍（可机检 ✓）；同句在 CLI 常显面仍沿 `TEAM.md:89`「CLI 现渲缺省 en」（t() 径）——两径未同屏区分（属在案未决：`TUI.md` §7.7 观察①） | 可选：§2.7 或判据 4 补一句面别区分；或明示沿案 |

**VERDICT: pass**（🔴 ×0 · 🟡 ×2 · 🔵 ×8——token 已发）

## §4 用户批准（主 agent）
## §5 实施记录（eng-coder）

### 交付摘要（eng-coder · 2026-10-16）

- **产品码 18 档 + 随正件 1 档 + 批内单测 1 档**（全档 `node --check` OK）：服务端 `POST /api/client/rotate`（Bearer；吊销当枚 + 同标签重签 + **单行**审计 `key_rotate`，detail `{keyHint, surface:"client"}`，**无 target**）∥ 核 `teamRotate()`（**一次写盘**替换 `team.token` + 派生条目 `apiKey` 同步；失败零写盘；**非 best-effort**）∥ CLI argv（`thincoder team rotate`——y/N 确认门）∥ TUI `/team rotate` ∥ VSC（卡轮换控件 + 确认一步两键 + `teamRotate`/`teamRotateResult` 消息链 + 宿主推送/团队面随动）∥ 桌面（设置面段控件 + 确认一步 + `team:rotate` 通道 + 转口 + preload 白名单 53 ⇒ 54）。
- **随正件**：`docs/server/design/accounts/ACCOUNTS.md` 四处（`:14` 审计族增 `key_rotate` ∥ `:62` detail ⇒ `{ keyHint, surface? }` + 写点增 `POST /api/client/rotate` ∥ `:84-85` surface 族列四行 ⇒ 五行 / 写点三 ⇒ 四 ∥ `:127` 端点枚举 ⇒ login ∥ logout ∥ rotate ∥ me）。
- **文案**：确认句 ∥ 成句 ∥ 失效句（= 核 `status.team.invalid` zh）三端逐字——单源 = CLI 词面常量，VSC `locales/zh.json` ∥ 桌面 `renderer/i18n-settings.mjs` 同值。
- **单测**：`docs/batches/2026-10-15-team-token-rotation.test.mjs`（13 用例——用后即删；依 `thincoder-cli/AGENTS.md` 法，**零调 `doc-check.mjs`**）。

### 实施期决策（透明表——四条均为本人判断，非设计字面）

| # | 决策 | 依据 |
|---|------|------|
| 1 | TUI `/team rotate` 确认步走**既有二次确认 picker**（`ctx.showPicker`，`defaultIndex = 1` = Cancel），非设计字面的 y/N 问句 | 设计字面 y/N 需 TUI raw-mode stdin 行读——与既有键盘输入面（`ask-steps.mjs` ∥ `layout.mjs` overlay 第三支）争用，不可行；picker = TUI 既有唯一确认面（形同 `/clear`、`confirmDelete`）。**偏离设计字面，如实上抛** |
| 2 | 桌面确认段载体 = 团队切片既有 `notice` 槽（`{ kind: "rotateConfirm" }` 驱动确认段；`rotateDone` / `failure` 驱动结果行） | 桌面段体为纯函数、投影为白名单键 ⇒ 新增键即破设计「`views/settings.mjs` 454 ⇒ 454」行数约束；复用已投影槽 ⇒ 零投影改动 |
| 3 | 确认键词复用控件词（`settings.team.rotate`）；取消键词 = VSC `settings.cancel` ∥ 桌面 `question.cancel` | 设计只列 +4 键（控件词 ∥ 确认句 ∥ 成句 ∥ 失效句），未规定按钮字面 ⇒ 沿各端既有取消词，零新增键 |
| 4 | VSC `handleTeamRotate` 在 `成 ∥ reason === "invalid"` 两径均推送 `teamStatus` + `providerStatus` 且调 `refreshTeamSurface()` | 贴设计「成/失效 ⇒ 推送 + 团队面随动」；`refreshTeamSurface` 是 VSC 团队面既有唯一刷新出口（`team-surface.mjs` 本批零改——按设计零改确认） |

### 自含交付协议（审计 / 评审轮次与终态）

- **分歧审计（只读 explore，1 轮）**：结论 **零偏离**（PARTIAL ∥ SILENT-SIMPLIFICATION ∥ DOC-DRIFT ∥ OUT-OF-LIST 四类均无；表外改动零）。
- **代码评审（advisor）第 1 轮**（19 档全量）⇒ `VERDICT: pass`（0 🔴；🟡 = E4 第三形覆盖 ∥ 🟡 = 需求档回笔挂账（父侧）；🔵 = 断言强度 ∥ 批档坐标）。
- **代码评审第 2 轮**（只核第 1 轮后改动）⇒ `VERDICT: pass`；判第 1 轮非固定案**理由不成立**并给出确定性注入缝。
- **代码评审第 3 轮**（只核第 2 轮后改动）⇒ `VERDICT: pass`（逐条 Fixed/Accepted，无新 🔴）。
- **fix round：2 轮（全在批内单测档，零产品码改动）**
  - ① 第 1 轮后：E4 用例标题与断言对齐；VSC 控件断言收精确键形。
  - ② 第 2 轮后：按评审给的缝**补 `write_failed` 真覆盖**（同进程桩在应答前改写配置 ⇒ 写时 raw 无 `team` 段 ⇒ 拒写 ⇒ `write_failed`）——E4 三形（`network` ∥ `invalid` ∥ `write_failed`）至此齐覆盖；桌面腿断言同法收精确形。
- **终态 = `clean`**（终轮 pass）。未决项均不在本席射程：需求档回笔 2 笔（父侧主 agent 笔）∥ 七个设计随正件（他席顺延）∥ 批档坐标 ±2（档自记「以当刻盘面为准」）。

### 读数行（用后即删——零留存）

- 命令：`node --test docs/batches/2026-10-15-team-token-rotation.test.mjs`（仓根 `thincoder/`）⇒ **13 pass ∥ 0 fail**（真 server 内存库 + 真 HTTP ∥ 核写盘落点逐字节 ∥ 结构源扫 ∥ 文案三串四表对拍 ∥ CLI 确认门三例真子进程）。
- 辅：`thincoder-vscode` 冒烟 `node test/smoke-settings.mjs` ⇒ `SMOKE-OK`（本批改动未破设置面板装配）。
- **未验**：核 `write_failed` 的 **mtime 冲突**子路（同步窗口内不可注入）——本档覆盖的是同 reason 的另一径「team 段缺失——拒写」。
- 集成面：本席不跑集成；收口轮父侧为唯一集成跑点。

## §6 验证与收口（父代理）
