# Thincoder Server · 沙盒（sandbox/SANDBOX）

> 板块 = server ∥ 本域 = sandbox（服务端执行沙盒）；本档 = 域档（控制面口径）；**执行面单源 = `sandbox/EXECUTION.md`**（通道 ∥ 盒生命周期直调链 ∥ 主机侧件 ∥ 盒运行时通道）。
> 需求单源 = `docs/server/requirements/PROJECT.md` §5 沙盒块（#1215 前置硬题）；**控制面/执行面分离 = 用户裁定**（原话：「沙盒可不可以不运行在thincoder-server本机？我们可以考虑外挂几台机器跑沙盒，否则一个节点把服务器干死了就都死了。」）。
> **执行面 = runner（远程 Docker API 节点）**：控制面直调 Docker API ∥ 主机侧强制走 SSH ∥ 集群化 = 用 Docker 自己的集群 ∥ 机器上不驻留我们的进程；机制全文 = `sandbox/EXECUTION.md`。
> 端点表 = `gateway/API.md` §2.5/§2.7（单源）；表结构全文 = `store/STORE.md` §2 v11–v22 段。

## 1. 形态与两平面

- **一句话**：沙盒 = 容器强制的代码执行隔离件——**盒**（每工作区一个容器）跑在**执行面（runner）**的机器上，由**控制面（server）**编排治理；**server 本机不跑盒**。
- **控制面**（本档）= server 的 sandbox 域：节点登记 ∥ 编排 ∥ 每工作区凭据 ∥ 审计 ∥ 控制台（出站规则/待批队列两件已退场）。
- **执行面 = runner（远程 Docker API 节点）**：控制面**直调 Docker API** 建/起/停/拆盒；**主机侧强制走 SSH**（磁盘限额）；**机器上不驻留我们的进程**；集群化 = **用 Docker 自己的集群**（Swarm）；**盒级超时/快照 = 控制端（server）定时器**（节点存活 = 读时探活——§14 KD-SV-80）——用户定；**机制全文 = `sandbox/EXECUTION.md`**（三腿 ∥ 三证 ∥ 直调动作链 ∥ 主机侧件）。
- **为什么分离**：单机把盒与 server 放一起 ⇒ 一台机器被盒压死即全死（用户原话）；分离后盒的资源耗尽只影响所在节点，server 常驻面不受累。
- **容器唯一形态**（「容器是必须，不要考虑什么退路」——用户定）：**无可用节点 ⇒ 仅沙盒功能面不可用**（控制台明示——不降级）。
- **server 启动与运行零依赖沙盒/runner**（用户裁——原话「thincoder server启动应该是不依赖沙盒的，runner应该也只是相关功能不可用。」）：不因缺可用节点 ∥ 沙盒未配置而拒启或降级；缺 ⇒ **仅沙盒功能面不可用**（503 `sandbox_unavailable` + 控制台明示）；网关 ∥ 记账 ∥ 控制台其余页 ∥ 客户面零影响。
- **非目标**（需求块明写）：内核 0day ∥ 侧信道 ∥ 国家级逃逸。

## 2. 对象模型与存储（v11–v13 ∥ v15 ∥ v18 ∥ v22）

新表（v11 段建表 ∥ v12 重建 runners ∥ v13 增托管接入表 ∥ **v15 增镜像源表** ∥ **v18 增主机凭据七列 + 托管接入态增 `'moved'`（DDL 全文 = `store/STORE.md` §2 v18 段）**——DDL 全文 = `store/STORE.md` §2 对应段
；**v22 收正：`sandbox_workspaces` 列面收正在态（去 `required_labels_json`）+ 增 `stop_reason` + 增 `base_image`（底座绑定）∥ 增建 `registry_credentials` 表（私有仓凭据）
  ∥ `sandbox_tasks` 删表（队列退场——KD-SV-161）∥ **`sandbox_runners` 增连接材料四列**（`tls_ca` ∥ `tls_cert` ∥ `tls_key_cipher` ∥ `tls_updated_at`——连接面 TLS 档）∥ 迁移段外提 `src/store/migrations.mjs`（已落）**）：

| 表 | 内容 | 关键列 |
|---|---|---|
| `sandbox_runners` | 登记的节点（= **主机表**——行 = 一台主机，SSH 凭据随之；列面/机制 = §3 主机凭据块） | id ∥ name ∥ address（Docker API 地址——**SSH 目标 = 其 host 部分**）∥ status（active/disabled）∥ runtime_json（连通自检读数）∥ created_at ∥ **v18 新增**：ssh_port ∥ ssh_user ∥ auth_kind（key/password）∥ secret_cipher ∥ sudo_cipher ∥ credential_state（none/sealed/revoked——**密列零回显**）∥ credential_updated_at ∥ **v22 增**：tls_ca ∥ tls_cert ∥ tls_key_cipher（AES-256-GCM——**密列零回显**）∥ tls_updated_at（连接材料——**仅 TLS 档**；不变量 `https` ⇔ 三件齐——§3 连接方式块） |
| `sandbox_workspaces` | 工作区登记 | id ∥ name ∥ owner_member_id ∥ key_id ∥ key_plain ∥ runner_id（绑定节点）∥ limits_json（每工作区覆写——下条）∥ created_at ∥ `stop_reason`（停因注记——v22 增：idle_ttl/wallclock_ttl/manual；NULL = 未停；引擎态恒读时读） ∥ `base_image`（底座绑定——v22 增：NULL = 标准镜像 `settings.image`；非空 = 归一引用（`名:标签`）；生效 = 下次建盒/重建——§3 底座可换块） |
| `sandbox_rules` | 出站规则（**已退场**；表在库留史——零写入零读面） | id ∥ kind（cidr/domain）∥ action（allow/deny）∥ target ∥ port ∥ protocol ∥ priority ∥ note ∥ source（default/admin/approval）∥ created_at ∥ created_by |
| `sandbox_pending` | 待批记录（**已退场**；表在库留史——零写入零读面） | id ∥ runner_id ∥ workspace_id ∥ host ∥ hits ∥ first_seen_at ∥ last_seen_at ∥ status ∥ resolved_at |
| `sandbox_checkpoints` | WIP 快照登记 | id ∥ workspace_id ∥ created_at ∥ size ∥ blob_path ∥ note |
| `sandbox_settings` | 设置（键值——全局默认） | k ∥ v——**键全集与值形 = `gateway/API.md` §2.5（单源）** |
| `sandbox_onboarding` | 托管接入任务 + 凭据（v13——**停机留史**） | id ∥ host ∥ ssh_port ∥ ssh_user ∥ auth_kind ∥ secret_cipher ∥ sudo_cipher ∥ credential_mode ∥ credential_state ∥ name ∥ model ∥ status ∥ step ∥ steps_json ∥ runner_id ∥ created_by ∥ created_at ∥ finished_at（DDL 全文 = `store/STORE.md` §2 v13 段；**停机留史**——托管接入退场：零写入 ∥ 零读面；历史数据不删） |
| `image_sources` | 远程镜像源清单（控制台维护——**server 全局**，非按节点） | id ∥ name ∥ address（名 ∥ 址**各自唯一**）∥ created_at ∥ created_by（DDL 全文 = `store/STORE.md` §2 v15 段） |
| `registry_credentials` | 私有仓凭据（**server 全局**——按注册表主机；底座可换） | id ∥ host（注册表主机——归一（小写；Hub 别名归 `docker.io`）∥ **唯一**）∥ username ∥ secret_cipher（AES-256-GCM——复用 `credential-crypto.mjs`；**密列零回显**）∥ created_at ∥ created_by（DDL 全文 = `store/STORE.md` §2 v22 段） |

- **审计**：`audit_events.type` CHECK 重建（v11——沿 v10 表重建先例 `db.mjs:171-192`）——**十型 ⇒ 十二型**（+ `sandbox_rule`（规则增删——detail.action + 规则原文；**写入面已退场**）
  ∥ `sandbox_event`（盒起停拆 ∥ 节点添加/删除（含连通自检失败行） ∥ 快照——detail.kind）；型面单源 = `accounts/audit.mjs`）。
  **镜像源增补**：`sandbox_event` 增三 kind（`image_source_add` ∥ `image_source_update` ∥ `image_source_delete`——detail 键集 = `accounts/ACCOUNTS.md` §2.1；kind 非枚举——CHECK 零动）。
  **主机凭据增补**：`sandbox_event` 增两 kind（`host_credential_set` ∥ `host_credential_revoke`——detail 键集 = `accounts/ACCOUNTS.md` §2.1；kind 非枚举——CHECK 零动）。
  **连接方式增补**：`sandbox_event` 增一 kind（`runner_connection`——连接方式变更（设/改/关 TLS——含材料清零）；detail 键集 = `accounts/ACCOUNTS.md` §2.1；kind 非枚举——CHECK 零动）∥ `runner_add` detail 增 `tls` 布尔键。
- **明文落库**：`sandbox_workspaces.key_plain`（工作区 key 明文——盒每次重建须再注入；先例 = provider key 明文（KD-SV-19）；披露 = §10-D2）。
- **每工作区资源档（覆写）**：`sandbox_workspaces.limits_json`（JSON 对象——键 = `cpus` ∥ `memMb` ∥ `pids` ∥ `diskMb` ∥ `idleTtlMinutes` ∥ `wallclockTtlHours`；缺键 = 随全局默认）；写端点 = PATCH（§9 ∥ `gateway/API.md` §2.5）；**取值序 = 全局默认（`sandbox_settings`）⇒ 逐键叠加工作区覆写（覆写优先）**。
  解析结果 = 建盒/重建时的容器参数（控制面直调 Docker API——§1）；生效 = 下次建盒/重建（运行中盒零触——容器旗不可热改）。
- **容器不落表**：容器 = 节点上的 Docker 容器——**Docker 引擎即真源**（读时读 ∥ 动作直调；控制面零镜像 ∥ 零同步机制——§14 KD-SV-79）。
- **卷不落表**（同族）：卷 = 节点上的 Docker **命名卷**——引擎即真源（读时读 ∥ 直调；零缓存零同步——§3 卷族 ∥ §14 KD-SV-104）；**建卷归引擎**（首用即建——我方零建卷调用）。
- **工作区卷形式定形（KD-SV-162）**：工作区卷 = **主机路径绑定** `<workspaceRoot>/<ws-id>`（配额 ∥ 快照 ∥ 清理皆以路径为准）；与「卷族」（命名卷）并存不代管（卷区不列工作区卷——§15 登记项闭合）；盒态 = 引擎即真源（读 `tc-ws-*` 容器——§14 KD-SV-79；`stop_reason` = 服务器动作注记，非引擎态镜像）。

## 3. 节点与容器（最小切片）

> **射程（用户令）**：① 添加节点（登记一台 Docker API 节点）② 创建容器 ③ 启动 ∥ 停止容器 ④ 删除节点（+ 容器删除——提议④）。**其余全部不做**（一行带过：出站闸 ∥ 待批（两件已退场） ∥ 磁盘限额 ∥ 探针 ∥ 心跳/放置 ∥ Swarm ∥ 快照 ∥ 镜像管理 ∥ 工作区↔容器映射 ∥ 卷删除 ∥ 限额/端口/网络 ∥ TLS——§15）。
> **连线口径**：地址 = `[http://|https://]<host>:<port>`（登记输入归一：**按档补 scheme**——明文档（缺省）缺协议补 `http://`、缺端口补 `2375`；TLS 档缺协议补 `https://`、缺端口补 `2376`；**显式 scheme 与档相抵 ⇒ 400**——§3 连接方式块）；
> **调用恒带版本前缀**（**前缀形 = `v<协商版本>`**——如协商 `1.44` ⇒ 路径 `/v1.44/…`；真机核：`/1.44/…` = 404 ∥ `/v1.44/…` = 200）；登记时协商 = `max(1.44, MinAPIVersion)`，须 ≤ `ApiVersion`，否则拒登记——提议⑤；**引导步 = 先取无前缀版本读数、再定前缀**——见下）；读类超时 3s ∥ 动作类 15s（常量；测试可注入 `fetchImpl`）。
> **读时探活（非心跳）**：运行面/列表读数 = 请求内现打（并发；无后台定时器 ∥ 无心跳机制——§14 KD-SV-80）。

- **添加节点**（`POST /api/admin/sandbox/runners`——提议①）：入参 `{ name, address }`（名 ≤ 40 字符；地址归一形如上）。
  **连通自检**（引导步 → 协商 → 复读）：① 无前缀 `GET <base>/version` 先取版本读数 ⇒ ② 协商 `ver = max(1.44, MinAPIVersion)` 须 ≤ `ApiVersion`（否则拒）⇒
  ③ `GET <base>/v<ver>/version` 复读全量 `{ Version, ApiVersion, MinAPIVersion, Os, Arch }` ⇒ 通过 ⇒ 落 `sandbox_runners` 行（`status='active'`；`runtime_json` = 自检读数）+ 审计行 `sandbox_event`（`kind=runner_add`）。
  失败（不可达 ∥ 超时 ∥ 非 Docker API 响应 ∥ 版本不兼容）⇒ **502 `upstream_error`** + 逐句人话 + **零落库** + 审计行（`runner_selfcheck_failed`）；重名 ∥ 地址形非法 ⇒ 400。
  **节点侧前置**：节点机 Docker 引擎须监听 TCP（测试机 = `dockerd -H fd:// -H tcp://0.0.0.0:2375` systemd override；前置步 = `docs/TEST-ENV-ECS.md` §7「节点接线链」）；**TLS 档可选（§3 连接方式块：缺省明文不变；`https://` 地址才走 TLS；证书 = 用户自备）**。
  **主机侧命令前置**：服务须以**可读 `/dev/loopN`（loop 设备 `brw-rw---- root disk`）的身份**运行（root ∥ `disk` 组）——不可读 ⇒ 配额就位判据⑤（两侧 UUID 比对）空转、陈旧挂载档不自愈（退化由安全性质派生：读不了即不臆断、不重建；判据全文 = `sandbox/EXECUTION.md` §4）；不设「无 root 判据腿」。
- **运行面读数**（`GET /api/admin/sandbox/overview`）：每节点现打 `GET <base>/v<ver>/info`（3s ∥ 并发）⇒ 行 = `{ id, name, address, status, online, version, containers: { total, running } ∥ null, selfCheck, createdAt }`（`online=false` ⇒ `version`/`containers` = `null`——离线读数不外推）。
  `status = available ⇔ 至少一个节点在线`（无节点 ⇒ unavailable「无节点注册」；全离线 ⇒ unavailable「节点全部不可达」）；**节点面（添加/删除）恒可用**（不随门禁）。
  写门（`requireSandboxAvailable`——需节点的写路径（工作区创建/动作；设置不设门）= 静态判据（存在 `active` 节点））。
- **创建容器**（`POST …/runners/:id/containers`——提议②）：入参 `{ name, image, volume?, command? }`（名 = Docker 容器名形；镜像 = 控制台预填设置 `image` 值（现缺省 `thincoder-sandbox:1`）；卷 = Docker 卷名，空 = 不挂；
  **命令 = 启动命令（用户裁「甲，应该有个默认，但是可覆盖」）**：缺省/`null` ⇒ 待命命令 ∥ 字符串 ⇒ 空格切分参数（不解析引号——本字段非壳）∥ 显式空串 ⇒ 400（空命令容器一亮即退））。
  ⇒ `POST <base>/v<ver>/containers/create?name=<名>`（体 = `{ Image, Cmd: ["sleep", "infinity"], HostConfig: { Binds: ["<卷>:/workspace"] } }`——**待命命令恒携**
  （盒语义——沿盒镜像自身 CMD；缺它 ⇒ 无长驻进程的镜像一亮即退——用户走查报；**服务镜像面注**：镜像自带启动命令随之不生效（容器只待命、不跑其服务——按需自行换命令：**建容器窗「命令」字段可覆写**）；卷缺 ⇒ 省略 `HostConfig`）⇒ 201 ⇒ `{ container: { id, name, image, state: "created" } }` + 审计行（`container_create`）。
  引擎 404（无此镜像）∥ 409（名占用）⇒ 400（含引擎原文）；不可达 ⇒ 502。**创建 ≠ 启动**（两动作分列——用户四项逐条）。
- **容器读取与动作**：列表 = `GET …/containers`（读时读 `GET <base>/v<ver>/containers/json?all=1` ⇒ `{ containers: [{ id, name, image, state, status }] }`——名去前导 `/`）。
  **启动** ∥ **停止** = `POST …/containers/:containerId/{start,stop}`（204 ⇒ 200；**304（已启/已停）⇒ 幂等成功**；`t` 不带 = 引擎缺省 10s）∥ **删除** = `DELETE …/containers/:containerId`（`?force=1`——运行中强停强删；**卷不随删**）。
  动作各落审计行（`container_start` ∥ `container_stop` ∥ `container_delete`）；引擎无此容器 ⇒ 404 `not_found`；余 ⇒ 502。
- **删除节点**（`DELETE …/runners/:id`——提议③）：先读承载容器 ⇒ 有容器未给处置 ⇒ 400（「请选保留 ∥ 连删」）∥ `containers:"keep"` ⇒ 只删登记（容器原样留机）∥ `"remove"` ⇒ 逐个强删 ⇒ 全成 ⇒ 删行；**任一失败 ⇒ 502 + 登记行保留**（消息携失败清单）；无容器 ⇒ 直接删行。
  **节点不可达 ⇒ 仅 keep 可过**（连删 ⇒ 502）。**有承载工作区 ⇒ `confirm: true`**（现行为保留——工作区面零改）；**客户端读工作区清单失败 ⇒ 不携 `confirm` 且删除钮先禁**（读败 ≠ 无承载；服务端行为零改——不可达仍只放 keep 过）；不存在 ⇒ 404；审计行（`runner_delete`；detail 携 kept/removed）。**删登记 ≠ 动机器**（节点机 ⧺ 容器 ⧺ 卷均原样）。
- **提议与自加项**（用户今日三令：自加项必须带理由、禁冒充用户口径——逐条）：

| # | 项 | 来源 | 为什么 | 不做的代价 |
|---|---|---|---|---|
| ① | 连接形 = 直连 Docker API（地址 + 端口；内网；**不做 TLS**） | 父侧提议 | 最小切片——证书面（签发/续期/信任链/节点配置）大于本切片本身；内网 | 不做 TLS 本身的代价明示：2375 明文 = 无鉴权的 root 等价口暴露于网内（限内网；网不可信 ⇒ 必先上 TLS）；不采纳（先上 TLS）⇒ 切片推不动 |
| ② | 建容器最小形 = 名称 + 镜像 + 卷 三件 | 父侧提议 | 最小可跑（镜像 = 容器之锚；卷 = 数据落点、工作区卷前身）；镜像用现成盒镜像 | 按完整盒参数集（read-only ∥ cap-drop ∥ 每工作区网络 ∥ 限额）⇒ 工作量与设计面远超本切片（用户明令先不上） |
| ③ | 删节点有容器 ⇒ 二选一「保留 ∥ 连删」 | 父侧提议 | 删节点两义（换机 = 容器还想要 ∥ 退役 = 机器要清）——裁量交用户 | 直接删行不动容器 ⇒ 以为删净、机器上留孤儿容器；无问连删 ⇒ 误删运行中容器 = 事故 |
| ④ | 容器删除 = 独立动作（不只随节点连删） | 设计自加 | 「连删」能力已在本切片（节点删除径）；独立成钮 = 生命周期闭环（建了能删） | 仅节点级连删 ⇒ 单个容器删不掉——只能删整个节点，明显别扭 |
| ⑤ | 调用恒带 API 版本前缀（登记时协商） | 设计自加 | 官方文档明示**无版本前缀调用已废弃**（将来移除）；固定档不协商 ⇒ 未来 daemon 抬底即坏 | 裸无前缀 ⇒ 随官方移除一起坏；固定 1.44 —— Docker 29（最低 1.44）恰贴底无余量 |
| ⑥ | 容器动作落审计行（`container_*`） | 设计自加 | 用户既有「过程留痕」口径 + 审计型已备（`sandbox_event`）；一行成本 | 谁建/停了哪个容器无据（排障面） |

