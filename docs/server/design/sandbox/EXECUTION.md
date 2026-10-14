# Thincoder Server · 沙盒执行面（sandbox/EXECUTION）

> 域 = sandbox（第二档）；控制面口径 ∥ 对象模型 ∥ 出站规则单源 = `sandbox/SANDBOX.md`（本档不复写）；
> 本档 = **执行面**（控制面 → 节点 / 盒的两条通道 + 盒内运行时通道 + 主机侧强制件 + 真机复证执行器）。
> 裁 = 用户 2026-10-10 19:52–19:56（「runner 就是 docker 的 api 节点」∥ 主机侧强制走 SSH ∥ 机器上不驻留进程）∥ 2026-10-10 16:28/16:32/16:36（盒内 agent = 核同件 + 最小壳）。
> 承批 = `docs/batches/2026-10-13-sandbox-exec-rebuild.md`（台账 #1373）；前情 = `docs/batches/2026-10-10-server-exec-sandbox.md` ∥ `docs/batches/2026-10-10-runner-admin-console.md`（执行面重定）。
> **最近先例（三坐标——实现坐标 ∥ 设计节 ∥ 先例批）**：
> ① **镜像族拉取径**（实现 = `thincoder-server/src/sandbox/docker.mjs:163`（`parseImageRef`——引用形校验）∥ `image-routes.mjs:85`（拉取形校验调用点）；设计 = `sandbox/SANDBOX.md` §3 镜像族/一键拉取块；先例批 = sandbox-image-sources ∥ sandbox-image-quick-pull）——**对齐** = 引用形校验前置（400 零外呼）∥ 拉取同步 10 分钟超时 ∥ 失败两形皆收（KD-SV-94）；
> **偏离** = 底座就位入建盒链（仅自定义底座——缺省零新增调用；理由 = 前提件 fail-closed，KD-SV-189）。
> ② **主机凭据面**（实现 = `thincoder-server/src/sandbox/hosts.mjs` ∥ `thincoder-server/src/store/credential-crypto.mjs`；设计 = `sandbox/SANDBOX.md` §3 主机凭据块；先例批 = admin-chat-creds-merge——KD-SV-133/134）——**对齐** = 加密复用 `credential-crypto.mjs` ∥ 密列零回显 ∥ 成事才审计；
> **偏离** = 键 = 注册表主机（非 SSH 主机）∥ 注入点 = 拉取头 `X-Registry-Auth`（非 exec 通道；理由 = Docker 按注册表主机寻址同口径，KD-SV-188）。
> ③ **节点侧构建流**（实现 = `thincoder-server/src/sandbox/docker.mjs:8`（头注：拉取同步 10 分钟 ∥ 失败两形 ∥ `findStreamError`）；设计 = 本档 §8 派生构建流；先例批 = sandbox-docker-admin——流解复用/拉取流扫描）——**对齐** = 流内错误两形逐帧扫描 ∥ 同步长超时常量；**偏离** = `POST /build` = 新增动作面（镜像族此前只读 + 拉取；理由 = 离线纪律下节点侧取件，KD-SV-185）。

## 1. 形态与三证（零驻留）

- **形态**：控制面（server 进程）对外三条腿——
  ① **Docker API 直调**（节点容器/网络/卷/镜像全族 + 盒生命周期动作；§2.1）；
  ② **SSH 主机侧执行**（逐条命令：卷目录准备 ∥ 磁盘限额 ∥ 出站闸下发；§2.2 ∥ §4 ∥ §5）；
  ③ **盒出向**（盒内壳 ∥ 模型调用 → server；server 侧 DNS 闸；§2.3 ∥ §6）。
- **零驻留三证**：
  ① **无 daemon**：节点机零我方进程（无 systemd unit ∥ 无监听 ∥ 无令牌）——历史 runner 通道已随 2026-10-10 清除，本批删净其残件（§9）；
  ② **无心跳**：节点存活 = 读时探活（KD-SV-80；本档 §7 实时门同源）；
  ③ **无领取方**：动作 = 请求内直调（Docker API/SSH），无队列消费者——`sandbox_tasks` 队列退场（KD-SV-161）。
- **集群化 = Docker 自家**（Swarm 不触；多节点 = 多登记行）；**边界** = 不自建机队/放置器（KD-SV-171 静态放置）∥ **连接面 TLS = 可选档（本增补 #2——缺省明文不变；机制 = `sandbox/SANDBOX.md` §3 连接方式块 ∥ 传输落点 = §2.1）** ∥ 不做跨机自动迁移（沿 §5 绑定即稳定）。
- **server 侧新监听 = DNS 闸 UDP 53**（§6——盒出向面，非公网面）；其余端口面零增。

## 2. 通道三件

### 2.1 Docker API（`docker.mjs`——既有客户端扩展）

- 既有：协商（KD-SV-81）∥ 读 3s ∥ 动作 15s ∥ 拉取 10 分钟 ∥ 容器/镜像/卷族。
- 本批增：`networks`（create ∥ inspect ∥ delete）∥ `archive`（get ∥ put——快照取件/恢复，流式）∥ `containerState`（读 `containers/<id>/json` 的 `State.StartedAt`/`ExitCode`——墙钟判据 ∥ 探针执行器读数）∥ 建盒参数面（`Env` ∥ `HostConfig` 全量：`Binds` ∥ `ReadonlyRootfs` ∥ `Tmpfs` ∥ `CapDrop` ∥ `NetworkMode` ∥ `Dns` ∥ 资源三件）。
- 动作超时（15s）覆盖建盒链的**单步**（链总 = 逐步自算）；快照流 ∥ 恢复流 = 专用长超时（10 分钟——沿拉取常量）。
- **连接面 TLS 档（本增补 #2——机制全文 = `sandbox/SANDBOX.md` §3 连接方式块；本段 = 传输落点）**：明文路径恒用注入 `fetchImpl`（**零行为变化**——归一/自检/落库/传输逐值同现状）；
  TLS 行 ⇒ `clientForRunner`/`selfCheckDocker` 先解材料（按行解密）再走**适配件** `httpsFetchOf(tls, { requestImpl })`——fetch 形最小件（`(url, { method, signal, headers, body }) → { status, text(), arrayBuffer() }`；底层 = `node:https`；`ca`/`cert`/`key` 逐值入选项）。
  两参透传（与 `fetchImpl` 同形）：`config`（解密材料所需——全链：路由族/盒链/管理面 chat `docker` 工具）∥ `requestImpl`（假件缝——缺省 `null` ⇒ `https.request`）；地址归一按档（`normalizeDockerAddress(raw, { tls })`——裸 host 补 scheme + 缺省端口 2375/2376；显式 scheme 与档相抵 ⇒ 形错）。

### 2.2 SSH（`ssh.mjs` + `hosts.mjs` `execOnHost`——既有）

- 凭据 = 主机表行（KD-SV-133/134）；传输 = 系统 openssh + 指纹 TOFU（KD-SV-85）。
- **host 径用途面（逐条命令，零驻留）**：① 卷目录准备（`mkdir -p` + `chown 1000:1000`）② 磁盘限额（§4）③ 出站闸下发（§5）④ 恢复清卷（`rm -rf <path>/*`——净恢复；§3 恢复行）⑤ 恢复备径（`archive` 被拒时的解包退路——§3 恢复行）。
- 大输出面不走 SSH（`SSH_OUTPUT_MAX` 20000 字符——快照/恢复走 Docker `archive` 流式径；本档定形）。

### 2.3 盒出向

- 盒 → server：模型调用（`OPENAI_BASE_URL` + 工作区 key）∥ 壳连接（`TC_SERVER_URL`）∥ DNS 查询（UDP 53 → server）。
- 三条 = 内置允许面（生命线——强制面总序已裁，见 SANDBOX §4）；盒无入向端口（沿需求 14:59 裁）。

## 3. 盒生命周期（动作表与直调链）

**底座**（每工作区一套）：卷 = 主机路径 `<workspaceRoot>/<ws-id>`（bind mount 到 `/workspace`——KD-SV-162）∥ 网络 = `tc-ws-<id>`（bridge；**桥名 `tcws<id>` = 闸匹配锚（§5）**）∥ 容器名 = `tc-ws-<id>`（引擎面唯一名——幂等采用判据）。
  桥名落地与复核：`networks/create` 载荷携 `Options: {"com.docker.network.bridge.name": "tcws<id>"}`；创建/采用（409 读回）后读 `networks/<id>` 复核 bridge name——不符 ⇒ **停**（锚零命中即规则全表不生效，fail-closed）。

| 动作 | 链（逐步直调） | 幂等/失败处置 |
|---|---|---|
| **建盒（创建工作区）** | ① 卷目录准备（SSH）② 配额就位（§4）③ 闸就位复核（§5）④ **镜像就位**（**仅自定义底座**——§8 底座可换块；缺省跳过）⑤ `networks/create` ⑥ `containers/create`（参数集见下）⑦ `start` | 任一步失败 ⇒ **停 + 人话（步名 + 原文）+ 审计**；行保留 ⇒ 重试 = 再走链（各步幂等：网络 409 ⇒ 采用 ∥ 容器名占用 ⇒ 读回采用 ∥ 派生 tag 在场 ⇒ 采用） |
| **启动** | 确保链 = ①→②→⑤→⑥→⑦（容器不在 ⇒ 建；自定义底座 ⇒ 先④；①②⑤ 幂等——在位即同结果） | 已在运行 ⇒ 200（noop）；`stop_reason` 清空 |
| **停止** | `containers/<id>/stop` | 未建/已停 ⇒ 200（noop）；`stop_reason='manual'`；**卷零触** |
| **销毁** | 确认门（`confirm:true`；读数 = 盒态 ∥ 快照数）⇒ ① 停（在运行者）② 删容器（force）③ 删网络 ④ 卷目录清理（SSH——**删卷 = 该显式确认项**）⑤ 行删（含快照行 + blob ∥ 待批行；key 吊销沿 §7 既有） | 中途失败 ⇒ 停 + 人话 + 行保留（重试续链）；审计 `workspace_destroy`（detail 携「卷已删」） |
| **轮换 key** | 吊销旧 + 签发新（既有）⇒ 重建 = 删容器 → ①→② → ⑥ → ⑦（自定义底座 ⇒ 先④——换底座生效径） | 卷保留；链中崩 ⇒ 行已持新 key、盒未起 ⇒ 重试「启动」 |
| **快照** | ① `archive get`（`/containers/<id>/archive?path=/workspace`——流式）② 服务端 gzip 落 `data/sandbox-checkpoints/<ws>-<id>.tar.gz` ③ 行落 `sandbox_checkpoints` | 容器不在 ⇒ 不拍（跳过 + 如实）；超单份上限（= 工作区 `diskMb` 配额——卷写受配额兜底 ⇒ 天然上界）⇒ 中止 + 不落行 + 审计告警；保留 = `checkpointKeep`（超出删最旧行 + blob） |
| **恢复** | ① 停盒 ② 清卷内容（`rm -rf <path>/*`——净恢复）③ 解包（`archive put`；引擎拒 ⇒ SSH 备径 `tar xzf -`）④ 启动 | 快照不存在 ⇒ 400 人话；解包失败 ⇒ 停 + 人话（卷内可能半新半旧——如实） |

**建盒参数集**（KD-SV-73 逐项落地——引擎请求体）：

