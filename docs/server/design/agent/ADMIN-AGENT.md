# Server 管理面 Agent · 设计

> 总览 = `docs/server/design/PROJECT.md`；页面 = `../webui/CHAT.md`；成员面 = `MEMBER-AGENT.md`。
> 最近先例：core 工具环与三端会话。对齐 = 同工具语义、服务端 DB/帧/管理适配。
> 勘察证据：已读聊天驱动、工具、审批、环境、唤醒和网关出口。相关 = 当前管理 agent。

## 1. 会话与回合

管理 chat 仅 admin，会话与消息存 agent_chats/agent_chat_messages，逐条落库。POST messages 以 NDJSON 返回 turn/delta/usage/call/result/ask/end，断连不影响回合。

同会话在途拒第二回合，模型/档位/自动审批为会话字段。异常、预算、空回合、中止和重启均有真实终态与 notice/audit。

## 2. 工具与审批

members/providers/models/usage/audit/runners/docker/exec/mcp 复用各域实现；get_current_time/process/timer/ls/read/grep/bash/read_history 复用 core。

写类调用弹单件或批审批，拒绝不执行并回灌，断流/中止/无人值守兜底拒；always 按会话 auto_approve 持久化。每次调用可读审计并掩蔽秘密。

## 3. 环境与异步

每回合尾位注入时间、身份、cwd、当前模型/档位、所管读数与真实能力，瞬态不回放。

timer 空闲唤醒和 bash async 使用 core 闩/池，提醒落库后自动开轮，process 可取消，中止杀树并防迟到摘要。

## 4. 模型出口与复用

管理会话用发送者 admin-agent key 经本 server /v1 loopback，完整经过鉴权、配额、限流与用量；模型测试同链并报告真实延迟/吞吐。

core 的协议、压缩、provider 与工具按清单复用，宿主自持 DB/NDJSON 和管理环，不复制 core 状态机。

## 5. 验证

验证帧序/重放、判权、工具负例、审批拒绝、环境瞬态、timer/异步、网关出账和模型测试。
