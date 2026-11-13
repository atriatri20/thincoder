# 提示词效果夹具（PROMPT-FIXTURE）· 设计

> 提示词机制 = `PROMPT-SYSTEM.md`；运行参数以 `prompt-fixture/run.mjs` 当前入口为准。
> 最近先例：`TESTING.md` 的可复现证据与 `MODEL-BENCH.md` 的报告对。对齐 = 副本实验、读数不代替验收。
> 勘察证据：已读物化、场景、工具桩、统计与报告。相关 = 当前独立 prompt-fixture 工具。

## 1. 范围

prompt-fixture/ 在提示词副本上运行 A/B 场景，输出分布、差与当前统计区间。它不修改正本，不内置“改动有效”的业务门槛，不替代集成测试。

## 2. 物化

baseline 从当前正本逐字节生成并校验摘要。变体由声明的 find/replace 产生；find 必须唯一，重放结果与落盘逐字节一致。

装配使用 core 的当前槽位与注入规则，baseline 装配与产品同路径一致。临时副本默认退出清理。

## 3. 场景与工具

场景声明 id/version/prompt/sandbox/tools/maxRounds/followUps/verdicts。谓词与 always 末条按当前封闭 schema 校验。

工具使用当前真实 schema 或明确登记的夹具子面。桩不执行真实写或 spawn；未知工具显式错误并计数。

## 4. 运行

run.mjs 支持当前 copies/scenarios/models/n/label/max-calls/call-timeout/results-dir/out/keep-temp/dry-run 参数。

live 必须明确模型与可用凭据；预计调用超预算时启动前拒绝。单次最终失败记 error，不暗中补跑。

报告 JSON 不含破坏确定性的时间戳或绝对临时路径；同参数 dry-run 可逐字节复现。

## 5. 比较

compare.mjs 只在版本与正本摘要一致时给差；不一致标 not comparable。统计实现使用当前 Wilson/Newcombe/Fisher 纯函数。

报告与结果归 prompt-fixture/results，不覆盖既有报告。

## 6. 验证

验证 baseline 摘要、变体唯一性、装配等价、场景 schema、桩零副作用、未知工具、预算拒绝、失败记录、dry-run 确定性和不可比分支。