```
Image  : <工作区底座>                           # 无绑定 ⇒ settings.image（thincoder-sandbox:1 缺省——零改）；有绑定 ⇒ 派生 tag（§8 底座可换块——④镜像就位步确保）
Env    : OPENAI_BASE_URL ∥ OPENAI_API_KEY（工作区 key 明文）∥ TC_SERVER_URL ∥ HOME=/workspace/home
Cmd    : 镜像 CMD（壳起——§8）；WorkingDir: /workspace
HostConfig:
  Binds            : ["<workspaceRoot>/<ws-id>:/workspace"]     # 唯一可写挂载
  ReadonlyRootfs   : true                                        # 根只读
  Tmpfs            : {"/tmp": "size=<tmpfsMb>m"}                 # tmpfs 例外（D1 披露保持）
  CapDrop          : ["ALL"]
  NetworkMode      : "tc-ws-<id>"
  Dns              : ["<server-ip>"]                             # DNS 闸（§6）
  Memory           : <memMb>M ; NanoCpus: <cpus> ; PidsLimit: <pids>
```
- `Binds` 源目录由 SSH 预建（缺失时引擎以 root 建目录 ⇒ 盒内 uid 1000 不可写——故卷目录准备为链首步）。
- **卷形式定形**（KD-SV-162）：工作区卷 = 主机路径绑定（生命周期/销毁语义随工作区）；「卷族」（容器面命名卷）与之并存不代管——卷区不列工作区卷、删卷防护零工作区感知（SANDBOX §15 登记项就此闭合）。
- **盒态读数**：读时读引擎（`containers/json` 按名匹配；不在 ⇒ 「未建」）；`stop_reason` = 服务器动作注记列（v22 增——非引擎态镜像；引擎态恒读时读）。
- **链前置（fail-closed）**：服务器地址（`config.host`）**非 IPv4 字面量（域名 ∥ IPv6）⇒ 建盒/启动确保/轮换重建三链链首停 + 人话**（零步执行——内置允许单（§5 位次②）与盒 DNS 注入（参数集 `Dns`）同源于该地址 ⇒ 双缺 = 盒静默断网；不静默建盒/起盒；地址修正后重试照常）。

**放置**（KD-SV-171）：候选 = `active` ∧ 在线（实时探活）∧ 已绑工作区数 < `maxBoxesPerRunner`；取已绑数最少（并列 ⇒ id 最小）；无候选 ⇒ 保持未绑 + 明示「待人放」（不降级）。
  触发 = ① 创建工作区 ② 工作区动作/起盒时读时 ③ 节点登记成功后后台补放置（不阻断响应；逐工作区失败 ⇒ 审计（kind = `placement_failed`——`accounts/ACCOUNTS.md` §2.1）+ **行留（绑定保留）**——与创建面同构（绑定先行；失败行留、重试续链幂等；父裁 2026-10-14）；「未绑」支 = 仅「无候选」由 §3 链前置明示）。**未绑工作区的动作 ⇒ 503 `sandbox_unavailable` 人话**（因一「先放置」——先放置再走链）。

**定时器**（服务器侧 ticker——30s 节拍；`bin` 装配）：
- ① **空闲停**：`now - last_active_at ≥ idleTtlMinutes` ⇒ 停（reason `idle_ttl`）。**`last_active_at` = 派生读——零新列（v22 段后列面零动）**，两源取大：
  **源一（模型调用）** = `SELECT MAX(ts) FROM usage WHERE key_id = <工作区 key>`（键级「最后使用」口径——索引 `idx_usage_key_ts` 即为此用，`store/STORE.md` §2 v3 段）；
  **源二（工作区动作行）** = `SELECT MAX(ts) FROM audit_events WHERE type='sandbox_event' AND json_extract(detail,'$.workspaceId') = <ws>`（工作区/盒/快照 kind 均携 `workspaceId`——键集 = `accounts/ACCOUNTS.md` §2.1）。
  两源皆无行 ⇒ 不触停（无从判——保守；实际不可达：起盒即动作行）；信号两类 = 工作区动作（管理/成员面）∥ 该工作区 key 的网关流量（长回合以请求首尾两跳触达）。
- ② **墙钟停**：引擎 `State.StartedAt` + `wallclockTtlHours` ⇒ 停（reason `wallclock_ttl`）。
- ③ **周期快照**：`checkpointEveryMinutes` 到期 ∧ 盒在场 ⇒ 拍（§3 快照链）。
- 重启语义：ticker 重建即可（无持久化状态；在途动作 = 请求内完成或如实失败）。

## 4. 主机侧件①：磁盘限额（`quota.mjs`）

- **取值**：`diskMb`（全局默认 ⇒ 每工作区覆写——既有取值序；生效 = 建盒/重建——② 配额就位步在三链在场（§3 建盒 ∥ 启动确保链 ∥ 轮换重建））。
- **机制（项目配额优先 ∥ loopback 备选——KD-SV-74）**：探明工作区根的文件系统与挂载选项 ⇒
  ① xfs（`pquota`）⇒ `xfs_quota` 项目配额（项目 id = `100000 + ws_id`——`project -s -p` + `limit -p bhard=<diskMb>m`）；
  ② ext4（`prjquota` 挂载）⇒ `chattr -R +P` + `setquota -P`；
  ③ 前两径皆不可 ⇒ **loopback**（镜像文件 + `mkfs.ext4` + 挂载到工作区路径——备选；落法细节实施当刻以真机探明为准）；
  ④ 三者皆不可 ⇒ **建盒停**（人话 + 处置句：节点需 xfs/ext4 项目配额或 loop 设备）。
- **读回核**：应用后读回配额读数（`xfs_quota report` 类）；读数不符 ⇒ 同停。
- **幂等**：重复应用同结果（project 已在 ⇒ 改限）；应用失败零残留（项目 id 与路径的绑定失败即报）。
- 判据：盒写超限 ⇒ ENOSPC（应用可见——E33 ∥ 探针 P7）。

## 5. 主机侧件②：出站闸本体（`egress.mjs`——求值 → 规则文本 → 下发）

- **求值单源** = `rules.mjs`（`listRules` ∥ `evaluateEgress` ∥ `HARD_DENY_CIDRS`——控制面与主机面同判；本档零第二求值）。
- **规则文本（nft——KD-SV-76 全量重算幂等）**：表 `inet thincoder_egress`；**基线链两条 = `hook forward` + `hook input`**（同锚 `iifname "tcws*"`、同盒链同位次；`forward` = 盒 → 外发向 ∥ `input` = 盒 → 宿主自身方向（**本机投递不经 forward**——P2 宿主 22 口即此向）；两条俱在方为「全协议/全端口」；主机自身与其他容器流量零涉）；盒链内位次 = 强制面总序（SANDBOX §4）：
  ① L1 不变量（`127.0.0.0/8` ∥ `169.254.0.0/16`）⇒ `drop`；
  ② 内置允许（server 地址:HTTP 口 + UDP 53）⇒ `accept`（**server 地址非 IPv4 字面量 ⇒ 建盒/起盒停**——链前置 = §3；内置允许与盒 DNS 同源、双缺）；
  ③ 显式 deny 行（`source != default`）⇒ `drop`；④ 显式 allow 行 ⇒ `accept`；⑤ 种子 deny 行（`source='default'`）⇒ `drop`；
  ⑥ 默认 ⇒ `drop`（全协议/全端口）。
  逐行端口/协议在场 ⇒ 收窄到该端口/协议；通配（单层左）在求值器内已归一为具体目标（主机侧只收具体 CIDR/IP 集）。
  域规则 ⇒ **服务端解析**（`node:dns`；3s 预算）⇒ 逐 IP 过 `evaluateEgress`（`host` 在场）⇒ 允许的 IP 入 allow 集；解析空 ⇒ 零 allow 条目（fail-closed）。
- **下发** = SSH 逐条：`command -v nft` 探（无 ⇒ iptables 备径：`TC-EGRESS` 链 flush + 重建，**两向同挂**——`FORWARD` + `INPUT` 各一跳入 `TC-EGRESS`（同锚 `-i tcws+`、同序 = 盒链位次照上；缺 `INPUT` 跳 ⇒ 盒 → 宿主自身方向裸奔））⇒ 删旧表（不存在 ⇒ 跳过）⇒ `nft -f -` 落全量定义（**两条基线链 + 盒链——单事务原子**）。幂等 = 重复下发同结果（零残渣）。
- **下发触发**：① 规则增删（写面——落库后同步下发，≤15s/节点、多节点并发；失败 ⇒ 行在 + 响应告警 + `egressState` 标「未就位」）② 待批裁定（§6——裁定后先下发再应答）③ 盒生命周期**就位复核**（建盒/启动前：进程内 per-node 记录 `{rulesRev, ok, at}` 对当前修订号；缺 ∥ 失败 ∥ 落后 ⇒ 先补下发；补发失败 ⇒ **停**（不建盒/不起盒——闸为盒前置，fail-closed）；**两基线链 + 盒链同事务落——复核即全覆盖**）；失败审计 kind = `egress_apply_failed`。
- **漂移披露**：外部手改节点 nft ⇒ 下次下发（全量重算）收正；两次下发之间 = 漂移窗（如实登——本批不做常驻守护/定时复核）。

## 6. 出站闸②：域名闸与待批（`dns-gate.mjs`——server 进程内 DNS 应答器）

- **面**：UDP 53（server 进程自持——`node:dgram`；零新进程 ∥ 零节点侧常驻）。盒内解析器 = 建盒 `Dns` 注入（§3）；盒内硬编码 DNS/DoH ⇒ 非白名单目标 ⇒ nft 默认拒（fail-closed）。
- **归属判**：收包源 IP ∈ 某工作区网络网段（建网络后读 `IPAM.Subnet` 记录于进程内 map；重启后按需重读）；非盒源 ⇒ 忽略（零答）。
- **请求处理**（全链 ≤ 60s 持答窗——`pendingTimeoutSeconds`）：
  ① 解析上游（3s 预算——答与判同源，零解析 ⇒ REFUSED）；
  ② `evaluateEgress`（`host` 在场；`builtinAllow` = 既有内置允许行）——
  - **放行**（`domain_allow`；或纯 CIDR 白名单回落：`domain_no_match` 时逐 IP 以 `host:null` 重判取允许子集）⇒ 确保该 IP 集在节点闸内（不在 ⇒ 同步补下发；补发失败 ⇒ REFUSED）⇒ 应答（TTL 60s）；
  - **显式拒**（`hard_deny` ∥ `domain_deny` ∥ `ip_deny` ∥ `unresolved`）⇒ REFUSED（**零挂起零待批**——L1/显式 deny 路径）；
  ③ **未命中**（逐 IP 亦无允许）⇒ **待批径**：`markPending`（同 host 去重 + `hits++`）⇒ **持答**（不立即回 REFUSED）⇒ 窗内裁定：
  - `once` ⇒ 临时放行（该 host 解析集入「临时集」，TTL = `RECENT_RESOLUTION_MS`（10 分钟）后消解并重算）⇒ 应答；
  - `remember` ⇒ 规则行（`source='approval'`）+ 下发 ⇒ 应答；
  - `deny` ⇒ REFUSED（后续同 host 再问 ⇒ 重开 pending）；
  - 超时 ⇒ REFUSED（pending 置 `timeout`）。
