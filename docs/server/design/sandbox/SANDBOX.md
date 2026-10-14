# Thincoder Server · 沙盒（sandbox/SANDBOX）

> 板块 = server ∥ 本域 = sandbox（服务端执行沙盒）；本档 = 域档（控制面口径）；**执行面单源 = `sandbox/EXECUTION.md`**（通道 ∥ 盒生命周期直调链 ∥ 主机侧件 ∥ 盒运行时通道——sandbox-exec-rebuild 批建档）。
> 需求单源 = `docs/server/requirements/PROJECT.md` §5 沙盒块（#1215 前置硬题）；**控制面/执行面分离 = 用户 2026-10-10 14:00 裁定**（原话：「沙盒可不可以不运行在thincoder-server本机？我们可以考虑外挂几台机器跑沙盒，否则一个节点把服务器干死了就都死了。」）。
> **执行面 = runner（远程 Docker API 节点）**：控制面直调 Docker API ∥ 主机侧强制走 SSH ∥ 集群化 = 用 Docker 自己的集群 ∥ 机器上不驻留我们的进程——用户 2026-10-10 19:52–19:56 定；机制全文 = `sandbox/EXECUTION.md`。
> 端点表 = `gateway/API.md` §2.5/§2.7（单源）；表结构全文 = `store/STORE.md` §2 v11–v22 段。
> 建档：2026-10-10（批 `docs/batches/2026-10-10-server-exec-sandbox.md` 设计轮 · eng-designer · 台账 #1224）；执行面随正（批 `docs/batches/2026-10-10-runner-admin-console.md` · 台账 #1252）。

## 1. 形态与两平面

- **一句话**：沙盒 = 容器强制的代码执行隔离件——**盒**（每工作区一个容器）跑在**执行面（runner）**的机器上，由**控制面（server）**编排治理；**server 本机不跑盒**。
- **控制面**（本档）= server 的 sandbox 域：节点登记 ∥ 编排 ∥ 出站规则单源 ∥ 待批队列 ∥ 每工作区凭据 ∥ 审计 ∥ 控制台。
- **执行面 = runner（远程 Docker API 节点）**：控制面**直调 Docker API** 建/起/停/拆盒；**主机侧强制走 SSH**（出站闸 ∥ 磁盘限额）；**机器上不驻留我们的进程**；集群化 = **用 Docker 自己的集群**（Swarm）；**盒级超时/快照 = 控制端（server）定时器**（节点存活 = 读时探活——§14 KD-SV-80）——用户 2026-10-10 19:52–19:56 定；**机制全文 = `sandbox/EXECUTION.md`**（三腿 ∥ 三证 ∥ 直调动作链 ∥ 主机侧件 ∥ DNS 闸）。
- **为什么分离**：单机把盒与 server 放一起 ⇒ 一台机器被盒压死即全死（用户 14:00 原话）；分离后盒的资源耗尽只影响所在节点，server 常驻面不受累。
- **容器唯一形态**（用户 13:43「容器是必须，不要考虑什么退路」）：**无可用节点 ⇒ 仅沙盒功能面不可用**（控制台明示——不降级）。
- **server 启动与运行零依赖沙盒/runner**（用户 14:24 裁定——原话「thincoder server启动应该是不依赖沙盒的，runner应该也只是相关功能不可用。」）：不因缺可用节点 ∥ 沙盒未配置而拒启或降级；缺 ⇒ **仅沙盒功能面不可用**（503 `sandbox_unavailable` + 控制台明示）；网关 ∥ 记账 ∥ 控制台其余页 ∥ 客户面零影响。
- **非目标**（需求块明写）：内核 0day ∥ 侧信道 ∥ 国家级逃逸。

## 2. 对象模型与存储（v11–v13 ∥ v15 ∥ v18 ∥ v22）

新表（v11 段建表 ∥ v12 重建 runners ∥ v13 增托管接入表 ∥ **v15 增镜像源表（sandbox-image-sources 批）** ∥ **v18 增主机凭据七列 + 托管接入态增 `'moved'`（admin-chat-creds-merge 批——DDL 全文 = `store/STORE.md` §2 v18 段；段号收正 2026-10-13：实落次序在先）**——DDL 全文 = `store/STORE.md` §2 对应段；`db.mjs` 已落盘 **688**——2026-10-13 现读
；**v22 收正（sandbox-exec-rebuild 批——本批）：`sandbox_workspaces` 列面收正在态（去 `required_labels_json`）+ 增 `stop_reason` + 增 `base_image`（底座绑定——修订轮增补）∥ 增建 `registry_credentials` 表（私有仓凭据——修订轮增补）
  ∥ `sandbox_tasks` 删表（队列退场——KD-SV-161）∥ **`sandbox_runners` 增连接材料四列**（`tls_ca` ∥ `tls_cert` ∥ `tls_key_cipher` ∥ `tls_updated_at`——本增补 #2：连接面 TLS 档）∥ 迁移段外提 `src/store/migrations.mjs`（拟新增）**）：

| 表 | 内容 | 关键列 |
|---|---|---|
| `sandbox_runners` | 登记的节点（= **主机表**——admin-chat-creds-merge 批扩展：行 = 一台主机，SSH 凭据随之；列面/机制 = §3 主机凭据块） | id ∥ name ∥ address（Docker API 地址——**SSH 目标 = 其 host 部分**）∥ status（active/disabled）∥ runtime_json（连通自检读数）∥ created_at ∥ **v18 新增**：ssh_port ∥ ssh_user ∥ auth_kind（key/password）∥ secret_cipher ∥ sudo_cipher ∥ credential_state（none/sealed/revoked——**密列零回显**）∥ credential_updated_at ∥ **v22 增（本增补 #2）**：tls_ca ∥ tls_cert ∥ tls_key_cipher（AES-256-GCM——**密列零回显**）∥ tls_updated_at（连接材料——**仅 TLS 档**；不变量 `https` ⇔ 三件齐——§3 连接方式块） |
| `sandbox_workspaces` | 工作区登记 | id ∥ name ∥ owner_member_id ∥ key_id ∥ key_plain ∥ runner_id（绑定节点）∥ limits_json（每工作区覆写——下条）∥ created_at ∥ `stop_reason`（停因注记——v22 增：idle_ttl/wallclock_ttl/manual；NULL = 未停；引擎态恒读时读） ∥ `base_image`（底座绑定——v22 增（修订轮增补）：NULL = 标准镜像 `settings.image`；非空 = 归一引用（`名:标签`）；生效 = 下次建盒/重建——§3 底座可换块） |
| `sandbox_rules` | 出站规则（单源） | id ∥ kind（cidr/domain）∥ action（allow/deny）∥ target ∥ port ∥ protocol ∥ priority ∥ note ∥ source（default/admin/approval）∥ created_at ∥ created_by |
| `sandbox_pending` | 待批记录（史） | id ∥ runner_id ∥ workspace_id ∥ host ∥ hits ∥ first_seen_at ∥ last_seen_at ∥ status ∥ resolved_at |
| `sandbox_checkpoints` | WIP 快照登记 | id ∥ workspace_id ∥ created_at ∥ size ∥ blob_path ∥ note |
| `sandbox_settings` | 设置（键值——全局默认） | k ∥ v——**键全集与值形 = `gateway/API.md` §2.5（单源）**；「默认单」**不在本表**（= `sandbox_rules` 种子行——§4） |
| `sandbox_onboarding` | 托管接入任务 + 凭据（v13——**停机留史**，2026-10-14） | id ∥ host ∥ ssh_port ∥ ssh_user ∥ auth_kind ∥ secret_cipher ∥ sudo_cipher ∥ credential_mode ∥ credential_state ∥ name ∥ model ∥ status ∥ step ∥ steps_json ∥ runner_id ∥ created_by ∥ created_at ∥ finished_at（DDL 全文 = `store/STORE.md` §2 v13 段；**停机留史**——2026-10-14 托管接入退场：零写入 ∥ 零读面；历史数据不删） |
| `image_sources` | 远程镜像源清单（控制台维护——**server 全局**，非按节点） | id ∥ name ∥ address（名 ∥ 址**各自唯一**）∥ created_at ∥ created_by（DDL 全文 = `store/STORE.md` §2 v15 段） |
| `registry_credentials` | 私有仓凭据（**server 全局**——按注册表主机；底座可换增补） | id ∥ host（注册表主机——归一（小写；Hub 别名归 `docker.io`）∥ **唯一**）∥ username ∥ secret_cipher（AES-256-GCM——复用 `credential-crypto.mjs`；**密列零回显**）∥ created_at ∥ created_by（DDL 全文 = `store/STORE.md` §2 v22 段） |

- **审计**：`audit_events.type` CHECK 重建（v11——沿 v10 表重建先例 `db.mjs:171-192`）——**十型 ⇒ 十二型**（+ `sandbox_rule`（规则增删——detail.action + 规则原文）
  ∥ `sandbox_event`（审批三态/超时 ∥ 盒起停拆 ∥ 节点添加/删除（含连通自检失败行） ∥ 快照——detail.kind）；型面单源 = `accounts/audit.mjs`（已落盘 109 行））。
  **镜像源增补（sandbox-image-sources 批）**：`sandbox_event` 增三 kind（`image_source_add` ∥ `image_source_update` ∥ `image_source_delete`——detail 键集 = `accounts/ACCOUNTS.md` §2.1；kind 非枚举——CHECK 零动）。
  **主机凭据增补（本批）**：`sandbox_event` 增两 kind（`host_credential_set` ∥ `host_credential_revoke`——detail 键集 = `accounts/ACCOUNTS.md` §2.1；kind 非枚举——CHECK 零动）。
  **连接方式增补（本批 · 增补 #2）**：`sandbox_event` 增一 kind（`runner_connection`——连接方式变更（设/改/关 TLS——含材料清零）；detail 键集 = `accounts/ACCOUNTS.md` §2.1；kind 非枚举——CHECK 零动）∥ `runner_add` detail 增 `tls` 布尔键。
- **修订号（rulesRev）**：规则/设置变更 ⇒ 全局单调 +1。
- **明文落库**：`sandbox_workspaces.key_plain`（工作区 key 明文——盒每次重建须再注入；先例 = provider key 明文（KD-SV-19）；披露 = §10-D2）。
- **每工作区资源档（覆写）**：`sandbox_workspaces.limits_json`（JSON 对象——键 = `cpus` ∥ `memMb` ∥ `pids` ∥ `diskMb` ∥ `idleTtlMinutes` ∥ `wallclockTtlHours`；缺键 = 随全局默认）；写端点 = PATCH（§9 ∥ `gateway/API.md` §2.5）；**取值序 = 全局默认（`sandbox_settings`）⇒ 逐键叠加工作区覆写（覆写优先）**。
  解析结果 = 建盒/重建时的容器参数（控制面直调 Docker API——§1）；生效 = 下次建盒/重建（运行中盒零触——容器旗不可热改）。
- **容器不落表**（runner-admin-console 批）：容器 = 节点上的 Docker 容器——**Docker 引擎即真源**（读时读 ∥ 动作直调；控制面零镜像 ∥ 零同步机制——§14 KD-SV-79）。
- **卷不落表**（sandbox-volumes 批——同族）：卷 = 节点上的 Docker **命名卷**——引擎即真源（读时读 ∥ 直调；零缓存零同步——§3 卷族 ∥ §14 KD-SV-104）；**建卷归引擎**（首用即建——我方零建卷调用）。
- **工作区卷形式定形（本批——KD-SV-162）**：工作区卷 = **主机路径绑定** `<workspaceRoot>/<ws-id>`（配额 ∥ 快照 ∥ 清理皆以路径为准）；与「卷族」（命名卷）并存不代管（卷区不列工作区卷——§15 登记项闭合）；盒态 = 引擎即真源（读 `tc-ws-*` 容器——§14 KD-SV-79；`stop_reason` = 服务器动作注记，非引擎态镜像）。

## 3. 节点与容器（最小切片——runner-admin-console 批）

> **本批射程（用户 2026-10-10 19:59 令）**：① 添加节点（登记一台 Docker API 节点）② 创建容器 ③ 启动 ∥ 停止容器 ④ 删除节点（+ 容器删除——提议④）。**其余全部不做**（一行带过：出站闸 ∥ 磁盘限额 ∥ 探针 ∥ 心跳/放置 ∥ Swarm ∥ 快照 ∥ 待批 ∥ 镜像管理 ∥ 工作区↔容器映射 ∥ 卷删除 ∥ 限额/端口/网络 ∥ TLS——§15）。
> **连线口径**：地址 = `[http://|https://]<host>:<port>`（登记输入归一：**按档补 scheme**——明文档（缺省）缺协议补 `http://`、缺端口补 `2375`；TLS 档（本增补 #2）缺协议补 `https://`、缺端口补 `2376`；**显式 scheme 与档相抵 ⇒ 400**——§3 连接方式块）；
> **调用恒带版本前缀**（**前缀形 = `v<协商版本>`**——如协商 `1.44` ⇒ 路径 `/v1.44/…`；2026-10-11 真机核：`/1.44/…` = 404 ∥ `/v1.44/…` = 200）；登记时协商 = `max(1.44, MinAPIVersion)`，须 ≤ `ApiVersion`，否则拒登记——提议⑤；**引导步 = 先取无前缀版本读数、再定前缀**——见下）；读类超时 3s ∥ 动作类 15s（常量；测试可注入 `fetchImpl`）。
> **读时探活（非心跳）**：运行面/列表读数 = 请求内现打（并发；无后台定时器 ∥ 无心跳机制——§14 KD-SV-80）。

- **添加节点**（`POST /api/admin/sandbox/runners`——提议①）：入参 `{ name, address }`（名 ≤ 40 字符；地址归一形如上）。
  **连通自检**（引导步 → 协商 → 复读）：① 无前缀 `GET <base>/version` 先取版本读数 ⇒ ② 协商 `ver = max(1.44, MinAPIVersion)` 须 ≤ `ApiVersion`（否则拒）⇒
  ③ `GET <base>/v<ver>/version` 复读全量 `{ Version, ApiVersion, MinAPIVersion, Os, Arch }` ⇒ 通过 ⇒ 落 `sandbox_runners` 行（`status='active'`；`runtime_json` = 自检读数）+ 审计行 `sandbox_event`（`kind=runner_add`）。
  失败（不可达 ∥ 超时 ∥ 非 Docker API 响应 ∥ 版本不兼容）⇒ **502 `upstream_error`** + 逐句人话 + **零落库** + 审计行（`runner_selfcheck_failed`）；重名 ∥ 地址形非法 ⇒ 400。
  **节点侧前置**：节点机 Docker 引擎须监听 TCP（测试机 = `dockerd -H fd:// -H tcp://0.0.0.0:2375` systemd override；前置步已落文——`docs/TEST-ENV-ECS.md` §7「节点接线链」，2026-10-10）；**TLS 档可选（本增补 #2——§3 连接方式块：缺省明文不变；`https://` 地址才走 TLS；证书 = 用户自备）**。
- **运行面读数**（`GET /api/admin/sandbox/overview`）：每节点现打 `GET <base>/v<ver>/info`（3s ∥ 并发）⇒ 行 = `{ id, name, address, status, online, version, containers: { total, running } ∥ null, selfCheck, createdAt }`（`online=false` ⇒ `version`/`containers` = `null`——离线读数不外推）。
  `status = available ⇔ 至少一个节点在线`（无节点 ⇒ unavailable「无节点注册」；全离线 ⇒ unavailable「节点全部不可达」）；**节点面（添加/删除）恒可用**（不随门禁）。
  写门（`requireSandboxAvailable`——需节点的写路径（工作区创建/动作；规则 ∥ 设置 ∥ 待批裁定不设门）= 静态判据（存在 `active` 节点）；本批零改——实时门统一随重做批）。
- **创建容器**（`POST …/runners/:id/containers`——提议②）：入参 `{ name, image, volume?, command? }`（名 = Docker 容器名形；镜像 = 控制台预填设置 `image` 值（现缺省 `thincoder-sandbox:1`）；卷 = Docker 卷名，空 = 不挂；
  **命令 = 启动命令（轻通道笔 10——用户 2026-10-12 11:51 裁「甲，应该有个默认，但是可覆盖」）**：缺省/`null` ⇒ 待命命令 ∥ 字符串 ⇒ 空格切分参数（不解析引号——本字段非壳）∥ 显式空串 ⇒ 400（空命令容器一亮即退））。
  ⇒ `POST <base>/v<ver>/containers/create?name=<名>`（体 = `{ Image, Cmd: ["sleep", "infinity"], HostConfig: { Binds: ["<卷>:/workspace"] } }`——**待命命令恒携**
  （盒语义——沿盒镜像自身 CMD；缺它 ⇒ 无长驻进程的镜像一亮即退——用户 2026-10-11 走查报，轻通道笔 3；**服务镜像面注**：镜像自带启动命令随之不生效（容器只待命、不跑其服务——按需自行换命令：**建容器窗「命令」字段可覆写**——轻通道笔 10；2026-10-11 评审 #249-2 的「按镜像择命令」句经笔 10 落地）；卷缺 ⇒ 省略 `HostConfig`）⇒ 201 ⇒ `{ container: { id, name, image, state: "created" } }` + 审计行（`container_create`）。
  引擎 404（无此镜像）∥ 409（名占用）⇒ 400（含引擎原文）；不可达 ⇒ 502。**创建 ≠ 启动**（两动作分列——用户四项逐条）。
- **容器读取与动作**：列表 = `GET …/containers`（读时读 `GET <base>/v<ver>/containers/json?all=1` ⇒ `{ containers: [{ id, name, image, state, status }] }`——名去前导 `/`）。
  **启动** ∥ **停止** = `POST …/containers/:containerId/{start,stop}`（204 ⇒ 200；**304（已启/已停）⇒ 幂等成功**；`t` 不带 = 引擎缺省 10s）∥ **删除** = `DELETE …/containers/:containerId`（`?force=1`——运行中强停强删；**卷不随删**）。
  动作各落审计行（`container_start` ∥ `container_stop` ∥ `container_delete`）；引擎无此容器 ⇒ 404 `not_found`；余 ⇒ 502。
- **删除节点**（`DELETE …/runners/:id`——提议③）：先读承载容器 ⇒ 有容器未给处置 ⇒ 400（「请选保留 ∥ 连删」）∥ `containers:"keep"` ⇒ 只删登记（容器原样留机）∥ `"remove"` ⇒ 逐个强删 ⇒ 全成 ⇒ 删行；**任一失败 ⇒ 502 + 登记行保留**（消息携失败清单）；无容器 ⇒ 直接删行。
  **节点不可达 ⇒ 仅 keep 可过**（连删 ⇒ 502）。**有承载工作区 ⇒ `confirm: true`**（现行为保留——工作区面本批零改）；不存在 ⇒ 404；审计行（`runner_delete`；detail 携 kept/removed）。**删登记 ≠ 动机器**（节点机 ⧺ 容器 ⧺ 卷均原样）。
- **本批提议与自加项**（用户今日三令：自加项必须带理由、禁冒充用户口径——逐条）：

| # | 项 | 来源 | 为什么 | 不做的代价 |
|---|---|---|---|---|
| ① | 连接形 = 直连 Docker API（地址 + 端口；内网；**不做 TLS**） | 父侧提议 | 最小切片——证书面（签发/续期/信任链/节点配置）大于本切片本身；内网 | 不做 TLS 本身的代价明示：2375 明文 = 无鉴权的 root 等价口暴露于网内（限内网；网不可信 ⇒ 必先上 TLS = 另批）；不采纳（先上 TLS）⇒ 切片推不动 |
| ② | 建容器最小形 = 名称 + 镜像 + 卷 三件 | 父侧提议 | 最小可跑（镜像 = 容器之锚；卷 = 数据落点、工作区卷前身）；镜像用现成盒镜像 | 按完整盒参数集（read-only ∥ cap-drop ∥ 每工作区网络 ∥ 限额）⇒ 工作量与设计面远超本切片（用户明令先不上） |
| ③ | 删节点有容器 ⇒ 二选一「保留 ∥ 连删」 | 父侧提议 | 删节点两义（换机 = 容器还想要 ∥ 退役 = 机器要清）——裁量交用户 | 直接删行不动容器 ⇒ 以为删净、机器上留孤儿容器；无问连删 ⇒ 误删运行中容器 = 事故 |
| ④ | 容器删除 = 独立动作（不只随节点连删） | 设计自加 | 「连删」能力已在本切片（节点删除径）；独立成钮 = 生命周期闭环（建了能删） | 仅节点级连删 ⇒ 单个容器删不掉——只能删整个节点，明显别扭 |
| ⑤ | 调用恒带 API 版本前缀（登记时协商） | 设计自加 | 官方文档明示**无版本前缀调用已废弃**（将来移除）；固定档不协商 ⇒ 未来 daemon 抬底即坏 | 裸无前缀 ⇒ 随官方移除一起坏；固定 1.44 —— Docker 29（最低 1.44）恰贴底无余量 |
| ⑥ | 容器动作落审计行（`container_*`） | 设计自加 | 用户既有「过程留痕」口径 + 审计型已备（`sandbox_event`）；一行成本 | 谁建/停了哪个容器无据（排障面） |

- **手工登记径**（需求 §5 ②——硬化环境用）：即上「添加节点」直填 Docker API 地址。
- **接入面（2026-10-14 起）**：手工登记 + **装机/主机运维 = 管理面 chat 内动作**（agent 用 `exec`/`docker`/`runners` + 主机表凭据——零新机制、零新端点；本 § 主机凭据块 ∥ `agent/ADMIN-AGENT.md` §12）；**任务式装机（托管接入）已退场**（用户 2026-10-14 裁「撤」——弹窗 ∥ 端点族 ∥ 服务件 ∥ 任务面工具删净；`sandbox_onboarding` 表停机留史——§2）。
- **容器面补齐 + 镜像族（sandbox-docker-admin 批；台账 #1265；用户 2026-10-11 04:36/04:39）**：控制台把节点机上的容器与镜像管全——两族八端点；**沿 KD-SV-79（引擎即真源：读时读 ∥ 动作直调 ∥ 零落库零缓存）**；端点行文 = `gateway/API.md` §2.5；UI 落点 = `webui/SANDBOX.md` §2.1①；审计 kind 单源 = `accounts/ACCOUNTS.md` §2.1（型面计数零增——十三型不变）。
  **容器面五件**（在既有 列表/建/启/停/删 之上）：
  - **详情**（`GET …/containers/:containerId`）：`GET <base>/v<ver>/containers/{id}/json`（读类 3s）⇒ `{ container: { id, name, image, state, status, created, startedAt, finishedAt, restartCount, command: { entrypoint, cmd }, env, mounts, ports } }`
    ——挂载 = `Mounts[]`（type/source/destination/mode/rw）∥ 端口 = `NetworkSettings.Ports` 展开（`{ port, hostIp, hostPort }`——未映射 ⇒ hostIp/hostPort = null）∥ 环境 = `Config.Env` 原文 ∥ 命令 = `Config.Entrypoint`/`Config.Cmd`；**零审计**（读动作）。
  - **日志**（`GET …/containers/:containerId/logs?tail=N`）：`GET <base>/v<ver>/containers/{id}/logs?stdout=1&stderr=1&tail=<N>`（读类 3s）⇒ `{ logs, truncated, tail }`
    ——**tail 有界**（缺省 200，范围 1–2000；越界/非数 ⇒ 400）；**非 TTY 容器 = 8 字节帧头多路复用流 ⇒ 解复用后输出**（判据 = 首字节 ∈ {0,1,2} ∧ 1–3 字节零 ∧ 帧长 ≤ 余量；判不出 ⇒ 原样透传——TTY 容器）；**引擎读数携 `timestamps=1`**（行首时标——日志窗与操作记录并流的排序单源；走查轮 2026-10-11）；文本截断 256 KiB（截断 ⇒ `truncated: true` + 尾句标记）；**零审计**（读动作）。
  - **重启**（`POST …/containers/:containerId/restart`）：`POST <base>/v<ver>/containers/{id}/restart`（动作类 15s；`t` 不带 = 引擎缺省 10s）——204 ⇒ 200；404 ⇒ 404 `not_found`；余 ⇒ 502；审计 `container_restart`。
  - **强杀**（`POST …/containers/:containerId/kill`）：`POST <base>/v<ver>/containers/{id}/kill`（SIGKILL——信号可选不做）——204 ⇒ 200；**引擎 409（未运行）⇒ 400 人话**（「容器未在运行——无需强杀」——≠ stop 的 304 幂等语义）；404 ⇒ 404；余 ⇒ 502；审计 `container_kill`。
  - **用量**（`GET …/containers/:containerId/stats`）：并发两读——`GET <base>/v<ver>/containers/{id}/stats?stream=false&one-shot=true`（CPU/内存）+ `GET …/containers/{id}/json?size=1`（磁盘）⇒ `{ usage: { cpuPercent, memUsed, memLimit, diskRw, diskRoot, sampledAt } }`
    ——`cpuPercent` = `cpuΔ/systemΔ × 在线 CPU 数 × 100`（一次采样基线不足 ⇒ null——如实）；磁盘 = `SizeRw`（可写层）∥ `SizeRootFs`；**零审计**（读动作）。
  **镜像族三件**（按节点）：
  - **列表**（`GET …/images`）：`GET <base>/v<ver>/images/json`（读类 3s）⇒ `{ images: [{ id, tags, size, created }] }`（`RepoTags` 缺/null ⇒ `[]`——UI 呈「无标签」）；零审计。
  - **拉取**（`POST …/images/pull`）：入参 `{ image }`（形 = `名[:标签]`——标签 = 末个 `/` 之后的末个 `:` 起；缺省 `latest`；含 `@`（digest 形）⇒ 400 人话）⇒ `POST <base>/v<ver>/images/create?fromImage=<名>&tag=<标签>`（**超时 10 分钟**——沿 agent 工具面同值；同步请求）⇒ 200 ⇒ `{ ok: true, image, tag }`；
    **失败两形皆收**：引擎非 2xx ⇒ 400（携引擎原文）∥ 200 流内 `error`/`errorDetail` ⇒ 400（携引擎原文）；不可达/超时 ⇒ 502；审计 `image_pull`。
  - **删除**（`DELETE …/images`）：入参 `{ ref, force? }`（`ref` = 镜像 id 或 `名:标签`——字符集 `[A-Za-z0-9][A-Za-z0-9._:/@-]*`（禁空白/`?`/`#`/`%`）；缺/空/形非法 ⇒ 400；**走请求体**——镜像引用字符集含 `/`/`:`，路径段路由不兼容——沿 `DELETE /runners/:id` 体参先例）
    ⇒ `DELETE <base>/v<ver>/images/<ref>?force=<0|1>`（缺省 force=0）⇒ 200 ⇒ `{ ok: true, ref }`；引擎 404（无此镜像）⇒ 404 `not_found`；**409（被容器引用/多标签）⇒ 400 人话**（携引擎原文 + 处置句）；余 ⇒ 502；审计 `image_delete`（detail 键集 = `accounts/ACCOUNTS.md` §2.1）。
  **本批自加项（逐条带理由）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 日志 tail 有界（缺省 200 ∥ 1–2000）+ 文本截断 256 KiB | 设计自加 | 读类 3s ∥ 连接不悬停；日志体量无界 | 整取 ⇒ 大日志拖死连接/界面冻结 |
  | ② | 非 TTY 多路复用流解复用 | 设计自加 | 创建面不设 Tty ⇒ 引擎返回 8 字节帧头流；不解 ⇒ 输出带二进制帧头残渣 | 不解复用 ⇒ 日志窗乱码 |
  | ③ | 拉取专用超时 10 分钟 + 失败两形皆收（非 2xx ∥ 流内 error） | 设计自加（沿 agent 工具面同值） | 取像耗时可分钟级；引擎错误可能藏流内——两形皆收 = 不对引擎行为下注 | 15s ⇒ 正常拉取必超时；不扫流 ⇒ 失败被当成功 |
  | ④ | 镜像删除 `ref` 走请求体 + `force` 缺省 false（UI 勾选才强删） | 设计自加 | 引用字符集含 `/`/`:` ⇒ 路径段不兼容；强删爆炸半径更大（删他物所依） | 路径参数 ⇒ 带斜杠引用不可达；缺省强删 ⇒ 误删面扩大 |
  | ⑤ | 强杀 409 ⇒ 400（非幂等成功） | 设计自加 | stop 的 304 是引擎给的幂等语义；kill 无此语义——如实报（未运行 = 无事可杀） | 假装成功 ⇒ 读数骗人 |
  | ⑥ | 用量 = 一次采样（`one-shot`）+ 磁盘 = inspect `size=1` | 设计自加 | 不加采样器/时序库（新机制——KD-SV-92）；读数如实（基线不足 ⇒ null） | 自建采集面 ⇒ 新机制（本批不做） |

- **底座可换（sandbox-exec-rebuild 批 · 设计修订轮增补——用户 2026-10-13 21:32「底座那个做完整功能吧」；机制全文 = `sandbox/EXECUTION.md` §8 底座可换块）**：管理员可为**每个工作区**选定自定义**底座镜像**（用户原话「用户可能会需要选择他自己需要镜像做底座」），我方组件（核 + 壳）叠加上去（**节点侧派生构建**）；**缺省 = 标准镜像（`settings.image`——零行为变化）**；**成员不挑底座**（管理面专属——用户禁项）。
  **定形**：① **底座指定形** = 镜像引用（`名[:标签]`——`parseImageRef` 同判）+ **私有仓凭据**（server 全局——按注册表主机）+ 校验三腿（形校验（400 零外呼）∥ 存在性（节点镜像店——缺 ⇒ 拉取）∥ 前提（构建期校验层——乙：Node 随包带；glibc 系，musl/Alpine 如实拒））；
  ② **绑定与生效** = `sandbox_workspaces.base_image`（NULL = 标准；写面 = `PATCH …/workspaces/:id` 的 `baseImage` 键——`null` = 恢复标准；**生效 = 下次建盒/重建**（沿资源覆写口径；重建径 = 既有「轮换 key」））；
  ③ **派生 tag** = `thincoder-sandbox:base-<hash12>`（内容寻址 = `sha256("<base 引用>|<底座镜像 Id>|<标准镜像 Id>")` 前 12 hex）——缓存（tag 在场即采用）与重建触发（Id 变 ⇒ 重建）零版本比对机制；
  ④ **前提 = 乙（Node 随包带——用户 2026-10-13 22:38 裁）**：取件段 `COPY --from=<标准镜像>` 补 node 运行件（供体 = 标准镜像——本就必在节点，零新增前置）；glibc 系限定（musl/Alpine 如实拒——校验层判）。
  **复用面 ∥ 新增面分列**：**复用** = 镜像列表/删除（派生像 = 普通镜像——原生可见可删；在用 ⇒ 409 ⇒ 400 人话）∥ 拉取（底座获取径——手动拉取命中也注入凭据；一键拉取/认源照常）∥ 镜像源族（目录/标签浏览辅助选引用——零改）∥ 标准镜像契约（件位单源——零第二核源）∥ 主机凭据基建（`credential-crypto.mjs` 加解密 ∥ 掩蔽 ∥ 审计形）；
  **新增** = 派生构建（`derive.mjs`——节点侧 `POST /build`：上下文 = 单 Dockerfile tar ∥ 多阶段 `COPY --from=<标准镜像>` 取件 ∥ 构建零网络）∥ 私有仓凭据面（`registry_credentials` 表 + 四端点 + 拉取注入）∥ `base_image` 列与绑定写面 ∥ 控制台两卡（`webui/SANDBOX.md` §2.1①——标签②）。
  **审计** = 四 kind（`workspace_base` ∥ `image_derive` ∥ `registry_credential_set` ∥ `registry_credential_revoke`）+ `image_pull` 增 `auth` 键（成事才落——缓存命中/失败不落）；键集单源 = `accounts/ACCOUNTS.md` §2.1。
  **披露**：派生真机可用依赖标准镜像件位契约（`/opt/thincoder/app`——member-face 批落地）∥ 底座 tag 移动 ⇒ 节点本地旧像采用（追新 = 重拉后派生）∥ 派生同步请求（最坏 ≈20 分钟 = 拉取 10 + 构建 10）∥ 逐节点各自派生（tag 内容寻址保证同源）∥ 凭据只及拉取（目录/标签读取仍匿名）。

