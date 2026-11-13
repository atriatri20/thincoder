# Desktop 会话 · 设计

> 需求 = `docs/desktop/requirements/SESSIONS.md`。
> 最近先例：`docs/core/design/SESSION.md` 的槽与 `docs/vsc/design/WEBVIEW.md` 的会话栏。对齐 = core 槽单源、VSC 形控制。
> 勘察证据：已读端标识、列表、删除、标题和重启恢复。相关 = 当前桌面会话域。

## 1. core 接入

session-slots 声明 END=desktop 并转交 core 会话原语。session-io 负责 loadAgentSlot/saveAgentSlot，session-actions/sessions 负责写动作与列表投影。

createdBy 仅表示创建端，缺失不标注；占用端由 peer 机制另判，不能冒充。

## 2. 控制面

session-control 构树下拉，含项目钮、活动标题、新建、provider/messageCount/updated、位标和行内改名/删除。

删除仅在多于一个会话时显示，主侧 last-session 同门；删除活动会话后邻位接管或关页。occupied 切换显示警告但允许继续。

messageCount 非有限值时不显示，ledger 异常在下拉首行显示非交互注记。

## 3. 标题与重启

settleTurn 按标题 → 整档保存 → usage → 终局事件顺序，ensureSessionTitle 自守卫，墓碑检查防旧回合复活。

restoreLastProject 读取桌面 manifest 最新有效 cwd，窗口创建前设置项目，renderer 经既有 resume 链接续；无记录/目录失效保持冷态。

## 4. 验证

验证跨端槽、列表真值、末项删除、接管、标题时序、墓碑、重启恢复与端隔离。