- **裁定抵达**：进程内等待表（`pendingId → 持答`）；管理员裁定 handler 落库后调 `dnsGate.notifyDecision(pendingId)` 回填。闸重启 ⇒ 持答丢（客户端重问即重判——行已裁定者按裁定答，零人工）。
- **边界**：UDP 只（答体小、无截断回退；TCP 53 不做——如实登，如遇解析不稳 ⇒ 补 TCP 单列）；DNS 闸**非强制点**（强制点 = nft——直连 IP 恒过 nft；DNS 闸 = 域名层准入 + 待批体验）。
- **预授权条目（项目登记）直通**（member-face-chat 批 · 裁定修订轮——来源 = 项目登记；单源 = `sandbox/SANDBOX.md` §4）：`source='project'` 行 = 普通 allow 行 ⇒ 走本链「放行」径（补下发 + 应答）——**非待批面**；非拉仓裸出站仍走③待批径（零变）。
- 复核面：超时清理沿用 `sweepPendingTimeouts`（待批读面续跑——既有）。

## 7. 写门实时化（KD-SV-166）

- `requireSandboxAvailable` ⇒ **异步实时探活**：候选节点（`active`）并发轻探（`GET /info`，3s）⇒ ≥1 在线 ⇒ 过；全离线 ∥ 无行 ⇒ 503 `sandbox_unavailable`（不降级——KD-SV-71 语义保持）。
- 绑定面动作（启动/停止/销毁/轮换/快照/恢复）⇒ 探**绑定节点**（离线 ⇒ 503 人话）；创建 ⇒ 探任一（放置取在线者）。
- 读面零门（运行面读数 = 读时探活如实，零门）；节点面恒可用（登记/删除不受沙盒门限制）。
- 代价如实：写请求最坏 +3s（探活窗）；不加缓存（写动作低频，零陈旧窗）。

## 8. 盒内运行时通道（核同件 + 最小壳）

- **镜像**（契约——落地 = member-face 批实施，其 §5 在册）：基座 `node:24-slim`（既有）∥ **核件同件**：构建期本地安装 `@thincoder/core`（构建上下文 = 仓根——离线可构建；核版本与 server 同源钉住）∥ 壳件 COPY 入镜像（`deploy/sandbox/member-shell/**`）∥ `USER 1000:1000` ∥ `WORKDIR /workspace` ∥ `CMD` = 壳起（容器起即连）。
- **env 契约**（建盒注入——§3 参数集）：`OPENAI_BASE_URL` = `<server>/v1` ∥ `OPENAI_API_KEY` = 工作区 key ∥ `TC_SERVER_URL` = `<server>` 基址 ∥ `HOME=/workspace/home`（核会话落卷——盒活则在）∥ 工作目录 `/workspace`。
- **进程形**：壳 = 单进程最小件（起核 agent ∥ 接 server 会话流 ∥ 带 server 域工具扩展）；**零第二循环**（能力面一律取核——16:36 硬口径；判据 = 凡「盒内另有一套」即违规）。
- **会话读写面（零回灌——题一裁定「会话真源在盒内」）**：壳 → 核 = **核既有导出件**（列表/读/存/删——`thincoder-core/session*.mjs`；保底坐标在册 = `agent/MEMBER-AGENT.md` §3.2；本档不复制坐标形）；壳零核文件直读写。**读写面本形即实施径**（核码零改）；原回灌缝随题一裁定消解（服务器零会话落库 ⇒ 零回灌需求）。
- **底座可换（sandbox-exec-rebuild 批 · 设计修订轮增补——用户 2026-10-13 21:32「底座那个做完整功能吧」；决策 = KD-SV-184…191，§15）**：
  - **底座指定形**（KD-SV-184）：**工作区级绑定** = `sandbox_workspaces.base_image`（NULL = 标准镜像 = `settings.image`——缺省零行为）；形 = `名[:标签]`（`parseImageRef` 同判——**实现 = `thincoder-server/src/sandbox/docker.mjs:163`**；`@` 拒 ∥ ≤ 200 字符），存归一形（缺标签补 `latest` 显式）；
    写面 = `PATCH …/workspaces/:id` 的 `baseImage` 键（值 `null` = 恢复标准）；
    **生效 = 下次建盒/重建**（沿资源覆写口径；重建径 = 既有「轮换 key」——零新动作）；存量行 NULL（迁移零行为）；**成员面零涉**（管理面专属）。
  - **件位契约**（标准镜像增补——落地 = member-face 批）：核 + 壳件位 = **`/opt/thincoder/app`**（核 = `node_modules/@thincoder/core` ∥ 壳 = `shell/**`）；CMD = `node /opt/thincoder/app/shell/index.mjs`；派生取件 = 单条 `COPY --from=<标准镜像> /opt/thincoder/app /opt/thincoder/app`（「核与 server 同源钉住」由标准镜像契约继承——零第二核源）。
  - **派生构建流**（KD-SV-185——节点侧 `POST /build`；**构建上下文 = 单 Dockerfile tar**——零源码上传 ∥ 零网络 ∥ 离线纪律沿既有）：
    ① 派生 tag = `thincoder-sandbox:base-<hash12>`（hash12 = `sha256("<base 引用>|<底座镜像 Id>|<标准镜像 Id>")` 前 12 hex——**内容寻址**；Id 读自节点镜像店）；
    ② **镜像就位四步** = 读底座（`GET /images/<base>/json`；404 ⇒ 拉取——命中私有仓凭据 ⇒ 携 `X-Registry-Auth`）⇒ 读标准镜像（`settings.image`——**供体 = 标准镜像**：node 件与件位件皆取自此像；404 ⇒ 停 + 人话「先备供体镜像」）⇒ 派生 tag 探（在场 ⇒ 采用——**零构建**）⇒ `POST /build?t=<tag>`（体 = tar；流内 `error`/`errorDetail` ⇒ 失败两形皆收——沿 KD-SV-94；超时 = 10 分钟专用常量）；
    ③ Dockerfile（服务端生成——**前提 = 乙（Node 随包带——KD-SV-187）**；校验层形 = 契约、实施可按等价改写，校验语义不变）：`FROM <base 引用>` ∥ **node 取件段** `COPY --from=<标准镜像> /usr/local/bin/node /usr/local/bin/node` ∥ 校验层 `RUN`（取件件可执行 ∧ 主版本 ≥24 ⇒ 过；**不可执行（musl/Alpine 等）∥ 无 shell 基底 ⇒ 层失败 + 人话**）∥
    件位段 `COPY --from=<标准镜像> /opt/thincoder/app /opt/thincoder/app` ∥ `USER 1000:1000` ∥ `WORKDIR /workspace` ∥ `CMD ["/usr/local/bin/node","/opt/thincoder/app/shell/index.mjs"]`（校验层与 `CMD` 同指取件件）；
    ④ builder 面 = 引擎缺省（legacy ∥ BuildKit 两路同形——`COPY --from=<本地镜像>` 件）。
  - **缓存与重建**（KD-SV-186）：派生 tag 在场 ⇒ 采用（重试幂等——自愈）；**标准镜像或底座内容变（镜像 Id 变）⇒ tag 变 ⇒ 重建触发**（核版本升 ⇒ 标准镜像重建 ⇒ Id 变——同链）；手动重建径 = 删派生镜像（既有删除面）后重跑 ∥ 节点重拉底座后再派生；**底座 tag 移动而节点本地旧像未换 ⇒ 采用本地旧像**（引擎缺省行为——如实披露）。
  - **底座前提 = 乙（Node 随包带——KD-SV-187；用户 2026-10-13 22:38 裁「乙」）**：**node 件随派生像自带**——取件段 `COPY --from=<标准镜像>` 补 node 运行件（件位 `/usr/local/bin/node`）；**校验层与 `CMD` 同指取件件**（绝对路径——零 PATH 依赖；基底自带 node 的新旧均不参与判）。
    **glibc 系底座限定**（musl/Alpine：取件件不可执行 ⇒ 校验层失败 ⇒ 如实拒 + 人话）；**基底须可执行 `RUN`（含 shell）**——无 shell 底座在校验层即失败，同列人话；建议自带 `git`/`curl`（拉仓/调试面需要，**不作硬校验**）。
    **节点前置 = 标准镜像在节点**（供体即标准镜像——本就必在节点 ⇒ 零新增前置；缺 ⇒ 停 + 人话「先备供体镜像」）。
  - **私有仓凭据**（KD-SV-188）：server 全局表 `registry_credentials`（键 = 注册表主机——归一：小写；Hub 别名归 `docker.io`）；AES-256-GCM（复用 `store/credential-crypto.mjs`——键文件同源）；**密列零回显**（响应/日志/审计零秘密）；
    **注入点 = 拉取**（底座预拉 ∥ 手动拉取命中也携 `X-Registry-Auth`——Hub 特例 `serveraddress` = `https://index.docker.io/v1/`；未命中 ⇒ 匿名——现状零改）；**构建零网络**（底座/标准镜像皆本地——不携）；源目录/标签读取仍匿名（私有源 ⇒ `auth_required` 如实——登记余项）。
  - **零行为变化腿**（判据）：无绑定 ⇒ ① 参数集 `Image` = `settings.image` 逐值不变；② 建盒链零新增调用（假件调用计数 = 现状序列）；③ 零新审计行；④ 迁移后存量行 `base_image=NULL`。
  - **边界**：构建进度流（同步请求——零 SSE/轮询）∥ 构建排期/并发闸（引擎自身排队）∥ 底座内容治理/扫描 ∥ 派生镜像源自动寻源（底座须已在节点 ∥ 经既有拉取面）∥ 派生镜像的跨节点分发（逐节点各自派生——tag 内容寻址保证同源）。

## 9. 存储与实现收正（v22 段 ∥ #1351 ∥ 拆案）

- **v22 段**（本批——实施次序在前，member-face-chat 批段顺延 v23）：
  ① `sandbox_workspaces` 重建：去 `required_labels_json`（列面收正在态——放置判据不再用标签）∥ 增 `stop_reason TEXT`（停因注记——服务器动作写；引擎态零镜像）；
  ② `sandbox_tasks` **DROP**（队列退场——KD-SV-161；`kind` 全集/幂等集/悬挂回收随删）；
  ③ **本增补 #2**：`sandbox_runners` 增连接材料四列（`tls_ca` ∥ `tls_cert` ∥ `tls_key_cipher` ∥ `tls_updated_at`——ALTER 加性；存量行 NULL ⇒ 明文档零回填）；
  ④ 结构单源 = `store/STORE.md` §2 v22 段（本档不复制 DDL）。
- **#1351 收正**：节点登记 handler = **单事务**（登记行 + 网段带入行 + `rulesRev` + 审计；任一抛 ⇒ 回滚 + 502 + 零残留——「先落库后带入」的无事务窗删净）。
- **拆案（触发线 700 已越——本批实施）**：`src/store/db.mjs` 迁移段外提 `src/store/migrations.mjs`（拟新增——纯搬移零语义；db.mjs 保开库/PRAGMA/语句封装/版本引用）；**命名单源 = `migrations.mjs`**（SANDBOX §13 旧称 `schema.mjs` 收正随拍）。
- 队列死件清理面：`registry.mjs`（`TASK_KINDS` ∥ `IDEMPOTENT_TASK_KINDS` ∥ `CLAIM_TIMEOUT_MS` ∥ `enqueueTask` ∥ `claimTasks` ∥ `reportTask` ∥ `sweepStuckTasks` ∥ `lastTaskView` ∥ 心跳块三件）∥ `routes.mjs`（两处展示面续跑调用）——全删。

## 10. 真机复证（探针执行器 + #1248/#1249 闭环）

