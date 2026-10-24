# 团队客户端（TEAM）· 登录与接入

> 板块归属 = **核心统一**（阶段二「一个核 + 两个薄壳」延伸——团队客户端面：三端共用机制）；本档 = 该机制设计档。
> 需求单源 = `docs/server/requirements/PROJECT.md` §2:31 + AC-31。
> 服务面单源 = `docs/server/design/client/CLIENT.md`（端点 ∥ token 机制——本档不复制）；配置系统 = `docs/core/design/CONFIG.md`（`team` 段指针 = §6.4）；渠道与模型 = `docs/core/design/PROVIDER.md`（派生条目 = §6.25）。

## 1. 定位与边界

- **承载**：端侧团队登录机制——登录 ∥ 退出 ∥ 轮换 ∥ 登录态读面（三端共用逻辑）；派生 provider 条目（登录写入 / 退出停用 / 轮换同步）；端标签生成；登录/退出/轮换对 `~/.thincoder/config.json` 的写面。
- **核模块**：`thincoder-core/team.mjs`（三端共用单源：CLI ∥ VSC ∥ 桌面同 import）。
- **不承载**：服务端逻辑（= `client/CLIENT.md`）∥ 团队功能面本身（台账 ∥ 记忆 ∥ 在场 ∥ 会话——后续批）∥ 提供者传输/模型解析（= `PROVIDER.md`）。
- **纪律**：明文密码零落盘（请求内存即弃）∥ 本机面不夺能力（未登录 ⇒ 本机功能照常）∥ 无离线缓存（需求 §3）。

## 2. 机制面

### 2.1 配置形（`~/.thincoder/config.json`）

**`team` 段（顶层——登录态单源）**：

| 键 | 形 | 语义 |
|---|---|---|
| `team.server` | 字符串 ∥ null | 服务地址（归一形——去尾斜杠；缺协议补 `http://`） |
| `team.member` | `{ username, name }` ∥ null | 上次登录身份快照（显示面 ∥ 表单预填） |
| `team.label` | 字符串 ∥ null | 本机本端 token 标签（如 `CLI@台式机`） |
| `team.token` | 字符串 ∥ null | **登录 token——在场 ⇔ 已登录**（权威源） |

**派生 provider 条目（`providers[]` 内——固定名 `team`）**：形 = `{ name:"team", baseURL:"<server>/v1", apiKey:"<token>", derived:true }`——「标记为派生」= `derived: true` 字段；`apiKey` = `team.token` 的派生镜像（同一次写盘落）；**条目恒在**（首次登录后——退出不删，摘 `apiKey`）；**不删标记**（口径②）。

- **单写者**：仅登录/退出流程写 `team` 段与派生条目（`writeConfigAtomic` 一次 mutate——核既有写盘执行体；端侧零自写盘，三端同源）。
- **加载归一**：`loadConfig` 归一 `team` 段（形不符 ⇒ null——软失败不阻启动；沿 `proxy` 段先例）。
- **登录态判据**：`loggedIn` ⇔ `team.token`（trim 非空）。**= 团队功能开关**（后续各面消费本判据——口径④）。
- **`team` 段不入 `DEFAULTS`**（沿 `providers` / `proxy` 先例）：不进入 settings 工具的已知键面（**未知键原样通过**——agent 可写、零类型校验；工具不主动写 `team` 段；`thincoder-core/agent-tools/settings.mjs:144`）；`team.token` 若经读面到达 = 敏感段词表天然遮罩（`thincoder-core/agent-tools/settings.mjs:22`）。

### 2.2 登录流程（三端同构）

1. 收集：服务器地址 + 用户名 + 密码（+ 本端标签自动生成 = `端名@主机名`——`node:os` `hostname()`；总长 ≤40 裁剪）。
2. 请求：`POST <server>/api/client/login`（形 = `client/CLIENT.md` §2）。
3. 成 ⇒ 一次写盘：`team` 段（server/member/label/token）+ 派生条目 upsert（按名 `team` + `derived` 定位——有则更新，无则**追加 `providers[]` 表尾**——不劫持既有回退序）。
4. 败 ⇒ 分类出词（网络不可达 ∥ 凭据错 ∥ 锁定期 ∥ 本机配置写入失败）——零写盘。

**同名手工条目冲突**（口径②）：`providers[]` 内已有非派生 `team` 条目 ⇒ 登录仍成（数据面可用），但**不写派生条目**；**返回形** = `{ ok: true, notice: "manual-name-conflict" }`（**码不携文**——`notice` 仅本冲突时在场；提示文本 = 端侧 i18n）。
  端侧收 `notice` ⇒ **登录当刻就地提示**「已存在同名 provider「team」——未自动添加；请改名或删除后重登」（三端逐字同句——§2.5）；**不覆盖、不弹窗、不阻断**。

### 2.3 退出流程

1. `POST <server>/api/client/logout`（携 token——best-effort：网络不可达 ⇒ 仍清本地）；**返回形** = `{ ok: true, revokeDelivered: boolean }`——缺席 = true（服务端吊销已送达）；`false` ⇒ **退出当刻就地提示**「服务端吊销未达」（三端逐字同句——§2.5）。
2. 一次写盘：`team.token` 摘除（server/member/label 留存——表单预填 ∥ 当前态显示）；派生条目停用 = **摘 `apiKey`**（条目与 `derived` 标记保留——重登自动恢复）。
3. 团队面关闭 = `loggedIn` 归假（后续面随动）；派生条目不可用（无 key ⇒ 运行时解析天然跳过——持 key 判据单源 = `docs/core/design/PROVIDER.md` §6.22）。

