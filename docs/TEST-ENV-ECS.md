# ECS 测试环境运维手册（server 机 ha-proxy · 10.0.0.5 ∥ runner 机 sh-mgr · 10.0.0.6）

> 本档分两部分：§1–§6 是当前访问、部署、回滚和接入操作；§7–§9 是带日期的实测读数。 dated 读数均未复测，不得当作无时间限制的当前状态。
> 产品侧部署设计 = `docs/server/design/ops/OPS.md`「部署与更新」∥ `thincoder-server/README.md`「首部署清单」；本文只服务内部测试箱。
> 凭据纪律：本档不载口令或密钥值；访问使用专用密钥文件。

## 1. 当前操作：访问面

本表是操作坐标，不是在线状态读数；账号权限与安全组须在实际使用时复核。

| 项 | 操作值 |
|---|---|
| server 主机 | `10.0.0.5`（内网；主机名 `ha-proxy`；阿里云 ECS · Ubuntu） |
| 账号 | `thincoder`（部署专用；无免密 sudo） |
| 密钥 | 本机 `$env:USERPROFILE\.ssh\thincoder_ecs`；必须显式 `ssh -i` |
| server 端口 | 8787；安全组与可达性只按 §9 的 dated 读数理解，用前须复查 |
| 控制台 | `http://10.0.0.5:8787/`；账号由用户管理，本档不载账号名与口令 |
| server 连接 | `ssh -i $env:USERPROFILE\.ssh\thincoder_ecs thincoder@10.0.0.5` |
| runner 连接 | `ssh -i $env:USERPROFILE\.ssh\thincoder_ecs thincoder@10.0.0.6` |

## 2. 当前操作：更新部署

顺序 = **先推、后拉、再重建**。本机 Windows PowerShell：

```powershell
cd d:\teamcode\thincoder
git push origin main
git push github main
```

上箱后分步执行，每条一行；远端命令平铺单层：

```powershell
$k = "$env:USERPROFILE\.ssh\thincoder_ecs"
ssh -i $k thincoder@10.0.0.5 "cd ~/thincoder && git pull --ff-only"
ssh -i $k thincoder@10.0.0.5 "docker tag thincoder-server:0.1.0 thincoder-server:pre-<日期>"
ssh -i $k thincoder@10.0.0.5 "docker build -f ~/thincoder/thincoder-server/Dockerfile -t thincoder-server:0.1.0 ~/thincoder"
ssh -i $k thincoder@10.0.0.5 "cd ~/thincoder-server-deploy && docker compose up -d --force-recreate && sleep 6 && docker ps"
```

1. 先推送到 `origin`，箱子从 gitee 拉取；本地未推则箱上没有。
2. 旧镜像先打标为 `thincoder-server:pre-<日期>`，作为 §4 的回滚锚。
3. `docker build` 上下文是仓根 `~/thincoder`；Dockerfile 用 `-f ~/thincoder/thincoder-server/Dockerfile` 指定。compose 无 build 段，镜像须手动重建。
4. tag 同名时必须用 `--force-recreate` 确保容器使用新镜像；停机会持续数秒。
5. 数据库迁移随容器启动自动执行，无独立迁移步。
6. 配置与数据经 `./config` ∥ `./data` 卷挂载，重建容器不动它们。

## 3. 当前操作：更新后自检

```powershell
$k = "$env:USERPROFILE\.ssh\thincoder_ecs"
ssh -i $k thincoder@10.0.0.5 "curl -s -m 5 -o /dev/null -w 'healthz=%{http_code}\n' http://127.0.0.1:8787/healthz"
ssh -i $k thincoder@10.0.0.5 "curl -s -m 5 -o /dev/null -w 'client/me=%{http_code}\n' http://127.0.0.1:8787/api/client/me"
ssh -i $k thincoder@10.0.0.5 "curl -s -m 5 -X POST -H 'Content-Type: application/json' -d '{}' -o /dev/null -w 'client/login=%{http_code}\n' http://127.0.0.1:8787/api/client/login"
```

| 探针 | 期望 | 含义 |
|---|---|---|
| `GET /healthz` | 200 | 服务与数据库可用；响应体含 `{"status":"ok","db":"ok"}` |
| `GET /api/client/me`（无 token） | 401 | 客户面在册，缺凭据被拒 |
| `POST /api/client/login`（空体） | 400 | 客户登录端点在册，空体被拒 |
| 任一 404 | 失败 | 路由未进镜像；检查推送与重建步骤 |