- **执行器** = `thincoder-server/deploy/sandbox-probe.mjs`（跑法 = server 侧 `node deploy/sandbox-probe.mjs --server <base> --admin <user:pass> [--node <名|址>] [--repo <仓址>] [--target <域:端口>] [--p14]`；前置 = 一在线节点 + 闸已下发（执行器自跑下发步））。
- **盒内探针径** = 一次性探针容器（同镜像/同网络/同挂载，`Cmd` = 探针命令；读 `logs` + `State.ExitCode`；用毕删除）——**零 `docker exec`**（既有一致性 + 免 hijack 流面）；**宿主读数 = 取得宿主同一读数（执行器实形 = 一次性容器 + 宿主文件只读挂载——零 SSH 凭据依赖；宿主活态类读数无 P 行，不静默略过）**；服务端读数 = HTTP（P14）。
- **判据表** = SANDBOX §11 的 P1–P14（本档接续：P1/P8 按收窄口径重跑 ∥ P2/P3 复证修复（**P2 = 盒 → 宿主自身方向——`input` 链腿**；盒 → 外方向 = `forward` 链）∥ P9/P10/P11/P14 解锁四项 SKIP）。
- **闭环**：#1248（P2/P3）∥ #1249（P1/P8 重跑）**闭环批次 = 本批**（真机读数随收口轮回填）；SKIP 仍有无前置者 ⇒ 如实 SKIP（不假报）。
- 跑法环境 = `docs/TEST-ENV-ECS.md`（server `.5` ∥ 节点 `.6`；节点前置 = dockerd 监听 TCP——`ops/OPS.md` §5.10）。

## 11. 端点与响应形

机制面在本档；端点/请求/响应形单源 = `gateway/API.md` §2.5（含本批随正：工作区动作行改直调语义 ∥ 增快照列表行 ∥ 建工作区去 `requiredLabels`）。**本档不复制。**

## 12. 验收判据（需求 → 设计判据）

| 需求（`docs/server/requirements/PROJECT.md` §5 沙盒块 ∥ AC-36） | 设计级判据 | 载体 |
|---|---|---|
| ② 每工作区一盒 ∥ read-only ∥ 唯一可写挂载 ∥ 盒内零密钥 | §3 参数集逐项（引擎请求体断言）∥ §8 env 契约 | 单元测试档 + 收口轮 |
| ③ 出站两类同表 ∥ 默认全拒 ∥ 两闸 ∥ 即生效 ∥ 审计 | §5 位次 + 全量重算幂等（规则文本断言）∥ §6 放行/拒/待批三径 | 单元测试档 + 收口轮（P4/P11/P12） |
| ③ 强制面（L1 ∥ 内置允许 ≻ L2/L3 ∥ 零地址拒 ∥ 双径同判） | §5 位次（与 SANDBOX §4 同判——单源）∥ 就位检查 fail-closed ∥ 链前置（服务器地址非 IPv4 字面量 ⇒ 建盒/起盒停——§3） | 单元测试档 + 收口轮（P2/P3） |
| ④ 待批队列（三态 ∥ 60s ∥ 三次建议） | §6 待批径（持答 ≤60s ∥ 裁定三态 ∥ 去重/hits——行机制沿 SANDBOX §6） | 单元测试档 + 收口轮（P12） |
| ⑤ 资源上限（cpus/memory/pids/磁盘） + 双 TTL | §3 参数集资源三件 ∥ §4 配额（P7）∥ §3 定时器双 TTL | 单元测试档 + 收口轮（P7） |
| ① 容器强制无退路（无节点 ⇒ 仅沙盒面不可用） | §7 实时门（写 503 ∥ 读面零门 ∥ 节点面恒可用） | 单元测试档 + 收口轮（P14） |
| ⑦ 红队探针（判据收窄 + SKIP 前置） | §10 执行器 + P 表接续（#1248/#1249 闭环 = 本批） | 收口轮（真机） |
| 落地序（先于 #1215）∥ 与 CI 共用执行面（KD-SV-72） | §1 三证 ∥ §2 通道三件（CI 共用面 = 节点登记 + Docker 客户端 + SSH 传输；CI 语义另批） | 设计在档（下游 = member-face-chat 批实施前置） |
| 19:52–19:56 口径（Docker API 直调 ∥ 主机侧 SSH ∥ 零驻留） | §1 三证逐条 + §2/§4/§5 落点 | 设计在档 + 收口轮核读 |
| 16:36 硬口径（盒内必用 `@thincoder/core` + 最小壳） | §8 镜像/契约/进程形（零第二循环） | 单元测试档（契约面）+ 收口轮 |
| **底座可换**（用户 2026-10-13 21:32——管理面选底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起；缺省 = 标准镜像零行为变化） | §8 底座可换块（绑定 ∥ 件位契约 ∥ 派生四步 ∥ 缓存/重建 ∥ 前提（乙——Node 随包带） ∥ 凭据注入 ∥ 零变化腿）+ §3 参数集/建盒链 ④ | 单元测试档 + 收口轮（真机） |
| **连接面 TLS 档**（本增补 #2——用户 2026-10-13 22:43「让用户可选」；功能点 53 ∥ AC-53——拟入册） | §2.1 传输落点（适配件逐值 ∥ 两参透传 ∥ 明文路径零行为变化）+ `sandbox/SANDBOX.md` §3 连接方式块（形态/材料/写面/不变量/审计）；用例 = §13（N73 ∥ B76） | 单元测试档 + 收口轮（真机） |

## 13. 用例（本档——执行面）

| # | 类 | 面 | 输入 | 预期输出 |
|---|---|---|---|---|
| N65 | 正常 | 执行面 | 创建工作区（假 Docker + 假 SSH）：卷目录 ∥ 配额 ∥ 闸复核 ∥ 网络 ∥ 容器 ∥ 起 | 逐步调用逐条命中（`mkdir/chown` ∥ 配额命令 ∥ `networks/create` ∥ `containers/create` ∥ `start`）；容器体逐值 = §3 参数集；行绑定节点 + `stop_reason=NULL`；审计 `workspace_create` |
| N66 | 正常 | 执行面 | 动作全链：启动 ∥ 停止 ∥ 轮换 ∥ 快照 ∥ 恢复 ∥ 销毁（假件逐动作） | 引擎/SSH 调用逐条命中；停止 ⇒ `stop_reason='manual'`；快照 ⇒ blob 落盘 + 行 + size；恢复 ⇒ 停 ⇒ 清 ⇒ 解 ⇒ 起；销毁 ⇒ 删容器/网络/卷目录 + 行删（含快照行/blob/待批行） |
| N67 | 正常 | 执行面 | 闸下发（假 SSH）：规则表 = 显式 deny ∥ 显式 allow ∥ 种子 deny ∥ 域 allow 各一行 | 规则文本位次逐行断言（**两条基线链 = `hook forward` ∥ `hook input`**——同锚同盒链同位次；L1 → 内置允许 → 显式 deny → 显式 allow → 种子 deny → 默认拒）；域规则 IP 集 = 解析后过闸子集；`nft -f` 单次全量；重复下发 = 同结果 |
| N68 | 正常 | 执行面 | DNS 闸三径（假上游 DNS）：白名单域 ∥ 纯 CIDR 白名单域 ∥ 新域 | ① 直接应答 + 新 IP ⇒ 补下发在场；② 逐 IP 回落判 ⇒ 应答允许子集；③ 无 pending 行 ⇒ 持答（≤60s）⇒ 裁定 `once` ⇒ 应答；`remember` ⇒ 规则行（`source='approval'`）+ 下发 ⇒ 应答 |
| N69 | 正常 | 执行面 | 定时器：盒运行 + `last_active_at` 陈旧 ∥ 引擎 `StartedAt` 超墙钟 ∥ 周期快照到期 | 空闲 ⇒ 停 + `stop_reason='idle_ttl'`（无快照调用）；墙钟 ⇒ 停 + `wallclock_ttl`；快照到期 ⇒ `archive get` + 落盘 + 行；保留超 `checkpointKeep` ⇒ 最旧行 + blob 删 |
| N70 | 正常 | 执行面 | 放置：两节点（A 绑 2 ∥ B 绑 1，皆在线）⇒ 建工作区；节点登记后未绑工作区补放置 | 落 B（最少者）；并列 ⇒ id 小；补放置 = 后台链 + 失败逐个审计（kind `placement_failed`——一条/工作区）+ 响应零阻断 |
| B67 | 边界 | 执行面 | 建盒链任一步失败（配额不可用 ∥ 闸补发失败 ∥ 网络 409 ∥ 容器名占用） | 停 + 步名/原文人话 + 审计；行保留；重试续链（409/占用 ⇒ 采用读回）；**闸/配额失败 ⇒ 零建盒**（fail-closed） |
| B68 | 边界 | 执行面 | 未绑工作区的动作 ∥ `maxBoxesPerRunner` 已满 ∥ 全节点离线 | 503 `sandbox_unavailable` 人话（因一「先放置」——先放置再走链）∥ 候选排除 ⇒ 「待人放」明示（不降级）∥ 503（实时门） |
| B69 | 边界 | 执行面 | 快照越单份上限（`diskMb` 配额——假流大件）∥ 容器不在 | 中止 + 零行 + 审计告警（如实）∥ 跳过 + 响应注明（零假成功） |
| B70 | 边界 | 执行面 | 恢复：快照不存在 ∥ 引擎拒 `archive put`（走 SSH 备径） | 400 人话 ∥ 备径解包成功（同 blob） |
| B71 | 边界 | 执行面 | DNS 闸：L1 目标域（解析到 `127.0.0.1`）∥ 显式 deny 域 ∥ 非盒源查询 ∥ 持答 60s 超时 | REFUSED 且**零 pending 行**（零挂起）∥ 同前 ∥ 忽略（零答）∥ REFUSED + pending `timeout` |
| B72 | 边界 | 执行面 | 域解析空 ∥ 解析集部分被拒 | REFUSED（fail-closed——零放行）∥ 应答 = 逐 IP 过闸子集（其余剔除） |
| B73 | 边界 | 执行面 | 规则删行（deny 撤）⇒ 即生效 ∥ 盒在场不动 | 下发全量重算 + `egressState` 更新；盒零重建（P11 判据） |
| E50 | 错误 | 执行面 | 节点不可达（假 Docker 关停）⇒ 建盒 ∥ 动作 ∥ 快照 ∥ 恢复 | 502 `upstream_error` 人话（逐动作）；行/卷零变（不在中途留半态——失败步如实） |
| E51 | 错误 | 执行面 | SSH 失败（认证 ∥ 指纹变更 ∥ 超时）⇒ 卷准备/配额/闸下发 | 502/停 + 逐句人话（指纹 ⇒ 「重新信任」处置句）；零部分应用（下发 = 单事务） |
| E52 | 错误 | 执行面 | 登记带入事务（#1351）：带入行插入抛（假件） | 登记行零残留（回滚）+ 502 人话；重试不撞重名 |
| E53 | 错误 | 执行面 | 销毁未确认 ∥ `user`/无会话打新端点（快照列表） | 400（确认门）∥ 403 ∥ 401 |
| E54 | 错误 | 执行面 | v21 库升 v22（存量：含 `required_labels_json` 值行 ∥ `sandbox_tasks` 有行） | 工作区行逐值保形（去列）；`sandbox_tasks` 表消；再开幂等零变；迁移段 = `migrations.mjs` |
| E55 | 错误 | 执行面 | 探针执行器：无在线节点 ∥ 前置缺（`--repo` 未给） | 逐条 SKIP + 退出码如实（零假 PASS） |
| N71 | 正常 | 执行面（底座可换） | 派生构建全链（假 Docker）：设底座 ⇒ derive —— 底座缺 ⇒ 拉取（携凭据头）∥ 读标准镜像 Id ∥ 派生 tag 探（缺）⇒ `POST /build` | Dockerfile 文本逐行断言（`FROM` ∥ **node 取件段 `COPY --from=<标准镜像> /usr/local/bin/node /usr/local/bin/node` 逐值** ∥ 校验层（取件件可执行 ∧ 主版本 ≥24） ∥ `COPY --from=<标准镜像> /opt/thincoder/app …` ∥ `USER 1000:1000` ∥ `WORKDIR /workspace` ∥ `CMD`）；`t=<派生 tag>` 逐值；响应 `{ tag, cached: false }`；审计 `image_derive` |
| N72 | 正常 | 执行面（底座可换） | ① tag 在场 ⇒ derive（缓存）② 建盒链两腿：自定义底座 ∥ 缺省（无绑定） | ① 零 `POST /build` 调用（`cached: true`——幂等）② 自定义腿：④ 镜像就位调用在场 + `containers/create` 体 `Image` = 派生 tag 逐值；**缺省腿：零 ④ 调用 + `Image` = `settings.image`——调用序列 = 现状（零行为变化腿）** |
| B74 | 边界 | 执行面（底座可换） | **乙档失败形**：**musl/Alpine 底座（取件件不可执行——校验层失败）** ∥ **无 shell（`RUN` 不可执行——同层失败）** ∥ **供体不在节点（= 标准镜像）** ∥ 未绑定节点 | 层失败 ⇒ 停 + 人话（步名 + 日志尾 + 「底座需可执行 `RUN`（含 shell）且 glibc 系（musl/Alpine 不支持）」处置句）+ 行保留（重试续链）；供体缺 ⇒ 400 人话（「先备供体镜像」）；未绑定 ⇒ 400 人话（先建盒/放置） |
| B75 | 边界 | 执行面（底座可换） | 底座引用形非法（`@` ∥ 超长 ∥ 空）∥ 无自定义底座却调 derive | 400 零外呼（形校验先于一切节点调用）；无绑定 ⇒ 400 人话（「该工作区为缺省标准镜像」） |
| E56 | 错误 | 执行面（底座可换） | 底座拉取失败（凭据错 ⇒ 引擎 401 原文）∥ 节点不可达 | 400 携引擎原文（人话——「凭据不符？」处置句）∥ 502（沿 E50 口径）；行/卷零半态 |
| E57 | 错误 | 执行面（底座可换） | 构建流内 `error`（假件）∥ 构建超时（假件不结） | 400 人话含日志尾 ∥ 502 + 如实句（引擎侧可能仍在跑——重试幂等：tag 在场即采用） |
| N73 | 正常 | 执行面（连接面 TLS 档） | 假件 https 请求件（记 `requestImpl` 选项）：添加节点携 `connection:"tls"` + 三件（CA/证书/私钥）⇒ 自检三呼（引导步 → 协商 → 复读）⇒ 落行 ⇒ 探活复用适配件 | `https.request` 选项 `ca`/`cert`/`key` 逐值（= 提交值——加密往返后解密同值）∥ URL 逐值（`https://` + `v<ver>` 前缀形）；行 `tls_updated_at` 在场 ∧ `tls_key_cipher` ≠ 明文（回读库断言）；响应行形含 `connection:"tls"` + `tls.state:"sealed"`（**零材料字段**——响应键面扫描）；审计 `runner_add` detail `tls:true`；`PUT …/connection` 切回明文 ⇒ 三列零化 + 审计 `runner_connection`（`tls:false`） |
| B76 | 边界 | 执行面（连接面 TLS 档） | **明文档零行为变化腿**：不携 `connection`/`tls` 键的添加（既有调用形）⇒ 全链 | 归一地址逐值同现状（`http://` + 2375）∥ 传输 = 注入 `fetchImpl`（**零适配件构造**——调用计数）∥ 行 `tls` 三列全 NULL（`tls.state:"none"`）∥ 审计 `runner_add` detail `tls:false` ∥ v22 升库后存量行读面逐值（零回填） |
| B77 | 边界 | 执行面 | 服务器地址非 IPv4 字面量（`config.host` = 域名 ∥ IPv6）⇒ 建盒 ∥ 启动确保 ∥ 轮换重建 | 停 + 人话（零步执行——零 Docker/SSH 调用）；行保留（未绑/未建）；地址修正后重试照常 |