### 2.4 派生条目的可见性（停用/隐藏）

- **可用性**：派生条目无 `apiKey` ⇒ 不参与运行时解析（`hasKey` 既有判据——零新代码）；不触发「渠道无效」类提示（回退序跳过）。
- **列表可见性**：`derived === true` ∧ 无 key ⇒ 从 provider 列表/模型候选面隐藏（**五消费面各一处过滤**：
  CLI 模型候选（`thincoder-cli/src/tui/model-picker.mjs:115/:271`） ∥ **CLI `/config` provider 列表（`thincoder-cli/src/tui/cmd-config-menus.mjs:204/:214`）** ∥ CLI provider-admin（`thincoder-cli/src/tui/provider-admin.mjs`） ∥ VSC `providerStatus`（`thincoder-vscode/src/extension/settings.mjs`）∥
  桌面 `providerList`（`thincoder-desktop/src/main/providers.mjs`）；**共单源** = `isDerivedProviderHidden`（`provider-admin.mjs:23`）——与 `docs/core/design/PROVIDER.md` §6.25 同拍）；**登录态下在场**（正常参与，key 掩码显示）。
- **不自动改**：不写 `defaultModel` ∥ 不切换当前会话模型 ∥ 不动既有手工条目（登录唯一副作用 = §2.2 两处写）。

### 2.5 三端同构面（能力与文案）

| 面 | CLI | VSC | 桌面 |
|---|---|---|---|
| 入口（登/退） | `thincoder team`（argv——login/logout/status；词面 = `docs/cli/design/CLI-ENTRY.md` §2）∥ 首启向导两路 ∥ 会话内 `/team` 命令族 | 首启板两路 ∥ 状态栏团队 item（点击 ⇒ 登/退流）∥ 命令面板 `thincoder.team` | 首启向导两路 ∥ 状态栏团队段（点击 ⇒ 就地登/退面板） |
| 字段 | 服务器地址 ∥ 用户名 ∥ 密码（地址/用户名可旗标注入；密码 = 隐藏回显（TTY）/ stdin 行（非 TTY）；TUI 内 = 掩码回显） | 同三字段（密码 `type=password`） | 同三字段 |
| 登录动作 | `team login` ∥ `/team login` ∥ 向导「登录团队服务器」卡 | 首启板团队卡 ∥ item 点击流 | 向导团队卡 ∥ 状态段面板 |
| 退出动作 | `team logout` ∥ `/team logout` | item 点击流「退出登录」 | 面板「退出登录」钮 |
| 当前态 | `team status` ∥ `/team status`（活校验附） | item tooltip ∥ 卡内状态行 | 段悬停 ∥ 面板详情 ∥ 卡内状态行 |
| 未登录提示 | 「未登录——登录后可用」+ 指引进登录 | 同句 | 同句 |
| 失败出词 | 网络不可达——请检查地址与端口 ∥ 用户名或密码错误 ∥ 登录尝试过于频繁 ∥ 本机配置写入失败 ∥ 已失效——重新登录（`invalid`——轮换 401 专用） | 同五句 | 同五句 |
| 一次性提示 | 同名冲突（登录当刻）：「已存在同名 provider「team」——未自动添加；请改名或删除后重登」；吊销未达（退出当刻）：「服务端吊销未达」；**轮换（确认 + 成句——§2.7）**：确认句「轮换将立即吊销当前登录 token（旧 token 失效），本机随即改用新 token。继续？」+ 成句「已轮换——本机已改用新 token」 | 同三句（登/退/轮换面就地） | 同三句（登/退/轮换面就地） |
| 常显面 | 状态行状态段簇尾：已登录 ⇒ ` │ <成员>@<主机>`（主机 = `URL.host`）；未登录 ⇒ **零注入**（逐字节等价负控）；已失效 ⇒ 段转「已失效——重新登录」警示色 | 状态栏 item：已登录 ⇒ 成员名（tooltip = 服务器 + 端标签）；未登录 ⇒ 入口「登录团队服务器」；已失效 ⇒ 警示色「已失效——重新登录」 | 状态栏段：已登录 ⇒ 成员名（悬停 = 服务器）；未登录 ⇒ 入口段「登录团队服务器」；已失效 ⇒ 警示色「已失效——重新登录」 |
| 设置面（管理） | 无设置卡（argv ∥ 命令族即管理面——族内 `team rotate` 子命令） | 「团队」卡 = 管理面：端标签 ∥ 详情（server ∥ member ∥ label）∥ **「轮换」控件**（已登录在场——确认一步 + 结果行；team-token-rotation 批）；**零登/退控件** | 「团队」段 = 管理面：同左形 |
| 登录成拍候选面刷新 | 成 ⇒ `syncProvidersFromDisk`（`agent.providers` 即时换盘面；picker 开面活读该数组） | 成 ⇒ `panel._pushSettings()`（`fullStatus` 产 `models` 载荷——模型菜单当刻含 team 渠） | 成 ⇒ `onProvidersChanged`（`composer.refreshCandidates()`——全渠重取 `model:catalog`） |