- **镜像源族（sandbox-image-sources 批；台账 #1274；用户 2026-10-11 09:17 四点 + 09:19 预选）**：控制台管**远程镜像源清单**（增/删/改/列 + 常用源预选）∥ 对可达源列镜像目录（仓库 ∥ 标签）∥ 关键词过滤（本地镜像表 ∥ 源目录清单）。
  **拉取行为零改**（仍由节点引擎拉取——源不写节点 dockerd 配置 ∥ 系统零隐式注入（引用组装仅随选定态——见下「拉取认源」块） ∥ 零自动选源）；端点七条 = `gateway/API.md` §2.5（镜像源七行）；存储 = `image_sources`（v15——`store/STORE.md` §2 v15 段）；
  UI 落点 = `webui/SANDBOX.md` §2.1①；审计 kind 单源 = `accounts/ACCOUNTS.md` §2.1（型面计数零增——十三型不变）。
  **源清单（四端点 + 预选一）**：
  - **列**（`GET /api/admin/sandbox/image-sources`）：`{ sources: [{ id, name, address, kind, createdAt }] }`；
    `kind` = **按地址派生**（`hub` ⇔ 主机 ∈ Hub 四别名（`docker.io` ∥ `index.docker.io` ∥ `registry-1.docker.io` ∥ `hub.docker.com`）∥ `hub-mirror` ⇔ 主机 ∈ Hub 镜像两主机（`docker.m.daocloud.io` ∥ `docker.1ms.run`——走查轮 2026-10-11 甲）；余 ⇒ `v2`）——派生不入库（单源 = `address`，零漂移）；零审计（读动作）。
  - **增**（`POST …/image-sources`）∥ **改**（`PATCH …/image-sources/:id`）∥ **删**（`DELETE …/image-sources/:id`）：增/改入参 `{ name, address }`（改 = 键级——出现键 = 应用）；
    ⇒ 200 `{ source }`（删 ⇒ `{ ok: true }`）+ 审计行（`image_source_add` ∥ `image_source_update` ∥ `image_source_delete`——detail 键集 = `accounts/ACCOUNTS.md` §2.1）；不存在 ⇒ 404；形非法/撞名/撞址 ⇒ 400（库零变）。
  - **形**：`name` = 非空（≤40 字符；首尾空白 trim）；`address` = `[http://|https://]主机[:端口]`（缺 scheme ⇒ 补 `https://`；**含路径/查询/空白 ⇒ 400**）；**名与址各自唯一**（撞 ⇒ 400 人话）。
  - **常用源预选**（用户 09:19）：静态表（server 端单源——沿 provider 预设先例 KD-SV-17）；`GET …/image-sources/presets` ⇒ `{ presets: [{ name, address }] }`；**表单只回填名 + 址两字段**（零隐藏语义）；
    清单七条（随设计轮维护——源站关停/换址频繁，需求 ① 原话口径）：Docker Hub（`docker.io`）∥ GitHub Container Registry（`ghcr.io`）∥ Quay（`quay.io`）
    ∥ 阿里云 ACR（`registry.cn-hangzhou.aliyuncs.com`）∥ 华为云 SWR（`swr.cn-north-4.myhuaweicloud.com`）∥ Docker Hub 镜像（DaoCloud——`docker.m.daocloud.io`）
    ∥ Docker Hub 镜像（1ms.run——`docker.1ms.run`）（2026-10-11 实走补——该源实拉实证 `.6` 200·10.4s·119MB，用户实走发现其缺表；同步 = 代码表第 7 条）。
  **源目录读取（两端点——server 直连源）**：
  - **仓库目录**（`GET …/image-sources/:id/catalog`）∥ **标签清单**（`GET …/image-sources/:id/tags?name=<仓库>&n=<N>`）：读类预算 **10s**（跨公网——**逐调用**口径（挑战链逐跳各计）；沿探活/发现家族；非节点面 3s）；**与节点零涉**（不查沙盒可用性门）。
  - **v2 面**：目录 = `GET <base>/v2/_catalog?n=<N>` ∥ 标签 = `GET <base>/v2/<name>/tags/list?n=<N>`；`name` 形 = 仓库名（小写字母数字 + `._-/` 分隔——形非法 ⇒ 400 **零外呼**；`..`/`?`/`#`/空白/大写 ⇒ 拒（防路径穿越））。
  - **Hub 面**（`kind=hub`）：目录 ⇒ **不支持**（`unsupported`——Hub 官方无全站目录 API，如实报）；标签 = `GET https://hub.docker.com/v2/repositories/<ns>/<repo>/tags?page_size=<min(N,100)>`（**API 主机 = `hub.docker.com`**，与登记址无关；该主机不可达 ⇒ 如实 `unreachable`）；**裸名补 `library/`**（`nginx` ⇒ `library/nginx`——Hub 命名空间惯例）。
  - **匿名 Bearer 挑战**（本机实测 2026-10-11：ghcr ∥ quay ∥ ECR Public ∥ ACR ∥ SWR 皆 401 + `WWW-Authenticate: Bearer`）：401 且挑战可解析 ⇒ 取 `realm?service=&scope=`
    （目录 = `registry:catalog:*` ∥ 标签 = `repository:<name>:pull`）⇒ 匿名换 token（响应键取 `token` ∥ `access_token`）⇒ **携 `Bearer` 复读一次**；**零凭据**（私有源 = 如实拒——本批零凭据面；§15）。
  - **有界**：`n` 缺省 200（范围 1–1000；越界/非数 ⇒ 400）；`truncated` = 远端还有下一页（v2 = `Link: …rel="next"`（实测在） ∥ Hub = `next` 非空）；**不翻页**（有界首页——§15）。
  - **读数形**（自含状态——沿 `/api/admin/proxy/test` 先例；远端事实分类不套统一信封）：成 ⇒ 200 `{ ok: true, kind, repositories ∥ tags, truncated, ms }`；
    败 ⇒ 200 `{ ok: false, error: { kind, message }, ms }`——`kind` ∈ `timeout` ∥ `unreachable` ∥ `auth_required` ∥ `unsupported` ∥ `bad_response`；**空列表非错误**（实测 quay 匿名目录回 `{"repositories":[]}`——如实呈空态）；零审计（读动作）。
  **控制台面**（UI 定形 = `webui/SANDBOX.md` §2.1①）：镜像源卡（源表 + 增/改/删弹窗（含预选下拉）+ 目录浏览窗（仓库列表 ∥ 标签列表——两处过滤输入））+ 本地镜像表过滤输入（`views-sandbox-images.mjs`）；一键拉取（sandbox-image-quick-pull 批——本块 ⑤ 项）= 目录窗行动作（行尾「拉取」钮 ⇒ 节点选单 ⇒ 预填既有拉取窗）；拉取认源（sandbox-pull-by-source 批）= 拉取窗「经由源」选单（选定 ⇒ 引用按源组装；不选 = 原样——见「拉取认源」块）。
  **本批自加项（逐条带理由——设计侧提议，非用户口径）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 匿名 Bearer 挑战换取（无凭据） | 设计侧提议 | 实测：公开源（ghcr ∥ quay ∥ ECR ∥ ACR ∥ SWR）目录与标签面**均**以 Bearer 挑战应答——不换取则预设清单多数源恒「需认证」 | 仅 Hub 面与匿名开放的自建源可用——② 名存实亡 |
  | ② | 源清单 = **server 全局**（非按节点） | 设计侧提议 | 目录读取发生在 server（server → 源）；按节点 = 清单 × 节点数且复制维护；拉取仍走节点（机器侧零改） | 同一源重复登记；「在哪个节点上浏览」反成负担 |
  | ③ | 目录/标签有界首页（`n` ≤1000 + `truncated`） | 设计自加 | 远端集合可无界（Hub 单镜像 1339 标签——父侧实测）；读类 10s 不悬停 | 整取 ⇒ 大源拖死连接/界面冻结 |
  | ④ | 目录浏览窗过滤 = 前端（零新端点） | 设计自加 | 已载集合上过滤 = 纯前端（沿审计/用量页过滤先例）；远端无过滤 API | 服务端过滤端点 ⇒ 伪能力（远端不参与），徒增面 |
  | ⑤ | 源目录「一键拉取」（节点选单 + 预填拉取窗） | 设计侧提议——**用户 2026-10-11 13:18 裁为做**（sandbox-image-quick-pull 批——台账 #1276；机制 = §3 一键拉取块） | 浏览 → 取用的自然收口（免手抄引用）；复用既有拉取窗（零新端点） | 用户手抄 `<host>/<repo>:<tag>`（错抄 = 白拉一次）；退候选 B ∥ 隐式取节点 ⇒ 拉错机（§14 KD-SV-99） |

- **一键拉取（sandbox-image-quick-pull 批——台账 #1276；用户 2026-10-11 13:18 裁「要」；需求 38 ④ ∥ AC-38 ④）**：源目录浏览窗仓库/标签行尾加「拉取」钮 ⇒ 选节点 ⇒ 打开**既有拉取窗**（引用已预填——预填后可改）⇒ 确认即走**既有拉取径**（`POST …/runners/:id/images/pull`——§3 镜像族三件）。
  **拉取行为零改**（沿 KD-SV-96 围栏句——sandbox-pull-by-source 批收正：源不写节点 dockerd 配置 ∥ 系统零隐式注入 ∥ 零自动选源；选定态组装 = 「拉取认源」块）——实读读数：`image-routes.mjs` **132**（拉取路由）∥ `docker.mjs` **327**（引擎调用——2026-10-11 实测现读）；两档本批零触；既有窗行为零改；增量 = 导出 + 可选预填参 + 「目标节点」行（`views-sandbox-images.mjs` 实读 **132** ⇒ ≈+6——§5）。
  **「拉去哪台节点」裁定 = 候选 A（点钮先出节点选单）**（理由与代价 = §14 KD-SV-99）：理由 = ① 源清单 = server 全局（浏览窗无节点上下文）——隐式目标 = 隐藏状态；② 拉取必落某节点 ⇒ 显式选 = 所见即所拉；③ 选单读数复用运行面概览（读时读——零新机制）。不做的代价 = 手抄引用 + 不知去哪台 ⇒ 功能归零；退候选 B ⇒ 「禁用」理由指向看不见的背景态；隐式取节点 ⇒ 无声拉错机（目标机磁盘/带宽被占）。
  - 可用态 = 目录窗打开即读一次 `/api/admin/sandbox/overview`（读时读——零新端点）；≥1 在线节点 ⇒ 钮可用；无节点 ∥ 全离线 ⇒ **禁用 + 一句人话**（复用运行面文案 `admin.sandbox.noNodes`/`admin.sandbox.allOffline`——零新键）；概览读败 ⇒ 禁用 + `mapError` 就地人话。
  - 点钮 ⇒ **节点选单**（在线节点行——名 + 地址；可点行；题「拉取到节点」）⇒ 选节点 ⇒ 既有拉取窗（预填在场 ⇒ 窗内附「目标节点：{name}」行）。
  - 单例（`modal.mjs` KD-SV-31）：开选单 ⇒ 目录窗按「开新先关旧」自动关闭（拉取成后如需续览 ⇒ 重开目录窗）；拉取成 ⇒ 该节点镜像表（前端已载）重取——列表上新，页注入回调；无服务端缓存面。
  **预填逐值**（引用形 = `<主机>[:<端口>]/<仓库>:<标签>`）：
  - 地址**去 scheme**（`http://`/`https://` 剥除——引擎 `fromImage` 引用不带 scheme）；**含端口**逐值保留（如 `10.0.0.5:5000/ns/repo:tag`）。
  - **Hub 面（`kind=hub`）主机统一 `docker.io`**（登记址四别名任一 ⇒ 同此形——沿该面既有收正「API 主机 = `hub.docker.com`，与登记址无关」；`hub.docker.com` 为站点主机非注册表主机，逐值保留会产出引擎不可拉的引用）。
  - 仓库名 = 列表原名（Hub 面裸名按读取面惯例已补 `library/`）；标签 = 标签行所取标签；**仓库行 ⇒ `:latest` 显式**（不依赖服务端缺省径——零隐藏）。
  - 预填**非锁定**（窗内可改——确认值 = 所见值）；预填 ≠ 可达保证（节点侧引擎照拉——失败按既有两形如实报）。
  **零新端点**（四读数皆既有：概览 ∥ 目录 ∥ 标签 ∥ 拉取）；**审计 = 既有 `image_pull`**（服务端既有行——零新 kind；型面计数零增——十三型不变）。

- **拉取认源（sandbox-pull-by-source 批——台账 #1281；用户 2026-10-11 18:15 裁「A」；需求 38 ⑤ ∥ AC-38 ⑤）**：拉取窗加**「经由源」**——选定源 ⇒ 本次拉取的引用按该源组装（拉取仍由节点引擎执行）；不选 = 引用原样（现态）。
  **由来**（如实）：用户实测「加了源，拉取不认它」+ 父侧实走发现 Hub 镜像类源（无全站目录 ⇒ 目录窗零行）在界面上无拉取入口——本面 = 补上源的拉取消费面。
  **控件形**（`views-sandbox-images.mjs` 拉取窗）：引用输入之上加一行选单（`select`——首项「不选（原样）」+ 各源一项，项文 = 源名）；「目标节点：{name}」行**恒显**且同窗共存（手动径 = 所展开节点；预填径 = 选单所选节点——P1 已裁采纳，用户 2026-10-11 18:33）；源清单**读时读**（开窗读一次 `GET /api/admin/sandbox/image-sources`——零新端点 ∥ 零缓存）。
  **组装逐值**（选定源 ⇒ 对输入原文组装**一次**——纯函数 `pullRefWithSource`（`views-sandbox-images.mjs` 新导出——窗侧；与 `pullRefFor` 值规则同口径）；引用形 = `<主机>/<仓库路径>:<标签>`）：
  - **主机** = 源地址**去 scheme**（`http://`/`https://` 剥除——引擎引用不带 scheme）；**含端口逐值**保留（如 `10.0.0.5:5000`）；**Hub 面（`kind=hub`）主机统一 `docker.io`**（登记址四别名任一 ⇒ 同此形——沿 ④ 预填同口径）。
  - **仓库路径** = 原文剥除**已带主机段**（判据 = **引擎同口径**：首段含 `.` ∥ 含 `:` ∥ = `localhost`——所见与引擎判读一致）；Hub 面剥后**裸名**（无 `/`）⇒ 补 `library/`；**Hub 镜像面（`kind=hub-mirror`）同规则**（裸名 ⇒ 补 `library/`——走查轮 2026-10-11 甲；daocloud 裸名 blob 404 ∥ `library/` 10.7s 拉成）；余 v2 面原样（不自作补——自建/云源命名空间由用户负责）。
  - **标签** = 原文有 ⇒ 逐值保留（判据与既有拉取形同口径：**末个 `/` 之后的末个 `:` 起**——含端口源的首段 `:` 属主机段、不误读）；**无 ⇒ 补 `:latest` 显式**（不依赖服务端缺省径——零隐藏）；**覆盖语义** = 已带主机引用的原主机名剥换为源主机（「经由源」直义）；不选 ⇒ 引用原样（现态）。
  - **不动作与透传**：原文含 `@`（digest 形）⇒ 原样透传（不组装——服务端既有 400 径）；原文为空 ⇒ 不动作（提交仍被既有必填门拦）。
    **实读注**（2026-10-11 本机）：`docker.1ms.run` 裸名与 `library/` 两形清单皆 200（匿名 token 换取后）——**该结论只对 1ms.run 成立**（daocloud 后续走查实读：裸名 manifest 过、blob 段挂 ⇒ 见 `hub-mirror` 规则；原句「Hub 镜像类 v2 源裸名原样可用」已收窄）。
  **所见即所拉 ∥ 提交零改**：组装 = **输入框内可见改写**（可再改——沿「预填非锁定——确认值 = 所见值」口径）；「不选」= 不组装（**单向**——不逆变换输入；要换回 ⇒ 手改或再选源后改）；**提交恒发输入框当刻文本（组装后可见值）** ⇒ 走既有拉取径（`POST …/runners/:id/images/pull` 体 `{image}`——**零改 ∥ 零新端点 ∥ 拉取径单源**；组装 ≠ 可达保证——节点侧引擎照拉，失败两形如实报——KD-SV-94）。
  **组装施加点**（两处——皆可见施加、一次性、幂等；「选定态」= 选单选中某源——显式选定 ∥ 记忆预选）：① 选单变更（选定某源）；② 选定态在场时的输入完成（失焦）；**开窗与提交两处不改写**（预选态非自动改写 ∥ 提交恒发当刻文本；回车提交径先组装后提交——不隐写）。
  **与 ④ 一键拉取的关系（认源态）**：一键拉取调用点**携源**（`source` 参——`{ id, name, address, kind }`）⇒ 预填在场的窗内选单**呈现该源**（认源态——预填逐值与组装同口径）；改选另一源 ⇒ 剥换主机重组装（换镜像源重拉 = 一次改选）；改选「不选」⇒ 输入不动（原样提交）；源已被删 ∥ id 不在清单 ⇒ 选单留不选态（预填照常——拉取不阻断）。
  **手改同步规则**：手改输入 ⇒ 选单**不自动回落**（认源态 = 上次组装所用源——不保证与当刻输入一致；提交恒发当刻文本，拉取不误导）。
  **选择记忆（P2——用户 2026-10-11 18:33 裁为做；来源 = 设计侧提议）**：窗重开**预选上次所选**（形态 = 持久——`localStorage` 单键 `tc_pull_source`（沿语言记忆 `tc_lang` 同法；不可用 ⇒ 静默不记忆）；记忆随选单变更更新（含「不选」）；源清单读成后施加——记忆源 id 不在当刻清单 ⇒ **不选态回落**）；**预选态非自动改写**（只动选单，不动输入）；缺省 = 记忆预选（**首次 = 「不选」**——「不选 = 引用原样」句不变）。
  **可用态两分支**：**无源** ⇒ 选单仅「不选（原样）」+「暂无镜像源」提示（复用 `admin.sandbox.sourcesEmpty`）；**源清单读败** ⇒ 不选态 + `mapError` 人话——**不阻断拉取**（窗口核心功能 = 手输拉取，自治——沿「源面与节点无关」同精神）。
  **零新端点 ∥ 零新审计 ∥ 零新 kind**（源清单读 = 既有端点；拉取 = 既有端点/既有 `image_pull` 行）。
  **UX 反问面（用户 18:17 令——结论）**：用户日常拉像路径两条（实读代码）——① 一键拉取（源卡 ⇒ 目录窗 ⇒ 行「拉取」⇒ 节点选单 ⇒ 预填拉取窗；**Hub 类源此径不可达**——零仓库行，本批由来）∥ ② 手输（镜像区 ⇒ 拉取窗 ⇒ 手抄 `<主机>/<仓库>:<标签>`——错抄 = 白拉一次）。
  加源后最省事路径（本批后）：镜像区 ⇒ 拉取窗 ⇒ 选源 ⇒ 输裸名（`ubuntu:24.04`）⇒ 组装可见 ⇒ 确认——Hub 镜像类源与自建源同一径；预填径换源重拉 = 一次改选。
  **五点结论**：组装恒可见（非隐藏门）∥ 缺省 = 记忆预选（**首次 = 「不选」**——预选态非自动改写，手输习惯零冲突）∥ 无源/读败不阻断拉取（窗口自治）∥ 认源态（回看即知引用来源——上次组装所用源）∥ 目标节点行恒显（手动径也示去向）。
  **单列提议（自加项——已裁采纳：用户 2026-10-11 18:33 裁 P1 ∥ P2 均为做；来源 = 设计侧提议（UX 反问面导出））**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 拉取窗「目标节点」行恒显（手动径也显示） | 设计侧提议（UX 反问面导出）——**用户 2026-10-11 18:33 裁为做** | 手动径开窗不示去向（弹窗脱离节点展开上下文）；一行成本 | 手滑拉错机无最后一眼 |
  | ② | 「经由源」选择记忆（窗重开预选上次所选——**预选态，非自动改写**；可改；记忆源失效 ⇒ 不选态回落） | 设计侧提议（UX 反问面导出）——**用户 2026-10-11 18:33 裁为做** | 镜像环境（如 `.6`）每次拉像都经源——记忆省一步 | 每次重选一步；不做则零风险 |

- **卷族（sandbox-volumes 批——台账 #1291；用户 2026-10-11 21:18 三件 + 21:22 裁「先按不考虑加挂的原方案开批」；需求 40 ∥ AC-40——已落需求档）**：控制台把节点机上数据卷管到两件——**卷列表**（看得见有什么）+ **删卷防护**（确认窗 + 后果句）；**建容器卷字段只改入口形**（下拉——已有卷可选，也能起新卷名）。
  **卷不落表 ∥ 零自动建卷**（引擎即真源——沿 KD-SV-79/104）：读 = 读时读（`GET /volumes`）∥ 删 = 直调；**建卷归引擎**（Docker 首用即建——我方零建卷调用；真机实读 2026-10-11：**容器创建即建**——`POST containers/create` 携新卷名后 `GET /volumes` 当场见卷，不必启动）。
  **端点两件**（行文 = `gateway/API.md` §2.5）：
  - **列表**（`GET …/runners/:id/volumes`）：`GET <base>/v<ver>/volumes`（读类 3s）⇒ `{ volumes: [{ name, driver, createdAt }] }`——引擎字段如实取（`Name`/`Driver`/`CreatedAt`）；`Volumes` 缺/null ⇒ `[]`；**零审计**（读动作）；不可达/超时 ⇒ 502。
  - **删除**（`DELETE …/runners/:id/volumes/:name`）：动作类 15s——`DELETE <base>/v<ver>/volumes/<名>` ⇒ 204 ⇒ 200 `{ ok: true, name }` + 审计行（`volume_delete`——detail 键集 = `accounts/ACCOUNTS.md` §2.1）；**名形先校验**（引擎卷名形 = 字母/数字起头 + `[A-Za-z0-9_.-]` 续；形非法 ⇒ 400 **零外呼**——防路径段穿越）；
    引擎 404（无此卷）⇒ 404 `not_found`；**引擎 409（在用卷）⇒ 400 人话 + 处置句**（真机实读 2026-10-11：`remove <名>: volume is in use - [<容器 id>]` ⇒ 译「卷正被容器使用——无法删除」+ 引擎原文 + 「先删除或改用该卷的容器」）；余 ⇒ 502。
  **前端面**（UI 定形 = `webui/SANDBOX.md` §2.1①）：卷区 = 节点行展开内（容器区之后——**归属标签①「运行面」**：载体 = 节点展开）；表 = 名 ∥ 创建时间 ∥ 操作（删除）；驱动透传不入列（无插件环境恒 `local`——恒值噪声）、用量不做（引擎列表**不携**用量字段——实读两版 `?size=1` 皆零 `UsageData`；要算须另走 `/system/df` 全量重算——非列表面，需求未点）。
    删除 = 确认窗 + 后果句（「卷内数据一并消失，不可恢复」——`confirmModal` 复用，非原生 `confirm`）；在用卷拒删 = 服务端 400 **就地在窗内呈**（弹窗不关，可重试）；建容器弹窗卷字段 = 选单（节点已有卷 + 「新建卷（手输）」逃逸——选定回填下方卷名，可再改；读败/空表 ⇒ 手输照常不反噬）；**空 = 不挂**（现行为零回归）；**`Binds` 逐值零改 ∥ 零隐式建卷**；容器动作后卷区随取（创建即建卷 ⇒ 清单随动——页装配层重置卷区缓存）。
  **本批自加项（逐条带理由——设计侧提议，非用户口径）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 删卷 = 确认窗 + 后果句（非原生 `confirm`） | 设计侧提议（批档 §1 在案） | 删除不可逆（数据面）；沿 `confirmModal` 先例（删容器/镜像同形）；原生 `confirm` 不可测且排版差 | 一击即删——手滑数据面事故 |
  | ② | 在用卷拒删 = 引擎 409 如实译人话（不前置预检） | 设计自加 | 引擎即真源（KD-SV-79 同族——单源真相）；前置预检（先读容器挂载）+ 后置删除两读有窗口期 | 预检后仍可能被引擎拒（假绿）；双读白增 |
  | ③ | 卷行响应携 `driver`（如实透传）；不做「驱动」列 ∥ 不做用量 | 设计自加 | 引擎字段零成本透传（真机字段在案）；无插件环境恒 `local` = 恒值噪声（AC 三列未点）；用量 = 引擎不携（实读在案） | 自建用量面 = 白增机制；恒值列 = 噪声 |
  | ④ | 卷区落点 = 节点行展开（容器区之后——归属标签①「运行面」） | 设计侧提议（批档在案——按标签归属定） | 卷 = 节点资源（读上下文与容器区同处；建容器弹窗同层）；载体 = 节点展开（与分标签归位块相容） | 独立卷卡 + 节点选单 = 多一层选择面且离容器区远 |
  | ⑤ | 容器动作后卷区随取（页装配层重置卷区缓存） | 设计自加 | 新卷首用即建（真机实读：容器创建即建）⇒ 卷清单随容器动作变动；不随取 ⇒ 容器用了新卷而卷表无它 | 卷表陈旧（用户可见矛盾） |
  | ⑥ | 审计 = `volume_delete` 一行（删卷）；建卷零审计 | 设计自加 | 用户既有「过程留痕」口径（容器/镜像族同族）；建卷 = 引擎行为非我方动作——零审计（如实） | 谁删了哪个卷无据 |

**容器终端（sandbox-container-terminal 批——台账 #1374；用户 2026-10-13 21:11/21:13/21:17 三句：想要终端 ∥ 真终端「自己搓」 ∥ 终端核按可复用件做；本批 = v1 单石）**

- **形态 = 真 pty 会话**（容器内 `bash` 起在**分配 TTY 的 exec 会话**上）：前端自搓终端核（`webui/TERMINAL.md`）→ **WebSocket 双向** → 服务端会话桥 → **Docker exec（`Tty: true`）**；**无降级面**（伪终端降级 = 用户明令不做——验收「能跑 `vim`/`top` 一类全屏 TUI」即真终端判据）。
- **会话链（服务端三步，全走引擎升级连接；KD-SV-175）**：
  ① **读容器**（`GET containers/<id>/json`——读类 3s）：运行态判据（非 `running` ⇒ 建会话即拒，in-band 错误 `container_not_running`）∥
    locale 判据（`Config.Env` 无 `LANG`/`LC_ALL` ⇒ 注入 `LANG=C.UTF-8`——实测基线：POSIX locale 下 `bash` 行编辑把中文按八进制转义回显；KD-SV-179）。
  ② **建 exec**（`POST containers/<id>/exec`——动作类 15s）：体 = `{ AttachStdin: true, AttachStdout: true, AttachStderr: true, Tty: true, Env: ["TERM=xterm-256color"（恒）,"LANG=C.UTF-8"（条件，见①）], Cmd: ["/bin/sh", "-c", "if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi"] }`。
     **实测（2026-10-13 真机 `10.0.0.6`，Docker 29.1.3 ∥ API 1.44+）**：`Tty: true` ⇒ 裸字节流（无 8 字节复用帧）∥ `Env` = **并入容器 env**（`PATH` 保留——实测 5 键 ⇒ 6 键）∥ 容器未运行 ⇒ **409**（`container <id> is not running`）∥
     无此可执行 ⇒ 建 exec 仍 201、**start 200 且流内原文**（`OCI runtime exec failed: …`）+ 退出码 127——原样落终端，零加工。
  ③ **起 exec（升级连接）**（`POST exec/<execId>/start` 携 `Connection: Upgrade` + `Upgrade: tcp`——体 `{ Detach: false, Tty: true }`）⇒ **`101` + 裸双工 socket**。**实测口径**：不带 `Upgrade` 只能收输出、**stdin 无法流式**（请求体不 end 则无响应头）⇒ 此链 `fetch` 面不可达 ⇒ 服务端走 `node:http` 劫持（`docker-exec.mjs`（拟新增））。
- **传输层（最小 WebSocket 服务端——`gateway/ws.mjs`（拟新增））**：标准握手（`Sec-WebSocket-Accept` = `base64(sha1(key + GUID))`）∥ 帧编解码（掩码位/两档扩展长度/分片重组/控制帧）∥ 上界（单帧 ≤ 1 MiB ∥ 解码缓冲 ≤ 4 MiB——越 ⇒ 协议错收口）；
  **实测**（同一件对 node 内建 `WebSocket` 客户端）：握手 101 ∥ 文本/二进制双向 ∥ close 1000 ∥ **服务端 ping ⇒ 客户端自动 pong**。挂点 = `gateway/server.mjs` 增 `upgrade` 挂点（`server.on("upgrade", …)`——未匹配路径 ⇒ 404 后断开）。
- **尺寸（实测口径）**：`POST exec/<execId>/resize?h=<rows>&w=<cols>`——**就绪前调用 ⇒ 500**（`timeout waiting for exec session ready`——start 后即刻调用亦可能撞此窗）⇒ 客户端首帧 `resize` 到达即记（挂起），**就绪后施加一次**，此后逐帧直发；初值缺省 = 80×24（客户端未给）；合法域 = cols 1–500 ∥ rows 1–300（越界/非法 ⇒ 忽略——不当帧、不发 resize）。
- **帧协议（本档 = 单源；消费端 = `webui/TERMINAL.md` §2.5）**：**二进制帧 = pty 字节**（双向——上行 = 键盘/粘贴 UTF-8 字节；下行 = 引擎字节原样）∥ **文本帧 = JSON 控制**（下行 `{"t":"ready","cols","rows"}` ∥ `{"t":"exit","code"}` ∥ `{"t":"error","code","detail?"}` ∥ `{"t":"pong"}`；上行 `{"t":"resize","cols","rows"}` ∥ `{"t":"ping"}`）；
  断开只由 WS close 表达（零 `bye` 帧）。
- **心跳（KD-SV-177）**：服务端每 30s 发 **WS ping 帧**（客户端自动 pong——实测）⇒ **60s 内无 pong 且无上行帧 ⇒ 判死**（走收口）∥ 客户端每 30s 发文本 `{"t":"ping"}`（浏览器不能发 ping 帧——文本帧为客户端侧心跳载体）⇒ 服务端回 `{"t":"pong"}`。
- **断线/收口语义（KD-SV-178）**：任一断开（客户端关窗 ∥ 网络断 ∥ 心跳判死 ∥ 引擎侧流结束 ∥ 服务端停机）⇒ 服务端收口三件 = ① **向 pty 写 `\x04`（EOF）** ② **关 Docker 侧连接** ③ **关 WS**（`exec_exit` ⇒ 1000 ∥ 余 ⇒ 1001）；收口幂等（一次）。**先写 EOF 的理由（实测）**：交互壳在提示符处收 `\x04` 即退（`Running: false`）；而**半关 socket ∥ 直接销毁都不断进程**（实测：销毁后仍 `Running: true`）。
  **如实披露（边界）**：**前台进程不追捕**——Docker exec 无 kill 面（`docker exec -it` 同此）；实测 `/exec/<id>/json` 的 `Pid` = **宿主命名空间 pid**（容器内 `kill` 不可达——`kill: No such process`）⇒ 断开时正在跑的前台程序（`vim`/`top` 类）可能**继续运行至自身退出**（容器 = 一次性沙盒——停/删容器即清场）。**会话不持久化**（无 tmux 语义/无重放——重连 = 新会话）。
- **结束与退出码**：引擎流结束 ⇒ 读 `GET exec/<execId>/json` 取 `ExitCode` ⇒ 下行 `{"t":"exit","code"}` ⇒ WS close(1000)；读败 ⇒ `code: null`（照发）。
- **审计（KD-SV-180）**：两 kind（走 `sandbox_event`——**kind 非枚举 ⇒ 零 CHECK 改**）：`terminal_open`（detail 键集 = `kind`+`runnerId`+`containerId`+`cols`+`rows`——就绪时值）∥
  `terminal_close`（detail 键集 = `kind`+`runnerId`+`containerId`+`reason`+`durationMs`；`reason` 四值 = `client_close` ∥ `exec_exit` ∥ `error` ∥ `server_stop`）。
  **pty 内容零落库零日志**（终端字节不截流不落盘——零秘密面）。
- **判权与门（KD-SV-180）**：升级请求**先判**——`requireAdmin`（cookie 会话 `tc_session`；无 ⇒ **401** ∥ 非 admin ⇒ **403**——皆在 101 之前，响应沿错误形）；**同源门** = `Origin` 头存在且与 `Host` 同源（异源 ⇒ 403；缺 `Origin`（非浏览器客户端）⇒ 放行——判权仍为会话）；节点不存在 ⇒ **404**（101 前）。
- **in-band 错误码（四条——文案归前端 `t()`）**：`container_not_running`（非运行容器——读容器即拒 ∥ 建 exec 409（窗口期容器被停））∥ `engine_unreachable`（Docker 不可达/超时）∥ `exec_failed`（引擎拒 exec——非 2xx）∥ `session_closed`（零发射——前端兜底词汇；收口走 WS close 1000/1001）；`detail` 可选 = 引擎原文（英文）。
- **并发与会话上限**：无上限（同容器多会话 = 多 exec，各自独立）；同容器**控制台窗单例**（前端面——`webui/SANDBOX.md` §2.1①）。
- **停机**：服务端停止 ⇒ 在飞会话全量收口（`reason` = `server_stop`）——升级后的 socket 生命周期由终端会话表持有（不依赖 HTTP 层自动断）。
- **本批自加项（逐条带理由——设计侧提议，非用户口径）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 心跳 = 服务端 30s WS ping / 60s 判死 + 客户端 30s 文本 ping | 设计自加 | 半开连接（合盖/断网）不会自己上报 ⇒ 无心跳则会话与 exec 进程悬置 | 死会话堆积；断线用户界面无感（不知已断） |
  | ② | 收口先写 `\x04`（EOF）再关流 | 设计自加 | 实测：`\x04` 使交互壳在提示符处即退（半关/销毁都不能）；成本 = 一写调用 | 每次断开留一个悬置壳进程 |
  | ③ | 注入 `TERM=xterm-256color`（恒）∥ 条件注入 `LANG=C.UTF-8` | 设计自加 | 实测：无 UTF-8 locale 时 `bash` 行编辑以八进制转义显示中文（CJK 验收不达）；条件注入避开覆盖容器自带 locale 意图 | 中文输入显示错乱（验收句不达） |
  | ④ | 审计两行（开/关）+ `durationMs` | 设计自加 | 沿容器/镜像族「过程留痕」口径；终端 = 敏感动作（谁在何时进了哪台容器） | 谁进过哪台容器无据 |
  | ⑤ | `Origin` 同源门 | 设计自加 | 跨站页面可对 WS 发起带 cookie 的握手（REST 面有 SameSite 兜底；WS 面无 CORS 预检）——一号成本 | 跨站终端会话面（安全面缺口） |
  | ⑥ | 帧上界（1 MiB/帧 ∥ 4 MiB 缓冲） | 设计自加 | 自搓帧解析必须有界（无界缓冲 = 内存面风险） | 大帧/畸形流可拉爆服务端内存 |
  | ⑦ | 停机收口在飞会话 | 设计自加 | 升级 socket 不走 HTTP 层自动断——须显式收 | 停机留悬挂 exec 进程与 socket |

**主机凭据（admin-chat-creds-merge 批——台账 #1326；用户 2026-10-12 裁：SSH 凭据进管理面 chat ∥ 托管接入将来并入 chat ∥ 设主机表管 SSH 凭据）**

- **裁定：主机表 = `sandbox_runners` 扩展（不新建第二张机器表——KD-SV-133）**。理由：① **单一权威**——本表已是机器登记面（名 ∥ 地址 ∥ 状态 ∥ 自检读数），一台机器一行；② **既有消费面零改**——`docker` 工具绑定 ∥ 控制台运行面 ∥ 容器/镜像/卷族三路由皆读本表（列增量 = 加性）；③ **同一寻址**——`exec`（SSH）与 `docker`（Docker API）共用「名 ∥ 地址」解析（单源 = `registry.runnerByRef`）；④ **迁移面小**——七列 `ALTER` + 一次回填（见下）。
- **新增七列**（v18）：`ssh_port`（INTEGER，NULL = 未设——写面缺省 22）∥ `ssh_user`（TEXT，NULL）∥ `auth_kind`（TEXT，NULL；值域 `key` ∥ `password`——应用层校验）∥
  `secret_cipher`（TEXT，NULL = 无凭据；AES-256-GCM `iv|tag|ct`——KD-SV-84 同件）∥ `sudo_cipher`（TEXT，NULL）∥ `credential_state`（TEXT NOT NULL DEFAULT `'none'`；`none` ∥ `sealed` ∥ `revoked`——应用层校验）∥ `credential_updated_at`（TEXT，NULL）。
  **密列零回显**（响应/日志/审计/帧四面零秘密字段——沿既有口径）；行形增 `ssh: { user, port, authKind, credential: { state, updatedAt } }`（`runnerView`）。
- **SSH 目标主机 = 行 `address` 的 host 部分**（解析复用地址归一规则）——**不另设 `ssh_host` 列**（同机同址；第二地址字段 = 漂移源）。
- **凭据写面（两端点——行文 = `gateway/API.md` §2.5 已落）**：`PUT …/runners/:id/credential`（设/改；体 `{ sshPort?, sshUser, auth: { kind, secret }, sudoSecret? }` ⇒ 200 行形，零秘密）∥ `DELETE …/runners/:id/credential`（撤销 = 密列零化 + `state='revoked'`；无凭据在留 ⇒ 400）。
  审计两 kind（走 `sandbox_event`——**kind 非枚举 ⇒ 零 CHECK 改**）：`host_credential_set`（detail：`runnerId` ∥ `sshUser` ∥ `authKind`——零秘密）∥ `host_credential_revoke`（detail：`runnerId`）。
- **凭据入口 = 结构化弹窗（表单——唯一入口；KD-SV-134）**：两挂载点、**同一弹窗件、同一端点**——① 沙盒页·运行面节点行动作（权威管理面）② 对话页顶栏钮（会话内录入）；对话页**不列第二张主机表**（agent 可读 `runners.list` 行形）。
  **聊天文本不是凭据通道**（秘密零入消息行 ∥ 模型上下文 ∥ 回放——既有掩蔽纪律 KD-SV-114 同精神）；请求录入路径 = 弹窗（简报纪律句同拍——`agent/ADMIN-AGENT.md` §11）。
  **与 §16.3 sk 面分工**：主机 SSH 凭据 = 用户提供的机器秘密（表单入 ∥ 密文存 ∥ 永不回显）；管理会话 sk = 服务端自持、登录自动签发（`agent/ADMIN-AGENT.md` §16.3——无人工入口、不经本弹窗）——两面互不引用。
- **复用单源**：传输 = `sandbox/ssh.mjs`（`createSshExecutor`）；加解密 = `thincoder-server/src/store/credential-crypto.mjs`（已落——2026-10-13 复核在盘；**单源，绝不并存两份**）；
  绑定解析 = `sandbox/registry.mjs` `runnerByRef`（自 `agent/chat-tools.mjs` `resolveNode` 抽出——`docker`/`exec` 两工具同用）。
- **历史遗留（`sandbox_onboarding` 停机留史——2026-10-14）**：run 行 → 主机行的凭据移交机制（`keep` 移交 ∥ `burn` 零化）已随任务式退场删除；存量行语义照旧可读（`sealed` ∥ `burned` ∥ `revoked` ∥ `moved`——`'moved'` = 「曾移交」字面；此后真伪以主机行 `credential_state` 为准——主机行撤销后 run 行不复写）；
  v18 回填（存量 `keep` ∧ 成功行按 id 序移交——同 runner 多行后者胜；未接收行新列 NULL/`'none'`）已落库为史——零改写。
- **exec（SSH）进 chat**（工具形/参数 = `agent/ADMIN-AGENT.md` §12）：绑定 = 主机表行；缺凭据 ⇒ 工具级错误（人话指向录入弹窗）；传输 ∥ 掩蔽 ∥ 审计三面 = 单源复用（`ssh.mjs` ∥ `maskSecrets` ∥ `chat_call`）。
  **sudo 口令口径**：命令含 `sudo -S` ⇒ 行 `sudo_cipher` 解出口令经 stdin 喂入（不含 ⇒ 不喂）（单源 = `thincoder-server/src/sandbox/ssh.mjs`：`sudo -S` 读取 stdin 的既有判定）。