## 14. 本域文件与行数预算（执行面）

| 档 | 行数 | 职责 |
|---|---|---|
| `thincoder-server/src/sandbox/box.mjs`（拟新增） | ≈**315**（≈280 + **+≈35**（本增补：镜像就位步 ∥ 参数集底键解析）） | 盒生命周期动作链 ∥ 建盒参数集 ∥ 放置与补放置 ∥ 卷目录准备 ∥ 定时器（空闲/墙钟/周期快照） |
| `thincoder-server/src/sandbox/quota.mjs`（拟新增） | ≈**120** | 磁盘限额（探明 ∥ 项目配额/loopback ∥ 读回核） |
| `thincoder-server/src/sandbox/egress.mjs`（拟新增） | ≈**220** | 规则文本生成 ∥ 下发（nft/iptables）∥ 就位检查 ∥ apply 状态 |
| `thincoder-server/src/sandbox/dns-gate.mjs`（拟新增） | ≈**220** | DNS 应答器 ∥ 归属判 ∥ 待批持答/裁定回填 ∥ 临时集 |
| `thincoder-server/src/sandbox/workspace-routes.mjs`（拟新增） | ≈**280**（≈190 + **+≈90**（本增补：`baseImage` 键 ∥ derive 端点 ∥ 列表行字段）） | 工作区面四路由 + 快照列表（自 `routes.mjs` 拆出——拆案首选执行 + 重写为直调） |
| `thincoder-server/src/sandbox/derive.mjs`（拟新增——本增补） | ≈**200** | 底座可换：派生 tag 计算 ∥ Dockerfile 生成 ∥ 上下文 tar ∥ 镜像就位四步 ∥ 构建流解析（§8 底座可换块） |
| `thincoder-server/src/sandbox/registry-creds.mjs`（拟新增——本增补） | ≈**130** | 私有仓凭据：形校验 ∥ 主机归一/判据 ∥ 加密 CRUD（复用 `credential-crypto.mjs`）∥ `X-Registry-Auth` 组装 |
| `thincoder-server/src/sandbox/registry-cred-routes.mjs`（拟新增——本增补） | ≈**110** | 私有仓凭据四端点（列/增/改/删——响应零秘密） |
| `thincoder-server/src/sandbox/registry.mjs`（现读 **564**） | **≈ 380**（净 −≈180：队列/心跳死件删；+ 实时门 ∥ 放置收正）；**本增补 #2 +≈30**（材料列写入 ∥ 行形增 `connection`/`tls` 元数据）⇒ ≈**410** | 登记/读数/可用性/放置 |
| `thincoder-server/src/sandbox/routes.mjs`（现读 **477**） | **≈ 340**（净 −≈137：工作区面拆出；动作响应形随正）；**本增补 #2 +≈55**（连接方式端点 ∥ 添加节点体扩）⇒ ≈**395** | 余面端点 |
| `thincoder-server/src/sandbox/docker.mjs`（现读 **333**） | **≈ 490**（+≈95：networks ∥ archive ∥ containerState ∥ 建盒参数；**本增补 +≈60**：`buildImage` ∥ 镜像详情读 ∥ 拉取 `auth` 参）；**本增补 #2 +≈25**（地址归一按档 ∥ 传输两参注入）⇒ ≈**515**（越 500 软线——拆案 = `sandbox/SANDBOX.md` §13 句） | Docker 客户端 |
| `thincoder-server/src/sandbox/docker-tls.mjs`（拟新增——本增补 #2） | ≈**220** | 连接面 TLS：三件形校验 ∥ 材料加解密存取（复用 `credential-crypto.mjs`）∥ 连接元数据视图 ∥ `node:https` 传输适配件（§2.1 ∥ `sandbox/SANDBOX.md` §3） |
| `thincoder-server/src/sandbox/image-routes.mjs`（实读 **132**） | **≈ 150**（**本增补 +≈18**：拉取凭据注入 ∥ 审计 `auth` 键） | 镜像族路由（§3） |
| `thincoder-server/src/sandbox/container-routes.mjs`（实读 **324**） | 本批触碰（清单外）：`config`/`requestImpl` 两参透传（TLS 档） | 容器面路由（§3） |
| `thincoder-server/src/sandbox/volume-routes.mjs`（实读 **103**） | 本批触碰：同上（两参透传） | 卷族路由（§3） |
| `thincoder-server/src/sandbox/terminal-routes.mjs`（实读 **342 ⇒ 362**） | 本批触碰：两参透传 + **TLS 终端腿 +20**（材料感知升级传输 `execUpgradeTransportFor`——收口修复轮随正；设计记四路由各 +≈3 = 低估） | 容器终端升级路（§9 ∥ `sandbox/SANDBOX.md` §3） |
| `thincoder-server/src/agent/chat-tools.mjs`（实读 **504**——**越 500 软线在册**） | 本批触碰：`config`/`requestImpl` 透传（管理面 chat `docker` 工具——TLS 材料解密；域账 = `agent/ADMIN-AGENT.md` §6） | agent 工具面 |
| `thincoder-server/src/agent/chat.mjs`（实读 **692**——`+1` 行透传；**越 500 软线在册**） | 本批触碰：同上 | agent chat 驱动 |
| `thincoder-server/src/sandbox/hosts.mjs`（实读 **134**） | 本批触碰：`stdin` 透传（恢复备径 sudo 口令行） | 主机凭据面（§2.2） |
| `thincoder-server/src/sandbox/ssh.mjs`（实读 **229**） | 本批触碰：`stdin` 透传（载荷体） | SSH 传输（§2.2） |
| `thincoder-server/src/store/db.mjs`（现读 **688**） | **≈ 300**（拆案：迁移段外提 `src/store/migrations.mjs`（拟新增）≈**470**——纯搬移 + v22 段 + **本增补 +≈40**（`base_image` 列 ∥ `registry_credentials` 建表）；**本增补 #2 +≈10**（连接材料四列 `ALTER`）⇒ ≈**480**） | 开库/PRAGMA/语句封装 |
| `thincoder-server/deploy/sandbox-probe.mjs`（已落——本批） | ≈**320 ⇒ 实读 679**（2026-10-14——**越 500 软线在册**） | 探针执行器（P1–P14 驱动 ∥ 一次性容器径 ∥ PASS/FAIL/SKIP/退出码） |
| `thincoder-server/bin/thincoder-server.mjs`（现读 **214**） | **≈ 229**（+≈12：ticker ∥ DNS 闸装配 ∥ 新路由注册；**本增补 +≈3**：registry-cred 路由注册）**⇒ 实读 243**（2026-10-14） | 装配 |
| `thincoder-server/deploy/sandbox/Dockerfile`（现读 **19**） | **≈ 32**（落地 = member-face 批，其 §5 在册——本档定义契约） | 盒镜像 |
| **小计** | **≈ +2221**（= 分项和：本批实施段 ≈**+1180**（新五档 1030 ∥ `registry` −184 ∥ `routes` −137 ∥ `docker` +97 ∥ `db` 净 +42 ∥ probe +320 ∥ `bin` +12）∥ **本增补（底座可换）≈+686**（三新档 ≈440 + 五行 delta ≈206〔box ∥ workspace-routes ∥ docker ∥ bin ∥ image-routes〕+ 迁移段 +≈40）∥ **本增补 #2 ≈+355**（`docker-tls.mjs`（拟新增）≈220 + 六处 delta ≈135——`routes` +≈55 ∥ `registry` +≈30 ∥ `docker` +≈25 ∥ `migrations` +≈10 ∥ 容器/镜像/卷/终端四路由（各 +≈3）≈12 ∥ 盒链 `config` 透传 +≈3；webui 面 = `webui/WEBUI.md` §5）；契约面镜像 delta（Dockerfile +≈13）归 member-face 批账） | —— |
| **单元测试档（本批——入批档 §2）** | `docs/batches/2026-10-13-sandbox-exec-rebuild.test.mjs` ≈**620**（动作链 ∥ 参数集 ∥ 放置 ∥ 定时器 ∥ 实时门 ∥ v22 迁移 ∥ #1351 事务 ∥ 拆案读判）∥ `…-egress.test.mjs` ≈**330**（规则文本/位次 ∥ 下发幂等 ∥ DNS 闸三径 ∥ 待批持答 ∥ 解析过滤）∥ **`…-base.test.mjs` ≈320**（本增补——派生 tag/Dockerfile 逐行 ∥ 镜像就位四步 ∥ 凭据 CRUD/注入 ∥ 绑定 PATCH ∥ 零变化腿）∥ **`…-base-ui.test.mjs` ≈220**（本增补——两卡渲染 ∥ 弹窗 ∥ i18n 键集）∥ **`…-tls.test.mjs` ≈180**（本增补 #2——三件形校验/加密往返 ∥ 适配件选项逐值（假 `https.request`）∥ 连接端点两腿 ∥ 明文零行为变化腿）∥ **`…-tls-ui.test.mjs` ≈140**（本增补 #2——添加窗连接段 ∥ 行「连接」钮 ∥ 编辑窗 ∥ i18n 键集）——**收口实读（2026-10-14）：主体 795 ∥ `-egress` 427 ∥ `-base` 543 ∥ `-base-ui` 437 ∥ `-tls` 711 ∥ `-tls-ui` 378；越 500 软线在册 = 主体 ∥ `-base` ∥ `-tls`** | 随批档存 |