**失败理由域（失败形 `{ ok:false, reason }`——五值单源）**：`network` ⇔「网络不可达——请检查地址与端口」∥ `credentials` ⇔「用户名或密码错误」（登录 401）∥ `rate_limited` ⇔「登录尝试过于频繁」∥ `write_failed`（本机配置写入失败）⇔「本机配置写入失败」∥ `invalid` ⇔「已失效——重新登录」（轮换 401——旧 token 已失效；§2.7）。

**`reason` 判据（核心分类单源）**：不可达 ∥ 其余状态 ⇒ `network` ∥ 401 ⇒ 登录流程 `credentials` ∥ 轮换流程 `invalid`（按流程对位——轮换径不经登录分类器）∥ 429 ⇒ `rate_limited` ∥ 本机配置写入失败 ⇒ `write_failed`（逐值对位；端侧只做「理由→句」映射，不自创分类）。

**文案同构判据**：「未登录提示」∥「失败出词」（五句）∥ 三条**一次性提示**（同名冲突 ∥ 吊销未达 ∥ 轮换确认句 + 成句——§2.7）三端**逐字同句**（VSC/桌面 = zh i18n 键值逐字相等；CLI = 单语直出同句）；**读面零提示字段**——CLI `team status` ∥ VSC `teamStatus` ∥ 桌面 `team:status` 不带提示字段（三提示 = 一次性事件——登录/退出/轮换当刻就地显示，不随状态复显）。

### 2.6 登录态校验与吊销感知（`teamVerify`）

**动机**：token 被服务端吊销（控制台 key 页吊销 ∥ 其他路径）后，本地 `team.token` 仍在场 ⇒ 三端照显「已登录」（三端均校验）。

- **核件**：`teamVerify()`（`thincoder-core/team.mjs` 新增）——`GET <server>/api/client/me`（Bearer = `team.token`；端点单源 = `docs/server/design/client/CLIENT.md` §2）；
  返回**三值闭集**：`{ state: "valid" }`（200）∥ `{ state: "invalid" }`（401——token 被吊销 ∥ 无效）∥ `{ state: "unreachable" }`（网络不可达 ∥ 其他非 401 失败）。**只读**——零写盘、零状态（调用面持结果）。
- **触发点制**（不设周期轮询——零新定时器）：① 启动一次（`team.token` 在场时）；② 登/退面开合时（桌面面板开 ∥ VSC item 点击流起手）；③ CLI `/team status` 活校验。
- **态模型**：`loggedIn`（本地判据——§2.1）× `verify` 四值（`null` 未验 ∥ `valid` ∥ `invalid` ∥ `unreachable`）。显示三态（**判序写死**）：**未登录**（`loggedIn` 假——**首判**；`verify` 值不参与渲染）∥ **已登录**（`loggedIn` 真 ∧ `verify ≠ invalid`）∥ **已失效**（`loggedIn` 真 ∧ `verify === invalid`——token 在场被吊销）。
  `unreachable` ∥ `null` ⇒ 按已登录显示（**离线容忍——不假报失效**；401 单判）。
  **`verify` 清位**（与首判同拍——不变式 = token 缺席 ⇒ `verify` 不存续）：logout 落盘（token 摘除）⇒ 即清 ∥ 状态复读（`team:status` ∥ `/team status` ∥ item 读）见 token 缺席 ⇒ 清。
- **词形**（核字典键）：`status.team.invalid` = zh「已失效——重新登录」∥ en「Session expired — log in again」——各端经自身 `t()` 出词（零自铸字面；CLI 现渲缺省 en——沿 `docs/cli/design/TUI.md` §7.7 观察①同注）。
- **引导重登**：桌面 ∥ VSC = 点击即登录面（表单/流；server ∥ 用户名预填自留存值）；CLI = `/team login`（`/team status` 出「已失效——重新登录」句）。重登成 ⇒ `verify` 清（新 token 新判）。

### 2.7 轮换流程（`teamRotate`——team-token-rotation 批 · 台账 #1238）

