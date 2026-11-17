# Desktop 真 Electron 集成测试 · 设计

> 上位规则 = `docs/core/design/TESTING.md`；快筛边界 = `WEB-QUICKCHECK.md`。
> 最近先例：桌面 test 单入口与 VSC 集成用例。对齐 = 真产品入口、隔离家、业务可观察断言。
> 勘察证据：已读 Playwright 启动、boot 判据、隔离、PNG 与用例面。相关 = 当前 E2E 工艺。

## 1. 驱动与隔离

playwright-core 的 _electron.launch 启动包根，走 node:test、test/run.mjs 和 files.mjs，不新增第二 runner。

每用例独立临时 HOME/USERPROFILE/APPDATA/XDG_CONFIG_HOME 与 userData，删 ELECTRON_RUN_AS_NODE，零 provider 避免网络。测试侧只替换系统对话框，不改产品路。

先等 data-boot 为 ok/error，再要求 ok，避免把引导失败报成超时。

## 2. 断言

只读登记 DOM 契约、用户可见状态、console 和剪贴板；不按可变文案或像素断言。

设置面用例验证入口、当前段序、ready、关闭清空和固定 PNG；首启用例验证 no-project 引导、真实项目钮、no-message、输入可用性与无 provider 发送失败保稿。

对话流、账本警示、模型菜单、队列、timer、活动池等真机场景按真实 provider 可达性分别验证；不可离线构造的真回合不能以 stub 冒充通过。

## 3. 产物与失败

截图落 test/artifacts 并验证 PNG 文件，artifact 不进 git；临时家用后清理。

缺驱动、隔离不生效、断言需新私有产品缝时停止并修正测试基建，不放宽业务断言。

## 4. 验证

运行桌面单入口，报告实际执行用例和结果。未运行的真 provider、原生菜单、更新、打包与跨平台场景必须明确列为未验证。
