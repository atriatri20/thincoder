# CLI 功能全览 · 需求

> 机制由各 core/CLI 专题设计档负责；本清单只登记当前能力，不复制实现细节。

## 1. 工具面

- 文件：read/write/edit/insert_after/hashline_edit/apply_patch/delete/file_ops/read_image。
- 质量：lint/lsp/verify/execute。
- Shell 与搜索：bash/glob/grep/ls/tree/websearch/fetch。
- 代码理解：repo_outline/code_search/doc_search。
- 记忆与配置：memory/settings。
- Agent：task/plan/goal/subagent/timer/advisor/eng/question/skill/read_history/recent_changes/batch/consult_start/consult_stop/peer_instances。
- 版本控制：git 与 checkpoint。

apply_patch 在 hunk 阶段全预检，写盘阶段失败按真实已提交文件报告，不承诺跨文件回滚。read_image 仅对当前多模态能力装配。

## 2. Slash 命令

当前命令由 `thincoder-cli/src/tui/slash-commands.mjs` 注册，包括：

- Agent：plan/auto/eng/advisor/model/submodel/goal/timers/think。
- Session：new/session/rename/clear/copy/fold/undo。
- Project：init/skills/mcp/reindex/extract。
- System：shell/upgrade/config/team/restore/exit/help。

别名以同一注册表为准。模型选择、子模型、MCP、团队、配置和删除流程遵循各自专题设计。

## 3. 终端与会话

TUI 提供 ANSI 增量渲染、流式文本/思考、权限审批、busy 输入队列、中断注入、文本/图片粘贴、picker、工具区块和会话恢复。

会话按 cwd 隔离并持久化 history 与当前状态；checkpoint 可恢复；模型适配由 core provider/specs 负责。

## 4. 对外文档契约

README、USAGE、补全和用户可见提示所列命令、旗标、配置键、格式和环境变量必须指向实装可达面。

能力已存在时修文档；能力缺失时须走需求变更，不能用删实现或编造文档掩盖。发布历史不属于当前能力清单。

## 5. 护栏

- 路径按当前信任模型与审批门。
- bash 不靠文本黑名单，审批和快照是实际防线。
- verify 声明、外部内容隔离、视觉门、限速与输出上限遵循 core。
- 崩溃取证见 CRASH-REPORTS。
- 磁盘根下默认会话入口按当前硬门拒绝，信息与维护命令按 CLI-ENTRY 放行；无强开旗。