- **可达面（三端管理面——已登录在场）**：CLI `team rotate`（argv）∥ `/team rotate`（会话内）；VSC 团队卡 ∥ 桌面团队段「轮换」控件（§2.5 设置面行）。**确认一步**：后果句（§2.5 轮换句）⇒ 确认 ∥ 取消；**取消 ∥ 未确认（非 `y` 应答 ∥ EOF）⇒ 零请求零写盘**（零动作）。CLI 应答面 = TTY 问句 y/N ∥ 非 TTY stdin 行读（D-TM6 同径——`y`/`Y` ⇒ 继续）。
- **流程**：`POST <server>/api/client/rotate`（Bearer = `team.token`；体 `{}`——写端点 JSON 门照常）⇒ 成 ⇒ **一次写盘**：`team.token` = 新明文（替换）+ 派生条目 `apiKey` 同步（条目缺失 ∥ 同名手工 ⇒ 仅落 token——沿登录不覆盖口径）；败 ⇒ 零写盘 + 出词。
- **返回形**：`{ ok:true }` ∥ `{ ok:false, reason }`——`reason` 本流程子集 = `network`（不可达 ∥ 非 401 非 200 应答）∥ `invalid`（401——token 已失效：出「已失效——重新登录」句并置 `verify = invalid`）∥ `write_failed`（服务端已应答、本地写盘失败——旧 token 已失效，下拍校验转已失效）。零凭据字段（token 鉴权即凭据——无需密码复录）。
- **与 §2.6 同拍**：成 ⇒ `verify` 清（新 token 新判——不变式同登录成）；败（`invalid`）⇒ 本调用即活校验，当场转「已失效」显示。
- **CLI 出词面（同句集——单语直出）**：确认句 ⇒ y/N；成 ⇒ 结果行 = 成句直出；败（`invalid`）⇒ 失效句直出；argv ∥ 会话内逐字同源（词面导出面单源 = `team-command.mjs`；三端同句判据 = §2.5）。**面别区分**：本流程三句 = zh 直出（不经 `t()`）；常显面「已失效」状态词 = `t()` 径（CLI 现渲缺省 en——在案未决，沿 `docs/cli/design/TUI.md` §7.7 观察①）——同屏并见时两径各按本径出词（本批渲制零改）。
- **会话内随动（CLI `/team rotate`——沿登/退既有两复读）**：成 ⇒ ① `syncProvidersFromDisk`（派生条目新 `apiKey` 入会话内存——模型面照常）② `refreshTeamState` + `verify` 清（§2.6 同拍）；败（`invalid`）⇒ 当场置 `verify = invalid` 转「已失效」；argv 径无会话内存（进程即止——零随动对象）。
- **失败面（如实）**：网络败 ⇒ 服务端零变更（旧 token 仍有效——重试即复原）；响应丢失 ∥ `write_failed` ⇒ 本地持已死 token ⇒ 下次 `teamVerify` 触发转「已失效」，恢复径 = 重登。
- 服务端语义单源 = `docs/server/design/client/CLIENT.md` §2 rotate 行 ∥ §5 KD-SV-63。

### 2.8 登/退成拍模型候选面即时刷新（三端）

**动机**：登录成拍只刷团队态（VSC `teamStatus` ∥ 桌面段态 + 渠道列表）——三端模型候选面的取数面（VSC `models` 载荷 ∥ 桌面 `model:catalog` ∥ CLI `agent.providers`）不在该拍内 ⇒ 用户「登录了，模型列表没变」（须等下一次全状态推送才见 `team` 渠道）。

**机制**：登录成 ⇒ **同拍触发本端候选面的既有取数面一次**——沿既有推送面（零新推送机制 ∥ 零新 IPC ∥ 零轮询）。

| 端 | 取数面（既有） | 成拍随动落点 |
|---|---|---|
| CLI | `agent.providers`（模型 picker 开面活读该数组——`thincoder-cli/src/tui/model-picker.mjs:115`） | `thincoder-cli/src/tui/cmd-team.mjs` `completeTeamLogin`（现盘实读 `:214`——内 `syncProvidersFromDisk` 调用 `:219`）——本批零改 |
| VSC | `models` 载荷（`fullStatus`——`thincoder-vscode/src/extension/settings.mjs:393`；消费 = `thincoder-vscode/webview/chat-messages.js:150`） | 两处（登录入口两族各一）：① webview 径 ⇒ `thincoder-vscode/src/extension/panel-messages-settings.mjs:268` `handleTeamLogin` 成支 `panel._pushSettings()`；② 扩展侧径（状态栏 item ∥ 命令面板）⇒ `thincoder-vscode/src/extension/team-surface.mjs:135` `loginFlow()` 成支 `_chatPanel?._pushSettings?.()`（登成 ⇒ `models` 随探针拍发） |
| 桌面 | `model:catalog`（输入区候选面——`thincoder-desktop/renderer/composer-sync.mjs:325`） | `thincoder-desktop/renderer/mount-team.mjs:120` `login()` 成支：既有 `loadProviders()` 旁增 `onProvidersChanged()`（= `composer.refreshCandidates()`；注入面 = `thincoder-desktop/renderer/mount-settings.mjs:155`） |

**登录入口逐径（本批刷新落点的适用范围）**：本批只动登录成拍一条路径，落在各端**登录入口**上——逐径清点如下。

| 端 | 登录入口 | 本批落点是否覆盖 |
|---|---|---|
| CLI | argv `thincoder team login`（`thincoder-cli/src/cli/team-command.mjs`）∥ 首启向导团队路 ∥ 会话内 `/team login` | 覆盖：向导路与会话内**同经 `completeTeamLogin`**（`thincoder-cli/src/tui/wizard.mjs:311` 调同件）；argv 径进程即止、无会话内存 ⇒ 零随动对象（候选面取数 = 下次启动）——三径零改 |
| VSC | 首启板团队卡 ∥ 状态栏团队 item 点击流 ∥ 命令面板 `thincoder.team` | 覆盖：**三径皆成拍刷新——实现两处（未汇流）**：① 首启板团队卡（webview `teamLogin` 消息）经宿主 `handleTeamLogin`（`thincoder-vscode/src/extension/panel-messages-settings.mjs:264`）；② 状态栏 item ∥ 命令面板经扩展侧 `loginFlow()` 成支（`thincoder-vscode/src/extension/team-surface.mjs:135`——直调核 `teamLogin`，不经 `handleTeamLogin`） |
| 桌面 | 状态段就地面板（`thincoder-desktop/renderer/mount-team.mjs` `login()` `:120`）∥ 首启向导团队表单（`thincoder-desktop/renderer/mount-onboarding.mjs:182` `team:login`） | 面板径 = 本批落点；向导径**不经 `login()`**——成拍随动 = `loadProviders()`（`thincoder-desktop/renderer/mount-onboarding.mjs:191`）+ 步 2 自带取数链（`loadModels`）⇒ 向导期主界面输入区不在用，本批刷新落点该径不适用（零改；端面单源 = `docs/desktop/design/SETTINGS.md` §2.21） |