- **合并路线（KD-SV-135——终局已达成，2026-10-14）**：装机/主机运维 = 管理面 chat 内动作（`exec`/`docker`/`runners` + 主机表凭据——零新机制、零新端点）；**任务式（run）面退场执行 = 本批**（用户 2026-10-14 裁「撤」——弹窗 ∥ 端点族 ∥ 服务件 ∥ 任务面工具 ∥ 单元测试档删净；`sandbox_onboarding` 表停机留史——§2）。
  `agent/ADMIN-AGENT.md` §13 R71⑥（run 出口改道提请）**撤回注**（不再对 run 改道——避免白做）。
- **被否候选与何故否**：**新建专表**（`sandbox_hosts` + `runners.host_id`）——同一机器两登记面（名/址两处同步、两张清单页）、两套寻址（`exec` 对 hosts ∥ `docker` 对 runners）、迁移面更大（外键链 + 删节点时凭据行处置 + 回填）；
  **凭据留 run 行**（现状）——`keep` 态凭据无消费面（工具面读不到——设计目的落空）+ 凭据随 run 增行堆积；
  **任意地址 `exec`**（不绑表）——机队语义破 + 误打面（沿 `docker` 被否栏）。
- **本批自加项（逐条带理由——设计侧提议，非用户口径）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 凭据常驻 = 随行至撤销（无 TTL/无过期） | 设计自加 | 用户「主机表管凭据」的字面语义（可复用凭据）；撤销 = 显式动作（`DELETE` + 审计） | 每次 `exec` 都要重录（工具面不可用） |
  | ② | `credential_state` 第四态 `'moved'`（CHECK 重建） | 设计自加 | 如实显示（`keep` 成功 ⇒ 凭据在主机表；复用 `burned` 会骗读数——「已零化」实为仍在） | 读数骗人（用户以为凭据已销毁） |
  | ③ | v18 回填移交存量 `keep` 行 | 设计自加 | 单一权威（standing 凭据一处）；不回填 ⇒ `exec` 对已装机主机全不可用 | 存量 `keep` 凭据无消费面（`exec`/主机运维读不到） |
  | ④ | 私钥临时落盘 0600 ⇒ 用毕即删（`finally`） | 设计自加 | 沿任务面口径（`ssh.mjs` 落键形单源——chat 面逐调用建/删，零残留） | 私钥残留于数据目录（第二份凭据面） |

- **连接方式（TLS 档——本增补 #2；用户 2026-10-13 22:43 裁「我其实很喜欢现在这种方式，靠安全组控制，使用简单方便，不过，我也想加上B，只是TLS证书认证，让用户可选。」——A 保缺省 + B 增为可选档）**：连接面 = **节点级二择**——明文（缺省——安全组控制照旧 ∥ 零行为变化）∥ **TLS 客户端证书**（用户可选——「想用时可以开」）；机制全文 = 本块（传输落点 = `sandbox/EXECUTION.md` §2.1）。
  - **形态 = 地址 scheme 单源**：`http://` = 明文 ∥ `https://` = TLS——**不设 mode 列**（列面零冗余；连接方式由 scheme 派生呈现）；写面二择只定**归一档**（裸 host ⇒ 按档补 scheme + 缺省端口 2375/2376）；显式 scheme 与档相抵 ⇒ 400（零静默推断）；不携档 = 明文（缺省零行为变化）。
  - **材料 = 三件（CA 证书 ∥ 客户端证书 ∥ 客户端私钥），用户自备**（不自建 PKI ∥ 不代生成；节点侧 dockerd 的 TLS 服务端配置在机——我方面只做客户端）；私钥 AES-256-GCM 落库（`thincoder-server/src/store/credential-crypto.mjs` 复用——沿 KD-SV-84）；
    **三件零回显**（响应/审计/日志零材料字段；编辑面只回「已设（时间）」∥「未设」态）+ **只进不出**（查看/导出无面——换材料 = 全列覆写，沿 `PUT …/credential` 先例）。
  - **不变量：`https` ⇔ 三件齐**（服务端双向校验——TLS 档缺件 ⇒ 400 ∥ 明文档携件 ⇒ 400；零半档）。
  - **写面两端点**（行文 = `gateway/API.md` §2.5）：① 添加节点（`POST …/runners` 体增 `connection`/`tls`——自检按档走；形非法 ⇒ 400 零外呼）② `PUT …/runners/:id/connection`（编辑/切换——**全列覆写**；**先自检后落库**——失败 ⇒ 库零变）；**关 TLS = 原子**（地址改回 `http` + 材料清零——同事务）。
  - **生效面 = 控制面全谱**（节点自检 ∥ 运行面读数 ∥ 容器/镜像/卷/终端族 ∥ 盒链 ∥ 管理面 chat 的 `docker` 工具）——一律经 `clientForRunner`（材料按行解密后注入传输；明文行零涉）。
  - **先例对齐**：主机凭据面（KD-SV-133/134——加密复用 `credential-crypto.mjs` ∥ 密列零回显 ∥ 全列覆写 ∥ 成事才审计）；**偏离** = 寻址 = 地址 scheme（不设独立 mode 列——被否候选 = mode 列与 scheme 双源漂移）。
  - **审计**：`runner_add` detail 增 `tls` 布尔 ∥ 连接变更 = 一枚 `runner_connection`（detail = kind + runnerId + address + tls 布尔——零秘密）；切换自检失败沿 `runner_selfcheck_failed`（detail 增 runnerId）。
  - **边界（增补 #2 不做）**：材料轮换/续期机制 ∥ 材料查看/导出（只进不出）∥ 节点侧 TLS 服务端配置（在机）。

## 4. 出站规则（单源在本档）

- **两类同表**（需求块）：① **CIDR 规则**（网络层——安全组同形：`allow ∥ deny` × `CIDR` × 端口/协议；零域名依赖）；② **域名规则**（应用层）。**各自可单独使用**（只用 CIDR ∥ 两者并用）。
- **默认全拒**：无允许条目 ⇒ 全拒。
- **默认禁单**：`127.0.0.0/8` ∥ `169.254.0.0/16` = **内置恒拒**（非行——不可改；已裁 U2）∥ RFC1918（`10.0.0.0/8` ∥ `172.16.0.0/12` ∥ `192.168.0.0/16`） ∥ 服务器网段 ∥ 节点自身网段（登记时自动带入）= **种子 deny 行**（`source='default'`——可改可删）。**内网/固定 IP 后端 = 显式加 allow 条目**（零域名依赖——需求块原句；显式 allow 可开种子 deny——§10 U2）。
- **默认单**（开箱可用——**单源 = `sandbox_rules` 种子行**（`source='default'`——可改可删；初始化点 = v11 迁移段一次性写入——不复活）——已裁 U3 = 五条起步）：`registry.npmjs.org` ∥ `github.com` ∥ `*.githubusercontent.com` ∥ `gitee.com` ∥ `*.gitee.com`——装依赖/拉仓无需任何批准。
- **预授权条目（来源 = 项目登记——member-face-chat 批 · 裁定修订轮；台账 #1215）**：登记仓/源 ⇒ 其域名**自动入出站 allow**（`sandbox_rules` 行 `source='project'`——同「默认单」的带入口径）：
  - 首次带入（域名不在）⇒ 行入 + `rulesRev` +1 + 审计一行 `sandbox_rule`（detail 携 `autoImport` + `origin:"project"`）；重复登记 ⇒ 零重行零审计；
  - **机器可读可撤**（= 普通规则行——控制台可改可删，删 ⇒ 即生效；规则面零新种类）；
  - **拉仓与日常 `git fetch/push` 直通**（零人工待批）∥ **非拉仓裸出站仍走待批**（§6 不变）；
  - 理由 = 用户判据（2026-10-13）：「被加为项目成员/仓被登记 = 放行已完成——重复放行 = 冤枉路」。
- **两闸次序**（域名路径——需求块）：域名命中 ⇒ 解析（取全地址）⇒ **每个解析 IP 仍过 CIDR 闸**（否则「白名单域名 + 内网解析」即绕过）。
- **冲突序**：**显式 deny 恒先于 allow**（同一目标两者皆中 ⇒ 拒）；**种子 deny（`source='default'`）≺ 显式 allow**（显式 allow 可开 RFC1918/服务器网段——U2 裁定）；`priority` = 同动作内排序（可读性 + 未来扩展）。
- **强制面（本批——台账 #1248；真机 P2/P3 两 FAIL 的修复）**：求值分三层——**L1 门级不变量**（`127.0.0.0/8` ∥ `169.254.0.0/16`——回环 ∥ 链路本地/云元数据：非行、不可改、不可被任何规则/设置/待批绕过）∥ **L2 默认禁单**（RFC1918 三段 ∥ 服务器自身网段 ∥ 节点自身网段——种子 deny 行：可改可删、可被显式 allow 开——**U2-A 不变**）∥ **L3 用户规则**（显式 deny ≺ 显式 allow ≺ 种子 allow ≺ 默认拒——上条冲突序）。
  三层之外另有一类**内置允许**（**生命线**：盒 → server 网关地址:端口（§7 网络路径）；系统注入 ∥ 非用户规则 ∥ 不可被 L2/L3 覆盖）；**总序 = L1（命中即拒） ≻ 零地址闸（`host` 在场而 `ips` 空 ⇒ 拒——无条件 fail-closed，不得被内置允许放行） ≻ 内置允许（命中即放） ≻ L2 ≻ L3**。
  「强制」的七条定义（真机读数即此面漏出：P2「盒内 curl 宿主 22 口 EXIT=0」∥ P3「`169.254.169.254` 可达」——读数在案 = 批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §6）：
  ① **门位绑定**：闸 = 主机侧网络层（nft 优先 ∥ iptables 备——全量重算幂等，KD-SV-76）**全协议/全端口**——不是只挡 HTTP/代理面（P2 的 22 口 = 该条证据；**两方向 = `forward` ∥ `input` 两条基线链**——盒 → 宿主自身方向经 `input` 入盒链，机制 = `sandbox/EXECUTION.md` §5）；
  ② **双径同判**：域名径（命中 allow ⇒ 解析 ⇒ 每个解析 IP 仍过 CIDR 闸）与直连 IP 径**同判同序**（求值 = `evaluateEgress` 单源）；
  ③ **解析零地址 ⇒ 拒**（fail-closed）：`host` 在场而 `ips` 空 ⇒ 拒——不得以「未解析」放行（本批补 `evaluateEgress` 此句）；
  ④ **命中 L1 ⇒ 即时拒**：零挂起、零待批行（不可批准面——挂起窗只服务 L2/L3 新域；§6）；
  ⑤ **节点自身网段 = 登记时幂等自动带入**（`ensureSegmentDeny`——**调用点 = `routes.mjs` 节点登记 handler**；服务器自身网段 ∥ 节点地址所属 /24；重复登记零重行；旧「join 时带入」随执行面重定而断，实读零调用方）；
  **带入行口径**：首次带入（该段不在）⇒ 行入（`source='default'`）+ `rulesRev` +1 + 审计一行 `sandbox_rule`（detail 明写「自动带入」+ 段值逐值）∥ 重复登记（段已在）⇒ 零重行 ∥ `rulesRev` 零动 ∥ 零审计行；
  **「建盒/重建前复核在场」= ⑥ 的从属动作**（闸就位检查）——落地 = `sandbox/EXECUTION.md` §5（sandbox-exec-rebuild 批——生命周期动作前置复核）；
  ⑥ **闸 = 盒的生命周期前置**：闸未就位（规则未下发 ∥ 下发失败）⇒ **不建盒、不起盒**（控制台明示原因）——「强制」= 前置，不是告警；
  ⑦ **落地范围**：②③ 与 ⑤ 前半（登记时幂等自动带入）的控制面求值与带入接线 = sandbox-outbound-member-face 批已实施（可机检）；**①④⑥ 与 ⑤ 后半（建盒/重建前复核）的主机侧实施（闸本体/下发器）= sandbox-exec-rebuild 批落定**（`sandbox/EXECUTION.md` §5）；P2/P3 真机复证 = 该批收口面（§16 R73③）。
  **段值推导（明写——真机逐值验收面）**：节点段 = 登记地址 host 的 /24；服务器段 = **server 对外地址**的 /24——取值点单源 = 盒 env `OPENAI_BASE_URL` 所用地址（现实现 = `config.host`/`config.port` 组成——`registry.mjs:484`/`:490`）；
  `config.host` 为通配地址（`0.0.0.0`）∥ 非 IPv4 字面 ⇒ **该项零行 + 登记读数如实标（不猜、不静默）**——部署侧以显式地址配置 ⇒ 正常取段；**服务器地址非 IPv4 字面 ⇒ 盒链停**（盒 DNS 注入与内置允许双缺——建盒/起盒拒 + 人话；`sandbox/EXECUTION.md` §3 链前置）。
- **通配**（仅域名规则）：单层左通配 `*.example.com`（恰一级子域）；**禁**裸 `*` ∥ TLD 级（`*.com`）∥ 双通配 ∥ IP 段通配；写面校验（非法 ⇒ 400）；控制台通配条目带醒目标记；审计行记原文。
- **生效**：增删 ⇒ `rulesRev` +1 ⇒ **即生效 ∥ 不重建盒**（需求块）；下发与应用机制 = `sandbox/EXECUTION.md` §5（全量重算幂等 ∥ `nft -f` 单事务 ∥ 外部手改的漂移窗 = 下次下发收正）。
- **审计**：每次增删一行 `sandbox_rule`（type 单源 = §2）。
- **谁能改**：v1 = admin（会话 `requireAdmin`）；#1216② 权限面落地时在**同一守卫点**换判据（接口已留——§9）。

## 5. 工作区生命周期与节点绑定

- **绑定**：工作区 → 节点**绑定**（卷在节点本地盘——绑定即稳定）；多节点/集群化 = 用 Docker 自己的集群（§1）；无可用节点 ⇒ 控制台明示不可用（不降级）。
- **换机重建**：新盒 = 重克隆仓 + 恢复最近 WIP 快照（恢复链 = `sandbox/EXECUTION.md` §3）；无快照 ⇒ 控制台明示「未提交改动将丢」，卷在旧节点保留至人工确认。
- **未提交改动的保护（三层）**：
  1. **卷保留（恒在）**：拆盒（空闲/TTL）**永不删卷**——卷留节点本地盘；
  2. **WIP 快照**（缺省开——已裁 U5）：触发 = 周期（`checkpointEveryMinutes`，缺省 15 分钟）+ 拆前（跨机/换机；销毁不拍——确认门已明示）——server 侧定时器（§1）；取件 = Docker `archive`（全量存档）；存 server（`sandbox_checkpoints`——缺省每工作区保留最近 5 份）；恢复 = 新盒套用（机制全文 = `sandbox/EXECUTION.md` §3）；
  3. **销毁**：删卷 = 管理员显式确认（控制台示盒态与快照态——「明示风险 + 用户可选」）。
  - 快照形 = tar.gz 全量存档（`archive` 流式 ∥ 服务端 gzip 落盘；单份上限 = 工作区 `diskMb` 配额）；非 git 工作区同覆盖面（工作区卷内一切内容——包括 `.thincoder` 会话目录）。
- **卷**：主机路径 `<workspaceRoot>/<ws-id>`（绑定挂载——§2 ∥ KD-SV-162）；磁盘配额 = 项目配额优先 ∥ loopback 备（SSH——`sandbox/EXECUTION.md` §4）。
- **成员面接线（member-face-chat 批——2026-10-13；机制全文 = `agent/MEMBER-AGENT.md` §3.5）**：工作区生命周期动作对成员开（创建/启停/销毁——§8 成员面）；盒起停 ⇒ 成员面会话在线态随动（壳随容器起——起盒 ⇒ 连挂 `hello`；停盒 ⇒ 在途回合掉线收尾）；**会话真源在盒内**（核原生槽文件——题一裁定；盒卷内 `.thincoder` 随卷随快照 ⇒ 停盒/重启会话在场、换机随快照回（截至快照时点）、销毁随卷去——如实）。

## 6. 待批队列（首次新域——需求块）

- 盒访问未在白名单的域名 ⇒ **挂起该连接**（缺省 60s）∥ 登记 pending（同 host 去重 + hits++）⇒ 控制台「工作区 X 想访问 Y」。
- **L1 命中（内置恒拒）⇒ 即时拒**：**零挂起、零待批行**（不可批准面——§4 强制面 ④）；挂起窗只服务 L2/L3 的新域；三态裁定与超时句不变。
- **预授权条目域零挂起**（member-face-chat 批 · 裁定修订轮）：`source='project'` 行命中 ⇒ 放行（非待批面——同白名单命中）；**非拉仓裸出站仍挂起**（本队列不变）。
- 三态（控制台一键）：**批准一次**（放行当次；再访问再批）∥ **批准并记住**（写域名规则——source=approval——即生效）∥ **拒绝**；超时（缺省 60s）⇒ 拒。
- **三次批准同一域**（approve-once 计数——由 `sandbox_pending` 史派生）⇒ 控制台出「建议入默认单」行（一键采纳 = 并入默认单种子）。
- 挂起保持直至裁定到达或超时。
- 审计：`sandbox_event`（kind=approval——三态 + timeout + host + workspace）。
- **机制面（sandbox-exec-rebuild 批——本批）**：挂起 = **DNS 闸持答**（server 进程内 UDP 53 应答器——盒 `resolv.conf` 指向 server，建盒时注入；§7 网络路径）；放行前置 = 该域解析 IP 先入节点闸集（即生效 ∥ 不重建盒）；L1/显式 deny 域 ⇒ 零挂起零待批行；非盒源查询 ⇒ 忽略。机制全文 = `sandbox/EXECUTION.md` §6。

## 7. 盒内凭据（每工作区）

- **签发**：工作区创建 ⇒ server 签发一枚**工作区 key**（`api_keys` 行——名 `sandbox:<workspace>`；复用 accounts key 面 `accounts/keys.mjs:85-93`；**不判 20 上限**——沿 CLI/登录先例 `keys.mjs:19`）；明文存 `sandbox_workspaces.key_plain`（§2）。
- **归属**：owner_member_id（工作区负责人）——模型用量/配额走**既有成员三级配额链**（零新配额机制）；记账按 key 归因（`usage.key_id` 存量列）⇒ 控制台按工作区可查。
- **吊销/轮换**：工作区销毁 ∥ 控制台「轮换」⇒ 吊销旧 key（`revokeKey`）+ 签发新 + **拆容器重建**（**卷保留**——新 key 于重建时注入 env；容器 env 运行期不可变 ⇒ 无「不重建即生效」路径）；重建前旧 key 已失效（401）。
- **盒内形态**：容器 env 注入——`OPENAI_BASE_URL=http://<server>:<port>/v1` ∥ `OPENAI_API_KEY=<workspace key>`（+ TC_* 别名随实施）；**盒内零服务器密钥**（真 provider key 绝不入盒——网关代持）。
- **网络路径**：盒 → server 网关地址:端口 = **内置允许**（不算用户规则——模型调用生命线）；server 其余面 = 会话门禁（盒内无会话）+ 登录防爆破门在（读法披露 = §10-D3）。

## 8. 控制台面

- **落点（已裁 U4）**：server webui 新管理页「沙盒」`#/admin/sandbox`；**非壳页**（卡多——沿看板页先例，不扩「钉表五页」）。
- 卡面（**六面**——必交面（用户 14:08 行）：运行面 ∥ 工作区 ∥ 出站规则 ∥ 待批队列 ∥ 资源与 TTL ∥ 审计可查）：
  - **运行面**（本批落定——§3）：可用性门（无节点 ∥ 全离线 ⇒ unavailable + 原因；节点面恒可用）∥ 节点表（名 ∥ 地址 ∥ 在线态 ∥ 版本 ∥ 容器（运行/总） ∥ 操作：展开容器 ∥ 删除）∥
    写入口 = **添加节点**（名 + Docker API 地址——连通自检；失败逐句人话 + 审计行）∥ **删除节点**（有容器 ⇒ 二选一「保留 ∥ 连删」；有承载工作区 ⇒ 二次确认）∥ **容器区**（节点行展开：列表（名/镜像/状态）+ 创建（名/镜像/卷三件）+ 启动/停止/重启/删除 + 详情（挂载/端口/环境/命令/用量——弹窗）∥ 日志（弹窗）∥ 强杀（详情窗内危险钮）——§3（本批补齐）∥
    **终端**（容器行第七钮——真 pty 会话窗：门 = 运行中；窗内 = 终端面 + 状态行（连接中/已连接 `cols×rows`/已断开/退出码）+ 重连钮（新会话）；同容器窗单例；`webui/TERMINAL.md` ∥ §3 容器终端块））∥
    **卷区**（同展开——容器区之后（sandbox-volumes 批）：卷表（名 ∥ 创建时间 ∥ 删除）+ 删除确认窗（后果句——数据一并没；在用卷 ⇒ 拒删人话就地呈）；建容器卷字段 = 已有卷选单 + 「新建卷（手输）」——§3 卷族 ∥ `webui/SANDBOX.md` §2.1①）∥ **镜像区**（同展开：列表（名/大小/创建）+ 拉取（名[:标签]）+ 删除（确认窗——强制删除勾选）——§3（本批））∥
    **本地镜像表过滤输入**（本批——名/标签关键词；零新端点）∥
    **镜像源卡**（本批——沙盒页新卡（全局面——非按节点）：源表（名 ∥ 地址 ∥ 面型提示）+「添加源」钮（弹窗——预选下拉 + 名/址两输入）+ 行「改/删」+ **目录浏览窗**（仓库列表 ∥ 标签列表——两处过滤输入；五分类读绪如实呈；Hub 源 ⇒ 改走「按名查标签」输入））∥
    **底座卡 + 私有仓凭据卡**（本增补——标签②「镜像与镜像源」：底座卡 = 说明行（缺省 = 标准镜像；自定义 ⇒ 派生） + 工作区表（工作区 ∥ 底座（「标准」∥ 引用） ∥ 操作：「设底座」弹窗（镜像引用输入 + 「恢复标准」）∥「构建」钮（derive——在飞态「构建中……（可能持续数分钟）」；未绑节点 ⇒ 禁用 + 一句人话））；
    凭据卡 = 注册表表（主机 ∥ 用户名 ∥ 更新时间 ∥ 操作：改/删）+「添加凭据」钮（弹窗：注册表主机 ∥ 用户名 ∥ 口令/令牌——**密文零回显**；源表式副作用）——机制 = §3 底座可换块；UI 定形 = `webui/SANDBOX.md` §2.1①）；
  - **工作区**（列表：名/负责人/绑定 runner/盒状态/快照/操作：启动/停止/销毁/轮换 key/快照恢复（快照列表读面）；**动作 = 直调链**（幂等语义 ∥ 「待人放」态明示 ∥ 销毁确认门携盒态/快照读数——机制 = `sandbox/EXECUTION.md` §3）；写入口 = **每工作区覆写**（资源 + TTL：`cpus`/`memMb`/`pids`/`diskMb`/空闲 TTL/墙钟 TTL——行内编辑；生效 = 下次建盒/重建））；
  - **出站规则**（安全组式表：方向（恒出站）∥ 协议 ∥ 端口 ∥ 目标 ∥ 动作 ∥ 优先级 ∥ 备注；增删行内；默认单 = `source=default` 种子行（可改可删））；
  - **待批队列**（实时表 + 三钮 + 「建议入默认单」行；写入口 = 待批超时）；
  - **资源与 TTL**（全局默认：limits（cpus/mem/pids） ∥ 磁盘配额默认 ∥ 空闲 TTL ∥ 墙钟 TTL ∥ 快照周期/保留数 ∥ 镜像名；读数：各节点磁盘余量 ∥ 盒资源占用）；
  - **审计可查**（`sandbox_rule` ∥ `sandbox_event` 过滤视图——数据面 = 审计页同源 + 本卡快捷入口）。
- **每配置项有界面写入口**（必交面判据——用户 14:08）：`sandbox_settings` 逐键 ↔ 卡面对照——`cpus`/`memMb`/`pids`/`diskMb`/`idleTtlMinutes`/`wallclockTtlHours`/`checkpointEveryMinutes`/`checkpointKeep`/`image`/`tmpfsMb` ⇒ 资源与 TTL ∥ `pendingTimeoutSeconds` ⇒ 待批队列。
  **`memberWorkspaceLimit`（正整数——每成员工作区上限，缺省 3）⇒ 资源与 TTL（成员面行；member-face-chat 批）**。
  默认单 = 出站规则卡内 `source=default` 行（**非设置键**）；**每工作区覆写**（资源 + TTL）⇒ 工作区行；规则条目 ⇒ 出站规则行内增删。**零配置项以「编辑配置文件」收场**（部署拓扑项不涉本设置面）。
  **v22 增两键（本批）：`maxBoxesPerRunner`（正整——单节点盒数上限，缺省 8；放置与防吃光）⇒ 资源与 TTL ∥ `workspaceRoot`（节点侧工作区根路径，缺省 `/var/lib/thincoder/workspaces`）⇒ 资源与 TTL（容器重建/停盒态需明示重启生效）。**
  **底座可换增补（本批·修订轮）**：**底座绑定（每工作区）⇒ 底座卡（行级写入口——§3 底座可换块）∥ 私有仓凭据 ⇒ 凭据卡**（两卡均标签②；成员面零涉）。
- 判权：v1 = `requireAdmin`（会话）；#1216② 到位后换同点（§9）。
- 明示义务：无可用节点 ⇒ disabled + 原因；节点探活失败 ⇒ 红；工作区无保护（非 git/快照失败）⇒ 标。
- **成员面（本人自助——用户 14:56 裁；需求 §5 沙盒块成员面行；本批落读面——台账 #1233/#1234）**：成员自己的资源须有本人面——首个兑现 = **工作区读面**（`webui/SANDBOX.md` §2.2；信号 = `gateway/API.md` §2.7——恒本人过滤）：盒状态（运行 ∥ 已停 + 回收原因）∥ 快照数 ∥ **所属 runner**（行增 `runnerName`——未绑定 ⇒ `null`，端侧呈「未绑定」）∥ 待批。
  **成员会话面接线（member-face-chat 批——本批出案）**：会话面（`#/me/chat`——`webui/CHAT.md` §2.2）以工作区为宿主；盒未运行/未连接 ⇒ 就地启动动作；停盒 ⇒ 在途回合掉线收尾（notice + `box_lost`）——机制 = `agent/MEMBER-AGENT.md` §3.4/§3.5。
  **待批发起方提示（本批——台账 #1233①；父侧 2026-10-13 裁定）**：`pending` 在场 ⇒ **一行可见提示**「等待管理员批准：<host>（首次访问新域名——通常 ≤60s）」（不得静默——≤60s 窗内可见；裁定 ∥ 超时 ⇒ 提示自动消失，不残留）。
  **判据单源 = 本档**（文案 ∥ 出现/消失条件 ∥ 零静默）；落点 = 控制台成员页 `#/me/sandbox`（`webui/SANDBOX.md` §2.2）；**三端（CLI ∥ VSC ∥ 桌面）今日无沙盒/工作区面**（实读——三端文档零沙盒条目；成员面会话面 = #1215 未启设计）⇒ 三端落点**登记为随 #1215 成员会话面**（届时按本判据落；本批不发明新面——父侧 2026-10-13 裁定）。
  **#1215 成员会话面设计轮（2026-10-13）处理 = 单列提议：不在成员面会话批**（`agent/MEMBER-AGENT.md` §9 R75——待裁）。
  **成员写面**（member-face-chat 批——本批开）：创建 ∥ 启动 ∥ 停止 ∥ 销毁（确认门）+ 拉仓——判权 = 本人 + 上限（`memberWorkspaceLimit` 缺省 3）；**不另开管理面**（动作承载 = 对话页就地 + 工作区页动作列 + 会话内 agent 工具）；轮换/快照恢复仍在管理面（登记）。机制 = `agent/MEMBER-AGENT.md` §3.7。
  **成员 git 凭据面（member-face-chat 批——题三补）**：落点 = **我的·账户页**（`webui/ME.md` §3——不进沙盒页）；机制 = `agent/MEMBER-AGENT.md` §3.6/KD-SV-204。

## 9. 端点与判权（表在 API.md——单源）

- 控制台面 = `/api/admin/sandbox/*`（§8 六面对应）；成员面 = `/api/me/sandbox/*`（§8 成员面）。
- 表 = `gateway/API.md` §2.5（控制台面）∥ §2.7（成员面）；错误形 = §3 全码 + **一码新增** `sandbox_unavailable`（503——无可用节点）；节点/容器面（本批——§3）：引擎失败 ⇒ 502 `upstream_error`（消息 = 逐句人话 + 引擎原文）∥ 容器/节点不存在 ⇒ 404 ∥ 形非法/重名/镜像缺/名占用 ⇒ 400（零新码）；判权 = `requireAdmin`（`thincoder-server/src/accounts/session.mjs`）∥ 成员面 = 会话（本人过滤——§8 成员面）。
  镜像源面（sandbox-image-sources 批）＝ `gateway/API.md` §2.5 镜像源七行——判权 `requireAdmin`；零新码（400/404）；目录/标签读数 = 自含状态形（`{ ok, error: { kind, message } }`——沿 `/api/admin/proxy/test` 先例）；零涉沙盒可用性门（源面与节点无关）；
  一键拉取（sandbox-image-quick-pull 批）= 纯前端复用镜像族拉取端点（`/runners/:id/images/pull`——§3）——零新端点；拉取认源（sandbox-pull-by-source 批）= 纯前端（拉取窗选源组装引用——组装在窗内；拉取仍走既有端点）——零新端点。

- 卷族（sandbox-volumes 批）= 两端点（列 ∥ 删——`GET`/`DELETE …/runners/:id/volumes[/:name]`）——判权 `requireAdmin`；零新码（400 名形 ∥ 404 无此卷 ∥ 400 在用卷人话 + 处置句 ∥ 502 不可达）；列表零审计 ∥ 删卷审计 `volume_delete`（键集 = `accounts/ACCOUNTS.md` §2.1）；名形校验前置（400 零外呼）。

- 容器终端（sandbox-container-terminal 批——本批）：**升级端点一枚**——`GET /api/admin/sandbox/runners/:id/containers/:containerId/terminal`（`Upgrade: websocket`——**非普通路由**：升级路分派；101 前判权 `requireAdmin` + 同源 `Origin`）；判权失败 ⇒ 401/403（无 101，响应沿错误形）∥ 节点不存在 ⇒ 404；
  **in-band 错误码四条**（`container_not_running` ∥ `engine_unreachable` ∥ `exec_failed` ∥ `session_closed`——文案归前端）；行文 = `gateway/API.md` §2.5 末行；帧协议/心跳/收口语义 = §3 容器终端块（单源）。

- 执行面（sandbox-exec-rebuild 批——本批）：工作区动作行语义 = **直调链**（响应 = 动作读数；旧批处理语义退场）；**增快照列表行**（`GET /api/admin/sandbox/workspaces/:id/checkpoints`——读面，列 id/createdAt/size/note；恢复动作选参用）；建工作区入参去 `requiredLabels`（列面收正随拍）；表 = `gateway/API.md` §2.5（单源）；零新错误码（503 `sandbox_unavailable` 既有——写门实时化后仍为唯一新码）。

- 底座可换（本批·修订轮增补——§3 块；表 = `gateway/API.md` §2.5 单源）：**增五端点**——`POST …/workspaces/:id/derive`（派生构建——同步；响应 `{ ok, base, tag, cached, pulled, ms }`）∥ `GET/POST/PATCH/DELETE …/registry-credentials[/:id]`（私有仓凭据四端点——响应零秘密）；
  **扩两处**——工作区列表行增 `baseImage` ∥ `PATCH …/workspaces/:id` 体增 `baseImage` 键（`null` = 恢复标准）；拉取端点（既有 `POST …/runners/:id/images/pull`）**命中凭据 ⇒ 携 `X-Registry-Auth`**（未命中 ⇒ 匿名——现状零改）；零新错误码（400/404/502 沿用）。

- 连接面（本增补 #2）= 连接方式编辑端点一枚（`PUT …/runners/:id/connection`——全列覆写）+ 添加节点体扩（`connection`/`tls` 键）；判权 `requireAdmin`；零新码（形非法/相抵 ⇒ 400 ∥ 自检失败 ⇒ 502 库零变 ∥ 不存在 ⇒ 404）；审计 = `runner_connection`（键集 = `accounts/ACCOUNTS.md` §2.1）；机制全文 = §3 连接方式块 ∥ `sandbox/EXECUTION.md` §2.1。

## 10. 已裁决策与读法披露

**已裁（2026-10-10 14:23 用户「都按建议」——逐条 = 原设计建议）：**

| # | 已裁项 | 候选 | 裁定 | 影响 |
|---|---|---|---|---|
| U1 | runner 容器运行时 | A Docker ∥ B Podman ∥ C 两者兼容（适配层） | **Docker**（runner = 远程 Docker API 节点——2026-10-10 19:52 定；控制面直调 Docker API——§1） | 节点接入 + 自检读数 |
| U2 | 内网 CIDR 的口子 | A 硬核恒拒（`127/8` + `169.254/16`）＋ RFC1918/服务器网段 = 默认可被显式 allow 开 ∥ B 四个默认全可开 ∥ C 四个默认全恒拒 | A（内网后端可用诉求成立） | rules 校验 + 求值序 |
| U3 | 默认单内容 | §4 拟定五条 ∥ 增删任意 | 按 §4 五条起步（控制台可改） | 开箱体验（装依赖/拉仓） |
| U4 | 控制台落点 | A server webui 新管理页 ∥ B 并入系统页 ∥ C 三端 | A（一页一职责——沙盒面自持） | webui 页数链 + 实施面 |
| U5 | WIP 快照默认 | A 周期 15 分钟 + 拆前 ∥ B 仅拆前 ∥ C 无（仅卷保留） | A（最小保护） | 节点负载/带宽 |

- U2 读法注：需求块「默认禁单…内网/固定 IP 后端 = 显式加 CIDR 允许条目」与「deny 恒先于 allow」并置——本裁定取「默认 = 种子（可改）；**显式 deny 恒先**；种子 deny ≺ 显式 allow（相对序——§4）」。

**读法披露（用户未异议——不阻塞·按设计实施）：**

- **D1（tmpfs 例外）**：需求块「唯一可写挂载 = 工作区卷」——设计与工具链刚需并置：`/tmp` = tmpfs（内存背书 ∥ 容积封顶 ∥ 非持久）为唯一例外（node/npm 必需）；无持久宿主面写入（盒参数集全文 = §14 KD-SV-73）。
- **D2（key_plain 明文）**：工作区 key 明文落控制面库（§2——盒重建须再注入；先例 KD-SV-19）；键面 = 工作区作用域可吊销——泄露面收于该工作区。
- **D3（盒可达 server 整端口）**：内置允许 = server 网关地址:端口（盒可达该端口全部路径）；控制台/管理面靠会话门禁（盒内无会话）；如需收窄到 /v1 路径级 ⇒ 翻案点（另设专用监听）。
- **D4（复用 key 的残余面）**：工作区 key 作为 `api_keys` 行天然可打 `/api/client/*`（logout/me——自身读面）；收窄（scope 列）= 另轮。

## 11. 验收判据（需求块 → 设计判据）