- **手工登记径**（需求 §5 ②——硬化环境用）：即上「添加节点」直填 Docker API 地址。
- **接入面**：手工登记 + **装机/主机运维 = 管理面 chat 内动作**（agent 用 `exec`/`docker`/`runners` + 主机表凭据——零新机制、零新端点；本 § 主机凭据块 ∥ `agent/ADMIN-AGENT.md` §12）；**任务式装机（托管接入）已退场**（用户裁「撤」——弹窗 ∥ 端点族 ∥ 服务件 ∥ 任务面工具删净；`sandbox_onboarding` 表停机留史——§2）。
- **容器面补齐 + 镜像族**：控制台把节点机上的容器与镜像管全——两族八端点；**沿 KD-SV-79（引擎即真源：读时读 ∥ 动作直调 ∥ 零落库零缓存）**；端点行文 = `gateway/API.md` §2.5；UI 落点 = `webui/SANDBOX.md` §2.1①；审计 kind 单源 = `accounts/ACCOUNTS.md` §2.1（型面计数零增——十三型不变）。
  **容器面五件**（在既有 列表/建/启/停/删 之上）：
  - **详情**（`GET …/containers/:containerId`）：`GET <base>/v<ver>/containers/{id}/json`（读类 3s）⇒ `{ container: { id, name, image, state, status, created, startedAt, finishedAt, restartCount, command: { entrypoint, cmd }, env, mounts, ports } }`
    ——挂载 = `Mounts[]`（type/source/destination/mode/rw）∥ 端口 = `NetworkSettings.Ports` 展开（`{ port, hostIp, hostPort }`——未映射 ⇒ hostIp/hostPort = null）∥ 环境 = `Config.Env` 原文 ∥ 命令 = `Config.Entrypoint`/`Config.Cmd`；**零审计**（读动作）。
  - **日志**（`GET …/containers/:containerId/logs?tail=N`）：`GET <base>/v<ver>/containers/{id}/logs?stdout=1&stderr=1&tail=<N>`（读类 3s）⇒ `{ logs, truncated, tail }`
  - **日志**（`GET …/containers/:containerId/logs?tail=N`）：`GET <base>/v<ver>/containers/{id}/logs?stdout=1&stderr=1&tail=<N>`（读类 3s）⇒ `{ logs, truncated, tail }`
    ——**tail 有界**（缺省 200，范围 1–2000；越界/非数 ⇒ 400）；**非 TTY 容器 = 8 字节帧头多路复用流 ⇒ 解复用后输出**（判据 = 首字节 ∈ {0,1,2} ∧ 1–3 字节零 ∧ 帧长 ≤ 余量；判不出 ⇒ 原样透传——TTY 容器）；
    **引擎读数携 `timestamps=1`**（行首时标——日志窗与操作记录并流的排序单源）；**该时标为并流排序的解析前提**——无时标行 ∥ 时标不可解的行不入时间参照、不参与排序（退化为到达序——宁可局部不序，不臆造时间）；文本截断 256 KiB（截断 ⇒ `truncated: true` + 尾句标记）；**零审计**（读动作）。
  - **重启**（`POST …/containers/:containerId/restart`）：`POST <base>/v<ver>/containers/{id}/restart`（动作类 15s；`t` 不带 = 引擎缺省 10s）——204 ⇒ 200；404 ⇒ 404 `not_found`；余 ⇒ 502；审计 `container_restart`。
  - **强杀**（`POST …/containers/:containerId/kill`）：`POST <base>/v<ver>/containers/{id}/kill`（SIGKILL——信号可选不做）——204 ⇒ 200；**引擎 409（未运行）⇒ 400 人话**（「容器未在运行——无需强杀」——≠ stop 的 304 幂等语义）；404 ⇒ 404；余 ⇒ 502；审计 `container_kill`。
  - **用量**（`GET …/containers/:containerId/stats`）：并发两读——`GET <base>/v<ver>/containers/{id}/stats?stream=false&one-shot=true`（CPU/内存）+ `GET …/containers/{id}/json?size=1`（磁盘）⇒ `{ usage: { cpuPercent, memUsed, memLimit, diskRw, diskRoot, sampledAt } }`
    ——`cpuPercent` = `cpuΔ/systemΔ × 在线 CPU 数 × 100`（一次采样基线不足 ⇒ null——如实）；磁盘 = `SizeRw`（可写层）∥ `SizeRootFs`；**零审计**（读动作）。
  **镜像族三件**（按节点）：
  - **列表**（`GET …/images`）：`GET <base>/v<ver>/images/json`（读类 3s）⇒ `{ images: [{ id, tags, size, created }] }`（`RepoTags` 缺/null ⇒ `[]`——UI 呈「无标签」）；零审计。
  - **拉取**（`POST …/images/pull`）：入参 `{ image }`（形 = `名[:标签]`——标签 = 末个 `/` 之后的末个 `:` 起；缺省 `latest`；含 `@`（digest 形）⇒ 400 人话）⇒ `POST <base>/v<ver>/images/create?fromImage=<名>&tag=<标签>`（**超时 10 分钟**——沿 agent 工具面同值；同步请求）⇒ 200 ⇒ `{ ok: true, image, tag }`；
    **失败两形皆收**：引擎非 2xx ⇒ 400（携引擎原文）∥ 200 流内 `error`/`errorDetail` ⇒ 400（携引擎原文）；不可达/超时 ⇒ 502；审计 `image_pull`。
  - **删除**（`DELETE …/images`）：入参 `{ ref, force? }`（`ref` = 镜像 id 或 `名:标签`——字符集 `[A-Za-z0-9][A-Za-z0-9._:/@-]*`（禁空白/`?`/`#`/`%`）；缺/空/形非法 ⇒ 400；**段级边界**：单点 `.`/`/`/`:` 许可，按 `/` 拆段含 `..` ⇒ 400（零外呼——`ref` 直入引擎删除路径）；**走请求体**——镜像引用字符集含 `/`/`:`，路径段路由不兼容——沿 `DELETE /runners/:id` 体参先例）
    ⇒ `DELETE <base>/v<ver>/images/<ref>?force=<0|1>`（缺省 force=0）⇒ 200 ⇒ `{ ok: true, ref }`；引擎 404（无此镜像）⇒ 404 `not_found`；**409（被容器引用/多标签）⇒ 400 人话**（携引擎原文 + 处置句）；余 ⇒ 502；审计 `image_delete`（detail 键集 = `accounts/ACCOUNTS.md` §2.1）。
  **自加项（逐条带理由）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 日志 tail 有界（缺省 200 ∥ 1–2000）+ 文本截断 256 KiB | 设计自加 | 读类 3s ∥ 连接不悬停；日志体量无界 | 整取 ⇒ 大日志拖死连接/界面冻结 |
  | ② | 非 TTY 多路复用流解复用 | 设计自加 | 创建面不设 Tty ⇒ 引擎返回 8 字节帧头流；不解 ⇒ 输出带二进制帧头残渣 | 不解复用 ⇒ 日志窗乱码 |
  | ③ | 拉取专用超时 10 分钟 + 失败两形皆收（非 2xx ∥ 流内 error） | 设计自加（沿 agent 工具面同值） | 取像耗时可分钟级；引擎错误可能藏流内——两形皆收 = 不对引擎行为下注 | 15s ⇒ 正常拉取必超时；不扫流 ⇒ 失败被当成功 |
  | ④ | 镜像删除 `ref` 走请求体 + `force` 缺省 false（UI 勾选才强删） | 设计自加 | 引用字符集含 `/`/`:` ⇒ 路径段不兼容；强删爆炸半径更大（删他物所依） | 路径参数 ⇒ 带斜杠引用不可达；缺省强删 ⇒ 误删面扩大 |
  | ⑤ | 强杀 409 ⇒ 400（非幂等成功） | 设计自加 | stop 的 304 是引擎给的幂等语义；kill 无此语义——如实报（未运行 = 无事可杀） | 假装成功 ⇒ 读数骗人 |
  | ⑥ | 用量 = 一次采样（`one-shot`）+ 磁盘 = inspect `size=1` | 设计自加 | 不加采样器/时序库（新机制——KD-SV-92）；读数如实（基线不足 ⇒ null） | 自建采集面 ⇒ 新机制（不做） |

- **底座可换（用户令「底座那个做完整功能吧」；机制全文 = `sandbox/EXECUTION.md` §8 底座可换块）**：管理员可为**每个工作区**选定自定义**底座镜像**（用户原话「用户可能会需要选择他自己需要镜像做底座」），我方组件（核 + 壳）叠加上去（**节点侧派生构建**）；**缺省 = 标准镜像（`settings.image`——零行为变化）**；**成员不挑底座**（管理面专属——用户禁项）。
  **定形**：① **底座指定形** = 镜像引用（`名[:标签]`——`parseImageRef` 同判）+ **私有仓凭据**（server 全局——按注册表主机）+ 校验三腿（形校验（400 零外呼）∥ 存在性（节点镜像店——缺 ⇒ 拉取）∥ 前提（构建期校验层——乙：Node 随包带；glibc 系，musl/Alpine 如实拒））；
  ② **绑定与生效** = `sandbox_workspaces.base_image`（NULL = 标准；写面 = `PATCH …/workspaces/:id` 的 `baseImage` 键——`null` = 恢复标准；**生效 = 下次建盒/重建**（沿资源覆写口径；重建径 = 既有「轮换 key」））；
  ③ **派生 tag** = `thincoder-sandbox:base-<hash12>`（内容寻址 = `sha256("<base 引用>|<底座镜像 Id>|<标准镜像 Id>")` 前 12 hex）——缓存（tag 在场即采用）与重建触发（Id 变 ⇒ 重建）零版本比对机制；
  ④ **前提 = 乙（Node 随包带——用户裁）**：取件段 `COPY --from=<标准镜像>` 补 node 运行件（供体 = 标准镜像——本就必在节点，零新增前置）；glibc 系限定（musl/Alpine 如实拒——校验层判）。
  **复用面 ∥ 新增面分列**：**复用** = 镜像列表/删除（派生像 = 普通镜像——原生可见可删；在用 ⇒ 409 ⇒ 400 人话）∥ 拉取（底座获取径——手动拉取命中也注入凭据；一键拉取/认源照常）∥ 镜像源族（目录/标签浏览辅助选引用——零改）∥ 标准镜像契约（件位单源——零第二核源）∥ 主机凭据基建（`credential-crypto.mjs` 加解密 ∥ 掩蔽 ∥ 审计形）；
  **新增** = 派生构建（`derive.mjs`——节点侧 `POST /build`：上下文 = 单 Dockerfile tar ∥ 多阶段 `COPY --from=<标准镜像>` 取件 ∥ 构建零网络）∥ 私有仓凭据面（`registry_credentials` 表 + 四端点 + 拉取注入）∥ `base_image` 列与绑定写面 ∥ 控制台两卡（`webui/SANDBOX.md` §2.1①——标签②）。
  **审计** = 四 kind（`workspace_base` ∥ `image_derive` ∥ `registry_credential_set` ∥ `registry_credential_revoke`）+ `image_pull` 增 `auth` 键（成事才落——缓存命中/失败不落）；键集单源 = `accounts/ACCOUNTS.md` §2.1。
  **披露**：派生真机可用依赖标准镜像件位契约（`/opt/thincoder/app`——成员面落地）∥ 底座 tag 移动 ⇒ 节点本地旧像采用（追新 = 重拉后派生）∥ 派生同步请求（最坏 ≈20 分钟 = 拉取 10 + 构建 10）∥ 逐节点各自派生（tag 内容寻址保证同源）∥ 凭据只及拉取（目录/标签读取仍匿名）。
- **壳更新面（盒内壳件版本化 + 启动自取/自换——box-shell-update 批；机制全文 = `sandbox/EXECUTION.md` §8 壳更新面块）**：壳件成**版本化工件**（内容寻址树哈希——覆盖集 = 源树逐件，材料化产物集外；工件 = `thincoder-server/public/box-shell/`——构建期打包）⇒ 盒壳**启动时**自判/自取/自验/自换
  ⇒ **发布一个新壳版本 ⇒ 盒子下次启动跟到（零镜像重建）**；回退层序 = 取件副本（已验 ∧ 复用前复验）⇒ 内建壳（不 brick）；缓存槽复验不过 ∥ 换执行后崩 ⇒ 该槽失效（清）。
  **与镜像面正交**：取件在容器内——任意内建壳（含派生像 `COPY --from` 所得）皆被启动期取件覆盖；读数 = 盒日志版本行 `[shell] 壳版本 <hash12>（源=取件|缓存|内建）`。
  **调研留痕（本批）**：查过 `docs/README.md` ∥ `desktop/design/PACKAGING.md` §2.8 ∥ 本域两档——结论 = 查过，无相关（对照详条 = `sandbox/EXECUTION.md` §8 壳更新面块）。

- **镜像源族**：控制台管**远程镜像源清单**（增/删/改/列 + 常用源预选）∥ 对可达源列镜像目录（仓库 ∥ 标签）∥ 关键词过滤（本地镜像表 ∥ 源目录清单）。
  **拉取行为零改**（仍由节点引擎拉取——源不写节点 dockerd 配置 ∥ 系统零隐式注入（引用组装仅随选定态——见下「拉取认源」块） ∥ 零自动选源）；端点七条 = `gateway/API.md` §2.5（镜像源七行）；存储 = `image_sources`（v15——`store/STORE.md` §2 v15 段）；
  UI 落点 = `webui/SANDBOX.md` §2.1①；审计 kind 单源 = `accounts/ACCOUNTS.md` §2.1（型面计数零增——十三型不变）。
  **源清单（四端点 + 预选一）**：
  - **列**（`GET /api/admin/sandbox/image-sources`）：`{ sources: [{ id, name, address, kind, createdAt }] }`；
    `kind` = **按地址派生**（`hub` ⇔ 主机 ∈ Hub 四别名（`docker.io` ∥ `index.docker.io` ∥ `registry-1.docker.io` ∥ `hub.docker.com`）∥ `hub-mirror` ⇔ 主机 ∈ Hub 镜像两主机（`docker.m.daocloud.io` ∥ `docker.1ms.run`）；余 ⇒ `v2`）——派生不入库（单源 = `address`，零漂移）；零审计（读动作）。
  - **增**（`POST …/image-sources`）∥ **改**（`PATCH …/image-sources/:id`）∥ **删**（`DELETE …/image-sources/:id`）：增/改入参 `{ name, address }`（改 = 键级——出现键 = 应用）；
    ⇒ 200 `{ source }`（删 ⇒ `{ ok: true }`）+ 审计行（`image_source_add` ∥ `image_source_update` ∥ `image_source_delete`——detail 键集 = `accounts/ACCOUNTS.md` §2.1）；不存在 ⇒ 404；形非法/撞名/撞址 ⇒ 400（库零变）。
  - **形**：`name` = 非空（≤40 字符；首尾空白 trim）；`address` = `[http://|https://]主机[:端口]`（缺 scheme ⇒ 补 `https://`；**含路径/查询/空白 ⇒ 400**）；**名与址各自唯一**（撞 ⇒ 400 人话）。
  - **常用源预选**：静态表（server 端单源——沿 provider 预设先例 KD-SV-17）；`GET …/image-sources/presets` ⇒ `{ presets: [{ name, address }] }`；**表单只回填名 + 址两字段**（零隐藏语义）；
    清单七条（随设计轮维护——源站关停/换址频繁，需求 ① 原话口径）：Docker Hub（`docker.io`）∥ GitHub Container Registry（`ghcr.io`）∥ Quay（`quay.io`）
    ∥ 阿里云 ACR（`registry.cn-hangzhou.aliyuncs.com`）∥ 华为云 SWR（`swr.cn-north-4.myhuaweicloud.com`）∥ Docker Hub 镜像（DaoCloud——`docker.m.daocloud.io`）
    ∥ Docker Hub 镜像（1ms.run——`docker.1ms.run`）（实走补——该源实拉实证在案，用户实走发现其缺表；同步 = 代码表第 7 条）。
  **源目录读取（两端点——server 直连源）**：
  - **仓库目录**（`GET …/image-sources/:id/catalog`）∥ **标签清单**（`GET …/image-sources/:id/tags?name=<仓库>&n=<N>`）：读类预算 **10s**（跨公网——**逐调用**口径（挑战链逐跳各计）；沿探活/发现家族；非节点面 3s）；**与节点零涉**（不查沙盒可用性门）。
  - **v2 面**：目录 = `GET <base>/v2/_catalog?n=<N>` ∥ 标签 = `GET <base>/v2/<name>/tags/list?n=<N>`；`name` 形 = 仓库名（小写字母数字 + `._-/` 分隔——形非法 ⇒ 400 **零外呼**；`..`/`?`/`#`/空白/大写 ⇒ 拒（防路径穿越））。
  - **Hub 面**（`kind=hub`）：目录 ⇒ **不支持**（`unsupported`——Hub 官方无全站目录 API，如实报）；标签 = `GET https://hub.docker.com/v2/repositories/<ns>/<repo>/tags?page_size=<min(N,100)>`（**API 主机 = `hub.docker.com`**，与登记址无关；该主机不可达 ⇒ 如实 `unreachable`）；**裸名补 `library/`**（`nginx` ⇒ `library/nginx`——Hub 命名空间惯例）。
  - **匿名 Bearer 挑战**（本机实测：ghcr ∥ quay ∥ ECR Public ∥ ACR ∥ SWR 皆 401 + `WWW-Authenticate: Bearer`）：401 且挑战可解析 ⇒ 取 `realm?service=&scope=`
    （目录 = `registry:catalog:*` ∥ 标签 = `repository:<name>:pull`）⇒ 匿名换 token（响应键取 `token` ∥ `access_token`）⇒ **携 `Bearer` 复读一次**；**零凭据**（私有源 = 如实拒——零凭据面；§15）。
  - **有界**：`n` 缺省 200（范围 1–1000；越界/非数 ⇒ 400）；`truncated` = 远端还有下一页（v2 = `Link: …rel="next"`（实测在） ∥ Hub = `next` 非空）；**不翻页**（有界首页——§15）。
  - **读数形**（自含状态——沿 `/api/admin/proxy/test` 先例；远端事实分类不套统一信封）：成 ⇒ 200 `{ ok: true, kind, repositories ∥ tags, truncated, ms }`；
    败 ⇒ 200 `{ ok: false, error: { kind, message }, ms }`——`kind` ∈ `timeout` ∥ `unreachable` ∥ `auth_required` ∥ `unsupported` ∥ `bad_response`；**空列表非错误**（quay 匿名目录回 `{"repositories":[]}`——如实呈空态）；零审计（读动作）。
  **控制台面**（UI 定形 = `webui/SANDBOX.md` §2.1①）：镜像源卡（源表 + 增/改/删弹窗（含预选下拉）+ 目录浏览窗（仓库列表 ∥ 标签列表——两处过滤输入））+ 本地镜像表过滤输入（`views-sandbox-images.mjs`）；一键拉取（本块 ⑤ 项）= 目录窗行动作（行尾「拉取」钮 ⇒ 节点选单 ⇒ 预填既有拉取窗）；拉取认源（本块）= 拉取窗「经由源」选单（选定 ⇒ 引用按源组装；不选 = 原样——见「拉取认源」块）。
  **自加项（逐条带理由——设计侧提议，非用户口径）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 匿名 Bearer 挑战换取（无凭据） | 设计侧提议 | 实测：公开源（ghcr ∥ quay ∥ ECR ∥ ACR ∥ SWR）目录与标签面**均**以 Bearer 挑战应答——不换取则预设清单多数源恒「需认证」 | 仅 Hub 面与匿名开放的自建源可用——② 名存实亡 |
  | ② | 源清单 = **server 全局**（非按节点） | 设计侧提议 | 目录读取发生在 server（server → 源）；按节点 = 清单 × 节点数且复制维护；拉取仍走节点（机器侧零改） | 同一源重复登记；「在哪个节点上浏览」反成负担 |
  | ③ | 目录/标签有界首页（`n` ≤1000 + `truncated`） | 设计自加 | 远端集合可无界（Hub 单镜像 1339 标签——父侧实测）；读类 10s 不悬停 | 整取 ⇒ 大源拖死连接/界面冻结 |
  | ④ | 目录浏览窗过滤 = 前端（零新端点） | 设计自加 | 已载集合上过滤 = 纯前端（沿审计/用量页过滤先例）；远端无过滤 API | 服务端过滤端点 ⇒ 伪能力（远端不参与），徒增面 |
  | ⑤ | 源目录「一键拉取」（节点选单 + 预填拉取窗） | 设计侧提议——**用户裁为做**（机制 = §3 一键拉取块） | 浏览 → 取用的自然收口（免手抄引用）；复用既有拉取窗（零新端点） | 用户手抄 `<host>/<repo>:<tag>`（错抄 = 白拉一次）；隐式取节点 ⇒ 拉错机（§14 KD-SV-99） |

- **一键拉取（用户裁「要」；需求 38 ④ ∥ AC-38 ④）**：源目录浏览窗仓库/标签行尾加「拉取」钮 ⇒ 选节点 ⇒ 打开**既有拉取窗**（引用已预填——预填后可改）⇒ 确认即走**既有拉取径**（`POST …/runners/:id/images/pull`——§3 镜像族三件）。
  **拉取行为零改**（沿 KD-SV-96 围栏句——源不写节点 dockerd 配置 ∥ 系统零隐式注入 ∥ 零自动选源；选定态组装 = 「拉取认源」块）；两档零触；既有窗行为零改；增量 = 导出 + 可选预填参 + 「目标节点」行（`views-sandbox-images.mjs` +≈6——§5）。
  **「拉去哪台节点」裁定 = 候选 A（点钮先出节点选单）**（理由与代价 = §14 KD-SV-99）：理由 = ① 源清单 = server 全局（浏览窗无节点上下文）——隐式目标 = 隐藏状态；② 拉取必落某节点 ⇒ 显式选 = 所见即所拉；③ 选单读数复用运行面概览（读时读——零新机制）。不做的代价 = 手抄引用 + 不知去哪台 ⇒ 功能归零；隐式取节点 ⇒ 无声拉错机（目标机磁盘/带宽被占）。
  - 可用态 = 目录窗打开即读一次 `/api/admin/sandbox/overview`（读时读——零新端点）；≥1 在线节点 ⇒ 钮可用；无节点 ∥ 全离线 ⇒ **禁用 + 一句人话**（复用运行面文案 `admin.sandbox.noNodes`/`admin.sandbox.allOffline`——零新键）；概览读败 ⇒ 禁用 + `mapError` 就地人话。
  - 点钮 ⇒ **节点选单**（在线节点行——名 + 地址；可点行；题「拉取到节点」）⇒ 选节点 ⇒ 既有拉取窗（预填在场 ⇒ 窗内附「目标节点：{name}」行）。
  - 单例（`modal.mjs` KD-SV-31）：开选单 ⇒ 目录窗按「开新先关旧」自动关闭（拉取成后如需续览 ⇒ 重开目录窗）；拉取成 ⇒ 该节点镜像表（前端已载）重取——列表上新，页注入回调；无服务端缓存面。
  **预填逐值**（引用形 = `<主机>[:<端口>]/<仓库>:<标签>`）：
  - 地址**去 scheme**（`http://`/`https://` 剥除——引擎 `fromImage` 引用不带 scheme）；**含端口**逐值保留（如 `10.0.0.5:5000/ns/repo:tag`）。
  - **Hub 面（`kind=hub`）主机统一 `docker.io`**（登记址四别名任一 ⇒ 同此形——沿该面既有收正「API 主机 = `hub.docker.com`，与登记址无关」；`hub.docker.com` 为站点主机非注册表主机，逐值保留会产出引擎不可拉的引用）。
  - 仓库名 = 列表原名（Hub 面裸名按读取面惯例已补 `library/`）；标签 = 标签行所取标签；**仓库行 ⇒ `:latest` 显式**（不依赖服务端缺省径——零隐藏）。
  - 预填**非锁定**（窗内可改——确认值 = 所见值）；预填 ≠ 可达保证（节点侧引擎照拉——失败按既有两形如实报）。
  **零新端点**（四读数皆既有：概览 ∥ 目录 ∥ 标签 ∥ 拉取）；**审计 = 既有 `image_pull`**（服务端既有行——零新 kind；型面计数零增——十三型不变）。