**沿既有面（零新增）**：VSC 复用「provider 写成功 ⇒ `panel._pushSettings()`」先例（`thincoder-vscode/src/extension/panel-messages-settings.mjs:94`——登录 = 派生条目入列表，同类动作；`fullStatus` 首行仍发 `providerStatus`，回执序不变）；
桌面复用「provider 写成功 ⇒ `onProvidersChanged`」先例（`thincoder-desktop/renderer/mount-settings-exits.mjs:123`）；CLI 复用登/退既有两复读之一。

**登出成拍（同律——三端）**：退出成 ⇒ 同拍刷新本端候选面，落点各端一处（VSC 两径未汇流）——
VSC webview 径 `thincoder-vscode/src/extension/panel-messages-settings.mjs:283` `panel._pushSettings()`；
VSC 扩展侧径 `thincoder-vscode/src/extension/team-surface.mjs:152` `_chatPanel?._pushSettings?.()`；
桌面 `thincoder-desktop/renderer/mount-team.mjs:165` `onProvidersChanged?.()`。
理由 = 退出摘派生条目 `apiKey` ⇒ `team` 渠失效、候选面整表作废；不推则界面挂着过期候选表。VSC 早退径同拍清簿记（`models: []` + prefs 与 `_lastPushedPrefs` 同源同拍——`thincoder-vscode/src/extension/settings.mjs:397` 早退径），否则下一次复推按旧候选簿记复读。

**不动（本批范围外）**：轮换（§2.7）——既有随动零改（轮换只换 token、渠道集合不变；渠道行由 `pushTeamStatus` + `_pushStatus` 当拍重取）。

## 3. 关键决策记录

| # | 决策 | 理由 |
|---|---|---|
| D-TM1 | **登录态单源 = `team` 段（`token` 在场）；派生条目 = 派生物**（apiKey 镜像） | 「派生」语义正向（登录 → provider）；后续数据面读 `team.token` 不依赖 provider 条目存亡 |
| D-TM2 | **退出 ⇒ 条目保留（摘 apiKey）+ `derived` 标记保留**；provider 面零新字段 | 口径②「停用/隐藏（不删标记）」直译；零新字段（apiKey 空缺即不可用——既有判据） |
| D-TM3 | **隐藏判据 = `derived && !hasKey`**（列表/候选面） | 登录态（有 key）照常可见可用；退出后单条过滤规则（四消费面各一处） |
| D-TM4 | **同名手工条目 ⇒ 提示不覆盖** | 用户既有配置零破坏（登录不夺本机面）；数据面不受累（token 独立） |
| D-TM5 | **端标签 = `端名@主机名` 自动生成**（≤40 裁剪） | 口径①示例形；零输入字段（口径③字段表三件） |
| D-TM6 | **密码问句 = CLI 隐藏回显（TTY）/ stdin 行（非 TTY）** | 对齐 VSC/桌面 `type=password` 能力（文案同构）；非 TTY 保留脚本化直登径 |
| D-TM7 | **吊销感知 = 显式活校验（`teamVerify` 三值）+ 触发点制**（启动 ∥ 面开合 ∥ `/team status` 活查）；**不设周期轮询**；`unreachable` 不判失效 | 零新定时器（沿「不做常驻仪表」先例）；离线容忍（网络错 ≠ 吊销——401 单判）；「本地照旧显示」不处理（用户裁定 = 需「已失效 + 引导重登」） |
| D-TM8 | **登/退入口移出设置面**——设置卡/段 = 管理面（label ∥ 详情；零登/退）；主界面直达面（状态段/项 ∥ `/team`）承载登/退 | 用户 2026-10-10 14:46 裁（登/退不得要求先钻设置）+「两处不互抄」（各端需求卷） |
| D-TM9 | **轮换 = 单把换发 + 端侧可达 + 确认一步**：核 `teamRotate` 单源 ∘ 三端管理面控件/子命令；确认 = 后果句一步（取消零动作） | 轮换本义 = 旧即失效（§2.7）；逐端各持一枚 ⇒ 单把（不连带他端 ∥ 沙盒 key——KD-SV-63 同拍）；确认一步 = 「后果明示须可见」口径延伸（凭据动作后果就地明示——就地构件，零原生弹窗）；**被否**：重登式（旧不失效——与本义相抵）∥ 全换（断他端）∥ 就地改 hash（离 revoke + issue 先例 ∥ 审计链断）∥ 零确认（凭据换发为不可见动作——点错无痕） |

## 4. 受影响文件与行数预算

