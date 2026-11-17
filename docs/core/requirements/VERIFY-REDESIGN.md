# verify 完成前门禁（VERIFY-REDESIGN）· 需求

> 设计 = `docs/core/design/VERIFY-REDESIGN.md`；测试职责 = `TESTING.md`。

## 1. 定位

verify 是语言、框架和项目无关的声明式收尾门。它不执行测试，不内置项目映射，只机械检查验证声明并报告变更与自审面。

## 2. 功能需求

| # | 需求 |
|---|---|
| F1 | verification.status=passed 放行；failed 阻断 |
| F2 | skipped 必须有具体 summary 才放行；无声明或非法值阻断 |
| F3 | 阻断回执列出变更文件，并引导按项目 AGENTS.md 决定验证 |
| F4 | doc-only 快路径可免声明，但显式 failed 永远阻断 |
| F5 | git diff、task、自审和编辑器诊断是提示，不冒充验证通过 |

## 3. 非功能需求

- 不执行 command，不把 command 文本当已运行证据。
- basis 可选，缺失只提示，不改变 passed/skipped 判定。
- 可选 node --check 提示不进入门禁。
- 同一输入在所有宿主得到同一判定。

## 4. 完成与 goal

普通模式 verifyGuard 按配置和当前预算推回；工程模式由流程链负责。goal complete 在本 run 有文件改动且未 verify 时拒绝。

verify 不代替真实测试，也不把 skipped 说成已验证。