| 需求（`docs/server/requirements/PROJECT.md` §5 沙盒块） | 设计级判据 | 载体 |
|---|---|---|
| 容器唯一 ∥ 无退路 | 无可用节点 ⇒ status = unavailable + 控制台明示 | 单元测试档 + 收口轮 |
| 威胁模型五面 | 红队探针用例集（判据表随重做批重建——需求 AC-36 ⑦） | 收口轮 |
| 每工作区一盒 ∥ read-only ∥ 唯一可写挂载 ∥ 盒内零密钥 | §14 KD-SV-73 盒参数集 + §7 凭据面 | 单元测试档 + 收口轮 |
| 出站两类同表 ∥ 默认全拒 ∥ 两闸 ∥ 显式 deny 先 ∥ 通配 ∥ 即生效 ∥ 审计 ∥ **强制面**（L1 门级不变量即拒 ∥ 内置允许生命线 ≻ L2/L3 ∥ 解析零地址 ⇒ 拒 ∥ 双径同判 ∥ 网段带入幂等 + `rulesRev`/审计口径） | rules 校验/求值单元测试 + 审计行落库断言；用例链 = §12（N64 ∥ B66） | 单元测试档 + 收口轮 |
| 待批队列（三态 ∥ 60s ∥ 三次建议） | 队列单元测试 | 单元测试档 + 收口轮 |
| 资源上限 ∥ 墙钟 TTL ∥ 空闲拆 ∥ 每工作区覆写 | TTL 单元测试 + 覆写单元测试（PATCH ⇒ 建盒载荷逐值——N45） | 单元测试档 + 收口轮 |
| 非目标（0day ∥ 侧信道） | §1 明写不做 | —— |
| 验收 = 红队探针用例集 + 正常开发链 | 探针用例集（重做批重建）+ 正常开发链用例 | 收口轮 |
| 落地序（先于 #1215）∥ 与 CI 共用执行面 | §14 KD-SV-72 + §15 边界（CI 实现不在本批） | 设计在档 |
| 14:00 裁定（两平面分离 ∥ 无节点不可用 ∥ CI 共用） | §1 ∥ §14 KD-SV-63/71/72 | 设计在档 |
| 管理与配置界面 = 必交面（用户 14:08——六面 + 每项配置有界面写入口） | §8 六面在册（含运行面节点接入：添加/删除 ∥ 连通自检 ∥ 失败审计行）∥ 每配置项有 UI 写入口（`sandbox_settings` 逐键对照表 + 每工作区覆写——§8）∥ 控制台机检口径 = `webui/WEBUI.md` §6 沙盒行（单源——含 `#/admin/sandbox` 路由 ∥ nav 管理项 ∥ 档目链 ∥ i18n `admin.sandbox.*` 两表同步；容器面补齐/镜像族行 = 本批随正） | 单元测试档 + 收口轮（浏览器实走） |
| 成员面 = 本人自助（用户 14:56——AC-36 ⑧） | §8 成员面（`#/me/sandbox` 本人工作区读 + 待批发起方提示）∥ 信号 = `gateway/API.md` §2.7 | 单元测试档 + 收口轮（浏览器实走） |
| **最小切片**（runner-admin-console 批——台账 #1252；用户 19:59 四件） | ① 添加节点（自检读数落库逐值 ∥ 失败 ⇒ 502 + 零落库 + 审计行）② 建容器（引擎请求体逐值 ∥ 列表可见）③ 启/停（幂等：304 ⇒ 成功）④ 删节点（保留 ∥ 连删二选一 ∥ 连删失败 ⇒ 行保留）；判据全文 = §3 ∥ §12（N40 ∥ N46–N48 ∥ B41–B43 ∥ E34–E36）；**真机跑**（收口轮——`10.0.0.6`，Docker 29.1.3 ∥ 盒镜像在机）：添节点 ⇒ 在列（online + 版本）；建容器 ⇒ `docker ps -a` 见 `Created` ⇒ 启动 ⇒ `docker ps` 见 `Up` ⇒ 停止 ⇒ `Exited` ⇒ 删 ⇒ 无；删节点「保留」⇒ 容器留机 ∥「连删」⇒ 容器净 + 节点消 | 单元测试档 + 收口轮（真机） |
| **容器面补齐 + 镜像族**（本批——sandbox-docker-admin；台账 #1265；用户 04:36/04:39 两族同批） | 容器五件：详情读数逐值（挂载/端口/环境/命令）∥ 日志（tail 有界 + 非 TTY 帧解复用——零帧头残渣）∥ 重启/强杀（引擎调用逐条 + 审计两 kind）∥ 用量（cpuPercent/内存/磁盘逐值；一次采样口径）；镜像三件：列表逐值 ∥ 拉取（`fromImage`/`tag` 逐值 ∥ 缺省 `latest` ∥ 失败两形 ⇒ 400）∥ 删除（`force` 0/1 逐值 ∥ 409 ⇒ 400 人话）；判据全文 = §3（本批块）∥ §12（N53–N56 ∥ B47–B51 ∥ E39–E42）∥ `gateway/API.md` §2.5 新八行 ∥ `webui/SANDBOX.md` §2.1① ∥ §6 沙盒行（本批随正）；审计 kind 面 = `accounts/ACCOUNTS.md` §2.1（型面计数零增）；**真机**（收口轮——10.0.0.6：真容器详/日志/重启/强杀/用量 ∥ 真镜像列/删；拉取视源可达性如实报） | 单元测试档 + 收口轮（真机） |
| **镜像源族**（本批——sandbox-image-sources；台账 #1274；用户 09:17 四点 ①②③ + 09:19 预选） | 源清单 CRUD（增/删/改/列——形校验拒非法 ∥ 名/址各自唯一 ∥ 每动作一审计行 ∥ 预选七条在册且表单只回填名/址）∥ 源目录可达（v2 目录/标签逐值 ∥ Hub 面标签 + 裸名补 `library/` ∥ 匿名 Bearer 逐跳命中（挑战解析 → 换 token → 复读） ∥ 读绪五分类如实呈（`timeout`/`unreachable`/`auth_required`/`unsupported`/`bad_response`））∥ 过滤生效（本地镜像表 ∥ 仓库列表 ∥ 标签列表——无匹配 ⇒ 空态句）；判据全文 = §3（本批块）∥ §12（N57–N59 ∥ B52–B56 ∥ E43–E45）∥ `gateway/API.md` §2.5 镜像源七行 ∥ `webui/SANDBOX.md` §2.1① + §6 沙盒行（本批随正） ∥ `store/STORE.md` §2 v15 段/§3 v15；**收口轮** = 浏览器实走（增/改/删源 + 源目录读取（自建 registry ∥ 公网源按可达性如实）+ 两处过滤） | 单元测试档 + 收口轮（浏览器实走） |
| **一键拉取**（sandbox-image-quick-pull 批——台账 #1276；用户 13:18 裁；AC-38 ④——已落需求档） | 目录浏览窗仓库/标签行「拉取」钮（在线节点在场 ⇒ 可用；无节点 ∥ 全离线 ⇒ 禁用 + 一句人话——复用 `admin.sandbox.noNodes`/`admin.sandbox.allOffline`；概览读败 ⇒ 禁用 + `mapError`）⇒ 节点选单（在线节点行）⇒ 既有拉取窗预填逐值（`<主机>[:<端口>]/<仓库>:<标签>`——去 scheme ∥ Hub 主机统一 `docker.io` ∥ 仓库行 `:latest`；预填可改）+「目标节点：{name}」行 ⇒ 确认走既有拉取径（零新端点 ∥ 拉取行为零改——实读 `image-routes.mjs` 132 ∥ `docker.mjs` 327 零触）；判据全文 = §3 一键拉取块 ∥ §12（N60 ∥ B57/B58 ∥ E46）∥ §14 KD-SV-99 ∥ `webui/SANDBOX.md` §2.1① + §6 一键拉取行；**收口轮** = 浏览器实走（有在线节点：浏览 ⇒ 拉取 ⇒ 选单 ⇒ 预填核对 ⇒ 确认真拉 ∥ 无节点 ∥ 全离线：禁用 + 一句人话） | 单元测试档 + 收口轮（浏览器实走） |
| **拉取认源**（sandbox-pull-by-source 批——台账 #1281；用户 2026-10-11 18:15 裁「A」；AC-38 ⑤——已落需求档） | 拉取窗「经由源」选单在册（源清单读时读——零新端点）∥ 选定 ⇒ 引用按源组装逐值（去 scheme ∥ 含端口逐值 ∥ Hub 主机统一 `docker.io` + 裸名补 `library/` ∥ 已带主机剥换（引擎同口径判据）∥ 无标签补 `:latest` 显式 ∥ `@` 透传 ∥ 空输入不动作）∥ 组装 = 输入框可见改写（所见即所拉）+ 可再改；提交 = 输入框当刻文本（组装后可见值——拉取端点形零改 ∥ 拉取径单源）∥ 一键拉取径（预填 + 源）⇒ 选单认源态 ∥ 组装施加点 = 选单变更 ∥ 选定态输入完成（幂等） ∥ 目标节点行恒显（P1——N61 用例） ∥ 手改不自动回落 ∥ 记忆预选（P2——B61 用例；预选态非自动改写；记忆源失效 ⇒ 不选态回落） ∥ 无源 ∥ 读败 ⇒ 不选态 + 人话——拉取不阻断；判据全文 = §3 拉取认源块 ∥ §12（N61 ∥ B59–B62 ∥ E47）∥ §14 KD-SV-100 ∥ `webui/SANDBOX.md` §2.1① + §6 拉取认源行；**收口轮** = 整条用户旅程真机（ECS `.6`：加源（`docker.1ms.run`）⇒ 经源拉 `ubuntu:24.04` ⇒ 镜像落地 ⇒ 建容器跑——AC-38 ⑤ 验收句） | 单元测试档 + 收口轮（浏览器实走 + 真机） |

| **主机表 + 凭据托管 + `exec` 进 chat**（admin-chat-creds-merge 批——台账 #1326；用户 2026-10-12 三裁） | 主机表 = `sandbox_runners` 扩展（七列 + 一次回填；单一权威——§3 主机凭据块）∥ 凭据写面两件（`PUT`/`DELETE …/credential`——形校验 400 ∥ 响应零秘密 ∥ 审计两 kind）∥ `keep` 成功 ⇒ 移交（run 行零化 + `'moved'`）∥ 迁移回填（id 序、后者胜）∥ 凭据入口 = 弹窗两挂载（文本非通道）∥ `exec` 进 chat（绑定主机行 ∥ `ssh.mjs`/加解密/审计三单源 ∥ 掩蔽含行凭据值）∥ 合并路线在册（§3——三步）；判据全文 = §3 主机凭据块 ∥ §12（N79–N82 ∥ B76–B78 ∥ E59/E60）∥ §14 KD-SV-133/134/135 ∥ `agent/ADMIN-AGENT.md` §7/§12 ∥ `gateway/API.md` §2.5（已落） ∥ `webui/SANDBOX.md` §2.1① ∥ `webui/CHAT.md` §2.1；**收口轮** = 浏览器实走（沙盒页录凭据 ⇒ 对话页录凭据 ⇒ chat 内 `exec` 一条 ⇒ 撤销 ⇒ 再 `exec` 拒）+ 真机（ECS `.6`：录真凭据 ⇒ `exec` 读数） | 单元测试档 + 收口轮（浏览器实走 + 真机） |
| **底座可换**（本批·修订轮增补——用户 2026-10-13 21:32；功能点 52 ∥ AC-52——拟入册（主 agent 笔——§16 R74①）） | ① 底座指定形三腿（引用形校验 400 零外呼 ∥ 存在性（缺 ⇒ 拉取）∥ 前提（乙：Node 随包带——构建期校验层））∥ ② 绑定与生效（`base_image` 列 ∥ PATCH `baseImage` 键 ∥ 生效 = 下次建盒/重建）∥ ③ 派生 tag 内容寻址（缓存命中零构建 ∥ Id 变 ⇒ 重建）∥ ④ 建盒链 ④ 镜像就位（自定义腿在场 ∥ 缺省腿零新增调用——零行为变化腿）∥ ⑤ 私有仓凭据（CRUD ∥ 加密零回显 ∥ 拉取注入逐值；未命中 ⇒ 匿名）∥ ⑥ 控制台两卡（底座 ∥ 凭据——弹窗 ∥ 在飞态 ∥ i18n）∥ ⑦ 审计四 kind + `image_pull` `auth` 键；判据全文 = `sandbox/EXECUTION.md` §8 底座可换块 ∥ §13（N71/N72 ∥ B74/B75 ∥ E56/E57）∥ §15 KD-SV-184…191 ∥ 本档 §3 块 ∥ `gateway/API.md` §2.5 ∥ `webui/SANDBOX.md` §2.1①；**真机**（收口轮——选定底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起；前置 = 标准镜像件位契约就绪（member-face 批）） | 单元测试档 + 收口轮（浏览器实走 + 真机） |
| **卷族**（sandbox-volumes 批——台账 #1291；用户 2026-10-11 21:18 三件 + 21:22 裁；AC-40——已落需求档） | ① 卷列表（`GET …/volumes` 逐值——名/驱动/创建时间；读败 ⇒ 人话；零审计）∥ ② 建容器卷字段 = 选单（节点已有卷 + 「新建卷（手输）」——选定回填可再改；读败/空 ⇒ 手输照常；提交 = 输入框当刻文本 ⇒ `Binds` 逐值零改 ∥ **零隐式建卷**——首用即建归引擎）∥ ③ 删卷（确认窗 + 后果句——非原生 `confirm`；引擎 404 ⇒ 404 ∥ **409 在用 ⇒ 400 人话 + 处置句**（零新码）∥ 204 ⇒ 200 + 审计 `volume_delete`）∥ ④ 带数据重建（加挂）= 不做（边界句——用户 21:22 裁）；判据全文 = §3 卷族块 ∥ §12（N62/N63 ∥ B63–B65 ∥ E48/E49）∥ §14 KD-SV-104/105 ∥ `gateway/API.md` §2.5 两行 ∥ `webui/SANDBOX.md` §2.1①；**真机**（收口轮——ECS `.6`：在用卷拒删如实呈（`test-data` 类场景）∥ 建容器选卷/手输两用例 ∥ 卷表列/删全链） | 单元测试档 + 收口轮（浏览器实走 + 真机） |
| **容器终端 v1**（sandbox-container-terminal 批——台账 #1374；用户 2026-10-13 21:11/21:13/21:17 三句；功能点 51 ∥ AC-51——已入册 2026-10-13） | ① 入口/门（容器行第七钮「终端」——门 = 运行中；非运行禁用）∥ ② 会话链三步逐值（读容器（运行态 ∥ locale 判据）⇒ 建 exec（`Attach*` 三旗 ∥ `Tty` ∥ `Env` 两键 ∥ `Cmd` 常量）⇒ 升级 start（`101` + 裸双工））∥ ③ 帧协议（二进制 = pty 字节双向 ∥ 文本 = JSON 控制）∥ ④ 心跳（30s ping / 60s 判死——两向）∥ ⑤ 收口三件 + 幂等（停机全收口 `server_stop`）∥ ⑥ 判权/同源门先于 101 + in-band 四码 + 协议错 1002 ∥ ⑦ 审计两 kind（pty 内容零留痕）∥ ⑧ 尺寸（就绪前挂起 ∥ 就绪后施加 ∥ 越界忽略）∥ ⑨ 前端核（`webui/TERMINAL.md` §2/§4——`vim`/`top`/中文达效）；判据全文 = §3 容器终端块 ∥ §12（N83–N85 ∥ B79–B81 ∥ E61–E63）∥ §14 KD-SV-175…180；**真机**（收口轮——ECS `.6`：非运行门 + 直连拒 + 关窗后零残留） | 单元测试档 + 收口轮（浏览器实走 + 真机） |
| **连接面 TLS 档**（本增补 #2——用户 2026-10-13 22:43 裁「让用户可选」；功能点 53 ∥ AC-53——拟入册（主 agent 笔——§16 R74①）） | ① 形态（地址 scheme 单源：`http`=明文缺省 ∥ `https`=TLS；裸 host 按档补 scheme/端口 2375·2376；显式相抵 ⇒ 400）∥ ② 材料（三件自备 ∥ 私钥加密落库 ∥ **零回显/零回填**（响应键面扫描）∥ 不变量 `https` ⇔ 三件齐）∥ ③ 传输（`node:https` 适配件——`ca`/`cert`/`key` 逐值入选项；`fetchImpl` 缝内插；**明文路径零行为变化**——归一/自检/落库/传输逐值同现状）∥ ④ 写面两端点（添加体扩 ∥ `PUT …/connection` 全列覆写——**先自检后落库，失败 ⇒ 库零变**；关 TLS = 原子）∥ ⑤ 生效面全谱（自检/读数/容器/镜像/卷/终端/盒链/chat `docker`）∥ ⑥ 审计（`runner_add` + `tls` 键 ∥ `runner_connection` 一枚——零秘密）；判据全文 = §3 连接方式块 ∥ `sandbox/EXECUTION.md` §2.1/§13（N73 ∥ B76）∥ §15 KD-SV-192…195 ∥ `gateway/API.md` §2.5 ∥ `webui/SANDBOX.md` §2.1①/§4；**真机**（收口轮——ECS `.6`：节点侧 dockerd TLS 配置（`docs/TEST-ENV-ECS.md` 随正件）⇒ 自签材料 ⇒ 切档 ⇒ 自检过 ⇒ 全谱可用 ∥ 切回明文 ⇒ 材料清零） | 单元测试档 + 收口轮（浏览器实走 + 真机） |

**红队探针套件（P1–P14）——判据表（本批复核重建；台账 #1249）**

- **现状**：判据表随执行面重定删除（runner-admin-console 批）；sandbox-outbound-member-face 批复核后重建（判据在册）；**探针执行器 = sandbox-exec-rebuild 批落**（`thincoder-server/deploy/sandbox-probe.mjs`（拟新增）——机制全文 = `sandbox/EXECUTION.md` §10）。
- **跑法**：真机 `docs/TEST-ENV-ECS.md`（server `.5` ∥ runner `.6`）；全过 ⇒ EXIT 0；有 FAIL ⇒ EXIT 1；**SKIP 单列**（无机/无前置 ⇒ 如实 skip，不假报）。
- **判据表**（判据 = 复核后口径；真机读数 = 2026-10-10 在案）：

| # | 判据（复核后） | 2026-10-10 真机 | 本批处置 |
|---|---|---|---|
| P1 | **宿主真实账号**（宿主 `/etc/passwd` 中 **UID ∈ [1000, 65533]**——人类用户窗）零命中盒内 `/etc/passwd`；**不判面 = 窗外的标准系统账号**（UID < 1000 ∥ `nobody` 类 ≥ 65534；显式标准账号集兜底） | FAIL（`nobody` 命中） | **判据收窄**——收窄后重跑（执行器 = 本批——`sandbox/EXECUTION.md` §10） |
| P2 | 盒内对**宿主 22 口** ⇒ 拒 | FAIL（EXIT=0） | **已修**【§4 强制面 ①–⑥；主机侧 = `sandbox/EXECUTION.md` §5——**盒 → 宿主方向 = `input` 链腿**；本批复证】 |
| P3 | 盒内对 `169.254.169.254` ⇒ **恒拒**（即时——零挂起） | FAIL（可达） | **已修**【L1 不变量；主机侧 = `sandbox/EXECUTION.md` §5——本批复证】 |
| P4 | 非白名单出站 ⇒ 拒 | PASS | 保持 |
| P5 | fork 炸弹 ⇒ 被杀 | PASS | 保持 |
| P6 | 根只读（写 `/` ⇒ 拒） | PASS | 保持 |
| P7 | 填盘 ⇒ ENOSPC | PASS | 保持 |
| P8 | **注入面正向在场**（`OPENAI_BASE_URL` = 网关 ∥ `OPENAI_API_KEY` = `sk-tc-…` 工作区 key 形态）+ **秘密零命中**（真 provider key 形态扫描 ∥ 未注入的敏感键名 `*_KEY`∥`*_TOKEN`∥`*_SECRET`∥`*_PASSWORD` 零命中）；**基础镜像固有 env 不判**（`NODE_VERSION` ∥ `YARN_VERSION` ∥ `PATH` ∥ `HOSTNAME`…） | FAIL（`NODE_VERSION` ∥ `YARN_VERSION` 命中旧白名单外判据） | **判据收窄**——收窄后重跑 |
| P9 | 跨盒：他盒卷路径 ⇒ ENOENT ∥ 他盒容器 IP ⇒ 不可达 | SKIP | 前置 = **第二盒**（同节点第二工作区）——执行器已备（本批——`--node` 径自建） |
| P10 | 正常开发链（装依赖 ∥ 拉仓 ∥ 跑测试）通过 | SKIP | 前置 = **`--repo`**（可克隆仓地址）；执行器已备（本批） |
| P11 | 规则增删 ⇒ **即生效 ∥ 不重建盒** | SKIP | 前置 = **`--target`**（下发目标）；执行器已备（本批） |
| P12 | 新域 ⇒ 挂起 ≤60s ⇒ 待批拒态成立 | PASS | 保持；**补半支** = L1 目标即时拒、零待批行（DNS 闸机制 = `sandbox/EXECUTION.md` §6——本批） |
| P13 | 吊销 ⇒ 旧 key 即断（401）∥ 新 key 可用 | PASS（旧半支） | 保持（新 key 半支 = 卷保留重建——§7） |
| P14 | 服务端读数面（无可用节点 ⇒ 503 `sandbox_unavailable` + 控制台明示） | SKIP | 前置 = **执行面读数面——sandbox-exec-rebuild 批已落**（实时写门 + 探活；`sandbox/EXECUTION.md` §7——本批可跑） |

- **口径纪律**：判据**不判基础镜像自带项**（P1/P8 收窄的共性——镜像自身形态不属盒的隔离能力）；秘密面走**结构形**（形态扫描 + 注入面正向断言——真值不下行，沿 R25/P8 结构判据先例）。
- **与 ① 的关系**：P2/P3 判据不变（应拒 ∥ 恒拒）——修复在机制面（§4 强制面）；**真机复证 = sandbox-exec-rebuild 批收口面**（§16 R73③④）。
- **闭环边界（明写——防收口误记）**：**#1248（P2/P3）∥ #1249（P1/P8 重跑）的闭环批次 = sandbox-exec-rebuild 批**（真机复证随其收口——执行器已备）；sandbox-outbound-member-face 批验收 = 控制面腿（求值/带入/判据在册——可机检）。

## 12. 用例（本域）

| # | 类 | 面 | 输入 | 预期输出 |
|---|---|---|---|---|
| N40 | 正常 | 控制面 | 添加节点：名 + Docker API 地址（假 Docker `GET v<ver>/version` 在案）⇒ 连通自检 | `sandbox_runners` 行（name/address/status=active；`runtime_json` = 自检读数逐值 ∥ 协商版本在场）；运行面在列（online=true ∥ 版本）；审计 `sandbox_event`（kind=`runner_add`） |
| N41 | 正常 | 控制面 | 建工作区（负责人）⇒ 建盒 | key 签发（`api_keys` 行名 `sandbox:<ws>`）+ 绑定节点 + 建盒/启动（控制面直调 Docker API——§1） |
| N42 | 正常 | 控制面 | 规则增删各一（`sandbox_rules`） | `rulesRev` +1；**即生效 ∥ 不重建盒**（需求块）；审计 `sandbox_rule` 两行 |
| N43 | 正常 | 控制面 | 待批三态各一次（once ∥ remember ∥ deny） | 挂起 ≤60s；once = 当次放行再访问再挂；remember = 规则入表（source=approval）即生效；审计 `sandbox_event` |
| N45 | 正常 | 控制面 | 建工作区携 `limits`（cpus/memMb）⇒ PATCH 覆写 `cpus` ⇒ 触发重建 | 行 `limits_json` 回读逐值；create/重建 payload 逐值 = 覆写 ∪ 全局默认（未覆写键）；运行中盒零触（仅重建生效） |
| B35 | 边界 | 控制面 | 无可用节点 | 沙盒面 disabled + 原因文本；写动作读数 503 `sandbox_unavailable`（不降级） |
| B36 | 边界 | 控制面 | 域名规则校验：`*.example.com` ∥ `*` ∥ `*.com` ∥ `a.*.com` ∥ IP 段通配 | 首者收；余者 400（写面）——控制台通配条目带醒目标记 |
| B37 | 边界 | 控制面 | 同 host：allow 规则 + deny 规则并存 | 拒（显式 deny 恒先）；priority 只排同动作内 |
| B38 | 边界 | 控制面 | 同一域三次 approve-once | 控制台出「建议入默认单」行；采纳 ⇒ 并入默认单种子 |
| B39 | 边界 | 执行面 | 盒空闲 30 分钟 ∥ 墙钟 24h | 停盒（`stop_reason` = idle_ttl/wallclock_ttl；停止不拍快照）；卷留；下次使用重建（重克隆 + 快照恢复）——机制 = `sandbox/EXECUTION.md` §3/§13（N69） |
| B40 | 边界 | 执行面 | 快照越单份上限（`diskMb` 配额——假流大件） | 中止 + 不落行 + 审计告警（如实——机制 = `sandbox/EXECUTION.md` §3/B69） |
| E29 | 错误 | 控制面 | `user` ∥ 无会话打 `/api/admin/sandbox/*` | 403 ∥ 401 |
| E31 | 错误 | 控制面 | 销毁工作区（未携确认旗）∥ 轮换后旧 key 再用 | 拒/警示（二次确认要求）；旧 key 再用 ⇒ 401（吊销即断）；轮换 = 拆容器重建（卷保留）后新 key 生效 |
| E33 | 错误 | 执行面 | 盒写超磁盘配额 | ENOSPC（应用可见）；节点盘不破界（配额兜底）——机制 = `sandbox/EXECUTION.md` §4（B67/P7） |
| N46 | 正常 | 控制面 | 建容器：名/镜像/卷三件（假 Docker `POST v<ver>/containers/create` 在案） | 引擎请求体逐值（`Image` ∥ `Cmd`=待命命令 ∥ `Binds`=`<卷>:/workspace`）；200 `{ container }`（id 逐值）；列表含（state=created）；审计行 `container_create` |
| N47 | 正常 | 控制面 | 启 ∥ 停 ∥ 删容器（各一次；启/停各重复一次） | 引擎调用逐条命中（start ∥ stop ∥ DELETE `?force=1`）；204 ⇒ 200 ∥ 304（已启/已停）⇒ 幂等成功；审计行三枚 |
| N48 | 正常 | 控制面 | 删节点三径：有容器 ⇒ `keep` ∥ `remove` ∥ 无处置（无容器 ⇒ 直接删） | keep ⇒ 登记行删、引擎零删调用；remove ⇒ 逐删命中（N 次）⇒ 行删；无处置 ⇒ 400；无容器 ⇒ 直接删行；审计行 `runner_delete`（detail 逐值） |
| B41 | 边界 | 控制面 | 节点不可达（假 Docker 关停） | 运行面 online=false（version/containers = null）；容器列表 ⇒ 502 人话；添节点 ⇒ 502 + 审计 `runner_selfcheck_failed` + 零落库；删节点 = 仅 keep 过（remove ⇒ 502） |
| B42 | 边界 | 控制面 | 自检版本不兼容（`MinAPIVersion` 1.50 ⇒ 协商 > ApiVersion） | 拒登记（502 人话「API 版本不兼容」）；零落库 |
| B43 | 边界 | 控制面 | 删节点连删中途失败（2 容器，第 2 个引擎 500） | 502 + 登记行保留 + 消息携失败清单；已删者如实回报（不假装未删） |
| E34 | 错误 | 控制面 | 添节点：重名 ∥ 地址形非法（空 ∥ 显式 scheme 与档相抵 ∥ TLS 档缺件——§3 连接方式块） ∥ `user` ∥ 无会话 | 400 ∥ 400 ∥ 403 ∥ 401 |
| E35 | 错误 | 控制面 | 建容器：镜像不存在（引擎 404）∥ 名占用（409）∥ 节点不可达 | 400（含引擎原文）∥ 400 ∥ 502 |
| E36 | 错误 | 控制面 | 容器动作目标引擎 404（容器不存在——被外部删了） | 404 `not_found` |
| N53 | 正常 | 控制面 | 容器详情 + 日志 + 用量三读（假 Docker：`containers/{id}/json` ∥ `/logs`（多路复用流样件） ∥ `/stats?stream=false&one-shot=true` ∥ `/json?size=1` 在案） | 详情逐值（挂载/端口/环境/命令）；日志 = 解复用后文本（零帧头残渣；`truncated=false`）；用量 { cpuPercent, memUsed, memLimit, diskRw } 逐值；**零审计行**（读动作） |
| N54 | 正常 | 控制面 | 重启 ∥ 强杀各一次 | 引擎调用逐条命中（`POST …/restart` ∥ `POST …/kill`）；204 ⇒ 200 `{ ok: true, id }`；审计两行（`container_restart` ∥ `container_kill`——detail 逐值；键集 = `accounts/ACCOUNTS.md` §2.1） |
| N55 | 正常 | 控制面 | 镜像列表 ∥ 拉取（假 Docker：`images/json` ∥ `images/create` 流式 200） | 列表逐值（id/tags/size/created）；拉取引擎入参逐值（`fromImage=<名>` ∥ `tag=<标签>`——缺省 `latest`）；200 `{ ok, image, tag }`；审计 `image_pull` 一行 |
| N56 | 正常 | 控制面 | 镜像删除两形：`ref` = `名:标签`（force 缺省）∥ force:true | 引擎调用逐值（`DELETE /images/<ref>?force=0` ∥ `?force=1`）；200 `{ ok, ref }`；审计 `image_delete`（detail 逐值；键集 = `accounts/ACCOUNTS.md` §2.1） |
| B47 | 边界 | 控制面 | 日志 `tail` 越界（0 ∥ 5000）∥ 非数 ∥ 缺省 | 400（范围人话） ∥ 400 ∥ 200（缺省 tail=200） |
| B48 | 边界 | 控制面 | 强杀未运行容器（引擎 409） | 400 人话「容器未在运行——无需强杀」（非幂等成功——≠ stop 的 304） |
| B49 | 边界 | 控制面 | 删除镜像被引用（引擎 409）∥ `force: true` 同击 | 400（携引擎原文 + 处置句）；force:true ⇒ 引擎 `force=1` 再走 |
| B50 | 边界 | 控制面 | 拉取形非法：空 ∥ 含 `@`（digest）∥ 超长 | 400（逐形人话）；**零引擎调用**（假件断） |
| B51 | 边界 | 控制面 | 日志超 256 KiB（假 Docker 大样件） | `truncated: true` + 尾句标记（文本体 ≤ 256 KiB） |
| E39 | 错误 | 控制面 | 详情/日志/用量/重启/强杀目标不存在（引擎 404） | 404 `not_found` |
| E40 | 错误 | 控制面 | 拉取：引擎非 2xx ∥ 200 流内 `error` 两形 ∥ 节点不可达 | 400（携引擎原文）∥ 400（携引擎原文）∥ 502 `upstream_error` |
| E41 | 错误 | 控制面 | `user` ∥ 无会话 打新八端点 | 403 ∥ 401 |
| E42 | 错误 | 控制面 | 详情/日志/用量/重启/强杀节点不可达（假 Docker 关停——五端点逐打） | 502 `upstream_error`（逐句人话 + 引擎原文） |
| N57 | 正常 | 控制面 | 镜像源增/改/删/列 + 预选（本面零外呼） | 行落库逐值（`address` = 归一形——缺 scheme 补 `https://`）；`kind` 派生逐值（Hub 四别名 ⇒ `hub` ∥ Hub 镜像两主机 ⇒ `hub-mirror` ∥ 余 ⇒ `v2`——走查轮 2026-10-11 甲）；审计三行（detail 键集 = `accounts/ACCOUNTS.md` §2.1）；预选端点回七条（名/址两字段） |
| N58 | 正常 | 控制面 | v2 源两读（假 registry：`/v2/_catalog` 200 + `Link` 下一页 ∥ `/v2/<name>/tags/list` 200） | `repositories` ∥ `tags` 逐值；`truncated` = `Link` 在场 ⇒ true；`n` 缺省（引擎入参逐值：`?n=200`）；**零审计**（读动作） |
| N59 | 正常 | 控制面 | Hub 源两读（假 hub：`hub.docker.com/v2/repositories/library/nginx/tags` 200 + `next`） | 裸名 `nginx` ⇒ 路径 `library/nginx` 逐值；`page_size` = `min(n,100)`；目录读 ⇒ `{ ok: false, error: { kind: `unsupported` } }`（人话） |
| B52 | 边界 | 控制面 | 匿名 Bearer 挑战（假 registry：401 + `WWW-Authenticate: Bearer realm=…` ⇒ 假 token 端点 200） | 逐跳命中（挑战解析 ⇒ 换 token ⇒ 携 `Bearer` 复读 ⇒ 200）；scope 逐值（目录 = `registry:catalog:*` ∥ 标签 = `repository:<name>:pull`）；**零凭据**（请求头零 Basic） |
| B53 | 边界 | 控制面 | 源如实回空目录（假 registry：`{"repositories":[]}`——实测 quay 形） | 200 `{ ok: true, repositories: [], truncated: false }` + 控制台空态句（**非错误**）；零异常 |
| B54 | 边界 | 控制面 | `n` 越界（0 ∥ 5000）∥ 非数 ∥ `name` 形非法（大写 ∥ `..` ∥ 空白 ∥ `?`） | 400（逐句人话）；**零外呼**（假件断） |
| B55 | 边界 | 控制面 | 目录接口不支持（假 registry：405 `UNSUPPORTED`——实测 DaoCloud 形） | `{ ok: false, error: { kind: `unsupported`, message: 人话 } }`；控制台就地提示（不改写为「空目录」） |
| B56 | 边界 | 控制面 | 源目录读：远端 200 非 JSON ∥ 形不符（假 registry：HTML 体 ∥ `{"repositories":"x"}`） | `{ ok: false, error: { kind: `bad_response`, message: 人话 } }`；零落库；控制台就地呈 |
| E43 | 错误 | 控制面 | 增/改源：空名 ∥ 名超 40 ∥ 撞名 ∥ 撞址 ∥ 址含路径/空白 | 400（逐形人话）；**库零变**（回读逐行） |
| E44 | 错误 | 控制面 | 源目录读：不可达（死端口）∥ 超时（假件挂起）∥ 401 挑战不可解析 ∥ token 端点 401 ∥ 复读仍 401 | `{ ok: false, error: { kind: `unreachable` ∥ `timeout` ∥ `auth_required` } }`（逐形人话）；零落库；控制台就地呈 |
| E45 | 错误 | 控制面 | `user` ∥ 无会话 打镜像源七端点 ∥ 改/删不存在 id | 403 ∥ 401 ∥ 404 `not_found` |
| N60 | 正常 | 控制面 | 一键拉取全链（目录浏览窗点标签行「拉取」⇒ 节点选单 ⇒ 选节点 ⇒ 既有拉取窗预填） | 预填逐值（`<主机>[:<端口>]/<仓库>:<标签>`）∥「目标节点：{name}」行在场 ∥ 确认 ⇒ `POST …/runners/<id>/images/pull` 入参逐值（`fromImage`/`tag`）+ 审计 `image_pull` 一行 ∥ 成后节点镜像表重取（列表上新）∥ 预填可改（改后确认 = 改后值） |
| B57 | 边界 | 控制面 | 目录窗打开：无节点（空清单）∥ 全离线（概览在场） | 「拉取」钮禁用 + 一句人话（`admin.sandbox.noNodes`/`admin.sandbox.allOffline` 文案）；点击零动作 ∥ 零外呼 |
| B58 | 边界 | 控制面 | 预填两形：Hub 源（登记址任一别名）∥ v2 源含端口（`http://10.0.0.5:5000`）；仓库行 vs 标签行 | Hub ⇒ 主机 `docker.io` + 裸名补 `library/`；含端口 ⇒ `10.0.0.5:5000/…` 逐值；仓库行 ⇒ `:latest` 显式 ∥ 标签行 ⇒ 所取标签；预填可改 |
| E46 | 错误 | 控制面 | 目录窗打开时概览读败（网络败 ∥ 502） | 「拉取」钮禁用 + `mapError` 就地人话；零外呼；重开目录窗可重试 |
| N61 | 正常 | 控制面 | 拉取认源全链（手动径）：镜像区「拉取镜像」⇒ 开窗（有源在场）⇒ 选源（v2——如 `docker.1ms.run`）⇒ 输入 `ubuntu:24.04` | 「目标节点：{name}」行在场（手动径恒显——P1）；组装逐值（`docker.1ms.run/ubuntu:24.04` 就地显示——输入框可见改写）；确认 ⇒ 既有拉取端点入参逐值（`fromImage` = `docker.1ms.run/ubuntu` ∥ `tag` = `24.04`——路由零改）∥ 审计 `image_pull` 一行 ∥ 成后该节点镜像表重取（列表上新） |
| B59 | 边界 | 控制面 | 组装逐值（v2 用例四支）：① 含端口源（`http://10.0.0.5:5000`）+ `ns/repo:tag` ② 已带主机（`ghcr.io/foo/bar:1` + 选源） ③ 标签缺省（`nginx`——源同 ①） ④ 空输入 + 选源 | ① `10.0.0.5:5000/ns/repo:tag` 逐值 ② 首段（含 `.`/`:` ∥ `localhost`）被剥、换源主机（覆盖） ③ `10.0.0.5:5000/nginx:latest` 逐值（补 `:latest` 显式） ④ 不动作（输入保持空；提交仍被必填门拦） |
| B60 | 边界 | 控制面 | 组装逐值（Hub 用例 + 特形三支）：① Hub 源（四别名任一）+ 裸名 `nginx` ② 同源 + `library/nginx:1.1`（已含 `/`） ③ 输入含 `@`（digest） | ① 主机 `docker.io` + 补 `library/` ⇒ `docker.io/library/nginx:latest` ② `docker.io/library/nginx:1.1`（不重复补） ③ 原样透传（不组装——服务端既有 400 径） |
| B61 | 边界 | 控制面 | 认源态生命周期：一键拉取径（预填 + 源）⇒ 开窗；改选另一源 ∥ 改选「不选」∥ 手改输入并完成（失焦）∥ 关窗重开（记忆在场）∥ 记忆源已被删 ⇒ 重开 | 选单呈现该源（认源态）；改选 ⇒ 剥换主机重组装（预填逐值与组装同口径）；「不选」⇒ 输入不动（单向——原样提交）；手改 ⇒ 选单不自动回落（不保证与当刻输入一致）且完成即再组装（幂等）；重开 ⇒ 预选上次所选（预选态非自动改写——输入原样）；记忆源已被删 ⇒ 不选态回落（拉取不阻断） |
| B62 | 边界 | 控制面 | 无源在场 ⇒ 开窗（手动径） | 选单仅「不选（原样）」+「暂无镜像源」提示（复用 `admin.sandbox.sourcesEmpty`）；手输提交照常（零涉） |
| E47 | 错误 | 控制面 | 源清单读败（网络败 ∥ 5xx）⇒ 开窗 | 不选态 + `mapError` 就地人话；**拉取不阻断**（手输提交仍成）；重开窗可重试 |