- **拉取认源（用户裁「A」；需求 38 ⑤ ∥ AC-38 ⑤）**：拉取窗加**「经由源」**——选定源 ⇒ 本次拉取的引用按该源组装（拉取仍由节点引擎执行）；不选 = 引用原样（现态）。
  **由来**（如实）：用户实测「加了源，拉取不认它」+ 父侧实走发现 Hub 镜像类源（无全站目录 ⇒ 目录窗零行）在界面上无拉取入口——本面 = 补上源的拉取消费面。
  **控件形**（`views-sandbox-images.mjs` 拉取窗）：引用输入之上加一行选单（`select`——首项「不选（原样）」+ 各源一项，项文 = 源名）；「目标节点：{name}」行**恒显**且同窗共存（手动径 = 所展开节点；预填径 = 选单所选节点——P1 已裁采纳）；源清单**读时读**（开窗读一次 `GET /api/admin/sandbox/image-sources`——零新端点 ∥ 零缓存）。
  **组装逐值**（选定源 ⇒ 对输入原文组装**一次**——纯函数 `pullRefWithSource`（`views-sandbox-images.mjs` 新导出——窗侧；与 `pullRefFor` 值规则同口径）；引用形 = `<主机>/<仓库路径>:<标签>`）：
  - **主机** = 源地址**去 scheme**（`http://`/`https://` 剥除——引擎引用不带 scheme）；**含端口逐值**保留（如 `10.0.0.5:5000`）；**Hub 面（`kind=hub`）主机统一 `docker.io`**（登记址四别名任一 ⇒ 同此形——沿 ④ 预填同口径）。
  - **仓库路径** = 原文剥除**已带主机段**（判据 = **引擎同口径**：首段含 `.` ∥ 含 `:` ∥ = `localhost`——所见与引擎判读一致）；Hub 面剥后**裸名**（无 `/`）⇒ 补 `library/`；**Hub 镜像面（`kind=hub-mirror`）同规则**（裸名 ⇒ 补 `library/`——daocloud 裸名 blob 404 ∥ `library/` 10.7s 拉成）；余 v2 面原样（不自作补——自建/云源命名空间由用户负责）。
  - **标签** = 原文有 ⇒ 逐值保留（判据与既有拉取形同口径：**末个 `/` 之后的末个 `:` 起**——含端口源的首段 `:` 属主机段、不误读）；**无 ⇒ 补 `:latest` 显式**（不依赖服务端缺省径——零隐藏）；**覆盖语义** = 已带主机引用的原主机名剥换为源主机（「经由源」直义）；不选 ⇒ 引用原样（现态）。
  - **不动作与透传**：原文含 `@`（digest 形）⇒ 原样透传（不组装——服务端既有 400 径）；原文为空 ⇒ 不动作（提交仍被既有必填门拦）。
    **实读注**：`docker.1ms.run` 裸名与 `library/` 两形清单皆 200（匿名 token 换取后）——**该结论只对 1ms.run 成立**（daocloud 后续走查实读：裸名 manifest 过、blob 段挂 ⇒ 见 `hub-mirror` 规则）。
  **所见即所拉 ∥ 提交零改**：组装 = **输入框内可见改写**（可再改——沿「预填非锁定——确认值 = 所见值」口径）；「不选」= 不组装（**单向**——不逆变换输入；要换回 ⇒ 手改或再选源后改）；**提交恒发输入框当刻文本（组装后可见值）** ⇒ 走既有拉取径（`POST …/runners/:id/images/pull` 体 `{image}`——**零改 ∥ 零新端点 ∥ 拉取径单源**；组装 ≠ 可达保证——节点侧引擎照拉，失败两形如实报——KD-SV-94）。
  **组装施加点**（两处——皆可见施加、一次性、幂等；「选定态」= 选单选中某源——显式选定 ∥ 记忆预选）：① 选单变更（选定某源）；② 选定态在场时的输入完成（失焦）；**开窗与提交两处不改写**（预选态非自动改写 ∥ 提交恒发当刻文本；回车提交径先组装后提交——不隐写）。
  **与 ④ 一键拉取的关系（认源态）**：一键拉取调用点**携源**（`source` 参——`{ id, name, address, kind }`）⇒ 预填在场的窗内选单**呈现该源**（认源态——预填逐值与组装同口径）；改选另一源 ⇒ 剥换主机重组装（换镜像源重拉 = 一次改选）；改选「不选」⇒ 输入不动（原样提交）；源已被删 ∥ id 不在清单 ⇒ 选单留不选态（预填照常——拉取不阻断）。
  **手改同步规则**：手改输入 ⇒ 选单**不自动回落**（认源态 = 上次组装所用源——不保证与当刻输入一致；提交恒发当刻文本，拉取不误导）。
  **选择记忆（P2——用户裁为做；来源 = 设计侧提议）**：窗重开**预选上次所选**（形态 = 持久——`localStorage` 单键 `tc_pull_source`（沿语言记忆 `tc_lang` 同法；不可用 ⇒ 静默不记忆）；记忆随选单变更更新（含「不选」）；源清单读成后施加——记忆源 id 不在当刻清单 ⇒ **不选态回落**）；**预选态非自动改写**（只动选单，不动输入）；缺省 = 记忆预选（**首次 = 「不选」**——「不选 = 引用原样」句不变）。
  **可用态两分支**：**无源** ⇒ 选单仅「不选（原样）」+「暂无镜像源」提示（复用 `admin.sandbox.sourcesEmpty`）；**源清单读败** ⇒ 不选态 + `mapError` 人话——**不阻断拉取**（窗口核心功能 = 手输拉取，自治——沿「源面与节点无关」同精神）。
  **零新端点 ∥ 零新审计 ∥ 零新 kind**（源清单读 = 既有端点；拉取 = 既有端点/既有 `image_pull` 行）。
  **UX 反问面（用户令——结论）**：用户日常拉像路径两条（实读代码）——① 一键拉取（源卡 ⇒ 目录窗 ⇒ 行「拉取」⇒ 节点选单 ⇒ 预填拉取窗；**Hub 类源此径不可达**——零仓库行，根源 = 缺拉的消费面）∥ ② 手输（镜像区 ⇒ 拉取窗 ⇒ 手抄 `<主机>/<仓库>:<标签>`——错抄 = 白拉一次）。
  加源后最省事路径：镜像区 ⇒ 拉取窗 ⇒ 选源 ⇒ 输裸名（`ubuntu:24.04`）⇒ 组装可见 ⇒ 确认——Hub 镜像类源与自建源同一径；预填径换源重拉 = 一次改选。
  **五点结论**：组装恒可见（非隐藏门）∥ 缺省 = 记忆预选（**首次 = 「不选」**——预选态非自动改写，手输习惯零冲突）∥ 无源/读败不阻断拉取（窗口自治）∥ 认源态（回看即知引用来源——上次组装所用源）∥ 目标节点行恒显（手动径也示去向）。
  **单列提议（自加项——已裁采纳：P1 ∥ P2 均为做；来源 = 设计侧提议（UX 反问面导出））**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 拉取窗「目标节点」行恒显（手动径也显示） | 设计侧提议（UX 反问面导出）——**用户裁为做** | 手动径开窗不示去向（弹窗脱离节点展开上下文）；一行成本 | 手滑拉错机无最后一眼 |
  | ② | 「经由源」选择记忆（窗重开预选上次所选——**预选态，非自动改写**；可改；记忆源失效 ⇒ 不选态回落） | 设计侧提议（UX 反问面导出）——**用户裁为做** | 镜像环境（如 `.6`）每次拉像都经源——记忆省一步 | 每次重选一步；不做则零风险 |

- **卷族（用户裁「先按不考虑加挂的原方案开」；需求 40 ∥ AC-40）**：控制台把节点机上数据卷管到两件——**卷列表**（看得见有什么）+ **删卷防护**（确认窗 + 后果句）；**建容器卷字段只改入口形**（下拉——已有卷可选，也能起新卷名）。
  **卷不落表 ∥ 零自动建卷**（引擎即真源——沿 KD-SV-79/104）：读 = 读时读（`GET /volumes`）∥ 删 = 直调；**建卷归引擎**（Docker 首用即建——我方零建卷调用；真机实读：**容器创建即建**——`POST containers/create` 携新卷名后 `GET /volumes` 当场见卷，不必启动）。
  **端点两件**（行文 = `gateway/API.md` §2.5）：
  - **列表**（`GET …/runners/:id/volumes`）：`GET <base>/v<ver>/volumes`（读类 3s）⇒ `{ volumes: [{ name, driver, createdAt }] }`——引擎字段如实取（`Name`/`Driver`/`CreatedAt`）；`Volumes` 缺/null ⇒ `[]`；**零审计**（读动作）；不可达/超时 ⇒ 502。
  - **删除**（`DELETE …/runners/:id/volumes/:name`）：动作类 15s——`DELETE <base>/v<ver>/volumes/<名>` ⇒ 204 ⇒ 200 `{ ok: true, name }` + 审计行（`volume_delete`——detail 键集 = `accounts/ACCOUNTS.md` §2.1）；**名形先校验**（引擎卷名形 = 字母/数字起头 + `[A-Za-z0-9_.-]` 续；形非法 ⇒ 400 **零外呼**——防路径段穿越）；
    引擎 404（无此卷）⇒ 404 `not_found`；**引擎 409（在用卷）⇒ 400 人话 + 处置句**（真机实读：`remove <名>: volume is in use - [<容器 id>]` ⇒ 译「卷正被容器使用——无法删除」+ 引擎原文 + 「先删除或改用该卷的容器」）；余 ⇒ 502。
  **前端面**（UI 定形 = `webui/SANDBOX.md` §2.1①）：卷区 = 节点行展开内（容器区之后——**归属标签①「运行面」**：载体 = 节点展开）；表 = 名 ∥ 创建时间 ∥ 操作（删除）；驱动透传不入列（无插件环境恒 `local`——恒值噪声）、用量不做（引擎列表**不携**用量字段；要算须另走 `/system/df` 全量重算——非列表面，需求未点）。
    删除 = 确认窗 + 后果句（「卷内数据一并消失，不可恢复」——`confirmModal` 复用，非原生 `confirm`）；在用卷拒删 = 服务端 400 **就地在窗内呈**（弹窗不关，可重试）；建容器弹窗卷字段 = 选单（节点已有卷 + 「新建卷（手输）」逃逸——选定回填下方卷名，可再改；读败/空表 ⇒ 手输照常不反噬）；**空 = 不挂**（现行为零回归）；**`Binds` 逐值零改 ∥ 零隐式建卷**；容器动作后卷区随取（创建即建卷 ⇒ 清单随动——页装配层重置卷区缓存）。
  **自加项（逐条带理由——设计侧提议，非用户口径）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 删卷 = 确认窗 + 后果句（非原生 `confirm`） | 设计侧提议 | 删除不可逆（数据面）；沿 `confirmModal` 先例（删容器/镜像同形）；原生 `confirm` 不可测且排版差 | 一击即删——手滑数据面事故 |
  | ② | 在用卷拒删 = 引擎 409 如实译人话（不前置预检） | 设计自加 | 引擎即真源（KD-SV-79 同族——单源真相）；前置预检（先读容器挂载）+ 后置删除两读有窗口期 | 预检后仍可能被引擎拒（假绿）；双读白增 |
  | ③ | 卷行响应携 `driver`（如实透传）；不做「驱动」列 ∥ 不做用量 | 设计自加 | 引擎字段零成本透传（真机字段在案）；无插件环境恒 `local` = 恒值噪声（AC 三列未点）；用量 = 引擎不携（实读在案） | 自建用量面 = 白增机制；恒值列 = 噪声 |
  | ④ | 卷区落点 = 节点行展开（容器区之后——归属标签①「运行面」） | 设计侧提议（批档在案——按标签归属定） | 卷 = 节点资源（读上下文与容器区同处；建容器弹窗同层）；载体 = 节点展开（与分标签归位块相容） | 独立卷卡 + 节点选单 = 多一层选择面且离容器区远 |
  | ⑤ | 容器动作后卷区随取（页装配层重置卷区缓存） | 设计自加 | 新卷首用即建（真机实读：容器创建即建）⇒ 卷清单随容器动作变动；不随取 ⇒ 容器用了新卷而卷表无它 | 卷表陈旧（用户可见矛盾） |
  | ⑥ | 审计 = `volume_delete` 一行（删卷）；建卷零审计 | 设计自加 | 用户既有「过程留痕」口径（容器/镜像族同族）；建卷 = 引擎行为非我方动作——零审计（如实） | 谁删了哪个卷无据 |

**容器终端（用户三句：想要终端 ∥ 真终端「自己搓」 ∥ 终端核按可复用件做；v1 单石）**

- **形态 = 真 pty 会话**（容器内 `bash` 起在**分配 TTY 的 exec 会话**上）：前端自搓终端核（`webui/TERMINAL.md`）→ **WebSocket 双向** → 服务端会话桥 → **Docker exec（`Tty: true`）**；**无降级面**（伪终端降级 = 用户明令不做——验收「能跑 `vim`/`top` 一类全屏 TUI」即真终端判据）。
- **会话链（服务端三步，全走引擎升级连接；KD-SV-175）**：
  ① **读容器**（`GET containers/<id>/json`——读类 3s）：运行态判据（非 `running` ⇒ 建会话即拒，in-band 错误 `container_not_running`）∥
    locale 判据（`Config.Env` 无 `LANG`/`LC_ALL` ⇒ 注入 `LANG=C.UTF-8`——实测：POSIX locale 下 `bash` 行编辑把中文按八进制转义回显；KD-SV-179）。
  ② **建 exec**（`POST containers/<id>/exec`——动作类 15s）：体 = `{ AttachStdin: true, AttachStdout: true, AttachStderr: true, Tty: true, Env: ["TERM=xterm-256color"（恒）,"LANG=C.UTF-8"（条件，见①）], Cmd: ["/bin/sh", "-c", "if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi"] }`。
     **实测（真机 `10.0.0.6`，Docker 29.1.3 ∥ API 1.44+）**：`Tty: true` ⇒ 裸字节流（无 8 字节复用帧）∥ `Env` = **并入容器 env**（`PATH` 保留——实测 5 键 ⇒ 6 键）∥ 容器未运行 ⇒ **409**（`container <id> is not running`）∥
     无此可执行 ⇒ 建 exec 仍 201、**start 200 且流内原文**（`OCI runtime exec failed: …`）+ 退出码 127——原样落终端，零加工。
  ③ **起 exec（升级连接）**（`POST exec/<execId>/start` 携 `Connection: Upgrade` + `Upgrade: tcp`——体 `{ Detach: false, Tty: true }`）⇒ **`101` + 裸双工 socket**。**实测口径**：不带 `Upgrade` 只能收输出、**stdin 无法流式**（请求体不 end 则无响应头）⇒ 此链 `fetch` 面不可达 ⇒ 服务端走 `node:http` 劫持（`docker-exec.mjs`（已落））。
- **传输层（最小 WebSocket 服务端——`gateway/ws.mjs`）**：标准握手（`Sec-WebSocket-Accept` = `base64(sha1(key + GUID))`）∥ 帧编解码（掩码位/两档扩展长度/分片重组/控制帧）∥ 上界（单帧 ≤ 1 MiB ∥ 解码缓冲 ≤ 4 MiB——越 ⇒ 协议错收口）；
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
- **自加项（逐条带理由——设计侧提议，非用户口径）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 心跳 = 服务端 30s WS ping / 60s 判死 + 客户端 30s 文本 ping | 设计自加 | 半开连接（合盖/断网）不会自己上报 ⇒ 无心跳则会话与 exec 进程悬置 | 死会话堆积；断线用户界面无感（不知已断） |
  | ② | 收口先写 `\x04`（EOF）再关流 | 设计自加 | 实测：`\x04` 使交互壳在提示符处即退（半关/销毁都不能）；成本 = 一写调用 | 每次断开留一个悬置壳进程 |
  | ③ | 注入 `TERM=xterm-256color`（恒）∥ 条件注入 `LANG=C.UTF-8` | 设计自加 | 实测：无 UTF-8 locale 时 `bash` 行编辑以八进制转义显示中文（CJK 验收不达）；条件注入避开覆盖容器自带 locale 意图 | 中文输入显示错乱（验收句不达） |
  | ④ | 审计两行（开/关）+ `durationMs` | 设计自加 | 沿容器/镜像族「过程留痕」口径；终端 = 敏感动作（谁在何时进了哪台容器） | 谁进过哪台容器无据 |
  | ⑤ | `Origin` 同源门 | 设计自加 | 跨站页面可对 WS 发起带 cookie 的握手（REST 面有 SameSite 兜底；WS 面无 CORS 预检）——一号成本 | 跨站终端会话面（安全面缺口） |
  | ⑥ | 帧上界（1 MiB/帧 ∥ 4 MiB 缓冲） | 设计自加 | 自搓帧解析必须有界（无界缓冲 = 内存面风险） | 大帧/畸形流可拉爆服务端内存 |
  | ⑦ | 停机收口在飞会话 | 设计自加 | 升级 socket 不走 HTTP 层自动断——须显式收 | 停机留悬挂 exec 进程与 socket |

**主机凭据（用户裁：SSH 凭据进管理面 chat ∥ 托管接入将来并入 chat ∥ 设主机表管 SSH 凭据）**

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
- **复用单源**：传输 = `thincoder-server/src/sandbox/ssh.mjs`（`createSshExecutor`）；加解密 = `thincoder-server/src/store/credential-crypto.mjs`（已落；**单源，绝不并存两份**）；
  绑定解析 = `sandbox/registry.mjs` `runnerByRef`（自 `agent/chat-tools.mjs` `resolveNode` 抽出——`docker`/`exec` 两工具同用）。
- **历史遗留（`sandbox_onboarding` 停机留史）**：run 行 → 主机行的凭据移交机制（`keep` 移交 ∥ `burn` 零化）已随任务式退场删除；存量行语义照旧可读（`sealed` ∥ `burned` ∥ `revoked` ∥ `moved`——`'moved'` = 「曾移交」字面；此后真伪以主机行 `credential_state` 为准——主机行撤销后 run 行不复写）；
  v18 回填（存量 `keep` ∧ 成功行按 id 序移交——同 runner 多行后者胜；未接收行新列 NULL/`'none'`）已落库为史——零改写。
- **exec（SSH）进 chat**（工具形/参数 = `agent/ADMIN-AGENT.md` §12）：绑定 = 主机表行；缺凭据 ⇒ 工具级错误（人话指向录入弹窗）；传输 ∥ 掩蔽 ∥ 审计三面 = 单源复用（`ssh.mjs` ∥ `maskSecrets` ∥ `chat_call`）。
  **sudo 口令口径**：命令含 `sudo -S` ⇒ 行 `sudo_cipher` 解出口令经 stdin 喂入（不含 ⇒ 不喂）（单源 = `thincoder-server/src/sandbox/ssh.mjs`：`sudo -S` 读取 stdin 的既有判定）。
- **合并路线（KD-SV-135——终局已达成）**：装机/主机运维 = 管理面 chat 内动作（`exec`/`docker`/`runners` + 主机表凭据——零新机制、零新端点）；**任务式（run）面退场执行**（用户裁「撤」——弹窗 ∥ 端点族 ∥ 服务件 ∥ 任务面工具 ∥ 单元测试档删净；`sandbox_onboarding` 表停机留史——§2）。
  `agent/ADMIN-AGENT.md` §13 R71⑥**撤回注**（不再对 run 改道——避免白做）。