| 域 | 档 | 行数 |
|---|---|---|
| core | `thincoder-core/config.mjs` | **509**（`team` 段加载归一 +14；**越 500 软线 ⇒ 主动拆分评估层**——拆分预案指针 = `docs/core/design/CONFIG.md` §5（核内落点行数）→ `docs/core/design/CORE-UNIFICATION.md` §2.8.1「核内逐档行数与拆分计划」） |
| core | `thincoder-core/config-io.mjs` | **282**（写面复用 `writeConfigAtomic`） |
| CLI | `thincoder-cli/src/cli/team-command.mjs` | **246 ⇒ ≈292**（+≈46——`team rotate` 子命令 ∥ 确认问句 ∥ 结果行；三子命令 ∥ 旗标 ∥ 三态输入面照旧） |
| CLI | `thincoder-cli/src/command-table.mjs` | **201（零改——`case "team"` 透传 args）** |
| CLI | `thincoder-cli/bin/thincoder.mjs` | **190 ⇒ ≈191**（+1——USAGE 增 rotate 行） |
| CLI | `thincoder-cli/src/completions.mjs` | **156 ⇒ ≈156**（三套补全 `team` 词面——增 `rotate` 四处，行数零变） |
| CLI | `thincoder-cli/src/tui/cmd-team.mjs` | **235 ⇒ ≈258**（+≈23——`/team rotate` 支 ∥ 确认问句 ∥ usage 词面） |
| CLI | `thincoder-cli/src/tui/model-picker.mjs` | **324**（`isDerivedProviderHidden` 再出口 ∥ 两处过滤（模型候选 ∥ 槽位面）；`Remove provider…` 守卫改用过滤后计数） |
| CLI | `thincoder-cli/src/tui/provider-admin.mjs` | **248**（`isDerivedProviderHidden` 谓词单源 ∥ 三流过滤（remove ∥ key ∥ context）） |
| VSC | `thincoder-vscode/webview/settings-team.js` | **132 ⇒ ≈178**（+≈46——轮换控件 ∥ 确认一步（确认/取消两键） ∥ 结果行；卡降管理面结构照旧） |
| VSC | `thincoder-vscode/webview/settings.js` | **203**（+import ∥ 第 6 卡序尾合成） |
| VSC | `thincoder-vscode/webview/chat-messages.js` | **295 ⇒ ≈297**（+2——`teamRotateResult` case ∥ import 名） |
| VSC | `thincoder-vscode/src/extension/team.mjs` | **44 ⇒ ≈52**（+≈8——`teamRotate` 转口（转口五件）；零状态） |
| VSC | `thincoder-vscode/src/extension/panel-messages.mjs` | **391 ⇒ ≈394**（+3——`teamRotate` import 名 + case） |
| VSC | `thincoder-vscode/src/extension/panel-messages-settings.mjs` | **285 ⇒ ≈300**（+≈15——`handleTeamRotate`（成/失效 ⇒ 推送 + 团队面随动）） |
| VSC | `thincoder-vscode/src/extension/settings.mjs` | **420**（+隐藏判据一处（`providerStatus`）∥ `pushTeamStatus`（推送点）） |
| VSC | `thincoder-vscode/src/extension/panel-settings-push.mjs` | **124**（两条推送链调用（快照族拍）；推送点住 `thincoder-vscode/src/extension/settings.mjs`） |
| VSC | `thincoder-vscode/locales/en.json` ∥ `zh.json` | **349 ∥ 349**（现读——**本批增量 ≈4 键/表**：控件词 ∥ 确认句 ∥ 成句 ∥ `invalid` 失效句；team 族累计 19 键/表——实读） |
| 桌面 | `thincoder-desktop/renderer/views/settings-sections-team.mjs` | **143 ⇒ ≈200**（+≈57——轮换控件 ∥ 确认两键 ∥ 结果行增成句） |
| 桌面 | `thincoder-desktop/renderer/views/settings.mjs` | **454 ⇒ 454**（行内改——team 支传 handlers（轮换出口按表入院）；行数零变） |
| 桌面 | `thincoder-desktop/renderer/views/settings-sections.mjs` | **100**（`teamBody` re-export） |
| 桌面 | `thincoder-desktop/renderer/mount-team.mjs`（并入后） | **324 ⇒ ≈352**（+≈28——轮换出口 ∥ 确认态 ∥ 复读两调用点同径） |
| 桌面 | `thincoder-desktop/renderer/mount-settings.mjs` | **292**（`MODAL_READS` +1 行（`team → loadTeam`）∥ `SCOPES` 派生随动 ∥ team 读/出口装配） |
| 桌面 | `thincoder-desktop/src/main/team.mjs` | **46 ⇒ ≈58**（+≈12——`team:rotate` 通道（转口）；零状态零自写盘） |
| 桌面 | `thincoder-desktop/src/main/ipc-registry.mjs` | **102 ⇒ ≈103**（+1——`team:rotate` HANDLER） |
| 桌面 | `thincoder-desktop/src/preload/preload.cjs` | **92 ⇒ ≈93**（+1——`teamRotate` CHANNEL） |
| 桌面 | `thincoder-desktop/renderer/i18n-settings.mjs` | **208 ⇒ ≈212**（+≈4 键——控件词 ∥ 确认句 ∥ 成句 ∥ `invalid` 失效句） |
| 桌面 | `thincoder-desktop/src/main/providers.mjs` | **311**（隐藏判据一处：`derived ∧ 无 key` ⇒ 滤除（`providerList`）） |
| core | `thincoder-core/team.mjs` | **223 ⇒ ≈252**（+≈29——`teamRotate`（§2.7）；全档 = 登录 ∥ 退出 ∥ 状态 ∥ 标签 ∥ 条目 upsert/停用 ∥ 地址归一 ∥ 错误分类 ∥ `teamVerify`） |
| core | `thincoder-core/i18n.mjs` | **≈120**（`status.team.invalid` 两语） |