（**收口实读（2026-10-14——本批实施末，逐档；口径 = 内容行（doc-check 同径））**：`box` 667 ∥ `quota` 118 ∥ `egress` 372 ∥ `dns-gate` 359 ∥ `workspace-routes` 313 ∥ `derive` 243 ∥ `registry-creds` 174 ∥ `registry-cred-routes` 95 ∥ `docker-tls` 133 ∥ `docker` 422（低于 ≈515 投影——`sandbox/SANDBOX.md` §13 拆案句随复读） ∥
  `registry` 419 ∥ `routes` 413 ∥ `image-routes` 144 ∥ `db` 36 ∥ `migrations` 710（越 STORE §4 拆案线——#1385 登记 711 为 read 口径，±1 差在案）；档位超线在册 = `box` ∥ `migrations` ∥ `chat-tools` ∥ `chat` ∥ `probe` ∥ `-tls` 单测（#1385 族）。小计列 = 设计估和——实读总账以盘面复读为准。）

## 15. 关键决策（本域——执行面）

| # | 决策 | 理由 | 被否候选与何故否 |
|---|---|---|---|
| KD-SV-160 | **执行面三腿 = Docker API 直调 ∥ SSH 主机侧 ∥ 盒出向**；零驻留三证（无 daemon ∥ 无心跳 ∥ 无领取方） | 用户 19:52–19:56 口径逐条落地；三证 = 可机检口径（无 unit/无心跳列/无消费者） | 节点侧常驻 runner（口径已排除——否）；心跳/长轮询（通道已废——否） |
| KD-SV-161 | **指令队列退场 = `sandbox_tasks` 删表**（动作 = 请求内直调链；动作响应 = 动作读数） | 零驻留 ⇒ 零领取方 ⇒ 队列 = 死状态；表在 ⇒ 认知负担 + 漂移源（无消费者却可被写） | 保留为「动作记录」（审计已担此职——否）；去 `claimed_at` 留表（仍无消费者——否） |
| KD-SV-162 | **工作区卷 = 主机路径绑定**（`<workspaceRoot>/<ws-id>`；卷族命名卷并存不代管） | 配额（项目配额锚路径）∥ 快照/恢复 ∥ 卷目录准备三面皆以路径为准；卷族↔工作区关系登记项就此闭合 | Docker 命名卷（配额锚 `/var/lib/docker` 偏斜 ∥ 生命周期归引擎而非工作区——否） |
| KD-SV-163 | **磁盘限额 = 项目配额优先 ∥ loopback 备 ∥ 皆不可则停**（建盒前置） | KD-SV-74 落地；E33/P7 判据要真限；fail-closed 沿闸同款 | 无配额跑（判据破——否）；告警不拦（名义强制——否） |
| KD-SV-164 | **出站闸主机侧本体 = nft 全量重算幂等**（iptables 备）；链位次 = L1 → 内置允许 → 显式 deny → 显式 allow → 种子 deny → 默认拒；盒锚 = `tcws*` 网桥 | KD-SV-76 落地 + SANDBOX §4 总序逐位；`iifname` 锚 = 主机自身流量零涉（不锁死宿主） | 全局 forward 默认拒（锁死宿主/其他容器——否）；逐盒 veth 名锚（名不稳——否） |
| KD-SV-165 | **域名闸 = server 进程内 DNS 应答器**（盒 DNS 指向 server）；挂起 = 持答 ≤60s；即生效 = 裁定后先下发再应答；L1/显式 deny ⇒ 零挂起 | 待批队列要「看见域名」+「挂起连接」——无驻留进程下唯一可行点 = DNS 层（server 侧）；nft 仍是强制点（直连 IP 恒过闸） | 节点侧 DNS 代理进程（零驻留口径排除——否）；纯 IP 面（域名待批不可行——否）；应用层代理（非 HTTP 协议失真——否） |
| KD-SV-166 | **写门 = 实时探活**（写动作/创建前置；3s；不降级；零缓存） | KD-SV-80 同源（读时探活）；静态判据（存在 active 行）放行离线节点 = 假可用 | 静态判据（既有缺陷——否）；缓存/陈窗口（新陈旧源——否） |
| KD-SV-167 | **动作 = 幂等直调链**（目标态已成立 ⇒ 200 noop；中途失败 ⇒ 停 + 行保留 + 重试续链）；销毁 = 确认门 + 全清；拆盒永不删卷 | 无队列 ⇒ 重试 = 再走链；幂等采用（409/占用）免半态；卷保留沿 KD-SV-67 | 强制先删后建（半态更多——否）；事务式跨机回滚（跨节点无事务——不可行） |
| KD-SV-168 | **快照 = Docker `archive` 取件 + 服务端 gzip 落盘**（恢复 = 清 + 解 + 起；触发 = 周期 + 拆前；销毁不拍） | 容器在场即可取件（零 exec ∥ 零 SSH 大输出）；非 git 工作区同覆盖面（旧「git 包」两边界随之消解）；销毁 = 确认门已明示（再拍无益） | git 工作区包（需盒内 git 通道 + 非 git 无保护——否）；SSH tar 大输出（输出上限 + 二进制面——否） |
| KD-SV-169 | **空闲信号 = `last_active_at`**（动作 ∥ 该工作区 key 的网关流量两类）；墙钟 = 引擎 `StartedAt`；ticker = server 侧 30s | 需求「无 exec 且无代理流量」的可实现形（代理流量 = 网关记账点——单源已有；**取数 = 派生读两源**（usage 键索引 `idx_usage_key_ts` ∥ 审计动作行 `detail.workspaceId`）——零新列，§3）；墙钟取引擎读数（零新状态） | CPU/网络统计断空闲（代理调用 CPU≈0 ⇒ 误杀——否）；跨域会话信号直连（耦合 + 双源——否） |
| KD-SV-170 | **盒运行时通道 = 核同件 + 最小壳**（镜像契约 + env 契约 + 进程形；会话读写面 = 核既有导出件（零回灌）——核码零改） | 16:36 硬口径；会话真源在盒内（题一裁定）⇒ 读写面经核导出件直用（零阻塞；回灌需求零） | 新缝先行（核码改动 + 阻塞下游——否）；盒内另套会话件（「另有一套」违规——否） |
| KD-SV-171 | **放置 = 在线 active 中最少绑定者**（并列 id 小）+ 容量 `maxBoxesPerRunner`；无候选 ⇒ 待人放 + 明示（不降级）；补放置 = 登记后后台 + 动作时读时 | 需求「盒数最少者」落地；零调度器（边界）；容量 = 防吃光第三层（16:19 需求） | 标签放置（列面已收正——否）；降级放置（跨机绑定失稳——否）；队列排等（队列退场——否） |
| KD-SV-172 | **真机复证 = 探针执行器 + 一次性容器径**（探针命令进 `Cmd`，读 logs/ExitCode；零 `docker exec`） | 免 hijack 流实现面（fetch 客户端零改动风险）；同镜像/同网络/同挂载 ⇒ 盒等价面；P14 走 HTTP（读面判据） | `docker exec` 通道（流面复杂 + 新通道——否）；宿主侧脚本（盒内隔离面无覆盖——否） |
| KD-SV-173 | **迁移段外提 `src/store/migrations.mjs`（拟新增）**（触发线 700 已越——本批实施；命名单源 = `migrations.mjs`） | STORE §4 触发条件达成；append-only 段链外提 = 纯搬移零语义；两档命名分歧（`schema.mjs`）收正为单源 | 维持 db.mjs 独档（越线不自拆——违结构纪律——否）；延后（成员面批增量落在同档 ⇒ 越线不回——否） |
| KD-SV-174 | **#1351 = 登记带入单事务**（行 + 带入 + 修订号 + 审计；失败整滚） | 无事务窗 ⇒ 半态（行在段未带）实际发生过；改后零残留可重试 | 补偿删除（第二机制——否）；接受窗（幂等续跑已不在——无消费者——否） |
| KD-SV-184 | **底座可换 = 工作区级绑定**（`sandbox_workspaces.base_image`——NULL = 标准镜像 `settings.image`；写面 = PATCH `baseImage` 键；生效 = 下次建盒/重建） | 用户 21:32 口径「用户可能会需要选择他自己需要镜像做底座」——选择粒度 = 工作区（每盒一像）；缺省 NULL ⇒ 零行为变化（判据腿在册）；写面沿既有 PATCH（零新端点面） | 节点级/全局级绑定（一处换全体换——用户语义 = 「用户自己需要」粒度；否）；独立镜像清单表（第二登记面——引擎即真源；仓库引用即标识，否）；成员面选择（管理面专属——用户禁项） |
| KD-SV-185 | **派生构建 = 节点侧 `POST /build` + 多阶段取件**（上下文 = 单 Dockerfile tar；件自标准镜像 `COPY --from` 取——件位 `/opt/thincoder/app` 契约；tag = `thincoder-sandbox:base-<hash12>` 内容寻址） | 离线纪律沿既有（零源码上传 ∥ 零网络 ∥ 零第二核源——核/壳自标准镜像单源）；节点侧构建 = 底座像本就在节点、与拉取面同机（预构建分发/推送机 = 另立级）；内容寻址 ⇒ 幂等 + 可判缓存 | 服务端预构建 + 分发（server 零 Docker 依赖被破 + 分发机制/registry 面——否）；构建上下文上传核/壳包（壳件不入包——分发面白造；取件版更小，否）；`docker build` 走 SSH（零驻留面重复——Docker API 原生有 build，否） |
| KD-SV-186 | **缓存与重建 = 内容寻址自动失效**（tag 在场 ⇒ 采用；标准镜像 ∥ 底座 Id 变 ⇒ tag 变 ⇒ 重建；手动重建 = 删派生镜像后重跑） | 「核版本升 ⇒ 重建触发」落地 = 标准镜像重建（Id 变）自动传导——零版本号比对机制；重试幂等（tag 在场即采用——自愈） | 版本号字段比对（第二状态源——漂移面，否）；定时重建（无谓构建——否）；底座 tag 远端追新（每次构建前 probes registry——慢 + 网络面，否——披露在册） |
| KD-SV-187 | **底座前提 = 乙（Node 随包带——选定）**：取件段 `COPY --from=<标准镜像>` 补 node 运行件（`/usr/local/bin/node`；校验层与 `CMD` 同指取件件）；glibc 系限定（musl/Alpine ⇒ 校验层失败如实拒）；节点前置 = 标准镜像在节点（供体即标准镜像——零新增前置） | 用户 2026-10-13 22:38 裁「乙」：现成镜像绝大多数不含 Node——甲 = 用户先自烤带 Node 的底座，「完整功能」落空；供体取标准镜像 = 零新增前置（本就必在节点）+ 件位同源（核/壳/node 件自同一像） | 甲（自带 Node ≥24）= 呈裁项用户择乙（历史归记录面——批档 §1）；供体 = `node:24-slim`（另备一像——多一条节点前置，否）；静默装 Node（apt/npm 网络面 + 离线纪律破，否） |
| KD-SV-188 | **私有仓凭据 = server 全局表（按注册表主机）+ 拉取注入**（`registry_credentials`；AES-256-GCM 复用 `credential-crypto.mjs`；密列零回显；`X-Registry-Auth`；构建零网络不携） | 用户口径「私有仓凭据」——按注册表主机 = Docker 同口径（一主机一枚）；加密/掩蔽/审计全沿主机凭据先例（KD-SV-84 单源）；注入点 = 拉取（底座预拉 ∥ 手动拉取）——构建不需要（像已本地） | 按源清单/按节点存凭据（重复 + 与寻址不一致——否）；凭据入节点 `~/.docker/config.json`（机器侧改——禁，沿 KD-SV-96 同款）；目录/标签读取也携凭据（本增补边界外——登记余项） |
| KD-SV-189 | **建盒链增「④ 镜像就位」步——仅自定义底座**（缺省路径零新增调用；失败 ⇒ 停 — fail-closed） | 缺省零行为变化腿的机制保障（判据可机检 = 调用计数）；fail-closed 沿配额/闸同款（前提件不就位 ⇒ 不建盒） | 建盒时懒拉底座（不预拉——首盒静默慢；且静默网络行为不可见——否）；就位失败告警不拦（名义可用——否） |
| KD-SV-190 | **控制台面 = 标签②两卡**（「盒底座镜像」∥「私有仓凭据」——管理面；成员面零涉） | 镜像族家 = 标签②「镜像与镜像源」（底座/派生像 = 镜像面）；工作区面尚未落（②–⑥ 余面批）⇒ 底座绑定写入口落此处（随工作区面落定可再指——本增补不预设）；成员面零涉 = 用户禁项 | 工作区面内（未落盘——本批无法端到端，否）；新开管理页（nav +1 ∥ 一页一职责已足，否）；节点行展开内（全局面/工作区级绑定错位，否） |
| KD-SV-191 | **审计 = 四 kind + `image_pull` 增 `auth` 键**（`workspace_base` ∥ `image_derive` ∥ `registry_credential_set` ∥ `registry_credential_revoke`；kind 非枚举——CHECK 零动；成事才落——缓存命中/失败不落，沿既有成事才审口径） | 过程留痕口径（换底座/构建/凭据三面可查）；零秘密（detail 无口令字段）；缓存命中不落 = 零噪声（无动作发生） | 失败也落行（失败已在响应人话面 + 无状态变更——否）；合一 kind（三面回查粒度丢——否） |
| KD-SV-192 | **连接面 = 节点级二择 + 地址 scheme 单源**（`http` = 明文缺省 ∥ `https` = TLS；不设 mode 列；裸 host 按档补 scheme/缺省端口；显式相抵 ⇒ 400） | 用户 22:43 裁「A 保缺省 + B 增为可选档」（「安全组控制照旧」⇒ 缺省零行为变化）；scheme 单源 ⇒ 单一真相（列面/呈现/寻址同源） | mode 列（与 scheme 双源——漂移面，否）；独立 TLS 开关键（第二真相源，否）；SSH 隧道（C 不取——用户三择） |
| KD-SV-193 | **传输形 = `node:https` 适配件**（fetch 形最小件——`(url, {method, signal, headers, body}) → {status, text(), arrayBuffer()}`；`ca`/`cert`/`key` 逐值入选项；插入既有 `fetchImpl` 缝；`requestImpl` = 假件缝） | 实测：`undici` 非 Node 公共导出（`ERR_MODULE_NOT_FOUND`）∥ 全局 `fetch` 不下传客户端证书（面不可达）⇒ 零依赖纪律内唯一可行形 = `node:https` 自持；缝 = 既有注入面（测试零新机制） | undici `Agent`（不可导入——零第三方依赖纪律，否）；全局 `fetch`（无客户端证书面，否）；server 侧 Node 反代（新监听/常驻面——零驻留口径，否） |
| KD-SV-194 | **材料 = 三件（CA ∥ 客户端证书 ∥ 客户端私钥）用户自备**；私钥 AES-256-GCM（复用 `credential-crypto.mjs`）；三件零回显/零回填（只进不出）；不变量 `https` ⇔ 三件齐；关 TLS = 原子（地址改 `http` + 材料清零） | 沿主机凭据先例（KD-SV-84/133——加密/零回显/全列覆写/成事才审计）；材料 = 用户既有设施（不自建 PKI）；半档（https 缺件）⇒ fail-closed | 代生成 PKI（新自建面——用户未点，否）；明文落库（跳板材料，否）；材料查看/导出面（秘密回显面，否）；分步字段写（半档窗，否） |
| KD-SV-195 | **审计 = `runner_add` 增 `tls` 布尔 + 一枚 `runner_connection`**（连接变更——设/改/关；detail = kind + runnerId + address + tls；零秘密） | 过程留痕（谁把节点切了档可查）；既有节点面四 kind 逐枚核过不覆盖「连接方式变更」（`host_credential_*` = SSH 面专词/键集——复用即一词二义） | 复用 `host_credential_set`（键集异构 + 名不对事，否）；合一 kind（节点面回查粒度丢，否）；不落（凭据类变更从不静默——先例，否） |

