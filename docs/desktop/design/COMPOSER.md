# Desktop 输入区 · 设计

> 需求 = `docs/desktop/requirements/COMPOSER.md`。
> 最近先例：`docs/vsc/design/WEBVIEW-INPUT.md` 的 composer 与 core 的 SESSION/queued。对齐 = 共享控件、宿主权威。
> 勘察证据：已读模型档位、附件、队列、@ 与 slash。相关 = 当前输入区。

## 1. 模型偏好

session:prefs 写 provider/model/effort；effort 候选来自 specForModel。applySession 在写后重施，在飞回合顺延。

模型菜单行只分组展开，模型条目 click 选择。显式实变触发 defaultModel carryover；失败回滚选中并显示，carryover 失败不撤销槽写。

## 2. 队列

宿主 queued-input/window-queue 按 key 持队，容量和合并计划来自 core。msg:send 忙时返回 queued，ev:queue.items 是渲染唯一快照。

步边界消费普通文本；含图批留到可异步处理的送达路径。回合尾先续发再进入挂起。中止清队，零续发。

## 3. 附件与引用

图片经 dataURL 上送，主进程落盘/降级；文本附件由 render-core 读取与内联，所有拒绝原因可见。

injectAtRefs 仅在用户回合模型输入前执行，stripAtRefs 仅用于显示/标题；队列与气泡保留原文。

## 4. slash 与提示

slash-commands 解析当前命令和别名，复用模型菜单与 session:flags/help 实现。未知/参数不支持不发送并保留文本。

providerState、发送失败、附件降级和 prefs 失败使用各自 notice，成功只清对应通道。

## 5. 验证

验证偏好写回、失败回滚、队列快照、图片批、@ 注入/剥离、slash 与提示清位。