- 单元测试档三件（跨档集——批内件随批档归档，零入链）：服务端单件（**305**）∥ 本册件（核 + 三端结构面——**410**——跨面件无宿主产品链）∥
  桌面面单件（**364**——桌面包无 `prepublishOnly` 链）。
- `thincoder-core/agent-tools/settings.mjs`（`team` 不入 `DEFAULTS`——工具面不受影响）。
- 本批（轮换）单元测试档（拟新增）：`docs/batches/2026-10-15-team-token-rotation.test.mjs`（≈**320**——服务端面 + 核面 + 三端结构机检；**不入链**——跨面件随批档归档）。

## 5. 验收判据（端侧面——回指 AC-31 ①–⑤）

| 判据 | 载体 |
|---|---|
| ① 三端登录入口在册：CLI `team login` ∥ VSC 团队卡 ∥ 桌面团队段（地址 + 账号 + 密码三字段各在） | 单元测试档（结构机检）+ 收口轮三端实走 |
| ② token 落本地 ∥ 明文密码零落盘：登录成 ⇒ `team.token` 在场 ∥ 派生条目 `apiKey` 同值；实读 config.json 零密码字段 | 单元测试档 |
| ③ 自动 provider ∥ 模型可用：登录成 ⇒ `providers[]` 现 `team` 条目（`derived:true` ∥ baseURL = `<server>/v1` ∥ apiKey = token——同盘读）；模型面 = 该 token 对 `/v1/models` 可通；收口轮实走一轮 | 单元测试档 + 收口轮 |
| ④ 未登录 ⇒ 团队面不启用：`loggedIn === false`；三端未登录态渲染（提示句逐字同）；派生条目无 key ⇒ 列表隐藏（§2.4 判据） | 单元测试档 + 收口轮 |
| ⑤ 退出 ⇒ 服务端吊销 + 团队面关闭：落盘后 `team.token` 摘除 ∥ `apiKey` 摘除且 `derived` 保留 ∥ 服务端该 token 下一请求 ⇒ 401（服务面判据 = `client/CLIENT.md` §4） | 单元测试档 + 收口轮 |

**增判据（回指桌面 D11 ∥ CLI F19 ∥ F20 ∥ VSC F-W20 ∥ F-W21）**：

| 判据 | 载体 |
|---|---|
| ⑥ 首启两路：三端首启首屏两路并列（图形端两卡 ∥ CLI 三行列表；都不预选；「以后再说」第三态在场）+ 同屏换取表单 + 「← 换一种方式」回退；登录成 ⇒ 即用（模型面就绪——模型选定面 = 各端既有面） | 单元测试档（三端各面）+ 收口轮三端实走 |
| ⑦ 常显：已登录 ⇒ 三端常显面可见成员（服务器 = 悬停/tooltip/行内 —— 见 §2.5 常显面行）；未登录 ⇒ 图形端入口段 ∥ CLI 零注入（逐字节等价负控）；已失效 ⇒ 三端「已失效——重新登录」 | 单元测试档 + 收口轮 |
| ⑧ 直达登/退：登/退不经设置面完成（桌面段面板 ∥ VSC item 流 ∥ CLI `/team`）；设置面团队卡/段 = 管理面（label ∥ 详情；零登/退控件） | 单元测试档 + 收口轮 |
| ⑨ 轮换可达到位（team-token-rotation 批）：CLI `team rotate`（argv ∥ /team）注册在册 ∥ VSC 卡 ∥ 桌面段控件在场（已登录）；确认句 ∥ 成句 ∥ 失效句「已失效——重新登录」三端逐字同句（CLI = 单语直出）；**确认门：取消 ∥ 未确认 ⇒ 零请求零写盘**；轮换成 ⇒ 本机照常（模型面可用——同 token 两用） | 单元测试档 + 收口轮三端实走 |
| ⑩ 登/退成拍候选面即时刷新（三端）：登录成 ⇒ **成拍推送链内**本端模型候选面即含 `team` 渠道（时点 = 链内到达，非墙钟「当刻」）——CLI = `syncProvidersFromDisk` 返后 `agent.providers` 含 `team` 派生条目 ∥ VSC = 两径皆成拍刷新：webview 径（`handleTeamLogin`）假 sink 收序 `teamStatus` → `providerStatus` → 回执 `teamLoginResult`（同步推送殿后）→ … → `models`（随探针拍异步落；载荷含 `team` 渠）；扩展侧径（状态栏 item ∥ 命令面板——`loginFlow()` 成支 `_chatPanel?._pushSettings?.()`；面板在场）假 sink 收 `teamStatus` → `providerStatus` → … → `models`（零回执——该径不经 webview 消息面） ∥ 桌面 = `composer.refreshCandidates()` 恰一次 ⇒ `model:catalog` 回执含 `team` 渠；**败径**（网络 ∥ 凭据 ∥ 429 ∥ 写盘败）⇒ 三端零刷新（零推送 ∥ 零 `refreshCandidates` 调用 ∥ `agent.providers` 不变）；**同名手工冲突成拍** ⇒ 仍恰一次刷新 ∧ 候选面零 `team` 条目（零假造）；**退出成拍（同律）** ⇒ VSC 两径（`handleTeamLogout` ∥ `logoutFlow`）各 `_pushSettings` 恰一次 ∥ 桌面 `logout` ⇒ `onProvidersChanged` 恰一次 ⇒ 候选面按空表重取（`models: []` = 已到且空、簿记同拍清）；不动 = 轮换既有随动 | 单元测试档（三端各面——假 sink ∥ spy）+ 收口轮三端实走 |