## 16. 边界（不做）

- **不做**：自建机队/放置调度器 ∥ 跨机自动迁移 ∥ 节点侧常驻（任何形态）∥ 心跳/长轮询 ∥ IPv6 ∥ 快照跨工作区去重/增量（全量存档）∥ DNS 闸 TCP 53（如实登）∥ nft 漂移常驻守护（下次下发收正）∥ 快照定时器的服务端持久化状态（重启重建）。
- **CI 语义**（执行面共用 = §12 最后行；CI 面实现另批——KD-SV-72 保持）。
- **盒镜像内容治理**（部署面——沿 SANDBOX §15）。
- **底座可换余项（本增补不做——§8 底座可换块）**：构建进度流（同步请求——零 SSE/轮询）∥ 构建排期/并发闸（引擎自身排队）∥ 底座内容治理/扫描 ∥ 派生镜像源自动寻源（底座须已在节点——经既有拉取面）∥ 私有仓目录/标签读取的凭据面（仍匿名——`auth_required` 如实）。
- **连接面 TLS 余项（本增补 #2 不做——§2.1 ∥ `sandbox/SANDBOX.md` §3 连接方式块）**：材料轮换/续期机制 ∥ 材料查看/导出（只进不出）∥ 节点侧 TLS 服务端配置（dockerd 侧——在机）∥ **任务式装机（托管接入）随退场删净**（2026-10-14——装机径 TLS 条随之删；承接 = 手工登记 + 管理面 chat 内动作——`sandbox/SANDBOX.md` §3 接入面）。
- **卷族余项**（带数据重建等——沿 SANDBOX §15 卷族行；工作区卷已由 KD-SV-162 定形 = 并存不代管）。

## 17. 上抛/余项（本域——执行面）

| # | 项 | 类型 | 处置建议 |
|---|---|---|---|
| R74 | **sandbox-exec-rebuild 批（本批）——需求档回笔 + 随正件 + 披露**：① 需求档回笔（主 agent 笔）：`docs/server/requirements/PROJECT.md` §5 沙盒块——「执行通道 = exec 指令面（非 root ∥ 超时 10 分钟 ∥ 输出截断 1 MiB）」句与 19:52 口径相抵（本批执行面 = Docker API 直调 + 盒内壳自持；`exec` 指令面无对应实现面）⇒ 请收正；同块「控制链 = runner 长轮询/心跳/指令队列」史句（16:30 行）现状 = 已废，如仍在活面请随正；新增设置键两枚（`maxBoxesPerRunner` ∥ `workspaceRoot`——资源与 TTL 卡写入口随沙盒余面批）宜在 §5 资源行登记；**「底座可换」入册**（用户 2026-10-13 21:32 范围增补——建议功能点 52 ∥ AC-52，承 AC-51 顺序；判据全文 = `sandbox/EXECUTION.md` §8 底座可换块 ∥ §13 用例 ∥ `sandbox/SANDBOX.md` §3 块）；写法/计数 = 主 agent 定 ∥ ② 随正件（父侧/实施轮，以当刻盘面实读为准）：`docs/TEST-ENV-ECS.md`（节点前置 = dockerd 监听 TCP + 工作区根目录 + **派生前置 = 标准镜像件位契约（`/opt/thincoder/app`——member-face 批落地）就绪 + 底座镜像来源**；沿 R52②）∥ `docs/README.md`/`design/PROJECT.md` 档目（sandbox 域 1 档 ⇒ 2 档）∥ 旧单元测试档中引用 `sandbox_tasks`/队列者随本批实施随正（运行期读判决，非门禁）∥ 档目/键集断言件随正（`2026-10-08-server-public-structure.test.mjs`：+1 名——`views-sandbox-base.mjs` ∥ i18n 键集指纹——以实施当刻盘面复读为准）∥ ③ 披露（不阻塞）：nft 漂移窗 ∥ DNS 闸 UDP 只 ∥ 快照全量存档（配额内大小）∥ 定时器 30s 粒度 ∥ 探针 SKIP 假报零容忍（如实登记）∥ **底座可换五件**（派生真机可用依赖标准镜像件位契约落地——member-face 批；落地前机检不受阻 ∥ 底座 tag 移动 ⇒ 节点本地旧像被采用（追新 = 重拉后派生——引擎缺省）∥ 派生同步请求（最坏 ≈20 分钟 = 拉取 10 + 构建 10；超时后引擎侧可能仍在跑——重试幂等）∥ 逐节点各自派生（tag 内容寻址保证同源）∥ 凭据只及拉取注入——目录/标签读取仍匿名）∥ ④ 真机收口（父侧执行）：ECS `.5`/`.6` 复跑探针套件 + 建盒/快照/恢复全链实走 + **底座可换全链**（选定底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起——前置 = 标准镜像件位契约就绪）∥ **增补 #2（连接面 TLS 档——用户 2026-10-13 22:43「让用户可选」）：① 需求档回笔（主 agent 笔——建议功能点 53 ∥ AC-53，承 AC-52 顺序；判据全文 = `sandbox/EXECUTION.md` §2.1/§12/§13 ∥ `sandbox/SANDBOX.md` §3 连接方式块；写法/计数 = 主 agent 定）∥ ② 随正件（同类逐件 = `sandbox/SANDBOX.md` §16 R74——本行不重列）：`…-runner-admin-console.test.mjs`（E34 语义 + 列面断言 +四列）∥ `…-runner-admin-console-ui.test.mjs`（形体 `connection` ∥ 键集）∥ `…-server-public-structure.test.mjs`（档目 +2 名：`docker-tls.mjs` ∥ `views-sandbox-connection.mjs`）∥ `docs/TEST-ENV-ECS.md`（节点侧 dockerd TLS 配置步骤）∥ ③ 披露（不阻塞）：材料只进不出 ∥ 切换/编辑自检为门（离线节点改不动——如实报）∥ 客户端证书认证 = 节点 dockerd 侧配置（我方面只做客户端）∥ 缺省明文保持（零行为变化）∥ ④ 真机收口（父侧执行）：ECS `.6` 节点 dockerd TLS 就位 ⇒ 自签三件 ⇒ 切档 ⇒ 自检过 ⇒ 全谱可用 ⇒ 切回明文（材料清零） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |

