# Desktop 设置与首启 · 设计

> 需求 = `docs/desktop/requirements/SETTINGS.md`。
> 最近先例：`docs/vsc/design/SETTINGS.md` 的控件与 `CONFIG.md` 的原子写。对齐 = 同值同行为、设置面复用。
> 勘察证据：已读七段、弹窗、向导、provider/MCP 和保存面。相关 = 当前桌面设置域。

## 1. 设置与弹窗

设置页按 providers/agent/mcp/env/tools/models/team 等当前段组织，模型选择归 composer。

openSettingsModal 使用 settings.modal 和 SCOPES，复用段体、读取与 exits.handlers。页与弹窗共享草稿状态，关闭只复位对应组。

paintSettings 捕获并复填 data-draft、焦点和滚动，外部写只刷新在场设置面。

## 2. 写路径

所有写经 core writeConfigAtomic。agent patch 的 null 表示删除，slot 权威 mode/guard 只走 session:flags；agent.mode 配置只决定新会话默认值。

provider 探活与保存按当前独立规则；MCP 探活失败不写。删除经 settings-confirm，取消零写。

MCP env/headers 使用行式键值，重复后胜、全空删除，token 不回显。

## 3. 首启

configured 决定是否进入向导。route 提供本地/团队/以后再说，表单复用设置出口，密码换路即清。

本地保存并继续先存后进；校验结果在对应行显示。finishWizard 未配置时显示去保存或仍退出，不静默丢数据。

## 4. 验证

验证弹窗复用、草稿、patch 删除、slot 权威、MCP、首启两路、保存失败和完成护栏。
