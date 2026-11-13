# Desktop 产品定性 · 需求

> 共享契约 = `docs/core/requirements/PROJECT.md`；界面 = `UI.md`。

## 1. 定位

Desktop 为不使用 VS Code 或终端的用户提供独立 Electron 入口。与 CLI/VSC 同级，使用同一 core、config 和 cwd 会话存储。

单窗口服务一个工作目录；多项目并行使用多个实例。前端使用原生 DOM 与 render-core，不另建 agent 或数据层。

## 2. 主界面

- 单会话面板，顶部下拉切换/新建会话，无左侧项目树。
- 中区为对话流、工具/审批/提问/计划/目标卡与输入区；右侧活动池承载子代理、consult、advisor 与队列，可折叠。
- provider/model/effort 只在输入控件行编辑；AUTO/PLAN/ADVISOR/MODE 在状态行显示，MODE 当前值取自 minimal/normal/engineering。
- 对话包含流式正文、推理、工具结果、错误和代码复制；活动终态归档入流。
- 状态行显示当前上下文、任务、耗时、turn、timer、标题、排队、团队态与跨会话提醒，缺失读数不伪造。
- 首启可在无终端情况下配置 provider、校验、选择目录；已有配置直接进入。
- 支持 slash 命令、附件、复制导出、会话改名/删除和真实提问作答。

## 3. 对齐与边界

状态行以 CLI 当前信息为参照，会话和活动内容以 VSC/render-core 为参照。共同机制优先使用 core/render-core；真端差需宿主证据。

共享渲染核需求的唯一 owner = `docs/render-core/requirements/RENDER-CORE.md`；本档只保留桌面宿主职责，不复制其接口、阈值和状态机。

不提供文件树、编辑器、内置终端或常驻多项目面板。用户可见功能缺口不得用“桌面简化”静默略过。

## 4. 非功能

三进程隔离、窄 IPC、原生 ESM 零构建；配置项有设置 UI；长会话渲染和内存有界；主题、布局和用户偏好按当前持久化。