## 6. 用例（本域 · 单元测试档）

| # | 用例 | 判据 |
|---|---|---|
| N1 | 登录成 ⇒ 一次写盘：`team` 四键在场 ∥ 派生条目在场（表尾）；两处同值 | 单元测试档（写盘面 = 临时 config 路径 + 本地 HTTP 桩） |
| B1 | 同名手工 `team` 条目 ⇒ 登录成 + 提示 + 手工条目逐字零改（零覆盖） | 单元测试档 |
| E1 | 登录败（网络不可达 ∥ 401 ∥ 429）⇒ 零写盘 + 分类出词；本机配置写入失败 ⇒ `write_failed`（零假成功） | 单元测试档 |
| N2 | 退出 ⇒ token 摘除 ∥ apiKey 摘除 ∥ `derived` 保留 ∥ 服务端收到吊销请求；网络失败 ⇒ 本地照清 + 提示 | 单元测试档 |
| B2 | 派生条目无 key ⇒ 三端列表过滤判据（纯函数）判真 ∥ 有 key 判假 | 单元测试档 |
| E2 | 地址归一：缺协议补 `http://` ∥ 尾斜杠去 ∥ 尾 `/v1` 去；label 裁剪 ≤40 | 单元测试档 |
| N3 | `teamVerify` 三值：200 ⇒ `valid`；401 ⇒ `invalid`；网络不可达 ⇒ `unreachable`（不判失效——离线容忍） | 单元测试档（HTTP 桩） |
| B3 | 吊销 → 重登：`invalid` 态 ⇒ 重登成 ⇒ `verify` 清 ∥ 新 token 落盘；旧 token 下一请求 401 | 单元测试档 + 收口轮 |
| N4（轮换） | 轮换成：新 token 落盘（`team.token` 替换 + 派生条目 `apiKey` 同值——一次写盘）；旧 token 服务端下一请求 401；`verify` 清 | 单元测试档（HTTP 桩 + 临时 config 路径） |
| B4（轮换） | 轮换边界：派生条目缺失 ∥ 同名手工 ⇒ 仅落 token（零覆盖）；未登录 ∥ 无地址 ⇒ 兜底归类（零请求旁路）；取消 ∥ 未确认（非 `y` 应答 ∥ EOF）⇒ 零请求零写盘 | 单元测试档 |
| E4（轮换） | 轮换败三形：网络 ⇒ 零写盘（旧 token 仍有效）；401 ⇒ `invalid` + 置「已失效」；写盘败 ⇒ `write_failed` | 单元测试档 |
| N5 | 登录成拍候选面即时刷新（正路）：登录成 ⇒ 链内到达本端取数面一次（CLI `syncProvidersFromDisk` 返后 `agent.providers` 含 `team` 派生条目 ∥ VSC sink 收序 `teamStatus` → `providerStatus` → `teamLoginResult`（同步推送殿后）→ … → `models`（随探针拍异步落） ∥ 桌面 `composer.refreshCandidates()` 恰一次 ∧ `model:catalog` 回执含 `team` 渠） | 单元测试档（三端结构机检 + 假 sink ∥ spy 断言） |
| E5 | 登录败四径（网络 ∥ 凭据 401 ∥ 429 ∥ 写盘败）：三端零刷新——VSC sink 零 `models` 消息 ∥ 桌面 `refreshCandidates` 零调用 ∥ CLI `agent.providers` 不变（零假成功） | 单元测试档（三端各面） |
| B5 | 同名手工 `team` 条目冲突（成但携 `notice`）：端侧仍**恰一次**刷新 ∧ 候选面**零** `team` 条目（不写派生条目 ⇒ 不假造候选行）；手册条目逐字零改 | 单元测试档（三端各面） |

## 7. 边界（不做）

- 不做登录 token 管理面（清单/吊销 = 控制台 key 页 ∥ CLI key 命令——既有面）；轮换 = 端侧可达（§2.7——单把换发）；**不做全换**（他端 token ∥ 沙盒工作区 key 不动——KD-SV-63）**∥ 不做改名**（标签沿用） ∥ 不做多账号/多服务器切换（单登录态） ∥ 不做离线缓存 ∥ 不做授权码/device-flow ∥ 不做周期轮询校验（校验 = 触发点制——§2.6） ∥ 不做团队面板（状态 = 常显段/项；入口 = 登/退面） ∥ 不做新文案（五句失败句 ∥ 未登录句 ∥ 三条一次性提示沿用逐字；新态词仅「已失效——重新登录」）。
- **token 生命周期**：累积可预期（每次登录一枚 ∥ 无过期 ∥ 不自动清理）——清理 = 用户面（key 列表逐把吊销——既有面）；换 server 重登（单登录态覆盖）⇒ 旧 server 的 token 不在本机——撤销径 = 旧 server 控制台 key 列表（`webui/ME.md` §2.1 ∥ `GET /api/me` ∥ CLI `key revoke`）。
- 不改 `memory.team`（B3 面） ∥ 不动 personal/project 记忆 ∥ 不自动改 `defaultModel` ∥ 不切换会话模型 ∥ 不动手工 provider 条目。
