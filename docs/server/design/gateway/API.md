# Server Gateway · 设计

> 总览 = `docs/server/design/PROJECT.md`；公网入口 = `PUBLICNET.md`。
> 最近先例：server 注册行分派与 core OpenAI 客户端。对齐 = 选择性中继、逐块透传、服务端判权。
> 勘察证据：已读 OpenAI 三面、provider 管理、系统/沙盒/agent/团队路由。相关 = 当前 gateway。

## 1. 路由与鉴权

server.mjs 按 method+path 注册，未命中 404。/v1 与客户端/盒面用 Bearer key，控制台用会话 cookie，admin 面由 requireAdmin 强制。

主要路由族包括 `/v1/*`、`/api/login`、`/api/me*`、`/api/members*`、`/api/usage*`、`/api/admin/*`、`/api/client/*`、`/api/projects*`、`/api/ledger*`、`/api/box/*`、git webhook 与静态面；细节归对应域档。

## 2. OpenAI 面

chat 支持流式与非流式，models 只列当前成员可用 chat 外标，embeddings 走独立引擎且缺配明确 404。

模型以别名或 provider/model 精确匹配，别名全服唯一；成员禁用优先于配额，配额优先于模型限流，均在转发前拒绝。

SSE 原样 pipe，必要时注入 include_usage，tap 只读提取 usage。断连中止上游，准入拒绝不记用量。已进入 forwardRequest 的请求只记一次终态，token 三列取实际上游 usage，缺值保持 NULL。

| 上游/连接情况 | 客户端可见结果 | usage 终态与 token |
|---|---|---|
| 连接或读取响应前失败 | 502 `upstream_error` 统一错误形 | error；NULL |
| 上游 HTTP ≥400 | 原状态码和 body 原样转发，不重包 | error；NULL，即使错误体带 usage 也不采 |
| 上游其他非 2xx，如 3xx | 同样原样转发，不跟随为业务成功页 | 当前代码以 `<400` 判 ok；正常读完记 ok，能解析才记 usage，否则 NULL |
| HTTP <400 的流内含 error 数据或无 [DONE] 即到 EOF | 已收字节原样转发后正常 end；不补错误、不补 [DONE] | ok；记 tap 最后一次读到的 usage，没有则 NULL |
| 流迭代/中继抛错，响应头未发 | 502 `upstream_error` | error；NULL |
| 流迭代/中继抛错，响应头已发 | 直接 destroy，客户端看到连接中断 | error；NULL |
| 客户端断连 | 中止上游，不再保证客户端有终帧 | aborted；NULL |

正常非流式 HTTP <400 响应原样转发并记 ok，usage 从 JSON body 提取；非 JSON 或缺 usage 为 NULL。recordUsage 在同一事务写 usage 与派生表；记账写失败只记录服务日志，不改写已经产生的客户端响应。

provider 库为运行时真源，config providers 仅种子。写经校验→候选运行时→落库→原子换表，在途请求保持快照。

## 3. 管理与诊断

provider CRUD/discover/presets 的 key 只掩码或 env 引用，models/settings/modelMeta/alias/proxy 按域校验。发现失败明确 502，不伪造手填成功。

healthz 公开只读，DB 失败 503；系统、向量、配置和代理测试均为真实读数。诊断不写用量，写配置原子并审计。

## 4. 验证

验证 401/403/404/429、模型别名与禁用、配额/限流、SSE/usage、热更新、密钥零泄漏、配置负例和真实诊断。