另从本机把 `127.0.0.1` 换成 `10.0.0.5` 再跑一遍，验证安全组与内网可达性。

## 4. 当前操作：回滚

```powershell
ssh -i $env:USERPROFILE\.ssh\thincoder_ecs thincoder@10.0.0.5 "cd ~/thincoder-server-deploy; docker tag thincoder-server:pre-<日期> thincoder-server:0.1.0; docker compose up -d --force-recreate"
```

该命令只回滚镜像。数据库回退不在此命令内，须另按 `thincoder-server/README.md`「备份与恢复」操作；本箱已观察到的权限限制见 §9。

## 5. 当前操作：运维约束

1. SSH 必须显式携带 `-i`；不能使用默认钥匙链代替专用钥匙。
2. PowerShell 中不要在远端命令里嵌套 `$(...)`；远端命令一律平铺单层，需要内侧引号时用单引号包整条 ssh 命令。
3. 箱上运维 CLI 必须在容器内运行，不能直接在宿主机读取容器内 `/app/data` 配置路径：

   ```powershell
   ssh -i $k thincoder@10.0.0.5 "docker exec thincoder-server-deploy-server-1 node /home/node/.npm-global/lib/node_modules/@thincoder/server/src/ops/cli.mjs --config /app/config/config.json <命令>"
   ```

   命令包括 `member list` ∥ `member add` ∥ `member quota` ∥ `member passwd` ∥ `key list` ∥ `key issue`；完整参数见 `thincoder-server/README.md`「运维 CLI」。
4. 不直接改写挂载的配置或数据文件；先确认当前属主、权限与容器内路径。
5. 大构建或重装前先看 `uptime` ∥ `free -m`；若 server 机同时承担桌面 Linux 构建，不得并行硬上。
6. 盒镜像构建上下文为仓根；需要镜像源时显式传 `APT_MIRROR=<镜像主机>`，缺省不传则使用官方源：

   ```bash
   docker build -f thincoder-server/deploy/sandbox/Dockerfile --build-arg APT_MIRROR=mirrors.aliyun.com -t thincoder-sandbox:1 .
   ```

7. 节点机无法直接拉取时，本机构建件走 `docker save | gzip` → scp → `docker load`；不得把旧网络读数当作永远不可达。

## 6. 当前操作：runner 接入与镜像

runner 角色 = 远程 Docker API 节点。控制台「沙盒 → 运行面」使用节点地址 `http://10.0.0.6:2375`；Docker 引擎须监听 TCP 2375。`sudo` 需先刷票，口令不入本档。

**手工节点接线链**：

```bash
sudo mkdir -p /etc/systemd/system/docker.service.d
printf '[Service]\nExecStart=\nExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2375\n' | sudo tee /etc/systemd/system/docker.service.d/tcp.conf
sudo systemctl daemon-reload && sudo systemctl restart docker
curl -s http://127.0.0.1:2375/version
```

随后在控制台「沙盒 → 运行面 → 添加节点」填 `http://10.0.0.6:2375`；连通自检不过则不下发落库。

- **安全边界**：2375 是无鉴权的 Docker 根等价口，仅限内网。实际安全组放行状态须当次复查，§9 的旧读数不代表现在。
- **真机验收**：控制台添加节点后须在线；容器建、启、停、删各走一遍，以页面与 `docker ps` 为准。
- **托管接入**：控制台「沙盒 → 运行面 → 托管接入」填主机地址与登录方式，可选 sudo 口令。server 端 agent 执行探明、执行与登记；成功 = 任务区「已就绪」，失败须显示停在哪步及逐句原因。手工接线链是降级径。

**基础镜像**：控制台拉取窗可直接填写带镜像源前缀的引用，例如 `docker.1ms.run/library/ubuntu:24.04`；源可用性必须当次复测。引擎级镜像源可写：

```bash
printf '{"registry-mirrors":["https://docker.1ms.run"]}' | sudo tee /etc/docker/daemon.json && sudo systemctl restart docker
```

重启不影响独立的 2375 systemd override；本地盒镜像 `thincoder-sandbox:1` 仍走 §5 的构建与搬运链。

## 7. dated 读数：server 机布局（2026-10-10，未复测）

本表只记录当次实读。路径、属主、镜像、容器与旁路状态都可能已变化，操作前须重新实读。