- **自加项（逐条带理由——设计侧提议，非用户口径）**：

  | # | 项 | 来源 | 为什么 | 不做的代价 |
  |---|---|---|---|---|
  | ① | 凭据常驻 = 随行至撤销（无 TTL/无过期） | 设计自加 | 用户「主机表管凭据」的字面语义（可复用凭据）；撤销 = 显式动作（`DELETE` + 审计） | 每次 `exec` 都要重录（工具面不可用） |
  | ② | `credential_state` 第四态 `'moved'`（CHECK 重建） | 设计自加 | 如实显示（`keep` 成功 ⇒ 凭据在主机表；复用 `burned` 会骗读数——「已零化」实为仍在） | 读数骗人（用户以为凭据已销毁） |
  | ③ | v18 回填移交存量 `keep` 行 | 设计自加 | 单一权威（standing 凭据一处）；不回填 ⇒ `exec` 对已装机主机全不可用 | 存量 `keep` 凭据无消费面（`exec`/主机运维读不到） |
  | ④ | 私钥临时落盘 0600 ⇒ 用毕即删（`finally`） | 设计自加 | 沿任务面口径（`ssh.mjs` 落键形单源——chat 面逐调用建/删，零残留） | 私钥残留于数据目录（第二份凭据面） |

- **连接方式（TLS 档；用户裁「我其实很喜欢现在这种方式，靠安全组控制，使用简单方便，不过，我也想加上B，只是TLS证书认证，让用户可选。」——A 保缺省 + B 增为可选档）**：连接面 = **节点级二择**——明文（缺省——安全组控制照旧 ∥ 零行为变化）∥ **TLS 客户端证书**（用户可选——「想用时可以开」）；机制全文 = 本块（传输落点 = `sandbox/EXECUTION.md` §2.1）。
  - **形态 = 地址 scheme 单源**：`http://` = 明文 ∥ `https://` = TLS——**不设 mode 列**（列面零冗余；连接方式由 scheme 派生呈现）；写面二择只定**归一档**（裸 host ⇒ 按档补 scheme + 缺省端口 2375/2376）；显式 scheme 与档相抵 ⇒ 400（零静默推断）；不携档 = 明文（缺省零行为变化）。
  - **材料 = 三件（CA 证书 ∥ 客户端证书 ∥ 客户端私钥），用户自备**（不自建 PKI ∥ 不代生成；节点侧 dockerd 的 TLS 服务端配置在机——我方面只做客户端）；私钥 AES-256-GCM 落库（`thincoder-server/src/store/credential-crypto.mjs` 复用——沿 KD-SV-84）；
    **三件零回显**（响应/审计/日志零材料字段；编辑面只回「已设（时间）」∥「未设」态）+ **只进不出**（查看/导出无面——换材料 = 全列覆写，沿 `PUT …/credential` 先例）。
  - **不变量：`https` ⇔ 三件齐**（服务端双向校验——TLS 档缺件 ⇒ 400 ∥ 明文档携件 ⇒ 400；零半档）。
  - **写面两端点**（行文 = `gateway/API.md` §2.5）：① 添加节点（`POST …/runners` 体增 `connection`/`tls`——自检按档走；形非法 ⇒ 400 零外呼）② `PUT …/runners/:id/connection`（编辑/切换——**全列覆写**；**先自检后落库**——失败 ⇒ 库零变）；**关 TLS = 原子**（地址改回 `http` + 材料清零——同事务）。
  - **生效面 = 控制面全谱**（节点自检 ∥ 运行面读数 ∥ 容器/镜像/卷/终端族 ∥ 盒链 ∥ 管理面 chat 的 `docker` 工具）——一律经 `clientForRunner`（材料按行解密后注入传输；明文行零涉）。
  - **先例对齐**：主机凭据面（KD-SV-133/134——加密复用 `credential-crypto.mjs` ∥ 密列零回显 ∥ 全列覆写 ∥ 成事才审计）；**偏离** = 寻址 = 地址 scheme（不设独立 mode 列）。
  - **审计**：`runner_add` detail 增 `tls` 布尔 ∥ 连接变更 = 一枚 `runner_connection`（detail = kind + runnerId + address + tls 布尔——零秘密）；切换自检失败沿 `runner_selfcheck_failed`（detail 增 runnerId）。
  - **边界（TLS 档不做）**：材料轮换/续期机制 ∥ 材料查看/导出（只进不出）∥ 节点侧 TLS 服务端配置（在机）。

## 5. 工作区生命周期与节点绑定

- **绑定**：工作区 → 节点**绑定**（卷在节点本地盘——绑定即稳定）；多节点/集群化 = 用 Docker 自己的集群（§1）；无可用节点 ⇒ 控制台明示不可用（不降级）。
- **换机重建**：新盒 = 重克隆仓 + 恢复最近 WIP 快照（恢复链 = `sandbox/EXECUTION.md` §3）；无快照 ⇒ 控制台明示「未提交改动将丢」，卷在旧节点保留至人工确认。
- **未提交改动的保护（三层）**：
  1. **卷保留（恒在）**：拆盒（空闲/TTL）**永不删卷**——卷留节点本地盘；
  2. **WIP 快照**（缺省开——已裁 U5）：触发 = 周期（`checkpointEveryMinutes`，缺省 15 分钟）+ 拆前（跨机/换机；销毁不拍——确认门已明示）——server 侧定时器（§1）；取件 = Docker `archive`（全量存档）；存 server（`sandbox_checkpoints`——缺省每工作区保留最近 5 份）；恢复 = 新盒套用（机制全文 = `sandbox/EXECUTION.md` §3）；
  3. **销毁**：删卷 = 管理员显式确认（控制台示盒态与快照态——「明示风险 + 用户可选」）。
  - 快照形 = tar.gz 全量存档（`archive` 流式 ∥ 服务端 gzip 落盘；单份上限 = 工作区 `diskMb` 配额）；非 git 工作区同覆盖面（工作区卷内一切内容——包括 `.thincoder` 会话目录）。
- **卷**：主机路径 `<workspaceRoot>/<ws-id>`（绑定挂载——§2 ∥ KD-SV-162）；磁盘配额 = 项目配额优先 ∥ loopback 备（SSH——`sandbox/EXECUTION.md` §4）。
- **成员面接线（机制全文 = `agent/MEMBER-AGENT.md` §3.5）**：工作区生命周期动作对成员开（创建/启停/销毁——§8 成员面）；盒起停 ⇒ 成员面会话在线态随动（壳随容器起——起盒 ⇒ 连挂 `hello`；停盒 ⇒ 在途回合掉线收尾）；**会话真源在盒内**（核原生槽文件——题一裁定；盒卷内 `.thincoder` 随卷随快照 ⇒ 停盒/重启会话在场、换机随快照回（截至快照时点）、销毁随卷去——如实）。


## 7. 盒内凭据（每工作区）

- **签发**：工作区创建 ⇒ server 签发一枚**工作区 key**（`api_keys` 行——名 `sandbox:<workspace>`；复用 accounts key 面 `accounts/keys.mjs:85-93`；**不判 20 上限**——沿 CLI/登录先例 `keys.mjs:19`）；明文存 `sandbox_workspaces.key_plain`（§2）。
- **归属**：owner_member_id（工作区负责人）——模型用量/配额走**既有成员三级配额链**（零新配额机制）；记账按 key 归因（`usage.key_id` 存量列）⇒ 控制台按工作区可查。
- **吊销/轮换**：工作区销毁 ∥ 控制台「轮换」⇒ 吊销旧 key（`revokeKey`）+ 签发新 + **拆容器重建**（**卷保留**——新 key 于重建时注入 env；容器 env 运行期不可变 ⇒ 无「不重建即生效」路径）；重建前旧 key 已失效（401）。
- **盒内形态**：容器 env 注入——`OPENAI_BASE_URL=http://<server>:<port>/v1` ∥ `OPENAI_API_KEY=<workspace key>`（+ TC_* 别名随实施）；**盒内零服务器密钥**（真 provider key 绝不入盒——网关代持）。
- **网络路径**：盒 → server 网关地址:端口（模型调用生命线——直连；出站闸面已退场删）；server 其余面 = 会话门禁（盒内无会话）+ 登录防爆破门在（读法披露 = §10-D3）。

## 8. 控制台面

- **落点（已裁 U4）**：server webui 新管理页「沙盒」`#/admin/sandbox`；**非壳页**（卡多——沿看板页先例，不扩「钉表五页」）。
- 卡面（**四面**——必交面（用户令）：运行面 ∥ 工作区 ∥ 资源与 TTL ∥ 审计可查；③ 出站规则 ∥ ④ 待批队列两面已退场）：
  - **运行面**（落定——§3）：可用性门（无节点 ∥ 全离线 ⇒ unavailable + 原因；节点面恒可用）∥ 节点表（名 ∥ 地址 ∥ 在线态 ∥ 版本 ∥ 容器（运行/总） ∥ 操作：展开容器 ∥ 删除）∥
    写入口 = **添加节点**（名 + Docker API 地址——连通自检；失败逐句人话 + 审计行）∥ **删除节点**（有容器 ⇒ 二选一「保留 ∥ 连删」；有承载工作区 ⇒ 二次确认）∥ **容器区**（节点行展开：列表（名/镜像/状态）+ 创建（名/镜像/卷三件）+ 启动/停止/重启/删除 + 详情（挂载/端口/环境/命令/用量——弹窗）∥ 日志（弹窗）∥ 强杀（详情窗内危险钮）——§3（补齐）∥
    **终端**（容器行第七钮——真 pty 会话窗：门 = 运行中；窗内 = 终端面 + 状态行（连接中/已连接 `cols×rows`/已断开/退出码）+ 重连钮（新会话）；同容器窗单例；`webui/TERMINAL.md` ∥ §3 容器终端块））∥
    **卷区**（同展开——容器区之后：卷表（名 ∥ 创建时间 ∥ 删除）+ 删除确认窗（后果句——数据一并没；在用卷 ⇒ 拒删人话就地呈）；建容器卷字段 = 已有卷选单 + 「新建卷（手输）」——§3 卷族 ∥ `webui/SANDBOX.md` §2.1①）∥ **镜像区**（同展开：列表（名/大小/创建）+ 拉取（名[:标签]）+ 删除（确认窗——强制删除勾选）——§3）∥
    **本地镜像表过滤输入**（名/标签关键词；零新端点）∥
    **镜像源卡**（沙盒页新卡（全局面——非按节点）：源表（名 ∥ 地址 ∥ 面型提示）+「添加源」钮（弹窗——预选下拉 + 名/址两输入）+ 行「改/删」+ **目录浏览窗**（仓库列表 ∥ 标签列表——两处过滤输入；五分类读绪如实呈；Hub 源 ⇒ 改走「按名查标签」输入））∥
    **底座卡 + 私有仓凭据卡**（标签②「镜像与镜像源」：底座卡 = 说明行（缺省 = 标准镜像；自定义 ⇒ 派生） + 工作区表（工作区 ∥ 底座（「标准」∥ 引用） ∥ 操作：「设底座」弹窗（镜像引用输入 + 「恢复标准」）∥「构建」钮（derive——在飞态「构建中……（可能持续数分钟）」；未绑节点 ⇒ 禁用 + 一句人话））；
    凭据卡 = 注册表表（主机 ∥ 用户名 ∥ 更新时间 ∥ 操作：改/删）+「添加凭据」钮（弹窗：注册表主机 ∥ 用户名 ∥ 口令/令牌——**密文零回显**；源表式副作用）——机制 = §3 底座可换块；UI 定形 = `webui/SANDBOX.md` §2.1①）；
  - **工作区**（列表：名/负责人/绑定 runner/盒状态/快照/操作：启动/停止/销毁/轮换 key/快照恢复（快照列表读面）；**动作 = 直调链**（幂等语义 ∥ 「待人放」态明示 ∥ 销毁确认门携盒态/快照读数——机制 = `sandbox/EXECUTION.md` §3）；写入口 = **每工作区覆写**（资源 + TTL：`cpus`/`memMb`/`pids`/`diskMb`/空闲 TTL/墙钟 TTL——行内编辑；生效 = 下次建盒/重建））；
  - **资源与 TTL**（全局默认：limits（cpus/mem/pids） ∥ 磁盘配额默认 ∥ 空闲 TTL ∥ 墙钟 TTL ∥ 快照周期/保留数 ∥ 镜像名；读数：各节点磁盘余量 ∥ 盒资源占用）；
  - **审计可查**（`sandbox_rule` ∥ `sandbox_event` 过滤视图——数据面 = 审计页同源 + 本卡快捷入口）。
- **每配置项有界面写入口**（必交面判据——用户令）：`sandbox_settings` 逐键 ↔ 卡面对照——`cpus`/`memMb`/`pids`/`diskMb`/`idleTtlMinutes`/`wallclockTtlHours`/`checkpointEveryMinutes`/`checkpointKeep`/`image`/`tmpfsMb` ⇒ 资源与 TTL。
  **`memberWorkspaceLimit`（正整数——每成员工作区上限，缺省 3）⇒ 资源与 TTL（成员面行）**。
  **每工作区覆写**（资源 + TTL）⇒ 工作区行。**零配置项以「编辑配置文件」收场**（部署拓扑项不涉本设置面）。
  **v22 增两键：`maxBoxesPerRunner`（正整——单节点盒数上限，缺省 8；放置与防吃光）⇒ 资源与 TTL ∥ `workspaceRoot`（节点侧工作区根路径，缺省 `/var/lib/thincoder/workspaces`）⇒ 资源与 TTL（容器重建/停盒态需明示重启生效）。**
  **底座可换增补**：**底座绑定（每工作区）⇒ 底座卡（行级写入口——§3 底座可换块）∥ 私有仓凭据 ⇒ 凭据卡**（两卡均标签②；成员面零涉）。
- 判权：v1 = `requireAdmin`（会话）；#1216② 到位后换同点（§9）。
- 明示义务：无可用节点 ⇒ disabled + 原因；节点探活失败 ⇒ 红；工作区无保护（非 git/快照失败）⇒ 标。
- **成员面（本人自助——用户裁；需求 §5 沙盒块成员面行）**：成员自己的资源须有本人面——首个兑现 = **工作区读面**（`webui/SANDBOX.md` §2.2；信号 = `gateway/API.md` §2.7——恒本人过滤）：盒状态（运行 ∥ 已停 + 回收原因）∥ 快照数 ∥ **所属 runner**（行增 `runnerName`——未绑定 ⇒ `null`，端侧呈「未绑定」）。
  **成员会话面接线**：会话面（`#/me/chat`——`webui/CHAT.md` §2.2）以工作区为宿主；盒未运行/未连接 ⇒ 就地启动动作；停盒 ⇒ 在途回合掉线收尾（notice + `box_lost`）——机制 = `agent/MEMBER-AGENT.md` §3.4/§3.5。
  **三端（CLI ∥ VSC ∥ 桌面）今日无沙盒/工作区面**（三端文档零沙盒条目——不发明新面）。
  **成员写面**开：创建 ∥ 启动 ∥ 停止 ∥ 销毁（确认门）+ 拉仓——判权 = 本人 + 上限（`memberWorkspaceLimit` 缺省 3）；**不另开管理面**（动作承载 = 对话页就地 + 工作区页动作列 + 会话内 agent 工具）；轮换/快照恢复仍在管理面。机制 = `agent/MEMBER-AGENT.md` §3.7。
  **成员 git 凭据面（题三补）**：落点 = **我的·账户页**（`webui/ME.md` §3——不进沙盒页）；机制 = `agent/MEMBER-AGENT.md` §3.6/KD-SV-204。

## 9. 端点与判权（表在 API.md——单源）

- 控制台面 = `/api/admin/sandbox/*`（§8 四面对应）；成员面 = `/api/me/sandbox/*`（§8 成员面）。
- 表 = `gateway/API.md` §2.5（控制台面）∥ §2.7（成员面）；错误形 = §3 全码 + **一码新增** `sandbox_unavailable`（503——无可用节点）；节点/容器面（§3）：引擎失败 ⇒ 502 `upstream_error`（消息 = 逐句人话 + 引擎原文）∥ 容器/节点不存在 ⇒ 404 ∥ 形非法/重名/镜像缺/名占用 ⇒ 400（零新码）；判权 = `requireAdmin`（`thincoder-server/src/accounts/session.mjs`）∥ 成员面 = 会话（本人过滤——§8 成员面）。
  镜像源面 = `gateway/API.md` §2.5 镜像源七行——判权 `requireAdmin`；零新码（400/404）；目录/标签读数 = 自含状态形（`{ ok, error: { kind, message } }`——沿 `/api/admin/proxy/test` 先例）；零涉沙盒可用性门（源面与节点无关）；
  一键拉取 = 纯前端复用镜像族拉取端点（`/runners/:id/images/pull`——§3）——零新端点；拉取认源 = 纯前端（拉取窗选源组装引用——组装在窗内；拉取仍走既有端点）——零新端点。

- 卷族 = 两端点（列 ∥ 删——`GET`/`DELETE …/runners/:id/volumes[/:name]`）——判权 `requireAdmin`；零新码（400 名形 ∥ 404 无此卷 ∥ 400 在用卷人话 + 处置句 ∥ 502 不可达）；列表零审计 ∥ 删卷审计 `volume_delete`（键集 = `accounts/ACCOUNTS.md` §2.1）；名形校验前置（400 零外呼）。

- 容器终端（本块）：**升级端点一枚**——`GET /api/admin/sandbox/runners/:id/containers/:containerId/terminal`（`Upgrade: websocket`——**非普通路由**：升级路分派；101 前判权 `requireAdmin` + 同源 `Origin`）；判权失败 ⇒ 401/403（无 101，响应沿错误形）∥ 节点不存在 ⇒ 404；
  **in-band 错误码四条**（`container_not_running` ∥ `engine_unreachable` ∥ `exec_failed` ∥ `session_closed`——文案归前端）；行文 = `gateway/API.md` §2.5 末行；帧协议/心跳/收口语义 = §3 容器终端块（单源）。

- 执行面（本块）：工作区动作行语义 = **直调链**（响应 = 动作读数；旧处理语义退场）；**增快照列表行**（`GET /api/admin/sandbox/workspaces/:id/checkpoints`——读面，列 id/createdAt/size/note；恢复动作选参用）；建工作区入参去 `requiredLabels`（列面收正随拍）；表 = `gateway/API.md` §2.5（单源）；零新错误码（503 `sandbox_unavailable` 既有——写门实时化后仍为唯一新码）。

- 底座可换（增补——§3 块；表 = `gateway/API.md` §2.5 单源）：**增五端点**——`POST …/workspaces/:id/derive`（派生构建——同步；响应 `{ ok, base, tag, cached, pulled, ms }`）∥ `GET/POST/PATCH/DELETE …/registry-credentials[/:id]`（私有仓凭据四端点——响应零秘密）；
  **扩两处**——工作区列表行增 `baseImage` ∥ `PATCH …/workspaces/:id` 体增 `baseImage` 键（`null` = 恢复标准）；拉取端点（既有 `POST …/runners/:id/images/pull`）**命中凭据 ⇒ 携 `X-Registry-Auth`**（未命中 ⇒ 匿名——现状零改）；零新错误码（400/404/502 沿用）。

- 连接面 = 连接方式编辑端点一枚（`PUT …/runners/:id/connection`——全列覆写）+ 添加节点体扩（`connection`/`tls` 键）；判权 `requireAdmin`；零新码（形非法/相抵 ⇒ 400 ∥ 自检失败 ⇒ 502 库零变 ∥ 不存在 ⇒ 404）；审计 = `runner_connection`（键集 = `accounts/ACCOUNTS.md` §2.1）；机制全文 = §3 连接方式块 ∥ `sandbox/EXECUTION.md` §2.1。

## 10. 已裁决策与读法披露

**已裁（用户「都按建议」——逐条 = 原设计建议）：**

| # | 已裁项 | 裁定 | 影响 |
|---|---|---|---|
| U1 | runner 容器运行时 | **Docker**（runner = 远程 Docker API 节点；控制面直调 Docker API——§1） | 节点接入 + 自检读数 |
| U4 | 控制台落点 | **server webui 新管理页**（一页一职责——沙盒面自持） | webui 页数链 + 实施面 |
| U5 | WIP 快照默认 | **周期 15 分钟 + 拆前**（最小保护） | 节点负载/带宽 |

**读法披露（用户未异议——不阻塞·按设计实施）：**

- **D1（tmpfs 例外）**：需求块「唯一可写挂载 = 工作区卷」——设计与工具链刚需并置：`/tmp` = tmpfs（内存背书 ∥ 容积封顶 ∥ 非持久）为唯一例外（node/npm 必需）；无持久宿主面写入（盒参数集全文 = §14 KD-SV-73）。
- **D2（key_plain 明文）**：工作区 key 明文落控制面库（§2——盒重建须再注入；先例 KD-SV-19）；键面 = 工作区作用域可吊销——泄露面收于该工作区。
- **D3（盒可达 server 整端口）**：盒 → server 网关地址:端口 = 直连（盒可达该端口全部路径）；控制台/管理面靠会话门禁（盒内无会话）；如需收窄到 /v1 路径级 ⇒ 翻案点（另设专用监听）。
- **D4（复用 key 的残余面）**：工作区 key 作为 `api_keys` 行天然可打 `/api/client/*`（logout/me——自身读面）。

## 11. 验收判据（需求块 → 设计判据）

