# Desktop 渲染工艺 · 设计

> 通道 = `IPC.md`；界面 = `UI.md`。
> 最近先例：`docs/render-core/design/RENDER-CORE.md` 的帧、流式与滚动。对齐 = 状态驱动、增量更新、全史在盘。
> 勘察证据：已读 store、flowOps、记录、窗口与跟滚。相关 = 当前 renderer。

## 1. 状态与帧

store 保存会话分键切片，events.mjs 将 ev 归约，frame-dispatch 按变更键更新。核 frame 做 rAF 合并，帧尾统一处理布局、滚动与焦点。

视图优先纯描述符与薄挂载，事件归约可在无 DOM 环境测试；用户文案经 i18n。

## 2. 流模型

flowOps 记录 build/insert/cut；flowStep 按当前 DOM 账与模型窗执行摘、造、刷，不无条件全量重建。

页读 applyPage 使用 historyWindow，digest/subagent 记录与消息按同一条目空间分页。恢复序以记录为准。

巨块按当前分段窗口处理，文本仍在模型，搜索可披露隐藏段。

## 3. 滚动与回填

渲染窗口只保留当前可见块，data-hidden 表示未渲染更早块，摘要可触发 backfill。

回填 prepend 后按 scrollHeight 增量补偿；新内容默认跟尾，用户上滚解钉，近底或回底恢复。inFlight 防重入。

待发送带在输入区上方，不占 data-blocks；digest/help/timer/inbox 等非块行也不计入块数。

## 4. 验证

验证 flowStep、记录序、回填锚、跟滚、非块计数、分段搜索与帧幂等。