| 路径或对象 | 当次读数 | 属主或状态 |
|---|---|---|
| `~/thincoder` | 仓克隆；remote `origin` = gitee | thincoder |
| `~/thincoder-server-deploy/` | compose 编排档、环境变量档、`config` 与 `data` 子目录 | 目录 = thincoder；`config/` ∥ `data/` = ecs-user |
| 镜像 | `thincoder-server:0.1.0`；箱上本机构建，无 registry；compose 只引用不构建 | — |
| 容器 | `thincoder-server-deploy-server-1`；`restart: unless-stopped`；`8787:8787`；挂载 config 与 data | — |
| 旁路进程 | ollama `10.0.0.5:11434`，模型 `bge-m3`；server 的 `embedding.baseURL` 仍指向它 | 当日已停 |
| 副用 | 桌面 Linux 构建机同在 ha-proxy | 大构建与重装不宜并行 |
| 镜内运维 CLI | `/home/node/.npm-global/lib/node_modules/@thincoder/server/src/ops/cli.mjs --config /app/config/config.json` | 容器名见本表容器行 |

## 8. dated 读数：runner 机状态（2026-10-10 至 2026-10-11，未复测）

| 项 | 当次读数 |
|---|---|
| 机器 | Ubuntu 22.04.5 ∥ cgroup v2 ∥ 无 IPv6 缺省路由 ∥ 盘 40G、余约 17G；`thincoder` 在需密码的 `sudo` 组与 `docker` 组 |
| 已装版本（2026-10-10） | Docker 29.1.3（apt `docker.io`）∥ quota 4.06 ∥ Node v24.21.0（nodesource）∥ nft 1.0.2 |
| 角色 | 沙盒执行节点；控制台接入地址 `http://10.0.0.6:2375` |
| 自驻进程 | 当日无 `thincoder-runner.service`；旧服务停、unit 移走、包卸载、令牌清空，只留 Docker 引擎 |
| 盒镜像 | `thincoder-sandbox:1`；当日 Docker Hub 直拉失败，采用 .5 构建后搬运 |

## 9. dated 读数：故障与网络（2026-10-10 至 2026-10-11，未复测）

### 9.1 已观察故障

1. 漏掉 SSH `-i` 时出现 `publickey,password` 拒绝。
2. PowerShell 抢先解析远端 `$(...)`，导致两处 `docker exec` 命令碎裂；平铺单层命令当日可行。
3. 以 `thincoder` 跑 `thincoder-server/deploy/backup.mjs` 出现 `EACCES: mkdir '.../config/backups'`；当日 `config/` 属 `ecs-user` 且无免密 sudo。宿主机直接跑运维 CLI 也因 `/app/data` 容器路径与权限失败。
4. server 机曾在旁路进程高负载时出现 sshd 饿死，须重启恢复。
5. runner 机容器内访问 `deb.debian.org` 当日为 19 kB/s，9.4MB 用时 8min13s，直建超过 20min。
6. runner 机当日访问 `registry-1.docker.io:443` 为 i/o timeout；本次 111MB tgz 盒镜像经 .5 → 本机 → .6 搬运。

### 9.2 安全组读数（2026-10-11）

当日 .6 安全组尚未放行 10.0.0.5 → 2375：ping 与 22 可达，2375 拒绝；机器本机 ufw inactive、INPUT ACCEPT。控制台添加节点自检超时，报「连通自检失败：节点响应超时（3000ms）」。该读数不代表当前仍未放行。

### 9.3 镜像源读数（2026-10-11）

| 源 | 当日可达性 | 当日实拉 |
|---|---|---|
| `docker.1ms.run` | 401 | 成功：`docker.1ms.run/library/ubuntu:24.04` 返回 200，10.4s，119MB；建容器可跑 |
| `docker.m.daocloud.io` | 401 | 失败：502，清单与层均失败 |
| `registry.cn-hangzhou.aliyuncs.com` | 401 | 未拉；自建镜像源用 |
| `ghcr.io` ∥ `quay.io` | 401 | 未拉 |
| `registry-1.docker.io` | i/o timeout；当日解析到 173.252.88.67 | — |
| 网易 ∥ 中科大 ∥ 百度镜像 | `000` | — |

当日 .6 无 `/etc/docker/daemon.json`；.5 已配 `docker.1panel.live` ∥ `docker.m.daocloud.io` ∥ `docker.1ms.run`。这些配置与可达性均须在使用前重测。

## 10. 相关档

- 产品侧部署设计 = `docs/server/design/ops/OPS.md`「部署与更新」∥ `thincoder-server/README.md`「首部署清单」。
- 运维命令与备份恢复 = `thincoder-server/README.md`「运维 CLI」∥「备份与恢复」。
- 三端发布流程 = `docs/RELEASE.md`。
