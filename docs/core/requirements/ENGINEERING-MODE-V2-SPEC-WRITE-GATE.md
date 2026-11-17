# Function Spec · M4 写权门禁

> 当前权威 = `docs/core/design/PORTABILITY.md`、`CROSS-REPO-WRITE.md`、`ADVISOR-GUARDS.md`、`DESIGN-TOKEN-SETTLEMENT.md`。

## ① 模块目标

写权由机械门和角色装配共同保证：工程实现需要有效凭证，父侧写入需要当前项目有效在途账，评审在途保护被审对象，受限管理面只由主 agent 写。

## ② 功能点

1. **凭证门**：eng-coder 需要匹配且未过期的 designToken，并通过批归属与封印校验。
2. **父侧写门**：适用工具携带有效 ledger 与项目归属；faceOf 决定文档面、manifest 面、产品面或出辖。
3. **冻结窗**：设计评审在途时，当前文件写路对被审设计档和绑定批次按 ADVISOR-GUARDS 保护。
4. **管理面**：ledger 与 manifest 写操作只装配给主 agent。
5. **跨仓**：writableRepos 与窄口按 CROSS-REPO-WRITE；publicRepos 不授写权。
6. **一致性**：任务范围、工具授权和业务门不一致时停止上报，不静默放行。
7. **普通模式**：不套用工程凭证和父侧写锁；工具自身业务门仍有效。

## ③ 边界

- 不把分类器 temp/aux/state 当写权豁免。
- 不用 files 调度声明代替授权。
- 不承诺冻结窗覆盖不可见写路。
- 不在本规格复制 token 签发或评审判据。

## ④ 验收

| # | 判据 |
|---|---|
| AC-M4-1 | 无有效凭证的工程实现写被拒 |
| AC-M4-2 | 无有效在途账或项目归属的父侧写被拒 |
| AC-M4-3 | 冻结窗命中当前文件写路时拒绝；越界写路如实披露 |
| AC-M4-4 | 非主 agent 无 ledger/manifest 写面 |
| AC-M4-5 | publicRepos 不授写，writableRepos 按声明生效 |
| AC-M4-6 | 普通模式不被误加工程门 |

## ⑤ 依赖

MANIFEST、PATH-RESOLUTION、BATCH、ADVISOR、TOKEN。
