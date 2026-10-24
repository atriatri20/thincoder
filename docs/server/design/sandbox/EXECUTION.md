# Thincoder Server · 沙盒执行面（sandbox/EXECUTION）

> 域 = sandbox（第二档）；控制面口径 ∥ 对象模型 = `sandbox/SANDBOX.md`（本档不复写）；
> 本档 = **执行面**（控制面 → 节点 / 盒的两条通道 + 盒内运行时通道 + 主机侧强制件 + 真机复证执行器）。
> 裁 = 用户 19:52–19:56（「runner 就是 docker 的 api 节点」∥ 主机侧强制走 SSH ∥ 机器上不驻留进程）∥ 16:28/16:32/16:36（盒内 agent = 核同件 + 最小壳）。
> **最近先例（实现坐标 ∥ 设计节）**：
> ① **镜像族拉取径**（实现 = `thincoder-server/src/sandbox/docker.mjs:189-201`（`parseImageRef`——引用形校验）∥ `image-routes.mjs:85`（拉取形校验调用点）；设计 = `sandbox/SANDBOX.md` §3 镜像族/一键拉取块）——**对齐** = 引用形校验前置（400 零外呼）∥ 拉取同步 10 分钟超时 ∥ 失败两形皆收（KD-SV-94）；
> **偏离** = 底座就位入建盒链（仅自定义底座——缺省零新增调用；理由 = 前提件 fail-closed，KD-SV-189）。
> ② **主机凭据面**（实现 = `thincoder-server/src/sandbox/hosts.mjs` ∥ `thincoder-server/src/store/credential-crypto.mjs`；设计 = `sandbox/SANDBOX.md` §3 主机凭据块）——**对齐** = 加密复用 `credential-crypto.mjs` ∥ 密列零回显 ∥ 成事才审计；
> **偏离** = 键 = 注册表主机（非 SSH 主机）∥ 注入点 = 拉取头 `X-Registry-Auth`（非 exec 通道；理由 = Docker 按注册表主机寻址同口径，KD-SV-188）。
> ③ **节点侧构建流**（实现 = `thincoder-server/src/sandbox/docker.mjs:8`（头注：拉取同步 10 分钟 ∥ 失败两形 ∥ `findStreamError`）；设计 = 本档 §8 派生构建流）——**对齐** = 流内错误两形逐帧扫描 ∥ 同步长超时常量；**偏离** = `POST /build` = 新增动作面（镜像族此前只读 + 拉取；理由 = 离线纪律下节点侧取件，KD-SV-185）。
> ④ **项目标记分治**（实现 = `thincoder-server/src/sandbox/quota.mjs`（项目标记步——`EXT4_PROJECT_STEP`）；设计 = 本档 §4 ②）——**对齐** = 单一步标签 ∥ 降级判据零随动（KD-SV-198）；**偏离** = 前形单命令（`chattr -R … +P`）→ 目录/文件分治（理由 = `+P` 只对目录有效——`-p` 赋号不得丢；落文件恒拒 `Operation not supported`——§4 ②）。
> ⑤ **壳更新面**（实现 = `thincoder-server/deploy/sandbox/member-shell/bootstrap.mjs` ∥ `thincoder-server/deploy/pack-box-shell.mjs` ∥ `thincoder-server/deploy/sandbox/member-shell/index.mjs:339`（`main()`——本批改）；设计 = 本档 §8 壳更新面块）——**对齐** = 内容寻址（沿 KD-SV-185 风）∥ 静态面单源分发（`src/webui/static.mjs` 零改）；
> **偏离** = 容器内运行时件自判/自取/自换——既有面之外的新形（无先例；理由 = 壳与镜像生命周期解耦，KD-SV-229）。
> **抽查（本批收正——公共源文档）**：`docs/README.md`（档目）∥ `docs/server/requirements/PROJECT.md` §5 沙盒块（「磁盘配额」= 上限条）∥ `sandbox/SANDBOX.md` ∥ `docs/TEST-ENV-ECS.md`（后两档 `chattr` 零命中——查过，无相关）∥ e2fsprogs `misc/chattr.c`（`-p` 无模式形合法 ∥ `+P` 落非目录 = EOPNOTSUPP）——结论 = 在档文档无相关约束（需求侧「磁盘配额」上限条不抵命令形）；e2fsprogs 读件 = 本收正依据。
> **抽查（box-shell-update 批——公共源文档）**：`docs/README.md`（档目）∥ `desktop/design/PACKAGING.md` §2.8（桌面自动更新 = electron-updater + generic feed）∥ 壳源树 + `deploy/sandbox/Dockerfile`（助手登记形）实读——结论 = 查过，无相关（唯一近形 = 宿主应用面自动更新——不可搬；容器内运行时件自更新 = 新形，偏离记档头⑤）。

## 1. 形态与三证（零驻留）

- **形态**：控制面（server 进程）对外三条腿——
  ① **Docker API 直调**（节点容器/网络/卷/镜像全族 + 盒生命周期动作；§2.1）；
  ② **SSH 主机侧执行**（逐条命令：卷目录准备 ∥ 磁盘限额；§2.2 ∥ §4）；
  ③ **盒出向**（盒内壳 ∥ 模型调用 → server；§2.3）。
- **零驻留三证**：
  ① **无 daemon**：节点机零我方进程（无 systemd unit ∥ 无监听 ∥ 无令牌）（§9）；
  ② **无心跳**：节点存活 = 读时探活（KD-SV-80；本档 §7 实时门同源）；
  ③ **无领取方**：动作 = 请求内直调（Docker API/SSH），无队列消费者——`sandbox_tasks` 队列退场（KD-SV-161）。
- **集群化 = Docker 自家**（Swarm 不触；多节点 = 多登记行）；**边界** = 不自建机队/放置器（KD-SV-171 静态放置）∥ **连接面 TLS = 可选档**（缺省明文不变；机制 = `sandbox/SANDBOX.md` §3 连接方式块 ∥ 传输落点 = §2.1） ∥ 不做跨机自动迁移（沿 §5 绑定即稳定）。
- **server 侧零新监听**。

## 2. 通道三件

### 2.1 Docker API（`docker.mjs`——既有客户端扩展）

- 既有：协商（KD-SV-81）∥ 读 3s ∥ 动作 15s ∥ 拉取 10 分钟 ∥ 容器/镜像/卷族。
- 新增：`networks`（create ∥ inspect ∥ delete）∥ `archive`（get ∥ put——快照取件/恢复，流式）∥ `containerState`（读 `containers/<id>/json` 的 `State.StartedAt`/`ExitCode`——墙钟判据 ∥ 探针执行器读数）∥ 建盒参数面（`Env` ∥ `HostConfig` 全量：`Binds` ∥ `ReadonlyRootfs` ∥ `Tmpfs` ∥ `CapDrop` ∥ `NetworkMode` ∥ `Dns` ∥ 资源三件）。
- 动作超时（15s）覆盖建盒链的**单步**（链总 = 逐步自算）；快照流 ∥ 恢复流 = 专用长超时（10 分钟——沿拉取常量）。
- **连接面 TLS 档**（机制全文 = `sandbox/SANDBOX.md` §3 连接方式块；本段 = 传输落点）**：明文路径恒用注入 `fetchImpl`（**零行为变化**——归一/自检/落库/传输逐值同现状）；
  TLS 行 ⇒ `clientForRunner`/`selfCheckDocker` 先解材料（按行解密）再走**适配件** `httpsFetchOf(tls, { requestImpl })`——fetch 形最小件（`(url, { method, signal, headers, body }) → { status, text(), arrayBuffer() }`；底层 = `node:https`；`ca`/`cert`/`key` 逐值入选项）。
  两参透传（与 `fetchImpl` 同形）：`config`（解密材料所需——全链：路由族/盒链/管理面 chat `docker` 工具）∥ `requestImpl`（假件缝——缺省 `null` ⇒ `https.request`）；地址归一按档（`normalizeDockerAddress(raw, { tls })`——裸 host 补 scheme + 缺省端口 2375/2376；显式 scheme 与档相抵 ⇒ 形错）。

### 2.2 SSH（`ssh.mjs` + `hosts.mjs` `execOnHost`——既有）

- 凭据 = 主机表行（KD-SV-133/134）；传输 = 系统 openssh + 指纹 TOFU（KD-SV-85）。
- **host 径用途面（逐条命令，零驻留）**：① 卷目录准备（`mkdir -p` + `chown 1000:1000`）② 磁盘限额（§4）③ 恢复清卷（`rm -rf <path>/*`——净恢复；§3 恢复行）④ 恢复备径（`archive` 被拒时的解包退路——§3 恢复行）⑤ 销毁卷清理（卸挂载 + detach loop + 删目录与镜像——§3 销毁行；①② 落 §4 卸除件 ∥ ③ 删目录与镜像落 `box.mjs` 销毁步）。
- 大输出面不走 SSH（`SSH_OUTPUT_MAX` 20000 字符——快照/恢复走 Docker `archive` 流式径；本档定形）。

### 2.3 盒出向

- 盒 → server：模型调用（`OPENAI_BASE_URL` + 工作区 key）∥ 壳连接（`TC_SERVER_URL`）。
- 盒无入向端口（沿需求裁）；盒出站无主机侧闸（裁定「整套摘除」——盒走 docker 缺省解析）。

## 3. 盒生命周期（动作表与直调链）

**底座**（每工作区一套）：卷 = 主机路径 `<workspaceRoot>/<ws-id>`（bind mount 到 `/workspace`——KD-SV-162）∥ 网络 = `tc-ws-<id>`（bridge）∥ 容器名 = `tc-ws-<id>`（引擎面唯一名——幂等采用判据）。

| 动作 | 链（逐步直调） | 幂等/失败处置 |
|---|---|---|
| **建盒（创建工作区）** | ① 卷目录准备（SSH）② 配额就位（§4）③ **镜像就位**（**仅自定义底座**——§8 底座可换块；缺省跳过）④ `networks/create` ⑤ `containers/create`（参数集见下）⑥ `start` | 任一步失败 ⇒ **停 + 人话（步名 + 原文）+ 审计**；行保留 ⇒ 重试 = 再走链（各步幂等：网络 409 ⇒ 采用 ∥ 容器名占用 ⇒ 读回采用 ∥ 派生 tag 在场 ⇒ 采用） |
| **启动** | 确保链 = ①→②→④→⑤→⑥（容器不在 ⇒ 建；自定义底座 ⇒ 先③；①②④ 幂等——在位即同结果） | 已在运行 ⇒ 200（noop）；`stop_reason` 清空 |
| **停止** | `containers/<id>/stop` | 未建/已停 ⇒ 200（noop）；`stop_reason='manual'`；**卷零触** |
| **销毁** | 确认门（`confirm:true`；读数 = 盒态 ∥ 快照数）⇒ ① 停（在运行者）② 删容器（force）③ 删网络 ④ 卷清理（SSH——**删卷 = 该显式确认项**：卸挂载（未挂 ⇒ 零动作、不抛）+ detach loop（back-file 属本工作区者；外来挂载零 detach）⇒ 删目录与镜像——§4）⑤ 行删（含快照行 + blob；key 吊销沿 §7 既有） | 中途失败 ⇒ 停 + 人话 + 行保留（重试续链）；**卷清理失败 ⇒ 抛**（残留不得静默产生）；审计 `workspace_destroy`（detail 携「卷已删」） |
| **轮换 key** | 吊销旧 + 签发新（既有）⇒ 重建 = 删容器 → ①→② → ⑤ → ⑥（自定义底座 ⇒ 先③——换底座生效径） | 卷保留；链中崩 ⇒ 行已持新 key、盒未起 ⇒ 重试「启动」 |
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
  Memory           : <memMb>M ; NanoCpus: <cpus> ; PidsLimit: <pids>
