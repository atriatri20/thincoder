# 超时、报告落盘与完成门（TIMEOUT-DIGEST）· 设计

> 需求分布 = `AGENT-PARAMS.md`、`AGENT-LOOP.md`、`TOOLS.md`。
> 最近先例：`AGENT-LOOP-ASYNC-POOL.md` 的 digest 账与 `PROVIDER.md` 的分阶段超时。对齐 = 同一预算与真实池态。
> 勘察证据：已读 body/first-chunk 分窗、offload、pending task 门。相关 = 配置 UI 与失败可见。

## 1. 响应超时

### 1.1 body 空闲

agent.bodyIdleTimeoutMs 默认 120000ms，经 loadConfig 提升到 provider，由 effectiveBodyIdleMs 单点解析。

非有限数、零或负数回退默认，不表示禁用。settings 与当前设置 UI 都可读写，下一请求使用新值。

### 1.2 首 chunk

响应体首字节前使用 effectiveFetchTimeoutMs；首字节后切换为 bodyIdleTimeoutMs。切换不可逆。

readSSE 与 parseGeminiStream 接收 idleMs 与 firstChunkMs；缺省 firstChunkMs 时保持 idleMs 行为。

首 chunk 与流中途使用不同错误文案和 abortInfo.detail，能区分 prefill 等待与流中断。

## 2. 异步报告落盘

offloadToolResult 的 force 支让 subagent/advisor/escalate 报告无条件落盘。

- 短报告：正文一份 + 完整文件路径。
- 超当前 preview 预算：头尾预览 + 路径。
- 超轮 digest 预算：清单行 + 路径，正文仍完整落盘。
- 落盘失败：保留可用正文或预览并明确 offload failed，不吞报告。

persistOverflowReport 与 offloadToolResult 使用同一测试目录缝；生产目录位于当前用户工具结果目录。

## 3. 完成门

pending-task 推回只在 depth-0、普通模式、poolLive(agent)=false 时考虑。后台条目在飞时不因 pending task 拖住收尾。

task 更新重置当前提醒预算；池在飞时更新不制造推回。

poolLive 与挂起尾使用同一判据，不另算池状态。

## 4. 验证

验证默认与非法超时、settings/UI、首帧慢、首帧后停摆、短/长报告、超轮预算、落盘失败、池在飞与池空后的完成门。
