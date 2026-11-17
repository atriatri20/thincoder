# 代理出口（PROXY）· 设计

> 需求 = `docs/core/requirements/CONFIG.md`；provider = `PROVIDER.md`；超时 = `TIMEOUT-DIGEST.md`。
> 最近先例：`MULTI-INSTANCE-COLLAB.md` 的配置归一与 `PROVIDER.md` 的分阶段超时。对齐 = 显式启用、单点传输。
> 勘察证据：已读 proxy 配置、逐渠消费、CONNECT、chunked/CE 和 TLS。相关 = 当前 proxy.uri 与 provider.proxy。

## 1. 配置

proxy 规范形为 `{uri,web}`；旧裸字符串按当前兼容读取。normalizeProxy 统一合法形态。

providers[].proxy:true 且 proxy.uri 存在时，该渠道模型请求使用代理；默认直连。模型请求不使用环境变量作隐式代理。

web 工具按逐次 proxy 参数，不自动继承 config。web 字段只服务当前测试入口，UI 不得暗示它全局控制 web 工具。

## 2. 目标与传输

proxyFetch(url,opts,proxyUri)：

- 无代理：原生 fetch。
- HTTPS 目标：HTTP CONNECT + TLS。
- HTTP 目标：经典 absolute-form 转发。
- loopback：isLoopbackTarget 命中即直连。

坏代理 URI 给可读错误。CONNECT/TLS、响应头、body 按当前分阶段超时。

## 3. 响应体

streamHttpResponse 统一处理流式 body：

- chunked 由 createChunkedDecoder 剥帧，畸形按当前透传规则。
- content-encoding 的已知单 token 用 node:zlib 解压，未知/多 token 透传。
- 背压传到上游，drain 也算消费进度。
- body 终止通过 destroyBody/terminateBody，防止未处理 error。
- 直连 web ReadableStream 使用 IDLE_ABORT 通道。

## 4. TLS

CONNECT 内 TLS 默认 rejectUnauthorized=true。只有 opts.insecureTls===true 才显式放宽；它是编程 opts，不是隐式配置。

## 5. 宿主

core 提供注入与传输，CLI/VSC/Desktop 在各自 provider 装配点调用。server 网关的对应实现由 server 设计档负责。

## 6. 验证

验证逐渠开关、env 不隐式代理模型、loopback、坏 URI、CONNECT/转发、chunked 边界、解压失败、背压、断流和 TLS 默认拒绝。