| 需求（`docs/server/requirements/PROJECT.md` §5 沙盒块） | 设计级判据 | 载体 |
|---|---|---|
| 容器唯一 ∥ 无退路 | 无可用节点 ⇒ status = unavailable + 控制台明示 | 单元测试档 + 收口轮 |
| 威胁模型五面 | 红队探针用例集（判据表随执行面重建——需求 AC-36 ⑦） | 收口轮 |
| 每工作区一盒 ∥ read-only ∥ 唯一可写挂载 ∥ 盒内零密钥 | §14 KD-SV-73 盒参数集 + §7 凭据面 | 单元测试档 + 收口轮 |
| 资源上限 ∥ 墙钟 TTL ∥ 空闲拆 ∥ 每工作区覆写 | TTL 单元测试 + 覆写单元测试（PATCH ⇒ 建盒载荷逐值——N45） | 单元测试档 + 收口轮 |
| 非目标（0day ∥ 侧信道） | §1 明写不做 | —— |
| 验收 = 红队探针用例集 + 正常开发链 | 探针用例集（执行面重建）+ 正常开发链用例 | 收口轮 |
| 落地序（先于 #1215）∥ 与 CI 共用执行面 | §14 KD-SV-72 + §15 边界（CI 实现不在本范围） | 设计在档 |
| 裁定（两平面分离 ∥ 无节点不可用 ∥ CI 共用） | §1 ∥ §14 KD-SV-63/71/72 | 设计在档 |
| 管理与配置界面 = 必交面（用户令——四面 + 每项配置有界面写入口；出站规则/待批队列两面已退场） | §8 四面在册（含运行面节点接入：添加/删除 ∥ 连通自检 ∥ 失败审计行）∥ 每配置项有 UI 写入口（`sandbox_settings` 逐键对照表 + 每工作区覆写——§8）∥ 控制台机检口径 = `webui/WEBUI.md` §6 沙盒行（单源——含 `#/admin/sandbox` 路由 ∥ nav 管理项 ∥ 档目链 ∥ i18n `admin.sandbox.*` 两表同步；容器面补齐/镜像族行 = 随正） | 单元测试档 + 收口轮（浏览器实走） |
| 成员面 = 本人自助（用户令——AC-36 ⑧） | §8 成员面（`#/me/sandbox` 本人工作区读）∥ 信号 = `gateway/API.md` §2.7 | 单元测试档 + 收口轮（浏览器实走） |
| **最小切片**（用户令 四件） | ① 添加节点（自检读数落库逐值 ∥ 失败 ⇒ 502 + 零落库 + 审计行）② 建容器（引擎请求体逐值 ∥ 列表可见）③ 启/停（幂等：304 ⇒ 成功）④ 删节点（保留 ∥ 连删二选一 ∥ 连删失败 ⇒ 行保留）；判据全文 = §3 ∥ §12（N40 ∥ N46–N48 ∥ B41–B43 ∥ E34–E36）；**真机跑**（收口轮——`10.0.0.6`，Docker 29.1.3 ∥ 盒镜像在机）：添节点 ⇒ 在列（online + 版本）；建容器 ⇒ `docker ps -a` 见 `Created` ⇒ 启动 ⇒ `docker ps` 见 `Up` ⇒ 停止 ⇒ `Exited` ⇒ 删 ⇒ 无；删节点「保留」⇒ 容器留机 ∥「连删」⇒ 容器净 + 节点消 | 单元测试档 + 收口轮（真机） |
| **容器面补齐 + 镜像族**（用户令 两族同区） | 容器五件：详情读数逐值（挂载/端口/环境/命令）∥ 日志（tail 有界 + 非 TTY 帧解复用——零帧头残渣）∥ 重启/强杀（引擎调用逐条 + 审计两 kind）∥ 用量（cpuPercent/内存/磁盘逐值；一次采样口径）；镜像三件：列表逐值 ∥ 拉取（`fromImage`/`tag` 逐值 ∥ 缺省 `latest` ∥ 失败两形 ⇒ 400）∥ 删除（`force` 0/1 逐值 ∥ 409 ⇒ 400 人话）；判据全文 = §3（块）∥ §12（N53–N56 ∥ B47–B51 ∥ E39–E42）∥ `gateway/API.md` §2.5 新八行 ∥ `webui/SANDBOX.md` §2.1① ∥ §6 沙盒行（随正）；审计 kind 面 = `accounts/ACCOUNTS.md` §2.1（型面计数零增）；**真机**（收口轮——10.0.0.6：真容器详/日志/重启/强杀/用量 ∥ 真镜像列/删；拉取视源可达性如实报） | 单元测试档 + 收口轮（真机） |
| **镜像源族**（用户令 四点 ①②③ + 预选） | 源清单 CRUD（增/删/改/列——形校验拒非法 ∥ 名/址各自唯一 ∥ 每动作一审计行 ∥ 预选七条在册且表单只回填名/址）∥ 源目录可达（v2 目录/标签逐值 ∥ Hub 面标签 + 裸名补 `library/` ∥ 匿名 Bearer 逐跳命中（挑战解析 → 换 token → 复读） ∥ 读绪五分类如实呈（`timeout`/`unreachable`/`auth_required`/`unsupported`/`bad_response`））∥ 过滤生效（本地镜像表 ∥ 仓库列表 ∥ 标签列表——无匹配 ⇒ 空态句）；判据全文 = §3（块）∥ §12（N57–N59 ∥ B52–B56 ∥ E43–E45）∥ `gateway/API.md` §2.5 镜像源七行 ∥ `webui/SANDBOX.md` §2.1① + §6 沙盒行（随正） ∥ `store/STORE.md` §2 v15 段/§3 v15；**收口轮** = 浏览器实走（增/改/删源 + 源目录读取（自建 registry ∥ 公网源按可达性如实）+ 两处过滤） | 单元测试档 + 收口轮（浏览器实走） |
| **一键拉取**（用户裁；AC-38 ④） | 目录浏览窗仓库/标签行「拉取」钮（在线节点在场 ⇒ 可用；无节点 ∥ 全离线 ⇒ 禁用 + 一句人话——复用 `admin.sandbox.noNodes`/`admin.sandbox.allOffline`；概览读败 ⇒ 禁用 + `mapError`）⇒ 节点选单（在线节点行）⇒ 既有拉取窗预填逐值（`<主机>[:<端口>]/<仓库>:<标签>`——去 scheme ∥ Hub 主机统一 `docker.io` ∥ 仓库行 `:latest`；预填可改）+「目标节点：{name}」行 ⇒ 确认走既有拉取径（零新端点 ∥ 拉取行为零改）；判据全文 = §3 一键拉取块 ∥ §12（N60 ∥ B57/B58 ∥ E46）∥ §14 KD-SV-99 ∥ `webui/SANDBOX.md` §2.1① + §6 一键拉取行；**收口轮** = 浏览器实走（有在线节点：浏览 ⇒ 拉取 ⇒ 选单 ⇒ 预填核对 ⇒ 确认真拉 ∥ 无节点 ∥ 全离线：禁用 + 一句人话） | 单元测试档 + 收口轮（浏览器实走） |
| **拉取认源**（用户裁「A」；AC-38 ⑤） | 拉取窗「经由源」选单在册（源清单读时读——零新端点）∥ 选定 ⇒ 引用按源组装逐值（去 scheme ∥ 含端口逐值 ∥ Hub 主机统一 `docker.io` + 裸名补 `library/` ∥ 已带主机剥换（引擎同口径判据）∥ 无标签补 `:latest` 显式 ∥ `@` 透传 ∥ 空输入不动作）∥ 组装 = 输入框可见改写（所见即所拉）+ 可再改；提交 = 输入框当刻文本（组装后可见值——拉取端点形零改 ∥ 拉取径单源）∥ 一键拉取径（预填 + 源）⇒ 选单认源态 ∥ 组装施加点 = 选单变更 ∥ 选定态输入完成（幂等） ∥ 目标节点行恒显（P1——N61 用例） ∥ 手改不自动回落 ∥ 记忆预选（P2——B61 用例；预选态非自动改写；记忆源失效 ⇒ 不选态回落） ∥ 无源 ∥ 读败 ⇒ 不选态 + 人话——拉取不阻断；判据全文 = §3 拉取认源块 ∥ §12（N61 ∥ B59–B62 ∥ E47）∥ §14 KD-SV-100 ∥ `webui/SANDBOX.md` §2.1① + §6 拉取认源行；**收口轮** = 整条用户旅程真机（ECS `.6`：加源（`docker.1ms.run`）⇒ 经源拉 `ubuntu:24.04` ⇒ 镜像落地 ⇒ 建容器跑——AC-38 ⑤ 验收句） | 单元测试档 + 收口轮（浏览器实走 + 真机） |

| **主机表 + 凭据托管 + `exec` 进 chat**（用户三裁） | 主机表 = `sandbox_runners` 扩展（七列 + 一次回填；单一权威——§3 主机凭据块）∥ 凭据写面两件（`PUT`/`DELETE …/credential`——形校验 400 ∥ 响应零秘密 ∥ 审计两 kind）∥ `keep` 成功 ⇒ 移交（run 行零化 + `'moved'`）∥ 迁移回填（id 序、后者胜）∥ 凭据入口 = 弹窗两挂载（文本非通道）∥ `exec` 进 chat（绑定主机行 ∥ `ssh.mjs`/加解密/审计三单源 ∥ 掩蔽含行凭据值）∥ 合并路线在册（§3——三步）；判据全文 = §3 主机凭据块 ∥ §12（N79–N82 ∥ B76–B78 ∥ E59/E60）∥ §14 KD-SV-133/134/135 ∥ `agent/ADMIN-AGENT.md` §7/§12 ∥ `gateway/API.md` §2.5（已落） ∥ `webui/SANDBOX.md` §2.1① ∥ `webui/CHAT.md` §2.1；**收口轮** = 浏览器实走（沙盒页录凭据 ⇒ 对话页录凭据 ⇒ chat 内 `exec` 一条 ⇒ 撤销 ⇒ 再 `exec` 拒）+ 真机（ECS `.6`：录真凭据 ⇒ `exec` 读数） | 单元测试档 + 收口轮（浏览器实走 + 真机） |
| **底座可换**（用户令；功能点 52 ∥ AC-52——拟入册） | ① 底座指定形三腿（引用形校验 400 零外呼 ∥ 存在性（缺 ⇒ 拉取）∥ 前提（乙：Node 随包带——构建期校验层））∥ ② 绑定与生效（`base_image` 列 ∥ PATCH `baseImage` 键 ∥ 生效 = 下次建盒/重建）∥ ③ 派生 tag 内容寻址（缓存命中零构建 ∥ Id 变 ⇒ 重建）∥ ④ 建盒链 ④ 镜像就位（自定义腿在场 ∥ 缺省腿零新增调用——零行为变化腿）∥ ⑤ 私有仓凭据（CRUD ∥ 加密零回显 ∥ 拉取注入逐值；未命中 ⇒ 匿名）∥ ⑥ 控制台两卡（底座 ∥ 凭据——弹窗 ∥ 在飞态 ∥ i18n）∥ ⑦ 审计四 kind + `image_pull` `auth` 键；判据全文 = `sandbox/EXECUTION.md` §8 底座可换块 ∥ §13（N71/N72 ∥ B74/B75 ∥ E56/E57）∥ §15 KD-SV-184…191 ∥ 本档 §3 块 ∥ `gateway/API.md` §2.5 ∥ `webui/SANDBOX.md` §2.1①；**真机**（收口轮——选定底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起；前置 = 标准镜像件位契约就绪） | 单元测试档 + 收口轮（浏览器实走 + 真机） |
| **卷族**（用户令；AC-40） | ① 卷列表（`GET …/volumes` 逐值——名/驱动/创建时间；读败 ⇒ 人话；零审计）∥ ② 建容器卷字段 = 选单（节点已有卷 + 「新建卷（手输）」——选定回填可再改；读败/空 ⇒ 手输照常；提交 = 输入框当刻文本 ⇒ `Binds` 逐值零改 ∥ **零隐式建卷**——首用即建归引擎）∥ ③ 删卷（确认窗 + 后果句——非原生 `confirm`；引擎 404 ⇒ 404 ∥ **409 在用 ⇒ 400 人话 + 处置句**（零新码）∥ 204 ⇒ 200 + 审计 `volume_delete`）∥ ④ 带数据重建（加挂）= 不做（边界句——用户裁）；判据全文 = §3 卷族块 ∥ §12（N62/N63 ∥ B63–B65 ∥ E48/E49）∥ §14 KD-SV-104/105 ∥ `gateway/API.md` §2.5 两行 ∥ `webui/SANDBOX.md` §2.1①；**真机**（收口轮——ECS `.6`：在用卷拒删如实呈（`test-data` 类场景）∥ 建容器选卷/手输两用例 ∥ 卷表列/删全链） | 单元测试档 + 收口轮（浏览器实走 + 真机） |
| **容器终端 v1**（用户三句；功能点 51 ∥ AC-51——已入册） | ① 入口/门（容器行第七钮「终端」——门 = 运行中；非运行禁用）∥ ② 会话链三步逐值（读容器（运行态 ∥ locale 判据）⇒ 建 exec（`Attach*` 三旗 ∥ `Tty` ∥ `Env` 两键 ∥ `Cmd` 常量）⇒ 升级 start（`101` + 裸双工））∥ ③ 帧协议（二进制 = pty 字节双向 ∥ 文本 = JSON 控制）∥ ④ 心跳（30s ping / 60s 判死——两向）∥ ⑤ 收口三件 + 幂等（停机全收口 `server_stop`）∥ ⑥ 判权/同源门先于 101 + in-band 四码 + 协议错 1002 ∥ ⑦ 审计两 kind（pty 内容零留痕）∥ ⑧ 尺寸（就绪前挂起 ∥ 就绪后施加 ∥ 越界忽略）∥ ⑨ 前端核（`webui/TERMINAL.md` §2/§4——`vim`/`top`/中文达效）；判据全文 = §3 容器终端块 ∥ §12（N83–N85 ∥ B79–B81 ∥ E61–E63）∥ §14 KD-SV-175…180；**真机**（收口轮——ECS `.6`：非运行门 + 直连拒 + 关窗后零残留） | 单元测试档 + 收口轮（浏览器实走 + 真机） |
| **连接面 TLS 档**（用户裁「让用户可选」；功能点 53 ∥ AC-53——拟入册） | ① 形态（地址 scheme 单源：`http`=明文缺省 ∥ `https`=TLS；裸 host 按档补 scheme/端口 2375·2376；显式相抵 ⇒ 400）∥ ② 材料（三件自备 ∥ 私钥加密落库 ∥ **零回显/零回填**（响应键面扫描）∥ 不变量 `https` ⇔ 三件齐）∥ ③ 传输（`node:https` 适配件——`ca`/`cert`/`key` 逐值入选项；`fetchImpl` 缝内插；**明文路径零行为变化**——归一/自检/落库/传输逐值同现状）∥ ④ 写面两端点（添加体扩 ∥ `PUT …/connection` 全列覆写——**先自检后落库，失败 ⇒ 库零变**；关 TLS = 原子）∥ ⑤ 生效面全谱（自检/读数/容器/镜像/卷/终端/盒链/chat `docker`）∥ ⑥ 审计（`runner_add` + `tls` 键 ∥ `runner_connection` 一枚——零秘密）；判据全文 = §3 连接方式块 ∥ `sandbox/EXECUTION.md` §2.1/§13（N73 ∥ B76）∥ §15 KD-SV-192…195 ∥ `gateway/API.md` §2.5 ∥ `webui/SANDBOX.md` §2.1①/§4；**真机**（收口轮——ECS `.6`：节点侧 dockerd TLS 配置（`docs/TEST-ENV-ECS.md` 随正件）⇒ 自签材料 ⇒ 切档 ⇒ 自检过 ⇒ 全谱可用 ∥ 切回明文 ⇒ 材料清零） | 单元测试档 + 收口轮（浏览器实走 + 真机） |
| **壳更新面**（功能点 57 ∥ AC-57——拟入册） | ① 工件（`prepack` ⇒ `public/box-shell/`：manifest + `<版本>.tar`；覆盖集 = 源树逐件）∥ ② 引导序（自版本 ⇒ manifest ⇒ 取件/校验/换执行；回退 = 缓存 ⇒ 内建）∥ ③ 读音（承接进程恰一行）；④ 槽复验 + 崩后失效；判据全文 = §3 块 ∥ `sandbox/EXECUTION.md` §8 块 ∥ §13（N89 ∥ B85–B88 ∥ E65）；**真机**（发布 ⇒ 再启跟版 ∥ 断网回退） | 单元测试档 + 收口轮（真机） |

**红队探针套件（余腿 P1 ∥ P5–P10 ∥ P13 ∥ P14）——判据表（P2–P4 ∥ P11/P12 五腿已退场删，编号留空档）**

- **现状**：判据表随执行面重定删除；复核后重建（判据在册）；**探针执行器 = `thincoder-server/deploy/sandbox-probe.mjs`（已落）**（机制全文 = `sandbox/EXECUTION.md` §10）。
- **跑法**：真机 `docs/TEST-ENV-ECS.md`（server `.5` ∥ runner `.6`）；全过 ⇒ EXIT 0；有 FAIL ⇒ EXIT 1；**SKIP 单列**（无机/无前置 ⇒ 如实 skip，不假报）。
- **判据表**（判据 = 复核后口径）：

| # | 判据（复核后） |
|---|---|
| P1 | **宿主真实账号**（宿主 `/etc/passwd` 中 **UID ∈ [1000, 65533]**——人类用户窗）零命中盒内 `/etc/passwd`；**不判面 = 窗外的标准系统账号**（UID < 1000 ∥ `nobody` 类 ≥ 65534；显式标准账号集兜底） |
| P5 | fork 炸弹 ⇒ 被杀 |
| P6 | 根只读（写 `/` ⇒ 拒） |
| P7 | 填盘 ⇒ ENOSPC |
| P8 | **注入面正向在场**（`OPENAI_BASE_URL` = 网关 ∥ `OPENAI_API_KEY` = `sk-tc-…` 工作区 key 形态）+ **秘密零命中**（真 provider key 形态扫描 ∥ 未注入的敏感键名 `*_KEY`∥`*_TOKEN`∥`*_SECRET`∥`*_PASSWORD` 零命中）；**基础镜像固有 env 不判**（`NODE_VERSION` ∥ `YARN_VERSION` ∥ `PATH` ∥ `HOSTNAME`…） |
| P9 | 跨盒：他盒卷路径 ⇒ ENOENT ∥ 他盒容器 IP ⇒ 不可达 |
| P10 | 正常开发链（装依赖 ∥ 拉仓 ∥ 跑测试）通过 |
| P13 | 吊销 ⇒ 旧 key 即断（401）∥ 新 key 可用 |
| P14 | 服务端读数面（无可用节点 ⇒ 503 `sandbox_unavailable` + 控制台明示） |

- **口径纪律**：判据**不判基础镜像自带项**（P1/P8 收窄的共性——镜像自身形态不属盒的隔离能力）；秘密面走**结构形**（形态扫描 + 注入面正向断言——真值不下行，沿 R25/P8 结构判据先例）。
- **闭环边界（明写——防收口误记）**：#1248（P2/P3）随出站闸退场关闭（腿已删，复证面随消）；#1249（P1/P8 重跑）闭环 = 执行面（余腿——`sandbox/EXECUTION.md` §10）；控制面腿（求值/带入）同批退场。

## 12. 用例（本域）