| N62 | 正常 | 控制面 | 卷列表 ∥ 删卷（假 Docker：`GET /volumes` 样件（一示例卷——`Name`/`Driver`/`CreatedAt` 三字段） ∥ `DELETE /volumes/<名>` 204） | 列表逐值（`{ volumes: [{ name, driver, createdAt }] }`；`Volumes` 缺/null ⇒ `[]`）；删 ⇒ 200 `{ ok: true, name }` + 审计 `volume_delete` 一行（detail 键集逐值）；列表读**零审计** |
| N63 | 正常 | 控制面 | 建容器卷下拉两用例（假 Docker `POST containers/create` 在案）：① 选已有卷（`vol-a`）⇒ 提交 ② 选「新建卷（手输）」⇒ 输新名 ⇒ 提交 | ① 引擎体 `Binds` = `["vol-a:/workspace"]` 逐值 ② 引擎体 `Binds` = `["<新名>:/workspace"]` 逐值——**我方零建卷调用**（假件断：零 `POST /volumes/create`）；审计 `container_create` 各一行（既有） |
| B63 | 边界 | 控制面 | 卷清单读败 ∥ 空表 ⇒ 开建容器窗 | 卷选单只余「新建卷（手输）」；手输照常（提交不受阻——不反噬，沿镜像选单口径） |
| B64 | 边界 | 控制面 | 卷字段留空 ⇒ 提交 ∥ 删卷确认窗取消 | 留空 ⇒ 不挂（引擎体省略 `HostConfig`——现行为零回归）∥ 取消 ⇒ 零引擎调用 + 零审计行 |
| B65 | 边界 | 控制面 | 卷区表读败（节点不可达 ∥ 超时 ∥ 502）⇒ 展开节点 | 卷区行内人话（`mapError`）；**页内不反噬**（节点区/容器区照常在场——区级失败不掀页）；再展开重取可重试；零审计 |
| E48 | 错误 | 控制面 | 删在用卷（引擎 409——实读原文 `remove <名>: volume is in use - [<id>]`） | 400 人话 + 处置句（携引擎原文）；**卷在（零删）**——窗内就地呈（弹窗不关，可重试） |
| E49 | 错误 | 控制面 | 删卷：无此卷（引擎 404）∥ 名形非法（`../x` ∥ 含空格——400 零外呼）∥ 节点不可达（502）∥ `user` ∥ 无会话 | 404 `not_found` ∥ 400 ∥ 502 `upstream_error` ∥ 403 ∥ 401 |
| N79 | 正常 | 控制面 | 主机凭据录入（假 ssh 件 + 真库/真加解密）：`PUT …/runners/:id/credential`（`sshUser` + 口令） | 行密列非明文（读库核）∥ 响应零秘密字段（键面扫描）∥ `credential_state='sealed'` + `credential_updated_at` 在场 ∥ 审计 `host_credential_set`（detail 三键，零秘密） |
| N80 | 正常 | 控制面 | `exec` 进 chat（假模型 + 假 ssh `execImpl`）：一轮 ⇒ `exec(host, command)` | `call`/`result` 帧在场（args 摘要 ≤500 ∥ summary ≤300）∥ 结果**含四字段** `{ ok, exitCode, stdout, stderr }` 逐值（形全文 = `agent/ADMIN-AGENT.md` §12 表）∥ 审计 `chat_call`（tool=`exec` ∥ subject=命令原文 ∥ resultCode=exitCode）∥ 临时私钥文件用毕即删（假件断） |
| N82 | 正常 | 控制面 | 凭据撤销两径：端点径 `DELETE …/runners/:id/credential` ∥ chat 径工具 `runners.revoke_credential` | 两径同效：密列 NULL + `state='revoked'`；端点径 ⇒ 审计 `host_credential_revoke` 一行 ∥ chat 径 ⇒ **两行**（`chat_call` + `host_credential_revoke`——凭据类例外，KD-SV-91）；再 `exec` ⇒ 工具级错误「未登记凭据」 |
| B76 | 边界 | 控制面 | v17 库升 v18（存量：一 `keep` 成功行 ∥ 一 `keep` 失败行 ∥ 两 `keep` 同 runner 行） | 成功行 ⇒ 移交（后者胜——id 序）；**接收行 ⇒ 七列逐值**（`ssh_user`/`ssh_port`/`auth_kind`/`secret_cipher`/`sudo_cipher`/`credential_state='sealed'`/`credential_updated_at`）∥ 失败行 ⇒ 留 run 行（密文不动）；**未接收行 ⇒ NULL/`'none'`**（零伪造回填） |
| B77 | 边界 | 控制面 | `exec` 未登记凭据主机 ∥ 解密失败（假件）∥ 主机名歧义 | 工具级错误逐形人话（未登记 ⇒ 指向录入弹窗）；**回合不阻断**（不 notice）；零秘密入帧/审计 |
| B78 | 边界 | 控制面 | `exec` 长输出/挂起（假件：stdout 20k 字 ∥ 超时） | 结果文本按既有口径截断 ≤4000（审计 `truncated=true`）∥ 超时 ⇒ `{ ok:false, message }`（人话）——回合照常收尾 |
| E59 | 错误 | 控制面 | `PUT` 凭据形非法（缺 `sshUser` ∥ `auth.kind` 表外 ∥ `secret` 空 ∥ `sshPort` 越界 0/70000） | 400（逐形人话）；**库零变**（回读逐列） |
| E60 | 错误 | 控制面 | `exec` 主机未在册 ∥ `user` ∥ 无会话打凭据两端点 | 工具级错误（沿 `docker` 绑定语义）∥ 403 ∥ 401 |
| N64 | 正常 | 控制面 | 强制面求值序（纯求值——假件/直调）：① 目标 ∈ `127.0.0.0/8` ∥ `169.254.0.0/16` ② 目标 = server 网关地址:端口（同时落 RFC1918 ∥ 服务器段种子 deny） ③ 目标 ∈ RFC1918 种子 deny ∧ 同目标显式 allow 行在场 | ① 拒（L1——即时判 ∥ 零挂起 ∥ 零待批行） ② **放**（内置允许 ≻ L2/L3——生命线不断） ③ 放（种子 deny ≺ 显式 allow——U2-A 保持） |
| B66 | 边界 | 控制面 | 强制面带入与解析三支：① 首次登记（目标段不在） ② 重复登记（段已在） ③ `host` 在场而 `ips` 空 | ① 种子 deny 行入（`source='default'` ∥ 段值逐值）+ `rulesRev` +1 + 审计一行（自动带入标） ② 零重行 ∥ `rulesRev` 零动 ∥ 零审计 ③ 拒（fail-closed——不得以「未解析」放行） |
| N83 | 正常 | 控制台 | 终端会话全链（假 Docker 升级件 + 真库）：升级握手 ⇒ 读容器 ⇒ 建 exec ⇒ 升级 start ⇒ 键入 ⇒ 引擎回显 | 握手响应 `Sec-WebSocket-Accept` 逐字 ∥ 建 exec 体逐值（`AttachStdin/AttachStdout/AttachStderr` = true ∥ `Tty` = true ∥ `Env` = `TERM=xterm-256color` +（容器无 locale 时）`LANG=C.UTF-8` ∥ `Cmd` = 常量三件）∥ start 体 = `{ Detach: false, Tty: true }` ∥ 上行二进制帧 ⇒ 引擎侧收到同字节 ∥ 引擎字节 ⇒ 下行二进制帧同字节 ∥ 首帧 `resize` 就绪后一次发出（`h`/`w` 逐值）∥ 引擎流结束 ⇒ 下行 `{"t":"exit","code":<inspect ExitCode>}` ⇒ WS close 1000 ∥ 审计两行（`terminal_open` 键集五 ∥ `terminal_close` 键集五、`reason='exec_exit'`、`durationMs` 在场） |
| N84 | 正常 | 控制台 | 就绪协作：`ready` 帧（`cols`/`rows` = 当刻施加值）∥ 客户端 `{"t":"ping"}` ⇒ `{"t":"pong"}` ∥ 客户端 `resize` 变更 ⇒ 引擎 `resize?h&w` 逐值再发 | `ready` 在首帧 resize 之后（挂起施加）∥ `pong` 即时 ∥ 二次 resize 逐值（`h` = rows ∥ `w` = cols——引擎参数序在案） |
| N85 | 正常 | 控制台 | 会话表与停机：两会话并存（同容器）⇒ 服务端停机 | 两会话各自独立 execId/审计对；停机 ⇒ 两会话全收口（`reason='server_stop'`）+ 会话表清空（零悬挂） |
| B79 | 边界 | 控制台 | 非运行容器：直连升级（前端门被绕过）∥ 就绪前 resize ∥ resize 非法（0 ∥ 字符串 ∥ cols 999） | in-band `{"t":"error","code":"container_not_running"}`（不开 exec——引擎零 exec 调用）⇒ 收口；未就绪 resize ⇒ 挂起（零引擎调用）∥ 非法 ⇒ 忽略（零引擎调用 ∥ 会话不受影响） |
| B80 | 边界 | 控制台 | 心跳两径：① 服务端 ping 后客户端不回 pong（假件——60s 推进时钟） ② 客户端 60s 无下行 | ① 判死 ⇒ 收口三件逐呼（`\x04` 写入 ∥ Docker 连接 destroy ∥ WS close）+ 审计 `terminal_close`（`reason='client_close'`——心跳判死归此值）∥ ② 客户端侧回调 `onClose("stale")`（本地态「已断开」+ 重连钮）——零服务端假设 |
| B81 | 边界 | 控制台 | 收口幂等：客户端 close 与引擎流结束几乎同时到达 ∥ 建链中途客户端断（start 应答前） | 收口一次（零第二行审计 ∥ 零第二次 `\x04`）∥ 断后 start 应答到达 ⇒ 立即收口（会话表零悬挂 ∥ exec 不残留） |
| E61 | 错误 | 控制台 | 引擎不可达（连接拒/超时）∥ 建 exec 409（窗口期容器被停）∥ exec 非 2xx | in-band `engine_unreachable` ∥ `container_not_running` ∥ `exec_failed`（携引擎原文 `detail`）；各自审计 `terminal_close`（`reason='error'`）+ 表清空 |
| E62 | 错误 | 控制台 | 升级请求：无 cookie ∥ `user` 会话 ∥ 异源 `Origin` ∥ 未知升级路径 ∥ 节点不存在 | 401 ∥ 403 ∥ 403 ∥ 404（socket 保持 HTTP 语义后断开）∥ 404——**全在 101 之前**（零 `Sec-WebSocket-Accept`） |
| E63 | 错误 | 控制台 | WS 协议错（假客户端）：未掩码帧 ∥ 非法 opcode ∥ 帧超 1 MiB ∥ 文本帧非 UTF-8 | 收口（close 1002）+ 审计 `terminal_close`（`reason='error'`）+ 会话表清空；服务端不崩（畸形流零残留） |

**执行面用例（sandbox-exec-rebuild 批——本批）= `sandbox/EXECUTION.md` §13**（N65–N70 ∥ B67–B73 ∥ E50–E55——本档不复制；用例链引用：B39 ⇒ N69 ∥ E33 ⇒ B67/P7）。

## 13. 本域文件与行数预算（控制面）

| 档 | 行数（设计估） | 职责 |
|---|---|---|
| `thincoder-server/src/sandbox/routes.mjs`（现读 **477**——2026-10-13 现读） | **sandbox-exec-rebuild 批（本批）：净 −≈137**（工作区面四路由 + 视图函数拆出 ⇒ `workspace-routes.mjs`——拆案首选执行；动作响应形随正）⇒ **≈340**（余量 ≈160）；**本增补 #2 +≈55**（连接方式端点 ∥ 添加节点体扩 ∥ 自检携档）⇒ ≈**395**；**本批（sandbox-onboarding-removal）−≈4**（导入 ∥ 转注册 ∥ 重启恢复调用删净） | 余面端点（§8/§9） |
| `thincoder-server/src/sandbox/registry.mjs`（现读 **564**——2026-10-13 现读；**越 500 软线**） | **sandbox-exec-rebuild 批（本批）：净 −≈184**（队列/心跳死件删净——`enqueueTask`/`claimTasks`/`reportTask`/`sweepStuckTasks`/`lastTaskView`/心跳块三件 ∥ + 实时门异步化 ∥ 放置收正）⇒ **≈380**（拆分预案随之消解——死件即拆案对象）；**本增补 #2 +≈30**（材料列写入 ∥ 行形增 `connection`/`tls` 元数据）⇒ ≈**410** | 登记/读数 ∥ 可用性门 ∥ 放置 |
| `thincoder-server/src/sandbox/hosts.mjs`（已落——admin-chat-creds-merge 批） | **实读 133**（2026-10-13 现读；设计估 ≈**140**——凭据写/撤销（形校验 + 加密 + 审计两 kind）∥ 主机 SSH 视图 ∥ `execOnHost`（解密 + `ssh.mjs` 执行 + 临时私钥清理——chat `exec` 工具与主机运维共用）；假件注入 = 供测试用） | 主机凭据面（§3 主机凭据块） |
| `thincoder-server/src/sandbox/docker.mjs`（已落盘 **333**——2026-10-13 实读（split 口径；在册 327 为 2026-10-11 陈读；设计期读 187）） | **⇒ ≈330 ⇒ 实读 327**（sandbox-docker-admin 批：+≈143 = 详情/日志（含解复用）/用量两读/重启/强杀/镜像三件/拉取流扫描/形校验 ∥ 常量/头注）；本批（sandbox-image-quick-pull）零触；sandbox-volumes 批 **+≈8**（`volumes` 列表 ∥ `removeVolume` 删除两法 + 头注句）；**sandbox-exec-rebuild 批（本批）：≈490**（+networks/archive/containerState/建盒参数；本增补 +≈60——全形 = `sandbox/EXECUTION.md` §14）；**本增补 #2 +≈25**（地址归一按档 ∥ 传输两参（`config`/`requestImpl`）注入）⇒ ≈**515**（投影）；**实读 423（2026-10-14 收口）——未越 500 软线，拆案撤回** | Docker API 客户端（§3） |
| `thincoder-server/src/sandbox/container-routes.mjs`（已落盘 **313**——2026-10-11 现读（轻通道笔 3 落地后；Δ2 = 实增 +1 行 ∥ 尾空行口径 +1；在册设计期读 168）） | **⇒ ≈330 ⇒ 实读 311**（sandbox-docker-admin 批：+≈162 = 详情≈18 ∥ 日志≈22 ∥ 重启/强杀≈25 ∥ 用量≈28 ∥ 校验/错误映射≈45 ∥ 路由注册与头注≈24；低于估 19）**⇒ 现读 313**（轻通道笔 3 落地后——列报收正；本批 ±0 结论不受影响）；sandbox-volumes 批 **±0**（卷族独立成档——本档零触） | 容器面路由（§3 家族——拆分档） |
| `thincoder-server/src/sandbox/image-routes.mjs`（已落盘 **132**——2026-10-11 sandbox-image-sources 批现读（在册 ≈130——越估 2）） | **±0**（sandbox-image-sources 批零触）；本批（sandbox-image-quick-pull）**零触**（拉取径单源——§3 一键拉取块实读句） | 镜像族路由（§3） |
| `thincoder-server/src/sandbox/volume-routes.mjs`（已落——sandbox-volumes 批） | **实读 101**（2026-10-13 现读；设计估 ≈**110**——两端点（列 ∥ 删）：名形校验（400 零外呼） ∥ 在用 409 ⇒ 400 人话 + 处置句 ∥ 审计 `volume_delete` ∥ `volumeView` 逐值 ∥ 头注） | 卷族路由（§3——按族拆档，沿容器/镜像族之例） |
| `thincoder-server/src/sandbox/image-sources.mjs`（已落盘 **132**——2026-10-11 sandbox-image-sources 落地后现读（在册 ≈170——低于估 38）；对 `read` 计数 133 差 1 = 尾空行——split 口径差 1，沿 `webui/WEBUI.md` §5 同款行注） | ≈**170**（设计估——预选表六条 ∥ 地址归一/形校验 ∥ `sourceKind` 派生 ∥ `image_sources` 存取）**⇒ 实读 132**；本批（sandbox-image-quick-pull）±0；本批（sandbox-pull-by-source）**±0**（头注句随 KD-SV-96 收正——结构不变） | 镜像源清单模型（§3） |
| `thincoder-server/src/sandbox/registry-client.mjs`（已落盘 **225**——2026-10-11 sandbox-image-sources 落地后现读（在册 ≈230——低于估 5）） | ≈**230**（设计估——v2 `_catalog`/`tags/list` ∥ Hub 公共 API ∥ 匿名 Bearer 挑战 ∥ 有界/`Link` 截断 ∥ 五分类错误映射；`fetchImpl` 注入 = 供测试用）**⇒ 实读 225**；本批（sandbox-image-quick-pull）±0 | 远端源客户端（§3） |
| `thincoder-server/src/sandbox/image-source-routes.mjs`（已落盘 **150**——2026-10-11 sandbox-image-sources 落地后现读（在册 ≈170——低于估 20）） | ≈**170**（设计估——七端点：列/预选/增/改/删/目录/标签 ∥ 校验与错误映射 ∥ 头注）**⇒ 实读 150**；本批（sandbox-image-quick-pull）±0 | 镜像源端点（§9） |
| `thincoder-server/src/sandbox/ssh.mjs`（已落——托管接入增补） | **实读 221**（2026-10-13 现读；设计估 ≈180——SSH 传输：spawn openssh（key `-i` ∥ `sshpass -e`） ∥ keyfile/known_hosts 落数据目录 ∥ 指纹 TOFU ∥ 超时/输出截断；`execImpl` 注入 = 供测试用） | 主机执行传输（§3） |
| `thincoder-server/src/sandbox/rules.mjs`（已落） | **实读 498**（2026-10-13 现读；split 口径 499——口径差 ±1；设计估 ≈230 偏小）；**sandbox-exec-rebuild 批零触**（egress/DNS 闸 = 读面消费 `evaluateEgress`/`HARD_DENY_CIDRS`/待批三件——零改）⇒ 拆案留待下一触碰批（台账 #1352 在案） | 规则/待批/修订号（§4/§6） |
| `thincoder-server/src/sandbox/credentials.mjs`（已落） | **实读 31**（2026-10-13 现读；设计估 ≈80 偏大） | 工作区 key（§7） |
| `thincoder-server/src/store/db.mjs`（现读 **688**——2026-10-13 现读） | **sandbox-exec-rebuild 批（本批）：拆案实施**——迁移段外提 `src/store/migrations.mjs`（拟新增；**命名 = `migrations.mjs` 单源**——本节旧称 `schema.mjs` 收正）⇒ `db.mjs` ≈**300**（开库/PRAGMA/语句封装/版本引用）+ `migrations.mjs` ≈**470**（v2–v22 段链 + v22 收正段——纯搬移零语义；**本增补 +≈40**：`base_image` 列 ∥ `registry_credentials` 建表；**本增补 #2 +≈10**：连接材料四列 `ALTER`）⇒ ≈**480**；触发 = 实读越 700 线（688 + v22 段 ≈20 ⇒ ≈708） | v11–v13 ∥ v15 ∥ v18 ∥ **v22 段（§2）** |
| `thincoder-server/src/accounts/audit.mjs`（已落盘 109） | **±0**（sandbox-image-sources 批——三 kind 走 `sandbox_event`，非枚举）；本批（sandbox-image-quick-pull）±0（拉取走既有 `image_pull` 行——零新 kind）；sandbox-volumes 批 ±0（`volume_delete` 走既有 `sandbox_event`——kind 非枚举，CHECK 零动） | 十三型（§2） |
| `thincoder-server/src/gateway/errors.mjs`（已落盘 64——2026-10-10 现读） | **±0**（runner-admin-console 批——零新码） | `sandbox_unavailable`（§9） |
| `thincoder-server/src/sandbox/docker-exec.mjs`（拟新增——本批） | ≈**230**（设计估——Docker exec 升级传输：建 exec ∥ 升级 start（`Connection: Upgrade` + `Upgrade: tcp`——`node:http` 劫持）∥ resize ∥ inspect ∥ 收口（`\x04` + destroy）；超时档同族（读类 3s ∥ 动作类 15s）） | 容器终端会话链（§3 容器终端块） |
| `thincoder-server/src/sandbox/terminal-routes.mjs`（拟新增——本批） | ≈**300**（设计估——升级路一枚：路径匹配 ∥ 判权/同源门（101 前）∥ 会话桥（字节双向 ∥ 控制帧 ∥ 心跳 ∥ 收口幂等）∥ 会话表（停机全收口）∥ 审计两 kind） | 容器终端升级路（§9 ∥ §3） |
| `thincoder-server/bin/thincoder-server.mjs`（现读 **214**——2026-10-13 现读） | **sandbox-exec-rebuild 批（本批）+≈12**（ticker ∥ DNS 闸装配 ∥ 工作区面路由注册；**本增补 +≈3**：registry-cred 路由注册）⇒ ≈**229** ∥ **sandbox-container-terminal 批 +≈9**（hub 装配 ∥ `upgrade` 传参 ∥ 停机收口）⇒ ≈**238** | import + 注册行 + 装配 |
| `thincoder-server/src/sandbox/box.mjs`（拟新增——本批） | ≈**315**（≈280 + **本增补 +≈35**：镜像就位步 ∥ 参数集底键解析） | 盒生命周期动作链 ∥ 建盒参数集 ∥ 放置/补放置 ∥ 卷目录准备 ∥ 定时器（空闲/墙钟/周期快照——`sandbox/EXECUTION.md` §3） |
| `thincoder-server/src/sandbox/quota.mjs`（拟新增——本批） | ≈**120** | 磁盘限额（探明 ∥ 项目配额/loopback ∥ 读回核——§4） |
| `thincoder-server/src/sandbox/egress.mjs`（拟新增——本批） | ≈**220** | 规则文本生成 ∥ 下发（nft/iptables）∥ 就位检查 ∥ apply 状态（§5） |
| `thincoder-server/src/sandbox/dns-gate.mjs`（拟新增——本批） | ≈**220** | DNS 应答器 ∥ 归属判 ∥ 待批持答/裁定回填 ∥ 临时集（§6） |
| `thincoder-server/src/sandbox/workspace-routes.mjs`（拟新增——本批） | ≈**280**（≈190 + **本增补 +≈90**：`baseImage` 键 ∥ derive 端点 ∥ 列表行字段） | 工作区面四路由 + 快照列表（自 `routes.mjs` 拆出——拆案首选执行） |
| `thincoder-server/src/store/migrations.mjs`（拟新增——本批） | ≈**470**（≈430 + **本增补 +≈40**） | 迁移段链（v2–v22——自 `db.mjs` 外提，纯搬移零语义；含 v22 收正段） |
| `thincoder-server/deploy/sandbox-probe.mjs`（拟新增——本批） | ≈**320** | 探针执行器（P1–P14 ∥ 一次性容器径 ∥ PASS/FAIL/SKIP/退出码——§10） |
| **小计** | **≈+1172 ⇒ 本批 ≈+316**（runner-admin-console 批：routes +≈133 ∥ registry −≈22 ∥ docker 新 ≈170 ∥ db +≈35；errors ∥ bin ±0）**⇒ 增补 ≈+640**（托管接入：ssh 新 ≈180 ∥ onboarding 新 ≈300 ∥ onboarding-routes 新 ≈130 ∥ routes ±≈5 ∥ db +≈25；agent 域另计——`agent/ADMIN-AGENT.md` §6）**⇒ 本批 ≈+438**（sandbox-docker-admin：container-routes +≈162 ∥ image-routes 新 ≈130 ∥ docker +≈143 ∥ routes ±≈3；webui 面 = `webui/WEBUI.md` §5）**⇒ 本批 ≈+604**（sandbox-image-sources：image-sources 新 ≈170 ∥ registry-client 新 ≈230 ∥ image-source-routes 新 ≈170 ∥ db +≈32 ∥ bin +≈2——webui 面 = `webui/WEBUI.md` §5）**⇒ 实读（sandbox-image-sources 落地后——#1275 回填）：三新档 132 ∥ 225 ∥ 150 ∥ `db.mjs` 476 ∥ `bin` 191**（可核部 ≈+527——对估 ≈+604 差 = 估值差）；**本批（admin-chat-creds-merge）：≈+278**（分项和——`hosts.mjs` 新 ≈140 ∥ `registry.mjs` +≈25 ∥ `onboarding.mjs` +≈27 ∥ `routes.mjs` +≈14 ∥ `db.mjs` +≈72——webui 面 = `webui/WEBUI.md` §5；agent 面 = `agent/ADMIN-AGENT.md` §6）；**本批（sandbox-image-quick-pull）：服务端 ±0**（纯前端面——零新端点 ∥ `src/**` 零触；webui 面 = `webui/WEBUI.md` §5）；**本批（sandbox-pull-by-source）：服务端 ±0**（纯前端面——零新端点；`src/**` 唯一笔 = `image-sources.mjs` 头注句随 KD-SV-96 收正——±0 行；webui 面 = `webui/WEBUI.md` §5）；**本批（sandbox-volumes）：≈+120**（volume-routes 新 ≈110 ∥ docker +≈8 ∥ routes +2 ∥ 余 ±0——webui 面 = `webui/WEBUI.md` §5）**⇒ 本批（sandbox-outbound-member-face）：≈+48**（`rules.mjs` +≈36 ∥ `routes.mjs` +≈12 ∥ `registry.mjs` ±0——webui 面 = `webui/WEBUI.md` §5）**⇒ 本批（sandbox-exec-rebuild）≈+1180**（分项和——新五档 ≈280+120+220+220+190 = 1030 ∥ `registry.mjs` 564 ⇒ ≈380 ∥ `routes.mjs` 477 ⇒ ≈340 ∥ `docker.mjs` 333 ⇒ ≈430（本增补再 +≈60 ⇒ ≈490）∥ `db.mjs` 拆案：≈300 + `migrations.mjs`（拟新增）≈430（净 +≈42；本增补再 +≈40 ⇒ ≈470）∥ `deploy/sandbox-probe.mjs`（拟新增）≈320 ∥ `bin` ≈226（本增补再 +≈3 ⇒ ≈229）；盒镜像 Dockerfile +≈13 归 member-face 批账；批内件两件 ≈620 ∥ ≈330——本增补分项和另计 ≈+686）**⇒ 本批（sandbox-container-terminal）≈+530**（`docker-exec.mjs`（拟新增）≈230 ∥ `terminal-routes.mjs`（拟新增）≈300；`bin` +≈9 入其行 ∥ `gateway` 面（`ws.mjs` 新 ≈260 ∥ `server.mjs` +≈12）= `gateway/API.md` §4；webui 面 = `webui/WEBUI.md` §5；批内件两件 ≈420 ∥ ≈380）**⇒ 本批（sandbox-onboarding-removal）：−≈479**（`onboarding.mjs` 373 删 ∥ `onboarding-routes.mjs` 102 删 ∥ `routes.mjs` −≈4——两档行随之删；agent 域面 = `agent/ADMIN-AGENT.md` §6） | —— |

- `routes.mjs` 拆分预案（**首选已执行**——容器面拆 `container-routes.mjs`（已落盘 **313**）；**本批（sandbox-exec-rebuild）第二项首选执行 = 工作区面拆 `workspace-routes.mjs`**（工作区四路由 + 视图函数 ≈190；拆后 ≈340））：
  **触发点 = 越 500 软线**；次选候选（落域内、端点路径零变）：规则/待批/设置三面独立成档（≈120）。
- `rules.mjs` 贴线（2026-10-13 现读 **498–499**）：距 500 软线 **1–2 行**——**member-face-chat 批 · 裁定修订轮触碰**（`ensureProjectAllow` 带入缝 +≈20 ⇒ ≈518 ⇒ **越线**）；结构决策 = 拆案（规则/待批/修订号三面独立成档）——实施批先行裁决（台账 #1352 转触发中）。
- `registry.mjs` 拆分预案（2026-10-13 本批现读 **564**）：**随本批销**——拆案对象 = 队列/心跳死件，本批删净（净 −≈184 ⇒ ≈380）。
- `docker.mjs` 拆分预案（2026-10-13 本增补 #2 投影 ≈515）：**2026-10-14 收口实读 423（内容行 422）——未越 500 软线，拆案撤回**（后续批增量越线再议——沿 sandbox-docker-admin 批拆档先例）。
- `rules.mjs`/`credentials.mjs` 等「拟新增」标记已收正在态（2026-10-13 清账轮——六行：hosts ∥ volume-routes ∥ ssh ∥ onboarding-routes ∥ rules ∥ credentials）；执行面预算随重做批重建；webui 预算 = `webui/WEBUI.md` §5；单元测试档预算 = 批档 §2；板账 = `docs/server/design/PROJECT.md` §6。
- **本批（member-face-chat——成员写面 + 上限；2026-10-13）**：`routes.mjs`（实读 **476** ⇒ ≈**520**——成员写面四路由 + 上限校验；**越 500 软线 ⇒ 拆案（已在案）执行 = 工作区面独立成档**（工作区四路由 + 视图函数 ≈150——首选））
  ∥ `registry.mjs`（实读 564——越软线既有；本批 +≈20——上限设置读/创建校验；拆案随重做批） ∥ `deploy/sandbox/member-shell/**`（新 ≈730——**档账入 `agent/MEMBER-AGENT.md` §5，本域不重计**）。
- **本批裁定修订轮加笔（member-face-chat——登记即放行；2026-10-13）**：`rules.mjs`（现读 **498–499** ⇒ ≈**518**——`ensureProjectAllow` 带入缝 +≈20——**越 500 软线 ⇒ 拆案触发**（台账 #1352 转「触发中」——拆案对象 = 规则/待批/修订号三面独立成档；实施批先行裁决）） ∥ 源登记 handler 接线 = project 域 `admin-routes.mjs` 一行（域外行账 = `project/PROJECTS.md` §13）。
- **本批（sandbox-outbound-member-face——台账 #1248/#1249/#1233/#1234）**：控制面 = `rules.mjs`（实读 **439** ⇒ **498–499**——实测 +59–60〔内容行 498 ∥ split 499〕；设计估 ≈475——**贴线**：距 500 软线 1–2 行，越线前处置在案〔台账 #1352〕）∥ `routes.mjs`（实读 **472** ⇒ **476**——实测 +4；设计估 ≈484）∥ `registry.mjs`（实读 **564**——越 500 软线，拆分预案在册）±0；
  前端 = `views-me-sandbox.mjs`（已落——本批）≈**140** ⇒ **实读 124**（实测——低于估 16；成员页：表六列 ∥ 提示行 ∥ 10s 轮询）∥ `app.mjs` ⇒ **实读 204**（本批 +2 = import ∥ 路由行）∥ `nav.mjs` ⇒ **实读 102**（本批 +1 = 我的组增项）；
  i18n = `i18n-zh-me.mjs` ⇒ **实读 89** ∥ `i18n-en-me.mjs` ⇒ **实读 90**（本批 +19 键/表——`me.sandbox.*`）∥ `i18n-zh-shell.mjs` ⇒ **实读 79** ∥ `i18n-en-shell.mjs` ⇒ **实读 77**（本批 +1 键/表——`nav.page.me.sandbox`）；`style.css` +≈4（提示行/状态标）；
  **本批单元测试档两件**（`docs/batches/2026-10-13-sandbox-outbound-member-face.test.mjs` 估 ≈**300** ⇒ **实读 379**；求值序/强制面 ∥ 网段带入幂等 ∥ 成员端点逐值 ∥ `docs/batches/2026-10-13-sandbox-outbound-member-face-ui.test.mjs` 估 ≈**220** ⇒ **实读 374**；成员页渲染 ∥ 提示/轮询 ∥ i18n 键集 ∥ nav 计数）。
- **本批单元测试档（sandbox-exec-rebuild——入 server 链）**：`docs/batches/2026-10-13-sandbox-exec-rebuild.test.mjs`（服务面——估 ≈**620**：盒动作链逐条（假 Docker/假 SSH）∥ 参数集逐值 ∥ 放置/定时器 ∥ 实时门 ∥ v22 迁移（含删表）∥ `migrations.mjs` 拆案读判 ∥ #1351 事务）∥
  `docs/batches/2026-10-13-sandbox-exec-rebuild-egress.test.mjs`（执行面件——估 ≈**330**：规则文本位次 ∥ 下发幂等/单事务 ∥ DNS 闸三径（放行/拒/待批持答）∥ 解析过滤 ∥ 临时集回收）。
- **本增补单元测试档（sandbox-exec-rebuild 批 · 修订轮——底座可换；入 server 链）**：`docs/batches/2026-10-13-sandbox-exec-rebuild-base.test.mjs`（服务面——估 ≈**320**：派生 tag/Id 内容寻址 ∥ Dockerfile 逐行 ∥ 镜像就位四步（假 Docker——缓存/拉取/构建三径）∥ 凭据 CRUD/加密/`X-Registry-Auth` 组装 ∥ `baseImage` PATCH ∥ 建盒链 ④ 两腿（**缺省零新增调用**））∥
  `docs/batches/2026-10-13-sandbox-exec-rebuild-base-ui.test.mjs`（前端面——估 ≈**220**：两卡渲染 ∥ 设置底座/凭据弹窗 ∥ 构建在飞态 ∥ i18n 键集 ∥ 档目）。
- **本增补服务端件（sandbox-exec-rebuild 批 · 修订轮——底座可换）**：`derive.mjs`（拟新增）≈200 ∥ `registry-creds.mjs`（拟新增）≈130 ∥ `registry-cred-routes.mjs`（拟新增）≈110 ∥ `image-routes.mjs`（实读 **132** ⇒ ≈**150**——拉取凭据注入 + 审计 `auth` 键）∥
  `workspace-routes.mjs`/`box.mjs`/`docker.mjs`/`bin` 四行 delta——**增补分项和 = ≈+686**（三新档 ≈440 + 五行 delta ≈206 + 迁移段 +≈40）；全形 = `sandbox/EXECUTION.md` §14；webui 面 = `webui/WEBUI.md` §5 ∥ `webui/SANDBOX.md` §3。
