# 轮末探索蒸馏时序（SEND-STALL-DISTILL）· 设计

> 需求 = `docs/core/requirements/SEND-STALL-DISTILL.md`。
> 最近先例：`CONTEXT-COMPACTION.md` 的双线与 `AGENT-LOOP.md` 的 run 收尾。对齐 = 先释放 UI，再异步落位。
> 勘察证据：已读 pending、下一轮 await、onDistilled、独立 signal 与退出 flush。相关 = 当前 depth-0 面。

## 1. 时序

```text
run 完成 → onComplete → 发射 distill，不 await → 返回回答
下一轮开始 → await pending → push 新输入
蒸馏实际替换 → onDistilled → 保存
```

仅 depth-0 创建。pending 挂在跨回合存活的会话/面板载体上。

## 2. 历史与保存

蒸馏原位替换机读 history，保持数组引用，失效 token 基线。全史不动。

onDistilled 只在实际替换后调用。宿主捕获回合开始时的槽位，保存前再检查当前槽位，避免串写。

## 3. 下一轮竞态

run-start 在任何新输入 push 前取出并 await pending。若面板每轮重建 history，面板入口也须在重建前等待同一 pending。

resume 遇到已清 pending 时幂等。

## 4. 生命周期

用户运行 signal 不传给蒸馏。VSC/Desktop 等面板使用独立 controller，只在 dispose 或会话切换时中止。

CLI 退出 flush 使用当前有界等待；等待不摘除 pending，后续 run 仍可正确 await。

## 5. 失败

蒸馏失败返回 null，不替换、不调用 onDistilled。发射侧处理 rejection，避免 unhandled rejection。

原始机读结果和完整全史都保留。

## 6. 验证

用可控 promise 验证 onComplete 先发生、下一轮 push 后发生、快速连发、保存槽位、Stop 不杀、dispose 杀、失败不保存和 CLI flush。