| # | 类 | 面 | 输入 | 预期输出 |
|---|---|---|---|---|
| N40 | 正常 | 控制面 | 添加节点：名 + Docker API 地址（假 Docker `GET v<ver>/version` 在案）⇒ 连通自检 | `sandbox_runners` 行（name/address/status=active；`runtime_json` = 自检读数逐值 ∥ 协商版本在场）；运行面在列（online=true ∥ 版本）；审计 `sandbox_event`（kind=`runner_add`） |
| N41 | 正常 | 控制面 | 建工作区（负责人）⇒ 建盒 | key 签发（`api_keys` 行名 `sandbox:<ws>`）+ 绑定节点 + 建盒/启动（控制面直调 Docker API——§1） |
| N45 | 正常 | 控制面 | 建工作区携 `limits`（cpus/memMb）⇒ PATCH 覆写 `cpus` ⇒ 触发重建 | 行 `limits_json` 回读逐值；create/重建 payload 逐值 = 覆写 ∪ 全局默认（未覆写键）；运行中盒零触（仅重建生效） |
| B35 | 边界 | 控制面 | 无可用节点 | 沙盒面 disabled + 原因文本；写动作读数 503 `sandbox_unavailable`（不降级） |
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
| N57 | 正常 | 控制面 | 镜像源增/改/删/列 + 预选（本面零外呼） | 行落库逐值（`address` = 归一形——缺 scheme 补 `https://`）；`kind` 派生逐值（Hub 四别名 ⇒ `hub` ∥ Hub 镜像两主机 ⇒ `hub-mirror` ∥ 余 ⇒ `v2`——走查轮甲）；审计三行（detail 键集 = `accounts/ACCOUNTS.md` §2.1）；预选端点回七条（名/址两字段） |
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
| N83 | 正常 | 控制台 | 终端会话全链（假 Docker 升级件 + 真库）：升级握手 ⇒ 读容器 ⇒ 建 exec ⇒ 升级 start ⇒ 键入 ⇒ 引擎回显 | 握手响应 `Sec-WebSocket-Accept` 逐字 ∥ 建 exec 体逐值（`AttachStdin/AttachStdout/AttachStderr` = true ∥ `Tty` = true ∥ `Env` = `TERM=xterm-256color` +（容器无 locale 时）`LANG=C.UTF-8` ∥ `Cmd` = 常量三件）∥ start 体 = `{ Detach: false, Tty: true }` ∥ 上行二进制帧 ⇒ 引擎侧收到同字节 ∥ 引擎字节 ⇒ 下行二进制帧同字节 ∥ 首帧 `resize` 就绪后一次发出（`h`/`w` 逐值）∥ 引擎流结束 ⇒ 下行 `{"t":"exit","code":<inspect ExitCode>}` ⇒ WS close 1000 ∥ 审计两行（`terminal_open` 键集五 ∥ `terminal_close` 键集五、`reason='exec_exit'`、`durationMs` 在场） |
| N84 | 正常 | 控制台 | 就绪协作：`ready` 帧（`cols`/`rows` = 当刻施加值）∥ 客户端 `{"t":"ping"}` ⇒ `{"t":"pong"}` ∥ 客户端 `resize` 变更 ⇒ 引擎 `resize?h&w` 逐值再发 | `ready` 在首帧 resize 之后（挂起施加）∥ `pong` 即时 ∥ 二次 resize 逐值（`h` = rows ∥ `w` = cols——引擎参数序在案） |
| N85 | 正常 | 控制台 | 会话表与停机：两会话并存（同容器）⇒ 服务端停机 | 两会话各自独立 execId/审计对；停机 ⇒ 两会话全收口（`reason='server_stop'`）+ 会话表清空（零悬挂） |
| B79 | 边界 | 控制台 | 非运行容器：直连升级（前端门被绕过）∥ 就绪前 resize ∥ resize 非法（0 ∥ 字符串 ∥ cols 999） | in-band `{"t":"error","code":"container_not_running"}`（不开 exec——引擎零 exec 调用）⇒ 收口；未就绪 resize ⇒ 挂起（零引擎调用）∥ 非法 ⇒ 忽略（零引擎调用 ∥ 会话不受影响） |
| B80 | 边界 | 控制台 | 心跳两径：① 服务端 ping 后客户端不回 pong（假件——60s 推进时钟） ② 客户端 60s 无下行 | ① 判死 ⇒ 收口三件逐呼（`\x04` 写入 ∥ Docker 连接 destroy ∥ WS close）+ 审计 `terminal_close`（`reason='client_close'`——心跳判死归此值）∥ ② 客户端侧回调 `onClose("stale")`（本地态「已断开」+ 重连钮）——零服务端假设 |
| B81 | 边界 | 控制台 | 收口幂等：客户端 close 与引擎流结束几乎同时到达 ∥ 建链中途客户端断（start 应答前） | 收口一次（零第二行审计 ∥ 零第二次 `\x04`）∥ 断后 start 应答到达 ⇒ 立即收口（会话表零悬挂 ∥ exec 不残留） |
| E61 | 错误 | 控制台 | 引擎不可达（连接拒/超时）∥ 建 exec 409（窗口期容器被停）∥ exec 非 2xx | in-band `engine_unreachable` ∥ `container_not_running` ∥ `exec_failed`（携引擎原文 `detail`）；各自审计 `terminal_close`（`reason='error'`）+ 表清空 |
| E62 | 错误 | 控制台 | 升级请求：无 cookie ∥ `user` 会话 ∥ 异源 `Origin` ∥ 未知升级路径 ∥ 节点不存在 | 401 ∥ 403 ∥ 403 ∥ 404（socket 保持 HTTP 语义后断开）∥ 404——**全在 101 之前**（零 `Sec-WebSocket-Accept`） |
| E63 | 错误 | 控制台 | WS 协议错（假客户端）：未掩码帧 ∥ 非法 opcode ∥ 帧超 1 MiB ∥ 文本帧非 UTF-8 | 收口（close 1002）+ 审计 `terminal_close`（`reason='error'`）+ 会话表清空；服务端不崩（畸形流零残留） |

**执行面用例 = `sandbox/EXECUTION.md` §13**（N65/N66/N69/N70 ∥ B67–B70 ∥ E50–E55——本档不复制；用例链引用：B39 ⇒ N69 ∥ E33 ⇒ B67/P7）。

## 13. 本域文件与行数预算（控制面）

| 档 | 行数 | 职责 |
|---|---|---|
| `thincoder-server/src/sandbox/routes.mjs` | **304/305** | 余面端点（§8/§9） |
| `thincoder-server/src/sandbox/registry.mjs` | **419/420** | 登记/读数 ∥ 可用性门 ∥ 放置 |
| `thincoder-server/src/sandbox/hosts.mjs`（已落） | **134/135**（凭据写/撤销（形校验 + 加密 + 审计两 kind）∥ 主机 SSH 视图 ∥ `execOnHost`（解密 + `ssh.mjs` 执行 + 临时私钥清理——chat `exec` 工具与主机运维共用）；假件注入 = 供测试用） | 主机凭据面（§3 主机凭据块） |
| `thincoder-server/src/sandbox/docker.mjs` | **425/426** | Docker API 客户端（§3） |
| `thincoder-server/src/sandbox/container-routes.mjs` | **324/325** | 容器面路由（§3 家族——拆分档） |
| `thincoder-server/src/sandbox/image-routes.mjs`（已落盘） | **144/145**（拉取径零触——拉取径单源——§3 一键拉取块） | 镜像族路由（§3） |
| `thincoder-server/src/sandbox/volume-routes.mjs` | **103/104** | 卷族路由（§3——按族拆档，沿容器/镜像族之例） |
| `thincoder-server/src/sandbox/image-sources.mjs` | **140/141** | 镜像源清单模型（§3） |
| `thincoder-server/src/sandbox/registry-client.mjs`（已落盘） | **225**（v2 `_catalog`/`tags/list` ∥ Hub 公共 API ∥ 匿名 Bearer 挑战 ∥ 有界/`Link` 截断 ∥ 五分类错误映射；`fetchImpl` 注入 = 供测试用） | 远端源客户端（§3） |
| `thincoder-server/src/sandbox/image-source-routes.mjs`（已落盘） | **150**（七端点：列/预选/增/改/删/目录/标签 ∥ 校验与错误映射 ∥ 头注） | 镜像源端点（§9） |
| `thincoder-server/src/sandbox/ssh.mjs`（已落） | **226/227**（SSH 传输：spawn openssh（key `-i` ∥ `sshpass -e`） ∥ keyfile/known_hosts 落数据目录 ∥ 指纹 TOFU ∥ 超时/输出截断；`execImpl` 注入 = 供测试用） | 主机执行传输（§3） |
| `thincoder-server/src/sandbox/credentials.mjs`（已落） | **31** | 工作区 key（§7） |
| `thincoder-server/src/store/db.mjs` | **36/37**（迁移段已外拆 `migrations.mjs`） | 开库 ∥ PRAGMA ∥ 迁移/版本引用（单源 = `migrations.mjs`——§2） |
| `thincoder-server/src/accounts/audit.mjs` | **133/134**（零新 kind —— CHECK 零动） | 十七型（§2） |
| `thincoder-server/src/gateway/errors.mjs`（已落盘） | **66/67**（零新码） | `sandbox_unavailable`（§9） |
| `thincoder-server/src/sandbox/docker-exec.mjs`（已落） | **192/193**（Docker exec 升级传输：建 exec ∥ 升级 start（`Connection: Upgrade` + `Upgrade: tcp`——`node:http` 劫持；**归一地址缺端口明拒**——TLS 腿 = 同函数另一传输，不按 URL scheme 判传输）∥ resize ∥ inspect ∥ 收口（`\x04` + destroy）；超时档同族（读类 3s ∥ 动作类 15s）） | 容器终端会话链（§3 容器终端块） |
| `thincoder-server/src/sandbox/terminal-routes.mjs`（已落） | **362/363**（升级路一枚：路径匹配 ∥ 判权/同源门（101 前）∥ 会话桥（字节双向 ∥ 控制帧 ∥ 心跳 ∥ 收口幂等）∥ 会话表（停机全收口）∥ 审计两 kind） | 容器终端升级路（§9 ∥ §3） |
| `thincoder-server/bin/thincoder-server.mjs` | **241/242** | import + 注册行 + 装配 |
| `thincoder-server/src/sandbox/box.mjs`（已落） | **652/653** | 盒生命周期动作链 ∥ 建盒参数集 ∥ 放置/补放置 ∥ 卷目录准备 ∥ 定时器（空闲/墙钟/周期快照——`sandbox/EXECUTION.md` §3） |
| `thincoder-server/src/sandbox/quota.mjs`（已落） | **285/286** | 磁盘限额（探明 ∥ 项目配额/loopback ∥ 就位判据与自愈 ∥ 卸除件 ∥ 读回核——§4） |
| `thincoder-server/src/sandbox/workspace-routes.mjs` | ≈**280**（`baseImage` 键 ∥ derive 端点 ∥ 列表行字段） | 工作区面四路由 + 快照列表（自 `routes.mjs` 拆出——拆案首选执行） |
| `thincoder-server/src/store/migrations.mjs`（已落） | **795/796**（距 800 硬限余量 ≈4 行——拆案在案，见下） | 迁移段链（v1–v24——自 `db.mjs` 外提，纯搬移零语义） |
| `thincoder-server/deploy/sandbox-probe.mjs`（已落） | ≈**530** | 探针执行器（余腿 ∥ 一次性容器径 ∥ PASS/FAIL/SKIP/退出码——§10） |
| **小计** | ——（逐档见上表） | —— |

- `routes.mjs` 拆分预案（**两项均已执行**——① 容器面拆 `container-routes.mjs`（**313**）∥ ② 工作区面拆 `workspace-routes.mjs`（已落）；实读 **304/305** ⇒ 越线已消）：
  **触发点 = 越 500 软线**（复现 ⇒ 次选候选（落域内、端点路径零变）= 设置面独立成档）。
- `registry.mjs` 拆分预案（**419/420**）：**销**——拆案对象 = 队列/心跳死件，已删净。
- `migrations.mjs` 拆分预案（**795/796**）：**拆（必）**——距 800 硬限余量 ≈4 行；拆案候选 = DDL 常量段（v1–v24 字符串块）外提，`MIGRATIONS` 链与回填留档（纯搬移零语义——沿 `db.mjs` ⇒ `migrations.mjs` 先例）；**窗口 = 下一迁移触碰批动工第一步**。
- `docker.mjs` 拆分预案（**423**）：**未越 500 软线，拆案撤回**（沿容器族拆档先例）。
- 执行面预算随执行面档重建；webui 预算 = `webui/WEBUI.md` §5；单元测试档预算见下；板账 = `docs/server/design/PROJECT.md` §6。
- **成员写面 + 上限**：`routes.mjs`（**304/305**——成员写面四路由 + 上限校验；**越 500 软线已消**（工作区面已独立成档））
  ∥ `registry.mjs`（**419/420**——上限设置读/创建校验在件） ∥ `deploy/sandbox/member-shell/**`（新 ≈730——**档账入 `agent/MEMBER-AGENT.md` §5，本域不重计**）。
- **控制面成员面**：控制面（egress 面随退场——`rules.mjs` 段 = 退场前记录） = `rules.mjs`（**498–499**；**随出站闸退场**）∥ `routes.mjs`（**304/305**）∥ `registry.mjs`（**419/420**——越线已消，拆分预案销在册）；
  前端 = `views-me-sandbox.mjs`（已落）**124** ∥ `app.mjs` **204** ∥ `nav.mjs` **102**；
  i18n = `i18n-zh-me.mjs` **184** ∥ `i18n-en-me.mjs` **185** ∥ `i18n-zh-shell.mjs` **83** ∥ `i18n-en-shell.mjs` **81**；`style.css`（提示行/状态标）；
  **单元测试档两件**（**379** ∥ 成员端点逐值 ∥ **374**；成员页渲染 ∥ 提示/轮询 ∥ i18n 键集 ∥ nav 计数）。
- **单元测试档（入 server 链）**：服务面件（估 ≈**620**：盒动作链逐条（假 Docker/假 SSH）∥ 参数集逐值 ∥ 放置/定时器 ∥ 实时门 ∥ v22 迁移（含删表）∥ `migrations.mjs` 拆案读判 ∥ #1351 事务）∥
  执行面件（估 ≈**330**：规则文本位次 ∥ 下发幂等/单事务 ∥ DNS 闸三径（放行/拒/待批持答）∥ 解析过滤 ∥ 临时集回收）——**该件已退场删**。
- **单元测试档（底座可换；入 server 链）**：服务面件（估 ≈**320**：派生 tag/Id 内容寻址 ∥ Dockerfile 逐行 ∥ 镜像就位四步（假 Docker——缓存/拉取/构建三径）∥ 凭据 CRUD/加密/`X-Registry-Auth` 组装 ∥ `baseImage` PATCH ∥ 建盒链 ④ 两腿（**缺省零新增调用**））∥
  前端面件（估 ≈**220**：两卡渲染 ∥ 设置底座/凭据弹窗 ∥ 构建在飞态 ∥ i18n 键集 ∥ 档目）。
- **服务端件（底座可换）**：`derive.mjs` ≈200 ∥ `registry-creds.mjs` ≈130 ∥ `registry-cred-routes.mjs` ≈110 ∥ `image-routes.mjs`（**150**——拉取凭据注入 + 审计 `auth` 键）∥
  `workspace-routes.mjs`/`box.mjs`/`docker.mjs`/`bin` 四行 delta——**增补分项和 = ≈+686**（三新档 ≈440 + 五行 delta ≈206 + 迁移段 +≈40）；全形 = `sandbox/EXECUTION.md` §14；webui 面 = `webui/WEBUI.md` §5 ∥ `webui/SANDBOX.md` §3。
- **服务端件（连接面 TLS 档）**：`docker-tls.mjs` ≈**220**（三件形校验 ∥ 材料加解密存取（复用 `credential-crypto.mjs`）∥ 连接元数据视图 ∥ `node:https` 传输适配件）
  ∥ 六处 delta（`routes` +≈55 ∥ `registry` +≈30 ∥ `docker` +≈25 ∥ `migrations` +≈10 ∥ 容器/镜像/卷/终端四路由（各 +≈3）≈12 ∥ 盒链 `config` 透传 +≈3——合计 ≈135）⇒ **分项和 ≈+355**（`docker-tls.mjs` ≈220 + delta ≈135）；
  **单元测试档两件**（估 ≈180 ∥ ≈140）；webui 面 = `webui/WEBUI.md` §5 ∥ `webui/SANDBOX.md` §3。
- 单元测试档三件（入 server 链）：服务面件（Docker 客户端 ∥ 路由 ∥ v12 迁移；估 ≈420）∥
  前端面件（运行面渲染 ∥ nav ∥ i18n 键集；≈**330**）∥
  托管接入/agent 件（假 ssh ∥ 五工具 ∥ 任务生命周期 ∥ 凭据加密/零化 ∥ v13 迁移；**637**；**整档删**——任务面用例随件退场）。
- **单元测试档（入 server 链）**：服务面件（估 ≈420：docker 客户端读数/流解复用/拉取扫描 ∥ 八路由 ∥ 假 Docker）∥
  前端面件（估 ≈280：容器详情/日志/用量面渲染 ∥ 镜像区 ∥ 弹窗 ∥ i18n 键集 ∥ 档目）。
  **随正件**（父侧落——实施轮同拍）：档目断言件（+2 名——`views-sandbox-containers.mjs` ∥ `views-sandbox-images.mjs`）∥ 门禁件数断言件七件（**47**）∥ `thincoder-server/package.json`（`prepublishOnly` **47**）。
- **单元测试档（入 server 链）**：服务面件（**682**：源清单模型（形校验/名址唯一/预选） ∥ registry-client（v2 与 Hub 两面读 ∥ 匿名 Bearer 挑战 ∥ 有界/`Link` 截断 ∥ 五分类映射） ∥ 七端点 ∥ v15 迁移；假 registry/hub）∥
  前端面件（**514**：镜像源卡渲染 ∥ 增/改/删弹窗（预选回填） ∥ 目录浏览窗（两列表 + 两过滤） ∥ 五分类读绪 ∥ 本地镜像表过滤 ∥ i18n 键集 ∥ 档目）。
- **单元测试档（入 server 链）**：前端面件（**437**：预填拼装纯函数（去 scheme ∥ Hub 主机收正 ∥ `:latest`） ∥ 目录窗「拉取」钮可用态 ∥ 节点选单 ∥ 拉取窗预填参 ∥ i18n 键集 ∥ 档目）。
- **单元测试档（入 server 链）**：服务面件（**606**：v18 迁移（回填三用例）∥ 凭据写/撤销 + 形校验 ∥ `execOnHost`（假 ssh）∥ `runnerByRef` ∥ chat `exec` 工具（假模型/假 ssh——帧/审计/掩蔽/私钥清理）∥ i18n/档目随正）。
- **单元测试档（入 server 链）**：前端面件（估 ≈450：组装纯函数逐值（v2 四用例 ∥ Hub 三支）∥ 可用态两分支（无源 ∥ 读败）∥ 预填认源态与改选 ∥ 窗口接线 ∥ i18n 键集 ∥ 档目）。

- **单元测试档（入 server 链）**：服务面件（估 ≈220：卷两路由（假 Docker：`GET /volumes` 样件 ∥ `DELETE` 204/404/409 三形映射） ∥ 名形校验零外呼 ∥ 审计行 ∥ 列表零审计）∥
  前端面件（估 ≈300：卷区渲染 ∥ 删除确认窗（取消零调用） ∥ 建容器卷选单（已选/手输两用例 + 读败/空） ∥ i18n 键集 ∥ 档目）。