- **本增补 #2 服务端件（sandbox-exec-rebuild 批 · 连接面 TLS 档）**：`docker-tls.mjs`（拟新增）≈**220**（三件形校验 ∥ 材料加解密存取（复用 `credential-crypto.mjs`）∥ 连接元数据视图 ∥ `node:https` 传输适配件）
  ∥ 六处 delta（`routes` +≈55 ∥ `registry` +≈30 ∥ `docker` +≈25 ∥ `migrations` +≈10 ∥ 容器/镜像/卷/终端四路由（各 +≈3）≈12 ∥ 盒链 `config` 透传 +≈3——合计 ≈135）⇒ **本增补 #2 分项和 ≈+355**（`docker-tls.mjs` ≈220 + delta ≈135）；
  **单元测试档两件**（`docs/batches/2026-10-13-sandbox-exec-rebuild-tls.test.mjs` ≈180 ∥ `…-tls-ui.test.mjs` ≈140——入批档 §2）；webui 面 = `webui/WEBUI.md` §5 ∥ `webui/SANDBOX.md` §3。
- 单元测试档三件（入 server 链）：`docs/batches/2026-10-10-runner-admin-console.test.mjs`（服务面——Docker 客户端 ∥ 路由 ∥ v12 迁移；估 ≈420）∥
  `docs/batches/2026-10-10-runner-admin-console-ui.test.mjs`（前端面——运行面渲染 ∥ nav ∥ i18n 键集；估 ≈260 ⇒ ≈330——+托管接入块）∥
  `docs/batches/2026-10-10-runner-admin-console-agent.test.mjs`（托管接入/agent——假 ssh ∥ 五工具 ∥ 任务生命周期 ∥ 凭据加密/零化 ∥ v13 迁移；**实读 637**（2026-10-14 fix 轮实读——设计估 ≈420，差 +217）；**本批（sandbox-onboarding-removal）整档删**——任务面用例随件退场）；批档 §2 列全。
- **本批单元测试档（sandbox-docker-admin——入 server 链）**：`docs/batches/2026-10-11-sandbox-docker-admin.test.mjs`（服务面——估 ≈420：docker 客户端读数/流解复用/拉取扫描 ∥ 八路由 ∥ 假 Docker）∥
  `docs/batches/2026-10-11-sandbox-docker-admin-ui.test.mjs`（前端面——估 ≈280：容器详情/日志/用量面渲染 ∥ 镜像区 ∥ 弹窗 ∥ i18n 键集 ∥ 档目）。
  **随正件**（父侧落——实施轮同拍）：`docs/batches/2026-10-06-server-gateway-webui-deploy.test.mjs`（档目断言 +2 名——`views-sandbox-containers.mjs` ∥ `views-sandbox-images.mjs`）∥ 门禁件数断言件七件（**45 ⇒ 47**——chat 批三件 + 本批两件；盘面实读）∥ `thincoder-server/package.json`（`prepublishOnly` **45 ⇒ 47**——本批两件入链；盘面实读）。
- **本批单元测试档（sandbox-image-sources——入 server 链）**：`docs/batches/2026-10-11-sandbox-image-sources.test.mjs`（服务面——估 ≈420 ⇒ 实读 **682**（sandbox-image-sources 落地后）：源清单模型（形校验/名址唯一/预选） ∥ registry-client（v2 与 Hub 两面读 ∥ 匿名 Bearer 挑战 ∥ 有界/`Link` 截断 ∥ 五分类映射） ∥ 七端点 ∥ v15 迁移；假 registry/hub）∥
  `docs/batches/2026-10-11-sandbox-image-sources-ui.test.mjs`（前端面——估 ≈280 ⇒ 实读 **514**（sandbox-image-sources 落地后）：镜像源卡渲染 ∥ 增/改/删弹窗（预选回填） ∥ 目录浏览窗（两列表 + 两过滤） ∥ 五分类读绪 ∥ 本地镜像表过滤 ∥ i18n 键集 ∥ 档目）。
- **本批单元测试档（sandbox-image-quick-pull——入 server 链）**：`docs/batches/2026-10-11-sandbox-image-quick-pull.test.mjs`（前端面——估 ≈180 ⇒ **实读 437**（2026-10-11——实施落盘；差 +257——8 用例全展开，含修复轮键盘补用例）：预填拼装纯函数（去 scheme ∥ Hub 主机收正 ∥ `:latest`） ∥ 目录窗「拉取」钮可用态 ∥ 节点选单 ∥ 拉取窗预填参 ∥ i18n 键集 ∥ 档目）。
- **本批单元测试档（admin-chat-creds-merge——入 server 链）**：`docs/batches/2026-10-12-admin-chat-creds-merge.test.mjs`（服务面——估 ≈420 ⇒ **实读 606**（2026-10-13）：v18 迁移（回填三用例）∥ 凭据写/撤销 + 形校验 ∥ `execOnHost`（假 ssh）∥ `runnerByRef` ∥ chat `exec` 工具（假模型/假 ssh——帧/审计/掩蔽/私钥清理）∥ i18n/档目随正）。
- **本批单元测试档（sandbox-pull-by-source——入 server 链）**：`docs/batches/2026-10-11-sandbox-pull-by-source.test.mjs`（前端面——估 ≈450：组装纯函数逐值（v2 四用例 ∥ Hub 三支）∥ 可用态两分支（无源 ∥ 读败）∥ 预填认源态与改选 ∥ 窗口接线 ∥ i18n 键集 ∥ 档目）。

- **本批单元测试档（sandbox-volumes——入 server 链）**：`docs/batches/2026-10-11-sandbox-volumes.test.mjs`（服务面——估 ≈220：卷两路由（假 Docker：`GET /volumes` 样件 ∥ `DELETE` 204/404/409 三形映射） ∥ 名形校验零外呼 ∥ 审计行 ∥ 列表零审计）∥
  `docs/batches/2026-10-11-sandbox-volumes-ui.test.mjs`（前端面——估 ≈300：卷区渲染 ∥ 删除确认窗（取消零调用） ∥ 建容器卷选单（已选/手输两用例 + 读败/空） ∥ i18n 键集 ∥ 档目）。

## 14. 关键决策（本域）

| # | 决策 | 理由 | 被否候选与何故否 |
|---|---|---|---|
| KD-SV-63 | **两平面分离**：server = 控制面（登记/编排/治理），盒只跑在 runner 节点（远程 Docker API 节点——可多台；集群化 = 用 Docker 自己的集群——§1） | 用户 14:00 裁定（单点被压死即全死）；控制面常驻质量与盒资源耗尽解耦 | 同机跑盒（否——单点故障 + 资源争用） |
| KD-SV-67 | **未提交保护 = 卷保留 ∥ WIP 快照 ∥ 销毁显式确认**（拆盒/停盒永不删卷；快照触发 = 控制端定时器——§1；销毁 = 管理员显式确认） | 工作区状态 = git 仓（可重建），节点本地卷 = 缓存；快照兜住未提交面（需求「停（卷∥快照留存）」——§5 工作区生命周期行） | 卷迁移（跨机传输机制重——否）；无保护（违「别被测试代码打崩」精神——否） |
| KD-SV-68 | **出站 = 两类同表两闸**（CIDR（网络层）+ 域名（应用层），解析后 IP 二查；显式 deny 恒先（种子 deny ≺ 显式 allow——U2）；增删即生效） | 需求块两闸次序与两类同表的直接落地；强制面 = 主机侧走 SSH（§1） | 纯代理（CIDR 直连场景失真——否）；纯网络层（域名不可行——需求块已裁——否） |
| KD-SV-69 | **待批队列 = 三态 + 60s + 三次建议**（需求块：新域挂起 ⇒ 控制台批准一次/记住/拒绝；超时拒；三次批准 ⇒ 建议入默认单） | 需求块 + 行业形（Claude Code 同形） | 一律硬拒（体验差——需求块已否）；自动放行（安全面破——否） |
| KD-SV-70 | **每工作区凭据 = `api_keys` 行**（名 `sandbox:<ws>`；归属负责人；明文存控制面） | 复用客户面 token 面（需求块原句）；校验/记账/配额全链零改；明文 = 盒重建再注入所需（先例 KD-SV-19） | 新 key 族（第二校验面——否）；每次重建新签发（行累积 + 链路抖动——否） |
| KD-SV-71 | **可用性门 = 无可用节点 ⇒ 仅沙盒功能面不可用**（不降级）；**server 启动与运行零依赖沙盒/runner**（用户 14:24——网关 ∥ 记账 ∥ 控制台其余页 ∥ 客户面零影响） | 用户 13:43「不要考虑什么退路」的延续（限于沙盒面）+ 用户 14:24 裁定（server 零依赖） | 降级为直跑进程（否——违容器唯一形态）；server 因缺节点拒启或整站降级（否——违用户 14:24） |
| KD-SV-72 | **执行面共用**（runner 与 CI——用户 14:00 裁定⑦）：CI 与沙盒共用同一执行节点面；接口/形态随重做批定形 | 「跑不受信的仓」本质同——一套节点面 | 另建 CI 专用节点族（节点面翻倍——否） |
| KD-SV-73 | **盒参数集** = read-only 根 + 唯一卷 + tmpfs 例外 + cap-drop + 非 root + 每工作区网络 | 需求块「每工作区一盒 + `--read-only` + 唯一可写挂载」的逐项落地；每工作区网络 = 跨工作区隔离（威胁模型面） | 共享网络（跨工作区可达——否）；特权盒（提权面——否） |
| KD-SV-74 | **磁盘配额 = 项目配额优先 ∥ loopback 备选**（主机侧——SSH 执行；用户 19:52 定） | 项目配额（xfs pquota ∥ ext4 prjquota）零额外设备；loopback 全平台可落但耗 loop 设备 | 无配额（需求块明列——否）；容内自填盘监控（用户态不可靠——否） |
| KD-SV-76 | **网络层闸 = nft 优先 ∥ iptables 备 + 全量重算幂等**（主机侧——SSH 执行；用户 19:52 定） | 主机异构；全量重算避免增量残渣与漂移 | 纯 iptables（旧栈机器兼容但表达弱——备选）；增量改链（残渣风险——否） |
| KD-SV-79 | **容器态不落库**（runner-admin-console 批）：Docker 引擎即真源——读时读（`containers/json`）∥ 动作直调（create/start/stop/DELETE）；控制面零镜像 ∥ 零同步机制 | 双源必漂移（外部 `docker` 命令 ∥ 机器重启 ∥ 别的工具都在改容器）；同步/对账机制 = 白增面（最小切片不取） | 落库镜像表 + 对账（同步机制/陈旧窗口——否）；心跳式上报（用户 19:52 口径已排除——机器上不驻留进程 ∥ 无心跳） |
| KD-SV-80 | **节点存活 = 读时探活（非心跳）**：运行面/读数 = 请求内现打 `GET …/info`（3s ∥ 并发）∥ 动作 = 现打现报；无后台定时器 ∥ 无心跳落库 | 用户 19:52 口径（无自驻进程）；探活只服务展示与当下动作，无独立可用性状态可陈 | 心跳上报（通道已废——否）；常驻探针进程（用户口径排除——否） |
| KD-SV-81 | **Docker API 版本 = 登记时协商 + 调用恒带前缀**：`ver = max(1.44, MinAPIVersion)`，须 ≤ `ApiVersion`（否则拒登记）；版本存 `runtime_json`；**引导步 = 先取无前缀版本读数、再定前缀**（§3 自检）；**前缀形 = `v<ver>`**（如 `/v1.44/…`——2026-10-11 真机核：`/1.44/…` 404 ∥ `/v1.44/…` 200） | 官方文档明示无版本前缀调用已废弃（将移除）；协商 = 老 daemon（min < 1.44）与新 daemon（min ≥ 1.44，如 Docker 29）两头都接得住 | 裸无前缀（官方废弃面——否）；固定档不协商（未来 daemon 抬底即坏——否） |
| KD-SV-84 | **凭据加解密 = AES-256-GCM + 密钥文件（`data/credentials.key` 0600）+ 可撤销 + 审计（掩蔽）**——单源 = `thincoder-server/src/store/credential-crypto.mjs`（消费面 = 主机表凭据 ∥ 私有仓凭据 ∥ 连接材料） | `node:crypto` 零第三方；密列零回显；如实披露（同机密钥不防整机沦陷；撤销只及 server 侧） | 明文落库（跳板凭据面——否）；外部 KMS（另立级——否）；默认保留（长期持凭据——否） |
| KD-SV-85 | **SSH 传输 = 容器内系统 openssh**（密钥 `-i`（0600 文件）+ `BatchMode=yes` ∥ 口令 `sshpass -e`（环境变量——不入 argv；**不带 `BatchMode`**——真机 A/B 核：带 ⇒ 「Permission denied (publickey,password)」∥ 去 ⇒ 登录成功；口令单提示 + 仅口令面））+ 主机指纹 TOFU（accept-new + 首见记录；变更 ⇒ 停 + 如实报）+ `.ssh` 落数据目录 | 零第三方运行期依赖（仓纪律——JS 自写 SSH 不现实）；`sshpass -e` = ps 无泄漏形；数据目录 = 容器重建不丢 | 自写 SSH 协议（体量/安全——否）；`-p` 明文 argv（ps 泄漏——否）；不验指纹（网内中间人——否）；硬拒一切指纹变更（重装常态——否） |
| KD-SV-92 | **容器读数三件 = 读时读直取**（沙盒 docker 管理批）：详情 = `containers/{id}/json` ∥ 用量 = `stats?stream=false&one-shot=true` + `json?size=1`（`SizeRw`/`SizeRootFs`）∥ 日志 = `logs?tail` 有界（读类 3s）；零缓存零落库 | 沿 KD-SV-79（引擎即真源）；无陈旧窗（外部 `docker` 命令随时改物）；读数如实（一次采样基线不足 ⇒ null——不假装） | 定期采集/缓存表（新机制——否）；用量时序库（另立面——否） |
| KD-SV-93 | **日志 = tail 有界 + 非 TTY 多路复用解复用 + 截断 256 KiB**：解复用判据 = 首字节 ∈ {0,1,2} ∧ 1–3 字节零 ∧ 帧长 ≤ 余量（判不出 ⇒ 原样透传） | 创建面不设 Tty ⇒ 引擎返回 8 字节帧头流；不解复用 ⇒ 输出带二进制残渣；有界 = 读类 3s/连接不悬停 | 强制 Tty 建容器（改既有容器参数——否）；整取无界（拖死连接——否） |
| KD-SV-94 | **拉取 = 同步请求 + 超时 10 分钟 + 失败两形皆收**：引擎非 2xx ∥ 200 流内 `error`/`errorDetail` ⇒ 400 携原文；不做异步任务/进度流（镜像源族 = 独立面——KD-SV-96/97；拉取认源 = 显式选源组装引用——KD-SV-100——拉取请求本身零改） | 取像耗时可分钟级（专用常量——沿 agent 工具面同值）；两形皆收 = 不对引擎行为下注；网络现实如实披露（#1250 另线——零机制） | 15s 动作超时（正常拉取必超时——否）；异步任务 + 轮询（新机制——否）；SSE 进度（新机制——否） |
| KD-SV-95 | **镜像删除 = `ref` 走请求体 + `force` 缺省 false**（`DELETE …/images` 体 `{ ref, force? }`；引擎 409 ⇒ 400 人话引导） | 引用字符集含 `/`/`:`/`@` ⇒ 路径段不兼容；沿 `DELETE /runners/:id` 体参先例；缺省不强删 = 误删爆炸半径最小（409 消息给人话处置） | 路径参数（带斜杠引用不可达——否）；缺省强删（误删面——否） |
| KD-SV-96 | **镜像源清单 = server 全局配置表（`image_sources` v15）+ 拉取消费面 = 显式选源**：源不写节点 dockerd 配置 ∥ 系统零隐式注入（引用组装仅随选定态——显式选定 ∥ 记忆预选；拉取窗内组装；sandbox-pull-by-source 批） ∥ 零自动选源（系统不自选源——缺省 = 记忆预选（首次 = 不选）；不选 = 引用原样） ∥ 目录读取 = server 直连源（不走节点 ∥ 不走 `proxy.uri`） | 需求边界「拉取行为不变」（用户 09:17 撤代理；18:15 裁 A 后消费面 = 显式选源）；目录读取发生在 server（server → 源）⇒ 清单位置随读取方；按节点 = 清单 × 节点数（维护复制）且消费面在 server/控制台侧 | 按节点源清单（重复登记 ∥ 消费面在 server/控制台侧——否）；源写节点 daemon 配置（机器侧零改——禁）；默认源自动改写（用户 18:15 裁 A 未选 B——否；如提 = 单列提议）；源读取经节点（节点无目录 API——不可行） |
| KD-SV-97 | **源目录/标签读取 = 标准 v2（`_catalog`/`tags/list`）+ Hub 面（公开 API）+ 匿名 Bearer 挑战 + 有界首页 + 五分类如实报错**（`timeout` ∥ `unreachable` ∥ `auth_required` ∥ `unsupported` ∥ `bad_response`；自含状态形——沿 `/api/admin/proxy/test` 先例） | 本机实测（2026-10-11）：公开源（ghcr ∥ quay ∥ ECR ∥ ACR ∥ SWR）皆 401 + Bearer 挑战 ⇒ 不换取则多数源恒「需认证」；DaoCloud 405 ⇒ `unsupported` 必需；quay 匿名空目录 ⇒ 空非错；Hub 无全站目录 API（官方关闭）⇒ `unsupported` 如实 | 不做 token 换取（预设清单半数不可用——否）；引擎内置 `images/search`（实测已死——否）；Hub 全站目录（官方关闭——不可行）；私有源凭据（本批不做——§15）；统一错误信封（远端事实分类丢——否） |
| KD-SV-98 | **镜像源 UI = 沙盒页新卡（不新开页 ∥ nav 零动）+ 目录浏览弹窗 + 前端过滤（零新端点）**：源表（名/址/面型）∥ 增/改/删弹窗（预选下拉 + 名/址两输入）∥ 浏览窗（仓库列表 ∥ 标签列表——两处过滤输入）∥ 本地镜像表加过滤输入 | 镜像族 UI 家 = 沙盒页（容器区/镜像区同页）；源 = 全局面（非按节点）⇒ 独立卡（非节点展开内）；过滤 = 已载集合纯前端（沿审计/用量页先例）；弹窗复用 `modal.mjs`（KD-SV-31） | 新管理页（nav +1 ∥ 页数链变更 ∥ 一页一职责已足——否）；源卡入节点展开（全局面错位——否）；服务端过滤端点（伪能力——否） |
| KD-SV-99 | **一键拉取 = 显式节点选单 + 预填既有拉取窗**（sandbox-image-quick-pull 批——用户 13:18 裁「要」）：目录窗行「拉取」⇒ 在线节点选单（无节点 ∥ 全离线 ⇒ 钮禁用 + 一句人话）⇒ 既有拉取窗（预填 `<主机>[:<端口>]/<仓库>:<标签>`——去 scheme ∥ Hub 主机统一 `docker.io`；预填可改）⇒ 既有拉取径；零新端点 ∥ 拉取行为零改（实读：`image-routes.mjs` 132 ∥ `docker.mjs` 327 零触） | 源清单 = server 全局（与节点解耦——KD-SV-96）⇒ 浏览窗无节点上下文：目标节点必须显式选（零隐藏——违则「禁用理由」指向看不见的背景态）；复用既有拉取窗 = 拉取径单源（无第二拉取实现）；可用态快照 = 目录窗打开读一次概览（读时读——KD-SV-80 同源） | **候选 B（只对当前展开节点生效）**——页背景展开态在弹窗期不可见不可改 ∥ 多节点展开 ⇒ 「当前」无定义——否；**第三形（拉取窗内加节点下拉）**——改既有窗形 ∥ 两入口一窗两形——否；**隐式取首个在线节点**——拉错机（目标机磁盘/带宽被占且无声）——否；**单节点自动跳过选单**——静默目标 + 两径分支——否 |
| KD-SV-100 | **拉取认源 = 拉取窗「经由源」显式选源 + 引用按源组装**（sandbox-pull-by-source 批——用户 2026-10-11 18:15 裁「A」）：选定源 ⇒ 对输入原文组装一次（`<主机>/<路径>[:<标签>]`——去 scheme ∥ 含端口逐值 ∥ Hub 主机统一 `docker.io` + 裸名补 `library/` ∥ 已带主机剥换（引擎同口径判据） ∥ 无标签补 `:latest` 显式 ∥ `@` 透传）；组装 = 输入框可见改写（所见即所拉；可再改）；组装施加点 = 选单变更 ∥ 选定态在场之输入完成（失焦——幂等）；窗重开预选上次所选（记忆——P2 已裁采纳（用户 2026-10-11 18:33）；预选态非自动改写）；提交恒发输入框当刻文本（组装后可见值） ⇒ 既有拉取径零改（端点形零动 ∥ 零新端点）；源清单读时读（无源 ∥ 读败 ⇒ 不选态 + 人话——拉取不阻断） | 补 Hub 类源（无全站目录 ⇒ 目录窗零行）的拉取消费面（用户实测「加了源，拉取不认它」——本批由来）；组装可见 = 沿「预填非锁定——确认值 = 所见值」口径；读时读 = 沿 KD-SV-80 同源；拉取径单源 = 不造第二拉取实现 | 提交时隐式组装（所见 ≠ 所拉——否）∥ 拉取端点加 `source` 参 ∥ 服务端组装（拉取径单源 ∥ 端点形零改——否）∥ 仅裸名套源（已带主机引用选源后仍不去源——「经由源」名不副实——否）∥ 默认源自动改写（用户未选 B——否；如提 = 单列提议）∥ 组装锁死输入（预填非锁定先例——否） |
| KD-SV-102 ∥ KD-SV-103 | ⇒ `webui/TABS.md` §1（as-of 2026-10-11；console-tabs-component 批——公共标签页组件 ∥ 沙盒页分标签——本域不复制） | —— | —— |

| KD-SV-104 | **卷族 = 引擎即真源 + 只改入口形 + 删卷防护**（sandbox-volumes 批——用户 21:18 三件）：卷不落表（读时读 `GET /volumes` ∥ 删直调——同 KD-SV-79 族）；**零自动建卷**（首用即建 = 引擎行为——我方零建卷调用；「新建卷（手输）」= 名字进既有 `Binds` 径）；建容器卷字段 = **选单（节点已有卷 + 「新建卷（手输）」逃逸——选定回填可再改；读败/空 ⇒ 手输照常）**——`Binds` 请求形零改；删卷 = 确认窗 + 后果句；**在用卷拒删 = 引擎 409 如实译 400 人话 + 处置句**（不前置预检——真机实读 `volume is in use - [<id>]`） | 用户三件逐条（21:18）+ 21:22 裁；引擎即真源 = 既有族口径（KD-SV-79——双源必漂移）；下拉 = 只改入口形（引擎请求形零改——最小面）；409 如实 = 单源真相（KD-SV-79/80 同精神）；「新建卷」保底 = 手输习惯零冲突 | 卷落库/同步表（新机制——否）；显式建卷端点/下拉即建卷（需求未点——建卷归引擎；否）；删除前置预检（窗口期 + 双读——否）；保持手输（用户 21:18 点名「改成下拉更好」——否）；隐式建卷调用（越界替引擎动作——否） |
| KD-SV-133 | **主机表 = `sandbox_runners` 扩展（不新建第二张机器表）**（admin-chat-creds-merge 批——2026-10-12；用户裁：设主机表管 SSH 凭据）：行 = 一台主机（名 ∥ Docker API 地址 ∥ SSH 凭据随行）；v18 增七列（`ssh_port` ∥ `ssh_user` ∥ `auth_kind` ∥ `secret_cipher` ∥ `sudo_cipher` ∥ `credential_state` ∥ `credential_updated_at`）；SSH 目标主机 = 行 `address` 的 host 部分（不另设列）；密列零回显；`keep` 成功 ⇒ 移交（run 行零化 + `'moved'`）+ v18 回填 | 单一权威（本表已是机器登记面——一台机器一行）；既有消费面零改（`docker` 绑定 ∥ 控制台运行面 ∥ 三族路由皆读本表）；同一寻址（`exec`/`docker` 共用 `runnerByRef`）；迁移面小（列增量 + 一次回填）；用户「主机表」语义 = 机器表（非第二张清单） | 新建专表（`sandbox_hosts` + `runners.host_id`——两登记面/两套寻址/更大迁移面，否）· 凭据留 run 行（`keep` 态无消费面 + 随 run 堆积，否）· 任意地址 `exec`（机队语义/误打面，否）· `burned` 复用代 `'moved'`（读数骗人，否） |
| KD-SV-134 | **凭据入口 = 结构化弹窗（表单——唯一入口）＋ 两挂载点同件；聊天文本非通道**（admin-chat-creds-merge 批——2026-10-12；用户裁：SSH 凭据进管理面 chat）：沙盒页·运行面节点行动作（权威管理面）∥ 对话页顶栏钮（会话内录入）——同一弹窗件/同一端点（`PUT`/`DELETE …/credential`）；对话页不列第二张主机表；请求录入 = 弹窗（简报纪律句同拍）；与 §16.3 sk 面完全分离（sk = 服务端自持、登录自动签发、无人工入口） | 秘密纪律（文本通道 ⇒ 明文入消息行 + 随上下文出上游——与 KD-SV-114 掩蔽精神相抵）；表单 = 零秘密回显 + 掩蔽面单源；两挂载 = 同一组件（零第二份表单）；用户对「进 chat」的语义 = 会话内可录（非文本投喂） | 文本通道收凭据（秘密入消息行/模型上下文——否）· 仅沙盒页入口（会话内录不得——用户原话未满）· 对话页另建表单/第二张表（两份面，否） |
| KD-SV-135 | **装机/主机运维 = 管理面 chat 内动作（终局已达成——2026-10-14）**：`exec`/`docker`/`runners` 工具 + 主机表凭据承接装机能力——零新机制、零新端点；**任务式 run 面已退场**（用户 2026-10-14 裁「撤」：弹窗 ∥ 四端点 ∥ 服务件 ∥ 任务面工具 ∥ 单元测试档删净——sandbox-onboarding-removal 批）；`sandbox_onboarding` 表 = **停机留史**（数据不删；零写入 ∥ 零读面）；`agent/ADMIN-AGENT.md` §13 R71⑥（run 出口改道）撤回注不变 | 「将来合并进 chat」= 用户 2026-10-12 方向已裁 ⇒ 终局执行（原三步路线：步 0/1 已备；步 2/3 合并为一次退场批——每步独立评审纪律沿旧）；工具面已备 ⇒ 退场零新机制；表留史 = 历史数据不删 | 分步续走（用户裁撤 ⇒ 终局执行——否）· 删表（数据留史——否）· run 改道（白做——R71⑥ 撤回） |
| KD-SV-105 | **卷区 = 节点行展开（容器区之后）——归属标签①「运行面」**；表 = 名 ∥ 创建时间 ∥ 操作（删除）；驱动透传不入列 ∥ 用量不做（引擎列表不携——`?size=1` 两版实读零 `UsageData`） | 卷 = 节点资源（与容器区同读上下文、建容器弹窗同层）；分标签归位（console-tabs-component 批） = 标签①——载体 = 节点展开（与归位块相容） | 独立卷卡 + 节点选单（多一层选择面 ∥ 离容器区远——否）；第三标签/标签②（标签划分 = 用户已定两标签；镜像标签名不含卷——否）；跨节点卷聚合表（引擎无跨节点单读——逐节点读聚合 = 伪面——否）；「驱动」列/用量列（恒值噪声 ∥ 引擎不携——否） |

| KD-SV-136 | **出站强制面 = 三层求值 + 门级不变量**（sandbox-outbound-member-face 批——台账 #1248）：L1 门级不变量（`127/8` ∥ `169.254/16`——非行/不可改/不可绕）∥ L2 默认禁单（RFC1918 ∥ 服务器段 ∥ 节点段——种子行，可被显式 allow 开）∥ L3 用户规则（＋**内置允许**——生命线：盒 → server 网关；系统注入 ∥ 位次 ≻ L2/L3）；**总序 = L1 ≻ 零地址闸 ≻ 内置允许 ≻ L2 ≻ L3**；「强制」= 门位绑定（全协议/全端口）∥ 双径同判 ∥ 解析零地址 ⇒ 拒（零地址闸——无条件 fail-closed，不得被内置允许放行）∥ L1 命中即拒零挂起 ∥ 节点网段登记幂等带入 ∥ 闸为盒前置（fail-closed）——控制面本批落 ∥ 主机侧随重做批 | 真机 P2/P3 两 FAIL（宿主 22 口 EXIT=0 ∥ 云元数据可达）证明「只靠白名单行」= 名义强制；需求 §5「默认全拒 + 禁单」要的是真拒 | 只告警不阻断（名义强制——P2/P3 即此形，否）· **把 RFC1918 升为恒拒**（改 U2-A：用户 2026-10-10 14:23 裁「RFC1918 可被显式 allow 开」——本批不动该裁，否）· 域名径不解析即放行（fail-open 空档，否） |
| KD-SV-137 | **探针判据口径 = 结构判据优先**（本批——台账 #1249）：P1 收窄 = 宿主真实账号（UID ∈ [1000, 65533] 窗）零命中盒内 passwd（窗外的标准系统账号不判）∥ P8 收窄 = 注入面正向在场 + 秘密零命中（基础镜像固有 env 不判）；SKIP 四项前置登记（P9 第二盒 ∥ P10 `--repo` ∥ P11 `--target` ∥ P14 执行面读数面） | P1/P8 两 FAIL 均为基础镜像自带项（`nobody` ∥ `NODE_VERSION`/`YARN_VERSION`）= 判据假红；白名单全量比对必漂（R25 已预判「镜像固有面不列则恒 FAIL」） | 白名单全量比对（必漂——两 FAIL 即证，否）· 放宽容差/忽略命中（真泄漏同形不可判，否）· 删两条判据（账号面/秘密面失覆盖，否） |
| KD-SV-138 | **成员面工作区读面 = 控制台成员页（`#/me/sandbox`）**（本批——台账 #1234）：行 = 名 ∥ 盒状态（运行/已停 + 回收原因）∥ 快照数 ∥ 所属 runner（`runnerName`）∥ 待批；恒本人过滤（`owner_member_id`）；零写控件（读面批）；**写面 = member-face-chat 批开**（创建 ∥ 启停 ∥ 销毁 + 拉仓——KD-SV-156（出案）；轮换/快照恢复仍管理面） | 需求 §5:426–428（成员侧 = 控制台成员页）+ #1234「读面随沙盒批落」；数据面大半既有（本批补 `runnerName`） | 三端另立面（面不存在——实读零命中；不发明，否）· 复用 admin 工作区面（含他人资源——判权面错，否） |
| KD-SV-139 | **待批发起方提示 = 一行可见 + 判据单源本档**（本批——台账 #1233①；父侧 2026-10-13 裁定）：文案「等待管理员批准：<host>（首次访问新域名——通常 ≤60s）」∥ 出现 = `pending` 在场 ∥ 消失 = 裁定/超时；落点 = 控制台成员页；三端登记随 #1215 | #1233①（挂起 ≤60s 零反馈 = 体验缺陷）+ 需求 §5:426；与 admin 三钮为同一事件两端 | 三端本批新面（无面可落——父侧裁定登记随 #1215，否）· 只在 admin 待批卡可见（发起方本人看不到——即原缺陷，否） |

| KD-SV-140…159 | ⇒ 未用段号（域内现有 1–139）；新段自 **KD-SV-160** 起启用。 | —— | —— |
| KD-SV-160…174 | ⇒ `sandbox/EXECUTION.md` §15（执行面——15 条：三腿/三证 ∥ 队列退场 ∥ 卷形式 ∥ 配额 ∥ 闸本体 ∥ DNS 闸 ∥ 实时门 ∥ 幂等链 ∥ 快照 ∥ 空闲信号 ∥ 运行时通道 ∥ 放置 ∥ 探针执行器 ∥ 迁移拆案 ∥ #1351；本域不复制） | —— | —— |
| KD-SV-175…180 | **容器终端 v1（sandbox-container-terminal 批——台账 #1374；用户 2026-10-13 21:11/21:13/21:17 三句）——全形 = §3 容器终端块**：KD-SV-175 会话链 = 升级连接（`node:http` 劫持——`fetch` 面不可达流式 stdin，实测）∥ KD-SV-176 帧协议 = 二进制 pty 字节 ∥ 文本 JSON 控制 ∥ KD-SV-177 心跳 = 服务端 30s WS ping / 客户端 30s 文本 ping、60s 判死 ∥ KD-SV-178 断线收口 = `\x04` + 关流（不追捕前台进程 ∥ 无会话持久化）∥ KD-SV-179 会话环境 = `TERM` 恒注 + `LANG` 条件注入 ∥ shell = `bash` 优选 `sh` 兜底 ∥ KD-SV-180 审计两 kind + `requireAdmin` + 同源门 | —— | —— |
| KD-SV-184…191 | ⇒ `sandbox/EXECUTION.md` §15（**底座可换**——8 条：绑定形 ∥ 派生构建 ∥ 缓存/重建 ∥ 前提（乙——Node 随包带） ∥ 凭据 ∥ 镜像就位步 ∥ 控制台面 ∥ 审计；本域不复制） | —— | —— |
| KD-SV-192…195 | ⇒ `sandbox/EXECUTION.md` §15（**连接面 TLS 档**——4 条：形态（地址 scheme 单源） ∥ 传输（`node:https` 适配件） ∥ 材料（三件自备 + 零回显） ∥ 审计（`runner_connection`）；本域不复制） | —— | —— |

## 15. 本域边界（不做）

- **镜像源族余项（不做——§3）**：**源目录/标签读取的凭据面**（仍匿名——私有源 ⇒ `auth_required` 如实；凭据面只及拉取/派生注入——§3 底座可换块）
  ∥ 源读取走 `proxy.uri`（直连——sandbox-image-sources 批口径；提请裁定）
  ∥ 保存时探活预校验（读时如实报，不预校验）∥ 子路径源（`https://host/prefix`——形拒）∥ 源清单与节点的网络可达性交叉校验（server 可达 ≠ 节点可达——如实披露）。
  **已否候选——不排期（非待办）**：默认源自动改写（用户 2026-10-11 18:15 裁「A」——显式选源；未选 B；如提 = 单列提议——§3 拉取认源块）∥ 分页/排序（有界首页 + `truncated`；§3「不翻页」）∥ 源写入节点 dockerd 配置（机器侧零改——禁；KD-SV-96 被否栏）∥ 按节点源清单（重复登记 ∥ 消费面在 server/控制台侧；KD-SV-96 被否栏）。

- **卷族余项（不做——§3 卷族）**：**带数据重建（给已建容器补挂卷）**——用户 2026-10-11 21:22 裁「先按不考虑加挂的原方案开批」⇒ 本批不做（如后续要 ⇒ 单列提议）∥ 卷用量（大小）/「驱动」显示列 ∥ 卷内浏览 ∥ 跨节点卷迁移 ∥ 卷改名（未点——不做）。
  **卷族↔工作区卷关系（已定形——sandbox-exec-rebuild 批 KD-SV-162）**：本族卷 = 节点 Docker 命名卷（§3 卷族——引擎即真源）∥ 工作区卷 = **主机路径绑定** `<workspaceRoot>/<ws-id>`（§2/§5——生命周期/销毁语义随工作区）；两形态**并存不代管**（卷区不列工作区卷 ∥ 删卷防护零工作区感知——通用确认窗）。机制全文 = `sandbox/EXECUTION.md` §3。