- **跨批排序约束（在册）**：底座可换真机闭环（选定底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起）**前置 = `deploy/sandbox/Dockerfile` 件位契约就绪**（契约 = 本档 §8 件位 `/opt/thincoder/app`；落地 = member-face 批）；件位契约未就绪 ⇒ 收口轮该腿如实 SKIP（零假 PASS——探针整套同口径），机检腿（假件）不受阻。

## 变更记录

- 2026-10-14（**sandbox-onboarding-removal 批 · 延迟三档落地轮（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-14-sandbox-onboarding-removal.md` §2「不在本批（承接/延迟）」；重做批收口闭 ⇒ 延迟条件消解；用户 2026-10-14 裁「撤」）：§16 连接面 TLS 余项行去「托管接入面 TLS」子项（装机径 TLS 条随任务式退场删；承接 = 手工登记 + 管理面 chat 内动作——单源 = `sandbox/SANDBOX.md` §3 接入面）。**产品码零触（设计轮）。**

- 2026-10-14（**父侧机械随正 · 可 revert**——承批档 §6 收口）：① §3 放置句「行留未绑」收正为 **行留（绑定保留）**——父裁 2026-10-14（实现实读 = `registry.mjs:318` 绑定先行 ∥ `box.mjs:660` 建盒、catch 不解绑；与创建面同构）；② §10 宿主读数句收正（探针执行器实形 = 一次性容器 + 宿主文件只读挂载——零 SSH 凭据依赖；宿主活态类无 P 行）。

- 2026-10-14（**sandbox-exec-rebuild 批 · 收口修复轮（设计面）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §6 挂单（B/D/F 裁 + 回填））：§3 放置句补审计 kind 名（`placement_failed`——B 裁）∥ §3 销毁行读数去 `dirty`（D 裁——删键）∥ §3 增**链前置**（服务器地址非 IPv4 ⇒ 建盒/启动/轮换三链停——fail-closed；F 裁）+ §5 内置允许句同拍 ∥ §12 判据行 + §13 B77 ∥ §14 补本批触碰档七行（`chat-tools` ∥ `chat` ∥ `hosts` ∥ `ssh` ∥ 三路由）+ 收口实读（probe **679** ∥ `-tls` 单测 **711** ∥ `terminal-routes` 342 ⇒ **362**（TLS 终端腿 +20）∥ `bin` **243**）。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 设计评审轮 2 修复（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §3 轮次 2（四条逐号落）：#2 §5 下发句 iptables 备径补**两向同挂**（`FORWARD` + `INPUT` 各一跳入 `TC-EGRESS`——同锚 `-i tcws+`、同序 = 盒链位次）∥ #3 §14 本增补 #2 分项/小计同一基准收平（六处 delta ≈135 = 分项和（`routes` 55 + `registry` 30 + `docker` 25 + `migrations` 10 + 四路由 12 + 盒链 3）∥ `docker-tls.mjs` ≈220 ⇒ 本增补 #2 ≈+355 ∥ 小计 ≈+1866 ⇒ **≈+2221**（补入本增补 #2——= ≈+1180 + ≈+686 + ≈+355）；逐项值与 `sandbox/SANDBOX.md` §13 同值）。同源随动 = `sandbox/SANDBOX.md`（§3 连线口径/E34 ∥ §8① 用词 ∥ §13 分项）。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 范围增补 #2（连接面 TLS 档——fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1「2026-10-13 22:43 · 用户裁定」；用户原话「我其实很喜欢现在这种方式，靠安全组控制，使用简单方便，不过，我也想加上B，只是TLS证书认证，让用户可选。」）：§1 边界句 TLS 收正（可选档；缺省明文不变）∥ §2.1 增**传输落点段**（适配件（`node:https`——fetch 形最小件）∥ 两参透传（`config`/`requestImpl`）∥ 地址归一按档）∥ §9 v22 段增③（连接材料四列）∥ §12 增判据行 ∥ §13 增用例（N73 ∥ B76）∥ §14 增 `docker-tls.mjs`（拟新增 ≈220）+ 四行 delta + 小计（≈+390）+ 批内件两件（`…-tls.test.mjs` ≈180 ∥ `…-tls-ui.test.mjs` ≈140）∥ §15 增 KD-SV-192…195 ∥ §16 不做清单收正 + 增连接面余项行 ∥ §17 R74 增补 #2。同源随动 = `sandbox/SANDBOX.md` ∥ `store/STORE.md` ∥ `gateway/API.md` ∥ `accounts/ACCOUNTS.md` ∥ `ops/OPS.md` ∥ `webui/SANDBOX.md` ∥ `webui/WEBUI.md` ∥ `design/PROJECT.md`。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 乙档落定（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1「2026-10-13 22:38 · 用户裁定（底座前提 = 乙）」；用户原话「乙」）：§8 前提句 = 乙选定形（取件段补 node 运行件 `/usr/local/bin/node` ∥ 校验层与 `CMD` 同指取件件 ∥ glibc 系限定（musl/Alpine 如实拒）∥ 节点前置 = 标准镜像在节点（供体即标准镜像——零新增前置））+ Dockerfile 行随正 + 就位②人话「先备供体镜像」；§12/§13（N71 增 node 取件行逐值 ∥ B74 换乙档失败形）；§15 KD-SV-187 收正（决策 = 乙；甲入被否列）；§16 删「乙档实现」失效句。同源随动 = `sandbox/SANDBOX.md`。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 设计评审轮 1 修复（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §3 轮次 1（评审 #91——14 条逐号落）：#1 §5 增 `input` 基线链（同锚同盒链同位次——盒 → 宿主自身方向）+ §10/§13 判据腿 + 就位复核同拍 ∥ #2 未绑 403 ⇒ 503 两处（§3 放置 ∥ §13 B68）+ 人话两因（「先放置」∥「待人放」）∥ #3 §3 空闲停明写 `last_active_at` 取数源（派生读两源——零新列）+ KD-SV-169 同拍 ∥ #4 启动确保链/轮换重建链补 ①②（与链首步理由句自洽）∥ #5 §14 读数收平（migrations ⇒ ≈470 ∥ 小计 ⇒ ≈+1866 = 分项和；增 `image-routes` 行）∥ #8 增最近先例三坐标行 ∥ #10 §17 增跨批排序约束 ∥ #11 §8 `parseImageRef` 补实现坐标 ∥ #12 §2.2 增恢复清卷步 + 「§3.6」⇒「§3 恢复行」∥ #13 桥名落地机制（`networks/create` Options）+ 读回复核 ∥ #14 甲档前提补 shell 句 + §8 校验层/B74 同拍。同源随动 = `sandbox/SANDBOX.md` ∥ `store/STORE.md` ∥ `agent/MEMBER-AGENT.md` ∥ `gateway/API.md` ∥ `webui/SANDBOX.md` ∥ `design/PROJECT.md` ∥ `docs/README.md`。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 设计修订轮增补（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1 「2026-10-13 21:32 · 用户裁定（底座可换 = 完整功能进本批）」；用户原话「底座那个做完整功能吧」）：§3 建盒链增**④ 镜像就位**（仅自定义底座）+ 启动/轮换行步号随正 + 参数集 `Image` 键改底座解析；§8 增**底座可换块**（绑定形（工作区级 `base_image`）∥ 件位契约 `/opt/thincoder/app` ∥ 派生构建流（节点侧 `POST /build` + 多阶段取件 + 内容寻址 tag）∥ 缓存/重建 ∥ 前提二档（呈裁——甲基线）∥ 私有仓凭据 ∥ 零行为变化腿 ∥ 边界）；§12 增判据行；§13 增用例（N71/N72 ∥ B74/B75 ∥ E56/E57）；§14 增三新档（`derive.mjs` ≈200 ∥ `registry-creds.mjs` ≈130 ∥ `registry-cred-routes.mjs` ≈110）+ 四行 delta（box ∥ workspace-routes ∥ docker ∥ bin）+ 小计（≈+1970）+ 批内件两件（`…-base.test.mjs` ≈320 ∥ `…-base-ui.test.mjs` ≈220）；§15 增 KD-SV-184…191；§16 增底座可换余项行；§17 R74 增补（需求档回笔 + 随正件 + 披露五件 + 真机链）。同源随动 = `sandbox/SANDBOX.md`/`store/STORE.md`/`gateway/API.md`/`accounts/ACCOUNTS.md`/`ops/OPS.md`/`webui/SANDBOX.md`/`webui/WEBUI.md`/`design/PROJECT.md`。**产品码零触（设计轮）。**

- 2026-10-13（**sandbox-exec-rebuild 批 · 设计轮 · eng-designer**——承批档 `docs/batches/2026-10-13-sandbox-exec-rebuild.md` §1 · 台账 #1373；用户 2026-10-10 19:52–19:56 ∥ 16:28/16:32/16:36 口径 + 2026-10-13 本批范围五块）：**建档**——执行面（三腿/三证 ∥ 动作直调链与参数集 ∥ 卷形式定形 ∥ 主机侧配额/闸本体 ∥ DNS 闸与待批接续 ∥ 写门实时化 ∥ 盒运行时通道（核同件 + 最小壳 + 缝契约）∥ v22 收正 + #1351 + 拆案 ∥ 探针执行器与 #1248/#1249 闭环 ∥ 用例 N65–N70/B67–B73/E50–E55 ∥ KD-SV-160…174）。**产品码零触（设计轮）。**
- 2026-10-13（**member-face-chat 批 · 裁定修订轮（fix 轮）· eng-designer**——承批档 `docs/batches/2026-10-13-member-face-chat.md` §1（用户裁定：题一翻案——会话真源在盒内 / 题三补——登记即放行））：§6 增**预授权条目直通**句（`source='project'` 走放行径——非待批面；裸出站仍待批）∥ §8「会话回灌缝契约」句 ⇒ **会话读写面（零回灌）**（核导出件直用；缝随题一裁定消解）∥ §15 KD-SV-170 行同拍。同源随动 = `agent/MEMBER-AGENT.md` §3.2/§3.6 ∥ `sandbox/SANDBOX.md` §4/§6。**产品码零触（设计轮）。**