## 14. 关键决策（本域）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-63 | **两平面分离**：server = 控制面（登记/编排/治理），盒只跑在 runner 节点（远程 Docker API 节点——可多台；集群化 = 用 Docker 自己的集群——§1） | 用户裁定（单点被压死即全死）；控制面常驻质量与盒资源耗尽解耦 |
| KD-SV-67 | **未提交保护 = 卷保留 ∥ WIP 快照 ∥ 销毁显式确认**（拆盒/停盒永不删卷；快照触发 = 控制端定时器——§1；销毁 = 管理员显式确认） | 工作区状态 = git 仓（可重建），节点本地卷 = 缓存；快照兜住未提交面（需求「停（卷∥快照留存）」——§5 工作区生命周期行） |
| KD-SV-70 | **每工作区凭据 = `api_keys` 行**（名 `sandbox:<ws>`；归属负责人；明文存控制面） | 复用客户面 token 面（需求块原句）；校验/记账/配额全链零改；明文 = 盒重建再注入所需（先例 KD-SV-19） |
| KD-SV-71 | **可用性门 = 无可用节点 ⇒ 仅沙盒功能面不可用**（不降级）；**server 启动与运行零依赖沙盒/runner**（用户令——网关 ∥ 记账 ∥ 控制台其余页 ∥ 客户面零影响） | 用户「不要考虑什么退路」的延续（限于沙盒面）+ 用户裁定（server 零依赖） |
| KD-SV-72 | **执行面共用**（runner 与 CI——用户裁定⑦）：CI 与沙盒共用同一执行节点面；接口/形态随执行面定形 | 「跑不受信的仓」本质同——一套节点面 |
| KD-SV-73 | **盒参数集** = read-only 根 + 唯一卷 + tmpfs 例外 + cap-drop + 非 root + 每工作区网络 | 需求块「每工作区一盒 + `--read-only` + 唯一可写挂载」的逐项落地；每工作区网络 = 跨工作区隔离（威胁模型面） |
| KD-SV-74 | **磁盘配额 = 项目配额优先 ∥ loopback 备选**（主机侧——SSH 执行；用户定） | 项目配额（xfs pquota ∥ ext4 prjquota）零额外设备；loopback 全平台可落但耗 loop 设备 |
| KD-SV-79 | **容器态不落库**：Docker 引擎即真源——读时读（`containers/json`）∥ 动作直调（create/start/stop/DELETE）；控制面零镜像 ∥ 零同步机制 | 双源必漂移（外部 `docker` 命令 ∥ 机器重启 ∥ 别的工具都在改容器）；同步/对账机制 = 白增面（最小切片不取） |
| KD-SV-80 | **节点存活 = 读时探活（非心跳）**：运行面/读数 = 请求内现打 `GET …/info`（3s ∥ 并发）∥ 动作 = 现打现报；无后台定时器 ∥ 无心跳落库 | 用户口径（无自驻进程）；探活只服务展示与当下动作，无独立可用性状态可陈 |
| KD-SV-81 | **Docker API 版本 = 登记时协商 + 调用恒带前缀**：`ver = max(1.44, MinAPIVersion)`，须 ≤ `ApiVersion`（否则拒登记）；版本存 `runtime_json`；**引导步 = 先取无前缀版本读数、再定前缀**（§3 自检）；**前缀形 = `v<ver>`**（如 `/v1.44/…`——真机核：`/1.44/…` 404 ∥ `/v1.44/…` 200） | 官方文档明示无版本前缀调用已废弃（将移除）；协商 = 老 daemon（min < 1.44）与新 daemon（min ≥ 1.44，如 Docker 29）两头都接得住 |
| KD-SV-84 | **凭据加解密 = AES-256-GCM + 密钥文件（`data/credentials.key` 0600）+ 可撤销 + 审计（掩蔽）**——单源 = `thincoder-server/src/store/credential-crypto.mjs`（消费面 = 主机表凭据 ∥ 私有仓凭据 ∥ 连接材料） | `node:crypto` 零第三方；密列零回显；如实披露（同机密钥不防整机沦陷；撤销只及 server 侧） |
| KD-SV-85 | **SSH 传输 = 容器内系统 openssh**（密钥 `-i`（0600 文件）+ `BatchMode=yes` ∥ 口令 `sshpass -e`（环境变量——不入 argv；**不带 `BatchMode`**——真机 A/B 核：带 ⇒ 「Permission denied (publickey,password)」∥ 去 ⇒ 登录成功；口令单提示 + 仅口令面））+ 主机指纹 TOFU（accept-new + 首见记录；变更 ⇒ 停 + 如实报）+ `.ssh` 落数据目录 | 零第三方运行期依赖（仓纪律——JS 自写 SSH 不现实）；`sshpass -e` = ps 无泄漏形；数据目录 = 容器重建不丢 |
| KD-SV-92 | **容器读数三件 = 读时读直取**：详情 = `containers/{id}/json` ∥ 用量 = `stats?stream=false&one-shot=true` + `json?size=1`（`SizeRw`/`SizeRootFs`）∥ 日志 = `logs?tail` 有界（读类 3s）；零缓存零落库 | 沿 KD-SV-79（引擎即真源）；无陈旧窗（外部 `docker` 命令随时改物）；读数如实（一次采样基线不足 ⇒ null——不假装） |
| KD-SV-93 | **日志 = tail 有界 + 非 TTY 多路复用解复用 + 截断 256 KiB**：解复用判据 = 首字节 ∈ {0,1,2} ∧ 1–3 字节零 ∧ 帧长 ≤ 余量（判不出 ⇒ 原样透传） | 创建面不设 Tty ⇒ 引擎返回 8 字节帧头流；不解复用 ⇒ 输出带二进制残渣；有界 = 读类 3s/连接不悬停 |
| KD-SV-94 | **拉取 = 同步请求 + 超时 10 分钟 + 失败两形皆收**：引擎非 2xx ∥ 200 流内 `error`/`errorDetail` ⇒ 400 携原文；不做异步任务/进度流（镜像源族 = 独立面——KD-SV-96/97；拉取认源 = 显式选源组装引用——KD-SV-100——拉取请求本身零改） | 取像耗时可分钟级（专用常量——沿 agent 工具面同值）；两形皆收 = 不对引擎行为下注；网络现实如实披露（零机制） |
| KD-SV-95 | **镜像删除 = `ref` 走请求体 + `force` 缺省 false**（`DELETE …/images` 体 `{ ref, force? }`；引擎 409 ⇒ 400 人话引导） | 引用字符集含 `/`/`:`/`@` ⇒ 路径段不兼容；**段级边界** = 单点 `.`/`/`/`:` 许可 ∥ `..` 段拒（`ref` 直入引擎删除路径——零外呼 400）；沿 `DELETE /runners/:id` 体参先例；缺省不强删 = 误删爆炸半径最小（409 消息给人话处置） |
| KD-SV-96 | **镜像源清单 = server 全局配置表（`image_sources` v15）+ 拉取消费面 = 显式选源**：源不写节点 dockerd 配置 ∥ 系统零隐式注入（引用组装仅随选定态——显式选定 ∥ 记忆预选；拉取窗内组装） ∥ 零自动选源（系统不自选源——缺省 = 记忆预选（首次 = 不选）；不选 = 引用原样） ∥ 目录读取 = server 直连源（不走节点 ∥ 不走 `proxy.uri`） | 需求边界「拉取行为不变」（用户撤代理；裁 A 后消费面 = 显式选源）；目录读取发生在 server（server → 源）⇒ 清单位置随读取方；按节点 = 清单 × 节点数（维护复制）且消费面在 server/控制台侧 |
| KD-SV-97 | **源目录/标签读取 = 标准 v2（`_catalog`/`tags/list`）+ Hub 面（公开 API）+ 匿名 Bearer 挑战 + 有界首页 + 五分类如实报错**（`timeout` ∥ `unreachable` ∥ `auth_required` ∥ `unsupported` ∥ `bad_response`；自含状态形——沿 `/api/admin/proxy/test` 先例） | 本机实测：公开源（ghcr ∥ quay ∥ ECR ∥ ACR ∥ SWR）皆 401 + Bearer 挑战 ⇒ 不换取则多数源恒「需认证」；DaoCloud 405 ⇒ `unsupported` 必需；quay 匿名空目录 ⇒ 空非错；Hub 无全站目录 API（官方关闭）⇒ `unsupported` 如实 |
| KD-SV-98 | **镜像源 UI = 沙盒页新卡（不新开页 ∥ nav 零动）+ 目录浏览弹窗 + 前端过滤（零新端点）**：源表（名/址/面型）∥ 增/改/删弹窗（预选下拉 + 名/址两输入）∥ 浏览窗（仓库列表 ∥ 标签列表——两处过滤输入）∥ 本地镜像表加过滤输入 | 镜像族 UI 家 = 沙盒页（容器区/镜像区同页）；源 = 全局面（非按节点）⇒ 独立卡（非节点展开内）；过滤 = 已载集合纯前端（沿审计/用量页先例）；弹窗复用 `modal.mjs`（KD-SV-31） |
| KD-SV-99 | **一键拉取 = 显式节点选单 + 预填既有拉取窗**（用户裁「要」）：目录窗行「拉取」⇒ 在线节点选单（无节点 ∥ 全离线 ⇒ 钮禁用 + 一句人话）⇒ 既有拉取窗（预填 `<主机>[:<端口>]/<仓库>:<标签>`——去 scheme ∥ Hub 主机统一 `docker.io`；预填可改）⇒ 既有拉取径；零新端点 ∥ 拉取行为零改（`image-routes.mjs` 132 零触） | 源清单 = server 全局（与节点解耦——KD-SV-96）⇒ 浏览窗无节点上下文：目标节点必须显式选（零隐藏——违则「禁用理由」指向看不见的背景态）；复用既有拉取窗 = 拉取径单源（无第二拉取实现）；可用态快照 = 目录窗打开读一次概览（读时读——KD-SV-80 同源） |
| KD-SV-100 | **拉取认源 = 拉取窗「经由源」显式选源 + 引用按源组装**（用户裁「A」）：选定源 ⇒ 对输入原文组装一次（`<主机>/<路径>[:<标签>]`——去 scheme ∥ 含端口逐值 ∥ Hub 主机统一 `docker.io` + 裸名补 `library/` ∥ 已带主机剥换（引擎同口径判据） ∥ 无标签补 `:latest` 显式 ∥ `@` 透传）；组装 = 输入框可见改写（所见即所拉；可再改）；组装施加点 = 选单变更 ∥ 选定态在场之输入完成（失焦——幂等）；窗重开预选上次所选（记忆——P2 已裁采纳；预选态非自动改写）；提交恒发输入框当刻文本（组装后可见值） ⇒ 既有拉取径零改（端点形零动 ∥ 零新端点）；源清单读时读（无源 ∥ 读败 ⇒ 不选态 + 人话——拉取不阻断） | 补 Hub 类源（无全站目录 ⇒ 目录窗零行）的拉取消费面（用户实测「加了源，拉取不认它」——根源 = 缺拉的消费面）；组装可见 = 沿「预填非锁定——确认值 = 所见值」口径；读时读 = 沿 KD-SV-80 同源；拉取径单源 = 不造第二拉取实现 |
| KD-SV-102 ∥ KD-SV-103 | ⇒ `webui/TABS.md` §1（公共标签页组件 ∥ 沙盒页分标签——本域不复制） | —— |

| KD-SV-104 | **卷族 = 引擎即真源 + 只改入口形 + 删卷防护**（用户三件）：卷不落表（读时读 `GET /volumes` ∥ 删直调——同 KD-SV-79 族）；**零自动建卷**（首用即建 = 引擎行为——我方零建卷调用；「新建卷（手输）」= 名字进既有 `Binds` 径）；建容器卷字段 = **选单（节点已有卷 + 「新建卷（手输）」逃逸——选定回填可再改；读败/空 ⇒ 手输照常）**——`Binds` 请求形零改；删卷 = 确认窗 + 后果句；**在用卷拒删 = 引擎 409 如实译 400 人话 + 处置句**（不前置预检——真机实读 `volume is in use - [<id>]`） | 用户三件逐条 + 裁；引擎即真源 = 既有族口径（KD-SV-79——双源必漂移）；下拉 = 只改入口形（引擎请求形零改——最小面）；409 如实 = 单源真相（KD-SV-79/80 同精神）；「新建卷」保底 = 手输习惯零冲突 |
| KD-SV-133 | **主机表 = `sandbox_runners` 扩展（不新建第二张机器表）**（用户裁：设主机表管 SSH 凭据）：行 = 一台主机（名 ∥ Docker API 地址 ∥ SSH 凭据随行）；v18 增七列（`ssh_port` ∥ `ssh_user` ∥ `auth_kind` ∥ `secret_cipher` ∥ `sudo_cipher` ∥ `credential_state` ∥ `credential_updated_at`）；SSH 目标主机 = 行 `address` 的 host 部分（不另设列）；密列零回显；`keep` 成功 ⇒ 移交（run 行零化 + `'moved'`）+ v18 回填 | 单一权威（本表已是机器登记面——一台机器一行）；既有消费面零改（`docker` 绑定 ∥ 控制台运行面 ∥ 三族路由皆读本表）；同一寻址（`exec`/`docker` 共用 `runnerByRef`）；迁移面小（列增量 + 一次回填）；用户「主机表」语义 = 机器表（非第二张清单） |
| KD-SV-134 | **凭据入口 = 结构化弹窗（表单——唯一入口）＋ 两挂载点同件；聊天文本非通道**（用户裁：SSH 凭据进管理面 chat）：沙盒页·运行面节点行动作（权威管理面）∥ 对话页顶栏钮（会话内录入）——同一弹窗件/同一端点（`PUT`/`DELETE …/credential`）；对话页不列第二张主机表；请求录入 = 弹窗（简报纪律句同拍）；与 §16.3 sk 面完全分离（sk = 服务端自持、登录自动签发、无人工入口） | 秘密纪律（文本通道 ⇒ 明文入消息行 + 随上下文出上游——与 KD-SV-114 掩蔽精神相抵）；表单 = 零秘密回显 + 掩蔽面单源；两挂载 = 同一组件（零第二份表单）；用户对「进 chat」的语义 = 会话内可录（非文本投喂） |
| KD-SV-135 | **装机/主机运维 = 管理面 chat 内动作（终局已达成）**：`exec`/`docker`/`runners` 工具 + 主机表凭据承接装机能力——零新机制、零新端点；**任务式 run 面已退场**（用户裁「撤」：弹窗 ∥ 四端点 ∥ 服务件 ∥ 任务面工具 ∥ 单元测试档删净）；`sandbox_onboarding` 表 = **停机留史**（数据不删；零写入 ∥ 零读面）；`agent/ADMIN-AGENT.md` §13 R71⑥（run 出口改道）撤回注不变 | 「将来合并进 chat」= 用户方向已裁 ⇒ 终局执行（原三步路线：步 0/1 已备；步 2/3 合并为一次退场——每步独立评审纪律沿旧）；工具面已备 ⇒ 退场零新机制；表留史 = 历史数据不删 |
| KD-SV-105 | **卷区 = 节点行展开（容器区之后）——归属标签①「运行面」**；表 = 名 ∥ 创建时间 ∥ 操作（删除）；驱动透传不入列 ∥ 用量不做（引擎列表不携——`?size=1` 两版实读零 `UsageData`） | 卷 = 节点资源（与容器区同读上下文、建容器弹窗同层）；分标签归位 = 标签①——载体 = 节点展开（与归位块相容） |

| KD-SV-137 | **探针判据口径 = 结构判据优先**：P1 收窄 = 宿主真实账号（UID ∈ [1000, 65533] 窗）零命中盒内 passwd（窗外的标准系统账号不判）∥ P8 收窄 = 注入面正向在场 + 秘密零命中（基础镜像固有 env 不判）；SKIP 三项前置登记（P9 第二盒 ∥ P10 `--repo` ∥ P14 执行面读数面） | P1/P8 两 FAIL 均为基础镜像自带项（`nobody` ∥ `NODE_VERSION`/`YARN_VERSION`）= 判据假红；白名单全量比对必漂（R25 已预判「镜像固有面不列则恒 FAIL」） |
| KD-SV-138 | **成员面工作区读面 = 控制台成员页（`#/me/sandbox`）**：行 = 名 ∥ 盒状态（运行/已停 + 回收原因）∥ 快照数 ∥ 所属 runner（`runnerName`）；恒本人过滤（`owner_member_id`）；零写控件（读面）；**写面**（创建 ∥ 启停 ∥ 销毁 + 拉仓——KD-SV-156；轮换/快照恢复仍管理面） | 需求 §5:426–428（成员侧 = 控制台成员页）+ #1234「读面随沙盒落」；数据面大半既有（补 `runnerName`） |

| KD-SV-140…159 | ⇒ 空档段号（68 ∥ 69 ∥ 76 ∥ 136 ∥ 139 五段随出站闸退场——编号留空档）；未用段 140–159 保留；新段自 **KD-SV-160** 起启用。 | —— |
| KD-SV-160…174 | ⇒ `sandbox/EXECUTION.md` §15（执行面——15 条：三腿/三证 ∥ 队列退场 ∥ 卷形式 ∥ 配额 ∥ 闸本体 ∥ DNS 闸 ∥ 实时门 ∥ 幂等链 ∥ 快照 ∥ 空闲信号 ∥ 运行时通道 ∥ 放置 ∥ 探针执行器 ∥ 迁移拆案 ∥ #1351；本域不复制） | —— |
| KD-SV-175…180 | **容器终端 v1（用户三句）——全形 = §3 容器终端块**：KD-SV-175 会话链 = 升级连接（`node:http` 劫持——`fetch` 面不可达流式 stdin，实测）∥ KD-SV-176 帧协议 = 二进制 pty 字节 ∥ 文本 JSON 控制 ∥ KD-SV-177 心跳 = 服务端 30s WS ping / 客户端 30s 文本 ping、60s 判死 ∥ KD-SV-178 断线收口 = `\x04` + 关流（不追捕前台进程 ∥ 无会话持久化）∥ KD-SV-179 会话环境 = `TERM` 恒注 + `LANG` 条件注入 ∥ shell = `bash` 优选 `sh` 兜底 ∥ KD-SV-180 审计两 kind + `requireAdmin` + 同源门 | —— |
| KD-SV-184…191 | ⇒ `sandbox/EXECUTION.md` §15（**底座可换**——8 条：绑定形 ∥ 派生构建 ∥ 缓存/重建 ∥ 前提（乙——Node 随包带） ∥ 凭据 ∥ 镜像就位步 ∥ 控制台面 ∥ 审计；本域不复制） | —— |
| KD-SV-192…195 | ⇒ `sandbox/EXECUTION.md` §15（**连接面 TLS 档**——4 条：形态（地址 scheme 单源） ∥ 传输（`node:https` 适配件） ∥ 材料（三件自备 + 零回显） ∥ 审计（`runner_connection`）；本域不复制） | —— |
| KD-SV-229…232 | ⇒ `sandbox/EXECUTION.md` §15（**壳更新面**——4 条：版本化壳件 + 启动自取/自换 ∥ 传输 = 静态面复用 + 构建期打包 ∥ 校验与回退 = 树哈希 + 三层 + 三失败 ∥ 版本读音 + 触发；本域不复制） | —— |

## 15. 本域边界（不做）

- **镜像源族余项（不做——§3）**：**源目录/标签读取的凭据面**（仍匿名——私有源 ⇒ `auth_required` 如实；凭据面只及拉取/派生注入——§3 底座可换块）
  ∥ 源读取走 `proxy.uri`（直连口径）
  ∥ 保存时探活预校验（读时如实报，不预校验）∥ 子路径源（`https://host/prefix`——形拒）∥ 源清单与节点的网络可达性交叉校验（server 可达 ≠ 节点可达——如实披露）。

- **卷族余项（不做——§3 卷族）**：**带数据重建（给已建容器补挂卷）**——用户裁「先按不考虑加挂的原方案开」⇒ 不做 ∥ 卷用量（大小）/「驱动」显示列 ∥ 卷内浏览 ∥ 跨节点卷迁移 ∥ 卷改名（未点——不做）。
  **卷族↔工作区卷关系（已定形——KD-SV-162）**：本族卷 = 节点 Docker 命名卷（§3 卷族——引擎即真源）∥ 工作区卷 = **主机路径绑定** `<workspaceRoot>/<ws-id>`（§2/§5——生命周期/销毁语义随工作区）；两形态**并存不代管**（卷区不列工作区卷 ∥ 删卷防护零工作区感知——通用确认窗）。机制全文 = `sandbox/EXECUTION.md` §3。

- **CI 实现**（#1216③——与沙盒共用执行面（§14 KD-SV-72）；CI 面不在本域）∥ **#1215 产品面**（web 开发会话 ∥ 移动端 ∥ agent 交互）。
- **盒镜像内容治理**（内容 = 部署面）。
- **入站/端口转发** ∥ **盒间通信**（每工作区独立网络——跨工作区互不可达）。
- **IPv6**（v1 只 IPv4——docker IPv6 关为前置）。
- **项目权限面**（#1216②——接口已留：§9 同守卫点）∥ **多租户** ∥ **per-workspace 独立额度池**（复用成员配额）。
- **成员面余项（不做）**：成员写面之**轮换/快照恢复**（仍管理面；创建 ∥ 启停 ∥ 销毁 + 拉仓——KD-SV-156）∥ **三端沙盒/工作区面**（不发明——判据在册）∥ 探针执行器（余腿——`sandbox/EXECUTION.md` §10）∥ 主机侧件（磁盘限额——已落）；**出站闸本体/下发器 ∥ 控制面求值/带入接线已退场删**。
  **#1248/#1249 真机复证**：随出站闸退场关闭（#1248 腿删；#1249 余腿闭环 = 执行面收口面——§11 闭环边界；执行器 `deploy/sandbox-probe.mjs`）。写面（`agent/MEMBER-AGENT.md` §3.7）；读面 = §8 成员面。
- **最小切片余项（收口）**：**已落** = 磁盘限额 ∥ 探针（判据 + 执行器——余腿）∥ 放置 ∥ WIP 快照 ∥ 工作区↔容器映射（盒）∥ 资源限额（cpus/mem/pids/磁盘）；**退场** = 出站闸 ∥ 待批队列。**未落** = Swarm 集群 ∥ 端口映射/网络面 ∥ 节点禁用/排空。**TLS 档已落（§3 连接方式块；§3 提议① 以节点级可选档兑现）。**
- **主机凭据/`exec` 余项（不做——§3 主机凭据块）**：凭据轮换/过期（TTL）∥ 一主机多凭据（一主机一枚）∥ 跳板机/代理链 ∥ 批量凭据导入 ∥ `exec` 交互式会话（PTY）∥ 文件传输（scp/sftp）∥ 后台任务（异步 `exec`）∥ 脚本/编排 DSL（逐条命令 = 最小面）∥ 凭据使用方 = 本 server。
- **终端余项（不做——§3 容器终端块）**：会话持久化/重放（tmux 语义——断开即结束，窗口重连 = 新会话）∥ 鼠标协议 ∥ 图片协议 ∥ 文件传输 ∥ 自选命令（命令 = 服务端常量——`bash` 优选 `sh` 兜底）∥ 会话数上限（无上限——内部自用）∥ 前台进程追捕（Docker exec 无 kill 面——如实披露）∥ 终端内搜索/字号缩放 ∥ **主机 `exec`（SSH）交互式 PTY——仍不做**（属主机凭据余项句——与容器面无关，勿混记）。
- **连接面 TLS 余项（TLS 档不做——§3 连接方式块）**：材料轮换/续期机制（改材料 = 编辑面全列覆写）∥ 材料查看/导出（**只进不出**——三件零回显零回填）∥ 节点侧 TLS 服务端配置（dockerd `--tlsverify` 等——在机；我方面只做客户端）∥ 配对/信任链管理（材料 = 用户自备）∥ 按节点代理链。

## 16. 上抛/余项（本域）

> 服务端设计档 `design/PROJECT.md` §9 同类行 = 保位 stub（指向本节）。