- **CI 实现**（#1216③——与沙盒共用执行面（§14 KD-SV-72）；CI 面不在本批）∥ **#1215 产品面**（web 开发会话 ∥ 移动端 ∥ agent 交互）。
- **盒镜像内容治理**（内容 = 部署面）。
- **入站/端口转发** ∥ **盒间通信**（每工作区独立网络——跨工作区互不可达）。
- **IPv6**（v1 只 IPv4——docker IPv6 关为前置）。
- **项目权限面**（#1216②——接口已留：§4/§9 同守卫点）∥ **多租户** ∥ **per-workspace 独立额度池**（复用成员配额——如需另议）。
- **成员面余项（不做——本批）**：成员写面之**轮换/快照恢复**（仍管理面；创建 ∥ 启停 ∥ 销毁 + 拉仓 = member-face-chat 批开——KD-SV-156（出案））∥ **三端沙盒/工作区面**（不发明——判据在册，落点登记随 #1215 成员会话面）∥ 探针执行器 ∥ 主机侧闸本体/下发器（**均已落——sandbox-exec-rebuild 批**：`sandbox/EXECUTION.md` §10/§5；控制面求值/带入接线 = sandbox-outbound-member-face 批落——§4 强制面 ⑦）。
  **#1248/#1249 真机复证闭环 = sandbox-exec-rebuild 批收口面**（§11 闭环边界——执行器 `deploy/sandbox-probe.mjs`（拟新增）已备）。写面 = member-face-chat 批开（`agent/MEMBER-AGENT.md` §3.7）；读面 + 待批提示 = §8 成员面。
- **最小切片余项（收口——sandbox-exec-rebuild 批）**：**已落** = 出站闸（本体 + 下发）∥ 磁盘限额 ∥ 探针（判据 + 执行器）∥ 放置 ∥ WIP 快照 ∥ 待批队列（机制）∥ 工作区↔容器映射（盒）∥ 资源限额（cpus/mem/pids/磁盘）。**未落（登记）** = Swarm 集群 ∥ 端口映射/网络面 ∥ 节点禁用/排空。**TLS 档已落（本增补 #2——§3 连接方式块；§3 提议① 以节点级可选档兑现）。**
- **主机凭据/`exec` 余项（不做——§3 主机凭据块）**：凭据轮换/过期（TTL）∥ 一主机多凭据（一主机一枚）∥ 跳板机/代理链 ∥ 批量凭据导入 ∥ `exec` 交互式会话（PTY）∥ 文件传输（scp/sftp）∥ 后台任务（异步 `exec`）∥ 脚本/编排 DSL（逐条命令 = 最小面）∥ 凭据使用方 = 本 server（他端接入另议）。
- **终端余项（不做——§3 容器终端块）**：会话持久化/重放（tmux 语义——断开即结束，窗口重连 = 新会话）∥ 鼠标协议 ∥ 图片协议 ∥ 文件传输 ∥ 自选命令（命令 = 服务端常量——`bash` 优选 `sh` 兜底）∥ 会话数上限（无上限——内部自用）∥ 前台进程追捕（Docker exec 无 kill 面——如实披露）∥ 终端内搜索/字号缩放 ∥ **主机 `exec`（SSH）交互式 PTY——仍不做**（属主机凭据余项句——与本批容器面无关，勿混记）。
- **连接面 TLS 余项（增补 #2 不做——§3 连接方式块）**：材料轮换/续期机制（改材料 = 编辑面全列覆写）∥ 材料查看/导出（**只进不出**——三件零回显零回填）∥ 节点侧 TLS 服务端配置（dockerd `--tlsverify` 等——在机；我方面只做客户端）∥ 配对/信任链管理（材料 = 用户自备）∥ 按节点代理链。

## 16. 上抛/余项（本域——自板档 §9 迁入；R51–R53 ∥ R55–R57 逐字；as-of 2026-10-11）

> 板档 `design/PROJECT.md` §9 同类行 = 保位 stub（指向本节）。

| # | 项 | 类型 | 处置建议 |
|---|---|---|---|
| R51 | **server-exec-sandbox 批（该批）——需求档回笔 + 随正件 + 披露**：① 需求档回笔（主 agent 笔——**已落** 2026-10-10 14:1x：§5 沙盒块必交面行（14:08）+ **AC-36** 在册（四处同源）+ §2:13 十 ⇒ **十一页** ∥ §2:14 七 ⇒ **八页** + AC-12/AC-14 档目 30∥31 ⇒ **32∥33** + AC-28 十二型 + server 零依赖沙盒行（14:24））∥ ② 随正件（父侧落——实施轮同拍）：注⑱（档目断言件九件 ∥ nav 计数件三件 ∥ 审计型面件 ∥ 门禁件数断言件七件 38 ⇒ 40）+ `thincoder-server/package.json`（38 ⇒ 40）∥ ③ 披露（不阻塞）：**已裁 U1–U5**（2026-10-10 14:23 用户「都按建议」——docker ∥ podman 双兼容 ∥ 回环+169.254 恒拒·RFC1918 可开 ∥ 默认单五条起步 ∥ 独立管理页 ∥ 快照 15 分钟+拆前）∥ 披露 D1–D4（tmpfs 例外 ∥ key_plain 明文 ∥ 盒可达 server 整端口 ∥ 复用 key 残余面）∥ ④ 部署收尾（父侧执行）：节点接入（`ops/OPS.md` §5.10） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |
| R52 | **runner-admin-console 批（本批）——需求档回笔/父侧补笔/登记项**：① 需求档（主 agent 笔）：沙盒四件的可检验条目已在本批验收盘面（`sandbox/SANDBOX.md` §11 ∥ §12 ∥ 批档 §2）；需求档 §5/AC-36 的阶段口径（六面分两轮）宜回笔——**写法/计数 = 主 agent 定** ∥ ② 父侧补笔：`docs/TEST-ENV-ECS.md` §7——现为 `thincoder-runner.service` 残留口径（服务已不存在）+ 需补节点前置步（dockerd 监听 TCP——`ops/OPS.md` §5.10 节点前置条）∥ ③ 登记（不阻塞）：审计页 `sandbox_event` 模板随余面批（原始型名兜底可用）∥ ④ 本批承诺项：v12 迁移（存量旧行弃——测试库仅一行 daemon 期残留）∥ 收口轮 = 真机走查（10.0.0.6） | 披露（上抛——如无异议按设计实施） | 评审/用户复核 |
| R53 | **runner-admin-console 批（托管接入增补——本批）——需求档回笔/父侧补笔/登记项**：① 需求档（主 agent 笔）：AC-36 ⑨/⑩ 与 §5「接入两径」判据收口（三态 ∥ 凭据纪律五件 ∥ 网络路径——判据全文 = `sandbox/SANDBOX.md` §3/§11）；写法/计数 = 主 agent 定——**已闭合（2026-10-14）：⑨ 收正「接入与运维」∥ ⑩ 删（需求档回笔在册）；旧判据块随托管接入退场删净——承接 = 本档 §3 接入面块** ∥ ② 父侧补笔：`docs/TEST-ENV-ECS.md` §7——补「托管接入」跑法（agent 代做三件；手工前置路仍可作降级）——**销项（2026-10-14）：任务式装机退场 ⇒ 无「托管接入」跑法可补；承接 = 手工登记 + 管理面 chat 内动作（本档 §3 接入面块）**；既有 `thincoder-runner.service` 残留口径同 R52② ∥ ③ 登记（不阻塞）：`docs/README.md` 地图登记 agent 域（新域——域档一档）∥ `@thincoder/server` 带核发布形（`@thincoder/core` 钉版本依赖——构建期 registry 可达性，实施轮定；KD-SV-78 依赖声明形） ∥ `Dockerfile` 构建期 apt 可达性（`openssh-client`+`sshpass`——如实披露） ∥ agent 模型出口代理旗复核点（`agent/ADMIN-AGENT.md` §5） ∥ ④ 披露（不阻塞）：多机并装 ∥ 任务中途取消 ∥ TLS（`:2375` 明文——沿提议①）不做；托管接入 = 任务式驱动（管理面 chat 随会话面增量轮） | 披露（上抛——如无异议按设计实施） | 评审/用户复核 |
| R55 | **sandbox-docker-admin 批（本批）——需求档回笔 + 随正件 + 披露**：① 需求档回笔（主 agent 笔——随本批评审/收口）：`docs/server/requirements/PROJECT.md` §5 ①「本轮不做——镜像管理」行与 AC-36 ⑥ 分期句需回笔（镜像管理 = 本批交付面；容器面补齐 + 镜像族三端点 = 本批）——**写法/计数 = 主 agent 定**；另：该档档目链（`:220` ∥ `:222`——当刻盘面）现含沙盒运行面批（**31 ∥ 32**）∥ admin-agent-chat 批（**32 ∥ 33**）两步，**缺本批 +2 步**（sandbox-docker-admin ⇒ **34 ∥ 35**）；终值随设计链 ⇒ i18n 拆分（#1270）后 **36 ∥ 37**（现盘面）⇒ 沙盒余面批后 **38 ∥ 39**——口径差宜同拍收口∥ ② 随正件（父侧落——实施轮同拍，**以当刻盘面实读为准**；逐件名单/断点 = §6 注⑳）：档目断言件九件（+2 名——`views-sandbox-containers.mjs` ∥ `views-sandbox-images.mjs`；31 ∥ 32 ⇒ **34 ∥ 35**）∥ 门禁件数断言件七件（**45 ⇒ 47**——盘面实读）∥ `thincoder-server/package.json`（`prepublishOnly` **45 ⇒ 47**）∥ ③ 披露（不阻塞）：拉取网络现实（Hub 在 `10.0.0.6` 不可达 ∥ 慢源 #1250——如实呈错 + 引擎原文；不加镜像源/重试机制）∥ `env` 原文可见（含盒内工作区 key——与既有「盒可达 server 整端口」同族残余面；如需掩蔽另轮）∥ 用量一次采样（首采样缺基线 ⇒ `cpuPercent = null`）∥ 日志文本截断 256 KiB ∥ ④ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（节点展开 ⇒ 详情/日志/用量 ⇒ 重启/强杀 ⇒ 镜像列/拉/删）+ 真机（10.0.0.6） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |
| R56 | **sandbox-image-quick-pull 批（本批）——披露 + 部署收尾**：① 披露（不阻塞）：**目录窗单例行为**——开节点选单时目录窗按「开新先关旧」自动关闭（拉取成后如需续览 ⇒ 重开目录窗）∥ 预填非锁定（窗内可改——确认值 = 所见值）∥ 节点快照 = 目录窗打开时读一次概览（读时读；开窗后节点状态变化 ⇒ 拉取按引擎实况如实报）∥ Hub 预填主机统一 `docker.io`（`hub.docker.com` 为站点主机非注册表主机——逐值保留会产出引擎不可拉的引用）∥ 预填 ≠ 可达保证（节点侧 registries/网络现实——沿 R55③）∥ ② 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（有在线节点：浏览 ⇒ 拉取 ⇒ 节点选单 ⇒ 预填核对 ⇒ 确认真拉 ∥ 无节点 ∥ 全离线：钮禁用 + 一句人话） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |
| R57 | **sandbox-pull-by-source 批（本批）——披露 + 提议采纳（已裁） + 部署收尾**：① 披露（不阻塞）：组装 ≠ 可达保证（节点侧引擎照拉——`docker.1ms.run` 等源在节点网络的可达性如实报，失败两形照 KD-SV-94）∥ 组装 = 文本规则（引擎同口径剥换判据——非解析器；异常引用照引擎实况报错）∥ 源清单读时读（开窗读一次；开窗后源被删/改 ⇒ 组装结果仍按当刻清单）∥ **Hub 不可达点**（10.0.0.6 上 Hub 类端点不可达——沿 R55）不影响本面（组装为纯文本；可达性 = 节点侧现实）∥ ② **提议采纳（已裁——用户 2026-10-11 18:33 裁 P1 ∥ P2 均为做；来源 = 设计侧提议（UX 反问面导出））**：**P1** 拉取窗「目标节点」行恒显（手动径也显示）∥ **P2** 「经由源」选择记忆（窗重开预选上次所选——预选态非自动改写；记忆源失效 ⇒ 不选态回落）——落地 = 本批设计随正（`sandbox/SANDBOX.md` §3 ∥ `webui/SANDBOX.md` §2.1①）∥ ③ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（拉取窗：选源 ⇒ 组装 ⇒ 确认；无源 ∥ 读败两分支）+ **整条用户旅程真机（ECS `.6`：加源（`docker.1ms.run`）⇒ 经源拉 `ubuntu:24.04` ⇒ 镜像落地 ⇒ 建容器跑——AC-38 ⑤）** | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

| R72 | **admin-chat-creds-merge 批（本批）——需求档回笔 + 冻结域随正清单 + 随正件 + 披露**：① 需求档回笔（主 agent 笔——**已闭合**：2026-10-12 父侧落笔——`docs/server/requirements/PROJECT.md` 功能点 47 ∥ AC-47 在册（§2 增功能点 + §5 合并方向 + AC-36 ⑨/⑩ 随拍——该档变更记录在册）） ∥ ② **冻结域随正（已办——2026-10-12 fix 轮落定；各档变更记录在册）**：`store/STORE.md`（§2 v18 段：七列 `ALTER` ∥ `sandbox_onboarding` CHECK 重建 + `'moved'` ∥ 回填移交；§1 版本 16 ⇒ 19；§3 迁移链 v18 行；§4 db 预算）∥ `gateway/API.md`（§2.5：行形增 `ssh` 元数据 ∥ 增 `PUT`/`DELETE …/runners/:id/credential` 两端点 ∥ 托管接入行形补第四态）∥ `accounts/ACCOUNTS.md`（§2.1 `sandbox_event` 增两 kind：`host_credential_set`/`host_credential_revoke`——kind 非枚举 ⇒ 零 CHECK 改）∥ ③ 随正件（父侧/实施轮——**以当刻盘面实读为准**；现读 = 2026-10-12）：门禁件数断言件七件 + `thincoder-server/package.json`（**58 ⇒ 59**——本批单元测试档入链；行数 ±0——注释/断言消息就地收正，沿注⑮口径）∥ 档目断言件（`2026-10-08-server-public-structure.test.mjs`：**+1 名——`host-credential.mjs`**（与板档档目 +1 对齐）；现读 **167** 行 ⇒ 净变 ≤±20）∥ `2026-10-10-runner-admin-console-ui.test.mjs`（views-sandbox 拆分随正；现读 **529** 行 ⇒ 净变 ≤±20）∥ `2026-10-11-admin-agent-chat*.test.mjs`（工具面计数七 ⇒ 八 ∥ 能力段对位句；现读三档 = **719 ∥ 395 ∥ 395** 行 ⇒ 净变 ≤±20）∥ i18n 键组（逐键 = `webui/SANDBOX.md` §2.1① §3 ∥ `webui/CHAT.md` §2.1 §3）——两 i18n 沙盒表 +≈12 键/表（现读 **214 ∥ 214** 行 ⇒ 净变 ≤±20）∥ 两 i18n admin 表 +3 键/表（现读 **171 ∥ 175** 行 ⇒ 净变 ≤±10）∥ 两 i18n system 表 +2 键/表（`audit.sandboxKind.*` 26 ⇒ 28；现读 **205 ∥ 205** 行 ⇒ 净变 ≤±6）∥ ④ 披露（不阻塞）：凭据常驻至撤销（无 TTL——自加项①）∥ `'moved'` = CHECK 重建（v18 含表重建一步）∥ `exec` 无 PTY/无文件传输/无异步（余项行）∥ 行 `address` 解析作 SSH 主机（异址部署不可达——如实报）∥ 凭据明文零回显（响应键面扫描在用例）∥ ⑤ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（两处录入 ⇒ chat `exec` ⇒ 撤销 ⇒ 拒）+ 真机（ECS `.6`：录真凭据 ⇒ `exec` 读数 ⇒ 撤销） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |
| R59 | **sandbox-volumes 批（本批）——披露 + 同步项 + 需求档回笔 + 部署收尾**：① 披露（不阻塞）：**在用卷拒删 = 引擎行为**（我方不预检——引擎错误原文如实携；零自动清理）∥ 删卷不可逆（确认窗 + 后果句——卷内数据一并消失）∥ 「新建卷（手输）」= 名字进既有 `Binds` 径——**建卷成功与否归引擎**（首用即建：真机实读 = 容器创建即建；引擎拒 ⇒ 创建失败如实报）∥ 列表面字段 = 引擎如实（驱动恒 `local` 不入列；用量引擎不携——不做）∥ ② 同步项（**已办**——2026-10-11 console-tabs-component 批设计定稿轮随卷区落位同步，本项销；状态以 `webui/SANDBOX.md` 现句为准）：`webui/SANDBOX.md` §2.1① 分标签归位块半句与容器区句现为「（展开 ⇒ 容器区 + 卷区）」——展开体 = 容器区 + 卷区 ∥ ③ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（建容器选卷/手输两用例 ∥ 卷表列/删 ∥ 确认窗取消零调用）+ **真机（ECS `.6`）：在用卷拒删如实呈（`test-data` 类场景——409 ⇒ 400 人话）** ∥ ④ 需求档回笔（主 agent 笔）：`docs/server/requirements/PROJECT.md` AC-36 ⑥ 分期链止于「⇒ 拉取认源（sandbox-pull-by-source 批）」——**缺本批「① 续四：卷族（sandbox-volumes 批）」一步**；同档 §5「① 续」不做清单仍载「卷删除（另批——判据 = `sandbox/SANDBOX.md` §15）」——本批已交付（判据改指 §11——沿同行「已落」形）；**写法/计数 = 主 agent 定** | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

| R73 | **sandbox-outbound-member-face 批（本批）——需求档回笔 + 随正件 + 披露 + 真机验收面**：① 需求档回笔（主 agent 笔）：`docs/server/requirements/PROJECT.md` §5 成员面 ① 行补「所属 runner」字段（现句 = 运行中 ∥ 已停 ∥ 被回收 ∥ dirty ∥ 快照）；§5 出站行补「强制面」句（门级不变量 ∥ 全协议 ∥ 双径同判 ∥ 解析零地址拒 ∥ 命中即拒零挂起 ∥ 网段带入 ∥ 闸为盒前置）；AC-36 ⑦ 探针句补「判据收窄 + SKIP 前置」（写法/计数 = 主 agent 定）∥ ② 随正件（父侧/实施轮——以当刻盘面实读为准；逐件现读 = 2026-10-13）：`webui/WEBUI.md` §1 档目链 + 静态面清单（+`views-me-sandbox.mjs`——`:16`/`:173` 翻「本批新建」）∥ §6 AC-12 行（我的 5）∥ `design/PROJECT.md` 板账；**档目断言件** = `docs/batches/2026-10-08-server-public-structure.test.mjs`（现读 **167** 行 ⇒ 净变 ≤±20——+1 名）∥ **键集指纹/键数随正件**（本批 +≈16 键/表）：`…-server-public-structure`（① 指纹/键数——当刻复读——已随正 **959 ∥ 964**，2026-10-13）∥ `…-runner-admin-console-ui`（⑦ 键数终值；现读 **529** 行）∥ `…-admin-agent-chat-ui`（⑧ 键数终值；现读 **397** 行）∥ `…-team-projects-permissions-ui`（shell 键数 59 ⇒ 60；现读 **551** 行）——逐件净变 ≤±20（复读值复锚）；**门禁件数断言件/`package.json` 链项 = 作废**（用户 2026-10-12 裁「门禁链撤除——批内件不入发布门」；不增链、不碰旧断言件）∥ ③ 披露（不阻塞）：探针执行器随执行面重做批（本批只落判据面；P1/P8 收窄后须重跑方「绿」）∥ 主机侧闸本体随重做批 ⇒ **P2/P3 真机复证 = 重做批收口面**（本批控制面修复可机检）；**#1248/#1249 闭环批次 = 执行面重做批——本批验收 = 控制面腿，收口轮不得按本批读数记「已修」**∥ 三端沙盒面不存在（判据在册；落点登记随 #1215）∥ 成员读面无写控件 ∥ ④ 真机验收面（收口轮 · ECS `.5`/`.6`）：登记节点 ⇒ 种子 deny 行逐值（RFC1918 ∥ 节点 /24 ∥ 服务器段）∥ 盒内打 `169.254.169.254` ∥ 宿主 22 口 ⇒ 拒（待重做批后） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

| R74 | **sandbox-exec-rebuild 批（本批）——需求档回笔 + 随正件 + 披露**：① 需求档回笔（主 agent 笔）：`docs/server/requirements/PROJECT.md` §5 沙盒块——「执行通道 = exec 指令面（非 root ∥ 超时 10 分钟 ∥ 输出截断 1 MiB）」句与 19:52 口径相抵（本批执行面 = Docker API 直调 + 盒内壳自持；`exec` 指令面无对应实现面）⇒ 请收正；「控制链（runner 长轮询/心跳/指令队列）」史句现状 = 已废（如仍在活面请随正）；「保护降级两边界」（非 git 跳过 ∥ >200 MiB 跳过）随快照形式收正（非 git 同覆盖；单份上限 = `diskMb` 配额——EXECUTION §3）；新设置键两枚（`maxBoxesPerRunner` ∥ `workspaceRoot`）宜在资源行登记；**「底座可换」入册**（用户 2026-10-13 21:32 范围增补——建议功能点 52 ∥ AC-52（承 AC-51 顺序）；判据全文 = `sandbox/EXECUTION.md` §8 底座可换块 ∥ §13 用例 ∥ 本档 §3 块）；写法/计数 = 主 agent 定 ∥ ② 随正件（父侧/实施轮，以当刻盘面实读为准）：`docs/TEST-ENV-ECS.md`（节点前置 = dockerd 监听 TCP + 工作区根目录 + **派生前置 = 标准镜像件位契约（`/opt/thincoder/app`——member-face 批落地）就绪 + 底座镜像来源**——沿 R52②）∥ `docs/README.md`/`design/PROJECT.md` 档目（sandbox 域 1 档 ⇒ 2 档——EXECUTION.md）∥ 旧单元测试档引用 `sandbox_tasks`/队列者随实施随正 ∥ **档目/键集断言件随正**（`2026-10-08-server-public-structure.test.mjs`：+1 名——`views-sandbox-base.mjs` ∥ i18n 键集指纹——以实施当刻盘面复读为准）∥ ③ 披露（不阻塞）：nft 漂移窗 ∥ DNS 闸 UDP 只 ∥ 快照全量存档（配额内）∥ 定时器 30s 粒度 ∥ 探针 SKIP 如实登记（零假报）∥ **底座可换五件**（派生真机可用依赖标准镜像件位契约落地——member-face 批；落地前机检不受阻 ∥ 底座 tag 移动 ⇒ 节点本地旧像被采用（追新 = 重拉后派生）∥ 派生同步请求（最坏 ≈20 分钟 = 拉取 10 + 构建 10；超时后引擎侧可能仍在跑——重试幂等）∥ 逐节点各自派生（tag 内容寻址保证同源）∥ 凭据只及拉取注入——目录/标签读取仍匿名）∥ ④ 真机收口（父侧执行）：ECS `.5`/`.6` 复跑探针套件 + 建盒/快照/恢复全链实走 + **底座可换全链**（选定底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起——前置 = 标准镜像件位契约就绪）∥ **增补 #2（连接面 TLS 档——用户 2026-10-13 22:43 范围增补「让用户可选」）：① 需求档回笔（主 agent 笔——建议功能点 53 ∥ AC-53，承 AC-52 顺序；判据全文 = `sandbox/SANDBOX.md` §3 连接方式块 ∥ §11；写法/计数 = 主 agent 定）∥ ② 随正件（父侧/实施轮——以当刻盘面实读为准）：`docs/batches/2026-10-10-runner-admin-console.test.mjs`（E34 语义随正（https 400 因 = 档相抵/缺三件——不再为「scheme 拒」）+ **列面断言 +四列**）∥ `docs/batches/2026-10-10-runner-admin-console-ui.test.mjs`（添加弹窗体增 `connection` ∥ 行钮 +1 ∥ 键集 +≈16）∥ `docs/batches/2026-10-08-server-public-structure.test.mjs`（档目 +2 名——`docker-tls.mjs` ∥ `views-sandbox-connection.mjs`；键集指纹随正）∥ `docs/TEST-ENV-ECS.md`（节点侧 dockerd TLS 配置步骤 + 证书自备句）∥ ③ 披露（不阻塞）：材料只进不出（三件零回显／零回填；换材料 = 全列覆写）∥ 切换/编辑须当刻可达（自检为门——离线节点改不动，如实报）∥ 客户端证书认证 = 节点 dockerd 侧配置（在机；我方面只做客户端）∥ 缺省明文保持（零行为变化——用户「很喜欢现在这种方式」）∥ ④ 真机收口（父侧执行）：ECS `.6` 节点 dockerd TLS 就位 ⇒ 自签三件 ⇒ 控制台切档 ⇒ 自检过 ⇒ 全谱可用（读数/容器/镜像/终端）⇒ 切回明文（材料清零） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

| R85 | **sandbox-container-terminal 批（本批）——需求档回笔 + 随正件 + 披露**：① 需求档回笔（主 agent 笔——**已落** 2026-10-13：`docs/server/requirements/PROJECT.md` 增**功能点 51 ∥ AC-51**（承 AC-50 顺序；该档变更记录在册）——原缺行：终端能力此前无需求面，本批设计轮实读后入册）；判据全文 = `sandbox/SANDBOX.md` §11 终端行 ∥ §12（N83–N85 ∥ B79–B81 ∥ E61–E63） ∥ ② 随正件（父侧/实施轮——以当刻盘面实读为准）：`docs/batches/2026-10-08-server-public-structure.test.mjs`（档目断言 **+6 名**——`terminal-core.mjs` ∥ `terminal-vt.mjs`（实拆） ∥ `terminal-codec.mjs`（实拆） ∥ `terminal-render.mjs` ∥ `terminal-link.mjs` ∥ `views-sandbox-terminal.mjs` ∥ 键集/键数指纹**已随正**——当刻实读 1033 ∥ 1038）∥ 同族指纹件（i18n 键数）随实施当刻复读 ∥ ③ 披露（不阻塞）：**前台进程不追捕**（断开时在跑的程序可能续存至自身退出——Docker exec 无情 kill 面；容器一次性沙盒兜底）∥ **pty 内容零留痕**（终端字节不落库不落日志——审计只记「谁何时进了哪台容器」）∥ 会话无持久化（重连 = 新会话）∥ 会话数无上限（内部自用）∥ `LANG` 条件注入（容器自带 locale 时零覆盖）∥ ④ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（容器行开终端 ⇒ `vim`/`top` ⇒ 中文输入 ⇒ 关窗收口 ⇒ 审计两行在册）+ 真机（ECS `.6`：非运行容器门 + 直连拒；关窗后 `docker exec` 进程零残留） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

| R87 | **sandbox-onboarding-removal 批（本批）——需求档回笔 + 随正件 + 披露 + 部署收尾**：① 需求档回笔（主 agent 笔——**文本已拟**：批档 §2 附稿——§5「接入两径」块改写为终态（手工登记 + 管理面 chat 承接；删「执行者」条与三态句）∥ AC-36 ⑨ 收正（⑩ 删）∥ §5 管理面用途行去「托管接入（装机）」∥ 功能点 47④ 合并方向句收正「已达成」；写法/计数 = 主 agent 定）∥ ② **删码清单（服务件——归并一处）＋随正件（父侧/实施轮——以当刻盘面实读为准；现读 = 2026-10-14 fix 轮实读）**：**删 = `thincoder-server/src/sandbox/onboarding.mjs`（现读 **354**——整档删） ∥ `thincoder-server/src/sandbox/onboarding-routes.mjs`（现读 **103**——整档删） ∥ `thincoder-server/src/sandbox/routes.mjs`（现读 **413**——托管接入四端点转注册段 −≈4）**；随正件 = `docs/batches/2026-10-10-runner-admin-console-agent.test.mjs`（**整档删**——任务面五工具/托管接入全链用例；现读 **637** ⇒ 净变 −637）∥ `…-runner-admin-console.test.mjs`（**复扫 = 档内零 onboarding/任务面引用 ⇒ 净变 ±0**——表/列面断言留；现读 **491**）∥ `…-runner-admin-console-ui.test.mjs`（⑤ 弹窗 ∥ ⑥ 任务区用例删 + 首读断言改；现读 **527** ⇒ 净变 ≤±40）∥ `…-console-tabs-component.test.mjs`（任务区/两钮/首读断言逐处；现读 **493** ⇒ 净变 ≤±20）∥ `2026-10-12-team-projects-permissions.test.mjs`（`onboarding.mjs` 导入与用途删；现读 **693** ⇒ 净变 ≤±20）∥ `2026-10-12-admin-chat-creds-merge.test.mjs`（N81 用例删——移交机制随件退场；CHECK/回填两用例留；现读 **606** ⇒ 净变 ≤±20）∥ 键集/键数指纹件（`2026-10-08-server-public-structure.test.mjs` 等——键删后复读为准；现读 **169** ⇒ 净变 ≤±20）∥ `2026-10-06-server-gateway.test.mjs`（表在场断言**留**——表存续；现读 **496** ⇒ 净变 ±0）∥ ③ 披露（不阻塞）：**历史 `running` 残留行 = 永久静止**（重启恢复面消失——零改写）∥ 历史审计行五 kind 以原值可读（label 面已收——原值兜底）∥ 表零写入零读面（历史经库直读）∥ ④ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（运行面/任务区零残留 ∥ 添加/删除节点照常） | 披露（上抛——如无异议按设计实施） | 评审/用户复核 |

## 变更记录

- 2026-10-14（**sandbox-onboarding-removal 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-14-sandbox-onboarding-removal.md` §3 轮次 1（评审 #141；发现 4/7 落本档）：§16 R53① 判据收口标**已闭合**（⑨ 收正 ∥ ⑩ 删——需求档回笔在册）∥ R53② **销项**（任务式退场——无「托管接入」跑法可补）∥ R87② **归并删码清单**（服务件两档 + `routes.mjs` 行）+ 随正件逐件补现读/净变（`…-agent.test.mjs` 现读 **637**——整档删；`…-runner-admin-console.test.mjs` 复扫零引用 ⇒ ±0）∥ §13 测试档行设计估 ⇒ 实读 **637**。**零新语义（评审发现直接导出项）；产品码零触（设计轮）。**

- 2026-10-14（**父侧机械随正 · 可 revert**——承批档 §6 收口）：§13 `docker.mjs` 行读数收正（投影 ≈515 ⇒ **实读 423（2026-10-14 收口）**——未越 500 软线）+ 拆案句撤回（`:614` 行）。
- 2026-10-14（**sandbox-exec-rebuild 批 · 收口修复轮（设计面）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §6 挂单 D 裁 + F 落点）：§5 销毁确认句去 `dirty` ∥ §8 工作区列表 + 成员面两处去 `dirty` ∥ §12 E31 词面随正 ∥ §14 KD-SV-138 行同拍 ∥ §4 段值推导句补**盒链停**（服务器地址非 IPv4——F 裁；机制全文 = `sandbox/EXECUTION.md` §3 链前置）。**产品码零触（设计轮）。**

- 2026-10-14（**sandbox-onboarding-removal 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-14-sandbox-onboarding-removal.md` §1 · 台账 #1383；用户 2026-10-14 裁「撤」——任务式装机（托管接入）退场）：**清面（本档）**——§3 托管接入块（步骤表/凭据纪律/网络路径/宿主前提/run 态）删净 + 增「接入面」承接句 ∥ §2 审计五 kind 行删 + `sandbox_onboarding` 行注「停机留史」 ∥ §8① 托管接入钮/任务区句删 ∥ §9 四端点句删 ∥ §11 托管接入判据行删 ∥ §12 N49–N52 ∥ B44–B46 ∥ E37/E38 ∥ N81 删 ∥ §13 两档行删 + `routes.mjs` 行 + 小计随正 ∥ §14 KD-SV-83/86 删（段号留空档）、KD-SV-84 收正（加密面存续范围）、KD-SV-135 收正（终局已达成） ∥ §15 托管接入余项行删 ∥ §16 增 R87。同源随动 = `agent/ADMIN-AGENT.md` ∥ `ops/OPS.md` ∥ `accounts/ACCOUNTS.md` ∥ `store/STORE.md` ∥ `webui/WEBUI.md`（`webui/SANDBOX.md` ∥ `gateway/API.md` ∥ `sandbox/EXECUTION.md` 待重做批收口闭后落——批档 §2）。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-container-terminal 批 · 实施上抛两裁 · 父侧直接执行（可 revert）**——承批档 `docs/batches/2026-10-13-sandbox-container-terminal.md` §1「实施上抛两裁」（#97））：§3 容器终端块 **in-band 四码行收正**：① 建 exec 409 ⇒ `container_not_running`（与 §12 E61 取齐——原括注「409 ∥ 非 2xx」与 E61 相抵，属笔误；运行态判据 :252 同向）；② `session_closed` 标 **零发射**（前端兜底词汇——与 §3「断开只由 WS close 表达（零 bye 帧）」取齐）。零语义新增（两条 = 消解既有相抵）。**产品码零触（设计档收正）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 设计评审轮 2 修复（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §3 轮次 2（四条逐号落）：#1 §3 连线口径行按增补 #2 单源收正（明文档缺协议补 `http://`、缺端口补 `2375`；TLS 档补 `https://`/`2376`；显式 scheme 与档相抵 ⇒ 400）+ §12 E34 措辞同拍（400 因 = 相抵/缺件——不再为「scheme 拒」）∥ #4 §8① 工作区动作句「等待放置」⇒「待人放」（一词一事）∥ #3 §13 本增补 #2 分项读数收平（六处 delta ≈135 = 分项和 ∥ `docker-tls.mjs` ≈220 ⇒ 分项和 ≈+355——逐项值与 `sandbox/EXECUTION.md` §14 同值）。同源随动 = `sandbox/EXECUTION.md`（§5 备径两向 ∥ §14 小计）。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 范围增补 #2（连接面 TLS 档——fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1「2026-10-13 22:43 · 用户裁定」；用户原话「我其实很喜欢现在这种方式，靠安全组控制，使用简单方便，不过，我也想加上B，只是TLS证书认证，让用户可选。」）：§2 v22 句 + `sandbox_runners` 列面增四列（`tls_ca`/`tls_cert`/`tls_key_cipher`/`tls_updated_at`）+ 审计增一 kind（`runner_connection`；`runner_add` 增 `tls` 键）∥ §3 增**连接方式块**（形态 = 地址 scheme 单源 ∥ 材料三件自备 ∥ 不变量 https ⇔ 三件齐 ∥ 写面两端点 ∥ 关 TLS 原子 ∥ 生效面全谱 ∥ 先例对齐 ∥ 审计 ∥ 边界）+ 添加节点块「TLS 不做」句收正（TLS 档可选——缺省明文）∥ §9 增连接面端点句 ∥ §11 增判据行 ∥ §13 四行 delta + 本增补 #2 服务端件 + `docker.mjs` 越线拆案句 ∥ §14 增 KD 指针行 ∥ §15 三处收正（未落清单 ∥ 托管接入余项 ∥ 增连接面余项行）∥ §16 R74 增补 #2。同源随动 = `sandbox/EXECUTION.md` ∥ `store/STORE.md` ∥ `gateway/API.md` ∥ `accounts/ACCOUNTS.md` ∥ `ops/OPS.md` ∥ `webui/SANDBOX.md` ∥ `webui/WEBUI.md` ∥ `design/PROJECT.md`。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-container-terminal 批 · 设计评审轮 1 修复（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-container-terminal.md` §3 轮次 1（评审 #92——十条）：§11 补**容器终端判据行**（评审 1——需求块行 → 设计级判据 → 载体齐）∥ §13 `bin` 行补本批 +≈9 ⇒ ≈238（评审 9——入其行收平）∥ §16 R85① 翻**已落**（AC-51 入册回流——评审 3）。**零新语义（评审发现直接导出项）；产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 设计评审轮 1 修复（fix 轮）· eng-designer**——承批档 §3 轮次 1（评审 #91——14 条）：§4 强制面 ①/§11 P2 行补**两方向**句（`forward` ∥ `input`——盒 → 宿主自身方向）∥ §13 读数收平（`docker.mjs` 327 ⇒ **333**（2026-10-13 实读）∥ box 280 ⇒ **315** ∥ workspace-routes 190 ⇒ **280** ∥ migrations 430 ⇒ **470** ∥ `bin` 226 ⇒ **229** ∥ 小计 ≈+1210 ⇒ **≈+1180**——分项和；增补分项和 ≈+686）。同源随动 = `sandbox/EXECUTION.md`（同轮 14 条）。**零新语义（读数/位次收正）；产品码零触。**