```
- `Binds` 源目录由 SSH 预建（缺失时引擎以 root 建目录 ⇒ 盒内 uid 1000 不可写——故卷目录准备为链首步）。
- **卷形式定形**（KD-SV-162）：工作区卷 = 主机路径绑定（生命周期/销毁语义随工作区）；「卷族」（容器面命名卷）与之并存不代管——卷区不列工作区卷、删卷防护零工作区感知（SANDBOX §15 登记项就此闭合）。
- **盒态读数**：读时读引擎（`containers/json` 按名匹配；不在 ⇒ 「未建」）；`stop_reason` = 服务器动作注记列（v22 增——非引擎态镜像；引擎态恒读时读）。

**放置**（KD-SV-171）：候选 = `active` ∧ 在线（实时探活）∧ 已绑工作区数 < `maxBoxesPerRunner`；取已绑数最少（并列 ⇒ id 最小）；无候选 ⇒ 保持未绑 + 明示「待人放」（不降级）。
  触发 = ① 创建工作区 ② 工作区动作/起盒时读时 ③ 节点登记成功后后台补放置（不阻断响应；逐工作区失败 ⇒ 审计（kind = `placement_failed`——`accounts/ACCOUNTS.md` §2.1）+ **行留（绑定保留）**——与创建面同构（绑定先行；失败行留、重试续链幂等）；「未绑」支 = 仅「无候选」由 §3 链前置明示）。**未绑工作区的动作 ⇒ 503 `sandbox_unavailable` 人话**（因一「先放置」——先放置再走链）。

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
  ② ext4（`prjquota` 挂载）⇒ **项目标记分治**（`+P` 只对目录有效——`-p` 赋号不得丢） + `setquota -P`：
     `find <path> -type d -exec chattr -p <id> +P {} +`（目录一半）∥ `find <path> -type f -exec chattr -p <id> {} +`（文件一半）
     ——目录（含 `<path>` 自身）= 赋号＋继承（`+P`）∥ 普通文件（`-type f`）= 只赋号（不设 `+P`）——符号链接 / 特殊文件承载数据近零（残余未量），且其 `chattr` 行为未实测 ⇒ 不收（主因 = 行为未实测；`-p` 赋号口径 = 目录 + 普通文件）；**两句各自成步**（真机实测 2026-10-17：host 命令面只在首条命令前加 `sudo -S`——`&&` 串联时后继命令落回普通用户 ⇒ 文件半句无 root 赋号必 `EPERM`），步标签同为 **`ext4 项目标记`**（实施面常量 `EXT4_PROJECT_STEP`）——任一句非零 ⇒ 该步非零
     降级腿判据零随动（本档 §4 ② 降级腿——步标签集无变）；判据成对：**绿** = 含文件的工作区上该步两句皆 `exit=0` ∥ **红** = 任一句非零（机检面 = 步标签 + 非零；非错误文本——locale 不稳）∥ 参考读数 = `Operation not supported`（来源 = runner 真机实测 2026-10-17）
  ③ 前两径皆不可 ⇒ **loopback**（镜像文件 `<path>.loop.img` + `mkfs.ext4 -O project,quota` + 挂载到工作区路径——备选）；
  ④ 三者皆不可 ⇒ **建盒停**（人话 + 处置句：节点需 xfs/ext4 项目配额或 loop 设备）。
- **② 降级腿**（KD-SV-198）：`ext4`+`prjquota` 径的**项目标记步**（`chattr`）失败 ⇒ 降 loopback 径一次——**守卫 = 仅 `ext4-project` 径的该次调用降**（两径复用同一步标签）；降级后 loopback 径的项目标记**再失败 ⇒ 停**（零第二次降级）。判据 = 该步**步标签**（非错误文本——locale 不稳）。**披露**：降级落 loopback ⇒ 新 fs 盖住工作区路径 ⇒ 原目录内容从盒视角不可达（与 `rebuild` 同面——KD-SV-197）。
- **降级后原目录的复原口径**（前述披露腿的操作面）：
  ① **前置 = 先停盒（或销毁）**：运行中的盒经 bind 占用工作区路径 ⇒ 直接 `umount` 撞 `EBUSY`，且盒面失卷；停用 §3「停止」动作（卷零触），或走销毁径（已含卸挂 + 删目录与镜像）。
  ② **`<path>.loop.img` 去留二择及后果**：**保留** ⇒ 下次建盒/启动走 ext4 径再失败 ⇒ 再降级 ⇒ `absent` ∧ 镜像在场且具 `project` ⇒ 只挂载既有镜像（零 `mkfs`）⇒ 原目录**再被盖住**；**删除**（`rm -f <path>.loop.img`——销毁径镜像那一半）⇒ 下次 `absent` ∧ 镜像不在 ⇒ `truncate` + `mkfs` 新建 ⇒ **同样盖住**。两择皆不产生持久复原。
  ③ **「当次可达」与「持久复原」分开表述**：停盒 + 卸挂 + detach 后原目录内容露出 ⇒ **一次性检视**（本次读出 / 备份走）可达成；**持久复原**（让工作区长期可用原目录）**不成立**——根因 = 项目标记步被拒（`EOPNOTSUPP`）未解 ⇒ 每次建盒/启动复发降级 ⇒ 每次重演覆盖。
  命令序列（停盒后）：`umount <工作区目录>` ⇒ `losetup -a -O NAME,BACK-FILE -n` 按 back-file 归属定位本工作区 loop ⇒ `losetup -d <loopN>` ⇒ 原目录内容可见；须保留降级后内容者先 `tar` 到盒外备份。
- **读件（只读——就位探与卸除件共用）**：`mountpoint -q <path>`（在挂判）∥ `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T <path>`（挂载点/源/类型/选项）∥ `test -f <path>.loop.img`（镜像在场）∥ `dumpe2fs -h <path>.loop.img`（镜像 fs UUID + features）∥ `dumpe2fs -h <source>`（**挂载侧** fs UUID——判据⑤取数；仅源为 `/dev/loop<n>` 时读，外来挂载零外读）
  ∥ `losetup -a -O NAME,BACK-FILE -n`（loop 归属读数——**卸除阶段用**：自愈卸除 ∥ 销毁卸除件；健康径零读）。
  **旗形与字段序**：探明调用 = `findmnt -no TARGET,SOURCE,FSTYPE,OPTIONS -T <path>`（`applyDiskQuota` 首步）；`parseFindmnt` 出参序 = `{ mount, source, fstype, options }`（= 旗形逐位 TARGET ∥ SOURCE ∥ FSTYPE ∥ OPTIONS）。
- **loopback 就位判据（就位探 = 身份 + 能力——KD-SV-196；实现 = 纯函 `classifyLoopbackMount`）**：逐序判——
  ① 未挂在工作区路径上 ⇒ `absent`（建/挂）；
  ② 挂载源非 `/dev/loop<n>`（外来挂载）⇒ `stale`（**处置 = 只卸挂载、零 detach**——归属判据见卸除件）；
  ③ 盘上镜像不在（旧 inode 挂载）⇒ `stale`；
  ④ 镜像特性**可读且不含** `project` ⇒ `stale`（`chattr` EOPNOTSUPP 之源）；
  ⑤ 挂载侧与镜像侧 fs UUID **皆可读且不等** ⇒ `stale`（陈旧 inode ∥ 镜像被重写）；**读挂载侧需服务以可读 `/dev/loopN` 的身份运行（root ∥ `disk` 组）**——不可读 ⇒ 本判据空转、归 `ready`、该档不自愈（**部署前提**；退化由安全性质派生——读不了即不臆断、不重建）；
  ⑥ 其余（读数不可得）⇒ `ready`（**零动**）。
  **安全性质**：`stale` 只在正面判明时成立——任一读不可得 ⇒ `ready`（错误照旧在下游显形，不新造数据损失面）。
- **自愈（KD-SV-197）**：`stale` ⇒
  ① 卸除 = `umount <path>`（在挂才卸）+ detach（**仅当源为 `/dev/loop<n>` 且其 back-file 属本工作区镜像**——归属判据同卸除件；外来挂载 ∥ back-file 不可得 ∥ 不等 ⇒ **零 detach**）；卸除失败（`umount` ∥ `losetup -d` 非零）⇒ 抛（fail-closed——KD-SV-199 同口径）；
  ② 重建 = 镜像可用（具 `project`）⇒ **只重接**（保盘上镜像内容）∥ 镜像缺失 ∥ 正面缺 `project` ⇒ `truncate` + `mkfs.ext4 -q -O project,quota -F`；
  ③ 落位 = `mount -o loop,prjquota <image> <path>` ⇒ `chown 1000:1000` ⇒ 复用 ext4 径。重挂身份由挂载命令自身保证（挂的就是当前镜像）——不另设挂后复验读。
- **读回核**：应用后读回配额读数（xfs = `report -p -b` + `xfs_info` bsize；ext4 = `repquota -P` 千字节块）；读数不符 ⇒ 同停。
- **幂等**：重复应用 = **重跑、同结果**（`ext4 项目标记` 步恒重跑——已标记工作区亦然（不跳过）；同号同旗重打 = 同结果；loopback 就绪 ⇒ 零修复动作、标记步照跑；`setquota` 重设 = 改限）；应用失败零残留（项目 id 与路径的绑定失败即报）。
- **健康径口径（零回归判据）**：**变更性命令零增**（`umount` ∥ `losetup -d` ∥ `truncate` ∥ `mkfs` ∥ `mount` ∥ `chown` 六族）+ **审计行零增**；新增唯只读读件（上列——探明旗形补 `SOURCE` 列 ∥ loopback 腿另加 `mountpoint`/`test -f`/`dumpe2fs`（镜像侧 + 挂载侧两读）；**`losetup -a` 不在健康径**——仅卸除阶段读（自愈卸除 ∥ 销毁卸除件））。
- **留痕**（KD-SV-200）：命中 `reconnect` ∥ `rebuild` ∥ `demote` ⇒ 一行 `sandbox_event/quota_recovered`（detail = `kind`+`workspaceId`+`runnerId`+`recovery`+`path`；健康径零行——`accounts/ACCOUNTS.md` §2.1）。
  **绑定物理动作**：卷已重建/重接 ⇒ 行必落——成功返回时由返回值携 `recovery`；**重建/重接后下游步失败时由错误携 `err.recovery`**（写入点 = `box.mjs` `stepQuota` 两径皆落行）——重建不因后续失败丢痕。
  **`rebuild` 的判据 = 是否抹掉既有内容**（既有内容不可再达即是）：`mkfs` 抹掉既有镜像内容（重建前镜像在场）⇒ 行必落（`rebuild`）——裁决 `absent` ∥ `stale` 皆然；`stale` ∧ 镜像不在（判据③旧 inode 挂载——旧内容不可再达）⇒ 亦 `rebuild`；**无抹 ⇒ 非 `rebuild`**——`stale` ∧ 镜像可用（具 `project`）⇒ 只重接，`recovery = "reconnect"`（行由主句「命中 `reconnect`」规约）。
  `null` 径 = 无既有内容被抹：`absent` ∧ 重建前镜像不在（首建——无内容可抹）∥ `absent` ∧ 镜像在场且具 `project`（只挂载既有镜像，零 `mkfs`）∥ `ready`（健康径）。
- **卸除件（销毁径调用——KD-SV-199）**：`releaseLoopbackVolume`——① 在挂则 `umount`（**未挂 ⇒ 零动作、不抛**——xfs/ext4 径常态）② `losetup -a -O NAME,BACK-FILE -n` 读数按 back-file 归属（剥 ` (deleted)`）逐条 detach 本工作区镜像——**归属判据 = back-file 等于本工作区镜像路径**，外来挂载 ∥ 他工作区 loop 零 detach；`umount` ∥ `losetup -d` 失败 ⇒ 抛。
  ③ **删目录与镜像不在卸除件内**——落 `box.mjs` 销毁步（`rm -rf <path> <path>.loop.img` 走 `host.run`，失败 ⇒ 抛；§3 销毁行）；卸除件（①②，`quota.mjs`）与删除件（③，`box.mjs`）两档共成销毁全程 fail-closed（KD-SV-199）。
- 判据：盒写超限 ⇒ ENOSPC（应用可见——E33 ∥ 探针 P7）；用例 = §13（N74 ∥ B77–B84 ∥ E58–E60）。

## 7. 写门实时化（KD-SV-166）

- `requireSandboxAvailable` ⇒ **异步实时探活**：候选节点（`active`）并发轻探（`GET /info`，3s）⇒ ≥1 在线 ⇒ 过；全离线 ∥ 无行 ⇒ 503 `sandbox_unavailable`（不降级——KD-SV-71 语义保持）。
- 绑定面动作（启动/停止/销毁/轮换/快照/恢复）⇒ 探**绑定节点**（离线 ⇒ 503 人话）；创建 ⇒ 探任一（放置取在线者）。
- 读面零门（运行面读数 = 读时探活如实，零门）；节点面恒可用（登记/删除不受沙盒门限制）。
- 代价如实：写请求最坏 +3s（探活窗）；不加缓存（写动作低频，零陈旧窗）。

## 8. 盒内运行时通道（核同件 + 最小壳）

- **镜像**（契约）：基座 `node:24-slim`（既有）∥ **核件同件**：构建期本地安装 `@thincoder/core`（构建上下文 = 仓根——离线可构建；核版本与 server 同源钉住）∥ 壳件 COPY 入镜像（`deploy/sandbox/member-shell/**`）∥ `USER 1000:1000` ∥ `WORKDIR /workspace` ∥ `CMD` = 壳起（容器起即连）。
- **env 契约**（建盒注入——§3 参数集）：`OPENAI_BASE_URL` = `<server>/v1` ∥ `OPENAI_API_KEY` = 工作区 key ∥ `TC_SERVER_URL` = `<server>` 基址 ∥ `HOME=/workspace/home`（核会话落卷——盒活则在）∥ 工作目录 `/workspace`。
- **进程形**：壳运行时 = 单进程最小件（起核 agent ∥ 接 server 会话流 ∥ 带 server 域工具扩展）——引导父进程（仅换执行径在场：取件/换执行与退出码回传）不携能力面；**零第二循环**（能力面一律取核——16:36 硬口径；判据 = 凡「盒内另有一套」即违规）。
- **会话读写面（零回灌——题一裁定「会话真源在盒内」）**：壳 → 核 = **核既有导出件**（列表/读/存/删——`thincoder-core/session*.mjs`；保底坐标在册 = `agent/MEMBER-AGENT.md` §3.2；本档不复制坐标形）；壳零核文件直读写。**读写面本形即实施径**（核码零改）；原回灌缝随题一裁定消解（服务器零会话落库 ⇒ 零回灌需求）。
- **底座可换（用户 21:32「底座那个做完整功能吧」；决策 = KD-SV-184…191，§15）**：
  - **底座指定形**（KD-SV-184）：**工作区级绑定** = `sandbox_workspaces.base_image`（NULL = 标准镜像 = `settings.image`——缺省零行为）；形 = `名[:标签]`（`parseImageRef` 同判——**实现 = `thincoder-server/src/sandbox/docker.mjs:163`**；`@` 拒 ∥ ≤ 200 字符），存归一形（缺标签补 `latest` 显式）；
    写面 = `PATCH …/workspaces/:id` 的 `baseImage` 键（值 `null` = 恢复标准）；
    **生效 = 下次建盒/重建**（沿资源覆写口径；重建径 = 既有「轮换 key」——零新动作）；存量行 NULL（迁移零行为）；**成员面零涉**（管理面专属）。
  - **件位契约**（标准镜像增补）：核 + 壳件位 = **`/opt/thincoder/app`**（核 = `node_modules/@thincoder/core` ∥ 壳 = `shell/**`）；CMD = `node /opt/thincoder/app/shell/index.mjs`；派生取件 = 单条 `COPY --from=<标准镜像> /opt/thincoder/app /opt/thincoder/app`（「核与 server 同源钉住」由标准镜像契约继承——零第二核源）。
  - **派生构建流**（KD-SV-185——节点侧 `POST /build`；**构建上下文 = 单 Dockerfile tar**——零源码上传 ∥ 零网络 ∥ 离线纪律沿既有）：
    ① 派生 tag = `thincoder-sandbox:base-<hash12>`（hash12 = `sha256("<base 引用>|<底座镜像 Id>|<标准镜像 Id>")` 前 12 hex——**内容寻址**；Id 读自节点镜像店）；
    ② **镜像就位四步** = 读底座（`GET /images/<base>/json`；404 ⇒ 拉取——命中私有仓凭据 ⇒ 携 `X-Registry-Auth`）⇒ 读标准镜像（`settings.image`——**供体 = 标准镜像**：node 件与件位件皆取自此像；404 ⇒ 停 + 人话「先备供体镜像」）⇒ 派生 tag 探（在场 ⇒ 采用——**零构建**）⇒ `POST /build?t=<tag>`（体 = tar；流内 `error`/`errorDetail` ⇒ 失败两形皆收——沿 KD-SV-94；超时 = 10 分钟专用常量）；
    ③ Dockerfile（服务端生成——**前提 = 乙（Node 随包带——KD-SV-187）**；校验层形 = 契约、实施可按等价改写，校验语义不变）：`FROM <base 引用>` ∥ **node 取件段** `COPY --from=<标准镜像> /usr/local/bin/node /usr/local/bin/node` ∥ 校验层 `RUN`（取件件可执行 ∧ 主版本 ≥24 ⇒ 过；**不可执行（musl/Alpine 等）∥ 无 shell 基底 ⇒ 层失败 + 人话**）∥
    件位段 `COPY --from=<标准镜像> /opt/thincoder/app /opt/thincoder/app` ∥ `USER 1000:1000` ∥ `WORKDIR /workspace` ∥ `CMD ["/usr/local/bin/node","/opt/thincoder/app/shell/index.mjs"]`（校验层与 `CMD` 同指取件件）；
    ④ builder 面 = 引擎缺省（legacy ∥ BuildKit 两路同形——`COPY --from=<本地镜像>` 件）。
  - **缓存与重建**（KD-SV-186）：派生 tag 在场 ⇒ 采用（重试幂等——自愈）；**标准镜像或底座内容变（镜像 Id 变）⇒ tag 变 ⇒ 重建触发**（核版本升 ⇒ 标准镜像重建 ⇒ Id 变——同链）；手动重建径 = 删派生镜像（既有删除面）后重跑 ∥ 节点重拉底座后再派生；**底座 tag 移动而节点本地旧像未换 ⇒ 采用本地旧像**（引擎缺省行为——如实披露）。
  - **底座前提 = 乙（Node 随包带——KD-SV-187；用户 22:38 裁「乙」）**：**node 件随派生像自带**——取件段 `COPY --from=<标准镜像>` 补 node 运行件（件位 `/usr/local/bin/node`）；**校验层与 `CMD` 同指取件件**（绝对路径——零 PATH 依赖；基底自带 node 的新旧均不参与判）。
    **glibc 系底座限定**（musl/Alpine：取件件不可执行 ⇒ 校验层失败 ⇒ 如实拒 + 人话）；**基底须可执行 `RUN`（含 shell）**——无 shell 底座在校验层即失败，同列人话；建议自带 `git`/`curl`（拉仓/调试面需要，**不作硬校验**）。
    **节点前置 = 标准镜像在节点**（供体即标准镜像——本就必在节点 ⇒ 零新增前置；缺 ⇒ 停 + 人话「先备供体镜像」）。
  - **私有仓凭据**（KD-SV-188）：server 全局表 `registry_credentials`（键 = 注册表主机——归一：小写；Hub 别名归 `docker.io`）；AES-256-GCM（复用 `store/credential-crypto.mjs`——键文件同源）；**密列零回显**（响应/日志/审计零秘密）；
    **注入点 = 拉取**（底座预拉 ∥ 手动拉取命中也携 `X-Registry-Auth`——Hub 特例 `serveraddress` = `https://index.docker.io/v1/`；未命中 ⇒ 匿名——现状零改）；**构建零网络**（底座/标准镜像皆本地——不携）；源目录/标签读取仍匿名（私有源 ⇒ `auth_required` 如实——登记余项）。
  - **零行为变化腿**（判据）：无绑定 ⇒ ① 参数集 `Image` = `settings.image` 逐值不变；② 建盒链零新增调用（假件调用计数 = 现状序列）；③ 零新审计行；④ 迁移后存量行 `base_image=NULL`。
  - **边界**：构建进度流（同步请求——零 SSE/轮询）∥ 构建排期/并发闸（引擎自身排队）∥ 底座内容治理/扫描 ∥ 派生镜像源自动寻源（底座须已在节点 ∥ 经既有拉取面）∥ 派生镜像的跨节点分发（逐节点各自派生——tag 内容寻址保证同源）。
- **壳更新面（版本化壳件 + 启动自取/自换——box-shell-update 批；用户 2026-10-17 00:31「那盒内的 agent 以后更新怎么办？」）**：壳件（`deploy/sandbox/member-shell/**`——件位 `/opt/thincoder/app/shell`）成**版本化工件**：发布侧打包 ⇒ 落 server 静态面；盒壳**启动时**自判 / 自取 / 自验 / 自换——判据 = **发布一个新壳版本 ⇒ 盒子下次启动跟到该版本（零镜像重建）**。
  - **三案对照（自含——判据：① 发布即跟·零镜像重建 ② 校验+回退不 brick ③ 版本可查 ④ 与既有机制关系不另起炉灶）**：
    **A 重建式** = 改壳 ⇒ 重建标准镜像 ⇒ 逐节点重拉 ⇒ 派生像重建（既有链交点 = KD-SV-186 标准镜像重建链）⇒ 逐盒重建/轮换——失败判据 = 发布与生效脱钩（无自动触发；盒不重建 = 永旧壳）：「零镜像重建」条款不满足 ⇒ **① ✗**；
    **B 宿主机 bind** = 建盒加第二 bind（主机目录 ⇒ `/opt/thincoder/app/shell`；既有链交点 = 「唯一可写挂载」KD-SV-162 ∥ 「机器上不驻留」§1）——失败判据 = 主机件缺/坏 ⇒ 容器起不来（**brick**）⇒ **② ✗** ∥ 逐节点手工放件无内容寻址 ⇒ **③ ✗** ∥ 两纪律相抵 ⇒ **④ ✗**；
    **C（本块）** = 版本化壳件 + 盒启动自取/自换——①–④ 全 ✓（选定；记 KD-SV-229）。
  - **件源单源**：内建（`deploy/sandbox/Dockerfile` COPY）与工件（打包）读**同一源树** `deploy/sandbox/member-shell/**`（物化纪律「一律源自源树」不破）；打包 = `thincoder-server/package.json` `prepack` 挂钩 ⇒ `deploy/pack-box-shell.mjs` ⇒ 产物 `public/box-shell/`（构建产物——不进 git；留 3 件 = 回退窗）。
  - **版本身份 = 内容寻址（树哈希）**：`sha256(逐件「相对路径 \0 sha256(件字节) \n」按名序串接)`——**覆盖集 = 源树逐件**（材料化产物在覆盖集外——排除：`node_modules/**` ∥ `state.json` ∥ `git-credential-thincoder` 登记链接；`git-cred.mjs` 在覆盖集内）；规则单源 = `deploy/sandbox/member-shell/bootstrap.mjs`（打包脚本 import 同一件——零漂移）；显示形 = 前 12 hex（hash12——沿 KD-SV-185 风）。
    **不变式**：槽内副本（材料化后）重算树哈希 == 槽名版本 == manifest 版本——承接进程 ③ 腿因而命中（自版本 == 目标）⇒ 零自旋（启动链长 ≤1——spawn 计数 ≤1）。
  - **传输面 = server 静态面复用（`thincoder-server/src/webui/static.mjs` 零改）**：manifest = `public/box-shell/manifest.json`（形 = `{"version":"<64 hex>"}`——多键忽略 ∥ 形非法 = 不可达类）；工件 = `public/box-shell/<版本>.tar`（不压缩 tar——件名 = 版本全哈希）；取件址 = `<TC_SERVER_URL>/box-shell/*`（与 SSE 同源——零新网络面；零鉴权——披露在案）。
    **锚点信任域（披露）**：完整性锚点 = server 自身可信（与模型流量同信任域）——校验只证「件与同次 manifest 相符」，不防伪 manifest（能改静态面者即可授权任意壳）；签名/分级分发不做。
    被否（传输候选）：OSS/官网（外部基础设施 ∥ 发布链跨仓 ∥ 可用性外依）∥ git 仓（克隆重 ∥ 凭据入盒 ∥ 与凭据最小化相抵）∥ 盒协议新端点（新端点族 + 协议文档随动——静态面已足）。
  - **启动引导序**（`bootstrap.mjs`——`index.mjs` `main()` 先于核装载调用；DI 面同壳族）：① 自版本 = 树哈希（自跑树——覆盖集 = 源树逐件，材料化产物集外）；② 取 manifest（超时 10s）——不可达/形非法 ⇒ 目标 = 缓存副本（槽集内最新）∥ 内建（零取件）；
    ③ 目标 == 自版本 ⇒ 本进程就地跑（零取件 ∥ 零换执行——**链终止腿**：承接进程必落此腿 ⇒ 换执行链长 ≤1）；④ 目标在缓存（槽在场 ∧ `state.json` 一致 ∧ 复用前复验过）⇒ 换执行；复验不过 ⇒ 槽失效（清、不复用）——manifest 可达 ⇒ 落 ⑤ 重取；不可达 ⇒ 目标 = 内建；
    ⑤ 否 ⇒ 取工件（超时 30s）⇒ 解包至暂存 ⇒ **逐件重算树哈希 == 版本** ⇒ 就位（缓存槽 `<HOME>/.tc-shell/<版本>/`：落件 + 材料化 + `state.json`；清理留当刻与自跑目录）⇒ 换执行；取件/校验失败 ⇒ 丢弃暂存（不触缓存）⇒ 目标 = 缓存 ∥ 内建。
  - **换执行**：`spawn(node, [目标入口])`（stdio ∥ env 透传 ∥ SIGTERM/SIGINT 转发；父镜像子退出码）；子非零退出 ∧ 未收终止信号 ⇒ **回退内建壳一次**（携「跳过引导」env 旗标——终态、零递归）+ **该槽失效（清）**——防下次启动复用坏槽。
    崩后再取件策略：下次启动按常序重试（manifest 可达 ⇒ 重取一次；不可达 ⇒ 内建）；持续崩（如壳↔核不符——见关系⑤）⇒ 每启动一次复现（单启动有界：≤1 换执行 + ≤1 回退）——披露：人工清 `<HOME>/.tc-shell/` 或镜像重建（根治 = 发修复版本）。
    槽就位 = 解包件 + **材料化三步（皆落覆盖集外——树哈希稳定性要件）**：① `git-credential-thincoder` 登记链接（同镜像形——源树无此名）+ 置执行位 + 目录前置于进程 `PATH`（git 助手解析到取件件）；② `node_modules/@thincoder/core` 链回镜像件位（核仍取镜像内同源件——零第二核源）；③ `state.json`。
    `state.json` 形 = `{"version":"<64 hex>","materialized":true}`（多键忽略）；**「一致」** = 可解析 ∧ `version` == 槽名版本；**复用前复验** = 一致 ∧ 重算树哈希（覆盖集口径）== 槽名版本——复验不过 ⇒ 槽失效（清、不复用）。
  - **回退层序（不得 brick——三失败各一步行动）**：取件副本（已验 ∧ 复用前复验——缓存槽）⇒ 内建壳（镜像恒在 = 地板）。① 取件不可达 ⇒ 缓存/内建顶上（零阻塞、本启动零重试）；② 校验不过 ⇒ 丢弃暂存（缓存零变）⇒ 缓存/内建顶上；③ 换执行后崩 ⇒ 回退内建一次 + 该槽失效（见上）。
  - **版本读音**：版本行 = **承接进程**（运行壳的进程）启动即落一行 `[shell] 壳版本 <hash12>（源=取件|缓存|内建）`（先于核装载——核装载失败亦可读）；引导父进程不落行——正常径每次启动恰一行 ∥ 崩回退径两行（判读取末行）。
    `源` 判定 = 引导传递的本次落点：本次启动取入并换执行 ⇒ 取件 ∥ 命中既有缓存槽换执行 ⇒ 缓存 ∥ 本进程即内建树（就地跑 ∥ 回退内建）⇒ 内建。盒内直查 = `cat <HOME>/.tc-shell/<版本>/state.json`（槽内状态件）。
    **触发 = 启动时**（容器 `start` ⇒ `CMD` 重跑）：每会话不做——在途换壳断会话、收益仅一个回合；即时跟版 = 手动重启盒（既有动作）。
  - **与既有机制的关系**：① 静态面复用零改（既有唯一文件分发面）；② 内容寻址沿 KD-SV-185 风（同风非同一物）；③ 派生镜像**正交**——取件在容器内，任意内建壳（含派生像 `COPY --from` 所得）皆被覆盖；④ 件位契约（`CMD` ∥ `/opt/thincoder/app`）不变；
    ⑤ 核件零涉（`@thincoder/core` 不随壳取件）——**壳↔核相容纪律**：壳件只承诺镜像内核既有导出面；破坏性核面变更 ⇒ 换执行崩 ⇒ 回退内建（E65）——该盒跟版停于该版本直至镜像重建（披露）；
    ⑥ 引导协议（取件路径 ∥ manifest 形 ∥ 树哈希规则）= 稳定契约——演进须镜像重建（引导件 = 内建；罕见，披露）；⑦ manifest 恒为目标源（含降级）：镜像重建未同拍重发工件 ⇒ 目标 = 旧工件壳（版本行如实显旧 hash12——静默降级明记；处置 = 重发工件）。
  - **边界**：运行中盒子不改壳（生效窗 = 下次启动——≤ 墙钟 TTL）∥ 服务器零壳版本台账（读数 = 盒日志；静态面零审计）∥ 管理面选版/回钉不做 ∥ 签名/分级分发不做。

## 9. 存储（v22 段 ∥ 拆案）

- **v22 段**：
  ① `sandbox_workspaces` 重建：去 `required_labels_json`（列面收正在态——放置判据不再用标签）∥ 增 `stop_reason TEXT`（停因注记——服务器动作写；引擎态零镜像）；
  ② `sandbox_tasks` **DROP**（队列退场——KD-SV-161；`kind` 全集/幂等集/悬挂回收随删）；
  ③ **本增补 #2**：`sandbox_runners` 增连接材料四列（`tls_ca` ∥ `tls_cert` ∥ `tls_key_cipher` ∥ `tls_updated_at`——ALTER 加性；存量行 NULL ⇒ 明文档零回填）；
  ④ 结构单源 = `store/STORE.md` §2 v22 段（本档不复制 DDL）。
- **#1351**：节点登记 handler = **单事务**（登记行 + 审计；任一抛 ⇒ 回滚 + 502 + 零残留）。
- **拆案（已实施）**：`src/store/db.mjs` 迁移段外提 `src/store/migrations.mjs`（已落——纯搬移零语义；db.mjs 保开库/PRAGMA/语句封装/版本引用）；**命名单源 = `migrations.mjs`**。

## 10. 真机复证（探针执行器）

- **执行器** = `thincoder-server/deploy/sandbox-probe.mjs`（跑法 = server 侧 `node deploy/sandbox-probe.mjs --server <base> --admin <user:pass> [--node <名|址>] [--repo <仓址>] [--p14]`；前置 = 一在线节点）。
- **盒内探针径** = 一次性探针容器（同镜像/同网络/同挂载，`Cmd` = 探针命令；读 `logs` + `State.ExitCode`；用毕删除）——**零 `docker exec`**（既有一致性 + 免 hijack 流面）；**宿主读数 = 取得宿主同一读数（执行器实形 = 一次性容器 + 宿主文件只读挂载——零 SSH 凭据依赖；宿主活态类读数无 P 行，不静默略过）**；服务端读数 = HTTP（P14）。
- **判据表** = SANDBOX §11 的余腿（P1 ∥ P5–P10 ∥ P13 ∥ P14；编号留空档 = P2–P4 ∥ P11/P12）。
- **闭环**：#1249（P1/P8 重跑）已闭环；SKIP 仍有无前置者 ⇒ 如实 SKIP（不假报）。
- 跑法环境 = `docs/TEST-ENV-ECS.md`（server `.5` ∥ 节点 `.6`；节点前置 = dockerd 监听 TCP——`ops/OPS.md` §5.10）。

## 11. 端点与响应形

机制面在本档；端点/请求/响应形单源 = `gateway/API.md` §2.5。**本档不复制。**

## 12. 验收判据（需求 → 设计判据）

| 需求（`docs/server/requirements/PROJECT.md` §5 沙盒块 ∥ AC-36） | 设计级判据 | 载体 |
|---|---|---|
| ② 每工作区一盒 ∥ read-only ∥ 唯一可写挂载 ∥ 盒内零密钥 | §3 参数集逐项（引擎请求体断言）∥ §8 env 契约 | 单元测试档 + 收口轮 |
| ⑤ 资源上限（cpus/memory/pids/磁盘） + 双 TTL | §3 参数集资源三件 ∥ §4 配额（P7；**部署前提 = 服务以可读 `/dev/loopN` 的身份运行——root ∥ `disk` 组，判据⑤**）∥ §3 定时器双 TTL | 单元测试档 + 收口轮（P7） |
| ① 容器强制无退路（无节点 ⇒ 仅沙盒面不可用） | §7 实时门（写 503 ∥ 读面零门 ∥ 节点面恒可用） | 单元测试档 + 收口轮（P14） |
| ⑦ 红队探针（判据收窄 + SKIP 前置） | §10 执行器 + P 表接续（余腿：P1 ∥ P5–P10 ∥ P13 ∥ P14） | 收口轮（真机） |
| 落地序（先于 #1215）∥ 与 CI 共用执行面（KD-SV-72） | §1 三证 ∥ §2 通道三件（CI 共用面 = 节点登记 + Docker 客户端 + SSH 传输） | 设计在档（下游 = 实施前置） |
| 19:52–19:56 口径（Docker API 直调 ∥ 主机侧 SSH ∥ 零驻留） | §1 三证逐条 + §2/§4 落点 | 设计在档 + 收口轮核读 |
| 16:36 硬口径（盒内必用 `@thincoder/core` + 最小壳） | §8 镜像/契约/进程形（零第二循环） | 单元测试档（契约面）+ 收口轮 |
| **底座可换**（用户 21:32——管理面选底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起；缺省 = 标准镜像零行为变化） | §8 底座可换块（绑定 ∥ 件位契约 ∥ 派生四步 ∥ 缓存/重建 ∥ 前提（乙——Node 随包带） ∥ 凭据注入 ∥ 零变化腿）+ §3 参数集/建盒链 ③ | 单元测试档 + 收口轮（真机） |
| **连接面 TLS 档**（本增补 #2——用户 22:43「让用户可选」；功能点 53 ∥ AC-53——拟入册） | §2.1 传输落点（适配件逐值 ∥ 两参透传 ∥ 明文路径零行为变化）+ `sandbox/SANDBOX.md` §3 连接方式块（形态/材料/写面/不变量/审计）；用例 = §13（N73 ∥ B76） | 单元测试档 + 收口轮（真机） |
| **壳更新面**（box-shell-update 批——**拟入册**：建议功能点 57 ∥ AC-57，承 AC-56 顺序〔编号先后 = 主 agent 定〕；用户 2026-10-17 00:31「那盒内的 agent 以后更新怎么办？」） | §8 壳更新面块（件源单源 ∥ 版本身份 ∥ 三案对照 ∥ 传输面 ∥ 启动引导序 ∥ 换执行 ∥ 回退层序 ∥ 版本读音 ∥ 关系 ∥ 边界）+ §13 用例（N89 ∥ B85–B88 ∥ E65） | 单元测试档 + 收口轮（真机——新壳发布 ⇒ 停机盒重启跟版；断网/坏件回退腿；镜像 Id 零重建核读） |

## 13. 用例（本档——执行面）

| # | 类 | 面 | 输入 | 预期输出 |
|---|---|---|---|---|
| N65 | 正常 | 执行面 | 创建工作区（假 Docker + 假 SSH）：卷目录 ∥ 配额 ∥ 网络 ∥ 容器 ∥ 起 | 逐步调用逐条命中（`mkdir/chown` ∥ 配额命令 ∥ `networks/create` ∥ `containers/create` ∥ `start`）；容器体逐值 = §3 参数集（**零 `Dns` 键**）；行绑定节点 + `stop_reason=NULL`；审计 `workspace_create` |
| N66 | 正常 | 执行面 | 动作全链：启动 ∥ 停止 ∥ 轮换 ∥ 快照 ∥ 恢复 ∥ 销毁（假件逐动作） | 引擎/SSH 调用逐条命中；停止 ⇒ `stop_reason='manual'`；快照 ⇒ blob 落盘 + 行 + size；恢复 ⇒ 停 ⇒ 清 ⇒ 解 ⇒ 起；销毁 ⇒ 删容器/网络/卷目录 + 行删（含快照行/blob） |
| N69 | 正常 | 执行面 | 定时器：盒运行 + `last_active_at` 陈旧 ∥ 引擎 `StartedAt` 超墙钟 ∥ 周期快照到期 | 空闲 ⇒ 停 + `stop_reason='idle_ttl'`（无快照调用）；墙钟 ⇒ 停 + `wallclock_ttl`；快照到期 ⇒ `archive get` + 落盘 + 行；保留超 `checkpointKeep` ⇒ 最旧行 + blob 删 |
| N70 | 正常 | 执行面 | 放置：两节点（A 绑 2 ∥ B 绑 1，皆在线）⇒ 建工作区；节点登记后未绑工作区补放置 | 落 B（最少者）；并列 ⇒ id 小；补放置 = 后台链 + 失败逐个审计（kind `placement_failed`——一条/工作区）+ 响应零阻断 |
| B67 | 边界 | 执行面 | 建盒链任一步失败（配额不可用 ∥ 网络 409 ∥ 容器名占用） | 停 + 步名/原文人话 + 审计；行保留；重试续链（409/占用 ⇒ 采用读回）；**配额失败 ⇒ 零建盒**（fail-closed） |
| B68 | 边界 | 执行面 | 未绑工作区的动作 ∥ `maxBoxesPerRunner` 已满 ∥ 全节点离线 | 503 `sandbox_unavailable` 人话（因一「先放置」——先放置再走链）∥ 候选排除 ⇒ 「待人放」明示（不降级）∥ 503（实时门） |
| B69 | 边界 | 执行面 | 快照越单份上限（`diskMb` 配额——假流大件）∥ 容器不在 | 中止 + 零行 + 审计告警（如实）∥ 跳过 + 响应注明（零假成功） |
| B70 | 边界 | 执行面 | 恢复：快照不存在 ∥ 引擎拒 `archive put`（走 SSH 备径） | 400 人话 ∥ 备径解包成功（同 blob） |
| E50 | 错误 | 执行面 | 节点不可达（假 Docker 关停）⇒ 建盒 ∥ 动作 ∥ 快照 ∥ 恢复 | 502 `upstream_error` 人话（逐动作）；行/卷零变（不在中途留半态——失败步如实） |
| E51 | 错误 | 执行面 | SSH 失败（认证 ∥ 指纹变更 ∥ 超时）⇒ 卷准备/配额 | 502/停 + 逐句人话（指纹 ⇒ 「重新信任」处置句） |
| E52 | 错误 | 执行面 | 节点登记事务：审计行插入抛（假件） | 登记行零残留（回滚）+ 502 人话；重试不撞重名 |
| E53 | 错误 | 执行面 | 销毁未确认 ∥ `user`/无会话打新端点（快照列表） | 400（确认门）∥ 403 ∥ 401 |
| E54 | 错误 | 执行面 | v21 库升 v22（存量：含 `required_labels_json` 值行 ∥ `sandbox_tasks` 有行） | 工作区行逐值保形（去列）；`sandbox_tasks` 表消；再开幂等零变；迁移段 = `migrations.mjs` |
| E55 | 错误 | 执行面 | 探针执行器：无在线节点 ∥ 前置缺（`--repo` 未给） | 逐条 SKIP + 退出码如实（零假 PASS） |
| N71 | 正常 | 执行面（底座可换） | 派生构建全链（假 Docker）：设底座 ⇒ derive —— 底座缺 ⇒ 拉取（携凭据头）∥ 读标准镜像 Id ∥ 派生 tag 探（缺）⇒ `POST /build` | Dockerfile 文本逐行断言（`FROM` ∥ **node 取件段 `COPY --from=<标准镜像> /usr/local/bin/node /usr/local/bin/node` 逐值** ∥ 校验层（取件件可执行 ∧ 主版本 ≥24） ∥ `COPY --from=<标准镜像> /opt/thincoder/app …` ∥ `USER 1000:1000` ∥ `WORKDIR /workspace` ∥ `CMD`）；`t=<派生 tag>` 逐值；响应 `{ tag, cached: false }`；审计 `image_derive` |
| N72 | 正常 | 执行面（底座可换） | ① tag 在场 ⇒ derive（缓存）② 建盒链两腿：自定义底座 ∥ 缺省（无绑定） | ① 零 `POST /build` 调用（`cached: true`——幂等）② 自定义腿：③ 镜像就位调用在场 + `containers/create` 体 `Image` = 派生 tag 逐值；**缺省腿：零 ③ 调用 + `Image` = `settings.image`——调用序列 = 现状（零行为变化腿）** |
| B74 | 边界 | 执行面（底座可换） | **乙档失败形**：**musl/Alpine 底座（取件件不可执行——校验层失败）** ∥ **无 shell（`RUN` 不可执行——同层失败）** ∥ **供体不在节点（= 标准镜像）** ∥ 未绑定节点 | 层失败 ⇒ 停 + 人话（步名 + 日志尾 + 「底座需可执行 `RUN`（含 shell）且 glibc 系（musl/Alpine 不支持）」处置句）+ 行保留（重试续链）；供体缺 ⇒ 400 人话（「先备供体镜像」）；未绑定 ⇒ 400 人话（先建盒/放置） |
| B75 | 边界 | 执行面（底座可换） | 底座引用形非法（`@` ∥ 超长 ∥ 空）∥ 无自定义底座却调 derive | 400 零外呼（形校验先于一切节点调用）；无绑定 ⇒ 400 人话（「该工作区为缺省标准镜像」） |
| E56 | 错误 | 执行面（底座可换） | 底座拉取失败（凭据错 ⇒ 引擎 401 原文）∥ 节点不可达 | 400 携引擎原文（人话——「凭据不符？」处置句）∥ 502（沿 E50 口径）；行/卷零半态 |
| E57 | 错误 | 执行面（底座可换） | 构建流内 `error`（假件）∥ 构建超时（假件不结） | 400 人话含日志尾 ∥ 502 + 如实句（引擎侧可能仍在跑——重试幂等：tag 在场即采用） |
| N73 | 正常 | 执行面（连接面 TLS 档） | 假件 https 请求件（记 `requestImpl` 选项）：添加节点携 `connection:"tls"` + 三件（CA/证书/私钥）⇒ 自检三呼（引导步 → 协商 → 复读）⇒ 落行 ⇒ 探活复用适配件 | `https.request` 选项 `ca`/`cert`/`key` 逐值（= 提交值——加密往返后解密同值）∥ URL 逐值（`https://` + `v<ver>` 前缀形）；行 `tls_updated_at` 在场 ∧ `tls_key_cipher` ≠ 明文（回读库断言）；响应行形含 `connection:"tls"` + `tls.state:"sealed"`（**零材料字段**——响应键面扫描）；审计 `runner_add` detail `tls:true`；`PUT …/connection` 切回明文 ⇒ 三列零化 + 审计 `runner_connection`（`tls:false`） |
| B76 | 边界 | 执行面（连接面 TLS 档） | **明文档零行为变化腿**：不携 `connection`/`tls` 键的添加（既有调用形）⇒ 全链 | 归一地址逐值同现状（`http://` + 2375）∥ 传输 = 注入 `fetchImpl`（**零适配件构造**——调用计数）∥ 行 `tls` 三列全 NULL（`tls.state:"none"`）∥ 审计 `runner_add` detail `tls:false` ∥ v22 升库后存量行读面逐值（零回填） |
| N74 | 正常 | 执行面（配额步） | 健康径三腿（假件）：`xfs`+`pquota` ∥ `ext4`+`prjquota` ∥ 裸路径 + 镜像不在 | 三腿**变更性命令**序列逐条 = §4 分治形（`xfs_quota` 三句 ∥ `chattr`（目录/文件分治——§4）+`setquota`+`repquota` ∥ `truncate`+`mkfs`+`mount`+`chown`+`chattr`（目录/文件分治——§4）——后续复用 ext4 径尾）+ 只读读件在场（探明旗形含 `SOURCE` 列；loopback 腿另读 `mountpoint`/`test -f`/`dumpe2fs`）；三腿零 `umount`/`losetup -d`/`mkfs`（xfs/ext4 两腿）∥ `recovery = null` ∥ 零 `quota_recovered` 行（裸径腿 = **镜像不在**的首建——无内容可抹；裸径 ∧ 镜像在场缺 `project` 者见 B83） |
| B77 | 边界 | 执行面（配额步） | 陈旧挂载（假件）——源 `/dev/loop32`、挂载 UUID ≠ 镜像 UUID、镜像具 `project` | `umount` → `losetup -d /dev/loop32` → `mount -o loop,prjquota` → `chown` → `chattr`（目录/文件分治——§4）——后续复用 ext4 径尾；**无** `mkfs`；`recovery = "reconnect"` |
| B78 | 边界 | 执行面（配额步） | 镜像失能（假件）——镜像在场、特性可读且无 `project` | 序列含 `mkfs.ext4 -q -O project,quota -F`；`recovery = "rebuild"` |
| B79 | 边界 | 执行面（配额步） | 就绪（UUID 同 + 具 `project`）∥ 读数不可得（`dumpe2fs` 空输出） | 两例序列皆**零** `umount`/`losetup -d`/`mkfs`/`mount`；`recovery = null`（安全性质：读数不可得不重建） |
| B80 | 边界 | 执行面（配额步） | `ext4`+`prjquota` 径、项目标记步 `exit≠0`（假件） | 降 loopback 径续走：探 → 建/挂 → `chattr`（目录/文件分治——§4）——后续复用 ext4 径尾；`recovery = "demote"` |
| E58 | 错误 | 执行面（销毁） | 在挂 + `losetup -a` 含本工作区两条（一在场一 `(deleted)`）+ 他人一条 | 序列 = `umount` + detach 本工作区两条（**不含他人**）+ `rm -rf` 两项；实机口径 = 该工作区零残留行 |
| B81 | 边界 | 执行面（配额步） | 外来挂载（假件）——挂载源非 `/dev/loop<n>`（如 `/dev/sdb1`），镜像在场且具 `project` | 序列 = `umount` → `mount -o loop,prjquota` → `chown` → `chattr`（目录/文件分治——§4）——后续复用 ext4 径尾；**零 `losetup -d`**（归属判据外）；`recovery = "reconnect"` |
| B82 | 边界 | 执行面（销毁） | 销毁 + 工作区路径**未挂**（xfs/ext4 径常态——`mountpoint` 非零） | 序列 = 零 `umount`/零 `losetup -d`（未挂 ⇒ 过、不抛）+ `rm -rf` 两项；终态 `destroyed` |
| B83 | 边界 | 执行面（配额步） | 裸路径 + 镜像在场、正面缺 `project`（假件——判据① ⇒ `absent`） | 抹掉既有镜像：`truncate` → `mkfs.ext4 -q -O project,quota -F` → `mount -o loop,prjquota` → `chown` → `chattr`（目录/文件分治——§4）——后续复用 ext4 径尾；`recovery = "rebuild"` ∥ `quota_recovered` 行在场（**抹掉既有内容 ⇒ 行必落**；与 N74 裸径腿「镜像不在 ⇒ `null`」为两条径） |
| B84 | 边界 | 执行面（配额步） | 陈旧挂载 + 盘上镜像**不在**（假件——判据③旧 inode 挂载） | `umount` → `losetup -d /dev/loop32` → `truncate` → `mkfs.ext4 -q -O project,quota -F` → `mount -o loop,prjquota` → `chown` → `chattr`（目录/文件分治——§4）——后续复用 ext4 径尾；`recovery = "rebuild"` ∥ `quota_recovered` 行在场（旧 inode 内容不可再达 ⇒ 有抹 ⇒ 行必落） |
| E59 | 错误 | 执行面（配额步） | 陈旧挂载 ⇒ 重建（`mkfs`）后项目标记步 `exit≠0`（假件） | 审计 `quota_recovered`（`recovery = "rebuild"`）**在场**（重建即留痕）+ `quota_apply_failed` 在场；错误上抛（建盒停） |
| E60 | 错误 | 执行面（配额步） | 降级腿（`ext4-project` 项目标记失败 ⇒ loopback 径）后 loopback 径项目标记**再失败**（假件） | **停**（零第二次降级）；`quota_recovered`（`recovery = "demote"`）在场 + `quota_apply_failed` 在场 |
| N89 | 正常 | 执行面（壳更新面） | 假件（假 fetch/假 spawn/假 fs 根）：内建树 v=H1；manifest v=H2；工件 = 真 tar（树哈希 H2） | 序 = manifest ⇒ 工件 ⇒ 解包 ⇒ 树哈希 == H2 ⇒ 就位（槽：落件 + 材料化 + `state.json`）⇒ 换执行（spawn 参数 = `node <HOME>/.tc-shell/<H2>/index.mjs`——恰一次）；版本行恰一行 `源=取件`（承接进程落——子回 ③ 腿就地跑、零自旋）；镜像面/控制面零调用 |
| B85 | 边界 | 执行面（壳更新面） | 三腿：manifest 不可达 ∥ 工件 404 ∥ 无缓存副本 | 逐腿回退：缓存副本 ∥ 内建顶上；零重试；引导不抛（进程续走）；版本行恰一行逐腿如实（`源=缓存` ∥ `源=内建`）；盒照起 |
| B86 | 边界 | 执行面（壳更新面） | 工件字节被改（解包后树哈希 ≠ manifest.version） | 丢弃暂存（缓存零变——`state.json` 与既有副本照旧）；回退 = 缓存 ∥ 内建；零换入 |
| B87 | 边界 | 执行面（壳更新面） | 零行为变化腿：内建树 == manifest（新鲜镜像） | 零工件取件调用（调用计数）；单行版本行 `源=内建`；本进程就地跑（零 spawn） |
| B88 | 边界 | 执行面（壳更新面） | 缓存槽复用复验（假件——假 fs 根）：① 槽 <H2> 在场且材料化（登记 ∥ 链 ∥ `state.json`）⇒ 复验过 ② 槽内源件被改（复验 ≠） ③ 槽内材料化产物被改（覆盖集外） | ① ④ 腿命中 ⇒ 换执行恰一次（spawn 计数 1 ∥ 零取件——承接进程就地跑、零自旋） ② 槽失效（清）⇒ 不得复用（重取件 ∥ 内建顶上） ③ 复验照过（判据稳定——④ 腿不受材料化影响） |
| E65 | 错误 | 执行面（壳更新面） | 换执行后崩：子进程非零退出、未收终止信号 | 回退内建一次（跳过引导旗标 ⇒ 零递归）+ 该槽失效（清——防复用）；版本行两行（首 = 取件/缓存子 ∥ 末 = 回退内建——判读取末行）；子正常退出 ∥ 收 SIGTERM ⇒ 零回退 + 槽留（镜像退出码） |

## 14. 本域文件与行数预算（执行面）

| 档 | 行数 | 职责 |
|---|---|---|
| `thincoder-server/src/sandbox/box.mjs`（已落） | **652/653** | 盒生命周期动作链 ∥ 建盒参数集 ∥ 放置与补放置 ∥ 卷目录准备 ∥ 定时器（空闲/墙钟/周期快照） |
| `thincoder-server/src/sandbox/quota.mjs`（已落） | **285/286** | 磁盘限额（探明 ∥ 项目配额/loopback ∥ 读回核）——`chattr` 项目标记 = 目录/文件分治（目录 `-type d … +P {} +` ∥ 文件 `-type f … {} +`，**两句各自成步**、同一步标签）；本批落地后复读同值（Δ 0） |
| `thincoder-server/src/sandbox/workspace-routes.mjs`（已落） | **306/307** | 工作区面四路由 + 快照列表（自 `routes.mjs` 拆出——拆案首选执行 + 重写为直调） |
| `thincoder-server/src/sandbox/derive.mjs`（已落——本增补） | **243/244** | 底座可换：派生 tag 计算 ∥ Dockerfile 生成 ∥ 上下文 tar ∥ 镜像就位四步 ∥ 构建流解析（§8 底座可换块） |
| `thincoder-server/src/sandbox/registry-creds.mjs`（已落——本增补） | **174/175** | 私有仓凭据：形校验 ∥ 主机归一/判据 ∥ 加密 CRUD（复用 `credential-crypto.mjs`）∥ `X-Registry-Auth` 组装 |
| `thincoder-server/src/sandbox/registry-cred-routes.mjs`（已落——本增补） | **95/96** | 私有仓凭据四端点（列/增/改/删——响应零秘密） |
| `thincoder-server/src/sandbox/registry.mjs` | **419/420** | 登记/读数/可用性/放置 |
| `thincoder-server/src/sandbox/routes.mjs` | **304/305** | 余面端点 |
| `thincoder-server/src/sandbox/docker.mjs` | **425/426**（未越 500 软线——拆案撤回，见 `sandbox/SANDBOX.md` §13） | Docker 客户端 |
| `thincoder-server/src/sandbox/docker-tls.mjs`（已落——本增补 #2） | **133/134** | 连接面 TLS：三件形校验 ∥ 材料加解密存取（复用 `credential-crypto.mjs`）∥ 连接元数据视图 ∥ `node:https` 传输适配件（§2.1 ∥ `sandbox/SANDBOX.md` §3） |
| `thincoder-server/src/sandbox/image-routes.mjs` | **144/145** | 镜像族路由（§3） |
| `thincoder-server/src/sandbox/container-routes.mjs`（**324/325**） | 已触碰（清单外）：`config`/`requestImpl` 两参透传（TLS 档） | 容器面路由（§3） |
| `thincoder-server/src/sandbox/volume-routes.mjs`（**103/104**） | 已触碰：同上（两参透传） | 卷族路由（§3） |
| `thincoder-server/src/sandbox/terminal-routes.mjs`（**362/363**） | 已触碰：两参透传 + **TLS 终端腿 +20**（材料感知升级传输 `execUpgradeTransportFor`） | 容器终端升级路（§9 ∥ `sandbox/SANDBOX.md` §3） |
| `thincoder-server/src/agent/chat-tools.mjs`（**562/563**——**越 500 软线在册**） | 已触碰：`config`/`requestImpl` 透传（管理面 chat `docker` 工具——TLS 材料解密；域账 = `agent/ADMIN-AGENT.md` §6） | agent 工具面 |
| `thincoder-server/src/agent/chat.mjs`（**736/737**——**越 500 软线在册**） | 已触碰：同列透传 | agent chat 驱动 |
| `thincoder-server/src/sandbox/hosts.mjs`（**134/135**） | 已触碰：`stdin` 透传（恢复备径 sudo 口令行） | 主机凭据面（§2.2） |
| `thincoder-server/src/sandbox/ssh.mjs`（**226/227**） | 已触碰：`stdin` 透传（载荷体） | SSH 传输（§2.2） |
| `thincoder-server/src/store/db.mjs` | **36/37**（迁移段已外拆 `src/store/migrations.mjs`（已落）**795/796**） | 开库/PRAGMA/语句封装 |
| `thincoder-server/deploy/sandbox-probe.mjs`（已落） | **537/538**（越 500 软线在册） | 探针执行器（余腿驱动 ∥ 一次性容器径 ∥ PASS/FAIL/SKIP/退出码） |
| `thincoder-server/bin/thincoder-server.mjs` | **241/242** | 装配 |
| `thincoder-server/deploy/sandbox/Dockerfile` | **46/47**（本档定义契约） | 盒镜像 |
| `thincoder-server/deploy/pack-box-shell.mjs`（本批） | **72** | 壳工件打包（树哈希（引 `bootstrap.mjs` 单源） ∥ tar 写 ∥ manifest ∥ 打包自检（回读复算） ∥ 旧件留 3 修剪）——§8 壳更新面块 |
| `thincoder-server/package.json`（本批——拟改） | **31** ⇒ +1 | `prepack` 挂钩（⇒ `deploy/pack-box-shell.mjs`——§8 壳更新面块） |
| `thincoder-server/deploy/sandbox/member-shell/bootstrap.mjs`（本批；档账随正 = `agent/MEMBER-AGENT.md` §5） | **418** | 盒内壳引导（树哈希单源 ∥ manifest/工件取件 ∥ 解包校验 ∥ 缓存槽 ∥ 换执行与回退） |
| `thincoder-server/deploy/sandbox/member-shell/index.mjs`（本批） | **361** ⇒ +9（实读 **370**） | `main()` 引导接线（先于核装载）+ 版本行 |
| `docs/batches/2026-10-17-box-shell-update.test.mjs`（本批） | **478**（不越 500 软线） | N89 ∥ B85–B88 ∥ E65（随批档存——收口随批删） |
| `.gitignore`（仓根——本批拟改） | **41** ⇒ +1 | `thincoder-server/public/box-shell/`（构建产物不进 git） |
| **小计** | **≈ +2221** ∥ **≈ −1117** | —— |
| **单元测试档** | **主体 795**（动作链 ∥ 参数集 ∥ 放置 ∥ 定时器 ∥ 实时门 ∥ v22 迁移 ∥ #1351 事务 ∥ 拆案读判）∥ `-base` **543**（派生 tag/Dockerfile 逐行 ∥ 镜像就位四步 ∥ 凭据 CRUD/注入 ∥ 绑定 PATCH ∥ 零变化腿）∥ `-base-ui` **437**（两卡渲染 ∥ 弹窗 ∥ i18n 键集）∥ `-tls` **711**（三件形校验/加密往返 ∥ 适配件选项逐值（假 `https.request`）∥ 连接端点两腿 ∥ 明文零行为变化腿）∥ `-tls-ui` **378**（添加窗连接段 ∥ 行「连接」钮 ∥ 编辑窗 ∥ i18n 键集）——**越 500 软线在册 = 主体 ∥ `-base` ∥ `-tls`**；本批新增一件 `docs/batches/2026-10-17-sandbox-quota-chattr.test.mjs`（`chattr` 分治命令串断言——恢复/降级/读回核腿不破）：**既列五档结构零变**（新档规模以实施当刻实读为准）；**上列五读数 = 收正前读数**（实施后复读随正） | 随批档存 |

（**行数读数**（口径 = `\n` 换行计数；总行 = 换行数 +1——±1 级差在案）：`box` 652/653 ∥ `quota` 285/286 ∥ `workspace-routes` 306/307 ∥ `derive` 243/244 ∥ `registry-creds` 174/175 ∥ `registry-cred-routes` 95/96 ∥ `docker-tls` 133/134 ∥ `docker` 425/426 ∥
  `registry` 419/420 ∥ `routes` 304/305 ∥ `image-routes` 144/145 ∥ `container-routes` 324/325 ∥ `volume-routes` 103/104 ∥ `terminal-routes` 362/363 ∥ `chat-tools` 562/563 ∥ `chat` 736/737 ∥ `hosts` 134/135 ∥ `ssh` 226/227 ∥
  `probe` 537/538 ∥ `bin` 241/242 ∥ `Dockerfile` 46/47 ∥ `db` 36/37 ∥ `migrations` 795/796（越 800 硬限余量 ≈4 行——拆案在案，见 `sandbox/SANDBOX.md` §13）；档位超线在册 = `box` ∥ `migrations` ∥ `chat-tools` ∥ `chat` ∥ `probe` ∥ `-tls` 单测。小计列 = 设计估和——实读总账以盘面复读为准。）

## 15. 关键决策（本域——执行面）

| # | 决策 | 理由 |
|---|---|---|
| KD-SV-160 | **执行面三腿 = Docker API 直调 ∥ SSH 主机侧 ∥ 盒出向**；零驻留三证（无 daemon ∥ 无心跳 ∥ 无领取方） | 用户 19:52–19:56 口径逐条落地；三证 = 可机检口径（无 unit/无心跳列/无消费者） |
| KD-SV-161 | **指令队列退场 = `sandbox_tasks` 删表**（动作 = 请求内直调链；动作响应 = 动作读数） | 零驻留 ⇒ 零领取方 ⇒ 队列 = 死状态；表在 ⇒ 认知负担 + 漂移源（无消费者却可被写） |
| KD-SV-162 | **工作区卷 = 主机路径绑定**（`<workspaceRoot>/<ws-id>`；卷族命名卷并存不代管） | 配额（项目配额锚路径）∥ 快照/恢复 ∥ 卷目录准备三面皆以路径为准；卷族↔工作区关系登记项就此闭合 |
| KD-SV-163 | **磁盘限额 = 项目配额优先 ∥ loopback 备 ∥ 皆不可则停**（建盒前置） | KD-SV-74 落地；E33/P7 判据要真限；fail-closed 沿建盒前置（前提件不就位 ⇒ 不建盒） |
| KD-SV-166 | **写门 = 实时探活**（写动作/创建前置；3s；不降级；零缓存） | KD-SV-80 同源（读时探活）；静态判据（存在 active 行）放行离线节点 = 假可用 |
| KD-SV-167 | **动作 = 幂等直调链**（目标态已成立 ⇒ 200 noop；中途失败 ⇒ 停 + 行保留 + 重试续链）；销毁 = 确认门 + 全清；拆盒永不删卷 | 无队列 ⇒ 重试 = 再走链；幂等采用（409/占用）免半态；卷保留沿 KD-SV-67 |
| KD-SV-168 | **快照 = Docker `archive` 取件 + 服务端 gzip 落盘**（恢复 = 清 + 解 + 起；触发 = 周期 + 拆前；销毁不拍） | 容器在场即可取件（零 exec ∥ 零 SSH 大输出）；非 git 工作区同覆盖面（旧「git 包」两边界随之消解）；销毁 = 确认门已明示（再拍无益） |
| KD-SV-169 | **空闲信号 = `last_active_at`**（动作 ∥ 该工作区 key 的网关流量两类）；墙钟 = 引擎 `StartedAt`；ticker = server 侧 30s | 需求「无 exec 且无代理流量」的可实现形（代理流量 = 网关记账点——单源已有；**取数 = 派生读两源**（usage 键索引 `idx_usage_key_ts` ∥ 审计动作行 `detail.workspaceId`）——零新列，§3）；墙钟取引擎读数（零新状态） |
| KD-SV-170 | **盒运行时通道 = 核同件 + 最小壳**（镜像契约 + env 契约 + 进程形；会话读写面 = 核既有导出件（零回灌）——核码零改） | 16:36 硬口径；会话真源在盒内（题一裁定）⇒ 读写面经核导出件直用（零阻塞；回灌需求零） |
| KD-SV-171 | **放置 = 在线 active 中最少绑定者**（并列 id 小）+ 容量 `maxBoxesPerRunner`；无候选 ⇒ 待人放 + 明示（不降级）；补放置 = 登记后后台 + 动作时读时 | 需求「盒数最少者」落地；零调度器（边界）；容量 = 防吃光第三层（16:19 需求） |
| KD-SV-172 | **真机复证 = 探针执行器 + 一次性容器径**（探针命令进 `Cmd`，读 logs/ExitCode；零 `docker exec`） | 免 hijack 流实现面（fetch 客户端零改动风险）；同镜像/同网络/同挂载 ⇒ 盒等价面；P14 走 HTTP（读面判据） |
| KD-SV-173 | **迁移段外提 `src/store/migrations.mjs`（已落）**（命名单源 = `migrations.mjs`） | STORE §4 触发条件达成；append-only 段链外提 = 纯搬移零语义；命名分歧收正为单源 |
| KD-SV-174 | **#1351 = 登记单事务**（行 + 审计；失败整滚） | 无事务窗 ⇒ 半态（行在段未带）实际发生过；改后零残留可重试 |
| KD-SV-184 | **底座可换 = 工作区级绑定**（`sandbox_workspaces.base_image`——NULL = 标准镜像 `settings.image`；写面 = PATCH `baseImage` 键；生效 = 下次建盒/重建） | 用户 21:32 口径「用户可能会需要选择他自己需要镜像做底座」——选择粒度 = 工作区（每盒一像）；缺省 NULL ⇒ 零行为变化（判据腿在册）；写面沿既有 PATCH（零新端点面） |
| KD-SV-185 | **派生构建 = 节点侧 `POST /build` + 多阶段取件**（上下文 = 单 Dockerfile tar；件自标准镜像 `COPY --from` 取——件位 `/opt/thincoder/app` 契约；tag = `thincoder-sandbox:base-<hash12>` 内容寻址） | 离线纪律沿既有（零源码上传 ∥ 零网络 ∥ 零第二核源——核/壳自标准镜像单源）；节点侧构建 = 底座像本就在节点、与拉取面同机（预构建分发/推送机 = 另立级）；内容寻址 ⇒ 幂等 + 可判缓存 |
| KD-SV-186 | **缓存与重建 = 内容寻址自动失效**（tag 在场 ⇒ 采用；标准镜像 ∥ 底座 Id 变 ⇒ tag 变 ⇒ 重建；手动重建 = 删派生镜像后重跑） | 「核版本升 ⇒ 重建触发」落地 = 标准镜像重建（Id 变）自动传导——零版本号比对机制；重试幂等（tag 在场即采用——自愈） |
| KD-SV-187 | **底座前提 = 乙（Node 随包带——选定）**：取件段 `COPY --from=<标准镜像>` 补 node 运行件（`/usr/local/bin/node`；校验层与 `CMD` 同指取件件）；glibc 系限定（musl/Alpine ⇒ 校验层失败如实拒）；节点前置 = 标准镜像在节点（供体即标准镜像——零新增前置） | 用户 22:38 裁「乙」：现成镜像绝大多数不含 Node——甲 = 用户先自烤带 Node 的底座，「完整功能」落空；供体取标准镜像 = 零新增前置（本就必在节点）+ 件位同源（核/壳/node 件自同一像） |
| KD-SV-188 | **私有仓凭据 = server 全局表（按注册表主机）+ 拉取注入**（`registry_credentials`；AES-256-GCM 复用 `credential-crypto.mjs`；密列零回显；`X-Registry-Auth`；构建零网络不携） | 用户口径「私有仓凭据」——按注册表主机 = Docker 同口径（一主机一枚）；加密/掩蔽/审计全沿主机凭据先例（KD-SV-84 单源）；注入点 = 拉取（底座预拉 ∥ 手动拉取）——构建不需要（像已本地） |
| KD-SV-189 | **建盒链增「③ 镜像就位」步——仅自定义底座**（缺省路径零新增调用；失败 ⇒ 停 — fail-closed） | 缺省零行为变化腿的机制保障（判据可机检 = 调用计数）；fail-closed 沿配额同款（前提件不就位 ⇒ 不建盒） |
| KD-SV-190 | **控制台面 = 标签②两卡**（「盒底座镜像」∥「私有仓凭据」——管理面；成员面零涉） | 镜像族家 = 标签②「镜像与镜像源」（底座/派生像 = 镜像面）；工作区面尚未落（②–⑥ 余面）⇒ 底座绑定写入口落此处（随工作区面落定可再指——本增补不预设）；成员面零涉 = 用户禁项 |
| KD-SV-191 | **审计 = 四 kind + `image_pull` 增 `auth` 键**（`workspace_base` ∥ `image_derive` ∥ `registry_credential_set` ∥ `registry_credential_revoke`；kind 非枚举——CHECK 零动；成事才落——缓存命中/失败不落，沿既有成事才审口径） | 过程留痕口径（换底座/构建/凭据三面可查）；零秘密（detail 无口令字段）；缓存命中不落 = 零噪声（无动作发生） |
| KD-SV-192 | **连接面 = 节点级二择 + 地址 scheme 单源**（`http` = 明文缺省 ∥ `https` = TLS；不设 mode 列；裸 host 按档补 scheme/缺省端口；显式相抵 ⇒ 400） | 用户 22:43 裁「A 保缺省 + B 增为可选档」（「安全组控制照旧」⇒ 缺省零行为变化）；scheme 单源 ⇒ 单一真相（列面/呈现/寻址同源） |
| KD-SV-193 | **传输形 = `node:https` 适配件**（fetch 形最小件——`(url, {method, signal, headers, body}) → {status, text(), arrayBuffer()}`；`ca`/`cert`/`key` 逐值入选项；插入既有 `fetchImpl` 缝；`requestImpl` = 假件缝） | 实测：`undici` 非 Node 公共导出（`ERR_MODULE_NOT_FOUND`）∥ 全局 `fetch` 不下传客户端证书（面不可达）⇒ 零依赖纪律内唯一可行形 = `node:https` 自持；缝 = 既有注入面（测试零新机制） |
| KD-SV-194 | **材料 = 三件（CA ∥ 客户端证书 ∥ 客户端私钥）用户自备**；私钥 AES-256-GCM（复用 `credential-crypto.mjs`）；三件零回显/零回填（只进不出）；不变量 `https` ⇔ 三件齐；关 TLS = 原子（地址改 `http` + 材料清零） | 沿主机凭据先例（KD-SV-84/133——加密/零回显/全列覆写/成事才审计）；材料 = 用户既有设施（不自建 PKI）；半档（https 缺件）⇒ fail-closed |
| KD-SV-195 | **审计 = `runner_add` 增 `tls` 布尔 + 一枚 `runner_connection`**（连接变更——设/改/关；detail = kind + runnerId + address + tls；零秘密） | 过程留痕（谁把节点切了档可查）；既有节点面四 kind 逐枚核过不覆盖「连接方式变更」（`host_credential_*` = SSH 面专词/键集——复用即一词二义） |
| KD-SV-196 | **loopback 就位判据 = 身份（fs UUID）+ 能力（`project` 特性）**（非「是否挂载点」）；读数不可得 ⇒ `ready`（零动——不得触发破坏性重建）；外来挂载（源非 `/dev/loop<n>`）处置 = 只卸挂载、零 detach（归属判据 = §4 卸除件）；判据⑤ 的挂载侧读需服务以可读 `/dev/loopN` 的身份运行（root ∥ `disk` 组）——不可读 ⇒ 空转、归 `ready`、该档不自愈（**部署前提**）；**不设「无 root 判据腿」**（不以不可靠读件换自愈率） | 本 bug 成因 = 一判跳过（陈旧挂载每次重试撞同一墙）；判据若「读不到就重建」⇒ 读件形错一次即抹掉全部工作区卷（安全性质） |
| KD-SV-197 | **loopback 收敛优先、重建兜底**：陈旧 ⇒ 卸（`umount` + detach **限本工作区 loop 归属**，外来挂载零 detach，任一步非零 ⇒ 抛）+ **只重接**（保盘上镜像内容）；破坏性 `mkfs` 仅限「镜像缺失 ∥ 正面缺 `project`」 | 就地收敛免数据损失；缺 `project` 的镜像永远无法承载项目配额（fail-closed 会永久停在停态）⇒ 重建是唯一出路，如实披露 |
| KD-SV-198 | **ext4 径被拒 ⇒ 降 loopback 径**（判 = 项目标记步的**步标签**，非错误文本；**守卫 = 仅 `ext4-project` 径的该次调用降**——降级后 loopback 径再失败 ⇒ 停，零第二次降级） | 能力缺/赋号被拒时 loopback 自带 `project,quota` 的新 fs 可承载；错误文本判法随 locale 漂——步标签是自持判据；披露 = 降级落 loopback ⇒ 新 fs 盖住路径内容（原目录内容从盒视角不可达） |
| KD-SV-199 | **销毁卷清理 = 显式卸挂载 + detach loop（back-file 属本工作区者）+ 删目录与镜像；失败 ⇒ 抛**（停 + 行留 + 重试续链）；未挂 ⇒ 零动作、不抛；外来挂载零 detach（归属判据单源 = §4 卸除件） | 静默失败正是 7 处 `(deleted)` 残留的成因（`rm -rf` 在前、detach 缺位）；fail-closed 让残留可见可重试 |
| KD-SV-200 | **自愈留痕 = 一枚 `quota_recovered`**（`reconnect` ∥ `rebuild` ∥ `demote`；健康径零行）；**绑定物理动作**——重建/重接即留痕（成功返回携 `recovery`；重建/重接后下游失败由 `err.recovery` 携）；**`rebuild` 判据 = 是否抹掉既有内容**（既有内容不可再达即是）——`mkfs` 抹掉既有镜像（重建前在场）⇒ `rebuild`（裁决 `absent` ∥ `stale` 皆然）；`stale` ∧ 镜像不在 ⇒ 亦 `rebuild`；**无抹 ⇒ 非 `rebuild`**（`stale` ∧ 镜像可用 ⇒ `reconnect`）；`null` 径 = `absent`（首建 ∥ 镜像在场的只挂载）∥ `ready` | 本 bug 痛点是「不可见」（同一墙撞多次、零迹象）；重建涉卷内容 ⇒ 必留痕；健康径零行 ⇒ 零噪声 |
| KD-SV-229 | **壳更新面 = 版本化壳件 + 盒启动自取/自换**（身份 = 内容寻址树哈希 ∥ 引导序 = 自判→取件→校验→换执行 ∥ 回退层序 = 缓存副本 → 内建 ∥ 引导协议 = 稳定契约） | 诱发实证 = 壳与盒子生命周期脱钩（10-16 审批接线源码、盒内壳 10-14）；三案对照（自含）= §8 块首：A 重建式不满足「零镜像重建」条款（判据① ✗）∥ B 宿主机挂载 brick/漂移/相抵（②③④ ✗）∥ C ①–④ 全 ✓（选定） |
| KD-SV-230 | **传输 = server 静态面复用 + 构建期打包**（`public/box-shell/`——manifest.json + `<版本>.tar`；`prepack` ⇒ `deploy/pack-box-shell.mjs`——工件 = 构建产物不进 git；留 3 件回退窗） | 唯一既有文件分发面（`src/webui/static.mjs` 零改）；与盒必达 server 同源（同 SSE 一址）；被否 = OSS/官网 ∥ git 仓 ∥ 盒协议新端点（静态面已足） |
| KD-SV-231 | **校验与回退 = 树哈希整件校验 + 回退层序（缓存副本 → 内建）+ 三失败各一步**（取件不可达 ⇒ 顶上 ∥ 校验不过 ⇒ 丢弃暂存 ⇒ 顶上 ∥ 换执行崩 ⇒ 回退内建一次） | 校验 = 内容身份（tar 信封不参与）+ 槽复用前复验 ∥ 崩后槽失效（§8）；brick 禁止（内建 = 恒在地板）；失败不中断盒启动（fail-safe） |
| KD-SV-232 | **版本读音 = 承接进程启动行 + 槽内状态件**（`[shell] 壳版本 <hash12>（源=取件|缓存|内建）`——先于核装载；`state.json` 槽内直查）；**触发 = 启动时**（每会话不做） | 核装载失败亦可读（诊断）；判据③ 可机检形；启动触发与容器生命周期对齐（`CMD` 重跑）、在途零中断；即时跟版 = 手动重启盒（既有动作） |

## 16. 边界（不做）

- **不做**：自建机队/放置调度器 ∥ 跨机自动迁移 ∥ 节点侧常驻（任何形态）∥ 心跳/长轮询 ∥ IPv6 ∥ 快照跨工作区去重/增量（全量存档）∥ 快照定时器的服务端持久化状态（重启重建）。
- **CI 语义**（执行面共用 = §12 最后行；KD-SV-72 保持）。
- **盒镜像内容治理**（部署面——沿 SANDBOX §15）。
- **底座可换余项（本增补不做——§8 底座可换块）**：构建进度流（同步请求——零 SSE/轮询）∥ 构建排期/并发闸（引擎自身排队）∥ 底座内容治理/扫描 ∥ 派生镜像源自动寻源（底座须已在节点——经既有拉取面）∥ 私有仓目录/标签读取的凭据面（仍匿名——`auth_required` 如实）。
- **连接面 TLS 余项（本增补 #2 不做——§2.1 ∥ `sandbox/SANDBOX.md` §3 连接方式块）**：材料轮换/续期机制 ∥ 材料查看/导出（只进不出）∥ 节点侧 TLS 服务端配置（dockerd 侧——在机）∥ **任务式装机（托管接入）不做**（承接 = 手工登记 + 管理面 chat 内动作——`sandbox/SANDBOX.md` §3 接入面）。
- **卷族余项**（带数据重建等——沿 SANDBOX §15 卷族行；工作区卷已由 KD-SV-162 定形 = 并存不代管）。
- **配额/销毁余项（不做——§4）**：既有 `(deleted)` loop 残留的自动回收（工作区行已删 ⇒ 无从触达——人工 `losetup -d`）∥ 旧镜像留档副本（免残留面扩大；留档 = 用户侧手工 `cp -a`）∥ `quota.mjs`/`box.mjs` 拆案 ∥ 外来挂载（非本工作区 loop 件）的设备释放（归属判据外 ⇒ 只卸挂载）。
- **壳更新面余项（box-shell-update 批不做——§8 壳更新面块）**：运行中热更（生效 = 下次启动）∥ 管理面选版/回钉 ∥ 服务器侧壳版本台账/审计（读数 = 盒日志）∥ 工件签名/分级分发（CDN 族）∥ 服务器侧旧版留存策略（打包件留 3——非版本管理语义）。

## 17. 上抛/余项（本域——执行面）

| # | 项 | 类型 | 处置建议 |
|---|---|---|---|
| R74 | **需求档回笔 + 随正件 + 披露**：① 需求档回笔（主 agent 笔）：`docs/server/requirements/PROJECT.md` §5 沙盒块——「执行通道 = exec 指令面（非 root ∥ 超时 10 分钟 ∥ 输出截断 1 MiB）」句与 19:52 口径相抵（执行面 = Docker API 直调 + 盒内壳自持；`exec` 指令面无对应实现面）⇒ 请收正；同块「控制链 = runner 长轮询/心跳/指令队列」史句（16:30 行）现状 = 已废，如仍在活面请随正；新增设置键两枚（`maxBoxesPerRunner` ∥ `workspaceRoot`——资源与 TTL 卡写入口随沙盒余面批）宜在 §5 资源行登记；**「底座可换」入册**（用户 21:32 范围增补——建议功能点 52 ∥ AC-52，承 AC-51 顺序；判据全文 = `sandbox/EXECUTION.md` §8 底座可换块 ∥ §13 用例 ∥ `sandbox/SANDBOX.md` §3 块）；写法/计数 = 主 agent 定 ∥ ② 随正件（父侧/实施轮，以当刻盘面实读为准）：`docs/TEST-ENV-ECS.md`（节点前置 = dockerd 监听 TCP + 工作区根目录 + **派生前置 = 标准镜像件位契约（`/opt/thincoder/app`——member-face 批落地）就绪 + 底座镜像来源**；沿 R52②）∥ `docs/README.md`/`design/PROJECT.md` 档目（sandbox 域 1 档 ⇒ 2 档）∥ 旧单元测试档中引用 `sandbox_tasks`/队列者随实施随正（运行期读判决，非门禁）∥ 档目/键集断言件随正（`2026-10-08-server-public-structure.test.mjs`：+1 名——`views-sandbox-base.mjs` ∥ i18n 键集指纹——以实施当刻盘面复读为准）∥ ③ 披露（不阻塞）：快照全量存档（配额内大小）∥ 定时器 30s 粒度 ∥ 探针 SKIP 假报零容忍（如实登记）∥ **底座可换五件**（派生真机可用依赖标准镜像件位契约落地——member-face 批；落地前机检不受阻 ∥ 底座 tag 移动 ⇒ 节点本地旧像被采用（追新 = 重拉后派生——引擎缺省）∥ 派生同步请求（最坏 ≈20 分钟 = 拉取 10 + 构建 10；超时后引擎侧可能仍在跑——重试幂等）∥ 逐节点各自派生（tag 内容寻址保证同源）∥ 凭据只及拉取注入——目录/标签读取仍匿名）∥ ④ 真机收口（父侧执行）：ECS `.5`/`.6` 复跑探针套件 + 建盒/快照/恢复全链实走 + **配额收正绿腿**（ext4+`prjquota` 节点 + 含文件的工作区 ⇒ `ext4 项目标记` 步 `exit=0` ∧ 零 `quota_recovered`（`demote`）行——核 = §4 判据成对 ∥ 留痕绑定；**造态** = 建盒前预置 `<path>` 内文件 ∥ 既有含文件工作区（本批 = ws-12）走启动确保链——该步每次应用**恒重跑**（§4 幂等；`-type f` 半句随真跑）；**读数取法** = 链完成（盒 running）∧ 零 `demote` 行 ⇒ 该步直通、未降级（健康径零留痕）∥ 精确读数 = 节点手工复跑该步命令读 `$?`）+ **底座可换全链**（选定底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起——前置 = 标准镜像件位契约就绪）∥ **增补 #2（连接面 TLS 档——用户 22:43「让用户可选」）：① 需求档回笔（主 agent 笔——建议功能点 53 ∥ AC-53，承 AC-52 顺序；判据全文 = `sandbox/EXECUTION.md` §2.1/§12/§13 ∥ `sandbox/SANDBOX.md` §3 连接方式块；写法/计数 = 主 agent 定）∥ ② 随正件（同类逐件 = `sandbox/SANDBOX.md` §16 R74——本行不重列）：`…-runner-admin-console.test.mjs`（E34 语义 + 列面断言 +四列）∥ `…-runner-admin-console-ui.test.mjs`（形体 `connection` ∥ 键集）∥ `…-server-public-structure.test.mjs`（档目 +2 名：`docker-tls.mjs` ∥ `views-sandbox-connection.mjs`）∥ `docs/TEST-ENV-ECS.md`（节点侧 dockerd TLS 配置步骤）∥ ③ 披露（不阻塞）：材料只进不出 ∥ 切换/编辑自检为门（离线节点改不动——如实报）∥ 客户端证书认证 = 节点 dockerd 侧配置（我方面只做客户端）∥ 缺省明文保持（零行为变化）∥ ④ 真机收口（父侧执行）：ECS `.6` 节点 dockerd TLS 就位 ⇒ 自签三件 ⇒ 切档 ⇒ 自检过 ⇒ 全谱可用 ⇒ 切回明文（材料清零） | 披露（上抛——如无异议按设计实施；部署收口 = 父侧） | 评审/用户复核 |
| R92 | **box-shell-update（需求档回笔 + 随正件 + 披露 + 真机收口）**：① 需求档回笔（主 agent 笔）：建议入册（判据 = 本档 §8/§12/§13）∥ ② 随正件：`.gitignore`（+`public/box-shell/`）∥ `Dockerfile` 档头死指针收正 ∥ `MEMBER-AGENT.md` §5 档账随正 ∥ ③ 披露：工件公开可读 ∥ 运行中不换壳 ∥ 缓存落卷 ∥ 引导协议演进须镜像重建 ∥ ④ 真机收口：新壳发布 ⇒ 停机盒重启跟版（版本行对 manifest）∥ 断网回退腿 | 披露 | 评审/用户复核 |

- **排序约束（在册）**：底座可换真机闭环（选定底座 ⇒ 派生 ⇒ 建盒 ⇒ 壳起）**前置 = `deploy/sandbox/Dockerfile` 件位契约就绪**（契约 = 本档 §8 件位 `/opt/thincoder/app`）；件位契约未就绪 ⇒ 收口轮该腿如实 SKIP（零假 PASS——探针整套同口径），机检腿（假件）不受阻。