| # | 项 | 类型 | 处置建议 |
|---|---|---|---|
| R51 | **server-exec-sandbox（需求档回笔 + 随正件 + 披露）**：① 需求档回笔（主 agent 笔——**已落**：§5 沙盒块必交面行 + **AC-36** 在册（四处同源）+ §2:13 **十一页** ∥ §2:14 **八页** + AC-12/AC-14 档目 **32∥33** + AC-28 十二型 + server 零依赖沙盒行）∥ ② 随正件（父侧落——实施轮同拍）：注⑱（档目断言件九件 ∥ nav 计数件三件 ∥ 审计型面件 ∥ 门禁件数断言件七件 **40**）+ `thincoder-server/package.json`（**40**）∥ ③ 披露（不阻塞）：**已裁**（用户「都按建议」——docker ∥ 独立管理页 ∥ 快照 15 分钟+拆前）∥ 披露 D1–D4（tmpfs 例外 ∥ key_plain 明文 ∥ 盒可达 server 整端口 ∥ 复用 key 残余面）∥ ④ 部署收尾（父侧执行）：节点接入（`ops/OPS.md` §5.10） | 披露 | 评审/用户复核 |
| R52 | **runner-admin-console（需求档回笔/父侧补笔/登记项）**：① 需求档（主 agent 笔）：沙盒四件的可检验条目已在验收盘面（`sandbox/SANDBOX.md` §11 ∥ §12）；需求档 §5/AC-36 的阶段口径（六面分两轮）宜回笔——**写法/计数 = 主 agent 定** ∥ ② 父侧补笔：`docs/TEST-ENV-ECS.md` §7——现为 `thincoder-runner.service` 残留口径（服务已不存在）+ 需补节点前置步（dockerd 监听 TCP——`ops/OPS.md` §5.10 节点前置条）∥ ③ 登记（不阻塞）：审计页 `sandbox_event` 模板随余面（原始型名兜底可用）∥ ④ 承诺项：v12 迁移（存量旧行弃——测试库仅一行 daemon 期残留）∥ 收口轮 = 真机走查（10.0.0.6） | 披露 | 评审/用户复核 |
| R53 | **runner-admin-console（托管接入增补）——需求档回笔/父侧补笔/登记项**：① 需求档（主 agent 笔）：AC-36 ⑨/⑩ 与 §5「接入两径」判据收口（三态 ∥ 凭据纪律五件 ∥ 网络路径——判据全文 = `sandbox/SANDBOX.md` §3/§11）；写法/计数 = 主 agent 定——**已闭合：⑨ 收正「接入与运维」∥ ⑩ 删（需求档回笔在册）；旧判据块随托管接入退场删净——承接 = 本档 §3 接入面块** ∥ ② 父侧补笔：`docs/TEST-ENV-ECS.md` §7——补「托管接入」跑法（agent 代做三件；手工前置路仍可作降级）——**销项：任务式装机退场 ⇒ 无「托管接入」跑法可补；承接 = 手工登记 + 管理面 chat 内动作（本档 §3 接入面块）**；既有 `thincoder-runner.service` 残留口径同 R52② ∥ ③ 登记（不阻塞）：`docs/README.md` 地图登记 agent 域（新域——域档一档）∥ `@thincoder/server` 带核发布形（`@thincoder/core` 钉版本依赖——构建期 registry 可达性，实施轮定；KD-SV-78 依赖声明形） ∥ `Dockerfile` 构建期 apt 可达性（`openssh-client`+`sshpass`——如实披露） ∥ agent 模型出口代理旗复核点（`agent/ADMIN-AGENT.md` §5） ∥ ④ 披露（不阻塞）：多机并装 ∥ 任务中途取消 ∥ TLS（`:2375` 明文——沿提议①）不做；托管接入 = 任务式驱动（管理面 chat 随会话面增量轮） | 披露 | 评审/用户复核 |
| R55 | **sandbox-docker-admin（需求档回笔 + 随正件 + 披露）**：① 需求档回笔（主 agent 笔——随评审/收口）：`docs/server/requirements/PROJECT.md` §5 ①「本轮不做——镜像管理」行与 AC-36 ⑥ 分期句需回笔（镜像管理 = 交付面；容器面补齐 + 镜像族三端点）——**写法/计数 = 主 agent 定**；另：该档档目链现含沙盒运行面（**31 ∥ 32**）∥ admin-agent-chat（**32 ∥ 33**）两步，**缺 +2 步**；终值 = **38 ∥ 39**——口径差宜同拍收口∥ ② 随正件（父侧落——实施轮同拍，**以当刻盘面实读为准**；逐件名单/断点 = §6 注⑳）：档目断言件九件（+2 名——`views-sandbox-containers.mjs` ∥ `views-sandbox-images.mjs`；**34 ∥ 35**）∥ 门禁件数断言件七件（**47**）∥ `thincoder-server/package.json`（`prepublishOnly` **47**）∥ ③ 披露（不阻塞）：拉取网络现实（Hub 在 `10.0.0.6` 不可达 ∥ 慢源 #1250——如实呈错 + 引擎原文；不加镜像源/重试机制）∥ `env` 原文可见（含盒内工作区 key——与既有「盒可达 server 整端口」同族残余面）∥ 用量一次采样（首采样缺基线 ⇒ `cpuPercent = null`）∥ 日志文本截断 256 KiB ∥ ④ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（节点展开 ⇒ 详情/日志/用量 ⇒ 重启/强杀 ⇒ 镜像列/拉/删）+ 真机（10.0.0.6） | 披露 | 评审/用户复核 |
| R56 | **sandbox-image-quick-pull（披露 + 部署收尾）**：① 披露（不阻塞）：**目录窗单例行为**——开节点选单时目录窗按「开新先关旧」自动关闭（拉取成后如需续览 ⇒ 重开目录窗）∥ 预填非锁定（窗内可改——确认值 = 所见值）∥ 节点快照 = 目录窗打开时读一次概览（读时读；开窗后节点状态变化 ⇒ 拉取按引擎实况如实报）∥ Hub 预填主机统一 `docker.io`（`hub.docker.com` 为站点主机非注册表主机——逐值保留会产出引擎不可拉的引用）∥ 预填 ≠ 可达保证（节点侧 registries/网络现实——沿 R55③）∥ ② 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（有在线节点：浏览 ⇒ 拉取 ⇒ 节点选单 ⇒ 预填核对 ⇒ 确认真拉 ∥ 无节点 ∥ 全离线：钮禁用 + 一句人话） | 披露 | 评审/用户复核 |
| R57 | **sandbox-pull-by-source（披露 + 提议采纳（已裁） + 部署收尾）**：① 披露（不阻塞）：组装 ≠ 可达保证（节点侧引擎照拉——`docker.1ms.run` 等源在节点网络的可达性如实报，失败两形照 KD-SV-94）∥ 组装 = 文本规则（引擎同口径剥换判据——非解析器；异常引用照引擎实况报错）∥ 源清单读时读（开窗读一次；开窗后源被删/改 ⇒ 组装结果仍按当刻清单）∥ **Hub 不可达点**（10.0.0.6 上 Hub 类端点不可达——沿 R55）不影响本面（组装为纯文本；可达性 = 节点侧现实）∥ ② **提议采纳（已裁——用户裁 P1 ∥ P2 均为做；来源 = 设计侧提议（UX 反问面导出））**：**P1** 拉取窗「目标节点」行恒显（手动径也显示）∥ **P2** 「经由源」选择记忆（窗重开预选上次所选——预选态非自动改写；记忆源失效 ⇒ 不选态回落）——落地 = 设计随正（`sandbox/SANDBOX.md` §3 ∥ `webui/SANDBOX.md` §2.1①）∥ ③ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（拉取窗：选源 ⇒ 组装 ⇒ 确认；无源 ∥ 读败两分支）+ **整条用户旅程真机（ECS `.6`：加源（`docker.1ms.run`）⇒ 经源拉 `ubuntu:24.04` ⇒ 镜像落地 ⇒ 建容器跑——AC-38 ⑤）** | 披露 | 评审/用户复核 |

| R72 | **admin-chat-creds-merge（需求档回笔 + 冻结域随正清单 + 随正件 + 披露）**：① 需求档回笔（主 agent 笔——**已闭合**：父侧落笔——`docs/server/requirements/PROJECT.md` 功能点 47 ∥ AC-47 在册（§2 增功能点 + §5 合并方向 + AC-36 ⑨/⑩ 随拍）） ∥ ② **冻结域随正（已办）**：`store/STORE.md`（§2 v18 段：七列 `ALTER` ∥ `sandbox_onboarding` CHECK 重建 + `'moved'` ∥ 回填移交；§1 版本 **19**；§3 迁移链 v18 行；§4 db 预算）∥ `gateway/API.md`（§2.5：行形增 `ssh` 元数据 ∥ 增 `PUT`/`DELETE …/runners/:id/credential` 两端点 ∥ 托管接入行形补第四态）∥ `accounts/ACCOUNTS.md`（§2.1 `sandbox_event` 增两 kind：`host_credential_set`/`host_credential_revoke`——kind 非枚举 ⇒ 零 CHECK 改）∥ ③ 随正件（以当刻盘面实读为准）：`thincoder-server/package.json`（`prepublishOnly` = 3×`node --check`——批内单测不入链）∥ i18n 键组三族（逐键 = `webui/SANDBOX.md` §2.1① §3 ∥ `webui/CHAT.md` §2.1 §3；行值单源 = 各面档文件账）∥ ④ 披露（不阻塞）：凭据常驻至撤销（无 TTL——自加项①）∥ `'moved'` = CHECK 重建（v18 含表重建一步）∥ `exec` 无 PTY/无文件传输/无异步（余项行）∥ 行 `address` 解析作 SSH 主机（异址部署不可达——如实报）∥ 凭据明文零回显（响应键面扫描在用例）∥ ⑤ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（两处录入 ⇒ chat `exec` ⇒ 撤销 ⇒ 拒）+ 真机（ECS `.6`：录真凭据 ⇒ `exec` 读数 ⇒ 撤销） | 披露 | 评审/用户复核 |
| R59 | **sandbox-volumes（披露 + 同步项 + 需求档回笔 + 部署收尾）**：① 披露（不阻塞）：**在用卷拒删 = 引擎行为**（我方不预检——引擎错误原文如实携；零自动清理）∥ 删卷不可逆（确认窗 + 后果句——卷内数据一并消失）∥ 「新建卷（手输）」= 名字进既有 `Binds` 径——**建卷成功与否归引擎**（首用即建：真机实读 = 容器创建即建；引擎拒 ⇒ 创建失败如实报）∥ 列表面字段 = 引擎如实（驱动恒 `local` 不入列；用量引擎不携——不做）∥ ② 同步项（**已办**——本项销；状态以 `webui/SANDBOX.md` 现句为准）：`webui/SANDBOX.md` §2.1① 分标签归位块半句与容器区句现为「（展开 ⇒ 容器区 + 卷区）」——展开体 = 容器区 + 卷区 ∥ ③ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（建容器选卷/手输两用例 ∥ 卷表列/删 ∥ 确认窗取消零调用）+ **真机（ECS `.6`）：在用卷拒删如实呈（`test-data` 类场景——409 ⇒ 400 人话）** ∥ ④ 需求档回笔（主 agent 笔）：`docs/server/requirements/PROJECT.md` AC-36 ⑥ 分期链止于「⇒ 拉取认源」——**缺「① 续四：卷族」一步**；同档 §5「① 续」不做清单仍载「卷删除（另单列——判据 = `sandbox/SANDBOX.md` §15）」——已交付（判据改指 §11——沿同行「已落」形）；**写法/计数 = 主 agent 定** | 披露 | 评审/用户复核 |

| R73 | **sandbox-outbound-member-face（需求档回笔 + 随正件 + 披露 + 真机验收面）**（**⚠ egress 面退场：本行 ① 出站行句 ∥ ③ 披露之 P2/P3 条 ∥ ④ 真机验收面之 egress 腿随退场废止——余项按退场后口径**）：① 需求档回笔（主 agent 笔）：`docs/server/requirements/PROJECT.md` §5 成员面 ① 行补「所属 runner」字段（现句 = 运行中 ∥ 已停 ∥ 被回收 ∥ dirty ∥ 快照）；§5 出站行补「强制面」句（门级不变量 ∥ 全协议 ∥ 双径同判 ∥ 解析零地址拒 ∥ 命中即拒零挂起 ∥ 网段带入 ∥ 闸为盒前置）；AC-36 ⑦ 探针句补「判据收窄 + SKIP 前置」（写法/计数 = 主 agent 定）∥ ② 随正件（父侧/实施轮——以当刻盘面实读为准）：`webui/WEBUI.md` §1 档目链 + 静态面清单（+`views-me-sandbox.mjs`——`:16`/`:173` 翻「新建」）∥ §6 AC-12 行（我的 5）∥ `design/PROJECT.md` 板账；**档目断言件**（**167** 行 ⇒ 净变 ≤±20——+1 名）∥ **键集指纹/键数随正件**（+≈16 键/表）：`…-server-public-structure`（① 指纹/键数——已随正 **959 ∥ 964**）∥ `…-runner-admin-console-ui`（⑦ 键数终值；**529** 行）∥ `…-admin-agent-chat-ui`（⑧ 键数终值；**397** 行）∥ `…-team-projects-permissions-ui`（shell 键数 **60**；**551** 行）——逐件净变 ≤±20；**门禁件数断言件/`package.json` 链项 = 作废**（用户裁「门禁链撤除——批内件不入发布门」；不增链、不碰旧断言件）∥ ③ 披露（不阻塞）：探针执行器随执行面（只落判据面；P1/P8 收窄后须重跑方「绿」）∥ 主机侧闸本体随执行面 ⇒ **P2/P3 真机复证 = 执行面收口面**（控制面修复可机检）；**#1248/#1249 闭环批次 = 执行面——验收 = 控制面腿，收口轮不得按当批读数记「已修」**∥ 三端沙盒面不存在（判据在册；落点登记随 #1215）∥ 成员读面无写控件 ∥ ④ 真机验收面（收口轮 · ECS `.5`/`.6`）：登记节点 ⇒ 种子 deny 行逐值（RFC1918 ∥ 节点 /24 ∥ 服务器段）∥ 盒内打 `169.254.169.254` ∥ 宿主 22 口 ⇒ 拒（待执行面后） | 披露 | 评审/用户复核 |

| R74 | **sandbox-exec-rebuild（需求档回笔 + 随正件 + 披露）**：① 需求档回笔（主 agent 笔）：`docs/server/requirements/PROJECT.md` §5 沙盒块——「执行通道 = exec 指令面（非 root ∥ 超时 10 分钟 ∥ 输出截断 1 MiB）」句与用户口径相抵（执行面 = Docker API 直调 + 盒内壳自持；`exec` 指令面无对应实现面）⇒ 请收正；「控制链（runner 长轮询/心跳/指令队列）」史句现状 = 已废（如仍在活面请随正）；「保护降级两边界」（非 git 跳过 ∥ >200 MiB 跳过）随快照形式收正（非 git 同覆盖；单份上限 = `diskMb` 配额——EXECUTION §3）；新设置键两枚（`maxBoxesPerRunner` ∥ `workspaceRoot`）宜在资源行登记；**「底座可换」入册**（用户范围增补——建议功能点 52 ∥ AC-52（承 AC-51 顺序）；判据全文 = `sandbox/EXECUTION.md` §8 底座可换块 ∥ §13 用例 ∥ §3 块）；写法/计数 = 主 agent 定 ∥ ② 随正件（父侧/实施轮，以当刻盘面实读为准）：`docs/TEST-ENV-ECS.md`（节点前置 = dockerd 监听 TCP + 工作区根目录 + **派生前置 = 标准镜像件位契约（`/opt/thincoder/app`——标准镜像件位）就绪 + 底座镜像来源**——沿 R52②）∥ `docs/README.md`/`design/PROJECT.md` 档目（sandbox 域 **2 档**——EXECUTION.md）∥ 旧单元测试档引用 `sandbox_tasks`/队列者随实施随正 ∥ **档目/键集断言件随正**（档目 +1 名——`views-sandbox-base.mjs` ∥ i18n 键集指纹——以实施当刻盘面复读为准）∥ ③ 披露（不阻塞）：nft 漂移窗 ∥ DNS 闸 UDP 只 ∥ 快照全量存档（配额内）∥ 定时器 30s 粒度 ∥ 探针 SKIP 如实登记（零假报）∥ **底座可换五件**（派生真机可用依赖标准镜像件位契约落地；落地前机检不受阻 ∥ 底座 tag 移动 ⇒ 节点本地旧像被采用（追新 = 重拉后派生）∥ 派生同步请求（最坏 ≈20 分钟 = 拉取 10 + 构建 10；超时后引擎侧可能仍在跑——重试幂等）∥ 逐节点各自派生（tag 内容寻址保证同源）∥ 凭据只及拉取注入——目录/标签读取仍匿名）∥ ④ 真机收口（父侧执行）：ECS `.5`/`.6` 复跑探针套件（余腿） + 建盒/快照/恢复全链实走 + **底座可换全链**（选定底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起——前置 = 标准镜像件位契约就绪）∥ **连接面 TLS 档（用户范围增补「让用户可选」）：① 需求档回笔（主 agent 笔——建议功能点 53 ∥ AC-53，承 AC-52 顺序；判据全文 = `sandbox/SANDBOX.md` §3 连接方式块 ∥ §11；写法/计数 = 主 agent 定）∥ ② 随正件（父侧/实施轮——以当刻盘面实读为准）：`runner-admin-console 服务面单测档`（E34 语义随正（https 400 因 = 档相抵/缺三件——不再为「scheme 拒」）+ **列面断言 +四列**）∥ `runner-admin-console 前端面单测档`（添加弹窗体增 `connection` ∥ 行钮 +1 ∥ 键集 +≈16）∥ `档目断言件（结构版本）`（档目 +2 名——`docker-tls.mjs` ∥ `views-sandbox-connection.mjs`；键集指纹随正）∥ `docs/TEST-ENV-ECS.md`（节点侧 dockerd TLS 配置步骤 + 证书自备句）∥ ③ 披露（不阻塞）：材料只进不出（三件零回显／零回填；换材料 = 全列覆写）∥ 切换/编辑须当刻可达（自检为门——离线节点改不动，如实报）∥ 客户端证书认证 = 节点 dockerd 侧配置（在机；我方面只做客户端）∥ 缺省明文保持（零行为变化——用户「很喜欢现在这种方式」）∥ ④ 真机收口（父侧执行）：ECS `.6` 节点 dockerd TLS 就位 ⇒ 自签三件 ⇒ 控制台切档 ⇒ 自检过 ⇒ 全谱可用（读数/容器/镜像/终端）⇒ 切回明文（材料清零） | 披露 | 评审/用户复核 |

| R85 | **sandbox-container-terminal（需求档回笔 + 随正件 + 披露）**：① 需求档回笔（主 agent 笔——**已落**：`docs/server/requirements/PROJECT.md` 增**功能点 51 ∥ AC-51**（承 AC-50 顺序））；判据全文 = `sandbox/SANDBOX.md` §11 终端行 ∥ §12（N83–N85 ∥ B79–B81 ∥ E61–E63） ∥ ② 随正件（父侧/实施轮——以当刻盘面实读为准）：档目断言件（档目断言 **+6 名**——`terminal-core.mjs` ∥ `terminal-vt.mjs`（实拆） ∥ `terminal-codec.mjs`（实拆） ∥ `terminal-render.mjs` ∥ `terminal-link.mjs` ∥ `views-sandbox-terminal.mjs` ∥ 键集/键数指纹**已随正**——**1033 ∥ 1038**）∥ 同族指纹件（i18n 键数）随实施当刻复读 ∥ ③ 披露（不阻塞）：**前台进程不追捕**（断开时在跑的程序可能续存至自身退出——Docker exec 无情 kill 面；容器一次性沙盒兜底）∥ **pty 内容零留痕**（终端字节不落库不落日志——审计只记「谁何时进了哪台容器」）∥ 会话无持久化（重连 = 新会话）∥ 会话数无上限（内部自用）∥ `LANG` 条件注入（容器自带 locale 时零覆盖）∥ ④ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（容器行开终端 ⇒ `vim`/`top` ⇒ 中文输入 ⇒ 关窗收口 ⇒ 审计两行在册）+ 真机（ECS `.6`：非运行容器门 + 直连拒；关窗后 `docker exec` 进程零残留） | 披露 | 评审/用户复核 |

| R87 | **sandbox-onboarding-removal（需求档回笔 + 随正件 + 披露 + 部署收尾）**：① 需求档回笔（主 agent 笔——**文本已拟**：§5「接入两径」块改写为终态（手工登记 + 管理面 chat 承接；删「执行者」条与三态句）∥ AC-36 ⑨ 收正（⑩ 删）∥ §5 管理面用途行去「托管接入（装机）」∥ 功能点 47④ 合并方向句收正「已达成」；写法/计数 = 主 agent 定）∥ ② **删码清单（服务件——归并一处）＋随正件（父侧/实施轮——以当刻盘面实读为准）**：**删（已办）= 服务件两档（`onboarding` ∥ `onboarding-routes`）整档删 ∥ `thincoder-server/src/sandbox/routes.mjs`（**409**——托管接入四端点注册段删）**；随正件 = `runner-admin-console 托管接入件单测档`（**整档删**——任务面五工具/托管接入全链用例）∥ `…-runner-admin-console.test.mjs`（**复扫 = 档内零 onboarding/任务面引用 ⇒ 净变 ±0**——表/列面断言留；**491**）∥ `…-runner-admin-console-ui.test.mjs`（⑤ 弹窗 ∥ ⑥ 任务区用例删 + 首读断言改；**527** ⇒ 净变 ≤±40）∥ `…-console-tabs-component.test.mjs`（任务区/两钮/首读断言逐处；**493** ⇒ 净变 ≤±20）∥ `2026-10-12-team-projects-permissions.test.mjs`（`onboarding.mjs` 导入与用途删；**693** ⇒ 净变 ≤±20）∥ `2026-10-12-admin-chat-creds-merge.test.mjs`（N81 用例删——移交机制随件退场；CHECK/回填两用例留；**606** ⇒ 净变 ≤±20）∥ 键集/键数指纹件（`2026-10-08-server-public-structure.test.mjs` 等——键删后复读为准；**169** ⇒ 净变 ≤±20）∥ `2026-10-06-server-gateway.test.mjs`（表在场断言**留**——表存续；**496** ⇒ 净变 ±0）∥ ③ 披露（不阻塞）：**历史 `running` 残留行 = 永久静止**（重启恢复面消失——零改写）∥ 历史审计行五 kind 以原值可读（label 面已收——原值兜底）∥ 表零写入零读面（历史经库直读）∥ ④ 部署收尾（父侧执行）：镜像重建 + 重收敛 + 浏览器实走（运行面/任务区零残留 ∥ 添加/删除节点照常） | 披露 | 评审/用户复核 |

| R92 | → `sandbox/EXECUTION.md` §17（壳更新面——需求档回笔建议 ∥ 随正件 ∥ 披露 ∥ 真机收口；本域不重列） | 披露 | 评审/用户复核 |
