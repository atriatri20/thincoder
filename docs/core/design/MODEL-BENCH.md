# 模型基准套件（MODEL-BENCH）· 设计

> 需求与运行说明 = `bench/README.md`；模型机制 = `PROVIDER.md`。
> 最近先例：`TESTING.md` 的可重复证据与 `PROVIDER.md` 的 usage。对齐 = 同题同判据、失败也是读数。
> 勘察证据：已读 run、题集版本、判官、计时、报告和价格口径。相关 = 当前 bench 独立评估面。

## 1. 范围

bench/ 是独立模型评估工具，不进入产品包。run.mjs 读取 models、题集和维度，经 core chat 调用，判分并写同名 JSON/Markdown 报告。

## 2. 版本轴

SUITE_VERSION 随题面、隐藏用例、判分规则、判官身份/rubric、计时或结果数值规则变化递增。

报告呈现、价格数据、运行参数披露和采集完整度补全不单独冒充新题集版本。价格有 asOf/source。

## 3. 判分

确定性条件用机器断言。需要语义解释的项使用当前判官对、仲裁和失败替代链；机械失败的复核按当前规则记录。

人工 lane 只记录，不计自动通过。判官/复核成本与被测成本分账。所有定判或 error 都有可读原因。

## 4. 计时与 token

TTFT 是首个非空 content/reasoning delta；totalMs 是调用发起到返回或失败。失败调用也记耗时。

tok/s 使用当前逐调用聚合公式。token 只取真实 usage，缺失为 null 并告警，不估算。

## 5. 运行

支持 models/dims/label/n/max-tokens/timeout/results-dir/judge-config/prices/dry-run、recompute 与 rejudge 当前入口。

参数、未知模型、缺配置和预检失败是基建错误；模型答错是评估数据。SIGINT 中止并不留半程报告。已有报告不覆盖。

## 6. 结果

JSON 保存 suiteVersion、运行参数、价格、判官配置/调用、逐模型逐例 runs/calls/metrics、聚合和 warnings。

字段白名单构造并脱敏。逐调用原子账目支持 recompute；rejudge 写新报告并保留来源。

## 7. 验证

dry-run 覆盖判分、指标、报告与脱敏；recompute 不触网；负例覆盖未知模型、缺 usage、判官失败、报告已存在和中断。
