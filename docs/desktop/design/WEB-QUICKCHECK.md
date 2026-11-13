# Desktop Web 快筛 · 设计

> 权威验证 = `E2E-TESTING.md` 的真 Electron。
> 最近先例：Electron app:// 双根与宿主注入窄桥。对齐 = 同源 renderer、有限 stub、fail-loud。
> 勘察证据：已读 serve、host-shim、run 的启动与断言。相关 = 当前 quickcheck 工具。

## 1. 定位

quickcheck 是开发期浏览器反馈，不是验收门，不替代 E2E、真机走查或 IPC/主进程验证，也不进入集成测试树。

serve.mjs 绑定 loopback，以 / 提供 renderer、/rc/ 提供核包、/__quickcheck/ 提供工具，使用 MIME 白名单与逃逸/点段拒绝。

## 2. 宿主 shim

host-shim 在 app.mjs 前安装 window.thincoder，invoke 仅对登记通道返回定形 stub，表外 reject 并记录，不猜业务结果。

产品新增 boot 通道使 unstubbed 非空并失败，必须显式扩表。

## 3. 冒烟

run.mjs 用系统 Edge/Chrome 启动，检查 boot、六槽、引导、会话条、composer、下拉开合、CSS 与截图。

收集 pageerror、console.error 和 unstubbed，任一异常非零退出。快筛与 Electron 不一致时修工具，不改产品语义。

## 4. 验证

运行 npm run quickcheck 只证明 shim 内渲染面自洽；宿主与真链仍须 Electron 验证。
