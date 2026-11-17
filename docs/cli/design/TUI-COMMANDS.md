# TUI 命令与选择面 · 设计

> 需求 = `docs/cli/requirements/TUI.md`。
> 最近先例：`TUI.md` 的模态与 `CONFIG.md` 的原子配置。对齐 = 命令薄壳、配置单写者。
> 勘察证据：已读 slash 注册、picker、wizard、provider/MCP/team 与删除门。相关 = 当前 CLI 交互面。

## 1. 命令

SLASH_COMMANDS/SLASH_ALIASES/HANDLERS 是注册面。非 busy 直接执行，busy 斜杠不执行不入队，异常显示 `[error]`。

/model 管理会话与 provider；/submodel 管理角色模型；/shell 管理执行器；/config 管理配置；/mcp 管理服务器；/advisor 管理评审；/undo 消费 undo-stack；/team 管理登录。

/tiny、/normal、/eng 共用会话 mode 写点。当前 tiny 再执行 /tiny 返回 normal，否则进入 tiny；当前 engineering 再执行 /eng 返回 normal，否则进入 engineering；/normal 无条件进入 normal。三个命令都保存会话槽，/config 的 agent.mode 只负责新会话默认值并使用固定三选项。

## 2. 选择与向导

picker 支持过滤、鼠标、栈和位置；wizard 与 question 保留各自流程，但环绕、选中可见和 Esc 语义一致。

showPicker 在校验 entries 是数组后才改变栈；Promise 输入给 await 提示。

首启 route 提供团队登录、本地 provider 和以后再说。团队步使用 ask-steps，密码掩码，回退保留非密码输入。成功后复读团队与 provider 状态。

## 3. 宽度与审批

picker 行按 prefix/text/marker/note 组装，宽度超限时 note 优先截断，不可用警示不放在最先牺牲段。

askPermission、askBatchPermission、askQuestion 使用当前 y/n/a、approveAll/oneByOne 和自由文本契约。手动 auto-turn 不伪弹无人值守卡。

## 4. 删除确认

provider/MCP 删除统一经 confirmDelete，默认 Cancel。取消在 persistRaw 前返回，零盘写零内存变更；缺 confirmDelete 报错。

表单清空保存是编辑，不等同删除入口；可重填 reset 不套用不可复得判据。

## 5. 验证

验证注册/补全、picker 非法 entries、宽度、向导两路、密码、模型/团队复读、删除确认与取消。