- 2026-10-13（**sandbox-container-terminal 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-container-terminal.md` §1 · 台账 #1374；用户 21:11/21:13/21:17 三句）：§3 增「容器终端」块（会话链三步（实证口径在案）∥ 传输层最小 WS 服务端 ∥ 帧协议 ∥ 心跳 ∥ 断线收口（`\x04` + 关流 ∥ 前台不追捕 ∥ 无持久化）∥ 退出码 ∥ 审计两 kind ∥ 判权/同源门 ∥ in-band 四码 ∥ 停机 ∥ 自加项表七条）∥ §8① 容器区补第七钮「终端」∥ §9 增升级端点句 ∥ §11 增终端判据行 ∥ §12 增用例（N83–N85 ∥ B79–B81 ∥ E61–E63）∥ §13 增两新档行 + 小计随正 ∥ §14 增 KD-SV-175…180 ∥ §15 增终端余项行 ∥ §16 增 R85。同源随动 = `webui/TERMINAL.md`（**新档**）∥ `webui/SANDBOX.md` §2.1①/§3/§4 ∥ `gateway/API.md` §2.5/§4 ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `webui/WEBUI.md` §1/§5/§7 ∥ `design/PROJECT.md` ∥ `docs/README.md`。**产品码零触（设计轮）。**
- 2026-10-13（**sandbox-exec-rebuild 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1 · 台账 #1373；用户 2026-10-10 19:52–19:56 ∥ 16:28/16:32/16:36 口径 + 本批范围五块）：**新建执行面域档 `sandbox/EXECUTION.md`**（三腿/三证 ∥ 动作直调链 ∥ 主机侧配额/闸本体 ∥ DNS 闸/待批接续 ∥ 写门实时化 ∥ 盒运行时通道（核同件 + 最小壳 + 缝契约）∥ v22 收正 + #1351 + 迁移拆案 ∥ 探针执行器 + #1248/#1249 闭环 ∥ 用例 N65–N70/B67–B73/E50–E55 ∥ KD-SV-160…174）；本档随动 = 执行面句全改指 ∥ §2 表（`sandbox_tasks` 删行；`stop_reason` 增 ∥ v22）∥ §4 强制面 ⑦/生效句 ∥ §5 快照形式/卷形式 ∥ §6 DNS 闸 ∥ §8 两设置键 + 工作区行动作形 ∥ §9 快照列表行 ∥ §11 探针处置列与闭环边界 ∥ §12 执行面用例指针 + B39/B40/E33 随正 ∥ §13 预算（新八档 + 三行读数 + 拆案两项销）∥ §14 KD 指针行 ∥ §15 三处收口 ∥ §16 R74。**产品码零触（设计轮）。**
- 2026-10-10（**server-exec-sandbox 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §1 · 台账 #1224；需求 §5 沙盒块 + 用户 14:00 两平面裁定）：建档——两平面形态 ∥ v11 七表 ∥ runner 注册/通道/最小权限 ∥ 放置与牲口语义 ∥ 出站规则单源（两类/两闸/通配/即生效）∥ 待批队列 ∥ 工作区凭据 ∥ 控制台六面（必交面） ∥ 探针套件 P1–P14 ∥ 用例表（N40–N44 ∥ B35–B40 ∥ E29–E33） ∥ 决策 KD-SV-63…72 ∥ 未裁点 U1–U5 + 披露 D1–D4（U1–U5 已于 2026-10-10 14:23 裁定——见 §10）。**产品码零触（设计轮）**。
- 2026-10-10（**server-exec-sandbox 批 · 裁定收正 · eng-designer**——用户 14:23「都按建议」；承批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §1 · 14:23 裁定节）：§10 收正为「已裁决策」（U1–U5 逐行裁定值）∥ §4/§5/§8 三处标签同拍 ∥ D1–D4 保持（用户未异议——按设计实施）。**产品码零触**。
- 2026-10-10（**server-exec-sandbox 批 · 裁定收正 · eng-designer**——用户 14:24 裁定「thincoder server启动应该是不依赖沙盒的」）：§1 补「server 启动与运行零依赖沙盒/runner」句 ∥ §1/§14 可用性门显式限定「仅沙盒功能面不可用」。机制句零改。**产品码零触**。
- 2026-10-10（**server-exec-sandbox 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-10-server-exec-sandbox.md` §3 轮次 1 十五发现之 1–14 + 用户当日并入 A 节）：#1 每工作区资源档落机制（`limits_json` ∥ PATCH 写端点 ∥ 取值序 ∥ create 载荷 ∥ N45）∥ #2 默认单单源收正（= `sandbox_rules` 种子行；settings 键撤——§2/§4/§8）∥ #3 冲突序限定「显式 deny 恒先」+ 种子 deny ≺ 显式 allow（§4/§10）∥ #4 轮换 = 卷保留的容器重建（P13 补新 key 半支 ∥ E31 随正）∥ #5 join token 落点 = 进程内存 + 重启作废（N40/E30 随拍）∥ #6 `requireRunner` 守卫落点钉定 + 预算行（session.mjs）∥ #8 AC-36 标记收正（已落需求档）∥ #10 指令悬挂回收（§3 + B41）∥ #13 P8 改结构判据（canary 真值不下行）。A 节 = A1 成员面（§8 成员面 + `#/me/sandbox`）/ A2 加入流程三件 / A3 牵连计数随正（档目 33 ∥ 34）。**零新语义**（评审发现直接导出项 + 用户直令）。
- 2026-10-10（**server-exec-sandbox 批 · checkpoint 通路口径 fix 轮 · eng-designer**——2026-10-10 裁定落档）：§5 上送句补通路口径（octet-stream ∥ 路由级 200 MiB ∥ 流式落盘——`gateway/API.md` §2.6）；§13 B40 保持（未触——与路由上限同值）。**产品码零触**。
- 2026-10-10（**runner-admin-console 批 · 设计档随正 · eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §1 · 台账 #1252；用户 2026-10-10 19:52–19:56 口径「runner = 远程 Docker API 节点」）：执行面重定随正——§1 两平面口径重写 ∥ §3 重写为「节点登记（最小接入面）」（添加/删除 + 连通自检；托管接入 = 需求在册，归 #1236/#1237）∥ §2 列面/审计/修订号随正 ∥ §4/§5/§6 执行机制句清（强制机制归重做批）∥ §8 运行面/§9 端点判权随正 ∥ §10 U1 改判（Docker）∥ §11 判据去探针引用 ∥ §12 红队探针套件删（需求 AC-36 ⑦ 判据待重做批重建）∥ 用例表随正；旧 §13–§16 顺移 ⇒ **§12–§15** ∥ §14 决策面：KD-SV-64/65/66/75 作废、63/67/68/69/71/72 收正、73/74/76 自 `RUNNER.md` 迁入本表 ∥ §13 预算表去执行面条目；`sandbox/RUNNER.md` 已删（迁移期引文——执行面重定）。**产品码零触**。
- 2026-10-10（**runner-admin-console 批 · A 批最小切片设计 · eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §1 · 台账 #1252；用户 19:59 令）：§3 重写为「节点与容器（最小切片）」（添加节点 ∥ 运行面读数 ∥ 建容器 ∥ 容器读取与动作 ∥ 删节点 ∥ 提议与自加项六条＝父侧提议三 + 设计自加三）∥ §2 补「容器不落表」句 ∥ §8① 运行面落定 ∥ §9 节点/容器面错误形一句 ∥ §11 增最小切片判据行（真机 10.0.0.6）∥ §12 增用例（N46–N48 ∥ B41–B43 ∥ E34–E36；N40 收正）∥ §13 预算随正（+ `docker.mjs` 拟新增；批内件两件随正——旧两件已随执行面清除）∥ §14 增 KD-SV-79/80/81 ∥ §15 增最小切片余项。**产品码零触（设计轮）**。
- 2026-10-10（**runner-admin-console 批 · 托管接入（管理面 agent）设计 · eng-designer**——承批档 §2 · 台账 #1236/#1237；用户 22:19–22:29 四句 + 15:00/15:02 裁）：§3 增托管接入块（步骤表 S1–S8 ∥ 两径 ∥ 探明十项 ∥ 凭据定形 ∥ 硬点① 网络路径 ∥ 提议 ⑦–⑬）∥ §2 增 `sandbox_onboarding` 行 + 审计 kind 句 + 版本链（v11–v13）∥ §8①/§9 随正 ∥ §11/§12 增判据与用例（N49–N52 ∥ B44–B46 ∥ E37/E38）∥ §13 预算随正（+ ssh/onboarding/onboarding-routes 三档）∥ §14 增 KD-SV-83/84/85/86 ∥ §15 边界换向（托管装机退出余项、增托管接入余项）。**产品码零触（设计轮）**。
- 2026-10-10（**runner-admin-console 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-10-runner-admin-console.md` §3 轮次 1 之 1/3/4/5/11/12）：#1 §1 执行面句探活表述收窄（**盒级超时/快照 = 控制端定时器（余面批）**——节点存活 = 读时探活，与 KD-SV-80 对齐；历史 = 本记录）∥ #3 §14 作废行（KD-SV-64/65/66/75）删净（编号留空档）∥ #4 §13 增 `routes.mjs` 拆分预案（触发点 >500 ∥ 余量 ≈50 ∥ 候选拆法 = 容器面路由独立成档（首选）∥ 节点面备选）∥ #5 §13 routes 行注明托管接入四端点转注册（`bin` ±0）∥ #11 §3 连通自检补引导步（无前缀版本读数 → 协商 → 复读）+ §14 KD-SV-81 同拍 ∥ #12 §3 凭据放置条补宿主前提（`sshpass` 缺 ⇒ S2 停 + 报因——检查并报）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**runner-admin-console 批 · 真机走查缺陷修复（fix 轮）· 父侧**——承批档 §6 走查记录；真机三连核 `/version`=200 ∥ `/v1.44/version`=200 ∥ `/1.44/version`=404）：**版本前缀形 = `v<ver>`** 随正（§3 连线口径 ∥ §3 自检步/运行面读数/建容器 ∥ §3 S5/S6 判据 ∥ §14 KD-SV-81）；地址归一 scheme 判定收严至 `://`（主机名形地址可入——与「缺协议补 `http://`」对齐）；同拍 = `routes.mjs` 头注。**产品码触 = `docker.mjs` 两处 + `routes.mjs` 头注**。
- 2026-10-11（**runner-admin-console 批 · 真机走查缺陷修复（fix 轮二）· 父侧**——承批档 §6 走查记录；真机 A/B 核）：**口令径去 `BatchMode`**（§3 S2 行 ∥ §14 KD-SV-85）——`BatchMode=yes` 下 openssh 直接弃用口令面（A：`Permission denied (publickey,password)` ∥ B：去之 `LOGIN_OK`）。密钥径保持 `BatchMode=yes`。**产品码触 = `ssh.mjs` 口令径一条**。
- 2026-10-11（**admin-agent-chat 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-admin-agent-chat.md` §3 轮次 1 之 1–3/5–11）：闸面收净（doc-check 行宽读数）——§3 连线口径行折行（330 ⇒ ≤300；本笔 = 非本批面之闸面清尾——父侧如异议可 revert）。**零语义**。
- 2026-10-11（**sandbox-docker-admin 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-docker-admin.md` §1 · 台账 #1265；用户 2026-10-11 04:36/04:39 两族同批）：§3 增「容器面补齐 + 镜像族」块（八端点 ∥ 自加项表六条）∥ §8① 容器区/镜像区随正 ∥ §11 增判据行 + 机检口径句改指针（单源 = `webui/WEBUI.md` §6；陈值「档目 33 ∥ 34」删）∥ §12 增用例（N53–N56 ∥ B47–B50 ∥ E39–E41）∥ §13 预算随正（routes 493 ⇒ ≈496 ∥ container-routes 168 ⇒ ≈330 ∥ image-routes 新 ≈130 ∥ docker 187 ⇒ ≈330）+ 拆分预案收正（首选已执行）∥ §14 增 KD-SV-92–95。**产品码零触（设计轮）**。
- 2026-10-11（**sandbox-docker-admin 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-docker-admin.md` §3 轮次 1 之 1/2/3/6）：#1 §15 余项去「镜像管理」（已交付——列表/拉取/删除）；「清单下拉」（建容器镜像选择器）转列余项 ∥ #2 §12 增 B51（超 256 KiB ⇒ `truncated: true`）∥ E42（五端点节点不可达 ⇒ 502）+ §11 判据行随拍（B47–B51 ∥ E39–E42）∥ #3 删除条 detail 改单源指针（`accounts/ACCOUNTS.md` §2.1）+ N54/N56 键集指针同拍 ∥ #6 §13 两行分项闭式收平（+≈162：路由注册与头注≈24；image-routes：头注≈15）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**sandbox-image-sources 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-sources.md` §1 · 台账 #1274；用户 2026-10-11 09:17 四点（④ 撤）+ 09:19 预选）：§3 增「镜像源族」块（源清单四端点 + 预选 ∥ v2/Hub 两面读取 ∥ 匿名 Bearer 挑战 ∥ 有界首页 ∥ 五分类如实读绪 ∥ 自加项表五条）；§2 增 `image_sources` 行（v15）+ 审计三 kind + 读数收正（`db.mjs` 458——本批现读）；§8① 增镜像源卡 + 本地镜像表过滤句；§9 增镜像源面句；§11 增镜像源族判据行；§12 增用例（N57–N59 ∥ B52–B55 ∥ E43–E45）；§13 预算随正（+ 三新档；image-routes/db/bin 三行读数收正）+ 小计链补本批 ≈+604；§14 增 KD-SV-96/97/98 + **KD-SV-94 收正**（去「不做镜像源」半句——镜像源族 = 独立面）；§15 增镜像源族余项行。**产品码零触（设计轮）**。
- 2026-10-11（**sandbox-image-sources 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-sources.md` §3 轮次 1 之 1/4/6/7/8/9/10）：#1 §13 routes 行批次名写实（sandbox-docker-admin 批 +3；本批 ±0；`:342`/`:361` 同拍）∥ #4 §12 增 B56（`bad_response`——远端 200 非 JSON/形不符）+ §11 判据行五分类对齐（用例链随拍 B52–**B56**）∥ #6 §13 补本批件两件估（≈420 ∥ ≈280——沿上批之例）∥ #7 §13 audit 行 delta 清单值（**±0**——本批）+ 陈值来源注（托管接入批）∥ #8 `:145` 指涉全限定（`accounts/ACCOUNTS.md` §2.1）∥ #9 §15 已否候选归位（默认源语义 ∥ 分页/排序——不排期，非待办）∥ #10 §13 db 行补余量注（≈10——实施后复读；越 500 ⇒ 同轮补拆分预案）。**零新语义**（评审发现直接导出项）。
- 2026-10-11（**sandbox-image-quick-pull 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-quick-pull.md` §1 · 台账 #1276；用户 13:18 裁「要」；需求 38 ④/AC-38 ④）：§2 读数收正（`db.mjs` **476**——sandbox-image-sources 落地后现读）∥ §3 增「一键拉取」块（入口形/可用态/裁定候选 A + 理由与代价/预填逐值/零新端点/审计——自加项表 ⑤ 行同拍收正）∥ §9 面句补一键拉取（纯前端复用）∥ §11 增一键拉取判据行 ∥ §12 增用例（N60 ∥ B57/B58 ∥ E46）∥ §13 母批实读回填（#1275——三新档 132 ∥ 225 ∥ 150 ∥ `db.mjs` 476 ∥ `bin` 191 ∥ 批内件 682 ∥ 514）+ 本批 ±0 ∥ §13 两行读数回填（`docker.mjs` **327** ∥ `container-routes.mjs` **311**——sandbox-docker-admin 落地后；列报）∥ §14 增 KD-SV-99 ∥ §15 余项删「一键拉取」；同节「本批」陈值改批名（消混指——列报）；同拍 = `webui/WEBUI.md` §2.2/§2.8①/§5/§6 ∥ `design/PROJECT.md` §4/§6/§7/§9。**产品码零触（设计轮）**。
- 2026-10-11（**sandbox-image-quick-pull 批 · 实施后回填轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-image-quick-pull.md` §5 · 台账 #1276）：§13 本批件行实读收正（估 ≈180 ⇒ **实读 437**——2026-10-11 实施落盘；8 腿全展开 ∥ 含修复轮键盘补腿）；**零新语义**（读数）。
- 2026-10-11（**轻通道笔 3——建容器待命命令 · 主 agent 直接执行 · 可 revert**——承轻通道轮 `docs/batches/2026-10-11-light-walkthrough-fixes.md` §1 pen3；用户 21:10 实走上报「ubuntu:24.04 容器一启动就退出」）：§3 建容器条体形随正（**`Cmd: ["sleep", "infinity"]` 恒携**——沿盒镜像自身 CMD 语义；缺它 ⇒ 无长驻进程的镜像一亮即退）；§12 N46 判据行同拍（请求体逐值含 `Cmd`）；批内件断言同拍（`2026-10-10-runner-admin-console.test.mjs:302`）。根因 = 最小切片建容器只传镜像+卷、未传待命命令（盒镜像自带 `CMD ["sleep","infinity"]` 故当时真机走查未暴露）。**产品码触 = `container-routes.mjs` 一行 + 注**。
- 2026-10-11（**sandbox-pull-by-source 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-pull-by-source.md` §1 · 台账 #1281；用户 2026-10-11 18:15 裁「A」+ 18:17 令（UX 反问））：§3 增「拉取认源」块（选源控件形 ∥ 组装逐值 ∥ 与 ④ 预填关系（认源态） ∥ 可用态两分支 ∥ UX 反问面结论 + 单列提议两条）+ 围栏句同拍收正（镜像源族块 ∥ 自加项 ② 行 ∥ 一键拉取块）∥ §9 面句补拉取认源 ∥ §11 增判据行 ∥ §12 增用例（N61 ∥ B59–B62 ∥ E47）∥ §13 随拍（服务端 ±0（头注随正 ±0 行）+ 本批件估 ≈450）∥ §14 **KD-SV-96 收正**（两绝对句废止——逐句落法：①「不注入镜像前缀」⇒「系统零隐式注入」；②「无默认源」⇒「零自动选源」）+ 增 KD-SV-100 + KD-SV-94 半句随正 ∥ §15 两处「零消费面」理由随正。**产品码零触（设计轮）**。
- 2026-10-11（**sandbox-pull-by-source 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-pull-by-source.md` §3 轮次 1 之 1–6 + 用户 2026-10-11 18:33 裁定（P1 ∥ P2 采纳——来源 = 设计侧提议））：#1 §14 KD-SV-96 理由栏修订式表述删净（收正后句式在行内；历史 = 本记录）∥ #2 认源态同步/失效规则写死（手改不自动回落 + 选定态输入完成即组装——幂等；§3 ∥ B61 补腿）∥ #3 「提交恒发输入原文」收正 = 「提交恒发输入框当刻文本（组装后可见值）」（§3/§11/§14 + `webui/WEBUI.md` §6 同拍）∥ #4 §3 组装标签判据自含（末个 `/` 之后末个 `:` 起——与拉取形同口径）+ B59③ 逐值期望串 ∥ #5 本批 webui 增量复算收正（≈+50 ⇒ ≈+53——分项和 45 + 2 + 3×2；`design/PROJECT.md` §6 ∥ `webui/WEBUI.md` §5 + 两档变更记录）∥ #6 §13 `image-sources.mjs` 行补本批差值注（±0 ∥ 头注随 KD-SV-96 收正）+ 口径注（尾空行——split 口径差 1）∥ P1/P2 落定（§3 控件形 ∥ 五点结论 ∥ 单列提议表「已裁采纳」；§11/§12 用例腿随拍；N61 ∥ B61）。**语义 = 评审发现直接导出项 + 用户 18:33 裁定落定（P2 连带 = 组装施加点闭合句——无此则记忆预选空转）；产品码零触**。
- 2026-10-11（**常用源预选表补第 7 条（实走修正 · 轻通道）· 主 agent 直接执行 · 机械 · 可 revert**——承轻通道轮 `docs/batches/2026-10-11-light-walkthrough-fixes.md` §1 pen1；用户 20:14 实走发现）：§3 预选清单 六 ⇒ **七条**（+ `Docker Hub 镜像（1ms.run）`——`docker.1ms.run`；实拉实证 `.6` 200·10.4s·119MB）。同源随动 = `gateway/API.md` §2.5 ∥ `webui/WEBUI.md` §2.10（另笔）∥ 代码表 `SOURCE_PRESETS` ∥ 批内件断言。零新语义（+1 条 + 计数随正）。
- 2026-10-11（**server-doc-split 批 · 波 4（域档接收节 + 活面改指）· eng-designer**——承批档 `docs/batches/2026-10-11-server-doc-split.md` §2）：**增 §16「上抛/余项」**（板档 §9 迁入——R51–R53 ∥ R55–R57 六行逐字；板档同类行 = 保位 stub）∥ 活面 webui 引用改指（旧 §2.8① ⇒ `webui/SANDBOX.md` §2.1① 十处 ∥ 旧 §2.9 ⇒ `webui/SANDBOX.md` §2.2 一处；只改坐标形、零语义）。**产品码零触。**
- 2026-10-11（**sandbox-volumes 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-volumes.md` §1 · 台账 #1291；用户 2026-10-11 21:18 三件 + 21:22 裁「先按不考虑加挂的原方案开批」；需求 40 ∥ AC-40）：§2 增「卷不落表」句 ∥ §3 增「卷族」块（两端点 ∥ 删卷防护（在用 409 ⇒ 400 人话） ∥ 零自动建卷 ∥ 自加项表六条）∥ §8① 增卷区句 ∥ §9 增卷族端点句 ∥ §11 增卷族判据行 ∥ §12 增用例（N62/N63 ∥ B63/B64 ∥ E48/E49）∥ §13 预算随正（+ `volume-routes.mjs` 拟新增 ≈110；routes +2 ∥ docker +≈8；小计 ≈+120）+ 本批件两件估 ∥ §14 增 KD-SV-104/105 ∥ §15 余项清（删已交付陈值两枚——「清单下拉」∥ 「卷删除」；列报）+ 增卷族余项行 ∥ §16 增 R59。**产品码零触（设计轮）**。
- 2026-10-11（**轻通道轮收口评审 #249 发现收正 · 主 agent 直接执行 · 可 revert**——评审 1🔴+2🟡+2🔵；本档两处：① §11 镜像源族行「预选六条在册」⇒ **七条**（发现 4——计数漂移）；② §3 建容器条增**服务镜像面注**（自带启动命令不生效——发现 2 采纳落档）。同拍他档 = `gateway/API.md` §2.5 建容器行体形补 `Cmd`（发现 1——🔴 收正）。
- 2026-10-11（**console-tabs-component 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-console-tabs-component.md` §3 轮次 1 之 4（父侧裁定——补指针行）：§14 增 KD-SV-102/103 指针行（console-tabs-component 批——公共标签页组件 ∥ 沙盒页分标签；页级 KD 登记 = `webui/TABS.md` §1——本域不复制）。**零新语义；产品码零触。**
- 2026-10-11（**sandbox-volumes 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-11-sandbox-volumes.md` §3 轮次 1 之 2/3/4/5/7（父侧受理）：#2 §16 R59② 翻「已办」（console-tabs-component 批设计定稿轮随卷区落位同步——以 `webui/SANDBOX.md` 现句为准）∥ #3 §12 补卷区表读败腿 B65（§11 卷族行用例链随正 B63–B65）∥ #4 §16 R59 增 ④ 需求档回笔（AC-36 ⑥ 分期链 +1 步 ∥ §5 不做清单「卷删除」改指 §11——写法/计数 = 主 agent 定）∥ #5 §15 卷族余项行增「卷族↔工作区卷关系」登记（待工作区面定形——零新机制）∥ #7 §13 `container-routes.mjs` 读数收正（现读 313——轻通道笔 3 落地后）。**零新语义（评审发现直接导出项）；产品码零触。**
- 2026-10-12（**admin-chat-creds-merge 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-12-admin-chat-creds-merge.md` §1 · 台账 #1326；**用户 2026-10-12 裁：SSH 凭据进管理面 chat ∥ 托管接入将来并入 chat ∥ 设主机表管 SSH 凭据**）：§2 增 v19 句 + `sandbox_runners` 行列面（主机表）∥ §3 增「主机凭据」块（主机表裁定 + 被否代价 ∥ 七列 ∥ 凭据写面两端点 + 审计两 kind ∥ 凭据入口 = 弹窗两挂载 + 文本非通道 + 与 sk 面分工 ∥ 复用单源 ∥ `keep` 移交 + v19 回填 ∥ `exec` 进 chat 落点 ∥ 合并路线三步 ∥ 自加项四条）∥ §11 增判据行 ∥ §12 增用例（N79–N82 ∥ B76–B78 ∥ E59/E60）∥ §13 预算随正（+ `hosts.mjs` 拟新增 ≈140；registry/onboarding/db/routes 四行 + 拆分预案两条；本批件一件）∥ §14 增 KD-SV-133/134/135 ∥ §15 增主机凭据/`exec` 余项行 ∥ §16 增 R72（需求档回笔 + 冻结域随正清单 + 随正件 + 披露）。**产品码零触（设计轮）**。
- 2026-10-11（**控制台实走修复轮（走查轮）· 主 agent 直接执行 · 可 revert**——承 `docs/batches/2026-10-11-console-walkthrough-round.md` §1 · 台账 #1299；用户 2026-10-11 23:55 裁「甲」）：`kind` 派生增第三值 **`hub-mirror`**（Hub 镜像两主机——`MIRROR_HOSTS`；预设两条自带）；拉取组装逐值随正（`hub-mirror` 裸名同补 `library/`）；§3 实读注收窄（1ms.run 结论不外推——daocloud 实走实证）；N57 行随正（三值 + 预选七条——陈值「六条」收正）。**产品码触 = `image-sources.mjs`（派生）+ 客户端组装两档 + i18n 两表。**
- 2026-10-12（**admin-chat-creds-merge 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-12-admin-chat-creds-merge.md` §3 轮次 1 之 2/3/4/5/6/7/8/10/11/12）：#2 KD-SV-91 凭据类例外（chat 径撤销两行）+ N82 两径腿 ∥ #3 三处「待父侧落」⇒「已落」+ R72①② 状态收正 ∥ #4 移交/回填句列全七列 + 接收行/未接收行两类 + B76 拆两腿 ∥ #5 §2 审计句增两 kind 句（同句陈指「（本批）」改批名） ∥ #6 N80 结果形含四字段（指针） ∥ #7 R72③ 逐随正件补现读 + 档目名单 +1 ∥ #8 `'moved'` 读数口径句 ∥ #10 小计 ⇒ ≈+278 ∥ db 段链终值 ≈646 ∥ #11 R72③ i18n 键组三组（含 system 两表 +2）∥ #12 sudo 口令口径句。**零新语义**（评审发现直接导出项）；产品码零触。
- 2026-10-13（**admin-chat-creds-merge 批 · 段号收正（fix 轮 3）· eng-designer**——承父侧 2026-10-13 裁定〔creds = v18 ∥ wake = v19——实落次序与批序对调；沿 `store/STORE.md` §1 同句落形〕）：规范面 **11 处 v19 ⇒ v18**（`:19`/`:21`/`:25` ∥ `:237`/`:253`/`:269` ∥ `:471`（B76 ⇒ 「v17 库升 v18」）∥ `:496`/`:514`/`:553` ∥ `:591`）；段链表随正（v18 +≈72 ∥ v19 +≈14——终值 ≈646 不变）；记录面旧号按史留存（`:623`）。**同拍读数收正**：`:514` 批内件 ⇒ 实读 **606**（2026-10-13）；`:496` db.mjs ⇒ 实读 **631**（2026-10-13 现读）。闸检前后逐字节全等（零新增红）；产品码/测试零触。
- 2026-10-13（**sandbox-outbound-member-face 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-outbound-member-face.md` §1 · 台账 #1248/#1249/#1233/#1234；用户 2026-10-13「全做」）：§4 增**强制面**块（三层求值 ∥ 七条定义 ∥ 本批落地范围；L2 = U2-A 不变）∥ §6 增 L1 即时拒句 ∥ §8 成员面翻本批（读面字段 + 所属 runner ∥ 待批发起方提示一行/判据单源/落点）∥ §11 增**红队探针套件判据表（P1–P14）**（P1/P8 收窄 ∥ SKIP 四项前置登记 ∥ P12 补 L1 半支）∥ §13 增本批预算块 ∥ §14 增 KD-SV-136…139 ∥ §15 成员面余项随正 ∥ §16 增 R73。同源随动 = `webui/SANDBOX.md` §2.2/§3/§4 ∥ `gateway/API.md` §2.7 ∥ `webui/WEBUI.md` §1/§6。**产品码零触（设计轮）**。
- 2026-10-13（**sandbox-outbound-member-face 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-outbound-member-face.md` §3 轮次 1 之 1/2/3/4/5/9/10）：§4 强制面块——三层句补**内置允许**（总序 L1 ≻ 内置允许 ≻ L2 ≻ L3）∥ ⑤ 钉调用点（`routes.mjs` 登记 handler）+「建盒/重建前复核」明写随 ⑥ 延后 + 补带入行 `rulesRev`/审计口径 ∥ ⑦ 本批落地范围随正 + 增**段值推导**行（服务器段/节点段取值明写）∥ §11 出站行补强制面子句 + 用例链；P1 行收窄（UID ∈ [1000, 65533] 窗）；增**闭环边界** bullet（#1248/#1249 闭环 = 执行面重做批；本批验收 = 控制面腿）∥ §12 增 N64 ∥ B66 ∥ §13 小计链补本批 ≈+48 ∥ §14 KD-SV-136/137 随正 ∥ §15 成员面余项行 + §16 R73②③ 随正（随正件逐件现读 ∥ 门禁链项作废——用户 2026-10-12 裁）。**零新语义**（评审发现直接导出项 + 已裁落定）；产品码零触。
- 2026-10-13（**sandbox-outbound-member-face 批 · 实施后收正轮（fix）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-outbound-member-face.md` §2 补正块 ∥ §5 实施 #17/#18；父侧 2026-10-13 裁定上抛全采纳）：§4 强制面总序句补**零地址闸**位次（总序 = L1 ≻ 零地址闸 ≻ 内置允许 ≻ L2 ≻ L3——与实现同判）∥ KD-SV-136 行同拍 ∥ §13 本批块与 `rules.mjs`/`routes.mjs` 两行现值回填（**498–499** ∥ **476**——实测）+ §13 增 `rules.mjs` 贴线句（距 500 软线 1–2 行；台账 #1352 在案）+ 批内件实读（**379 ∥ 374**）。**零新语义（读数与位次收正）；产品码零触（码面已定——实现为准）。**
- 2026-10-13（**member-face-chat 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §1 · 台账 #1215；用户 19:32/19:33；需求功能点 50 ∥ AC-50）：§5 增成员面接线（盒起停 ⇒ 会话在线态随动；会话真源在 server）∥ §8 成员面块增会话接线句 + 待批提示句补 #1215 处理（单列提议——R75） + 成员写面翻本批（创建/启停/销毁/拉仓——本人 + 上限；不另开管理面）∥ §13 增本批预算行（`routes.mjs` 越线 ⇒ 工作区面拆档；`registry.mjs`；壳档账归 `agent/MEMBER-AGENT.md` §5）。同源随动 = `agent/MEMBER-AGENT.md`（新档） ∥ `gateway/API.md` §2.11 ∥ `webui/CHAT.md` §2.2 ∥ `webui/WEBUI.md` §6。**产品码零触（设计轮）。**
- 2026-10-13（**member-face-chat 批 · 设计评审轮 1 修正（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §3 轮次 1 之 5/12）：#5 §14 KD-SV-138 零写控件句随正（写面 = member-face-chat 批开）+ §15 成员面余项同拍（轮换/快照恢复仍管理面）∥ #12 §8 设置键对照行补 `memberWorkspaceLimit`（正整数——缺省 3；成员面行）。**零新语义**（评审发现直接导出项）；产品码零触（设计轮）。
- 2026-10-13（**sandbox-exec-rebuild 批 · 设计修订轮增补（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1 「2026-10-13 21:32 · 用户裁定（底座可换 = 完整功能进本批）」；用户原话「底座那个做完整功能吧」）：§2 增 `base_image` 列（v22 随拍）+ `registry_credentials` 表行 + v22 句随正；§3 增**底座可换块**（定义/底座指定形/绑定与生效/派生 tag/前提二档/复用面与新增面分列/审计/披露——机制全文 = `sandbox/EXECUTION.md` §8）；§8 卡面增**底座卡 + 私有仓凭据卡**（标签②）+ 每配置项对照行随正；§9 增端点句（五新端点 + 两处扩 + 拉取凭据注入）；§11 增底座可换判据行；§13 增本增补预算行（三新档 + `image-routes.mjs` delta；全形 = `sandbox/EXECUTION.md` §14）+ 本增补件两件估；§14 增 KD-SV-184…191 指针行；§15 镜像源族余项「私有源凭据」句改判（凭据面已立——只及拉取/派生注入；目录/标签读取仍匿名）；§16 R74 增补（需求档回笔 + 随正件 + 披露五件 + 真机链）。同源随动 = `sandbox/EXECUTION.md` ∥ `store/STORE.md` ∥ `gateway/API.md` ∥ `accounts/ACCOUNTS.md` ∥ `ops/OPS.md` ∥ `webui/SANDBOX.md` ∥ `webui/WEBUI.md` ∥ `design/PROJECT.md`。**产品码零触（设计轮）。**
- 2026-10-13（**sandbox-exec-rebuild 批 · 乙档落定（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1「2026-10-13 22:38 · 用户裁定（底座前提 = 乙）」；用户原话「乙」）：§3 底座可换块 ①/④ 随正（前提 = 乙（Node 随包带——供体 = 标准镜像，零新增前置；glibc 系；musl/Alpine 如实拒））∥ §11 底座可换行同拍 ∥ §14 KD-SV-184…191 指针行「前提二档」⇒「前提（乙）」。同源随动 = `sandbox/EXECUTION.md`。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-container-terminal 批 · 实施后回填 · 主 agent 直接执行 · 机械 · 可 revert**——承 §16 R85②：档目断言 **+4 名 ⇒ +6 名**（实施实拆 `terminal-vt.mjs` ∥ `terminal-codec.mjs`——越线拆案已落）+ 键集/键数指纹**已随正**（`docs/batches/2026-10-08-server-public-structure.test.mjs`——当刻实读 1033 ∥ 1038；复跑 6/6 绿）。同拍 = `webui/TERMINAL.md`（件表六行实读回填）∥ `webui/SANDBOX.md`（件表/面小计/判据行）∥ `webui/WEBUI.md`（档目链 +6）。**产品码零触（回填——读数与状态）。**）
- 2026-10-13（**member-face-chat 批 · 裁定修订轮（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §1（用户裁定：题一翻案——会话真源在盒内 / 题三补——登记即放行 + 成员凭据））：§4 增**预授权条目块**（来源 = 项目登记——`source='project'`；带入口径/审计/可撤/直通；非拉仓裸出站仍待批）∥ §5 成员面接线句随正（会话真源在盒内；连接口径 sync ⇒ `hello`）∥ §6 增预授权域零挂起句 ∥ §8 增**成员 git 凭据面**落点句（我的·账户页——不进沙盒页）∥ §13 增本批裁定修订轮加笔行（`rules.mjs` ≈518——**越线 ⇒ 拆案触发**）+ `rules.mjs` 贴线句随正 + member-shell 估 ≈670 ⇒ ≈730。同源随动 = `agent/MEMBER-AGENT.md` §3.6/§6 ∥ `accounts/ACCOUNTS.md` §2.1 ∥ `sandbox/EXECUTION.md` §6 ∥ `webui/ME.md` §3。**产品码零触（设计轮）。**
