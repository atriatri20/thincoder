# Server 沙盒控制面 · 设计

> 总览 = `docs/server/design/PROJECT.md`；执行细节 = `EXECUTION.md`。
> 最近先例：server 域表与 Docker API。对齐 = 容器强制、引擎真源、server 启动独立。
> 勘察证据：已读两平面、对象、节点、容器、镜像、卷与审计。相关 = 当前控制面。

## 1. 形态与对象

server 只编排，runner 远程执行；无可用 runner 时沙盒端点 503 sandbox_unavailable，其余服务不受影响。

sandbox_runners 同时承载主机与 SSH/TLS 元数据，sandbox_workspaces 绑定负责人、节点、scoped key、资源覆写和底座，checkpoints/settings/image_sources/registry_credentials 各管本域。

容器、镜像和卷以 Docker 引擎读数为真，不维护第二镜像。

## 2. 节点与容器

节点登记先自检验版本，失败零落库；读时探活，离线读数不外推。删除需选择保留或连删，失败保留登记。

工作区读面只有 `boxState=running|stopped`：引擎容器仅在其 State 为 running 时映射 running，其余引擎态、容器不在和未绑定节点均映射 stopped；引擎不可达另置 `unreachable=true`，不得把 stopped 当作可达性证明。通用容器管理面保留引擎原始 state/status，不套用工作区二态。

工作区管理动作只有 start、stop、destroy、rotate-key、restore；成员面只有 start、stop、destroy。合法动作与结果如下，表外没有第三种工作区盒态。

| 当前 boxState | 动作 | 当前结果 |
|---|---|---|
| running | start | 幂等 noop，保持 running |
| running | stop | 停容器，转为 stopped，保卷 |
| stopped | start | 走确保链并启动，转为 running |
| stopped | stop | 幂等 noop，保持 stopped，保卷 |
| running/stopped | rotate-key | 换 key、删旧容器并重建启动；卷保留 |
| running/stopped | restore | 管理面选择快照后停、清卷、解包、启动；缺省最新快照 |
| running/stopped | destroy | 必须 `confirm:true`；删工作区行，默认同时删卷和快照 |

工作区没有独立 pending/busy 状态、休眠状态或休眠动作，也没有动作队列；TTL 到期实际调用停止并记录 `stopReason=idle_ttl|wallclock_ttl`，不是休眠。需求中的休眠因此仍是未实现能力，不得虚构迁移边。

未绑定或绑定节点不可用时工作区动作拒绝为 503 `sandbox_unavailable`，链失败为 502 且保留工作区行供幂等重试。通用容器启动/停止的引擎 304 按幂等成功，动作目标 404 为 `not_found`，强杀 409 为 400 人话，其余引擎错误按 502；创建时引擎 404/409 为 400。所有写动作审计。

## 3. 镜像、卷与凭据

镜像列表/拉取/删除、源 CRUD/目录/标签/筛选/预填均走真实远端，Hub 不支持目录时明示，不伪造搜索。

卷列表和建容器选卷可读；在用卷拒删，删除需确认。工作区 bind 卷不与普通命名卷混管。

SSH、TLS、私有仓和工作区秘密加密保存且零回显，配置与生命周期动作写审计。

## 4. 验证

验证无 runner 隔离、节点失败、容器状态负例、镜像流内错误、卷保护、TLS/凭据零泄漏和审计。
